/* ============================================================
   main.js — the Y7 cell game starts here (4 Nov 2026): the world, its names, the quest panel and the places.
   A place wakes (its mist clears, a ring of light turns round it) when the pupil carries what it needs; on the map each
   place has its name on a level line and its state; pressing it (on the cell, its name, or the list in the panel)
   flies there and opens its steps.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { World, MAP_VIEW } from '../world/world.js?v=202611282133';
import { Names } from './names.js?v=202611282133';
import { Quest, MAPPED, isAre } from './quest.js?v=202611282133';
import { makePlay } from './play.js?v=202611282133';
import { setStill, wait } from './actors.js?v=202611282133';
import { state, RESPIRE } from './state.js?v=202611282133';
import { ICON } from './icons.js?v=202611282133';
import { intro } from './intro.js?v=202611282133';
import { sound } from './sound.js?v=202611282133';
import { openFinal, finalCode, finalOpen } from './final.js?v=202611282133';
import { fromRecord } from './restore.js?v=202611282133';
import { setCourse, level } from './iblevel.js?v=202611282133';
import { closeViews } from './digestview.js?v=202611282133';

const R = window.REV, { $, $$, h, esc } = R;
const STORY = window.STORY;
/* the IB pass (js/ibpass.js; Daniel, 15 Nov 2026): a signed-in Year 12 or 13 pupil, or a teacher */
const ibPass = () => !!(window.IBPASS && window.IBPASS.on());
let gameOn = false;          /* the game has begun (start, below): the IB map and its addresses wait for it */
const stage = $('#stage');
let world;
try { world = new World($('#world'), { still: R.FAST, quality: R.params.get('quality') || '' }); }
catch (e) {
  $('#loading').innerHTML = '<p><b>This computer cannot draw the 3D cell.</b> Try another browser (Chrome, Edge or Safari), or another computer.</p>';
  throw e;
}
setStill(R.FAST, R.CALM);
const names = new Names(world, $('#names'));
const quest = new Quest({ world, names, panel: $('#quest'), hots: $('#hots'), bag: $('#bag'), onPlace: go });
const play = makePlay(world, quest);
window.CELLGAME = { world, quest, state, go, sound, dive: () => play.dive(), flow: () => play.flow(), flowCheck: () => play.flowCheck(), mito: () => play.mito(), nuc: () => play.nuc(), rib: () => play.rib(), ser: () => play.ser(), rer: () => play.rer(), gol: () => play.gol(), trk: () => play.trk(), exo: () => play.exo(), dig: () => (testZoom ? testZoom.state() : null), cardsBad: () => play.cardsBad() };
/* the nucleus is closed until the pupil has first been inside it (play.js dive; a game saved before 8 Nov 2026 that has
   been inside opens as it did) */
world.setNucleus(state.flag('in-nucleus'));

/* ---------- what is solid (names behind it are hidden) ---------- */
const WG = world.W.groups;
world.solids = [world.W.nucleus.outerEnv, ...WG.rer.children.filter(m => m.name.startsWith('rer') && !m.isInstancedMesh), ...WG.golgi.children.filter(m => m.name.startsWith('golgi')),
  ...WG.mitochondria.children, WG.ser];

/* ---------- each place's look and its name on the map ---------- */
function looks() {
  /* before the map (the start), every place is simply there to see: nothing sleeps yet. Done (✦) is the jobs AND every
     check right (state.complete) */
  const map = state.complete('arrive') || (ibPass() && quest.cur !== 'arrive');
  MAPPED.forEach(id => world.setPlace(id, !map ? 'idle' : state.complete(id) ? 'done' : state.awake(id) ? 'open' : 'sleep', { instant: !looks.ran }));
  looks.ran = true;
}
function mapNames() {
  /* the nucleolus is inside the nucleus: named only once the nucleus is open (closed, nothing inside it can be seen) */
  names.set(MAPPED.filter(id => id !== 'nucleolus' || world.nucOpen).map(id => {
    const P = world.P[id], awake = state.awake(id), done = state.complete(id);
    return {
      key: id, spots: P.spots, own: P.groups.map(g => WG[g]).filter(Boolean).concat(id === 'nucleolus' ? [world.W.nucleus.group] : []),
      /* on a phone the mitochondrion you visit lies small among other names: its name may stand on another one (the
         middle of its centre line), still one mitochondrion */
      alt: id === 'mito' ? world.W.mito.list.map(m => { const c = m.shape.paths[0], v = c[Math.floor(c.length / 2)]; return new THREE.Vector3(v[0], v[1], v[2]).applyQuaternion(m.q).add(m.pos); }) : null,
      cls: done ? 'is-done' : awake ? 'is-open' : 'is-asleep',
      /* asleep: muted, with a dashed edge; what it needs is in the panel's list, and shows when the name is pressed */
      /* the name on the picture says what its line ends on: one mitochondrion, one ribosome, one microtubule (Daniel,
         5 Nov 2026: "if you're pointing to one mitochondrion, label it mitochondrion, not mitochondria"); the list keeps
         each place's own title */
      html: `<span class="nm__t">${esc(STORY[id].onPic || STORY[id].title).replace(': ', ':<br>')}</span>${done ? '<span class="nm__s">✦</span>' : ''}`,
      label: STORY[id].title + (done ? ': done' : awake ? ': awake' : ': asleep'),
      press: () => (awake || done) ? go(id) : (quest.whyAsleep(id, $(`[data-go="${id}"]`, $('#quest'))), toast(`<b>${esc(STORY[id].title)}</b> ${isAre(id)} asleep: see what it needs in the list.`))
    };
  }), [$('.hud')]);
}
/* a place pressed on the cell or its name; it lights under the mouse only when that press would go there (world.js) */
world.canPress = () => !quest.cur && !busy;
world.on('press', id => { if (!id || quest.cur) return; go(id); });
/* (when the IB pass comes during play, every place wakes at once: the box at the top of the map says so, and no
   message a place stands over the picture: ibChanged) */
let wakeQuiet = false;
world.on('woke', id => { if (wakeQuiet) return; toast(`<b>${esc(STORY[id].title)}</b> ${isAre(id)} awake.`); sound.wake(); });

/* ---------- 🔈 Sound (off until pressed) and ⛶ Full screen ---------- */
/* every Sound button (the tools' one, and the intro card's: during the intro the tools are under it) says the same */
/* on a phone only the icon shows (the words stay, for a screen reader: .tool__w) */
const paintSound = () => $$('[data-sound]').forEach(b => { b.setAttribute('aria-pressed', String(sound.on)); b.innerHTML = sound.on ? '🔊<span class="tool__w"> Sound on</span>' : '🔈<span class="tool__w"> Sound off</span>'; });
document.addEventListener('click', e => { if (e.target.closest('[data-sound]')) { sound.set(!sound.on); paintSound(); } });
paintSound();
const fb = $('#btnFull');
if (!document.fullscreenEnabled) fb.hidden = true;
/* full screen is the whole page, with the stage filling the screen (css/game.css): with the stage alone in full screen,
   the browser drew nothing outside it, so a word's meaning, the word bank, the final check and a dragged card never showed
   (Daniel, 5 Nov 2026: "I tried to click but nothing appeared") */
fb.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); });
document.addEventListener('fullscreenchange', () => { fb.innerHTML = document.fullscreenElement ? '⛶<span class="tool__w"> Leave full screen</span>' : '⛶<span class="tool__w"> Full screen</span>'; setTimeout(setInset, 100); });
/* the music waits for the dive into the 3D cell (sound.js) */
document.addEventListener('cellgame:dive', () => sound.allowMusic());

/* ---------- going to a place, or back to the map ---------- */
let busy = false;
async function go(id, stay) {
  if (busy) return;
  nextOff();
  if (id === 'final') { openFinal(); return; }
  if (id !== 'test') $('#test').hidden = true;
  /* the IB pass: a pupil may leave the first place before its end, where only the Year 7 structures are drawn
     (world.simple): on the map and in every other place, every structure is drawn again */
  if (ibPass() && id !== 'arrive' && world.isSimple) world.simple(false);
  if (!id) { world.wayIn(false); world.setFrame(0); busy = true; play.reset(); quest.openMap(); setInset(); await world.flyTo(MAP_VIEW, { isMap: true }); looks(); mapNames(); busy = false; return; }
  /* (the test too: it had been let through here whatever the pupil carried; the list's own button was the only guard: the
     order audit, 12 Nov 2026) */
  if (!state.awake(id)) { quest.openMap(); quest.whyAsleep(id, $(`[data-go="${id}"]`, $('#quest'))); return; }
  /* the IB pass: only the Year 7 structures drawn again when the pupil comes back to the first place before its end, as
     at the start (the other half is above, before the map) */
  if (ibPass() && id === 'arrive' && !world.isSimple && !state.done('arrive') && state.step('arrive') < 2) world.simple(true);
  if (ibPass() && id) ibFill(id);
  /* stay: the place set up again after a step was watched again; in a close view the camera stays there (play.js reset) */
  const held = !!stay && id === quest.cur && play.close();
  busy = true; names.set([]); play.reset(held);
  /* the way in shows its membrane bigger, as two layers of lipids (world.wayIn); every other place, the thin film */
  world.wayIn(id === 'wayin');
  /* a pupil returns to the mitochondria for more energy, or to the way in for more glucose and oxygen: the finished place
     opens with one press for it (quest.js moreBox, 'place-more' below), never every step again (the audit, 11 Nov 2026) */
  setInset();
  if (id === 'test') { busy = false; return test(); }
  /* the first place is not a place of the map (it has no view of its own): it is set up again where the camera is.
     Before 12 Nov 2026 this line was missing, so after ↻ on one of its steps the game stopped here with an error: the
     step's button had gone and nothing came back (Daniel, from a lesson: "he's stuck") */
  /* (the IB pass: a pupil may come back to the first place from another place before its end; its steps are drawn on
     the whole cell, where the dive leaves the camera at the start, so the camera goes there first) */
  if (id === 'arrive' && ibPass() && quest.cur !== 'arrive' && !state.done('arrive')) { world.setFrame(0); await world.flyTo(MAP_VIEW, { isMap: true }); }
  if (id === 'arrive') { busy = false; await quest.openPlace('arrive', (name) => play.run(name)); looks(); arriveNames(); return; }
  const P = world.P[id];
  world.setFrame(P.view.frameH || 0);
  if (!held) world.flyTo(P.view);
  busy = false;
  await quest.openPlace(id, (name) => play.run(name));
  looks();
}
/* the first place keeps every structure named while its checks are answered, also after a step watched again or when the
   game is opened again there (12 Nov 2026: a pupil could not answer them, the names had gone) */
function arriveNames() { if (quest.cur === 'arrive' && (state.done('arrive') || state.step('arrive') >= 2)) play.arriveNames(); }
/* the IB pass: going into a place, the pupil is given what it uses that the bag does not hold (its needs, and the rough
   ER's lipids for its last step: play.js bud), so a place can be done in any order; the energy bar is filled again when a
   job needs more (quest.js energy). Said in a short message. */
const USES = { rer: ['lipids'] };
function ibFill(id) {
  const P = STORY[id]; if (!P) return;
  const given = (P.needs || []).concat(USES[id] || []).filter(n => n !== 'energy' && window.ITEMS[n] && !state.has(n));
  given.forEach(n => state.add(n));
  if (given.length) toast(`IB: you are given what this place needs: ${given.map(n => '<b>' + esc(window.ITEMS[n].name) + '</b>').join(', ').replace(/, ([^,]*)$/, ' and $1')}.`, 5200);
}
/* a return visit's one press (quest.js moreBox): the way in gives two glucose and two oxygen again, as its steps did; the
   mitochondria use one of each and release energy, as their last step did (play.js release: RESPIRE). Each item flies
   to the bag from the place, so the pupil sees where it came from */
document.addEventListener('place-more', async e => {
  const { id, done } = e.detail || {}; if (quest.cur !== id) return;
  const from = world.P[id] ? world.P[id].center : null;
  if (id === 'wayin') {
    if (!state.has('glucose')) await quest.gain('glucose', from, 2);
    if (!state.has('oxygen')) await quest.gain('oxygen', from, 2);
  } else if (id === 'mito' && state.has('glucose') && state.has('oxygen')) {
    state.use('glucose'); state.use('oxygen');
    await quest.gain('energy', from, RESPIRE);
  }
  looks(); if (done) done();
});
/* ↻ beside a finished step (quest.js againBtn): that step plays again by itself (play.js watch); then the place is set up
   again as when the pupil comes back to it, at the step they were on (Daniel, 9 Nov 2026) */
let watchingNow = false;
document.addEventListener('step-again', async e => {
  const { id, i, li } = e.detail || {};
  if (busy || watchingNow || quest.cur !== id) return;
  watchingNow = true;
  document.documentElement.classList.add('is-watching');
  let back = false;
  try { back = await play.watch(id, i, li, !!(e.detail && e.detail.map)); } finally { watchingNow = false; document.documentElement.classList.remove('is-watching'); }
  /* (a step played from the IB map: the student is back at their own step; the bar keeps the way back to the map) */
  if (e.detail && e.detail.map && quest.ibFrom && quest.ibFrom.id === id && quest.ibFrom.i === i) quest.ibFrom.own = true;
  if (back && quest.cur === id) go(id, true);
  /* (another step of the topic was pressed on the bar while this one played: main.js 'ib-land') */
  const next = ibNext; ibNext = null;
  if (next && quest.cur === id) ibLandSoon(id, next);
});
/* Hide text / Show text: the panel goes, so that only the picture shows, in the middle (Daniel, 8 Nov 2026: "if the
   students want to have everything centered and no text on the right to see just basically the image and see the
   animations, the students should be able to do so"); while it is hidden, the button glows when the panel gets
   something new (a step, a message, a question) */
const qHide = $('#qHide'), panelOff = () => $('#stage').classList.contains('qp-off');
qHide.addEventListener('click', () => {
  const off = !panelOff(); $('#stage').classList.toggle('qp-off', off);
  qHide.setAttribute('aria-expanded', String(!off)); qHide.textContent = off ? 'Show text' : 'Hide text'; qHide.classList.remove('is-new');
  setInset();
});
new MutationObserver(() => { if (panelOff()) qHide.classList.add('is-new'); }).observe($('#quest'), { childList: true, subtree: true, characterData: true });
/* a job stopped for energy while the text is hidden (quest.js energy): said on the picture too */
document.addEventListener('low-energy', () => { if (panelOff()) toast('<b>Not enough energy for this job.</b> Press <b>Show text</b> to see what to do.'); });
function setInset() {
  const s = world.size, panel = $('#quest');
  $('#stage').style.setProperty('--qh', panel.offsetHeight + 'px');   /* on a phone, Hide text stands just above the panel */
  $('#stage').style.setProperty('--hudh', $('.hud').offsetHeight + 'px');   /* and a message just under the corner box */
  if (panelOff()) world.setInset({});
  else if (s.w > 860) world.setInset({ right: panel.offsetWidth + 24 }); else world.setInset({ bottom: Math.min(panel.offsetHeight, s.h * 0.5) });
}
addEventListener('resize', () => setTimeout(setInset, 50));
/* the panel's size follows what it holds (on a phone it is a sheet as tall as its words, up to half the stage), and it is
   empty, so hidden, until the first place opens: the free part of the picture follows it, once a frame at most */
let insetSoon = false;
new ResizeObserver(() => { if (insetSoon) return; insetSoon = true; requestAnimationFrame(() => { insetSoon = false; setInset(); }); }).observe($('#quest'));
new ResizeObserver(() => $('#stage').style.setProperty('--hudh', $('.hud').offsetHeight + 'px')).observe($('.hud'));

/* a short message at the top of the world */
function toast(html, ms = 3200) {
  const t = h('div', { class: 'toast' + (ms > 3200 ? ' toast--long' : ''), role: 'status' }, html); $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), ms); setTimeout(() => t.remove(), ms + 700);
}
state.on(() => { if (!quest.cur) mapNames(); });
/* a place finished (its jobs and every check right): what it gave wakes the next places now */
document.addEventListener('place-complete', () => { looks(); if (!quest.cur) mapNames(); });
/* the final check closed: the list of places says how it went */
document.addEventListener('final-closed', () => { if (!quest.cur && state.done('arrive')) quest.openMap(); });

/* ---------- the test: amylase on starch, in a spotting tile ---------- */
let testZoom = null;   /* the test's close views while they stand (digestview.js); for the checks: CELLGAME.dig */
async function test() {
  const box = $('#test'); box.hidden = false; testZoom = null;
  /* (18 Nov 2026, the places planner's plan-test, its parts for every pupil: each liquid is seen entering its well, as
     drops from a pipette; each well has a name on a line, which says what is in it now; the iodine solution falls as a
     drop, and the blue-black spreads from where it fell; a key says what each colour means, in the words of the test
     (0610 4.1.3); the tile stays whole in view until the pupil presses on. Before: a pale ring round a well, both wells
     changing colour at once, and the end card pushing the tile out of the box while its result was read) */
  box.innerHTML = `<figure class="tile"><svg viewBox="0 0 600 348" role="img" aria-label="A white spotting tile with two wells. Each holds starch solution.">
    <defs><clipPath id="cwA"><circle cx="190" cy="160" r="50"/></clipPath><clipPath id="cwB"><circle cx="410" cy="160" r="50"/></clipPath></defs>
    <rect x="30" y="60" width="540" height="200" rx="26" fill="#F4F6F8" stroke="#B8C2CC" stroke-width="3"/>
    <g id="wA"><circle cx="190" cy="160" r="62" fill="#E2E8EE" stroke="#AEB8C2" stroke-width="3"/><circle class="liq" cx="190" cy="160" r="50" fill="#F3F1EA"/><circle class="spr" cx="190" cy="150" r="0" clip-path="url(#cwA)"/></g>
    <g id="wB"><circle cx="410" cy="160" r="62" fill="#E2E8EE" stroke="#AEB8C2" stroke-width="3"/><circle class="liq" cx="410" cy="160" r="50" fill="#F3F1EA"/><circle class="spr" cx="410" cy="150" r="0" clip-path="url(#cwB)"/></g>
    <text x="190" y="44" text-anchor="middle" font-size="26" font-weight="800" fill="#E8EDF4">A: saliva</text><text x="410" y="44" text-anchor="middle" font-size="26" font-weight="800" fill="#E8EDF4">B: water (control)</text>
    <g id="pip" visibility="hidden"><rect x="-6" y="-14" width="12" height="66" rx="3" fill="#DCE6F0" stroke="#8D99A6" stroke-width="2"/><path d="M-6 52 L0 70 L6 52 Z" fill="#DCE6F0" stroke="#8D99A6" stroke-width="2"/></g>
    <circle id="drop" r="7" visibility="hidden" stroke="#5B6672" stroke-width="1.5"/>
    <g class="tile__nm"><line x1="190" y1="224" x2="190" y2="276" stroke="#E8EDF4" stroke-width="2"/><text id="nmA" x="190" y="297" text-anchor="middle" font-size="20" font-weight="700" fill="#E8EDF4">starch solution</text></g>
    <g class="tile__nm"><line x1="410" y1="224" x2="410" y2="276" stroke="#E8EDF4" stroke-width="2"/><text id="nmB" x="410" y="297" text-anchor="middle" font-size="20" font-weight="700" fill="#E8EDF4">starch solution</text></g>
    <text id="clock" x="300" y="334" text-anchor="middle" font-size="22" fill="#C9D4E0"></text>
    <g id="key" visibility="hidden" font-size="15.5" font-weight="700" fill="#E8EDF4"><circle cx="19" cy="328" r="8.5" fill="#C8701E" stroke="#F4F6F8" stroke-width="3"/><text x="35" y="333.5">stays orange-brown: no starch</text><circle cx="296" cy="328" r="8.5" fill="#1B1D3A" stroke="#F4F6F8" stroke-width="3"/><text x="312" y="333.5">turns blue-black: starch is present</text></g></svg>
    <figcaption>Starch solution in two wells of a spotting tile. Iodine solution turns blue-black when starch is present.</figcaption></figure>`;
  const liq = id => $(`#${id} .liq`, box), spr = id => $(`#${id} .spr`, box);
  /* with a course on, a close view under each well (digestview.js): what happens in the well during its five minutes */
  const lvOn = c => !!document.querySelector(`#quest .qp__lv [data-lv="${c}"][aria-pressed="true"]`);
  const zoomOn = () => (lvOn('igcse') || lvOn('ib') ? (testZoom = closeViews($('svg', box), { igcse: lvOn('igcse'), ib: lvOn('ib'), hl: lvOn('ib') && level() === 'hl' })) : null);
  const name = (id, t) => { $('#' + id, box).textContent = t; };
  /* n drops from a pipette into the well at x, one after another, each seen falling (0.3 s) */
  const drops = async (x, color, n, s0) => {
    const pip = $('#pip', box), d = $('#drop', box); if (!pip || !d || R.FAST) return;
    pip.setAttribute('transform', `translate(${x} 0)`); pip.setAttribute('visibility', 'visible'); d.setAttribute('fill', color); d.setAttribute('cx', x);
    for (let i = 0; i < n && quest.session === s0; i++) {
      const t0 = performance.now(); d.setAttribute('visibility', 'visible');
      await new Promise(res => { const f = () => { const k = Math.min(1, (performance.now() - t0) / 300); d.setAttribute('cy', 76 + 74 * k * k); if (k < 1 && d.isConnected) requestAnimationFrame(f); else res(); }; f(); });
      d.setAttribute('visibility', 'hidden'); await new Promise(res => setTimeout(res, 140));
    }
    pip.setAttribute('visibility', 'hidden');
  };
  /* a colour that spreads in a well from where the drop fell (ms), then the whole liquid has it */
  const spread = (id, hex, ms) => new Promise(res => { const c = spr(id), t0 = performance.now(); c.setAttribute('fill', hex);
    const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms); c.setAttribute('r', 104 * k); if (k < 1 && c.isConnected) requestAnimationFrame(f); else { liq(id).setAttribute('fill', hex); res(); } }; f(); });
  /* ↻ a step of the test watched again (18 Nov 2026; the test had no ↻, and a pupil gets the course switches only after
     its checks, so this is how they see the test with a course on): the tile as it stood before that step. play.js
     watch plays the step (play.act gives it the test's three steps); nothing saved changes */
  const rewind = step => {
    box.scrollTo({ top: 0 }); const w = $('.win', box); if (w) w.style.display = 'none';
    if (testZoom) { testZoom.off(); testZoom = null; }
    const ge = $('.tile__ge', box); if (ge) ge.remove();
    ['wA', 'wB'].forEach(id => { liq(id).setAttribute('fill', '#F3F1EA'); spr(id).setAttribute('r', 0);
      if (step === 'wells') { liq(id).removeAttribute('stroke'); liq(id).removeAttribute('stroke-width'); } else { liq(id).setAttribute('stroke', '#BFF3FF'); liq(id).setAttribute('stroke-width', '6'); } });
    name('nmA', step === 'wells' ? 'starch solution' : 'saliva added'); name('nmB', step === 'wells' ? 'starch solution' : 'water added: the control');
    $('#key', box).setAttribute('visibility', 'hidden'); $('#clock', box).textContent = step === 'iodine' ? '5 minutes' : '';
  };
  const run = async (name0) => {
    const s0 = quest.session;
    if (quest.watchingNow()) rewind(name0);
    if (name0 === 'wells') {
      const a = h('button', { type: 'button', class: 'btn' }, 'Add saliva to well A'), b = h('button', { type: 'button', class: 'btn' }, 'Add water to well B');
      quest.step.do.append(a, b);
      /* (one pipette: the second liquid waits until the first is in) */
      let busy1 = Promise.resolve();
      const add = (btn, id, x, color, after) => new Promise(r => btn.addEventListener('click', () => { btn.disabled = true; busy1 = busy1.then(async () => { await drops(x, color, 3, s0); liq(id).setAttribute('stroke', '#BFF3FF'); liq(id).setAttribute('stroke-width', '6'); name(id === 'wA' ? 'nmA' : 'nmB', after); r(); }); }));
      if (quest.watchingNow()) { setTimeout(() => a.click(), R.TEST ? 0 : 900); setTimeout(() => b.click(), R.TEST ? 0 : 1500); }   /* (watched again: its two buttons press themselves) */
      await Promise.all([add(a, 'wA', 190, '#EAF4FF', 'saliva added'), add(b, 'wB', 410, '#CFEBFF', 'water added: the control')]);
      a.remove(); b.remove();
    } else if (name0 === 'wait') {
      /* (opened at this step by a pupil who came back: the wells already hold their liquids) */
      name('nmA', 'saliva added'); name('nmB', 'water added: the control');
      const z = zoomOn();   /* (the close views stand at their start before the clock runs) */
      /* (a phone: the box is shorter than the tile with its close views, so it scrolls to them, the clock at its top:
         the count and the equation then show while the five minutes pass; the iodine step scrolls back to the wells) */
      if (z) requestAnimationFrame(() => { const sv = $('svg', box), vb = sv && sv.viewBox.baseVal; if (!vb || box.scrollHeight <= box.clientHeight + 4) return;
        const r = sv.getBoundingClientRect(), b0 = box.getBoundingClientRect();   /* (an svg element has no offsetTop) */
        box.scrollTo({ top: Math.max(0, box.scrollTop + r.top - b0.top + r.height * 316 / vb.height - 6), behavior: R.FAST ? 'auto' : 'smooth' }); });
      await quest.next('Wait 5 minutes');
      const clock = $('#clock', box);
      /* (Reduce motion: two stills, not one: first the chain in the active site, just before its first cut, with its
         water molecule (IB); then the end. The third science read: with the end alone no cut and no water was seen) */
      if (R.FAST && z && z.still != null) { z.at(z.still); const m = Math.max(1, Math.round(z.still * 5)); clock.textContent = m + (m === 1 ? ' minute' : ' minutes'); await new Promise(res => setTimeout(res, 3500)); }   /* (3.5 s: time to read it) */
      const t0 = performance.now();
      await new Promise(res => {
        const f = () => {
          const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 4000);
          { const m = Math.round(k * 5); clock.textContent = m + (m === 1 ? ' minute' : ' minutes'); } if (z) z.at(k);
          if (k < 1) requestAnimationFrame(f); else res();
        };
        f();
      });
    } else if (name0 === 'iodine') {
      /* a drop of iodine solution in each well: it stays orange-brown where no starch is left (A), and turns blue-black
         where starch is present (B), from where the drop fell */
      name('nmA', 'saliva added'); name('nmB', 'water added: the control');
      if (!testZoom) { const z = zoomOn(); if (z) z.at(1); }   /* (opened at this step: the close views as they are after the five minutes) */
      await quest.next('Add iodine solution');
      $('#clock', box).textContent = ''; $('#key', box).setAttribute('visibility', 'visible'); box.scrollTo({ top: 0 });
      box.querySelectorAll('.zoom__link').forEach(l => l.setAttribute('visibility', 'hidden'));   /* (the key stands in the row that the dotted lines cross) */
      await drops(190, '#C8701E', 1, s0); await spread('wA', '#C8701E', 800);
      await drops(410, '#C8701E', 1, s0); await spread('wB', '#1B1D3A', 800);
      name('nmA', 'no starch left'); name('nmB', 'starch still present');
      /* IB at HL (D2.2.1): the whole journey in one row, under the result: the gene, its copy, its protein, and what the protein did */
      if (lvOn('ib') && level() === 'hl' && !$('.tile__ge', box)) $('figure.tile', box).insertBefore(h('p', { class: 'tile__ge', role: 'note' }, (a => `<b>gene expression:</b> <span>the amylase gene</span>${a('transcription')}<span>${ICON.mrna || ''}mRNA</span>${a('translation')}<span>${ICON.amylase || ''}amylase</span>${a('its effect')}<span>no starch left in well A</span>`)(w => `<span class="ge__a"><i>${w}</i><span aria-hidden="true">→</span></span>`)), $('figure.tile figcaption', box));   /* (right under the drawing: under the caption it stood below the box's edge) */
      $('svg', box).setAttribute('aria-label', 'A white spotting tile with two wells. Well A, with saliva, is orange-brown: no starch is left. Well B, with water, is blue-black: starch is still present.');
      /* (the tile stays whole in view while its result is read: the mission's end comes when the pupil presses on) */
      await quest.next('Finish the test');
      if (quest.session === s0) state.use('saliva');      /* never used up by a test the pupil left */
    }
  };
  ['wells', 'wait', 'iodine'].forEach(k => play.act(k, () => run(k)));
  const fin = quest.openPlace('test', run);
  await fin;
  /* the win, once every check of the test is right too: the mission is complete only then */
  if (!(await quest.whenComplete('test'))) return;
  /* the win: the whole journey, in the order the cell made it */
  const path = [['mrna', 'copy of the gene'], ['chain', 'ribosome'], ['amylase', 'rough ER'], ['packed', 'Golgi apparatus'], ['top', 'microtubules'], ['saliva', 'exocytosis']];
  const end = h('div', { class: 'win', role: 'status' }, `<div class="win__star">${ICON.star}</div><p class="win__t">Mission complete</p>
    <p>You made amylase in a cell of a salivary gland, released it, and it digested starch.</p>
    <div class="win__code"><p>Your code for the final check</p><p class="win__c">${esc(await finalCode())}</p>
      <p>Write it down. You need it to start the final check: press <b>✦ Final check</b> in the list of places, then type your code.</p></div>
    <div class="win__side"></div>
    <ol class="win__path">${path.map(([i, t]) => `<li>${ICON[i]}<span>${t}</span></li>`).join('')}</ol>
    <div class="win__acts"><button type="button" class="btn" data-back>Back to the cell</button><button type="button" class="btn ghost" data-final>✦ Final check</button></div>`);
  box.appendChild(end);
  /* on a phone the card had half of the screen and its buttons lay below the fold, a line under Hide text (the audit,
     11 Nov 2026): the text folds (Hide text's own way: Show text brings it back) and the card has the whole picture */
  const folded = world.size.w <= 860 && !panelOff(); if (folded) qHide.click();
  /* and the picture comes to the top of the screen, so that the whole card is in view (it stood partly below the fold) */
  if (world.size.w <= 860) requestAnimationFrame(() => $('#stage').scrollIntoView({ block: 'start' }));
  const unfold = () => { if (folded && panelOff()) qHide.click(); };
  /* the code must be seen: the box scrolls to the card (below the tile), the page does not move */
  box.scrollTo({ top: Math.max(0, end.offsetTop - 12), behavior: R.FAST ? 'auto' : 'smooth' });
  sound.wake();
  winNext(); setTimeout(() => nextUp('win'), R.FAST ? 0 : 1600);
  $('[data-back]', end).addEventListener('click', () => { box.hidden = true; unfold(); go(null); });
  $('[data-final]', end).addEventListener('click', async () => { box.hidden = true; unfold(); await go(null); openFinal({ focusCode: true }); });
}

/* ---------- See the real thing ---------- */
/* fetched the first time it is opened, not with the page (5 Nov 2026, speed: the lens brings the model loader, 113 KB) */
document.addEventListener('lens', e => import('./lens.js?v=202611282133').then(m => (typeof e.detail === 'string' ? m.openLens(e.detail) : m.openPicture(e.detail.title, e.detail.pic, e.detail.n))));   /* (an object: one real picture by itself, the Golgi's door) */
/* from a place's end: the nucleus's Explorer film (how a cell copies a gene); the way in's and the mitochondria's IB
   extension, "From glucose to ATP" (js/ib/view.js, over the whole page; it replaced the mitochondria's Explorer film,
   5 Nov 2026), which a door in a step's IB words also opens, at its chapter. The game's 3D rests while it is open. */
/* one view at a time: a second press while the first one's code was still coming had opened a second view over it (the
   audit, 5 Nov 2026) */
let opening = false;
/* (after: what to do when the view closes; a view opened from the IB map goes back to the map: ibBack, below) */
const openIB = (start, after) => {
  if (opening || memOpening || document.documentElement.classList.contains('ibv-open') || document.documentElement.classList.contains('memv-open')) return;
  opening = true;
  import('../ib/view.js?v=202611282133').then(m => {
    world.hold = true;
    m.openIB({ inGame: true, start, mark: start && start.mark, backLabel: after ? '← Back to the IB map' : undefined, onClose: () => { opening = false; world.hold = false; world.kick(); if (after) after(); else winNext(); } });
  }).catch(e => { opening = false; world.hold = false; world.kick(); console.error(e); });
};
/* when a place's IB switch first shows (quest.js), the view's code, styles and map are fetched while the pupil reads, so
   its doors then open at once; nothing of it is fetched before (Daniel: "loads when it should be loading, not before") */
let warmed = false;
document.addEventListener('ib-door', () => {
  if (warmed) return; warmed = true;
  import('../ib/view.js?v=202611282133').then(m => m.warm()).catch(() => { warmed = false; });
  import('../membrane/view.js?v=202611282133').then(m => m.warm()).catch(() => {});
});
document.addEventListener('explore', e => {
  if (e.detail === 'nucleus') import('./transcribe.js?v=202611282133').then(m => m.openCopyFilm({ last: 'Close' }));
  else if (e.detail === 'mito' || e.detail === 'wayin') openIB({ ci: e.detail === 'wayin' ? 1 : 0, si: 0 });
});
document.addEventListener('ibview', e => openIB({ ci: e.detail.ch, si: 0 }));
/* "The cell membrane: fluid and mosaic" (js/membrane/view.js, 13 Nov 2026; its own address: membrane/): a 3D patch of
   membrane at true sizes, whose phospholipids move in their own layer and whose proteins move more slowly, opened over
   the page by the door in the way in's first IB box (quest.js courseSwitch: 'memview'). One view at a time. */
let memOpening = false;
const openMem = (o = {}) => {
  const root = document.documentElement;
  if (memOpening || opening || root.classList.contains('memv-open') || root.classList.contains('ibv-open') || root.classList.contains('plv-open')) return;
  memOpening = true;
  import('../membrane/view.js?v=202611282133').then(m => {
    world.hold = true;
    m.openMembrane(Object.assign({ inGame: true, onClose: () => { memOpening = false; world.hold = false; world.kick(); if (o.after) o.after(); else winNext(); } },
      o.start != null ? { start: o.start, mark: o.mark } : {}, o.after ? { backLabel: '← Back to the IB map' } : {}));
  }).catch(e => { memOpening = false; world.hold = false; world.kick(); console.error(e); });
};
document.addEventListener('memview', () => openMem());
/* ---------------- what next: the game asks the pupil to explore everything (12 Nov 2026) ----------------
   Daniel: "When the students complete the main quest, if they have not completed the side quest, it should pop up … A
   message should pop up, complete now the side quest. And when they have completed the side quest, if they have not
   explored any of the IB extensions … still suggest … So the idea is to prompt the students to explore everything."
   Once the mission is complete (every check of the test right), what is left is offered, one thing at a time, in this
   order: the side quest, until its five checks are right; then the IB extension, "From glucose to ATP", until each of
   its eight parts has been opened (the view itself records how far each part was seen: store 'ib', max). It shows
   - on the Mission complete card, in its dashed box under the code (winNext);
   - as a small card over the free part of the picture (nextUp): as the Mission complete card comes, when the side quest
     closes, and once when the game is opened again; never over the Mission complete card itself (on a phone that card
     has the whole picture, and its code must be seen), and never twice for the same thing after Not now, until the
     page is opened again.
   The pupil decides: Not now closes it, and nothing in the game depends on it. */
const SIDE_QS = () => Object.keys(window.QS || {}).filter(k => window.QS[k].part === 14);
const sideDone = () => { const q = SIDE_QS(); return q.length > 0 && q.every(k => state.checkRight(k)); };
const IB_PARTS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'tally'];
const ibSeen = () => { const m = (R.store.get('ib', {}) || {}).max || {}; return IB_PARTS.filter(k => (m[k] || 0) > 0).length; };
/* how many questions of the final check are about the side quest (js/final-data.js `tag`): the cards that offer the side
   quest at the end of the mission say so (12 Nov 2026) */
const sideQs = () => ((window.FINAL || {}).qs || []).filter(q => q.tag === 'side').length;
function nextStep() {
  if (!state.complete('test')) return null;
  if (!sideDone()) return { key: 'side', k: 'Next: the side quest', t: 'Where does this glucose come from?',
    p: 'You have completed your mission. You have not completed the side quest yet. It is a second story, in a plant cell: follow glucose from a leaf to your cell.' + (sideQs() ? ` The final check has ${sideQs()} questions about it.` : ''),
    b: '🌱 Start the side quest', go: () => document.dispatchEvent(new CustomEvent('plant', { detail: { from: 'next' } })) };
  const n = ibSeen();
  if (n < IB_PARTS.length) return { key: 'ib', k: 'Next: the IB Biology extension', t: 'From glucose to ATP',
    p: 'You have completed your mission and the side quest. This extension is beyond Year 7: it shows, step by step, how a cell releases energy from glucose. ' + (n ? `You have opened ${n} of its ${IB_PARTS.length} parts.` : 'You have not opened it yet.'),
    b: n ? '🧬 Continue the IB extension' : '🧬 Open the IB extension', go: () => openIB(n ? null : { ci: 0, si: 0 }) };
  return null;
}
/* the dashed box of the Mission complete card */
function winNext() {
  const el = $('#test .win .win__side'); if (!el) return;
  const N = nextStep();
  el.classList.toggle('win__side--ib', !!N && N.key === 'ib'); el.classList.toggle('win__side--all', !N);
  if (!N) { el.innerHTML = '<p class="win__sidek">You have explored everything</p><p>The mission, the side quest and the IB extension.</p>'; return; }
  el.innerHTML = N.key === 'side'
    ? `<p class="win__sidek">Next · Side quest · extra: a plant cell, not part of your mission</p><p class="win__sidep">You have not completed it yet.${sideQs() ? ` The final check has ${sideQs()} questions about it.` : ''}</p><button type="button" class="btn win__plant" data-plant>🌱 Side quest: where does starch come from?</button>`
    : `<p class="win__sidek">${esc(N.k)} · beyond Year 7</p><p class="win__sidep">${esc(N.t)}. ${ibSeen() ? `You have opened ${ibSeen()} of its ${IB_PARTS.length} parts.` : 'You have not opened it yet.'}</p><button type="button" class="btn win__ib" data-ibnext>${esc(N.b)}</button>`;
  const ib = $('[data-ibnext]', el); if (ib) ib.addEventListener('click', () => { nextOff(); N.go(); });
  /* the door to the plant-cell branch (js/plant/view.js): the card stays as it is under the view, and is there again when
     the view closes (Daniel, 11 Nov 2026) */
  const pl = $('[data-plant]', el); if (pl) pl.addEventListener('click', () => { nextOff(); document.dispatchEvent(new CustomEvent('plant', { detail: { from: 'test' } })); });
}
/* the small card over the picture */
const NEXT = { no: new Set(), el: null };
function nextOff() { if (NEXT.el) { NEXT.el.remove(); NEXT.el = null; } }
function nextUp(from) {
  const N = nextStep(), root = document.documentElement;
  nextOff();
  if (!N || NEXT.no.has(N.key) || root.classList.contains('plv-open') || root.classList.contains('ibv-open') || root.classList.contains('memv-open')) return;
  /* a phone, the Mission complete card up: the card's own box says it (the card has the whole picture) */
  if (world.size.w <= 860 && !$('#test').hidden && $('#test .win')) return;
  const el = NEXT.el = h('div', { class: 'nextup nextup--' + N.key, role: 'dialog', 'aria-labelledby': 'nextupT' },
    `<p class="nextup__k">${esc(N.k)}</p><h2 id="nextupT" class="nextup__t">${esc(N.t)}</h2><p class="nextup__p">${esc(N.p)}</p>
     <div class="nextup__acts"><button type="button" class="btn nextup__go">${esc(N.b)}</button><button type="button" class="btn ghost nextup__no">Not now</button></div>`);
  /* in the middle of the free part of the picture (beside the panel, or above it on a phone) */
  const place = () => { el.style.left = ((world.size.w - (world.inset.right || 0)) / 2) + 'px'; el.style.top = ((world.size.h - (world.inset.bottom || 0)) / 2) + 'px'; };
  place(); $('#stage').appendChild(el);
  $('.nextup__go', el).addEventListener('click', () => { nextOff(); N.go(); });
  $('.nextup__no', el).addEventListener('click', () => { NEXT.no.add(N.key); nextOff(); });
  el.addEventListener('keydown', e => { if (e.key === 'Escape') { NEXT.no.add(N.key); nextOff(); } });
  if (from !== 'load') $('.nextup__go', el).focus({ preventScroll: true });
}
world.on('resize', () => { if (NEXT.el) { NEXT.el.style.left = ((world.size.w - (world.inset.right || 0)) / 2) + 'px'; NEXT.el.style.top = ((world.size.h - (world.inset.bottom || 0)) / 2) + 'px'; } });
/* the plant-cell branch, "Where glucose comes from" (js/plant/view.js; Daniel, 11 Nov 2026): a view over the whole page,
   opened from the way in's end card and from the Mission complete card. Nothing of it is fetched before a door is pressed
   ("Load the branch only when a door is pressed, so the game starts no slower"). The game's 3D rests while it is open, and
   the game is where the pupil left it when it closes: it uses and gives no item, no energy, and changes no place. */
let plantOpening = false;
document.addEventListener('plant', e => {
  const root = document.documentElement;
  if (plantOpening || opening || memOpening || root.classList.contains('plv-open') || root.classList.contains('ibv-open') || root.classList.contains('memv-open')) return;
  plantOpening = true; nextOff();
  import('../plant/view.js?v=202611282133').then(m => {
    world.hold = true;
    /* (20 Nov 2026) `at`: a visit by a door of a course box (quest.js PLANT): the plant cell opens at that step alone, and
       saves nothing, so the game offers no next step when it closes */
    const at = e.detail && e.detail.at;
    m.openPlant({ inGame: true, from: e.detail && e.detail.from, at, onClose: () => { plantOpening = false; world.hold = false; world.kick(); if (at) return; winNext(); setTimeout(() => nextUp('plant'), 500); } });
  }).catch(err => { plantOpening = false; world.hold = false; world.kick(); console.error(err); });
});

/* ---------------- the IB map (js/game/ibmap.js; Daniel, 15 Nov 2026) ----------------
   Only with the IB pass. Opened by 🧬 IB map at the top of the page (#btnIB), by the box at the top of the map's list
   (quest.js ibPassBox: 'ibmap') and by the page's address: #ib opens the map, #ib-<door> opens that door (a place with
   the course on IB, a view at its chapter, the side quest), once the game has begun; the address is then put back to
   the page's own, so a reload does not open it again. Without the pass the address changes nothing, but a line says
   who the map is for (a pupil who is signed in waits for the records' answer first). */
let mapOpening = false;
const viewOpen = () => ['ibv-open', 'memv-open', 'plv-open', 'benchv-open', 'waterv-open', 'lightv-open', 'fractionationv-open'].some(c => document.documentElement.classList.contains(c));
/* the three IB views of 16 Nov 2026 (the IB audit's additions 15-17, built on Daniel's "everything that you recommended,
   build it"): water potential, from light to glucose, the cell fractionation lab. Each has its own address too
   (water/, light/, fractionation/); its code is fetched when a door is pressed. One view at a time. Doors: the IB map,
   the plant cell's vacuole and light steps (js/plant/view.js), the ribosomes' first IB box (story.js `frac`). */
const VIEWS2 = { water: ['../water/view.js', 'openWater'], light: ['../light/view.js', 'openLight'], fractionation: ['../fractionation/view.js', 'openFractionation'] };
let v2Opening = false;
function openView2(name, o = {}) {
  const V = VIEWS2[name]; if (!V || v2Opening || viewOpen()) return;
  v2Opening = true; nextOff();
  import(V[0] + '?v=202611282133').then(m => { world.hold = true; m[V[1]](Object.assign({ inGame: true, backLabel: o.after ? '← Back to the IB map' : '← Back to the game', onClose: () => { v2Opening = false; world.hold = false; world.kick(); if (o.after) o.after(); else winNext(); } }, o.start != null ? { start: o.start, mark: o.mark } : {})); })
    .catch(e => { v2Opening = false; world.hold = false; world.kick(); console.error(e); });
}
document.addEventListener('ibview2', e => openView2(e.detail && e.detail.view));
/* topic: a topic's own address (#ib-b2.2) opens the map with that topic's window (ibmap.js, 16 Nov 2026) */
async function openIBMap(topic) {
  if (typeof topic !== 'string') topic = null;
  if (!ibPass() || !gameOn || mapOpening || viewOpen() || ($('#ibmap') && !$('#ibmap').hidden)) return;
  mapOpening = true; nextOff();
  document.dispatchEvent(new CustomEvent('ib-door'));            /* the views' code comes while the map is read */
  try { const m = await import('./ibmap.js?v=202611282133'); await m.openIBMap({ open: ibOpen, teacher: window.IBPASS.why() === 'teacher', topic }); }
  catch (e) { console.error(e); }
  mapOpening = false;
}
document.addEventListener('ibmap', () => openIBMap());
/* the starch test's IB investigation, heat and time (js/game/bench.js; 16 Nov 2026), from its IB box or the IB map */
document.addEventListener('ibbench', e => { if (viewOpen()) return; const step = e.detail && e.detail.step != null ? e.detail.step : null; import('./bench.js?v=202611282133').then(m => { world.hold = true; m.openBench({ step, onClose: () => { world.hold = false; world.kick(); } }); }).catch(e => console.error(e)); });
/* ---------------- a door of the IB map lands on its statement (18 Nov 2026) ----------------
   Daniel, after using the map: a door opened a place at its first step and a view at its chapter's start, with nothing
   marked, and there was no way back to the map (quest.js "landed from the IB map" has his words). Now the map gives each
   press a target, T = { topic, name, codes, code } (ibmap.js). A place: quest.ibLand shows the step that teaches it
   and marks its sentences, and that step plays in watch mode (the ↻ of play.js: nothing of the saved game changes),
   unless the student is on that step. A view: it opens at the step whose words carry the statement (the door's `at`),
   is given the statement to mark (`mark`) and the label of its way back ("← Back to the IB map"), and when it closes
   the map opens again at the topic. The map has a button in the picture's corner too (#hudIB, beside Full screen), so
   that it is there in full screen, where the page's own top bar is covered. */
const ibStep = (d, T) => { if (!T || !d.at) return 0; if (T.step != null) return T.step;   /* (22 Nov 2026: a line of the map's window names its own step, when the statement is taught at more than one) */
  const list = T.code ? [T.code] : (T.codes || []); const all = list.flatMap(c => d.at[c] || []); return all.length ? Math.min(...all) : 0; };
const ibBack = T => (T && T.topic ? () => openIBMap(T.topic) : null);
let ibNext = null, ibCarry = 0;
function ibLandPlace(id, T) {
  if (quest.cur !== id) return;
  const r = quest.ibLand(id, T); if (!r || !r.li) return;
  /* the step the student is on plays as their own. Any other plays in watch mode, once the camera's flight to the
     place has ended (2.5 s at most): the words and the mark are there at once, the picture follows */
  if (r.li.classList.contains('is-now')) return;
  const F = quest.ibFrom, t0 = performance.now();
  const start = () => {
    if (quest.ibFrom !== F || quest.cur !== id || F.own || F.i !== r.i) return;
    if ((world.flying || busy || watchingNow) && performance.now() - t0 < 2500) { setTimeout(start, 120); return; }
    const li = $('.steps', quest.panel) && $('.steps', quest.panel).children[r.i];
    if (li) document.dispatchEvent(new CustomEvent('step-again', { detail: { id, i: r.i, li, map: true } }));
  };
  /* (never in the same task as go: the place's own step starts a moment after its panel is drawn (play.js run), and a
     step that started after the watched one would count as part of it: both steps' buttons stood on the picture and
     the watched step waited for ever. Found with ?still=1, where the camera's flight takes no time: the nucleus's step
     5 with "Enter through a nuclear pore" beside "Copy") */
  setTimeout(start, 150);
}
/* (the landing waits until the place's panel is drawn: go → quest.openPlace) */
function ibLandSoon(id, T, n = 0) {
  if (quest.cur === id && !busy && $('.steps > li', quest.panel)) ibLandPlace(id, T);
  else if (n < 40) setTimeout(() => ibLandSoon(id, T, n + 1), 100);
}
/* a step button of the bar. While a step plays for the student, that step stops first (its own Stop, or its last
   button), the place is set up again, and then the step pressed plays ('step-again' above) */
document.addEventListener('ib-land', e => {
  const F = quest.ibFrom, d = e.detail || {}; if (!F || F.id !== d.id || quest.cur !== d.id) return;
  const T = { topic: F.topic, name: F.name, codes: F.codes, step: d.step };
  if (!watchingNow) { ibLandPlace(d.id, T); return; }
  const stop = $('.step__stop', quest.panel) || $('.step__cont', quest.panel);
  if (stop) { ibNext = T; stop.click(); }
});
document.addEventListener('ibmap-topic', e => openIBMap(e.detail && e.detail.topic));
function ibOpen(d, T) {
  if (!d || !ibPass()) return;
  /* a door of the IB map is an IB door: the course goes on IB, in every part of the game (js/game/iblevel.js) */
  if (d.kind === 'place' || d.kind === 'film' || d.kind === 'side') { setCourse('ib', true); R.store.set('ibpassLv', true); }
  if (d.kind === 'place') {
    /* the nucleolus is inside the nucleus: a pupil who has not been inside it goes there first (state.js awake). From
       a topic of the map, the game then carries them on: once the nucleus's first step, the dive, is finished, the
       nucleolus opens at the statement (18 Nov 2026). Not if they leave the nucleus first, or press another door */
    if (d.id === 'nucleolus' && !state.flag('in-nucleus')) {
      const on = !!(T && T.topic), my = ++ibCarry;
      toast('The nucleolus is inside the nucleus: enter the nucleus first.' + (on ? ' Then the game opens the nucleolus for you.' : ''), 6200);
      quest.ibFrom = null; ibNext = null; go('nucleus');
      const wait = () => {
        if (my !== ibCarry || quest.cur !== 'nucleus') return;
        if (viewOpen() || ($('#ibmap') && !$('#ibmap').hidden)) { setTimeout(wait, 400); return; }   /* (a view or the map is open over the nucleus: it waits) */
        if (state.flag('in-nucleus') && (state.done('nucleus') || state.step('nucleus') >= 1) && !busy && !watchingNow) { ibOpen(d, T); return; }
        setTimeout(wait, 400);
      };
      if (on) setTimeout(wait, 1200);
      return;
    }
    ibCarry++;
    /* (a press while the camera still flies to the list of places waits for it: go does nothing while it is busy) */
    const enter = (n = 0) => {
      if (busy && n < 40) { setTimeout(() => enter(n + 1), 100); return; }
      quest.ibFrom = null; ibNext = null;
      go(d.id);
      if (T && T.topic) ibLandSoon(d.id, T);
    };
    enter();
  } else if (d.kind === 'film') document.dispatchEvent(new CustomEvent('coursefilm', { detail: { film: d.film, step: T ? ibStep(d, T) : null } }));   /* (step: where the film shows the statement of the map's line, 28 Nov 2026) */
  else if (d.kind === 'bench') document.dispatchEvent(new CustomEvent('ibbench', { detail: { step: T ? ibStep(d, T) : null } }));
  else if (d.kind === 'view2') openView2(d.view, { start: ibStep(d, T), mark: T && (T.code || T.codes), after: ibBack(T) });
  else if (d.id === 'membrane') openMem({ start: ibStep(d, T), mark: T && (T.code || T.codes), after: ibBack(T) });
  else if (d.id === 'plant') document.dispatchEvent(new CustomEvent('plant', { detail: { from: 'ibmap' } }));
  else if (d.ci != null) openIB({ ci: d.ci, si: ibStep(d, T), mark: T && (T.code || T.codes) }, ibBack(T));
}
const ibBtn = $('#btnIB'), tView = $('#tView'), hudIB = $('#hudIB');
/* a teacher's "See it as: Year 7 · IB" (js/ibpass.js setView; Daniel, 15 Nov 2026): shown from the start, for a teacher only */
const paintIBBtn = () => {
  if (ibBtn) ibBtn.hidden = !(ibPass() && gameOn);
  if (hudIB) hudIB.hidden = !(ibPass() && gameOn);
  const T = !!(window.IBPASS && window.IBPASS.teacher());
  if (tView) { tView.hidden = !T; if (T) $$('button', tView).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === window.IBPASS.view()))); }
};
if (ibBtn) ibBtn.addEventListener('click', () => openIBMap());
/* (in the picture's corner: at the topic the student came from, when they came from the map) */
if (hudIB) hudIB.addEventListener('click', () => openIBMap(quest.ibFrom && quest.cur === quest.ibFrom.id ? quest.ibFrom.topic : null));
if (tView) tView.addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (b && window.IBPASS) { window.IBPASS.setView(b.dataset.v); paintIBBtn(); } });
paintIBBtn();
const readHash = () => { const m = /^#ib(?:-([a-z0-9.-]+))?$/i.exec(location.hash || ''); return m ? (m[1] || 'map').toLowerCase() : null; };
let hashWant = readHash();
async function hashDoor() {
  if (!hashWant || !gameOn) return;
  if (!ibPass()) {
    if (window.SignIn && window.SignIn.who() && !(window.IBPASS && window.IBPASS.known())) return;   /* the records' answer is coming */
    hashWant = null;
    toast('The IB map is for Year 12 and 13 students. Sign in with your school Google account, at the top of the page, and open this link again.', 9000);
    return;
  }
  const want = hashWant; hashWant = null;
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  if (want === 'map') { openIBMap(); return; }
  if (/^[a-d]\d\.\d$/.test(want)) { openIBMap(want.toUpperCase()); return; }
  try { const m = await import('./ibmap.js?v=202611282133'); const d = (await m.doors()).find(x => x.id === want); if (d) ibOpen(d); else openIBMap(); }
  catch (e) { console.error(e); }
}
addEventListener('hashchange', () => { hashWant = readHash(); hashDoor(); });
/* the first place, opened before the pass was known: its way to the map now */
function arriveWay() {
  if (!ibPass() || quest.cur !== 'arrive') return;
  const top = $('#quest .qp__top');
  if (top && !$('.qp__back', top)) { const b = h('button', { type: 'button', class: 'qp__back' }, '← The map'); top.insertBefore(b, top.firstChild); b.addEventListener('click', () => go(null)); }
  const nav = $('#quest .qp__nav'); if (nav && nav.hidden && $('#quest .qp__end:not([hidden])')) nav.hidden = false;
}
/* the pass came (or went) while the game is open: the button, the map's list, the place's switches, the address */
function ibChanged(e) {
  paintIBBtn();
  if (!gameOn) return;
  /* a teacher pressed Year 7 or IB: the place is set up again as that pupil finds it (asleep in the Year 7 game: the
     map says why), or the map drawn again; in the Year 7 game before its first place is done, that first place */
  if (e && e.detail && e.detail.toggled) {
    const ib = $('#ibmap'); if (ib && !ib.hidden && !ibPass()) { ib.hidden = true; document.documentElement.classList.remove('ibmap-open'); }
    /* (the Year 7 game wakes nothing before the first place is done: that is where a Year 7 pupil would be) */
    const at = !ibPass() && !state.complete('arrive') ? 'arrive' : quest.cur;
    wakeQuiet = true;
    if (at) go(at); else if (!busy) { quest.openMap(); looks(); mapNames(); }
    wakeQuiet = false;
    return;
  }
  wakeQuiet = true;
  if (!quest.cur && !busy && $('#quest .qp--map')) { quest.openMap(); looks(); mapNames(); }
  else if (quest.cur) { quest.courseSwitch(quest.cur); arriveWay(); looks(); }
  wakeQuiet = false;
  if (ibPass()) sound.wake();
  hashDoor();
}
document.addEventListener('ibpass', ibChanged);
/* a signed-in pupil's progress back from their record (js/game/restore.js; 16 Nov 2026), each time the record arrives
   (js/lesson.js 'lesson:who'): the answers and the finished places come back on a cleared or another computer. The
   game in front of the pupil follows: How the game works gives way to the map when the first place was finished, and the
   map shows what is done. */
function restoreNow() {
  const w = window.Lesson && window.Lesson.who && window.Lesson.who();
  if (!w || !w.onList) return;
  const r = fromRecord(state); if (!r.answers && !r.places.length) return;
  world.setNucleus(state.flag('in-nucleus'));
  if (window.HOWTO && !window.HOWTO.done && state.complete('arrive')) { const g = $('#howtoGo'); if (g) g.click(); }
  else if (gameOn && !quest.cur && !busy && $('#quest .qp--map')) { quest.openMap(); looks(); mapNames(); }
  document.dispatchEvent(new Event('progress'));
  toast(r.places.length ? 'Welcome back: your finished places and answers are back, from your teacher\'s record.' : 'Welcome back: your answers are back, from your teacher\'s record.', 5200);
}
window.addEventListener('lesson:who', restoreNow);
document.addEventListener('ibpass-known', hashDoor);
function begun() { gameOn = true; paintIBBtn(); hashDoor(); }

/* ---------- start ---------- */
async function start() {
  /* the loading screen stays until the 3D's shaders are compiled (world.js), at most 6 s */
  const ready = Promise.race([Promise.all([world.ready, wait(R.FAST ? 0 : 300)]), new Promise(r => setTimeout(r, 6000))]);
  /* a new game shows How the game works first (index.html #howto), while the cell loads behind it; after its press, the
     loading screen (if the cell is not ready yet: "Shrinking you…"), then the intro (Daniel, 8 Nov 2026) */
  if (window.HOWTO && !window.HOWTO.done) await new Promise(r => document.addEventListener('howto-done', r, { once: true }));
  await ready;
  $('#loading').hidden = true;
  looks();
  /* a final check started and not finished: straight back to it (the game under it shows the answers) */
  if (finalOpen()) openFinal();
  if (!state.complete('arrive')) {
    if (!state.step('arrive') && !state.done('arrive')) await intro(world); else sound.allowMusic();   /* no intro: the pupil is in 3D already */
    /* (only the five Year 7 parts lit, until Show everything has been pressed: a game opened again after it shows all) */
    if (!state.done('arrive') && state.step('arrive') < 2) world.simple(true);
    setInset();
    /* its end is its checks; when every one is right, "Go to the map" leads on (quest.finishPanel) */
    const opened = quest.openPlace('arrive', (name) => play.run(name));
    begun();
    setTimeout(arriveNames, 600);
    await opened;
    looks(); arriveNames();
    return;
  }
  sound.allowMusic();
  go(null).then(() => { begun(); setTimeout(() => { if (!quest.cur) nextUp('load'); }, 1200); });
}
start();
window.READY = true;
