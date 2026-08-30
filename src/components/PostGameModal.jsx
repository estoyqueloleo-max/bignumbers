import React, { useState } from 'react';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { getRealWorldTimeEquivalent } from '../utils/scaleData';
import { Trophy, Skull, Share2, RotateCcw, Award, Check, Calendar, Users, Landmark, AlertTriangle } from 'lucide-react';

export const PostGameModal = ({ state, onRestart, numberingSystem }) => {
  const [copied, setCopied] = useState(false);

  if (!state.gameOver && !state.gameWon) return null;

  const isWon = state.gameWon;
  const years = (state.month / 12).toFixed(1);
  const peakTimeEq = getRealWorldTimeEquivalent(state.peakTreasury || state.treasury);

  let title = 'Gobernante Provisional';
  if (isWon) {
    if ((state.peakTreasury || 0) >= 500000000000) {
      title = 'Emperador de la Era Multiplanetaria 🚀';
    } else {
      title = 'Visionario de la Fusión y Gran Estadista ⚡';
    }
  } else {
    if (state.month >= 60) {
      title = 'Estadista Resiliente ante la Adversidad 🏛️';
    } else {
      title = 'Víctima del Espejismo de los Millones 📉';
    }
  }

  const shareText = `📊 Simulador de Grandes Cifras
${isWon ? '🏆 ¡VICTORIA ABSOLUTA!' : '💀 Colapso Nacional'}
🏛️ Título: ${title}
⏱️ Duración: ${state.month} meses (~${years} años)
💰 Pico de Tesorería: ${formatCurrency(state.peakTreasury || state.treasury, numberingSystem)} (${peakTimeEq} contando a $1/s)
👥 Población Final: ${formatLargeNumber(state.population, numberingSystem)}
🛡️ Crisis Superadas: ${state.crisesResolved || 0}
Juega en: https://estoyqueloleo-max.github.io/big_numbers/`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-container post-game-modal text-center p-5">
        <div className="mb-3">
          {isWon ? (
            <div className="trophy-badge mx-auto mb-2 text-warning animate-bounce">
              <Trophy size={64} />
            </div>
          ) : (
            <div className="skull-badge mx-auto mb-2 text-danger">
              <Skull size={64} />
            </div>
          )}
          <h2 className={isWon ? 'text-success m-0' : 'text-danger m-0'}>
            {isWon ? '¡MISIÓN CUMPLIDA! VICTORIA HISTÓRICA' : 'COLAPSO NACIONAL'}
          </h2>
          <div className="text-warning font-bold text-sm mt-1">{title}</div>
        </div>

        <p className="text-sm text-muted mb-4">
          {isWon
            ? 'Comprendiste a la perfección cómo escalar tu economía y tus inversiones para financiar hitos que cambiaron el destino de la especie humana.'
            : 'Los gastos a gran escala y las crisis billonarias agotaron tus reservas. El espejismo de los millones te enseñó lo rápido que se consume el dinero sin previsión.'}
        </p>

        {/* REJILLA DE ESTADÍSTICAS DEL MANDATO */}
        <div className="post-game-stats-grid glass-panel p-3 mb-4 text-left">
          <div className="stat-row d-flex justify-between py-1 border-bottom border-glass text-xs">
            <span className="text-muted d-flex align-center gap-1"><Calendar size={14} /> Tiempo en el Poder:</span>
            <strong>{state.month} meses (~{years} años)</strong>
          </div>
          <div className="stat-row d-flex justify-between py-1 border-bottom border-glass text-xs">
            <span className="text-muted d-flex align-center gap-1"><Landmark size={14} /> Tesorería Máxima:</span>
            <strong className="text-success">{formatCurrency(state.peakTreasury || state.treasury, numberingSystem)}</strong>
          </div>
          <div className="stat-row d-flex justify-between py-1 border-bottom border-glass text-xs">
            <span className="text-muted d-flex align-center gap-1"><Users size={14} /> Población:</span>
            <strong>{formatLargeNumber(state.population, numberingSystem)}</strong>
          </div>
          <div className="stat-row d-flex justify-between py-1 border-bottom border-glass text-xs">
            <span className="text-muted d-flex align-center gap-1"><AlertTriangle size={14} /> Crisis Resueltas:</span>
            <strong className="text-cyan">{state.crisesResolved || 0}</strong>
          </div>
          <div className="stat-row d-flex justify-between py-1 text-xs">
            <span className="text-muted d-flex align-center gap-1"><Award size={14} /> Equivalencia Temporal del Pico:</span>
            <strong className="text-warning">{peakTimeEq}</strong>
          </div>
        </div>

        <div className="d-flex gap-2 justify-center">
          <button className="btn btn-outline d-flex align-center gap-2" onClick={handleCopy}>
            {copied ? <><Check size={16} /> ¡Copiado!</> : <><Share2 size={16} /> Compartir Resumen</>}
          </button>
          <button className="btn btn-primary d-flex align-center gap-2" onClick={onRestart}>
            <RotateCcw size={16} /> Nuevo Mandato / Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
};
