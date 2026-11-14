/* ============================================================
   main.js — the Y7 cell game starts here (4 Nov 2026): the world, its names, the quest panel and the places.
   A place wakes (its mist clears, a ring of light turns round it) when the pupil carries what it needs; on the map each
   place has its name on a level line and its state; pressing it (on the cell, its name, or the list in the panel)
   flies there and opens its steps.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { World, MAP_VIEW } from '../world/world.js?v=202611142326';
import { Names } from './names.js?v=202611142326';
import { Quest, MAPPED, isAre } from './quest.js?v=202611142326';
import { makePlay } from './play.js?v=202611142326';
import { setStill, wait } from './actors.js?v=202611142326';
import { state, RESPIRE } from './state.js?v=202611142326';
import { ICON } from './icons.js?v=202611142326';
import { intro } from './intro.js?v=202611142326';
import { sound } from './sound.js?v=202611142326';
import { openFinal, finalCode, finalOpen } from './final.js?v=202611142326';

const R = window.REV, { $, $$, h, esc } = R;
const STORY = window.STORY;
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
window.CELLGAME = { world, quest, state, go, sound, dive: () => play.dive() };
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
  const map = state.complete('arrive');
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
async function go(id, stay) {
  if (busy) return;
  nextOff();
  if (id === 'final') { openFinal(); return; }
  if (id !== 'test') $('#test').hidden = true;
  if (!id) { world.wayIn(false); world.setFrame(0); busy = true; play.reset(); quest.openMap(); setInset(); await world.flyTo(MAP_VIEW, { isMap: true }); looks(); mapNames(); busy = false; return; }
  /* (the test too: it had been let through here whatever the pupil carried; the list's own button was the only guard: the
     order audit, 12 Nov 2026) */
  if (!state.awake(id)) { quest.openMap(); quest.whyAsleep(id, $(`[data-go="${id}"]`, $('#quest'))); return; }
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
  try { back = await play.watch(id, i, li); } finally { watchingNow = false; document.documentElement.classList.remove('is-watching'); }
  if (back && quest.cur === id) go(id, true);
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
document.addEventListener('lens', e => import('./lens.js?v=202611142326').then(m => m.openLens(e.detail)));
/* from a place's end: the nucleus's Explorer film (how a cell copies a gene); the way in's and the mitochondria's IB
   extension, "From glucose to ATP" (js/ib/view.js, over the whole page; it replaced the mitochondria's Explorer film,
   5 Nov 2026), which a door in a step's IB words also opens, at its chapter. The game's 3D rests while it is open. */
/* one view at a time: a second press while the first one's code was still coming had opened a second view over it (the
   audit, 5 Nov 2026) */
let opening = false;
const openIB = start => {
  if (opening || memOpening || document.documentElement.classList.contains('ibv-open') || document.documentElement.classList.contains('memv-open')) return;
  opening = true;
  import('../ib/view.js?v=202611142326').then(m => {
    world.hold = true;
    m.openIB({ inGame: true, start, onClose: () => { opening = false; world.hold = false; world.kick(); winNext(); } });
  }).catch(e => { opening = false; world.hold = false; world.kick(); console.error(e); });
};
/* when a place's IB switch first shows (quest.js), the view's code, styles and map are fetched while the pupil reads, so
   its doors then open at once; nothing of it is fetched before (Daniel: "loads when it should be loading, not before") */
let warmed = false;
document.addEventListener('ib-door', () => {
  if (warmed) return; warmed = true;
  import('../ib/view.js?v=202611142326').then(m => m.warm()).catch(() => { warmed = false; });
  import('../membrane/view.js?v=202611142326').then(m => m.warm()).catch(() => {});
});
document.addEventListener('explore', e => {
  if (e.detail === 'nucleus') import('./transcribe.js?v=202611142326').then(m => m.openCopyFilm({ last: 'Close' }));
  else if (e.detail === 'mito' || e.detail === 'wayin') openIB({ ci: e.detail === 'wayin' ? 1 : 0, si: 0 });
});
document.addEventListener('ibview', e => openIB({ ci: e.detail.ch, si: 0 }));
/* "The cell membrane: fluid and mosaic" (js/membrane/view.js, 13 Nov 2026; its own address: membrane/): a 3D patch of
   membrane at true sizes, whose phospholipids move in their own layer and whose proteins move more slowly, opened over
   the page by the door in the way in's first IB box (quest.js courseSwitch: 'memview'). One view at a time. */
let memOpening = false;
const openMem = () => {
  const root = document.documentElement;
  if (memOpening || opening || root.classList.contains('memv-open') || root.classList.contains('ibv-open') || root.classList.contains('plv-open')) return;
  memOpening = true;
  import('../membrane/view.js?v=202611142326').then(m => {
    world.hold = true;
    m.openMembrane({ inGame: true, onClose: () => { memOpening = false; world.hold = false; world.kick(); winNext(); } });
  }).catch(e => { memOpening = false; world.hold = false; world.kick(); console.error(e); });
};
document.addEventListener('memview', openMem);
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
  import('../plant/view.js?v=202611142326').then(m => {
    world.hold = true;
    m.openPlant({ inGame: true, from: e.detail && e.detail.from, onClose: () => { plantOpening = false; world.hold = false; world.kick(); winNext(); setTimeout(() => nextUp('plant'), 500); } });
  }).catch(err => { plantOpening = false; world.hold = false; world.kick(); console.error(err); });
});

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
    setTimeout(arriveNames, 600);
    await opened;
    looks(); arriveNames();
    return;
  }
  sound.allowMusic();
  go(null).then(() => setTimeout(() => { if (!quest.cur) nextUp('load'); }, 1200));
}
start();
window.READY = true;
