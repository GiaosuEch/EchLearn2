export const soundService = {
  audioCtx: null as AudioContext | null,
  enabled: true,

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  },

  setEnabled(val: boolean) {
    this.enabled = val;
  },

  playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    if (!this.enabled) return;
    this.init();
    const ctx = this.audioCtx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  },

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    this.playTone(440, 'sine', 0.1, 0.1); // A4
    setTimeout(() => this.playTone(554.37, 'sine', 0.15, 0.1), 100); // C#5
    setTimeout(() => this.playTone(659.25, 'sine', 0.3, 0.1), 200); // E5
  },

  playWrong() {
    if (!this.enabled) return;
    this.init();
    this.playTone(300, 'sawtooth', 0.15, 0.1);
    setTimeout(() => this.playTone(250, 'sawtooth', 0.3, 0.1), 150);
  },

  playLessonComplete() {
    if (!this.enabled) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.4, 0.1), i * 150);
    });
  },

  playLevelUp() {
    if (!this.enabled) return;
    this.init();
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.3, 0.05), i * 100);
    });
    setTimeout(() => this.playTone(1108.73, 'square', 0.6, 0.05), notes.length * 100);
  },

  playChestOpen() {
    if (!this.enabled) return;
    this.init();
    // Shimmer effect
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.playTone(800 + Math.random() * 400, 'sine', 0.1, 0.05);
      }, i * 30);
    }
    setTimeout(() => {
      this.playTone(1200, 'sine', 0.5, 0.1);
    }, 300);
  },
  
  playCoin() {
    if (!this.enabled) return;
    this.init();
    this.playTone(987.77, 'sine', 0.1, 0.05); // B5
    setTimeout(() => this.playTone(1318.51, 'sine', 0.3, 0.05), 100); // E6
  }
};
