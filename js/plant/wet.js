/* ============================================================
   wet.js — the leaf's film of transpiration with IB on, from near (19 Nov 2026): the outer face of the cell wall of
   a spongy mesophyll cell, where the film's section cuts it, with every molecule at its true size.
   Daniel, 18 Nov 2026, of the film as it was with IB on: "you should zoom in and you should see how basically water is
   pulled by the transpiration pull, by cohesion and adhesion, and it's by capillarity moving between the cells. So
   there's kind of a layer of water around the cells … and when it gains enough kinetic energy, then it evaporates
   from there, and then it becomes water vapor, and then it leaves"; "right now, it seems that you're providing IB
   content with the simplification of Key Stage 3".
   What the guide asks (first assessment 2025): B3.2.7 "loss of water by transpiration from cell walls in leaf cells
   causes water to be drawn out of xylem vessels and through cell walls by capillary action, generating tension";
   A1.1.2 hydrogen bonds between water molecules, drawn with δ+ and δ−; A1.1.3 cohesion; A1.1.4 adhesion "to materials
   that are polar or charged … capillary action … in plant cell walls". The words: text.js COURSE.ib.leaf, FILMS.h2oib.

   The picture (nm; x across the wall's face, y out of the wall into the air space, z towards the viewer):
   - cellulose fibres of the wall's outermost layer, cut across by the section: each about 3 nm wide (the wall step's
     fibre: 6 sheets of 4 chains, sheets 0.39 nm apart, chains 0.82 nm apart: Nishiyama, Langan & Chanzy 2002; Fernandes
     et al. 2011), each chain's cut end a small bar, and at the fibre's surface some of its −OH groups (cellulose is
     polar: the IB line's "materials that are polar"). The fibres are drawn 7.2 nm from middle to middle, nearer than
     in a real first wall (20 to 40 nm, with other carbohydrates between: not drawn), so that two fit in one picture
     with the water between them; the wall is about 200 nm thick, and this is its outer 9 nm;
   - liquid water between and under the fibres: one layer of molecules, 0.29 nm from middle to middle (they touch:
     memory particle-model-in-diagrams), a column of them under every point of the water's surface; the surface hangs
     between two fibres (a meniscus) and climbs each fibre, whose top carries one layer of water molecules (water
     wets cellulose, and the air of a leaf's air spaces is nearly saturated with water vapour: a fibre there is never
     dry; Daniel's "layer of water around the cells"). The surface has its name and its line; where a molecule has
     just left, the line dips, and it comes back as the water under it moves up (the cause is seen, not a push from
     below). Its curve is drawn deeper than it is (at a leaf's 1 to 2 MPa of tension the surface between fibres this
     near would be almost flat), and the picture says so;
   - under the outermost layer of fibres the wall's deeper layers are drawn too, each turned from the last (the wall
     step's "fibres, in layers"): they are seen on the way in;
   - evaporation: a molecule at the surface leaves it and goes off through the air space as water vapour, alone and
     fast; far fewer molecules are in the air than in the liquid (still many more than so small a space really holds:
     said on the picture);
   - capillary action: when a molecule has left, the column under it moves up by one molecule, at once along its
     whole length (liquid water does not stretch: cohesion), and a new molecule comes in at the bottom, from deeper in
     the wall. No molecule pulls another out of the liquid: the one that leaves has broken its hydrogen bonds;
   - from nearer still (the two shots about bonds), the same molecules are drawn with smaller atoms and a stick for
     each covalent bond, so that there is room for the hydrogen bonds: three thin pale dashes from a hydrogen atom to
     the oxygen atom of the next molecule (0.28 to 0.31 nm from oxygen to oxygen), water to water (cohesion) and
     between water and an −OH group of cellulose (adhesion: the named one is where the water's surface meets the
     fibre). The two named molecules stand in front of a dark veil, with O and H on their atoms and δ+ and δ−
     beside them, each on the outer side of its own atom. No molecule leaves during these two shots: the
     picture holds still to be read.
   The independent science read of 20 Nov 2026 asked for the layer of water on the fibres, the surface's name and its
   dip, the deeper layers, adhesion at the surface, the letters on the atoms, and the words of each shot's note.
   Simplified, and said on the picture: shown very much slower than it is; hydrogen bonds between water molecules break
   and form again all the time (here each stays); the other molecules of the air are not drawn.
   The film's time decides nothing here that a pupil must read: a still (Reduce motion) is a fixed moment of each shot.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { magicStandard } from '../world/magic.js?v=202611282133';
import { halo } from '../ib/stage.js?v=202611282133';

/* the numbers of the picture (nm) */
export const WET = {
  A: 0.29,                    /* from one water molecule to the next */
  PITCH: 7.2, FW: 1.85, FH: 1.42, FY: -1.45,      /* the fibres: from middle to middle; half their width and height; their middle */
  SHEETS: 6, CHAINS: 4, DS: 0.39, DC: 0.82,       /* a fibre: sheets of chains */
  CONTACT: -0.72, SAG: 0.5,   /* where the hanging surface meets a fibre's flank, and how far it hangs between two */
  FILM: 0.285,                /* the layer of water on a fibre's top: its molecules' middles this far from the fibre's outline */
  CLEAR: 0.285,               /* a water molecule's middle keeps this far from a fibre's outline: the oxygen atoms of the fibre's surface are there (one hydrogen bond's length) */
  WALL: 200,                  /* the wall's thickness: below it, the cell */
  OH: 0.097, OO: 0.285        /* a covalent O−H bond; from oxygen to oxygen along a hydrogen bond */
};

export function makeWet({ stage, rng, views, labels, origin, tilt = 0 }) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const { A, PITCH, FW, FH, FY, CONTACT, SAG, CLEAR } = WET;
  /* (tilt: the piece is turned by the few degrees that the cut cell's outline slopes there, and the two views with it,
     so that the wall's face is level in the picture and lies along the real outline) */
  const g = new THREE.Group(); g.name = 'wet wall'; g.position.copy(origin); g.rotation.z = tilt; g.visible = false;
  const ZA = new THREE.Vector3(0, 0, 1), world = p => p.clone().applyAxisAngle(ZA, tilt).add(origin);
  const NARROW = stage.W < 560;

  /* ---------------- the fibres ---------------- */
  /* (the four fibres whose water is drawn, molecule by molecule; the wall goes on to both sides: FALL, the fibres alone) */
  const FXS = [-1.5, -0.5, 0.5, 1.5].map(k => k * PITCH), FALL = Array.from({ length: 32 }, (_, k) => (k - 15.5) * PITCH);
  const YB = -9.6;
  const superK = (dx, dy, m) => Math.pow(Math.abs(dx) / (FW + m), 3) + Math.pow(Math.abs(dy) / (FH + m), 3);
  const fibreAt = x => (Math.round(x / PITCH - 0.5) + 0.5) * PITCH;
  const inFibre = (x, y, m = 0) => superK(x - fibreAt(x), y - FY, m) < 1;
  /* half the fibre's width at a height (with room m) */
  const halfW = (y, m = 0) => { const k = 1 - Math.pow(Math.abs(y - FY) / (FH + m), 3); return k <= 0 ? 0 : (FW + m) * Math.cbrt(k); };
  const CW = halfW(CONTACT);                         /* where the hanging surface meets the flank */
  /* the water's surface, at x. Between two fibres it hangs (a meniscus); over a fibre it lies on the one layer of water
     molecules that the fibre's top carries; where the two meet, the higher is the surface */
  const meniscus = x => { const d = Math.abs(x - fibreAt(x)), u = (d - PITCH / 2) / (PITCH / 2 - CW); return CONTACT - SAG * (1 - Math.min(1, u * u)); };
  const overTop = (x, m) => { const k = 1 - Math.pow(Math.abs(x - fibreAt(x)) / (FW + m), 3); return k <= 0 ? -1e9 : FY + (FH + m) * Math.cbrt(k); };
  /* (rounded where they meet: a sharp corner there would read as a step in the water) */
  const surface = x => { const m = meniscus(x), t = overTop(x, WET.FILM + 0.13); return t < -1e8 ? m : Math.log(Math.exp(8 * m) + Math.exp(8 * t)) / 8; };

  /* ---------------- the water: a column of molecules under every point of its surface ---------------- */
  const R = rng(4411);
  const cols = [], sites = [];
  const HWC = halfW(FY, CLEAR) + 0.005, NU = 14, NC = 10;      /* under a fibre: 13 columns; in a channel: 11, the first and the last beside the fibres */
  const XE = FXS[FXS.length - 1] + HWC;
  const addCol = (x, free) => {
    const d = Math.abs(x - fibreAt(x)); let top;
    if (free) top = surface(x) - 0.13;
    else { const k = 1 - Math.pow(d / (FW + CLEAR), 3); top = FY - (FH + CLEAR) * Math.cbrt(Math.max(0, k)) - 0.02; }      /* (under a fibre: from its lower face) */
    const c = { i: cols.length, x, free, top, sites: [], T: 2.6 + R() * 2, ph0: R(), next: 0, t0: -1e9, hold: false };      /* T: a molecule leaves its top every T seconds */
    for (let n = 0, y = top; y >= YB; n++, y = top - n * A) {
      const s = { c: c.i, n, x: x + (n ? (R() - 0.5) * 0.04 : 0), y: y + (n ? (R() - 0.5) * 0.04 : 0), th: 0, don: [-1, -1], acc: 0, ph: R() * 6.283, w1: 2.1 + R() * 2.4, w2: 1.7 + R() * 2.6, idx: sites.length };
      c.sites.push(s.idx); sites.push(s);
    }
    cols.push(c);
  };
  FXS.forEach((fx, f) => {
    for (let k = 1; k < NU; k++) addCol(fx - HWC + k * 2 * HWC / NU, false);
    if (f + 1 < FXS.length) for (let k = 0; k <= NC; k++) addCol(fx + HWC + k * (PITCH - 2 * HWC) / NC, true);
  });
  /* the layer of water on each fibre's top: a molecule every 0.29 nm along the outline, from its left shoulder to its
     right, 0.285 nm from it, wherever no molecule of a column stands already. These do not move up: each is a
     "column" of one (film) */
  FXS.forEach(fx => { let px = 0, py = 0, run = A;
    for (let k = 0; k <= 400; k++) { const a = Math.PI * (1 - k / 400), c = Math.cos(a), x = fx + (FW + WET.FILM) * Math.sign(c) * Math.pow(Math.abs(c), 2 / 3), y = FY + (FH + WET.FILM) * Math.pow(Math.max(0, Math.sin(a)), 2 / 3);
      if (k) run += Math.hypot(x - px, y - py); px = x; py = y;
      if (run < A || y < CONTACT + 0.1 || sites.some(q => (q.x - x) ** 2 + (q.y - y) ** 2 < 0.27 * 0.27)) continue; run = 0;
      const col = { i: cols.length, x, free: false, film: true, top: y, sites: [sites.length], T: 1, ph0: 0, next: 0, t0: -1e9, hold: false };
      sites.push({ c: col.i, n: 0, x, y, th: 0, don: [-1, -1], acc: 0, ph: R() * 6.283, w1: 2.1 + R() * 2.4, w2: 1.7 + R() * 2.6, idx: sites.length }); cols.push(col); } });

  /* ---------------- the −OH groups at the fibres' surfaces (cellulose is polar) ----------------
     One at the end of each chain of the top and bottom sheets, and at both ends of the four sheets between: 16 on a
     fibre. Its oxygen stands on the fibre's surface, its hydrogen 0.097 nm from it, towards the water. */
  const ohs = [];
  const normalAt = (dx, dy) => { const nx = Math.sign(dx) * Math.pow(Math.abs(dx) / FW, 2) / FW, ny = Math.sign(dy) * Math.pow(Math.abs(dy) / FH, 2) / FH, l = Math.hypot(nx, ny) || 1; return [nx / l, ny / l]; };
  const chainXY = (r, c) => [(c - (WET.CHAINS - 1) / 2) * WET.DC + (r % 2 ? 0.2 : -0.2), (r - (WET.SHEETS - 1) / 2) * WET.DS];
  FXS.forEach((fx, fi) => {
    const put = (dx, dy) => { const [nx, ny] = normalAt(dx, dy); ohs.push({ f: fi, o: [fx + dx, FY + dy], n: [nx, ny], n0: [nx, ny], h: null, site: -1 }); };      /* n0: the way out of the fibre there; n: the way its hydrogen points */
    for (let c = 0; c < WET.CHAINS; c++) { const xt = chainXY(WET.SHEETS - 1, c)[0], xb = chainXY(0, c)[0]; put(xt, FH * Math.cbrt(1 - Math.pow(Math.abs(xt) / FW, 3))); put(xb, -FH * Math.cbrt(1 - Math.pow(Math.abs(xb) / FW, 3))); }
    for (let r = 1; r < WET.SHEETS - 1; r++) { const y = chainXY(r, 0)[1], w = FW * Math.cbrt(1 - Math.pow(Math.abs(y) / FH, 3)); put(w, y); put(-w, y); }
  });
  /* each group that stands in the water points its hydrogen at a water molecule 0.25 to 0.35 nm from its oxygen, the one
     nearest the line out of the fibre; under a fibre and on its top (where nothing moves) that molecule then stands
     0.285 nm away exactly */
  const taken = new Set();
  ohs.forEach(q => {
    let best = null, bs = 1e9;
    for (const s of sites) { if (taken.has(s.idx)) continue; const dx = s.x - q.o[0], dy = s.y - q.o[1], d = Math.hypot(dx, dy); if (d < 0.25 || d > 0.35) continue;
      const ang = Math.acos(Math.max(-1, Math.min(1, (dx * q.n[0] + dy * q.n[1]) / d))); if (ang > 0.95) continue; const sc = Math.abs(d - WET.OO) + 0.12 * ang; if (sc < bs) { bs = sc; best = s; } }
    if (best) { taken.add(best.idx); q.site = best.idx; let dx = best.x - q.o[0], dy = best.y - q.o[1], l = Math.hypot(dx, dy); q.n = [dx / l, dy / l];
      if (!cols[best.c].free && (best.n > 0 || cols[best.c].film)) { best.x = q.o[0] + q.n[0] * WET.OO; best.y = q.o[1] + q.n[1] * WET.OO; }
      best.acc++; best.oh = true; }
    q.h = [q.o[0] + q.n[0] * WET.OH, q.o[1] + q.n[1] * WET.OH];
  });

  /* ---------------- which way each molecule turns: its two hydrogen atoms point at two neighbours ----------------
     A molecule has up to four neighbours here (above and below it in its column, and one in the column on each side).
     Its hydrogen atoms point at two of them that stand a quarter turn apart, never at one whose hydrogen points at it,
     and an oxygen takes two hydrogen bonds at most: so every dash drawn is one hydrogen atom between two oxygen atoms. */
  const nb = s => { const c = cols[s.c];
    /* (on a fibre's top: the molecule after it and the one before it along the layer) */
    if (c.film) { const along = d => { const k = cols[s.c + d], o = k && k.film ? sites[k.sites[0]] : null; return o && Math.hypot(o.x - s.x, o.y - s.y) < 0.36 ? o.idx : -1; }; return [along(1), -1, along(-1), -1]; }
    const side = d => { const k = cols[s.c + d]; if (!k || k.film) return -1; let best = -1, bd = 0.17; for (const j of k.sites) { const dy = Math.abs(sites[j].y - s.y); if (dy < bd) { bd = dy; best = j; } } return best; };
    return [side(1), s.n > 0 ? c.sites[s.n - 1] : -1, side(-1), s.n + 1 < c.sites.length ? c.sites[s.n + 1] : -1]; };      /* east, up, west, down */
  sites.forEach(s => { s.nb = nb(s); });
  const points = (a, b) => sites[a].don.includes(b);
  const order = sites.map(s => s.idx); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const DIRS = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  const aim = (s, pair) => {       /* pair: the first of two neighbours a quarter turn apart (0 … 3) */
    const k = [pair, (pair + 1) % 4], t = k.map(q => s.nb[q]);
    const ok = t.map(j => j >= 0 && !points(j, s.idx) && sites[j].acc < 2 && Math.hypot(sites[j].x - s.x, sites[j].y - s.y) <= 0.35);      /* (and no further than a hydrogen bond reaches) */
    return { k, t, ok, n: ok.filter(Boolean).length };
  };
  const turn = (s, pick) => {
    s.don = pick.t.map((j, q) => (pick.ok[q] ? j : -1)); s.don.forEach(j => { if (j >= 0) sites[j].acc++; });
    const v = pick.k.map((q, m) => { const j = pick.t[m]; if (j >= 0) { const o = sites[j]; const a = Math.atan2(o.y - s.y, o.x - s.x); return [Math.cos(a), Math.sin(a)]; } return [Math.cos(DIRS[q]), Math.sin(DIRS[q])]; });
    s.th = Math.atan2(v[0][1] + v[1][1], v[0][0] + v[1][0]);      /* the line that halves the angle between its two hydrogen atoms */
  };
  const assign = () => { for (const i of order) { const s = sites[i]; if (s.set) continue;
      const P = [0, 1, 2, 3].map(p => aim(s, p)); let best = P[0]; for (const p of P) if (p.n > best.n || (p.n === best.n && R() < 0.4)) best = p; turn(s, best); s.set = true; } };

  /* ---------------- the views: the wall's face (w1), and nearer, at the edge of one fibre (w2) ---------------- */
  const D = (x, y, z) => V(x, y, z).normalize(), UP = V(-Math.sin(tilt), Math.cos(tilt), 0);
  /* (a phone: the caption lies over the top of the picture, so each view looks at a higher point and the wall stands lower) */
  const W1 = V(0, NARROW ? 2.0 : -1.55, 0), W2 = V(NARROW ? 1.3 : 0.95, NARROW ? -1.0 : -1.62, 0), W2C = V(NARROW ? 1.3 : 0.95, NARROW ? -1.75 : -1.62, 0);      /* W2C: the middle of what w2 shows under the caption */
  const VI = {};
  VI.w1 = views.length; views.push({ zoom: 3, at: world(W1), dist: 60, dir: D(0.015, 0.02, 1), up: UP, fit: { pts: [[5.2, 6.2, 0.6]], min: 12 }, fitN: { pts: [[4.3, 5.0, 0.6]], min: 10 } });
  VI.w2 = views.length; views.push({ zoom: 3, at: world(W2), dist: 20, dir: D(0.015, 0.02, 1), up: UP, fit: { pts: [[1.76, stage.W >= 560 && stage.H < 720 ? 2.05 : 2.3, 0.6]], min: 4 } /* (a short laptop picture, under 720 px: a little nearer, so that an oxygen atom is 15 px across) */, fitN: { pts: [[1.3, 1.5, 0.6]], min: 3.2 } });

  /* the named bonds (the two shots at w2). Cohesion: two water molecules of one column of the middle channel, the upper
     one's hydrogen towards the lower one's oxygen: the bond stands upright, so its name's level line ends on it
     between the two and crosses neither. Adhesion: the −OH group nearest the water's surface on the flank of the
     fibre to the right of the middle channel (where the surface meets the fibre: adhesion holds it there), and the
     water molecule its hydrogen points to; its name's line ends on the group, from inside the fibre */
  const F2 = FXS[2];
  const COH = [W2C.x - (NARROW ? 0.55 : 0.75), W2C.y - (NARROW ? 0.15 : 0.5)];
  const cohA = (() => { let best = null, bd = 1e9; for (const s of sites) { if (!cols[s.c].free || s.oh || s.n < 2) continue; const lo = s.nb[3]; if (lo < 0 || sites[lo].oh) continue;
      const d = (s.x - COH[0]) ** 2 + (s.y - A / 2 - COH[1]) ** 2; if (d < bd) { bd = d; best = s; } } return best; })();
  const cohB = cohA ? sites[cohA.nb[3]] : null;
  /* (A: its hydrogen atoms towards the molecule below it and the east; B: towards the west and down, never back at A) */
  if (cohA) { turn(cohA, aim(cohA, 3)); cohA.set = true; turn(cohB, aim(cohB, 2)); cohB.set = true; }
  assign();
  const adh = (() => { let best = null, bd = 1e9; for (const q of ohs) { if (q.site < 0 || q.f !== 2 || q.n0[0] > -0.8) continue; const d = Math.abs(q.o[1] - (CONTACT - 0.5)); if (d < bd) { bd = d; best = q; } } return best; })();

  /* ---------------- drawing ---------------- */
  const pass = o => { o.raycast = () => {}; return o; };      /* (nothing here hides a name's part: view.js inView) */
  /* [material, its full opacity]: the wall's face comes in as the camera nears (matsB), its molecules later, when the
     picture is no wider than the piece of wall whose water is drawn (matsD) */
  const matsB = [], matsD = [];
  const fadeB = (m, full = 1) => { m.transparent = true; matsB.push([m, full]); return m; }, fade = (m, full = 1) => { m.transparent = true; matsD.push([m, full]); return m; };
  const flat = (color, op = 1) => fadeB(new THREE.MeshBasicMaterial({ color, depthWrite: false }), op);
  /* behind: the air space (the leaf's own dark between the cells); the wall, 200 nm of it, full of water (a dark
     blue, its surface a pale line); under the wall, the cell (the colour of the film's cut cells) */
  const XW = FALL[FALL.length - 1] + PITCH / 2;
  const air = pass(new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), flat(0x1a1e52))); air.position.set(0, 0, -0.12);      /* (every flat layer lies just behind the molecules: the camera is a few nm away, and a layer set deeper would be drawn smaller and stand apart from them) */ air.renderOrder = 10; g.add(air);
  { const cell = pass(new THREE.Mesh(new THREE.PlaneGeometry(9000, 4500), flat(0xbfe09a, 0.9))); cell.position.set(0, -WET.WALL - 2250, -0.115); cell.renderOrder = 11; g.add(cell);
    const sh = new THREE.Shape(); sh.moveTo(-4500, -WET.WALL); sh.lineTo(-4500, CONTACT); for (let x = -XW; x <= XW + 1e-6; x += 0.06) sh.lineTo(x, surface(x)); sh.lineTo(4500, CONTACT); sh.lineTo(4500, -WET.WALL); sh.closePath();
    const w = pass(new THREE.Mesh(new THREE.ShapeGeometry(sh, 1), flat(0x17386b))); w.position.z = -0.11; w.renderOrder = 12; g.add(w); }
  /* the surface's line. Over the piece whose water is drawn it follows the water: where a molecule has just left it
     dips, and it comes back as the column under it moves up (surfNow, each frame) */
  const surfMat = fadeB(new THREE.LineBasicMaterial({ color: 0xbfe9ff }), 0.85);
  const lineOf = (x0, x1, step) => { const P = []; for (let x = x0; x <= x1 + 1e-6; x += step) P.push(V(x, surface(x), -0.105)); const ln = pass(new THREE.Line(new THREE.BufferGeometry().setFromPoints(P), surfMat)); ln.renderOrder = 13; ln.frustumCulled = false; g.add(ln); return ln; };
  const XS = XE + 0.5, DX = 0.04; lineOf(-XW, -XS, 0.08); lineOf(XS, XW, 0.08);
  const surfPos = lineOf(-XS, XS, DX).geometry.attributes.position, surfBase = Float32Array.from({ length: surfPos.count }, (_, i) => surfPos.getY(i));
  let dipMax = 0;
  const DIP = 0.24;                /* how far the surface dips where a molecule has just left (nm) */
  const surfNow = t => { dipMax = 0; for (let i = 0; i < surfPos.count; i++) surfPos.setY(i, surfBase[i]);
    for (const c of cols) { if (!c.free) continue; const d = DIP * (1 - stepF(c, t)); if (d < 0.004) continue; dipMax = Math.max(dipMax, d);
      const i0 = Math.max(0, Math.floor((c.x - 0.5 + XS) / DX)), i1 = Math.min(surfPos.count - 1, Math.ceil((c.x + 0.5 + XS) / DX));
      for (let i = i0; i <= i1; i++) { const u = (surfPos.getX(i) - c.x) / 0.17; surfPos.setY(i, surfPos.getY(i) - d * Math.exp(-u * u)); } }
    surfPos.needsUpdate = true; };
  /* a fibre's cut face: its body, a pale edge, and the cut end of each of its 24 chains */
  { const body = new THREE.Shape(), E = []; for (let k = 0; k <= 96; k++) { const a = k / 96 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), x = FW * Math.sign(c) * Math.pow(Math.abs(c), 2 / 3), y = FH * Math.sign(s) * Math.pow(Math.abs(s), 2 / 3); if (k < 96) E.push(V(x, y, 0)); if (k) body.lineTo(x, y); else body.moveTo(x, y); }
    const bodyGeo = new THREE.ShapeGeometry(body, 1), bodyMat = flat(0x3b411f), edgeMat = fadeB(new THREE.LineBasicMaterial({ color: 0xdccf96 }), 0.95), edgeGeo = new THREE.BufferGeometry().setFromPoints(E);
    const bar = new THREE.Shape(), bw = 0.31, bh = 0.115, br = 0.1; bar.moveTo(-bw + br, -bh); bar.lineTo(bw - br, -bh); bar.absarc(bw - br, 0, bh, -Math.PI / 2, Math.PI / 2, false); bar.lineTo(-bw + br, bh); bar.absarc(-bw + br, 0, bh, Math.PI / 2, Math.PI * 1.5, false);
    const barGeo = new THREE.ShapeGeometry(bar, 6), barMat = flat(0xe6c25e), bars = pass(new THREE.InstancedMesh(barGeo, barMat, FALL.length * WET.SHEETS * WET.CHAINS)), M = new THREE.Matrix4(); let n = 0;
    FALL.forEach(fx => { const b = pass(new THREE.Mesh(bodyGeo, bodyMat)); b.position.set(fx, FY, -0.1); b.renderOrder = 14; g.add(b);
      const e = pass(new THREE.LineLoop(edgeGeo, edgeMat)); e.position.set(fx, FY, -0.099); e.renderOrder = 15; g.add(e);
      for (let r = 0; r < WET.SHEETS; r++) for (let c = 0; c < WET.CHAINS; c++) { const [x, y] = chainXY(r, c); M.makeTranslation(fx + x, FY + y, -0.098); bars.setMatrixAt(n++, M); } });
    bars.renderOrder = 16; bars.frustumCulled = false; g.add(bars);
    /* the wall's deeper layers (seen on the way in): its fibres lie in layers, each turned from the last (the wall
       step): under the outermost, a layer whose fibres lie along the picture (one of them seen from its side: a band
       with its sheets of chains as lines), then one cut across again, and so on down the wall's 200 nm */
    const ROWS = []; for (let k = 1, y = FY - 9.6; y - FH > -WET.WALL; k++, y -= 9.6) ROWS.push([y, k % 2 === 1]);
    const across = ROWS.filter(r => !r[1]), along = ROWS.filter(r => r[1]), plane = new THREE.PlaneGeometry(1, 1), Q0 = new THREE.Quaternion(), P0 = new THREE.Vector3(), S0 = new THREE.Vector3();
    const bodies = pass(new THREE.InstancedMesh(bodyGeo, bodyMat, across.length * FALL.length)), bars2 = pass(new THREE.InstancedMesh(barGeo, barMat, across.length * FALL.length * WET.SHEETS * WET.CHAINS)); let nb2 = 0, nr2 = 0;
    across.forEach(([y], j) => FALL.forEach(fx => { const x0 = fx + (j % 2 ? 0 : PITCH / 2); M.makeTranslation(x0, y, -0.1); bodies.setMatrixAt(nb2++, M);
      for (let r = 0; r < WET.SHEETS; r++) for (let c = 0; c < WET.CHAINS; c++) { const [x, yy] = chainXY(r, c); M.makeTranslation(x0 + x, y + yy, -0.098); bars2.setMatrixAt(nr2++, M); } }));
    const bands = pass(new THREE.InstancedMesh(plane, bodyMat, along.length)), stripes = pass(new THREE.InstancedMesh(plane, barMat, along.length * WET.SHEETS)); let ns2 = 0;
    along.forEach(([y], j) => { M.compose(P0.set(0, y, -0.1), Q0, S0.set(2 * XW, 2 * FH, 1)); bands.setMatrixAt(j, M);
      for (let r = 0; r < WET.SHEETS; r++) { M.compose(P0.set(0, y + chainXY(r, 0)[1], -0.098), Q0, S0.set(2 * XW, 0.23, 1)); stripes.setMatrixAt(ns2++, M); } });
    [[bodies, 14], [bars2, 16], [bands, 14], [stripes, 16]].forEach(([m, o]) => { m.renderOrder = o; m.frustumCulled = false; g.add(m); });
    WET.rows = ROWS.length + 1; }

  /* the atoms: oxygen red, hydrogen white (the game's own: js/game/actors.js token), as balls */
  const ball = new THREE.SphereGeometry(1, 18, 12);
  const atomMat = (color, e, k) => fade(magicStandard({ color, roughness: 0.38, emissive: e, emissiveIntensity: k, opacity: 1, depthWrite: true }, { rim: 0xffffff, rimK: 0.5 }));
  const NV = 40;                 /* water vapour molecules at once, at most */
  const nMol = sites.length + NV + 4;
  const pool = (m, n) => { const x = pass(new THREE.InstancedMesh(ball, m, n)); x.count = 0; x.frustumCulled = false; x.renderOrder = 18; g.add(x); return x; };
  const mO = pool(atomMat(0xff6f6f, 0x5a1010, 0.55), nMol + ohs.length), mH = pool(atomMat(0xffffff, 0x404858, 0.5), 2 * nMol + ohs.length);
  /* a stick for each covalent bond (only from near, with the smaller atoms) */
  const rod = new THREE.CylinderGeometry(1, 1, 1, 8, 1); rod.rotateZ(Math.PI / 2);      /* along x */
  const stickMat = fade(new THREE.MeshBasicMaterial({ color: 0xd5d9e6 })), mS = pass(new THREE.InstancedMesh(rod, stickMat, 2 * nMol + 2 * ohs.length)); mS.count = 0; mS.frustumCulled = false; mS.renderOrder = 17; g.add(mS);
  /* the hydrogen bonds: three thin dashes each (pale; the named one bright) */
  const dashMat = fade(new THREE.MeshBasicMaterial({ color: 0x9fc4d8 })), hotMat = fade(new THREE.MeshBasicMaterial({ color: 0xd6e6f4 }));
  const ND = 4200, mD = pass(new THREE.InstancedMesh(rod, dashMat, ND)), mDh = pass(new THREE.InstancedMesh(rod, hotMat, 24)); [mD, mDh].forEach(m => { m.count = 0; m.frustumCulled = false; m.renderOrder = 17; g.add(m); });
  /* from near, a dark veil lies over everything but the named molecules, their bond and its marks (they stand just in
     front of it: ZF), so that the eye finds the two molecules among the many */
  const ZF = 0.12, veilMat = new THREE.MeshBasicMaterial({ color: 0x0b1036, transparent: true, opacity: 0, depthWrite: false }), veil = pass(new THREE.Mesh(new THREE.PlaneGeometry(400, 400), veilMat)); veil.position.z = 0.105; veil.renderOrder = 19; veil.visible = false; g.add(veil);
  /* a thin ring round the molecule that a shot follows, and a soft light behind it (light, not size) */
  const ringSp = pass(new THREE.Mesh(new THREE.RingGeometry(0.215, 0.24, 48), fade(new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, depthWrite: false }), 0.95))); ringSp.renderOrder = 21; ringSp.visible = false; g.add(ringSp);
  const glowSp = new THREE.Sprite(fade(new THREE.SpriteMaterial({ map: halo(), color: 0xbfe9ff, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }), 0.95)); glowSp.renderOrder = 20; glowSp.visible = false; pass(glowSp); g.add(glowSp);
  /* δ+ and δ− beside the atoms of the named bonds (the guide's notation, A1.1.2) */
  const glyph = (txt, col) => { const c = document.createElement('canvas'); c.width = 128; c.height = 80; const x = c.getContext('2d'); x.font = '700 56px Nunito, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 9; x.strokeStyle = 'rgba(8,12,40,0.9)'; x.strokeText(txt, 64, 42); x.fillStyle = col; x.fillText(txt, 64, 42);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(fade(new THREE.SpriteMaterial({ map: t, depthTest: false, depthWrite: false }), 1)); sp.scale.set(0.27, 0.169, 1); sp.renderOrder = 22; sp.visible = false; pass(sp); g.add(sp); return sp; };
  /* (δ+ white as the hydrogen it belongs to, δ− red as its oxygen) */
  const dPlus = [0, 1, 2, 3, 4, 5].map(() => glyph('δ+', '#ffffff')), dMinus = [0, 1, 2, 3].map(() => glyph('δ−', '#ff9a9a'));
  /* and the atoms' letters ON the atoms of the named molecules: O on each oxygen, H on each hydrogen */
  const letter = (txt, col, w) => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.font = '900 50px Nunito, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(txt, 32, 35);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(fade(new THREE.SpriteMaterial({ map: t, depthTest: false, depthWrite: false }), 1)); sp.scale.set(w, w, 1); sp.renderOrder = 22; sp.visible = false; pass(sp); g.add(sp); return sp; };
  const letO = [0, 1].map(() => letter('O', '#ffffff', 0.1)), letH = [0, 1, 2, 3].map(() => letter('H', '#16213e', 0.07));

  /* ---------------- one frame ---------------- */
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = V(), S3 = V(), QX = new THREE.Quaternion();
  let nO = 0, nH = 0, nS = 0, nD = 0, nDh = 0;
  const putBall = (mesh, i, x, y, z, r) => { P.set(x, y, z); S3.setScalar(r); M4.compose(P, Q.identity(), S3); mesh.setMatrixAt(i, M4); };
  const putRod = (mesh, i, x0, y0, x1, y1, z, r) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy); if (L < 1e-5) return false; P.set((x0 + x1) / 2, (y0 + y1) / 2, z); QX.setFromAxisAngle(ZA, Math.atan2(dy, dx)); S3.set(L, r, r); M4.compose(P, QX, S3); mesh.setMatrixAt(i, M4); return true; };
  /* a molecule: its oxygen at (x, y), turned th (the way its two hydrogen atoms open), b: 0 the game's token (atoms
     that touch) … 1 smaller atoms with sticks; out: where its atoms are (for the hydrogen bonds) */
  const HALF = 104.5 / 2 * Math.PI / 180, TOK = Math.atan2(0.09, 0.064);
  const geo = { rO: 0.096, rH: 0.06, d: 0.1104, half: TOK };
  const setB = b => { geo.rO = 0.096 + (0.066 - 0.096) * b; geo.rH = 0.06 + (0.04 - 0.06) * b; geo.d = 0.1104 + (WET.OH - 0.1104) * b; geo.half = TOK + (HALF - TOK) * b; geo.b = b; };
  const hx = [0, 0], hy = [0, 0];
  function mol(x, y, th, z = 0, k = 1) {
    if (nO >= mO.instanceMatrix.count || nH + 2 > mH.instanceMatrix.count) return;
    for (let q = 0; q < 2; q++) { const a = th + (q ? -geo.half : geo.half); hx[q] = x + geo.d * k * Math.cos(a); hy[q] = y + geo.d * k * Math.sin(a); }
    putBall(mO, nO++, x, y, z, geo.rO * k); putBall(mH, nH++, hx[0], hy[0], z, geo.rH * k); putBall(mH, nH++, hx[1], hy[1], z, geo.rH * k);
    if (geo.b > 0.02) for (let q = 0; q < 2; q++) if (putRod(mS, nS, x, y, hx[q], hy[q], z - 0.01, 0.017 * geo.b * k)) nS++;
  }
  /* three dashes from a hydrogen atom to an oxygen atom, between their surfaces */
  function dashes(mesh, n, x0, y0, x1, y1, r0, r1, rad, z = 0.02) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, a = r0 + 0.012, b = L - r1 - 0.012, len = b - a; if (len < 0.03) return n;
    const seg = len / 5; for (let k = 0; k < 3; k++) { const s0 = a + seg * 2 * k, s1 = s0 + seg; if (n < mesh.instanceMatrix.count && putRod(mesh, n, x0 + ux * s0, y0 + uy * s0, x0 + ux * s1, y0 + uy * s1, z, rad)) n++; } return n;
  }

  /* the state that moves: each column's place in its step, the molecules in the air, the followed molecule */
  const vap = [];                  /* { x, y, vx, vy, th, sp, born, hero } */
  const RV = rng(977);
  const gaussV = () => { let u = 0; while (!u) u = RV(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185 * RV()); };
  const spawn = (x, y, o = {}) => { if (vap.length >= NV) return null; const a = Math.PI / 2 + (RV() - 0.5) * 1.5, v = 6 + RV() * 4, m = Object.assign({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, th: RV() * 6.28, sp: (RV() < 0.5 ? -1 : 1) * (2 + RV() * 3), age: 0 }, o); vap.push(m); return m; };
  /* the middle channel's columns: the one whose top molecule the evaporation shot follows (right of the middle, so
     that its way leads away from the caption), and the one in which the capillary shot follows a molecule upwards */
  const mid = cols.filter(c => c.free && Math.abs(c.x) < PITCH / 2 - HWC + 0.01);
  const heroCol = mid.reduce((b, c) => (Math.abs(c.x - 0.62) < Math.abs(b.x - 0.62) ? c : b), mid[0]);
  const capCol = mid.reduce((b, c) => (Math.abs(c.x + 0.42) < Math.abs(b.x + 0.42) ? c : b), mid[0]);
  [heroCol, capCol].forEach(c => { c.hold = true; });
  /* the way of the molecule that evaporates: up from the surface, then off through the air, turning as it goes */
  const HP = (() => { const x0 = sites[heroCol.sites[0]].x, y0 = sites[heroCol.sites[0]].y, raw = [[0, 0], [0.05, 0.45], [0.5, 1.25], [1.5, 2.0], [1.25, 3.2], [2.4, 4.3], [2.1, 5.6], [3.5, 7.2], [4.4, 9.4]].map(([x, y]) => V(x0 + x, y0 + y, 0));
    const c = new THREE.CatmullRomCurve3(raw, false, 'centripetal'), L = c.getLength(), n = 90, pts = c.getSpacedPoints(n); return { pts, L, at: s => { const f = Math.max(0, Math.min(n - 1e-4, s / L * n)), i = Math.floor(f); return pts[i].clone().lerp(pts[i + 1], f - i); } }; })();
  const HERO = { lift: 0.9, v: 2.7, rest: 1.9, first: 1.0 }, HT = HP.L / HERO.v + 0.55;      /* its flight, s; then a rest, then again */
  const heroS = tau => (tau <= 0 ? 0 : HERO.v * (tau - 0.5 * (1 - Math.exp(-tau / 0.5))));
  const CAP = { depth: 5, every: 1.05, first: 0.7 };      /* the capillary shot: the followed molecule starts 5 molecules down; its column moves up every 1.05 s */
  const now = { hero: V(), words: '', on: false, mode: null, pref: '' };      /* pref: the side its name stands on, if it must (under the molecule that moves up: never over the water's surface) */
  let last = -1, bK = 0, naK = 0, detK = 0, lastMode = null, heroTau = -1, capK = 0, stillOf = null, flowed = false, heroAt = null;
  const reset = () => { vap.length = 0; cols.forEach(c => { c.t0 = -1e9; }); last = -1; flowed = false; };
  /* how far a column is through its step up (0: the top molecule has just gone … 1: at rest) */
  const stepF = (c, t) => sm(0.22, 0.82, t - c.t0);
  /* one frame. mode: 'evap' | 'cap' | 'coh' | 'adh' (a shot's own picture), 'idle' (the film is at another shot), null
     (no film); t: the film's time, ts: the shot's (< 0 until the camera has arrived); still: the shot's still */
  function frame(mode, t, ts, still) {
    now.on = false; now.mode = mode;
    if (!mode) { if (g.visible) { g.visible = false; reset(); } lastMode = null; return; }
    const ppn = stage.pxPerNm(), hw = stage.W / 2 / ppn; naK = sm(1.0, 5, ppn); detK = 1 - sm(1.02 * XE, 1.4 * XE, hw);      /* (the molecules come in when the picture is no wider than the piece whose water is drawn) */
    g.visible = naK > 0.004; if (!g.visible) { lastMode = mode; last = t; return; }
    matsB.forEach(([m, full]) => { m.opacity = full * naK; }); matsD.forEach(([m, full]) => { m.opacity = full * detK; });
    const dt = last < 0 ? 0 : Math.max(0, Math.min(0.1, t - last)); last = t;
    const bonds = mode === 'coh' || mode === 'adh', flow = mode === 'evap' || mode === 'cap';
    bK = still ? (bonds ? 1 : 0) : bK + ((bonds ? 1 : 0) - bK) * Math.min(1, dt * 2.6); if (Math.abs(bK - (bonds ? 1 : 0)) < 0.004) bK = bonds ? 1 : 0;
    setB(bK); mO.material.emissiveIntensity = 0.55 - 0.45 * bK; mH.material.emissiveIntensity = 0.5 - 0.45 * bK; mO.material.color.setHex(0xff6f6f).multiplyScalar(1 - 0.16 * bK); mH.material.color.setHex(0xffffff).multiplyScalar(1 - 0.2 * bK);
    if (still) { if (stillOf !== mode) { stillOf = mode; reset(); stillSet(mode); } } else if (stillOf) { stillOf = null; reset(); }
    if (mode !== lastMode) { lastMode = mode; heroTau = -1; capK = 0; [heroCol, capCol].forEach(c => { c.t0 = -1e9; }); }

    /* the columns: a molecule leaves the top, then the column moves up one place */
    /* (when the water begins to move, each column waits its own share of its time first: they never start together) */
    if (flow && !flowed) cols.forEach(c => { c.next = t + c.ph0 * c.T; }); flowed = flow;
    if (!still) for (const c of cols) { if (!c.free || c.hold) continue; if (flow && t >= c.next && t - c.t0 > 1) { c.t0 = t; c.next = t + c.T; spawn(c.x, c.top); } }
    /* the followed molecule's column keeps the shot's own time */
    let heroP = null, heroWords = '', heroLiquid = true;
    if (mode === 'evap') {
      /* (its still: 0.64 s after it left the surface, 0.75 nm above it, named "evaporation") */
      const cyc = HT + HERO.rest, u = still ? HERO.first + 0.64 : ts, k = u < HERO.first ? -1 : Math.floor((u - HERO.first) / cyc), tau = k < 0 ? -1 : u - HERO.first - k * cyc;
      if (!still) { if (tau >= 0 && tau < HT && heroCol.t0 < t - tau - 0.05) heroCol.t0 = t - tau; } else heroCol.t0 = t - (tau >= 0 ? tau : 9);
      if (tau >= 0 && tau < HT) { const s = heroS(tau); heroP = HP.at(s); heroLiquid = false; heroWords = s < HERO.lift ? 'water · evaporation' : 'water vapour · diffusion'; heroTau = tau; }
      else { heroP = V(heroCol.x, heroCol.top - A * (1 - stepF(heroCol, t)), 0); heroWords = 'water'; heroTau = -1; }
    } else if (mode === 'cap') {
      const u = still ? CAP.first + 2.5 * CAP.every : ts, k = u < CAP.first ? 0 : Math.floor((u - CAP.first) / CAP.every) + 1;
      if (!still) { if (k > capK) { capK = k; capCol.t0 = t; spawn(capCol.x, capCol.top); } }
      /* the followed molecule: CAP.depth places down at first; one place up at each step; gone with the vapour when it
         has reached the top, and the next one is followed from the same depth */
      const stepsDone = k % (CAP.depth + 1), place = CAP.depth - stepsDone, f = k && !still ? stepF(capCol, t) : 1;
      heroP = V(capCol.x, capCol.top - A * (place + (1 - f)), 0); heroWords = 'water · capillary action';
    }
    /* the molecules in the air: each goes its own way, turning at random, until it has left the picture */
    if (!still) { for (const m of vap) { m.age += dt; m.vx += gaussV() * 9 * Math.sqrt(dt); m.vy += gaussV() * 9 * Math.sqrt(dt) + 1.2 * dt; const v = Math.hypot(m.vx, m.vy) || 1, want = 7.5; m.vx *= 1 + (want / v - 1) * Math.min(1, dt * 3); m.vy *= 1 + (want / v - 1) * Math.min(1, dt * 3);
        m.x += m.vx * dt; m.y += m.vy * dt; m.th += m.sp * dt; if (m.y < surface(m.x) + 0.3 && m.vy < 0) m.vy = Math.abs(m.vy); }
      for (let i = vap.length - 1; i >= 0; i--) { const m = vap[i]; if (m.y > 13 || Math.abs(m.x) > XE + 3) vap.splice(i, 1); }
      /* (and a few that were in the air space already: water vapour from other walls) */
      if (vap.filter(m => m.amb).length < 3 && RV() < dt * 0.8) { const left = RV() < 0.5; spawn(left ? -XE - 2 : XE + 2, 1.5 + RV() * 8, { amb: true, vx: (left ? 1 : -1) * (5 + RV() * 3), vy: (RV() - 0.5) * 4 }); } }

    /* ---- draw ---- */
    nO = nH = nS = nD = nDh = 0; surfNow(still ? 1e9 : t);
    const wob = 1 - 0.75 * bK;      /* (from near the molecules turn less: their hydrogen bonds hold them) */
    const named = new Set(); if (bK > 0.03) { if (cohA) { named.add(cohA.idx); named.add(cohB.idx); } if (mode === 'adh' && adh && adh.site >= 0) named.add(adh.site); }
    veil.visible = bK > 0.02; veilMat.opacity = 0.6 * bK * detK;
    for (const c of cols) { const f = c.free ? stepF(c, t) : 1, L = c.sites.length;
      for (let n = 0; n < L; n++) { const s = sites[c.sites[n]]; let x = s.x, y = s.y, th = s.th;
        /* (on its way up, a molecule is between the place below and its own) */
        if (f < 1) { const lo = n + 1 < L ? sites[c.sites[n + 1]] : null; x = lo ? s.x + (lo.x - s.x) * (1 - f) : s.x; y = lo ? s.y + (lo.y - s.y) * (1 - f) : s.y - A * (1 - f); if (lo) { let d = lo.th - s.th; d = Math.atan2(Math.sin(d), Math.cos(d)); th = s.th + d * (1 - f); } }
        const jx = 0.02 * Math.sin(t * s.w1 + s.ph), jy = 0.02 * Math.sin(t * s.w2 + s.ph * 1.7), jt = 0.3 * wob * Math.sin(t * (s.w1 + s.w2) * 0.4 + s.ph * 2.3);
        s.px = x + jx * wob; s.py = y + jy * wob; s.pt = th + jt; s.moving = f < 1;
        mol(s.px, s.py, s.pt, named.has(s.idx) ? ZF : 0); } }
    for (const m of vap) mol(m.x, m.y, m.th);
    if (mode === 'evap' && heroTau >= 0 && heroP) mol(heroP.x, heroP.y, t * 2.1);
    /* the −OH groups of the fibres */
    for (const q of ohs) { if (nO >= mO.instanceMatrix.count) break; const z = q === adh && mode === 'adh' && bK > 0.03 ? ZF : 0; putBall(mO, nO++, q.o[0], q.o[1], z, geo.rO); putBall(mH, nH++, q.h[0], q.h[1], z, geo.rH);
      /* (from near: a stick to its hydrogen, and one into the fibre, to the carbon atom that holds it: an −OH group, not a water molecule) */
      if (geo.b > 0.02) { if (putRod(mS, nS, q.o[0], q.o[1], q.h[0], q.h[1], z - 0.01, 0.017 * geo.b)) nS++; if (putRod(mS, nS, q.o[0], q.o[1], q.o[0] - q.n0[0] * 0.13, q.o[1] - q.n0[1] * 0.13, z - 0.012, 0.017 * geo.b)) nS++; } }
    /* the hydrogen bonds (from near only), round the place the camera looks at */
    dPlus.concat(dMinus, letO, letH).forEach(sp => { sp.visible = false; });
    if (bK > 0.03) {
      const cx = W2C.x, cy = W2C.y, RX = 6.5, RY = 5.5, hot = [];
      for (const s of sites) { if (Math.abs(s.x - cx) > RX || Math.abs(s.y - cy) > RY || s.moving) continue;
        for (let q = 0; q < 2; q++) { const j = s.don[q]; if (j < 0) continue; const o = sites[j]; if (o.moving) continue;
          const a = s.pt + (q ? -geo.half : geo.half), x0 = s.px + geo.d * Math.cos(a), y0 = s.py + geo.d * Math.sin(a);
          if (cohA && s === cohA && o === cohB) hot.push([x0, y0, o.px, o.py]); else nD = dashes(mD, nD, x0, y0, o.px, o.py, geo.rH, geo.rO, 0.0085); } }
      for (const q of ohs) { if (q.site < 0 || Math.abs(q.o[0] - cx) > RX || Math.abs(q.o[1] - cy) > RY) continue; const o = sites[q.site]; if (o.moving) continue;
        if (q === adh && mode === 'adh') hot.push([q.h[0], q.h[1], o.px, o.py]); else nD = dashes(mD, nD, q.h[0], q.h[1], o.px, o.py, geo.rH, geo.rO, 0.0085); }
      hot.forEach(h => { nDh = dashes(mDh, nDh, h[0], h[1], h[2], h[3], geo.rH, geo.rO, 0.013, ZF); });
      dashMat.opacity = 0.5 * bK * detK; hotMat.opacity = bK * detK;
      /* O or H on each atom of the two named molecules (cohesion), or of the −OH group and its water molecule
         (adhesion), and δ− beside each oxygen, δ+ beside each hydrogen: on the outer side of its own atom if that side
         is clear of the other named atoms, of the named bond, of its name's line and of the marks already placed;
         else square to it (never nearer another atom than its own), else the clearest of the other sides */
      const atomsOf = s => { const out = [[s.px, s.py, false, s.px + Math.cos(s.pt), s.py + Math.sin(s.pt)]]; for (let q = 0; q < 2; q++) { const a = s.pt + (q ? -geo.half : geo.half); out.push([s.px + geo.d * Math.cos(a), s.py + geo.d * Math.sin(a), true, s.px, s.py]); } return out; };
      let list = [];
      if (mode === 'coh' && cohA) list = atomsOf(cohA).concat(atomsOf(cohB));
      /* (adhesion: δ on the three atoms of the bond itself, the group's O and H and the water's O; the water's own hydrogen atoms have their letters only: five marks in so small a place could not be told apart) */
      if (mode === 'adh' && adh) list = [[adh.o[0], adh.o[1], false, adh.h[0], adh.h[1]], [adh.h[0], adh.h[1], true, adh.o[0], adh.o[1]]].concat(atomsOf(sites[adh.site]).map((a, i) => (i ? a.concat([true]) : a)));
      const keep = list.map(a => [a[0], a[1]]); hot.forEach(h => { for (let k = 1; k < 4; k++) keep.push([h[0] + (h[2] - h[0]) * k / 4, h[1] + (h[3] - h[1]) * k / 4]); });
      /* (the name's level line: cohesion's comes to the bond's middle from the left; adhesion's to the group's oxygen from the right, out of the fibre) */
      if (mode === 'coh' && hot[0]) for (let k = 1; k <= 5; k++) keep.push([(hot[0][0] + hot[0][2]) / 2 - k * 0.09, (hot[0][1] + hot[0][3]) / 2 - 0.02]);
      if (mode === 'adh' && adh) for (let k = 1; k <= 5; k++) keep.push([adh.o[0] + k * 0.09, adh.o[1]]);
      let p = 0, m = 0; list.forEach(([x, y, plus, ox, oy, bare]) => { const lt = plus ? letH[p] : letO[m], sp = plus ? dPlus[p++] : dMinus[m++]; if (lt) { lt.position.set(x, y, 0.21); lt.material.opacity = bK * detK; lt.visible = true; } if (!sp || bare) return;
        const a0 = Math.atan2(y - oy, x - ox); let best = null, bd = -1;
        for (const da of [0, 1.5, -1.5, 0.8, -0.8, 2.2, -2.2, Math.PI]) { const gx = x + 0.135 * Math.cos(a0 + da), gy = y + 0.11 * Math.sin(a0 + da); let d = 9; for (const k of keep) { if (k[0] === x && k[1] === y) continue; d = Math.min(d, Math.hypot((k[0] - gx) * 0.8, k[1] - gy)); } if (d > bd + (best ? 0.02 : 0)) { bd = d; best = [gx, gy]; } if (d > 0.115) break; }
        keep.push(best); sp.position.set(best[0], best[1], 0.2); sp.material.opacity = bK * detK; sp.visible = true; });
    }
    /* the followed molecule: its light, and where its name rides */
    glowSp.visible = ringSp.visible = !!heroP && (mode === 'evap' || mode === 'cap');
    if (heroP) { ringSp.position.set(heroP.x, heroP.y, 0.12); glowSp.position.set(heroP.x, heroP.y, 0.1); glowSp.scale.setScalar(heroLiquid ? 0.95 : 1.5); now.hero.copy(world(heroP)); heroAt = [heroP.x, heroP.y]; now.words = heroWords; now.pref = mode === 'cap' ? 'd' : ''; now.on = detK > 0.9 && (still || ts >= 0); }
    mO.count = nO; mH.count = nH; mS.count = nS; mD.count = nD; mDh.count = nDh;
    [mO, mH, mS, mD, mDh].forEach(m => { m.instanceMatrix.needsUpdate = true; });
  }
  /* a still: a few molecules in the air, each where it would be on its way */
  function stillSet(mode) {
    if (mode !== 'evap' && mode !== 'cap') return;
    const Rs = rng(31 + (mode === 'cap' ? 7 : 0)); const free = cols.filter(c => c.free && !c.hold && Math.abs(c.x) < 9);
    for (let i = 0; i < 7; i++) { const c = free[Math.floor(Rs() * free.length)], h = 0.5 + Rs() * 6.5; vap.push({ x: c.x + (Rs() - 0.5) * 2.6 * (h / 3), y: c.top + h, vx: 0, vy: 1, th: Rs() * 6.28, sp: 0, age: 1 }); }
  }
  /* the way of a shot's followed molecule, as points of the leaf (the names keep off it; a still draws its arrow) */
  const route = mode => mode === 'evap' ? HP.pts.filter((_, i) => i % 3 === 0 && HP.pts[i].y < (NARROW ? 2.3 : 4.3)).map(world)      /* (as far as the picture shows the air: a still's arrow has its head in view) */
    : mode === 'cap' ? [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => world(V(capCol.x, capCol.top - A * (CAP.depth + 0.6) * (1 - k / 8), 0))) : [];
  /* how long a shot shows before Next comes (s): the followed molecule has then done what the words say */
  const secs = { evap: HERO.first + (HERO.lift + 3.2) / HERO.v + 0.9, cap: CAP.first + 3.3 * CAP.every, coh: 3.4, adh: 3.4 };

  /* ---------------- the names of the near shots ---------------- */
  const FXL = { cls: 'plv-xlab plv-xnote plv-flab' };
  const F1 = FXS[1];
  Object.assign(labels, {
    /* (through: this piece of wall stands just in front of the section's face, where nothing hides it; the cell's own
       shape, which the section cuts away, would count as hiding it: view.js inView) */
    wfib: Object.assign({ html: 'cellulose fibre<br>(cut across)', htmlN: 'cellulose fibre', side: 'l', through: true, pts: () => [world(V(F1 - 1.1, FY + 0.1, 0)), world(V(F1 - 1.1, FY - 0.7, 0)), world(V(F1 - 1.1, FY + 0.7, 0)), /* (a phone shows the fibre's right half) */ world(V(F1 + 0.9, FY + 0.1, 0)), world(V(F1 + 0.9, FY - 0.7, 0))] }, FXL),
    wwat: Object.assign({ html: 'water in the cell wall', htmlN: 'water', side: 'l', through: true, pts: () => [world(V(F1 - 0.6, FY - 3.4, 0)), world(V(-0.6, FY - 3.1, 0)), world(V(F2 + 0.4, FY - 3.4, 0)), /* (a phone, whose picture ends 2.7 nm under the wall's face: just under the surface, to each side of the column that the shots follow, then under a fibre) */ world(V(-1.05, FY - 0.75, 0)), world(V(1.25, FY - 0.75, 0)), world(V(F1 + 0.6, FY - 0.95, 0)), world(V(F2 - 0.6, FY - 0.95, 0))] }, FXL),
    wair: Object.assign({ html: 'air space', side: 'r', through: true, pts: () => [world(V(F2 + 0.6, 2.2, 0)), world(V(F2 - 0.4, 1.5, 0)), world(V(F1 - 0.4, 2.0, 0))] }, FXL),
    /* (a named bond's line is long enough for its name to stand clear of the two molecules it joins and of their marks) */
    wcoh: Object.assign({ html: 'cohesion:<br>a hydrogen bond between<br>two water molecules', htmlN: 'cohesion', side: 'l', through: true, gaps: [60, 90, 140, 200], pts: () => (cohA ? [world(V((cohA.x + cohB.x) / 2, (cohA.y + cohB.y) / 2 - 0.02, ZF))] : []) }, FXL),
    /* (the surface's name: beside the fibre to the right of the middle channel, where its box covers no part of the
       channel that the shots follow; a phone, which shows the middle channel alone, has it there) */
    wsurf: Object.assign({ html: 'surface of<br>the water', htmlN: 'water’s surface', side: 'r', through: true, pts: () => [F2 + HWC + 0.45, -0.95, 0.35].map(x => world(V(x, meniscus(x), 0))) }, FXL),
    wadh: Object.assign({ html: 'adhesion:<br>this −OH group of cellulose<br>forms a hydrogen bond with water', htmlN: 'adhesion:<br>−OH of cellulose', side: 'r', through: true, gaps: [44, 70, 110, 160], pts: () => (adh ? [world(V(adh.o[0] + 0.02, adh.o[1], ZF))] : []) }, FXL)
  });

  /* ---------------- for the checks (tools/plant-check.mjs S) ---------------- */
  function check() {
    const free = cols.filter(c => c.free), midC = mid, top = midC.map(c => c.top), d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    let near = 9; for (const s of sites) for (const j of s.nb) if (j > s.idx) near = Math.min(near, d2(s, sites[j]));
    const bonds = []; sites.forEach(s => s.don.forEach(j => { if (j >= 0) bonds.push(d2(s, sites[j])); }));
    const both = sites.filter(s => s.don.some(j => j >= 0 && sites[j].don.includes(s.idx))).length;
    return { sites: sites.length, columns: cols.filter(c => !c.film).length, film: cols.filter(c => c.film).length / FXS.length, rows: WET.rows, free: free.length, mid: midC.length, fibres: FXS.length, chains: WET.SHEETS * WET.CHAINS, oh: ohs.length / FXS.length, ohInWater: ohs.filter(q => q.site >= 0).length,
      fibreW: 2 * FW, fibreH: 2 * FH, spacing: A, nearest: near, inFibre: sites.filter(s => inFibre(s.x, s.y, 0.1)).length, aboveSurface: sites.filter(s => s.y > surface(s.x)).length,
      edgeTop: Math.max(...top), midTop: Math.min(...top), bonds: bonds.length, bondMin: Math.min(...bonds), bondMax: Math.max(...bonds), both, accMax: Math.max(...sites.map(s => s.acc)),
      coh: cohA ? { oo: d2(cohA, cohB), a: [cohA.x, cohA.y], b: [cohB.x, cohB.y] } : null, adh: adh ? { oo: Math.hypot(adh.o[0] - sites[adh.site].x, adh.o[1] - sites[adh.site].y), oh: Math.hypot(adh.h[0] - adh.o[0], adh.h[1] - adh.o[1]), under: CONTACT - adh.o[1] } : null,
      heroWay: HP.L, secs };
  }
  /* what is drawn now */
  const inAir = () => vap.filter(m => Math.abs(m.x) < 8 && m.y < 6).length;
  const state = () => ({ on: g.visible, near: naK, detail: detK, mode: now.mode, bonds: bK, liquid: sites.length, vapour: inAir(), vapourAll: vap.length, dashes: mD.count / 3, hot: mDh.count / 3, glyphs: dPlus.concat(dMinus).filter(s => s.visible).length, letters: letO.concat(letH).filter(s => s.visible).length, dip: dipMax, sticks: mS.count, atom: { o: geo.rO, h: geo.rH },
    hero: now.on && heroAt ? { words: now.words, at: heroAt } : null, surfaceAt: heroCol.top, moving: cols.filter(c => c.free && stepF(c, last) < 1).length,
    /* (the air above the wall and the water in it, as molecules in each nm² of the picture now) */
    perNm2: { liquid: 1 / (A * A), air: inAir() / (16 * 6) } });
  return { group: g, views: VI, frame, now, route, secs, check, state, farK: () => 1 - sm(0.02, 0.12, stage.pxPerNm()) };
}
