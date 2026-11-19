/* ============================================================
   protons.js — the protons of step 11 of "From light to glucose" as they really move (17 Nov 2026; Daniel's rule for the
   IB views, memory teach-on-the-picture: a process whose line names a gradient is shown as MANY particles, each on a
   random walk, with the crossings counted both ways, as the game's way in does: js/game/wayflow.js). The guide's line
   (C1.3.12): "Protons diffuse from the lumen back into the stroma, down their concentration gradient, through ATP
   synthase". Four protons on drawn paths showed none of that. Here, in numbers only (scenes.js draws them, the check
   runs them):
   - NL protons in the lumen and NS in a part of the stroma of about the same area (a concentration is always compared
     in equal volumes), each with a velocity that changes a little at random every step: none is steered;
   - the membrane lets no proton through; the only way across is the channel of ATP synthase. A proton that wanders
     to the channel's opening on its side goes through and comes out on the other side; both directions are counted.
     More protons reach the opening from the lumen, where there are more of them: the net movement is to the stroma;
   - the lumen is kept full, as the electron transport chain keeps it (step 10): each proton that leaves the lumen is
     followed by one pumped in at cytochrome b6f; a proton that wanders off the stroma's edge of the picture is gone
     (the stroma is large), and one comes in now and then, so the stroma keeps its few.
   One proton is followed (HERO, ringed on the picture): chosen to begin far from ATP synthase, to cross to the stroma
   after some seconds and, in this run, to cross back later: a random walk, which no force pulls. scenes.js outlines the
   watched part of the stroma, so a proton that leaves the picture is seen to leave a box, and the two numbers of
   protons are seen to compare two equal areas. (18 Nov 2026, after the science read: until then the followed proton
   began beside the channel and was gone after 6 s, and protons moved under the name "lumen".)
   The random numbers are fixed (SEED, chosen by protonCheck: every second of a minute the count says what diffusion
   down a gradient does), and the sums use only + − × ÷ and square roots, so every browser shows the checked run.
   Units: the picture's own (scenes.js: a sheet 1000 wide); time in seconds; the pace is slowed, as in every picture.
   ============================================================ */
export const PR = {
  NL: 24, NS: 3, S: 58, TAU: 0.45, DT: 1 / 30, R: 9,
  LX0: 96, LX1: 990, LY0: 406, LY1: 484,                 /* the lumen (between the two membranes; from 96: no proton under the name "lumen" at the left) */
  UNDER: [[225, 355], [430, 510], [590, 720]], UY: 459,   /* under the three complexes the lumen is lower: they reach into it */
  SX0: 742, SX1: 992, SY0: 70, SY1: 322,                 /* the part of the stroma that is watched (about the lumen's area) */
  HEAD: [900, 238, 70, 62], STALK: [884, 916],           /* ATP synthase's head and stalk: no proton inside them */
  IN: [900, 400], OUT: [950, 316], MOUTH: 21,            /* the channel's opening in the lumen, and in the stroma */
  PASS: 0.9, CLEAR: 3, PUMP: [[455, 250], [468, 300], [468, 452], [468, 472]], PUMP_S: 1.1,
  SEED: 289, HERO: 18, END: 60, STILL: 30
};
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

export function makeProtons(seed = PR.SEED) {
  const P = PR, r = rng(seed), g = () => (r() + r() + r() + r() - 2) * 1.7320508075688772, k = Math.sqrt(2 * P.DT / P.TAU), damp = 1 - P.DT / P.TAU;
  const c = { up: 0, down: 0, pumped: 0 }, M = [];           /* a proton: where 'l' lumen, 's' stroma, 'u' going up the channel, 'd' down, 'p' pumped in */
  let t = 0, steps = 0, ids = 0, last = -1;
  const floorY = x => P.UNDER.some(([a, b]) => x > a - P.R && x < b + P.R) ? P.UY : P.LY0;
  const newL = () => { let x, y; do { x = P.LX0 + r() * (P.LX1 - P.LX0); y = P.LY0 + r() * (P.LY1 - P.LY0); } while (y < floorY(x) || Math.abs(x - P.IN[0]) < 60); return { id: ids++, w: 'l', x, y, vx: P.S * g(), vy: P.S * g(), q: 0, f: 1, home: 'l' }; };
  const inHead = (x, y) => { const dx = (x - P.HEAD[0]) / P.HEAD[2], dy = (y - P.HEAD[1]) / P.HEAD[3]; return dx * dx + dy * dy < 1 || (x > P.STALK[0] - P.R && x < P.STALK[1] + P.R && y > P.HEAD[1]); };
  const newS = edge => { let x, y; do { x = edge ? P.SX1 - 4 : P.SX0 + r() * (P.SX1 - P.SX0); y = P.SY0 + r() * (P.SY1 - P.SY0 - 40); } while (inHead(x, y) || (x - P.OUT[0]) * (x - P.OUT[0]) + (y - P.OUT[1]) * (y - P.OUT[1]) < 3600); return { id: ids++, w: 's', x, y, vx: edge ? -P.S : P.S * g(), vy: P.S * g(), q: 0, f: edge ? 0 : 1, home: 's' }; };
  for (let i = 0; i < P.NL; i++) M.push(newL());
  for (let i = 0; i < P.NS; i++) M.push(newS(false));
  function step() {
    for (let i = M.length - 1; i >= 0; i--) {
      const m = M[i];
      if (m.w === 'u' || m.w === 'd') {                      /* in the channel: P.PASS seconds from one opening to the other */
        m.q += P.DT / P.PASS;
        if (m.q >= 1) {
          if (m.w === 'u') { m.w = 's'; m.x = P.OUT[0]; m.y = P.OUT[1]; m.vx = P.S * 0.8; m.vy = -P.S * 0.8; c.up++; M.push({ id: ids++, w: 'p', x: P.PUMP[0][0], y: P.PUMP[0][1], vx: 0, vy: 0, q: 0, f: 0, home: 'l' }); }
          else { m.w = 'l'; m.x = P.IN[0]; m.y = P.IN[1] + 6; m.vx = P.S * g() * 0.5; m.vy = P.S * 0.8; c.down++; }
          m.q = P.CLEAR; last = m.id;
        }
        continue;
      }
      if (m.w === 'p') {                                      /* pumped in at cytochrome b6f, to keep the lumen as full as the chain keeps it */
        m.q += P.DT / P.PUMP_S; m.f = Math.min(1, m.q * 4);
        if (m.q >= 1) { m.w = 'l'; m.x = P.PUMP[3][0]; m.y = P.PUMP[3][1]; m.vx = P.S * g(); m.vy = P.S * 0.5; m.q = 0; c.pumped++; }
        continue;
      }
      m.vx = m.vx * damp + P.S * k * g(); m.vy = m.vy * damp + P.S * k * g();
      let x = m.x + m.vx * P.DT, y = m.y + m.vy * P.DT;
      if (m.q > 0) m.q = Math.max(0, m.q - P.DT);            /* just out of the channel: not back in at once */
      if (m.f < 1) m.f = Math.min(1, m.f + P.DT * 2.5);
      if (m.w === 'l') {
        if (x < P.LX0) { x = 2 * P.LX0 - x; m.vx = -m.vx; } else if (x > P.LX1) { x = 2 * P.LX1 - x; m.vx = -m.vx; }
        const fy = floorY(x);
        if (y < fy) { if (m.y >= fy) { y = 2 * fy - y; m.vy = -m.vy; } else { x = m.x; m.vx = -m.vx; y = Math.max(y, P.UY); } }
        if (y > P.LY1) { y = 2 * P.LY1 - y; m.vy = -m.vy; }
        m.x = x; m.y = y;
        const dx = x - P.IN[0], dy = y - P.IN[1];
        if (m.q === 0 && dx * dx + dy * dy < P.MOUTH * P.MOUTH) { m.w = 'u'; m.q = 0; }
      } else {
        if (inHead(x, y)) { m.vx = -m.vx; m.vy = -m.vy; x = m.x; y = m.y; }
        if (y > P.SY1) { y = 2 * P.SY1 - y; m.vy = -m.vy; }
        m.x = x; m.y = y;
        const dx = x - P.OUT[0], dy = y - P.OUT[1];
        if (m.q === 0 && dx * dx + dy * dy < P.MOUTH * P.MOUTH) { m.w = 'd'; m.q = 0; continue; }
        if (x < P.SX0 || x > P.SX1 + 6 || y < P.SY0) { M.splice(i, 1); }       /* off the watched part of the stroma */
      }
    }
    /* the stroma keeps its few: one comes in at the edge when there are fewer than NS */
    let ns = 0; for (const m of M) if (m.w === 's') ns++;
    if (ns < P.NS && r() < P.DT * 0.5) M.push(newS(true));
    t += P.DT; steps++;
  }
  return { M, c, step(n = 1) { for (let i = 0; i < n; i++) step(); }, get t() { return t; }, get steps() { return steps; }, get last() { return last; },
    count() { const o = { l: 0, s: 0, pass: 0, pump: 0 }; for (const m of M) o[m.w === 'l' ? 'l' : m.w === 's' ? 's' : m.w === 'p' ? 'pump' : 'pass']++; return o; },
    /* where a proton in the channel or being pumped is drawn */
    at(m) { if (m.w === 'u' || m.w === 'd') { const q = m.w === 'u' ? m.q : 1 - m.q, A = [P.IN, [900, 365], P.OUT], i = q < 0.6 ? 0 : 1, f = q < 0.6 ? q / 0.6 : (q - 0.6) / 0.4; return [A[i][0] + (A[i + 1][0] - A[i][0]) * f, A[i][1] + (A[i + 1][1] - A[i][1]) * f]; }
      if (m.w === 'p') { const n = P.PUMP.length - 1, e = Math.min(0.9999, m.q) * n, i = Math.floor(e), f = e - i; return [P.PUMP[i][0] + (P.PUMP[i + 1][0] - P.PUMP[i][0]) * f, P.PUMP[i][1] + (P.PUMP[i + 1][1] - P.PUMP[i][1]) * f]; }
      return [m.x, m.y]; } };
}

/* a minute, second by second: the two counts, how many protons each side holds, and whether any proton is where none
   may be (in the membrane outside the channel, in a complex, in ATP synthase's head) */
export function protonCheck(seed = PR.SEED, secs = 60) {
  const S = makeProtons(seed), P = PR, per = Math.round(1 / P.DT), rows = []; let wrong = 0, bad = 0, lo = 99, hi = 0;
  /* the followed proton (P.HERO): where it begins, the second it is first in the stroma, the second it is back in the
     lumen (0: never), the last second it is in the picture */
  const h0 = S.M.find(q => q.id === P.HERO), hero = { id: P.HERO, x0: h0 ? h0.x : 0, home: h0 ? h0.w : '', up: 0, back: 0, seen: 0 };
  for (let s = 1; s <= secs; s++) {
    for (let i = 0; i < per; i++) { S.step();
      for (const m of S.M) { if (m.w === 'l' && (m.y < P.LY0 - 1 || m.y > P.LY1 + 1 || (m.y < P.UY - 1 && P.UNDER.some(([a, b2]) => m.x > a && m.x < b2)))) bad++; if (m.w === 's' && m.y > P.SY1 + 1) bad++; }
    }
    { const m = S.M.find(q => q.id === P.HERO); if (m) { hero.seen = s; if (!hero.up && m.w === 's') hero.up = s; else if (hero.up && !hero.back && m.w === 'l') hero.back = s; } }
    const n = S.count(); lo = Math.min(lo, n.l + n.pass + n.pump); hi = Math.max(hi, n.s);
    if (S.c.down > S.c.up || (s >= 10 && S.c.up - S.c.down < 2) || (s >= 25 && S.c.up < 2 * S.c.down)) wrong++;
    rows.push({ s, up: S.c.up, down: S.c.down, lumen: n.l, stroma: n.s });
  }
  return { wrong, bad, rows, hero, lo, hi, total: rows[rows.length - 1] };
}
