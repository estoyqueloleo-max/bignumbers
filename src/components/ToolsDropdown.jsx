import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  Database,
  ShieldCheck,
  Sliders,
  Mail,
  Printer,
  Wifi,
  Search,
  ChevronDown
} from 'lucide-react';

export const ToolsDropdown = ({
  onOpenDataCatalog,
  onOpenPassport,
  onOpenRules,
  onOpenDiplomacy,
  onOpenGazetteExport,
  onOpenP2PRoom,
  onOpenCommandPalette,
  activeModifiersCount = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAction = (callback) => {
    setIsOpen(false);
    if (callback) callback();
  };

  return (
    <div className="tools-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        id="btn-tools-dropdown"
        className={`btn btn-sm d-flex align-center gap-1 ${isOpen ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => setIsOpen(prev => !prev)}
        title="Herramientas avanzadas, fuentes y laboratorio de estado"
        style={{ whiteSpace: 'nowrap' }}
      >
        <Wrench size={15} className="text-cyan" />
        <span className="hide-mobile font-bold">Herramientas</span>
        {activeModifiersCount > 0 && (
          <span className="badge badge-success text-xs" style={{ padding: '1px 5px' }}>
            {activeModifiersCount}
          </span>
        )}
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          className="glass-panel tools-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '280px',
            zIndex: 1000,
            padding: '0.65rem',
            boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
            border: '1px solid var(--border-glass, rgba(56, 189, 248, 0.3))',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
            background: 'rgba(10, 20, 35, 0.96)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          <div className="text-xs text-muted font-bold px-2 py-1 uppercase" style={{ letterSpacing: '1px' }}>
            🔬 Laboratorio & Fuentes
          </div>

          <button
            className="dropdown-item-btn d-flex align-center gap-2 p-2 rounded text-left w-100"
            onClick={() => handleAction(onOpenDataCatalog)}
          >
            <Database size={16} className="text-cyan" />
            <div className="flex-1">
              <div className="text-sm font-bold">Catálogo de Fuentes</div>
              <div className="text-xs text-muted">INE, IGAE, Banco de España</div>
            </div>
          </button>

          <button
            className="dropdown-item-btn d-flex align-center gap-2 p-2 rounded text-left w-100"
            onClick={() => handleAction(onOpenRules)}
          >
            <Sliders size={16} className="text-cyan" />
            <div className="flex-1 d-flex justify-between align-center">
              <div>
                <div className="text-sm font-bold">Motor de Reglas & Mods</div>
                <div className="text-xs text-muted">Calibración macroeconómica</div>
              </div>
              {activeModifiersCount > 0 && (
                <span className="badge badge-success text-xs">{activeModifiersCount}</span>
              )}
            </div>
          </button>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.25rem 0' }} />

          <div className="text-xs text-muted font-bold px-2 py-1 uppercase" style={{ letterSpacing: '1px' }}>
            📜 Legado & Diplomacia
          </div>

          <button
            className="dropdown-item-btn d-flex align-center gap-2 p-2 rounded text-left w-100"
            onClick={() => handleAction(onOpenPassport)}
          >
            <ShieldCheck size={16} className="text-warning" />
            <div className="flex-1">
              <div className="text-sm font-bold">Pasaporte Presidencial</div>
              <div className="text-xs text-muted">Firma criptográfica ECDSA</div>
            </div>
          </button>

          <button
            className="dropdown-item-btn d-flex align-center gap-2 p-2 rounded text-left w-100"
            onClick={() => handleAction(onOpenDiplomacy)}
          >
            <Mail size={16} className="text-cyan" />
            <div className="flex-1">
              <div className="text-sm font-bold">Diplomacia por Relevos</div>
              <div className="text-xs text-muted">Tratados asíncronos P2P</div>
            </div>
          </button>

          <button
            className="dropdown-item-btn d-flex align-center gap-2 p-2 rounded text-left w-100"
            onClick={() => handleAction(onOpenP2PRoom)}
          >
            <Wifi size={16} className="text-cyan" />
            <div className="flex-1">
              <div className="text-sm font-bold">Sala Multijugador P2P</div>
              <div className="text-xs text-muted">WebRTC Serverless</div>
            </div>
          </button>

          <button
            className="dropdown-item-btn d-flex align-center gap-2 p-2 rounded text-left w-100"
            onClick={() => handleAction(onOpenGazetteExport)}
          >
            <Printer size={16} className="text-warning" />
            <div className="flex-1">
              <div className="text-sm font-bold">Gaceta Oficial en PNG</div>
              <div className="text-xs text-muted">Descargar portada histórica</div>
            </div>
          </button>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.25rem 0' }} />

          <button
            className="dropdown-item-btn d-flex align-center gap-2 p-2 rounded text-left w-100"
            onClick={() => handleAction(onOpenCommandPalette)}
          >
            <Search size={16} className="text-cyan" />
            <div className="flex-1 d-flex justify-between align-center">
              <div>
                <div className="text-sm font-bold">Paleta de Comandos</div>
                <div className="text-xs text-muted">Acceso rápido por teclado</div>
              </div>
              <span className="badge text-xs" style={{ background: 'rgba(255,255,255,0.1)' }}>Ctrl+K</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
