/* ============================================================
   liquid.js — the two solutions of the water-potential view as liquids (17 Nov 2026; Daniel's rule for the IB views:
   teach on the picture, a process as many molecules that move at random, the crossings counted both ways, as the way
   in does: js/game/wayflow.js; and his rule for every picture of particles, memory particle-model-in-diagrams: in a
   liquid the particles touch and slide past each other, never dots with space between them).
   So this is a small real liquid, in numbers only (the page draws it: scenes.js; the check runs it: tools/water-check):
   - water molecules (discs, radius 1) and solute particles (radius RS) that push each other apart when they touch
     and have no other force between them; each keeps a random thermal movement (a velocity that changes a little at
     random every step, and friction): no molecule is steered anywhere;
   - two boxes of the same width, side by side, with a membrane of thickness T between them. The membrane has pores:
     a pore is wide enough for water molecules in single file and too narrow for a solute particle;
   - each box is open at the top: its surface is a lid that presses down with ONE pressure, the same on both boxes,
     and moves as the liquid under it pushes back. So a box that gains water molecules gets taller, as a real
     solution's level rises. Both boxes start at the same height H0: the same volume (the numbers of MIX were found by
     measuring each mixture's pressure at that volume, so each is at rest there);
   - a crossing is counted when a water molecule that entered a pore from one box leaves it into the other box.
   What comes out is not put in: more water molecules cross towards the box with more solute particles, because
   there fewer of the particles that reach a pore are water molecules. Over many runs the two counts are about as
   1.6 to 1 between 'lo' and 'mid', 1.7 to 1 between 'mid' and 'hi' and 2 to 1 between 'lo' and 'hi', and equal
   between two boxes of the same mixture (liquidCheck; tools/water-check.mjs --only numbers). Osmosis depends on the NUMBER of solute particles in a volume, so a clear difference needs many
   of them: 'hi' is a very concentrated solution.
   The random numbers are fixed (a seed for each run, RUNS): the run a pupil watches is the run the check counted,
   second by second, on every computer. For that the simulation uses only + − × ÷ and square roots (a browser may
   round a sine or a logarithm differently from another; these it may not).
   Units: 1 = the radius of a water molecule (drawn about 0.14 nm × many: not to scale); time in seconds of the
   simulation, of which the page shows SPEED a second.
   ============================================================ */
export const LIQ = {
  WB: 40, H0: 40, T: 6, RS: 1.6, PW: 1.3, PORES: 8, PY0: 3.4, PTOP: 0.78,   /* the boxes, the membrane, its pores (half-width PW) */
  K: 900, S: 3, TAU: 1, DT: 1 / 180, CAP: 0.15,                              /* stiffness of a touch, thermal speed, friction time, step, most a particle moves in a step */
  P0: 7.8, MU: 0.02, PRE: 4, SPEED: 2
};
/* [water molecules, solute particles] of one box of WB × H0 at the pressure P0 */
export const MIX = { lo: [288, 8], mid: [187, 56], hi: [83, 105] };
/* a mixture of a run: its name in MIX, or its own [water molecules, solute particles] (the cell fractionation lab's pure
   water, js/fractionation/osmosis.js: no solute particle at all) */
const mixOf = m => (Array.isArray(m) ? m : MIX[m]);
/* the runs of the page: the left box, the right box, the seed (chosen by liquidCheck: tools/water-check.mjs --only
   numbers) and the two water molecules the picture follows: `hero` crosses towards the more concentrated solution in
   the first seconds, `hero2` crosses the other way later in the minute (the science read, 17 Nov 2026: with only the
   first, a pupil concludes that each molecule is pulled towards the solute) */
export const RUNS = {
  osmosis: { L: 'lo', R: 'hi', seed: 5, hero: 185, hero2: 14 },
  hypo: { L: 'mid', R: 'lo', seed: 19, hero: 359, hero2: 285 },
  iso: { L: 'mid', R: 'mid', seed: 278, hero: 390, hero2: 392 },
  hyper: { L: 'mid', R: 'hi', seed: 9, hero: 88, hero2: 75 }
};

const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

export function makeLiquid(run, seed) {
  const R = typeof run === 'string' ? RUNS[run] : run, C = LIQ;
  const rnd = rng(seed == null ? R.seed : seed), g = () => (rnd() + rnd() + rnd() + rnd() - 2) * 1.7320508075688772;   /* about a bell curve, spread 1 */
  const [nwL, nsL] = mixOf(R.L), [nwR, nsR] = mixOf(R.R), NF = Math.floor((C.T - 0.2) / 2), N = nwL + nsL + nwR + nsR + NF * C.PORES;
  const x = new Float64Array(N), y = new Float64Array(N), vx = new Float64Array(N), vy = new Float64Array(N), fx = new Float64Array(N), fy = new Float64Array(N);
  const rad = new Float64Array(N), sol = new Uint8Array(N), side = new Int8Array(N), home = new Int8Array(N);
  const hT = C.T / 2, py = Array.from({ length: C.PORES }, (_, k) => C.PY0 + k * ((C.H0 * C.PTOP - C.PY0) / (C.PORES - 1)));
  /* the solid parts of the membrane, between the pores: [from y, to y] */
  const blocks = []; { let a = -60; py.forEach(p => { blocks.push([a, p - C.PW]); a = p + C.PW; }); blocks.push([a, 600]); }
  const h = [C.H0, C.H0], c = { LR: 0, RL: 0 };
  let open = false, mu = 0, t = 0, steps = 0, tau = 0.12;

  /* the start: in each box the solute particles spread out, the water molecules on a lattice between them */
  let n = 0;
  for (const [sd, nw, ns] of [[-1, nwL, nsL], [1, nwR, nsR]]) {
    const S = [];
    for (let i = 0; i < ns; i++) {
      let best = null, bd = -1;
      for (let k = 0; k < 30; k++) {
        const px = 2 + rnd() * (C.WB - 4), q = 2 + rnd() * (C.H0 - 4); let d = 2 * Math.min(px, C.WB - px, q, C.H0 - q);
        for (const s of S) { const dx = px - s[0], dy = q - s[1]; d = Math.min(d, Math.sqrt(dx * dx + dy * dy)); }
        if (d > bd) { bd = d; best = [px, q]; }
      }
      S.push(best);
    }
    for (const s of S) { x[n] = sd * (hT + s[0]); y[n] = s[1]; sol[n] = 1; rad[n] = C.RS; side[n] = home[n] = sd; n++; }
    const a = Math.sqrt(C.WB * C.H0 / (nw + ns * 1.6) / 0.866), sites = [], lim = (C.RS + 0.7) * (C.RS + 0.7);
    for (let j = 0; ; j++) {
      const yy = 1 + j * a * 0.866; if (yy > C.H0 - 0.9) break;
      for (let xx = 1 + (j % 2 ? a / 2 : 0); xx < C.WB - 0.9; xx += a) if (!S.some(s => (xx - s[0]) * (xx - s[0]) + (yy - s[1]) * (yy - s[1]) < lim)) sites.push([xx, yy]);
    }
    for (let i = sites.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)), q = sites[i]; sites[i] = sites[j]; sites[j] = q; }
    for (let i = 0; i < nw; i++) { const q = sites[i] || [1 + rnd() * (C.WB - 2), 1 + rnd() * (C.H0 - 2)]; x[n] = sd * (hT + q[0]); y[n] = q[1]; rad[n] = 1; side[n] = home[n] = sd; n++; }
  }
  /* each pore starts with its file of water molecules (side 0 until the pores open) */
  for (const p of py) for (let k = 0; k < NF; k++) { x[n] = NF === 1 ? 0 : -hT + 1.1 + k * ((C.T - 2.2) / (NF - 1)); y[n] = p; rad[n] = 1; side[n] = home[n] = 0; n++; }
  for (let i = 0; i < N; i++) { const s = sol[i] ? C.S / C.RS : C.S; vx[i] = s * g(); vy[i] = s * g(); }

  /* who is near whom: a grid of cells a little wider than two solute particles */
  const CELL = 3.5, X0 = -(C.WB + hT + 4), GX = Math.ceil((2 * C.WB + C.T + 8) / CELL), GY = Math.ceil(C.H0 * 1.7 / CELL), head = new Int32Array(GX * GY), next = new Int32Array(N);
  const K = C.K, DT = C.DT;
  function one() {
    fx.fill(0); fy.fill(0); head.fill(-1);
    for (let i = 0; i < N; i++) {
      let cx = Math.floor((x[i] - X0) / CELL), cy = Math.floor((y[i] + 2) / CELL);
      if (cx < 0) cx = 0; else if (cx >= GX) cx = GX - 1; if (cy < 0) cy = 0; else if (cy >= GY) cy = GY - 1;
      const q = cx + cy * GX; next[i] = head[q]; head[q] = i;
    }
    /* two particles that overlap push each other apart */
    for (let cy = 0; cy < GY; cy++) for (let cx = 0; cx < GX; cx++) for (let i = head[cx + cy * GX]; i >= 0; i = next[i]) for (let d = 0; d < 5; d++) {
      const nx = cx + (d === 0 ? 0 : d === 1 ? 1 : d - 3), ny = cy + (d < 2 ? 0 : 1); if (nx < 0 || nx >= GX || ny >= GY) continue;
      for (let j = d === 0 ? next[i] : head[nx + ny * GX]; j >= 0; j = next[j]) {
        const dx = x[j] - x[i], dy = y[j] - y[i], R = rad[i] + rad[j], d2 = dx * dx + dy * dy;
        if (d2 >= R * R || d2 < 1e-12) continue;
        const dd = Math.sqrt(d2), f = K * (R - dd) / dd, ax = f * dx, ay = f * dy; fx[i] -= ax; fy[i] -= ay; fx[j] += ax; fy[j] += ay;
      }
    }
    let pL = 0, pR = 0;
    for (let i = 0; i < N; i++) {
      const ri = rad[i], inP = x[i] > -hT && x[i] < hT, sd = x[i] < 0 ? 0 : 1;
      if (y[i] < ri) fy[i] += K * (ri - y[i]);                                               /* the floor */
      if (!inP) { const ov = y[i] + ri - h[sd]; if (ov > 0) { fy[i] -= K * ov; if (sd) pR += K * ov; else pL += K * ov; } }   /* the surface */
      const ax = x[i] < 0 ? -x[i] : x[i], out = ax + ri - (hT + C.WB); if (out > 0) fx[i] -= (x[i] < 0 ? -1 : 1) * K * out;  /* the outer wall */
      if (ax >= hT + ri) continue;
      /* the membrane: a solid wall to a solute particle (and to every particle of a box until the pores open) */
      if (sol[i] || (!open && home[i])) { const pen = hT + ri - home[i] * x[i]; if (pen > 0) fx[i] += home[i] * K * pen; continue; }
      if (!open) { const lim = hT - ri; if (x[i] > lim) fx[i] -= K * (x[i] - lim); else if (x[i] < -lim) fx[i] += K * (-lim - x[i]); }   /* a file waits in its pore */
      for (let b = 0; b < blocks.length; b++) {
        const b0 = blocks[b][0], b1 = blocks[b][1]; if (y[i] < b0 - ri || y[i] > b1 + ri) continue;
        const qx = x[i] < -hT ? -hT : x[i] > hT ? hT : x[i], qy = y[i] < b0 ? b0 : y[i] > b1 ? b1 : y[i], dx = x[i] - qx, dy = y[i] - qy, d2 = dx * dx + dy * dy;
        if (d2 > 1e-12) { if (d2 < ri * ri) { const dd = Math.sqrt(d2), f = K * (ri - dd) / dd; fx[i] += f * dx; fy[i] += f * dy; } }
        else { const l = x[i] + hT, rr = hT - x[i], dn = y[i] - b0, up = b1 - y[i];
          if (l <= rr && l <= dn && l <= up) fx[i] -= K * (l + ri); else if (rr <= dn && rr <= up) fx[i] += K * (rr + ri); else if (dn <= up) fy[i] -= K * (dn + ri); else fy[i] += K * (up + ri); }
      }
    }
    const kk = Math.sqrt(2 * DT / tau), damp = 1 - DT / tau, cap = C.CAP / DT;
    for (let i = 0; i < N; i++) {
      const m = sol[i] ? C.RS * C.RS : 1, s = sol[i] ? C.S / C.RS : C.S;
      let ux = vx[i] * damp + fx[i] / m * DT + s * kk * g(), uy = vy[i] * damp + fy[i] / m * DT + s * kk * g();
      if (ux > cap) ux = cap; else if (ux < -cap) ux = -cap; if (uy > cap) uy = cap; else if (uy < -cap) uy = -cap;
      vx[i] = ux; vy[i] = uy; x[i] += ux * DT; y[i] += uy * DT;
      if (open && !sol[i]) {
        if (x[i] > hT) { if (side[i] < 0) { c.LR++; last = i; } side[i] = 1; }
        else if (x[i] < -hT) { if (side[i] > 0) { c.RL++; last = i; } side[i] = -1; }
      }
    }
    lid[0] += pL; lid[1] += pR;
    h[0] += mu * (pL - C.P0 * C.WB) * DT; h[1] += mu * (pR - C.P0 * C.WB) * DT;
  }
  let last = -1; const lid = [0, 0];   /* (the push of each liquid on its surface, added up: the checks measure the pressure with it) */
  /* before the picture starts: the lids held at H0 and the pores shut, the first part with strong friction (the
     lattice settles into a liquid) */
  { const n0 = Math.round(C.PRE / DT); for (let i = 0; i < n0; i++) { if (i === Math.round(n0 * 0.4)) tau = C.TAU; one(); } }
  tau = C.TAU; open = true; mu = C.MU;
  /* a molecule already in a pore counts as coming from the box its half of the pore is on */
  for (let i = 0; i < N; i++) if (!home[i]) side[i] = x[i] < 0 ? -1 : 1;
  return {
    N, x, y, rad, sol, side, home, h, c, py, blocks, NF, lid, run: R,
    get t() { return t; }, get steps() { return steps; }, get last() { return last; },
    step(k = 1) { for (let i = 0; i < k; i++) { one(); steps++; } t = steps * DT; },
    /* for the checks: where everything is */
    state() {
      const o = { water: [0, 0], solute: [0, 0], pore: 0, moved: 0, out: 0, deep: 0 };
      for (let i = 0; i < N; i++) {
        const inP = x[i] > -hT && x[i] < hT, sd = x[i] < 0 ? 0 : 1;
        if (sol[i]) { o.solute[sd]++; if (home[i] * x[i] < hT + rad[i] - 0.5) o.moved++; }
        else if (inP) o.pore++; else o.water[sd]++;
        if (!(y[i] > -0.6) || !(y[i] < h[sd] + 1.2 || inP) || !(Math.abs(x[i]) < hT + C.WB + 0.6)) o.out++;
        if (!sol[i] && inP && !py.some(p => Math.abs(y[i] - p) < C.PW)) o.deep++;
      }
      return o;
    }
  };
}

/* a run, second by second of the page's time (SPEED seconds of the simulation each): the counts, the two levels, and
   what must be true at every moment (no solute particle through the membrane, nothing out of its box, no water inside
   the solid part of the membrane). `with` = towards the box with more solute particles (the right one, or the left). */
export function liquidCheck(run, seed, secs = 60) {
  const R = typeof run === 'string' ? RUNS[run] : run, L = makeLiquid(R, seed), per = Math.round(LIQ.SPEED / LIQ.DT);
  const [, sL] = mixOf(R.L), [, sR] = mixOf(R.R), dir = sR > sL ? 1 : sR < sL ? -1 : 0, rows = [];
  let wrong = 0, bad = 0, hero = -1, heroAt = 0, hero2 = -1, hero2At = 0; const s0 = L.state();
  for (let s = 1; s <= secs; s++) {
    for (let k = 0; k < 6; k++) { const b = L.c.LR + L.c.RL; L.step(per / 6); const q = L.state();
      if (q.solute[0] !== s0.solute[0] || q.solute[1] !== s0.solute[1] || q.moved || q.out || q.deep) bad++;
      /* the molecule that has just crossed (one that started in a box, not in a pore): the first with the net movement
         (in the isotonic run: the first), then the first the other way */
      if (L.c.LR + L.c.RL > b && L.last >= 0 && L.home[L.last] && s >= 4) {
        const to = L.side[L.last], w = dir ? to === dir : hero < 0;
        if (hero < 0 && w && s <= 25) { hero = L.last; heroAt = s; }
        else if (hero >= 0 && hero2 < 0 && L.last !== hero && (dir ? to === -dir : to !== L.side[hero])) { hero2 = L.last; hero2At = s; }
      } }
    const a = dir >= 0 ? L.c.LR : L.c.RL, b = dir >= 0 ? L.c.RL : L.c.LR;
    if (dir) { if (b > a || (s >= 6 && a - b < 2) || (s >= 20 && a < 1.5 * b)) wrong++; }
    else if (Math.abs(a - b) > 3 || (s >= 30 && a + b < 12) || (s === secs && Math.abs(a - b) > 2)) wrong++;
    rows.push({ s, with: a, against: b, h: [L.h[0], L.h[1]] });
  }
  return { wrong, bad, rows, hero, heroAt, hero2, hero2At, total: rows[rows.length - 1], start: s0, end: L.state(), n: L.N };
}
