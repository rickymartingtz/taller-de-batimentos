import React, { useState, useEffect, useRef, useCallback } from 'react';

// ════════════════════════════════════════════════════════════════════
// DATOS Y UTILIDADES
// ════════════════════════════════════════════════════════════════════

const INTERVALS = [
  { id: 'm2',  name: 'Segunda menor',     ratio: '16:15', n: 16, m: 15, etCents: 100,  justCents: 111.731 },
  { id: 'M2',  name: 'Segunda mayor',     ratio: '9:8',   n: 9,  m: 8,  etCents: 200,  justCents: 203.910 },
  { id: 'm3',  name: 'Tercera menor',     ratio: '6:5',   n: 6,  m: 5,  etCents: 300,  justCents: 315.641 },
  { id: 'M3',  name: 'Tercera mayor',     ratio: '5:4',   n: 5,  m: 4,  etCents: 400,  justCents: 386.314 },
  { id: 'P4',  name: 'Cuarta justa',      ratio: '4:3',   n: 4,  m: 3,  etCents: 500,  justCents: 498.045 },
  { id: 'TT',  name: 'Tritono septimal',  ratio: '7:5',   n: 7,  m: 5,  etCents: 600,  justCents: 582.512 },
  { id: 'A4',  name: 'Cuarta aumentada',  ratio: '45:32', n: 45, m: 32, etCents: 600,  justCents: 590.224 },
  { id: 'P5',  name: 'Quinta justa',      ratio: '3:2',   n: 3,  m: 2,  etCents: 700,  justCents: 701.955 },
  { id: 'm6',  name: 'Sexta menor',       ratio: '8:5',   n: 8,  m: 5,  etCents: 800,  justCents: 813.686 },
  { id: 'M6',  name: 'Sexta mayor',       ratio: '5:3',   n: 5,  m: 3,  etCents: 900,  justCents: 884.359 },
  { id: 'h7',  name: 'Séptima armónica',  ratio: '7:4',   n: 7,  m: 4,  etCents: 1000, justCents: 968.826 },
  { id: 'm7',  name: 'Séptima menor',     ratio: '9:5',   n: 9,  m: 5,  etCents: 1000, justCents: 1017.596 },
  { id: 'M7',  name: 'Séptima mayor',     ratio: '15:8',  n: 15, m: 8,  etCents: 1100, justCents: 1088.269 },
  { id: 'P8',  name: 'Octava',            ratio: '2:1',   n: 2,  m: 1,  etCents: 1200, justCents: 1200.000 },
];

const WAVEFORMS = {
  sine:         [0, 1],
  semisine:     [0, 0.50, 0.21, 0, 0.042, 0, 0.018, 0, 0.010, 0, 0.006, 0, 0.004],
  triangle:     [0, 1, 0, -1/9, 0, 1/25, 0, -1/49, 0, 1/81, 0, -1/121, 0, 1/169],
  square:       [0, 1, 0, 1/3, 0, 1/5, 0, 1/7, 0, 1/9, 0, 1/11, 0, 1/13],
  sawtooth:     [0, 1, 1/2, 1/3, 1/4, 1/5, 1/6, 1/7, 1/8, 1/9, 1/10, 1/11, 1/12, 1/13],
  octaver:      [0, 1, 0.55, 0, 0.38, 0, 0, 0, 0.24, 0, 0, 0, 0, 0, 0, 0, 0.15],
  brightness:   [0, 1, 0.78, 0.68, 0.62, 0.56, 0.50, 0.46, 0.42, 0.38, 0.34, 0.30, 0.26, 0.23, 0.20, 0.18, 0.16],
  harmonicBell: [0, 1, 0.40, 0.65, 0.30, 0.55, 0.25, 0.45, 0.20, 0.35, 0.15, 0.27, 0.10, 0.22, 0.08, 0.18, 0.06],
  warm:         [0, 1, 0.45, 0.18, 0.07, 0.025, 0.009, 0.003, 0.001],
};

const TIMBRES = [
  { id: 'sine',         name: 'Senoidal',         desc: 'Tono puro sin armónicos. La afinación se vuelve invisible al oído.',                voiceGain: 0.24 },
  { id: 'semisine',     name: 'Semisenoidal',     desc: 'Senoidal con armónicos pares suaves. Ideal para auditar afinaciones sin saturar.', voiceGain: 0.22 },
  { id: 'triangle',     name: 'Triangular',       desc: 'Impares con caída rápida (flauta). Batimientos sutiles.',                            voiceGain: 0.20 },
  { id: 'square',       name: 'Cuadrada',         desc: 'Solo armónicos impares (clarinete). Algunos intervalos no baten en este timbre.',   voiceGain: 0.11 },
  { id: 'sawtooth',     name: 'Sierra',           desc: 'Todos los armónicos con caída 1/n. Batimientos nítidos en cualquier intervalo.',    voiceGain: 0.15 },
  { id: 'octaver',      name: 'Octavador',        desc: 'Énfasis exclusivo en octavas. Sonido cristalino y abierto.',                         voiceGain: 0.17 },
  { id: 'brightness',   name: 'Brillante',        desc: 'Espectro pleno con armónicos agudos sostenidos. Intenso y luminoso.',                voiceGain: 0.09 },
  { id: 'harmonicBell', name: 'Campana armónica', desc: 'Patrón armónico tipo campana. Color metálico y cantante.',                           voiceGain: 0.11 },
  { id: 'warm',         name: 'Cálida',           desc: 'Pocos armónicos con caída suave. Cómoda para escucha prolongada.',                   voiceGain: 0.21 },
];

const WHITE_KEYS = [
  { name: 'C', display: 'C', semis: -9 },
  { name: 'D', display: 'D', semis: -7 },
  { name: 'E', display: 'E', semis: -5 },
  { name: 'F', display: 'F', semis: -4 },
  { name: 'G', display: 'G', semis: -2 },
  { name: 'A', display: 'A', semis: 0 },
  { name: 'B', display: 'B', semis: 2 },
];

const BLACK_KEYS = [
  { name: 'C#', display: 'C♯', semis: -8, leftPct: (1 / 7) * 100 },
  { name: 'D#', display: 'D♯', semis: -6, leftPct: (2 / 7) * 100 },
  { name: 'F#', display: 'F♯', semis: -3, leftPct: (4 / 7) * 100 },
  { name: 'G#', display: 'G♯', semis: -1, leftPct: (5 / 7) * 100 },
  { name: 'A#', display: 'A♯', semis: 1,  leftPct: (6 / 7) * 100 },
];

const ALL_KEYS = [...WHITE_KEYS, ...BLACK_KEYS];
const SEMITONE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

const noteToSemis = (name) => ALL_KEYS.find(k => k.name === name).semis;
const noteFreq = (name, octave) => 440 * Math.pow(2, (noteToSemis(name) + 12 * (octave - 4)) / 12);
const midiFromNoteOct = (name, octave) => 69 + noteToSemis(name) + 12 * (octave - 4);
const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// Info de armónicos hasta 24
const HARMONIC_INFO = (() => {
  const info = [];
  for (let n = 1; n <= 32; n++) {
    const centsFromFund = 1200 * Math.log2(n);
    const semisRaw = centsFromFund / 100;
    const semisRounded = Math.round(semisRaw);
    info.push({
      n,
      centsFromFund,
      semisFromFund: semisRounded,
      centsFromET: (semisRaw - semisRounded) * 100,
    });
  }
  return info;
})();

const harmonicMidi = (n, fundamentalMidi) => fundamentalMidi + HARMONIC_INFO[n - 1].semisFromFund;

const midiToNoteName = (midi) => {
  const idx = ((midi % 12) + 12) % 12;
  return { name: SEMITONE_NAMES[idx], octave: Math.floor(midi / 12) - 1, idx };
};

// Posición en pentagrama. C4 = 0. D4 = 1. E4 = 2. F4 = 3. G4 = 4. A4 = 5. B4 = 6. C5 = 7.
const midiToStaffInfo = (midi) => {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const diatonicStep = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][pc];
  const accidental = ['', '♯', '', '♯', '', '', '♯', '', '♯', '', '♯', ''][pc];
  const letter = ['C', 'D', 'E', 'F', 'G', 'A', 'B'][diatonicStep];
  return { steps: diatonicStep + (octave - 4) * 7, accidental, letter, octave };
};

// Aplicar octavación cuando la nota excede la 2a línea adicional.
// 2 líneas adicionales encima del pentagrama de sol = pos 14 (C6).
// 2 líneas adicionales debajo del pentagrama de fa = pos -14 (C2).
const applyOttava = (steps) => {
  let shifted = steps;
  let octaves = 0;
  while (shifted > 14) { shifted -= 7; octaves++; }
  while (shifted < -14) { shifted += 7; octaves--; }
  let label = null;
  if (octaves === 1) label = '8va';
  else if (octaves === 2) label = '15ma';
  else if (octaves === 3) label = '22ma';
  else if (octaves === 4) label = '29ma';
  else if (octaves === -1) label = '8vb';
  else if (octaves === -2) label = '15mb';
  else if (octaves === -3) label = '22mb';
  return { displayPos: shifted, ottava: label };
};

// Reverb sintético
const createReverbIR = (ctx, duration = 1.2, decayShape = 2.5) => {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const ir = ctx.createBuffer(2, length, rate);
  const preDelay = Math.floor(rate * 0.012);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      if (i < preDelay) { data[i] = 0; continue; }
      const t = (i - preDelay) / (length - preDelay);
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decayShape) * 0.55;
    }
  }
  return ir;
};

// Detección de tono YIN
const detectPitchYIN = (buffer, sampleRate, threshold = 0.15) => {
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.008) return null;

  const halfLen = Math.floor(buffer.length / 2);
  const yinBuffer = new Float32Array(halfLen);

  for (let tau = 0; tau < halfLen; tau++) {
    let sum = 0;
    for (let i = 0; i < halfLen; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum;
  }
  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < halfLen; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] = yinBuffer[tau] * tau / runningSum;
  }

  let tauEstimate = -1;
  for (let i = 2; i < halfLen; i++) {
    if (yinBuffer[i] < threshold) {
      while (i + 1 < halfLen && yinBuffer[i + 1] < yinBuffer[i]) i++;
      tauEstimate = i;
      break;
    }
  }
  if (tauEstimate === -1) return null;

  let refined = tauEstimate;
  if (tauEstimate > 0 && tauEstimate < halfLen - 1) {
    const y0 = yinBuffer[tauEstimate - 1];
    const y1 = yinBuffer[tauEstimate];
    const y2 = yinBuffer[tauEstimate + 1];
    const denom = (y0 + y2 - 2 * y1);
    if (denom !== 0) refined = tauEstimate + (y0 - y2) / (2 * denom);
  }
  return sampleRate / refined;
};

const freqToNoteET = (freq) => {
  if (!freq || freq <= 0) return null;
  const midi = 69 + 12 * Math.log2(freq / 440);
  const midiRounded = Math.round(midi);
  const cents = 100 * (midi - midiRounded);
  return { name: SEMITONE_NAMES[((midiRounded % 12) + 12) % 12], octave: Math.floor(midiRounded / 12) - 1, cents, midi: midiRounded };
};

// Detección de armónico tolerante a octavas.
const freqToHarmonicAnyOctave = (freq, fundamentalFreq, maxN = 16) => {
  if (!freq || !fundamentalFreq) return null;
  let bestN = 1;
  let bestCents = Infinity;
  let bestHarmonicFreq = fundamentalFreq;
  for (let n = 1; n <= maxN; n++) {
    let harmonicFreq = fundamentalFreq * n;
    while (harmonicFreq > freq * Math.SQRT2) harmonicFreq /= 2;
    while (harmonicFreq < freq / Math.SQRT2) harmonicFreq *= 2;
    const cents = 1200 * Math.log2(freq / harmonicFreq);
    if (Math.abs(cents) < Math.abs(bestCents)) {
      bestCents = cents; bestN = n; bestHarmonicFreq = harmonicFreq;
    }
  }
  return { n: bestN, cents: bestCents, harmonicFreq: bestHarmonicFreq };
};

// Detección de intervalo entre dos frecuencias
const findInterval = (f1, f2) => {
  if (!f1 || !f2) return null;
  const lo = Math.min(f1, f2);
  const hi = Math.max(f1, f2);
  const totalCents = 1200 * Math.log2(hi / lo);
  let reducedCents = totalCents;
  let octavesAbove = 0;
  while (reducedCents >= 1200) { reducedCents -= 1200; octavesAbove++; }

  if (reducedCents < 25) return { name: 'unísono', cents: reducedCents, octaves: octavesAbove };
  if (reducedCents > 1175) return { name: 'octava', cents: reducedCents - 1200, octaves: octavesAbove + 1 };

  let bestET = null, bestETDist = Infinity;
  let bestJust = null, bestJustDist = Infinity;
  INTERVALS.forEach(iv => {
    const etDist = Math.abs(reducedCents - iv.etCents);
    const justDist = Math.abs(reducedCents - iv.justCents);
    if (etDist < bestETDist) { bestETDist = etDist; bestET = iv; }
    if (justDist < bestJustDist) { bestJustDist = justDist; bestJust = iv; }
  });
  if (bestETDist < bestJustDist) {
    return { name: bestET.name, ratio: bestET.ratio, cents: reducedCents - bestET.etCents, octaves: octavesAbove, kind: 'ET' };
  }
  return { name: bestJust.name, ratio: bestJust.ratio, cents: reducedCents - bestJust.justCents, octaves: octavesAbove, kind: 'justa' };
};

const SLIDER_RANGE = 60;
const ENVELOPE_BUFFER_LEN = 240;
const MIN_OCT = 2;
const MAX_OCT = 5;
const MAX_HARMONIC = 24;
const TEMPERATE_NOTE_COUNT = 24;
const PITCH_HISTORY_LEN = 200;
const TUNER_RANGE_CENTS = 50;
const IN_TUNE_THRESHOLD = 8;
const PITCH_SMOOTH_ALPHA = 0.35;

const T = {
  cream:    '#fdfaf0',
  paper:    '#f4eedd',
  ink:      '#1a3d2e',
  inkSoft:  '#2d4f3e',
  muted:    '#7a6e5a',
  rule:     '#c9bda4',
  lime:     '#b8d465',
  limeDeep: '#7a9a3e',
  warn:     '#a8593e',
};

// ════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════════

export default function TallerBatimientos() {
  const [showTheory, setShowTheory] = useState(false);

  const [intervalIdx, setIntervalIdx] = useState(3);
  const [noteName, setNoteName] = useState('A');
  const [octave, setOctave] = useState(3);
  const [centsOffset, setCentsOffset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [previewVolume, setPreviewVolume] = useState(0.5);
  const [timbre, setTimbre] = useState('semisine');
  const [voiceMode, setVoiceMode] = useState('both');

  const [currentAB, setCurrentAB] = useState(null);
  const [autoAB, setAutoAB] = useState(false);
  const [autoIntervalMs, setAutoIntervalMs] = useState(2000);

  const [activePreview, setActivePreview] = useState(null);
  const [micEnabled, setMicEnabled] = useState(false);
  const [detectedFreq, setDetectedFreq] = useState(null);

  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const beatBandpassRef = useRef(null);
  const beatAnalyserRef = useRef(null);
  const droneVoiceRef = useRef(null);
  const varVoiceRef = useRef(null);
  const convolverRef = useRef(null);
  const wetGainRef = useRef(null);
  const micStreamRef = useRef(null);
  const micAnalyserRef = useRef(null);
  const previewVoiceRef = useRef(null);
  const previewGainNodeRef = useRef(null);
  const smoothedFreqRef = useRef(null);
  const pitchHistoryRef = useRef(new Float32Array(PITCH_HISTORY_LEN).fill(NaN));
  const pitchHistoryIdxRef = useRef(0);

  const canvasRef = useRef(null);
  const envelopeBufRef = useRef(new Float32Array(ENVELOPE_BUFFER_LEN));
  const envelopeIdxRef = useRef(0);
  const rafRef = useRef(null);

  const interval = INTERVALS[intervalIdx];
  const droneFreq = noteFreq(noteName, octave);
  const droneMidi = midiFromNoteOct(noteName, octave);
  const justOffset = interval.justCents - interval.etCents;
  const variableCents = interval.etCents + centsOffset;
  const variableFreq = droneFreq * Math.pow(2, variableCents / 1200);
  const distanceToJust = centsOffset - justOffset;
  const isLocked = Math.abs(distanceToJust) < 0.5;
  const isNearLock = Math.abs(distanceToJust) < 2;
  const beatCenterFreq = interval.n * droneFreq;
  const computedBeatRate = Math.abs(interval.n * droneFreq - interval.m * variableFreq);
  const adaptiveLpFreq = Math.max(7000, Math.min(droneFreq * 50, 13000));
  const currentTimbre = TIMBRES.find(t => t.id === timbre);

  // ──────────────────────────────────────────────────────────────────
  // Voces principales
  // ──────────────────────────────────────────────────────────────────

  const createVoiceFor = useCallback((freq) => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    const bandpass = beatBandpassRef.current;
    const convolver = convolverRef.current;
    if (!ctx || !master || !bandpass) return null;

    const cfg = TIMBRES.find(t => t.id === timbre);
    const voiceGain = ctx.createGain();
    voiceGain.gain.value = 0;
    voiceGain.gain.setTargetAtTime(cfg.voiceGain, ctx.currentTime, 0.025);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = adaptiveLpFreq;
    filter.Q.value = 0.5;
    filter.connect(voiceGain);
    voiceGain.connect(master);
    voiceGain.connect(bandpass);
    if (convolver) voiceGain.connect(convolver);

    const harmonics = WAVEFORMS[timbre] || WAVEFORMS.semisine;
    const imag = new Float32Array(harmonics);
    const real = new Float32Array(harmonics.length);
    const wave = ctx.createPeriodicWave(real, imag);

    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = freq;
    osc.connect(filter);
    osc.start();
    const oscillators = [{ osc, mult: 1 }];

    return {
      oscillators, filter, gain: voiceGain,
      setFreq: (newFreq) => oscillators.forEach(o => o.osc.frequency.setTargetAtTime(newFreq * o.mult, ctx.currentTime, 0.01)),
      stop: () => {
        const t = ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(t);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, t);
        voiceGain.gain.linearRampToValueAtTime(0, t + 0.06);
        oscillators.forEach(o => { try { o.osc.stop(t + 0.08); } catch (e) {} });
        setTimeout(() => { try { filter.disconnect(); voiceGain.disconnect(); } catch (e) {} }, 120);
      }
    };
  }, [timbre, adaptiveLpFreq]);

  const initAudio = useCallback(() => {
    if (ctxRef.current) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.value = 14;
    bandpass.frequency.value = beatCenterFreq;
    beatBandpassRef.current = bandpass;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0;
    bandpass.connect(analyser);
    beatAnalyserRef.current = analyser;

    const convolver = ctx.createConvolver();
    convolver.buffer = createReverbIR(ctx);
    convolverRef.current = convolver;
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.18;
    wetGainRef.current = wetGain;
    convolver.connect(wetGain);
    wetGain.connect(master);

    droneVoiceRef.current = createVoiceFor(droneFreq);
    varVoiceRef.current = createVoiceFor(variableFreq);
  }, [droneFreq, variableFreq, beatCenterFreq, createVoiceFor]);

  // ──────────────────────────────────────────────────────────────────
  // Preview sostenido (toggle)
  // ──────────────────────────────────────────────────────────────────

  const startSustainedPreview = useCallback((freq, type, id, midi) => {
    initAudio();
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    if (previewVoiceRef.current) {
      previewVoiceRef.current.stop();
      previewVoiceRef.current = null;
    }

    const cfg = TIMBRES.find(t => t.id === timbre);
    const previewGain = ctx.createGain();
    previewGain.gain.value = 0;
    previewGain.connect(ctx.destination);
    previewGain.connect(beatBandpassRef.current);
    if (convolverRef.current) previewGain.connect(convolverRef.current);
    previewGainNodeRef.current = previewGain;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = Math.max(7000, Math.min(freq * 50, 13000));
    filter.Q.value = 0.5;
    filter.connect(previewGain);

    const harmonics = WAVEFORMS[timbre] || WAVEFORMS.semisine;
    const wave = ctx.createPeriodicWave(new Float32Array(harmonics.length), new Float32Array(harmonics));
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = freq;
    osc.connect(filter);

    const now = ctx.currentTime;
    const target = cfg.voiceGain * previewVolume * 2.2;
    previewGain.gain.setValueAtTime(0, now);
    previewGain.gain.linearRampToValueAtTime(target, now + 0.03);
    osc.start(now);

    previewVoiceRef.current = {
      freq, type, id, midi,
      stop: () => {
        const t = ctx.currentTime;
        previewGain.gain.cancelScheduledValues(t);
        previewGain.gain.setValueAtTime(previewGain.gain.value, t);
        previewGain.gain.linearRampToValueAtTime(0, t + 0.08);
        try { osc.stop(t + 0.1); } catch (e) {}
        setTimeout(() => { try { filter.disconnect(); previewGain.disconnect(); } catch (e) {} }, 200);
        previewGainNodeRef.current = null;
      }
    };
    setActivePreview({ type, id, freq, midi });
  }, [timbre, previewVolume, initAudio]);

  const stopPreview = useCallback(() => {
    if (previewVoiceRef.current) {
      previewVoiceRef.current.stop();
      previewVoiceRef.current = null;
    }
    setActivePreview(null);
  }, []);

  const togglePreview = useCallback((freq, type, id, midi) => {
    if (activePreview && activePreview.type === type && activePreview.id === id) stopPreview();
    else startSustainedPreview(freq, type, id, midi);
  }, [activePreview, stopPreview, startSustainedPreview]);

  // Si cambia el timbre con preview activo, reiniciar
  useEffect(() => {
    if (activePreview) startSustainedPreview(activePreview.freq, activePreview.type, activePreview.id, activePreview.midi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timbre]);

  // Si cambia el volumen del preview con preview activo, ajustar
  useEffect(() => {
    const gain = previewGainNodeRef.current;
    const ctx = ctxRef.current;
    if (gain && ctx && activePreview) {
      const cfg = TIMBRES.find(t => t.id === timbre);
      const target = cfg.voiceGain * previewVolume * 2.2;
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.05);
    }
  }, [previewVolume, activePreview, timbre]);

  // ──────────────────────────────────────────────────────────────────
  // Micrófono
  // ──────────────────────────────────────────────────────────────────

  const enableMicrophone = async () => {
    initAudio();
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      micStreamRef.current = stream;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      micAnalyserRef.current = analyser;
      smoothedFreqRef.current = null;
      pitchHistoryRef.current.fill(NaN);
      pitchHistoryIdxRef.current = 0;
      setMicEnabled(true);
    } catch (err) {
      alert('No se pudo acceder al micrófono. Verifica que el navegador tenga permiso.\n\n' + err.message);
    }
  };

  const disableMicrophone = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    micAnalyserRef.current = null;
    smoothedFreqRef.current = null;
    setMicEnabled(false);
    setDetectedFreq(null);
  };

  useEffect(() => {
    if (!micEnabled || !micAnalyserRef.current) return;
    const buffer = new Float32Array(micAnalyserRef.current.fftSize);
    const id = setInterval(() => {
      const analyser = micAnalyserRef.current;
      const ctx = ctxRef.current;
      if (!analyser || !ctx) return;
      analyser.getFloatTimeDomainData(buffer);
      const rawFreq = detectPitchYIN(buffer, ctx.sampleRate);

      let freq = null;
      if (rawFreq) {
        if (smoothedFreqRef.current === null) smoothedFreqRef.current = rawFreq;
        else {
          const centsJump = Math.abs(1200 * Math.log2(rawFreq / smoothedFreqRef.current));
          if (centsJump > 50) smoothedFreqRef.current = rawFreq;
          else smoothedFreqRef.current = smoothedFreqRef.current * (1 - PITCH_SMOOTH_ALPHA) + rawFreq * PITCH_SMOOTH_ALPHA;
        }
        freq = smoothedFreqRef.current;
      } else smoothedFreqRef.current = null;

      pitchHistoryRef.current[pitchHistoryIdxRef.current] = freq || NaN;
      pitchHistoryIdxRef.current = (pitchHistoryIdxRef.current + 1) % PITCH_HISTORY_LEN;
      setDetectedFreq(freq);
    }, 50);
    return () => clearInterval(id);
  }, [micEnabled]);

  // ──────────────────────────────────────────────────────────────────
  // Visualizador (canvas inferior)
  // ──────────────────────────────────────────────────────────────────

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.fillStyle = T.paper;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(26,61,46,0.07)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) { const y = (h * i) / 4; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    for (let i = 1; i < 8; i++) { const x = (w * i) / 8; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }

    const buf = envelopeBufRef.current;
    const len = buf.length;
    const idx = envelopeIdxRef.current;
    let peak = 0;
    for (let i = 0; i < len; i++) if (buf[i] > peak) peak = buf[i];
    const scale = peak > 0.001 ? 0.85 / Math.max(peak, 0.05) : 1;

    const lockedNow = isLocked && isPlaying;
    const lineColor = lockedNow ? T.limeDeep : T.ink;

    ctx.strokeStyle = 'rgba(26,61,46,0.2)';
    ctx.beginPath(); ctx.moveTo(0, h - 2); ctx.lineTo(w, h - 2); ctx.stroke();

    ctx.fillStyle = lockedNow ? 'rgba(122,154,62,0.18)' : 'rgba(26,61,46,0.08)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i < len; i++) {
      const j = (idx + i) % len;
      const v = buf[j] * scale;
      const x = (i / (len - 1)) * w;
      const y = h - Math.min(v, 1) * (h - 4) - 2;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < len; i++) {
      const j = (idx + i) % len;
      const v = buf[j] * scale;
      const x = (i / (len - 1)) * w;
      const y = h - Math.min(v, 1) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = T.muted;
    ctx.font = '10px "DM Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('envolvente · ' + Math.round(beatCenterFreq) + ' Hz', 8, 14);
    ctx.textAlign = 'right';
    ctx.fillText('← 4 segundos →', w - 8, h - 6);
  }, [isLocked, isPlaying, beatCenterFreq]);

  const tick = useCallback(() => {
    const analyser = beatAnalyserRef.current;
    if (analyser) {
      const bufLen = analyser.fftSize;
      const data = new Float32Array(bufLen);
      analyser.getFloatTimeDomainData(data);
      let sumSq = 0;
      for (let i = 0; i < bufLen; i++) sumSq += data[i] * data[i];
      const rms = Math.sqrt(sumSq / bufLen);
      const buf = envelopeBufRef.current;
      buf[envelopeIdxRef.current] = rms;
      envelopeIdxRef.current = (envelopeIdxRef.current + 1) % buf.length;
    }
    drawCanvas();
    rafRef.current = requestAnimationFrame(tick);
  }, [drawCanvas]);

  // ──────────────────────────────────────────────────────────────────
  // Transport
  // ──────────────────────────────────────────────────────────────────

  const startPlayback = () => {
    initAudio();
    const ctx = ctxRef.current;
    if (ctx && ctx.state === 'suspended') ctx.resume();
    const master = masterGainRef.current;
    if (master && ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.2);
    }
    envelopeBufRef.current.fill(0);
    envelopeIdxRef.current = 0;
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    const master = masterGainRef.current;
    const ctx = ctxRef.current;
    if (master && ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = () => { if (isPlaying) stopPlayback(); else startPlayback(); };
  const handleIntervalClick = (i) => {
    if (i === intervalIdx) handleTogglePlay();
    else { setIntervalIdx(i); if (!isPlaying) startPlayback(); }
  };
  const handleABClick = (which) => {
    if (currentAB === which && isPlaying) { stopPlayback(); setCurrentAB(null); return; }
    const newCents = which === 'A' ? parseFloat(justOffset.toFixed(3)) : 0;
    setCentsOffset(newCents);
    setCurrentAB(which);
    if (!isPlaying) startPlayback();
  };

  // ──────────────────────────────────────────────────────────────────
  // Effects
  // ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [tick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      drawCanvas();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawCanvas]);

  useEffect(() => {
    const master = masterGainRef.current;
    const ctx = ctxRef.current;
    if (master && ctx && isPlaying) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    }
  }, [volume, isPlaying]);

  useEffect(() => {
    const d = droneVoiceRef.current;
    const v = varVoiceRef.current;
    const ctx = ctxRef.current;
    if (d && ctx) { d.setFreq(droneFreq); d.filter.frequency.setTargetAtTime(adaptiveLpFreq, ctx.currentTime, 0.05); }
    if (v && ctx) { v.filter.frequency.setTargetAtTime(adaptiveLpFreq, ctx.currentTime, 0.05); }
  }, [droneFreq, adaptiveLpFreq]);

  useEffect(() => {
    const v = varVoiceRef.current;
    if (v) v.setFreq(variableFreq);
  }, [variableFreq]);

  useEffect(() => {
    const bp = beatBandpassRef.current;
    const ctx = ctxRef.current;
    if (bp && ctx) bp.frequency.setTargetAtTime(beatCenterFreq, ctx.currentTime, 0.02);
  }, [beatCenterFreq]);

  useEffect(() => {
    if (!droneVoiceRef.current) return;
    droneVoiceRef.current.stop();
    varVoiceRef.current.stop();
    droneVoiceRef.current = createVoiceFor(droneFreq);
    varVoiceRef.current = createVoiceFor(variableFreq);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timbre]);

  useEffect(() => {
    const d = droneVoiceRef.current;
    const v = varVoiceRef.current;
    const ctx = ctxRef.current;
    if (!d || !v || !ctx) return;
    const cfg = TIMBRES.find(t => t.id === timbre);
    const droneTarget = voiceMode === 'variable' ? 0 : cfg.voiceGain;
    const varTarget   = voiceMode === 'drone'    ? 0 : cfg.voiceGain;
    d.gain.gain.cancelScheduledValues(ctx.currentTime);
    d.gain.gain.setTargetAtTime(droneTarget, ctx.currentTime, 0.03);
    v.gain.gain.cancelScheduledValues(ctx.currentTime);
    v.gain.gain.setTargetAtTime(varTarget,   ctx.currentTime, 0.03);
  }, [voiceMode, timbre]);

  useEffect(() => {
    if (currentAB === 'A') setCentsOffset(parseFloat(justOffset.toFixed(3)));
    else if (currentAB === 'B') setCentsOffset(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justOffset]);

  useEffect(() => {
    if (!autoAB || !isPlaying) return;
    const id = setInterval(() => {
      setCurrentAB(prev => {
        const next = prev === 'A' ? 'B' : 'A';
        setCentsOffset(next === 'A' ? parseFloat(justOffset.toFixed(3)) : 0);
        return next;
      });
    }, autoIntervalMs);
    return () => clearInterval(id);
  }, [autoAB, autoIntervalMs, justOffset, isPlaying]);

  useEffect(() => {
    if (activePreview && activePreview.type === 'h') stopPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteName, octave]);

  useEffect(() => {
    return () => {
      try {
        droneVoiceRef.current?.stop();
        varVoiceRef.current?.stop();
        previewVoiceRef.current?.stop();
        if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
        ctxRef.current?.close();
      } catch (e) {}
    };
  }, []);

  const handleSliderChange = (val) => { setCentsOffset(val); setCurrentAB(null); if (autoAB) setAutoAB(false); };
  const handleAutoToggle = (on) => { setAutoAB(on); if (on) { setCurrentAB('A'); setCentsOffset(parseFloat(justOffset.toFixed(3))); } };

  const justMarkerPct = ((justOffset + SLIDER_RANGE) / (SLIDER_RANGE * 2)) * 100;
  const etMarkerPct = 50;
  const VOICE_LABELS = { drone: 'Solo drone', both: 'Ambas voces', variable: 'Solo variable' };

  const tunerJust = detectedFreq ? freqToHarmonicAnyOctave(detectedFreq, droneFreq, MAX_HARMONIC) : null;
  const tunerET = detectedFreq ? freqToNoteET(detectedFreq) : null;

  // 24 notas temperadas partiendo del drone
  const temperateNotes = Array.from({ length: TEMPERATE_NOTE_COUNT }, (_, i) => {
    const midi = droneMidi + i;
    const info = midiToNoteName(midi);
    return {
      id: `et-${midi}`,
      midi,
      freq: midiToFreq(midi),
      noteName: info.name,
      octave: info.octave,
      display: `${info.name}${info.octave}`,
    };
  });

  // 24 armónicos del drone
  const harmonicNotes = Array.from({ length: MAX_HARMONIC }, (_, i) => {
    const n = i + 1;
    const info = HARMONIC_INFO[i];
    const midi = harmonicMidi(n, droneMidi);
    const noteInfo = midiToNoteName(midi);
    return {
      id: `h-${n}`,
      n,
      midi,
      freq: droneFreq * n,
      info,
      noteDisplay: `${noteInfo.name}${noteInfo.octave}`,
      centsFromET: info.centsFromET,
    };
  });

  // ──────────────────────────────────────────────────────────────────
  // Notas sonando (drone + variable + preview), e intervalos
  // ──────────────────────────────────────────────────────────────────

  const droneNoteInfo = midiToNoteName(droneMidi);
  const variableNoteInfo = freqToNoteET(variableFreq);
  const previewNoteInfo = activePreview ? freqToNoteET(activePreview.freq) : null;

  const soundingVoices = [];
  if (isPlaying) {
    if (voiceMode !== 'variable') {
      soundingVoices.push({
        label: 'Drone',
        note: `${droneNoteInfo.name}${droneNoteInfo.octave}`,
        cents: 0,
        freq: droneFreq,
      });
    }
    if (voiceMode !== 'drone') {
      soundingVoices.push({
        label: 'Variable',
        note: `${variableNoteInfo.name}${variableNoteInfo.octave}`,
        cents: variableNoteInfo.cents,
        freq: variableFreq,
      });
    }
  }
  if (activePreview && previewNoteInfo) {
    soundingVoices.push({
      label: activePreview.type === 'h' ? `${activePreview.id.replace('h-', '')}° arm.` : 'Nota',
      note: `${previewNoteInfo.name}${previewNoteInfo.octave}`,
      cents: previewNoteInfo.cents,
      freq: activePreview.freq,
    });
  }

  // Intervalos entre pares de voces sonando
  const soundingIntervals = [];
  for (let i = 0; i < soundingVoices.length; i++) {
    for (let j = i + 1; j < soundingVoices.length; j++) {
      const iv = findInterval(soundingVoices[i].freq, soundingVoices[j].freq);
      if (iv) soundingIntervals.push({
        from: soundingVoices[i].label,
        to: soundingVoices[j].label,
        interval: iv,
      });
    }
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: T.cream, color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
        .num-tabular { font-variant-numeric: tabular-nums; }
        input[type="range"].cents-slider { -webkit-appearance: none; appearance: none; height: 4px; background: ${T.rule}; border-radius: 2px; outline: none; }
        input[type="range"].cents-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; border-radius: 50%; background: ${T.ink}; border: 2px solid ${T.cream}; cursor: grab; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
        input[type="range"].cents-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: ${T.ink}; border: 2px solid ${T.cream}; cursor: grab; }
        input[type="range"].vol-slider { -webkit-appearance: none; appearance: none; height: 2px; background: ${T.rule}; border-radius: 1px; outline: none; }
        input[type="range"].vol-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 12px; height: 12px; border-radius: 50%; background: ${T.ink}; cursor: pointer; }
        input[type="range"].vol-slider::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: ${T.ink}; cursor: pointer; border: none; }
        .pulse-lock { animation: pulseLock 2s ease-in-out infinite; }
        @keyframes pulseLock { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .play-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${T.lime}; margin-left: 8px; vertical-align: middle; animation: playPulse 1.4s ease-in-out infinite; }
        @keyframes playPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
        .ab-fade { transition: all 0.25s ease; }
        .key-btn { padding: 0; cursor: pointer; }
        .key-btn:hover { filter: brightness(0.97); }
        .tuner-line { position: absolute; top: 0; bottom: 0; width: 2px; transition: left 0.08s linear, background-color 0.15s linear; }
        body { padding-bottom: 250px; }
        .scrollable-intervals { max-height: calc(100vh - 280px); overflow-y: auto; padding-right: 4px; }
        .scrollable-intervals::-webkit-scrollbar { width: 6px; }
        .scrollable-intervals::-webkit-scrollbar-track { background: transparent; }
        .scrollable-intervals::-webkit-scrollbar-thumb { background: ${T.rule}; border-radius: 3px; }
        .staff-scroll::-webkit-scrollbar { height: 8px; }
        .staff-scroll::-webkit-scrollbar-track { background: ${T.paper}; }
        .staff-scroll::-webkit-scrollbar-thumb { background: ${T.rule}; border-radius: 4px; }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-10 md:py-14 font-body">

        {/* CABECERA */}
        <header className="mb-8 md:mb-10">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: T.muted }}>Método Aural</p>
          <h1 className="font-display text-4xl md:text-5xl leading-none italic" style={{ color: T.ink }}>Taller de batimientos</h1>
          <p className="text-base md:text-lg mt-3 italic" style={{ color: T.inkSoft }}>Entonación justa y temperamento igual</p>
          <div className="h-px mt-6" style={{ backgroundColor: T.rule }} />
        </header>

        {/* TEORÍA COLAPSABLE */}
        <section className="mb-10">
          <button onClick={() => setShowTheory(s => !s)}
            className="w-full text-left flex items-center justify-between gap-3 py-3 ab-fade"
            style={{ borderBottom: `1px solid ${T.rule}` }}>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: T.muted }}>Parte teórica</p>
              <p className="font-display italic text-2xl" style={{ color: T.ink }}>
                Cómo funciona el sonido, paso a paso
              </p>
            </div>
            <span className="font-display text-3xl" style={{
              color: T.ink, transform: showTheory ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease'
            }}>⌄</span>
          </button>
          {showTheory && <div className="pt-6"><TheoryContent /></div>}
        </section>

        {/* HERRAMIENTA */}
        <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: T.muted }}>La herramienta</p>
        <h2 className="font-display italic text-3xl md:text-4xl mb-8" style={{ color: T.ink }}>Taller práctico</h2>

        <section className="grid grid-cols-1 lg:grid-cols-[210px_1fr] gap-8 items-start">

          {/* Intervalos (scroll propio) */}
          <div className="lg:sticky lg:top-6">
            <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: T.muted }}>Intervalo</p>
            <div className="scrollable-intervals flex flex-col gap-1.5">
              {INTERVALS.map((iv, i) => {
                const active = i === intervalIdx;
                return (
                  <button key={iv.id} onClick={() => handleIntervalClick(i)} className="block text-left px-3 py-2 ab-fade"
                    style={{
                      backgroundColor: active ? T.ink : 'transparent',
                      color: active ? T.cream : T.ink,
                      border: `1px solid ${active ? T.ink : T.rule}`,
                      borderRadius: '2px', flexShrink: 0,
                    }}>
                    <div className="font-display italic text-sm flex items-center">
                      {iv.name}{active && isPlaying && <span className="play-dot" />}
                    </div>
                    <div className="text-[10px] opacity-70 num-tabular mt-0.5">{iv.ratio}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna principal */}
          <div className="flex flex-col gap-8 min-w-0">

            {/* Drone */}
            <div>
              <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: T.muted }}>Drone</p>
                <p className="font-display italic text-xl">
                  {noteName.replace('#', '♯')}<sub className="text-sm">{octave}</sub>
                  <span className="text-sm num-tabular ml-3" style={{ color: T.muted }}>{droneFreq.toFixed(2)} Hz</span>
                </p>
              </div>
              <div className="flex items-stretch gap-4 flex-wrap">
                <div className="relative flex-1" style={{ minWidth: '280px', maxWidth: '460px', height: '110px' }}>
                  <div className="flex absolute inset-0">
                    {WHITE_KEYS.map((k, i) => {
                      const active = noteName === k.name;
                      return (
                        <button key={k.name} onClick={() => setNoteName(k.name)} className="key-btn flex-1 relative ab-fade"
                          style={{
                            backgroundColor: active ? T.lime : T.cream,
                            border: `1px solid ${T.ink}`,
                            borderRight: i === WHITE_KEYS.length - 1 ? `1px solid ${T.ink}` : 'none',
                            borderRadius: 0,
                          }}>
                          <span className="absolute bottom-2 left-1/2 font-display text-base"
                            style={{ transform: 'translateX(-50%)', color: T.ink, fontWeight: active ? 600 : 400 }}>
                            {k.display}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {BLACK_KEYS.map(k => {
                    const active = noteName === k.name;
                    const blackW = 9;
                    return (
                      <button key={k.name} onClick={() => setNoteName(k.name)} className="key-btn absolute ab-fade"
                        style={{
                          left: `calc(${k.leftPct}% - ${blackW / 2}%)`, width: `${blackW}%`,
                          top: 0, height: '62%',
                          backgroundColor: active ? T.limeDeep : T.ink,
                          border: `1px solid ${T.ink}`, zIndex: 10, borderRadius: '0 0 2px 2px',
                        }}>
                        <span className="absolute bottom-1 left-1/2 text-[9px]"
                          style={{ transform: 'translateX(-50%)', color: active ? T.ink : T.cream, fontWeight: 500 }}>
                          {k.display}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-col items-center justify-center" style={{ minWidth: '90px' }}>
                  <p className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: T.muted }}>Octava</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setOctave(o => Math.max(MIN_OCT, o - 1))} disabled={octave <= MIN_OCT}
                      className="w-8 h-8 text-lg ab-fade"
                      style={{ border: `1px solid ${T.rule}`, color: octave <= MIN_OCT ? T.rule : T.ink, backgroundColor: 'transparent' }}>−</button>
                    <span className="font-display text-3xl num-tabular w-8 text-center">{octave}</span>
                    <button onClick={() => setOctave(o => Math.min(MAX_OCT, o + 1))} disabled={octave >= MAX_OCT}
                      className="w-8 h-8 text-lg ab-fade"
                      style={{ border: `1px solid ${T.rule}`, color: octave >= MAX_OCT ? T.rule : T.ink, backgroundColor: 'transparent' }}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Timbre */}
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: T.muted }}>Timbre del sintetizador</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {TIMBRES.map(t => {
                  const active = t.id === timbre;
                  return (
                    <button key={t.id} onClick={() => setTimbre(t.id)} className="px-4 py-2 text-sm ab-fade"
                      style={{
                        backgroundColor: active ? T.ink : 'transparent', color: active ? T.cream : T.ink,
                        border: `1px solid ${active ? T.ink : T.rule}`, borderRadius: '2px',
                      }}>
                      <span className="font-display italic text-base">{t.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs italic" style={{ color: T.muted }}>{currentTimbre.desc}</p>
            </div>

            {/* Aislar voces */}
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: T.muted }}>Aislar voces</p>
              <div className="flex gap-2 flex-wrap mb-2">
                {['drone', 'both', 'variable'].map(mode => {
                  const active = voiceMode === mode;
                  return (
                    <button key={mode} onClick={() => setVoiceMode(mode)} className="px-4 py-2 text-sm ab-fade"
                      style={{
                        backgroundColor: active ? T.ink : 'transparent', color: active ? T.cream : T.ink,
                        border: `1px solid ${active ? T.ink : T.rule}`, borderRadius: '2px',
                      }}>
                      <span className="font-display italic text-base">{VOICE_LABELS[mode]}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs italic" style={{ color: T.muted }}>
                Si aíslas una voz, los batimientos desaparecen del visualizador; necesitan las dos para existir.
              </p>
            </div>

            {/* A/B + afinadores */}
            <div className="p-4" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleABClick('A')} className="py-3 px-4 ab-fade text-left"
                    style={{
                      backgroundColor: currentAB === 'A' ? T.limeDeep : T.cream,
                      color: currentAB === 'A' ? T.cream : T.ink,
                      border: `1px solid ${currentAB === 'A' ? T.limeDeep : T.rule}`,
                      borderRadius: '2px',
                      boxShadow: currentAB === 'A' ? '0 4px 12px rgba(122,154,62,0.25)' : 'none',
                    }}>
                    <p className="text-[10px] tracking-[0.3em] uppercase opacity-70 flex items-center">
                      A {currentAB === 'A' && isPlaying && <span className="play-dot" style={{ background: T.cream }} />}
                    </p>
                    <p className="font-display text-xl italic">Justa</p>
                    <p className="text-[10px] num-tabular opacity-80">
                      {justOffset >= 0 ? '+' : ''}{justOffset.toFixed(2)} cents
                    </p>
                  </button>
                  <JustTunerDisplay result={tunerJust} micEnabled={micEnabled} freq={detectedFreq}
                    droneMidi={droneMidi} pitchHistoryRef={pitchHistoryRef} pitchHistoryIdxRef={pitchHistoryIdxRef} />
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleABClick('B')} className="py-3 px-4 ab-fade text-left"
                    style={{
                      backgroundColor: currentAB === 'B' ? T.ink : T.cream,
                      color: currentAB === 'B' ? T.cream : T.ink,
                      border: `1px solid ${currentAB === 'B' ? T.ink : T.rule}`,
                      borderRadius: '2px',
                      boxShadow: currentAB === 'B' ? '0 4px 12px rgba(26,61,46,0.2)' : 'none',
                    }}>
                    <p className="text-[10px] tracking-[0.3em] uppercase opacity-70 flex items-center">
                      B {currentAB === 'B' && isPlaying && <span className="play-dot" style={{ background: T.lime }} />}
                    </p>
                    <p className="font-display text-xl italic">Temperado</p>
                    <p className="text-[10px] num-tabular opacity-80">0.00 cents</p>
                  </button>
                  <ETTunerDisplay result={tunerET} micEnabled={micEnabled} freq={detectedFreq}
                    pitchHistoryRef={pitchHistoryRef} pitchHistoryIdxRef={pitchHistoryIdxRef} />
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-xs mb-3 mt-4 pt-3"
                style={{ borderTop: `1px solid ${T.rule}` }}>
                {!micEnabled ? (
                  <button onClick={enableMicrophone} className="px-3 py-1.5 ab-fade"
                    style={{ backgroundColor: T.ink, color: T.cream, borderRadius: '2px' }}>
                    Habilitar micrófono
                  </button>
                ) : (
                  <button onClick={disableMicrophone} className="px-3 py-1.5 ab-fade"
                    style={{ backgroundColor: 'transparent', color: T.ink, border: `1px solid ${T.ink}`, borderRadius: '2px' }}>
                    Desactivar micrófono
                  </button>
                )}
                <span className="italic" style={{ color: T.muted }}>
                  {micEnabled
                    ? 'Canta cualquier nota sostenida. El afinador justo identifica el armónico en cualquier octava. Usa audífonos.'
                    : 'Permite acceso al micrófono para usar los afinadores duales.'}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-xs">
                <button onClick={() => handleAutoToggle(!autoAB)}
                  className="flex items-center gap-2 cursor-pointer select-none"
                  style={{ background: 'none', border: 'none', padding: 0, color: T.ink }}>
                  <span className="w-4 h-4 inline-flex items-center justify-center ab-fade"
                    style={{ backgroundColor: autoAB ? T.ink : 'transparent', border: `1px solid ${T.ink}`, borderRadius: '2px' }}>
                    {autoAB && <span style={{ color: T.cream, fontSize: '10px', lineHeight: 1 }}>✓</span>}
                  </span>
                  <span>Alternar automáticamente</span>
                </button>
                <div className="flex items-center gap-1">
                  {[1000, 2000, 3000, 4000].map(ms => {
                    const active = autoIntervalMs === ms;
                    return (
                      <button key={ms} onClick={() => setAutoIntervalMs(ms)} disabled={!autoAB}
                        className="px-2 py-1 num-tabular ab-fade"
                        style={{
                          color: !autoAB ? T.rule : (active ? T.cream : T.muted),
                          backgroundColor: active && autoAB ? T.ink : 'transparent',
                          border: `1px solid ${active && autoAB ? T.ink : T.rule}`,
                          borderRadius: '2px', cursor: autoAB ? 'pointer' : 'not-allowed',
                        }}>
                        {ms / 1000}s
                      </button>
                    );
                  })}
                </div>
                {autoAB && isPlaying && <span className="italic" style={{ color: T.limeDeep }}>↻ alternando…</span>}
                {autoAB && !isPlaying && <span className="italic" style={{ color: T.muted }}>inicia el audio</span>}
              </div>
            </div>

            {/* Transporte */}
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={handleTogglePlay} className="px-6 py-3 text-sm tracking-wider uppercase ab-fade"
                style={{
                  backgroundColor: isPlaying ? 'transparent' : T.ink,
                  color: isPlaying ? T.ink : T.cream,
                  border: `1px solid ${T.ink}`, borderRadius: '2px', minWidth: '140px',
                }}>
                {isPlaying ? '■  Detener' : '▶  Iniciar'}
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: T.muted }}>Vol drone</span>
                <input type="range" min={0} max={1} step={0.01} value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))} className="vol-slider flex-1" />
                <span className="text-xs num-tabular w-8 text-right" style={{ color: T.muted }}>{Math.round(volume * 100)}</span>
              </div>
            </div>

            {/* Ajuste fino */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: T.muted }}>Ajuste fino · cents desde ET</p>
                <p className="text-xs num-tabular" style={{ color: T.muted }}>±{SLIDER_RANGE} cents</p>
              </div>
              <div className="relative pt-6 pb-8">
                <div className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${justMarkerPct}%`, transform: 'translateX(-50%)' }}>
                  <span className="text-[10px] tracking-[0.15em] uppercase mb-0.5 px-1.5 py-0.5"
                    style={{ backgroundColor: T.limeDeep, color: T.cream, borderRadius: '1px' }}>Justa</span>
                  <div style={{ width: '1px', height: '8px', backgroundColor: T.limeDeep }} />
                </div>
                <div className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${etMarkerPct}%`, transform: 'translateX(-50%)' }}>
                  <span className="text-[10px] tracking-[0.15em] uppercase mb-0.5" style={{ color: T.muted }}>ET</span>
                  <div style={{ width: '1px', height: '8px', backgroundColor: T.muted, marginTop: '8px' }} />
                </div>
                <input type="range" min={-SLIDER_RANGE} max={SLIDER_RANGE} step={0.1} value={centsOffset}
                  onChange={(e) => handleSliderChange(parseFloat(e.target.value))} className="cents-slider w-full" />
                <div className="flex justify-between mt-2 text-[10px] num-tabular" style={{ color: T.muted }}>
                  <span>−{SLIDER_RANGE}</span><span>0</span><span>+{SLIDER_RANGE}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: '−1', delta: -1 }, { label: '−0.1', delta: -0.1 },
                  { label: 'cero', delta: null },
                  { label: '+0.1', delta: 0.1 }, { label: '+1', delta: 1 },
                ].map((b, i) => (
                  <button key={i}
                    onClick={() => handleSliderChange(b.delta === null ? 0 : parseFloat((centsOffset + b.delta).toFixed(2)))}
                    className="px-3 py-1.5 text-xs num-tabular ab-fade"
                    style={{ color: T.muted, border: `1px solid ${T.rule}`, borderRadius: '2px' }}>{b.label}</button>
                ))}
              </div>
            </div>

            {/* Control de volumen para previews */}
            <div className="flex items-center gap-3 flex-wrap" style={{ borderTop: `1px solid ${T.rule}`, paddingTop: '12px' }}>
              <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: T.muted, minWidth: '120px' }}>
                Vol notas / armónicos
              </span>
              <input type="range" min={0} max={1} step={0.01} value={previewVolume}
                onChange={(e) => setPreviewVolume(parseFloat(e.target.value))} className="vol-slider flex-1 min-w-[120px]" />
              <span className="text-xs num-tabular w-8 text-right" style={{ color: T.muted }}>
                {Math.round(previewVolume * 100)}
              </span>
              {activePreview && (
                <button onClick={stopPreview} className="px-3 py-1 text-xs ab-fade"
                  style={{ border: `1px solid ${T.warn}`, color: T.warn, borderRadius: '2px' }}>
                  Detener preview
                </button>
              )}
            </div>

            {/* Notas temperadas en pentagrama */}
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: T.muted }}>
                Notas temperadas · 2 octavas desde {noteName}{octave}
              </p>
              <NoteStaff
                notes={temperateNotes.map(n => ({
                  id: n.id, midi: n.midi, freq: n.freq,
                  label: n.display, sublabel: null,
                }))}
                activeId={activePreview?.id}
                onNoteClick={(note) => togglePreview(note.freq, 'et', note.id, note.midi)}
                kind="temperate"
              />
              <p className="text-xs italic mt-2" style={{ color: T.muted }}>
                Toca una nota para activarla; toca de nuevo para detenerla. Empieza desde la fundamental del drone
                y sube cromáticamente dos octavas. La nota activa se ilumina.
              </p>
            </div>

            {/* Armónicos en pentagrama */}
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: T.muted }}>
                Armónicos del drone · 1° a {MAX_HARMONIC}°
              </p>
              <NoteStaff
                notes={harmonicNotes.map(h => ({
                  id: h.id, midi: h.midi, freq: h.freq,
                  label: `${h.n}°`,
                  noteApprox: h.noteDisplay,
                  sublabel: `${h.info.centsFromET >= 0 ? '+' : ''}${h.info.centsFromET.toFixed(0)}¢`,
                  centsFromET: h.info.centsFromET,
                }))}
                activeId={activePreview?.id}
                onNoteClick={(note) => togglePreview(note.freq, 'h', note.id, note.midi)}
                kind="harmonic"
              />
              <p className="text-xs italic mt-2" style={{ color: T.muted }}>
                Cada nota es el armónico exacto del drone, no su aproximación temperada.
                Los cents indican cuánto se desvía cada armónico del piano. Notación científica: C4 = Do central.
              </p>
            </div>

            {/* Instrucciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
                <p className="font-display italic text-lg mb-3">Modo afinación</p>
                <ol className="text-sm leading-relaxed space-y-2" style={{ color: T.inkSoft }}>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>01</span>Elige un intervalo.</li>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>02</span>Mueve el ajuste fino lentamente.</li>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>03</span>Busca el punto sin batimientos.</li>
                </ol>
              </div>
              <div className="p-5" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
                <p className="font-display italic text-lg mb-3">Afinadores con voz</p>
                <ol className="text-sm leading-relaxed space-y-2" style={{ color: T.inkSoft }}>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>01</span>Habilita el micrófono con audífonos.</li>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>02</span>Canta cualquier octava cómoda.</li>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>03</span>El afinador justo detecta la clase de armónico.</li>
                </ol>
              </div>
              <div className="p-5" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
                <p className="font-display italic text-lg mb-3">Sobre los timbres</p>
                <p className="text-sm leading-relaxed" style={{ color: T.inkSoft }}>
                  Cambia de timbre durante un mismo intervalo y notarás que algunos vuelven los batimientos
                  imperceptibles. Los armónicos pobres ocultan los problemas de afinación.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center pt-10 mt-12" style={{ borderTop: `1px solid ${T.rule}` }}>
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: T.muted }}>Método Aural · Taller de batimientos</p>
        </footer>
      </div>

      {/* BARRA INFERIOR FIJA: visualizador + lecturas + notas sonando */}
      <div className="fixed bottom-0 left-0 right-0 z-40"
        style={{ backgroundColor: T.cream, borderTop: `1px solid ${T.rule}`, boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1" style={{
              border: `1px solid ${T.rule}`, borderRadius: '2px', overflow: 'hidden',
              boxShadow: isLocked && isPlaying ? `inset 0 0 0 2px ${T.lime}` : 'none',
              minWidth: '300px',
            }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: '130px', display: 'block' }} />
              {isLocked && isPlaying && (
                <div className="absolute top-2 right-2 pulse-lock px-2 py-1 text-[10px] tracking-[0.2em] uppercase"
                  style={{ backgroundColor: T.limeDeep, color: T.cream, borderRadius: '2px' }}>
                  Encaje puro
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-1" style={{ minWidth: '210px' }}>
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: T.muted }}>Batimientos</p>
                <p className="font-display text-xl num-tabular leading-tight" style={{ color: isLocked ? T.limeDeep : T.ink }}>
                  {computedBeatRate < 0.05 ? '0.00' : computedBeatRate.toFixed(2)}
                  <span className="text-[10px] ml-1 opacity-60">Hz</span>
                </p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: T.muted }}>Cents (ET)</p>
                <p className="font-display text-xl num-tabular leading-tight">
                  {centsOffset >= 0 ? '+' : ''}{centsOffset.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: T.muted }}>Δ justa</p>
                <p className="font-display text-xl num-tabular leading-tight" style={{ color: isNearLock ? T.limeDeep : T.ink }}>
                  {distanceToJust >= 0 ? '+' : ''}{distanceToJust.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: T.muted }}>Variable</p>
                <p className="font-display text-xl num-tabular leading-tight">
                  {variableFreq.toFixed(1)}<span className="text-[10px] ml-1 opacity-60">Hz</span>
                </p>
              </div>
            </div>
          </div>

          {/* Notas sonando + intervalos */}
          {(soundingVoices.length > 0 || soundingIntervals.length > 0) && (
            <div className="flex items-center gap-3 flex-wrap mt-2 pt-2 text-xs"
              style={{ borderTop: `1px solid ${T.rule}` }}>
              <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: T.muted }}>Sonando</span>
              {soundingVoices.map((v, i) => (
                <span key={i} className="inline-flex items-baseline gap-1.5 px-2 py-0.5"
                  style={{ backgroundColor: T.paper, border: `1px solid ${T.rule}`, borderRadius: '2px' }}>
                  <span style={{ color: T.muted, fontSize: '9px' }}>{v.label}</span>
                  <span className="font-display italic" style={{ color: T.ink }}>{v.note}</span>
                  {Math.abs(v.cents) >= 0.5 && (
                    <span className="num-tabular text-[10px]" style={{ color: Math.abs(v.cents) < IN_TUNE_THRESHOLD ? T.limeDeep : T.warn }}>
                      {v.cents >= 0 ? '+' : ''}{v.cents.toFixed(0)}¢
                    </span>
                  )}
                </span>
              ))}
              {soundingIntervals.length > 0 && (
                <span style={{ color: T.muted }}>·</span>
              )}
              {soundingIntervals.map((si, i) => (
                <span key={i} className="inline-flex items-baseline gap-1.5"
                  style={{ color: T.inkSoft }}>
                  <span style={{ color: T.muted, fontSize: '9px' }}>{si.from}→{si.to}</span>
                  <span className="font-display italic text-sm" style={{ color: T.ink }}>{si.interval.name}</span>
                  {si.interval.ratio && (
                    <span className="text-[10px] num-tabular" style={{ color: T.muted }}>{si.interval.ratio}</span>
                  )}
                  {Math.abs(si.interval.cents) >= 0.5 && (
                    <span className="num-tabular text-[10px]" style={{ color: si.interval.kind === 'justa' ? T.limeDeep : T.muted }}>
                      {si.interval.cents >= 0 ? '+' : ''}{si.interval.cents.toFixed(0)}¢ {si.interval.kind}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SUBCOMPONENTES
// ════════════════════════════════════════════════════════════════════

function TheoryContent() {
  return (
    <div>
      <Section num="1" title="El sonido es aire moviéndose">
        <p>Antes que nada, lo más básico: cuando oyes algo, lo que llega a tu oído son moléculas
        de aire empujándose unas a otras. Una bocina o una cuerda vibra, empuja el aire frente
        a ella, ese aire empuja al aire que sigue, y así hasta tu tímpano, que también vibra
        y tu cerebro lo interpreta como sonido.</p>
        <p>Si el aire empuja y suelta muchas veces por segundo, oyes un sonido agudo. Si lo hace
        pocas veces, oyes uno grave. La cantidad de empujes por segundo se mide en
        <strong> Hertz</strong> (Hz). 440 empujes por segundo es la nota La. 220 Hz es el La una
        octava más grave. 880 Hz, una octava más aguda.</p>
        <p className="italic" style={{ color: T.muted }}>Esa cantidad de empujes por segundo se llama
          <strong> frecuencia</strong>. Todo en música acaba siendo frecuencia.</p>
      </Section>

      <Section num="2" title="El oscilador, una fábrica de empujes">
        <p>Un <strong>oscilador</strong> es lo que produce esos empujes de aire de forma regular.
        En un instrumento acústico, el oscilador puede ser una cuerda vibrando, una columna de
        aire, una lengüeta. En música electrónica es un circuito (o un programa) que genera una
        señal que sube y baja muchas veces por segundo, y esa señal se convierte en movimiento
        de la bocina.</p>
        <p>En este taller los osciladores son piezas de software. Dos osciladores generan dos
        tonos al mismo tiempo, y tu oído los escucha sumados.</p>
      </Section>

      <Section num="3" title="La forma de los empujes importa muchísimo">
        <p>Un oscilador no solo dice "cuántos empujes por segundo". También dice "cómo es la
        forma de cada empuje". A esto se le llama <strong>forma de onda</strong>. Aunque la
        frecuencia sea la misma, el sonido cambia muchísimo según la forma. Una senoidal pura
        suena como un silbidito limpio. Una cuadrada suena como un clarinete viejo. Una sierra
        suena como un violín áspero.</p>
        <p className="italic" style={{ color: T.muted }}>Los timbres que aparecen en la herramienta
          son distintas formas de onda. Cámbialas para escuchar cómo el mismo intervalo cambia
          de color.</p>
      </Section>

      <Section num="4" title="El descubrimiento mágico: toda forma rara es muchas senoidales sumadas">
        <p>Aquí viene el momento más extraño y maravilloso de toda la ciencia del sonido. Lo
        descubrió un señor francés llamado Joseph Fourier hace más de 200 años:</p>
        <Quote>
          Cualquier forma de onda, por más rara que sea, es en realidad una suma de muchas
          senoidales puras tocando al mismo tiempo.
        </Quote>
        <p>Una sierra a 440 Hz no es "una" onda complicada. Es una senoidal pura a 440 Hz, más
        otra a 880 Hz a la mitad de fuerza, más otra a 1320 Hz a un tercio, y así sucesivamente.
        Tu oído las oye todas a la vez y las interpreta como un solo sonido con cierto color.
        A esta descomposición se le llama <strong>serie de Fourier</strong>, y cada una de esas
        senoidales se llama <strong>armónico</strong>.</p>
      </Section>

      <Section num="5" title="Los armónicos: la familia que sigue al fundamental">
        <p>El primer armónico es el <strong>fundamental</strong>: define qué nota oyes. Los
        demás se montan encima en proporciones de números enteros.</p>
        <p>Si el fundamental es 440 Hz, sus armónicos están en:</p>
        <ul className="text-sm num-tabular ml-6 my-2" style={{ color: T.inkSoft }}>
          <li>2° armónico = 880 Hz (octava arriba)</li>
          <li>3° armónico = 1320 Hz (octava + quinta)</li>
          <li>4° armónico = 1760 Hz (dos octavas)</li>
          <li>5° armónico = 2200 Hz (dos octavas + tercera mayor)</li>
        </ul>
        <p>Esto no es invento humano: es física. Los diferentes timbres son distintas recetas de
        cuánto de cada armónico se mezcla.</p>
      </Section>

      <Section num="6" title="Cents y microtonos">
        <p>Pensar la afinación en Hertz es engañoso porque el oído percibe proporciones, no
        diferencias absolutas. Por eso usamos <strong>cents</strong>: un cent es la centésima
        parte de un semitono. Una octava completa tiene <strong>1200 cents</strong>.</p>
        <p>Esto conecta con la microtonalidad:</p>
        <ul className="text-sm num-tabular ml-6 my-2" style={{ color: T.inkSoft }}>
          <li>Cuarto de tono = 50 cents (a medio camino entre dos teclas)</li>
          <li>Sexto de tono ≈ 33 cents</li>
          <li>Octavo de tono = 25 cents</li>
        </ul>
        <p>Cuando ves que un armónico está a −31 cents del piano, está a casi un tercio de tono
        de la nota más cercana. Muchos armónicos naturales no existen como teclas: caen en las
        grietas entre las notas del piano.</p>
      </Section>

      <Section num="7" title="El problema central: dos lógicas distintas para afinar">
        <h4 className="font-display italic text-xl mt-4 mb-2" style={{ color: T.ink }}>
          Entonación justa: afinar siguiendo a la naturaleza
        </h4>
        <p>Si una nota tiene su fundamental a 300 Hz, sus armónicos están a 600, 900, 1200 Hz.
        Otra nota a 400 Hz tiene armónicos a 800, 1200, 1600 Hz. El 3° armónico de la aguda
        coincide con el 4° de la grave: proporción <strong>4:3</strong>. Cuando dos notas
        comparten armónicos exactos, el oído percibe una fusión perfecta. A esto se llama
        <strong> entonación justa</strong>. Es lo que aparece naturalmente en coros a cappella
        y cuartetos de cuerda.</p>

        <h4 className="font-display italic text-xl mt-4 mb-2" style={{ color: T.ink }}>
          El problema de la entonación justa
        </h4>
        <p>Si afinas un piano en justa para que Do mayor suene perfecto, Sol mayor ya no lo está.
        Las proporciones simples no encajan en un esquema cerrado de doce notas por octava. Un
        piano en justa solo serviría para una tonalidad.</p>

        <h4 className="font-display italic text-xl mt-4 mb-2" style={{ color: T.ink }}>
          Temperamento igual: el compromiso universal
        </h4>
        <p>El temperamento igual divide la octava en doce partes exactamente iguales, de 100
        cents cada una. Ningún intervalo es acústicamente puro. A cambio se gana algo inmenso:
        todas las tonalidades suenan iguales y se puede modular libremente.</p>
        <p>Diferencias entre justa y temperada:</p>
        <ul className="text-sm num-tabular ml-6 my-2" style={{ color: T.inkSoft }}>
          <li>Quinta: ET 700, justa 701.96 → +2¢ (casi imperceptible)</li>
          <li>Tercera mayor: ET 400, justa 386.31 → −14¢ (notable)</li>
          <li>Tercera menor: ET 300, justa 315.64 → +16¢</li>
          <li>Séptima armónica: ET 1000, justa 968.83 → −31¢ (muy notable)</li>
        </ul>
      </Section>

      <Section num="8" title="Los batimientos: el latido entre dos ondas">
        <p>Aquí está el corazón del taller. Cuando dos ondas de frecuencias cercanas se suman,
        a veces sus picos coinciden y se refuerzan, y a veces uno está en su pico mientras el
        otro está en su valle, y se cancelan. El volumen sube y baja con un ritmo igual a la
        <strong> diferencia</strong> entre las dos frecuencias.</p>
        <p>Si una onda es de 440 Hz y la otra de 442 Hz, la pulsación pasa
        <strong> 2 veces por segundo</strong>. Si afinas a 440 Hz exacto, las pulsaciones se
        detienen. Esa quietud es lo que oyen los músicos de cuerda al afinar.</p>
        <p>En un intervalo, los fundamentales no se cancelan entre sí, pero sus armónicos sí
        pueden coincidir. En una quinta justa (3:2), el 2° armónico de la aguda coincide con
        el 3° de la grave. Allí nacen o se cancelan los batimientos. El visualizador mide
        exactamente esa zona.</p>
      </Section>

      <Section num="9" title="Cómo usar este taller">
        <p>La herramienta de abajo te deja escuchar todo esto físicamente:</p>
        <ol className="text-base leading-relaxed space-y-2 ml-6 my-3" style={{ color: T.inkSoft }}>
          <li><strong>1.</strong> Elige un intervalo (Tercera mayor es un buen comienzo).</li>
          <li><strong>2.</strong> Elige una nota fundamental y octava cómoda.</li>
          <li><strong>3.</strong> Alterna entre los botones A (Justa) y B (Temperado).</li>
          <li><strong>4.</strong> Activa los afinadores con micrófono para cantar.</li>
          <li><strong>5.</strong> Mueve el ajuste fino para explorar.</li>
          <li><strong>6.</strong> Cambia de timbre y nota cómo el mismo intervalo cambia.</li>
        </ol>
      </Section>
    </div>
  );
}

function Section({ num, title, children }) {
  return (
    <div className="mb-10">
      <h3 className="font-display italic text-2xl mb-3" style={{ color: T.ink }}>
        <span style={{ color: T.muted }} className="num-tabular mr-3">{num}.</span>{title}
      </h3>
      <div className="text-base leading-relaxed space-y-3" style={{ color: T.inkSoft }}>{children}</div>
    </div>
  );
}

function Quote({ children }) {
  return (
    <p className="font-display italic text-xl my-5 px-6 py-3"
      style={{ color: T.ink, borderLeft: `3px solid ${T.limeDeep}`, backgroundColor: T.paper }}>
      {children}
    </p>
  );
}

// ════════════════════════════════════════════════════════════════════
// TunerStrip: siempre visible, con historial coloreado por precisión
// ════════════════════════════════════════════════════════════════════

function TunerStrip({ cents, label, sublabel, hint, accent, pitchHistoryRef, pitchHistoryIdxRef, centerFreq, active }) {
  const accentColor = accent || T.ink;
  const canvasRef = useRef(null);

  // Dibujar canvas del historial de pitch — siempre dibuja (incluso vacío)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    // Bandas verticales: roja-amarilla-verde-amarilla-roja
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(168, 89, 62, 0.10)');
    gradient.addColorStop(0.35, 'rgba(168, 89, 62, 0.05)');
    gradient.addColorStop(0.45, 'rgba(122, 154, 62, 0.10)');
    gradient.addColorStop(0.5, 'rgba(122, 154, 62, 0.20)');
    gradient.addColorStop(0.55, 'rgba(122, 154, 62, 0.10)');
    gradient.addColorStop(0.65, 'rgba(168, 89, 62, 0.05)');
    gradient.addColorStop(1, 'rgba(168, 89, 62, 0.10)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Línea central
    ctx.strokeStyle = T.limeDeep + '55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Líneas de guía a ±IN_TUNE_THRESHOLD cents
    ctx.strokeStyle = 'rgba(122,154,62,0.25)';
    const inTunePx = (IN_TUNE_THRESHOLD / TUNER_RANGE_CENTS) * (h / 2 - 4);
    ctx.beginPath();
    ctx.moveTo(0, h / 2 - inTunePx);
    ctx.lineTo(w, h / 2 - inTunePx);
    ctx.moveTo(0, h / 2 + inTunePx);
    ctx.lineTo(w, h / 2 + inTunePx);
    ctx.stroke();

    // Trazar historial si hay centerFreq
    if (active && centerFreq) {
      const buf = pitchHistoryRef.current;
      const len = buf.length;
      const idx = pitchHistoryIdxRef.current;
      ctx.lineWidth = 1.6;
      let lastX = 0, lastY = 0, lastWasInTune = false, drawing = false;
      ctx.beginPath();
      for (let i = 0; i < len; i++) {
        const j = (idx + i) % len;
        const f = buf[j];
        if (isNaN(f) || !f) { drawing = false; continue; }
        const c = 1200 * Math.log2(f / centerFreq);
        const clampedC = Math.max(-TUNER_RANGE_CENTS, Math.min(TUNER_RANGE_CENTS, c));
        const x = (i / (len - 1)) * w;
        const y = h / 2 - (clampedC / TUNER_RANGE_CENTS) * (h / 2 - 4);
        const isInTune = Math.abs(c) < IN_TUNE_THRESHOLD;

        if (!drawing) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.strokeStyle = isInTune ? T.limeDeep : accentColor;
          drawing = true;
        } else if (isInTune !== lastWasInTune) {
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.strokeStyle = isInTune ? T.limeDeep : accentColor;
        } else {
          ctx.lineTo(x, y);
        }
        lastX = x; lastY = y; lastWasInTune = isInTune;
      }
      if (drawing) ctx.stroke();
    }
  }, [active, centerFreq, cents, accentColor, pitchHistoryRef, pitchHistoryIdxRef]);

  const valid = cents !== null && cents !== undefined && !isNaN(cents);
  const clamped = valid ? Math.max(-TUNER_RANGE_CENTS, Math.min(TUNER_RANGE_CENTS, cents)) : 0;
  const linePct = 50 + (clamped / TUNER_RANGE_CENTS) * 50;
  const inTune = valid && Math.abs(cents) < IN_TUNE_THRESHOLD;

  return (
    <div style={{
      backgroundColor: T.cream, border: `1px solid ${T.rule}`, borderRadius: '2px',
      padding: '8px 10px',
    }}>
      {/* Encabezado: label + cents */}
      <div className="flex items-baseline justify-between mb-1">
        <p className="font-display italic text-base leading-none" style={{ color: valid ? T.ink : T.muted }}>
          {label || '—'}
        </p>
        <p className="text-xs num-tabular" style={{ color: inTune ? T.limeDeep : (valid ? T.muted : T.rule) }}>
          {valid ? `${cents >= 0 ? '+' : ''}${cents.toFixed(1)}¢` : '—'}
        </p>
      </div>

      {/* Sublabel */}
      <p className="text-[10px] mb-1" style={{ color: T.muted, minHeight: '14px' }}>
        {sublabel || (active ? '—' : '')}
      </p>

      {/* Historial de pitch (siempre visible) */}
      <div className="relative my-1" style={{
        height: '64px', backgroundColor: T.paper, border: `1px solid ${T.rule}`, borderRadius: '1px',
      }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* Strip indicador */}
      <div className="relative" style={{
        height: '22px',
        background: `linear-gradient(to right,
          ${T.warn}33 0%, ${T.warn}22 30%,
          ${T.limeDeep}44 42%, ${T.limeDeep}66 50%, ${T.limeDeep}44 58%,
          ${T.warn}22 70%, ${T.warn}33 100%)`,
        border: `1px solid ${T.rule}`, borderRadius: '2px',
      }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: T.muted, opacity: 0.4 }} />
        {valid && (
          <div className="tuner-line" style={{
            left: `${linePct}%`,
            backgroundColor: inTune ? T.limeDeep : accentColor,
            boxShadow: inTune ? `0 0 6px ${T.limeDeep}` : 'none',
          }} />
        )}
      </div>

      {/* Mensaje de estado debajo (en lugar de tapar la UI) */}
      {hint && (
        <p className="text-[10px] italic text-center mt-2" style={{ color: T.muted }}>{hint}</p>
      )}
    </div>
  );
}

function JustTunerDisplay({ result, micEnabled, freq, droneMidi, pitchHistoryRef, pitchHistoryIdxRef }) {
  if (!micEnabled) {
    return <TunerStrip cents={null} label="Afinador justo" sublabel="activa el micrófono"
      hint="Habilita el micrófono para usar este afinador" pitchHistoryRef={pitchHistoryRef}
      pitchHistoryIdxRef={pitchHistoryIdxRef} active={false} accent={T.limeDeep} />;
  }
  if (!freq || !result) {
    return <TunerStrip cents={null} label="Afinador justo" sublabel="canta cualquier nota"
      hint="Sin señal — canta una nota sostenida" pitchHistoryRef={pitchHistoryRef}
      pitchHistoryIdxRef={pitchHistoryIdxRef} active={false} accent={T.limeDeep} />;
  }
  const harmMidi = harmonicMidi(result.n, droneMidi);
  const noteApprox = midiToNoteName(harmMidi);
  return (
    <TunerStrip cents={result.cents}
      label={`${result.n}° armónico · ${noteApprox.name}`}
      sublabel={`equivale al ${result.n}° armónico (cualquier octava)`}
      accent={T.limeDeep}
      pitchHistoryRef={pitchHistoryRef}
      pitchHistoryIdxRef={pitchHistoryIdxRef}
      centerFreq={result.harmonicFreq}
      active={true}
    />
  );
}

function ETTunerDisplay({ result, micEnabled, freq, pitchHistoryRef, pitchHistoryIdxRef }) {
  if (!micEnabled) {
    return <TunerStrip cents={null} label="Afinador temperado" sublabel="activa el micrófono"
      hint="Habilita el micrófono para usar este afinador" pitchHistoryRef={pitchHistoryRef}
      pitchHistoryIdxRef={pitchHistoryIdxRef} active={false} accent={T.ink} />;
  }
  if (!freq || !result) {
    return <TunerStrip cents={null} label="Afinador temperado" sublabel="canta cualquier nota"
      hint="Sin señal — canta una nota sostenida" pitchHistoryRef={pitchHistoryRef}
      pitchHistoryIdxRef={pitchHistoryIdxRef} active={false} accent={T.ink} />;
  }
  const centerFreq = midiToFreq(result.midi);
  return (
    <TunerStrip cents={result.cents}
      label={`${result.name}${result.octave}`}
      sublabel="nota más cercana en 12-TET"
      accent={T.ink}
      pitchHistoryRef={pitchHistoryRef}
      pitchHistoryIdxRef={pitchHistoryIdxRef}
      centerFreq={centerFreq}
      active={true}
    />
  );
}

// ════════════════════════════════════════════════════════════════════
// NoteStaff: pentagrama de doble clave con octavación
// ════════════════════════════════════════════════════════════════════

function NoteStaff({ notes, activeId, onNoteClick, kind }) {
  const stepHeight = 5;
  const noteSpacing = kind === 'harmonic' ? 36 : 32;
  const leftPad = 60;
  const rightPad = 16;
  const topPad = 36;
  const bottomPad = kind === 'harmonic' ? 38 : 26;

  // Computar posiciones con octavación aplicada
  const positions = notes.map(n => {
    const info = midiToStaffInfo(n.midi);
    const { displayPos, ottava } = applyOttava(info.steps);
    return { ...n, ...info, displayPos, ottava };
  });

  // Rango fijo: pentagrama doble (clave de sol y de fa siempre visibles).
  // Treble: pos 2 a 10. Bass: pos -10 a -2. Middle C: pos 0.
  // Margen para mostrar ledger lines hasta 2 líneas adicionales.
  const minPos = -14;
  const maxPos = 14;
  const height = (maxPos - minPos) * stepHeight + topPad + bottomPad;
  const width = leftPad + rightPad + positions.length * noteSpacing;
  const yForPos = (pos) => topPad + (maxPos - pos) * stepHeight;

  const trebleLines = [2, 4, 6, 8, 10];
  const bassLines = [-10, -8, -6, -4, -2];

  return (
    <div className="staff-scroll" style={{ overflowX: 'auto', backgroundColor: T.paper, border: `1px solid ${T.rule}`, borderRadius: '2px', padding: '4px' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block' }}>

        {/* Líneas del pentagrama de sol */}
        {trebleLines.map(p => (
          <line key={`tl-${p}`} x1={leftPad - 8} y1={yForPos(p)} x2={width - rightPad} y2={yForPos(p)}
            stroke={T.ink} strokeWidth="0.8" opacity="0.7" />
        ))}
        {/* Líneas del pentagrama de fa */}
        {bassLines.map(p => (
          <line key={`bl-${p}`} x1={leftPad - 8} y1={yForPos(p)} x2={width - rightPad} y2={yForPos(p)}
            stroke={T.ink} strokeWidth="0.8" opacity="0.7" />
        ))}

        {/* Llave inicial vertical */}
        <line x1={leftPad - 8} y1={yForPos(10)} x2={leftPad - 8} y2={yForPos(-10)}
          stroke={T.ink} strokeWidth="1" opacity="0.6" />

        {/* Clave de sol — centrada en G4 (pos 4). Usar SVG path estilizado. */}
        <g transform={`translate(${leftPad - 38}, ${yForPos(4) - 18})`}>
          <text x="0" y="20" fontSize="38" fill={T.ink}
            style={{ fontFamily: '"Bravura", "Noto Music", serif' }}>𝄞</text>
        </g>

        {/* Clave de fa — centrada en F3 (pos -4) */}
        <g transform={`translate(${leftPad - 36}, ${yForPos(-4) - 14})`}>
          <text x="0" y="18" fontSize="30" fill={T.ink}
            style={{ fontFamily: '"Bravura", "Noto Music", serif' }}>𝄢</text>
        </g>

        {/* Notas */}
        {positions.map((p, i) => {
          const x = leftPad + i * noteSpacing + noteSpacing / 2;
          const y = yForPos(p.displayPos);
          const isActive = p.id === activeId;
          const color = isActive ? T.limeDeep : T.ink;

          // Ledger lines según displayPos
          const ledgerLines = [];
          // Encima del pentagrama de sol (pos > 10)
          for (let lp = 12; lp <= p.displayPos; lp += 2) ledgerLines.push(lp);
          // Debajo del pentagrama de fa (pos < -10)
          for (let lp = -12; lp >= p.displayPos; lp -= 2) ledgerLines.push(lp);
          // C central (pos 0) cuando aplica
          if (p.displayPos >= 0 && p.displayPos <= 0) ledgerLines.push(0);
          else if (p.displayPos === -1 || p.displayPos === 1) ledgerLines.push(0);

          return (
            <g key={p.id} onClick={() => onNoteClick(p)} style={{ cursor: 'pointer' }}>
              {/* Área clicable */}
              <rect x={x - noteSpacing / 2 + 2} y={2} width={noteSpacing - 4} height={height - 4}
                fill={isActive ? `${T.lime}22` : 'transparent'} rx="2" />

              {/* Ledger lines */}
              {ledgerLines.map((lp, j) => (
                <line key={j} x1={x - 7} y1={yForPos(lp)} x2={x + 7} y2={yForPos(lp)}
                  stroke={T.ink} strokeWidth="0.7" opacity="0.7" />
              ))}

              {/* Accidental */}
              {p.accidental && (
                <text x={x - 8} y={y + 3.5} fontSize="13" fill={color} textAnchor="middle"
                  style={{ fontFamily: 'serif' }}>{p.accidental}</text>
              )}

              {/* Nota */}
              <ellipse cx={x} cy={y} rx={isActive ? 5.5 : 4.5} ry={isActive ? 4 : 3.5} fill={color}
                stroke={isActive ? T.limeDeep : 'none'} strokeWidth={isActive ? 1.5 : 0} />

              {/* Ottava label (arriba o abajo de la nota) */}
              {p.ottava && (
                <text x={x} y={p.displayPos > 0 ? y - 12 : y + 18} fontSize="9"
                  fill={isActive ? T.limeDeep : T.warn} textAnchor="middle" fontStyle="italic"
                  fontFamily="DM Sans">
                  {p.ottava}
                </text>
              )}

              {/* Label superior (1° arm. o nombre de nota) */}
              <text x={x} y={20} fontSize="10" fill={isActive ? T.limeDeep : T.ink}
                textAnchor="middle" fontFamily="DM Sans" fontWeight={isActive ? 600 : 500}>
                {p.label}
              </text>

              {/* En armónicos: aprox nota debajo del label superior */}
              {kind === 'harmonic' && p.noteApprox && (
                <text x={x} y={32} fontSize="9" fill={isActive ? T.limeDeep : T.muted}
                  textAnchor="middle" fontFamily="DM Sans">
                  {p.noteApprox}
                </text>
              )}

              {/* Sublabel inferior (cents para armónicos) */}
              {p.sublabel && (
                <text x={x} y={height - 8} fontSize="9"
                  fill={isActive ? T.limeDeep : (Math.abs(p.centsFromET || 0) < 5 ? T.limeDeep : T.muted)}
                  textAnchor="middle" fontFamily="DM Sans" className="num-tabular">
                  {p.sublabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
