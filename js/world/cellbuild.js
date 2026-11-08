/* ============================================================
   cellbuild.js — the cell world's structures (4 Nov 2026), in micrometres (µm), y up.
   ONE salivary gland cell (a serous acinar cell), drawn where things really are in it (histology of the parotid and
   pancreatic acinar cells; Bolender 1974, J Cell Biol 61:269, for the share of each membrane):
   - the base sits on the blood side: below its membrane, the tissue fluid and a capillary with red blood cells;
   - the nucleus is round and low in the cell (basal), with a nucleolus; rough ER fills the base, in curved layers round
     the nucleus (seen as the basophilic base of the cell on a stained slide);
   - the Golgi apparatus sits above the nucleus (supranuclear); the secretory vesicles (zymogen granules) crowd the top;
   - the top of the cell (apical) has short microvilli and faces the lumen, which leads into the duct;
   - microtubules run from the top of the cell downwards (in such cells most of them point that way);
   - mitochondria lie among the rest; a little smooth ER (this cell has only a little); a few lysosomes; the
     centrosome near the top.
   What is drawn bigger than life, so that it can be seen (the page says so in each place's "See the real thing"):
   ribosomes (×4), nuclear pores (about twice as wide, and far fewer; the first entry into the nucleus dives through one at
   its true size, pore.js), microtubules (×3), the spaces between ER layers (×2–3). The smooth ER's tubes are at their true
   width, 0.05 µm (8 Nov 2026).
   Everything else is at its real size for a cell about 16 µm tall. The neighbouring cells of the acinus stand round it,
   their tops meeting at the lumen. Every random choice uses one seed, so the world is the same at every load.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { mergeVertices, mergeGeometries } from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js?v=0.185.1';
import { PAL, magicStandard, membraneMat, sparkles, railMat, CUT } from './magic.js?v=202611082221';
import { heroMito, heroPoint, along, realMitos } from './mitoparts.js?v=202611082221';
import { MITO_SHAPES } from './mito-shapes.js?v=202611082221';

/* ---------- small tools ---------- */
export function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(20261104);
const rr = (a, b) => a + (b - a) * R();
function hash3(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
/* smooth value noise, about −1 … 1 */
export function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const s = t => t * t * (3 - 2 * t), u = s(xf), v = s(yf), w = s(zf);
  const L = (a, b, t) => a + (b - a) * t;
  const c = (i, j, k) => hash3(xi + i, yi + j, zi + k);
  return 2 * L(L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v), L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v), w) - 1;
}
function fbm(x, y, z) { return noise3(x, y, z) * 0.6 + noise3(x * 2.1, y * 2.1, z * 2.1) * 0.3 + noise3(x * 4.3, y * 4.3, z * 4.3) * 0.1; }
/* keep only the triangles a test accepts (a non-indexed copy) */
function keepTris(geo, keep) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  const P = [], Nn = [], U = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), m = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
    m.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    if (!keep(m, a, b, c)) continue;
    for (let k = 0; k < 3; k++) {
      P.push(p.getX(i + k), p.getY(i + k), p.getZ(i + k));
      if (n) Nn.push(n.getX(i + k), n.getY(i + k), n.getZ(i + k));
      if (uv) U.push(uv.getX(i + k), uv.getY(i + k));
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  if (n) out.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3));
  if (uv) out.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  return out;
}

/* ---------- the cell's shape: a rounded, tapering column (a wedge of the acinus) ---------- */
export const CELL = { H: 16.35, ax: 7.4, az: 6.2, n: 3.0, lumen: new THREE.Vector3(0, 17.4, 0) };
const PROFILE = new THREE.SplineCurve([[0, 0], [0.55, 0], [0.88, 0.16], [1.0, 0.9], [0.965, 3], [0.87, 7], [0.67, 11], [0.43, 14.2], [0.29, 15.6], [0.13, 16.25], [0, CELL.H]].map(p => new THREE.Vector2(p[0], p[1])));
const PROF = PROFILE.getSpacedPoints(400);
/* the half-width factor at a height (the side of the cell) */
const RY = (() => { const t = []; for (let i = 0; i <= 330; i++) { const y = i * 0.05; let best = 0; for (const p of PROF) if (Math.abs(p.y - y) < 0.06) best = Math.max(best, p.x); t.push(best); } return t; })();
export function rAt(y) { const i = Math.max(0, Math.min(RY.length - 1, Math.round(y / 0.05))); return RY[i]; }
const se = (c, n) => Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
/* is a point inside the cell, with a margin (µm) from its membrane? */
export function inside(p, margin = 0.3) {
  if (p.y < margin || p.y > CELL.H - margin) return false;
  const f = rAt(p.y); if (f <= 0) return false;
  const hx = CELL.ax * f - margin, hz = CELL.az * f - margin;
  if (hx <= 0 || hz <= 0) return false;
  return Math.pow(Math.abs(p.x) / hx, CELL.n) + Math.pow(Math.abs(p.z) / hz, CELL.n) < 1;
}
function cellShellGeometry({ segU = 128, segV = 120, bulge = 0.16, scale = 1 } = {}) {
  const pos = [], uv = [], idx = [];
  const pts = PROFILE.getSpacedPoints(segV);
  for (let j = 0; j <= segV; j++) {
    const pr = pts[j];
    for (let i = 0; i <= segU; i++) {
      const th = (i / segU) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
      let x = pr.x * CELL.ax * se(c, CELL.n), z = pr.x * CELL.az * se(s, CELL.n), y = pr.y;
      const b = 1 + bulge * 0.12 * fbm(x * 0.35, y * 0.35, z * 0.35) * Math.min(1, pr.x * 3);
      x *= b; z *= b;
      pos.push(x * scale, y * scale, z * scale); uv.push(i / segU, j / segV);
    }
  }
  for (let j = 0; j < segV; j++) for (let i = 0; i < segU; i++) {
    const a = j * (segU + 1) + i, b = a + segU + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/* ---------- a patch of an ellipsoid (an ER layer), with ragged edges and holes ---------- */
function ellipsoidPatch({ center, radius, scale, elev, keepAz, segU = 150, segV = 60, holes = -2, edgeNoise = 0.18, seed = 0 }) {
  const pos = [], idx = [], ok = [];
  for (let j = 0; j <= segV; j++) {
    const e = elev[0] + (elev[1] - elev[0]) * (j / segV);
    for (let i = 0; i <= segU; i++) {
      const az = (i / segU) * Math.PI * 2;
      const wob = 1 + 0.03 * noise3(i * 0.08 + seed, j * 0.11, seed * 0.7);
      const x = center.x + radius * scale.x * Math.cos(e) * Math.cos(az) * wob;
      const y = center.y + radius * scale.y * Math.sin(e) * wob;
      const z = center.z + radius * scale.z * Math.cos(e) * Math.sin(az) * wob;
      pos.push(x, y, z);
      /* how far inside the allowed region (0 at its edge), roughened by noise; plus holes (fenestrations) */
      const inAz = keepAz(az, e);
      const n = fbm(x * 0.9 + seed, y * 0.9, z * 0.9);
      const edge = Math.min((e - elev[0]) / 0.25, (elev[1] - e) / 0.25, inAz);
      const hole = noise3(x * 2.3 + seed, y * 2.3, z * 2.3) < holes;      /* a few holes in a layer (fenestrations) */
      ok.push(edge + n * edgeNoise > 0.12 && !hole);
    }
  }
  for (let j = 0; j < segV; j++) for (let i = 0; i < segU; i++) {
    const a = j * (segU + 1) + i, b = a + segU + 1;
    if (ok[a] && ok[b] && ok[a + 1]) idx.push(a, b, a + 1);
    if (ok[b] && ok[b + 1] && ok[a + 1]) idx.push(b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/* points spread over a mesh's surface (area-weighted), each with its normal */
function surfacePoints(geo, count, rand = R) {
  const g = geo.index ? geo.toNonIndexed() : geo, p = g.attributes.position;
  const areas = [], A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), t1 = new THREE.Vector3(), t2 = new THREE.Vector3();
  let total = 0;
  for (let i = 0; i < p.count; i += 3) {
    A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2);
    const a = t1.subVectors(B, A).cross(t2.subVectors(C, A)).length() / 2; total += a; areas.push(total);
  }
  const out = [];
  for (let k = 0; k < count; k++) {
    const r = rand() * total; let lo = 0, hi = areas.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (areas[mid] < r) lo = mid + 1; else hi = mid; }
    const i = lo * 3; A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2);
    let u = rand(), v = rand(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const pt = new THREE.Vector3().copy(A).addScaledVector(t1.subVectors(B, A), u).addScaledVector(t2.subVectors(C, A), v);
    const nrm = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3().subVectors(C, A)).normalize();
    out.push({ p: pt, n: nrm });
  }
  return out;
}

function instanced(geo, mat, list, name) {
  const m = new THREE.InstancedMesh(geo, mat, list.length);
  const o = new THREE.Object3D();
  list.forEach((it, i) => {
    o.position.copy(it.p); o.quaternion.copy(it.q || new THREE.Quaternion()); o.scale.setScalar(it.s || 1);
    if (it.sv) o.scale.copy(it.sv);
    o.updateMatrix(); m.setMatrixAt(i, o.matrix);
  });
  m.instanceMatrix.needsUpdate = true; m.name = name || ''; m.computeBoundingSphere();
  return m;
}
const qAlong = (dir) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
/* the nucleus's materials for the dive (8 Nov 2026; play.js dive): on top of magicStandard's own code, each kind its own
   program, all compiled with the world. REV makes what is inside the nucleus black until the dive's light reaches it, so
   that looking into the pore shows only the pore, never what is beyond it (Daniel, 8 Nov 2026: "when you enter and you see
   the hole, you can only see what's in the hole"; 'in':
   the chromosomes and the nucleolus; 'env': the envelopes, only where they are seen from inside: where the line from the
   camera goes out of the nucleus (three.js draws a see-through two-sided shape in two passes and swaps which side is
   "front" for the second, so gl_FrontFacing cannot tell); 'pore': the inner half of each pore). HOLE (the envelopes)
   opens the dive's hole; PK (the pores) draws every pore smaller about itself */
function revealOn(m, REV, kind, HOLE = null, PK = null) {
  const before = m.onBeforeCompile, key = m.customProgramCacheKey;
  const on = kind === 'env' ? 'step(0.0, dot((vRW - uNucC) / vec3(1.0, uNucSY * uNucSY, 1.0), vRW - cameraPosition))' : kind === 'pore' ? 'step(length((vRW - uNucC) / vec3(1.0, uNucSY, 1.0)), uNucR - 0.003)' : '1.0';
  m.onBeforeCompile = (sh, r) => {
    before(sh, r);
    Object.assign(sh.uniforms, REV, HOLE || {}, PK || {});
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRW;' + (HOLE ? ' varying vec3 vLP;' : '') + (PK ? ' uniform float uPoreK;' : ''))
      .replace('#include <begin_vertex>', '#include <begin_vertex>' + (PK ? '\ntransformed *= uPoreK;' : '') + (HOLE ? '\nvLP = transformed;' : ''))
      .replace('#include <project_vertex>', `#include <project_vertex>
        {
          vec4 rw = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            rw = instanceMatrix * rw;
          #endif
          vRW = (modelMatrix * rw).xyz;
        }`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uRevK; uniform vec3 uRevC; uniform float uRevR; uniform vec3 uNucC; uniform float uNucR; uniform float uNucSY; varying vec3 vRW;' +
        (HOLE ? ' uniform vec3 uHoleP; uniform vec3 uHoleN; uniform float uHoleR; varying vec3 vLP;' : ''))
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>' + (HOLE ? `
        if (uHoleR > 0.0) { float dn = dot(vLP, uHoleN); if (dn > 0.0 && distance(vLP * (dot(uHoleP, uHoleN) / dn), uHoleP) < uHoleR) discard; }` : ''))
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
        if (uRevK > 0.0) {
          float dd = distance(vRW, uRevC), on = ${on};
          float lit = 1.0 - smoothstep(uRevR - 0.6, uRevR, dd), band = exp(-pow((dd - uRevR) / 0.08, 2.0)) * step(0.02, uRevR);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * lit + vec3(0.85, 0.8, 1.0) * band * 0.2, uRevK * on);
        }`);
  };
  m.customProgramCacheKey = () => key() + '|' + kind;
  return m;
}
/* the mitochondrion you visit (mitoparts.js heroMito): where it is, how it is turned. It lies across the view, its cut
   face towards it and the edge the camera zooms into on top, so the zoom is a straight move in (the expert review, 5 Nov
   2026: the camera had turned by 70–90° on the way): its own y along it, its own −x (the side of the zoom) up, z out */
export const HERO_AT = new THREE.Vector3(3.95, 7.35, 1.35);
const HERO_L = new THREE.Vector3(1, -0.12, 0.08).normalize(), HERO_U = new THREE.Vector3(0, 1, 0).addScaledVector(HERO_L, -HERO_L.y).normalize();
export const HERO_Q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(HERO_U.clone().negate(), HERO_L, new THREE.Vector3().crossVectors(HERO_L, HERO_U)));
const HERO_FACE = new THREE.Vector3(0, 0, 1).applyQuaternion(HERO_Q);

/* each place's camera view (pos) and what it looks at (at): defined first, so that nothing big is placed in front of
   them (the mitochondria are placed away from every line of sight) */
export const VIEWS = {
  wayin:    { pos: [-1.4, 1.5, 15.6], at: [-1.4, -0.1, -0.2], frameH: 27 },   /* 27° to each side: the whole base, x -6.3 to 6.3 (world.js setFrame) */   /* from the front: the membrane across the middle, inside above, the blood below */
  nucleus:  { pos: [1.2, 6.8, 9.6], at: [0, 5.2, -0.2] },
  nucleolus:{ pos: [1.6, 7.3, 4.6], at: [0.55, 5.5, 0.5] },
  /* the whole of the one you visit, cut open, in the free part of the picture at any size (it is 2.7 µm long) */
  mito:     { pos: HERO_AT.clone().addScaledVector(HERO_FACE, 4.6).add(new THREE.Vector3(0.25, 0.2, 0)).toArray(), at: HERO_AT.clone().add(new THREE.Vector3(0.05, 0.02, 0)).toArray() },
  ribosome: { pos: [-2.9, 8.6, 9.4], at: [-2.4, 7.7, 2.6] },
  rer:      { pos: [-7.6, 5.6, 7.2], at: [-3.6, 3.4, 0.6] },
  ser:      { pos: [-8.6, 9.4, 5.6], at: [-4.6, 7.8, 0.4] },
  golgi:    { pos: [2.6, 12.2, 6.8], at: [0.4, 10.0, -0.3] },
  tracks:   { pos: [4.6, 12.8, 7.0], at: [1.4, 11.2, -0.2] },
  exit:     { pos: [1.8, 18.6, 6.4], at: [0, 15.2, -0.3] }
};
const segDist = (p, a, b) => { const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq())); return p.distanceTo(a.clone().addScaledVector(ab, t)); };
const SIGHTS = Object.values(VIEWS).map(v => [new THREE.Vector3(...v.pos), new THREE.Vector3(...v.at)]);
/* the lines of sight as they were before 5 Nov 2026 (the old view of the mitochondria): the old rods' placement still
   draws its random numbers with them, so that nothing placed after it moves */
const SIGHTS0 = Object.entries(VIEWS).map(([k, v]) => k === 'mito' ? [new THREE.Vector3(4.6, 8.0, 5.0), new THREE.Vector3(3.95, 7.35, 1.35)] : [new THREE.Vector3(...v.pos), new THREE.Vector3(...v.at)]);

/* ============================================================ the world ============================================================ */
export function buildCell(scene) {
  const W = { groups: {}, places: {}, anim: [], hits: [] };
  const add = (name, obj) => { obj.name = name; W.groups[name] = obj; scene.add(obj); return obj; };

  /* ---------- the cell membrane (cut open at the front) and its neighbours ---------- */
  const shellGeo = cellShellGeometry();
  const membrane = add('membrane', new THREE.Group());
  const mem = new THREE.Mesh(shellGeo, membraneMat());
  mem.renderOrder = 2; membrane.add(mem);
  /* the inside of the cell glows faintly (the cytosol), a back-wall light so that the organelles stand out */
  const cytoGlow = new THREE.Mesh(cellShellGeometry({ segU: 96, segV: 80, scale: 0.985 }), new THREE.MeshBasicMaterial({ color: 0x123e58, transparent: true, opacity: 0.12, side: THREE.BackSide, depthWrite: false }));
  cytoGlow.renderOrder = 1; membrane.add(cytoGlow);
  W.membraneMesh = mem;

  /* the acinus: the neighbouring cells, packed side by side with this one round the same lumen, in a ring in its
     plane: a slice of the bunch, as a section through a gland shows it and as the intro's drawing does. (Daniel, 4 Nov
     2026: cells spread over a sphere behind this one looked "more like orbitals of an atom rather than cells close to
     each other".) Each is drawn as a cell: a soft body, its nucleus near its base, vesicles near its top, by the lumen. */
  const acinus = add('acinus', new THREE.Group());
  const nGeo = cellShellGeometry({ segU: 56, segV: 44, bulge: 0.3 });
  /* peach cells with purple nuclei, as in the intro's drawing of the bunches, so the bunch in 3D is that bunch */
  const nMat = magicStandard({ color: 0xf2b28c, emissive: 0x5a2a14, emissiveIntensity: 0.25, roughness: 0.6, transparent: true, opacity: 0.14, depthWrite: false }, { rim: 0xffe3cc, rimK: 0.9 });
  const nNucMat = magicStandard({ color: 0x6f55cc, transparent: true, opacity: 0.22, depthWrite: false }, { rim: 0xb7a8ff, rimK: 0.7 });
  const nGranMat = magicStandard({ color: 0xffc94a, emissive: 0x8a5a00, emissiveIntensity: 0.6, transparent: true, opacity: 0.25, depthWrite: false }, { rim: 0xfff1c8, rimK: 0.6 });
  /* [material, its opacity in the game, its opacity in the intro's view of the whole bunch]: world.acinus(k) */
  W.acinusMats = [[nMat, 0.14, 0.62], [nNucMat, 0.22, 0.9], [nGranMat, 0.25, 0.95]];
  const nNucGeo = new THREE.SphereGeometry(2.8, 24, 16), nGranGeo = new THREE.SphereGeometry(0.45, 10, 8);
  const RING = 7, Zax = new THREE.Vector3(0, 0, 1), mx = new THREE.Matrix4();
  /* its own random numbers, so the rest of the world (built after it from R) stays exactly as before: the old bunch took
     one number of R for each of its six cells, and so does this one */
  const Rn = rng(17), rn = (a, b) => a + (b - a) * Rn();
  for (let k = 1; k < RING; k++) {
    R();
    const g = new THREE.Group(), q = new THREE.Quaternion().setFromAxisAngle(Zax, k * 2 * Math.PI / RING);
    const cell = new THREE.Mesh(nGeo, nMat); cell.renderOrder = 1;
    const nuc = new THREE.Mesh(nNucGeo, nNucMat); nuc.position.set(rn(-0.7, 0.7), rn(4.4, 5.6), rn(-0.6, 0.6)); nuc.scale.set(1, 0.9, 1); nuc.renderOrder = 1;
    const gr = new THREE.InstancedMesh(nGranGeo, nGranMat, 14); gr.renderOrder = 1;
    for (let i = 0; i < 14; i++) {
      const y = rn(12.4, 15.3), f = rAt(y) * Math.sqrt(Rn()) * 0.6, a = rn(0, 6.283);
      gr.setMatrixAt(i, mx.makeTranslation(f * CELL.ax * Math.cos(a), y, f * CELL.az * Math.sin(a)));
    }
    g.add(cell, nuc, gr);
    /* turned round the lumen in this cell's plane: its top meets the others' at the lumen, its sides touch its neighbours' */
    g.position.copy(CELL.lumen).add(new THREE.Vector3(0, -CELL.lumen.y, 0).applyQuaternion(q)); g.quaternion.copy(q);
    acinus.add(g);
  }

  /* ---------- the floor of the world: the base of the cell, and below it the blood ---------- */
  const below = add('blood', new THREE.Group());
  /* the capillary runs under the base of the cell, about 1.3 µm below its membrane (the tissue fluid between), its front
     just behind the front cut, so that the way in shows it from the front. 8.5 µm wide inside, wide enough for a red blood
     cell (7.5 µm) to pass as it is (capillaries are 5-10 µm wide: OpenStax A&P 20.1). Daniel, 8 Nov 2026, after four tries
     at cells that fold where a capillary narrows ("it's very confusing ... should we ... just show the original red blood
     cells without the bending?"): "Yes, go back". That they bend in the narrowest capillaries is said in words, in the
     place's fact (story.js) */
  const CAP_R = 4.25;
  const capPath = new THREE.CatmullRomCurve3([new THREE.Vector3(-26, -6.75, -8.5), new THREE.Vector3(-9, -5.65, -3.4), new THREE.Vector3(0, -5.55, -2.9), new THREE.Vector3(9, -5.65, -3.4), new THREE.Vector3(26, -6.75, -8.0)]);
  /* the blood keeps its colours far away too (the fog darkened it to black beads in the intro's view of the bunch) */
  const capWall = new THREE.Mesh(new THREE.TubeGeometry(capPath, 160, CAP_R, 40, false), magicStandard({ color: 0xc8506a, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false, roughness: 0.5, fog: false }, { rim: 0xff8aa0, rimK: 0.8 }));
  capWall.renderOrder = 1; below.add(capWall);
  /* red blood cells: discs pressed in the middle (biconcave), 7.5 µm across, carried along the capillary, each turned towards
     you so that its thin middle shows; all lean the same way, like coins in a row (about 34°, rocking 6°: as before 7 Nov
     2026, when each leaned 0.2-0.8 rad its own way), so that two never touch and the plasma between two is a clear space
     (tools/blood-bend.mjs) */
  const rbcProfile = []; for (let i = 0; i <= 24; i++) { const t = i / 24, r = 3.75 * t; const h = 1.5 * Math.sqrt(Math.max(0, 1 - t * t)) * (0.42 + 2.2 * t * t - 1.9 * t * t * t * t); rbcProfile.push(new THREE.Vector2(r, h)); }
  for (let i = 24; i >= 0; i--) { const v = rbcProfile[i]; rbcProfile.push(new THREE.Vector2(v.x, -v.y)); }
  const rbcGeo = new THREE.LatheGeometry(rbcProfile.map(v => new THREE.Vector2(Math.max(0.0001, v.x), v.y)), 36);
  /* red from every side, also far away and against the light (they looked black in the intro's view, 4 Nov 2026) */
  const rbcMat = magicStandard({ color: 0xc0303f, emissive: 0x6a0d1a, emissiveIntensity: 0.55, roughness: 0.4, fog: false }, { rim: 0xff7b8a, rimK: 0.45 });
  const rbcs = new THREE.InstancedMesh(rbcGeo, rbcMat, 9); rbcs.name = 'rbc'; below.add(rbcs);
  const FLOW = 0.012, uOf = (k, t) => (((t * FLOW + k / 9) % 1) + 1) % 1;
  /* where red blood cell i is at time t (the way in: oxygen leaves one): its middle, in the capillary's, moving a little
     from it (0.25-0.3 µm) */
  const rbcAt = (i, t, out = new THREE.Vector3()) => out.copy(capPath.getPointAt(uOf(i, t))).add(new THREE.Vector3(0, 0.25 * Math.sin(i * 1.7 + t * 0.6), 0.3 * Math.cos(i * 2.1)));
  /* the plasma, the liquid part of the blood: pale yellow motes flowing along the capillary with the red blood cells.
     The way in sends carbon dioxide into it, between two red blood cells, never into one (Daniel, 4 Nov 2026: "make
     sure that it goes into the plasma, and it looks like it's going into the plasma … Otherwise, it's leading to a
     misconception"). Its own random numbers, so that the rest of the world stays as it was. */
  const NP = 260, Rp = rng(41), plasmaAt = [];
  for (let i = 0; i < NP; i++) { const a = Rp() * 6.283, r = 3.5 * Math.sqrt(Rp()); plasmaAt.push([Rp(), r * Math.cos(a), r * Math.sin(a)]); }
  const plasma = sparkles({ count: NP, size: 0.14, color: 0xffd76a, drift: 0.06, opacity: 0.85, sample: (v, i) => v.copy(capPath.getPointAt(plasmaAt[i][0])) });
  plasma.name = 'plasma'; plasma.frustumCulled = false; below.add(plasma);
  /* where the carbon dioxide goes into the plasma (play.js co2), between red blood cells k and k + 1 (the blood flows to
     the right), each as drawn last frame (W.anim below): gapAt, the middle between the two; aimAt, beside it, nearer you
     and a little higher (0.5, 1.4 µm, square to the capillary), moved along the capillary so that it stays in the middle
     of the slab of plasma between their two leaning faces (beside the middle, it would be nearer one of them) */
  const mA = new THREE.Matrix4(), mB = new THREE.Matrix4(), cB = new THREE.Vector3();
  const nA = new THREE.Vector3(), nB = new THREE.Vector3(), tG = new THREE.Vector3();
  const gapAt = (k, t, out = new THREE.Vector3()) => { rbcs.getMatrixAt(k % 9, mA); rbcs.getMatrixAt((k + 1) % 9, mB); return out.setFromMatrixPosition(mA).add(cB.setFromMatrixPosition(mB)).multiplyScalar(0.5); };
  const aimAt = (k, t, out = new THREE.Vector3()) => {
    gapAt(k, t, out); capPath.getTangentAt(uOf(k + 0.5, t), tG);
    const n = nA.setFromMatrixColumn(mA, 1).normalize().add(nB.setFromMatrixColumn(mB, 1).normalize()).normalize();
    const off = new THREE.Vector3(0, 0.5, 1.4); off.addScaledVector(tG, -off.dot(tG));
    return out.add(off).addScaledVector(tG, -n.dot(off) / n.dot(tG));
  };
  W.blood = { path: capPath, rbcAt, n: 9, radius: CAP_R, gapAt, aimAt,
    /* the gap the carbon dioxide enters, arriving at x: the nearest one whose two cells are in order along the capillary */
    gapNear: (x, t) => { let best = 0, bd = Infinity; for (let k = 0; k < 9; k++) { if (uOf(k + 1, t) < uOf(k, t)) continue; const d = Math.abs(capPath.getPointAt(uOf(k + 0.5, t)).x - x); if (d < bd) { bd = d; best = k; } } return best; } };
  const up = new THREE.Vector3(0, 1, 0), AX = new THREE.Vector3(1, 0, 0), qt = new THREE.Quaternion();
  W.anim.push((t) => {
    W.blood.t = t;
    const pa = plasma.geometry.attributes.position, q = new THREE.Vector3();
    for (let i = 0; i < NP; i++) { capPath.getPointAt(((plasmaAt[i][0] + t * FLOW) % 1 + 1) % 1, q); pa.setXYZ(i, q.x, q.y + plasmaAt[i][1], q.z + plasmaAt[i][2]); }
    pa.needsUpdate = true;
    const o = new THREE.Object3D();
    for (let i = 0; i < 9; i++) {
      rbcAt(i, t, o.position);
      o.quaternion.setFromUnitVectors(up, capPath.getTangentAt(uOf(i, t))).multiply(qt.setFromAxisAngle(AX, 0.6 + 0.1 * Math.sin(i * 1.3 + t * 0.4)));
      o.updateMatrix(); rbcs.setMatrixAt(i, o.matrix);
    }
    rbcs.instanceMatrix.needsUpdate = true;
  });
  /* ---------- the way in, made bigger: the membrane at the base as two layers of lipids, with carrier proteins ----------
     Daniel, 4 Nov 2026: "you don't really see a membrane … you should still see an in and an out … a phospholipid
     bilayer, and then you should see the small non-polar molecules being able to diffuse in, while the large polar
     molecules are transported through channels". Shown only at the way in (world.wayIn), where it takes the place of the
     thin film of the base, across the front of the base (the cut at the front shows its two layers): each lipid a head
     (towards the water on each side: the cytoplasm above, the tissue fluid below) and two tails (towards the middle), the
     colours of the lipid the smooth ER makes (actors.js). Drawn about 100 times bigger than life, like the molecules of the
     game; two carrier proteins in its front row: one for glucose (teal), one for amino acids (violet). Its own random
     numbers, so that the rest of the world stays exactly as it was. */
  const bil = add('bilayer', new THREE.Group()); bil.visible = false;
  const Rb = rng(31), rb = (a, b) => a + (b - a) * Rb();
  const LIP = { step: 0.19, head: 0.085, y: 0.3, tail: 0.2, zBack: -2.6 };
  /* the base's outline where the film is replaced (the film is flat there, below 0.12 µm), and the front cut */
  const inBase = (x, z) => Math.pow(Math.abs(x) / 6.3, 3) + Math.pow(Math.abs(z) / 5.3, 3) < 1 && z <= CUT.uCutZ.value - 0.04 && z >= LIP.zBack;
  const CARRIERS = { glucose: new THREE.Vector3(-1.75, 0, -0.08), amino: new THREE.Vector3(1.25, 0, -0.08) };
  /* no lipid where a carrier protein stands, nor where its halves swing out as it changes shape (cellbuild.js carrier) */
  const clear = (x, z) => Object.values(CARRIERS).every(c => Math.abs(x - c.x) > 0.86 || Math.abs(z - c.z) > 0.45);
  const lipids = [];
  for (let z = CUT.uCutZ.value - 0.06; z >= LIP.zBack; z -= LIP.step * 0.87) {
    const row = Math.round((CUT.uCutZ.value - z) / (LIP.step * 0.87));
    for (let x = -6.3 + (row % 2) * LIP.step / 2; x <= 6.3; x += LIP.step) {
      if (!inBase(x, z) || !clear(x, z)) continue;
      for (const side of [1, -1]) lipids.push({ x: x + rb(-0.02, 0.02), z: z + rb(-0.02, 0.02), side, a: rb(0, 6.283), w: rb(-0.03, 0.03) });
    }
  }
  const headMat = magicStandard({ color: 0xff9ac8, emissive: 0x5c1a3c, emissiveIntensity: 0.5, roughness: 0.45, transparent: true, opacity: 0 }, { rim: 0xffd2e8, rimK: 0.5 });
  const tailMat = magicStandard({ color: 0xffd8a8, emissive: 0x4a3614, emissiveIntensity: 0.35, roughness: 0.6, transparent: true, opacity: 0 });
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(LIP.head, 10, 8), headMat, lipids.length);
  const tails = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.022, 0.018, LIP.tail, 5, 1), tailMat, lipids.length * 2);
  {
    const o = new THREE.Object3D();
    lipids.forEach((L, i) => {
      o.rotation.set(0, 0, 0); o.scale.setScalar(1);
      o.position.set(L.x, L.side * LIP.y + L.w, L.z); o.updateMatrix(); heads.setMatrixAt(i, o.matrix);
      for (let k = 0; k < 2; k++) {
        const dx = Math.cos(L.a) * 0.034 * (k ? 1 : -1), dz = Math.sin(L.a) * 0.034 * (k ? 1 : -1);
        o.position.set(L.x + dx, L.side * (LIP.y - LIP.head - LIP.tail / 2 + 0.02) + L.w, L.z + dz);
        o.rotation.set(dz * 1.6, 0, -dx * 1.6 * L.side); o.updateMatrix(); tails.setMatrixAt(i * 2 + k, o.matrix);
      }
    });
    heads.instanceMatrix.needsUpdate = true; tails.instanceMatrix.needsUpdate = true;
    heads.computeBoundingSphere(); tails.computeBoundingSphere();
  }
  heads.name = 'lipid-heads'; tails.name = 'lipid-tails'; bil.add(heads, tails);
  /* a carrier protein: two halves that meet face to face round a pocket that its molecule fits (the binding site, in the
     middle of the membrane). Daniel, 8 Nov 2026: the molecules moved, and then the carrier protein changed shape; "make
     sure that it matches the reality ... in terms of timing". The real order (alternating access: Jardetzky 1966, Nature
     211:969; the glucose transporters GLUT1 and GLUT3, Deng et al. 2014, Nature 510:121, and 2015, Nature 526:391): the
     carrier is open to one side; the molecule enters and binds in the pocket; the open side shuts behind it, so that for
     a moment the molecule is held inside with both sides shut; then the other side opens and it leaves; then the empty
     carrier changes back (play.js viaCarrier). pose(s): -1 open to the outside (below), 0 shut on both sides, 1 open to
     the inside (above). The halves turn 18° about the ends of their faces (the rocker switch of these transporters is
     about 15-20°): about the top ends the faces part at the bottom; about the bottom ends, at the top. Both halves are
     cut from one ellipsoid each: the part past the middle plane is the flat face, with half of the pocket cut into it. */
  const CAR = { rx: 0.5, ry: 0.6, rz: 0.36, cx: 0.12, P: 0.3, Ph: 0.31, Pz: 0.24, turn: 0.32 };
  const yEnd = CAR.ry * Math.sqrt(1 - (CAR.cx / CAR.rx) ** 2);
  const halfGeo = sd => {
    const geo = new THREE.SphereGeometry(1, 40, 30), p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      let x = sd * CAR.cx + v.x * CAR.rx; const y = v.y * CAR.ry, z = v.z * CAR.rz;
      if (sd * x <= 0) { const q = 1 - (y / CAR.Ph) ** 2 - (z / CAR.Pz) ** 2; x = q > 0 ? sd * CAR.P * Math.sqrt(q) : 0; }
      p.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();
    return geo;
  };
  const carrier = (key, color, emissive) => {
    const g = new THREE.Group(); g.position.copy(CARRIERS[key]); g.name = 'carrier-' + key;
    const m = magicStandard({ color, emissive, emissiveIntensity: 0.55, roughness: 0.35, transparent: true, opacity: 0 }, { rim: 0xffffff, rimK: 0.45 });
    const halves = [-1, 1].map(sd => { const h = new THREE.Mesh(halfGeo(sd), m); g.add(h); return h; });
    bil.add(g);
    /* mouth: how far from the middle of the membrane a molecule waits, outside the carrier, before it goes in */
    const C = { group: g, halves, mat: m, at: CARRIERS[key], s: 0, mouth: yEnd + 0.36, Ph: CAR.Ph, end: yEnd, top: CAR.ry,
      pose(s) {
        C.s = s;
        const py = s < 0 ? yEnd : -yEnd;
        halves.forEach((h, k) => { const a = (k ? -1 : 1) * Math.sign(s) * CAR.turn * Math.abs(s); h.rotation.z = a; h.position.set(py * Math.sin(a), py * (1 - Math.cos(a)), 0); });
      } };
    C.pose(-1); g.userData.part = C;
    return C;
  };
  const carriers = { glucose: carrier('glucose', 0x3fd6b0, 0x0e5a48), amino: carrier('amino', 0xa58cff, 0x3a2a8a) };
  /* the tissue fluid: faint motes in the narrow space between the membrane and the capillary */
  const fluid = sparkles({ count: 140, size: 0.05, color: 0xbfeee0, drift: 0.08, opacity: 0.55, sample: (v) => v.set(rb(-6, 5), rb(-1.6, -0.5), rb(-2.6, 0.2)) });
  fluid.name = 'tissue-fluid'; bil.add(fluid);
  /* [material, its opacity when shown]: a carrier is a little clear, so the molecule inside it shows */
  W.bilayer = { group: bil, mats: [[headMat, 1], [tailMat, 1], [carriers.glucose.mat, 0.6], [carriers.amino.mat, 0.6]], fluid, carriers, top: LIP.y + LIP.head, bottom: -(LIP.y + LIP.head), zBack: LIP.zBack };

  /* a nerve ending beside the base of the cell (for the signal at the end: smelling food sends a message) */
  const nervePath = new THREE.CatmullRomCurve3([new THREE.Vector3(13, -0.4, -5.5), new THREE.Vector3(9.5, 1.0, -4.6), new THREE.Vector3(7.35, 2.0, -4.0), new THREE.Vector3(7.2, 3.0, -6.2), new THREE.Vector3(8.8, 3.8, -11)]);
  const nerve = new THREE.Mesh(new THREE.TubeGeometry(nervePath, 120, 0.22, 12, false), magicStandard({ color: 0xd9c27a, roughness: 0.4 }, { rim: PAL.nerve, rimK: 0.9 }));
  nerve.name = 'nerve'; nerve.visible = false; below.add(nerve);       /* shown when the signal comes (the way out) */
  const varicosity = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 16), magicStandard({ color: 0xe8d38a }, { rim: PAL.nerve, rimK: 1.0 }));
  varicosity.position.set(7.05, 2.0, -3.95); varicosity.scale.set(0.7, 0.9, 1.1); varicosity.visible = false; below.add(varicosity);
  W.nerve = { tube: nerve, end: varicosity, path: nervePath };

  /* ---------- the nucleus: two membranes with pores. Closed (the whole envelope, its pores all over it) until the pupil
     has first been inside, by a dive through one pore (8 Nov 2026; Daniel: "the first time you go in, it needs to be
     closed, and you need to go through a pore and then kind of travel through it and then reveal what's inside");
     afterwards open, a window cut at the front to see inside, as before (world.js setNucleus) ---------- */
  const N0 = new THREE.Vector3(0, 5.0, -0.3), NR = 2.9, NSY = 0.9;
  const nucleus = add('nucleus', new THREE.Group()); nucleus.position.copy(N0);
  const winDir = new THREE.Vector3(0.12, 0.38, 0.92).normalize(), winCos = Math.cos(THREE.MathUtils.degToRad(46));
  /* the dive's hole (play.js dive, pore.js): a point of the envelope is in it when the line from the middle of the
     nucleus through it meets the plane that touches the envelope at the dive's pore within uHoleR (µm) of the pore; the
     pore's own patch of membrane is that disc of the plane, carried onto the envelope along the same lines, so it fills
     the hole exactly (0: no hole) */
  const HOLE = { uHoleP: { value: new THREE.Vector3() }, uHoleN: { value: new THREE.Vector3(0, 0, 1) }, uHoleR: { value: 0 } };
  /* the inside, dark until the light of the dive reaches it (uRevK 1; a wave from uRevC, uRevR µm wide, its front a band
     of warm light; 0: no effect, as always outside the dive): what is inside is revealed only once the pupil is in */
  const REV = { uRevK: { value: 0 }, uRevC: { value: new THREE.Vector3() }, uRevR: { value: 0 }, uNucC: { value: N0.clone() }, uNucR: { value: NR }, uNucSY: { value: NSY } };
  const envelope = (r, color, op) => {
    const m = revealOn(magicStandard({ color, transparent: true, opacity: op, side: THREE.DoubleSide, roughness: 0.3, depthWrite: op > 0.9 }, { rim: PAL.envelope, rimK: 1.1, rimPow: 2.0 }), REV, 'env', HOLE);
    /* the same triangles closed and open, with the sphere's own smooth normals (made the flattened shape's by scale; the
       old flat facets showed close up), so the part both keep looks the same in each */
    const sphere = new THREE.SphereGeometry(r, 120, 80);
    const cut = keepTris(sphere, (mid) => mid.clone().normalize().dot(winDir) < winCos), whole = keepTris(sphere, () => true);
    [cut, whole].forEach(g => g.scale(1, NSY, 1));
    const mesh = new THREE.Mesh(whole, m); mesh.userData.geo = { cut, whole };
    return mesh;
  };
  /* the outer membrane is solid (opacity 1): nothing behind it shows through, neither the pores of the far side nor what
     is inside or behind the nucleus (Daniel, 8 Nov 2026: at 0.92 the far side's pores showed through the closed nucleus,
     "that means that you're seeing through the nucleus. But you're not seeing … the inside"). The inner one is seen only
     from inside, through the window of the open nucleus */
  const outerEnv = envelope(NR, PAL.nucleus, 1), innerEnv = envelope(NR - 0.07, 0x4f42b8, 0.95);
  nucleus.add(outerEnv, innerEnv);
  /* the rim of the window: where the two membranes meet the cut, a soft glowing ring */
  const rimPts = []; const wb1 = new THREE.Vector3(0, 1, 0).cross(winDir).normalize(), wb2 = winDir.clone().cross(wb1).normalize(), sinW = Math.sqrt(1 - winCos * winCos);
  for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2; const d = winDir.clone().multiplyScalar(winCos).addScaledVector(wb1, sinW * Math.cos(a)).addScaledVector(wb2, sinW * Math.sin(a)); rimPts.push(d.multiplyScalar(NR - 0.035).multiply(new THREE.Vector3(1, NSY, 1))); }
  const rim = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true), 200, 0.06, 8, true), magicStandard({ color: 0xb8a8ff, emissive: 0x5a4bd8, emissiveIntensity: 0.9 }, { rim: 0xe0d8ff, rimK: 1.2 }));
  nucleus.add(rim);
  /* nuclear pores: rings through both membranes (about 240 drawn; a real nucleus has thousands, each 0.12 µm across) */
  const poreList = [];
  for (let k = 0; k < 900 && poreList.length < 240; k++) {
    const u = rr(-1, 1), a = rr(0, 6.283), s = Math.sqrt(1 - u * u), d = new THREE.Vector3(s * Math.cos(a), u, s * Math.sin(a));
    if (d.dot(winDir) > winCos - 0.03) continue;
    if (poreList.some(p => p.d.distanceTo(d) < 0.12)) continue;
    const p = d.clone().multiplyScalar(NR).multiply(new THREE.Vector3(1, NSY, 1));
    poreList.push({ d, p, q: qAlong(d) });
  }
  /* each ring goes through BOTH membranes, as a real pore does: from 0.032 µm outside the outer membrane (as before) to
     0.032 µm inside the inner one, 0.07 µm deeper (8 Nov 2026: seen from inside the open nucleus, the pores had shown only
     dimly through the inner membrane, as if it covered them) */
  const poreGeo = new THREE.TorusGeometry(0.085, 0.032, 8, 18); poreGeo.rotateX(Math.PI / 2); poreGeo.scale(1, 2.1, 1); poreGeo.translate(0, -0.035, 0);
  /* uPoreK: every pore drawn smaller, about itself (the dive: 0.513 is the true size, 120 nm across) */
  const PK = { uPoreK: { value: 1 } };
  const poreMat = revealOn(magicStandard({ color: 0xffd58a, emissive: 0x9a6a18, emissiveIntensity: 1.3, roughness: 0.3 }, { rim: 0xfff0c8, rimK: 1.0 }), REV, 'pore', null, PK);
  const pores = instanced(poreGeo, poreMat, poreList, 'pores'); nucleus.add(pores);
  W.pores = poreList.map(p => p.p.clone().add(N0));
  /* the pores of the front, where the window is: drawn while the nucleus is closed (their own random numbers, so that
     nothing else of the seeded world moves), as close together as the others. The first is the pore the dive goes
     through: where the line from the nucleus's view to what it looks at meets the envelope, so that it stands in the
     middle of the picture there, with no other pore within 0.6 µm of it (the dive's close view shows only it) */
  const doorD = (() => {
    const o = new THREE.Vector3(...VIEWS.nucleus.pos).sub(N0), dir = new THREE.Vector3(...VIEWS.nucleus.at).sub(N0).sub(o).normalize();
    const S = v => new THREE.Vector3(v.x / NR, v.y / (NR * NSY), v.z / NR), a = S(dir), b = S(o);
    const A = a.dot(a), B = 2 * a.dot(b), C = b.dot(b) - 1, t = (-B - Math.sqrt(B * B - 4 * A * C)) / (2 * A);
    return b.addScaledVector(a, t).normalize();
  })();
  const RF = rng(20261108), rf = (a, b) => a + (b - a) * RF(), frontPores = [{ d: doorD.clone() }];
  for (let k = 0; k < 4000 && frontPores.length < 46; k++) {
    const u = rf(-1, 1), a = rf(0, 6.283), sn = Math.sqrt(1 - u * u), d = new THREE.Vector3(sn * Math.cos(a), u, sn * Math.sin(a));
    if (d.dot(winDir) <= winCos - 0.03 || d.distanceTo(doorD) < 0.21) continue;
    if (frontPores.some(p => p.d.distanceTo(d) < 0.12) || poreList.some(p => p.d.distanceTo(d) < 0.12)) continue;
    frontPores.push({ d });
  }
  frontPores.forEach(f => { f.p = f.d.clone().multiplyScalar(NR).multiply(new THREE.Vector3(1, NSY, 1)); f.q = qAlong(f.d); });
  const poresFront = instanced(poreGeo, poreMat, frontPores, 'pores-front'); nucleus.add(poresFront);
  /* the dive's pore in the nucleus's own frame: where it is on the outer envelope, the envelope's normal there, and two
     directions across (play.js, pore.js) */
  const doorP = frontPores[0].p.clone(), doorN = new THREE.Vector3(doorP.x, doorP.y / (NSY * NSY), doorP.z).normalize();
  const doorE1 = new THREE.Vector3(0, 1, 0).cross(doorN).normalize(), doorE2 = doorE1.clone().cross(doorN).normalize();
  /* the dive's pore as the world draws it, see-through: it fades while the real pore (pore.js) takes its place, the same
     size (built and compiled with the world, so the fade compiles nothing) */
  const doorTorus = new THREE.Mesh(poreGeo, revealOn(magicStandard({ color: 0xffd58a, emissive: 0x9a6a18, emissiveIntensity: 1.3, roughness: 0.3, transparent: true, depthWrite: false }, { rim: 0xfff0c8, rimK: 1.0 }), REV, 'pore', null, PK));
  doorTorus.position.copy(doorP); doorTorus.quaternion.copy(frontPores[0].q); doorTorus.visible = false; doorTorus.name = 'pore-door'; nucleus.add(doorTorus);
  /* chromatin: in a working cell each chromosome is a long thin thread in its own territory (never an X: chromosomes
     look like an X only when a cell divides). 14 territories drawn, of the 46; chromosome 1, the largest, is gold */
  const chromatin = new THREE.Group(); chromatin.name = 'chromatin'; nucleus.add(chromatin);
  const terrColors = [0xc9b8ff, 0xa995ff, 0xd7c9ff, 0x9c86f5, 0xbfaeff, 0xe2d6ff, 0xae9cf7];
  W.chromosomes = [];
  for (let c = 0; c < 14; c++) {
    let ctr;
    for (let tries = 0; tries < 60; tries++) {
      const u = rr(-1, 1), a = rr(0, 6.283), r = rr(0.6, 1.85), s = Math.sqrt(1 - u * u);
      ctr = new THREE.Vector3(s * Math.cos(a) * r, u * r * NSY, s * Math.sin(a) * r);
      if (W.chromosomes.every(ch => ch.center.distanceTo(ctr) > 0.95) && ctr.distanceTo(new THREE.Vector3(0.55, 0.55, 0.8)) > 1.1) break;
    }
    const pts = []; let p = ctr.clone(); const v = new THREE.Vector3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize();
    const len = c === 0 ? 150 : 90 + Math.floor(rr(0, 40));
    for (let i = 0; i < len; i++) {
      v.add(new THREE.Vector3(rr(-0.9, 0.9), rr(-0.9, 0.9), rr(-0.9, 0.9))).normalize();
      const back = ctr.clone().sub(p); if (back.length() > 0.65) v.addScaledVector(back.normalize(), 0.6).normalize();
      p = p.clone().addScaledVector(v, 0.09);
      const lim = p.clone().multiply(new THREE.Vector3(1, 1 / NSY, 1)); if (lim.length() > NR - 0.25) p.multiplyScalar((NR - 0.25) / lim.length());
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const gold = c === 0;
    const mat = revealOn(magicStandard({ color: gold ? 0xffcf6b : terrColors[c % terrColors.length], emissive: gold ? 0x7a4a00 : 0x2a1f6a, emissiveIntensity: gold ? 0.5 : 0.4, roughness: 0.45 }, { rim: gold ? 0xffe9b0 : 0xd8ceff, rimK: 0.6 }), REV, 'in');
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, len * 3, gold ? 0.05 : 0.042, 6, false), mat);
    tube.name = 'chr' + (c + 1); chromatin.add(tube);
    W.chromosomes.push({ n: c + 1, center: ctr.clone(), curve, mesh: tube });
  }
  /* the nucleolus: a dense region with no membrane, where ribosome parts are made */
  let nolGeo = mergeVertices(new THREE.IcosahedronGeometry(0.7, 5));
  { const p = nolGeo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + 0.16 * fbm(v.x * 2.6, v.y * 2.6, v.z * 2.6) + 0.07 * noise3(v.x * 14, v.y * 14, v.z * 14); p.setXYZ(i, v.x * k, v.y * k, v.z * k); } nolGeo.computeVertexNormals(); }
  const nucleolus = new THREE.Mesh(nolGeo, revealOn(magicStandard({ color: 0xb04a92, emissive: 0x3a0a2c, emissiveIntensity: 0.6, roughness: 0.8 }, { rim: 0xff9ad6, rimK: 0.9 }), REV, 'in'));
  nucleolus.position.set(0.55, 0.55, 0.8); nucleolus.name = 'nucleolus-body'; nucleus.add(nucleolus);
  const nolSpark = sparkles({ count: 140, size: 0.05, color: 0xffb3e6, drift: 0.02, sample: (v) => { const u = rr(-1, 1), a = rr(0, 6.28), s = Math.sqrt(1 - u * u), r = 0.5 + rr(0, 0.3); v.set(0.55 + s * Math.cos(a) * r, 0.55 + u * r, 0.8 + s * Math.sin(a) * r); } });
  nucleus.add(nolSpark);
  W.nucleus = { group: nucleus, center: N0, r: NR, sy: NSY, winDir, winCos, nucleolus, outerEnv, innerEnv, rim, rimPts, pores, poresFront, front: frontPores, chromatin, nolSpark,
    door: { d: doorD, p: doorP, n: doorN, e1: doorE1, e2: doorE2, torus: doorTorus }, HOLE, REV, PK, poreGeo, poreMat };

  /* ---------- rough ER: curved layers round the base of the nucleus, studded with ribosomes ---------- */
  const rer = add('rer', new THREE.Group());
  const rerMat = magicStandard({ color: PAL.rer, side: THREE.DoubleSide, roughness: 0.38 }, { rim: 0x8ff5dc, rimK: 0.9, rimPow: 2.0 });
  const rerSheets = [];
  const front = Math.PI / 2;                                    /* +z, towards the camera */
  for (let i = 0; i < 6; i++) {
    const radius = 3.35 + i * 0.42;
    const keepAz = (az, e) => {
      let d = Math.abs(((az - front + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI);   /* 0 at the front */
      const openFront = e > -0.95 ? (d - 0.95) / 0.35 : 9;     /* a window at the front, above the lowest layers */
      const openTop = (0.2 - e) / 0.2;
      return Math.min(openFront, 9) + Math.min(0, openTop * 3);
    };
    const geo = ellipsoidPatch({ center: N0.clone().add(new THREE.Vector3(0, -0.1, 0)), radius, scale: new THREE.Vector3(1, 0.75, 0.9), elev: [-1.52, 0.22], keepAz, holes: -0.62, seed: i * 3.1 });
    const keepIn = keepTris(geo, (m) => inside(m, 0.32));
    keepIn.computeVertexNormals();
    const sheet = new THREE.Mesh(keepIn, rerMat); sheet.name = 'rer' + i; rer.add(sheet); rerSheets.push(keepIn);
  }
  /* ribosomes on the outer face of every layer (the cytosol side), drawn about four times their real 25 nm */
  const riboGeo = new THREE.IcosahedronGeometry(0.052, 1);
  const riboMat = magicStandard({ color: 0xffc95e, emissive: 0x9a6410, emissiveIntensity: 0.85, roughness: 0.3 }, { rim: 0xffeab0, rimK: 0.5 });
  const riboList = [];
  rerSheets.forEach((g, i) => { surfacePoints(g, i < 3 ? 260 : 950).forEach(({ p, n }) => { for (const sgn of [1, -1]) { if (R() < 0.5) continue; riboList.push({ p: p.clone().addScaledVector(n, sgn * 0.07), s: rr(0.8, 1.2) }); } }); });
  const rerRibos = instanced(riboGeo, riboMat, riboList, 'rer-ribosomes'); rer.add(rerRibos);
  W.rer = { sheets: rerSheets, ribosomes: riboList };

  /* ---------- smooth ER: a fine net of tubes at their TRUE width, joined to the rough ER (8 Nov 2026; Daniel asked whether
     it was big enough "considering its real size"). Real ER tubes are about 0.05 µm across (Shibata et al. 2010, Cell
     143:774); the old net drew them 0.22 µm, about four times too wide, so its membrane was a short, thick knot. This cell
     has little smooth ER (in a pancreas cell of the same kind, less than 1 % of all membrane against 60 % rough ER: Bolender
     1974; Alberts et al., table 12-2): the new net keeps the old one's membrane (about 5 µm², 0.5 % of the rough ER drawn)
     as about 30 µm of tube 0.05 µm wide, mostly three-way joins, in the same place. It is built further down (after the
     free ribosomes), with random numbers of its own, clear of everything placed before it. The old net's random numbers
     are still drawn here, so that everything placed after this stays exactly where it was ---------- */
  const ser = add('ser', new THREE.Group());
  /* thin tubes need a little light of their own to read against the purple cytoplasm (as the rough ER's rim) */
  const serMat = magicStandard({ color: PAL.ser, roughness: 0.3, emissive: 0x2a8a72, emissiveIntensity: 0.55 }, { rim: 0xd2fff3, rimK: 1.4 });
  {
    const grow = (from, dir, depth) => {
      if (depth > 3) return;
      const pts = [from.clone()]; let p = from.clone(), d = dir.clone();
      for (let i = 0; i < 6; i++) { d.add(new THREE.Vector3(rr(-0.5, 0.5), rr(-0.25, 0.45), rr(-0.5, 0.5))).normalize(); p = p.clone().addScaledVector(d, 0.42); if (!inside(p, 0.5)) break; pts.push(p); }
      if (pts.length < 3) return;
      const end = pts[pts.length - 1], mid = pts[Math.floor(pts.length / 2)];
      grow(end, d.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), 0.7), depth + 1);
      if (depth < 2) grow(mid, d.clone().applyAxisAngle(new THREE.Vector3(1, 0, 0), -1.0), depth + 1);
    };
    const old0 = new THREE.Vector3(-5.05, 6.15, -0.6);
    grow(old0, new THREE.Vector3(0.1, 1, 0.25), 0); grow(old0.clone().add(new THREE.Vector3(0.2, 0.3, 1.0)), new THREE.Vector3(0.25, 0.9, 0.3), 1);
  }

  /* ---------- the Golgi apparatus: a stack of curved flattened sacs above the nucleus ---------- */
  const G0 = new THREE.Vector3(0.45, 9.55, -0.35);
  const golgi = add('golgi', new THREE.Group()); golgi.position.copy(G0); golgi.rotation.set(0.18, 0.35, -0.08);
  const golgiMat = magicStandard({ color: 0xeaa632, roughness: 0.3, metalness: 0.05, emissive: 0x4a2c04, emissiveIntensity: 0.25, side: THREE.DoubleSide }, { rim: 0xffe0a0, rimK: 0.9 });
  W.golgiSacs = [];
  for (let k = 0; k < 6; k++) {
    const rx = 1.75 - k * 0.08, rz = 1.32 - k * 0.05;
    const geo0 = new THREE.SphereGeometry(1, 72, 24);
    const p = geo0.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const rr2 = v.x * v.x + v.z * v.z;
      const th = 0.03 + 0.06 * Math.pow(rr2, 4);                 /* thin in the middle, swollen at the rim */
      const n = 0.07 * noise3(v.x * 3 + k, v.z * 3, k * 1.3);
      const x = v.x * rx * (1 + n), z = v.z * rz * (1 + n);
      const y = v.y * th + 0.55 * (x * x / (rx * rx) + z * z / (rz * rz)) - 0.12;   /* curved: the stack is a shallow bowl */
      p.setXYZ(i, x, y + k * 0.2, z);
    }
    /* small holes near the rim (fenestrations), as in electron micrographs of Golgi sacs */
    const geo = keepTris(geo0, (m) => { const q = (m.x * m.x) / (rx * rx) + (m.z * m.z) / (rz * rz); return q < 0.5 || noise3(m.x * 4.5 + k * 2, m.z * 4.5, k) > -0.35; });
    geo.computeVertexNormals();
    const sac = new THREE.Mesh(geo, golgiMat); sac.name = 'golgi' + k; golgi.add(sac);
    W.golgiSacs.push(sac);
  }
  /* small vesicles at the rims, and three growing secretory vesicles on the top (trans) face */
  const gvList = [];
  for (let i = 0; i < 46; i++) { const a = rr(0, 6.283), k = Math.floor(rr(0, 6)); gvList.push({ p: new THREE.Vector3(Math.cos(a) * rr(1.75, 2.1), k * 0.2 + 0.42 + rr(-0.1, 0.1), Math.sin(a) * rr(1.35, 1.65)), s: rr(0.8, 1.2) }); }
  const vesMat = magicStandard({ color: PAL.vesicle, transparent: true, opacity: 0.85, roughness: 0.15, emissive: 0x2a5a7a, emissiveIntensity: 0.6 }, { rim: 0xe8fbff, rimK: 1.3 });
  golgi.add(instanced(new THREE.SphereGeometry(0.085, 14, 10), vesMat, gvList, 'golgi-vesicles'));
  W.golgi = { group: golgi, center: G0 };

  /* ---------- secretory vesicles (zymogen granules) crowd the top of the cell, full of amylase ---------- */
  const granules = add('granules', new THREE.Group());
  const grList = [];
  for (let k = 0; k < 4000 && grList.length < 36; k++) {
    const p = new THREE.Vector3(rr(-3.2, 3.2), rr(11.5, 15.1), rr(-2.8, 1.8)), r = rr(0.42, 0.56);
    if (!inside(p, r + 0.35)) continue;
    if (grList.some(g => g.p.distanceTo(p) < g.r + r + 0.07)) continue;
    grList.push({ p, r, s: r });
  }
  const grMat = magicStandard({ color: PAL.granule, transparent: true, opacity: 0.46, roughness: 0.1, emissive: 0x2a1c06, emissiveIntensity: 0.2, depthWrite: false }, { rim: 0xffefc2, rimK: 0.75, rimPow: 2.2 });
  const grCoreMat = new THREE.MeshBasicMaterial({ color: 0xd9a650, transparent: true, opacity: 0.45 });
  const grMesh = instanced(new THREE.SphereGeometry(1, 28, 18), grMat, grList, 'granules'); grMesh.renderOrder = 3;
  const grCore = instanced(new THREE.IcosahedronGeometry(0.55, 2), grCoreMat, grList.map(g => ({ p: g.p, s: g.r })), 'granule-cores');
  granules.add(grCore, grMesh);
  W.granules = grList;

  /* ---------- mitochondria: real shapes, each with its two membranes; the one you visit cut open (mitoparts.js) ----------
     Daniel, 5 Nov 2026: "They don't look like real mitochondria … so it looks … like it has a double membrane inside".
     The shapes are real mitochondria of one human cell (mito-shapes.js: short ones, long tubes, three branched), each
     turned at random and placed where it fits: among the rest, never in the nucleus, the rough ER or the Golgi, never in
     front of a place, never through another. The old rods' placement still draws its random numbers first (and the old
     one's sparkles theirs), so that everything placed after it in the world (microtubules, lysosomes, free ribosomes …)
     stays exactly where it was; the new ones have random numbers of their own. */
  const mitos = add('mitochondria', new THREE.Group());
  const mList = [];
  const okMito = (p, len) => {
    const q = p.clone().sub(N0).multiply(new THREE.Vector3(1, 1 / 0.75, 1 / 0.9));
    const rr0 = q.length();
    if (rr0 < 6.0 && p.y < 6.4) return false;                  /* not inside the nucleus or the rough ER */
    if (p.clone().sub(N0).multiply(new THREE.Vector3(1, 1 / NSY, 1)).length() < NR + 0.9) return false;
    if (p.distanceTo(G0) < 2.6) return false;
    if (grList.some(g => g.p.distanceTo(p) < g.r + 0.9)) return false;
    if (p.y > 14.6) return false;
    if (SIGHTS0.some(([a, b]) => segDist(p, a, b) < 1.6 + len / 2)) return false;   /* never in front of a place */
    return inside(p, 0.75) && inside(p.clone().add(new THREE.Vector3(0, len / 2, 0)), 0.55) && inside(p.clone().add(new THREE.Vector3(0, -len / 2, 0)), 0.55);
  };
  for (let k = 0; k < 6000 && mList.length < 17; k++) {
    const p = new THREE.Vector3(rr(-6.5, 6.5), rr(0.8, 13.5), rr(-5.5, 3.2)), len = rr(1.1, 2.4);
    if (!okMito(p, len)) continue;
    if (mList.some(m => m.p.distanceTo(p) < 1.6)) continue;
    if (Math.abs(p.x - 3.9) < 1.6 && Math.abs(p.y - 7.4) < 1.6) continue;      /* room for the open one */
    const dir = new THREE.Vector3(rr(-0.45, 0.45), 1, rr(-0.45, 0.45)).normalize();
    mList.push({ p, len, dir });
  }
  for (let i = 0; i < 360; i++) R();
  const H = heroMito(), hero = H.group; hero.position.copy(HERO_AT); hero.quaternion.copy(HERO_Q); hero.updateMatrixWorld(true);
  /* its front half (the same, turned over) closes it: from the cell it looks whole, and it opens like a lid when the pupil
     arrives (play.js mlook; Daniel, 5 Nov 2026: "Show it from the outside and then show how it's split open") */
  const FH = heroMito(), frontMats = []; FH.group.name = 'mito-hero-front'; FH.group.scale.z = -1; hero.add(FH.group);
  FH.group.traverse(o => { if (o.material && !o.material.uniforms) { o.material = o.material.clone(); o.material.transparent = true; frontMats.push(o.material); } });
  const heroA = hero.localToWorld(heroPoint(H.spec, 0, 0)), heroB = hero.localToWorld(heroPoint(H.spec, H.spec.total, 0));
  const Rm = rng(20261105), rm = (a, b) => a + (b - a) * Rm();
  const taken = [], placed = [];
  const fits = (p, r) => {
    if (!inside(p, r + 0.12) || p.y > 14.4) return false;
    const q = p.clone().sub(N0).multiply(new THREE.Vector3(1, 1 / 0.75, 1 / 0.9));
    if (q.length() < 6.0 && p.y < 6.4) return false;                                 /* not in the nucleus or the rough ER */
    if (p.clone().sub(N0).multiply(new THREE.Vector3(1, 1 / NSY, 1)).length() < NR + 0.6 + r) return false;
    if (p.distanceTo(G0) < 2.5) return false;
    if (grList.some(g => g.p.distanceTo(p) < g.r + r + 0.08)) return false;
    if (SIGHTS.some(([a, b]) => segDist(p, a, b) < 1.15 + r)) return false;          /* never in front of a place */
    if (segDist(p, heroA, heroB) < H.spec.R + 0.4 + r) return false;
    return !taken.some(([t, tr]) => t.distanceTo(p) < r + tr + 0.1);
  };
  const turn = () => { const u1 = Rm(), u2 = Rm() * 6.2832, u3 = Rm() * 6.2832, a = Math.sqrt(1 - u1), b = Math.sqrt(u1); return new THREE.Quaternion(a * Math.sin(u2), a * Math.cos(u2), b * Math.sin(u3), b * Math.cos(u3)); };
  /* the long and branched ones first (they fit in fewer places), then the short ones, then a second turn of the short */
  const order = MITO_SHAPES.shapes.slice().sort((x, y) => y.len - x.len);
  order.concat(order.filter(sh => sh.len < 1.6)).forEach(shape => {
    for (let k = 0; k < 140; k++) {
      const pos = new THREE.Vector3(rm(-6.2, 6.2), rm(1.0, 13.8), rm(-5.2, 3.0)), q = turn();
      const pts = shape.paths.flat().map(v => [new THREE.Vector3(v[0], v[1], v[2]).applyQuaternion(q).add(pos), v[3]]);
      if (!pts.every(([p, r]) => fits(p, r))) continue;
      pts.forEach(t => taken.push(t)); placed.push({ shape, pos, q });
      break;
    }
  });
  const real = realMitos(placed); mitos.add(real.inner, real.outer);
  /* the one you visit: cut open lengthways, its two membranes, its folds (the cristae) and its matrix; in the matrix,
     many molecules (its enzymes, its own DNA and ribosomes), as faint lights */
  const rad = H.spec.rad;
  const mspark = sparkles({ count: 110, size: 0.034, color: 0xffd0a0, drift: 0.01, sample: (v) => {
    const s0 = rm(0.12, H.spec.total - 0.12), F = along(H.spec, s0), rmx = F.r - 0.04, a = rm(-rmx, rmx), b = rm(0.03, Math.max(0.04, Math.sqrt(Math.max(0, rmx * rmx - a * a)) - 0.02));
    v.copy(heroPoint(H.spec, s0, a, b)); } });
  hero.add(mspark);
  mitos.add(hero);
  W.mito = { hero, spec: H.spec, section: H.section, parts: H.parts, list: placed, real, sparks: mspark, front: { group: FH.group, mats: frontMats, face: FH.section } };

  /* ---------- microtubules: from the centrosome near the top of the cell, downwards ---------- */
  const C0 = new THREE.Vector3(0.1, 14.55, -1.1);
  const tracks = add('microtubules', new THREE.Group());
  const railM = railMat();
  W.tracks = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + rr(-0.12, 0.12), spread = rr(1.6, 3.8);
    const pts = [C0.clone().add(new THREE.Vector3(Math.cos(a) * 0.35, rr(-0.15, 0.15), Math.sin(a) * 0.35))];
    const targetY = i % 5 === 0 ? rr(1.2, 2.2) : rr(5.6, 8.0);
    for (let s = 1; s <= 6; s++) {
      const y = C0.y - (C0.y - targetY) * (s / 6);
      let r = spread * Math.min(1, 0.35 + s * 0.22);
      let p = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r * 0.85 - 0.6);
      const g = p.clone().sub(G0); g.y *= 1.8; const gl = g.length(); if (gl < 2.35) p.add(g.setY(0).normalize().multiplyScalar(2.35 - gl));
      const nn = p.clone().sub(N0).multiply(new THREE.Vector3(1, 1 / NSY, 1)); const nl = nn.length(); if (nl < NR + 0.45) p.add(nn.normalize().multiplyScalar(NR + 0.45 - nl));
      let guard = 0; while (!inside(p, 0.4) && guard++ < 20) p.multiply(new THREE.Vector3(0.92, 1, 0.92));
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.03, 6, false), railM); tube.renderOrder = 4; tube.name = 'mt' + i;
    tracks.add(tube); W.tracks.push({ curve, mesh: tube });
  }
  /* the centrosome: two centrioles at right angles, each a ring of nine triplets of microtubules */
  const centro = add('centrosome', new THREE.Group()); centro.position.copy(C0);
  const tripletGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.42, 6);
  const cenMat = magicStandard({ color: PAL.centriole, roughness: 0.3, emissive: 0x2a3a7a, emissiveIntensity: 0.5 }, { rim: 0xffffff, rimK: 0.9 });
  [0, 1].forEach(k => {
    const list = [];
    for (let i = 0; i < 9; i++) for (let t = 0; t < 3; t++) { const a = i / 9 * Math.PI * 2 + t * 0.075; list.push({ p: new THREE.Vector3(Math.cos(a) * (0.11 - t * 0.015), 0, Math.sin(a) * (0.11 - t * 0.015)), s: 1 }); }
    const c = instanced(tripletGeo, cenMat, list, 'centriole' + k);
    if (k) { c.rotation.z = Math.PI / 2; c.position.set(0.26, 0.1, 0); }
    centro.add(c);
  });

  /* ---------- lysosomes: a few small sacs near the Golgi ---------- */
  const lyso = add('lysosomes', new THREE.Group());
  const lyMat = magicStandard({ color: PAL.lyso, roughness: 0.3, emissive: 0x4a0a28, emissiveIntensity: 0.5 }, { rim: 0xffa8cc, rimK: 1.0 });
  [[-2.9, 10.6, -0.6], [2.95, 10.1, -1.4], [-2.4, 9.0, 0.9], [3.2, 11.4, 0.4], [-3.3, 11.7, -1.6]].forEach(([x, y, z], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(rr(0.2, 0.3), 20, 14), lyMat); m.position.set(x, y, z); m.name = 'lyso' + i; lyso.add(m);
  });

  /* ---------- free ribosomes in the cytosol, in little spirals (polysomes) ---------- */
  const freeList = [];
  for (let k = 0; k < 3000 && freeList.length < 70 * 6; k++) {
    const c = new THREE.Vector3(rr(-6, 6), rr(1, 14), rr(-5, 3));
    if (!inside(c, 0.6)) continue;
    if (c.clone().sub(N0).multiply(new THREE.Vector3(1, 1 / NSY, 1)).length() < NR + 0.3) continue;
    if (c.distanceTo(G0) < 2.2 || grList.some(g => g.p.distanceTo(c) < g.r + 0.2)) continue;
    const ax = new THREE.Vector3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize(), b1 = new THREE.Vector3(0, 1, 0).cross(ax).normalize(), b2 = ax.clone().cross(b1);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; freeList.push({ p: c.clone().addScaledVector(b1, Math.cos(a) * 0.16).addScaledVector(b2, Math.sin(a) * 0.16).addScaledVector(ax, i * 0.03), s: rr(0.85, 1.1) }); }
  }
  const freeRibo = add('free-ribosomes', instanced(riboGeo, riboMat, freeList, 'free-ribosomes'));
  W.freeRibosomes = freeList;

  /* the smooth ER's net (see "smooth ER" above): its joins in the space the old net filled, each clear of every part placed
     before it (the nucleus, the rough ER's layers, the Golgi, the vesicles, every mitochondrion, the lysosomes, the
     microtubules, the free ribosomes), of every other place's line of sight and of the lipids its own place shows in
     front of it; the joins linked into one piece by the shortest clear tubes, then more, up to three at a join, never
     crossing or meeting another at a narrow angle, until there is about 30 µm of tube; each tube a little bent; one tube
     joins it to the outer layer of the rough ER */
  {
    const Rs = rng(20261109), rs = (a, b) => a + (b - a) * Rs();
    const TUBE = 0.025, SER0 = new THREE.Vector3(-4.6, 7.9, -0.1), C = new THREE.Vector3(-4.75, 7.55, -0.85), AX = new THREE.Vector3(0.95, 1.25, 1.35);
    const serView = new THREE.Vector3(...VIEWS.ser.pos), sights = SIGHTS.filter(([a]) => !a.equals(serView));
    const lysoP = lyso.children.map(m => [m.position.clone(), m.geometry.parameters.radius]);
    const mtPts = W.tracks.flatMap(t => t.curve.getPoints(80));
    const rerZone = p => { const q = p.clone().sub(N0).multiply(new THREE.Vector3(1, 1 / 0.75, 1 / 0.9)); return q.length() < 5.75 && p.y < 6.4; };
    const clear = (p, m, rerOk = false) => {
      if (!inside(p, 0.3) || p.z > SER0.z + 0.8) return false;                  /* the lipids of its place float in front */
      if (p.clone().sub(N0).multiply(new THREE.Vector3(1, 1 / NSY, 1)).length() < NR + 0.35) return false;
      if (!rerOk && rerZone(p)) return false;
      if (p.distanceTo(G0) < 2.5) return false;
      if (grList.some(g => g.p.distanceTo(p) < g.r + m + 0.05)) return false;
      if (taken.some(([t, tr]) => t.distanceTo(p) < tr + m + 0.08)) return false;        /* the mitochondria */
      if (segDist(p, heroA, heroB) < H.spec.R + 0.3) return false;
      if (lysoP.some(([c, r]) => c.distanceTo(p) < r + m + 0.05)) return false;
      if (mtPts.some(t => t.distanceTo(p) < 0.16 + m)) return false;
      if (freeList.some(f => f.p.distanceTo(p) < 0.1 + m)) return false;
      return !sights.some(([a, b]) => segDist(p, a, b) < 1.0);
    };
    const segClear = (a, b, rerOk) => { for (let t = 0.08; t < 0.95; t += 0.06) if (!clear(a.clone().lerp(b, t), 0.03, rerOk)) return false; return true; };
    /* the shortest distance between two straight pieces of tube */
    const segSeg = (p1, q1, p2, q2) => {
      const d1 = q1.clone().sub(p1), d2 = q2.clone().sub(p2), r = p1.clone().sub(p2), a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r), c = d1.dot(r), b = d1.dot(d2), den = a * e - b * b;
      let sN = den > 1e-9 ? Math.min(1, Math.max(0, (b * f - c * e) / den)) : 0, tN = (b * sN + f) / e;
      if (tN < 0) { tN = 0; sN = Math.min(1, Math.max(0, -c / a)); } else if (tN > 1) { tN = 1; sN = Math.min(1, Math.max(0, (b - c) / a)); }
      return p1.clone().addScaledVector(d1, sN).distanceTo(p2.clone().addScaledVector(d2, tN));
    };
    const nodes = [];
    for (let k = 0; k < 30000 && nodes.length < 46; k++) {
      const u = new THREE.Vector3(rs(-1, 1), rs(-1, 1), rs(-1, 1)); if (u.lengthSq() > 1) continue;
      const p = C.clone().add(u.multiply(AX));
      if (nodes.some(n => n.distanceTo(p) < 0.42) || !clear(p, 0.08)) continue;
      nodes.push(p);
    }
    const cand = [];
    nodes.forEach((a, i) => nodes.forEach((b, j) => { if (j > i) { const d = a.distanceTo(b); if (d < 0.95 && segClear(a, b)) cand.push([d, i, j]); } }));
    cand.sort((x, y) => x[0] - y[0]);
    const par = nodes.map((_, i) => i), find = i => (par[i] === i ? i : (par[i] = find(par[i])));
    const deg = nodes.map(() => 0), edges = [];
    let total = 0;
    const crosses = (i, j) => edges.some(([a, b]) => a !== i && a !== j && b !== i && b !== j && segSeg(nodes[i], nodes[j], nodes[a], nodes[b]) < 0.14);
    const wide = (i, j) => edges.filter(([a, b]) => a === i || b === i).every(([a, b]) => nodes[a === i ? b : a].clone().sub(nodes[i]).normalize().dot(nodes[j].clone().sub(nodes[i]).normalize()) < 0.8);
    const link = (d, i, j) => { edges.push([i, j]); deg[i]++; deg[j]++; total += d; };
    for (const [d, i, j] of cand) if (find(i) !== find(j) && !crosses(i, j)) { par[find(i)] = find(j); link(d, i, j); }
    for (const [d, i, j] of cand) {
      if (total >= 30) break;
      if (deg[i] >= 3 || deg[j] >= 3 || edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) continue;
      if (!wide(i, j) || !wide(j, i) || crosses(i, j)) continue;
      link(d, i, j);
    }
    /* one piece: the largest; joined to the outer layer of the rough ER at the point of it nearest the net */
    const sizes = {}; nodes.forEach((_, i) => { const r0 = find(i); sizes[r0] = (sizes[r0] || 0) + 1; });
    const main = +Object.keys(sizes).sort((a, b) => sizes[b] - sizes[a])[0];
    const keepE = edges.filter(([a]) => find(a) === main);
    const lowest = nodes.map((p, i) => [p, i]).filter(([, i]) => find(i) === main).sort((a, b) => a[0].y - b[0].y)[0];
    const sheet = rerSheets[rerSheets.length - 1].attributes.position, v = new THREE.Vector3();
    let anchor = null, best = 1e9;
    for (let i = 0; i < sheet.count; i++) { v.fromBufferAttribute(sheet, i); const d = v.distanceTo(lowest[0]); if (d < best && segClear(v, lowest[0], true)) { best = d; anchor = v.clone(); } }
    const curves = keepE.map(([a, b]) => {
      const A = nodes[a], B = nodes[b], ab = B.clone().sub(A), side = new THREE.Vector3(rs(-1, 1), rs(-1, 1), rs(-1, 1));
      side.addScaledVector(ab, -side.dot(ab) / ab.lengthSq()).normalize();
      return new THREE.CatmullRomCurve3([A.clone(), A.clone().lerp(B, 0.5).addScaledVector(side, rs(0.03, 0.08)), B.clone()]);
    });
    if (anchor && best < 2.5) curves.push(new THREE.CatmullRomCurve3([anchor, anchor.clone().lerp(lowest[0], 0.5).add(new THREE.Vector3(0, 0.05, 0)), lowest[0].clone()]));
    const tubes = curves.map(c => new THREE.TubeGeometry(c, Math.max(6, Math.ceil(c.getLength() / 0.06)), TUBE, 6, false));
    const net = new THREE.Mesh(mergeGeometries(tubes), serMat); net.name = 'ser-net'; ser.add(net);
    tubes.forEach(g => g.dispose());
    const joinAt = nodes.filter((_, i) => find(i) === main && deg[i] > 0).concat(anchor && best < 2.5 ? [anchor] : []);
    ser.add(instanced(new THREE.SphereGeometry(TUBE * 1.4, 10, 8), serMat, joinAt.map(p => ({ p, s: 1 })), 'ser-joins'));
    W.ser = { curves, start: anchor || lowest[0], joins: joinAt, length: curves.reduce((t, c) => t + c.getLength(), 0) };
  }

  /* ---------- the top of the cell: microvilli into the lumen, and the lumen leading into the duct ---------- */
  const apex = add('apex', new THREE.Group());
  const mvList = [];
  /* the height of the top of the cell at a distance r from its middle */
  const topY = (r) => { for (let y = CELL.H; y > 14; y -= 0.02) if (rAt(y) * CELL.ax >= r) return y; return 14; };
  for (let i = 0; i < 34; i++) {
    const a = rr(0, 6.283), r = Math.sqrt(R()) * 1.75, p = new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r * 0.85);
    p.y = topY(Math.hypot(p.x, p.z / 0.85)) - 0.08;
    mvList.push({ p: p.clone().add(new THREE.Vector3(0, 0.24, 0)), s: 1, q: qAlong(new THREE.Vector3(p.x * 0.25, 1, p.z * 0.25)) });
  }
  apex.add(instanced(new THREE.CapsuleGeometry(0.045, 0.26, 4, 8), magicStandard({ color: 0xbfefff, transparent: true, opacity: 0.85, roughness: 0.2 }, { rim: 0xe8fbff, rimK: 1.2 }), mvList, 'microvilli'));
  const lumenPath = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 16.45, 0), new THREE.Vector3(0, 17.4, -0.3), new THREE.Vector3(0.4, 18.4, -3.5), new THREE.Vector3(1.6, 19.4, -9), new THREE.Vector3(3.4, 20.2, -17)]);
  const lumen = new THREE.Mesh(new THREE.TubeGeometry(lumenPath, 120, 0.85, 24, false), magicStandard({ color: PAL.lumen, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, roughness: 0.2 }, { rim: 0xc8fff2, rimK: 0.9 }));
  lumen.renderOrder = 2; apex.add(lumen);
  const saliva = sparkles({ count: 220, size: 0.07, color: 0xc8fff0, drift: 0.05, sample: (v, i) => { const p = lumenPath.getPointAt((i / 220)); v.set(p.x + rr(-0.5, 0.5), p.y + rr(-0.5, 0.5), p.z + rr(-0.5, 0.5)); } });
  apex.add(saliva);
  W.lumen = { path: lumenPath, saliva };

  /* ---------- light: a soft beam falling from the top of the cell, and light rippling over its floor ---------- */
  const beamGeo = new THREE.CylinderGeometry(1.4, 6.0, 14.5, 48, 1, true); beamGeo.translate(0, 8.4, -0.4);
  const beam = new THREE.Mesh(beamGeo, new THREE.ShaderMaterial({
    uniforms: { uTime: CUT.uTime }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uTime; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        float face = pow(abs(dot(vN, vV)), 1.6);
        float streak = 0.55 + 0.45 * sin(vUv.x * 40.0 + uTime * 0.35) * sin(vUv.x * 17.0 - uTime * 0.2);
        float a = face * streak * smoothstep(0.0, 0.55, vUv.y) * smoothstep(1.0, 0.8, vUv.y) * 0.04;
        gl_FragColor = vec4(vec3(1.0, 0.93, 0.75) * a, a);
      }`
  }));
  beam.renderOrder = 7; add('beam', beam);
  const floorGeo = new THREE.CircleGeometry(1, 96); floorGeo.rotateX(-Math.PI / 2); floorGeo.scale(CELL.ax * 0.86, 1, CELL.az * 0.86); floorGeo.translate(0, 0.06, 0);
  const ripples = new THREE.Mesh(floorGeo, new THREE.ShaderMaterial({
    uniforms: { uTime: CUT.uTime }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uTime; varying vec3 vP;
      float c(vec2 p) { return sin(p.x * 1.7 + uTime * 0.5) + sin(p.y * 1.9 - uTime * 0.4) + sin((p.x + p.y) * 1.3 + uTime * 0.3); }
      void main() {
        vec2 p = vP.xz;
        float k = pow(0.5 + 0.5 * sin(c(p) * 1.6), 5.0);
        float edge = 1.0 - smoothstep(0.6, 1.0, length(vec2(p.x / ${(CELL.ax * 0.86).toFixed(2)}, p.y / ${(CELL.az * 0.86).toFixed(2)})));
        float a = k * edge * 0.16;
        gl_FragColor = vec4(vec3(0.55, 1.0, 0.92) * a, a);
      }`
  }));
  ripples.renderOrder = 3; add('ripples', ripples);

  /* ---------- the cytosol: it is crowded (about 3 million protein molecules in each µm³; Milo 2013) ---------- */
  const motes = sparkles({ count: 2600, size: 0.06, colors: [0x9ff3ff, 0xc7f9ff, 0xfff1c2, 0xd6c9ff], drift: 0.08, opacity: 0.55, sample: (v) => { for (let k = 0; k < 40; k++) { v.set(rr(-7, 7), rr(0.4, 16), rr(-6, 6)); if (inside(v, 0.25)) return; } v.set(0, 8, -1); } });
  add('cytosol', motes);
  /* golden dust that rises slowly round the cell, and far soft clouds of light (the world beyond the acinus) */
  const dust = sparkles({ count: 260, size: 0.16, colors: [0xffe6a0, 0xfff4d0, 0xffd27a], drift: 0.35, opacity: 0.8, sample: (v) => { const a = rr(0, 6.283), r = rr(7.5, 14); v.set(Math.cos(a) * r, rr(-2, 20), Math.sin(a) * r * 0.7 - 2); } });
  W.anim.push((t) => { dust.position.y = ((t * 0.25) % 6) - 3; });
  add('dust', dust);
  const nebula = sparkles({ count: 34, size: 34, colors: [0x5a3fb0, 0x1f7f8f, 0x8a3f9a, 0x2a4fb0], drift: 1.5, twinkle: 0.25, opacity: 0.22, sample: (v) => { const a = rr(Math.PI * 0.9, Math.PI * 2.1), r = rr(85, 130); v.set(Math.cos(a) * r, rr(-30, 50), Math.sin(a) * r); } });
  add('nebula', nebula);
  /* far light in the tissue round the acinus */
  const far = sparkles({ count: 700, size: 0.5, colors: [0x6f5bd8, 0x2fb39a, 0x3a7fd0, 0xf0b43a], drift: 0.3, opacity: 0.35, sample: (v) => { const u = rr(-1, 1), a = rr(0, 6.283), s = Math.sqrt(1 - u * u), r = rr(30, 70); v.set(s * Math.cos(a) * r, 10 + u * r * 0.6, s * Math.sin(a) * r); } });
  add('far', far);

  return W;
}

/* ============================================================ the places of the game ============================================================
   Each place: where it is (center), what you can press (hit), the camera's view when you are there (view: pos, at),
   points on it where its name may stand (spots, several, so names never cross), its mist, and the groups that sleep.
   The mitochondrion's spots run its whole length, both edges: on a phone it lies small among other names, and spots
   close together all lose at once (its name had been left out at 390 px). */
export function places(W) {
  const N0 = W.nucleus.center, G0 = W.golgi.center;
  const hero = W.mito.hero.position;
  const ptsOf = (arr) => arr.map(p => p.clone ? p.clone() : new THREE.Vector3(...p));
  const nucSpots = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; nucSpots.push(N0.clone().add(new THREE.Vector3(Math.cos(a) * 2.9, Math.sin(a) * 2.6 * 0.95, 0.9))); }
  const rerSpots = W.rer.sheets.length ? surfacePoints(W.rer.sheets[5], 40, rng(7)).map(o => o.p).filter(p => p.z > -0.5) : [];
  const serSpots = W.ser.curves.flatMap(c => c.getPoints(6));
  const golgiSpots = []; for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; golgiSpots.push(G0.clone().add(new THREE.Vector3(Math.cos(a) * 1.8, 0.4 + (i % 3) * 0.3, Math.sin(a) * 1.3))); }
  const trackSpots = W.tracks.slice(0, 12).flatMap(t => [t.curve.getPointAt(0.3), t.curve.getPointAt(0.5), t.curve.getPointAt(0.7)]);
  const exitSpots = W.granules.filter(g => g.p.y > 13).map(g => g.p.clone());
  const wayInSpots = []; for (let i = 0; i < 16; i++) wayInSpots.push(new THREE.Vector3(-3.8 + (i % 8) * 0.7, 0.15, -1.6 + Math.floor(i / 8) * 0.9));
  /* free ribosomes, and the ribosomes on the rough ER (they are ribosomes too): more rows for the name */
  const riboSpots = W.freeRibosomes.filter((f, i) => i % 6 === 0 && f.p.z > -1.5).slice(0, 60).map(f => f.p.clone())
    .concat(W.rer.ribosomes.filter((f, i) => i % 40 === 0 && f.p.z > 0.5).map(f => f.p.clone()));
  const P = {
    wayin:    { name: 'Cell membrane: the way in', center: new THREE.Vector3(-1.0, 0.25, -0.9), hit: 2.4, spots: wayInSpots, view: VIEWS.wayin, mist: 2.8, groups: ['blood'] },
    nucleus:  { name: 'Nucleus', center: N0.clone(), hit: 3.1, spots: nucSpots, view: VIEWS.nucleus, mist: 3.6, groups: ['nucleus'] },
    nucleolus:{ name: 'Nucleolus', center: N0.clone().add(new THREE.Vector3(0.55, 0.55, 0.8)), hit: 1.0, spots: [N0.clone().add(new THREE.Vector3(0.55, 1.2, 0.95)), N0.clone().add(new THREE.Vector3(1.2, 0.55, 1.0)), N0.clone().add(new THREE.Vector3(-0.1, 0.55, 1.1))], view: VIEWS.nucleolus, mist: 1.2, groups: [] },
    mito:     { name: 'Mitochondria', center: hero.clone(), hit: 1.6, spots: [0.08, 0.25, 0.5, 0.75, 0.92].flatMap(k => [1, -1].map(sd => W.mito.hero.localToWorld(heroPoint(W.mito.spec, W.mito.spec.total * k, sd * along(W.mito.spec, W.mito.spec.total * k).r * 0.98, 0.02)))), view: VIEWS.mito, mist: 2.2, groups: ['mitochondria'] },
    ribosome: { name: 'Ribosomes', center: new THREE.Vector3(-2.6, 7.6, 2.4), hit: 1.6, spots: riboSpots.length ? riboSpots : [new THREE.Vector3(-2.6, 7.6, 2.4)], view: VIEWS.ribosome, mist: 1.9, groups: ['free-ribosomes'] },
    rer:      { name: 'Rough ER', center: new THREE.Vector3(-3.8, 3.6, 0.9), hit: 2.4, spots: rerSpots, view: VIEWS.rer, mist: 3.0, groups: ['rer'] },
    ser:      { name: 'Smooth ER', center: new THREE.Vector3(-4.6, 7.9, -0.1), hit: 1.8, spots: serSpots, view: VIEWS.ser, mist: 2.2, groups: ['ser'] },
    golgi:    { name: 'Golgi apparatus', center: G0.clone().add(new THREE.Vector3(0, 0.6, 0)), hit: 2.2, spots: golgiSpots, view: VIEWS.golgi, mist: 2.6, groups: ['golgi'] },
    tracks:   { name: 'Microtubules', center: new THREE.Vector3(1.8, 11.6, 0.4), hit: 2.0, spots: trackSpots, view: VIEWS.tracks, mist: 2.4, groups: ['microtubules'] },
    exit:     { name: 'Cell membrane: the way out', center: new THREE.Vector3(0, 15.4, 0), hit: 2.0, spots: exitSpots, view: VIEWS.exit, mist: 2.4, groups: ['granules', 'apex'] }
  };
  Object.keys(P).forEach(k => { P[k].id = k; P[k].spots = ptsOf(P[k].spots); });
  return P;
}
