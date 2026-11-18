/* ============================================================
   view.js — the water-potential view, "Water potential: how water enters and leaves cells" (16 Nov 2026): an IB
   extension of the plant-cell side quest's vacuole step (js/plant/text.js COURSE ib.vacuole, which says in words what
   this view shows), self-contained like the membrane view (js/membrane/view.js), whose frame, look, level tags, step
   buttons, "More detail" fold and sources it follows. IB Biology topic D2.3 Water potential, every statement of the
   guide: SL and HL D2.3.1 to D2.3.7 (steps 1 to 8), additional higher level D2.3.8 to D2.3.11 (steps 9 to 12).
   Opened over the game (openWater({ inGame: true, onClose })) or at its own address (water/). The pictures are 2D
   (scenes.js: inline SVG drawn for the stage's own size); every step's motion plays once and the step waits for Next
   (memory animations-wait-for-the-reader); its names show when the motion ends: level lines on a laptop, numbered pins
   with their key under the picture on a phone (memory label-lines-never-cross). Reduce motion (the computer's setting,
   or ?still=1 in the address for the tests): each step shows its end state at once, with every name.
   For tools/water-check.mjs: window.WATER (the step, at rest or not, the names' and captions' boxes).
   ============================================================ */
import { STEPS, LEVELS, SOURCES } from './text.js?v=202611190715';
import { levelSwitch, skip, hlOnly, hlNote, fit } from '../game/iblevel.js?v=202611190715';
/* the IB level (js/game/iblevel.js; Daniel, 16 Nov 2026: "there is no SL HL toggle … my SL students … are struggling"):
   its switch on the step count's line, beside the step buttons it marks (in the header it squeezed the title on a phone); at SL the HL lines are hidden, a step of HL lines only is marked HL on its button, and Next
   and Back go past it (it opens when its button is pressed, with a line that says it is HL only) */
import { SCENES } from './scenes.js?v=202611190715';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const FAST = new URLSearchParams(location.search).has('still') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
/* how the words are dressed on the page: ψ with its subscript, the genus in italics */
const dress = s => String(s).replace(/ψ([wsp])/g, 'ψ<sub>$1</sub>').replace(/\bParamecium\b/g, '<i>Paramecium</i>');
const NARROW = 600;

function paras(t) {
  /* [!] the step's plain first line (what the step is for); [x+] folded under "More detail" (it may carry a tag of its
     own: [x+] [sl D2.3.4] …); a tag may carry several codes */
  const one = p => {
    const m = /^\[(sl|hl|x)(?:\s+([A-Z][0-9.]+(?:,\s*[A-Z][0-9.]+)*))?\]\s*/.exec(p);
    if (!m) return `<p>${dress(p)}</p>`;
    return `<p class="lvp lvp--${m[1]}"><span class="lv lv--${m[1]}">${esc(LEVELS[m[1]].name)}${m[2] ? ` <i>${esc(m[2])}</i>` : ''}</span> ${dress(p.slice(m[0].length))}</p>`;
  };
  const main = [], more = [];
  fit(t).split('\n').forEach(p => {
    if (p.startsWith('[!] ')) main.push(`<p class="lvp lvp--lead">${dress(p.slice(4))}</p>`);
    else if (p.startsWith('[x+] ')) { const r = p.slice(5); more.push(one(/^\[(sl|hl|x)[\s\]]/.test(r) ? r : '[x] ' + r)); }
    else main.push(one(p));
  });
  return main.join('') + (more.length ? `<details class="watv__fold"><summary>More detail</summary>${more.join('')}</details>` : '');
}

function styles() {
  let l = document.querySelector('link[data-watercss]');
  if (!l) { l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.watercss = '1'; l.href = new URL('../../css/water.css?v=202611190715', import.meta.url).href; document.head.appendChild(l); }
  return l;
}
/* the game calls this when the door first shows: the styles come while the pupil reads (the code is already here) */
export function warm() { styles(); }

export function openWater({ mount = document.body, inGame = false, onClose = null, start = 0, backLabel = '← Back to the plant cell' } = {}) {
  const css = styles();
  const root = document.createElement('div');
  root.className = 'watv' + (inGame ? ' watv--game' : '') + (FAST ? ' watv--still' : '');
  root.setAttribute('role', inGame ? 'dialog' : 'main'); if (inGame) root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'watv-h');
  root.innerHTML = `
    <header class="watv__top">
      <div class="watv__id"><p class="watv__eyebrow">IB Biology · D2.3 Water potential</p><h1 id="watv-h">Water potential: how water enters and leaves cells</h1>
        <p class="watv__by">Made by Dr Daniel Mompel Riera</p></div>
      ${inGame ? `<button type="button" class="watv__home watv__close">${esc(backLabel)}</button>` : '<a class="watv__home" href="../">← The cell game</a>'}
    </header>
    <div class="watv__main">
      <div class="watv__stage">
        <svg class="watv__svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"></svg>
        <div class="watv__caps"></div>
        <div class="watv__names"></div>
      </div>
      <div class="watv__under">
        <p class="watv__note"></p>
        <div class="watv__key" hidden></div>
        <button type="button" class="watv__again" hidden>↻ Watch again</button>
      </div>
      <aside class="watv__panel" aria-label="The steps">
        <div class="iblv-cline"><p class="watv__count" aria-live="polite"></p><div class="watv__lvl">${levelSwitch()}</div></div>
        <nav class="watv__steps" aria-label="The steps"></nav>
        <h2 class="watv__st"></h2>
        <div class="watv__text" aria-live="polite"></div>
        <div class="watv__do">
          <button type="button" class="watv__back" aria-label="The step before">← Back</button>
          <button type="button" class="watv__next">Next step →</button>
        </div>
        <div class="iblv-foot">${levelSwitch()}</div>
        <section class="watv__more">
          <h3>What the tags mean</h3>
          <div class="watv__tags">
            <p><span class="lv lv--sl">SL and HL</span> ${esc(LEVELS.sl.long)}.</p>
            <p><span class="lv lv--hl">HL only</span> ${esc(LEVELS.hl.long)}.</p>
            <p><span class="lv lv--x">Beyond the guide</span> ${esc(LEVELS.x.long)}.</p>
            <p>The codes (D2.3.1 …) are the IB guide's own numbers for each statement. Steps 1 to 8 are for SL and HL; steps 9 to 12 are for HL only.</p>
          </div>
          <h3>Sources</h3>
          <ol class="watv__src">${SOURCES.map(s => `<li>${esc(s.c)}${s.u ? ` <a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.u.replace(/^https?:\/\//, ''))}</a>` : ''}<span class="src">Used for: ${dress(esc(s.s))}</span></li>`).join('')}</ol>
        </section>
      </aside>
    </div>`;
  mount.appendChild(root);
  if (!css.sheet) {
    root.style.visibility = 'hidden';
    const on = () => { root.style.visibility = ''; };
    css.addEventListener('load', on, { once: true }); css.addEventListener('error', on, { once: true }); setTimeout(on, 4000);
  }
  document.documentElement.classList.add('waterv-open');
  const $ = s => root.querySelector(s);
  const stageEl = $('.watv__stage'), svg = $('.watv__svg'), capsEl = $('.watv__caps'), namesEl = $('.watv__names'), noteEl = $('.watv__note'), keyEl = $('.watv__key'), againB = $('.watv__again');
  const panelEl = $('.watv__panel'), countEl = $('.watv__count'), stepsEl = $('.watv__steps'), titleEl = $('.watv__st'), textEl = $('.watv__text'), nextB = $('.watv__next'), backB = $('.watv__back');

  /* ---------------- the picture of a step ---------------- */
  let si = 0, token = 0, raf = 0, scene = null, prog = 0, rest = false, closed = false, W = 0, H = 0, mode = '';
  function build() {
    const r = stageEl.getBoundingClientRect(); W = Math.max(200, Math.round(r.width)); H = Math.max(200, Math.round(r.height));
    const narrow = W < NARROW, fs = narrow ? 13.5 : 16, lh = Math.round(fs * 1.28);
    stageEl.classList.toggle('is-narrow', narrow);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.textContent = '';
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); svg.appendChild(g);
    scene = SCENES[STEPS[si].scene]({ W, H, narrow, g, fs, lh });
    capsEl.innerHTML = scene.caps.map(c => {
      const left = c.al === 'c' ? c.x - c.w / 2 : c.al === 'r' ? c.x - c.w : c.x;
      return `<p class="watv__cap watv__cap--${c.al} watv__cap--v${c.va}${c.cls ? ' watv__cap--' + c.cls : ''}${c.when === 'e' ? ' is-end' : ''}" data-id="${esc(c.id)}" style="left:${Math.round(left)}px;top:${Math.round(c.y)}px;width:${Math.round(c.w)}px"><span>${dress(c.html)}</span></p>`;
    }).join('');
    centre(g);
    noteEl.innerHTML = dress(esc(scene.note || ''));
    namesEl.innerHTML = ''; keyEl.innerHTML = ''; keyEl.hidden = true; mode = '';
    stageEl.setAttribute('aria-label', 'Picture: ' + STEPS[si].title + '.');
  }
  /* the picture's content (its end state), with its captions and names, stands in the middle of the stage's height */
  function centre(g) {
    scene.frame(1);
    let top = Infinity, bot = -Infinity;
    g.querySelectorAll('path, circle, ellipse, rect, line, text').forEach(e => {
      if (e.getAttribute('opacity') === '0' || e.style.opacity === '0') return;
      const b = e.getBBox(); if (b.width + b.height === 0) return;
      top = Math.min(top, b.y); bot = Math.max(bot, b.y + b.height);
    });
    const s0 = stageEl.getBoundingClientRect();
    capsEl.querySelectorAll('.watv__cap > span').forEach(e => { const b = e.getBoundingClientRect(); top = Math.min(top, b.top - s0.top); bot = Math.max(bot, b.bottom - s0.top); });
    (scene.labels || []).forEach(l => { if (l.side === 'B') bot = Math.max(bot, l.col + 34); if (l.side === 'T') top = Math.min(top, l.col - 34); });
    if (!isFinite(top)) return;
    const dy = Math.round(Math.min((H - bot - top) / 2, H - 8 - bot));
    if (dy < 6) return;
    g.setAttribute('transform', `translate(0 ${dy})`);
    capsEl.querySelectorAll('.watv__cap').forEach(e => { e.style.top = (parseFloat(e.style.top) + dy) + 'px'; });
    (scene.labels || []).forEach(l => { l.y += dy; if (l.side === 'T' || l.side === 'B') l.col += dy; });
  }
  const boxOf = (el, s0) => { const b = el.getBoundingClientRect(); return { l: b.left - s0.left, t: b.top - s0.top, r: b.right - s0.left, b: b.bottom - s0.top }; };
  const hit = (a, b, pad = 0) => a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad;
  function capBoxes() { const s0 = stageEl.getBoundingClientRect(); return [...capsEl.querySelectorAll('.watv__cap > span')].filter(e => e.getClientRects().length).map(e => Object.assign(boxOf(e, s0), { id: e.parentNode.dataset.id })); }
  const lineDiv = b => { const d = document.createElement('i'); d.className = 'watv__ln'; d.style.transform = `translate(${b.l}px, ${b.t}px)`; d.style.width = Math.max(2, b.r - b.l) + 'px'; d.style.height = Math.max(2, b.b - b.t) + 'px'; namesEl.appendChild(d); return d; };
  /* names on level lines (or upright ones) from where each scene says it stands; refused, and pins used instead, if any
     name would leave the picture or stand on another name, a caption or a line */
  function lines(L) {
    const made = [];
    for (const l of L) {
      const nm = document.createElement('span'); nm.className = 'watv__nm watv__nm--' + l.side; nm.innerHTML = dress(esc(l.text)); namesEl.appendChild(nm);
      const w = nm.offsetWidth, h = nm.offsetHeight;
      let x, y;
      if (l.side === 'L') { x = l.col - w; y = l.y - h / 2; } else if (l.side === 'R') { x = l.col; y = l.y - h / 2; }
      else { x = Math.max(6, Math.min(W - 6 - w, l.x - w / 2)); y = l.side === 'T' ? l.col - h : l.col; }
      x = Math.round(x); y = Math.round(y);
      nm.style.transform = `translate(${x}px, ${y}px)`;
      const box = { l: x, t: y, r: x + w, b: y + h }, ly = Math.round(l.y), lx = Math.round(l.x);
      const ln = l.side === 'L' ? { l: x + w, r: lx, t: ly - 1, b: ly + 1 } : l.side === 'R' ? { l: lx, r: x, t: ly - 1, b: ly + 1 }
        : l.side === 'T' ? { l: lx - 1, r: lx + 1, t: y + h, b: ly } : { l: lx - 1, r: lx + 1, t: ly, b: y };
      made.push({ id: l.id, el: nm, box, line: ln });
    }
    const caps = capBoxes(), why = [];
    made.forEach((a, i) => {
      if (a.box.l < 2 || a.box.t < 2 || a.box.r > W - 2 || a.box.b > H - 2) why.push(a.id + ' would leave the picture');
      if (a.line.r < a.line.l - 0.5 || a.line.b < a.line.t - 0.5) why.push(a.id + ' would stand beyond its part');
      caps.forEach(c => { if (hit(a.box, c, 3) || hit(a.line, c, 1)) why.push(a.id + ' would touch the caption ' + c.id); });
      made.forEach((b, j) => { if (j !== i && (hit(a.box, b.box, 4) || hit(a.line, b.box, 1) || (j > i && hit(a.line, b.line, 1)))) why.push(a.id + ' would touch ' + b.id); });
    });
    refused = why.join('; ');
    if (why.length) { namesEl.innerHTML = ''; return null; }
    made.forEach(a => { a.ln = lineDiv(a.line); });
    return made;
  }
  function pins(L) {
    const made = L.map((l, i) => {
      const [dx, dy] = l.pin || [0, -22], px = Math.round(l.x + dx), py = Math.round(l.y + dy);
      const p = document.createElement('b'); p.className = 'watv__pin'; p.textContent = String(i + 1); p.style.transform = `translate(${px - 12}px, ${py - 12}px)`; namesEl.appendChild(p);
      let line = null;
      if (Math.abs(dy) > 12 && !dx) line = dy < 0 ? { l: px - 1, r: px + 1, t: py + 12, b: Math.round(l.y) } : { l: px - 1, r: px + 1, t: Math.round(l.y), b: py - 12 };
      else if (Math.abs(dx) > 12 && !dy) line = dx < 0 ? { l: px + 12, r: Math.round(l.x), t: py - 1, b: py + 1 } : { l: Math.round(l.x), r: px - 12, t: py - 1, b: py + 1 };
      if (line) lineDiv(line);
      return { id: l.id, el: p, box: { l: px - 12, t: py - 12, r: px + 12, b: py + 12 }, line };
    });
    keyEl.innerHTML = L.map((l, i) => `<span class="watv__k"><b>${i + 1}</b><span>${dress(esc(l.text))}</span></span>`).join(''); keyEl.hidden = false;
    return made;
  }
  let placed = [], refused = '';
  function names() {
    namesEl.innerHTML = ''; keyEl.innerHTML = ''; keyEl.hidden = true; placed = []; refused = '';
    const L = scene.labels || []; if (!L.length) { mode = 'none'; return; }
    const got = W >= NARROW ? lines(L) : null;
    if (got) { placed = got; mode = 'lines'; } else { placed = pins(L); mode = 'pins'; }
    void namesEl.offsetWidth;      /* (the names fade in from here: the class is added after a layout, never in the same one) */
    namesEl.querySelectorAll('.watv__nm, .watv__ln, .watv__pin').forEach(e => e.classList.add('is-on'));
  }
  function atRest() {
    rest = true; prog = 1;
    capsEl.querySelectorAll('.is-end').forEach(e => e.classList.add('is-on'));
    names();
    backB.disabled = skip(STEPS, si, -1) < 0; nextB.disabled = false; nextB.classList.add('pulse');
    againB.hidden = FAST;
    window.WATER.at = { step: si, rest: true };
  }
  function play(my) {
    cancelAnimationFrame(raf);
    rest = false; prog = FAST ? 1 : 0; scene.frame(prog);
    if (FAST) { atRest(); return; }
    const t0 = performance.now(), dur = scene.dur;
    const tick = now => {
      if (my !== token || closed) return;
      prog = Math.min(1, (now - t0) / dur); scene.frame(prog);
      if (prog < 1) raf = requestAnimationFrame(tick); else atRest();
    };
    raf = requestAnimationFrame(tick);
  }

  /* ---------------- the steps ---------------- */
  function show(s) {
    const my = ++token; si = s; rest = false;
    window.WATER.at = { step: s, rest: false };
    const st = STEPS[s];
    countEl.textContent = `Step ${s + 1} of ${STEPS.length}${st.hl ? ' · HL only' : ''}`; titleEl.textContent = st.title;
    if (stepsEl.children.length !== STEPS.length) stepsEl.innerHTML = STEPS.map((q, k) => `<button type="button" data-s="${k}"${q.hl ? ' class="is-hl"' : ''}${hlOnly(q) ? ' data-hlo=""' : ''} aria-label="Step ${k + 1}${q.hl ? ', HL only' : ''}">${k + 1}</button>`).join('');
    Array.from(stepsEl.children).forEach((b, k) => { if (k === s) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    textEl.innerHTML = hlNote(st) + paras(st.t); panelEl.scrollTop = 0;
    nextB.disabled = backB.disabled = true; nextB.classList.remove('pulse'); againB.hidden = true;
    nextB.textContent = skip(STEPS, s, 1) < STEPS.length ? 'Next step →' : (inGame ? 'Back to the plant cell →' : 'Start again →');
    if (!inGame) history.replaceState(null, '', '#s' + (s + 1));
    build(); play(my);
  }
  nextB.addEventListener('click', () => { if (nextB.disabled) return; const j = skip(STEPS, si, 1); if (j < STEPS.length) show(j); else if (inGame) close(); else show(Math.max(0, skip(STEPS, -1, 1))); });
  backB.addEventListener('click', () => { if (backB.disabled) return; const j = skip(STEPS, si, -1); if (j >= 0) show(j); });
  /* the level changed on this step: Next and Back say where they now go */
  const relevel = () => { if (closed) { document.removeEventListener('iblevel', relevel); return; } if (!rest) return; backB.disabled = skip(STEPS, si, -1) < 0; nextB.textContent = skip(STEPS, si, 1) < STEPS.length ? 'Next step →' : (inGame ? 'Back to the plant cell →' : 'Start again →'); };
  document.addEventListener('iblevel', relevel);
  stepsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || +b.dataset.s === si) return; show(+b.dataset.s); });
  againB.addEventListener('click', () => { if (!rest) return; show(si); });

  /* a new size: the picture is drawn again for it, at the same moment of its motion */
  let rz = 0;
  const ro = new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(() => {
    if (closed || !scene) return;
    const r = stageEl.getBoundingClientRect(); if (Math.round(r.width) === W && Math.round(r.height) === H) return;
    build(); scene.frame(prog); if (rest) { capsEl.querySelectorAll('.is-end').forEach(e => e.classList.add('is-on')); names(); }
  }, 120); });
  ro.observe(stageEl);

  const onKey = e => {
    if (e.key === 'Escape') { if (inGame) close(); return; }
    if (e.target.closest && e.target.closest('input, textarea, summary')) return;
    if (e.key === 'ArrowRight' && !nextB.disabled) nextB.click();
    if (e.key === 'ArrowLeft' && !backB.disabled) backB.click();
  };
  document.addEventListener('keydown', onKey);
  function close() {
    if (closed) return; closed = true; token++;
    cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener('keydown', onKey); root.remove();
    document.documentElement.classList.remove('waterv-open');
    if (window.WATER && window.WATER.root === root) window.WATER = null;
    if (onClose) onClose();
  }
  if (inGame) $('.watv__close').addEventListener('click', close);

  /* ---------------- for the check tool ---------------- */
  window.WATER = {
    root, FAST, at: { step: 0, rest: false }, steps: STEPS.length, goto: s => show(s), close,
    layout: () => {
      const s0 = stageEl.getBoundingClientRect();
      return { W, H, narrow: W < NARROW, mode, dur: scene ? scene.dur : 0,
        labels: placed.map(p => ({ id: p.id, box: p.box, line: p.line })),
        caps: capBoxes(), pins: mode === 'pins', refused };
    }
  };

  let first = Math.max(0, Math.min(STEPS.length - 1, start | 0));
  const h = /^#s(\d+)$/.exec(location.hash || ''); if (!inGame && h) first = Math.max(0, Math.min(STEPS.length - 1, +h[1] - 1));
  /* the first picture is drawn once the styles have given the stage its size */
  const go = () => { if (!closed) show(first); };
  if (css.sheet) requestAnimationFrame(go); else { let done = false; const g1 = () => { if (!done) { done = true; requestAnimationFrame(go); } }; css.addEventListener('load', g1, { once: true }); css.addEventListener('error', g1, { once: true }); setTimeout(g1, 4000); }
  return { close, root };
}
