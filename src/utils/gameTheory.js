// Motor de Teoría de Juegos y Asamblea Global (Dilema del Prisionero Multilateral)

export const GLOBAL_PROJECTS = [
  {
    id: 'fusion_fund',
    name: 'Iniciativa Global de Fusión Nuclear',
    totalCost: 20000000000, // $20B
    cooperationThreshold: 3, // Al menos 3 de 4 deben cooperar
    benefitPerPlayer: 1500000000, // +$1.5B/m permanente en ingresos
    freeRiderGain: 2000000000, // Si otros lo financian y tú no pagas
    collapseRisk: 0.1,
    description: 'Generar energía limpia infinita. Si 3 o más naciones cooperan, el reactor tiene éxito.',
    realWorldIndex: 1
  },
  {
    id: 'biosecurity_mesh',
    name: 'Red Planetaria de Alerta Pandémica',
    totalCost: 12000000000, // $12B
    cooperationThreshold: 3,
    benefitPerPlayer: 800000000,
    freeRiderGain: 1000000000,
    collapseRisk: 0.25,
    description: 'Detección temprana de patógenos. Evita que un brote local se convierta en una plaga global.',
    realWorldIndex: 2
  },
  {
    id: 'tax_transparency',
    name: 'Tratado de Transparencia Fiscal Global',
    totalCost: 8000000000, // $8B
    cooperationThreshold: 4, // Requiere unanimidad (4/4) para funcionar perfectamente
    benefitPerPlayer: 3000000000,
    freeRiderGain: 8000000000, // El paraíso fiscal se queda con los capitales mundiales
    collapseRisk: 0.05,
    description: 'Eliminación coordinada de paraísos fiscales. Si alguien deserta, se convierte en el refugio del capital.',
    realWorldIndex: 3
  },
  {
    id: 'climate_shield',
    name: 'Fondo de Restauración y Clima',
    totalCost: 32000000000, // $32B
    cooperationThreshold: 3,
    benefitPerPlayer: 2500000000,
    freeRiderGain: 3000000000,
    collapseRisk: 0.35,
    description: 'Infraestructura geoingenieril para prevenir megahuracanes y sequías planetarias.',
    realWorldIndex: 0
  }
];

export const NATION_ARCHETYPES = [
  {
    id: 'technocrat',
    name: 'Bloque Tecnocrático Nórdico',
    avatar: '🔬',
    type: 'El Cooperador Racional',
    bio: 'Siempre apuesta por la ciencia y los bienes públicos. Solo deserta si la traición de los demás es sistemática.',
    decide: (project, history) => {
      // Coopera casi siempre (90%)
      return Math.random() < 0.9;
    }
  },
  {
    id: 'freerider',
    name: 'Federación Oportunista',
    avatar: '🦊',
    type: 'El Free-Rider (Aprovechado)',
    bio: 'Prefiere que los demás paguen la factura para quedarse el dinero. Solo coopera si el riesgo de colapso es crítico.',
    decide: (project, history) => {
      // Coopera solo un 20% de las veces
      return Math.random() < 0.2;
    }
  },
  {
    id: 'tit_for_tat',
    name: 'Unión Soberanista',
    avatar: '⚖️',
    type: 'Tit-for-Tat (Ojo por Ojo)',
    bio: 'Empieza cooperando. En rondas posteriores, hace exactamente lo que hizo la mayoría en la ronda anterior.',
    decide: (project, history) => {
      if (!history || history.length === 0) return true;
      const lastRound = history[0];
      const cooperatorCount = Object.values(lastRound.decisions || {}).filter(Boolean).length;
      return cooperatorCount >= 3;
    }
  }
];

export const resolveAssemblyRound = (project, playerDecision, roundHistory = []) => {
  const decisions = {
    player: playerDecision
  };

  // Decisiones de las 3 naciones IA
  NATION_ARCHETYPES.forEach(nation => {
    decisions[nation.id] = nation.decide(project, roundHistory);
  });

  const cooperators = Object.keys(decisions).filter(k => decisions[k] === true);
  const defectors = Object.keys(decisions).filter(k => decisions[k] === false);
  const success = cooperators.length >= project.cooperationThreshold;

  const costPerCooperator = cooperators.length > 0 ? Math.floor(project.totalCost / cooperators.length) : 0;

  let playerNetImpact = 0;
  let playerMessage = '';

  if (playerDecision) {
    // El jugador cooperó
    playerNetImpact -= costPerCooperator;
    if (success) {
      playerNetImpact += project.benefitPerPlayer;
      playerMessage = `¡Éxito en el tratado! Aportaste $${costPerCooperator.toLocaleString('es-ES')} y recibiste los beneficios del megaproyecto colectivo.`;
    } else {
      playerMessage = `El proyecto fracasó por falta de quórum (${cooperators.length}/${project.cooperationThreshold} cooperadores). Perdiste tu inversión inicial.`;
    }
  } else {
    // El jugador desertó (free-rider)
    if (success) {
      playerNetImpact += project.freeRiderGain;
      playerMessage = `Actuaste como "Free-Rider". Los demás financiaron el proyecto y tú te beneficiaste sin poner un solo dólar.`;
    } else {
      playerMessage = `Desertaste y el proyecto fracasó. La humanidad perdió una oportunidad crucial de avance.`;
    }
  }

  return {
    projectId: project.id,
    projectName: project.name,
    decisions,
    cooperatorsCount: cooperators.length,
    success,
    costPerCooperator,
    playerNetImpact,
    playerMessage,
    timestamp: Date.now()
  };
};
