/**
 * DataCatalogModal.jsx
 *
 * Catálogo de datos: documentación viva de qué cifra real viene de dónde
 * y cómo se usa en cada componente del simulador.
 *
 * Funciona como una tabla de trazabilidad: Dato → Fuente → URL → Componente del juego.
 */

import React, { useState, useMemo } from 'react';
import { X, ExternalLink, Search, Filter, Download, Database, ChevronDown, ChevronRight } from 'lucide-react';
import { SPAIN_DATA, FIELD_METADATA, AVAILABLE_YEARS, convertToGameState } from '../utils/spainDataCatalog';

// ─── Formateadores ────────────────────────────────────────────────────────────

const fmt = (value, unit) => {
  if (!value && value !== 0) return '—';
  if (unit === 'personas') return value >= 1e6 ? `${(value / 1e6).toFixed(2)} M` : value.toLocaleString('es-ES');
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === '€' || unit === '€/año' || unit === '€/persona/año') {
    const neg = value < 0;
    const abs = Math.abs(value);
    let str = abs >= 1e12 ? `${(abs / 1e12).toFixed(2)} B€` :
               abs >= 1e9  ? `${(abs / 1e9).toFixed(1)} Mil M€` :
               abs >= 1e6  ? `${(abs / 1e6).toFixed(0)} M€` :
               `${abs.toLocaleString('es-ES')} €`;
    return neg ? `-${str}` : str;
  }
  return String(value);
};

// ─── Paleta de colores por campo ──────────────────────────────────────────────

const FIELD_COLORS = {
  population: '#38bdf8',
  gdp: '#a78bfa',
  publicDebt: '#f87171',
  publicDebtPctGdp: '#fb923c',
  taxRevenue: '#34d399',
  publicSpending: '#fbbf24',
  debtInterestPayments: '#f43f5e',
  deficit: '#ef4444',
  gdpPerCapita: '#60a5fa',
  unemploymentRate: '#94a3b8',
  generalServices: '#a855f7',
  euFunds: '#3b82f6',
};

// ─── Sparkline mini-gráfico horizontal ───────────────────────────────────────

function Sparkline({ values, color = '#6366f1', width = 80, height = 24 }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block', flexShrink: 0 }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}

// ─── Fila de dato por año ─────────────────────────────────────────────────────

function DataRow({ fieldKey, meta, data, year, isExpanded, onToggle, color }) {
  if (!data) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${color}22`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Cabecera */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
        }}
      >
        {isExpanded ? <ChevronDown size={14} color="#64748b" /> : <ChevronRight size={14} color="#64748b" />}
        <span style={{ fontSize: '1rem' }}>{meta.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600 }}>{meta.label}</div>
          <div style={{ color: '#64748b', fontSize: '0.65rem' }}>Unidad: {meta.unit}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color, fontSize: '0.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {fmt(data.value, meta.unit)}
          </div>
          <div style={{ color: '#475569', fontSize: '0.6rem' }}>{year}</div>
        </div>
      </button>

      {/* Detalle expandido */}
      {isExpanded && (
        <div style={{
          borderTop: `1px solid ${color}22`,
          padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          background: 'rgba(0,0,0,0.2)',
        }}>
          {/* Fuente */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ color: '#64748b', fontSize: '0.68rem', flexShrink: 0, width: '70px' }}>Fuente:</span>
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#818cf8', fontSize: '0.72rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}
            >
              {data.source}
              <ExternalLink size={11} />
            </a>
          </div>
          {/* Descripción */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ color: '#64748b', fontSize: '0.68rem', flexShrink: 0, width: '70px' }}>Qué es:</span>
            <span style={{ color: '#94a3b8', fontSize: '0.72rem', lineHeight: 1.5 }}>{meta.description}</span>
          </div>
          {/* Usado en */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ color: '#64748b', fontSize: '0.68rem', flexShrink: 0, width: '70px' }}>Usado en:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {meta.usedIn.map((comp, i) => (
                <span key={i} style={{
                  background: `${color}15`, color, border: `1px solid ${color}33`,
                  borderRadius: '4px', padding: '2px 6px', fontSize: '0.62rem',
                }}>
                  {comp}
                </span>
              ))}
            </div>
          </div>
          {/* Indicador live */}
          {data.live && (
            <div style={{ color: '#ef4444', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🔴 Dato obtenido en tiempo real desde la API
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export function DataCatalogModal({ onClose, initialYear = 2023 }) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFields, setExpandedFields] = useState(new Set());
  const [filterComponent, setFilterComponent] = useState('all');

  const yearData = SPAIN_DATA[selectedYear];

  // Serie histórica de valores por campo (para sparklines)
  const historicalSeries = useMemo(() => {
    const series = {};
    Object.keys(FIELD_METADATA).forEach(key => {
      series[key] = AVAILABLE_YEARS.map(y => SPAIN_DATA[y]?.[key]?.value).filter(Boolean);
    });
    return series;
  }, []);

  // Componentes únicos del simulador (para filtro)
  const allComponents = useMemo(() => {
    const comps = new Set();
    Object.values(FIELD_METADATA).forEach(meta => {
      meta.usedIn.forEach(c => comps.add(c.split('(')[0].trim()));
    });
    return ['all', ...Array.from(comps).sort()];
  }, []);

  // Filtrado
  const filteredFields = useMemo(() => {
    return Object.entries(FIELD_METADATA).filter(([key, meta]) => {
      const matchSearch = searchQuery === '' ||
        meta.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meta.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.toLowerCase().includes(searchQuery.toLowerCase());

      const matchComponent = filterComponent === 'all' ||
        meta.usedIn.some(c => c.includes(filterComponent));

      return matchSearch && matchComponent;
    });
  }, [searchQuery, filterComponent]);

  const toggleField = (key) => {
    setExpandedFields(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Exportar como Markdown
  const exportMarkdown = () => {
    const lines = [
      `# Catálogo de Datos Reales — España ${selectedYear}`,
      '',
      `> Generado automáticamente desde el Simulador de Grandes Cifras`,
      `> Año: ${selectedYear}`,
      '',
      '| Campo | Valor | Fuente | URL | Usado en |',
      '|-------|-------|--------|-----|----------|',
    ];
    Object.entries(FIELD_METADATA).forEach(([key, meta]) => {
      const d = yearData?.[key];
      if (!d) return;
      lines.push(`| ${meta.icon} ${meta.label} | ${fmt(d.value, meta.unit)} | ${d.source} | ${d.url} | ${meta.usedIn.join(', ')} |`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datos-reales-espana-${selectedYear}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Estado del juego derivado del año seleccionado
  const derivedGameState = yearData ? convertToGameState(yearData) : null;

  return (
    <div
      id="data-catalog-modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="data-catalog-modal"
        style={{
          width: '100%', maxWidth: '900px',
          maxHeight: '92vh',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '20px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* HEADER */}
        <div style={{
          padding: '20px 24px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(99,102,241,0.05)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={20} color="#6366f1" />
              Catálogo de Datos
              <span style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', borderRadius: '6px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600 }}>
                Documentación Viva
              </span>
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.75rem' }}>
              Trazabilidad completa: qué dato real se usa en cada parte del simulador, de dónde viene y cómo se transforma.
            </p>
          </div>
          <button
            id="data-catalog-close-btn"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTROLES */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
        }}>
          {/* Selector de año */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>Año:</span>
            <select
              id="catalog-year-select"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px', color: '#e2e8f0',
                padding: '6px 10px', fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              {AVAILABLE_YEARS.map(y => (
                <option key={y} value={y} style={{ background: '#1e293b' }}>
                  {y}{y === 2024 ? ' (est.)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Búsqueda */}
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input
              id="catalog-search"
              type="text"
              placeholder="Buscar dato…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', color: '#e2e8f0',
                padding: '7px 12px 7px 32px', fontSize: '0.78rem',
              }}
            />
          </div>

          {/* Filtro por componente */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px' }}>
            <Filter size={13} color="#475569" />
            <select
              id="catalog-component-filter"
              value={filterComponent}
              onChange={e => setFilterComponent(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px', color: '#e2e8f0',
                padding: '6px 10px', fontSize: '0.72rem', cursor: 'pointer', flex: 1,
              }}
            >
              {allComponents.map(c => (
                <option key={c} value={c} style={{ background: '#1e293b' }}>
                  {c === 'all' ? 'Todos los componentes' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Exportar */}
          <button
            id="catalog-export-btn"
            onClick={exportMarkdown}
            title="Exportar como Markdown"
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#94a3b8', cursor: 'pointer',
              padding: '7px 12px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Download size={13} />
            Exportar .md
          </button>
        </div>

        {/* TABLA DE CONVERSIÓN (resumen rápido) */}
        {derivedGameState && (
          <div style={{
            margin: '10px 24px 0',
            background: 'rgba(16,185,129,0.05)',
            border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: '10px',
            padding: '10px 14px',
          }}>
            <div style={{ color: '#34d399', fontSize: '0.65rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.08em' }}>
              🔄 CONVERSIÓN A VARIABLES DEL JUEGO — {selectedYear}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '6px' }}>
              {[
                { label: 'state.population', val: derivedGameState.population?.toLocaleString('es-ES') },
                { label: 'state.treasury', val: fmt(derivedGameState.treasury, '€') },
                { label: 'state.debt', val: fmt(derivedGameState.debt, '€') },
                { label: 'unemploymentRate (EPA)', val: `${(derivedGameState.unemploymentRate !== undefined ? derivedGameState.unemploymentRate : 14.0).toFixed(1)}%` },
                { label: 'baseIncome/mes', val: `${derivedGameState.baseIncomePerCapita?.toFixed(2)} €` },
                { label: 'baseExpense/mes', val: `${derivedGameState.baseExpensePerCapita?.toFixed(2)} €` },
                { label: 'fixedExpenses/mes', val: fmt(derivedGameState.fixedExpenses, '€') },
                ...(derivedGameState.fixedIncome > 0 ? [{ label: 'fixedIncome/mes (NextGen)', val: fmt(derivedGameState.fixedIncome, '€') }] : []),
                { label: 'alloc.social (GF10)', val: `${derivedGameState.ministryAllocations?.social || 40}%` },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px 8px' }}>
                  <div style={{ color: '#475569', fontSize: '0.58rem', fontFamily: 'monospace' }}>{item.label}</div>
                  <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LISTA DE DATOS */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#475569', fontSize: '0.68rem' }}>
              {filteredFields.length} dato{filteredFields.length !== 1 ? 's' : ''} · Haz clic para ver trazabilidad completa
            </span>
            <button
              onClick={() => {
                if (expandedFields.size > 0) setExpandedFields(new Set());
                else setExpandedFields(new Set(filteredFields.map(([k]) => k)));
              }}
              style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.68rem' }}
            >
              {expandedFields.size > 0 ? 'Colapsar todo' : 'Expandir todo'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredFields.map(([key, meta]) => {
              const fieldData = yearData?.[key];
              const color = FIELD_COLORS[key] || '#94a3b8';
              const seriesValues = historicalSeries[key] || [];

              return (
                <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  {/* Sparkline de serie histórica */}
                  <div style={{ paddingTop: '12px', flexShrink: 0 }}>
                    <Sparkline values={seriesValues} color={color} />
                    <div style={{ color: '#334155', fontSize: '0.5rem', textAlign: 'center', marginTop: '2px' }}>
                      {AVAILABLE_YEARS[0]}–{AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1]}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <DataRow
                      fieldKey={key}
                      meta={meta}
                      data={fieldData}
                      year={selectedYear}
                      isExpanded={expandedFields.has(key)}
                      onToggle={() => toggleField(key)}
                      color={color}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: '#334155', fontSize: '0.65rem',
        }}>
          <span>Fuentes verificadas · INE · Banco de España · IGAE · Eurostat · datos.gob.es</span>
          <span>Datos 2010–2024 · Estimaciones preliminares para 2024</span>
        </div>
      </div>
    </div>
  );
}
