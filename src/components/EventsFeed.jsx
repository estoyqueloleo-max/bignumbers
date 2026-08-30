import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { RadioTower, AlertOctagon, Info } from 'lucide-react';

export const EventsFeed = ({ state, resolveDilemma, numberingSystem }) => {
  return (
    <div className="glass-panel events-panel flex-column h-100">
      <h3 className="d-flex align-center gap-2 mb-4">
        <RadioTower className="text-cyan" /> Crisis y Dilemas
      </h3>
      
      {state.activeDilemma && (
        <div className="dilemma-card mb-4">
          <h4 className="text-danger d-flex align-center" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertOctagon /> {state.activeDilemma.title}
          </h4>
          <p className="text-sm mb-4" style={{ opacity: 0.9 }}>{state.activeDilemma.description}</p>
          <div className="dilemma-options">
            {state.activeDilemma.options.map((opt, idx) => {
              const cannotAfford = opt.cost > state.treasury && opt.cost > 0;
              let btnClass = 'btn-primary';
              if (opt.loan) btnClass = 'btn-warning';
              if (opt.popPenalty > 0) btnClass = 'btn-outline';
              if (cannotAfford) btnClass = 'btn-danger opacity-50'; 

              return (
                <button 
                  key={idx}
                  className={`btn ${btnClass} w-100 mb-2 dilemma-btn`}
                  onClick={() => resolveDilemma(opt)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem' }}
                >
                  <span className="font-bold mb-1">{opt.label}</span>
                  <div className="text-xs" style={{ opacity: 0.8, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {opt.cost > 0 && <span>Costo: -{formatCurrency(opt.cost, numberingSystem)}</span>}
                    {opt.loan > 0 && <span>Deuda FMI: +{formatCurrency(opt.loan, numberingSystem)}</span>}
                    {opt.popPenalty > 0 && <span>Pérdidas: {opt.popPenalty * 100}% pob.</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!state.activeDilemma && (
        <div className="stat-card" style={{ borderColor: 'var(--success)', background: 'var(--success-glow)' }}>
          <div className="stat-icon"><Info className="text-success" /></div>
          <div className="stat-info">
            <div className="stat-label text-success">Situación Nacional</div>
            <div className="stat-value text-sm text-success" style={{ fontWeight: 600 }}>Todo pacífico. Sin incidentes.</div>
          </div>
        </div>
      )}

      <div className="events-log-container mt-4">
        <h4 className="text-muted mb-3" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Historial del Gobierno</h4>
        <div className="events-log">
          {state.eventHistory.map((log, i) => (
            <div key={i} className={`log-entry ${log.text.includes('FMI') ? 'log-warning' : (log.text.includes('parche') ? 'log-danger' : 'log-success')}`}>
              <span className="font-bold text-muted" style={{ marginRight: '0.5rem' }}>M-{log.month}</span>
              <span>{log.text}</span>
            </div>
          ))}
          {state.eventHistory.length === 0 && <p className="text-muted text-xs">Aún no hay registros en este periodo.</p>}
        </div>
      </div>
    </div>
  );
};
