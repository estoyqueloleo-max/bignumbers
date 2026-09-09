/**
 * ABMVisualizerModal.jsx — Visualizador y Laboratorio del Micro-Mundo ABM
 *
 * Muestra 2.500 agentes individuales interactuando en un canvas 2D con físicas urbanas,
 * expediente ciudadano interactivo al hacer clic, curva de Lorenz / Gini en tiempo real
 * y laboratorio de choques de política económica.
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useABMSimulation } from '../hooks/useABMSimulation';
import { formatCurrency } from '../utils/formatters';
import {
  Users, Play, Pause, StepForward, RotateCcw, AlertTriangle,
  TrendingUp, TrendingDown, DollarSign, Activity, Sparkles,
  Building2, Flame, Heart, HeartHandshake, ShieldCheck, Zap, X, Search
} from 'lucide-react';

const COHORT_META = {
  retired: { label: 'Jubilado / Pensionista', color: '#ec4899', icon: '👵' },
  employed: { label: 'Trabajador Asalariado', color: '#38bdf8', icon: '💼' },
  unemployed: { label: 'Desempleado (Paro)', color: '#ef4444', icon: '📉' },
  firm_owner: { label: 'Autónomo / Pyme', color: '#f59e0b', icon: '🏪' },
  public_worker: { label: 'Empleado Público', color: '#10b981', icon: '🏛️' },
};

export function ABMVisualizerModal({ onClose, gameState, numberingSystem }) {
  const canvasRef = useRef(null);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 500 });
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const {
    agents,
    firms,
    macroStats,
    isSimRunning,
    setIsSimRunning,
    step,
    injectShock,
    activeShock,
    stepCount,
    lastStepStats,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    findAgentAt,
    resetPopulation,
  } = useABMSimulation(gameState, false, speedMultiplier);

  // Render loop continuo a 60fps en Canvas para partículas y movimiento de agentes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. FONDO URBANO Y DISTRITOS
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cuadrantes de distritos con rejillas sutiles
      const midX = canvas.width / 2;
      const midY = canvas.height / 2;

      // Líneas divisorias de distritos
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(midX, 0); ctx.lineTo(midX, canvas.height);
      ctx.moveTo(0, midY); ctx.lineTo(canvas.width, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Etiquetas de distritos
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillText('🏡 DISTRITO RESIDENCIAL & PENSIONISTAS', 25, 25);
      ctx.fillText('🏭 POLÍGONO INDUSTRIAL & COMERCIOS', midX + 25, 25);
      ctx.fillText('🏢 BARRIO OBRERO & SERVICIOS', 25, midY + 25);
      ctx.fillText('🏛️ PLAZA MAYOR & CENTRO CÍVICO (PROTESTAS)', midX + 25, midY + 25);

      // Zona central de la Plaza de Protestas (Círculo cívico)
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(midX, midY, 60, 0, Math.PI * 2);
      ctx.stroke();

      // 2. DIBUJAR LOS 2.500 AGENTES
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i];
        const isSelected = a.id === selectedAgentId;
        const isHovered = hoveredAgent && a.id === hoveredAgent.id;

        // Color por cohorte o por protesta
        let color = COHORT_META[a.cohort]?.color || '#94a3b8';
        let radius = 2.2;

        if (a.isProtesting) {
          color = '#f97316'; // Naranja brillante de huelga
          radius = 3.2;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(a.x, a.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Si está seleccionado o hovered, dibujar anillo luminoso
        if (isSelected || isHovered) {
          ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)';
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.beginPath();
          ctx.arc(a.x, a.y, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [agents, selectedAgentId, hoveredAgent]);

  // Manejo de clic en el canvas para seleccionar agente
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const hit = findAgentAt(clickX, clickY, 15);
    if (hit) {
      setSelectedAgentId(hit.id);
    } else {
      setSelectedAgentId(null);
    }
  };

  // Manejo de hover en el canvas
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const hit = findAgentAt(mouseX, mouseY, 12);
    setHoveredAgent(hit);
  };

  // Frase u opinión del ciudadano seleccionado según su estado
  const citizenQuote = useMemo(() => {
    if (!selectedAgent) return '';
    const { cohort, isProtesting, satisfaction, income, savings, age } = selectedAgent;
    if (isProtesting) {
      return `¡Basta de recortes y subidas de impuestos! Nos estamos manifestando en la Plaza Mayor para defender nuestro poder adquisitivo.`;
    }
    if (cohort === 'retired') {
      if (satisfaction > 70) return `Cobro mi pensión puntual de ${income}€/mes. Con la edad que tengo (${age} años), agradezco la cobertura sanitaria pública.`;
      return `La inflación y los recortes me ahogan; con ${income}€ apenas puedo costear los medicamentos y la cesta básica.`;
    }
    if (cohort === 'unemployed') {
      return `Llevo meses buscando trabajo en mi sector. El subsidio de ${income}€ se agota y los ahorros bajan rápido (${savings}€).`;
    }
    if (cohort === 'firm_owner') {
      return `Como autónomo, intento mantener mi negocio a flote. Si los clientes no consumen o los impuestos suben, tendré que recortar personal.`;
    }
    if (cohort === 'employed') {
      return `Trabajo jornada completa por ${income}€ al mes. Tras IRPF y gastos fijos, consigo ahorrar algo para el futuro.`;
    }
    return `Como empleado público, mi vocación es garantizar los servicios esenciales del Estado para toda la ciudadanía.`;
  }, [selectedAgent]);

  return (
    <div className="modal-overlay" style={{ zIndex: 10000, background: 'rgba(2, 6, 12, 0.88)', backdropFilter: 'blur(10px)' }}>
      <div
        className="glass-panel abm-visualizer-modal"
        style={{
          maxWidth: '1280px',
          width: '96vw',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
        }}
      >
        {/* CABECERA */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center'
              }}>
                <Users size={20} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Micro-Mundo ABM: Simulación Basada en Agentes
                  <span className="badge text-xs" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: '#38bdf8' }}>
                    {agents.length.toLocaleString('es-ES')} Agentes en Paralelo
                  </span>
                  {activeShock && (
                    <span className="badge text-xs animate-pulse" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: '#ef4444' }}>
                      ⚡ Choque Activo: {activeShock.toUpperCase()}
                    </span>
                  )}
                </h3>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                  Cada punto es un ciudadano con ingresos, ahorros y decisiones propias. La macroeconomía de España emerge de abajo hacia arriba.
                </p>
              </div>
            </div>
          </div>

          {/* CONTROLES DE EJECUCIÓN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              id="abm-play-btn"
              className={`btn btn-sm ${isSimRunning ? 'btn-danger' : 'btn-success'} d-flex align-center gap-1`}
              onClick={() => setIsSimRunning(!isSimRunning)}
              title={isSimRunning ? 'Pausar Simulación ABM' : 'Reanudar Simulación ABM'}
            >
              {isSimRunning ? <Pause size={15} /> : <Play size={15} />}
              <span>{isSimRunning ? 'Pausar' : 'Simular'}</span>
            </button>

            <button
              id="abm-step-btn"
              className="btn btn-sm btn-outline d-flex align-center gap-1"
              onClick={() => step()}
              disabled={isSimRunning}
              title="Avanzar 1 Mes"
            >
              <StepForward size={15} />
              <span>+1 Mes</span>
            </button>

            <button
              id="abm-reset-btn"
              className="btn btn-sm btn-outline d-flex align-center gap-1"
              onClick={resetPopulation}
              title="Regenerar Agentes"
            >
              <RotateCcw size={15} />
              <span>Reiniciar</span>
            </button>

            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '24px', margin: '0 4px' }} />

            <button
              className="btn btn-sm btn-outline"
              onClick={onClose}
              style={{ padding: '6px' }}
              title="Cerrar Visualizador"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BARRA DE MAGNITUDES MACRO EMERGENTES */}
        {macroStats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '8px',
            padding: '10px 24px',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Desempleo Emergente</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: macroStats.emergentUnemploymentRate > 18 ? '#ef4444' : '#f59e0b' }}>
                {macroStats.emergentUnemploymentRate.toFixed(1)}%
              </span>
              <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
                {macroStats.counts.unemployed} agentes parados
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Paz Social / Huelga</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: macroStats.emergentSocialPeace > 70 ? '#10b981' : '#f97316' }}>
                {macroStats.emergentSocialPeace}% ({macroStats.protestRate}% huelga)
              </span>
              <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
                {Math.round(macroStats.protestRate * 25)} manifestantes
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Coeficiente de Gini (Riqueza)</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                {macroStats.wealthGini.toFixed(3)}
              </span>
              <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
                España real: ~0.330
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Recaudación Emergente</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>
                {formatCurrency(macroStats.projectedMonthlyRevenue, numberingSystem)}/m
              </span>
              <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
                Suma directa IRPF + IVA + Sociedades
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>PIB Mensual Emergente</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#a78bfa' }}>
                {formatCurrency(macroStats.projectedMonthlyGDP, numberingSystem)}/m
              </span>
              <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
                Consumo real + Inversión pyme
              </span>
            </div>
          </div>
        )}

        {/* CUERPO PRINCIPAL: CANVAS 2D + PANEL INSPECTOR / CHOQUES */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(450px, 1.4fr) minmax(320px, 1fr)',
          flex: 1,
          overflow: 'hidden',
        }}>
          {/* COLUMNA IZQUIERDA: CANVAS ESPACIAL */}
          <div style={{
            position: 'relative',
            background: '#060d17',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 12, left: 16, zIndex: 10,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>LEYENDA:</span>
              <span style={{ fontSize: '0.68rem', color: '#ec4899' }}>● Pensionistas (22%)</span>
              <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>● Asalariados (45%)</span>
              <span style={{ fontSize: '0.68rem', color: '#ef4444' }}>● Parados (14%)</span>
              <span style={{ fontSize: '0.68rem', color: '#f59e0b' }}>● Pymes (12%)</span>
              <span style={{ fontSize: '0.68rem', color: '#10b981' }}>● Públicos (8%)</span>
              <span style={{ fontSize: '0.68rem', color: '#f97316' }}>● En Huelga</span>
            </div>

            <canvas
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                cursor: 'crosshair',
                display: 'block',
              }}
            />

            {/* Aviso inferior de interacción */}
            <div style={{
              padding: '8px 16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.4)',
              color: '#64748b',
              fontSize: '0.68rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>👆 Haz clic en cualquier ciudadano del mapa para abrir su expediente personal en directo.</span>
              <span>Mes de Simulación: #{stepCount}</span>
            </div>
          </div>

          {/* COLUMNA DERECHA: INSPECTOR CIUDADANO & LABORATORIO */}
          <div style={{
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'rgba(10, 16, 26, 0.95)',
          }}>
            {/* 1. EXPEDIENTE CIUDADANO */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: selectedAgent ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px',
              boxShadow: selectedAgent ? '0 0 20px rgba(56, 189, 248, 0.15)' : 'none',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={14} color="#38bdf8" />
                  {selectedAgent ? 'Expediente Ciudadano en Tiempo Real' : 'Selecciona un Ciudadano en el Mapa'}
                </h4>
                {selectedAgent && (
                  <span className="badge text-xs" style={{ background: `${COHORT_META[selectedAgent.cohort]?.color}22`, color: COHORT_META[selectedAgent.cohort]?.color, borderColor: COHORT_META[selectedAgent.cohort]?.color }}>
                    {COHORT_META[selectedAgent.cohort]?.label}
                  </span>
                )}
              </div>

              {selectedAgent ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      fontSize: '1.8rem',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '50%', width: '46px', height: '46px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {COHORT_META[selectedAgent.cohort]?.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                        {selectedAgent.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {selectedAgent.age} años · {selectedAgent.district}
                      </div>
                    </div>
                  </div>

                  {/* Cita del ciudadano */}
                  <div style={{
                    background: 'rgba(0,0,0,0.35)',
                    borderLeft: `3px solid ${selectedAgent.isProtesting ? '#f97316' : '#38bdf8'}`,
                    padding: '8px 10px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    color: '#cbd5e1',
                    fontStyle: 'italic',
                    marginBottom: '10px',
                    lineHeight: 1.4,
                  }}>
                    "{citizenQuote}"
                  </div>

                  {/* Métricas individuales */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Ingreso Mensual</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>
                        {selectedAgent.income.toLocaleString('es-ES')} €/m
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Ahorros Acumulados</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
                        {selectedAgent.savings.toLocaleString('es-ES')} €
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Impuestos IRPF pagados</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fb923c' }}>
                        {selectedAgent.taxPaid.toLocaleString('es-ES')} €/m
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Estado de Protesta</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: selectedAgent.isProtesting ? '#f97316' : '#10b981' }}>
                        {selectedAgent.isProtesting ? '🔥 EN HUELGA' : '✅ Conforme'}
                      </div>
                    </div>
                  </div>

                  {/* Barra de satisfacción */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '3px' }}>
                      <span style={{ color: '#94a3b8' }}>Nivel de Satisfacción / Bienestar:</span>
                      <span style={{ fontWeight: 700, color: selectedAgent.satisfaction > 50 ? '#10b981' : '#ef4444' }}>
                        {selectedAgent.satisfaction}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${selectedAgent.satisfaction}%`,
                        height: '100%',
                        background: selectedAgent.satisfaction > 50 ? '#10b981' : '#ef4444',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px 0', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                  Haz clic en cualquier punto del mapa para ver los datos bancarios, profesión y nivel de bienestar de ese habitante.
                </div>
              )}
            </div>

            {/* 2. LABORATORIO DE CHOQUES DE POLÍTICA ECONÓMICA */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px',
            }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#f59e0b" />
                Laboratorio de Choques Microeconómicos
              </h4>
              <p style={{ margin: '0 0 10px', fontSize: '0.7rem', color: '#94a3b8' }}>
                Inyecta decisiones en el micro-mundo y observa las ondas de choque en el consumo, los despidos y las manifestaciones:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => injectShock('austerity')}
                  style={{ borderColor: '#ef4444', color: '#ef4444', textAlign: 'left', padding: '8px' }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.72rem' }}>💥 Plan de Austeridad</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>Recorta pensiones un 25%. Dispara protestas.</div>
                </button>

                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => injectShock('stimulus')}
                  style={{ borderColor: '#34d399', color: '#34d399', textAlign: 'left', padding: '8px' }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.72rem' }}>💰 Cheque Estímulo</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>Impulsa el consumo. Fomenta contrataciones.</div>
                </button>

                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => injectShock('lockdown')}
                  style={{ borderColor: '#f59e0b', color: '#f59e0b', textAlign: 'left', padding: '8px' }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.72rem' }}>😷 Confinamiento</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>Hunde las ventas en pymes. Ola de despidos.</div>
                </button>

                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => injectShock(null)}
                  style={{ borderColor: '#38bdf8', color: '#38bdf8', textAlign: 'left', padding: '8px' }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.72rem' }}>⚖️ Normalizar</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>Disipa choques temporales.</div>
                </button>
              </div>
            </div>

            {/* 3. DESGLOSE DE COHORTES Y EMPRESAS */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px',
            }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={14} color="#a78bfa" />
                Ecosistema de Pymes ({firms.length} Empresas Simuladas)
              </h4>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Las {firms.length} pymes reciben los ingresos del consumo de los agentes. Si entran en pérdidas consecutivas, despiden trabajadores; si tienen beneficios altos, contratan del pool de desempleados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
