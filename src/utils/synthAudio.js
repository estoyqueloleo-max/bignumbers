// Motor de Sintetizador Procedural con Web Audio API Nativo
// Cero archivos externos: genera música ambiental retro-futurista y efectos dinámicos en tiempo real.

class SynthAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMusicPlaying = false;
    this.isMuted = false;
    this.musicInterval = null;
    this.noteIndex = 0;
  }

  _initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Reproducir un tono sintetizado (onda senoidal / triangular con envolvente ADSR)
  playTone(freq = 440, type = 'sine', duration = 0.2, gainVal = 0.1) {
    if (this.isMuted) return;
    this._initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  // Efecto: Tintineo de monedas / Recaudación
  playCoinClink() {
    this.playTone(880, 'triangle', 0.1, 0.08);
    setTimeout(() => this.playTone(1320, 'triangle', 0.15, 0.08), 60);
  }

  // Efecto: Teletipo / Noticia
  playTeletypeClick() {
    this.playTone(1800, 'square', 0.03, 0.02);
  }

  // Efecto: Sirena de Crisis / Alerta
  playCrisisSiren() {
    this.playTone(220, 'sawtooth', 0.4, 0.12);
    setTimeout(() => this.playTone(160, 'sawtooth', 0.4, 0.12), 200);
  }

  // Efecto: Fanfarria de Victoria / Hito
  playVictoryChord() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.6, 0.09), idx * 100);
    });
  }

  // Música Ambiental Procedural (Arpegiador Synthwave sutil)
  toggleAmbientMusic(enable) {
    if (enable) {
      this._initContext();
      this.isMusicPlaying = true;
      const notes = [
        130.81, 164.81, 196.00, 246.94, // C3, E3, G3, B3
        146.83, 174.61, 220.00, 261.63, // D3, F3, A3, C4
        110.00, 130.81, 164.81, 196.00, // A2, C3, E3, G3
        123.47, 146.83, 174.61, 220.00  // B2, D3, F3, A3
      ];

      if (!this.musicInterval) {
        this.musicInterval = setInterval(() => {
          if (!this.isMusicPlaying || this.isMuted) return;
          const freq = notes[this.noteIndex % notes.length];
          this.playTone(freq, 'sine', 0.45, 0.025);
          this.noteIndex++;
        }, 320);
      }
    } else {
      this.isMusicPlaying = false;
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.toggleAmbientMusic(false);
    }
  }
}

export const synthAudioInstance = new SynthAudioEngine();
