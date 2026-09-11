import React, { useState } from 'react';
import { Layers, Landmark, Rocket, Sparkles, Check, ArrowRight, ShieldCheck, HelpCircle, X } from 'lucide-react';

export const WelcomeHubModal = ({ isOpen, onClose, onSelectMode }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('scale');

  if (!isOpen) return null;

  const handleStart = (route) => {
    if (dontShowAgain) {
      localStorage.setItem('bigNumbers_hideTutorial', 'true');
    }
    if (onSelectMode) {
      onSelectMode(route || selectedRoute);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ padding: '1rem', zIndex: 2000 }}>
      <div
        className="glass-panel welcome-hub-modal animate-fade-in"
        style={{
          maxWidth: '720px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
          border: '1px solid var(--border-glass, rgba(56, 189, 248, 0.35))'
        }}
      >
        <div className="d-flex justify-between align-start mb-3">
          <div>
            <div className="d-flex align-center gap-2 mb-1">
              <span className="badge badge-cyan text-xs font-bold">Bienvenido al Centro de Mando</span>
            </div>
            <h2 className="m-0 text-cyan font-bold" style={{ fontSize: '1.6rem' }}>
              SIMULADOR DE GRANDES CIFRAS
            </h2>
            <p className="text-muted m-0 text-sm mt-1">
              Comprende intuitivamente el dinero público, desde la nómina de un trabajador hasta el PIB de una nación, 
              con <strong>datos reales de España</strong> y <strong>2.500 ciudadanos simulados con Inteligencia Basada en Agentes (ABM)</strong>.
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '1rem 0' }} />

        <div className="mb-3">
          <div className="text-xs text-muted uppercase font-bold mb-2" style={{ letterSpacing: '1px' }}>
            ¿Por dónde te gustaría empezar a descubrir?
          </div>

          <div className="d-flex flex-column gap-3">
            {/* RUTA 1: CALIBRE */}
            <div
              className={`p-3 rounded cursor-pointer transition-all d-flex gap-3 align-center ${
                selectedRoute === 'scale' ? 'border-cyan' : ''
              }`}
              onClick={() => setSelectedRoute('scale')}
              style={{
                background: selectedRoute === 'scale' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedRoute === 'scale' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Layers size={24} className="text-cyan" />
              </div>
              <div className="flex-1">
                <div className="d-flex align-center gap-2">
                  <span className="font-bold text-sm text-cyan">Ruta Recomendada para Nuevos</span>
                  <span className="badge text-xs" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>Paso 1</span>
                </div>
                <div className="font-bold text-base mt-0.5">1. El Calibre de las Cifras (Escala Sensorial)</div>
                <div className="text-xs text-muted">
                  Descubre por qué contar 1 millón de euros son 11 días y 1 billón son 31.700 años. 
                  Compara tu café o tu nómina con el gasto en sanidad.
                </div>
              </div>
              <div className="radio-circle">
                {selectedRoute === 'scale' && <Check size={16} className="text-cyan" />}
              </div>
            </div>

            {/* RUTA 2: GOBERNAR ESPAÑA */}
            <div
              className={`p-3 rounded cursor-pointer transition-all d-flex gap-3 align-center ${
                selectedRoute === 'govern' ? 'border-cyan' : ''
              }`}
              onClick={() => setSelectedRoute('govern')}
              style={{
                background: selectedRoute === 'govern' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedRoute === 'govern' ? '#fbbf24' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'rgba(251, 191, 36, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Landmark size={24} className="text-warning" />
              </div>
              <div className="flex-1">
                <div className="d-flex align-center gap-2">
                  <span className="font-bold text-sm text-warning">Gestión Real de Estado</span>
                  <span className="badge text-xs" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>Paso 2</span>
                </div>
                <div className="font-bold text-base mt-0.5">2. Gobernar España (Presupuesto Real + 2.5k Agentes)</div>
                <div className="text-xs text-muted">
                  Asume el mando de las cuentas públicas oficiales de España (PGE). Toca impuestos, ministerios y observa 
                  el impacto directo en los 2.500 ciudadanos del micromundo ABM.
                </div>
              </div>
              <div className="radio-circle">
                {selectedRoute === 'govern' && <Check size={16} className="text-warning" />}
              </div>
            </div>

            {/* RUTA 3: EFECTO ENDER */}
            <div
              className={`p-3 rounded cursor-pointer transition-all d-flex gap-3 align-center ${
                selectedRoute === 'futures' ? 'border-cyan' : ''
              }`}
              onClick={() => setSelectedRoute('futures')}
              style={{
                background: selectedRoute === 'futures' ? 'rgba(192, 132, 252, 0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedRoute === 'futures' ? '#c084fc' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'rgba(192, 132, 252, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Rocket size={24} style={{ color: '#c084fc' }} />
              </div>
              <div className="flex-1">
                <div className="d-flex align-center gap-2">
                  <span className="font-bold text-sm" style={{ color: '#c084fc' }}>Teoría de Juegos & Futuros</span>
                  <span className="badge text-xs" style={{ background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc' }}>Paso 3</span>
                </div>
                <div className="font-bold text-base mt-0.5">3. El Efecto Ender & Asamblea Global</div>
                <div className="text-xs text-muted">
                  Vota en tratados internacionales contra IAs de teoría de juegos (cooperadores vs free-riders) 
                  y descubre el contraste revelador con los presupuestos reales del planeta (SIPRI, OMS, FMI).
                </div>
              </div>
              <div className="radio-circle">
                {selectedRoute === 'futures' && <Check size={16} style={{ color: '#c084fc' }} />}
              </div>
            </div>
          </div>
        </div>

        {/* PIE CON CHECKBOX Y BOTÓN DE INICIO */}
        <div className="pt-3 d-flex justify-between align-center flex-wrap gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            No mostrar automáticamente al entrar (disponible siempre en <em>«❓ Guía»</em>)
          </label>

          <button
            className="btn btn-primary btn-lg d-flex align-center gap-2"
            onClick={() => handleStart(selectedRoute)}
            style={{ minWidth: '180px' }}
          >
            <span>Iniciar Aventura</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
