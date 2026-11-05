/* ============================================================
   prot.js — proteins in their measured shapes, for the IB view (5 Nov 2026): each one from prot/<key>.js (written by
   tools/ib-proteins.py from its PDB structure: one smooth surface per chain, in nm), fetched only when its chapter opens.
   A protein can be solid or "glass" (see-through with a bright edge, so the molecule in its active site is seen: memory
   true-relative-sizes, "every protein seen whole"). Its named points (sites: where a substrate binds, each electron
   carrier) are Vector3 in its own frame; `siteW(obj, name)` gives one in the world.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';

const got = {};
export function loadProt(key) { return got[key] || (got[key] = import('./prot/' + key + '.js?v=202611051947').then(m => m.PROT)); }
export const loadProts = keys => Promise.all(keys.map(loadProt));

const b64 = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; };
const geoCache = new Map();
function partGeo(p) {
  if (geoCache.has(p)) return geoCache.get(p);
  const q = new Int16Array(b64(p.pos)), pos = new Float32Array(q.length);
  for (let i = 0; i < q.length; i++) pos[i] = q[i] * p.sc[i % 3] + p.off[i % 3];
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(b64(p.idx)), 1)); g.computeVertexNormals(); g.computeBoundingSphere();
  geoCache.set(p, g); return g;
}

/* a protein's material: soft, with a rim of light; `glass` makes it see-through with a brighter rim */
export function protMat(color, { glass = false, opacity = 0.42, rim = 0xffffff, rimK = 0.5, emissive = 0.16, hole = null } = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0.0, envMapIntensity: 0.85, emissive: color, emissiveIntensity: emissive,
    transparent: glass, opacity: glass ? opacity : 1, depthWrite: !glass, side: glass ? THREE.DoubleSide : THREE.FrontSide });
  const rc = new THREE.Color(rim);
  m.userData.rim = { value: glass ? rimK * 1.8 : rimK };
  /* a cut-away window (world centre, radius in w; w = 0: none): the protein's surface is not drawn inside it, so the
     molecule in its active site is seen, with the rest of the protein round it */
  const H = hole || { value: new THREE.Vector4(0, 0, 0, 0) };
  m.userData.hole = H;
  m.onBeforeCompile = sh => {
    sh.uniforms.uRim = m.userData.rim; sh.uniforms.uRimC = { value: rc }; sh.uniforms.uHole = H;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        if (uHole.w > 0.0 && distance(vWP, uHole.xyz) < uHole.w) discard;`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uRim; uniform vec3 uRimC; uniform vec4 uHole; varying vec3 vWP;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float rimF = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 2.4);
        totalEmissiveRadiance += uRimC * rimF * uRim;`);
    if (glass) sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `#include <opaque_fragment>
        gl_FragColor.a = clamp(gl_FragColor.a + rimF * 0.5, 0.0, 1.0);`);
  };
  return m;
}

/* the protein as a group (nm, its own frame); colours by part group (complexes I, III, IV …), else one colour */
export function protein(P, { color = 0x8fb7ff, colors = {}, glass = false, opacity, rimK } = {}) {
  const g = new THREE.Group(); g.name = 'prot-' + P.key;
  const mats = {}, hole = { value: new THREE.Vector4(0, 0, 0, 0) };
  P.parts.forEach(p => {
    const c = colors[p.grp] != null ? colors[p.grp] : color;
    const m = mats[c] || (mats[c] = protMat(c, { glass, opacity, rimK, hole }));
    const mesh = new THREE.Mesh(partGeo(p), m); mesh.userData = { chain: p.chain, grp: p.grp }; g.add(mesh);
  });
  const sites = {}; Object.keys(P.sites || {}).forEach(k => { sites[k] = new THREE.Vector3(...P.sites[k]); });
  g.userData = { key: P.key, name: P.name, source: P.source, sites, box: P.box, mats, hole: hole.value };
  return g;
}
export function siteW(obj, name, out = new THREE.Vector3()) { const s = obj.userData.sites[name]; return s ? obj.localToWorld(out.copy(s)) : null; }
/* points on a protein's outline, for a name's line to end ON it: the vertices of its surface nearest a few targets */
export function surfacePoints(obj, targets, out = []) {
  obj.updateWorldMatrix(true, true);
  const v = new THREE.Vector3(), H = obj.userData && obj.userData.hole, hr = H && H.w > 0 ? (H.w * 1.15) ** 2 : 0;
  for (const t of targets) {
    let best = null, bd = 1e9;
    obj.traverse(o => {
      if (!o.isMesh) return;
      const pos = o.geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 7) {
        v.fromBufferAttribute(pos, i); o.localToWorld(v);
        /* never a point in the cut-away window, where nothing is drawn (the review: lines ended in empty space) */
        if (hr && (v.x - H.x) ** 2 + (v.y - H.y) ** 2 + (v.z - H.z) ** 2 < hr) continue;
        const d = v.distanceToSquared(t); if (d < bd) { bd = d; best = v.clone(); }
      }
    });
    if (best) out.push(best);
  }
  return out;
}
/* each mesh's opacity (a protein fading in or out) */
export function fadeProt(obj, a) {
  obj.visible = a > 0.003;
  Object.values(obj.userData.mats || {}).forEach(m => {
    if (!m.userData.base) m.userData.base = { o: m.opacity, t: m.transparent, dw: m.depthWrite };
    const B = m.userData.base;
    m.opacity = B.o * a; m.transparent = B.t || a < 0.999; m.depthWrite = B.dw && a > 0.6;
  });
}
