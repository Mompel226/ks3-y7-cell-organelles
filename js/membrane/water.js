/* ============================================================
   water.js — the water of the membrane view's step 9, as numbers only (no drawing here: scene.js draws it,
   tools/membrane-check.mjs and node run it). First version 16 Nov 2026: the water inside the aquaporin's four pores, each
   file moving at random, and two molecules that crossed the bilayer. No solutes, no net movement.

   17 Nov 2026: OSMOSIS, as the guide asks it explained (B2.1.5: "an explanation in terms of random movement of
   particles, impermeability of membranes to solutes and differences in solute concentration"), by the method of the
   game's way in (js/game/wayflow.js; memory teach-on-the-picture: a process shown as a population):
   - MANY water molecules on each side of the membrane, each on a random walk (its velocity changes a little at random
     every step: it keeps its way for about half a second, never straight, never steered);
   - solute particles on both sides, MORE on one side (`mode`: 'out' outside the cell, 'cyt' in the cell), on the same
     kind of random walk. No solute ever crosses: at the membrane and at a pore's opening each one turns back;
   - a water molecule that wanders into the opening of a pore goes in. The pore holds one file of molecules (0.3 nm
     apart: "just large enough to accommodate a single water molecule", Agre 2003), so the file moves one place and the
     molecule at its other end leaves on the other side. Water crosses BOTH ways, by chance;
   - the two sides are equal volumes and hold the same number of drawn particles (memory
     concentration-pictures-equal-volumes): where there are more solute particles there are fewer water molecules, so
     fewer water molecules reach the pores from that side. More water therefore crosses TOWARDS the side with more solutes: the net movement the strip
     counts (view.js). No molecule is pushed or steered. (For a pore that holds one file, the rate of crossing from a
     side follows how often a water molecule, not a solute, is at its opening: Finkelstein 1987, Water Movement
     Through Lipid Bilayers, Pores, and Plasma Membranes, ch. 4.) The numbers are far from a cell's (text.js SIMPLE
     says so): there, about 1 particle in 200 is a solute, and the net movement is a small part of the crossings;
   - a few water molecules also cross between the phospholipids, far more slowly (CROSS_S seconds each): one place at
     each end of the cut face;
   - only some of the water is drawn (in a cell it fills both sides); each side of the picture keeps its number of
     drawn molecules, as a window into a larger solution does (a molecule may leave or come at the far edge, where it
     is drawn faded).
   Each mode's random numbers are fixed (SEED), and the water always starts together with its piece of membrane
   (sim.js restart: a glycolipid's chain turns a molecule aside, so the lipids' places matter), chosen by osmoCheck so
   that every second of a minute the count already
   says what osmosis does (a run with other numbers can, for a few seconds, show more crossing the other way: true,
   but misleading). The picture is slowed far more than the lipids (about 3 billion water molecules pass through one
   pore each second in a cell: Agre 2003); the page says only "much slower".
   With Reduce motion nothing moves: view.js shows one still, after STILL_S seconds of crossings.
   ============================================================ */
export const WATER = {
  SP: 0.3,                 /* nm between two molecules in a file (each about 0.3 nm across: the pore's narrowest is 0.28–0.31 nm) */
  YB: -2.3, SLOTS: 18,     /* a file: 18 places from y = -2.3 to 2.8 nm (the aquaporin: -2.4 to 3.1 nm) */
  HOP_S: 0.42,             /* seconds for a file to move one place */
  TOTAL: 70,               /* particles drawn on each side, water and solute together: equal volumes hold equal numbers */
  S: 1.25, TAU: 0.4,       /* a free water molecule: its speed each way (nm a second, on average) and how long it keeps its way (s) */
  SOL_HI: 34, SOL_LO: 4,   /* solute particles on the side with more of them, and on the other side */
  SOL_R: 0.25, SOL_S: 0.6, SOL_TAU: 0.6,   /* a solute particle: its radius (too wide for a pore), its speed, how long it keeps its way */
  RC: 0.6, RB: 1.15,       /* a water molecule within RC of an opening goes in; a solute particle within RB of it is in the way */
  CROSS_S: 30, RX: 0.85,   /* seconds for one crossing between the phospholipids; within RX of its place a molecule starts one */
  X: 8.6, YT: 6.4, YBOT: -6.4, ZT0: -0.2, ZB0: -0.2, Z1: 7.3,   /* the space the molecules are drawn in (nm): the same on both sides */
  FLOOR: 2.62, ROOF: -2.62, PROT_R: 3.6, PROT_TOP: 3.3,          /* how near the membrane a molecule's middle comes; over the aquaporin, its top */
  SOL_OVER: 4.95, SOL_UNDER: 3.85,                               /* a solute particle keeps this far from the middle above and under the aquaporin: seen from the camera it is then clear of the protein's outline (nearer, it looked INSIDE the see-through protein: the science read, 17 Nov 2026) */
  EDGE: 0.7,               /* a molecule is drawn faded within this of the far edge of its side */
  CLEAR: 1.3               /* a molecule that has left a pore (or the bilayer) moves this far from the membrane before it wanders again */
};
/* each mode's fixed random numbers (osmoCheck, node: the first of 1 … 300 whose every second of a minute says what
   osmosis does) */
export const SEED = { out: 39, cyt: 21 };
const DT = 1 / 60, FADE = 24;
const mulberry = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const smooth = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const hash = k => { let h = Math.imul(k | 0, 0x9E3779B1) ^ 0x85EBCA6B; h = Math.imul(h ^ h >>> 15, 0x2C1B3C6D); return ((h ^ h >>> 13) >>> 0) / 4294967296; };

/* S: the piece of membrane with the aquaporin (sim.js makeSim(…, AQP_PATCH)); A: its measured shape (aqp1.js);
   mode: where the solute concentration is higher ('out' or 'cyt'); seed: other random numbers (the checks) */
export function makeWater(S, A, mode = 'out', seed = null) {
  const W = WATER, R = mulberry(seed == null ? SEED[mode] : seed), aq = S.prot.find(p => p.id === 'aquaporin');
  let spare = null;
  const gauss = () => { if (spare != null) { const g = spare; spare = null; return g; } let u = 0; while (u < 1e-12) u = R(); const m = Math.sqrt(-2 * Math.log(u)), a = 6.283185307179586 * R(); spare = m * Math.sin(a); return m * Math.cos(a); };
  const pores = A.pores.map(pts => ({ pts, y0: pts[0][1], y1: pts[pts.length - 1][1] }));
  const ca = Math.cos(aq.ang), sa = Math.sin(aq.ang);
  /* the aquaporin's frame in the piece's frame (as scene.js turns its group, and view.js localOf) */
  const world = o => { const lx = o.x, lz = o.z; o.x = aq.x + lx * ca + lz * sa; o.z = aq.z - lx * sa + lz * ca; return o; };
  /* a point of pore i at height y, in the aquaporin's own frame: on the measured path; beyond its ends straight on,
     spreading sideways (by 0.3 nm for each nm) in the molecule's own direction (a): the wide ends of the "hourglass" */
  function poreAt(i, y, a, o) {
    const P = pores[i], pts = P.pts;
    let x, z, spread = 0;
    if (y <= P.y0) { x = pts[0][0]; z = pts[0][2]; spread = P.y0 - y; }
    else if (y >= P.y1) { x = pts[pts.length - 1][0]; z = pts[pts.length - 1][2]; spread = y - P.y1; }
    else { const f = (y - P.y0) / 0.1, j = Math.min(pts.length - 2, Math.floor(f)), u = f - j; x = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * u; z = pts[j][2] + (pts[j + 1][2] - pts[j][2]) * u; }
    o.x = x + 0.3 * spread * Math.cos(a); o.z = z + 0.3 * spread * Math.sin(a); return o;
  }
  const tmp = { x: 0, z: 0 };
  const TOPY = W.YB + (W.SLOTS - 1) * W.SP;      /* the highest place of a file */
  /* each pore's two openings (the piece's frame): where a water molecule goes in, and where a solute particle is in the way */
  const mouth = pores.map((P, i) => {
    const lo = world(poreAt(i, W.YB - 0.25, 0, { x: 0, z: 0 })), hi = world(poreAt(i, TOPY + 0.42, 0, { x: 0, z: 0 }));
    return { lo: { x: lo.x, y: W.YB - 0.35, z: lo.z }, hi: { x: hi.x, y: TOPY + 0.5, z: hi.z } };
  });

  /* ---- the molecules ---- */
  let ids = 0;
  const mol = [];      /* every water molecule: st 'free' | 'file' | 'in' (going into a file) | 'out' (leaving one) | 'cross' */
  const sol = [];      /* every solute particle */
  const c = { up: 0, down: 0, poreUp: 0, poreDown: 0, bilUp: 0, bilDown: 0, steps: 0, t: 0 };
  /* how low a molecule's middle may come on the outside (r: its radius; a solute particle, r > 0, keeps clear of the
     aquaporin's outline), and how high on the cytoplasm side */
  /* (water: over the protein itself; a solute particle: anywhere in the band of the picture that the protein stands in,
     in front of it too: a particle in front of the aquaporin, low over the heads, was seen ON it) */
  const over = (x, z, r) => r ? Math.abs(x - aq.x) < W.PROT_R + r + 0.3 : Math.hypot(x - aq.x, z - aq.z) < W.PROT_R;
  const floorAt = (x, z, r) => (over(x, z, r) ? (r ? W.SOL_OVER : W.PROT_TOP) : W.FLOOR) + r;
  const roofAt = (x, z, r) => r && over(x, z, r) ? -W.SOL_UNDER - r : W.ROOF - r;
  const z0 = side => side > 0 ? W.ZT0 : W.ZB0;
  function place(m, side, r, atEdge) {
    m.side = side;
    m.x = -W.X + 2 * W.X * R(); m.z = z0(side) + (W.Z1 - z0(side)) * R();
    if (side > 0) { const f = floorAt(m.x, m.z, r); m.y = atEdge ? W.YT - 0.05 : f + (W.YT - f) * R(); }
    else m.y = atEdge ? W.YBOT + 0.05 : W.YBOT + (roofAt(m.x, m.z, r) - W.YBOT) * R();
    return m;
  }
  function newWater(side, atEdge) {
    const m = place({ id: ids++, st: 'free', f: atEdge ? 0 : FADE, ax: gauss(), ay: gauss(), az: gauss(), roll: R() * 6.28 }, side, 0, atEdge);
    m.vx = gauss() * W.S; m.vy = atEdge ? -side * Math.abs(gauss()) * W.S : gauss() * W.S; m.vz = gauss() * W.S;
    mol.push(m); return m;
  }
  function newSolute(side, fade) {
    const m = place({ id: ids++, f: fade ? 0 : FADE, gone: 0 }, side, W.SOL_R, false);
    m.vx = gauss() * W.SOL_S; m.vy = gauss() * W.SOL_S; m.vz = gauss() * W.SOL_S;
    sol.push(m); return m;
  }
  /* each side: its solute particles, and the water molecules that fill the rest of its number (where there are more
     solute particles, fewer water molecules have room in the same volume) */
  const NS = side => (mode === 'out') === (side > 0) ? W.SOL_HI : W.SOL_LO, NW = side => W.TOTAL - NS(side);
  const TAG = { x0: -7.9, x1: -4.1, y0: 3.3, y1: 5.6, z0: 3.0 };
  let named = null;
  /* (never at an opening at the start: the first seconds must not begin with a solute in a pore's way by chance of the seed) */
  const nearMouth = (m, rr) => mouth.some(M => Math.hypot(m.x - M.lo.x, m.y - M.lo.y, m.z - M.lo.z) < rr || Math.hypot(m.x - M.hi.x, m.y - M.hi.y, m.z - M.hi.z) < rr);
  for (let s = -1; s <= 1; s += 2) {
    for (let k = 0; k < NW(s); k++) { const m = newWater(s, false); for (let t = 0; t < 30 && nearMouth(m, W.RC + 0.2); t++) place(m, s, 0, false); }
    for (let k = 0; k < NS(s); k++) {
      const q = newSolute(s, false);
      if (!named && (mode === 'out') === (s > 0)) { named = q; q.x = (TAG.x0 + TAG.x1) / 2; q.y = s * (TAG.y0 + TAG.y1) / 2; q.z = (TAG.z0 + W.Z1) / 2; }
    }
  }
  /* the four files: each place holds one molecule; `hop` while the file moves one place */
  const files = pores.map((P, i) => {
    const F = { i, m: [], hop: null, wob: 0, wv: 0, n: 0 };
    for (let j = 0; j < W.SLOTS; j++) { const m = { id: ids++, st: 'file', f: FADE, h: R(), roll: R() * 6.28, side: 0 }; F.m.push(m); mol.push(m); }
    return F;
  });
  /* the two places where a molecule crosses between the phospholipids: at the two ends of the cut face, a little in front
     of its lipids. Each begins with a molecule on its way (so the first picture, and the still of Reduce motion, show one) */
  const HW = S.P.W / 2, HD = S.P.D / 2, CA = 2.85;
  const sites = [{ x: HW - 0.55, z: HD - 0.12, m: null, dir: -1, u: 0.34 }, { x: -(HW - 0.55), z: HD - 0.12, m: null, dir: 1, u: 0.58 }];
  sites.forEach(s => { s.m = { id: ids++, st: 'cross', f: FADE, ax: gauss(), ay: gauss(), az: gauss(), roll: R() * 6.28, side: 0 }; mol.push(s.m); });

  /* is a solute particle at this opening (in the way)? */
  const blocked = p => { for (const q of sol) if (!q.gone && q.f > FADE / 2 && Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z) < W.RB) return true; return false; };
  const count = side => { let n = 0; for (const m of mol) if (m.st === 'free' && m.side === side && !m.leave) n++; return n; };

  function walk(m, s, tau, r) {
    const k = DT / tau, sg = s * Math.sqrt(2 * DT / tau);
    m.vx += -m.vx * k + sg * gauss(); m.vy += -m.vy * k + sg * gauss(); m.vz += -m.vz * k + sg * gauss();
    const px = m.x, pz = m.z;
    m.x += m.vx * DT; m.y += m.vy * DT; m.z += m.vz * DT;
    if (m.x < -W.X) { m.x = -2 * W.X - m.x; m.vx = -m.vx; } else if (m.x > W.X) { m.x = 2 * W.X - m.x; m.vx = -m.vx; }
    const zz = z0(m.side);
    if (m.z < zz) { m.z = 2 * zz - m.z; m.vz = -m.vz; } else if (m.z > W.Z1) { m.z = 2 * W.Z1 - m.z; m.vz = -m.vz; }
    if (m.side > 0) {
      /* a glycolipid's carbohydrate chain: round it, never through it */
      if (m.y < 4.9 + r) for (let i = 0; i < S.PER; i++) { if (S.kind[i] !== 2) continue; const dx = m.x - S.x[i], dz = m.z - S.z[i], d = Math.hypot(dx, dz), e = 0.5 + r; if (d < e && d > 1e-4) { m.x = S.x[i] + dx / d * e; m.z = S.z[i] + dz / d * e; } }
      /* the side of the aquaporin's top part sends it back the way it came (it never rises through the protein) */
      if (m.y < floorAt(m.x, m.z, r) && floorAt(px, pz, r) < floorAt(m.x, m.z, r)) { m.x = px; m.z = pz; m.vx = -m.vx; m.vz = -m.vz; }
      /* the membrane's surface turns it back */
      const f = floorAt(m.x, m.z, r);
      if (m.y < f) { m.y = Math.min(2 * f - m.y, f + 0.12); m.vy = Math.abs(m.vy); }
    } else {
      if (m.y > roofAt(m.x, m.z, r) && roofAt(px, pz, r) > roofAt(m.x, m.z, r)) { m.x = px; m.z = pz; m.vx = -m.vx; m.vz = -m.vz; }
      const f = roofAt(m.x, m.z, r);
      if (m.y > f) { m.y = Math.max(2 * f - m.y, f - 0.12); m.vy = -Math.abs(m.vy); }
    }
  }
  /* where a molecule of a file stands: place j of file F, moved by the file's hop and its small wobble */
  function slot(F, j, o) {
    const m = F.m[j], sh = F.hop ? F.hop.dir * W.SP * smooth(F.hop.t / W.HOP_S) : 0, y = W.YB + (j - (F.hop && F.hop.dir > 0 ? 1 : 0)) * W.SP + sh + F.wob;
    poreAt(F.i, y, m.h * 6.2832, tmp); world(tmp);
    o.x = tmp.x; o.y = y; o.z = tmp.z; return o;
  }
  const sp = { x: 0, y: 0, z: 0 };
  function step() {
    c.steps++; c.t += DT;
    /* the solutes */
    for (const q of sol) {
      if (q.gone) { q.f--; continue; }
      if (q.f < FADE) q.f++;
      walk(q, W.SOL_S, W.SOL_TAU, W.SOL_R);
      if (q.side > 0 ? q.y > W.YT : q.y < W.YBOT) { q.y = q.side > 0 ? 2 * W.YT - q.y : 2 * W.YBOT - q.y; q.vy = -q.vy; }
      if (q === named) {
        if (q.x < TAG.x0) { q.x = TAG.x0; q.vx = Math.abs(q.vx); } else if (q.x > TAG.x1) { q.x = TAG.x1; q.vx = -Math.abs(q.vx); }
        if (q.z < TAG.z0) { q.z = TAG.z0; q.vz = Math.abs(q.vz); }
        const ay = Math.abs(q.y); if (ay < TAG.y0) { q.y = q.side * TAG.y0; q.vy = q.side * Math.abs(q.vy); } else if (ay > TAG.y1) { q.y = q.side * TAG.y1; q.vy = -q.side * Math.abs(q.vy); }
      }
    }
    for (let i = sol.length - 1; i >= 0; i--) if (sol[i].gone && sol[i].f <= 0) sol.splice(i, 1);
    /* the free water */
    for (const m of mol) {
      if (m.st !== 'free' || m.leave) continue;
      if (m.f < FADE) m.f++;
      walk(m, W.S, W.TAU, 0);
      m.ax += gauss() * 0.07; m.ay += gauss() * 0.07; m.az += gauss() * 0.07;
      /* the far edge: a window into a larger solution (one too many leaves there; else it turns back) */
      if (m.side > 0 ? m.y > W.YT : m.y < W.YBOT) {
        if (count(m.side) > NW(m.side)) { m.dead = true; continue; }
        m.y = m.side > 0 ? 2 * W.YT - m.y : 2 * W.YBOT - m.y; m.vy = -m.vy;
      }
    }
    for (let i = mol.length - 1; i >= 0; i--) if (mol[i].dead) mol.splice(i, 1);
    for (let s = -1; s <= 1; s += 2) if (count(s) < NW(s) && R() < 0.06) newWater(s, true);
    /* a water molecule at an opening goes in, unless a solute particle is in the way or the file is moving */
    for (const F of files) {
      F.wv += -F.wv * DT / 0.5 + 0.09 * Math.sqrt(2 * DT / 0.5) * gauss(); F.wob += F.wv * DT - F.wob * DT / 0.8;
      if (F.hop) {
        const H = F.hop; H.t += DT;
        const e = smooth(H.t / W.HOP_S), en = H.enter, j = H.dir > 0 ? 0 : F.m.length - 1;
        slot(F, j, sp); en.x = H.from.x + (sp.x - H.from.x) * e; en.y = H.from.y + (sp.y - H.from.y) * e; en.z = H.from.z + (sp.z - H.from.z) * e;
        if (H.t >= W.HOP_S) {
          /* the file has moved one place: the molecule at its other end is free again, on the other side */
          const out = H.dir > 0 ? F.m.pop() : F.m.shift();
          F.hop = null; en.st = 'file';
          const oy = (H.dir > 0 ? W.YB + W.SLOTS * W.SP : W.YB - W.SP) + F.wob;
          poreAt(F.i, oy, out.h * 6.2832, tmp); world(tmp);
          out.st = 'free'; out.side = H.dir; out.x = tmp.x; out.y = oy; out.z = tmp.z; out.leave = 1;
          out.vx = gauss() * 0.3; out.vz = gauss() * 0.3; out.vy = H.dir * (0.9 + 0.3 * R()); out.ax = gauss(); out.ay = gauss(); out.az = gauss(); out.f = FADE;
          if (H.dir > 0) { c.up++; c.poreUp++; } else { c.down++; c.poreDown++; }
          F.n++;
        }
        continue;
      }
      const M = mouth[F.i];
      for (const m of mol) {
        if (m.st !== 'free' || m.leave || m.f < FADE) continue;
        const p = m.side > 0 ? M.hi : M.lo;
        if (Math.hypot(m.x - p.x, m.y - p.y, m.z - p.z) > W.RC) continue;
        if (blocked(p)) break;
        const dir = -m.side;      /* from below: the file moves up; from above: down */
        m.st = 'in'; m.h = R(); m.side = 0;
        F.hop = { dir, t: 0, enter: m, from: { x: m.x, y: m.y, z: m.z } };
        if (dir > 0) F.m.unshift(m); else F.m.push(m);
        break;
      }
    }
    /* a molecule that has just left a file moves clear of the opening before it wanders again */
    for (const m of mol) {
      if (m.st !== 'free' || !m.leave) continue;
      m.x += m.vx * DT; m.y += m.vy * DT; m.z += m.vz * DT;
      if (m.side > 0 ? m.y > W.PROT_TOP + W.CLEAR : m.y < W.ROOF - W.CLEAR) { m.leave = 0; m.vx = gauss() * W.S; m.vz = gauss() * W.S; }
    }
    /* between the phospholipids, slowly: a molecule near the place starts a crossing when the place is free */
    for (const s of sites) {
      if (s.m) {
        s.u += DT / W.CROSS_S;
        if (s.u >= 1) {
          const m = s.m; s.m = null; m.st = 'free'; m.side = s.dir; m.leave = 1; m.f = FADE;
          m.x = s.x; m.y = s.dir * (CA + 0.02); m.z = s.z; m.vx = -Math.sign(s.x) * Math.abs(gauss()) * 0.3; m.vz = -Math.abs(gauss()) * 0.25; m.vy = s.dir * 0.7;
          if (s.dir > 0) { c.up++; c.bilUp++; } else { c.down++; c.bilDown++; }
        }
        continue;
      }
      for (const m of mol) {
        if (m.st !== 'free' || m.leave || m.f < FADE) continue;
        const py = m.side * CA;
        if (Math.hypot(m.x - s.x, m.y - py, m.z - s.z) > W.RX) continue;
        if (blocked({ x: s.x, y: py, z: s.z })) break;
        s.m = m; s.dir = -m.side; s.u = 0; s.from = { x: m.x, y: m.y, z: m.z }; m.st = 'cross'; m.side = 0;
        break;
      }
    }
  }
  /* a crossing molecule's place: slow all the way (a straight line through the bilayer, from where it started) */
  function crossAt(s, o) {
    const e = s.u, y0 = -s.dir * CA, y = y0 + (s.dir * CA - y0) * e, k = s.from ? Math.max(0, 1 - e * 12) : 0;
    o.x = s.x + 0.07 * Math.sin(c.t * 0.9 + s.x) + (s.from ? (s.from.x - s.x) * k : 0); o.y = y + (s.from ? (s.from.y - y0) * k : 0); o.z = s.z + 0.05 * Math.cos(c.t * 0.7 + s.x) + (s.from ? (s.from.z - s.z) * k : 0);
    return o;
  }
  /* every water molecule now: fn(x, y, z, scale, bx, by, bz, roll, which, i, k): its middle (nm), its size (0 to 1), the
     direction from its oxygen to its two hydrogens, its turn about that direction; which: 'pore' (i: the pore, k: its
     place), 'free', 'cross' (i: the place) */
  const edge = m => m.side > 0 ? smooth((W.YT - m.y) / W.EDGE) : m.side < 0 ? smooth((m.y - W.YBOT) / W.EDGE) : 1;
  function each(fn) {
    for (const F of files) for (let j = 0; j < F.m.length; j++) {
      const m = F.m[j];
      if (m.st === 'in') { fn(m.x, m.y, m.z, 1, Math.cos(m.h * 6.28) * 0.8, 0.6, Math.sin(m.h * 6.28) * 0.8, m.roll, 'enter', F.i, j, m.id); continue; }
      slot(F, j, sp);
      /* the hydrogens point away from the pore's middle (where the two asparagines hold it: "water dipole reorientation",
         Agre 2003): sideways there, along the pore beyond */
      const a = m.h * 6.2832, ph = Math.PI / 2 * (1 - Math.tanh(sp.y / 0.35)), s1 = Math.sin(ph);
      fn(sp.x, sp.y, sp.z, 1, s1 * Math.cos(a), Math.cos(ph), s1 * Math.sin(a), m.roll, 'pore', F.i, j, m.id);
    }
    for (const m of mol) {
      if (m.st !== 'free') continue;
      const n = Math.hypot(m.ax, m.ay, m.az) || 1;
      fn(m.x, m.y, m.z, smooth(m.f / FADE) * edge(m), m.ax / n, m.ay / n, m.az / n, m.roll, 'free', m.side, 0, m.id);
    }
    sites.forEach((s, i) => { if (!s.m) return; crossAt(s, sp); const m = s.m, n = Math.hypot(m.ax, m.ay, m.az) || 1; fn(sp.x, sp.y, sp.z, 1, m.ax / n, m.ay / n, m.az / n, m.roll + c.t * 0.25, 'cross', i, 0, m.id); });
  }
  /* every solute particle: fn(x, y, z, scale, side) */
  function eachSolute(fn) { for (const q of sol) fn(q.x, q.y, q.z, smooth(Math.max(0, q.f) / FADE), q.side, q.id); }

  /* for the names: a molecule in pore i near its middle (kept while it stays within 0.5 nm of the place below the
     middle); the molecule crossing at place i (false when none is on its way); one solute particle (kept) */
  const held = pores.map(() => null);
  function porePoint(i, out) {
    const F = files[i];
    let j = held[i] == null ? -1 : F.m.findIndex(m => m.id === held[i]);
    if (j >= 0) { slot(F, j, sp); if (Math.abs(sp.y + 0.4) > 0.5 || F.m[j].st !== 'file') j = -1; }
    if (j < 0) { let best = 1e9; for (let q = 0; q < F.m.length; q++) { if (F.m[q].st !== 'file') continue; slot(F, q, sp); const d = Math.abs(sp.y + 0.4); if (d < best) { best = d; j = q; } } held[i] = F.m[j].id; slot(F, j, sp); }
    return out.set(sp.x, sp.y, sp.z);
  }
  /* (named only while it is among the tails, 1.7 nm each side of the middle: at the heads' level it looked outside the
     membrane already: the science read) */
  function crossPoint(i, out) { const s = sites[i]; if (!s.m) return false; crossAt(s, sp); return Math.abs(sp.y) < 1.7 ? out.set(sp.x, sp.y, sp.z) : false; }
  /* one solute particle carries the name "solute" (named: made first, on the side with more of them). It wanders at
     random like the others, in the part of the picture left of the aquaporin where nothing else stands (TAG: its own
     edges turn it back, as the edges of the whole space do), so that its name is always in the picture */
  function solutePoint(out) { return named ? out.set(named.x, named.y, named.z) : false; }
  /* for tools/membrane-check.mjs: every molecule, each file, the places between the phospholipids, the solutes */
  function state() {
    const out = []; each((x, y, z, s, bx, by, bz, r, which, i, k, id) => { out.push({ x, y, z, s, which, i, k, id }); });
    const ss = []; eachSolute((x, y, z, s, side, id) => { ss.push({ x, y, z, s, side, id }); });
    return { t: c.t, steps: c.steps, mode, mol: out, sol: ss, c: Object.assign({}, c), files: files.map(F => ({ n: F.n, len: F.m.length, hop: F.hop ? F.hop.dir : 0 })), cross: sites.map(s => s.m ? { u: s.u, dir: s.dir } : null), SP: W.SP, free: { out: count(1), cyt: count(-1) } };
  }
  return { step, each, eachSolute, crossPoint, porePoint, solutePoint, state, pores, sites, files, mouth, c, mode, DT, NW, NS,
    get count() { let n = 0; each(() => { n++; }); return n; }, get solutes() { return sol.length; } };
}

/* the checks (node, and tools/membrane-check.mjs in the browser): each mode run for a minute with its fixed numbers.
   Every second: more water has crossed towards the side with more solutes than away from it (from 6 s at least two
   more, from 20 s at least one and a half times as many); and at every step: no solute particle in the membrane or on
   the other side, no free water molecule in the membrane, the molecules of a file in order and 0.3 nm apart (never two
   side by side), each side's drawn water within 8 of its number */
export function osmoCheck(S, A, mode, seed) {
  /* (the piece of membrane runs in step with its water, from its start, as on the page: view.js) */
  S.restart();
  const Wt = makeWater(S, A, mode, seed), W = WATER, hiSide = mode === 'out' ? 1 : -1;
  let wrong = 0, solBad = 0, freeBad = 0, fileBad = 0, nBad = 0, at10 = null;
  const side0 = new Map(); Wt.eachSolute((x, y, z, s, side, id) => side0.set(id, side));
  for (let t = 1; t <= 60; t++) {
    for (let k = 0; k < 60; k++) {
      S.step(); Wt.step();
      if (k % 6) continue;
      Wt.eachSolute((x, y, z, s, side, id) => { if (side0.get(id) !== side || (side > 0 ? y < W.FLOOR : y > W.ROOF)) solBad++; });
      const st = Wt.state(), byPore = {};
      for (const m of st.mol) {
        if (m.which === 'free' && Math.abs(m.y) < W.FLOOR - 0.02 && !(Math.hypot(m.x, m.z - 2.6) < W.PROT_R)) freeBad++;
        if (m.which === 'pore') (byPore[m.i] ||= []).push(m);
      }
      for (const L of Object.values(byPore)) { L.sort((a, b) => a.k - b.k); for (let j = 1; j < L.length; j++) { const d = L[j].y - L[j - 1].y; if (L[j].s === 1 && L[j - 1].s === 1 && (d < 0.2 || d > 0.62)) fileBad++; } }
      if (Math.abs(st.free.out - Wt.NW(1)) > 8 || Math.abs(st.free.cyt - Wt.NW(-1)) > 8) nBad++;
    }
    const a = hiSide > 0 ? Wt.c.up : Wt.c.down, b = hiSide > 0 ? Wt.c.down : Wt.c.up;
    if (b > a || (t >= 6 && a - b < 2) || (t >= 20 && a < 1.5 * b)) wrong++;
    if (t === 10) at10 = { with: a, against: b };
  }
  const a = hiSide > 0 ? Wt.c.up : Wt.c.down, b = hiSide > 0 ? Wt.c.down : Wt.c.up;
  return { mode, seed: seed == null ? SEED[mode] : seed, wrong, solBad, freeBad, fileBad, nBad, at10, total: { with: a, against: b }, pores: Wt.c.poreUp + Wt.c.poreDown, bilayer: Wt.c.bilUp + Wt.c.bilDown };
}
