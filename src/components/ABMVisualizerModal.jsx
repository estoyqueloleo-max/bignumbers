/**
 * ABMVisualizerModal.jsx — Visualizador y Laboratorio del Micro-Mundo ABM
 *
 * Muestra 2.500 agentes individuales interactuando en un canvas 2D con físicas urbanas,
 * expediente ciudadano interactivo al hacer clic, curva de Lorenz / Gini en tiempo real
 * y laboratorio de choques de política económica.
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useABMSimulation } from '../hooks/useABMSimulation';
import { formatCurrency } from '../utils/formatters';
import {
  getDebtLabData,
  SPAIN_DATA,
  DEFAULT_YEAR,
  DEBT_TIMELINE,
  EPA_DATA,
  LATEST_EPA_QUARTER,
  getEPACalibration
} from '../utils/spainDataCatalog';
import {
  Users, Play, Pause, StepForward, RotateCcw, AlertTriangle,
  TrendingUp, TrendingDown, DollarSign, Activity, Sparkles,
  Building2, Flame, Heart, HeartHandshake, ShieldCheck, Zap, X, Search, Landmark,
  Clock, Calendar, History, CheckCircle2
} from 'lucide-react';

const COHORT_META = {
  retired:           { label: 'Jubilado / Pensionista',    color: '#ec4899', icon: '👵' },
  employed:          { label: 'Trabajador Asalariado',      color: '#38bdf8', icon: '💼' },
  unemployed:        { label: 'Desempleado (Paro)',         color: '#ef4444', icon: '📉' },
  firm_owner:        { label: 'Autónomo / Pyme',           color: '#f59e0b', icon: '🏪' },
  public_worker:     { label: 'Empleado Público (Resto)',  color: '#10b981', icon: '🏛️' },
  health_worker:     { label: 'Sanitario Público',         color: '#34d399', icon: '🏥' },
  education_worker:  { label: 'Docente Público',           color: '#67e8f9', icon: '📚' },
  defense_worker:    { label: 'Defensa / Seguridad',        color: '#818cf8', icon: '🛡️' },
  admin_worker:      { label: 'Funcionario AAPP',           color: '#a78bfa', icon: '📄' },
  justice_worker:    { label: 'Judicatura',                 color: '#c4b5fd', icon: '⚖️' },
};

export function ABMVisualizerModal({ onClose, gameState, numberingSystem }) {
  const canvasRef = useRef(null);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 500 });
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'debtlab'

  // Calibración EPA trimestral real
  const [epaQuarter, setEpaQuarter] = useState(LATEST_EPA_QUARTER);
  const epaCalibration = useMemo(() => getEPACalibration(epaQuarter), [epaQuarter]);

  // Máquina del tiempo de la deuda (1980-2024)
  const [timelineYear, setTimelineYear] = useState(2024);

  // Datos del DebtLab para el año actual de datos reales
  const debtLabYear = gameState?.realDataYear || DEFAULT_YEAR;
  const debtLab = useMemo(() => getDebtLabData(debtLabYear), [debtLabYear]);

  const {
    agents,
    firms,
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
  } = useABMSimulation(gameState, false, speedMultiplier, epaCalibration, debtLab?.abmCalibration);

  // Entrada de la serie histórica para el año de la máquina del tiempo
  const activeTimelineEntry = useMemo(() => {
    return DEBT_TIMELINE.find(d => d.year === timelineYear) || DEBT_TIMELINE[DEBT_TIMELINE.length - 1];
  }, [timelineYear]);

  // Cálculo de coordenadas geométricas para el SVG del gráfico de deuda 1980-2024
  const timelineSvg = useMemo(() => {
    if (!DEBT_TIMELINE || DEBT_TIMELINE.length === 0) return null;
    const w = 760;
    const h = 180;
    const padL = 44;
    const padR = 24;
    const padT = 20;
    const padB = 34;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const minYear = 1980;
    const maxYear = 2024;
    const maxDebt = 130; // escala 0% - 130% PIB

    const getX = (year) => padL + ((year - minYear) / (maxYear - minYear)) * plotW;
    const getY = (debtPct) => (padT + plotH) - (Math.min(maxDebt, Math.max(0, debtPct)) / maxDebt) * plotH;

    const points = DEBT_TIMELINE.map(d => ({
      x: getX(d.year),
      y: getY(d.debtPctGdp),
      ...d
    }));

    const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

    const selectedPoint = points.find(p => p.year === timelineYear) || points[points.length - 1];

    return { w, h, padL, padR, padT, padB, plotW, plotH, points, linePath, areaPath, selectedPoint, getX, getY };
  }, [timelineYear]);

  // ─── CALCULADORA "RUTA AL 30%" ────────────────────────────────────────────────
  // Palancas de ingresos
  const [leverSumergida, setLeverSumergida] = useState(0);   // puntos % aflorados (0-5)
  const [leverSociedades, setLeverSociedades] = useState(0);  // puntos % tipo efectivo subido (0-8)
  const [leverCrecimiento, setLeverCrecimiento] = useState(2); // % crecimiento PIB nominal anual (1-7)
  const [leverIed, setLeverIed] = useState(0);                // % IED adicional sobre PIB (0-3)
  const [leverAutonomos, setLeverAutonomos] = useState(0);    // % de autónomos formalizados (0-50)
  // Palancas de gasto (mezcla)
  const [leverGasto, setLeverGasto] = useState(0);           // % recorte gasto no esencial (0-15)
  const [leverEficiencia, setLeverEficiencia] = useState(0); // % eficiencia administrativa (0-10)
  // Palancas demográficas y muro de las pensiones (Baby Boom 2025-2045)
  const [leverBabyBoom, setLeverBabyBoom] = useState(3.2);       // +pp PIB gasto pensiones en pico 2040 (0-4.5)
  const [leverRetrasoJubilacion, setLeverRetrasoJubilacion] = useState(0); // años retraso edad efectiva (0-3)
  const [leverMigracion, setLeverMigracion] = useState(150);     // miles cotizantes netos/año (0-400k)
  const [leverMei, setLeverMei] = useState(0);                  // puntos % extra MEI / cotizaciones (0-6)

  // Trayectoria de deuda a 30 años (2024-2054) con impacto demográfico
  const debtTrajectory = useMemo(() => {
    // ── Parámetros base 2024 ────────────────────────────────────────────
    const BASE_DEBT_PCT   = 105.1;   // % PIB
    const BASE_PIB_BN     = 1540;    // B€ (PIB 2024 est.)
    const BASE_REVENUE_BN = 490;     // B€ ingresos tributarios
    const BASE_SPENDING_BN = 540;    // B€ gasto (incl. intereses)
    const BASE_INTEREST_BN = 33;     // B€ intereses deuda (≈2% de 1.640 B€)
    const BASE_INTEREST_RATE = 0.032; // tipo medio bono soberano largo plazo
    const YEARS = 30;

    // ── Efecto de cada palanca en ingresos adicionales anuales ───────────
    const extraRevenueBn =
      leverSumergida  * 2.0 +     // 2.000 M€ / punto % aflorado
      leverSociedades * 1.5 +     // 1.500 M€ / punto % tipo efectivo IS
      leverIed        * 1.5 +     // 1.500 M€ / punto % IED adicional
      leverAutonomos  * 0.06;     // hasta 3.000 M€ al 50% → 60 M€/punto%

    // ── Efecto de las palancas de gasto ──────────────────────────────────
    const savingsBn =
      leverGasto      * (BASE_SPENDING_BN - BASE_INTEREST_BN) * 0.01 + // % del gasto no-intereses
      leverEficiencia * (BASE_SPENDING_BN - BASE_INTEREST_BN) * 0.01;

    // ── Ingresos demográficos y reformas de pensiones ────────────────────
    const migrationRevenueBn = (leverMigracion / 100) * 1.8; // 100k cotizantes = 1.8 B€/año SS
    const meiRevenueBn = leverMei * 1.2;                    // 1 pp MEI = 1.2 B€/año SS
    const extraDemographicRevBn = migrationRevenueBn + meiRevenueBn;

    // ── Crecimiento nominal del PIB + aporte migratorio a fuerza laboral ─
    const migrationGrowth = (leverMigracion / 100) * 0.0015; // +100k = +0.15% crecimiento PIB
    const gNominal = (leverCrecimiento / 100) + migrationGrowth;

    // ── Calcular año a año ───────────────────────────────────────────────
    const trajectory  = [];
    const trajectoryBase = [];  // sin palancas (inmovilismo con presión demográfica base)
    const trajectoryIdeal = []; // con reformas pero SIN envejecimiento (ideal)

    let debtBn         = BASE_PIB_BN * (BASE_DEBT_PCT / 100);
    let pib            = BASE_PIB_BN;
    let revenue        = BASE_REVENUE_BN;

    let debtBnBase     = debtBn;
    let pibBase        = BASE_PIB_BN;

    let debtBnIdeal    = debtBn;
    let pibIdeal       = BASE_PIB_BN;
    let revenueIdeal   = BASE_REVENUE_BN;

    let cumulativePensionCost = 0;
    let peakYearPensionBn = 0;

    for (let y = 0; y <= YEARS; y++) {
      const year = 2024 + y;
      const debtPct = (debtBn / pib) * 100;
      const debtPctBase = (debtBnBase / pibBase) * 100;
      const debtPctIdeal = (debtBnIdeal / pibIdeal) * 100;

      trajectory.push({ year, debtPct: Math.max(0, debtPct), debtBn: Math.round(debtBn) });
      trajectoryBase.push({ year, debtPct: Math.max(0, debtPctBase) });
      trajectoryIdeal.push({ year, debtPct: Math.max(0, debtPctIdeal) });

      // ── DINÁMICA DEMOGRÁFICA (BABY BOOM) ─────────────────────────────
      // La ola de jubilaciones escala entre 2024 y 2040 (y = 16)
      const progress = Math.min(1, y / 16);
      const grossPensionPressurePct = progress * leverBabyBoom;
      const pensionSavingsPct = leverRetrasoJubilacion * 0.45; // cada año de retraso ahorra ~0.45 pp PIB
      const netPensionPressurePct = Math.max(0, grossPensionPressurePct - pensionSavingsPct);
      const pensionCostBn = (netPensionPressurePct / 100) * pib;

      if (y === 16) {
        peakYearPensionBn = pensionCostBn;
      }
      cumulativePensionCost += pensionCostBn;

      // ── Escenario con palancas activas y demografía ───────────────────
      const interestCost = debtBn * BASE_INTEREST_RATE;
      const totalRevenue = revenue + extraRevenueBn + extraDemographicRevBn;
      const totalSpending = (BASE_SPENDING_BN - savingsBn) + pensionCostBn;
      const deficit = totalSpending - totalRevenue;

      debtBn = Math.max(0, debtBn + deficit);
      pib = pib * (1 + gNominal);
      revenue = revenue * (1 + gNominal * 0.85);

      // ── Escenario Ideal (reformas activas pero SIN impacto del Baby Boom)
      const totalRevenueIdeal = revenueIdeal + extraRevenueBn + extraDemographicRevBn;
      const totalSpendingIdeal = (BASE_SPENDING_BN - savingsBn);
      const deficitIdeal = totalSpendingIdeal - totalRevenueIdeal;

      debtBnIdeal = Math.max(0, debtBnIdeal + deficitIdeal);
      pibIdeal = pibIdeal * (1 + gNominal);
      revenueIdeal = revenueIdeal * (1 + gNominal * 0.85);

      // ── Escenario base inmovilismo (con demografía base de AIReF) ───────
      const basePensionCostBn = (grossPensionPressurePct / 100) * pibBase;
      const baseDeficit = (BASE_SPENDING_BN + basePensionCostBn) - BASE_REVENUE_BN;
      debtBnBase = Math.max(0, debtBnBase + baseDeficit);
      pibBase = pibBase * 1.02;
    }

    // ── Años hasta alcanzar umbrales ─────────────────────────────────────
    const find60 = trajectory.find(p => p.debtPct <= 60);
    const find30 = trajectory.find(p => p.debtPct <= 30);
    const base60 = trajectoryBase.find(p => p.debtPct <= 60);
    const ideal30 = trajectoryIdeal.find(p => p.debtPct <= 30);

    // Intereses totales pagados acumulados (simplificado)
    const totalInterestPaid = Math.round(trajectory.reduce((acc, p, i) => {
      if (i === 0) return acc;
      return acc + p.debtBn * BASE_INTEREST_RATE;
    }, 0));

    const demographicAbsorbed = (extraRevenueBn + savingsBn + extraDemographicRevBn) >= peakYearPensionBn;

    return {
      trajectory, trajectoryBase, trajectoryIdeal,
      find60, find30, base60, ideal30,
      totalInterestPaid, extraRevenueBn, savingsBn,
      extraDemographicRevBn, cumulativePensionCost, peakYearPensionBn, demographicAbsorbed
    };
  }, [
    leverSumergida, leverSociedades, leverCrecimiento, leverIed, leverAutonomos,
    leverGasto, leverEficiencia,
    leverBabyBoom, leverRetrasoJubilacion, leverMigracion, leverMei
  ]);

  // SVG de trayectoria (línea proyectada 2024-2054)
  const trajectorySvg = useMemo(() => {
    const { trajectory, trajectoryBase, trajectoryIdeal } = debtTrajectory;
    const w = 680; const h = 180;
    const padL = 40; const padR = 16; const padT = 16; const padB = 30;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const minYear = 2024; const maxYear = 2054;
    const maxD = 130;
    const getX = yr => padL + ((yr - minYear) / (maxYear - minYear)) * plotW;
    const getY = d  => (padT + plotH) - (Math.min(maxD, Math.max(0, d)) / maxD) * plotH;

    const toPath = (pts) => pts.reduce((acc, p, i) =>
      `${acc} ${i === 0 ? 'M' : 'L'} ${getX(p.year).toFixed(1)} ${getY(p.debtPct).toFixed(1)}`, '');

    const lineActive = toPath(trajectory);
    const lineBase   = toPath(trajectoryBase);
    const lineIdeal  = toPath(trajectoryIdeal);
    const areaPath   = `${lineActive} L ${getX(2054).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${getX(2024).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

    return { w, h, padL, padR, padT, padB, plotW, plotH, getX, getY, lineActive, lineBase, lineIdeal, areaPath };
  }, [debtTrajectory]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. FONDO URBANO Y DISTRITOS
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cuadrantes de distritos con rejillas sutiles
      const midX = canvas.width / 2;
      const midY = canvas.height / 2;

      // Líneas divisorias de distritos
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(midX, 0); ctx.lineTo(midX, canvas.height);
      ctx.moveTo(0, midY); ctx.lineTo(canvas.width, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Etiquetas de distritos
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillText('🏡 DISTRITO RESIDENCIAL & PENSIONISTAS', 25, 25);
      ctx.fillText('🏭 POLÍGONO INDUSTRIAL & COMERCIOS', midX + 25, 25);
      ctx.fillText('🏢 BARRIO OBRERO & SERVICIOS', 25, midY + 25);
      ctx.fillText('🏛️ PLAZA MAYOR & CENTRO CÍVICO (PROTESTAS)', midX + 25, midY + 25);

      // Zona central de la Plaza de Protestas (Círculo cívico)
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(midX, midY, 60, 0, Math.PI * 2);
      ctx.stroke();

      // 2. DIBUJAR LOS 2.500 AGENTES
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i];
        const isSelected = a.id === selectedAgentId;
        const isHovered = hoveredAgent && a.id === hoveredAgent.id;

        // Color por cohorte o por protesta
        let color = COHORT_META[a.cohort]?.color || '#94a3b8';
        let radius = 2.2;

        if (a.isProtesting) {
          color = '#f97316'; // Naranja brillante de huelga
          radius = 3.2;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(a.x, a.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Si está seleccionado o hovered, dibujar anillo luminoso
        if (isSelected || isHovered) {
          ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)';
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.beginPath();
          ctx.arc(a.x, a.y, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [agents, selectedAgentId, hoveredAgent]);

  // Manejo de clic en el canvas para seleccionar agente
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const hit = findAgentAt(clickX, clickY, 15);
    if (hit) {
      setSelectedAgentId(hit.id);
    } else {
      setSelectedAgentId(null);
    }
  };

  // Manejo de hover en el canvas
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const hit = findAgentAt(mouseX, mouseY, 12);
    setHoveredAgent(hit);
  };

  // Frase u opinión del ciudadano seleccionado según su estado
  const citizenQuote = useMemo(() => {
    if (!selectedAgent) return '';
    const { cohort, isProtesting, satisfaction, income, savings, age } = selectedAgent;
    if (isProtesting) {
      return `¡Basta de recortes y subidas de impuestos! Nos estamos manifestando en la Plaza Mayor para defender nuestro poder adquisitivo.`;
    }
    if (cohort === 'retired') {
      if (satisfaction > 70) return `Cobro mi pensión puntual de ${income}€/mes. Con la edad que tengo (${age} años), agradezco la cobertura sanitaria pública.`;
      return `La inflación y los recortes me ahogan; con ${income}€ apenas puedo costear los medicamentos y la cesta básica.`;
    }
    if (cohort === 'unemployed') {
      return `Llevo meses buscando trabajo en mi sector. El subsidio de ${income}€ se agota y los ahorros bajan rápido (${savings}€).`;
    }
    if (cohort === 'firm_owner') {
      return `Como autónomo, intento mantener mi negocio a flote. Si los clientes no consumen o los impuestos suben, tendré que recortar personal.`;
    }
    if (cohort === 'employed') {
      return `Trabajo jornada completa por ${income}€ al mes. Tras IRPF y gastos fijos, consigo ahorrar algo para el futuro.`;
    }
    return `Como empleado público, mi vocación es garantizar los servicios esenciales del Estado para toda la ciudadanía.`;
  }, [selectedAgent]);

  return (
    <div className="modal-overlay" style={{ zIndex: 10000, background: 'rgba(2, 6, 12, 0.88)', backdropFilter: 'blur(10px)' }}>
      <div
        className="glass-panel abm-visualizer-modal"
        style={{
          maxWidth: '1280px',
          width: '96vw',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
        }}
      >
        {/* CABECERA */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center'
              }}>
                <Users size={20} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Micro-Mundo ABM: Simulación Basada en Agentes
                  <span className="badge text-xs" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: '#38bdf8' }}>
                    {agents.length.toLocaleString('es-ES')} Agentes en Paralelo
                  </span>
                  {activeShock && (
                    <span className="badge text-xs animate-pulse" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: '#ef4444' }}>
                      ⚡ Choque Activo: {activeShock.toUpperCase()}
                    </span>
                  )}
                </h3>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                  Cada punto es un ciudadano con ingresos, ahorros y decisiones propias. La macroeconomía de España emerge de abajo hacia arriba.
                </p>
              </div>
            </div>
          </div>

          {/* CONTROLES DE EJECUCIÓN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              id="abm-play-btn"
              className={`btn btn-sm ${isSimRunning ? 'btn-danger' : 'btn-success'} d-flex align-center gap-1`}
              onClick={() => setIsSimRunning(!isSimRunning)}
              title={isSimRunning ? 'Pausar Simulación ABM' : 'Reanudar Simulación ABM'}
            >
              {isSimRunning ? <Pause size={15} /> : <Play size={15} />}
              <span>{isSimRunning ? 'Pausar' : 'Simular'}</span>
            </button>

            <button
              id="abm-step-btn"
              className="btn btn-sm btn-outline d-flex align-center gap-1"
              onClick={() => step()}
              disabled={isSimRunning}
              title="Avanzar 1 Mes"
            >
              <StepForward size={15} />
              <span>+1 Mes</span>
            </button>

            <button
              id="abm-reset-btn"
              className="btn btn-sm btn-outline d-flex align-center gap-1"
              onClick={resetPopulation}
              title="Regenerar Agentes"
            >
              <RotateCcw size={15} />
              <span>Reiniciar</span>
            </button>

            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '24px', margin: '0 4px' }} />

            <button
              className="btn btn-sm btn-outline"
              onClick={onClose}
              style={{ padding: '6px' }}
              title="Cerrar Visualizador"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* TABS DE NAVEGACIÓN */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.2)',
          padding: '0 24px',
          gap: '4px',
        }}>
          {[
            { id: 'canvas', label: '🏙️ Micro-Mundo', title: 'Visualización de agentes en tiempo real' },
            { id: 'debtlab', label: '🏦 Laboratorio de Deuda', title: 'Análisis macro: sueldos y deuda pública' },
          ].map(tab => (
            <button
              key={tab.id}
              id={`abm-tab-${tab.id}`}
              title={tab.title}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(56,189,248,0.12)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #38bdf8' : '2px solid transparent',
                color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                padding: '8px 16px',
                fontSize: '0.78rem',
                fontWeight: activeTab === tab.id ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'canvas' && macroStats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '8px',
            padding: '10px 24px',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Desempleo Emergente</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: macroStats.emergentUnemploymentRate > 18 ? '#ef4444' : '#f59e0b' }}>
                {macroStats.emergentUnemploymentRate.toFixed(1)}%
              </span>
              <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
                {macroStats.counts.unemployed} agentes parados
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Paz Social / Huelga</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: macroStats.emergentSocialPeace > 70 ? '#10b981' : '#f97316' }}>
                {macroStats.emergentSocialPeace}% ({macroStats.protestRate}% huelga)
              </span>
              <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
                {Math.round(macroStats.protestRate * 25)} manifestantes
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Coeficiente de Gini (Riqueza)</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                {macroStats.wealthGini.toFixed(3)}
              </span>
              <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
                España real: ~0.330
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Recaudación Emergente</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>
                {formatCurrency(macroStats.projectedMonthlyRevenue, numberingSystem)}/m
              </span>
              <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
                Suma directa IRPF + IVA + Sociedades
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>PIB Mensual Emergente</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#a78bfa' }}>
                {formatCurrency(macroStats.projectedMonthlyGDP, numberingSystem)}/m
              </span>
              <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
                Consumo real + Inversión pyme
              </span>
            </div>
          </div>
        )}

        {/* CUERPO PRINCIPAL: depende del tab activo */}
        {activeTab === 'canvas' ? (
          <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(450px, 1.4fr) minmax(320px, 1fr)',
          flex: 1,
          overflow: 'hidden',
        }}>
          {/* COLUMNA IZQUIERDA: CANVAS ESPACIAL */}
          <div style={{
            position: 'relative',
            background: '#060d17',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 12, left: 16, zIndex: 10,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>LEYENDA:</span>
              <span style={{ fontSize: '0.68rem', color: '#ec4899' }}>● Pensionistas (22%)</span>
              <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>● Asalariados (45%)</span>
              <span style={{ fontSize: '0.68rem', color: '#ef4444' }}>● Parados (14%)</span>
              <span style={{ fontSize: '0.68rem', color: '#f59e0b' }}>● Pymes (12%)</span>
              <span style={{ fontSize: '0.68rem', color: '#10b981' }}>● Públicos (8%)</span>
              <span style={{ fontSize: '0.68rem', color: '#f97316' }}>● En Huelga</span>
            </div>

            <canvas
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                cursor: 'crosshair',
                display: 'block',
              }}
            />

            {/* Aviso inferior de interacción */}
            <div style={{
              padding: '8px 16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.4)',
              color: '#64748b',
              fontSize: '0.68rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>👆 Haz clic en cualquier ciudadano del mapa para abrir su expediente personal en directo.</span>
              <span>Mes de Simulación: #{stepCount}</span>
            </div>
          </div>

          {/* COLUMNA DERECHA: INSPECTOR CIUDADANO & LABORATORIO */}
          <div style={{
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'rgba(10, 16, 26, 0.95)',
          }}>
            {/* 0. CALIBRACIÓN DEMOGRÁFICA REAL (INE EPA) */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.04)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              padding: '14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📊</span> Calibración Demográfica Real (INE EPA)
                </h4>
                <span className="badge text-xs" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderColor: '#10b981' }}>
                  {epaQuarter}
                </span>
              </div>

              <p style={{ margin: '0 0 10px', fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Estructura la micro-población de 2.500 agentes con las tasas reales de la Encuesta de Población Activa (paro, sueldos y sectores).
              </p>

              {/* SELECTOR DE TRIMESTRE EPA */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <select
                  id="epa-quarter-select"
                  value={epaQuarter}
                  onChange={e => setEpaQuarter(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.75rem',
                    padding: '6px 8px',
                    cursor: 'pointer',
                  }}
                >
                  {EPA_DATA.map(d => (
                    <option key={d.quarter} value={d.quarter} style={{ background: '#0f172a', color: '#f8fafc' }}>
                      {d.label} — Paro: {d.unemploymentRate}%
                    </option>
                  ))}
                </select>

                <button
                  id="epa-recalibrate-btn"
                  onClick={() => resetPopulation(epaCalibration)}
                  title="Regenerar la población de agentes con este trimestre EPA"
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    color: '#34d399',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  ↺ Recalibrar
                </button>
              </div>

              {/* PILARES EPA DEL TRIMESTRE ACTIVO */}
              {epaCalibration && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Paro EPA</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ef4444' }}>
                        {epaCalibration.unemploymentRate}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Asalariados</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>
                        {epaCalibration.employedPct}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Públicos</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#a78bfa' }}>
                        {epaCalibration.publicWorkerPct}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Sueldo Med.</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399' }}>
                        {epaCalibration.medianWage}€
                      </div>
                    </div>
                  </div>

                  {/* Detalles complementarios: Brecha de género y sectores */}
                  <div style={{
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    fontSize: '0.62rem',
                    color: '#cbd5e1',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span>Brecha género: <strong style={{ color: '#f59e0b' }}>{epaCalibration.genderWageGap}%</strong></span>
                    <span>Jubilados: <strong style={{ color: '#ec4899' }}>{epaCalibration.retiredPct}%</strong></span>
                    <span>Autónomos: <strong style={{ color: '#f59e0b' }}>{epaCalibration.firmOwnerPct}%</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* 1. EXPEDIENTE CIUDADANO */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: selectedAgent ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px',
              boxShadow: selectedAgent ? '0 0 20px rgba(56, 189, 248, 0.15)' : 'none',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={14} color="#38bdf8" />
                  {selectedAgent ? 'Expediente Ciudadano en Tiempo Real' : 'Selecciona un Ciudadano en el Mapa'}
                </h4>
                {selectedAgent && (
                  <span className="badge text-xs" style={{ background: `${COHORT_META[selectedAgent.cohort]?.color}22`, color: COHORT_META[selectedAgent.cohort]?.color, borderColor: COHORT_META[selectedAgent.cohort]?.color }}>
                    {COHORT_META[selectedAgent.cohort]?.label}
                  </span>
                )}
              </div>

              {selectedAgent ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      fontSize: '1.8rem',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '50%', width: '46px', height: '46px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {COHORT_META[selectedAgent.cohort]?.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                        {selectedAgent.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {selectedAgent.age} años · {selectedAgent.district}
                      </div>
                    </div>
                  </div>

                  {/* Cita del ciudadano */}
                  <div style={{
                    background: 'rgba(0,0,0,0.35)',
                    borderLeft: `3px solid ${selectedAgent.isProtesting ? '#f97316' : '#38bdf8'}`,
                    padding: '8px 10px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    color: '#cbd5e1',
                    fontStyle: 'italic',
                    marginBottom: '10px',
                    lineHeight: 1.4,
                  }}>
                    "{citizenQuote}"
                  </div>

                  {/* Métricas individuales */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Ingreso Mensual</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>
                        {selectedAgent.income.toLocaleString('es-ES')} €/m
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Ahorros Acumulados</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
                        {selectedAgent.savings.toLocaleString('es-ES')} €
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Impuestos IRPF pagados</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fb923c' }}>
                        {selectedAgent.taxPaid.toLocaleString('es-ES')} €/m
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Estado de Protesta</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: selectedAgent.isProtesting ? '#f97316' : '#10b981' }}>
                        {selectedAgent.isProtesting ? '🔥 EN HUELGA' : '✅ Conforme'}
                      </div>
                    </div>
                  </div>

                  {/* Barra de satisfacción */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '3px' }}>
                      <span style={{ color: '#94a3b8' }}>Nivel de Satisfacción / Bienestar:</span>
                      <span style={{ fontWeight: 700, color: selectedAgent.satisfaction > 50 ? '#10b981' : '#ef4444' }}>
                        {selectedAgent.satisfaction}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${selectedAgent.satisfaction}%`,
                        height: '100%',
                        background: selectedAgent.satisfaction > 50 ? '#10b981' : '#ef4444',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px 0', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                  Haz clic en cualquier punto del mapa para ver los datos bancarios, profesión y nivel de bienestar de ese habitante.
                </div>
              )}
            </div>

            {/* 2. LABORATORIO DE CHOQUES DE POLÍTICA ECONÓMICA */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px',
            }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#f59e0b" />
                Laboratorio de Choques Microeconómicos
              </h4>
              <p style={{ margin: '0 0 10px', fontSize: '0.7rem', color: '#94a3b8' }}>
                Inyecta decisiones en el micro-mundo y observa las ondas de choque en el consumo, los despidos y las manifestaciones:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => injectShock('austerity')}
                  style={{ borderColor: '#ef4444', color: '#ef4444', textAlign: 'left', padding: '8px' }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.72rem' }}>💥 Plan de Austeridad</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>Recorta pensiones un 25%. Dispara protestas.</div>
                </button>

                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => injectShock('stimulus')}
                  style={{ borderColor: '#34d399', color: '#34d399', textAlign: 'left', padding: '8px' }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.72rem' }}>💰 Cheque Estímulo</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>Impulsa el consumo. Fomenta contrataciones.</div>
                </button>

                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => injectShock('lockdown')}
                  style={{ borderColor: '#f59e0b', color: '#f59e0b', textAlign: 'left', padding: '8px' }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.72rem' }}>😷 Confinamiento</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>Hunde las ventas en pymes. Ola de despidos.</div>
                </button>

                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => injectShock('extreme_austerity')}
                  style={{ borderColor: '#dc2626', color: '#dc2626', textAlign: 'left', padding: '8px', gridColumn: '1 / -1' }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.72rem' }}>☢️ Austeridad Extrema ("¿Puedo pagar la deuda en 1 año?")</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>Congela el 80% del gasto. Sólo se pagan intereses. Ve el colapso económico emergente.</div>
                </button>

                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => injectShock(null)}
                  style={{ borderColor: '#38bdf8', color: '#38bdf8', textAlign: 'left', padding: '8px' }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.72rem' }}>⚖️ Normalizar</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>Disipa choques temporales.</div>
                </button>
              </div>
            </div>

            {/* 3. DESGLOSE DE COHORTES Y EMPRESAS */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px',
            }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={14} color="#a78bfa" />
                Ecosistema de Pymes ({firms.length} Empresas Simuladas)
              </h4>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Las {firms.length} pymes reciben los ingresos del consumo de los agentes. Si entran en pérdidas consecutivas, despiden trabajadores; si tienen beneficios altos, contratan del pool de desempleados.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== DEBT LAB TAB ==================== */
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'rgba(5, 10, 20, 0.9)' }}>
            {debtLab ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* CABECERA DEL LAB */}
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc' }}>
                    🏦 Laboratorio de Deuda Pública — España {debtLab.year}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                    Fuente: IGAE / Contabilidad Nacional AAPP + Eurostat gov_10a_exp
                  </p>
                </div>

                {/* RESUMEN DE DEUDA EN CONTEXTO */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'
                }}>
                  {[
                    {
                      label: 'Deuda Pública Total',
                      value: (debtLab.debt / 1e12).toFixed(2) + ' Bill. €',
                      sub: `${debtLab.debtToGdpPct}% del PIB`,
                      color: '#ef4444',
                      icon: '📉'
                    },
                    {
                      label: 'Recaudación Anual',
                      value: (debtLab.revenue / 1e9).toFixed(0) + ' B€',
                      sub: `× ${debtLab.debtInYearsOfRevenue} años de ingresos`,
                      color: '#34d399',
                      icon: '🏛️'
                    },
                    {
                      label: 'Intereses Anuales',
                      value: (debtLab.interest / 1e9).toFixed(0) + ' B€',
                      sub: `${((debtLab.interest / debtLab.spending) * 100).toFixed(1)}% del gasto`,
                      color: '#f59e0b',
                      icon: '📅'
                    },
                  ].map((card, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${card.color}44`,
                      borderRadius: '10px',
                      padding: '12px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.4rem' }}>{card.icon}</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '4px' }}>{card.label}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: card.color }}>{card.value}</div>
                      <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '2px' }}>{card.sub}</div>
                    </div>
                  ))}
                </div>

                {/* RANKING DE PARTIDAS */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9' }}>
                    📊 ¿En qué se gasta el Estado? Ranking de Partidas ({debtLab.year})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {debtLab.partidas.map((p, i) => {
                      const maxVal = debtLab.partidas[0].value;
                      const pct = ((p.value / maxVal) * 100).toFixed(0);
                      const pctOfSpending = ((p.value / debtLab.spending) * 100).toFixed(1);
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '3px' }}>
                            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                              {p.icon} {p.label}
                            </span>
                            <span style={{ color: p.color, fontWeight: 700 }}>
                              {(p.value / 1e9).toFixed(0)} B€
                              <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '4px' }}>({pctOfSpending}%)</span>
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: `linear-gradient(90deg, ${p.color}88, ${p.color})`,
                              borderRadius: '4px',
                              transition: 'width 0.5s ease',
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DESGLOSE DE SUELDOS DE FUNCIONARIOS */}
                {debtLab.wagesByFunction && (
                  <div style={{
                    background: 'rgba(167, 139, 250, 0.04)',
                    border: '1px solid rgba(167, 139, 250, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9' }}>
                      👔 Sueldos de Funcionarios — {debtLab.year}
                    </h4>
                    <p style={{ margin: '0 0 12px', fontSize: '0.68rem', color: '#94a3b8' }}>
                      Masa salarial total: <strong style={{ color: '#a78bfa' }}>{(debtLab.wages / 1e9).toFixed(0)} B€/año</strong>
                      &nbsp;· {debtLab.totalWorkers?.toLocaleString('es-ES')} empleados públicos
                      &nbsp;· Sueldo medio bruto: <strong style={{ color: '#a78bfa' }}>{debtLab.avgMonthlyWage?.toLocaleString('es-ES')}€/mes</strong>
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {Object.entries(debtLab.wagesByFunction).map(([key, data]) => {
                        const labels = {
                          health: '🏥 Sanidad Pública',
                          education: '📚 Educación',
                          defense: '🛡️ Defensa/Seguridad',
                          admin: '📄 Admin. General',
                          justice: '⚖️ Justicia',
                          other: '🏛️ Resto AAPP',
                        };
                        return (
                          <div key={key} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(167,139,250,0.15)',
                            borderRadius: '8px',
                            padding: '10px',
                          }}>
                            <div style={{ fontSize: '0.7rem', color: '#e2e8f0', fontWeight: 700, marginBottom: '4px' }}>
                              {labels[key] || key}
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#a78bfa' }}>
                              {(data.value / 1e9).toFixed(1)} B€
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '2px' }}>
                              {data.workers?.toLocaleString('es-ES')} empleados
                              &nbsp;· {data.avgMonthly?.toLocaleString('es-ES')}€ bruto/mes
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CALCULADORA: ¿CUÁNTO SE TARDA EN PAGAR LA DEUDA? */}
                <div style={{
                  background: 'rgba(239, 68, 68, 0.04)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9' }}>
                    🧮 ¿Puede España pagar su deuda en 1 año?
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    <div style={{
                      background: 'rgba(239,68,68,0.08)', borderRadius: '8px', padding: '12px',
                      border: '1px solid rgba(239,68,68,0.2)'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Escenario Real: ¿con el superavit/déficit actual?
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: debtLab.debtPayoffYears ? '#34d399' : '#ef4444' }}>
                        {debtLab.debtPayoffYears
                          ? `✅ ${debtLab.debtPayoffYears} años (si hubiera superávit continuo)`
                          : '❌ IMPOSIBLE — Hay déficit. La deuda crece cada año.'}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '4px' }}>
                        {debtLab.debtPayoffYears
                          ? `Con un superávit anual de ${((debtLab.revenue - debtLab.spending) / 1e9).toFixed(0)} B€`
                          : `Déficit anual: ${((debtLab.revenue - debtLab.spending) / 1e9).toFixed(0)} B€. Sin recortar, la deuda sigue creciendo.`
                        }
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(245,158,11,0.08)', borderRadius: '8px', padding: '12px',
                      border: '1px solid rgba(245,158,11,0.2)'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Hipotético: Congelar TODO el gasto excepto intereses
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f59e0b' }}>
                        {debtLab.hypotheticalPayoffYears
                          ? `⏱ ${debtLab.hypotheticalPayoffYears} años para liquidar la deuda`
                          : 'Sin datos suficientes'}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '4px' }}>
                        Si se suspendieran pensiones, sueldos públicos, sanidad y educación — sólo se pagan los intereses ({(debtLab.interest / 1e9).toFixed(0)} B€/año). El resto ({((debtLab.revenue - debtLab.interest) / 1e9).toFixed(0)} B€) se destina a capital. Pero el colapso económico reduciría la recaudación → espiral deflacionaria.
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(239,68,68,0.12)', borderRadius: '8px', padding: '12px',
                      border: '1px solid rgba(220,38,38,0.3)',
                      display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', color: '#fca5a5', fontWeight: 700, marginBottom: '4px' }}>
                          ☢️ Simular "Austeridad Extrema" en el Micro-Mundo
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                          Activa el choque en los {agents.length.toLocaleString('es-ES')} agentes y observa cómo emerge el colapso: 
                          desempleo ↑, consumo ↓, protestas masivas, espiral recesiva.
                        </div>
                      </div>
                      <button
                        id="abm-extreme-austerity-btn"
                        className="btn btn-sm"
                        onClick={() => { injectShock('extreme_austerity'); setActiveTab('canvas'); }}
                        style={{ background: '#dc2626', color: '#fff', border: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        ⚡ Aplicar Choque
                      </button>
                    </div>

                  </div>
                </div>

                {/* MÁQUINA DEL TIEMPO DE LA DEUDA (1980–2024) */}
                <div style={{
                  background: 'rgba(56, 189, 248, 0.03)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⏰</span> Máquina del Tiempo de la Deuda Española (1980–2024)
                      </h4>
                      <p style={{ margin: '3px 0 0', fontSize: '0.68rem', color: '#94a3b8' }}>
                        45 años de historia fiscal: desde el 17.8% del PIB en 1980 hasta el 105.1% actual.
                        Fuentes: Banco de España & Eurostat PDE.
                      </p>
                    </div>
                    <span className="badge text-xs" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                      {timelineYear} ({activeTimelineEntry?.govt || '—'})
                    </span>
                  </div>

                  {/* GRÁFICO SVG INTERACTIVO */}
                  {timelineSvg && (
                    <div style={{
                      position: 'relative',
                      background: 'rgba(5, 12, 22, 0.8)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '8px 4px 4px',
                      overflow: 'hidden'
                    }}>
                      <svg
                        viewBox={`0 0 ${timelineSvg.w} ${timelineSvg.h}`}
                        style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
                      >
                        <defs>
                          <linearGradient id="debtAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>

                        {/* Rejilla horizontal y etiquetas Y */}
                        {[0, 25, 50, 75, 100, 125].map(tick => {
                          const y = timelineSvg.getY(tick);
                          return (
                            <g key={tick}>
                              <line
                                x1={timelineSvg.padL}
                                y1={y}
                                x2={timelineSvg.padL + timelineSvg.plotW}
                                y2={y}
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth={1}
                              />
                              <text
                                x={timelineSvg.padL - 6}
                                y={y + 3}
                                fontSize="9"
                                fill="#64748b"
                                textAnchor="end"
                                fontFamily="monospace"
                              >
                                {tick}%
                              </text>
                            </g>
                          );
                        })}

                        {/* Línea Maastricht 60% */}
                        {(() => {
                          const y60 = timelineSvg.getY(60);
                          return (
                            <g>
                              <line
                                x1={timelineSvg.padL}
                                y1={y60}
                                x2={timelineSvg.padL + timelineSvg.plotW}
                                y2={y60}
                                stroke="#eab308"
                                strokeDasharray="4 3"
                                strokeWidth="1.2"
                              />
                              <text
                                x={timelineSvg.padL + timelineSvg.plotW - 6}
                                y={y60 - 4}
                                fontSize="8.5"
                                fill="#eab308"
                                textAnchor="end"
                                fontWeight="700"
                              >
                                Límite Maastricht (60%)
                              </text>
                            </g>
                          );
                        })()}

                        {/* Área rellena */}
                        <path d={timelineSvg.areaPath} fill="url(#debtAreaGrad)" />

                        {/* Línea de deuda principal */}
                        <path d={timelineSvg.linePath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Marcas de años en el eje X */}
                        {[1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024].map(yr => {
                          const x = timelineSvg.getX(yr);
                          return (
                            <g key={yr}>
                              <line
                                x1={x}
                                y1={timelineSvg.padT + timelineSvg.plotH}
                                x2={x}
                                y2={timelineSvg.padT + timelineSvg.plotH + 5}
                                stroke="rgba(255,255,255,0.2)"
                              />
                              <text
                                x={x}
                                y={timelineSvg.padT + timelineSvg.plotH + 16}
                                fontSize="9"
                                fill="#94a3b8"
                                textAnchor="middle"
                                fontFamily="monospace"
                              >
                                {yr}
                              </text>
                            </g>
                          );
                        })}

                        {/* Puntos de hitos históricos (clickable) */}
                        {timelineSvg.points.filter(p => p.event).map(p => (
                          <circle
                            key={p.year}
                            cx={p.x}
                            cy={p.y}
                            r={p.year === timelineYear ? 5 : 3.5}
                            fill={p.year === timelineYear ? '#38bdf8' : '#f59e0b'}
                            stroke="#fff"
                            strokeWidth={p.year === timelineYear ? 2 : 1}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => setTimelineYear(p.year)}
                          >
                            <title>{`${p.year}: ${p.event} (${p.debtPctGdp}% PIB)`}</title>
                          </circle>
                        ))}

                        {/* Cursor / Línea vertical de año activo */}
                        {timelineSvg.selectedPoint && (
                          <g>
                            <line
                              x1={timelineSvg.selectedPoint.x}
                              y1={timelineSvg.padT}
                              x2={timelineSvg.selectedPoint.x}
                              y2={timelineSvg.padT + timelineSvg.plotH}
                              stroke="#38bdf8"
                              strokeWidth="2"
                              strokeDasharray="4 2"
                            />
                            {/* Círculo pulsante en el punto seleccionado */}
                            <circle
                              cx={timelineSvg.selectedPoint.x}
                              cy={timelineSvg.selectedPoint.y}
                              r="7"
                              fill="rgba(56, 189, 248, 0.4)"
                            />
                            <circle
                              cx={timelineSvg.selectedPoint.x}
                              cy={timelineSvg.selectedPoint.y}
                              r="4"
                              fill="#38bdf8"
                              stroke="#fff"
                              strokeWidth="2"
                            />
                          </g>
                        )}
                      </svg>
                    </div>
                  )}

                  {/* CONTROL SLIDER DE AÑO */}
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                        Desliza para viajar en el tiempo:
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 800, fontFamily: 'monospace' }}>
                        {timelineYear}
                      </span>
                    </div>
                    <input
                      id="debt-timeline-slider"
                      type="range"
                      min={1980}
                      max={2024}
                      value={timelineYear}
                      onChange={e => setTimelineYear(Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: '#38bdf8',
                        cursor: 'pointer',
                      }}
                    />
                  </div>

                  {/* BOTONES DE SALTO RÁPIDO A HITOS */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {[
                      { yr: 1982, label: '1982: PSOE' },
                      { yr: 1986, label: '1986: CEE' },
                      { yr: 1992, label: '1992: JJ.OO.' },
                      { yr: 1999, label: '1999: Euro' },
                      { yr: 2007, label: '2007: Mín. Boom (35.6%)' },
                      { yr: 2012, label: '2012: Rescate (86.3%)' },
                      { yr: 2020, label: '2020: COVID (120.3%)' },
                      { yr: 2024, label: '2024: Hoy (105.1%)' },
                    ].map(m => (
                      <button
                        key={m.yr}
                        onClick={() => setTimelineYear(m.yr)}
                        style={{
                          background: timelineYear === m.yr ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.04)',
                          color: timelineYear === m.yr ? '#38bdf8' : '#94a3b8',
                          border: timelineYear === m.yr ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* TARJETA DE DETALLE DEL AÑO SELECCIONADO */}
                  {activeTimelineEntry && (
                    <div style={{
                      marginTop: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                          📅 Año {activeTimelineEntry.year} · Gobierno: <span style={{ color: '#38bdf8' }}>{activeTimelineEntry.govt}</span>
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: activeTimelineEntry.debtPctGdp > 100 ? 'rgba(239, 68, 68, 0.2)' : activeTimelineEntry.debtPctGdp > 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                          color: activeTimelineEntry.debtPctGdp > 100 ? '#ef4444' : activeTimelineEntry.debtPctGdp > 60 ? '#f59e0b' : '#34d399',
                          border: `1px solid ${activeTimelineEntry.debtPctGdp > 100 ? '#ef4444' : activeTimelineEntry.debtPctGdp > 60 ? '#f59e0b' : '#34d399'}44`,
                        }}>
                          {activeTimelineEntry.debtPctGdp > 100 ? '🚨 Alerta Máxima' : activeTimelineEntry.debtPctGdp > 60 ? '⚠️ Supera Maastricht' : '✅ En Límites UE'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Deuda / PIB</div>
                          <div style={{
                            fontSize: '1.05rem',
                            fontWeight: 900,
                            color: activeTimelineEntry.debtPctGdp > 100 ? '#ef4444' : activeTimelineEntry.debtPctGdp > 60 ? '#f59e0b' : '#34d399'
                          }}>
                            {activeTimelineEntry.debtPctGdp}%
                          </div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Deuda Absoluta</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f1f5f9' }}>
                            {activeTimelineEntry.debtBn} B€
                          </div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Tipo Bono 10Y</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#a78bfa' }}>
                            {activeTimelineEntry.interestRate}%
                          </div>
                        </div>
                      </div>

                      {activeTimelineEntry.event && (
                        <div style={{
                          background: 'rgba(245, 158, 11, 0.08)',
                          borderLeft: '3px solid #f59e0b',
                          borderRadius: '4px',
                          padding: '8px 10px',
                          fontSize: '0.72rem',
                          color: '#fef3c7',
                          lineHeight: 1.4,
                        }}>
                          <strong>Hito Histórico:</strong> {activeTimelineEntry.event}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ─── RUTA AL 30%: CALCULADORA INTERACTIVA ────────────────────────── */}
                <div style={{
                  background: 'rgba(52, 211, 153, 0.03)',
                  border: '1px solid rgba(52, 211, 153, 0.22)',
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  {/* CABECERA */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🌱</span> Ruta al 30%: ¿Cómo bajar la deuda sin hundir el país?
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      Calibra las palancas de <strong style={{ color: '#34d399' }}>ingresos</strong> y <strong style={{ color: '#f97316' }}>gasto</strong> para proyectar cómo evoluciona la Deuda/PIB hasta 2054.
                      Históricamente España bajó del 67% al 36% (1996-2007) <em>creciendo</em>, no recortando.
                    </p>
                  </div>

                  {/* SLIDERS EN DOS COLUMNAS */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

                    {/* COLUMNA IZQUIERDA — PALANCAS DE INGRESOS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', borderBottom: '1px solid rgba(52,211,153,0.2)', paddingBottom: '4px' }}>
                        📈 Palancas de Ingresos
                      </div>

                      {[
                        { label: '💼 Aflorar economía sumergida', sub: `+${(leverSumergida * 2).toFixed(0)} B€/año en IRPF+IVA+SS`, val: leverSumergida, set: setLeverSumergida, min: 0, max: 5, step: 0.5, unit: 'pp', color: '#34d399' },
                        { label: '🏢 Tipo efectivo IS (hoy ~17%)', sub: `+${(leverSociedades * 1.5).toFixed(0)} B€/año en recaudación`, val: leverSociedades, set: setLeverSociedades, min: 0, max: 8, step: 0.5, unit: 'pp', color: '#34d399' },
                        { label: '📈 Crecimiento PIB nominal', sub: `${leverCrecimiento}% anual (boom 1996-2007: 7-8%)`, val: leverCrecimiento, set: setLeverCrecimiento, min: 1, max: 7, step: 0.5, unit: '%', color: '#38bdf8' },
                        { label: '🌍 IED adicional (% sobre PIB)', sub: `+${(leverIed * 1.5).toFixed(0)} B€/año est.`, val: leverIed, set: setLeverIed, min: 0, max: 3, step: 0.25, unit: '%', color: '#34d399' },
                        { label: '🧑‍💻 Formalización autónomos', sub: `+${(leverAutonomos * 0.06).toFixed(1)} B€/año en SS e IRPF`, val: leverAutonomos, set: setLeverAutonomos, min: 0, max: 50, step: 5, unit: '%', color: '#34d399' },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.64rem', color: '#e2e8f0', fontWeight: 600 }}>{s.label}</span>
                            <span style={{ fontSize: '0.64rem', color: s.color, fontWeight: 800, fontFamily: 'monospace' }}>
                              {s.val}{s.unit}
                            </span>
                          </div>
                          <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                            onChange={e => s.set(Number(e.target.value))}
                            style={{ width: '100%', accentColor: s.color, cursor: 'pointer', height: '14px' }}
                          />
                          <div style={{ fontSize: '0.58rem', color: '#64748b' }}>{s.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* COLUMNA DERECHA — PALANCAS DE GASTO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', borderBottom: '1px solid rgba(249,115,22,0.2)', paddingBottom: '4px' }}>
                        ✂️ Palancas de Gasto (Mezcla Opcional)
                      </div>

                      {[
                        { label: '📉 Reducción gasto no esencial', sub: `−${(leverGasto * (540 - 33) * 0.01).toFixed(0)} B€/año (excl. intereses)`, val: leverGasto, set: setLeverGasto, min: 0, max: 15, step: 0.5, unit: '%', color: '#f97316' },
                        { label: '⚙️ Eficiencia administrativa', sub: `−${(leverEficiencia * (540 - 33) * 0.01).toFixed(0)} B€/año sin recortar servicios`, val: leverEficiencia, set: setLeverEficiencia, min: 0, max: 10, step: 0.5, unit: '%', color: '#f59e0b' },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.64rem', color: '#e2e8f0', fontWeight: 600 }}>{s.label}</span>
                            <span style={{ fontSize: '0.64rem', color: s.color, fontWeight: 800, fontFamily: 'monospace' }}>
                              {s.val}{s.unit}
                            </span>
                          </div>
                          <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                            onChange={e => s.set(Number(e.target.value))}
                            style={{ width: '100%', accentColor: s.color, cursor: 'pointer', height: '14px' }}
                          />
                          <div style={{ fontSize: '0.58rem', color: '#64748b' }}>{s.sub}</div>
                        </div>
                      ))}

                      {/* Resumen de impacto combinado */}
                      <div style={{
                        marginTop: '6px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}>
                        <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px', marginBottom: '2px' }}>
                          💡 Efecto Anual Estimado
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                          <span style={{ color: '#94a3b8' }}>Ingresos extra:</span>
                          <span style={{ color: '#34d399', fontWeight: 800, fontFamily: 'monospace' }}>
                            +{debtTrajectory.extraRevenueBn.toFixed(1)} B€/año
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                          <span style={{ color: '#94a3b8' }}>Ahorro en gasto:</span>
                          <span style={{ color: '#f97316', fontWeight: 800, fontFamily: 'monospace' }}>
                            −{debtTrajectory.savingsBn.toFixed(1)} B€/año
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '4px', marginTop: '2px' }}>
                          <span style={{ color: '#94a3b8' }}>Mejora fiscal neta:</span>
                          <span style={{ color: '#f1f5f9', fontWeight: 900, fontFamily: 'monospace' }}>
                            {(debtTrajectory.extraRevenueBn + debtTrajectory.savingsBn).toFixed(1)} B€/año
                          </span>
                        </div>
                      </div>

                      {/* Botón reset */}
                      <button
                        id="ruta30-reset-btn"
                        onClick={() => {
                          setLeverSumergida(0); setLeverSociedades(0); setLeverCrecimiento(2);
                          setLeverIed(0); setLeverAutonomos(0); setLeverGasto(0); setLeverEficiencia(0);
                          setLeverBabyBoom(3.2); setLeverRetrasoJubilacion(0); setLeverMigracion(150); setLeverMei(0);
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          color: '#64748b',
                          fontSize: '0.65rem',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          marginTop: '4px',
                        }}
                      >
                        ↺ Resetear todo
                      </button>
                    </div>
                  </div>

                  {/* ─── BLOQUE DEMOGRÁFICO: EL MURO DE LAS PENSIONES (BABY BOOM 2025–2045) ─── */}
                  <div style={{
                    background: 'rgba(168, 85, 247, 0.05)',
                    border: '1px solid rgba(168, 85, 247, 0.22)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>👵</span>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e9d5ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            El Muro Demográfico: Tsunami de Pensiones del Baby Boom (2025–2045)
                          </div>
                          <div style={{ fontSize: '0.62rem', color: '#c084fc' }}>
                            La jubilación de la generación 1958-1977 añade hasta +3,2 pp de PIB en gasto público (AIReF). ¿Logras neutralizarlo?
                          </div>
                        </div>
                      </div>

                      {/* Badge reactivo */}
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        background: debtTrajectory.demographicAbsorbed ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: debtTrajectory.demographicAbsorbed ? '#34d399' : '#f87171',
                        border: `1px solid ${debtTrajectory.demographicAbsorbed ? '#34d399' : '#f87171'}55`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}>
                        <span>{debtTrajectory.demographicAbsorbed ? '✅' : '⚠️'}</span>
                        <span>
                          {debtTrajectory.demographicAbsorbed
                            ? 'Impacto absorbido por reformas y crecimiento'
                            : `Tensión pico (2040): +${debtTrajectory.peakYearPensionBn.toFixed(0)} B€/año`}
                        </span>
                      </div>
                    </div>

                    {/* 4 Sliders demográficos */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {[
                        {
                          label: '💥 Presión Baby Boom (PIB)',
                          sub: `Pico 2040: +${leverBabyBoom}% PIB gasto`,
                          val: leverBabyBoom,
                          set: setLeverBabyBoom,
                          min: 0, max: 4.5, step: 0.25, unit: ' pp',
                          color: '#f43f5e',
                        },
                        {
                          label: '⏳ Retraso edad efectiva',
                          sub: leverRetrasoJubilacion > 0 ? `−${(leverRetrasoJubilacion * 0.45).toFixed(2)} pp PIB de presión` : 'Edad actual (~64.8 años)',
                          val: leverRetrasoJubilacion,
                          set: setLeverRetrasoJubilacion,
                          min: 0, max: 3, step: 0.5, unit: ' años',
                          color: '#a855f7',
                        },
                        {
                          label: '🧳 Saldo migratorio neto',
                          sub: `+${((leverMigracion / 100) * 1.8).toFixed(1)} B€ SS / +${((leverMigracion / 100) * 0.15).toFixed(2)}% PIB`,
                          val: leverMigracion,
                          set: setLeverMigracion,
                          min: 0, max: 400, step: 25, unit: 'k/año',
                          color: '#38bdf8',
                        },
                        {
                          label: '⚖️ Mecanismo Equidad (MEI)',
                          sub: leverMei > 0 ? `+${(leverMei * 1.2).toFixed(1)} B€ fondo reserva` : 'Sin ajuste adicional',
                          val: leverMei,
                          set: setLeverMei,
                          min: 0, max: 6, step: 0.5, unit: ' pp',
                          color: '#c084fc',
                        },
                      ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.61rem', color: '#e2e8f0', fontWeight: 600 }}>{s.label}</span>
                            <span style={{ fontSize: '0.64rem', color: s.color, fontWeight: 800, fontFamily: 'monospace' }}>
                              {s.val}{s.unit}
                            </span>
                          </div>
                          <input
                            type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                            onChange={e => s.set(Number(e.target.value))}
                            style={{ width: '100%', accentColor: s.color, cursor: 'pointer', height: '14px' }}
                          />
                          <div style={{ fontSize: '0.56rem', color: '#94a3b8', marginTop: '2px' }}>{s.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GRÁFICO SVG DE TRAYECTORIA 2024–2054 */}
                  <div style={{
                    background: 'rgba(5, 12, 22, 0.85)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '8px 4px 4px',
                    overflow: 'hidden',
                    marginBottom: '12px',
                  }}>
                    <svg
                      viewBox={`0 0 ${trajectorySvg.w} ${trajectorySvg.h}`}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    >
                      <defs>
                        <linearGradient id="trajGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {/* Rejilla Y */}
                      {[0, 30, 60, 90, 120].map(tick => {
                        const y = trajectorySvg.getY(tick);
                        const isKey = tick === 60 || tick === 30;
                        return (
                          <g key={tick}>
                            <line x1={trajectorySvg.padL} y1={y} x2={trajectorySvg.padL + trajectorySvg.plotW} y2={y}
                              stroke={isKey ? (tick === 30 ? 'rgba(52,211,153,0.3)' : 'rgba(234,179,8,0.3)') : 'rgba(255,255,255,0.05)'}
                              strokeWidth={isKey ? 1.5 : 1} strokeDasharray={isKey ? '4 3' : 'none'} />
                            <text x={trajectorySvg.padL - 5} y={y + 3} fontSize="9" fill={isKey ? (tick === 30 ? '#34d399' : '#eab308') : '#475569'} textAnchor="end" fontFamily="monospace">
                              {tick}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Etiquetas objetivo */}
                      <text x={trajectorySvg.padL + trajectorySvg.plotW - 6} y={trajectorySvg.getY(60) - 4} fontSize="8.5" fill="#eab308" textAnchor="end" fontWeight="700">Maastricht (60%)</text>
                      <text x={trajectorySvg.padL + trajectorySvg.plotW - 6} y={trajectorySvg.getY(30) - 4} fontSize="8.5" fill="#34d399" textAnchor="end" fontWeight="700">🎯 Objetivo 1980 (30%)</text>

                      {/* Eje X — años */}
                      {[2024, 2030, 2035, 2040, 2045, 2050, 2054].map(yr => {
                        const x = trajectorySvg.getX(yr);
                        return (
                          <g key={yr}>
                            <line x1={x} y1={trajectorySvg.padT + trajectorySvg.plotH} x2={x} y2={trajectorySvg.padT + trajectorySvg.plotH + 5} stroke="rgba(255,255,255,0.15)" />
                            <text x={x} y={trajectorySvg.padT + trajectorySvg.plotH + 16} fontSize="9" fill="#64748b" textAnchor="middle" fontFamily="monospace">{yr}</text>
                          </g>
                        );
                      })}

                      {/* Línea base (inmovilismo con presión demográfica — rojo) */}
                      <path d={trajectorySvg.lineBase} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.6" />

                      {/* Línea ideal (con reformas pero SIN envejecimiento — cian punteada) */}
                      <path d={trajectorySvg.lineIdeal} fill="none" stroke="#38bdf8" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.75" />

                      {/* Área y línea activa (tu escenario con demografía real — verde) */}
                      <path d={trajectorySvg.areaPath} fill="url(#trajGrad)" />
                      <path d={trajectorySvg.lineActive} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Punto 2024 (inicio) */}
                      <circle cx={trajectorySvg.getX(2024)} cy={trajectorySvg.getY(105.1)} r="4" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />

                      {/* Punto de cruce Maastricht (si existe) */}
                      {debtTrajectory.find60 && (
                        <circle cx={trajectorySvg.getX(debtTrajectory.find60.year)} cy={trajectorySvg.getY(60)} r="4.5" fill="#eab308" stroke="#fff" strokeWidth="1.5">
                          <title>{`${debtTrajectory.find60.year}: cruza el 60% de Maastricht`}</title>
                        </circle>
                      )}
                      {/* Punto de cruce 30% (si existe) */}
                      {debtTrajectory.find30 && (
                        <circle cx={trajectorySvg.getX(debtTrajectory.find30.year)} cy={trajectorySvg.getY(30)} r="5" fill="#34d399" stroke="#fff" strokeWidth="2">
                          <title>{`${debtTrajectory.find30.year}: cruza el 30% objetivo`}</title>
                        </circle>
                      )}
                    </svg>

                    {/* Leyenda */}
                    <div style={{ display: 'flex', gap: '14px', padding: '4px 8px 2px', fontSize: '0.6rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: 16, height: 2, background: '#34d399', display: 'inline-block', borderRadius: 2 }}></span>
                        Tu escenario (con demografía)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: 16, height: 2, background: '#38bdf8', display: 'inline-block', borderRadius: 2, borderTop: '2px dashed #38bdf8' }}></span>
                        Sin envejecimiento (ideal)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: 16, height: 2, background: '#ef4444', display: 'inline-block', borderRadius: 2, opacity: 0.6 }}></span>
                        Sin cambios (inmovilismo)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: 8, height: 8, background: '#f59e0b', display: 'inline-block', borderRadius: '50%' }}></span>
                        Hoy (105.1% PIB)
                      </span>
                    </div>
                  </div>

                  {/* 4 TARJETAS DE RESULTADO */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <div style={{
                      background: debtTrajectory.find60 ? 'rgba(234,179,8,0.08)' : 'rgba(239,68,68,0.06)',
                      border: `1px solid ${debtTrajectory.find60 ? '#eab308' : '#ef4444'}44`,
                      borderRadius: '8px', padding: '10px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginBottom: '3px' }}>🎯 Maastricht (60%)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: debtTrajectory.find60 ? '#eab308' : '#ef4444' }}>
                        {debtTrajectory.find60 ? `${debtTrajectory.find60.year - 2024} años` : '> 30 años'}
                      </div>
                      <div style={{ fontSize: '0.58rem', color: '#64748b' }}>
                        {debtTrajectory.find60 ? `En ${debtTrajectory.find60.year}` : 'No alcanzable'}
                      </div>
                    </div>

                    <div style={{
                      background: debtTrajectory.find30 ? 'rgba(52,211,153,0.08)' : 'rgba(100,116,139,0.08)',
                      border: `1px solid ${debtTrajectory.find30 ? '#34d399' : '#475569'}44`,
                      borderRadius: '8px', padding: '10px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginBottom: '3px' }}>🏆 Objetivo 30% (1980)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: debtTrajectory.find30 ? '#34d399' : '#475569' }}>
                        {debtTrajectory.find30 ? `${debtTrajectory.find30.year - 2024} años` : '> 30 años'}
                      </div>
                      <div style={{ fontSize: '0.58rem', color: '#64748b' }}>
                        {debtTrajectory.find30 ? `En ${debtTrajectory.find30.year}` : (debtTrajectory.ideal30 ? `(Ideal: ${debtTrajectory.ideal30.year})` : 'Fuera horizonte')}
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(168, 85, 247, 0.08)',
                      border: '1px solid rgba(168, 85, 247, 0.25)',
                      borderRadius: '8px', padding: '10px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '0.58rem', color: '#e9d5ff', marginBottom: '3px' }}>👵 Coste Pensiones (30a)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#c084fc' }}>
                        +{debtTrajectory.cumulativePensionCost.toFixed(0)} B€
                      </div>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>
                        Pico 2040: +{debtTrajectory.peakYearPensionBn.toFixed(0)} B€/año
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(167,139,250,0.06)',
                      border: '1px solid rgba(167,139,250,0.2)',
                      borderRadius: '8px', padding: '10px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginBottom: '3px' }}>💸 Intereses Deuda (30a)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#a78bfa' }}>
                        {debtTrajectory.totalInterestPaid.toFixed(0)} B€
                      </div>
                      <div style={{ fontSize: '0.58rem', color: '#64748b' }}>Coste financiero acum.</div>
                    </div>
                  </div>

                  {/* NOTA EDUCATIVA */}
                  <div style={{
                    marginTop: '10px',
                    background: 'rgba(52, 211, 153, 0.06)',
                    borderLeft: '3px solid #34d399',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    fontSize: '0.64rem',
                    color: '#a7f3d0',
                    lineHeight: 1.5,
                  }}>
                    <strong>📌 Clave Demográfica & Macro:</strong> El crecimiento nominal del PIB es el principal motor para licuar la deuda (vía denominador),
                    pero en España choca directamente contra la jubilación de la generación del baby boom (1958-1977).
                    Sin reformas en la edad efectiva o aporte de nuevos cotizantes netos, el gasto en pensiones añadirá hasta <strong>+3,2 pp de PIB</strong> (AIReF),
                    neutralizando los superávits primarios. Compara la curva verde (tu escenario real) con la línea cian punteada (escenario ideal sin presión demográfica)
                    para ver el "peaje" del envejecimiento poblacional.
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
                No hay datos disponibles para el año {debtLabYear}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
