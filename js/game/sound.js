/* ============================================================
   sound.js — soft sounds of the cell world (4 Nov 2026), made in the browser (Web Audio), so no recording needs a licence.
   OFF until the pupil presses 🔈 Sound (a classroom is not a place for surprise noise); the choice is kept
   (cellgame.sound). A chime when a place wakes, a sparkle when something reaches the bag, a quiet low hum of the cell.
   ============================================================ */
const R = window.REV;
let ctx = null, master = null, hum = null, on = !!R.store.get('sound', false);

function start() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
  /* the hum: two low notes a fifth apart, slowly breathing */
  hum = ctx.createGain(); hum.gain.value = 0.0; hum.connect(master);
  [110, 165].forEach((f, i) => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = ctx.createGain(); g.gain.value = i ? 0.05 : 0.08; o.connect(g).connect(hum); o.start(); });
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.08; lg.gain.value = 0.03; lfo.connect(lg).connect(hum.gain); lfo.start();
}
function note(freq, t0, dur, vol = 0.18, type = 'triangle') {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  o.connect(g).connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
}
export const sound = {
  get on() { return on; },
  set(v) {
    on = v; R.store.set('sound', v);
    if (v) { start(); if (ctx.state === 'suspended') ctx.resume(); hum.gain.setTargetAtTime(0.6, ctx.currentTime, 1.2); }
    else if (ctx) hum.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
  },
  /* a place wakes: a rising arpeggio */
  wake() { if (!on || !ctx) return; const t = ctx.currentTime; [523.3, 659.3, 784, 1046.5].forEach((f, i) => note(f, t + i * 0.09, 1.1, 0.12)); },
  /* something reaches the bag */
  gain() { if (!on || !ctx) return; const t = ctx.currentTime; note(1318.5, t, 0.5, 0.09, 'sine'); note(1975.5, t + 0.07, 0.6, 0.06, 'sine'); },
  /* a wrong choice: one low soft note */
  no() { if (!on || !ctx) return; note(196, ctx.currentTime, 0.45, 0.1, 'sine'); }
};
