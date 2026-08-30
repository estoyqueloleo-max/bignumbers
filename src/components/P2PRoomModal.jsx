import React, { useState, useEffect } from 'react';
import { p2pInstance, getQRCodeCells } from '../utils/p2pService';
import { shareMatchViaWebShare } from '../utils/shareUtils';
import { Wifi, QrCode, Share2, Check, Copy, Users, X } from 'lucide-react';

export const P2PRoomModal = ({ isOpen, onClose }) => {
  const [roomInfo, setRoomInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isOpen && !roomInfo) {
      p2pInstance.createRoom().then(info => {
        setRoomInfo(info);
      });

      p2pInstance.on('connected', () => {
        setIsConnected(true);
      });
    }
  }, [isOpen, roomInfo]);

  if (!isOpen) return null;

  const roomUrl = roomInfo?.url || window.location.href;
  const qrData = getQRCodeCells(roomUrl, 180);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareLink = async () => {
    const res = await shareMatchViaWebShare({
      title: 'Sala P2P del Simulador de Grandes Cifras',
      text: `🌐 ¡Únete a mi sesión P2P en vivo sin servidor para la Asamblea Global!`,
      url: roomUrl
    });
    if (res.success) {
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-container p2p-room-modal text-center p-4">
        <div className="modal-header d-flex align-center justify-between">
          <div className="d-flex align-center gap-2">
            <Wifi className="text-cyan" size={24} />
            <h2 className="m-0 text-cyan text-base">Conexión P2P en Vivo (Serverless)</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-xs text-muted mb-4">
            Conexión directa <strong>navegador a navegador</strong> vía WebRTC DataChannels. Los votos y decisiones viajan de forma cifrada sin pasar por ningún servidor central.
          </p>

          {/* CÓDIGO QR GENERADO */}
          <div className="qr-container mb-3 d-flex justify-center">
            <svg
              width={qrData.size}
              height={qrData.size}
              viewBox={`0 0 ${qrData.size} ${qrData.size}`}
              className="qr-code-svg"
              style={{ background: '#ffffff', borderRadius: '8px', padding: '8px' }}
            >
              {qrData.cells.map((cell, idx) => (
                <rect key={idx} x={cell.x} y={cell.y} width={cell.s} height={cell.s} fill="#0f172a" />
              ))}
            </svg>
          </div>

          <div className="d-flex justify-center align-center gap-2 mb-4">
            <span className={`status-dot ${isConnected ? 'bg-success' : 'bg-warning animate-pulse'}`}></span>
            <span className="text-xs font-bold">
              {isConnected ? '🟢 ¡Jugador Conectado en Vivo!' : '🟡 Esperando a que el otro jugador escanee o abra el enlace...'}
            </span>
          </div>

          <div className="d-flex gap-2 justify-center flex-wrap">
            <button className="btn btn-outline btn-sm d-flex align-center gap-1" onClick={handleCopyLink}>
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              <span>{copied ? '¡Copiado!' : 'Copiar Enlace P2P'}</span>
            </button>
            <button className="btn btn-primary btn-sm d-flex align-center gap-1" onClick={handleShareLink}>
              <Share2 size={14} />
              <span>{shared ? '¡Compartido!' : 'Enviar por WhatsApp / Web Share'}</span>
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
