import React, { useState, useEffect } from 'react';
import { Newspaper, Bell } from 'lucide-react';

const HEADLINES_POOL = [
  'El Banco Central asegura que 1 Billón de dólares cabe en un pendrive si está bien comprimido.',
  'Encuesta nacional: El 92% de los ciudadanos confunde un Millón con un Billón pero pide duplicar el presupuesto.',
  'Filósofos estatales debaten si el dinero ahorrado en prevención existe o es solo un espejismo cuántico.',
  'La NASA calcula que construir un puente a la Luna costaría menos que 3 rescates del FMI.',
  'El gremio de constructores celebra la inauguración de una rotonda presupuestada en $400 Millones.',
  'Descubren que contar billetes de $1 sin parar hasta llegar a $1B toma exactamente 31.7 años.',
  'Vecinos de la capital proponen pagar la deuda soberana organizando una rifa de tartas.',
  'Científicos aseguran que la fusión nuclear está "a solo 20 años de distancia", como en 1970.'
];

export const NationalGazette = ({ state }) => {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex(prev => (prev + 1) % HEADLINES_POOL.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Titular dinámico si hay crisis o déficit
  let currentHeadline = HEADLINES_POOL[headlineIndex];
  if (state.activeDilemma) {
    currentHeadline = `🚨 ÚLTIMA HORA: ${state.activeDilemma.title}. El país contén el aliento ante la decisión gubernamental.`;
  } else if (state.treasury === 0) {
    currentHeadline = '⚠️ ALERTA NACIONAL: Las arcas del Estado están vacías. El Ministro de Hacienda vende su bolígrafo.';
  } else if (state.treasury >= 1e11) {
    currentHeadline = '🏆 CELEBRACIÓN: El tesoro nacional supera los 100 Mil Millones. El PIB compite con potencias globales.';
  }

  return (
    <div className="national-gazette-bar glass-panel d-flex align-center gap-3 py-2 px-3 mb-3">
      <div className="d-flex align-center gap-1 text-warning font-bold text-xs shrink-0">
        <Newspaper size={16} />
        <span>GACETA NACIONAL:</span>
      </div>
      <div className="gazette-ticker flex-1 text-xs text-muted">
        <span className="ticker-text">{currentHeadline}</span>
      </div>
    </div>
  );
};
