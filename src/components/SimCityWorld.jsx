import React, { useRef, useEffect, useState } from 'react';
import { createGrid, stepGameOfLife, spawnGlider } from '../utils/gameOfLifeEngine';
import { Play, Pause, RefreshCw, Sparkles, Building2, ZoomIn, ZoomOut, Swords } from 'lucide-react';

export const SimCityWorld = ({
  state,
  isRunning,
  timeSpeed,
  activeModifiers,
  numberingSystem
}) => {
  const canvasRef = useRef(null);
  const rows = 20;
  const cols = 36;
  const [grid, setGrid] = useState(() => createGrid(rows, cols, 0.22));
  const [isSimRunning, setIsSimRunning] = useState(true);
  const [aliveCount, setAliveCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [arenaMode, setArenaMode] = useState(false); // Modo Arena Genética Bicolor

  const gridRef = useRef(grid);
  gridRef.current = grid;

  const stateRef = useRef(state);
  stateRef.current = state;

  const getEra = (treasury) => {
    if (treasury >= 1e12) return { era: 'multiplanetary', name: 'Era Multiplanetaria & Fusión', color: '#ec4899' };
    if (treasury >= 1e9) return { era: 'metropolis', name: 'Metrópolis Tecnológica', color: '#38bdf8' };
    return { era: 'settlement', name: 'Desarrollo Nacional Temprano', color: '#10b981' };
  };

  const currentEra = getEra(state.treasury);

  useEffect(() => {
    if (!isSimRunning && !isRunning) return;

    const intervalTime = Math.max(200, 800 / (timeSpeed || 1));
    const intervalId = setInterval(() => {
      setGrid(prev => {
        const next = stepGameOfLife(prev, {
          taxRate: stateRef.current.taxRate,
          healthBonus: (stateRef.current.ministryAllocations?.health || 25) / 100,
          infraBonus: (stateRef.current.ministryAllocations?.infra || 25) / 100,
          isCrisis: !!stateRef.current.activeDilemma || stateRef.current.treasury === 0,
          growthModifier: activeModifiers?.growthBonus || 0
        });

        let count = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (next[r][c]) count++;
          }
        }
        setAliveCount(count);
        return next;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [isSimRunning, isRunning, timeSpeed, activeModifiers]);

  // Render loop a 60fps con Ciclo Día/Noche, Clima Dinámico, Fuegos Artificiales y Arena Genética
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let frame = 0;
    const rainDrops = Array.from({ length: 60 }, () => ({
      x: Math.random() * 720,
      y: Math.random() * 320,
      speed: 4 + Math.random() * 4
    }));

    const fireworks = [];

    const render = () => {
      frame++;
      const width = canvas.width;
      const height = canvas.height;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-width / 2, -height / 2);

      const cellW = width / cols;
      const cellH = height / rows;

      // CICLO DÍA / NOCHE CONTINUO
      const monthProgression = ((stateRef.current.month % 12) / 12) * Math.PI * 2;
      const dayNightFactor = (Math.sin(monthProgression) + 1) / 2;

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (dayNightFactor > 0.6) {
        bgGrad.addColorStop(0, '#0c4a6e');
        bgGrad.addColorStop(1, '#075985');
      } else if (dayNightFactor > 0.3) {
        bgGrad.addColorStop(0, '#4c1d95');
        bgGrad.addColorStop(0.6, '#b45309');
        bgGrad.addColorStop(1, '#1e1b4b');
      } else {
        bgGrad.addColorStop(0, '#050b14');
        bgGrad.addColorStop(1, '#0b1329');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Línea divisoria en Modo Arena Genética
      if (arenaMode) {
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Cuadrícula tenue
      ctx.strokeStyle = dayNightFactor > 0.5 ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cellH);
        ctx.lineTo(width, r * cellH);
        ctx.stroke();
      }
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cellW, 0);
        ctx.lineTo(c * cellW, height);
        ctx.stroke();
      }

      const isDeficit = stateRef.current.treasury === 0;
      const isCrisis = !!stateRef.current.activeDilemma;
      const currentGrid = gridRef.current;
      const treasury = stateRef.current.treasury;

      // RENDERIZADO DE CELDAS
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isAlive = currentGrid[r][c] === 1;
          const x = c * cellW;
          const y = r * cellH;

          if (isAlive) {
            if (arenaMode) {
              // MODO ARENA: Bicolor (Izquierda = Azul / Tu Nación, Derecha = Naranja / Rival)
              const isPlayerSide = c < cols / 2;
              ctx.fillStyle = isPlayerSide ? '#38bdf8' : '#fb923c';
              ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
            } else if (treasury >= 1e12) {
              ctx.fillStyle = '#ec4899';
              ctx.shadowColor = '#ec4899';
              ctx.shadowBlur = 6;
              ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);
              ctx.shadowBlur = 0;

              ctx.fillStyle = '#fdf2f8';
              ctx.beginPath();
              ctx.arc(x + cellW / 2, y + 4, 2, 0, Math.PI * 2);
              ctx.fill();
            } else if (treasury >= 1e9) {
              ctx.fillStyle = isDeficit ? '#ef4444' : (dayNightFactor > 0.4 ? '#0284c7' : '#0369a1');
              ctx.fillRect(x + 1, y + 2, cellW - 2, cellH - 2);

              ctx.fillStyle = (frame + r + c) % 20 < 10 ? '#fef08a' : '#38bdf8';
              ctx.fillRect(x + 3, y + 4, 3, 3);
              ctx.fillRect(x + cellW - 6, y + 4, 3, 3);
            } else {
              ctx.fillStyle = isDeficit ? '#7f1d1d' : (dayNightFactor > 0.4 ? '#059669' : '#047857');
              ctx.fillRect(x + 3, y + 5, cellW - 6, cellH - 6);
              ctx.fillStyle = '#10b981';
              ctx.fillRect(x + 2, y + 2, cellW - 4, 3);
            }

            // Muñequitos animados
            if ((r + c) % 3 === 0) {
              const citizenX = x + cellW / 2 + Math.sin((frame * 0.05) + r) * 3;
              const citizenY = y + cellH - 4;

              if (isDeficit || isCrisis) {
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(citizenX - 1, citizenY - 3, 2, 3);
                ctx.fillStyle = '#fee2e2';
                ctx.fillRect(citizenX - 2, citizenY - 6, 4, 2);
              } else {
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(citizenX - 1, citizenY - 3, 2, 3);
                ctx.fillStyle = '#fde047';
                ctx.beginPath();
                ctx.arc(citizenX, citizenY - 4, 1.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
      }

      // VEHÍCULOS
      const vehicleX = (frame * 1.5) % width;
      const vehicleY = (height / 2) + Math.sin(frame * 0.02) * 20;

      if (isDeficit || isCrisis) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(vehicleX, vehicleY, 8, 4);
        ctx.fillStyle = frame % 10 < 5 ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(vehicleX + 4, vehicleY - 1, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(vehicleX, vehicleY, 10, 3);
      }

      // CLIMA DINÁMICO
      if (isCrisis) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.2;
        rainDrops.forEach(d => {
          d.y = (d.y + d.speed) % height;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 2, d.y + 6);
          ctx.stroke();
        });

        if (frame % 120 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.fillRect(0, 0, width, height);
        }
      }

      // FUEGOS ARTIFICIALES
      if (treasury >= 1e12 && frame % 40 === 0) {
        fireworks.push({
          x: Math.random() * width,
          y: Math.random() * (height / 2),
          color: ['#ec4899', '#22d3ee', '#fef08a', '#10b981'][Math.floor(Math.random() * 4)],
          radius: 1,
          maxRadius: 20 + Math.random() * 20
        });
      }

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.radius += 1.5;
        ctx.strokeStyle = fw.color;
        ctx.shadowColor = fw.color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(fw.x, fw.y, fw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (fw.radius >= fw.maxRadius) {
          fireworks.splice(i, 1);
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [zoomLevel, arenaMode]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    const c = Math.floor((x / rect.width) * cols);
    const r = Math.floor((y / rect.height) * rows);

    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      setGrid(prev => {
        const next = prev.map(row => [...row]);
        next[r][c] = next[r][c] ? 0 : 1;
        return next;
      });
    }
  };

  return (
    <div className="glass-panel simcity-world-panel mb-4">
      <div className="d-flex justify-between align-center mb-2 flex-wrap gap-2">
        <div className="d-flex align-center gap-2">
          <Building2 className="text-cyan" size={20} />
          <div>
            <h3 className="m-0 text-sm font-bold text-cyan">Micro-Mundo SimCity & Game of Life (Clima & Arena Genética)</h3>
            <span className="text-xs text-muted">
              {arenaMode ? '⚔️ Arena Genética Bicolor (Duelo Fronterizo)' : `${currentEra.name} • ${aliveCount} Distritos`}
            </span>
          </div>
        </div>

        <div className="d-flex align-center gap-2 flex-wrap">
          <button
            className={`btn btn-xs ${arenaMode ? 'btn-warning' : 'btn-outline'}`}
            onClick={() => setArenaMode(!arenaMode)}
            title="Alternar Modo Arena Genética Bicolor (Duelo de Políticas)"
          >
            <Swords size={12} />
            <span>{arenaMode ? 'Arena Activa' : 'Modo Arena'}</span>
          </button>

          <div className="zoom-controls d-flex gap-1">
            <button
              className="btn btn-outline btn-xs"
              onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))}
              title="Acercar Cámara (Zoom In)"
            >
              <ZoomIn size={12} />
            </button>
            <button
              className="btn btn-outline btn-xs"
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
              title="Alejar Cámara (Zoom Out)"
            >
              <ZoomOut size={12} />
            </button>
          </div>

          <button
            className="btn btn-outline btn-xs d-flex align-center gap-1"
            onClick={() => {
              const r = Math.floor(Math.random() * (rows - 4));
              const c = Math.floor(Math.random() * (cols - 4));
              setGrid(prev => spawnGlider(prev, r, c));
            }}
            title="Inyectar un convoy comercial / planeador celular"
          >
            <Sparkles size={12} className="text-warning" />
            <span>Sembrar Colonia</span>
          </button>

          <button
            className="btn btn-outline btn-xs"
            onClick={() => setGrid(createGrid(rows, cols, 0.25))}
            title="Regenerar cuadrícula viva"
          >
            <RefreshCw size={12} />
          </button>

          <button
            className={`btn btn-xs ${isSimRunning ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setIsSimRunning(!isSimRunning)}
          >
            {isSimRunning ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>
      </div>

      <div className="canvas-wrapper" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
        <canvas
          ref={canvasRef}
          width={720}
          height={320}
          onClick={handleCanvasClick}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
        />

        <div className="canvas-overlay-hint" style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>
          💡 Clic en el mapa para fundar distritos • Rueda o botones para Zoom
        </div>
      </div>
    </div>
  );
};
