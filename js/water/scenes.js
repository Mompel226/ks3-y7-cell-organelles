/* ============================================================
   scenes.js — the twelve pictures of the water-potential view (16 Nov 2026). 2D only: inline SVG drawn for the stage's
   own size in pixels (so the words on it are the same size on a laptop and on a phone), with HTML captions and names
   that view.js places. A scene: SCENES[name](ctx), ctx = { W, H, narrow, g, fs, lh } → { dur, frame(t), caps, labels,
   note }:
     frame(t), t from 0 to 1: the picture at that moment of its motion (t = 1 is the end state, the only state shown
       with Reduce motion);
     caps: words on the picture [{ id, x, y, w, html, al l|c|r, va t|m|b, when s|e }] ('e': shown when the motion ends);
     labels: names with a line [{ id, text, x, y (the point on the part), side L|R|T|B, col (the edge of the name
       nearest the part), pin [dx, dy] (on a phone: the numbered pin's place, from the point) }].
   Since 17 Nov 2026 (memory teach-on-the-picture): a caption or a name may carry `card`, the id of a card of its step
   (text.js): view.js makes it a button; the parts of the picture wear data-p="<card id> …" so that the pressed card's
   part stays bright and the others dim (view.js focus). A scene may be `live`: it goes on after its first motion
   (the two liquids of steps 2 and 3, liquid.js; the contractile vacuoles of step 5), with one still for Reduce motion.
   The rules drawn in (memories concentration-pictures-equal-volumes, particle-model-in-diagrams): a concentration is
   always particles in EQUAL volumes; liquid water is molecules that touch; a movement arrow is one filled shape with a
   head of fixed size, its shaft's width showing the rate. Shapes are not to scale unless a value is cited (text.js).
   ============================================================ */
import { PIC } from './text.js?v=202611282133';
import { LIQ, RUNS, MIX, makeLiquid } from './liquid.js?v=202611282133';

const NS = 'http://www.w3.org/2000/svg';
const D = Math.PI / 180;
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const ease = x => x * x * (3 - 2 * x);
const lerp = (a, b, k) => a + (b - a) * k;
const f1 = n => Math.round(n * 10) / 10;

function mk(tag, a, p) {
  const e = document.createElementNS(NS, tag);
  if (a) for (const k in a) if (a[k] != null) e.setAttribute(k, typeof a[k] === 'number' ? f1(a[k]) : a[k]);
  if (p) p.appendChild(e);
  return e;
}
/* words drawn in the SVG itself (a symbol, a value): data-on names the colour they stand on, for the contrast check */
function stext(p, x, y, s, size, on, a = {}) {
  const e = mk('text', Object.assign({ x, y, class: 'wa-t', 'font-size': size, 'data-on': on }, a), p);
  if (Array.isArray(s)) s.forEach(([w, sub]) => { const t = mk('tspan', sub ? { 'font-size': '72%', dy: sub } : null, e); t.textContent = w; });
  else e.textContent = s;
  return e;
}
const psi = k => [['ψ'], [k, 4], [' ', -4]];
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
/* a group of the picture that belongs to a card (or to several: 'water ion') */
const part = (p, id) => mk('g', { 'data-p': id }, p);
const cap = (id, x, y, w, html, o = {}) => Object.assign({ id, x, y, w, html, al: 'c', va: 't', when: 's' }, o);
const pathOf = (P, close = true) => 'M' + P.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L') + (close ? ' Z' : '');

/* a movement arrow: one filled shape; the head keeps its size, the shaft's width is the rate */
function arrowD(x0, y0, x1, y1, w, hl = 15) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
  if (L < 0.5) return 'M0 0';
  const ux = dx / L, uy = dy / L, nx = -uy, ny = ux, h = Math.min(hl, L), hw = Math.max(w / 2, Math.max(w / 2 + 6, 9) * h / hl), s = w / 2;
  const bx = x1 - ux * h, by = y1 - uy * h;
  return pathOf([[x0 + nx * s, y0 + ny * s], [bx + nx * s, by + ny * s], [bx + nx * hw, by + ny * hw], [x1, y1], [bx - nx * hw, by - ny * hw], [bx - nx * s, by - ny * s], [x0 - nx * s, y0 - ny * s]]);
}
function arrow(p, cls = 'wa-arrow') {
  const e = mk('path', { class: cls, d: 'M0 0' }, p);
  return { el: e, set(x0, y0, x1, y1, w, k = 1) { e.setAttribute('d', k <= 0.002 ? 'M0 0' : arrowD(x0, y0, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, w)); } };
}
/* particles spread evenly in a box (best candidate of 30, fixed seed) */
function spread(n, x, y, w, h, r, rand) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    let best = null, bd = -1;
    for (let c = 0; c < 30; c++) {
      const px = x + r + rand() * (w - 2 * r), py = y + r + rand() * (h - 2 * r);
      let d = 2 * Math.min(px - x, x + w - px, py - y, y + h - py);
      for (const q of pts) d = Math.min(d, Math.hypot(px - q[0], py - q[1]));
      if (d > bd) { bd = d; best = [px, py]; }
    }
    pts.push(best);
  }
  return pts;
}
/* a water molecule: an oxygen atom and two hydrogen atoms at 104.5° (a: the direction from the oxygen to between the hydrogens) */
function water(p, s) {
  const g = mk('g', null, p), o = mk('circle', { r: 13 * s, class: 'wa-o' }, g);
  const h = [mk('circle', { r: 7.5 * s, class: 'wa-h' }, g), mk('circle', { r: 7.5 * s, class: 'wa-h' }, g)];
  const A = 52.25 * D, B = 11 * s; let hp = [[0, 0], [0, 0]];
  return { g, hs: () => hp, place(x, y, a) {
    o.setAttribute('cx', f1(x)); o.setAttribute('cy', f1(y));
    hp = [a + A, a - A].map(b => [x + B * Math.cos(b), y + B * Math.sin(b)]);
    hp.forEach((q, i) => { h[i].setAttribute('cx', f1(q[0])); h[i].setAttribute('cy', f1(q[1])); });
  } };
}
/* a rectangle with rounded corners whose sides bow outwards by b (a cell wall under pressure) */
function bulgeRect(x, y, w, h, r, b) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${f1(x + r)} ${f1(y)}Q${f1(x + w / 2)} ${f1(y - 2 * b)} ${f1(x + w - r)} ${f1(y)}Q${f1(x + w)} ${f1(y)} ${f1(x + w)} ${f1(y + r)}`
    + `Q${f1(x + w + 2 * b)} ${f1(y + h / 2)} ${f1(x + w)} ${f1(y + h - r)}Q${f1(x + w)} ${f1(y + h)} ${f1(x + w - r)} ${f1(y + h)}`
    + `Q${f1(x + w / 2)} ${f1(y + h + 2 * b)} ${f1(x + r)} ${f1(y + h)}Q${f1(x)} ${f1(y + h)} ${f1(x)} ${f1(y + h - r)}`
    + `Q${f1(x - 2 * b)} ${f1(y + h / 2)} ${f1(x)} ${f1(y + r)}Q${f1(x)} ${f1(y)} ${f1(x + r)} ${f1(y)}Z`;
}
/* a plant cell: wall, plasma membrane round the cytoplasm, the vacuole, a nucleus, chloroplasts, and turgor arrows.
   set({ cx, cy, w, h, bulge, shrink 0..1 (plasmolysis), press 0..1 (the turgor arrows' strength) }) */
function plantCell(p, tw, chl = true, nucAt = 0.66) {
  const g = mk('g', null, p);
  const wall = mk('path', { class: 'wa-wall', 'stroke-width': tw }, g), pro = mk('path', { class: 'wa-pm' }, g), vac = mk('path', { class: 'wa-vac' }, g);
  const nuc = mk('ellipse', { class: 'wa-nuc' }, g), ch = chl ? Array.from({ length: 8 }, () => mk('ellipse', { class: 'wa-chl' }, g)) : [];
  const pr = Array.from({ length: 4 }, () => arrow(g, 'wa-press'));
  const C = { g, geo: null, set(s) {
    const { cx, cy, w, h, bulge = 0, shrink = 0, press = 0 } = s;
    wall.setAttribute('d', bulgeRect(cx - w / 2, cy - h / 2, w, h, 9, bulge));
    const iw = w - tw, ih = h - tw, ix = cx - iw / 2, iy = cy - ih / 2, mn = Math.min(iw, ih);
    const d = shrink * 0.2 * mn, pw = iw - 2 * d, ph = ih - 2 * d, px = cx - pw / 2, py = cy - ph / 2, pb = bulge * (1 - shrink);
    const pr0 = 6 + shrink * 0.42 * Math.min(pw, ph);
    pro.setAttribute('d', bulgeRect(px, py, pw, ph, pr0, pb));
    const c = Math.max(4, 0.13 * mn), vw = pw - 2 * c, vh = ph - 2 * c;
    vac.setAttribute('d', bulgeRect(px + c, py + c, vw, vh, Math.max(3, pr0 - c * 0.6), pb));
    const rn = Math.max(4, c * 1.05), nx = px + c * 0.55 + rn * 0.8 + shrink * pw * 0.1, ny = py + ph * nucAt;
    nuc.setAttribute('cx', f1(nx)); nuc.setAttribute('cy', f1(ny)); nuc.setAttribute('rx', f1(rn)); nuc.setAttribute('ry', f1(rn * 0.82));
    const A = [[0.3, 0, 1], [0.7, 0, 1], [0.32, 1, 1], [0.72, 1, 1], [0, 0.3, 0], [1, 0.32, 0], [1, 0.7, 0], [0, 0.14, 0]];
    ch.forEach((e, i) => { const [fx, fy, hor] = A[i], ex = px + c / 2 + fx * (pw - c), ey = py + c / 2 + fy * (ph - c), a = c * 0.42, b = c * 0.26;
      e.setAttribute('cx', f1(ex)); e.setAttribute('cy', f1(ey)); e.setAttribute('rx', f1(hor ? a : b)); e.setAttribute('ry', f1(hor ? b : a)); });
    const L = Math.min(c + 0.16 * mn, 0.34 * mn), aw = Math.max(3, mn * 0.05);
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([sx, sy], i) => {
      const ex = cx + sx * (iw / 2 + (sx ? pb : 0)) - sx * 2, ey = cy + sy * (ih / 2 + (sy ? pb : 0)) - sy * 2;
      pr[i].set(ex - sx * L, ey - sy * L, ex, ey, aw, press); pr[i].el.style.opacity = press > 0.01 ? 1 : 0; });
    C.geo = { ix, iy, iw, ih, px, py, pw, ph, c, vx: px + c, vy: py + c, vw, vh, pb, nuc: [nx, ny, rn] };
  } };
  return C;
}
/* a red blood cell seen from the side: the biconcave disc (the shape of Evans and Fung's measured profile, here only as a
   shape), the sphere it swells to (the same membrane area), and the shrunken, crenated cell */
const EF = r => 0.5 * Math.sqrt(Math.max(0, 1 - r * r)) * (0.207 + 2.003 * r * r - 1.123 * r ** 4);
const RN = 120;
function rbcShape(R, kind, k) {
  return Array.from({ length: RN }, (_, i) => {
    const a = i / RN * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a);
    const disc = [R * c, (s > 1e-9 ? 1 : s < -1e-9 ? -1 : 0) * R * EF(Math.abs(c))];
    if (kind === 'sphere') return [lerp(disc[0], 0.84 * R * c, k), lerp(disc[1], 0.84 * R * s, k)];
    if (kind === 'cren') {
      const ax = 0.74 * R, by = 0.4 * R, bx = ax * c, bz = by * s, n = Math.hypot(by * c, ax * s) || 1, sp = 0.075 * R * Math.max(0, Math.cos(14 * a)) ** 3 * k;
      return [lerp(disc[0], bx, k) + sp * by * c / n, lerp(disc[1], bz, k) + sp * ax * s / n];
    }
    return disc;
  });
}
function rbc(p, cx, cy, R) {
  const g = mk('g', null, p), fill = mk('path', { class: 'wa-rbcin' }, g), line = mk('path', { class: 'wa-rbc' }, g);
  const dots = Array.from({ length: 7 }, () => mk('circle', { r: Math.max(1.6, R * 0.035), class: 'wa-leak', opacity: 0 }, g));
  return { g, set(kind, k, burst = 0) {
    const P = rbcShape(R, kind, k).map(q => [cx + q[0], cy + q[1]]);
    fill.setAttribute('d', pathOf(P)); fill.style.opacity = String(1 - 0.85 * burst);
    if (burst > 0) {
      const i0 = Math.round(RN * 312 / 360), gw = Math.max(1, Math.round(burst * 7)), Q = [];
      for (let j = gw; j <= RN - gw; j++) Q.push(P[(i0 + j) % RN]);
      line.setAttribute('d', pathOf(Q, false)); line.setAttribute('class', 'wa-rbc wa-ghost');
      const [gx, gy] = P[i0];
      dots.forEach((e, j) => { const a = (-60 + (j - 3) * 14) * D, d = R * (0.05 + 0.75 * burst * (0.6 + 0.4 * ((j * 37) % 7) / 7));
        e.setAttribute('cx', f1(gx + d * Math.cos(a))); e.setAttribute('cy', f1(gy + d * Math.sin(a))); e.setAttribute('opacity', f1(Math.sin(Math.PI * Math.min(1, burst * 1.1)) * 0.9)); });
    } else { line.setAttribute('d', pathOf(P)); line.setAttribute('class', 'wa-rbc'); dots.forEach(e => e.setAttribute('opacity', 0)); }
    return P;
  } };
}
/* a test tube or a beaker of solution (equal volumes: the same level in the same vessel) */
function tube(p, x, y, w, h, level, n, rs, rand, upper = 1) {
  const r = w / 2, liq = y + h * (1 - level);
  mk('path', { d: `M${f1(x)} ${f1(liq)}L${f1(x)} ${f1(y + h - r)}A${f1(r)} ${f1(r)} 0 0 0 ${f1(x + w)} ${f1(y + h - r)}L${f1(x + w)} ${f1(liq)}Z`, class: 'wa-liq' }, p);
  const pts = spread(n, x + 2, liq + 3, w - 4, (h * level - r - 3) * upper, rs + 1, rand);
  const dots = pts.map(q => mk('circle', { cx: q[0], cy: q[1], r: rs, class: 'wa-s' }, p));
  mk('path', { d: `M${f1(x)} ${f1(y)}L${f1(x)} ${f1(y + h - r)}A${f1(r)} ${f1(r)} 0 0 0 ${f1(x + w)} ${f1(y + h - r)}L${f1(x + w)} ${f1(y)}`, class: 'wa-glass' }, p);
  return { dots, liq };
}
function beaker(p, x, y, w, h, level) {
  mk('rect', { x: x + 2, y: y + h * (1 - level), width: w - 4, height: h * level - 2, rx: 4, class: 'wa-liq' }, p);
  mk('path', { d: `M${f1(x - 6)} ${f1(y)}L${f1(x)} ${f1(y + 6)}L${f1(x)} ${f1(y + h - 6)}Q${f1(x)} ${f1(y + h)} ${f1(x + 6)} ${f1(y + h)}L${f1(x + w - 6)} ${f1(y + h)}Q${f1(x + w)} ${f1(y + h)} ${f1(x + w)} ${f1(y + h - 6)}L${f1(x + w)} ${f1(y)}`, class: 'wa-glass' }, p);
  return y + h * (1 - level);
}
/* bars of potentials on one zero line: set([ψs, ψp, ψw]) in relative units */
function bars(p, x0, yz, bw, gap, u1, ids = []) {
  const R = ['wa-psis', 'wa-psip', 'wa-psiw'].map((c, i) => mk('rect', { class: c, width: bw }, ids[i] ? part(p, ids[i]) : p));
  mk('line', { x1: x0 - 12, x2: x0 + 3 * bw + 2 * gap + 12, y1: yz, y2: yz, class: 'wa-axis' }, p);
  return { xs: [0, 1, 2].map(i => x0 + i * (bw + gap) + bw / 2), set(v) {
    v.forEach((a, i) => { const h = Math.abs(a) * u1; R[i].setAttribute('x', f1(x0 + i * (bw + gap))); R[i].setAttribute('y', f1(a < 0 ? yz : yz - h)); R[i].setAttribute('height', f1(Math.max(0.01, h))); });
  } };
}
function kidneyD(cx, cy, rx, ry, rot) {
  const P = Array.from({ length: 96 }, (_, i) => { const a = i / 96 * 2 * Math.PI, x = rx * Math.cos(a); let y = ry * Math.sin(a) * (1 + 0.12 * Math.cos(2 * a));
    y += 0.95 * ry * Math.exp(-(((a - 1.5 * Math.PI) / 0.5) ** 2)); const c = Math.cos(rot), s = Math.sin(rot); return [cx + x * c - y * s, cy + x * s + y * c]; });
  return pathOf(P);
}

/* ======================================================================================================== */
/* 1. Solvation: an ion of each charge and a polar molecule, each surrounded by water molecules */
function solvate(c) {
  const { W, H, narrow: N, g, lh } = c, P = PIC.solvate, m = N ? 10 : 22, rand = rng(5), caps = [];
  /* the key: one water molecule with its partial charges, and what the dashed line is */
  const ks = N ? 1.25 : 2, keyH = N ? 74 : 112, kx = m + 20 * ks, ky = m + 24 * ks, fsd = N ? 13 : 15;
  const kgp = part(g, 'water'), kw = water(kgp, ks); kw.place(kx, ky, 90 * D);
  stext(kgp, kx, ky - 13 * ks - 5, 'δ−', fsd, '--wv-stage', { 'text-anchor': 'middle' });
  kw.hs().forEach(h => stext(kgp, h[0] + (h[0] < kx ? -3 : 3), h[1] + 7.5 * ks + fsd, 'δ+', fsd, '--wv-stage', { 'text-anchor': h[0] < kx ? 'end' : 'start' }));
  /* (two lines: the name of the molecule is a button, the dashed line's meaning is not) */
  caps.push(cap('key', kx + 30 * ks, ky - lh / 2 - 1, W - m - (kx + 30 * ks), P.water, { al: 'l', va: 'm', card: 'water' }),
    cap('keyhb', kx + 30 * ks, ky + lh / 2 + 5, W - m - (kx + 30 * ks), `<span class="watv__kg watv__kg--0"><span class="watv__ki watv__ki--hb" aria-hidden="true"></span>${P.hb}</span>`, { al: 'l', va: 'm' }));
  /* the three solute particles, each with the water molecules that touch it (local units, scaled by s) */
  const GW = [96, 118, 172], GH = [96, 118, 176], OY = [0, 0, -6], gap = N ? 4 : 34;
  const capH = (N ? 3 : 2) * lh + 12, top = m + keyH, band = H - top - capH - m;
  const s = Math.max(0.45, Math.min((W - 2 * m - 2 * gap) / (GW[0] + GW[1] + GW[2]), band / GH[2], 2.3));
  const used = GH[2] * s, cy = top + Math.max(0, (band - used) / 2) + used / 2;
  let x = (W - (GW[0] + GW[1] + GW[2]) * s - 2 * gap) / 2;
  const CX = GW.map(w => { const cx = x + w * s / 2; x += w * s + gap; return cx; });
  const groups = [
    { ion: [16, 'wa-na', 'Na⁺', '--wv-na'], ws: [0, 1, 2, 3, 4, 5].map(k => { const a = (-90 + 60 * k) * D; return { x: 29.5 * Math.cos(a), y: 29.5 * Math.sin(a), a }; }), hb: [] },
    { ion: [25, 'wa-cl', 'Cl⁻', '--wv-cl'], ws: [0, 1, 2, 3, 4, 5].map(k => { const a = (-60 + 60 * k) * D; return { x: 43.5 * Math.cos(a), y: 43.5 * Math.sin(a), a: a + Math.PI + (k % 2 ? -1 : 1) * 52.25 * D }; }), hb: [] }
  ];
  /* glucose: the ring (five carbon atoms and one oxygen atom), four -OH groups and -CH2OH; six water molecules joined by
     hydrogen bonds (dashed): three give a hydrogen atom to an oxygen atom of glucose, three take glucose's */
  const ring = [0, 1, 2, 3, 4, 5].map(k => { const a = (-90 + 60 * k) * D; return [20 * Math.cos(a), 20 * Math.sin(a), a]; });
  const OH = [2, 3, 4, 5].map(k => { const [vx, vy, a] = ring[k], ox = vx + 15 * Math.cos(a), oy = vy + 15 * Math.sin(a); return { c: [vx, vy], o: [ox, oy], a }; });
  const C6 = [0, -35], O6 = [C6[0] + 14 * Math.cos(-30 * D), C6[1] + 14 * Math.sin(-30 * D)];
  const hDir = [0, 145, 215, 235].map(d => d * D), gl = { ws: [], hb: [], hg: [] };
  OH.forEach((q, i) => { q.h = [q.o[0] + 10 * Math.cos(hDir[i]), q.o[1] + 10 * Math.sin(hDir[i])]; });
  const H6 = [O6[0] + 10 * Math.cos(10 * D), O6[1] + 10 * Math.sin(10 * D)];
  const accept = (h, dir) => { const o = [h[0] + 30 * Math.cos(dir), h[1] + 30 * Math.sin(dir)]; gl.ws.push({ x: o[0], y: o[1], a: dir }); gl.hb.push([h, o]); };
  const donate = (o, dir, flip) => { const hh = [o[0] + 30 * Math.cos(dir), o[1] + 30 * Math.sin(dir)], ow = [hh[0] + 11 * Math.cos(dir), hh[1] + 11 * Math.sin(dir)]; gl.ws.push({ x: ow[0], y: ow[1], a: dir + Math.PI + flip * 52.25 * D }); gl.hb.push([hh, o]); };
  accept(OH[0].h, 0); donate(OH[1].o, 50 * D, 1); accept(OH[1].h, 145 * D); donate(OH[2].o, 170 * D, -1); accept(OH[3].h, 235 * D); donate(O6, -60 * D, 1);
  groups.push(gl);
  const all = [];
  groups.forEach((G, gi) => {
    const gx = CX[gi], gy = cy - OY[gi] * s, L = (lx, ly) => [gx + lx * s, gy + ly * s];
    /* the particle's own group, then the group of its water molecules (they belong to the card "water" too) */
    const card = gi < 2 ? 'ion' : 'glu', gS = part(g, card), gW = part(g, 'water ' + card);
    const hbs = G.hb.map(([a, b]) => { const A = L(a[0], a[1]), B = L(b[0], b[1]); return mk('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: 'wa-hb', opacity: 0 }, gS); });
    if (G.ion) {
      const [r, cls, sym, on] = G.ion; mk('circle', { cx: gx, cy: gy, r: r * s, class: cls }, gS);
      if (r * s >= 12) stext(gS, gx, gy + 5, sym, Math.min(17, Math.max(12, r * s * 0.8)), on, { 'text-anchor': 'middle', class: 'wa-t wa-tion' });
    } else {
      /* glucose's own atoms and bonds */
      const B = (a, b) => { const A = L(a[0], a[1]), Z = L(b[0], b[1]); mk('line', { x1: A[0], y1: A[1], x2: Z[0], y2: Z[1], class: 'wa-bond', 'stroke-width': Math.max(1.6, 2.6 * s) }, gS); };
      ring.forEach((v, k) => B(v, ring[(k + 1) % 6])); OH.forEach(q => { B(q.c, q.o); B(q.o, q.h); }); B(ring[0], C6); B(C6, O6); B(O6, H6);
      ring.forEach((v, k) => { const Q = L(v[0], v[1]); mk('circle', { cx: Q[0], cy: Q[1], r: (k === 1 ? 8 : 6.5) * s, class: k === 1 ? 'wa-o' : 'wa-c' }, gS); });
      { const Q = L(C6[0], C6[1]); mk('circle', { cx: Q[0], cy: Q[1], r: 6.5 * s, class: 'wa-c' }, gS); }
      OH.map(q => q.o).concat([O6]).forEach(v => { const Q = L(v[0], v[1]); mk('circle', { cx: Q[0], cy: Q[1], r: 8 * s, class: 'wa-o' }, gS); });
      OH.map(q => q.h).concat([H6]).forEach(v => { const Q = L(v[0], v[1]); mk('circle', { cx: Q[0], cy: Q[1], r: 5 * s, class: 'wa-h' }, gS); });
    }
    G.ws.forEach((w, i) => {
      const mol = water(gW, s), [ex, ey] = L(w.x, w.y), out = Math.atan2(w.y, w.x), far = (28 + 22 * rand()) * s;
      all.push({ mol, ex, ey, ea: w.a, sx: ex + far * Math.cos(out + (rand() - 0.5) * 0.8), sy: ey + far * Math.sin(out + (rand() - 0.5) * 0.8), sa: w.a + (rand() - 0.5) * 4, d: 0.05 + 0.25 * rand() });
    });
    G.hbEl = hbs;
    caps.push(cap('g' + gi, gx, cy + Math.max(...GH) * s / 2 + 8, GW[gi] * s + gap - 4, (N ? [P.naN, P.clN, P.gluN] : [P.na, P.cl, P.glu])[gi], { card }));
  });
  return { dur: 3000, caps, labels: [], note: P.note, frame(t) {
    all.forEach(w => { const k = ease(seg(t, w.d, w.d + 0.62)); w.mol.place(lerp(w.sx, w.ex, k), lerp(w.sy, w.ey, k), lerp(w.sa, w.ea, k)); w.mol.g.style.opacity = String(0.35 + 0.65 * k); });
    const o = f1(seg(t, 0.78, 1)); groups.forEach(G => (G.hbEl || []).forEach(e => e.setAttribute('opacity', o)));
  } };
}

/* 2 and 3. Two solutions with a membrane between them, as liquids whose molecules move at random (liquid.js: what is
   simulated and why; here only how it is drawn). Step 2: a less and a more concentrated solution. Step 3: the cytoplasm
   and the solution outside the cell, which a switch of the view changes (c.mode: hypo, iso, hyper). The molecules are
   drawn on the stage's canvas (c.cv; hundreds of circles a frame), under the SVG, which holds what stands still: the
   two containers, the solid parts of the membrane, each solution's level at the start, and what the counts come to
   (an arrow in the air above the liquids, with its words). Two water molecules are followed, each with a ring and the
   path of its last seconds: the first (named) crosses with the net movement in the first seconds, the second crosses
   the other way later, so that nobody concludes that a molecule is pulled. A run stops by itself after END seconds of
   the page (the check counted exactly those), and Reduce motion shows it once, as it stands after STILL seconds (by
   then water has crossed both ways in every run). */
export const END = 60, STILL = 30;
function liquid(c, which) {
  const { W, H, narrow: N, g, lh, cv, css, keep: K } = c, cell = which === 'tonicity', P = PIC[which], caps = [];
  const mode = cell ? (c.mode || 'hypo') : 'osmosis', R = RUNS[mode], dir = Math.sign(MIX[R.R][1] - MIX[R.L][1]);
  const T = LIQ.T, WB = LIQ.WB, H0 = LIQ.H0, UW = 2 * WB + T, UH = H0 + (N ? 9.5 : 12), MT = H0 + 5, m = N ? 8 : 20;     /* (MT: the membrane's top, above any level the liquids reach in a run) */
  /* (a phone: one line of words over each box in step 3, two in step 2; under the boxes the membrane's pin and the key) */
  const swH = cell ? (N ? 44 : 54) : 0, headH = (N ? (cell ? 1 : 2) : 2) * lh + (N ? 14 : 8), belowH = N ? 2 * lh + 50 : 2 * lh + 66, side = N ? 0 : 156;
  const u = Math.max(2.2, Math.min((W - 2 * m - 2 * side) / UW, (H - 2 * m - swH - headH - belowH) / UH, 7.6));
  const top = m + swH + headH, floor = top + UH * u, X = ux => W / 2 + ux * u, Y = uy => floor - uy * u;
  const xl = X(-T / 2 - WB), xm = X(-T / 2), xr = X(T / 2), xe = X(T / 2 + WB);
  if (!K.L || K.mode !== mode) Object.assign(K, { L: makeLiquid(R), mode, acc: 0, done: false, paused: false, sx: null, trail: [[], []], tr: 0, dead: false });
  const L = K.L, n = L.N, hero = R.hero, heroes = [R.hero, R.hero2];
  if (!K.sx) { K.sx = Float32Array.from(L.x); K.sy = Float32Array.from(L.y); K.hs = [L.h[0], L.h[1]]; }

  /* what stands still (SVG): the containers, the membrane's solid parts, the two levels at the start */
  mk('path', { d: `M${f1(xl)} ${f1(top)}L${f1(xl)} ${f1(floor)}L${f1(xe)} ${f1(floor)}L${f1(xe)} ${f1(top)}`, class: 'wa-glass' }, g);
  const gM = part(g, 'mem');
  L.blocks.forEach(([b0, b1]) => { const y0 = Math.max(b0, 0), y1 = Math.min(b1, MT); if (y1 > y0) mk('rect', { x: xm, y: Y(y1), width: xr - xm, height: (y1 - y0) * u, rx: Math.min(2.5, u * 0.5), class: 'wa-mem' }, gM); });
  [[xl, xm], [xr, xe]].forEach(([a, b]) => mk('line', { x1: a + 3, x2: b - 3, y1: Y(H0), y2: Y(H0), class: 'wa-dash wa-start' }, g));
  /* what the counts come to, in the air above the liquids and the membrane: an arrow towards the solution that gains
     water, and its words */
  const ya = Y(H0 + 7.4), ver = arrow(g), reach = WB * 0.5 + T / 2, verdict = dir ? (cell ? P.net[mode] : P.net) : P.none;
  /* (on a phone the words stand under the picture, in the count: view.js; the arrow stays here) */
  const verT = N ? null : stext(g, W / 2, Y(H0 + 9.5), verdict, 16, '--wv-stage', { 'text-anchor': 'middle', class: 'wa-t wa-tb', opacity: 0 });
  /* the followed molecule's name rides with it */
  const tsz = N ? 12.5 : 15, tagG = mk('g', { opacity: 0 }, g), tagR = mk('rect', { rx: 6, class: 'wa-tagbg' }, tagG), tagT = stext(tagG, 0, tsz * 0.36, P.hero, tsz, '--wv-sheet', { 'text-anchor': 'middle' });
  const tw = Math.max(40, tagT.getComputedTextLength() + 14), th = tsz + 9;
  tagR.setAttribute('x', f1(-tw / 2)); tagR.setAttribute('y', f1(-th / 2)); tagR.setAttribute('width', f1(tw)); tagR.setAttribute('height', f1(th));

  if (cell) caps.push(cap('cyto', (xl + xm) / 2, top - 8, xm - xl, P.cyto, { va: 'b', cls: 'h' }), cap('sol', (xr + xe) / 2, top - 8, xe - xr + (N ? 0 : 60), N ? P.solN[mode] : P.sol[mode], { va: 'b', cls: 'h' }));
  else { const cw = N ? xm - xl - 6 : xm - xl + (xr - xm) - 6;      /* (a phone: no wider than its box, or the button would leave the picture) */
    caps.push(cap('left', (xl + xm) / 2, top - 8, cw, N ? P.leftN : P.left, { va: 'b', card: 'tonic' }), cap('right', (xr + xe) / 2, top - 8, cw, N ? P.rightN : P.right, { va: 'b', card: 'tonic' })); }
  const yU = floor + (N ? 38 : 50), key = (cls, t) => `<span class="watv__kg"><span class="watv__ki watv__ki--${cls}" aria-hidden="true"></span>${t}</span>`;
  /* under the boxes: that they start with the same volume, and the key (a phone has no room for the name of the dashed
     line beside the picture: it is a row of the key) */
  if (N) caps.push(cap('legend', W / 2, yU, W - 2 * m, key('w', P.kwN) + key('s', P.ksN) + key('hero', P.heroN) + key('start', P.start)));
  else caps.push(cap('same', W / 2, yU, Math.min(W - 2 * m, UW * u + 2 * side), P.same), cap('legend', W / 2, yU + lh + 8, W - 2 * m, key('w', P.kw) + key('s', P.ks) + key('hero', P.heroK)));
  const labels = [{ id: 'mem', text: P.mem, x: (xm + xr) / 2, y: floor, side: 'B', col: floor + 12, pin: [0, 20], card: cell ? null : 'mem' }];
  if (!N) labels.push({ id: 'start', text: P.start, x: xe, y: Y(H0), side: 'R', col: xe + 14 });

  /* the molecules (canvas) */
  const ctx = cv.getContext('2d'), col = { sol: css('--wv-sol'), w: css('--wv-w'), s: css('--wv-s'), sline: css('--wv-sline'), wx: css('--wv-wx') };
  /* (drawn a little wider than the distance at which two begin to push: molecules that are close are seen to touch) */
  const rw = u * 1.06, rs = LIQ.RS * u * 1.02, TAU2 = 6.2832;
  let focus = '';
  const S = { dur: 600, caps, labels, note: P.note, oy: 0, sw: cell ? { x: W / 2, y: m, w: Math.min(W - 2 * m, 620) } : null, frame() { draw(); },
    focus(id) { focus = id || ''; draw(); } };
  function draw() {
    ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.translate(0, S.oy);
    /* each liquid under its surface, and the water of the pores */
    ctx.globalAlpha = 1; ctx.fillStyle = col.sol;
    ctx.fillRect(xl, Y(K.hs[0]), xm - xl, K.hs[0] * u); ctx.fillRect(xr, Y(K.hs[1]), xe - xr, K.hs[1] * u);
    for (const p of L.py) ctx.fillRect(xm - 1, Y(p + LIQ.PW), xr - xm + 2, 2 * LIQ.PW * u);
    /* the water molecules, each with an edge (two that touch are seen as two); then the solute particles */
    ctx.globalAlpha = focus === 'tonic' ? 0.3 : focus === 'mem' ? 0.55 : 1; ctx.fillStyle = col.w; ctx.beginPath();
    for (let i = 0; i < n; i++) if (!L.sol[i]) { const x = X(K.sx[i]), y = Y(K.sy[i]); ctx.moveTo(x + rw, y); ctx.arc(x, y, rw, 0, TAU2); }
    ctx.fill(); ctx.strokeStyle = col.sol; ctx.lineWidth = Math.max(0.9, u * 0.17); ctx.stroke();
    ctx.globalAlpha = focus === 'mem' ? 0.55 : 1; ctx.fillStyle = col.s; ctx.strokeStyle = col.sline; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < n; i++) if (L.sol[i]) { const x = X(K.sx[i]), y = Y(K.sy[i]); ctx.moveTo(x + rs, y); ctx.arc(x, y, rs, 0, TAU2); }
    ctx.fill(); ctx.stroke();
    /* the two followed water molecules: where each has been in the last seconds, and a ring */
    ctx.strokeStyle = col.wx; ctx.fillStyle = col.wx; ctx.lineJoin = ctx.lineCap = 'round';
    heroes.forEach((h, j) => {
      const tr = K.trail[j];
      if (tr.length > 1) { ctx.lineWidth = Math.max(1.5, u * 0.3); ctx.globalAlpha = (focus ? 0.55 : 1) * 0.6; ctx.beginPath(); tr.forEach((q, i) => i ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1]))); ctx.stroke(); }
      ctx.globalAlpha = focus ? 0.55 : 1;
      const x = X(K.sx[h]), y = Y(K.sy[h]);
      ctx.beginPath(); ctx.arc(x, y, rw, 0, TAU2); ctx.fill();
      ctx.lineWidth = Math.max(1.6, u * 0.3); ctx.beginPath(); ctx.arc(x, y, rw + Math.max(3, u * 0.55), 0, TAU2); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    const hx = X(K.sx[hero]), hy = Y(K.sy[hero]);
    /* its name: above it, or under it where the words of the air band stand; never outside the containers */
    const cxT = Math.max(xl + tw / 2 + 3, Math.min(xe - tw / 2 - 3, hx)), up = hy - rw - 9 - th / 2, cyT = up - th / 2 < Y(H0 + (N ? 4.6 : 5.6)) ? hy + rw + 9 + th / 2 : up;
    tagG.setAttribute('transform', `translate(${f1(cxT)} ${f1(cyT)})`); tagG.setAttribute('opacity', 1);
    /* what the counts come to: shown once the counts have said it (the check: from 6 s on, at least 2 more one way) */
    /* (the isotonic run: once enough molecules have crossed both ways for the two counts to be compared) */
    const secs = L.t / LIQ.SPEED, k = c.FAST ? (K.done ? 1 : 0) : ease(clamp01((secs - (dir ? 8 : 30)) / 1.2));
    if (dir) ver.set(X(-dir * reach), ya, X(dir * reach), ya, N ? 6 : 9, k);
    if (verT) verT.setAttribute('opacity', f1(k)); S.said = k > 0.5;
  }
  S.live = {
    tick(dt) {
      dt = Math.min(dt, 100);
      if (!K.paused && !K.done) {
        K.acc += dt / 1000 * LIQ.SPEED / LIQ.DT; const k = Math.min(14, Math.floor(K.acc)); K.acc -= k; if (k) L.step(k);
        if (L.t >= END * LIQ.SPEED) K.done = true;
        /* what is drawn follows the molecules a tenth of a second behind: their slide past each other shows, not the
           fast shake of each in its place; the surfaces follow more slowly still */
        const a = 1 - Math.exp(-dt / 90), b = 1 - Math.exp(-dt / 700);
        for (let i = 0; i < n; i++) { K.sx[i] += (L.x[i] - K.sx[i]) * a; K.sy[i] += (L.y[i] - K.sy[i]) * a; }
        K.hs[0] += (L.h[0] - K.hs[0]) * b; K.hs[1] += (L.h[1] - K.hs[1]) * b;
        if ((K.tr += dt) >= 80) { K.tr = 0; heroes.forEach((h, j) => { K.trail[j].push([K.sx[h], K.sy[h]]); if (K.trail[j].length > 70) K.trail[j].shift(); }); }
      }
      draw();
    },
    /* Reduce motion: the run as it stands after STILL seconds, once. It is worked out in pieces of a hundredth of a
       second, so that the page never stands still while it waits (a phone needs a second or two for it); K.show
       draws it with the scene that is on the page by then */
    still(then) {
      K.show = () => { K.sx.set(L.x); K.sy.set(L.y); K.hs = [L.h[0], L.h[1]]; draw(); if (then) then(); };
      if (K.done) { K.show(); return; }
      if (K.pump) return;
      const to = STILL * LIQ.SPEED - 1e-9;
      K.pump = () => { if (K.dead) return; const t0 = performance.now(); while (L.t < to && performance.now() - t0 < 10) L.step(30); if (L.t < to) setTimeout(K.pump, 0); else { K.done = true; K.show(); } };
      K.pump();
    },
    stop() { K.dead = true; },
    pause(v) { K.paused = !!v; },
    /* for the tools that film and check: the run as it stands at a second of the page, at once */
    jump(secs) { const per = Math.round(1 / LIQ.DT / 6), to = Math.min(secs, END) * LIQ.SPEED; while (L.t < to - 1e-9) L.step(per); if (L.t >= END * LIQ.SPEED) K.done = true; K.sx.set(L.x); K.sy.set(L.y); K.hs = [L.h[0], L.h[1]]; K.trail = [[], []]; draw(); },
    state: () => ({ mode, dir, secs: L.t / LIQ.SPEED, steps: L.steps, LR: L.c.LR, RL: L.c.RL, h: [L.h[0], L.h[1]], shown: [K.hs[0], K.hs[1]], done: K.done, paused: K.paused, said: !!S.said, seed: R.seed,
      hero: { i: hero, x: X(K.sx[hero]), y: Y(K.sy[hero]) + S.oy, side: L.side[hero] }, hero2: { i: R.hero2, x: X(K.sx[R.hero2]), y: Y(K.sy[R.hero2]) + S.oy, side: L.side[R.hero2] }, box: { l: xl, r: xe, t: top + S.oy, b: floor + S.oy, ml: xm, mr: xr, u }, liquid: L.state() }),
    strip: () => ({ head: P.crossed, a: [(N && P.toN || P.to)[0], L.c.RL], b: [(N && P.toN || P.to)[1], L.c.LR], secs: Math.floor(L.t / LIQ.SPEED + 1e-6), done: K.done, end: END, said: N && S.said ? verdict : '' })
  };
  return S;
}

/* 4. Red blood cells in the three solutions: haemolysis, normal, crenation */
function rbcScene(c) {
  const { W, H, narrow: N, g, lh } = c, P = PIC.rbc, m = N ? 10 : 20, caps = [];
  const gap = N ? 6 : 24, pw = (W - 2 * m - 2 * gap) / 3, titleH = lh + 10, headH = (N ? 2 : 1) * lh + 8, labelH = N ? 0 : 50, capH = (N ? 3 : 2) * lh + 6;
  const R = Math.max(26, Math.min(pw * 0.3, (H - 2 * m - titleH - headH - labelH - capH - 30) / 1.9, 110));
  const ph = 1.9 * R + 30, py = m + titleH + headH;
  caps.push(cap('title', m, m, W - 2 * m, P.title, { al: 'l', cls: 'h' }));
  const cells = [], ax = [];
  ['hypo', 'iso', 'hyper'].forEach((k, i) => {
    const x = m + i * (pw + gap), cx = x + pw / 2, cy = py + ph / 2;
    const gp = part(g, ['burst', 'normal', 'shrink'][i]);
    mk('rect', { x, y: py, width: pw, height: ph, rx: 14, class: 'wa-solbg' }, gp);
    cells.push({ cx, cy, cell: rbc(gp, cx, cy, R) });
    caps.push(cap('h' + i, cx, py - 6, pw, P[k], { va: 'b', cls: 'h' }), cap('r' + i, cx, py + ph + (N ? 8 : 58), pw + gap - 4, [P.burst, P.normal, P.shrink][i], { when: 'e', cls: 'b', card: ['burst', null, 'shrink'][i] }));
    ax.push([arrow(gp), arrow(gp)]);
  });
  /* the arrows stay inside each solution's panel */
  const aw = N ? 5 : 8, la = Math.max(12, Math.min(44, pw / 2 - R - 12));
  /* the plasma membrane named on the cell in the isotonic solution, from below */
  const iso = cells[1], mx = iso.cx + 0.45 * R, my = iso.cy + R * EF(0.45);
  const labels = [{ id: 'mem', text: P.mem, x: mx, y: my, side: 'B', col: py + ph + 10, pin: [0, 22] }];
  return { dur: 4400, caps, labels, note: P.note, frame(t) {
    const kIn = ease(seg(t, 0.12, 0.62)), burst = seg(t, 0.66, 0.96), kOut = ease(seg(t, 0.12, 0.8)), ka = ease(seg(t, 0, 0.14));
    const P0 = cells[0].cell.set('sphere', kIn, burst), P2 = cells[2].cell.set('cren', kOut);
    cells[1].cell.set('disc', 0);
    const h0 = Math.max(...P0.map(q => q[0])) - cells[0].cx + 3, h2 = Math.max(...P2.map(q => q[0])) - cells[2].cx + 3;
    const [c0, c1, c2] = cells;
    ax[0][0].set(c0.cx - h0 - la, c0.cy, c0.cx - h0, c0.cy, aw, ka); ax[0][1].set(c0.cx + h0 + la, c0.cy, c0.cx + h0, c0.cy, aw, ka);
    ax[2][0].set(c2.cx - h2, c2.cy, c2.cx - h2 - la, c2.cy, aw, ka); ax[2][1].set(c2.cx + h2, c2.cy, c2.cx + h2 + la, c2.cy, aw, ka);
    const hx = R + 3, yo = Math.max(6, R * 0.12);
    ax[1][0].set(c1.cx + hx + la, c1.cy - yo, c1.cx + hx, c1.cy - yo, aw * 0.6, ka); ax[1][1].set(c1.cx + hx, c1.cy + yo, c1.cx + hx + la, c1.cy + yo, aw * 0.6, ka);
  } };
}

/* 5. Paramecium in fresh water: water enters by osmosis; the two contractile vacuoles fill and expel it in turn, again
   and again (since 17 Nov 2026 the picture goes on while the reader reads: the step's words say "again and again", and
   one filling, once, did not show it; the words "water is expelled" ride on each jet) */
function protist(c) {
  const { W, H, narrow: N, g, lh, fs } = c, P = PIC.protist, m = N ? 10 : 20, caps = [];
  const side = N ? 0 : 170, topH = lh + 12, belowH = lh + 30, band = N ? 62 : 72;
  const a = Math.max(70, Math.min((W - 2 * m - 2 * side) / 2 - 50, (H - 2 * m - topH - belowH - 2 * band) / 0.84, 300)), b = 0.42 * a;
  const cx = W / 2, cy = m + topH + band + b;
  const L1 = N ? 26 : 42, n = 140, pts = Array.from({ length: n }, (_, i) => { const t = i / n * 2 * Math.PI, s = Math.sin(t); let y = b * s * (1 - 0.1 * Math.cos(t)); if (s > 0) y -= 0.3 * b * Math.exp(-(((t - 1.95) / 0.32) ** 2)); return [cx + a * Math.cos(t), cy + y]; });
  const nor = pts.map((p, i) => { const q = pts[(i + 1) % n], r = pts[(i + n - 1) % n], tx = q[0] - r[0], ty = q[1] - r[1], L = Math.hypot(tx, ty) || 1; return [ty / L, -tx / L]; });
  const cl = N ? 4 : 7; let cil = '';
  pts.forEach((p, i) => { if (i % 2) return; const [nx, ny] = nor[i]; cil += `M${f1(p[0] + nx)} ${f1(p[1] + ny)}l${f1(nx * cl)} ${f1(ny * cl)}`; });
  mk('path', { d: cil, class: 'wa-cilia' }, g);
  mk('path', { d: pathOf(pts), class: 'wa-para' }, g);
  mk('ellipse', { cx: cx + 0.04 * a, cy: cy + 0.1 * b, rx: 0.2 * a, ry: 0.3 * b, class: 'wa-nuc' }, g);
  [[-0.2, 0.35], [0.22, 0.35], [-0.32, 0.05], [0.35, 0.1]].forEach(([fx, fy]) => mk('circle', { cx: cx + fx * a, cy: cy + fy * b, r: 0.06 * b + 2, class: 'wa-food' }, g));
  const top = x => { let best = null; pts.forEach(p => { if (p[1] < cy && (!best || Math.abs(p[0] - x) < Math.abs(best[0] - x))) best = p; }); return best; };
  /* two contractile vacuoles: a round vacuole with canals that radiate from it; above each, where its water leaves */
  const gV = part(g, 'cv'), rc = Math.max(5, 0.2 * b), lc = 0.55 * b, aw = N ? 4 : 6, jet = N ? 30 : 46, fsz = N ? 13 : 16;
  const mkCV = x => {
    const v = { x, y: cy - 0.36 * b }, canals = Array.from({ length: 7 }, () => mk('line', { class: 'wa-cvc', 'stroke-width': Math.max(1.5, rc * 0.28) }, gV)), core = mk('circle', { cx: v.x, cy: v.y, class: 'wa-cv' }, gV);
    const tp = top(x), out = arrow(gV), word = stext(gV, tp[0], tp[1] - jet - 7, P.out, fsz, '--wv-stage', { 'text-anchor': 'middle', opacity: 0 });
    /* where the vacuole is in its cycle, 0..1: it fills (to 0.72), contracts and expels its water (to 0.82), then waits */
    v.set = q => { q -= Math.floor(q);
      const f = q < 0.72 ? 0.15 + 0.85 * ease(q / 0.72) : q < 0.82 ? 1 - 0.85 * ease((q - 0.72) / 0.1) : 0.15;
      const k = q < 0.72 ? 0 : q < 0.8 ? (q - 0.72) / 0.08 : q < 0.93 ? 1 : (1 - q) / 0.07;
      core.setAttribute('r', f1(rc * (0.28 + 0.72 * f)));
      canals.forEach((e, j) => { const an = j / 7 * 2 * Math.PI, L = lc * (0.45 + 0.55 * f); e.setAttribute('x1', f1(v.x)); e.setAttribute('y1', f1(v.y)); e.setAttribute('x2', f1(v.x + L * Math.cos(an))); e.setAttribute('y2', f1(v.y + L * Math.sin(an) * 0.75)); });
      out.set(tp[0], tp[1] + 4, tp[0], tp[1] - jet, aw + 1, q < 0.72 ? 0 : Math.min(1, (q - 0.72) / 0.06)); out.el.style.opacity = String(f1(k)); word.setAttribute('opacity', f1(k)); };
    return v;
  };
  const cvA = mkCV(cx + 0.5 * a), cvB = mkCV(cx - 0.5 * a);
  /* water enters all round (fresh water is hypotonic); no arrow where a name's line runs or where a jet of expelled water
     stands (above each vacuole) */
  const ins = [0, 40, 75, 110, 145, 180, 205, 272, 330].map(dg => { const i = Math.round(dg / 360 * n) % n; return { A: arrow(g), p: pts[i], q: nor[i] }; });
  caps.push(cap('fresh', m, m, W - 2 * m, P.fresh, { al: 'l', cls: 'h' }), cap('name', cx, cy + b + (N ? 30 : 50), Math.min(W - 2 * m, 2 * a), P.name, { cls: 'b' }));
  const left = ins[5], tail = [left.p[0] + left.q[0] * (L1 + 3), left.p[1] + left.q[1] * (L1 + 3)], colL = tail[0] - 14, colR = cx + a + cl + 26;
  const labels = [
    { id: 'enters', text: P.enters, x: tail[0], y: tail[1], side: 'L', col: colL, pin: [0, 24] },
    { id: 'cv', text: P.cv, x: cvA.x + rc + 2, y: cvA.y, side: 'R', col: colR, pin: [0, 26], card: 'cv' }
  ];
  /* one cycle is CYC ms; the two vacuoles are half a cycle apart. At the end of the first motion (and in the one still
     of Reduce motion) the right vacuole has just contracted and its water is leaving; the left one is filling */
  const CYC = 6400, DUR = 4200, at = ms => { const q = ms / CYC + 0.86 - DUR / CYC; cvA.set(q + 2); cvB.set(q + 2.5); };
  let clock = DUR;
  return { dur: DUR, caps, labels, note: P.note, frame(t) {
    const k = ease(seg(t, 0, 0.2));
    ins.forEach(o => o.A.set(o.p[0] + o.q[0] * (L1 + 3), o.p[1] + o.q[1] * (L1 + 3), o.p[0] + o.q[0] * 3, o.p[1] + o.q[1] * 3, aw, k));
    at(t * DUR); if (t < 1) clock = DUR;
  }, live: { tick(dt) { clock += Math.min(dt, 100); at(clock); }, state: () => ({ clock, cycle: CYC }) } };
}

/* 6. Plant cells in the three solutions (turgid, flaccid, plasmolysed), under the red blood cells for comparison */
function plantScene(c) {
  const { W, H, narrow: N, g, lh } = c, P = PIC.plant, m = N ? 10 : 12, caps = [];
  const Lm = N ? 0 : 158, Rm = N ? 0 : 158, gap = N ? 4 : 12;      /* room for a name 150 px wide on each side */
  const cw = (W - 2 * m - Lm - Rm - 2 * gap) / 3, x0 = m + Lm;
  const headH = lh + 8, rowT = lh + 6, capA = lh + 6, capP = (N ? 2 : 1) * lh + 10;
  const Ra = Math.max(16, Math.min(cw * 0.28, 40)), rowA = 2 * 0.84 * Ra + 14;
  const avail = H - 2 * m - headH - 2 * rowT - rowA - capA - capP - 44;
  const pwid = Math.max(44, Math.min(cw * 0.64, avail / 1.3, 170)), phei = pwid * 1.3, tw = Math.max(4, pwid * 0.06);
  const yA = m + headH + rowT, yP = yA + rowA + capA + rowT + 10;
  caps.push(cap('rowA', N ? m : x0, yA - 4, W - 2 * m, P.rowA, { al: 'l', va: 'b', cls: 's' }), cap('rowP', N ? m : x0, yP - 4, W - 2 * m, P.rowP, { al: 'l', va: 'b', cls: 's' }));
  const cells = [];
  ['hypo', 'iso', 'hyper'].forEach((k, i) => {
    const x = x0 + i * (cw + gap), cx = x + cw / 2;
    const gp = part(g, ['turgid', 'flaccid', 'plasmo'][i]);
    caps.push(cap('h' + i, cx, m, cw + gap - 2, P[k], { cls: 'h' }));
    mk('rect', { x, y: yA, width: cw, height: rowA, rx: 10, class: 'wa-solbg' }, gp);
    const r = rbc(gp, cx, yA + rowA / 2, Ra); if (i === 0) r.set('sphere', 1, 1); else if (i === 1) r.set('disc', 0); else r.set('cren', 1);
    caps.push(cap('a' + i, cx, yA + rowA + 3, cw + gap - 2, [P.burst, P.normal, P.shrink][i], { cls: 's' }));
    mk('rect', { x, y: yP, width: cw, height: phei + 30, rx: 10, class: 'wa-solbg' }, gp);
    const cell = plantCell(gp, tw), cy = yP + 15 + phei / 2;
    cells.push({ cx, cy, cell, A: arrow(gp), B: arrow(gp) });
    caps.push(cap('p' + i, cx, yP + phei + 38, cw + gap - 2, [P.turgid, P.flaccid, P.plasmo][i], { when: 'e', cls: 'b', card: ['turgid', 'flaccid', 'plasmo'][i] }));
  });
  const T = { w: pwid, h: phei };
  const S = [k => ({ bulge: pwid * 0.05 * k, shrink: 0, press: seg(k, 0.4, 1) }), () => ({ bulge: 0, shrink: 0, press: 0 }), k => ({ bulge: 0, shrink: k, press: 0 })];
  /* the end states, for the names' points */
  cells.forEach((q, i) => q.cell.set(Object.assign({ cx: q.cx, cy: q.cy }, T, S[i](1))));
  const G0 = cells[0].cell.geo, G2 = cells[2].cell.geo, colR = x0 + 3 * cw + 2 * gap + 14;
  const labels = [
    { id: 'vac', text: P.vac, x: G0.vx + 2, y: cells[0].cy - phei * 0.3, side: 'L', col: x0 - 14, pin: [16, 0] },
    { id: 'press', text: P.press, x: cells[0].cx - G0.iw / 2 - G0.pb - 1, y: cells[0].cy + 0.5, side: 'L', col: x0 - 14, pin: [0, -24] },      /* (the pin above its point: beside it there is no room on a phone) */
    { id: 'wall', text: P.wall, x: cells[2].cx + pwid / 2, y: cells[2].cy - phei * 0.34, side: 'R', col: colR, pin: [22, 0] },
    { id: 'mem', text: P.mem, x: G2.px + G2.pw - 1, y: cells[2].cy + phei * 0.04, side: 'R', col: colR, pin: [0, 22] }
  ];
  /* water arrows below the names' lines, inside each panel */
  const la = Math.max(10, Math.min(30, (cw - pwid) / 2 - 10)), aw = N ? 4 : 6;
  return { dur: 4000, caps, labels, note: P.note, frame(t) {
    const k = ease(seg(t, 0.12, 0.85)), ka = ease(seg(t, 0, 0.14));
    cells.forEach((q, i) => {
      q.cell.set(Object.assign({ cx: q.cx, cy: q.cy }, T, S[i](k)));
      const hx = pwid / 2 + (i === 0 ? pwid * 0.05 * k : 0) + 3, y = q.cy + phei * 0.33;
      if (i === 0) { q.A.set(q.cx - hx - la, y, q.cx - hx, y, aw, ka); q.B.set(q.cx + hx + la, y, q.cx + hx, y, aw, ka); }
      else if (i === 2) { q.A.set(q.cx - hx, y, q.cx - hx - la, y, aw, ka); q.B.set(q.cx + hx, y, q.cx + hx + la, y, aw, ka); }
      else { q.A.set(q.cx - hx - la, y - 7, q.cx - hx, y - 7, aw * 0.6, ka); q.B.set(q.cx - hx, y + 7, q.cx - hx - la, y + 7, aw * 0.6, ka); }
    });
  } };
}

/* 7. Isotonic solutions in medicine: an intravenous drip; an organ for transplantation, bathed and kept cold */
function medicine(c) {
  const { W, H, narrow: N, g, lh } = c, P = PIC.medicine, m = N ? 10 : 20, caps = [], rand = rng(31);
  const half = (W - 2 * m - (N ? 8 : 30)) / 2, xl = m, xr = m + half + (N ? 8 : 30), headH = (N ? 2 : 1) * lh + 10;
  const top = m + headH, bot = H - m - (N ? 34 : 44);
  caps.push(cap('iv', xl + half / 2, m, half, P.iv, { cls: 'h', card: 'iv' }), cap('organ', xr + half / 2, m, half, P.organ, { cls: 'h', card: 'organ' }));
  const gI = part(g, 'iv'), gO = part(g, 'organ');
  /* the drip: a bag on a stand, the drip chamber, the tube into a vein of the arm */
  const s = Math.max(0.55, Math.min(1.25, half / 380, (bot - top) / 330));
  const pole = xl + 18 * s, bagX = pole + 30 * s, bagW = 66 * s, bagH = 96 * s, bagY = top + 26 * s;
  mk('line', { x1: pole, y1: top, x2: pole, y2: bot, class: 'wa-pole' }, gI);
  mk('path', { d: `M${f1(pole)} ${f1(top + 6)}L${f1(bagX + bagW / 2)} ${f1(top + 6)}L${f1(bagX + bagW / 2)} ${f1(bagY)}`, class: 'wa-pole' }, gI);
  mk('rect', { x: bagX, y: bagY, width: bagW, height: bagH, rx: 12 * s, class: 'wa-bag' }, gI);
  const chX = bagX + bagW / 2 - 7 * s, chY = bagY + bagH + 6 * s, chH = 30 * s;
  mk('rect', { x: chX, y: chY, width: 14 * s, height: chH, rx: 4, class: 'wa-glass' }, gI);
  const drops = [0, 1, 2].map(() => mk('circle', { r: 2.6 * s + 0.6, class: 'wa-drop', opacity: 0 }, gI));
  const armY = bot - 70 * s, armX0 = bagX - 6 * s, armX1 = xl + half, armH = 54 * s, ins = [armX0 + (armX1 - armX0) * 0.5, armY + armH * 0.45];
  mk('rect', { x: armX0, y: armY, width: armX1 - armX0, height: armH, rx: armH / 2, class: 'wa-skin' }, gI);
  mk('path', { d: `M${f1(armX0 + 16)} ${f1(ins[1] + 2)}C${f1(ins[0] - 40)} ${f1(ins[1] - 4)} ${f1(ins[0] + 40)} ${f1(ins[1] + 8)} ${f1(armX1 - 14)} ${f1(ins[1] + 2)}`, class: 'wa-vein' }, gI);
  /* (the tube is drawn over the arm: it runs on the skin to the cannula, where the fluid enters the vein) */
  mk('path', { d: `M${f1(chX + 7 * s)} ${f1(chY + chH)}C${f1(chX + 7 * s)} ${f1(armY - 40 * s)} ${f1(ins[0] - 50 * s)} ${f1(ins[1] - 6)} ${f1(ins[0])} ${f1(ins[1])}`, class: 'wa-tube' }, gI);
  mk('rect', { x: ins[0] - 9 * s, y: ins[1] - 4 * s, width: 18 * s, height: 8 * s, rx: 3, class: 'wa-cannula' }, gI);
  /* a closer look: the red blood cells in the vein keep their shape */
  const mr = Math.max(28, 48 * s), mcx = Math.min(armX1 - mr - 4, ins[0] + 70 * s), mcy = armY - mr - 26 * s;
  mk('line', { x1: ins[0] + 4, y1: ins[1] - 4, x2: mcx - mr * 0.5, y2: mcy + mr * 0.87, class: 'wa-thin' }, gI);
  mk('circle', { cx: mcx, cy: mcy, r: mr, class: 'wa-lens' }, gI);
  [[-0.38, -0.25], [0.32, -0.32], [0.05, 0.36]].forEach(([fx, fy]) => { const r0 = mr * 0.27; mk('circle', { cx: mcx + fx * mr, cy: mcy + fy * mr, r: r0, class: 'wa-rbcin' }, gI); mk('circle', { cx: mcx + fx * mr, cy: mcy + fy * mr, r: r0 * 0.42, class: 'wa-rbcpale' }, gI); });
  /* (on a phone there is no room for these words above the circle: they are a numbered name) */
  if (!N) caps.push(cap('cells', mcx, mcy - mr - 6, Math.min(half - 4, 2 * mr + 120), P.cells, { va: 'b', cls: 's' }));
  /* the organ: an insulated box of isotonic slush, a kidney in a bag of isotonic solution */
  const Rm = N ? 0 : 168, bw = Math.max(110, Math.min(half - Rm - 10, 300)), bh = Math.max(110, Math.min(bot - top - 20, bw * 0.95)), bx = xr + (half - Rm - bw) / 2, by = top + Math.max(0, (bot - top - bh) / 2), tw = Math.max(6, bw * 0.045);
  mk('rect', { x: bx, y: by, width: bw, height: bh, rx: 10, class: 'wa-cool', 'stroke-width': tw }, gO);
  const iy = by + bh * 0.22, k = Math.max(0.7, s);
  for (let yy = iy; yy < by + bh - tw - 4; yy += 12 * k) for (let xx = bx + tw + 6; xx < bx + bw - tw - 6; xx += 15 * k) {
    mk('ellipse', { cx: xx + (rand() - 0.5) * 5, cy: yy + (rand() - 0.5) * 4 + 5, rx: (5 + rand() * 3) * k, ry: (4 + rand() * 2) * k, class: 'wa-ice' }, gO);
  }
  const kcx = bx + bw / 2, kcy = by + bh * 0.5, krx = bw * 0.21, kry = bw * 0.13;
  mk('ellipse', { cx: kcx, cy: kcy, rx: krx * 1.6, ry: kry * 2.1, class: 'wa-bag2' }, gO);
  mk('path', { d: kidneyD(kcx, kcy, krx, kry, -0.12), class: 'wa-kid' }, gO);
  const colR = bx + bw + tw / 2 + 14;
  const labels = [
    { id: 'bag', text: P.bag, x: bagX + bagW, y: bagY + bagH * 0.3, side: 'R', col: bagX + bagW + 24, pin: [22, 0] },
    { id: 'tube', text: P.tube, x: ins[0], y: ins[1] + 4 * s, side: 'B', col: armY + armH + 10, pin: [0, 22] },
    ...(N ? [{ id: 'cells', text: P.cells, x: mcx, y: mcy - mr, side: 'T', col: mcy - mr - 10, pin: [0, -18] }] : []),
    { id: 'box', text: P.box, x: bx + bw + tw / 2, y: by + bh * 0.07, side: 'R', col: colR, pin: [-22, 0] },
    { id: 'kidney', text: P.kidney, x: kcx + krx * 0.9, y: kcy - kry * 0.15, side: 'R', col: colR, pin: [0, -24] },
    { id: 'slush', text: P.slush, x: bx + bw - tw - 8, y: by + bh * 0.9, side: 'R', col: colR, pin: [-22, 0] }
  ];
  return { dur: 2600, caps, labels, note: P.note, frame(t) {
    drops.forEach((e, i) => { const q = seg(t, 0.08 + i * 0.28, 0.32 + i * 0.28); e.setAttribute('cx', f1(chX + 7 * s)); e.setAttribute('cy', f1(chY + 4 + q * (chH - 10))); e.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0); });
  } };
}

/* 8. Measuring water movement in plant tissue: the method in four pictures, and how the graph is read (no data) */
function tissue(c) {
  const { W, H, narrow: N, g, lh } = c, P = PIC.tissue, m = N ? 10 : 20, caps = [], rand = rng(41);
  const icoH = N ? 50 : 96, capRows = 3, stripH = icoH + capRows * lh + 30, formH = (N ? 2 : 1) * lh + 14, T = N ? P.short : P;
  const fr = N ? [0.2, 0.2, 0.4, 0.2] : [0.18, 0.2, 0.42, 0.2], gx = W - 2 * m;
  let x = m; const st = fr.map(f => { const o = { x, w: f * gx }; x += f * gx; return o; });
  const s = Math.max(0.55, Math.min(1.2, gx / 760, icoH / 92)), base = m + icoH;
  const gF = part(g, 'formula'), gR = part(g, 'repeats'), gI = part(g, 'iso');     /* the balances; the three pieces in each tube; the line and where it crosses zero */
  const piece = (cx, cy, w, h, to = g) => mk('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: Math.min(w, h) * 0.35, class: 'wa-pot' }, to);
  /* 1 similar pieces of tissue */
  [0, 1, 2].forEach(i => piece(st[0].x + st[0].w / 2 + (i - 1) * 16 * s, base - 22 * s, 11 * s, 34 * s));
  /* 2 and 4 a balance, the pieces on its pan */
  const balance = o => { const cx = o.x + o.w / 2, bw = Math.min(o.w - 10, 80 * s);
    mk('rect', { x: cx - bw / 2, y: base - 30 * s, width: bw, height: 30 * s, rx: 6, class: 'wa-bal' }, gF);
    mk('rect', { x: cx - bw * 0.3, y: base - 22 * s, width: bw * 0.6, height: 14 * s, rx: 3, class: 'wa-baldisp' }, gF);
    mk('rect', { x: cx - bw * 0.38, y: base - 38 * s, width: bw * 0.76, height: 6 * s, rx: 3, class: 'wa-bal' }, gF);
    [0, 1, 2].forEach(i => piece(cx + (i - 1) * 12 * s, base - 44 * s, 10 * s, 9 * s, gF)); };
  balance(st[1]); balance(st[3]);
  /* 3 tubes holding the same volume, with more solute particles in each; the pieces (repeats) at the bottom */
  const nT = 5, tw = Math.min(36 * s, st[2].w / (nT * 1.45)), th = icoH - 6, tg = (st[2].w - nT * tw) / (nT + 1), tubes = [];
  for (let i = 0; i < nT; i++) {
    const tx = st[2].x + tg + i * (tw + tg), T = tube(g, tx, base - th, tw, th, 0.7, i * 2, Math.max(1.8, 2.6 * s), rand, 0.55);
    const ph = Math.max(5, th * 0.7 * 0.24), py = base - tw / 2 - ph / 2 - 2;
    [-1, 0, 1].forEach(j => piece(tx + tw / 2 + j * tw * 0.26, py, tw * 0.2, ph, gR));
    tubes.push(T);
  }
  [0, 1, 2].forEach(i => { const A = arrow(g, 'wa-step'), x0 = st[i].x + st[i].w - 6, x1 = st[i + 1].x + 6; if (x1 - x0 > 8) A.set(x0 - 4, base - 20 * s, x1 + 4, base - 20 * s, 3); });
  st.forEach((o, i) => caps.push(cap('s' + i, o.x + o.w / 2, base + 8, o.w - 4, `${i + 1}. ${[T.s1, T.s2, T.s3, T.s4][i]}`, { cls: 's' })));
  /* the repeats (three pieces in each tube): a button under the tubes' own words */
  caps.push(cap('rep', st[2].x + st[2].w / 2, base + 8 + (capRows - 1) * lh + 3, st[2].w - 4, P.rep, { cls: 's', card: 'repeats' }));
  const fy = m + stripH;
  caps.push(cap('formula', W / 2, fy, gx, T.formula, { cls: 'f', card: 'formula' }));
  /* the graph: axes, the zero line, a line of best fit, where it crosses zero. No numbers, no points. */
  const gTop = fy + formH + lh + 6, xTitleH = N ? lh + 42 : lh + 58, Rm = N ? 12 : 170, Lm = N ? 22 : 34;
  const px0 = m + Lm, px1 = W - m - Rm, py0 = gTop, py1 = Math.max(py0 + 90, H - m - xTitleH);
  const yz = (py0 + py1) / 2, hh = (py1 - py0) / 2, pw = px1 - px0;
  caps.push(cap('y', px0 - 6, py0 - 6, Math.min(gx, 300), P.y, { al: 'l', va: 'b', cls: 'ax' }));
  mk('path', { d: `M${f1(px0)} ${f1(py0)}L${f1(px0)} ${f1(py1)}L${f1(px1)} ${f1(py1)}`, class: 'wa-axis' }, g);
  mk('line', { x1: px0, y1: yz, x2: px1, y2: yz, class: 'wa-dash' }, g);
  stext(g, px0 - 7, yz + 5, '0', N ? 13 : 16, '--wv-stage', { 'text-anchor': 'end' });
  const ly = f => yz - (0.6 - (f - 0.04) / 0.92 * 1.45) * hh, fx = 0.04 + 0.92 * 0.6 / 1.45;
  const L0 = [px0 + 0.04 * pw, ly(0.04)], L1 = [px0 + 0.96 * pw, ly(0.96)], fit = mk('line', { x1: L0[0], y1: L0[1], x2: L1[0], y2: L1[1], class: 'wa-fit' }, gI);
  const len = Math.hypot(L1[0] - L0[0], L1[1] - L0[1]); fit.style.strokeDasharray = `${f1(len)}`;
  const X = px0 + fx * pw, drop = mk('line', { x1: X, y1: yz, x2: X, y2: py1, class: 'wa-dash2' }, gI);
  /* the two regions' words stand where the line is not: above zero on the right, below zero on the left */
  caps.push(cap('gain', px0 + pw * 0.78, py0 + 8, pw * 0.4, T.gain, { cls: 's' }), cap('loss', px0 + pw * (N ? 0.19 : 0.22), py1 - 8, pw * (N ? 0.34 : 0.4), T.loss, { va: 'b', cls: 's' }),
    cap('x', px1, py1 + (N ? 34 : 48), Math.min(gx, 360), P.x, { al: 'r', cls: 'ax' }));
  const labels = [
    { id: 'iso', text: P.iso, x: X, y: py1, side: 'B', col: py1 + 10, pin: [0, 18], card: 'iso' },
    { id: 'fit', text: P.fit, x: px0 + 0.9 * pw, y: ly(0.9), side: 'R', col: px1 + 14, pin: [0, -20] }
  ];
  return { dur: 3600, caps, labels, note: P.note, frame(t) {
    tubes.forEach((T, i) => { const k = seg(t, 0.03 + i * 0.05, 0.12 + i * 0.05); T.dots.forEach(e => { e.style.opacity = String(k); }); });
    fit.style.strokeDashoffset = f1(len * (1 - ease(seg(t, 0.32, 0.86))));
    drop.style.opacity = String(seg(t, 0.86, 1));
  } };
}

/* 9. Water potential: a scale of kPa; pure water at zero; a solution below zero */
function potential(c) {
  const { W, H, narrow: N, g, lh } = c, P = PIC.potential, m = N ? 10 : 20, caps = [], rand = rng(51);
  const tickW = N ? 46 : 62, ax = m + tickW, bw = N ? 70 : 132, bh = N ? 70 : 116;
  const y0 = m + lh + 18 + bh / 2, y1 = H - m - bh / 2 - 8, yOf = v => y0 + (-v / 5000) * (y1 - y0);
  caps.push(cap('axis', m, m, Math.min(W - 2 * m, 320), P.axis, { al: 'l', cls: 'ax' }));
  mk('line', { x1: ax, y1: y0 - 14, x2: ax, y2: y1 + 6, class: 'wa-axis' }, g);
  for (let v = 0; v >= -5000; v -= 1000) { const y = yOf(v); mk('line', { x1: ax - 6, x2: ax, y1: y, y2: y, class: 'wa-axis' }, g); stext(g, ax - 10, y + 5, v === 0 ? '0' : '−' + (-v).toLocaleString('en-GB'), N ? 12.5 : 16, '--wv-stage', { 'text-anchor': 'end' }); }
  const hx = ax + 10; stext(g, hx, y0 + 28, '↑ ' + P.higher, N ? 12.5 : 16, '--wv-stage'); stext(g, hx, y1 - 2, '↓ ' + P.lower, N ? 12.5 : 16, '--wv-stage');
  const bx = ax + (N ? 70 : 150), cx = bx + bw + (N ? 10 : 22);
  /* pure water */
  const gA = part(g, 'pure'), gB = part(g, 'salt');
  const yA = yOf(0); beaker(gA, bx, yA - bh / 2, bw, bh, 0.7);
  mk('line', { x1: ax, x2: bx - 8, y1: yA, y2: yA, class: 'wa-dash' }, gA); mk('path', { d: `M${f1(ax)} ${f1(yA)}l9 -6v12z`, class: 'wa-mark' }, gA);
  caps.push(cap('pure', cx, yA, W - m - cx, P.pure, { al: 'l', va: 'm', cls: 'b', card: 'pure' }));
  /* a solution: its solute particles appear, and its water potential falls to −4,540 kPa (Allott and Mindorff 2023, p. 659) */
  const yB = yOf(-4540), liq = beaker(gB, bx, yB - bh / 2, bw, bh, 0.7);
  const dots = spread(N ? 12 : 22, bx + 4, liq + 3, bw - 8, bh * 0.7 - 8, N ? 4 : 6, rand).map(q => mk('circle', { cx: q[0], cy: q[1], r: N ? 3 : 4.8, class: 'wa-s', opacity: 0 }, gB));
  const lineB = mk('line', { x1: ax, x2: bx - 8, class: 'wa-dash' }, gB), markB = mk('path', { class: 'wa-mark' }, gB);
  caps.push(cap('salt', cx, yB, W - m - cx, P.salt, { al: 'l', va: 'm', cls: 'b', when: 'e', card: 'salt' }));
  return { dur: 3000, caps, labels: [], note: P.note, frame(t) {
    const y = lerp(yA, yB, ease(seg(t, 0.1, 0.9)));
    dots.forEach((e, i) => e.setAttribute('opacity', f1(seg(t, 0.08 + i * 0.03, 0.14 + i * 0.03))));
    lineB.setAttribute('y1', f1(y)); lineB.setAttribute('y2', f1(y)); lineB.style.opacity = String(seg(t, 0.05, 0.15));
    markB.setAttribute('d', `M${f1(ax)} ${f1(y)}l9 -6v12z`);
  } };
}

/* 10. From higher to lower water potential: two cells (Allott and Mindorff 2023, p. 658), and a ball on a slope */
function downhill(c) {
  const { W, H, narrow: N, g, lh } = c, P = PIC.downhill, m = N ? 10 : 20, caps = [];
  const axW = N ? 96 : 150, cs = Math.max(90, Math.min((W - 2 * m - axW - 20) / 2, (H - 2 * m - 2 * lh - 150) / 1.15, 210)), ch = cs * 1.15;
  const x0 = m + (W - 2 * m - axW - 2 * cs) / 2, cy = m + lh + 18 + ch / 2, tw = Math.max(5, cs * 0.05);
  caps.push(cap('a', x0 + cs / 2, m, cs, P.a, { cls: 'h' }), cap('b', x0 + cs * 1.5, m, cs, P.b, { cls: 'h' }));
  const A = plantCell(g, tw, true, 0.2), B = plantCell(g, tw, true, 0.2);
  A.set({ cx: x0 + cs / 2 + tw / 4, cy, w: cs + tw / 2, h: ch }); B.set({ cx: x0 + cs * 1.5 - tw / 4, cy, w: cs + tw / 2, h: ch });
  const fsz = N ? 14 : 18;
  [[A, x0 + cs / 2, '−200'], [B, x0 + cs * 1.5, '−300']].forEach(([C, x, v]) => { const y = C.geo.vy + C.geo.vh * 0.42; stext(g, x, y, 'ψ =', fsz, '--wv-vac', { 'text-anchor': 'middle', class: 'wa-t wa-tb' }); stext(g, x, y + fsz * 1.4, v + ' kPa', fsz, '--wv-vac', { 'text-anchor': 'middle', class: 'wa-t wa-tb' }); });
  /* the net movement of water, from A to B: one arrow. (Until 17 Nov 2026 five molecules also went from A to B on straight
     paths: water molecules cross both ways, at random, as steps 2 and 3 count; the arrow alone is the NET movement.) */
  const ay = cy + ch * 0.32, aw = N ? 9 : 13, ar = arrow(part(g, 'net')), xm = x0 + cs, reach = cs * 0.34;
  /* the scale: 0 to −400 kPa, true to scale, the two cells marked on it */
  const sx = W - m - axW + (N ? 44 : 64), sy0 = cy - ch / 2 + 6, sy1 = cy + ch / 2 - 6, yOf = v => sy0 + (-v / 400) * (sy1 - sy0);
  caps.push(cap('axis', sx + 20, sy0 - 12, axW + 20, P.axis, { al: 'r', va: 'b', cls: 's' }));
  mk('line', { x1: sx, x2: sx, y1: sy0 - 6, y2: sy1 + 4, class: 'wa-axis' }, g);
  for (let v = 0; v >= -400; v -= 100) { const y = yOf(v); mk('line', { x1: sx - 5, x2: sx, y1: y, y2: y, class: 'wa-axis' }, g); stext(g, sx - 9, y + 5, v ? '−' + (-v) : '0', N ? 12.5 : 16, '--wv-stage', { 'text-anchor': 'end' }); }
  [['A', -200], ['B', -300]].forEach(([n, v]) => { const y = yOf(v); mk('circle', { cx: sx, cy: y, r: N ? 5 : 6.5, class: 'wa-markdot' }, g); stext(g, sx + 11, y + 5, n, N ? 13 : 16, '--wv-stage', { class: 'wa-t wa-tb' }); });
  const down = arrow(g, 'wa-step');
  /* the ball on a slope (an analogy, beyond the guide: the extension violet) */
  const iy = cy + ch / 2 + (N ? 22 : 34), iw = Math.min(N ? 120 : 170, W * 0.3), ih = Math.max(24, Math.min(N ? 40 : 60, H - iy - m - 2 * lh - 8));
  const s0 = [x0, iy], s1 = [x0 + iw, iy + ih];
  mk('path', { d: `M${f1(s0[0])} ${f1(s0[1])}L${f1(s1[0])} ${f1(s1[1])}L${f1(s0[0])} ${f1(s1[1])}Z`, class: 'wa-extfill' }, g);
  const br = N ? 7 : 10, ball = mk('circle', { r: br, class: 'wa-ext' }, g), na = Math.atan2(ih, iw);
  caps.push(cap('ball', x0, iy + ih + 8, Math.max(iw + 120, 200), P.ball, { al: 'l', cls: 'ext' }));
  const labels = [{ id: 'net', text: P.net, x: xm + reach * 0.45, y: ay + aw / 2, side: 'B', col: cy + ch / 2 + 10, pin: [0, 20], card: 'net' }];
  return { dur: 3000, caps, labels, note: P.note, frame(t) {
    ar.set(xm - reach, ay, xm + reach, ay, aw, ease(seg(t, 0.05, 0.4)));
    down.set(sx + 26, yOf(-200) + 2, sx + 26, yOf(-300) - 2, 3, ease(seg(t, 0.2, 0.55)));
    const b = ease(seg(t, 0.15, 0.95)), px = lerp(s0[0] + 6, s1[0] - 6, b), py = lerp(s0[1], s1[1], b);
    ball.setAttribute('cx', f1(px - Math.sin(na) * br)); ball.setAttribute('cy', f1(py - Math.cos(na) * br));
  } };
}

/* 11. Solute potential and pressure potential: a turgid cell, three bars on one zero line, and a xylem vessel */
function parts(c) {
  const { W, H, narrow: N, g, lh } = c, P = PIC.parts, m = N ? 10 : 20, caps = [];
  const Lm = N ? 0 : 196, cw = N ? Math.min(110, (W - 2 * m) * 0.36) : Math.max(110, Math.min(180, (W - 2 * m - Lm) * 0.32)), chh = cw * 1.25, tw = Math.max(5, cw * 0.05);
  const ccx = m + Lm + cw / 2 + (N ? 36 : 12), ccy = m + lh + 30 + chh / 2;
  const C = plantCell(g, tw); C.set({ cx: ccx, cy: ccy, w: cw, h: chh, bulge: cw * 0.05, shrink: 0, press: 1 });
  const G = C.geo;
  /* the three bars on one zero line */
  const bx0 = ccx + cw / 2 + (N ? 30 : 60), bAvail = W - m - bx0, bw = Math.max(26, Math.min(56, bAvail / 5)), bgap = Math.max(14, Math.min(46, (bAvail - 3 * bw) / 3));
  const u1 = N ? 70 : Math.max(90, Math.min(140, (H - 2 * m) * 0.22)), yz = m + lh + 40 + 0.55 * u1;
  caps.push(cap('eq', bx0 + 1.5 * bw + bgap, m, Math.min(W - bx0 - m + 20, 340), P.eq, { cls: 'eq' }));
  const BR = bars(g, bx0, yz, bw, bgap, u1, ['s', 'p']);
  stext(g, bx0 - 16, yz + 5, '0', N ? 12.5 : 16, '--wv-stage', { 'text-anchor': 'end' });
  const yLab = yz + 1.0 * u1 + 8;
  ['s', 'p', 'w'].forEach((k, i) => { stext(g, BR.xs[i], yLab + (N ? 14 : 18), psi(k), N ? 15 : 19, '--wv-stage', { 'text-anchor': 'middle', class: 'wa-t wa-tb' });
    if (!N) caps.push(cap('b' + k, BR.xs[i], yLab + 32, bw + bgap - 2, P[k], { cls: 's', card: k === 'w' ? null : k })); });
  /* a xylem vessel under tension, with its own small bar: pressure potential below zero */
  const xy0 = Math.max(yLab + 3 * lh + 40, ccy + chh / 2 + 40), xh = Math.max(60, Math.min(150, H - m - xy0 - 10)), xw = N ? 22 : 30, xx = N ? m + 20 : m + Lm + 20;
  const gX = part(g, 'p'), pull = arrow(gX, 'wa-step');
  mk('rect', { x: xx, y: xy0, width: xw, height: xh, class: 'wa-xylem' }, gX);
  for (let yy = xy0 + 8; yy < xy0 + xh - 4; yy += 11) mk('line', { x1: xx + 2, x2: xx + xw - 2, y1: yy, y2: yy + 4, class: 'wa-ring' }, gX);
  const zx = xx + xw + (N ? 34 : 50), zy = xy0 + xh * 0.3, xb = mk('rect', { x: zx, y: zy, width: N ? 18 : 26, class: 'wa-psip' }, gX);
  mk('line', { x1: zx - 8, x2: zx + (N ? 26 : 34), y1: zy, y2: zy, class: 'wa-axis' }, g);
  stext(g, zx + (N ? 9 : 13), zy - 8, psi('p'), N ? 14 : 17, '--wv-stage', { 'text-anchor': 'middle', class: 'wa-t wa-tb' });
  caps.push(cap('xylem', zx + (N ? 34 : 50), zy, W - m - (zx + (N ? 34 : 50)), P.xylem, { al: 'l', va: 'm', cls: 's' }), cap('pull', xx + xw / 2, xy0 - 34, 120, P.pull, { va: 'b', cls: 's' }));
  const labels = [
    { id: 'vac', text: P.vac, x: G.vx + 2, y: ccy - chh * 0.3, side: 'L', col: m + Lm - 4, pin: [16, 0] },
    { id: 'press', text: P.press, x: ccx - G.iw / 2 - G.pb - 1, y: ccy + 0.5, side: 'L', col: m + Lm - 4, pin: [-22, 0] }
  ];
  if (N) [['s', -0.5], ['p', 0.275], ['w', -0.225]].forEach(([k, at], i) => labels.push({ id: 'b' + k, text: P[k], x: BR.xs[i], y: yz - at * u1, side: 'B', col: yz, pin: [0, 0], card: k === 'w' ? null : k }));
  return { dur: 3000, caps, labels, note: P.note, frame(t) {
    BR.set([-1.0 * ease(seg(t, 0.05, 0.35)), 0.55 * ease(seg(t, 0.35, 0.65)), -0.45 * ease(seg(t, 0.65, 0.95))]);
    xb.setAttribute('height', f1(Math.max(0.01, 0.4 * u1 * ease(seg(t, 0.2, 0.6)))));
    pull.set(xx + xw / 2, xy0 - 4, xx + xw / 2, xy0 - 30, 3, ease(seg(t, 0.2, 0.5)));
  } };
}

/* 12. Plant tissue in pure water and in a hypertonic solution: the potentials change until ψw of the cells equals ψw of
   the solution (relative values, consistent with ψw = ψs + ψp at every moment) */
function tissueHL(c) {
  const { W, H, narrow: N, g, lh } = c, P = PIC.tissueHL, m = N ? 10 : 20, caps = [];
  const gap = N ? 8 : 30, colW = (W - 2 * m - gap) / 2, headH = (N ? 2 : 1) * lh + 10;
  const cw = N ? Math.min(60, colW * 0.4) : Math.max(90, Math.min(150, colW * 0.36)), chh = cw * 1.25, tw = Math.max(4, cw * 0.05);
  const bw = N ? 20 : Math.max(30, Math.min(46, colW * 0.1)), bgap = N ? 12 : Math.max(16, Math.min(30, colW * 0.07));
  const u1 = N ? Math.max(40, Math.min(62, (H - 2 * m - headH - chh - 6 * lh - 40) / 2.6)) : Math.max(70, Math.min(130, (H - 2 * m - headH - 5 * lh - 70) / 2.7));
  const out = [];
  [0, 1].forEach(i => {
    const x = m + i * (colW + gap);
    caps.push(cap('h' + i, x + colW / 2, m, colW, i ? P.hyper : P.hypo, { cls: 'h', card: i ? 'hyper' : 'hypo' }));
    const gp = part(g, i ? 'hyper' : 'hypo');
    let ccx, ccy, bx0, yz;
    if (!N) { ccx = x + cw / 2 + 14; ccy = m + headH + 0.9 * u1 + 20; bx0 = x + cw + 60; yz = m + headH + 0.9 * u1 + 30; }
    else { ccx = x + colW / 2; ccy = m + headH + chh / 2 + 6; bx0 = x + (colW - 3 * bw - 2 * bgap) / 2; yz = ccy + chh / 2 + 0.9 * u1 + 26; }
    mk('rect', { x: ccx - cw / 2 - 10, y: ccy - chh / 2 - 10, width: cw + 20, height: chh + 20, rx: 10, class: 'wa-solbg' }, gp);
    const C = plantCell(gp, tw), BR = bars(gp, bx0, yz, bw, bgap, u1);
    stext(g, bx0 - 16, yz + 5, '0', N ? 12.5 : 16, '--wv-stage', { 'text-anchor': 'end' });
    ['s', 'p', 'w'].forEach((k, j) => stext(g, BR.xs[j], yz + 1.5 * u1 + (N ? 16 : 22), psi(k), N ? 14 : 18, '--wv-stage', { 'text-anchor': 'middle', class: 'wa-t wa-tb' }));
    /* the water potential of the solution: 0 for pure water, below the cells' for the hypertonic solution */
    const sy = yz + (i ? 1.5 : 0) * u1;
    mk('line', { x1: bx0 - 12, x2: bx0 + 3 * bw + 2 * bgap + 12, y1: sy, y2: sy, class: 'wa-sol' }, g);
    caps.push(cap('r' + i, x + colW / 2, yz + 1.5 * u1 + (N ? 30 : 36), colW, i ? P.plasmo : P.turgid, { when: 'e', cls: 'b' }));
    out.push({ C, BR, ccx, ccy, A: arrow(gp), B: arrow(gp) });
  });
  const aw = N ? 4 : 6, la = N ? 14 : 24, hx = cw / 2 + 4;
  return { dur: 4600, caps, labels: [], note: P.note, frame(t) {
    /* (the arrows of water show while water moves: at the end ψw of the cells equals ψw of the solution, and they are gone) */
    const k = ease(seg(t, 0.08, 0.95)), ka = ease(seg(t, 0, 0.12)) * (1 - ease(seg(t, 0.9, 1)));
    /* in pure water: ψs −1.0 → −0.9 (diluted), ψp +0.4 → +0.9, ψw −0.6 → 0 */
    const s0 = lerp(-1.0, -0.9, k), p0 = lerp(0.4, 0.9, k); out[0].BR.set([s0, p0, s0 + p0]);
    out[0].C.set({ cx: out[0].ccx, cy: out[0].ccy, w: cw, h: chh, bulge: cw * (0.02 + 0.045 * k), shrink: 0, press: 0.3 + 0.7 * k });
    /* in a hypertonic solution (ψw −1.5): ψp 0.4 → 0 (flaccid), then ψs −1.03 → −1.5 as the cell plasmolyses */
    const k1 = ease(seg(t, 0.08, 0.4)), k2 = ease(seg(t, 0.4, 0.95)), p1 = lerp(0.4, 0, k1), s1 = lerp(lerp(-1.0, -1.03, k1), -1.5, k2);
    out[1].BR.set([s1, p1, s1 + p1]);
    out[1].C.set({ cx: out[1].ccx, cy: out[1].ccy, w: cw, h: chh, bulge: cw * 0.02 * (1 - k1), shrink: k2, press: 0.3 * (1 - k1) });
    const [a, b] = out, y = a.ccy - chh * 0.3;
    a.A.set(a.ccx - hx - la, y, a.ccx - hx, y, aw, 1); a.B.set(a.ccx + hx + la, y, a.ccx + hx, y, aw, 1);
    b.A.set(b.ccx - hx, y, b.ccx - hx - la, y, aw, 1); b.B.set(b.ccx + hx, y, b.ccx + hx + la, y, aw, 1);
    [a.A, a.B, b.A, b.B].forEach(q => { q.el.style.opacity = String(f1(ka)); });
  } };
}

export const SCENES = { solvate, osmosis: c => liquid(c, 'osmosis'), tonicity: c => liquid(c, 'tonicity'), rbc: rbcScene, protist, plant: plantScene, medicine, tissue, potential, downhill, parts, tissueHL };
