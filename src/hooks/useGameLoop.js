import { useState, useEffect, useCallback, useRef } from 'react';
import { playThudSound, playCoinSound, playCrisisAlertSound, playBondSound } from '../utils/audio';
import { SCENARIOS } from '../utils/scenarios';
import { importGameFromUrl } from '../utils/shareUtils';
import { OFFICIAL_RULE_PACKS, calculateAggregateModifiers, importRulePackFromUrl } from '../utils/rulesEngine';

const STORAGE_KEY = 'bigNumbers_savedGameState_v4';
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

// Generador de eventos procedurales afectado por ministerios y reglas personalizadas
function generateProceduralEvent(state, customRuleEvents = []) {
  const infraBonus = (state.ministryAllocations?.infra || 25) / 100;
  const securityBonus = (state.ministryAllocations?.security || 25) / 100;
  const healthBonus = (state.ministryAllocations?.health || 25) / 100;

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
      ministryAllocations: {
        health: 25,
        rd: 25,
        infra: 25,
        security: 25
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

  const rdBonus = ((state.ministryAllocations?.rd || 25) / 100) * 0.05;
  const infraExpenseReduction = ((state.ministryAllocations?.infra || 25) / 100) * 0.03;

  const currentIncome = Math.floor(
    ((state.population * state.baseIncomePerCapita * state.taxRate * (1 + rdBonus)) +
    state.fixedIncome +
    (state.sovereignFund * 0.005)) * activeModifiers.incomeMultiplier
  );

  const currentExpenses = Math.max(0, Math.floor(
    ((state.population * state.baseExpensePerCapita * (1 - infraExpenseReduction)) +
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
        const rd = ((prev.ministryAllocations?.rd || 25) / 100) * 0.05;
        const infra = ((prev.ministryAllocations?.infra || 25) / 100) * 0.03;

        const inc = Math.floor(
          ((prev.population * prev.baseIncomePerCapita * prev.taxRate * (1 + rd)) +
          prev.fixedIncome +
          (prev.sovereignFund * 0.005)) * mods.incomeMultiplier
        );
        const exp = Math.max(0, Math.floor(
          ((prev.population * prev.baseExpensePerCapita * (1 - infra)) +
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
          const baseGrowth = 0.002 + mods.growthBonus;
          const actualGrowth = Math.max(0.0001, baseGrowth - taxPenalty);
          newPopulation += Math.floor(newPopulation * actualGrowth);
        }

        let nextDilemma = prev.activeDilemma;
        const infraSafety = (prev.ministryAllocations?.infra || 25) / 100;
        const baseCrisisProb = (0.025 + (prev.month * 0.0004)) * (1 - (infraSafety * 0.4));
        const crisisProb = baseCrisisProb * mods.crisisProbMultiplier;

        if (Math.random() < crisisProb && prev.month > 4 && !nextDilemma) {
          nextDilemma = generateProceduralEvent(prev, mods.customEvents);
          playCrisisAlertSound();
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
      let newDebt = prev.debt + (choice.loan || 0);
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
        ? `Rescate de emergencia FMI emitido por deuda.`
        : (choice.cost > 0 ? `Crisis suprimida mediante financiamiento público completo.` : `Parche de emergencia aplicado con pérdidas humanas.`);

      const title = prev.activeDilemma?.title || 'Crisis';

      return {
        ...prev,
        treasury: newTreasury,
        debt: newDebt,
        population: newPop,
        livesLost: newLost,
        crisesResolved: (prev.crisesResolved || 0) + 1,
        activeDilemma: null,
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
    resetGame,
    screenShake
  };
};
