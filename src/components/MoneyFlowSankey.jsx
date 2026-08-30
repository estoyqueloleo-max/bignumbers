import React, { useRef, useEffect } from 'react';
import { formatCurrency } from '../utils/formatters';
import { Activity, ArrowRight } from 'lucide-react';

export const MoneyFlowSankey = ({
  state,
  currentIncome,
  currentExpenses,
  debtInterest,
  numberingSystem
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = 600;
    const height = 180;
    canvas.width = width;
    canvas.height = height;

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * (width / 2),
      y: 30 + Math.random() * 120,
      speed: 1.5 + Math.random() * 2,
      isIncome: true
    }));

    const expenseParticles = Array.from({ length: 30 }, () => ({
      x: width / 2 + Math.random() * (width / 2),
      y: 30 + Math.random() * 120,
      speed: 1.5 + Math.random() * 2,
      isIncome: false
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Fondo oscuro
      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // 1. TUBERÍAS DE FLUJO (Curvas Bézier)
      // Entrada: Impuestos -> Tesorería
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(40, 50);
      ctx.bezierCurveTo(150, 50, 200, cy, cx - 40, cy);
      ctx.stroke();

      // Salida: Tesorería -> Gastos Ministeriales
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(cx + 40, cy);
      ctx.bezierCurveTo(400, cy, 450, 50, width - 40, 50);
      ctx.stroke();

      // Salida: Tesorería -> Deuda / Intereses
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.2)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx + 40, cy);
      ctx.bezierCurveTo(400, cy, 450, 130, width - 40, 130);
      ctx.stroke();

      // 2. PARTÍCULAS EN MOVIMIENTO
      // Partículas de Ingreso (Doradas / Verde)
      particles.forEach(p => {
        p.x += p.speed;
        if (p.x >= cx - 40) {
          p.x = 40;
          p.y = 45 + (Math.random() - 0.5) * 10;
        }

        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y + Math.sin(p.x * 0.05) * 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Partículas de Gasto (Rojas)
      expenseParticles.forEach(p => {
        p.x += p.speed;
        if (p.x >= width - 40) {
          p.x = cx + 40;
          p.y = cy + (Math.random() - 0.5) * 10;
        }

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y + Math.sin(p.x * 0.05) * 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. NODOS CENTRALES Y ETIQUETAS
      // Nodo Entrada
      ctx.fillStyle = '#065f46';
      ctx.fillRect(10, 30, 70, 40);
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(10, 30, 70, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('INGRESOS', 18, 48);
      ctx.fillStyle = '#34d399';
      ctx.font = '9px sans-serif';
      ctx.fillText(`+${(currentIncome / 1e6).toFixed(1)}M`, 18, 62);

      // Nodo Central: Tesoro
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 50, cy - 30, 100, 60);
      ctx.strokeStyle = state.treasury === 0 ? '#ef4444' : '#22d3ee';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 50, cy - 30, 100, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TESORERÍA', cx, cy - 10);
      ctx.fillStyle = state.treasury === 0 ? '#ef4444' : '#38bdf8';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText((state.treasury / 1e6 >= 1000 ? (state.treasury / 1e9).toFixed(1) + 'B' : (state.treasury / 1e6).toFixed(1) + 'M'), cx, cy + 12);
      ctx.textAlign = 'left';

      // Nodo Salida 1: Ministerios
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(width - 80, 30, 70, 40);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.strokeRect(width - 80, 30, 70, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('MINISTERIOS', width - 76, 48);
      ctx.fillStyle = '#f87171';
      ctx.font = '9px sans-serif';
      ctx.fillText(`-${(currentExpenses / 1e6).toFixed(1)}M`, width - 76, 62);

      // Nodo Salida 2: Intereses FMI
      ctx.fillStyle = '#78350f';
      ctx.fillRect(width - 80, 110, 70, 40);
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(width - 80, 110, 70, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('DEUDA FMI', width - 76, 128);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '9px sans-serif';
      ctx.fillText(`-${(debtInterest / 1e6).toFixed(1)}M`, width - 76, 142);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [state, currentIncome, currentExpenses, debtInterest]);

  return (
    <div className="money-flow-sankey-card glass-panel p-3 mb-3">
      <div className="d-flex justify-between align-center mb-2">
        <h4 className="m-0 text-cyan d-flex align-center gap-2 text-xs font-bold uppercase">
          <Activity size={16} /> Flujo Presupuestario & Partículas en Tiempo Real
        </h4>
        <span className="text-xs text-muted">Caudal mensual en vivo</span>
      </div>

      <div className="canvas-sankey-container text-center" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
        <canvas ref={canvasRef} style={{ width: '100%', maxWidth: '600px', height: 'auto', display: 'block' }} />
      </div>
    </div>
  );
};
