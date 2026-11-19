/* ============================================================
   flow.js — many molecules beside a membrane as they really move, for "From glucose to ATP" (19 Nov 2026; Daniel's rule
   for the IB views, memory teach-on-the-picture: a process whose guide line names diffusion or a concentration gradient
   is shown as MANY molecules, each on a random walk, with the crossings counted both ways, as the game's way in does:
   js/game/wayflow.js). Until then chapter 1 showed ONE glucose molecule on a smooth path and four oxygen molecules that
   rose side by side through the bilayer: neither showed random movement, and nothing showed a concentration.
   In numbers only (ch1.js draws them; tools/ib-check.mjs runs them):
   - each molecule has a velocity that changes a little at random every step (it keeps its way for about half a second,
     then wanders off): none is steered, none is pushed;
   - a kind that cannot cross the phospholipid bilayer (glucose: polar) goes in between the phosphate heads and is turned
     back where the hydrophobic tails begin; each such meeting is counted;
   - a kind that can cross (oxygen: small and non-polar) passes between the lipids in BOTH directions. A crossing is
     counted when a molecule that was on one side of the bilayer arrives on the other side;
   - oxygen comes from the blood (below the picture) and is used in the cell (above it): a molecule that wanders out of
     the top of the space is used, and one comes in at the bottom. So more oxygen molecules are below the bilayer than
     above it, more reach the bilayer from below, and the net movement is into the cell, though each molecule moves at
     random;
   - no molecule enters a protein (`solids`: the whole outline of each protein, at every depth: a protein drawn
     see-through would otherwise show a molecule inside it that only passed in front of it).
   The whole run is worked out once, when the chapter is made, and kept (a place for every molecule at every thirtieth of
   a second): the picture then shows the run at any moment, forwards, again, or as one still, and it is always the run
   the check has counted. The random numbers are fixed (`seed`); the sums use only + − × ÷ and square roots, so every
   browser shows the same run.
   Units: nm; time in seconds of the picture (slowed, as every picture of the view).
   ============================================================ */

/* small, fixed random numbers (mulberry32); a bell curve from four of them (no logarithm, no cosine: the same in every browser) */
export const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const bell = r => (r() + r() + r() + r() - 2) * 1.7320508075688772;

export const DT = 1 / 30;

/* spec: { n, seed, end (s), s (speed each way, nm/s), tau (s: how long a molecule keeps its way), r (its radius),
     box: { x0, x1, y0, y1, z0, z1 }, M (the bilayer's half thickness: its faces at y = ±M),
     cross (true: it passes the bilayer; false: it bounces off), below (how many start below the bilayer; a kind that
     cannot cross keeps that number), sink ('top': used above, a new one comes in below; none: the space is closed),
     solids: [{ x0, x1, y0, y1 }] }
   → { n, frames, at(t, i, out) (x, y, z and how much of it shows, 0–1), up(t), down(t), hits(t), sides(t) } */
export function simulate(spec) {
  const { n, seed, end, s, tau, r = 0.2, box: B, M, cross = false, below = n, sink = null, solids = [] } = spec;
  const R = rng(seed), nF = Math.round(end / DT) + 1, k = s * Math.sqrt(2 * DT / tau), damp = 1 - DT / tau, FADE = 12;
  const P = new Float32Array(nF * n * 4), up = new Uint16Array(nF), down = new Uint16Array(nF), hits = new Uint16Array(nF);
  const face = M + r;                                        /* where a molecule's middle is when it touches the bilayer */
  const inSolid = (x, y) => solids.find(S => x > S.x0 - r && x < S.x1 + r && y > S.y0 - r && y < S.y1 + r);
  const free = (lo, hi) => { for (let t = 0; t < 400; t++) { const x = B.x0 + R() * (B.x1 - B.x0), y = lo + R() * (hi - lo); if (!inSolid(x, y)) return [x, y]; } return [B.x0, lo]; };
  const m = [];
  for (let i = 0; i < n; i++) {
    let x, y;
    if (cross) {
      /* between a source and a sink the number of molecules falls in a straight line from one to the other: placed so */
      for (let t = 0; t < 400; t++) { y = B.y0 + (1 - Math.sqrt(R())) * (B.y1 - B.y0); x = B.x0 + R() * (B.x1 - B.x0); if (!inSolid(x, y)) break; }
    } else [x, y] = i < below ? free(B.y0, -face) : free(face, B.y1);
    m.push({ x, y, z: B.z0 + R() * (B.z1 - B.z0), vx: bell(R) * s, vy: bell(R) * s, vz: bell(R) * s * 0.5, side: y < -face ? -1 : y > face ? 1 : 0, born: -FADE, gone: -1 });
  }
  let cu = 0, cd = 0, ch = 0;
  for (let f = 0; f < nF; f++) {
    if (f) for (const a of m) {
      a.vx = a.vx * damp + bell(R) * k; a.vy = a.vy * damp + bell(R) * k; a.vz = a.vz * damp + bell(R) * k * 0.5;
      let x = a.x + a.vx * DT, y = a.y + a.vy * DT, z = a.z + a.vz * DT;
      if (x < B.x0) { x = 2 * B.x0 - x; a.vx = -a.vx; } else if (x > B.x1) { x = 2 * B.x1 - x; a.vx = -a.vx; }
      if (z < B.z0) { z = 2 * B.z0 - z; a.vz = -a.vz; } else if (z > B.z1) { z = 2 * B.z1 - z; a.vz = -a.vz; }
      if (!cross) {
        /* the bilayer stops it: it bounces off the heads */
        if (a.side < 0 && y > -face) { y = -2 * face - y; a.vy = -Math.abs(a.vy); ch++; }
        else if (a.side > 0 && y < face) { y = 2 * face - y; a.vy = Math.abs(a.vy); ch++; }
        if (y < B.y0) { y = 2 * B.y0 - y; a.vy = -a.vy; } else if (y > B.y1) { y = 2 * B.y1 - y; a.vy = -a.vy; }
      } else {
        if (y < B.y0) { y = 2 * B.y0 - y; a.vy = -a.vy; }
        if (y > B.y1 && sink === 'top') {
          /* used in the cell: it goes; a new one comes in below, from the blood */
          a.gone = f; x = B.x0 + R() * (B.x1 - B.x0); y = B.y0 + R() * 0.6; z = B.z0 + R() * (B.z1 - B.z0);
          a.vx = bell(R) * s; a.vy = Math.abs(bell(R)) * s; a.vz = bell(R) * s * 0.5; a.side = -1; a.born = f;
        } else if (y > B.y1) { y = 2 * B.y1 - y; a.vy = -a.vy; }
        const sd = y < -face ? -1 : y > face ? 1 : 0;
        if (sd && sd !== a.side) { if (a.side) { if (sd > 0) cu++; else cd++; } a.side = sd; }
      }
      /* a protein: back out of it, the way it came */
      if (inSolid(x, y)) { if (!inSolid(a.x, y)) { x = a.x; a.vx = -a.vx; } else if (!inSolid(x, a.y)) { y = a.y; a.vy = -a.vy; } else { x = a.x; y = a.y; a.vx = -a.vx; a.vy = -a.vy; } }
      a.x = x; a.y = y; a.z = z;
    }
    up[f] = cu; down[f] = cd; hits[f] = ch;
    for (let i = 0; i < n; i++) { const a = m[i], o = (f * n + i) * 4; P[o] = a.x; P[o + 1] = a.y; P[o + 2] = a.z; P[o + 3] = Math.min(1, (f - a.born) / FADE); }
  }
  const fr = t => Math.max(0, Math.min(nF - 1, t / DT));
  return {
    n, frames: nF, end, M, face,
    /* where molecule i is at time t (between two kept moments: a straight line; a molecule that has just come in is not
       drawn from where the one before it left) */
    at(t, i, out) {
      const q = fr(t), f0 = Math.floor(q), f1 = Math.min(nF - 1, f0 + 1), u = q - f0, a = (f0 * n + i) * 4, b = (f1 * n + i) * 4;
      if (P[b + 3] < P[a + 3]) { out.x = P[b]; out.y = P[b + 1]; out.z = P[b + 2]; out.s = P[b + 3]; return out; }
      out.x = P[a] + (P[b] - P[a]) * u; out.y = P[a + 1] + (P[b + 1] - P[a + 1]) * u; out.z = P[a + 2] + (P[b + 2] - P[a + 2]) * u; out.s = P[a + 3] + (P[b + 3] - P[a + 3]) * u;
      return out;
    },
    up: t => up[Math.floor(fr(t))], down: t => down[Math.floor(fr(t))], hits: t => hits[Math.floor(fr(t))],
    /* how many are below the bilayer, in it, above it */
    sides(t) { const f = Math.floor(fr(t)), c = [0, 0, 0]; for (let i = 0; i < n; i++) { const y = P[(f * n + i) * 4 + 1]; c[y < -face ? 0 : y > face ? 2 : 1]++; } return c; }
  };
}

/* the way of a molecule that is FOLLOWED to a protein (the glucose with numbered carbons; pyruvate): until 19 Nov 2026
   a straight glide into the protein, as if it were steered. A molecule moves at random until it meets the protein, so
   its way wanders. f: 0 … 1 along that part of the way; → what to add to its place there (nm). Nothing at either end,
   so the way still begins and ends where the step says; a fixed curve (no clock), so a step shown again is the same. */
export function wander(f, amp, n = 0) {
  if (!(f > 0 && f < 1)) return [0, 0, 0];
  const e = Math.sin(Math.PI * f), a = f * 6.2832;
  return [amp * e * (0.62 * Math.sin(a * 1.7 + 0.9 + n) + 0.38 * Math.sin(a * 4.1 + 2.3 + 2 * n)), amp * e * (0.62 * Math.sin(a * 2.3 + 4.1 + n) + 0.38 * Math.sin(a * 5.3 + 0.7 + 3 * n)), amp * 0.35 * e * Math.sin(a * 3.1 + 1.3 + n)];
}

/* ---------------- chapter 1's two kinds (ch1.js draws these very runs) ---------------- */
/* the space: x across the membrane, y up (the membrane's middle at 0; below, the tissue fluid; above, the cytosol), z
   towards the viewer, in FRONT of the cut face of the bilayer (z > 0), where every molecule is seen. The bilayer's faces:
   the tops of the phosphate heads, 2.4 nm from its middle (membrane.js MEM: headY + headR). */
export const SPACE = { x0: -15, x1: 13, z0: 0.35, z1: 2.1, M: 2.4 };
/* each kind has its own clock (ch1.js: the knobs `flow` and `ot`). Glucose's begins when the picture first shows the
   many (step 2, which lasts STEP2 seconds: the meetings with the bilayer counted beside the picture are those of that
   time); oxygen's begins when its count begins (step 5) and the count runs for COUNT seconds. Each run is longer than
   the chapter's later steps need. `solids`: the outlines of the glucose transporter (through the membrane) and of
   hexokinase (in the cytosol), as measured from their shapes (tools/ib-check.mjs compares them with the shapes drawn).
   The seeds: of 60 runs of each kind, one whose counts are the ordinary ones (oxygen: 5 into the cell and 2 out in the
   ten seconds, the mean of the 60 being 4.8 and 2.1; glucose: 3 meetings with the bilayer in step 2, the mean 2.8) and
   which says what the line says at every second (c1Check). */
export const C1 = {
  STEP2: 4.4, COUNT: 10,
  solids: [{ x0: -4, x1: 3.3, y0: -3.8, y1: 5 }, { x0: -4.5, x1: 9.9, y0: 6.2, y1: 13.5 }],      /* (the transporter in both its shapes: open to the outside it is wider) */
  /* (glucose's own M: it goes in between the phosphate heads, which are hydrophilic, and the hydrophobic tails stop it, 1.9 nm
     from the middle; the science read, 19 Nov 2026: stopped at the heads' tops, it showed the heads as the barrier) */
  glucose: { n: 14, below: 12, seed: 24, end: 50, s: 1.25, tau: 0.5, r: 0.45, M: 1.45, cross: false, y0: -9.6, y1: 9.6 },
  oxygen: { n: 40, seed: 17, end: 36, s: 2.5, tau: 0.45, r: 0.12, cross: true, sink: 'top', y0: -11.5, y1: 9 }
};
export function c1Run(kind, seed) {
  const K = C1[kind];
  return simulate({ n: K.n, seed: seed == null ? K.seed : seed, end: K.end, s: K.s, tau: K.tau, r: K.r, M: K.M != null ? K.M : SPACE.M, cross: K.cross, below: K.below, sink: K.sink || null, solids: C1.solids,
    box: { x0: SPACE.x0, x1: SPACE.x1, y0: K.y0, y1: K.y1, z0: SPACE.z0, z1: SPACE.z1 } });
}
/* what the picture must say, checked on the very runs it shows (tools/ib-check.mjs): → faults (none: an empty list) and the numbers */
export function c1Check(seeds = {}) {
  const bad = [], G = c1Run('glucose', seeds.glucose), O = c1Run('oxygen', seeds.oxygen), E = C1.COUNT;
  /* glucose: never across; the same number on each side from the first moment to the last; some meet the bilayer in step 2 */
  for (const t of [0, C1.STEP2, C1.glucose.end]) { const s = G.sides(t); if (s[1] || s[0] !== C1.glucose.below) bad.push(`glucose at ${t} s: ${s[0]} below the bilayer, ${s[1]} in it, ${s[2]} above (${C1.glucose.below}, 0 and ${C1.glucose.n - C1.glucose.below} all the time)`); }
  if (G.hits(C1.STEP2) < 3) bad.push(`in step 2 only ${G.hits(C1.STEP2)} glucose molecules meet the bilayer`);
  /* oxygen, while step 5 counts: both ways happen; from the fourth second more have gone in than out; the end says it plainly */
  for (let t = 4; t <= E; t++) if (O.up(t) <= O.down(t)) bad.push(`oxygen at ${t} s of step 5: ${O.up(t)} in, ${O.down(t)} out`);
  if (O.down(E) < 2) bad.push(`oxygen: only ${O.down(E)} out of the cell in step 5 (both ways must be seen)`);
  if (O.up(E) - O.down(E) < 3) bad.push(`oxygen: ${O.up(E)} in and ${O.down(E)} out at the end of step 5 (the net movement must be plain)`);
  const s = O.sides(E);
  if (s[0] <= s[2]) bad.push(`oxygen at the end of step 5: ${s[0]} below the bilayer, ${s[2]} above (more must be below)`);
  return { bad, in: O.up(E), out: O.down(E), sides: s, hits: G.hits(C1.STEP2) };
}
