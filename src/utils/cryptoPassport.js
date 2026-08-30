// Utilidad de Criptografía Local con Web Crypto API (ECDSA P-256 / SHA-256)
// Permite firmar partidas y validar récords presidenciales sin servidores ni blockchain.

const DB_KEY_NAME = 'bigNumbers_cryptoKeyPair_v1';

// Generar o recuperar par de claves persistente en el navegador
export const getOrCreateKeyPair = async () => {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API no disponible en este navegador');
  }

  const savedKeys = localStorage.getItem(DB_KEY_NAME);
  if (savedKeys) {
    try {
      const parsed = JSON.parse(savedKeys);
      const publicKey = await window.crypto.subtle.importKey(
        'jwk',
        parsed.publicKeyJwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['verify']
      );
      const privateKey = await window.crypto.subtle.importKey(
        'jwk',
        parsed.privateKeyJwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign']
      );
      return { publicKey, privateKey, publicKeyJwk: parsed.publicKeyJwk };
    } catch (e) {
      console.warn('Error al restaurar claves criptográficas, regenerando...', e);
    }
  }

  // Generar nuevo par de claves ECDSA P-256
  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

  localStorage.setItem(DB_KEY_NAME, JSON.stringify({ publicKeyJwk, privateKeyJwk }));

  return { publicKey: keyPair.publicKey, privateKey: keyPair.privateKey, publicKeyJwk };
};

// Obtener la huella digital corta (Fingerprint / ID de Presidente)
export const getPresidentFingerprint = async (publicKeyJwk) => {
  const enc = new TextEncoder();
  const data = enc.encode(JSON.stringify(publicKeyJwk));
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `PRES-${hashHex.substring(0, 8).toUpperCase()}`;
};

// Firmar un récord o resumen de estado de gobierno
export const signRecord = async (recordData) => {
  const { privateKey, publicKeyJwk } = await getOrCreateKeyPair();
  const presidentId = await getPresidentFingerprint(publicKeyJwk);

  const payload = {
    ...recordData,
    presidentId,
    timestamp: Date.now()
  };

  const enc = new TextEncoder();
  const dataToSign = enc.encode(JSON.stringify(payload));

  const signatureBuffer = await window.crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    privateKey,
    dataToSign
  );

  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    payload,
    signatureHex,
    publicKeyJwk
  };
};

// Verificar la firma matemática de un récord recibido de otro jugador
export const verifyRecord = async (signedRecord) => {
  try {
    const { payload, signatureHex, publicKeyJwk } = signedRecord;

    const publicKey = await window.crypto.subtle.importKey(
      'jwk',
      publicKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify']
    );

    const enc = new TextEncoder();
    const dataToVerify = enc.encode(JSON.stringify(payload));

    const match = signatureHex.match(/.{1,2}/g);
    if (!match) return false;
    const signatureBytes = new Uint8Array(match.map(byte => parseInt(byte, 16)));

    const isValid = await window.crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      publicKey,
      signatureBytes,
      dataToVerify
    );

    return isValid;
  } catch (err) {
    console.error('Error durante la verificación criptográfica:', err);
    return false;
  }
};
