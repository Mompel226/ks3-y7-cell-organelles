/* ============================================================
   sim.js — the model behind the membrane view (13 Nov 2026): one patch of animal plasma membrane, 26 nm × 18 nm, as
   numbers only (no drawing here, so the check tool and node can run it).
   Daniel, 13 Nov 2026: "show that the phospholipids move within their own layer, and so that actually proteins can
   migrate ... how the cell membrane probably looks like and moves like in reality".

   WHAT IT IS. Each lipid is a soft disc in the plane of its own layer (x across, z towards the viewer). A disc has a
   random velocity that changes smoothly (so nothing ever jumps), and discs that overlap push each other apart. In a
   layer this crowded a lipid rattles between its neighbours and now and then changes places with one: that is how a
   real lipid moves sideways (lateral diffusion). A lipid has NO way to the other layer in this model: at the picture's
   speed one crossing (flip-flop) would take over a thousand years (see NUMBERS).
   Proteins are bigger discs with a random path of their own, 6 times less diffusion than the phospholipids; the lipids
   make way for them (the proteins are not pushed back by single lipids: their path already is the sum of such pushes).
   The patch has edges, where molecules turn back (a real membrane goes on).

   NUMBERS, and where they come from (nm, seconds of the picture):
   - phospholipids about 0.8 nm apart, 0.6 nm² each; cholesterol 1 lipid molecule in 3 (animal plasma membrane 30–40 %:
     van Meer, Voelker and Feigenson 2008, Nat Rev Mol Cell Biol 9:112; Ingólfsson et al. 2014, JACS 136:14554);
   - real sideways movement of a phospholipid: diffusion coefficient about 1 µm² s⁻¹ = 1,000,000 nm² s⁻¹ (Alberts et al.
     2002, Molecular Biology of the Cell, 4th ed., "The Lipid Bilayer"; Phillips 2018, arXiv:1703.02066). Here 0.25 nm²
     s⁻¹ (LIPID_D, from the mean squared displacement over 20 s): slowed 4 million times (SLOW);
   - proteins: 6 times less (RATIO): in rat kidney cells a phospholipid 0.42 and the transferrin receptor 0.070 µm² s⁻¹
     (Fujiwara et al. 2002, J Cell Biol 157:1071); in cells generally 5 to 50 times less (Phillips 2018, table 2);
   - flip-flop of a phospholipid: hours to days (van Meer et al. 2008; Kornberg and McConnell 1971, Biochemistry
     10:1111). 6 hours × 4 million = 2,700 years of the picture.
   The noise strengths D0 and PROT_D below were fitted in node (10 seeds × 600 s of the model, then checked on 10 other
   seeds) so that the phospholipids' mean squared displacement over 20 s is 4 × LIPID_D × 20 = 20 nm² and the proteins'
   is one sixth of that (the patch's edges and the other proteins hold a protein back a little, so PROT_D is larger than
   LIPID_D / RATIO). tools/membrane-check.mjs measures both again in the browser.
   ============================================================ */
export const P = {
  W: 26, D: 18,                 /* the patch, nm: x from -13 to 13, z from -9 (back) to 9 (the cut face at the front) */
  PL_R: 0.38, CH_R: 0.26,       /* a phospholipid's and a cholesterol's radius in the plane of the layer */
  N_PL: 552, N_CH: 276,         /* in EACH layer: 1 lipid molecule in 3 is cholesterol */
  N_GLYCO: 10,                  /* phospholipid places of the outer layer that carry a short carbohydrate chain (glycolipids) */
  DT: 1 / 60,                   /* one step of the model, s */
  TAU: 0.4,                     /* how long a lipid's random velocity lasts, s */
  D0: 0.90,                     /* the lipids' noise (free diffusion, nm² s⁻¹): fitted, see the header */
  PUSH: 18,                     /* how fast two overlapping discs part, s⁻¹ */
  LIPID_D: 0.25,                /* the phospholipids' apparent diffusion coefficient on screen, nm² s⁻¹ */
  REAL_D: 1e6,                  /* a real phospholipid's, nm² s⁻¹ (1 µm² s⁻¹) */
  RATIO: 6,                     /* phospholipid diffusion : protein diffusion */
  PROT_D: 0.0555,               /* the proteins' noise: fitted so that their mean squared displacement over 20 s is LIPID's / RATIO */
  TAU_P: 1.5, D_ROT: 0.02, TAU_R: 1.5,
  LAG: 20                       /* the time over which the two are compared, s */
};
P.SLOW = P.REAL_D / P.LIPID_D;                    /* 4,000,000 */
P.FLIP_YEARS = 6 * 3600 * P.SLOW / (365.25 * 86400);   /* a 6-hour flip-flop at the picture's speed, in years */

/* the proteins: where each starts, its radius inside the bilayer (R: lipids of both layers keep out), and how far the
   peripheral one may go from the cut face (so that it stays in view under the membrane's front edge) */
export const PROTEINS = [
  { id: 'channel', R: 3.0, x: -7.2, z: -1.6, integral: true },
  { id: 'carrier', R: 2.5, x: 1.2, z: 3.2, integral: true },
  { id: 'glyco', R: 0.9, x: 8.2, z: -2.8, integral: true, top: 1.9 },   /* top: its part outside the cell, as wide as this: glycolipids keep out */
  { id: 'peripheral', R: 0, x: 6.2, z: 6.3, integral: false, body: 1.7, zMin: 4.6 }
];

const mulberry = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

export function makeSim(seed = 7) {
  const R = mulberry(seed);
  let spare = null;
  const gauss = () => {
    if (spare != null) { const g = spare; spare = null; return g; }
    let u = 0; while (u < 1e-12) u = R();
    const m = Math.sqrt(-2 * Math.log(u)), a = 6.283185307179586 * R();
    spare = m * Math.sin(a); return m * Math.cos(a);
  };
  const HW = P.W / 2, HD = P.D / 2, PER = P.N_PL + P.N_CH, N = PER * 2;
  const x = new Float32Array(N), z = new Float32Array(N), vx = new Float32Array(N), vz = new Float32Array(N);
  const fx = new Float32Array(N), fz = new Float32Array(N), rad = new Float32Array(N);
  const layer = new Uint8Array(N);      /* 0: the outer layer (up, outside the cell); 1: the inner layer (down, cytoplasm). NEVER changed. */
  const kind = new Uint8Array(N);       /* 0 phospholipid, 1 cholesterol, 2 glycolipid */
  const phase = new Float32Array(N), spin = new Float32Array(N), turn0 = new Float32Array(N);
  const kink = new Uint8Array(N);       /* a phospholipid's second tail: 1 = unsaturated (bent), 0 = saturated (straight) */
  const prot = PROTEINS.map(p => Object.assign({ vx: 0, vz: 0, ang: R() * 6.283, w: 0 }, p));

  /* ---- where each lipid starts: a hexagonal lattice with the proteins' places left out, kinds at random ---- */
  for (let L = 0; L < 2; L++) {
    const sites = [], a = 0.708;
    for (let row = 0, zz = -HD + 0.42; zz < HD - 0.4; row++, zz += a * 0.866) {
      for (let xx = -HW + 0.42 + (row % 2) * a / 2; xx < HW - 0.4; xx += a) {
        if (prot.some(p => p.R && Math.hypot(xx - p.x, zz - p.z) < p.R + 0.3)) continue;
        sites.push([xx, zz]);
      }
    }
    if (sites.length < PER) throw new Error('membrane sim: ' + sites.length + ' places for ' + PER + ' lipids');
    for (let i = sites.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = sites[i]; sites[i] = sites[j]; sites[j] = t; }
    for (let k = 0; k < PER; k++) {
      const i = L * PER + k;
      x[i] = sites[k][0]; z[i] = sites[k][1]; layer[i] = L;
      kind[i] = k < P.N_CH ? 1 : 0; rad[i] = kind[i] === 1 ? P.CH_R : P.PL_R;
      phase[i] = R() * 6.283; spin[i] = (R() < 0.5 ? -1 : 1) * (0.25 + R() * 0.5); turn0[i] = R() * 6.283;
      kink[i] = R() < 0.72 ? 1 : 0;
    }
  }
  /* glycolipids: outer layer only (the carbohydrate is always on the side outside the cell), away from the glycoprotein */
  for (let made = 0, i = P.N_CH; made < P.N_GLYCO && i < PER; i += 41) {
    const g = prot[2]; if (Math.hypot(x[i] - g.x, z[i] - g.z) < g.top + 1) continue;
    kind[i] = 2; made++;
  }

  /* ---- the grid that finds neighbours (one per layer; nothing is allocated while the model runs) ---- */
  const CELL = 0.8, GX = Math.ceil(P.W / CELL), GZ = Math.ceil(P.D / CELL), cells = GX * GZ;
  const head = new Int32Array(cells * 2), next = new Int32Array(N);
  const S = { P, N, PER, x, z, layer, kind, rad, phase, spin, turn0, kink, prot, t: 0, steps: 0 };
  const sNoise = Math.sqrt(2 * P.D0 * P.DT) / P.TAU, kv = P.DT / P.TAU;
  const sP = Math.sqrt(2 * P.PROT_D * P.DT) / P.TAU_P, kP = P.DT / P.TAU_P, sR = Math.sqrt(2 * P.D_ROT * P.DT) / P.TAU_R, kR = P.DT / P.TAU_R;

  function step() {
    const dt = P.DT, push = P.PUSH * dt * 0.5;
    /* the proteins first: a smooth random path, the patch's edges, and each other */
    for (let a = 0; a < prot.length; a++) {
      const p = prot[a];
      p.vx += -p.vx * kP + sP * gauss(); p.vz += -p.vz * kP + sP * gauss();
      p.w += -p.w * kR + sR * gauss();
      p.x += p.vx * dt; p.z += p.vz * dt; p.ang += p.w * dt;
    }
    for (let a = 0; a < prot.length; a++) for (let b = a + 1; b < prot.length; b++) {
      const p = prot[a], q = prot[b];
      /* two integral proteins keep a ring of lipids between them; the peripheral one keeps clear of their parts below the membrane */
      const d = (p.integral && q.integral) ? p.R + q.R + 0.9 : (p.R || p.body) + (q.R || q.body) + 0.2;
      const dx = q.x - p.x, dz = q.z - p.z, r = Math.hypot(dx, dz);
      if (r < d && r > 1e-6) { const m = (d - r) * 0.5 * Math.min(1, P.PUSH * dt * 2) / r; p.x -= dx * m; p.z -= dz * m; q.x += dx * m; q.z += dz * m; }
    }
    for (let a = 0; a < prot.length; a++) {
      const p = prot[a], e = (p.R || p.body) + 0.35, z0 = p.zMin != null ? p.zMin : -HD + e;
      if (p.x < -HW + e) { p.x = -HW + e; if (p.vx < 0) p.vx = -p.vx; } else if (p.x > HW - e) { p.x = HW - e; if (p.vx > 0) p.vx = -p.vx; }
      if (p.z < z0) { p.z = z0; if (p.vz < 0) p.vz = -p.vz; } else if (p.z > HD - e) { p.z = HD - e; if (p.vz > 0) p.vz = -p.vz; }
    }
    /* the lipids: each one's random velocity changes a little */
    head.fill(-1);
    for (let i = 0; i < N; i++) {
      vx[i] += -vx[i] * kv + sNoise * gauss(); vz[i] += -vz[i] * kv + sNoise * gauss();
      fx[i] = 0; fz[i] = 0;
      let cx = Math.floor((x[i] + HW) / CELL), cz = Math.floor((z[i] + HD) / CELL);
      cx = cx < 0 ? 0 : cx >= GX ? GX - 1 : cx; cz = cz < 0 ? 0 : cz >= GZ ? GZ - 1 : cz;
      const c = layer[i] * cells + cz * GX + cx; next[i] = head[c]; head[c] = i;
    }
    /* two discs of one layer that overlap move apart (the same push on both) */
    for (let L = 0; L < 2; L++) for (let cz = 0; cz < GZ; cz++) for (let cx = 0; cx < GX; cx++) {
      const c = L * cells + cz * GX + cx;
      for (let i = head[c]; i >= 0; i = next[i]) {
        for (let j = next[i]; j >= 0; j = next[j]) pair(i, j, push);
        if (cx + 1 < GX) for (let j = head[c + 1]; j >= 0; j = next[j]) pair(i, j, push);
        if (cz + 1 < GZ) {
          const c2 = c + GX;
          for (let j = head[c2]; j >= 0; j = next[j]) pair(i, j, push);
          if (cx + 1 < GX) for (let j = head[c2 + 1]; j >= 0; j = next[j]) pair(i, j, push);
          if (cx > 0) for (let j = head[c2 - 1]; j >= 0; j = next[j]) pair(i, j, push);
        }
      }
    }
    /* lipids make way for the proteins, and turn back at the patch's edges */
    const pp = Math.min(1, P.PUSH * dt * 2);
    for (let i = 0; i < N; i++) {
      for (let a = 0; a < prot.length; a++) {
        const p = prot[a];
        let d = p.R ? p.R + rad[i] : 0;
        if (p.top && kind[i] === 2) d = p.top + 0.3;       /* a glycolipid's chain keeps clear of the glycoprotein's part outside the cell */
        if (!d) continue;
        const dx = x[i] - p.x, dz = z[i] - p.z, r2 = dx * dx + dz * dz;
        if (r2 < d * d) { const r = Math.sqrt(r2) || 1e-4, m = (d - r) * pp / r; fx[i] += dx * m; fz[i] += dz * m; }
      }
      let nx = x[i] + vx[i] * dt + fx[i], nz = z[i] + vz[i] * dt + fz[i];
      const e = rad[i];
      if (nx < -HW + e) { nx = -HW + e; if (vx[i] < 0) vx[i] = -vx[i]; } else if (nx > HW - e) { nx = HW - e; if (vx[i] > 0) vx[i] = -vx[i]; }
      if (nz < -HD + e) { nz = -HD + e; if (vz[i] < 0) vz[i] = -vz[i]; } else if (nz > HD - e) { nz = HD - e; if (vz[i] > 0) vz[i] = -vz[i]; }
      x[i] = nx; z[i] = nz;
    }
    S.t += dt; S.steps++;
  }
  function pair(i, j, push) {
    const dx = x[j] - x[i], dz = z[j] - z[i], d = rad[i] + rad[j], r2 = dx * dx + dz * dz;
    if (r2 >= d * d) return;
    const r = Math.sqrt(r2) || 1e-4, m = (d - r) * push / r;
    fx[i] -= dx * m; fz[i] -= dz * m; fx[j] += dx * m; fz[j] += dz * m;
  }
  S.step = step;
  S.advance = seconds => { const n = Math.round(seconds / P.DT); for (let k = 0; k < n; k++) step(); };
  /* the lipids settle from their lattice before anything is shown (the first picture is already a fluid) */
  for (let k = 0; k < 360; k++) step();
  S.t = 0; S.steps = 0;
  return S;
}
