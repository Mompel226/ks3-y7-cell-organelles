/* ============================================================
   actors.js — the moving things of the mini games (4 Nov 2026): molecules, the copy of a gene, ribosome parts, the chain,
   amylase, lipids, vesicles, a motor protein, the nerve's message. Molecules are drawn thousands of times larger than they
   are (a glucose molecule is about 1 nanometre across): the page says so. Each token keeps its true shape in outline
   (glucose a ring of six, oxygen two atoms, carbon dioxide three in a line, a lipid a head and two tails, a ribosome a
   small and a large part; a ribosome's RNA a wavy thread, a protein a folded lump, the carrier of an amino acid a stem).
   tween(obj, { to, path, ms }) moves a token and resolves when it arrives; burst(pos) is a short shower of sparkles.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { magicStandard, sparkles } from '../world/magic.js?v=202611081649';

const glowMat = (color, k = 1) => magicStandard({ color, emissive: color, emissiveIntensity: 0.32 * k, roughness: 0.35 }, { rim: 0xffffff, rimK: 0.5 });
const M = {};
const mat = (key, color, k) => M[key] || (M[key] = glowMat(color, k));
export const AMINO_COLORS = [0x5bc8a8, 0x7fa8ff, 0xf2a65a, 0xe36fb0];

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
    case 'small': { const m = sph(s * 0.62, 0xffe3a0, 'ss'); m.scale.set(1.2, 0.7, 1); break; }
    case 'large': { const m = sph(s * 0.85, 0xffc95e, 'll'); m.scale.set(1.15, 0.85, 1.05); break; }
    case 'ribosome': { const L = sph(s * 0.85, 0xffc95e, 'll', 0, s * 0.42); L.scale.set(1.15, 0.85, 1.05); const S = sph(s * 0.62, 0xffe3a0, 'ss', 0, -s * 0.38); S.scale.set(1.2, 0.7, 1); break; }
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
      /* the small carrier molecule (transfer RNA) that brings an amino acid: a stem, and an end that matches the code */
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.09, s * 0.09, s * 0.9, 8), mat('car', 0xffffff)); stem.position.y = -s * 0.2; g.add(stem);
      const end = new THREE.Mesh(new THREE.BoxGeometry(s * 0.7, s * 0.16, s * 0.16), mat('car', 0xffffff)); end.position.y = -s * 0.68; g.add(end);
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
      /* a folded protein: a lumpy body with a groove (the active site), drawn from its outline, not a structure file */
      const geo = new THREE.IcosahedronGeometry(s, 4), p = geo.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).normalize();
        let k = 1 + 0.12 * Math.sin(v.x * 7 + v.y * 3) * Math.sin(v.z * 6 - v.y * 4);
        const groove = Math.exp(-Math.pow((v.y - 0.15) / 0.18, 2)) * Math.max(0, v.z) ;
        k -= 0.32 * groove;
        p.setXYZ(i, v.x * s * k * 1.15, v.y * s * k, v.z * s * k);
      }
      geo.computeVertexNormals();
      const body = new THREE.Mesh(geo, magicStandard({ color: 0xf6b84a, roughness: 0.35, emissive: 0x6a4008, emissiveIntensity: 0.5 }, { rim: 0xffe9b0, rimK: 0.9 }));
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
export function chain(points, colors) {
  const g = new THREE.Group();
  points.forEach((p, i) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), mat('a' + (colors[i] % 4), AMINO_COLORS[colors[i] % 4])); b.position.copy(p); g.add(b); });
  return g;
}

const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
let STILL = false;
export function setStill(v) { STILL = v; }
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
export const wait = ms => new Promise(r => setTimeout(r, STILL ? 0 : ms));

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
