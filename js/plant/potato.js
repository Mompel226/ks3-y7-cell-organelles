/* ============================================================
   potato.js — the plant-cell branch's second picture (11 Nov 2026): one storage cell of a potato (a tuber), cut open,
   with its starch grains (each a separate solid body; about a third of the cell here, see below); iodine solution turns the grains blue-black, as in the game's well B. Units: nanometres.
   Sizes: potato starch grains are oval and the largest of the common starches, up to about 110 µm long (Singh, Singh,
   Kaur, Sodhi & Gill 2003, Food Chemistry 81:219): here 14 to 60 µm. How much of a cell they fill: no measured figure was found; from a potato's starch (15 to
   20 % of its fresh mass) the grains are roughly a tenth to a fifth of a cell's volume, so the cell is no longer drawn
   packed full (the check of the shapes, 11 Nov 2026). The cell is drawn 170 µm across: no
   measured size of a potato storage cell was read, so no size of the cell is stated to pupils (the scale bar shows the
   picture's own scale). The nucleus is 6 µm, as in the leaf's cell. The colours of the iodine test are the game's own
   (js/game/main.js: orange-brown 0xc8701e, blue-black 0x1b1d3a).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { magicStandard, PAL } from '../world/magic.js?v=202611121652';
import { smooth, disposeGroup } from '../ib/stage.js?v=202611121652';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export const S = { cell: 170000, wall: 400, grainMin: 10000, grainMax: 60000, nucleus: 6000 };

export async function build(stage) {
  const R = rng(21), g = new THREE.Group(); g.name = 'potato';
  const cut = new THREE.Plane(V(0, 0, -1), 0);          /* the front half of the cell is away: z ≤ 0 is kept */
  /* a storage cell: a many-sided ball, its sides pressed flat by the cells round it */
  const body = new THREE.IcosahedronGeometry(1, 5);
  const faces = Array.from({ length: 14 }, () => { const u = R() * 2 - 1, a = R() * 6.283, s = Math.sqrt(1 - u * u); return V(s * Math.cos(a), u, s * Math.sin(a)); });
  const shape = v => { let k = 1; faces.forEach(f => { const d = v.dot(f); if (d > 0.8) k = Math.min(k, 0.8 / d + 0.03 * (1 - 0.8 / d) * 6); }); return k; };
  { const P = body.attributes.position, v = V(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).normalize(); const k = shape(v) * S.cell / 2; P.setXYZ(i, v.x * k, v.y * k * 0.94, v.z * k); } body.computeVertexNormals(); }
  const wallMat = magicStandard({ color: 0xe8dca8, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6, clippingPlanes: [cut] }, { rim: 0xfff6d0, rimK: 1.1 });
  const wall = new THREE.Mesh(body, wallMat); wall.renderOrder = 3; g.add(wall);
  /* its cut edge, a pale line; and the liquid of the cell where it is cut (it takes the colour of the iodine solution) */
  const edgePts = []; for (let i = 0; i < 180; i++) { const a = i / 180 * 6.2832, v = V(Math.cos(a), Math.sin(a), 0), k = shape(v) * S.cell / 2; edgePts.push(V(v.x * k, v.y * k * 0.94, 0)); }
  const edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(edgePts), new THREE.LineBasicMaterial({ color: 0xfff6d0, transparent: true, opacity: 0.95 })); edge.renderOrder = 6; g.add(edge);
  const liquidMat = new THREE.MeshBasicMaterial({ color: 0x5a6fae, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
  const liquid = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(edgePts.map(p => new THREE.Vector2(p.x, p.y))), 1), liquidMat); liquid.renderOrder = 1; liquid.position.z = -62000; liquid.scale.set(0.76, 0.76, 1); g.add(liquid);
  /* the cells round it, pale: a potato is made of many such cells */
  const nbMat = magicStandard({ color: 0xd9cc98, transparent: true, opacity: 0.1, depthWrite: false, roughness: 0.7 }, { rim: 0xfff6d0, rimK: 0.7 });
  const NBP = [[-1.02, 0.1, -0.2], [1.0, -0.12, -0.25], [0.1, 1.0, -0.3], [-0.15, -0.99, -0.3], [-0.7, 0.72, -0.9], [0.72, 0.7, -0.9], [0, 0, -1.2]];
  NBP.forEach((p, i) => {
    const m = new THREE.Mesh(body, nbMat); m.position.set(p[0] * S.cell * 0.97, p[1] * S.cell * 0.92, p[2] * S.cell * 0.8); m.rotation.set(i * 1.3, i * 2.1, i * 0.7); m.renderOrder = 0; g.add(m); });
  /* starch grains: ovals, 14 to 66 µm long, each whole, behind the cut */
  const grains = [];
  const inside = (p, r) => { const v = p.clone(); v.y /= 0.94; const L = v.length(); if (L < 1) return true; return L + r * 1.02 < shape(v.clone().normalize()) * S.cell / 2 - S.wall - 800; };
  /* an egg-shaped grain as three balls that cover it, so that two grains can lie side by side and never one in another */
  const balls = G => [[-0.5, 0.6], [0.05, 0.82], [0.55, 0.62]].map(([x, k]) => ({ c: V(x * G.r, 0, 0).applyQuaternion(G.q).add(G.p), r: k * G.r * 0.99 }));
  const apart = (A, B) => Math.min(...balls(A).flatMap(a => balls(B).map(b => a.c.distanceTo(b.c) / (a.r + b.r))));
  for (let i = 0; i < 90000 && grains.length < 64; i++) {
    /* a few large grains, more of middle size, many small ones (Singh et al. 2003: 5 to 100 µm, most of them small) */
    const big = i < 3000 && grains.length < 6, mid = !big && i < 20000 && grains.length < 24, r = (big ? 19000 + R() * 11000 : mid ? 11000 + R() * 6500 : 5200 + R() * 4500), p = V((R() * 2 - 1) * 80000, (R() * 2 - 1) * 78000, -r * 0.72 - 900 - R() * R() * 70000);
    if (!inside(p, r)) continue;
    const G = { p, r, s: V(r, r * (0.72 + R() * 0.08), r * (0.66 + R() * 0.1)), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(R() * 0.5, R() * 0.5, R() * 3.1)) };
    if (grains.some(o => o.p.distanceTo(p) < (r + o.r) * 1.25 && apart(G, o) < 1.03)) continue;      /* each grain is a separate solid body: none touches into another */
    grains.push(G);
  }
  const grainMat = magicStandard({ color: 0xe9e3cf, vertexColors: true, roughness: 0.5, emissive: 0x4a4636, emissiveIntensity: 0.22 }, { rim: 0xffffff, rimK: 0.35 });
  /* a potato's starch grains are egg-shaped: one end broader (Singh et al. 2003: oval and irregular) */
  const egg = new THREE.SphereGeometry(1, 72, 44); { const P = egg.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), k = 1 + 0.2 * x; P.setXYZ(i, x, P.getY(i) * k, P.getZ(i) * k); } egg.computeVertexNormals();
    /* a potato's grain grows in layers round a point near its narrow end (the hilum): faint rings (Evert, Esau's Plant
       Anatomy, 3rd ed.; the second check of the shapes, 11 Nov 2026) */
    const C = new Float32Array(P.count * 3), h = V(-0.72, 0.12, 0.3), v = V(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const c = 0.93 + 0.07 * Math.cos(v.distanceTo(h) * 6.2832 / 0.2); C[3 * i] = C[3 * i + 1] = C[3 * i + 2] = c; }
    egg.setAttribute('color', new THREE.BufferAttribute(C, 3)); }
  const gm = new THREE.InstancedMesh(egg, grainMat, grains.length), o = new THREE.Object3D();
  grains.forEach((G, i) => { o.position.copy(G.p); o.quaternion.copy(G.q); o.scale.copy(G.s); o.updateMatrix(); gm.setMatrixAt(i, o.matrix); }); gm.frustumCulled = false; g.add(gm);
  /* the cells round it hold starch grains too: faint, as those cells are */
  { const fm = magicStandard({ color: 0xe9e3cf, transparent: true, opacity: 0.2, depthWrite: false, roughness: 0.6 }, { rim: 0xffffff, rimK: 0.3 }), far = [];
    NBP.forEach(q => { const c = V(q[0] * S.cell * 0.97, q[1] * S.cell * 0.92, q[2] * S.cell * 0.8); for (let i = 0; i < 300 && far.filter(f => f.c === q).length < 9; i++) { const r = 9000 + R() * 15000, pp = c.clone().add(V((R() * 2 - 1), (R() * 2 - 1), (R() * 2 - 1)).multiplyScalar(S.cell * 0.3)); if (far.some(f => f.p.distanceTo(pp) < f.r + r)) continue; far.push({ c: q, p: pp, r, e: new THREE.Euler(R() * 3, R() * 3, R() * 3) }); } });
    const fmesh = new THREE.InstancedMesh(egg, fm, far.length); far.forEach((f, i) => { o.position.copy(f.p); o.rotation.copy(f.e); o.scale.set(f.r, f.r * 0.76, f.r * 0.7); o.updateMatrix(); fmesh.setMatrixAt(i, o.matrix); }); fmesh.frustumCulled = false; fmesh.renderOrder = 0; g.add(fmesh); }
  /* its nucleus, between the grains (6 µm: small beside them) */
  const NP = (() => { for (let i = 0; i < 4000; i++) { const p = V((R() * 2 - 1) * 60000, (R() * 2 - 1) * 60000, -3200 - R() * 2500); if (inside(p, 4000) && !grains.some(G => G.p.distanceTo(p) < G.r + 4200)) return p; } return V(0, 0, -3200); })();
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(S.nucleus / 2, 28, 20), magicStandard({ color: PAL.nucleus, roughness: 0.4, emissive: 0x1a1250, emissiveIntensity: 0.6 }, { rim: PAL.envelope, rimK: 1 })); nucleus.position.copy(NP); g.add(nucleus);

  const knobs = { cam: 0, iod: 0 };
  const WHITE = new THREE.Color(0xe9e3cf), BLUE = new THREE.Color(0x1b1d3a), E0 = new THREE.Color(0x4a4636), E1 = new THREE.Color(0x0a0c22), L0 = new THREE.Color(0x5a6fae), L1 = new THREE.Color(0xc8701e);
  function draw(K) {
    /* the iodine solution spreads through the liquid first (orange-brown); then the grains turn blue-black */
    const a = smooth(0, 0.45, K.iod), b = smooth(0.3, 1, K.iod);
    liquidMat.color.copy(L0).lerp(L1, a); liquidMat.opacity = 0.16 + 0.2 * a;
    grainMat.color.copy(WHITE).lerp(BLUE, b); grainMat.emissive.copy(E0).lerp(E1, b);
    grainMat.userData.u.uRim.value.set(0xffffff).lerp(new THREE.Color(0x6a70c8), b);
  }
  const D = (x, y, z) => V(x, y, z).normalize();
  const views = [{ at: V(0, 0, -20000), dist: 420000, dir: D(0.12, 0.08, 1), up: V(0, 1, 0), fit: { pts: [[S.cell * 0.55, S.cell * 0.52, 5000]], min: 300000 } }];
  const front = grains.slice().sort((a, b) => b.p.z - a.p.z);
  /* a grain's name stands outside the cell, its line ending on a grain near the cell's right edge (no name on the grains) */
  const edgeGrains = grains.filter(G => G.p.z > -40000).sort((a, b) => (b.p.x + b.s.x) - (a.p.x + a.s.x)).slice(0, 4), edgePt = G => G.p.clone().add(V(G.s.x * 0.86, 0, G.s.z * 0.5));
  const labels = {
    cell: { html: 'one cell of a potato', side: 'l', pts: () => [edgePts[86], edgePts[96], edgePts[78]] },
    wall: { html: 'cell wall', side: 'r', pts: () => [edgePts[8], edgePts[170], edgePts[18]] },
    grain: { html: 'a starch grain', side: 'r', pts: () => edgeGrains.map(edgePt) },
    grain2: { html: 'starch: blue-black with iodine solution', htmlN: 'starch: blue-black', side: 'r', pts: () => edgeGrains.map(edgePt) },
    nucleus: { html: 'nucleus', side: 'l', pts: () => [NP.clone().add(V(-S.nucleus / 2 + 300, 0, 0))] }
  };
  const hots = { drop: () => V(0, S.cell * 0.36, 0) };
  const steps = [
    { id: 'potato', phases: [{ to: { cam: 0, iod: 0 }, ms: 0 }], labs: { cell: 1, grain: 1, wall: 1, nucleus: 2 } },
    { id: 'iodine', phases: [], labs: { grain: 1 }, press: { all: [{ id: 'iodine', label: 'Add iodine solution', at: 'drop', side: 'c', to: { iod: 1 }, ms: 3200, labs: { grain2: 1 } }] }, end: { iod: 1 }, endLabs: { grain2: 1 } }
  ];
  const measure = () => ({ cell: 2 * Math.max(...edgePts.map(p => Math.abs(p.x))), grainMin: Math.min(...grains.map(G => 2 * G.s.x)), grainMax: Math.max(...grains.map(G => 2 * G.s.x)), grains: grains.length, grainShare: grains.reduce((a, G) => a + 4 / 3 * Math.PI * G.s.x * G.s.y * G.s.z, 0) / (0.5 * 4 / 3 * Math.PI * Math.pow(S.cell / 2 * 0.9, 3)), grainApart: Math.min(...grains.flatMap((A, i) => grains.slice(i + 1).map(B => apart(A, B)))), nucleus: 2 * nucleus.geometry.parameters.radius });
  return { group: g, knobs, views, steps, labels, hots, draw, measure, turn: true, sizes: { grains: grains.map(G => Math.round(G.s.x * 2)), nucleus: S.nucleus }, dispose() { disposeGroup(g); } };
}
