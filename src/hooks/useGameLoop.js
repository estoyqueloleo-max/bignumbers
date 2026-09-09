import { useState, useEffect, useCallback, useRef } from 'react';
import { playThudSound, playCoinSound, playCrisisAlertSound, playBondSound } from '../utils/audio';
import { SCENARIOS } from '../utils/scenarios';
import { importGameFromUrl } from '../utils/shareUtils';
import { OFFICIAL_RULE_PACKS, calculateAggregateModifiers, importRulePackFromUrl } from '../utils/rulesEngine';

const STORAGE_KEY = 'bigNumbers_savedGameState_v4';
const REAL_DATA_YEAR_KEY = 'bigNumbers_realDataYear';
const RULES_STORAGE_KEY = 'bigNumbers_savedRulePacks_v4';

// Helper de calificación crediticia
export const calculateCreditRating = (debt, treasury, annualIncome, interestModifier = 0) => {
  if (debt <= 0) return { rating: 'AAA', label: 'Excelente', interestRate: Math.max(0.005, 0.015 + interestModifier), color: '#10b981' };
  const totalBacking = Math.max(1, treasury + annualIncome);
  const debtRatio = debt / totalBacking;

  let baseRate = 0.015;
  let rating = 'AAA';
  let label = 'Excelente';
  let color = '#10b981';

  if (debtRatio >= 8.0) {
    rating = 'D'; label = 'Bono Basura / Quiebra'; baseRate = 0.15; color = '#991b1b';
  } else if (debtRatio >= 5.0) {
    rating = 'CCC'; label = 'Vulnerable'; baseRate = 0.10; color = '#dc2626';
  } else if (debtRatio >= 3.5) {
    rating = 'B'; label = 'Alto Riesgo'; baseRate = 0.07; color = '#ef4444';
  } else if (debtRatio >= 2.0) {
    rating = 'BB'; label = 'Especulativo'; baseRate = 0.05; color = '#f97316';
  } else if (debtRatio >= 1.0) {
    rating = 'BBB'; label = 'Aceptable'; baseRate = 0.035; color = '#fbbf24';
  } else if (debtRatio >= 0.5) {
    rating = 'A'; label = 'Estable'; baseRate = 0.025; color = '#38bdf8';
  } else if (debtRatio >= 0.2) {
    rating = 'AA'; label = 'Muy Sólido'; baseRate = 0.02; color = '#34d399';
  }

  const finalRate = Math.max(0.005, baseRate + interestModifier);
  return { rating, label, interestRate: finalRate, color };
};

// Comprobación de eventos históricos reales según el año cargado
function getHistoricalEvent(state) {
  if (!state.realDataYear) return null;
  const year = Number(state.realDataYear);
  const fired = state.historicalEventsFired || {};

  // Disparar en el mes 2 para que el jugador afronte el hito histórico temprano
  if (state.month === 2) {
    if (year === 2012 && !fired['2012_bailout']) {
      return {
        id: Date.now(),
        eventKey: '2012_bailout',
        title: '🚨 Rescate Bancario Europeo (MOU 2012)',
        description: 'La prima de riesgo supera los 600 pb y los bancos están al borde de la quiebra. El Eurogrupo ofrece hasta 41.300 M€ sujetos a supervisión comunitaria.',
        isHistorical: true,
        options: [
          {
            label: 'Firmar el Rescate Europeo (+41.300 M€ liquidez)',
            cost: -41300000000,
            loan: 41300000000,
            popPenalty: 0
          },
          {
            label: 'Rechazar y aplicar Bail-In (Pérdidas a depositantes)',
            cost: 0,
            loan: 0,
            popPenalty: 0.04
          }
        ]
      };
    }

    if (year === 2020 && !fired['2020_covid']) {
      const emergencyCost = Math.floor(Math.max(8000000000, state.treasury * 0.35));
      return {
        id: Date.now(),
        eventKey: '2020_covid',
        title: '🦠 Pandemia Global COVID-19 y Confinamiento',
        description: 'Una crisis sanitaria sin precedentes satura los hospitales. El Consejo de Ministros debe decidir entre el confinamiento estricto con escudo social (ERTEs) o priorizar la actividad económica.',
        isHistorical: true,
        options: [
          {
            label: 'Confinamiento Estricto y Escudo Social (ERTEs)',
            cost: emergencyCost,
            loan: 0,
            popPenalty: 0
          },
          {
            label: 'Priorizar Apertura Económica (Inmunidad de Rebaño)',
            cost: 0,
            loan: 0,
            popPenalty: 0.05
          }
        ]
      };
    }

    if ((year === 2021 || year === 2022) && !fired['2021_nextgen']) {
      return {
        id: Date.now(),
        eventKey: '2021_nextgen',
        title: '🇪🇺 Fondos NextGenerationEU: Inversión Estratégica',
        description: 'Bruselas transfiere un tramo directo de 10.000 M€ no reembolsables para modernización económica. ¿En qué canalizar estos fondos?',
        isHistorical: true,
        options: [
          {
            label: 'Transición Verde y Digital (+10.000 M€ Tesorería)',
            cost: -10000000000,
            loan: 0,
            popPenalty: 0
          },
          {
            label: 'Amortización Extraordinaria de Deuda (-10.000 M€ Deuda)',
            cost: 0,
            loan: -10000000000,
            popPenalty: 0
          }
        ]
      };
    }

    if (year === 2010 && !fired['2010_sovereign_debt']) {
      return {
        id: Date.now(),
        eventKey: '2010_sovereign_debt',
        title: '📉 Ataque Especulativo a la Deuda Soberana',
        description: 'Los mercados dudan de la solvencia de las economías del sur de Europa. El BCE y Bruselas exigen un plan creíble de consolidación fiscal.',
        isHistorical: true,
        options: [
          {
            label: 'Plan de Ajuste Ordenado (Reducir Déficit)',
            cost: Math.floor(state.treasury * 0.2),
            loan: 0,
            popPenalty: 0.01
          },
          {
            label: 'Emisión Extraordinaria de Bonos de Emergencia',
            cost: 0,
            loan: 15000000000,
            popPenalty: 0
          }
        ]
      };
    }
  }

  return null;
}

// Generador de eventos procedurales afectado por ministerios y reglas personalizadas
function generateProceduralEvent(state, customRuleEvents = []) {
  const infraBonus = (state.ministryAllocations?.infra || 15) / 100;
  const securityBonus = (state.ministryAllocations?.security || 10) / 100;
  const healthBonus = (state.ministryAllocations?.health || 20) / 100;
  const socialAlloc = state.ministryAllocations?.social ?? 40;

  const baseScale = Math.max(100000000, state.treasury * 1.4);
  const scale = Math.floor(baseScale * (1 - (securityBonus * 0.2 + infraBonus * 0.1)));

  const baseEventTypes = [
    {
      title: 'Colapso de Infraestructura Crítica',
      desc: 'Varios puentes y redes eléctricas clave han colapsado a nivel nacional.',
      costA: scale,
      costB: Math.floor(scale * 0.12),
      popPenalty: Math.max(0.01, 0.06 * (1 - infraBonus * 0.5))
    },
    {
      title: 'Brote Epidémico Grave',
      desc: 'Una nueva cepa viral altamente contagiosa está saturando el sistema hospitalario.',
      costA: Math.floor(scale * 1.8),
      costB: 0,
      popPenalty: Math.max(0.02, 0.15 * (1 - healthBonus * 0.6))
    },
    {
      title: 'Ciberataque al Sistema Financiero',
      desc: 'Infiltración masiva en la red bancaria central que paraliza transacciones.',
      costA: Math.floor(scale * 1.3),
      costB: Math.floor(scale * 0.2),
      popPenalty: Math.max(0.01, 0.05 * (1 - securityBonus * 0.5))
    },
    {
      title: 'Catástrofe Climática Extrema',
      desc: 'Inundaciones y huracanes han arrasado cosechas e infraestructura urbana.',
      costA: Math.floor(scale * 1.5),
      costB: Math.floor(scale * 0.15),
      popPenalty: Math.max(0.02, 0.08 * (1 - infraBonus * 0.4))
    }
  ];

  // Si la protección social es baja (<20%), añadir evento de Huelga General
  if (socialAlloc < 20) {
    baseEventTypes.push({
      title: 'Huelga General por Recorte de Pensiones y Bienestar',
      desc: 'El tijeretazo a la Seguridad Social y subsidios ha paralizado el transporte y los polígonos industriales.',
      costA: Math.floor(scale * 0.9),
      costB: Math.floor(scale * 0.08),
      popPenalty: 0.02
    });
  }

  const allEventTypes = [...baseEventTypes, ...(customRuleEvents || [])];
  const template = allEventTypes[Math.floor(Math.random() * allEventTypes.length)];

  const costA = template.costA || scale;
  const costB = template.costB !== undefined ? template.costB : Math.floor(costA * 0.15);
  const popPenalty = template.popPenalty !== undefined ? template.popPenalty : 0.05;

  return {
    id: Date.now(),
    title: template.title,
    description: template.desc,
    options: [
      {
        label: 'Intervención Completa',
        cost: costA,
        loan: 0,
        popPenalty: 0
      },
      {
        label: 'Parche Rápido (Pérdida de Vidas)',
        cost: costB,
        loan: 0,
        popPenalty: popPenalty
      },
      {
        label: 'Rescate de Emergencia FMI (Deuda)',
        cost: 0,
        loan: costA,
        popPenalty: 0
      }
    ]
  };
}

export const useGameLoop = (initialOverrides = {}) => {
  // 1. GESTIÓN DE PAQUETES DE REGLAS
  const [rulePacks, setRulePacks] = useState(() => {
    let initialPacks = OFFICIAL_RULE_PACKS;
    try {
      const saved = localStorage.getItem(RULES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialPacks = parsed;
        }
      }
    } catch {
      // Ignorar
    }

    // Comprobar si hay un paquete de reglas importado por URL (#rules=...)
    const importedFromUrl = importRulePackFromUrl();
    if (importedFromUrl) {
      const exists = initialPacks.some(p => p.id === importedFromUrl.id);
      if (!exists) {
        initialPacks = [importedFromUrl, ...initialPacks];
      }
    }

    return initialPacks;
  });

  useEffect(() => {
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rulePacks));
    } catch {
      // Ignorar
    }
  }, [rulePacks]);

  const activeModifiers = calculateAggregateModifiers(rulePacks);

  const getDefaultState = (scenarioId = 'standard') => {
    const sc = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0];
    return {
      population: sc.initialState.population,
      treasury: sc.initialState.treasury,
      baseIncomePerCapita: sc.initialState.baseIncomePerCapita,
      baseExpensePerCapita: sc.initialState.baseExpensePerCapita,
      taxRate: sc.initialState.taxRate,
      fixedIncome: sc.initialState.fixedIncome || 0,
      fixedExpenses: sc.initialState.fixedExpenses || 0,
      debt: sc.initialState.debt || 0,
      month: 1,
      gameOver: false,
      gameWon: false,
      activeDilemma: null,
      eventHistory: [],
      scenarioId: sc.id,
      sovereignFund: 0,
      peakTreasury: sc.initialState.treasury,
      crisesResolved: 0,
      livesLost: 0,
      currency: '$',
      realDataYear: null,
      unemploymentRate: 14.0,
      baseUnemploymentRate: 14.0,
      socialPeace: 85,
      historicalEventsFired: {},
      ministryAllocations: {
        social: 40,
        health: 20,
        rd: 15,
        infra: 15,
        security: 10
      },
      historyData: [
        {
          month: 1,
          treasury: sc.initialState.treasury,
          debt: sc.initialState.debt || 0,
          population: sc.initialState.population,
          cashFlow: 0
        }
      ],
      ...initialOverrides
    };
  };

  /**
   * Carga un escenario con datos reales macroeconómicos.
   * @param {object} realGameState - Objeto devuelto por convertToGameState()
   */
  const loadRealDataScenario = useCallback((realGameState) => {
    setIsRunning(false);
    const unemp = realGameState.unemploymentRate !== undefined ? realGameState.unemploymentRate : 14.0;
    const newState = {
      ...getDefaultState('standard'),
      // Sobrescribir con datos reales
      population: realGameState.population,
      treasury: realGameState.treasury,
      debt: realGameState.debt,
      baseIncomePerCapita: realGameState.baseIncomePerCapita,
      baseExpensePerCapita: realGameState.baseExpensePerCapita,
      fixedIncome: realGameState.fixedIncome || 0,
      fixedExpenses: realGameState.fixedExpenses || 0,
      taxRate: realGameState.taxRate || 1.0,
      currency: realGameState.currency || '€',
      realDataYear: realGameState.realDataYear || null,
      unemploymentRate: unemp,
      baseUnemploymentRate: unemp,
      socialPeace: realGameState.socialPeace || 85,
      historicalEventsFired: {},
      // Asignaciones ministeriales desde COFOG real (5 ministerios)
      ministryAllocations: realGameState.ministryAllocations || { social: 40, health: 20, rd: 15, infra: 15, security: 10 },
      scenarioId: `real_${realGameState.realDataSource || 'spain'}_${realGameState.realDataYear}`,
      peakTreasury: realGameState.treasury,
      historyData: [{
        month: 1,
        treasury: realGameState.treasury,
        debt: realGameState.debt,
        population: realGameState.population,
        cashFlow: 0,
      }],
    };
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      if (realGameState.realDataYear) {
        localStorage.setItem(REAL_DATA_YEAR_KEY, String(realGameState.realDataYear));
      }
    } catch {
      // Ignorar
    }
  }, []);

  const [state, setState] = useState(() => {
    const urlImported = importGameFromUrl();
    if (urlImported) {
      return {
        ...getDefaultState(urlImported.scenarioId),
        ...urlImported
      };
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.treasury === 'number') {
          return parsed;
        }
      }
    } catch {
      // Ignorar
    }
    return getDefaultState();
  });

  const [isRunning, setIsRunning] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [screenShake, setScreenShake] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  const modifiersRef = useRef(activeModifiers);
  modifiersRef.current = activeModifiers;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full
    }
  }, [state]);

  const rdBonus = ((state.ministryAllocations?.rd || 15) / 100) * 0.05;
  const infraExpenseReduction = ((state.ministryAllocations?.infra || 15) / 100) * 0.03;
  const socialAlloc = state.ministryAllocations?.social ?? 40;

  // Penalización por descontento si se recortan drásticamente las pensiones (<20%)
  const socialUnrestPenalty = socialAlloc < 20 ? ((20 - socialAlloc) * 0.008) : 0;

  // Impacto dinámico del desempleo
  const baseUnemployment = state.baseUnemploymentRate ?? 14.0;
  const currentUnemployment = state.unemploymentRate ?? 14.0;
  const unempDelta = currentUnemployment - baseUnemployment;
  const unemploymentIncomeFactor = Math.max(0.7, 1 - (unempDelta * 0.012) - socialUnrestPenalty);
  const unemploymentExpenseFactor = Math.max(0.8, 1 + (unempDelta * 0.01));

  const currentIncome = Math.floor(
    ((state.population * state.baseIncomePerCapita * state.taxRate * (1 + rdBonus) * unemploymentIncomeFactor) +
    state.fixedIncome +
    (state.sovereignFund * 0.005)) * activeModifiers.incomeMultiplier
  );

  const currentExpenses = Math.max(0, Math.floor(
    ((state.population * state.baseExpensePerCapita * (1 - infraExpenseReduction) * unemploymentExpenseFactor) +
    state.fixedExpenses) * activeModifiers.expenseMultiplier
  ));

  const creditRating = calculateCreditRating(state.debt, state.treasury, currentIncome * 12, activeModifiers.debtInterestModifier);
  const debtInterest = Math.floor(state.debt * creditRating.interestRate);

  useEffect(() => {
    if (!isRunning || state.gameOver || state.gameWon || state.activeDilemma) return;

    const tickDuration = 1000 / timeSpeed;

    const intervalId = setInterval(() => {
      setState(prev => {
        if (prev.population <= 0) {
          playThudSound();
          return { ...prev, population: 0, gameOver: true };
        }

        const mods = modifiersRef.current;
        const rd = ((prev.ministryAllocations?.rd || 15) / 100) * 0.05;
        const infra = ((prev.ministryAllocations?.infra || 15) / 100) * 0.03;
        const socAlloc = prev.ministryAllocations?.social ?? 40;

        const socUnrestPenalty = socAlloc < 20 ? ((20 - socAlloc) * 0.008) : 0;
        const baseUnemp = prev.baseUnemploymentRate ?? 14.0;
        const curUnemp = prev.unemploymentRate ?? 14.0;
        const uDelta = curUnemp - baseUnemp;
        const uIncomeMod = Math.max(0.7, 1 - (uDelta * 0.012) - socUnrestPenalty);
        const uExpenseMod = Math.max(0.8, 1 + (uDelta * 0.01));

        const inc = Math.floor(
          ((prev.population * prev.baseIncomePerCapita * prev.taxRate * (1 + rd) * uIncomeMod) +
          prev.fixedIncome +
          (prev.sovereignFund * 0.005)) * mods.incomeMultiplier
        );
        const exp = Math.max(0, Math.floor(
          ((prev.population * prev.baseExpensePerCapita * (1 - infra) * uExpenseMod) +
          prev.fixedExpenses) * mods.expenseMultiplier
        ));

        const rating = calculateCreditRating(prev.debt, prev.treasury, inc * 12, mods.debtInterestModifier);
        const interest = Math.floor(prev.debt * rating.interestRate);

        const cashFlow = inc - exp - interest;
        let newTreasury = prev.treasury + cashFlow;
        let newPopulation = prev.population;
        let newLivesLost = prev.livesLost || 0;

        if (newTreasury < 0) {
          const deficit = Math.abs(newTreasury);
          const popPenalty = Math.floor(deficit / 100);
          newPopulation = Math.max(0, newPopulation - popPenalty);
          newLivesLost += popPenalty;
          newTreasury = 0;

          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 500);
          if (prev.treasury >= 0) playThudSound();
        } else {
          const taxPenalty = (prev.taxRate - 1) * 0.02;
          const socialGrowthBonus = socAlloc >= 35 ? 0.0004 : (socAlloc < 18 ? -0.0005 : 0);
          const baseGrowth = 0.002 + mods.growthBonus + socialGrowthBonus;
          const actualGrowth = Math.max(0.0001, baseGrowth - taxPenalty);
          newPopulation += Math.floor(newPopulation * actualGrowth);
        }

        // Evolución del Desempleo y Paz Social
        let newUnemployment = prev.unemploymentRate ?? 14.0;
        const taxJobPressure = (prev.taxRate - 1.0) * 0.15;
        const jobCreationBonus = (((prev.ministryAllocations?.rd || 15) + (prev.ministryAllocations?.infra || 15)) - 30) * 0.003;
        const deficitJobPressure = prev.treasury === 0 ? 0.25 : -0.02;

        newUnemployment = Math.max(5.0, Math.min(35.0, newUnemployment + taxJobPressure - jobCreationBonus + deficitJobPressure));
        newUnemployment = Math.round(newUnemployment * 10) / 10;

        let newSocialPeace = prev.socialPeace ?? 85;
        if (socAlloc >= 35) {
          newSocialPeace = Math.min(100, newSocialPeace + 1);
        } else if (socAlloc < 20) {
          newSocialPeace = Math.max(10, newSocialPeace - 3);
        }

        // Dilemas históricos y procedurales
        let nextDilemma = prev.activeDilemma;
        if (!nextDilemma) {
          const histDilemma = getHistoricalEvent(prev);
          if (histDilemma) {
            nextDilemma = histDilemma;
            playCrisisAlertSound();
          } else {
            const infraSafety = (prev.ministryAllocations?.infra || 15) / 100;
            const baseCrisisProb = (0.025 + (prev.month * 0.0004)) * (1 - (infraSafety * 0.4));
            const crisisProb = baseCrisisProb * mods.crisisProbMultiplier;

            if (Math.random() < crisisProb && prev.month > 3) {
              nextDilemma = generateProceduralEvent(prev, mods.customEvents);
              playCrisisAlertSound();
            }
          }
        }

        const newPeak = Math.max(prev.peakTreasury || 0, newTreasury);

        const newHistory = [...(prev.historyData || [])];
        if (prev.month % 1 === 0) {
          newHistory.push({
            month: prev.month + 1,
            treasury: newTreasury,
            debt: prev.debt,
            population: newPopulation,
            cashFlow
          });
          if (newHistory.length > 80) newHistory.shift();
        }

        return {
          ...prev,
          treasury: newTreasury,
          population: newPopulation,
          unemploymentRate: newUnemployment,
          socialPeace: newSocialPeace,
          month: prev.month + 1,
          peakTreasury: newPeak,
          livesLost: newLivesLost,
          gameOver: newPopulation <= 0,
          activeDilemma: nextDilemma,
          historyData: newHistory
        };
      });
    }, tickDuration);

    return () => clearInterval(intervalId);
  }, [isRunning, state.gameOver, state.gameWon, timeSpeed, state.activeDilemma]);

  const setTaxRate = useCallback((newRate) => {
    setState(prev => ({ ...prev, taxRate: Math.max(0.4, Math.min(1.8, newRate)) }));
  }, []);

  const setMinistryAllocations = useCallback((newAllocations) => {
    setState(prev => ({
      ...prev,
      ministryAllocations: { ...prev.ministryAllocations, ...newAllocations }
    }));
  }, []);

  const buyUpgrade = useCallback((cost, incomeBoost, expenseReduction, isEndgame = false) => {
    if (stateRef.current.treasury >= cost) {
      setState(prev => ({
        ...prev,
        treasury: prev.treasury - cost,
        fixedIncome: prev.fixedIncome + (incomeBoost || 0),
        fixedExpenses: prev.fixedExpenses - (expenseReduction || 0),
        gameWon: isEndgame ? true : prev.gameWon
      }));
      playCoinSound();
      return true;
    }
    return false;
  }, []);

  const resolveDilemma = useCallback((choice) => {
    setState(prev => {
      let newTreasury = prev.treasury - (choice.cost || 0);
      let newDebt = Math.max(0, prev.debt + (choice.loan || 0));
      let newPop = prev.population;
      let newLost = prev.livesLost || 0;

      if (newTreasury < 0) {
        const penalty = Math.floor(Math.abs(newTreasury) / 100);
        newPop = Math.max(0, newPop - penalty);
        newLost += penalty;
        newTreasury = 0;
        playThudSound();
      } else {
        if (choice.cost > 0) playCoinSound();
        if (choice.loan > 0) playBondSound();
      }

      if (choice.popPenalty > 0) {
        const lost = Math.floor(newPop * choice.popPenalty);
        newPop = Math.max(0, newPop - lost);
        newLost += lost;
      }

      const logText = choice.loan > 0
        ? `Rescate de emergencia emitido por deuda.`
        : (choice.cost > 0 ? `Crisis suprimida mediante financiamiento público completo.` : `Decisión aplicada.`);

      const title = prev.activeDilemma?.title || 'Crisis';
      const updatedHistorical = { ...(prev.historicalEventsFired || {}) };
      if (prev.activeDilemma?.eventKey) {
        updatedHistorical[prev.activeDilemma.eventKey] = true;
      }

      return {
        ...prev,
        treasury: newTreasury,
        debt: newDebt,
        population: newPop,
        livesLost: newLost,
        crisesResolved: (prev.crisesResolved || 0) + 1,
        activeDilemma: null,
        historicalEventsFired: updatedHistorical,
        eventHistory: [{ month: prev.month, text: `${title}: ${logText}` }, ...(prev.eventHistory || [])].slice(0, 50)
      };
    });
  }, []);

  const issueBonds = useCallback((amount) => {
    setState(prev => ({
      ...prev,
      treasury: prev.treasury + amount,
      debt: prev.debt + amount,
      eventHistory: [{ month: prev.month, text: `Emisión de Bonos Soberanos en los mercados.` }, ...(prev.eventHistory || [])].slice(0, 50)
    }));
    playBondSound();
  }, []);

  const payDebt = useCallback((amount) => {
    setState(prev => {
      const actualPay = Math.min(prev.treasury, Math.min(prev.debt, amount));
      if (actualPay <= 0) return prev;
      return {
        ...prev,
        treasury: prev.treasury - actualPay,
        debt: prev.debt - actualPay,
        eventHistory: [{ month: prev.month, text: `Amortización de deuda soberana.` }, ...(prev.eventHistory || [])].slice(0, 50)
      };
    });
    playCoinSound();
  }, []);

  const depositSovereignFund = useCallback((amount) => {
    setState(prev => {
      if (prev.treasury < amount || amount <= 0) return prev;
      return {
        ...prev,
        treasury: prev.treasury - amount,
        sovereignFund: (prev.sovereignFund || 0) + amount
      };
    });
    playCoinSound();
  }, []);

  const withdrawSovereignFund = useCallback((amount) => {
    setState(prev => {
      const actual = Math.min(prev.sovereignFund || 0, amount);
      if (actual <= 0) return prev;
      return {
        ...prev,
        treasury: prev.treasury + actual,
        sovereignFund: (prev.sovereignFund || 0) - actual
      };
    });
    playCoinSound();
  }, []);

  const applyAssemblyImpact = useCallback((netImpact) => {
    setState(prev => {
      const newTreasury = Math.max(0, prev.treasury + netImpact);
      return {
        ...prev,
        treasury: newTreasury,
        eventHistory: [{ month: prev.month, text: `Resolución de la Asamblea Global: ${netImpact >= 0 ? '+' : ''}$${Math.abs(netImpact).toLocaleString('es-ES')}` }, ...(prev.eventHistory || [])].slice(0, 50)
      };
    });
  }, []);

  const toggleRulePack = useCallback((id) => {
    setRulePacks(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  }, []);

  const addCustomRulePack = useCallback((pack) => {
    setRulePacks(prev => [pack, ...prev]);
  }, []);

  const deleteRulePack = useCallback((id) => {
    setRulePacks(prev => prev.filter(p => p.id !== id));
  }, []);

  const loadScenario = useCallback((scenarioId) => {
    setIsRunning(false);
    const newState = getDefaultState(scenarioId);
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // Ignorar
    }
  }, []);

  const resetGame = useCallback(() => {
    setIsRunning(false);
    const currentScenario = stateRef.current.scenarioId || 'standard';
    const newState = getDefaultState(currentScenario);
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // Ignorar
    }
  }, []);

  return {
    state,
    currentIncome,
    currentExpenses,
    debtInterest,
    creditRating,
    rulePacks,
    activeModifiers,
    toggleRulePack,
    addCustomRulePack,
    deleteRulePack,
    isRunning,
    setIsRunning,
    timeSpeed,
    setTimeSpeed,
    setTaxRate,
    setMinistryAllocations,
    buyUpgrade,
    resolveDilemma,
    issueBonds,
    payDebt,
    depositSovereignFund,
    withdrawSovereignFund,
    applyAssemblyImpact,
    loadScenario,
    loadRealDataScenario,
    resetGame,
    screenShake
  };
};
