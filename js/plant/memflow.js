/* ============================================================
   memflow.js — the plant cell's membrane step with a course on (17 Nov 2026): three small scenes at the cell membrane,
   in the membrane's own 3D and at true sizes, in place of three definitions in a box: diffusion, osmosis and active
   transport (0610 3.1.1, 3.2.7 and 3.3.1 with 3.3.3; their words: text.js MEMSCENES, pieces of the step's own IGCSE
   lines). js/plant/view.js plays them, beat by beat.
   Daniel, 16 Nov 2026: "once you toggle the IGCSE, you see it … on the 3D representation instead of text"; 17 Nov: "Yes,
   carry on" to the game's way in, whose method this is (js/game/wayflow.js: a process shown as a POPULATION; memory
   teach-on-the-picture). Each definition speaks of a net movement, so one molecule on a curve would teach it wrong:
   - every scene shows MANY particles, each on a random walk (its velocity changes a little at random every moment: it
     keeps its way for about half a second, never straight, never steered);
   - the two sides of the membrane are two regions of the SAME size (memory concentration-pictures-equal-volumes), each
     kept at its own concentration, as the tissue keeps them: a particle that leaves a region at its far edge is
     replaced there (the far edge is the rest of the wall, or the rest of the cell);
   - a small molecule (carbon dioxide, water) that meets the membrane crosses it between the lipids only sometimes, and
     in BOTH directions; a counter beside the picture counts the crossings each way, and the difference is the net
     movement. A sugar molecule or an ion never crosses the lipids: it bounces off them;
   - active transport: nitrate ions, fewer in the wall's water than in the cytoplasm; only the protein carrier moves
     them, one at a time, from the lower concentration to the higher, and each change of its shape is marked by a pulse
     of light that stands for energy from respiration.

   What is true here, and what the picture simplifies (memory biology-before-pedagogy):
   - the particles are at their true sizes beside the membrane (nm): water 0.3, carbon dioxide 0.55, a nitrate ion
     about 0.4 (N–O 0.124 nm), a sugar molecule drawn as the game's glucose, 0.9; the two layers of lipids 5 nm
     (js/ib/membrane.js); the carrier 4.6 nm wide and 6.4 nm tall, two halves round a pocket, as the game's carriers
     (js/world/cellbuild.js; a real nitrate carrier of a plant cell is such a protein: NRT1.1, Parker & Newstead 2014,
     Nature 507:68; Sun et al. 2014, Nature 507:73);
   - carbon dioxide enters a palisade cell in the light, down its gradient: the chloroplasts use it (the leaf's own
     IGCSE line); water enters a cell whose contents are more concentrated than the water in its wall; a leaf cell
     takes up nitrate ions against their gradient (the inside of the cell is negative, and the cytoplasm holds a few
     mmol per dm³, measured with nitrate-selective microelectrodes: Miller & Smith 1996, Journal of Experimental Botany
     47:843; in leaf cells, Cookson, Williams & Miller 2005, Plant Physiology 138:1097; the uptake: Crawford & Glass
     1998, Trends in Plant Science 3:389). A real nitrate carrier takes its energy from a gradient of protons that a pump makes with
     ATP from respiration; the picture shows only that energy is used, as 0610 words it. Magnesium ions would be the
     wrong example: they enter down their electrical gradient;
   - simplified, and said on the picture: the movement is slowed down about a hundred million times; far more carbon
     dioxide molecules and nitrate ions are drawn than so small a space really holds (a real one would hold less than
     one); only some of the water molecules are drawn (real liquid water fills both sides, about 33 molecules in
     every cubic nanometre); the difference in water between the two sides is drawn far larger than it is.
   The random numbers are fixed (each scene's `seed`), chosen so that the counter says what the process does from
   whatever moment the reader starts it (memCheck: every scene run for 90 s, the count started at every second).
   No imports: the simulation is plain numbers (memSim, memCheck: run by node too); makeMem draws it with what leaf.js
   hands in (three.js, the game's material, the stage).
   ============================================================ */

/* small, fixed random numbers (mulberry32) whose place can be kept and put back (a look ahead), and a bell curve */
function makeRng(seed) { let s = seed | 0; const f = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; f.get = () => s; f.set = v => { s = v | 0; }; return f; }
const gauss = r => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185 * r()); };
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* the space of a scene, in nm, round a point of the membrane: u across it (u < 0 the cell wall's side, u > 0 the
   cytoplasm), v along it (up the picture), w towards the viewer (a thin layer just in front of the cut face, where
   every particle is seen). M: half the two layers of lipids (the heads' outer faces). The two regions are the same
   size: U − M wide, 2V tall. v has no edge: a particle that leaves at the top comes in at the bottom (it fades over
   the last EV nm), so nothing turns back at a line that is not there. */
export const BOX = { U: 13.5, V: 8, W0: 0.18, W1: 1.3, M: 2.5, EU: 1.6, EV: 1.2 };
/* a phone's picture is narrow and tall (during a scene the steps' sheet is away, so the scene has the whole picture): it
   shows less of each side and more along the membrane; the same number of particles in each nm² */
export const BOX_N = { U: 9.6, V: 10, W0: 0.18, W1: 1.3, M: 2.5, EU: 1.4, EV: 1.2 };
/* the carrier (active transport), in the same frame: its two halves reach HU across the membrane and HV along it; an
   ion within CAP of its open mouth binds */
export const CAR = { HU: 3.2, HV: 2.3, CAP: 1.7, mouth: 3.9 };
/* each scene's particles. out, in: how many in each region of the laptop's box (a phone's box holds the same in each
   nm²); s: speed each way, on average (nm a second); tau: how long one keeps its way (s); r: its radius;
   cross: the chance that one that meets the lipids crosses them (0: never). through: its speed in the membrane. */
export const SCENES = {
  diffusion: { hero: 'co2', kinds: { co2: { out: 36, in: 5, s: 3.3, tau: 0.55, r: 0.28, cross: 0.16, through: 2.4 } }, seed: 633, seedN: 1 },
  osmosis: { hero: 'water', kinds: { water: { out: 66, in: 24, s: 3.4, tau: 0.5, r: 0.15, cross: 0.08, through: 2.8 }, sugar: { out: 2, in: 15, s: 1.2, tau: 0.6, r: 0.45, cross: 0 } }, seed: 1178, seedN: 88 },
  active: { hero: 'nitrate', carrier: true, kinds: { nitrate: { out: 10, in: 30, s: 2.4, tau: 0.5, r: 0.2, cross: 0 } }, seed: 1, seedN: 1 }
};
export const DT = 1 / 30, FADE = 10;      /* a step of the simulation (s); a particle fades in or out over 10 steps */
/* the carrier's cycle (s): an ion binds; the open side shuts; the other side opens (the pulse of energy, through both
   changes of shape); the ion leaves; the empty carrier changes back */
export const CYCLE = { bind: 0.6, shut: 0.5, turn: 0.6, leave: 0.6, back: 0.9 };

/* the simulation. narrow: a phone's box; obstacles: [{ u, v, r }], what no particle may pass over (the cut end of a
   cellulose fibre at the face); state: a kept state to go on from (clone) */
export function memSim(id, { seed, narrow = false, obstacles = [], state = null } = {}) {
  const C = SCENES[id], B = narrow ? BOX_N : BOX, r = makeRng(seed == null ? (narrow ? C.seedN : C.seed) : seed), M = B.M;
  const share = ((B.U - B.M) * B.V) / ((BOX.U - BOX.M) * BOX.V);      /* a phone's box against the laptop's */
  const K = {}; Object.keys(C.kinds).forEach(k => { const o = C.kinds[k]; K[k] = Object.assign({}, o, { out: Math.max(1, Math.round(o.out * share)), in: Math.max(1, Math.round(o.in * share)), k: Math.sqrt(2 * DT / o.tau) }); });
  let P = [], c = { in: 0, out: 0, steps: 0 }, car = C.carrier ? { ph: 'open', t: 0, ion: -1, s: -1, pulse: 0, n: 0, from: [0, 0] } : null;
  const inBody = (u, v, rad) => !!car && (u / (CAR.HU + rad)) ** 2 + (v / (CAR.HV + rad)) ** 2 < 1;
  const inObst = (u, v, rad) => obstacles.some(o => (u - o.u) ** 2 + (v - o.v) ** 2 < (o.r + rad) ** 2);
  const free = (u, v, rad) => Math.abs(u) > M + rad && !inBody(u, v, rad) && !inObst(u, v, rad);
  function place(p, side, start) {
    const k = K[p.kind];
    for (let n = 0; n < 60; n++) {
      p.u = side * (start ? M + k.r + 0.05 + (B.U - M - k.r - 0.1) * r() : B.U - 0.15 - 0.5 * r()); p.v = (2 * r() - 1) * B.V; p.w = B.W0 + k.r + (B.W1 - B.W0 - 2 * k.r) * r();
      if (free(p.u, p.v, k.r)) break;
    }
    p.vu = gauss(r) * k.s; p.vv = gauss(r) * k.s; p.vw = gauss(r) * k.s * 0.5; if (!start) p.vu = -side * Math.abs(p.vu);
    p.ax = gauss(r); p.ay = gauss(r); p.az = gauss(r);
    p.side = side; p.m = 0; p.f = start ? FADE : 0; p.gone = 0; p.dead = false; p.cap = 0;
    return p;
  }
  if (state) { P = state.P.map(o => Object.assign({}, o)); c = Object.assign({}, state.c); if (car) Object.assign(car, state.car, { from: state.car.from.slice() }); r.set(state.rng); }
  else Object.keys(K).forEach(kind => { const k = K[kind];
    for (let i = 0; i < k.out; i++) P.push(place({ kind }, -1, true));
    for (let i = 0; i < k.in; i++) P.push(place({ kind }, 1, true));
    for (let i = 0; i < 5; i++) P.push({ kind, dead: true, gone: 0, f: 0, side: 0, m: 0, cap: 0, u: 0, v: 0, w: 0, vu: 0, vv: 0, vw: 0, ax: 1, ay: 0, az: 0 }); });
  const count = (kind, side) => { let n = 0; for (const p of P) if (p.kind === kind && !p.dead && !p.gone && p.side === side) n++; return n; };
  function step() {
    c.steps++;
    /* each region keeps its concentration: a new particle comes in at the far edge when the region holds too few */
    for (const kind in K) for (const side of [-1, 1]) {
      if (count(kind, side) < (side < 0 ? K[kind].out : K[kind].in) && r() < 3 * DT) { const p = P.find(q => q.kind === kind && q.dead); if (p) place(p, side, false); }
    }
    if (car) carrierStep();
    for (const p of P) {
      if (p.dead || p.cap) continue;
      const k = K[p.kind];
      if (p.gone) { if (++p.gone > FADE) p.dead = true; continue; }
      if (p.f < FADE) p.f++;
      p.ax += gauss(r) * 0.07; p.ay += gauss(r) * 0.07; p.az += gauss(r) * 0.07;
      if (p.m) {
        /* in the membrane, between the lipids: straight across, with a little wobble along it */
        p.u += p.m * k.through * DT; p.v += gauss(r) * 0.25 * DT * 6; p.w += p.vw * DT * 0.3;
        if (p.m * p.u > M + k.r) { p.side = p.m; if (p.m > 0) c.in++; else c.out++; p.vu = p.m * Math.abs(gauss(r)) * k.s; p.vv = gauss(r) * k.s; p.m = 0; }
      } else {
        p.vu += -p.vu * DT / k.tau + k.s * k.k * gauss(r); p.vv += -p.vv * DT / k.tau + k.s * k.k * gauss(r); p.vw += -p.vw * DT / k.tau + k.s * 0.5 * k.k * gauss(r);
        const pu = p.u, pv = p.v;
        p.u += p.vu * DT; p.v += p.vv * DT; p.w += p.vw * DT;
        /* the lipids: a small molecule crosses them sometimes; every other particle goes back the way it came */
        if (Math.abs(p.u) < M + k.r) {
          if (k.cross && !inBody(p.u, p.v, k.r) && r() < k.cross) { p.m = p.side > 0 ? -1 : 1; p.u = -p.m * (M + k.r); }
          else { p.u = pu; p.vu = -p.vu; }
        }
        /* the carrier's own body, and a fibre's cut end: back */
        if (inBody(p.u, p.v, k.r) || inObst(p.u, p.v, k.r)) {
          const u1 = p.u, v1 = p.v; p.u = pu; p.v = pv;
          const hit = (u, v) => inBody(u, v, k.r) || inObst(u, v, k.r);
          if (hit(u1, pv)) p.vu = -p.vu; if (hit(pu, v1)) p.vv = -p.vv; if (!hit(u1, pv) && !hit(pu, v1)) { p.vu = -p.vu; p.vv = -p.vv; }
        }
        /* the far edge: the rest of the wall, or of the cell. A region that holds too many loses one there */
        if (Math.abs(p.u) > B.U) {
          if (count(p.kind, p.side) > (p.side < 0 ? k.out : k.in)) { p.gone = 1; continue; }
          p.u = Math.sign(p.u) * (2 * B.U - Math.abs(p.u)); p.vu = -p.vu;
        }
      }
      if (p.v > B.V) p.v -= 2 * B.V; else if (p.v < -B.V) p.v += 2 * B.V;
      if (p.w < B.W0 + k.r) { p.w = 2 * (B.W0 + k.r) - p.w; p.vw = Math.abs(p.vw); } else if (p.w > B.W1 - k.r) { p.w = 2 * (B.W1 - k.r) - p.w; p.vw = -Math.abs(p.vw); }
    }
  }
  /* the carrier: open to the wall's side until an ion comes within reach of its mouth; then its cycle (CYCLE) */
  function carrierStep() {
    car.t += DT; car.pulse = 0;
    const ion = car.ion >= 0 ? P[car.ion] : null, wMid = (B.W0 + B.W1) / 2;
    if (car.ph === 'open') {
      car.s = -1;
      for (let i = 0; i < P.length; i++) { const p = P[i]; if (p.dead || p.gone || p.side > 0 || p.f < FADE) continue;
        if (Math.hypot(p.u + CAR.mouth, p.v) < CAR.CAP) { car.ion = i; car.ph = 'bind'; car.t = 0; car.from = [p.u, p.v, p.w]; p.cap = 1; break; } }
    } else if (car.ph === 'bind') {
      const a = sm(0, 1, car.t / CYCLE.bind); ion.u = car.from[0] + (0 - car.from[0]) * a; ion.v = car.from[1] * (1 - sm(0, 0.7, car.t / CYCLE.bind)); ion.w = car.from[2] + (wMid - car.from[2]) * a;
      if (car.t >= CYCLE.bind) { car.ph = 'shut'; car.t = 0; }
    } else if (car.ph === 'shut') {
      car.s = -1 + sm(0, 1, car.t / CYCLE.shut); ion.u = 0; ion.v = 0; car.pulse = Math.sin(Math.PI * car.t / (CYCLE.shut + CYCLE.turn));
      if (car.t >= CYCLE.shut) { car.ph = 'turn'; car.t = 0; }
    } else if (car.ph === 'turn') {
      car.s = sm(0, 1, car.t / CYCLE.turn); car.pulse = Math.sin(Math.PI * (CYCLE.shut + car.t) / (CYCLE.shut + CYCLE.turn));
      if (car.t >= CYCLE.turn) { car.ph = 'leave'; car.t = 0; }
    } else if (car.ph === 'leave') {
      car.s = 1; ion.u = (CAR.mouth + 0.2) * sm(0, 1, car.t / CYCLE.leave);
      if (car.t >= CYCLE.leave) { const k = K[ion.kind]; ion.cap = 0; ion.side = 1; ion.vu = Math.abs(gauss(r)) * k.s + 0.6; ion.vv = gauss(r) * k.s; c.in++; car.n++; car.ion = -1; car.ph = 'back'; car.t = 0; }
    } else if (car.ph === 'back') {
      car.s = 1 - 2 * sm(0, 1, car.t / CYCLE.back);
      if (car.t >= CYCLE.back) { car.ph = 'open'; car.t = 0; car.s = -1; }
    }
  }
  /* how much of a particle shows (0 … 1): it fades in and out, and near the edges of the space */
  const show = p => p.dead ? 0 : (p.gone ? Math.max(0, 1 - p.gone / FADE) : p.f / FADE) * sm(B.U, B.U - B.EU, Math.abs(p.u)) * sm(B.V, B.V - B.EV, Math.abs(p.v));
  const sim = { id, B, K, get P() { return P; }, get c() { return c; }, car, step, show, count, free, inBody, inObst,
    /* the same simulation from this moment, for a look ahead: it changes nothing here */
    clone: () => memSim(id, { narrow, obstacles, state: { P, c, car: car || { from: [] }, rng: r.get() } }) };
  return sim;
}

/* a look ahead (the scenes' hero): the next particle of `kind` that will have crossed into the cell (or, into: −1, out
   of it) within `secs`, with its way until a second after it; null if none does. For a still, its way is the arrow. */
export function nextAcross(sim, kind, secs = 8, into = 1, skip = -1) {
  const S = sim.clone(), B = sim.B, n0 = S.P.map(p => p.side), path = S.P.map(() => []), no = new Set([skip]);
  /* (one that stays whole in the picture all its way: never in the fading edges of the space, where its name would
     leave it) */
  const whole = q => Math.abs(q[0]) < B.U - B.EU - 0.2 && Math.abs(q[1]) < B.V - B.EV - 0.2;
  S.P.forEach((p, k) => { if (p.kind !== kind || p.dead || p.gone || n0[k] !== -into || !whole([p.u, p.v])) no.add(k); });
  for (let i = 0; i < secs / DT; i++) {
    S.step();
    for (let j = 0; j < S.P.length; j++) { if (no.has(j)) continue; const p = S.P[j], q = [p.u, p.v, p.w]; if (p.dead || p.gone || !whole(q)) { no.add(j); continue; } path[j].push(q); }
    const j = S.P.findIndex((p, k) => !no.has(k) && p.side === into);
    if (j >= 0) { for (let k = 0; k < 1.2 / DT; k++) { S.step(); const p = S.P[j], q = [p.u, p.v, p.w]; if (p.dead || p.gone || !whole(q)) break; path[j].push(q); } return { i: j, path: path[j], after: i * DT }; }
  }
  return null;
}

/* the checks (tools/plant-check.mjs K): each scene run for 90 s, for a laptop's box and a phone's. What each must say:
   - diffusion: more carbon dioxide crosses into the cell than out of it; osmosis: more water (a sugar molecule never
     between the lipids);
   - active transport: no ion crosses the lipids, none leaves the cell, the carrier moves ions in, one at a time;
   - each region keeps its concentration (the mean number in each, in equal spaces);
   - never a particle that cannot cross between the lipids, in the carrier's body or on a fibre's cut end;
   - the count, started at ANY second from 2 to 60 (the reader starts it), says the same: after 2 s never more the
     wrong way; from 6 s at least 2 more the right way; from 12 s at least `ratio` times as many (those times are for
     q = 1: a laptop's box has q = 1.5, a phone's smaller box q = 2). */
export function memCheck({ narrow = false, obstacles = [], seeds = null, only = null } = {}) {
  const out = {};
  for (const id of Object.keys(SCENES)) {
    if (only && id !== only) continue;
    const C = SCENES[id], S = memSim(id, { narrow, obstacles, seed: seeds ? seeds[id] : undefined }), hero = C.hero, K = S.K;
    const cum = [[0, 0]]; let inLipids = 0, inSolid = 0, twoInCarrier = 0;
    const mean = {}; Object.keys(K).forEach(k => { mean[k] = [0, 0]; });
    for (let t = 1; t <= 90; t++) {
      for (let i = 0; i < 30; i++) { S.step();
        S.P.forEach(p => { if (p.dead || p.gone) return; const k = K[p.kind];
          if (!k.cross && !p.cap && Math.abs(p.u) < S.B.M + k.r - 1e-6) inLipids++;
          if (!p.cap && (S.inBody(p.u, p.v, k.r - 0.02) || S.inObst(p.u, p.v, k.r - 0.02))) inSolid++; });
        if (S.car && S.P.filter(p => p.cap).length > 1) twoInCarrier++; }
      cum.push([S.c.in, S.c.out]);
      Object.keys(K).forEach(k => { mean[k][0] += S.count(k, -1) / 90; mean[k][1] += S.count(k, 1) / 90; });
    }
    /* (a phone's box is half the size, so its counts are smaller: a little more time for each) */
    const ratio = id === 'diffusion' ? 2 : id === 'osmosis' ? 1.3 : 1e9, q = narrow ? 2 : 1.5;
    let wrong = 0, worst = '';
    for (let t0 = 2; t0 <= 60; t0++) for (let d = 1; d <= 28; d++) {
      const a = cum[t0 + d][0] - cum[t0][0], b = cum[t0 + d][1] - cum[t0][1];
      const bad = id === 'active' ? (b > 0 || (d >= 14 * q && a < 1) || (d >= 28 && a < 2)) : ((d >= 2 * q && b > a) || (d >= 6 * q && a - b < 2) || (d >= 12 * q && a < ratio * b));
      if (bad) { wrong++; if (!worst) worst = `from ${t0} s, after ${d} s: ${a} in, ${b} out`; }
    }
    out[id] = { seed: seeds ? seeds[id] : narrow ? C.seedN : C.seed, wrong, worst, inLipids, inSolid, twoInCarrier, at20: cum[20], at60: cum[60], total: cum[90], moved: S.car ? S.car.n : null,
      regions: Object.fromEntries(Object.keys(K).map(k => [k, { want: [K[k].out, K[k].in], mean: mean[k].map(x => +x.toFixed(1)) }])) };
  }
  return out;
}

/* ---------------- the drawing ----------------
   ctx: { THREE, magicStandard, halo, stage, X0 (the membrane's middle, in the frame the group is added to: x across the
   membrane towards the cytoplasm, y along it, z to the viewer), at: { diffusion, osmosis, active } (each scene's place
   along the membrane; the carrier stands at `active`), fibres: [{ p, q, s }] (leaf.js: the wall's cellulose fibres) }.
   One InstancedMesh for each kind of atom, and one for the sugar's ring: a hundred particles are a few draws. */
export function makeMem(ctx) {
  const { THREE, magicStandard, halo, stage, X0, at, fibres = [] } = ctx;
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const g = new THREE.Group(); g.name = 'membrane-scenes'; g.visible = false;
  const pass = o => { o.raycast = () => {}; return o; };      /* a particle never hides a name's part (view.js inView) */

  /* ---- the cut ends of the wall's fibres at the face, by each scene: no particle is drawn over one ----
     a fibre (leaf.js `layer`): a tube 3 nm wide along its own y, bowed 30 nm towards the viewer in its middle, turned
     and placed; it is cut at the face (z = 0). Where its middle line lies within 2 nm behind the face (or just in
     front of it), its bright cut end shows there */
  const cutEnds = id => { const out = [], y0 = at[id], q = V3();
    for (const f of fibres) { for (let i = 0; i <= 900; i++) { const t = i / 900 - 0.5; q.set(0, t * f.s.y, 30 * Math.cos(t * Math.PI)).applyQuaternion(f.q).add(f.p);
        if (q.z < -2 || q.z > 1.5 || Math.abs(q.x - X0) > BOX.U + 2 || q.x > X0 - BOX.M + 1.2 || Math.abs(q.y - y0) > BOX.V + 2) continue;
        if (!out.some(o => Math.hypot(o.u - (q.x - X0), o.v - (q.y - y0)) < 0.7)) out.push({ u: q.x - X0, v: q.y - y0, r: 1.6 }); } }
    return out; };
  const OBST = { diffusion: cutEnds('diffusion'), osmosis: cutEnds('osmosis'), active: cutEnds('active') };

  /* ---- the carrier: two halves that meet face to face round a pocket (js/world/cellbuild.js `carrier`, at true size).
     Its own frame: y through the membrane (+ the cytoplasm), x along the membrane. pose(s): −1 open to the wall's side,
     0 shut on both sides, 1 open to the cytoplasm; the halves turn 14° about the ends of their faces (the rocker
     switch of such carriers is about 15 to 20°: js/world/cellbuild.js; a smaller turn, tried first, did not read as an
     open mouth: the science read, 17 Nov 2026) ---- */
  const CG = { rx: 1.9, ry: CAR.HU, rz: 1.7, cx: 0.42, P: 0.34, Ph: 0.46, Pz: 0.4, turn: 0.24 };
  const yEnd = CG.ry * Math.sqrt(1 - (CG.cx / CG.rx) ** 2);
  const halfGeo = sd => { const geo = new THREE.SphereGeometry(1, 40, 30), p = geo.attributes.position, v = V3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i);
      let x = sd * CG.cx + v.x * CG.rx; const y = v.y * CG.ry * (1 + 0.05 * Math.sin(v.x * 5 + sd)), z = v.z * CG.rz;
      if (sd * x <= 0) { const k = 1 - (y / CG.Ph) ** 2 - (z / CG.Pz) ** 2; x = k > 0 ? sd * CG.P * Math.sqrt(k) : 0; }
      p.setXYZ(i, x, y, z); }
    geo.computeVertexNormals(); return geo; };
  const carMat = magicStandard({ color: ctx.carrierColor != null ? ctx.carrierColor : 0x3fd6b0, emissive: 0x0e5a48, emissiveIntensity: 0.55, roughness: 0.38, transparent: true, opacity: 0.8 }, { rim: 0xffffff, rimK: 0.45 });
  const carrier = new THREE.Group(); carrier.name = 'carrier'; carrier.rotation.z = -Math.PI / 2; carrier.position.set(X0, at.active, (BOX.W0 + BOX.W1) / 2);
  const halves = [-1, 1].map(sd => { const h = new THREE.Mesh(halfGeo(sd), carMat); h.renderOrder = 5; carrier.add(h); return h; });
  const pose = s => { const py = s < 0 ? yEnd : -yEnd; halves.forEach((h, k) => { const a = (k ? -1 : 1) * Math.sign(s) * CG.turn * Math.abs(s); h.rotation.z = a; h.position.set(py * Math.sin(a), py * (1 - Math.cos(a)), 0); }); };
  pose(0);
  /* the pulse of light at each change of shape: energy from respiration */
  const pulse = pass(new THREE.Sprite(new THREE.SpriteMaterial({ map: halo(), color: 0xfff1a8, transparent: true, depthWrite: false, depthTest: false, opacity: 0, blending: THREE.AdditiveBlending })));
  pulse.renderOrder = 10; pulse.position.set(X0 + 0.6, at.active, 2.6); g.add(pulse);

  /* ---- the particles ---- */
  const ball = new THREE.SphereGeometry(1, 14, 10);
  const mat = (color, e, k) => magicStandard({ color, roughness: 0.38, emissive: e, emissiveIntensity: k }, { rim: 0xffffff, rimK: 0.55 });
  const pool = (geo, m, n) => { const x = pass(new THREE.InstancedMesh(geo, m, n)); x.count = 0; x.frustumCulled = false; x.renderOrder = 7; g.add(x); return x; };
  const NB = 320, mC = pool(ball, mat(0x5a6480, 0x141822, 0.45), 60), mO = pool(ball, mat(0xff6f6f, 0x5a1010, 0.55), NB), mH = pool(ball, mat(0xffffff, 0x404858, 0.5), NB), mN = pool(ball, mat(0x6f8cff, 0x10205a, 0.6), 60);
  const mS = pool(new THREE.TorusGeometry(0.37, 0.085, 8, 6), mat(0xffd56a, 0x5a3c08, 0.55), 30);
  const GN = 260, gpos = new Float32Array(GN * 3), gsz = new Float32Array(GN), gal = new Float32Array(GN), gcol = new Float32Array(GN * 3);
  const gGeo = new THREE.BufferGeometry(); gGeo.setAttribute('position', new THREE.BufferAttribute(gpos, 3)); gGeo.setAttribute('aSize', new THREE.BufferAttribute(gsz, 1)); gGeo.setAttribute('aA', new THREE.BufferAttribute(gal, 1)); gGeo.setAttribute('aC', new THREE.BufferAttribute(gcol, 3));
  const gMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: { uMap: { value: halo() }, uK: { value: 1 } },
    vertexShader: 'attribute float aSize; attribute float aA; attribute vec3 aC; uniform float uK; varying float vA; varying vec3 vC; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = min(220.0, aSize * uK / -mv.z); vA = aA; vC = aC; }',
    fragmentShader: 'uniform sampler2D uMap; varying float vA; varying vec3 vC; void main() { vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vC * t.a * vA * 1.6, t.a * vA); }' });
  const glows = pass(new THREE.Points(gGeo, gMat)); glows.frustumCulled = false; glows.renderOrder = 9; g.add(glows);
  /* (and a soft dark shade behind each, drawn first: on the pale wall a light alone does not show; the same places and
     sizes as the lights) */
  const sMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, uniforms: { uMap: { value: halo() }, uK: { value: 1 } },
    vertexShader: 'attribute float aSize; attribute float aA; uniform float uK; varying float vA; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = min(220.0, aSize * 0.9 * uK / -mv.z); vA = aA; }',
    fragmentShader: 'uniform sampler2D uMap; varying float vA; void main() { vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(0.03, 0.04, 0.14, min(1.0, t.a * 1.9) * min(1.0, vA * 1.5) * 0.72); }' });
  const shades = pass(new THREE.Points(gGeo, sMat)); shades.frustumCulled = false; shades.renderOrder = 6; g.add(shades);
  /* each kind: its atoms [pool, x, y, radius] in its own frame (nm), its glow [size (nm), strength, colour] */
  const KIND = {
    co2: { atoms: [[mC, 0, 0, 0.103], [mO, 0.177, 0, 0.098], [mO, -0.177, 0, 0.098]], glow: [2.0, 0.62, new THREE.Color(0xe6e8ff)] },
    water: { atoms: [[mO, 0, 0, 0.096], [mH, 0.09, 0.064, 0.06], [mH, -0.09, 0.064, 0.06]], glow: [1.5, 0.62, new THREE.Color(0x9fe6ff)] },
    nitrate: { atoms: [[mN, 0, 0, 0.085], [mO, 0.124, 0, 0.08], [mO, -0.062, 0.107, 0.08], [mO, -0.062, -0.107, 0.08]], glow: [1.8, 0.66, new THREE.Color(0xa8ffd8)] },
    sugar: { atoms: [[mS, 0, 0, 1]], glow: [2.6, 0.3, new THREE.Color(0xffe3a0)] }
  };
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), P3 = V3(), O3 = V3(), K3 = V3(), AX = V3(), XA = V3(1, 0, 0), ZA = V3(0, 0, 1);
  let nG = 0;
  const count0 = () => { [mC, mO, mH, mN, mS].forEach(m => { m.count = 0; }); nG = 0; };
  function put(kind, p, q, k, hero) {
    const D = KIND[kind];
    for (const [mesh, ox, oy, rad] of D.atoms) { if (mesh.count >= mesh.instanceMatrix.count) continue; O3.set(ox * k, oy * k, 0).applyQuaternion(q).add(p); K3.setScalar(rad * k); M4.compose(O3, q, K3); mesh.setMatrixAt(mesh.count++, M4); }
    if (nG < GN) { const [sz, a, c] = D.glow, h = hero ? 1 : 0; gpos[nG * 3] = p.x; gpos[nG * 3 + 1] = p.y; gpos[nG * 3 + 2] = p.z; gsz[nG] = sz * (1 + 0.9 * h); gal[nG] = Math.min(1, a * (1 + 0.9 * h)) * k; gcol[nG * 3] = c.r; gcol[nG * 3 + 1] = c.g; gcol[nG * 3 + 2] = c.b; nG++; }
  }
  const flush = () => { [mC, mO, mH, mN, mS].forEach(m => { m.instanceMatrix.needsUpdate = true; }); gGeo.setDrawRange(0, nG); ['position', 'aSize', 'aA', 'aC'].forEach(a => { gGeo.attributes[a].needsUpdate = true; }); };

  /* ---- a scene being played ---- */
  let S = null, id = null, narrow = false, acc = 0, zero = [0, 0], hero = -1, heroT = 0, heroEnd = 0, trail = [], tSim = 0;
  const now = { id: null, on: false, hero: V3(), kind: '', inMembrane: false, crossed: false, trail: [], arrow: [], carrier: '' };
  const world = (u, v, w, out = V3()) => g.localToWorld(out.set(X0 + u, at[id] + v, w));
  function start(k, { phone = false } = {}) { id = k; narrow = phone; S = memSim(k, { narrow, obstacles: OBST[k] }); acc = 0; tSim = 0; zero = [0, 0]; hero = -1; trail = []; now.id = k; g.visible = true; }
  function stop() { S = null; id = null; now.id = null; now.on = false; g.visible = false; pose(0); pulse.material.opacity = 0; count0(); flush(); }
  /* the hero: the next particle that will cross into the cell (a look ahead), followed until a little after it has
     crossed; then the next. Its way so far is its trail */
  function pickHero() {
    const kind = SCENES[id].hero, n = nextAcross(S, kind, id === 'active' ? 16 : 9, 1, hero);
    hero = n ? n.i : -1; heroEnd = n ? tSim + n.after + 1.2 : tSim + 1; trail = []; now.arrow = n ? n.path : [];
    if (hero < 0) { /* none crosses soon: the nearest to the membrane on the wall's side, for a moment */
      let bd = 1e9; S.P.forEach((p, i) => { if (p.kind !== kind || p.dead || p.gone || p.side > 0 || p.m || p.cap || S.show(p) < 0.99) return; const d = Math.hypot(p.u + S.B.M + 2.5, p.v * 0.6); if (d < bd) { bd = d; hero = i; } }); heroEnd = tSim + 2; }
  }
  function draw() {
    count0(); sMat.uniforms.uK.value = gMat.uniforms.uK.value = (stage.H * stage.renderer.getPixelRatio() / 2) / Math.tan(THREE.MathUtils.degToRad(stage.cam.fov / 2));
    now.on = false;
    S.P.forEach((p, i) => { const k = S.show(p); if (k <= 0.01) return;
      const e = k * k * (3 - 2 * k); AX.set(p.ax, p.ay, p.az).normalize(); Q.setFromUnitVectors(p.kind === 'sugar' ? ZA : XA, AX);
      P3.set(X0 + p.u, at[id] + p.v, p.w); put(p.kind, P3, Q, e, i === hero);
      if (i === hero) { world(p.u, p.v, p.w, now.hero); now.on = e > 0.5; now.kind = p.kind; now.inMembrane = !!p.m || !!p.cap; now.crossed = p.side > 0; } });
    if (S.car) { pose(S.car.s); pulse.material.opacity = 0.95 * S.car.pulse; pulse.scale.setScalar(5 + 9 * S.car.pulse); carMat.emissiveIntensity = 0.55 + 1.6 * S.car.pulse; now.carrier = S.car.ph; }
    flush();
  }
  /* dt: the real seconds since the last frame; the simulation steps at its own fixed pace (at most four steps a frame) */
  function frame(dt) {
    if (!S) return;
    acc = Math.min(acc + dt, 4 * DT); let did = false;
    while (acc >= DT) { S.step(); tSim += DT; acc -= DT; did = true;
      if (hero >= 0) { const p = S.P[hero], l = trail[trail.length - 1];
        /* (its way is one line: a particle that leaves at the top and comes in at the bottom starts a new one) */
        if (p.dead || p.gone || tSim > heroEnd || S.show(p) < 0.3) hero = -1; else { if (l && Math.abs(l[1] - p.v) > S.B.V) trail = []; trail.push([p.u, p.v, p.w]); if (trail.length > 54) trail.shift(); } }
      if (hero < 0) pickHero(); }
    if (did) { draw(); now.trail = trail.map(q => world(q[0], q[1], q[2])); }
  }
  /* a still (Reduce motion, the tests): the scene after `sec` seconds, always the same; its hero where its way begins,
     and that way (the still's arrow) */
  function still(k, sec, opt = {}) {
    start(k, opt);
    const kind = SCENES[id].hero, at = opt.at || 'start', H = Math.round(2.6 / DT), hist = S.P.map(() => []);
    const fwd = n => { for (let i = 0; i < n; i++) { S.step(); tSim += DT; if (opt.mark != null && Math.abs(tSim - opt.mark) < DT / 2) zero = [S.c.in, S.c.out];
      S.P.forEach((p, j) => { const h = hist[j]; if (p.dead || p.gone) { h.length = 0; return; } const l = h[h.length - 1]; if (l && Math.abs(l[1] - p.v) > S.B.V) h.length = 0; h.push([p.u, p.v, p.w]); if (h.length > H) h.shift(); }); } };
    const whole = q => Math.abs(q[0]) < S.B.U - S.B.EU - 0.2 && Math.abs(q[1]) < S.B.V - S.B.EV - 0.2;
    /* a particle's way from now on, for `secs` (a look ahead: it changes nothing) */
    const ahead = (j, secs) => { const F = S.clone(), out = []; for (let i = 0; i < secs / DT; i++) { F.step(); const p = F.P[j], q = [p.u, p.v, p.w]; if (p.dead || p.gone || !whole(q)) break; out.push(q); } return out; };
    fwd(Math.round(sec / DT));
    hero = -1; now.arrow = [];
    /* The still's own moment, from that second on (the science read, 17 Nov 2026: the arrow began away from the named
       particle, and a smooth arrow across the membrane stood under "random movement"). The followed particle is always
       ON its arrow, and the arrow is its true way:
       'wander': a particle of the wall's side whose next seconds turn most, and stay in the wall (random movement);
       'start' : the next to cross, at the start of the last seconds of its way to the other side;
       'in'    : the same particle while it is between the lipids, its way before and after;
       'bind'  : an ion entering the open carrier; 'turn': the carrier changing shape round it, the light on. */
    if (at === 'wander') {
      const F = S.clone(), path = S.P.map(() => []), ok = S.P.map(p => p.kind === kind && !p.dead && !p.gone && p.side < 0 && !p.m && !p.cap && whole([p.u, p.v]));
      for (let i = 0; i < 3.4 / DT; i++) { F.step(); F.P.forEach((p, j) => { if (!ok[j]) return; const q = [p.u, p.v, p.w]; if (p.dead || p.gone || p.m || p.cap || p.side > 0 || !whole(q)) { ok[j] = false; return; } path[j].push(q); }); }
      let best = -1, bs = 0;
      path.forEach((P, j) => { if (!ok[j] || P.length < 3 / DT) return; let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
        const net = Math.hypot(P[P.length - 1][0] - P[0][0], P[P.length - 1][1] - P[0][1]); if (L < 4 || net < 1.6) return; const sc = L / net; if (sc > bs) { bs = sc; best = j; } });
      if (best >= 0) { hero = best; now.arrow = [[S.P[best].u, S.P[best].v, S.P[best].w]].concat(path[best]); }
    } else if ((at === 'bind' || at === 'turn') && S.car) {
      for (let i = 0; i < 60 / DT; i++) { fwd(1); const c = S.car; if ((at === 'turn' ? c.ph === 'turn' && c.t >= CYCLE.turn * 0.12 : c.ph === 'bind' && c.t >= CYCLE.bind * 0.5) && hist[c.ion].length > 1.2 / DT) { hero = c.ion; break; } }
      if (hero >= 0) now.arrow = hist[hero].concat(ahead(hero, at === 'turn' ? 1.7 : 2.9));
    } else {
      for (let n = 0; n < 200 && hero < 0; n++) { const x = nextAcross(S, kind, id === 'active' ? 16 : 9, 1, -1), p = x ? S.P[x.i] : null;
        if (!p || p.cap || p.m || x.path.length < 1.6 / DT) { fwd(6); continue; }
        const extra = Math.max(0, x.path.length - Math.round(4 / DT)); fwd(extra); hero = x.i; now.arrow = [[p.u, p.v, p.w]].concat(x.path.slice(extra));
        if (at === 'in') { /* on, until it is in the middle of the lipids */ let i = 0; while (i++ < 4 / DT && !(p.m && Math.abs(p.u) < 0.9)) fwd(1); now.arrow = hist[hero].concat(ahead(hero, 1.6)); } }
    }
    if (hero < 0) pickHero();
    heroEnd = tSim + 99; draw(); now.trail = [];
    now.arrowW = now.arrow.filter((_, i) => i % 3 === 0 || i === now.arrow.length - 1).map(q => world(q[0], q[1], q[2]));
  }
  return { group: g, carrier, pose, now, start, stop, frame, still, obstacles: OBST, half: BOX.M, carrierSize: [2 * CAR.HV + 1.4, 2 * CAR.HU],
    /* the middle of the membrane at the scene being played (the stage's own frame) */
    centre: () => g.localToWorld(V3(X0, at[id || 'diffusion'], (BOX.W0 + BOX.W1) / 2)),
    /* the counter: crossings each way since `mark()` */
    mark() { if (S) zero = [S.c.in, S.c.out]; }, counts: () => S ? { in: S.c.in - zero[0], out: S.c.out - zero[1] } : { in: 0, out: 0 },
    get sim() { return S; }, get time() { return tSim; }, get heroState() { return { i: hero, end: +heroEnd.toFixed(2), t: +tSim.toFixed(2), on: now.on, show: hero >= 0 && S ? +S.show(S.P[hero]).toFixed(2) : null }; },
    /* for the checks: a minute and a half of each scene, with the cut fibres of its own place */
    check: phone => { const out = {}; for (const k of Object.keys(SCENES)) out[k] = memCheck({ narrow: !!phone, obstacles: OBST[k], only: k })[k]; return out; },
    /* what is drawn now, for the checks: each kind's particles on each side that show whole */
    census: () => { const c = {}; if (S) S.P.forEach(p => { if (S.show(p) < 0.9 || p.m || p.cap) return; const kk = p.kind + (p.side < 0 ? ':wall' : ':cell'); c[kk] = (c[kk] || 0) + 1; }); return c; },
    sizes: () => ({ water: 2 * (0.09 + 0.06), co2: 2 * (0.177 + 0.098), nitrate: 2 * (0.124 + 0.08), sugar: 2 * (0.37 + 0.085), carrier: [2 * (CG.rx + CG.cx), 2 * CG.ry], lipids: 2 * BOX.M }),
    dispose() { /* the group's own geometries and materials go with the scene (stage.js disposeGroup) */ } };
}
