// Motor de Diplomacia Asíncrona por Relevos & Cápsulas de Estado (Estilo Ajedrez Postal)

export const TREATIES = [
  {
    id: 'free_trade',
    name: 'Tratado de Libre Comercio y Aduanas',
    desc: 'Elimina aranceles mutuos. Otorga +10% de ingresos si ambos aceptan; penaliza con un 15% de déficit al que sufra un arancel unilateral.',
    bonusIfMutual: 0.10,
    penaltyIfUnilateral: -0.15
  },
  {
    id: 'green_pact',
    name: 'Pacto Internacional de Descarbonización',
    desc: 'Inversión conjunta en energías limpias. Reduce en un 30% la probabilidad de catástrofes climáticas.',
    bonusIfMutual: 0.15,
    penaltyIfUnilateral: -0.05
  },
  {
    id: 'science_exchange',
    name: 'Convenio de Cooperación Científica y Espacial',
    desc: 'Comparte laboratorios de fusión y tecnología. Otorga +20% de avance acelerado en megaproyectos.',
    bonusIfMutual: 0.20,
    penaltyIfUnilateral: 0
  },
  {
    id: 'disarmament',
    name: 'Tratado de Desmilitarización y Paz Soberana',
    desc: 'Ambas naciones reducen su presupuesto de seguridad a la mitad y redirigen los fondos a sanidad y educación.',
    bonusIfMutual: 0.25,
    penaltyIfUnilateral: -0.30
  }
];

// Empaquetar cápsula de relevo diplomático
export const createTreatyCapsule = (state, treatyId, playerDecision = true) => {
  const capsule = {
    version: '1.0',
    timestamp: Date.now(),
    proposerState: {
      treasury: state.treasury,
      population: state.population,
      month: state.month,
      scenarioId: state.scenarioId
    },
    treatyId,
    playerDecision
  };

  const jsonStr = JSON.stringify(capsule);
  const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
  return `${window.location.origin}${window.location.pathname}#treaty=${base64}`;
};

// Desempaquetar cápsula de relevo
export const unpackTreatyCapsule = (hash) => {
  if (!hash || !hash.includes('#treaty=')) return null;
  try {
    const base64 = hash.replace('#treaty=', '');
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Error desempaquetando cápsula de tratado:', err);
    return null;
  }
};
