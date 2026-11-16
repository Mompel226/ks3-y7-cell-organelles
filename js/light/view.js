/* ============================================================
   view.js — the IB view "From light to glucose" (16 Nov 2026): IB Biology C1.3 Photosynthesis, seen step by step in a
   palisade cell's chloroplast; the photosynthesis sibling of "From glucose to ATP" (js/ib/), whose house style it
   follows, and laid out like the membrane view (js/membrane/view.js): a header with its eyebrow and title, a button for
   every step, a labelled way back, the picture beside the words, Next, each paragraph tagged by its level, a "More
   detail" fold, what the pictures simplify, and the sources.
   Opened over the game (openLight({ inGame: true, onClose })) or at its own address (light/). While open,
   documentElement has the class lightv-open. Esc and the way back close it over the game and call onClose.
   The pictures are 2D, inline SVG (scenes.js): no three.js. A step's motion runs once (dyn(p), p 0 → 1) and Next waits
   for its end (memory animations-wait-for-the-reader); ↻ plays it again. With Reduce motion (the computer's setting, or
   ?still=1 in the address, for the checks) each step shows its end state at once, with every name.
   Names (memory label-lines-never-cross): each is ONE upright or level line from its box to its part, ending on the part;
   a placer puts each box in the first free row where no box covers another and no line crosses another line or a box.
   When the picture is small (a phone: the names would be under 13 px), each name becomes a numbered pin on its part,
   keyed under the picture. Words: text.js. For tools/light-check.mjs: window.LIGHTV.
   ============================================================ */
import { STEPS, NAMES, PLACES, KEYS, AXIS, BOXES, LEVELS, SIMPLE, SOURCES, TITLE, EYEBROW, BY } from './text.js?v=202611161111';
import { SCENES, W, H } from './scenes.js?v=202611161111';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const params = new URLSearchParams(location.search);
const FAST = params.has('still') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const FS = 19, LH = 23, PADX = 9, PADY = 6;        /* a name's size on the sheet (1000 wide): 16 px on a 1280 px laptop */

function paras(t) {
  /* [!] the step's first line; [sl CODE] [hl CODE] [x]; [x+] folded under More detail (it may carry its own tag) */
  const one = p => {
    const m = /^\[(sl|hl|x)(?:\s+([A-Z][0-9.]+(?:[–-][0-9.]+)?(?:,\s*[A-Z][0-9.]+(?:[–-][0-9.]+)?)*))?\]\s*/.exec(p);
    if (!m) return `<p>${p}</p>`;
    return `<p class="lvp lvp--${m[1]}"><span class="lv lv--${m[1]}">${esc(LEVELS[m[1]].name)}${m[2] ? ` <i>${esc(m[2])}</i>` : ''}</span> ${p.slice(m[0].length)}</p>`;
  };
  const main = [], more = [];
  t.split('\n').forEach(p => {
    if (p.startsWith('[!] ')) main.push(`<p class="lvp lvp--lead">${p.slice(4)}</p>`);
    else if (p.startsWith('[x+] ')) { const r = p.slice(5); more.push(one(/^\[(sl|hl|x)[\s\]]/.test(r) ? r : '[x] ' + r)); }
    else main.push(one(p));
  });
  return main.join('') + (more.length ? `<details class="lightv__fold"><summary>More detail</summary>${more.join('')}</details>` : '');
}

function styles() {
  let l = document.querySelector('link[data-lightcss]');
  if (!l) { l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.lightcss = '1'; l.href = new URL('../../css/light.css?v=202611161111', import.meta.url).href; document.head.appendChild(l); }
  return l;
}
/* the game calls this when the door first shows: the styles come while the pupil reads */
export function warm() { styles(); }

/* ---------- geometry for the placer ---------- */
const hit = (a, b, pad = 0) => a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad;
function segHitsBox(s, b, pad = 2) {
  /* an upright or level segment against a box */
  if (s.x1 === s.x2) { const x = s.x1, y0 = Math.min(s.y1, s.y2), y1 = Math.max(s.y1, s.y2); return x > b.l - pad && x < b.r + pad && y1 > b.t - pad && y0 < b.b + pad; }
  const y = s.y1, x0 = Math.min(s.x1, s.x2), x1 = Math.max(s.x1, s.x2); return y > b.t - pad && y < b.b + pad && x1 > b.l - pad && x0 < b.r + pad;
}
function segsCross(a, b) {
  const av = a.x1 === a.x2, bv = b.x1 === b.x2;
  if (av === bv) {
    if (av) return Math.abs(a.x1 - b.x1) < 6 && Math.max(a.y1, a.y2) > Math.min(b.y1, b.y2) && Math.min(a.y1, a.y2) < Math.max(b.y1, b.y2);
    return Math.abs(a.y1 - b.y1) < 6 && Math.max(a.x1, a.x2) > Math.min(b.x1, b.x2) && Math.min(a.x1, a.x2) < Math.max(b.x1, b.x2);
  }
  const v = av ? a : b, h = av ? b : a;
  return v.x1 > Math.min(h.x1, h.x2) && v.x1 < Math.max(h.x1, h.x2) && h.y1 > Math.min(v.y1, v.y2) && h.y1 < Math.max(v.y1, v.y2);
}

export function openLight({ mount = document.body, inGame = false, start = 0, onClose = null } = {}) {
  const css = styles();
  const root = document.createElement('div');
  root.className = 'lightv' + (inGame ? ' lightv--game' : '');
  root.setAttribute('role', inGame ? 'dialog' : 'main'); if (inGame) root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'lightv-h');
  root.innerHTML = `
    <header class="lightv__top" data-bg="#0d1233">
      <div class="lightv__id"><p class="lightv__eyebrow">${esc(EYEBROW)}</p><h1 id="lightv-h">${esc(TITLE)}</h1>
        <p class="lightv__by">${esc(BY)}</p></div>
      ${inGame ? '<button type="button" class="lightv__close lightv__home">← Back to the game</button>' : '<a class="lightv__home" href="../">← The cell game</a>'}
    </header>
    <div class="lightv__main">
      <div class="lightv__stage">
        <svg class="lightv__svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="">
          <g class="lightv__bg"></g><g class="lightv__dyn"></g><g class="lightv__places"></g><g class="lightv__labels"></g>
        </svg>
        <div class="lightv__html" hidden></div>
        <div class="lightv__veil is-on is-first" aria-hidden="true"></div>
      </div>
      <div class="lightv__strip">
        <p class="lightv__note"></p><p class="lightv__cap"></p><div class="lightv__legend"></div>
        <button type="button" class="lightv__replay" aria-label="Play this step again" hidden>↻<span class="lightv__wide"> Play again</span></button>
      </div>
      <div class="lightv__key" hidden></div>
      <aside class="lightv__panel" aria-label="The steps">
        <p class="lightv__count" aria-live="polite"></p>
        <nav class="lightv__steps" aria-label="The steps"></nav>
        <h2 class="lightv__st"></h2>
        <div class="lightv__text" aria-live="polite"></div>
        <div class="lightv__ctl"></div>
        <div class="lightv__do">
          <button type="button" class="lightv__back" aria-label="The step before">← Back</button>
          <button type="button" class="lightv__next">Next step →</button>
        </div>
        <section class="lightv__more">
          <h3>What the tags mean</h3>
          <div class="lightv__tags">
            <p><span class="lv lv--sl">${esc(LEVELS.sl.name)}</span> ${esc(LEVELS.sl.long)}.</p>
            <p><span class="lv lv--hl">${esc(LEVELS.hl.name)}</span> ${esc(LEVELS.hl.long)}.</p>
            <p><span class="lv lv--x">${esc(LEVELS.x.name)}</span> ${esc(LEVELS.x.long)}. A name in violet on a picture is beyond the guide too.</p>
            <p>The codes (C1.3.5 …) are the IB guide's own numbers for each statement.</p>
          </div>
          <h3>What the pictures simplify</h3>
          <ul class="lightv__simple">${SIMPLE.map(s => `<li><span class="lv lv--x">${esc(LEVELS.x.name)}</span> ${esc(s)}</li>`).join('')}</ul>
          <h3>Sources</h3>
          <ol class="lightv__src">${SOURCES.map(s => `<li>${esc(s.c)}${s.u ? ` <a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.u.replace(/^https?:\/\//, ''))}</a>` : ''}<span class="src">Used for: ${esc(s.s)}</span></li>`).join('')}</ol>
        </section>
      </aside>
    </div>`;
  mount.appendChild(root);
  if (!css.sheet) {
    root.style.visibility = 'hidden';
    const on = () => { root.style.visibility = ''; };
    css.addEventListener('load', on, { once: true }); css.addEventListener('error', on, { once: true }); setTimeout(on, 4000);
  }
  document.documentElement.classList.add('lightv-open');
  const $ = s => root.querySelector(s);
  const svg = $('.lightv__svg'), bgEl = $('.lightv__bg'), dynEl = $('.lightv__dyn'), placesEl = $('.lightv__places'), labEl = $('.lightv__labels');
  const htmlEl = $('.lightv__html'), veil = $('.lightv__veil'), noteEl = $('.lightv__note'), capEl = $('.lightv__cap'), legEl = $('.lightv__legend'), replayB = $('.lightv__replay');
  const keyEl = $('.lightv__key'), panel = $('.lightv__panel'), countEl = $('.lightv__count'), stepsEl = $('.lightv__steps'), titleEl = $('.lightv__st'), textEl = $('.lightv__text');
  const ctlEl = $('.lightv__ctl'), nextB = $('.lightv__next'), backB = $('.lightv__back');

  /* ---------- the size of the picture: k = screen px per sheet unit ---------- */
  let k = 1, narrow = false;
  function measure() {
    const r = svg.getBoundingClientRect();
    k = Math.max(0.05, Math.min(r.width / W, r.height / H));
    narrow = k * FS < 13;
  }
  const ctx = () => ({ NAMES, PLACES, KEYS, AXIS, BOXES, narrow, k });

  /* ---------- names: measured, then placed ---------- */
  const probe = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  probe.setAttribute('font-size', FS); probe.setAttribute('font-weight', '800'); probe.setAttribute('class', 'lightv__probe');
  function textW(s) {
    labEl.appendChild(probe); let w = 0;
    String(s).split('\n').forEach(line => { probe.textContent = line; w = Math.max(w, probe.getComputedTextLength()); });
    probe.remove(); return w;
  }
  const ROWS = { T: [42, 96, 150, 204, 258], B: [H - 40, H - 94, H - 148, H - 202] };
  const DX = [0, -30, 30, -60, 60, -90, 90, -120, 120, -150, 150, -180, 180];
  function place(sc) {
    const placed = [];                                   /* { box, line } */
    const fixed = (sc.keep || []).map(([l, t, r, b]) => ({ l, t, r, b }));
    (sc.places || []).forEach(p => fixed.push(p.box));
    const ok = (box, line) => {
      if (box.l < 6 || box.r > W - 6 || box.t < 6 || box.b > H - 6) return false;
      if (fixed.some(f => hit(box, f, 4))) return false;
      for (const q of placed) {
        if (hit(box, q.box, 7)) return false;
        if (q.line && segHitsBox(q.line, box, 3)) return false;
        if (line && segHitsBox(line, q.box, 3)) return false;
        if (line && q.line && segsCross(line, q.line)) return false;
      }
      return true;
    };
    const out = [];
    /* tags and pills stand where the scene puts them; they go first */
    const order = sc.labels.map((L, i) => ({ L, i })).sort((a, b) => (!!(b.L.tag || b.L.pill)) - (!!(a.L.tag || a.L.pill)));
    for (const { L, i } of order) {
      const text = NAMES[L.id] || L.id, lines = text.split('\n').length, w = textW(text) + PADX * 2, h = lines * LH + PADY * 2 - 4;
      let best = null;
      if (L.tag || L.pill) {
        const [x, y] = L.tag || L.pill; best = { box: { l: x - w / 2, r: x + w / 2, t: y - h / 2, b: y + h / 2 }, line: null };
      } else if (L.d === 'L' || L.d === 'R') {
        const y = L.a[1], box = L.d === 'L' ? { l: L.to - w, r: L.to, t: y - h / 2, b: y + h / 2 } : { l: L.to, r: L.to + w, t: y - h / 2, b: y + h / 2 };
        best = { box, line: { x1: L.d === 'L' ? L.to : L.to, y1: y, x2: L.a[0], y2: y } };
      } else {
        const rows = ROWS[L.d].filter(r => L.d === 'T' ? r + h / 2 < L.a[1] - 6 : r - h / 2 > L.a[1] + 6);
        let first = null;
        outer: for (const ry of rows) for (const dx of DX) {
          const cx = L.a[0] + dx; if (Math.abs(dx) > w / 2 - 14) continue;
          const box = { l: cx - w / 2, r: cx + w / 2, t: ry - h / 2, b: ry + h / 2 };
          const line = { x1: L.a[0], y1: L.d === 'T' ? box.b : box.t, x2: L.a[0], y2: L.a[1] };
          if (!first) first = { box, line };
          if (ok(box, line)) { best = { box, line }; break outer; }
        }
        if (!best) best = first || { box: { l: L.a[0] - w / 2, r: L.a[0] + w / 2, t: 10, b: 10 + h }, line: null };
      }
      placed.push(best);
      out[i] = Object.assign({ L, text, lines, w, h }, best);
    }
    return out;
  }
  function drawPlaces(sc) {
    const fs = narrow ? 12.5 / k : FS, lh = fs * 1.2;
    placesEl.innerHTML = (sc.places || []).map(p => {
      const t = narrow && p.n ? p.n : p.t, lines = t.split('\n');
      labEl.appendChild(probe); probe.setAttribute('font-size', fs); let w = 0;
      lines.forEach(line => { probe.textContent = line; w = Math.max(w, probe.getComputedTextLength()); }); probe.remove(); probe.setAttribute('font-size', FS);
      const h = lines.length * lh;
      p.box = { l: p.x - 4, t: p.y - fs, r: p.x + w + 8, b: p.y - fs + h + 6 };
      return `<g class="lightv__place"><rect x="${p.box.l}" y="${p.box.t}" width="${p.box.r - p.box.l}" height="${p.box.b - p.box.t}" rx="6" fill="#0b1424" opacity=".72"/>
        <text x="${p.x + 2}" y="${p.y}" font-size="${fs}" font-weight="800" fill="#E3ECFA" data-bg="#0b1424">${lines.map((l, i) => `<tspan x="${p.x + 2}" dy="${i ? lh : 0}">${esc(l)}</tspan>`).join('')}</text></g>`;
    }).join('');
  }
  let placedNow = [];
  function drawLabels(sc, on) {
    keyEl.hidden = true; keyEl.innerHTML = '';
    if (!sc || !sc.labels || !sc.labels.length) { labEl.innerHTML = ''; placedNow = []; return; }
    if (!narrow) {
      const P = place(sc); placedNow = P;
      labEl.innerHTML = P.map((q, n) => {
        const { box, line, L, text } = q, pill = !!L.pill, ext = !!L.ext;
        const fill = pill ? L.fill : '#0a1020', ink = pill ? L.ink : ext ? '#D9CCFF' : '#FFFFFF';
        const tl = text.split('\n'), y0 = (box.t + box.b) / 2 - (tl.length - 1) * LH / 2 + FS * 0.36;
        return `<g class="lightv__nm${ext ? ' is-ext' : ''}${pill ? ' is-pill' : ''}" data-id="${esc(L.id)}" data-n="${n}">
          ${line ? `<path class="lightv__ln" d="M${line.x1} ${line.y1} L${line.x2} ${line.y2}"/>` : ''}
          <rect class="lightv__box" x="${box.l}" y="${box.t}" width="${box.r - box.l}" height="${box.b - box.t}" rx="${pill ? (box.b - box.t) / 2 : 9}" fill="${fill}"/>
          <text x="${(box.l + box.r) / 2}" y="${y0}" font-size="${FS}" font-weight="800" text-anchor="middle" fill="${ink}" data-bg="${fill}"${ext ? ' font-style="italic"' : ''}>${tl.map((l, i) => `<tspan x="${(box.l + box.r) / 2}" dy="${i ? LH : 0}">${esc(l)}</tspan>`).join('')}</text></g>`;
      }).join('');
    } else {
      /* a phone: a numbered pin on each part, keyed under the picture; a pin that would cover another moves along its
         side's direction, with a short line back to its part */
      const r = 12 / k, gap = 3 / k, pins = [];
      sc.labels.forEach((L, n) => {
        const a = L.tag || L.pill || L.a, dir = L.d === 'T' ? [0, -1] : L.d === 'B' ? [0, 1] : L.d === 'L' ? [-1, 0] : L.d === 'R' ? [1, 0] : [0, -1];
        let x = a[0], y = a[1], moved = false;
        for (let s = 0; s < 14 && pins.some(q => Math.hypot(q.x - x, q.y - y) < 2 * r + gap); s++) { x += dir[0] * r; y += dir[1] * r; moved = true; }
        x = Math.max(r + 2, Math.min(W - r - 2, x)); y = Math.max(r + 2, Math.min(H - r - 2, y));
        pins.push({ x, y, a, moved, L, n: n + 1 });
      });
      placedNow = pins.map(q => ({ L: q.L, pin: { x: q.x, y: q.y, r }, line: q.moved ? { x1: q.x, y1: q.y, x2: q.a[0], y2: q.a[1] } : null }));
      labEl.innerHTML = pins.map(q => `<g class="lightv__nm lightv__pin${q.L.ext ? ' is-ext' : ''}" data-id="${esc(q.L.id)}">${q.moved ? `<path class="lightv__ln" d="M${q.x} ${q.y} L${q.a[0]} ${q.a[1]}" style="stroke-width:${2 / k}"/>` : ''}
        <circle cx="${q.x}" cy="${q.y}" r="${r}" fill="${q.L.ext ? '#C9B6FF' : '#FFD27A'}" stroke="#1b1640" stroke-width="${1.5 / k}"/>
        <text x="${q.x}" y="${q.y + 4.4 / k}" font-size="${13 / k}" font-weight="900" text-anchor="middle" fill="#1b1640" data-bg="${q.L.ext ? '#C9B6FF' : '#FFD27A'}">${q.n}</text></g>`).join('');
      keyEl.innerHTML = pins.map(q => `<span class="lightv__k${q.L.ext ? ' is-ext' : ''}"><b>${q.n}</b>${esc((NAMES[q.L.id] || q.L.id).replace(/\n/g, ' '))}</span>`).join('');
      keyEl.hidden = false;
    }
    labEl.classList.toggle('is-on', !!on);
  }
  function drawLegend(sc) {
    const sw = l => l.s === 'line' ? `<i class="lg-line" style="background:${l.c}"></i>` : l.s === 'dash' ? `<i class="lg-dash" style="border-color:${l.c}"></i>`
      : l.s === 'water' ? '<i class="lg-mol"><b style="background:#ff6b6b"></b><b class="h" style="background:#fff"></b><b class="h2" style="background:#fff"></b></i>'
      : l.s === 'o2' ? '<i class="lg-mol"><b style="background:#ff6b6b"></b><b class="o" style="background:#ff6b6b"></b></i>' : `<i class="lg-dot" style="background:${l.c}"></i>`;
    legEl.innerHTML = (sc.legend || []).map(l => `<span>${sw(l)}${esc(l.t)}</span>`).join('');
  }

  /* ---------- the motion ---------- */
  let sc = null, raf = 0, closed = false, rest = false, si = 0, token = 0, ctlState = 'both';
  function frame(p) {
    if (sc.html) { sc.dyn(p, htmlEl); return; }
    dynEl.innerHTML = sc.dyn(p);
  }
  function run(my) {
    return new Promise(res => {
      cancelAnimationFrame(raf);
      if (FAST || !sc.dur) { frame(1); res(); return; }
      const t0 = performance.now();
      const tick = now => {
        if (my !== token || closed) { res(); return; }
        const p = Math.min(1, (now - t0) / sc.dur); frame(p);
        if (p < 1) raf = requestAnimationFrame(tick); else res();
      };
      frame(0); raf = requestAnimationFrame(tick);
    });
  }
  function build() {
    const st = STEPS[si];
    measure();
    sc = SCENES[st.scene](st.phase, ctx());
    if (sc.html) {
      svg.style.display = 'none'; htmlEl.hidden = false; htmlEl.innerHTML = sc.html; htmlEl.scrollTop = 0;
      if (sc.ctl) sc.ctl(htmlEl, ctlState);
      bgEl.innerHTML = dynEl.innerHTML = placesEl.innerHTML = labEl.innerHTML = '';
    } else {
      svg.style.display = ''; htmlEl.hidden = true; htmlEl.innerHTML = '';
      bgEl.innerHTML = sc.bg; dynEl.innerHTML = ''; drawPlaces(sc);
      svg.setAttribute('aria-label', st.title + '. ' + (st.note || '') + '. ' + sc.labels.map(L => (NAMES[L.id] || '').replace(/\n/g, ' ')).join(', '));
    }
    noteEl.textContent = st.note || ''; noteEl.hidden = !st.note;
    capEl.textContent = st.cap || ''; capEl.hidden = !st.cap;
    drawLegend(sc);
  }
  async function show(s, again = false) {
    const my = ++token; si = s; rest = false; window.LIGHTV.at = { step: s, rest: false };
    const st = STEPS[s];
    if (!again) {
      nextB.disabled = true; backB.disabled = true; nextB.classList.remove('pulse');
      countEl.textContent = `Step ${s + 1} of ${STEPS.length}`; titleEl.textContent = st.title;
      if (stepsEl.children.length !== STEPS.length) stepsEl.innerHTML = STEPS.map((x, n) => `<button type="button" data-s="${n}" aria-label="Step ${n + 1}: ${esc(x.title)}">${n + 1}</button>`).join('');
      Array.from(stepsEl.children).forEach((b, n) => { if (n === s) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      textEl.innerHTML = paras(st.t); panel.scrollTop = 0;
      ctlEl.innerHTML = ''; ctlState = 'both';
      /* the picture changes under the veil, never in one frame */
      veil.classList.add('is-on');
      await new Promise(r => setTimeout(r, veil.classList.contains('is-first') ? 0 : 280));
      if (my !== token || closed) return;
      build();
      if (sc.states) {
        ctlEl.innerHTML = `<div class="lightv__states" role="group" aria-label="Compare">${Object.entries(sc.states).map(([k2, t]) => `<button type="button" data-state="${k2}" aria-pressed="${k2 === ctlState}">${esc(t)}</button>`).join('')}</div>`;
      }
      drawLabels(sc, false);
      veil.classList.remove('is-on', 'is-first');
    } else { labEl.classList.remove('is-on'); }
    replayB.hidden = true;
    await run(my);
    if (my !== token || closed) return;
    drawLabels(sc, true);
    rest = true;
    backB.disabled = s === 0; nextB.disabled = false; nextB.classList.add('pulse');
    nextB.textContent = s < STEPS.length - 1 ? 'Next step →' : (inGame ? 'Back to the game →' : 'Start again →');
    replayB.hidden = FAST || !sc.dur;
    if (!inGame) history.replaceState(null, '', location.pathname + location.search + '#s' + (s + 1));
    window.LIGHTV.at = { step: s, rest: true };
  }
  nextB.addEventListener('click', () => { if (nextB.disabled) return; if (si < STEPS.length - 1) show(si + 1); else if (inGame) close(); else show(0); });
  backB.addEventListener('click', () => { if (!backB.disabled && si > 0) show(si - 1); });
  stepsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || +b.dataset.s === si) return; show(+b.dataset.s); });
  replayB.addEventListener('click', () => { if (rest) show(si, true); });
  ctlEl.addEventListener('click', e => {
    const b = e.target.closest('[data-state]'); if (!b || !sc || !sc.ctl) return;
    ctlState = b.dataset.state; sc.ctl(htmlEl, ctlState);
    ctlEl.querySelectorAll('[data-state]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.state === ctlState)));
  });

  /* a new size: the names are placed again (a phone's pins, or a laptop's lines) */
  let rsT = 0;
  const onResize = () => { clearTimeout(rsT); rsT = setTimeout(() => { if (!sc || sc.html) return; const was = narrow; measure(); if (was !== narrow) { const st = STEPS[si]; sc = SCENES[st.scene](st.phase, ctx()); bgEl.innerHTML = sc.bg; drawPlaces(sc); frame(rest ? 1 : 0); drawLegend(sc); } else drawPlaces(sc); drawLabels(sc, rest); }, 120); };
  window.addEventListener('resize', onResize);

  const onKey = e => {
    if (e.key === 'Escape') { if (inGame) close(); return; }
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight' && !nextB.disabled) nextB.click();
    if (e.key === 'ArrowLeft' && !backB.disabled) backB.click();
  };
  document.addEventListener('keydown', onKey);
  function close() {
    if (closed) return; closed = true; token++;
    cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize);
    root.remove(); document.documentElement.classList.remove('lightv-open');
    if (window.LIGHTV && window.LIGHTV.root === root) window.LIGHTV = null;
    if (onClose) onClose();
  }
  if (inGame) $('.lightv__close').addEventListener('click', close);

  /* ---------- for the check tool: what is drawn, in screen pixels ---------- */
  window.LIGHTV = {
    root, FAST, steps: STEPS.length, at: { step: 0, rest: false }, goto: s => show(s), close,
    state: () => {
      const m = svg.getScreenCTM(), pt = (x, y) => m ? { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f } : { x, y };
      const bx = b => { const p = pt(b.l, b.t), q = pt(b.r, b.b); return { l: p.x, t: p.y, r: q.x, b: q.y }; };
      const sr = bx({ l: 0, t: 0, r: W, b: H });
      return {
        narrow, k, html: !!(sc && sc.html), stage: sr,
        labels: placedNow.map(q => ({
          id: q.L.id, text: (NAMES[q.L.id] || q.L.id), ext: !!q.L.ext,
          box: q.box ? bx(q.box) : null, pin: q.pin ? (p => ({ x: p.x, y: p.y, r: q.pin.r * m.a }))(pt(q.pin.x, q.pin.y)) : null,
          line: q.line ? (a => (b => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y }))(pt(q.line.x2, q.line.y2)))(pt(q.line.x1, q.line.y1)) : null,
          end: q.L.a ? pt(q.L.a[0], q.L.a[1]) : null
        })),
        places: sc && sc.places ? sc.places.filter(p => p.box).map(p => bx(p.box)) : []
      };
    }
  };

  (async () => {
    let first = Math.max(0, Math.min(STEPS.length - 1, start | 0));
    const h = /^#s(\d+)$/.exec(location.hash || ''); if (!inGame && h) first = Math.max(0, Math.min(STEPS.length - 1, +h[1] - 1));
    if (document.fonts && document.fonts.ready) { try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch (e) { /* the system font, then */ } }
    if (!closed) show(first);
  })();
  return { close, root };
}
