/* ============================================================
   scenes.js — the pictures of "From light to glucose" (16 Nov 2026): 2D only, inline SVG drawn on a 1000 × 820 sheet.
   A scene: SCENES[name](phase, ctx) → {
     bg      the still parts (SVG markup),
     dyn(p)  the moving parts at progress p, 0 → 1 (p = 1 is the end state: what Reduce motion shows at once),
     dur     how long the motion lasts (ms),
     labels  the names: { id (NAMES key), a: [x, y] the point on the part where the line ends, d: 'T' | 'B' | 'L' | 'R'
             (the name above, below, left or right of its part: an upright or a level line), to (L/R: the x of the box's
             near edge), ext (beyond the guide: violet) } or { id, tag: [x, y] } (a name beside its part, no line) or
             { id, pill: [x, y], fill, ink } (a molecule drawn as its own name),
     places  the spaces named on the picture itself: { t, n (shorter, on a phone), x, y },
     keep    boxes no name may cover, legend  the key under the picture: [{ c, t, s: 'dot' | 'ring' | 'sq' }],
     html    (instead of SVG) a diagram of boxes, with dyn(p, el) and ctl(state) }.
   Since 17 Nov 2026 (memory teach-on-the-picture): a name whose id (or its `card`) is a card of the step (text.js) is a
   button (view.js); the part of the picture that a card is about is ONE top-level group of bg or of dyn(p) with
   data-p="<card id> …": pressed, that group stays bright and every other top-level piece dims. ctx.mode: the choice of
   a step with a switch. A scene may give read(l) (a graph read at a wavelength) and live (a picture that goes on).
   Nothing here claims a size: every picture is marked "not to scale" (text.js STEPS note). The spectra are shapes drawn by
   hand (sums of bell curves placed in the right colours), said on the picture and in text.js SIMPLE. Concentrations are
   compared in two EQUAL squares (step 10), never by a crowded space against an empty one.
   ============================================================ */
import { PR, makeProtons } from './protons.js?v=202611192340';

export const W = 1000, H = 820;

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = t => t * t * (3 - 2 * t);
const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (P, Q, t) => [lerp(P[0], Q[0], t), lerp(P[1], Q[1], t)];
const r1 = n => Math.round(n * 10) / 10;
function along(pts, t) {
  let L = 0; const d = [];
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); d.push(l); L += l; }
  let s = clamp(t) * L;
  for (let i = 0; i < d.length; i++) { if (s <= d[i] || i === d.length - 1) return mix(pts[i], pts[i + 1], d[i] ? clamp(s / d[i]) : 1); s -= d[i]; }
  return pts[pts.length - 1];
}
/* a seeded random: the same picture every time */
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* ---------- colours (the picture stands on a dark stage in both themes) ---------- */
const C = {
  stroma: '#12332a', stroma2: '#174034', mem: '#2f6a4a', head: '#7cc995', tail: '#1d3d2d', lumen: '#1b3152',
  psII: '#3aa86a', psI: '#3c9e66', b6f: '#d38331', syn: '#cf5294', syn2: '#e070a8', pq: '#e8eef8', pc: '#6ec6e8',
  e: '#ffd84a', h: '#ff8f7a', o: '#ff6b6b', hyd: '#ffffff', c: '#d7dde8', sugar: '#f3cf6e', p: '#ff9f43', light: '#ffe066',
  chl: '#3fd07f', chlb: '#b9e26a', car: '#ffa64d', enz: '#ff9ec4', glass: '#a9c7e0', water: '#1e4a6e', ink: '#0a1020'
};

/* ---------- small drawings ---------- */
/* a top-level group of the picture that belongs to a card (or to several: 'lumen granum') */
const part = (id, s) => `<g data-p="${id}">${s}</g>`;
const circ = (x, y, r, fill, more = '') => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fill}"${more}/>`;
const water = (x, y, o = 1) => `<g opacity="${r1(o * 100) / 100}">${circ(x - 10, y + 7, 6.5, C.hyd)}${circ(x + 10, y + 7, 6.5, C.hyd)}${circ(x, y, 11, C.o)}</g>`;
const o2 = (x, y, o = 1) => `<g opacity="${r1(o * 100) / 100}">${circ(x - 8, y, 10, C.o)}${circ(x + 8, y, 10, C.o, ' stroke="#0a1020" stroke-width="1.5"')}</g>`;
const co2 = (x, y, o = 1) => `<g opacity="${r1(o * 100) / 100}">${circ(x - 15, y, 8, C.o)}${circ(x + 15, y, 8, C.o)}${circ(x, y, 9.5, C.c)}</g>`;
const hp = (x, y, o = 1) => `<g opacity="${r1(o * 100) / 100}">${circ(x, y, 9, C.h, ' stroke="#3a0f08" stroke-width="1.2"')}<path d="M${r1(x - 4.5)} ${r1(y)}h9M${r1(x)} ${r1(y - 4.5)}v9" stroke="#3a0f08" stroke-width="2.2"/></g>`;
const el = (x, y, o = 1) => `<g opacity="${r1(o * 100) / 100}">${circ(x, y, 13, C.e, ' opacity=".28"')}${circ(x, y, 7, C.e)}</g>`;
const hyd = (x, y, o = 1) => `<g opacity="${r1(o * 100) / 100}">${circ(x, y, 8, C.hyd, ' stroke="#0a1020" stroke-width="1.5"')}</g>`;
const glow = (x, y, r, o) => o > 0.01 ? circ(x, y, r, C.light, ` opacity="${r1(o * 60) / 100}"`) : '';
function hexagon(x, y, r, fill, stroke = '#fff') {
  const pts = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; pts.push(`${r1(x + r * Math.cos(a))},${r1(y + r * Math.sin(a))}`); }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`;
}
const glucose = (x, y, o = 1) => `<g opacity="${r1(o * 100) / 100}">${hexagon(x, y, 26, C.sugar, '#fff4cf')}${circ(x + 26, y - 18, 6, C.sugar)}</g>`;
/* a pill drawn in the moving layer (its named twin is a label: view.js) */
const pillShape = (x, y, w, fill, o = 1) => `<rect x="${r1(x - w / 2)}" y="${r1(y - 15)}" width="${r1(w)}" height="30" rx="15" fill="${fill}" opacity="${r1(o * 100) / 100}"/>`;
/* a movement arrow: ONE filled shape with a fixed head (memory concentration-pictures-equal-volumes) */
function arrow(x0, y0, x1, y1, w = 10, fill = '#cfe6ff', o = 1) {
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux, hl = 22, hw = w / 2 + 9;
  const bx = x1 - ux * hl, by = y1 - uy * hl, s = w / 2;
  const P = [[x0 + nx * s, y0 + ny * s], [bx + nx * s, by + ny * s], [bx + nx * hw, by + ny * hw], [x1, y1], [bx - nx * hw, by - ny * hw], [bx - nx * s, by - ny * s], [x0 - nx * s, y0 - ny * s]];
  return `<polygon points="${P.map(q => q.map(r1).join(',')).join(' ')}" fill="${fill}" opacity="${o}"/>`;
}
/* light: a wavy line with a filled head */
function lightRay(x0, y0, x1, y1, o = 1) {
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux, n = Math.max(3, Math.round(L / 34));
  let d = `M${r1(x0)} ${r1(y0)}`; const end = L - 22;
  for (let i = 1; i <= n * 4; i++) { const s = end * i / (n * 4), a = Math.sin(i * Math.PI / 2) * 9; d += ` L${r1(x0 + ux * s + nx * a)} ${r1(y0 + uy * s + ny * a)}`; }
  return `<g opacity="${o}"><path d="${d}" fill="none" stroke="${C.light}" stroke-width="4" stroke-linejoin="round"/>${arrow(x0 + ux * (L - 26), y0 + uy * (L - 26), x1, y1, 4, C.light)}</g>`;
}
const photon = (x0, y0, x1, y1, t) => t > 0 && t < 1 ? (([x, y]) => glow(x, y, 16, 1) + circ(x, y, 6, '#fffbe0'))(mix([x0, y0], [x1, y1], t)) : '';
/* the dotted path of electrons */
const trail = (pts, o = 0.7) => `<polyline points="${pts.map(q => q.map(r1).join(',')).join(' ')}" fill="none" stroke="${C.e}" stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round" opacity="${o}"/>`;
/* a key text on the picture (an axis, a heading): data-bg says what it stands on, for the contrast check */
const txt = (x, y, s, { size = 19, anchor = 'middle', fill = '#E8EEFA', weight = 800, rot = 0, bg = '#0b1424' } = {}) =>
  `<text x="${r1(x)}" y="${r1(y)}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${fill}" data-bg="${bg}"${rot ? ` transform="rotate(${rot} ${r1(x)} ${r1(y)})"` : ''}>${s}</text>`;

/* ======================================================================================================================
   1. cell — a palisade cell, and one of its chloroplasts magnified; light, carbon dioxide and water in, glucose and
      oxygen out (C1.3.1, C1.3.2)
   ==================================================================================================================== */
function cell(phase, ctx) {
  const CX = 660, CY = 430, RX = 230, RY = 135;
  const chls = [];
  for (let y = 150; y <= 650; y += 50) { chls.push([112, y, 0]); chls.push([268, y, 0]); }
  chls.push([155, 112, 90], [225, 112, 90], [155, 708, 90], [190, 708, 90], [225, 708, 90]);
  const lit = [268, 400];
  let bg = `<rect x="90" y="90" width="200" height="640" rx="44" fill="#0f2a22" stroke="#9bd17c" stroke-width="10"/>
    <rect x="99" y="99" width="182" height="622" rx="36" fill="none" stroke="#6fb58a" stroke-width="2"/>
    <rect x="132" y="150" width="116" height="530" rx="34" fill="#172a3f" opacity=".9"/>`;
  bg += chls.map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="21" fill="${C.psII}" stroke="#9fe8b8" stroke-width="2" transform="rotate(${a} ${x} ${y})"/>`).join('');
  bg += `<circle cx="${lit[0]}" cy="${lit[1]}" r="32" fill="none" stroke="${C.light}" stroke-width="3" stroke-dasharray="7 6"/>
    <path d="M298 388 L462 344 M298 412 L462 516" stroke="${C.light}" stroke-width="2" stroke-dasharray="7 6" opacity=".7"/>`;
  /* the chloroplast, magnified: two membranes, stacks of thylakoids */
  bg += `<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="${C.stroma2}" stroke="#9fe0b4" stroke-width="5"/>
    <ellipse cx="${CX}" cy="${CY}" rx="${RX - 10}" ry="${RY - 10}" fill="none" stroke="#9fe0b4" stroke-width="3"/>`;
  [520, 590, 660, 730].forEach((x, i) => {
    const y0 = CY - 42 + (i % 2) * 10;
    for (let k = 0; k < 6; k++) bg += `<rect x="${x - 28}" y="${y0 + k * 14}" width="56" height="9" rx="4.5" fill="${C.lumen}" stroke="#5fcf8a" stroke-width="2.5"/>`;
  });
  bg += `<path d="M548 ${CY - 10} L562 ${CY}M618 ${CY + 6} L632 ${CY - 4}M688 ${CY - 8} L702 ${CY + 2}" stroke="#5fcf8a" stroke-width="5"/>`;
  bg += [580, 650, 720].map(x => lightRay(x, 128, x, 288)).join('');
  bg += co2(925, 250) + arrow(905, 268, 845, 330, 10) + water(430, 690) + arrow(452, 670, 535, 558, 10) + arrow(782, 560, 845, 660, 10);
  const dyn = p => {
    let s = '';
    [580, 650, 720].forEach((x, i) => { s += photon(x, 128, x, 288, (p - i * 0.06) / 0.3); });
    s += glow(CX, CY, 90, Math.sin(Math.PI * seg(p, 0.25, 0.5)) * 0.5);
    const a = seg(p, 0.3, 0.6);
    if (a > 0 && a < 1) { const [x, y] = mix([925, 250], [800, 375], a); s += co2(x, y, 1 - seg(p, 0.5, 0.6)); const [u, v] = mix([430, 690], [560, 520], a); s += water(u, v, 1 - seg(p, 0.5, 0.6)); }
    const o = seg(p, 0.6, 0.85); if (o > 0) s += o2(lerp(800, 865, o), lerp(580, 690, o), o);
    const g = seg(p, 0.7, 1); if (g > 0) s += glucose(805, 430, g);
    return s;
  };
  return {
    bg, dyn, dur: 3200,
    labels: [
      { id: 'light', tag: [650, 100] }, { id: 'co2', tag: [895, 205] }, { id: 'water', tag: [430, 742] }, { id: 'oxygen', tag: [868, 742] },
      { id: 'palisade', a: [190, 90], d: 'T' }, { id: 'chls', a: [190, 719], d: 'B' }, { id: 'chl', a: [600, 560], d: 'B' },
      { id: 'glucose', a: [831, 430], d: 'R', to: 905 }
    ],
    legend: []
  };
}

/* ======================================================================================================================
   2. chloro — one chloroplast cut open: two membranes, grana of thylakoids, the lumen inside each, photosystems on the
      membranes, the enzymes of the Calvin cycle in the stroma (A2.2.11, B2.2.5)
   ==================================================================================================================== */
function chloro(phase, ctx) {
  const CX = 500, CY = 430, RX = 430, RY = 245;
  const stacks = [[215, 440], [365, 410], [515, 450], [665, 415], [805, 445]];
  const DW = 110, DH = 14, GAP = 6, N = 7;
  const top = y => y - (N * (DH + GAP) - GAP) / 2;
  let bg = part('envelope', `<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="#0f2a22" stroke="#9fe0b4" stroke-width="5"/>`)
    + part('stroma', `<ellipse cx="${CX}" cy="${CY}" rx="${RX - 12}" ry="${RY - 12}" fill="${C.stroma2}"/>`)
    + part('envelope', `<ellipse cx="${CX}" cy="${CY}" rx="${RX - 12}" ry="${RY - 12}" fill="none" stroke="#9fe0b4" stroke-width="4"/>`);
  /* single sheets of membrane joining one granum to the next */
  for (let i = 0; i < stacks.length - 1; i++) {
    const [xa, ya] = stacks[i], [xb, yb] = stacks[i + 1], a = top(ya) + 3 * (DH + GAP) + 7, b = top(yb) + 2 * (DH + GAP) + 7;
    bg += `<path d="M${xa + DW / 2 - 4} ${a} C${xa + 90} ${a}, ${xb - 90} ${b}, ${xb - DW / 2 + 4} ${b}" fill="none" stroke="#5fcf8a" stroke-width="9"/>
      <path d="M${xa + DW / 2 - 4} ${a} C${xa + 90} ${a}, ${xb - 90} ${b}, ${xb - DW / 2 + 4} ${b}" fill="none" stroke="${C.lumen}" stroke-width="3"/>`;
  }
  const R = rng(7), enz = [];
  while (enz.length < 46) {
    const x = CX + (R() * 2 - 1) * (RX - 40), y = CY + (R() * 2 - 1) * (RY - 40);
    if (((x - CX) / (RX - 30)) ** 2 + ((y - CY) / (RY - 30)) ** 2 > 1) continue;
    if (stacks.some(([sx, sy]) => Math.abs(x - sx) < DW / 2 + 12 && Math.abs(y - sy) < 80)) continue;
    if (enz.some(([u, v]) => Math.hypot(u - x, v - y) < 26)) continue;
    if (Math.abs(x - 455) < 96 && Math.abs(y - 612) < 34) continue;      /* (none under the name "stroma", which stands in the stroma itself) */
    enz.push([x, y]);
  }
  enz.push([640, 632]);
  /* each stack: the lumen of its thylakoids (the fill), their membranes (the outline); the bottom thylakoid of the second
     stack is the one the name "thylakoid" points at */
  const disc = (x, yy, how) => `<rect x="${x - DW / 2}" y="${yy}" width="${DW}" height="${DH}" rx="7" ${how}/>`;
  const fills = stacks.map(([x, y], i) => { let s = ''; for (let k = 0; k < N; k++) if (!(i === 1 && k === N - 1)) s += disc(x, top(y) + k * (DH + GAP), `fill="${C.lumen}"`); return s; });
  const lines = stacks.map(([x, y], i) => { let s = ''; for (let k = 0; k < N; k++) if (!(i === 1 && k === N - 1)) s += disc(x, top(y) + k * (DH + GAP), 'fill="none" stroke="#5fcf8a" stroke-width="3.5"'); return s; });
  const one = disc(stacks[1][0], top(stacks[1][1]) + (N - 1) * (DH + GAP), `fill="${C.lumen}" stroke="#5fcf8a" stroke-width="3.5"`);
  const dots = stacks.map(([x, y]) => { let s = ''; for (let k = 0; k < N; k++) { const yy = top(y) + k * (DH + GAP); for (let j = 0; j < 4; j++) s += circ(x - 36 + j * 24, yy, 3.4, '#e2f78a'); } return s; });
  const dyn = p => {
    let s = '';
    stacks.forEach((_, i) => { const o = seg(p, i * 0.1, i * 0.1 + 0.22); if (o <= 0) return; const op = ` opacity="${r1(o * 100) / 100}"`;
      s += `<g data-p="lumen granum"${op}>${fills[i]}</g><g data-p="granum"${op}>${lines[i]}</g>` + (i === 1 ? `<g data-p="lumen granum thylakoid"${op}>${one}</g>` : ''); });
    const d = seg(p, 0.5, 0.75); if (d > 0) s += `<g data-p="photosystems" opacity="${r1(d * 100) / 100}">${dots.join('')}</g>`;
    const e = seg(p, 0.7, 1); if (e > 0) s += `<g data-p="enzymes" opacity="${r1(e * 100) / 100}">${enz.map(([x, y]) => circ(x, y, 5, C.enz)).join('')}</g>`;
    return s;
  };
  return {
    bg, dyn, dur: 2800,
    labels: [
      { id: 'stroma', tag: [455, 612] },
      { id: 'envelope', a: [500, 185], d: 'T' }, { id: 'granum', a: [215, 373], d: 'T' }, { id: 'photosystems', a: [689, 348], d: 'T' },
      { id: 'thylakoid', a: [365, 477], d: 'B' }, { id: 'enzymes', a: [640, 637], d: 'B' }, { id: 'lumen', a: [805, 505], d: 'B' }
    ],
    /* (both are HL words, B2.2.5: marked HL at SL, as their names on the picture are) */
    legend: [{ c: '#e2f78a', t: ctx.NAMES.photosystems, s: 'dot', hl: true }, { c: C.enz, t: ctx.NAMES.enzymes, s: 'dot', hl: true }]
  };
}

/* ======================================================================================================================
   3. pigment — white light on a chlorophyll molecule: red and blue absorbed, green reflected; an electron excited to a
      higher energy level (C1.3.5)
   ==================================================================================================================== */
function pigment(phase, ctx) {
  const M = [330, 470];
  let bg = `<g data-p="chlorophyll"><rect x="255" y="395" width="150" height="150" rx="34" fill="#1f6b46" stroke="#7fe0a4" stroke-width="3"/>
    ${[[285, 425], [375, 425], [285, 515], [375, 515]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#9fe8b8" stroke-width="3"/>`).join('')}
    <circle cx="330" cy="470" r="22" fill="#9fe8b8"/>${txt(330, 477, ctx.AXIS.mg, { size: 18, fill: '#0b2a1b', bg: '#9fe8b8' })}
    <path d="M405 520 C450 540, 440 590, 490 600 S540 650, 580 660" fill="none" stroke="#7fe0a4" stroke-width="7" stroke-linecap="round"/></g>`;
  /* the energy of one electron in chlorophyll */
  bg += `<path data-p="high excited" d="M690 600 H900 M690 300 H900" stroke="#cfe0ff" stroke-width="4"/>
    <path d="M420 465 C520 455, 600 450, 676 450" fill="none" stroke="#9fb4d8" stroke-width="2" stroke-dasharray="6 6"/>`;
  const beam = (col, off, t) => { const [x0, y0] = [40 + off, 140 - off * 0.5], [x1, y1] = [262 + off * 0.4, 405 - off * 0.3]; const e = mix([x0, y0], [x1, y1], t); return t > 0 ? `<path d="M${x0} ${y0} L${r1(e[0])} ${r1(e[1])}" stroke="${col}" stroke-width="6" stroke-linecap="round"/>` : ''; };
  const dyn = p => {
    const t = seg(p, 0, 0.4);
    let s = beam('#ff5a4a', -12, t) + beam('#4fe36a', 0, t) + beam('#5a8cff', 12, t);
    if (t >= 1) s += arrow(250, 392, 262, 405, 6, '#ff5a4a') + arrow(274, 393, 266, 401, 6, '#5a8cff');
    const g = seg(p, 0.4, 0.65); if (g > 0) { const e = mix([262, 405], [520, 172], g); s += `<path d="M262 405 L${r1(e[0])} ${r1(e[1])}" stroke="#4fe36a" stroke-width="6" stroke-linecap="round"/>`; if (g >= 1) s += arrow(500, 190, 522, 170, 6, '#4fe36a'); }
    s += glow(330, 470, 85, Math.sin(Math.PI * seg(p, 0.38, 0.7)) * 0.8);
    const j = seg(p, 0.55, 0.85), y = lerp(600, 300, j);
    s += part('excited high', (j > 0 ? `<path d="M720 590 V${r1(Math.min(588, y + 14))}" stroke="${C.e}" stroke-width="3" stroke-dasharray="6 6"/>` : '') + el(720, y));
    return s;
  };
  return {
    bg, dyn, dur: 3000,
    labels: [
      { id: 'white', tag: [96, 108] }, { id: 'reflected', tag: [578, 132] }, { id: 'high', tag: [830, 338] }, { id: 'low', tag: [830, 638] },
      { id: 'absorbed', a: [246, 398], d: 'L', to: 214 }, { id: 'chlorophyll', a: [330, 546], d: 'B' }, { id: 'excited', a: [720, 287], d: 'T' }
    ],
    legend: [{ c: C.e, t: ctx.KEYS.electron, s: 'dot' }]
  };
}

/* ======================================================================================================================
   4, 5. spectra — the absorption spectra of chlorophyll a, chlorophyll b and carotenoids (shapes drawn by hand) and the
      action spectrum of photosynthesis (C1.3.5, C1.3.6). The axis: wavelength / nm and the colours, from the sources
      (NASA: 380 to 700 nm; Wikipedia, Visible spectrum: each colour's range)
   ==================================================================================================================== */
const G = (l, m, s) => Math.exp(-((l - m) ** 2) / (2 * s * s));
export const CURVES = {
  chla: l => 0.95 * G(l, 430, 14) + 0.22 * G(l, 410, 22) + 0.62 * G(l, 662, 11) + 0.12 * G(l, 615, 18) + 0.06 * G(l, 580, 20),
  chlb: l => 0.85 * G(l, 455, 15) + 0.2 * G(l, 430, 18) + 0.42 * G(l, 642, 11) + 0.08 * G(l, 597, 20),
  carot: l => 0.4 * G(l, 425, 12) + 0.55 * G(l, 450, 13) + 0.62 * G(l, 478, 13),
  action: l => (0.36 + 0.55 * G(l, 440, 32) + 0.52 * G(l, 672, 17) - 0.12 * G(l, 520, 22)) / (1 + Math.exp((l - 694) / 5)) * (1 - 0.35 * G(l, 380, 12))
};
const X = l => 130 + (l - 380) * 2.5, Y = v => 600 - v * 400;
function spectra(phase, ctx) {
  const BAND = [[380, '#5b0f9e'], [415, '#7a1fd0'], [450, '#3b4dff'], [485, '#00c8ff'], [500, '#00d878'], [532, '#3fdc3f'], [565, '#c9ee00'], [578, '#ffe000'], [590, '#ffa500'], [608, '#ff7a10'], [625, '#ff3b1f'], [700, '#a80000']];
  const nar = ctx.narrow, fs = nar ? 12.5 / ctx.k : 19;
  /* the two axes and the band of colours: one part, which stays bright with any curve's card (a curve is read against them) */
  let ax = `<rect x="130" y="612" width="800" height="30" fill="url(#lgv-band)"/>
    <path d="M130 170 V600 H930" fill="none" stroke="#cfe0ff" stroke-width="3"/>`;
  [400, 500, 600, 700].forEach(l => { ax += `<path d="M${X(l)} 600 V610" stroke="#cfe0ff" stroke-width="3"/>` + txt(X(l), 670, String(l), { size: fs }); });
  const names = ctx.AXIS.colours.filter(n => !nar || !n[2]);
  names.forEach(([n, l]) => { ax += txt(X(l), nar ? 712 : 703, n, { size: fs, weight: 700, fill: '#C9D4EA' }); });
  ax += txt(530, nar ? 765 : 748, ctx.AXIS.x, { size: fs });
  ax += txt(78, 385, phase === 'act' ? ctx.AXIS.yAct : ctx.AXIS.yAbs, { size: fs, rot: -90 });
  let bg = `<defs><linearGradient id="lgv-band" x1="0" x2="1">${BAND.map(([l, c]) => `<stop offset="${r1((l - 380) / 320 * 1000) / 1000}" stop-color="${c}"/>`).join('')}</linearGradient></defs>` + part('chla carot action', ax);
  const path = (f, l1) => { let d = ''; for (let l = 380; l <= l1; l += 2) d += (l === 380 ? 'M' : 'L') + r1(X(l)) + ' ' + r1(Y(f(l))); return d; };
  const stroke = { chla: '#4fe0a0', chlb: '#c9ee6a', carot: '#ffa64d', action: '#ffffff' };
  const curve = (k, l1, o = 1, dash = '') => l1 > 381 ? `<path data-p="${k === 'chlb' ? 'chla' : k}" d="${path(CURVES[k], l1)}" fill="none" stroke="${stroke[k]}" stroke-width="${k === 'action' ? 5 : 4.5}" stroke-linejoin="round" stroke-linecap="round" opacity="${o}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>` : '';
  const act = phase === 'act';
  if (act) bg += curve('chla', 700, 0.75) + curve('chlb', 700, 0.75) + curve('carot', 700, 0.75);
  const dyn = p => act ? curve('action', lerp(380, 700, seg(p, 0, 1)), 1, '14 8')
    : curve('chla', lerp(380, 700, seg(p, 0, 0.42))) + curve('chlb', lerp(380, 700, seg(p, 0.29, 0.71))) + curve('carot', lerp(380, 700, seg(p, 0.58, 1)));
  const labels = [
    { id: 'chla', a: [X(662), Y(CURVES.chla(662)) - 3], d: 'T' }, { id: 'chlb', a: [X(642), Y(CURVES.chlb(642)) - 3], d: 'T' },
    { id: 'carot', a: [X(500) + 3, Y(CURVES.carot(500))], d: 'R', to: X(515) }
  ];
  if (act) labels.push({ id: 'action', a: [X(560), Y(CURVES.action(560)) - 4], d: 'T' });
  /* the graph read at one wavelength (view.js: a slider under the picture): an upright line, a mark on the band of
     colours, a point on each curve; the values go to the bars beside the slider (heights of the hand-drawn shapes) */
  const keys = act ? ['chla', 'chlb', 'carot', 'action'] : ['chla', 'chlb', 'carot'];
  const read = l => {
    /* (the line goes up from the band of colours to the highest curve at that wavelength, as a graph is read: it
       never runs on through the names above the curves) */
    const x = r1(X(l)), y0 = r1(Math.max(176, Math.min(...keys.map(k => Y(CURVES[k](l)))) - 18));
    let svg = `<path d="M${x} ${y0} V612" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="6 6" opacity=".9"/><path d="M${x} 646 l-9 14 h18 z" fill="#ffffff" stroke="#0b1424" stroke-width="1.5"/>`;
    keys.forEach(k => { svg += circ(X(l), Y(CURVES[k](l)), 8, stroke[k], ' stroke="#0b1424" stroke-width="2.5"'); });
    return { svg, colour: (ctx.AXIS.ranges.find(q => l < q[0]) || ctx.AXIS.ranges[ctx.AXIS.ranges.length - 1])[1], vals: keys.map(k => ({ k, v: CURVES[k](l), c: stroke[k], t: ctx.NAMES[k] })) };
  };
  return {
    bg, dyn, read, dur: act ? 2200 : 3400, labels, keep: [[100, 600, 960, 812]],
    legend: [{ c: stroke.chla, t: ctx.NAMES.chla, s: 'line' }, { c: stroke.chlb, t: ctx.NAMES.chlb, s: 'line' }, { c: stroke.carot, t: ctx.NAMES.carot, s: 'line' }].concat(act ? [{ c: '#ffffff', t: ctx.NAMES.action, s: 'dash' }] : [])
  };
}

/* ======================================================================================================================
   6. overview — water split on the thylakoids (oxygen out, hydrogen to the stroma); carbon dioxide and hydrogen make
      glucose in the stroma (C1.3.2, C1.3.3; the two stages named: C1.3.14, C1.3.19)
   ==================================================================================================================== */
function overview(phase, ctx) {
  const CX = 500, CY = 445, RX = 420, RY = 250, SX = 320, RC = [670, 455];
  let bg = `<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="${C.stroma2}" stroke="#9fe0b4" stroke-width="5"/>
    <ellipse cx="${CX}" cy="${CY}" rx="${RX - 11}" ry="${RY - 11}" fill="none" stroke="#9fe0b4" stroke-width="3"/>`;
  { let t = ''; for (let k = 0; k < 7; k++) t += `<rect x="${SX - 60}" y="${CY - 68 + k * 20}" width="120" height="14" rx="7" fill="${C.lumen}" stroke="#5fcf8a" stroke-width="3.5"/>`; bg += part('ld oxygen', t); }
  /* the Calvin cycle, as a ring of arrows */
  let ring = `<circle cx="${RC[0]}" cy="${RC[1]}" r="78" fill="none" stroke="#8fd9b4" stroke-width="10" stroke-dasharray="110 12"/>`;
  [0, 1, 2, 3].forEach(i => { const a = i * Math.PI / 2 + 0.55, x = RC[0] + 78 * Math.cos(a), y = RC[1] + 78 * Math.sin(a); ring += arrow(x - 12 * Math.sin(a) * -1, y - 12 * Math.cos(a), x + 14 * -Math.sin(a), y + 14 * Math.cos(a), 6, '#8fd9b4'); });
  bg += part('li', ring);
  bg += lightRay(250, 70, 300, 360);
  /* (the way of the oxygen, one part with the thylakoids: water in, oxygen out; the card "oxygen" keeps all of it bright) */
  bg += part('oxygen', water(80, 620) + arrow(104, 604, 256, 522, 10));
  bg += part('oxygen', arrow(268, 372, 168, 182, 10));
  bg += arrow(388, 455, 582, 455, 10, '#ffffff');
  bg += co2(880, 140) + arrow(860, 160, 728, 382, 10);
  bg += arrow(722, 528, 838, 690, 10);
  const dyn = p => {
    let s = photon(250, 70, 300, 360, seg(p, 0, 0.22));
    s += glow(SX, CY, 80, Math.sin(Math.PI * seg(p, 0.18, 0.5)) * 0.7);
    const w = seg(p, 0.12, 0.38); if (w > 0 && w < 1) { const [x, y] = mix([80, 620], [262, 518], w); s += part('oxygen', water(x, y)); }
    const o = seg(p, 0.4, 0.66); if (o > 0) { const [x, y] = mix([270, 370], [150, 150], o); s += part('oxygen', o2(x, y)); }
    const h = seg(p, 0.42, 0.68); if (h > 0 && h < 1) { const x = lerp(395, 580, h); s += hyd(x, 438) + hyd(x - 20, 472); }
    const c = seg(p, 0.3, 0.6); if (c > 0 && c < 1) { const [x, y] = mix([880, 140], [722, 390], c); s += co2(x, y); }
    s += `<g transform="rotate(${r1(seg(p, 0.55, 0.88) * 180)} ${RC[0]} ${RC[1]})"><circle cx="${RC[0]}" cy="${RC[1] - 78}" r="9" fill="#fff"/></g>`;
    const g = seg(p, 0.8, 1); if (g > 0) s += glucose(868, 728, g);
    return s;
  };
  return {
    bg, dyn, dur: 3400,
    labels: [
      { id: 'light', tag: [250, 46] }, { id: 'water', tag: [80, 668] }, { id: 'oxygen', tag: [128, 112] }, { id: 'hydrogen', tag: [486, 418] },
      { id: 'co2', tag: [868, 92] }, { id: 'glucose', tag: [868, 784] }, { id: 'ld', tag: [SX + 34, 574] }, { id: 'li', tag: [RC[0], 335] },
      { id: 'stroma', tag: [560, 640] }, { id: 'thylakoids', a: [SX - 60, 397], d: 'L', to: 214 }
    ],
    legend: []
  };
}

/* ======================================================================================================================
   7. limits — one way to vary each factor (a lamp's distance, sodium hydrogencarbonate, a water bath; oxygen bubbles
      from a water plant), and carbon dioxide enrichment: a closed greenhouse and a FACE ring (C1.3.7, C1.3.8).
      A method only: no reading, no rate, no result is drawn.
   ==================================================================================================================== */
function limits(phase, ctx) {
  let bg = `<path d="M60 300 L130 285 L130 375 L60 360 Z" fill="#5d6b80" stroke="#cfe0ff" stroke-width="3"/>
    <circle cx="132" cy="330" r="17" fill="${C.light}"/>
    <path d="M95 368 V560 M55 568 H135" stroke="#cfe0ff" stroke-width="6" stroke-linecap="round"/>
    <rect x="300" y="250" width="260" height="330" rx="14" fill="none" stroke="${C.glass}" stroke-width="4"/>
    <rect x="304" y="292" width="252" height="284" rx="10" fill="${C.water}" opacity=".85"/>
    <path d="M395 196 V520 A25 25 0 0 0 445 520 V196" fill="#2a6a8f" stroke="${C.glass}" stroke-width="3.5"/>
    <path d="M420 532 V382" stroke="#3fae6e" stroke-width="5"/>
    ${[[408, 400, -35], [432, 420, 35], [408, 450, -35], [432, 476, 35], [408, 502, -35]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="6" fill="#4fd07f" transform="rotate(${a} ${x} ${y})"/>`).join('')}
    <rect x="514" y="228" width="12" height="330" rx="6" fill="#e8eef8" stroke="#9fb0c8" stroke-width="2"/>
    <circle cx="520" cy="562" r="12" fill="#ff5a4a"/><rect x="517" y="420" width="6" height="140" fill="#ff5a4a"/>
    <path d="M150 616 H380" stroke="#cfe0ff" stroke-width="3"/>${arrow(200, 616, 150, 616, 3, '#cfe0ff')}${arrow(330, 616, 380, 616, 3, '#cfe0ff')}
    <path d="M150 604 V628 M380 604 V628" stroke="#cfe0ff" stroke-width="3"/>`;
  /* FACE: a ring of upright pipes round plants in a field */
  const FC = [825, 300], FR = [135, 42], pipes = [];
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; pipes.push([FC[0] + FR[0] * Math.cos(a), FC[1] + FR[1] * Math.sin(a)]); }
  let face = `<ellipse cx="${FC[0]}" cy="${FC[1] + 6}" rx="${FR[0] + 25}" ry="${FR[1] + 16}" fill="#203a26"/>`;
  const R = rng(3); for (let i = 0; i < 26; i++) { const a = R() * Math.PI * 2, r = Math.sqrt(R()) * 0.85, x = FC[0] + FR[0] * r * Math.cos(a), y = FC[1] + FR[1] * r * Math.sin(a); face += `<path d="M${r1(x)} ${r1(y)} l-6 -14 M${r1(x)} ${r1(y)} l0 -17 M${r1(x)} ${r1(y)} l6 -14" stroke="#5fd08a" stroke-width="3" stroke-linecap="round"/>`; }
  face += pipes.map(([x, y]) => `<path d="M${r1(x)} ${r1(y)} V${r1(y - 72)}" stroke="#d7dde8" stroke-width="5" stroke-linecap="round"/>`).join('');
  bg += part('face', face);
  /* a closed greenhouse */
  bg += `<g data-p="face"><path d="M700 760 V640 L830 575 L960 640 V760 Z" fill="#1c3448" stroke="${C.glass}" stroke-width="4"/>
    <path d="M830 575 V760 M700 700 H960" stroke="${C.glass}" stroke-width="2" opacity=".6"/>
    ${[730, 770, 870, 910].map(x => `<path d="M${x} 758 l-8 -22 M${x} 758 l0 -28 M${x} 758 l8 -22" stroke="#5fd08a" stroke-width="3.5" stroke-linecap="round"/>`).join('')}</g>`;
  const dyn = p => {
    let s = '';
    [0, 1, 2].forEach(i => { const o = seg(p, i * 0.08, i * 0.08 + 0.25); s += `<path d="M150 ${318 + i * 12} L${r1(lerp(150, 392, o))} ${r1(lerp(318 + i * 12, 300 + i * 40, o))}" stroke="${C.light}" stroke-width="2.5" opacity=".7"/>`; });
    { let b = ''; for (let i = 0; i < 6; i++) { const t = clamp((p - i * 0.12) / 0.5); if (t > 0) { const y = lerp(372, 212, t); b += `<circle cx="${r1(420 + Math.sin(t * 9 + i) * 3)}" cy="${r1(y)}" r="${r1(5 + t * 2)}" fill="none" stroke="#e8f6ff" stroke-width="2.5" opacity="${t < 1 ? 1 : 0.85}"/>`; } } s += part('bubbles', b); }
    pipes.forEach(([x, y], i) => { const t = (p * 1.6 + i / 14) % 1, a = Math.atan2(FC[1] - y, FC[0] - x); if (p > 0.05 && i % 2 === 0) s += co2(x + Math.cos(a) * 50 * t, y - 50 + Math.sin(a) * 18 * t, (1 - t) * 0.9 * (1 - seg(p, 0.8, 1))); });
    return s;
  };
  return {
    bg, dyn, dur: 3200,
    labels: [
      { id: 'distance', tag: [265, 648] },
      { id: 'lamp', a: [95, 289], d: 'T' }, { id: 'bubbles', a: [420, 300], d: 'T' }, { id: 'thermo', a: [520, 228], d: 'T' },
      { id: 'greenhouse', tag: [830, 790] }, { id: 'face', a: [FC[0] - 82, FC[1] - 105], d: 'T' }, { id: 'plant', a: [440, 474], d: 'R', to: 585 },
      { id: 'bath', a: [330, 580], d: 'B' }, { id: 'bicarb', a: [410, 528], d: 'B' }
    ],
    legend: []
  };
}

/* ======================================================================================================================
   8. psys — a photosystem seen from above: an array of pigments held by proteins; light energy passes from pigment to
      pigment to the reaction centre, which emits an excited electron (C1.3.9, C1.3.10)
   ==================================================================================================================== */
function psys(phase, ctx) {
  const O = [440, 440], pig = [];
  const rings = [[95, 78, 8], [175, 145, 14], [255, 210, 20]];
  rings.forEach(([rx, ry, n], ri) => { for (let i = 0; i < n; i++) { const a = (i + ri * 0.5) / n * Math.PI * 2; const k = (i * 7 + ri * 3) % 6; pig.push({ x: O[0] + rx * Math.cos(a), y: O[1] + ry * Math.sin(a), c: k === 0 ? C.car : k === 3 ? C.chlb : C.chl, ri }); } });
  /* the path of the energy: an outer pigment up and right, then inwards */
  const near = (x, y, ri) => pig.filter(q => q.ri === ri).reduce((b, q) => Math.hypot(q.x - x, q.y - y) < Math.hypot(b.x - x, b.y - y) ? q : b);
  const hop = [near(650, 310, 2), near(590, 350, 1), near(530, 380, 1), near(505, 405, 0)];
  /* (the energy passes to a pigment that absorbs at a longer wavelength: a carotenoid, chlorophyll b, chlorophyll a, the
     reaction centre; never from chlorophyll a to chlorophyll b) */
  [C.car, C.chlb, C.chl, C.chl].forEach((c, i) => { hop[i].c = c; });
  const carot = pig.filter(q => q.c === C.car && q.ri === 2).reduce((b, q) => q.y < b.y && q.x < 440 ? q : b, { x: 0, y: 1e9 });
  const chlL = pig.filter(q => q.ri === 2 && q.c === C.chl).reduce((b, q) => q.x < b.x ? q : b, { x: 1e9, y: 0 });
  let bg = `<ellipse cx="${O[0]}" cy="${O[1]}" rx="330" ry="270" fill="#12392b" stroke="#5fcf8a" stroke-width="4"/>
    <ellipse cx="${O[0]}" cy="${O[1]}" rx="300" ry="244" fill="none" stroke="#5fcf8a" stroke-width="1.5" stroke-dasharray="4 8" opacity=".6"/>`;
  bg += part('pigchl', pig.map(q => circ(q.x, q.y, 15, q.c, ' stroke="#0b2216" stroke-width="2"')).join(''));
  bg += part('rc', circ(O[0] - 20, O[1], 19, '#ffe27a', ' stroke="#fff" stroke-width="2.5"') + circ(O[0] + 20, O[1], 19, '#ffe27a', ' stroke="#fff" stroke-width="2.5"'));
  bg += lightRay(900, 118, hop[0].x + 14, hop[0].y - 12);
  const E1 = [O[0] + 40, O[1] + 10], E2 = [900, 610];
  const dyn = p => {
    let s = photon(900, 118, hop[0].x + 14, hop[0].y - 12, seg(p, 0, 0.2));
    const pts = hop.concat([{ x: O[0], y: O[1] }]);
    pts.forEach((q, i) => { const t0 = 0.2 + i * 0.12; s += glow(q.x, q.y, i === pts.length - 1 ? 50 : 26, Math.sin(Math.PI * clamp((p - t0) / 0.22)) * (i === pts.length - 1 ? 1 : 0.9)); });
    /* (the energy's way from pigment to pigment and the electron that the reaction centre emits: bright with its card) */
    let way = '';
    for (let i = 0; i < pts.length - 1; i++) { const t = seg(p, 0.24 + i * 0.12, 0.34 + i * 0.12); if (t > 0) way += `<path d="M${r1(pts[i].x)} ${r1(pts[i].y)} L${r1(lerp(pts[i].x, pts[i + 1].x, t))} ${r1(lerp(pts[i].y, pts[i + 1].y, t))}" stroke="${C.light}" stroke-width="4.5" stroke-linecap="round" opacity=".95"/>`; }      /* (energy: a solid line; the electron's way is dotted: two things, two styles, both in the key) */
    const e = seg(p, 0.82, 1); if (e > 0) { const [x, y] = mix(E1, E2, e); way += trail([E1, [x, y]], 0.8) + el(x, y); }
    if (way) s += part('rc', way);
    return s;
  };
  return {
    bg, dyn, dur: 3600,
    labels: [
      { id: 'light', tag: [930, 92] },
      { id: 'rc', a: [O[0], O[1] - 19], d: 'T' }, { id: 'accessory', a: [carot.x, carot.y - 15], d: 'T' },
      { id: 'pigchl', a: [chlL.x - 15, chlL.y], d: 'L', to: 160 }, { id: 'protein', a: [O[0] - 90, O[1] + 259], d: 'B' },
      { id: 'excited', a: [E2[0], E2[1] + 9], d: 'B' }
    ],
    legend: [{ c: C.chl, t: ctx.KEYS.chla, s: 'dot' }, { c: C.chlb, t: ctx.KEYS.chlb, s: 'dot' }, { c: C.car, t: ctx.KEYS.carot, s: 'dot' }, { c: '#ffe27a', t: ctx.KEYS.special, s: 'pair' },
      { c: C.light, t: ctx.KEYS.energy, s: 'line' }, { c: C.e, t: ctx.KEYS.electron, s: 'dot' }]
  };
}

/* ======================================================================================================================
   9–13. thyl — a thylakoid in section: stroma above, the membrane with photosystem II, cytochrome b6f, photosystem I and
      ATP synthase in that order, the small lumen, the membrane's other side, stroma below. Not to scale.
      Phases: psII (photolysis, C1.3.11), chain (electron transport and proton pumping, C1.3.12, B2.2.5), atp
      (chemiosmosis, C1.3.12), psI (reduction of NADP, C1.3.13), all (one system, cyclic route: C1.3.14, C1.3.12)
   ==================================================================================================================== */
const T = { m1: 335, m2: 395, l2: 495, m3: 555, PSII: [225, 355], B6F: [430, 510], PSI: [590, 720], SYN: 900 };
const RCII = [290, 352], RCI = [655, 352], PQ0 = [378, 365], PQ1 = [418, 365], PC0 = [538, 470], PC1 = [578, 470];
/* places in the lumen where protons stand (clear of every complex) */
const LUMEN = [[335, 466], [360, 482], [382, 462], [405, 480], [452, 470], [480, 482], [500, 464], [380, 418], [405, 432], [540, 420], [560, 444],
  [745, 420], [770, 450], [800, 470], [825, 428], [760, 482], [845, 462], [690, 470], [645, 480]];
function membrane(y0, y1, o = 1) {
  let s = `<g opacity="${o}"><rect x="-800" y="${y0}" width="${W + 1600}" height="${y1 - y0}" fill="${C.tail}"/>`;
  for (let x = -794; x < W + 800; x += 13) s += circ(x, y0 + 6, 6, C.head) + circ(x, y1 - 6, 6, C.head);
  return s + '</g>';
}
/* a photosystem's reaction centre in the section: its two special chlorophylls, ringed in white as in step 8 (a plain
   yellow dot is an electron; the key says which is which) */
const rcPair = at => circ(at[0] - 9, at[1], 8, '#ffe27a', ' stroke="#ffffff" stroke-width="2.5"') + circ(at[0] + 9, at[1], 8, '#ffe27a', ' stroke="#ffffff" stroke-width="2.5"');
function thyl(phase, ctx) {
  const nar = ctx.narrow;
  /* (the spaces run on past the sheet's edges: on a wide or tall screen the picture has no empty band at its sides) */
  let bg = `<rect x="-800" y="-600" width="${W + 1600}" height="${T.m1 + 600}" fill="${C.stroma}"/><rect x="-800" y="${T.m2}" width="${W + 1600}" height="${T.l2 - T.m2}" fill="${C.lumen}"/>
    <rect x="-800" y="${T.m3}" width="${W + 1600}" height="${H - T.m3 + 600}" fill="${C.stroma}"/>`;
  bg += membrane(T.m1, T.m2) + membrane(T.l2, T.m3, 0.55);
  const box = ([a, b], fill, y0 = 300, y1 = 448) => `<rect x="${a}" y="${y0}" width="${b - a}" height="${y1 - y0}" rx="26" fill="${fill}" stroke="#0b1424" stroke-width="3"/>`;
  /* (in the cyclic route of step 13 photosystem II takes no part: it is drawn pale) */
  bg += `<g data-p="wherePl"${phase === 'all' && ctx.mode === 'cyc' ? ' opacity=".38"' : ''}>${box(T.PSII, C.psII) + txt(290, 432, ctx.AXIS.two, { size: 40, weight: 900, fill: '#06180e', bg: C.psII }) + rcPair(RCII)}</g>`;
  bg += box(T.B6F, C.b6f, 305, 448);
  bg += part('psI whereNadp', box(T.PSI, C.psI) + txt(655, 432, ctx.AXIS.one, { size: 40, weight: 900, fill: '#03130b', bg: C.psI }) + rcPair(RCI));
  /* ATP synthase: the ring in the membrane, the stalk, the head in the stroma */
  bg += `<g data-p="synthase whereAtp"><rect x="${T.SYN - 38}" y="338" width="76" height="54" rx="12" fill="${C.syn}" stroke="#0b1424" stroke-width="3"/>
    <rect x="${T.SYN - 6}" y="286" width="12" height="54" fill="${C.syn}"/>
    <ellipse cx="${T.SYN}" cy="238" rx="58" ry="50" fill="${C.syn2}" stroke="#0b1424" stroke-width="3"/></g>`;
  /* (step 13 has a choice: the non-cyclic route, or the cyclic one, in which photosystem II and water take no part) */
  const cyc = phase === 'all' && ctx.mode === 'cyc';
  const lightII = phase === 'psII' || (phase === 'all' && !cyc), lightI = phase === 'psI' || phase === 'all';
  if (lightII) bg += lightRay(210, 118, 262, 294);
  if (lightI) bg += lightRay(575, 118, 626, 294);
  /* (the cyclic route is a closed loop: from photosystem I over the membrane to cytochrome b6f, through it, along the
     lumen with the carrier, and into photosystem I again) */
  if (cyc) bg += `<path d="M640 298 C620 205, 520 205, 482 300 L470 372 L${PC0[0]} ${PC0[1]} L${PC1[0]} ${PC1[1]} L622 452 L${RCI[0] - 6} ${RCI[1] + 14}" fill="none" stroke="${C.e}" stroke-width="3" stroke-dasharray="9 7" stroke-linejoin="round"/>${arrow(490, 280, 482, 302, 3, C.e)}${arrow(628, 440, 644, 384, 3, C.e)}`;
  const pq = at => hexagon(at[0], at[1], 15, C.pq, '#25324a');
  const pc = at => circ(at[0], at[1], 14, C.pc, ' stroke="#08283a" stroke-width="2"');
  const lumenH = (n, o = 1) => LUMEN.slice(0, n).map(([x, y]) => hp(x, y, o)).join('');
  const labels = [], legend = [];
  let dyn = () => '', dur = 3600, live = null;
  const keyE = { c: C.e, t: ctx.KEYS.electron, s: 'dot' }, keyH = { c: C.h, t: ctx.KEYS.proton, s: 'dot' }, keyRC = { c: '#ffe27a', t: ctx.KEYS.rc, s: 'pair' };
  if (phase === 'psII') {
    dur = 4200;
    bg += pc(PC0);
    dyn = p => {
      let s = photon(210, 118, 262, 294, seg(p, 0, 0.18)) + glow(RCII[0], RCII[1], 30, Math.sin(Math.PI * seg(p, 0.14, 0.38)));
      s += pq(PQ0);
      const e = seg(p, 0.24, 0.42); s += el(...mix(RCII, [PQ0[0], PQ0[1] - 2], e));
      const sp = seg(p, 0.48, 0.6);
      if (sp < 1) s += water(268, 472, 1 - sp) + water(306, 474, 1 - sp);
      const o = seg(p, 0.6, 0.92); if (sp > 0.5) { const [x, y] = along([[288, 472], [288, 528], [250, 610], [230, 642]], o); s += part('oxygen', o2(x, y)); }
      [[335, 466], [360, 482], [382, 462], [405, 480]].forEach(([x, y], i) => { const t = seg(p, 0.58 + i * 0.03, 0.74 + i * 0.03); if (t > 0) s += hp(...mix([290, 470], [x, y], t), t); });
      for (let i = 0; i < 4; i++) { const t = seg(p, 0.6 + i * 0.04, 0.78 + i * 0.04); if (t > 0 && t < 1) s += el(...mix([288, 470], [290 + (i - 1.5) * 12, 446], t)); }
      return s;
    };
    labels.push({ id: 'light', tag: [184, 100] }, { id: 'psII', a: [312, 300], d: 'T' }, { id: 'excited', a: [PQ0[0], PQ0[1] - 15], d: 'T' }, { id: 'oxygen', a: [230, 654], d: 'B' });
    legend.push(keyE, keyH, { c: C.o, t: ctx.KEYS.water, s: 'water' }, { c: C.o, t: ctx.KEYS.oxygen, s: 'o2' }, keyRC);
  } else if (phase === 'chain') {
    dur = 4400;
    const pumped = [[452, 470], [480, 482], [500, 464]], from = [[452, 250], [480, 222], [503, 262]];
    dyn = p => {
      let s = part('pumped', lumenH(4));
      const q = seg(p, 0, 0.24), pqAt = mix(PQ0, PQ1, q); s += pq(pqAt);
      const pcT = seg(p, 0.52, 0.7), pcAt = mix(PC0, PC1, pcT); s += pc(pcAt);
      let e;
      if (p < 0.26) e = [pqAt[0], pqAt[1] - 2];
      else if (p < 0.4) e = mix([PQ1[0], PQ1[1] - 2], [470, 372], seg(p, 0.26, 0.38));
      else if (p < 0.52) e = mix([470, 372], [PC0[0], PC0[1] - 2], seg(p, 0.4, 0.5));
      else if (p < 0.72) e = [pcAt[0], pcAt[1] - 2];
      else e = along([[PC1[0], PC1[1] - 2], [622, 452], RCI], seg(p, 0.72, 0.88));
      s += trail([PQ0, [470, 372], PC0, PC1, [622, 452], RCI], 0.35 + 0.35 * seg(p, 0, 0.2)) + el(...e);
      s += part('pumped', pumped.map((d, i) => hp(...along([from[i], [468 + i * 6, 300], [468 + i * 6, 452], d], seg(p, 0.3 + i * 0.05, 0.6 + i * 0.05)))).join(''));
      const ins = seg(p, 0.6, 0.86);
      if (ins > 0) s += part('pumped', equal(ins, nar, ctx));
      return s;
    };
    labels.push({ id: 'carrier', a: [PQ1[0], PQ1[1] - 15], d: 'T' }, { id: 'b6f', a: [470, 305], d: 'T', ext: true }, { id: 'psI', a: [672, 300], d: 'T' },
      { id: 'carrier', a: [PC1[0], PC1[1] + 14], d: 'B', key: 'carrier2' }, { id: 'pumped', a: [480, 491], d: 'B' });
    legend.push(keyE, keyH, keyRC);
  } else if (phase === 'atp') {
    /* the protons as they really move (protons.js: many, each on a random walk; the only way across is ATP synthase;
       crossings counted both ways). Until 17 Nov 2026 four protons went up drawn paths, once. The picture goes on while
       the reader reads (live); the lumen is kept full by the chain (a proton pumped in at cytochrome b6f for each that
       leaves). Each proton that crosses turns the ring one step (back, if it crosses back); for every four that
       cross, the picture shows one ATP made (the picture's own pace: no number of protons for an ATP is claimed). */
    dur = 700;
    const K = ctx.keep; if (!K.S) Object.assign(K, { S: makeProtons(), acc: 0, rot: 0, made: 0, atp: [], done: false, paused: false });
    const S = K.S, ADP = [728, 200], AT = [945, 132], AD1 = [866, 228], STEP = 360 / 14, net = () => S.c.up - S.c.down;
    const spokes = [0, 60, 120].map(a => `<path d="M${T.SYN} 365 l${r1(26 * Math.cos(a * Math.PI / 180))} ${r1(9 * Math.sin(a * Math.PI / 180))}" stroke="#ffd0e6" stroke-width="3"/>`).join('');
    const draw = (still = false) => {
      /* (the protons, the ADP and the ATP belong to the card "ATP synthase", whose line is about them: each piece
         carries its part, so all of them stay bright with that card) */
      let s = '';
      for (const m of S.M) { const [x, y] = S.at(m); s += hp(x, y, m.f).replace('<g ', '<g data-p="synthase" ') + (m.id === PR.HERO && !still ? circ(x, y, 15, 'none', ' data-p="synthase" stroke="#ffffff" stroke-width="2.5"') : ''); }
      s += part('synthase', `<g transform="rotate(${r1(K.rot)} ${T.SYN} 365)" opacity=".9">${spokes}</g><g transform="rotate(${r1(K.rot * 0.6)} ${T.SYN} 238)">${circ(T.SYN + 34, 238, 6, '#ffd0e6')}</g>`);
      for (const t0 of K.atp) {
        const a = S.t - t0;
        if (a < 1) { const [x, y] = mix(ADP, AD1, ease(a)); s += part('synthase', pillShape(x, y, 56, '#9fb0c8') + circ(x + 36, y, 8, C.p)); }
        else if (a < 2.3) { const q = ease(clamp((a - 1) / 1.2)), [x, y] = mix(AD1, AT, q); s += part('synthase', glow(x, y, 26, 1 - q) + pillShape(x, y, 56, '#ffcf5a', q < 1 ? 1 : 0)); }
      }
      /* (the one still of Reduce motion carries an arrow: the net movement of the protons, through ATP synthase: from its
         opening in the lumen to its opening in the stroma) */
      if (still) s += arrow(PR.IN[0] - 8, PR.IN[1] + 78, PR.OUT[0] - 4, PR.OUT[1] - 8, 9, '#ffb3a7').replace(/<(path|polygon|line) /g, '<$1 data-p="synthase" ');
      return s;
    };
    dyn = () => draw();
    live = {
      tick(dt) {
        dt = Math.min(dt, 100);
        if (!K.paused && !K.done) {
          K.acc += dt / 1000 / PR.DT; const n = Math.min(6, Math.floor(K.acc)); K.acc -= n; if (n) S.step(n);
          if (S.t >= PR.END) K.done = true;
          while (Math.floor(net() / 4) > K.made) { K.made++; K.atp.push(S.t); }
          K.atp = K.atp.filter(t0 => S.t - t0 < 2.4);
        }
        K.rot += (net() * STEP - K.rot) * (1 - Math.exp(-dt / 220));
        return draw();
      },
      still() { while (S.t < PR.STILL - 1e-9) S.step(30); K.done = true; K.rot = net() * STEP; K.atp = []; return draw(true); },
      jump(secs) { const to = Math.min(secs, PR.END); while (S.t < to - 1e-9) S.step(); if (S.t >= PR.END) K.done = true; K.rot = net() * STEP; K.made = Math.max(K.made, Math.floor(net() / 4)); K.atp = []; return draw(); },
      pause(v) { K.paused = !!v; }, stop() {},
      state: () => { const h = S.M.find(m => m.id === PR.HERO), n = S.count(); return { secs: S.t, steps: S.steps, up: S.c.up, down: S.c.down, lumen: n.l + n.pass + n.pump, stroma: n.s, done: K.done, paused: K.paused, seed: PR.SEED, hero: h ? { w: h.w, at: S.at(h) } : null }; },
      strip: () => ({ head: ctx.KEYS.crossed, a: [ctx.KEYS.toLumen, S.c.down, '↓'], b: [ctx.KEYS.toStroma, S.c.up, '↑'], secs: Math.floor(S.t + 1e-6), done: K.done, paused: K.paused, end: PR.END })
    };
    labels.push({ id: 'synthase', a: [T.SYN, 188], d: 'T' }, { id: 'adp', pill: ADP, fill: '#b9c6da', ink: '#0a1020' }, { id: 'atp', pill: AT, fill: '#ffcf5a', ink: '#2a1c00' });
    /* (the part of the stroma whose protons are drawn: as large as the lumen shown, so the two numbers of protons compare
       two concentrations; a proton that leaves it is gone from the picture) */
    bg += `<rect x="${PR.SX0}" y="${PR.SY0}" width="${PR.SX1 - PR.SX0}" height="${PR.SY1 - PR.SY0}" rx="10" fill="none" stroke="#cfe0ff" stroke-width="2" stroke-dasharray="6 8" opacity=".55"/>`;
    legend.push(keyH, ...(ctx.FAST ? [] : [{ c: '#ffffff', t: ctx.KEYS.followed, s: 'ring' }]), { c: C.p, t: ctx.KEYS.phosphate, s: 'dot' }, { c: '#cfe0ff', t: ctx.KEYS.watched, s: 'dash' });
  } else if (phase === 'psI') {
    dur = 4200;
    /* (at rest the next NADP stands where the electrons arrive, so their way ends on NADP; the reduced NADP made there
       has moved away, towards the Calvin cycle) */
    const NA = [760, 268], NB = [760, 150], NW = NA, HS = [712, 205];
    bg += pq(PQ0);
    dyn = p => {
      let s = photon(575, 118, 626, 294, seg(p, 0, 0.18)) + glow(RCI[0], RCI[1], 30, Math.sin(Math.PI * seg(p, 0.12, 0.32)));
      /* (the electrons' way to NADP belongs to the card "reduced NADP"; the carrier that brings photosystem I its next
         electron belongs to the card "photosystem I") */
      s += part('rnadp', trail([RCI, [702, 300], NA], 0.6));
      [0, 1].forEach(i => { const t = seg(p, 0.24 + i * 0.08, 0.44 + i * 0.08); if (t > 0 && t < 1) s += part('rnadp', el(...along([RCI, [702, 300], NA], t))); });
      const h = seg(p, 0.38, 0.58); if (h < 1) s += hp(...mix(HS, [NA[0] - 30, NA[1] - 12], h));
      const r = seg(p, 0.58, 0.68), m = seg(p, 0.7, 0.92);
      if (r < 1) s += pillShape(NA[0], NA[1], 62, '#8fe0cf'); else s += part('rnadp', pillShape(...mix(NA, NB, m), 128, '#3fbfa5', m < 1 ? 1 : 0));
      s += glow(NA[0], NA[1], 40, Math.sin(Math.PI * r));
      const pcT = seg(p, 0.5, 0.64); s += part('psI', pc(mix(PC0, PC1, pcT)));
      const e2 = seg(p, 0.64, 0.84); if (e2 < 1) s += part('psI', el(...along([[PC0[0] + 40 * pcT, PC0[1] - 2], [622, 452], RCI], e2)));
      s += hp(HS[0] - 24, HS[1] + 24, seg(p, 0.6, 0.8));
      return s;
    };
    /* (photosystem I is named from below: above it, on the stroma side, NADP is reduced, and a name there covered that) */
    labels.push({ id: 'light', tag: [552, 100] }, { id: 'psI', a: [655, 448], d: 'B', pin: [692, 468] },
      { id: 'rnadp', pill: NB, fill: '#3fbfa5', ink: '#03211b' }, { id: 'nadp', pill: NW, fill: '#8fe0cf', ink: '#03211b' });
    legend.push(keyE, keyH, keyRC);
  } else {
    dur = 5200;
    const NA = [760, 268], NB = [760, 150];
    const pump = p => [[452, 250], [480, 222]].map((f, i) => hp(...along([f, [468 + i * 8, 300], [468 + i * 8, 452], [452 + i * 28, 486]], seg(p, 0.3 + i * 0.06, 0.55 + i * 0.06)))).join('');
    const flow = p => [[800, 470], [825, 428]].map((g, i) => hp(...along([g, [T.SYN, 476], [T.SYN, 365], [948, 318], [[946, 318], [972, 310]][i]], seg(p, 0.5 + i * 0.1, 0.85 + i * 0.1)))).join('')
      + `<g transform="rotate(${r1(seg(p, 0.5, 1) * 720)} ${T.SYN} 238)">${circ(T.SYN + 34, 238, 6, '#ffd0e6')}</g>`;
    const atpOut = p => { const a = seg(p, 0.8, 0.95); return a > 0 ? part('whereAtp', pillShape(945, 132, 56, '#ffcf5a', a)) : ''; };
    if (cyc) {
      /* the cyclic route: light on photosystem I only; its electrons return to the chain (to cytochrome b6f), which pumps
         protons; ATP is made; no water is split and no NADP is reduced */
      const loop = [RCI, [640, 298], [622, 232], [560, 208], [500, 232], [482, 300], [470, 372], PC0, PC1, [622, 452], RCI];
      dyn = p => {
        let s = photon(575, 118, 626, 294, seg(p, 0.02, 0.16)) + glow(RCI[0], RCI[1], 28, Math.sin(Math.PI * seg(p, 0.12, 0.3)));
        s += pq(PQ0) + pc(PC0);
        for (let i = 0; i < 3; i++) { const t = seg(p, 0.12 + i * 0.1, 0.72 + i * 0.1); if (t > 0 && t < 1) s += el(...along(loop, t)); }
        s += lumenH(9) + pump(p) + flow(p) + atpOut(p);
        return s;
      };
      labels.push({ id: 'cyclic', a: [560, 230], d: 'T' }, { id: 'whereAtp', a: [T.SYN, 188], d: 'T' }, { id: 'psI', a: [690, 300], d: 'T' },
        { id: 'nadp', pill: NA, fill: '#8fe0cf', ink: '#03211b' }, { id: 'atp', pill: [945, 132], fill: '#ffcf5a', ink: '#2a1c00' });
    } else {
      dyn = p => {
        let s = photon(210, 118, 262, 294, seg(p, 0, 0.14)) + photon(575, 118, 626, 294, seg(p, 0.02, 0.16));
        s += glow(RCII[0], RCII[1], 28, Math.sin(Math.PI * seg(p, 0.1, 0.26))) + glow(RCI[0], RCI[1], 28, Math.sin(Math.PI * seg(p, 0.12, 0.3)));
        const path = [RCII, PQ0, PQ1, [470, 372], PC0, PC1, [622, 452], RCI, [702, 300], NA];
        s += trail(path, 0.55) + pq(PQ0) + pc(PC0);
        for (let i = 0; i < 3; i++) { const t = seg(p, 0.12 + i * 0.1, 0.62 + i * 0.1); if (t > 0 && t < 1) s += el(...along(path, t)); }
        const sp = seg(p, 0.12, 0.26);
        s += part('wherePl', (sp < 1 ? water(268, 472, 1 - sp) : '') + (sp > 0.4 ? o2(...along([[288, 472], [288, 528], [250, 610], [230, 642]], seg(p, 0.26, 0.5))) : ''));
        s += lumenH(9) + pump(p) + flow(p) + atpOut(p);
        const r = seg(p, 0.78, 0.86), m = seg(p, 0.86, 1);
        s += part('whereNadp', r < 1 ? pillShape(NA[0], NA[1], 62, '#8fe0cf') : pillShape(...mix(NA, NB, m), 128, '#3fbfa5', m < 1 ? 1 : 0));
        return s;
      };
      labels.push({ id: 'wherePl', a: [292, 448], d: 'B', pin: [244, 468] }, { id: 'whereAtp', a: [T.SYN, 188], d: 'T' },
        { id: 'whereNadp', a: [702, 300], d: 'T' }, { id: 'rnadp', pill: NB, fill: '#3fbfa5', ink: '#03211b' }, { id: 'nadp', pill: NA, fill: '#8fe0cf', ink: '#03211b' },
        { id: 'atp', pill: [945, 132], fill: '#ffcf5a', ink: '#2a1c00' });
    }
    legend.push(keyE, keyH, keyRC);
  }
  const places = [
    { t: ctx.PLACES.stroma, x: 14, y: 34 }, { t: ctx.PLACES.membrane, n: ctx.PLACES.membraneN, x: 14, y: 360 },
    { t: ctx.PLACES.lumen, x: 14, y: 452 }, { t: ctx.PLACES.stroma, x: 14, y: 592 }
  ];
  const keep = [[T.SYN - 60, 186, T.SYN + 60, 292]];      /* (no name on the head of ATP synthase) */
  if (lightII) keep.push([196, 112, 276, 298]);
  if (lightI) keep.push([561, 112, 640, 298]);
  if (phase === 'chain') keep.push([628, 586, 996, 812]);
  return { bg, dyn, dur, labels, places, legend, keep, live };
}
/* two equal volumes, side by side: the concentration of protons (the numbers are not the real numbers: text.js SIMPLE) */
function equal(o, nar, ctx) {
  const fs = nar ? 12.5 / ctx.k : 19;
  let s = `<g opacity="${r1(o * 100) / 100}"><rect x="632" y="590" width="360" height="218" rx="14" fill="#0b1424" stroke="#cfe0ff" stroke-width="2"/>`;
  s += txt(812, nar ? 622 : 616, nar ? ctx.KEYS.equalN : ctx.KEYS.equal, { size: fs, bg: '#0b1424' });
  s += `<rect x="662" y="634" width="120" height="120" fill="${C.stroma}" stroke="#ffffff" stroke-width="2" stroke-dasharray="6 5"/>
    <rect x="842" y="634" width="120" height="120" fill="${C.lumen}" stroke="#ffffff" stroke-width="2" stroke-dasharray="6 5"/>`;
  [[700, 670], [748, 722]].forEach(([x, y]) => { s += hp(x, y); });
  const R = rng(11), pts = [];
  while (pts.length < 12) { const x = 856 + R() * 92, y = 648 + R() * 92; if (pts.every(([u, v]) => Math.hypot(u - x, v - y) > 22)) pts.push([x, y]); }
  pts.forEach(([x, y]) => { s += hp(x, y); });
  s += txt(722, 790, ctx.KEYS.eqStroma, { size: fs, bg: '#0b1424' }) + txt(902, 790, ctx.KEYS.eqLumen, { size: fs, bg: '#0b1424' });
  return s + '</g>';
}

/* ======================================================================================================================
   14–16. calvin — the Calvin cycle in the stroma, three turns at once. The compounds stand at their places round the
      ring all the time (a stroma holds all of them at once); each step follows one batch (bright) through its reaction.
      Carbon atoms are counted: 3 RuBP (5 C) + 3 CO₂ = 6 GP (3 C) → 6 triose phosphate → 5 back to 3 RuBP, 1 leaves.
   ==================================================================================================================== */
const RING = { x: 470, y: 430, rx: 270, ry: 230 };
const onRing = a => [RING.x + RING.rx * Math.cos(a), RING.y + RING.ry * Math.sin(a)];
function mol(x, y, nC, pL, pR, sugar = false, o = 1, lit = false) {
  const w = nC * 18 + (pL ? 16 : 0) + (pR ? 16 : 0); let cx = x - w / 2 + (pL ? 16 : 0) + 9, s = '';
  if (lit) s += `<rect x="${r1(x - w / 2 - 6)}" y="${r1(y - 14)}" width="${r1(w + 12)}" height="28" rx="14" fill="none" stroke="${C.light}" stroke-width="2.5"/>`;
  s += `<path d="M${r1(x - w / 2 + 7)} ${r1(y)} H${r1(x + w / 2 - 7)}" stroke="#9fb0c8" stroke-width="3"/>`;
  if (pL) s += circ(x - w / 2 + 7, y, 7, C.p);
  for (let i = 0; i < nC; i++) s += circ(cx + i * 18, y, 8.5, sugar ? C.sugar : C.c);
  if (pR) s += circ(x + w / 2 - 7, y, 7, C.p);
  return `<g opacity="${r1(o * 100) / 100}">${s}</g>`;
}
const rubp = (x, y, o, lit) => mol(x, y, 5, true, true, true, o, lit);      /* (RuBP is a sugar phosphate: the sugar's colour; GP is not a sugar) */
const gp = (x, y, o, lit) => mol(x, y, 3, false, true, false, o, lit);
const tp = (x, y, o, lit) => mol(x, y, 3, false, true, true, o, lit);
function calvin(phase, ctx) {
  const TOP = [[470, 172], [470, 200], [470, 228]];
  const RIGHT = [[712, 395], [798, 395], [712, 430], [798, 430], [712, 465], [798, 465]];
  const BOT = [[428, 632], [512, 632], [428, 664], [512, 664], [428, 696], [512, 696]];
  const RUBISCO = onRing(-Math.PI / 4), RED = onRing(Math.PI / 4), REG = onRing(Math.PI);
  const OUT = [118, 690];
  let bg = `<ellipse cx="${RING.x}" cy="${RING.y}" rx="${RING.rx}" ry="${RING.ry}" fill="none" stroke="#2f6a4f" stroke-width="16"/>`;
  [-0.62, 0.55, 2.2, 3.6].forEach(a => { const [x, y] = onRing(a), [u, v] = onRing(a + 0.09); bg += arrow(x, y, u + (u - x) * 0.6, v + (v - y) * 0.6, 8, '#4f9a76'); });
  /* (step 16 counts its triose phosphates: six in all, five stay to make RuBP and ONE leaves; that one is drawn by the
     motion, where it is) */
  bg += TOP.map(([x, y]) => rubp(x, y)).join('') + RIGHT.map(([x, y]) => gp(x, y)).join('') + (phase === 'regen' ? BOT.slice(0, 5) : BOT).map(([x, y]) => tp(x, y)).join('');
  bg += `<ellipse data-p="rubisco" cx="${r1(RUBISCO[0])}" cy="${r1(RUBISCO[1])}" rx="36" ry="30" fill="${C.enz}" stroke="#4a1030" stroke-width="2.5"/>`;
  bg += co2(880, 96) + co2(930, 150) + co2(900, 200);      /* (three, as the line under the picture counts) */
  const labels = [], legend = [{ c: C.c, t: ctx.KEYS.carbon, s: 'dot' }, { c: C.sugar, t: ctx.KEYS.sugarC, s: 'dot' }, { c: C.p, t: ctx.KEYS.phosphate, s: 'dot' }];
  let dyn = () => '', dur = 3800;
  const batch = (pos, maker, t, o = 1) => pos.map(([x, y]) => maker(x, y, o, true)).join('');
  if (phase === 'fix') {
    bg += arrow(855, 112, RUBISCO[0] + 44, RUBISCO[1] - 26, 8);
    dyn = p => {
      let s = '';
      const c = seg(p, 0, 0.35); if (c < 1) [[880, 96], [930, 150], [900, 200]].forEach(([x, y], i) => { s += co2(...mix([x, y], RUBISCO, seg(p, i * 0.05, 0.3 + i * 0.05))); });
      const r = seg(p, 0.1, 0.42); if (r < 1) s += TOP.map(([x, y], i) => rubp(...mix([x, y], [RUBISCO[0] - 10, RUBISCO[1] - 20 + i * 18], r), 1, true)).join('');
      s += glow(RUBISCO[0], RUBISCO[1], 60, Math.sin(Math.PI * seg(p, 0.38, 0.56)));
      const g = seg(p, 0.52, 0.95);
      if (g > 0 && p < 1) s += RIGHT.map(([x, y], i) => { const a = lerp(-Math.PI / 4, 0, g), [u, v] = onRing(a); return gp(lerp(u, x, g), lerp(v + (i - 2.5) * 16, y, g), 1 - seg(p, 0.92, 1), true); }).join('');
      return s;
    };
    labels.push({ id: 'co2', tag: [905, 44] }, { id: 'rubp', a: [470, 158], d: 'T' }, { id: 'rubisco', a: [RUBISCO[0] + 36, RUBISCO[1]], d: 'R', to: 728 }, { id: 'gp', a: [833, 430], d: 'R', to: 850 });
  } else if (phase === 'reduce') {
    dur = 4000;
    const PA = [880, 586], PN = [880, 630], RA = [870, 726], RN = [888, 772];
    bg += arrow(835, 600, RED[0] + 36, RED[1] + 4, 7) + arrow(RED[0] + 30, RED[1] + 36, 772, 714, 7);
    dyn = p => {
      let s = '';
      const g = seg(p, 0, 0.36); if (g < 1) s += RIGHT.map(([x, y], i) => gp(...mix([x, y], [RED[0] + (i % 2) * 40 - 20, RED[1] - 40 + Math.floor(i / 2) * 22], g), 1, true)).join('');
      const a = seg(p, 0.14, 0.42); if (a < 1) s += pillShape(...mix(PA, RED, a), 56, '#ffcf5a', a > 0 ? 1 : 0) + pillShape(...mix(PN, [RED[0] + 10, RED[1] + 20], a), 128, '#3fbfa5', a > 0 ? 1 : 0);
      s += glow(RED[0], RED[1], 60, Math.sin(Math.PI * seg(p, 0.4, 0.56)));
      const t = seg(p, 0.52, 0.94); if (t > 0 && p < 1) s += BOT.map(([x, y], i) => tp(lerp(RED[0] - 40 + (i % 2) * 50, x, t), lerp(RED[1] + Math.floor(i / 2) * 20, y, t), 1 - seg(p, 0.92, 1), true)).join('');
      /* (at rest the two molecules stay where they arrived, under their names: the part that the card "ADP, phosphate and NADP" keeps bright) */
      const b = seg(p, 0.52, 0.94); if (b > 0) s += part('adp', pillShape(...mix(RED, RA, b), 170, '#b9c6da') + pillShape(...mix(RED, RN, b), 62, '#8fe0cf'));
      return s;
    };
    labels.push({ id: 'gp', a: [833, 430], d: 'R', to: 850 }, { id: 'atp', pill: PA, fill: '#ffcf5a', ink: '#2a1c00' }, { id: 'rnadp', pill: PN, fill: '#3fbfa5', ink: '#03211b' },
      { id: 'adp', pill: RA, fill: '#b9c6da', ink: '#0a1020' }, { id: 'nadp', pill: RN, fill: '#8fe0cf', ink: '#03211b' }, { id: 'tp', a: [512, 704], d: 'B' });
  } else {
    dur = 4200;
    const PA = [96, 512];
    bg += arrow(126, 502, REG[0] - 14, REG[1] + 26, 7);
    bg += part('tpOut', arrow(388, 676, OUT[0] + 46, OUT[1], 8, '#f3cf6e'));
    dyn = p => {
      let s = '';
      const m = seg(p, 0, 0.4); if (m < 1) s += BOT.slice(0, 5).map(([x, y], i) => { const a = lerp(Math.PI / 2, Math.PI, m), [u, v] = onRing(a); return tp(lerp(x, u, m), lerp(y, v - 50 + i * 24, m), 1, true); }).join('');
      const o = seg(p, 0.1, 0.6); s += part('tpOut', tp(...mix(BOT[5], OUT, o), 1, o > 0 && o < 1));
      const a = seg(p, 0.2, 0.46); if (a < 1) s += pillShape(...mix(PA, REG, a), 56, '#ffcf5a', a > 0 ? 1 : 0);
      s += glow(REG[0], REG[1], 60, Math.sin(Math.PI * seg(p, 0.42, 0.58)));
      const r = seg(p, 0.55, 0.95); if (r > 0 && p < 1) s += TOP.map(([x, y], i) => { const b = lerp(Math.PI, Math.PI * 1.5, r), [u, v] = onRing(b); return rubp(lerp(u, x, r), lerp(v - 26 + i * 26, y, r), 1 - seg(p, 0.92, 1), true); }).join('');
      return s;
    };
    labels.push({ id: 'atp', pill: PA, fill: '#ffcf5a', ink: '#2a1c00' }, { id: 'rubp', a: [470, 158], d: 'T' }, { id: 'tp', a: [428, 704], d: 'B' },
      { id: 'tpOut', tag: [OUT[0] + 30, OUT[1] + 58] });
  }
  return { bg, dyn, dur, labels, legend, places: [{ t: ctx.PLACES.calvin, x: 404, y: 420 }] };
}

/* ======================================================================================================================
   17–19. diagrams of boxes (HTML, so that they reflow on a phone): what triose phosphate makes (C1.3.18), the two stages
      need each other (C1.3.19, with three states), the tally for one glucose
   ==================================================================================================================== */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function products(phase, ctx) {
  const B = ctx.BOXES.products;
  const html = `<div class="lgx lgx--prod" role="img" aria-label="${esc(B.aria)}">
    <div class="lgx__src lgx__in" data-i="0" data-p="tp"><b>${esc(B.tp)}</b><span>${esc(B.tpS)}</span></div>
    ${B.rows.map((r, i) => `<div class="lgx__row lgx__in" data-i="${i + 1}" data-p="${i ? 'other' : 'glucose'}"><span class="lgx__arr" aria-hidden="true"></span>
      ${i ? '<button type="button" class="lgx__box lgx__btn" data-card="other">' : '<div class="lgx__box">'}<b>${esc(r.t)}</b><span>${esc(r.s)}</span>${i ? '</button>' : '</div>'}<span class="lgx__arr" aria-hidden="true"></span>
      <div class="lgx__to">${r.to.map((t, k) => `<span${(r.x || []).includes(k) ? ' class="is-x"' : ''}>${esc(t)}</span>`).join('')}</div></div>`).join('')}
  </div>`;
  return { html, dur: 2400, dyn: (p, el) => { el.querySelectorAll('.lgx__in').forEach(e => { const i = +e.dataset.i; e.classList.toggle('is-on', p >= i * 0.22 + 0.05 || p >= 1); }); }, legend: [{ c: '#C9B6FF', t: B.xnote, s: 'dot' }] };
}
function inter(phase, ctx) {
  const B = ctx.BOXES.inter;
  const state = B.states[ctx.mode] ? ctx.mode : 'both';
  /* (which stage stops first, and what it lacks: with no light the light-dependent reactions, with no carbon dioxide
     the Calvin cycle; the other stage stops next. The picture shows the order; the guide's own line is in the sheet) */
  const first = state === 'light' ? 'ld' : state === 'co2' ? 'li' : '', lack = state === 'light' ? B.lackLight : state === 'co2' ? B.lackCo2 : '';
  const stop = part => `<em class="lgx__stop">${esc(part === first ? B.stop1 : B.stop2)}</em>`;
  const io = list => list.split(', ').map(x => x === lack ? `<s>${esc(x)}</s>` : esc(x)).join(', ');
  const stage = (part, i, name, where, ins, outs) => `<div class="lgx__stage lgx__in" data-i="${i}" data-part="${part}"${part === first ? ' data-first=""' : ''}>${stop(part)}<b>${esc(name)}</b><span>${esc(where)}</span>
      <p class="lgx__io"><i>in:</i> ${io(ins)} · <i>out:</i> ${esc(outs)}</p></div>`;
  const html = `<div class="lgx lgx--inter" data-state="${state}">
    ${stage('ld', 0, B.ld, B.ldWhere, B.inLd, B.outLd)}
    <div class="lgx__links">
      <p class="lgx__link lgx__in" data-i="1" data-link="go"><span>${esc(B.go)}</span><i class="lgx__a lgx__a--r" aria-hidden="true"></i></p>
      <p class="lgx__link lgx__in" data-i="2" data-link="back"><i class="lgx__a lgx__a--l" aria-hidden="true"></i><span>${esc(B.back)}</span></p>
    </div>
    ${stage('li', 3, B.li, B.liWhere, B.inLi, B.outLi)}
    <p class="lgx__say lgx__in" data-i="4">${esc(B.say[state])}</p>
  </div>`;
  return { html, dur: 2000, dyn: (p, el) => { el.querySelectorAll('.lgx__in').forEach(e => { e.classList.toggle('is-on', p >= +e.dataset.i * 0.2 + 0.02 || p >= 1); }); }, legend: [] };
}
function tally(phase, ctx) {
  const B = ctx.BOXES.tally;
  const html = `<div class="lgx lgx--tally">
    <p class="lgx__eq lgx__in" data-i="0">${esc(B.eq)}</p>
    <table class="lgx__t"><caption class="lgx__in" data-i="0">${esc(B.head[0])}</caption>
      <thead><tr><th scope="col">${esc(B.head[0])}</th><th scope="col">${esc(B.head[1])}</th><th scope="col">${esc(B.head[2])}</th></tr></thead>
      <tbody>${B.rows.map((r, i) => { const g = B.groups.find(q => q[2] === i), id = B.groups.filter(q => q[2] <= i).pop()[0];
        return (g ? `<tr class="lgx__in lgx__grp" data-i="${i + 1}" data-p="${g[0]}"><th colspan="3" scope="rowgroup"><button type="button" class="lgx__btn" data-card="${g[0]}">${esc(g[1])}</button></th></tr>` : '')
          + `<tr class="lgx__in${/^\s/.test(r[0]) ? ' lgx__sub' : ''}" data-i="${i + 1}" data-p="${id}"><th scope="row">${esc(r[0].trim())}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`; }).join('')}</tbody>
    </table></div>`;
  const n = B.rows.length + 1;
  return { html, dur: 2600, dyn: (p, el) => { el.querySelectorAll('.lgx__in').forEach(e => { e.classList.toggle('is-on', p >= +e.dataset.i / n || p >= 1); }); }, legend: [] };
}

/* small drawings shown inside a card (view.js). rf: how an Rf value is worked out, on a strip of paper with ONE spot of
   no named pigment at no measured height (the pupils' own chromatogram and its Rf values are their practical work:
   text.js header, memory never-do-the-assessment) */
export const FIGS = {
  rf: ctx => { const K = ctx.KEYS.rf, t = (x, y, s, a = 'start') => `<text x="${x}" y="${y}" font-size="13" font-weight="700" text-anchor="${a}" fill="currentColor">${esc(s)}</text>`;
    return `<svg viewBox="0 0 340 210" role="img" aria-label="${esc(K.aria)}">
      <rect x="20" y="10" width="64" height="190" rx="3" fill="#F4F1E6" stroke="#9AA3B2" stroke-width="1.5"/>
      <path d="M20 172 H84" stroke="#6B7280" stroke-width="1.5"/><path d="M20 34 H84" stroke="#6B7280" stroke-width="1.5" stroke-dasharray="5 4"/>
      <circle cx="52" cy="172" r="3.5" fill="#6B7280"/><ellipse cx="52" cy="96" rx="13" ry="9" fill="#7C8A5A"/>
      <path d="M100 172 V96 M96 172 h8 M96 96 h8" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M122 172 V34 M118 172 h8 M118 34 h8" stroke="currentColor" stroke-width="1.8" fill="none"/>
      ${t(92, 26, K.front)}${t(92, 196, K.start)}${t(132, 82, K.ds)}${t(132, 140, K.dp)}
      <path d="M128 78 h-4 M128 136 h-24" stroke="currentColor" stroke-width="1.2"/></svg>`; }
};

export const SCENES = { cell, chloro, pigment, spectra, overview, limits, psys, thyl, calvin, products, inter, tally };
