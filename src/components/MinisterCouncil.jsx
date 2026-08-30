import React from 'react';
import { Shield, Heart, Lightbulb, DollarSign, AlertCircle, Smile, Frown, Sparkles } from 'lucide-react';

export const MinisterCouncil = ({ state, creditRating }) => {
  const isDeficit = (state.treasury === 0);
  const isCrisis = !!state.activeDilemma;
  const isBroke = creditRating?.rating === 'D' || creditRating?.rating === 'CCC';

  // 1. Ministro de Finanzas
  let financeAvatar = '🤑';
  let financeStatus = 'Satisfecho';
  let financeQuote = 'Las cuentas están cuadradas. Sigamos invirtiendo con cabeza.';
  let financeColor = 'var(--success)';

  if (isBroke || state.debt > state.treasury * 2) {
    financeAvatar = '😱';
    financeStatus = '¡Al borde del colapso!';
    financeQuote = '¡Los tipos de interés del FMI nos van a devorar! ¡Emite bonos o recorta ya!';
    financeColor = 'var(--danger)';
  } else if (isDeficit) {
    financeAvatar = '😰';
    financeStatus = 'Déficit crítico';
    financeQuote = 'Estamos en números rojos. La población está sufriendo las consecuencias.';
    financeColor = 'var(--warning)';
  } else if (state.treasury >= 1e11) {
    financeAvatar = '😎';
    financeStatus = 'Poder Económico Máximo';
    financeQuote = 'Gestionamos cifras astronómicas. La historia recordará esta era dorada.';
    financeColor = 'var(--accent-cyan)';
  }

  // 2. Ministra de Sanidad
  const healthAlloc = state.ministryAllocations?.health || 25;
  let healthAvatar = '👩‍⚕️';
  let healthStatus = 'Estable';
  let healthQuote = 'Los hospitales operan con normalidad.';
  let healthColor = 'var(--success)';

  if (isCrisis && state.activeDilemma?.title.includes('Epidémico')) {
    healthAvatar = '🚨';
    healthStatus = '¡Emergencia Sanitaria!';
    healthQuote = '¡Necesitamos fondos inmediatos para aislar el brote y salvar vidas!';
    healthColor = 'var(--danger)';
  } else if (healthAlloc < 15) {
    healthAvatar = '😔';
    healthStatus = 'Falta de Recursos';
    healthQuote = 'Con tan poco presupuesto sanitario, cualquier virus será una masacre.';
    healthColor = 'var(--warning)';
  } else if (healthAlloc >= 40) {
    healthAvatar = '✨';
    healthStatus = 'Excelencia Médica';
    healthQuote = 'La cobertura universal protege a todos nuestros distritos.';
    healthColor = 'var(--success)';
  }

  // 3. Consejero Científico
  const rdAlloc = state.ministryAllocations?.rd || 25;
  let scienceAvatar = '👨‍🔬';
  let scienceStatus = 'Investigando';
  let scienceQuote = 'Nuestros laboratorios avanzan en nuevas tecnologías de escala.';
  let scienceColor = 'var(--accent-cyan)';

  if (state.treasury >= 1e11) {
    scienceAvatar = '🚀';
    scienceStatus = 'Fusión & Cosmos';
    scienceQuote = '¡Tenemos los fondos para financiar el reactor de fusión o ir a Marte!';
    scienceColor = '#ec4899';
  } else if (rdAlloc >= 40) {
    scienceAvatar = '⚡';
    scienceStatus = 'Innovación Acelerada';
    scienceQuote = 'La inversión en I+D está incrementando la eficiencia de toda la nación.';
    scienceColor = 'var(--accent-cyan)';
  }

  // 4. Jefa de Protección Civil
  const secAlloc = state.ministryAllocations?.security || 25;
  let secAvatar = '👮‍♀️';
  let secStatus = 'Alerta Normal';
  let secQuote = 'Sistemas de prevención activos en todas las provincias.';
  let secColor = 'var(--primary)';

  if (isCrisis) {
    secAvatar = '⚠️';
    secStatus = '¡Desastre en Curso!';
    secQuote = `Alerta: ${state.activeDilemma.title}. ¡Tome una decisión rápida, Presidente!`;
    secColor = 'var(--danger)';
  }

  const ministers = [
    { name: 'Don Bernardo', role: 'Finanzas', avatar: financeAvatar, status: financeStatus, quote: financeQuote, color: financeColor },
    { name: 'Dra. Elena', role: 'Salud Pública', avatar: healthAvatar, status: healthStatus, quote: healthQuote, color: healthColor },
    { name: 'Dr. Turing', role: 'Ciencia e I+D', avatar: scienceAvatar, status: scienceStatus, quote: scienceQuote, color: scienceColor },
    { name: 'Capitana Valiente', role: 'Seguridad', avatar: secAvatar, status: secStatus, quote: secQuote, color: secColor }
  ];

  return (
    <div className="glass-panel minister-council-panel mb-4">
      <h4 className="text-xs font-bold text-muted uppercase mb-3 d-flex align-center gap-2">
        <Sparkles size={14} className="text-warning" /> Consejo de Ministros (Avatares Reactivos)
      </h4>

      <div className="ministers-grid">
        {ministers.map((m, idx) => (
          <div key={idx} className="minister-card glass-panel p-3">
            <div className="d-flex align-center gap-2 mb-2">
              <div className="minister-avatar" style={{ fontSize: '2rem' }}>
                {m.avatar}
              </div>
              <div>
                <div className="font-bold text-sm">{m.name}</div>
                <div className="text-xs text-muted">{m.role}</div>
                <div className="badge text-xs" style={{ color: m.color, borderColor: m.color, background: `${m.color}15`, marginTop: '2px' }}>
                  {m.status}
                </div>
              </div>
            </div>
            <div className="minister-bubble text-xs p-2">
              "{m.quote}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
