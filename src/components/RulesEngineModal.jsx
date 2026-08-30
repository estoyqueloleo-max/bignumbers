import React, { useState } from 'react';
import { exportRulePackToUrl } from '../utils/rulesEngine';
import { shareMatchViaWebShare } from '../utils/shareUtils';
import { Sliders, Plus, Share2, Trash2, Check, Download, Upload, Sparkles, BookOpen, Layers, X } from 'lucide-react';

export const RulesEngineModal = ({
  isOpen,
  onClose,
  rulePacks = [],
  activeModifiers,
  toggleRulePack,
  addCustomRulePack,
  deleteRulePack
}) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create'
  const [sharedId, setSharedId] = useState(null);

  // Estado del formulario de creación
  const [newPack, setNewPack] = useState({
    name: '',
    author: 'Gobernante Creador',
    description: '',
    incomeMultiplier: 1.0,
    expenseMultiplier: 1.0,
    crisisProbMultiplier: 1.0,
    debtInterestModifier: 0.0,
    growthBonus: 0.0,
    customEventTitle: '',
    customEventDesc: ''
  });

  if (!isOpen) return null;

  const handleSharePack = async (pack) => {
    const shareUrl = exportRulePackToUrl(pack);
    const text = `📜 Expansión de Reglas para el Simulador de Grandes Cifras:
"${pack.name}" (por ${pack.author})
${pack.description}
¡Carga este mod en tu juego con este enlace!`;

    const res = await shareMatchViaWebShare({
      title: `Mod: ${pack.name}`,
      text,
      url: shareUrl
    });

    if (res.success) {
      setSharedId(pack.id);
      setTimeout(() => setSharedId(null), 3000);
    }
  };

  const handleCreateRulePack = (e) => {
    e.preventDefault();
    if (!newPack.name.trim()) return;

    const customEvents = [];
    if (newPack.customEventTitle.trim()) {
      customEvents.push({
        title: newPack.customEventTitle,
        desc: newPack.customEventDesc || 'Evento personalizado del paquete de reglas.',
        costA: 1000000000,
        costB: 100000000,
        popPenalty: 0.05
      });
    }

    const created = {
      id: `custom_${Date.now()}`,
      name: newPack.name,
      author: newPack.author || 'Usuario',
      version: '1.0',
      description: newPack.description || 'Mod personalizado de reglas.',
      enabled: true,
      modifiers: {
        incomeMultiplier: parseFloat(newPack.incomeMultiplier),
        expenseMultiplier: parseFloat(newPack.expenseMultiplier),
        crisisProbMultiplier: parseFloat(newPack.crisisProbMultiplier),
        debtInterestModifier: parseFloat(newPack.debtInterestModifier),
        growthBonus: parseFloat(newPack.growthBonus)
      },
      customEvents,
      customUpgrades: []
    };

    addCustomRulePack(created);
    setViewMode('list');
    setNewPack({
      name: '',
      author: 'Gobernante Creador',
      description: '',
      incomeMultiplier: 1.0,
      expenseMultiplier: 1.0,
      crisisProbMultiplier: 1.0,
      debtInterestModifier: 0.0,
      growthBonus: 0.0,
      customEventTitle: '',
      customEventDesc: ''
    });
  };

  const handleExportJSON = (pack) => {
    const jsonStr = JSON.stringify(pack, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mod_${pack.id}.bignumbers-rules.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && imported.name && imported.modifiers) {
          addCustomRulePack({
            ...imported,
            id: `imported_${Date.now()}`,
            enabled: true
          });
        }
      } catch (err) {
        alert('Archivo de reglas no válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-container rules-engine-modal">
        <div className="modal-header d-flex align-center justify-between">
          <div className="d-flex align-center gap-2">
            <Sliders className="text-cyan" size={24} />
            <h2 className="m-0 text-cyan">Motor de Expansión por Reglas & Mods</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* RESUMEN DE MODIFICADORES GLOBALES ACTIVOS */}
          <div className="active-modifiers-summary glass-panel p-3 mb-4">
            <div className="d-flex justify-between align-center mb-2">
              <span className="text-xs font-bold text-muted uppercase">Efectos Globales de Expansiones Activas:</span>
              <span className="badge badge-cyan">{activeModifiers.activeCount} reglas activas</span>
            </div>
            <div className="d-flex gap-3 flex-wrap text-xs">
              <span>
                Ingresos: <strong className={activeModifiers.incomeMultiplier >= 1 ? 'text-success' : 'text-danger'}>
                  {(activeModifiers.incomeMultiplier * 100).toFixed(0)}%
                </strong>
              </span>
              <span>
                Gastos: <strong className={activeModifiers.expenseMultiplier <= 1 ? 'text-success' : 'text-danger'}>
                  {(activeModifiers.expenseMultiplier * 100).toFixed(0)}%
                </strong>
              </span>
              <span>
                Riesgo Crisis: <strong className={activeModifiers.crisisProbMultiplier <= 1 ? 'text-success' : 'text-danger'}>
                  {(activeModifiers.crisisProbMultiplier * 100).toFixed(0)}%
                </strong>
              </span>
              <span>
                Interés Deuda: <strong className={activeModifiers.debtInterestModifier <= 0 ? 'text-success' : 'text-danger'}>
                  {activeModifiers.debtInterestModifier >= 0 ? '+' : ''}{(activeModifiers.debtInterestModifier * 100).toFixed(1)}%
                </strong>
              </span>
            </div>
          </div>

          {/* BARRA DE ACCIÓN Y PESTAÑAS DEL MODAL */}
          <div className="d-flex justify-between align-center mb-4 flex-wrap gap-2">
            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('list')}
              >
                <Layers size={14} /> Expansiones ({rulePacks.length})
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'create' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('create')}
              >
                <Plus size={14} /> Crear Nuevo Mod
              </button>
            </div>

            <label className="btn btn-outline btn-sm cursor-pointer d-flex align-center gap-1">
              <Upload size={14} />
              <span>Importar Archivo JSON</span>
              <input type="file" accept=".json,.bignumbers-rules" onChange={handleImportFile} style={{ display: 'none' }} />
            </label>
          </div>

          {/* MODO LISTA DE REGLAS */}
          {viewMode === 'list' && (
            <div className="rule-packs-list d-flex flex-column gap-3">
              {rulePacks.map(pack => (
                <div
                  key={pack.id}
                  className={`rule-pack-card glass-panel p-3 ${pack.enabled ? 'rule-pack-enabled' : ''}`}
                >
                  <div className="d-flex justify-between align-center mb-2">
                    <div>
                      <h4 className="m-0 font-bold text-base">{pack.name}</h4>
                      <div className="text-xs text-muted">Por: {pack.author} • v{pack.version || '1.0'}</div>
                    </div>

                    <div className="d-flex align-center gap-2">
                      <button
                        className="btn btn-outline btn-xs d-flex align-center gap-1"
                        onClick={() => handleSharePack(pack)}
                        title="Compartir regla por Web Share API o WhatsApp"
                      >
                        {sharedId === pack.id ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
                        <span>{sharedId === pack.id ? '¡Enviado!' : 'Compartir'}</span>
                      </button>

                      <button
                        className="btn btn-outline btn-xs"
                        onClick={() => handleExportJSON(pack)}
                        title="Descargar archivo JSON"
                      >
                        <Download size={14} />
                      </button>

                      {pack.author !== 'Oficial' && (
                        <button
                          className="btn btn-danger btn-xs"
                          onClick={() => deleteRulePack(pack.id)}
                          title="Eliminar Mod"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      <button
                        className={`btn btn-xs ${pack.enabled ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => toggleRulePack(pack.id)}
                      >
                        {pack.enabled ? 'Activado' : 'Desactivado'}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted mb-3">{pack.description}</p>

                  <div className="rule-pack-badges d-flex gap-2 flex-wrap text-xs">
                    {pack.modifiers.incomeMultiplier !== 1 && (
                      <span className="badge badge-cyan">
                        Ingresos x{pack.modifiers.incomeMultiplier}
                      </span>
                    )}
                    {pack.modifiers.expenseMultiplier !== 1 && (
                      <span className="badge badge-warning">
                        Gastos x{pack.modifiers.expenseMultiplier}
                      </span>
                    )}
                    {pack.modifiers.crisisProbMultiplier !== 1 && (
                      <span className="badge badge-danger">
                        Crisis x{pack.modifiers.crisisProbMultiplier}
                      </span>
                    )}
                    {pack.modifiers.growthBonus !== 0 && (
                      <span className="badge badge-success">
                        Crecimiento {pack.modifiers.growthBonus > 0 ? '+' : ''}{(pack.modifiers.growthBonus * 100).toFixed(2)}%
                      </span>
                    )}
                    {pack.customEvents?.length > 0 && (
                      <span className="badge badge-cyan">
                        +{pack.customEvents.length} Eventos Propios
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODO CREADOR DE REGLAS */}
          {viewMode === 'create' && (
            <form onSubmit={handleCreateRulePack} className="create-rule-form glass-panel p-4">
              <h3 className="text-sm font-bold text-cyan mb-3">Diseñar Nueva Expansión / Mod de Reglas</h3>

              <div className="form-group mb-3">
                <label className="text-xs font-bold text-muted mb-1 block">Nombre de la Expansión / Ley:</label>
                <input
                  type="text"
                  className="input-field w-100"
                  placeholder="Ej. 🚀 Revolución Espacial & Automatización"
                  value={newPack.name}
                  onChange={(e) => setNewPack({ ...newPack, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label className="text-xs font-bold text-muted mb-1 block">Descripción & Visión:</label>
                <textarea
                  className="input-field w-100"
                  rows="2"
                  placeholder="Describe cómo cambia la dinámica económica con estas reglas..."
                  value={newPack.description}
                  onChange={(e) => setNewPack({ ...newPack, description: e.target.value })}
                ></textarea>
              </div>

              {/* SLIDERS DE MODIFICADORES */}
              <div className="modifiers-sliders-grid mb-4">
                <div className="slider-box glass-panel p-2">
                  <div className="d-flex justify-between text-xs mb-1">
                    <span>Multiplicador de Ingresos:</span>
                    <strong className="text-success">{newPack.incomeMultiplier}x</strong>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={newPack.incomeMultiplier}
                    onChange={(e) => setNewPack({ ...newPack, incomeMultiplier: e.target.value })}
                  />
                </div>

                <div className="slider-box glass-panel p-2">
                  <div className="d-flex justify-between text-xs mb-1">
                    <span>Multiplicador de Gastos:</span>
                    <strong className="text-danger">{newPack.expenseMultiplier}x</strong>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={newPack.expenseMultiplier}
                    onChange={(e) => setNewPack({ ...newPack, expenseMultiplier: e.target.value })}
                  />
                </div>

                <div className="slider-box glass-panel p-2">
                  <div className="d-flex justify-between text-xs mb-1">
                    <span>Frecuencia de Crisis:</span>
                    <strong className="text-warning">{newPack.crisisProbMultiplier}x</strong>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={newPack.crisisProbMultiplier}
                    onChange={(e) => setNewPack({ ...newPack, crisisProbMultiplier: e.target.value })}
                  />
                </div>

                <div className="slider-box glass-panel p-2">
                  <div className="d-flex justify-between text-xs mb-1">
                    <span>Bono de Crecimiento Pob:</span>
                    <strong className="text-cyan">{(newPack.growthBonus * 100).toFixed(2)}%</strong>
                  </div>
                  <input
                    type="range"
                    min="-0.005"
                    max="0.01"
                    step="0.001"
                    value={newPack.growthBonus}
                    onChange={(e) => setNewPack({ ...newPack, growthBonus: e.target.value })}
                  />
                </div>
              </div>

              {/* EVENTO PERSONALIZADO OPCIONAL */}
              <div className="glass-panel p-3 mb-4">
                <h4 className="text-xs font-bold text-warning mb-2">Evento / Crisis Personalizada (Opcional)</h4>
                <div className="form-group mb-2">
                  <input
                    type="text"
                    className="input-field w-100 text-xs"
                    placeholder="Título del Evento (ej. Invasión de IA Sintética)"
                    value={newPack.customEventTitle}
                    onChange={(e) => setNewPack({ ...newPack, customEventTitle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="input-field w-100 text-xs"
                    placeholder="Descripción del Evento..."
                    value={newPack.customEventDesc}
                    onChange={(e) => setNewPack({ ...newPack, customEventDesc: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex justify-end gap-2">
                <button type="button" className="btn btn-outline" onClick={() => setViewMode('list')}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar & Activar Expansión
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
