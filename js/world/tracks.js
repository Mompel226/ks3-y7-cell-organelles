/* ============================================================
   tracks.js — the microtubules at their true sizes (7 Nov 2026). Daniel, 6 Nov 2026, of the way in: "the red blood
   cells kind of floating in an ominous way, that is impressive ... I have really gone small"; asked whether another
   place could give that feeling, he chose the microtubules ("Yes, build it", 7 Nov 2026). Every size here is true, and
   the camera comes close instead of anything being drawn bigger (memory true-relative-sizes):
   - a microtubule 25 nm wide: 13 rows (protofilaments) of tubulin, alpha and beta in turn, 4 nm each, so a pair is
     8 nm; each row starts 12/13 nm further along than the one before (13 rows, 3-start helix);
   - the motor protein is cytoplasmic dynein, with dynactin and a cargo adaptor (7 Nov 2026, evening: it was drawn like
     kinesin-1, which walks to the plus ends; here the vesicle walks to the minus ends, at the top of the cell, and
     dynein and dynactin are what is found on these vesicles, kinesin not: Kraemer et al. 1999, European Journal of
     Cell Biology 78:265, in the pancreas, so the words say "probably"):
     - each of dynein's two heads is a ring of six AAA+ parts, 13.8 nm across and 4 nm thick (Reck-Peterson et al.
       2006, Cell 126:335: 13–15 nm across, 4 nm wide; Burgess et al. 2003, Nature 421:715: about 13 nm), lying
       parallel to the microtubule (Can et al. 2019, Nature 566:407), with a linker about 10 nm long across its face
       (Burgess 2003), where the tail starts;
     - its stalk is 15 nm long (Carter et al. 2008, Science 322:1691; Burgess 2003: 15.4 nm) and about 2 nm wide
       (Burgess 2003), with a knob at its tip that holds the microtubule (six short helices: Carter 2008; its size in nm
       is not given, so it is drawn 4 nm, a little wider than the stalk, as Burgess 2003 shows it). The stalk leans
       45 degrees towards the plus end (Can 2019 measured 55 ± 26 degrees), so the middle of the ring is 17 nm above the
       microtubule (Grotjahn et al. 2018, Nature Structural & Molecular Biology 25:203; Chowdhury et al. 2015, NSMB
       22:345: about 17 nm); the two heads stand side by side on neighbouring rows, their tips 7 nm apart (Chowdhury 2015:
       about 7 nm; Grotjahn 2018: the tips 6 nm and the rings 12 nm apart);
     - dynactin: a filament 38 nm long (Foster et al. 2022, Journal of Cell Biology 221:e202103154; Schafer et al. 1994,
       JCB 126:403: 37 nm), eight Arp1 and one actin (Urnavicius et al. 2015, Science 347:1441), capped at its barbed
       end, its pointed-end complex at the other; a shoulder near the barbed end, on the side away from the microtubule
       (Chowdhury 2015), and the p150 arm, over 50 nm long, folded against it (Urnavicius 2015). It lies at 40 degrees to
       the microtubule (Chowdhury 2015: the complexes all tilted one way, at a range of angles), its barbed end by
       dynein's heads (Urnavicius 2015), leaning towards the plus end: the vesicle it tows comes behind;
     - dynein's two tails, each about 4 nm thick, lie along dynactin's filament, from its barbed end almost to its
       pointed end (Urnavicius 2015), on the side towards the microtubule (Chowdhury 2015), the intermediate chain on the
       middle of each, the two tails joined at their end;
     - the cargo adaptor: a coiled coil 2 nm wide that runs between dynein's tails and dynactin's filament from its barbed
       end and out of its pointed end ("the Bicaudal-D2 coiled coil runs between dynein and dynactin": Urnavicius 2015;
       BICD2's coiled coil of about 270 amino acids, 40 nm at 0.15 nm each), then on to the vesicle's membrane. Every
       adaptor that starts dynein has a coiled coil over 200 amino acids long and joins
       dynein and dynactin to a cargo (Reck-Peterson et al. 2018, Nature Reviews Molecular Cell Biology 19:382). Which
       adaptor these vesicles use is not known: it is drawn like BICD2, which holds vesicles from the Golgi apparatus;
     - so the whole of dynein and dynactin is 66 nm long (Foster 2022: 65 nm long, 30 nm wide), and the vesicle's
       membrane is 56 nm from dynein's heads and 67 nm from the microtubule (Foster 2022: in nerve cells, a 60 nm link
       from a vesicle to round heads on a microtubule, which looks like dynein and dynactin);
     - dynein walks only once dynactin and an adaptor have joined it (McKenney et al. 2014, Science 345:337; Elshenawy
       et al. 2019, Nature Chemical Biology 15:1093); alone it is folded, its heads stacked (Zhang et al. 2017, Cell
       169:1303), and hardly moves. Which joins first, in a cell, is not known (the expert review, 7 Nov 2026): so the
       three are joined on the vesicle from the start (Kraemer 1999 found dynein and dynactin on these vesicles), the
       heads 8 nm off the microtubule, and Attach lands them on it;
     - one dynein: with BICD2, often two dyneins join one dynactin (Grotjahn 2018), and BICD2 can also bring only one
       (Urnavicius et al. 2018, Nature 554:202); the How big? card says so;
     - its steps vary (Reck-Peterson 2006: mostly 8 nm, some 12–24 nm, a fifth backwards, some to the side; Elshenawy
       2019: dynein and dynactin take steps of 8–32 nm, often to the side and backwards; DeWitt et al. 2012, Science
       335:221: the heads do not strictly take turns). Here one head steps at a time, 16 or 32 nm, once 16 nm back; the
       back head steps round the microtubule to the next row and later back again; dynactin and the vesicle move half as
       far: 8 nm five times, 16 nm once and 8 nm back once, 48 nm in seven steps. A real one moves about 0.9 µm a second (McKenney
       2014: 892 nm a second at 37 °C);
   - the vesicle 0.9 µm across (the game's own, made at the Golgi; zymogen granules are about 1 µm), packed with
     amylase molecules about 5 nm across (a sample of them: a real vesicle holds far more).
   Microtubule: Alberts et al., Molecular Biology of the Cell 7e (2022), ch. 16.
   A motor is built in its own frame: x along its microtubule (towards the top of the cell, its minus end), y towards
   its vesicle, z out of the picture. Units: µm, like the rest of the world.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { magicStandard } from './magic.js?v=202611091600';

const nm = 0.001, DEG = Math.PI / 180;
/* dynein, dynactin and the adaptor in the motor's frame, in nm, worked out once from the sizes above: the drawing,
   play.js and the checks all use these numbers */
const D = (() => {
  const tilt = 45 * DEG, lean = 40 * DEG, s = [-Math.cos(tilt), Math.sin(tilt)];
  const knob = 12.5 + 1.3;                                   /* the knob's middle: on the microtubule's surface, a little in its groove */
  const ring = [21.4 * s[0], 0.5 + 21.4 * s[1]];             /* the ring's middle, from the knob: the stalk (15 nm) and the ring's radius */
  const e = [-Math.cos(lean), Math.sin(lean), 0], n = [Math.sin(lean), Math.cos(lean), 0];   /* along dynactin; across it, away from the microtubule */
  const barbed = [-10, 42, 8];
  const at = (sAlong, nOut, z) => [barbed[0] + sAlong * e[0] + nOut * n[0], barbed[1] + sAlong * e[1] + nOut * n[1], barbed[2] + z];
  const out = at(38, 3.5, 2), grip = [out[0] - 2.5, out[1] + 9.7, out[2] - 1];   /* the adaptor leaves the pointed end; its end on the membrane */
  return { tilt, lean, s, knob, ring, e, n, barbed, at, out, grip };
})();
export const TRUE = {
  mt: 12.5 * nm,                 /* a microtubule's radius */
  row: 10.1 * nm,                /* where the middles of its rows of tubulin lie */
  tub: 4 * nm,                   /* one tubulin */
  ring: 6.9 * nm,                /* the outer radius of one of dynein's rings: 13.8 nm across */
  stalk: 15 * nm,                /* dynein's stalk */
  dynactin: 38 * nm,             /* dynactin's filament, end to end */
  step: 8 * nm,                  /* dynein's most common step */
  reach: (D.grip[1] - 12.5) * nm,   /* from the microtubule's surface to the vesicle's membrane: 67 nm */
  lag: D.grip[0] * nm,           /* the vesicle's middle, behind dynein's heads (towards the plus end): 40 nm */
  amylase: 5 * nm                /* an amylase molecule */
};
/* the seven steps after Attach: [which head, nm along the microtubule, rows round it]; each head's own steps add up to
   48 nm, so after them every part stands 48 nm further on, as it stood at the start */
export const STEPS = [[0, 16, 0], [1, 16, 0], [0, 16, -1], [1, 32, 0], [1, -16, 0], [0, 16, 1], [1, 16, 0]];
TRUE.walk = 48 * nm;              /* how far the seven steps carry dynactin and the vesicle */

/* a piece of microtubule from one point to another, at its true size: every tubulin a small bead; alpha pale, beta
   darker. It starts unseen (opacity 0): the camera shows it as it comes close (play.js) */
export function trueTrack(from, to) {
  const a = to.clone().sub(from), L = a.length(); a.normalize();
  const t = Math.abs(a.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(a, t).normalize(), w = new THREE.Vector3().crossVectors(a, u);
  const per = Math.floor(L / TRUE.tub), n = 13 * per;
  const mat = magicStandard({ color: 0xffffff, roughness: 0.45, emissive: 0x2a6f86, emissiveIntensity: 0.35, transparent: true, opacity: 0 }, { rim: 0xd8fbff, rimK: 0.5 });
  const m = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.45 * nm, 1), mat, n);
  const o = new THREE.Object3D(), alpha = new THREE.Color(0xa8f1ff), beta = new THREE.Color(0x5fc4e0);
  let k = 0;
  for (let p = 0; p < 13; p++) {
    const ang = p / 13 * Math.PI * 2, off = p * 12 * nm / 13;
    for (let i = 0; i < per; i++) {
      o.position.copy(from).addScaledVector(a, i * TRUE.tub + off).addScaledVector(u, TRUE.row * Math.cos(ang)).addScaledVector(w, TRUE.row * Math.sin(ang));
      o.updateMatrix(); m.setMatrixAt(k, o.matrix); m.setColorAt(k, i % 2 ? beta : alpha); k++;
    }
  }
  m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; m.computeBoundingSphere();
  m.renderOrder = 4; m.name = 'true-microtubule'; m.visible = false;
  return m;
}

/* dynein with dynactin and the adaptor, at their true sizes, joined together on the vesicle, dynein's heads at the
   origin of the frame. Two groups: dynein's heads (each a knob, a stalk, a ring and its linker) step on the
   microtubule; the cargo (dynactin, the adaptor, and the vesicle play.js adds) moves with the middle of the two heads.
   Dynein's tails, which lie along dynactin, are drawn again as the heads move.
   reach(k): 0 the heads 8 nm off the microtubule; 1 on it (Attach).
   pose(i, e): during step i (STEPS), e of the way through it: the head that steps lifts 5 nm and moves on (round the
   microtubule too), and the cargo moves half as far */
export function trueMotor() {
  const group = new THREE.Group(); group.name = 'true-motor';
  const V = (x, y, z) => new THREE.Vector3(x * nm, y * nm, z * nm);
  const pink = magicStandard({ color: 0xffa8dc, emissive: 0xc0307f, emissiveIntensity: 0.55, roughness: 0.35 }, { rim: 0xffe6f5, rimK: 0.9 });
  const lilac = magicStandard({ color: 0xcbb8ff, emissive: 0x5a3fc2, emissiveIntensity: 0.5, roughness: 0.4 }, { rim: 0xf1ebff, rimK: 0.8 });
  const green = magicStandard({ color: 0xa6f2a0, emissive: 0x2d9a46, emissiveIntensity: 0.5, roughness: 0.4 }, { rim: 0xeaffe6, rimK: 0.8 });
  const ball = new THREE.SphereGeometry(1, 16, 12);
  const blob = (mat, at, r, name) => { const m = new THREE.Mesh(ball, mat); m.scale.set(r[0] * nm, r[1] * nm, r[2] * nm); m.position.copy(at); if (name) m.name = name; return m; };
  const tube = (pts, r, seg = 24) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r * nm, 7, false);
  const ROW = 2 * Math.PI / 13, SIDE = [1.5 * ROW, 2.5 * ROW];     /* the two heads on neighbouring rows of tubulin, on the face seen, so both rings show */
  const [sx, sy] = D.s, R = D.ring;
  /* a head: pivot (where along the microtubule, how far round it) > lift (the knob's middle; it lifts as it steps) */
  const heads = [0, 1].map(h => {
    const pivot = new THREE.Group(), lift = new THREE.Group(); pivot.add(lift); group.add(pivot);
    lift.add(blob(pink, V(0, 0, 0), [2.1, 1.9, 2.1], 'dynein-knob-' + h));
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(1 * nm, 1 * nm, 15 * nm, 8), pink);
    stalk.position.copy(V(7.5 * sx, 0.5 + 7.5 * sy, 0)); stalk.rotation.z = Math.PI / 2 - D.tilt; stalk.name = 'dynein-stalk-' + h; lift.add(stalk);
    /* six AAA+ parts round a small hole, the stalk leaving between two of them */
    const into = Math.atan2(-sy, -sx), beads = [];
    for (let j = 0; j < 6; j++) {
      const a = into + (j + 0.5) * Math.PI / 3, b = blob(pink, V(R[0] + 4.5 * Math.cos(a), R[1] + 4.5 * Math.sin(a), 0), [2.4, 2.4, 2], 'dynein-aaa');
      lift.add(b); beads.push(b);
    }
    const ring = new THREE.Object3D(); ring.position.copy(V(R[0], R[1], 0)); ring.name = 'dynein-ring-' + h; lift.add(ring);
    const L0 = V(R[0] - 3.4, R[1] + 3.4, 2.6);
    lift.add(new THREE.Mesh(tube([L0, V(R[0] + 0.2, R[1] + 1.4, 3), V(R[0] + 3.8, R[1] - 1.8, 2.6)], 1.2, 12), pink));
    lift.position.y = D.knob * nm;
    return { pivot, lift, stalk, beads, ring, L0 };
  });
  /* the cargo: dynactin and the adaptor (the vesicle is added by play.js) */
  const cargo = new THREE.Group(); group.add(cargo);
  const A = (s, n, z) => { const p = D.at(s, n, z); return V(p[0], p[1], p[2]); };
  const dir = new THREE.Vector3(D.e[0], D.e[1], 0), across = new THREE.Vector3(D.n[0], D.n[1], 0);
  const along = (mesh) => { mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); return mesh; };
  /* the filament: a cap, eight Arp1 and one actin in two strands (2.75 nm a step, as in actin), the pointed-end complex */
  cargo.add(along(blob(lilac, A(2.5, 0, 0), [3.6, 2.4, 3.6], 'dynactin-cap')));
  const side = new THREE.Vector3().crossVectors(dir, across);
  for (let j = 0; j < 9; j++) {
    const t = j * 167 * DEG, p = A(6.5 + j * 2.75, 0, 0).addScaledVector(across, 2.4 * nm * Math.cos(t)).addScaledVector(side, 2.4 * nm * Math.sin(t));
    cargo.add(blob(lilac, p, [2.7, 2.7, 2.7], 'dynactin-arp'));
  }
  cargo.add(along(blob(lilac, A(33.5, 0, 0), [3.6, 4.4, 3.6], 'dynactin-pointed')));
  cargo.add(along(blob(lilac, A(10, 7.2, -0.5), [6, 7, 6.5], 'dynactin-shoulder')));
  cargo.add(new THREE.Mesh(tube([A(9, 9, 1.5), A(16, 5.2, -2.4), A(26, 4.4, -2.8), A(34, 4.4, -2.4), A(37, 3, -0.8), A(31, 6.4, -1.8), A(19, 7.4, -2.4)], 1, 40), lilac));
  /* the adaptor: between dynein's tails and the filament, from the barbed end, out round the pointed end, to the
     vesicle's membrane */
  const g = D.grip, gEnd = V(g[0], g[1] - 1.4, g[2]), turn = A(40.2, 2.2, 1.2);
  const adaptorPts = [A(2.5, -3.2, 1.6), A(12, -3.3, 1.8), A(24, -3.3, 1.8), A(33, -3, 1.6), A(39, -1.2, 1.4), turn, V(g[0] - 0.6, g[1] - 5, g[2] + 0.4), gEnd];
  const adaptor = new THREE.Mesh(tube(adaptorPts, 1, 48), green); adaptor.name = 'adaptor'; cargo.add(adaptor);
  const gripBall = blob(green, V(g[0], g[1] - 0.6, g[2]), [2, 1.6, 2], 'adaptor-end'); cargo.add(gripBall);
  /* dynein's tails, about 4 nm thick, along dynactin on the microtubule's side, drawn again as the heads move: from
     each ring's linker to dynactin, then along it; the intermediate chain on the middle of each; joined at their end */
  const tails = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), pink); m.name = 'dynein-tail'; group.add(m); return m; });
  const middles = [0, 1].map(() => { const m = blob(pink, new THREE.Vector3(), [2.4, 2.4, 2.4], 'dynein-intermediate'); group.add(m); return m; });
  const joined = blob(pink, new THREE.Vector3(), [2.6, 2.6, 2.6], 'dynein-tail-end'); group.add(joined);
  let K = 0, last = [0, 0];
  const inGroup = (h, v) => { h.pivot.updateMatrix(); h.lift.updateMatrix(); return v.clone().applyMatrix4(h.lift.matrix).applyMatrix4(h.pivot.matrix); };
  function drawTails() {
    const c = cargo.position;
    tails.forEach((m, h) => {
      const l0 = inGroup(heads[h], heads[h].L0), z = (h ? 1.8 : -1.8);
      const d0 = A(4, -6.6, z).add(c), d1 = A(31, -6.6, z * 0.4).add(c);
      const pts = [l0, l0.clone().lerp(d0, 0.5).add(V(0, 2, 0)), d0, d0.clone().lerp(d1, 0.5), d1];
      m.geometry.dispose(); m.geometry = tube(pts, 2, 28);
      middles[h].position.copy(d0).lerp(d1, 0.45).addScaledVector(across, -2.6 * nm);
    });
    joined.position.copy(A(32.5, -6.6, 0)).add(c);
  }
  /* where each head stands before each step */
  const before = [[{ x: -3, row: 0 }, { x: 3, row: 0 }]];
  STEPS.forEach(([h, dx, dr]) => { const s = before[before.length - 1].map(o => ({ ...o })); s[h].x += dx; s[h].row += dr; before.push(s); });
  function pose(i, e) {
    last = [i, e];
    const k = Math.max(0, Math.min(STEPS.length - 1, i)), st = before[k], [h, dx, dr] = STEPS[k];
    const u = e * e * (3 - 2 * e), up = Math.sin(Math.PI * e);
    heads.forEach((hd, j) => {
      const go = j === h, x = st[j].x + (go ? dx * u : 0), row = st[j].row + (go ? dr * u : 0);
      hd.pivot.position.set(x * nm, 0, 0); hd.pivot.rotation.x = SIDE[j] + row * ROW;
      hd.lift.position.y = (D.knob + (go ? 5 * up : 0) + 8 * (1 - K)) * nm; hd.lift.rotation.z = go ? -0.22 * up : 0;
    });
    cargo.position.x = ((st[0].x + st[1].x) / 2 + (dx / 2) * u) * nm;
    drawTails();
  }
  function reach(k) { K = k; pose(last[0], last[1]); }
  reach(0); pose(0, 0);
  /* points where the names' lines may end, in the world, as the parts are now: on the front head's ring and stalk,
     along dynactin's filament, along the adaptor between dynactin and the vesicle */
  const world = v => group.localToWorld(v.clone());
  const spots = {
    dynein: () => { group.updateMatrixWorld(true); const f = heads[1]; return [...f.beads.map(b => b.getWorldPosition(new THREE.Vector3())), f.stalk.getWorldPosition(new THREE.Vector3())]; },
    dynactin: () => { group.updateMatrixWorld(true); return [14, 18, 22, 26, 30].map(s => world(A(s, 0, 2.6).add(cargo.position))); },
    adaptor: () => { group.updateMatrixWorld(true); return [0.3, 0.5, 0.7, 0.85].map(t => world(turn.clone().lerp(gEnd, t).add(cargo.position))); }
  };
  const parts = () => { const list = []; group.traverse(o => { if (o.isMesh) list.push(o); }); return list; };
  return { group, heads, cargo, reach, pose, spots, parts, grip: () => gripBall.getWorldPosition(new THREE.Vector3()) };
}

/* a round light, for a motor seen from far, where at its true size it is too small to see (light, not size): pink,
   with a dark ring, drawn over everything, so that it shows on the pale cytoplasm and the Golgi apparatus's glare too
   (the expert review, 7 Nov 2026: an additive glow was lost there) */
let GLOW = null;
export function glowSprite(color) {
  if (!GLOW) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const col = '#' + new THREE.Color(color).getHexString(), gr = g.createRadialGradient(32, 32, 0, 32, 32, 22);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, col); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.beginPath(); g.arc(32, 32, 22, 0, 6.2832); g.fill();
    g.lineWidth = 4; g.strokeStyle = 'rgba(20,16,48,0.85)'; g.beginPath(); g.arc(32, 32, 24, 0, 6.2832); g.stroke();
    GLOW = new THREE.CanvasTexture(c); GLOW.colorSpace = THREE.SRGBColorSpace;
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, transparent: true, depthWrite: false, depthTest: false }));
  s.renderOrder = 12; return s;
}

/* the inside of a packed vesicle: amylase molecules at their true size, about 5 nm (a sample), and a soft golden glow
   that shows from far that it is full, where each molecule is far too small to see. points.userData.nm: the size the
   points must be drawn at (play.js sets their size for the camera each frame, so each dot is 5 nm on the screen) */
export function amylaseCore(r, count = 70000, near = 0) {
  const g = new THREE.Group(), pos = new Float32Array((count + near) * 3);
  let seed = 20261107; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < count; i++) {
    let x, y, z; do { x = rnd() * 2 - 1; y = rnd() * 2 - 1; z = rnd() * 2 - 1; } while (x * x + y * y + z * z > 1);
    pos[i * 3] = x * r * 0.96; pos[i * 3 + 1] = y * r * 0.96; pos[i * 3 + 2] = z * r * 0.96;
  }
  /* near: that many more just under the membrane where it faces the microtubule (its -y side, beside dynein), so that
     some dots lie at dynein's depth and are seen at their true size beside its heads (the expert review, 7 Nov 2026) */
  for (let i = count; i < count + near; i++) {
    const a = rnd() * Math.PI * 2, c = Math.sqrt(rnd()) * 0.32, d = r - 0.004 - rnd() * 0.012;
    pos[i * 3] = d * Math.sin(c) * Math.cos(a); pos[i * 3 + 1] = -d * Math.cos(c); pos[i * 3 + 2] = d * Math.sin(c) * Math.sin(a);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas'); c.width = c.height = 32; const x2 = c.getContext('2d'), gr = x2.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.8, 'rgba(255,255,255,0.92)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x2.fillStyle = gr; x2.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ size: TRUE.amylase, map: tex, color: 0xffcf6a, transparent: true, opacity: 0.85, depthWrite: false, sizeAttenuation: true }));
  points.renderOrder = 7; points.userData.nm = TRUE.amylase; points.name = 'amylase';
  const haze = new THREE.Mesh(new THREE.SphereGeometry(r * 0.9, 32, 24), new THREE.MeshBasicMaterial({ color: 0xffc860, transparent: true, opacity: 0.22, depthWrite: false }));
  haze.renderOrder = 6;
  g.add(haze, points); g.userData.points = points;
  return g;
}
