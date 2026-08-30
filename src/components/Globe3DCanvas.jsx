import React, { useRef, useEffect, useState } from 'react';

export const Globe3DCanvas = ({
  decisions = { player: true, technocrat: true, freerider: false, tit_for_tat: true },
  success = true
}) => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0.2, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // 4 Continentes / Bloques en coordenadas esféricas (latitud, longitud en radianes)
  const nations = [
    { name: 'Tu Nación (👑)', lat: 0.3, lon: 0.4, cooperator: decisions.player, color: '#22d3ee' },
    { name: 'Bloque Nórdico (🔬)', lat: 0.7, lon: -0.8, cooperator: decisions.technocrat, color: '#38bdf8' },
    { name: 'Fed. Oportunista (🦊)', lat: -0.4, lon: 1.5, cooperator: decisions.freerider, color: '#fbbf24' },
    { name: 'Unión Soberanista (⚖️)', lat: -0.2, lon: -2.0, cooperator: decisions.tit_for_tat, color: '#a855f7' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;

    const render = () => {
      angle += 0.008;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      ctx.clearRect(0, 0, width, height);

      // Fondo estelar tenue
      ctx.fillStyle = 'rgba(5, 11, 20, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Brillo atmosférico exterior (Atmospheric Glow)
      const atmoGrad = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.25);
      atmoGrad.addColorStop(0, 'rgba(34, 211, 238, 0.2)');
      atmoGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Esfera del planeta base
      const planetGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      planetGrad.addColorStop(0, '#1e293b');
      planetGrad.addColorStop(0.7, '#0f172a');
      planetGrad.addColorStop(1, '#020617');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Dibujar paralelos y meridianos 3D (Líneas de la esfera)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;

      for (let lat = -60; lat <= 60; lat += 30) {
        const radLat = (lat * Math.PI) / 180;
        const rY = Math.sin(radLat) * radius;
        const rRad = Math.cos(radLat) * radius;
        ctx.beginPath();
        ctx.ellipse(cx, cy + rY, rRad, rRad * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Proyección 3D de los bloques geopolíticos
      const currentRotY = rotation.y + angle;
      const projectedNations = nations.map(n => {
        const lon = n.lon + currentRotY;
        const lat = n.lat + rotation.x;

        const x3d = Math.cos(lat) * Math.sin(lon);
        const y3d = -Math.sin(lat);
        const z3d = Math.cos(lat) * Math.cos(lon);

        const isVisible = z3d > -0.2;
        const screenX = cx + x3d * radius;
        const screenY = cy + y3d * radius;

        return { ...n, screenX, screenY, isVisible, z3d };
      });

      // Dibujar rayos de energía / cooperación entre naciones que cooperan
      const cooperators = projectedNations.filter(n => n.cooperator && n.isVisible);
      if (cooperators.length >= 2) {
        ctx.lineWidth = 2;
        for (let i = 0; i < cooperators.length; i++) {
          for (let j = i + 1; j < cooperators.length; j++) {
            const n1 = cooperators[i];
            const n2 = cooperators[j];

            const beamGrad = ctx.createLinearGradient(n1.screenX, n1.screenY, n2.screenX, n2.screenY);
            beamGrad.addColorStop(0, n1.color);
            beamGrad.addColorStop(1, n2.color);

            ctx.strokeStyle = beamGrad;
            ctx.shadowColor = '#22d3ee';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(n1.screenX, n1.screenY);
            // Arco orbital hacia el centro
            const midX = (n1.screenX + n2.screenX) / 2;
            const midY = (n1.screenY + n2.screenY) / 2 - 20;
            ctx.quadraticCurveTo(midX, midY, n2.screenX, n2.screenY);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Dibujar nodos continentales
      projectedNations.forEach(n => {
        if (!n.isVisible) return;

        const nodeRadius = n.cooperator ? 7 : 6;
        ctx.fillStyle = n.cooperator ? '#10b981' : '#ef4444';
        ctx.beginPath();
        ctx.arc(n.screenX, n.screenY, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Anillo de estado
        ctx.strokeStyle = n.cooperator ? '#34d399' : '#f87171';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(n.screenX, n.screenY, nodeRadius + 3, 0, Math.PI * 2);
        ctx.stroke();

        // Nube de smog sobre desertores
        if (!n.cooperator) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.beginPath();
          ctx.arc(n.screenX, n.screenY, 16, 0, Math.PI * 2);
          ctx.fill();
        }

        // Etiqueta del bloque
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.fillText(n.name, n.screenX + 10, n.screenY + 3);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [rotation, decisions]);

  // Manejo de interacción de rotación con ratón / táctil
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    setRotation(prev => ({
      x: Math.max(-1, Math.min(1, prev.x + dy * 0.005)),
      y: prev.y + dx * 0.005
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="globe-3d-wrapper text-center my-3" style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={480}
        height={260}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ width: '100%', maxWidth: '480px', height: 'auto', display: 'inline-block', cursor: 'grab' }}
      />
      <div className="text-xs text-muted mt-1">
        💡 Arrastra el globo para rotar el planeta y ver los flujos de energía geopolítica
      </div>
    </div>
  );
};
