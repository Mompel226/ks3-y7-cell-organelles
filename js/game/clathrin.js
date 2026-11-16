/* ============================================================
   clathrin.js — endocytosis at the way out (16 Nov 2026): a clathrin-coated pit on the inner face of the cell membrane
   that deepens, closes and leaves as a coated vesicle, at true size beside the vesicle of amylase (play.js flatten).
   Geometry only (no game here): play.js places it in the way out's close-up frame and moves it.

   SIZES (nm), from what was read:
   - Heuser J (1980), Three-dimensional visualization of coated vesicle formation in fibroblasts, J Cell Biol 84:560
     (doi:10.1083/jcb.84.3.560): the coat under the membrane is a network of 7-nm strands in 30-nm polygons, mostly
     hexagons, with pentagons as it curves; coated pits about 190–220 nm across before they curve; "a basketwork 200 nm
     in diameter would ball up into a coated vesicle 100 nm in diameter, which would be typical"; the coat stands about
     20 nm from the membrane on all sides, so a 100-nm coated vesicle holds a membrane vesicle about 60 nm across.
   - Paraan M et al. (2020), The structures of natively assembled clathrin-coated vesicles, Science Advances 6:eaba8397
     (doi:10.1126/sciadv.aba8397, CC BY): a closed cage has 12 pentagons (and rarely heptagons), the rest hexagons; the
     vesicles inside coats are 22 to 55 nm across.
   So: the membrane vesicle 60 nm across (its outer face R_MEM = 30 nm), the coat's strands at R_CAGE = 44 nm from its
   middle, 7 nm thick (3.5 nm radius), their joins (where the three legs of one clathrin molecule meet) 9 nm across: the
   coated vesicle about 97 nm across. The cage is the closed polyhedron of 12 pentagons and 30 hexagons (each face of an
   icosahedron cut into four; its 80 joins are the faces' middles): at 44 nm its polygons are 30 nm across, Heuser's size.
   SIMPLIFIED: the coat grows at its final curvature as the pit deepens (Heuser saw flat lattices that curve; both are
   argued); the adaptor proteins between coat and membrane, and the protein that pinches the neck, are not drawn; the
   membrane of the pit is drawn as its surface that faces the cytoplasm.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';

export const CLATH = { R_MEM: 30, R_CAGE: 44, STRUT: 3.5, JOIN: 4.5, UNDER: -3 };   /* nm; UNDER: the membrane's inner face (its middle at 0) */

/* the cage: 80 joins (unit vectors) and 120 strands (pairs of joins), one icosahedron vertex at the bottom (-y) */
function cage() {
  const t = (1 + Math.sqrt(5)) / 2;
  let V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(v => new THREE.Vector3(...v).normalize());
  const F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  /* turn it so that vertex 2 points straight down */
  const q = new THREE.Quaternion().setFromUnitVectors(V[2].clone(), new THREE.Vector3(0, -1, 0)); V = V.map(v => v.applyQuaternion(q));
  /* each triangle cut into four (the new points on the sphere) */
  const mid = new Map(), pts = V.slice(), tri = [];
  const m = (a, b) => { const k = a < b ? a + '_' + b : b + '_' + a; if (!mid.has(k)) { mid.set(k, pts.length); pts.push(pts[a].clone().add(pts[b]).normalize()); } return mid.get(k); };
  F.forEach(([a, b, c]) => { const ab = m(a, b), bc = m(b, c), ca = m(c, a); tri.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); });
  /* the cage's joins are the triangles' middles; two joins are joined by a strand where their triangles share a side */
  const joins = tri.map(([a, b, c]) => pts[a].clone().add(pts[b]).add(pts[c]).normalize());
  const side = new Map(), struts = [];
  tri.forEach((T, i) => [[T[0], T[1]], [T[1], T[2]], [T[2], T[0]]].forEach(([a, b]) => { const k = a < b ? a + '_' + b : b + '_' + a; if (side.has(k)) struts.push([side.get(k), i]); else side.set(k, i); }));
  return { joins, struts };
}
const CAGE = cage();

/* a pit: { g (its group: place it at the pit's place, in µm, x across, y up out of the cell, z towards the camera),
   set({ depth, neck, drop, dx }), centre() (the coated vesicle's middle, µm, in g), parts: { mem, struts, joins } }.
   depth 0 to 1: a shallow dip to a ball under the membrane on a short neck; neck 1 to 0: the neck closes; drop 0 to 1: the
   coated vesicle goes 220 nm into the cell (and dx nm sideways). mats: { mem, coat } */
export function makePit(mats) {
  const C = CLATH, g = new THREE.Group(); g.userData.kind = 'coated-pit';
  /* the membrane: a surface of turning (a neck, then a sphere), NS around, NP down */
  const NS = 36, NN = 4, NA = 26, NP = NN + NA, pos = new Float32Array(NP * (NS + 1) * 3), nor = new Float32Array(NP * (NS + 1) * 3), idx = [];
  for (let i = 0; i < NP - 1; i++) for (let j = 0; j < NS; j++) { const a = i * (NS + 1) + j, b = a + NS + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setIndex(idx);
  const mem = new THREE.Mesh(geo, mats.mem); mem.frustumCulled = false; mem.userData.kind = 'pit-membrane'; g.add(mem);
  /* the coat: its strands and its joins (instances; a strand or a join that would stand in the membrane is not drawn) */
  const cg = new THREE.Group(); g.add(cg);
  /* (the shapes at their true size, a strand 1 nm long, stretched: a shape 1 µm across, scaled down, had made the names
     keep away from a 2-µm ellipse round each pit: names.js solids reads a mesh's own points) */
  const struts = new THREE.InstancedMesh(new THREE.CylinderGeometry(C.STRUT / 1000, C.STRUT / 1000, 0.001, 8, 1, false), mats.coat, CAGE.struts.length);
  const joins = new THREE.InstancedMesh(new THREE.SphereGeometry(C.JOIN / 1000, 12, 9), mats.coat, CAGE.joins.length);
  struts.frustumCulled = joins.frustumCulled = false; struts.userData.kind = joins.userData.kind = 'clathrin'; cg.add(struts, joins);
  /* the coat as the names see it (a part no name may cover: play.js closeNames solid): a mesh drawn with no colour and
     no depth whose points are the joins now drawn, so its ellipse is the coat's own */
  const hullPos = new Float32Array(CAGE.joins.length * 3), hullGeo = new THREE.BufferGeometry(); hullGeo.setAttribute('position', new THREE.BufferAttribute(hullPos, 3));
  const hull = new THREE.Mesh(hullGeo, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })); hull.frustumCulled = false; hull.userData.kind = 'coat-outline'; g.add(hull);
  const M = new THREE.Matrix4(), Z = new THREE.Matrix4().makeScale(0, 0, 0), p = new THREE.Vector3(), d = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  const st = { yc: 0, x: 0, open: true };
  function prof(i, yc, rn) {
    /* point i of the outline: [r, y, nr, ny] (nm), from the membrane's inner face down to the bottom. While the sphere
       meets the face in a circle at least as wide as the neck: the part of the sphere under the face. Then: a neck of
       radius rn from the face down to the sphere, then the sphere (no neck once it has closed). The two meet where the
       circle is as wide as the neck, so the outline never jumps */
    const R = C.R_MEM, U = C.UNDER, h = U - yc, ra = Math.abs(h) < R ? Math.sqrt(R * R - h * h) : 0, wide = Math.abs(h) < R && ra >= rn && rn > 0;
    const top = wide ? Math.acos(Math.max(-1, Math.min(1, h / R))) : rn > 0 ? Math.asin(Math.min(1, rn / R)) : 0;
    if (i < NN) {
      if (wide || rn <= 0) { const s = Math.sin(top), c = Math.cos(top); return [R * s, yc + R * c, s, c]; }
      const yj = yc + Math.sqrt(Math.max(0, R * R - rn * rn)), k = i / (NN - 1);
      return [rn, U + (yj - U) * k, 1, 0];
    }
    const ph = top + (Math.PI - top) * (i - NN) / (NA - 1), s = Math.sin(ph), c = Math.cos(ph);
    return [R * s, yc + R * c, s, c];
  }
  function set({ depth = 0, neck = 1, drop = 0, dx = 0 }) {
    const e = depth * depth * (3 - 2 * depth), U = C.UNDER, R = C.R_MEM;
    let yc = (U + 0.55 * R) + ((U - R - 5) - (U + 0.55 * R)) * e;
    const rn = 12 * Math.max(0, Math.min(1, neck));      /* the neck: 12 nm wide, then closing */
    const open = neck > 0.001 && drop <= 0;
    if (!open) yc -= 220 * drop;
    const x = dx * drop;
    for (let i = 0; i < NP; i++) {
      const [r, y, nr, ny] = prof(i, yc, open ? rn : 0);
      for (let j = 0; j <= NS; j++) {
        const a = j / NS * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), o = (i * (NS + 1) + j) * 3;
        pos[o] = (x + r * c) / 1000; pos[o + 1] = y / 1000; pos[o + 2] = r * s / 1000;
        nor[o] = nr * c; nor[o + 1] = ny; nor[o + 2] = nr * s;
      }
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true; geo.computeBoundingSphere();
    /* the coat: only where it stands under the membrane's inner face (1 nm clear of it) */
    const lim = U - 1;
    CAGE.struts.forEach(([a, b], k) => {
      const A = CAGE.joins[a], B = CAGE.joins[b], ya = yc + A.y * C.R_CAGE, yb = yc + B.y * C.R_CAGE;
      if (Math.max(ya, yb) + C.STRUT > lim) { struts.setMatrixAt(k, Z); return; }
      p.set(x + (A.x + B.x) / 2 * C.R_CAGE, (ya + yb) / 2, (A.z + B.z) / 2 * C.R_CAGE).multiplyScalar(1 / 1000);
      d.copy(B).sub(A); const len = d.length() * C.R_CAGE; d.normalize();
      Q.setFromUnitVectors(UP, d); S.set(1, len, 1);
      struts.setMatrixAt(k, M.compose(p, Q, S));
    });
    let first = -1;
    CAGE.joins.forEach((A, k) => {
      const y = yc + A.y * C.R_CAGE;
      if (y + C.JOIN > lim) { joins.setMatrixAt(k, Z); hullPos[3 * k] = NaN; return; }
      joins.setMatrixAt(k, M.compose(p.set((x + A.x * C.R_CAGE) / 1000, y / 1000, A.z * C.R_CAGE / 1000), Q.identity(), S.setScalar(1)));
      hullPos[3 * k] = p.x; hullPos[3 * k + 1] = p.y; hullPos[3 * k + 2] = p.z; if (first < 0) first = k;
    });
    /* (a join not drawn: its point is a drawn one's, so the outline is the drawn coat's) */
    for (let k = 0; k < CAGE.joins.length; k++) if (Number.isNaN(hullPos[3 * k])) { hullPos[3 * k] = hullPos[3 * first]; hullPos[3 * k + 1] = hullPos[3 * first + 1]; hullPos[3 * k + 2] = hullPos[3 * first + 2]; }
    hullGeo.attributes.position.needsUpdate = true;
    struts.instanceMatrix.needsUpdate = joins.instanceMatrix.needsUpdate = true;
    st.yc = yc; st.x = x; st.open = open;
  }
  /* the coated vesicle's middle and how far its coat reaches (µm, in g); how many strands are drawn */
  const centre = (out = new THREE.Vector3()) => out.set(st.x / 1000, st.yc / 1000, 0);
  const shown = () => { let n = 0; for (let k = 0; k < CAGE.struts.length; k++) { struts.getMatrixAt(k, M); if (M.elements[0] !== 0 || M.elements[1] !== 0 || M.elements[2] !== 0) n++; } return n; };
  set({});
  return { g, set, centre, shown, st, hull, parts: { mem, struts, joins }, reach: (C.R_CAGE + C.JOIN) / 1000, total: CAGE.struts.length };
}
/* for a check: the cage's faces (12 pentagons, 30 hexagons) */
export function cageFaces() {
  const n = new Map(); CAGE.struts.forEach(([a, b]) => { n.set(a, (n.get(a) || 0) + 1); n.set(b, (n.get(b) || 0) + 1); });
  return { joins: CAGE.joins.length, struts: CAGE.struts.length, faces: CAGE.struts.length - CAGE.joins.length + 2, threeLegged: [...n.values()].every(k => k === 3) };
}
