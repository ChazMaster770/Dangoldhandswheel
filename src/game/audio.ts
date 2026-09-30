let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

try {
  muted = localStorage.getItem("poketrip.muted") === "1";
} catch {
  /* ignore */
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem("poketrip.muted", muted ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (master) master.gain.value = muted ? 0 : 0.55;
  return muted;
}

export function initAudio() {
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.55;
  master.connect(ctx.destination);
}

function ready(): AudioContext | null {
  if (!ctx) return null;
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  freq: number;
  to?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  attack?: number;
}

function tone({
  freq,
  to,
  dur = 0.12,
  type = "square",
  gain = 0.18,
  delay = 0,
  attack = 0.005,
}: ToneOpts) {
  const c = ready();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, to), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur = 0.25, gain = 0.12, filterFreq = 1200, delay = 0) {
  const c = ready();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + delay;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = filterFreq;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t0);
}

export const sfx = {
  tick(speed: number) {
    tone({
      freq: 620 + Math.min(360, speed * 0.7),
      dur: 0.045,
      type: "square",
      gain: 0.055,
    });
  },
  lock() {
    tone({ freq: 180, to: 90, dur: 0.18, type: "sawtooth", gain: 0.16 });
    noise(0.12, 0.08, 700);
  },
  catch(combo: number) {
    const base = 523.25 * Math.pow(1.0595, Math.min(combo, 10) * 2);
    tone({ freq: base, dur: 0.1, type: "square", gain: 0.14 });
    tone({ freq: base * 1.26, dur: 0.12, type: "square", gain: 0.13, delay: 0.08 });
    tone({ freq: base * 1.5, dur: 0.2, type: "triangle", gain: 0.16, delay: 0.16 });
  },
  perfect() {
    [0, 4, 7, 12, 16].forEach((s, i) =>
      tone({
        freq: 523.25 * Math.pow(1.0595, s),
        dur: 0.28,
        type: "triangle",
        gain: 0.14,
        delay: i * 0.055,
      }),
    );
  },
  legendary() {
    [0, 7, 12, 19, 24].forEach((s, i) =>
      tone({
        freq: 392 * Math.pow(1.0595, s),
        dur: 0.5,
        type: "square",
        gain: 0.12,
        delay: i * 0.075,
      }),
    );
    noise(0.6, 0.06, 3000, 0.1);
  },
  fail() {
    tone({ freq: 300, to: 70, dur: 0.42, type: "sawtooth", gain: 0.16 });
    tone({ freq: 150, to: 50, dur: 0.5, type: "square", gain: 0.1, delay: 0.05 });
  },
  flee() {
    tone({ freq: 420, to: 200, dur: 0.22, type: "triangle", gain: 0.12 });
  },
  levelUp() {
    [0, 5, 9, 12].forEach((s, i) =>
      tone({
        freq: 440 * Math.pow(1.0595, s),
        dur: 0.22,
        type: "square",
        gain: 0.13,
        delay: i * 0.09,
      }),
    );
  },
  gameOver() {
    [0, -3, -7, -12].forEach((s, i) =>
      tone({
        freq: 440 * Math.pow(1.0595, s),
        dur: 0.5,
        type: "triangle",
        gain: 0.15,
        delay: i * 0.19,
      }),
    );
  },
  ui() {
    tone({ freq: 880, dur: 0.06, type: "square", gain: 0.09 });
  },
  whoosh() {
    noise(0.35, 0.1, 900);
  },
  timeWarning() {
    tone({ freq: 1100, dur: 0.08, type: "square", gain: 0.09 });
  },
};
