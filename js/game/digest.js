/* ============================================================
   digest.js — the test's close view (18 Nov 2026; the places planner's plan-test): what happens in a well of the
   spotting tile during its five minutes, as numbers only (no drawing here: main.js draws them, tools check them).

   A model, and the close view says so: a real starch chain has hundreds or thousands of glucose units, and here one
   short piece of a chain has 16; five minutes pass in four seconds, and the picture's speed is not the real speed. Sizes are true to one another: a
   glucose unit 0.5 nm along the chain; amylase 8 nm long and 5 nm wide (human salivary alpha-amylase, PDB 1SMD:
   amylase-data.js), its active site a groove in the middle of one long side.

   WHAT THE NUMBERS MUST SHOW (plan-test, biology risks):
   - Salivary amylase breaks bonds INSIDE a starch chain, at many places; it does not take units off one end one by one.
   - The product is maltose, two units (0610 7.4.6(a)): never one glucose unit (that is maltase's work, 7.4.6(b)). So a
     bond is cut only where both pieces keep an even number of units.
   - Amylase is not changed and not used up (5.1.1): the same molecule cuts again and again.
   - Nothing is steered: the chains and the enzyme move at random (a seeded random walk, the same every time, as
     wayflow.js), and a bond is cut when it has come to lie in the active site by that movement. The piece then lies in
     the site for a moment (the enzyme holds its substrate) while the bond breaks, and the two pieces leave.
   - One water molecule is used for each bond broken (IB B1.1.3: hydrolysis): the count of water equals the cuts.
   - Without amylase (well B) the same chains move and stay whole.

   run({ enzyme, seed }) → { T, frames, cuts, pieces0, box, check }
     frames[t] = { enz: { x, y, a } | null, pieces: [{ id, n, x, y, a }] }   (nm; a: angle, radians; x, y: its middle)
     cuts = [{ t, at: [x, y], from: id, into: [id, id], units: [n, n] }]      (in the order they happen)
   check(result) → { ok, why[] }: every rule above, on the numbers.
   ============================================================ */
export const UNIT = 0.5, ENZ = { L: 8, W: 5 }, BOX = 15, TICKS = 720, SEED = 4397;   /* (SEED: of the first 8000 seeds, four end with every piece of two units, the first cut and two or more inside the chain, each cut after a new meeting, every unit inside the view, no unit of a free piece on the enzyme's body and no two pieces on each other in any frame, with the control whole too: 895, 4119, 4318, 4397. With 4397 the first cut is in the chain's middle and the second in a half's middle: 8 + 8, 4 + 4, 2 + 2, 2 + 6, 2 + 4, 2 + 2, 2 + 2) */
/* how far each part moves in a tick, how near a bond must come to the site, how long the piece lies in it (ticks) */
export const MOVE = { piece: 0.9, enz: 0.7, turn: 0.22, near: 2.0, hold: 30, rest: 20, part: 0.7, off: 0.5, apart: 1.3 };   /* (hold: 30 ticks, about 0.17 s of the 4 s: with 10 no frame showed the chain in the site; apart: nm between the nearest points of two free pieces: two maltose on each other read as a longer chain, and one piece across another as a branched molecule: the second and third science reads, 18 Nov 2026) */   /* (part: how fast the two pieces leave; rest: ticks before the enzyme can hold a chain again, so that each cut needs a new meeting) */
const rng = seed => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
/* the active site: the middle of the enzyme's long side that faces its own +y */
export const siteOf = e => ({ x: e.x - Math.sin(e.a) * ENZ.W / 2, y: e.y + Math.cos(e.a) * ENZ.W / 2 });
/* the middle of bond b of a piece (between its units b and b + 1, counted from its first end) */
/* the gap between two pieces, each the line through the middles of its end units: its length d (nm) and its direction (x, y), from a to b */
export const gapOf = (a, b) => {
  const seg = p => { const h = (p.n - 1) / 2 * UNIT, c = Math.cos(p.a), s = Math.sin(p.a); return [p.x - c * h, p.y - s * h, p.x + c * h, p.y + s * h]; };
  const [ax, ay, bx, by] = seg(a), [cx, cy, dx, dy] = seg(b);
  const near = (px, py, x1, y1, x2, y2) => { const vx = x2 - x1, vy = y2 - y1, l = vx * vx + vy * vy, t = l ? Math.max(0, Math.min(1, ((px - x1) * vx + (py - y1) * vy) / l)) : 0; return [x1 + vx * t, y1 + vy * t]; };
  const o = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
  if (o(ax, ay, bx, by, cx, cy) * o(ax, ay, bx, by, dx, dy) < 0 && o(cx, cy, dx, dy, ax, ay) * o(cx, cy, dx, dy, bx, by) < 0) return { d: 0, x: 0, y: 0 };   /* (they cross) */
  let best = null;
  [[ax, ay, 1, cx, cy, dx, dy], [bx, by, 1, cx, cy, dx, dy], [cx, cy, -1, ax, ay, bx, by], [dx, dy, -1, ax, ay, bx, by]].forEach(([px, py, sgn, x1, y1, x2, y2]) => { const [qx, qy] = near(px, py, x1, y1, x2, y2), d = Math.hypot(qx - px, qy - py); if (!best || d < best.d) best = { d, x: d ? sgn * (qx - px) / d : 0, y: d ? sgn * (qy - py) / d : 0 }; });
  return best;
};
export const bondOf = (p, b) => { const d = (b + 1 - p.n / 2) * UNIT; return { x: p.x + Math.cos(p.a) * d, y: p.y + Math.sin(p.a) * d }; };
export function run({ enzyme = true, seed = SEED, ticks = TICKS, M = MOVE, box = BOX } = {}) {
  const BOX = box, R = rng(seed), g = () => (R() + R() + R() - 1.5) * 1.15, H = BOX / 2;
  let nid = 0;
  /* one short piece of a starch chain, 16 glucose units (8 nm: as long as amylase) */
  const pieces = [{ id: nid++, n: 16, x: -1.6, y: 4.2, a: 0.25 }];
  const pieces0 = pieces.map(p => ({ ...p }));
  const enz = enzyme ? { x: 2.0, y: -3.2, a: 2.6, hold: 0, wait: 0 } : null;
  const frames = [], cuts = [];
  /* every unit of a free piece keeps M.off nm clear of the enzyme's outline (an ellipse): the piece is pushed straight
     out, by its unit that lies deepest in (its middle alone kept clear before, so a piece could lie along the body's
     edge with its units on it: the film of 18 Nov) */
  const offBody = (p, e) => { const c = Math.cos(e.a), s = Math.sin(e.a), A = ENZ.L / 2 + M.off, B = ENZ.W / 2 + M.off, ux = Math.cos(p.a), uy = Math.sin(p.a);
    for (let pass = 0; pass < 3; pass++) { let worst = 1, wl = null;
      for (let i = 0; i < p.n; i++) { const d = (i + 0.5 - p.n / 2) * UNIT, dx = p.x + ux * d - e.x, dy = p.y + uy * d - e.y, lx = dx * c + dy * s, ly = -dx * s + dy * c, v = (lx / A) ** 2 + (ly / B) ** 2; if (v < worst) { worst = v; wl = [lx, ly]; } }
      if (!wl) return; const k = 1 / Math.sqrt(Math.max(worst, 1e-4)) - 1, mx = wl[0] * k, my = wl[1] * k; p.x += mx * c - my * s; p.y += mx * s + my * c; } };
  /* two free pieces never lie on each other: each is a line of units, and the nearest points of the two lines keep
     M.apart nm apart: each piece is pushed half the way, straight apart (the third science read, 18 Nov 2026: a piece
     of four units across a piece of six read as a branched molecule, and then as a branch that left with no amylase.
     Before, only the middles of two small pieces were kept apart) */
  const apart = () => { for (let i = 0; i < pieces.length; i++) for (let j = i + 1; j < pieces.length; j++) { const a = pieces[i], b = pieces[j]; if (a.held && b.held) continue;
    const g = gapOf(a, b); if (g.d >= M.apart) continue;
    let nx = g.x, ny = g.y; if (g.d < 1e-6) { nx = b.x - a.x; ny = b.y - a.y; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l; if (!isFinite(nx) || (!nx && !ny)) { nx = 1; ny = 0; } }
    const k = (M.apart - g.d) * (a.held || b.held ? 1 : 0.5);
    if (!a.held) { a.x -= nx * k; a.y -= ny * k; } if (!b.held) { b.x += nx * k; b.y += ny * k; } } };
  const wall = (o, r) => { if (o.x < -H + r) o.x = -H + r + (-H + r - o.x); if (o.x > H - r) o.x = H - r - (o.x - (H - r)); if (o.y < -H + r) o.y = -H + r + (-H + r - o.y); if (o.y > H - r) o.y = H - r - (o.y - (H - r)); };
  for (let t = 0; t <= ticks; t++) {
    frames.push({ enz: enz ? { x: enz.x, y: enz.y, a: enz.a } : null, pieces: pieces.map(p => ({ id: p.id, n: p.n, x: p.x, y: p.y, a: p.a })) });
    if (t === ticks) break;
    /* every part moves at random: a small part moves more than a large one */
    /* (the science read, 18 Nov 2026: a piece stays whole inside the view, so the control's chain is never cut by the
       view's edge; and a free piece keeps off amylase's body: on the body it read as binding anywhere, and the site
       is the groove) */
    pieces.forEach(p => { if (p.held) return; const k = M.piece / Math.sqrt(p.n / 2); p.x += g() * k + (p.vx || 0); p.y += g() * k + (p.vy || 0); p.a += g() * M.turn; p.vx = (p.vx || 0) * 0.8; p.vy = (p.vy || 0) * 0.8;
      if (enz) offBody(p, enz); wall(p, p.n * UNIT / 2 + 0.35); });
    if (!enz) continue;
    apart();
    if (enz.hold > 0) {
      /* the piece lies in the active site while its bond breaks; then the two pieces leave, each to its own side */
      enz.hold--;
      if (enz.hold === 0) {
        const p = enz.piece, b = enz.bond, i = pieces.indexOf(p), s = siteOf(enz), n1 = b + 1, n2 = p.n - n1, ux = Math.cos(p.a), uy = Math.sin(p.a);
        const A = { id: nid++, n: n1, x: p.x - ux * (p.n - n1) / 2 * UNIT, y: p.y - uy * (p.n - n1) / 2 * UNIT, a: p.a, vx: -ux * M.part, vy: -uy * M.part };
        const B = { id: nid++, n: n2, x: p.x + ux * (p.n - n2) / 2 * UNIT, y: p.y + uy * (p.n - n2) / 2 * UNIT, a: p.a, vx: ux * M.part, vy: uy * M.part };
        pieces.splice(i, 1, A, B); cuts.push({ t: t + 1, at: [s.x, s.y], from: p.id, into: [A.id, B.id], units: [n1, n2] });
        enz.piece = null; enz.wait = M.rest;
      }
      continue;
    }
    enz.x += g() * M.enz; enz.y += g() * M.enz; enz.a += g() * M.turn * 0.9; wall(enz, 4.1);
    pieces.forEach(p => { if (!p.held) { offBody(p, enz); wall(p, p.n * UNIT / 2 + 0.35); } });   /* (the enzyme has moved: no free piece is left under it) */
    apart();
    if (enz.wait > 0) { enz.wait--; continue; }
    /* a bond that both pieces of two or more units would keep even has come to the active site: the piece lies in it */
    const s = siteOf(enz);
    for (const p of pieces) {
      if (p.n <= 2) continue;
      /* (of its bonds that may be cut, the one nearest the site: with the first one found, every cut took two units off an end) */
      let hit = -1, hd = M.near; for (let b = 1; b < p.n - 1; b += 2) { const q = bondOf(p, b), d = Math.hypot(q.x - s.x, q.y - s.y); if (d < hd) { hd = d; hit = b; } }
      if (hit < 0) continue;
      /* it turns to lie along the groove, its bond on the site */
      const q = bondOf(p, hit); p.a = enz.a; const q2 = bondOf(p, hit); p.x += s.x - q2.x; p.y += s.y - q2.y; p.held = true; p.vx = p.vy = 0;
      enz.hold = M.hold; enz.piece = p; enz.bond = hit; break;
    }
  }
  return { T: ticks, frames, cuts, pieces0, box: BOX, enzyme: !!enzyme, seed };
}
/* the rules, on the numbers */
export function check(r) {
  const why = [], last = r.frames[r.frames.length - 1], units = ps => ps.reduce((s, p) => s + p.n, 0);
  if (!r.frames.every(f => units(f.pieces) === units(r.pieces0))) why.push('a glucose unit is lost or made');
  if (r.enzyme) {
    if (!last.pieces.every(p => p.n === 2)) why.push('at the end not every piece has two units: ' + last.pieces.map(p => p.n).join(','));
    if (r.cuts.length !== units(r.pieces0) / 2 - r.pieces0.length) why.push('cuts: ' + r.cuts.length);
    if (!r.cuts.every(c => c.units[0] >= 2 && c.units[1] >= 2 && c.units[0] % 2 === 0 && c.units[1] % 2 === 0)) why.push('a cut leaves an odd piece or a single unit');
    /* (cuts that each take two units off an end would read as "one maltose off the end each time": the first cut, and
       two or more in all, must be inside a chain, four units or more from each of its ends) */
    if (r.cuts.length && Math.min(...r.cuts[0].units) < 4) why.push('the first cut is at an end of the chain: ' + r.cuts[0].units.join('+'));
    if (r.cuts.filter(c => Math.min(...c.units) >= 4).length < 2) why.push('fewer than two cuts inside a chain');
    if (!r.frames.every(f => f.enz && Math.abs(f.enz.x) <= r.box / 2 && Math.abs(f.enz.y) <= r.box / 2)) why.push('the enzyme leaves the view');
    if (r.cuts.length && r.cuts[r.cuts.length - 1].t > r.T * 0.9) why.push('the last cut comes too late to be seen: tick ' + r.cuts[r.cuts.length - 1].t);
    if (r.cuts.some((c, i) => i && c.t - r.cuts[i - 1].t < 30)) why.push('two cuts follow each other with no new meeting between them');
  } else {
    if (r.cuts.length || last.pieces.length !== r.pieces0.length || !last.pieces.every((p, i) => p.n === r.pieces0[i].n)) why.push('without the enzyme a chain was cut');
  }
  const H = r.box / 2, ends = p => [-1, 1].map(s => [p.x + s * Math.cos(p.a) * p.n * UNIT / 2, p.y + s * Math.sin(p.a) * p.n * UNIT / 2]);
  if (!r.frames.every(f => f.pieces.every(p => ends(p).every(([x, y]) => Math.abs(x) <= H + 0.01 && Math.abs(y) <= H + 0.01)))) why.push('a unit of a piece is outside the view');
  if (r.enzyme) { const held = new Set(); r.cuts.forEach(c => { for (let t = c.t - MOVE.hold - 2; t <= c.t; t++) held.add(t + ':' + c.from); });
    /* (every unit of a free piece, not its middle alone; a piece that has just been cut is leaving the groove for 8 ticks) */
    const born = new Map(); r.cuts.forEach(c => c.into.forEach(id => born.set(id, c.t)));
    const on = r.frames.reduce((n, f, t) => n + f.pieces.filter(p => !held.has(t + ':' + p.id) && !(born.has(p.id) && t - born.get(p.id) < 8) && [...Array(p.n)].some((_, i) => { const d = (i + 0.5 - p.n / 2) * UNIT, c = Math.cos(f.enz.a), s = Math.sin(f.enz.a), dx = p.x + Math.cos(p.a) * d - f.enz.x, dy = p.y + Math.sin(p.a) * d - f.enz.y, lx = dx * c + dy * s, ly = -dx * s + dy * c; return (lx / (ENZ.L / 2)) ** 2 + (ly / (ENZ.W / 2)) ** 2 < 0.9; })).length, 0);
    if (on > 6) why.push('a unit of a free piece lies on the enzyme\'s body: ' + on + ' piece-ticks'); }
  /* (in every frame no two pieces lie on each other: their lines keep 0.45 nm apart; the two pieces of a cut are leaving
     each other for 10 ticks, and a piece that is held lies where the site is) */
  { const born = new Map(), heldAt = new Set(); r.cuts.forEach(c => { c.into.forEach(id => born.set(id, c.t)); for (let t = c.t - MOVE.hold - 2; t <= c.t; t++) heldAt.add(t + ':' + c.from); });
    let on = 0; r.frames.forEach((f, t) => { const P = f.pieces; for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const a = P[i], b = P[j];
      if ((born.has(a.id) && born.has(b.id) && born.get(a.id) === born.get(b.id) && t - born.get(a.id) < 10) || heldAt.has(t + ':' + a.id) || heldAt.has(t + ':' + b.id)) continue;
      if (gapOf(a, b).d < 0.45) on++; } });
    if (on > 4) why.push('two pieces lie on each other: ' + on + ' pair-ticks'); }
  return { ok: !why.length, why };
}
