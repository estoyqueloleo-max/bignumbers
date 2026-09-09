/**
 * YearPickerModal.jsx
 *
 * Modal con slider de año para cargar datos macroeconómicos reales de España.
 * El jugador elige el año de inicio y el simulador se inicializa con cifras reales.
 */

import React, { useMemo } from 'react';
import { X, RefreshCw, WifiOff, Database, Play, TrendingUp, TrendingDown } from 'lucide-react';
import { useRealData } from '../hooks/useRealData';
import { FIELD_METADATA, SPAIN_DATA, COFOG_BUCKETS } from '../utils/spainDataCatalog';
import { MIN_YEAR, MAX_YEAR } from '../utils/realDataLoader';

// ─── Formateadores ────────────────────────────────────────────────────────────

const fmt = (value, unit) => {
  if (unit === 'personas') {
    return value >= 1e6
      ? `${(value / 1e6).toFixed(2)} M`
      : value.toLocaleString('es-ES');
  }
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === '€' || unit === '€/año') {
    if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(2)} B€`;
    if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)} Mil M€`;
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(0)} M€`;
    return `${value.toLocaleString('es-ES')} €`;
  }
  if (unit === '€/persona/año') {
    return `${value.toLocaleString('es-ES')} €`;
  }
  return String(value);
};

// ─── Indicador de tendencia ───────────────────────────────────────────────────

function TrendBadge({ current, previous, invertedGood = false }) {
  if (!previous || previous === 0) return null;
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  const isPositive = delta > 0;
  const isGood = invertedGood ? !isPositive : isPositive;

  if (Math.abs(delta) < 0.1) return <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>—</span>;

  const color = isGood ? '#10b981' : '#ef4444';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span style={{ color, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
      <Icon size={10} />
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

// ─── Badge de fuente de datos ─────────────────────────────────────────────────

function SourceBadge({ source }) {
  const configs = {
    api: { label: '🔴 EN VIVO', bg: 'rgba(239,68,68,0.15)', color: '#ef4444', title: 'Datos cargados desde API de Eurostat en tiempo real' },
    cache: { label: '⚡ CACHÉ', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', title: 'Datos cacheados en las últimas 24h' },
    static: { label: '📦 ESTÁTICO', bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', title: 'Datos del catálogo local verificado (offline-first)' },
  };
  const cfg = configs[source] || configs.static;
  return (
    <span
      title={cfg.title}
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}33`,
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        cursor: 'help',
      }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Tarjeta de métrica ───────────────────────────────────────────────────────

function MetricCard({ fieldKey, fieldMeta, fieldData, prevFieldData }) {
  if (!fieldData) return null;
  const isLive = fieldData.live;
  const value = fieldData.value;
  const prevValue = prevFieldData?.value;

  // Valores "buenos cuando bajan": desempleo, deuda, déficit
  const invertedGood = ['unemploymentRate', 'publicDebt', 'publicDebtPctGdp', 'deficit'].includes(fieldKey);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {isLive && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '6px', height: '6px',
          background: '#ef4444',
          borderRadius: '0 10px 0 4px',
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '1rem' }}>{fieldMeta.icon}</span>
        <span style={{ color: '#94a3b8', fontSize: '0.65rem', flex: 1, lineHeight: 1.2 }}>{fieldMeta.label}</span>
        <TrendBadge current={value} previous={prevValue} invertedGood={invertedGood} />
      </div>
      <div style={{
        color: '#f1f5f9',
        fontSize: fieldMeta.unit === '€' || fieldMeta.unit === '€/año' ? '1.05rem' : '1.1rem',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
      }}>
        {fmt(value, fieldMeta.unit)}
      </div>
      <div style={{ color: '#64748b', fontSize: '0.58rem' }}>
        {fieldData.source}
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export function YearPickerModal({ onClose, onApply }) {
  const {
    selectedYear, setYear,
    rawData, gameState,
    isLoading, loadError, dataSource,
    availableYears, reload,
  } = useRealData();

  // Datos del año anterior para mostrar tendencias (usa SPAIN_DATA ya importado)
  const prevYearData = useMemo(() => {
    if (!rawData || !selectedYear) return null;
    return SPAIN_DATA[selectedYear - 1] || null;
  }, [selectedYear, rawData]);

  const handleSliderChange = (e) => setYear(Number(e.target.value));

  const handleApply = () => {
    if (gameState) {
      onApply(gameState);
      onClose();
    }
  };

  // Campos a mostrar en las tarjetas (ordenados)
  const primaryFields = ['population', 'gdp', 'publicDebt', 'publicDebtPctGdp', 'taxRevenue', 'publicSpending', 'debtInterestPayments', 'deficit', 'gdpPerCapita', 'unemploymentRate'];

  const yearLabel = selectedYear
    ? (selectedYear === MAX_YEAR ? `${selectedYear} (est.)` : String(selectedYear))
    : '…';

  return (
    <div
      id="year-picker-modal-overlay"
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
        id="year-picker-modal"
        style={{
          width: '100%', maxWidth: '820px',
          maxHeight: '90vh',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '20px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* HEADER */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(99,102,241,0.06)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>🇪🇸</span>
              Datos Reales de España
            </h2>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              Selecciona el año de inicio. El simulador se inicializa con cifras macroeconómicas reales.
            </p>
          </div>
          <button
            id="year-picker-close-btn"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* SLIDER DE AÑO */}
        <div style={{ padding: '20px 24px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{MIN_YEAR}</span>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                color: '#6366f1', fontSize: '2.2rem', fontWeight: 900,
                fontVariantNumeric: 'tabular-nums',
                textShadow: '0 0 20px rgba(99,102,241,0.5)',
                letterSpacing: '-0.02em',
              }}>
                {yearLabel}
              </span>
              {dataSource && !isLoading && (
                <div style={{ marginTop: '4px' }}><SourceBadge source={dataSource} /></div>
              )}
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{MAX_YEAR}</span>
          </div>

          <input
            id="year-slider"
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
            value={selectedYear}
            onChange={handleSliderChange}
            style={{
              width: '100%', cursor: 'pointer', accentColor: '#6366f1',
              height: '6px',
            }}
          />

          {/* Etiquetas de años */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            {availableYears.filter((_, i) => i % 2 === 0).map(y => (
              <button
                key={y}
                onClick={() => setYear(y)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: y === selectedYear ? '#6366f1' : '#475569',
                  fontSize: '0.6rem', fontWeight: y === selectedYear ? 700 : 400,
                  padding: '2px 0',
                  transition: 'color 0.2s',
                }}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* NOTA HISTÓRICA */}
        {rawData?.notes && (
          <div style={{
            margin: '12px 24px 0',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#a5b4fc',
            fontSize: '0.78rem',
            lineHeight: 1.5,
            display: 'flex', alignItems: 'flex-start', gap: '8px',
          }}>
            <span style={{ flexShrink: 0, marginTop: '1px' }}>📜</span>
            <span>{rawData.notes}</span>
          </div>
        )}

        {/* CUERPO — TARJETAS DE MÉTRICAS */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px', color: '#6366f1' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#94a3b8' }}>Cargando datos…</span>
            </div>
          )}
          {loadError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', padding: '12px 0' }}>
              <WifiOff size={16} />
              <span style={{ fontSize: '0.8rem' }}>Error: {loadError}. Usando datos estáticos.</span>
            </div>
          )}
          {rawData && !isLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {primaryFields.map(key => {
                const meta = FIELD_METADATA[key];
                const data = rawData[key];
                const prevData = prevYearData?.[key];
                if (!meta || !data) return null;
                return (
                  <MetricCard
                    key={key}
                    fieldKey={key}
                    fieldMeta={meta}
                    fieldData={data}
                    prevFieldData={prevData}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* DESGLOSE POR MINISTERIO / COFOG */}
        {rawData?.ministryBreakdown && !isLoading && (() => {
          const bd = rawData.ministryBreakdown;
          const total = (bd.health?.value || 0) + (bd.rd?.value || 0) +
            (bd.infra?.value || 0) + (bd.security?.value || 0) + (bd.social?.value || 0);
          const buckets = [
            { key: 'health',   ...COFOG_BUCKETS.health,   value: bd.health?.value   || 0, pct: bd.health?.pct   || 0 },
            { key: 'rd',       ...COFOG_BUCKETS.rd,       value: bd.rd?.value       || 0, pct: bd.rd?.pct       || 0 },
            { key: 'infra',    ...COFOG_BUCKETS.infra,    value: bd.infra?.value    || 0, pct: bd.infra?.pct    || 0 },
            { key: 'security', ...COFOG_BUCKETS.security, value: bd.security?.value || 0, pct: bd.security?.pct || 0 },
            { key: 'social',   ...COFOG_BUCKETS.social,   value: bd.social?.value   || 0, pct: bd.social?.pct   || 0 },
          ];
          const fmtVal = v => v >= 1e9 ? `${(v/1e9).toFixed(1)} Mil M€` : `${(v/1e6).toFixed(0)} M€`;

          return (
            <div style={{
              margin: '0 24px 12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              padding: '12px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  🏛️ GASTO POR FUNCIÓN (COFOG) — Eurostat gov_10a_exp
                </span>
                <a
                  href={bd.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#6366f1', fontSize: '0.6rem', textDecoration: 'none' }}
                >
                  {bd.source} ↗
                </a>
              </div>

              {/* Barra apilada */}
              <div style={{ display: 'flex', height: '18px', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
                {buckets.map(b => (
                  <div
                    key={b.key}
                    title={`${b.label}: ${b.pct.toFixed(1)}% · ${fmtVal(b.value)}`}
                    style={{
                      width: `${b.pct}%`,
                      background: b.color,
                      opacity: 1,
                      transition: 'width 0.4s ease',
                    }}
                  />
                ))}
              </div>

              {/* Leyenda de buckets con valor */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '6px' }}>
                {buckets.map(b => (
                  <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: b.color, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.icon} {b.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                        {b.pct.toFixed(1)}% · {fmtVal(b.value)}
                        {gameState?.ministryAllocations && (
                          <span style={{ color: '#6366f1', marginLeft: '4px', fontWeight: 700 }}>
                            → {gameState.ministryAllocations[b.key]}% en juego
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '8px', color: '#64748b', fontSize: '0.65rem' }}>
                ✨ Los 5 ministerios se mapean íntegramente al simulador, iniciando con las proporciones reales de Eurostat (incluida Protección Social ~{buckets.find(b => b.key === 'social')?.pct.toFixed(0)}%).
              </div>
            </div>
          );
        })()}

        {/* ESTADO DEL JUEGO — QUÉ SE APLICARÁ */}
        {gameState && !isLoading && (
          <div style={{
            margin: '0 24px 12px',
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '10px',
            padding: '12px 16px',
          }}>
            <div style={{ color: '#34d399', fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.05em' }}>
              ⚙️ VALORES QUE SE APLICARÁN AL SIMULADOR
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '6px' }}>
              {[
                { label: 'Población inicial', value: gameState.population?.toLocaleString('es-ES'), icon: '👥' },
                { label: 'Caja inicial (1 mes recaud.)', value: fmt(gameState.treasury, '€'), icon: '🏦' },
                { label: 'Deuda pública', value: fmt(gameState.debt, '€'), icon: '💳' },
                { label: 'Tasa de desempleo (EPA)', value: `${(gameState.unemploymentRate !== undefined ? gameState.unemploymentRate : 14.0).toFixed(1)}%`, icon: '📉' },
                { label: 'Ingreso per cápita/mes', value: `${gameState.baseIncomePerCapita?.toFixed(2)} €`, icon: '💰' },
                { label: 'Gasto per cápita/mes', value: `${gameState.baseExpensePerCapita?.toFixed(2)} €`, icon: '💸' },
                { label: 'Intereses/mes (fijo)', value: fmt(gameState.fixedExpenses, '€'), icon: '📉' },
                ...(gameState.fixedIncome > 0 ? [{ label: 'Fondos NextGenEU/mes', value: fmt(gameState.fixedIncome, '€'), icon: '🇪🇺' }] : []),
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.6rem' }}>{item.icon} {item.label}</span>
                  <span style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER — ACCIONES */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.72rem' }}>
            <Database size={14} />
            <span>Fuentes: INE · Banco de España · Eurostat · IGAE · datos.gob.es</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              id="year-picker-reload-btn"
              onClick={reload}
              disabled={isLoading}
              title="Recargar desde APIs"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#94a3b8',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.78rem',
              }}
            >
              <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
              Actualizar
            </button>
            <button
              id="year-picker-apply-btn"
              onClick={handleApply}
              disabled={!gameState || isLoading}
              style={{
                background: gameState && !isLoading
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(99,102,241,0.2)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: gameState && !isLoading ? 'pointer' : 'not-allowed',
                padding: '10px 20px',
                fontWeight: 700, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: gameState && !isLoading ? '0 4px 15px rgba(99,102,241,0.4)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Play size={16} />
              Jugar con datos de {selectedYear} 🇪🇸
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
