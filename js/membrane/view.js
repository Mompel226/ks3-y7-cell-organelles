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
   For tools/membrane-check.mjs: window.MEMBRANE (the model, the drawn numbers, the names, the step).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { makeSim, P } from './sim.js?v=202611142326';
import { makeScene, makeStage } from './scene.js?v=202611142326';
import { makeNames } from './names.js?v=202611142326';
import { STEPS, NAMES, PLACES, LEVELS, SIMPLE, SOURCES } from './text.js?v=202611142326';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const FAST = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const STILL_S = 30;      /* with Reduce motion, Follow shows this many seconds of the model as one still */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* the numbers the words quote come from the model itself */
const million = n => { const m = n / 1e6; return (Math.abs(m - Math.round(m)) < 0.05 ? String(Math.round(m)) : m.toFixed(1)) + ' million'; };
const FILL = { slow: million(P.SLOW), wide: String(P.W), ratio: String(P.RATIO), real: String(Math.round(1e8 / P.SLOW) / 100) };
const fill = t => t.replace(/\{(\w+)\}/g, (m, k) => FILL[k] != null ? FILL[k] : m);
function paras(t) {
  return fill(t).split('\n').map(p => {
    const m = /^\[(sl|hl|x)(?:\s+([A-Z][0-9.]+(?:,\s*[A-Z][0-9.]+)*))?\]\s*/.exec(p);
    if (!m) return `<p>${p}</p>`;
    return `<p class="lvp lvp--${m[1]}"><span class="lv lv--${m[1]}">${esc(LEVELS[m[1]].name)}${m[2] ? ` <i>${esc(m[2])}</i>` : ''}</span> ${p.slice(m[0].length)}</p>`;
  }).join('');
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
  side: { at: [-0.6, 1.5, 0], atN: [0, -1.2, 0], az: 0, el: 3.5, w: 46.5, h: 19, wN: 31.5, hN: 18 }
};
const RAD = Math.PI / 180;

function styles() {
  let l = document.querySelector('link[data-memcss]');
  if (!l) {
    l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.memcss = '1';
    l.href = new URL('../../css/membrane.css?v=202611142326', import.meta.url).href; document.head.appendChild(l);
  }
  return l;
}
/* the game calls this when the door first shows: the styles come while the pupil reads (the code is already here) */
export function warm() { styles(); }

export function openMembrane({ mount = document.body, inGame = false, start = 0, onClose = null } = {}) {
  const css = styles();
  const root = document.createElement('div');
  root.className = 'memv' + (inGame ? ' memv--game' : '');
  root.setAttribute('role', inGame ? 'dialog' : 'main'); if (inGame) root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'memv-h');
  root.innerHTML = `
    <header class="memv__top">
      <div class="memv__id"><p class="memv__eyebrow">IB Biology · B2.1 Membranes and membrane transport</p><h1 id="memv-h">The cell membrane: fluid and mosaic</h1>
        <p class="memv__by">Made by Dr Daniel Mompel Riera</p></div>
      ${inGame ? '<button type="button" class="memv__close memv__home">← Back to the game</button>' : '<a class="memv__home" href="../">← The cell game</a>'}
    </header>
    <div class="memv__main">
      <div class="memv__stage">
        <p class="memv__place memv__place--out">${esc(PLACES.out)}</p>
        <p class="memv__place memv__place--cyt">${esc(PLACES.cyt)}</p>
        <div class="memv__bar"><i></i><span></span></div>
        <div class="memv__veil is-on is-first" aria-hidden="true"></div>
        <p class="memv__wait" hidden>Drawing the membrane…</p>
      </div>
      <div class="memv__tools">
        <p class="memv__slow">${FAST ? 'A still picture: Reduce motion is on' : esc('Sideways movement slowed about ' + FILL.slow + ' times')}</p>
        <button type="button" class="memv__pause" aria-pressed="false"${FAST ? ' hidden' : ''}><span class="memv__wide">Pause the molecules</span><span class="memv__short">Pause</span></button>
      </div>
      <div class="memv__key" hidden></div>
      <aside class="memv__panel" aria-label="The steps">
        <p class="memv__count" aria-live="polite"></p>
        <nav class="memv__steps" aria-label="The steps"></nav>
        <h2 class="memv__st"></h2>
        <div class="memv__text" aria-live="polite"></div>
        <div class="memv__ctl"></div>
        <div class="memv__text memv__text--more"></div>
        <div class="memv__do">
          <button type="button" class="memv__back" aria-label="The step before">← Back</button>
          <button type="button" class="memv__next">Next step →</button>
        </div>
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
  if (!css.sheet) {
    root.style.visibility = 'hidden';
    const on = () => { root.style.visibility = ''; };
    css.addEventListener('load', on, { once: true }); css.addEventListener('error', on, { once: true }); setTimeout(on, 4000);
  }
  if (inGame) document.documentElement.classList.add('memv-open');
  const $ = s => root.querySelector(s);
  const stageEl = $('.memv__stage'), veilEl = $('.memv__veil'), waitEl = $('.memv__wait'), keyEl = $('.memv__key'), panelEl = $('.memv__panel');
  const countEl = $('.memv__count'), titleEl = $('.memv__st'), textEl = $('.memv__text'), moreEl = $('.memv__text--more'), ctlEl = $('.memv__ctl'), nextB = $('.memv__next'), backB = $('.memv__back'), stepsEl = $('.memv__steps');
  const barEl = $('.memv__bar'), pauseB = $('.memv__pause');

  /* ---------------- the model, its picture, the camera ---------------- */
  const S = makeSim(7), stage = makeStage(stageEl), scene = makeScene(S);
  stage.scene.add(scene.group);
  stage.renderer.domElement.setAttribute('aria-label', 'A piece of cell membrane in 3D: two layers of phospholipids with cholesterol and proteins. ' + (FAST ? 'A still picture.' : 'The molecules move.'));
  const names = makeNames(stageEl, stage, keyEl);
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
    keeps = ['.memv__place--out', '.memv__place--cyt', '.memv__bar', '.memv__slow', '.memv__pause'].map(q => $(q)).filter(e => e && !e.hidden).map(e => { const b = e.getBoundingClientRect(); return { l: b.left - s0.left, r: b.right - s0.left, t: b.top - s0.top, b: b.bottom - s0.top }; });
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
  let loose = false;
  const backRow = i => S.kind[i] === 0 && S.z[i] < -P.D / 2 + (loose ? 1.8 : 1.1), frontRow = i => S.z[i] > P.D / 2 - (loose ? 1.2 : 0.8);
  const levelOK = side => { const az = (cur.az + dragAz) / RAD; return side === 'L' ? az < 10.5 : az > -10.5; };
  const ups = new Map();      /* where each name with an upright line ends now (px), and from which side it comes */
  function pick({ layer, want, x, z, part, cls, dir = 0, keep = 2.5, side = null, N = null, id = '', clear = 0, also = null }) {
    let c = -1, n = 0, miss = 0, wasNarrow = null;
    const q = new THREE.Vector3(), sq = { x: 0, y: 0, z: 0 }, MAX = 16, cand = new Int32Array(MAX), dist = new Float32Array(MAX);
    const at = i => { scene.lipidPoint(i, part, S.t, q); stage.project(q, sq); };
    const seen = (i, edge) => { at(i); if (sq.z >= 1 || stage.probe(sq.x, sq.y) !== cls) return false; return !edge || stage.probe(sq.x + edge * 0.95 * stage.pxPerNm(), sq.y) === 'none'; };
    /* a second part of the same molecule that must be seen too when a lipid is CHOSEN (the line passes over it) */
    const alsoSeen = i => { if (!also) return true; scene.lipidPoint(i, also, S.t, q); stage.project(q, sq); return stage.probe(sq.x, sq.y) === cls; };
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
        loose = true; const still = c >= 0 && W(c) && Math.hypot(S.x[c] - X, S.z[c] - Z) < keep; loose = false;
        let ok = still && !blocked(c, d, true);
        if (ok) { if (seen(c, edge)) miss = 0; else if (++miss >= 3) ok = false; }
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
       time another lipid took the corner the names faded and came back, about once every two seconds.) */
    unsat: () => { bent = pick(Object.assign({ part: 'tail1', cls: 'tail', dir: -1, keep: 6 }, front(isKink, -11))); return { mode: 'B', anchor: bent }; },
    sat: () => ({ mode: 'B', anchor: pick(Object.assign({ part: 'tail0', cls: 'tail', dir: -1, keep: 6 }, front(i => isPL(i) && !(bent && bent.index() >= 0 && Math.abs(S.x[i] - S.x[bent.index()]) < 3), -5))) }),
    /* cholesterol, from below: its line ends on the rings of one of the inner layer at the cut face, over its own red
       hydrophilic end, which is level with the heads (so one is chosen whose red end is seen too: no head stands in the
       line's way). A level line from a margin had to cross the tails of other lipids whenever no cholesterol was seen
       at the very end of the cut face; a line that ended on the small red end itself was often half covered by a head. */
    chol: () => ({ mode: 'B', anchor: pick({ layer: 1, want: i => isChol(i) && frontRow(i), x: STEPS[si].view === 'close' ? -9 : 11, z: 8.9, part: 'ring', also: 'oh', cls: 'chol', dir: -1, keep: 16, id: 'chol', clear: 95 }) }),
    /* a bead of the protein's top edge: the middle of the channel's top is its pore, of the carrier's its cleft (nothing there) */
    channel: () => ({ mode: 'T', own: 'channel', anchor: localOf(0, 2.42, 3.05, 0) }),
    carrier: () => ({ mode: 'T', own: 'carrier', anchor: localOf(1, 2.0, 3.0, 0) }),
    glyco: () => ({ mode: 'T', own: 'glyco', anchor: localOf(2, 0.3, 5.6, 0.15) }),
    peri: () => ({ mode: 'B', own: 'peripheral', anchor: out => scene.protLow(3, out) }),
    /* a glycolipid: its line ends on the third sugar unit of its chain, which stands clear above the heads (a line to
       its head was tried: the head is half hidden by the heads in front of it and by its own chain) */
    glycolipid: () => ({ mode: 'T', anchor: pick({ layer: 0, want: isGly, x: -3, z: 5, part: 'sugar', cls: 'sugar', dir: 1, keep: 14, id: 'glycolipid', clear: 100 }) }),
    lipidTag: () => ({ mode: 'tag', tag: true, pri: 5, anchor: out => scene.litLipid >= 0 ? scene.lipidPoint(scene.litLipid, 'crown', S.t, out) : false }),
    protTag: () => ({ mode: 'tag', tag: true, mark: '◆', pri: 4, own: 'carrier', anchor: (f => out => scene.litProt >= 0 ? f(out) : false)(localOf(1, 2.0, 3.0, 0)) })
  };
  let bent = null;      /* the lipid that another name of the step must keep clear of */
  function defineNames() {
    const ids = STEPS[si].labels.slice();
    if (follow.lipid) ids.push('lipidTag'); if (follow.protein) ids.push('protTag');
    bent = null;
    /* (the bent tail is defined before the straight one, which must take another lipid) */
    const order = ids.slice().sort((p, q) => (p === 'sat') - (q === 'sat')), made = {};
    order.forEach(id => { made[id] = LAB[id](); });
    /* each upright line's end is kept, so that a name of a lipid can choose a lipid clear of the other names' lines */
    ups.clear();
    order.forEach(id => { const L = made[id], a = L.anchor, dir = L.mode === 'T' ? 1 : L.mode === 'B' ? -1 : 0; if (!dir) return;
      L.anchor = out => { const r = a(out); if (r === false) ups.delete(id); else { stage.project(out, s2); ups.set(id, { x: s2.x, dir }); } return r; }; });
    names.define(ids.map(id => Object.assign({ id, text: NAMES[id], pri: 1 }, made[id])), narrow());      /* pri: who is placed first (the tag of what is followed) */
    keepsStale = true;
  }

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
  let running = !FAST, last = 0, acc = 0, ghostTw = null, namesOn = false, lastRead = 0;
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
    /* the model: one step for each 60th of a second, never more than 3 in a frame (a slow frame slows the molecules, it
       never makes them jump) */
    if (running && !loading) { acc += dt; let n = 0; while (acc >= 1000 * P.DT && n < 3) { S.step(); acc -= 1000 * P.DT; n++; } if (acc > 100) acc = 0; }
    applyCam(); setBar();
    scene.draw(S.t, stage.cam.position);
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
    if (follow.lipid || follow.protein) {
      if (!FAST) { await fadeFollow(!!follow.lipid, !!follow.protein); if (my !== token) return; }
      stopFollow();
    }
    countEl.textContent = `Step ${s + 1} of ${STEPS.length}`; titleEl.textContent = st.title;
    /* a button for every step (Daniel, 14 Nov 2026, of the IB view: "there is no way to kind of easily navigate between all
       of the stages … add all of the steps … 1, 2, 3, as a clickable button"; the same here) */
    if (stepsEl.children.length !== STEPS.length) stepsEl.innerHTML = STEPS.map((_, k) => `<button type="button" data-s="${k}" aria-label="Step ${k + 1}">${k + 1}</button>`).join('');
    Array.from(stepsEl.children).forEach((b, k) => { if (k === s) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    /* a step with buttons: its first paragraph (what to do), the buttons, then the rest, so that the buttons are in
       view beside the picture without scrolling */
    const cut = st.ctl ? st.t.indexOf('\n') : -1;
    textEl.innerHTML = paras(cut < 0 ? st.t : st.t.slice(0, cut)); moreEl.innerHTML = cut < 0 ? '' : paras(st.t.slice(cut + 1));
    drawControls(); panelEl.scrollTop = 0;
    const moves = !sameView(st.view) || scene.ghost !== g;
    /* (the names of the step before fade from the next frame on: namesOn is off) */
    if (FAST) {
      /* a still for each step: the picture changes under the veil, never in one frame */
      if (moves && !veilEl.classList.contains('is-on')) veilEl.classList.add('is-on');
      await sleep(340); if (my !== token) return;
      if (moves) { await camTo(st.view, 0); scene.setGhost(g); await sleep(60); if (my !== token) return; }
    } else {
      if (scene.ghost !== g) ghostTw = { from: scene.ghost, to: g, t0: performance.now(), ms: 700 };
      if (!sameView(st.view)) await camTo(st.view, 1400); else await sleep(340);
      if (my !== token) return;
    }
    defineNames(); namesOn = true; keepsStale = true;
    veilEl.classList.remove('is-on', 'is-first');
    backB.disabled = s === 0; nextB.disabled = false; nextB.classList.add('pulse');
    nextB.textContent = s < STEPS.length - 1 ? 'Next step →' : (inGame ? 'Back to the game →' : 'Start again →');
    if (!inGame) history.replaceState(null, '', '#s' + (s + 1));
    window.MEMBRANE.at = { step: s, rest: true };
  }
  nextB.addEventListener('click', () => { if (nextB.disabled || loading) return; if (si < STEPS.length - 1) show(si + 1); else if (inGame) close(); else show(0); });
  backB.addEventListener('click', () => { if (backB.disabled || loading) return; if (si > 0) show(si - 1); });
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
  function close() {
    if (closed) return; closed = true; token++;
    cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey);
    names.remove(); stage.scene.remove(scene.group); scene.dispose(); stage.stop(); root.remove();
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
    makeSim
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
  })();
  return { close, root };
}
