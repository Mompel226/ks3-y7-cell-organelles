/* ============================================================
   wayflow.js — the way in's molecules as they really move, with a course on (17 Nov 2026; Daniel, of the leaf's films
   the evening before: "extremely simple"; then "Yes, carry on" to the way in). The IGCSE definition (0610 3.1.1) is
   "the net movement of particles from a region of their higher concentration to a region of their lower concentration
   (down a concentration gradient), as a result of their random movement". Two molecules on a smooth curve show none of
   that. So with IGCSE or IB on (play.js flowOn), the step shows MANY molecules of its kind:
   - each moves at random: its velocity changes a little at random every frame (it keeps its way for about half a second
     and then wanders off), so each goes its own wandering way, never straight, never steered;
   - more where the concentration is higher. The gradient is kept as in the tissue: oxygen comes from the blood (a
     source just above the capillary, the bottom of the space) and is used in the cell's respiration (a molecule that
     wanders out of the top of the space is used: it fades, and a new one comes from the blood); carbon dioxide the
     other way (it comes down from the respiring cell and the plasma carries it away). Diffusion between a source and a
     sink gives a density that falls in a straight line from one to the other, and so does this;
   - oxygen and carbon dioxide (small, non-polar) cross the membrane between the lipids, in BOTH directions, never
     through a carrier protein; glucose cannot cross the lipids: it bounces off them (play.js: the step's own glucose
     goes through its carrier protein);
   - a counter of the crossings (play.js concStrip) shows the net movement: more cross down the gradient than up it,
     though no molecule is pushed. Each kind's random numbers are fixed (`seed`), chosen so that from the first seconds
     the count already says what diffusion does: flowCheck runs every kind for a minute and says if any second of it
     does not (a run with other numbers can, for a few seconds, before the net movement shows; true, but misleading).
   Sizes: the game's molecules at the way in (play.js WSZ, 135 times); pace: slowed, as every film of the game.
   No imports: the simulation is plain numbers (flowSim, run by the checks too); makeFlow draws it with what play.js
   hands in (three.js, the game's material, its glow points).
   ============================================================ */

/* small, fixed random numbers (mulberry32) and a bell curve from them */
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const gauss = r => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185 * r()); };

/* the space, in the world's units (µm of the cell; the membrane drawn about 135 times thicker): x along the base, y up
   (the middle of the membrane at 0, its two faces at ±M: cellbuild.js LIP, the heads' tops), z towards you (the front
   cut is at 0.25: the molecules stay in the front µm, where they are seen). YB: just above the capillary's wall at the
   front; YT: the top of the way in's view, in the cytoplasm */
export const SPACE = { X0: -5.2, X1: 3.0, Z0: -0.9, Z1: 0.17, ZC: -0.3, YB: -2.2, YT: 1.5, M: 0.385 };
/* n: how many; s: their speed (µm a second, each way, on average); tau: how long one keeps its way (s); src: where a new
   one comes from (y), the source; sink: 'top' or 'bottom', where one is used or carried away; glucose: no crossing, no
   source and no sink (the step's own glucose goes through its carrier protein: play.js viaCarrier), `out` of them
   outside the cell. Glucose is slower: it is twice as large. yb: carbon dioxide is carried away a little higher, where
   the tissue fluid meets the capillary at the back (so the concentration falls more steeply, and the higher one in the
   cell shows in the close view) */
export const KINDS = {
  oxygen: { n: 125, s: 0.36, tau: 0.45, cross: true, src: [-2.15, -1.75], sink: 'top', seed: 0 },
  co2: { n: 125, s: 0.36, tau: 0.45, cross: true, src: [1.15, 1.5], sink: 'bottom', yb: -1.75, seed: 0 },
  glucose: { n: 46, out: 40, s: 0.26, tau: 0.5, cross: false, seed: 3 }
};
/* each kind's seed (flowCheck: the first one of 1 … 400 whose every second of a minute says what diffusion does) */
KINDS.oxygen.seed = 23; KINDS.co2.seed = 82;

const DT = 1 / 30, FADE = 12;   /* a step of the simulation (s); a molecule fades in or out over 12 steps (0.4 s) */

/* the simulation: plain numbers. carriers: [{ x, z }] of the carrier proteins (no molecule enters one) */
export function flowSim(kind, carriers = [], seed) {
  const K = KINDS[kind], S = Object.assign({}, SPACE, K.yb != null ? { YB: K.yb } : {}), r = rng(seed == null ? K.seed : seed), M = S.M, k = Math.sqrt(2 * DT / K.tau);
  const P = [], c = { up: 0, down: 0, used: 0, steps: 0 };
  const glu = !K.cross, ins = (m, y) => glu ? (y > -M - 0.05 && y < M + 0.05) : false;
  /* one in the space: at the start, where the steady gradient puts it (the density falls in a straight line from the
     source to the sink); later, at the source */
  /* (a carrier's whole width at every depth: a carrier protein is see-through, and a molecule crossing in front of it or
     behind it was seen inside its outline, the very error this place teaches against: the science read, 17 Nov 2026) */
  const inCarrier = m => carriers.some(C => Math.abs(m.y) < 0.66 && Math.abs(m.x - C.x) < 0.7);
  const place = (m, start, i) => {
    let y;
    if (glu) y = i < K.out ? S.YB + (-M - 0.06 - S.YB) * r() : M + 0.06 + (S.YT - M - 0.06) * r();
    else if (start) { for (;;) { y = S.YB + (S.YT - S.YB) * r(); const d = K.sink === 'top' ? S.YT - y : y - S.YB; if (r() * (S.YT - S.YB) < d) break; } }
    else y = K.src[0] + (K.src[1] - K.src[0]) * r();
    do { m.x = S.X0 + (S.X1 - S.X0) * r(); m.y = y; m.z = (y > M ? S.ZC : S.Z0) + (S.Z1 - (y > M ? S.ZC : S.Z0)) * r(); } while (inCarrier(m));   /* (never in a carrier) */
    m.vx = gauss(r) * K.s; m.vy = gauss(r) * K.s; m.vz = gauss(r) * K.s;
    /* its axis (a linear molecule's, a ring's face), turning slowly at random */
    m.ax = gauss(r); m.ay = gauss(r); m.az = gauss(r);
    m.side = y < 0 ? -1 : 1; m.f = start ? FADE : 0; m.gone = 0;
    return m;
  };
  for (let i = 0; i < K.n; i++) P.push(place({}, true, i));
  function step() {
    c.steps++;
    for (const m of P) {
      if (m.gone) { if (++m.gone > FADE) place(m, false); continue; }
      if (m.f < FADE) m.f++;
      m.vx += -m.vx * DT / K.tau + K.s * k * gauss(r); m.vy += -m.vy * DT / K.tau + K.s * k * gauss(r); m.vz += -m.vz * DT / K.tau + K.s * k * gauss(r);
      const px = m.x, py = m.y, pz = m.z;
      m.x += m.vx * DT; m.y += m.vy * DT; m.z += m.vz * DT;
      m.ax += gauss(r) * 0.06; m.ay += gauss(r) * 0.06; m.az += gauss(r) * 0.06;
      if (m.x < S.X0) { m.x = 2 * S.X0 - m.x; m.vx = -m.vx; } else if (m.x > S.X1) { m.x = 2 * S.X1 - m.x; m.vx = -m.vx; }
      if (m.z < S.Z0) { m.z = 2 * S.Z0 - m.z; m.vz = -m.vz; } else if (m.z > S.Z1) { m.z = 2 * S.Z1 - m.z; m.vz = -m.vz; }
      /* in the cell, the front of the cut only (ZC): further back the rough ER's sheets, just above the membrane, hid most
         of them, and the higher concentration of carbon dioxide in the cell was not seen (17 Nov 2026) */
      if (m.y > M && m.z < S.ZC) { m.z = Math.min(S.Z1, 2 * S.ZC - m.z); m.vz = Math.abs(m.vz); }
      /* a carrier protein, or (glucose) the lipids: back the way it came */
      if (inCarrier(m)) {
        const x1 = m.x, y1 = m.y, z1 = m.z; m.x = px; m.y = py; m.z = pz;
        if (inCarrier({ x: x1, y: py, z: pz })) m.vx = -m.vx;
        if (inCarrier({ x: px, y: y1, z: pz })) m.vy = -m.vy;
        if (inCarrier({ x: px, y: py, z: z1 })) m.vz = -m.vz;
      }
      if (ins(m, m.y)) { m.y = py; m.vy = -m.vy; }
      /* the ends of the space: the sink uses it (it fades, and comes again at the source); the other end sends it back */
      const top = m.y > S.YT, bottom = m.y < S.YB;
      if (top || bottom) {
        if (!glu && (top ? K.sink === 'top' : K.sink === 'bottom')) { m.gone = 1; c.used++; continue; }
        if (top) { m.y = 2 * S.YT - m.y; m.vy = -m.vy; } else { m.y = 2 * S.YB - m.y; m.vy = -m.vy; }
      }
      /* a crossing: from below the membrane to above it (into the cell), or back */
      if (m.y > M && m.side < 0) { m.side = 1; c.up++; } else if (m.y < -M && m.side > 0) { m.side = -1; c.down++; }
    }
  }
  return { kind, P, c, step, inCarrier };
}

/* the checks (play.js flowCheck): each kind run for a minute. Every second: what diffusion does (oxygen: more into the
   cell than out of it; carbon dioxide the other way; from 4 s at least two more, from 8 s at least twice as many);
   never a molecule inside a carrier protein; glucose never between the lipids; more molecules where the concentration
   is higher (in the part of the space the camera sees close up) */
export function flowCheck(carriers) {
  const out = {};
  for (const kind of Object.keys(KINDS)) {
    const F = flowSim(kind, carriers), K = KINDS[kind], down = K.sink === 'bottom';
    let wrong = 0, inside = 0, inLipids = 0, first = null;
    const lo = [], hi = [];
    for (let t = 1; t <= 60; t++) {
      for (let i = 0; i < 30; i++) { F.step(); for (const m of F.P) { if (!m.gone && F.inCarrier(m)) inside++; if (!K.cross && Math.abs(m.y) < SPACE.M) inLipids++; } }
      const a = down ? F.c.down : F.c.up, b = down ? F.c.up : F.c.down;
      if (K.cross && (b > a || (t >= 4 && a - b < 2) || (t >= 8 && a < 2 * b))) wrong++;
      if (t === 10) first = { with: a, against: b };
      const seen = F.P.filter(m => !m.gone && m.x > -2.05 && m.x < 1.25);
      lo.push(seen.filter(m => m.y > -1.55 && m.y < -SPACE.M).length / (1.55 - SPACE.M));
      hi.push(seen.filter(m => m.y > SPACE.M && m.y < 0.95).length / (0.95 - SPACE.M));
    }
    const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
    out[kind] = { n: K.n, seed: K.seed, wrong, inside, inLipids, at10s: first, total: { with: down ? F.c.down : F.c.up, against: down ? F.c.up : F.c.down }, used: F.c.used,
      outside: +mean(lo).toFixed(1), inCell: +mean(hi).toFixed(1) };
  }
  return out;
}

/* the drawing: one InstancedMesh for each kind of atom (and a glow each), so that 125 molecules are a few draws.
   ctx: { THREE, magicStandard, glowPoints }; size: the token's size (play.js WSZ); glow: its glow's colour */
export function makeFlow(ctx, kind, { carriers = [], size, glow }) {
  const { THREE, magicStandard, glowPoints } = ctx, F = flowSim(kind, carriers), n = F.P.length;
  const group = new THREE.Group(); group.name = 'way-flow-' + kind;
  const mat = color => magicStandard({ color, emissive: color, emissiveIntensity: 0.32, roughness: 0.35 }, { rim: 0xffffff, rimK: 0.5 });
  /* the atoms as the game's own token draws them (actors.js token): [geometry, colour, offset along the axis] */
  const s = size, parts = kind === 'oxygen' ? [[new THREE.SphereGeometry(s * 0.5, 14, 10), 0xff6b6b, -s * 0.42], [new THREE.SphereGeometry(s * 0.5, 14, 10), 0xff8a8a, s * 0.42]]
    : kind === 'co2' ? [[new THREE.SphereGeometry(s * 0.42, 14, 10), 0x9aa3b5, 0], [new THREE.SphereGeometry(s * 0.4, 14, 10), 0xff7b7b, -s * 0.72], [new THREE.SphereGeometry(s * 0.4, 14, 10), 0xff7b7b, s * 0.72]]
    : [[new THREE.TorusGeometry(s, s * 0.22, 8, 6), 0xffd56a, 0]];
  const meshes = parts.map(([geo, color]) => { const m = new THREE.InstancedMesh(geo, mat(color), n); m.frustumCulled = false; m.renderOrder = 6; group.add(m); return m; });
  /* (each with a soft light, as the named one has: light, not size, so that a pupil sees them: memory true-relative-sizes) */
  const base = kind === 'glucose' ? 0.3 : kind === 'co2' ? 0.44 : 0.34, halo = glowPoints(n, base); halo.renderOrder = 9; group.add(halo);   /* (carbon dioxide's pale light a little larger: on the blue cytoplasm it was the faintest) */
  const gc = new THREE.Color(glow), O = new THREE.Object3D(), ax = new THREE.Vector3(), Z = new THREE.Vector3(0, 0, 1), X = new THREE.Vector3(1, 0, 0);
  const S0 = Object.assign({}, SPACE, KINDS[kind].yb != null ? { YB: KINDS[kind].yb } : {});
  const edge = y => kind === 'glucose' ? 1 : Math.min(1, Math.max(0, (S0.YT - y) / 0.45), kind === 'co2' ? Math.max(0, (y - S0.YB) / 0.4) : 1);
  function draw() {
    const hp = halo.geometry.attributes.position, hc = halo.geometry.attributes.color;
    F.P.forEach((m, i) => {
      /* (and softly near the ends of the space, so that none appears or goes in plain view: deeper in the cell at the top, in
         the plasma at carbon dioxide's bottom) */
      const k = (m.gone ? Math.max(0, 1 - m.gone / FADE) : m.f / FADE) * edge(m.y), e = k * k * (3 - 2 * k);
      ax.set(m.ax, m.ay, m.az).normalize();
      O.quaternion.setFromUnitVectors(kind === 'glucose' ? Z : X, ax); O.scale.setScalar(Math.max(1e-4, e));
      parts.forEach(([, , off], j) => { O.position.set(m.x, m.y, m.z).addScaledVector(ax, off * e); O.updateMatrix(); meshes[j].setMatrixAt(i, O.matrix); });
      hp.setXYZ(i, m.x, m.y, m.z); hc.setXYZ(i, gc.r * e, gc.g * e, gc.b * e);
    });
    meshes.forEach(m => { m.instanceMatrix.needsUpdate = true; });
    hp.needsUpdate = true; hc.needsUpdate = true;
  }
  draw();
  let acc = 0;
  return {
    group, counts: F.c, kind, n,
    /* dt: the real seconds since the last frame; the simulation steps at its own fixed pace (at most four steps a frame) */
    update(dt) { acc = Math.min(acc + dt, 4 * DT); let did = false; while (acc >= DT) { F.step(); acc -= DT; did = true; } if (did) draw(); },
    /* Reduce motion: one still, after `sec` seconds of crossings (the counter shows them) */
    still(sec) { for (let i = 0; i < sec / DT; i++) F.step(); draw(); },
    /* the lights keep their size on the screen however far the camera is (k: its distance over the close view's): from
       the whole base the molecules are dots too small to see, and the cell's ribosomes then read as more molecules */
    glow(k) { halo.material.size = base * k; },
    dispose() { meshes.forEach(m => { m.geometry.dispose(); m.material.dispose(); m.dispose && m.dispose(); }); halo.geometry.dispose(); halo.material.dispose(); }
  };
}
