import React, { useState, useEffect } from 'react';
import { getOrCreateKeyPair, getPresidentFingerprint, signRecord, verifyRecord } from '../utils/cryptoPassport';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { shareMatchViaWebShare } from '../utils/shareUtils';
import { ShieldCheck, Award, Key, CheckCircle, XCircle, Share2, Copy, Check, X, Sparkles } from 'lucide-react';

export const PassportModal = ({ isOpen, onClose, state, numberingSystem }) => {
  const [presidentId, setPresidentId] = useState('CARGANDO...');
  const [publicKeyJwk, setPublicKeyJwk] = useState(null);
  const [signedDoc, setSignedDoc] = useState(null);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getOrCreateKeyPair().then(({ publicKeyJwk }) => {
        setPublicKeyJwk(publicKeyJwk);
        getPresidentFingerprint(publicKeyJwk).then(id => setPresidentId(id));
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignCurrentGame = async () => {
    const record = {
      scenarioId: state.scenarioId,
      month: state.month,
      treasury: state.treasury,
      population: state.population,
      debt: state.debt,
      sovereignFund: state.sovereignFund,
      gameWon: state.gameWon,
      gameOver: state.gameOver
    };

    const signed = await signRecord(record);
    setSignedDoc(signed);
  };

  const handleVerify = async () => {
    try {
      const parsed = JSON.parse(verifyInput);
      const isValid = await verifyRecord(parsed);
      setVerifyResult({
        isValid,
        payload: parsed.payload,
        presidentId: parsed.payload.presidentId
      });
    } catch (e) {
      setVerifyResult({ isValid: false, error: 'Formato JSON inválido' });
    }
  };

  const handleShareSignedRecord = async () => {
    if (!signedDoc) return;
    const shareText = `📜 Récord Certificado de Grandes Cifras (${signedDoc.payload.presidentId}):
💰 Tesoro: ${formatCurrency(signedDoc.payload.treasury, numberingSystem)}
📅 Mes: ${signedDoc.payload.month}
Firma Criptográfica: ${signedDoc.signatureHex.substring(0, 16)}...
(Verificado con Web Crypto API ECDSA)`;

    const res = await shareMatchViaWebShare({
      title: 'Pasaporte Soberano Certificado',
      text: shareText,
      url: `${window.location.origin}${window.location.pathname}#verify=${encodeURIComponent(JSON.stringify(signedDoc))}`
    });

    if (res.success) {
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  const handleCopyJSON = () => {
    if (!signedDoc) return;
    navigator.clipboard.writeText(JSON.stringify(signedDoc, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-container passport-modal">
        <div className="modal-header d-flex align-center justify-between">
          <div className="d-flex align-center gap-2">
            <ShieldCheck className="text-warning" size={24} />
            <h2 className="m-0 text-warning text-base">Pasaporte Presidencial & Firma Criptográfica</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* TARJETA DEL PASAPORTE */}
          <div className="passport-card glass-panel p-4 mb-4" style={{ border: '1px solid rgba(234, 179, 8, 0.4)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))' }}>
            <div className="d-flex justify-between align-center mb-3">
              <div>
                <span className="text-xs text-muted font-bold uppercase">República Soberana de la Razón</span>
                <h3 className="m-0 text-cyan text-lg font-bold">Pasaporte de Jefe de Estado</h3>
              </div>
              <div className="badge badge-warning text-xs font-bold">ECDSA P-256</div>
            </div>

            <div className="d-flex justify-between align-center flex-wrap gap-3 mb-3">
              <div>
                <div className="text-xs text-muted">ID de Presidente (Huella Digital)</div>
                <div className="font-bold text-sm text-warning font-mono">{presidentId}</div>
              </div>
              <div>
                <div className="text-xs text-muted">Rango de Escala Alcanzado</div>
                <div className="font-bold text-sm text-success">
                  {state.treasury >= 1e12 ? 'Trillonario Multiplanetario 🚀' : state.treasury >= 1e9 ? 'Gobernante Tecnológico 🏙️' : 'Mandatario en Desarrollo 🌱'}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted">
              🔐 Tu identidad y tus logros están firmados con claves asimétricas generadas localmente en tu navegador. Puedes certificar tus victorias ante cualquier jugador sin servidores centrales.
            </p>
          </div>

          {/* BOTÓN PARA FIRMAR PARTIDA ACTUAL */}
          <div className="glass-panel p-3 mb-4">
            <div className="d-flex justify-between align-center flex-wrap gap-2 mb-2">
              <h4 className="m-0 text-sm font-bold d-flex align-center gap-2">
                <Key size={16} className="text-cyan" /> Certificar y Firmar Estado de Mandato
              </h4>
              <button className="btn btn-primary btn-sm" onClick={handleSignCurrentGame}>
                <Sparkles size={14} /> Firmar Criptográficamente
              </button>
            </div>

            {signedDoc && (
              <div className="signed-result mt-3 p-3 glass-panel" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px' }}>
                <div className="d-flex align-center gap-2 text-success font-bold text-xs mb-2">
                  <CheckCircle size={16} /> ¡Estado Firmado con Éxito por {signedDoc.payload.presidentId}!
                </div>
                <div className="text-xs text-muted font-mono mb-3" style={{ wordBreak: 'break-all' }}>
                  Firma: {signedDoc.signatureHex}
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button className="btn btn-outline btn-xs d-flex align-center gap-1" onClick={handleCopyJSON}>
                    {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    <span>{copied ? '¡Copiado!' : 'Copiar Acta JSON'}</span>
                  </button>
                  <button className="btn btn-primary btn-xs d-flex align-center gap-1" onClick={handleShareSignedRecord}>
                    <Share2 size={12} />
                    <span>{shared ? '¡Compartido!' : 'Compartir Pasaporte (P2P)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* VERIFICADOR DE FIRMAS DE TERCEROS */}
          <div className="glass-panel p-3">
            <h4 className="m-0 text-sm font-bold text-warning mb-2 d-flex align-center gap-2">
              <Award size={16} /> Verificador de Firmas de Otros Jugadores
            </h4>
            <p className="text-xs text-muted mb-3">
              Pega el JSON del acta de un amigo para comprobar matemáticamente que sus cifras son 100% auténticas y no fueron editadas.
            </p>

            <textarea
              className="input-field w-100 mb-2 font-mono text-xs"
              rows={3}
              placeholder='Pega aquí el JSON firmado {"payload": {...}, "signatureHex": "..."}...'
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
            />

            <button className="btn btn-outline btn-sm" onClick={handleVerify}>
              Verificar Firma Matemática
            </button>

            {verifyResult && (
              <div className={`mt-3 p-3 glass-panel ${verifyResult.isValid ? 'border-success' : 'border-danger'}`}>
                {verifyResult.isValid ? (
                  <div>
                    <div className="text-success font-bold text-sm d-flex align-center gap-2 mb-1">
                      <CheckCircle size={18} /> ¡RÉCORD 100% AUTÉNTICO Y VÁLIDO!
                    </div>
                    <div className="text-xs text-muted">
                      Emitido por el Presidente: <strong>{verifyResult.presidentId}</strong>
                    </div>
                    <div className="text-xs mt-1">
                      Tesoro certificado: <strong>{formatCurrency(verifyResult.payload.treasury, numberingSystem)}</strong> en el mes {verifyResult.payload.month}.
                    </div>
                  </div>
                ) : (
                  <div className="text-danger font-bold text-sm d-flex align-center gap-2">
                    <XCircle size={18} /> Firma Inválida o Documento Manipulado
                  </div>
                )}
              </div>
            )}
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
