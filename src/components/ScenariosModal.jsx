import React from 'react';
import { SCENARIOS } from '../utils/scenarios';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { X, Play, Target, ShieldAlert, Sparkles, Flag } from 'lucide-react';

export const ScenariosModal = ({ isOpen, onClose, currentScenarioId, onSelectScenario, numberingSystem }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-container scenarios-modal">
        <div className="modal-header d-flex align-center justify-between">
          <div className="d-flex align-center gap-2">
            <Flag className="text-cyan" size={24} />
            <h2 className="m-0 text-cyan">Modo Escenarios & Desafíos</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-sm text-muted mb-4">
            Pon a prueba tu intuición financiera y capacidad de gestión con condiciones históricas y económicas extremas.
          </p>

          <div className="scenarios-grid">
            {SCENARIOS.map((sc) => {
              const isSelected = sc.id === currentScenarioId;
              let diffBadgeClass = 'badge-success';
              if (sc.difficulty === 'Medio') diffBadgeClass = 'badge-warning';
              if (sc.difficulty === 'Difícil' || sc.difficulty === 'Experto') diffBadgeClass = 'badge-danger';

              return (
                <div
                  key={sc.id}
                  className={`scenario-card glass-panel p-4 ${isSelected ? 'active-scenario' : ''}`}
                >
                  <div className="d-flex justify-between align-center mb-2">
                    <h4 className="m-0 font-bold text-base">{sc.name}</h4>
                    <span className={`badge ${diffBadgeClass}`}>{sc.difficulty}</span>
                  </div>

                  <p className="text-xs text-muted mb-3" style={{ minHeight: '36px' }}>{sc.description}</p>

                  <div className="scenario-stats-preview glass-panel p-2 mb-3 text-xs">
                    <div className="d-flex justify-between mb-1">
                      <span className="text-muted">Población Inicial:</span>
                      <strong>{formatLargeNumber(sc.initialState.population, numberingSystem)}</strong>
                    </div>
                    <div className="d-flex justify-between mb-1">
                      <span className="text-muted">Tesoro Inicial:</span>
                      <strong className="text-success">{formatCurrency(sc.initialState.treasury, numberingSystem)}</strong>
                    </div>
                    <div className="d-flex justify-between">
                      <span className="text-muted">Deuda Inicial:</span>
                      <strong className={sc.initialState.debt > 0 ? 'text-danger' : 'text-muted'}>
                        {sc.initialState.debt > 0 ? formatCurrency(sc.initialState.debt, numberingSystem) : 'Sin Deuda'}
                      </strong>
                    </div>
                  </div>

                  <button
                    className={`btn w-100 ${isSelected ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => {
                      onSelectScenario(sc.id);
                      onClose();
                    }}
                  >
                    {isSelected ? 'Partida en Curso' : 'Comenzar Este Escenario'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer d-flex justify-end mt-4">
          <button className="btn btn-outline" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
