import React, { useState } from 'react';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { getRealWorldTimeEquivalent } from '../utils/scaleData';
import { exportGameToShareUrl, shareMatchViaWebShare } from '../utils/shareUtils';
import { Users, Landmark, Clock, Layers, Flag, Globe, Share2, Check, Sliders, ShieldCheck, Mail, Printer } from 'lucide-react';
import { SCENARIOS } from '../utils/scenarios';

export const HUD = ({
  state,
  activeModifiers,
  numberingSystem,
  onOpenVisualizer,
  onOpenScenarios,
  onOpenAssembly,
  onOpenRules,
  onOpenPassport,
  onOpenDiplomacy,
  onOpenGazetteExport,
  onOpenABM
}) => {
  const [shared, setShared] = useState(false);
  const timeEq = getRealWorldTimeEquivalent(state.treasury);
  const currentScenario = SCENARIOS.find(s => s.id === state.scenarioId) || SCENARIOS[0];

  const handleShareGame = async () => {
    const shareUrl = exportGameToShareUrl(state);
    const text = `📊 Simulador de Grandes Cifras:
Mandato en el mes ${state.month}.
💰 Tesoro: ${formatCurrency(state.treasury, numberingSystem)} (${timeEq} a $1/s)
👥 Población: ${formatLargeNumber(state.population, numberingSystem)}
¿Podrás gestionar mejor el Estado y los bienes globales?`;

    const res = await shareMatchViaWebShare({
      title: 'Desafío del Simulador de Grandes Cifras',
      text,
      url: shareUrl
    });

    if (res.success) {
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  return (
    <div className="hud-bar glass-panel mb-4">
      <div className="hud-top-row d-flex justify-between align-center flex-wrap gap-2">
        <div className="hud-scenario-badge d-flex align-center gap-2 flex-wrap">
          <div
            className="badge badge-cyan d-flex align-center gap-1 cursor-pointer"
            onClick={onOpenScenarios}
            title="Escenario activo en el motor macroeconómico (Clic para cambiar)"
            style={{ padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <Flag size={13} className="text-cyan" />
            <span className="font-bold">{currentScenario.name}</span>
            <span className="opacity-80">({currentScenario.tag})</span>
          </div>

          {state.realDataYear && (
            <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: '0.75rem' }}>
              🇪🇸 Datos Oficiales {state.realDataYear}
            </span>
          )}

          {activeModifiers?.activeCount > 0 && (
            <span className="badge badge-success text-xs">
              ⚙️ {activeModifiers.activeCount} mods activos
            </span>
          )}
        </div>

        <div className="hud-share-box d-flex align-center gap-2">
          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={handleShareGame}
            title="Compartir estado de la partida por Web Share API o WhatsApp"
          >
            {shared ? <Check size={14} className="text-success" /> : <Share2 size={14} className="text-cyan" />}
            <span>{shared ? '¡Copiado!' : 'Compartir Estado'}</span>
          </button>
        </div>
      </div>

      <div className="hud-metrics-row d-flex justify-between align-center flex-wrap gap-3">
        {/* POBLACIÓN */}
        <div className="hud-item d-flex align-center gap-3">
          <div className="hud-icon-box">
            <Users size={32} className="text-cyan" />
          </div>
          <div className="hud-value-container">
            <span className="hud-label text-muted text-xs">Población Activa</span>
            <span className={`hud-value ${state.population <= 0 ? 'negative' : ''}`}>
              {formatLargeNumber(state.population, numberingSystem)}
            </span>
          </div>
        </div>

        {/* TESORERÍA NACIONAL & RELOJ TEMPORAL */}
        <div className="hud-item d-flex align-center gap-3">
          <div className="hud-icon-box">
            <Landmark
              size={32}
              style={{
                color: state.treasury === 0 ? 'var(--danger)' : 'var(--success)',
                filter: 'drop-shadow(0 0 8px var(--success-glow))'
              }}
            />
          </div>
          <div className="hud-value-container">
            <div className="d-flex align-center gap-2">
              <span className="hud-label text-muted text-xs">Tesorería Nacional</span>
              <button
                className="btn btn-xs btn-outline d-flex align-center gap-1 scale-btn-badge"
                onClick={onOpenVisualizer}
                title="Abrir Visor de Magnitudes y Potencias de 10"
              >
                <Layers size={12} className="text-warning" />
                <span className="text-warning">Visor de Escala</span>
              </button>
            </div>
            <span className={`hud-value ${state.treasury === 0 ? 'negative' : 'positive'}`}>
              {formatCurrency(state.treasury, numberingSystem)}
            </span>
            <div className="hud-time-equivalent text-xs text-muted d-flex align-center gap-1 mt-1">
              <Clock size={12} className="text-warning" />
              <span>Tiempo a $1/s: <strong className="text-warning">{timeEq}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
