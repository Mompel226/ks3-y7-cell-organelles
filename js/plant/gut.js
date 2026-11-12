/* ============================================================
   gut.js — the plant-cell branch's third picture (11 Nov 2026): the pupil eats the potato. In the mouth, salivary amylase
   starts to digest starch into maltose; in the small intestine, maltase (an enzyme attached to the membrane of the cells that line
   it) digests maltose into glucose; glucose passes through the wall of a villus into the blood. Units: nanometres.
   One picture: the molecules lie at the tip of one villus, so that the camera can move back from them to the whole
   villus without a cut. Never "amylase makes glucose" (Daniel's Year 7 slides, Bacteria-and-Enzymes s16–17: salivary and
   pancreatic amylase, starch → maltose; maltase, on the lining of the small intestine, maltose → glucose + glucose).
   Sizes: glucose 0.9 nm (the game's own figure, js/game/play.js) and amylase 8.3 nm long (the measured molecule, PDB
   1SMD: js/game/actors.js); in a starch chain each glucose
   adds about 0.5 nm to its length, so the rings overlap like the links of a chain; maltase is drawn 9 nm across, larger
   than amylase (it is one part of a large enzyme of the membrane, maltase-glucoamylase: Sim et al. 2008, Journal of
   Molecular Biology 375:782; no size is stated to pupils); the membrane's two layers of lipids about 5 nm (js/ib/
   membrane.js). A villus is drawn 0.6 mm long and 0.13 mm wide, with a capillary 8.5 µm wide (the game's capillary):
   textbooks give 0.5–1 mm (OpenStax, Anatomy and Physiology 2e, 23.5), measurements of fixed tissue less (about 0.3 mm),
   so the words say only "less than 1 millimetre". The tiny folds of the cells' own membrane (microvilli) are not drawn.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { magicStandard, PAL } from '../world/magic.js?v=202611121712';
import { token, riboPart, AMY_S } from '../game/actors.js?v=202611121712';
import { bilayer } from '../ib/membrane.js?v=202611121712';
import { glow, smooth, disposeGroup } from '../ib/stage.js?v=202611121712';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const S = { glucose: 0.9, amylase: 8.3, maltase: 9, link: 0.5, villus: 600000, villusW: 130000, capillary: 8500, cellH: 25000, cellW: 8000,
  microvillus: 1300, microvillusW: 100, mvPitch: 130, lacteal: 20000, arteriole: 10000, venule: 13000 };

export async function build(stage) {
  const g = new THREE.Group(); g.name = 'gut';
  /* ---------------- the molecules, at the top of a villus ---------------- */
  const mol = new THREE.Group(); g.add(mol);
  /* part of one starch molecule: 24 glucose rings in a chain that winds gently (each adds 0.5 nm) */
  const N = 24, ring = [], home = [];
  for (let i = 0; i < N; i++) { const t = token('glucose', 0.37); mol.add(t); ring.push(t);
    home.push(V(-5.8 + i * S.link, 6.2 + 0.55 * Math.sin(i * 0.62), 0.55 * Math.cos(i * 0.62))); }
  const tilt = i => new THREE.Euler(0.3 * Math.sin(i * 0.62), 0.78, 0.25 * Math.cos(i * 0.62));
  /* amylase: the game's own drawing of it, its groove (the active site) towards the chain */
  const tokSize = t => { const b = new THREE.Box3(); t.children.filter(c => c.isMesh).forEach(c => { c.updateMatrix(); if (!c.geometry.boundingBox) c.geometry.computeBoundingBox(); b.union(c.geometry.boundingBox.clone().applyMatrix4(c.matrix)); }); const v = b.getSize(new THREE.Vector3()); return Math.max(v.x, v.y, v.z); };
  /* (12 Nov 2026: the game's amylase is now the measured molecule, PDB 1SMD, 8.3 nm long and 5 to 5.6 nm wide:
     js/game/actors.js. Here at its true size, turned so that its active site faces the chain, down and a little towards
     the viewer; before, an outline 5 nm across) */
  const amylase = token('amylase', AMY_S * 1000); amylase.rotation.set(1.2, 0, 0.2); mol.add(amylase);
  const amyTips = (() => { const m = amylase.children[0], P = m.geometry.attributes.position, k = m.scale.x, v = new THREE.Vector3(); let a = null, b = null, sa = -1e9, sb = -1e9;
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).multiplyScalar(k); if (v.x > sa) { sa = v.x; a = v.clone(); } const q = v.x * 0.8 - v.y * 0.6; if (q > sb) { sb = q; b = v.clone(); } }
    return [a, b]; })();
  const amyGlow = glow(11, 0xffe0a0, 0.35); amylase.add(amyGlow);
  /* maltose: the chain cut into pairs; each pair's place once amylase has passed (dig), then on its way down to maltase */
  const pairOf = i => Math.floor(i / 2), pairs = N / 2;
  /* amylase cuts bonds inside the chain, not from its end (Robyt & French 1967, Archives of Biochemistry and Biophysics
     122:8): the pairs come free from the middle outwards, amylase moving to each cut */
  const ORDER = [5, 6, 4, 7, 3, 8, 2, 9, 1, 10, 0, 11], rank = p => ORDER.indexOf(p);
  const pairAt = p => V(-7.5 + (p % 6) * 3.0 + (Math.floor(p / 6)) * 1.3, 3.4 - Math.floor(p / 6) * 2.3 + 0.5 * Math.sin(p * 1.7), 1.0 + 0.8 * Math.cos(p * 1.3));
  /* the membrane of a cell of the small intestine, with maltase held in it. Only one thin thread of the enzyme crosses
     the membrane; all the rest of it stands outside the cell, in the small intestine, a few nanometres above the
     lipids (Sim et al. 2008; the check of the shapes, 11 Nov 2026) */
  const MEM_Y = -13.4;
  const gutG = new THREE.Group(); mol.add(gutG);
  const mem = bilayer({ x0: -30, x1: 30, depth: 13, seed: 6, holes: [{ x: 6, z: -4.2, r: 1.1 }] }); mem.position.y = MEM_Y; gutG.add(mem);
  const maltase = new THREE.Group(); maltase.position.set(6, -3.9, -4.2); gutG.add(maltase);
  { const body = new THREE.Group(), probe = new THREE.Group(); probe.add(new THREE.Mesh(riboPart(1, 1, 0.9, 0.95, 1, 3, 5.2)));
    body.add(new THREE.Mesh(riboPart(S.maltase / tokSize(probe), 1, 0.9, 0.95, 1, 3, 5.2), magicStandard({ color: 0x7fd6b8, roughness: 0.4, emissive: 0x0e4a3a, emissiveIntensity: 0.7 }, { rim: 0xd6fff0, rimK: 0.9 }))); maltase.add(body);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 9, 10), magicStandard({ color: 0x5fbfa2, roughness: 0.5, emissive: 0x0e4a3a, emissiveIntensity: 0.5 }, { rim: 0xd6fff0, rimK: 0.6 })); stem.position.y = -7.5; maltase.add(stem); }
  const SPLIT = V(6, 1.9, -1.2);                 /* where maltase holds a maltose: its top */
  const freeAt = i => V(-10 + (i % 8) * 2.3 + ((i * 5) % 3) * 0.4, 3.4 - Math.floor(i / 8) * 1.7 - ((i * 3) % 4) * 0.22, 1.4 + ((i * 7) % 5) * 0.4);
  const halo = glow(3.2, 0xfff0b0, 0.5); mol.add(halo);

  /* ---------------- the villus: a finger of the wall of the small intestine ----------------
     Rebuilt on 11 Nov 2026 (Daniel: "where are the cells? where is the lacteal? where are these capillaries going? …
     as biologically accurate as possible"; his IGCSE slides, TC Absorption 13, 16–18 and 21; 0610 7.5: the structure
     of a villus, capillaries and lacteals, microvilli). What is drawn, and from what:
     - its wall is ONE layer of tall cells (the epithelium), every cell drawn: about 25 µm tall (rat villus cells
       measure 26 µm) and drawn 8 µm wide (no measured human width was read); about 1 cell in 12 is a goblet cell,
       which makes mucus (drawn paler);
     - each cell's surface towards the food is covered with microvilli, each about 100 nm wide and 1 to 3 µm long (here
       1.3 µm), side by side in a six-sided pattern (Crawley, Mooseker & Tyska 2014, Journal of Cell Biology 207:441):
       drawn at true size on the five cells beside the molecules, 130 nm apart (several thousand on a cell). The
       membrane drawn in lipids is the upper side of ONE microvillus of a cell of the villus's right side, so the food
       is above it and the inside of the cell below it, and maltase stands in the narrow space between two microvilli;
     - blood: one arteriole rises unbranched to the tip, where it divides into a net of capillaries that lies directly
       under the cells and runs down the villus; a venule collects them and leaves through the base (the "fountain"
       pattern of casts of the vessels, given for rabbit, rat and human villi in the review of the gut's small vessels
       in Comprehensive Physiology; rat casts, World Journal of Gastroenterology 9:795). Artery, vein and lymph vessel run on in the wall, past the picture's edge;
     - one lacteal in the middle, closed at its top, about two thirds of the villus long (reviews of the gut's lymph
       vessels give 60 to 70 %), which leads to a lymph vessel in the wall.
     The villus is cut in half lengthwise, as a palisade cell is: the half behind the cut is drawn, with whole cells.
     Not drawn (said in the README): the pits between villi (crypts), muscle fibres, nerves, the cells' own organelles
     other than the nucleus, and the thin layer of mucus. */
  const vil = new THREE.Group(); g.add(vil);
  const H = S.villus, RW = S.villusW / 2, CH = S.cellH, CW = S.cellW;
  const MV_Y = MEM_Y + 2.5 - S.microvillusW / 2;      /* the axis of the microvillus whose membrane is drawn in lipids */
  const XS = -S.microvillus / 2;                      /* the surface of the cells of the villus's right side: the microvilli stand on it */
  const AX = XS - RW;                                 /* the villus's own axis */
  const TOP = H * 0.3, LEN = H * 0.86, BASE = TOP - LEN, FL = 60000, FLOOR = BASE - FL;   /* tip; straight part; where it widens into the wall */
  /* the villus's outline: for a distance s along it from the tip, its radius, its height and the way its surface faces */
  const L1 = RW * Math.PI / 2, L2 = LEN - RW, L3 = FL * Math.PI / 2;
  const outline = s => { if (s < L1) { const a = s / RW; return { r: RW * Math.sin(a), y: TOP - RW + RW * Math.cos(a), nr: Math.sin(a), ny: Math.cos(a) }; }
    if (s < L1 + L2) return { r: RW, y: TOP - RW - (s - L1), nr: 1, ny: 0 };
    const a = Math.min(Math.PI / 2, (s - L1 - L2) / FL); return { r: RW + FL * (1 - Math.cos(a)), y: BASE - FL * Math.sin(a), nr: Math.cos(a), ny: Math.sin(a) }; };
  /* one cell of the wall: a tall block, narrower at its foot (the wall curves), its free surface a little domed */
  const cellGeo = (() => { const b = new THREE.BoxGeometry(1, 1, 1, 2, 1, 2), P = b.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      if (y > 0) P.setXYZ(i, x * (x === 0 || z === 0 ? 1 : 0.94), y + 0.03 * (1 - 4 * x * x) * (1 - 4 * z * z), z * (x === 0 || z === 0 ? 1 : 0.94)); else P.setXYZ(i, x * 0.66, y, z); }
    b.computeVertexNormals(); return b; })();
  /* far cells show only their free surface: one small domed tile each */
  const capGeo = (() => { const b = new THREE.PlaneGeometry(1, 1, 2, 2); b.rotateX(-Math.PI / 2); const P = b.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i); P.setY(i, 0.9 * (1 - 4 * x * x) * (1 - 4 * z * z) - 0.45); } b.computeVertexNormals(); return b; })();
  const cellMat = magicStandard({ color: 0xffffff, roughness: 0.6, emissive: 0x3a1420, emissiveIntensity: 0.12 }, { rim: 0xffe6ec, rimK: 0.25 });
  const farMat = magicStandard({ color: 0xffffff, roughness: 0.65, emissive: 0x3a1420, emissiveIntensity: 0.1, side: THREE.DoubleSide }, { rim: 0xffe6ec, rimK: 0.2 });
  const PINK = new THREE.Color(0xdd7f95), GOBLET = new THREE.Color(0xcdb6ea), hash = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
  const cellsAt = [], capsAt = [], brushAt = [], heroRows = new Set(), CREAM = new THREE.Color(0xf1c7b0), FAR = PINK.clone().lerp(CREAM, 0.3);
  /* every cell of one villus (ax, az: its axis; k: its height as a part of this one; half: only the half behind the cut) */
  const tileVillus = (ax, az, k, half, list, seed) => { const rows = [];
    const n1 = Math.round(L1 / CW); for (let i = 0; i < n1; i++) rows.push([(i + 0.5) * L1 / n1, L1 / n1]);
    /* the straight part: a row every 8 µm, so that the five cells beside the molecules are whole rows */
    for (let y = Math.floor((TOP - RW) / CW) * CW; y > BASE; y -= CW) rows.push([L1 + (TOP - RW - y), CW, y]);
    const n3 = Math.round(L3 / CW); for (let i = 0; i < n3; i++) rows.push([L1 + L2 + (i + 0.5) * L3 / n3, L3 / n3]);
    const M = new THREE.Matrix4(), X = V(), Y = V(), Z = V();
    rows.forEach(([s, w, yRow], ri) => { const o = outline(s), span = half ? Math.PI : 2 * Math.PI, n = Math.max(3, Math.round(span * o.r / CW));
      for (let j = 0; j < n; j++) { const th = 2 * Math.PI - (j + 0.5 + (half ? 0 : (ri % 2) * 0.5)) * span / n;
        if (half && yRow != null && j === 0 && Math.abs(yRow) <= 2 * CW + 1) { heroRows.add(yRow); continue; }      /* the five cells drawn in full, below */
        Y.set(o.nr * Math.cos(th), o.ny, o.nr * Math.sin(th)); X.set(-Math.sin(th), 0, Math.cos(th)); Z.crossVectors(X, Y);
        const P = V(ax + o.r * Math.cos(th), FLOOR + (o.y - FLOOR) * k, az + o.r * Math.sin(th)), wx = span * o.r / n;      /* a shorter villus stands on the same wall */
        const gob = hash(ri + seed * 17, j) < 0.085, c = (gob ? GOBLET : half ? PINK : FAR).clone().multiplyScalar(0.9 + 0.16 * hash(j + seed, ri * 3.1));
        /* every absorbing cell's free surface carries its microvilli: from far away, a pale band 1.3 µm thick (a goblet cell's top is bare) */
        if (half && !gob) { const B = new THREE.Matrix4().makeBasis(X.clone().multiplyScalar(wx * 0.985), Y.clone().multiplyScalar(S.microvillus), Z.clone().multiplyScalar(w * 0.985)); B.setPosition(P.clone().addScaledVector(Y, S.microvillus / 2)); brushAt.push([B, CREAM.clone().multiplyScalar(0.94 + 0.1 * hash(j, ri))]); }
        if (half) { P.addScaledVector(Y, -CH / 2); M.makeBasis(X.clone().multiplyScalar(wx), Y.clone().multiplyScalar(CH), Z.clone().multiplyScalar(w)); }
        else { P.addScaledVector(Y, -400); M.makeBasis(X.clone().multiplyScalar(wx * 1.02), Y.clone().multiplyScalar(900), Z.clone().multiplyScalar(w * k * 1.02)); }
        M.setPosition(P); list.push([M.clone(), c]); } }); };
  const inst = (geo, mat, list) => { const m = new THREE.InstancedMesh(geo, mat, list.length); list.forEach(([M, c], i) => { m.setMatrixAt(i, M); m.setColorAt(i, c); }); m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.frustumCulled = false; vil.add(m); return m; };
  tileVillus(AX, 0, 1, true, cellsAt, 1);
  const NEIGH = [[-2.1, -0.95, 0.93], [2.15, -0.9, 0.9], [-1.0, -2.2, 0.96], [1.2, -2.1, 0.88], [-4.1, -1.1, 0.9], [4.2, -1.2, 0.95], [0.1, -3.6, 0.92], [-3.1, -2.9, 0.9], [3.2, -3.0, 0.94]];
  NEIGH.forEach(([x, z, k], i) => tileVillus(AX + x * RW * 1.25, z * RW * 1.25, k, false, capsAt, i + 2));
  /* the wall between the villi is covered by the same layer of cells */
  { const M = new THREE.Matrix4(), feet = [[AX, 0]].concat(NEIGH.map(([x, z]) => [AX + x * RW * 1.25, z * RW * 1.25]));
    for (let ix = -100; ix <= 100; ix++) for (let iz = 0; iz < 75; iz++) { const x = AX + (ix + (iz % 2) * 0.5) * CW, z = -(iz + 0.5) * CW; if (feet.some(([fx, fz]) => Math.hypot(x - fx, z - fz) < RW + FL - 1500)) continue;
        M.makeScale(CW * 1.02, 900, CW * 1.02); M.setPosition(x, FLOOR - 300, z); capsAt.push([M.clone(), (hash(ix, iz) < 0.085 ? GOBLET : FAR).clone().multiplyScalar(0.88 + 0.16 * hash(iz, ix * 1.7))]); } }
  const cells = inst(cellGeo, cellMat, cellsAt), caps = inst(capGeo, farMat, capsAt), brush = inst(new THREE.BoxGeometry(1, 1, 1), cellMat, brushAt);
  /* a neighbour's own body under its tiles (so that no gap between two tiles shows through) */
  const prof = []; for (let i = 0; i <= 60; i++) { const o = outline((L1 + L2 + L3) * i / 60); prof.push(new THREE.Vector2(Math.max(1, o.r - 700 * o.nr), o.y - TOP - 700 * o.ny)); }
  const bodyMat = magicStandard({ color: 0xd98a9c, roughness: 0.7 }, { rim: 0xffe0e8, rimK: 0.3 });
  const bodies = NEIGH.map(([x, z, k]) => { const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), bodyMat); m.position.set(AX + x * RW * 1.25, FLOOR + (TOP - FLOOR) * k, z * RW * 1.25); m.scale.set(1, k, 1); vil.add(m); return m; });
  /* the wall of the small intestine under the villi, cut at the same place: the vessels run on inside it */
  const WALL_H = 330000, wallMat = magicStandard({ color: 0xe79aa8, transparent: true, opacity: 0.42, depthWrite: false, roughness: 0.5 }, { rim: 0xffe0e8, rimK: 0.5 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(2.8e6, WALL_H, 1.0e6), wallMat); wall.position.set(AX, FLOOR - 1200 - WALL_H / 2, -5.0e5 - 600); wall.renderOrder = 1; vil.add(wall);
  /* what fills the villus between its cells and its vessels: loose tissue (the second check of the shapes, 11 Nov 2026:
     in an empty tube the vessels still seemed to float). Its body behind the cut, and its cut face, see-through enough
     to show the vessels that lie in it */
  { const inner = []; for (let i = 0; i <= 44; i++) { const o = outline((L1 + L2) * i / 44); inner.push(new THREE.Vector2(Math.max(1, o.r - (CH + 400) * o.nr), o.y - TOP - (CH + 400) * o.ny)); }
    const tissue = new THREE.MeshBasicMaterial({ color: 0xf6d2c4, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });
    const m = new THREE.Mesh(new THREE.LatheGeometry(inner, 32, Math.PI / 2, Math.PI), tissue); m.position.set(AX, TOP, 0); m.renderOrder = 1; vil.add(m);
    const face = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(inner.map(q => new THREE.Vector2(q.x, q.y)).concat(inner.slice().reverse().map(q => new THREE.Vector2(-q.x, q.y)))), 1), new THREE.MeshBasicMaterial({ color: 0xf6d2c4, transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide })); face.position.set(AX, TOP, -150); face.renderOrder = 5; vil.add(face); }

  /* ---- its vessels ---- */
  const capR = S.capillary / 2, cr = RW - CH - capR - 1500;      /* the capillaries lie directly under the layer of cells */
  const tube = (pts, r, mat, seg = 60, rad = 10) => { const c = new THREE.CatmullRomCurve3(pts), m = new THREE.Mesh(new THREE.TubeGeometry(c, seg, r, rad, false), mat); m.userData.curve = c; vil.add(m); return m; };
  const RED = 0xe2313f, BLUE = 0x3f63c9, LYMPH = 0xf3e6a6;
  const artMat = magicStandard({ color: RED, roughness: 0.4, emissive: 0x5a0a12, emissiveIntensity: 0.7 }, { rim: 0xffb0b8, rimK: 0.8 });
  const venMat = magicStandard({ color: BLUE, roughness: 0.4, emissive: 0x0c1a55, emissiveIntensity: 0.8 }, { rim: 0xb9c9ff, rimK: 0.8 });
  const lymMat = magicStandard({ color: LYMPH, roughness: 0.45, emissive: 0x4a4210, emissiveIntensity: 0.5, transparent: true, opacity: 0.86 }, { rim: 0xfffbe0, rimK: 0.9 });
  /* a capillary's blood gives up oxygen and takes in food on its way down: red at the top, darker and bluer at the foot */
  /* the vessels of the villus are see-through, so that the red blood cells that travel in them show (Daniel, 11 Nov 2026:
     "you now just draw tubes … they contain red blood cells"; as at the game's way in) */
  const capMat = magicStandard({ color: 0xffffff, vertexColors: true, roughness: 0.4, emissive: 0x3a0812, emissiveIntensity: 0.5, transparent: true, opacity: 0.4, depthWrite: false }, { rim: 0xffb0c0, rimK: 0.7 });
  /* the capillary beside the five cells drawn in full is see-through, so that its red blood cells show */
  const capSee = magicStandard({ color: 0xffffff, vertexColors: true, roughness: 0.4, emissive: 0x3a0812, emissiveIntensity: 0.5, transparent: true, opacity: 0.42, depthWrite: false }, { rim: 0xffb0c0, rimK: 1.0 });
  const shade = (m, a, b) => { const P = m.geometry.attributes.position, U = m.geometry.attributes.uv, C = new Float32Array(P.count * 3), ca = new THREE.Color(a), cb = new THREE.Color(b), c = new THREE.Color(); for (let i = 0; i < P.count; i++) { c.copy(ca).lerp(cb, U.getX(i)); C[3 * i] = c.r; C[3 * i + 1] = c.g; C[3 * i + 2] = c.b; } m.geometry.setAttribute('color', new THREE.BufferAttribute(C, 3)); return m; };
  const AY = FLOOR - 110000, AZ = -42000, VY = FLOOR - 165000, VZ = -74000, LY = FLOOR - 215000, LZ = -108000;      /* artery, vein and lymph vessel in the wall */
  const artX = AX - 19000, venX = AX + 19000, inZ = -12000, HUB = V(AX - 6000, TOP - RW + 9000, -9000);
  /* the vessels of the wall run on past the picture's edges */
  const artery = tube([V(AX - 1.4e6, AY, AZ), V(AX - 4e5, AY + 6000, AZ), V(AX + 4e5, AY - 6000, AZ), V(AX + 1.4e6, AY, AZ)], 15000, artMat, 40, 12);
  const vein = tube([V(AX - 1.4e6, VY, VZ), V(AX - 4e5, VY - 5000, VZ), V(AX + 4e5, VY + 5000, VZ), V(AX + 1.4e6, VY, VZ)], 18000, venMat, 40, 12);
  const lymph = tube([V(AX - 1.4e6, LY, LZ), V(AX - 4e5, LY + 4000, LZ), V(AX + 4e5, LY - 4000, LZ), V(AX + 1.4e6, LY, LZ)], 13000, lymMat, 40, 12);
  /* a vessel of the villus begins or ends ON its vessel of the wall: the point of that vessel at a place along it */
  const on = (m, x) => m.userData.curve.getPoints(600).reduce((a, p) => Math.abs(p.x - x) < Math.abs(a.x - x) ? p : a);
  /* the arteriole: from the artery, up the villus without a branch, to its tip */
  const artPts = [on(artery, AX - 150000), V(AX - 90000, AY + 22000, AZ + 6000), V(AX - 42000, FLOOR - 30000, -26000), V(artX, BASE + 10000, inZ), V(artX, BASE + L2 * 0.5, inZ), V(artX, TOP - RW - 26000, inZ), V(artX + 5000, TOP - RW - 4000, inZ + 1500), HUB];
  const artSee = magicStandard({ color: RED, roughness: 0.4, emissive: 0x5a0a12, emissiveIntensity: 0.6, transparent: true, opacity: 0.42, depthWrite: false }, { rim: 0xffb0b8, rimK: 1.0 });
  const venSee = magicStandard({ color: BLUE, roughness: 0.4, emissive: 0x0c1a55, emissiveIntensity: 0.7, transparent: true, opacity: 0.45, depthWrite: false }, { rim: 0xb9c9ff, rimK: 1.0 });
  const arteriole = tube(artPts, S.arteriole / 2, artSee, 110, 10);
  /* the venule: it begins half way up, takes in the capillaries, and leaves to the vein */
  const VTOP = V(venX, TOP - RW - L2 * 0.42, inZ), VFOOT = V(venX, BASE + 16000, inZ);
  const venPts = [VTOP, V(venX, TOP - RW - L2 * 0.7, inZ), VFOOT, V(AX + 44000, FLOOR - 40000, -30000), V(AX + 95000, VY + 30000, VZ + 12000), on(vein, AX + 170000)];
  const venule = tube(venPts, S.venule / 2, venSee, 110, 10);
  /* the capillaries: from the arteriole's end, over the tip and down the side just under the cells, into the venule */
  const TH = [8, 9, 10, 11, 12, 13, 14, 15, 16].map(k => k * Math.PI / 8), edgeZ = th => Math.abs(Math.sin(th)) < 0.01 ? -capR - 600 : 0;
  const side = (th, y) => V(AX + cr * Math.cos(th), y, cr * Math.sin(th) + edgeZ(th));
  const dome = (th, a) => V(AX + cr * Math.sin(a) * Math.cos(th), TOP - RW + cr * Math.cos(a), cr * Math.sin(a) * Math.sin(th) + edgeZ(th) * Math.sin(a));
  const limbs = TH.map((th, i) => { const pts = [HUB.clone(), dome(th, 0.42), dome(th, 0.85), dome(th, 1.25)];
    for (let q = 0; q <= 9; q++) pts.push(side(th, TOP - RW - (L2 - 26000) * q / 9));
    /* its foot turns in to the venule */
    const foot = side(th, BASE + 26000); pts.push(foot.clone().lerp(VFOOT, 0.45).add(V(0, -9000, 0)), VFOOT.clone().add(V(0, 3000 + i * 1400, 0)));
    return shade(tube(pts, capR, capMat, 150, 8), 0xe2313f, 0x7a3f9c); });
  /* links between neighbours in every gap, every 36 µm or so, each from the middle line of one capillary to the middle
     line of the next: a net, not separate tubes */
  const links = [];
  { const n = Math.floor((L2 - 40000) / 36000); for (let lv = 1; lv < n; lv++) TH.slice(0, -1).forEach((a, k) => { const b = TH[k + 1], y = TOP - RW - 14000 - (L2 - 50000) * (lv + (k % 2) * 0.5) / n, dy = ((k * 7 + lv * 3) % 5 - 2) * 3500, u = (TOP - RW - y) / L2;
      const A = side(a, y), B = side(b, y + dy), pts = [A, side(a + (b - a) * 0.33, y + dy * 0.33).setZ(A.z + (B.z - A.z) * 0.33), side(a + (b - a) * 0.67, y + dy * 0.67).setZ(A.z + (B.z - A.z) * 0.67), B];
      const col = new THREE.Color(0xe2313f).lerp(new THREE.Color(0x7a3f9c), u); links.push([shade(tube(pts, capR * 0.85, capMat, 10, 7), col, col), k]); }); }
  /* each link ends rounded inside the capillary it joins (never an open tube end) */
  { const ends = links.flatMap(([m]) => [m.userData.curve.getPoint(0), m.userData.curve.getPoint(1)]), em = new THREE.InstancedMesh(new THREE.SphereGeometry(capR * 0.86, 10, 8), new THREE.MeshBasicMaterial({ color: 0xb8345e, transparent: true, opacity: 0.35, depthWrite: false }), ends.length), M = new THREE.Matrix4();
    ends.forEach((q, i) => { M.makeTranslation(q.x, q.y, q.z); em.setMatrixAt(i, M); }); em.frustumCulled = false; vil.add(em); }
  /* three capillaries join the venule where it begins */
  [3, 4, 5].forEach(i => { const th = TH[i], a = side(th, VTOP.y + 30000), col = new THREE.Color(0xe2313f).lerp(new THREE.Color(0x7a3f9c), 0.45); shade(tube([a, a.clone().lerp(VTOP, 0.55).add(V(0, -6000, 0)), VTOP.clone().add(V(0, 1500, 0))], capR * 0.9, capMat, 16, 7), col, 0x4f5fc0); });
  /* the lacteal: in the middle, closed at its top, about two thirds of the villus long; it leads to the lymph vessel */
  const LTOP = TOP - RW - L2 * 0.22, lacR = S.lacteal / 2;
  const lacPts = [V(AX, LTOP, -lacR - 900), V(AX, TOP - RW - L2 * 0.6, -lacR - 900), V(AX, BASE + 6000, -lacR - 900), V(AX - 9000, FLOOR - 50000, -40000), V(AX - 40000, LY + 40000, LZ + 20000), on(lymph, AX - 120000)];
  const lacteal = tube(lacPts, lacR, lymMat, 90, 12);
  { const end = new THREE.Mesh(new THREE.SphereGeometry(lacR, 14, 10), lymMat); end.position.copy(lacPts[0]); vil.add(end); }

  /* red blood cells: discs 7.5 µm across, thinner in the middle, one after another (a capillary is hardly wider than one
     of them). They TRAVEL: up the arteriole, over the tip, down every capillary, and away in the venule. Their speed is
     slowed for the eye and follows the camera's distance (real blood in a capillary moves about a millimetre a second);
     with Reduce motion they stand still */
  const rbc = (() => { const R7 = 3750, pr = []; for (let i = 0; i <= 10; i++) { const r = R7 * Math.sin(i / 10 * Math.PI / 2), h = 1150 * Math.sqrt(Math.max(0, 1 - (r / R7) ** 2)) * (0.42 + 1.1 * (r / R7) ** 2); pr.push(new THREE.Vector2(r, h)); }
    for (let i = 10; i >= 0; i--) pr.push(new THREE.Vector2(pr[i].x, -pr[i].y));
    const geo = new THREE.LatheGeometry(pr, 14), mat = magicStandard({ color: 0xffffff, roughness: 0.45, emissive: 0x4a0810, emissiveIntensity: 0.5 }, { rim: 0xff8a94, rimK: 0.6 });
    /* each vessel as a table of points along it, and its length */
    const ways = [[arteriole, 0, 18000], ...limbs.map(l => [l, 1, 17000]), [venule, 2, 15000]].map(([m, kind, gap]) => { const pts = m.userData.curve.getSpacedPoints(260); let len = 0; for (let i = 1; i < pts.length; i++) len += pts[i].distanceTo(pts[i - 1]); return { pts, len, kind, n: Math.floor(len / gap) }; });
    const total = ways.reduce((a, w) => a + w.n, 0), mesh = new THREE.InstancedMesh(geo, mat, total), o = new THREE.Object3D(), Yv = V(0, 1, 0), dir = V(), col = new THREE.Color();
    const BRIGHT = new THREE.Color(0xd3202f), DARK = new THREE.Color(0x8c1f3a);
    let flow = 0, last = null;
    const place = () => { let k = 0; ways.forEach((w, wi) => { for (let i = 0; i < w.n; i++, k++) { const u = (((i + 0.37 * (wi % 3)) / w.n + flow / w.len) % 1 + 1) % 1, f = u * (w.pts.length - 1), a = Math.floor(f), b = Math.min(w.pts.length - 1, a + 1);
          o.position.copy(w.pts[a]).lerp(w.pts[b], f - a); dir.copy(w.pts[b]).sub(w.pts[a]); if (dir.lengthSq() < 1) dir.set(0, 1, 0); dir.normalize();
          o.quaternion.setFromUnitVectors(Yv, dir).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.55 * Math.sin(i * 2.1 + wi), 0, 0.55 * Math.cos(i * 1.3 + wi)))); o.updateMatrix(); mesh.setMatrixAt(k, o.matrix);
          /* bright red where the blood arrives; darker as it gives up its oxygen on the way down */
          mesh.setColorAt(k, col.copy(BRIGHT).lerp(DARK, w.kind === 0 ? 0 : w.kind === 2 ? 1 : u)); } }); mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; };
    place(); mesh.frustumCulled = false; mesh.renderOrder = 2; vil.add(mesh);
    const calm = !!(window.REV && window.REV.CALM);
    return { mesh, count: total, flow: () => flow, step(t, d) { const dt = last == null ? 0 : Math.min(0.1, Math.max(0, t - last)); last = t; if (calm || !dt) return; flow += dt * Math.max(7000, Math.min(90000, d * 0.08)); place(); } }; })();

  /* ---- the folds of the wall, and the tube of the small intestine (Daniel, 11 Nov 2026: "show that the villi are in
     circular folds … if the animation takes you inside the intestine, make sure that that is also clear"; his slides TC
     Absorption 12–14). The wall of the small intestine has folds that run part of the way round it (each about half to
     two thirds of the way), up to about 8 mm high and 3 mm thick, and villi cover the folds and the wall between them,
     10 to 40 on each square millimetre (here 20). The tube is drawn 25 mm wide inside (textbooks give about 2.5 cm),
     cut in half lengthwise, upright: the villus drawn in full stands on the upper side of one fold. ---- */
  const far = new THREE.Group(); vil.add(far);
  const RT = 12.5e6, FT = 2.6e6, WT = 2.6e6, YS0 = FLOOR - 1600 - FT / 2, AXT = AX - (RT - 3.5e6);
  const FOLDS = [[0, Math.PI + 0.5, 2 * Math.PI + 0.7, 7e6], [7.6e6, Math.PI - 0.7, 2 * Math.PI - 0.75, 6e6], [-7.4e6, Math.PI - 0.6, 2 * Math.PI - 0.35, 6.5e6], [15e6, Math.PI + 0.95, 2 * Math.PI + 0.7, 5.6e6], [-15.2e6, Math.PI + 0.25, 2 * Math.PI + 0.7, 6.8e6]];
  const Y0T = YS0 - 19.5e6, Y1T = YS0 + 19.5e6;
  /* how far a fold stands out at a place round the tube: it rises gently, over about 8 mm, from each of its two ends */
  const depth = (F, th) => { const k = Math.max(0, Math.min(1, (th - F[1]) / 0.65, (F[2] - th) / 0.65)); return F[3] * k * k * (3 - 2 * k); };
  const foldMat = magicStandard({ color: 0xd88497, roughness: 0.7, side: THREE.DoubleSide }, { rim: 0xffe0e8, rimK: 0.25 });
  const muscleMat = magicStandard({ color: 0xb45566, roughness: 0.7, side: THREE.DoubleSide }, { rim: 0xffc8d0, rimK: 0.2 });
  /* a fold's outline at a place: from the wall along its upper side, round its edge, back along its lower side */
  const outlineF = (F, th) => { const D = depth(F, th), t = Math.min(FT, D * 5), pts = [];      /* a fold keeps its thickness while it slopes down to the wall at its ends */ if (D < 60000) return null; const rc = RT - D + t / 2;
    pts.push([RT, t / 2, 0, 1]); pts.push([rc, t / 2, 0, 1]); for (let i = 1; i < 8; i++) { const a = Math.PI / 2 + i / 8 * Math.PI; pts.push([rc + t / 2 * Math.cos(a), t / 2 * Math.sin(a), Math.cos(a), Math.sin(a)]); } pts.push([rc, -t / 2, 0, -1]); pts.push([RT, -t / 2, 0, -1]); return pts; };
  FOLDS.forEach(F => { const pos = [], idx = [], N = 56, a0 = Math.max(Math.PI, F[1]), a1 = Math.min(2 * Math.PI, F[2]); let rows = 0;
    for (let i = 0; i <= N; i++) { const th = a0 + (a1 - a0) * i / N, o = outlineF(F, th) || outlineF(F, th + (i < N / 2 ? 0.02 : -0.02)) || [[RT, 1, 0, 1], [RT, 1, 0, 1], ...Array(7).fill([RT, 0, 0, 0]), [RT, -1, 0, -1], [RT, -1, 0, -1]];
      o.forEach(q => pos.push(AXT + q[0] * Math.cos(th), YS0 + F[0] + q[1], q[0] * Math.sin(th))); rows++; }
    const M = 11; for (let i = 0; i < rows - 1; i++) for (let j = 0; j < M - 1; j++) { const a = i * M + j, b = a + M; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    /* its cut faces, where the tube is cut */
    [0, rows - 1].forEach(r => { const th = a0 + (a1 - a0) * r / N; if (Math.abs(Math.sin(th)) > 0.02) return; for (let j = 1; j < M - 1; j++) idx.push(r * M, r * M + j, r * M + j + 1); });
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g2.setIndex(idx); g2.computeVertexNormals(); far.add(new THREE.Mesh(g2, foldMat)); });
  /* the layers of the wall, shown where the tube is cut (Daniel, 11 Nov 2026: "when you cut the gut, it doesn't look
     plain like that … you can add layers, but then you have to specify what the layers are … a middle point"). From the
     inside outwards (Ross & Pawlina, Histology; OpenStax, Anatomy and Physiology 2e, 23.1): the lining, which carries
     the villi; a layer of connective tissue with blood vessels, which also fills every fold; muscle in two layers (the
     inner one runs round the tube, so the cut goes ACROSS its fibres: dots; the outer one runs along the tube: lines);
     a thin outer skin. Drawn 0.25, 0.75, 0.95, 0.55 and 0.1 mm thick: a real wall has more in it (the pits between the
     villi, nerves, a thin sheet of muscle under the lining), left out on purpose */
  const LAY = [[0, 0.25e6, 0xd88497], [0.25e6, 1.0e6, 0xf3d6c2], [1.0e6, 1.95e6, 0xbb5a6c], [1.95e6, 2.5e6, 0xcb6d7b], [2.5e6, WT, 0xe9b9a8]], V2 = (x, y) => new THREE.Vector2(x, y);
  LAY.forEach(([a, b, c]) => { const m = new THREE.Mesh(new THREE.LatheGeometry([V2(RT + a, Y0T), V2(RT + a, Y1T), V2(RT + b, Y1T), V2(RT + b, Y0T), V2(RT + a, Y0T)], 64, Math.PI / 2, Math.PI), magicStandard({ color: c, roughness: 0.7, side: THREE.DoubleSide }, { rim: 0xffe0e8, rimK: 0.2 })); m.position.x = AXT; far.add(m);
    [-1, 1].forEach(sg => { const f = new THREE.Mesh(new THREE.PlaneGeometry(b - a, Y1T - Y0T), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); f.position.set(AXT + sg * (RT + (a + b) / 2), (Y0T + Y1T) / 2, 0); far.add(f); }); });
  /* what each layer is made of, drawn on the cut: each list is [x, y, width, height, turn] */
  const section = (() => { let s3 = 9001; const Q = () => { s3 = (s3 * 1664525 + 1013904223) % 4294967296; return s3 / 4294967296; };
    const ART = 42000, dots = [], lines = [], fibres = [], red = [], blue = [], redIn = [], blueIn = [], redLine = [], blueLine = [], cores = [];
    [-1, 1].forEach(sg => { const X = r => AXT + sg * r;
      /* the inner muscle, cut across its fibres */
      for (let i = 0; i < 1500; i++) dots.push([X(RT + 1.06e6 + Q() * 0.83e6), Y0T + Q() * (Y1T - Y0T), 6.5e4 + Q() * 4e4, 4.5e4 + Q() * 3e4, Q() * 3]);
      /* the outer muscle, cut along its fibres */
      for (let k = 0; k < 5; k++) for (let y = Y0T + (k % 2) * 0.6e6; y < Y1T - 1.3e6; y += 1.55e6) lines.push([X(RT + 2.0e6 + (k + 0.5) * 0.1e6), y + 0.7e6, 2.4e4, 1.3e6, 0]);
      /* the connective tissue: its fibres, and blood vessels cut across (an artery's wall is thicker than a vein's) */
      for (let i = 0; i < 520; i++) fibres.push([X(RT + 0.32e6 + Q() * 0.62e6), Y0T + Q() * (Y1T - Y0T), 1.5e4, 2.2e5 + Q() * 2.5e5, (Q() - 0.5) * 1.6]);
      for (let y = Y0T + 1.2e6; y < Y1T - 0.5e6; y += 2.1e6 + Q() * 1.3e6) { const isRed = Q() < 0.5, r = (isRed ? 1.15e5 : 1.6e5) * (0.85 + Q() * 0.4), x = X(RT + 0.47e6 + Q() * 0.36e6); (isRed ? red : blue).push([x, y, r, r * (0.8 + Q() * 0.25), Q()]); (isRed ? redIn : blueIn).push([x, y, r * (isRed ? 0.48 : 0.72), r * (isRed ? 0.42 : 0.6), 0]); }
      /* each fold where it is cut: the same connective tissue fills it, under its lining, with a small artery and a vein */
      FOLDS.forEach(F => { const th = sg > 0 ? 2 * Math.PI : Math.PI; if (sg > 0 ? F[2] < th : F[1] > th) return; const D = depth(F, th), t = Math.min(FT, D * 5), h = t / 2 - 0.27e6, yc = YS0 + F[0], rc = RT - D + t / 2; if (h < 0.2e6) return;
        const sh = new THREE.Shape(); sh.moveTo(X(RT + 0.3e6), yc + h); sh.lineTo(X(rc), yc + h); for (let i = 1; i < 12; i++) { const a = Math.PI / 2 + i / 12 * Math.PI; sh.lineTo(X(rc + h * Math.cos(a)), yc + h * Math.sin(a)); } sh.lineTo(X(rc), yc - h); sh.lineTo(X(RT + 0.3e6), yc - h); cores.push(sh);
        const len = RT + 0.6e6 - (rc + 0.15e6), mid = (RT + 0.6e6 + rc + 0.15e6) / 2;
        redLine.push([X(mid), yc + h * 0.36, len, 1.2e5, 0]); blueLine.push([X(mid), yc - h * 0.36, len, 1.6e5, 0]);
        for (let r = rc + 0.5e6; r < RT - 0.2e6; r += 0.95e6) { redLine.push([X(r), yc + h * 0.68, 5.5e4, h * 0.6, 0.35 * sg]); blueLine.push([X(r + 0.45e6), yc - h * 0.7, 6.5e4, h * 0.55, -0.35 * sg]); }
        for (let i = 0; i < 46; i++) { const r = rc + Q() * (RT - rc), y = yc + (Q() * 2 - 1) * h * 0.9; if (r < rc && Math.hypot(r - rc, y - yc) > h * 0.9) continue; fibres.push([X(r), y, 1.5e4, 1.8e5 + Q() * 2e5, Math.PI / 2 + (Q() - 0.5) * 1.2]); } }); });
    const put = (geo, color, list, dz) => { if (!list.length) return; const m = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }), list.length), o = new THREE.Object3D(); list.forEach((q, i) => { o.position.set(q[0], q[1], ART + dz); o.rotation.set(0, 0, q[4] || 0); o.scale.set(q[2], q[3], 1); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.frustumCulled = false; far.add(m); };
    const disc = new THREE.CircleGeometry(1, 14), rect = new THREE.PlaneGeometry(1, 1);
    cores.forEach(sh => { const m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 1), new THREE.MeshBasicMaterial({ color: 0xf3d6c2, side: THREE.DoubleSide })); m.position.z = ART - 16000; far.add(m); });
    put(disc, 0x8d3447, dots, 0); put(rect, 0x9a4257, lines, 0); put(rect, 0xd7a48c, fibres, 0);
    put(disc, 0xcf2331, red, 9000); put(disc, 0xf6b4b4, redIn, 18000); put(disc, 0x4a66c4, blue, 9000); put(disc, 0xbcc8f0, blueIn, 18000);
    put(rect, 0xcf2331, redLine, 9000); put(rect, 0x4a66c4, blueLine, 9000);
    return { layers: LAY.length, marks: dots.length + lines.length + fibres.length, vessels: red.length + blue.length, foldCores: cores.length }; })();
  /* villi everywhere: on the wall between the folds and all over every fold. Each a small finger, 0.6 mm long */
  const carpet = (() => { const hgt = H * 0.86, cyl = new THREE.CylinderGeometry(RW * 0.9, RW, hgt, 5, 1, true); cyl.translate(0, hgt / 2, 0); const tip = new THREE.ConeGeometry(RW * 0.9, RW * 1.3, 5, 1, true); tip.translate(0, hgt + RW * 0.65, 0);
    const pos = [...cyl.attributes.position.array, ...tip.attributes.position.array], off = cyl.attributes.position.count, idx = [...cyl.index.array, ...Array.from(tip.index.array, i => i + off)];
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const Q = (() => { let s2 = 4242; return () => { s2 = (s2 * 1664525 + 1013904223) % 4294967296; return s2 / 4294967296; }; })();
    const list = [], PER = 20 / 1e12, X = V(), Y = V(), Z = V(), M = new THREE.Matrix4();      /* 20 villi on a square millimetre */
    const add = (r, th, y, nr, ny) => { const px = AXT + r * Math.cos(th), pz = r * Math.sin(th);
      /* none where the villi drawn cell by cell stand */
      if (Math.abs(px - AX) < 1.0e6 && pz > -8.2e5 && Math.abs(y - FLOOR) < 4e5) return;
      Y.set(nr * Math.cos(th), ny, nr * Math.sin(th)).normalize(); X.set(-Math.sin(th), 0, Math.cos(th)); Z.crossVectors(X, Y).normalize(); X.crossVectors(Y, Z);
      const k = 0.82 + 0.3 * Q(); M.makeBasis(X.clone().multiplyScalar(0.95 + 0.2 * Q()), Y.clone().multiplyScalar(k), Z.clone()); M.setPosition(px, y, pz); list.push([M.clone(), PINK.clone().lerp(CREAM, 0.3).multiplyScalar(0.86 + 0.2 * Q())]); };
    /* the wall between the folds */
    { const n = Math.round(Math.PI * RT * (Y1T - Y0T) * PER); for (let i = 0; i < n; i++) { const th = Math.PI + Q() * Math.PI, y = Y0T + Q() * (Y1T - Y0T); if (FOLDS.some(F => Math.abs(y - YS0 - F[0]) < FT / 2 + 1.2e5 && depth(F, th) > 2e5)) continue; add(RT, th, y, -1, 0); } }
    /* every fold: its two sides and its edge */
    FOLDS.forEach(F => { const a0 = Math.max(Math.PI, F[1]), a1 = Math.min(2 * Math.PI, F[2]), n = Math.round((a1 - a0) * RT * (2 * F[3] + 2e6) * PER * 1.15);
      for (let i = 0; i < n; i++) { const th = a0 + Q() * (a1 - a0), D = depth(F, th); if (D < FT * 0.56) continue;      /* villi stand on a fold's sloping ends too */ const flat = D - FT / 2, L = 2 * flat + Math.PI * FT / 2, s3 = Q() * (2 * F[3] + 2e6); if (s3 > L) continue;
        const rc = RT - D + FT / 2, yc = YS0 + F[0];
        if (s3 < flat) { const r = RT - s3; if (Q() > r / RT) continue; add(r, th, yc + FT / 2, 0, 1); }
        else if (s3 < flat + Math.PI * FT / 2) { const a = Math.PI / 2 + (s3 - flat) / (FT / 2); add(rc + FT / 2 * Math.cos(a), th, yc + FT / 2 * Math.sin(a), Math.cos(a), Math.sin(a)); }
        else { const r = RT - (L - s3); if (Q() > r / RT) continue; add(r, th, yc - FT / 2, 0, -1); } } });
    const m = new THREE.InstancedMesh(geo, farMat, list.length); list.forEach(([Mx, c], i) => { m.setMatrixAt(i, Mx); m.setColorAt(i, c); }); m.frustumCulled = false; far.add(m); return list.length; })();

  /* ---- the five cells beside the molecules, drawn in full  /* ---- the five cells beside the molecules, drawn in full: four absorbing cells and one goblet cell ---- */
  const near = new THREE.Group(); vil.add(near);
  const CZ = RW * Math.sin(Math.PI / 26) ;                         /* a cell's width round the villus (7.8 µm) */
  const bodyGeo = new THREE.BoxGeometry(CH, CW * 0.985, CZ * 0.985);
  const heroMat = magicStandard({ color: 0xe58fa2, transparent: true, opacity: 0.5, depthWrite: false, roughness: 0.45, emissive: 0x3a1420, emissiveIntensity: 0.2 }, { rim: 0xffe6ec, rimK: 0.9 });
  const gobMat = magicStandard({ color: 0xe7dcf8, transparent: true, opacity: 0.5, depthWrite: false, roughness: 0.45, emissive: 0x2a2040, emissiveIntensity: 0.3 }, { rim: 0xffffff, rimK: 0.9 });
  const lineMat = new THREE.LineBasicMaterial({ color: 0xfff0f3, transparent: true, opacity: 0.85 });
  const nucMat = magicStandard({ color: PAL.nucleus, roughness: 0.5, emissive: 0x1a1460, emissiveIntensity: 0.6 }, { rim: PAL.envelope, rimK: 0.8 });
  const HERO = [-2, -1, 0, 1, 2], GOB = 2;
  HERO.forEach(k => { const c = V(XS - CH / 2, k * CW, -CZ / 2), m = new THREE.Mesh(bodyGeo, k === GOB ? gobMat : heroMat); m.position.copy(c); m.renderOrder = 3; near.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo), lineMat); e.position.copy(c); e.renderOrder = 4; near.add(e);
    /* the nucleus: oval, in the lower part of the cell (a goblet cell's is pressed to its foot by the mucus) */
    const nu = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), nucMat); nu.position.set(XS - CH * (k === GOB ? 0.86 : 0.68), k * CW, -CZ / 2); nu.scale.set(k === GOB ? 2300 : 4000, 2500, 2500); near.add(nu);
    if (k === GOB) { const mu = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), magicStandard({ color: 0xf4eeff, roughness: 0.35, emissive: 0x554a80, emissiveIntensity: 0.5 }, { rim: 0xffffff, rimK: 1 })); mu.position.set(XS - CH * 0.34, k * CW, -CZ / 2); mu.scale.set(CH * 0.34 - 120, 3400, 3400); near.add(mu); } });
  /* their mitochondria: an absorbing cell has very many (it uses much energy), long ones that lie along the cell, above
     and below the nucleus (Ross & Pawlina, Histology: the enterocyte). Ten in each of the four cells, in the game's own
     colour: a cell drawn see-through is never left empty but for its nucleus */
  const heroMito = []; HERO.filter(k => k !== GOB).forEach(k => { for (let i = 0; i < 10; i++) { const up = i < 6, x = up ? XS - 2600 - (i % 3) * 3300 - (i > 2 ? 900 : 0) : XS - CH + 1500 + (i - 6) * 1100, y = k * CW + ((i * 37 % 7) / 7 - 0.5) * CW * 0.62, z = -CZ / 2 + ((i * 53 % 5) / 5 - 0.5) * CZ * 0.6; heroMito.push([x, y, z, ((i * 29 % 9) / 9 - 0.5) * 0.5]); } });
  { const m = new THREE.InstancedMesh(new THREE.CapsuleGeometry(330, 1500, 4, 8), magicStandard({ color: PAL.mito, roughness: 0.45, emissive: 0x4a1c06, emissiveIntensity: 0.5 }, { rim: PAL.cristae, rimK: 0.8 }), heroMito.length), o = new THREE.Object3D();
    heroMito.forEach((q, i) => { o.position.set(q[0], q[1], q[2]); o.rotation.set(0, 0, Math.PI / 2 + q[3]); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.frustumCulled = false; m.renderOrder = 2; near.add(m); }
  /* the microvilli of the four absorbing cells: every one, at its true size, in a six-sided pattern */
  const mvGeo = (() => { const L = S.microvillus, r = S.microvillusW / 2, g2 = new THREE.LatheGeometry([new THREE.Vector2(r, 0), new THREE.Vector2(r, L - 70), new THREE.Vector2(r * 0.72, L - 18), new THREE.Vector2(0.01, L)], 6); g2.rotateZ(-Math.PI / 2); return g2; })();
  const mvMat = magicStandard({ color: 0xf6c9b4, roughness: 0.5, emissive: 0x4a2418, emissiveIntensity: 0.45 }, { rim: 0xfff1e6, rimK: 0.7 });
  const mvAt = []; { const P = S.mvPitch, dz = P * Math.sqrt(3) / 2, y0 = -2.5 * CW, y1 = 1.5 * CW;
    for (let j = 0; -j * dz > -CZ + 60; j++) for (let i = Math.ceil((y0 - MV_Y) / P); MV_Y + i * P + (j % 2) * P / 2 < y1; i++) { const y = MV_Y + i * P + (j % 2) * P / 2; if (Math.abs(((y + CW / 2) % CW + CW) % CW) < 70) continue;      /* none on the line where two cells join */
        mvAt.push(V(XS, y, -j * dz)); } }
  const mvs = new THREE.InstancedMesh(mvGeo, mvMat, mvAt.length); { const M = new THREE.Matrix4(); mvAt.forEach((p, i) => { M.makeTranslation(p.x, p.y, p.z); mvs.setMatrixAt(i, M); }); } mvs.frustumCulled = false; near.add(mvs);

  /* glucose, far too small to see from here: a glow for each molecule. It crosses the layer of cells at the villus's
     two sides, enters the capillary under them, and the blood carries it down, into the venule and away in the vein */
  const GN = 16, gl = Array.from({ length: GN }, () => { const s = glow(40000, 0xffc23a, 0); vil.add(s); return s; });
  const glPath = Array.from({ length: GN }, (_, i) => { const right = i % 2 === 0, th = right ? 2 * Math.PI : Math.PI, sg = right ? 1 : -1, f = 0.08 + 0.8 * ((i * 53 % 16) / 16), y = TOP - RW - L2 * f, limb = limbs[right ? TH.length - 1 : 0].userData.curve;
    const pts = [V(AX + sg * (RW + 46000 + (i * 37 % 5) * 7000), y + 24000, 9000), V(AX + sg * (RW + 6000), y + 5000, 3000), V(AX + sg * (RW - CH / 2), y, -1500), side(th, y - 4000)];
    /* down its capillary: the points of that capillary below this height */
    for (let q = 1; q <= 14; q++) { const p = limb.getPoint(0.2 + 0.8 * q / 14); if (p.y < y - 12000) pts.push(p); }
    venule.userData.curve.getPoints(8).forEach(p => { if (p.y < pts[pts.length - 1].y - 4000) pts.push(p); });
    pts.push(V(AX + 330000, VY, VZ), V(AX + 700000, VY + 3000, VZ), V(AX + 1.4e6, VY, VZ));
    return new THREE.CatmullRomCurve3(pts, false, 'centripetal'); });
  /* where the molecules were, kept in sight while the camera moves back (the expert review: the place was lost) */
  const mark = new THREE.Mesh(new THREE.TorusGeometry(9000, 1300, 8, 48), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); mark.position.set(0, MV_Y, 0); mark.renderOrder = 9; vil.add(mark);
  const knobs = { cam: 0, dig: 0, gut: 0, dig2: 0, abs: 0, seen: 0 };      /* seen: the molecules have been shown (the ring that marks their place) */
  let amyAt = V();
  function draw(K, t) {
    const d = stage.view.dist, nearK = smooth(6000, 600, d);
    mol.visible = nearK > 0.01; vil.visible = K.gut > 0.5 && d > 150;
    /* the cells drawn in full, and their microvilli, only while the camera is near enough to see them */
    mvs.visible = d < 400000;
    /* the folds and the tube, with their villi, only from far enough to see them; the red blood cells, while they can be seen */
    far.visible = d > 2.0e6; rbc.mesh.visible = d < 2.6e6; if (vil.visible && rbc.mesh.visible) rbc.step(t, d);
    /* from very near, the villi beyond would fill the background: they come into the picture as the camera moves back */
    caps.visible = d > 230000; bodies.forEach(m => { m.visible = d > 230000; });
    mark.material.opacity = 0.95 * smooth(3000, 30000, d) * smooth(0.4, 0.6, K.seen) * (1 - smooth(2.5e6, 5e6, d)); mark.quaternion.copy(stage.cam.quaternion); mark.scale.setScalar(Math.max(0.02, Math.min(1, d / 600000)) * (1 + 0.08 * Math.sin(t * 3)));
    /* amylase moves along the chain; behind it the chain is in pairs (maltose), which move apart */
    const a = K.dig, at = Math.min(pairs - 1, Math.floor(a * pairs)), f = Math.min(1, a * pairs - at), xa = home[ORDER[at] * 2].x + 0.25, xb = home[ORDER[Math.min(pairs - 1, at + 1)] * 2].x + 0.25, x = xa + (xb - xa) * smooth(0.6, 1, f);
    amyAt.set(x, 9.6 - 0.35 * Math.sin(Math.PI * smooth(0.6, 1, f)), 0.2); amylase.position.copy(amyAt); amylase.rotation.z = 0.2 + 0.08 * Math.sin(t * 1.4);
    const down = smooth(0, 1, K.gut);
    ring.forEach((r, i) => {
      const p = pairOf(i), cutK = smooth((rank(p) + 0.2) / pairs, (rank(p) + 1) / pairs, a * 1.04), sp = (i % 2 ? 0.26 : -0.26);
      const P = home[i].clone().lerp(pairAt(p).add(V(sp, 0, 0)), cutK);
      /* in the small intestine: each maltose goes to maltase in turn and is split into two glucose molecules */
      const m2 = smooth(p / pairs * 0.8, p / pairs * 0.8 + 0.2, K.dig2), go = smooth(0, 0.5, m2), part = smooth(0.5, 1, m2);
      if (K.dig2 > 0) { P.lerp(SPLIT.clone().add(V(sp, 0, 0)), go); P.lerp(freeAt(i), part); }
      r.position.copy(P); r.rotation.copy(tilt(i)); r.rotation.y += 0.15 * Math.sin(t * 0.9 + i) * cutK;
    });
    amylase.visible = down < 0.5; amylase.scale.setScalar(1 - smooth(0.2, 0.5, down));
    gutG.visible = down > 0.01;
    mem.userData.mats && mem.userData.mats.forEach(m => { m.transparent = true; m.opacity = down; });
    maltase.scale.setScalar(Math.max(0.001, down));
    halo.visible = K.dig2 > 0.01 && K.dig2 < 0.99; halo.position.copy(SPLIT);
    /* far away: the glows cross the villus's wall, one cell thick, and the blood carries them down and away */
    gl.forEach((s, i) => { const k = smooth(i / GN * 0.45, i / GN * 0.45 + 0.55, K.abs), u = k * (0.5 + 0.42 * (i / GN));
      s.position.copy(glPath[i].getPoint(Math.min(0.999, u))); s.material.opacity = (1 - nearK) * smooth(60000, 300000, d) * (0.75 + 0.25 * Math.sin(t * 2 + i)); });
  }
  const D = (x, y, z) => V(x, y, z).normalize(), UP = V(0, 1, 0);
  const views = [
    /* 0 the mouth: starch and amylase */      { zoom: 4, at: V(0.4, 6.2, 0), dist: 62, dir: D(0.03, 0.05, 1), up: UP, fit: { pts: [[10.5, 6.2, 3]], min: 44 } },
    /* 1 the small intestine: maltase */       { zoom: 4, at: V(0.5, -4.4, 0), dist: 82, dir: D(0.03, 0.06, 1), up: UP, fit: { pts: [[13, 13.4, 4]], min: 60 } },
    /* 2 five cells of the villus's wall */    { zoom: 10, at: V(XS - 12500, -1200, 0), dist: 110000, dir: D(0.1, 0.07, 1), up: UP, fit: { pts: [[21500, 19500, 4000]], min: 80000 } },
    /* 3 the whole villus, cut in half */      { zoom: 10, at: V(AX, TOP - H * 0.52, 0), dist: 1250000, dir: D(0.06, 0.1, 1), up: UP, fit: { pts: [[S.villusW * 1.75, H * 0.66, 60000]], min: 900000 } },
    /* 4 the small intestine, cut in half */   { zoom: 12, at: V(AXT + 1.5e6, YS0 + 1.0e6, 0), dist: 6.2e7, dir: D(0.16, 0.24, 1), up: UP, fit: { pts: [[RT + WT + 1.0e6, 13.5e6, 2e6]], min: 4.6e7 } }
  ];
  const W = p => p.clone();
  const labels = {
    starch: { html: 'part of a starch molecule', htmlN: 'starch', side: 'l', pts: () => ring.slice(1, 9).map(r => W(r.position)) },
    /* (its name's line ends on its surface: its point furthest along its length, and one nearer the viewer; before 12 Nov
       2026 two fixed points beside its middle, which the measured shape, longer and turned, no longer has there) */
    amylase: { html: 'amylase: about <b>8 nm</b> long', htmlN: 'amylase: <b>8 nm</b>', side: 'r', pts: () => amyTips.map(p => p.clone().applyEuler(amylase.rotation).add(amyAt)) },
    maltose: { html: 'maltose', side: 'r', pts: () => ring.filter((_, i) => i % 2 === 1).map(r => W(r.position).add(V(0.75, 0, 0))).sort((a, b) => b.x - a.x).slice(0, 3) },
    maltose2: { html: 'maltose', side: 'l', pts: () => ring.filter((_, i) => i % 2 === 0).map(r => W(r.position)).sort((a, b) => a.x - b.x).slice(0, 2) },
    maltase: { html: 'maltase: an enzyme attached to the membrane', htmlN: 'maltase', side: 'r', pts: () => [maltase.position.clone().add(V(4.2, -0.9, 2)), maltase.position.clone().add(V(4.0, -1.5, 2))] },
    mem: { html: 'cell membrane', side: 'l', pts: () => [-14, -17, -11].map(x => V(x, MEM_Y + 2.1, 0.3)) },
    lumen: { html: 'inside the small intestine', side: 'r', pts: () => [V(14, 4.6, 0), V(16, 3.2, 0), V(12, 5.8, 0)] },
    incell: { html: 'inside a cell of its wall', htmlN: 'inside a cell', side: 'r', pts: () => [V(15, MEM_Y - 4.4, 0), V(17, MEM_Y - 5, 0), V(13, MEM_Y - 4, 0)] },
    glucose: { html: 'glucose', side: 'l', pts: () => ring.map(r => W(r.position)).sort((a, b) => a.x - b.x).slice(0, 3) },
    /* inside the small intestine */
    muscleL: { html: 'muscle, in two layers', htmlN: 'muscle', side: 'r', pts: () => [10.5e6, 12e6, 9e6].map(dy => V(AXT + RT + 1.75e6, YS0 + dy, 0)) },
    tissueL: { html: 'connective tissue, with blood vessels', htmlN: 'connective tissue', side: 'r', pts: () => [3.6e6, 4.6e6, 2.8e6].map(dy => V(AXT + RT + 0.62e6, YS0 + dy, 0)) },
    fold: { html: 'a fold of the wall', htmlN: 'a fold', side: 'r', pts: () => [V(AXT + RT - 2.2e6, YS0 + FOLDS[2][0], 0), V(AXT + RT - 3.2e6, YS0 + FOLDS[2][0], 0)] },
    villi: { html: 'villi cover every fold', htmlN: 'villi', side: 'l', pts: () => [-0.5, -0.9, -0.2].map(k => V(AXT + k * RT * 0.55, YS0 + FOLDS[1][0] + FT / 2 + 5e5, -RT * 0.78)) },
    lumenT: { html: 'inside the small intestine: food passes here', htmlN: 'food passes here', side: 'l', pts: () => [V(AXT - 2.5e6, YS0 + 3.6e6, 0), V(AXT - 1.5e6, YS0 + 4.4e6, 0)] },
    onev: { html: 'one villus: the next picture', htmlN: 'one villus', side: 'r', pts: () => [V(AX, FLOOR + H * 0.5, 0)] },
    /* five cells of the wall */
    cell: { html: 'one cell of the wall of the villus', htmlN: 'one cell', side: 'l', pts: () => [V(XS - 9500, -1300, 0), V(XS - 11500, 1600, 0), V(XS - 8000, 2200, 0)] },
    mv: { html: 'microvilli: tiny fingers of the cell membrane', htmlN: 'microvilli', side: 'r', pts: () => [-7800, -9300, -6400].map(y => V(XS + S.microvillus * 0.8, y, 0)) },
    nuc: { html: 'nucleus', side: 'l', pts: () => [V(XS - CH * 0.68 - 2500, -CW, 0), V(XS - CH * 0.68 - 2500, -CW + 900, 0)] },
    mito2: { html: 'mitochondria', side: 'l', pts: () => heroMito.filter(q => Math.abs(q[1] + 2 * CW) < CW / 2).slice(0, 3).map(q => V(q[0], q[1], 0)) },
    goblet: { html: 'a goblet cell: it makes mucus', htmlN: 'goblet cell', side: 'l', pts: () => [V(XS - CH * 0.34 - 3000, GOB * CW + 900, 0), V(XS - CH * 0.34 - 3000, GOB * CW - 600, 0)] },
    cap2: { html: 'a blood capillary, with red blood cells', htmlN: 'capillary', side: 'l', pts: () => [-13500, -15500, -11500].map(y => V(AX + cr - capR * 0.7, y, 0)) },
    lumen2: { html: 'inside the small intestine', side: 'r', pts: () => [V(XS + 5200, 9000, 0), V(XS + 5800, 11000, 0), V(XS + 4600, 7000, 0)] },
    /* the whole villus */
    villus: { html: 'a villus', side: 'l', pts: () => [0.2, 0.26, 0.14].map(k => V(AX - RW, TOP - H * k, 0)) },
    wallv: { html: 'the wall of the villus: one layer of cells', htmlN: 'one layer of cells', side: 'r', pts: () => [0.5, 0.56, 0.44].map(k => V(AX + RW - CH / 2, TOP - H * k, 0)) },
    cap: { html: 'blood capillaries', side: 'l', pts: () => [0.4, 0.46, 0.34].map(k => side(TH[0], TOP - H * k).add(V(-capR, 0, 0))) },
    lact: { html: 'lacteal: digested fats enter here <i class="plv-x">IGCSE</i>', htmlN: 'lacteal <i class="plv-x">IGCSE</i>', side: 'l', pts: () => [0.62, 0.68, 0.56].map(k => V(AX - lacR * 0.5, TOP - H * k, -900)) },
    art: { html: 'blood arrives', side: 'l', pts: () => [0.4, 0.5, 0.6].map(u => arteriole.userData.curve.getPoint(u * 0.3).add(V(-S.arteriole / 2, 0, 0))) },
    ven: { html: 'blood leaves, with the glucose', htmlN: 'blood leaves', side: 'r', pts: () => [0.72, 0.8, 0.64].map(u => venule.userData.curve.getPoint(u).add(V(S.venule / 2, 0, 0))) },
    food: { html: 'inside the small intestine: digested food', htmlN: 'digested food', side: 'r', pts: () => [V(AX + RW * 1.5, TOP + 40000, 0), V(AX + RW * 1.8, TOP + 60000, 0), V(AX + RW * 1.3, TOP + 80000, 0)] },
    here: { html: 'the molecules were here', side: 'r', pts: () => [V(0, MV_Y, 0)] },
    glows: { html: 'glucose: each glow is one molecule', htmlN: 'glucose', side: 'l', pts: () => gl.filter((_, i) => i % 2).slice(0, 5).map(s => W(s.position)) }
  };
  /* the molecules no name may cover */
  const avoid = () => mol.visible ? ring.map((r, i) => ({ p: r.position.clone(), id: 'g' + i })) : [];
  const hots = { amy: () => amyAt.clone().add(V(0, 3.6, 0)), malt: () => maltase.position.clone().add(V(-9.5, 2.5, 0)), tip: () => V(AX, TOP + 70000, 0) };
  const steps = [
    { id: 'mouth', phases: [{ to: { cam: 0, dig: 0, gut: 0 }, ms: 0 }], labs: { starch: 1, amylase: 1 },
      press: { all: [{ id: 'digest', label: 'Digest', at: 'amy', side: 't', to: { dig: 1 }, ms: 5600, labs: { maltose: 1, amylase: 1 } }] }, end: { dig: 1 }, endLabs: { maltose: 1, amylase: 1 } },
    /* the order of understanding (Daniel, 11 Nov 2026: "audit if this is the best way to show this"): first WHERE the food
       is (inside the small intestine, with its folds), then nearer and nearer (one villus, its cells, the membrane of
       one microvillus with maltase), and then the glucose's way out, in the blood. Before, the molecules came first and
       the camera moved back from them, so a pupil met maltase without knowing where it was */
    { id: 'folds', phases: [{ cut: true, to: { cam: 4, gut: 1 } }], labs: { fold: 1, villi: 1, muscleL: 1, tissueL: 1, lumenT: 2, onev: 2 } },
    { id: 'villus', phases: [{ to: { cam: 3 }, ms: 5200 }], labs: { villus: 1, wallv: 1, cap: 1, lact: 1, art: 2, ven: 2, food: 2 } },
    { id: 'cells', phases: [{ to: { cam: 2 }, ms: 5000 }], labs: { cell: 1, mv: 1, cap2: 1, nuc: 2, goblet: 2, mito2: 2, lumen2: 2 } },
    { id: 'gut', phases: [{ to: { cam: 1, seen: 1 }, ms: 5200 }], labs: { maltase: 1, mem: 1, maltose2: 1, lumen: 1, incell: 1 },
      press: { all: [{ id: 'digest', label: 'Digest', at: 'malt', side: 'l', to: { dig2: 1 }, ms: 6400, labs: { glucose: 1, maltase: 1, lumen: 2, incell: 2 } }] }, end: { dig2: 1 }, endLabs: { glucose: 1, maltase: 1, lumen: 2, incell: 2 } },
    { id: 'blood', phases: [{ to: { cam: 3 }, ms: 5600 }], labs: { cap: 1, glows: 1, ven: 2, here: 2 },
      press: { all: [{ id: 'absorb', label: 'Absorb', at: 'tip', side: 't', to: { abs: 1 }, ms: 7600, labs: { cap: 1, glows: 1, ven: 1, here: 2 } }] }, end: { abs: 1 }, endLabs: { cap: 1, glows: 1, ven: 1, here: 2 } }
  ];
  function measure() {
    const tok = tokSize;
    /* every vessel is joined to the next: the largest gap between a vessel's end and the vessel it should meet (nm) */
    const C = m => m.userData.curve, nearTo = (p, c) => Math.min(...c.getPoints(400).map(q => q.distanceTo(p)));
    const gaps = limbs.flatMap(l => [C(l).getPoint(0).distanceTo(HUB), nearTo(C(l).getPoint(1), C(venule))]).concat([C(arteriole).getPoint(1).distanceTo(HUB), nearTo(C(venule).getPoint(1), C(vein)), nearTo(C(arteriole).getPoint(0), C(artery)), nearTo(C(lacteal).getPoint(1), C(lymph))]);
    return { glucose: tok(ring[0]), amylase: tok(amylase), link: home[1].x - home[0].x, villus: H, villusW: 2 * RW, capillary: 2 * capR, capillaryUnderCells: RW - CH - cr - capR, limbs: limbs.length, links: links.length, linkGap: Math.max(...links.map(([m, k]) => Math.max(nearTo(C(m).getPoint(0), C(limbs[k])), nearTo(C(m).getPoint(1), C(limbs[k + 1])))) ), redBloodCells: rbc.count, brushCells: brushAt.length, maltaseAbove: maltase.position.y - S.maltase / 2 - (MEM_Y + 2.5),
      villusBox: [2 * (RW + FL), H], cells: cellsAt.length + HERO.length, farCells: capsAt.length, cellH: CH, cellW: CW, microvilli: mvAt.length, microvillus: S.microvillus, microvillusW: S.microvillusW, mvOnSite: mvAt.some(p => Math.abs(p.y - MV_Y) < 1 && Math.abs(p.z) < 1),
      siteOnTop: MEM_Y + 2.5 - (MV_Y + S.microvillusW / 2), lactealShare: (LTOP - BASE) / (TOP - BASE), lactealClosed: true, vesselGap: Math.max(...gaps), wallVesselsRunOn: 1.4e6,
      tube: 2 * RT, folds: FOLDS.length, foldHigh: Math.max(...FOLDS.map(F => F[3])), foldThick: FT, carpetVilli: carpet, villusOnFold: Math.abs((FLOOR - 1600) - (YS0 + FT / 2)) < 1 && AX - AXT < RT && AX - AXT > RT - FOLDS[0][3], heroMitochondria: heroMito.length, sectionLayers: section.layers, sectionMarks: section.marks, sectionVessels: section.vessels, foldCores: section.foldCores, redBloodCellsMove: !(window.REV && window.REV.CALM), flow: rbc.flow() };
  }
  return { group: g, knobs, views, steps, labels, hots, draw, measure, avoid, turn: true, sizes: { villus: [H, S.villusW], amylase: S.amylase, maltase: S.maltase }, dispose() { disposeGroup(g); } };
}
