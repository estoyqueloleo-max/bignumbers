import React, { useState } from 'react';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { GLOBAL_PROJECTS, NATION_ARCHETYPES, resolveAssemblyRound } from '../utils/gameTheory';
import { REAL_WORLD_FACTS } from '../utils/realWorldData';
import { SCENARIOS } from '../utils/scenarios';
import { Globe3DCanvas } from './Globe3DCanvas';
import { playWinSound, playThudSound } from '../utils/audio';
import {
  Rocket,
  Globe,
  Users,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  BookOpen,
  ArrowRight,
  Flag,
  Target,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const EnderFuturesView = ({
  state,
  applyAssemblyImpact,
  loadScenario,
  numberingSystem,
  onGoToGovern
}) => {
  const [activeSubTab, setActiveSubTab] = useState('assembly'); // 'assembly' | 'scenarios' | 'missions'
  const [selectedProject, setSelectedProject] = useState(GLOBAL_PROJECTS[0]);
  const [roundResult, setRoundResult] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [activeMission, setActiveMission] = useState(null);

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

  const handleSelectScenario = (scId) => {
    loadScenario(scId);
    if (onGoToGovern) onGoToGovern();
  };

  return (
    <div className="ender-futures-view d-flex flex-column gap-4 animate-fade-in">
      {/* BANNER INTRODUCTORIO */}
      <div className="glass-panel p-4" style={{ borderLeft: '4px solid #c084fc' }}>
        <div className="d-flex justify-between align-center flex-wrap gap-2">
          <div>
            <div className="d-flex align-center gap-2 mb-1">
              <span className="badge text-xs" style={{ background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc' }}>
                Paso 3 del Viaje
              </span>
              <h2 className="m-0" style={{ color: '#c084fc' }}>Futuros & El Efecto Ender</h2>
            </div>
            <p className="text-muted m-0" style={{ maxWidth: '800px', lineHeight: '1.5' }}>
              En la novela <em>El Juego de Ender</em>, el protagonista cree estar jugando a un simulador táctico 
              hasta que descubre que sus decisiones estaban transformando el mundo real. 
              Aquí puedes experimentar dilemas de teoría de juegos, proyectar escenarios futuros y contrastar tus votos con las cifras reales del planeta Tierra.
            </p>
          </div>
          <button className="btn btn-outline btn-sm d-flex align-center gap-1" onClick={onGoToGovern}>
            <span>Volver a Gobernar España</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* SUB-NAVEGACIÓN */}
      <div className="subtab-bar glass-panel p-1 d-flex gap-1">
        <button
          className={`btn flex-1 ${activeSubTab === 'assembly' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('assembly')}
        >
          <Globe size={15} />
          <span>Asamblea Global & Efecto Ender</span>
        </button>
        <button
          className={`btn flex-1 ${activeSubTab === 'scenarios' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('scenarios')}
        >
          <Flag size={15} />
          <span>Escenarios "What If"</span>
        </button>
        <button
          className={`btn flex-1 ${activeSubTab === 'missions' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('missions')}
        >
          <Target size={15} />
          <span>Misiones Pedagógicas (Retos)</span>
        </button>
      </div>

      {/* SUBTAB 1: ASAMBLEA GLOBAL & EFECTO ENDER */}
      {activeSubTab === 'assembly' && (
        <div className="assembly-container d-flex flex-column gap-4">
          <div className="grid-2-col gap-4">
            {/* GLOBO TERRÁQUEO 3D Y DELEGACIONES IA */}
            <div className="glass-panel p-3 d-flex flex-column gap-3">
              <h3 className="text-sm text-muted uppercase font-bold m-0" style={{ letterSpacing: '1px' }}>
                🌍 Geopolítica y Teoría de Juegos (Dilema del Prisionero)
              </h3>
              <div style={{ height: '240px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                <Globe3DCanvas />
              </div>

              <div>
                <div className="text-xs text-muted font-bold uppercase mb-2">Delegaciones con IA en la Mesa:</div>
                <div className="d-flex flex-column gap-2">
                  {NATION_ARCHETYPES.map((arch) => (
                    <div key={arch.id} className="p-2 rounded text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="d-flex align-center justify-between mb-1">
                        <span className="font-bold">{arch.avatar} {arch.name}</span>
                        <span className="badge text-xs" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                          {arch.type}
                        </span>
                      </div>
                      <div className="text-muted">{arch.bio}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SELECCIÓN DE TRATADO Y VOTACIÓN */}
            <div className="glass-panel p-3 d-flex flex-column justify-between gap-3">
              <div>
                <h3 className="text-sm text-muted uppercase font-bold mb-2" style={{ letterSpacing: '1px' }}>
                  📜 Proyecto Global a Votación
                </h3>

                <div className="d-flex gap-1 mb-3 flex-wrap">
                  {GLOBAL_PROJECTS.map((proj) => (
                    <button
                      key={proj.id}
                      className={`btn btn-xs ${selectedProject.id === proj.id ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => {
                        setSelectedProject(proj);
                        setRoundResult(null);
                      }}
                    >
                      {proj.name}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded mb-3" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <h4 className="m-0 mb-1 text-cyan font-bold">{selectedProject.name}</h4>
                  <p className="text-xs text-muted mb-2">{selectedProject.description}</p>
                  <div className="grid-2-col gap-2 text-xs">
                    <div><strong>Coste por Nación:</strong> {formatCurrency(selectedProject.totalCost / 4, numberingSystem)}</div>
                    <div><strong>Beneficio si se aprueba:</strong> +{formatCurrency(selectedProject.benefitPerPlayer, numberingSystem)}/m</div>
                    <div><strong>Umbral requerido:</strong> {selectedProject.cooperationThreshold} de 4 naciones</div>
                    <div><strong>Ganancia del Desertor:</strong> +{formatCurrency(selectedProject.freeRiderGain, numberingSystem)} (Free-Rider)</div>
                  </div>
                </div>

                {/* BOTONES DE VOTACIÓN */}
                {!roundResult ? (
                  <div className="d-flex flex-column gap-2">
                    <div className="text-xs text-muted text-center">¿Cuál es tu voto como mandatario soberano?</div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success flex-1 d-flex align-center justify-center gap-1"
                        onClick={() => handleVote(true)}
                      >
                        <ShieldCheck size={16} />
                        <span>Cooperar y Financiar</span>
                      </button>
                      <button
                        className="btn btn-danger flex-1 d-flex align-center justify-center gap-1"
                        onClick={() => handleVote(false)}
                      >
                        <ShieldAlert size={16} />
                        <span>Desertar (Free-Rider)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="round-result-box p-3 rounded text-xs animate-fade-in" style={{
                    background: roundResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${roundResult.success ? '#10b981' : '#ef4444'}`
                  }}>
                    <div className="font-bold text-sm mb-1 d-flex align-center gap-1">
                      {roundResult.success ? '✅ ¡Tratado Internacional Aprobado!' : '❌ Fracaso de Cooperación por Oportunismo'}
                    </div>
                    <p className="m-0 mb-2">{roundResult.playerMessage}</p>
                    <button className="btn btn-outline btn-xs" onClick={() => setRoundResult(null)}>
                      Votar en otra resolución
                    </button>
                  </div>
                )}
              </div>

              {/* LA REVELACIÓN DEL EFECTO ENDER */}
              {currentFact && (
                <div className="ender-reveal-box p-3 rounded" style={{ background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
                  <div className="d-flex align-center gap-2 mb-1">
                    <Sparkles size={16} style={{ color: '#c084fc' }} />
                    <span className="font-bold text-xs uppercase" style={{ color: '#c084fc', letterSpacing: '1px' }}>
                      El Efecto Ender: La Realidad de la Tierra
                    </span>
                  </div>
                  <div className="font-bold text-xs mb-1">{currentFact.topic}</div>
                  <blockquote className="text-xs m-0 mb-2 italic" style={{ borderLeft: '2px solid #c084fc', paddingLeft: '8px', color: '#e9d5ff' }}>
                    "{currentFact.realWorldQuote}"
                  </blockquote>
                  <div className="d-flex justify-between text-xs text-muted">
                    <span><strong>Fuente Oficial:</strong> {currentFact.source}</span>
                    <span className="text-warning">💡 {currentFact.takeaway}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ESCENARIOS WHAT IF */}
      {activeSubTab === 'scenarios' && (
        <div className="scenarios-container d-flex flex-column gap-3">
          <p className="text-muted text-sm m-0">
            Selecciona un punto de partida histórico o hipotético para proyectar futuros alternativos en el motor económico:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {SCENARIOS.map((sc) => (
              <div
                key={sc.id}
                className="scenario-card glass-panel p-3 d-flex flex-column justify-between gap-2"
                style={{ border: state.scenarioId === sc.id ? '2px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.08)' }}
              >
                <div>
                  <div className="d-flex justify-between align-center mb-1">
                    <span className="font-bold text-cyan">{sc.name}</span>
                    <span className="badge text-xs" style={{ background: 'rgba(255,255,255,0.1)' }}>{sc.difficulty}</span>
                  </div>
                  <div className="badge badge-cyan text-xs mb-2">{sc.tag}</div>
                  <p className="text-xs text-muted m-0">{sc.description}</p>
                </div>

                <div className="pt-2 d-flex justify-between align-center" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-xs text-muted">Población: {(sc.initialState.population / 1e6).toFixed(0)}M</span>
                  <button
                    className="btn btn-primary btn-xs d-flex align-center gap-1"
                    onClick={() => handleSelectScenario(sc.id)}
                  >
                    <span>Cargar en el Simulador</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: MISIONES PEDAGÓGICAS */}
      {activeSubTab === 'missions' && (
        <div className="missions-container d-flex flex-column gap-3">
          <p className="text-muted text-sm m-0">
            Retos rápidos de 3 minutos diseñados para aprender los conceptos más contraintuitivos del dinero público:
          </p>

          <div className="grid-3-col gap-3">
            {/* RETO 1 */}
            <div className="glass-panel p-3 d-flex flex-column justify-between gap-3">
              <div>
                <div className="d-flex align-center gap-1 mb-1">
                  <span className="badge badge-warning text-xs">Reto 1</span>
                  <span className="font-bold text-sm">El Abismo del Billón</span>
                </div>
                <p className="text-xs text-muted mb-2">
                  <strong>Pregunta trampa:</strong> A menudo se propone «recortar sueldos de diputados» para cuadrar las cuentas del país. 
                  En España, todos los diputados juntos cobran unos ~25 Millones de € al año.
                </p>
                <div className="text-xs p-2 rounded" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                  <strong>El dilema de escala:</strong> El gasto anual en pensiones supera los <strong>190.000 Millones de €</strong>. 
                  ¡El sueldo de los diputados representa apenas un 0,01% del presupuesto!
                </div>
              </div>
              <button className="btn btn-outline btn-xs w-100" onClick={onGoToGovern}>
                Ver las partidas en el Presupuesto Real →
              </button>
            </div>

            {/* RETO 2 */}
            <div className="glass-panel p-3 d-flex flex-column justify-between gap-3">
              <div>
                <div className="d-flex align-center gap-1 mb-1">
                  <span className="badge badge-cyan text-xs">Reto 2</span>
                  <span className="font-bold text-sm">El Hormiguero Humano (ABM)</span>
                </div>
                <p className="text-xs text-muted mb-2">
                  En los modelos económicos tradicionales solo ves ecuaciones abstractas. En nuestro <strong>ABM</strong>, cada punto en pantalla es un ciudadano con hipoteca, consumo y salud.
                </p>
                <div className="text-xs p-2 rounded" style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <strong>Misión:</strong> Cambia a la Lupa Micro en el diorama. Si subes los impuestos drásticamente, verás a los autónomos y asalariados concentrarse en la plaza cívica en protesta.
                </div>
              </div>
              <button className="btn btn-outline btn-xs w-100" onClick={onGoToGovern}>
                Observar los 2.500 agentes en directo →
              </button>
            </div>

            {/* RETO 3 */}
            <div className="glass-panel p-3 d-flex flex-column justify-between gap-3">
              <div>
                <div className="d-flex align-center gap-1 mb-1">
                  <span className="badge text-xs" style={{ background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc' }}>Reto 3</span>
                  <span className="font-bold text-sm">El Efecto Ender Geopolítico</span>
                </div>
                <p className="text-xs text-muted mb-2">
                  ¿Por qué es tan difícil financiar bienes públicos globales como la prevención de pandemias o el clima?
                </p>
                <div className="text-xs p-2 rounded" style={{ background: 'rgba(192, 132, 252, 0.1)', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
                  <strong>El dilema del polizón:</strong> Si tú pagas y los demás no, ellos disfrutan de las vacunas gratis mientras tu economía se resiente. Solo la cooperación multilateral rompe la trampa.
                </div>
              </div>
              <button className="btn btn-outline btn-xs w-100" onClick={() => setActiveSubTab('assembly')}>
                Votar en la Asamblea Global ahora →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
