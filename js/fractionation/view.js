/* ============================================================
   view.js — the cell fractionation lab (16 Nov 2026): an IB view of the Y7 cell game, for IB Biology B2.2.1 and its
   Nature of Science ("study of the function of individual organelles became possible when ultracentrifuges had been
   invented and methods of using them for cell fractionation had been developed"), with the links Daniel asked for:
   the medium isotonic (D2.3), ice-cold (C1.1) and buffered (B1.2.5).
   Daniel's proposal (B2.2 build, research/game_proposal.md, 15 Nov 2026): "blend a liver sample in a solution the pupil
   chooses (warm or ice-cold; buffered or not; pure water, isotonic or concentrated: the wrong choice bursts or shrinks
   the organelles), then spin at chosen speeds and times and collect pellets; then de Duve's test: enzyme activity
   before and after the lysosome membranes are broken. A game mechanic that is also the science."
   So: six steps. Each choice is shown as its true result, said in one or two lines, and the pupil may try again (never
   a dead end); Next opens when the step's experiment is done and its motion has ended (memory
   animations-wait-for-the-reader). The spins are the four real ones (text.js SPINS); a spin chosen too soon pellets
   everything larger together, as it would. De Duve's latency is drawn as low and high only: no number of his is
   drawn (none was read in a source).
   The picture is 2D SVG, drawn again for each frame of a motion from the step's state: the art in its own units,
   scaled to the stage; its words at true pixel sizes. Names stand on lines from the margins (a laptop) or on numbered
   pins with a key under the picture (a phone), placed only while the picture is still.
   Opened over the game (openFractionation({ inGame: true, onClose })) or at its own address (fractionation/).
   Reduce motion (the computer's setting, or ?still=1 for the tests): every motion jumps to its end, nothing is left out.
   For tools/fractionation-check.mjs: window.FRACTIONATION.
   ============================================================ */
import { STEPS, RESULT, NAMES, UI, LEVELS, SIMPLE, SOURCES, SPINS, FRACTIONS, PART_NAMES, TITLE, EYEBROW } from './text.js?v=202611162123';
import { fit } from '../game/iblevel.js?v=202611162123';   /* (the words on show a step: about 49, the rest under More detail) */

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const params = new URLSearchParams(location.search);
const FAST = params.has('still') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const ease = k => k * k * (3 - 2 * k);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (p, a, b) => clamp01((p - a) / (b - a));      /* the part of a motion between a and b (0 to 1) */
const r1 = n => Math.round(n * 10) / 10;
const D = Math.PI / 180;

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
const SH = {
  /* a mitochondrion: its outer membrane and its folded inner membrane (cristae) */
  mito(x, y, w, h, rot = 0, o = {}) {
    const s = o.s || 1, wav = o.wav || 0, b = o.b || 0, n = 6, pts = [];
    for (let i = 0; i <= n; i++) pts.push(`${r1(-w * 0.36 + w * 0.72 * i / n)},${r1((i % 2 ? 1 : -1) * h * 0.24)}`);
    return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${rot}) scale(${r1(s * 100) / 100})"${o.op != null ? ` opacity="${r1(o.op * 100) / 100}"` : ''}>`
      + `<path d="${blob(0, 0, w / 2, h / 2, 0, wav)}" class="fr-mito"${broken(b)}${b ? ` fill-opacity="${r1((1 - 0.65 * b) * 100) / 100}"` : ''}/>`
      + `<polyline points="${pts.join(' ')}" class="fr-mito-in"${b ? ` opacity="${r1((1 - b) * 100) / 100}"` : ''}/></g>`;
  },
  /* a lysosome: a membrane round a few digestive enzymes (spread: the enzymes leave a broken one) */
  lyso(x, y, r, o = {}) {
    const s = o.s || 1, wav = o.wav || 0, b = o.b || 0, sp = o.spread || 0, E = o.enz || [[-0.38, -0.2], [0.32, -0.3], [0.02, 0.38]];
    const enz = E.map(([ex, ey], i) => { const k = 1 + sp * (2.6 + i * 0.9); return SH.enz(ex * r * k, ey * r * k, Math.max(2.6, r * 0.2), i * 40); }).join('');
    return `<g transform="translate(${r1(x)} ${r1(y)})"><g transform="scale(${r1(s * 100) / 100})"><path d="${blob(0, 0, r, r, 0, wav)}" class="fr-lyso"${broken(b)}${b ? ` fill-opacity="${r1((1 - 0.8 * b) * 100) / 100}"` : ''}/></g>${enz}</g>`;
  },
  /* one enzyme molecule (a small triangle) */
  enz: (x, y, r, rot = 0) => `<path d="M${r1(x)},${r1(y - r)} L${r1(x + r * 0.87)},${r1(y + r * 0.5)} L${r1(x - r * 0.87)},${r1(y + r * 0.5)}Z" class="fr-enz" transform="rotate(${rot} ${r1(x)} ${r1(y)})"/>`,
  nuc: (x, y, r) => `<g transform="translate(${r1(x)} ${r1(y)})"><circle r="${r}" class="fr-nuc"/><circle cx="${r1(r * 0.18)}" cy="${r1(-r * 0.12)}" r="${r1(r * 0.3)}" class="fr-nucleolus"/></g>`,
  /* a microsome: a small closed vesicle of ER membrane, ribosomes on it */
  micro: (x, y, r) => `<g transform="translate(${r1(x)} ${r1(y)})"><circle r="${r}" class="fr-micro"/>${[0, 120, 240].map(a => `<circle cx="${r1(r * 1.05 * Math.cos(a * D))}" cy="${r1(r * 1.05 * Math.sin(a * D))}" r="${r1(Math.max(1.2, r * 0.28))}" class="fr-ribo"/>`).join('')}</g>`,
  ribo: (x, y, r) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" class="fr-ribo"/>`,
  /* a test tube (open at the top) and the liquid in it from yL down */
  tube: (x0, y0, w, h, yL, liq = 'fr-liq') => {
    const R = w / 2, yb = y0 + h - R, i = 3;
    return `<path d="M${x0 + i},${yL} V${yb} A${R - i} ${R - i} 0 0 0 ${x0 + w - i},${yb} V${yL} Z" class="${liq}"/>`
      + `<path d="M${x0},${y0} V${yb} A${R} ${R} 0 0 0 ${x0 + w},${yb} V${y0}" class="fr-glass"/>`
      + `<path d="M${x0 - 5},${y0} H${x0 + w + 5}" class="fr-glass"/>`;
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

/* 1. a liver cell and its parts */
ART.why = {
  dw: 540, dh: 400,
  cols: { L: ['mito', 'lyso', 'nucleus'], R: ['rer', 'cyto', 'ribo', 'pm'] },
  legend: 'Not to scale. The cytoskeleton is not drawn.',
  draw(st, g) {
    let s = '<path d="M70 90 L300 30 L470 110 L470 300 L260 375 L60 300 Z" class="fr-cell"/>';
    for (const R of [75, 90, 105]) {
      const p = a => [200 + R * Math.cos(a * D), 200 + R * Math.sin(a * D)], [x0, y0] = p(-55), [x1, y1] = p(55);
      s += `<path d="M${r1(x0)},${r1(y0)} A${R} ${R} 0 0 1 ${r1(x1)},${r1(y1)}" class="fr-er-sac"/>`;
      for (let a = -50; a <= 50; a += 10) { const q = [200 + (R + 5.5) * Math.cos(a * D), 200 + (R + 5.5) * Math.sin(a * D)]; s += SH.ribo(q[0], q[1], 2.3); }
    }
    s += SH.nuc(200, 200, 55);
    s += SH.mito(130, 112, 56, 24, -20) + SH.mito(360, 92, 56, 24, 20) + SH.mito(330, 300, 56, 24, -30) + SH.mito(130, 300, 56, 24, 8);
    s += SH.lyso(95, 210, 11) + SH.lyso(275, 335, 12) + SH.lyso(365, 215, 11);
    const c1 = scatter(11, [398, 236, 440, 264], 9, 7), c2 = scatter(7, [172, 80, 212, 100], 9, 3);
    c1.concat(c2).forEach(([x, y]) => { s += SH.ribo(x, y, 2.6); });
    const rb = c1.reduce((m, p) => (p[0] > m[0] ? p : m), c1[0]);
    return { svg: s, labels: [
      { id: 'mito', side: 'L', at: [106, 121] }, { id: 'lyso', side: 'L', at: [86, 211], pin: [-6, -22] }, { id: 'nucleus', side: 'L', at: [162, 238] },
      { id: 'rer', side: 'R', at: [299, 164] }, { id: 'cyto', side: 'R', at: [440, 205] }, { id: 'ribo', side: 'R', at: rb, pin: [6, 22] }, { id: 'pm', side: 'R', at: [420, 318] }
    ] };
  }
};

/* 2. three media: pure water, isotonic, concentrated; each with its organelles and its particles in equal volumes */
const CONC = [{ v: 'water', n: 0 }, { v: 'iso', n: 9 }, { v: 'conc', n: 22 }];
ART.conc = {
  dw: 600, dh: 486,
  cols: { L: ['m2lyso', 'm2mito'], R: [] },
  legend: `${ICON.dot} ${esc(UI.solute)} · ${ICON.water} ${esc(UI.waterMove)} · ${esc(UI.pair)} · ${esc(UI.notScale)}`,
  draw(st, g) {
    let s = '';
    CONC.forEach((c, i) => {
      const cx = 100 + 200 * i, p = st.p[c.v], has = p != null, e = has ? ease(p) : 0;
      s += SH.tube(cx - 26, 20, 52, 160, 62, c.v === 'conc' ? 'fr-liq fr-liq--conc' : c.v === 'water' ? 'fr-liq fr-liq--water' : 'fr-liq');
      s += TX(g, cx, 202, UI[c.v][0].replace(' solution', ''), 17, 'fr-tb');
      if (UI[c.v][1]) s += TX(g, cx, 202 + g.lh(16), UI[c.v][1], 16, 'fr-t2');
      s += `<rect x="${cx - 92}" y="238" width="184" height="114" rx="12" class="fr-win"/>`;
      /* the organelles: swell then burst (water), unchanged (isotonic), shrink and wrinkle (concentrated) */
      let ms = 1, wav = 0, b = 0;
      if (has && c.v === 'water') { ms = 1 + 0.3 * ease(seg(p, 0, 0.65)); b = seg(p, 0.65, 1); }
      if (has && c.v === 'conc') { ms = 1 - 0.24 * e; wav = 0.07 * e; }
      s += SH.lyso(cx - 50, 268, 15, { s: ms, wav, b, spread: b });
      s += SH.mito(cx + 18, 312, 92, 38, 0, { s: ms, wav, b });
      if (has) {
        /* the net movement of water: in (pure water), out (concentrated), in and out at the same rate (isotonic) */
        const A = SH.arrow, wOp = Math.min(1, 3 * p);
        const pairs = [[[cx + 88, 312], [cx + 72, 312]], [[cx + 18, 350], [cx + 18, 337]], [[cx - 50, 242], [cx - 50, 251]], [[cx - 88, 268], [cx - 72, 268]]];
        pairs.forEach(([o, n]) => {
          const vx = n[0] - o[0], vy = n[1] - o[1], L = Math.hypot(vx, vy), qx = -vy / L * 3.5, qy = vx / L * 3.5;
          if (c.v === 'water') s += A(o[0], o[1], n[0], n[1], 'fr-water', wOp);
          else if (c.v === 'conc') s += A(n[0], n[1], o[0], o[1], 'fr-water', wOp);
          else s += A(o[0] + qx, o[1] + qy, n[0] + qx, n[1] + qy, 'fr-water', wOp) + A(n[0] - qx, n[1] - qy, o[0] - qx, o[1] - qy, 'fr-water', wOp);
        });
        if (p >= 1) s += TX(g, cx, 372, mark(RESULT[c.v].ok) + UI[c.v === 'water' ? 'burst' : c.v === 'iso' ? 'same' : 'shrunk'], 16, RESULT[c.v].ok ? 'fr-good fr-tb' : 'fr-bad fr-tb');
      }
      /* the solute concentration: particles in two squares of the same volume, the medium's and the organelle's */
      /* (a tray round each pair: the two squares of one tube belong together) */
      s += `<rect x="${cx - 95}" y="380" width="190" height="${g.F(g.sz(16)) * 0.6 * 9 < 104 ? 104 : 76}" rx="10" class="fr-tray"/>`;
      s += `<rect x="${cx - 86}" y="388" width="60" height="60" class="fr-sq"/><rect x="${cx + 26}" y="388" width="60" height="60" class="fr-sq"/>`;
      scatter(c.n, [cx - 81, 393, cx - 31, 443], 8, 11 + i).forEach(([x, y]) => { s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="3" class="fr-solute"/>`; });
      scatter(9, [cx + 31, 393, cx + 81, 443], 9, 5).forEach(([x, y]) => { s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="3" class="fr-solute"/>`; });
      /* each square's word, where the two fit side by side (else the line under the picture says which is which) */
      if (g.F(g.sz(16)) * 0.6 * 9 < 104) s += TX(g, cx - 56, 468, UI.medium, 16, 'fr-t2') + TX(g, cx + 56, 468, UI.inside, 16, 'fr-t2');
    });
    return { svg: s, labels: [{ id: 'm2lyso', side: 'L', at: [40, 268], pin: [-2, -24] }, { id: 'm2mito', side: 'L', at: [80, 318], pin: [-24, 10] }] };
  }
};

/* 3. temperature (proteases at a mitochondrion) and pH (a protein's folded chain) */
const PROT0 = [[52, 252], [240, 256], [56, 392], [236, 388]], PROT1 = [[98, 300], [196, 300], [102, 338], [190, 338]];
function chain(e) {
  const N = 64, pts = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1) * Math.PI * 2 * 0.93;
    const fx = 455 + 70 * Math.sin(3 * t + 0.4), fy = 266 + 64 * Math.sin(2 * t);
    const ux = 345 + 222 * i / (N - 1), uy = 300 + 16 * Math.sin(i * 0.7);
    pts.push([lerp(fx, ux, e), lerp(fy, uy, e)]);
  }
  return pts;
}
ART.cold = {
  dw: 600, dh: 430,
  cols: { L: ['protease', 'm3mito'], R: ['protein'] },
  legend: esc(UI.notScale) + '.',
  draw(st, g) {
    let s = TX(g, 145, 20, UI.tempQ, 17, 'fr-tb') + TX(g, 455, 20, UI.phQ, 17, 'fr-tb');
    /* the temperature: the bath, the tube, the thermometer */
    const tp = st.tp != null ? ease(st.tp) : 0, T = st.temp;
    s += `<rect x="30" y="34" width="230" height="150" rx="14" class="fr-bath${T === 'warm' ? ' fr-bath--warm' : T === 'ice' ? ' fr-bath--ice' : ''}"/>`;
    if (T === 'ice') [[52, 66, 12], [86, 150, -10], [196, 60, 18], [232, 140, -14], [60, 112, 6], [190, 160, 30]].forEach(([x, y, a]) => { s += `<rect x="${x - 9}" y="${y - 9}" width="18" height="18" rx="3" class="fr-ice" transform="rotate(${a} ${x} ${y})"/>`; });
    s += SH.tube(118, 26, 44, 150, 60);
    const lvl = T === 'warm' ? lerp(0.5, 0.88, tp) : T === 'ice' ? lerp(0.5, 0.12, tp) : 0.5, y0 = 52, y1 = 158;
    s += `<rect x="213" y="${y0}" width="10" height="${y1 - y0}" rx="5" class="fr-thermo"/><circle cx="218" cy="166" r="10" class="fr-thermo-b"/><rect x="215.5" y="${r1(y1 - (y1 - y0) * lvl)}" width="5" height="${r1((y1 - y0) * lvl + 4)}" class="fr-thermo-f"/>`;
    if (T) s += TX(g, 145, 208, T === 'warm' ? UI.warm[1] : UI.ice[1], 17, 'fr-tb');
    s += '<rect x="14" y="222" width="262" height="196" rx="12" class="fr-win"/>';
    const bite = T === 'warm' ? seg(st.tp, 0.45, 1) : 0, move = T === 'warm' ? ease(seg(st.tp, 0, 0.5)) : T === 'ice' ? 0.12 * tp : 0;
    s += SH.mito(145, 318, 132, 58, 0, { b: bite });
    if (bite) for (let i = 0; i < 6; i++) { const a = (i * 61 + 20) * D, x = 145 + 84 * Math.cos(a), y = 318 + 40 * Math.sin(a); s += `<path d="M${r1(x - 4)},${r1(y)} l8,${i % 2 ? 3 : -3}" class="fr-bit" opacity="${r1(bite * 100) / 100}"/>`; }
    const pz = PROT0.map((p, i) => [lerp(p[0], PROT1[i][0], move), lerp(p[1], PROT1[i][1], move)]);
    pz.forEach(([x, y]) => { const a = Math.atan2(318 - y, 145 - x) / D;
      s += `<path d="M0,0 L${r1(11 * Math.cos(28 * D))},${r1(-11 * Math.sin(28 * D))} A11 11 0 1 0 ${r1(11 * Math.cos(28 * D))},${r1(11 * Math.sin(28 * D))} Z" class="fr-prot" transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(a)})"/>`; });
    if (T && st.tp >= 1) s += TX(g, 145, 406, mark(T === 'ice') + (T === 'ice' ? UI.whole : UI.digested), 16, T === 'ice' ? 'fr-good fr-tb' : 'fr-bad fr-tb');
    /* the pH: a scale with the medium's pH on it; a protein that keeps its shape or unfolds (denatured) */
    const pp = st.pp != null ? ease(st.pp) : 0, P = st.ph;
    s += '<rect x="330" y="40" width="80" height="20" class="fr-ph-a"/><rect x="410" y="40" width="90" height="20" class="fr-ph-n"/><rect x="500" y="40" width="80" height="20" class="fr-ph-b"/><rect x="330" y="40" width="250" height="20" class="fr-ph-line"/>';
    const yA = 60 + g.lh(16) * 0.85, yP = yA + g.lh(16);
    s += TX(g, 330, yA, UI.acid, 16, 'fr-t2', 'start') + TX(g, 580, yA, UI.alk, 16, 'fr-t2', 'end');
    const mx = P === 'nobuf' ? lerp(458, 372, pp) : 458;
    s += `<path d="M${r1(mx - 8)},28 L${r1(mx + 8)},28 L${r1(mx)},39 Z" class="fr-marker"/>`;
    s += TX(g, 455, yP, UI.phOf + (P && st.pp >= 1 ? ': ' + (P === 'buf' ? UI.steady : UI.changes) : ''), 16, 'fr-t2');
    s += '<rect x="324" y="122" width="262" height="296" rx="12" class="fr-win"/>';
    const ch = chain(P === 'nobuf' ? pp : 0);
    s += `<polyline points="${ch.map(p => `${r1(p[0])},${r1(p[1])}`).join(' ')}" class="fr-chain"/>`;
    if (P && st.pp >= 1) s += TX(g, 455, 406, mark(P === 'buf') + (P === 'buf' ? UI.shape : UI.denat), 16, P === 'buf' ? 'fr-good fr-tb' : 'fr-bad fr-tb');
    const right = ch.reduce((m, p) => (p[0] > m[0] ? p : m), ch[0]);
    return { svg: s, labels: [
      { id: 'protease', side: 'L', at: pz[0], pin: [0, -22] }, { id: 'm3mito', side: 'L', at: [84, 318], pin: [10, 30] },
      { id: 'protein', side: 'R', at: right, pin: [-6, -24] }
    ] };
  }
};

/* 4. the homogenizer in ice, and what happens inside the tube, magnified */
const CELLS = [[405, 175, 0], [528, 205, 1], [448, 318, 2]];
/* the parts of the three cells: kind, where it is in its cell (dx, dy), its cell, where it ends up free, its size */
const FREE = [
  ['nuc', -8, 0, 0, 530, 165, 26], ['nuc', 6, 2, 1, 392, 240, 22], ['nuc', 0, -4, 2, 470, 360, 20],
  ['mito', 28, -28, 0, 560, 232, 1], ['mito', -30, 30, 1, 385, 300, 1], ['mito', 26, 30, 2, 445, 205, 1], ['mito', -34, -30, 2, 350, 180, 1],
  ['lyso', 30, 26, 0, 540, 310, 10], ['lyso', -26, -26, 1, 410, 150, 9], ['lyso', 34, -20, 2, 505, 270, 9],
  ['micro', -30, -20, 0, 515, 356, 7], ['micro', 30, -2, 1, 455, 262, 6], ['micro', -36, 6, 2, 345, 250, 6], ['micro', 10, 36, 0, 500, 200, 6], ['micro', -12, 38, 1, 420, 345, 6]
];
const RIBO_FREE = scatter(12, [340, 150, 520, 380], 14, 21, [{ x: 530, y: 165, r: 40 }, { x: 470, y: 360, r: 30 }, { x: 392, y: 240, r: 32 }]);
const RIBO_CLUSTER = scatter(5, [566, 260, 590, 278], 7, 9);
ART.homog = {
  dw: 620, dh: 452,
  cols: { L: ['pestle', 'tube', 'ice'], R: ['livercell', 'h4pm', 'h4nuc', 'h4mito', 'h4ribo', 'h4lyso', 'h4micro'] },
  legend: esc(UI.notScale) + '.',
  draw(st, g) {
    const p = st.p || 0;
    let s = '<path d="M30,150 V400 Q30,420 50,420 H230 Q250,420 250,400 V150" class="fr-icebath"/><path d="M30,150 V400 Q30,420 50,420 H230 Q250,420 250,400 V150" class="fr-glass"/>';
    [[50, 196, 12], [222, 206, -14], [52, 300, 8], [226, 318, 20], [60, 386, -10], [214, 392, 14]].forEach(([x, y, a]) => { s += `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="3" class="fr-ice" transform="rotate(${a} ${x} ${y})"/>`; });
    s += SH.tube(100, 30, 80, 380, 112);
    const cloud = seg(p, 0.1, 0.9);
    if (cloud) s += `<path d="M103,112 V370 A37 37 0 0 0 177,370 V112 Z" class="fr-homog" opacity="${r1(cloud * 70) / 100}"/>`;
    [[124, 380, 13], [152, 388, 11], [140, 360, 12], [165, 368, 9]].forEach(([x, y, r]) => { const k = 1 - seg(p, 0.05, 0.8); if (k > 0.02) s += `<ellipse cx="${x}" cy="${y}" rx="${r1(r * k)}" ry="${r1(r * 0.75 * k)}" class="fr-liver"/>`; });
    const hy = 128 + 240 * (1 - Math.cos(6 * Math.PI * p)) / 2;
    s += `<rect x="133" y="0" width="14" height="${r1(hy)}" class="fr-pestle"/><ellipse cx="140" cy="${r1(hy)}" rx="34" ry="11" class="fr-pestle"/>`;
    for (let i = 0; i < 4; i++) { const yy = 20 + ((i * 26 + p * 400) % 104); if (yy < hy - 8) s += `<path d="M134,${r1(yy)} l12,-6" class="fr-pestle-line"/>`; }
    s += '<path d="M118,14 A24 8 0 1 0 162,14" class="fr-turn"/><path d="M158,8 L163,14 L156,17" class="fr-turn"/>';
    s += TX(g, 22, 446, UI.mediumIs, 15, 'fr-t2', 'start');
    /* magnified: three liver cells, whose membranes tear; their parts end up free in the medium */
    s += '<defs><clipPath id="frvMag"><circle cx="465" cy="240" r="146"/></clipPath></defs><circle cx="465" cy="240" r="148" class="fr-win"/>';
    s += TX(g, 465, 76, 'Inside the tube, magnified', 16, 'fr-t2');
    let m = '<g clip-path="url(#frvMag)">';
    const open = seg(p, 0.2, 0.6), go = ease(seg(p, 0.3, 1));
    CELLS.forEach(([x, y]) => { if (open < 1) m += `<path d="${blob(x, y, 66, 60, 10, 0.02)}" class="fr-cell2"${broken(open)} opacity="${r1((1 - open) * 100) / 100}"/>`; });
    const pieces = seg(p, 0.45, 0.85);
    if (pieces) [[450, 120, 22, 200, 340], [372, 140, 18, 220, 330], [465, 300, 16, 20, 160]].forEach(([x, y, R, a0, a1]) => {
      const P0 = [x + R * Math.cos(a0 * D), y + R * Math.sin(a0 * D)], P1 = [x + R * Math.cos(a1 * D), y + R * Math.sin(a1 * D)];
      m += `<path d="M${r1(P0[0])},${r1(P0[1])} A${R} ${R} 0 0 1 ${r1(P1[0])},${r1(P1[1])}" class="fr-pm-piece" opacity="${r1(pieces * 100) / 100}"/>`; });
    FREE.forEach(([k, dx, dy, c, ex, ey, z]) => {
      const x = lerp(CELLS[c][0] + dx, ex, go), y = lerp(CELLS[c][1] + dy, ey, go), sc = lerp(0.62, 1, go);
      if (k === 'nuc') m += SH.nuc(x, y, r1(z * lerp(0.75, 1, go)));
      else if (k === 'mito') m += SH.mito(x, y, 40 * sc, 17 * sc, (dx * 7) % 50);
      else if (k === 'lyso') m += SH.lyso(x, y, r1(z * sc));
      else m += SH.micro(x, y, r1(z * sc));
    });
    RIBO_FREE.concat(RIBO_CLUSTER).forEach(([x, y], i) => { const c = CELLS[i % 3]; m += SH.ribo(lerp(c[0] + (i * 13 % 50) - 25, x, go), lerp(c[1] + (i * 17 % 50) - 25, y, go), 2.4); });
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

/* 5. the centrifuge, the tube now, and the pellets collected */
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
  legend: esc(UI.notScale) + '. Each spin is ' + esc(UI.fast) + '.',
  draw(st, g) {
    const A = st.anim, n = st.n;
    let s = '';
    /* the rotor, seen from above */
    const spinP = A && A.type !== 'again' ? ease(seg(A.p, 0, A.type === 'ok' ? 0.6 : 1)) : 0, ang = spinP * 1440;
    s += `<g transform="rotate(${r1(ang)} 95 100)"><circle cx="95" cy="100" r="80" class="fr-rotor"/>${[45, 135, 225, 315].map(a => `<circle cx="${r1(95 + 50 * Math.cos(a * D))}" cy="${r1(100 + 50 * Math.sin(a * D))}" r="13" class="fr-slot"/>`).join('')}<circle cx="95" cy="100" r="13" class="fr-hub"/></g>`;
    const shown = A && A.type !== 'again' ? A.k : st.last;
    if (shown != null) {
      const sp = SPINS.find(x => x.id === FRACTIONS[shown].id);
      /* (each on two lines, so that the words stay beside the tube at any scale) */
      const fast = A && A.type !== 'again';
      s += TL(g, 95, 206, [{ t: `${sp.g} × g`, cls: 'fr-tb' }, { t: sp.time, cls: 'fr-tb' }].concat(fast ? [{ t: 'shown in about', cls: 'fr-t2' }, { t: '2 seconds', cls: 'fr-t2' }] : []), 16, '', 'middle', 1.2);
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
    s += SH.tube(230, 40, 80, 400, 80);
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
    s += sus;
    /* the pellet of a right spin leaves for its own tube in the rack (the supernatant stays: it is poured into a new tube) */
    if (pel) {
      if (pour) { const row = 46 + n * 82, sx = lerp(1, 0.3, pour), tx = lerp(0, 422 - 270 * sx, pour), ty = lerp(0, row + 62 - 440 * sx, pour);
        s += `<g transform="translate(${r1(tx)} ${r1(ty)}) scale(${r1(sx * 100) / 100})" opacity="${r1((1 - pour * 0.9) * 100) / 100}">${pel}</g>`; }
      else s += pel;
    }
    /* the pellets collected */
    s += TX(g, 404, 24, 'The pellets', 17, 'fr-tb', 'start');
    for (let i = 0; i < 5; i++) {
      const row = 46 + i * 82, got = i < n, last = i === 4, done = last && n === 4;
      s += SH.tube(408, row, 24, 62, row + 16, got || done ? 'fr-liq' : 'fr-liq fr-liq--none');
      if (got) s += `<path d="M411,${row + 50} Q420,${row + 42} 429,${row + 50} V${row + 52} A9 9 0 0 1 411,${row + 52} Z" class="fr-pellet fr-pellet--${i}"/>`;
      const name = last ? (done ? (g.narrow ? ['Liquid left'] : ['Liquid left:', 'dissolved molecules']) : []) : got ? (i === 1 ? [`${i + 1}. mitochondria,`, 'lysosomes'] : [`${i + 1}. ${FRACTIONS[i].name}`]) : [`${i + 1}.`];
      const sp = !last && got ? SPINS.find(x => x.id === FRACTIONS[i].id) : null;
      const lines = name.map((t, j) => ({ t, cls: got || done ? (j ? 'fr-t1' : 'fr-tb') : 'fr-t2' }));
      if (sp && !g.narrow) lines.push({ t: `${sp.g} × g, ${sp.time}`, cls: 'fr-t2' });
      if (lines.length) s += TL(g, 442, row + 20, lines, 16, '', 'start', 1.2);
    }
    const L = [{ id: 'rotor', side: 'L', at: [16, 100], pin: [14, -26] }];
    if (st.wrong != null && st.wrong >= 0 && !A) L.push({ id: 'mixed', side: 'L', at: [236, 428], pin: [-22, 0] });
    else if (n === 0 && !A) L.push({ id: 'homog', side: 'L', at: [234, 330], pin: [-22, 0] });
    else if (!A) L.push({ id: 'super', side: 'L', at: [234, 330], pin: [-22, 0] });
    return { svg: s, labels: L };
  }
};

/* 6. de Duve's test: two samples of pellet 2, A with its membranes whole, B with its membranes broken */
const LYS = [[62, 330, 22], [150, 290, 22], [215, 238, 19]];
const SUBS = scatter(14, [34, 200, 266, 404], 22, 41, [{ x: 70, y: 225, r: 40 }, { x: 205, y: 380, r: 36 }, { x: 62, y: 330, r: 32 }, { x: 150, y: 290, r: 32 }, { x: 215, y: 238, r: 30 }]);
const PRODS = scatter(14, [34, 200, 266, 404], 20, 77, [{ x: 70, y: 225, r: 38 }, { x: 205, y: 380, r: 34 }]);
ART.deduve = {
  dw: 600, dh: 452,
  cols: { L: ['d6mito', 'd6enz', 'd6lyso'], R: [] },
  legend: `${ICON.sub} substrate · ${ICON.prod} product (phosphate) · ${esc(UI.lowHigh)} · ${esc(UI.notScale)}`,
  draw(st, g) {
    let s = '';
    const win = (wx, which) => {
      const meas = which === 'A' ? st.a : st.b, brk = which === 'B' && st.brk ? ease(st.brk.p) : 0, how = which === 'B' && st.brk ? st.brk.how : null;
      const swell = how === 'water' ? 1 + 0.25 * seg(brk, 0, 0.6) : 1, bb = how === 'water' ? seg(brk, 0.6, 1) : how === 'det' ? brk : 0;
      let w = `<rect x="${wx + 20}" y="188" width="260" height="224" rx="12" class="fr-win"/>`;
      w += SH.mito(wx + 70, 225, 64, 28, -10, { b: bb, s: how === 'water' ? swell : 1 }) + SH.mito(wx + 205, 380, 58, 26, 15, { b: bb, s: how === 'water' ? swell : 1 });
      LYS.forEach(([x, y, r], i) => {
        const leaky = i === 2;      /* a few lysosomes always break while the cells are homogenized */
        w += SH.lyso(wx + x, y, r, { s: swell, b: Math.max(bb, leaky ? 0.75 : 0), spread: Math.max(bb, leaky ? 0.6 : 0) });
      });
      if (meas != null) {
        const sIn = seg(meas, 0, 0.35), pr = ease(seg(meas, 0.35, 1));
        const nP = which === 'A' ? 2 : 13, gone = Math.round(pr * nP);
        SUBS.forEach(([x, y], i) => { if (i < gone) return; w += `<path d="M${r1(wx + x)},${r1(y - 5)} l5,5 l-5,5 l-5,-5Z" class="fr-sub" opacity="${r1(sIn * 100) / 100}"/>`; });
        const P = which === 'A' ? [[235, 270], [190, 255]] : PRODS;
        P.slice(0, nP).forEach(([x, y], i) => { const k = seg(pr * nP - i, 0, 1); if (k > 0) w += `<circle cx="${r1(wx + x)}" cy="${r1(y)}" r="4.2" class="fr-prod" opacity="${r1(k * 100) / 100}"/>`; });
        if (meas >= 1) w += TX(g, wx + 150, 438, which === 'A' ? 'low activity' : 'high activity', 16, 'fr-tb');
      }
      return w;
    };
    s += SH.tube(128, 16, 44, 128, 46) + SH.tube(428, 16, 44, 128, 46);
    s += TX(g, 150, 170, UI.fresh, 16, 'fr-tb') + TX(g, 450, 170, st.brk && st.brk.p >= 1 ? UI.broken : 'B: ' + UI.fresh.slice(3), 16, 'fr-tb');
    s += win(0, 'A') + win(300, 'B');
    return { svg: s, labels: [{ id: 'd6mito', side: 'L', at: [40, 229], pin: [-4, -22] }, { id: 'd6enz', side: 'L', at: [142, 286], pin: [0, -26] }, { id: 'd6lyso', side: 'L', at: [42, 330], pin: [-2, 26] }] };
  }
};

/* ---------------- the words: paragraphs with their level tags ---------------- */
const chip = (lv, code) => `<span class="lv lv--${lv}">${esc(LEVELS[lv].name)}${code ? ` <i>${esc(code)}</i>` : ''}</span>`;
const TAG = /^\[(sl|x)(?:\s+([A-Z][0-9.]+(?:,\s*[A-Z][0-9.]+)*))?\]\s*/;
function one(p) { const m = TAG.exec(p); return m ? `<p class="lvp lvp--${m[1]}">${chip(m[1], m[2])} ${esc(p.slice(m[0].length))}</p>` : `<p>${esc(p)}</p>`; }
function paras(t) {
  const main = [], more = [];
  fit(t).split('\n').filter(Boolean).forEach(p => {
    if (p.startsWith('[!] ')) main.push(`<p class="lvp lvp--lead">${esc(p.slice(4))}</p>`);
    else if (p.startsWith('[x+] ')) { const r = p.slice(5); more.push(one(/^\[(sl|x)[\s\]]/.test(r) ? r : '[x] ' + r)); }   /* (a folded guide line keeps its tag) */
    else main.push(one(p));
  });
  return main.join('') + (more.length ? `<details class="frv__fold"><summary>More detail</summary>${more.join('')}</details>` : '');
}

function styles() {
  let l = document.querySelector('link[data-frcss]');
  if (!l) { l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.frcss = '1'; l.href = new URL('../../css/fractionation.css?v=202611162123', import.meta.url).href; document.head.appendChild(l); }
  return l;
}
/* the game calls this when the door first shows: the styles come while the pupil reads (the code is already here) */
export function warm() { styles(); }

const fresh = () => ({
  why: {},
  conc: { p: {}, last: null },
  cold: { temp: null, tp: null, ph: null, pp: null },
  homog: { p: null },
  spin: { n: 0, wrong: null, last: null, anim: null, msg: null },
  deduve: { a: null, brk: null, b: null, msgs: [] }
});
const GOAL = {
  why: () => true,
  conc: s => s.p.iso >= 1,
  cold: s => s.temp === 'ice' && s.tp >= 1 && s.ph === 'buf' && s.pp >= 1,
  homog: s => s.p >= 1,
  spin: s => s.n === 4 && !s.anim,
  deduve: s => s.b >= 1
};

export function openFractionation({ mount = document.body, inGame = false, onClose = null } = {}) {
  const css = styles();
  const root = document.createElement('div');
  root.className = 'frv' + (inGame ? ' frv--game' : '') + (FAST ? ' frv--still' : '');
  root.setAttribute('role', inGame ? 'dialog' : 'main'); if (inGame) root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'frv-h');
  root.innerHTML = `
    <header class="frv__top">
      <div class="frv__id"><p class="frv__eyebrow">${esc(EYEBROW)}</p><h1 id="frv-h">${esc(TITLE)}</h1><p class="frv__by">Made by Dr Daniel Mompel Riera</p></div>
      ${inGame ? '<button type="button" class="frv__home frv__close">← Back to the game</button>' : '<a class="frv__home" href="../">← The cell game</a>'}
    </header>
    <div class="frv__main">
      <div class="frv__stage">
        <svg class="frv__svg" role="img" xmlns="http://www.w3.org/2000/svg"></svg>
        <div class="frv__names" aria-hidden="true"></div>
        <p class="frv__legend"></p>
      </div>
      <div class="frv__key" hidden></div>
      <aside class="frv__panel" aria-label="The steps">
        <p class="frv__count" aria-live="polite"></p>
        <nav class="frv__steps" aria-label="The steps"></nav>
        <h2 class="frv__st"></h2>
        <div class="frv__text"></div>
        <div class="frv__ctl"></div>
        <div class="frv__res" aria-live="polite"></div>
        <div class="frv__text frv__done" aria-live="polite"></div>
        <div class="frv__do">
          <button type="button" class="frv__back" aria-label="The step before">← Back</button>
          <button type="button" class="frv__next">Next step →</button>
        </div>
        <section class="frv__more">
          <h3>What the tags mean</h3>
          <div class="frv__tags">
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
    </div>`;
  mount.appendChild(root);
  if (!css.sheet) { root.style.visibility = 'hidden'; const on = () => { root.style.visibility = ''; layoutAll(); }; css.addEventListener('load', on, { once: true }); css.addEventListener('error', on, { once: true }); setTimeout(on, 4000); }
  document.documentElement.classList.add('fractionationv-open');
  const $ = q => root.querySelector(q);
  const stageEl = $('.frv__stage'), svgEl = $('.frv__svg'), namesEl = $('.frv__names'), legendEl = $('.frv__legend'), keyEl = $('.frv__key'), panelEl = $('.frv__panel');
  const countEl = $('.frv__count'), stepsEl = $('.frv__steps'), titleEl = $('.frv__st'), textEl = $('.frv__text'), ctlEl = $('.frv__ctl'), resEl = $('.frv__res'), doneEl = $('.frv__done');
  const nextB = $('.frv__next'), backB = $('.frv__back');

  let S = fresh(), si = 0, busy = false, token = 0, closed = false, G = null, cur = null, placed = [], raf = 0;
  const step = () => STEPS[si], id = () => STEPS[si].id, st = () => S[id()], goal = () => GOAL[id()](st());

  /* ---------------- the picture: its layout, its frame, its names ---------------- */
  /* the margins on a laptop: as wide as the widest name each side can show in this step (measured once) */
  const widths = new Map();
  function nameBox(nid, maxW) {
    const el = document.createElement('div'), [name, sub] = NAMES[nid];
    el.className = 'frv__nm'; el.style.maxWidth = maxW + 'px'; el.style.visibility = 'hidden';
    el.innerHTML = `<b>${esc(name)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}`;
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
    const lh = legendEl.offsetHeight ? legendEl.offsetHeight + 10 : 0, m = narrow ? { L: 0, R: 0 } : margins(A, maxW);
    const L = m.L ? m.L + 24 : 10, R = m.R ? m.R + 24 : 10, top = 10, bottom = H - lh - 6;
    const bw = W - L - R, bh = bottom - top, k = Math.min(bw / A.dw, bh / A.dh);
    const ox = L + (bw - A.dw * k) / 2, oy = top + (bh - A.dh * k) / 2;
    const sz = px => (narrow ? r1(px * 0.8) : px);
    return { W, H, narrow, maxW, k, ox, oy, bottom, F: px => r1(px / k * 100) / 100, sz, lh: px => sz(px) * 1.22 / k };
  }
  function draw() {
    G = layout();
    cur = ART[id()].draw(st(), G);
    svgEl.setAttribute('viewBox', `0 0 ${r1(G.W)} ${r1(G.H)}`);
    svgEl.innerHTML = `<g transform="translate(${r1(G.ox)} ${r1(G.oy)}) scale(${Math.round(G.k * 1e4) / 1e4})">${cur.svg}</g><g class="fr-lines"></g>`;
  }
  const px = at => [G.ox + at[0] * G.k, G.oy + at[1] * G.k];
  function clearNames() { namesEl.innerHTML = ''; const l = svgEl.querySelector('.fr-lines'); if (l) l.innerHTML = ''; placed = []; }
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
          it.x = side === 'L' ? Math.max(4, G.ox - 12 - it.w) : Math.min(G.W - 4 - it.w, G.ox + ART[id()].dw * G.k + 12);
          it.el.style.transform = `translate(${r1(it.x)}px, ${r1(it.y)}px)`;
          const x1 = side === 'L' ? it.x + it.w : it.x, y1 = it.y + it.h / 2;
          ln += `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(it.ax)}" y2="${r1(it.ay)}" class="fr-ln"/><circle cx="${r1(it.ax)}" cy="${r1(it.ay)}" r="3" class="fr-dot"/>`;
          placed.push({ id: it.l.id, kind: 'label', box: { l: it.x, t: it.y, r: it.x + it.w, b: it.y + it.h }, line: [x1, y1, it.ax, it.ay] });
        });
      });
    } else {
      /* a phone: a numbered pin beside each part, a short line to it, the names in a key under the picture */
      const P = labs.map((l, i) => { const [ax, ay] = px(l.at), o = l.pin || [0, -22]; return { l, n: i + 1, ax, ay, x: ax + o[0], y: ay + o[1] }; });
      const keep = q => { q.x = Math.max(13, Math.min(G.W - 13, q.x)); q.y = Math.max(13, Math.min(G.bottom - 13, q.y)); };
      const s0 = stageEl.getBoundingClientRect(), words = Array.from(svgEl.querySelectorAll('text')).map(t => { const b = t.getBoundingClientRect(); return { l: b.left - s0.left - 3, t: b.top - s0.top - 3, r: b.right - s0.left + 3, b: b.bottom - s0.top + 3 }; });
      P.forEach(keep);
      for (let it = 0; it < 400; it++) {
        let moved = false;
        for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
          /* two pins are clear of each other when their squares (24 px) do not meet */
          const a = P[i], b = P[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
          if (Math.abs(dx) < 27 && Math.abs(dy) < 27) { const ux = d ? dx / d : 0, uy = d ? dy / d : 1, m = (27 - Math.max(Math.abs(dx), Math.abs(dy))) / 2 + 1; a.x -= ux * m; a.y -= uy * m; b.x += ux * m; b.y += uy * m; keep(a); keep(b); moved = true; }
        }
        /* a pin on a word of the picture moves the shortest way off it */
        P.forEach(q => words.forEach(w => {
          if (q.x + 12 <= w.l || q.x - 12 >= w.r || q.y + 12 <= w.t || q.y - 12 >= w.b) return;
          const o = [[w.l - 12 - q.x, 0], [w.r + 12 - q.x, 0], [0, w.t - 12 - q.y], [0, w.b + 12 - q.y]].sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]))[0];
          q.x += o[0] + Math.sign(o[0]) * 0.5; q.y += o[1] + Math.sign(o[1]) * 0.5; keep(q); moved = true;
        }));
        if (!moved) break;
      }
      P.forEach(q => {
        const el = document.createElement('div');
        el.className = 'frv__pin'; el.dataset.id = q.l.id; el.textContent = q.n;
        el.style.transform = `translate(${r1(q.x - 12)}px, ${r1(q.y - 12)}px)`;
        namesEl.appendChild(el);
        const d = Math.hypot(q.x - q.ax, q.y - q.ay);
        let line = null;
        if (d > 14) { const ex = q.x - (q.x - q.ax) / d * 12, ey = q.y - (q.y - q.ay) / d * 12; line = [ex, ey, q.ax, q.ay]; ln += `<line x1="${r1(ex)}" y1="${r1(ey)}" x2="${r1(q.ax)}" y2="${r1(q.ay)}" class="fr-ln"/>`; }
        ln += `<circle cx="${r1(q.ax)}" cy="${r1(q.ay)}" r="2.6" class="fr-dot"/>`;
        placed.push({ id: q.l.id, kind: 'pin', box: { l: q.x - 12, t: q.y - 12, r: q.x + 12, b: q.y + 12 }, line });
      });
      keyEl.innerHTML = P.map(q => { const [name, sub] = NAMES[q.l.id]; return `<span class="frv__k"><b>${q.n}</b><span>${esc(name)}${sub ? `<i>: ${esc(sub)}</i>` : ''}</span></span>`; }).join('');
      keyEl.hidden = !P.length;
    }
    lines.innerHTML = ln;
    requestAnimationFrame(() => { if (!closed) root.classList.add('frv--names'); });
    svgEl.setAttribute('aria-label', `${step().title}. The picture names: ${labs.map(l => NAMES[l.id][0]).join(', ')}.`);
  }
  function hideNames() { root.classList.remove('frv--names'); }
  function layoutAll() { if (closed) return; draw(); if (!busy) placeNames(); }

  /* one motion: fn(p) for p from 0 to 1, a frame each, then after(); Reduce motion: the end at once. A new step (or
     closing) ends the motion where it would have ended (finish), so a state is never left half way */
  let pending = null;
  function motion(ms, fn, after) {
    return new Promise(res => {
      const end = () => { if (!pending || pending.end !== end) return; pending = null; fn(1); if (after) after(); res(); };
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
  function finish() { cancelAnimationFrame(raf); if (pending) pending.end(); }
  async function run(ms, fn, after) {
    busy = true; hideNames(); clearNames(); window.FRACTIONATION.at = { step: si, rest: false };
    renderCtl(); updateNext();
    const my = token;
    await motion(ms, fn, after);
    if (closed || my !== token) return;
    busy = false;
    draw(); placeNames(); renderCtl(); renderRes(); renderDone(); updateNext(); window.FRACTIONATION.at = { step: si, rest: true };
  }

  /* ---------------- the controls of each step ---------------- */
  const btn = (a, v, inner, o = {}) => `<button type="button" class="frv__ch${o.cls ? ' ' + o.cls : ''}" data-a="${a}" data-v="${v}"${o.dis || busy ? ' disabled' : ''}${o.pressed != null ? ` aria-pressed="${o.pressed}"` : ''}>${inner}</button>`;
  const two = (t, sub, m) => `${m ? `<span class="frv__mk frv__mk--${m === '✓' ? 'ok' : 'no'}" aria-hidden="true">${m}</span>` : ''}<b>${esc(t)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}`;
  function renderCtl() {
    const s = st(), focus = document.activeElement && ctlEl.contains(document.activeElement) ? document.activeElement.dataset.a + ':' + document.activeElement.dataset.v : '';
    let h = '';
    if (id() === 'conc') {
      h = `<div class="frv__chs" role="group" aria-label="The medium">${CONC.map(c => { const tried = s.p[c.v] >= 1; return btn('conc', c.v, two(UI[c.v][0], UI[c.v][1], tried ? (RESULT[c.v].ok ? '✓' : '✗') : ''), { pressed: s.last === c.v ? 'true' : 'false' }); }).join('')}</div>`;
    } else if (id() === 'cold') {
      const T = ['warm', 'ice'], P = ['nobuf', 'buf'];
      h = `<div class="frv__grp"><p class="frv__q">${esc(UI.tempQ)}</p><div class="frv__chs" role="group" aria-label="${esc(UI.tempQ)}">${T.map(v => btn('temp', v, two(UI[v][0], UI[v][1], s.temp === v && s.tp >= 1 ? (RESULT[v].ok ? '✓' : '✗') : ''), { pressed: s.temp === v ? 'true' : 'false' })).join('')}</div></div>`
        + `<div class="frv__grp"><p class="frv__q">${esc(UI.phQ)}</p><div class="frv__chs" role="group" aria-label="${esc(UI.phQ)}">${P.map(v => btn('ph', v, two(UI[v][0], UI[v][1], s.ph === v && s.pp >= 1 ? (RESULT[v].ok ? '✓' : '✗') : ''), { pressed: s.ph === v ? 'true' : 'false' })).join('')}</div></div>`;
    } else if (id() === 'homog') {
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
  /* what the pupil's last choices did: one or two lines each */
  function results() {
    const s = st();
    if (id() === 'conc') return s.last && s.p[s.last] >= 1 ? [s.last] : [];
    if (id() === 'cold') return [s.temp && s.tp >= 1 ? s.temp : null, s.ph && s.pp >= 1 ? s.ph : null].filter(Boolean);
    if (id() === 'spin') return s.msg ? [s.msg] : [];
    if (id() === 'deduve') return s.msgs;
    return [];
  }
  function renderRes() {
    resEl.innerHTML = results().map(r => {
      const R = typeof r === 'string' ? RESULT[r] : r;
      return `<div class="frv__r frv__r--${R.ok ? 'ok' : 'no'}">${paras(R.t)}</div>`;
    }).join('');
  }
  function renderDone() { doneEl.innerHTML = goal() && !busy ? paras(step().done || '') : ''; }
  function updateNext() {
    const ok = !busy && goal();
    nextB.disabled = !ok; nextB.classList.toggle('pulse', ok);
    backB.disabled = busy || si === 0;
    nextB.textContent = si < STEPS.length - 1 ? 'Next step →' : (inGame ? 'Back to the game →' : 'Start again →');
  }

  ctlEl.addEventListener('click', e => {
    const b = e.target.closest('.frv__ch'); if (!b || b.disabled || busy) return;
    const a = b.dataset.a, v = b.dataset.v, s = st();
    if (a === 'conc') { s.last = v; s.p[v] = 0; resEl.innerHTML = ''; run(v === 'iso' ? 1400 : 2200, p => { s.p[v] = p; }); }
    else if (a === 'temp') { s.temp = v; s.tp = 0; run(2000, p => { s.tp = p; }); }
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
          s.msg = { ok: false, t: RESULT.early.t.replace('{g}', SPINS.find(x => x.id === v).g).replace('{list}', list) };
        }
      });
    } else if (a === 'again') {
      s.msg = null; s.anim = { type: 'again', k: s.wrong, p: 0 };
      run(900, p => { s.anim.p = p; }, () => { s.anim = null; s.wrong = null; s.last = null; });
    } else if (a === 'measureA') { s.a = 0; run(2200, p => { s.a = p; }, () => { s.msgs.push('measureA'); }); }
    else if (a === 'break') { s.brk = { how: v === 'breakWater' ? 'water' : 'det', p: 0 }; run(1900, p => { s.brk.p = p; }, () => { s.msgs.push(v); }); }
    else if (a === 'measureB') { s.b = 0; run(2600, p => { s.b = p; }, () => { s.msgs.push('measureB'); }); }
  });

  /* ---------------- the steps ---------------- */
  function show(s) {
    token++; finish();      /* a motion cut short ends where it would have ended */
    busy = false; si = Math.max(0, Math.min(STEPS.length - 1, s));
    countEl.textContent = `Step ${si + 1} of ${STEPS.length}`; titleEl.textContent = step().title;
    if (stepsEl.children.length !== STEPS.length) stepsEl.innerHTML = STEPS.map((_, k) => `<button type="button" data-s="${k}" aria-label="Step ${k + 1}: ${esc(STEPS[k].title)}">${k + 1}</button>`).join('');
    Array.from(stepsEl.children).forEach((b, k) => { if (k === si) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    textEl.innerHTML = paras(step().t);
    const lg = ART[id()].legend; legendEl.innerHTML = typeof lg === 'function' ? lg(stageEl.getBoundingClientRect().width < 560) : lg;
    hideNames();
    renderCtl(); renderRes(); renderDone(); updateNext();
    panelEl.scrollTop = 0;
    if (!FAST) { svgEl.classList.add('is-new'); requestAnimationFrame(() => requestAnimationFrame(() => svgEl.classList.remove('is-new'))); }
    draw(); placeNames();
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

  const onKey = e => {
    if (e.key === 'Escape') { if (inGame) close(); return; }
    if (e.target.closest && e.target.closest('input, textarea, button, a, summary')) return;
    if (e.key === 'ArrowRight' && !nextB.disabled) nextB.click();
    if (e.key === 'ArrowLeft' && !backB.disabled) backB.click();
  };
  document.addEventListener('keydown', onKey);
  let rz = 0;
  const onResize = () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { if (!busy) layoutAll(); }); };
  window.addEventListener('resize', onResize);
  const ro = window.ResizeObserver ? new ResizeObserver(onResize) : null; if (ro) ro.observe(stageEl);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { widths.clear(); if (!closed && !busy) layoutAll(); });

  function close() {
    if (closed) return; token++; finish(); closed = true; document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); if (ro) ro.disconnect();
    root.remove();
    document.documentElement.classList.remove('fractionationv-open');
    if (window.FRACTIONATION && window.FRACTIONATION.root === root) window.FRACTIONATION = null;
    if (onClose) onClose();
  }
  if (inGame) $('.frv__close').addEventListener('click', close);

  /* ---------------- for the check tool ---------------- */
  window.FRACTIONATION = {
    root, FAST, steps: STEPS.length, ids: STEPS.map(s => s.id), at: { step: 0, rest: false },
    goto: s => show(s), close, goal: () => goal(), busy: () => busy,
    /* the names as placed now (stage pixels), and every word drawn in the picture */
    names: () => placed.map(p => Object.assign({}, p, { box: Object.assign({}, p.box) })),
    words: () => { const s0 = stageEl.getBoundingClientRect(); return Array.from(svgEl.querySelectorAll('text')).map(t => { const b = t.getBoundingClientRect(); return { s: t.textContent, box: { l: b.left - s0.left, t: b.top - s0.top, r: b.right - s0.left, b: b.bottom - s0.top } }; }); },
    size: () => G && { W: G.W, H: G.H, narrow: G.narrow, k: G.k }
  };

  let first = 0;
  const h = /^#s(\d+)$/.exec(location.hash || ''); if (!inGame && h) first = +h[1] - 1;
  show(first);
  return { close, root };
}
