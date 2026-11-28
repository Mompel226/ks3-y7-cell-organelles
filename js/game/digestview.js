/* ============================================================
   digestview.js — the test's two close views, drawn (18 Nov 2026; the places planner's plan-test, step 2). digest.js has
   the numbers; this file draws them into the spotting tile's own SVG, under the wells, while the clock runs, with a
   course on (IGCSE or IB): Year 7's picture of the test does not change.

   Well A: one short piece of a starch chain (16 glucose units) and one amylase molecule, at sizes true to one another
   (a 5 nm bar), moving at random; each time a bond of the chain has come to lie in amylase's active site, that bond
   breaks and the two pieces leave; at 5 minutes every piece has two units: maltose (0610 7.4.6(a)). Well B: the same
   chain, no amylase: it moves and stays whole.
   - Each name stands beside what it names, joined to it by a short line, clear of every glucose unit, of amylase's
     body and of the other names: "starch" by the longest piece that is left, "amylase", and "maltose" by a piece of
     two units.
   - IGCSE (5.1.1): after its first cut the enzyme's name reads "amylase · not changed".
   - IB (SL, B1.1.3): for each bond broken one water molecule, named "water", goes into that bond, and a count is
     built: "hydrolysis · bonds broken: n · water used: n". At HL (C1.1.11) a line says where this happens: "well A:
     extracellular, outside the cells that made the enzyme".
   - Under the views, first: this is a model, its speed is not the real speed, and which water is drawn. Then well
     A's word equation is built as its parts appear, its arrow drawn, with "amylase" over the arrow: IGCSE "well A:
     starch → maltose"; IB "well A: starch + water → maltose".
   No colour of the iodine test is drawn in a close view (no course line says why the colour forms), no rate and no
   time for one bond (the class measures that: bench.js).
   closeViews(svg, { igcse, ib, hl }) → { at(k), off(), state() }   k: 0 … 1 of the five minutes
   ============================================================ */
import { run, UNIT, ENZ, BOX, TICKS } from './digest.js?v=202611281627';
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, text) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); if (text != null) e.textContent = text; return e; };
const SZ = 208, K = SZ / BOX, TOP = 372, INK = '#E8EDF4';
export function closeViews(svg, lv) {
  const old = svg.querySelector('#zoom'); if (old) old.remove();
  /* (a phone: the tile is about 330 px wide, so each unit of the drawing is about half a pixel: the words are drawn
     1.55 times larger, in shorter lines, and the drawing is taller) */
  const big = (svg.getBoundingClientRect().width || 600) < 440, f = big ? 1.55 : 1;
  /* (a laptop, 18 Nov 2026: where the box is wide enough the lines stand BESIDE the two views, in a drawing 992 wide,
     not under them: the whole tile then shows at nearly its full size. With the lines under the views the drawing had
     to give way to keep the tile and its caption in the box, and at the result its words were drawn at two thirds of
     their size. The layout is the one in which the drawing is drawn larger) */
  const tb = svg.closest('.testbox'), fig = svg.closest('.tile'), aw = tb ? tb.clientWidth - 36 : 0, ah = tb ? tb.clientHeight - 36 - 110 : 0;
  const wide = !big && aw > 0 && Math.min(aw / 992, ah / 612) > Math.min(560 / 600, ah / 760), LX = wide ? 540 : 86;
  if (fig) fig.classList.toggle('tile--wide', wide);
  const g = el('g', { id: 'zoom', 'font-weight': 700, fill: INK }); svg.appendChild(g);
  const defs = el('defs'); g.appendChild(defs);
  const hex = [0, 1, 2, 3, 4, 5].map(i => { const a = Math.PI / 6 + i * Math.PI / 3, r = UNIT * K * 0.56; return (r * Math.cos(a)).toFixed(2) + ',' + (r * Math.sin(a)).toFixed(2); }).join(' ');
  const sims = { A: run(), B: run({ enzyme: false }) }, views = {};
  const make = (key, cx, title) => {
    const x0 = cx - SZ / 2, sim = sims[key], v = el('g', { class: 'zoom__v', 'data-v': key }); g.appendChild(v);
    defs.appendChild(el('clipPath', { id: 'zc' + key })).appendChild(el('rect', { x: x0, y: TOP, width: SZ, height: SZ, rx: 24 }));
    v.appendChild(el('line', { class: 'zoom__link', x1: cx, y1: 306, x2: cx, y2: TOP - 22, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '3 5' }));   /* (from the well's name to its close view; main.js hides it once the colour key stands in that row) */
    v.appendChild(el('rect', { x: x0, y: TOP, width: SZ, height: SZ, rx: 24, fill: '#141A3C', stroke: INK, 'stroke-width': 2 }));
    const tt = el('text', { x: cx, y: TOP - 8, 'text-anchor': 'middle', 'font-size': 14.5 * f }, title); v.appendChild(tt);
    const in_ = el('g', { 'clip-path': `url(#zc${key})` }); v.appendChild(in_);
    const P = (x, y) => [cx + x * K, TOP + SZ / 2 - y * K];
    const n = sim.pieces0.reduce((s, p) => s + p.n, 0);
    const bonds = [...Array(n - 1)].map(() => in_.appendChild(el('line', { stroke: '#F3E7C4', 'stroke-width': 2.4, 'stroke-linecap': 'round' })));
    const enz = sim.enzyme ? in_.appendChild(el('g')) : null;
    if (enz) { const rx = ENZ.L / 2 * K, ry = ENZ.W / 2 * K;
      /* amylase: its outline as long and as wide as the molecule, its active site a groove in the middle of one long side */
      /* (the second science read: the outline was fuller than the ellipse digest.js keeps free pieces off, so a piece
         lay on its edge; now it is that ellipse) */
      const kp = 0.5523;
      enz.appendChild(el('path', { d: `M ${-rx} 0 C ${-rx} ${-ry * kp}, ${-rx * kp} ${-ry}, -10 ${-ry * 0.985} C -7 ${-ry * 0.55}, 7 ${-ry * 0.55}, 10 ${-ry * 0.985} C ${rx * kp} ${-ry}, ${rx} ${-ry * kp}, ${rx} 0 C ${rx} ${ry * kp}, ${rx * kp} ${ry}, 0 ${ry} C ${-rx * kp} ${ry}, ${-rx} ${ry * kp}, ${-rx} 0 Z`, fill: '#F6B84A', stroke: '#8A5A12', 'stroke-width': 2, opacity: 0.93 }));
      enz.appendChild(el('path', { d: `M -10 ${-ry * 0.985} C -7 ${-ry * 0.55}, 7 ${-ry * 0.55}, 10 ${-ry * 0.985}`, fill: 'none', stroke: '#6B3F06', 'stroke-width': 3.2 })); }
    const units = [...Array(n)].map(() => in_.appendChild(el('polygon', { points: hex, fill: '#F3E7C4', stroke: '#8C7B4A', 'stroke-width': 1 })));
    const water = sim.enzyme && lv.ib ? in_.appendChild(el('circle', { r: big ? 3.6 : 2.4, fill: '#7FD0FF', stroke: '#E8F7FF', 'stroke-width': 1, visibility: 'hidden' })) : null;   /* (a water molecule is smaller than a glucose unit) */
    /* the scale bar: 5 nm, under the view (inside it, a piece could lie on it) */
    v.appendChild(el('line', { x1: x0 + 4, y1: TOP + SZ + 12, x2: x0 + 4 + 5 * K, y2: TOP + SZ + 12, stroke: INK, 'stroke-width': 3 }));
    v.appendChild(el('text', { x: x0 + 4 + 5 * K + 8, y: TOP + SZ + 12 + 4.5 * f, 'font-size': 13 * f }, '5 nm'));
    /* a name: its words beside what it names, and a short line from the words to it (the science read: names lay on
       the molecules and on one another, and hid glucose units) */
    const tag = () => { const l = el('line', { stroke: INK, 'stroke-width': 1.4, visibility: 'hidden' }), t = el('text', { 'font-size': 14.5 * f, 'text-anchor': 'middle', stroke: '#141A3C', 'stroke-width': 3.5, 'paint-order': 'stroke', visibility: 'hidden' }); v.append(l, t); t.line = l; return t; };
    views[key] = { sim, P, bonds, units, enz, water, cx, x0, malId: -1, tags: { starch: tag(), maltose: tag(), amylase: tag(), water: tag() } };
  };
  make('A', 190, 'well A, close up');   /* (a phone too: its box scrolls to the views, so the wells are out of sight) */
  make('B', 410, big ? 'well B: no amylase' : 'well B, close up: no amylase');
  /* the lines under the views, one under another (a phone: each sentence in two lines) */
  let y = wide ? TOP - 8 : TOP + SZ + (big ? 24 : 18);   /* (under the scale bars; in the wide drawing, beside the views, from their top) */
  const line = (text, size, o = {}) => { y += size * 1.32; const t = el('text', Object.assign({ x: LX, y: y.toFixed(1), 'font-size': size }, o), text); g.appendChild(t); return t; };
  /* first, that this is a model, and that its speed is not the real speed (the science read: the count beside the
     clock read as a rate) */
  { const wat = lv.ib ? 'Only the water molecules that are used are drawn.' : 'The water is not drawn.';   /* (the second read: one named water molecule in an empty view said that the rest is not water) */
    (big ? ['A model: a real starch chain has hundreds', 'of glucose units.', 'The picture\'s speed is not the real speed.', wat] : ['A model: a real starch chain has hundreds of glucose units.', 'The picture\'s speed is not the real speed. ' + (lv.ib ? '' : wat)].concat(lv.ib ? [wat] : [])).flatMap(t => (wide && / The water is not drawn\.$/.test(t) ? [t.replace(/ The water is not drawn\.$/, ''), wat] : [t])).forEach(t => line(t.trim(), (big ? 12.5 : 14) * f, { 'font-weight': 500 })); }
  /* IB at HL (C1.1.11): where this reaction happens */
  if (lv.hl) (big || wide ? ['well A: extracellular,', 'outside the cells that made the enzyme'] : ['well A: extracellular, outside the cells that made the enzyme']).forEach(t => line(t, 14.5 * f));
  /* IB: the count (a phone: in two lines). Then well A's word equation: its arrow is drawn, and "amylase" stands over
     the arrow, for IB too (C1.1.1: an enzyme is a catalyst; the science read: without it, amylase read as no part of
     the reaction, and a line in the middle read as both wells') */
  const count = line('', 16 * f), count2 = big ? line('', 16 * f) : null;
  const eqS = big ? 16 * f : 20, over = line('', big ? 12 * f : 13.5, { 'text-anchor': 'middle' }), eq = line('', eqS);
  const arrow = g.appendChild(el('path', { fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', visibility: 'hidden' })), prod = g.appendChild(el('text', { y: eq.getAttribute('y'), 'font-size': eqS }));
  svg.setAttribute('viewBox', wide ? `0 0 992 ${Math.ceil(Math.max(TOP + SZ + 30, y + 14))}` : `0 0 600 ${Math.ceil(y + 14)}`);
  /* a name stands beside what it names, joined to it by a short line. Its place: of eight directions, the one that
     needs the shortest line while the words keep clear of every glucose unit, of amylase's whole body, of the names
     and lines already placed in this frame and of the view's edge; a name keeps its direction from frame to frame
     while that still fits. With no free place, the name is left out of that frame (the second science read: names
     lay on molecules, on amylase and on one another, and "starch" hid a piece that "maltose" named) */
  const DIRS = [[0, -1], [0, 1], [1, 0], [-1, 0], [0.7, -0.7], [-0.7, -0.7], [0.7, 0.7], [-0.7, 0.7]];
  let obs = { pts: [], enz: null, boxes: [], segs: [] };
  const inEnz = (e, x, y, pad) => { const c = Math.cos(e.a), s = Math.sin(e.a), dx = x - e.x, dy = y - e.y, lx = dx * c - dy * s, ly = dx * s + dy * c; return (lx / (e.rx + pad)) ** 2 + (ly / (e.ry + pad)) ** 2 < 1; };
  /* two lines cross (a name's line never crosses another name's line: the last check read) */
  const cross = (p, q) => { const o = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    return o(p[0], p[1], p[2], p[3], q[0], q[1]) * o(p[0], p[1], p[2], p[3], q[2], q[3]) < 0 && o(q[0], q[1], q[2], q[3], p[0], p[1]) * o(q[0], q[1], q[2], q[3], p[2], p[3]) < 0; };
  const segBox = (sg, b) => { for (let i = 0; i <= 8; i++) { const x = sg[0] + (sg[2] - sg[0]) * i / 8, y = sg[1] + (sg[3] - sg[1]) * i / 8; if (x > b[0] - 2 && x < b[2] + 2 && y > b[1] - 2 && y < b[3] + 2) return true; } return false; };
  const boxHit = (b, V) => {
    if (b[0] < V.x0 + 3 || b[2] > V.x0 + SZ - 3 || b[1] < TOP + 3 || b[3] > TOP + SZ - 3) return true;
    if (obs.pts.some(p => p[0] > b[0] - 5 && p[0] < b[2] + 5 && p[1] > b[1] - 5 && p[1] < b[3] + 5)) return true;
    if (obs.enz) for (let i = 0; i <= 6; i++) for (let j = 0; j <= 2; j++) if (inEnz(obs.enz, b[0] + (b[2] - b[0]) * i / 6, b[1] + (b[3] - b[1]) * j / 2, 3)) return true;
    return obs.boxes.some(o => b[0] < o[2] + 3 && b[2] > o[0] - 3 && b[1] < o[3] + 3 && b[3] > o[1] - 3) || obs.segs.some(sg => segBox(sg, b));
  };
  const hide = t => { t.setAttribute('visibility', 'hidden'); t.line.setAttribute('visibility', 'hidden'); };
  const put = (t, [x, y], text, V, d0 = 9) => {
    const hw = text.length * 3.7 * f + 3, up = 11.5 * f, dn = 4 * f, all = DIRS.map((_, i) => i); let best = null;
    for (const i of (t.dir == null ? all : [t.dir, ...all.filter(j => j !== t.dir)])) { const [ux, uy] = DIRS[i];
      for (let d = d0; d <= d0 + 54; d += 6) {
        const lx = x + (ux ? Math.sign(ux) * (d * Math.abs(ux) + hw) : 0), by = uy < 0 ? y + d * uy - dn : uy > 0 ? y + d * uy + up : y + (up - dn) / 2;   /* (by: the words' baseline) */
        const b = [lx - hw, by - up, lx + hw, by + dn], px = Math.max(b[0], Math.min(b[2], x)), py = Math.max(b[1], Math.min(b[3], y));
        if (boxHit(b, V) || obs.boxes.some(o => segBox([px, py, x, y], o)) || obs.segs.some(sg => cross(sg, [px, py, x, y]))) continue;
        /* (its line crosses no glucose unit but those it ends on: within 2.6 nm of its end they are its own piece's) */
        if (obs.pts.some(q => Math.hypot(q[0] - x, q[1] - y) > 2.6 * K && [1, 2, 3, 4, 5, 6, 7].some(i => Math.hypot(px + (x - px) * i / 8 - q[0], py + (y - py) * i / 8 - q[1]) < 4.5))) continue;
        const cost = d + (i === t.dir ? -14 : 0) + i * 0.4; if (!best || cost < best.cost) best = { cost, i, lx, by, b, px, py };
        break;
      } }
    if (!best) { hide(t); t.dir = null; return false; }
    t.dir = best.i; obs.boxes.push(best.b); obs.segs.push([best.px, best.py, x, y]);
    t.setAttribute('x', best.lx.toFixed(1)); t.setAttribute('y', best.by.toFixed(1)); if (t.textContent !== text) t.textContent = text; t.setAttribute('visibility', 'visible');
    const l = t.line; l.setAttribute('x1', best.px.toFixed(1)); l.setAttribute('y1', best.py.toFixed(1)); l.setAttribute('x2', x.toFixed(1)); l.setAttribute('y2', y.toFixed(1)); l.setAttribute('visibility', Math.hypot(best.px - x, best.py - y) > 5 ? 'visible' : 'hidden');
    return true;
  };
  const S = { tick: -1, cuts: 0, eq: '' };
  function draw(key, tick) {
    const V = views[key], fr = V.sim.frames[tick], done = V.sim.cuts.filter(c => c.t <= tick);
    obs = { pts: [], enz: null, boxes: [], segs: [] };
    let j = 0;
    fr.pieces.forEach(p => { const ux = Math.cos(p.a), uy = Math.sin(p.a);
      for (let i = 0; i < p.n; i++, j++) { const d = (i + 0.5 - p.n / 2) * UNIT, [x, y] = V.P(p.x + ux * d, p.y + uy * d); obs.pts.push([x, y]); V.units[j].setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(-p.a * 180 / Math.PI).toFixed(1)})`);
        if (j < V.bonds.length) { const b = V.bonds[j]; if (i < p.n - 1) { const [x2, y2] = V.P(p.x + ux * (d + UNIT), p.y + uy * (d + UNIT)); b.setAttribute('x1', x.toFixed(1)); b.setAttribute('y1', y.toFixed(1)); b.setAttribute('x2', x2.toFixed(1)); b.setAttribute('y2', y2.toFixed(1)); b.setAttribute('visibility', 'visible'); } else b.setAttribute('visibility', 'hidden'); } } });
    if (V.enz) { const [x, y] = V.P(fr.enz.x, fr.enz.y); V.enz.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(-fr.enz.a * 180 / Math.PI).toFixed(1)})`);
      obs.enz = { x, y, a: fr.enz.a, rx: ENZ.L / 2 * K, ry: ENZ.W / 2 * K };
    }
    /* IB: the water molecule of the bond that is breaking now comes to that bond from the groove's open side, straight
       along the way the groove faces, so never over amylase's body (the third science read: it came from the view's
       corner, and with the groove turned away it crossed the body), named, over 0.25 s. It is placed before the names:
       no name stands on it */
    let wat = null;
    if (V.water) { const c = V.sim.cuts.find(c => tick >= c.t - 44 && tick < c.t);
      if (c) { const e = (tick - (c.t - 44)) / 44, ea = V.sim.frames[c.t - 1].enz.a, nx = -Math.sin(ea), ny = Math.cos(ea), H = BOX / 2 - 0.6;
        let far = 5.5; while (far > 1 && (Math.abs(c.at[0] + nx * far) > H || Math.abs(c.at[1] + ny * far) > H)) far -= 0.25;   /* (it starts inside the view) */
        const d = far * (1 - e), [x, y] = V.P(c.at[0] + nx * d, c.at[1] + ny * d);
        V.water.setAttribute('cx', x.toFixed(1)); V.water.setAttribute('cy', y.toFixed(1)); V.water.setAttribute('visibility', 'visible'); wat = [x, y]; obs.pts.push(wat); }
      else V.water.setAttribute('visibility', 'hidden'); }
    if (V.enz) { const { x, y } = obs.enz;
      /* (amylase's name first: it has the fewest places, outside its own body; IGCSE: the short name when the long one has no place) */
      const long = lv.igcse && !lv.ib && done.length;
      if (!(long && put(V.tags.amylase, [x, y], 'amylase · not changed', V, 30))) put(V.tags.amylase, [x, y], 'amylase', V, 30); }
    if (V.water) { if (wat) { obs.pts.pop(); put(V.tags.water, wat, 'water', V, 7); obs.pts.push(wat); } else hide(V.tags.water); }
    /* "starch" by the longest piece of more than two units; "maltose" by one piece of two units, the same one while it is there */
    /* (if that piece has no free place beside it, another piece of two units: at the end one of them is always named) */
    const long = fr.pieces.filter(p => p.n > 2).sort((a, b) => b.n - a.n)[0], twos = fr.pieces.filter(p => p.n === 2).sort((a, b) => (b.id === V.malId) - (a.id === V.malId));
    if (long) put(V.tags.starch, V.P(long.x, long.y), 'starch', V); else hide(V.tags.starch);
    { const got = twos.find(p => { if (p.id !== V.malId) V.tags.maltose.dir = null; return put(V.tags.maltose, V.P(p.x, p.y), 'maltose', V); }); if (got) V.malId = got.id; else hide(V.tags.maltose); }
    return { cuts: done.length, maltose: fr.pieces.filter(p => p.n === 2).length, whole: fr.pieces.length === V.sim.pieces0.length };
  }
  function at(k) {
    const tick = Math.max(0, Math.min(TICKS, Math.round(k * TICKS))); if (tick === S.tick) return;
    const a = draw('A', tick), b = draw('B', tick);
    S.tick = tick; S.cuts = a.cuts; S.maltose = a.maltose; S.wholeB = b.whole;
    const cnt = lv.ib && a.cuts ? ['hydrolysis · bonds broken: ' + a.cuts, 'water used: ' + a.cuts] : ['', ''];
    if (count2) { count.textContent = cnt[0]; count2.textContent = cnt[1]; } else count.textContent = cnt[0] ? cnt.join(' · ') : '';
    /* the word equation of well A, built as its parts appear */
    const left = 'well A: ' + (a.cuts && lv.ib ? 'starch + water' : 'starch');
    S.eq = left.slice(8) + (a.cuts ? ' →' + (a.maltose ? ' maltose' : '') : ''); S.over = a.cuts ? 'amylase' : '';
    eq.textContent = left; over.textContent = S.over; prod.textContent = a.cuts && a.maltose ? 'maltose' : '';
    if (a.cuts) { let w = left.length * eqS * 0.5; try { w = eq.getComputedTextLength() || w; } catch (e) { /* (not drawn yet) */ }
      const x0 = LX + w + 7 * f, x1 = x0 + (big ? 40 : 66) * f, ya = +eq.getAttribute('y') - eqS * 0.3, h = 5 * f;
      arrow.setAttribute('d', `M${x0.toFixed(1)} ${ya.toFixed(1)}H${x1.toFixed(1)}M${(x1 - h * 1.3).toFixed(1)} ${(ya - h).toFixed(1)}L${x1.toFixed(1)} ${ya.toFixed(1)}L${(x1 - h * 1.3).toFixed(1)} ${(ya + h).toFixed(1)}`);
      over.setAttribute('x', ((x0 + x1) / 2).toFixed(1)); over.setAttribute('y', (ya - h - 3).toFixed(1)); prod.setAttribute('x', (x1 + 7 * f).toFixed(1)); }
    arrow.setAttribute('visibility', a.cuts ? 'visible' : 'hidden');
  }
  at(0);
  return { at, off: () => { g.remove(); svg.setAttribute('viewBox', '0 0 600 348'); if (fig) fig.classList.remove('tile--wide'); }, state: () => ({ ...S, wide }), still: sims.A.cuts.length ? (sims.A.cuts[0].t - 3) / TICKS : null };   /* (still: just before the first cut, for Reduce motion's first still) */
}
