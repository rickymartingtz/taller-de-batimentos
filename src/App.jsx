import React, { useState, useEffect, useRef, useCallback } from 'react';

// ────────────────────────────────────────────────────────────────────
// Datos
// ────────────────────────────────────────────────────────────────────

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

const TIMBRES = [
  { id: 'sawtooth', name: 'Sierra',     desc: 'Todos los armónicos. Batimientos nítidos en cualquier intervalo.',  voiceGain: 0.16 },
  { id: 'square',   name: 'Cuadrada',   desc: 'Solo armónicos impares (clarinete). Algunos intervalos no baten.',  voiceGain: 0.10 },
  { id: 'triangle', name: 'Triangular', desc: 'Impares con caída rápida (flauta). Batimientos sutiles.',           voiceGain: 0.20 },
  { id: 'sine',     name: 'Senoidal',   desc: 'Tono puro sin armónicos. La afinación se vuelve invisible al oído.', voiceGain: 0.22 },
  { id: 'organ',    name: 'Órgano',     desc: 'Aditiva con armónicos 1°-8°. Sustentada, rica.',                     voiceGain: 0.14 },
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
const noteToSemis = (name) => ALL_KEYS.find(k => k.name === name).semis;
const noteFreq = (name, octave) => 440 * Math.pow(2, (noteToSemis(name) + 12 * (octave - 4)) / 12);

const SLIDER_RANGE = 60;
const ENVELOPE_BUFFER_LEN = 240;
const MIN_OCT = 2;
const MAX_OCT = 5;

// Paleta Método Aural (fondo más claro, más cerca del blanco)
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

// ────────────────────────────────────────────────────────────────────
// Componente
// ────────────────────────────────────────────────────────────────────

export default function AfinacionActiva() {
  const [intervalIdx, setIntervalIdx] = useState(3);
  const [noteName, setNoteName] = useState('A');
  const [octave, setOctave] = useState(3);
  const [centsOffset, setCentsOffset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [timbre, setTimbre] = useState('sawtooth');

  const [currentAB, setCurrentAB] = useState(null);
  const [autoAB, setAutoAB] = useState(false);
  const [autoIntervalMs, setAutoIntervalMs] = useState(2000);

  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const beatBandpassRef = useRef(null);
  const beatAnalyserRef = useRef(null);
  const droneVoiceRef = useRef(null);
  const varVoiceRef = useRef(null);

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
  // Voice creation
  // ──────────────────────────────────────────────────────────────────

  const createVoiceFor = useCallback((freq) => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    const bandpass = beatBandpassRef.current;
    if (!ctx || !master || !bandpass) return null;

    const cfg = TIMBRES.find(t => t.id === timbre);

    const voiceGain = ctx.createGain();
    voiceGain.gain.value = cfg.voiceGain;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = adaptiveLpFreq;
    filter.Q.value = 0.5;

    filter.connect(voiceGain);
    voiceGain.connect(master);
    voiceGain.connect(bandpass);

    const oscillators = [];

    if (timbre === 'organ') {
      const harmonics = [
        { mult: 1, gain: 0.55 },
        { mult: 2, gain: 0.40 },
        { mult: 3, gain: 0.32 },
        { mult: 4, gain: 0.24 },
        { mult: 5, gain: 0.18 },
        { mult: 6, gain: 0.14 },
        { mult: 7, gain: 0.10 },
        { mult: 8, gain: 0.08 },
      ];
      harmonics.forEach(h => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq * h.mult;
        const hg = ctx.createGain();
        hg.gain.value = h.gain;
        osc.connect(hg);
        hg.connect(filter);
        osc.start();
        oscillators.push({ osc, hg, mult: h.mult });
      });
    } else {
      const osc = ctx.createOscillator();
      osc.type = timbre;
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start();
      oscillators.push({ osc, mult: 1 });
    }

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
        oscillators.forEach(o => {
          try { o.osc.stop(); } catch (e) {}
        });
        try { filter.disconnect(); } catch (e) {}
        try { voiceGain.disconnect(); } catch (e) {}
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

    droneVoiceRef.current = createVoiceFor(droneFreq);
    varVoiceRef.current = createVoiceFor(variableFreq);
  }, [droneFreq, variableFreq, beatCenterFreq, createVoiceFor]);

  // ──────────────────────────────────────────────────────────────────
  // Animation
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

    ctx.fillStyle = lockedNow ? 'rgba(122,154,62,0.15)' : 'rgba(26,61,46,0.08)';
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
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
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

  // ──────────────────────────────────────────────────────────────────
  // Effects
  // ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
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
    if (bp && ctx) {
      bp.frequency.setTargetAtTime(beatCenterFreq, ctx.currentTime, 0.02);
    }
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
        ctxRef.current?.close();
      } catch (e) {}
    };
  }, []);

  // ──────────────────────────────────────────────────────────────────
  // A/B
  // ──────────────────────────────────────────────────────────────────

  const selectA = () => {
    setCentsOffset(parseFloat(justOffset.toFixed(3)));
    setCurrentAB('A');
  };
  const selectB = () => {
    setCentsOffset(0);
    setCurrentAB('B');
  };
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
      `}</style>

      <div className="max-w-4xl mx-auto px-6 py-10 md:py-14 font-body">

        {/* Cabecera */}
        <header className="mb-10 md:mb-14">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: T.muted }}>
                Método Aural
              </p>
              <h1 className="font-display text-4xl md:text-5xl leading-none italic" style={{ color: T.ink }}>
                Afinación activa
              </h1>
            </div>
            <p className="text-xs tracking-wide" style={{ color: T.muted }}>
              Taller de batimientos · entonación justa
            </p>
          </div>
          <div className="h-px mt-6" style={{ backgroundColor: T.rule }} />
        </header>

        {/* Intervalos */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: T.muted }}>
              Intervalo
            </p>
            <p className="text-[10px] italic" style={{ color: T.muted }}>
              clic para reproducir · clic en el activo para detener
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERVALS.map((iv, i) => {
              const active = i === intervalIdx;
              return (
                <button
                  key={iv.id}
                  onClick={() => handleIntervalClick(i)}
                  className="px-3 py-2 text-sm transition-all"
                  style={{
                    backgroundColor: active ? T.ink : 'transparent',
                    color: active ? T.cream : T.ink,
                    border: `1px solid ${active ? T.ink : T.rule}`,
                    borderRadius: '2px',
                  }}
                >
                  <span className="font-display italic text-base mr-2">{iv.name}</span>
                  <span className="text-xs opacity-70 num-tabular">{iv.ratio}</span>
                  {active && isPlaying && <span className="play-dot" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Drone */}
        <section className="mb-8">
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
            <div className="relative flex-1" style={{ minWidth: '280px', maxWidth: '440px', height: '110px' }}>
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
                      <span
                        className="absolute bottom-2 left-1/2 font-display text-base"
                        style={{ transform: 'translateX(-50%)', color: T.ink, fontWeight: active ? 600 : 400 }}
                      >
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
                      width: `${blackW}%`,
                      top: 0,
                      height: '62%',
                      backgroundColor: active ? T.limeDeep : T.ink,
                      border: `1px solid ${T.ink}`,
                      zIndex: 10,
                      borderRadius: '0 0 2px 2px',
                    }}
                  >
                    <span
                      className="absolute bottom-1 left-1/2 text-[9px]"
                      style={{
                        transform: 'translateX(-50%)',
                        color: active ? T.ink : T.cream,
                        fontWeight: 500,
                      }}
                    >
                      {k.display}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col items-center justify-center" style={{ minWidth: '90px' }}>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: T.muted }}>
                Octava
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOctave(o => Math.max(MIN_OCT, o - 1))}
                  disabled={octave <= MIN_OCT}
                  className="w-8 h-8 text-lg"
                  style={{
                    border: `1px solid ${T.rule}`,
                    color: octave <= MIN_OCT ? T.rule : T.ink,
                    backgroundColor: 'transparent',
                  }}
                >−</button>
                <span className="font-display text-3xl num-tabular w-8 text-center">{octave}</span>
                <button
                  onClick={() => setOctave(o => Math.min(MAX_OCT, o + 1))}
                  disabled={octave >= MAX_OCT}
                  className="w-8 h-8 text-lg"
                  style={{
                    border: `1px solid ${T.rule}`,
                    color: octave >= MAX_OCT ? T.rule : T.ink,
                    backgroundColor: 'transparent',
                  }}
                >+</button>
              </div>
            </div>
          </div>
        </section>

        {/* Timbre */}
        <section className="mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: T.muted }}>
            Timbre del sintetizador
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {TIMBRES.map(t => {
              const active = t.id === timbre;
              return (
                <button
                  key={t.id}
                  onClick={() => setTimbre(t.id)}
                  className="px-4 py-2 text-sm ab-fade"
                  style={{
                    backgroundColor: active ? T.ink : 'transparent',
                    color: active ? T.cream : T.ink,
                    border: `1px solid ${active ? T.ink : T.rule}`,
                    borderRadius: '2px',
                  }}
                >
                  <span className="font-display italic text-base">{t.name}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs italic" style={{ color: T.muted }}>
            {currentTimbre.desc}
          </p>
        </section>

        {/* Visualizador */}
        <section className="mb-4">
          <div
            className="relative ab-fade"
            style={{
              border: `1px solid ${T.rule}`,
              borderRadius: '2px',
              overflow: 'hidden',
              boxShadow: isLocked && isPlaying ? `inset 0 0 0 2px ${T.lime}` : 'none',
            }}
          >
            <canvas ref={canvasRef} style={{ width: '100%', height: '180px', display: 'block' }} />
            {isLocked && isPlaying && (
              <div
                className="absolute top-3 right-3 pulse-lock px-2 py-1 text-[10px] tracking-[0.2em] uppercase"
                style={{ backgroundColor: T.limeDeep, color: T.cream, borderRadius: '2px' }}
              >
                Encaje puro
              </div>
            )}
          </div>
        </section>

        {/* Comparación A/B */}
        <section
          className="mb-8 p-4"
          style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}
        >
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={selectA}
              className="py-3 px-4 ab-fade text-left"
              style={{
                backgroundColor: currentAB === 'A' ? T.limeDeep : T.cream,
                color: currentAB === 'A' ? T.cream : T.ink,
                border: `1px solid ${currentAB === 'A' ? T.limeDeep : T.rule}`,
                borderRadius: '2px',
                boxShadow: currentAB === 'A' ? '0 4px 12px rgba(122,154,62,0.25)' : 'none',
              }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase opacity-70">
                A {currentAB === 'A' && '◉'}
              </p>
              <p className="font-display text-xl italic">Justa</p>
              <p className="text-[10px] num-tabular opacity-80">
                {justOffset >= 0 ? '+' : ''}{justOffset.toFixed(2)} cents
              </p>
            </button>
            <button
              onClick={selectB}
              className="py-3 px-4 ab-fade text-left"
              style={{
                backgroundColor: currentAB === 'B' ? T.ink : T.cream,
                color: currentAB === 'B' ? T.cream : T.ink,
                border: `1px solid ${currentAB === 'B' ? T.ink : T.rule}`,
                borderRadius: '2px',
                boxShadow: currentAB === 'B' ? '0 4px 12px rgba(26,61,46,0.2)' : 'none',
              }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase opacity-70">
                B {currentAB === 'B' && '◉'}
              </p>
              <p className="font-display text-xl italic">Temperado</p>
              <p className="text-[10px] num-tabular opacity-80">0.00 cents</p>
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs">
            <button
              onClick={() => handleAutoToggle(!autoAB)}
              className="flex items-center gap-2 cursor-pointer select-none"
              style={{ background: 'none', border: 'none', padding: 0, color: T.ink }}
            >
              <span
                className="w-4 h-4 inline-flex items-center justify-center ab-fade"
                style={{
                  backgroundColor: autoAB ? T.ink : 'transparent',
                  border: `1px solid ${T.ink}`,
                  borderRadius: '2px',
                }}
              >
                {autoAB && <span style={{ color: T.cream, fontSize: '10px', lineHeight: 1 }}>✓</span>}
              </span>
              <span>Alternar automáticamente</span>
            </button>

            <div className="flex items-center gap-1">
              {[1000, 2000, 3000, 4000].map(ms => {
                const active = autoIntervalMs === ms;
                return (
                  <button
                    key={ms}
                    onClick={() => setAutoIntervalMs(ms)}
                    disabled={!autoAB}
                    className="px-2 py-1 num-tabular ab-fade"
                    style={{
                      color: !autoAB ? T.rule : (active ? T.cream : T.muted),
                      backgroundColor: active && autoAB ? T.ink : 'transparent',
                      border: `1px solid ${active && autoAB ? T.ink : T.rule}`,
                      borderRadius: '2px',
                      cursor: autoAB ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {ms / 1000}s
                  </button>
                );
              })}
            </div>

            {autoAB && isPlaying && (
              <span className="italic" style={{ color: T.limeDeep }}>↻ alternando…</span>
            )}
            {autoAB && !isPlaying && (
              <span className="italic" style={{ color: T.muted }}>inicia el audio</span>
            )}
          </div>
        </section>

        {/* Slider — Ajuste fino */}
        <section className="mb-10">
          <div className="flex justify-between items-baseline mb-3">
            <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: T.muted }}>
              Ajuste fino · cents desde temperado igual
            </p>
            <p className="text-xs num-tabular" style={{ color: T.muted }}>
              ±{SLIDER_RANGE} cents
            </p>
          </div>

          <div className="relative pt-6 pb-8">
            <div
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${justMarkerPct}%`, transform: 'translateX(-50%)' }}
            >
              <span
                className="text-[10px] tracking-[0.15em] uppercase mb-0.5 px-1.5 py-0.5"
                style={{ backgroundColor: T.limeDeep, color: T.cream, borderRadius: '1px' }}
              >
                Justa
              </span>
              <div style={{ width: '1px', height: '8px', backgroundColor: T.limeDeep }} />
            </div>
            <div
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${etMarkerPct}%`, transform: 'translateX(-50%)' }}
            >
              <span className="text-[10px] tracking-[0.15em] uppercase mb-0.5" style={{ color: T.muted }}>
                ET
              </span>
              <div style={{ width: '1px', height: '8px', backgroundColor: T.muted, marginTop: '8px' }} />
            </div>

            <input
              type="range"
              min={-SLIDER_RANGE}
              max={SLIDER_RANGE}
              step={0.1}
              value={centsOffset}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="cents-slider w-full"
            />

            <div className="flex justify-between mt-2 text-[10px] num-tabular" style={{ color: T.muted }}>
              <span>−{SLIDER_RANGE}</span>
              <span>0</span>
              <span>+{SLIDER_RANGE}</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              { label: '−1',   delta: -1 },
              { label: '−0.1', delta: -0.1 },
              { label: 'cero', delta: null },
              { label: '+0.1', delta: 0.1 },
              { label: '+1',   delta: 1 },
            ].map((b, i) => (
              <button
                key={i}
                onClick={() => handleSliderChange(
                  b.delta === null ? 0 : parseFloat((centsOffset + b.delta).toFixed(2))
                )}
                className="px-3 py-1.5 text-xs num-tabular"
                style={{ color: T.muted, border: `1px solid ${T.rule}`, borderRadius: '2px' }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </section>

        {/* Lecturas */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: T.muted }}>
              Batimientos
            </p>
            <p className="font-display text-3xl num-tabular" style={{ color: isLocked ? T.limeDeep : T.ink }}>
              {computedBeatRate < 0.05 ? '0.00' : computedBeatRate.toFixed(2)}
              <span className="text-sm ml-1 opacity-60">Hz</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: T.muted }}>
              Cents (vs ET)
            </p>
            <p className="font-display text-3xl num-tabular">
              {centsOffset >= 0 ? '+' : ''}{centsOffset.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: T.muted }}>
              Distancia a justa
            </p>
            <p className="font-display text-3xl num-tabular" style={{ color: isNearLock ? T.limeDeep : T.ink }}>
              {distanceToJust >= 0 ? '+' : ''}{distanceToJust.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: T.muted }}>
              Frecuencia variable
            </p>
            <p className="font-display text-3xl num-tabular">
              {variableFreq.toFixed(2)}
              <span className="text-sm ml-1 opacity-60">Hz</span>
            </p>
          </div>
        </section>

        {/* Transporte */}
        <section className="flex items-center gap-6 flex-wrap mb-10">
          <button
            onClick={handleTogglePlay}
            className="px-8 py-3 text-sm tracking-wider uppercase ab-fade"
            style={{
              backgroundColor: isPlaying ? 'transparent' : T.ink,
              color: isPlaying ? T.ink : T.cream,
              border: `1px solid ${T.ink}`,
              borderRadius: '2px',
              minWidth: '160px',
            }}
          >
            {isPlaying ? '■  Detener' : '▶  Iniciar'}
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-[280px]">
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: T.muted }}>
              Vol
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="vol-slider flex-1"
            />
            <span className="text-xs num-tabular w-8 text-right" style={{ color: T.muted }}>
              {Math.round(volume * 100)}
            </span>
          </div>
        </section>

        {/* Instrucciones */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
            <p className="font-display italic text-lg mb-3">Afinación activa</p>
            <ol className="text-sm leading-relaxed space-y-2" style={{ color: T.inkSoft }}>
              <li><span className="num-tabular mr-2" style={{ color: T.muted }}>01</span>Mueve el control de cents lentamente.</li>
              <li><span className="num-tabular mr-2" style={{ color: T.muted }}>02</span>Encuentra el punto sin batimientos: ahí está la justa.</li>
              <li><span className="num-tabular mr-2" style={{ color: T.muted }}>03</span>Vuelve a cero. Compara con el temperado.</li>
            </ol>
          </div>
          <div className="p-5" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
            <p className="font-display italic text-lg mb-3">Comparación A / B</p>
            <ol className="text-sm leading-relaxed space-y-2" style={{ color: T.inkSoft }}>
              <li><span className="num-tabular mr-2" style={{ color: T.muted }}>01</span>Pulsa A o B mirando el visualizador.</li>
              <li><span className="num-tabular mr-2" style={{ color: T.muted }}>02</span>Atiende a la fusión, no a la altura.</li>
              <li><span className="num-tabular mr-2" style={{ color: T.muted }}>03</span>Activa &laquo;automático&raquo; para escuchar sin tocar.</li>
            </ol>
          </div>
          <div className="p-5" style={{ backgroundColor: T.paper, borderLeft: `2px solid ${T.ink}`, borderRadius: '1px' }}>
            <p className="font-display italic text-lg mb-3">Sobre los timbres</p>
            <p className="text-sm leading-relaxed" style={{ color: T.inkSoft }}>
              Los batimientos viven en los armónicos. Cambia de timbre durante un mismo intervalo y notarás que algunos se vuelven imperceptibles: los instrumentos con armónicos pobres &laquo;ocultan&raquo; los problemas de afinación.
            </p>
          </div>
        </section>

        <p className="text-xs italic mb-8" style={{ color: T.muted }}>
          Audífonos o monitores recomendados.
        </p>

        <footer className="text-center pt-6" style={{ borderTop: `1px solid ${T.rule}` }}>
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: T.muted }}>
            Método Aural · Taller de afinación
          </p>
        </footer>

      </div>
    </div>
  );
}
