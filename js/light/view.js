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
   Since 17 Nov 2026 the view teaches on its picture (memory teach-on-the-picture; Daniel's "Yes, carry on" to the
   membrane view and to the water view, whose way this follows): a step keeps at most 49 words on show and folds no
   guide line; a guide line that says what ONE named part is stands in that name's card (text.js cards). A name with a
   card is a button (on a phone: its pin and its line of the key); pressed, its part stays bright and the rest of the
   picture dims, the motion plays once more, and the card opens in the sheet under "n of N found" (js/ib/found.js).
   A step with choices has a switch under its picture (text.js modes), each choice with its own guide line. The two
   spectra are read by moving a wavelength (a slider under the graph; scene.read). Step 11's protons move at random
   and their crossings are counted both ways (scene.live, js/light/protons.js): that picture goes on while the reader
   reads, stops after a minute, and is one still with Reduce motion.
   ============================================================ */
import { STEPS, NAMES, PLACES, KEYS, AXIS, BOXES, LEVELS, SIMPLE, SOURCES, TITLE, EYEBROW, BY } from './text.js?v=202611272058';
import { SCENES, FIGS, W, H } from './scenes.js?v=202611272058';
import { levelSwitch, skip, hlOnly, hlNote, fit, level } from '../game/iblevel.js?v=202611272058';
import { found, learn } from '../ib/found.js?v=202611272058';
import { marks, codesOf } from '../ib/mark.js?v=202611272058';      /* (a visit from the IB map marks its sentence) */
/* the IB level (js/game/iblevel.js; Daniel, 16 Nov 2026: "there is no SL HL toggle … my SL students … are struggling"):
   its switch on the step count's line, beside the step buttons it marks (in the header it squeezed the title on a phone); at SL the HL lines are hidden, a step of HL lines only is marked HL on its button, and Next
   and Back go past it (it opens when its button is pressed, with a line that says it is HL only) */

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const params = new URLSearchParams(location.search);
const FAST = params.has('still') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const FS = 19, LH = 23, PADX = 9, PADY = 6, RING = 24, VIEW = 'light';      /* RING: the room a button's small ring takes in its box */        /* a name's size on the sheet (1000 wide): 16 px on a 1280 px laptop */

/* one paragraph with its level tag ([sl CODE] …); a tag may carry several codes or a range */
const one = p => {
  const m = /^\[(sl|hl|x)(?:\s+([A-Z][0-9.]+(?:[–-][0-9.]+)?(?:,\s*[A-Z][0-9.]+(?:[–-][0-9.]+)?)*))?\]\s*/.exec(p);
  if (!m) return `<p>${p}</p>`;
  return `<p class="lvp lvp--${m[1]}"><span class="lv lv--${m[1]}">${esc(LEVELS[m[1]].name)}${m[2] ? ` <i>${esc(m[2])}</i>` : ''}</span> ${p.slice(m[0].length)}</p>`;
};
/* a card's or a choice's lines, as the level shows them (an HL line is not shown at SL) */
const cardLines = t => String(t).split('\n').filter(p => !(level() === 'sl' && /^\[hl[\s\]]/.test(p))).map(one).join('');
function paras(t, mid = '') {
  /* [!] the step's first line; [sl CODE] [hl CODE] [x]; [x+] folded under More detail (it may carry its own tag); mid:
     what stands between the lines on show and More detail (the names to find) */
  const main = [], more = [];
  fit(t).split('\n').filter(Boolean).forEach(p => {
    if (p.startsWith('[!] ')) main.push(`<p class="lvp lvp--lead">${p.slice(4)}</p>`);
    else if (p.startsWith('[x+] ')) { const r = p.slice(5); more.push(one(/^\[(sl|hl|x)[\s\]]/.test(r) ? r : '[x] ' + r)); }
    else main.push(one(p));
  });
  return main.join('') + mid + (more.length ? `<details class="lightv__fold"><summary>More detail</summary>${more.join('')}</details>` : '');
}

function styles() {
  let l = document.querySelector('link[data-lightcss]');
  if (!l) { l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.lightcss = '1'; l.href = new URL('../../css/light.css?v=202611272058', import.meta.url).href; document.head.appendChild(l); }
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

export function openLight({ mount = document.body, inGame = false, start = 0, onClose = null, mark = null, backLabel = '← Back to the game' } = {}) {
  const css = styles();
  const root = document.createElement('div');
  root.className = 'lightv' + (inGame ? ' lightv--game' : '');
  root.setAttribute('role', inGame ? 'dialog' : 'main'); if (inGame) root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'lightv-h');
  root.innerHTML = `
    <header class="lightv__top" data-bg="#0d1233">
      <div class="lightv__id"><p class="lightv__eyebrow">${esc(EYEBROW)}</p><h1 id="lightv-h">${esc(TITLE)}</h1>
        <p class="lightv__by">${esc(BY)}</p></div>
      ${inGame ? `<button type="button" class="lightv__close lightv__home">${esc(backLabel)}</button>` : '<a class="lightv__home" href="../">← The cell game</a>'}
    </header>
    <div class="lightv__main">
      <div class="lightv__stage">
        <svg class="lightv__svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="">
          <g class="lightv__bg"></g><g class="lightv__dyn"></g><g class="lightv__read"></g><g class="lightv__places"></g><g class="lightv__labels"></g>
        </svg>
        <div class="lightv__html" hidden></div>
        <div class="lightv__veil is-on is-first" aria-hidden="true"></div>
      </div>
      <div class="lightv__strip">
        <div class="lightv__sw" role="group" hidden></div>
        <p class="lightv__cross" hidden></p>
        <div class="lightv__wl" hidden></div>
        <p class="lightv__note"></p><p class="lightv__cap"></p><div class="lightv__legend"></div>
        <span class="lightv__btns"><button type="button" class="lightv__pause" hidden>Pause</button><button type="button" class="lightv__replay" aria-label="Play this step again" hidden>↻<span class="lightv__wide"> Play again</span></button></span>
      </div>
      <div class="lightv__key" hidden></div>
      <aside class="lightv__panel" aria-label="The steps">
        <div class="iblv-cline"><p class="lightv__count" aria-live="polite"></p><div class="lightv__lvl">${levelSwitch()}</div></div>
        <nav class="lightv__steps" aria-label="The steps"></nav>
        <h2 class="lightv__st"></h2>
        <div class="lightv__text" aria-live="polite"></div>
        <div class="lightv__do">
          <button type="button" class="lightv__back" aria-label="The step before">← Back</button>
          <button type="button" class="lightv__next">Next step →</button>
        </div>
        <div class="iblv-foot">${levelSwitch()}</div>
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
  const unmark = marks(root, mark);
  if (!css.sheet) {
    root.style.visibility = 'hidden';
    const on = () => { root.style.visibility = ''; };
    css.addEventListener('load', on, { once: true }); css.addEventListener('error', on, { once: true }); setTimeout(on, 4000);
  }
  document.documentElement.classList.add('lightv-open');
  const $ = s => root.querySelector(s);
  const svg = $('.lightv__svg'), bgEl = $('.lightv__bg'), dynEl = $('.lightv__dyn'), readEl = $('.lightv__read'), placesEl = $('.lightv__places'), labEl = $('.lightv__labels');
  const swEl = $('.lightv__sw'), crossEl = $('.lightv__cross'), wlEl = $('.lightv__wl'), pauseB = $('.lightv__pause');
  /* (the rule that dims every piece of the picture but the pressed card's part: written for that card, see focusOn) */
  const dimCss = document.createElement('style'); root.appendChild(dimCss);
  const htmlEl = $('.lightv__html'), veil = $('.lightv__veil'), noteEl = $('.lightv__note'), capEl = $('.lightv__cap'), legEl = $('.lightv__legend'), replayB = $('.lightv__replay');
  const keyEl = $('.lightv__key'), panel = $('.lightv__panel'), countEl = $('.lightv__count'), stepsEl = $('.lightv__steps'), titleEl = $('.lightv__st'), textEl = $('.lightv__text');
  const nextB = $('.lightv__next'), backB = $('.lightv__back');

  /* ---------- the size of the picture: k = screen px per sheet unit ---------- */
  let k = 1, narrow = false;
  function measure() {
    /* (the stage, which the drawing fills: after a step of boxes the drawing itself is hidden and measures 0, and its
       names came back as giant pins; found 17 Nov 2026) */
    const r = svg.parentNode.getBoundingClientRect();
    k = Math.max(0.05, Math.min(r.width / W, r.height / H));
    narrow = k * FS < 13;
  }
  /* what a live picture keeps while its step stays open; the choice of each step that has a switch; the open card */
  let keep = {}, card = ''; const choice = {};
  const stepMode = st => st.modes ? (choice[st.title] || st.modes.list[0].id) : '';
  const ctx = () => ({ NAMES, PLACES, KEYS, AXIS, BOXES, narrow, k, keep, FAST, mode: stepMode(STEPS[si]) });
  /* ---------- the names that are buttons: a name whose id (or the id it shares a card with) is a card of the step ---------- */
  const cardOf = id => { const st = STEPS[si], c = (st.same && st.same[id]) || id; return st.cards && st.cards[c] ? c : ''; };
  const pressable = c => { const q = (STEPS[si].cards || {})[c]; return !!q && !(level() === 'sl' && hlOnly(q.t)); };
  const pressOf = L => { const c = cardOf(L.card || L.id); return c && pressable(c) ? c : ''; };
  /* at SL a name whose card has HL lines only is no button: the name is marked HL and drawn pale, as the HL steps'
     numbers are (iblevel.js [data-hlo]), so no HL term stands on an SL pupil's picture unmarked */
  const hlName = L => { const c = cardOf(L.card || L.id); return !!c && !pressable(c); }, HLW = 28;
  const pressIds = () => Object.keys(STEPS[si].cards || {}).filter(pressable), keyOf = id => (si + 1) + ':' + id;
  const cardName = c => { const q = STEPS[si].cards[c]; return q.name || (NAMES[c] || c).replace(/\n/g, ' '); };
  const foundHere = () => { const F = found(VIEW); return new Set(pressIds().filter(id => F.has(keyOf(id)))); };

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
      const text = NAMES[L.id] || L.id, lines = text.split('\n').length, press = pressOf(L), hl = hlName(L), w = textW(text) + PADX * 2 + (press ? RING : 0) + (hl ? HLW : 0), h = lines * LH + PADY * 2 - 4;
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
      out[i] = Object.assign({ L, text, lines, w, h, press, hl }, best);
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
      const F = foundHere();
      labEl.innerHTML = P.map((q, n) => {
        const { box, line, L, text, press, hl } = q, pill = !!L.pill, ext = !!L.ext, open = press && press === card, got = press && F.has(press);
        const fill = open ? '#FFD27A' : pill ? L.fill : '#0a1020', ink = open ? '#1b1640' : pill ? L.ink : ext ? '#D9CCFF' : '#FFFFFF';
        const cx = (box.l + box.r) / 2 + (press ? RING / 2 : 0) - (hl ? HLW / 2 : 0), rx0 = box.l + PADX + 8, cy = (box.t + box.b) / 2;
        const mark = hl ? `<text x="${box.r - PADX - 9}" y="${cy + 1}" font-size="12" font-weight="900" text-anchor="middle" fill="#FFB3CB" data-bg="${fill}">HL</text>` : '';
        const tl = text.split('\n'), y0 = cy - (tl.length - 1) * LH / 2 + FS * 0.36;
        /* a button: its own small ring at the left of its words, ticked once its card has been read */
        const ring = press ? (got ? `<circle cx="${rx0}" cy="${cy}" r="8.5" fill="#2E8B5E" stroke="#fff" stroke-width="1.5"/><path d="M${rx0 - 4} ${cy} l3 3.4 l5.4 -6.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
          : `<circle cx="${rx0}" cy="${cy}" r="7.5" fill="none" stroke="${ink}" stroke-width="2.2"/>`) : '';
        return `<g class="lightv__nm${ext ? ' is-ext' : ''}${pill ? ' is-pill' : ''}${press ? ' is-btn' : ''}${open ? ' is-open' : ''}${got ? ' is-found' : ''}" data-id="${esc(L.id)}" data-n="${n}"${hl ? ' data-hlo=""' : ''}${press ? ` data-card="${esc(press)}" role="button" tabindex="0" aria-label="${esc(text.replace(/\n/g, ' '))}"` : ''}>
          ${line ? `<path class="lightv__ln" d="M${line.x1} ${line.y1} L${line.x2} ${line.y2}"/>` : ''}
          <rect class="lightv__box" x="${box.l}" y="${box.t}" width="${box.r - box.l}" height="${box.b - box.t}" rx="${pill ? (box.b - box.t) / 2 : 9}" fill="${fill}"/>${ring}
          <text x="${cx}" y="${y0}" font-size="${FS}" font-weight="800" text-anchor="middle" fill="${ink}" data-bg="${fill}"${ext ? ' font-style="italic"' : ''}>${tl.map((l, i) => `<tspan x="${cx}" dy="${i ? LH : 0}">${esc(l)}</tspan>`).join('')}</text>${mark}</g>`;
      }).join('');
    } else {
      /* a phone: a numbered pin on each part, keyed under the picture; a pin that would cover another moves along its
         side's direction, with a short line back to its part */
      const r = 12 / k, gap = 3 / k, pins = [];
      sc.labels.forEach((L, n) => {
        const a = L.pin || L.tag || L.pill || L.a, dir = L.d === 'T' ? [0, -1] : L.d === 'B' ? [0, 1] : L.d === 'L' ? [-1, 0] : L.d === 'R' ? [1, 0] : [0, -1];
        let x = a[0], y = a[1], moved = false;
        for (let s = 0; s < 14 && pins.some(q => Math.hypot(q.x - x, q.y - y) < 2 * r + gap); s++) { x += dir[0] * r; y += dir[1] * r; moved = true; }
        x = Math.max(r + 2, Math.min(W - r - 2, x)); y = Math.max(r + 2, Math.min(H - r - 2, y));
        pins.push({ x, y, a, moved, L, n: n + 1 });
      });
      placedNow = pins.map(q => ({ L: q.L, pin: { x: q.x, y: q.y, r }, press: pressOf(q.L), line: q.moved ? { x1: q.x, y1: q.y, x2: q.a[0], y2: q.a[1] } : null }));
      const F = foundHere(), btn = L => { const c = pressOf(L); return c ? ` data-card="${esc(c)}" role="button" tabindex="0" aria-label="${esc((NAMES[L.id] || L.id).replace(/\n/g, ' '))}"` : ''; };
      const cls = L => { const c = pressOf(L); return c ? ' is-btn' + (c === card ? ' is-open' : '') + (F.has(c) ? ' is-found' : '') : ''; };
      labEl.innerHTML = pins.map(q => `<g class="lightv__nm lightv__pin${q.L.ext ? ' is-ext' : ''}${cls(q.L)}" data-id="${esc(q.L.id)}"${hlName(q.L) ? ' data-hlo=""' : ''}${btn(q.L)}>${q.moved ? `<path class="lightv__ln" d="M${q.x} ${q.y} L${q.a[0]} ${q.a[1]}" style="stroke-width:${2 / k}"/>` : ''}
        <circle cx="${q.x}" cy="${q.y}" r="${r}" fill="${q.L.ext ? '#C9B6FF' : '#FFD27A'}" stroke="#1b1640" stroke-width="${1.5 / k}"/>
        <text x="${q.x}" y="${q.y + 4.4 / k}" font-size="${13 / k}" font-weight="900" text-anchor="middle" fill="#1b1640" data-bg="${q.L.ext ? '#C9B6FF' : '#FFD27A'}">${q.n}</text></g>`).join('');
      keyEl.innerHTML = pins.map(q => { const c = pressOf(q.L), t = `<b>${q.n}</b>${esc((NAMES[q.L.id] || q.L.id).replace(/\n/g, ' '))}`;
        return c ? `<button type="button" class="lightv__k is-btn${q.L.ext ? ' is-ext' : ''}${c === card ? ' is-open' : ''}${F.has(c) ? ' is-found' : ''}" data-card="${esc(c)}">${t}</button>` : `<span class="lightv__k${q.L.ext ? ' is-ext' : ''}"${hlName(q.L) ? ' data-hlo=""' : ''}>${t}</span>`; }).join('');
      keyEl.hidden = false;
    }
    labEl.classList.toggle('is-on', !!on);
  }
  function drawLegend(sc) {
    const sw = l => l.s === 'ring' ? '<i class="lg-ring"></i>' : l.s === 'pair' ? `<i class="lg-pair"><b style="background:${l.c}"></b><b style="background:${l.c}"></b></i>` : l.s === 'line' ? `<i class="lg-line" style="background:${l.c}"></i>` : l.s === 'dash' ? `<i class="lg-dash" style="border-color:${l.c}"></i>`
      : l.s === 'water' ? '<i class="lg-mol"><b style="background:#ff6b6b"></b><b class="h" style="background:#fff"></b><b class="h2" style="background:#fff"></b></i>'
      : l.s === 'o2' ? '<i class="lg-mol"><b style="background:#ff6b6b"></b><b class="o" style="background:#ff6b6b"></b></i>' : `<i class="lg-dot" style="background:${l.c}"></i>`;
    legEl.innerHTML = (sc.legend || []).map(l => `<span${l.hl ? ' data-hlo=""' : ''}>${sw(l)}${esc(l.t)}</span>`).join('');
  }

  /* ---------- the motion ---------- */
  let sc = null, raf = 0, closed = false, rest = false, si = 0, token = 0;
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
  /* a line under the picture; a guide line there carries its tag, as in the sheet */
  const tagged = s => { const m = /^\[(sl|hl)\s+([^\]]+)\]\s*/.exec(s); return m ? `<span class="lv lv--${m[1]}">${esc(LEVELS[m[1]].name)} <i>${esc(m[2])}</i></span> ${esc(s.slice(m[0].length))}` : esc(s); };
  function build() {
    const st = STEPS[si];
    measure();
    sc = SCENES[st.scene](st.phase, ctx());
    /* the strip under the picture first (its note, its line, its key, its switch, its reader, its count): its height
       decides the picture's size. Then the picture is measured again, and a scene made for another size is made again
       (a phone, step 11: a longer key made the picture smaller than its pins were sized for, 18 Nov 2026) */
    noteEl.textContent = st.note || ''; noteEl.hidden = !st.note;
    const capOn = !!st.cap && !(level() === 'sl' && /^\[hl[\s\]]/.test(st.cap));
    capEl.innerHTML = capOn ? tagged(st.cap) : ''; capEl.hidden = !capOn;
    drawLegend(sc); drawSwitch(st); drawReader(st); paintCross();
    { const k0 = k, n0 = narrow; measure(); if (n0 !== narrow || Math.abs(k - k0) > k0 * 0.015) { sc = SCENES[st.scene](st.phase, ctx()); drawLegend(sc); drawReader(st); } }
    if (sc.html) {
      svg.style.display = 'none'; htmlEl.hidden = false; htmlEl.innerHTML = sc.html; htmlEl.scrollTop = 0;
      bgEl.innerHTML = dynEl.innerHTML = readEl.innerHTML = placesEl.innerHTML = labEl.innerHTML = '';
    } else {
      svg.style.display = ''; htmlEl.hidden = true; htmlEl.innerHTML = '';
      bgEl.innerHTML = sc.bg; dynEl.innerHTML = readEl.innerHTML = ''; drawPlaces(sc);
      svg.setAttribute('aria-label', st.title + '. ' + (st.note || '') + '. ' + sc.labels.map(L => (NAMES[L.id] || '').replace(/\n/g, ' ')).join(', '));
    }
    if (!wlEl.hidden) readAt(wl);      /* (the reading's line and points, on the picture that is now drawn) */
    focusOn(card); markHtml();
  }
  /* a diagram of boxes at SL: a button whose card has HL lines only is no button; it and the rows under it are marked HL */
  function markHtml() {
    if (!sc || !sc.html) return;
    htmlEl.querySelectorAll('[data-card]').forEach(b => { const c = b.dataset.card, off = !pressable(c); b.disabled = off; if (off) b.setAttribute('data-hlo', ''); else b.removeAttribute('data-hlo');
      htmlEl.querySelectorAll('tr[data-p="' + c + '"]:not(.lgx__grp)').forEach(r => r.classList.toggle('is-hlrow', off)); });
  }
  /* the switch of a step with choices, under its picture */
  function drawSwitch(st) {
    swEl.hidden = !st.modes; if (!st.modes) { swEl.innerHTML = ''; return; }
    const m = stepMode(st), F = found(VIEW);
    swEl.setAttribute('aria-label', st.modes.ask);
    swEl.innerHTML = `<i class="lightv__swk">${esc(st.modes.ask)}</i>` + st.modes.list.map(q => `<button type="button" data-mode="${q.id}" aria-pressed="${q.id === m}"${F.has(keyOf('mode:' + q.id)) ? ' class="is-found"' : ''}>${esc(q.name)}</button>`).join('');
  }
  /* a graph that is read by moving a wavelength: a slider under it, what the graph says there beside the slider (bars as
     high as each curve at that wavelength), and a line with a point on each curve on the graph itself */
  let wl = 550;
  function drawReader(st) {
    wlEl.hidden = !(st.read && sc.read); if (wlEl.hidden) { wlEl.innerHTML = ''; return; }
    wlEl.innerHTML = `<label class="lightv__wll"><span>${esc(AXIS.wl)}</span><input type="range" min="380" max="700" step="2" value="${wl}" aria-label="${esc(AXIS.wl)} / nm: ${esc(AXIS.move)}"><output></output></label><span class="lightv__bars" aria-live="polite"></span>`;
    readAt(wl);
  }
  function readAt(l) {
    wl = Math.max(380, Math.min(700, Math.round(+l / 2) * 2)); if (!sc || !sc.read) return;
    const r = sc.read(wl); readEl.innerHTML = r.svg;
    wlEl.querySelector('output').textContent = `${wl} nm · ${r.colour}`;
    wlEl.querySelector('.lightv__bars').innerHTML = r.vals.map(q => `<span class="lightv__bar" title=""><i style="background:${q.c};height:${Math.max(2, Math.round(q.v * 36))}px"></i>${esc(q.t)}</span>`).join('');
    const inp = wlEl.querySelector('input'); if (+inp.value !== wl) inp.value = wl;
  }
  wlEl.addEventListener('input', e => { if (e.target.matches('input')) readAt(e.target.value); });
  /* the count under a live picture (the protons that crossed, each way), and its Pause */
  let crossHTML = '';
  function paintCross() {
    const q = sc && sc.live && sc.live.strip ? sc.live.strip() : null;
    if (!q) { if (!crossEl.hidden) { crossEl.hidden = true; crossEl.innerHTML = crossHTML = ''; } pauseB.hidden = true; return; }
    const html = `<b>${esc(q.head)}</b><span><i aria-hidden="true">${esc(q.a[2])}</i> ${esc(q.a[0])} <b data-n="a">${q.a[1]}</b></span><span><i aria-hidden="true">${esc(q.b[2])}</i> ${esc(q.b[0])} <b data-n="b">${q.b[1]}</b></span><span class="lightv__cs">${q.done && !FAST ? `after ${q.end} s: the model stops here` : `after ${q.secs} s`}</span>`;
    if (html !== crossHTML) { crossEl.innerHTML = crossHTML = html; crossEl.hidden = false; }
    const on = !FAST && rest && !q.done; pauseB.hidden = !on;
    if (on) { pauseB.innerHTML = q.paused ? '▶<span class="lightv__wide"> Play</span>' : '⏸<span class="lightv__wide"> Pause</span>'; pauseB.setAttribute('aria-label', q.paused ? 'Play' : 'Pause'); pauseB.setAttribute('aria-pressed', String(!!q.paused)); }
  }
  pauseB.addEventListener('click', () => { if (sc && sc.live && sc.live.pause) { sc.live.pause(!sc.live.state().paused); paintCross(); } });
  /* a live picture goes on while the reader reads (it is drawn anew many times a second) */
  let liveRaf = 0;
  function going(my) {
    cancelAnimationFrame(liveRaf); let last = 0, at = 0;
    const f = now => {
      if (my !== token || closed) return;
      const dt = last ? now - last : 16; last = now;
      if (sc && sc.live) { dynEl.innerHTML = sc.live.tick(dt); if (now - at > 200) { at = now; paintCross(); } }
      liveRaf = requestAnimationFrame(f);
    };
    liveRaf = requestAnimationFrame(f);
  }

  /* ---------- the cards ---------- */
  function findHTML() {
    const ids = pressIds(); if (!ids.length) return '';
    return `<div class="lightv__find"><div class="lightv__findline"><span class="lightv__ft">Press each name on the picture</span><span class="lightv__fbar" aria-hidden="true"><i></i></span><b class="lightv__fn"></b></div>`
      + `<div class="lightv__chips" role="group" aria-label="The names on the picture">${ids.map(id => `<button type="button" class="lightv__chip" data-card="${esc(id)}" data-codes="${esc(codesOf((STEPS[si].cards[id] || {}).t))}" aria-expanded="false">${esc(cardName(id))}</button>`).join('')}</div>`
      + `<div class="lightv__card" role="note" aria-live="polite" hidden></div></div>`;
  }
  function paintFound() {
    const ids = pressIds(), F = foundHere(), box = $('.lightv__find');
    if (box) {
      box.querySelector('.lightv__fn').textContent = `${F.size} of ${ids.length} found`; box.querySelector('.lightv__fbar i').style.width = (ids.length ? 100 * F.size / ids.length : 0) + '%';
      box.querySelectorAll('.lightv__chip').forEach(b => { b.classList.toggle('is-found', F.has(b.dataset.card)); b.classList.toggle('is-open', b.dataset.card === card); b.setAttribute('aria-expanded', String(b.dataset.card === card)); });
    }
    htmlEl.querySelectorAll('[data-card]').forEach(b => { b.classList.toggle('is-found', F.has(b.dataset.card)); b.classList.toggle('is-open', b.dataset.card === card); });
    if (sc && !sc.html) drawLabels(sc, labEl.classList.contains('is-on'));
  }
  /* the pressed card's part stays bright: every other top-level piece of the picture dims (scenes.js data-p) */
  function focusOn(id) {
    const q = id ? `[data-p~="${id}"]` : '';
    dimCss.textContent = id ? `.lightv__bg > :not(${q}), .lightv__dyn > :not(${q}), .lightv__html [data-p]:not(${q}) { opacity: .22 !important; }` : '';
  }
  /* a name pressed: the picture's motion plays once more while its card is read (not a live picture: it never stopped) */
  let rp = 0, replay = false;      /* (replay: the motion is playing once more; the check waits for its end) */
  function again() {
    cancelAnimationFrame(rp); replay = false; if (FAST || !rest || !sc.dur || sc.live || sc.html) return;      /* (a diagram of boxes stays whole while its card is read) */
    const s0 = sc, my = token, t0 = performance.now(); replay = true;
    const f = now => { if (my !== token || closed || s0 !== sc) { replay = false; return; } const t = Math.min(1, (now - t0) / s0.dur); frame(t); if (t < 1) rp = requestAnimationFrame(f); else replay = false; };
    rp = requestAnimationFrame(f);
  }
  function openCard(id) {
    if (!pressable(id)) return;
    if (card === id) { closeCard(); return; }
    const C = STEPS[si].cards[id], box = $('.lightv__card'); if (!box) return;
    card = id; learn(VIEW, keyOf(id));
    box.innerHTML = `<div class="lightv__cardh"><b>${esc(cardName(id))}</b><button type="button" class="lightv__cardx" aria-label="Close">×</button></div>` + (C.fig && FIGS[C.fig] ? `<div class="lightv__fig">${FIGS[C.fig]({ NAMES, KEYS, AXIS })}</div>` : '') + cardLines(C.t);
    /* (a card with its own small drawing is about no part of the picture: nothing dims) */
    box.hidden = false; focusOn(C.fig ? '' : id); paintFound(); again();
    if (box.scrollIntoView) box.scrollIntoView({ block: 'nearest', behavior: FAST ? 'auto' : 'smooth' });
  }
  function closeCard() {
    if (!card) return; card = '';
    const box = $('.lightv__card'); if (box) { box.hidden = true; box.innerHTML = ''; }
    focusOn(''); paintFound();
  }
  root.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-card]'); if (b && root.contains(b)) { openCard(b.dataset.card); return; }
    if (e.target.closest && e.target.closest('.lightv__cardx')) { closeCard(); return; }
    const m = e.target.closest && e.target.closest('.lightv__sw [data-mode]'); if (m && rest && m.dataset.mode !== stepMode(STEPS[si])) { choice[STEPS[si].title] = m.dataset.mode; show(si, false, true); }
  });
  /* the step's words: its lines on show, a choice's own line, the names to find, More detail */
  function drawText() {
    const st = STEPS[si], T = fit(st.t), cut = T.indexOf('\n'), m = st.modes ? st.modes.list.find(q => q.id === stepMode(st)) : null;
    const seen = st.modes ? st.modes.list.filter(q => found(VIEW).has(keyOf('mode:' + q.id))).length : 0;
    const mid = m ? `<div class="lightv__mode"><p class="lightv__modek">${esc(st.modes.ask)}: <b>${esc(m.name.toLowerCase())}</b></p>${cardLines(m.t)}<p class="lightv__seen">Change it with the switch under the picture: ${seen} of ${st.modes.list.length} seen.</p></div>` : '';
    textEl.innerHTML = hlNote(st) + (m ? paras(cut < 0 ? T : T.slice(0, cut)) + mid + paras(cut < 0 ? '' : T.slice(cut + 1), findHTML()) : paras(T, findHTML()));
  }
  async function show(s, again0 = false, same = false) {
    const my = ++token; rest = false; window.LIGHTV.at = { step: s, rest: false };
    if (!again0) { if (sc && sc.live && sc.live.stop) sc.live.stop(); keep = {}; card = ''; }
    si = s;
    const st = STEPS[s];
    cancelAnimationFrame(rp); replay = false; cancelAnimationFrame(liveRaf);
    if (!again0) {
      nextB.disabled = true; backB.disabled = true; nextB.classList.remove('pulse');
      countEl.textContent = `Step ${s + 1} of ${STEPS.length}`; titleEl.textContent = st.title;
      if (stepsEl.children.length !== STEPS.length) stepsEl.innerHTML = STEPS.map((x, n) => `<button type="button" data-s="${n}"${hlOnly(x) ? ' data-hlo=""' : ''} aria-label="Step ${n + 1}: ${esc(x.title)}">${n + 1}</button>`).join('');
      Array.from(stepsEl.children).forEach((b, n) => { if (n === s) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      if (st.modes) learn(VIEW, keyOf('mode:' + stepMode(st)));
      drawText(); if (!same) panel.scrollTop = 0;
      /* the picture changes under the veil, never in one frame */
      veil.classList.add('is-on');
      await new Promise(r => setTimeout(r, veil.classList.contains('is-first') ? 0 : 280));
      if (my !== token || closed) return;
      build();
      drawLabels(sc, false);
      veil.classList.remove('is-on', 'is-first');
    } else { labEl.classList.remove('is-on'); }
    replayB.hidden = true;
    if (sc.live && !FAST) going(my);
    await run(my);
    if (my !== token || closed) return;
    if (sc.live && FAST && sc.live.still) dynEl.innerHTML = sc.live.still();
    drawLabels(sc, true);
    rest = true;
    backB.disabled = skip(STEPS, s, -1) < 0; nextB.disabled = false; nextB.classList.add('pulse');
    nextB.textContent = skip(STEPS, s, 1) < STEPS.length ? 'Next step →' : (inGame ? 'Back to the game →' : 'Start again →');
    replayB.hidden = FAST || !sc.dur; paintCross();
    if (!inGame) history.replaceState(null, '', location.pathname + location.search + '#s' + (s + 1));
    window.LIGHTV.at = { step: s, rest: true };
  }
  nextB.addEventListener('click', () => { if (nextB.disabled) return; const j = skip(STEPS, si, 1); if (j < STEPS.length) show(j); else if (inGame) close(); else show(Math.max(0, skip(STEPS, -1, 1))); });
  backB.addEventListener('click', () => { if (backB.disabled) return; const j = skip(STEPS, si, -1); if (j >= 0) show(j); });
  /* the level changed on this step: the words, the cards and the buttons follow it (a card of HL lines only is no button
     at SL); Next and Back say where they now go */
  const relevel = () => {
    if (closed) { document.removeEventListener('iblevel', relevel); return; }
    const open = card && pressable(card) ? card : ''; card = '';
    drawText(); focusOn('');
    if (sc && !sc.html) drawLabels(sc, rest); else markHtml();
    const st = STEPS[si], capOn = !!st.cap && !(level() === 'sl' && /^\[hl[\s\]]/.test(st.cap)); capEl.innerHTML = capOn ? tagged(st.cap) : ''; capEl.hidden = !capOn;
    if (open) openCard(open); else paintFound();
    if (!rest) return; backB.disabled = skip(STEPS, si, -1) < 0; nextB.textContent = skip(STEPS, si, 1) < STEPS.length ? 'Next step →' : (inGame ? 'Back to the game →' : 'Start again →');
  };
  document.addEventListener('iblevel', relevel);
  stepsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || +b.dataset.s === si) return; show(+b.dataset.s); });
  /* (Play again: a live picture starts its run anew; any other plays its motion once more) */
  replayB.addEventListener('click', () => { if (!rest) return; if (sc.live) show(si, false, true); else show(si, true); });

  /* a new size: the names are placed again (a phone's pins, or a laptop's lines) */
  let rsT = 0;
  const onResize = () => { clearTimeout(rsT); rsT = setTimeout(() => { if (!sc || sc.html) return; const was = narrow; measure(); if (was !== narrow) { const st = STEPS[si]; sc = SCENES[st.scene](st.phase, ctx()); bgEl.innerHTML = sc.bg; drawPlaces(sc); frame(rest ? 1 : 0); if (sc.live && FAST && rest && sc.live.still) dynEl.innerHTML = sc.live.still(); drawLegend(sc); drawReader(st); } else drawPlaces(sc); drawLabels(sc, rest); }, 120); };
  window.addEventListener('resize', onResize);

  const onKey = e => {
    if (e.key === 'Escape') { if (card) { closeCard(); return; } if (inGame) close(); return; }
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('g[data-card]')) { e.preventDefault(); openCard(e.target.closest('g[data-card]').dataset.card); return; }
    if (e.key === 'ArrowRight' && !nextB.disabled) nextB.click();
    if (e.key === 'ArrowLeft' && !backB.disabled) backB.click();
  };
  document.addEventListener('keydown', onKey);
  function close() { unmark();
    if (closed) return; closed = true; token++;
    cancelAnimationFrame(raf); cancelAnimationFrame(rp); cancelAnimationFrame(liveRaf); if (sc && sc.live && sc.live.stop) sc.live.stop();
    document.removeEventListener('keydown', onKey); document.removeEventListener('iblevel', relevel); window.removeEventListener('resize', onResize);
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
    },
    /* the cards of the step, its choice, the wavelength the graph is read at, the live picture's count */
    cards: () => ({ step: si, ids: pressIds(), found: [...foundHere()], open: card }),
    press: id => openCard(id), closeCard, replaying: () => replay,
    mode: () => stepMode(STEPS[si]),
    read: l => { if (l != null) readAt(l); return sc && sc.read ? Object.assign({ wl }, sc.read(wl), { svg: undefined }) : null; },
    live: () => sc && sc.live ? sc.live.state() : null,
    strip: () => sc && sc.live && sc.live.strip ? sc.live.strip() : null,
    jump: secs => { if (sc && sc.live && sc.live.jump) { dynEl.innerHTML = sc.live.jump(secs); paintCross(); } }
  };

  (async () => {
    let first = Math.max(0, Math.min(STEPS.length - 1, start | 0));
    const h = /^#s(\d+)$/.exec(location.hash || ''); if (!inGame && h) first = Math.max(0, Math.min(STEPS.length - 1, +h[1] - 1));
    if (document.fonts && document.fonts.ready) { try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch (e) { /* the system font, then */ } }
    if (!closed) show(first);
  })();
  return { close, root };
}
