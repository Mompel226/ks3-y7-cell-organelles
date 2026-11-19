/* ============================================================
   walk.js — the two populations of the cell fractionation lab that move at random (18 Nov 2026; Daniel's rule for the IB
   views, memory teach-on-the-picture: a process that depends on random movement is shown as many molecules, each on a
   random walk, and what they do is counted; nothing is steered):
   - step 3, the temperature: proteases round a mitochondrion. A protease digests one of the organelle's proteins only
     when it collides with the organelle beside that protein (IB guide C1.1.6: "movement is needed for a substrate
     molecule and an active site to come together"; here the large substrate stays in its membrane and the enzyme
     moves). At about 0 °C each protease moves more slowly than at 37 °C, so it reaches the organelle less often,
     and a collision has less energy: here one collision in three beside a protein digests it, where every one does at
     37 °C (C1.1.8, collision theory; a science read, 18 Nov 2026: with the speed alone the picture showed sixteen
     collisions against one, and most of the true fall in rate is that fewer collisions have enough energy). Fewer
     proteins are digested in the same ten seconds. Slower and fewer only: the numbers are not measured values.
   - step 7, de Duve's test: substrate molecules in a sample of pellet 2. A substrate molecule cannot cross a whole
     membrane (it turns back at it); it becomes product when it meets an enzyme molecule that is free in the solution.
     With the membranes whole only the enzyme of the one lysosome that broke in the homogenizer is free: low activity.
     With every membrane broken all the enzyme is free: high activity. Low and high only: no value of de Duve's.
   Each molecule keeps a velocity that changes a little at random every step (and friction): a smooth random walk. The
   random numbers are fixed (a seed for each run), so the run a pupil watches is the run the check counted
   (tools/fractionation-check.mjs --only numbers), on every computer: only + − × ÷ and square roots are used here.
   Units: the picture's own art units (js/fractionation/view.js); time in seconds, as shown.
   ============================================================ */
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const bell = rnd => () => (rnd() + rnd() + rnd() + rnd() - 2) * 1.7320508075688772;   /* about a bell curve, spread 1 */
const DT = 1 / 60;

/* ---------------- step 3: proteases round a mitochondrion ---------------- */
export const PROT = {
  W: 560, H: 300, CX: 280, CY: 150, A: 132, B: 56,      /* the window; the mitochondrion (an ellipse) */
  N: 8, R: 9, REACH: 17,                                 /* the proteases, their radius; how near a protein a collision must be */
  TAU: 0.4, S: { warm: 135, ice: 70 },                   /* friction time; the speed at 37 °C and at about 0 °C */
  LUCK: { warm: 1, ice: 3 },                             /* one collision in LUCK beside a protein digests it */
  END: 10, TRAIL: 1.6,                                   /* a run, in seconds; how long a path is drawn behind each protease */
  SEED: { warm: 30, ice: 30 }
};
/* the organelle's proteins that the picture follows: twelve places on its outer membrane (half-angle tangents, so no
   sine is needed: x = A(1 − t²)/(1 + t²), y = B·2t/(1 + t²)) */
const HT = [0.1317, 0.4142, 0.7673, 1.3032, 2.4142, 7.5958];
export const PROTEINS = HT.flatMap(t => [t, -t]).map(t => { const q = 1 + t * t; return [PROT.CX + PROT.A * (1 - t * t) / q, PROT.CY + PROT.B * 2 * t / q]; });

export function makeProteases(temp, seed) {
  const C = PROT, rnd = rng(seed == null ? C.SEED[temp] : seed), g = bell(rnd), S = C.S[temp], n = C.N;
  const x = new Float64Array(n), y = new Float64Array(n), vx = new Float64Array(n), vy = new Float64Array(n), touch = new Uint8Array(n);
  const gone = new Uint8Array(PROTEINS.length), when = new Float64Array(PROTEINS.length), trail = Array.from({ length: n }, () => []);
  const ea = C.A + C.R, eb = C.B + C.R, inE = (px, py, k = 1) => { const dx = (px - C.CX) / (ea * k), dy = (py - C.CY) / (eb * k); return dx * dx + dy * dy; };
  /* the start: spread in the medium, away from the organelle (the same places at both temperatures: the same seed) */
  for (let i = 0; i < n; i++) {
    let best = null, bd = -1;
    for (let k = 0; k < 40; k++) {
      const px = C.R + 4 + rnd() * (C.W - 2 * C.R - 8), py = C.R + 4 + rnd() * (C.H - 2 * C.R - 8);
      if (inE(px, py, 1.35) < 1) continue;
      let d = 1e9; for (let j = 0; j < i; j++) { const dx = px - x[j], dy = py - y[j]; d = Math.min(d, Math.sqrt(dx * dx + dy * dy)); }
      if (d > bd) { bd = d; best = [px, py]; }
    }
    x[i] = best[0]; y[i] = best[1]; vx[i] = S * g(); vy[i] = S * g();
  }
  let steps = 0, hits = 0, eaten = 0;
  const bumps = [];      /* each collision with the organelle: where, when, and whether it digested a protein */
  const kk = Math.sqrt(2 * DT / C.TAU), damp = 1 - DT / C.TAU, every = Math.round(0.1 / DT), keep = Math.round(C.TRAIL / 0.1);
  function one() {
    for (let i = 0; i < n; i++) {
      vx[i] = vx[i] * damp + S * kk * g(); vy[i] = vy[i] * damp + S * kk * g();
      x[i] += vx[i] * DT; y[i] += vy[i] * DT;
      if (x[i] < C.R) { x[i] = C.R; if (vx[i] < 0) vx[i] = -vx[i]; } else if (x[i] > C.W - C.R) { x[i] = C.W - C.R; if (vx[i] > 0) vx[i] = -vx[i]; }
      if (y[i] < C.R) { y[i] = C.R; if (vy[i] < 0) vy[i] = -vy[i]; } else if (y[i] > C.H - C.R) { y[i] = C.H - C.R; if (vy[i] > 0) vy[i] = -vy[i]; }
      const e = inE(x[i], y[i]);
      if (e < 1) {
        /* a collision with the organelle: back to its surface, and away from it */
        const k = 1 / Math.sqrt(e > 1e-9 ? e : 1e-9); x[i] = C.CX + (x[i] - C.CX) * k; y[i] = C.CY + (y[i] - C.CY) * k;
        let nx = (x[i] - C.CX) / (ea * ea), ny = (y[i] - C.CY) / (eb * eb); const nl = Math.sqrt(nx * nx + ny * ny) || 1; nx /= nl; ny /= nl;
        const vn = vx[i] * nx + vy[i] * ny; if (vn < 0) { vx[i] -= 2 * vn * nx; vy[i] -= 2 * vn * ny; }
        if (!touch[i]) {
          touch[i] = 1; hits++;
          let b = -1, bd = C.REACH + C.R;
          PROTEINS.forEach((p, j) => { if (gone[j]) return; const dx = p[0] - x[i], dy = p[1] - y[i], d = Math.sqrt(dx * dx + dy * dy); if (d < bd) { bd = d; b = j; } });
          const did = b >= 0 && (C.LUCK[temp] === 1 || rnd() * C.LUCK[temp] < 1);
          if (did) { gone[b] = 1; when[b] = (steps + 1) * DT; eaten++; }
          bumps.push([x[i], y[i], (steps + 1) * DT, did ? 1 : 0]);
        }
      } else if (e > 1.12) touch[i] = 0;
    }
    steps++;
    if (steps % every === 0) for (let i = 0; i < n; i++) { trail[i].push([x[i], y[i]]); if (trail[i].length > keep) trail[i].shift(); }
  }
  return {
    temp, n, x, y, vx, vy, gone, when, trail, bumps,
    get t() { return steps * DT; }, get hits() { return hits; }, get eaten() { return eaten; },
    /* on to a time of the run (never back): the same steps whatever the frames were */
    to(t) { const want = Math.round(Math.min(t, C.END) / DT); while (steps < want) one(); return this; }
  };
}
/* a run second by second: the proteins digested, the collisions; and how far a protease moved in its last second */
export function proteaseCheck(temp, seed) {
  const P = makeProteases(temp, seed), rows = [];
  for (let s = 1; s <= PROT.END; s++) { P.to(s); rows.push({ s, eaten: P.eaten, hits: P.hits }); }
  let out = 0; for (let i = 0; i < P.n; i++) if (!(P.x[i] >= PROT.R - 0.01 && P.x[i] <= PROT.W - PROT.R + 0.01 && P.y[i] >= PROT.R - 0.01 && P.y[i] <= PROT.H - PROT.R + 0.01)) out++;
  return { rows, eaten: P.eaten, hits: P.hits, out };
}

/* ---------------- step 7: substrate molecules in a sample of pellet 2 ---------------- */
export const ASSAY = {
  W: 260, H: 224, N: 24, R: 4.5, RE: 6,                    /* the window; the substrate molecules, their radius; an enzyme's reach */
  TAU: 0.4, S: 60, END: 6, IN: 0.6,                      /* friction time, speed, a measurement in seconds; the substrate is added in the first IN seconds */
  LYS: [[62, 142, 22], [150, 102, 22], [215, 50, 19]],   /* the lysosomes: x, y, radius (the third broke in the homogenizer) */
  MITO: [[70, 37, 34, 16], [205, 192, 31, 15]],          /* the mitochondria: x, y, half-width, half-height */
  ENZ: [[-0.38, -0.2], [0.32, -0.3], [0.02, 0.38]],      /* where a lysosome's three enzyme molecules are, in radii from its middle */
  SEED: { A: 9, B: 9 }
};
/* where each enzyme molecule is: inside its lysosome (spread 0), or away from a broken one (js/fractionation/view.js
   draws them with the same numbers) */
export const enzymeAt = (l, i, spread) => { const [x, y, r] = ASSAY.LYS[l], [ex, ey] = ASSAY.ENZ[i], k = 1 + spread * (2.6 + i * 0.9); return [x + ex * r * k, y + ey * r * k]; };
export const LEAK = 0.6;      /* how far the enzymes of the lysosome that broke in the homogenizer have spread */

export function makeAssay(which, seed) {
  const C = ASSAY, rnd = rng(seed == null ? C.SEED[which] : seed), g = bell(rnd), n = C.N, open = which === 'B', M = C.R + 4;   /* (M: how near a molecule's middle comes to the window's edge) */
  /* the membranes a substrate molecule cannot cross: whole lysosomes (and every mitochondrion, whole or not: its
     enzyme is not there) */
  const walls = C.LYS.filter((_, l) => !open && l !== 2).map(([x, y, r]) => [x, y, r + C.R, r + C.R]).concat(open ? [] : C.MITO.map(([x, y, a, b]) => [x, y, a + C.R, b + C.R]));
  const free = []; C.LYS.forEach((_, l) => { if (open || l === 2) for (let i = 0; i < 3; i++) free.push(enzymeAt(l, i, open ? 1 : LEAK)); });
  const x = new Float64Array(n), y = new Float64Array(n), vx = new Float64Array(n), vy = new Float64Array(n), prod = new Uint8Array(n), when = new Float64Array(n);
  const hit = (px, py, w, k = 1) => { const dx = (px - w[0]) / (w[2] * k), dy = (py - w[1]) / (w[3] * k); return dx * dx + dy * dy; };
  for (let i = 0; i < n; i++) {
    let best = null, bd = -1;
    for (let k = 0; k < 60; k++) {
      const px = M + 3 + rnd() * (C.W - 2 * M - 6), py = M + 3 + rnd() * (C.H - 2 * M - 6);
      /* (clear of every organelle of the sample, whole or broken, and of every enzyme molecule: both samples start alike) */
      if (C.LYS.some(([lx, ly, r]) => hit(px, py, [lx, ly, r + C.R + 6, r + C.R + 6]) < 1) || C.MITO.some(([mx, my, a, b]) => hit(px, py, [mx, my, a + C.R + 4, b + C.R + 4]) < 1)) continue;
      if ([0, 1, 2].some(l => [0, 1, 2].some(e => { const q = enzymeAt(l, e, 1), q2 = enzymeAt(l, e, LEAK); return Math.hypot(px - q[0], py - q[1]) < 22 || Math.hypot(px - q2[0], py - q2[1]) < 22; }))) continue;
      let d = 1e9; for (let j = 0; j < i; j++) { const dx = px - x[j], dy = py - y[j]; d = Math.min(d, Math.sqrt(dx * dx + dy * dy)); }
      if (d > bd) { bd = d; best = [px, py]; }
    }
    x[i] = best[0]; y[i] = best[1]; vx[i] = C.S * g(); vy[i] = C.S * g();
  }
  let steps = 0, made = 0;
  const kk = Math.sqrt(2 * DT / C.TAU), damp = 1 - DT / C.TAU, reach = (C.R + C.RE) * (C.R + C.RE);
  function one() {
    for (let i = 0; i < n; i++) {
      vx[i] = vx[i] * damp + C.S * kk * g(); vy[i] = vy[i] * damp + C.S * kk * g();
      x[i] += vx[i] * DT; y[i] += vy[i] * DT;
      if (x[i] < M) { x[i] = M; if (vx[i] < 0) vx[i] = -vx[i]; } else if (x[i] > C.W - M) { x[i] = C.W - M; if (vx[i] > 0) vx[i] = -vx[i]; }
      if (y[i] < M) { y[i] = M; if (vy[i] < 0) vy[i] = -vy[i]; } else if (y[i] > C.H - M) { y[i] = C.H - M; if (vy[i] > 0) vy[i] = -vy[i]; }
      for (const w of walls) {
        const e = hit(x[i], y[i], w); if (e >= 1) continue;
        const k = 1 / Math.sqrt(e > 1e-9 ? e : 1e-9); x[i] = w[0] + (x[i] - w[0]) * k; y[i] = w[1] + (y[i] - w[1]) * k;
        let nx = (x[i] - w[0]) / (w[2] * w[2]), ny = (y[i] - w[1]) / (w[3] * w[3]); const nl = Math.sqrt(nx * nx + ny * ny) || 1; nx /= nl; ny /= nl;
        const vn = vx[i] * nx + vy[i] * ny; if (vn < 0) { vx[i] -= 2 * vn * nx; vy[i] -= 2 * vn * ny; }
      }
      if (!prod[i] && (steps + 1) * DT >= C.IN) for (const q of free) { const dx = x[i] - q[0], dy = y[i] - q[1]; if (dx * dx + dy * dy < reach) { prod[i] = 1; when[i] = (steps + 1) * DT; made++; break; } }
    }
    steps++;
  }
  return {
    which, n, x, y, prod, when, free, walls,
    get t() { return steps * DT; }, get made() { return made; },
    to(t) { const want = Math.round(Math.min(t, C.END) / DT); while (steps < want) one(); return this; },
    /* for the check: a substrate molecule inside a whole membrane (never) */
    inside() { let c = 0; for (let i = 0; i < n; i++) for (const w of walls) if (hit(x[i], y[i], w) < 0.94) c++; return c; }
  };
}
export function assayCheck(which, seed) {
  const A = makeAssay(which, seed), rows = []; let inside = 0;
  for (let s = 1; s <= ASSAY.END; s++) { for (let k = 1; k <= 6; k++) { A.to(s - 1 + k / 6); inside += A.inside(); } rows.push({ s, made: A.made }); }
  return { rows, made: A.made, inside, free: A.free.length };
}
