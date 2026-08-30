import React, { useState } from 'react';

const TUTORIAL_STEPS = [
  {
    title: "Bienvenido al Gestor Estatal",
    content: "En este simulador eres el administrador económico de un país. Tu objetivo es sobrevivir el mayor tiempo posible y evitar que la población perezca por falta de recursos."
  },
  {
    title: "El Engaño de los Millones",
    content: "Al principio verás que tienes muchos Millones en el Tesoro Público. Te sentirás rico y verás que tus ingresos mensuales superan a los gastos. Pero ¡cuidado! Esto es un espejismo de escala."
  },
  {
    title: "El Choque de Magnitudes",
    content: "Más adelante, ocurrirán desastres globales. Estas crisis no cuestan 'Millones'... cuestan MILES DE MILLONES. Si no has invertido para tener un superávit masivo, la crisis te dejará en bancarrota."
  },
  {
    title: "La Estrategia",
    content: "No dejes el dinero quieto. Financia 'Inversiones a Largo Plazo'. Reducir tus gastos mensuales generará un efecto compuesto enorme que te salvará la vida más adelante. ¡Buena suerte!"
  }
];

export const TutorialModal = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleNext = () => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      if (dontShowAgain) {
        localStorage.setItem('bigNumbers_hideTutorial', 'true');
      }
      onComplete();
    }
  };

  return (
    <div className="modal-overlay" style={{ padding: '1rem' }}>
      <div className="glass-panel tutorial-modal" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 className="text-cyan m-0">🎓 Centro de Mando Económico</h3>
        <div style={{ height: '1px', background: 'var(--border-glass)', margin: '0.5rem 0' }}></div>
        <h4 className="m-0 mt-2">{TUTORIAL_STEPS[step].title}</h4>
        <p className="tutorial-content m-0" style={{ lineHeight: '1.6', minHeight: '90px', marginBottom: '1rem' }}>
          {TUTORIAL_STEPS[step].content}
        </p>
        
        <div className="tutorial-footer" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                No mostrar de nuevo
             </label>
             <span className="step-indicator" style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Paso {step + 1} de {TUTORIAL_STEPS.length}</span>
          </div>

          <button className="btn btn-primary w-100" onClick={handleNext}>
            {step < TUTORIAL_STEPS.length - 1 ? 'Siguiente →' : '¡Entendido, a jugar!'}
          </button>
        </div>
      </div>
    </div>
  );
};
