/* ============================================================
   water.js — the water of the membrane view's step 9 (16 Nov 2026), as numbers only (no drawing here: scene.js draws
   it, tools/membrane-check.mjs reads it). The task: "an aquaporin in the bilayer at true size (four subunits, each with
   its own narrow pore), water molecules passing through each pore in single file, and a few water molecules crossing
   the bilayer itself, slowly".

   WHAT IT IS. In each of the aquaporin's four pores (aqp1.js: each pore's measured path, a point every 0.1 nm) the
   water molecules stand in one file, 0.3 nm apart (each about 0.3 nm across, so they touch: the pore "is just large
   enough to accommodate a single water molecule", Agre 2003). The whole file moves together, at random, up or down
   (its speed changes smoothly: no molecule jumps), so molecules pass through the pore both ways and none overtakes
   another. Beyond the pore's ends a molecule spreads a little sideways (the wide vestibules of the "hourglass", Agre
   2003) and, past the protein's surface, it fades: only the water inside the aquaporin is drawn (text.js SIMPLE: the
   rest of the water, all round the membrane, is not). Each molecule turns round as it passes the middle of the pore,
   where the two NPA asparagines hold it ("water dipole reorientation", Agre 2003, figure 4).
   Two more water molecules cross the bilayer itself, between the phospholipids at the cut face's two ends: slowly
   (a crossing takes CROSS_S seconds here, then one back; each file in a pore moves about 0.3 nm a second, one
   molecule's width, so in each pore about one molecule passes the middle every second, one way or the other).
   How much faster water crosses through aquaporins is said in words from a measurement (Agre 2003: membranes with
   aquaporin 1 lost their water in about 20 ms, without it in about 0.5 s), not shown as a rate: no rate is invented.
   The picture is slowed far more than the lipids (about 3 billion water molecules pass through one pore each second
   in a cell: Agre 2003); the page says only "much slower", since the model's random file has no rate of its own.
   With Reduce motion nothing moves: one still, its two crossing molecules inside the bilayer.
   ============================================================ */
export const WATER = {
  SP: 0.3,                 /* nm between two molecules in a file (each about 0.3 nm across: the pore's narrowest is 0.28–0.31 nm) */
  Y0: -2.85, Y1: 3.55,     /* a file is drawn between these heights (the aquaporin: -2.4 to 3.1 nm), fading beyond IN0 and IN1 */
  IN0: -2.35, IN1: 3.05,
  V_RMS: 0.3, TAU: 1.5,    /* the file's speed: about 0.3 nm s⁻¹, changing over about 1.5 s */
  CROSS_A: 2.85,           /* a crossing molecule turns back 2.85 nm from the membrane's middle (the heads reach 2.4 nm) */
  CROSS_S: 60              /* seconds for one crossing */
};
const mulberry = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const smooth = u => u * u * (3 - 2 * u);
const hash = k => { let h = Math.imul(k | 0, 0x9E3779B1) ^ 0x85EBCA6B; h = Math.imul(h ^ h >>> 15, 0x2C1B3C6D); return ((h ^ h >>> 13) >>> 0) / 4294967296; };

/* S: the piece of membrane with the aquaporin (sim.js makeSim(…, AQP_PATCH)); A: its measured shape (aqp1.js) */
export function makeWater(S, A, seed = 3) {
  const R = mulberry(seed), W = WATER, aq = S.prot.find(p => p.id === 'aquaporin');
  const pores = A.pores.map(pts => ({ pts, y0: pts[0][1], y1: pts[pts.length - 1][1] }));
  let spare = null;
  const gauss = () => { if (spare != null) { const g = spare; spare = null; return g; } let u = 0; while (u < 1e-12) u = R(); const m = Math.sqrt(-2 * Math.log(u)), a = 6.283185307179586 * R(); spare = m * Math.sin(a); return m * Math.cos(a); };
  /* each file: where it is (off, nm) and how fast it moves */
  const off = pores.map(() => R() * W.SP), vel = pores.map(() => gauss() * W.V_RMS);
  /* the two that cross the bilayer: at the cut face's two ends, a little in front of its lipids; ph: where each is in
     its crossings at the start (so that, in the still of Reduce motion, both are inside the bilayer) */
  const HW = S.P.W / 2, HD = S.P.D / 2;
  const cross = [{ x: HW - 0.55, z: HD - 0.12, ph: 0.36 }, { x: -(HW - 0.55), z: HD - 0.12, ph: 1.62 }];
  const st = { t: 0, steps: 0 };
  function step(dt) {
    const k = dt / W.TAU, sg = W.V_RMS * Math.sqrt(2 * dt / W.TAU);
    for (let i = 0; i < pores.length; i++) { vel[i] += -vel[i] * k + sg * gauss(); off[i] += vel[i] * dt; }
    st.t += dt; st.steps++;
  }
  /* a point of pore i at height y, in the aquaporin's own frame: on the measured path; beyond its ends straight on,
     spreading sideways (by 0.3 nm for each nm) in the molecule's own direction (a) */
  function poreAt(i, y, a, o) {
    const P = pores[i], pts = P.pts;
    let x, z, spread = 0;
    if (y <= P.y0) { x = pts[0][0]; z = pts[0][2]; spread = P.y0 - y; }
    else if (y >= P.y1) { x = pts[pts.length - 1][0]; z = pts[pts.length - 1][2]; spread = y - P.y1; }
    else { const f = (y - P.y0) / 0.1, j = Math.min(pts.length - 2, Math.floor(f)), u = f - j; x = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * u; z = pts[j][2] + (pts[j + 1][2] - pts[j][2]) * u; }
    o.x = x + 0.3 * spread * Math.cos(a); o.z = z + 0.3 * spread * Math.sin(a); return o;
  }
  /* the aquaporin's frame in the piece's frame (as scene.js turns its group, and view.js localOf) */
  const world = (o) => { const c = Math.cos(aq.ang), s = Math.sin(aq.ang), lx = o.x, lz = o.z; o.x = aq.x + lx * c + lz * s; o.z = aq.z - lx * s + lz * c; return o; };
  const tmp = { x: 0, z: 0 };
  /* every molecule now: fn(x, y, z, scale, bx, by, bz, roll, which, i, k): its middle (nm), its size (0 to 1), the
     direction from its oxygen to its two hydrogens, its turn about that direction; which 'pore' (i: the pore, k: its
     place in the file, the same number for the same molecule while the file moves) or 'cross' (i: which) */
  function each(fn) {
    for (let i = 0; i < pores.length; i++) {
      const o = off[i], k0 = Math.ceil((W.Y0 - o) / W.SP), k1 = Math.floor((W.Y1 - o) / W.SP);
      for (let k = k0; k <= k1; k++) {
        const y = k * W.SP + o, h = hash(k * 7 + i * 1013), a = h * 6.2832;
        const sc = y < W.IN0 ? smooth(Math.max(0, (y - W.Y0) / (W.IN0 - W.Y0))) : y > W.IN1 ? smooth(Math.max(0, (W.Y1 - y) / (W.Y1 - W.IN1))) : 1;
        if (sc <= 0.01) continue;
        poreAt(i, y, a, tmp); world(tmp);
        /* the hydrogens point away from the pore's middle (where the asparagines are): sideways there, along the pore beyond */
        const ph = Math.PI / 2 * (1 - Math.tanh(y / 0.35)), sp = Math.sin(ph);
        fn(tmp.x, y, tmp.z, sc, sp * Math.cos(a), Math.cos(ph), sp * Math.sin(a), h * 9.4, 'pore', i, k);
      }
    }
    for (let i = 0; i < cross.length; i++) {
      const c = cross[i], y = crossY(c), a = 1.3 + i * 2.1;
      fn(c.x + 0.07 * Math.sin(st.t * 0.9 + i * 2), y, c.z + 0.05 * Math.cos(st.t * 0.7 + i), 1, Math.cos(a) * 0.8, 0.6, Math.sin(a) * 0.8, st.t * 0.25 + i, 'cross', i, 0);
    }
  }
  /* a crossing molecule's height: CROSS_S seconds from one side to the other, slow at its ends (outside the bilayer) */
  function crossY(c) {
    const u = st.t / W.CROSS_S + c.ph, n = Math.floor(u), f = smooth(u - n);
    return W.CROSS_A * ((n % 2 === 0) ? 1 - 2 * f : -1 + 2 * f);
  }
  /* for the names: the point of crossing molecule i, and of a molecule in pore i: the one it had while it stays within
     0.85 nm of the pore's middle, else the one nearest 0.4 nm below it (in the single file) */
  const held = pores.map(() => null);
  function crossPoint(i, out) { const c = cross[i]; return out.set(c.x + 0.07 * Math.sin(st.t * 0.9 + i * 2), crossY(c), c.z + 0.05 * Math.cos(st.t * 0.7 + i)); }
  function porePoint(i, out) {
    const o = off[i];
    let k = held[i];
    if (k == null || Math.abs(k * W.SP + o) > 0.85) k = held[i] = Math.round((-0.4 - o) / W.SP);
    const y = k * W.SP + o; poreAt(i, y, hash(k * 7 + i * 1013) * 6.2832, tmp); world(tmp);
    return out.set(tmp.x, y, tmp.z);
  }
  /* for tools/membrane-check.mjs: every molecule, each file's place and speed, the crossers' heights */
  function state() {
    const mol = []; each((x, y, z, s, bx, by, bz, r, which, i, k) => { mol.push({ x, y, z, s, which, i, k }); });
    return { t: st.t, steps: st.steps, off: off.slice(), vel: vel.slice(), mol, cross: cross.map(c => crossY(c)), SP: W.SP };
  }
  return { step, each, crossPoint, porePoint, state, pores, cross, st, get count() { let n = 0; each(() => { n++; }); return n; } };
}
