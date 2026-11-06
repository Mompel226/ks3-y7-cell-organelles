/* ============================================================
   sound.js — the music and the sounds of the cell world (4 Nov 2026).
   OFF until the pupil presses 🔈 Sound (a classroom is not a place for surprise noise); the choice is kept
   (cellgame.sound). Pressed on, it chimes at once, so the pupil knows it works.
   - The music: three pieces by the film composer Scott Buckley, each released under CC BY 4.0 (credited in the page's
     footer and the README), played in turn, fading in, a background for reading: "The Distant Sun" ("all journeys
     start here"), "Adrift Among Infinite Stars", "Penumbra" (18 minutes, then again). Daniel, 4 Nov 2026: "it's more
     like a space journey … magical in the sense of how it makes you feel, not necessarily by the tones … it needs to
     make you goosebumps"; he listened, and chose them over music made in the page ("a children's story"). tools/music.py
     made them small (sounds/music-*.m4a, each fetched only when its turn comes) and gave each the gain that brings it to
     the same quiet level (sounds/music.json). It waits while the page is hidden, and goes on from where it was.
   - The music waits for the dive (Daniel: "the music should only start when you are in 3D and you dive in. Not
     before"): pressed on during the pictures, Sound only chimes; the music begins at ✦ Dive in (allowMusic, from
     main.js, inside the press, so the browser lets it play), or at once when the intro is already behind the pupil.
   - The sounds of the game, over the music, are real recordings too (the Versilian Community Sample Library, CC0;
     tools/sounds.py, every note tuned): a bell's faint twinkle at each press on the cell, rubbed glasses swelling when a
     place wakes, two bells when something reaches the bag, one low harp note for a wrong choice. Tones stand in only
     while they load.
   A browser lets a page make sound only after a press: when the sound was left on, it starts at the pupil's first press.
   ============================================================ */
const R = window.REV;
const V = '?v=202611060935';                                        /* the page's version (tools/stamp.mjs) */
let ctx = null, master = null, fx = null, musicBus = null, on = !!R.store.get('sound', false), allowed = false;

/* a space for the game's sounds: a soft stereo echo of noise that fades away (made here) */
function room(seconds = 2.6) {
  const n = Math.round(ctx.sampleRate * seconds), buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
  const c = ctx.createConvolver(); c.buffer = buf; return c;
}
function start() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  ctx = new AC();
  /* a gentle limiter at the end: nothing ever clips */
  const limit = ctx.createDynamicsCompressor(); limit.threshold.value = -6; limit.knee.value = 6; limit.ratio.value = 8; limit.attack.value = 0.003; limit.release.value = 0.25;
  master = ctx.createGain(); master.gain.value = 0.85; master.connect(limit).connect(ctx.destination);
  musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
  fx = ctx.createGain(); const echo = room(), wet = ctx.createGain(); wet.gain.value = 0.45;
  fx.connect(master); fx.connect(echo).connect(wet).connect(master);
  loadBank(); loadList();
  return true;
}
const wakeUp = () => { if (ctx && ctx.state === 'suspended') ctx.resume(); };
const play = f => { if (!on || !ctx) return; wakeUp(); f(ctx.currentTime); };

/* ---------- the music: the pieces in turn ---------- */
let list = null, listing = null, el = null, piece = 0, gainNode = null, fading = null;
function loadList() {
  if (listing) return listing;
  listing = fetch('sounds/music.json' + V).then(r => r.json()).then(j => { list = j.pieces; }).catch(() => { list = []; });
  return listing;
}
/* one <audio> for every piece (a phone lets a page play again what it once played from a press), into the music's gain */
function player() {
  if (el) return el;
  el = new Audio(); el.preload = 'auto';
  gainNode = ctx.createGain(); ctx.createMediaElementSource(el).connect(gainNode).connect(musicBus);
  el.addEventListener('ended', () => { piece = (piece + 1) % list.length; cue(); if (on && allowed && !document.hidden) el.play().catch(() => {}); });
  return el;
}
function cue() { const p = list[piece]; el.src = 'sounds/' + p.file + V; gainNode.gain.value = p.gain; }
function musicOn() {
  if (!ctx || !allowed || !on) return;
  if (!list) { loadList().then(() => musicOn()); return; }
  if (!list.length) return;
  clearTimeout(fading);
  const a = player();
  if (!a.src) cue();
  a.play().catch(() => {});
  musicBus.gain.cancelScheduledValues(ctx.currentTime); musicBus.gain.setTargetAtTime(1, ctx.currentTime, 1.2);   /* a slow fade in */
}
function musicOff() {
  if (!ctx) return;
  musicBus.gain.cancelScheduledValues(ctx.currentTime); musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
  clearTimeout(fading); fading = setTimeout(() => { if (el && !(on && allowed && !document.hidden)) el.pause(); }, 1400);   /* it goes on from here next time */
}
/* the list of pieces is read with the page (a small file), so that the press on ✦ Dive in can itself start the music:
   a phone plays music only from a press */
loadList();
/* a hidden page waits: no music behind another tab */
document.addEventListener('visibilitychange', () => { if (!on || !ctx) return; if (document.hidden) { musicOff(); } else { wakeUp(); musicOn(); } });

/* ---------- the game's sounds: real recordings ---------- */
let bank = null, loading = null;                                    /* bank: { glock, glass, harp: [{ m, buf }], chimes: [buf] } */
function loadBank() {
  if (loading || !ctx) return loading;
  loading = fetch('sounds/notes.json' + V).then(r => r.json()).then(async j => {
    const out = { harp: [], glock: [], glass: [], chimes: [] };
    await Promise.all(Object.entries(j.notes).map(async ([name, n]) => {
      const buf = await ctx.decodeAudioData(await (await fetch('sounds/' + name + '.m4a' + V)).arrayBuffer());
      if (n.kind === 'chimes') out.chimes.push(buf); else out[n.kind].push({ m: n.midi + n.cents / 100, buf });
    }));
    ['harp', 'glock', 'glass'].forEach(k => out[k].sort((a, b) => a.m - b.m));
    bank = out;
  }).catch(() => {});
  return loading;
}
/* one note from a recording: the nearest one, tuned to the note; a swell and a fade when a length is given */
function sample(kind, midi, t0, vol, o = {}) {
  const set = bank && bank[kind]; if (!set || !set.length) return false;
  let s = set[0]; for (const x of set) if (Math.abs(x.m - midi) < Math.abs(s.m - midi)) s = x;
  const src = ctx.createBufferSource(), g = ctx.createGain(), rate = Math.pow(2, (midi - s.m) / 12);
  src.buffer = s.buf; src.playbackRate.value = rate;
  const a = o.attack || 0.004, natural = s.buf.duration / rate, len = Math.min(o.len || natural, natural);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + a);
  if (o.len) { g.gain.setValueAtTime(vol, t0 + Math.max(a, len - (o.release || 1))); g.gain.linearRampToValueAtTime(0, t0 + len); }
  src.connect(g);
  if (ctx.createStereoPanner && o.pan) { const p = ctx.createStereoPanner(); p.pan.value = o.pan; g.connect(p).connect(fx); } else g.connect(fx);
  src.start(t0); src.stop(t0 + len + 0.05);
  return true;
}
function chimes(t0, vol) {
  if (!bank || !bank.chimes.length) return;
  const src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = bank.chimes[Math.floor(Math.random() * bank.chimes.length)]; g.gain.value = vol;
  src.connect(g).connect(fx); src.start(t0);
}
/* the tones that stand in while the recordings load */
function note(freq, t0, dur, vol = 0.18, type = 'sine') {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  o.connect(g).connect(fx); o.start(t0); o.stop(t0 + dur + 0.05);
}

/* left on from an earlier visit: start at the first press (pointer or key) */
if (on) {
  const first = () => { removeEventListener('pointerdown', first, true); removeEventListener('keydown', first, true); if (on && start()) { wakeUp(); musicOn(); } };
  addEventListener('pointerdown', first, true); addEventListener('keydown', first, true);
}
export const sound = {
  get on() { return on; },
  set(v) {
    on = v; R.store.set('sound', v);
    if (v) {
      if (!start()) return; wakeUp(); musicOn();
      play(t => { if (!sample('glock', 91, t, 0.07)) note(1568, t, 0.8, 0.07); chimes(t + 0.05, 0.06); });
    } else musicOff();
  },
  /* the pupil is in the 3D game: the music may play (at ✦ Dive in, inside its press) */
  allowMusic() { allowed = true; if (on && ctx) { wakeUp(); musicOn(); } },
  /* for the checks (tools/sound-check.mjs): is the music playing, which piece, how far, and are the recordings in? */
  get state() {
    return { on, allowed, ctx: ctx ? ctx.state : 'none', music: !!(el && !el.paused && allowed), piece: list && el && el.src ? list[piece].title : '',
      time: el ? +el.currentTime.toFixed(1) : 0, pieces: list ? list.length : 0, recordings: bank ? bank.harp.length + bank.glock.length + bank.glass.length + bank.chimes.length : 0 };
  },
  /* for the checks: the sound as it leaves (to measure its level), and the music's player (to try the end of a piece) */
  get output() { return master; },
  get player() { return el; },
  /* a press on the cell (a button on a part): a bell's faint twinkle, far away */
  tap() { play(t => sample('glock', 96, t, 0.035, { pan: (Math.random() - 0.5) * 0.6 }) || note(2093, t, 0.3, 0.03)); },
  /* a place wakes: rubbed glasses swell, one after another, and the wind chimes answer */
  wake() { play(t => { if (!bank) return [523.3, 659.3, 784].forEach((f, i) => note(f, t + i * 0.12, 1.4, 0.08)); [74, 78, 81, 86].forEach((m, i) => sample('glass', m, t + i * 0.14, 0.07, { attack: 0.35, len: 2.6, release: 1.6, pan: [-0.4, 0.4, -0.15, 0.15][i] })); chimes(t + 0.3, 0.05); }); },
  /* something reaches the bag: two bells */
  gain() { play(t => { if (!(sample('glock', 91, t, 0.06) && sample('glock', 96, t + 0.08, 0.05))) { note(1568, t, 0.5, 0.06); note(2093, t + 0.08, 0.6, 0.05); } }); },
  /* a wrong choice: one low, soft harp note */
  no() { play(t => sample('harp', 55, t, 0.12) || note(196, t, 0.45, 0.08)); }
};
