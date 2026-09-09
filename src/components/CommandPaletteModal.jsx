import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Layers, Flag, ShieldCheck, Mail, Sliders, Printer, Wifi, Play, Pause, FastForward, DollarSign, Trees, X, Command, Users, CalendarDays, Database } from 'lucide-react';

export const CommandPaletteModal = ({
  isOpen,
  onClose,
  actions = {}
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commandList = [
    { id: 'abm_world', title: 'Micro-Mundo ABM: Simulación Basada en 2.500 Agentes', icon: <Users size={16} className="text-cyan" />, action: actions.openABMVisualizer },
    { id: 'real_data', title: 'Cargar Datos Macroeconómicos Reales de España (2010–2024)', icon: <CalendarDays size={16} className="text-cyan" />, action: actions.openYearPicker },
    { id: 'data_catalog', title: 'Abrir Catálogo de Datos & Documentación Viva', icon: <Database size={16} className="text-muted" />, action: actions.openDataCatalog },
    { id: 'assembly', title: 'Abrir Asamblea Global (Dilema del Prisionero & Efecto Ender)', icon: <Globe size={16} className="text-warning" />, action: actions.openAssembly },
    { id: 'techtree', title: 'Abrir Árbol Tecnológico en Grafo & Megaproyectos', icon: <Trees size={16} className="text-cyan" />, action: actions.openTechTree },
    { id: 'scale', title: 'Abrir Visor de Magnitudes & Potencias de 10', icon: <Layers size={16} className="text-warning" />, action: actions.openScale },
    { id: 'scenarios', title: 'Cambiar Escenario Histórico (Gran Depresión, Petro-Estado...)', icon: <Flag size={16} className="text-cyan" />, action: actions.openScenarios },
    { id: 'passport', title: 'Ver Pasaporte Presidencial & Firmas Criptográficas (ECDSA)', icon: <ShieldCheck size={16} className="text-warning" />, action: actions.openPassport },
    { id: 'diplomacy', title: 'Diplomacia Asíncrona por Correo (Tratados P2P)', icon: <Mail size={16} className="text-cyan" />, action: actions.openDiplomacy },
    { id: 'rules', title: 'Motor de Expansión por Reglas & Creador de Mods', icon: <Sliders size={16} className="text-cyan" />, action: actions.openRules },
    { id: 'gazette_print', title: 'Exportar Portada Oficial de la Gaceta (Imprimible)', icon: <Printer size={16} className="text-cyan" />, action: actions.openGazetteExport },
    { id: 'p2proom', title: 'Crear o Unirse a Sala P2P en Vivo (WebRTC & QR)', icon: <Wifi size={16} className="text-warning" />, action: actions.openP2PRoom },
    { id: 'toggle_play', title: 'Pausar / Reanudar Simulación (Espacio)', icon: <Play size={16} className="text-success" />, action: actions.togglePlay },
    { id: 'speed_1', title: 'Velocidad Normal (1x)', icon: <Play size={16} />, action: () => actions.setSpeed(1) },
    { id: 'speed_2', title: 'Velocidad Rápida (2x)', icon: <FastForward size={16} />, action: () => actions.setSpeed(2) },
    { id: 'speed_5', title: 'Velocidad Ultra (5x)', icon: <FastForward size={16} className="text-danger" />, action: () => actions.setSpeed(5) },
    { id: 'issue_bonds', title: 'Emitir Bonos Soberanos (+500M)', icon: <DollarSign size={16} className="text-warning" />, action: actions.issueBonds },
    { id: 'arena_mode', title: 'Alternar Modo Arena Genética Bicolor (SimCity)', icon: <Command size={16} className="text-cyan" />, action: actions.toggleArena }
  ];

  const filteredCommands = commandList.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action?.();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-container command-palette-modal p-3" onClick={e => e.stopPropagation()}>
        <div className="d-flex align-center gap-2 p-2 border-bottom border-glass mb-2">
          <Search size={18} className="text-cyan" />
          <input
            ref={inputRef}
            type="text"
            className="command-input flex-1"
            placeholder="Escribe una orden o busca una acción... (ej. bonos, asamblea, marte)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <span className="badge text-xs">ESC para salir</span>
        </div>

        <div className="commands-list" style={{ maxHeight: '320px', overflowY: 'auto' }}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`command-item d-flex align-center justify-between p-2 cursor-pointer ${selectedIndex === idx ? 'command-item-active' : ''}`}
                onClick={() => {
                  cmd.action?.();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="d-flex align-center gap-2 text-xs font-bold">
                  {cmd.icon}
                  <span>{cmd.title}</span>
                </div>
                <span className="text-xs text-muted">↵ Ejecutar</span>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-muted">
              No se encontraron comandos para "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
