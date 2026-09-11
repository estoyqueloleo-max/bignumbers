import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Sliders,
  Check,
  Trash2,
  Share2,
  TrendingDown,
  TrendingUp,
  Activity,
  Heart,
  Store,
  DollarSign,
  Download,
  Upload,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { exportTraitsToJson, importTraitsFromJson } from '../utils/socialTraitsEngine';

export const SocialTraitsLab = ({
  socialTraits = [],
  traitEffects = {},
  onToggleTrait,
  onUpdateIntensity,
  onAddCustomTrait,
  onDeleteTrait,
  onOpenExplainer
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estado del formulario de creación de rasgo
  const [newTrait, setNewTrait] = useState({
    name: '',
    icon: '🧠',
    category: 'Sociedad & Hábitos',
    description: '',
    intensity: 70,
    productivityFactor: -0.15,
    healthFactor: -0.10,
    protestSensitivity: -0.25,
    consumptionPropensity: 0.05,
    capitalFlightRate: 0.10,
    takeaway: ''
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTrait.name.trim()) return;

    const trait = {
      id: `custom_trait_${Date.now()}`,
      name: newTrait.name.trim(),
      icon: newTrait.icon || '🧠',
      category: newTrait.category || 'Sociedad & Hábitos',
      description: newTrait.description || 'Fenómeno social personalizado.',
      enabled: true,
      intensity: Number(newTrait.intensity),
      impacts: {
        productivityFactor: Number(newTrait.productivityFactor),
        healthFactor: Number(newTrait.healthFactor),
        protestSensitivity: Number(newTrait.protestSensitivity),
        consumptionPropensity: Number(newTrait.consumptionPropensity),
        capitalFlightRate: Number(newTrait.capitalFlightRate)
      },
      takeaway: newTrait.takeaway || 'Impacto emergente directo en la población.'
    };

    onAddCustomTrait(trait);
    setShowCreateModal(false);
    setNewTrait({
      name: '',
      icon: '🧠',
      category: 'Sociedad & Hábitos',
      description: '',
      intensity: 70,
      productivityFactor: -0.15,
      healthFactor: -0.10,
      protestSensitivity: -0.25,
      consumptionPropensity: 0.05,
      capitalFlightRate: 0.10,
      takeaway: ''
    });
  };

  const handleExport = () => {
    const jsonStr = exportTraitsToJson(socialTraits);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="social-traits-lab glass-panel p-3 d-flex flex-column gap-3 animate-fade-in">
      {/* CABECERA CON RESUMEN DEL EFECTO AGREGADO */}
      <div className="d-flex justify-between align-center flex-wrap gap-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div className="d-flex align-center gap-2">
            <Sparkles size={18} style={{ color: '#c084fc' }} />
            <h3 className="m-0 text-sm font-bold uppercase" style={{ color: '#c084fc', letterSpacing: '1px' }}>
              Laboratorio de Psicología Social & Fenómenos Dinámicos
            </h3>
          </div>
          <p className="text-xs text-muted m-0 mt-0.5">
            Calibra la mente y los hábitos de los 2.500 ciudadanos. Cada rasgo altera la productividad, la sanidad y las protestas.
          </p>
        </div>

        <div className="d-flex align-center gap-2">
          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={onOpenExplainer}
            title="¿Cómo funciona la simulación viva por agentes?"
          >
            <HelpCircle size={13} className="text-cyan" />
            <span className="hide-mobile">¿Cómo funciona?</span>
          </button>

          <button
            className="btn btn-primary btn-xs d-flex align-center gap-1"
            onClick={() => setShowCreateModal(true)}
            style={{ background: 'linear-gradient(135deg, #a855f7, #9333ea)', borderColor: '#c084fc' }}
          >
            <Plus size={14} />
            <span>+ Inventar Nuevo Fenómeno</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD DE IMPACTO MACRO AGREGADO */}
      <div className="p-3 rounded" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-xs text-muted font-bold uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
          📊 Impacto Combinado de los Fenómenos Activos ({traitEffects.activeCount || 0} activos):
        </div>

        <div className="grid-2-col gap-2 text-xs">
          <div className="p-2 rounded d-flex justify-between align-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-muted">🏭 Productividad Pymes:</span>
            <span className={`font-bold ${(traitEffects.productivityMultiplier || 1.0) >= 1.0 ? 'text-success' : 'text-danger'}`}>
              {((traitEffects.productivityMultiplier || 1.0) * 100 - 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-2 rounded d-flex justify-between align-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-muted">🏥 Presión Sanitaria:</span>
            <span className={`font-bold ${(traitEffects.healthBonusPerTick || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
              {(traitEffects.healthBonusPerTick || 0) > 0 ? '+' : ''}{(traitEffects.healthBonusPerTick || 0).toFixed(1)} salud/mes
            </span>
          </div>

          <div className="p-2 rounded d-flex justify-between align-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-muted">📢 Mecha de Protesta:</span>
            <span className={`font-bold ${(traitEffects.protestSensitivityMultiplier || 1.0) > 1.0 ? 'text-warning' : 'text-cyan'}`}>
              {((traitEffects.protestSensitivityMultiplier || 1.0) * 100).toFixed(0)}% de sensibilidad
            </span>
          </div>

          <div className="p-2 rounded d-flex justify-between align-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-muted">📉 Impacto Estimado PIB:</span>
            <span className={`font-bold ${(traitEffects.estimatedGdpImpactPct || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
              {(traitEffects.estimatedGdpImpactPct || 0) > 0 ? '+' : ''}{(traitEffects.estimatedGdpImpactPct || 0).toFixed(1)}% en PIB
            </span>
          </div>
        </div>
      </div>

      {/* LISTA DE RASGOS Y FENÓMENOS SOCIALES */}
      <div className="traits-cards-list d-flex flex-column gap-2">
        {socialTraits.map((trait) => (
          <div
            key={trait.id}
            className={`p-3 rounded transition-all ${trait.enabled ? 'border-cyan' : ''}`}
            style={{
              background: trait.enabled ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${trait.enabled ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`
            }}
          >
            <div className="d-flex justify-between align-center mb-1">
              <div className="d-flex align-center gap-2">
                <span style={{ fontSize: '1.25rem' }}>{trait.icon}</span>
                <div>
                  <div className="font-bold text-sm text-cyan">{trait.name}</div>
                  <div className="text-xs text-muted">{trait.category}</div>
                </div>
              </div>

              <div className="d-flex align-center gap-2">
                <button
                  className={`btn btn-xs ${trait.enabled ? 'btn-success' : 'btn-outline'}`}
                  onClick={() => onToggleTrait(trait.id)}
                  style={{ minWidth: '80px' }}
                >
                  {trait.enabled ? '✅ Activo' : '⚪ Inactivo'}
                </button>

                {trait.id.startsWith('custom_') && (
                  <button
                    className="btn-icon btn-xs text-danger"
                    onClick={() => onDeleteTrait(trait.id)}
                    title="Eliminar rasgo personalizado"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-muted mb-2">{trait.description}</p>

            {/* DESLIZADOR DE INTENSIDAD / PREVALENCIA */}
            {trait.enabled && (
              <div className="p-2 rounded mt-2" style={{ background: 'rgba(0,0,0,0.25)' }}>
                <div className="d-flex justify-between align-center text-xs mb-1">
                  <span className="text-muted">Intensidad / Prevalencia en la Población:</span>
                  <span className="font-bold text-cyan">{trait.intensity || 50}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={trait.intensity || 50}
                  onChange={(e) => onUpdateIntensity(trait.id, Number(e.target.value))}
                />

                <div className="d-flex justify-between text-xs mt-2 text-muted" style={{ fontSize: '0.7rem' }}>
                  <span>Productividad: {(trait.impacts?.productivityFactor * 100) > 0 ? '+' : ''}{(trait.impacts?.productivityFactor * 100).toFixed(0)}%</span>
                  <span>Salud: {(trait.impacts?.healthFactor * 100) > 0 ? '+' : ''}{(trait.impacts?.healthFactor * 100).toFixed(0)}%</span>
                  <span>Protesta: {(trait.impacts?.protestSensitivity * 100) > 0 ? '+' : ''}{(trait.impacts?.protestSensitivity * 100).toFixed(0)}%</span>
                  <span>Fuga Capital: {((trait.impacts?.capitalFlightRate || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BOTONES DE EXPORTAR E IMPORTAR COMPORTAMIENTOS */}
      <div className="d-flex justify-between align-center pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          className="btn btn-outline btn-xs d-flex align-center gap-1"
          onClick={handleExport}
          title="Copiar configuración de rasgos en JSON para compartir"
        >
          {copied ? <Check size={12} className="text-success" /> : <Share2 size={12} />}
          <span>{copied ? '¡Copiado al Portapapeles!' : 'Exportar Mod de Rasgos (JSON)'}</span>
        </button>
      </div>

      {/* MODAL CREAR NUEVO FENÓMENO SOCIAL */}
      {showCreateModal && (
        <div className="modal-overlay" style={{ padding: '1rem', zIndex: 3200 }}>
          <div className="glass-panel p-4 animate-fade-in" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-between align-center mb-3">
              <h3 className="m-0 text-cyan font-bold">🧬 Inventar Nuevo Fenómeno Social</h3>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="d-flex flex-column gap-3 text-xs">
              <div>
                <label className="text-muted font-bold mb-1 d-block">Nombre del Fenómeno:</label>
                <input
                  type="text"
                  className="input-field w-100"
                  placeholder="ej: Desgaste Cognitivo por Móvil, Teletrabajo Masivo, Jornada 4 Días..."
                  value={newTrait.name}
                  onChange={(e) => setNewTrait({ ...newTrait, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2-col gap-2">
                <div>
                  <label className="text-muted font-bold mb-1 d-block">Icono (Emoji):</label>
                  <input
                    type="text"
                    className="input-field w-100"
                    placeholder="📱, ☕, 🤖, 🧠..."
                    value={newTrait.icon}
                    onChange={(e) => setNewTrait({ ...newTrait, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-muted font-bold mb-1 d-block">Categoría:</label>
                  <input
                    type="text"
                    className="input-field w-100"
                    value={newTrait.category}
                    onChange={(e) => setNewTrait({ ...newTrait, category: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-muted font-bold mb-1 d-block">Descripción Pedagógica:</label>
                <textarea
                  className="input-field w-100"
                  rows={2}
                  placeholder="Describe cómo este fenómeno altera la vida cotidiana de las personas..."
                  value={newTrait.description}
                  onChange={(e) => setNewTrait({ ...newTrait, description: e.target.value })}
                />
              </div>

              <div className="p-3 rounded" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="font-bold text-cyan mb-2">⚖️ Reglas de Impacto en Cascada:</div>

                <div className="d-flex flex-column gap-2">
                  <div>
                    <div className="d-flex justify-between">
                      <span>Productividad de Pymes:</span>
                      <span className="font-bold">{(newTrait.productivityFactor * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="-0.50"
                      max="0.50"
                      step="0.05"
                      value={newTrait.productivityFactor}
                      onChange={(e) => setNewTrait({ ...newTrait, productivityFactor: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <div className="d-flex justify-between">
                      <span>Salud Social / Gasto Sanitario:</span>
                      <span className="font-bold">{(newTrait.healthFactor * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="-0.50"
                      max="0.50"
                      step="0.05"
                      value={newTrait.healthFactor}
                      onChange={(e) => setNewTrait({ ...newTrait, healthFactor: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <div className="d-flex justify-between">
                      <span>Mecha de Protesta (Huelgas en la Plaza):</span>
                      <span className="font-bold">{(newTrait.protestSensitivity * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="-0.50"
                      max="0.50"
                      step="0.05"
                      value={newTrait.protestSensitivity}
                      onChange={(e) => setNewTrait({ ...newTrait, protestSensitivity: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <div className="d-flex justify-between">
                      <span>Fuga de Capital a Plataformas Externas:</span>
                      <span className="font-bold">{(newTrait.capitalFlightRate * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="0.40"
                      step="0.05"
                      value={newTrait.capitalFlightRate}
                      onChange={(e) => setNewTrait({ ...newTrait, capitalFlightRate: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-end gap-2 pt-2">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Guardar e Inyectar en el Simulador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
