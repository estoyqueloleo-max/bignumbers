import React from 'react';
import { X, Sparkles, Brain, ArrowRight, Activity, Users, Store, HeartCrack, Flame } from 'lucide-react';

export const ABMExplainerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ padding: '1rem', zIndex: 3100 }}>
      <div
        className="glass-panel abm-explainer-modal animate-fade-in"
        style={{
          maxWidth: '740px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
          border: '1px solid rgba(56, 189, 248, 0.4)'
        }}
      >
        <div className="d-flex justify-between align-start mb-3">
          <div>
            <div className="d-flex align-center gap-2 mb-1">
              <span className="badge badge-cyan text-xs font-bold">Guía de Comprensión</span>
              <span className="text-xs text-muted font-mono">Agent-Based Modeling (ABM)</span>
            </div>
            <h2 className="m-0 text-cyan font-bold" style={{ fontSize: '1.5rem' }}>
              🧠 ¿Por qué este país está vivo?
            </h2>
            <p className="text-muted m-0 text-sm mt-1">
              La diferencia entre la economía de despacho y la realidad de 2.500 ciudadanos de carne y hueso.
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '1rem 0' }} />

        {/* COMPARATIVA EN 2 COLUMNAS */}
        <div className="grid-2-col gap-3 mb-4">
          {/* MODELO TRADICIONAL */}
          <div className="p-3 rounded" style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div className="d-flex align-center gap-2 mb-2">
              <span className="badge badge-danger text-xs font-bold">El Modelo Tradicional</span>
            </div>
            <h4 className="m-0 mb-1 text-sm font-bold text-danger">Economía de Despacho (Excel / Top-Down)</h4>
            <p className="text-xs text-muted mb-2">
              Un ministerio aplica una fórmula fija: <em>«Si subimos el IVA un 2%, recaudaremos exactamente 4.000 millones más»</em>.
            </p>
            <div className="text-xs text-muted" style={{ borderLeft: '2px solid #ef4444', paddingLeft: '8px' }}>
              <strong>El gran error:</strong> Asume que las personas son robots pasivos que seguirán comprando lo mismo sin quejarse ni cambiar de hábitos.
            </div>
          </div>

          {/* MODELO VIVO (ABM) */}
          <div className="p-3 rounded" style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <div className="d-flex align-center gap-2 mb-2">
              <span className="badge badge-cyan text-xs font-bold">Nuestro Simulador</span>
            </div>
            <h4 className="m-0 mb-1 text-sm font-bold text-cyan">La Sociedad Viva (Bottom-Up / ABM)</h4>
            <p className="text-xs text-muted mb-2">
              No hay una fórmula predefinida para el PIB ni para el paro. Hay <strong>2.500 ciudadanos individuales</strong> con nombre, nómina, hipoteca y salud.
            </p>
            <div className="text-xs text-muted" style={{ borderLeft: '2px solid #38bdf8', paddingLeft: '8px' }}>
              <strong>La realidad:</strong> Las grandes magnitudes son una <em>consecuencia emergente</em> de lo que hace la gente día a día.
            </div>
          </div>
        </div>

        {/* LA REACCIÓN EN CADENA PASO A PASO */}
        <div className="p-3 rounded mb-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs text-muted uppercase font-bold mb-3" style={{ letterSpacing: '1px' }}>
            🔄 El "Efecto Mariposa" en Vivo: ¿Qué pasa cuando tocas una ley?
          </div>

          <div className="d-flex flex-column gap-2 text-xs">
            <div className="d-flex align-center gap-3 p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="font-bold text-cyan" style={{ fontSize: '1rem' }}>1</span>
              <div>
                <strong>Tú tocas una ley:</strong> Por ejemplo, subes los impuestos o recortas la sanidad para intentar reducir la deuda pública.
              </div>
            </div>

            <div className="d-flex align-center gap-3 p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="font-bold text-warning" style={{ fontSize: '1rem' }}>2</span>
              <div>
                <strong>Reacción en los hogares:</strong> Los 2.500 agentes calculan su nuevo sueldo neto. Como les queda menos dinero, recortan en ocio, ropa y restaurantes.
              </div>
            </div>

            <div className="d-flex align-center gap-3 p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="font-bold text-danger" style={{ fontSize: '1rem' }}>3</span>
              <div>
                <strong>Las empresas entran en pérdidas:</strong> Las tiendas locales pierden clientes. Al acumular 2 meses de pérdidas, empiezan a despedir empleados para no quebrar.
              </div>
            </div>

            <div className="d-flex align-center gap-3 p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="font-bold text-purple" style={{ fontSize: '1rem', color: '#c084fc' }}>4</span>
              <div>
                <strong>La plaza cívica estalla:</strong> El paro sube, la recaudación de impuestos cae (porque los parados no pagan IRPF ni consumen), y los ciudadanos descontentos marchan al centro a protestar.
              </div>
            </div>
          </div>
        </div>

        {/* FENÓMENOS DINÁMICOS Y PSICOLOGÍA SOCIAL */}
        <div className="p-3 rounded mb-4" style={{ background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.25)' }}>
          <div className="d-flex align-center gap-2 mb-2">
            <Sparkles size={16} style={{ color: '#c084fc' }} />
            <h4 className="m-0 text-sm font-bold" style={{ color: '#c084fc' }}>
              Novedad: El Laboratorio de Fenómenos y Psicología Social
            </h4>
          </div>
          <p className="text-xs text-muted m-0 mb-2">
            Además de impuestos y ministerios, ahora puedes alterar la <strong>psicología colectiva</strong> de la población o inventar nuevos fenómenos:
          </p>
          <ul className="text-xs text-muted m-0 pl-3" style={{ lineHeight: '1.6' }}>
            <li><strong>📱 Desgaste Cognitivo por Móvil:</strong> Disminuye la concentración laboral (-productividad de pymes) y crea apatía ante protestas.</li>
            <li><strong>☕ Solidaridad Familiar:</strong> Los jubilados ayudan a sus hijos y nietos en paro, amortiguando la exclusión social.</li>
            <li><strong>🛠️ Inventa tu propio rasgo:</strong> Crea fenómenos como <em>«Jornada de 4 Días»</em> o <em>«Teletrabajo Masivo»</em> y observa cómo alteran el país.</li>
          </ul>
        </div>

        {/* BOTÓN DE CIERRE */}
        <div className="d-flex justify-end">
          <button className="btn btn-primary d-flex align-center gap-2" onClick={onClose}>
            <span>¡Entendido! Explorar la Sociedad Viva</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
