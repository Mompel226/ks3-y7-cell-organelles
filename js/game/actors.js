/* ============================================================
   actors.js — the moving things of the mini games (4 Nov 2026): molecules, the copy of a gene, ribosome parts, the chain,
   amylase, lipids, vesicles, a motor protein, the nerve's message. Close up, the camera comes to a molecule's true size
   (a glucose molecule is about 1 nanometre across; play.js gives each token its size); at the way in, every molecule is
   drawn at the membrane's own enlargement, about 100 times, and the page says so. Each token keeps its true shape in outline
   (glucose a ring of six, oxygen two atoms, carbon dioxide three in a line, a lipid a head and two tails, a ribosome a
   small and a large part, each an uneven lump of RNA and protein; a ribosome's RNA a wavy thread, a protein a folded lump
   (amylase: its measured shape),
   the carrier of an amino acid, transfer RNA, an L).
   tween(obj, { to, path, ms }) moves a token and resolves when it arrives; burst(pos) is a short shower of sparkles.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { magicStandard, sparkles } from '../world/magic.js?v=202611121723';
import { mergeVertices } from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js?v=0.185.1';
import { AMYLASE } from './amylase-data.js?v=202611121723';

const glowMat = (color, k = 1) => magicStandard({ color, emissive: color, emissiveIntensity: 0.32 * k, roughness: 0.35 }, { rim: 0xffffff, rimK: 0.5 });
const M = {};
const mat = (key, color, k) => M[key] || (M[key] = glowMat(color, k));
export const AMINO_COLORS = [0x5bc8a8, 0x7fa8ff, 0xf2a65a, 0xe36fb0];
/* a ribosome's part as it looks (Daniel, 11 Nov 2026: "as realistic as possible but … comprehensible for Y7"): RNA and
   proteins folded together into an uneven lump, a little flattened where the two parts meet, still plainly a small and a
   large part. r its radius, (sx, sy, sz) its stretch, face +1 or −1: the side that meets the other part (flatter); the
   same shape in the story (token) and in As it really is (crowd.js), so a pupil sees one kind of thing */
export function riboPart(r, sx, sy, sz, face, detail = 3, seed = 0) {
  const g0 = new THREE.IcosahedronGeometry(1, detail); g0.deleteAttribute('normal'); g0.deleteAttribute('uv');
  const g = mergeVertices(g0), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const k = 1 + 0.055 * Math.sin(v.x * 6.3 + v.y * 2.1 + seed) * Math.sin(v.z * 5.1 - v.x * 2.7 + seed) + 0.025 * Math.sin(v.y * 13 + v.z * 11 + seed);
    let y = v.y; if (y * face > 0.5) y = face * (0.5 + (y * face - 0.5) * 0.4);   /* the face that meets the other part, flatter */
    p.setXYZ(i, v.x * k * r * sx, y * k * r * sy, v.z * k * r * sz);
  }
  g.computeVertexNormals(); g0.dispose(); return g;
}

/* amylase in its measured shape (12 Nov 2026; Daniel, of the film "From DNA to protein - 3D": the chain "form[s] the 3D
   structure, that 3D structure changes into what the animation itself shows the enzymes … you show enzymes in your
   animations as a uniform … lump, but you don't see actually the amino acid structures within"). The lump the game draws
   for amylase is now the smooth surface of the measured molecule (human salivary amylase, PDB 1SMD: 496 amino acids,
   8.0 × 5.1 × 5.0 nm from atom to atom; js/game/amylase-data.js, written by tools/amylase-fold.py), and at the rough ER
   the chain folds into it bead by bead (play.js fold). Before, it was an outline made for the game, about 5 nm across.
   geo: the surface (µm, true size), its longest extent along x, its active site facing +z; ca: where each amino acid
   is in the folded chain and way: the loose way the chain takes into the rough ER (nm, three numbers each); kinds: each
   amino acid's kind (0 to 3: a bead's colour); site, pin: the active site and the surface's point nearest it (nm) */
const unq = o => { const b = atob(o.d), n = b.length / 2, f = new Float32Array(n); for (let i = 0; i < n; i++) { const k = i % 3; f[i] = o.lo[k] + (o.hi[k] - o.lo[k]) * (b.charCodeAt(2 * i) | (b.charCodeAt(2 * i + 1) << 8)) / 65535; } return f; };
let AMY = null;
export const AMY_S = 0.0024;                              /* token('amylase', AMY_S) is its true size */
export function amylase() {
  if (AMY) return AMY;
  const v = unq(AMYLASE.surf.v); for (let i = 0; i < v.length; i++) v[i] /= 1000;
  const ib = atob(AMYLASE.surf.i), idx = new Uint16Array(ib.length / 2); for (let i = 0; i < idx.length; i++) idx[i] = ib.charCodeAt(2 * i) | (ib.charCodeAt(2 * i + 1) << 8);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(v, 3)); geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeVertexNormals();
  /* shaded by how shut in each point is, so that its grooves look deep (the active site above all): a drawing's shading */
  const sh = atob(AMYLASE.surf.shut), col = new Float32Array(sh.length * 3); for (let i = 0; i < sh.length; i++) { const o = Math.pow(Math.min(1, sh.charCodeAt(i) / 255 / 0.15), 0.7);   /* (most of the surface is under 0.05; a groove 0.1 to 0.4) */ col[3 * i] = 1 - 0.62 * o; col[3 * i + 1] = 1 - 0.8 * o; col[3 * i + 2] = 1 - 0.92 * o; }   /* (towards a deep orange-brown) */
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeBoundingBox(); geo.computeBoundingSphere();
  return (AMY = { n: AMYLASE.n, geo, ca: unq(AMYLASE.ca), way: unq(AMYLASE.way), kinds: AMYLASE.kinds, site: AMYLASE.site, pin: AMYLASE.pin, ext: AMYLASE.ext, foldAt: AMYLASE.foldAt });
}
/* a chain of amino acids drawn whole, one bead for each amino acid (n beads of radius r, µm), each in the colour of its
   kind: put(i, x, y, z, k) places bead i (k 0: not shown), done() sends the places to the picture */
export function strand(n, r, kinds) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 12, 9), magicStandard({ color: 0xffffff, roughness: 0.4, emissive: 0x39424f, emissiveIntensity: 0.5 }, { rim: 0xffffff, rimK: 0.35 }), n);
  const c = new THREE.Color(), M = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { M.makeScale(0, 0, 0); m.setMatrixAt(i, M); m.setColorAt(i, c.setHex(AMINO_COLORS[kinds ? +kinds[i] : i % 4])); }
  m.instanceColor.needsUpdate = true; m.frustumCulled = false; m.userData.kind = 'chain';
  m.userData.put = (i, x, y, z, k = 1) => { M.makeScale(k, k, k); M.setPosition(x, y, z); m.setMatrixAt(i, M); };
  m.userData.done = () => { m.instanceMatrix.needsUpdate = true; };
  return m;
}

export function token(kind, s = 0.32) {
  const g = new THREE.Group(); g.userData.kind = kind;
  const sph = (r, color, key, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat(key, color)); m.position.set(x, y, z); g.add(m); return m; };
  switch (kind) {
    case 'glucose': { const ring = new THREE.Mesh(new THREE.TorusGeometry(s, s * 0.22, 8, 6), mat('glu', 0xffd56a, 1.2)); g.add(ring); break; }
    case 'half': { const arc = new THREE.Mesh(new THREE.TorusGeometry(s * 0.72, s * 0.2, 8, 3, Math.PI), mat('glu', 0xffd56a, 1.2)); g.add(arc); break; }
    case 'oxygen': sph(s * 0.5, 0xff6b6b, 'o', -s * 0.42); sph(s * 0.5, 0xff8a8a, 'o2', s * 0.42); break;
    case 'co2': sph(s * 0.42, 0x9aa3b5, 'c', 0); sph(s * 0.4, 0xff7b7b, 'o', -s * 0.72); sph(s * 0.4, 0xff7b7b, 'o', s * 0.72); break;
    case 'water': sph(s * 0.45, 0xff7b7b, 'o', 0); sph(s * 0.28, 0xffffff, 'h', -s * 0.42, s * 0.3); sph(s * 0.28, 0xffffff, 'h', s * 0.42, s * 0.3); break;
    case 'amino': sph(s * 0.5, AMINO_COLORS[0], 'a0'); break;
    case 'rbc': {
      const prof = []; for (let i = 0; i <= 16; i++) { const t = i / 16; prof.push(new THREE.Vector2(t * 1.6, 0.6 * Math.sqrt(Math.max(0, 1 - t * t)) * (0.45 + 2.2 * t * t - 1.9 * t ** 4))); }
      for (let i = 16; i >= 0; i--) prof.push(new THREE.Vector2(prof[i].x, -prof[i].y));
      const m = new THREE.Mesh(new THREE.LatheGeometry(prof.map(v => new THREE.Vector2(Math.max(0.001, v.x), v.y)), 28), magicStandard({ color: 0xc0303e, roughness: 0.4 }, { rim: 0xff7f8f, rimK: 0.5 }));
      m.rotation.x = Math.PI / 2; g.add(m); break;
    }
    case 'small': { g.add(new THREE.Mesh(riboPart(s * 0.62, 1.2, 0.7, 1, 1, 3, 1.3), mat('ss', 0xffe3a0))); break; }
    case 'large': { g.add(new THREE.Mesh(riboPart(s * 0.85, 1.15, 0.85, 1.05, -1, 3, 0), mat('ll', 0xffc95e))); break; }
    case 'ribosome': { const L = new THREE.Mesh(riboPart(s * 0.85, 1.15, 0.85, 1.05, -1, 3, 0), mat('ll', 0xffc95e)); L.position.y = s * 0.42; g.add(L); const S = new THREE.Mesh(riboPart(s * 0.62, 1.2, 0.7, 1, 1, 3, 1.3), mat('ss', 0xffe3a0)); S.position.y = -s * 0.38; g.add(S); break; }
    case 'rna': {
      /* a strand of RNA (a ribosome's own RNA, made in the nucleolus): a short wavy thread */
      const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector3((t - 0.5) * s * 2.4, Math.sin(t * Math.PI * 3) * s * 0.28, Math.cos(t * Math.PI * 2) * s * 0.12)); }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, s * 0.09, 8, false), mat('rna', 0xffb35c, 1.1)));
      break;
    }
    case 'protein': {
      /* a protein made in the cytoplasm: a small folded lump (its outline, not a structure file) */
      const geo = new THREE.IcosahedronGeometry(s, 2), p = geo.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); const k = 1 + 0.18 * Math.sin(v.x * 5 + v.y * 2) * Math.sin(v.z * 4 - v.x * 3); p.setXYZ(i, v.x * s * k, v.y * s * k * 0.9, v.z * s * k); }
      geo.computeVertexNormals();
      g.add(new THREE.Mesh(geo, mat('prot', 0x8fd4ff)));
      break;
    }
    case 'carrier': {
      /* the small carrier molecule (transfer RNA) that brings an amino acid, as it really is: an L, each arm about 7 nm long
         and 2 nm thick (Kim et al. 1974, Science 185:435), at s = 7.5 nm. The amino acid's end at the token's middle (the
         amino acid hangs there: play.js translate), its arm going to the left; the other arm going down, its end the part
         that matches the code (the anticodon): when the amino acid reaches the ribosome's large part, that end reaches the
         copy between the two parts, as in a real ribosome (11 Nov 2026; before, a stem and a bar) */
      const a = s * 0.93, r = s * 0.147, x0 = -s * 0.07, m = mat('car', 0xffffff);
      const acc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, a, 10), m); acc.rotation.z = Math.PI / 2; acc.position.set(x0 - a / 2, 0, 0); g.add(acc);
      const anti = new THREE.Mesh(new THREE.CylinderGeometry(r, r, a, 10), m); anti.position.set(x0 - a, -a / 2, 0); g.add(anti);
      [[x0 - a, 0], [x0 - a, -a]].forEach(([x, y]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), m); b.position.set(x, y, 0); g.add(b); });
      break;
    }
    case 'lhead': sph(s * 0.36, 0xff9ac8, 'lh'); break;
    case 'ltail': { const t = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.07, s * 0.07, s * 1.05, 6), mat('lt', 0xffd0e4, 0.6)); g.add(t); break; }
    case 'lipid': {
      sph(s * 0.36, 0xff9ac8, 'lh', 0, s * 0.55);
      [-1, 1].forEach(k => { const t = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.07, s * 0.07, s * 1.05, 6), mat('lt', 0xffd0e4, 0.6)); t.position.set(k * s * 0.13, -s * 0.1, 0); t.rotation.z = -k * 0.06; g.add(t); });
      break;
    }
    case 'vesicle': {
      const shell = new THREE.Mesh(new THREE.SphereGeometry(s, 28, 18), magicStandard({ color: 0xbfe9ff, transparent: true, opacity: 0.42, roughness: 0.1, depthWrite: false }, { rim: 0xe8fbff, rimK: 1.4 }));
      shell.renderOrder = 8; g.add(shell); g.userData.shell = shell;
      break;
    }
    case 'amylase': {
      /* a folded protein: the smooth surface of the measured molecule (amylase() above), with its real groove, the active
         site, on the side that faces +z; s = AMY_S (2.4 nm) is its true size, about 8 nm long and 5 nm wide */
      /* matt (no bright spots: on a lumpy shape they stood in every hollow), and shaded by the geometry's colours, which
         darken its grooves towards brown: the game's fill light is blue, and an orange hollow that only the blue light
         reached looked grey-green. (Only what a copy of the material keeps is used: play.js copies a token's materials) */
      const body = new THREE.Mesh(amylase().geo, magicStandard({ color: 0xe2a242, roughness: 0.88, emissive: 0x8a520c, emissiveIntensity: 1.0, vertexColors: true, envMapIntensity: 0.2 }, { rim: 0xffe9b0, rimK: 0.5 }));
      body.scale.setScalar(s / AMY_S);
      g.add(body);
      break;
    }
    case 'motor': {
      const foot = (x) => { const f = new THREE.Mesh(new THREE.CapsuleGeometry(s * 0.14, s * 0.3, 4, 10), mat('mf', 0xc8f7ff)); f.position.set(x, -s * 0.5, 0); g.add(f); return f; };
      g.userData.feet = [foot(-s * 0.16), foot(s * 0.16)];
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.05, s * 0.05, s * 0.9, 6), mat('ms', 0xc8f7ff)); g.add(stalk);
      break;
    }
    default: sph(s * 0.5, 0xffffff, 'w');
  }
  return g;
}
/* a gene's copy (mRNA): a ribbon that grows along a curve; grow(k) shows 0 … 1 of it */
export function ribbon(curve, { color = 0xff9f43, radius = 0.045, segs = 160 } = {}) {
  const geo = new THREE.TubeGeometry(curve, segs, radius, 8, false);
  const m = new THREE.Mesh(geo, glowMat(color, 1.1)); m.renderOrder = 6;
  const per = 8 * 6;                                     /* indices per tube segment */
  m.userData.grow = k => { geo.setDrawRange(0, Math.max(0, Math.round(segs * Math.min(1, k))) * per); };
  m.userData.grow(0);
  return m;
}
/* a chain of amino acids: beads along a curve */
export function chain(points, colors, r = 0.075) {      /* r: a bead's radius (µm); at true size an amino acid is about 0.0006 */
  const g = new THREE.Group();
  points.forEach((p, i) => { const b = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat('a' + (colors[i] % 4), AMINO_COLORS[colors[i] % 4])); b.position.copy(p); g.add(b); });
  return g;
}

const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
let STILL = false, QUICK = false;
/* still: every move jumps to its end; keepPauses (Reduce motion, not the tests): a wait still lasts its time */
export function setStill(v, keepPauses = false) { STILL = v; QUICK = v && !keepPauses; }
/* move an object to a point (or along a curve) and resolve when it is there */
export function tween(obj, { to, path, ms = 1200, scale, spin = 0, fade } = {}) {
  const p0 = obj.position.clone(), s0 = obj.scale.x, t0 = performance.now();
  /* a fade changes only this object's own copy of each material: tokens of a kind share one, and must not all fade */
  if (fade != null) obj.traverse(o => { if (o.material && !o.userData.ownMat) { o.material = o.material.clone(); o.userData.ownMat = true; } });
  return new Promise(res => {
    const step = () => {
      const k = STILL ? 1 : Math.min(1, (performance.now() - t0) / ms), e = ease(k);
      if (path) obj.position.copy(path.getPointAt(e)); else if (to) obj.position.lerpVectors(p0, to, e);
      if (scale != null) obj.scale.setScalar(s0 + (scale - s0) * e);
      if (spin) obj.rotation.y += spin * 0.016;
      if (fade != null) obj.traverse(o => { if (o.material) { o.material.transparent = true; o.material.opacity = 1 + (fade - 1) * e; } });
      if (k < 1) requestAnimationFrame(step); else res();
    };
    step();
  });
}
export const wait = ms => new Promise(r => setTimeout(r, QUICK ? 0 : ms));

/* a short shower of sparkles where something happens */
/* (size and near for a magnified view, where a burst is nanometres across) */
export function burst(scene, pos, { color = 0xffe39a, n = 60, r = 0.6, ms = 1100, size = 0.09, near = 0.5 } = {}) {
  const dirs = [];
  const p = sparkles({ count: n, size, near, color, drift: 0, twinkle: 0.3, sample: (v) => { const d = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(); dirs.push(d); v.set(0, 0, 0); } });
  p.position.copy(pos); scene.add(p);
  const attr = p.geometry.attributes.position, t0 = performance.now();
  return new Promise(res => {
    const step = () => {
      const k = STILL ? 1 : Math.min(1, (performance.now() - t0) / ms);
      for (let i = 0; i < n; i++) attr.setXYZ(i, dirs[i].x * r * ease(k), dirs[i].y * r * ease(k), dirs[i].z * r * ease(k));
      attr.needsUpdate = true; p.material.uniforms.uOpacity.value = 1 - k;
      if (k < 1) requestAnimationFrame(step); else { scene.remove(p); p.geometry.dispose(); res(); }
    };
    step();
  });
}
/* a wave of light through the cell (the nerve's message): a glowing shell that grows from a point */
export function wave(scene, from, { color = 0xfff1a8, to = 14, ms = 2600 } = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.ShaderMaterial({
    uniforms: { uK: { value: 0 }, uColor: { value: new THREE.Color(color) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uK; uniform vec3 uColor; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN,vV)), 2.5); float a = f * (1.0 - uK) * 0.8; gl_FragColor = vec4(uColor * a, a); }`
  }));
  m.position.copy(from); scene.add(m);
  const t0 = performance.now();
  return new Promise(res => {
    const step = () => {
      const k = STILL ? 1 : Math.min(1, (performance.now() - t0) / ms);
      m.scale.setScalar(0.2 + to * ease(k)); m.material.uniforms.uK.value = k;
      if (k < 1) requestAnimationFrame(step); else { scene.remove(m); res(); }
    };
    step();
  });
}
