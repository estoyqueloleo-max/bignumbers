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
          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={onOpenScenarios}
            title="Cambiar Escenario o Modo de Juego"
          >
            <Flag size={14} className="text-cyan" />
            <span>{currentScenario.name}</span>
            <span className="badge badge-cyan text-xs">{currentScenario.tag}</span>
          </button>

          <button
            id="hud-open-abm-btn"
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={onOpenABM}
            title="Micro-Mundo ABM: Simulación Basada en 2.500 Agentes"
            style={{ borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.1)' }}
          >
            <Users size={14} className="text-cyan" />
            <span className="text-cyan font-bold">Micro-Mundo ABM</span>
            <span className="badge badge-cyan text-xs">2.500 Agentes</span>
          </button>

          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1 assembly-btn-highlight"
            onClick={onOpenAssembly}
            title="Asamblea de Naciones: Dilema del Prisionero & Efecto Ender"
          >
            <Globe size={14} className="text-warning animate-pulse" />
            <span className="text-warning font-bold">Asamblea Global</span>
          </button>

          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={onOpenDiplomacy}
            title="Diplomacia Asíncrona por Correo y Tratados Bilaterales"
          >
            <Mail size={14} className="text-cyan" />
            <span>Diplomacia P2P</span>
          </button>

          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={onOpenPassport}
            title="Pasaporte Presidencial y Firma Criptográfica (ECDSA)"
          >
            <ShieldCheck size={14} className="text-warning" />
            <span>Pasaporte</span>
          </button>

          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={onOpenGazetteExport}
            title="Exportar Portada Oficial de la Gaceta del Estado"
          >
            <Printer size={14} className="text-cyan" />
            <span>Imprimir Portada</span>
          </button>

          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={onOpenRules}
            title="Motor de Expansión de Reglas & Mods"
          >
            <Sliders size={14} className="text-cyan" />
            <span>Reglas & Mods</span>
            {activeModifiers?.activeCount > 0 && (
              <span className="badge badge-success text-xs">{activeModifiers.activeCount} activas</span>
            )}
          </button>
        </div>

        <div className="hud-share-box">
          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={handleShareGame}
            title="Compartir partida por Web Share API o WhatsApp (P2P / Asíncrono)"
          >
            {shared ? <Check size={14} className="text-success" /> : <Share2 size={14} className="text-cyan" />}
            <span>{shared ? '¡Enlace Compartido!' : 'Compartir Partida (P2P)'}</span>
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
