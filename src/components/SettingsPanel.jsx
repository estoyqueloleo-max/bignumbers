import React, { useState, useEffect } from 'react';
import { NumberingSystems } from '../utils/formatters';
import { setAudioMuted, getAudioMuted } from '../utils/audio';
import { synthAudioInstance } from '../utils/synthAudio';
import { Volume2, VolumeX, Keyboard, RotateCcw, Flag, Settings, Music, Palette, Command } from 'lucide-react';

export const SettingsPanel = ({
  numberingSystem,
  setNumberingSystem,
  onResetGame,
  onOpenScenarios,
  theme = 'cyberpunk',
  setTheme
}) => {
  const [muted, setMutedState] = useState(getAudioMuted());
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    setMutedState(getAudioMuted());
  }, []);

  const handleToggleMute = () => {
    const next = !muted;
    setAudioMuted(next);
    synthAudioInstance.setMuted(next);
    setMutedState(next);
  };

  const handleToggleMusic = () => {
    const next = !musicOn;
    synthAudioInstance.toggleAmbientMusic(next);
    setMusicOn(next);
  };

  return (
    <div className="glass-panel settings-panel">
      <h3 className="d-flex align-center gap-2 mb-3">
        <Settings size={20} className="text-cyan" /> Configuración, Temas & Controles
      </h3>

      {/* TEMA / SKIN VISUAL */}
      <div className="setting-item mb-3">
        <label htmlFor="themeSelect" className="text-xs font-bold text-muted mb-1 d-flex align-center gap-1">
          <Palette size={14} className="text-cyan" /> Tema Visual / Skin:
        </label>
        <select
          id="themeSelect"
          value={theme}
          onChange={(e) => setTheme?.(e.target.value)}
          className="select-field w-100"
        >
          <option value="cyberpunk">🌃 Cyberpunk Dark Glass (Neones & Cristal)</option>
          <option value="crt">📟 Búnker Retro CRT 1983 (Fósforo Verde & Scanlines)</option>
          <option value="blueprint">📐 Plano Arquitectónico (Blueprint Azul)</option>
        </select>
      </div>

      {/* NOMENCLATURA */}
      <div className="setting-item mb-3">
        <label htmlFor="numberingSystem" className="text-xs font-bold text-muted mb-1 block">
          Sistema de Nomenclatura:
        </label>
        <select
          id="numberingSystem"
          value={numberingSystem}
          onChange={(e) => setNumberingSystem(e.target.value)}
          className="select-field w-100"
        >
          <option value={NumberingSystems.INTERNATIONAL}>Internacional (Escala Corta: 1B = Mil Millones)</option>
          <option value={NumberingSystems.SPANISH}>Español (Escala Larga: 1B = Un Millón de Millones)</option>
        </select>
      </div>

      {/* AUDIO Y MÚSICA SINTETIZADA */}
      <div className="setting-item mb-2 d-flex justify-between align-center">
        <span className="text-xs font-bold text-muted d-flex align-center gap-1">
          {muted ? <VolumeX size={16} className="text-danger" /> : <Volume2 size={16} className="text-success" />}
          Efectos de Sonido Web Audio
        </span>
        <button
          className={`btn btn-xs ${muted ? 'btn-danger' : 'btn-success'}`}
          onClick={handleToggleMute}
        >
          {muted ? 'Silenciado' : 'Activado'}
        </button>
      </div>

      <div className="setting-item mb-3 d-flex justify-between align-center">
        <span className="text-xs font-bold text-muted d-flex align-center gap-1">
          <Music size={16} className="text-warning" />
          Música Ambiental Lo-fi Synth
        </span>
        <button
          className={`btn btn-xs ${musicOn ? 'btn-warning' : 'btn-outline'}`}
          onClick={handleToggleMusic}
        >
          {musicOn ? 'Sonando 🎵' : 'Apagada'}
        </button>
      </div>

      {/* ATAJOS DE TECLADO */}
      <div className="shortcuts-info glass-panel p-2 mb-3 text-xs">
        <div className="font-bold text-cyan mb-1 d-flex align-center gap-1">
          <Keyboard size={14} /> Atajos de Teclado Rápidos
        </div>
        <div className="d-flex justify-between text-muted py-0.5">
          <span><code>Ctrl + K</code> / <code>Cmd + K</code></span>
          <span className="text-cyan font-bold">Paleta de Comandos Universal</span>
        </div>
        <div className="d-flex justify-between text-muted py-0.5">
          <span><code>Espacio</code></span>
          <span>Pausar / Reanudar</span>
        </div>
        <div className="d-flex justify-between text-muted py-0.5">
          <span><code>1</code> / <code>2</code> / <code>3</code></span>
          <span>Velocidad (x1, x2, x5)</span>
        </div>
        <div className="d-flex justify-between text-muted py-0.5">
          <span><code>M</code></span>
          <span>Silenciar / Activar Audio</span>
        </div>
      </div>

      {/* BOTONES DE GESTIÓN */}
      <div className="d-flex gap-2">
        <button className="btn btn-outline btn-xs flex-1 d-flex align-center justify-center gap-1" onClick={onOpenScenarios}>
          <Flag size={14} /> Escenarios
        </button>
        <button className="btn btn-danger btn-xs flex-1 d-flex align-center justify-center gap-1" onClick={onResetGame}>
          <RotateCcw size={14} /> Reiniciar Mandato
        </button>
      </div>
    </div>
  );
};
