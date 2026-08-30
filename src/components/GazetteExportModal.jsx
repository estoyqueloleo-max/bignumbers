import React, { useRef, useEffect, useState } from 'react';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { shareMatchViaWebShare } from '../utils/shareUtils';
import { Printer, Download, Share2, Check, X, FileCheck } from 'lucide-react';

export const GazetteExportModal = ({ isOpen, onClose, state, numberingSystem }) => {
  const canvasRef = useRef(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = 800;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    // Fondo papel pergamino / prensa vintage
    ctx.fillStyle = '#f8f5ee';
    ctx.fillRect(0, 0, width, height);

    // Borde ornamental
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, width - 52, height - 52);

    // Cabecera del Periódico
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.font = '900 36px Georgia, serif';
    ctx.fillText('LA GACETA OFICIAL DEL ESTADO', width / 2, 75);

    ctx.font = 'italic 14px Georgia, serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Edición Especial del Mandato • Mes ${state.month} • Publicación Soberana Certificada`, width / 2, 100);

    // Línea separadora
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(35, 115);
    ctx.lineTo(width - 35, 115);
    ctx.stroke();

    // Titular Principal
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 28px Georgia, serif';

    let headline = 'EL PAÍS ALCANZA LA PROSPERIDAD NACIONAL';
    let subline = 'Las arcas estatales marcan récords históricos bajo una administración rigurosa.';

    if (state.treasury >= 1e12) {
      headline = '¡LA ERA DE LOS TRILLONES: MISIÓN A MARTE!';
      subline = 'El Presidente financia la red de fusión y la primera colonia espacial.';
    } else if (state.treasury === 0) {
      headline = '¡CRISIS FINANCIERA: EL ESTADO EN QUIEBRA!';
      subline = 'El Banco Central busca auxilio ante el colapso del crédito soberano.';
    }

    ctx.fillText(headline, 40, 160);
    ctx.font = '16px Georgia, serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(subline, 40, 190);

    // Cuadro de Métricas Clave
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(40, 220, width - 80, 120);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(40, 220, width - 80, 120);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText('ESTADO DE LAS FINANZAS NACIONALES', 60, 250);

    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`💰 Tesorería Soberana: ${formatCurrency(state.treasury, numberingSystem)}`, 60, 285);
    ctx.fillText(`👥 Población Activa: ${formatLargeNumber(state.population, numberingSystem)} ciudadanos`, 60, 315);
    ctx.fillText(`🏦 Deuda Externa: ${formatCurrency(state.debt || 0, numberingSystem)}`, 440, 285);
    ctx.fillText(`🏛️ Fondo Soberano: ${formatCurrency(state.sovereignFund || 0, numberingSystem)}`, 440, 315);

    // Columna Editorial / Consejo de Ministros
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('DECLARACIONES DEL GABINETE', 40, 390);

    ctx.font = '14px Georgia, serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('• Ministro de Hacienda: "Los números hablan por sí mismos; la disciplina fiscal rinde frutos."', 40, 425);
    ctx.fillText('• Ministra de Salud: "La cobertura sanitaria se mantiene como el pilar central de nuestra resiliencia."', 40, 460);
    ctx.fillText('• Consejero Científico: "Nuestros laboratorios investigan nuevas tecnologías para liderar el mundo."', 40, 495);
    ctx.fillText('• Jefa de Seguridad: "Las redes de prevención están desplegadas y vigilantes ante cualquier crisis."', 40, 530);

    // Resumen Histórico y Sello
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('DECRETO HISTÓRICO Y SELLO SOBERANO', 40, 600);

    ctx.font = '14px Georgia, serif';
    ctx.fillStyle = '#475569';
    const textDesc = `Por la presente acta se certifica que la nación ha navegado ${state.month} meses de gobierno democrático y estratégico, enfrentando dilemas multilaterales y preservando el bienestar de sus ciudadanos.`;
    ctx.fillText(textDesc, 40, 635, width - 80);

    // Sello Oficial de Estado (Círculo Ornamental)
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width / 2, 770, 75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(width / 2, 770, 68, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#b91c1c';
    ctx.font = '900 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REPÚBLICA DE GRANDES CIFRAS', width / 2, 735);
    ctx.fillText('★ FIRMA AUTÉNTICA ★', width / 2, 775);
    ctx.fillText('WEB CRYPTO CERTIFIED', width / 2, 810);

    // Pie de página
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Simulador de Grandes Cifras • Generado 100% en el Navegador (Serverless PWA)', width / 2, 950);

    setDownloadUrl(canvas.toDataURL('image/png'));
  }, [isOpen, state, numberingSystem]);

  if (!isOpen) return null;

  const handleShare = async () => {
    const res = await shareMatchViaWebShare({
      title: 'Gaceta Oficial del Estado',
      text: `📰 ¡Mira la portada oficial de mi mandato en el Simulador de Grandes Cifras! (Mes ${state.month})`,
      url: window.location.href
    });

    if (res.success) {
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-container gazette-export-modal" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header d-flex align-center justify-between">
          <div className="d-flex align-center gap-2">
            <Printer className="text-warning" size={24} />
            <h2 className="m-0 text-warning text-base">Gaceta Oficial del Estado (Portada Imprimible)</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body text-center">
          <p className="text-xs text-muted mb-3">
            Portada de periódico oficial generada en alta definición con las decisiones de tu mandato y el sello de estado.
          </p>

          <div className="gazette-canvas-preview mb-4 d-flex justify-center" style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
          </div>

          <div className="d-flex gap-3 justify-center flex-wrap">
            {downloadUrl && (
              <a href={downloadUrl} download={`gaceta_estado_mes_${state.month}.png`} className="btn btn-primary d-flex align-center gap-2">
                <Download size={16} /> Descargar Imagen en Alta Calidad (PNG)
              </a>
            )}
            <button className="btn btn-outline d-flex align-center gap-2" onClick={handleShare}>
              {shared ? <Check size={16} className="text-success" /> : <Share2 size={16} />}
              <span>{shared ? '¡Compartido!' : 'Compartir Portada'}</span>
            </button>
          </div>
        </div>

        <div className="modal-footer d-flex justify-end mt-4">
          <button className="btn btn-outline" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
