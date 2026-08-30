import React, { useState } from 'react';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { BarChart3, HelpCircle } from 'lucide-react';

export const HistoryChart = ({ historyData = [], numberingSystem }) => {
  const [scaleType, setScaleType] = useState('linear'); // 'linear' | 'log'
  const [showTreasury, setShowTreasury] = useState(true);
  const [showDebt, setShowDebt] = useState(true);
  const [hoverPoint, setHoverPoint] = useState(null);

  if (!historyData || historyData.length < 2) {
    return (
      <div className="chart-placeholder text-center p-4 text-muted text-xs">
        <BarChart3 className="mb-2" size={28} />
        <div>Recopilando datos históricos de la economía... (Avanza unos meses)</div>
      </div>
    );
  }

  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 15, bottom: 25, left: 55 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Transformar valor según escala
  const transformVal = (val) => {
    const safeVal = Math.max(1, Math.abs(val || 0));
    if (scaleType === 'log') {
      return Math.log10(safeVal);
    }
    return safeVal;
  };

  // Encontrar máximos
  let maxRaw = 100000000;
  historyData.forEach(d => {
    if (showTreasury && d.treasury > maxRaw) maxRaw = d.treasury;
    if (showDebt && d.debt > maxRaw) maxRaw = d.debt;
  });

  const maxVal = transformVal(maxRaw);
  const minVal = scaleType === 'log' ? Math.log10(1000000) : 0; // mínimo 1M en log
  const valRange = Math.max(1, maxVal - minVal);

  const getX = (idx) => padding.left + (idx / (historyData.length - 1)) * innerWidth;
  const getY = (val) => {
    const tVal = transformVal(val);
    const clamped = Math.max(minVal, Math.min(maxVal, tVal));
    const ratio = (clamped - minVal) / valRange;
    return padding.top + innerHeight - ratio * innerHeight;
  };

  // Crear SVG paths
  const generatePath = (key) => {
    return historyData.reduce((acc, point, idx) => {
      const x = getX(idx);
      const y = getY(point[key]);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  const treasuryPath = generatePath('treasury');
  const debtPath = generatePath('debt');

  // Marcadores de referencia
  const yTicks = scaleType === 'log' 
    ? [1e6, 1e9, 1e12].filter(v => Math.log10(v) <= maxVal + 0.5)
    : [0, maxRaw * 0.5, maxRaw];

  return (
    <div className="history-chart-wrapper">
      <div className="d-flex align-center justify-between mb-2 flex-wrap gap-2">
        <div className="d-flex align-center gap-2">
          <span className="text-xs font-bold text-muted">Evolución Histórica</span>
          <span className="badge text-xs" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {historyData.length} meses registrados
          </span>
        </div>

        <div className="d-flex align-center gap-2">
          {/* Selector de Escala */}
          <div className="scale-toggle-btns d-flex">
            <button
              className={`btn btn-xs ${scaleType === 'linear' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setScaleType('linear')}
              title="Escala Lineal estándar"
            >
              Lineal
            </button>
            <button
              className={`btn btn-xs ${scaleType === 'log' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setScaleType('log')}
              title="Escala Logarítmica: ideal para comparar Millones y Billones juntos"
            >
              Logarítmica (Log₁₀)
            </button>
          </div>
        </div>
      </div>

      <div className="chart-legend d-flex gap-3 mb-2 text-xs">
        <label className="d-flex align-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={showTreasury}
            onChange={(e) => setShowTreasury(e.target.checked)}
          />
          <span style={{ color: '#10b981', fontWeight: 600 }}>● Tesorería</span>
        </label>
        <label className="d-flex align-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={showDebt}
            onChange={(e) => setShowDebt(e.target.checked)}
          />
          <span style={{ color: '#ef4444', fontWeight: 600 }}>● Deuda</span>
        </label>
      </div>

      <div className="chart-container" style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="history-svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Grid lines */}
          {yTicks.map((tickVal, i) => {
            const y = getY(tickVal);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="8.5"
                  fontFamily="sans-serif"
                >
                  {formatCurrency(tickVal, numberingSystem)}
                </text>
              </g>
            );
          })}

          {/* Ejes */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="rgba(255,255,255,0.2)"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="rgba(255,255,255,0.2)"
          />

          {/* Líneas de datos */}
          {showDebt && (
            <path
              d={debtPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.4))' }}
            />
          )}

          {showTreasury && (
            <path
              d={treasuryPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))' }}
            />
          )}

          {/* Puntos interactivos invisibles para hover */}
          {historyData.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.treasury)}
              r={hoverPoint?.month === d.month ? 4 : 2.5}
              fill="#10b981"
              style={{ cursor: 'pointer', transition: 'r 0.15s' }}
              onMouseEnter={() => setHoverPoint(d)}
            />
          ))}
        </svg>

        {hoverPoint && (
          <div
            className="chart-tooltip glass-panel"
            style={{
              position: 'absolute',
              top: '5px',
              right: '10px',
              padding: '0.4rem 0.6rem',
              fontSize: '0.75rem',
              pointerEvents: 'none',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--cyan)',
              zIndex: 10
            }}
          >
            <div className="font-bold text-cyan mb-1">Mes {hoverPoint.month}</div>
            <div className="text-success">Tesoro: {formatCurrency(hoverPoint.treasury, numberingSystem)}</div>
            <div className="text-danger">Deuda: {formatCurrency(hoverPoint.debt, numberingSystem)}</div>
            <div className="text-muted">Pob: {formatLargeNumber(hoverPoint.population, numberingSystem)}</div>
          </div>
        )}
      </div>
    </div>
  );
};
