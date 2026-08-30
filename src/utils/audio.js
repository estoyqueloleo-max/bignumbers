let audioCtx = null;
let isAudioMuted = false;

export const setAudioMuted = (muted) => {
  isAudioMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('bigNumbers_audioMuted', muted ? 'true' : 'false');
  }
};

export const getAudioMuted = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('bigNumbers_audioMuted');
    if (saved !== null) {
      isAudioMuted = saved === 'true';
    }
  }
  return isAudioMuted;
};

const getAudioContext = () => {
  if (typeof window !== 'undefined' && !audioCtx) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if (window.AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  return audioCtx;
};

const playTone = (freq, type, duration, vol, detune = 0) => {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (detune) {
    osc.detune.setValueAtTime(detune, ctx.currentTime);
  }
  
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export const playCoinSound = () => {
  playTone(880, 'sine', 0.1, 0.05); 
  setTimeout(() => playTone(1100, 'sine', 0.2, 0.05), 50);
};

export const playAlertSound = () => {
  playTone(320, 'triangle', 0.25, 0.1);
  setTimeout(() => playTone(240, 'triangle', 0.35, 0.1), 250);
};

export const playCrisisAlertSound = () => {
  playTone(400, 'sawtooth', 0.2, 0.08);
  setTimeout(() => playTone(300, 'sawtooth', 0.3, 0.08), 150);
  setTimeout(() => playTone(200, 'sawtooth', 0.4, 0.1), 300);
};

export const playBondSound = () => {
  playTone(523.25, 'sine', 0.15, 0.06); // C5
  setTimeout(() => playTone(659.25, 'sine', 0.15, 0.06), 80); // E5
  setTimeout(() => playTone(783.99, 'sine', 0.25, 0.06), 160); // G5
};

export const playThudSound = () => {
  playTone(75, 'sawtooth', 0.45, 0.18);
  playTone(78, 'square', 0.45, 0.1, 10);
};

export const playWinSound = () => {
  playTone(440, 'sine', 0.2, 0.1);
  setTimeout(() => playTone(554, 'sine', 0.2, 0.1), 180);
  setTimeout(() => playTone(659, 'sine', 0.2, 0.1), 360);
  setTimeout(() => playTone(880, 'sine', 0.5, 0.12), 540);
};
