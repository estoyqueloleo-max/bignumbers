import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { MinisterCouncil } from './MinisterCouncil';
import { ShieldCheck, Heart, Lightbulb, Landmark, Award, ArrowUpRight, Vault } from 'lucide-react';

export const MinistriesPanel = ({
  state,
  creditRating,
  setMinistryAllocations,
  issueBonds,
  payDebt,
  depositSovereignFund,
  withdrawSovereignFund,
  numberingSystem
}) => {
  const alloc = state.ministryAllocations || { health: 25, rd: 25, infra: 25, security: 25 };

  const handleSliderChange = (key, value) => {
    setMinistryAllocations({ [key]: parseInt(value, 10) });
  };

  const fundReturnMonthly = Math.floor((state.sovereignFund || 0) * 0.005);

  return (
    <div className="glass-panel ministries-panel">
      <h3 className="d-flex align-center gap-2 mb-3">
        <Landmark className="text-cyan" /> Ministerios & Finanzas Soberanas
      </h3>
      <p className="text-xs text-muted mb-4">
        Asigna el enfoque estratégico de tu gobierno para protegerte de crisis y maximizar el rendimiento económico.
      </p>

      {/* CONSEJO DE MINISTROS REACTIVO */}
      <MinisterCouncil state={state} creditRating={creditRating} />

      {/* SECTORES MINISTERIALES */}
      <div className="ministries-grid mb-4">
        <div className="ministry-card glass-panel p-3">
          <div className="d-flex justify-between align-center mb-1">
            <span className="d-flex align-center gap-1 text-sm font-bold text-success">
              <Heart size={16} /> Sanidad Pública
            </span>
            <span className="badge text-xs">{alloc.health}%</span>
          </div>
          <p className="text-xs text-muted mb-2">Reduce la pérdida de vidas en pandemias hasta un 60%.</p>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={alloc.health}
            onChange={(e) => handleSliderChange('health', e.target.value)}
          />
        </div>

        <div className="ministry-card glass-panel p-3">
          <div className="d-flex justify-between align-center mb-1">
            <span className="d-flex align-center gap-1 text-sm font-bold text-cyan">
              <Lightbulb size={16} /> Ciencia e I+D
            </span>
            <span className="badge text-xs">{alloc.rd}%</span>
          </div>
          <p className="text-xs text-muted mb-2">Otorga hasta +5% de ingresos pasivos por innovación.</p>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={alloc.rd}
            onChange={(e) => handleSliderChange('rd', e.target.value)}
          />
        </div>

        <div className="ministry-card glass-panel p-3">
          <div className="d-flex justify-between align-center mb-1">
            <span className="d-flex align-center gap-1 text-sm font-bold text-warning">
              <Landmark size={16} /> Infraestructura
            </span>
            <span className="badge text-xs">{alloc.infra}%</span>
          </div>
          <p className="text-xs text-muted mb-2">Reduce un 40% la probabilidad de colapsos estructurales.</p>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={alloc.infra}
            onChange={(e) => handleSliderChange('infra', e.target.value)}
          />
        </div>

        <div className="ministry-card glass-panel p-3">
          <div className="d-flex justify-between align-center mb-1">
            <span className="d-flex align-center gap-1 text-sm font-bold text-primary">
              <ShieldCheck size={16} /> Seguridad & Emergencias
            </span>
            <span className="badge text-xs">{alloc.security}%</span>
          </div>
          <p className="text-xs text-muted mb-2">Mitiga los costes de rescates y ciberataques.</p>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={alloc.security}
            onChange={(e) => handleSliderChange('security', e.target.value)}
          />
        </div>
      </div>

      {/* MERCADO DE DEUDA Y CALIFICACIÓN SOBERANA */}
      <div className="debt-market-section glass-panel p-3 mb-4">
        <div className="d-flex justify-between align-center mb-3 flex-wrap gap-2">
          <h4 className="m-0 text-sm font-bold d-flex align-center gap-2">
            <Award className="text-warning" size={18} /> Mercado de Bonos Soberanos
          </h4>
          <div
            className="credit-rating-badge"
            style={{
              borderColor: creditRating.color,
              color: creditRating.color,
              background: `${creditRating.color}15`,
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.8rem'
            }}
          >
            Rating: {creditRating.rating} ({creditRating.label}) • Interés: {(creditRating.interestRate * 100).toFixed(1)}%/mes
          </div>
        </div>

        <p className="text-xs text-muted mb-3">
          Emite bonos para conseguir liquidez inmediata en momentos críticos. Cuidado: endeudarse degradará tu calificación y disparará los tipos de interés.
        </p>

        <div className="d-flex gap-2 flex-wrap mb-3">
          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={() => issueBonds(500000000)}
          >
            <ArrowUpRight size={14} className="text-cyan" /> Emitir +{formatCurrency(500000000, numberingSystem)}
          </button>
          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={() => issueBonds(2000000000)}
          >
            <ArrowUpRight size={14} className="text-warning" /> Emitir +{formatCurrency(2000000000, numberingSystem)}
          </button>
          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={() => issueBonds(10000000000)}
          >
            <ArrowUpRight size={14} className="text-danger" /> Emitir +{formatCurrency(10000000000, numberingSystem)}
          </button>
        </div>

        {state.debt > 0 && (
          <div className="d-flex justify-between align-center pt-2 border-top border-glass flex-wrap gap-2">
            <div className="text-xs text-danger">
              Deuda Total: <strong>{formatCurrency(state.debt, numberingSystem)}</strong>
            </div>
            <div className="d-flex gap-1">
              <button
                className="btn btn-success btn-xs"
                onClick={() => payDebt(500000000)}
                disabled={state.treasury < 500000000}
              >
                Pagar {formatCurrency(500000000, numberingSystem)}
              </button>
              <button
                className="btn btn-success btn-xs"
                onClick={() => payDebt(state.debt)}
                disabled={state.treasury < state.debt}
              >
                Liquidar Deuda
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FONDO SOBERANO DE INVERSIÓN */}
      <div className="sovereign-fund-section glass-panel p-3">
        <div className="d-flex justify-between align-center mb-2">
          <h4 className="m-0 text-sm font-bold d-flex align-center gap-2 text-cyan">
            <Vault size={18} /> Fondo Soberano de Inversión
          </h4>
          <span className="text-xs text-success font-bold">
            +0.5% mensual (+{formatCurrency(fundReturnMonthly, numberingSystem)}/m)
          </span>
        </div>
        <p className="text-xs text-muted mb-3">
          Reserva fondos para generar intereses pasivos continuos. Cuando alcanzas miles de millones, el dinero trabaja solo.
        </p>

        <div className="d-flex justify-between align-center mb-3">
          <div className="text-sm">
            Fondo Actual: <strong className="text-success">{formatCurrency(state.sovereignFund || 0, numberingSystem)}</strong>
          </div>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-primary btn-xs"
            onClick={() => depositSovereignFund(500000000)}
            disabled={state.treasury < 500000000}
          >
            Aportar +{formatCurrency(500000000, numberingSystem)}
          </button>
          <button
            className="btn btn-primary btn-xs"
            onClick={() => depositSovereignFund(2000000000)}
            disabled={state.treasury < 2000000000}
          >
            Aportar +{formatCurrency(2000000000, numberingSystem)}
          </button>
          <button
            className="btn btn-outline btn-xs"
            onClick={() => withdrawSovereignFund(500000000)}
            disabled={(state.sovereignFund || 0) < 500000000}
          >
            Retirar {formatCurrency(500000000, numberingSystem)}
          </button>
          <button
            className="btn btn-outline btn-xs"
            onClick={() => withdrawSovereignFund(state.sovereignFund || 0)}
            disabled={(state.sovereignFund || 0) <= 0}
          >
            Retirar Todo
          </button>
        </div>
      </div>
    </div>
  );
};
