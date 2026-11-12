/* ============================================================
   view.js — the plant-cell branch of the Y7 cell game, "Where glucose comes from" (11 Nov 2026).
   Daniel, 11 Nov 2026: his Year 7 lessons teach animal and plant cells, so the game gets a plant-cell BRANCH, never a
   remade game: a palisade cell of a potato leaf, opened from two doors of the game (the way in's end card: "Where does
   this glucose come from?"; the Mission complete card: "Side quest: where does starch come from?"; both marked a side quest) and at its own
   address (plant-cell/, for the plant-and-animal-cells lesson). It opens over the whole page, as the IB view does; the
   game's path, items, energy, final check and code are unchanged, and closing it returns to the same card.
   It behaves as the game's places do (js/game/quest.js): the same panel, each step's words in a list, one step at a time;
   every step waits for Next (memory animations-wait-for-the-reader); what to press stands ON the part and is written,
   highlighted, in the step; ↻ beside a finished step plays that step again; names stand on level lines and show only
   while the picture is still; with Reduce motion every move jumps to its end and nothing is left out.
   The 3D stands on the shared stage (js/ib/stage.js: a camera that zooms, never a thing made bigger; a scale bar), in
   the game's own light (look.js). Its pictures are scene modules (leaf.js, potato.js, gut.js), fetched when their first
   step is reached; the words are in text.js. A scene: build(stage) → { group, knobs, views, steps [{ id, phases, labs,
   press, end, endLabs }], labels, hots, draw, dispose }. Any step can be shown from its start: the knobs at the start of
   step k are the first knobs with every earlier step's phases and its `end` applied.
   The board: one square when the last step is reached (Lesson.done, 'game-plant') and its checks (js/questions.js, part
   14), drawn by the game's own js/checks.js.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { makeStage, smooth } from '../ib/stage.js?v=202611121652';
import { gameLook } from './look.js?v=202611121652';
import { STEPS, LOOP, TITLE, KIND, DONE, FACT, CHECKS, TASK, XKEY, COURSE, LVNOTE } from './text.js?v=202611121652';

const R = window.REV;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const paras = t => /^\s*</.test(t) ? t : String(t).split('\n').map(x => `<p>${x}</p>`).join('');
const params = new URLSearchParams(location.search);
/* the tests (?still=1): every move jumps; Reduce motion: every move jumps, nothing is left out (core.js R.TEST, R.CALM) */
const FAST = R ? R.FAST : (params.has('still') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches));
const store = {
  get(k, d) { try { const v = localStorage.getItem('cellgame.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('cellgame.' + k, JSON.stringify(v)); } catch (e) { /* a private window: this visit only */ } }
};
const SCENES = { leaf: () => import('./leaf.js?v=202611121652'), potato: () => import('./potato.js?v=202611121652'), gut: () => import('./gut.js?v=202611121652'), ring: () => import('./ring.js?v=202611121652') };

/* its own styles: fetched with the view, never with the game's page */
function styles() {
  let l = document.querySelector('link[data-plantcss]');
  if (!l) { l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.plantcss = '1'; l.href = new URL('../../css/plant.css?v=202611121652', import.meta.url).href; document.head.appendChild(l); }
  return l;
}
/* the game calls this when a door first shows, never before: the view's code and styles and its first picture's code
   arrive while the pupil reads, so the door then opens at once */
export function warm() { styles(); SCENES.leaf().catch(() => {}); }

/* the loop, as a small map: six stops round a ring, the one this step is at lit */
export function loopMap(where, big) {
  const n = LOOP.length, W = big ? 620 : 340, H = big ? 330 : 122, cx = W / 2, cy = H / 2 + (big ? 10 : 2), rx = big ? 176 : 104, ry = big ? 96 : 36;
  const at = i => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; };
  const k = LOOP.findIndex(s => s.id === where);
  const arc = i => { const [x0, y0] = at(i + 0.16), [x1, y1] = at(i + 0.84); return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${rx} ${ry} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" class="lm__a${i < k ? ' on' : ''}" marker-end="url(#lmh${big ? 'b' : ''})"/>`; };
  const node = (s, i) => { const [x, y] = at(i), on = i === k, left = Math.cos(-Math.PI / 2 + (i / n) * Math.PI * 2) < -0.3, mid = Math.abs(x - cx) < 4;
    const g = big ? 16 : 10, tx = mid ? x : left ? x - g : x + g, ty = mid ? (i === 0 ? y - (big ? 30 : 10) : y + (big ? 26 : 17)) : y + (big ? -2 : 4), an = mid ? 'middle' : left ? 'end' : 'start';
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${on ? 6.5 : 4.5}" class="lm__n${on ? ' on' : i < k ? ' was' : ''}"/><text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${an}" class="lm__t${on ? ' on' : ''}">${esc(s.t)}${big ? `<tspan class="lm__s" x="${tx.toFixed(1)}" dy="17">${esc(s.s)}</tspan>` : ''}</text>`; };
  return `<svg class="lm${big ? ' lm--big' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="The loop of glucose: ${LOOP.map(s => s.t).join(', then ')}. You are at: ${esc((LOOP[k] || LOOP[0]).t)}.">
    <defs><marker id="lmh${big ? 'b' : ''}" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 z" class="lm__h"/></marker></defs>
    ${LOOP.map((_, i) => arc(i)).join('')}${LOOP.map(node).join('')}</svg>`;
}

export function openPlant({ mount = document.body, inGame = false, from = '', onClose = null } = {}) {
  const css = styles();
  const root = document.createElement('div');
  root.className = 'plv' + (inGame ? ' plv--game' : '');
  root.setAttribute('role', inGame ? 'dialog' : 'main'); if (inGame) root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'plv-h');
  root.innerHTML = `
    <header class="plv__top">
      ${inGame ? '<button type="button" class="plv__close">← Back to your mission</button>' : '<a class="plv__close" href="../">← The cell game</a>'}
      <div class="plv__id"><p class="plv__eyebrow">${inGame ? 'Side quest of the cell game · a plant cell' : 'Year 7 Biology · a plant cell'}</p><h1 id="plv-h">${esc(TITLE)}</h1></div>
      <p class="plv__by">Made by Dr Daniel Mompel Riera</p>
      <div class="plv__tools"><button type="button" class="tool plv__full" aria-label="Full screen">⛶<span class="tool__w"> Full screen</span></button></div>
    </header>
    <div class="plv__main">
      <div class="plv__stage">
        <div class="plv__hots"></div>
        <div class="plv__zoom" hidden><span class="plv__zhint"></span><button type="button" class="plv__zb" data-z="out" aria-label="Zoom out">−</button><button type="button" class="plv__zb" data-z="in" aria-label="Zoom in">+</button><button type="button" class="plv__zb plv__zhome" data-z="home" hidden>Whole view</button></div>
        <div class="plv__paper" hidden></div>
        <div class="plv__veil is-on is-first" aria-hidden="true"></div>
        <p class="plv__wait" hidden>Loading the picture…</p>
      </div>
      <aside class="quest plv__panel" aria-label="The steps">
        <div class="qp qp--place">
          <div class="qp__top"><span class="qp__kind">${esc(KIND)}</span><span class="plv__count" aria-live="polite"></span></div>
          <div class="plv__lv" hidden><span class="plv__lvk">Your course</span><button type="button" class="plv__lvb" data-lv="igcse" aria-pressed="false"><span class="plv__lvt" aria-hidden="true"><i></i></span>IGCSE</button><button type="button" class="plv__lvb" data-lv="ib" aria-pressed="false"><span class="plv__lvt" aria-hidden="true"><i></i></span>IB</button></div>
          ${inGame ? '<p class="plv__side"><b>Side quest.</b> This is extra, not part of your mission. Your game waits: press <b>← Back to your mission</b> at any time.</p>' : ''}
          <div class="plv__loop"></div>
          <ol class="steps"></ol>
          <div class="qp__end" hidden></div>
        </div>
      </aside>
    </div>`;
  mount.appendChild(root);
  if (!css.sheet) { root.style.visibility = 'hidden'; const on = () => { root.style.visibility = ''; }; css.addEventListener('load', on, { once: true }); css.addEventListener('error', on, { once: true }); setTimeout(on, 4000); }
  document.documentElement.classList.add('plv-open');
  const $ = s => root.querySelector(s), $$ = s => Array.from(root.querySelectorAll(s));
  const stageEl = $('.plv__stage'), hotsEl = $('.plv__hots'), panel = $('.plv__panel'), ol = $('.steps'), endEl = $('.qp__end'), veil = $('.plv__veil'), waitEl = $('.plv__wait'), paper = $('.plv__paper'), loopEl = $('.plv__loop'), countEl = $('.plv__count');
  const sound = () => (window.CELLGAME && window.CELLGAME.sound) || null;

  /* ---------------- the stage, the game's look, the knobs ---------------- */
  let scene = null, sceneKey = '', K = {}, tw = null, hots = [], drag = { yaw: 0, pitch: 0, on: false, home: false }, look = null, building = false;
  const Z = { k: 1, r: 0, u: 0, home: false, base: 1, max: 6 }, zoomEl = $('.plv__zoom'), zHome = $('.plv__zhome');
  const stage = makeStage(stageEl, { onFrame, render: (r, s, c, dt) => look.render(r, s, c, dt) });
  look = gameLook(stage);
  function onFrame(t, dt) {
    if (!scene || building) return;
    if (tw) {
      const k = tw.ms ? Math.min(1, (performance.now() - tw.t0) / tw.ms) : 1, e = k * k * (3 - 2 * k);
      for (const n in tw.to) K[n] = tw.from[n] + (tw.to[n] - tw.from[n]) * e;
      if (k >= 1) { const d = tw.done; tw = null; d(); }
    }
    if (scene.views && scene.views.length && K.cam != null) {
      const VW = scene.views, ci = x => Math.max(0, Math.min(VW.length - 1, Math.round(x)));
      const vw = i => VW[i].fit ? Object.assign({}, VW[i], stage.fitView(VW[i])) : VW[i];
      let v;
      if (tw && tw.to.cam != null && tw.from.cam !== tw.to.cam) { const f = (K.cam - tw.from.cam) / (tw.to.cam - tw.from.cam); v = stage.between(vw(ci(tw.from.cam)), vw(ci(tw.to.cam)), Math.max(0, Math.min(1, f))); }
      else { const w = vw(ci(K.cam)); v = { at: w.at.clone(), dist: w.dist, dir: w.dir.clone(), up: w.up.clone() }; }
      /* the pupil may turn the picture a little, round the point looked at; it comes back when a step moves the camera */
      if (drag.yaw || drag.pitch) {
        const q = new THREE.Quaternion().setFromAxisAngle(v.up, drag.yaw), side = new THREE.Vector3().crossVectors(v.up, v.dir).normalize();
        q.multiply(new THREE.Quaternion().setFromAxisAngle(side, drag.pitch)); v.dir = v.dir.clone().applyQuaternion(q);
      }
      if (scene.narrow && stage.W < 560) v.dist *= scene.narrow;
      /* the pupil's own zoom (see "zooming" below): nearer or further, toward the point they chose */
      Z.base = v.dist; Z.max = (ci(K.cam) < VW.length && VW[ci(K.cam)].zoom) || 6;
      if (Z.home) { Z.k = Math.exp(Math.log(Z.k) * 0.84); Z.r *= 0.84; Z.u *= 0.84; if (Math.abs(Math.log(Z.k)) < 0.004) { Z.k = 1; Z.r = Z.u = 0; Z.home = false; } }
      if (Z.k !== 1 || Z.r || Z.u) {
        const side = new THREE.Vector3().crossVectors(v.up, v.dir).normalize(), upv = new THREE.Vector3().crossVectors(v.dir, side).normalize();
        v.at = v.at.clone().addScaledVector(side, Z.r).addScaledVector(upv, Z.u); v.dist = v.dist / Z.k;
      }
      stage.setView(v);
      if (zHome.hidden !== !(Z.k !== 1 && !Z.home)) zHome.hidden = !(Z.k !== 1 && !Z.home);
    }
    if (look.day !== (K.day == null ? 1 : K.day)) look.setDay(K.day == null ? 1 : K.day);
    scene.draw(K, t, dt);
    if (at.rest && !tw && scene.group) lookForHidden();
    /* no name, and no name's line, over a molecule (the scene says where they are) */
    stage.setAvoid(scene.avoid ? scene.avoid() : []);
    /* the buttons on the parts follow them; no name stands on a button */
    const ko = [];
    hots.forEach(h => {
      const p = scene.hots[h.at] && scene.hots[h.at](); if (!p) return;
      const s = stage.project(p), bw = h.bw || (h.bw = h.el.offsetWidth), bh = h.bh || (h.bh = h.el.offsetHeight), G = 8;
      const dx = h.side === 'r' ? bw / 2 + 12 : h.side === 'l' ? -bw / 2 - 12 : 0, dy = h.side === 't' ? -bh / 2 - 12 : h.side === 'b' ? bh / 2 + 12 : 0;
      const x = Math.max(G + bw / 2, Math.min(stage.W - G - bw / 2, s[0] + dx)), y = Math.max(G + bh / 2 + 4, Math.min(stage.H - 46 - bh / 2, s[1] + dy));
      h.wrap.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; /* zoomed in by the pupil, a button whose part has left the picture is not shown at the picture's edge (it would point at nothing): "Whole view" brings it back */
      const off = Z.k > 1.05 && (s[0] < -4 || s[0] > stage.W + 4 || s[1] < -4 || s[1] > stage.H + 4);
      h.wrap.style.visibility = s[2] && !off ? 'visible' : 'hidden';
      ko.push({ l: x - bw / 2 - 4, r: x + bw / 2 + 4, t: y - bh / 2 - 4, b: y + bh / 2 + 4 });
    });
    if (scene.keepOut) ko.push(...scene.keepOut());
    if (!zoomEl.hidden) { const a = stageEl.getBoundingClientRect(), b = zoomEl.getBoundingClientRect(); ko.push({ l: b.left - a.left - 4, r: b.right - a.left + 4, t: b.top - a.top - 4, b: b.bottom - a.top + 4 }); }
    stage.setKeepOut(ko);
    if (!drag.on && drag.home && (drag.yaw || drag.pitch)) { drag.yaw *= 0.86; drag.pitch *= 0.86; if (Math.abs(drag.yaw) + Math.abs(drag.pitch) < 1e-3) { drag.yaw = drag.pitch = 0; drag.home = false; } }
  }
  /* ---------------- names point at what is seen ----------------
     Daniel, 12 Nov 2026: "because some of the labels are hidden behind other things, it seems that, for example, the
     mitochondrion was labeling something different. When I moved, then I realized that yes, it was pointing at the orange
     bits." A scene gives each name several points on its part; a name's line may end only on a point that the camera
     sees: nothing solid stands in front of it. Tested with rays against the picture's own parts, each time the picture
     comes to rest and each time the pupil has turned or zoomed it (once it is still again: a pass costs a few
     milliseconds, never during a move). See-through parts hide nothing (a wall of glass, the faint cells, a glow); nor
     does what a cut has taken away. A name with no point in view is not shown, rather than point at the wrong part.
     A label may say `through: true` (its part is a liquid or a space, seen through what is in it). */
  const seen = {}, pts3 = {}; let seenSig = '', seenWait = '', curLabs = {};
  const caster = new THREE.Raycaster(), cdir = new THREE.Vector3();
  const shownObj = o => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
  function solidHit(h) {
    const o = h.object; if (!o.isMesh || !shownObj(o)) return false;
    const m = Array.isArray(o.material) ? o.material[(h.face && h.face.materialIndex) || 0] : o.material;
    if (!m || m.visible === false || m.colorWrite === false || m.blending === THREE.AdditiveBlending) return false;
    if (m.transparent && m.opacity < 0.8) return false;
    if (m.clippingPlanes && m.clippingPlanes.some(pl => pl.distanceToPoint(h.point) < 0)) return false;
    return true;
  }
  /* is this point of the picture in view: nothing solid between it and the camera (but within `tol` of it: its own part) */
  function inView(p, tol) {
    const cam = stage.cam, d = cdir.copy(p).sub(cam.position).length(); if (d <= tol) return true;
    caster.camera = cam; caster.set(cam.position, cdir.normalize()); caster.near = cam.near; caster.far = d - tol;
    return !caster.intersectObject(scene.group, true).some(solidHit);
  }
  function lookForHidden() {
    const cam = stage.cam, sig = [cam.position.x, cam.position.y, cam.position.z, cam.quaternion.x, cam.quaternion.y, cam.quaternion.z].map(x => x.toPrecision(6)).join() + JSON.stringify(K) + Object.keys(curLabs).join();
    if (sig === seenSig) return;
    /* still moving under the pupil's hand: wait until two frames agree (the first pass at rest is at once) */
    if (seenSig && sig !== seenWait) { seenWait = sig; return; }
    seenSig = seenWait = sig;
    scene.group.updateMatrixWorld(true);
    const tol = 12 / stage.pxPerNm();
    Object.keys(curLabs).forEach(k => { const d = scene.labels && scene.labels[k]; if (!d || d.through) return; const P = d.pts() || []; pts3[k] = P; seen[k] = P.map(p => inView(p, tol)); });
  }
  const tweenTo = ph => new Promise(res => {
    const from = {}; Object.keys(ph.to).forEach(n => { from[n] = K[n] != null ? K[n] : ph.to[n]; });
    if (ph.to.cam != null) { drag.home = true; Z.home = true; }
    tw = { from, to: ph.to, ms: FAST ? 0 : (ph.ms != null ? ph.ms : 1600), t0: performance.now(), done: res };
  });
  /* at rest: the step's names. m: the step's moves, when it has a second set of names (labsX, see "the course layers") */
  const rest = (labs, m) => { xStep = m && m.labsX ? m : null; xLabs = labs || {}; paintX(); stage.showLabels(curLabs); seenSig = ''; if (scene && scene.group) lookForHidden(); stage.setRest(true); at.rest = true; };
  const moving = () => { xStep = null; paintX(); stage.showLabels({}); curLabs = {}; stage.setRest(false); at.rest = false; };

  /* ---------------- the course layers: IGCSE and IB ----------------
     Daniel, 12 Nov 2026: "just like for all the main quest, you can always add a toggle for IGCSE and then a toggle for
     IB … extra information … related to what you're showing here … only toggles that are activated once the student is
     done with the key stage 3, and the key stage 3 should be easy to understand." So: nothing of this shows until the
     side quest's five checks are all right (as the IB switch of a place in the game). Then the panel has two switches,
     "Your course: IGCSE · IB", off at the start. A switch on adds, under the words of every step, a violet box with what
     that course asks about what the step's picture shows (text.js COURSE); the Year 7 words never change. With IGCSE
     on, a picture that has a second set of names (its step's labsX: the piece of leaf) shows the names of the IGCSE
     syllabus, each on its part; on a phone there is no room for eleven names beside the picture, so each is a numbered
     pin on a level line and the box's key has the same numbers. The choice is kept. */
  const ks3Done = () => { try { const A = JSON.parse(localStorage.getItem('cellgame.answers') || '{}'); return CHECKS.every(q => A[q] && A[q].ok); } catch (e) { return false; } };
  const LV = Object.assign({ igcse: false, ib: false }, store.get('plantLv', {})), lvEl = $('.plv__lv');
  let xStep = null, xLabs = {};
  const lvOn = c => ks3Done() && !!LV[c];
  function paintX() { curLabs = xStep && lvOn('igcse') ? xStep.labsX : xLabs; }
  function paintLv() {
    const open = ks3Done(); lvEl.hidden = !open;
    ['igcse', 'ib'].forEach(c => { const on = open && !!LV[c]; root.classList.toggle('plv--' + c, on); lvEl.querySelector(`[data-lv="${c}"]`).setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  lvEl.addEventListener('click', e => { const b = e.target.closest('.plv__lvb'); if (!b || !ks3Done()) return; const c = b.dataset.lv;
    LV[c] = !LV[c]; store.set('plantLv', LV); paintLv(); paintX();
    if (at.rest) { stage.showLabels(curLabs); seenSig = ''; if (scene && scene.group) lookForHidden(); }
    /* the box just opened, of the step the pupil is on, comes into view */
    const li = cur >= 0 && liOf(cur), box = LV[c] && li && li.querySelector(`.plv__lvbox[data-lv="${c}"]`);
    if (box) requestAnimationFrame(() => { const p = panel.getBoundingClientRect(), k = box.getBoundingClientRect(); if (k.top < p.top + 40 || k.bottom > p.bottom) panel.scrollTo({ top: Math.max(0, panel.scrollTop + k.top - p.top - 52), behavior: FAST ? 'auto' : 'smooth' }); }); });
  document.addEventListener('progress', paintLv);
  paintLv();

  /* ---------------- the steps ---------------- */
  const saved = store.get('plant', {});
  let cur = -1, token = 0, at = { i: -1, rest: false, watching: false };
  const sceneSteps = () => scene.steps;
  const motion = id => scene.steps.find(s => s.id === id) || { phases: [] };
  /* the knobs when step i has ended (every earlier step of the same picture applied in order) */
  function knobsAfter(i) {
    const S0 = Object.assign({}, scene.knobs);
    /* a step of another picture is not among this picture's steps: it changes nothing here */
    for (let j = 0; j <= i; j++) { const m = motion(STEPS[j].id);
      (m.phases || []).forEach(ph => Object.assign(S0, ph.to));
      if (m.press && m.press.all) m.press.all.forEach(b => Object.assign(S0, b.to));
      if (m.end) Object.assign(S0, m.end); }
    return S0;
  }
  const frames = n => new Promise(r => { const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); });
  /* one picture at a time: a second call while one is being made waits for it (a step asked for twice, or two steps
     in quick turn, had left the dim over the picture) */
  let loading = null;
  function useScene(key) {
    if (loading) return loading.then(() => useScene(key));
    if (sceneKey === key && scene) return Promise.resolve(true);
    loading = makeScene(key).finally(() => { loading = null; });
    return loading;
  }
  async function makeScene(key) {
    building = true; stage.setBusy(true); moving(); clearHots();
    veil.classList.add('is-on'); const slow = setTimeout(() => { waitEl.hidden = false; }, 500);
    let sc = null;
    try {
      const mod = await SCENES[key]();
      sc = await mod.build(stage, { THREE, FAST, done: doneFlag });
      if (stage.renderer.compileAsync && sc.group) { try { stage.scene.add(sc.group); await stage.renderer.compileAsync(stage.scene, stage.cam); } catch (e) { /* drawn at its first frame instead */ } }
    } catch (e) {
      console.error(e); clearTimeout(slow);
      if (sc && sc.group) stage.scene.remove(sc.group);
      waitEl.innerHTML = 'This picture could not be loaded. <button type="button" class="plv__retry">Try again</button>'; waitEl.hidden = false;
      waitEl.querySelector('.plv__retry').addEventListener('click', () => { waitEl.hidden = true; waitEl.textContent = 'Loading the picture…'; show(cur < 0 ? 0 : cur); });
      building = false; stage.setBusy(false); return false;
    } finally { clearTimeout(slow); }
    waitEl.hidden = true;
    if (scene) { stage.scene.remove(scene.group); scene.dispose && scene.dispose(); }
    scene = sc; sceneKey = key; K = Object.assign({}, sc.knobs);
    if (sc.group && sc.group.parent !== stage.scene) stage.scene.add(sc.group);
    /* a phone has little room: a name may have a shorter form there (htmlN), the same name in fewer words; a name of
       the IGCSE set (pin: its number) is a numbered pin there, named in the step's key (see "the course layers") */
    const narrow = stage.W < 560, labs = {}; Object.keys(sc.labels || {}).forEach(k => { const d = sc.labels[k];
      const e = narrow && d.pin ? Object.assign({}, d, { html: String(d.pin), cls: (d.cls ? d.cls + ' ' : '') + 'is-pin', gaps: [30, 46, 64, 84, 110, 140] /* a pin stands beside the small picture, not on it */ }) : narrow && d.htmlN ? Object.assign({}, d, { html: d.htmlN }) : Object.assign({}, d);
      /* its line ends only on a point that is in view (see "names point at what is seen") */
      e.pts = () => { const P = d.pts() || []; pts3[k] = P; const m = seen[k]; if (d.through || !m || m.length !== P.length) return P; return P.filter((_, i) => m[i]); };
      labs[k] = e; });
    Object.keys(seen).forEach(k => delete seen[k]); Object.keys(pts3).forEach(k => delete pts3[k]); seenSig = '';
    root.classList.toggle('plv--pins', narrow);
    stage.defineLabels(labs);
    paper.hidden = !sc.paper; zoomEl.hidden = !!sc.paper; Z.k = 1; Z.r = Z.u = 0; Z.home = false; stage.setPaused(!!sc.paper); if (sc.paper) paper.innerHTML = sc.paper(); else paper.innerHTML = '';
    building = false; stage.setBusy(false);
    veil.classList.add('is-first'); await frames(2);
    veil.classList.remove('is-on', 'is-first');
    return true;
  }
  /* has the pupil finished the game's own test? (the mouth step then says "your amylase did this in well A") */
  function doneFlag(k) { try { const S = JSON.parse(localStorage.getItem('cellgame.state') || 'null'); return !!(S && S.done && S.done[k]); } catch (e) { return false; } }

  function clearHots() { hots.forEach(h => h.wrap.remove()); hots = []; }
  function hot(def, label, onPress, { auto = false } = {}) {
    const wrap = document.createElement('div'); wrap.className = 'hot3 hot3--c plv__hot';
    const el = document.createElement('button'); el.type = 'button'; el.className = 'hot3__b'; el.innerHTML = `<span>${label}</span>`;
    wrap.appendChild(el); hotsEl.appendChild(wrap);
    const h = { wrap, el, at: def.at, side: def.side || 'c', id: def.id || def.at };
    el.addEventListener('click', () => { if (el.disabled) return; const s = sound(); if (s && s.tap) s.tap(); onPress(h); });
    hots.push(h);
    /* a step watched again presses its own buttons */
    if (auto) setTimeout(() => { if (hots.includes(h) && !el.disabled) { el.classList.add('is-auto'); el.click(); } }, FAST ? 0 : 900);
    return h;
  }
  const liOf = i => ol.children[i];
  function addStep(i) {
    if (liOf(i)) return liOf(i);
    const li = document.createElement('li'); li.className = 'step is-later'; li.dataset.id = STEPS[i].id;
    /* the course boxes of the step (shown by the panel's switches, see "the course layers"): IGCSE, with the key of
       the picture's IGCSE names where it has them; IB, each line marked SL or HL */
    const id = STEPS[i].id, X = XKEY[id], G = COURSE.igcse[id], B = COURSE.ib[id];
    const boxes = (G || X ? `<div class="y8 plv__lvbox" data-lv="igcse"><span class="y8__k">IGCSE</span>${X ? `<div class="plv__xkey"><p>${X.intro}</p><ul class="plv__xlist">${X.rows.map((r, n) => `<li><b class="plv__xn">${n + 1}</b><span><b>${r[1]}</b>: ${r[2]}</span></li>`).join('')}</ul></div>` : ''}${(G || []).map(t => `<p>${t}</p>`).join('')}</div>` : '')
      + (B ? `<div class="y8 plv__lvbox" data-lv="ib"><span class="y8__k">IB</span>${B.map(([lv, t]) => `<p>${lv ? `<b class="plv__sl plv__sl--${lv.toLowerCase()}">${lv}</b> ` : ''}${t}</p>`).join('')}</div>` : '');
    li.innerHTML = `<div class="step__t">${paras(STEPS[i].text)}</div>${boxes}<div class="step__do"></div><div class="step__say" aria-live="polite"></div>`;
    ol.appendChild(li); if (R) R.terms(li); return li;
  }
  function again(i) {
    const li = liOf(i), m = scene && STEPS[i].scene === sceneKey ? motion(STEPS[i].id) : null;
    if (!li || li.querySelector('.step__again') || STEPS[i].scene === 'ring') return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'step__again'; b.setAttribute('aria-label', 'Watch this step again'); b.dataset.tip = 'Watch this step again'; b.textContent = '↻';
    const t = li.querySelector('.step__t'); (t.lastElementChild || t).appendChild(b);
    b.addEventListener('click', () => watch(i));
  }
  const say = (li, html, cls = 'ok') => { const s = li.querySelector('.step__say'); s.className = 'step__say ' + cls; s.innerHTML = paras(html); if (R) R.terms(s); reveal(s, true); };
  function reveal(el, glow) {
    requestAnimationFrame(() => {
      if (!el.isConnected) return;
      const pt = panel.getBoundingClientRect().top, er = el.getBoundingClientRect(), li = el.closest('.step') || el, lr = li.getBoundingClientRect();
      const y = v => v - pt + panel.scrollTop, room = panel.clientHeight, end = y(er.bottom) + 12, start = end - (y(lr.top) - 12) <= room ? y(lr.top) - 12 : y(er.top) - 12;
      let top = panel.scrollTop; if (end > top + room) top = end - room; if (start < top) top = start;
      if (Math.abs(top - panel.scrollTop) > 1) panel.scrollTo({ top, behavior: FAST ? 'auto' : 'smooth' });
      if (!glow) return; el.classList.remove('is-new'); void el.offsetWidth; el.classList.add('is-new'); setTimeout(() => el.classList.remove('is-new'), 1800);
    });
  }
  const nextBtn = (li, label) => new Promise(res => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn next pulse'; b.textContent = label + ' →';
    li.querySelector('.step__do').appendChild(b); reveal(b, false);
    b.addEventListener('click', () => { b.remove(); res(); }, { once: true });
  });

  /* one step: its picture's moves, then its buttons (each waits for the pupil), then Next. auto: watched again (↻): the
     buttons press themselves, nothing is said again or saved */
  async function play(i, { auto = false } = {}) {
    const my = token, st = STEPS[i], m = motion(st.id), li = liOf(i);
    Object.assign(K, knobsAfter(i - 1));
    /* a new step starts from its own picture: the pupil's zoom and turn go back, also when the camera does not move */
    if (Z.k !== 1 || Z.r || Z.u) Z.home = true; if (drag.yaw || drag.pitch) drag.home = true;
    moving();
    for (const ph of (m.phases || [])) {
      /* a cut: another place (from the mouth to the small intestine), so the picture dims and comes back there, as
         between two pictures; never one glide that would join the two places */
      if (ph.cut) { veil.classList.add('is-on'); await new Promise(r => setTimeout(r, FAST ? 0 : 420)); if (my !== token) { veil.classList.remove('is-on'); return false; } Object.assign(K, ph.to); await frames(2); veil.classList.remove('is-on'); await new Promise(r => setTimeout(r, FAST ? 0 : 380)); if (my !== token) return false; continue; }
      await tweenTo(ph); if (my !== token) return false; }
    rest(m.labs, m);
    const P = m.press;
    if (P && P.all) {
      const left = new Set(P.all.map(b => b.id)), shown = Object.assign({}, m.labs);
      await new Promise(res => {
        P.all.forEach(b => hot(b, b.label, async h => {
          h.el.disabled = true; h.wrap.remove(); hots = hots.filter(x => x !== h);
          moving(); await tweenTo({ to: b.to, ms: b.ms != null ? b.ms : 900 }); if (my !== token) return res();
          if (b.lab) shown[b.lab] = 1; if (b.labs) Object.assign(shown, b.labs);
          rest(P.all.length > 1 && b.lab ? Object.assign({ [b.lab]: 1 }, b.labs || {}) : shown);
          /* the mouth: what amylase did in the game's own test, if the pupil has done it */
          if (!auto && st.say && st.say[b.id]) say(li, st.say[b.id] + (st.say.wellA ? '\n' + (doneFlag('test') ? st.say.wellA : st.say.later) : ''));
          left.delete(b.id); if (!left.size) res();
        }, { auto }));
      });
      if (my !== token) return false;
      if (!auto && st.say && st.say.done) { const s = li.querySelector('.step__say'); s.insertAdjacentHTML('beforeend', `<p class="plv__all">${st.say.done}</p>`); reveal(s, false); }
    } else if (P && P.toggle) {
      /* one button with two states (light on, light off): Next comes once the first has been pressed; the pupil may go
         on pressing until then */
      let k = 0, busy = false, went = false;
      await new Promise(res => {
        const T = P.toggle;
        const h = hot(T, T.states[0].label, async () => {
          if (busy) return; busy = true; h.el.disabled = true;
          const S0 = T.states[k]; moving();
          /* the button says at once what a press will do next (it had read "Light on" while the light was on) */
          h.el.innerHTML = `<span>${T.states[(k + 1) % T.states.length].label}</span>`; h.bw = 0;
          await tweenTo({ to: S0.to, ms: S0.ms }); if (my !== token) return res();
          for (const ph of (S0.then || [])) { await tweenTo(ph); if (my !== token) return res(); }
          rest(S0.labs || m.labs);
          if (!auto && st.say && st.say[S0.say]) say(li, st.say[S0.say], S0.say === 'off' || S0.say === 'soft' ? 'no' : 'ok');
          k = (k + 1) % T.states.length; h.el.disabled = false; busy = false;
          if (auto) { if (k === 0 || T.states.length < 2 || went) return res(); went = true; setTimeout(() => { if (my === token) h.el.click(); }, FAST ? 0 : 1600); return; }
          if (!went) { went = true; nextBtn(li, 'Next step').then(() => { if (my === token) res(); }); }
        }, { auto });
      });
      if (my !== token) return false;
      clearHots();
    }
    clearHots();
    /* the step's end, the same however the pupil pressed */
    const end = knobsAfter(i), diff = {}; Object.keys(end).forEach(n => { if (K[n] !== end[n]) diff[n] = end[n]; });
    if (Object.keys(diff).length) { moving(); await tweenTo({ to: diff, ms: 700 }); if (my !== token) return false; }
    rest(m.endLabs || m.labs, m);
    return true;
  }
  async function show(i) {
    const my = ++token; cur = i; at = { i, rest: false, watching: false }; clearHots();
    const st = STEPS[i];
    for (let j = 0; j <= i; j++) { const li = addStep(j); li.hidden = false; li.className = 'step ' + (j < i ? 'is-done' : 'is-now'); if (j < i) { li.querySelector('.step__do').innerHTML = ''; } }
    for (let j = i + 1; j < ol.children.length; j++) ol.children[j].hidden = true;
    loopEl.innerHTML = loopMap(st.where); countEl.textContent = `Step ${i + 1} of ${STEPS.length}`;
    const li = liOf(i); li.querySelector('.step__say').innerHTML = ''; li.querySelector('.step__do').innerHTML = '';
    panel.scrollTo({ top: Math.max(0, li.offsetTop - 12), behavior: FAST || i === 0 ? 'auto' : 'smooth' });
    endEl.hidden = true;
    if (!(await useScene(st.scene))) return;
    if (my !== token) return;
    for (let j = 0; j < i; j++) again(j);
    const ok = await play(i); if (!ok || my !== token) return;
    const m = motion(st.id), last = i === STEPS.length - 1;
    /* a step with a two-state button has had its Next already */
    if (!(m.press && m.press.toggle)) await nextBtn(li, last ? 'Check what you learned' : 'Next step');
    if (my !== token) return;
    li.className = 'step is-done'; li.querySelector('.step__do').innerHTML = ''; again(i);
    const S = store.get('plant', {}); S.step = Math.max(S.step || 0, Math.min(STEPS.length - 1, i + 1)); if (last) S.done = true; store.set('plant', S);
    if (last) { if (R && R.L) R.L.done(TASK); finish(true); return; }
    show(i + 1);
  }
  /* ↻: a finished step plays again by itself, then the pupil is where they were */
  async function watch(i) {
    if (at.watching || building) return;
    const back = cur, ended = !endEl.hidden;
    const my = ++token; at = { i, rest: false, watching: true }; clearHots();
    const li = liOf(i); li.classList.add('is-watching'); root.classList.add('is-watching');
    const bar = document.createElement('p'); bar.className = 'step__watch'; bar.innerHTML = 'Playing this step again… <button type="button" class="btn ghost step__stop">Stop</button>'; li.appendChild(bar);
    let stopped = false; bar.querySelector('.step__stop').addEventListener('click', () => { stopped = true; token++; done(); });
    const done = () => { bar.remove(); li.classList.remove('is-watching'); root.classList.remove('is-watching'); at.watching = false; resume(back, ended); };
    if (!(await useScene(STEPS[i].scene)) || my !== token) { if (!stopped) done(); return; }
    await play(i, { auto: true }); if (my !== token) return;
    await new Promise(r => setTimeout(r, FAST ? 300 : 1800)); if (my !== token) return;
    done();
  }
  /* back to where the pupil was: the step they were on from its start, or the end card */
  function resume(i, ended) { if (ended) { token++; cur = STEPS.length - 1; restAtEnd(); } else show(i); }
  async function restAtEnd() {
    const my = token, i = STEPS.length - 1;
    if (!(await useScene(STEPS[i].scene)) || my !== token) return;
    Object.assign(K, knobsAfter(i)); rest((motion(STEPS[i].id).endLabs) || motion(STEPS[i].id).labs); endEl.hidden = false;
  }

  /* ---------------- the end: the checks, then the loop closed ---------------- */
  let painter = null;
  function finish(fresh) {
    for (let j = 0; j < STEPS.length; j++) { const li = addStep(j); li.hidden = false; li.className = 'step is-done'; li.querySelector('.step__do').innerHTML = ''; again(j); }
    loopEl.innerHTML = loopMap('cell'); countEl.textContent = '';
    const QS = window.QS || {}, qs = CHECKS.filter(q => QS[q] && window.REVchecks);
    endEl.hidden = false;
    endEl.innerHTML = `${qs.length ? '<p class="qp__k">Check what you learned</p><p class="qp__todo" role="status"></p>' : ''}
      ${qs.map(q => `<div class="q" data-q="${q}"></div>`).join('')}
      <div class="qp__won"></div>
      <div class="qp__nav">${inGame ? '<button type="button" class="qp__mapbtn plv__back">← Back to your mission</button>' : '<a class="qp__mapbtn plv__back" href="../">The cell game: make amylase →</a>'}<button type="button" class="qp__mapbtn plv__restart">↺ From the start</button></div>`;
    if (R) R.terms(endEl);
    $$('.qp__end .q').forEach(b => window.REVchecks.draw(b));
    const todo = endEl.querySelector('.qp__todo'), won = endEl.querySelector('.qp__won');
    const right = q => { const A = R && R.ans.get(q); return !!(A && A.ok); };
    let was = null;
    const paint = () => {
      if (!endEl.isConnected) { document.removeEventListener('progress', paint); return; }
      const n = qs.filter(right).length, all = n === qs.length;
      if (todo) { todo.hidden = all; todo.innerHTML = `To finish, answer every check: <b>${n} of ${qs.length}</b> right.`; }
      if (all === was) return; const now = was === false; was = all; if (!all) return;
      won.innerHTML = `<div class="qp__done">${starIcon()}<div>${paras(DONE)}</div></div>
        <aside class="fact"><p class="fact__k">✦ Did you know?</p><p>${FACT.text}</p><p class="fact__src">${esc(FACT.src)}</p></aside>
        <div class="y8 plv__lvnote"><span class="y8__k">IGCSE · IB</span><p>${LVNOTE}</p></div>`;
      paintLv();
      if (now) { const s = sound(); if (s && s.gain) s.gain(); won.scrollIntoView({ block: 'nearest', behavior: FAST ? 'auto' : 'smooth' }); }
    };
    paint(); if (painter) document.removeEventListener('progress', painter); painter = paint; document.addEventListener('progress', paint);
    const back = endEl.querySelector('button.plv__back'); if (back) back.addEventListener('click', close);
    endEl.querySelector('.plv__restart').addEventListener('click', () => { store.set('plant', Object.assign(store.get('plant', {}), { step: 0 })); endEl.hidden = true; ol.innerHTML = ''; show(0); });
    if (fresh) requestAnimationFrame(() => panel.scrollTo({ top: Math.max(0, endEl.offsetTop - 12), behavior: FAST ? 'auto' : 'smooth' }));
  }
  const starIcon = () => '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="#F0B43A" d="M12 2.2l2.9 6.2 6.7.8-5 4.6 1.4 6.7L12 17.1 6 20.5l1.4-6.7-5-4.6 6.7-.8z"/></svg>';

  /* ---------------- turning the picture a little; full screen; keys; close ---------------- */
  let down = null;
  stageEl.addEventListener('pointerdown', e => { if (building || e.target.closest('button, a')) return; down = { x: e.clientX, y: e.clientY, yaw: drag.yaw, pitch: drag.pitch }; drag.on = true; });
  stageEl.addEventListener('pointermove', e => { if (!down || (scene && scene.turn === false)) return; const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (Math.hypot(dx, dy) > 4) { drag.yaw = Math.max(-0.6, Math.min(0.6, down.yaw - dx * 0.006)); drag.pitch = Math.max(-0.4, Math.min(0.4, down.pitch - dy * 0.006)); drag.home = false; } });
  const up = () => { drag.on = false; down = null; };
  stageEl.addEventListener('pointerup', up); stageEl.addEventListener('pointercancel', up); stageEl.addEventListener('pointerleave', up);

  /* ---------------- zooming: toward what you point at ----------------
     Daniel, 12 Nov 2026: "I can move to the sides, but not zoom in and zoom out … I should be able to zoom in and zoom
     out from the cell wall, chloroplast, and see a little bit better the permanent vacuole." A scroll, a pinch (a
     trackpad's or two fingers'), the + and − buttons or the + and − keys bring the camera nearer or further; the point
     under the pointer, or between the fingers, stays under it (memory 3d-zoom-where-fingers-are). It is the camera that
     moves, never a part made bigger, so the scale bar follows. Each picture says how near it lets the camera come (its
     view's `zoom`, else 6 times); further than the step's own view: 0.6 times. A step that moves the camera puts the
     pupil's zoom back, as it does their turn; so does "Whole view". */
  const Z_MIN = 0.6;
  function zoomAt(x, y, f) {
    if (!scene || scene.paper || building || tw) return;
    const k = Math.max(Z_MIN, Math.min(Z.max, Z.k * f)); f = k / Z.k; if (Math.abs(f - 1) < 1e-4) return;
    const r = stageEl.getBoundingClientRect(), ppn = stage.pxPerNm(), dx = x - r.left - r.width / 2, dy = y - r.top - r.height / 2;
    Z.r += dx / ppn * (1 - 1 / f); Z.u -= dy / ppn * (1 - 1 / f); Z.k = k; Z.home = false;
    /* never further from the step's own picture than its edge: zoomed out again, the picture is where it was */
    const ppn0 = ppn / (Z.k / f), lim = Math.max(0, 1 - 1 / Z.k), mx = r.width / 2 / ppn0 * lim, my = r.height / 2 / ppn0 * lim;
    Z.r = Math.max(-mx, Math.min(mx, Z.r)); Z.u = Math.max(-my, Math.min(my, Z.u));
    root.classList.add('plv--zoomed-once');
  }
  /* a wheel: a mouse's notch is about 100 (a fifth nearer); a trackpad's pinch arrives as a wheel with ctrlKey, its
     deltaY 100 × ln(how far the fingers parted), so the picture follows the fingers */
  stageEl.addEventListener('wheel', e => { if (e.target.closest('.plv__paper')) return; e.preventDefault();
    const d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
    zoomAt(e.clientX, e.clientY, Math.exp(-Math.max(-1.2, Math.min(1.2, d * (e.ctrlKey ? 0.01 : 0.0018))))); }, { passive: false });
  /* two fingers on a touch screen: the picture follows them (apart: nearer), toward the point between them; no turn then */
  const fingers = new Map(); let span = 0;
  const twoF = () => { const [a, b] = [...fingers.values()]; return { d: Math.hypot(a[0] - b[0], a[1] - b[1]), x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2 }; };
  stageEl.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch' || e.target.closest('button, a')) return; fingers.set(e.pointerId, [e.clientX, e.clientY]); if (fingers.size === 2) { span = twoF().d; up(); } });
  stageEl.addEventListener('pointermove', e => { if (!fingers.has(e.pointerId)) return; fingers.set(e.pointerId, [e.clientX, e.clientY]);
    if (fingers.size === 2) { const t = twoF(); if (span > 8 && t.d > 8) zoomAt(t.x, t.y, t.d / span); span = t.d; down = null; drag.on = false; } });
  const offF = e => { fingers.delete(e.pointerId); span = 0; };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => stageEl.addEventListener(n, offF));
  /* Safari on a Mac sends a trackpad's pinch as "gesture" events (other browsers send the wheel above); not on a touch
     screen, where the fingers already arrive as pointers */
  let gs = 1;
  stageEl.addEventListener('gesturestart', e => { e.preventDefault(); gs = e.scale || 1; });
  stageEl.addEventListener('gesturechange', e => { e.preventDefault(); if (fingers.size) return; const sc = e.scale || 1; zoomAt(e.clientX, e.clientY, sc / gs); gs = sc; });
  zoomEl.addEventListener('click', e => { const b = e.target.closest('.plv__zb'); if (!b) return; const r = stageEl.getBoundingClientRect();
    if (b.dataset.z === 'home') { Z.home = true; drag.home = true; } else zoomAt(r.left + r.width / 2, r.top + r.height / 2, b.dataset.z === 'in' ? 1.5 : 1 / 1.5); });
  $('.plv__zhint').textContent = window.matchMedia && window.matchMedia('(pointer: coarse)').matches ? 'Pinch to zoom · drag to turn' : 'Scroll to zoom · drag to turn';
  /* full screen is the whole page, as in the game: a word's meaning opens in the page, so it must stay in what is shown */
  const fsB = $('.plv__full'), isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) fsB.hidden = true;
  fsB.addEventListener('click', () => { if (isFull()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else { const d = document.documentElement; (d.requestFullscreen || d.webkitRequestFullscreen || (() => {})).call(d); } });
  const onFull = () => { fsB.innerHTML = isFull() ? '⛶<span class="tool__w"> Leave full screen</span>' : '⛶<span class="tool__w"> Full screen</span>'; };
  document.addEventListener('fullscreenchange', onFull);
  const onKey = e => { if (e.key === 'Escape' && inGame && !document.querySelector('.tip') && !isFull()) close();
    /* + and −: zoom about the middle of the picture (not while the pupil types an answer) */
    if ((e.key === '+' || e.key === '=' || e.key === '-') && !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) && !zoomEl.hidden) { const r = stageEl.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, e.key === '-' ? 1 / 1.5 : 1.5); } };
  document.addEventListener('keydown', onKey);
  let closed = false;
  function close() {
    if (closed) return; closed = true; token++;
    document.removeEventListener('fullscreenchange', onFull); document.removeEventListener('keydown', onKey); document.removeEventListener('progress', paintLv);
    if (R && R.closeTip) R.closeTip();
    clearHots(); if (scene && scene.dispose) scene.dispose(); look.dispose(); stage.stop(); root.remove();
    document.documentElement.classList.remove('plv-open');
    if (onClose) onClose();
  }
  const cb = $('button.plv__close'); if (cb) cb.addEventListener('click', close);

  /* ---------------- for the checks (tools/plant-check.mjs, tools/plant-look.mjs) ---------------- */
  window.PLV = {
    get at() { return Object.assign({ scene: sceneKey, id: cur >= 0 ? STEPS[cur].id : '' }, at); },
    stepAtRest: () => !!(at.rest && !tw && !building),
    labels: () => stage.labelState(), stage, steps: STEPS.map(s => s.id),
    knobs: () => Object.assign({}, K), zoom: () => ({ k: Z.k, r: Z.r, u: Z.u, max: Z.max }), zoomAt, lv: () => ({ there: !lvEl.hidden, igcse: lvOn('igcse'), ib: lvOn('ib') }),
    /* the point of the picture (3D) that a name's line ended on when its screen place was xy */
    labelPoint: (k, xy) => { let best = null, bd = 1e9; (pts3[k] || []).forEach(p => { const q = stage.project(p), d = Math.hypot(q[0] - xy[0], q[1] - xy[1]); if (d < bd) { bd = d; best = p; } }); return best; },
    /* the names now shown whose line ends on a point that is NOT in view (a fresh test, not the kept one) */
    hidden: () => { if (!scene || !scene.group) return []; scene.group.updateMatrixWorld(true); const tol = 12 / stage.pxPerNm(), out = [];
      stage.labelState().filter(x => x.on).forEach(x => { const d = scene.labels[x.key]; if (!d || d.through) return; const P = pts3[x.key] || d.pts() || []; let best = null, bd = 1e9;
        P.forEach(p => { const q = stage.project(p), dd = Math.hypot(q[0] - x.p[0], q[1] - x.p[1]); if (dd < bd) { bd = dd; best = p; } });
        if (best && bd < 3 && !inView(best, tol)) out.push(x.key); });
      return out; }, sizes: () => (scene && scene.sizes) || null, measure: () => (scene && scene.measure ? scene.measure() : null), bar: () => { const b = root.querySelector('.ibv__bar'); return b ? { text: b.lastChild.textContent, px: parseFloat(b.firstChild.style.width), pxPerNm: stage.pxPerNm() } : null; },
    hots: () => hots.map(h => ({ id: h.id, label: h.el.textContent, box: (r => ({ l: r.left, r: r.right, t: r.top, b: r.bottom }))(h.el.getBoundingClientRect()) })),
    goto: i => show(Math.max(0, Math.min(STEPS.length - 1, i))), end: () => { token++; cur = STEPS.length - 1; finish(false); return restAtEnd(); }, close
  };

  /* where to start: where the pupil was (a finished branch opens at its end; ↺ From the start plays it again) */
  if (saved.done) { cur = STEPS.length - 1; finish(false); restAtEnd(); }
  else show(Math.max(0, Math.min(STEPS.length - 1, saved.step || 0)));
  return { close, root };
}
