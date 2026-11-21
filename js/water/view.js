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
   Since 17 Nov 2026 the view teaches on its picture (memory teach-on-the-picture; Daniel's "Yes, carry on" to the
   membrane view, whose way this follows): a step keeps at most 49 words on show and folds no guide line; a guide line
   that says what ONE named part is stands in that part's card (text.js cards). A name or a caption with a card is a
   button (on a phone: its pin and its line of the key); pressed, its part stays bright, the rest of the picture dims,
   and the card opens in the sheet under "n of N found" (js/ib/found.js keeps what was found). Steps 2 and 3 are two
   liquids whose molecules move at random (liquid.js), with the water molecules that crossed the membrane counted
   both ways under the picture; step 3 has a switch on the picture (text.js modes), each choice with its own guide
   line. Such a picture goes on while the reader reads (scene.live), stops by itself after a minute, and Reduce motion
   shows it once, as it stands after 12 seconds, with its arrow.
   For tools/water-check.mjs: window.WATER (the step, at rest or not, the names' and captions' boxes, the cards, the
   switch, the liquid's counts).
   ============================================================ */
import { STEPS, LEVELS, SOURCES } from './text.js?v=202611212238';
import { levelSwitch, skip, hlOnly, hlNote, fit, level } from '../game/iblevel.js?v=202611212238';
import { found, learn } from '../ib/found.js?v=202611212238';
import { marks, codesOf } from '../ib/mark.js?v=202611212238';      /* (a visit from the IB map marks its sentence) */
/* the IB level (js/game/iblevel.js; Daniel, 16 Nov 2026: "there is no SL HL toggle … my SL students … are struggling"):
   its switch on the step count's line, beside the step buttons it marks (in the header it squeezed the title on a phone); at SL the HL lines are hidden, a step of HL lines only is marked HL on its button, and Next
   and Back go past it (it opens when its button is pressed, with a line that says it is HL only) */
import { SCENES } from './scenes.js?v=202611212238';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const FAST = new URLSearchParams(location.search).has('still') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
/* how the words are dressed on the page: ψ with its subscript, the genus in italics */
const dress = s => String(s).replace(/ψ([wsp])/g, 'ψ<sub>$1</sub>').replace(/\bParamecium\b/g, '<i>Paramecium</i>');
const NARROW = 600, VIEW = 'water';

/* one paragraph with its level tag ([sl CODE] …); a tag may carry several codes */
const one = p => {
  const m = /^\[(sl|hl|x)(?:\s+([A-Z][0-9.]+(?:,\s*[A-Z][0-9.]+)*))?\]\s*/.exec(p);
  if (!m) return `<p>${dress(p)}</p>`;
  return `<p class="lvp lvp--${m[1]}"><span class="lv lv--${m[1]}">${esc(LEVELS[m[1]].name)}${m[2] ? ` <i>${esc(m[2])}</i>` : ''}</span> ${dress(p.slice(m[0].length))}</p>`;
};
/* a card's or a choice's lines, as the level shows them (an HL line is not shown at SL) */
const cardLines = t => String(t).split('\n').filter(p => !(level() === 'sl' && /^\[hl[\s\]]/.test(p))).map(one).join('');
function paras(t, mid = '') {
  /* [!] the step's plain first line (what the step is for); [x+] folded under "More detail" (it may carry a tag of its
     own: [x+] [sl D2.3.4] …); mid: what stands between the lines on show and More detail (the names to find) */
  const main = [], more = [];
  fit(t).split('\n').filter(Boolean).forEach(p => {
    if (p.startsWith('[!] ')) main.push(`<p class="lvp lvp--lead">${dress(p.slice(4))}</p>`);
    else if (p.startsWith('[x+] ')) { const r = p.slice(5); more.push(one(/^\[(sl|hl|x)[\s\]]/.test(r) ? r : '[x] ' + r)); }
    else main.push(one(p));
  });
  return main.join('') + mid + (more.length ? `<details class="watv__fold"><summary>More detail</summary>${more.join('')}</details>` : '');
}

function styles() {
  let l = document.querySelector('link[data-watercss]');
  if (!l) { l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.watercss = '1'; l.href = new URL('../../css/water.css?v=202611212238', import.meta.url).href; document.head.appendChild(l); }
  return l;
}
/* the game calls this when the door first shows: the styles come while the pupil reads (the code is already here) */
export function warm() { styles(); }

export function openWater({ mount = document.body, inGame = false, onClose = null, start = 0, mark = null, backLabel = '← Back to the plant cell' } = {}) {
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
        <canvas class="watv__cv" aria-hidden="true" hidden></canvas>
        <svg class="watv__svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"></svg>
        <div class="watv__caps"></div>
        <div class="watv__names"></div>
      </div>
      <div class="watv__under">
        <p class="watv__strip" hidden></p>
        <p class="watv__note"></p>
        <div class="watv__key" hidden></div>
        <span class="watv__ctl"><button type="button" class="watv__pause" hidden>Pause</button><button type="button" class="watv__again" aria-label="Watch again" hidden>↻<span> Watch again</span></button></span>
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
  const unmark = marks(root, mark);
  if (!css.sheet) {
    root.style.visibility = 'hidden';
    const on = () => { root.style.visibility = ''; };
    css.addEventListener('load', on, { once: true }); css.addEventListener('error', on, { once: true }); setTimeout(on, 4000);
  }
  document.documentElement.classList.add('waterv-open');
  const $ = s => root.querySelector(s);
  const stageEl = $('.watv__stage'), svg = $('.watv__svg'), cv = $('.watv__cv'), capsEl = $('.watv__caps'), namesEl = $('.watv__names'), noteEl = $('.watv__note'), keyEl = $('.watv__key'), againB = $('.watv__again'), pauseB = $('.watv__pause'), stripEl = $('.watv__strip');
  const cssVar = name => getComputedStyle(root).getPropertyValue(name).trim();
  const panelEl = $('.watv__panel'), countEl = $('.watv__count'), stepsEl = $('.watv__steps'), titleEl = $('.watv__st'), textEl = $('.watv__text'), nextB = $('.watv__next'), backB = $('.watv__back');

  /* ---------------- the picture of a step ---------------- */
  let si = 0, token = 0, raf = 0, scene = null, prog = 0, rest = false, closed = false, W = 0, H = 0, mode = '';
  /* what a live picture keeps while its step stays open (its liquid: a new size or level draws it again, never restarts
     it); the choice of each step that has a switch; the open card */
  let keep = {}, card = '', G = null; const choice = {};
  const stepMode = st => st.modes ? (choice[st.id] || st.modes.list[0].id) : '';
  function build() {
    const r = stageEl.getBoundingClientRect(); W = Math.max(200, Math.round(r.width)); H = Math.max(200, Math.round(r.height));
    const narrow = W < NARROW, fs = narrow ? 13.5 : 16, lh = Math.round(fs * 1.28), dpr = Math.min(2, window.devicePixelRatio || 1), st = STEPS[si];
    stageEl.classList.toggle('is-narrow', narrow);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.textContent = '';
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); svg.appendChild(g); G = g;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
    scene = SCENES[st.scene]({ W, H, narrow, g, fs, lh, cv, dpr, css: cssVar, keep, FAST, mode: stepMode(st) });
    cv.hidden = !(scene.live && scene.live.strip);
    capsEl.innerHTML = scene.caps.map(c => {
      const left = c.al === 'c' ? c.x - c.w / 2 : c.al === 'r' ? c.x - c.w : c.x, press = c.card && pressable(c.card);
      return `<p class="watv__cap watv__cap--${c.al} watv__cap--v${c.va}${c.cls ? ' watv__cap--' + c.cls : ''}${c.when === 'e' ? ' is-end' : ''}" data-id="${esc(c.id)}" style="left:${Math.round(left)}px;top:${Math.round(c.y)}px;width:${Math.round(c.w)}px">`
        + (press ? `<button type="button" class="watv__capb" data-card="${esc(c.card)}">${dress(c.html)}</button>` : `<span>${dress(c.html)}</span>`) + '</p>';
    }).join('') + switchHTML(st);
    centre(g);
    noteEl.innerHTML = dress(esc(scene.note || ''));
    namesEl.innerHTML = ''; keyEl.innerHTML = ''; keyEl.hidden = true; mode = '';
    stageEl.setAttribute('aria-label', 'Picture: ' + st.title + '.');
    focusOn(card);
  }
  /* the switch of a step with choices, on the picture, where its scene keeps room for it (scene.sw) */
  function switchHTML(st) {
    if (!st.modes || !scene.sw) return '';
    const m = stepMode(st), F = found(VIEW), sw = scene.sw;
    return `<p class="watv__cap watv__cap--c watv__cap--sw" data-id="switch" style="left:${Math.round(sw.x - sw.w / 2)}px;top:${Math.round(sw.y)}px;width:${Math.round(sw.w)}px"><span class="watv__sw" role="group" aria-label="${esc(st.modes.ask)}"><i class="watv__swk">${esc(st.modes.ask)}</i>`
      + st.modes.list.map(q => `<button type="button" data-mode="${q.id}" aria-pressed="${q.id === m}"${F.has(keyOf('mode:' + q.id)) ? ' class="is-found"' : ''}>${esc(q.name)}</button>`).join('') + '</span></p>';
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
    capsEl.querySelectorAll('.watv__cap > span, .watv__cap > button').forEach(e => { const b = e.getBoundingClientRect(); top = Math.min(top, b.top - s0.top); bot = Math.max(bot, b.bottom - s0.top); });
    (scene.labels || []).forEach(l => { if (l.side === 'B') bot = Math.max(bot, l.col + 34); if (l.side === 'T') top = Math.min(top, l.col - 34); });
    if (!isFinite(top)) return;
    const dy = Math.round(Math.min((H - bot - top) / 2, H - 8 - bot));
    if (dy < 6) return;
    g.setAttribute('transform', `translate(0 ${dy})`); scene.oy = dy;      /* (a scene that draws on the canvas moves its drawing by oy) */
    capsEl.querySelectorAll('.watv__cap').forEach(e => { e.style.top = (parseFloat(e.style.top) + dy) + 'px'; });
    (scene.labels || []).forEach(l => { l.y += dy; if (l.side === 'T' || l.side === 'B') l.col += dy; });
  }
  const boxOf = (el, s0) => { const b = el.getBoundingClientRect(); return { l: b.left - s0.left, t: b.top - s0.top, r: b.right - s0.left, b: b.bottom - s0.top }; };
  const hit = (a, b, pad = 0) => a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad;
  function capBoxes() { const s0 = stageEl.getBoundingClientRect(); return [...capsEl.querySelectorAll('.watv__cap > span, .watv__cap > button')].filter(e => e.getClientRects().length).map(e => Object.assign(boxOf(e, s0), { id: e.parentNode.dataset.id, btn: e.tagName === 'BUTTON' || !!e.querySelector('button') })); }
  const lineDiv = b => { const d = document.createElement('i'); d.className = 'watv__ln'; d.style.transform = `translate(${b.l}px, ${b.t}px)`; d.style.width = Math.max(2, b.r - b.l) + 'px'; d.style.height = Math.max(2, b.b - b.t) + 'px'; namesEl.appendChild(d); return d; };
  /* names on level lines (or upright ones) from where each scene says it stands; refused, and pins used instead, if any
     name would leave the picture or stand on another name, a caption or a line */
  function lines(L) {
    const made = [];
    for (const l of L) {
      const press = l.card && pressable(l.card), nm = document.createElement(press ? 'button' : 'span'); nm.className = 'watv__nm watv__nm--' + l.side + (press ? ' is-btn' : ''); nm.innerHTML = dress(esc(l.text)); namesEl.appendChild(nm);
      if (press) { nm.type = 'button'; nm.dataset.card = l.card; }
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
      const press = l.card && pressable(l.card), p = document.createElement(press ? 'button' : 'b'); p.className = 'watv__pin' + (press ? ' is-btn' : ''); p.textContent = String(i + 1); p.style.transform = `translate(${px - 12}px, ${py - 12}px)`; namesEl.appendChild(p);
      if (press) { p.type = 'button'; p.dataset.card = l.card; p.setAttribute('aria-label', l.text); }
      let line = null;
      if (Math.abs(dy) > 12 && !dx) line = dy < 0 ? { l: px - 1, r: px + 1, t: py + 12, b: Math.round(l.y) } : { l: px - 1, r: px + 1, t: Math.round(l.y), b: py - 12 };
      else if (Math.abs(dx) > 12 && !dy) line = dx < 0 ? { l: px + 12, r: Math.round(l.x), t: py - 1, b: py + 1 } : { l: Math.round(l.x), r: px - 12, t: py - 1, b: py + 1 };
      if (line) lineDiv(line);
      return { id: l.id, el: p, box: { l: px - 12, t: py - 12, r: px + 12, b: py + 12 }, line };
    });
    keyEl.innerHTML = L.map((l, i) => l.card && pressable(l.card) ? `<button type="button" class="watv__k is-btn" data-card="${esc(l.card)}"><b>${i + 1}</b><span>${dress(esc(l.text))}</span></button>` : `<span class="watv__k"><b>${i + 1}</b><span>${dress(esc(l.text))}</span></span>`).join(''); keyEl.hidden = false;
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
    paintFound();
  }
  function atRest() {
    rest = true; prog = 1;
    capsEl.querySelectorAll('.is-end').forEach(e => e.classList.add('is-on'));
    names();
    backB.disabled = skip(STEPS, si, -1) < 0; nextB.disabled = false; nextB.classList.add('pulse');
    againB.hidden = FAST; paintCtl();
    window.WATER.at = { step: si, rest: true };
  }
  function play(my) {
    cancelAnimationFrame(raf);
    rest = false; prog = FAST ? 1 : 0; scene.frame(prog);
    if (FAST) { if (scene.live && scene.live.still) scene.live.still(stilled); paintStrip(); atRest(); return; }
    const t0 = performance.now(), dur = scene.dur;
    const tick = now => {
      if (my !== token || closed) return;
      prog = Math.min(1, (now - t0) / dur); scene.frame(prog);
      if (prog < 1) raf = requestAnimationFrame(tick); else atRest();
    };
    raf = requestAnimationFrame(tick);
    going(my);
  }
  /* (Reduce motion: a picture of two liquids has its one still a moment after the step opens; the count follows) */
  const stilled = () => { if (!closed) { paintStrip(); paintCtl(); } };
  /* a live picture goes on while the reader reads: the liquids from the moment the step opens, the others (the
     contractile vacuoles) once their first motion has ended */
  let liveRaf = 0, stripHTML = '';
  function going(my) {
    cancelAnimationFrame(liveRaf); let last = 0, at = 0;
    const f = now => {
      if (my !== token || closed) return;
      const dt = last ? now - last : 16; last = now;
      if (scene.live && (rest || scene.live.strip)) { scene.live.tick(dt); if (now - at > 200) { at = now; paintStrip(); paintCtl(); } }
      liveRaf = requestAnimationFrame(f);
    };
    liveRaf = requestAnimationFrame(f);
  }
  /* the count under a picture of two liquids: the water molecules that crossed the membrane, each way */
  function paintStrip() {
    const q = scene && scene.live && scene.live.strip ? scene.live.strip() : null;
    if (!q) { root.classList.remove('has-strip'); if (!stripEl.hidden) { stripEl.hidden = true; stripEl.innerHTML = stripHTML = ''; } return; }
    const html = `<b class="watv__sh">${esc(q.head)}</b><span class="watv__sv"><i aria-hidden="true">←</i> ${esc(q.a[0])} <b data-n="a">${q.a[1]}</b></span><span class="watv__sv">${esc(q.b[0])} <i aria-hidden="true">→</i> <b data-n="b">${q.b[1]}</b></span>`
      + `<span class="watv__sc">${q.done && !FAST ? `after ${q.end} s: the model stops here` : `after ${q.secs} s`}</span>` + (q.said ? `<span class="watv__sn">${esc(q.said)}</span>` : '');
    if (html !== stripHTML) { stripEl.innerHTML = stripHTML = html; stripEl.hidden = false; }
    root.classList.add('has-strip');
  }
  function paintCtl() {
    const q = scene && scene.live && scene.live.pause ? scene.live.state() : null, on = !!q && !FAST && rest && !q.done;
    pauseB.hidden = !on; if (on) { pauseB.innerHTML = q.paused ? '▶<span> Play</span>' : '⏸<span> Pause</span>'; pauseB.setAttribute('aria-label', q.paused ? 'Play' : 'Pause'); pauseB.setAttribute('aria-pressed', String(!!q.paused)); }
  }
  pauseB.addEventListener('click', () => { if (!scene || !scene.live || !scene.live.pause) return; scene.live.pause(!scene.live.state().paused); paintCtl(); });

  /* ---------------- the names that are buttons, and their cards ---------------- */
  const pressable = id => { const c = (STEPS[si].cards || {})[id]; return !!c && !(level() === 'sl' && hlOnly(c.t)); };
  const pressIds = () => Object.keys(STEPS[si].cards || {}).filter(pressable), keyOf = id => (si + 1) + ':' + id;
  const foundHere = () => { const F = found(VIEW); return new Set(pressIds().filter(id => F.has(keyOf(id)))); };
  function findHTML() {
    const ids = pressIds(), C = STEPS[si].cards; if (!ids.length) return '';
    return `<div class="watv__find"><div class="watv__findline"><span class="watv__ft">Press each name on the picture</span><span class="watv__fbar" aria-hidden="true"><i></i></span><b class="watv__fn"></b></div>`
      + `<div class="watv__chips" role="group" aria-label="The names on the picture">${ids.map(id => `<button type="button" class="watv__chip" data-card="${id}" data-codes="${esc(codesOf(C[id].t))}" aria-expanded="false">${dress(esc(C[id].name))}</button>`).join('')}</div>`
      + `<div class="watv__card" role="note" aria-live="polite" hidden></div></div>`;
  }
  function paintFound() {
    const ids = pressIds(), F = foundHere(), box = $('.watv__find');
    if (box) {
      box.querySelector('.watv__fn').textContent = `${F.size} of ${ids.length} found`; box.querySelector('.watv__fbar i').style.width = (ids.length ? 100 * F.size / ids.length : 0) + '%';
      box.querySelectorAll('.watv__chip').forEach(b => { b.classList.toggle('is-found', F.has(b.dataset.card)); b.classList.toggle('is-open', b.dataset.card === card); b.setAttribute('aria-expanded', String(b.dataset.card === card)); });
    }
    root.querySelectorAll('.watv__capb, .watv__nm.is-btn, .watv__pin.is-btn, .watv__k.is-btn').forEach(b => { b.classList.toggle('is-found', F.has(b.dataset.card)); b.classList.toggle('is-open', b.dataset.card === card); });
  }
  /* the pressed card's part of the picture stays bright; the other parts dim (a scene that draws on the canvas dims
     its own: scene.focus) */
  function focusOn(id) {
    svg.classList.toggle('is-focus', !!id);
    if (G) G.querySelectorAll('[data-p]').forEach(e => e.classList.toggle('is-lit', !!id && e.getAttribute('data-p').split(' ').includes(id)));
    if (scene && scene.focus) scene.focus(id);
  }
  function openCard(id) {
    if (!pressable(id)) return;
    if (card === id) { closeCard(); return; }
    const C = STEPS[si].cards[id], box = $('.watv__card'); if (!box) return;
    card = id; learn(VIEW, keyOf(id));
    box.innerHTML = `<div class="watv__cardh"><b>${dress(esc(C.name))}</b><button type="button" class="watv__cardx" aria-label="Close">×</button></div>` + cardLines(C.t);
    box.hidden = false; focusOn(id); paintFound(); again();
    if (box.scrollIntoView) box.scrollIntoView({ block: 'nearest', behavior: FAST ? 'auto' : 'smooth' });
  }
  /* a name pressed: the picture's motion plays once more while its card is read (the pressed part bright). Not a live
     picture (it never stopped), and not with Reduce motion. Next stays as it is. */
  let rp = 0;
  function again() {
    cancelAnimationFrame(rp); if (FAST || !rest || scene.live) return;
    const sc = scene, my = token, t0 = performance.now();
    const f = now => { if (my !== token || closed || sc !== scene) return; const t = Math.min(1, (now - t0) / sc.dur); sc.frame(t); if (t < 1) rp = requestAnimationFrame(f); };
    rp = requestAnimationFrame(f);
  }
  function closeCard() {
    if (!card) return; card = '';
    const box = $('.watv__card'); if (box) { box.hidden = true; box.innerHTML = ''; }
    focusOn(''); paintFound();
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-card]'); if (b && root.contains(b)) { openCard(b.dataset.card); return; }
    if (e.target.closest('.watv__cardx')) { closeCard(); return; }
    const m = e.target.closest('.watv__sw [data-mode]'); if (m && rest && m.dataset.mode !== stepMode(STEPS[si])) { choice[STEPS[si].id] = m.dataset.mode; show(si, true); }
  });
  /* the step's words: its lines on show, a choice's own line, the names to find, More detail */
  function drawText() {
    const st = STEPS[si], T = fit(st.t), cut = T.indexOf('\n'), m = st.modes ? st.modes.list.find(q => q.id === stepMode(st)) : null;
    const seen = st.modes ? st.modes.list.filter(q => found(VIEW).has(keyOf('mode:' + q.id))).length : 0;
    const mid = m ? `<div class="watv__mode"><p class="watv__modek">${esc(st.modes.ask)}: <b>${esc(m.name.toLowerCase())}</b></p>${cardLines(m.t)}<p class="watv__seen">Change it with the switch on the picture: ${seen} of ${st.modes.list.length} seen.</p></div>` : '';
    /* (a choice's line stands right under the step's first line, before any other) */
    textEl.innerHTML = hlNote(st) + (m ? paras(cut < 0 ? T : T.slice(0, cut)) + mid + paras(cut < 0 ? '' : T.slice(cut + 1), findHTML()) : paras(T, findHTML()));
  }

  /* ---------------- the steps ---------------- */
  function show(s, same = false) {
    /* (a step opens, or opens again with another choice or for Watch again: its live picture starts anew) */
    const my = ++token; if (scene && scene.live && scene.live.stop) scene.live.stop(); keep = {}; card = ''; si = s; rest = false;
    window.WATER.at = { step: s, rest: false };
    const st = STEPS[s];
    countEl.textContent = `Step ${s + 1} of ${STEPS.length}${st.hl ? ' · HL only' : ''}`; titleEl.textContent = st.title;
    if (stepsEl.children.length !== STEPS.length) stepsEl.innerHTML = STEPS.map((q, k) => `<button type="button" data-s="${k}"${q.hl ? ' class="is-hl"' : ''}${hlOnly(q) ? ' data-hlo=""' : ''} aria-label="Step ${k + 1}${q.hl ? ', HL only' : ''}">${k + 1}</button>`).join('');
    Array.from(stepsEl.children).forEach((b, k) => { if (k === s) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    if (st.modes) learn(VIEW, keyOf('mode:' + stepMode(st)));
    drawText(); if (!same) panelEl.scrollTop = 0;
    nextB.disabled = backB.disabled = true; nextB.classList.remove('pulse'); againB.hidden = true; pauseB.hidden = true; stripEl.hidden = true; stripEl.innerHTML = stripHTML = ''; root.classList.remove('has-strip');
    nextB.textContent = skip(STEPS, s, 1) < STEPS.length ? 'Next step →' : (inGame ? 'Back to the plant cell →' : 'Start again →');
    if (!inGame) history.replaceState(null, '', '#s' + (s + 1));
    build();
    /* a picture with a count: the count stands under it from the first moment (at 0), and the picture is drawn for the
       height that is left, before anything is seen (not a moment later, with a jump) */
    if (scene.live && scene.live.strip) { paintStrip(); const r = stageEl.getBoundingClientRect(); if (Math.round(r.width) !== W || Math.round(r.height) !== H) build(); }
    play(my);
  }
  nextB.addEventListener('click', () => { if (nextB.disabled) return; const j = skip(STEPS, si, 1); if (j < STEPS.length) show(j); else if (inGame) close(); else show(Math.max(0, skip(STEPS, -1, 1))); });
  backB.addEventListener('click', () => { if (backB.disabled) return; const j = skip(STEPS, si, -1); if (j >= 0) show(j); });
  /* the level changed on this step: Next and Back say where they now go */
  const relevel = () => {
    if (closed) { document.removeEventListener('iblevel', relevel); return; }
    /* the words, the cards and the buttons follow the level (a card of HL lines only is no button at SL) */
    const open = card && pressable(card) ? card : ''; card = '';
    drawText(); build(); scene.frame(prog);
    if (rest) { capsEl.querySelectorAll('.is-end').forEach(e => e.classList.add('is-on')); names(); if (FAST && scene.live && scene.live.still) scene.live.still(stilled); }
    if (open) openCard(open);
    if (!rest) return; backB.disabled = skip(STEPS, si, -1) < 0; nextB.textContent = skip(STEPS, si, 1) < STEPS.length ? 'Next step →' : (inGame ? 'Back to the plant cell →' : 'Start again →');
  };
  document.addEventListener('iblevel', relevel);
  stepsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || +b.dataset.s === si) return; show(+b.dataset.s); });
  againB.addEventListener('click', () => { if (!rest) return; show(si); });      /* (a live picture starts its run again: show() gives it a new `keep`) */

  /* a new size: the picture is drawn again for it, at the same moment of its motion */
  let rz = 0;
  const ro = new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(() => {
    if (closed || !scene) return;
    const r = stageEl.getBoundingClientRect(); if (Math.round(r.width) === W && Math.round(r.height) === H) return;
    build(); scene.frame(prog); if (rest) { capsEl.querySelectorAll('.is-end').forEach(e => e.classList.add('is-on')); names(); if (FAST && scene.live && scene.live.still) scene.live.still(stilled); }
  }, 120); });
  ro.observe(stageEl);

  const onKey = e => {
    if (e.key === 'Escape') { if (card) { closeCard(); return; } if (inGame) close(); return; }
    if (e.target.closest && e.target.closest('input, textarea, summary')) return;
    if (e.key === 'ArrowRight' && !nextB.disabled) nextB.click();
    if (e.key === 'ArrowLeft' && !backB.disabled) backB.click();
  };
  document.addEventListener('keydown', onKey);
  function close() { unmark();
    if (closed) return; closed = true; token++;
    cancelAnimationFrame(raf); cancelAnimationFrame(liveRaf); if (scene && scene.live && scene.live.stop) scene.live.stop(); ro.disconnect(); document.removeEventListener('keydown', onKey); document.removeEventListener('iblevel', relevel); root.remove();
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
    },
    /* the cards of the step, the switch, the live picture (the liquid's counts) */
    cards: () => ({ step: si, ids: pressIds(), found: [...foundHere()], open: card }),
    press: id => openCard(id), closeCard,
    mode: () => stepMode(STEPS[si]),
    live: () => scene && scene.live ? scene.live.state() : null,
    jump: secs => { if (scene && scene.live && scene.live.jump) { scene.live.jump(secs); paintStrip(); paintCtl(); } },
    strip: () => scene && scene.live && scene.live.strip ? scene.live.strip() : null
  };

  let first = Math.max(0, Math.min(STEPS.length - 1, start | 0));
  const h = /^#s(\d+)$/.exec(location.hash || ''); if (!inGame && h) first = Math.max(0, Math.min(STEPS.length - 1, +h[1] - 1));
  /* the first picture is drawn once the styles have given the stage its size */
  const go = () => { if (!closed) show(first); };
  if (css.sheet) requestAnimationFrame(go); else { let done = false; const g1 = () => { if (!done) { done = true; requestAnimationFrame(go); } }; css.addEventListener('load', g1, { once: true }); css.addEventListener('error', g1, { once: true }); setTimeout(g1, 4000); }
  return { close, root };
}
