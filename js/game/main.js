/* ============================================================
   main.js — the Y7 cell game starts here (4 Nov 2026): the world, its names, the quest panel and the places.
   A place wakes (its mist clears, a ring of light turns round it) when the pupil carries what it needs; on the map each
   place has its name on a level line and its state; pressing it (on the cell, its name, or the list in the panel)
   flies there and opens its steps.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { World, MAP_VIEW } from '../world/world.js?v=202611041337';
import { Names } from './names.js?v=202611041337';
import { Quest, MAPPED, isAre } from './quest.js?v=202611041337';
import { makePlay } from './play.js?v=202611041337';
import { setStill, wait } from './actors.js?v=202611041337';
import { state } from './state.js?v=202611041337';
import { ICON } from './icons.js?v=202611041337';
import { openLens } from './lens.js?v=202611041337';
import { intro } from './intro.js?v=202611041337';
import { sound } from './sound.js?v=202611041337';

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
window.CELLGAME = { world, quest, state, go };

/* ---------- what is solid (names behind it are hidden) ---------- */
const WG = world.W.groups;
world.solids = [world.W.nucleus.outerEnv, ...WG.rer.children.filter(m => m.name.startsWith('rer') && !m.isInstancedMesh), ...WG.golgi.children.filter(m => m.name.startsWith('golgi')),
  ...WG.mitochondria.children, WG.ser];

/* ---------- each place's look and its name on the map ---------- */
function looks() {
  /* before the map (the start), every place is simply there to see: nothing sleeps yet */
  const map = state.done('arrive');
  MAPPED.forEach(id => world.setPlace(id, !map ? 'idle' : state.done(id) ? 'done' : state.awake(id) ? 'open' : 'sleep', { instant: !looks.ran }));
  looks.ran = true;
}
function mapNames() {
  names.set(MAPPED.map(id => {
    const P = world.P[id], awake = state.awake(id), done = state.done(id);
    return {
      key: id, spots: P.spots, own: P.groups.map(g => WG[g]).filter(Boolean).concat(id === 'nucleolus' ? [world.W.nucleus.group] : []),
      cls: done ? 'is-done' : awake ? 'is-open' : 'is-asleep',
      /* asleep: muted, with a dashed edge; what it needs is in the panel's list, and shows when the name is pressed */
      html: `<span class="nm__t">${esc(STORY[id].title).replace(': ', ':<br>')}</span>${done ? '<span class="nm__s">✦</span>' : ''}`,
      label: STORY[id].title + (done ? ': done' : awake ? ': awake' : ': asleep'),
      press: () => (awake || done) ? go(id) : (quest.whyAsleep(id, $(`[data-go="${id}"]`, $('#quest'))), toast(`<b>${esc(STORY[id].title)}</b> ${isAre(id)} asleep: see what it needs in the list.`))
    };
  }), [$('.hud')]);
}
/* a place pressed on the cell or its name */
world.on('press', id => { if (!id || quest.cur) return; go(id); });
world.on('woke', id => { toast(`<b>${esc(STORY[id].title)}</b> ${isAre(id)} awake.`); sound.wake(); });

/* ---------- 🔈 Sound (off until pressed) and ⛶ Full screen ---------- */
const sb = $('#btnSound');
const paintSound = () => { sb.setAttribute('aria-pressed', String(sound.on)); sb.textContent = sound.on ? '🔊 Sound on' : '🔈 Sound'; };
sb.addEventListener('click', () => { sound.set(!sound.on); paintSound(); }); paintSound();
const fb = $('#btnFull');
if (!document.fullscreenEnabled) fb.hidden = true;
fb.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else stage.requestFullscreen().catch(() => {}); });
document.addEventListener('fullscreenchange', () => { fb.textContent = document.fullscreenElement ? '⛶ Leave full screen' : '⛶ Full screen'; setTimeout(setInset, 100); });

/* ---------- going to a place, or back to the map ---------- */
let busy = false;
async function go(id) {
  if (busy) return;
  if (!id) { busy = true; play.reset(); quest.openMap(); setInset(); await world.flyTo(MAP_VIEW, { isMap: true }); looks(); mapNames(); busy = false; return; }
  if (id !== 'test' && !state.awake(id)) { quest.openMap(); quest.whyAsleep(id, $(`[data-go="${id}"]`, $('#quest'))); return; }
  busy = true; names.set([]); play.reset();
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
  await quest.openPlace('test', async (name) => {
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
  /* the win: the whole journey, in the order the cell made it */
  const path = [['mrna', 'copy of the gene'], ['chain', 'ribosome'], ['amylase', 'rough ER'], ['packed', 'Golgi apparatus'], ['top', 'microtubules'], ['saliva', 'exocytosis']];
  const end = h('div', { class: 'win', role: 'status' }, `<div class="win__star">${ICON.star}</div><p class="win__t">Mission complete</p>
    <p>You made amylase in a cell of a salivary gland, released it, and it digested starch.</p>
    <ol class="win__path">${path.map(([i, t]) => `<li>${ICON[i]}<span>${t}</span></li>`).join('')}</ol>
    <button type="button" class="btn">Back to the cell</button>`);
  box.appendChild(end);
  sound.wake();
  $('.btn', end).addEventListener('click', () => { box.hidden = true; go(null); });
}

/* ---------- See the real thing ---------- */
document.addEventListener('lens', e => openLens(e.detail));

/* ---------- start ---------- */
async function start() {
  await wait(R.FAST ? 0 : 300);
  $('#loading').hidden = true;
  looks();
  if (!state.done('arrive')) {
    if (!state.step('arrive')) await intro(world);
    world.simple(true);
    setInset();
    await quest.openPlace('arrive', (name) => play.run(name));
    looks();
  }
  go(null);
}
start();
window.READY = true;
