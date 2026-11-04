/* ============================================================
   sound.js — the sounds and the music of the cell world (4 Nov 2026), made in the browser (Web Audio), so no recording
   needs a licence and nothing is downloaded.
   OFF until the pupil presses 🔈 Sound (a classroom is not a place for surprise noise); the choice is kept
   (cellgame.sound). Pressed on, it chimes at once, so the pupil knows it works.
   - Music for reading (Daniel, 4 Nov 2026: "nice music, fantasy music … that plays well when you're just still reading"):
     slow, quiet and never the same twice: soft chords that change every 8 seconds (D major: I, vi, IV, V, with added
     notes), a harp that plays their notes, now and then a bell, all in a gentle echo. It waits while the page is hidden.
   - Sounds of the game, over the music: a soft tap at each press on the cell, a chime when a place wakes, a sparkle when
     something reaches the bag, one low note for a wrong choice.
   A browser lets a page make sound only after a press: when the sound was left on, it starts at the pupil's first press.
   ============================================================ */
const R = window.REV;
let ctx = null, master = null, musicBus = null, echo = null, on = !!R.store.get('sound', false);

/* the echo: a short stereo room of soft noise that fades away (made here, nothing loaded) */
function room(seconds = 3.2) {
  const n = Math.round(ctx.sampleRate * seconds), buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2); }
  const c = ctx.createConvolver(); c.buffer = buf; return c;
}
function start() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
  musicBus = ctx.createGain(); musicBus.gain.value = 0;
  echo = room(); const wet = ctx.createGain(); wet.gain.value = 0.55;
  musicBus.connect(master); musicBus.connect(echo).connect(wet).connect(master);
  return true;
}
const wakeUp = () => { if (ctx && ctx.state === 'suspended') ctx.resume(); };
function note(freq, t0, dur, vol = 0.18, type = 'triangle', out = master) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  o.connect(g).connect(out); o.start(t0); o.stop(t0 + dur + 0.05);
}
const play = f => { if (!on || !ctx) return; wakeUp(); f(ctx.currentTime); };

/* ---------- the music ---------- */
const hz = m => 440 * Math.pow(2, (m - 69) / 12);                  /* a MIDI note number to its frequency */
/* each chord: its low notes for the pad, and the notes the harp may play (D major: Dmaj9, Bm11, Gmaj7#11, A add9) */
const CHORDS = [
  { pad: [50, 57, 66, 73], harp: [62, 66, 69, 73, 76, 78, 81] },
  { pad: [47, 54, 62, 69], harp: [59, 62, 66, 69, 71, 74, 76] },
  { pad: [43, 50, 59, 66], harp: [62, 66, 67, 71, 73, 74, 79] },
  { pad: [45, 52, 61, 68], harp: [61, 64, 66, 69, 71, 73, 76] }
];
const BAR = 8;                                                     /* seconds a chord lasts */
let timer = null, nextBar = 0, chordAt = 0, harpAt = 0, step = 0, bellAt = 0;
function padChord(c, t0) {
  /* two soft voices a little out of tune with each other, through a gentle filter: a slow swell, then a slow fade */
  c.pad.forEach((m, i) => [-4, 4].forEach(cents => {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = i ? 'triangle' : 'sine'; o.frequency.value = hz(m); o.detune.value = cents;
    f.type = 'lowpass'; f.frequency.value = 1100; f.Q.value = 0.3;
    const v = (i ? 0.026 : 0.04);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + 2.6); g.gain.setValueAtTime(v, t0 + BAR - 1.2); g.gain.linearRampToValueAtTime(0, t0 + BAR + 2.4);
    o.connect(f).connect(g).connect(musicBus); o.start(t0); o.stop(t0 + BAR + 2.6);
  }));
}
function harp(m, t0, vol) {
  /* a plucked string: the note and its octave, quickly up, slowly away */
  note(hz(m), t0, 2.4, vol, 'triangle', musicBus); note(hz(m + 12), t0, 1.3, vol * 0.28, 'sine', musicBus);
}
function bell(m, t0) { note(hz(m), t0, 4.5, 0.035, 'sine', musicBus); note(hz(m) * 2.76, t0, 2.2, 0.012, 'sine', musicBus); }
/* the music is written a little ahead of the clock, every quarter of a second */
function schedule() {
  if (!ctx || !on) return;
  const ahead = ctx.currentTime + 1.2;
  while (nextBar < ahead) {
    const c = CHORDS[chordAt % CHORDS.length]; padChord(c, nextBar);
    /* the harp: a gentle pattern on the chord's notes, half a second apart, with rests, different every time */
    for (let k = 0; k < BAR * 2; k++) {
      if (Math.random() < 0.32) continue;
      const up = (step++ % 14) < 7, i = up ? k % c.harp.length : c.harp.length - 1 - (k % c.harp.length);
      harp(c.harp[Math.max(0, Math.min(c.harp.length - 1, i + (Math.random() < 0.2 ? 1 : 0)))], nextBar + k * 0.5 + Math.random() * 0.03, 0.05 + Math.random() * 0.025);
    }
    if (bellAt-- <= 0) { bell(c.harp[c.harp.length - 1] + 12, nextBar + 3 + Math.random() * 3); bellAt = 1 + Math.floor(Math.random() * 2); }
    nextBar += BAR; chordAt++;
  }
}
function musicOn() {
  if (!ctx) return;
  if (!timer) { nextBar = ctx.currentTime + 0.3; timer = setInterval(schedule, 250); schedule(); }
  musicBus.gain.cancelScheduledValues(ctx.currentTime); musicBus.gain.setTargetAtTime(1, ctx.currentTime, 1.5);
}
function musicOff() {
  if (timer) { clearInterval(timer); timer = null; }
  if (ctx) { musicBus.gain.cancelScheduledValues(ctx.currentTime); musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.4); }
}
/* a hidden page waits: no music behind another tab */
document.addEventListener('visibilitychange', () => { if (!on || !ctx) return; if (document.hidden) { musicOff(); ctx.suspend(); } else { wakeUp(); musicOn(); } });

/* left on from an earlier visit: start at the first press (pointer or key) */
if (on) {
  const first = () => { removeEventListener('pointerdown', first, true); removeEventListener('keydown', first, true); if (on && start()) { wakeUp(); musicOn(); } };
  addEventListener('pointerdown', first, true); addEventListener('keydown', first, true);
}
export const sound = {
  get on() { return on; },
  set(v) {
    on = v; R.store.set('sound', v);
    if (v) { if (!start()) return; wakeUp(); musicOn(); play(t => { note(784, t, 0.6, 0.14); note(1174.7, t + 0.08, 0.7, 0.1); }); }
    else musicOff();
  },
  /* for the checks (tools/sound-check.mjs): is the music running, and how far has it been written? */
  get state() { return { on, ctx: ctx ? ctx.state : 'none', music: !!timer, bars: chordAt, written: nextBar && ctx ? +(nextBar - ctx.currentTime).toFixed(2) : 0 }; },
  /* a press on the cell (a button on a part) */
  tap() { play(t => note(880, t, 0.18, 0.06, 'sine')); },
  /* a place wakes: a rising arpeggio */
  wake() { play(t => [523.3, 659.3, 784, 1046.5].forEach((f, i) => note(f, t + i * 0.09, 1.1, 0.12))); },
  /* something reaches the bag */
  gain() { play(t => { note(1318.5, t, 0.5, 0.09, 'sine'); note(1975.5, t + 0.07, 0.6, 0.06, 'sine'); }); },
  /* a wrong choice: one low soft note */
  no() { play(t => note(196, t, 0.45, 0.1, 'sine')); }
};
