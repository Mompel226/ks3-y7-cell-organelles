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
   A step may also give course names (labsX, labsIB, or labsC: by the courses on, the IB level and the name looked at), a
   look for a name (looks: the camera's view and the knobs that light its part, shown before the name's card; where: a
   small map of where a nearer look is), and the scene may hear which names stand on the picture (named).
   The board: one square when the last step is reached (Lesson.done, 'game-plant') and its checks (js/questions.js, part
   14), drawn by the game's own js/checks.js.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { makeStage, smooth } from '../ib/stage.js?v=202611282133';
import { gameLook } from './look.js?v=202611282133';
import { course, setCourse, level, levelSwitch, boxLines } from '../game/iblevel.js?v=202611282133';
import { OPEN_AT } from './doors.js?v=202611282133';
import { STEPS, LOOP, LOOPBACK, TITLE, KIND, DONE, FACT, CHECKS, TASK, XKEY, COURSE, LVNOTE, FILMS, FILMSIZE, MEMSCENES, EQS, WORDS, wordOf, STATE, NAMES as PNAMES, nameOf } from './text.js?v=202611282133';

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
const SCENES = { leaf: () => import('./leaf.js?v=202611282133'), potato: () => import('./potato.js?v=202611282133'), gut: () => import('./gut.js?v=202611282133'), ring: () => import('./ring.js?v=202611282133') };

/* its own styles: fetched with the view, never with the game's page */
function styles() {
  let l = document.querySelector('link[data-plantcss]');
  if (!l) { l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.plantcss = '1'; l.href = new URL('../../css/plant.css?v=202611282133', import.meta.url).href; document.head.appendChild(l); }
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
  /* (the last link, from your cell back to the leaf, is not glucose: dashed, and named on the large ring: text.js LOOPBACK) */
  const arc = i => { const [x0, y0] = at(i + 0.16), [x1, y1] = at(i + 0.84), back = i === n - 1, [xm, ym] = at(i + 0.5);
    return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${rx} ${ry} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" class="lm__a${i < k ? ' on' : ''}${back ? ' lm__a--back' : ''}" marker-end="url(#lmh${big ? 'b' : ''})"/>`
      + (back && big ? `<text x="${(xm - 14).toFixed(1)}" y="${(ym - 20).toFixed(1)}" text-anchor="end" class="lm__t lm__t--back">${esc(LOOPBACK.t)}<tspan class="lm__s" x="${(xm - 14).toFixed(1)}" dy="16">${esc(LOOPBACK.s)}</tspan></text>` : ''); };
  const node = (s, i) => { const [x, y] = at(i), on = i === k, left = Math.cos(-Math.PI / 2 + (i / n) * Math.PI * 2) < -0.3, mid = Math.abs(x - cx) < 4;
    const g = big ? 16 : 10, tx = mid ? x : left ? x - g : x + g, ty = mid ? (i === 0 ? y - (big ? 30 : 10) : y + (big ? 26 : 17)) : y + (big ? -2 : 4), an = mid ? 'middle' : left ? 'end' : 'start';
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${on ? 6.5 : 4.5}" class="lm__n${on ? ' on' : i < k ? ' was' : ''}"/><text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${an}" class="lm__t${on ? ' on' : ''}">${esc(s.t)}${big ? `<tspan class="lm__s" x="${tx.toFixed(1)}" dy="17">${esc(s.s)}</tspan>` : ''}</text>`; };
  return `<svg class="lm${big ? ' lm--big' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="The loop of glucose: ${LOOP.map(s => s.t).join(', then ')}. From your cell back to the leaf: ${esc(LOOPBACK.t)}, ${esc(LOOPBACK.s)}. You are at: ${esc((LOOP[k] || LOOP[0]).t)}.">
    <defs><marker id="lmh${big ? 'b' : ''}" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 z" class="lm__h"/></marker></defs>
    ${LOOP.map((_, i) => arc(i)).join('')}${LOOP.map(node).join('')}</svg>`;
}

/* the IB views of 16 Nov 2026 that start from this branch's IB boxes: water potential (the vacuole) and from light to
   glucose (the chloroplast, the light); in the game the branch closes and the view opens over the game (main.js
   'ibview2'); at the branch's own address the door leads to the view's own address */
const VDOOR = { vacuole: ['water', '💧 Water potential: the view →'], chloroplast: ['light', '🌞 From light to glucose: the view →'], light: ['light', '🌞 From light to glucose: the view →'] };
/* (20 Nov 2026) at: { step, scene }: a visit by a door of the game (doors.js OPEN_AT says which steps and scenes). The
   view opens at that step ALONE and starts that scene; the way back stands in place of Next; nothing is saved, so the
   pupil's own place in the side quest is as it was. The door stands in a course's box of a place, which shows only
   once that place's Year 7 checks are right: so in a visit the course layers are open, whatever the pupil has done
   of this side quest. */
export function openPlant({ mount = document.body, inGame = false, from = '', onClose = null, at: door = null } = {}) {
  const visit = inGame && door && OPEN_AT[door.step] && STEPS.some(s => s.id === door.step) ? { i: STEPS.findIndex(s => s.id === door.step), scene: OPEN_AT[door.step].includes(door.scene) ? door.scene : '' } : null;
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
          <div class="qp__top"><span class="qp__kind">${esc(KIND).replace(PNAMES.palisade.y7, '<span data-cw="palisade">$&</span>')}</span><span class="plv__count" aria-live="polite"></span></div>
          <div class="plv__lv" hidden><span class="plv__lvk">Your course</span><button type="button" class="plv__lvb" data-lv="igcse" aria-pressed="false"><span class="plv__lvt" aria-hidden="true"><i></i></span>IGCSE</button><button type="button" class="plv__lvb" data-lv="ib" aria-pressed="false"><span class="plv__lvt" aria-hidden="true"><i></i></span>IB</button><span class="plv__lvl" hidden>${levelSwitch()}</span></div>
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
      /* (a view may hold other things on a phone: fitN, the membrane's scenes) */
      const vw = i => VW[i].fit ? Object.assign({}, VW[i], stage.fitView(stage.W < 560 && VW[i].fitN ? { fit: VW[i].fitN } : VW[i])) : VW[i];
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
    { const dk = scene.dusk ? scene.dusk() : 0; if (Math.abs(look.dusk - dk) > 0.003 || (dk === 0) !== (look.dusk === 0)) look.setDusk(dk); }
    scene.draw(K, t, dt);
    filmFrame(performance.now()); memFrame(dt); if (!wWhere.hidden) drawWhere(); if (!wEq.hidden) drawEq();
    if (at.rest && !tw && scene.group) lookForHidden();
    /* no name, and no name's line, over a molecule (the scene says where they are) */
    stage.setAvoid((scene.avoid ? scene.avoid() : []).concat(film || memOn ? routeAv : []));
    /* the buttons on the parts follow them; no name stands on a button */
    const ko = [];
    { const sig = cur + '|' + hots.map(h => h.label).join('|'); if (sig !== markSig) { markSig = sig; marksPaint(); } }
    hots.forEach(h => {
      const p = scene.hots[h.at] && scene.hots[h.at](); if (!p) return;
      const s = stage.project(p), G = 8;
      if (!h.bw) { h.bw = h.el.offsetWidth; h.bh = h.el.offsetHeight;
        const room = h.side === 'r' ? stage.W - G - s[0] - 10 : h.side === 'l' ? s[0] - 10 - G : 1e9, can = h.w && h.label !== h.y7 && breaks(h.label).length > 0;
        if (can && !h.two && h.bw > room) { h.two = true; h.el.classList.add('is-two'); twoLines(h); h.bw = h.el.offsetWidth; h.bh = h.el.offsetHeight; } }
      const bw = h.bw, bh = h.bh; h.pt = [s[0], s[1]];
      /* (beside its part: 26 px from it; where the picture's edge is near, as little as 10 px, before the button is pushed back over the part) */
      const gap = Math.max(10, Math.min(26, (h.side === 'r' ? stage.W - G - s[0] : s[0] - G) - bw));
      const dx = h.side === 'r' ? bw / 2 + gap : h.side === 'l' ? -bw / 2 - gap : 0, dy = h.side === 't' ? -bh / 2 - 20 : h.side === 'b' ? bh / 2 + 20 : 0;
      const x = Math.max(G + bw / 2, Math.min(stage.W - G - bw / 2, s[0] + dx)), y = Math.max(G + bh / 2 + 4, Math.min(stage.H - 46 - bh / 2, s[1] + dy));
      h.wrap.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; /* zoomed in by the pupil, a button whose part has left the picture is not shown at the picture's edge (it would point at nothing): "Whole view" brings it back */
      const off = Z.k > 1.05 && (s[0] < -4 || s[0] > stage.W + 4 || s[1] < -4 || s[1] > stage.H + 4);
      h.wrap.style.visibility = s[2] && !off && !lookOn && !film ? 'visible' : 'hidden';   /* (nor while a name shows its part, nor while a film plays: the button belongs to the step's own picture) */
      /* a line from the part to the nearest edge of its button, when the button does not stand on it (16 Nov 2026; Daniel:
         "you don't have a line, so you don't know actually what this is pointing at") */
      { const ex = Math.max(x - bw / 2, Math.min(x + bw / 2, s[0])), ey = Math.max(y - bh / 2, Math.min(y + bh / 2, s[1])), L = Math.hypot(ex - s[0], ey - s[1]);
        if (!h.ln) { h.ln = document.createElement('i'); h.ln.className = 'hot3__ln'; h.wrap.insertBefore(h.ln, h.el); }
        h.ln.style.display = L > 6 ? '' : 'none';
        if (L > 6) h.ln.style.cssText = `left:${(s[0] - x).toFixed(1)}px;top:${(s[1] - y).toFixed(1)}px;width:${L.toFixed(1)}px;transform:rotate(${Math.atan2(ey - s[1], ex - s[0]).toFixed(4)}rad)`; }
      /* (28 Nov 2026: while a film plays the button is away, and so is its place: its box, unseen, kept the film's names off the cell's right side, and on a phone they stood across the cell) */
      if (!film) ko.push({ l: x - bw / 2 - 4, r: x + bw / 2 + 4, t: y - bh / 2 - 4, b: y + bh / 2 + 4 });
    });
    if (scene.keepOut) ko.push(...scene.keepOut());
    if (!zoomEl.hidden) { const a = stageEl.getBoundingClientRect(), b = zoomEl.getBoundingClientRect(); ko.push({ l: b.left - a.left - 4, r: b.right - a.left + 4, t: b.top - a.top - 4, b: b.bottom - a.top + 4 }); }
    /* (and a film's caption: no name under it) */
    if (!wCap.hidden) ko.push({ l: wCap.offsetLeft - 6, r: wCap.offsetLeft + wCap.offsetWidth + 6, t: wCap.offsetTop - 6, b: wCap.offsetTop + wCap.offsetHeight + 6 });
    /* (nor on a scene's counter, nor on the two sides' words under the membrane) */
    if (!wEq.hidden && wEq.parentNode === stageEl) { const a = stageEl.getBoundingClientRect(), b = wEq.getBoundingClientRect(); ko.push({ l: b.left - a.left - 6, r: b.right - a.left + 6, t: b.top - a.top - 6, b: b.bottom - a.top + 6 }); }
    if (!wWhere.hidden) ko.push({ l: wWhere.offsetLeft - 6, r: wWhere.offsetLeft + wWhere.offsetWidth + 6, t: wWhere.offsetTop - 6, b: wWhere.offsetTop + wWhere.offsetHeight + 6 });
    if (!wBoard.hidden) wBoard.querySelectorAll('.plv__bside, .plv__bmid:not([hidden]), .plv__bkey').forEach(el => { ko.push({ l: el.offsetLeft - 6, r: el.offsetLeft + el.offsetWidth + 6, t: el.offsetTop - 40, b: el.offsetTop + el.offsetHeight + 6 }); });
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
  /* (the scene hears which names stand on the picture: a part may be bright while its name does, the one thylakoid) */
  const showNames = () => { stage.showLabels(curLabs); if (scene && scene.named) scene.named(Object.keys(curLabs)); seenSig = ''; if (scene && scene.group) lookForHidden(); };
  const rest = (labs, m) => { xStep = m && (m.labsX || m.labsIB || m.labsC) ? m : null; xLabs = labs || {}; paintX(); showNames(); stage.setRest(true); at.rest = true; paintWhere(); };
  const moving = () => { hideCard(); xStep = null; paintX(); stage.showLabels({}); if (scene && scene.named) scene.named([]); curLabs = {}; stage.setRest(false); at.rest = false; paintWhere(); };

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
  /* (the IB pass, js/ibpass.js: a signed-in Year 12 or 13 pupil, or a teacher, has the switches at once, and IB on the
     first time; Daniel, 15 Nov 2026. On the branch's own address, plant-cell/, there is no pass: as before.) */
  const ibPass = () => !!(window.IBPASS && window.IBPASS.on());
  const ks3Done = () => { if (visit || ibPass()) return true; try { const A = JSON.parse(localStorage.getItem('cellgame.answers') || '{}'); return CHECKS.every(q => A[q] && A[q].ok); } catch (e) { return false; } };
  /* (16 Nov 2026; Daniel: "when you toggle IB anywhere, it toggles IB everywhere") the switches are the game's own, one
     choice with the places and the films (js/game/iblevel.js, store 'courseLv'); until today the side quest kept its
     own ('plantLv'), so IB could be on here and off in the cell. A pupil who had only this one keeps it the first time. */
  if (store.get('courseLv', null) == null && store.get('plantLv', null)) store.set('courseLv', Object.assign({ igcse: false, ib: false }, store.get('plantLv', {})));
  const LV = course(), lvEl = $('.plv__lv');
  if (ibPass() && !store.get('ibpassLv', false)) { LV.ib = true; setCourse('ib', true); store.set('ibpassLv', true); }
  let xStep = null, xLabs = {};
  const lvOn = c => ks3Done() && !!LV[c];
  /* ---------------- the course's own word on each button (20 Nov 2026; text.js WORDS has Daniel's words) ----------------
     A press with an entry there (its `w`) shows the word of the course that is on, IB's first; the button keeps its
     Year 7 words as data-y7. wordsPaint: each sentence that names such a button (data-cw) and each button on the
     picture say that word; called when a course or the IB level changes and whenever such a sentence is written. A
     course's word in a sentence is bold (cw-on: css/game.css, with the game's places): several words long, it must
     read as one name. */
  const wordNow = k => wordOf(k, { igcse: lvOn('igcse'), ib: lvOn('ib'), hl: lvOn('ib') && level() !== 'sl' });
  const hotWord = (w, y7) => w && WORDS[w] ? y7.replace(WORDS[w].y7, wordNow(w)) : y7;
  /* a course's word is longer than Year 7's: where the picture's edge would push the button back over its own part (a
     phone: "Lose water by osmosis" stood on the cell), it takes two lines and stands beside its part as the Year 7
     button does. The break: the one that makes the button narrowest, measured; before "by" (where the course's words
     begin: "Lose water / by osmosis") when that is as narrow within 8 px, else where it is ("Link by /
     condensation"). The placing, in the frame loop, decides it each time the words change. */
  const breaks = t => { const out = []; for (let i = t.indexOf(' ', 3); i > 0; i = t.indexOf(' ', i + 1)) out.push(t.slice(0, i) + ' <br>' + t.slice(i + 1)); return out; };
  const twoLines = h => { const sp = h.el.firstElementChild, C = breaks(h.label).map(x => { sp.innerHTML = x; return [h.el.offsetWidth, x]; }), min = Math.min(...C.map(c => c[0]));
    sp.innerHTML = (C.find(c => c[0] <= min + 8 && c[1].includes(' <br>by ')) || C.find(c => c[0] === min))[1]; };
  const hotSet = (h, t) => { h.label = t; h.two = false; h.el.classList.remove('is-two'); h.el.innerHTML = `<span>${t}</span>`; h.bw = h.bh = 0; };
  /* (20 Nov 2026, the science read: after a press the step still read "Press Lose water" in yellow while the only
     button read "Take in water": a reader obeys the first order and finds no such button) in the step the pupil is on,
     an order is lit only while its button stands on the picture; steps already done stay as they were */
  let markSig = '';   /* (the frame loop paints them when the buttons or the step change; what a press says asks for it too) */
  /* ---------------- the course's own name on each part (21 Nov 2026; text.js NAMES has Daniel's words; here PNAMES: NAMES is the leaf's key) ----------------
     A name of the picture whose scene gives it a key of that table (nm) reads the course's own name while that course
     is on: "plasma membrane" and "sap vacuole" with IB, "palisade mesophyll cell" and "the epithelium" with IGCSE. It
     is the same name on the same part, with the same line: only its words change, so the stage measures it again
     (refitLabels). labN: for each such name of the scene now built, its Year 7 words (a phone: its short form) and
     its words now. Painted with the sentences (wordsPaint), which carry the same key (data-cw). */
  let labN = {};
  /* a small laptop's picture (see "a name may have a middle form") */
  const midPic = () => stage.W >= 560 && (stage.W < 960 || stage.H < 720);
  function namesPaint() {
    const on = { igcse: lvOn('igcse'), ib: lvOn('ib'), hl: lvOn('ib') && level() !== 'sl' }; let ch = false;
    Object.keys(labN).forEach(k => { const q = labN[k], t = nameOf(q.html, q.nm, on, stage.W < 560); if (t === q.now) return;
      const sp = stageEl.querySelector(`.ibv__lab[data-k="${k}"] > span`); if (!sp) return; sp.innerHTML = t; q.now = t; ch = true; });
    if (ch) stage.refitLabels();
  }
  function marksPaint() {
    const now = cur >= 0 ? liOf(cur) : null, L = hots.map(h => h.label);
    root.querySelectorAll('.steps mark.do').forEach(m => { const t = m.textContent.replace(/\s+/g, ' '); m.classList.toggle('is-past', !!now && now.contains(m) && now.classList.contains('is-now') && !L.some(l => t.includes(l))); });
  }
  function wordsPaint() {
    root.querySelectorAll('[data-cw]').forEach(e => { const k = e.dataset.cw, t = wordNow(k); if (e.textContent !== t) e.textContent = t; e.classList.toggle('cw-on', !!(WORDS[k] || PNAMES[k]) && t !== (WORDS[k] || PNAMES[k]).y7); });
    hots.forEach(h => { if (!h.w) return; const t = hotWord(h.w, h.y7); if (h.label !== t) hotSet(h, t); });
    namesPaint();
  }
  /* (16 Nov 2026) with either course: the IB line names the same parts (cuticle, epidermis, air spaces, spongy
     mesophyll, guard cells, veins), and the names are the leaf's lesson */
  /* (17 Nov 2026) a step may have names for IB alone (labsIB: the membrane's phospholipid bilayer, hydrophobic core,
     integral and peripheral protein), shown only with IB on */
  /* (17 Nov 2026, later) or names that depend on which courses are on, and on the IB level (labsC: the chloroplast's:
     chlorophyll for IGCSE; the photosynthetic pigments for IB and, at HL, the thylakoid and the stroma) */
  function paintX() {
    const g = lvOn('igcse'), b = lvOn('ib');
    /* (the scene hears which courses are on: a picture may show more with one, the water of each condensation with IB) */
    if (scene && scene.course) scene.course({ igcse: g, ib: b, hl: b && level() !== 'sl' });
    curLabs = xStep && xStep.labsC && (g || b) ? xStep.labsC({ igcse: g, ib: b, hl: b && level() !== 'sl', look: lookOn, base: xLabs }) : xStep && xStep.labsIB && b ? xStep.labsIB : xStep && xStep.labsX && (g || b) ? xStep.labsX : xLabs;
  }
  function paintLv() {
    const open = ks3Done(); lvEl.hidden = !open;
    ['igcse', 'ib'].forEach(c => { const on = open && !!LV[c]; root.classList.toggle('plv--' + c, on); lvEl.querySelector(`[data-lv="${c}"]`).setAttribute('aria-pressed', on ? 'true' : 'false'); });
    const lvl = lvEl.querySelector('.plv__lvl'); if (lvl) lvl.hidden = !(open && LV.ib);
    if (!(open && (LV.igcse || LV.ib))) { filmStop(true); hideCard(); }
    if (!(open && LV.igcse)) memStop(true);
    if (lookOn && !setOn(setOf(lookOn))) { hideCard(); lookOff(true); }
    wordsPaint();
  }
  lvEl.addEventListener('click', e => { const b = e.target.closest('.plv__lvb'); if (!b || !ks3Done()) return; const c = b.dataset.lv;
    LV[c] = !LV[c]; setCourse(c, LV[c]); paintLv(); paintX(); paintEq();
    if (at.rest) showNames();
    /* the box just opened, of the step the pupil is on, comes into view */
    const li = cur >= 0 && liOf(cur), box = LV[c] && li && li.querySelector(`.plv__lvbox[data-lv="${c}"]`);
    if (box) requestAnimationFrame(() => { const p = panel.getBoundingClientRect(), k = box.getBoundingClientRect(); if (k.top < p.top + 40 || k.bottom > p.bottom) panel.scrollTo({ top: Math.max(0, panel.scrollTop + k.top - p.top - 52), behavior: FAST ? 'auto' : 'smooth' }); }); });

  /* ---------------- the leaf: its names to press, and two films (16 Nov 2026) ----------------
     Daniel: "once you toggle the IGCSE, you see it … on the 3D representation instead of text … even with labels and as a
     discovery way". With a course on, the leaf's twelve names (XKEY.leaf; the labsX of its step, class plv-xlab) are
     buttons: pressed, a card under the name says what the part is (its row of XKEY) and the name is ticked; the names
     learned are kept (store 'leafNames') and counted in the box, whose key lists the twelve in the order of the pins.
     Watch carbon dioxide diffuse in and Watch transpiration: films in the leaf's own 3D (films.js; the player below). */
  /* (17 Nov 2026) a step's names to press: the leaf's twelve (either course) and the membrane's four (IB): text.js XKEY */
  /* (17 Nov 2026, later: the chloroplast's. A set may be for one course (ib, igcse) and belong to a step under another
     key (step); a row may have an IB level, its fourth entry: an HL name is not shown, counted or pressed at SL) */
  const rowsOf = id => (XKEY[id] ? XKEY[id].rows.filter(r => !(r[3] === 'HL' && level() === 'sl')) : []);
  const setOf = k => Object.keys(XKEY).find(id => XKEY[id].rows.some(r => r[0] === k)) || '';
  const setOn = id => !!XKEY[id] && (XKEY[id].ib ? lvOn('ib') : XKEY[id].igcse ? lvOn('igcse') : lvOn('igcse') || lvOn('ib'));
  const setsAt = step => Object.keys(XKEY).filter(id => (XKEY[id].step || id) === step);
  const NAMES = rowsOf('leaf');
  /* (a film's names are the same names, on the parts its shots show: films.js, keys f… for x…) */
  const nameKey = k => String(k || '').replace(/^f/, 'x');
  const found = (id = 'leaf') => new Set((store.get(XKEY[id].store, []) || []).filter(k => rowsOf(id).some(r => r[0] === k)));
  function foundLine(id = 'leaf') {
    const n = found(id).size, N = rowsOf(id).length || 1;
    return `<p class="plv__found" data-set="${id}"><span class="plv__ft">${rowsOf(id).length === XKEY[id].rows.length && XKEY[id].hint ? XKEY[id].hint : rowsOf(id).length === 1 ? `Press <i>${rowsOf(id)[0][1]}</i> on the picture` : `Press each name on the ${XKEY[id].on}`}</span>${rowsOf(id).length === 1 ? '' : `<span class="plv__fbar" aria-hidden="true"><i style="width:${Math.round(100 * n / N)}%"></i></span>`}<b>${n} of ${rowsOf(id).length} learned</b></p>`;
  }
  /* the key (16 Nov 2026; Daniel, of the box's More: "a lot of text, also not very nicely organized. I don't see the
     labels"): the twelve names on show as the picture shows them, a chip each in the look of its name on the leaf, in
     the order of the pins (a phone shows each chip's number, the number of its pin); a chip is a button, as the name on
     the leaf is: pressed, the name on the leaf lights and its card opens; a name learned is ticked in both places */
  function keyHTML(id = 'leaf') {
    const F = found(id);
    /* (a set of few names, each in full on a phone too, has no chips: chips: false) */
    return `<div class="plv__key${XKEY[id].ib ? ' plv__key--ib' : ''}${XKEY[id].chips === 'pins' ? ' plv__key--few' : ''}">${foundLine(id)}${XKEY[id].chips === false ? '' : `<div class="plv__chips" role="group" aria-label="The names on the ${XKEY[id].on}">${rowsOf(id).map((r, i) => `<button type="button" class="plv__chip${F.has(r[0]) ? ' is-found' : ''}" data-k="${r[0]}"><span class="plv__xn">${i + 1}</span>${r[1]}</button>`).join('')}</div>`}</div>`;
  }
  function paintFound() {
    const F = new Set(Object.keys(XKEY).flatMap(id => [...found(id)]));
    stageEl.querySelectorAll('.plv-xlab').forEach(el => el.classList.toggle('is-found', F.has(nameKey(el.dataset.k))));
    root.querySelectorAll('.plv__found').forEach(el => { el.outerHTML = foundLine(el.dataset.set || 'leaf'); });
    root.querySelectorAll('.plv__chip').forEach(el => el.classList.toggle('is-found', F.has(el.dataset.k)));
    wordsPaint();
  }
  function learn(k) { const id = setOf(k); if (!id) return; const F = found(id); if (!F.has(k)) { F.add(k); store.set(XKEY[id].store, [...F]); } paintFound(); }
  /* a chip pressed: its name on the leaf lights (when the picture shows it), and its card opens there */
  function pressName(k) {
    const id = setOf(k), row = rowsOf(id).find(r => r[0] === k); if (!row) return;
    const lab = [...stageEl.querySelectorAll('.plv-xlab')].find(el => nameKey(el.dataset.k) === k && el.style.visibility === 'visible') || null;
    if (lab) { lab.classList.remove('is-lit'); void lab.offsetWidth; lab.classList.add('is-lit'); setTimeout(() => lab.classList.remove('is-lit'), 1800); }
    if (hasLook(k)) return lookAt(k, row, id);
    showCard(lab, row, id); learn(k);
  }
  let cardEl = null;
  const hideCard = () => { if (cardEl) cardEl.hidden = true; stageEl.querySelectorAll('.ibv__lab.is-open').forEach(e => e.classList.remove('is-open')); root.classList.remove('plv--docked'); };
  function showCard(lab, row, id = 'leaf') {
    if (!cardEl) { cardEl = document.createElement('div'); cardEl.className = 'plv__card'; cardEl.setAttribute('role', 'note'); stageEl.appendChild(cardEl); }
    const lv = row[3] || (XKEY[id].ib ? 'SL' : '');
    /* (17 Nov 2026) on a phone the card of a name that shows its part stands just under the picture, on the steps'
       sheet: the picture is small, and the part that the name lit, with its name, must stay in view */
    /* (and the card of any name of a set of few names, each in full on a phone: the light step's too) */
    /* (22 Nov 2026) on a small laptop's picture the same card stands at the top of the steps' panel, beside the picture: a
       card 290 px wide found no place there that covered no name (the fibre's, the atoms', the light step's). It is in
       the panel's own flow and stays at its top (sticky): the steps' words move down under it and none is covered (laid
       over the panel it hid Next and the sentence that the press had just said: the science read). The name pressed
       wears the card's green while the card is open: the two no longer stand side by side */
    /* (28 Nov 2026, the picture inspection at a MacBook's window, 1440 × 790: a card in the picture lay on other names
       (the leaf's "air space" under the xylem's card, two of the membrane's names under the bilayer's) and, in the
       fibre's near view, on the fibre itself. So on any laptop a card stands in the picture only where it covers
       nothing: no name, no button, no key, nothing that the scene keeps clear; where there is no such place it stands
       at the top of the steps' panel, as on a small laptop (`dock`). The standard: "nothing that matters is covered") */
    const smart = hasLook(row[0]) || XKEY[id].chips === false || XKEY[id].chips === 'pins', under = stage.W < 560 && smart, panelEl = root.querySelector('.plv__panel');
    let side = midPic() && smart;
    const seat = () => { const home = under ? root : side ? panelEl : stageEl;
      if (cardEl.parentNode !== home) { if (side) home.insertBefore(cardEl, home.firstChild); else home.appendChild(cardEl); }
      stageEl.querySelectorAll('.ibv__lab.is-open').forEach(e => e.classList.remove('is-open')); if (side && lab) lab.classList.add('is-open');
      cardEl.classList.toggle('plv__card--under', under); cardEl.classList.toggle('plv__card--side', side); root.classList.toggle('plv--docked', side); };
    const dock = () => { side = true; seat(); cardEl.style.width = cardEl.style.left = cardEl.style.right = cardEl.style.top = ''; };
    seat();
    cardEl.innerHTML = `<button type="button" class="plv__cardx" aria-label="Close">×</button><p class="plv__cardk">${lv ? `<b class="plv__sl plv__sl--${lv.toLowerCase()}">${lv}</b> ` : ''}${row[4] || XKEY[id].card}</p>${(under || side) && whereNow() && whereNow().under ? `<p class="plv__cardn">${whereNow().under}</p>` : '' /* (a phone, a small laptop: what the picture's key has no room to say) */}<p>${XKEY[id].whole ? row[2] : `<b>${row[1]}</b>: ${row[2]}`}</p>`;
    cardEl.dataset.k = row[0]; wordsPaint();   /* (a row's words may hold a part's name: the course's own) */
    /* (closed: a name that showed its part lets the picture go back) */
    cardEl.querySelector('.plv__cardx').addEventListener('click', () => { hideCard(); lookOff(true); });
    cardEl.hidden = false; cardEl.style.right = '';
    if (side) { cardEl.style.width = cardEl.style.left = cardEl.style.right = cardEl.style.top = ''; return; }
    if (under) { const r0 = root.getBoundingClientRect(), s1 = stageEl.getBoundingClientRect(); cardEl.style.width = 'auto'; cardEl.style.left = '8px'; cardEl.style.right = '8px'; cardEl.style.top = Math.round(s1.bottom - r0.top + 6) + 'px'; return; }
    /* under the name, or above it when there is no room: never on the name pressed (a name the picture does not show
       now: at the top of the picture, under the film's caption if there is one) */
    const s0 = stageEl.getBoundingClientRect(), w = Math.min(290, s0.width - 16);
    if (!lab) { cardEl.style.width = w + 'px'; cardEl.style.left = Math.max(8, (s0.width - w) / 2) + 'px'; cardEl.style.top = (wCap && !wCap.hidden ? wCap.offsetTop + wCap.offsetHeight + 10 : 12) + 'px'; return; }
    const b = (lab.querySelector('span') || lab).getBoundingClientRect();
    cardEl.style.width = w + 'px';
    const hh = cardEl.offsetHeight, x = Math.max(8, Math.min(s0.width - w - 8, b.left - s0.left)), below = b.bottom - s0.top + 8;
    /* (17 Nov 2026) the card of a name that shows its part must cover neither the part nor another name: it stands on
       the name's outer side (a name on the left of its part: the card's right edge under the name's, so that it lies
       away from the part), under the name or above it or beside it, wherever it covers the least of the other names */
    if (smart || stage.W >= 560) {
      /* (the name as the picture shows it now: from near its key is f… for x…) */
      const all = stage.labelState().filter(q => q.on), me = all.find(q => nameKey(q.key) === row[0]), others = all.filter(q => nameKey(q.key) !== row[0]).map(q => q.box);
      /* (19 Nov 2026) nor the scale bar's corner, nor an atom of a piece drawn with its atoms (the scene's keepClear) */
      others.push({ l: 0, r: 190, t: s0.height - 46, b: s0.height });
      const keep = scene && scene.keepClear ? scene.keepClear().map(q => stage.project(q)) : [];
      if (!wWhere.hidden) others.push({ l: wWhere.offsetLeft, r: wWhere.offsetLeft + wWhere.offsetWidth, t: wWhere.offsetTop, b: wWhere.offsetTop + wWhere.offsetHeight });
      /* (nor a button on the picture: the light's) */
      hots.forEach(h => { const q = h.el.getBoundingClientRect(); if (q.width) others.push({ l: q.left - s0.left, r: q.right - s0.left, t: q.top - s0.top, b: q.bottom - s0.top }); });
      const nb = { l: b.left - s0.left, r: b.right - s0.left, t: b.top - s0.top, b: b.bottom - s0.top }, left = !!me && me.p[0] > me.box.r, fit = v => Math.max(8, Math.min(s0.width - w - 8, v));
      const out = left ? nb.r - w : nb.l, inn = left ? nb.l : nb.r - w;
      /* beside the name, on its outer side (narrower if it must be, never under 230 px), first: there it covers nothing
         of the part; then under or above the name */
      const room = left ? nb.l - 18 : s0.width - 18 - nb.r, wb = Math.min(w, room), C = [];
      const tall = v => { cardEl.style.width = v + 'px'; return cardEl.offsetHeight; };
      /* (a plain name, the leaf's twelve: under the name or above it first, where its card always stood) */
      if (!smart) { const h1 = tall(w); C.push([x, below, w, h1], [x, nb.t - h1 - 8, w, h1]); }
      if (wb >= 230) { const hb = tall(wb); C.push([left ? nb.l - 10 - wb : nb.r + 10, Math.max(8, Math.min(s0.height - hb - 8, nb.t - 6)), wb, hb]); }
      const h0 = tall(w); [[fit(out), below], [fit(out), nb.t - h0 - 8], [fit(inn), below], [fit(inn), nb.t - h0 - 8]].forEach(([cx, cy]) => C.push([cx, cy, w, h0]));
      /* (and, when each of those would cover a name or a button: beyond the end of the name's line, over the open picture) */
      if (me) C.push([left ? me.p[0] + 14 : me.p[0] - 14 - w, Math.max(8, Math.min(s0.height - h0 - 8, nb.t - 6)), w, h0]);
      const ok = C.filter(([cx, cy, cw, ch]) => cx >= 8 && cx + cw <= s0.width - 8 && cy >= 8 && cy + ch <= s0.height - 8);
      const cover = ([cx, cy, cw, ch]) => others.reduce((a, o) => a + Math.max(0, Math.min(cx + cw, o.r + 4) - Math.max(cx, o.l - 4)) * Math.max(0, Math.min(cy + ch, o.b + 4) - Math.max(cy, o.t - 4)), 0) + 5000 * keep.filter(q => q[0] > cx - 16 && q[0] < cx + cw + 16 && q[1] > cy - 16 && q[1] < cy + ch + 16).length;
      const scored = ok.map((c, i) => [cover(c), i, c]).sort((u, v) => u[0] - v[0] || u[1] - v[1]);
      /* (a laptop: no place in the picture that covers nothing: the top of the steps' panel) */
      if (stage.W >= 560 && (!scored.length || scored[0][0] > 0)) { dock(); return; }
      if (scored.length) { const best = scored[0][2]; cardEl.style.width = best[2] + 'px'; cardEl.style.left = best[0] + 'px'; cardEl.style.top = best[1] + 'px'; return; }
      cardEl.style.width = w + 'px';
    }
    cardEl.style.left = x + 'px'; cardEl.style.top = (below + hh < s0.height - 8 ? below : Math.max(8, b.top - s0.top - hh - 8)) + 'px';
  }
  stageEl.addEventListener('click', e => {
    const lab = e.target.closest && e.target.closest('.plv-xlab'); if (!lab) return;
    const k = nameKey(lab.dataset.k), id = setOf(k), row = rowsOf(id).find(r => r[0] === k); if (!row || !setOn(id)) return;
    e.stopPropagation(); if (hasLook(k)) { lookAt(k, row, id); return; } showCard(lab, row, id); learn(row[0]);
  });
  /* ---------------- a name that shows its part (17 Nov 2026): the chloroplast's ----------------
     Daniel's rule (memory teach-on-the-picture): a course changes the PICTURE first. A step may give a name a look (its
     looks, leaf.js: a view of the camera and the knobs that light the part). Pressed, the name first shows its part: the
     camera goes to it if it is not there (the names are away while it moves, as in every move), the part lights; then
     the name's card opens beside the name, on the picture as it is now. Another name pressed: its own look. The card
     closed, the course or the level switched off: the picture goes back to the step's own view. A new step starts from
     its own picture (play). With Reduce motion every change is at once: one still for each name. */
  let lookOn = '', ltok = 0, lookMoving = false, lookTw = null, lookBase = {};
  const looksNow = () => (cur >= 0 && scene && scene.steps && !film && !memOn && STEPS[cur].scene === sceneKey ? motion(STEPS[cur].id).looks : null) || null;
  const hasLook = k => { const L = looksNow(); return !!(L && L[k]); };
  const lookZero = L => { const z = {}; Object.values(L).forEach(o => { Object.keys(o).forEach(n => { if (n !== 'cam' && n !== 'play') z[n] = 0; }); if (o.play) Object.keys(Object.assign({}, o.play.to, o.play.still)).forEach(n => { z[n] = 0; }); }); return z; };
  const labOf = k => [...stageEl.querySelectorAll('.plv-xlab')].find(el => nameKey(el.dataset.k) === k && el.style.visibility === 'visible') || null;
  const ltween = ph => { const pr = tweenTo(ph); lookTw = tw; return pr; };
  async function lookAt(k, row, id) {
    const L = looksNow(); if (!L || !L[k] || lookMoving || !at.rest || at.watching) return false;
    const m = motion(STEPS[cur].id), my = ++ltok, tk = token, to = Object.assign(lookZero(L), L[k]), play = to.play; delete to.play;
    /* (the step's names as they stood: a step with two states, the grain by day and at night, comes back to the same) */
    if (!lookOn) lookBase = xLabs;
    lookOn = k; hideCard();
    if (to.cam != null && to.cam !== K.cam) {
      lookMoving = true; moving(); await ltween({ to, ms: 1500 }); if (my !== ltok || tk !== token) return false;
      lookMoving = false; rest(lookBase, m);
    } else { delete to.cam; if (play) Object.assign(K, to); else ltween({ to, ms: 450 }); }
    /* (18 Nov 2026) a look that plays (the grain's hydrolysis): once the camera is there and the names stand, the
       picture does what the name says, and the card comes after it: the picture first, then the line that names it.
       The name pressed again: the play again. With Reduce motion: one moment of it, held (its still) */
    if (play) { if (FAST) Object.assign(K, play.still || play.to); else { await ltween({ to: play.to, ms: play.ms }); if (my !== ltok || tk !== token) return false; } }
    /* the card stands by its name: once the name is placed on the picture as it is now */
    for (let n = 0; n < 24 && !labOf(k); n++) { await frames(1); if (my !== ltok || tk !== token) return false; }
    showCard(labOf(k), row, id); learn(k); return true;
  }
  function lookOff(back) {
    if (!lookOn && !lookMoving) return;
    const L = looksNow(), was = lookMoving; ltok++; lookOn = ''; lookMoving = false;
    if (tw && tw === lookTw) tw = null;
    lookTw = null; if (!L) return;
    const m = motion(STEPS[cur].id), tk = token, my = ltok, to = Object.assign(lookZero(L), { cam: knobsAfter(cur).cam });
    /* (stopped in the middle of its move, or no way back asked: the step's own picture at once) */
    if (was || !back) { Object.assign(K, to); if (was) rest(lookBase, m); return; }
    if (K.cam !== to.cam) { lookMoving = true; moving(); ltween({ to, ms: 1300 }).then(() => { if (my !== ltok || tk !== token) return; lookMoving = false; rest(lookBase, m); }); }
    else { delete to.cam; ltween({ to, ms: 400 }); }
  }
  /* the small map (17 Nov 2026; the science read: "nothing says how much nearer or where the stack is; with Reduce motion
     the picture jumps with no cue"): while a name's look is nearer than the step's own view, a small outline of the whole
     part (the chloroplast) stands in the picture's corner, with a frame on what the picture now shows, at its true
     share of the part: where the camera is, and how much nearer. The scene gives the part's size and the place (the
     step's where, leaf.js); the frame follows the pupil's own zoom. */
  const wWhere = document.createElement('div'); wWhere.className = 'plv__where'; wWhere.hidden = true; wWhere.setAttribute('aria-hidden', 'true'); stageEl.appendChild(wWhere);
  const whereNow = () => { const m = cur >= 0 && scene && scene.steps && lookOn && at.rest && !lookMoving ? motion(STEPS[cur].id) : null; return (m && m.where && m.where[lookOn]) || null; };
  function paintWhere() {
    const Wd = whereNow(); if (!Wd) { wWhere.hidden = true; return; }
    /* (a look on atoms has their key in the corner, not a map: the scene's where.key, colour and word) */
    /* (a small laptop's picture: the three atoms only, as on a phone: the longer key stood on the atoms of the piece, which is drawn larger there; the card says the rest) */
    if (Wd.key) { const nar = stage.W < 560 || midPic(); wWhere.innerHTML = `<ul class="plv__akey">${Wd.key.slice(0, nar ? 3 : 9).map(([c, w], n) => `<li${n > 2 ? ' class="plv__asm"' : ''}><i style="background:${c}"></i>${w}</li>`).join('')}</ul>${Wd.note && !nar ? `<p class="plv__anote">${Wd.note}</p>` : ''}`; wWhere.hidden = false; return; }
    const hh = stage.W < 560 ? 58 : 96, k = hh / Wd.h, ww = Wd.w * k;
    wWhere.innerHTML = `<svg width="${(ww + 12).toFixed(0)}" height="${hh + 12}" viewBox="${(-ww / 2 - 6).toFixed(1)} ${-hh / 2 - 6} ${(ww + 12).toFixed(1)} ${hh + 12}">${Wd.rect ? `<rect class="plv__whp plv__whp--wall" x="${(-ww / 2).toFixed(1)}" y="${-hh / 2}" width="${ww.toFixed(1)}" height="${hh}" rx="2"/>` : `<ellipse class="plv__whp${Wd.pale ? ' plv__whp--pale' : ''}" rx="${(ww / 2).toFixed(1)}" ry="${hh / 2}"/>`}<rect class="plv__whf"/></svg><span>${Wd.name}</span>`;
    wWhere.hidden = false; drawWhere();
  }
  function drawWhere() {
    const Wd = whereNow(), f = wWhere.querySelector('.plv__whf'); if (Wd && Wd.key) return; if (!Wd || !f) { wWhere.hidden = true; return; }
    const hh = stage.W < 560 ? 58 : 96, k = hh / Wd.h, fw = Math.max(5, stage.W / stage.pxPerNm() * k), fh = Math.max(5, stage.H / stage.pxPerNm() * k);
    f.setAttribute('x', (Wd.x * k - fw / 2).toFixed(1)); f.setAttribute('y', (-Wd.y * k - fh / 2).toFixed(1)); f.setAttribute('width', fw.toFixed(1)); f.setAttribute('height', fh.toFixed(1));
  }
  /* ---------------- the equation's strip (17 Nov 2026): the light step's ----------------
     Daniel's rule (memory teach-on-the-picture): an equation is built from the picture. With IGCSE on, a step whose
     IGCSE lines are an equation (text.js EQS) has them on a strip, word for word, and not in its box: each term lit
     only while the picture shows it used or produced (the scene says which: the step's eq, leaf.js), in the colour of
     its molecule, with one line that says what "lit" means (the mitochondria's strip in the game is its model). On a
     laptop the strip stands on the picture, at the top; on a phone the picture is small, so the strip is pinned at
     the top of the steps' sheet, just under the picture, and stays there while the sheet is scrolled. */
  const wEq = document.createElement('div'); wEq.className = 'plv__eq'; wEq.hidden = true; wEq.setAttribute('role', 'img');
  const eqStep = () => { const st = at.i >= 0 ? STEPS[at.i] : null; return st && EQS[st.id] && lvOn('igcse') && scene && sceneKey === st.scene && motion(st.id).eq ? st.id : ''; };
  function paintEq() {
    const id = eqStep(); if (!id) { wEq.hidden = true; wEq.dataset.id = ''; return; }
    const E = EQS[id], home = stage.W < 560 ? panel : stageEl;
    if (wEq.parentNode !== home) { if (home === panel) panel.insertBefore(wEq, panel.firstChild); else stageEl.appendChild(wEq); }
    wEq.classList.toggle('plv__eq--sheet', home === panel);
    if (wEq.dataset.id !== id) { wEq.dataset.id = id;
      wEq.innerHTML = `<p class="plv__eqk">${E.title} <span>${E.key}</span></p>` + E.rows.map((r, n) => { const P = r.map(q => Array.isArray(q) ? `<span class="plv__eqt" data-t="${q[0]}">${q[1]}</span>` : q), t = E.tail && E.tail[n];
        return `<p class="plv__eql${n ? ' plv__eql--b' : ''}">${t ? P.slice(0, t).join('') + `<span class="plv__eqc">${P.slice(t).join('')}</span>` : P.join('')}</p>`; }).join('');
      wEq.setAttribute('aria-label', E.title + ': ' + wEq.textContent.replace(/\s+/g, ' ').trim()); }
    wEq.hidden = false; drawEq();
  }
  function drawEq() { const id = wEq.dataset.id, m = id && scene && scene.steps ? motion(id) : null; if (!m || !m.eq) return; const on = m.eq(K); wEq.querySelectorAll('.plv__eqt').forEach(el => el.classList.toggle('is-on', !!on[el.dataset.t])); }
  /* (a step begins: no look is left over; play gives the step its own knobs) */
  function lookReset() { ltok++; lookOn = ''; lookMoving = false; if (tw && tw === lookTw) tw = null; lookTw = null; }
  /* the films (16 Nov 2026, rebuilt the same evening; Daniel, of the first version: "extremely simple … Watch
     transpiration, I don't see anything. It doesn't zoom out. I don't know where it is … I just see 'transpiration is the
     loss of …' but I don't see any animation"). A film is shots in the leaf's own 3D (films.js): for each, the camera goes
     to where it happens, while the molecules already move; when it has arrived, the shot's names stand on their parts,
     its hero molecule does what the shot's words say with its name riding on it, and Next comes once it has done it (the
     film waits for the reader: memory animations-wait-for-the-reader); the last shot offers Watch again and Back to the
     leaf. The caption is one small box in the picture's top left corner (no name under it), the shot's piece of the
     IGCSE line lit, the pieces of the same sentence before it dimmed (text.js FILMS: no new words), and a line saying
     how much bigger the molecules are drawn. With Reduce motion each shot is one still: its molecules held, its hero
     where its words happen, an arrow along the hero's way, every name, and Next at once. */
  /* (19 Nov 2026) each course's box has its own two films: IB's have the IB lines' words, and its film of transpiration
     goes near, into a cell wall (films.js, wet.js) */
  /* (22 Nov 2026: the vacuole step has a film of each course too, the cell in a solution: a film says its step,
     FILMS[k].step, the leaf if it says none) */
  const WATCH = { leaf: { igcse: ['co2', 'h2o'], ib: ['co2ib', 'h2oib'] }, vacuole: { igcse: ['sol'], ib: ['solib'] } };
  const filmStepOf = k => (FILMS[k] && FILMS[k].step) || 'leaf';
  /* the course line a shot's words are a piece of */
  const filmLine = (k, n) => (FILMS[k].ib ? ((COURSE.ib[filmStepOf(k)] || [])[n] || [])[1] : (COURSE.igcse[filmStepOf(k)] || [])[n]) || '';
  const SVGNS = 'http://www.w3.org/2000/svg';
  const wCap = document.createElement('div'); wCap.className = 'plv__wcap'; wCap.hidden = true; wCap.setAttribute('role', 'region'); wCap.setAttribute('aria-label', 'The film');
  const wTag = document.createElement('div'); wTag.className = 'plv__mtag'; wTag.hidden = true; wTag.setAttribute('aria-hidden', 'true'); wTag.innerHTML = '<i></i><span></span>';
  const wArrow = document.createElementNS(SVGNS, 'svg'); wArrow.setAttribute('class', 'plv__warrow'); wArrow.setAttribute('aria-hidden', 'true');
  stageEl.append(wArrow, wTag, wCap);
  let film = null, ftok = 0, routeAv = [], tagSide = 'r', tagW = 0;
  const FILM_T = 6.4;      /* the film's time in a still */
  /* the sentence a piece of a line is in (pieces of one sentence are shown together) */
  const sentOf = (line, part) => { const i = line.indexOf(part); return (line.slice(0, Math.max(0, i)).match(/[.:]\s/g) || []).length; };
  function capHTML(k, i) {
    const F = FILMS[k], sh = F.shots[i], line = filmLine(k, sh.line), was = [];
    for (let j = i - 1; j >= 0; j--) { const o = F.shots[j]; if (o.line !== sh.line || sentOf(line, o.part) !== sentOf(line, sh.part)) break; was.unshift(o.part); }
    const last = i === F.shots.length - 1;
    return `<div class="plv__wtop"><span class="plv__wk">${F.ib ? 'IB' : 'IGCSE'}</span><span class="plv__wdots" role="img" aria-label="Part ${i + 1} of ${F.shots.length}">${F.shots.map((_, j) => `<i class="${j === i ? 'on' : j < i ? 'was' : ''}"></i>`).join('')}</span><button type="button" class="plv__wx" aria-label="Close the film">✕</button></div>`
      + `<p class="plv__wsay">${was.map(w => `<span class="plv__wwas">${w}</span> `).join('')}<span class="plv__wnow">${sh.part}</span></p>`
      + `<div class="plv__wnav" hidden>${last ? '<button type="button" class="plv__wnext plv__wagain">↺ Watch again</button><button type="button" class="plv__wnext plv__wend pulse">' + (F.back || 'Back to the leaf') + '</button>' : '<button type="button" class="plv__wnext pulse">Next →</button>'}</div>`
      /* (the note says how THIS shot's molecules are drawn: it shows when the camera has arrived; on the way, the picture still holds the last shot's) */
      /* (a shot may have a note for its still, with Reduce motion: there the arrows of a change that is over stay on the picture) */
      + `<p class="plv__wsize" style="visibility:hidden">${(FAST && sh.noteStill) || sh.note || FILMSIZE}</p>`;
  }
  function setWatchButtons() {
    root.querySelectorAll('.plv__wb[data-watch]').forEach(b => { const on = !!film && film.k === b.dataset.watch; b.classList.toggle('is-on', on); b.innerHTML = on ? '■ Stop the film' : `▶ ${FILMS[b.dataset.watch].button}`; b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  const leafStep = () => cur >= 0 && STEPS[cur].id === 'leaf' && sceneKey === 'leaf' && !!(scene && scene.film);
  /* is the pupil on the step of film k, in its picture */
  const filmHome = k => !!FILMS[k] && cur >= 0 && STEPS[cur].id === filmStepOf(k) && sceneKey === 'leaf' && !!(scene && scene.film && scene.film.shots[k]);
  async function filmPlay(k, from = 0) {
    if (!filmHome(k)) return;
    const my = ++ftok, sf = scene.film; hideCard();
    /* (a film of another step than the leaf changes that step's own picture: it remembers the picture as it was, knobs and names, to give it back) */
    const home = film && film.k === k ? film.home : filmStepOf(k) === 'leaf' ? null : { K: Object.assign({}, K), labs: xLabs, m: xStep };
    film = { k, i: from, t0: film && film.k === k ? film.t0 : performance.now(), ts0: null, home };
    root.classList.add('plv--film'); setWatchButtons();
    for (let i = from; i < FILMS[k].shots.length; i++) {
      const sh = sf.shots[k][i]; film.i = i; film.ts0 = null;
      /* the caption: the old words go before the new ones come (one caption, never words over words) */
      wCap.classList.add('is-out'); await new Promise(r => setTimeout(r, FAST || wCap.hidden ? 0 : 180)); if (my !== ftok) return;
      wCap.innerHTML = capHTML(k, i); wCap.hidden = false; if (R) R.terms(wCap); requestAnimationFrame(() => wCap.classList.remove('is-out'));
      routeAv = sf.route(k, i).map((p, n) => ({ p, id: 'fr' + n }));
      /* (the first move also cuts the piece's face as a section: leaf.js `sect`) */
      /* (a shot may say how long the camera's journey is, ms: a long way in or out; a second shot at the same view: at once) */
      /* (a shot that changes the picture itself has its own moves, in the order of cause and effect: knobs set at once,
         or changed over a time: the cell in a solution, leaf.js solShots) */
      moving();
      if (sh.moves) { for (const mv of sh.moves) { if (mv.set) Object.assign(K, mv.set); else { await tweenTo({ to: Object.assign({ cam: sh.cam }, mv.to), ms: mv.ms }); if (my !== ftok) return; } } }
      else { await tweenTo({ to: Object.assign({ cam: sh.cam }, i === from ? { sect: 1 } : {}), ms: i === from ? 3400 : K.cam === sh.cam ? 350 : sh.ms || 2800 }); if (my !== ftok) return; }
      film.ts0 = performance.now(); rest(sh.labs); { const z = wCap.querySelector('.plv__wsize'); if (z) z.style.visibility = ''; }
      /* Next once the hero has done what the words say (a near shot says when: secs) */
      const secs = FAST ? 0 : sh.secs != null ? sh.secs : sh.hero.tr.L / sh.hero.speed + 0.4;
      await new Promise(r => setTimeout(r, secs * 1000)); if (my !== ftok) return;
      const nav = wCap.querySelector('.plv__wnav'); nav.hidden = false;
      const b = await new Promise(res => nav.addEventListener('click', e => { const x = e.target.closest('button'); if (x) res(x); }));
      if (my !== ftok) return;
      if (b.classList.contains('plv__wagain')) { filmPlay(k, 0); return; }
      if (b.classList.contains('plv__wend')) { filmStop(true); return; }
    }
  }
  /* the film stops (a press, the step left, the course switched off): back: the camera returns to the step's own view */
  function filmStop(back) {
    if (!film) return; const was = film; ftok++; film = null; routeAv = [];
    wCap.hidden = true; wTag.hidden = true; wArrow.innerHTML = ''; root.classList.remove('plv--film'); setWatchButtons();
    if (scene && scene.film) scene.film.frame(null);
    /* (a film of another step: its own picture comes back as it was; if the step is being left, at once) */
    if (was.home) { const H = was.home, my = token;
      if (back && filmHome(was.k)) { moving(); tweenTo({ to: H.K, ms: 2200 }).then(() => { if (!film && my === token && filmHome(was.k)) rest(H.labs, H.m); }); } else Object.assign(K, H.K);
      return; }
    if (back && leafStep()) { const m = motion('leaf'), my = token; moving(); tweenTo({ to: { cam: 0, sect: 0 }, ms: 2400 }).then(() => { if (!film && my === token && leafStep()) rest(m.labs, m); }); }
  }
  function filmFrame(now) {
    if (!scene || !scene.film) return;
    if (!film) { if (scene.film.now.id) scene.film.frame(null); return; }
    const arrived = film.ts0 != null, t = FAST ? FILM_T : (now - film.t0) / 1000, ts = !arrived ? -1 : FAST ? 0 : (now - film.ts0) / 1000;
    scene.film.frame(film.k, film.i, t, ts, FAST && arrived);
    placeTag(); drawArrow(FAST && arrived);
  }
  /* the hero's name rides on it: a short level line from the molecule, the name beside it, on the side where it covers
     no name on show, nor the caption, nor the zoom buttons; it changes side only when it must */
  function placeTag(N = film && scene.film.now.on && film.ts0 != null ? scene.film.now : null) {
    if (!N) { wTag.hidden = true; return; }
    const q = stage.project(N.hero); if (!q[2] || q[0] < 4 || q[0] > stage.W - 4 || q[1] < 4 || q[1] > stage.H - 4) { wTag.hidden = true; return; }
    const sp = wTag.lastChild; if (sp.textContent !== N.words) { sp.textContent = N.words; tagW = 0; }
    wTag.hidden = false; const w = tagW || (tagW = sp.offsetWidth), h = sp.offsetHeight || 22, gap = 26;
    const s0 = stageEl.getBoundingClientRect(), taken = [];
    /* (the names on show, their lines too, and the hero's own way: its name never lies over the way it goes; the review,
       16 Nov 2026: a tag's line met the stoma's at the pore, and a still's name covered its arrow) */
    /* (and a little room round each name: a tag beside a name on the same line reads as one phrase with it) */
    stage.labelState().forEach(x => { if (!x.on || !x.box) return; taken.push({ l: x.box.l - 14, r: x.box.r + 14, t: x.box.t - 6, b: x.box.b + 6 }); if (x.p) taken.push(x.p[0] < x.box.l ? { l: x.p[0] - 2, r: x.box.l, t: x.p[1] - 3, b: x.p[1] + 3 } : { l: x.box.r, r: x.p[0] + 2, t: x.p[1] - 3, b: x.p[1] + 3 }); });
    const way = []; routeAv.forEach(a => { const r2 = stage.project(a.p); if (r2[2] && Math.hypot(r2[0] - q[0], r2[1] - q[1]) > 30) way.push({ l: r2[0] - 3, r: r2[0] + 3, t: r2[1] - 3, b: r2[1] + 3 }); });
    if (N.keep) taken.push(...N.keep);
    stageEl.querySelectorAll('.plv__zoom:not([hidden]) .plv__zb, .plv__wcap:not([hidden]), .plv__card:not([hidden]), .plv__board:not([hidden]) .plv__bside, .plv__board:not([hidden]) .plv__bmid:not([hidden]), .plv__board:not([hidden]) .plv__bkey').forEach(el => { const b = el.getBoundingClientRect(); if (b.width) taken.push({ l: b.left - s0.left - 4, r: b.right - s0.left + 4, t: b.top - s0.top - 4, b: b.bottom - s0.top + 4 }); });
    /* where the name would stand: beside the molecule (r, l) on a level line, or above or below it (u, d) on an upright one */
    const boxOf = (sd, g) => sd === 'r' ? { l: q[0] + g, t: q[1] - h / 2 } : sd === 'l' ? { l: q[0] - g - w, t: q[1] - h / 2 } : sd === 'u' ? { l: q[0] - w / 2, t: q[1] - g - h } : { l: q[0] - w / 2, t: q[1] + g };
    const fits = (sd, g) => { const o = boxOf(sd, g), b = { l: o.l, r: o.l + w, t: o.t - 3, b: o.t + h + 3 }; return b.l > 6 && b.r < stage.W - 6 && b.t > 6 && b.b < stage.H - 40 && !taken.some(k => b.l < k.r && b.r > k.l && b.t < k.b && b.b > k.t); };
    /* its side first, then the other side, then longer lines, then above or below; never over a name (then it waits,
       hidden, a moment) */
    const other = { r: 'l', l: 'r', u: 'd', d: 'u' }[tagSide];
    const TRY = [[tagSide, gap], [other, gap], [tagSide, gap * 2.2], [other, gap * 2.2], ['u', 22], ['d', 22], ['u', 46], ['d', 46]];
    /* (a scene at the membrane has more on the picture, the sides' words and the counter: longer lines before the name gives up) */
    if (N.keep !== undefined) TRY.push(['u', 74], ['d', 74], [tagSide, gap * 4], [other, gap * 4], ['u', 110], ['d', 110]);
    /* (a molecule whose name must stand on one side: under it, when above it is the water's surface, which the reader is watching: films.js, the wall from near) */
    if (N.pref) TRY.unshift([N.pref, 34], [N.pref, 58], [N.pref, 90]);
    /* (a particle inside a part its name must not cover, the carrier: its name stands above that part, or below it, on
       one upright line) */
    if (N.keep) N.keep.forEach(k => { if (q[0] > k.l && q[0] < k.r && q[1] > k.t && q[1] < k.b) TRY.unshift(['u', q[1] - k.t + 10], ['d', k.b - q[1] + 10]); });
    /* clear of its own way first; else clear of the names only */
    taken.push(...way); let pick = TRY.find(([sd, g]) => fits(sd, g)); taken.length -= way.length; if (!pick) pick = TRY.find(([sd, g]) => fits(sd, g));
    if (!pick) { wTag.hidden = true; return; }
    tagSide = pick[0]; const g = pick[1], o = boxOf(tagSide, g), up = tagSide === 'u' || tagSide === 'd';
    wTag.className = 'plv__mtag is-' + tagSide; wTag.firstChild.style.width = up ? '2px' : g + 'px'; wTag.firstChild.style.height = up ? g + 'px' : '2px';
    wTag.style.transform = up ? `translate(${o.l.toFixed(1)}px, ${(tagSide === 'u' ? o.t : q[1]).toFixed(1)}px)` : `translate(${(tagSide === 'r' ? q[0] : o.l).toFixed(1)}px, ${q[1].toFixed(1)}px) translate(0, -50%)`;
  }
  /* a still's arrow: one filled shape along the hero's way, its head at the end (memory
     concentration-pictures-equal-volumes: designed arrows, never line arrows) */
  function drawArrow(on) {
    if (!on) { if (wArrow.firstChild) wArrow.innerHTML = ''; return; }
    const P = routeAv.map(a => stage.project(a.p)).filter(q => q[2]); if (P.length < 3) { wArrow.innerHTML = ''; return; }
    /* smoothed on the screen, then a band 9 px wide with a head 24 px wide and 20 px long */
    const S = P.map((q, i) => { const a = P[Math.max(0, i - 1)], c = P[Math.min(P.length - 1, i + 1)]; return [(a[0] + 2 * q[0] + c[0]) / 4, (a[1] + 2 * q[1] + c[1]) / 4]; });
    const L = [], Rt = [], hw = 4.5, n = S.length;
    let tot = 0; for (let i = 1; i < n; i++) tot += Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]); if (tot < 40) { wArrow.innerHTML = ''; return; }
    let run = 0, k = n - 1; for (let i = 1; i < n; i++) { run += Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]); if (run > tot - 20) { k = i; break; } }
    for (let i = 0; i <= k; i++) { const a = S[Math.max(0, i - 1)], c = S[Math.min(k, i + 1)], dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1; L.push([S[i][0] - dy / l * hw, S[i][1] + dx / l * hw]); Rt.push([S[i][0] + dy / l * hw, S[i][1] - dx / l * hw]); }
    const e = S[n - 1], b = S[k], dx = e[0] - b[0], dy = e[1] - b[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * 12, ny = dx / l * 12;
    const f = q => q[0].toFixed(1) + ' ' + q[1].toFixed(1);
    wArrow.innerHTML = `<path d="M${L.map(f).join(' L')} L${f([b[0] + nx, b[1] + ny])} L${f(e)} L${f([b[0] - nx, b[1] - ny])} L${Rt.slice().reverse().map(f).join(' L')} Z"/>`;
  }
  /* ---------------- the membrane: three scenes of the course (17 Nov 2026) ----------------
     Daniel's plan (the audit of 16 Nov, the plant cell's row): "three tiny scenes for diffusion, osmosis and active
     transport in place of three definitions". With a course on, the membrane step's box has one line and three buttons;
     a press plays that scene at the membrane itself (memflow.js: many particles on random walks in two regions of the
     same size, the crossings counted both ways). A scene is three beats in one view; the caption holds its definition
     whole, word for word (text.js MEMSCENES), with the pieces lit that the beat shows; a followed particle carries its
     name; under the membrane the two sides say where they are and, from the beat that teaches it, their concentration,
     each with one upright line into its region; the counter stands under the membrane from the beat of the net
     movement. Each beat waits for Next (which comes once the picture has shown what the lit words say). With Reduce
     motion each beat is one still, the followed particle's way an arrow. */
  const SCENEB = { membrane: Object.keys(MEMSCENES) };
  const MICON = { co2: '<svg viewBox="0 0 30 12"><circle cx="7" cy="6" r="4.4" fill="#ff7b7b"/><circle cx="15" cy="6" r="4.8" fill="#9aa3b5"/><circle cx="23" cy="6" r="4.4" fill="#ff7b7b"/></svg>',
    water: '<svg viewBox="0 0 22 14"><circle cx="11" cy="5.5" r="5" fill="#ff7b7b"/><circle cx="4.5" cy="10" r="3.2" fill="#fff"/><circle cx="17.5" cy="10" r="3.2" fill="#fff"/></svg>',
    nitrate: '<svg viewBox="0 0 20 18"><circle cx="15" cy="9" r="4" fill="#ff7b7b"/><circle cx="6" cy="3.8" r="4" fill="#ff7b7b"/><circle cx="6" cy="14.2" r="4" fill="#ff7b7b"/><circle cx="9" cy="9" r="4.2" fill="#6f8cff"/></svg>',
    sugar: '<svg viewBox="0 0 14 14"><polygon points="7,1.5 11.8,4.2 11.8,9.8 7,12.5 2.2,9.8 2.2,4.2" fill="none" stroke="#ffd56a" stroke-width="2.2"/></svg>',
    /* (the pale light at the carrier, as the picture draws it: it stands for energy from respiration, and the key says so:
       the science read, 17 Nov 2026: unnamed, in a leaf's lesson, a glow reads as sunlight) */
    energy: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7.5" fill="#fff1a8" opacity=".38"/><circle cx="8" cy="8" r="4.6" fill="#fff6c8" opacity=".75"/><circle cx="8" cy="8" r="2.2" fill="#ffffff"/></svg>' };
  const ARROW = '<svg viewBox="0 0 26 12"><path d="M0 4h17V0l9 6-9 6V8H0z"/></svg>';
  const wBoard = document.createElement('div'); wBoard.className = 'plv__board'; wBoard.hidden = true;
  const wTrail = document.createElementNS(SVGNS, 'svg'); wTrail.setAttribute('class', 'plv__trail'); wTrail.setAttribute('aria-hidden', 'true');
  stageEl.append(wTrail, wBoard);
  let memOn = null, mtok = 0;
  const memSeen = () => new Set((store.get('memSeen', []) || []).filter(k => MEMSCENES[k]));
  const memStep = () => cur >= 0 && STEPS[cur].id === 'membrane' && sceneKey === 'leaf' && !!(scene && scene.mem);
  function setSceneButtons() {
    const seen = memSeen();
    root.querySelectorAll('.plv__sb').forEach(b => { const k = b.dataset.scene, on = !!memOn && memOn.k === k; b.classList.toggle('is-on', on); b.classList.toggle('is-seen', seen.has(k) && !on); b.innerHTML = on ? '■ Stop' : `▶ ${MEMSCENES[k].button}`; b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  function memCapHTML(k, i) {
    const D = MEMSCENES[k], bt = D.beats[i], last = i === D.beats.length - 1;
    const say = bt.also ? `<span class="plv__wnow">${D.also}</span>` : `<b>${D.term}</b>: ` + D.parts.map((t, n) => `<span class="${bt.lit.includes(n) ? 'plv__wnow' : 'plv__wwas'}">${t}</span>`).join(' ');
    return `<div class="plv__wtop"><span class="plv__wk">IGCSE ${bt.also ? D.alsoCode : D.code}</span><span class="plv__wdots" role="img" aria-label="Part ${i + 1} of ${D.beats.length}">${D.beats.map((_, j) => `<i class="${j === i ? 'on' : j < i ? 'was' : ''}"></i>`).join('')}</span><button type="button" class="plv__wx" aria-label="Close">✕</button></div>`
      + `<p class="plv__wsay">${say}</p>`
      + `<div class="plv__wnav" hidden>${last ? '<button type="button" class="plv__wnext plv__wagain">↺ Watch again</button><button type="button" class="plv__wnext plv__wend pulse">Back to the membrane</button>' : '<button type="button" class="plv__wnext pulse">Next →</button>'}</div>`
      + `<p class="plv__wsize">${D.note}</p>`;
  }
  /* under the membrane: the two sides (where; and from the beat that teaches it, what the definition calls each), the
     counter between them, and a key for a particle that is drawn and not counted */
  function paintBoard(k, i) {
    const D = MEMSCENES[k], bt = D.beats[i], rows = D.rows, key = (D.keys || []).find(x => i >= x[2]);
    const side = (n, c) => `<div class="plv__bside plv__bside--${c}${bt.regions ? ' has-c' : ''}"><i aria-hidden="true"></i><p><b>${D.sides[n][0]}</b>${bt.regions ? `<span>${D.sides[n][1]}</span>` : ''}</p></div>`;
    wBoard.innerHTML = side(0, 'l') + side(1, 'r')
      + (key ? `<p class="plv__bkey"><span class="plv__bmol" aria-hidden="true">${MICON[key[0]]}</span>${key[1]}</p>` : '')
      + `<div class="plv__bmid"${bt.board ? '' : ' hidden'}><p class="plv__bk"><span class="plv__bmol" aria-hidden="true">${MICON[D.icon]}</span>${D.what}</p>`
      + `<p class="plv__bn"><span class="plv__ba" aria-hidden="true">${ARROW}</span><b data-n="in">0</b> ${rows[0]}</p><p class="plv__bn"><span class="plv__ba plv__ba--out" aria-hidden="true">${ARROW}</span><b data-n="out">0</b> ${rows[1]}</p><p class="plv__bf">${D.net}</p></div>`;
    wBoard.hidden = false; placeBoard();
  }
  function placeBoard() {
    if (wBoard.hidden || !scene || !scene.mem) return;
    const nar = stage.W < 560, xm = stage.project(scene.mem.centre())[0], half = scene.mem.half * stage.pxPerNm(), W = stage.W, H = stage.H;
    const L = wBoard.querySelector('.plv__bside--l'), Rt = wBoard.querySelector('.plv__bside--r'), mid = wBoard.querySelector('.plv__bmid'), key = wBoard.querySelector('.plv__bkey');
    const put = (el, cx, bottom, lo, hi) => { const w = el.offsetWidth, x = Math.max(lo, Math.min(hi - w, cx - w / 2)); el.style.left = x.toFixed(1) + 'px'; el.style.bottom = bottom + 'px'; return x + w / 2; };
    /* (a phone: the counter lies across the foot of the picture, above the scale bar and the zoom buttons, its rows a
       line each; the sides' words stand above it. A laptop: the counter under the membrane, between the scale bar and
       the zoom buttons; the sides' words beside it, never over it: no wider than the room on each side of it) */
    if (nar && mid && !mid.hidden) { mid.style.maxWidth = (W - 16) + 'px'; put(mid, xm, 58, 8, W - 8); }
    const sb = nar ? (mid && !mid.hidden ? 58 + mid.offsetHeight + 12 : 94) : 60;
    if (!nar) { const room = xm - 150 - 10 - (xm - half) / 2; [L, Rt].forEach(el => { el.style.maxWidth = Math.max(120, Math.min(250, 2 * room)) + 'px'; }); }
    put(L, (xm - half) / 2, sb, 6, xm - half - 6); put(Rt, (xm + half + W) / 2, sb, xm + half + 6, W - 6);
    /* (the key: in the picture's top right corner, beside the caption, when there is room; else above the cytoplasm's
       words, clear of their line) */
    if (key) { const capR = wCap.hidden ? 0 : wCap.offsetLeft + wCap.offsetWidth; if (!nar && W - capR > key.offsetWidth + 22) { key.style.left = (W - key.offsetWidth - 10) + 'px'; key.style.bottom = (H - 12 - key.offsetHeight) + 'px'; } else put(key, (xm + half + W) / 2, sb + Rt.offsetHeight + (nar ? 40 : 46), xm + half + 6, W - 6); }
    if (!nar && mid && !mid.hidden) { const z = zoomEl.hidden ? W : zoomEl.offsetLeft, sbar = stageEl.querySelector('.ibv__bar'), s0 = stageEl.getBoundingClientRect(), lo = Math.max(150, sbar ? sbar.getBoundingClientRect().right - s0.left + 12 : 0);
      put(mid, xm, 10, lo, Math.max(lo, z - 8) > xm ? z - 8 : W - 6); }
  }
  function memBoardNumbers() {
    const c = scene.mem.counts(), a = wBoard.querySelector('[data-n="in"]'), b = wBoard.querySelector('[data-n="out"]');
    if (a && +a.textContent !== c.in) { a.textContent = c.in; a.classList.remove('is-tick'); void a.offsetWidth; a.classList.add('is-tick'); }
    if (b && +b.textContent !== c.out) { b.textContent = c.out; b.classList.remove('is-tick'); void b.offsetWidth; b.classList.add('is-tick'); }
  }
  /* the followed particle's way so far: a soft line that fades towards its start (its random movement, seen) */
  function drawTrail(pts) {
    if (!pts || pts.length < 3) { if (wTrail.firstChild) wTrail.innerHTML = ''; return; }
    const P = pts.map(p => stage.project(p)), n = P.length, B = 5; let h = '';
    for (let b = 0; b < B; b++) { const i0 = Math.floor(b * (n - 1) / B), i1 = Math.floor((b + 1) * (n - 1) / B); if (i1 <= i0) continue;
      h += `<polyline points="${P.slice(i0, i1 + 1).map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ')}" style="opacity:${(0.1 + 0.5 * (b + 1) / B).toFixed(2)}"/>`; }
    wTrail.innerHTML = h;
  }
  /* a still's arrow in a scene: the followed particle's true way, turns and all, as one band of fixed width with round
     joins and a head of fixed size (a random way has sharp turns: the films' band, drawn from its two edges, made a
     spike at each, like a second arrowhead: the science read, 17 Nov 2026) */
  function drawWay(route) {
    if (!route || route.length < 3) { if (wArrow.firstChild) wArrow.innerHTML = ''; return; }
    const P = route.map(a => stage.project(a.p)).filter(q => q[2]).map(q => [q[0], q[1]]); if (P.length < 3) { wArrow.innerHTML = ''; return; }
    /* the head: 20 px long, 22 px wide, along the last 14 px of the way; the band stops at its base */
    const e = P[P.length - 1]; let k = P.length - 2; while (k > 0 && Math.hypot(e[0] - P[k][0], e[1] - P[k][1]) < 16) k--;
    const b = P[k], dx = e[0] - b[0], dy = e[1] - b[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, tip = [e[0] + ux * 6, e[1] + uy * 6], base = [e[0] - ux * 14, e[1] - uy * 14];
    const pts = P.slice(0, k + 1).concat([base]).map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '), f = q => q[0].toFixed(1) + ' ' + q[1].toFixed(1);
    wArrow.innerHTML = `<polyline class="plv__wayb" points="${pts}"/><polyline class="plv__way" points="${pts}"/><path class="plv__wayh" d="M${f(tip)} L${f([base[0] - uy * 11, base[1] + ux * 11])} L${f([base[0] + uy * 11, base[1] - ux * 11])} Z"/>`;
  }
  const memWait = (ms, my) => new Promise(r => setTimeout(r, ms)).then(() => my === mtok);
  async function memPlay(k, from = 0) {
    if (!memStep() || !MEMSCENES[k]) return;
    filmStop(false);
    const my = ++mtok, sm = scene.mem, D = MEMSCENES[k], phone = stage.W < 560; hideCard();
    const fresh = !memOn || memOn.k !== k;
    memOn = { k, i: from, ready: false }; root.classList.add('plv--film', 'plv--mem'); setSceneButtons();
    const mark = D.beats.findIndex(b => b.board);
    for (let i = from; i < D.beats.length; i++) {
      const bt = D.beats[i]; memOn.i = i; memOn.ready = false;
      /* the caption: the old words go before the new ones come (one caption, never words over words) */
      wCap.classList.add('is-out'); if (!(await memWait(FAST || wCap.hidden ? 0 : 180, my))) return;
      wCap.innerHTML = memCapHTML(k, i); wCap.hidden = false; wCap.classList.toggle('is-later', i > 0); if (R) R.terms(wCap); requestAnimationFrame(() => wCap.classList.remove('is-out'));
      /* a still: the scene at this beat's own second, the counter counting from the beat it first shows in */
      if (FAST) { sm.still(k, bt.still, { phone, at: bt.stillAt, mark: mark > 0 && i >= mark ? D.beats[mark - 1].still : null }); routeAv = (sm.now.arrowW || []).map((p, n) => ({ p, id: 'mr' + n })); }
      if (i === from) {
        if (!FAST && (fresh || from === 0)) sm.start(k, { phone });
        /* (the camera goes to the scene's own view; already there, Watch again, it only waits a moment) */
        wBoard.hidden = true; moving(); await tweenTo({ to: { cam: sm.views[k], mem: 1 }, ms: K.cam === sm.views[k] ? 350 : 2600 }); if (my !== mtok) return;
      }
      paintBoard(k, i); rest(bt.names);
      if (bt.board && !FAST) sm.mark();
      memOn.ready = true; memOn.t0 = performance.now(); memOn.crossed = false;
      /* Next once the picture has shown what the lit words say */
      if (!FAST) await new Promise(res => { const t0 = performance.now(), f = () => { if (my !== mtok) return res();
        const s = (performance.now() - t0) / 1000, c = sm.counts();
        const done = bt.next === 'time' ? s >= bt.s : bt.next === 'crossed' ? (memOn.crossed && s >= 1.5) || s >= bt.s : (c.in - c.out >= bt.n && (!bt.both || c.out >= 1) && s >= 3) || s >= bt.s;
        if (done) res(); else requestAnimationFrame(f); }; requestAnimationFrame(f); });
      if (my !== mtok) return;
      if (i === D.beats.length - 1) { const sn = memSeen(); if (!sn.has(k)) { sn.add(k); store.set('memSeen', [...sn]); } }
      const nav = wCap.querySelector('.plv__wnav'); nav.hidden = false;
      const b = await new Promise(res => nav.addEventListener('click', e => { const x = e.target.closest('button'); if (x) res(x); }));
      if (my !== mtok) return;
      if (b.classList.contains('plv__wagain')) { memPlay(k, 0); return; }
      if (b.classList.contains('plv__wend')) { memStop(true); return; }
    }
  }
  /* a scene stops (a press, the step left, the course switched off): back: the camera returns to the step's own view */
  function memStop(back) {
    if (!memOn) return; mtok++; memOn = null; routeAv = [];
    wCap.hidden = true; wCap.classList.remove('is-later'); wTag.hidden = true; wBoard.hidden = true; wArrow.innerHTML = ''; wTrail.innerHTML = ''; root.classList.remove('plv--film', 'plv--mem'); setSceneButtons();
    if (scene && scene.mem) scene.mem.stop();
    if (back && memStep()) { const m = motion('membrane'), my = token; moving(); tweenTo({ to: { cam: knobsAfter(cur).cam, mem: 0 }, ms: 2200 }).then(() => { if (!memOn && my === token && memStep()) rest(m.labs, m); }); }
    else if (K.mem) K.mem = 0;
  }
  let tagWords = '';
  function memFrame(dt) {
    if (!memOn || !scene || !scene.mem) return;
    const sm = scene.mem, N = sm.now, D = MEMSCENES[memOn.k], bt = D.beats[memOn.i];
    if (!FAST) sm.frame(dt);
    if (memOn.ready && N.crossed && N.on) memOn.crossed = true;
    /* (the process word comes when the particle is in the membrane, or in the carrier, and stays after it; a still of
       such a beat is taken at that moment: memflow.js still) */
    tagWords = bt.tagIn && (N.inMembrane || N.crossed) ? bt.tagIn : bt.tag;
    /* (its name never lies over the carrier it passes through) */
    let keep = null; if (sm.sim && sm.sim.car) { const c = stage.project(sm.centre()), ppn = stage.pxPerNm(); keep = [{ l: c[0] - sm.carrierSize[1] / 2 * ppn - 4, r: c[0] + sm.carrierSize[1] / 2 * ppn + 4, t: c[1] - sm.carrierSize[0] / 2 * ppn, b: c[1] + sm.carrierSize[0] / 2 * ppn }]; }
    placeTag(memOn.ready && N.on ? { hero: N.hero, words: tagWords, keep } : null);
    drawTrail(!FAST && memOn.ready ? N.trail : null); drawWay(FAST && memOn.ready ? routeAv : null);
    placeBoard(); if (memOn.ready && bt.board) memBoardNumbers();
  }
  wCap.addEventListener('click', e => { if (e.target.closest('.plv__wx')) { filmStop(true); memStop(true); } });
  panel.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.plv__sb'); if (!b) return;
    const k = b.dataset.scene;
    if (memOn && memOn.k === k) { memStop(true); return; }
    if (memStep() && at.rest && !tw) { memPlay(k); return; }
    /* pressed in the box of the membrane's step while the pupil is on another step: back to it, then the scene */
    const i0 = STEPS.findIndex(x => x.id === 'membrane'); if (i0 < 0) return;
    if (memOn) memStop(false);
    if (cur !== i0) show(i0);
    const t0 = performance.now(), go = () => { if (memStep() && at.rest && !tw) memPlay(k); else if (performance.now() - t0 < 20000) requestAnimationFrame(go); };
    requestAnimationFrame(go);
  });
  panel.addEventListener('click', e => { const c = e.target.closest && e.target.closest('.plv__chip'); if (c) pressName(c.dataset.k); });
  panel.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.plv__wb[data-watch]'); if (!b) return;
    const k = b.dataset.watch;
    if (film && film.k === k) { filmStop(true); return; }
    if (film) filmStop(false);
    if (filmHome(k) && at.rest) { filmPlay(k); return; }
    /* pressed in the box of the film's step while the pupil is on another step: back to that step, then the film */
    const i0 = STEPS.findIndex(x => x.id === filmStepOf(k)); if (i0 < 0) return;
    if (cur !== i0) show(i0);
    const t0 = performance.now(), go = () => { if (filmHome(k) && at.rest && !tw) filmPlay(k); else if (performance.now() - t0 < 20000) requestAnimationFrame(go); };
    requestAnimationFrame(go);
  });
  document.addEventListener('progress', paintLv);
  /* a switch pressed in a place or a film (or another tab): the side quest follows */
  const followLv = () => { if (!root.isConnected) { document.removeEventListener('courselv', followLv); return; } const n = course(); if (!!n.igcse === !!LV.igcse && !!n.ib === !!LV.ib) return; LV.igcse = !!n.igcse; LV.ib = !!n.ib; paintLv(); paintX(); paintEq(); if (at.rest) { stage.showLabels(curLabs); seenSig = ''; if (scene && scene.group) lookForHidden(); } };
  document.addEventListener('courselv', followLv);
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
    /* (22 Nov 2026) a small laptop's picture (a window 1280 or 1366 px wide, an iPad on its side: the picture under 960 px
       wide or under 720 px high, and no phone): a name may have a middle form there (htmlM), its own words on more lines or
       its short form, where the long one had no room on its own side and stood on its part */
    const narrow = stage.W < 560, mid = midPic(), labs = {}; labN = {}; Object.keys(sc.labels || {}).forEach(k => { const d = sc.labels[k];
      const e = narrow && d.pin ? Object.assign({}, d, { html: String(d.pin), cls: (d.cls ? d.cls + ' ' : '') + 'is-pin', gaps: [30, 46, 64, 84, 110, 140] /* a pin stands beside the small picture, not on it */ }) : narrow && d.htmlN ? Object.assign({}, d, { html: d.htmlN }) : mid && d.htmlM ? Object.assign({}, d, { html: d.htmlM }) : Object.assign({}, d);
      /* its line ends only on a point that is in view (see "names point at what is seen") */
      /* a line long enough to be seen, from its part to the name beside it (16 Nov 2026; Daniel: "you don't have a line, so
         you don't know actually what this is pointing at"): never shorter than 40 px on a laptop, 22 px on a phone */
      if (!e.gaps) e.gaps = narrow ? [22, 36, 56, 90, 140] : [40, 64, 96, 140, 200, 270];
      e.pts = () => { const P = d.pts() || []; pts3[k] = P; const m = seen[k]; if (d.through || !m || m.length !== P.length) return P; return P.filter((_, i) => m[i]); };
      if (d.nm && PNAMES[d.nm]) labN[k] = { nm: d.nm, html: e.html, now: e.html };
      labs[k] = e; });
    Object.keys(seen).forEach(k => delete seen[k]); Object.keys(pts3).forEach(k => delete pts3[k]); seenSig = '';
    root.classList.toggle('plv--pins', narrow); root.classList.toggle('plv--mid', mid);
    stage.defineLabels(labs); namesPaint(); filmStop(false); memStop(false); hideCard(); paintFound();
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
    const el = document.createElement('button'); el.type = 'button'; el.className = 'hot3__b'; el.innerHTML = `<span>${hotWord(def.w, label)}</span>`;
    if (def.w) el.dataset.y7 = label;
    wrap.appendChild(el); hotsEl.appendChild(wrap);
    const h = { wrap, el, at: def.at, side: def.side || 'c', id: def.id || def.at, w: def.w || '', y7: label, label: hotWord(def.w, label) };
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
    li.innerHTML = `<div class="step__t">${paras(STEPS[i].text)}</div>${boxesHTML(i)}<div class="step__do"></div><div class="step__say" aria-live="polite"></div>`;
    ol.appendChild(li); if (R) R.terms(li); wordsPaint(); return li;
  }
  /* the course boxes of step i (16 Nov 2026; Daniel, with a picture of this leaf's IGCSE box: "I am a student, I see this
     … I'm not going to read it"; then, of its More: "a lot of text, also not very nicely organized. I don't see the
     labels"): a details each, open for the step the pupil is on (show), a small chip for the steps before; in it one
     line on show, then the buttons (the leaf's two films) and the leaf's key (its twelve names as chips, keyHTML), and
     the other lines under More (iblevel.js boxLines), what a syllabus does not name among them. */
  const SCOPE = /does not name|not in the list|names no part|not named|no SL statement|does not show/i;
  const picState = {};
  /* the boxes of step i drawn again (its picture changed state), open as they were */
  function boxesAgain(i) { const li = liOf(i); if (!li) return; const was = li.querySelector('details.plv__lvbox'), open = !!(was && was.open);
    li.querySelectorAll('.plv__lvbox').forEach(b => b.remove()); li.querySelector('.step__t').insertAdjacentHTML('afterend', boxesHTML(i, open)); if (R) R.terms(li); paintFound(); }
  function boxesHTML(i, open) {
    const id = STEPS[i].id, G = COURSE.igcse[id], B = COURSE.ib[id], o = open ? ' open' : '';
    /* the step's sets of names: for the IGCSE box (not IB's own) and for the IB box (not IGCSE's own; none at a level
       that shows none of its names) */
    const sets = setsAt(id), XG = sets.filter(q => !XKEY[q].ib), XB = sets.filter(q => !XKEY[q].igcse && rowsOf(q).length);
    /* (17 Nov 2026) a line that has its own scene at the picture (the membrane's three definitions) is shown there, in
       the scene's caption, word for word, and not in the box */
    const inScene = new Set((SCENEB[id] || []).map(k => MEMSCENES[k].line)), seen = memSeen();
    /* (and a line whose parts are names to press on the picture, the membrane's and the chloroplast's, is said there, in
       their cards: an IB set's lines, an IGCSE set's linesG) */
    const saidG = new Set(XG.flatMap(q => XKEY[q].linesG || [])), onPic = new Set(sets.filter(q => XKEY[q].ib).flatMap(q => XKEY[q].lines || []));
    /* (nor an IGCSE line that is the equation on the strip: text.js EQS) */
    const onStrip = new Set(EQS[id] ? EQS[id].lines : []);
    /* (20 Nov 2026) while the picture is in a state that has a line of its own (text.js STATE: the soft cell), that line
       is the one on show */
    const lead = (L, n) => n == null || !L.some(l => l.n === n) ? L : [Object.assign({}, L.find(l => l.n === n), { scope: false })].concat(L.filter(l => l.n !== n)), now = (STATE[id] || {})[picState[id]] || {};
    const gl = lead((G || []).map((t, n) => ({ n, html: t, scope: SCOPE.test(t) })).filter(l => !inScene.has(l.n) && !saidG.has(l.n) && !onStrip.has(l.n)), now.igcse);
    /* (nor an IB line whose pieces are the captions of the IB box's own films: it is said on the picture) */
    const inFilm = new Set(((WATCH[id] || {}).ib || []).flatMap(k => FILMS[k].shots.map(x => x.line)));
    const bl = lead((B || []).map(([lv, t], n) => ({ n, hl: lv === 'HL', scope: !lv || SCOPE.test(t), html: `${lv ? `<b class="plv__sl plv__sl--${lv.toLowerCase()}">${lv}</b> ` : ''}${t}` })).filter(l => !onPic.has(l.n) && !inFilm.has(l.n)), now.ib);
    const watchHTML = list => list && list.length ? `<div class="plv__watch">${list.map(k => film && film.k === k ? `<button type="button" class="plv__wb is-on" data-watch="${k}" aria-pressed="true">■ Stop the film</button>` : `<button type="button" class="plv__wb" data-watch="${k}" aria-pressed="false">▶ ${FILMS[k].button}</button>`).join('')}</div>` : '';
    const W = watchHTML((WATCH[id] || {}).igcse), WB = watchHTML((WATCH[id] || {}).ib);
    const SB = SCENEB[id] ? `<div class="plv__watch plv__scenes">${SCENEB[id].map(k => memOn && memOn.k === k ? `<button type="button" class="plv__wb plv__sb is-on" data-scene="${k}" aria-pressed="true">■ Stop</button>` : `<button type="button" class="plv__wb plv__sb${seen.has(k) ? ' is-seen' : ''}" data-scene="${k}" aria-pressed="false">▶ ${MEMSCENES[k].button}</button>`).join('')}</div>` : '';
    /* (the leaf's key stands in both boxes, the same names for either course; the membrane's, IB names, in the IB box) */
    /* (the membrane's scenes are IGCSE's: not in the IB box. The IB guide teaches aquaporins for water and pump proteins
       with ATP, which these scenes do not show: the science read, 17 Nov 2026) */
    const mid = W + SB + XG.map(q => keyHTML(q)).join(''), midB = WB + XB.map(q => keyHTML(q)).join('');
    return (G || XG.length ? `<details class="y8 plv__lvbox" data-lv="igcse"${o}><summary class="y8__k">IGCSE</summary>${boxLines(gl, { scope: l => l.scope, mid })}</details>` : '')
      + (B ? `<details class="y8 plv__lvbox${B.every(l => l[0] === 'HL') && !VDOOR[id] ? ' iblv-hlbox' : ''}" data-lv="ib"${o}><summary class="y8__k">IB</summary>${boxLines(bl, { scope: l => l.scope, mid: midB })}${VDOOR[id] ? `<button type="button" class="plv__vdoor" data-view="${VDOOR[id][0]}">${VDOOR[id][1]}</button>` : ''}</details>` : '');
  }
  /* the level changed: each step's boxes drawn again, open as they were */
  document.addEventListener('iblevel', function relevel() {
    if (!root.isConnected) { document.removeEventListener('iblevel', relevel); return; }
    Array.from(ol.children).forEach((li, i) => {
      const was = li.querySelector('details.plv__lvbox'), open = !!(was && was.open);
      li.querySelectorAll('.plv__lvbox').forEach(b => b.remove());
      li.querySelector('.step__t').insertAdjacentHTML('afterend', boxesHTML(i, open)); if (R) R.terms(li);
    });
    /* the names on the picture follow the level too (an HL name is not shown at SL), and a look at one goes */
    if (lookOn && !rowsOf(setOf(lookOn)).some(r => r[0] === lookOn)) { hideCard(); lookOff(true); }
    if (cardEl && !cardEl.hidden && cardEl.dataset.k && !rowsOf(setOf(cardEl.dataset.k)).some(r => r[0] === cardEl.dataset.k)) hideCard();
    paintX(); paintFound(); if (at.rest) showNames();
  });
  function again(i) {
    const li = liOf(i), m = scene && STEPS[i].scene === sceneKey ? motion(STEPS[i].id) : null;
    if (!li || li.querySelector('.step__again') || STEPS[i].scene === 'ring') return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'step__again'; b.setAttribute('aria-label', 'Watch this step again'); b.dataset.tip = 'Watch this step again'; b.textContent = '↻';
    const t = li.querySelector('.step__t'); (t.lastElementChild || t).appendChild(b);
    b.addEventListener('click', () => watch(i));
  }
  const say = (li, html, cls = 'ok') => { const s = li.querySelector('.step__say'); s.className = 'step__say ' + cls; s.innerHTML = paras(html); if (R) R.terms(s); wordsPaint(); markSig = ''; reveal(s, true); };
  function reveal(el, glow) {
    requestAnimationFrame(() => {
      if (!el.isConnected) return;
      const pt = panel.getBoundingClientRect().top, er = el.getBoundingClientRect(), li = el.closest('.step') || el, lr = li.getBoundingClientRect();
      const y = v => v - pt + panel.scrollTop, room = panel.clientHeight, end = y(er.bottom) + 12, start = end - (y(lr.top) - 12) <= room ? y(lr.top) - 12 : y(er.top) - 12;
      /* (the equation's strip pinned at the top of a phone's sheet: nothing is brought into view under it) */
      const pin = !wEq.hidden && wEq.parentNode === panel ? wEq.offsetHeight + 10 : 0;
      let top = panel.scrollTop; if (end > top + room) top = end - room; if (start - pin < top) top = Math.max(0, start - pin);
      if (Math.abs(top - panel.scrollTop) > 1) panel.scrollTo({ top, behavior: FAST ? 'auto' : 'smooth' });
      if (!glow) return; el.classList.remove('is-new'); void el.offsetWidth; el.classList.add('is-new'); setTimeout(() => el.classList.remove('is-new'), 1800);
    });
  }
  const nextBtn = (li, label) => new Promise(res => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn next pulse'; b.textContent = label + ' →';
    li.querySelector('.step__do').appendChild(b); reveal(b, false);
    requestAnimationFrame(() => requestAnimationFrame(() => answerInView(li, b)));
    b.addEventListener('click', () => { b.remove(); res(); }, { once: true });
  });
  /* (17 Nov 2026; the science read of the light step: "with the light on, the panel still reads 'The light is off now …
     Press ☀ Light on'; the true lines are off screen") what a press has just said stands UNDER the Next button, and
     bringing the button into view left those words just below the panel's edge, on every screen and with no course too.
     Now: the panel goes down until the words are in view, but never so far that Next leaves it (a long answer on a
     phone: Next at the top, the answer's first lines under it; nothing under the equation's strip pinned there) */
  function answerInView(li, b) {
    const sEl = li.querySelector('.step__say'); if (!sEl || !sEl.firstChild || !b.isConnected) return;
    const pt = panel.getBoundingClientRect().top, y = v => v - pt + panel.scrollTop, room = panel.clientHeight;
    const pin = !wEq.hidden && wEq.parentNode === panel ? wEq.offsetHeight + 10 : 0;
    const top = Math.max(0, Math.min(y(b.getBoundingClientRect().top) - 12 - pin, Math.max(panel.scrollTop, y(sEl.getBoundingClientRect().bottom) + 12 - room)));
    if (Math.abs(top - panel.scrollTop) > 1) panel.scrollTo({ top, behavior: FAST ? 'auto' : 'smooth' });
  }

  /* one step: its picture's moves, then its buttons (each waits for the pupil), then Next. auto: watched again (↻): the
     buttons press themselves, nothing is said again or saved */
  async function play(i, { auto = false } = {}) {
    filmStop(false); memStop(false);
    const my = token, st = STEPS[i], m = motion(st.id), li = liOf(i);
    Object.assign(K, knobsAfter(i - 1)); paintEq();
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
          rest(P.all.length > 1 && b.lab ? Object.assign({ [b.lab]: 1 }, b.labs || {}) : shown, m);
          /* the mouth: what amylase did in the game's own test, if the pupil has done it */
          if (!auto && st.say && st.say[b.id]) say(li, st.say[b.id] + (st.say.wellA ? '\n' + (doneFlag('test') ? st.say.wellA : st.say.later) : ''));
          /* (21 Nov 2026) a press that has a line of its own (text.js STATE) puts it on show, as a state of a two-state button does */
          if (!auto && STATE[st.id] && STATE[st.id][b.id]) { picState[st.id] = b.id; boxesAgain(i); }
          left.delete(b.id); if (!left.size) res();
        }, { auto }));
      });
      if (my !== token) return false;
      if (!auto && st.say && st.say.done) { const s = li.querySelector('.step__say'); s.insertAdjacentHTML('beforeend', `<p class="plv__all">${st.say.done}</p>`); wordsPaint(); reveal(s, false); }
    } else if (P && P.toggle) {
      /* one button with two states (light on, light off): Next comes once the first has been pressed; the pupil may go
         on pressing until then */
      let k = 0, busy = false, went = false;
      await new Promise(res => {
        const T = P.toggle;
        const h = hot(Object.assign({ w: T.states[0].w }, T), T.states[0].label, async () => {
          if (busy) return; busy = true; h.el.disabled = true;
          const S0 = T.states[k]; moving();
          /* the button says at once what a press will do next (it had read "Light on" while the light was on) */
          { const N = T.states[(k + 1) % T.states.length]; h.w = N.w || ''; h.y7 = N.label; if (N.w) h.el.dataset.y7 = N.label; else delete h.el.dataset.y7; hotSet(h, hotWord(N.w, N.label)); }
          await tweenTo({ to: S0.to, ms: S0.ms }); if (my !== token) return res();
          for (const ph of (S0.then || [])) { await tweenTo(ph); if (my !== token) return res(); }
          rest(S0.labs || m.labs, m);
          if (!auto && st.say && st.say[S0.say]) say(li, st.say[S0.say], S0.say === 'off' || S0.say === 'soft' ? 'no' : 'ok');
          if (!auto && STATE[st.id]) { picState[st.id] = S0.say; boxesAgain(i); }
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
    filmStop(false); memStop(false); lookReset();
    const my = ++token; cur = i; at = { i, rest: false, watching: false }; clearHots();
    if (picState[STEPS[i].id]) { delete picState[STEPS[i].id]; boxesAgain(i); }
    const st = STEPS[i];
    for (let j = 0; j <= i; j++) { const li = addStep(j); li.hidden = !!visit && j < i; li.className = 'step ' + (j < i ? 'is-done' : 'is-now'); if (j < i) { li.querySelector('.step__do').innerHTML = ''; } }
    for (let j = i + 1; j < ol.children.length; j++) ol.children[j].hidden = true;
    /* one step's course boxes open at a time: this one */
    ol.querySelectorAll('details.plv__lvbox').forEach(d => { d.open = d.closest('li') === liOf(i); });
    loopEl.innerHTML = loopMap(st.where); countEl.textContent = `Step ${i + 1} of ${STEPS.length}`;
    const li = liOf(i); li.querySelector('.step__say').innerHTML = ''; li.querySelector('.step__do').innerHTML = '';
    panel.scrollTo({ top: Math.max(0, li.offsetTop - 12), behavior: FAST || i === 0 ? 'auto' : 'smooth' });
    endEl.hidden = true;
    if (!(await useScene(st.scene))) return;
    if (my !== token) return;
    if (!visit) for (let j = 0; j < i; j++) again(j);
    const ok = await play(i); if (!ok || my !== token) return;
    /* a visit by a door: this step alone; the way back in place of Next; nothing is saved */
    if (visit) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn next plv__visitback'; b.textContent = '← Back to your mission'; li.querySelector('.step__do').appendChild(b); b.addEventListener('click', close); return; }
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
    const back = cur, ended = !endEl.hidden; lookReset();
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
  root.addEventListener('click', e => { const d = e.target.closest('.plv__vdoor'); if (!d) return; const v = d.dataset.view;
    if (!inGame) { location.href = '../' + v + '/'; return; }
    close(); setTimeout(() => document.dispatchEvent(new CustomEvent('ibview2', { detail: { view: v } })), 0); });
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
    /* (the names that a course may word: the scene's key, the table's key, its words now) */
    names: () => Object.keys(labN).map(k => ({ k, nm: labN[k].nm, now: labN[k].now, side: (scene.labels[k] || {}).side || '' })),
    knobs: () => Object.assign({}, K), zoom: () => ({ k: Z.k, r: Z.r, u: Z.u, max: Z.max }), zoomAt, lv: () => ({ there: !lvEl.hidden, igcse: lvOn('igcse'), ib: lvOn('ib') }),
    /* the point of the picture (3D) that a name's line ended on when its screen place was xy */
    labelPoint: (k, xy) => { let best = null, bd = 1e9; (pts3[k] || []).forEach(p => { const q = stage.project(p), d = Math.hypot(q[0] - xy[0], q[1] - xy[1]); if (d < bd) { bd = d; best = p; } }); return best; },
    /* the names now shown whose line ends on a point that is NOT in view (a fresh test, not the kept one) */
    hidden: () => { if (!scene || !scene.group) return []; scene.group.updateMatrixWorld(true); const tol = 12 / stage.pxPerNm(), out = [];
      stage.labelState().filter(x => x.on).forEach(x => { const d = scene.labels[x.key]; if (!d || d.through) return; const P = pts3[x.key] || d.pts() || []; let best = null, bd = 1e9;
        P.forEach(p => { const q = stage.project(p), dd = Math.hypot(q[0] - x.p[0], q[1] - x.p[1]); if (dd < bd) { bd = dd; best = p; } });
        if (best && bd < 3 && !inView(best, tol)) out.push(x.key); });
      return out; }, sizes: () => (scene && scene.sizes) || null, measure: () => (scene && scene.measure ? scene.measure() : null), bar: () => { const b = root.querySelector('.ibv__bar'); return b ? { text: b.lastChild.textContent, px: parseFloat(b.firstChild.style.width), pxPerNm: stage.pxPerNm() } : null; },
    hots: () => hots.map(h => ({ id: h.id, label: h.label, y7: h.y7, w: h.w, two: !!h.two, pt: h.pt || null, box: (r => ({ l: r.left, r: r.right, t: r.top, b: r.bottom }))(h.el.getBoundingClientRect()) })),
    /* a film (tools/ib-level.mjs H2, tools/plant-look.mjs --watch): which shot, has the camera arrived, is Next shown;
       its molecules and paths (films.js check) */
    film: () => film ? { k: film.k, i: film.i, n: FILMS[film.k].shots.length, arrived: film.ts0 != null, next: !!wCap.querySelector('.plv__wnav:not([hidden])'), cam: K.cam, drawn: scene.film.now.drawn, tag: wTag.hidden ? '' : wTag.lastChild.textContent, say: wCap.querySelector('.plv__wnow') ? wCap.querySelector('.plv__wnow').textContent : '' } : null,
    filmCheck: () => scene && scene.film ? scene.film.check() : null,
    /* (the cell in a solution, as drawn now: leaf.js bathNow) */
    bath: () => scene && scene.bathNow ? scene.bathNow() : null,
    /* (the wall from near, IB's film of transpiration: what wet.js draws now; tools/plant-check.mjs S) */
    filmNear: () => scene && scene.film && scene.film.near ? Object.assign(scene.film.near(), { perNm: stage.pxPerNm(), stage: [stage.W, stage.H] }) : null,
    /* a scene at the membrane (tools/plant-check.mjs K, tools/plant-scenes.mjs): which, its beat, has the camera arrived,
       is Next shown, the counter, what is drawn on each side, the followed particle's name and place */
    mem: () => memOn ? { k: memOn.k, i: memOn.i, n: MEMSCENES[memOn.k].beats.length, ready: !!memOn.ready, next: !!wCap.querySelector('.plv__wnav:not([hidden])'), cam: K.cam, counts: scene.mem.counts(), census: scene.mem.census(), time: scene.mem.time, heroState: scene.mem.heroState, route: routeAv.map(a => stage.project(a.p)),
      tag: wTag.hidden ? '' : wTag.lastChild.textContent, hero: scene.mem.now.on ? stage.project(scene.mem.now.hero) : null, say: wCap.querySelector('.plv__wsay') ? wCap.querySelector('.plv__wsay').textContent : '', lit: [...wCap.querySelectorAll('.plv__wnow')].map(x => x.textContent), carrier: scene.mem.now.carrier } : null,
    memCheck: phone => scene && scene.mem ? scene.mem.check(phone) : null, memSizes: () => scene && scene.mem ? scene.mem.sizes() : null, memObstacles: () => scene && scene.mem ? scene.mem.obstacles : null,
    memPlay: k => memPlay(k), memStop: () => memStop(true), memMid: () => scene.mem.centre(), memHalf: () => scene.mem.half,
    /* the starch picture now (tools/plant-check.mjs N): the rings of the chain, the water molecules from its joins */
    starch: () => (scene && scene.starchNow ? scene.starchNow() : null),
    /* the atoms of one join (tools/plant-check.mjs Q); h: a moment of the play, held */
    atoms: h => { if (h != null && lookOn && scene) { K.gly = h; K.garr = 0; scene.draw(K, 0, 0); } return scene && scene.atomsNow ? Object.assign(scene.atomsNow(), { cam: K.cam, key: wWhere.hidden ? [] : [...wWhere.querySelectorAll('.plv__akey li, .plv__anote')].map(x => x.textContent) }) : null; },
    /* the atoms of a piece of the fibre (tools/plant-check.mjs R); h: a moment of the play, held. px: each atom's place on the screen */
    fatoms: h => { if (h != null && lookOn && scene) { K.cat = h; scene.draw(K, 0, 0); } if (!scene || !scene.fibreAtomsNow) return null; const f = scene.fibreAtomsNow(); return Object.assign(f, { cam: K.cam, px: f.px.map(q => stage.project(q).slice(0, 2)), perNm: stage.pxPerNm(), key: wWhere.hidden ? [] : [...wWhere.querySelectorAll('.plv__akey li, .plv__anote')].map(x => x.textContent) }); },
    /* the wall's near picture now (tools/plant-check.mjs P); h: a moment of its play, held */
    wall: h => { if (h != null && lookOn && scene) { K.cel = h; scene.draw(K, 0, 0); } if (!scene || !scene.wallNow) return null; const w = scene.wallNow(); /* (span: the fibre's two edges on the screen, px) */ return Object.assign(w, { cam: K.cam, span: w.ends.map(q => stage.project(q)[0]), ends: null }); },
    /* the grain's picture now (tools/plant-check.mjs O): its size, the night, the near look's chain, water and glucose.
       h: a moment of the near look's play, held (a check asks for its start, 0, and its end, 1) */
    grain: h => { if (h != null && lookOn && scene) { K.hyd = h; K.harr = 0; scene.draw(K, 0, 0); } return scene && scene.grainNow ? Object.assign(scene.grainNow(), { day: K.day, nightKnob: K.night, cam: K.cam, atoms: lookOn && scene.avoid ? scene.avoid().map(q => stage.project(q.p).slice(0, 2)) : [] }) : null; },
    /* the equation's strip (tools/plant-check.mjs M): where it is, its rows, which terms are lit */
    eq: () => wEq.hidden ? null : (() => { const st = stageEl.getBoundingClientRect(), b = wEq.getBoundingClientRect(), pn = panel.getBoundingClientRect(); return { id: wEq.dataset.id, sheet: wEq.parentNode === panel, box: [b.left - st.left, b.top - st.top, b.right - st.left, b.bottom - st.top], panelTop: b.top - pn.top, title: wEq.querySelector('.plv__eqk').textContent.trim(), rows: [...wEq.querySelectorAll('.plv__eql')].map(x => x.innerHTML.replace(/<span[^>]*>|<\/span>/g, '')), tailTop: (q => q ? q.getBoundingClientRect().top - q.parentNode.getBoundingClientRect().top : 0)(wEq.querySelector('.plv__eqc')), on: [...new Set([...wEq.querySelectorAll('.plv__eqt.is-on')].map(x => x.dataset.t))].sort() }; })(),
    /* a name that shows its part (tools/plant-check.mjs L, tools/plant-names.mjs): which, is the camera still moving */
    look: () => ({ on: lookOn, moving: lookMoving, cam: K.cam, card: cardEl && !cardEl.hidden ? cardEl.dataset.k || '' : '', where: wWhere.hidden || !wWhere.querySelector('.plv__whp') ? null : (() => { const st = stageEl.getBoundingClientRect(), o = wWhere.querySelector('.plv__whp').getBoundingClientRect(), f = wWhere.querySelector('.plv__whf').getBoundingClientRect(), b = wWhere.getBoundingClientRect(); return { box: [b.left - st.left, b.top - st.top, b.right - st.left, b.bottom - st.top], part: [o.width, o.height], frame: [f.left - o.left, f.top - o.top, f.width, f.height], text: wWhere.textContent.trim() }; })() }), pressName: k => pressName(k), lookOff: () => { hideCard(); lookOff(true); },
    visit: () => visit ? { step: STEPS[visit.i].id, scene: visit.scene } : null,
    goto: i => show(Math.max(0, Math.min(STEPS.length - 1, i))), end: () => { token++; cur = STEPS.length - 1; finish(false); return restAtEnd(); }, close
  };

  /* where to start: where the pupil was (a finished branch opens at its end; ↺ From the start plays it again) */
  if (visit) { show(visit.i);
    /* the scene the door named starts when the step's picture is at rest (as its button does, pressed from another step) */
    if (visit.scene) { const t0 = performance.now(), go = () => { if (closed || cur !== visit.i) return; if (memStep() && at.rest && !tw && lvOn('igcse')) memPlay(visit.scene); else if (performance.now() - t0 < 30000) requestAnimationFrame(go); }; requestAnimationFrame(go); } }
  else if (saved.done) { cur = STEPS.length - 1; finish(false); restAtEnd(); }
  else show(Math.max(0, Math.min(STEPS.length - 1, saved.step || 0)));
  return { close, root };
}
