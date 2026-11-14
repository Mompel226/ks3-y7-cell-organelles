/* ============================================================
   crowd.js — "As it really is" (11 Nov 2026): the close view of the ribosome place and of the rough ER packed with what
   is really there, every molecule at its true size. Daniel, 11 Nov 2026: "if you're looking at something in the middle
   of nowhere, it feels like the cell is empty … you can have a toggle saying, this is to simplify, and then you click a
   toggle, and this is how it looks in reality … you'll be fixed in an area, and then you can pack it with all of the
   things that are inside the cell … do not overload the system"; then: "make sure the particles you draw for the busy
   representation make sense in terms of size relative to each other and structure/length/3d representation".
   What is drawn, in a thin slice behind the story's own molecules (14 nm deep, about one large protein, cut where the
   membrane of the rough ER is cut, like a slice for the electron microscope, so that nothing stands between the camera and
   the story). Thin, so that the water between the molecules shows over about half of the picture, as a volume 20–30 %
   full looks in a slice (the expert review, 11 Nov 2026: a slice 45 nm deep, seen flat, covered the whole picture, against
   the note's numbers; Goodsell's slices, The Machinery of Life, 2009, are as thin). Each kind at its true size and in its
   true shape, drawn as the story draws the same thing (SIZES below; tools/real-view.mjs measures every shape against it):
   - proteins: folded lumps like the story's own protein (actors.js 'protein', a sphere made uneven), one, two or three
     together (many proteins are made of several chains); most about 5 nm across, a few small, a few large (a protein of
     50 kDa is about 4.9 nm across; 10 kDa about 2.8 nm; 300 kDa about 9 nm: Erickson 2009, Biological Procedures Online
     11:32, R = 0.066 M^1/3 nm); they fill 18 % of the slice (large molecules fill 20–30 % of a cell's volume: Ellis 2001,
     Trends in Biochemical Sciences 26:597; the ribosomes, carriers and mRNA the rest);
   - ribosomes: the story's own ribosome (its large and small parts, 30 nm across; actors.js token); on the membrane of the
     rough ER each sits, large part down, on a channel (the story's channel: a protein through the membrane, about 7 nm),
     its chain going through it into the rough ER, and the ribosomes in a row on one copy of a gene (an mRNA, 2 nm thick,
     the story's copy: a polysome; ribosomes on one mRNA as close as about one ribosome apart); a few free in the cytosol
     (about 2 100 in every µm³ of a HeLa cell: 553 130 counted in 7.5 × 4.6 × 7.5 µm, OpenOrganelle jrc_hela-2; Xu et al.
     2021, Nature 599:147), each on its own copy;
   - carriers (transfer RNA): an L, each arm about 7 nm long and 2 nm thick (Kim et al. 1974, Science 185:435), its
     amino acid (about 1 nm, the story's) at the end of one arm, in the colours of the story's carriers; about ten for
     every ribosome (bacteria: Dong, Nilsson and Kurland 1996, Journal of Molecular Biology 260:649);
   - proteins in the membrane (about half of a membrane's mass: Alberts et al., Molecular Biology of the Cell, chapter 10):
     upright through the membrane (6 nm), standing 1 to 2 nm out of it on each side, some in its cut face;
   - inside the rough ER, its own proteins and the ones it is folding, packed too (a little less than the cytosol).
   Water, ions and small molecules (glucose, amino acids, ATP) fill the rest: far too many and too small to draw.
   Every shape is placed where it fits: no two touch, none in the membrane but the membrane's own, none on the story's
   molecules (clear: points and radii in nm, from play.js). Built when the switch is pressed and removed when it is
   switched off: one InstancedMesh per shape and one mesh of threads (ten draw calls), nothing moving (a still picture is
   not drawn again).
   The frame (F): o, the point of the membrane where a ribosome docks; right, across the picture; up, out of the membrane
   into the cytosol; back, towards the camera. Positions in nm, the meshes scaled to µm.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { riboPart } from '../game/actors.js?v=202611141500';

/* the true sizes (nm) that each shape is drawn at, and that tools/real-view.mjs measures: [smallest, largest] */
export const SIZES = { ribosome: [27, 33], carrierBox: [6.8, 8.8], carrierThick: [1.8, 2.6], protein: [2.5, 12], proteinMedian: [4.2, 6.2],
  channel: [6.5, 8], tmOut: [0.5, 2.6], bead: [0.9, 1.3], thread: [1.8, 2.2] };

/* its own random numbers (the world's seeded ones are never touched), the same crowd each time */
const rng = seed => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

/* geometries joined into one (all without an index) */
function merge(geos) {
  let n = 0; geos.forEach(g => { n += g.attributes.position.count; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
  geos.forEach(g => {
    const c = g.userData.col || [1, 1, 1], k = g.attributes.position.count;
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
    for (let i = 0; i < k; i++) col.set(c, (o + i) * 3);
    o += k; g.dispose();
  });
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); m.setAttribute('color', new THREE.BufferAttribute(col, 3));
  m.computeBoundingBox(); m.computeBoundingSphere(); return m;
}
const col3 = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const ball = (x, y, z, r, detail = 1, sx = 1, sy = 1, sz = 1, col) => { const g = new THREE.IcosahedronGeometry(r, detail); g.scale(sx, sy, sz); g.translate(x, y, z); if (col) g.userData.col = col; return g; };
/* a folded protein's lump, as the story draws one (actors.js 'protein': a sphere made uneven, a little flattened), its
   shading smooth; seed: each lump of a shape a little different */
const lump = (x, y, z, r, seed = 0, sy = 0.92) => {
  const g = new THREE.IcosahedronGeometry(1, 1), p = g.attributes.position, nrm = g.attributes.normal, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize(); nrm.setXYZ(i, v.x, v.y, v.z);
    const k = 1 + 0.16 * Math.sin(v.x * 5 + v.y * 2 + seed) * Math.sin(v.z * 4 - v.x * 3 + seed * 0.7);
    p.setXYZ(i, x + v.x * r * k, y + v.y * r * k * sy, z + v.z * r * k);
  }
  return g;
};
const rod = (r, len, axis, x, y, z, col) => { const g = new THREE.CylinderGeometry(r, r, len, 8, 1).toNonIndexed(); if (axis === 'x') g.rotateZ(Math.PI / 2); g.translate(x, y, z); if (col) g.userData.col = col; return g; };

/* the shapes (nm, or about 1 across for the proteins, scaled by their radius) */
const TEAL = col3(0x5fe0d0);   /* the story's channel (play.js membrane) */
const SHAPES = {
  one: () => merge([lump(0, 0, 0, 1, 0)]),
  oneB: () => merge([lump(0, 0, 0, 1, 2.3, 0.8)]),
  two: () => merge([lump(-0.42, 0, 0, 0.62, 0.5), lump(0.45, 0.06, 0, 0.56, 1.3)]),
  three: () => merge([0, 1, 2].map(i => lump(0.48 * Math.cos(i * 2.1), 0.48 * Math.sin(i * 2.1), (i - 1) * 0.12, 0.55, i * 1.7))),
  /* the story's ribosome: its large part at +y, its small part at −y, each an uneven lump (actors.js riboPart, the token at
     15.4 nm) */
  ribosome: () => merge([[riboPart(13.1, 1.15, 0.85, 1.05, -1, 2, 0), 6.47, [0.95, 0.76, 0.38]], [riboPart(9.55, 1.2, 0.7, 1, 1, 2, 1.3), -5.85, [0.93, 0.85, 0.66]]].map(([g0, y, c]) => { const g = g0.toNonIndexed(); g0.dispose(); g.translate(0, y, 0); g.userData.col = c; return g; })),
  /* transfer RNA: an L, two arms 7 nm long and 2.2 nm thick meeting at a corner, the amino acid (1.1 nm) at the end of the
     arm that carries it */
  carrier: () => merge([rod(1.1, 7, 'y', 0, -2.4, 0), rod(1.1, 7, 'x', 2.4, 1.0, 0), ball(5.9, 1.0, 0, 1.1, 1), ball(6.75, 1.0, 0, 0.55, 1)]),
  /* a protein through the membrane: upright, its middle in the membrane, its ends out of it (scaled by its radius) */
  tm: () => merge([lump(0, 0, 0, 1, 0.9, 1.65)]),
  /* the channel under a ribosome on the membrane: the story's (play.js membrane: 7.2 nm across, through the whole membrane) */
  channel: () => { const g = new THREE.BoxGeometry(7.2, 7.2, 6).toNonIndexed(); g.userData.col = TEAL; return merge([g]); },
  /* an amino acid of a chain (the story's, 1.1 nm) */
  bead: () => merge([ball(0, 0, 0, 0.55, 1)])
};

const hex = s => new THREE.Color(s);
const PAL = {
  cyto: ['#8ea2d8', '#9d92d6', '#7fb0c9', '#a5b2cc', '#b49cd0', '#8fbfb3', '#a7a0d8', '#9fc4a0', '#c4a7c9', '#88b8d0', '#b8b8d8', '#a0c8c0'].map(hex),
  lumen: ['#d9a3b8', '#c99ac4', '#e0b0a8', '#cfa0b0', '#d6b0c8'].map(hex),
  memb: ['#5fb8ad', '#6cc4b8', '#57a89f', '#7ccfb2'].map(hex),
  /* the story's carriers' colours (actors.js AMINO_COLORS), a little paler */
  carrier: [0x5bc8a8, 0x7fa8ff, 0xf2a65a, 0xe36fb0].map(c => new THREE.Color(c).lerp(new THREE.Color(0xffffff), 0.25)),
  amino: [0x5bc8a8, 0x7fa8ff, 0xf2a65a, 0xe36fb0].map(c => new THREE.Color(c)),
  white: [hex('#ffffff')]
};

/* the slice (nm): across, up (the cytosol above the membrane, inside the rough ER below), and its depth behind the cut */
const X0 = 185, YTOP = 135, YBOT = -55, ZB = -14, MEM = 3.4, SEAT = 19.5;

export function buildCrowd(F, clear, { seed = 11, protein = 0.18, lumen = 0.15 } = {}) {
  const R = rng(seed), rr = (a, b) => a + (b - a) * R();
  /* a normal random number (Box–Muller), for the proteins' sizes */
  const gauss = () => Math.sqrt(-2 * Math.log(1 - R())) * Math.cos(6.2832 * R());
  /* what is placed: [x, y, z, r]. Small ones (r up to 5 nm) in a grid of 10 nm cells, so that a new shape is tested
     against its neighbours only; the large ones (ribosomes, the story's own ribosome and vesicle) in a short list */
  const CELL = 10, SM = 5, grid = new Map(), big = [], key = (i, j, k) => ((i + 512) * 1024 + (j + 512)) * 1024 + (k + 512);   /* (a number: faster than a string key) */
  const hits = (q, x, y, z, r) => Math.hypot(q[0] - x, q[1] - y, q[2] - z) < q[3] + r + 0.25;
  const near = (x, y, z, r) => {
    for (const q of big) if (hits(q, x, y, z, r)) return true;
    const n = Math.ceil((r + SM) / CELL), i0 = Math.floor(x / CELL), j0 = Math.floor(y / CELL), k0 = Math.floor(z / CELL);
    for (let i = i0 - n; i <= i0 + n; i++) for (let j = j0 - n; j <= j0 + n; j++) for (let k = k0 - n; k <= k0 + n; k++) {
      const c = grid.get(key(i, j, k)); if (c) for (const q of c) if (hits(q, x, y, z, r)) return true;
    }
    return false;
  };
  const put = q => { if (q[3] > SM) { big.push(q); return; } const k = key(Math.floor(q[0] / CELL), Math.floor(q[1] / CELL), Math.floor(q[2] / CELL)); (grid.get(k) || grid.set(k, []).get(k)).push(q); };
  /* the story's own molecules are kept clear like placed shapes (a little apart: 0.25 nm) */
  clear.forEach(c => put(c.slice()));
  const free = (x, y, z, r) => !near(x, y, z, r);
  /* the shapes of each kind: [x, y, z, r (the scale), colour, turn] */
  const lists = { one: [], oneB: [], two: [], three: [], ribosome: [], carrier: [], tm: [], channel: [], bead: [] };
  const q4 = () => new THREE.Quaternion().setFromEuler(new THREE.Euler(rr(0, 6.28), rr(0, 6.28), rr(0, 6.28)));
  const Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1), X = new THREE.Vector3(1, 0, 0);
  const aboutY = (tilt = 0.14) => new THREE.Quaternion().setFromAxisAngle(Y, rr(0, 6.28)).premultiply(new THREE.Quaternion().setFromAxisAngle(X, rr(-tilt, tilt)));
  const pick = a => a[Math.floor(R() * a.length)];
  const named = { proteins: [], ribosomes: [], carriers: [], lumen: [] };
  const threads = [];   /* the copies (mRNA): lists of points (nm) */
  /* a chain of amino acids (beads 1.15 nm apart, as the story's chain), from p, going d (a direction), wandering a little */
  const chainFrom = (p, d, n) => { const v = p.clone(), dir = d.clone(); for (let i = 0; i < n; i++) {
    v.addScaledVector(dir, 1.15); dir.add(new THREE.Vector3(rr(-0.35, 0.35), rr(-0.25, 0.25), rr(-0.35, 0.35))).normalize();
    if (!free(v.x, v.y, v.z, 0.55)) break; lists.bead.push([v.x, v.y, v.z, 1, pick(PAL.amino), new THREE.Quaternion()]); put([v.x, v.y, v.z, 0.55]); } };

  /* the ribosomes on the membrane first (the largest): in a row behind the slice (a ribosome, 30 nm, is wider than it),
     about 36 nm apart, each on its channel, large part down, its chain into the rough ER; those either side of the story's
     channel (never on it) on one copy each. Each copy runs through its ribosomes' middles, between their two parts, as
     the story's copy does */
  const down = new THREE.Quaternion().setFromAxisAngle(X, Math.PI);
  const rows = { L: [], R: [] };
  for (let x = -X0 + 12; x <= X0 - 12; x += 36) {
    const px = x + rr(-4, 4), pz = -17 + rr(-2, 2), py = SEAT;
    if (Math.abs(px) < 34) continue;
    if (!free(px, py, pz, 15.5)) continue;
    const t = down.clone().multiply(new THREE.Quaternion().setFromAxisAngle(Y, rr(-0.25, 0.25)));
    lists.ribosome.push([px, py, pz, 1, PAL.white[0], t]); put([px, py, pz, 15.5]);
    lists.channel.push([px, 0, pz, 1, PAL.white[0], aboutY(0)]); put([px, 0, pz, 4.2]);
    chainFrom(new THREE.Vector3(px, -3.7, pz), new THREE.Vector3(0, -1, 0), 10);
    (px < 0 ? rows.L : rows.R).push(new THREE.Vector3(px, py, pz));
    if (pz > -25) named.ribosomes.push([px, py, pz]);
  }
  ['L', 'R'].forEach(k => { const r = rows[k].sort((a, b) => a.x - b.x); if (!r.length) return;
    const pts = [r[0].clone().add(new THREE.Vector3(-14, 1.5, 0))];
    r.forEach((p, i) => { pts.push(p.clone()); if (i < r.length - 1) pts.push(p.clone().lerp(r[i + 1], 0.5).add(new THREE.Vector3(0, 1.2, rr(-1, 1)))); });
    pts.push(r[r.length - 1].clone().add(new THREE.Vector3(14, -1.2, 0)));
    threads.push(pts); });
  /* a few free ribosomes in the cytosol (about 2 100 in a µm³: about 2 in a slice 30 nm deep, the depth a ribosome needs),
     each turned in the picture's plane, on its own short copy along its own across (its chain from its large part's top) */
  for (let n = 0, tries = 0; n < 2 && tries < 400; tries++) {
    const x = rr(-X0 + 30, X0 - 30), y = rr(50, YTOP - 18), z = rr(-20, -15), a = rr(0, 6.28);
    const q = new THREE.Quaternion().setFromAxisAngle(Z, a), along = X.clone().applyQuaternion(q), up = Y.clone().applyQuaternion(q);
    const ends = [-24, -12, 12, 24].map(s => new THREE.Vector3(x, y, z).addScaledVector(along, s));
    if (!free(x, y, z, 15.5) || ends.some(e => !free(e.x, e.y, e.z, 1.2))) continue;
    lists.ribosome.push([x, y, z, 1, PAL.white[0], q]); put([x, y, z, 15.5]); n++;
    threads.push([ends[0], ends[1], new THREE.Vector3(x, y, z), ends[2], ends[3]]);
    ends.forEach(e => put([e.x, e.y, e.z, 1.2]));
    chainFrom(new THREE.Vector3(x, y, z).addScaledVector(up, 17), up, 8);
    named.ribosomes.push([x, y, z]);
  }
  /* the copies are kept clear of everything placed after them */
  threads.forEach(pts => new THREE.CatmullRomCurve3(pts).getSpacedPoints(60).forEach(p => put([p.x, p.y, p.z, 1.2])));
  /* proteins in the membrane: about one in every 90 nm² of it (proteins cover about a quarter of a membrane: Dupuy and Engelman 2008, PNAS 105:2848), upright through it, a little tilted, their ends 1 to 2 nm
     out of it; some in its cut face */
  for (let n = 0, want = (2 * X0) * (-ZB) / 90, tries = 0; n < want && tries < want * 6; tries++) {
    const x = rr(-X0, X0), z = rr(ZB + 3, -1), r = rr(2.3, 3.0);
    if (!free(x, 0, z, r * 1.65)) continue;
    lists.tm.push([x, rr(-0.4, 0.4), z, r, pick(PAL.memb), aboutY()]); put([x, 0, z, r * 1.3]); n++;
  }
  /* carriers: an L of two 7 nm arms (its widest radius about 5 nm), about ten for every ribosome in the slice */
  for (let n = 0, tries = 0; n < 24 && tries < 3000; tries++) {
    const x = rr(-X0, X0), y = rr(MEM + 6, YTOP - 6), z = rr(ZB + 5, -5);
    if (!free(x, y, z, 5)) continue;
    /* (near the middle and at the front, some turned face on, and only those named: an L seen edge on reads as a stick) */
    const face = z > -12 && Math.abs(x) < 80 && named.carriers.length < 6;
    lists.carrier.push([x, y, z, 1, pick(PAL.carrier), face ? new THREE.Quaternion().setFromAxisAngle(Z, rr(0, 6.28)) : q4()]); put([x, y, z, 5]); n++;
    if (face) named.carriers.push([x, y, z]);
  }
  /* proteins, until they fill their share of the space: radius about 2.45 nm in the middle (a protein of about 50 kDa),
     most between 1.7 and 3.6 nm, none under 1.5 or over 5. The sizes are drawn first, then placed largest first (placed
     as they come, the large ones found no room once the slice filled and small ones took the gaps: the middle size fell to
     3.7 nm across, tools/real-view.mjs) */
  const fill = (y0, y1, share, pal, list) => {
    const vol = (2 * X0) * (y1 - y0) * (-ZB), want = []; let v = 0, got = 0;
    while (v < vol * share * 1.5) {   /* (more than are needed: some find no room, and part of some lies behind the slice) */
      const r = Math.min(5, Math.max(1.5, 2.45 * Math.exp(0.36 * gauss()))), shape = r < 2.2 ? pick(['one', 'oneB']) : pick(['one', 'oneB', 'two', 'three']), k = shape === 'two' ? 0.62 : shape === 'three' ? 0.6 : 1;
      want.push([r, shape]); v += 4.19 * Math.pow(r, 3) * k;
    }
    want.sort((a, b) => b[0] - a[0]);
    for (const [r, shape] of want) for (let t = 0; t < 60 && got < vol * share; t++) {
      /* (rc: a lump's bumps reach 16 % beyond its radius; its middle in the slice, the back of a large one may reach behind
         it, as a slice cuts through what lies across its back face, never across its front) */
      const rc = r * 1.17, x = rr(-X0, X0), y = rr(y0 + rc, y1 - rc), z = rr(ZB, -rc);
      if (!free(x, y, z, rc)) continue;
      lists[shape].push([x, y, z, r, pick(pal).clone().multiplyScalar(rr(0.88, 1.08)), q4()]); put([x, y, z, rc]);
      if (list) list.push([x, y, z, r]);
      const h = Math.max(0, ZB - (z - r)), cap = Math.PI * h * h * (3 * r - h) / 3;   /* (only the part in the slice counts) */
      got += (4.19 * Math.pow(r, 3) - cap) * (shape === 'two' ? 0.62 : shape === 'three' ? 0.6 : 1);
      break;
    }
    return got / vol;   /* the share of the slice its proteins fill */
  };
  const cyto = [], lum = [];
  const filled = { cytosol: fill(MEM, YTOP, protein, PAL.cyto, cyto), lumen: fill(YBOT, -MEM, lumen, PAL.lumen, lum) };
  named.proteins = cyto.filter(q => q[2] + q[3] > -3 && q[3] > 2.8 && q[1] > 40 && Math.abs(q[0]) < 70).slice(0, 10);
  named.lumen = lum.filter(q => q[2] + q[3] > -3 && q[3] > 2.6 && q[1] < -10 && q[1] > -45 && Math.abs(q[0]) < 60).slice(0, 10);

  /* one InstancedMesh per shape, in the frame (its own position, turn and scale: nm to µm) */
  const group = new THREE.Group(); group.name = 'crowd'; group.userData.filled = filled;
  group.position.copy(F.o); group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(F.right, F.up, F.back)); group.scale.setScalar(0.001);
  const mats = [], geos = [], m4 = new THREE.Matrix4(), v = new THREE.Vector3(), s = new THREE.Vector3();
  const mat = (o = {}) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color: 0xffffff, roughness: 0.55, metalness: 0, vertexColors: true }, o)); mats.push(m); return m; };
  const shared = mat(), riboMat = mat({ roughness: 0.4, emissive: 0x2a1c05, emissiveIntensity: 0.6 }), chanMat = mat({ roughness: 0.4, emissive: 0x1a6a60, emissiveIntensity: 0.35 });
  const make = (shape, list) => {
    if (!list.length) return;
    const g = SHAPES[shape](); geos.push(g);
    const im = new THREE.InstancedMesh(g, shape === 'ribosome' ? riboMat : shape === 'channel' ? chanMat : shared, list.length); im.name = 'crowd-' + shape;
    list.forEach(([x, y, z, r, c, q], i) => { m4.compose(v.set(x, y, z), q, s.setScalar(r)); im.setMatrixAt(i, m4); im.setColorAt(i, c); });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.frustumCulled = false; group.add(im);
  };
  Object.keys(lists).forEach(k => make(k, lists[k]));
  /* the copies (mRNA), 2 nm thick, the story's copy's colour a little paler, in one mesh */
  if (threads.length) {
    const tg = merge(threads.map(pts => { const t = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(12, pts.length * 10), 1.0, 7, false).toNonIndexed(); t.userData.col = col3(0xf0b070); return t; }));
    geos.push(tg); const tm = new THREE.Mesh(tg, mat({ roughness: 0.45, emissive: 0x5a3010, emissiveIntensity: 0.4 })); tm.name = 'crowd-thread'; tm.frustumCulled = false; group.add(tm);
  }
  const toW = ([x, y, z]) => F.o.clone().addScaledVector(F.right, x / 1000).addScaledVector(F.up, y / 1000).addScaledVector(F.back, z / 1000);
  return {
    group,
    count: Object.values(lists).reduce((a, l) => a + l.length, 0),
    /* points for each name: shapes at the front of the slice, near the middle of the picture */
    spots: { proteins: named.proteins.map(toW), ribosomes: named.ribosomes.map(toW), carriers: named.carriers.map(toW), lumen: named.lumen.map(toW) },
    dispose() { geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); }
  };
}
