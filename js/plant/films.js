/* ============================================================
   films.js — the leaf's two films of the course layer, in the leaf's own 3D (16 Nov 2026, rebuilt the same evening):
   "Watch carbon dioxide diffuse in" (until 19 Nov 2026: "go in") and "Watch transpiration". js/plant/view.js plays them, shot by shot; their words are
   pieces of the leaf's IGCSE lines, word for word (text.js FILMS).
   Daniel, of the first version (dots on straight lines drawn over the picture): "the animations that you have added are
   extremely simple … carbon dioxide goes in and you see suddenly a big arrow and dots going up"; "Watch transpiration, I
   don't see anything. It doesn't zoom out. I don't know where it is". So:
   - a film is a few shots, and the camera goes from the whole piece of leaf to where each one happens (the stoma, seen
     in the section of the front face; the air space above it; the air spaces between the spongy cells; the palisade
     cells' feet; the vein; a spongy cell's surface), so that the pupil sees where it is;
   - the molecules are the game's own (carbon grey, oxygen red, hydrogen white: js/game/actors.js token), in 3D, many of
     them, each on its own path through the leaf's own spaces. A path is a walk that turns at random and goes a little
     more often towards where it ends (diffusion: a net movement from where there are more to where there are fewer),
     worked out once against the cells' own shapes (`gasFree`): a gas never passes through a cell, an epidermis or the
     vein, and it passes the lower epidermis only through a stoma's pore. Water leaves the xylem sideways, at the
     section's face, never along the vein: the vein runs into the picture, and water must never be seen going "up" it;
   - liquid water's molecules touch each other (the full xylem at its cut ends; a row sliding out of it; a thin film on
     the cells' surfaces), a gas's are far apart (memory particle-model-in-diagrams); there are more carbon dioxide
     molecules in the air outside the leaf than in its air spaces, and more water vapour inside than outside;
   - one molecule of each shot, its hero, does what the shot's words say, from the moment the camera arrives, again and
     again while the film waits; its name rides on it (view.js) and changes when it does (water · evaporation, then
     water vapour · diffusion);
   - molecules 0.3 to 0.55 nm across would be far smaller than a pixel here: they are drawn FILM_X times bigger, and the
     caption says so (memory true-relative-sizes); a soft glow helps the eye find them (light, not size).
   What is drawn depends only on two times, the film's and the shot's: a still (Reduce motion) is a time held.
   (19 Nov 2026) With IB on the films have the IB guide's own words (text.js FILMS.co2ib, FILMS.h2oib), and the film of
   transpiration goes NEAR: into the outer face of a spongy mesophyll cell's wall, where the section cuts it, with every
   molecule at its true size (wet.js: evaporation from the wall, capillary action, cohesion and adhesion as hydrogen
   bonds). The molecules drawn 3000 times bigger fade as the camera nears: nothing is drawn at two scales at once.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { magicStandard } from '../world/magic.js?v=202611282133';
import { halo } from '../ib/stage.js?v=202611282133';
import { makeWet } from './wet.js?v=202611282133';

export const FILM_X = 3000;

export function makeFilms(L) {
  const { S, spo, pal, HOLE, CAVE, CAVES, STOMA, VEIN, y0, y1, HL, R0, PX, PZ, KB, KT, AIR, rng, views, labels, stage, depth, cut = [], slab = [-1e9, 1e9] } = L;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const D = (x, y, z) => V(x, y, z).normalize();
  const g = new THREE.Group(); g.name = 'films'; g.visible = false;
  const sm = x => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };

  /* ---------------- the molecules' sizes (nm, drawn FILM_X times bigger) ---------------- */
  const SC = S.co2 * FILM_X / 2.24, SW = S.water * FILM_X / 1.4;     /* token('co2' | 'water', s): the s that gives the size */
  const RC = 0.42 * SC, RO = 0.40 * SC, OC = 0.72 * SC;               /* carbon, its two oxygens */
  const RWO = 0.45 * SW, RH = 0.28 * SW, HX = 0.42 * SW, HY = 0.3 * SW; /* water's oxygen, its two hydrogens */
  const WW = 2 * (HX + RH);                                            /* a water molecule's width: neighbours in a liquid touch */

  /* ---------------- where a molecule may be: the leaf's own spaces ---------------- */
  const BLOB = (x, y, z) => 0.9 + 0.3 * Math.sin(x * 2.6 + y * 1.9 + 0.7) * Math.sin(z * 2.9 - x * 1.5) + 0.07 * Math.sin(y * 5 + z * 4);   /* leaf.js blob */
  spo.forEach(o => { o.qi = o.q.clone().invert(); o.br = Math.max(o.s.x, o.s.y, o.s.z) * 1.42; });
  const T = V();
  /* the spongy cell a point is in (within m nm of its surface), or null */
  function inSpongy(p, m) {
    for (const o of spo) { const dx = p.x - o.p.x, dy = p.y - o.p.y, dz = p.z - o.p.z, R2 = (o.br + m) * (o.br + m); if (dx * dx + dy * dy + dz * dz > R2) continue;
      T.set(dx, dy, dz).applyQuaternion(o.qi); T.set(T.x / o.s.x, T.y / o.s.y, T.z / o.s.z); const l = T.length(); if (l < 1e-9) return o;
      if (l < BLOB(T.x / l, T.y / l, T.z / l) + m / o.r) return o; }
    return null;
  }
  /* the palisade cells (leaf.js capsuleGeo, each with its own turn and size; the open cell at the middle) */
  const PALS = pal.map(c => ({ p: c.p, qi: c.q.clone().invert(), s: c.s })).concat([{ p: V(), qi: new THREE.Quaternion(), s: V(1, 1, 1) }]);
  const yB = -(HL - KB * R0), yT = HL - KT * R0;
  function inPal(p, m) {
    if (p.y < -1.25 * HL - m) return false;
    for (const c of PALS) { const dx = p.x - c.p.x, dz = p.z - c.p.z; if (Math.abs(dx) > R0 * 1.3 + m || Math.abs(dz) > R0 * 1.3 + m) continue;
      T.set(dx, p.y - c.p.y, dz).applyQuaternion(c.qi); T.set(T.x / c.s.x, T.y / c.s.y, T.z / c.s.z);
      const r = R0 + m, rr = T.x * T.x + T.z * T.z; if (T.y > HL + m) continue;
      if (T.y >= yB && T.y <= yT) { if (rr < r * r) return true; continue; }
      const h = (T.y < yB ? KB : KT) * R0 + m, d = T.y < yB ? T.y - yB : T.y - yT; if (rr / (r * r) + d * d / (h * h) < 1) return true; }
    return false;
  }
  /* the epidermis: the lower one is a band (its cells, their domed outer faces, the wax) with a pore at each stoma */
  const LOWS = STOMA.filter(o => o.down).map(o => o.p);
  const EPI_T = y0 + 300, EPI_B = y0 - S.epiLow * 0.84 * 1.28 - 1700, FRONT = 8200, BACK = -4.4 * PZ, XL = 4.5 * PX;
  const inPore = (p, m) => LOWS.some(s => { const a = (p.x - s.x) / Math.max(250, 1700 - m), b = (p.z - s.z) / Math.max(500, 4300 - m); return a * a + b * b < 1; });
  const inEpi = (p, m) => p.y > HL - 400 - m || (p.y < EPI_T + m && p.y > EPI_B - m && !inPore(p, m * 0.7));
  const inVein = (p, m) => Math.hypot(p.x - VEIN.x, p.y - VEIN.y) < VEIN.r + m;
  /* the space the films use: inside the piece (never out of its cut front face), and the air under it near the stomata */
  const outside = (p, m) => p.y < EPI_B - m
    ? (Math.abs(p.x - HOLE.x) > 72000 || p.z > FRONT + 9000 || p.z < BACK || p.y < y0 - 115000)
    : (p.z > FRONT - m - 150 || p.z < BACK + m || Math.abs(p.x) > XL - m);
  const gasFree = (p, m = 640) => !outside(p, m) && !inEpi(p, m) && !inVein(p, m) && !inPal(p, m) && !inSpongy(p, m);
  const waterFree = (p, m = 380) => !outside(p, m) && !inEpi(p, m) && !inPal(p, m) && !inSpongy(p, m);      /* (water may cross the vein's cells) */

  /* is a point seen from a camera in direction dir (no spongy or palisade cell between it and the camera) */
  const LOS = V();
  const seenAlong = (q, dir) => { for (let k = 1; k <= 30; k++) { LOS.copy(q).addScaledVector(dir, k * 1300); if (LOS.z > FRONT) return true;      /* (in a film nothing stands in front of the piece's face: leaf.js, the section) */ if (inSpongy(LOS, -250) || inPal(LOS, -250)) return false; } return true; };
  /* ---------------- a walk: random turns, more often towards each goal in turn ---------------- */
  const unit = (R, out) => { const u = R() * 2 - 1, a = R() * 6.2832, w = Math.sqrt(1 - u * u); return out.set(w * Math.cos(a), u, w * Math.sin(a)); };
  function walk(R, start, goals, free, o = {}) {
    const step = o.step || 1300, tries = o.tries || 18, pts = [start.clone()], p = start.clone(), d = V(), q = V(), mid = V(), u = V();
    for (const gl of goals) {
      for (let n = 0; n < (gl.max || 420); n++) {
        const far = p.distanceTo(gl.p); if (far <= (gl.r || 0)) break;
        if (gl.touch && gl.touch(p, R)) return { pts, end: 'touch' };
        let ok = false;
        for (let k = 0; k < tries && !ok; k++) {
          d.copy(gl.p).sub(p).normalize().multiplyScalar(gl.bias != null ? gl.bias : 0.5);
          if (o.pull) d.add(o.pull(p));
          d.add(unit(R, u).multiplyScalar((o.jit || 1) * (1 + k * 0.12))).normalize();
          q.copy(p).addScaledVector(d, Math.min(step, Math.max(300, far))); mid.copy(p).lerp(q, 0.5);
          if (free(q) && free(mid)) { p.copy(q); pts.push(p.clone()); ok = true; }
        }
        if (!ok) return { pts, end: gl.stop ? 'touch' : 'stuck' };
      }
    }
    return { pts, end: 'done' };
  }
  /* a path: the walk's points joined by a smooth curve, sampled every ~220 nm along it */
  function track(raw, ds = 220) {
    if (raw.length < 2) raw = [raw[0], raw[0].clone().add(V(10, 0, 0))];
    const c = new THREE.CatmullRomCurve3(raw, false, 'centripetal'); c.arcLengthDivisions = Math.max(200, raw.length * 12);
    const Lg = c.getLength(), n = Math.max(2, Math.ceil(Lg / ds) + 1), A = new Float32Array(n * 3);
    c.getSpacedPoints(n - 1).forEach((p, i) => { A[i * 3] = p.x; A[i * 3 + 1] = p.y; A[i * 3 + 2] = p.z; });
    return { A, n, L: Lg, ds: Lg / (n - 1) };
  }
  const at = (tr, s, out) => { const f = Math.max(0, Math.min(tr.n - 1.0001, s / tr.ds)), i = Math.floor(f), w = f - i, A = tr.A, j = i * 3;
    return out.set(A[j] + (A[j + 3] - A[j]) * w, A[j + 1] + (A[j + 4] - A[j + 1]) * w, A[j + 2] + (A[j + 5] - A[j + 2]) * w); };
  const inBox = (R, c, hx, hy, hz) => V(c.x + (R() * 2 - 1) * hx, c.y + (R() * 2 - 1) * hy, c.z + (R() * 2 - 1) * hz);
  const freePoint = (R, c, hx, hy, hz, free) => { for (let i = 0; i < 400; i++) { const p = inBox(R, c, hx, hy, hz); if (free(p)) return p; } return c.clone(); };
  /* a walk that keeps trying (another seed) until it reaches its last goal */
  const reach = (seed, start, goals, free, o) => { let best = null; for (let k = 0; k < 6; k++) { const w = walk(rng(seed + k * 7919), start, goals, free, o); if (w.end !== 'stuck') return w; if (!best || w.pts.length > best.pts.length) best = w; } return best; };

  /* ---------------- the places of the films ---------------- */
  const PORE_T = V(HOLE.x, EPI_T + 1400, 6400), PORE_B = V(HOLE.x, EPI_B - 400, 6400), UNDER = V(HOLE.x, y0 - 24000, 6200);
  const front = o => o.p.z > -13000;
  /* the spongy cells round the air space over the stoma (nearest its middle first) */
  const caveCells = spo.filter(front).map(o => ({ o, d: o.p.distanceTo(CAVE) - o.r })).sort((a, b) => a.d - b.d).slice(0, 4).map(x => x.o);
  /* a point on a cell's surface, from a point in the air outside it, along the line to its middle */
  const surfaceFrom = (o, from) => { const p = from.clone(), d = o.p.clone().sub(from).normalize(); for (let i = 0; i < 400; i++) { if (inSpongy(p, 0) === o) return p.addScaledVector(d, -60); p.addScaledVector(d, 120); } return p; };
  /* the xylem's tubes on the side of the vein that the spongy cells are on (water leaves there), and where it goes */
  const XY = (VEIN.xylem || []).map(([x, y, r]) => ({ c: V(VEIN.x + x, VEIN.y + y, VEIN.z0), r }));
  const ZF = VEIN.z0 - 900;      /* the water's own plane: just behind the section's face, where the tubes are cut */
  const veinSide = spo.filter(o => front(o) && o.p.x > VEIN.x + VEIN.r * 0.3 && Math.abs(o.p.y - VEIN.y) < VEIN.r * 1.2).sort((a, b) => Math.hypot(a.p.x - VEIN.x, a.p.y - VEIN.y) - Math.hypot(b.p.x - VEIN.x, b.p.y - VEIN.y)).slice(0, 3);
  /* the mesophyll cells carbon dioxide may reach: spongy cells near the front, and the palisade cells' feet */
  const palFront = PALS.filter(c => c.p.z > -3500 && Math.abs(c.p.x - (HOLE.x - 0.6 * PX)) < 2.4 * PX);
  const palFoot = c => V(c.p.x, c.p.y + (-HL + 0.5 * KB * R0) * c.s.y, c.p.z + 0.35 * R0);
  const TOUCH = 900;      /* a gas molecule's middle keeps 640 nm (carbon dioxide) or 480 nm (water) from a surface: within 900 it touches */
  const sideOf = p => inSpongy(p, TOUCH) || (inPal(p, TOUCH) ? 'pal' : null);

  /* ---------------- the views of the films (pushed after the leaf's own; view.js moves between them) ---------------- */
  const CC = caveCells[0], SURF = surfaceFrom(CC, CAVE);
  const VI = {};
  const addView = (k, v) => { VI[k] = views.length; views.push(v); };
  addView('stoma', { zoom: 4, at: V(HOLE.x, HOLE.y + 7000, FRONT), dist: 90000, dir: D(0.07, 0.03, 1), up: V(0, 1, 0), fit: { pts: [[24000, 30000, 3000]], min: 72000 } });
  addView('air', { zoom: 5, at: V(HOLE.x - 5000, CAVE.y + 10000, FRONT), dist: 110000, dir: D(0.08, 0.03, 1), up: V(0, 1, 0), fit: { pts: [[19000, 21000, 4000]], min: 76000 } });
  addView('cells', { zoom: 5, at: V(HOLE.x - 0.85 * PX, -HL - 7000, FRONT), dist: 110000, dir: D(0.1, 0.05, 1), up: V(0, 1, 0), fit: { pts: [[25000, 27000, 4000]], min: 88000 } });
  addView('vein', { zoom: 5, at: V(VEIN.x + 19000, VEIN.y + 6000, VEIN.z0), dist: 130000, dir: D(0.1, 0.06, 1), up: V(0, 1, 0), fit: { pts: [[40000, 34000, 6000]], min: 100000 } });
  addView('surface', { zoom: 4, at: SURF.clone().lerp(CAVE, 0.45).add(V(0, 4000, 0)), dist: 72000, dir: D(0.05, 0.03, 1), up: V(0, 1, 0), fit: { pts: [[17000, 20000, 6000]], min: 64000 } });
  /* (the whole piece's lower half and the air under it; the leaf low in the picture, clear of the caption: the review) */
  addView('under', { zoom: 4, at: V(HOLE.x - 0.5 * PX - 8000, y0 + 4000, 2000), dist: 300000, dir: D(0.22, 0.1, 1), up: V(0, 1, 0), fit: { pts: [[80000, 70000, 30000]], min: 240000 } });

  /* ---------------- the wall from near (IB): where it is ----------------
     On the outline of the cut face of a spongy cell that the section cuts, where the outline runs level across the
     picture with the cell under it and an air space above it (the middle of one of the outline's 72 straight pieces:
     the wall is then seen in section, its outer face level, as wet.js draws it). Of the pieces that are level to
     within 8° and have air above, the one nearest the air space over the stoma. */
  const WALLP = (() => { const probe = (q, h, dz) => gasFree(V(q.x, q.y + h, FRONT - dz), 200); let best = null, bs = 1e18, any = null, as = 1e18;
    for (const k of cut) for (let i = 0; i < k.pts.length; i++) { const a = k.pts[i], b = k.pts[(i + 1) % k.pts.length], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy); if (L < 300) continue;
      const mid = V((a.x + b.x) / 2, (a.y + b.y) / 2, FRONT), up = mid.y > k.c.y, slope = Math.abs(dy / L), tilt = Math.atan2(dx < 0 ? -dy : dy, Math.abs(dx)); if (!up) continue;
      /* (and the fewer cells stand behind the air above it, the better: there the air space is dark from the first, as the near picture's is) */
      let behind = 0; for (const dz of [1500, 3500, 6000, 9000]) for (const h of [600, 1800, 3600]) if (!probe(mid, h, dz)) behind++;
      const sc = mid.distanceTo(CAVE) + slope * 60000 + behind * 9000; if (sc < as) { as = sc; any = { p: mid, o: k.o, slope, behind, tilt }; }
      if (slope < 0.14 && [900, 2200, 4000].every(h => probe(mid, h, 700)) && inSpongy(V(mid.x, mid.y - 1500, FRONT - 700), 0) && sc < bs) { bs = sc; best = { p: mid, o: k.o, slope, behind, tilt }; } }
    return best || any || { p: SURF.clone().setZ(FRONT), o: CC, slope: 0, behind: -1, tilt: 0 }; })();
  const wet = makeWet({ stage, rng, views, labels, origin: WALLP.p.clone().add(V(0, 0, 3)), tilt: WALLP.tilt });
  g.add(wet.group); VI.w1 = wet.views.w1; VI.w2 = wet.views.w2;

  /* ---------------- the molecules that move: each a path, a speed, and a place in its loop ---------------- */
  const movers = { co2: [], h2o: [] };
  const mover = (film, kind, tr, o = {}) => { const R = rng(movers[film].length * 131 + (film === 'co2' ? 17 : 29)), M = Object.assign({ kind, tr, speed: 7000, phase: R(), gap: 0, grow: true, shrink: true, chain: 1, axis: unit(R, V()), spin: 0.8 + R() * 1.4, ph: R() * 6.28 }, o); movers[film].push(M); return M; };
  /* inside the leaf, a pull towards the layer just behind the section's face, where the pupil sees the air spaces */
  const pullFront = p => V(0, 0, p.y > EPI_B ? Math.max(-0.25, Math.min(0.4, (6000 - p.z) / 8000)) : 0);
  /* carbon dioxide: the air under the leaf, where there is more of it (molecules that wander there), and molecules that
     come in through the stoma's pore, through the air spaces, to a mesophyll cell, where each is taken in (it dissolves
     in the water on the cell's surface: drawn as the molecule going into the cell) */
  {
    const R = rng(501), BOX = [V(HOLE.x - 6000, y0 - 44000, 4200), 30000, 19000, 7600];
    for (let i = 0; i < 46; i++) {
      const s0 = freePoint(R, BOX[0], BOX[1], BOX[2], BOX[3], gasFree), far = freePoint(R, BOX[0], BOX[1], BOX[2], BOX[3], gasFree);
      const w = walk(rng(700 + i), s0, [{ p: far, r: 2000, bias: 0.3 }, { p: s0, r: 500, bias: 0.55 }], gasFree);
      mover('co2', 'co2', track(w.pts), { speed: 4200 + R() * 2300, grow: false, shrink: false });
    }
    const spT = spo.filter(o => front(o) && o.p.y > CAVE.y - 4000 && Math.abs(o.p.x - HOLE.x) < 3.2 * PX).map(o => ({ p: o.p, spongy: o })), palT = palFront.map(c => ({ p: palFoot(c), pal: true }));
    for (let i = 0; i < 64; i++) {
      /* (to every mesophyll cell: about half to the palisade cells' feet, the rest to spongy cells on the way) */
      const Rk = rng(900 + i), s0 = freePoint(Rk, BOX[0], BOX[1], BOX[2], BOX[3], gasFree), L2 = Rk() < 0.5 && palT.length ? palT : spT, tg = L2[Math.floor(Rk() * L2.length)];
      const into = { p: tg.p, r: 0, bias: 0.45, max: 700, stop: true, touch: (p, Rr) => { const h = sideOf(p); return !!h && (h === tg.spongy || (tg.pal && h === 'pal') || Rr() < 0.05); } };
      /* (anywhere across the pore, not one point of it: the expert review, 16 Nov 2026: "a one-way line teaches that
         particles aim") */
      const pz = (Rk() - 0.5) * 3600, px2 = (Rk() - 0.5) * 1300;
      const w = reach(1100 + i * 13, s0, [{ p: V(HOLE.x + (Rk() - 0.5) * 3000, y0 - 22000, 6200), r: 3000, bias: 0.45 }, { p: PORE_B.clone().add(V(px2, 0, pz)), r: 1100, bias: 0.72 }, { p: PORE_T.clone().add(V(px2, 0, pz)), r: 1100, bias: 0.8 },
        { p: inBox(Rk, CAVE, 6000, 5000, 1500).setZ(Math.min(6200, CAVE.z)), r: 3200, bias: 0.5 }, into], gasFree, { pull: pullFront });
      mover('co2', 'co2', track(w.pts), { speed: 5200 + Rk() * 2400, gap: 0.5 + Rk() * 3, grow: true, shrink: true });
    }
  }
  /* (a few the other way: diffusion is a net movement, and some molecules leave by chance) */
  for (let i = 0; i < 7; i++) {
    const Rk = rng(1250 + i), pz = (Rk() - 0.5) * 3000;
    const w = reach(1260 + i * 7, freePoint(Rk, CAVE.clone().setZ(6000), 6000, 5000, 1200, gasFree), [{ p: PORE_T.clone().add(V(0, 0, pz)), r: 1100, bias: 0.75 }, { p: PORE_B.clone().add(V(0, 0, pz)), r: 1100, bias: 0.85 }, { p: V(HOLE.x + (Rk() - 0.5) * 30000, y0 - 40000 - Rk() * 15000, 4000 + (Rk() - 0.5) * 6000), r: 3000, bias: 0.4 }], gasFree);
    mover('co2', 'co2', track(w.pts), { speed: 5200 + Rk() * 2000, gap: 1 + Rk() * 3 });
  }
  /* water: the xylem full (its cut ends), rows of water that leave it sideways to the spongy cells next to the vein, a
     film on the cells' surfaces, molecules that evaporate from it into the air spaces and diffuse out through the stomata
     as water vapour, and water vapour that wanders in the air spaces (there is more inside than outside) */
  const liquid = [];       /* liquid water that stays where it is (it slides a little): [x, y, z, its number] */
  {
    /* the xylem's cut ends: each tube's section full of water, the molecules touching */
    XY.forEach(t => { const r = t.r * 0.86; for (let y = -r; y <= r; y += WW * 0.88) { const off = (Math.round((y + r) / (WW * 0.88)) % 2) * WW * 0.5;
        for (let x = -r + off; x <= r; x += WW) if (x * x + y * y < r * r) liquid.push([t.c.x + x, t.c.y + y, ZF + 250, liquid.length]); } });
    /* the film on the surfaces of the cells round the air space over the stoma, and of the cells next to the vein: one
       layer of molecules, touching, on the side that faces the air (never where two cells press together) */
    const films = caveCells.concat(veinSide), N = 1400;
    films.forEach(o => { const kept = []; for (let i = 0; i < N && kept.length < 110; i++) {
        const yy = 1 - (i + 0.5) / N * 2, rr = Math.sqrt(1 - yy * yy), a = i * 2.39996, v = V(rr * Math.cos(a), yy, rr * Math.sin(a));
        const p = v.clone().multiplyScalar(BLOB(v.x, v.y, v.z)).multiply(o.s).applyQuaternion(o.q).add(o.p), n = p.clone().sub(o.p).normalize();
        if (n.z < -0.25) continue;
        const m = p.clone().addScaledVector(n, RWO + 90); if (m.z > FRONT - 450) continue;      /* (the section takes the cells' fronts away) */
        if (inSpongy(m.clone().addScaledVector(n, 900), 200) || !waterFree(m.clone().addScaledVector(n, 700), 260) || inVein(m, 0)) continue;
        if (kept.some(q => q.distanceToSquared(m) < (WW * 0.98) ** 2)) continue;
        kept.push(m); liquid.push([m.x, m.y, m.z, liquid.length]); }
      o.film = kept; });
    /* rows of water leaving the xylem for the cells next to the vein, in the plane of the section */
    const flat = p => V(0, 0, (ZF - p.z) / 2400);
    XY.slice().sort((a, b) => b.c.x - a.c.x).slice(0, 3).forEach((t, i) => veinSide.slice(0, 2).forEach((o, j) => {
      const Rk = rng(1300 + i * 7 + j), dir = V(o.p.x - t.c.x, o.p.y - t.c.y, 0).normalize(), s0 = V(t.c.x, t.c.y, ZF).addScaledVector(dir, t.r * 0.45).add(V(0, (Rk() - 0.5) * t.r * 0.5, 0));
      const w = walk(Rk, s0, [{ p: V(o.p.x, o.p.y, ZF), r: 0, bias: 0.62, max: 500, stop: true, touch: p => inSpongy(p, 300) === o }], p => !outside(p, 300) && !inSpongy(p, 300), { step: 900, jit: 0.7, pull: flat });
      mover('h2o', 'w', track(w.pts), { speed: 2100 + Rk() * 500, gap: 0.6 + Rk() * 1.4, chain: 5, spin: 0.25, grow: true, shrink: true });
    }));
    /* evaporation: from the film round the air space over the stoma, out through the pore, into the air under the leaf */
    const slots = caveCells.flatMap(o => (o.film || []).map(p => ({ p, o })));
    for (let i = 0; i < 46; i++) {
      const Rk = rng(1600 + i), sl = slots[Math.floor(Rk() * slots.length)] || { p: CAVE.clone(), o: CC }, n = sl.p.clone().sub(sl.o.p).normalize(), s0 = sl.p.clone().addScaledVector(n, 520);
      const away = freePoint(Rk, V(HOLE.x + (Rk() - 0.5) * 50000, y0 - 70000, 5000), 6000, 20000, 6000, gasFree);
      const w = reach(1700 + i * 11, s0, [{ p: inBox(Rk, CAVE, 6500, 6000, 1200).setZ(Math.min(6200, CAVE.z)), r: 3000, bias: 0.4 }, { p: PORE_T, r: 1000, bias: 0.88 }, { p: PORE_B, r: 1000, bias: 0.92 },
        { p: UNDER.clone().add(V((Rk() - 0.5) * 5000, 0, (Rk() - 0.5) * 3000)), r: 2600, bias: 0.6 }, { p: away, r: 3500, bias: 0.38 }], p => gasFree(p, 480), { pull: pullFront });
      mover('h2o', 'v', track(w.pts), { speed: 6200 + Rk() * 2800, gap: 0.4 + Rk() * 2.6 });
    }
    /* (and a few water vapour molecules that come in from the air outside, by chance) */
    for (let i = 0; i < 6; i++) {
      const Rk = rng(2050 + i), pz = (Rk() - 0.5) * 3000;
      const w = reach(2060 + i * 7, freePoint(Rk, V(HOLE.x, y0 - 40000, 5000), 22000, 12000, 5000, p => gasFree(p, 480)), [{ p: PORE_B.clone().add(V(0, 0, pz)), r: 1100, bias: 0.7 }, { p: PORE_T.clone().add(V(0, 0, pz)), r: 1100, bias: 0.85 }, { p: freePoint(Rk, CAVE.clone().setZ(6000), 6000, 6000, 1200, gasFree), r: 2500, bias: 0.5 }], p => gasFree(p, 480));
      mover('h2o', 'v', track(w.pts), { speed: 5200 + Rk() * 2000, gap: 2 + Rk() * 3 });
    }
    /* water vapour in the air spaces: wandering, more of it than outside */
    for (let i = 0; i < 30; i++) {
      const Rk = rng(2100 + i), s0 = freePoint(Rk, CAVE.clone().add(V(-4000, 9000, -4000)), 15000, 17000, 7000, gasFree), far = freePoint(Rk, s0, 12000, 12000, 6000, gasFree);
      const w = walk(Rk, s0, [{ p: far, r: 1500, bias: 0.3 }, { p: s0, r: 500, bias: 0.6 }], p => gasFree(p, 480), { pull: pullFront });
      mover('h2o', 'v', track(w.pts), { speed: 4800 + Rk() * 2400, grow: false, shrink: false });
    }
    /* and out of the other two stomata (seen from the whole piece): the one under the back of the piece, and the one in
       the upper epidermis */
    const S1 = STOMA[1].p, S2 = STOMA[2].p;
    for (let i = 0; i < 12; i++) {
      const Rk = rng(2300 + i), s0 = CAVES[1].clone().add(V((Rk() - 0.5) * 6000, (Rk() - 0.5) * 6000, (Rk() - 0.5) * 4000));
      const pts = [s0, V(S1.x, EPI_T + 1200, S1.z), V(S1.x, EPI_B - 600, S1.z), V(S1.x + (Rk() - 0.5) * 9000, y0 - 26000, S1.z + (Rk() - 0.5) * 6000), V(S1.x + (Rk() - 0.5) * 40000, y0 - 62000 - Rk() * 20000, S1.z + (Rk() - 0.5) * 16000)];
      mover('h2o', 'v', track(wiggle(Rk, pts, 1600)), { speed: 7000 + Rk() * 2000, gap: Rk() * 3, back: true });
    }
    for (let i = 0; i < 10; i++) {
      const Rk = rng(2400 + i), pts = [V(S2.x, HL - 500, S2.z + (Rk() - 0.5) * 2000), V(S2.x, HL + S.epiTop + 2500, S2.z), V(S2.x + (Rk() - 0.5) * 9000, HL + S.epiTop + 22000, S2.z + (Rk() - 0.5) * 6000), V(S2.x + (Rk() - 0.5) * 40000, HL + S.epiTop + 60000 + Rk() * 20000, S2.z + (Rk() - 0.5) * 16000)];
      mover('h2o', 'v', track(wiggle(Rk, pts, 1600)), { speed: 7000 + Rk() * 2000, gap: Rk() * 3, back: true });
    }
  }
  /* a hand-placed path with random turns between its points (where no cell is in the way) */
  function wiggle(R, pts, k) { const out = [pts[0].clone()]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], n = Math.max(2, Math.round(a.distanceTo(b) / 2600)); for (let j = 1; j <= n; j++) { const p = a.clone().lerp(b, j / n); if (j < n) p.add(V((R() - 0.5) * k, (R() - 0.5) * k, (R() - 0.5) * k)); out.push(p); } } return out; }

  /* ---------------- the heroes: what each shot's words say, done by one molecule ---------------- */
  const hero = (tr, words, o = {}) => Object.assign({ tr, words, speed: o.speed || Math.max(3800, Math.min(10000, tr.L / (o.secs || 6))), key: o.key != null ? o.key : 0.5, grow: true }, o);
  const SHOW = 'carbon dioxide · diffusion', VAP = 'water vapour · diffusion';
  const H = {};
  /* each hero's path keeps in view of its shot's camera (it never goes behind a cell there), so the pupil can follow it */
  const dirOf = k => views[VI[k]].dir;
  const inView = k => p => gasFree(p) && seenAlong(p, dirOf(k));
  {
    const w = reach(3001, V(HOLE.x - 5000, y0 - 30000, 6800), [{ p: V(HOLE.x, y0 - 21000, 6400), r: 1500, bias: 0.85 }, { p: PORE_B, r: 800, bias: 0.92 }, { p: PORE_T, r: 800, bias: 0.95 }, { p: PORE_T.clone().add(V(-1500, 5000, -300)), r: 1500, bias: 0.85 }], gasFree, { jit: 0.55 });
    /* (its still: just under the pore, on its way in: at the pore its name would cover the pore and the guard cells) */
    H.c1 = hero(track(w.pts), () => SHOW, { secs: 6, key: keyNear(w.pts, V(HOLE.x, y0 - 24000, 6400)) });
    /* up through the air space over the stoma and on, between the spongy cells */
    const w2 = reach(3101, PORE_T.clone().add(V(0, 1500, 0)), [{ p: CAVE.clone().add(V(-2000, 3000, -1200)), r: 2500, bias: 0.7 }, { p: CAVE.clone().add(V(-9000, 26000, -2500)), r: 4000, bias: 0.6 }], inView('air'), { jit: 0.75 });
    H.c2 = hero(track(w2.pts), () => SHOW, { secs: 6.5, key: 0.6 });
    /* to a palisade cell's foot, from the air space under it: there it is taken in */
    const pc = palFront.slice().sort((a, b) => Math.abs(a.p.x - views[VI.cells].at.x) - Math.abs(b.p.x - views[VI.cells].at.x))[0];
    const foot = pc ? palFoot(pc) : V(HOLE.x - 0.7 * PX, -HL, 2000);
    const s3 = freePoint(rng(3202), foot.clone().add(V(0, -16000, 0)), 6000, 4000, 2500, inView('cells'));
    const w3 = reach(3201, s3, [{ p: foot, r: 0, bias: 0.7, max: 500, stop: true, touch: p => inPal(p, TOUCH) }], inView('cells'), { jit: 0.7 });
    H.c3 = hero(track(w3.pts), () => SHOW, { secs: 4.5, key: 0.8, absorb: true });
  }
  {
    const w = [PORE_T.clone().add(V(0, 2500, 0)), PORE_T, PORE_B, UNDER.clone().add(V(-2500, 0, 600)), V(HOLE.x - 9000, y0 - 52000, 7000)];
    H.t1 = hero(track(wiggle(rng(3301), w, 1100)), () => VAP, { secs: 6, key: 0.78 });
    /* a row of water from the xylem tube nearest the cells beside the vein, to the first of them (its own path) */
    const o = veinSide[0], t = o ? XY.slice().sort((a, b) => a.c.distanceTo(o.p) - b.c.distanceTo(o.p))[0] : null;
    if (o && t) { const dir = V(o.p.x - t.c.x, o.p.y - t.c.y, 0).normalize(), s0 = V(t.c.x, t.c.y, ZF).addScaledVector(dir, t.r * 0.3);
      const w2 = walk(rng(3351), s0, [{ p: V(o.p.x, o.p.y, ZF), r: 0, bias: 0.7, max: 500, stop: true }], p => !outside(p, 300) && !inSpongy(p, 300), { step: 900, jit: 0.6, pull: p => V(0, 0, (ZF - p.z) / 2400) });
      H.t2 = hero(track(w2.pts), () => 'water', { secs: 7, key: 0.45, chain: 5, absorb: true, grow: false }); }
    else H.t2 = hero(track([V(VEIN.x, VEIN.y, ZF), V(VEIN.x + VEIN.r + 4000, VEIN.y, ZF)]), () => 'water', { secs: 7, chain: 5, absorb: true, grow: false });
    /* a molecule of the film on the cell by the air space over the stoma: it evaporates, then wanders in the air space */
    const sl = (CC.film || []).slice().sort((a, b) => (b.z - b.distanceTo(CAVE) * 0.4) - (a.z - a.distanceTo(CAVE) * 0.4))[0] || SURF, n = sl.clone().sub(CC.p).normalize();
    const w3 = reach(3401, sl.clone(), [{ p: sl.clone().addScaledVector(n, 2600), r: 600, bias: 0.85 }, { p: sl.clone().addScaledVector(n, 9000).lerp(CAVE, 0.3), r: 1800, bias: 0.7 }], p => gasFree(p, 400) && seenAlong(p, dirOf('surface')), { jit: 0.6 });
    H.t3 = hero(track(w3.pts), s => s < 420 ? 'water' : s < 2800 ? 'water · evaporation' : VAP, { secs: 5.5, key: 0.15, slot: sl, grow: false, liquid: 2800 });
    const w4 = reach(3501, PORE_T.clone().add(V(2000, 6000, -400)), [{ p: PORE_T, r: 800, bias: 0.9 }, { p: PORE_B, r: 800, bias: 0.95 }, { p: UNDER.clone().add(V(2500, 0, 600)), r: 1800, bias: 0.8 }, { p: V(HOLE.x + 7000, y0 - 34000, 6800), r: 2500, bias: 0.7 }], p => gasFree(p, 480), { jit: 0.55 });
    H.t4 = hero(track(w4.pts), () => VAP, { secs: 6.5, key: keyNear(w4.pts, V(HOLE.x + 3000, y0 - 27000, 6400)) });
  }
  /* the share of a path's length at which it comes nearest a point (the still of a shot shows the hero there) */
  function keyNear(pts, q) { let best = 0, bd = 1e18, run = 0, tot = 0; for (let i = 1; i < pts.length; i++) tot += pts[i].distanceTo(pts[i - 1]);
    for (let i = 0; i < pts.length; i++) { if (i) run += pts[i].distanceTo(pts[i - 1]); const d = pts[i].distanceToSquared(q); if (d < bd) { bd = d; best = run; } } return tot ? best / tot : 0.5; }

  /* ---------------- the shots (their words: text.js FILMS, by id) ---------------- */
  const shots = {
    co2: [{ id: 'co2-stoma', cam: VI.stoma, hero: H.c1, labs: { fstoma: 1, fguard: 1, flower: 2, fair: 2 } },
      { id: 'co2-air', cam: VI.air, hero: H.c2, labs: { fair: 1, fspongy: 1 } },
      { id: 'co2-cells', cam: VI.cells, hero: H.c3, labs: { fpal: 1, fspongy: 2 } }],
    h2o: [{ id: 'h2o-leaf', cam: VI.under, hero: H.t1, whole: true, labs: { fstoma: 1, flower: 2, fspongy: 2 } },
      { id: 'h2o-xylem', cam: VI.vein, hero: H.t2, labs: { fxylem: 1, fbundle: 2, fspongy: 2 } },
      { id: 'h2o-cells', cam: VI.surface, hero: H.t3, labs: { fspongy: 1, fair: 1 } },
      { id: 'h2o-stoma', cam: VI.stoma, hero: H.t4, labs: { fstoma: 1, fguard: 1, fair: 2 } }]
  };
  /* the IB films (19 Nov 2026): carbon dioxide's three shots with the IB line's words; transpiration in the order of
     cause: the whole piece (why water is lost: the stomata are open for gas exchange), then NEAR, at the wall of a
     spongy cell (near: wet.js's picture of the shot; secs: how long before Next; ms: the camera's journey): a
     molecule evaporates from the wall, the water in the wall moves up to the surface, the hydrogen bonds that hold
     water to water and water to cellulose; then the vein, where that water comes from */
  shots.co2ib = shots.co2;
  shots.h2oib = [{ id: 'tib-leaf', cam: VI.under, hero: H.t1, whole: true, labs: { fstoma: 1, flower: 2, fspongy: 2 } },
    { id: 'tib-evap', cam: VI.w1, near: 'evap', secs: wet.secs.evap, ms: 5200, labs: { wfib: 1, wwat: 1, wair: 1, wsurf: 2 } },
    { id: 'tib-cap', cam: VI.w1, near: 'cap', secs: wet.secs.cap, labs: { wsurf: 1, wfib: 1, wwat: 1 } },
    { id: 'tib-coh', cam: VI.w2, near: 'coh', secs: wet.secs.coh, ms: 2400, labs: { wcoh: 1 } },
    { id: 'tib-adh', cam: VI.w2, near: 'adh', secs: wet.secs.adh, labs: { wadh: 1, wcoh: 2 } },
    { id: 'tib-xylem', cam: VI.vein, hero: H.t2, ms: 5200, labs: { fxylem: 1, fbundle: 2, fspongy: 2 } }];
  /* (which molecules a film draws: an IB film has its IGCSE film's) */
  const MOV = { co2: 'co2', co2ib: 'co2', h2o: 'h2o', h2oib: 'h2o' };

  /* ---------------- the names of the films: the leaf's IGCSE names, on the parts each shot shows ---------------- */
  /* the air space: points of the heroes' own ways through it (seen from their shots: the molecules are seen there),
     over the stoma first */
  const AIRS = [], FD = D(0.08, 0.03, 1), Q2 = V();
  /* (a point in an air space whose line of sight meets no cell in the section, in front of it or behind it: there the
     pupil sees a dark gap, and the name's line ends on it; the review: "the 3D point is in an air space, but on screen
     it lands on a cell") */
  const gap = q => { for (let k = -24; k <= 24; k++) { if (!k) continue; Q2.copy(q).addScaledVector(FD, k * 700); if (Q2.z > FRONT || Q2.z < slab[0]) continue; if (inSpongy(Q2, 300) || inPal(Q2, 300) || inVein(Q2, 300) || inEpi(Q2, 300)) return false; } return true; };
  for (let y = EPI_T + 2500; y < CAVE.y + 42000; y += 1500) for (let x = HOLE.x - 34000; x <= HOLE.x + 34000; x += 1500) { const q = V(x, y, 6400); if (gasFree(q, 1200) && gap(q) && AIRS.every(o => o.distanceTo(q) > 6000)) AIRS.push(q); }
  AIRS.sort((a, b) => a.distanceTo(CAVE) - b.distanceTo(CAVE));
  if (!AIRS.length) AIRS.push(...AIR);
  const FX = { cls: 'plv-xlab plv-flab' };
  Object.assign(labels, {
    /* (its line ends in the pore's open end under the guard cells, so the name stands beside the epidermis, not on a
       guard cell: the review) */
    fstoma: Object.assign({ html: 'stoma', side: 'r', pts: () => [V(HOLE.x, y0 - 13200, 6900), V(HOLE.x, y0 - 12400, 6900), V(HOLE.x, HOLE.y, 6900), V(HOLE.x, HOLE.y + 2600, 6900)] }, FX),
    fguard: Object.assign({ html: 'guard cell', side: 'l', pts: () => [V(HOLE.x - 5100, HOLE.y, FRONT - 12), V(HOLE.x - 5100, HOLE.y + 1800, FRONT - 12), V(HOLE.x + 5100, HOLE.y - 1500, FRONT - 12)] }, FX),
    flower: Object.assign({ html: 'lower epidermis', side: 'l', pts: () => [-15000, -21000, -27000, 17000, 23000].map(k => V(HOLE.x + k, y0 - S.epiLow * 0.42, FRONT - 60)) }, FX),
    fair: Object.assign({ html: 'air space', side: 'r', through: true, pts: () => AIRS }, FX),
    /* (on the cut face of a cell the section cuts, the cells by the shots' places first) */
    fspongy: Object.assign({ html: 'spongy mesophyll', side: 'r', pts: () => { const near = q => cut.slice().sort((a, b) => a.c.distanceTo(q) - b.c.distanceTo(q)).slice(0, 3).map(x => x.c.clone()); return near(CAVE).concat(near(veinSide[0] ? veinSide[0].p : CAVE), near(V(HOLE.x - 0.85 * PX, -58000, FRONT)), cut.map(x => x.c.clone())); } }, FX),
    fpal: Object.assign({ html: 'palisade mesophyll', side: 'l', pts: () => palFront.map(c => V(c.p.x - R0 * 0.2, c.p.y + (-0.55 * HL) * c.s.y, c.p.z + R0 * 0.95)) }, FX),
    fxylem: Object.assign({ html: 'xylem', side: 'l', pts: () => XY.slice().sort((a, b) => a.c.x - b.c.x).map(t => V(t.c.x - t.r * 0.95, t.c.y, VEIN.z0 + 20)) }, FX),
    fbundle: Object.assign({ html: 'vascular bundle', side: 'l', pts: () => [2.35, 2.7, 3.1, 3.6].map(a => V(VEIN.x + (VEIN.r - 1800) * Math.cos(a), VEIN.y + (VEIN.r - 1800) * 0.96 * Math.sin(a), VEIN.z0 - 3000)) }, FX)
  });

  /* ---------------- drawing ---------------- */
  const raysPass = o => { o.raycast = () => {}; return o; };      /* a molecule never hides a name's part (view.js inView) */
  const ball = new THREE.SphereGeometry(1, 14, 10);
  const mat = (color, e, k) => magicStandard({ color, roughness: 0.38, emissive: e, emissiveIntensity: k, transparent: true, opacity: 1, depthWrite: true }, { rim: 0xffffff, rimK: 0.55 });
  const pool = (m, n) => { const x = raysPass(new THREE.InstancedMesh(ball, m, n)); x.count = 0; x.frustumCulled = false; x.renderOrder = 6; g.add(x); return x; };
  /* as many of each atom as the busier film needs */
  const nCO2 = movers.co2.length + 4, nW = liquid.length + movers.h2o.reduce((a, M) => a + M.chain, 0) + 8;
  const mC = pool(mat(0x4f5872, 0x141822, 0.4), nCO2), mO = pool(mat(0xff6f6f, 0x5a1010, 0.55), Math.max(2 * nCO2, nW)), mH = pool(mat(0xffffff, 0x404858, 0.5), 2 * nW);
  /* the glow: a soft light round each gas molecule (one draw, each its own size and strength) */
  const GN = 700, gpos = new Float32Array(GN * 3), gsz = new Float32Array(GN), gal = new Float32Array(GN), gcol = new Float32Array(GN * 3);
  const gGeo = new THREE.BufferGeometry(); gGeo.setAttribute('position', new THREE.BufferAttribute(gpos, 3)); gGeo.setAttribute('aSize', new THREE.BufferAttribute(gsz, 1)); gGeo.setAttribute('aA', new THREE.BufferAttribute(gal, 1)); gGeo.setAttribute('aC', new THREE.BufferAttribute(gcol, 3));
  const gMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uMap: { value: halo() }, uK: { value: 1 } },
    vertexShader: 'attribute float aSize; attribute float aA; attribute vec3 aC; uniform float uK; varying float vA; varying vec3 vC; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = min(220.0, aSize * uK / -mv.z); vA = aA; vC = aC; }',
    fragmentShader: 'uniform sampler2D uMap; varying float vA; varying vec3 vC; void main() { vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vC * t.a * vA * 1.6, t.a * vA); }' });
  const glows = raysPass(new THREE.Points(gGeo, gMat)); glows.frustumCulled = false; glows.renderOrder = 8; g.add(glows);
  const GC = { co2: new THREE.Color(0xd9dcff), v: new THREE.Color(0x8fe0ff) };
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = V(), O = V(), K3 = V(), Y3 = V(0, 1, 0), xyl = V();
  let nC = 0, nO = 0, nH = 0, nG = 0, nM = 0;
  const put = (mesh, i, p, q, k, ox, oy, r) => { O.set(ox * k, oy * k, 0).applyQuaternion(q).add(p); K3.setScalar(r * k); M4.compose(O, q, K3); mesh.setMatrixAt(i, M4); };
  function mol(kind, p, q, k) {
    if (k <= 0.004) return; nM++;
    if (kind === 'co2') { if (nC >= nCO2) return; put(mC, nC++, p, q, k, 0, 0, RC); put(mO, nO++, p, q, k, OC, 0, RO); put(mO, nO++, p, q, k, -OC, 0, RO); }
    else { if (nO >= mO.instanceMatrix.count) return; put(mO, nO++, p, q, k, 0, 0, RWO); put(mH, nH++, p, q, k, HX, HY, RH); put(mH, nH++, p, q, k, -HX, HY, RH); }
  }
  function glowAt(p, size, a, c) { if (nG >= GN || a <= 0.01) return; gpos[nG * 3] = p.x; gpos[nG * 3 + 1] = p.y; gpos[nG * 3 + 2] = p.z; gsz[nG] = size; gal[nG] = a; gcol[nG * 3] = c.r; gcol[nG * 3 + 1] = c.g; gcol[nG * 3 + 2] = c.b; nG++; }
  /* a mover's size at s along its path (0: not shown): it grows where it starts and shrinks where it is taken in */
  const ends = (M, s, L) => Math.min(M.grow ? sm(s / 520) : 1, M.shrink ? sm((L - s) / 520) : 1);
  const now = { hero: V(), words: '', on: false, id: null, shot: -1, drawn: 0 }, TOC = V();
  /* one frame of film `id` (null: none) at shot si: t, the film's time; ts, the shot's (from the camera's arrival; < 0
     before it); still: the shot's still (Reduce motion), its hero where its words happen */
  function frame(id, si, t, ts, still) {
    nC = nO = nH = nG = nM = 0; now.on = false; now.id = id; now.shot = si;
    g.visible = !!id; if (depth) depth(!!id);
    if (!id) { wet.frame(null); flush(); return; }
    gMat.uniforms.uK.value = (stage.H * stage.renderer.getPixelRatio() / 2) / Math.tan(THREE.MathUtils.degToRad(stage.cam.fov / 2));
    const sh = shots[id][si] || null, hz = sh && sh.hero, gk = sh && sh.whole ? 2.4 : 1;      /* (seen from the whole piece, the vapour's glow is larger: light, not size) */
    /* (the wall from near, IB's film of transpiration: its own picture while its shots play; between them it stays as
       it is. As the camera nears it, the molecules drawn 3000 times bigger fade: far) */
    const far = id === 'h2oib' ? wet.farK() : 1;
    if (id === 'h2oib') wet.frame(sh && sh.near ? sh.near : 'idle', t, ts, still); else wet.frame(null);
    [mC, mO, mH].forEach(m => { m.material.opacity = far; }); mC.visible = mO.visible = mH.visible = glows.visible = far > 0.01;
    for (const M of movers[MOV[id]]) {
      if (M.back && !(sh && sh.whole)) continue;           /* (the other two stomata: only the whole piece shows them) */
      const per = M.tr.L / M.speed + M.gap, u = ((t + M.phase * per) % per + per) % per;
      for (let c = 0; c < M.chain; c++) {
        const s = u * M.speed - c * WW * 0.96; if (s < 0 || s > M.tr.L) continue;
        at(M.tr, s, P); if (P.z < slab[0] + 300 && P.y > EPI_B) continue;      /* (behind the section's back face: not in the picture) */
        const k = ends(M, s, M.tr.L);
        Q.setFromAxisAngle(M.axis, t * M.spin + M.ph + c * 1.7);
        if (M.kind === 'co2') { mol('co2', P, Q, k); glowAt(P, SC * 4.4, 0.3 * k * far, GC.co2); }
        else if (M.kind === 'v') { mol('w', P, Q, k); glowAt(P, SW * 4.2 * gk, (P.y < EPI_B ? 0.22 : 0.42) * k * far, GC.v); }      /* (outside, where there is less: fainter) */
        else mol('w', P, Q, k);
      }
    }
    if (MOV[id] === 'h2o') {
      /* the liquid water that stays: it slides a little where it is (the hero's own place is empty while it is away) */
      const slot = hz && hz.slot;
      for (const [x, y, z, n] of liquid) {
        if (slot && Math.abs(x - slot.x) < 1 && Math.abs(y - slot.y) < 1 && Math.abs(z - slot.z) < 1) continue;
        if (z < slab[0] + 300) continue;
        xyl.set(x + 70 * Math.sin(t * 1.1 + n * 1.3), y + 70 * Math.sin(t * 0.9 + n * 2.1), z);
        Q.setFromAxisAngle(Y3, 0.6 * Math.sin(t * 0.5 + n) + n); mol('w', xyl, Q, 1);
      }
    }
    /* the hero: from the moment the camera has arrived (ts ≥ 0), again and again while the shot waits: along its path,
       a short rest at its end (or taken in by a cell), then once more from its start */
    if (hz && ts != null && (still || ts >= 0)) {
      const L = hz.tr.L, cyc = L / hz.speed + 1.6, u = still ? 0 : ts % cyc, s = still ? hz.key * L : Math.min(L, u * hz.speed), over = still ? 0 : u * hz.speed - L;
      let k = still ? 1 : hz.absorb ? sm((L - s) / 520) : over <= 0 ? 1 : 1 - over / (0.55 * hz.speed);
      if (hz.grow && !still) k *= sm(s / 420);
      if (k > 0.01) for (let c = 0; c < (hz.chain || 1); c++) {
        const sc = s - c * WW * 0.96; if (sc < 0) continue; at(hz.tr, sc, P); Q.setFromAxisAngle(Y3, t * 0.9 + c * 1.3);
        const kind = sh.id.startsWith('co2') ? 'co2' : (hz.chain || (hz.liquid && sc < hz.liquid)) ? 'lw' : 'v';
        mol(kind === 'co2' ? 'co2' : 'w', P, Q, c ? Math.min(1, k * 1.2) : k);
        if (kind !== 'lw') glowAt(P, (kind === 'co2' ? SC : SW) * 5.2, 0.62 * k, kind === 'co2' ? GC.co2 : GC.v);
        if (c === 0) { now.hero.copy(P); now.words = hz.words(s); TOC.copy(stage.cam.position).sub(P).normalize(); now.on = k > 0.35 && seenAlong(P, TOC); }
      }
    }
    /* (a near shot: the followed molecule is the wall's own, wet.js) */
    /* (keep: its name may stand further from it than a far molecule's, on a longer line: view.js placeTag; the picture is full of water and names) */
    if (sh && sh.near) { now.on = wet.now.on; now.keep = []; now.pref = wet.now.pref; if (wet.now.on) { now.hero.copy(wet.now.hero); now.words = wet.now.words; } } else { delete now.keep; now.pref = ''; }
    now.drawn = nM;
    flush();
  }
  function flush() {
    mC.count = nC; mO.count = nO; mH.count = nH; [mC, mO, mH].forEach(m => { m.instanceMatrix.needsUpdate = true; });
    gGeo.setDrawRange(0, nG); ['position', 'aSize', 'aA', 'aC'].forEach(a => { gGeo.attributes[a].needsUpdate = true; });
  }
  /* the route of a shot's hero, as points (view.js keeps names off it, and a still draws its arrow along it) */
  const route = (id, si) => { const sh0 = shots[id] && shots[id][si]; if (sh0 && sh0.near) return wet.route(sh0.near); const h = sh0 && sh0.hero; if (!h) return []; const out = [], n = Math.max(10, Math.round(h.tr.L / 1000)); for (let i = 0; i <= n; i++) out.push(at(h.tr, h.tr.L * i / n, V())); return out; };
  /* for the checks (tools/ib-level.mjs): how many samples of every gas path lie inside a cell, an epidermis or the vein
     (none may), and how far each row of water goes along the vein (it must not) */
  function check() {
    const inside = { co2: 0, v: 0 }, samples = { co2: 0, v: 0 }, P2 = V();
    const gasPaths = [...movers.co2, ...movers.h2o.filter(M => M.kind === 'v' && !M.back)].map(M => [M.kind, M.tr]).concat([H.c1, H.c2, H.c3, H.t1, H.t3, H.t4].map((h, i) => [i < 3 ? 'co2' : 'v', h.tr]));
    gasPaths.forEach(([k, tr]) => { for (let i = 0; i < tr.n; i += 2) { at(tr, i * tr.ds, P2); samples[k]++; if (!gasFree(P2, 60) && !(i > tr.n - 6)) inside[k]++; } });
    const rows = movers.h2o.filter(M => M.chain > 1).map(M => { let zmin = 1e9, zmax = -1e9, x0 = M.tr.A[0], y0_ = M.tr.A[1], far = 0; for (let i = 0; i < M.tr.n; i++) { const z = M.tr.A[i * 3 + 2]; zmin = Math.min(zmin, z); zmax = Math.max(zmax, z); far = Math.max(far, Math.hypot(M.tr.A[i * 3] - x0, M.tr.A[i * 3 + 1] - y0_)); } return { along: zmax - zmin, across: far }; });
    const dens = (() => { /* carbon dioxide at one moment: molecules per (10 µm)³ outside the leaf, near the stoma, and in its air spaces */
      const c = { out: 0, in: 0 }; for (const M of movers.co2) { const per = M.tr.L / M.speed + M.gap, s = ((3.3 + M.phase * per) % per) * M.speed; if (s > M.tr.L) continue; at(M.tr, s, P2);
        if (P2.y < EPI_B && P2.distanceTo(V(HOLE.x, y0 - 38000, 4000)) < 32000) c.out++; else if (P2.y > EPI_T && P2.y < y1 && Math.abs(P2.x - HOLE.x) < 2.6 * PX) c.in++; }
      return { out: c.out / ((4 / 3 * Math.PI * 32 ** 3) / 1000), in: c.in / ((5.2 * PX / 1000) * ((y1 - EPI_T) / 1000) * 21 / 1000) }; })();
    return { inside, samples, rows, density: dens, size: { co2: 2 * OC + 2 * RO, water: WW }, x: FILM_X, heroes: Object.fromEntries(Object.entries(H).map(([k, h]) => [k, Math.round(h.tr.L)])),
      /* (the wall from near: wet.js; where it stands: on the cut face's edge, air above it) */
      wet: wet.check(), wall: { at: [WALLP.p.x, WALLP.p.y, WALLP.p.z], slope: WALLP.slope, tilt: WALLP.tilt, behind: WALLP.behind, fromCave: WALLP.p.distanceTo(CAVE), airAbove: gasFree(WALLP.p.clone().add(V(0, 2500, -700)), 200), inCell: !!inSpongy(WALLP.p.clone().add(V(0, -1500, -700)), 0) } };
  }
  return { group: g, views: VI, shots, frame, now, route, check, near: () => wet.state() };
}
