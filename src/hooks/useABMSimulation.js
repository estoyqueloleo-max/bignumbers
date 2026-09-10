/**
 * useABMSimulation.js — Hook de React para la Simulación Basada en Agentes (ABM)
 *
 * Conecta el motor microeconómico abmEngine con el estado macroeconómico del juego.
 * Permite ejecutar la simulación de 2.500 agentes en tiempo real, inyectar choques
 * de política e inspeccionar perfiles ciudadanos individuales.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  createABMPopulation,
  stepABMSimulation,
  aggregateABMMacro
} from '../utils/abmEngine';

export function useABMSimulation(gameState, globalIsRunning = false, timeSpeed = 1, epaCalibration = null, abmCalibration = {}) {
  const [agentCount] = useState(2500);

  const epaRef = useRef(epaCalibration);
  epaRef.current = epaCalibration;
  const abmCalibRef = useRef(abmCalibration);
  abmCalibRef.current = abmCalibration;

  const [abmState, setAbmState] = useState(() =>
    createABMPopulation(agentCount, gameState || {}, abmCalibration || {}, epaCalibration)
  );
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [activeShock, setActiveShock] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [stepCount, setStepCount] = useState(1);
  const [lastStepStats, setLastStepStats] = useState(null);

  const abmRef = useRef(abmState);
  abmRef.current = abmState;

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Re-calibrar si cambia el año de datos reales o el trimestre EPA seleccionado
  const lastLoadedYearRef = useRef(gameState?.realDataYear);
  const lastEpaQuarterRef = useRef(epaCalibration?.quarter);
  useEffect(() => {
    const yearChanged = gameState?.realDataYear && gameState.realDataYear !== lastLoadedYearRef.current;
    const epaQuarter = epaCalibration?.quarter;
    const epaChanged = epaQuarter !== undefined && epaQuarter !== lastEpaQuarterRef.current;

    if (yearChanged || epaChanged) {
      lastLoadedYearRef.current = gameState?.realDataYear;
      lastEpaQuarterRef.current = epaQuarter;
      const fresh = createABMPopulation(agentCount, gameState || {}, abmCalibRef.current || {}, epaCalibration);
      setAbmState(fresh);
      setSelectedAgentId(null);
      setStepCount(1);
    }
  }, [gameState?.realDataYear, epaCalibration, agentCount, gameState]);

  // Avanzar un paso de simulación (1 mes)
  const step = useCallback((forcedShock = null) => {
    const current = abmRef.current;
    const gs = gameStateRef.current || {};
    const shockToApply = forcedShock || activeShock;

    const result = stepABMSimulation(current, {
      taxRate: gs.taxRate || 1.0,
      ministryAllocations: gs.ministryAllocations || { social: 40, health: 20, rd: 15, infra: 15, security: 10 },
      shock: shockToApply,
    });

    setAbmState({ agents: [...result.agents], firms: [...result.firms] });
    setLastStepStats(result.stats);
    setStepCount(prev => prev + 1);

    if (activeShock) {
      // Los choques duran 1 o 2 ticks y luego se disipan
      setActiveShock(null);
    }
  }, [activeShock]);

  // Bucle automático si está activo
  useEffect(() => {
    if (!isSimRunning && !globalIsRunning) return;

    const intervalMs = Math.max(300, 1000 / (timeSpeed || 1));
    const timer = setInterval(() => {
      step();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimRunning, globalIsRunning, timeSpeed, step]);

  // Inyectar un choque económico
  const injectShock = useCallback((shockType) => {
    setActiveShock(shockType);
    step(shockType);
  }, [step]);

  // Reiniciar la población
  const resetPopulation = useCallback((customEpa = null) => {
    const epa = customEpa !== null ? customEpa : epaRef.current;
    const fresh = createABMPopulation(agentCount, gameStateRef.current || {}, abmCalibRef.current || {}, epa);
    setAbmState(fresh);
    setSelectedAgentId(null);
    setActiveShock(null);
    setStepCount(1);
    setLastStepStats(null);
  }, [agentCount]);

  // Agregados macroeconómicos emergentes
  const macroStats = useMemo(() => {
    return aggregateABMMacro(abmState.agents, gameState?.population || 47000000);
  }, [abmState.agents, gameState?.population]);

  // Agente seleccionado para inspección
  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return null;
    return abmState.agents.find(a => a.id === selectedAgentId) || null;
  }, [selectedAgentId, abmState.agents]);

  // Hit-testing en canvas (buscar agente cerca de x, y)
  const findAgentAt = useCallback((clickX, clickY, radius = 12) => {
    const agents = abmRef.current.agents;
    let closest = null;
    let minDist = radius;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const dx = a.x - clickX;
      const dy = a.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closest = a;
      }
    }
    return closest;
  }, []);

  return {
    agents: abmState.agents,
    firms: abmState.firms,
    macroStats,
    isSimRunning,
    setIsSimRunning,
    step,
    injectShock,
    activeShock,
    stepCount,
    lastStepStats,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    findAgentAt,
    resetPopulation,
  };
}
