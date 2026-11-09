/* ============================================================
   mol.js — molecules as ball-and-stick models at their true size (5 Nov 2026), for the IB view "From glucose to ATP".
   Daniel, 5 Nov 2026: "show glucose ... as a ring, but you can see everything, the carbons, the hydrogens, and the oxygens
   in the right place. You can number the carbons because that's what the IB students need to know."
   - Every atom is where the PDB's Chemical Component Dictionary puts it (mol-data.js, written by tools/ib-molecules.py),
     as in a cell at pH 7.2 (an acidic hydrogen taken off: the oxygen carries a negative charge).
   - Colours (the usual model-kit colours, CPK): carbon dark grey, hydrogen white, oxygen red, nitrogen blue, phosphorus
     orange, sulfur yellow. Each ball is smaller than its atom (as in every ball-and-stick model, so the bonds show); the
     distance between two atoms is true, so the molecule's size is true: glucose about 0.8 nm across.
   - A reaction moves each atom from where it is in the molecules before to where it is in the molecules after: atoms
     with the same name (C1 … O6, glucose's carbons) keep their identity, a group that moves from one molecule to another
     (a phosphate from ATP to glucose) is named in `moves`; atoms that are not in the products fade, atoms that are only
     in the products appear; a bond that breaks fades, a new bond appears (Reaction below).
   Units: nm (the IB view's scenes are in nm).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { MOL } from './mol-data.js?v=202611092229';

export const ELC = { C: 0x3a3f4a, H: 0xf4f6fa, O: 0xe8322f, N: 0x3b6cf0, P: 0xff9a1f, S: 0xf2d43a };
/* ball radii (nm): a fixed part of each element's van der Waals radius (C 0.17 nm), so the bonds show */
export const ELR = { C: 0.052, H: 0.036, O: 0.050, N: 0.050, P: 0.060, S: 0.060 };
const BOND_R = 0.016;
const sphereGeo = new THREE.SphereGeometry(1, 18, 12), cylGeo = new THREE.CylinderGeometry(1, 1, 1, 10, 1, false);
cylGeo.translate(0, 0.5, 0);
const tmpM = new THREE.Matrix4(), tq = new THREE.Quaternion(), ts = new THREE.Vector3(), tv = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
const zeroM = new THREE.Matrix4().makeScale(0, 0, 0);

/* a molecule's atoms (local, nm), names, bonds and charges, read once */
const cache = {};
export function molData(key) {
  if (cache[key]) return cache[key];
  const D = MOL[key]; if (!D) throw new Error('no molecule ' + key);
  const n = D.el.length, P = [];
  for (let i = 0; i < n; i++) P.push(new THREE.Vector3(D.xyz[3 * i] / 1000, D.xyz[3 * i + 1] / 1000, D.xyz[3 * i + 2] / 1000));
  const B = []; for (let k = 0; k < D.b.length; k += 3) B.push([D.b[k], D.b[k + 1], D.b[k + 2]]);
  const idx = {}; D.n.forEach((nm, i) => { idx[nm] = i; });
  const q = new Array(n).fill(0); Object.keys(D.q).forEach(k => { q[+k] = D.q[k]; });
  return (cache[key] = { key, label: D.label, el: D.el.split(''), P, B, idx, names: D.n, q, groups: D.g || {} });
}

/* the material for a set of balls or sticks: one colour per instance, a soft rim so a molecule reads on the dark */
function ballMat() {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.05, envMapIntensity: 0.9, emissive: 0x111111, emissiveIntensity: 0.25 });
  m.onBeforeCompile = sh => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float rimK = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 2.2);
      totalEmissiveRadiance += vec3(0.55, 0.62, 0.8) * rimK * 0.35;`);
  };
  return m;
}

/* the draw of any set of atoms and bonds (one instance per atom, one per half bond): `draw(atoms, bonds)` with atoms
   [{el, p (world Vector3), s (scale 0..1), c (colour override or null)}] and bonds [{a, b, o (order), s}] */
export function ballStick(maxAtoms = 220, maxBonds = 260) {
  const g = new THREE.Group();
  const balls = new THREE.InstancedMesh(sphereGeo, ballMat(), maxAtoms);
  const sticks = new THREE.InstancedMesh(cylGeo, ballMat(), maxBonds * 4);
  /* each with its colour list from the start: its shader program is then the one made before the chapter shows, not a
     second one made the moment the first molecule appears (the audit, 5 Nov 2026: a 170 ms frame in chapter 3's zoom) */
  [balls, sticks].forEach(m => {
    m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.count = 0;
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(m.instanceMatrix.count * 3).fill(1), 3); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    g.add(m);
  });
  const col = new THREE.Color();
  const side = new THREE.Vector3(), dir = new THREE.Vector3(), mid = new THREE.Vector3(), a0 = new THREE.Vector3(), b0 = new THREE.Vector3();
  function stick(k, from, to, r, c) {
    dir.copy(to).sub(from); const L = dir.length(); if (L < 1e-6) { sticks.setMatrixAt(k, zeroM); return; }
    tq.setFromUnitVectors(up, dir.divideScalar(L)); ts.set(r, L, r);
    tmpM.compose(from, tq, ts); sticks.setMatrixAt(k, tmpM); sticks.setColorAt(k, col.setHex(c));
  }
  return {
    group: g,
    draw(atoms, bonds, view) {
      let n = 0;
      for (const A of atoms) {
        if (n >= maxAtoms) break;
        const s = A.s == null ? 1 : A.s;
        if (s <= 0.001) continue;
        ts.setScalar((ELR[A.el] || 0.05) * s); tq.identity();
        tmpM.compose(A.p, tq, ts); balls.setMatrixAt(n, tmpM); balls.setColorAt(n, col.setHex(A.c != null ? A.c : ELC[A.el] || 0xcccccc)); n++;
      }
      balls.count = n; balls.instanceMatrix.needsUpdate = true; if (balls.instanceColor) balls.instanceColor.needsUpdate = true;
      let k = 0;
      for (const B of bonds) {
        if (k >= maxBonds * 4 - 4) break;
        const s = B.s == null ? 1 : B.s; if (s <= 0.001) continue;
        const pa = atoms[B.a].p, pb = atoms[B.b].p, ca = atoms[B.a].c != null ? atoms[B.a].c : ELC[atoms[B.a].el], cb = atoms[B.b].c != null ? atoms[B.b].c : ELC[atoms[B.b].el];
        mid.copy(pa).add(pb).multiplyScalar(0.5);
        if (B.o === 2 && view) {
          /* a double bond: two thinner sticks side by side, across the view so both are seen */
          dir.copy(pb).sub(pa).normalize(); side.copy(view).cross(dir); if (side.lengthSq() < 1e-8) side.set(1, 0, 0); side.normalize().multiplyScalar(0.022);
          for (const sg of [1, -1]) {
            a0.copy(pa).addScaledVector(side, sg); b0.copy(pb).addScaledVector(side, sg); const m0 = a0.clone().add(b0).multiplyScalar(0.5);
            stick(k++, a0, m0, BOND_R * 0.7 * s, ca); stick(k++, m0, b0, BOND_R * 0.7 * s, cb);
          }
        } else { stick(k++, pa, mid, BOND_R * s, ca); stick(k++, mid, pb, BOND_R * s, cb); }
      }
      sticks.count = k; sticks.instanceMatrix.needsUpdate = true; if (sticks.instanceColor) sticks.instanceColor.needsUpdate = true;
    },
    dispose() { balls.dispose(); sticks.dispose(); }
  };
}

/* a pose: where a molecule's local frame stands in the world */
export const pose = (x = 0, y = 0, z = 0, q = new THREE.Quaternion()) => ({ p: new THREE.Vector3(x, y, z), q: q.clone ? q.clone() : q });
export const quatEuler = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
export const worldAtom = (D, i, P) => D.P[i].clone().applyQuaternion(P.q).add(P.p);

/* the best fit (rotation, then translation) that puts points B onto points A (Horn's method: the largest eigenvector of a
   4 × 4 matrix, by power iteration); returns a quaternion and a translation for B */
export function fit(A, B) {
  const ca = new THREE.Vector3(), cb = new THREE.Vector3();
  A.forEach(p => ca.add(p)); B.forEach(p => cb.add(p)); ca.divideScalar(A.length); cb.divideScalar(B.length);
  let Sxx = 0, Sxy = 0, Sxz = 0, Syx = 0, Syy = 0, Syz = 0, Szx = 0, Szy = 0, Szz = 0;
  for (let i = 0; i < A.length; i++) {
    const a = A[i].clone().sub(ca), b = B[i].clone().sub(cb);
    Sxx += b.x * a.x; Sxy += b.x * a.y; Sxz += b.x * a.z; Syx += b.y * a.x; Syy += b.y * a.y; Syz += b.y * a.z; Szx += b.z * a.x; Szy += b.z * a.y; Szz += b.z * a.z;
  }
  const N = [[Sxx + Syy + Szz, Syz - Szy, Szx - Sxz, Sxy - Syx], [Syz - Szy, Sxx - Syy - Szz, Sxy + Syx, Szx + Sxz],
    [Szx - Sxz, Sxy + Syx, -Sxx + Syy - Szz, Syz + Szy], [Sxy - Syx, Szx + Sxz, Syz + Szy, -Sxx - Syy + Szz]];
  const sh = Math.abs(N[0][0]) + Math.abs(N[1][1]) + Math.abs(N[2][2]) + Math.abs(N[3][3]) + 1e-9;
  let v = [1, 0, 0, 0];
  for (let it = 0; it < 80; it++) {
    const w = [0, 0, 0, 0];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) w[r] += (N[r][c] + (r === c ? sh : 0)) * v[c];
    const L = Math.hypot(...w) || 1; v = w.map(x => x / L);
  }
  const q = new THREE.Quaternion(v[1], v[2], v[3], v[0]).normalize();
  const t = ca.clone().sub(cb.clone().applyQuaternion(q));
  return { q, t };
}

/* ---------------- a set of molecules in the world, drawn as ball-and-stick ---------------- */
/* inst: [{key, id, P: pose, s (scale of every atom, to fade), hi: {name or group: colour}}] → atoms and bonds to draw */
export function gather(insts) {
  const atoms = [], bonds = [];
  for (const I of insts) {
    if (!I || I.s === 0) continue;
    const D = molData(I.key), base = atoms.length;
    for (let i = 0; i < D.el.length; i++) atoms.push({ el: D.el[i], p: worldAtom(D, i, I.P), s: I.s == null ? 1 : I.s, c: I.c ? I.c(i, D) : null, id: I.id, name: D.names[i], q: D.q[i], gn: I.num ? I.num[D.names[i]] : undefined });
    for (const [a, b, o] of D.B) bonds.push({ a: base + a, b: base + b, o, s: I.s == null ? 1 : I.s });
  }
  return { atoms, bonds };
}

/* ---------------- a reaction: the atoms of the molecules before move into the molecules after ---------------- */
/* from / to: [{key, id, P (pose; for `to` it may be omitted when `fitTo` names a `from` id: then the product is placed
   where that reactant was, by its atoms of the same names)}]; moves: [['fromId:atomName', 'toId:atomName'], …] for atoms
   that change molecule or name. The atoms of a `to` molecule with the same id and name as a `from` atom are the same
   atom. Hydrogens on matched atoms are paired by nearness. */
export class Reaction {
  constructor({ from, to, moves = [], when = null }) {
    /* when(id, name) → [a, b]: the part of the reaction (0 … 1) in which that atom moves (a product's id and name, or a
       reactant's for an atom that leaves): so one reaction can be shown in stages */
    this.when = when;
    this.from = from.map(f => Object.assign({}, f, { D: molData(f.key) }));
    this.to = to.map(t => Object.assign({}, t, { D: molData(t.key) }));
    const fromById = {}; this.from.forEach(f => { fromById[f.id] = f; });
    /* world positions of every reactant atom */
    this.A = []; this.from.forEach(f => f.D.el.forEach((e, i) => this.A.push({ el: e, f, i, p: worldAtom(f.D, i, f.P), name: f.D.names[i], gn: f.num ? f.num[f.D.names[i]] : undefined })));
    const aKey = {}; this.A.forEach((a, k) => { aKey[a.f.id + ':' + a.name] = k; });
    const mv = {}; moves.forEach(([a, b]) => { mv[b] = a; });
    /* place each product: given, or fitted onto its reactant by the heavy atoms they share */
    for (const t of this.to) {
      if (t.P) continue;
      const src = fromById[t.fitTo || t.id], A = [], B = [];
      const pick = withH => t.D.names.forEach((nm, i) => {
        if (!withH && t.D.el[i] === 'H') return;
        const k = aKey[(mv[t.id + ':' + nm] || ((t.fitTo || t.id) + ':' + nm))];
        if (k != null && (!src || this.A[k].f === src || mv[t.id + ':' + nm])) { A.push(this.A[k].p); B.push(t.D.P[i]); }
      });
      pick(false);
      /* a small new molecule made of atoms that leave another (water: one heavy atom) is fitted by its hydrogens too, so it
         forms where its atoms were (Daniel, 6 Nov 2026: enolase's water had formed at the scene's origin, its bonds
         stretched across the picture, and it was never named) */
      if (A.length < 3 && !src) { A.length = 0; B.length = 0; pick(true); }
      if (A.length >= 3) { const F = fit(A, B); t.P = { p: F.t, q: F.q }; }
      else t.P = src ? { p: src.P.p.clone(), q: src.P.q.clone() } : pose();
    }
    /* the product atoms, and which reactant atom each one was */
    this.B = []; this.to.forEach(t => t.D.el.forEach((e, i) => this.B.push({ el: e, t, i, p: worldAtom(t.D, i, t.P), name: t.D.names[i], src: null })));
    const used = new Set();
    this.B.forEach(b => {
      if (b.el === 'H') return;
      const k = aKey[mv[b.t.id + ':' + b.name] || (b.t.id + ':' + b.name)];
      if (k != null && !used.has(k) && this.A[k].el === b.el) { b.src = k; used.add(k); }
    });
    /* hydrogens: on a matched heavy atom, paired with the nearest unused hydrogen of its source atom; then any explicit move */
    const parentB = (b) => { const nb = b.t.D.B.find(([x, y]) => x === b.i || y === b.i); return nb ? (nb[0] === b.i ? nb[1] : nb[0]) : -1; };
    const hOfA = (k) => this.A.map((a, j) => [a, j]).filter(([a, j]) => a.el === 'H' && a.f === this.A[k].f && a.f.D.B.some(([x, y]) => (x === a.i && y === this.A[k].i) || (y === a.i && x === this.A[k].i))).map(x => x[1]);
    this.B.forEach(b => {
      if (b.el !== 'H') return;
      const ex = mv[b.t.id + ':' + b.name]; if (ex && aKey[ex] != null && !used.has(aKey[ex])) { b.src = aKey[ex]; used.add(b.src); return; }
      const pi = parentB(b); if (pi < 0) return;
      const pb = this.B.find(x => x.t === b.t && x.i === pi); if (!pb || pb.src == null) return;
      const cands = hOfA(pb.src).filter(j => !used.has(j)); if (!cands.length) return;
      cands.sort((j1, j2) => this.A[j1].p.distanceToSquared(b.p) - this.A[j2].p.distanceToSquared(b.p));
      b.src = cands[0]; used.add(b.src);
    });
    this.used = used;
    /* the bonds before and after, by reactant atom where they have one */
    const kOfB = b => b.src != null ? 'a' + b.src : 'b' + this.B.indexOf(b);
    this.bondsA = []; this.from.forEach(f => f.D.B.forEach(([x, y, o]) => {
      const ka = this.A.findIndex(a => a.f === f && a.i === x), kb = this.A.findIndex(a => a.f === f && a.i === y);
      this.bondsA.push({ ka: 'a' + ka, kb: 'a' + kb, o });
    }));
    this.bondsB = []; this.to.forEach(t => t.D.B.forEach(([x, y, o]) => {
      const bx = this.B.find(b => b.t === t && b.i === x), by = this.B.find(b => b.t === t && b.i === y);
      this.bondsB.push({ ka: kOfB(bx), kb: kOfB(by), o });
    }));
    /* one plan for every bond: in both (its order may change at half way), only before (it breaks), only after (it forms) */
    const id = x => [x.ka, x.kb].sort().join('|'), inB = {};
    this.bondsB.forEach(x => { inB[id(x)] = x; });
    this.plan = [];
    const inA = new Set();
    this.bondsA.forEach(x => { const k = id(x); inA.add(k); const y = inB[k]; this.plan.push({ ka: x.ka, kb: x.kb, oA: x.o, oB: y ? y.o : 0, kind: y ? 'both' : 'a' }); });
    this.bondsB.forEach(x => { if (!inA.has(id(x))) this.plan.push({ ka: x.ka, kb: x.kb, oA: 0, oB: x.o, kind: 'b' }); });
  }
  /* the product's pose, by id (to move it on after the reaction) */
  placeOf(id) { const t = this.to.find(x => x.id === id); return t ? t.P : null; }
  /* atoms and bonds at f (0: before, 1: after); each atom keeps its reactant's colour code; `lift` bends a moving atom's
     way a little so that it does not pass through the others */
  at(f0, hi) {
    const W = (id, name) => { if (!this.when) return f0; const w = this.when(id, name); return w ? Math.max(0, Math.min(1, (f0 - w[0]) / (w[1] - w[0]))) : f0; };
    const atoms = [], key = {}, loc = {};
    this.A.forEach((a, k) => {
      const b = this.B.find(x => x.src === k);
      const f = b ? W(b.t.id, b.name) : W(a.f.id, a.name), e = f * f * (3 - 2 * f); loc['a' + k] = f;
      /* a reactant marked `arrive` (a vector) comes in from there during the first quarter of the reaction */
      const ar = a.f.arrive ? a.f.arrive.clone().multiplyScalar(1 - smooth(0, 0.25, f0)) : null;
      if (b) {
        const p = a.p.clone().lerp(b.p, e), d = a.p.distanceTo(b.p);
        if (d > 0.25) p.y += Math.sin(Math.PI * e) * Math.min(0.25, d * 0.25);
        if (ar) p.add(ar);
        key['a' + k] = atoms.length; atoms.push({ el: a.el, p, s: 1, c: hi ? hi(a, b) : null, name: b.name, id: b.t.id, from: a, gn: a.gn, q: f > 0.5 ? b.t.D.q[b.i] : a.f.D.q[a.i] });
      } else {
        const p = a.p.clone(); if (ar) p.add(ar);
        key['a' + k] = atoms.length; atoms.push({ el: a.el, p, s: 1 - smooth(0.25, 0.7, f), c: hi ? hi(a, null) : null, name: a.name, id: a.f.id, gn: a.gn, q: a.f.D.q[a.i] });
      }
    });
    this.B.forEach((b, j) => {
      if (b.src != null) return;
      const f = W(b.t.id, b.name); loc['b' + j] = f;
      key['b' + j] = atoms.length; atoms.push({ el: b.el, p: b.p.clone(), s: smooth(0.35, 0.8, f), c: hi ? hi(null, b) : null, name: b.name, id: b.t.id, q: b.t.D.q[b.i] });
    });
    /* a bond breaks as soon as either of its atoms starts to move; a new bond forms when both have arrived */
    const bonds = this.plan.map(x => { const f = x.kind === 'a' ? Math.max(loc[x.ka], loc[x.kb]) : Math.min(loc[x.ka], loc[x.kb]);
      return { a: key[x.ka], b: key[x.kb], o: x.kind === 'both' ? (f < 0.5 ? x.oA : x.oB) : x.kind === 'a' ? x.oA : x.oB,
        s: x.kind === 'both' ? 1 : x.kind === 'a' ? 1 - smooth(0.2, 0.55, f) : smooth(0.45, 0.85, f) }; });
    return { atoms, bonds };
  }
}
export const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* the middle of a molecule instance's named atoms (world) */
export function atomAt(I, name) { const D = molData(I.key), i = D.idx[name]; return i == null ? null : worldAtom(D, i, I.P); }
export function centreOf(I) { const D = molData(I.key), c = new THREE.Vector3(); D.P.forEach(p => c.add(p)); return c.divideScalar(D.P.length).applyQuaternion(I.P.q).add(I.P.p); }

/* a rotation that turns a ring of named atoms to face the viewer (+z), its first-to-fourth atom across (+x), then tilts
   it by `tilt` (radians, round x) so the ring's 3D shape shows */
export function faceRing(key, names, tilt = 0.35, roll = 0) {
  const D = molData(key), P = names.map(n => D.P[D.idx[n]]).filter(Boolean), c = P.reduce((a, p) => a.add(p), new THREE.Vector3()).divideScalar(P.length);
  let n = new THREE.Vector3();
  for (let i = 0; i < P.length; i++) n.add(P[i].clone().sub(c).cross(P[(i + 1) % P.length].clone().sub(c)));
  n.normalize();
  const x = P[Math.min(3, P.length - 1)].clone().sub(P[0]); x.sub(n.clone().multiplyScalar(x.dot(n))).normalize();
  const y = n.clone().cross(x);
  const M = new THREE.Matrix4().makeBasis(x, y, n).transpose();
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, 0, roll)).multiply(new THREE.Quaternion().setFromRotationMatrix(M));
}

/* a rotation that takes direction a onto direction b, then turns round b by `roll` */
export const qOnto = (a, b, roll = 0) => new THREE.Quaternion().setFromAxisAngle(b.clone().normalize(), roll).multiply(new THREE.Quaternion().setFromUnitVectors(a.clone().normalize(), b.clone().normalize()));
/* a pose that puts atom `name` of molecule `key` at the world point `at`, with the rest of the molecule in direction `away` */
export function poseAt(key, name, at, away, roll = 0) {
  const D = molData(key), a = D.P[D.idx[name]], c = D.P.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(D.P.length);
  const q = qOnto(c.clone().sub(a), away, roll);
  return { p: at.clone().sub(a.clone().applyQuaternion(q)), q };
}
/* the same pose moved by d (a molecule arriving or leaving) */
export const moved = (P, d, f = 1) => ({ p: P.p.clone().addScaledVector(d, f), q: P.q });
