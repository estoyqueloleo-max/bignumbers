import React, { useState } from 'react';
import { SimCityWorld } from './SimCityWorld';
import { MicroABMViewport } from './MicroABMViewport';
import { SocialTraitsLab } from './SocialTraitsLab';
import { ABMExplainerModal } from './ABMExplainerModal';
import { useABMSimulation } from '../hooks/useABMSimulation';
import { Building2, Users, Sparkles, Eye, Brain, HelpCircle } from 'lucide-react';

export const WorldViewport = ({
  state,
  isRunning,
  timeSpeed,
  activeModifiers,
  numberingSystem,
  onOpenABMModal
}) => {
  const [lens, setLens] = useState('macro'); // 'macro' | 'micro' | 'traits'
  const [showExplainer, setShowExplainer] = useState(false);

  // Instancia compartida de simulación para que MicroABM y SocialTraitsLab estén 100% sincronizados
  const abmSim = useABMSimulation(state, isRunning, timeSpeed);

  return (
    <div className="world-viewport-container mb-4">
      {/* MODAL EDUCATIVO EXPLICADOR */}
      <ABMExplainerModal isOpen={showExplainer} onClose={() => setShowExplainer(false)} />

      {/* BARRA DE SELECCIÓN DE LENTE */}
      <div className="d-flex justify-between align-center p-2 mb-2 glass-panel flex-wrap gap-2" style={{ borderBottom: '1px solid var(--border-glass)' }}>
        <div className="d-flex align-center gap-2">
          <Eye size={16} className="text-cyan" />
          <span className="text-xs text-muted font-bold uppercase" style={{ letterSpacing: '1px' }}>
            Lente del País en Vivo:
          </span>
          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={() => setShowExplainer(true)}
            title="¿Cómo funciona la simulación viva y por qué no es un Excel?"
            style={{ fontSize: '0.72rem', padding: '2px 7px' }}
          >
            <HelpCircle size={12} className="text-cyan" />
            <span>¿Por qué este mundo está vivo?</span>
          </button>
        </div>

        <div className="segmented-lens-control d-flex gap-1 flex-wrap">
          <button
            id="btn-lens-macro"
            className={`btn btn-xs d-flex align-center gap-1 ${lens === 'macro' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setLens('macro')}
            title="Vista macroscópica: Ciudad, infraestructuras, rascacielos y ciclo solar"
          >
            <Building2 size={13} />
            <span>Vista Macro: Ciudad</span>
          </button>

          <button
            id="btn-lens-micro"
            className={`btn btn-xs d-flex align-center gap-1 ${lens === 'micro' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setLens('micro')}
            title="Lupa microscópica: 2.500 agentes vivos con físicas, salarios individuales y protestas"
            style={lens === 'micro' ? { background: 'linear-gradient(135deg, #0284c7, #0369a1)', borderColor: '#38bdf8' } : {}}
          >
            <Users size={13} className="text-cyan" />
            <span className="font-bold">Lupa Micro: 2.500 Vidas</span>
            <span className="badge text-xs" style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 4px' }}>Vivo</span>
          </button>

          <button
            id="btn-lens-traits"
            className={`btn btn-xs d-flex align-center gap-1 ${lens === 'traits' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setLens('traits')}
            title="Laboratorio de Psicología Social: Desgaste cognitivo por pantallas, hábitos e inventar rasgos"
            style={lens === 'traits' ? { background: 'linear-gradient(135deg, #9333ea, #7e22ce)', borderColor: '#c084fc' } : { borderColor: 'rgba(192, 132, 252, 0.4)' }}
          >
            <Sparkles size={13} style={{ color: '#c084fc' }} />
            <span className="font-bold" style={{ color: lens === 'traits' ? '#fff' : '#c084fc' }}>🧬 Cerebro Social</span>
            {abmSim.traitEffects?.activeCount > 0 && (
              <span className="badge text-xs" style={{ background: 'rgba(192, 132, 252, 0.3)', color: '#fff', padding: '1px 5px' }}>
                {abmSim.traitEffects.activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* RENDERIZADO SEGÚN LA LENTE ACTIVA */}
      {lens === 'macro' && (
        <SimCityWorld
          state={state}
          isRunning={isRunning}
          timeSpeed={timeSpeed}
          activeModifiers={activeModifiers}
          numberingSystem={numberingSystem}
        />
      )}

      {lens === 'micro' && (
        <MicroABMViewport
          state={state}
          isRunning={isRunning}
          timeSpeed={timeSpeed}
          numberingSystem={numberingSystem}
          onOpenFullLab={onOpenABMModal}
          onOpenTraitsLab={() => setLens('traits')}
          onOpenExplainer={() => setShowExplainer(true)}
          abmSimInstance={abmSim}
        />
      )}

      {lens === 'traits' && (
        <SocialTraitsLab
          socialTraits={abmSim.socialTraits}
          traitEffects={abmSim.traitEffects}
          onToggleTrait={abmSim.toggleSocialTrait}
          onUpdateIntensity={abmSim.updateSocialTraitIntensity}
          onAddCustomTrait={abmSim.addCustomSocialTrait}
          onDeleteTrait={abmSim.deleteSocialTrait}
          onOpenExplainer={() => setShowExplainer(true)}
        />
      )}
    </div>
  );
};
