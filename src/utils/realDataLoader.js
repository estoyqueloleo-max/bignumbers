/**
 * realDataLoader.js
 *
 * Motor de carga de datos reales macroeconómicos.
 * Estrategia: API real → caché localStorage → fallback estático (siempre funciona).
 *
 * APIs intentadas (orden de prioridad):
 *   1. Eurostat (CORS abierto, JSON)
 *   2. datos.gob.es CKAN (CORS abierto)
 *   3. [Fallback] spainDataCatalog.js (hardcoded, offline-first)
 */

import { SPAIN_DATA, AVAILABLE_YEARS, convertToGameState } from './spainDataCatalog';

const CACHE_KEY_PREFIX = 'bigNumbers_realData_v1_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const FETCH_TIMEOUT_MS = 4000;

// ─────────────────────────────────────────────────────────────────────────────
// CACHÉ
// ─────────────────────────────────────────────────────────────────────────────

function getCachedData(year, country = 'spain') {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${country}_${year}`);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${country}_${year}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedData(year, data, country = 'spain') {
  try {
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${country}_${year}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // localStorage lleno — ignorar
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH CON TIMEOUT
// ─────────────────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EUROSTAT — Población España (demo_gind, dataset)
// Código: demo_pjan (población 1 enero), geo=ES
// ─────────────────────────────────────────────────────────────────────────────
async function fetchPopulationFromEurostat(year) {
  const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_pjan?geo=ES&time=${year}&sex=T&age=TOTAL&format=JSON&lang=EN`;
  const json = await fetchWithTimeout(url);
  const values = Object.values(json?.value || {});
  if (values.length === 0) throw new Error('No population data from Eurostat');
  return values[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// EUROSTAT — Deuda pública (gov_10dd_edpt1, % PIB y valor)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchDebtPctFromEurostat(year) {
  const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/gov_10dd_edpt1?geo=ES&time=${year}&na_item=GD&unit=PC_GDP&sector=S13&format=JSON&lang=EN`;
  const json = await fetchWithTimeout(url);
  const values = Object.values(json?.value || {});
  if (values.length === 0) throw new Error('No debt data from Eurostat');
  return values[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// EUROSTAT — PIB nominal (nama_10_gdp, B1GQ en millones EUR)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchGdpFromEurostat(year) {
  const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nama_10_gdp?geo=ES&time=${year}&na_item=B1GQ&unit=CP_MEUR&format=JSON&lang=EN`;
  const json = await fetchWithTimeout(url);
  const values = Object.values(json?.value || {});
  if (values.length === 0) throw new Error('No GDP data from Eurostat');
  return values[0] * 1_000_000; // millones → euros
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADER PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carga los datos del año dado para España.
 * Retorna: { data, source: 'api'|'cache'|'static', year }
 *
 * data es el objeto del catálogo estático, potencialmente enriquecido con datos de API.
 */
export async function fetchSpainDataForYear(year) {
  if (!AVAILABLE_YEARS.includes(year)) {
    throw new Error(`Año ${year} no disponible. Años válidos: ${AVAILABLE_YEARS.join(', ')}`);
  }

  // 1. Intentar caché
  const cached = getCachedData(year);
  if (cached) {
    return { data: cached, source: 'cache', year };
  }

  // 2. Partir del catálogo estático (siempre disponible)
  const staticData = { ...SPAIN_DATA[year] };

  // 3. Intentar enriquecer con APIs reales en paralelo (best-effort)
  let apiSource = false;
  try {
    const [population, gdp, debtPct] = await Promise.allSettled([
      fetchPopulationFromEurostat(year),
      fetchGdpFromEurostat(year),
      fetchDebtPctFromEurostat(year),
    ]);

    let enriched = { ...staticData };

    if (population.status === 'fulfilled' && population.value > 0) {
      enriched.population = {
        ...staticData.population,
        value: population.value,
        source: 'Eurostat API (demo_pjan)',
        url: 'https://ec.europa.eu/eurostat/databrowser/view/demo_pjan',
        live: true,
      };
      apiSource = true;
    }

    if (gdp.status === 'fulfilled' && gdp.value > 0) {
      enriched.gdp = {
        ...staticData.gdp,
        value: gdp.value,
        source: 'Eurostat API (nama_10_gdp)',
        url: 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp',
        live: true,
      };
      // Recalcular PIB per cápita si tenemos ambos datos
      const pop = enriched.population.value;
      if (pop > 0) {
        enriched.gdpPerCapita = {
          ...staticData.gdpPerCapita,
          value: Math.round(gdp.value / pop),
          source: 'Derivado de Eurostat API (PIB ÷ población)',
          live: true,
        };
      }
      apiSource = true;
    }

    if (debtPct.status === 'fulfilled' && debtPct.value > 0) {
      enriched.publicDebtPctGdp = {
        ...staticData.publicDebtPctGdp,
        value: debtPct.value,
        source: 'Eurostat API (gov_10dd_edpt1)',
        url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1',
        live: true,
      };
      // Recalcular deuda absoluta si tenemos PIB
      if (enriched.gdp?.value > 0) {
        enriched.publicDebt = {
          ...staticData.publicDebt,
          value: Math.round((debtPct.value / 100) * enriched.gdp.value),
          source: 'Derivado de Eurostat API (Deuda%PIB × PIB)',
          live: true,
        };
      }
      apiSource = true;
    }

    setCachedData(year, enriched);
    return { data: enriched, source: apiSource ? 'api' : 'static', year };

  } catch {
    // Si todo falla, usar el catálogo estático
    return { data: staticData, source: 'static', year };
  }
}

/**
 * Convierte los datos cargados al formato de estado inicial del juego.
 */
export { convertToGameState, AVAILABLE_YEARS };

export { MIN_YEAR, MAX_YEAR, DEFAULT_YEAR } from './spainDataCatalog';
