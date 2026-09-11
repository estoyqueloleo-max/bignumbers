import React, { useRef, useEffect, useState } from 'react';
import { useABMSimulation } from '../hooks/useABMSimulation';
import { formatCurrency } from '../utils/formatters';
import {
  Users,
  Search,
  Activity,
  Heart,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  User,
  Sparkles,
  Zap,
  RotateCcw,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

const COHORT_META = {
  retired:           { label: 'Jubilado / Pensionista',    color: '#ec4899', icon: '👵' },
  employed:          { label: 'Trabajador Asalariado',      color: '#38bdf8', icon: '💼' },
  unemployed:        { label: 'Desempleado (Paro)',         color: '#ef4444', icon: '📉' },
  firm_owner:        { label: 'Autónomo / Pyme',           color: '#f59e0b', icon: '🏪' },
  public_worker:     { label: 'Empleado Público',          color: '#10b981', icon: '🏛️' },
  health_worker:     { label: 'Sanitario Público',         color: '#34d399', icon: '🏥' },
  education_worker:  { label: 'Docente Público',           color: '#67e8f9', icon: '📚' },
  defense_worker:    { label: 'Defensa / Seguridad',        color: '#818cf8', icon: '🛡️' },
  admin_worker:      { label: 'Funcionario AAPP',           color: '#a78bfa', icon: '📄' },
  justice_worker:    { label: 'Judicatura',                 color: '#c4b5fd', icon: '⚖️' },
};

export const MicroABMViewport = ({
  state,
  isRunning,
  timeSpeed,
  numberingSystem,
  onOpenFullLab,
  onOpenTraitsLab,
  onOpenExplainer,
  abmSimInstance
}) => {
  const canvasRef = useRef(null);
  const [hoveredAgent, setHoveredAgent] = useState(null);

  const fallbackSim = useABMSimulation(state, isRunning, timeSpeed);
  const sim = abmSimInstance || fallbackSim;

  const {
    agents,
    firms,
    macroStats,
    step,
    injectShock,
    activeShock,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    findAgentAt,
    resetPopulation,
    socialTraits,
    traitEffects
  } = sim;

  // Renderizado del Canvas de Agentes en Tiempo Real
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fondo oscuro urbano
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const midX = canvas.width / 2;
      const midY = canvas.height / 2;

      // Rejilla de distritos
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(midX, 0); ctx.lineTo(midX, canvas.height);
      ctx.moveTo(0, midY); ctx.lineTo(canvas.width, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Etiquetas de distritos
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillText('🏡 RESIDENCIAL & PENSIONISTAS', 15, 18);
      ctx.fillText('🏭 POLÍGONO INDUSTRIAL & PYMES', midX + 15, 18);
      ctx.fillText('🏢 BARRIO OBRERO & SERVICIOS', 15, midY + 18);
      ctx.fillText('🏛️ PLAZA DE PROTESTAS & ESTADO', midX + 15, midY + 18);

      // Plaza de protestas central
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(midX, midY, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Dibujar 2.500 agentes
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i];
        const isSelected = a.id === selectedAgentId;
        const isHovered = hoveredAgent && a.id === hoveredAgent.id;

        let color = COHORT_META[a.cohort]?.color || '#94a3b8';
        let radius = 2.2;

        if (a.isProtesting) {
          color = '#f97316';
          radius = 3.2;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(a.x, a.y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected || isHovered) {
          ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)';
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.beginPath();
          ctx.arc(a.x, a.y, 7, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [agents, selectedAgentId, hoveredAgent]);

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
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const hoverX = (e.clientX - rect.left) * scaleX;
    const hoverY = (e.clientY - rect.top) * scaleY;

    const hit = findAgentAt(hoverX, hoverY, 12);
    setHoveredAgent(hit || null);
  };

  return (
    <div className="micro-abm-viewport glass-panel p-3 d-flex flex-column gap-3">
      {/* BARRA SUPERIOR DE INDICADORES AGREGADOS DEL ABM */}
      <div className="abm-kpi-bar d-flex justify-between align-center flex-wrap gap-2">
        <div className="d-flex align-center gap-3 flex-wrap">
          <div className="d-flex align-center gap-1">
            <Users size={16} className="text-cyan" />
            <span className="font-bold text-sm">2.500 Agentes Vivos</span>
          </div>

          <div className="badge text-xs" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
            📉 Paro ABM: <strong>{macroStats.unemploymentRate?.toFixed(1) || '12.4'}%</strong>
          </div>

          <div className="badge text-xs" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6' }}>
            ⚖️ Gini: <strong>{macroStats.gini?.toFixed(3) || '0.342'}</strong>
          </div>

          <div className="badge text-xs" style={{
            background: (macroStats.protestRate || 0) > 0.08 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.1)',
            color: (macroStats.protestRate || 0) > 0.08 ? '#ef4444' : '#10b981'
          }}>
            📢 Protestas: <strong>{((macroStats.protestRate || 0) * 100).toFixed(1)}%</strong>
          </div>
        </div>

        <div className="d-flex align-center gap-1 flex-wrap">
          {traitEffects?.activeCount > 0 && (
            <div
              className="badge text-xs cursor-pointer d-flex align-center gap-1"
              onClick={onOpenTraitsLab}
              title="Ver y calibrar fenómenos sociales activos (Clic para abrir)"
              style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.3)', cursor: 'pointer' }}
            >
              <Sparkles size={11} />
              <span>{traitEffects.activeCount} Fenómenos</span>
              <span className="font-bold">({(traitEffects.estimatedGdpImpactPct || 0) > 0 ? '+' : ''}{(traitEffects.estimatedGdpImpactPct || 0).toFixed(1)}% PIB)</span>
            </div>
          )}

          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={onOpenExplainer}
            title="¿Cómo funciona la simulación viva por agentes?"
          >
            <HelpCircle size={12} className="text-cyan" />
            <span className="hide-mobile">¿Cómo funciona?</span>
          </button>

          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={onOpenTraitsLab}
            title="Abrir Laboratorio de Psicología Social y Fenómenos Dinámicos"
            style={{ borderColor: '#c084fc', color: '#c084fc' }}
          >
            <span>🧬 Cerebro Social</span>
          </button>

          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={resetPopulation}
            title="Reiniciar muestra de 2.500 agentes"
          >
            <RotateCcw size={12} />
            <span className="hide-mobile">Reiniciar</span>
          </button>
          <button
            className="btn btn-primary btn-xs d-flex align-center gap-1"
            onClick={onOpenFullLab}
            title="Abrir Laboratorio Completo con Calibración EPA y Serie de Deuda 1980-2024"
          >
            <Sparkles size={13} />
            <span>Laboratorio Completo</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* ÁREA DE CANVAS Y EXPEDIENTE DEL CIUDADANO */}
      <div className="abm-interactive-container grid-2-col gap-3" style={{ gridTemplateColumns: selectedAgent ? '1fr 300px' : '1fr' }}>
        <div className="canvas-wrapper" style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '8px', overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            width={720}
            height={360}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredAgent(null)}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
          />

          {/* HINT FLOTANTE EN EL CANVAS */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              background: 'rgba(0,0,0,0.7)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.75)',
              pointerEvents: 'none'
            }}
          >
            💡 Haz clic en cualquier punto para inspeccionar a ese ciudadano
          </div>

          {/* LEYENDA RÁPIDA DE COLORES */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.75)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.7rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              pointerEvents: 'none'
            }}
          >
            <div className="d-flex align-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }}></span> Empleado</div>
            <div className="d-flex align-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span> Parado</div>
            <div className="d-flex align-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ec4899' }}></span> Pensionista</div>
            <div className="d-flex align-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span> Empleado Público</div>
            <div className="d-flex align-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }}></span> Manifestándose</div>
          </div>
        </div>

        {/* EXPEDIENTE CIUDADANO (SI HAY UNO SELECCIONADO) */}
        {selectedAgent && (
          <div className="agent-dossier-card glass-panel p-3 d-flex flex-column justify-between animate-fade-in" style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
            <div>
              <div className="d-flex justify-between align-center mb-2">
                <span className="badge text-xs" style={{ background: COHORT_META[selectedAgent.cohort]?.color || '#38bdf8', color: '#000', fontWeight: 'bold' }}>
                  {COHORT_META[selectedAgent.cohort]?.label || 'Ciudadano'}
                </span>
                <button className="btn-icon btn-xs" onClick={() => setSelectedAgentId(null)} title="Cerrar expediente">✕</button>
              </div>

              <h4 className="m-0 mb-1 text-cyan font-bold">{selectedAgent.name}</h4>
              <div className="text-xs text-muted mb-3">ID: #{selectedAgent.id} • Edad: {selectedAgent.age || 41} años</div>

              <div className="d-flex flex-column gap-2 text-xs">
                <div className="d-flex justify-between p-1 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-muted">Ingreso Neto:</span>
                  <span className="font-bold text-cyan">{formatCurrency(selectedAgent.monthlyIncome || 0, numberingSystem)}/mes</span>
                </div>

                <div className="d-flex justify-between p-1 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-muted">Ahorros Acumulados:</span>
                  <span className="font-bold">{formatCurrency(selectedAgent.savings || 0, numberingSystem)}</span>
                </div>

                <div className="d-flex justify-between p-1 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-muted">Consumo Mensual:</span>
                  <span>{formatCurrency(selectedAgent.monthlyConsumption || 0, numberingSystem)}</span>
                </div>

                <div className="d-flex justify-between p-1 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-muted">Impuestos Aportados:</span>
                  <span className="text-warning">{formatCurrency(selectedAgent.taxesPaid || 0, numberingSystem)}/año</span>
                </div>

                <div className="d-flex justify-between p-1 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-muted">Salud Social:</span>
                  <span className="text-success font-bold d-flex align-center gap-1">
                    <Heart size={12} /> {Math.round((selectedAgent.health || 0.85) * 100)}%
                  </span>
                </div>

                <div className="d-flex justify-between p-1 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-muted">Postura ante el Gobierno:</span>
                  <span style={{ color: selectedAgent.isProtesting ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                    {selectedAgent.isProtesting ? '🚨 En Huelga / Protesta' : '✅ Conforme / Apoya'}
                  </span>
                </div>

                {/* FENÓMENOS SOCIALES QUE LE AFECTAN */}
                <div className="d-flex flex-column gap-1 p-2 rounded" style={{ background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.25)' }}>
                  <div className="d-flex justify-between align-center">
                    <span className="font-bold" style={{ color: '#c084fc' }}>🧬 Fenómenos Sociales Activos:</span>
                    <span className="cursor-pointer text-xs" style={{ textDecoration: 'underline' }} onClick={onOpenTraitsLab}>
                      Calibrar
                    </span>
                  </div>
                  <div className="d-flex gap-1 flex-wrap mt-1">
                    {socialTraits?.filter(t => t.enabled).map(t => (
                      <span key={t.id} className="badge text-xs" style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', fontSize: '0.68rem' }} title={t.description}>
                        {t.icon} {t.name.split(' ')[0]} ({t.intensity}%)
                      </span>
                    ))}
                    {(!socialTraits || socialTraits.filter(t => t.enabled).length === 0) && (
                      <span className="text-muted text-xs">Sin fenómenos activos</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted mt-2 pt-2" style={{ borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
              <em>Las decisiones en las pestañas inferiores y la psicología social afectarán directamente a {selectedAgent.name.split(' ')[0]}.</em>
            </div>
          </div>
        )}
      </div>

      {/* CHOQUES RÁPIDOS PARA EXPERIMENTAR CAUSA-EFECTO */}
      <div className="abm-shocks-bar d-flex align-center justify-between flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="d-flex align-center gap-2">
          <Zap size={15} className="text-warning" />
          <span className="text-xs text-muted font-bold uppercase" style={{ letterSpacing: '0.5px' }}>
            Inyectar Choque de Prueba a los 2.500 Agentes:
          </span>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline btn-xs"
            onClick={() => injectShock('tax_hike')}
            title="Subir impuestos un 10% y ver el impacto inmediato en consumo y protestas"
          >
            📈 Subida Impositiva (+10%)
          </button>
          <button
            className="btn btn-outline btn-xs"
            onClick={() => injectShock('stimulus')}
            title="Inyectar cheque estímulo directo a las familias"
          >
            🎁 Cheque Estímulo Familiar
          </button>
          <button
            className="btn btn-outline btn-xs"
            onClick={() => injectShock('health_boost')}
            title="Reforzar plantilla sanitaria en el ABM"
          >
            🏥 Refuerzo Sanitario
          </button>
          <button
            className="btn btn-outline btn-xs"
            onClick={() => injectShock('austerity')}
            title="Recorte de gasto público para reducir deuda"
          >
            ✂️ Austeridad Fiscal
          </button>
        </div>
      </div>
    </div>
  );
};
