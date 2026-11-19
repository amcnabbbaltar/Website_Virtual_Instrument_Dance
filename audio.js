// Dance Cards — sound engine (Web Audio, no internet, no samples needed).
// Instruments: synth pad, piano, bells, drums. Reverb amount and brightness are set from movement.

export const CHORDS = [
  // Ordered from LOW hand to HIGH hand. Notes are MIDI numbers in C (transposed by "key").
  { name: 'Am7',   notes: [45, 57, 60, 64, 67] },
  { name: 'Fmaj7', notes: [41, 57, 60, 64, 65] },
  { name: 'Cmaj7', notes: [48, 55, 59, 64, 67] },
  { name: 'G6',    notes: [43, 55, 59, 62, 64] },
  { name: 'Em7',   notes: [40, 55, 59, 62, 67] },
  { name: 'Dm9',   notes: [38, 57, 60, 64, 65] },
];
const KEY_NAMES = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];

export const INSTRUMENTS = [
  { id: 'synth', label: 'Synth',  icon: '🌊', gm: 90 },  // GM program (1-based) used by the Max patch
  { id: 'piano', label: 'Piano',  icon: '🎹', gm: 1 },
  { id: 'bells', label: 'Bells',  icon: '🔔', gm: 15 },
  { id: 'drums', label: 'Drums',  icon: '🥁', gm: 1 },
];
export const DRUM_NOTES = { kick: 36, snare: 38, hat: 42, crash: 49, tom: 45 };

const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

export function chordLabel(i, transpose) {
  const c = CHORDS[i].name;
  const root = { A: 9, F: 5, C: 0, G: 7, E: 4, D: 2 }[c[0]];
  return KEY_NAMES[(root + transpose + 12) % 12] + c.slice(1);
}

export class Engine {
  constructor() {
    this.ctx = null;
    this.instrument = 'synth';
    this.transpose = 0;
    this.padVoices = [];
    this.reverb = 0.3;
    this.brightness = 0.5;
    this.muted = false;
    this.grooveEnergy = 0;
    this.ambientOn = false;
  }

  async init() {
    if (this.ctx) { await this.ctx.resume(); return; }
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.out = ctx.createDynamicsCompressor();
    this.out.threshold.value = -14; this.out.ratio.value = 4;
    this.master = ctx.createGain(); this.master.gain.value = 0.8;
    this.out.connect(this.master).connect(ctx.destination);

    this.bus = ctx.createGain();           // instruments go here
    this.dry = ctx.createGain();
    this.wet = ctx.createGain();
    this.verb = ctx.createConvolver();
    this.verb.buffer = this._impulse(4.0, 2.6);
    this.bus.connect(this.dry).connect(this.out);
    this.bus.connect(this.verb).connect(this.wet).connect(this.out);
    this.setReverb(this.reverb);

    this.noise = this._noiseBuffer();

    // Ambient soundscape: bypasses the reverb, has its own volume.
    this.ambientGain = ctx.createGain(); this.ambientGain.gain.value = 0;
    this.ambientGain.connect(this.master);
    this.ambientEl = new Audio();
    this.ambientEl.loop = true;
    this.ambientEl.src = 'ambient/ambient.mp3';
    this.ambientEl.addEventListener('error', () => { this.ambientMissing = true; });
    ctx.createMediaElementSource(this.ambientEl).connect(this.ambientGain);
    this.ambientVolume = 0.6;

    this._grooveLoop();
  }

  // ---------- controls ----------
  setInstrument(id) {
    if (id !== this.instrument) this.releasePad();
    this.instrument = id;
  }
  setReverb(x) {
    this.reverb = Math.max(0, Math.min(1, x));
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.wet.gain.setTargetAtTime(this.reverb * 1.4, t, 0.15);
    this.dry.gain.setTargetAtTime(1 - this.reverb * 0.55, t, 0.15);
  }
  setBrightness(x) {
    this.brightness = Math.max(0, Math.min(1, x));
    const f = 400 + this.brightness * 5200;
    for (const v of this.padVoices) v.filter.frequency.setTargetAtTime(f, this.ctx.currentTime, 0.1);
  }
  setMuted(m) {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.05);
  }
  setGrooveEnergy(e) { this.grooveEnergy = e; }

  loadAmbientFile(file) {
    if (!this.ambientEl) return;
    this.ambientMissing = false;
    this.ambientEl.src = URL.createObjectURL(file);
    if (this.ambientOn) this.ambientEl.play().catch(() => {});
  }
  setAmbient(on) {
    this.ambientOn = on;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (on) {
      this.ambientEl.play().catch(() => { this.ambientMissing = true; });
      this.ambientGain.gain.setTargetAtTime(this.ambientVolume, t, 0.8);   // slow fade in
    } else {
      this.ambientGain.gain.setTargetAtTime(0, t, 0.6);
      setTimeout(() => { if (!this.ambientOn) this.ambientEl.pause(); }, 3000);
    }
  }
  setAmbientVolume(v) {
    this.ambientVolume = v;
    if (this.ambientOn && this.ctx) this.ambientGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.2);
  }

  // ---------- playing ----------
  chordNotes(i) { return CHORDS[i].notes.map(n => n + this.transpose); }

  playChord(i, velocity = 0.8) {
    if (!this.ctx || this.muted) return;
    const notes = this.chordNotes(i);
    if (this.instrument === 'synth') this._pad(notes, velocity);
    else if (this.instrument === 'piano') this._piano(notes, velocity);
    else if (this.instrument === 'bells') this._bells(notes, velocity);
    else if (this.instrument === 'drums') this.drum(['kick', 'kick', 'snare', 'tom', 'hat', 'crash'][i], velocity);
  }

  releasePad() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const v of this.padVoices) {
      v.gain.gain.cancelScheduledValues(t);
      v.gain.gain.setValueAtTime(v.gain.gain.value, t);
      v.gain.gain.setTargetAtTime(0, t, 0.9);
      v.oscs.forEach(o => o.stop(t + 6));
    }
    this.padVoices = [];
  }

  _pad(notes, vel) {
    this.releasePad();
    const ctx = this.ctx, t = ctx.currentTime;
    for (const n of notes) {
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.Q.value = 0.7;
      filter.frequency.value = 400 + this.brightness * 5200;
      const oscs = [-7, 7].map(det => {
        const o = ctx.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = mtof(n); o.detune.value = det;
        o.connect(filter); o.start(t); return o;
      });
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = mtof(n);
      sub.connect(filter); sub.start(t); oscs.push(sub);
      filter.connect(gain).connect(this.bus);
      const level = (n < 50 ? 0.09 : 0.055) * vel;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(level, t + 0.35);
      this.padVoices.push({ gain, filter, oscs });
    }
  }

  _piano(notes, vel) {
    const ctx = this.ctx;
    notes.forEach((n, k) => {
      const t = ctx.currentTime + k * 0.018;           // tiny strum
      const decay = Math.max(0.8, 4.0 - (n - 40) * 0.06);
      const g = ctx.createGain();
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1200 + vel * 5000, t);
      lp.frequency.exponentialRampToValueAtTime(600, t + decay);
      const partials = [[1, 1, 'triangle'], [2, 0.35, 'sine'], [3, 0.12, 'sine'], [4.01, 0.06, 'sine']];
      for (const [mult, amp, type] of partials) {
        const o = ctx.createOscillator(); o.type = type;
        o.frequency.value = mtof(n) * mult;
        const pg = ctx.createGain(); pg.gain.value = amp;
        o.connect(pg).connect(lp); o.start(t); o.stop(t + decay + 0.2);
      }
      lp.connect(g).connect(this.bus);
      const level = 0.16 * vel * (n < 50 ? 1.1 : 0.8);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level, t + 0.006);
      g.gain.exponentialRampToValueAtTime(level * 0.35, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    });
  }

  _bells(notes, vel) {
    const ctx = this.ctx;
    notes.slice(1).forEach((n0, k) => {
      const n = n0 + 12, t = ctx.currentTime + k * 0.06;
      const car = ctx.createOscillator(), mod = ctx.createOscillator();
      const modGain = ctx.createGain(), g = ctx.createGain();
      car.frequency.value = mtof(n); mod.frequency.value = mtof(n) * 3.5;
      modGain.gain.setValueAtTime(mtof(n) * 2.5, t);
      modGain.gain.exponentialRampToValueAtTime(1, t + 2.5);
      mod.connect(modGain).connect(car.frequency);
      car.connect(g).connect(this.bus);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.09 * vel, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
      car.start(t); mod.start(t); car.stop(t + 3.6); mod.stop(t + 3.6);
    });
  }

  drum(type, vel = 0.8) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const g = ctx.createGain(); g.connect(this.bus);
    if (type === 'kick' || type === 'tom') {
      const o = ctx.createOscillator();
      const f0 = type === 'kick' ? 150 : 220, f1 = type === 'kick' ? 42 : 90;
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + 0.12);
      g.gain.setValueAtTime(0.9 * vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + (type === 'kick' ? 0.45 : 0.35));
      o.connect(g); o.start(t); o.stop(t + 0.5);
    } else {
      const src = ctx.createBufferSource(); src.buffer = this.noise;
      const f = ctx.createBiquadFilter();
      let dur;
      if (type === 'snare') {
        f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.8; dur = 0.22;
        const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 185;
        const og = ctx.createGain(); og.gain.setValueAtTime(0.4 * vel, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.connect(og).connect(this.bus); o.start(t); o.stop(t + 0.15);
      } else if (type === 'hat') { f.type = 'highpass'; f.frequency.value = 7000; dur = 0.06; }
      else { f.type = 'highpass'; f.frequency.value = 3500; dur = 1.6; }   // crash
      g.gain.setValueAtTime((type === 'hat' ? 0.35 : 0.6) * vel, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(f).connect(g); src.start(t); src.stop(t + dur + 0.05);
    }
    this.onDrum && this.onDrum(type, vel);
  }

  // Soft hi-hat groove that only appears (and gets busier) when the dancer moves a lot — drums only.
  _grooveLoop() {
    let step = 0;
    const tick = () => {
      if (this.instrument === 'drums' && this.grooveEnergy > 0.25 && !this.muted) {
        const e = this.grooveEnergy;
        if (step % 2 === 0 || e > 0.6) this.drum('hat', 0.25 + e * 0.4);
        if (e > 0.75 && step % 8 === 4) this.drum('snare', 0.5);
      }
      step++;
      setTimeout(tick, 60000 / 100 / 2);   // 8th notes at 100 BPM
    };
    tick();
  }

  // ---------- helpers ----------
  _impulse(seconds, decay) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  _noiseBuffer() {
    const ctx = this.ctx, buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
}
