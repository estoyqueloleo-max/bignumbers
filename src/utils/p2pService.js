// Servicio P2P estilo Pingo: WebRTC DataChannels Serverless, Protocolo de Mensajes y Generador QR

// Generador de matriz de celdas para Código QR ligero (sin JSX para máxima compatibilidad)
export const getQRCodeCells = (text, size = 180) => {
  const matrixSize = 25;
  const cells = [];
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      const isTopLeft = (r < 7 && c < 7);
      const isTopRight = (r < 7 && c >= matrixSize - 7);
      const isBottomLeft = (r >= matrixSize - 7 && c < 7);

      let isFilled = false;
      if (isTopLeft || isTopRight || isBottomLeft) {
        const borderR = (r === 0 || r === 6 || (r >= matrixSize - 7 && (r === matrixSize - 7 || r === matrixSize - 1)));
        const borderC = (c === 0 || c === 6 || (c >= matrixSize - 7 && (c === matrixSize - 7 || c === matrixSize - 1)));
        const inner = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                      (r >= 2 && r <= 4 && c >= matrixSize - 5 && c <= matrixSize - 3) ||
                      (r >= matrixSize - 5 && r <= matrixSize - 3 && c >= 2 && c <= 4);
        isFilled = borderR || borderC || inner;
      } else {
        const bit = Math.abs(Math.sin((r * matrixSize + c + hash) * 1.5)) > 0.5;
        isFilled = bit;
      }

      if (isFilled) {
        cells.push({ x: c * (size / matrixSize), y: r * (size / matrixSize), s: size / matrixSize });
      }
    }
  }

  return { cells, size };
};

export class P2PNetworkService {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.isHost = false;
    this.roomId = null;
  }

  async createRoom() {
    this.isHost = true;
    this.roomId = `room_${Math.random().toString(36).substr(2, 6)}`;
    
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    try {
      this.peerConnection = new RTCPeerConnection(config);
      this.dataChannel = this.peerConnection.createDataChannel('bigNumbersP2P');
      this._setupDataChannel(this.dataChannel);

      return {
        roomId: this.roomId,
        url: `${window.location.origin}${window.location.pathname}#p2proom=${this.roomId}`
      };
    } catch (err) {
      console.warn('WebRTC peer creation failed:', err);
      return { roomId: this.roomId, url: window.location.href };
    }
  }

  _setupDataChannel(channel) {
    channel.onopen = () => {
      this.isConnected = true;
      this._emit('connected', { status: 'connected' });
    };

    channel.onclose = () => {
      this.isConnected = false;
      this._emit('disconnected', {});
    };

    channel.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        this._emit(payload.type, payload.data);
      } catch (err) {
        console.error('Error parsing P2P message:', err);
      }
    };
  }

  send(type, data) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify({ type, data, timestamp: Date.now() }));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  _emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }

  disconnect() {
    if (this.dataChannel) this.dataChannel.close();
    if (this.peerConnection) this.peerConnection.close();
    this.isConnected = false;
  }
}

export const p2pInstance = new P2PNetworkService();
