/* ============================================================
   view.js — the cell fractionation lab (16 Nov 2026; on the picture since 18 Nov 2026): an IB view of the Y7 cell
   game, for IB Biology B2.2.1 and its Nature of Science ("study of the function of individual organelles became
   possible when ultracentrifuges had been invented and methods of using them for cell fractionation had been
   developed"), with the links Daniel asked for: the medium isotonic (D2.3), ice-cold (C1.1) and buffered (B1.2.5).
   Daniel's proposal (B2.2 build, research/game_proposal.md, 15 Nov 2026): "blend a liver sample in a solution the pupil
   chooses (warm or ice-cold; buffered or not; pure water, isotonic or concentrated: the wrong choice bursts or shrinks
   the organelles), then spin at chosen speeds and times and collect pellets; then de Duve's test: enzyme activity
   before and after the lysosome membranes are broken. A game mechanic that is also the science."
   So: seven steps (the temperature and the pH each have their own since 18 Nov: one experiment, one picture). Each
   choice is shown as its true result, said in one line, and the pupil may try again (never a dead end); Next opens
   when the step's experiment is done and its motion has ended (memory animations-wait-for-the-reader). The spins are
   the four real ones (text.js SPINS); a spin chosen too soon pellets everything larger together, as it would.
   It teaches on the picture (memory teach-on-the-picture; text.js says what is on show when):
   - a name with a card is a button (a ring at its left; a phone: its pin and its line of the key; a tube's name; a
     row of the key under the picture). Pressed, its part stays bright, the rest dims, and its card opens in the sheet
     under "Names found: n of N" (js/ib/found.js);
   - step 2 is a counted liquid (osmosis.js, the liquid of js/water/liquid.js): the crossings of the membrane counted
     both ways; step 3 is proteases on random walks, the digested proteins counted; step 7 is substrate molecules on
     random walks that a whole membrane turns back (walk.js). Each run has fixed random numbers and is advanced by the
     time shown, so the run a pupil watches is the run tools/fractionation-check.mjs counted. De Duve's latency is
     drawn as low and high only: no number of his is drawn (none was read in a source).
   The picture is 2D SVG, drawn again for each frame of a motion from the step's state: the art in its own units,
   scaled to the stage; its words at true pixel sizes; step 2's molecules on a canvas under it. Names stand on lines
   from the margins (a laptop) or on numbered pins with a key under the picture (a phone), placed only while the
   picture is still.
   Opened over the game (openFractionation({ inGame: true, onClose })) or at its own address (fractionation/).
   Reduce motion (the computer's setting, or ?still=1 for the tests): every motion jumps to its end, nothing is left
   out: the end of each run, with an arrow for the net movement of water and the path of each protease.
   For tools/fractionation-check.mjs: window.FRACTIONATION.
   ============================================================ */
import { STEPS, RESULT, NAMES, UI, LEVELS, SIMPLE, SOURCES, SPINS, FRACTIONS, PART_NAMES, TITLE, EYEBROW } from './text.js?v=202611272058';
import { found, learn } from '../ib/found.js?v=202611272058';
import { marks } from '../ib/mark.js?v=202611272058';      /* (a visit from the IB map marks its sentence) */
import { LIQ } from '../water/liquid.js?v=202611272058';
import { OSM, STEPS as OSM_STEPS, makeOsmosis, osmosisTo, counts, drawLiquid } from './osmosis.js?v=202611272058';
import { PROT, PROTEINS, makeProteases, ASSAY, makeAssay, enzymeAt, LEAK } from './walk.js?v=202611272058';
const VIEW = 'fractionation';      /* (the key of this view's found names: js/ib/found.js) */

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const params = new URLSearchParams(location.search);
const FAST = params.has('still') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const ease = k => k * k * (3 - 2 * k);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (p, a, b) => clamp01((p - a) / (b - a));      /* the part of a motion between a and b (0 to 1) */
const r1 = n => Math.round(n * 10) / 10;
const D = Math.PI / 180;
/* a part of the picture: what a pressed name keeps bright (ids = the names it belongs to) */
const P = (ids, svg) => (svg ? `<g data-p="${ids}">${svg}</g>` : '');

/* ---------------- the drawing kit (art units) ---------------- */
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
/* n points in a box, each `gap` from the others and outside the circles to avoid ({x, y, r}) */
function scatter(n, box, gap, seed, avoid = []) {
  const R = rng(seed), out = [];
  for (let t = 0; out.length < n && t < 6000; t++) {
    const x = lerp(box[0], box[2], R()), y = lerp(box[1], box[3], R());
    if (out.some(p => Math.hypot(p[0] - x, p[1] - y) < gap)) continue;
    if (avoid.some(a => Math.hypot(a.x - x, a.y - y) < a.r)) continue;
    out.push([x, y]);
  }
  return out;
}
/* a closed outline round (cx, cy): half-widths a and b, turned by rot degrees; wav makes it wrinkled (shrunk) */
function blob(cx, cy, a, b, rot = 0, wav = 0, n = 72) {
  const c = Math.cos(rot * D), s = Math.sin(rot * D), pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / n * Math.PI * 2, k = 1 + wav * Math.sin(12 * t), x = a * k * Math.cos(t), y = b * k * Math.sin(t);
    pts.push(`${r1(cx + x * c - y * s)},${r1(cy + x * s + y * c)}`);
  }
  return 'M' + pts.join('L') + 'Z';
}
/* a membrane that breaks: whole at b = 0, in pieces with gaps at b = 1 (pathLength 100) */
const broken = b => (b > 0.001 ? ` pathLength="100" stroke-dasharray="${r1(20 - 11 * b)} ${r1(0.01 + 11 * b)}"` : '');
/* The lab's pictures of real things are Servier Medical Art (smart.servier.com, CC BY 4.0, adapted; Daniel, 18 Nov
   2026, of the flat shapes this file drew before: "the drawings are lack of detail … not very professional"; then
   "Servier art"; memory design-bar-for-daniels-sites): fractionation/art/<name>.svg, cut from the kits by
   tools/servier/pieces.py. Each is drawn as an <image>, so the browser draws its shapes once for a size and not again
   for every frame of a motion. PIC: each drawing's own width and height. Only what moves by the lab's own rules is
   still drawn here (a membrane in pieces, liquids, the counted models, arrows). */
const ART_V = '?v=202611272058', ART_URL = new URL('../../fractionation/art/', import.meta.url).href;
const PIC = { cell: [461, 414], lyso: [36, 36], mito: [203, 103], nucleus: [178, 197], rer: [212, 104], protease: [105, 155], enzyme: [57, 57], tube: [42, 273], beaker: [112, 151], thermo: [6, 392], pestle: [44, 153], ctube: [50, 313], centrifuge: [206, 272], bath: [209, 204] };
/* Each drawing is turned ONCE into a bitmap (a PNG three or four times its own size; the cell 1,400 px wide), and the
   picture is drawn from the bitmaps: an SVG <image> that is made again for every frame of a motion is drawn from its
   shapes every time (in a browser without a graphics card a ten-second run took a minute: tools/fractionation-check
   laptop). Until a bitmap is ready its SVG file is used; artReady tells the open view to draw again. */
const BMP = {}, artReady = new Set();
let artAsked = false;
function artBitmaps() {
  if (artAsked) return; artAsked = true;
  let left = Object.keys(PIC).length;
  Object.keys(PIC).forEach(name => {
    const [w, h] = PIC[name], k = name === 'cell' ? 1400 / w : Math.min(4, 1200 / Math.max(w, h)), im = new Image();
    const done = () => { if (--left === 0) artReady.forEach(f => f()); };
    im.onload = () => { try { const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      c.toBlob(b => { if (b) BMP[name] = URL.createObjectURL(b); done(); }); } catch (e) { done(); } };
    im.onerror = done; im.src = ART_URL + name + '.svg' + ART_V;
  });
}
/* a drawing centred at (x, y), w wide (h: its own proportion unless given), turned by o.rot degrees, o.op its opacity */
const IM = (name, x, y, w, h, o = {}) => { const [pw, ph] = PIC[name]; if (h == null) h = w * ph / pw;
  return `<image href="${BMP[name] || ART_URL + name + '.svg' + ART_V}" x="${r1(x - w / 2)}" y="${r1(y - h / 2)}" width="${r1(w)}" height="${r1(h)}" preserveAspectRatio="none"${o.rot ? ` transform="rotate(${r1(o.rot)} ${r1(x)} ${r1(y)})"` : ''}${o.op != null && o.op < 0.995 ? ` opacity="${r1(Math.max(0, o.op) * 100) / 100}"` : ''}/>`; };
const SH = {
  /* a mitochondrion (cut open: its two membranes and its cristae). o.s its scale (swollen, shrunk), o.wav > 0 shrunk
     (flatter too), o.b from 0 to 1 its membranes in pieces (the drawing fades under a broken outline), o.exact: w and
     h as given (the counted models need the true outline), else the drawing keeps about its own proportion */
  mito(x, y, w, h, rot = 0, o = {}) {
    const s = o.s || 1, b = o.b || 0, W = w * s, H = (o.exact ? h : Math.max(h, w * 0.49)) * s * (1 - 2 * (o.wav || 0));
    return IM('mito', x, y, W, H, { rot, op: (o.op != null ? o.op : 1) * (1 - 0.74 * b) })
      + (b > 0.001 ? `<path d="${blob(x, y, W / 2, H / 2, rot)}" class="fr-mito-b"${broken(b)} opacity="${r1(Math.min(1, b * 1.6) * 100) / 100}"/>` : '');
  },
  /* a lysosome: a vesicle with a few digestive enzymes inside (o.spread: the enzymes leave a broken one) */
  lyso(x, y, r, o = {}) {
    const s = o.s || 1, b = o.b || 0, sp = o.spread || 0, E = o.enz || [[-0.38, -0.2], [0.32, -0.3], [0.02, 0.38]], R = r * s * (1 - 1.5 * (o.wav || 0));
    const enz = o.noEnz ? '' : E.map(([ex, ey], i) => { const k = 1 + sp * (2.6 + i * 0.9); return SH.enz(x + ex * r * k, y + ey * r * k, Math.max(2.6, r * 0.2), i * 40); }).join('');
    return IM('lyso', x, y, R * 2.1, R * 2.1, { op: 1 - 0.8 * b }) + (b > 0.001 ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(R)}" class="fr-lyso-b"${broken(b)} opacity="${r1(Math.min(1, b * 1.6) * 100) / 100}"/>` : '') + enz;
  },
  /* one enzyme molecule */
  enz: (x, y, r, rot = 0) => IM('enzyme', x, y, r * 2.5, r * 2.5, { rot }),
  nuc: (x, y, r) => IM('nucleus', x, y, r * 1.85, r * 2.05),
  /* a microsome: a small closed vesicle of ER membrane, ribosomes on it */
  micro: (x, y, r) => `<g transform="translate(${r1(x)} ${r1(y)})"><circle r="${r}" class="fr-micro"/>${[0, 120, 240].map(a => `<circle cx="${r1(r * 1.05 * Math.cos(a * D))}" cy="${r1(r * 1.05 * Math.sin(a * D))}" r="${r1(Math.max(1.2, r * 0.28))}" class="fr-ribo"/>`).join('')}</g>`,
  ribo: (x, y, r) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" class="fr-ribo"/>`,
  /* a test tube (open at the top) and the liquid in it from yL down (the liquid is the lab's: drawn over the glass) */
  tube: (x0, y0, w, h, yL, liq = 'fr-liq') => {
    const R = w / 2, yb = y0 + h - R, i = Math.max(3, w * 0.09);
    return IM('tube', x0 + w / 2, y0 + h / 2, w + 4, h + 4)
      + (/fr-liq--none/.test(liq) ? '' : `<path d="M${r1(x0 + i)},${r1(yL)} V${r1(yb)} A${r1(R - i)} ${r1(R - i)} 0 0 0 ${r1(x0 + w - i)},${r1(yb)} V${r1(yL)} Z" class="${liq} fr-liq--in"/>`);
  },
  arrow(x1, y1, x2, y2, cls = 'fr-water', op = 1) {
    const a = Math.atan2(y2 - y1, x2 - x1), L = 7;
    const h1 = [x2 - L * Math.cos(a - 0.5), y2 - L * Math.sin(a - 0.5)], h2 = [x2 - L * Math.cos(a + 0.5), y2 - L * Math.sin(a + 0.5)];
    return `<g class="${cls}" opacity="${r1(op * 100) / 100}"><path d="M${r1(x1)},${r1(y1)} L${r1(x2)},${r1(y2)}"/><path d="M${r1(h1[0])},${r1(h1[1])} L${r1(x2)},${r1(y2)} L${r1(h2[0])},${r1(h2[1])}" class="fr-head"/></g>`;
  }
};
/* words in the art: true pixel sizes whatever the scale (g.F converts) */
const TX = (g, x, y, s, px, cls = '', anchor = 'middle') => `<text x="${r1(x)}" y="${r1(y)}" font-size="${g.F(g.sz(px))}" text-anchor="${anchor}" class="fr-t ${cls}">${esc(s)}</text>`;
const TL = (g, x, y, lines, px, cls = '', anchor = 'start', lh = 1.25) => `<text x="${r1(x)}" y="${r1(y)}" font-size="${g.F(g.sz(px))}" text-anchor="${anchor}" class="fr-t ${cls}">${lines.map((l, i) => `<tspan x="${r1(x)}" dy="${i ? g.F(g.sz(px) * lh) : 0}"${l.cls ? ` class="${l.cls}"` : ''}>${esc(l.t != null ? l.t : l)}</tspan>`).join('')}</text>`;
const mark = ok => (ok ? '✓ ' : '✗ ');

/* ---------------- each step's picture ----------------
   { dw, dh: its size in art units; cols: the names each margin can carry on a laptop; legend: the line under it (HTML);
     draw(state, g) → { svg, labels: [{ id, side, at: [x, y] (art units), pin: [dx, dy] (px, a phone) }] } } */
const ICON = {
  dot: '<svg class="frv__ic" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="3.4" class="fr-solute"/></svg>',
  water: '<svg class="frv__ic frv__ic--w" viewBox="0 0 26 12" aria-hidden="true"><g class="fr-water"><path d="M2,6 L22,6"/><path d="M16,2 L22,6 L16,10" class="fr-head"/></g></svg>',
  sub: '<svg class="frv__ic" viewBox="0 0 12 12" aria-hidden="true"><path d="M6,1.5 L10.5,6 L6,10.5 L1.5,6Z" class="fr-sub"/></svg>',
  prod: '<svg class="frv__ic" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="3.6" class="fr-prod"/></svg>'
};
const ART = {};

/* 1. an animal cell and its parts: the kit's "Animal cell" (a liver cell is drawn like it; its Golgi apparatus, smooth
   ER, vacuoles, centrosome and fibres are not named here). The picture is one drawing, so a pressed name does not dim
   the other parts one by one: a veil falls over the cell with a soft opening round the part (design bar: "open the
   veil round it … so it shows as the artist drew it"). */
const CW = 420, CX0 = 270 - CW / 2, CY0 = 205 - CW * 414 / 461 / 2, CK = CW / 461, cellAt = (x, y) => [CX0 + x * CK, CY0 + y * CK];
/* where each named part is in the drawing (its own units): [x, y, radius] of each place to light */
const SPOT = {
  nucleus: [[160, 185, 54]], mito: [[55, 175, 44], [338, 193, 46], [330, 363, 44]], lyso: [[268, 104, 22], [72, 236, 16], [329, 266, 16], [236, 323, 19]],
  rer: [[150, 268, 46], [205, 246, 46]], ribo: [[225, 264, 28], [182, 302, 28], [150, 268, 40], [205, 246, 40]], cyto: [[392, 240, 34], [292, 332, 30], [120, 292, 24]],
  pm: [[26, 200, 26], [60, 90, 26], [150, 52, 26], [250, 44, 26], [340, 82, 26], [410, 150, 26], [436, 240, 26], [420, 320, 26], [330, 400, 26], [220, 384, 26], [110, 350, 26], [40, 290, 26]]
};
ART.why = {
  dw: 540, dh: 400,
  cols: { L: ['mito', 'nucleus', 'lyso', 'ribo'], R: ['cyto', 'rer', 'pm'] },
  legend: 'Servier Medical Art, CC BY 4.0, adapted. Not to scale. Not drawn: the cytoskeleton\'s finest fibres. An animal cell has no cell wall.',
  draw(st, g) {
    let s = IM('cell', 270, 205, CW);
    const spots = SPOT[g.focus];
    if (spots) s += `<defs><radialGradient id="frvHole"><stop offset="0.62" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient><mask id="frvSpot"><rect x="0" y="0" width="540" height="400" fill="#fff"/>${spots.map(([x, y, r]) => { const [ax, ay] = cellAt(x, y); return `<circle cx="${r1(ax)}" cy="${r1(ay)}" r="${r1(r * CK * 1.25)}" fill="url(#frvHole)"/>`; }).join('')}</mask></defs><rect x="0" y="0" width="540" height="400" class="fr-veil" mask="url(#frvSpot)"/>`;
    const at = (x, y) => cellAt(x, y);
    return { svg: `<g data-p="mito lyso nucleus rer ribo pm cyto">${s}</g>`, labels: [
      { id: 'mito', side: 'L', at: at(30, 172), pin: [-8, -24] }, { id: 'nucleus', side: 'L', at: at(128, 216), pin: [22, 4] }, { id: 'lyso', side: 'L', at: at(63, 237), pin: [-20, 12] }, { id: 'ribo', side: 'L', at: at(160, 304), pin: [-6, 24] },
      { id: 'cyto', side: 'R', at: at(392, 236), pin: [0, -22] }, { id: 'rer', side: 'R', at: at(232, 252), pin: [24, 6] }, { id: 'pm', side: 'R', at: at(432, 300), pin: [18, 18] }
    ] };
  }
};

/* 2. the three media, the organelles in the medium chosen, and the organelle's membrane magnified: the liquid inside
   the organelle (left) and the medium (right) as a counted liquid (osmosis.js; its molecules are drawn on the canvas
   under this picture: view's drawOsm) */
const CONC = [{ v: 'water', card: 'hypo' }, { v: 'iso', card: 'iso' }, { v: 'conc', card: 'hyper' }];
const TUBE = { hypo: 'water', iso: 'iso', hyper: 'conc' };      /* (the medium a tube's name stands for) */
const WINU = 5.6, AIR = 5.2;      /* a unit of the liquid in art units; the air drawn above the liquids' first level */
const winAt = narrow => {
  const top = narrow ? 258 : 278, xl = (600 - (2 * LIQ.WB + LIQ.T) * WINU) / 2, floor = top + (LIQ.H0 + AIR) * WINU;
  return { top, xl, floor, xm: xl + LIQ.WB * WINU, xr: xl + (LIQ.WB + LIQ.T) * WINU, xe: xl + (2 * LIQ.WB + LIQ.T) * WINU, yB: narrow ? 130 : 136, X: ux => xl + (ux + LIQ.T / 2 + LIQ.WB) * WINU, Y: uy => floor - uy * WINU };
};
ART.conc = {
  dim: narrow => ({ dw: 600, dh: winAt(narrow).floor + 8 }),
  cols: { L: ['m2lyso'], R: ['m2mito'] },
  legend: narrow => `<span class="frv__lgrow"><span class="frv__lg"><i class="frv__dot frv__dot--w"></i>${esc(narrow ? UI.waterShort : UI.waterMol)}</span><button type="button" class="frv__lgb" data-card="solute"><i class="frv__ring" aria-hidden="true"></i><i class="frv__dot frv__dot--s"></i>${esc(NAMES.solute[0])}</button><button type="button" class="frv__lgb" data-card="m2mem"><i class="frv__ring" aria-hidden="true"></i><i class="frv__dot frv__dot--m"></i>${esc(NAMES.m2mem[0])}</button>${narrow ? '' : `<span class="frv__lg">${esc(UI.notScale)}</span>`}</span>`,
  draw(st, g) {
    /* (a phone: shorter tubes and a lower field, so that the liquid keeps its size) */
    const v = st.last, p = v != null ? st.p[v] : null, has = p != null, N = g.narrow, W = winAt(N), th = N ? 60 : 84, fh = N ? 66 : 84, yo = W.yB + fh / 2, lr = N ? 16 : 19, mw = N ? 80 : 96, mh = N ? 34 : 40;
    /* (pv: a tube's name is pressed and its medium is not the one in the window: the window shows that medium, still,
       beside the liquid of the organelle, so that the two concentrations can be compared before a tube is chosen) */
    const pv = g.pv || null, mv = pv || v;
    /* (C: a small picture, a phone's or a small laptop's with names in its margins: the tubes' short names, or the
       names and the two headings of the window meet) */
    const C = N || g.k < 0.95;
    let s = '';
    const tags = [];
    CONC.forEach((c, i) => {
      const cx = (C ? [84, 292, 516] : [100, 300, 500])[i], on = c.v === v;      /* (a phone: the three names need the whole width) */
      s += P(c.card, (on ? `<rect x="${cx - 26}" y="1" width="52" height="${th + 13}" rx="12" class="fr-pick"/>` : '') + SH.tube(cx - 13, 8, 26, th, 8 + th * 0.26, c.v === 'conc' ? 'fr-liq fr-liq--conc' : c.v === 'water' ? 'fr-liq fr-liq--water' : 'fr-liq'));
      tags.push({ id: c.card, text: (C ? UI.tubeN : UI.tube)[c.v], at: [cx, th + 14], below: true });
    });
    /* the organelles in the medium chosen: swell then burst (pure water), unchanged (isotonic), shrink (concentrated) */
    let ms = 1, wav = 0, b = 0;
    if (has && v === 'water') { ms = 1 + 0.3 * ease(seg(p, 0, 0.75)); b = seg(p, 0.75, 1); }
    if (has && v === 'conc') { ms = 1 - 0.24 * ease(p); wav = 0.07 * ease(p); }
    s += `<rect x="150" y="${W.yB}" width="300" height="${fh}" rx="14" class="fr-field${v === 'conc' ? ' fr-liq--conc' : v === 'water' ? ' fr-liq--water' : v ? ' fr-liq' : ''}"/>`;
    s += P('m2lyso', SH.lyso(232, yo, lr, { s: ms, wav, b, spread: b })) + P('m2mito', SH.mito(350, yo, mw, mh, 0, { s: ms, wav, b }));
    /* (what happened to them: clear of the names' lines, so at the right on a laptop and at the left on a phone) */
    if (has && p >= 1 && !pv) s += TX(g, N ? 144 : 462, N ? yo + 5 : yo + 38, mark(RESULT[v].ok) + UI[v === 'water' ? 'burst' : v === 'iso' ? 'same' : 'shrunk'], 16, (RESULT[v].ok ? 'fr-good' : 'fr-bad') + ' fr-tb', N ? 'end' : 'start');
    /* the membrane, magnified: a line from the lysosome's membrane to the words that say what the lower picture is */
    const yh = W.top - 8, yc = yh - g.lh(15) * 1.12;
    s += P('hypo iso hyper solute m2mem', `<path d="M232,${r1(yo + lr * ms)} L${r1((W.xm + W.xr) / 2)},${r1(yc - g.lh(14) * 0.85)}" class="fr-zoom"/>`
      + TX(g, (W.xm + W.xr) / 2, yc, UI.magnified, 14, 'fr-t2')
      + TX(g, (W.xl + W.xm) / 2, yh, UI.inside, 15, 'fr-tb')
      + TX(g, (W.xr + W.xe) / 2, yh, mv ? (C ? UI.tubeN[mv] : `${UI.medium}: ${UI.tube[mv]}`) : (C ? UI.choose : `${UI.medium}: ${UI.choose}`), 15, mv ? 'fr-tb' : 'fr-t2')
      + (mv ? '' : `<rect x="${r1(W.xr)}" y="${r1(W.Y(LIQ.H0))}" width="${r1(W.xe - W.xr)}" height="${r1(LIQ.H0 * WINU)}" class="fr-empty"/>`));
    /* what the two counts come to, in the air above the membrane (the end of a run; none when they are equal) */
    const dir = v && !pv ? OSM.RUNS[v].dir : 0, k = has ? seg(p, 0.9, 1) : 0;
    if (dir && k > 0) { const ya = W.Y(LIQ.H0 + 3.7), xc = (W.xm + W.xr) / 2, L = LIQ.WB * WINU * 0.42; s += P('hypo iso hyper m2mem', SH.arrow(xc + dir * L, ya, xc - dir * L, ya, 'fr-net', k)); }
    return { svg: s, tags, labels: [{ id: 'm2lyso', side: 'L', at: [232 - lr, yo], pin: [-15, 6] }, { id: 'm2mito', side: 'R', at: [350 + mw / 2, yo], pin: [24, -4] }] };
  }
};

/* 3. the temperature: proteases on random walks round a mitochondrion (walk.js), the digested proteins counted */
const PW0 = { x: 124, y: 44 };      /* where the window of walk.js PROT stands in the art */
const P_START = makeProteases('warm');      /* (the start, before a temperature is chosen: the same places at both) */
ART.cold = {
  dw: 692, dh: 388,
  cols: { L: ['protease'], R: ['m3prot', 'm3mito', 'm3cut'] },
  legend: narrow => `<span class="frv__lgrow"><span class="frv__lg"><i class="frv__dot frv__dot--bump"></i>${esc(UI.bump)}</span><span class="frv__lg"><i class="frv__dot frv__dot--bump frv__dot--hit"></i>${esc(UI.bumpHit)}</span><span class="frv__lg"><i class="frv__dot frv__dot--path"></i>${esc(UI.path)}</span>${narrow ? '' : `<span class="frv__lg">${esc(UI.notScale)}</span>`}</span>`,
  draw(st, g) {
    const T = st.temp, tp = st.tp != null ? ease(Math.min(1, st.tp * 8)) : 0, S = st.sim || P_START, x0 = PW0.x, y0 = PW0.y;
    /* the apparatus: a water bath with its thermostat (37 °C), a beaker of ice (about 0 °C), the tube alone before a
       choice; a thermometer beside it */
    let s = '';
    if (T === 'warm') s += IM('bath', 54, 214, 108) + SH.tube(34, 150, 22, 86, 196);
    else if (T === 'ice') { s += SH.tube(43, 120, 24, 150, 170) + IM('beaker', 55, 226, 104, 140);
      [[30, 206, 12], [78, 214, -10], [34, 246, 18], [80, 252, -14], [40, 280, 6], [72, 282, 30], [56, 226, 24]].forEach(([x, y, a]) => { s += `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - 9}" y="${y - 9}" width="18" height="18" rx="3.5" class="fr-ice"/><path d="M${x - 5},${y - 5} h7" class="fr-ice-hi"/></g>`; }); }
    else s += SH.tube(42, 110, 26, 170, 170);
    s += IM('thermo', 104, 196, 8, 200);
    /* (the temperature stands above the apparatus: a name's line from the left margin passes under it) */
    if (T) s += TX(g, 56, 40, T === 'warm' ? UI.warm[1] : UI.ice[1], 17, 'fr-tb');
    s += TX(g, x0 + PROT.W / 2, y0 - 10, UI.inMedium, 15, 'fr-t2');
    s += `<rect x="${x0}" y="${y0}" width="${PROT.W}" height="${PROT.H}" rx="12" class="fr-win"/>`;
    /* the mitochondrion: its membrane breaks as its proteins are digested */
    const eaten = S.eaten, bite = clamp01(eaten / PROTEINS.length);
    s += P('m3mito m3prot m3cut', SH.mito(x0 + PROT.CX, y0 + PROT.CY, PROT.A * 2, PROT.B * 2, 0, { b: bite * 0.9, exact: true }));
    let whole = '', cut = '';
    PROTEINS.forEach(([px, py], j) => {
      const nx = (px - PROT.CX) / (PROT.A * PROT.A), ny = (py - PROT.CY) / (PROT.B * PROT.B), a = Math.atan2(ny, nx) / D;
      if (!S.gone[j]) whole += `<rect x="-5" y="-9" width="10" height="18" rx="3" class="fr-peg" transform="translate(${r1(x0 + px)} ${r1(y0 + py)}) rotate(${r1(a + 90)})"/>`;
      else { const o = FAST ? 1 : clamp01((S.t - S.when[j]) / 0.5), d = 3 + 5 * o;
        cut += `<g transform="translate(${r1(x0 + px)} ${r1(y0 + py)}) rotate(${r1(a + 90)})" class="fr-peg--cut"><rect x="-5" y="${r1(-9 - d)}" width="10" height="7" rx="2" transform="rotate(-18 0 ${r1(-6 - d)})"/><rect x="-5" y="${r1(2 + d * 0.4)}" width="10" height="7" rx="2" transform="rotate(14 0 ${r1(5 + d * 0.4)})"/></g>`; }
    });
    s += P('m3prot', whole) + P('m3cut', cut);
    /* the proteases: each with the path of its last seconds (how far it moved), its mouth the way it moves */
    let pr = '';
    for (let i = 0; i < S.n; i++) {
      const tr = S.trail[i];
      if (tr.length > 1) pr += `<polyline points="${tr.map(q => `${r1(x0 + q[0])},${r1(y0 + q[1])}`).join(' ')} ${r1(x0 + S.x[i])},${r1(y0 + S.y[i])}" class="fr-trail"/>`;
    }
    for (let i = 0; i < S.n; i++) {
      const a = Math.atan2(S.vy[i], S.vx[i]) / D, R = PROT.R;
      pr += IM('protease', x0 + S.x[i], y0 + S.y[i], R * 1.75, R * 2.6, { rot: a });      /* (its notch, the active site, leads) */
    }
    s += P('protease', pr);
    /* each collision with the organelle: a ring that grows for a moment; once the run is over, every collision of the
       run stays as a small ring (one that digested a protein is drawn stronger) */
    let bm = '';
    const over = st.tp >= 1 || FAST;
    S.bumps.forEach(([bx, by, bt, hit]) => { const age = S.t - bt;
      if (over) bm += `<circle cx="${r1(x0 + bx)}" cy="${r1(y0 + by)}" r="5.5" class="fr-bump${hit ? ' fr-bump--hit' : ''}"/>`;
      else if (age < 0.7) bm += `<circle cx="${r1(x0 + bx)}" cy="${r1(y0 + by)}" r="${r1(5 + 14 * age)}" class="fr-bump${hit ? ' fr-bump--hit' : ''}" opacity="${r1((1 - age / 0.7) * 100) / 100}"/>`; });
    s += P('protease m3prot m3cut', bm);
    if (T && st.tp >= 1) s += TX(g, x0 + PROT.W / 2, y0 + PROT.H + g.lh(16), mark(T === 'ice') + (T === 'ice' ? UI.whole : UI.digested), 16, T === 'ice' ? 'fr-good fr-tb' : 'fr-bad fr-tb');
    /* the names: the protease nearest the left edge; a whole protein and a digested one on the right half */
    let pl = 0; for (let i = 1; i < S.n; i++) if (S.x[i] < S.x[pl]) pl = i;
    const right = PROTEINS.map((q, j) => [q, j]).filter(([q]) => q[0] > PROT.CX + 20), up = right.filter(([, j]) => !S.gone[j]).sort((a, b) => a[0][1] - b[0][1])[0], dn = right.filter(([, j]) => S.gone[j]).sort((a, b) => b[0][1] - a[0][1])[0];
    const L = [{ id: 'protease', side: 'L', at: [x0 + S.x[pl], y0 + S.y[pl]], pin: [0, -22] }, { id: 'm3mito', side: 'R', at: [x0 + PROT.CX - 52, y0 + PROT.CY + 4], pin: [0, 0] }];      /* (a phone: its pin stands on the organelle) */
    if (up) L.push({ id: 'm3prot', side: 'R', at: [x0 + up[0][0], y0 + up[0][1]], pin: [8, -24] });
    if (dn && st.tp >= 1) L.push({ id: 'm3cut', side: 'R', at: [x0 + dn[0][0], y0 + dn[0][1]], pin: [8, 24] });
    return { svg: s, labels: L };
  }
};

/* 4. the pH: a scale with the medium's pH on it; a protein that keeps its shape or unfolds (denatured) */
function chain(e) {
  const N = 64, pts = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1) * Math.PI * 2 * 0.93;
    const fx = 300 + 86 * Math.sin(3 * t + 0.4), fy = 250 + 76 * Math.sin(2 * t);
    /* (unfolded: a loose chain with no regular shape) */
    const ux = 96 + 408 * i / (N - 1) + 12 * Math.sin(i * 0.9), uy = 258 + 20 * Math.sin(i * 0.7) + 17 * Math.sin(i * 0.23 + 1) + 9 * Math.sin(i * 1.7);
    pts.push([lerp(fx, ux, e), lerp(fy, uy, e)]);
  }
  return pts;
}
ART.ph = {
  dw: 600, dh: 400,
  cols: { L: [], R: ['protein'] },
  legend: esc(UI.notScale) + '.',
  draw(st, g) {
    const pp = st.pp != null ? ease(st.pp) : 0, Ph = st.ph;
    let s = '<rect x="150" y="40" width="96" height="22" class="fr-ph-a"/><rect x="246" y="40" width="108" height="22" class="fr-ph-n"/><rect x="354" y="40" width="96" height="22" class="fr-ph-b"/><rect x="150" y="40" width="300" height="22" class="fr-ph-line"/>';
    const yA = 62 + g.lh(16) * 0.85, yP = yA + g.lh(16);
    s += TX(g, 150, yA, UI.acid, 16, 'fr-t2', 'start') + TX(g, 450, yA, UI.alk, 16, 'fr-t2', 'end');
    const mx = Ph === 'nobuf' ? lerp(304, 200, pp) : 304;
    s += `<path d="M${r1(mx - 9)},26 L${r1(mx + 9)},26 L${r1(mx)},39 Z" class="fr-marker"/>`;
    /* (Reduce motion: one still, so an arrow says which way the pH went) */
    if (FAST && Ph === 'nobuf' && st.pp >= 1) s += SH.arrow(292, 17, 214, 17, 'fr-move');
    s += TX(g, 300, yP, UI.phOf + (Ph && st.pp >= 1 ? ': ' + (Ph === 'buf' ? UI.steady : UI.changes) : ''), 16, 'fr-t2');
    s += '<rect x="60" y="134" width="480" height="254" rx="12" class="fr-win"/>';
    const ch = chain(Ph === 'nobuf' ? pp : 0);
    s += P('protein', `<polyline points="${ch.map(q => `${r1(q[0])},${r1(q[1])}`).join(' ')}" class="fr-chain"/>`);
    if (Ph && st.pp >= 1) s += TX(g, 300, 376, mark(Ph === 'buf') + (Ph === 'buf' ? UI.shape : UI.denat), 16, Ph === 'buf' ? 'fr-good fr-tb' : 'fr-bad fr-tb');
    const right = ch.reduce((m, q) => (q[0] > m[0] ? q : m), ch[0]);
    return { svg: s, labels: [{ id: 'protein', side: 'R', at: right, pin: [-6, -24] }] };
  }
};

/* 5. the homogenizer in ice, and what happens inside the tube, magnified */
const CELLS = [[405, 175, 0], [528, 205, 1], [448, 318, 2]];
/* the parts of the three cells: kind, where it is in its cell (dx, dy), its cell, where it ends up free, its size */
const FREE = [
  ['nuc', -8, 0, 0, 530, 165, 26], ['nuc', 6, 2, 1, 392, 240, 22], ['nuc', 0, -4, 2, 470, 360, 20],
  ['mito', 28, -28, 0, 560, 232, 1], ['mito', -30, 30, 1, 385, 300, 1], ['mito', 26, 30, 2, 445, 205, 1], ['mito', -34, -30, 2, 350, 180, 1],
  ['lyso', 30, 26, 0, 540, 310, 10], ['lyso', -26, -26, 1, 410, 150, 9], ['lyso', 34, -20, 2, 505, 270, 9],
  /* (a microsome starts where its piece of the rough ER was) */
  ['micro', 17, -17, 0, 515, 356, 7], ['micro', 31, -15, 1, 455, 262, 6], ['micro', 30, -4, 2, 345, 250, 6], ['micro', 17, 17, 0, 500, 200, 6], ['micro', 31, 19, 1, 420, 345, 6]
];
const RIBO_FREE = scatter(12, [340, 150, 520, 380], 14, 21, [{ x: 530, y: 165, r: 40 }, { x: 470, y: 360, r: 30 }, { x: 392, y: 240, r: 32 }]);
const RIBO_CLUSTER = scatter(5, [566, 260, 590, 278], 7, 9);
ART.homog = {
  dw: 620, dh: 452,
  cols: { L: ['pestle', 'tube', 'ice'], R: ['livercell', 'h4pm', 'h4nuc', 'h4mito', 'h4ribo', 'h4lyso', 'h4micro'] },
  legend: esc(UI.notScale) + '.',
  draw(st, g) {
    const p = st.p || 0;
    /* (part: everything drawn since the last part or plain becomes one part of the picture, for the names' cards) */
    let at = 0, am = 0; const part = ids => { s = s.slice(0, at) + P(ids, s.slice(at)); at = s.length; }, plain = () => { at = s.length; };
    let s = '';
    [[56, 236, 12], [224, 246, -14], [58, 318, 8], [226, 330, 20], [66, 392, -10], [214, 396, 14], [70, 196, 20], [208, 190, -8]].forEach(([x, y, a]) => { s += `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - 12}" y="${y - 12}" width="24" height="24" rx="4.5" class="fr-ice"/><path d="M${x - 7},${y - 7} h9" class="fr-ice-hi"/></g>`; });
    s += IM('beaker', 140, 285, 262, 300);
    part('ice');
    s += SH.tube(100, 30, 80, 380, 112);
    const cloud = seg(p, 0.1, 0.9);
    if (cloud) s += `<path d="M103,112 V370 A37 37 0 0 0 177,370 V112 Z" class="fr-homog" opacity="${r1(cloud * 70) / 100}"/>`;
    [[124, 380, 13], [152, 388, 11], [140, 360, 12], [165, 368, 9]].forEach(([x, y, r]) => { const k = 1 - seg(p, 0.05, 0.8); if (k > 0.02) s += `<ellipse cx="${x}" cy="${y}" rx="${r1(r * k)}" ry="${r1(r * 0.75 * k)}" class="fr-liver"/>`; });
    part('tube');
    const hy = 128 + 240 * (1 - Math.cos(6 * Math.PI * p)) / 2;
    /* (the pestle: the kit's drawing on the motor's rod; the marks on the rod show that it turns) */
    s += `<rect x="134.5" y="0" width="11" height="${r1(Math.max(0, hy - 150))}" class="fr-pestle"/>`;
    for (let i = 0; i < 4; i++) { const yy = 18 + ((i * 26 + p * 400) % 104); if (yy < hy - 158) s += `<path d="M135.5,${r1(yy)} l9,-5" class="fr-pestle-line"/>`; }
    s += IM('pestle', 140, hy - 76, 46, 162);
    s += '<path d="M118,14 A24 8 0 1 0 162,14" class="fr-turn"/><path d="M158,8 L163,14 L156,17" class="fr-turn"/>';
    part('pestle');
    s += TX(g, 22, 446, UI.mediumIs, 15, 'fr-t2', 'start');
    /* magnified: three liver cells, whose membranes tear; their parts end up free in the medium */
    s += '<defs><clipPath id="frvMag"><circle cx="465" cy="240" r="146"/></clipPath></defs><circle cx="465" cy="240" r="148" class="fr-win"/>';
    s += TX(g, 465, 76, 'Inside the tube, magnified', 16, 'fr-t2');
    plain();
    let m = '<g clip-path="url(#frvMag)" data-deep="1">'; am = m.length;
    const partM = ids => { m = m.slice(0, am) + P(ids, m.slice(am)); am = m.length; };
    const open = seg(p, 0.2, 0.6), go = ease(seg(p, 0.3, 1));
    /* (three whole cells, each the kit's animal cell: as their membranes tear, each fades and its parts are free) */
    CELLS.forEach(([x, y], c) => { if (open < 1) m += IM('cell', x, y, 138, null, { op: 1 - open, rot: [0, 200, 95][c] }); });
    const mcO = seg(p, 0.42, 0.7), freeO = seg(p, 0.12, 0.5);      /* (the microsomes come from the ER as it breaks; the free parts show as the cells fade) */
    partM('livercell');
    const pieces = seg(p, 0.45, 0.85);
    if (pieces) [[450, 120, 22, 200, 340], [372, 140, 18, 220, 330], [465, 300, 16, 20, 160]].forEach(([x, y, R, a0, a1]) => {
      const P0 = [x + R * Math.cos(a0 * D), y + R * Math.sin(a0 * D)], P1 = [x + R * Math.cos(a1 * D), y + R * Math.sin(a1 * D)];
      m += `<path d="M${r1(P0[0])},${r1(P0[1])} A${R} ${R} 0 0 1 ${r1(P1[0])},${r1(P1[1])}" class="fr-pm-piece" opacity="${r1(pieces * 100) / 100}"/>`; });
    partM('h4pm');
    FREE.forEach(([k, dx, dy, c, ex, ey, z]) => {
      const x = lerp(CELLS[c][0] + dx, ex, go), y = lerp(CELLS[c][1] + dy, ey, go), sc = lerp(0.62, 1, go);
      if (freeO < 0.02) return;
      const O = d => (freeO < 0.995 ? `<g opacity="${r1(freeO * 100) / 100}">${d}</g>` : d);
      if (k === 'nuc') m += P('h4nuc', O(SH.nuc(x, y, r1(z * lerp(0.75, 1, go)))));
      else if (k === 'mito') m += P('h4mito', O(SH.mito(x, y, 40 * sc, 17 * sc, (dx * 7) % 50)));
      else if (k === 'lyso') m += P('h4lyso', O(SH.lyso(x, y, r1(z * sc))));
      else if (mcO > 0.02) m += P('h4micro', `<g opacity="${r1(mcO * 100) / 100}">${SH.micro(x, y, r1(z * sc))}</g>`);
    });
    am = m.length;
    if (freeO > 0.02) RIBO_FREE.concat(RIBO_CLUSTER).forEach(([x, y], i) => { const c = CELLS[i % 3]; m += SH.ribo(lerp(c[0] + (i * 13 % 50) - 25, x, go), lerp(c[1] + (i * 17 % 50) - 25, y, go), 2.4); });
    partM('h4ribo');
    s += m + '</g>';
    const L = [{ id: 'pestle', side: 'L', at: [133, 70], pin: [-22, 0] }, { id: 'tube', side: 'L', at: [100, 128], pin: [-20, 4] }, { id: 'ice', side: 'L', at: [41, 300], pin: [6, 24] }];
    if (p >= 1) {
      const rc = RIBO_CLUSTER.reduce((q, r) => (r[0] > q[0] ? r : q), RIBO_CLUSTER[0]);
      L.push({ id: 'h4pm', side: 'R', at: [461, 101], pin: [-28, 6] }, { id: 'h4nuc', side: 'R', at: [548, 160], pin: [0, -26] }, { id: 'h4mito', side: 'R', at: [576, 232], pin: [6, -20] },
        { id: 'h4ribo', side: 'R', at: rc, pin: [14, -18] }, { id: 'h4lyso', side: 'R', at: [549, 310], pin: [18, 14] }, { id: 'h4micro', side: 'R', at: [522, 356], pin: [16, 12] });
    } else L.push({ id: 'livercell', side: 'R', at: [593, 200], pin: [-12, -22] });
    return { svg: s, labels: L };
  }
};

/* 6. the centrifuge, the tube now, and the pellets collected */
const KIND = { nuc: 0, mito: 1, lyso: 1, micro: 2, ribo: 3 };
const SIZE = { nuc: 12, mito: 12, lyso: 6, micro: 4, ribo: 1.8 };
const ARRIVE = { nuc: 0.5, mito: 0.66, lyso: 0.72, micro: 0.86, ribo: 1 };      /* the larger arrive first */
const PARTS = (() => {
  const want = [['nuc', 3], ['mito', 5], ['lyso', 4], ['micro', 8], ['ribo', 18]], out = [], R = rng(31);
  want.forEach(([k, n]) => {
    for (let i = 0, t = 0; i < n && t < 4000; t++) {
      const x = lerp(244, 296, R()), y = lerp(96, 386, R()), r = SIZE[k];
      if (out.some(o => Math.hypot(o.x - x, o.y - y) < o.r + r + 4)) continue;
      out.push({ k, x, y, r, rot: Math.round(R() * 160 - 80) }); i++;
    }
  });
  return out;
})();
/* where the particles of a pellet lie: packed in rows from the round bottom of the tube, the largest first */
function packPellet(list) {
  const C = 270, Rb = 36, yc = 400, out = new Map();
  const half = yy => (yy <= yc ? Rb : Math.sqrt(Math.max(0, Rb * Rb - (yy - yc) * (yy - yc))));
  const sorted = list.slice().sort((a, b) => b.r - a.r), W = q => (q.k === 'mito' ? 24 : 2 * q.r), Hh = q => (q.k === 'mito' ? 12 : 2 * q.r);
  let base = 438, i = 0;
  while (i < sorted.length && base > 120) {
    const hw = half(base - Hh(sorted[i]) / 2) - 1;
    let x = C - hw, rowH = 0, any = false;
    while (i < sorted.length && x + W(sorted[i]) <= C + hw) { const q = sorted[i]; out.set(q, [x + W(q) / 2, base - Hh(q) / 2]); x += W(q) + 1; rowH = Math.max(rowH, Hh(q)); i++; any = true; }
    base -= any ? rowH + 1 : 2;
  }
  return { at: out, top: base };
}
ART.spin = {
  dw: 660, dh: 470,
  cols: { L: ['rotor', 'homog', 'super', 'mixed'], R: [] },
  legend: esc(UI.xg) + '. ' + esc(UI.notScale) + '. Each spin is ' + esc(UI.fast) + '.',
  draw(st, g) {
    const A = st.anim, n = st.n;
    let s = '';
    /* the rotor, seen from above */
    const spinP = A && A.type !== 'again' ? ease(seg(A.p, 0, A.type === 'ok' ? 0.6 : 1)) : 0, ang = spinP * 1440;
    /* (the kit's bench centrifuge, its lid open; while it spins, two bright marks go round its rotor) */
    s += `<g data-p="rotor">${IM('centrifuge', 95, 106, 156)}${spinP > 0 && spinP < 1 ? `<ellipse cx="95" cy="124.5" rx="27" ry="9.5" class="fr-spin" stroke-dasharray="26 62" stroke-dashoffset="${r1(-ang * 0.49)}"/>` : ''}</g>`;
    const shown = A && A.type !== 'again' ? A.k : st.last;
    if (shown != null) {
      const sp = SPINS.find(x => x.id === FRACTIONS[shown].id);
      /* (each on two lines, so that the words stay beside the tube at any scale) */
      const fast = A && A.type !== 'again';
      s += TL(g, 95, 232, [{ t: `${sp.g} × g`, cls: 'fr-tb' }, { t: sp.time, cls: 'fr-tb' }].concat(fast ? [{ t: 'shown in about', cls: 'fr-t2' }, { t: '2 seconds', cls: 'fr-t2' }] : []), 16, '', 'middle', 1.2);
    }
    /* the tube now: what is left in it, and what sinks */
    const target = A ? A.k : st.wrong;
    const sinking = PARTS.filter(q => KIND[q.k] >= n && target != null && target >= 0 && KIND[q.k] <= target);
    const pk = packPellet(sinking);
    const prog = q => {
      if (A && A.type === 'again') return 1 - ease(A.p);
      if (A) { const span = A.type === 'ok' ? 0.6 : 1; return ease(seg(A.p / span, 0, ARRIVE[q.k])); }
      return st.wrong != null && st.wrong >= 0 ? 1 : 0;
    };
    const pour = A && A.type === 'ok' ? ease(seg(A.p, 0.66, 1)) : 0;
    s += '<defs><clipPath id="frvTube"><path d="M233,80 V400 A37 37 0 0 0 307,400 V80 Z"/></clipPath></defs>';
    s += P('super homog', SH.tube(230, 40, 80, 400, 80));      /* (the liquid in the tube: the homogenate, then each supernatant) */
    let pel = '', sus = '';
    const top = pk.top;
    const any = sinking.length ? Math.max(...sinking.map(prog)) : 0;
    if (any > 0.02) pel += `<rect x="230" y="${r1(top - 2)}" width="80" height="${r1(442 - top)}" class="fr-pellet" opacity="${r1(Math.min(1, any * 1.2) * 100) / 100}" clip-path="url(#frvTube)"/>`;
    PARTS.forEach(q => {
      if (KIND[q.k] < n) return;
      const sinks = sinking.includes(q), e = sinks ? prog(q) : 0, end = sinks ? pk.at.get(q) : null;
      const x = sinks && end ? lerp(q.x, end[0], e) : q.x, y = sinks && end ? lerp(q.y, end[1], e) : q.y;
      const d = q.k === 'nuc' ? SH.nuc(x, y, q.r) : q.k === 'mito' ? SH.mito(x, y, 24, 11, sinks ? lerp(q.rot, 0, e) : q.rot) : q.k === 'lyso' ? SH.lyso(x, y, q.r) : q.k === 'micro' ? SH.micro(x, y, q.r) : SH.ribo(x, y, q.r);
      if (sinks) pel += d; else sus += d;
    });
    s += P('super homog', sus);
    /* the pellet of a right spin leaves for its own tube in the rack (the supernatant stays: it is poured into a new tube) */
    if (pel) {
      if (pour) { const row = 46 + n * 82, sx = lerp(1, 0.3, pour), tx = lerp(0, 422 - 270 * sx, pour), ty = lerp(0, row + 62 - 440 * sx, pour);
        s += `<g data-p="mixed pellet" transform="translate(${r1(tx)} ${r1(ty)}) scale(${r1(sx * 100) / 100})" opacity="${r1((1 - pour * 0.9) * 100) / 100}">${pel}</g>`; }
      else s += P('mixed pellet', pel);
    }
    /* the pellets collected */
    /* (their heading is a name to press; so is the liquid left at the end) */
    const tags = [{ id: 'pellet', text: NAMES.pellet[0], at: [404, 20], align: 'start' }];
    for (let i = 0; i < 5; i++) {
      const row = 46 + i * 82, got = i < n, last = i === 4, done = last && n === 4;
      let r = SH.tube(408, row, 24, 62, row + 16, got || done ? 'fr-liq' : 'fr-liq fr-liq--none');
      if (got) r += `<path d="M411,${row + 50} Q420,${row + 42} 429,${row + 50} V${row + 52} A9 9 0 0 1 411,${row + 52} Z" class="fr-pellet fr-pellet--${i}"/>`;
      const name = last ? [] : got ? (i === 1 ? [`${i + 1}. mitochondria,`, 'lysosomes'] : [`${i + 1}. ${FRACTIONS[i].name}`]) : [`${i + 1}.`];
      const sp = !last && got ? SPINS.find(x => x.id === FRACTIONS[i].id) : null;
      const lines = name.map((t, j) => ({ t, cls: got || done ? (j ? 'fr-t1' : 'fr-tb') : 'fr-t2' }));
      if (sp && !g.narrow) lines.push({ t: `${sp.g} × g, ${sp.time}`, cls: 'fr-t2' });
      if (lines.length) r += TL(g, 442, row + 20, lines, 16, '', 'start', 1.2);
      s += P(last ? 'left' : 'pellet', r);
      if (done) tags.push({ id: 'left', text: NAMES.left[0], at: [442, row + 30], align: 'start' });
    }
    /* Reduce motion shows each spin as one still, so an arrow says what moved: the particles down the tube in a spin
       chosen too soon; the pellet of the last right spin to its own tube */
    if (FAST && !A) {
      if (st.wrong != null && st.wrong >= 0) s += SH.arrow(326, 240, 326, 366, 'fr-move');
      else if (n > 0 && st.last === n - 1) s += SH.arrow(318, 432, 398, 46 + (n - 1) * 82 + 50, 'fr-move');
    }
    const L = [{ id: 'rotor', side: 'L', at: [22, 150], pin: [-4, -30] }];      /* (the centrifuge's left side) */
    if (st.wrong != null && st.wrong >= 0 && !A) L.push({ id: 'mixed', side: 'L', at: [236, 428], pin: [-22, 0] });
    else if (n === 0 && !A) L.push({ id: 'homog', side: 'L', at: [234, 330], pin: [-22, 0] });
    else if (!A) L.push({ id: 'super', side: 'L', at: [234, 330], pin: [-22, 0] });
    return { svg: s, tags, labels: L };
  }
};

/* 7. de Duve's test: two samples of pellet 2, A with its membranes whole, B with its membranes broken. In each, the
   substrate molecules move at random (walk.js): a whole membrane turns them back; one that meets a free enzyme
   molecule becomes product */
const AW = { A: 20, B: 320, y: 188 };      /* where each sample's window (walk.js ASSAY) stands in the art */
ART.deduve = {
  dw: 600, dh: 470,
  cols: { L: ['d6mito', 'd6enz', 'd6lyso'], R: [] },
  legend: `${ICON.sub} substrate · ${ICON.prod} product (phosphate) · ${esc(UI.lowHigh)} · ${esc(UI.notScale)}`,
  draw(st, g) {
    let mito = '', lyso = '', enz = '', mol = '', rest = '';
    const win = which => {
      const ox = AW[which], oy = AW.y, meas = which === 'A' ? st.a : st.b, sim = which === 'A' ? st.simA : st.simB;
      const brk = which === 'B' && st.brk ? ease(st.brk.p) : 0, how = which === 'B' && st.brk ? st.brk.how : null;
      const swell = how === 'water' ? 1 + 0.25 * seg(brk, 0, 0.6) : 1, bb = how === 'water' ? seg(brk, 0.6, 1) : how === 'det' ? brk : 0;
      rest += `<rect x="${ox}" y="${oy}" width="${ASSAY.W}" height="${ASSAY.H}" rx="12" class="fr-win"/>`;
      ASSAY.MITO.forEach(([x, y, a, b]) => { mito += SH.mito(ox + x, oy + y, (a - 2) * 2, (b - 2) * 2, 0, { b: bb, s: swell, exact: true }); });
      ASSAY.LYS.forEach(([x, y, r], l) => {
        const leaky = l === 2, sp = Math.max(bb, leaky ? LEAK : 0);      /* (a few lysosomes always break while the cells are homogenized) */
        lyso += SH.lyso(ox + x, oy + y, r, { s: swell, b: Math.max(bb, leaky ? 0.75 : 0), noEnz: true });
        for (let i = 0; i < 3; i++) { const q = enzymeAt(l, i, sp); enz += SH.enz(ox + q[0], oy + q[1], Math.max(2.6, r * 0.2), i * 40); }
      });
      if (meas != null && sim) {
        const fade = clamp01(sim.t / ASSAY.IN);
        for (let i = 0; i < sim.n; i++) {
          const x = ox + sim.x[i], y = oy + sim.y[i];
          if (sim.prod[i]) mol += `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.4" class="fr-prod"/>`;
          else mol += `<path d="M${r1(x)},${r1(y - 5)} l5,5 l-5,5 l-5,-5Z" class="fr-sub" opacity="${r1(fade * 100) / 100}"/>`;
        }
        /* how much product in the same time: a bar with no numbers */
        const f = sim.made / sim.n;
        rest += `<rect x="${ox + 50}" y="${oy + ASSAY.H + 10}" width="160" height="10" rx="5" class="fr-meter"/><rect x="${ox + 50}" y="${oy + ASSAY.H + 10}" width="${r1(160 * f)}" height="10" rx="5" class="fr-meter-f"/>`;
        if (meas >= 1) rest += TX(g, ox + 130, oy + ASSAY.H + 22 + g.lh(16), which === 'A' ? UI.low : UI.high, 16, 'fr-tb');
      }
    };
    rest += SH.tube(135, 16, 30, 128, 46) + SH.tube(435, 16, 30, 128, 46);
    rest += TX(g, 150, 170, UI.fresh, 16, 'fr-tb') + TX(g, 450, 170, st.brk && st.brk.p >= 1 ? UI.broken : 'B: ' + UI.fresh.slice(3), 16, 'fr-tb');
    win('A'); win('B');
    const e0 = enzymeAt(1, 0, 0);
    return { svg: rest + P('d6mito', mito) + P('d6lyso', lyso) + P('d6enz', enz) + P('sub prod', mol),
      labels: [{ id: 'd6mito', side: 'L', at: [AW.A + ASSAY.MITO[0][0] - 28, AW.y + ASSAY.MITO[0][1] + 2], pin: [10, -27] }, { id: 'd6enz', side: 'L', at: [AW.A + e0[0], AW.y + e0[1]], pin: [0, -26] }, { id: 'd6lyso', side: 'L', at: [AW.A + ASSAY.LYS[0][0] - 20, AW.y + ASSAY.LYS[0][1] + 4], pin: [-2, 26] }] };
  }
};

/* ---------------- the words: paragraphs with their level tags ---------------- */
const chip = (lv, code) => `<span class="lv lv--${lv}">${esc(LEVELS[lv].name)}${code ? ` <i>${esc(code)}</i>` : ''}</span>`;
const TAG = /^\[(sl|x)(?:\s+([A-Z][0-9.]+(?:,\s*[A-Z][0-9.]+)*))?\]\s*/;
function one(p) { const m = TAG.exec(p); return m ? `<p class="lvp lvp--${m[1]}">${chip(m[1], m[2])} ${esc(p.slice(m[0].length))}</p>` : `<p>${esc(p)}</p>`; }
/* (only a line beyond the guide is ever folded: text.js marks it [x+]; every other line is on show) */
function split(t) {
  const main = [], more = [];
  String(t || '').split('\n').filter(Boolean).forEach(p => {
    if (p.startsWith('[!] ')) main.push(`<p class="lvp lvp--lead">${esc(p.slice(4))}</p>`);
    else if (p.startsWith('[x+] ')) more.push(one('[x] ' + p.slice(5)));
    else main.push(one(p));
  });
  return { main: main.join(''), more: more.join('') };
}
const paras = t => split(t).main;

function styles() {
  let l = document.querySelector('link[data-frcss]');
  if (!l) { l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.frcss = '1'; l.href = new URL('../../css/fractionation.css?v=202611272058', import.meta.url).href; document.head.appendChild(l); }
  return l;
}
/* the game calls this when the door first shows: the styles come while the pupil reads (the code is already here) */
export function warm() { styles(); artBitmaps(); }

const fresh = () => ({
  why: {},
  conc: { p: {}, last: null, run: null },
  cold: { temp: null, tp: null, sim: null },
  ph: { ph: null, pp: null },
  homog: { p: null },
  spin: { n: 0, wrong: null, last: null, anim: null, msg: null },
  deduve: { a: null, brk: null, b: null, last: null, simA: null, simB: null }
});
const GOAL = {
  why: () => true,
  conc: s => s.p.iso >= 1,
  cold: s => s.temp === 'ice' && s.tp >= 1,
  ph: s => s.ph === 'buf' && s.pp >= 1,
  homog: s => s.p >= 1,
  spin: s => s.n === 4 && !s.anim,
  deduve: s => s.b >= 1
};

export function openFractionation({ mount = document.body, inGame = false, onClose = null, start = 0, mark = null, backLabel = '← Back to the game' } = {}) {
  const css = styles(); artBitmaps();
  const root = document.createElement('div');
  root.className = 'frv' + (inGame ? ' frv--game' : '') + (FAST ? ' frv--still' : '');
  root.setAttribute('role', inGame ? 'dialog' : 'main'); if (inGame) root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'frv-h');
  root.innerHTML = `
    <header class="frv__top">
      <div class="frv__id"><p class="frv__eyebrow">${esc(EYEBROW)}</p><h1 id="frv-h">${esc(TITLE)}</h1><p class="frv__by">Made by Dr Daniel Mompel Riera</p></div>
      ${inGame ? `<button type="button" class="frv__home frv__close">${esc(backLabel)}</button>` : '<a class="frv__home" href="../">← The cell game</a>'}
    </header>
    <div class="frv__main">
      <div class="frv__stage">
        <canvas class="frv__cv" aria-hidden="true"></canvas>
        <svg class="frv__svg" role="img" xmlns="http://www.w3.org/2000/svg"></svg>
        <div class="frv__names"></div>
        <div class="frv__tags"></div>
        <p class="frv__legend"></p>
      </div>
      <p class="frv__strip" aria-live="off" hidden></p>
      <div class="frv__key" hidden></div>
      <aside class="frv__panel" aria-label="The steps">
        <p class="frv__count" aria-live="polite"></p>
        <nav class="frv__steps" aria-label="The steps"></nav>
        <h2 class="frv__st"></h2>
        <div class="frv__text"></div>
        <div class="frv__ctl"></div>
        <div class="frv__res" aria-live="polite"></div>
        <div class="frv__text frv__done" aria-live="polite"></div>
        <div class="frv__folds"></div>
        <div class="frv__cards" aria-live="polite" hidden></div>
        <div class="frv__do">
          <button type="button" class="frv__back" aria-label="The step before">← Back</button>
          <button type="button" class="frv__next">Next step →</button>
        </div>
        <section class="frv__more">
          <h3>What the tags mean</h3>
          <div class="frv__tagsmean">
            <p>${chip('sl')} ${esc(LEVELS.sl.long)}.</p>
            <p>${chip('x')} ${esc(LEVELS.x.long)}.</p>
            <p>The codes (B2.2.1 …) are the IB guide's own numbers for each statement.</p>
          </div>
          <h3>What this picture simplifies</h3>
          <ul class="frv__simple">${SIMPLE.map(s => `<li>${chip('x')} ${esc(s)}</li>`).join('')}</ul>
          <h3>Sources</h3>
          <ol class="frv__src">${SOURCES.map(s => `<li>${esc(s.c)}${s.u ? ` <a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.u.replace(/^https?:\/\//, ''))}</a>` : ''}<span class="src">Used for: ${esc(s.s)}</span></li>`).join('')}</ol>
        </section>
      </aside>
    </div><style class="frv__dim"></style>`;
  mount.appendChild(root);
  const unmark = marks(root, mark);
  if (!css.sheet) { root.style.visibility = 'hidden'; const on = () => { root.style.visibility = ''; layoutAll(); }; css.addEventListener('load', on, { once: true }); css.addEventListener('error', on, { once: true }); setTimeout(on, 4000); }
  document.documentElement.classList.add('fractionationv-open');
  const $ = q => root.querySelector(q);
  const stageEl = $('.frv__stage'), svgEl = $('.frv__svg'), cvEl = $('.frv__cv'), namesEl = $('.frv__names'), tagsEl = $('.frv__tags'), legendEl = $('.frv__legend'), stripEl = $('.frv__strip'), keyEl = $('.frv__key'), panelEl = $('.frv__panel');
  const countEl = $('.frv__count'), stepsEl = $('.frv__steps'), titleEl = $('.frv__st'), textEl = $('.frv__text'), ctlEl = $('.frv__ctl'), resEl = $('.frv__res'), doneEl = $('.frv__done'), foldEl = $('.frv__folds'), cardsEl = $('.frv__cards'), dimEl = $('.frv__dim');
  const nextB = $('.frv__next'), backB = $('.frv__back');

  let S = fresh(), si = 0, busy = false, token = 0, closed = false, G = null, cur = null, placed = [], raf = 0, focusId = null;
  const step = () => STEPS[si], id = () => STEPS[si].id, st = () => S[id()], goal = () => GOAL[id()](st());
  const cardOf = nid => (step().cards || {})[nid] || null;
  const isFound = nid => found(VIEW).has(id() + '.' + nid);

  /* ---------------- the picture: its layout, its frame, its names ---------------- */
  /* the margins on a laptop: as wide as the widest name each side can show in this step (measured once) */
  const widths = new Map();
  /* a name: a button with a ring when it has a card (text.js cards), else its words and what it is */
  function nameBox(nid, maxW) {
    const card = !!cardOf(nid), el = document.createElement(card ? 'button' : 'div'), [name, sub] = NAMES[nid];
    el.className = 'frv__nm' + (card ? ' frv__nm--card' : ''); el.style.maxWidth = maxW + 'px'; el.style.visibility = 'hidden';
    if (card) { el.type = 'button'; el.dataset.card = nid; }
    el.innerHTML = `${card ? '<i class="frv__ring" aria-hidden="true"></i>' : ''}<b>${esc(name)}</b>${sub && !card ? `<span>${esc(sub)}</span>` : ''}`;
    return el;
  }
  function margins(A, maxW) {
    const key = id() + ':' + maxW;
    if (!widths.has(key)) {
      const m = {};
      ['L', 'R'].forEach(side => { m[side] = 0; A.cols[side].forEach(n => { const el = nameBox(n, maxW); namesEl.appendChild(el); m[side] = Math.max(m[side], el.offsetWidth); el.remove(); }); });
      widths.set(key, m);
    }
    return widths.get(key);
  }
  function layout() {
    const A = ART[id()], r = stageEl.getBoundingClientRect(), W = Math.max(200, r.width), H = Math.max(160, r.height);
    const narrow = W < 560, maxW = Math.round(Math.min(230, Math.max(130, W * 0.21)));
    const { dw, dh } = A.dim ? A.dim(narrow) : A;
    const lh = legendEl.offsetHeight ? legendEl.offsetHeight + 10 : 0, m = narrow ? { L: 0, R: 0 } : margins(A, maxW);
    const L = m.L ? m.L + 24 : 10, R = m.R ? m.R + 24 : 10, top = 10, bottom = H - lh - 6;
    const bw = W - L - R, bh = bottom - top, k = Math.min(bw / dw, bh / dh);
    const ox = L + (bw - dw * k) / 2, oy = top + (bh - dh * k) / 2;
    const sz = px => (narrow ? r1(px * 0.8) : px);
    return { W, H, narrow, maxW, k, ox, oy, dw, dh, bottom, F: px => r1(px / k * 100) / 100, sz, lh: px => sz(px) * 1.22 / k };
  }
  /* a tube's name pressed while another medium (or none) is in the window: that tube's medium is shown (ART.conc) */
  const preview = () => { const v = TUBE[focusId], s = st(); return id() === 'conc' && v && (!s.run || s.run.v !== v) ? v : null; };
  function draw() {
    G = layout(); G.pv = preview(); G.focus = focusId;
    cur = ART[id()].draw(st(), G);
    svgEl.setAttribute('viewBox', `0 0 ${r1(G.W)} ${r1(G.H)}`);
    svgEl.innerHTML = `<g class="frv__art" transform="translate(${r1(G.ox)} ${r1(G.oy)}) scale(${Math.round(G.k * 1e4) / 1e4})">${cur.svg}</g><g class="fr-lines"></g>`;
    drawOsm(); renderStrip();
  }
  /* the art alone, again (a name pressed in step 2: the layout and the names stay as they are) */
  function redrawArt() { G.pv = preview(); G.focus = focusId; cur = ART[id()].draw(st(), G); svgEl.querySelector('.frv__art').innerHTML = cur.svg; drawOsm(); renderStrip(); }
  const px = at => [G.ox + at[0] * G.k, G.oy + at[1] * G.k];

  /* step 2's molecules: on the canvas under the picture. What is drawn follows the molecules a tenth of a second
     behind (their slide past each other shows, not the fast shake of each in its place) */
  const cssVar = n => getComputedStyle(root).getPropertyValue(n).trim();
  let osmRest = null, osmT = 0, colours = null; const osmPrev = {};
  function shownOf(o) { if (!o.sx) { o.sx = Float32Array.from(o.L.x); o.sy = Float32Array.from(o.L.y); o.hs = [o.L.h[0], o.L.h[1]]; o.seen = 0; o.ring = -1; o.ringT = 0; } return o; }
  function drawOsm() {
    const on = id() === 'conc';
    cvEl.hidden = !on; if (!on) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(G.W * dpr), h = Math.round(G.H * dpr);
    if (cvEl.width !== w || cvEl.height !== h) { cvEl.width = w; cvEl.height = h; }
    const ctx = cvEl.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, G.W, G.H);
    const s = st(), W = winAt(G.narrow);
    if (!s.run && !osmRest) osmRest = { L: makeOsmosis('iso') };
    const pv = preview(); if (pv && !osmPrev[pv]) osmPrev[pv] = { L: makeOsmosis(pv) };
    const o = shownOf(pv ? osmPrev[pv] : s.run || osmRest), L = o.L, now = performance.now(), dt = Math.min(100, now - (osmT || now)); osmT = now;
    if (busy && !FAST) {
      const a = 1 - Math.exp(-dt / 90), b = 1 - Math.exp(-dt / 700);
      for (let i = 0; i < L.N; i++) { o.sx[i] += (L.x[i] - o.sx[i]) * a; o.sy[i] += (L.y[i] - o.sy[i]) * a; }
      o.hs[0] += (L.h[0] - o.hs[0]) * b; o.hs[1] += (L.h[1] - o.hs[1]) * b;
      const c = L.c.LR + L.c.RL; if (c > o.seen) { o.seen = c; o.ring = L.last; o.ringT = now; }
    } else { o.sx.set(L.x); o.sy.set(L.y); o.hs = [L.h[0], L.h[1]]; o.ring = -1; }
    if (!colours) colours = { sol: cssVar('--fr-sol'), w: cssVar('--fr-w'), s: cssVar('--fr-s'), sline: cssVar('--fr-sline'), mem: cssVar('--fr-memb'), glass: cssVar('--glass'), ring: cssVar('--fr-ring') };
    const inWin = ['hypo', 'iso', 'hyper', 'solute', 'm2mem'].includes(focusId);
    cvEl.style.opacity = focusId && !inWin ? 0.3 : 1;
    drawLiquid(ctx, { L, sx: o.sx, sy: o.sy, hs: o.hs, u: WINU * G.k, col: colours, right: !!(pv || s.run), X: ux => G.ox + W.X(ux) * G.k, Y: uy => G.oy + W.Y(uy) * G.k,
      dimW: inWin, dimS: focusId === 'm2mem', ring: o.ring, ringA: o.ring >= 0 ? clamp01(1 - (now - o.ringT) / 900) : 0 });
  }
  /* what is counted, beside the picture: the crossings of step 2 both ways; the digested proteins of step 3 */
  function renderStrip() {
    let h = '';
    const s = st();
    if (id() === 'conc' && s.run) {
      const c = counts(s.run.L), v = s.run.v;
      h = `<b>${esc(UI.crossed)}</b><span>${esc(UI.into)} <i>${c.in}</i></span><span>${esc(UI.out)} <i>${c.out}</i></span><em${s.p[v] >= 1 ? '' : ' class="is-wait"'}>${esc(UI.net[v])}</em>`;
    } else if (id() === 'cold' && s.sim) {
      h = `<b>${esc(UI.collisions)}</b><span><i>${s.sim.hits}</i></span><span>${esc(UI.digestedN)} <i>${s.sim.eaten}</i> ${esc(UI.of)} ${PROTEINS.length}</span><span>${esc(UI.after)} ${Math.floor(s.sim.t + 1e-6)} ${esc(UI.secs)}</span>`;
    }
    if (stripEl.dataset.h !== h) { stripEl.dataset.h = h; stripEl.innerHTML = h; stripEl.hidden = !h; }
    stripEl.classList.toggle('is-off', !!preview());      /* (the count is of the run, not of the medium now shown) */
  }

  function clearNames() { namesEl.innerHTML = ''; const l = svgEl.querySelector('.fr-lines'); if (l) l.innerHTML = ''; placed = []; }
  /* the names that stand on the picture itself (a tube's name, a heading): buttons at their place, in every state */
  function placeTags() {
    const list = (cur && cur.tags) || [], sig = id() + '|' + G.narrow + '|' + list.map(t => t.id + '@' + px(t.at).map(Math.round).join(',')).join('|');
    if (tagsEl.dataset.sig !== sig) {
      tagsEl.dataset.sig = sig;
      tagsEl.innerHTML = list.map(t => `<button type="button" class="frv__tag" data-card="${t.id}"><i class="frv__ring" aria-hidden="true"></i><b>${esc(t.text)}</b></button>`).join('');
      Array.from(tagsEl.children).forEach((el, i) => {
        const t = list[i], [x, y] = px(t.at), w = el.offsetWidth, h = el.offsetHeight;
        const l = Math.max(2, Math.min(G.W - w - 2, t.align === 'start' ? x : x - w / 2)), top = t.below ? y + 3 : y - h / 2;
        el.style.transform = `translate(${r1(l)}px, ${r1(top)}px)`; el._box = { l, t: top, r: l + w, b: top + h };
      });
      markCards();
    }
    return Array.from(tagsEl.children).map(el => ({ id: el.dataset.card, kind: 'tag', box: el._box, line: null }));
  }
  function placeNames() {
    clearNames();
    if (!cur) return;
    const lines = svgEl.querySelector('.fr-lines'), labs = cur.labels;
    let ln = '';
    if (!G.narrow) {
      keyEl.hidden = true; keyEl.innerHTML = '';
      const items = labs.map(l => {
        const el = nameBox(l.id, G.maxW);
        el.dataset.id = l.id; el.style.visibility = '';
        namesEl.appendChild(el);
        const [ax, ay] = px(l.at);
        return { l, el, w: el.offsetWidth, h: el.offsetHeight, ax, ay };
      });
      ['L', 'R'].forEach(side => {
        const list = items.filter(i => i.l.side === side).sort((a, b) => a.ay - b.ay);
        let y = 6;
        list.forEach(it => { it.y = Math.max(it.ay - it.h / 2, y); y = it.y + it.h + 8; });
        let lim = G.bottom;
        for (let i = list.length - 1; i >= 0; i--) { const it = list[i]; if (it.y + it.h > lim) it.y = lim - it.h; lim = it.y - 8; }
        list.forEach(it => {
          it.x = side === 'L' ? Math.max(4, G.ox - 12 - it.w) : Math.min(G.W - 4 - it.w, G.ox + G.dw * G.k + 12);
          it.el.style.transform = `translate(${r1(it.x)}px, ${r1(it.y)}px)`;
          const x1 = side === 'L' ? it.x + it.w : it.x, y1 = it.y + it.h / 2;
          ln += `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(it.ax)}" y2="${r1(it.ay)}" class="fr-ln"/><circle cx="${r1(it.ax)}" cy="${r1(it.ay)}" r="3" class="fr-dot"/>`;
          placed.push({ id: it.l.id, kind: 'label', box: { l: it.x, t: it.y, r: it.x + it.w, b: it.y + it.h }, line: [x1, y1, it.ax, it.ay] });
        });
      });
    } else {
      /* a phone: a numbered pin beside each part, a short line to it, the names in a key under the picture */
      const Q = labs.map((l, i) => { const [ax, ay] = px(l.at), o = l.pin || [0, -22]; return { l, n: i + 1, ax, ay, x: ax + o[0], y: ay + o[1] }; });
      const keep = q => { q.x = Math.max(13, Math.min(G.W - 13, q.x)); q.y = Math.max(13, Math.min(G.bottom - 13, q.y)); };
      const s0 = stageEl.getBoundingClientRect(), words = Array.from(svgEl.querySelectorAll('text')).map(t => { const b = t.getBoundingClientRect(); return { l: b.left - s0.left - 3, t: b.top - s0.top - 3, r: b.right - s0.left + 3, b: b.bottom - s0.top + 3 }; })
        .concat(Array.from(tagsEl.children).map(el => el._box).filter(Boolean).map(b => ({ l: b.l - 3, t: b.t - 3, r: b.r + 3, b: b.b + 3 })));
      Q.forEach(keep);
      for (let it = 0; it < 400; it++) {
        let moved = false;
        for (let i = 0; i < Q.length; i++) for (let j = i + 1; j < Q.length; j++) {
          /* two pins are clear of each other when their squares (24 px) do not meet */
          const a = Q[i], b = Q[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
          if (Math.abs(dx) < 27 && Math.abs(dy) < 27) { const ux = d ? dx / d : 0, uy = d ? dy / d : 1, m = (27 - Math.max(Math.abs(dx), Math.abs(dy))) / 2 + 1; a.x -= ux * m; a.y -= uy * m; b.x += ux * m; b.y += uy * m; keep(a); keep(b); moved = true; }
        }
        /* a pin on a word of the picture moves the shortest way off it */
        Q.forEach(q => words.forEach(w => {
          if (q.x + 12 <= w.l || q.x - 12 >= w.r || q.y + 12 <= w.t || q.y - 12 >= w.b) return;
          const o = [[w.l - 12 - q.x, 0], [w.r + 12 - q.x, 0], [0, w.t - 12 - q.y], [0, w.b + 12 - q.y]].sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]))[0];
          q.x += o[0] + Math.sign(o[0]) * 0.5; q.y += o[1] + Math.sign(o[1]) * 0.5; keep(q); moved = true;
        }));
        if (!moved) break;
      }
      Q.forEach(q => {
        const card = !!cardOf(q.l.id), el = document.createElement(card ? 'button' : 'div');
        el.className = 'frv__pin' + (card ? ' frv__pin--card' : ''); el.dataset.id = q.l.id; el.textContent = q.n;
        if (card) { el.type = 'button'; el.dataset.card = q.l.id; el.setAttribute('aria-label', NAMES[q.l.id][0]); }
        el.style.transform = `translate(${r1(q.x - 12)}px, ${r1(q.y - 12)}px)`;
        namesEl.appendChild(el);
        const d = Math.hypot(q.x - q.ax, q.y - q.ay);
        let line = null;
        if (d > 14) { const ex = q.x - (q.x - q.ax) / d * 12, ey = q.y - (q.y - q.ay) / d * 12; line = [ex, ey, q.ax, q.ay]; ln += `<line x1="${r1(ex)}" y1="${r1(ey)}" x2="${r1(q.ax)}" y2="${r1(q.ay)}" class="fr-ln"/>`; }
        ln += `<circle cx="${r1(q.ax)}" cy="${r1(q.ay)}" r="2.6" class="fr-dot"/>`;
        placed.push({ id: q.l.id, kind: 'pin', box: { l: q.x - 12, t: q.y - 12, r: q.x + 12, b: q.y + 12 }, line });
      });
      keyEl.innerHTML = Q.map(q => { const [name, sub] = NAMES[q.l.id], card = !!cardOf(q.l.id);
        return card ? `<button type="button" class="frv__k frv__k--card" data-card="${q.l.id}"><b>${q.n}</b><span>${esc(name)}</span><i class="frv__ring" aria-hidden="true"></i></button>` : `<span class="frv__k"><b>${q.n}</b><span>${esc(name)}${sub ? `<i>: ${esc(sub)}</i>` : ''}</span></span>`; }).join('');
      keyEl.hidden = !Q.length;
    }
    lines.innerHTML = ln;
    placed.push(...placeTags());
    markCards();
    requestAnimationFrame(() => { if (!closed) root.classList.add('frv--names'); });
    svgEl.setAttribute('aria-label', `${step().title}. The picture names: ${labs.map(l => NAMES[l.id][0]).concat(((cur && cur.tags) || []).map(t => t.text)).join(', ')}.`);
  }
  function hideNames() { root.classList.remove('frv--names'); }
  function layoutAll() { if (closed) return; draw(); placeTags(); if (!busy) placeNames(); }

  /* ---------------- the names' cards ---------------- */
  /* every button of a card that is on the page now: found (a tick in its ring), open */
  function markCards() {
    /* (data-codes: the codes of the name's card, for a visit from the IB map: js/ib/mark.js rings the name to press) */
    root.querySelectorAll('[data-card]').forEach(el => { const k = el.dataset.card, cs = (cardOf(k) || '').match(/\[sl [^\]]+\]/g); if (cs && !el.dataset.codes) el.dataset.codes = cs.map(c => c.slice(4, -1)).join(',');
      el.classList.toggle('is-found', isFound(k)); el.classList.toggle('is-on', k === focusId); el.setAttribute('aria-pressed', k === focusId ? 'true' : 'false'); });
  }
  function renderCards() {
    const C = step().cards || {}, ids = Object.keys(C);
    cardsEl.hidden = !ids.length; if (!ids.length) { cardsEl.innerHTML = ''; return; }
    const n = ids.filter(isFound).length, t = focusId && C[focusId];
    cardsEl.innerHTML = `<p class="frv__found"><b>${esc(UI.found)}: <span>${n}</span> of ${ids.length}</b>${t ? '' : ` ${esc(UI.press)}`}</p>`
      + (t ? `<div class="frv__card" data-open="${focusId}"><h3>${esc(NAMES[focusId][0])}</h3>${paras(t)}<button type="button" class="frv__cx" aria-label="${esc(UI.close)}">✕</button></div>` : '');
  }
  /* a name pressed: its part stays bright and the rest dims (by brightness, never hidden); its card opens. Pressed
     again, or ✕: all bright again */
  function setFocus(nid) {
    focusId = nid && cardOf(nid) ? nid : null;
    if (focusId) learn(VIEW, id() + '.' + focusId);
    const q = focusId ? `[data-p~="${focusId}"]` : '';
    dimEl.textContent = focusId ? `.frv__art>:not(${q}):not([data-deep]),.frv__art>[data-deep]>:not(${q}){opacity:.28}` : '';
    markCards(); renderCards(); if (id() === 'conc' || id() === 'why') redrawArt();
    if (focusId) { const c = cardsEl.querySelector('.frv__card'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'nearest' }); }
  }
  root.addEventListener('click', e => {
    const x = e.target.closest('.frv__cx'); if (x) { setFocus(null); return; }
    const b = e.target.closest('[data-card]'); if (!b || busy) return;
    setFocus(b.dataset.card === focusId ? null : b.dataset.card);
  });

  /* one motion: fn(p) for p from 0 to 1, a frame each, then after(); Reduce motion: the end at once. A new step (or
     closing) ends the motion where it would have ended (finish), so a state is never left half way */
  let pending = null;
  function motion(ms, fn, after) {
    return new Promise(res => {
      const end = cut => { if (!pending || pending.end !== end) return; pending = null; fn(1, cut === true); if (after) after(); res(); };
      pending = { end };
      if (FAST) { end(); return; }
      const t0 = performance.now();
      const tick = now => {
        if (closed || !pending || pending.end !== end) return;
        const p = Math.min(1, (now - t0) / ms);
        if (p >= 1) { end(); return; }
        fn(p); draw(); raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
  }
  function finish() { cancelAnimationFrame(raf); if (pending) pending.end(true); }
  /* (prep: work to do before the motion, in small pieces so that the page never stands still: step 2 with Reduce motion) */
  async function run(ms, fn, after, prep) {
    busy = true; setFocus(null); hideNames(); clearNames(); window.FRACTIONATION.at = { step: si, rest: false };
    renderCtl(); renderRes(); updateNext();
    const my = token;
    if (prep) { await prep(); if (closed) return; if (my !== token) { fn(1, true); return; } }
    await motion(ms, fn, after);
    if (closed || my !== token) return;
    busy = false;
    draw(); placeNames(); renderText(); renderCtl(); renderRes(); renderDone(); renderCards(); updateNext(); window.FRACTIONATION.at = { step: si, rest: true };
  }

  /* ---------------- the controls of each step ---------------- */
  const btn = (a, v, inner, o = {}) => `<button type="button" class="frv__ch${o.cls ? ' ' + o.cls : ''}" data-a="${a}" data-v="${v}"${o.dis || busy ? ' disabled' : ''}${o.pressed != null ? ` aria-pressed="${o.pressed}"` : ''}>${inner}</button>`;
  const two = (t, sub, m) => `${m ? `<span class="frv__mk frv__mk--${m === '✓' ? 'ok' : 'no'}" aria-hidden="true">${m}</span>` : ''}<b>${esc(t)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}`;
  const pair = (q, list, a, s, key, pk) => `<div class="frv__grp"><p class="frv__q">${esc(q)}</p><div class="frv__chs" role="group" aria-label="${esc(q)}">${list.map(v => btn(a, v, two(UI[v][0], UI[v][1], s[key] === v && s[pk] >= 1 ? (RESULT[v].ok ? '✓' : '✗') : ''), { pressed: s[key] === v ? 'true' : 'false' })).join('')}</div></div>`;
  function renderCtl() {
    const s = st(), focus = document.activeElement && ctlEl.contains(document.activeElement) ? document.activeElement.dataset.a + ':' + document.activeElement.dataset.v : '';
    let h = '';
    if (id() === 'conc') {
      h = `<div class="frv__chs" role="group" aria-label="The medium">${CONC.map(c => { const tried = s.p[c.v] >= 1; return btn('conc', c.v, two(UI[c.v][0], UI[c.v][1], tried ? (RESULT[c.v].ok ? '✓' : '✗') : ''), { pressed: s.last === c.v ? 'true' : 'false' }); }).join('')}</div>`;
    } else if (id() === 'cold') h = pair(UI.tempQ, ['warm', 'ice'], 'temp', s, 'temp', 'tp');
    else if (id() === 'ph') h = pair(UI.phQ, ['nobuf', 'buf'], 'ph', s, 'ph', 'pp');
    else if (id() === 'homog') {
      h = btn('homog', 'go', two(UI.homog, '', s.p >= 1 ? '✓' : ''), { dis: s.p != null, cls: 'frv__ch--go' });
    } else if (id() === 'spin') {
      const wrong = s.wrong != null && s.wrong >= 0;
      h = `<div class="frv__chs frv__chs--spin" role="group" aria-label="The spins">${SPINS.map(sp => { const k = FRACTIONS.findIndex(f => f.id === sp.id), used = k < s.n;
        return btn('spin', sp.id, two(`${sp.g} × g`, sp.time + (used ? ` · pellet ${k + 1}` : ''), used ? '✓' : ''), { dis: used || wrong }); }).join('')}</div>`
        + (wrong ? btn('again', 'go', two(UI.again, ''), { cls: 'frv__ch--go' }) : '');
    } else if (id() === 'deduve') {
      h = btn('measureA', 'go', two(UI.measureA, '', s.a >= 1 ? '✓' : ''), { dis: s.a != null, cls: 'frv__ch--go' })
        + `<div class="frv__grp"><p class="frv__q">${esc(UI.breakQ)}</p><div class="frv__chs" role="group" aria-label="${esc(UI.breakQ)}">${['breakWater', 'breakDet'].map(v => btn('break', v, two(UI[v], '', s.brk && s.brk.how === (v === 'breakWater' ? 'water' : 'det') && s.brk.p >= 1 ? '✓' : ''), { dis: !(s.a >= 1) || !!s.brk })).join('')}</div></div>`
        + btn('measureB', 'go', two(UI.measureB, '', s.b >= 1 ? '✓' : ''), { dis: !(s.brk && s.brk.p >= 1) || s.b != null, cls: 'frv__ch--go' });
    }
    ctlEl.innerHTML = h;
    if (focus) { const [a, v] = focus.split(':'), b = ctlEl.querySelector(`[data-a="${a}"][data-v="${v}"]`); if (b && !b.disabled) b.focus(); }
  }
  /* what the pupil's last choice did: one result at a time (text.js) */
  function result() {
    const s = st();
    if (busy) return null;
    if (id() === 'conc') return s.last && s.p[s.last] >= 1 ? s.last : null;
    if (id() === 'cold') return s.temp && s.tp >= 1 ? s.temp : null;
    if (id() === 'ph') return s.ph && s.pp >= 1 ? s.ph : null;
    if (id() === 'spin') return s.msg;
    if (id() === 'deduve') return s.last;
    return null;
  }
  function renderRes() {
    const r = result(), R = typeof r === 'string' ? RESULT[r] : r;
    resEl.innerHTML = R ? `<div class="frv__r frv__r--${R.ok ? 'ok' : 'no'}">${paras(R.t)}</div>` : '';
  }
  /* the step's own lines; the task's lines (ask) until the experiment is done, then what it showed (done) */
  function renderText() {
    const s = st(), gone = step().askUntil === 'choice' ? Object.values(s.p || {}).some(p => p >= 1) : goal() && !busy;
    textEl.innerHTML = paras(step().t + (!gone && step().ask ? '\n' + step().ask : ''));
  }
  /* (More detail: the step's folded lines, and those of what it showed once the experiment is done; it stays open
     or shut as the reader left it) */
  function renderDone() {
    const done = goal() && !busy, more = split(step().t).more + (done ? split(step().done).more : ''), was = foldEl.querySelector('details'), open = was && was.open;
    doneEl.innerHTML = done ? paras(step().done || '') : '';
    if (foldEl.dataset.h !== more) { foldEl.dataset.h = more; foldEl.innerHTML = more ? `<details class="frv__fold"${open ? ' open' : ''}><summary>More detail</summary>${more}</details>` : ''; }
  }
  function updateNext() {
    const ok = !busy && goal();
    nextB.disabled = !ok; nextB.classList.toggle('pulse', ok);
    backB.disabled = busy || si === 0;
    nextB.textContent = si < STEPS.length - 1 ? 'Next step →' : (inGame ? 'Back to the game →' : 'Start again →');
  }

  ctlEl.addEventListener('click', e => {
    const b = e.target.closest('.frv__ch'); if (!b || b.disabled || busy) return;
    const a = b.dataset.a, v = b.dataset.v, s = st();
    if (a === 'conc') {
      s.last = v; s.p[v] = 0; const R = s.run = { v, L: makeOsmosis(v) }; osmT = 0;
      /* a run left before its end (another step) is as if the tube had not been chosen: its liquid is never worked out
         to the end in one piece. Reduce motion: the whole run is worked out first, 12 ms at a time */
      const ahead = async () => { while (R.L.steps < OSM_STEPS && !closed && s.run === R) { const t0 = performance.now(); while (R.L.steps < OSM_STEPS && performance.now() - t0 < 12) R.L.step(Math.min(40, OSM_STEPS - R.L.steps)); await new Promise(r => setTimeout(r, 0)); } };
      run(OSM.END * 1000, (p, cut) => { if (cut && R.L.steps < OSM_STEPS) { if (s.run === R) { s.run = null; s.last = null; delete s.p[v]; } return; } s.p[v] = p; osmosisTo(R.L, p * OSM.END); }, null, FAST ? ahead : null);
    }
    else if (a === 'temp') { s.temp = v; s.tp = 0; s.sim = makeProteases(v); run(PROT.END * 1000, p => { s.tp = p; s.sim.to(p * PROT.END); }); }
    else if (a === 'ph') { s.ph = v; s.pp = 0; run(1800, p => { s.pp = p; }); }
    else if (a === 'homog') { s.p = 0; run(3200, p => { s.p = p; }); }
    else if (a === 'spin') {
      const k = FRACTIONS.findIndex(f => f.id === v), ok = k === s.n;
      s.msg = null; s.anim = { type: ok ? 'ok' : 'bad', k, p: 0 }; s.last = k;
      run(ok ? 2400 : 1700, p => { s.anim.p = p; }, () => {
        s.anim = null;
        if (ok) { s.n++; s.msg = FRACTIONS[k].id; }
        else {
          s.wrong = k;
          const kinds = ['nuc', 'mito', 'lyso', 'micro', 'ribo'].filter(q => KIND[q] >= s.n && KIND[q] <= k).map(q => PART_NAMES[q]);
          const list = kinds.length > 1 ? kinds.slice(0, -1).join(', ') + ' and ' + kinds[kinds.length - 1] : kinds[0];
          s.msg = { ok: false, t: RESULT.early.t.replace('{list}', list) };
        }
      });
    } else if (a === 'again') {
      s.msg = null; s.anim = { type: 'again', k: s.wrong, p: 0 };
      run(900, p => { s.anim.p = p; }, () => { s.anim = null; s.wrong = null; s.last = null; });
    } else if (a === 'measureA') { s.a = 0; s.last = null; s.simA = makeAssay('A'); run(ASSAY.END * 1000, p => { s.a = p; s.simA.to(p * ASSAY.END); }, () => { s.last = 'measureA'; }); }
    else if (a === 'break') { s.brk = { how: v === 'breakWater' ? 'water' : 'det', p: 0 }; s.last = null; run(1900, p => { s.brk.p = p; }, () => { s.last = v; }); }
    else if (a === 'measureB') { s.b = 0; s.last = null; s.simB = makeAssay('B'); run(ASSAY.END * 1000, p => { s.b = p; s.simB.to(p * ASSAY.END); }, () => { s.last = 'measureB'; }); }
  });

  /* ---------------- the steps ---------------- */
  function show(s) {
    token++; finish();      /* a motion cut short ends where it would have ended */
    busy = false; si = Math.max(0, Math.min(STEPS.length - 1, s)); focusId = null; dimEl.textContent = '';
    countEl.textContent = `Step ${si + 1} of ${STEPS.length}`; titleEl.textContent = step().title;
    if (stepsEl.children.length !== STEPS.length) stepsEl.innerHTML = STEPS.map((_, k) => `<button type="button" data-s="${k}" aria-label="Step ${k + 1}: ${esc(STEPS[k].title)}">${k + 1}</button>`).join('');
    Array.from(stepsEl.children).forEach((b, k) => { if (k === si) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    const lg = ART[id()].legend; legendEl.innerHTML = typeof lg === 'function' ? lg(stageEl.getBoundingClientRect().width < 560) : lg;
    hideNames(); tagsEl.dataset.sig = ''; tagsEl.innerHTML = ''; foldEl.dataset.h = ''; foldEl.innerHTML = '';
    renderText(); renderCtl(); renderRes(); renderDone(); renderCards(); updateNext();
    panelEl.scrollTop = 0;
    if (!FAST) { svgEl.classList.add('is-new'); requestAnimationFrame(() => requestAnimationFrame(() => svgEl.classList.remove('is-new'))); }
    draw(); placeNames();
    /* (the strip of a count has changed the stage's height: once more, at its true size) */
    requestAnimationFrame(() => { if (!closed && !busy) layoutAll(); });
    if (!inGame) history.replaceState(null, '', '#s' + (si + 1));
    window.FRACTIONATION.at = { step: si, rest: true };
  }
  nextB.addEventListener('click', () => {
    if (nextB.disabled) return;
    if (si < STEPS.length - 1) show(si + 1);
    else if (inGame) close();
    else { S = fresh(); show(0); }
  });
  backB.addEventListener('click', () => { if (!backB.disabled && si > 0) show(si - 1); });
  stepsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || +b.dataset.s === si) return; show(+b.dataset.s); });

  /* (the drawings' bitmaps have come: draw the picture from them) */
  const onArt = () => { if (!closed && !busy) layoutAll(); };
  artReady.add(onArt);
  const onKey = e => {
    if (e.key === 'Escape') { if (focusId) setFocus(null); else if (inGame) close(); return; }
    if (e.target.closest && e.target.closest('input, textarea, button, a, summary')) return;
    if (e.key === 'ArrowRight' && !nextB.disabled) nextB.click();
    if (e.key === 'ArrowLeft' && !backB.disabled) backB.click();
  };
  document.addEventListener('keydown', onKey);
  let rz = 0;
  const onResize = () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { if (!busy) layoutAll(); }); };
  window.addEventListener('resize', onResize);
  const ro = window.ResizeObserver ? new ResizeObserver(onResize) : null; if (ro) ro.observe(stageEl);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { widths.clear(); tagsEl.dataset.sig = ''; if (!closed && !busy) layoutAll(); });
  /* (the colours of the canvas follow the theme) */
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null, onTheme = () => { colours = null; if (!closed && !busy) drawOsm(); };
  if (mq && mq.addEventListener) mq.addEventListener('change', onTheme);

  function close() { unmark();
    if (closed) return; token++; finish(); closed = true; artReady.delete(onArt); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); if (ro) ro.disconnect();
    if (mq && mq.removeEventListener) mq.removeEventListener('change', onTheme);
    root.remove();
    document.documentElement.classList.remove('fractionationv-open');
    if (window.FRACTIONATION && window.FRACTIONATION.root === root) window.FRACTIONATION = null;
    if (onClose) onClose();
  }
  if (inGame) $('.frv__close').addEventListener('click', close);

  /* ---------------- for the check tool ---------------- */
  const wordsIn = el => { const c = el.cloneNode(true); c.querySelectorAll('.lv, details').forEach(x => x.remove()); return c.textContent.split(/\s+/).filter(Boolean).length; };
  window.FRACTIONATION = {
    root, FAST, steps: STEPS.length, ids: STEPS.map(s => s.id), at: { step: 0, rest: false },
    goto: s => show(s), close, goal: () => goal(), busy: () => busy,
    /* the names as placed now (stage pixels), and every word drawn in the picture */
    names: () => placed.map(p => Object.assign({}, p, { box: Object.assign({}, p.box) })),
    words: () => { const s0 = stageEl.getBoundingClientRect(); return Array.from(svgEl.querySelectorAll('text')).map(t => { const b = t.getBoundingClientRect(); return { s: t.textContent, box: { l: b.left - s0.left, t: b.top - s0.top, r: b.right - s0.left, b: b.bottom - s0.top } }; }); },
    size: () => G && { W: G.W, H: G.H, narrow: G.narrow, k: G.k },
    /* the words on show in the sheet now (the step's lines, the last result, what the experiment showed; not the tags,
       not what is folded, not an open card) */
    shown: () => wordsIn(textEl) + wordsIn(resEl) + wordsIn(doneEl),
    /* the names with a card that can be pressed now, and the card that is open */
    cards: () => { const seen = new Set(); return Array.from(root.querySelectorAll('[data-card]')).filter(el => !seen.has(el.dataset.card) && seen.add(el.dataset.card)).map(el => ({ id: el.dataset.card, found: el.classList.contains('is-found'), on: el.classList.contains('is-on') })); },
    all: () => Object.keys(step().cards || {}),
    card: () => focusId,
    press: nid => { const b = root.querySelector(`[data-card="${nid}"]`); if (!b) return false; b.click(); return true; },
    /* the runs as they stand: the liquid of step 2, the proteases of step 3, the two samples of step 7 */
    sim: () => { const s = st();
      if (id() === 'conc' && s.run) { const c = counts(s.run.L); return { v: s.run.v, steps: s.run.L.steps, in: c.in, out: c.out, liquid: s.run.L.state(), h: [s.run.L.h[0], s.run.L.h[1]] }; }
      if (id() === 'cold' && s.sim) return { temp: s.sim.temp, t: s.sim.t, eaten: s.sim.eaten, hits: s.sim.hits };
      if (id() === 'deduve') return { A: s.simA ? { t: s.simA.t, made: s.simA.made } : null, B: s.simB ? { t: s.simB.t, made: s.simB.made } : null };
      return null; }
  };

  let first = start || 0;      /* (a door of the IB map opens the step that teaches its statement) */
  const h = /^#s(\d+)$/.exec(location.hash || ''); if (!inGame && h) first = +h[1] - 1;
  show(first);
  return { close, root };
}
