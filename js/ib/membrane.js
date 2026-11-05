/* ============================================================
   membrane.js — a phospholipid bilayer at its true size (5 Nov 2026), for the IB view: the membrane cut across, its two
   layers of lipids in rows behind the cut (z ≤ 0), each lipid a head (pink, it faces the water) and two tails (pale, they
   face each other in the middle), as in the game's way in and its mitochondria.
   Sizes (nm): the heads' middles 2.0 nm on each side of the membrane's middle (phosphate to phosphate about 4 nm: Mitra et
   al. 2004, PNAS 101:4083, about 3.6–4.0 nm for cell membranes), so with its heads the bilayer is about 5 nm thick; a head
   0.8 nm across, tails 1.9 nm (they meet in the middle), lipids 0.8 nm apart. With the proteins in it and on it, a membrane is about 7 nm thick
   (the game's own figure).
   Every protein that something passes through stands in a window: no lipid where the protein is, and none in FRONT of it
   (between it and the viewer, +z), so the whole protein is seen (Daniel, 5 Nov 2026: "make sure that the proteins are
   completely visible to the student"); the lipids beside it and behind it stay, so it is still seen in the membrane.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';

/* tail 1.9: the two layers' tails meet in the middle (the expert review: a dark seam between them read as a gap between
   two membranes) */
export const MEM = { headY: 2.0, headR: 0.4, tail: 1.9, gap: 0.8 };
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* holes: [{x, z, r}] (nm, in the membrane's plane: x across, z towards the viewer): no lipid within r of (x, z), and none
   in front (z larger) within r across. rows: how far behind the cut the lipids go (nm). */
export function bilayer({ x0 = -30, x1 = 30, depth = 9, holes = [], seed = 3, head = 0xff9ac8, tail = 0xffd8a8, curve = null, block = null } = {}) {
  const R = rng(seed), g = new THREE.Group(); g.name = 'bilayer';
  const L = [];
  const blocked = (x, z) => (block && block(x, z)) || holes.some(h => Math.hypot(x - h.x, z - h.z) < h.r || (Math.abs(x - h.x) < h.r && z > h.z));
  for (let row = 0, z = -0.42; z > -depth; row++, z -= MEM.gap * 0.866) {
    for (let x = x0 + (row % 2) * MEM.gap / 2; x < x1; x += MEM.gap) {
      if (blocked(x, z)) continue;
      for (const sd of [1, -1]) L.push({ x: x + (R() - 0.5) * 0.12, z: z + (R() - 0.5) * 0.1, sd, a: R() * 6.283, w: (R() - 0.5) * 0.12 });
    }
  }
  const headMat = new THREE.MeshStandardMaterial({ color: head, emissive: 0x5c1a3c, emissiveIntensity: 0.4, roughness: 0.45 });
  const tailMat = new THREE.MeshStandardMaterial({ color: tail, emissive: 0x4a3614, emissiveIntensity: 0.25, roughness: 0.62 });
  const heads = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(MEM.headR, 1), headMat, L.length);
  const tails = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.13, 0.1, MEM.tail, 6, 1, true), tailMat, L.length * 2);
  const o = new THREE.Object3D();
  L.forEach((l, i) => {
    const y = l.sd * MEM.headY + l.w;
    o.position.set(l.x, curve ? curve(l.x, y) : y, l.z); o.rotation.set(0, 0, 0); o.scale.setScalar(1); o.updateMatrix(); heads.setMatrixAt(i, o.matrix);
    for (let k = 0; k < 2; k++) {
      const off = 0.2 * (k ? 1 : -1);
      const ty = l.sd * (MEM.headY - MEM.headR - MEM.tail / 2 + 0.15);
      o.position.set(l.x + Math.cos(l.a) * off, curve ? curve(l.x, ty) : ty, l.z + Math.sin(l.a) * off); o.updateMatrix(); tails.setMatrixAt(i * 2 + k, o.matrix);
    }
  });
  [heads, tails].forEach(m => { m.instanceMatrix.needsUpdate = true; m.computeBoundingSphere(); g.add(m); });
  g.userData = { count: L.length, heads, tails, mats: [headMat, tailMat] };
  return g;
}

/* where proteins stand in a membrane (world x, z; the membrane's middle at y = y0): a lipid is left out where a protein
   is, and in front of it (z larger), so every protein is seen whole. objs: the placed protein groups. */
export function footprint(objs, { y0 = 0, half = 2.6, cell = 0.5, pad = 2 } = {}) {
  const occ = new Map(), front = new Map(), deep = new Map(), v = new THREE.Vector3();
  const key = (i, j) => i + ',' + j;
  for (const o of objs) {
    o.updateWorldMatrix(true, true);
    o.traverse(m => {
      if (!m.isMesh) return;
      const pos = m.geometry.attributes.position;
      for (let k = 0; k < pos.count; k++) {
        v.fromBufferAttribute(pos, k); m.localToWorld(v);
        const i = Math.round(v.x / cell), j = Math.round(v.z / cell);
        /* in front of ANY part of the protein (above or below the membrane too: the camera sees those parts behind the
           lipids), no lipid; where the protein crosses the membrane, none at all */
        for (let di = -pad; di <= pad; di++) front.set(i + di, Math.max(front.get(i + di) == null ? -1e9 : front.get(i + di), v.z));
        if (Math.abs(v.y - y0) > half) continue;
        for (let di = -pad; di <= pad; di++) deep.set(i + di, Math.min(deep.get(i + di) == null ? 1e9 : deep.get(i + di), v.z));
        for (let di = -pad; di <= pad; di++) for (let dj = -pad; dj <= pad; dj++) occ.set(key(i + di, j + dj), 1);
      }
    });
  }
  /* in each column (1.5 nm across, so no island of lipids stands in a gap between subunits): where the protein crosses the
     membrane, no lipid in front of its DEEPEST part there, so its whole membrane part is seen (the expert review, 5 Nov
     2026: lipids stood in front of complex IV); where only a part above or below the membrane is, none in front of that
     part; a column with no protein keeps all its lipids */
  const near = (M, i, pick) => { let m = null; for (let d = -3; d <= 3; d++) if (M.has(i + d)) m = m == null ? M.get(i + d) : pick(m, M.get(i + d)); return m; };
  return (x, z) => {
    const i = Math.round(x / cell), j = Math.round(z / cell);
    if (occ.has(key(i, j))) return true;
    const dz = near(deep, i, Math.min); if (dz != null) return z > dz - 0.2;
    const fz = near(front, i, Math.max); return fz != null && z > fz - 0.2;
  };
}
