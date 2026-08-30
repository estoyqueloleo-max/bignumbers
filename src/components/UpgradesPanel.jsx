import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { Zap, Droplets, HeartPulse, Cpu, Rocket, Sun, Trees } from 'lucide-react';

const UPGRADES = [
  {
    id: 'edu_1',
    name: 'Plan de Eficiencia Básica',
    icon: <Zap size={24} />,
    cost: 200000000, 
    incomeBoost: 5000000, 
    expenseReduction: 0,
    description: 'Optimiza procesos básicos. Aumenta ligeramente los ingresos.',
  },
  {
    id: 'infra_1',
    name: 'Renovación de Acueductos',
    icon: <Droplets size={24} />,
    cost: 1500000000, 
    incomeBoost: 0,
    expenseReduction: 30000000, 
    description: 'Evita fugas masivas. Reduce gastos operativos.',
  },
  {
    id: 'health_1',
    name: 'Salud Pública Preventiva',
    icon: <HeartPulse size={24} />,
    cost: 5000000000, 
    incomeBoost: 0,
    expenseReduction: 80000000, 
    description: 'Reduce drásticamente los gastos médicos del estado.',
  },
  {
    id: 'tech_1',
    name: 'Automatización Nacional',
    icon: <Cpu size={24} />,
    cost: 15000000000, 
    incomeBoost: 100000000, 
    expenseReduction: 50000000, 
    description: 'Incrementa ingresos y reduce gastos drásticamente.',
  }
];

const MEGAPROJECTS = [
  {
    id: 'mega_1',
    name: 'Fusión Nuclear Comercial',
    icon: <Sun size={24} />,
    cost: 100000000000, 
    isEndgame: true,
    description: 'Energía infinita. Garantiza la supervivencia de la civilización.',
  },
  {
    id: 'mega_2',
    name: 'Colonización de Marte',
    icon: <Rocket size={24} />,
    cost: 500000000000, 
    isEndgame: true,
    description: 'La humanidad se vuelve multiplanetaria. Victoria Absoluta.',
  }
];

export const UpgradesPanel = ({ state, buyUpgrade, numberingSystem, onOpenTechTree }) => {
  const [purchased, setPurchased] = React.useState({});

  const handleBuy = (upgrade) => {
    if (buyUpgrade(upgrade.cost, upgrade.incomeBoost, upgrade.expenseReduction, upgrade.isEndgame)) {
      setPurchased(prev => ({ ...prev, [upgrade.id]: true }));
    }
  };

  const renderUpgrade = (upg, isMega = false) => {
    const isPurchased = purchased[upg.id];
    const canAfford = state.treasury >= upg.cost;
    
    return (
      <div 
        key={upg.id} 
        className={`upgrade-card ${isMega ? 'mega-card' : ''} ${isPurchased ? 'purchased' : ''} ${(!canAfford && !isPurchased) ? 'disabled' : ''} ${canAfford && !isPurchased ? 'affordable' : ''}`}
      >
        <div className="d-flex" style={{ gap: '1rem', marginBottom: '1rem' }}>
          <div className="stat-icon text-cyan" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {upg.icon}
          </div>
          <div>
            <h4 style={{ color: isMega ? 'var(--warning)' : 'var(--text-main)', margin: 0 }}>{upg.name}</h4>
            <p className="text-xs text-muted mt-1">{upg.description}</p>
          </div>
        </div>

        <div className="d-flex align-center" style={{ justifyContent: 'space-between' }}>
          <div>
            {upg.incomeBoost > 0 && <span className="badge badge-success">+{formatCurrency(upg.incomeBoost, numberingSystem)}/m</span>}
            {upg.expenseReduction > 0 && <span className="badge badge-success">-{formatCurrency(upg.expenseReduction, numberingSystem)}/m</span>}
            {upg.isEndgame && <span className="badge badge-warning">🏆 VICTORIA</span>}
          </div>
          <button 
            onClick={() => handleBuy(upg)} 
            disabled={isPurchased || !canAfford}
            className={`btn ${isPurchased ? 'btn-success' : (canAfford ? 'btn-primary' : 'btn-secondary')}`}
          >
            {isPurchased ? '✔️ Financiado' : formatCurrency(upg.cost, numberingSystem)}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel upgrades-panel">
      <div className="d-flex justify-between align-center mb-3 flex-wrap gap-2">
        <h3 className="d-flex align-center gap-2 m-0">
          <Cpu className="text-cyan" /> Inversiones a Largo Plazo
        </h3>
        <button
          className="btn btn-outline btn-xs d-flex align-center gap-1"
          onClick={onOpenTechTree}
          title="Ver Árbol Tecnológico en Grafo de Nodos"
        >
          <Trees size={14} className="text-cyan" />
          <span>Ver Árbol Tecnológico en Grafo</span>
        </button>
      </div>
      <p className="text-xs text-muted mb-4">Gasta ahora para mejorar tu flujo de caja.</p>
      
      <div className="upgrades-list">
        {UPGRADES.map(upg => renderUpgrade(upg))}
      </div>

      <h3 className="d-flex align-center gap-2 mt-5 mb-2 text-warning">
        <Rocket className="text-warning" /> Proyectos Megalómanos
      </h3>
      <p className="text-xs text-muted mb-4">Financia uno de estos para ganar la partida.</p>
      <div className="upgrades-list">
        {MEGAPROJECTS.map(upg => renderUpgrade(upg, true))}
      </div>
    </div>
  );
};
