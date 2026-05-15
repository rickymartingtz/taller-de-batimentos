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
const SEMITONE_INTERNAL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const noteToSemis = (name) => ALL_KEYS.find(k => k.name === name).semis;
const noteFreq = (name, octave) => 440 * Math.pow(2, (noteToSemis(name) + 12 * (octave - 4)) / 12);

// Notación científica de afinación: C4 = Do central = 261.63 Hz, A4 = 440 Hz.
// MIDI 60 = C4, MIDI 69 = A4.
const semisFromA4 = (name, octave) => noteToSemis(name) + 12 * (octave - 4);
const midiFromNoteOct = (name, octave) => 69 + semisFromA4(name, octave);

// Información de armónicos: para cada n en 1..32, sus cents desde la fundamental
// y los cents que se desvía del ET más cercano.
const HARMONIC_INFO = (() => {
  const info = [];
  for (let n = 1; n <= 32; n++) {
    const centsFromFund = 1200 * Math.log2(n);
    const semisFromFund = centsFromFund / 100;
    const semisRounded = Math.round(semisFromFund);
    const centsFromET = (semisFromFund - semisRounded) * 100;
    info.push({ n, centsFromFund, semisFromFund: semisRounded, centsFromET });
  }
  return info;
})();

const harmonicMidi = (n, fundamentalMidi) => fundamentalMidi + HARMONIC_INFO[n - 1].semisFromFund;
const midiToNoteName = (midi) => {
  const idx = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  return { name: SEMITONE_NAMES[idx], octave: oct, idx };
};

// IR sintético para reverb tipo sala pequeña.
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
  const octave = Math.floor(midiRounded / 12) - 1;
  const noteIdx = ((midiRounded % 12) + 12) % 12;
  return { name: SEMITONE_NAMES[noteIdx], octave, cents, midi: midiRounded };
};

// Detección de armónico tolerante a octavas. Compara la frecuencia detectada
// contra todos los armónicos 1..maxN escalados por octavas para caer cerca.
// Si el cantante entona en cualquier octava, identifica la clase de armónico.
const freqToHarmonicAnyOctave = (freq, fundamentalFreq, maxN = 16) => {
  if (!freq || !fundamentalFreq) return null;
  let bestN = 1;
  let bestCents = Infinity;
  let bestHarmonicFreq = fundamentalFreq;
  for (let n = 1; n <= maxN; n++) {
    let harmonicFreq = fundamentalFreq * n;
    // Escalar por octavas para acercar al freq cantado
    while (harmonicFreq > freq * Math.SQRT2) harmonicFreq /= 2;
    while (harmonicFreq < freq / Math.SQRT2) harmonicFreq *= 2;
    const cents = 1200 * Math.log2(freq / harmonicFreq);
    if (Math.abs(cents) < Math.abs(bestCents)) {
      bestCents = cents;
      bestN = n;
      bestHarmonicFreq = harmonicFreq;
    }
  }
  return { n: bestN, cents: bestCents, harmonicFreq: bestHarmonicFreq };
};

// Posición en pentagrama. Devuelve `steps` (pasos diatónicos desde C4),
// `accidental`, y `letter`. C4 = 0. D4 = 1. C5 = 7. C3 = -7.
const midiToStaffInfo = (midi) => {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const diatonicStep = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][pc];
  const accidental = ['', '♯', '', '♯', '', '', '♯', '', '♯', '', '♯', ''][pc];
  const letter = ['C', 'D', 'E', 'F', 'G', 'A', 'B'][diatonicStep];
  return {
    steps: diatonicStep + (octave - 4) * 7,
    accidental,
    letter,
    octave,
  };
};

const SLIDER_RANGE = 60;
const ENVELOPE_BUFFER_LEN = 240;
const MIN_OCT = 2;
const MAX_OCT = 5;
const MAX_HARMONIC = 16;
const PITCH_HISTORY_LEN = 160;
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
  const [timbre, setTimbre] = useState('semisine');
  const [voiceMode, setVoiceMode] = useState('both');

  const [currentAB, setCurrentAB] = useState(null);
  const [autoAB, setAutoAB] = useState(false);
  const [autoIntervalMs, setAutoIntervalMs] = useState(2000);

  const [activePreview, setActivePreview] = useState(null);  // { type: 'et'|'h', id, freq, midi }
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
  // Creación de voces
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
        setTimeout(() => {
          try { filter.disconnect(); voiceGain.disconnect(); } catch (e) {}
        }, 120);
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
  // Preview (notas y armónicos en modo toggle)
  // ──────────────────────────────────────────────────────────────────

  const startSustainedPreview = useCallback((freq, type, id, midi) => {
    initAudio();
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    // Detener preview previo si existe
    if (previewVoiceRef.current) {
      previewVoiceRef.current.stop();
      previewVoiceRef.current = null;
    }

    const cfg = TIMBRES.find(t => t.id === timbre);
    const previewGain = ctx.createGain();
    previewGain.gain.value = 0;
    previewGain.connect(ctx.destination);
    previewGain.connect(beatBandpassRef.current); // para que aparezca en el visualizador si cae en la banda
    if (convolverRef.current) previewGain.connect(convolverRef.current);

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
    const target = cfg.voiceGain * volume * 2.2;
    previewGain.gain.setValueAtTime(0, now);
    previewGain.gain.linearRampToValueAtTime(target, now + 0.03);
    osc.start(now);

    previewVoiceRef.current = {
      stop: () => {
        const t = ctx.currentTime;
        previewGain.gain.cancelScheduledValues(t);
        previewGain.gain.setValueAtTime(previewGain.gain.value, t);
        previewGain.gain.linearRampToValueAtTime(0, t + 0.08);
        try { osc.stop(t + 0.1); } catch (e) {}
        setTimeout(() => {
          try { filter.disconnect(); previewGain.disconnect(); } catch (e) {}
        }, 200);
      }
    };
    setActivePreview({ type, id, freq, midi });
  }, [timbre, volume, initAudio]);

  const stopPreview = useCallback(() => {
    if (previewVoiceRef.current) {
      previewVoiceRef.current.stop();
      previewVoiceRef.current = null;
    }
    setActivePreview(null);
  }, []);

  const togglePreview = useCallback((freq, type, id, midi) => {
    if (activePreview && activePreview.type === type && activePreview.id === id) {
      stopPreview();
    } else {
      startSustainedPreview(freq, type, id, midi);
    }
  }, [activePreview, stopPreview, startSustainedPreview]);

  // Si el timbre o el volumen cambian mientras hay preview, reiniciarlo con los nuevos parámetros
  useEffect(() => {
    if (activePreview) {
      startSustainedPreview(activePreview.freq, activePreview.type, activePreview.id, activePreview.midi);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timbre]);

  // ──────────────────────────────────────────────────────────────────
  // Micrófono y detección de tono
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
        if (smoothedFreqRef.current === null) {
          smoothedFreqRef.current = rawFreq;
        } else {
          // Si el salto es enorme (más de medio tono), reinicia sin suavizado
          const centsJump = Math.abs(1200 * Math.log2(rawFreq / smoothedFreqRef.current));
          if (centsJump > 50) {
            smoothedFreqRef.current = rawFreq;
          } else {
            smoothedFreqRef.current = smoothedFreqRef.current * (1 - PITCH_SMOOTH_ALPHA) + rawFreq * PITCH_SMOOTH_ALPHA;
          }
        }
        freq = smoothedFreqRef.current;
      } else {
        smoothedFreqRef.current = null;
      }

      pitchHistoryRef.current[pitchHistoryIdxRef.current] = freq || NaN;
      pitchHistoryIdxRef.current = (pitchHistoryIdxRef.current + 1) % PITCH_HISTORY_LEN;

      setDetectedFreq(freq);
    }, 50);
    return () => clearInterval(id);
  }, [micEnabled]);

  // ──────────────────────────────────────────────────────────────────
  // Canvas del visualizador
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
    for (let i = 1; i < 4; i++) {
      const y = (h * i) / 4;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    for (let i = 1; i < 8; i++) {
      const x = (w * i) / 8;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }

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
    if (currentAB === which && isPlaying) {
      stopPlayback();
      setCurrentAB(null);
      return;
    }
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

  // Detener preview si cambia la fundamental del drone (solo para armónicos)
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

  const handleSliderChange = (val) => {
    setCentsOffset(val);
    setCurrentAB(null);
    if (autoAB) setAutoAB(false);
  };
  const handleAutoToggle = (on) => {
    setAutoAB(on);
    if (on) { setCurrentAB('A'); setCentsOffset(parseFloat(justOffset.toFixed(3))); }
  };

  const justMarkerPct = ((justOffset + SLIDER_RANGE) / (SLIDER_RANGE * 2)) * 100;
  const etMarkerPct = 50;
  const VOICE_LABELS = { drone: 'Solo drone', both: 'Ambas voces', variable: 'Solo variable' };

  const tunerJust = detectedFreq ? freqToHarmonicAnyOctave(detectedFreq, droneFreq, MAX_HARMONIC) : null;
  const tunerET = detectedFreq ? freqToNoteET(detectedFreq) : null;

  // Notas temperadas en la octava del drone (C, C♯, ..., B en esa octava)
  const temperateNotes = SEMITONE_INTERNAL.map((internal, i) => {
    const freq = noteFreq(internal, octave);
    const midi = 12 * (octave + 1) + i;
    return { internal, display: SEMITONE_NAMES[i], freq, midi, id: `et-${internal}-${octave}` };
  });

  // Armónicos del drone (H1 a H16)
  const harmonicNotes = Array.from({ length: MAX_HARMONIC }, (_, i) => {
    const n = i + 1;
    const info = HARMONIC_INFO[i];
    const freq = droneFreq * n;
    const midi = harmonicMidi(n, droneMidi);
    return { n, info, freq, midi, id: `h-${n}` };
  });

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: T.cream, color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
        .num-tabular { font-variant-numeric: tabular-nums; }
        input[type="range"].cents-slider { -webkit-appearance: none; appearance: none; height: 4px; background: ${T.rule}; border-radius: 2px; outline: none; }
        input[type="range"].cents-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; border-radius: 50%; background: ${T.ink}; border: 2px solid ${T.cream}; cursor: grab; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
        input[type="range"].cents-slider::-webkit-slider-thumb:active { cursor: grabbing; }
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
        .tuner-line { position: absolute; top: 0; bottom: 0; width: 2px; transition: left 0.08s linear; }
        body { padding-bottom: 200px; }
        .scrollable-intervals { max-height: calc(100vh - 220px); overflow-y: auto; padding-right: 4px; }
        .scrollable-intervals::-webkit-scrollbar { width: 6px; }
        .scrollable-intervals::-webkit-scrollbar-track { background: transparent; }
        .scrollable-intervals::-webkit-scrollbar-thumb { background: ${T.rule}; border-radius: 3px; }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-10 md:py-14 font-body">

        {/* ════════════════════════════════════ */}
        {/*  CABECERA                            */}
        {/* ════════════════════════════════════ */}
        <header className="mb-8 md:mb-10">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: T.muted }}>Método Aural</p>
          <h1 className="font-display text-4xl md:text-5xl leading-none italic" style={{ color: T.ink }}>Taller de batimientos</h1>
          <p className="text-base md:text-lg mt-3 italic" style={{ color: T.inkSoft }}>Entonación justa y temperamento igual</p>
          <div className="h-px mt-6" style={{ backgroundColor: T.rule }} />
        </header>

        {/* ════════════════════════════════════ */}
        {/*  TEORÍA COLAPSABLE                   */}
        {/* ════════════════════════════════════ */}
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
            <span className="font-display text-3xl" style={{ color: T.ink, transform: showTheory ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>⌄</span>
          </button>

          {showTheory && (
            <div className="pt-6">
              <TheoryContent />
            </div>
          )}
        </section>

        {/* ════════════════════════════════════ */}
        {/*  LA HERRAMIENTA                      */}
        {/* ════════════════════════════════════ */}
        <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: T.muted }}>La herramienta</p>
        <h2 className="font-display italic text-3xl md:text-4xl mb-8" style={{ color: T.ink }}>Taller práctico</h2>

        <section className="grid grid-cols-1 lg:grid-cols-[210px_1fr] gap-8 items-start">

          {/* COLUMNA IZQUIERDA: intervalos (scroll propio) */}
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
                      borderRadius: '2px',
                      flexShrink: 0,
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

          {/* COLUMNA DERECHA */}
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
                Útil para diagnosticar el timbre de cada voz por separado. Al aislar una voz,
                los batimientos desaparecen del visualizador; necesitan las dos para existir.
              </p>
            </div>

            {/* A/B + afinadores con micrófono */}
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
                    droneMidi={droneMidi} pitchHistoryRef={pitchHistoryRef} pitchHistoryIdxRef={pitchHistoryIdxRef}
                    droneFreq={droneFreq} />
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
                <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: T.muted }}>Vol</span>
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

            {/* ── Notas temperadas (octava del drone) en pentagrama ── */}
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: T.muted }}>
                Notas temperadas · octava {octave} del drone
              </p>
              <NoteStaff
                notes={temperateNotes.map(n => ({
                  id: n.id, midi: n.midi, freq: n.freq,
                  label: `${n.display}${octave}`,
                  sublabel: null,
                }))}
                activeId={activePreview?.id}
                onNoteClick={(note) => togglePreview(note.freq, 'et', note.id, note.midi)}
                kind="temperate"
              />
              <p className="text-xs italic mt-2" style={{ color: T.muted }}>
                Toca una nota para activarla; toca de nuevo para detenerla. Útil para cantar contra el drone
                buscando un intervalo temperado. La nota activa se ilumina.
              </p>
            </div>

            {/* ── Armónicos del drone en pentagrama ── */}
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: T.muted }}>
                Armónicos del drone · H1 a H{MAX_HARMONIC} (en notación científica)
              </p>
              <NoteStaff
                notes={harmonicNotes.map(h => ({
                  id: h.id, midi: h.midi, freq: h.freq,
                  label: `H${h.n}`,
                  sublabel: `${h.info.centsFromET >= 0 ? '+' : ''}${h.info.centsFromET.toFixed(0)}¢`,
                  centsFromET: h.info.centsFromET,
                }))}
                activeId={activePreview?.id}
                onNoteClick={(note) => togglePreview(note.freq, 'h', note.id, note.midi)}
                kind="harmonic"
              />
              <p className="text-xs italic mt-2" style={{ color: T.muted }}>
                Cada nota es el armónico exacto del drone, no su aproximación temperada.
                Los cents indican cuánto se desvía cada armónico del piano. H7 a −31¢ y H11 a −49¢
                son los más microtonales: caen entre las teclas. Toca para escucharlos sostenidos.
              </p>
            </div>

            {/* Instrucciones breves */}
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
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>03</span>El afinador justo detecta clase de armónico automáticamente.</li>
                </ol>
              </div>
              <div className="p-5" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
                <p className="font-display italic text-lg mb-3">Sobre los timbres</p>
                <p className="text-sm leading-relaxed" style={{ color: T.inkSoft }}>
                  Los batimientos viven en los armónicos. Cambia de timbre y notarás que algunos
                  vuelven los batimientos imperceptibles, mientras otros los exponen brutalmente.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center pt-10 mt-12" style={{ borderTop: `1px solid ${T.rule}` }}>
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: T.muted }}>Método Aural · Taller de batimientos</p>
        </footer>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  BARRA INFERIOR FIJA: visualizador + lecturas            */}
      {/* ════════════════════════════════════════════════════════ */}
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
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SUBCOMPONENTE: contenido teórico (separado para mantener legibilidad)
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
        <p>En este taller los osciladores son piezas de software del navegador. Le decimos
        "quiero 440 empujes por segundo" y empieza a generar una señal a esa velocidad.
        Cuando la bocina recibe esa señal, vibra a esa velocidad, y oyes un La. Esa es la base
        de toda la herramienta: dos osciladores generan dos tonos al mismo tiempo, y tu oído los
        escucha sumados.</p>
      </Section>

      <Section num="3" title="La forma de los empujes importa muchísimo">
        <p>Un oscilador no solo dice "cuántos empujes por segundo". También dice "cómo es la
        forma de cada empuje". Imagínatelo como diferentes maneras de empujar el aire: con una
        curva suave como una ola tranquila; con un escalón brusco como un martillo; o como un
        diente de sierra que sube despacio y cae de golpe.</p>
        <p>A esto se le llama <strong>forma de onda</strong>. Aunque la frecuencia sea la misma,
        el sonido cambia muchísimo según la forma. Una senoidal pura suena como un silbidito
        limpio. Una cuadrada suena como un clarinete viejo. Una sierra suena como un violín
        áspero. Esto es justo lo que hace la diferencia entre el timbre de un piano y el de una
        flauta, aunque toquen la misma nota.</p>
        <p className="italic" style={{ color: T.muted }}>Los timbres que aparecen en la herramienta
          (Senoidal, Sierra, Triangular, Cuadrada, Brillante, Cálida, etc.) son distintas formas
          de onda. Cámbialas para escuchar cómo el mismo intervalo cambia de color.</p>
      </Section>

      <Section num="4" title="El descubrimiento mágico: toda forma rara es muchas senoidales sumadas">
        <p>Aquí viene el momento más extraño y maravilloso de toda la ciencia del sonido. Lo
        descubrió un señor francés llamado Joseph Fourier hace más de 200 años:</p>
        <Quote>
          Cualquier forma de onda, por más rara que sea, es en realidad una suma de muchas
          senoidales puras tocando al mismo tiempo.
        </Quote>
        <p>Una sierra a 440 Hz no es "una" onda complicada. Es una senoidal pura a 440 Hz, más
        otra a 880 Hz a la mitad de fuerza, más otra a 1320 Hz a un tercio, más otra a 1760 Hz a
        un cuarto, y así sucesivamente. Todas esas senoidales sonando juntas dibujan una onda
        que parece sierra. Pero tu oído las oye todas a la vez y las interpreta como un solo
        sonido con cierto color.</p>
        <p>Es como una receta de cocina. A esta descomposición se le llama
          <strong> serie de Fourier</strong>, y cada una de esas senoidales que conforman la
          receta se llama <strong>armónico</strong>.</p>
      </Section>

      <Section num="5" title="Los armónicos: la familia que sigue al fundamental">
        <p>El primer armónico se llama <strong>fundamental</strong>: define qué nota oyes. Los
        demás son armónicos superiores y se montan encima. Lo crucial: los armónicos siempre
        están en proporciones de <strong>números enteros</strong> con el fundamental.</p>
        <p>Si el fundamental es 440 Hz, sus armónicos están en:</p>
        <ul className="text-sm num-tabular ml-6 my-2" style={{ color: T.inkSoft }}>
          <li>2° armónico = 440 × 2 = 880 Hz (octava arriba)</li>
          <li>3° armónico = 440 × 3 = 1320 Hz (octava + quinta)</li>
          <li>4° armónico = 440 × 4 = 1760 Hz (dos octavas)</li>
          <li>5° armónico = 440 × 5 = 2200 Hz (dos octavas + tercera mayor)</li>
          <li>6° armónico = 440 × 6 = 2640 Hz (dos octavas + quinta)</li>
        </ul>
        <p>Esto no es invento humano: es física. Una cuerda vibrando lo hace naturalmente. La
        serie de armónicos es la base natural del sonido. Y los diferentes timbres son distintas
        recetas de cuánto de cada armónico se mezcla.</p>
      </Section>

      <Section num="6" title="Cents y microtonos: medir afinaciones finas">
        <p>Pensar la afinación en Hertz es engañoso porque la diferencia entre 440 y 441 Hz
        <strong> no se oye igual</strong> que entre 880 y 881 Hz. El oído percibe proporciones,
        no diferencias absolutas.</p>
        <p>Por eso los músicos usan <strong>cents</strong>. Un cent es la centésima parte de un
        semitono. Una octava completa tiene <strong>1200 cents</strong> (12 semitonos × 100
        cents). 10 cents desafinado se oye igual de desafinado sin importar la octava.</p>
        <p>Esto conecta con la microtonalidad. Los microtonos son intervalos más pequeños que
        un semitono:</p>
        <ul className="text-sm num-tabular ml-6 my-2" style={{ color: T.inkSoft }}>
          <li>Cuarto de tono = 50 cents (a medio camino entre dos teclas del piano)</li>
          <li>Sexto de tono ≈ 33 cents</li>
          <li>Octavo de tono = 25 cents</li>
          <li>Décimo de tono = 20 cents</li>
        </ul>
        <p>Cuando ves que un armónico está a −31 cents del temperamento igual, está a casi un
        tercio de tono de la nota más cercana del piano. Muchos armónicos naturales simplemente
        no existen como teclas: caen en las grietas entre las notas del piano.</p>
      </Section>

      <Section num="7" title="El problema central: dos lógicas distintas para afinar">
        <p>Ahora que conoces armónicos y cents, podemos abordar el problema central de este
        taller. Hay dos formas radicalmente distintas de afinar las notas entre sí, y ambas son
        respuestas válidas a preguntas distintas.</p>

        <h4 className="font-display italic text-xl mt-6 mb-2" style={{ color: T.ink }}>
          Entonación justa: afinar siguiendo a la naturaleza
        </h4>
        <p>Si una nota tiene su fundamental a 300 Hz, sus armónicos están a 600, 900, 1200, 1500
        Hz. Ahora imagina otra nota a 400 Hz al mismo tiempo, cuyos armónicos están a 800, 1200,
        1600 Hz. Mira: el 3° armónico de la nota aguda (1200) coincide con el 4° armónico de la
        nota grave (1200). Por eso decimos que estas dos notas están en proporción
        <strong> 4:3</strong>.</p>
        <p>Cuando dos notas comparten armónicos exactos, el oído percibe una
        <strong> fusión perfecta</strong>: las dos notas se vuelven una sola sensación sonora
        estable, sin pulsación. A esto se le llama <strong>entonación justa</strong>. Es la
        afinación que aparece cuando un coro a cappella, un cuarteto de cuerdas o cualquier
        conjunto sin teclado afina entre sí. Suena luminosa, fundida, cuasi celestial.</p>
        <p>Las proporciones simples más importantes:</p>
        <ul className="text-sm num-tabular ml-6 my-2" style={{ color: T.inkSoft }}>
          <li>2:1 — octava (misma nota arriba)</li>
          <li>3:2 — quinta justa (Do-Sol)</li>
          <li>4:3 — cuarta justa (Do-Fa)</li>
          <li>5:4 — tercera mayor (Do-Mi)</li>
          <li>6:5 — tercera menor (Do-Mi♭)</li>
        </ul>

        <h4 className="font-display italic text-xl mt-6 mb-2" style={{ color: T.ink }}>
          El problema de la entonación justa
        </h4>
        <p>Si afinas un piano en justa para que <strong>Do-Sol-Mi</strong> suene perfectamente
        fundido, entonces <strong>Sol-Re-Si</strong> ya no estará bien afinado, porque el Re y
        el Si que elegiste para Do mayor no son los Re y Si que necesita Sol mayor. Las
        proporciones simples no encajan limpio en un esquema cerrado de doce notas por octava.
        Por eso un piano en justa solo serviría para una tonalidad.</p>

        <h4 className="font-display italic text-xl mt-6 mb-2" style={{ color: T.ink }}>
          Temperamento igual: el compromiso universal
        </h4>
        <p>El temperamento igual divide la octava en doce partes <strong>exactamente iguales</strong>
        de 100 cents cada una. Ninguna proporción acústica es respetada. Pero a cambio se gana
        algo inmenso: <strong>todas las tonalidades suenan iguales</strong>. Puedes modular sin
        reafinar. Esto permitió a Bach escribir <em>El clave bien temperado</em> y a toda la
        música tonal occidental construirse sobre la posibilidad de modular.</p>
        <p>Las diferencias entre justa y temperada son pequeñas pero audibles:</p>
        <ul className="text-sm num-tabular ml-6 my-2" style={{ color: T.inkSoft }}>
          <li>Quinta: ET 700.00, justa 701.96 → +2¢ (casi imperceptible)</li>
          <li>Cuarta: ET 500.00, justa 498.04 → −2¢</li>
          <li>Tercera mayor: ET 400.00, justa 386.31 → −14¢ (notable)</li>
          <li>Tercera menor: ET 300.00, justa 315.64 → +16¢</li>
          <li>Séptima armónica: ET 1000, justa 968.83 → −31¢ (muy notable)</li>
        </ul>
        <p className="italic" style={{ color: T.muted }}>Las terceras son donde la diferencia se
        vuelve dramática. Por eso cantantes y violinistas instintivamente afinan las terceras
        mayores "más bajas" en acordes mayores: están persiguiendo la justa sin saberlo.</p>
      </Section>

      <Section num="8" title="Los batimientos: el latido entre dos ondas">
        <p>Aquí está el corazón del taller. Imagina dos pianistas que tocan la misma nota,
        pero uno está ligeramente desafinado. No oyes "dos notas distintas". Oyes
        <strong> una sola nota que pulsa</strong>, como un latido: "wah-wah-wah-wah". Esa
        pulsación rítmica son los <strong>batimientos</strong>.</p>
        <p>Físicamente: cuando dos ondas de frecuencias cercanas se suman, a veces sus picos
        coinciden y se refuerzan (suena fuerte) y a veces uno está en su pico mientras el otro
        está en su valle, y se cancelan (suena débil). El volumen sube y baja con un ritmo
        igual a la <strong>diferencia</strong> entre las dos frecuencias.</p>
        <p>Si una onda es de 440 Hz y la otra de 442 Hz, la pulsación pasa
        <strong> 2 veces por segundo</strong>. Si afinas hasta 440 Hz exacto, las pulsaciones
        se detienen. Esa quietud absoluta es lo que oyen los músicos de cuerda cuando afinan.</p>
        <p>Pero hay un detalle clave: en este taller no comparamos unísonos sino
        <strong> intervalos</strong>. Las dos notas son distintas. Sus fundamentales no se
        cancelan entre sí. Sin embargo, sus armónicos sí pueden coincidir. Cuando tocas una
        quinta justa pura (3:2), el 2° armónico de la nota aguda coincide con el 3° armónico
        de la grave. Allí, en ese punto donde los armónicos se cruzan, es donde nacen o se
        cancelan los batimientos. El visualizador mide exactamente esa zona específica.</p>
      </Section>

      <Section num="9" title="Cómo usar este taller">
        <p>La herramienta de abajo te deja escuchar todo esto físicamente:</p>
        <ol className="text-base leading-relaxed space-y-2 ml-6 my-3" style={{ color: T.inkSoft }}>
          <li><strong>1.</strong> Elige un intervalo (Tercera mayor es un buen comienzo).</li>
          <li><strong>2.</strong> Elige una nota fundamental y una octava cómoda.</li>
          <li><strong>3.</strong> Alterna entre los botones A (Justa) y B (Temperado).</li>
          <li><strong>4.</strong> Activa los afinadores con micrófono para cantar.</li>
          <li><strong>5.</strong> Mueve el ajuste fino para explorar el espacio intermedio.</li>
          <li><strong>6.</strong> Cambia de timbre y nota cómo el mismo intervalo cambia.</li>
        </ol>
        <p className="italic" style={{ color: T.muted }}>El objetivo no es teórico sino físico:
        que tu cuerpo y oído <strong>reconozcan</strong> la diferencia entre las dos
        afinaciones, no que la entiendas en papel.</p>
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
      <div className="text-base leading-relaxed space-y-3" style={{ color: T.inkSoft }}>
        {children}
      </div>
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
// SUBCOMPONENTE: TunerStrip con historial de pitch
// ════════════════════════════════════════════════════════════════════

function TunerStrip({ cents, label, sublabel, hint, accent, pitchHistoryRef, pitchHistoryIdxRef, centerFreq }) {
  const valid = cents !== null && cents !== undefined && !isNaN(cents);
  const clamped = valid ? Math.max(-TUNER_RANGE_CENTS, Math.min(TUNER_RANGE_CENTS, cents)) : 0;
  const linePct = 50 + (clamped / TUNER_RANGE_CENTS) * 50;
  const inTune = valid && Math.abs(cents) < IN_TUNE_THRESHOLD;
  const accentColor = accent || T.ink;
  const canvasRef = useRef(null);

  // Dibujar historial de pitch
  useEffect(() => {
    if (!valid || !centerFreq) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // Línea central (en tono)
    ctx.strokeStyle = inTune ? T.limeDeep : 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Historial de pitch como línea
    const buf = pitchHistoryRef.current;
    const len = buf.length;
    const idx = pitchHistoryIdxRef.current;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let drawing = false;
    for (let i = 0; i < len; i++) {
      const j = (idx + i) % len;
      const f = buf[j];
      if (isNaN(f) || !f) { drawing = false; continue; }
      // Convertir freq a cents respecto a centerFreq, normalizar a la altura
      const c = 1200 * Math.log2(f / centerFreq);
      const clampedC = Math.max(-TUNER_RANGE_CENTS, Math.min(TUNER_RANGE_CENTS, c));
      const x = (i / (len - 1)) * w;
      const y = h / 2 - (clampedC / TUNER_RANGE_CENTS) * (h / 2 - 4);
      if (!drawing) { ctx.moveTo(x, y); drawing = true; } else { ctx.lineTo(x, y); }
    }
    ctx.stroke();
  });

  return (
    <div style={{
      backgroundColor: T.cream, border: `1px solid ${T.rule}`, borderRadius: '2px',
      padding: '8px 10px', minHeight: '124px',
    }}>
      {!valid ? (
        <div className="flex items-center justify-center" style={{ minHeight: '108px' }}>
          <p className="text-xs italic text-center" style={{ color: T.muted }}>{hint}</p>
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between mb-1">
            <p className="font-display italic text-base leading-none" style={{ color: T.ink }}>{label}</p>
            <p className="text-xs num-tabular" style={{ color: inTune ? T.limeDeep : T.muted }}>
              {cents >= 0 ? '+' : ''}{cents.toFixed(1)}¢
            </p>
          </div>
          {sublabel && (
            <p className="text-[10px] mb-1" style={{ color: T.muted }}>{sublabel}</p>
          )}

          {/* Mini-gráfica de historial */}
          <div className="relative my-1" style={{
            height: '40px', backgroundColor: T.paper, border: `1px solid ${T.rule}`, borderRadius: '1px',
          }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>

          {/* Strip de tuner */}
          <div className="relative" style={{
            height: '22px',
            background: `linear-gradient(to right,
              ${T.warn}33 0%, ${T.warn}22 30%,
              ${inTune ? T.limeDeep : T.rule}44 42%, ${inTune ? T.limeDeep : T.rule}66 50%, ${inTune ? T.limeDeep : T.rule}44 58%,
              ${T.warn}22 70%, ${T.warn}33 100%)`,
            border: `1px solid ${T.rule}`, borderRadius: '2px',
          }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: T.muted, opacity: 0.4 }} />
            <div className="tuner-line" style={{
              left: `${linePct}%`,
              backgroundColor: inTune ? T.limeDeep : accentColor,
              boxShadow: inTune ? `0 0 6px ${T.limeDeep}` : 'none',
            }} />
          </div>
        </>
      )}
    </div>
  );
}

function JustTunerDisplay({ result, micEnabled, freq, droneMidi, droneFreq, pitchHistoryRef, pitchHistoryIdxRef }) {
  if (!micEnabled) return <TunerStrip cents={null} hint="Afinador justo — activa el micrófono" />;
  if (!freq || !result) return <TunerStrip cents={null} hint="Afinador justo — canta cualquier nota" />;
  // Nombre de la clase armónica
  const harmMidi = harmonicMidi(result.n, droneMidi);
  const noteApprox = midiToNoteName(harmMidi);
  return (
    <TunerStrip
      cents={result.cents}
      label={`H${result.n} · ${noteApprox.name}`}
      sublabel={`armónico ${result.n} · canta cualquier octava`}
      accent={T.limeDeep}
      pitchHistoryRef={pitchHistoryRef}
      pitchHistoryIdxRef={pitchHistoryIdxRef}
      centerFreq={result.harmonicFreq}
    />
  );
}

function ETTunerDisplay({ result, micEnabled, freq, pitchHistoryRef, pitchHistoryIdxRef }) {
  if (!micEnabled) return <TunerStrip cents={null} hint="Afinador temperado — activa el micrófono" />;
  if (!freq || !result) return <TunerStrip cents={null} hint="Afinador temperado — canta cualquier nota" />;
  const centerFreq = 440 * Math.pow(2, (result.midi - 69) / 12);
  return (
    <TunerStrip
      cents={result.cents}
      label={`${result.name}${result.octave}`}
      sublabel={`nota más cercana en 12-TET`}
      accent={T.ink}
      pitchHistoryRef={pitchHistoryRef}
      pitchHistoryIdxRef={pitchHistoryIdxRef}
      centerFreq={centerFreq}
    />
  );
}

// ════════════════════════════════════════════════════════════════════
// SUBCOMPONENTE: NoteStaff (pentagrama de notas o armónicos)
// ════════════════════════════════════════════════════════════════════

function NoteStaff({ notes, activeId, onNoteClick, kind }) {
  const stepHeight = 5;
  const noteSpacing = kind === 'harmonic' ? 38 : 36;
  const leftPad = 50;
  const rightPad = 12;
  const topPad = kind === 'harmonic' ? 28 : 22;
  const bottomPad = kind === 'harmonic' ? 28 : 22;

  // Calcula posiciones en pentagrama
  const positions = notes.map(n => ({
    ...n,
    ...midiToStaffInfo(n.midi),
  }));

  // Rango: incluir al menos el pentagrama de sol (pos 2-10)
  const allPos = positions.map(p => p.steps);
  const minPos = Math.min(-2, Math.min(...allPos) - 1);
  const maxPos = Math.max(10, Math.max(...allPos) + 1);
  const useGrandStaff = minPos < -1;

  const height = (maxPos - minPos) * stepHeight + topPad + bottomPad;
  const width = leftPad + rightPad + positions.length * noteSpacing;

  const yForPos = (pos) => topPad + (maxPos - pos) * stepHeight;

  const trebleLines = [2, 4, 6, 8, 10].filter(p => p >= minPos && p <= maxPos);
  const bassLines = useGrandStaff ? [-10, -8, -6, -4, -2].filter(p => p >= minPos && p <= maxPos) : [];

  return (
    <div style={{ overflowX: 'auto', backgroundColor: T.paper, border: `1px solid ${T.rule}`, borderRadius: '2px', padding: '4px' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block', minWidth: '100%' }}>
        {/* Líneas del pentagrama de sol */}
        {trebleLines.map(p => (
          <line key={`tl-${p}`} x1={leftPad - 8} y1={yForPos(p)} x2={width - rightPad} y2={yForPos(p)}
            stroke={T.muted} strokeWidth="0.7" />
        ))}
        {/* Líneas del pentagrama de fa */}
        {bassLines.map(p => (
          <line key={`bl-${p}`} x1={leftPad - 8} y1={yForPos(p)} x2={width - rightPad} y2={yForPos(p)}
            stroke={T.muted} strokeWidth="0.7" />
        ))}

        {/* Clave de sol (símbolo simplificado) */}
        {trebleLines.length > 0 && (
          <text x={leftPad - 32} y={yForPos(2) + 14} fontSize="32" fill={T.ink}
            style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>𝄞</text>
        )}
        {/* Clave de fa */}
        {bassLines.length > 0 && (
          <text x={leftPad - 32} y={yForPos(-6) + 10} fontSize="26" fill={T.ink}
            style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>𝄢</text>
        )}

        {/* Notas */}
        {positions.map((p, i) => {
          const x = leftPad + i * noteSpacing + noteSpacing / 2;
          const y = yForPos(p.steps);
          const isActive = p.id === activeId;
          const color = isActive ? T.limeDeep : T.ink;

          // Líneas adicionales (ledger lines) cuando la nota está fuera del pentagrama
          const ledgerLines = [];
          // Por encima del sol (> 10)
          for (let lp = 12; lp <= p.steps; lp += 2) {
            ledgerLines.push(lp);
          }
          // Entre los dos pentagramas (entre -1 y 1)
          if (useGrandStaff) {
            for (let lp = 0; lp <= 0; lp++) {
              if (p.steps >= lp && p.steps <= 1 || p.steps >= -1 && p.steps <= lp) {
                if (lp === 0) ledgerLines.push(0);
              }
            }
          } else {
            for (let lp = 0; lp >= p.steps; lp -= 2) {
              if (lp !== 0 || p.steps <= 0) ledgerLines.push(lp);
            }
          }
          // Por debajo del fa (< -10)
          for (let lp = -12; lp >= p.steps; lp -= 2) {
            ledgerLines.push(lp);
          }

          return (
            <g key={p.id} onClick={() => onNoteClick(p)} style={{ cursor: 'pointer' }}>
              {/* Rect transparente para área clicable */}
              <rect x={x - noteSpacing / 2 + 2} y={topPad} width={noteSpacing - 4} height={height - topPad - bottomPad}
                fill={isActive ? `${T.lime}22` : 'transparent'} rx="2" />
              {/* Ledger lines */}
              {ledgerLines.map((lp, j) => (
                <line key={j} x1={x - 7} y1={yForPos(lp)} x2={x + 7} y2={yForPos(lp)}
                  stroke={T.muted} strokeWidth="0.7" />
              ))}
              {/* Accidental */}
              {p.accidental && (
                <text x={x - 9} y={y + 3} fontSize="11" fill={color} textAnchor="middle"
                  style={{ fontFamily: 'serif' }}>{p.accidental}</text>
              )}
              {/* Note head */}
              <ellipse cx={x} cy={y} rx={isActive ? 5.5 : 4.5} ry={isActive ? 4 : 3.5} fill={color}
                stroke={isActive ? T.limeDeep : 'none'} strokeWidth={isActive ? 1.5 : 0} />
              {/* Label arriba */}
              <text x={x} y={topPad - 6} fontSize="10" fill={isActive ? T.limeDeep : T.muted}
                textAnchor="middle" fontFamily="DM Sans" fontWeight={isActive ? 600 : 400}>
                {p.label}
              </text>
              {/* Sublabel abajo */}
              {p.sublabel && (
                <text x={x} y={height - 6} fontSize="9" fill={isActive ? T.limeDeep : (Math.abs(p.centsFromET || 0) < 5 ? T.limeDeep : T.muted)}
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
