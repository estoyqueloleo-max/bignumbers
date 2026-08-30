import React, { useEffect, useState } from 'react';

const MILESTONES = [
  {
    threshold: 1000000000, // 1B
    id: '1b',
    title: '¡Tu primer Billón (10^9)!',
    text: 'Si gastaras $1,000 diarios todos los días, tardarías más de 2,700 años en gastar esta cantidad.'
  },
  {
    threshold: 10000000000, // 10B
    id: '10b',
    title: '¡10 Billones (10^10)!',
    text: 'En billetes de $100 apilados, esta cantidad alcanzaría los 10 kilómetros de altura, superando el Monte Everest.'
  },
  {
    threshold: 1000000000000, // 1T (1 Billón escala larga)
    id: '1t',
    title: '¡Un Trillón (o Billón Europeo)!',
    text: 'Si gastaras $1 Millón al día desde el año 0 (nacimiento de Cristo), a día de hoy aún no habrías gastado todo este dinero.'
  }
];

export const Milestones = ({ treasury }) => {
  const [activeToasts, setActiveToasts] = useState([]);
  const [triggered, setTriggered] = useState({});

  useEffect(() => {
    MILESTONES.forEach(ms => {
      if (treasury >= ms.threshold && !triggered[ms.id]) {
        setTriggered(prev => ({ ...prev, [ms.id]: true }));
        const toast = { ...ms, time: Date.now() };
        setActiveToasts(prev => [...prev, toast]);
        
        // Remove after 12s
        setTimeout(() => {
          setActiveToasts(prev => prev.filter(t => t.time !== toast.time));
        }, 12000);
      }
    });
  }, [treasury, triggered]);

  if (activeToasts.length === 0) return null;

  return (
    <div className="toast-container">
      {activeToasts.map((toast, i) => (
        <div key={i} className="toast glass-panel">
          <button className="toast-close" onClick={() => setActiveToasts(prev => prev.filter(t => t.time !== toast.time))}>×</button>
          <h4 className="text-warning mb-2">🏆 {toast.title}</h4>
          <p className="text-sm m-0">{toast.text}</p>
        </div>
      ))}
    </div>
  );
};
