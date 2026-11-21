// Procedural WebAudio sound for Costa Palma: no audio files, every effect
// is a small oscillator or noise burst built at boot and played on demand.
export function createAudio() {
  let ctx = null;
  let engineOsc = null;
  let engineGain = null;
  let sirenOsc = null;
  let sirenGain = null;
  let sirenTimer = null;
  let muted = false;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      engineOsc = ctx.createOscillator();
      engineOsc.type = 'sawtooth';
      engineOsc.frequency.value = 55;
      engineGain = ctx.createGain();
      engineGain.gain.value = 0;
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 420;
      engineOsc.connect(filt);
      filt.connect(engineGain);
      engineGain.connect(ctx.destination);
      engineOsc.start();
    } catch (err) {
      ctx = null;
    }
    return ctx;
  }

  function blip(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    try {
      if (c.state === 'suspended') c.resume();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, c.currentTime);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
      g.gain.setValueAtTime(vol || 0.12, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + dur);
    } catch (err) { /* sound is garnish, never fatal */ }
  }

  function noiseBurst(dur, vol, low) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    try {
      if (c.state === 'suspended') c.resume();
      const len = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource();
      src.buffer = buf;
      const filt = c.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = low || 900;
      const g = c.createGain();
      g.gain.value = vol || 0.2;
      src.connect(filt);
      filt.connect(g);
      g.connect(c.destination);
      src.start();
    } catch (err) { /* ignore */ }
  }

  return {
    unlock() { ensure(); },
    ctx() { return ensure(); },
    setEngine(speed01, on) {
      const c = ensure();
      if (!c || !engineOsc) return;
      const target = on ? 0.05 + speed01 * 0.06 : 0;
      engineGain.gain.setTargetAtTime(target, c.currentTime, 0.1);
      engineOsc.frequency.setTargetAtTime(52 + speed01 * 130, c.currentTime, 0.08);
    },
    honk() { blip(370, 0.28, 'square', 0.1); blip(466, 0.28, 'square', 0.08); },
    shot() { noiseBurst(0.12, 0.28, 2400); blip(180, 0.08, 'square', 0.1, 60); },
    punch() { noiseBurst(0.09, 0.22, 500); },
    coin() { blip(880, 0.1, 'sine', 0.14); blip(1320, 0.16, 'sine', 0.12); },
    pickup() { blip(660, 0.09, 'sine', 0.12); blip(990, 0.14, 'sine', 0.1); },
    explosion() { noiseBurst(0.7, 0.4, 320); blip(70, 0.5, 'sine', 0.3, 30); },
    step() { noiseBurst(0.05, 0.05, 300); },
    missionDone() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.22, 'triangle', 0.14), i * 110)); },
    siren(on) {
      const c = ensure();
      if (!c) return;
      if (on && !sirenOsc) {
        sirenOsc = c.createOscillator();
        sirenOsc.type = 'sine';
        sirenGain = c.createGain();
        sirenGain.gain.value = 0.045;
        sirenOsc.connect(sirenGain);
        sirenGain.connect(c.destination);
        sirenOsc.start();
        let hi = false;
        sirenTimer = setInterval(() => {
          if (!sirenOsc) return;
          hi = !hi;
          sirenOsc.frequency.setTargetAtTime(hi ? 880 : 620, c.currentTime, 0.05);
        }, 420);
      } else if (!on && sirenOsc) {
        clearInterval(sirenTimer);
        sirenTimer = null;
        try { sirenOsc.stop(); } catch (err) { /* ignore */ }
        sirenOsc.disconnect();
        sirenOsc = null;
      }
    },
    toggleMute() { muted = !muted; return muted; },
  };
}
