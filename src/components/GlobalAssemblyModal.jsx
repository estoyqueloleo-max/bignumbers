import React, { useState } from 'react';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { GLOBAL_PROJECTS, NATION_ARCHETYPES, resolveAssemblyRound } from '../utils/gameTheory';
import { REAL_WORLD_FACTS } from '../utils/realWorldData';
import { exportGameToShareUrl, shareMatchViaWebShare } from '../utils/shareUtils';
import { Globe3DCanvas } from './Globe3DCanvas';
import { P2PRoomModal } from './P2PRoomModal';
import { playWinSound, playThudSound, playCoinSound } from '../utils/audio';
import { Globe, Users, ShieldCheck, ShieldAlert, Sparkles, Share2, Check, ArrowRight, BookOpen, Wifi, X } from 'lucide-react';

export const GlobalAssemblyModal = ({
  isOpen,
  onClose,
  state,
  applyAssemblyImpact,
  numberingSystem
}) => {
  const [selectedProject, setSelectedProject] = useState(GLOBAL_PROJECTS[0]);
  const [roundResult, setRoundResult] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [shared, setShared] = useState(false);
  const [showP2PRoom, setShowP2PRoom] = useState(false);

  if (!isOpen) return null;

  const currentFact = REAL_WORLD_FACTS[selectedProject.realWorldIndex || 0];

  const handleVote = (playerCooperated) => {
    const result = resolveAssemblyRound(selectedProject, playerCooperated, roundHistory);
    setRoundResult(result);
    setRoundHistory(prev => [result, ...prev]);

    if (applyAssemblyImpact) {
      applyAssemblyImpact(result.playerNetImpact);
    }

    if (result.success) {
      playWinSound();
    } else {
      playThudSound();
    }
  };

  const handleShareRound = async () => {
    const shareUrl = exportGameToShareUrl(state);
    const text = `🌐 Asamblea Global de Grandes Cifras:
He votado en el proyecto "${selectedProject.name}".
Resultado: ${roundResult.success ? '✅ ¡Tratado Exitoso!' : '❌ Fracaso por Free-Riders'}
${roundResult.playerMessage}
¿Podrás gobernar mejor y cooperar?`;

    const res = await shareMatchViaWebShare({
      title: 'Desafío de Asamblea Global',
      text,
      url: shareUrl
    });

    if (res.success) {
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  const resetRound = () => {
    setRoundResult(null);
  };

  return (
    <div className="modal-overlay">
      <P2PRoomModal isOpen={showP2PRoom} onClose={() => setShowP2PRoom(false)} />

      <div className="glass-panel modal-container global-assembly-modal">
        <div className="modal-header d-flex align-center justify-between flex-wrap gap-2">
          <div className="d-flex align-center gap-2">
            <Globe className="text-cyan animate-pulse" size={24} />
            <h2 className="m-0 text-cyan text-base">Asamblea de Naciones: El Dilema del Prisionero</h2>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-outline btn-xs d-flex align-center gap-1"
              onClick={() => setShowP2PRoom(true)}
              title="Crear o unirse a sala P2P en vivo sin servidor"
            >
              <Wifi size={14} className="text-warning" />
              <span>Sala P2P en Vivo (QR)</span>
            </button>
            <button className="btn-icon" onClick={onClose} aria-label="Cerrar modal">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* GLOBO TERRÁQUEO 3D GEOPOLÍTICO */}
          <Globe3DCanvas
            decisions={roundResult ? roundResult.decisions : { player: true, technocrat: true, freerider: false, tit_for_tat: true }}
            success={roundResult ? roundResult.success : true}
          />

          {!roundResult ? (
            <>
              <p className="text-xs text-muted mb-4">
                En un mundo globalizado, ninguna nación se salva sola. Los megaproyectos requieren quórum multilateral. Si cooperas pero otros desertan, pierdes tus recursos. Si todos desertan, sobreviene la catástrofe.
              </p>

              {/* SELECTOR DE PROYECTO GLOBAL */}
              <div className="projects-selector-grid mb-4">
                {GLOBAL_PROJECTS.map(proj => (
                  <button
                    key={proj.id}
                    className={`btn text-left p-3 ${selectedProject.id === proj.id ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSelectedProject(proj)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <span className="font-bold text-sm mb-1">{proj.name}</span>
                    <span className="text-xs opacity-80">
                      Coste: {formatCurrency(proj.totalCost, numberingSystem)} • Requiere {proj.cooperationThreshold}/4 votos
                    </span>
                  </button>
                ))}
              </div>

              {/* LAS 4 NACIONES EN LA MESA */}
              <div className="nations-table glass-panel p-3 mb-4">
                <h4 className="text-xs text-muted mb-2 uppercase font-bold">Naciones en la Mesa de Negociación</h4>
                <div className="nations-grid">
                  <div className="nation-card user-nation p-2 glass-panel">
                    <div className="font-bold text-cyan text-sm">👑 Tu Nación (Jugador)</div>
                    <div className="text-xs text-muted">Tú decides si cooperar o desertar.</div>
                  </div>
                  {NATION_ARCHETYPES.map(nation => (
                    <div key={nation.id} className="nation-card p-2 glass-panel">
                      <div className="font-bold text-sm">{nation.avatar} {nation.name}</div>
                      <div className="text-xs text-warning">{nation.type}</div>
                      <div className="text-xs text-muted mt-1">{nation.bio}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DETALLES DEL DILEMA */}
              <div className="dilemma-matrix-box glass-panel p-3 mb-4">
                <h4 className="text-sm font-bold text-warning mb-1">Matriz de Consecuencias</h4>
                <p className="text-xs text-muted mb-3">{selectedProject.description}</p>

                <div className="d-flex gap-3 justify-center">
                  <button
                    className="btn btn-success flex-1 py-3"
                    onClick={() => handleVote(true)}
                  >
                    <ShieldCheck size={18} />
                    <span>COOPERAR (Aportar Cuota)</span>
                  </button>

                  <button
                    className="btn btn-danger flex-1 py-3"
                    onClick={() => handleVote(false)}
                  >
                    <ShieldAlert size={18} />
                    <span>DESERTAR (Free-Rider)</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* RESULTADO DE LA RONDA & EL EFECTO ENDER */
            <div className="round-result-view">
              <div className={`result-banner glass-panel p-4 mb-4 text-center ${roundResult.success ? 'border-success' : 'border-danger'}`}>
                <h3 className={roundResult.success ? 'text-success mb-2' : 'text-danger mb-2'}>
                  {roundResult.success ? '✅ ¡TRATADO GLOBAL RATIFICADO!' : '❌ PROYECTO FRACASADO POR FALTA DE COOPERACIÓN'}
                </h3>
                <p className="text-sm mb-3">{roundResult.playerMessage}</p>

                <div className="votes-breakdown d-flex justify-center gap-3 flex-wrap text-xs font-bold mb-3">
                  <span className={roundResult.decisions.player ? 'text-success' : 'text-danger'}>
                    👑 Tú: {roundResult.decisions.player ? 'Cooperó' : 'Desertó'}
                  </span>
                  {NATION_ARCHETYPES.map(nat => (
                    <span key={nat.id} className={roundResult.decisions[nat.id] ? 'text-success' : 'text-danger'}>
                      {nat.avatar} {nat.name}: {roundResult.decisions[nat.id] ? 'Cooperó' : 'Desertó'}
                    </span>
                  ))}
                </div>

                <div className="impact-badge text-sm">
                  Impacto Financiero en tu Tesorería:{' '}
                  <strong className={roundResult.playerNetImpact >= 0 ? 'text-success' : 'text-danger'}>
                    {roundResult.playerNetImpact >= 0 ? '+' : ''}{formatCurrency(roundResult.playerNetImpact, numberingSystem)}
                  </strong>
                </div>
              </div>

              {/* EL EFECTO ENDER: CONTRASTE CON LA REALIDAD */}
              <div className="ender-effect-card glass-panel p-4 mb-4">
                <div className="d-flex align-center gap-2 mb-2">
                  <BookOpen className="text-warning" size={20} />
                  <h4 className="m-0 text-warning font-bold">El Espejo de la Realidad (Efecto Ender)</h4>
                </div>
                <div className="text-xs text-muted mb-2">
                  {currentFact.icon} <strong>{currentFact.topic}</strong> • Fuente: {currentFact.source}
                </div>
                <blockquote className="ender-quote text-sm mb-3">
                  "{currentFact.realWorldQuote}"
                </blockquote>
                <div className="ender-takeaway text-xs text-cyan font-bold">
                  💡 Lección: {currentFact.takeaway}
                </div>
              </div>

              {/* ACCIONES POST-RONDA */}
              <div className="d-flex justify-between align-center flex-wrap gap-2">
                <button
                  className="btn btn-outline d-flex align-center gap-2"
                  onClick={handleShareRound}
                >
                  <Share2 size={16} />
                  <span>{shared ? '¡Enviado / Copiado!' : 'Compartir / Desafiar a un Amigo (P2P)'}</span>
                </button>

                <div className="d-flex gap-2">
                  <button className="btn btn-primary" onClick={resetRound}>
                    Siguiente Votación <ArrowRight size={16} />
                  </button>
                  <button className="btn btn-secondary" onClick={onClose}>
                    Volver al Mando
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
