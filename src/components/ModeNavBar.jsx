import React from 'react';
import { Layers, Landmark, Rocket, Sparkles } from 'lucide-react';

export const ModeNavBar = ({ activeMode, onSelectMode }) => {
  return (
    <nav className="mode-nav-bar glass-panel mb-3 d-flex align-center justify-between p-1">
      <button
        id="btn-mode-scale"
        className={`mode-nav-btn flex-1 d-flex align-center justify-center gap-2 p-2 ${
          activeMode === 'scale' ? 'active' : ''
        }`}
        onClick={() => onSelectMode('scale')}
      >
        <span className="mode-nav-badge">Paso 1</span>
        <Layers size={18} className="text-cyan" />
        <div className="text-left">
          <div className="font-bold text-sm">
            <span className="hide-mobile">Calibre de Cifras</span>
            <span className="show-mobile">1. Calibre</span>
          </div>
          <div className="text-xs text-muted hide-mobile">Entiende 1 Millón vs 1 Billón</div>
        </div>
      </button>

      <button
        id="btn-mode-govern"
        className={`mode-nav-btn flex-1 d-flex align-center justify-center gap-2 p-2 ${
          activeMode === 'govern' ? 'active' : ''
        }`}
        onClick={() => onSelectMode('govern')}
      >
        <span className="mode-nav-badge highlight">Paso 2</span>
        <Landmark size={18} className="text-warning" />
        <div className="text-left">
          <div className="font-bold text-sm">
            <span className="hide-mobile">Gobernar España</span>
            <span className="show-mobile">2. Gobernar</span>
          </div>
          <div className="text-xs text-muted hide-mobile">Presupuesto Real + 2.5k Agentes</div>
        </div>
      </button>

      <button
        id="btn-mode-futures"
        className={`mode-nav-btn flex-1 d-flex align-center justify-center gap-2 p-2 ${
          activeMode === 'futures' ? 'active' : ''
        }`}
        onClick={() => onSelectMode('futures')}
      >
        <span className="mode-nav-badge">Paso 3</span>
        <Rocket size={18} className="text-purple" style={{ color: '#c084fc' }} />
        <div className="text-left">
          <div className="font-bold text-sm">
            <span className="hide-mobile">Efecto Ender & Futuros</span>
            <span className="show-mobile">3. Ender</span>
          </div>
          <div className="text-xs text-muted hide-mobile">Dilemas Globales & Escenarios</div>
        </div>
      </button>
    </nav>
  );
};
