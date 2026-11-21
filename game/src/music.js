// Coastal synth music for Costa Palma: a slow original chord loop played
// by scheduled WebAudio notes — no melody is borrowed from anywhere.
// Intensity rises with the wanted level (a faster pulse joins in).
export function createMusic(audio) {
  const chords = [
    [261.6, 329.6, 392.0],
    [220.0, 261.6, 329.6],
    [174.6, 220.0, 261.6],
    [196.0, 246.9, 293.7],
  ];
  const bass = [130.8, 110.0, 87.3, 98.0];
  let timer = null;
  let step = 0;
  let intensity = 0;
  let running = false;

  function playNote(freq, dur, vol, type) {
    try {
      const c = audio.ctx ? audio.ctx() : null;
      if (!c) return;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(vol, c.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + dur + 0.05);
    } catch (err) { /* music never blocks the game */ }
  }

  return {
    setIntensity(v) { intensity = v; },
    start() {
      if (running) return;
      running = true;
      timer = setInterval(() => {
        if (!audio.ctx || !audio.ctx()) return;
        const chord = chords[Math.floor(step / 4) % chords.length];
        const root = bass[Math.floor(step / 4) % bass.length];
        if (step % 4 === 0) playNote(root, 1.9, 0.09, 'sine');
        const note = chord[step % 3];
        playNote(note * 2, 0.5, 0.045, 'triangle');
        if (intensity > 0.4 && step % 2 === 0) playNote(note * 4, 0.16, 0.03, 'square');
        step += 1;
      }, 460);
    },
    stop() {
      running = false;
      if (timer) clearInterval(timer);
      timer = null;
    },
  };
}
