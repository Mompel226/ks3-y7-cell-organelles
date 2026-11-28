/* ============================================================
   osmosis.js — step 2 of the cell fractionation lab as a counted liquid (18 Nov 2026): the liquid inside an organelle
   (left) and the medium the pupil chose (right), with the organelle's membrane between them. It is the small real
   liquid of the water-potential view (js/water/liquid.js: molecules that touch and push each other apart, each with a
   random thermal movement, pores that hold water molecules in single file, each surface free to move), so nothing is
   steered: more water molecules cross towards the side with more solute particles because, there, fewer of the
   particles that reach a pore are water molecules. The crossings are counted both ways.
   Three media: pure water (no solute particle at all: 304 water molecules have the pressure of the other mixtures at
   the starting volume, measured as tools/water-check.mjs K measures them), the isotonic solution (the same mixture as
   inside the organelle) and the concentrated solution. A run is 15 seconds of the page (a minute of the liquid: SPEED)
   with fixed random numbers, so the run a pupil watches is the run the check counted (osmosisCheck;
   tools/fractionation-check.mjs --only numbers).
   The runs are chosen to be ORDINARY (a science read, 18 Nov 2026: the first three, of ten seconds, were clearer than
   the model: 10 and 2, 3 and 3, 1 and 9, where sixty runs give 6 and 3, 4 and 4, 2 and 3; a pupil read "out" as 2, 3,
   9: water leaving faster into a concentrated medium). What the model really says, and these runs show: about as many
   water molecules LEAVE the organelle in every medium (10 of sixty runs' average in a minute: its own liquid does not
   change); what changes is how many ENTER (18 from pure water, 10 from the isotonic solution, 6 from the concentrated
   one). Each chosen run is within 2 of both averages.
   ============================================================ */
import { LIQ, makeLiquid } from '../water/liquid.js?v=202611281626';

export const OSM = {
  END: 15, SPEED: 4,                                   /* a run, in seconds of the page; seconds of the liquid in one of them */
  RUNS: {
    water: { L: 'mid', R: [304, 0], seed: 59, dir: 1 },   /* dir: +1 = the organelle gains water, −1 = it loses water, 0 = neither */
    iso: { L: 'mid', R: 'mid', seed: 7, dir: 0 },
    conc: { L: 'mid', R: 'hi', seed: 26, dir: -1 }
  },
  MEAN: { water: [17.8, 9.8], iso: [10.4, 10.0], conc: [5.9, 10.6] }   /* into and out of the organelle at the end: the average of seeds 1 to 60 */
};
const PER = Math.round(OSM.SPEED / LIQ.DT);            /* steps of the liquid in a second of the page */
export const STEPS = OSM.END * PER;                    /* the steps of a whole run */
export const makeOsmosis = (v, seed) => makeLiquid(OSM.RUNS[v], seed == null ? OSM.RUNS[v].seed : seed);
/* a liquid at a time of its run (never back): the same steps whatever the frames were */
export const osmosisTo = (L, secs) => { const want = Math.round(Math.min(secs, OSM.END) * PER); if (want > L.steps) L.step(want - L.steps); return L; };
/* into the organelle (the left box) and out of it */
export const counts = L => ({ in: L.c.RL, out: L.c.LR });

/* a run second by second, and what must be true of it: no solute particle crosses, nothing leaves its box; a medium
   that is not isotonic: from 4 s never more against the net movement than with it, from 7 s at least 2 more with it;
   isotonic: the two counts never more than 2 apart, and at most 1 apart at the end; every run: both counts at the end
   within 2 of the model's averages (MEAN: an ordinary run) and at least 4 (the count shows both ways) */
export function osmosisCheck(v, seed) {
  const R = OSM.RUNS[v], L = makeOsmosis(v, seed), s0 = L.state(), rows = []; let bad = 0, wrong = 0;
  for (let s = 1; s <= OSM.END; s++) {
    for (let k = 1; k <= 4; k++) { osmosisTo(L, s - 1 + k / 4); const q = L.state(); if (q.solute[0] !== s0.solute[0] || q.solute[1] !== s0.solute[1] || q.moved || q.out || q.deep) bad++; }
    const c = counts(L), a = R.dir > 0 ? c.in : c.out, b = R.dir > 0 ? c.out : c.in;
    if (R.dir) { if ((s >= 4 && b > a) || (s >= 7 && a - b < 2)) wrong++; }
    else if (Math.abs(c.in - c.out) > 2 || (s === OSM.END && Math.abs(c.in - c.out) > 1)) wrong++;
    if (s === OSM.END && (Math.abs(c.in - OSM.MEAN[v][0]) > 2 || Math.abs(c.out - OSM.MEAN[v][1]) > 2 || c.in < 4 || c.out < 4)) wrong++;
    rows.push({ s, in: c.in, out: c.out, h: [L.h[0], L.h[1]] });
  }
  return { rows, bad, wrong, end: rows[rows.length - 1], solute: s0.solute, water: s0.water };
}

/* the picture of a liquid on a canvas: o = { L, sx, sy, hs (what is drawn: it follows the molecules a little behind),
   X, Y (liquid units to pixels), u (pixels a unit), col: { sol, w, s, sline, mem, glass, ring }, right (false: only
   the organelle's side is drawn, before a medium is chosen), dimW, dimS (0 to 1: water molecules or solute particles
   drawn pale), ring (a molecule that has just crossed), ringA } */
export function drawLiquid(ctx, o) {
  const { L, X, Y, u, col } = o, T = LIQ.T, WB = LIQ.WB, hT = T / 2, n = L.N, TAU2 = 6.2832, MT = LIQ.H0 + 4.6;
  const xl = X(-hT - WB), xm = X(-hT), xr = X(hT), xe = X(hT + WB), fl = Y(0);
  ctx.globalAlpha = 1; ctx.fillStyle = col.sol;
  ctx.fillRect(xl, Y(o.hs[0]), xm - xl, fl - Y(o.hs[0]));
  if (o.right) { ctx.fillRect(xr, Y(o.hs[1]), xe - xr, fl - Y(o.hs[1])); for (const p of L.py) ctx.fillRect(xm - 1, Y(p + LIQ.PW), xr - xm + 2, 2 * LIQ.PW * u); }
  const rw = u * 1.06, rs = LIQ.RS * u * 1.02, seen = i => o.right || o.sx[i] < -hT;
  ctx.globalAlpha = o.dimW ? 0.3 : 1; ctx.fillStyle = col.w; ctx.beginPath();
  for (let i = 0; i < n; i++) if (!L.sol[i] && seen(i)) { const x = X(o.sx[i]), y = Y(o.sy[i]); ctx.moveTo(x + rw, y); ctx.arc(x, y, rw, 0, TAU2); }
  ctx.fill(); ctx.strokeStyle = col.sol; ctx.lineWidth = Math.max(0.9, u * 0.17); ctx.stroke();
  ctx.globalAlpha = o.dimS ? 0.3 : 1; ctx.fillStyle = col.s; ctx.strokeStyle = col.sline; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 0; i < n; i++) if (L.sol[i] && seen(i)) { const x = X(o.sx[i]), y = Y(o.sy[i]); ctx.moveTo(x + rs, y); ctx.arc(x, y, rs, 0, TAU2); }
  ctx.fill(); ctx.stroke();
  /* a water molecule that has just crossed: a ring for a moment (what the count counts) */
  if (o.ring >= 0 && o.ringA > 0.02) { ctx.globalAlpha = o.ringA; ctx.strokeStyle = col.ring; ctx.lineWidth = Math.max(1.6, u * 0.32); ctx.beginPath(); ctx.arc(X(o.sx[o.ring]), Y(o.sy[o.ring]), rw + Math.max(3, u * 0.6), 0, TAU2); ctx.stroke(); }
  /* the membrane's solid parts between its pores, and the container */
  ctx.globalAlpha = 1; ctx.fillStyle = col.mem;
  L.blocks.forEach(([b0, b1]) => { const y0 = Math.max(b0, 0), y1 = Math.min(b1, MT); if (y1 > y0) ctx.fillRect(xm, Y(y1), xr - xm, (y1 - y0) * u); });
  ctx.strokeStyle = col.glass; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xl, Y(MT)); ctx.lineTo(xl, fl); ctx.lineTo(xe, fl); ctx.lineTo(xe, Y(MT)); ctx.stroke();
}
