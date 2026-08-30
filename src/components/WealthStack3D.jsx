import React, { useRef, useEffect, useState } from 'react';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { Box, Layers, ArrowUpRight } from 'lucide-react';

export const WealthStack3D = ({ initialTreasury = 1000000000, numberingSystem }) => {
  const canvasRef = useRef(null);
  const [amount, setAmount] = useState(initialTreasury);

  // Altura física en metros de una pila de billetes de $100
  // 1 billete = 0.1092 mm = 0.0001092 m. 1 millón en billetes de $100 = 10.000 billetes = 1.092 metros.
  const stackHeightMeters = (amount / 100) * 0.0001092;

  const getBenchmark = (hMeters) => {
    if (hMeters >= 384400000) return { label: '🌕 Distancia a la Luna (384.400 km)', color: '#fbcfe8' };
    if (hMeters >= 100000) return { label: '🛰️ Espacio Exterior (Línea de Kármán > 100 km)', color: '#ec4899' };
    if (hMeters >= 8848) return { label: '🏔️ Monte Everest (8.848 m)', color: '#f59e0b' };
    if (hMeters >= 828) return { label: '🏙️ Rascacielos Burj Khalifa (828 m)', color: '#38bdf8' };
    if (hMeters >= 93) return { label: '🗽 Estatua de la Libertad (93 m)', color: '#34d399' };
    if (hMeters >= 1.75) return { label: '🧍 Persona Promedio (1.75 m)', color: '#22d3ee' };
    return { label: '📏 Altura de una mesa (0.8 m)', color: '#94a3b8' };
  };

  const benchmark = getBenchmark(stackHeightMeters);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Fondo tenue
    ctx.fillStyle = '#050b14';
    ctx.fillRect(0, 0, width, height);

    // Suelo isométrico
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(width / 2 + i * 30, height - 30 + i * 15);
      ctx.lineTo(width / 2 + i * 30 - 200, height - 30 + i * 15 - 100);
      ctx.stroke();
    }

    // Calcular altura gráfica del bloque isométrico
    const logVal = Math.log10(Math.max(1, amount));
    const normH = Math.min(180, Math.max(10, (logVal / 12) * 170));

    const cx = width / 2 - 30;
    const cy = height - 40;
    const size = 60;

    // Cara izquierda del bloque isométrico (Sombra oscura)
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - size, cy - size * 0.5);
    ctx.lineTo(cx - size, cy - size * 0.5 - normH);
    ctx.lineTo(cx, cy - normH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.stroke();

    // Cara derecha del bloque isométrico (Sombra media)
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + size, cy - size * 0.5);
    ctx.lineTo(cx + size, cy - size * 0.5 - normH);
    ctx.lineTo(cx, cy - normH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.stroke();

    // Cara superior del bloque isométrico (Luz)
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(cx, cy - normH);
    ctx.lineTo(cx - size, cy - size * 0.5 - normH);
    ctx.lineTo(cx, cy - size - normH);
    ctx.lineTo(cx + size, cy - size * 0.5 - normH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6ee7b7';
    ctx.stroke();

    // Silueta de comparación al lado (Humano o Referente)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx + size + 35, cy - 25, 4, 25);
    ctx.beginPath();
    ctx.arc(cx + size + 37, cy - 28, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.fillText('Humano (1.75m)', cx + size + 45, cy - 15);

    // Flecha indicadora de altura
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - size - 20, cy);
    ctx.lineTo(cx - size - 20, cy - normH);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${stackHeightMeters >= 1000 ? (stackHeightMeters / 1000).toFixed(1) + ' km' : stackHeightMeters.toFixed(1) + ' m'}`, cx - size - 65, cy - normH / 2);

  }, [amount, stackHeightMeters]);

  return (
    <div className="wealth-stack-3d-card glass-panel p-4 mb-4">
      <div className="d-flex justify-between align-center mb-2 flex-wrap gap-2">
        <h4 className="m-0 text-cyan d-flex align-center gap-2 text-sm font-bold">
          <Box size={18} /> Pila Física Isométrica en Billetes de $100
        </h4>
        <span className="badge text-xs" style={{ color: benchmark.color, borderColor: benchmark.color }}>
          {benchmark.label}
        </span>
      </div>

      <p className="text-xs text-muted mb-3">
        Descubre el volumen físico real que ocuparía esta fortuna si estuviera apilada en fajos de billetes de $100.
      </p>

      <div className="canvas-stack-container text-center mb-3">
        <canvas
          ref={canvasRef}
          width={520}
          height={240}
          style={{ width: '100%', maxWidth: '520px', height: 'auto', borderRadius: '8px', border: '1px solid var(--border-glass)' }}
        />
      </div>

      {/* CONTROLADOR INTERACTIVO */}
      <div className="d-flex gap-2 align-center flex-wrap">
        <span className="text-xs text-muted">Cifra a simular:</span>
        <button className="btn btn-outline btn-xs" onClick={() => setAmount(1000000)}>$1 Millón</button>
        <button className="btn btn-outline btn-xs" onClick={() => setAmount(100000000)}>$100 Millones</button>
        <button className="btn btn-outline btn-xs" onClick={() => setAmount(1000000000)}>$1 Mil Millones (1B)</button>
        <button className="btn btn-outline btn-xs" onClick={() => setAmount(100000000000)}>$100 Billones</button>
        <button className="btn btn-outline btn-xs" onClick={() => setAmount(1000000000000)}>$1 Trillón (1T)</button>
        <button className="btn btn-primary btn-xs" onClick={() => setAmount(initialTreasury)}>Cargar Mi Tesoro</button>
      </div>
    </div>
  );
};
