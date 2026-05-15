import React, { useState, useEffect, useRef, useCallback } from 'react';

// ════════════════════════════════════════════════════════════════════
// CONSTANTES Y UTILIDADES MODULARES
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

// Recetas de Fourier para cada timbre. Cada array enumera la fuerza de los
// armónicos: índice 0 es DC (siempre 0), índice 1 es el fundamental, etc.
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

// Datos de armónicos: para cada armónico n, sus cents desde la fundamental
// (es decir: 1200 * log2(n)), su nota más cercana en ET, y los cents que se
// desvía de esa nota ET.
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

// Nombre de la nota n-ésima armónico (relativo a la fundamental seleccionada).
const harmonicNoteName = (n, fundamentalName, fundamentalOctave) => {
  const fundSemis = noteToSemis(fundamentalName) + 12 * (fundamentalOctave - 4);
  const harmInfo = HARMONIC_INFO[n - 1];
  const totalSemis = fundSemis + harmInfo.semisFromFund;
  const noteIdx = ((totalSemis + 9 + 12 * 100) % 12);
  const octave = Math.floor((totalSemis + 9) / 12) + 4;
  return SEMITONE_NAMES[noteIdx] + octave;
};

// Generador de impulse response sintético para reverb tipo sala pequeña.
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

// ─────────────────────────────────────────────────────────────────────
// Detección de tono (algoritmo YIN simplificado)
// ─────────────────────────────────────────────────────────────────────
const detectPitchYIN = (buffer, sampleRate, threshold = 0.15) => {
  // Verifica nivel mínimo de señal
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.008) return null; // muy callado

  const halfLen = Math.floor(buffer.length / 2);
  const yinBuffer = new Float32Array(halfLen);

  // Paso 1: función de diferencia
  for (let tau = 0; tau < halfLen; tau++) {
    let sum = 0;
    for (let i = 0; i < halfLen; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum;
  }

  // Paso 2: diferencia media normalizada acumulativa
  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < halfLen; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] = yinBuffer[tau] * tau / runningSum;
  }

  // Paso 3: primer valor bajo el umbral (con búsqueda local del mínimo)
  let tauEstimate = -1;
  for (let i = 2; i < halfLen; i++) {
    if (yinBuffer[i] < threshold) {
      while (i + 1 < halfLen && yinBuffer[i + 1] < yinBuffer[i]) i++;
      tauEstimate = i;
      break;
    }
  }
  if (tauEstimate === -1) return null;

  // Paso 4: interpolación parabólica para precisión sub-muestra
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

// Conversión de frecuencia a nota temperada
const freqToNoteET = (freq) => {
  if (!freq || freq <= 0) return null;
  const midi = 69 + 12 * Math.log2(freq / 440);
  const midiRounded = Math.round(midi);
  const cents = 100 * (midi - midiRounded);
  const octave = Math.floor(midiRounded / 12) - 1;
  const noteIdx = ((midiRounded % 12) + 12) % 12;
  return { name: SEMITONE_NAMES[noteIdx], octave, cents };
};

// Conversión de frecuencia a armónico más cercano de una fundamental dada
const freqToHarmonic = (freq, fundamentalFreq, maxN = 16) => {
  if (!freq || !fundamentalFreq) return null;
  let bestN = 1;
  let bestCents = Infinity;
  for (let n = 1; n <= maxN; n++) {
    const harmonicFreq = fundamentalFreq * n;
    const cents = 1200 * Math.log2(freq / harmonicFreq);
    if (Math.abs(cents) < Math.abs(bestCents)) {
      bestCents = cents;
      bestN = n;
    }
  }
  return { n: bestN, cents: bestCents, harmonicFreq: fundamentalFreq * bestN };
};

const SLIDER_RANGE = 60;
const ENVELOPE_BUFFER_LEN = 240;
const MIN_OCT = 2;
const MAX_OCT = 5;
const MAX_HARMONIC_BUTTON = 32;
const TUNER_RANGE_CENTS = 50;

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

  const [previewOctave, setPreviewOctave] = useState(4);
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

  const canvasRef = useRef(null);
  const envelopeBufRef = useRef(new Float32Array(ENVELOPE_BUFFER_LEN));
  const envelopeIdxRef = useRef(0);
  const rafRef = useRef(null);

  const interval = INTERVALS[intervalIdx];
  const droneFreq = noteFreq(noteName, octave);
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
      oscillators,
      filter,
      gain: voiceGain,
      setFreq: (newFreq) => {
        oscillators.forEach(o => {
          o.osc.frequency.setTargetAtTime(newFreq * o.mult, ctx.currentTime, 0.01);
        });
      },
      stop: () => {
        const t = ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(t);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, t);
        voiceGain.gain.linearRampToValueAtTime(0, t + 0.06);
        oscillators.forEach(o => {
          try { o.osc.stop(t + 0.08); } catch (e) {}
        });
        setTimeout(() => {
          try { filter.disconnect(); } catch (e) {}
          try { voiceGain.disconnect(); } catch (e) {}
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
  // Reproducción de notas individuales (preview)
  // ──────────────────────────────────────────────────────────────────

  const playPreview = useCallback((freq, durationMs = 800) => {
    initAudio();
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const cfg = TIMBRES.find(t => t.id === timbre);
    const previewGain = ctx.createGain();
    previewGain.gain.value = 0;
    previewGain.connect(ctx.destination);
    if (convolverRef.current) previewGain.connect(convolverRef.current);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = Math.max(7000, Math.min(freq * 50, 13000));
    filter.Q.value = 0.5;
    filter.connect(previewGain);

    const harmonics = WAVEFORMS[timbre] || WAVEFORMS.semisine;
    const wave = ctx.createPeriodicWave(
      new Float32Array(harmonics.length),
      new Float32Array(harmonics)
    );
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = freq;
    osc.connect(filter);

    const now = ctx.currentTime;
    const dur = durationMs / 1000;
    const target = cfg.voiceGain * volume * 2.2;
    previewGain.gain.setValueAtTime(0, now);
    previewGain.gain.linearRampToValueAtTime(target, now + 0.03);
    previewGain.gain.setValueAtTime(target, now + dur - 0.15);
    previewGain.gain.linearRampToValueAtTime(0, now + dur);

    osc.start(now);
    osc.stop(now + dur + 0.05);
    setTimeout(() => {
      try { osc.disconnect(); filter.disconnect(); previewGain.disconnect(); } catch (e) {}
    }, durationMs + 100);
  }, [timbre, volume, initAudio]);

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
      const freq = detectPitchYIN(buffer, ctx.sampleRate);
      setDetectedFreq(freq);
    }, 60);
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
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let i = 1; i < 8; i++) {
      const x = (w * i) / 8;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
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
    ctx.beginPath();
    ctx.moveTo(0, h - 2);
    ctx.lineTo(w, h - 2);
    ctx.stroke();

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
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < len; i++) {
      const j = (idx + i) % len;
      const v = buf[j] * scale;
      const x = (i / (len - 1)) * w;
      const y = h - Math.min(v, 1) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
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

  const handleTogglePlay = () => {
    if (isPlaying) stopPlayback();
    else startPlayback();
  };

  const handleIntervalClick = (i) => {
    if (i === intervalIdx) {
      handleTogglePlay();
    } else {
      setIntervalIdx(i);
      if (!isPlaying) startPlayback();
    }
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
    if (d && ctx) {
      d.setFreq(droneFreq);
      d.filter.frequency.setTargetAtTime(adaptiveLpFreq, ctx.currentTime, 0.05);
    }
    if (v && ctx) {
      v.filter.frequency.setTargetAtTime(adaptiveLpFreq, ctx.currentTime, 0.05);
    }
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
    return () => {
      try {
        droneVoiceRef.current?.stop();
        varVoiceRef.current?.stop();
        if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
        ctxRef.current?.close();
      } catch (e) {}
    };
  }, []);

  // ──────────────────────────────────────────────────────────────────
  // Handlers menores
  // ──────────────────────────────────────────────────────────────────

  const handleSliderChange = (val) => {
    setCentsOffset(val);
    setCurrentAB(null);
    if (autoAB) setAutoAB(false);
  };
  const handleAutoToggle = (on) => {
    setAutoAB(on);
    if (on) {
      setCurrentAB('A');
      setCentsOffset(parseFloat(justOffset.toFixed(3)));
    }
  };

  const justMarkerPct = ((justOffset + SLIDER_RANGE) / (SLIDER_RANGE * 2)) * 100;
  const etMarkerPct = 50;

  const VOICE_LABELS = { drone: 'Solo drone', both: 'Ambas voces', variable: 'Solo variable' };

  // ──────────────────────────────────────────────────────────────────
  // Computar lecturas de afinadores
  // ──────────────────────────────────────────────────────────────────

  const tunerJust = detectedFreq ? freqToHarmonic(detectedFreq, droneFreq, 16) : null;
  const tunerET = detectedFreq ? freqToNoteET(detectedFreq) : null;

  // ──────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: T.cream, color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
        .num-tabular { font-variant-numeric: tabular-nums; }

        input[type="range"].cents-slider {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: ${T.rule}; border-radius: 2px; outline: none;
        }
        input[type="range"].cents-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 22px; height: 22px; border-radius: 50%;
          background: ${T.ink}; border: 2px solid ${T.cream};
          cursor: grab; box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        input[type="range"].cents-slider::-webkit-slider-thumb:active { cursor: grabbing; }
        input[type="range"].cents-slider::-moz-range-thumb {
          width: 22px; height: 22px; border-radius: 50%;
          background: ${T.ink}; border: 2px solid ${T.cream}; cursor: grab;
        }
        input[type="range"].vol-slider {
          -webkit-appearance: none; appearance: none;
          height: 2px; background: ${T.rule}; border-radius: 1px; outline: none;
        }
        input[type="range"].vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 12px; height: 12px; border-radius: 50%; background: ${T.ink}; cursor: pointer;
        }
        input[type="range"].vol-slider::-moz-range-thumb {
          width: 12px; height: 12px; border-radius: 50%; background: ${T.ink}; cursor: pointer; border: none;
        }

        .pulse-lock { animation: pulseLock 2s ease-in-out infinite; }
        @keyframes pulseLock { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .play-dot {
          display: inline-block; width: 6px; height: 6px;
          border-radius: 50%; background: ${T.lime}; margin-left: 8px;
          vertical-align: middle; animation: playPulse 1.4s ease-in-out infinite;
        }
        @keyframes playPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.4; transform: scale(0.7); }
        }
        .ab-fade { transition: all 0.25s ease; }
        .key-btn { padding: 0; cursor: pointer; }
        .key-btn:hover { filter: brightness(0.97); }
        .tuner-line {
          position: absolute; top: 0; bottom: 0;
          width: 2px; background: ${T.ink};
          transition: left 0.08s linear;
        }
        body { padding-bottom: 180px; }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-10 md:py-14 font-body">

        {/* ════════════════════════════════════════════════════════ */}
        {/*  CABECERA                                                */}
        {/* ════════════════════════════════════════════════════════ */}
        <header className="mb-10 md:mb-12">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: T.muted }}>
            Método Aural
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-none italic" style={{ color: T.ink }}>
            Taller de batimientos
          </h1>
          <p className="text-base md:text-lg mt-3 italic" style={{ color: T.inkSoft }}>
            Entonación justa y temperamento igual
          </p>
          <div className="h-px mt-6" style={{ backgroundColor: T.rule }} />
        </header>

        {/* ════════════════════════════════════════════════════════ */}
        {/*  SECCIÓN TEÓRICA                                         */}
        {/* ════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: T.muted }}>
            Parte teórica · Léelo antes de usar la herramienta
          </p>
          <h2 className="font-display italic text-3xl md:text-4xl mb-8" style={{ color: T.ink }}>
            Cómo funciona el sonido, paso a paso
          </h2>

          {/* — Sonido es aire — */}
          <div className="mb-10">
            <h3 className="font-display italic text-2xl mb-3" style={{ color: T.ink }}>
              1. El sonido es aire moviéndose
            </h3>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Antes que nada, lo más básico: cuando oyes algo, lo que llega a tu oído son moléculas
              de aire empujándose unas a otras. Una bocina o una cuerda vibra, empuja el aire frente
              a ella, ese aire empuja al aire que sigue, y así hasta tu tímpano, que también vibra y
              tu cerebro lo interpreta como sonido.
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Si el aire empuja y suelta muchas veces por segundo, oyes un sonido agudo. Si lo hace
              pocas veces por segundo, oyes uno grave. La cantidad de empujes por segundo se mide en
              <strong> Hertz</strong> (Hz). 440 empujes por segundo es la nota La. 220 Hz es el La
              una octava más grave. 880 Hz es el La una octava más aguda.
            </p>
            <p className="text-base leading-relaxed italic" style={{ color: T.muted }}>
              Esa cantidad de empujes por segundo se llama <strong>frecuencia</strong>. Todo en
              música acaba siendo frecuencia.
            </p>
          </div>

          {/* — Oscilador — */}
          <div className="mb-10">
            <h3 className="font-display italic text-2xl mb-3" style={{ color: T.ink }}>
              2. El oscilador, una fábrica de empujes
            </h3>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Un <strong>oscilador</strong> es lo que produce esos empujes de aire de forma regular.
              En un instrumento acústico, el oscilador puede ser una cuerda vibrando, una columna de
              aire, una lengüeta. En música electrónica es un circuito (o un programa) que genera
              una señal que sube y baja muchas veces por segundo, y esa señal se convierte en
              movimiento de la bocina.
            </p>
            <p className="text-base leading-relaxed" style={{ color: T.inkSoft }}>
              En este taller los osciladores son piezas de software del navegador. Le decimos
              "quiero 440 empujes por segundo" y empieza a generar una señal a esa velocidad.
              Cuando la bocina recibe esa señal, vibra a esa velocidad, y oyes un La. Esa es la
              base de toda la herramienta: dos osciladores generan dos tonos al mismo tiempo, y
              tu oído los escucha sumados.
            </p>
          </div>

          {/* — Forma de onda — */}
          <div className="mb-10">
            <h3 className="font-display italic text-2xl mb-3" style={{ color: T.ink }}>
              3. La forma de los empujes importa muchísimo
            </h3>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Un oscilador no solo dice "cuántos empujes por segundo". También dice "cómo es la
              forma de cada empuje". Imagínatelo como diferentes maneras de empujar el aire: con
              una curva suave como una ola tranquila; con un escalón brusco como un martillo;
              o como un diente de sierra que sube despacio y cae de golpe.
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              A esto se le llama <strong>forma de onda</strong>. Aunque la frecuencia sea la misma
              (mismos empujes por segundo), el sonido cambia muchísimo según la forma. Una
              senoidal pura suena como un silbidito limpio. Una cuadrada suena como un clarinete
              viejo o un videojuego. Una sierra suena como un violín áspero. Esto es justo lo que
              hace la diferencia entre el timbre de un piano y el de una flauta, aunque toquen
              la misma nota.
            </p>
            <p className="text-base leading-relaxed italic" style={{ color: T.muted }}>
              Los timbres que aparecen en esta herramienta (Senoidal, Sierra, Triangular,
              Cuadrada, Brillante, Cálida, etc.) son distintas formas de onda con caracteres
              diferentes. Cámbialas para escuchar cómo el mismo intervalo cambia de color.
            </p>
          </div>

          {/* — Fourier / armónicos — */}
          <div className="mb-10">
            <h3 className="font-display italic text-2xl mb-3" style={{ color: T.ink }}>
              4. El descubrimiento mágico: toda forma rara es muchas senoidales sumadas
            </h3>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Aquí viene el momento más extraño y maravilloso de toda la ciencia del sonido. Lo
              descubrió un señor francés llamado Joseph Fourier hace más de 200 años:
            </p>
            <p
              className="font-display italic text-2xl my-5 px-6 py-3"
              style={{ color: T.ink, borderLeft: `3px solid ${T.limeDeep}`, backgroundColor: T.paper }}
            >
              "Cualquier forma de onda, por más rara que sea, es en realidad una suma de muchas
              senoidales puras tocando al mismo tiempo."
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Repítelo despacio: cualquier forma compleja es muchas ondas senoidales sencillitas
              sumadas. Una sierra a 440 Hz no es realmente "una" onda complicada. Es una senoidal
              pura a 440 Hz, más otra a 880 Hz a la mitad de fuerza, más otra a 1320 Hz a un
              tercio, más otra a 1760 Hz a un cuarto, y así sucesivamente. Todas esas senoidales
              sonando juntas dibujan una onda que parece sierra. Pero tu oído las oye todas a la
              vez y las interpreta como un solo sonido con cierto color.
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Es como una receta de cocina. A esta descomposición se le llama <strong>serie de
              Fourier</strong>, y cada una de esas senoidales que conforman la receta se llama
              <strong> armónico</strong>.
            </p>
          </div>

          {/* — Armónicos — */}
          <div className="mb-10">
            <h3 className="font-display italic text-2xl mb-3" style={{ color: T.ink }}>
              5. Los armónicos: la familia que sigue al fundamental
            </h3>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              El primer armónico se llama <strong>fundamental</strong>: es el que define qué nota
              oyes. Los demás se llaman armónicos superiores y se montan encima del fundamental.
              Lo crucial es esto: los armónicos siempre están en proporciones de
              <strong> números enteros</strong> con el fundamental.
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Si el fundamental es 440 Hz, sus armónicos están en:
            </p>
            <div className="text-sm mb-3 num-tabular ml-6" style={{ color: T.inkSoft }}>
              <p>2° armónico = 440 × 2 = 880 Hz (una octava arriba)</p>
              <p>3° armónico = 440 × 3 = 1320 Hz (octava + quinta)</p>
              <p>4° armónico = 440 × 4 = 1760 Hz (dos octavas)</p>
              <p>5° armónico = 440 × 5 = 2200 Hz (dos octavas + tercera mayor)</p>
              <p>6° armónico = 440 × 6 = 2640 Hz (dos octavas + quinta)</p>
              <p>...y así, hasta donde alcance el rango audible.</p>
            </div>
            <p className="text-base leading-relaxed" style={{ color: T.inkSoft }}>
              Esto no es invento del ser humano. Es física: una cuerda vibrando hace esto
              naturalmente. Una columna de aire también. La serie de armónicos es la base natural
              del sonido. Y los diferentes timbres son simplemente diferentes recetas de cuánto
              de cada armónico se mezcla. Senoidal: solo el fundamental, los demás en cero.
              Cuadrada: solo los impares. Sierra: todos con caída 1/n. Cada timbre es una
              receta distinta.
            </p>
          </div>

          {/* — Cents — */}
          <div className="mb-10">
            <h3 className="font-display italic text-2xl mb-3" style={{ color: T.ink }}>
              6. Cents: la unidad para medir afinaciones finas
            </h3>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Pensar la afinación en Hertz es engañoso porque la diferencia entre 440 y 441 Hz
              <strong> no se oye igual</strong> que entre 880 y 881 Hz. La primera es claramente
              perceptible; la segunda casi no se nota. Esto pasa porque el oído percibe
              proporciones, no diferencias absolutas.
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Por eso los músicos usan <strong>cents</strong>. Un cent es la centésima parte de un
              semitono. Un semitono es la distancia entre dos teclas adyacentes del piano (digamos
              entre Do y Do♯). Una octava completa tiene <strong>1200 cents</strong> (12 semitonos
              × 100 cents).
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Lo bonito es que los cents son proporcionales: 10 cents desafinado se oye igual de
              desafinado sin importar si estás en La 440 o La 880. Eso convierte a los cents en
              el lenguaje universal de las afinaciones finas. En todos los visores numéricos de
              esta herramienta usamos cents.
            </p>
            <p
              className="text-sm leading-relaxed mt-4 px-4 py-3 italic"
              style={{ color: T.muted, backgroundColor: T.paper, borderLeft: `2px solid ${T.rule}` }}
            >
              Cents y microtonos. La microtonalidad es la práctica musical que usa intervalos
              menores que un semitono. Por ejemplo, el cuarto de tono mide 50 cents; el sexto
              de tono mide 33,33 cents; el octavo de tono mide 25 cents. Cuando ves que un
              armónico está &laquo;-31 cents&raquo; respecto al temperamento igual, está casi
              a un tercio de tono de la nota más cercana del piano. Por eso muchos armónicos
              naturales no existen como teclas: caen entre las grietas.
            </p>
          </div>

          {/* — Justa vs temperada (extendida) — */}
          <div className="mb-10">
            <h3 className="font-display italic text-2xl mb-3" style={{ color: T.ink }}>
              7. El problema central: dos lógicas distintas para afinar
            </h3>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Ahora que conoces armónicos y cents, podemos abordar el problema central de este
              taller. Hay dos formas radicalmente distintas de afinar las notas entre sí, y
              ambas son respuestas válidas a preguntas distintas.
            </p>

            <h4 className="font-display italic text-xl mt-6 mb-2" style={{ color: T.ink }}>
              Entonación justa: afinar siguiendo a la naturaleza
            </h4>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Si una nota tiene su fundamental a 300 Hz, sus armónicos están a 600, 900, 1200,
              1500, 1800 Hz, etc. Ahora imagina que tocamos otra nota a 400 Hz al mismo tiempo.
              Sus armónicos están a 800, 1200, 1600, 2000 Hz... Mira: el 3° armónico de la nota
              aguda (1200) coincide exactamente con el 4° armónico de la nota grave (1200).
              Por eso decimos que estas dos notas están en proporción <strong>4:3</strong>
              (cuatro armónicos abajo equivalen a tres arriba).
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Cuando dos notas comparten armónicos exactos, el oído percibe una
              <strong> fusión perfecta</strong>: las dos notas se vuelven una sola sensación
              sonora estable, sin pulsación. A esto se le llama <strong>entonación justa</strong>.
              Es la afinación que aparece naturalmente cuando un coro a cappella, un cuarteto de
              cuerdas o cualquier conjunto sin teclado afina entre sí. Suena luminosa, fundida,
              cuasi celestial.
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Las proporciones simples más importantes son:
            </p>
            <div className="text-sm mb-3 num-tabular ml-6" style={{ color: T.inkSoft }}>
              <p>2:1 — octava (la fusión más obvia: misma nota arriba)</p>
              <p>3:2 — quinta justa (Do-Sol)</p>
              <p>4:3 — cuarta justa (Do-Fa)</p>
              <p>5:4 — tercera mayor (Do-Mi)</p>
              <p>6:5 — tercera menor (Do-Mi♭)</p>
              <p>5:3 — sexta mayor (Do-La)</p>
              <p>8:5 — sexta menor (Do-La♭)</p>
            </div>

            <h4 className="font-display italic text-xl mt-6 mb-2" style={{ color: T.ink }}>
              El problema de la entonación justa
            </h4>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Si afinas un piano en entonación justa para que <strong>Do-Sol-Mi</strong> suene
              perfectamente fundido (un acorde mayor de Do), entonces <strong>Sol-Re-Si</strong>
              (un acorde mayor de Sol) ya no estará bien afinado, porque el Re y el Si que
              elegiste para Do mayor no son los Re y Si que necesita Sol mayor. Las notas que
              quieren coincidir en una tonalidad <strong>se pelean</strong> con las que quieren
              coincidir en otra. No es un problema de instrumento sino de matemáticas: las
              proporciones simples (3:2, 5:4, 4:3) no encajan limpio en un esquema cerrado de
              doce notas por octava.
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Por eso un piano en entonación justa solo serviría para tocar en una tonalidad.
              Cambiar de tonalidad requeriría retunar el piano cada vez. Inviable.
            </p>

            <h4 className="font-display italic text-xl mt-6 mb-2" style={{ color: T.ink }}>
              Temperamento igual: el compromiso universal
            </h4>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              El temperamento igual resuelve el problema de manera elegante y radical: divide
              la octava en doce partes <strong>exactamente iguales</strong>, de 100 cents cada
              una. Ninguna proporción acústicamente perfecta se respeta. Todos los intervalos
              están ligeramente desafinados respecto a la entonación justa.
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Pero a cambio se gana una ventaja inmensa: <strong>todas las tonalidades suenan
              iguales</strong>. Puedes modular libremente entre Do mayor, Mi♭ mayor, La♭ menor,
              Fa♯ mayor; cualquier viaje armónico es posible sin reafinar el instrumento. Esto
              es lo que permitió a Bach escribir <em>El clave bien temperado</em> y a toda la
              música tonal occidental construirse sobre la posibilidad de modular.
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Las diferencias entre justa y temperada son pequeñas pero audibles:
            </p>
            <div className="text-sm mb-3 num-tabular ml-6" style={{ color: T.inkSoft }}>
              <p>Quinta: ET 700.00 cents, justa 701.96 cents → +2 cents (casi imperceptible)</p>
              <p>Cuarta: ET 500.00 cents, justa 498.04 cents → −2 cents</p>
              <p>Tercera mayor: ET 400.00 cents, justa 386.31 cents → −14 cents (notable)</p>
              <p>Tercera menor: ET 300.00 cents, justa 315.64 cents → +16 cents</p>
              <p>Sexta mayor: ET 900.00 cents, justa 884.36 cents → −16 cents</p>
              <p>Séptima armónica: ET 1000 cents, justa 968.83 cents → −31 cents (muy notable)</p>
            </div>
            <p className="text-base leading-relaxed italic" style={{ color: T.muted }}>
              Las terceras son donde la diferencia entre justa y temperada se vuelve dramática.
              Por eso muchos cantantes y violinistas instintivamente afinan las terceras
              &laquo;más bajas&raquo; en acordes mayores: están persiguiendo la entonación
              justa sin saberlo.
            </p>
          </div>

          {/* — Batimientos — */}
          <div className="mb-10">
            <h3 className="font-display italic text-2xl mb-3" style={{ color: T.ink }}>
              8. Los batimientos: el latido entre dos ondas
            </h3>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Aquí está el corazón del taller. Imagina dos pianistas que tocan la misma nota,
              pero uno está ligeramente desafinado. No oyes "dos notas distintas". Oyes
              <strong> una sola nota que pulsa</strong>, como un latido: "wah-wah-wah-wah".
              Esa pulsación rítmica son los <strong>batimientos</strong>.
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Físicamente: cuando dos ondas de frecuencias cercanas se suman, a veces sus picos
              coinciden y se refuerzan (suena fuerte) y a veces uno está en su pico mientras el
              otro está en su valle, y se cancelan (suena débil). El resultado es un volumen
              que sube y baja con un ritmo igual a la <strong>diferencia</strong> entre las
              dos frecuencias.
            </p>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              Si una onda es de 440 Hz y la otra de 442 Hz, la pulsación pasa
              <strong> 2 veces por segundo</strong> (442 − 440 = 2). Si la afinas hasta exactamente
              440 Hz, las pulsaciones se detienen completamente. Esa quietud absoluta es
              <strong> lo que oyen los músicos de cuerda</strong> cuando afinan sus
              instrumentos: cuando los batimientos paran, las dos notas están idénticamente
              sintonizadas.
            </p>
            <p className="text-base leading-relaxed" style={{ color: T.inkSoft }}>
              Pero hay un detalle crucial: en esta herramienta no estamos comparando unísonos
              (la misma nota dos veces), sino <strong>intervalos</strong>. Las dos notas son
              distintas. Sus fundamentales no se quieren cancelar entre sí. Sin embargo, sus
              armónicos sí pueden coincidir. Cuando tocas una quinta justa pura (proporción
              3:2), el 2° armónico de la nota aguda coincide exactamente con el 3° armónico de
              la nota grave. Allí, en ese punto donde los armónicos se cruzan, es donde nacen
              o se cancelan los batimientos. Eso es exactamente lo que mide el visualizador en
              la parte de abajo de la pantalla: la zona específica donde los armónicos
              deberían coincidir. Si los batimientos están vivos, estás desafinado. Si la línea
              se queda quieta, estás en entonación justa.
            </p>
          </div>

          {/* — Pequeño diagrama final — */}
          <div className="mb-10">
            <h3 className="font-display italic text-2xl mb-3" style={{ color: T.ink }}>
              9. Cómo usar este taller
            </h3>
            <p className="text-base leading-relaxed mb-3" style={{ color: T.inkSoft }}>
              La herramienta de abajo te deja escuchar todo esto físicamente:
            </p>
            <ol className="text-base leading-relaxed space-y-2 ml-6 mb-3" style={{ color: T.inkSoft }}>
              <li><strong>1.</strong> Elige un intervalo (Tercera mayor es un buen comienzo, por su contraste dramático).</li>
              <li><strong>2.</strong> Elige una nota fundamental y una octava cómoda.</li>
              <li><strong>3.</strong> Alterna entre los botones A (Justa) y B (Temperado). Escucha la diferencia.</li>
              <li><strong>4.</strong> Activa los afinadores con el botón de micrófono para cantar las notas y ver en cuál afinación estás más cerca.</li>
              <li><strong>5.</strong> Mueve el ajuste fino para explorar el espacio entre justa y temperada.</li>
              <li><strong>6.</strong> Cambia de timbre. Notarás que en algunos timbres (Senoidal) los batimientos casi desaparecen, y en otros (Sierra, Brillante) son crudísimos.</li>
            </ol>
            <p className="text-base leading-relaxed italic" style={{ color: T.muted }}>
              El objetivo no es teórico sino físico. La idea es que tu cuerpo y tu oído
              <strong> reconozcan</strong> la diferencia entre las dos afinaciones, no que la
              entiendas en papel. Cuando tu oído sepa identificar la fusión de la entonación
              justa, podrás reproducirla con tu voz o tu instrumento sin pensarlo.
            </p>
          </div>
        </section>

        <div className="h-px mb-12" style={{ backgroundColor: T.rule }} />

        {/* ════════════════════════════════════════════════════════ */}
        {/*  ÁREA PRINCIPAL DEL TALLER                               */}
        {/* ════════════════════════════════════════════════════════ */}
        <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: T.muted }}>
          La herramienta
        </p>
        <h2 className="font-display italic text-3xl md:text-4xl mb-10" style={{ color: T.ink }}>
          Taller práctico
        </h2>

        <section className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 items-start">

          {/* ─── COLUMNA IZQUIERDA: intervalos ─── */}
          <div className="lg:sticky lg:top-6">
            <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: T.muted }}>
              Intervalo
            </p>
            <div className="flex flex-col gap-1.5">
              {INTERVALS.map((iv, i) => {
                const active = i === intervalIdx;
                return (
                  <button
                    key={iv.id}
                    onClick={() => handleIntervalClick(i)}
                    className="block text-left px-3 py-2 ab-fade"
                    style={{
                      backgroundColor: active ? T.ink : 'transparent',
                      color: active ? T.cream : T.ink,
                      border: `1px solid ${active ? T.ink : T.rule}`,
                      borderRadius: '2px',
                    }}
                  >
                    <div className="font-display italic text-sm flex items-center">
                      {iv.name}
                      {active && isPlaying && <span className="play-dot" />}
                    </div>
                    <div className="text-[10px] opacity-70 num-tabular mt-0.5">
                      {iv.ratio}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── COLUMNA DERECHA ─── */}
          <div className="flex flex-col gap-8 min-w-0">

            {/* Drone */}
            <div>
              <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: T.muted }}>
                  Drone
                </p>
                <p className="font-display italic text-xl">
                  {noteName.replace('#', '♯')}<sub className="text-sm">{octave}</sub>
                  <span className="text-sm num-tabular ml-3" style={{ color: T.muted }}>
                    {droneFreq.toFixed(2)} Hz
                  </span>
                </p>
              </div>

              <div className="flex items-stretch gap-4 flex-wrap">
                <div className="relative flex-1" style={{ minWidth: '280px', maxWidth: '460px', height: '110px' }}>
                  <div className="flex absolute inset-0">
                    {WHITE_KEYS.map((k, i) => {
                      const active = noteName === k.name;
                      return (
                        <button
                          key={k.name}
                          onClick={() => setNoteName(k.name)}
                          className="key-btn flex-1 relative ab-fade"
                          style={{
                            backgroundColor: active ? T.lime : T.cream,
                            border: `1px solid ${T.ink}`,
                            borderRight: i === WHITE_KEYS.length - 1 ? `1px solid ${T.ink}` : 'none',
                            borderRadius: 0,
                          }}
                        >
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
                      <button
                        key={k.name}
                        onClick={() => setNoteName(k.name)}
                        className="key-btn absolute ab-fade"
                        style={{
                          left: `calc(${k.leftPct}% - ${blackW / 2}%)`,
                          width: `${blackW}%`, top: 0, height: '62%',
                          backgroundColor: active ? T.limeDeep : T.ink,
                          border: `1px solid ${T.ink}`, zIndex: 10,
                          borderRadius: '0 0 2px 2px',
                        }}
                      >
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
              <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: T.muted }}>
                Timbre del sintetizador
              </p>
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
                Útil para diagnosticar el timbre de cada voz por separado. Si aíslas una voz,
                los batimientos desaparecen del visualizador; necesitan las dos para existir.
              </p>
            </div>

            {/* A/B + afinadores con micrófono */}
            <div className="p-4" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
              <div className="grid grid-cols-2 gap-3 mb-3">

                {/* Columna A: justa + afinador justo */}
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
                  <JustTunerDisplay result={tunerJust} micEnabled={micEnabled}
                    fundamentalName={noteName} fundamentalOctave={octave} freq={detectedFreq} />
                </div>

                {/* Columna B: temperada + afinador temperado */}
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
                  <ETTunerDisplay result={tunerET} micEnabled={micEnabled} freq={detectedFreq} />
                </div>

              </div>

              {/* Control de micrófono */}
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
                    ? 'Canta el drone, los armónicos o la nota objetivo. Usa audífonos para evitar retroalimentación.'
                    : 'Permite acceso al micrófono para usar los afinadores duales.'}
                </span>
              </div>

              {/* Auto A/B */}
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
                <span className="text-xs num-tabular w-8 text-right" style={{ color: T.muted }}>
                  {Math.round(volume * 100)}
                </span>
              </div>
            </div>

            {/* Ajuste fino */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: T.muted }}>
                  Ajuste fino · cents desde temperado igual
                </p>
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
                  { label: '−1', delta: -1 },
                  { label: '−0.1', delta: -0.1 },
                  { label: 'cero', delta: null },
                  { label: '+0.1', delta: 0.1 },
                  { label: '+1', delta: 1 },
                ].map((b, i) => (
                  <button key={i}
                    onClick={() => handleSliderChange(b.delta === null ? 0 : parseFloat((centsOffset + b.delta).toFixed(2)))}
                    className="px-3 py-1.5 text-xs num-tabular ab-fade"
                    style={{ color: T.muted, border: `1px solid ${T.rule}`, borderRadius: '2px' }}>{b.label}</button>
                ))}
              </div>
            </div>

            {/* Lecturas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: T.muted }}>Batimientos</p>
                <p className="font-display text-3xl num-tabular" style={{ color: isLocked ? T.limeDeep : T.ink }}>
                  {computedBeatRate < 0.05 ? '0.00' : computedBeatRate.toFixed(2)}
                  <span className="text-sm ml-1 opacity-60">Hz</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: T.muted }}>Cents (vs ET)</p>
                <p className="font-display text-3xl num-tabular">
                  {centsOffset >= 0 ? '+' : ''}{centsOffset.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: T.muted }}>Distancia a justa</p>
                <p className="font-display text-3xl num-tabular" style={{ color: isNearLock ? T.limeDeep : T.ink }}>
                  {distanceToJust >= 0 ? '+' : ''}{distanceToJust.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: T.muted }}>Frec. variable</p>
                <p className="font-display text-3xl num-tabular">
                  {variableFreq.toFixed(2)}<span className="text-sm ml-1 opacity-60">Hz</span>
                </p>
              </div>
            </div>

            {/* ── Botones de notas temperadas ── */}
            <div>
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: T.muted }}>
                  Notas temperadas · referencia
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: T.muted }}>Octava</span>
                  <button onClick={() => setPreviewOctave(o => Math.max(2, o - 1))}
                    disabled={previewOctave <= 2}
                    className="w-6 h-6 text-sm ab-fade"
                    style={{ border: `1px solid ${T.rule}`, color: previewOctave <= 2 ? T.rule : T.ink, backgroundColor: 'transparent' }}>−</button>
                  <span className="font-display text-lg num-tabular w-12 text-center">
                    {previewOctave}–{previewOctave + 1}
                  </span>
                  <button onClick={() => setPreviewOctave(o => Math.min(6, o + 1))}
                    disabled={previewOctave >= 6}
                    className="w-6 h-6 text-sm ab-fade"
                    style={{ border: `1px solid ${T.rule}`, color: previewOctave >= 6 ? T.rule : T.ink, backgroundColor: 'transparent' }}>+</button>
                </div>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5">
                {Array.from({ length: 24 }, (_, i) => {
                  const semis = i % 12;
                  const oct = previewOctave + Math.floor(i / 12);
                  const name = SEMITONE_NAMES[semis];
                  const internal = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][semis];
                  const freq = noteFreq(internal, oct);
                  return (
                    <button key={i} onClick={() => playPreview(freq)} className="px-1 py-2 ab-fade"
                      style={{ border: `1px solid ${T.rule}`, borderRadius: '2px', backgroundColor: T.cream }}>
                      <div className="font-display italic text-sm" style={{ color: T.ink }}>{name}</div>
                      <div className="text-[9px] num-tabular" style={{ color: T.muted }}>{oct}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs italic mt-2" style={{ color: T.muted }}>
                Cada botón reproduce una nota del temperamento igual durante un segundo. Útil
                para comparar con armónicos o cantar contra el drone.
              </p>
            </div>

            {/* ── Botones de armónicos ── */}
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: T.muted }}>
                Armónicos del drone · H1 a H{MAX_HARMONIC_BUTTON}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                {Array.from({ length: MAX_HARMONIC_BUTTON }, (_, i) => {
                  const n = i + 1;
                  const info = HARMONIC_INFO[i];
                  const freq = droneFreq * n;
                  const noteApprox = harmonicNoteName(n, noteName, octave);
                  const centsET = info.centsFromET;
                  return (
                    <button key={n} onClick={() => playPreview(freq)} className="px-1 py-1.5 ab-fade"
                      style={{ border: `1px solid ${T.rule}`, borderRadius: '2px', backgroundColor: T.cream, textAlign: 'left' }}>
                      <div className="font-display italic text-sm" style={{ color: T.ink }}>H{n}</div>
                      <div className="text-[10px] opacity-80" style={{ color: T.inkSoft }}>{noteApprox}</div>
                      <div className="text-[9px] num-tabular" style={{ color: Math.abs(centsET) < 5 ? T.limeDeep : T.muted }}>
                        {centsET >= 0 ? '+' : ''}{centsET.toFixed(0)}¢
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs italic mt-2" style={{ color: T.muted }}>
                Cada botón reproduce el n-ésimo armónico del drone actual. Los cents indican
                cuánto se desvía cada armónico de la nota más cercana del temperamento igual.
                Por ejemplo H7 está −31¢ (muy bajo respecto al piano); H11 está casi a un cuarto
                de tono entre dos teclas (49¢).
              </p>
            </div>

            {/* Instrucciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
                <p className="font-display italic text-lg mb-3">Modo afinación</p>
                <ol className="text-sm leading-relaxed space-y-2" style={{ color: T.inkSoft }}>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>01</span>Elige un intervalo a la izquierda.</li>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>02</span>Mueve el control de cents lentamente.</li>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>03</span>El punto sin batimientos en el visualizador es la justa.</li>
                </ol>
              </div>
              <div className="p-5" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
                <p className="font-display italic text-lg mb-3">Afinadores con voz</p>
                <ol className="text-sm leading-relaxed space-y-2" style={{ color: T.inkSoft }}>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>01</span>Habilita el micrófono y usa audífonos.</li>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>02</span>Canta una nota sostenida.</li>
                  <li><span className="num-tabular mr-2" style={{ color: T.muted }}>03</span>Ambos afinadores te dicen en cuál afinación estás más cerca.</li>
                </ol>
              </div>
              <div className="p-5" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
                <p className="font-display italic text-lg mb-3">Sobre los timbres</p>
                <p className="text-sm leading-relaxed" style={{ color: T.inkSoft }}>
                  Los batimientos viven en los armónicos. Cambia de timbre durante un mismo
                  intervalo y notarás que algunos se vuelven imperceptibles: los instrumentos
                  con armónicos pobres &laquo;ocultan&raquo; los problemas de afinación.
                </p>
              </div>
            </div>

            <p className="text-xs italic" style={{ color: T.muted }}>
              Audífonos o monitores recomendados. Los batimientos viven en armónicos altos que
              las bocinas pequeñas no reproducen bien. Para los afinadores con voz, los audífonos
              además evitan que el micrófono capte el sonido del drone.
            </p>

          </div>
        </section>

        <footer className="text-center pt-10 mt-12" style={{ borderTop: `1px solid ${T.rule}` }}>
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: T.muted }}>
            Método Aural · Taller de batimientos
          </p>
        </footer>

      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  VISUALIZADOR FIJO INFERIOR                              */}
      {/* ════════════════════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          backgroundColor: T.cream,
          borderTop: `1px solid ${T.rule}`,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex flex-col flex-shrink-0" style={{ minWidth: '120px' }}>
              <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: T.muted }}>
                Visualizador
              </p>
              <p className="font-display italic text-sm" style={{ color: T.ink }}>
                Batimientos en vivo
              </p>
              <p className="text-[10px] num-tabular" style={{ color: T.muted }}>
                {Math.round(beatCenterFreq)} Hz
              </p>
            </div>
            <div className="relative flex-1" style={{
              border: `1px solid ${T.rule}`, borderRadius: '2px', overflow: 'hidden',
              boxShadow: isLocked && isPlaying ? `inset 0 0 0 2px ${T.lime}` : 'none',
            }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: '120px', display: 'block' }} />
              {isLocked && isPlaying && (
                <div className="absolute top-2 right-2 pulse-lock px-2 py-1 text-[10px] tracking-[0.2em] uppercase"
                  style={{ backgroundColor: T.limeDeep, color: T.cream, borderRadius: '2px' }}>
                  Encaje puro
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SUBCOMPONENTES: afinadores
// ════════════════════════════════════════════════════════════════════

function TunerStrip({ cents, label, sublabel, hint, accent }) {
  // cents puede ser null; range de visualización ±50
  const valid = cents !== null && cents !== undefined && !isNaN(cents);
  const clamped = valid ? Math.max(-TUNER_RANGE_CENTS, Math.min(TUNER_RANGE_CENTS, cents)) : 0;
  const linePct = 50 + (clamped / TUNER_RANGE_CENTS) * 50;
  const inTune = valid && Math.abs(cents) < 5;
  const accentColor = accent || T.ink;

  return (
    <div style={{
      backgroundColor: T.cream,
      border: `1px solid ${T.rule}`,
      borderRadius: '2px',
      padding: '8px 10px',
      minHeight: '92px',
    }}>
      {!valid ? (
        <div className="flex items-center justify-center" style={{ minHeight: '76px' }}>
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
            <p className="text-[10px] mb-2" style={{ color: T.muted }}>{sublabel}</p>
          )}
          <div className="relative" style={{
            height: '24px',
            background: `linear-gradient(to right,
              ${T.warn}33 0%, ${T.warn}22 35%,
              ${inTune ? T.limeDeep : T.rule}44 45%, ${inTune ? T.limeDeep : T.rule}66 50%, ${inTune ? T.limeDeep : T.rule}44 55%,
              ${T.warn}22 65%, ${T.warn}33 100%)`,
            border: `1px solid ${T.rule}`,
            borderRadius: '2px',
          }}>
            <div style={{
              position: 'absolute', left: '50%', top: 0, bottom: 0,
              width: '1px', backgroundColor: T.muted, opacity: 0.4,
            }} />
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

function JustTunerDisplay({ result, micEnabled, fundamentalName, fundamentalOctave, freq }) {
  if (!micEnabled) {
    return <TunerStrip cents={null} hint="Afinador justo — activa el micrófono" />;
  }
  if (!freq || !result) {
    return <TunerStrip cents={null} hint="Afinador justo — canta una nota sostenida" />;
  }
  const noteApprox = harmonicNoteName(result.n, fundamentalName, fundamentalOctave);
  return (
    <TunerStrip
      cents={result.cents}
      label={`H${result.n} · ${noteApprox}`}
      sublabel={`${result.harmonicFreq.toFixed(1)} Hz · armónico ${result.n} de ${fundamentalName}${fundamentalOctave}`}
      accent={T.limeDeep}
    />
  );
}

function ETTunerDisplay({ result, micEnabled, freq }) {
  if (!micEnabled) {
    return <TunerStrip cents={null} hint="Afinador temperado — activa el micrófono" />;
  }
  if (!freq || !result) {
    return <TunerStrip cents={null} hint="Afinador temperado — canta una nota sostenida" />;
  }
  return (
    <TunerStrip
      cents={result.cents}
      label={`${result.name}${result.octave}`}
      sublabel={`${freq.toFixed(1)} Hz · nota más cercana en 12-TET`}
      accent={T.ink}
    />
  );
}
