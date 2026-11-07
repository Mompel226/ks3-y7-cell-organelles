/* ============================================================
   main.js — the Y7 cell game starts here (4 Nov 2026): the world, its names, the quest panel and the places.
   A place wakes (its mist clears, a ring of light turns round it) when the pupil carries what it needs; on the map each
   place has its name on a level line and its state; pressing it (on the cell, its name, or the list in the panel)
   flies there and opens its steps.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { World, MAP_VIEW } from '../world/world.js?v=202611071821';
import { Names } from './names.js?v=202611071821';
import { Quest, MAPPED, isAre } from './quest.js?v=202611071821';
import { makePlay } from './play.js?v=202611071821';
import { setStill, wait } from './actors.js?v=202611071821';
import { state } from './state.js?v=202611071821';
import { ICON } from './icons.js?v=202611071821';
import { intro } from './intro.js?v=202611071821';
import { sound } from './sound.js?v=202611071821';
import { openFinal, finalCode, finalOpen } from './final.js?v=202611071821';

const R = window.REV, { $, $$, h, esc } = R;
const STORY = window.STORY;
const stage = $('#stage');
let world;
try { world = new World($('#world'), { still: R.FAST, quality: R.params.get('quality') || '' }); }
catch (e) {
  $('#loading').innerHTML = '<p><b>This computer cannot draw the 3D cell.</b> Try another browser (Chrome, Edge or Safari), or another computer.</p>';
  throw e;
}
setStill(R.FAST);
const names = new Names(world, $('#names'));
const quest = new Quest({ world, names, panel: $('#quest'), hots: $('#hots'), bag: $('#bag'), onPlace: go });
const play = makePlay(world, quest);
window.CELLGAME = { world, quest, state, go, sound };

/* ---------- what is solid (names behind it are hidden) ---------- */
const WG = world.W.groups;
world.solids = [world.W.nucleus.outerEnv, ...WG.rer.children.filter(m => m.name.startsWith('rer') && !m.isInstancedMesh), ...WG.golgi.children.filter(m => m.name.startsWith('golgi')),
  ...WG.mitochondria.children, WG.ser];

/* ---------- each place's look and its name on the map ---------- */
function looks() {
  /* before the map (the start), every place is simply there to see: nothing sleeps yet. Done (✦) is the jobs AND every
     check right (state.complete) */
  const map = state.complete('arrive');
  MAPPED.forEach(id => world.setPlace(id, !map ? 'idle' : state.complete(id) ? 'done' : state.awake(id) ? 'open' : 'sleep', { instant: !looks.ran }));
  looks.ran = true;
}
function mapNames() {
  names.set(MAPPED.map(id => {
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
world.on('woke', id => { toast(`<b>${esc(STORY[id].title)}</b> ${isAre(id)} awake.`); sound.wake(); });

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
async function go(id) {
  if (busy) return;
  if (id === 'final') { openFinal(); return; }
  if (id !== 'test') $('#test').hidden = true;
  if (!id) { world.wayIn(false); busy = true; play.reset(); quest.openMap(); setInset(); await world.flyTo(MAP_VIEW, { isMap: true }); looks(); mapNames(); busy = false; return; }
  if (id !== 'test' && !state.awake(id)) { quest.openMap(); quest.whyAsleep(id, $(`[data-go="${id}"]`, $('#quest'))); return; }
  busy = true; names.set([]); play.reset();
  /* the way in shows its membrane bigger, as two layers of lipids (world.wayIn); every other place, the thin film */
  world.wayIn(id === 'wayin');
  /* a pupil may do the mitochondria again (more energy), or the way in (more glucose and oxygen) */
  if (id === 'mito' && state.done('mito') && state.has('glucose') && state.has('oxygen')) state.setStep('mito', 0), state.get().done.mito = false, state.save();
  if (id === 'wayin' && state.done('wayin') && !state.has('glucose')) state.setStep('wayin', 0), state.get().done.wayin = false, state.save();
  setInset();
  if (id === 'test') { busy = false; return test(); }
  const P = world.P[id];
  world.flyTo(P.view);
  busy = false;
  await quest.openPlace(id, (name) => play.run(name));
  looks();
}
function setInset() {
  const s = world.size, panel = $('#quest');
  if (s.w > 860) world.setInset({ right: panel.offsetWidth + 24 }); else world.setInset({ bottom: Math.min(panel.offsetHeight, s.h * 0.5) });
}
addEventListener('resize', () => setTimeout(setInset, 50));
/* the panel's size follows what it holds (on a phone it is a sheet as tall as its words, up to half the stage), and it is
   empty, so hidden, until the first place opens: the free part of the picture follows it, once a frame at most */
let insetSoon = false;
new ResizeObserver(() => { if (insetSoon) return; insetSoon = true; requestAnimationFrame(() => { insetSoon = false; setInset(); }); }).observe($('#quest'));

/* a short message at the top of the world */
function toast(html) {
  const t = h('div', { class: 'toast', role: 'status' }, html); $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), 3200); setTimeout(() => t.remove(), 3900);
}
state.on(() => { if (!quest.cur) mapNames(); });
/* a place finished (its jobs and every check right): what it gave wakes the next places now */
document.addEventListener('place-complete', () => { looks(); if (!quest.cur) mapNames(); });
/* the final check closed: the list of places says how it went */
document.addEventListener('final-closed', () => { if (!quest.cur && state.done('arrive')) quest.openMap(); });

/* ---------- the test: amylase on starch, in a spotting tile ---------- */
async function test() {
  const box = $('#test'); box.hidden = false;
  box.innerHTML = `<figure class="tile"><svg viewBox="0 0 600 300" role="img" aria-label="A white spotting tile with two wells. Each holds starch solution.">
    <rect x="30" y="60" width="540" height="200" rx="26" fill="#F4F6F8" stroke="#B8C2CC" stroke-width="3"/>
    <g id="wA"><circle cx="190" cy="160" r="62" fill="#E2E8EE" stroke="#AEB8C2" stroke-width="3"/><circle class="liq" cx="190" cy="160" r="50" fill="#F3F1EA"/></g>
    <g id="wB"><circle cx="410" cy="160" r="62" fill="#E2E8EE" stroke="#AEB8C2" stroke-width="3"/><circle class="liq" cx="410" cy="160" r="50" fill="#F3F1EA"/></g>
    <text x="190" y="44" text-anchor="middle" font-size="26" font-weight="800" fill="#E8EDF4">A: saliva</text><text x="410" y="44" text-anchor="middle" font-size="26" font-weight="800" fill="#E8EDF4">B: water (control)</text>
    <text id="clock" x="300" y="292" text-anchor="middle" font-size="22" fill="#C9D4E0"></text></svg>
    <figcaption>Starch solution in two wells of a spotting tile. Iodine solution turns blue-black when starch is present.</figcaption></figure>`;
  const liq = id => $(`#${id} .liq`, box);
  const fin = quest.openPlace('test', async (name) => {
    if (name === 'wells') {
      const a = h('button', { type: 'button', class: 'btn' }, 'Add saliva to well A'), b = h('button', { type: 'button', class: 'btn' }, 'Add water to well B');
      quest.step.do.append(a, b);
      await Promise.all([new Promise(r => a.addEventListener('click', () => { a.disabled = true; liq('wA').setAttribute('stroke', '#BFF3FF'); liq('wA').setAttribute('stroke-width', '6'); r(); })),
                         new Promise(r => b.addEventListener('click', () => { b.disabled = true; liq('wB').setAttribute('stroke', '#BFF3FF'); liq('wB').setAttribute('stroke-width', '6'); r(); }))]);
      a.remove(); b.remove();
    } else if (name === 'wait') {
      await quest.next('Wait 5 minutes');
      const clock = $('#clock', box), t0 = performance.now();
      await new Promise(res => {
        const f = () => {
          const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 4000);
          clock.textContent = Math.round(k * 5) + ' minutes';
          if (k < 1) requestAnimationFrame(f); else res();
        };
        f();
      });
    } else if (name === 'iodine') {
      /* a drop of iodine solution in each well: orange-brown where no starch is left (A), blue-black where it is (B) */
      await quest.next('Add iodine solution');
      const s0 = quest.session, A = liq('wA'), B = liq('wB'), t0 = performance.now(), cA = new THREE.Color(0xf3f1ea), cB = cA.clone();
      await new Promise(res => {
        const f = () => {
          const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 1600);
          A.setAttribute('fill', '#' + cA.clone().lerp(new THREE.Color(0xc8701e), k).getHexString());
          B.setAttribute('fill', '#' + cB.clone().lerp(new THREE.Color(0x1b1d3a), k).getHexString());
          if (k < 1) requestAnimationFrame(f); else res();
        };
        f();
      });
      if (quest.session === s0) state.use('saliva');      /* never used up by a test the pupil left */
    }
  });
  await fin;
  /* the win, once every check of the test is right too: the mission is complete only then */
  if (!(await quest.whenComplete('test'))) return;
  /* the win: the whole journey, in the order the cell made it */
  const path = [['mrna', 'copy of the gene'], ['chain', 'ribosome'], ['amylase', 'rough ER'], ['packed', 'Golgi apparatus'], ['top', 'microtubules'], ['saliva', 'exocytosis']];
  const end = h('div', { class: 'win', role: 'status' }, `<div class="win__star">${ICON.star}</div><p class="win__t">Mission complete</p>
    <p>You made amylase in a cell of a salivary gland, released it, and it digested starch.</p>
    <div class="win__code"><p>Your code for the final check</p><p class="win__c">${esc(await finalCode())}</p>
      <p>Write it down. You need it to start the final check: press <b>✦ Final check</b> in the list of places, then type your code.</p></div>
    <ol class="win__path">${path.map(([i, t]) => `<li>${ICON[i]}<span>${t}</span></li>`).join('')}</ol>
    <div class="win__acts"><button type="button" class="btn" data-back>Back to the cell</button><button type="button" class="btn ghost" data-final>✦ Final check</button></div>`);
  box.appendChild(end);
  /* the code must be seen: the box scrolls to the card (below the tile), the page does not move */
  box.scrollTo({ top: Math.max(0, end.offsetTop - 12), behavior: R.FAST ? 'auto' : 'smooth' });
  sound.wake();
  $('[data-back]', end).addEventListener('click', () => { box.hidden = true; go(null); });
  $('[data-final]', end).addEventListener('click', async () => { box.hidden = true; await go(null); openFinal({ focusCode: true }); });
}

/* ---------- See the real thing ---------- */
/* fetched the first time it is opened, not with the page (5 Nov 2026, speed: the lens brings the model loader, 113 KB) */
document.addEventListener('lens', e => import('./lens.js?v=202611071821').then(m => m.openLens(e.detail)));
/* from a place's end: the nucleus's Explorer film (how a cell copies a gene); the way in's and the mitochondria's IB
   extension, "From glucose to ATP" (js/ib/view.js, over the whole page; it replaced the mitochondria's Explorer film,
   5 Nov 2026), which a door in a step's IB words also opens, at its chapter. The game's 3D rests while it is open. */
/* one view at a time: a second press while the first one's code was still coming had opened a second view over it (the
   audit, 5 Nov 2026) */
let opening = false;
const openIB = start => {
  if (opening || document.documentElement.classList.contains('ibv-open')) return;
  opening = true;
  import('../ib/view.js?v=202611071821').then(m => {
    world.hold = true;
    m.openIB({ inGame: true, start, onClose: () => { opening = false; world.hold = false; world.kick(); } });
  }).catch(e => { opening = false; world.hold = false; world.kick(); console.error(e); });
};
/* when a place's IB switch first shows (quest.js), the view's code, styles and map are fetched while the pupil reads, so
   its doors then open at once; nothing of it is fetched before (Daniel: "loads when it should be loading, not before") */
let warmed = false;
document.addEventListener('ib-door', () => {
  if (warmed) return; warmed = true;
  import('../ib/view.js?v=202611071821').then(m => m.warm()).catch(() => { warmed = false; });
});
document.addEventListener('explore', e => {
  if (e.detail === 'nucleus') import('./transcribe.js?v=202611071821').then(m => m.openCopyFilm({ last: 'Close' }));
  else if (e.detail === 'mito' || e.detail === 'wayin') openIB({ ci: e.detail === 'wayin' ? 1 : 0, si: 0 });
});
document.addEventListener('ibview', e => openIB({ ci: e.detail.ch, si: 0 }));

/* ---------- start ---------- */
async function start() {
  /* the loading screen stays until the 3D's shaders are compiled (world.js), at most 6 s */
  await Promise.race([Promise.all([world.ready, wait(R.FAST ? 0 : 300)]), new Promise(r => setTimeout(r, 6000))]);
  $('#loading').hidden = true;
  looks();
  /* a final check started and not finished: straight back to it (the game under it shows the answers) */
  if (finalOpen()) openFinal();
  if (!state.complete('arrive')) {
    if (!state.step('arrive') && !state.done('arrive')) await intro(world); else sound.allowMusic();   /* no intro: the pupil is in 3D already */
    if (!state.done('arrive')) world.simple(true);
    setInset();
    /* its end is its checks; when every one is right, "Go to the map" leads on (quest.finishPanel) */
    await quest.openPlace('arrive', (name) => play.run(name));
    looks();
    return;
  }
  sound.allowMusic();
  go(null);
}
start();
window.READY = true;
