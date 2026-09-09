import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { HistoryChart } from './HistoryChart';
import { MoneyFlowSankey } from './MoneyFlowSankey';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Activity, Award } from 'lucide-react';

export const StatsPanel = ({
  state,
  currentIncome,
  currentExpenses,
  debtInterest,
  creditRating,
  setTaxRate,
  payDebt,
  numberingSystem
}) => {
  const cashFlow = currentIncome - currentExpenses - debtInterest;
  const isDeficit = cashFlow < 0;

  const crisisExample = 5000000000;
  const incomePercent = Math.min(100, Math.max(0.1, (currentIncome / crisisExample) * 100));

  return (
    <div className="glass-panel stats-panel">
      <div className="d-flex justify-between align-center mb-4 flex-wrap gap-2">
        <h3 className="d-flex align-center m-0" style={{ gap: '0.5rem' }}>
          <DollarSign className="text-cyan" /> Finanzas del Estado
        </h3>
        <div className="d-flex align-center gap-2 flex-wrap">
          {state.realDataYear && (
            <span className="badge text-xs" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}>
              🇪🇸 España {state.realDataYear}
            </span>
          )}
          <span className="badge text-xs" style={{
            background: (state.unemploymentRate || 14) > 18 ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
            borderColor: (state.unemploymentRate || 14) > 18 ? 'var(--danger)' : 'var(--warning)',
            color: (state.unemploymentRate || 14) > 18 ? 'var(--danger)' : 'var(--warning)'
          }}>
            Paro: {(state.unemploymentRate !== undefined ? state.unemploymentRate : 14.0).toFixed(1)}%
          </span>
          <span className="badge text-xs" style={{
            background: 'rgba(236,72,153,0.1)',
            borderColor: '#ec4899',
            color: '#ec4899'
          }}>
            Paz: {state.socialPeace || 85}%
          </span>
        </div>
      </div>

      <div className="stat-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp className="text-success" /></div>
          <div className="stat-info">
            <div className="stat-label">Ingresos Mensuales</div>
            <div className="stat-value text-success">+{formatCurrency(currentIncome, numberingSystem)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><TrendingDown className="text-danger" /></div>
          <div className="stat-info">
            <div className="stat-label">Gastos Mensuales</div>
            <div className="stat-value text-danger">-{formatCurrency(currentExpenses, numberingSystem)}</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: isDeficit ? 'var(--danger)' : 'var(--border-glass)' }}>
          <div className="stat-icon"><Activity className={isDeficit ? 'text-danger' : 'text-cyan'} /></div>
          <div className="stat-info">
            <div className="stat-label">Flujo de Caja Neto</div>
            <div className={`stat-value ${isDeficit ? 'text-danger' : 'text-success'}`}>
              {isDeficit ? '' : '+'}{formatCurrency(cashFlow, numberingSystem)}
            </div>
          </div>
        </div>

        {state.debt > 0 && (
          <div className="stat-card" style={{ borderColor: 'var(--danger)', background: 'var(--danger-glow)' }}>
            <div className="stat-icon"><AlertTriangle className="text-warning" /></div>
            <div className="stat-info">
              <div className="stat-label text-warning d-flex align-center gap-1">
                <span>Deuda Soberana</span>
                {creditRating && (
                  <span className="badge text-xs" style={{ color: creditRating.color, borderColor: creditRating.color }}>
                    {creditRating.rating}
                  </span>
                )}
              </div>
              <div className="stat-value text-danger">{formatCurrency(state.debt, numberingSystem)}</div>
              <div className="text-xs text-danger mt-1">Interés: -{formatCurrency(debtInterest, numberingSystem)}/m</div>
            </div>
            {state.treasury >= state.debt && (
              <button onClick={() => payDebt(state.debt)} className="btn btn-success" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
                Liquidar
              </button>
            )}
          </div>
        )}
      </div>

      {/* DIAGRAMA SANKEY DE FLUJO PRESUPUESTARIO */}
      <MoneyFlowSankey
        state={state}
        currentIncome={currentIncome}
        currentExpenses={currentExpenses}
        debtInterest={debtInterest}
        numberingSystem={numberingSystem}
      />

      {/* POLÍTICA FISCAL */}
      <div className="controls-section mb-4">
        <div className="d-flex justify-between align-center mb-1">
          <h4 className="m-0 text-sm font-bold">Presión Fiscal (Tasa: {Math.round(state.taxRate * 100)}%)</h4>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={state.taxRate}
          onChange={(e) => setTaxRate(parseFloat(e.target.value))}
        />
        <div className="tax-labels text-xs text-muted d-flex justify-between">
          <span>📉 Crecimiento (Impuestos Bajos)</span>
          <span>Recesión (Impuestos Altos) 📈</span>
        </div>
      </div>

      {/* CHOQUE DE MAGNITUDES */}
      <div className="scale-chart-section mb-4">
        <h4 className="text-sm font-bold mb-1">Choque de Magnitudes</h4>
        <p className="text-xs text-muted mb-2">
          Tus ingresos ({formatCurrency(currentIncome, numberingSystem)}) frente al coste de una Crisis Estándar de {formatCurrency(crisisExample, numberingSystem)}:
        </p>
        <div className="scale-bar-container">
          <div className="scale-bar-crisis" style={{ width: '100%' }}></div>
          <div className="scale-bar-income" style={{ width: `${incomePercent}%` }}></div>
        </div>
        <div className="d-flex justify-between text-xs text-muted mt-1">
          <span className="text-success font-bold">{incomePercent.toFixed(1)}% cubierto por tus ingresos mensuales</span>
          <span className="text-danger font-bold">100% Crisis ($5B)</span>
        </div>
      </div>

      {/* GRÁFICA HISTÓRICA */}
      <div className="history-section pt-3 border-top border-glass">
        <HistoryChart historyData={state.historyData} numberingSystem={numberingSystem} />
      </div>
    </div>
  );
};
