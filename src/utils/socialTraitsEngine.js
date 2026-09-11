/**
 * socialTraitsEngine.js — Motor de Fenómenos Emergentes y Rasgos Sociales Dinámicos
 *
 * Permite definir, editar y calibrar comportamientos psicológicos y sociales
 * que afectan a los 2.500 agentes del micromundo (productividad, salud, protestas,
 * propensión al consumo y fuga de capital digital).
 */

const STORAGE_KEY = 'bigNumbers_socialTraits_v1';

export const DEFAULT_SOCIAL_TRAITS = [
  {
    id: 'screen_burnout',
    name: 'Desgaste Cognitivo & Doomscrolling',
    icon: '📱',
    category: 'Tecnología & Salud Mental',
    description: 'Uso compulsivo de pantallas y redes sociales. Reduce la concentración en el trabajo, satura la salud mental y adormece las protestas ciudadanas.',
    enabled: true,
    intensity: 65, // 0 a 100%
    impacts: {
      productivityFactor: -0.15,      // -15% productividad en pymes
      healthFactor: -0.12,            // -12% salud (ansiedad, insomnio, sedentarismo)
      protestSensitivity: -0.30,      // -30% movilización (apatía cívica)
      consumptionPropensity: 0.05,    // +5% gasto impulsivo
      capitalFlightRate: 0.15         // 15% del consumo se desvía a plataformas extranjeras
    },
    takeaway: 'La distracción algorítmica genera una falsa paz social mientras drena la productividad real.'
  },
  {
    id: 'family_solidarity',
    name: 'Red de Solidaridad Familiar',
    icon: '☕',
    category: 'Cultura & Sociedad',
    description: 'Los abuelos pensionistas y familias extensas comparten ahorros con los jóvenes en paro o precariedad. Amortigua la exclusión pero frena la independencia.',
    enabled: true,
    intensity: 75,
    impacts: {
      productivityFactor: 0.02,
      healthFactor: 0.08,             // Mayor contención emocional
      protestSensitivity: -0.15,      // Amortigua el descontento extremo
      consumptionPropensity: -0.05,   // Mayor prudencia y ahorro familiar
      capitalFlightRate: 0.0
    },
    takeaway: 'El "escudo familiar" actúa como un estabilizador automático invisible del Estado.'
  },
  {
    id: 'ai_revolution',
    name: 'Revolución por Asistentes IA',
    icon: '🤖',
    category: 'Innovación & Trabajo',
    description: 'Adopción masiva de herramientas de inteligencia artificial. Multiplica la producción de profesionales cualificados pero polariza la desigualdad.',
    enabled: false,
    intensity: 50,
    impacts: {
      productivityFactor: 0.28,       // +28% productividad agregada
      healthFactor: -0.04,            // Estrés por obsolescencia laboral
      protestSensitivity: 0.10,       // Tensión por despidos tecnológicos
      consumptionPropensity: 0.02,
      capitalFlightRate: 0.08
    },
    takeaway: 'El PIB se dispara, pero aumenta la distancia entre trabajadores técnicos y convencionales.'
  },
  {
    id: 'gambling_fever',
    name: 'Fiebre de Apuestas Online & Especulación',
    icon: '🎰',
    category: 'Consumo & Riesgo',
    description: 'Proliferación de casas de apuestas y especulación con criptoactivos de alto riesgo. Drena ahorros de hogares vulnerables.',
    enabled: false,
    intensity: 40,
    impacts: {
      productivityFactor: -0.08,
      healthFactor: -0.15,            // Ludopatía y estrés financiero
      protestSensitivity: 0.15,       // Desesperación social
      consumptionPropensity: 0.10,    // Gasto no productivo
      capitalFlightRate: 0.25         // Gran parte de las apuestas van a paraísos fiscales
    },
    takeaway: 'El dinero se esfuma del comercio local hacia plataformas offshore.'
  },
  {
    id: 'eco_awareness',
    name: 'Conciencia Ecológica Comunitaria',
    icon: '🌿',
    category: 'Medio Ambiente',
    description: 'Hábitos colectivos de sobriedad energética, reparación y consumo de proximidad en cooperativas de barrio.',
    enabled: false,
    intensity: 60,
    impacts: {
      productivityFactor: 0.05,
      healthFactor: 0.14,             // Mejor calidad de vida y aire
      protestSensitivity: 0.20,       // Mayor exigencia a políticas ambientales
      consumptionPropensity: -0.08,   // Menor consumo superfluo
      capitalFlightRate: -0.10        // Prioridad total al producto local
    },
    takeaway: 'Menos dependencia energética exterior y mayor resiliencia comunitaria.'
  }
];

/**
 * Carga los rasgos sociales desde localStorage o devuelve los valores por defecto.
 */
export function loadSocialTraits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SOCIAL_TRAITS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SOCIAL_TRAITS;
  } catch (e) {
    console.error('Error al cargar rasgos sociales:', e);
    return DEFAULT_SOCIAL_TRAITS;
  }
}

/**
 * Guarda la lista de rasgos en localStorage.
 */
export function saveSocialTraits(traits) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(traits));
  } catch (e) {
    console.error('Error al guardar rasgos sociales:', e);
  }
}

/**
 * Calcula los efectos agregados combinados de todos los rasgos activos según su intensidad.
 */
export function calculateAggregateTraitEffects(traits = []) {
  let prodMod = 0;
  let healthMod = 0;
  let protestMod = 0;
  let consumptionMod = 0;
  let capitalFlightMod = 0;
  let activeCount = 0;

  traits.forEach(t => {
    if (!t.enabled) return;
    activeCount++;
    const weight = (t.intensity ?? 50) / 100;

    prodMod += (t.impacts?.productivityFactor || 0) * weight;
    healthMod += (t.impacts?.healthFactor || 0) * weight;
    protestMod += (t.impacts?.protestSensitivity || 0) * weight;
    consumptionMod += (t.impacts?.consumptionPropensity || 0) * weight;
    capitalFlightMod += (t.impacts?.capitalFlightRate || 0) * weight;
  });

  return {
    activeCount,
    // Multiplicador de productividad empresarial (base 1.0)
    productivityMultiplier: Math.max(0.5, Math.min(2.0, 1.0 + prodMod)),
    // Ajuste de salud por tick (-10 a +10)
    healthBonusPerTick: healthMod * 10,
    // Multiplicador de probabilidad de protesta (base 1.0)
    protestSensitivityMultiplier: Math.max(0.2, Math.min(2.5, 1.0 + protestMod)),
    // Ajuste a la propensión marginal al consumo (-0.2 a +0.2)
    consumptionPropensityDelta: Math.max(-0.25, Math.min(0.25, consumptionMod)),
    // Tasa de fuga de capital digital hacia el exterior (0% a 40%)
    capitalFlightRate: Math.max(0, Math.min(0.40, capitalFlightMod)),
    // Impacto estimado en el PIB nacional en % (-10% a +10%)
    estimatedGdpImpactPct: (prodMod * 0.8 + consumptionMod * 0.2) * 100
  };
}

/**
 * Exporta los rasgos sociales a una cadena JSON lista para compartir o descargar.
 */
export function exportTraitsToJson(traits) {
  return JSON.stringify({
    version: '1.0',
    timestamp: Date.now(),
    type: 'bigNumbers_social_traits_pack',
    traits
  }, null, 2);
}

/**
 * Importa y valida rasgos sociales desde un JSON.
 */
export function importTraitsFromJson(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.traits || !Array.isArray(data.traits)) {
      throw new Error('Formato inválido: falta la clave "traits".');
    }
    return data.traits;
  } catch (e) {
    console.error('Error al importar rasgos:', e);
    return null;
  }
}
