/**
 * Catálogo de Datos Reales — España (2010–2024)
 *
 * Cada entrada por año contiene las cifras macroeconómicas reales con metadatos
 * completos de fuente, para que el DataCatalog pueda mostrar documentación viva.
 *
 * Estructura de cada campo:
 *   value      → número en unidades base (€ o personas)
 *   source     → nombre de la institución fuente
 *   url        → URL de la fuente original
 *   description → explicación del dato
 *   usedIn     → array de componentes del simulador que usan este dato
 *
 * Fuentes principales:
 *   - INE: https://www.ine.es
 *   - Banco de España: https://www.bde.es
 *   - IGAE / MinHacienda: https://www.igae.pap.hacienda.gob.es
 *   - Eurostat: https://ec.europa.eu/eurostat
 *   - datos.gob.es: https://datos.gob.es
 */

// ─────────────────────────────────────────────────────────────────────────────
// METADATOS DE CAMPOS
// Descripción canónica de cada variable del juego, independiente del año
// ─────────────────────────────────────────────────────────────────────────────
export const FIELD_METADATA = {
  population: {
    label: 'Población',
    icon: '👥',
    unit: 'personas',
    description: 'Población residente en España a 1 de enero del año indicado.',
    usedIn: ['HUD', 'StatsPanel', 'useGameLoop (cálculo de ingresos y gastos per cápita)'],
  },
  gdp: {
    label: 'PIB (Producto Interior Bruto)',
    icon: '📈',
    unit: '€',
    description: 'Valor de mercado de todos los bienes y servicios producidos en España en el año.',
    usedIn: ['StatsPanel (referencia de escala)', 'DataCatalogModal'],
  },
  publicDebt: {
    label: 'Deuda Pública Total',
    icon: '💳',
    unit: '€',
    description: 'Deuda de las Administraciones Públicas en términos del Protocolo de Déficit Excesivo (PDE).',
    usedIn: ['useGameLoop → state.debt', 'HUD', 'StatsPanel', 'HistoryChart'],
  },
  publicDebtPctGdp: {
    label: 'Deuda / PIB',
    icon: '📊',
    unit: '%',
    description: 'Ratio de deuda pública sobre PIB, indicador clave de sostenibilidad fiscal.',
    usedIn: ['StatsPanel (badge de deuda)', 'DataCatalogModal'],
  },
  taxRevenue: {
    label: 'Recaudación Tributaria (Ingresos del Estado)',
    icon: '🏛️',
    unit: '€/año',
    description: 'Ingresos no financieros de las Administraciones Públicas (impuestos + cotizaciones + tasas).',
    usedIn: ['useGameLoop → state.treasury (valor inicial)', 'MinistriesPanel', 'MoneyFlowSankey'],
  },
  publicSpending: {
    label: 'Gasto Público Total',
    icon: '💸',
    unit: '€/año',
    description: 'Gasto total consolidado de las Administraciones Públicas.',
    usedIn: ['useGameLoop → baseExpensePerCapita (derivado)', 'MinistriesPanel', 'MoneyFlowSankey'],
  },
  debtInterestPayments: {
    label: 'Intereses de la Deuda (Carga Financiera)',
    icon: '📉',
    unit: '€/año',
    description: 'Pagos por intereses de la deuda pública en el año. Se usa como gasto fijo.',
    usedIn: ['useGameLoop → state.fixedExpenses', 'StatsPanel (debtInterest)', 'HistoryChart'],
  },
  deficit: {
    label: 'Déficit / Superávit Público',
    icon: '⚖️',
    unit: '€/año',
    description: 'Diferencia entre ingresos y gastos públicos. Negativo = déficit, positivo = superávit.',
    usedIn: ['StatsPanel (cashFlow)', 'DataCatalogModal'],
  },
  gdpPerCapita: {
    label: 'PIB per cápita',
    icon: '💰',
    unit: '€/persona/año',
    description: 'PIB dividido entre la población. Indicador de renta media por habitante.',
    usedIn: ['useGameLoop → baseIncomePerCapita (derivado ÷ 12)', 'DataCatalogModal'],
  },
  unemploymentRate: {
    label: 'Tasa de Desempleo',
    icon: '📉',
    unit: '%',
    description: 'Porcentaje de la población activa en situación de desempleo (EPA, INE).',
    usedIn: ['DataCatalogModal', 'StatsPanel', 'useGameLoop (paro dinámico y subsidios)'],
  },
  generalServices: {
    label: 'Servicios Públicos Generales (GF01)',
    icon: '⚖️',
    unit: '€/año',
    description: 'Administración tributaria (AEAT), justicia y diplomacia (~5-7% del gasto total). Influye en la eficacia recaudadora y control del fraude.',
    usedIn: ['DataCatalogModal (referencia institucional)'],
  },
  euFunds: {
    label: 'Fondos Next Generation EU (NGEU)',
    icon: '🇪🇺',
    unit: '€/mes',
    description: 'Transferencias no reembolsables de la UE (2021-2024) para recuperación post-pandemia y transición verde/digital.',
    usedIn: ['useGameLoop → state.fixedIncome', 'StatsPanel', 'MoneyFlowSankey'],
  },
  ministryBreakdown: {
    label: 'Desglose del Gasto por Función (COFOG)',
    icon: '🏛️',
    unit: '€/año',
    description: 'Gasto público desagregado por función COFOG (Eurostat gov_10a_exp). Mapea a los 5 ministerios del simulador: Sanidad (GF07), I+D+Educación (GF08+GF09), Infraestructuras (GF04), Seguridad/Defensa (GF02+GF03) y Bienestar y Pensiones (GF10, ~40-46%).',
    usedIn: ['useGameLoop → state.ministryAllocations (5 sliders reales)', 'MinistriesPanel (sliders inician en valores reales)', 'YearPickerModal (gráfico de barras COFOG)'],
  },
  civilServantWages: {
    label: 'Remuneración de Asalariados Públicos',
    icon: '👔',
    unit: '€/año',
    description: 'Masa salarial total pagada a empleados públicos (funcionarios y laborales). Fuente: IGAE Contabilidad Nacional, Cuentas de las AAPP, tabla D.1 (Remuneración de asalariados). Equivale al ~26-28% del gasto público total. Incluye sueldos + cotizaciones sociales de los empleados públicos. Desglosado por función: sanidad, educación, defensa, administración general y justicia.',
    usedIn: ['ABMVisualizerModal → Deuda Lab (desglose por sub-cohort)', 'abmEngine → calibración salarial de public_worker', 'DataCatalogModal'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// METADATOS COFOG — mapeo de funciones de gobierno a cubos del juego
// Fuente: Eurostat gov_10a_exp (COFOG Classification of Functions of Government)
// ─────────────────────────────────────────────────────────────────────────────
export const COFOG_BUCKETS = {
  social: {
    label: 'Bienestar y Pensiones',
    icon: '🤝',
    color: '#ec4899',
    cofogCodes: ['GF10'],
    cofogLabel: 'Social Protection (GF10) — Pensiones, Desempleo y Asistencia',
    gameKey: 'social',
  },
  health: {
    label: 'Sanidad',
    icon: '❤️',
    color: '#10b981',
    cofogCodes: ['GF07'],
    cofogLabel: 'Health (GF07)',
    gameKey: 'health',
  },
  rd: {
    label: 'Educación e I+D',
    icon: '🔬',
    color: '#38bdf8',
    cofogCodes: ['GF08', 'GF09'],
    cofogLabel: 'Recreation/Culture (GF08) + Education (GF09)',
    gameKey: 'rd',
  },
  infra: {
    label: 'Infraestructura',
    icon: '🏗️',
    color: '#f59e0b',
    cofogCodes: ['GF04'],
    cofogLabel: 'Economic Affairs / Transport (GF04)',
    gameKey: 'infra',
  },
  security: {
    label: 'Defensa y Seguridad',
    icon: '🛡️',
    color: '#a78bfa',
    cofogCodes: ['GF02', 'GF03'],
    cofogLabel: 'Defence (GF02) + Public Order (GF03)',
    gameKey: 'security',
  },
};

/**
 * Normaliza los valores COFOG a porcentajes del gasto en los 5 cubos del juego.
 * @param {object} breakdown - { health, rd, infra, security, social } en €
 * @returns {{ social, health, rd, infra, security }} porcentajes normalizados (suman 100)
 */
export function normalizeCOFOGToGameAllocations(breakdown) {
  const getVal = (item) => (item ? (typeof item === 'object' ? item.value || 0 : item) : 0);
  const social = getVal(breakdown.social);
  const health = getVal(breakdown.health);
  const rd = getVal(breakdown.rd);
  const infra = getVal(breakdown.infra);
  const security = getVal(breakdown.security);

  const total = social + health + rd + infra + security;
  if (total === 0) return { social: 40, health: 20, rd: 15, infra: 15, security: 10 };

  const rawSoc = Math.round((social / total) * 100);
  const rawH = Math.round((health / total) * 100);
  const rawR = Math.round((rd / total) * 100);
  const rawI = Math.round((infra / total) * 100);
  // Ajuste en security para cuadrar exactamente al 100%
  const rawS = 100 - (rawSoc + rawH + rawR + rawI);

  return {
    social: rawSoc,
    health: rawH,
    rd: rawR,
    infra: rawI,
    security: Math.max(1, rawS),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DATOS POR AÑO
// ─────────────────────────────────────────────────────────────────────────────
export const SPAIN_DATA = {
  2010: {
    year: 2010,
    notes: 'Inicio de la crisis de deuda soberana europea. Rescate bancario inminente.',
    population: { value: 47021031, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1080913000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp/default/table?lang=en' },
    publicDebt: { value: 649259000000, source: 'Banco de España / BDE', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 60.1, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1/default/table' },
    taxRevenue: { value: 360000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas' },
    publicSpending: { value: 483000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas' },
    debtInterestPayments: { value: 22000000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -101000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 22983, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 19.9, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    // Remuneración de asalariados públicos — IGAE Contabilidad Nacional AAPP (tabla D.1)
    // Fuente: https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 115800000000, pct: 24.0 }, // Total masa salarial pública
      // Desglose por función (estimado por pesos relativos de empleo público INE)
      byFunction: {
        health:    { value: 30500000000, pct: 26.3, workers: 528000, avgMonthly: 2100 }, // Sanidad (médicos, enfermeros)
        education: { value: 37200000000, pct: 32.1, workers: 640000, avgMonthly: 2000 }, // Educación (docentes)
        defense:   { value: 10800000000, pct:  9.3, workers: 186000, avgMonthly: 2100 }, // FFAA + GC + PN
        admin:     { value: 24100000000, pct: 20.8, workers: 420000, avgMonthly: 1960 }, // Admin General del Estado
        justice:   { value:  8200000000, pct:  7.1, workers: 52000,  avgMonthly: 2800 }, // Jueces y letrados
        other:     { value:  5000000000, pct:  4.3, workers: 74000,  avgMonthly: 1850 }, // Resto AAPP
      },
      totalWorkers: 1900000, // Empleados públicos España 2010 (INE, Encuesta de Empleo Público)
    },
    // Desglose COFOG — Eurostat gov_10a_exp, valores en M€ (aprox.)
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)',
      url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en&category=gov_10a',
      health:   { value: 65900000000,  pct: 13.6 },  // GF07 Sanidad
      rd:       { value: 61500000000,  pct: 12.7 },  // GF08+GF09 Cultura+Educación
      infra:    { value: 55300000000,  pct: 11.4 },  // GF04 Infraestructura
      security: { value: 28900000000,  pct:  6.0 },  // GF02+GF03 Defensa+Seguridad
      social:   { value: 196000000000, pct: 40.6 },  // GF10 Protección Social (ref.)
    },
  },
  2011: {
    year: 2011,
    notes: 'Segunda recesión. Prima de riesgo española supera los 400 puntos básicos.',
    population: { value: 47190493, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1070413000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 743530000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 69.5, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 366000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 481000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 27000000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -102000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 22686, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 21.4, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 116500000000, pct: 24.2 },
      byFunction: {
        health:    { value: 30800000000, pct: 26.4, workers: 530000, avgMonthly: 2100 },
        education: { value: 37500000000, pct: 32.2, workers: 645000, avgMonthly: 2000 },
        defense:   { value: 10900000000, pct:  9.4, workers: 187000, avgMonthly: 2100 },
        admin:     { value: 24200000000, pct: 20.8, workers: 420000, avgMonthly: 1970 },
        justice:   { value:  8100000000, pct:  7.0, workers: 52000,  avgMonthly: 2800 },
        other:     { value:  5000000000, pct:  4.3, workers: 74000,  avgMonthly: 1850 },
      },
      totalWorkers: 1908000,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 64800000000, pct: 13.5 },
      rd:       { value: 60100000000, pct: 12.5 },
      infra:    { value: 48600000000, pct: 10.1 },
      security: { value: 28700000000, pct:  6.0 },
      social:   { value: 196000000000, pct: 40.7 },
    },
  },
  2012: {
    year: 2012,
    notes: 'Rescate bancario europeo de 41.300 M€. Máximo de la crisis del euro.',
    population: { value: 47265321, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1039758000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 890726000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 85.7, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 370000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 476000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 30000000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -110000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 22005, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 24.8, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 113600000000, pct: 23.9 }, // Recortes salariales Decreto 20/2012
      byFunction: {
        health:    { value: 29200000000, pct: 25.7, workers: 510000, avgMonthly: 1950 }, // Recortes sanidad
        education: { value: 36600000000, pct: 32.2, workers: 630000, avgMonthly: 1980 }, // Recortes educación
        defense:   { value: 10400000000, pct:  9.2, workers: 183000, avgMonthly: 2050 },
        admin:     { value: 23800000000, pct: 20.9, workers: 415000, avgMonthly: 1950 },
        justice:   { value:  7900000000, pct:  7.0, workers: 51000,  avgMonthly: 2650 },
        other:     { value:  5700000000, pct:  5.0, workers: 76000,  avgMonthly: 1700 },
      },
      totalWorkers: 1865000, // Reducción por congelación de empleo público
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 62400000000, pct: 13.1 },  // Recortes sanitarios (-6%)
      rd:       { value: 55200000000, pct: 11.6 },  // Recortes en educación
      infra:    { value: 37800000000, pct:  7.9 },  // Fuerte caída en obra pública
      security: { value: 27400000000, pct:  5.8 },  // Recortes defensa
      social:   { value: 200000000000, pct: 42.0 }, // Sube por paro y subsidios
    },
  },
  2013: {
    year: 2013,
    notes: 'Pico histórico de desempleo: 26%. Inicio de la recuperación en el último trimestre.',
    population: { value: 46727890, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1025634000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 966130000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 95.8, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 374000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 455000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 36000000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -71000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 21950, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 26.1, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 112000000000, pct: 24.6 }, // Pico austeridad: sueldos congelados
      byFunction: {
        health:    { value: 28800000000, pct: 25.7, workers: 505000, avgMonthly: 1940 },
        education: { value: 36100000000, pct: 32.2, workers: 625000, avgMonthly: 1970 },
        defense:   { value: 10200000000, pct:  9.1, workers: 181000, avgMonthly: 2020 },
        admin:     { value: 23500000000, pct: 21.0, workers: 412000, avgMonthly: 1940 },
        justice:   { value:  7700000000, pct:  6.9, workers: 50000,  avgMonthly: 2620 },
        other:     { value:  5700000000, pct:  5.1, workers: 75000,  avgMonthly: 1730 },
      },
      totalWorkers: 1848000,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 61800000000, pct: 13.6 },  // Estabilización recortes
      rd:       { value: 52000000000, pct: 11.4 },
      infra:    { value: 32600000000, pct:  7.2 },  // Mínimo histórico infraestructuras
      security: { value: 26200000000, pct:  5.8 },
      social:   { value: 194000000000, pct: 42.6 }, // Pico protección social
    },
  },
  2014: {
    year: 2014,
    notes: 'Recuperación consolidada. Vuelta al crecimiento positivo del PIB (+1.4%).',
    population: { value: 46480879, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1041160000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 1034114000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 100.4, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 391000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 455000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 35900000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -63000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 22400, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 24.5, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 112800000000, pct: 24.8 },
      byFunction: {
        health:    { value: 29000000000, pct: 25.7, workers: 507000, avgMonthly: 1950 },
        education: { value: 36300000000, pct: 32.2, workers: 627000, avgMonthly: 1975 },
        defense:   { value: 10300000000, pct:  9.1, workers: 182000, avgMonthly: 2030 },
        admin:     { value: 23600000000, pct: 20.9, workers: 413000, avgMonthly: 1945 },
        justice:   { value:  7800000000, pct:  6.9, workers: 50500,  avgMonthly: 2640 },
        other:     { value:  5800000000, pct:  5.1, workers: 75500,  avgMonthly: 1740 },
      },
      totalWorkers: 1855000,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 62500000000, pct: 13.7 },
      rd:       { value: 52800000000, pct: 11.6 },
      infra:    { value: 35100000000, pct:  7.7 },  // Leve recuperación
      security: { value: 26900000000, pct:  5.9 },
      social:   { value: 190000000000, pct: 41.8 },
    },
  },
  2015: {
    year: 2015,
    notes: 'Expansión sólida (+3.8% PIB real). Primera aprobación de PGE en 3 años.',
    population: { value: 46449565, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1080788000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 1073510000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 99.3, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 420000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 460000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 33600000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -55000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 23270, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 22.1, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 114200000000, pct: 24.8 }, // Leve recuperación salarial
      byFunction: {
        health:    { value: 29400000000, pct: 25.7, workers: 513000, avgMonthly: 1960 },
        education: { value: 36700000000, pct: 32.1, workers: 633000, avgMonthly: 1980 },
        defense:   { value: 10500000000, pct:  9.2, workers: 183000, avgMonthly: 2060 },
        admin:     { value: 23800000000, pct: 20.8, workers: 415000, avgMonthly: 1955 },
        justice:   { value:  7900000000, pct:  6.9, workers: 51000,  avgMonthly: 2655 },
        other:     { value:  5900000000, pct:  5.2, workers: 76000,  avgMonthly: 1760 },
      },
      totalWorkers: 1871000,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 63700000000, pct: 13.8 },
      rd:       { value: 54200000000, pct: 11.8 },
      infra:    { value: 37500000000, pct:  8.2 },
      security: { value: 27600000000, pct:  6.0 },
      social:   { value: 192000000000, pct: 41.7 },
    },
  },
  2016: {
    year: 2016,
    notes: 'España creció un 3.2% pese a 10 meses sin gobierno en funciones.',
    population: { value: 46445828, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1118522000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 1107214000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 99.0, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 435000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 466000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 31900000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -49000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 24080, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 19.6, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 116400000000, pct: 25.0 },
      byFunction: {
        health:    { value: 30000000000, pct: 25.8, workers: 522000, avgMonthly: 1970 },
        education: { value: 37400000000, pct: 32.1, workers: 638000, avgMonthly: 1990 },
        defense:   { value: 10700000000, pct:  9.2, workers: 184000, avgMonthly: 2090 },
        admin:     { value: 24200000000, pct: 20.8, workers: 418000, avgMonthly: 1970 },
        justice:   { value:  8000000000, pct:  6.9, workers: 51500,  avgMonthly: 2660 },
        other:     { value:  6100000000, pct:  5.2, workers: 77000,  avgMonthly: 1800 },
      },
      totalWorkers: 1890500,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 64800000000, pct: 13.9 },
      rd:       { value: 55600000000, pct: 11.9 },
      infra:    { value: 40200000000, pct:  8.6 },
      security: { value: 28300000000, pct:  6.1 },
      social:   { value: 192500000000, pct: 41.3 },
    },
  },
  2017: {
    year: 2017,
    notes: 'Crecimiento del 3.0%. Crisis política catalana en octubre no afectó el PIB anual.',
    population: { value: 46527039, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1163662000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 1144728000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 98.3, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 460000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 478000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 31100000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -35000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 25000, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 17.2, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 119000000000, pct: 24.9 },
      byFunction: {
        health:    { value: 30700000000, pct: 25.8, workers: 530000, avgMonthly: 1980 },
        education: { value: 38200000000, pct: 32.1, workers: 645000, avgMonthly: 2020 },
        defense:   { value: 10900000000, pct:  9.2, workers: 185000, avgMonthly: 2120 },
        admin:     { value: 24800000000, pct: 20.8, workers: 421000, avgMonthly: 2005 },
        justice:   { value:  8200000000, pct:  6.9, workers: 52000,  avgMonthly: 2700 },
        other:     { value:  6200000000, pct:  5.2, workers: 77500,  avgMonthly: 1820 },
      },
      totalWorkers: 1910500,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 66200000000, pct: 13.8 },
      rd:       { value: 57100000000, pct: 11.9 },
      infra:    { value: 43800000000, pct:  9.2 },
      security: { value: 29300000000, pct:  6.1 },
      social:   { value: 197000000000, pct: 41.2 },
    },
  },
  2018: {
    year: 2018,
    notes: 'Crecimiento sostenido +2.4%. Moción de censura en junio. Presupuestos prorrogados.',
    population: { value: 46722980, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1202193000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 1173161000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 97.6, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 479000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 496000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 30400000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -30000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 25730, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 15.3, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 121800000000, pct: 24.6 },
      byFunction: {
        health:    { value: 31400000000, pct: 25.8, workers: 538000, avgMonthly: 1995 },
        education: { value: 39100000000, pct: 32.1, workers: 653000, avgMonthly: 2040 },
        defense:   { value: 11200000000, pct:  9.2, workers: 186000, avgMonthly: 2160 },
        admin:     { value: 25400000000, pct: 20.8, workers: 424000, avgMonthly: 2040 },
        justice:   { value:  8400000000, pct:  6.9, workers: 52500,  avgMonthly: 2730 },
        other:     { value:  6300000000, pct:  5.2, workers: 78000,  avgMonthly: 1840 },
      },
      totalWorkers: 1931500,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 68500000000, pct: 13.8 },
      rd:       { value: 58800000000, pct: 11.9 },
      infra:    { value: 47100000000, pct:  9.5 },
      security: { value: 30600000000, pct:  6.2 },
      social:   { value: 203000000000, pct: 40.9 },
    },
  },
  2019: {
    year: 2019,
    notes: 'Último año pre-COVID. Economía estable +2.1%. Dos elecciones generales.',
    population: { value: 47026208, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1244757000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 1188863000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 95.5, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 490000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 514000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 28900000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -35000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 26440, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 14.1, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 124600000000, pct: 24.2 }, // Pre-COVID: último año normalidad
      byFunction: {
        health:    { value: 32100000000, pct: 25.8, workers: 545000, avgMonthly: 2010 },
        education: { value: 40000000000, pct: 32.1, workers: 661000, avgMonthly: 2060 },
        defense:   { value: 11500000000, pct:  9.2, workers: 187000, avgMonthly: 2220 },
        admin:     { value: 26000000000, pct: 20.9, workers: 426000, avgMonthly: 2080 },
        justice:   { value:  8600000000, pct:  6.9, workers: 53000,  avgMonthly: 2760 },
        other:     { value:  6400000000, pct:  5.1, workers: 78500,  avgMonthly: 1850 },
      },
      totalWorkers: 1950500,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 70200000000, pct: 13.7 },
      rd:       { value: 60800000000, pct: 11.8 },
      infra:    { value: 49600000000, pct:  9.7 },
      security: { value: 31100000000, pct:  6.1 },
      social:   { value: 212000000000, pct: 41.2 },
    },
  },
  2020: {
    year: 2020,
    notes: 'Pandemia COVID-19. Caída del PIB del -10.8%, la mayor desde la Guerra Civil.',
    population: { value: 47351567, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1112176000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 1344832000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 120.0, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 450000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 570000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 25800000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -128000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 23480, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 15.5, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 133500000000, pct: 23.4 }, // COVID: subida por refuerzo sanidad + teletrabajo AAPP
      byFunction: {
        health:    { value: 37800000000, pct: 28.3, workers: 572000, avgMonthly: 2250 }, // +5% refuerzo COVID
        education: { value: 40600000000, pct: 30.4, workers: 663000, avgMonthly: 2075 }, // Clases online
        defense:   { value: 11800000000, pct:  8.8, workers: 188000, avgMonthly: 2260 },
        admin:     { value: 27500000000, pct: 20.6, workers: 430000, avgMonthly: 2170 },
        justice:   { value:  9000000000, pct:  6.7, workers: 53500,  avgMonthly: 2850 },
        other:     { value:  6800000000, pct:  5.1, workers: 79500,  avgMonthly: 1940 },
      },
      totalWorkers: 1986000,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 85400000000, pct: 15.0 },  // Boom sanitario COVID: hospitales, vacunas, ERTE sanidad
      rd:       { value: 60600000000, pct: 10.6 },
      infra:    { value: 38200000000, pct:  6.7 },  // Caída por paralización de obra pública
      security: { value: 30800000000, pct:  5.4 },
      social:   { value: 264000000000, pct: 46.3 }, // Pico histórico: ERTE, IMV, subsidios
    },
  },
  2021: {
    year: 2021,
    notes: 'Recuperación parcial +5.5% PIB. Fondos NGEU (Plan de Recuperación UE) activos.',
    population: { value: 47398695, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1205451000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 1427403000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 118.4, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 500000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 545000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 25700000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -75000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 25440, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 14.8, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 135200000000, pct: 24.8 },
      byFunction: {
        health:    { value: 37100000000, pct: 27.4, workers: 567000, avgMonthly: 2230 },
        education: { value: 41300000000, pct: 30.5, workers: 667000, avgMonthly: 2105 },
        defense:   { value: 12000000000, pct:  8.9, workers: 189000, avgMonthly: 2285 },
        admin:     { value: 28200000000, pct: 20.9, workers: 432000, avgMonthly: 2220 },
        justice:   { value:  9200000000, pct:  6.8, workers: 54000,  avgMonthly: 2890 },
        other:     { value:  7400000000, pct:  5.5, workers: 80000,  avgMonthly: 1990 },
      },
      totalWorkers: 1989000,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 78300000000, pct: 14.4 },
      rd:       { value: 63100000000, pct: 11.6 },  // NGEU: fondos europeos en I+D
      infra:    { value: 52700000000, pct:  9.7 },  // NGEU: grandes inversiones infraestructura
      security: { value: 31500000000, pct:  5.8 },
      social:   { value: 235000000000, pct: 43.1 },
    },
  },
  2022: {
    year: 2022,
    notes: 'Inflación 8.4% (máximo en 40 años). Impacto energético guerra Ucrania. PIB +5.8%.',
    population: { value: 47615034, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1327446000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 1502000000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 113.2, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 553000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 569000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 28300000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -37000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 27880, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 13.0, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 138700000000, pct: 24.4 }, // Subida 3.5% salarial AAPP (acuerdo sindicatos)
      byFunction: {
        health:    { value: 37900000000, pct: 27.3, workers: 572000, avgMonthly: 2260 },
        education: { value: 42400000000, pct: 30.6, workers: 673000, avgMonthly: 2150 },
        defense:   { value: 12300000000, pct:  8.9, workers: 190000, avgMonthly: 2340 },
        admin:     { value: 29000000000, pct: 20.9, workers: 435000, avgMonthly: 2270 },
        justice:   { value:  9500000000, pct:  6.8, workers: 54500,  avgMonthly: 2955 },
        other:     { value:  7600000000, pct:  5.5, workers: 80500,  avgMonthly: 2025 },
      },
      totalWorkers: 2005000,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 76100000000, pct: 13.4 },
      rd:       { value: 66200000000, pct: 11.6 },
      infra:    { value: 58900000000, pct: 10.4 },  // NGEU en máximos
      security: { value: 33900000000, pct:  6.0 },
      social:   { value: 236000000000, pct: 41.5 },
    },
  },
  2023: {
    year: 2023,
    notes: 'PIB +2.5%, mejor de la zona euro. Inflación controlada al 3.5%. Nuevos PGE prorrogados.',
    population: { value: 48085361, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1418310000000, source: 'INE / Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 1582000000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 107.7, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 590000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 607000000000, source: 'IGAE / MinHacienda', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 31500000000, source: 'Banco de España', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -48000000000, source: 'Eurostat', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 29490, source: 'INE / Eurostat', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 12.0, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 143900000000, pct: 23.7 }, // +3.7% acuerdo plurianual CCOO/UGT-AAPP 2023
      byFunction: {
        health:    { value: 39400000000, pct: 27.4, workers: 578000, avgMonthly: 2320 },
        education: { value: 44000000000, pct: 30.6, workers: 681000, avgMonthly: 2200 },
        defense:   { value: 12800000000, pct:  8.9, workers: 192000, avgMonthly: 2400 },
        admin:     { value: 30100000000, pct: 20.9, workers: 438000, avgMonthly: 2330 },
        justice:   { value:  9800000000, pct:  6.8, workers: 55000,  avgMonthly: 3020 },
        other:     { value:  7800000000, pct:  5.4, workers: 81000,  avgMonthly: 2060 },
      },
      totalWorkers: 2025000,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 80400000000, pct: 13.2 },
      rd:       { value: 70100000000, pct: 11.5 },
      infra:    { value: 62800000000, pct: 10.3 },
      security: { value: 36700000000, pct:  6.0 },  // Ley de Defensa Nacional
      social:   { value: 253000000000, pct: 41.7 },
    },
  },
  2024: {
    year: 2024,
    notes: 'Estimaciones preliminares. PIB ~+2.8%. Deuda/PIB en descenso. Datos parciales IGAE.',
    population: { value: 48592909, source: 'INE', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=2852' },
    gdp: { value: 1500000000000, source: 'INE / Eurostat (preliminar)', url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp' },
    publicDebt: { value: 1620000000000, source: 'Banco de España (est.)', url: 'https://www.bde.es/webbde/es/estadis/infoest/a1702.pdf' },
    publicDebtPctGdp: { value: 103.5, source: 'Eurostat (est.)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    taxRevenue: { value: 620000000000, source: 'IGAE / MinHacienda (avance)', url: 'https://www.igae.pap.hacienda.gob.es' },
    publicSpending: { value: 635000000000, source: 'IGAE / MinHacienda (avance)', url: 'https://www.igae.pap.hacienda.gob.es' },
    debtInterestPayments: { value: 35000000000, source: 'Banco de España (est.)', url: 'https://www.bde.es/webbde/es/estadis/' },
    deficit: { value: -40000000000, source: 'Eurostat (est.)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1' },
    gdpPerCapita: { value: 30870, source: 'INE / Eurostat (preliminar)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=27064' },
    unemploymentRate: { value: 11.4, source: 'INE (EPA)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=4247' },
    civilServantWages: {
      source: 'IGAE / Contabilidad Nacional de las AAPP (est.)',
      url: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/ContabilidadNacional/Estadisticas',
      total: { value: 150000000000, pct: 23.6 }, // Est. +4.2% subida SMI y masa salarial pública
      byFunction: {
        health:    { value: 41100000000, pct: 27.4, workers: 585000, avgMonthly: 2395 },
        education: { value: 45900000000, pct: 30.6, workers: 689000, avgMonthly: 2270 },
        defense:   { value: 13400000000, pct:  8.9, workers: 194000, avgMonthly: 2470 },
        admin:     { value: 31400000000, pct: 20.9, workers: 441000, avgMonthly: 2420 },
        justice:   { value: 10200000000, pct:  6.8, workers: 55500,  avgMonthly: 3120 },
        other:     { value:  8000000000, pct:  5.3, workers: 81500,  avgMonthly: 2110 },
      },
      totalWorkers: 2045500,
    },
    ministryBreakdown: {
      source: 'Eurostat (gov_10a_exp) est.', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
      health:   { value: 83500000000, pct: 13.1 },
      rd:       { value: 73200000000, pct: 11.5 },
      infra:    { value: 65400000000, pct: 10.3 },
      security: { value: 40100000000, pct:  6.3 },  // Objetivo OTAN 2% PIB
      social:   { value: 265000000000, pct: 41.7 },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// AÑOS DISPONIBLES
// ─────────────────────────────────────────────────────────────────────────────
export const AVAILABLE_YEARS = Object.keys(SPAIN_DATA).map(Number).sort((a, b) => a - b);
export const MIN_YEAR = AVAILABLE_YEARS[0];
export const MAX_YEAR = AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];
export const DEFAULT_YEAR = 2019;

// ─────────────────────────────────────────────────────────────────────────────
// LABORATORIO DE DEUDA — Función derivada de métricas para el panel DebtLab
//
// Responde preguntas como:
//   - ¿Cuánto se gasta en sueldos de funcionarios?
//   - ¿Podría España pagar su deuda en 1 año si congelara todo el gasto?
//   - ¿Cuántos años de intereses equivale a la deuda?
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Calcula todas las métricas derivadas del Laboratorio de Deuda para un año dado.
 * @param {number} year - Año del catálogo (ej. 2019)
 * @returns {object} Métricas del DebtLab listas para visualizar
 */
export function getDebtLabData(year) {
  const d = SPAIN_DATA[year];
  if (!d) return null;

  const debt = d.publicDebt.value;
  const gdp = d.gdp.value;
  const spending = d.publicSpending.value;
  const revenue = d.taxRevenue.value;
  const interest = d.debtInterestPayments.value;
  const wages = d.civilServantWages ? d.civilServantWages.total.value : null;
  const bd = d.ministryBreakdown;

  // Partidas del Estado: qué se gasta y cuánto
  const socialSpend = bd ? bd.social.value : spending * 0.41;
  const healthSpend = bd ? bd.health.value : spending * 0.14;
  const rdSpend    = bd ? bd.rd.value    : spending * 0.12;
  const infraSpend = bd ? bd.infra.value : spending * 0.10;
  const secSpend   = bd ? bd.security.value : spending * 0.06;

  // Coste de la deuda: ¿cuántos años de recaudación?
  const debtInYearsOfRevenue = revenue > 0 ? Math.round((debt / revenue) * 10) / 10 : null;
  // ¿Cuántos años de ahorro (superavit total) para pagarla?
  const annualSaving = revenue - spending; // negativo = déficit
  const debtPayoffYears = annualSaving > 0
    ? Math.round((debt / annualSaving) * 10) / 10
    : null; // Imposible con déficit

  // Escenario hipotético: si se congelara todo el gasto (solo intereses quedaran)
  const hypotheticalSurplus = revenue - interest;
  const hypotheticalPayoffYears = hypotheticalSurplus > 0
    ? Math.round((debt / hypotheticalSurplus) * 10) / 10
    : null;

  // ¿Cuántos años de PIB equivale la deuda?
  const debtToGdpPct = gdp > 0 ? Math.round((debt / gdp) * 1000) / 10 : null;

  // Desglose de sueldos por función (para gráficos)
  const wagesByFunction = d.civilServantWages ? d.civilServantWages.byFunction : null;
  const totalWorkers = d.civilServantWages ? d.civilServantWages.totalWorkers : null;
  const avgMonthlyWage = wages && totalWorkers
    ? Math.round(wages / totalWorkers / 12)
    : null;

  // Ranking de partidas (de mayor a menor)
  const partidas = [
    { label: 'Pensiones y Protección Social', icon: '🤝', value: socialSpend, color: '#ec4899' },
    { label: 'Sueldos Funcionarios', icon: '👔', value: wages, color: '#a78bfa' },
    { label: 'Sanidad Pública', icon: '❤️', value: healthSpend, color: '#10b981' },
    { label: 'Educación e I+D', icon: '🔬', value: rdSpend, color: '#38bdf8' },
    { label: 'Infraestructura', icon: '🏗️', value: infraSpend, color: '#f59e0b' },
    { label: 'Defensa y Seguridad', icon: '🛡️', value: secSpend, color: '#64748b' },
    { label: 'Intereses de la Deuda', icon: '📉', value: interest, color: '#ef4444' },
  ].filter(p => p.value !== null).sort((a, b) => b.value - a.value);

  return {
    year,
    debt,
    gdp,
    spending,
    revenue,
    interest,
    wages,
    debtToGdpPct,
    debtInYearsOfRevenue,
    debtPayoffYears,          // null si hay déficit
    hypotheticalPayoffYears,  // años para pagar si solo se pagan intereses
    totalWorkers,
    avgMonthlyWage,
    wagesByFunction,
    partidas,
    // Contexto ABM
    abmPublicWorkerShare: 0.08, // ~8% de la población activa son empleados públicos
    abmCalibration: {
      // Salario base mensual para cada sub-cohort de funcionario (datos reales)
      health:    wagesByFunction ? wagesByFunction.health.avgMonthly : 2200,
      education: wagesByFunction ? wagesByFunction.education.avgMonthly : 2050,
      defense:   wagesByFunction ? wagesByFunction.defense.avgMonthly : 2150,
      admin:     wagesByFunction ? wagesByFunction.admin.avgMonthly : 2000,
      justice:   wagesByFunction ? wagesByFunction.justice.avgMonthly : 2800,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSOR: datos reales → estado inicial del juego
//
// Lógica de conversión:
//   - population       → igual (exacto)
//   - treasury         → taxRevenue / 12 (recaudación mensual como caja inicial)
//   - debt             → publicDebt (exacto)
//   - baseIncomePerCapita → gdpPerCapita / 12 / 1000 (en miles € mensuales por habitante)
//   - baseExpensePerCapita → (publicSpending/population) / 12 / 1000
//   - fixedExpenses    → debtInterestPayments / 12 (intereses mensuales)
//   - fixedIncome      → 0 (se puede ajustar con fondos UE, etc.)
//   - taxRate          → 1.0 (el jugador empieza en tasa nominal)
//   - currency         → '€'
//   - ministryAllocations → calculado desde COFOG real (5 cubos completos incluyendo Protección Social)
//   - unemploymentRate    → tasa de paro real EPA (%)
//   - fixedIncome         → transferencias comunitarias NextGenEU si año >= 2021
// ─────────────────────────────────────────────────────────────────────────────
export const convertToGameState = (yearData) => {
  const pop = yearData.population.value;
  const annualRevenue = yearData.taxRevenue.value;
  const annualSpending = yearData.publicSpending.value;
  const annualInterest = yearData.debtInterestPayments.value;
  const gdpPerCapita = yearData.gdpPerCapita.value;
  const unemployment = yearData.unemploymentRate ? yearData.unemploymentRate.value : 14.0;

  // Ingresos per cápita mensuales (en euros reales, no escalados)
  const monthlyIncomePerCapita = gdpPerCapita / 12;
  // Gastos per cápita mensuales
  const monthlyExpensePerCapita = (annualSpending / pop) / 12;

  // Ratio de impuestos actual: ingresos fiscales / PIB teórico
  const impliedTaxRate = annualRevenue / (pop * gdpPerCapita);
  const baseIncomePerCapita = monthlyIncomePerCapita * impliedTaxRate;

  // Fondos europeos para 2021-2023 (NGEU)
  // España recibió unos ~15.000M€/año en transferencias directas = ~1.250M€/mes
  let fixedIncome = 0;
  if (yearData.year >= 2021 && yearData.year <= 2023) {
    fixedIncome = 1250000000; // 1.250 M€/mes de fondos NextGenEU
  }

  // Asignaciones ministeriales desde COFOG real (5 cubos completos)
  let ministryAllocations = { social: 42, health: 15, rd: 13, infra: 10, security: 6 };
  const bd = yearData.ministryBreakdown;
  if (bd) {
    ministryAllocations = normalizeCOFOGToGameAllocations(bd);
  }

  return {
    population: pop,
    treasury: Math.round(annualRevenue / 12),      // Caja inicial = 1 mes de recaudación
    debt: yearData.publicDebt.value,
    baseIncomePerCapita: Math.round(baseIncomePerCapita * 100) / 100,
    baseExpensePerCapita: Math.round(monthlyExpensePerCapita * 100) / 100,
    fixedIncome,
    fixedExpenses: Math.round(annualInterest / 12), // Intereses mensuales como gasto fijo
    taxRate: 1.0,
    currency: '€',
    month: 1,
    realDataYear: yearData.year,
    realDataSource: 'spain',
    unemploymentRate: unemployment,
    socialPeace: 85,                                // Índice de paz social (0-100)
    ministryAllocations,
    ministryBreakdownSource: bd ? bd.source : null,
  };
};

