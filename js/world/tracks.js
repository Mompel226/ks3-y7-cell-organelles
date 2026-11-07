/* ============================================================
   tracks.js — the microtubules at their true sizes (7 Nov 2026). Daniel, 6 Nov 2026, of the way in: "the red blood
   cells kind of floating in an ominous way, that is impressive ... I have really gone small"; asked whether another
   place could give that feeling, he chose the microtubules ("Yes, build it", 7 Nov 2026). Every size here is true, and
   the camera comes close instead of anything being drawn bigger (memory true-relative-sizes):
   - a microtubule 25 nm wide: 13 rows (protofilaments) of tubulin, alpha and beta in turn, 4 nm each, so a pair is
     8 nm, one step of the motor; each row starts 12/13 nm further along than the one before (13 rows, 3-start helix);
   - a motor protein (kinesin) about 80 nm long: two heads (7.5 × 4.5 × 4.5 nm) on the microtubule, a stalk 2 nm
     thick, and a tail that holds the vesicle's membrane 75 nm from the microtubule;
   - the vesicle 0.9 µm across (the game's own, made at the Golgi; zymogen granules are about 1 µm), packed with
     amylase molecules about 5 nm across (a sample of them: a real vesicle holds far more).
   Microtubule: Alberts et al., Molecular Biology of the Cell 7e (2022), ch. 16. Kinesin about 80 nm long: Hirokawa et
   al. 1989, Cell 56:867; steps of 8 nm: Svoboda et al. 1993, Nature 365:721; one ATP a step, about 100 steps a
   second: Schnitzer & Block 1997, Nature 388:386.
   A motor is built in its own frame: x along its microtubule (towards the top of the cell), y towards its vesicle,
   z out of the picture. Units: µm, like the rest of the world.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { magicStandard } from './magic.js?v=202611071901';

const nm = 0.001;
export const TRUE = {
  mt: 12.5 * nm,                 /* a microtubule's radius */
  row: 10.1 * nm,                /* where the middles of its rows of tubulin lie */
  tub: 4 * nm,                   /* one tubulin */
  head: [3.75 * nm, 2.25 * nm, 2.25 * nm],   /* half the length, height and width of a motor's head */
  step: 8 * nm,                  /* one step of the motor */
  reach: 75 * nm,                /* from the microtubule's surface to the vesicle's membrane */
  amylase: 5 * nm                /* an amylase molecule */
};

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

/* a motor protein, at its true size, standing on its microtubule at the origin of its frame. reach(k): 0 its stalk
   bent, the tail 30 nm short of the vesicle; 1 straight, the tail on the vesicle's membrane. pose(i, e): during step i,
   e of the way through it, hand over hand: the back head swings 16 nm forward past the other one, rising 4 nm; the
   neck, and all it holds (cargo: the stalk, the tail, the vesicle), moves 8 nm */
export function trueMotor() {
  const group = new THREE.Group(); group.name = 'true-motor';
  const mat = magicStandard({ color: 0xffa8dc, emissive: 0xc0307f, emissiveIntensity: 0.55, roughness: 0.35 }, { rim: 0xffe6f5, rimK: 0.9 });
  const H = TRUE.head, y0 = TRUE.mt + H[1];
  const heads = [0, 1].map(() => { const h = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), mat); h.scale.set(H[0], H[1], H[2]); group.add(h); return h; });
  const cargo = new THREE.Group(); group.add(cargo);
  const top = TRUE.mt + TRUE.reach;
  const tail = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat); tail.scale.set(6 * nm, 2.8 * nm, 6 * nm); cargo.add(tail);
  let stalk = null, curve = null;
  function reach(k) {
    const base = new THREE.Vector3(0, y0 + H[1] * 0.6, 0), neck = base.clone().add(new THREE.Vector3(0, 6 * nm, 0));
    const end = new THREE.Vector3(18 * nm * (1 - k), top - 2.8 * nm - 30 * nm * (1 - k), 6 * nm * (1 - k));
    const hinge = neck.clone().lerp(end, 0.5).add(new THREE.Vector3(-14 * nm * (1 - k), 0, 8 * nm * (1 - k)));
    curve = new THREE.CatmullRomCurve3([base, neck, hinge, end]);
    const geo = new THREE.TubeGeometry(curve, 36, 1.1 * nm, 8, false);
    if (stalk) { stalk.geometry.dispose(); stalk.geometry = geo; } else { stalk = new THREE.Mesh(geo, mat); cargo.add(stalk); }
    tail.position.copy(end).add(new THREE.Vector3(0, 1.6 * nm, 0));
  }
  function pose(i, e) {
    const mv = i % 2, rest = 1 - mv, s = Math.sin(Math.PI * e);
    heads[mv].position.set((-4 + 8 * i + 16 * e) * nm, y0 + 4 * nm * s, 3 * nm * s);
    heads[rest].position.set((4 + 8 * i) * nm, y0, 0);
    cargo.position.x = 8 * (i + e) * nm;
  }
  reach(0); pose(0, 0);
  /* a point of the stalk as it is now (t 0 at the heads, 1 at the tail), in the world: where its name's line ends */
  const onStalk = t => stalk.localToWorld(curve.getPointAt(t));
  return { group, heads, cargo, reach, pose, onStalk, tail: () => tail.getWorldPosition(new THREE.Vector3()), parts: () => [...heads, stalk, tail] };
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
export function amylaseCore(r, count = 70000) {
  const g = new THREE.Group(), pos = new Float32Array(count * 3);
  let seed = 20261107; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < count; i++) {
    let x, y, z; do { x = rnd() * 2 - 1; y = rnd() * 2 - 1; z = rnd() * 2 - 1; } while (x * x + y * y + z * z > 1);
    pos[i * 3] = x * r * 0.96; pos[i * 3 + 1] = y * r * 0.96; pos[i * 3 + 2] = z * r * 0.96;
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas'); c.width = c.height = 32; const x2 = c.getContext('2d'), gr = x2.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x2.fillStyle = gr; x2.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ size: TRUE.amylase, map: tex, color: 0xffcf6a, transparent: true, opacity: 0.85, depthWrite: false, sizeAttenuation: true }));
  points.renderOrder = 7; points.userData.nm = TRUE.amylase; points.name = 'amylase';
  const haze = new THREE.Mesh(new THREE.SphereGeometry(r * 0.9, 32, 24), new THREE.MeshBasicMaterial({ color: 0xffc860, transparent: true, opacity: 0.22, depthWrite: false }));
  haze.renderOrder = 6;
  g.add(haze, points); g.userData.points = points;
  return g;
}
