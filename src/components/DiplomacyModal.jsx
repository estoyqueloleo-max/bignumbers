import React, { useState, useEffect } from 'react';
import { TREATIES, createTreatyCapsule, unpackTreatyCapsule } from '../utils/diplomacyEngine';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { shareMatchViaWebShare } from '../utils/shareUtils';
import { Mail, Send, CheckCircle, ShieldAlert, Share2, Copy, Check, X, FileText } from 'lucide-react';

export const DiplomacyModal = ({ isOpen, onClose, state, numberingSystem }) => {
  const [selectedTreaty, setSelectedTreaty] = useState(TREATIES[0]);
  const [generatedCapsuleUrl, setGeneratedCapsuleUrl] = useState('');
  const [incomingTreaty, setIncomingTreaty] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const incoming = unpackTreatyCapsule(window.location.hash);
      if (incoming) {
        setIncomingTreaty(incoming);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateTreaty = () => {
    const url = createTreatyCapsule(state, selectedTreaty.id, true);
    setGeneratedCapsuleUrl(url);
  };

  const handleShareTreaty = async () => {
    if (!generatedCapsuleUrl) return;
    const text = `📜 Propuesta de Tratado Internacional: "${selectedTreaty.name}"
He firmado este acuerdo tras gobernar ${state.month} meses.
¿Aceptas el tratado o impondrás aranceles?`;

    const res = await shareMatchViaWebShare({
      title: 'Tratado Diplomático de Grandes Cifras',
      text,
      url: generatedCapsuleUrl
    });

    if (res.success) {
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  const handleCopyLink = () => {
    if (!generatedCapsuleUrl) return;
    navigator.clipboard.writeText(generatedCapsuleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-container diplomacy-modal">
        <div className="modal-header d-flex align-center justify-between">
          <div className="d-flex align-center gap-2">
            <Mail className="text-cyan" size={24} />
            <h2 className="m-0 text-cyan text-base">Diplomacia Asíncrona & Ajedrez Postal</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-xs text-muted mb-4">
            Envía tratados y cápsulas de estado a otros presidentes por correo o WhatsApp. El otro jugador tomará el relevo, responderá a tus acuerdos y te devolverá la cápsula.
          </p>

          {/* SI HAY UN TRATADO ENTRANTE */}
          {incomingTreaty && (
            <div className="incoming-treaty-card glass-panel p-3 mb-4 border-warning">
              <div className="text-warning font-bold text-xs mb-1 d-flex align-center gap-1">
                <FileText size={14} /> ¡HAS RECIBIDO UNA PROPUESTA DE TRATADO!
              </div>
              <div className="text-xs text-muted mb-2">
                Nación Vecina en el Mes {incomingTreaty.proposerState.month} con {formatCurrency(incomingTreaty.proposerState.treasury, numberingSystem)}.
              </div>
              <p className="text-xs mb-3 font-bold">
                Tratado Propuesto: {TREATIES.find(t => t.id === incomingTreaty.treatyId)?.name || 'Tratado Bilateral'}
              </p>
              <div className="d-flex gap-2">
                <button className="btn btn-success btn-xs" onClick={() => alert('¡Tratado ratificado bilateralmente!')}>
                  Aceptar y Cooperar
                </button>
                <button className="btn btn-danger btn-xs" onClick={() => alert('Has rechazado el tratado e impuesto aranceles.')}>
                  Rechazar e Imponer Aranceles
                </button>
              </div>
            </div>
          )}

          {/* SELECCIONAR Y CREAR TRATADO */}
          <div className="treaties-selection mb-4">
            <h4 className="text-xs text-muted uppercase font-bold mb-2">Selecciona un Tratado a Proponer</h4>
            <div className="treaties-grid d-flex flex-column gap-2 mb-3">
              {TREATIES.map(t => (
                <div
                  key={t.id}
                  className={`treaty-card glass-panel p-3 cursor-pointer ${selectedTreaty.id === t.id ? 'border-cyan' : ''}`}
                  onClick={() => setSelectedTreaty(t)}
                  style={{ background: selectedTreaty.id === t.id ? 'rgba(34, 211, 238, 0.08)' : 'rgba(0,0,0,0.3)' }}
                >
                  <div className="font-bold text-sm text-cyan mb-1">{t.name}</div>
                  <div className="text-xs text-muted">{t.desc}</div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary btn-sm d-flex align-center gap-1" onClick={handleCreateTreaty}>
              <Send size={14} /> Redactar y Firmar Cápsula Diplomática
            </button>
          </div>

          {generatedCapsuleUrl && (
            <div className="generated-capsule-box glass-panel p-3 border-success">
              <div className="d-flex align-center gap-2 text-success font-bold text-xs mb-2">
                <CheckCircle size={16} /> ¡Cápsula de Relevo Diplomático Lista para Enviar!
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-outline btn-xs d-flex align-center gap-1" onClick={handleCopyLink}>
                  {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  <span>{copied ? '¡Enlace Copiado!' : 'Copiar Enlace Postal'}</span>
                </button>
                <button className="btn btn-primary btn-xs d-flex align-center gap-1" onClick={handleShareTreaty}>
                  <Share2 size={12} />
                  <span>{shared ? '¡Enviado!' : 'Enviar por Pingo / WhatsApp'}</span>
                </button>
              </div>
            </div>
          )}
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
