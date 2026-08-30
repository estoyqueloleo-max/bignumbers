import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { Trees, Zap, Heart, Rocket, Check, Lock, X } from 'lucide-react';

export const TECH_BRANCHES = [
  {
    name: 'Rama de Energía & Fusión',
    icon: <Zap className="text-warning" size={18} />,
    color: '#f59e0b',
    nodes: [
      { id: 'solar_grids', name: 'Parques Renovables', cost: 50000000, req: null, desc: '+5% ingresos limpios' },
      { id: 'fusion_reactor', name: 'Reactor de Fusión', cost: 500000000000, req: 'solar_grids', desc: 'Energía limpia ilimitada' },
      { id: 'global_fusion_grid', name: 'Red de Fusión Global', cost: 2000000000000, req: 'fusion_reactor', desc: 'Soberanía energética planetaria' },
      { id: 'dyson_swarm', name: 'Enjambre de Dyson', cost: 50000000000000, req: 'global_fusion_grid', desc: 'Captación solar orbital estelar' }
    ]
  },
  {
    name: 'Rama Bio-Social & Longevidad',
    icon: <Heart className="text-success" size={18} />,
    color: '#10b981',
    nodes: [
      { id: 'primary_health', name: 'Atención Primaria Universal', cost: 100000000, req: null, desc: 'Reduce epidemias un 40%' },
      { id: 'ubi_program', name: 'Renta Básica Garantizada', cost: 1000000000, req: 'primary_health', desc: '+15% crecimiento de población' },
      { id: 'genomics_longevity', name: 'Genómica y Longevidad', cost: 10000000000000, req: 'ubi_program', desc: 'Erradicación de enfermedades' }
    ]
  },
  {
    name: 'Rama Aeroespacial & Multiplanetaria',
    icon: <Rocket className="text-cyan" size={18} />,
    color: '#38bdf8',
    nodes: [
      { id: 'satellite_constellation', name: 'Constelación Satelital', cost: 500000000, req: null, desc: '+10% ingresos telecom' },
      { id: 'mars_base', name: 'Colonia en Marte', cost: 100000000000, req: 'satellite_constellation', desc: 'Humanidad multiplanetaria' },
      { id: 'space_elevator', name: 'Ascensor Espacial', cost: 1000000000000, req: 'mars_base', desc: '-80% coste de órbita' },
      { id: 'interstellar_probe', name: 'Sonda Interestelar', cost: 100000000000000, req: 'space_elevator', desc: 'Exploración de Próxima Centauri' }
    ]
  }
];

export const TechTreeModal = ({
  isOpen,
  onClose,
  state,
  buyUpgrade,
  numberingSystem
}) => {
  if (!isOpen) return null;

  const purchasedUpgrades = state.purchasedUpgrades || [];

  const isPurchased = (id) => purchasedUpgrades.includes(id);

  const isAvailable = (node) => {
    if (isPurchased(node.id)) return false;
    if (!node.req) return true;
    return isPurchased(node.req);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-container tech-tree-modal" style={{ maxWidth: '950px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header d-flex align-center justify-between">
          <div className="d-flex align-center gap-2">
            <Trees className="text-cyan" size={24} />
            <h2 className="m-0 text-cyan text-base">Árbol Tecnológico & Megaproyectos de Civilización</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-xs text-muted mb-4">
            Desbloquea hitos de escala y civilización. Cada tecnología requiere haber completado el requisito previo de su rama evolutiva.
          </p>

          <div className="tech-branches-container d-flex flex-column gap-4">
            {TECH_BRANCHES.map((branch, bIdx) => (
              <div key={bIdx} className="tech-branch-card glass-panel p-3">
                <div className="d-flex align-center gap-2 mb-3">
                  {branch.icon}
                  <h4 className="m-0 font-bold text-sm" style={{ color: branch.color }}>{branch.name}</h4>
                </div>

                <div className="tech-nodes-flow d-flex align-center gap-2 flex-wrap">
                  {branch.nodes.map((node, nIdx) => {
                    const bought = isPurchased(node.id);
                    const available = isAvailable(node);
                    const canAfford = available && state.treasury >= node.cost;

                    return (
                      <React.Fragment key={node.id}>
                        <div
                          className={`tech-node-box p-3 glass-panel ${bought ? 'tech-node-bought' : available ? 'tech-node-available' : 'tech-node-locked'}`}
                          style={{ minWidth: '180px', flex: 1 }}
                        >
                          <div className="d-flex justify-between align-center mb-1">
                            <span className="font-bold text-xs">{node.name}</span>
                            {bought ? (
                              <Check size={14} className="text-success" />
                            ) : !available ? (
                              <Lock size={14} className="text-muted" />
                            ) : null}
                          </div>

                          <div className="text-xs text-muted mb-2">{node.desc}</div>

                          <div className="d-flex justify-between align-center">
                            <span className="text-xs font-bold" style={{ color: bought ? 'var(--success)' : branch.color }}>
                              {bought ? 'Completado' : formatCurrency(node.cost, numberingSystem)}
                            </span>

                            {available && (
                              <button
                                className={`btn btn-xs ${canAfford ? 'btn-success' : 'btn-outline'}`}
                                onClick={() => buyUpgrade({ id: node.id, name: node.name, cost: node.cost })}
                                disabled={!canAfford}
                              >
                                {canAfford ? 'Desarrollar' : 'Sin fondos'}
                              </button>
                            )}
                          </div>
                        </div>

                        {nIdx < branch.nodes.length - 1 && (
                          <div className="tech-node-connector" style={{ color: bought ? 'var(--success)' : 'var(--text-muted)', fontSize: '1.2rem' }}>
                            ➔
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
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
