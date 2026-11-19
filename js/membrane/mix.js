/* ============================================================
   mix.js — the membrane view's small film "The evidence: two cells joined" (17 Nov 2026), in the sheet beside the
   picture (Daniel, 16 Nov 2026: "if there is something that you can show … with a little video on the right side, …
   do so"). The guide line it shows (text.js FILMS.mix, tagged A2.2.3, immunofluorescence) is the film's caption, word
   for word, a piece for each of its three shots:
     1. a mouse cell and a human cell are joined into one cell;
     2. the membrane proteins of each are marked with fluorescent antibodies of a different colour: at 0 minutes each
        colour is on its own half (green for the mouse cell's, red for the human cell's, as in the experiment:
        fluorescein and rhodamine);
     3. after 40 minutes the two colours are mixed over the whole surface.
   WHAT IT IS. A drawing of the joined cell's surface, seen from the front, dark like a fluorescence micrograph. Each dot
   stands for many proteins (text.js SIMPLE says so). In shot 3 every dot moves at random (its velocity changes a
   little at random every step, as the molecules of the picture do: sim.js), and turns back at the cell's edge; nothing
   steers it, and the two colours mix because of that movement alone. The random numbers are fixed (SEED), so the film
   is the same each time; mixCheck runs it and says how mixed the end is.
   It waits for the reader: Next after each shot. With Reduce motion each shot is one still (shots 1 and 3: before, an
   arrow, after).
   Frye LD, Edidin M (1970). J Cell Sci 7: 319–335 (text.js SOURCES).
   ============================================================ */
const SEED = 11, N = 34, R0 = 84, MIX_S = 7, JOIN_S = 2.2, MARK_S = 0.9;
const COL = { mouse: '#3ddc84', human: '#ff5a66' };
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const smooth = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);

/* the dots of the joined cell (its middle at 0, 0; radius R0): N of each colour, each on its own half at the start;
   step(dt) moves each at random */
export function mixSim(seed = SEED) {
  const r = rng(seed), gauss = () => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185 * r()); };
  const S = 50, TAU = 0.3, dots = [];
  for (let k = 0; k < 2 * N; k++) {
    const left = k < N;
    let x, y, n = 0;
    do { const a = r() * 6.283185, q = Math.sqrt(r()) * (R0 - 7); x = Math.abs(q * Math.cos(a)) * (left ? -1 : 1); y = q * Math.sin(a); } while (++n < 200 && (Math.abs(x) < 4 || dots.some(d => Math.hypot(d.x - x, d.y - y) < 9)));
    dots.push({ x, y, x0: x, y0: y, vx: gauss() * S, vy: gauss() * S, c: left ? 'mouse' : 'human' });
  }
  let t = 0;
  function step(dt) {
    const k = dt / TAU, sg = S * Math.sqrt(2 * dt / TAU);
    for (const d of dots) {
      d.vx += -d.vx * k + sg * gauss(); d.vy += -d.vy * k + sg * gauss();
      d.x += d.vx * dt; d.y += d.vy * dt;
      const q = Math.hypot(d.x, d.y), lim = R0 - 5;
      if (q > lim) { const nx = d.x / q, ny = d.y / q, vn = d.vx * nx + d.vy * ny; d.x = nx * (2 * lim - q); d.y = ny * (2 * lim - q); if (vn > 0) { d.vx -= 2 * vn * nx; d.vy -= 2 * vn * ny; } }
    }
    t += dt;
  }
  /* how mixed: the share of each colour's dots that are on the OTHER colour's half (0 at the start, about 0.5 when mixed) */
  const mixed = () => dots.filter(d => (d.c === 'mouse') === (d.x > 0)).length / dots.length;
  return { dots, step, mixed, get t() { return t; } };
}
/* the film's own numbers, run without a picture (tools/membrane-check.mjs, node): the end of shot 3 */
export function mixCheck(seed = SEED) {
  const M = mixSim(seed), start = M.mixed(); let maxStep = 0;
  for (let k = 0; k < MIX_S * 60; k++) { const b = M.dots.map(d => [d.x, d.y]); M.step(1 / 60); M.dots.forEach((d, i) => { maxStep = Math.max(maxStep, Math.hypot(d.x - b[i][0], d.y - b[i][1])); }); }
  return { n: M.dots.length, start, end: M.mixed(), maxStep, outside: M.dots.filter(d => Math.hypot(d.x, d.y) > R0).length };
}

export function makeMix(host, { FAST = false, film, levelName = 'SL and HL' }) {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const code = (/\[\w+\s+([^\]]+)\]/.exec(film.tag) || [])[1] || '';
  host.innerHTML = `<figure class="memv__mixf">
    <div class="memv__mixpic"><canvas width="640" height="380" role="img"></canvas>
      <span class="memv__mixlab" data-l="mouse">mouse cell</span><span class="memv__mixlab" data-l="human">human cell</span>
      <span class="memv__mixclock" hidden></span><span class="memv__mixclock memv__mixclock--b" hidden></span></div>
    <div class="memv__mixkey" hidden><span><i style="background:${COL.mouse}"></i>${esc(film.key.mouse)}</span><span><i style="background:${COL.human}"></i>${esc(film.key.human)}</span></div>
    <p class="memv__mixcap"></p>
    <div class="memv__mixnav"></div></figure>`;
  const cv = host.querySelector('canvas'), g = cv.getContext('2d'), capEl = host.querySelector('.memv__mixcap'), navEl = host.querySelector('.memv__mixnav'), keyEl = host.querySelector('.memv__mixkey');
  const labs = [...host.querySelectorAll('.memv__mixlab')], clocks = [...host.querySelectorAll('.memv__mixclock')];
  const W = 640, H = 380, CX = 320, CY = 196, K = 1.72;      /* the drawing's units → the canvas */
  let M = mixSim();      /* (made again for each showing: the same random numbers, so the same film) */
  let shot = 0, t = 0, raf = 0, last = 0, done = false, stopped = false;

  function cell(x, y, r, a = 1) {
    g.globalAlpha = a;
    const gr = g.createRadialGradient(x, y, r * 0.2, x, y, r); gr.addColorStop(0, 'rgba(120,150,255,.10)'); gr.addColorStop(1, 'rgba(120,150,255,.03)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
    g.lineWidth = 3; g.strokeStyle = 'rgba(214,222,255,.62)'; g.stroke(); g.globalAlpha = 1;
  }
  function dotsAt(cx, cy, k, a, from0) {
    for (const d of M.dots) {
      const x = cx + (from0 ? d.x0 : d.x) * k, y = cy + (from0 ? d.y0 : d.y) * k;
      g.globalAlpha = a; g.shadowColor = COL[d.c]; g.shadowBlur = 9 * k; g.fillStyle = COL[d.c];
      g.beginPath(); g.arc(x, y, 3.3 * k + 1.2, 0, 6.2832); g.fill();
    }
    g.shadowBlur = 0; g.globalAlpha = 1;
  }
  function arrow(x0, x1, y) {
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x0, y - 5); g.lineTo(x1 - 20, y - 5); g.lineTo(x1 - 20, y - 13); g.lineTo(x1, y); g.lineTo(x1 - 20, y + 13); g.lineTo(x1 - 20, y + 5); g.lineTo(x0, y + 5); g.closePath(); g.fill();
  }
  const place = (el, x, y) => { el.style.left = (100 * x / W) + '%'; el.style.top = (100 * y / H) + '%'; };
  function draw() {
    g.clearRect(0, 0, W, H); g.fillStyle = '#05070f'; g.fillRect(0, 0, W, H);
    labs.forEach(l => { l.hidden = true; }); clocks.forEach(c => { c.hidden = true; });
    const R = R0 * K;
    if (shot === 0) {
      if (FAST) {
        /* one still: the two cells, an arrow, the joined cell */
        const r = 58; cell(96, CY - 66, r); cell(96, CY + 66, r); arrow(190, 300, CY); cell(470, CY, 112);
        labs[0].hidden = labs[1].hidden = false; place(labs[0], 96, CY - 66); place(labs[1], 96, CY + 66);
      } else {
        const e = smooth(t / JOIN_S), r = 96 + (R - 96) * e * 0.5, dx = (1 - e) * 132;
        if (e < 1) { cell(CX - dx, CY, r); cell(CX + dx, CY, r); } else cell(CX, CY, R);
        if (e < 0.55) { labs[0].hidden = labs[1].hidden = false; place(labs[0], CX - dx, CY); place(labs[1], CX + dx, CY); }
      }
    } else if (shot === 1) {
      cell(CX, CY, R); dotsAt(CX, CY, K, FAST ? 1 : smooth(t / MARK_S), true);
      clocks[0].hidden = false; clocks[0].textContent = film.clock[0]; place(clocks[0], CX, 26);
    } else if (FAST) {
      /* one still: at 0 minutes, an arrow, after 40 minutes */
      const k = 1.0, r = R0 * k + 4;
      cell(140, CY + 8, r); dotsAt(140, CY + 8, k, 1, true); arrow(250, 370, CY + 8); cell(490, CY + 8, r); dotsAt(490, CY + 8, k, 1, false);
      clocks[0].hidden = clocks[1].hidden = false; clocks[0].textContent = film.clock[0]; clocks[1].textContent = film.clock[1]; place(clocks[0], 140, 26); place(clocks[1], 490, 26);
    } else {
      cell(CX, CY, R); dotsAt(CX, CY, K, 1, false);
      clocks[0].hidden = false; clocks[0].textContent = Math.round(40 * Math.min(1, M.t / MIX_S)) + ' minutes'; place(clocks[0], CX, 26);
    }
    keyEl.hidden = shot === 0;
    cv.setAttribute('aria-label', shot === 0 ? 'A drawing: a mouse cell and a human cell join into one cell.' : shot === 1 ? 'A drawing of the joined cell at 0 minutes: green dots on one half, red dots on the other half.' : 'A drawing of the joined cell after 40 minutes: the green dots and the red dots are mixed over the whole cell.');
  }
  function words() {
    capEl.innerHTML = `<span class="lv lv--sl">${esc(levelName)} <i>${esc(code)}</i></span> ` + film.shots.map((s, k) => k > shot ? '' : `<span class="${k < shot ? 'is-was' : 'is-now'}">${esc(s.say)}</span>`).join(' ');
    const last = shot === film.shots.length - 1;
    navEl.innerHTML = (shot ? '<button type="button" data-mix="back">← Back</button>' : '') + (last ? '<button type="button" data-mix="again">↻ Watch again</button>' : `<button type="button" class="memv__mixnext" data-mix="next"${done ? '' : ' disabled'}>Next →</button>`);
    if (last) navEl.querySelector('[data-mix="again"]').disabled = !done;
    /* its buttons in view (the sheet scrolls; Back and Next of the step stand over its foot) */
    navEl.scrollIntoView({ block: 'nearest', behavior: FAST ? 'auto' : 'smooth' });
  }
  const length = () => shot === 0 ? JOIN_S : shot === 1 ? MARK_S : MIX_S;
  function finish() { done = true; words(); }
  function tick(now) {
    if (stopped) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60); last = now;
    if (!done) {
      t += dt;
      if (shot === 2) { let n = Math.max(1, Math.round(dt * 60)); while (n-- > 0 && M.t < MIX_S) M.step(1 / 60); }
      draw();
      if (t >= length() && (shot !== 2 || M.t >= MIX_S)) finish();
    }
    raf = requestAnimationFrame(tick);
  }
  function go(k) {
    shot = k; t = 0; done = false; last = 0;
    M = mixSim();
    if (FAST) { if (k === 2) { for (let i = 0; i < MIX_S * 60; i++) M.step(1 / 60); } draw(); done = true; }
    words(); if (!FAST) draw();
  }
  navEl.addEventListener('click', e => {
    const b = e.target.closest('[data-mix]'); if (!b || b.disabled) return;
    if (b.dataset.mix === 'next') go(shot + 1); else if (b.dataset.mix === 'back') go(shot - 1); else go(0);
  });
  go(0);
  if (!FAST) raf = requestAnimationFrame(tick);
  return { stop() { stopped = true; cancelAnimationFrame(raf); }, get shot() { return shot; }, state: () => ({ shot, done, t: M.t, mixed: M.mixed(), n: M.dots.length, fast: FAST }) };
}
