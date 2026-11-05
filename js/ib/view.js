/* ============================================================
   view.js — "From glucose to ATP", the IB view of the Y7 cell game's respiration (5 Nov 2026).
   Daniel, 5 Nov 2026: "once everything is answered correctly related to the mitochondria, you should allow the students
   to go into kind of separate window ... it needs to be big enough, or actually I will use this animation later on";
   "recreate the whole process from, when you get the glucose to when it enters the cell ... what happens inside the
   cytosol and what happens in the mitochondria"; "within one single place, you can explore everything and understand
   every single term ... your choice where you want to go"; "why every single step happens ... not just memorize, but
   understand the story".
   So: one view that fills the window, opened from the game (openIB, over the whole page; it closes back to the place the
   pupil was) or at its own address (glucose-to-atp/, for an IB lesson). Its chapters are tabs along the top; each chapter
   is a 3D picture with steps that wait for Next (memory animations-wait-for-the-reader), names on the picture on level
   lines shown only when the picture is at rest, glucose's carbons numbered on their atoms, every size true (the camera
   zooms; a scale bar), each paragraph marked with its level (SL and HL / HL only / beyond the IB guide), new words a press
   away (the one KS3 glossary, with Korean and Chinese), and Explore paths the pupil chooses (NAD, FAD, coenzyme A …).
   Each chapter's picture is its own module (ch0.js …), fetched when it opens; its words are in text.js.
   A chapter module: build(stage, kit) → { group, knobs (numbers that say everything about the picture), views (camera
   views; the knob `cam` moves between them), steps [{ phases: [{ to: {knob: value}, ms, lin }], labs: {name: 1 | 2} }],
   labels {name: {html, side, pts()}}, draw(K, t, dt), nums(K) (glucose's carbons to number), pick(ray) (a press on the
   picture), dispose() }. Any step can be shown from its start (Back, Replay, a jump): the knobs at the start of step k are
   the first knobs with every earlier phase applied, so nothing ever depends on how the pupil got there.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { makeStage, smooth, V, glow } from './stage.js?v=202611051947';
import { CHAPTERS, EXPLORE, LEVELS } from './text.js?v=202611051947';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const store = {
  get(k, d) { try { const v = localStorage.getItem('cellgame.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('cellgame.' + k, JSON.stringify(v)); } catch (e) { /* a private window: this visit only */ } }
};
const params = new URLSearchParams(location.search);
const FAST = params.has('ibstill') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* a paragraph's level chip: [sl], [hl], [x], with an IB code after it ([hl C1.2.8]) */
function paras(t) {
  return t.split('\n').map(p => {
    /* a tag may carry several codes, or a range: [hl C1.2.8, C1.2.12], [hl C1.2.11–16] */
    const m = /^\[(sl|hl|x)(?:\s+([A-Z][0-9.]+(?:[–-][0-9.]+)?(?:,\s*[A-Z][0-9.]+(?:[–-][0-9.]+)?)*))?\]\s*/.exec(p);
    if (!m) return `<p>${p}</p>`;
    const L = LEVELS[m[1]];
    return `<p class="lvp lvp--${m[1]}"><span class="lv lv--${m[1]}" title="">${esc(L.name)}${m[2] ? ` <i>${esc(m[2])}</i>` : ''}</span> ${p.slice(m[0].length)}</p>`;
  }).join('');
}

/* where the chapter happens, on a small map (the same places as chapter 0's) */
function miniMap(where) {
  const on = w => (where === 'all' || where === w || (w === 'mito' && ['inner', 'matrix'].includes(where))) ? ' on' : '';
  return `<svg class="ibv__mm" viewBox="0 0 220 120" role="img" aria-label="Where this chapter happens: ${esc(where)}">
    <rect x="2" y="2" width="216" height="72" rx="12" class="mm-cyt${on('cytosol')}"/>
    <rect x="2" y="88" width="216" height="30" rx="14" class="mm-cap${on('blood')}"/>
    <ellipse cx="40" cy="103" rx="15" ry="8" class="mm-rbc"/><ellipse cx="110" cy="103" rx="15" ry="8" class="mm-rbc"/><ellipse cx="180" cy="103" rx="15" ry="8" class="mm-rbc"/>
    <line x1="2" y1="80" x2="218" y2="80" class="mm-mem${on('membrane')}"/>
    <circle cx="48" cy="42" r="13" class="mm-gly${on('cytosol')}"/>
    <rect x="96" y="20" width="108" height="42" rx="21" class="mm-om${on('mito')}"/>
    <rect x="104" y="27" width="92" height="28" rx="14" class="mm-mx${on('matrix')}"/>
    <path d="M112 30 v12 M124 52 v-12 M136 30 v12 M148 52 v-12 M160 30 v12 M172 52 v-12 M184 30 v12" class="mm-im${on('inner')}"/>
  </svg>`;
}

/* ---------------- key words: the meaning opens where you are ---------------- */
function termsIn(root, tipHost) {
  const G = window.KS3_GLOSSARY;
  root.querySelectorAll('dfn[data-w]').forEach(d => {
    const w = G && G.by[d.dataset.w];
    if (!w) { console.warn('From glucose to ATP: the glossary has no ' + d.dataset.w); d.replaceWith(document.createTextNode(d.textContent)); return; }
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ibv-term'; b.dataset.w = d.dataset.w; b.innerHTML = d.innerHTML;
    b.setAttribute('aria-label', d.textContent + ': show its meaning'); d.replaceWith(b);
    /* a button is laid out as a block in the line, so a line could end between "(" and the word: the characters that
       touch it ("(", ").", ",") go with it into one piece that never breaks */
    const pre = b.previousSibling, post = b.nextSibling;
    const a = pre && pre.nodeType === 3 ? /\S+$/.exec(pre.data) : null, z = post && post.nodeType === 3 ? /^\S+/.exec(post.data) : null;
    if (a || z) {
      const nw = document.createElement('span'); nw.className = 'ibv-nw'; b.replaceWith(nw);
      if (a) { pre.data = pre.data.slice(0, a.index); nw.append(a[0]); }
      nw.append(b);
      if (z) { post.data = post.data.slice(z[0].length); nw.append(z[0]); }
    }
  });
}

export function openIB({ mount = document.body, inGame = false, start = null, onClose = null } = {}) {
  /* in the game, the view brings its own styles the first time it opens (the game's page does not load them) */
  if (!document.querySelector('link[data-ibcss]')) {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.ibcss = '1';
    l.href = new URL('../../css/ib.css?v=202611051947', import.meta.url).href; document.head.appendChild(l);
  }
  const root = document.createElement('div');
  root.className = 'ibv' + (inGame ? ' ibv--game' : '');
  root.setAttribute('role', inGame ? 'dialog' : 'main'); if (inGame) root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'ibv-h');
  const chBtns = CHAPTERS.map((C, i) => `<button type="button" class="ibv__tab${C.soon ? ' is-soon' : ''}" data-ch="${i}"${C.soon ? ' aria-disabled="true"' : ''}><b>${esc(C.n)}</b><span>${esc(C.short)}</span></button>`).join('');
  root.innerHTML = `
    <header class="ibv__top">
      <div class="ibv__id"><p class="ibv__eyebrow">IB Biology · C1.2 Cell respiration</p><h1 id="ibv-h">From glucose to ATP</h1>
        <p class="ibv__by">Made by Dr Daniel Mompel Riera · NLCS Jeju</p></div>
      <nav class="ibv__tabs" aria-label="Chapters">${chBtns}</nav>
      <div class="ibv__tools">
        <button type="button" class="ibv__tool ibv__wbtn" aria-expanded="false">Words</button>
        <button type="button" class="ibv__tool ibv__full" aria-label="Full screen">⛶<span> Full screen</span></button>
        ${inGame ? '<button type="button" class="ibv__close" aria-label="Close and return to the game">×</button>' : ''}
      </div>
    </header>
    <div class="ibv__main">
      <div class="ibv__stage">
        <p class="ibv__pic" aria-live="polite"></p>
        <div class="ibv__board" hidden></div>
        <div class="ibv__paper" hidden></div>
        <p class="ibv__wait" hidden>Loading the measured shapes…</p>
      </div>
      <aside class="ibv__panel" aria-label="The steps">
        <div class="ibv__where"><div class="ibv__mmwrap"></div><div><p class="ibv__chn"></p><h2 class="ibv__cht"></h2></div></div>
        <p class="ibv__count" aria-live="polite"></p>
        <div class="ibv__text" aria-live="polite"></div>
        <div class="ibv__xs"></div>
        <div class="ibv__do">
          <button type="button" class="ibv__back" aria-label="The step before">← Back</button>
          <button type="button" class="ibv__replay" aria-label="Show this step again">↺ Again</button>
          <button type="button" class="ibv__next">Next step →</button>
        </div>
        <details class="ibv__legend"><summary>What the coloured tags mean</summary>
          <p><span class="lv lv--sl">SL and HL</span> ${esc(LEVELS.sl.long)}.</p>
          <p><span class="lv lv--hl">HL only</span> ${esc(LEVELS.hl.long)}.</p>
          <p><span class="lv lv--x">Beyond the IB guide</span> ${esc(LEVELS.x.long)}.</p>
          <p>The codes (C1.2.8 …) are the IB guide's own numbers for each statement.</p></details>
      </aside>
    </div>
    <aside class="ibv__wb" hidden aria-label="Words"><div class="ibv__wbtop"><h2>Words</h2><button type="button" class="ibv__wbx" aria-label="Close the words">×</button></div>
      <div class="ibv__langs" role="group" aria-label="Translations"><button type="button" data-l="all">한국어 + 中文</button><button type="button" data-l="ko" lang="ko">한국어</button><button type="button" data-l="zh" lang="zh-Hans">中文</button><button type="button" data-l="en">English only</button></div>
      <div class="ibv__wblist"></div></aside>`;
  mount.appendChild(root);
  if (inGame) document.documentElement.classList.add('ibv-open');
  const $ = s => root.querySelector(s), $$ = s => Array.from(root.querySelectorAll(s));
  const stageEl = $('.ibv__stage'), textEl = $('.ibv__text'), countEl = $('.ibv__count'), nextB = $('.ibv__next'), backB = $('.ibv__back'), againB = $('.ibv__replay');
  const picEl = $('.ibv__pic'), waitEl = $('.ibv__wait'), boardEl = $('.ibv__board'), paperEl = $('.ibv__paper');
  const keyEl = document.createElement('div'); keyEl.className = 'ibv__key'; keyEl.hidden = true; $('.ibv__stage').appendChild(keyEl);

  /* ---------------- the stage, and the knobs that drive it ---------------- */
  let scene = null, K = {}, tw = null, drag = { yaw: 0, pitch: 0, on: false };
  const stage = makeStage(stageEl, { onFrame });
  function onFrame(t, dt) {
    if (!scene) return;
    if (tw) {
      const k = tw.ms ? Math.min(1, (performance.now() - tw.t0) / tw.ms) : 1, e = k * k * (3 - 2 * k);
      for (const n in tw.to) K[n] = tw.from[n] + (tw.to[n] - tw.from[n]) * (tw.lin && tw.lin.includes(n) ? k : e);
      if (k >= 1) { const d = tw.done; tw = null; d(); }
    }
    if (scene.views && K.cam != null) {
      /* a camera move goes straight from the view it starts at to the view it ends at (never through the views between) */
      const VW = scene.views, clampI = x => Math.max(0, Math.min(VW.length - 1, Math.round(x)));
      let v;
      if (tw && tw.to.cam != null && tw.from.cam !== tw.to.cam) { const a = clampI(tw.from.cam), b = clampI(tw.to.cam), f = (K.cam - tw.from.cam) / (tw.to.cam - tw.from.cam); v = stage.between(VW[a], VW[b], Math.max(0, Math.min(1, f))); }
      else { const c = clampI(K.cam); v = { at: VW[c].at.clone(), dist: VW[c].dist, dir: VW[c].dir.clone(), up: VW[c].up.clone() }; }
      /* the pupil may turn the picture a little (a drag), round the point looked at */
      if (drag.yaw || drag.pitch) {
        const q = new THREE.Quaternion().setFromAxisAngle(v.up, drag.yaw), side = new THREE.Vector3().crossVectors(v.up, v.dir).normalize();
        q.multiply(new THREE.Quaternion().setFromAxisAngle(side, drag.pitch));
        v.dir = v.dir.clone().applyQuaternion(q);
      }
      /* a chapter may come closer on a phone, so that its carbon numbers show (the expert review) */
      if (scene.narrowZoom && stage.W < 560) v.dist *= scene.narrowZoom;
      stage.setView(v);
    }
    scene.draw(K, t, dt);
    stage.setNums(scene.nums ? scene.nums(K) : []);
    /* no name stands on the board, or on what the chapter marks (the Krebs wheel's seat names) */
    const ko = [];
    if (!boardEl.hidden) { const b = boardEl.getBoundingClientRect(), s0 = stageEl.getBoundingClientRect(); if (b.width) ko.push({ l: b.left - s0.left, r: b.right - s0.left, t: b.top - s0.top, b: b.bottom - s0.top }); }
    if (!keyEl.hidden) { const b = keyEl.getBoundingClientRect(), s0 = stageEl.getBoundingClientRect(); if (b.width) ko.push({ l: b.left - s0.left, r: b.right - s0.left, t: b.top - s0.top, b: b.bottom - s0.top }); }
    if (scene.keepOut) ko.push(...scene.keepOut());
    stage.setKeepOut(ko);
    if (!drag.on && (drag.yaw || drag.pitch) && drag.home) { drag.yaw *= 0.86; drag.pitch *= 0.86; if (Math.abs(drag.yaw) + Math.abs(drag.pitch) < 1e-3) { drag.yaw = drag.pitch = 0; drag.home = false; } }
  }
  const tweenTo = (ph) => new Promise(res => {
    const from = {}; Object.keys(ph.to).forEach(n => { from[n] = K[n] != null ? K[n] : ph.to[n]; });
    tw = { from, to: ph.to, ms: FAST ? 0 : (ph.ms != null ? ph.ms : 1600), lin: ph.lin, t0: performance.now(), done: res };
  });
  const phasesOf = st => st.phases || (st.to ? [st] : []);
  function knobsAfter(k) {
    const S = Object.assign({}, scene.knobs);
    for (let j = 0; j <= k; j++) for (const ph of phasesOf(scene.steps[j])) Object.assign(S, ph.to);
    return S;
  }

  /* ---------------- chapters and steps ---------------- */
  let ci = -1, si = 0, token = 0, xRet = null, steps = [], C = null;
  const saved = store.get('ib', {});
  async function openChapter(i, s = 0, { fromExplore = null } = {}) {
    const def = typeof i === 'string' ? EXPLORE[i] : CHAPTERS[i];
    if (!def || def.soon) return;
    const my = ++token;
    if (scene) { stage.scene.remove(scene.group); if (scene.dispose) scene.dispose(); scene = null; }
    tw = null; stage.showLabels({}); stage.setRest(false); stage.setNums([]);
    C = def; ci = i; steps = def.steps;
    $$('.ibv__tab').forEach(b => b.classList.toggle('is-on', +b.dataset.ch === i));
    $('.ibv__chn').textContent = typeof i === 'string' ? 'Explore' : def.n === '0' ? 'The map' : /^\d+$/.test(def.n) ? 'Chapter ' + def.n : def.id === 'tally' ? 'Summary' : def.id === 'test' ? 'Questions' : 'Article';
    $('.ibv__cht').textContent = def.title;
    $('.ibv__mmwrap').innerHTML = miniMap(def.where || 'all');
    root.classList.toggle('is-explore', typeof i === 'string');
    waitEl.hidden = false;
    let mod;
    try { mod = await import('./' + def.mod + '.js?v=202611051947'); }  /* the stamp tool keeps this ?v= */ catch (e) { console.error(e); waitEl.textContent = 'This chapter could not be loaded.'; return; }
    const sc = await mod.build(stage, { V, glow, smooth, THREE, def, id: typeof i === 'string' ? i : def.id, FAST });
    if (my !== token) { if (sc.dispose) sc.dispose(); return; }
    scene = sc; waitEl.hidden = true;
    if (scene.steps.length !== steps.length) console.error(`From glucose to ATP: ${def.title} has ${steps.length} texts but ${scene.steps.length} steps`);
    stage.scene.add(scene.group); stage.defineLabels(scene.labels || {});
    /* a key to the spaces' colours, where a chapter shows them (the same colour for each space in every chapter) */
    keyEl.innerHTML = (scene.key || []).map(([t, c]) => `<span><i style="background:${c}"></i>${esc(t)}</span>`).join(''); keyEl.hidden = !scene.key;
    xRet = fromExplore;
    await show(Math.max(0, Math.min(steps.length - 1, s)));
  }
  async function show(s, { replay = true } = {}) {
    const my = ++token; si = s;
    const st = steps[s], sst = scene.steps[s] || { phases: [] };
    countEl.textContent = `Step ${s + 1} of ${steps.length}`;
    textEl.innerHTML = paras(st.t); termsIn(textEl);
    picEl.textContent = sst.pic || (scene.pic ? scene.pic(s) : '');
    picEl.hidden = !picEl.textContent;
    /* the board changes at rest, with the names: during the step it still shows what was true before it (the expert
       review: it had counted FADH₂ before FAD was reduced) */
    if (!sst.board || boardEl.dataset.ci !== String(ci)) { boardEl.innerHTML = ''; boardEl.hidden = true; }
    /* a page to read instead of a picture (the tally, the questions, the article) */
    paperEl.hidden = !scene.paper; root.classList.toggle('is-paper', !!scene.paper);
    if (scene.paper) {
      paperEl.innerHTML = scene.paper(s); termsIn(paperEl); paperEl.scrollTop = 0;
      if (scene.wire) scene.wire(paperEl, s, { open: id => { const k = CHAPTERS.findIndex(c => c.id === id); if (k >= 0) openChapter(k, 0); }, changed: () => {} });
    }
    const xs = (st.x || []).map(id => EXPLORE[id] ? `<button type="button" class="ibv__xb" data-x="${id}">🧭 ${esc(EXPLORE[id].title)}</button>` : '').join('');
    $('.ibv__xs').innerHTML = xs;
    backB.disabled = s === 0 && !xRet && ci === 0; againB.disabled = true; nextB.disabled = true; nextB.classList.remove('pulse');
    const last = s === steps.length - 1;
    nextB.textContent = last ? (xRet ? 'Back to the chapter →' : nextChapterLabel()) : 'Next step →';
    drag.home = true;
    Object.assign(K, knobsAfter(s - 1)); stage.showLabels({}); stage.setRest(false);
    if (replay) for (const ph of phasesOf(sst)) { await tweenTo(ph); if (my !== token) return; }
    else Object.assign(K, knobsAfter(s));
    if (sst.board) {
      /* on a phone the board stands under the step's words, not on the picture (the expert review: it hid half of it) */
      const narrow = matchMedia('(max-width: 560px)').matches, home = narrow ? textEl.parentNode : stageEl;
      if (boardEl.parentNode !== home) { if (narrow) textEl.after(boardEl); else stageEl.appendChild(boardEl); }
      boardEl.classList.toggle('ibv__board--panel', narrow);
      boardEl.innerHTML = sst.board; boardEl.hidden = false; boardEl.dataset.ci = String(ci);
    }
    stage.showLabels(sst.labs || {}); stage.setRest(true);
    nextB.disabled = false; againB.disabled = false; nextB.classList.add('pulse');
    if (typeof ci === 'number') { const done = store.get('ib', {}); done.at = { ci, si: s }; done.max = done.max || {}; done.max[C.id] = Math.max(done.max[C.id] || 0, s + 1); store.set('ib', done); if (!inGame) history.replaceState(null, '', '#' + C.id + '-' + (s + 1)); }
    window.IBV.at = { ci, si: s, rest: true };
  }
  function nextChapterLabel() { const n = nextOpen(ci); return n != null ? (/^\d+$/.test(CHAPTERS[n].n) ? `Chapter ${CHAPTERS[n].n}: ${CHAPTERS[n].short} →` : `${CHAPTERS[n].short} →`) : (inGame ? 'Back to the game →' : 'The end'); }
  function nextOpen(i) { if (typeof i !== 'number') return null; for (let j = i + 1; j < CHAPTERS.length; j++) if (!CHAPTERS[j].soon) return j; return null; }
  nextB.addEventListener('click', () => {
    if (nextB.disabled) return;
    if (si < steps.length - 1) { show(si + 1); return; }
    if (xRet) { const r = xRet; openChapter(r.ci, r.si, {}).then(() => {}); return; }
    const n = nextOpen(ci); if (n != null) openChapter(n, 0); else if (inGame) close();
  });
  backB.addEventListener('click', () => {
    if (si > 0) { show(si - 1); return; }
    if (xRet) { const r = xRet; openChapter(r.ci, r.si); return; }
    if (typeof ci === 'number') { for (let j = ci - 1; j >= 0; j--) if (!CHAPTERS[j].soon) { openChapter(j, CHAPTERS[j].steps.length - 1); return; } }
  });
  againB.addEventListener('click', () => show(si));
  $('.ibv__tabs').addEventListener('click', e => { const b = e.target.closest('.ibv__tab'); if (!b || b.classList.contains('is-soon')) return; openChapter(+b.dataset.ch, 0); });
  $('.ibv__xs').addEventListener('click', e => { const b = e.target.closest('.ibv__xb'); if (!b) return; openChapter(b.dataset.x, 0, { fromExplore: { ci, si } }); });
  /* a press on the picture: the map's numbers open their chapters */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null;
  stageEl.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; down = { x: e.clientX, y: e.clientY, yaw: drag.yaw, pitch: drag.pitch }; drag.on = true; stageEl.setPointerCapture && stageEl.setPointerCapture(e.pointerId); });
  stageEl.addEventListener('pointermove', e => {
    if (!down) { /* light means press: only what a press opens lights */
      if (scene && scene.hover) { const r = stageEl.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, stage.cam); stageEl.style.cursor = scene.hover(ray) ? 'pointer' : ''; }
      return;
    }
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (Math.hypot(dx, dy) > 4 && scene && scene.turn !== false) { drag.yaw = Math.max(-0.7, Math.min(0.7, down.yaw - dx * 0.006)); drag.pitch = Math.max(-0.45, Math.min(0.45, down.pitch - dy * 0.006)); drag.home = false; }
  });
  stageEl.addEventListener('pointerup', e => {
    drag.on = false; if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4; down = null;
    if (moved || !scene || !scene.pick) return;
    const r = stageEl.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, stage.cam);
    const to = scene.pick(ray); if (to != null && CHAPTERS[to] && !CHAPTERS[to].soon) openChapter(to, 0);
  });
  stageEl.addEventListener('pointercancel', () => { drag.on = false; down = null; });

  /* ---------------- words: a tip where the word is, and the list ---------------- */
  let tip = null, tipFor = null;
  const lang = () => store.get('lang', 'all');
  const closeTip = () => { if (tip) { tip.remove(); tip = null; tipFor = null; } };
  function showTip(b) {
    const w = window.KS3_GLOSSARY && window.KS3_GLOSSARY.by[b.dataset.w]; if (!w) return;
    if (tipFor === b) { closeTip(); return; } closeTip();
    const l = lang(), tr = l === 'en' ? '' : `<div class="tr">${l !== 'zh' ? `<span lang="ko"><i>한국어</i>${esc(w.ko)}</span>` : ''}${l !== 'ko' ? `<span lang="zh-Hans"><i>中文</i>${esc(w.zh)}</span>` : ''}</div>`;
    tip = document.createElement('div'); tip.className = 'ibv-tip'; tip.setAttribute('role', 'note'); tip.innerHTML = `<b>${esc(w.en)}</b>: ${esc(w.d)}${tr}`;
    root.appendChild(tip); tipFor = b;
    const r = b.getBoundingClientRect(), R = root.getBoundingClientRect(), tw_ = tip.offsetWidth, th = tip.offsetHeight;
    let x = Math.max(8, Math.min(r.left - R.left, R.width - tw_ - 8)), y = r.bottom - R.top + 6;
    if (y + th > R.height - 8 && r.top - R.top - th - 6 > 0) y = r.top - R.top - th - 6;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  root.addEventListener('click', e => {
    const t = e.target.closest('.ibv-term'); if (t) { showTip(t); e.stopPropagation(); return; }
    if (tip && !e.target.closest('.ibv-tip')) closeTip();
  });
  const wb = $('.ibv__wb'), wbtn = $('.ibv__wbtn');
  function fillWords() {
    const G = window.KS3_GLOSSARY; if (!G) return;
    const keys = []; [...CHAPTERS, ...Object.values(EXPLORE)].forEach(c => (c.steps || []).forEach(s => (s.t.match(/data-w="([^"]+)"/g) || []).forEach(m => { const k = m.slice(8, -1); if (!keys.includes(k)) keys.push(k); })));
    const l = lang();
    $('.ibv__wblist').innerHTML = keys.map(k => G.by[k]).filter(Boolean).map(w => `<details class="ibv__w"><summary><b>${esc(w.en)}</b>${l !== 'en' && l !== 'zh' ? `<span lang="ko">${esc(w.ko)}</span>` : ''}${l !== 'en' && l !== 'ko' ? `<span lang="zh-Hans">${esc(w.zh)}</span>` : ''}</summary><p>${esc(w.d)}</p></details>`).join('');
    $$('.ibv__langs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === l)));
  }
  wbtn.addEventListener('click', () => { const on = wb.hidden; wb.hidden = !on; wbtn.setAttribute('aria-expanded', String(on)); if (on) fillWords(); });
  $('.ibv__wbx').addEventListener('click', () => { wb.hidden = true; wbtn.setAttribute('aria-expanded', 'false'); });
  $('.ibv__langs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; store.set('lang', b.dataset.l); fillWords(); });

  /* ---------------- full screen, keys, close ---------------- */
  const fsB = $('.ibv__full'), isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  fsB.addEventListener('click', () => {
    if (isFull()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (root.requestFullscreen || root.webkitRequestFullscreen || (() => {})).call(root);
  });
  /* in full screen the button says how to leave it (Esc does too) */
  const onFull = () => { const on = isFull(); fsB.innerHTML = on ? '⛶<span> Leave full screen</span>' : '⛶<span> Full screen</span>'; fsB.setAttribute('aria-label', on ? 'Leave full screen' : 'Full screen'); fsB.classList.toggle('on', on); };
  document.addEventListener('fullscreenchange', onFull); document.addEventListener('webkitfullscreenchange', onFull);
  const onKey = e => {
    if (e.key === 'Escape') { if (tip) { closeTip(); return; } if (!wb.hidden) { wb.hidden = true; return; } if (inGame && !document.fullscreenElement) close(); return; }
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight' && !nextB.disabled) nextB.click();
    if (e.key === 'ArrowLeft' && !backB.disabled) backB.click();
  };
  document.addEventListener('keydown', onKey);
  let closed = false;
  function close() {
    if (closed) return; closed = true; token++;
    if (scene && scene.dispose) scene.dispose();
    if (isFull()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    document.removeEventListener('fullscreenchange', onFull); document.removeEventListener('webkitfullscreenchange', onFull);
    stage.stop(); document.removeEventListener('keydown', onKey); closeTip(); root.remove();
    document.documentElement.classList.remove('ibv-open');
    if (onClose) onClose();
  }
  if (inGame) $('.ibv__close').addEventListener('click', close);

  /* ---------------- where to start: the address (#c2-7), else where the pupil was ---------------- */
  window.IBV = {
    at: null,
    goto: (c, s) => openChapter(c, s),
    stepAtRest: () => !!(window.IBV.at && window.IBV.at.rest && !tw),
    labels: () => stage.labelState(),
    close
  };
  let first = { ci: 0, si: 0 };
  const h = /^#(c\d|[a-z]+)-(\d+)$/.exec(location.hash || '');
  if (!inGame && h) { const i = CHAPTERS.findIndex(c => c.id === h[1]); if (i >= 0) first = { ci: i, si: +h[2] - 1 }; }
  else if (start) first = start;
  else if (saved.at && CHAPTERS[saved.at.ci] && !CHAPTERS[saved.at.ci].soon) first = { ci: saved.at.ci, si: 0 };
  openChapter(first.ci, first.si);
  return { close, root };
}
