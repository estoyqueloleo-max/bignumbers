// Motor de Expansión por Reglas y Sistema de Modding

export const OFFICIAL_RULE_PACKS = [
  {
    id: 'solarpunk',
    name: '🌿 Solarpunk & Economía Circular',
    author: 'Oficial',
    version: '1.0',
    description: 'Enfoque en residuo cero, energías limpias y descentralización. Abarata gastos y mitiga catástrofes climáticas.',
    enabled: false,
    modifiers: {
      incomeMultiplier: 1.1,
      expenseMultiplier: 0.85,
      crisisProbMultiplier: 0.6,
      debtInterestModifier: -0.005,
      growthBonus: 0.001
    },
    customEvents: [
      {
        title: 'Revolución en Almacenamiento Geotérmico',
        desc: 'Una red comunitaria logra almacenar energía infinita a coste cero.',
        costA: 200000000,
        costB: 20000000,
        popPenalty: 0
      }
    ],
    customUpgrades: [
      {
        id: 'upgrade_circular_grid',
        name: 'Matriz Circular Nacional',
        cost: 6000000000,
        incomeBoost: 150000000,
        expenseReduction: 80000000,
        description: 'Reciclaje integral de materias primas industriales.'
      }
    ]
  },
  {
    id: 'financial_dystopia',
    name: '🏙️ Distopía Financiera & Ultra-Desregulación',
    author: 'Oficial',
    version: '1.0',
    description: 'Crecimiento desmedido de ingresos y especulación, pero las crisis son 2.5x más frecuentes y devastadoras.',
    enabled: false,
    modifiers: {
      incomeMultiplier: 1.4,
      expenseMultiplier: 1.25,
      crisisProbMultiplier: 2.2,
      debtInterestModifier: 0.02,
      growthBonus: -0.001
    },
    customEvents: [
      {
        title: 'Estallido de la Burbuja Algorítmica',
        desc: 'Los fondos de alta frecuencia han provocado una caída del 40% en los mercados.',
        costA: 15000000000,
        costB: 2000000000,
        popPenalty: 0.08
      }
    ],
    customUpgrades: [
      {
        id: 'upgrade_ai_hedge_hub',
        name: 'Centro Financiero Cuántico',
        cost: 25000000000,
        incomeBoost: 800000000,
        expenseReduction: 0,
        description: 'Multiplica los flujos de capital pero aumenta la volatilidad nacional.'
      }
    ]
  },
  {
    id: 'universal_welfare',
    name: '🛡️ Renta Básica & Estado del Bienestar Radical',
    author: 'Oficial',
    version: '1.0',
    description: 'Incrementa los gastos fijos por ciudadano, pero la población crece mucho más rápido y es inmune a colapsos sanitarios.',
    enabled: false,
    modifiers: {
      incomeMultiplier: 0.95,
      expenseMultiplier: 1.15,
      crisisProbMultiplier: 0.75,
      debtInterestModifier: -0.002,
      growthBonus: 0.004
    },
    customEvents: [
      {
        title: 'Florecimiento Creativo y Científico',
        desc: 'Al tener las necesidades cubiertas, miles de ciudadanos patentan innovaciones.',
        costA: 100000000,
        costB: 0,
        popPenalty: 0
      }
    ],
    customUpgrades: [
      {
        id: 'upgrade_universal_care',
        name: 'Garantía Vital Integral',
        cost: 10000000000,
        incomeBoost: 300000000,
        expenseReduction: 50000000,
        description: 'Elimina completamente la pobreza extrema en todo el país.'
      }
    ]
  }
];

// Calcular modificadores acumulados de todas las reglas activas
export const calculateAggregateModifiers = (rulePacks = []) => {
  const activePacks = rulePacks.filter(p => p.enabled);

  const aggregate = {
    incomeMultiplier: 1.0,
    expenseMultiplier: 1.0,
    crisisProbMultiplier: 1.0,
    debtInterestModifier: 0.0,
    growthBonus: 0.0,
    activeCount: activePacks.length,
    customEvents: [],
    customUpgrades: []
  };

  activePacks.forEach(pack => {
    if (pack.modifiers) {
      if (typeof pack.modifiers.incomeMultiplier === 'number') aggregate.incomeMultiplier *= pack.modifiers.incomeMultiplier;
      if (typeof pack.modifiers.expenseMultiplier === 'number') aggregate.expenseMultiplier *= pack.modifiers.expenseMultiplier;
      if (typeof pack.modifiers.crisisProbMultiplier === 'number') aggregate.crisisProbMultiplier *= pack.modifiers.crisisProbMultiplier;
      if (typeof pack.modifiers.debtInterestModifier === 'number') aggregate.debtInterestModifier += pack.modifiers.debtInterestModifier;
      if (typeof pack.modifiers.growthBonus === 'number') aggregate.growthBonus += pack.modifiers.growthBonus;
    }

    if (Array.isArray(pack.customEvents)) {
      aggregate.customEvents.push(...pack.customEvents);
    }
    if (Array.isArray(pack.customUpgrades)) {
      aggregate.customUpgrades.push(...pack.customUpgrades);
    }
  });

  return aggregate;
};

// Serializar paquete de reglas para compartir por URL hash (#rules=...)
export const exportRulePackToUrl = (rulePack) => {
  try {
    const compact = {
      id: rulePack.id || `custom_${Date.now()}`,
      name: rulePack.name,
      author: rulePack.author || 'Usuario',
      desc: rulePack.description,
      mods: rulePack.modifiers,
      events: rulePack.customEvents || [],
      upgs: rulePack.customUpgrades || []
    };

    const jsonStr = JSON.stringify(compact);
    const encoded = btoa(encodeURIComponent(jsonStr));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#rules=${encoded}`;
  } catch (err) {
    console.error('Error serializing rule pack:', err);
    return window.location.href;
  }
};

// Importar paquete de reglas desde URL hash
export const importRulePackFromUrl = () => {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('rules=')) return null;

    const encoded = hash.split('rules=')[1];
    if (!encoded) return null;

    const jsonStr = decodeURIComponent(atob(encoded));
    const compact = JSON.parse(jsonStr);

    if (!compact || !compact.name || !compact.mods) return null;

    return {
      id: compact.id || `imported_${Date.now()}`,
      name: compact.name,
      author: compact.author || 'Compartido',
      version: '1.0',
      description: compact.desc || 'Paquete de reglas importado por enlace.',
      enabled: true,
      modifiers: compact.mods,
      customEvents: compact.events || [],
      customUpgrades: compact.upgs || []
    };
  } catch (err) {
    console.error('Error importing rule pack from URL:', err);
    return null;
  }
};
