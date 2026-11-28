/* ============================================================
   view.js — the membrane view, "The cell membrane: fluid and mosaic" (13 Nov 2026): an IB extension of the Y7 cell
   game's "the way in", self-contained like "From glucose to ATP" (js/ib/view.js, whose frame, look, level tags and
   Reduce-motion rules it follows).
   Daniel, 13 Nov 2026: "when you talk about the cell membrane, that's probably the best place where you actually show
   that the phospholipids move within their own layer, and so that actually proteins can migrate ... maybe in its own
   self-contained visualizer, so it's not overly complicated, and so you actually show, particularly for the IB toggle,
   how the cell membrane probably looks like and moves like in reality ... It's like, wow."
   So: one view that fills the window, opened over the game (openMembrane({ inGame: true, onClose })) or at its own
   address (membrane/). One patch of membrane in 3D at true sizes (scene.js) that moves by a model fitted to measured
   speeds (sim.js); eight steps that wait for Next (memory animations-wait-for-the-reader), each paragraph with its IB
   level; names that follow their parts (names.js); two buttons that follow one phospholipid and one protein, so that
   their speeds can be compared; at the end what the picture simplifies, and its sources (text.js).
   Reduce motion (the computer's setting): the picture is a still at every step, with every name; the camera changes
   under a veil; "Follow" shows 30 seconds of movement as one still picture with the whole path. Nothing is hidden.
   Step 9 (16 Nov 2026): how water crosses the membrane. Another piece of the same membrane (sim.js AQP_PATCH), with
   aquaporin 1 in its measured shape (aqp1.js) and its water (water.js): the piece shown changes under the veil, as
   every change of picture does with Reduce motion; each piece's model runs only while it is shown.
   17 Nov 2026, the view on the picture (Daniel, 16 Nov, of the game's courses: "I am a student, I see this … I'm not
   going to read it … teach the content as much as possible using the animations and the … images … even with labels and
   as a discovery way"; 17 Nov: "really invest the time to beautify everything … particularly for animations"; memory
   teach-on-the-picture). A step keeps about 49 words on show (it had up to 166) and no guide line is folded:
   - the names are the lesson: a name with a card (text.js `cards`) is a button; pressed, its part stays bright while
     the other molecules dim (scene.js setFocus), and its card opens in the sheet with each line's own level and code;
     names found are ticked and counted (js/ib/found.js);
   - step 5's proteins say on the picture which are integral (a name's small second word); freeze fracture is a film
     in the picture's own 3D: the molecules stop, the outer layer turns back like the cover of a book (scene.js
     setOpen), the camera looks down on the two split faces; its caption is the guide line, a piece a shot;
   - step 6's evidence (Frye and Edidin) is a small film in the sheet (mix.js);
   - step 9 is osmosis as the guide asks it explained: many water molecules and solute particles on random walks, the
     water that crosses counted both ways on a strip (water.js; the method of the game's way in, js/game/wayflow.js),
     and a switch for the side with more solutes.
   Every film and every count waits for the reader; with Reduce motion each is one still with an arrow.
   For tools/membrane-check.mjs: window.MEMBRANE (the model, the drawn numbers, the names, the step, the cards, the
   strip, the film).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { makeSim, P, AQP_PATCH } from './sim.js?v=202611281627';
import { makeScene, makeStage } from './scene.js?v=202611281627';
import { makeWater, WATER, SEED } from './water.js?v=202611281627';
import { makeNames } from './names.js?v=202611281627';
import { STEPS, NAMES, PLACES, LEVELS, SIMPLE, SOURCES, OSMO, FILMS } from './text.js?v=202611281627';
import { levelSwitch, skip, hlOnly, hlNote, fit, level } from '../game/iblevel.js?v=202611281627';
import { found, learn } from '../ib/found.js?v=202611281627';
import { marks, codesOf } from '../ib/mark.js?v=202611281627';      /* (a visit from the IB map marks its sentence) */
/* the IB level (js/game/iblevel.js; Daniel, 16 Nov 2026: "there is no SL HL toggle … my SL students … are struggling"):
   its switch on the step count's line, beside the step buttons it marks (in the header it squeezed the title on a phone); at SL the HL lines are hidden, a step of HL lines only is marked HL on its button, and Next
   and Back go past it (it opens when its button is pressed, with a line that says it is HL only) */

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const FAST = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const STILL_S = 30;      /* with Reduce motion, Follow shows this many seconds of the model as one still */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* the numbers the words quote come from the model itself */
const million = n => { const m = n / 1e6; return (Math.abs(m - Math.round(m)) < 0.05 ? String(Math.round(m)) : m.toFixed(1)) + ' million'; };
const FILL = { slow: million(P.SLOW), wide: String(P.W), ratio: String(P.RATIO), real: String(Math.round(1e8 / P.SLOW) / 100) };
const fill = t => t.replace(/\{(\w+)\}/g, (m, k) => FILL[k] != null ? FILL[k] : m);
function paras(t, mid = '') {
  /* [x+]: a line beyond the guide that the step can be followed without, folded under "More detail" at the step's end
     (text.js; as in the IB view, js/ib/view.js paras); [!] the step's plain first line, what the step is for (no chip:
     the IB view's lead line, 16 Nov 2026) */
  const one = p => {
    const m = /^\[(sl|hl|x)(?:\s+([A-Z][0-9.]+(?:,\s*[A-Z][0-9.]+)*))?\]\s*/.exec(p);
    if (!m) return `<p>${p}</p>`;
    return `<p class="lvp lvp--${m[1]}"><span class="lv lv--${m[1]}">${esc(LEVELS[m[1]].name)}${m[2] ? ` <i>${esc(m[2])}</i>` : ''}</span> ${p.slice(m[0].length)}</p>`;
  };
  const main = [], more = [];
  /* (a folded guide line keeps its own tag: [x+] [sl …]) */
  fill(t).split('\n').forEach(p => { if (p.startsWith('[!] ')) main.push(`<p class="lvp lvp--lead">${p.slice(4)}</p>`); else if (p.startsWith('[x+] ')) { const r = p.slice(5); more.push(one(/^\[(sl|hl|x)[\s\]]/.test(r) ? r : '[x] ' + r)); } else main.push(one(p)); });
  /* mid: what stands between the lines on show and the fold (the step's names to press, its films: view.js show) */
  return main.join('') + mid + (more.length ? `<details class="memv__fold"><summary>More detail</summary>${more.join('')}</details>` : '');
}
const tagX = `<span class="lv lv--x">${esc(LEVELS.x.name)}</span> `;

/* what the camera looks at in each step: the point, the angles (degrees: az round the membrane, el above it), and the
   width and height (nm) that must be in the picture, on a laptop and (N) on a narrow phone. az stays under 10°: then
   the cut face's two ends are clean edges, and a level line from a margin runs over nothing before its part. The whole
   view stands 3.2 nm to the right on a laptop: the one name with a level line there (the tails) needs the left margin. */
const VIEWS = {
  whole: { at: [-3.2, 0.9, 0.5], atN: [0, -1.6, 0.5], az: 7, el: 21, w: 38.5, h: 21, wN: 32, hN: 19 },
  top: { at: [0, 1.6, 0], atN: [0, -0.4, 2.6], az: 8, el: 50, w: 33, h: 25, wN: 31.5, hN: 23 },
  close: { at: [-9.1, 0.1, 9], az: 5, el: 8, w: 15.5, h: 9.5, wN: 10, hN: 9.5 },
  side: { at: [-0.6, 1.5, 0], atN: [0, -1.2, 0], az: 0, el: 3.5, w: 46.5, h: 19, wN: 31.5, hN: 18 },
  /* step 9: the other piece (16 × 13 nm), the aquaporin at the middle of its cut face, seen a little from above (its
     four pores then stand apart across the picture); 1.5 nm to the right, so that the right margin has room for the
     name of the water molecule crossing the bilayer at the cut face's right end (a level line that runs over nothing) */
  aqp: { at: [1.65, 0.4, 2.6], atN: [0.4, 0.3, 2.6], az: 9, el: 13, w: 21.5, h: 14.5, wN: 17.6, hN: 14 },
  /* freeze fracture (17 Nov 2026): the outer layer turned back behind the inner one, both in the picture; then from
     higher up, to look down on the two split faces */
  frac: { at: [0, 1.2, -8.5], az: 8, el: 24, w: 41, h: 34, wN: 37, hN: 33 },
  frac2: { at: [0, 0.6, -9], az: 8, el: 42, w: 43, h: 41, wN: 38, hN: 40 }
};
const RAD = Math.PI / 180;

function styles() {
  let l = document.querySelector('link[data-memcss]');
  if (!l) {
    l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.memcss = '1';
    l.href = new URL('../../css/membrane.css?v=202611281627', import.meta.url).href; document.head.appendChild(l);
  }
  return l;
}
/* the game calls this when the door first shows: the styles come while the pupil reads (the code is already here) */
export function warm() { styles(); }

export function openMembrane({ mount = document.body, inGame = false, start = 0, onClose = null, mark = null, backLabel = '← Back to the game' } = {}) {
  const css = styles();
  const root = document.createElement('div');
  root.className = 'memv' + (inGame ? ' memv--game' : '');
  root.setAttribute('role', inGame ? 'dialog' : 'main'); if (inGame) root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'memv-h');
  root.innerHTML = `
    <header class="memv__top">
      <div class="memv__id"><p class="memv__eyebrow">IB Biology · B2.1 Membranes and membrane transport</p><h1 id="memv-h">The cell membrane: fluid and mosaic</h1>
        <p class="memv__by">Made by Dr Daniel Mompel Riera</p></div>
      ${inGame ? `<button type="button" class="memv__close memv__home">${esc(backLabel)}</button>` : '<a class="memv__home" href="../">← The cell game</a>'}
    </header>
    <div class="memv__main">
      <div class="memv__stage">
        <p class="memv__place memv__place--out"><span>${esc(PLACES.out)}</span><b class="memv__conc" hidden></b></p>
        <p class="memv__place memv__place--cyt"><span>${esc(PLACES.cyt)}</span><b class="memv__conc" hidden></b></p>
        <div class="memv__bar"><i></i><span></span></div>
        <svg class="memv__arrow" aria-hidden="true"></svg>
        <div class="memv__veil is-on is-first" aria-hidden="true"></div>
        <p class="memv__wait" hidden>Drawing the membrane…</p>
      </div>
      <div class="memv__tools">
        <div class="memv__cap" hidden role="region" aria-label="The film"></div>
        <div class="memv__osmo" hidden></div>
        <p class="memv__slow">${FAST ? 'A still picture: Reduce motion is on' : esc('Sideways movement slowed about ' + FILL.slow + ' times')}</p>
        <button type="button" class="memv__pause" aria-pressed="false"${FAST ? ' hidden' : ''}><span class="memv__wide">Pause the molecules</span><span class="memv__short">Pause</span></button>
      </div>
      <div class="memv__key" hidden></div>
      <aside class="memv__panel" aria-label="The steps">
        <div class="iblv-cline"><p class="memv__count" aria-live="polite"></p><div class="memv__lvl">${levelSwitch()}</div></div>
        <nav class="memv__steps" aria-label="The steps"></nav>
        <h2 class="memv__st"></h2>
        <div class="memv__text" aria-live="polite"></div>
        <div class="memv__ctl"></div>
        <div class="memv__text memv__text--more"></div>
        <div class="memv__do">
          <button type="button" class="memv__back" aria-label="The step before">← Back</button>
          <button type="button" class="memv__next">Next step →</button>
        </div>
        <div class="iblv-foot">${levelSwitch()}</div>
        <section class="memv__more">
          <h3>What the tags mean</h3>
          <div class="memv__tags">
            <p><span class="lv lv--sl">SL and HL</span> ${esc(LEVELS.sl.long)}.</p>
            <p><span class="lv lv--hl">HL only</span> ${esc(LEVELS.hl.long)}.</p>
            <p><span class="lv lv--x">Beyond the guide</span> ${esc(LEVELS.x.long)}.</p>
            <p>The codes (B2.1.10 …) are the IB guide's own numbers for each statement.</p>
          </div>
          <h3>What this picture simplifies</h3>
          <ul class="memv__simple">${SIMPLE.map(s => `<li>${tagX}${esc(fill(s))}</li>`).join('')}</ul>
          <h3>Sources</h3>
          <ol class="memv__src">${SOURCES.map(s => `<li>${esc(s.c)}${s.u ? ` <a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.u.replace(/^https?:\/\//, ''))}</a>` : ''}<span class="src">Used for: ${esc(s.s)}</span></li>`).join('')}</ol>
        </section>
      </aside>
    </div>`;
  mount.appendChild(root);
  const unmark = marks(root, mark);
  if (!css.sheet) {
    root.style.visibility = 'hidden';
    const on = () => { root.style.visibility = ''; };
    css.addEventListener('load', on, { once: true }); css.addEventListener('error', on, { once: true }); setTimeout(on, 4000);
  }
  if (inGame) document.documentElement.classList.add('memv-open');
  const $ = s => root.querySelector(s);
  const stageEl = $('.memv__stage'), veilEl = $('.memv__veil'), waitEl = $('.memv__wait'), keyEl = $('.memv__key'), panelEl = $('.memv__panel');
  const countEl = $('.memv__count'), titleEl = $('.memv__st'), textEl = $('.memv__text'), moreEl = $('.memv__text--more'), ctlEl = $('.memv__ctl'), nextB = $('.memv__next'), backB = $('.memv__back'), stepsEl = $('.memv__steps');
  const barEl = $('.memv__bar'), pauseB = $('.memv__pause'), slowEl = $('.memv__slow'), osmoEl = $('.memv__osmo'), capEl = $('.memv__cap'), arrowEl = $('.memv__arrow');
  const SLOW_T = slowEl.textContent;

  /* ---------------- the model, its picture, the camera ---------------- */
  const S = makeSim(7), stage = makeStage(stageEl), scene = makeScene(S);
  stage.scene.add(scene.group);
  stage.renderer.domElement.setAttribute('aria-label', 'A piece of cell membrane in 3D: two layers of phospholipids with cholesterol and proteins. ' + (FAST ? 'A still picture.' : 'The molecules move.'));
  const names = makeNames(stageEl, stage, keyEl);
  /* step 9's piece, its aquaporin and its water: made in the background once the first step shows (the measured shape is
     fetched then), or when step 9 is asked for first */
  let A = null, aqpMaking = null, patch = 'main', osmoMode = 'out';
  const aqpMake = () => aqpMaking || (aqpMaking = import('./aqp1.js?v=202611281627').then(async m => {
    if (closed) return null;
    const S2 = makeSim(5, AQP_PATCH), sc2 = makeScene(S2, { aqp: m.AQP1, water: true }), w2 = makeWater(S2, m.AQP1, osmoMode);
    sc2.soluteR = WATER.SOL_R; sc2.draw(0); sc2.setWater(w2);
    /* (its colour programs are made now, with the lights of the stage, before it is part of the picture: the first frame
       of step 9 does not stop, and nothing of it is ever drawn over the first piece) */
    try { if (stage.renderer.compileAsync) await stage.renderer.compileAsync(sc2.group, stage.cam, stage.scene); } catch (e) { console.error(e); }
    if (closed) { sc2.dispose(); return null; }
    sc2.group.visible = patch === 'aqp'; stage.scene.add(sc2.group);
    A = { S: S2, scene: sc2, water: w2, data: m.AQP1 };
    return A;
  }));
  /* which piece is shown: only its model runs */
  function setPatch(p) {
    patch = p; scene.group.visible = p === 'main'; if (A) A.scene.group.visible = p === 'aqp';
    keepsStale = true;
  }
  const cur3 = () => patch === 'aqp' && A ? A : { S, scene };
  const cur = { at: new THREE.Vector3(), az: 0, el: 0.3, dist: 60 };      /* where the camera is now */
  let viewName = 'whole', tw = null, dragAz = 0, dragEl = 0, closed = false, raf = 0;
  const narrow = () => stage.W < 560;
  const target = name => { const v = VIEWS[name], n = narrow(); return { at: new THREE.Vector3(...(n && v.atN ? v.atN : v.at)), az: v.az * RAD, el: v.el * RAD, dist: stage.distFor(n ? v.wN : v.w, n ? v.hN : v.h) }; };
  function applyCam() {
    stage.V.at.copy(cur.at); stage.V.az = cur.az + dragAz; stage.V.el = Math.max(-0.5, Math.min(1.35, cur.el + dragEl)); stage.V.dist = cur.dist; stage.place();
  }
  function setBar() {
    const ppn = stage.pxPerNm(), n = [10, 5, 2, 1].find(k => k * ppn <= 150) || 1;
    const w = Math.round(n * ppn);
    if (barEl.dataset.w !== String(w) || barEl.dataset.n !== String(n)) { barEl.firstElementChild.style.width = w + 'px'; barEl.lastElementChild.textContent = n + ' nm'; barEl.dataset.w = String(w); barEl.dataset.n = String(n); keepsStale = true; }
  }
  /* what no name may stand on: the two places' words, the scale bar, the speed line, the pause button (on a phone the
     last two stand in a strip under the picture: their boxes are then outside it) */
  let keeps = [], keepsStale = true;
  function readKeeps() {
    const s0 = stageEl.getBoundingClientRect();
    keeps = ['.memv__place--out', '.memv__place--cyt', '.memv__bar', '.memv__slow', '.memv__pause', '.memv__osmo', '.memv__cap'].map(q => $(q)).filter(e => e && !e.hidden).map(e => { const b = e.getBoundingClientRect(); return { l: b.left - s0.left, r: b.right - s0.left, t: b.top - s0.top, b: b.bottom - s0.top }; });
    keepsStale = false;
  }
  names.setKeepOut(() => { if (keepsStale) readKeeps(); return keeps; });
  /* each protein's parts outside the bilayer (above it, and below it), as boxes on the screen: no other name or upright
     line over them. A part below the membrane counts only where it shows under the cut face's lower edge: behind the
     membrane it is not seen, so a line there runs over nothing (y0, y1: its top and its foot, nm; w: half its width). */
  const OB = [{ k: 0, id: 'channel', y0: 3.75, y1: 2.4, w: 3.0 }, { k: 1, id: 'carrier', y0: 3.65, y1: 2.4, w: 2.5 }, { k: 2, id: 'glyco', y0: 8.1, y1: 2.4, w: 2.8 }, { k: 3, id: 'peripheral', y0: -2.4, y1: -5.9, w: 1.8 },
    { k: 0, id: 'channel', y0: -2.4, y1: -3.6, w: 2.5 }, { k: 1, id: 'carrier', y0: -2.4, y1: -4.5, w: 1.8 }, { k: 2, id: 'glyco', y0: -2.4, y1: -4.1, w: 0.8 }];
  const obst = OB.map(o => ({ id: o.id, l: 0, r: 0, t: 0, b: 0, x: 0 })), v3 = new THREE.Vector3(), s2 = { x: 0, y: 0, z: 0 };
  names.setObstacles(() => {
    if (patch === 'aqp') return [];      /* (step 9: one protein, the aquaporin, which its own names may cross) */
    const ppn = stage.pxPerNm();
    for (let n = 0; n < OB.length; n++) {
      const p = S.prot[OB[n].k], o = obst[n];
      stage.project(v3.set(p.x, OB[n].y0, p.z), s2); o.x = s2.x; o.t = s2.y; o.l = s2.x - OB[n].w * ppn; o.r = s2.x + OB[n].w * ppn;
      stage.project(v3.set(p.x, OB[n].y1, p.z), s2); o.b = s2.y;
      if (n > 3) { stage.project(v3.set(p.x, -2.45, P.D / 2), s2); o.t = Math.max(o.t, s2.y); if (o.b < o.t) o.b = o.t; }      /* only what shows under the cut face */
    }
    return obst;
  });

  /* ---------------- the names of a step: where each one's line ends ----------------
     A name of a lipid part ends on ONE lipid: the nearest of its kind to a chosen place whose named part is SEEN at its
     point in the frame just drawn. The pixel there is read back (stage.probe, seen.js): the part's own colour means
     that no other molecule stands in front of it (the expert review, 13 Nov 2026: "hydrophobic tails" had ended on a
     cholesterol molecule in front of the tails). For a level line from a margin, the pixel 0.95 nm further out must
     be empty too: the lipid is the last one at that end of the cut face, so the line runs over nothing. For an upright
     line (dir 1 from above, -1 from below) no protein may be in the line's way. The lipid is kept while all that
     stays true and it stays within `keep` nm of the place (two misses are forgiven: a tail swings); it is looked at 5
     times a second, never while nothing is drawn. layer 2: either layer. On a phone a name is a numbered pin above or under its part (N:
     the place for that), with a short upright line. */
  const isPL = i => S.kind[i] !== 1, isChol = i => S.kind[i] === 1, isKink = i => S.kind[i] === 0 && S.kink[i] === 1, isGly = i => S.kind[i] === 2;
  /* a lipid of the back row, or at the cut face itself (little can stand in front of it there). The lipid a name has
     kept may be a little further in (loose): a lipid that moves to and fro across the limit does not make its name come and go */
  let loose = false, looseZ = 1.2;
  const backRow = i => S.kind[i] === 0 && S.z[i] < -P.D / 2 + (loose ? 1.8 : 1.1), frontRow = i => S.z[i] > P.D / 2 - (loose ? looseZ : 0.8);
  const levelOK = side => { const az = (cur.az + dragAz) / RAD; return side === 'L' ? az < 10.5 : az > -10.5; };
  const ups = new Map();      /* where each name with an upright line ends now (px), and from which side it comes */
  /* stay: how far behind the cut face (nm) the molecule a name has may go before the name takes another one (for a
     molecule that is drawn again in front, `marked`: it is seen there too, and its name stays with it longer) */
  function pick({ layer, want, x, z, part, cls, dir = 0, keep = 2.5, side = null, N = null, id = '', clear = 0, also = null, patient = 3, stay = 1.2 }) {
    let c = -1, n = 0, miss = 0, wasNarrow = null;
    const q = new THREE.Vector3(), sq = { x: 0, y: 0, z: 0 }, MAX = 16, cand = new Int32Array(MAX), dist = new Float32Array(MAX);
    const at = i => { scene.lipidPoint(i, part, S.t, q); stage.project(q, sq); };
    const seen = (i, edge) => { at(i); if (sq.z >= 1 || stage.probe(sq.x, sq.y) !== cls) return false; return !edge || stage.probe(sq.x + edge * 0.95 * stage.pxPerNm(), sq.y) === 'none'; };
    /* a second part of the same molecule that must be seen too when a lipid is CHOSEN (the line passes over it) */
    const alsoSeen = i => { if (!also) return true; for (const a of [].concat(also)) { scene.lipidPoint(i, a, S.t, q); stage.project(q, sq); if (stage.probe(sq.x, sq.y) !== cls) return false; } return true; };
    /* in an upright line's way: a protein's part, or the line of another name that comes from the same side (their names
       would stand on each other; the one it has is given 30 px more) */
    const blocked = (i, d, mine) => { if (!d) return false; at(i);
      for (const o of obst) if (o.b > o.t + 1 && sq.x > o.l - 12 && sq.x < o.r + 12 && (d > 0 ? sq.y > o.t : sq.y < o.b)) return true;
      if (clear) for (const [other, u] of ups) if (other !== id && u.dir === d && Math.abs(sq.x - u.x) < clear - (mine ? 30 : 0)) return true;
      return false; };
    const f = out => {
      const nar = names.narrow, T = nar && N ? N : null, L = T && T.layer != null ? T.layer : layer, W = T && T.want ? T.want : want, X = T ? T.x : x, Z = T ? T.z : z;
      const edge = nar || !side ? 0 : side === 'L' ? -1 : 1, d = nar ? 0 : dir;
      if (edge && !levelOK(side)) return false;
      if (wasNarrow !== nar) { wasNarrow = nar; c = -1; }
      if (c < 0 || (n++ % 12) === 0) {
        loose = true; looseZ = stay; const still = c >= 0 && W(c) && Math.hypot(S.x[c] - X, S.z[c] - Z) < keep + (stay > 1.2 ? stay : 0); loose = false; looseZ = 1.2;
        let ok = still && !blocked(c, d, true);
        if (ok) { if (seen(c, edge)) miss = 0; else if (++miss >= patient) ok = false; }
        if (!ok) {
          const old = still ? c : -1;
          /* the 16 nearest of the kind within `keep`; of them the nearest that is seen (and, for a level line, is the last
             one at its end of the cut face); else the nearest that is seen; else the nearest */
          let m = 0, fall = -1, fd = 1e9;
          for (let i = (L === 2 ? 0 : L * S.PER), e = (L === 2 ? S.N : (L + 1) * S.PER); i < e; i++) {
            if (!W(i)) continue;
            const dd = (S.x[i] - X) * (S.x[i] - X) + (S.z[i] - Z) * (S.z[i] - Z);
            if (dd < fd) { fd = dd; fall = i; }
            if (dd > keep * keep) continue;
            if (m < MAX) { cand[m] = i; dist[m++] = dd; } else { let w = 0; for (let k = 1; k < MAX; k++) if (dist[k] > dist[w]) w = k; if (dd < dist[w]) { cand[w] = i; dist[w] = dd; } }
          }
          let best = -1, second = -1;
          for (let tries = 0; tries < m && best < 0; tries++) {
            let w = -1; for (let k = 0; k < m; k++) if (dist[k] >= 0 && (w < 0 || dist[k] < dist[w])) w = k;
            if (!blocked(cand[w], d)) { if (seen(cand[w], edge)) { if (alsoSeen(cand[w])) best = cand[w]; else if (second < 0) second = cand[w]; } else if (edge && second < 0 && seen(cand[w], 0)) second = cand[w]; }
            dist[w] = -1;
          }
          /* (no better one: the one it had stays if it is still seen, so that two near-equal lipids do not take turns) */
          c = best >= 0 ? best : old >= 0 && !blocked(old, d, true) && seen(old, 0) ? old : second >= 0 ? second : fall; miss = 0;
        }
      }
      return c >= 0 ? scene.lipidPoint(c, part, S.t, out) : false;
    };
    f.index = () => c;
    return f;
  }
  /* the molecule a name has chosen is drawn again in front, so that the line always ends ON it (scene.js setMark) */
  const marked = (kind, slot, f, k) => out => { const r = f(out); scene.setMark(kind, slot, r === false ? -1 : f.index(), k); return r; };
  const CORNER = { x: -12.7, z: 8.7 };      /* the cut face's left end */
  const localOf = (k, lx, ly, lz) => out => { const p = S.prot[k], c = Math.cos(p.ang), s = Math.sin(p.ang); return out.set(p.x + lx * c + lz * s, ly, p.z - lx * s + lz * c); };
  const front = (want, x) => ({ layer: 1, want: i => want(i) && frontRow(i), x, z: 8.9 });      /* reached from below: a lipid of the inner layer at the cut face */
  const LAB = {
    /* a head of the back row: an upright line from above reaches it over nothing */
    head: () => ({ mode: 'T', anchor: pick({ layer: 0, want: backRow, x: -2.5, z: -8.7, part: 'crown', cls: 'head', dir: 1, keep: 7, id: 'head', clear: 100, N: { want: i => S.kind[i] === 0 && frontRow(i), x: 10.5, z: 8.9 } }) }),
    /* in the side view the head named is one of the inner layer at the cut face, from below (the band above is the proteins') */
    head2: () => ({ mode: 'B', text: NAMES.head, anchor: pick({ layer: 1, want: i => isPL(i) && frontRow(i), x: -10.5, z: 8.9, part: 'head', cls: 'head', dir: -1, keep: 12, id: 'head2', clear: 95, N: front(isPL, -6.5) }) }),
    /* the tails, by a level line from the left margin: a tail of the inner layer's lipid at the cut face's left end; if no
       tail is seen there (a cholesterol stands at the corner), the nearest tail that is seen, up to 4 nm along the face */
    tails: () => ({ mode: 'L', anchor: pick({ layer: 1, want: isPL, x: CORNER.x, z: CORNER.z, part: 'tail0', cls: 'tail', side: 'L', keep: 4, N: front(isPL, -11) }) }),
    /* the bilayer, from below: its line ends on a head of the inner layer at the cut face */
    bilayer: () => ({ mode: 'B', anchor: pick({ layer: 1, want: i => isPL(i) && frontRow(i), x: 10.5, z: 8.9, part: 'head', cls: 'head', dir: -1, keep: 9, id: 'bilayer', clear: 95 }) }),
    /* the two kinds of tail, from below: each line ends on a tail of a phospholipid of the inner layer at the cut face,
       over that lipid's own head only. (Level lines to the two lipids at the cut face's corner were tried first: each
       time another lipid took the corner the names faded and came back, about once every two seconds.) The straight
       tail's lipid stands at least 4.2 nm from the bent one's (it was 3): the two names are buttons now and a little
       wider, and on a 1280 px laptop they need that to stand side by side (nearer, one of them had no room at times).
       A phone's picture is only 10 nm wide and its names are pins: there 3 nm, and a place further left, or the straight
       tail's lipid was at times beyond the picture's right edge. */
    unsat: () => { bent = pick(Object.assign({ part: 'tail1', cls: 'tail', dir: -1, keep: 6, stay: 3 }, front(isKink, -11))); return { mode: 'B', glide: true, anchor: marked('tail', 0, bent, 1) }; },
    sat: () => { const far = i => isPL(i) && !(bent && bent.index() >= 0 && Math.abs(S.x[i] - S.x[bent.index()]) < (names.narrow ? 3 : 4.2));
      return { mode: 'B', glide: true, anchor: marked('tail', 1, pick(Object.assign({ part: 'tail0', cls: 'tail', dir: -1, keep: 6, stay: 3 }, front(far, -5), { N: front(far, -6.4) })), 0) }; },
    /* cholesterol, from below: its line ends on the rings of one of the inner layer at the cut face, over its own red
       hydrophilic end, which is level with the heads (so one is chosen whose red end is seen too: no head stands in the
       line's way). The chosen one is drawn again in front (scene.js setMark), so a tail that comes to stand before it
       does not take its name away. In the close view it is one near the cut face's left end (x -12.3; it was -9, under
       the channel protein, whose part below the membrane stood in the line's way again and again: the name went and
       came back, and the checks of 13 and 17 Nov caught it away). A level line from a margin had to cross the tails of other lipids whenever no cholesterol was seen
       at the very end of the cut face; a line that ended on the small red end itself was often half covered by a head. */
    chol: () => ({ mode: 'B', glide: true, anchor: marked('chol', 0, pick({ layer: 1, want: i => isChol(i) && frontRow(i), x: STEPS[si].view === 'close' ? -12.3 : 11, z: 8.9, part: 'ring', also: 'oh', cls: 'chol', dir: -1, keep: 16, id: 'chol', clear: 95, stay: 3,
      /* (a phone: its pin stands under the membrane, where the left end has the scale bar: there the place it had before) */
      N: STEPS[si].view === 'close' ? { x: -9, z: 8.9 } : null })) }),
    /* a bead of the protein's top edge: the middle of the channel's top is its pore, of the carrier's its cleft (nothing there) */
    channel: () => ({ mode: 'T', own: 'channel', anchor: localOf(0, 2.42, 3.05, 0) }),
    carrier: () => ({ mode: 'T', own: 'carrier', anchor: localOf(1, 2.0, 3.0, 0) }),
    glyco: () => ({ mode: 'T', own: 'glyco', anchor: localOf(2, 0.3, 5.6, 0.15) }),
    peri: () => ({ mode: 'B', own: 'peripheral', anchor: out => scene.protLow(3, out) }),
    /* a glycolipid: its line ends on the third sugar unit of its chain, which stands clear above the heads (a line to
       its head was tried: the head is half hidden by the heads in front of it and by its own chain) */
    glycolipid: () => ({ mode: 'T', anchor: pick({ layer: 0, want: isGly, x: -3, z: 5, part: 'sugar', cls: 'sugar', dir: 1, keep: 14, id: 'glycolipid', clear: 100 }) }),
    /* step 9: the aquaporin and one of its subunits, from above, each line ending on the top of a subunit (the leftmost
       and the rightmost in the picture, so that their names stand apart); the water in single file, from below, on a
       molecule in the pore nearest the camera (seen through one wall of the protein); the water molecule that crosses
       the bilayer at the cut face's right end, by a level line from the right margin (beyond that end there is nothing) */
    aquaporin: () => ({ mode: 'T', own: 'aquaporin', anchor: out => A.scene.aqpTop(aqpOrder()[0], out) }),
    subunit: () => ({ mode: 'T', own: 'aquaporin', anchor: out => A.scene.aqpTop(aqpOrder()[3], out) }),
    file: () => ({ mode: 'B', own: 'aquaporin', anchor: out => A.water.porePoint(frontPore(), out) }),
    crossing: () => ({ mode: narrow() ? 'T' : 'R', anchor: out => A.water.crossPoint(0, out) }),      /* (a phone: its pin above it; under the membrane the corner holds "Cytoplasm") */
    /* step 9 (17 Nov 2026): one solute particle carries its name (it wanders: a small thing the pupil follows) */
    solute: () => ({ mode: 'tag', mark: '●', pri: 3, anchor: out => A.water.solutePoint(out) }),
    /* the freeze fracture film: each name just above its part, on a short line (the picture is full: a long line from a
       margin would run over the other half of the membrane) */
    fOuter: () => ({ mode: 'tag', pri: 3, anchor: out => scene.turned(out.set(-5.5, 0.3, 5.2)) }),
    fInner: () => ({ mode: 'tag', pri: 3, anchor: out => out.set(-7.5, -0.1, 6.8) }),
    fBump: () => ({ mode: 'tag', pri: 3, own: 'carrier', anchor: localOf(1, 2.0, 3.0, 0) }),
    /* (the gap of the carrier protein, whose bump the other name ends on: the two belong together; if the caption
       covers that gap, the channel protein's, else the glycoprotein's: the proteins do not move during the film) */
    fHole: () => ({ mode: 'tag', pri: 3, anchor: out => {
      if (keepsStale) readKeeps();
      for (const k of [1, 0, 2]) { scene.gapPoint(S.prot[k].x, S.prot[k].z, out); stage.project(out, s2); if (!keeps.some(q => s2.x > q.l - 30 && s2.x < q.r + 30 && s2.y > q.t - 30 && s2.y < q.b + 70)) return out; }
      return scene.gapPoint(S.prot[1].x, S.prot[1].z, out); } }),
    lipidTag: () => ({ mode: 'tag', tag: true, pri: 5, anchor: out => scene.litLipid >= 0 ? scene.lipidPoint(scene.litLipid, 'crown', S.t, out) : false }),
    protTag: () => ({ mode: 'tag', tag: true, mark: '◆', pri: 4, own: 'carrier', anchor: (f => out => scene.litProt >= 0 ? f(out) : false)(localOf(1, 2.0, 3.0, 0)) })
  };
  let bent = null;      /* the lipid that another name of the step must keep clear of */
  /* the aquaporin's subunits from left to right on the screen (their tops), and its pore nearest the camera: chosen once
     for the step's own camera (the aquaporin does not move) */
  let aqpSeen = null;
  const aqpOrder = () => aqpSeen.order, frontPore = () => aqpSeen.front;
  function aqpChoose() {
    const t = new THREE.Vector3(), q = { x: 0, y: 0, z: 0 }, p = A.S.prot[0], c = Math.cos(p.ang), s = Math.sin(p.ang);
    const order = [0, 1, 2, 3].map(k => { A.scene.aqpTop(k, t); stage.project(t, q); return [k, q.x]; }).sort((a, b) => a[1] - b[1]).map(a => a[0]);
    const camZ = stage.cam.position.clone();
    const front = A.water.pores.map((P0, i) => { const m = P0.pts[Math.floor(P0.pts.length / 2)]; t.set(p.x + m[0] * c + m[2] * s, 0, p.z - m[0] * s + m[2] * c); return [i, t.distanceTo(camZ)]; }).sort((a, b) => a[1] - b[1])[0][0];
    aqpSeen = { order, front };
  }
  function defineNames() {
    const st = STEPS[si], inFilm = !!(film && film.id === 'fracture');
    const ids = inFilm ? FILMS.fracture.shots[film.shot].labels.slice() : st.labels.slice();
    if (patch === 'aqp') aqpChoose();
    scene.setMark('tail', 0, -1); scene.setMark('tail', 1, -1); scene.setMark('chol', 0, -1);
    if (!inFilm) { if (follow.lipid) ids.push('lipidTag'); if (follow.protein) ids.push('protTag'); }
    bent = null;
    /* (the bent tail is defined before the straight one, which must take another lipid) */
    const order = ids.slice().sort((p, q) => (p === 'sat') - (q === 'sat')), made = {};
    order.forEach(id => { made[id] = LAB[id](); });
    /* each upright line's end is kept, so that a name of a lipid can choose a lipid clear of the other names' lines */
    ups.clear();
    order.forEach(id => { const L = made[id], a = L.anchor, dir = L.mode === 'T' ? 1 : L.mode === 'B' ? -1 : 0; if (!dir) return;
      L.anchor = out => { const r = a(out); if (r === false) ups.delete(id); else { stage.project(out, s2); ups.set(id, { x: s2.x, dir }); } return r; }; });
    /* card: the name is a button (it has a card at this level); sub: its small second word */
    names.define(ids.map(id => Object.assign({ id, text: NAMES[id], pri: 1, card: !inFilm && pressable(id), sub: !inFilm && st.subs && st.subs[id] ? st.subs[id] : '' }, made[id])), narrow());      /* pri: who is placed first (the tag of what is followed) */
    root.classList.toggle('is-pins', names.narrow);
    keepsStale = true; paintFound();
  }

  /* ---------------- the names are the lesson (17 Nov 2026; memory teach-on-the-picture) ----------------
     A name that has a card (text.js `cards`) is a button, on the picture and in the step's row of names (on a phone: its
     numbered pin and its line of the key under the picture). Pressed: its part lights, the other molecules dim, and its
     card opens in the sheet under the names, each line with its own level and code; the name is ticked and counted. At
     SL a card of HL lines only is not offered (its name is then a plain name). One card at a time. */
  const VIEW = 'membrane';
  let card = null;
  const pressable = id => { const t = (STEPS[si].cards || {})[id]; return !!t && !(level() === 'sl' && hlOnly(t)); };
  const pressIds = () => STEPS[si].labels.filter(pressable), keyOf = id => (si + 1) + ':' + id;
  const foundHere = () => { const F = found(VIEW); return new Set(pressIds().filter(id => F.has(keyOf(id)))); };
  const findBox = () => root.querySelector('.memv__find');
  function findHTML() {
    const ids = pressIds(); if (!ids.length) return '';
    return `<div class="memv__find"><div class="memv__findline"><span class="memv__ft">Press each name on the picture</span><span class="memv__fbar" aria-hidden="true"><i></i></span><b class="memv__fn"></b></div>`
      + `<div class="memv__chips" role="group" aria-label="The names on the picture">${ids.map(id => `<button type="button" class="memv__chip" data-id="${id}" data-codes="${esc(codesOf((STEPS[si].cards || {})[id]))}" aria-expanded="false">${esc(NAMES[id])}</button>`).join('')}</div>`
      + `<div class="memv__card" role="note" aria-live="polite" hidden></div></div>`;
  }
  function paintFound() {
    const ids = film ? [] : pressIds(), F = foundHere(), box = findBox();
    names.mark(F, card);
    if (box && !film) {
      box.querySelector('.memv__fn').textContent = `${F.size} of ${ids.length} found`; box.querySelector('.memv__fbar i').style.width = (ids.length ? 100 * F.size / ids.length : 0) + '%';
      box.querySelectorAll('.memv__chip').forEach(b => { b.classList.toggle('is-found', F.has(b.dataset.id)); b.classList.toggle('is-open', b.dataset.id === card); b.setAttribute('aria-expanded', String(b.dataset.id === card)); });
    }
    /* (a phone: the count stands with the key under the picture, where the names to press are) */
    let kc = keyEl.querySelector('.memv__kcount');
    if (ids.length && names.narrow) { if (!kc) { kc = document.createElement('span'); kc.className = 'memv__kcount'; keyEl.prepend(kc); } kc.textContent = `Press each name: ${F.size} of ${ids.length} found`; } else if (kc) kc.remove();
  }
  /* which molecules stay bright while a name's card is open (scene.js setFocus) */
  const focusOf = id => {
    switch (id) {
      case 'head': return [['head']]; case 'tails': return [['tail']]; case 'bilayer': return [['head', 'tail', 'chol', 'glsugar']];
      case 'unsat': return [['tail'], 'bent']; case 'sat': return [['tail'], 'straight']; case 'chol': return [['chol']];
      case 'channel': return [['prot:channel']]; case 'carrier': return [['prot:carrier']]; case 'glyco': return [['prot:glyco', 'sugar']]; case 'peri': return [['prot:peripheral']];
      case 'glycolipid': return [['glsugar']];
      case 'aquaporin': return [['aqp0', 'aqp1', 'aqp2', 'aqp3', 'water']]; case 'subunit': return [['aqp' + aqpOrder()[3], 'water']];
      case 'file': return [['water']]; case 'crossing': return [['water', 'head', 'tail', 'chol', 'glsugar']]; case 'solute': return [['solute']];
    }
    return [null];
  };
  function openCard(id) {
    if (loading || film || !pressable(id)) return;
    if (card === id) { closeCard(); return; }
    const st = STEPS[si], box = findBox() && findBox().querySelector('.memv__card'); if (!box) return;
    card = id; learn(VIEW, keyOf(id));
    box.innerHTML = `<div class="memv__cardh"><b>${esc(NAMES[id])}</b>${st.subs && st.subs[id] ? ` <i class="memv__sub">${esc(st.subs[id])}</i>` : ''}<button type="button" class="memv__cardx" aria-label="Close">×</button></div>` + paras(st.cards[id]);
    box.hidden = false;
    const f = focusOf(id); cur3().scene.setFocus(f[0], f[1] || null, FAST);
    paintFound();
    box.scrollIntoView({ block: 'nearest', behavior: FAST ? 'auto' : 'smooth' });
  }
  function closeCard() {
    if (!card) return; card = null;
    const box = findBox() && findBox().querySelector('.memv__card'); if (box) { box.hidden = true; box.innerHTML = ''; }
    scene.setFocus(null, null, FAST); if (A) A.scene.setFocus(null, null, FAST);
    paintFound();
  }
  names.setPress(id => openCard(id));
  panelEl.addEventListener('click', e => {
    const c = e.target.closest('.memv__chip'); if (c) { openCard(c.dataset.id); return; }
    if (e.target.closest('.memv__cardx')) { closeCard(); return; }
    const fb = e.target.closest('.memv__filmb'); if (fb) startFilm(fb.dataset.film);
  });

  /* ---------------- following one molecule ---------------- */
  const follow = { lipid: null, protein: null };
  const snapL = { x: new Float32Array(S.N), z: new Float32Array(S.N) }, snapP = S.prot.map(() => ({ x: 0, z: 0 }));
  function startFollow(what) {
    if (what === 'lipid') {
      /* a phospholipid of the outer layer, near the middle of the patch and not beside a protein */
      let pick = -1;
      for (let tries = 0; tries < 60 && pick < 0; tries++) {
        const x = (Math.random() - 0.5) * P.W * 0.5, z = (Math.random() - 0.3) * P.D * 0.5, i = scene.nearest(0, k => S.kind[k] === 0, x, z, -1);
        /* (well clear of the carrier protein: on a phone the two molecules' pins must not start on each other) */
        if (i >= 0 && i !== scene.litLipid && S.prot.every(p => Math.hypot(S.x[i] - p.x, S.z[i] - p.z) > (p.R || 0) + (p.id === 'carrier' ? 4 : 1.6))) pick = i;
      }
      if (pick < 0) pick = scene.pl[0];
      scene.lightLipid(pick); snapL.x.set(S.x); snapL.z.set(S.z);
      follow.lipid = { i: pick, t0: S.t, x0: S.x[pick], z0: S.z[pick] };
    } else {
      scene.lightProtein(1); S.prot.forEach((p, k) => { snapP[k].x = p.x; snapP[k].z = p.z; });
      follow.protein = { k: 1, t0: S.t, x0: S.prot[1].x, z0: S.prot[1].z };
    }
  }
  function stopFollow(what) {
    if (follow.lipid && what !== 'protein') { scene.lightLipid(-1); follow.lipid = null; }
    if (follow.protein && what !== 'lipid') { scene.lightProtein(-1); follow.protein = null; }
  }
  /* what is followed fades (0.32 s) before it goes: nothing leaves the picture in one frame */
  let fTw = null;
  const fadeFollow = (lipid, protein) => new Promise(res => { if (fTw) fTw.done(); fTw = { t0: performance.now(), ms: 320, lipid, protein, done: res }; });
  const nm = d => (Math.round(d * 10) / 10).toFixed(1);
  function measure() {
    const out = {};
    if (follow.lipid) {
      const f = follow.lipid; let sum = 0, n = 0;
      for (let i = 0; i < S.N; i++) { if (S.kind[i] === 1) continue; sum += Math.hypot(S.x[i] - snapL.x[i], S.z[i] - snapL.z[i]); n++; }
      out.lipid = { d: Math.hypot(S.x[f.i] - f.x0, S.z[f.i] - f.z0), t: S.t - f.t0, mean: sum / n, n };
    }
    if (follow.protein) {
      const f = follow.protein; let sum = 0;
      S.prot.forEach((p, k) => { sum += Math.hypot(p.x - snapP[k].x, p.z - snapP[k].z); });
      out.protein = { d: Math.hypot(S.prot[f.k].x - f.x0, S.prot[f.k].z - f.z0), t: S.t - f.t0, mean: sum / S.prot.length, n: S.prot.length };
    }
    return out;
  }
  function readouts() {
    const m = measure();
    for (const what of ['lipid', 'protein']) {
      const el = ctlEl.querySelector(`[data-r="${what}"]`); if (!el) continue;
      const v = m[what];
      const t = !v ? '' : what === 'lipid'
        ? `This phospholipid is <b>${nm(v.d)} nm</b> from its start after <b>${Math.round(v.t)} s</b>. All ${v.n.toLocaleString('en-GB')} phospholipids, on average: <b>${nm(v.mean)} nm</b>.`
        : `This carrier protein is <b>${nm(v.d)} nm</b> from its start after <b>${Math.round(v.t)} s</b>. All ${v.n} proteins, on average: <b>${nm(v.mean)} nm</b>.`;
      if (el.dataset.t !== t) { el.innerHTML = t; el.dataset.t = t; }
    }
  }
  function drawControls() {
    const ctl = STEPS[si].ctl || [];
    const label = w => w === 'lipid' ? (follow.lipid ? (FAST ? `Show ${STILL_S} more seconds` : 'Follow another phospholipid') : 'Follow one phospholipid')
      : (follow.protein ? (FAST ? `Show ${STILL_S} more seconds` : 'Follow the carrier protein again') : 'Follow the carrier protein');
    /* made once for a step; a press then changes only the button's words (the button keeps the keyboard's place) */
    if (ctlEl.dataset.s !== String(si)) {
      ctlEl.dataset.s = String(si);
      ctlEl.innerHTML = ctl.map(w => `<div class="memv__f"><button type="button" class="memv__fb" data-f="${w}"><i></i><span></span></button><p class="memv__read" data-r="${w}" aria-live="off"></p></div>`).join('')
        + (FAST && ctl.length ? `<p class="memv__still">Reduce motion is on in your computer's settings, so this picture does not move. Each press shows ${STILL_S} seconds of movement as one still picture, with the whole path.</p>` : '');
    }
    ctl.forEach(w => { const b = ctlEl.querySelector(`.memv__fb[data-f="${w}"]`); b.setAttribute('aria-pressed', follow[w] ? 'true' : 'false'); b.lastElementChild.textContent = label(w); });
    readouts();
  }
  /* with Reduce motion: the model runs ahead unseen, then the still shows where everything is and the path taken */
  async function runStill(seconds) {
    const n = Math.round(seconds / P.DT);
    for (let k = 0; k < n; k++) {
      S.step();
      if (follow.lipid) scene.trailL.add(S.x[follow.lipid.i], S.z[follow.lipid.i]);
      if (follow.protein) scene.trailP.add(S.prot[1].x, S.prot[1].z);
      if (k % 360 === 359) await sleep(0);
    }
  }
  let busy = false;
  ctlEl.addEventListener('click', async e => {
    const b = e.target.closest('.memv__fb'); if (!b || busy || loading) return;
    const what = b.dataset.f;
    busy = true; const my = token;
    if (!FAST) {
      if (follow[what]) { await fadeFollow(what === 'lipid', what === 'protein'); if (my !== token || closed) { busy = false; return; } stopFollow(what); }
      startFollow(what); defineNames(); drawControls(); busy = false; b.parentNode.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return;
    }
    veilEl.classList.add('is-on'); await sleep(340);
    if (my !== token || closed) { busy = false; return; }
    if (!follow[what]) startFollow(what);
    await runStill(STILL_S);
    if (closed) return;
    defineNames(); drawControls(); veilEl.classList.remove('is-on'); busy = false; b.parentNode.scrollIntoView({ block: 'nearest' });      /* what the press added is in view (the readout, on a phone) */
  });
  pauseB.addEventListener('click', () => { running = !running; pauseB.setAttribute('aria-pressed', String(!running)); pauseB.firstElementChild.textContent = running ? 'Pause the molecules' : 'Let the molecules move'; pauseB.lastElementChild.textContent = running ? 'Pause' : 'Move'; keepsStale = true; });

  /* ---------------- the frame ---------------- */
  let running = !FAST, last = 0, acc = 0, ghostTw = null, namesOn = false, lastRead = 0, frozen = false, oTw = null, film = null, osmoN = null;
  function tick(now) {
    if (closed) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(100, last ? now - last : 16); last = now;
    if (stage.size()) { if (!tw) cur.dist = target(viewName).dist; keepsStale = true; if (names.narrow !== narrow()) defineNames(); }
    if (tw) {
      const k = Math.min(1, (now - tw.t0) / tw.ms), e = k * k * (3 - 2 * k);
      cur.at.lerpVectors(tw.from.at, tw.to.at, e); cur.az = tw.from.az + (tw.to.az - tw.from.az) * e; cur.el = tw.from.el + (tw.to.el - tw.from.el) * e;
      cur.dist = Math.exp(Math.log(tw.from.dist) + (Math.log(tw.to.dist) - Math.log(tw.from.dist)) * e);
      dragAz = tw.dAz * (1 - e); dragEl = tw.dEl * (1 - e);
      if (k >= 1) { const d = tw.done; tw = null; d(); }
    }
    if (fTw) {
      const k = Math.min(1, (now - fTw.t0) / fTw.ms);
      scene.dimFollow(fTw.lipid ? 1 - k : 1, fTw.protein ? 1 - k : 1);
      if (k >= 1) { const d = fTw.done; fTw = null; d(); }
    }
    if (ghostTw) {
      const k = Math.min(1, (now - ghostTw.t0) / ghostTw.ms);
      scene.setGhost(ghostTw.from + (ghostTw.to - ghostTw.from) * k);
      if (k >= 1) ghostTw = null;
    }
    /* freeze fracture: the outer layer turns back, or comes down again */
    if (oTw) {
      const k = Math.min(1, (now - oTw.t0) / oTw.ms), e = k * k * (3 - 2 * k);
      scene.setOpen(oTw.from + (oTw.to - oTw.from) * e);
      if (k >= 1) { const d = oTw.done; oTw = null; d(); }
    }
    /* the model: one step for each 60th of a second, never more than 3 in a frame (a slow frame slows the molecules, it
       never makes them jump) */
    const on = cur3();
    if (running && !loading && !frozen) { acc += dt; let n = 0; while (acc >= 1000 * P.DT && n < 3) { on.S.step(); if (on.water) on.water.step(P.DT); acc -= 1000 * P.DT; n++; } if (acc > 100) acc = 0; }
    applyCam(); setBar();
    on.scene.easeFocus(dt / 1000);
    on.scene.draw(on.S.t, stage.cam.position); if (on.water) on.scene.setWater(on.water);
    /* step 9's strip: the water that has crossed, each way */
    if (osmoN && on.water) { const c = on.water.c; if (osmoN.up.textContent !== String(c.up)) osmoN.up.textContent = c.up; if (osmoN.down.textContent !== String(c.down)) osmoN.down.textContent = c.down; }
    stage.render();
    names.frame(now, namesOn);
    if (now - lastRead > 250) { lastRead = now; readouts(); }
    stage.pace(dt);
  }

  /* ---------------- the steps ---------------- */
  let si = 0, token = 0, loading = true;
  const camTo = (name, ms) => new Promise(res => {
    viewName = name;
    const to = target(name), from = { at: cur.at.clone(), az: cur.az, el: cur.el, dist: cur.dist };
    if (!ms) { cur.at.copy(to.at); cur.az = to.az; cur.el = to.el; cur.dist = to.dist; dragAz = dragEl = 0; res(); return; }
    tw = { from, to, ms, t0: performance.now(), dAz: dragAz, dEl: dragEl, done: res };
  });
  const sameView = name => name === viewName && Math.abs(dragAz) + Math.abs(dragEl) < 1e-3;
  async function show(s) {
    const my = ++token; si = s;
    const st = STEPS[s], g = st.ghost ? 0.13 : 1;
    window.MEMBRANE.at = { step: s, rest: false };
    namesOn = false; nextB.disabled = backB.disabled = true; nextB.classList.remove('pulse');
    scene.setMark('tail', 0, -1); scene.setMark('tail', 1, -1); scene.setMark('chol', 0, -1);
    closeCard(); arrowClear();
    /* a film that is still on ends under the veil (the turned layer never comes back in one frame in plain view) */
    if (film) { veilEl.classList.add('is-on'); await sleep(340); if (my !== token) return; filmReset(); busy = false; await camTo(st.view, 0); ghostTw = null; scene.setGhost(g); }
    if (follow.lipid || follow.protein) {
      if (!FAST) { await fadeFollow(!!follow.lipid, !!follow.protein); if (my !== token) return; }
      stopFollow();
    }
    countEl.textContent = `Step ${s + 1} of ${STEPS.length}`; titleEl.textContent = st.title;
    /* a button for every step (Daniel, 14 Nov 2026, of the IB view: "there is no way to kind of easily navigate between all
       of the stages … add all of the steps … 1, 2, 3, as a clickable button"; the same here) */
    if (stepsEl.children.length !== STEPS.length) stepsEl.innerHTML = STEPS.map((x, k) => `<button type="button" data-s="${k}"${hlOnly(x) ? ' data-hlo=""' : ''} aria-label="Step ${k + 1}">${k + 1}</button>`).join('');
    Array.from(stepsEl.children).forEach((b, k) => { if (k === s) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    /* a step with buttons: its first paragraph (what to do), the buttons, then the rest, so that the buttons are in
       view beside the picture without scrolling */
    drawText(); paintFound();
    drawControls(); panelEl.scrollTop = 0;
    slowEl.textContent = st.note || SLOW_T; keepsStale = true;
    if (!st.osmo) { osmoEl.hidden = true; osmoN = null; root.querySelectorAll('.memv__conc').forEach(e => { e.hidden = true; }); }
    /* the other piece of membrane (step 9, and back): it changes under the veil, with or without Reduce motion */
    const want = st.patch || 'main';
    if (want !== patch) {
      if (want === 'aqp' && !A) { waitEl.hidden = false; await aqpMake(); waitEl.hidden = true; if (my !== token || !A) return; }
      if (!veilEl.classList.contains('is-on')) veilEl.classList.add('is-on');
      await sleep(340); if (my !== token) return;
      setPatch(want); await camTo(st.view, 0); ghostTw = null; scene.setGhost(g); await sleep(60); if (my !== token) return;
    }
    const moves = !sameView(st.view) || scene.ghost !== g;
    /* (the names of the step before fade from the next frame on: namesOn is off) */
    if (FAST) {
      /* a still for each step: the picture changes under the veil, never in one frame */
      if (moves && !veilEl.classList.contains('is-on')) veilEl.classList.add('is-on');
      await sleep(340); if (my !== token) return;
      if (moves) { await camTo(st.view, 0); scene.setGhost(g); await sleep(60); if (my !== token) return; }
      /* step 9's still: the water after STILL_OSMO seconds of crossings (the strip shows them), and an arrow */
      if (st.osmo && A && !A.stilled) { osmoStill(); A.scene.setWater(A.water); }
    } else {
      if (scene.ghost !== g) ghostTw = { from: scene.ghost, to: g, t0: performance.now(), ms: 700 };
      if (!sameView(st.view)) await camTo(st.view, 1400); else await sleep(340);
      if (my !== token) return;
    }
    if (st.osmo) { osmoDraw(); osmoEl.hidden = false; }
    defineNames(); namesOn = true; keepsStale = true;
    if (FAST && st.osmo) { applyCam(); osmoArrow(); }
    veilEl.classList.remove('is-on', 'is-first');
    backB.disabled = skip(STEPS, s, -1) < 0; nextB.disabled = false; nextB.classList.add('pulse');
    nextB.textContent = skip(STEPS, s, 1) < STEPS.length ? 'Next step →' : (inGame ? 'Back to the game →' : 'Start again →');
    if (!inGame) history.replaceState(null, '', '#s' + (s + 1));
    window.MEMBRANE.at = { step: s, rest: true };
  }
  const filmsHTML = st => (st.films || []).length ? `<div class="memv__films">${st.films.map(f => `<button type="button" class="memv__filmb" data-film="${f}" aria-pressed="false"><i aria-hidden="true">▶</i><span>${esc(FILMS[f].btn)}</span></button>`).join('')}${st.films.includes('mix') ? '<div class="memv__mix" hidden></div>' : ''}</div>` : '';
  function drawText() {
    const st = STEPS[si], T = fit(st.t), cut = st.ctl ? T.indexOf('\n') : -1, mid = findHTML() + filmsHTML(st);
    /* a step with buttons: its first paragraph (what to do), the buttons, then the rest, so that the buttons are in
       view beside the picture without scrolling */
    textEl.innerHTML = hlNote(st) + (cut < 0 ? paras(T, mid) : paras(T.slice(0, cut)));
    moreEl.innerHTML = cut < 0 ? '' : paras(T.slice(cut + 1), mid);
  }
  /* the IB level changed (SL · HL): a name whose card has only HL lines is a button at HL only */
  const onLevel = () => { if (loading || closed) return; if (card && !pressable(card)) closeCard(); const open = card; if (mix) { mix.stop(); mix = null; } drawText(); paintFound(); if (window.MEMBRANE.at.rest && !film) defineNames(); if (open) { card = null; openCard(open); } };
  document.addEventListener('iblevel', onLevel);

  /* ---------------- step 9: osmosis counted on the picture (text.js OSMO; water.js) ---------------- */
  const STILL_OSMO = 12;      /* with Reduce motion: the still shows the water after this many seconds of crossings (a molecule is then between the phospholipids) */
  const ICON_W = '<svg viewBox="0 0 26 20"><circle cx="13" cy="11.5" r="6.5" fill="#5fe3ff"/><circle cx="6.4" cy="5.6" r="3.6" fill="#fff"/><circle cx="19.6" cy="5.6" r="3.6" fill="#fff"/></svg>', ICON_S = '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#ff8a3d"/></svg>';
  function osmoDraw() {
    const out = osmoMode === 'out', way = out ? 'out of the cell' : 'into the cell';
    osmoEl.setAttribute('role', 'group');
    osmoEl.setAttribute('aria-label', `${OSMO.name}: ${out ? OSMO.hi : OSMO.lo} ${OSMO.out}, ${out ? OSMO.lo : OSMO.hi} ${OSMO.cyt}; more water molecules cross ${way} than the other way: ${OSMO.net} ${way}, ${OSMO.toward}`);
    /* (where the solute concentration is higher is said ON the two sides of the picture, with their names: the strip
       keeps the water's two numbers and what they add up to) */
    osmoEl.innerHTML = `<p class="memv__ok"><span class="memv__omol" aria-hidden="true">${ICON_W}</span>${esc(OSMO.name)}</p>`
      + `<p class="memv__on"><span aria-hidden="true">↑</span><b data-n="up">0</b> ${esc(OSMO.up)}</p><p class="memv__on"><span aria-hidden="true">↓</span><b data-n="down">0</b> ${esc(OSMO.down)}</p>`
      + `<p class="memv__of">${esc(OSMO.net)} ${way}, ${esc(OSMO.toward)}: <b>${esc(OSMO.osmosis)}</b></p>`
      /* (a phone: its picture has no room for the two sides' words, so the strip says them) */
      + `<p class="memv__oc"><b${out ? ' class="is-hi"' : ''}>${esc(out ? OSMO.hi : OSMO.lo)}</b> ${esc(OSMO.out)} · <b${out ? '' : ' class="is-hi"'}>${esc(out ? OSMO.lo : OSMO.hi)}</b> ${esc(OSMO.cyt)}</p>`
      + `<div class="memv__osw" role="group" aria-label="${esc(OSMO.ask)}"><span><span class="memv__omol" aria-hidden="true">${ICON_S}</span>${esc(OSMO.ask)}</span>${['out', 'cyt'].map(k => `<button type="button" data-osmo="${k}" aria-pressed="${k === osmoMode}">${esc(OSMO.choices[k])}</button>`).join('')}</div>`;
    osmoN = { up: osmoEl.querySelector('[data-n="up"]'), down: osmoEl.querySelector('[data-n="down"]') };
    if (A) { osmoN.up.textContent = A.water.c.up; osmoN.down.textContent = A.water.c.down; }
    const co = $('.memv__place--out .memv__conc'), cc = $('.memv__place--cyt .memv__conc');
    co.textContent = out ? OSMO.hi : OSMO.lo; cc.textContent = out ? OSMO.lo : OSMO.hi; co.hidden = cc.hidden = false;
    co.classList.toggle('is-hi', out); cc.classList.toggle('is-hi', !out);
    keepsStale = true;
  }
  function osmoStill() { for (let k = 0; k < STILL_OSMO * 60; k++) { A.S.step(); A.water.step(); } A.stilled = true; }
  /* with Reduce motion: an arrow through the pore nearest the camera, the way more water crosses */
  function osmoArrow() {
    if (!A) return;
    const m = A.water.mouth[frontPore()], up = osmoMode === 'out', v = new THREE.Vector3(), q = { x: 0, y: 0, z: 0 }, pts = [];
    for (const y of up ? [-3.9, 4.5] : [4.5, -3.9]) { stage.project(v.set(y < 0 ? m.lo.x : m.hi.x, y, y < 0 ? m.lo.z : m.hi.z), q); pts.push([q.x, q.y]); }
    arrowDraw(pts);
  }
  osmoEl.addEventListener('click', async e => {
    const b = e.target.closest('[data-osmo]'); if (!b || loading || busy || b.dataset.osmo === osmoMode || patch !== 'aqp' || !A) return;
    busy = true; const my = token;
    closeCard(); arrowClear(); namesOn = false; veilEl.classList.add('is-on'); await sleep(340);
    if (my !== token || closed) { busy = false; return; }
    /* the two solutions change places under the veil (no particle is seen crossing the membrane) */
    /* (the piece of membrane starts again with its water: the run is then the one the checks counted, water.js) */
    osmoMode = b.dataset.osmo; A.S.restart(); A.water = makeWater(A.S, A.data, osmoMode); A.stilled = false;
    if (FAST) osmoStill();
    A.scene.setWater(A.water); osmoDraw(); defineNames(); namesOn = true; await sleep(80);
    if (my !== token || closed) { busy = false; return; }
    if (FAST) osmoArrow();
    veilEl.classList.remove('is-on'); busy = false;
  });

  /* ---------------- an arrow on the picture (the stills of Reduce motion): a filled shape with a fixed head ---------------- */
  function arrowClear() { arrowEl.innerHTML = ''; }
  function arrowDraw(pts) {
    arrowClear(); if (pts.length < 2) return;
    arrowEl.setAttribute('viewBox', `0 0 ${stage.W} ${stage.H}`);
    const W2 = 6, HL = 26, HW = 15, L = [], R = [];
    /* the shaft stops where the head begins */
    const n = pts.length, ex = pts[n - 1][0] - pts[n - 2][0], ey = pts[n - 1][1] - pts[n - 2][1], el = Math.hypot(ex, ey) || 1, bx = pts[n - 1][0] - ex / el * HL, by = pts[n - 1][1] - ey / el * HL;
    const body = pts.slice(0, n - 1).concat([[bx, by]]);
    for (let i = 0; i < body.length; i++) {
      const a = body[Math.max(0, i - 1)], b = body[Math.min(body.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
      L.push([body[i][0] + nx * W2, body[i][1] + ny * W2]); R.push([body[i][0] - nx * W2, body[i][1] - ny * W2]);
    }
    const nx = -ey / el, ny = ex / el, f = v => v.map(c => c.toFixed(1)).join(',');
    const shape = L.concat([[bx + nx * HW, by + ny * HW], pts[n - 1], [bx - nx * HW, by - ny * HW]]).concat(R.reverse());
    arrowEl.innerHTML = `<polygon points="${shape.map(f).join(' ')}"/>`;
  }

  /* ---------------- the films (text.js FILMS): a guide line about a technique, shown as the technique ---------------- */
  let mix = null;
  const openTo = (to, ms) => new Promise(res => { if (!ms) { scene.setOpen(to); res(); return; } oTw = { from: scene.open, to, ms, t0: performance.now(), done: res }; });
  function capDraw() {
    const F = FILMS.fracture, m = /^\[(sl|hl)\s+([^\]]+)\]/.exec(F.tag), last = film.shot === F.shots.length - 1;
    capEl.innerHTML = `<p class="memv__capl"><span class="lv lv--${m[1]}">${esc(LEVELS[m[1]].name)} <i>${esc(m[2])}</i></span> ${F.shots.map((sh, k) => k > film.shot ? '' : `<span class="${k < film.shot ? 'is-was' : 'is-now'}">${esc(sh.say)}</span>`).join(' ')}</p>`
      + (last ? `<div class="memv__capg" role="group" aria-label="The picture's colours">${F.grey.map((w, k) => `<button type="button" data-grey="${k}" aria-pressed="${(film.grey ? 1 : 0) === k}">${esc(w)}</button>`).join('')}</div>` : '')
      + `<div class="memv__capnav">${film.shot ? '<button type="button" data-cap="back">← Back</button>' : ''}${last ? '<button type="button" data-cap="again">↻ Again</button>' : '<button type="button" class="memv__capnext" data-cap="next">Next →</button>'}<button type="button" data-cap="end">Back to the membrane</button></div>`;
    capEl.hidden = false; keepsStale = true;
  }
  /* the film stops at once (another step, the view closed): everything as a step expects it */
  function filmReset() {
    oTw = null; scene.setOpen(0); frozen = false; film = null; capEl.hidden = true; capEl.innerHTML = ''; arrowClear();
    root.classList.remove('is-film'); stage.renderer.domElement.classList.remove('is-grey');
    root.querySelectorAll('.memv__filmb').forEach(b => b.setAttribute('aria-pressed', 'false'));
    if (mix) { mix.stop(); mix = null; }
  }
  /* the turn, for the still of Reduce motion: from where a corner of the outer layer was (on the inner layer, at the
     picture's right edge of the membrane) to where it is now, on a bowed way beside the membrane */
  function turnArrow() {
    const v = new THREE.Vector3(), a = { x: 0, y: 0, z: 0 }, b = { x: 0, y: 0, z: 0 }, pts = [], bow = Math.min(84, stage.W * 0.1);
    stage.project(v.set(13.7, 0.5, 5.5), a); stage.project(scene.turned(v.set(13.7, 0.5, 5.5)), b);
    for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push([a.x + (b.x - a.x) * u + bow * 4 * u * (1 - u), a.y + (b.y - a.y) * u]); }
    arrowDraw(pts);
  }
  async function shotTo(k, ms) {
    const my = token; busy = true; namesOn = false; arrowClear();
    if (FAST) { veilEl.classList.add('is-on'); await sleep(340); if (my !== token || !film) { busy = false; return; } await camTo(k ? 'frac2' : 'frac', 0); await sleep(60); }
    else await camTo(k ? 'frac2' : 'frac', ms);
    if (my !== token || !film) { busy = false; return; }
    film.shot = k; if (!k) { film.grey = false; stage.renderer.domElement.classList.remove('is-grey'); }
    capDraw(); defineNames(); namesOn = true;
    if (FAST) { applyCam(); if (!k) turnArrow(); veilEl.classList.remove('is-on'); }
    busy = false;
  }
  async function startFilm(id) {
    if (loading || busy) return;
    if (id === 'mix') {
      const host = root.querySelector('.memv__mix'), b = root.querySelector('.memv__filmb[data-film="mix"]'); if (!host) return;
      if (mix) { mix.stop(); mix = null; host.hidden = true; host.innerHTML = ''; b.setAttribute('aria-pressed', 'false'); return; }
      const M = await import('./mix.js?v=202611281627'); if (closed || !host.isConnected) return;
      host.hidden = false; b.setAttribute('aria-pressed', 'true');
      /* (after each shot the film brings its own buttons into view, above Back and Next) */
      mix = M.makeMix(host, { FAST, film: FILMS.mix, levelName: LEVELS.sl.name });
      return;
    }
    if (film) { endFilm(); return; }
    const my = token; busy = true;
    closeCard(); arrowClear(); namesOn = false;
    film = { id: 'fracture', shot: 0, grey: false }; frozen = true;
    root.classList.add('is-film'); root.querySelector('.memv__filmb[data-film="fracture"]').setAttribute('aria-pressed', 'true');
    if (FAST) {
      veilEl.classList.add('is-on'); await sleep(340); if (my !== token) return;
      ghostTw = null; scene.setGhost(1); scene.setOpen(1); await camTo('frac', 0); await sleep(60); if (my !== token) return;
      capDraw(); defineNames(); namesOn = true; applyCam(); turnArrow(); veilEl.classList.remove('is-on'); busy = false; return;
    }
    /* the molecules stop (frozen); the lipids come back; the camera steps back; then the outer layer turns back */
    ghostTw = { from: scene.ghost, to: 1, t0: performance.now(), ms: 700 };
    await camTo('frac', 1500); if (my !== token || !film) return;
    await sleep(350); if (my !== token || !film) return;
    await openTo(1, 2800); if (my !== token || !film) return;
    capDraw(); defineNames(); namesOn = true; busy = false;
  }
  async function endFilm() {
    if (!film || busy) return;
    const my = token, st = STEPS[si], g = st.ghost ? 0.13 : 1; busy = true;
    namesOn = false; capEl.hidden = true; arrowClear(); stage.renderer.domElement.classList.remove('is-grey');
    if (FAST) { veilEl.classList.add('is-on'); await sleep(340); if (my !== token) return; filmReset(); scene.setGhost(g); await camTo(st.view, 0); await sleep(60); if (my !== token) return; defineNames(); namesOn = true; veilEl.classList.remove('is-on'); busy = false; return; }
    await openTo(0, 1500); if (my !== token) return;
    ghostTw = { from: scene.ghost, to: g, t0: performance.now(), ms: 700 };
    await camTo(st.view, 1300); if (my !== token) return;
    filmReset(); defineNames(); namesOn = true; busy = false;
  }
  capEl.addEventListener('click', e => {
    const g = e.target.closest('[data-grey]');
    if (g && film) { film.grey = g.dataset.grey === '1'; stage.renderer.domElement.classList.toggle('is-grey', film.grey); capEl.querySelectorAll('[data-grey]').forEach(b => b.setAttribute('aria-pressed', String((film.grey ? '1' : '0') === b.dataset.grey))); return; }
    const b = e.target.closest('[data-cap]'); if (!b || !film || busy) return;
    if (b.dataset.cap === 'next') shotTo(film.shot + 1, 1300);
    else if (b.dataset.cap === 'back') shotTo(film.shot - 1, 1100);
    else if (b.dataset.cap === 'end') endFilm();
    else if (b.dataset.cap === 'again') (async () => {
      const my = token; busy = true; namesOn = false; capEl.hidden = true; stage.renderer.domElement.classList.remove('is-grey'); film.shot = 0; film.grey = false;
      if (FAST) { busy = false; shotTo(0, 0); return; }
      await openTo(0, 900); if (my !== token || !film) return;
      await camTo('frac', 1100); if (my !== token || !film) return;
      await sleep(300); await openTo(1, 2800); if (my !== token || !film) return;
      capDraw(); defineNames(); namesOn = true; busy = false;
    })();
  });

  nextB.addEventListener('click', () => { if (nextB.disabled || loading) return; const j = skip(STEPS, si, 1); if (j < STEPS.length) show(j); else if (inGame) close(); else show(Math.max(0, skip(STEPS, -1, 1))); });
  backB.addEventListener('click', () => { if (backB.disabled || loading) return; const j = skip(STEPS, si, -1); if (j >= 0) show(j); });
  stepsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || loading || +b.dataset.s === si) return; show(+b.dataset.s); });

  /* the pupil may turn the picture (a drag); the next step brings the camera back */
  let down = null;
  stageEl.addEventListener('pointerdown', e => { if (loading || e.target.closest('button')) return; down = { x: e.clientX, y: e.clientY, az: dragAz, el: dragEl }; stageEl.setPointerCapture && stageEl.setPointerCapture(e.pointerId); });
  stageEl.addEventListener('pointermove', e => {
    if (!down || tw) return;
    dragAz = Math.max(-0.75, Math.min(0.75, down.az - (e.clientX - down.x) * 0.006));
    dragEl = Math.max(-0.6, Math.min(0.7, down.el + (e.clientY - down.y) * 0.006));
  });
  const up = () => { down = null; };
  stageEl.addEventListener('pointerup', up); stageEl.addEventListener('pointercancel', up);

  const onKey = e => {
    if (e.key === 'Escape') { if (inGame) close(); return; }
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight' && !nextB.disabled) nextB.click();
    if (e.key === 'ArrowLeft' && !backB.disabled) backB.click();
  };
  document.addEventListener('keydown', onKey);
  function close() { unmark();
    if (closed) return; closed = true; token++;
    cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); document.removeEventListener('iblevel', onLevel); if (mix) { mix.stop(); mix = null; }
    names.remove(); stage.scene.remove(scene.group); scene.dispose(); if (A) { stage.scene.remove(A.scene.group); A.scene.dispose(); } stage.stop(); root.remove();
    document.documentElement.classList.remove('memv-open');
    if (window.MEMBRANE && window.MEMBRANE.root === root) window.MEMBRANE = null;
    if (onClose) onClose();
  }
  if (inGame) $('.memv__close').addEventListener('click', close);

  /* ---------------- for the check tool ---------------- */
  window.MEMBRANE = {
    root, P, S, FAST, at: { step: 0, rest: false }, steps: STEPS.length, stepLabels: STEPS.map(s => s.labels),
    goto: s => show(s), close,
    names: () => names.state(performance.now()),
    measure,
    /* what is DRAWN now: each phospholipid head's x, y, z as the graphics chip gets them, and each protein's place */
    drawn: () => { const a = scene.heads.instanceMatrix.array, n = scene.pl.length, o = new Array(n * 3); for (let k = 0; k < n; k++) { o[k * 3] = a[k * 16 + 12]; o[k * 3 + 1] = a[k * 16 + 13]; o[k * 3 + 2] = a[k * 16 + 14]; } return { heads: o, layer: scene.pl.map(i => S.layer[i]), prot: scene.prots.map(q => [q.g.position.x, q.g.position.z]), chol: Array.from({ length: scene.ch.length }, (_, k) => scene.chol.instanceMatrix.array[k * 16 + 13]), steps: S.steps, trailL: scene.trailL.mesh.count, trailP: scene.trailP.mesh.count }; },
    setRunning: on => { running = !!on && !FAST; },
    px: () => stage.pxPerNm(), size: () => ({ W: stage.W, H: stage.H, narrow: narrow() }),
    /* what is DRAWN at this point of the picture: its red, green, blue and opacity (the picture is drawn again and read
       back at once) */
    pixel: (x, y) => { stage.render(); return stage.probe(x, y, true); },
    /* step 9: which piece is shown, its model's steps, its water (every molecule, each file's place and speed), the
       aquaporin's measured numbers, and where each drawn molecule is on the screen (px in the stage) */
    aqp: () => {
      if (!A) return null;
      const w = A.water.state(), v = new THREE.Vector3(), q = { x: 0, y: 0, z: 0 }, ppn = stage.pxPerNm();
      w.mol.forEach(m => { stage.project(v.set(m.x, m.y, m.z), q); m.sx = q.x; m.sy = q.y; });
      return { patch, steps: A.S.steps, lipids: A.S.N, prot: A.S.prot.map(p => ({ id: p.id, x: p.x, z: p.z, ang: p.ang })), water: w, box: A.data.box, rCore: A.data.rCore, room: A.data.room, pores: A.data.pores.length,
        parts: A.data.parts.length, drawnWater: A.scene.waterMesh.count, visible: A.scene.group.visible, mainVisible: scene.group.visible, ppn, WATER,
        waterSize: (g => { g.computeBoundingBox(); const b = g.boundingBox; return Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z); })(A.scene.waterMesh.geometry) };
    },
    makeSim,
    /* 17 Nov 2026: the names that are buttons in this step, those found, the open card; a press; what is lit; step 9's
       strip and water; the film */
    cards: () => ({ step: si, ids: pressIds(), found: [...foundHere()], open: card }),
    press: id => openCard(id), closeCard,
    focus: g => cur3().scene.focusOf(g),
    tails: () => cur3().scene.tailsNow(),   /* (which kind of tail is lit, and how bright each kind is drawn: tools/membrane-check.mjs J) */
    osmo: () => (A && patch === 'aqp') ? { mode: osmoMode, seed: SEED[osmoMode], still: !!A.stilled, state: A.water.state(), NW: [A.water.NW(1), A.water.NW(-1)], NS: [A.water.NS(1), A.water.NS(-1)], drawnSolutes: A.scene.soluteMesh.count } : null,
    film: () => film ? { id: film.id, shot: film.shot, grey: film.grey, open: scene.open, frozen, busy } : (mix ? { id: 'mix', shot: mix.shot, state: mix.state() } : null),
    startFilm: id => startFilm(id), WATER,
    toScreen: (x, y, z) => { const q = { x: 0, y: 0, z: 0 }; stage.project(new THREE.Vector3(x, y, z), q); return q; }
  };

  /* ---------------- start: the colours are made and the first picture drawn under the veil ---------------- */
  (async () => {
    const slow = setTimeout(() => { waitEl.hidden = false; }, 400);
    stage.size(); await camTo(STEPS[0].view, 0); applyCam(); scene.draw(0);
    try { if (stage.renderer.compileAsync) await stage.renderer.compileAsync(stage.scene, stage.cam); } catch (e) { console.error(e); }
    if (closed) return;
    raf = requestAnimationFrame(tick);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    clearTimeout(slow); waitEl.hidden = true; loading = false;
    let first = Math.max(0, Math.min(STEPS.length - 1, start | 0));
    const h = /^#s(\d+)$/.exec(location.hash || ''); if (!inGame && h) first = Math.max(0, Math.min(STEPS.length - 1, +h[1] - 1));
    /* the first step's camera is already there: the veil lifts on it */
    viewName = STEPS[first].view; await camTo(viewName, 0);
    if (STEPS[first].ghost) scene.setGhost(0.13);
    show(first);
    setTimeout(() => { if (!closed) aqpMake(); }, 1200);
  })();
  return { close, root };
}
