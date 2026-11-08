/* ============================================================
   xins.js — Explore: how insulin brings in more glucose transporters (7 Nov 2026), the IB view's path for C2.1.11 (HL).
   Daniel, 7 Nov 2026: "Can you make so that actually you see that happening ... watch how insulin binds to its proper
   receptor and also draw it properly, that receptor in the membrane, probably a glycoprotein, name it, and then you see
   everything ... happening and the vesicle arriving with GLUT4. And then this binds to the membrane and allows the glucose
   to enter ... if you're going to animate this, it must be professionally done."
   Every size is true (nm), as in the rest of the view; the cytosol is above the membrane, the tissue fluid below (chapter 1).
   Measured (tools/ib-insulin.py, tools/ib-proteins.py): the receptor's part outside the cell before insulin binds (PDB 8U4B)
   and with four insulin molecules bound (6PXV), cut into its domains, each moved from the first shape to the second as a
   rigid body (all together: moved one after another, neighbouring domains came 1.5 nm apart); insulin (6PXV); the kinase
   part inside the cell with ATP and a piece of IRS-1 in its active site (1IR3, the tyrosine phosphorylated in step 6);
   GLUT4 (7WSM). Drawn, because no structure holds them: the helices that cross the membrane and the linkers, the sugar
   chains (at the asparagines that carry them, in the usual symbol colours: N-acetylglucosamine blue, mannose green,
   galactose yellow, sialic acid purple, fucose red), the proteins of the sequence of reactions (IRS-1, PI3-kinase, Akt,
   AS160, Rab: their sizes from their masses, their shapes simplified), the SNARE proteins, and the vesicle: 60 nm across
   (GLUT4 storage vesicles are 50-70 nm), with five GLUT4 (vesicles carry 1 to about 20).
   The vesicle is cut open, like the membrane: its lipids in rows behind the cut, its far half a smooth shell. When it fuses,
   a neck joins it to the plasma membrane and widens until the vesicle is flat (55 nm across: its membrane's area as a
   disc). Its lipids keep their places counted from its top, so those at the neck pass into the plasma membrane one by
   one: nothing jumps, and no two lipids overlap. The transporters, counted the same way, end in the plasma membrane
   facing the right way: the side that faced the inside of the vesicle now faces the tissue fluid.
   After the expert review (7 Nov 2026, insulin-review.md in the mito round's notes folder): no sugar chain ever enters the
   bilayer (each is tested over the whole change of shape, and turned away if it would); the cascade proteins are drawn
   at the volumes of their masses (0.81 kDa per nm3); the two Mg2+ of the active site are measured (1IR3); steps 4, 5 and
   7 are seen 30 degrees round, so that each half stays on its side as the legs close one behind the other.
   Speed (a slow phone, tools/ib-speed.mjs --x x-insulin): while the vesicle only moves, its lipids are placed once and
   carried; while it fuses, their matrices and its far half's surfaces are written straight into their arrays.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { mergeGeometries, mergeVertices } from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js?v=0.185.1';
import { ballStick, gather, Reaction, molData } from './mol.js?v=202611081443';
import { MOL } from './mol-data.js?v=202611081443';
import { loadProts, protein, protMat, surfacePoints, fadeProt } from './prot.js?v=202611081443';
import { bilayer, MEM } from './membrane.js?v=202611081443';
import { disposeGroup, glow, smooth } from './stage.js?v=202611081443';

const PROTS = ['ir', 'irk', 'glut4'];
export const prefetch = () => loadProts(PROTS);

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
/* a shape that is replaced as the picture changes starts as a tiny real one: its colours (shader program) are made, before
   the path shows, for a shape with normals (an empty one made a program without them, which failed to compile) */
const seedGeo = () => new THREE.SphereGeometry(0.001, 4, 3);
const QI = new THREE.Quaternion();
const lerp = (a, b, t) => a + (b - a) * t;
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const hash = (a, b, c) => { let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791); h = Math.imul(h ^ h >>> 13, 0x5bd1e995); return ((h ^ h >>> 15) >>> 0) / 4294967296; };

/* the colours: the receptor's two halves, insulin's two chains, the proteins of the sequence of reactions */
const COL = { A: 0x5fa8ff, B: 0x9a86ff, insA: 0xffc94a, insB: 0xff9440, irs: 0x41d38c, pi3k: 0xff8a5c, akt: 0xe2c8ff, as160: 0xd8a878, rab: 0xff6b8b, snare: 0x8fe0ff };
const SNFG = { glcnac: 0x3f7fd9, man: 0x3fb05a, gal: 0xf2cf3d, sia: 0xa35bc9, fuc: 0xe0483c };
/* where things are (nm): the fusion axis, the vesicle (outer radius 30, so its membrane's middle 27.6), the neck's bend */
const XF = 85, R_OUT = 30, R_MID = R_OUT - MEM.headY - MEM.headR, RHO = 2.5;
const YV0 = 64, YV1 = 39.6, YV2 = R_MID + RHO + 2.3;   /* the vesicle's middle: in the cytosol, its SNAREs formed, docked */
const HIGH_MAN = new Set([111, 215, 514]);          /* Sparrow et al. 2008: high-mannose chains at these asparagines */

/* a protein drawn at its true size but with a simplified shape: overlapping lumpy spheres (nm) */
function blobGeo(spheres, seed = 1) {
  const R = rng(seed), geos = [];
  for (const [x, y, z, r] of spheres) {
    let g = new THREE.IcosahedronGeometry(r, 3); g.deleteAttribute('uv'); g.deleteAttribute('normal'); g = mergeVertices(g);
    const pos = g.attributes.position, v = V3(), n = V3();
    const bumps = Array.from({ length: 7 }, () => [V3(R() - 0.5, R() - 0.5, R() - 0.5).normalize(), 0.4 + R() * 0.8]);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i); n.copy(v).normalize();
      let k = 0; for (const [d, w] of bumps) k += Math.pow(Math.max(0, n.dot(d)), 3) * w;
      v.multiplyScalar(1 + 0.13 * (k - 0.35)); pos.setXYZ(i, v.x + x, v.y + y, v.z + z);
    }
    geos.push(g);
  }
  const m = mergeGeometries(geos); m.computeVertexNormals(); m.computeBoundingSphere(); return m;
}
function blob(spheres, color, seed) {
  const m = new THREE.Mesh(blobGeo(spheres, seed), protMat(color, { rimK: 0.45 }));
  m.userData.mats = { a: m.material }; return m;
}
/* a small phosphate group (P and three oxygens) at c, pointing along d */
function phosphate(c, d, s = 1) {
  const n = d.clone().normalize(), a = V3(1, 0, 0).cross(n).lengthSq() > 0.1 ? V3(1, 0, 0).cross(n).normalize() : V3(0, 1, 0).cross(n).normalize(), b = n.clone().cross(a);
  const P = c.clone().addScaledVector(n, 0.15), atoms = [{ el: 'P', p: P, s }];
  for (let k = 0; k < 3; k++) { const th = k * 2.0944; atoms.push({ el: 'O', p: P.clone().addScaledVector(n, 0.05).addScaledVector(a, 0.142 * Math.cos(th)).addScaledVector(b, 0.142 * Math.sin(th)), s }); }
  atoms.push({ el: 'O', p: c.clone().addScaledVector(n, -0.01), s });
  return { atoms, bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [0, 4, 1]] };
}

export async function build(stage, { V }) {
  const [IR, IRK, GL] = await loadProts(PROTS);
  /* the kinase's molecules (ATP, ADP, the IRS-1 tyrosine before and after), in the format of mol-data.js */
  for (const k in IRK.mols) if (!MOL[k]) MOL[k] = IRK.mols[k];
  const g = new THREE.Group(); g.name = 'xins';
  const BS = ballStick(320, 380); g.add(BS.group);

  /* ================= the plasma membrane: a basal GLUT4 stands in a window at its left ================= */
  const GB = V3(-24, 0, -3.2);
  const mem = bilayer({ x0: -48, x1: 160, depth: 9, holes: [{ x: GB.x, z: GB.z, r: 3.5 }] });
  g.add(mem);
  const MH = mem.userData.heads, MT = mem.userData.tails, [headMat, tailMat] = mem.userData.mats;
  const H0 = MH.instanceMatrix.array.slice(), T0 = MT.instanceMatrix.array.slice();
  const tmpM = new THREE.Matrix4(), tmpP = V3();
  const lip = [];                       /* every lipid of the plasma membrane: where it is, and whether it is hidden */
  for (let i = 0; i < MH.count; i++) { MH.getMatrixAt(i, tmpM); tmpP.setFromMatrixPosition(tmpM); lip.push({ x: tmpP.x, y: tmpP.y, z: tmpP.z, off: false }); }
  const nearR = lip.map((l, i) => i).filter(i => Math.abs(lip[i].x) < 11 && lip[i].z > -9.6);
  const nearF = lip.map((l, i) => i).filter(i => Math.abs(lip[i].x - XF) < 72);
  const zeroA = new THREE.Matrix4().makeScale(0, 0, 0).elements;
  function setLip(i, off) {
    if (lip[i].off === off) return false; lip[i].off = off;
    const H = MH.instanceMatrix.array, T = MT.instanceMatrix.array;
    if (off) { H.set(zeroA, i * 16); T.set(zeroA, i * 32); T.set(zeroA, i * 32 + 16); }
    else { H.set(H0.subarray(i * 16, i * 16 + 16), i * 16); T.set(T0.subarray(i * 32, i * 32 + 32), i * 32); }
    return true;
  }
  const glB = protein(GL, { colors: { N: 0x37d2bd, C: 0x2aa9cf }, glass: true, opacity: 0.32 }); glB.position.copy(GB); g.add(glB);

  /* ================= the receptor: its domains, before (8U4B) → after (6PXV) ================= */
  const colors = {}; IR.parts.forEach(p => { colors[p.grp] = p.h === 'A' ? COL.A : COL.B; });
  const rec = protein({ key: 'ir', name: IR.name, parts: IR.parts, sites: {} }, { colors }); g.add(rec);
  const RP = IR.parts.map((p, i) => ({ m: rec.children[i], c: V3(...p.c), cb: V3(...p.cb), q: new THREE.Quaternion(...p.q), h: p.h, d: p.d }));
  let morphNow = -1;
  function placeReceptor(f) {
    if (f === morphNow) return; morphNow = f;
    const e = f * f * (3 - 2 * f);
    for (const P of RP) { P.m.quaternion.slerpQuaternions(QI, P.q, e); P.m.position.lerpVectors(P.c, P.cb, e); P.m.updateMatrixWorld(); }
  }
  placeReceptor(0);
  const partOf = (h, d) => RP.find(P => P.h === h && P.d === d);
  /* the sugar chains, on the domains that carry them (they move with them) */
  const glyMat = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0, emissive: 0x161616, emissiveIntensity: 1 });
  const glyBeads = [];
  {
    const byPart = new Map();
    IR.glyc.forEach((G, i) => {
      const at = V3(...G.at), spin = rng(1000 + i * 7 + (RP[G.p].h === 'B' ? 500 : 0))() * Math.PI * 2;
      const tree = d => {
        const perp = V3(0, 1, 0).cross(d).lengthSq() > 0.05 ? V3(0, 1, 0).cross(d).normalize() : V3(1, 0, 0).cross(d).normalize();
        perp.applyAxisAngle(d, spin);
        const rot = (a) => d.clone().applyAxisAngle(perp, a), st = 0.52, out = [];
        const b0 = at.clone().addScaledVector(d, 0.42), b1 = b0.clone().addScaledVector(d, st), b2 = b1.clone().addScaledVector(d, st);
        out.push([b0, 'glcnac'], [b1, 'glcnac'], [b2, 'man']);
        for (const sg of [1, -1]) {
          const b3 = b2.clone().addScaledVector(rot(sg * 0.8), st); out.push([b3, 'man']);
          if (HIGH_MAN.has(G.k)) { const b4 = b3.clone().addScaledVector(rot(sg * 0.35), st); out.push([b4, 'man'], [b4.clone().addScaledVector(rot(sg * 1.05), st), 'man'], [b4.clone().addScaledVector(rot(sg * 0.1), st), 'man']); }
          else { const b4 = b3.clone().addScaledVector(rot(sg * 0.3), st), b5 = b4.clone().addScaledVector(rot(sg * 0.12), st), b6 = b5.clone().addScaledVector(rot(-sg * 0.25), st); out.push([b4, 'glcnac'], [b5, 'gal'], [b6, 'sia']); }
        }
        if (!HIGH_MAN.has(G.k)) out.push([b0.clone().addScaledVector(rot(1.6), st * 0.95), 'fuc']);
        return out;
      };
      /* a chain is polar, so it never enters the bilayer (chapter 1, B2.1.2), at any moment of the change of shape: one that
         would reach the outer heads is turned away from the membrane, as little as it needs (the expert review, 7 Nov 2026) */
      const P = RP[G.p], qf = new THREE.Quaternion(), pf = V3(), w = V3(), top = -(MEM.headY + MEM.headR) - 0.35;
      const clear = out => { for (const f of [0, 0.25, 0.5, 0.75, 1]) { const e = f * f * (3 - 2 * f); qf.slerpQuaternions(QI, P.q, e); pf.lerpVectors(P.c, P.cb, e); for (const [b] of out) { w.copy(b).applyQuaternion(qf).add(pf); if (w.y > top) return false; } } return true; };
      const d0 = V3(...G.d).normalize();
      let out = tree(d0);
      if (!clear(out)) {
        const a1 = V3(0, 1, 0).cross(d0).lengthSq() > 0.05 ? V3(0, 1, 0).cross(d0).normalize() : V3(1, 0, 0).cross(d0).normalize(), a2 = d0.clone().cross(a1);
        search: for (const ang of [0.25, 0.5, 0.75, 1.0, 1.3, 1.6]) for (const ax of [a1, a1.clone().negate(), a2, a2.clone().negate()]) { const o2 = tree(d0.clone().applyAxisAngle(ax, ang)); if (clear(o2)) { out = o2; break search; } }
      }
      if (!byPart.has(G.p)) byPart.set(G.p, []);
      byPart.get(G.p).push(...out);
    });
    const geo = new THREE.IcosahedronGeometry(0.245, 1), o = new THREE.Object3D(), c = new THREE.Color();
    byPart.forEach((beads, pi) => {
      const m = new THREE.InstancedMesh(geo, glyMat, beads.length);
      m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(beads.length * 3), 3);
      beads.forEach(([p, kind], k) => { o.position.copy(p); o.updateMatrix(); m.setMatrixAt(k, o.matrix); m.setColorAt(k, c.setHex(SNFG[kind])); });
      m.instanceMatrix.needsUpdate = true; m.computeBoundingSphere();
      RP[pi].m.add(m);
      beads.forEach(([p]) => glyBeads.push({ P: RP[pi], p }));
    });
  }
  const glyWorld = () => glyBeads.filter((b, i) => i % 9 === 4).map(b => b.P.m.localToWorld(b.p.clone()));

  /* ================= insulin: four molecules; each binds to its site and is carried by its domain ================= */
  IR.insulin.parts.forEach(p => { p.grp = p.chain; });
  const insP = { key: 'insulin', name: 'insulin', parts: IR.insulin.parts, sites: {} };
  const INS = IR.insulin.copies.map((cp, k) => {
    const o = protein(insP, { colors: { A: COL.insA, B: COL.insB } }); g.add(o);
    const P = RP[cp.part], lq = new THREE.Quaternion(...cp.q), lp = V3(...cp.p);
    /* where it is at the end (after), and a start in the tissue fluid below and outside it */
    const endP = P.cb.clone().add(lp.clone().applyQuaternion(P.q));
    const out = V3(endP.x, 0, endP.z + 3).normalize();
    const start = endP.clone().addScaledVector(out, 5 + 1.5 * k).add(V3((k % 2 ? -1 : 1) * 1.5, -2.5 - 0.8 * k, 3 + 0.6 * k));
    const R = rng(77 + k);
    return { o, P, lq, lp, start, out, q0: new THREE.Quaternion().setFromEuler(new THREE.Euler(R() * 6, R() * 6, R() * 6)), ph: R() * 6.28, site: cp.site };
  });
  const tq = new THREE.Quaternion(), tv = V3();
  function placeInsulin(I, a, t) {
    /* bound: on its domain, wherever the domain is now */
    tq.copy(I.P.m.quaternion).multiply(I.lq);
    tv.copy(I.lp).applyQuaternion(I.P.m.quaternion).add(I.P.m.position);
    const e = smooth(0, 1, a), drift = (1 - e) * 0.35;
    const free = I.start.clone().add(V3(Math.sin(t * 0.7 + I.ph), Math.cos(t * 0.55 + I.ph * 1.3), Math.sin(t * 0.5 + I.ph * 0.7)).multiplyScalar(drift));
    /* on its way it comes from outside the receptor, never through it */
    const bulge = I.out.clone().multiplyScalar(3.2 * Math.sin(Math.PI * Math.min(1, e)) * (1 - e * 0.5));
    I.o.position.copy(free).lerp(tv, e).add(bulge);
    I.o.quaternion.copy(I.q0).slerp(tq, smooth(0.25, 1, a));
  }

  /* ================= the membrane-crossing helices and linkers (drawn), the kinases (1IR3) ================= */
  const tubeMat = { A: protMat(COL.A, { rimK: 0.4 }), B: protMat(COL.B, { rimK: 0.4 }) };
  const rodMat = { A: protMat(COL.A, { glass: true, opacity: 0.22 }), B: protMat(COL.B, { glass: true, opacity: 0.22 }) };
  const tubes = { A: [], B: [] };
  /* the helix: one turn every 0.54 nm, about 3.8 nm across the bilayer (about 25 amino acids); made once, then moved */
  const helixGeo = (() => { const hp = []; for (let i = 0; i <= 90; i++) { const u = i / 90, a = u * 7.4 * Math.PI * 2; hp.push(V3(0.23 * Math.cos(a), -2.0 + 4.0 * u, 0.23 * Math.sin(a))); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp), 220, 0.13, 6, false); })();
  const rodGeo = new THREE.CylinderGeometry(0.55, 0.55, 4.0, 14, 1, false);
  ['A', 'B'].forEach(h => { for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(k === 1 ? helixGeo : k === 3 ? rodGeo : seedGeo(), k === 3 ? rodMat[h] : tubeMat[h]); g.add(m); tubes[h].push(m); } });
  const kin = {};
  ['A', 'B'].forEach(h => {
    const o = protein(IRK, { colors: { N: COL[h], C: COL[h], pep: COL.irs }, glass: true, opacity: 0.26 }); g.add(o);
    o.children.forEach(m => { if (m.userData.grp === 'pep') { m.visible = false; m.userData.isPep = true; } });
    kin[h] = o;
  });
  const KN = V3(...IRK.sites.nterm), KY = 5.2 - KN.y;
  const kinAt = (h, f) => {
    const e = smooth(0, 1, f), sx = h === 'A' ? -1 : 1;
    return { p: V3(sx * lerp(7.9, 2.75, e), KY, -3.0), q: new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), -sx * THREE.MathUtils.degToRad(lerp(6, 18, e))) };
  };
  const legEnd = h => { const P = partOf(h, 'F3'); return P.m.localToWorld(V3(...IR.ends[h].apo).sub(P.c)); };
  let tubeKey = '';
  const curves = {};
  function placeInner(morph, kf) {
    const key = morph.toFixed(4) + '|' + kf.toFixed(4);
    for (const h of ['A', 'B']) { const k = kinAt(h, kf); kin[h].position.copy(k.p); kin[h].quaternion.copy(k.q); kin[h].updateMatrixWorld(); }
    if (key === tubeKey) return; tubeKey = key;
    for (const h of ['A', 'B']) {
      const L = legEnd(h), x = L.x * 0.94, z = L.z, top = kin[h].localToWorld(KN.clone());
      const link = new THREE.CatmullRomCurve3([L, V3(lerp(L.x, x, 0.5), -3.0, z), V3(x, -2.2, z)]);
      const jm = new THREE.CatmullRomCurve3([V3(x, 2.0, z), V3(x, 3.0, z + 0.3), V3(lerp(x, top.x, 0.45), 3.9, lerp(z, top.z, 0.5) + 0.8), V3(lerp(x, top.x, 0.8), 4.9, top.z + 0.4), top]);
      curves[h] = { link, jm, x, z };
      const T = tubes[h];
      const set = (m, geo) => { m.geometry.dispose(); m.geometry = geo; };
      set(T[0], new THREE.TubeGeometry(link, 16, 0.2, 7, false));
      T[1].position.set(x, 0, z); T[3].position.set(x, 0, z);
      set(T[2], new THREE.TubeGeometry(jm, 40, 0.2, 7, false));
    }
    /* no lipid where a helix crosses the membrane, or in front of it */
    let ch = false;
    for (const i of nearR) {
      const l = lip[i];
      const off = ['A', 'B'].some(h => (Math.abs(l.x - curves[h].x) < 1.05 || Math.abs(l.x - (curves[h].x - 0.575 * (l.z - curves[h].z))) < 1.05) && l.z > curves[h].z - 0.75);
      if (setLip(i, off)) ch = true;
    }
    if (ch) { MH.instanceMatrix.needsUpdate = true; MT.instanceMatrix.needsUpdate = true; }
  }
  const jmPoint = h => curves[h].jm.getPointAt(0.42);

  /* ================= the IRS-1 piece and the active site of kinase B (the close-up of step 6) ================= */
  const kB = kin.B;
  const pepB = kB.children.find(m => m.userData.isPep);
  const rxPose = () => { kB.updateMatrixWorld(); return k => ({ p: kB.localToWorld(V3(...MOL[k].at)), q: kB.quaternion.clone() }); };
  let RX = null;
  function reaction() {
    if (RX) return RX;
    const P = rxPose();
    RX = new Reaction({
      from: [{ key: 'atp_k', id: 'a', P: P('atp_k') }, { key: 'tyr_k', id: 't', P: P('tyr_k') }],
      to: [{ key: 'adp_k', id: 'a', P: P('adp_k') }, { key: 'ptyr_k', id: 't', P: P('ptyr_k') }],
      moves: [['a:PG', 't:P'], ['a:O1G', 't:O1P'], ['a:O2G', 't:O2P'], ['a:O3G', 't:O3P']]
    });
    return RX;
  }
  const siteW = () => kB.localToWorld(V3(...IRK.sites.atp));
  const mgMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.072, 2), new THREE.MeshStandardMaterial({ color: 0x7ee38f, emissive: 0x1d5a26, emissiveIntensity: 0.6, roughness: 0.3 }), 2);
  mgMesh.frustumCulled = false; g.add(mgMesh);
  const mgW = () => ['mg1', 'mg2'].filter(k => IRK.sites[k]).map(k => kB.localToWorld(V3(...IRK.sites[k])));
  const kHole = () => { const c = kB.localToWorld(V3(...IRK.sites.atp).add(V3(0, 0, 1.3))); kB.userData.hole.set(c.x, c.y, c.z, 1.9); };

  /* ================= the proteins of the sequence of reactions (drawn: true sizes, simple shapes) ================= */
  const irs = new THREE.Group(); g.add(irs);
  const irsPTB = blob([[0, 0, 0, 1.45], [0.9, 0.3, 0.4, 1.0]], COL.irs, 11), irsPH = blob([[0, 0, 0, 1.5], [-0.7, -0.4, 0.5, 1.0]], COL.irs, 12);
  irs.add(irsPTB, irsPH);
  const irsTail = new THREE.Mesh(seedGeo(), protMat(COL.irs, { rimK: 0.4 })); irs.add(irsTail);
  const irsTailMat = irsTail.material; irsPTB.userData.mats.b = irsTailMat;
  const pi3k = new THREE.Group(); g.add(pi3k);
  const p85 = blob([[0, 0, 0, 2.1], [3.8, 1.0, 0.4, 2.0], [1.8, 2.4, -0.6, 1.4], [3.2, 4.0, -1.0, 1.2]], COL.pi3k, 21);
  const p110 = blob([[0, 0, 0, 2.9], [2.6, -0.45, 0.67, 2.1], [-1.7, 1.0, -0.9, 1.8]], 0xff7148, 22);
  p85.position.set(-5.4, 0.8, 1.4); pi3k.add(p85, p110);
  const akt = new THREE.Group(); g.add(akt);
  const aktPH = blob([[0, 0, 0, 1.24]], COL.akt, 31), aktK = blob([[0, 0, 0, 2.2], [1.4, 0.86, 0.32, 1.57]], COL.akt, 32);
  aktPH.position.set(0, -2.8, 0); akt.add(aktPH, aktK);
  /* the vesicle frame: x relative to the fusion axis, y and z as the scene's */
  const ves = new THREE.Group(); ves.position.set(XF, 0, 0); g.add(ves);
  /* the vesicle's middle: what belongs to the vesicle is placed from it once and carried while it moves; once it fuses,
     this frame stands at the membrane (y 0) and its lipids are placed where the changing shape puts them */
  const vc = new THREE.Group(); ves.add(vc);
  const dAS = V3(17 - XF, 5.6 - YV0, -2).normalize();
  const as160 = blob([[0, 0, 0, 3.22], [2.19, 1.37, -0.55, 1.92], [-1.64, 2.06, 0.82, 1.51]], COL.as160, 41); vc.add(as160);
  const rabs = [-22, -10, 9, 21].map((a, k) => {
    const d = dAS.clone().applyAxisAngle(V3(0, 0, 1), THREE.MathUtils.degToRad(a)); d.z = -0.06 - 0.05 * (k % 2); d.normalize();
    const m = blob([[0, 0, 0, 1.81], [1.0, 0.62, 0.25, 1.0]], COL.rab, 50 + k); m.userData.dir = d; vc.add(m); return m;
  });
  /* PIP2 in the inner layer (lilac: its inositol, orange: its phosphate groups); PI3-kinase adds a third: PIP3 */
  const pipHeads = lip.map((l, i) => i).filter(i => lip[i].y > 0 && lip[i].x > 15.2 && lip[i].x < 21.5 && lip[i].z > -3.6)
    .sort((a, b) => Math.hypot(lip[a].x - 18.2, lip[a].z + 1.5) - Math.hypot(lip[b].x - 18.2, lip[b].z + 1.5)).slice(0, 6);
  const inoMat = new THREE.MeshStandardMaterial({ color: 0xd9bcff, emissive: 0x3a2466, emissiveIntensity: 0.6, roughness: 0.4 });
  const inos = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.3, 1), inoMat, pipHeads.length);
  { const o = new THREE.Object3D(); pipHeads.forEach((i, k) => { o.position.set(lip[i].x, lip[i].y + 0.62, lip[i].z); o.updateMatrix(); inos.setMatrixAt(k, o.matrix); }); inos.instanceMatrix.needsUpdate = true; inos.computeBoundingSphere(); }
  g.add(inos);
  const pipP = pipHeads.map((i, k) => { const c = V3(lip[i].x, lip[i].y + 0.62, lip[i].z); return [c.clone().add(V3(-0.3, 0.22, 0.05)), c.clone().add(V3(0.3, 0.22, -0.05)), c.clone().add(V3(0, 0.36, 0.2))]; });
  const pipGlow = glow(5.5, 0xffd08a, 0.0); g.add(pipGlow);
  /* their phosphate groups as orange balls (a phosphorus and its oxygens, about 0.4 nm) */
  const pdMat = new THREE.MeshStandardMaterial({ color: 0xff9a1f, emissive: 0x5a2a00, emissiveIntensity: 0.6, roughness: 0.35 });
  const pipDots = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.2, 1), pdMat, pipHeads.length * 3); g.add(pipDots);
  const pipR = pipHeads.reduce((a, i) => (lip[i].x > lip[a].x ? i : a), pipHeads[0]);
  const aktBound = V3(lip[pipR].x, lip[pipR].y + 0.62 + 0.3 + 1.24 + 2.8, lip[pipR].z);
  /* SNARE proteins: four twisted pairs round the contact (drawn) */
  const snMat = protMat(COL.snare, { rimK: 0.4 }); snMat.transparent = true;
  const snares = [205, 250, 295, 338].map(a => { const m = new THREE.Mesh(seedGeo(), snMat); m.userData.a = THREE.MathUtils.degToRad(a); ves.add(m); return m; });

  /* ================= the vesicle: its profile, its lipids in rows behind the cut, its far half, its GLUT4 ================= */
  const ROWS = []; for (let z = -0.42; z > -9; z -= MEM.gap * 0.866) ROWS.push(z);
  const CAPN = 6800;
  const vH = new THREE.InstancedMesh(MH.geometry, headMat, CAPN), vT = new THREE.InstancedMesh(MT.geometry, tailMat, CAPN * 2);
  vH.count = 0; vT.count = 0; vH.frustumCulled = vT.frustumCulled = false; vc.add(vH, vT);
  const shellMat = new THREE.MeshStandardMaterial({ color: 0xff9ac8, emissive: 0x5c1a3c, emissiveIntensity: 0.45, roughness: 0.55, side: THREE.DoubleSide, transparent: true, depthWrite: true });
  shellMat.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n if (vWP.z > -8.75) discard;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n float dots = 0.5 + 0.5 * sin(vWP.x * 7.6) * sin(vWP.y * 7.6) * sin(vWP.z * 7.6);\n diffuseColor.rgb *= 0.82 + 0.3 * dots;');
  };
  const shells = [new THREE.Mesh(seedGeo(), shellMat), new THREE.Mesh(seedGeo(), shellMat)]; vc.add(...shells); shells.forEach(m => { m.frustumCulled = false; });
  /* the profile (r from the axis, y), from the vesicle's top down: a sphere before it fuses; after, its cap, the neck and the
     start of the plane. s: 0 → 0.5 the neck widens until a hemisphere is left; 0.5 → 1 it flattens into the membrane */
  function profile(yv, s) {
    const pts = [];
    if (s <= 0) {
      for (let i = 0; i <= 120; i++) { const b = Math.PI * (1 - i / 120); pts.push([R_MID * Math.sin(b), yv - R_MID * Math.cos(b), Math.sin(b), -Math.cos(b)]); }
      return { pts, rn: 0, fused: false };
    }
    let Rc, al;
    const a0 = Math.asin((RHO + 1.0) / (R_MID + RHO));
    if (s <= 0.5) { Rc = R_MID; al = a0 + (Math.PI / 2 - a0) * smooth(0, 0.5, s); }
    else {
      const e = smooth(0.5, 1, s), b = lerp(R_MID, 55, e), H = lerp(R_MID + RHO, 0.25, e);
      let lo = Math.PI / 2, hi = Math.PI - 1e-5;
      const f = a => (b / Math.sin(a) + RHO) * (1 + Math.cos(a)) - H;
      for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; }
      al = (lo + hi) / 2; Rc = b / Math.sin(al);
    }
    const yc = RHO + (Rc + RHO) * Math.cos(al), rn = (Rc + RHO) * Math.sin(al);
    const nb = 110; for (let i = 0; i <= nb; i++) { const be = Math.PI - (Math.PI - al) * i / nb; pts.push([Rc * Math.sin(be), yc - Rc * Math.cos(be), Math.sin(be), -Math.cos(be)]); }
    const ng = 18, g0 = Math.PI - al; for (let i = 1; i <= ng; i++) { const ga = g0 * (1 - i / ng); pts.push([rn - RHO * Math.sin(ga), RHO - RHO * Math.cos(ga), Math.sin(ga), Math.cos(ga)]); }
    return { pts, rn, fused: true };
  }
  /* arc lengths along the profile (from its top) */
  const arcs = pts => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L; };
  const atArc = (pts, L, s) => {
    if (s <= 0) return pts[0];
    for (let i = 1; i < pts.length; i++) if (L[i] >= s) { const k = (s - L[i - 1]) / Math.max(1e-9, L[i] - L[i - 1]), a = pts[i - 1], b = pts[i]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)]; }
    return null;
  };
  /* the vesicle's transporters: counted from its top along the profile, alternately right and left, in the rows' middle */
  const VG = [[9, 1], [17, -1], [26, 1], [34, -1], [42, 1]].map(([sg, side]) => {
    const o = protein(GL, { colors: { N: 0x37d2bd, C: 0x2aa9cf }, glass: true, opacity: 0.32 }); vc.add(o); return { o, sg, side, z: -2.6 };
  });
  const xAxis = V3(1, 0, 0), yAxis = V3(0, 1, 0);
  function poseOnProfile(P, L, sg, side, z, out) {
    const len = L[L.length - 1];
    let r, y, nr, ny;
    if (sg <= len || !P.fused) { const a = atArc(P.pts, L, Math.min(sg, len)); [r, y, nr, ny] = a; }
    else { r = P.rn + (sg - len); y = 0; nr = 0; ny = 1; }
    const rr = Math.max(Math.abs(z) + 0.3, r), cx = side * Math.sqrt(rr * rr - z * z), co = cx / rr, si = z / rr;
    out.p.set(cx, y, z);
    const n = V3(nr * co, ny, nr * si).normalize(), t = V3(ny * co, -nr, ny * si).normalize();
    const m = new THREE.Matrix4().makeBasis(t, n, t.clone().cross(n)); out.q.setFromRotationMatrix(m);
    out.n = n;
    return out;
  }
  let vesKey = '', sepDone = false;
  const VP = { pts: [], rn: 0, fused: false };
  const HA = vH.instanceMatrix.array, TA = vT.instanceMatrix.array;
  const TY = MEM.headY - MEM.headR - MEM.tail / 2 + 0.15;
  let nh = 0, nt = 0;
  /* one lipid pair (both layers) at a point of the membrane's middle, (nx, ny, nz) towards the cytosol: the heads only move
     (InstancedMesh starts every matrix as identity), the tails turn from +y to n (R = I + K + K²/(1 + ny)); a is the angle
     of the two tails round n */
  function put(mx, my, mz, nx, ny, nz, a) {
    let r00, r01, r02, r10, r11, r12, r20, r21, r22;
    if (ny < -0.9999) { r00 = 1; r01 = 0; r02 = 0; r10 = 0; r11 = -1; r12 = 0; r20 = 0; r21 = 0; r22 = -1; }
    else { const f = 1 / (1 + ny); r00 = 1 - f * nx * nx; r01 = nx; r02 = -f * nx * nz; r10 = -nx; r11 = ny; r12 = -nz; r20 = -f * nx * nz; r21 = nz; r22 = 1 - f * nz * nz; }
    const ca = Math.cos(a) * 0.2, sa = Math.sin(a) * 0.2, ox = ca * r00 + sa * r02, oy = ca * r10 + sa * r12, oz = ca * r20 + sa * r22;
    for (let sd = 1; sd >= -1; sd -= 2) {
      if (nh >= CAPN) return;
      let o = nh++ * 16; HA[o + 12] = mx + sd * MEM.headY * nx; HA[o + 13] = my + sd * MEM.headY * ny; HA[o + 14] = mz + sd * MEM.headY * nz;
      const tx = mx + sd * TY * nx, ty = my + sd * TY * ny, tz = mz + sd * TY * nz;
      for (let e = -1; e <= 1; e += 2) {
        o = nt++ * 16;
        TA[o] = r00; TA[o + 1] = r10; TA[o + 2] = r20; TA[o + 4] = r01; TA[o + 5] = r11; TA[o + 6] = r21; TA[o + 8] = r02; TA[o + 9] = r12; TA[o + 10] = r22;
        TA[o + 12] = tx + e * ox; TA[o + 13] = ty + e * oy; TA[o + 14] = tz + e * oz;
      }
    }
  }
  /* the far half's two surfaces, written in place (the shape's normals are the profile's own) */
  const SEG = 44;
  function shellInto(mesh, pts, sd) {
    const n = pts.length;
    let geo = mesh.geometry;
    if (!geo.userData.lathe || geo.userData.n !== n) {
      geo.dispose(); geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * (SEG + 1) * 3), 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * (SEG + 1) * 3), 3));
      const idx = []; for (let j = 0; j < SEG; j++) for (let i = 0; i < n - 1; i++) { const a0 = j * n + i, b0 = a0 + n; idx.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1); }
      geo.setIndex(idx); geo.userData = { lathe: true, n }; mesh.geometry = geo;
    }
    const P = geo.attributes.position.array, N = geo.attributes.normal.array;
    for (let j = 0; j <= SEG; j++) {
      const ph = Math.PI / 2 + Math.PI * j / SEG, sn = Math.sin(ph), cs = Math.cos(ph);
      for (let i = 0; i < n; i++) {
        const q = pts[i], r = Math.max(0, q[0] + sd * MEM.headY * q[2]), k = (j * n + i) * 3;
        P[k] = r * sn; P[k + 1] = q[1] + sd * MEM.headY * q[3]; P[k + 2] = r * cs; N[k] = q[2] * sn; N[k + 1] = q[3]; N[k + 2] = q[2] * cs;
      }
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true;
  }
  function placeVesicle(K) {
    const yv = K.dock > 0 ? lerp(YV1, YV2, smooth(0, 1, K.dock)) : lerp(YV0, YV1, smooth(0, 1, K.ves)), s = K.fuse;
    const key = yv.toFixed(3) + '|' + s.toFixed(4);
    if (key === vesKey) return; vesKey = key;
    /* SNAREs: from the plasma membrane's inner layer to the vesicle's outer layer, twisted (only while they are seen) */
    if (K.dock > 0.02 && s < 0.35) snares.forEach((m, k) => {
      const a = m.userData.a, r0 = 4.8 + (k % 2) * 1.1, x = r0 * Math.cos(a), z = r0 * Math.sin(a);
      const yb = yv - Math.sqrt(Math.max(0, R_OUT * R_OUT - r0 * r0)) - 0.2, y0 = 2.45;
      const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, tw = u * Math.PI * 3 + k; pts.push(V3(x + 0.35 * Math.cos(tw), lerp(y0, yb, u), z + 0.35 * Math.sin(tw))); }
      m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.32, 6, false);
    });
    const fused = s > 0;
    if (fused) sepDone = false;          /* Back from a fused picture: the sphere is placed again, once */
    /* before it fuses: its shape is a sphere, placed once round its middle; only the middle moves */
    vc.position.y = fused ? 0 : yv;
    if (!fused && sepDone) { VP.fused = false; VP.rn = 0; placeOwn(0, yv); return; }
    const P = profile(fused ? yv : 0, s); Object.assign(VP, P);
    const L = arcs(P.pts);
    /* the transporters, then the lipids round them */
    const gl = VG.map(G => { const pose = poseOnProfile(P, L, G.sg, G.side, G.z, { p: V3(), q: new THREE.Quaternion() }); G.o.position.copy(pose.p); G.o.quaternion.copy(pose.q); G.n = pose.n; return pose.p; });
    const ng = gl.length;
    const near = (x, y, z) => { for (let i = 0; i < ng; i++) { const q = gl[i], dx = x - q.x, dy = y - q.y; if (dx * dx + dy * dy < 6.6 && z > q.z - 2.3) return true; } return false; };
    nh = 0; nt = 0;
    for (let row = 0; row < ROWS.length; row++) {
      const z = ROWS[row], az = Math.abs(z);
      if (!fused) {
        const rz = Math.sqrt(Math.max(0, R_MID * R_MID - z * z)), N = Math.max(1, Math.round(2 * Math.PI * rz / MEM.gap));
        for (let k = 0; k < N; k++) {
          const th = (k + 0.5 + 0.5 * (row % 2) + 0.12 * (hash(row, 3, k) - 0.5)) / N * Math.PI * 2, x = rz * Math.sin(th), y = rz * Math.cos(th);
          if (near(x, y, z)) continue;
          put(x, y, z, x / R_MID, y / R_MID, z / R_MID, hash(row, 5, k) * 6.283);
        }
        continue;
      }
      /* fused: each side from the section's top down, 0.8 nm apart; the last lipid, half passed into the plane, fades */
      for (let side = 1; side >= -1; side -= 2) {
        const seg = []; let started = false, prev = null;
        for (const q of P.pts) {
          if (q[0] >= az + 1e-3) {
            if (!started && prev) { const f = (az - prev[0]) / Math.max(1e-9, q[0] - prev[0]); seg.push([0, lerp(prev[1], q[1], f), 0, lerp(prev[3], q[3], f), lerp(prev[2], q[2], f) * Math.sign(z || -1)]); }
            started = true; const cx = side * Math.sqrt(q[0] * q[0] - z * z); seg.push([cx, q[1], q[2] * cx / q[0], q[3], q[2] * z / q[0]]);
          } else if (started) break;
          prev = q;
        }
        if (seg.length < 2) continue;
        let acc = 0, want = row % 2 ? (side > 0 ? MEM.gap : 1e-4) : MEM.gap / 2, k = 0;
        for (let i = 1; i < seg.length; i++) {
          const a = seg[i - 1], b = seg[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
          while (acc + d >= want) {
            const f = Math.min(1, Math.max(0, (want - acc + 0.06 * (hash(row, side, k) - 0.5)) / d)), x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f);
            let nx = lerp(a[2], b[2], f), ny = lerp(a[3], b[3], f), nz = lerp(a[4], b[4], f); const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
            if (!near(x, y, z)) put(x, y, z, nx, ny, nz, hash(row, side * 7, k) * 6.283);
            k++; want += MEM.gap;
          }
          acc += d;
        }
      }
    }
    vH.count = nh; vT.count = nt; vH.instanceMatrix.needsUpdate = true; vT.instanceMatrix.needsUpdate = true;
    /* the far half: the two layers of heads as smooth surfaces, behind the rows; it fades as the vesicle flattens */
    shellMat.opacity = 1 - smooth(0.5, 0.82, s); shells.forEach(m => { m.visible = shellMat.opacity > 0.01; }); shellMat.depthWrite = shellMat.opacity > 0.98;
    if (shellMat.opacity > 0.01) { shellInto(shells[0], P.pts, 1); shellInto(shells[1], P.pts, -1); }
    /* the plasma membrane: open where the neck is, and under the flat vesicle */
    let ch = false;
    for (const i of nearF) {
      const l = lip[i], dx = l.x - XF;
      if (setLip(i, fused && dx * dx + l.z * l.z < (P.rn + 0.25) ** 2)) ch = true;
    }
    if (ch) { MH.instanceMatrix.needsUpdate = true; MT.instanceMatrix.needsUpdate = true; }
    if (!fused) sepDone = true;
    placeOwn(fused ? yv : 0, yv);
  }
  /* the vesicle's own proteins on its outer surface (cy: its middle in the frame vc stands in) */
  function placeOwn(cy) {
    const at = d => V3(d.x * R_OUT, cy + d.y * R_OUT, d.z * R_OUT);
    as160.userData.base = at(dAS).addScaledVector(dAS, 3.4);
    rabs.forEach(m => { m.position.copy(at(m.userData.dir)).addScaledVector(m.userData.dir, 1.9); });
  }

  /* ================= glucose, entering through three of the new transporters ================= */
  const G0 = molData('glucose');
  const GOS = [0, 1, 2];                 /* the three transporters they enter through (9, 17 and 26 nm from the vesicle's top) */
  const glcWait = [[-1.2, -7.0, 1.6], [1.0, -7.6, 1.2], [-0.4, -6.8, 2.0], [-14, -7.8, 0.6], [4.5, -8.4, -0.4], [19, -7.2, 1.2]].map(([x, y, z], k) => ({ d: V3(x, y, z), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(k * 0.9, k * 1.7, 0.4 + k)) }));
  const glcOut = [V3(-1.6, 6.6, 1.8), V3(1.8, 7.2, 1.6), V3(-0.6, 6.4, 2.2)];
  const gGlow = [0, 1, 2].map(() => { const h = glow(2.2, 0xfff0c0, 0); h.visible = false; g.add(h); return h; });
  const wGlow = [0, 1, 2].map(() => { const h = glow(2.0, 0xfff0c0, 0.32); h.visible = false; g.add(h); return h; });
  const rockOf = o => {
    const S = o.userData.sites, half = {}; o.children.forEach(m => { half[m.userData.grp] = m; });
    const pivot = S.nHalf.clone().add(S.cHalf).multiplyScalar(0.5).setY(0), dN = S.cHalf.clone().sub(S.nHalf).setY(0).normalize(), axis = V3(0, 1, 0).cross(dN).normalize();
    const TH = THREE.MathUtils.degToRad(9);
    return r => { const th = (1 - r) / 2 * TH; for (const [m, sg] of [[half.N, 1], [half.C, -1]]) { if (!m) continue; const q = new THREE.Quaternion().setFromAxisAngle(axis, sg * th); m.quaternion.copy(q); m.position.copy(pivot).sub(pivot.clone().applyQuaternion(q)); } };
  };
  VG.forEach(G => { G.rock = rockOf(G.o); G.rock(1); });
  const glB_rock = rockOf(glB); glB_rock(1);

  /* ================= the frame's knobs, its views and its steps ================= */
  const knobs = { cam: 0, i1: 0, i2: 0, i3: 0, i4: 0, morph: 0, kin: 0, pa: 0, pj: 0, irs: 0, rx: 0, irsP: 0, pi3k: 0, pip: 0, akt: 0, aktP: 0, aktGo: 0, as160: 0, rab: 0, ves: 0, dock: 0, fuse: 0, glc: 0 };
  const D = (x, y, z) => V(x, y, z).normalize(), UP = V(0, 1, 0);
  const SITE1 = (() => { const I = INS[0], e = smooth(0, 1, 0.42), q = new THREE.Quaternion().slerpQuaternions(QI, I.P.q, e); return I.P.c.clone().lerp(I.P.cb, e).add(I.lp.clone().applyQuaternion(q)); })();
  /* views (the camera moves straight from one to the next; `fit`: what must be seen, round the point looked at) */
  const views = [
    { at: V(-2, -4.5, -2), dist: 68, dir: D(0.1, 0.04, 1), up: UP },                                   /* 0 insulin arrives */
    { at: V(0, -3.6, -3), dist: 60, dir: D(0.16, 0.05, 1), up: UP },                                   /* 1 the receptor: its three parts */
    { at: SITE1.clone().add(V(-1.5, 1.5, 0)), dist: 27, dir: D(0.2, -0.05, 1), up: UP },               /* 2 binding */
    /* 3-4 and 6 are seen 30 degrees round: there each half stays on its side as the legs close one behind the other, and
       each kinase stays above its own half's helix (the expert review: from the front the halves crossed, an X) */
    { at: V(0, -11.3, -3), dist: 47, dir: D(-0.5, 0.06, 0.87), up: UP },                               /* 3 the T */
    { at: V(0, 6.2, -2.6), dist: 23, dir: D(-0.5, 0.22, 0.87), up: UP },                               /* 4 inside */
    null,                                                                                                 /* 5 the active site (set below) */
    { at: V(15, 6.2, -2), dist: 39, dir: D(-0.5, 0.16, 0.87), up: UP },                                /* 6 IRS-1, PI3-kinase */
    { at: V(53, 45.5, -1), dist: 186, dir: D(0.04, 0.06, 1), up: UP },                                 /* 7 Akt to the vesicle */
    { at: V(XF - 6, 40, -1), dist: 128, dir: D(0.03, 0.06, 1), up: UP },                               /* 8 the vesicle moves */
    { at: V(XF, 27, -1), dist: 121, dir: D(0.03, 0.08, 1), up: UP },                                   /* 9 fusion: the whole vesicle and the membrane under it */
    { at: V(XF + 4.5, -0.6, -2.6), dist: 66, dir: D(0.03, 0.1, 1), up: UP },                           /* 10 glucose enters, through three transporters */
    { at: V(45, -2, -1), dist: 164, dir: D(0.05, 0.07, 1), up: UP },                                   /* 11 summary */
    { at: V(XF, 0.5, -2), dist: 72, dir: D(0.03, 0.12, 1), up: UP },                                   /* 12 the transporters now in the membrane */
    { at: V(XF, 11, -1), dist: 96, dir: D(0.03, 0.1, 1), up: UP }                                      /* 13 the vesicle flattening */
  ];
  /* the close-up looks into kinase B's active site from in front of it (its +z) */
  {
    /* looked at between ATP and the tyrosine, so both have room for their names on each side */
    const k = kinAt('B', 1), mid = V3(...IRK.sites.atp).add(V3(...IRK.sites.tyr)).multiplyScalar(0.5), at = k.p.clone().add(mid.applyQuaternion(k.q));
    const dir = V3(0.18, 0.12, 1).applyQuaternion(k.q).normalize();
    /* it holds ATP and the tyrosine with room round them for their names, at any screen's shape (stage.js fitView) */
    views[5] = { at, dist: 5.2, dir, up: UP, fit: { pts: [[1.25, 0.8, 0.4]], min: 4.6 } };
  }
  const halos = [glow(4.5, 0xfff1c8, 0.55), glow(2.2, 0xffd8a0, 0.0), glow(7, 0xffe2b0, 0.0)]; halos.forEach(h => g.add(h));
  const pGlow = [glow(1.6, 0xffc070, 0), glow(1.6, 0xffc070, 0)]; pGlow.forEach(h => { h.visible = false; g.add(h); });

  let drawn = { atoms: [], bonds: [] }, lastK = {};
  function draw(K, t) {
    lastK = K;
    placeReceptor(K.morph);
    INS.forEach((I, k) => placeInsulin(I, [K.i1, K.i2, K.i3, K.i4][k], t));
    placeInner(K.morph, K.kin); kHole();
    placeVesicle(K);
    /* IRS-1: its PTB domain on the phosphotyrosine of half B's juxtamembrane part, its PH domain on the membrane, its tail
       through kinase B's active site (the measured piece) and on to its other tyrosines */
    const ia = smooth(0, 1, K.irs);
    irs.visible = ia > 0.002; pepB.visible = ia > 0.002;
    if (irs.visible) {
      const yj = jmPoint('B'), slide = V3(9, 9, 3).multiplyScalar(1 - ia);
      irsPTB.position.copy(yj).add(V3(1.1, 0.8, 1.3)).add(slide); irsPH.position.copy(yj).add(V3(3.6, 0.5, 0.9)).add(slide);
      irsPH.position.y = Math.max(irsPH.position.y, 2.4 + 1.5);
      const a = kB.localToWorld(V3(...IRK.sites.pepN)), b = kB.localToWorld(V3(...IRK.sites.pepC));
      const tail = new THREE.CatmullRomCurve3([irsPTB.position.clone(), irsPTB.position.clone().add(V3(0.5, 1.6, 0.6)).lerp(a, 0.3), a, b,
        b.clone().add(V3(1.6, -0.6, 0.8)), V3(7.6, 6.2, -0.8).add(slide), V3(9.6, 5.5, -1.2).add(slide), V3(12.0, 6.6, -0.4).add(slide)]);
      const tk = ia.toFixed(4) + tubeKey;
      if (irs.userData.tk !== tk) { irs.userData.tk = tk; irs.userData.tail = tail; irsTail.geometry.dispose(); irsTail.geometry = new THREE.TubeGeometry(tail, 90, 0.24, 7, false); }
      irsTail.visible = ia > 0.5 && !(K.cam > 4.4 && K.cam < 5.6);
    }
    /* PI3-kinase arrives and binds to an IRS-1 phosphotyrosine (its p85 part), its p110 part on the membrane */
    const pa = smooth(0, 1, K.pi3k);
    pi3k.visible = pa > 0.002;
    if (pi3k.visible) pi3k.position.copy(V3(12.6, 5.4, -1.9)).add(V3(12, 14, 4).multiplyScalar(1 - pa));
    /* Akt: to a PIP3, phosphorylated, then to AS160 on the vesicle */
    const ka = smooth(0, 1, K.akt), kg = smooth(0, 1, K.aktGo), af = 1 - smooth(0.1, 0.45, K.fuse);
    akt.visible = (ka > 0.002 || K.cam > 6.6) && af > 0.02;
    const aktFrom = V3(30, 24, -2.4);
    const asW = () => vc.localToWorld(as160.userData.base.clone());
    if (akt.visible) {
      const atAS = asW().addScaledVector(dAS, 4.6);
      const p = aktFrom.clone().lerp(aktBound, ka);
      if (kg > 0) p.lerp(atAS, kg).add(V3(0, 6 * Math.sin(Math.PI * kg), 0));
      akt.position.copy(p); [aktPH, aktK].forEach(m => fadeProt(m, af));
    }
    /* AS160 lets go of the vesicle once phosphorylated; Rab proteins on it are then active (brighter) */
    const asOff = smooth(0.35, 1, K.as160);
    as160.position.copy(as160.userData.base).addScaledVector(dAS, 7 * asOff); fadeProt(as160, 1 - asOff);
    rabs.forEach(m => { const mt = m.material; mt.emissiveIntensity = 0.16 + 0.55 * smooth(0, 1, K.rab) * (0.75 + 0.25 * Math.sin(t * 3 + m.userData.dir.x * 9)); fadeProt(m, 1 - smooth(0.05, 0.6, K.fuse)); });
    snares.forEach(m => { m.visible = K.dock > 0.02 && K.fuse < 0.45; }); snMat.opacity = 1 - smooth(0.05, 0.42, K.fuse);
    /* ---- the molecules: phosphate groups, the close-up's ATP and tyrosine, glucose ---- */
    const atoms = [], bonds = [];
    const addFrag = F => { const base = atoms.length; atoms.push(...F.atoms); F.bonds.forEach(([a, b, o]) => bonds.push({ a: base + a, b: base + b, o, s: F.atoms[0].s })); };
    const addInsts = insts => { const G_ = gather(insts), base = atoms.length; atoms.push(...G_.atoms); G_.bonds.forEach(b => bonds.push({ a: b.a + base, b: b.b + base, o: b.o, s: b.s })); };
    /* each kinase phosphorylates three tyrosines of the other's activation loop (their places measured in 1IR3) */
    const order = [['A', '1158'], ['B', '1158'], ['A', '1162'], ['B', '1162'], ['A', '1163'], ['B', '1163']];
    const close = K.cam > 4.4 && K.cam < 5.6;
    /* the receptor's molecules are drawn only in its own pictures (views 0-6): from the vesicle's pictures they are far
       smaller than a pixel, and drawing them cost a slow phone 10 ms a frame at rest */
    const recNear = K.cam < 6.6;
    let pg = 0;
    if (recNear) order.forEach(([h, k], j) => {
      const s = smooth(j / 6, (j + 1) / 6, K.pa); if (s <= 0.01 || (close && h === 'B')) return;
      const S = IRK.ptr[k], o = kin[h];
      const at = o.localToWorld(V3(...S.OH)), dir = o.localToWorld(V3(...S.P)).sub(at);
      addFrag(phosphate(at, dir, s));
      if (s < 0.97 && pg < pGlow.length) { const G_ = pGlow[pg++]; G_.visible = true; G_.position.copy(at); G_.material.opacity = 0.7 * Math.sin(Math.PI * s); }
    });
    for (let k = pg; k < pGlow.length; k++) pGlow[k].visible = false;
    /* and the juxtamembrane tyrosine where IRS-1 binds (drawn) */
    if (recNear) ['A', 'B'].forEach(h => { const s = smooth(0, 1, K.pj); if (s > 0.01) { const p = jmPoint(h); addFrag(phosphate(p.clone().add(V3(0, 0, 0.3)), V3(0.2, 0.3, 1), s)); } });
    /* IRS-1's other tyrosines (YXXM), phosphorylated by the receptor */
    if (recNear && irs.visible && irs.userData.tail) [0.62, 0.78, 0.93].forEach((u, j) => { const s = smooth(j / 3, (j + 1) / 3, K.irsP); if (s > 0.01) addFrag(phosphate(irs.userData.tail.getPointAt(u).add(V3(0, 0.25, 0.25)), V3(0.1, 0.6, 1), s)); });
    /* PIP2 → PIP3 (two phosphate groups, then three) */
    { const o = new THREE.Object3D(); let n = 0;
      pipP.forEach((ps, k) => ps.forEach((p, j) => { const s = j < 2 ? 1 : smooth(k / 6, (k + 1) / 6, K.pip); o.position.copy(p); o.scale.setScalar(Math.max(1e-4, s)); o.updateMatrix(); pipDots.setMatrixAt(n++, o.matrix); }));
      pipDots.instanceMatrix.needsUpdate = true; }
    /* Akt phosphorylated (two phosphate groups) */
    if (akt.visible && K.cam < 8.5) [V3(1.7, 1.4, 1.3), V3(-1.3, 1.7, 1.1)].forEach((d, j) => { const s = smooth(j / 2, (j + 1) / 2, K.aktP) * af; if (s > 0.01) addFrag(phosphate(akt.position.clone().add(d), d, s)); });
    /* AS160 phosphorylated */
    { const s = smooth(0, 0.3, K.as160) * (1 - asOff); if (s > 0.01) addFrag(phosphate(vc.localToWorld(as160.position.clone()).addScaledVector(dAS, -3.2).add(V3(0, 0.6, 1.2)), dAS.clone().negate(), s)); }
    /* the close-up: ATP's last phosphate group moves to the OH of IRS-1's tyrosine (mol.js Reaction), two Mg2+ holding it */
    mgMesh.visible = recNear && (K.irs > 0.6 || K.rx > 0);
    if (mgMesh.visible) { const o = new THREE.Object3D(); mgW().forEach((p, k) => { o.position.copy(p); o.updateMatrix(); mgMesh.setMatrixAt(k, o.matrix); }); mgMesh.instanceMatrix.needsUpdate = true; }
    if (recNear && (K.irs > 0.6 || K.rx > 0)) {
      if (K.rx <= 0) { const P = rxPose(); addInsts([{ key: 'atp_k', id: 'a', P: P('atp_k') }, { key: 'tyr_k', id: 't', P: P('tyr_k') }]); }
      else if (K.rx < 1) { const R_ = reaction().at(K.rx), base = atoms.length; atoms.push(...R_.atoms); R_.bonds.forEach(b => bonds.push({ a: b.a + base, b: b.b + base, o: b.o, s: b.s })); }
      else { const P = rxPose(); addInsts([{ key: 'adp_k', id: 'a', P: P('adp_k') }, { key: 'ptyr_k', id: 't', P: P('ptyr_k') }]); }
    }
    /* glucose through three of the new transporters, in the real order (Daniel, 8 Nov 2026: "make sure that it matches the
       reality ... in terms of timing"; ch1.js): each waits open to the outside; glucose moves in and binds in its middle;
       then it closes to the outside and, a moment later, opens to the inside; only then glucose leaves; once it is clear,
       the empty transporter changes back (before, each turned while its glucose was still moving in, and back while it
       was still in its inner mouth) */
    if (K.fuse > 0.9) {
      VG.forEach((H, k) => { if (!GOS.includes(k)) H.rock(-1); });
      GOS.forEach((gi, j) => {
        const G = VG[gi], S = G.o.userData.sites, cav = S.cavity ? S.cavity.clone() : V3(0, 0, 0);
        const u = smooth(j * 0.12, j * 0.12 + 0.72, K.glc);
        /* [u, where]: outside, the outer mouth, the middle (binds), still there while it turns, the inner mouth, inside */
        const keys = [[0, glcWait[j].d.clone()], [0.25, V3(0.1, -3.6, 0.8)], [0.45, cav.clone().add(V3(0, -0.3, 0))], [0.7, cav.clone().add(V3(0, -0.3, 0))], [0.82, V3(0.1, 3.8, 0.9)], [1, glcOut[j].clone()]];
        let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++;
        const f = Math.min(1, Math.max(0, (u - keys[i][0]) / (keys[i + 1][0] - keys[i][0]))), ef = f * f * (3 - 2 * f);
        const pw = G.o.localToWorld(keys[i][1].clone().lerp(keys[i + 1][1], ef));
        G.rock(u < 0.45 ? -1 : u < 0.6 ? lerp(-1, 0, smooth(0.45, 0.55, u)) : u < 0.9 ? lerp(0, 1, smooth(0.6, 0.7, u)) : lerp(1, -1, smooth(0.9, 1, u)));
        addInsts([{ key: 'glucose', id: (u > 0.7 ? 'gl' : 'gw') + j, P: { p: pw, q: glcWait[j].q } }]);
        gGlow[j].visible = K.glc > 0; gGlow[j].position.copy(pw); gGlow[j].material.opacity = 0.3 + 0.45 * Math.sin(Math.PI * u);
      });
      const base = VG[GOS[0]].o.localToWorld(V3());
      glcWait.slice(3).forEach((w, k) => { const pw = base.clone().add(w.d).add(V3(Math.sin(t * 0.6 + k), Math.cos(t * 0.5 + k * 1.3), 0).multiplyScalar(0.25)); addInsts([{ key: 'glucose', id: 'gw' + (3 + k), P: { p: pw, q: w.q } }]); wGlow[k].visible = K.cam > 9.5 && K.cam < 10.5; wGlow[k].position.copy(pw); });
    } else { VG.forEach(G => G.rock(1)); gGlow.forEach(h => { h.visible = false; }); wGlow.forEach(h => { h.visible = false; }); }
    BS.draw(atoms, bonds, stage.cam.position.clone().sub(stage.view.at).normalize());
    drawn = { atoms, bonds };
    /* glows: on what changes in each step */
    halos[0].visible = K.i1 > 0 && K.i1 < 1 || K.i2 > 0 && K.i2 < 1; halos[0].position.copy(INS[K.i1 < 1 ? 0 : 1].o.position);
    halos[1].visible = K.rx > 0 && K.rx < 1; halos[1].position.copy(siteW()); halos[1].material.opacity = 0.5;
    pipGlow.visible = K.pip > 0 && K.pip < 1; pipGlow.position.set(18.2, 2.9, -1.5); pipGlow.material.opacity = 0.5;
    halos[2].visible = K.fuse > 0 && K.fuse < 0.6; halos[2].position.set(XF, 3.5, -1.5); halos[2].material.opacity = 0.45 * Math.sin(Math.PI * Math.min(1, K.fuse / 0.6));
  }

  /* ================= names ================= */
  const pts = (obj, targets) => () => surfacePoints(obj, targets());
  const recPts = (ds, off) => () => { const out = []; ds.forEach(([h, d]) => { const P = partOf(h, d); surfacePoints(P.m, [P.m.position.clone().add(off)], out); }); return out; };
  const atomPts = (id, names) => () => drawn.atoms.filter(a => a.id === id && (!names || names.includes(a.name)) && a.el !== 'H' && (a.s == null || a.s > 0.5)).map(a => a.p.clone());
  const labels = {
    insulin: { html: 'insulin, a protein hormone', side: 'l', pts: () => INS.slice(0, 3).flatMap(I => surfacePoints(I.o, [I.o.position.clone().add(V3(-1.5, -0.5, 1.5))])) },
    ligand: { html: 'insulin, the ligand', side: 'l', pts: () => surfacePoints(INS[0].o, [INS[0].o.position.clone().add(V3(-1.6, -0.6, 1.6)), INS[0].o.position.clone().add(V3(0, -1.8, 1.2))]) },
    ins4: { html: 'insulin: four molecules bound', side: 'r', pts: () => INS.flatMap(I => surfacePoints(I.o, [I.o.position.clone().add(V3(1.5, -0.6, 1.5))])) },
    receptor: { html: 'insulin receptor, a glycoprotein', side: 'r', pts: recPts([['B', 'F2'], ['B', 'F3'], ['B', 'L2']], V3(2.5, 0, 2.5)) },
    receptorT: { html: 'insulin receptor: its shape has changed', side: 'r', pts: recPts([['B', 'F2'], ['B', 'F3'], ['A', 'F2']], V3(2.5, 0, 2.5)) },
    sugars: { html: 'carbohydrate chains', side: 'l', pts: glyWorld },
    site: { html: 'binding site', side: 'r', pts: recPts([['A', 'L1'], ['B', 'aCT']], V3(1.5, -0.8, 2)) },
    tm: { html: 'it crosses the membrane: hydrophobic amino acids', side: 'r', pts: () => ['A', 'B'].map(h => curves[h] ? V3(curves[h].x + 0.6, 0.2, curves[h].z + 0.6) : V3()) },
    outpart: { html: 'part outside the cell', side: 'r', pts: recPts([['B', 'F3']], V3(2.5, -1, 2.5)) },
    inpart: { html: 'part inside the cell', side: 'r', pts: () => surfacePoints(kin.B, [kin.B.position.clone().add(V3(2.4, -1.6, 1.4)), kin.B.position.clone().add(V3(2.6, -0.4, 1.2)), kin.B.position.clone().add(V3(1.8, -2.8, 1.6))])
      .concat(surfacePoints(kin.A, [kin.A.position.clone().add(V3(2.0, -2.6, 1.4)), kin.A.position.clone().add(V3(2.4, -1.2, 1.2))])).concat(curves.A ? [curves.A.jm.getPointAt(0.5)] : []) },
    kinase: { html: 'tyrosine kinase: the part inside the cell', side: 'r', pts: () => surfacePoints(kin.B, [kin.B.position.clone().add(V3(2.4, 1.2, 1.4)), kin.B.position.clone().add(V3(2.0, -1.5, 1.6))]) },
    kinases: { html: 'tyrosine kinase', side: 'l', pts: () => surfacePoints(kin.A, [kin.A.position.clone().add(V3(-2.4, 1.2, 1.4))]) },
    phos: { html: 'phosphate groups on tyrosines', side: 'r', pts: () => drawn.atoms.filter(a => a.el === 'P' && a.s > 0.5).slice(0, 6).map(a => a.p.clone()) },
    mem: { html: 'plasma membrane', side: 'l', pts: () => [-30, -27, -33, XF - 52, XF - 58, XF + 54].map(x => V3(x, MEM.headY + 0.3, -0.4)) },
    outside: { html: 'tissue fluid: outside the cell', side: 'l', pts: () => [V3(-26, -11, 0), V3(-30, -9, 0)] },
    inside: { html: 'cytosol: inside the cell', side: 'l', pts: () => [V3(-26, 9, 0), V3(-30, 11, 0)] },
    /* a molecule's name: its line starts at the molecule's edge (all its atoms are candidates, as in chapters 2 and 5) */
    atp: { html: 'ATP', side: 'r', pts: atomPts('a'), mid: 'a' },
    adp: { html: 'ADP', side: 'r', pts: atomPts('a'), mid: 'a' },
    tyr: { html: 'tyrosine (an amino acid of <i>IRS-1</i>)', side: 'l', cls: 'ibv__lab--two', pts: atomPts('t'), mid: 't' },
    ptyr: { html: 'phosphorylated tyrosine', side: 'l', cls: 'ibv__lab--two', pts: atomPts('t'), mid: 't' },
    pgrp: { html: 'phosphate group', side: 'r', pts: atomPts('t', ['P']) },
    irs: { html: '<i>IRS-1</i>', side: 'r', lv: 'x', pts: () => surfacePoints(irsPH, [irsPH.position.clone().add(V3(1.4, 0.6, 1))]) },
    pi3k: { html: '<i>PI3-kinase</i>', side: 'l', lv: 'x', pts: () => surfacePoints(p85, [pi3k.position.clone().add(V3(-2.4, 4.6, 0.6)), pi3k.position.clone().add(V3(-1.2, 5.6, 0.2))]) },
    pip3: { html: '<i>PIP3</i>: three phosphate groups (orange) on its ring', side: 'r', lv: 'x', pts: () => pipP.slice(0, 3).map(p => p[2].clone()) },
    mg: { html: 'magnesium ions (Mg<sup>2+</sup>)', side: 'r', lv: 'x', pts: mgW },
    akt: { html: '<i>Akt</i>, a protein kinase', side: 'r', lv: 'x', pts: () => surfacePoints(aktK, [akt.position.clone().add(V3(1.8, 1.5, 1.2))]) },
    as160: { html: '<i>AS160</i>', side: 'l', lv: 'x', pts: () => surfacePoints(as160, [vc.localToWorld(as160.position.clone()).add(V3(-2, -1, 1.5))]) },
    rab: { html: '<i>Rab</i> proteins: activated', side: 'r', lv: 'x', pts: () => rabs.map(m => vc.localToWorld(m.position.clone()).add(V3(1.2, 0.4, 0.8))) },
    vesicle: { html: 'vesicle', side: 'l', pts: () => { const yv = lastK.dock > 0 ? YV2 : lerp(YV0, YV1, smooth(0, 1, lastK.ves || 0)); return [V3(XF - R_OUT * 0.8, yv + R_OUT * 0.5, -0.5), V3(XF - R_OUT * 0.94, yv + R_OUT * 0.25, -0.5)]; } },
    glutV: { html: 'glucose transporters in its membrane <i>(GLUT4)</i>', side: 'r', pts: () => VG.filter(G => G.side > 0).map(G => surfacePoints(G.o, [vc.localToWorld(G.o.position.clone()).add(G.n ? G.n.clone().multiplyScalar(2.5) : V3())])).flat() },
    glutM: { html: 'glucose transporters, now in the plasma membrane', side: 'r', pts: () => VG.map(G => surfacePoints(G.o, [vc.localToWorld(G.o.position.clone()).add(V3(1.5, 2.4, 1.5))])).flat() },
    glut1: { html: 'glucose transporters', side: 'r', pts: () => GOS.flatMap(gi => surfacePoints(VG[gi].o, [VG[gi].o.localToWorld(V3(2.4, 1.2, 2)), VG[gi].o.localToWorld(V3(2.6, -1.2, 2))])) },
    fusing: { html: 'the vesicle membrane fuses with the plasma membrane', side: 'l', pts: () => [V3(XF - VP.rn - 1.2, 0.6, -0.4), V3(XF - VP.rn - 2.4, 1.0, -0.4)] },
    snare: { html: '<i>SNARE proteins</i>', side: 'l', lv: 'x', pts: () => snares.slice(0, 2).map(m => V3(XF + 4.8 * Math.cos(m.userData.a), 3.6, 4.8 * Math.sin(m.userData.a))) },
    glucose: { html: 'glucose in the tissue fluid', side: 'l', pts: () => drawn.atoms.filter(a => /^gw[34]$/.test(a.id) && a.el === 'C').map(a => a.p.clone()) },
    glcIn: { html: 'glucose that has entered', side: 'r', pts: () => drawn.atoms.filter(a => /^gl/.test(a.id) && a.el === 'C').map(a => a.p.clone()) },
    glB: { html: 'a glucose transporter already in the membrane', side: 'l', pts: () => surfacePoints(glB, [GB.clone().add(V3(-2.4, -1, 2)), GB.clone().add(V3(-2.6, 1, 2))]) }
  };

  /* ================= the steps (their words are in text.js) ================= */
  const steps = [
    { phases: [{ to: { cam: 0 }, ms: 600 }], labs: { insulin: 1, receptor: 1, glB: 2, outside: 2, inside: 2 },
      pic: 'Every size is true. Measured: insulin, and the receptor outside and inside the cell. Drawn: its part in the membrane. Insulin is far more concentrated here than in the blood.' },
    { phases: [{ to: { cam: 1 }, ms: 2400 }], labs: { receptor: 1, sugars: 1, tm: 1, inpart: 1, outpart: 2, mem: 2 },
      pic: 'Drawn: the carbohydrate chains (they move too much to be measured). Each ball is one sugar.' },
    { phases: [{ to: { cam: 2 }, ms: 2400 }, { to: { i1: 0.55 }, ms: 1800 }, { to: { i1: 1, morph: 0.42 }, ms: 3400 }], labs: { ligand: 1, site: 1 } },
    { phases: [{ to: { cam: 3 }, ms: 2000 }, { to: { i2: 1, morph: 1 }, ms: 4600 }, { to: { i3: 1, i4: 1 }, ms: 2600 }], labs: { receptorT: 1, ins4: 1 },
      pic: 'Both shapes are measured; the movement between them is drawn. In the new shape, one leg is behind the other.' },
    { phases: [{ to: { cam: 4 }, ms: 2400 }, { to: { kin: 1 }, ms: 3200 }, { hold: 1400, labs: { kinase: 1, kinases: 2 } }, { to: { pa: 1 }, ms: 3600 }, { to: { pj: 1 }, ms: 1200 }], labs: { kinase: 1, phos: 1, tm: 2 } },
    { phases: [{ to: { cam: 5, irs: 1 }, ms: 3000 }, { hold: 1800, labs: { atp: 1, tyr: 1, mg: 2 } }, { to: { rx: 1 }, ms: 4200, lin: [] }], labs: { adp: 1, ptyr: 1, mg: 2 },
      pic: 'Measured: the active kinase with an ATP-like molecule and a piece of IRS-1 (X-ray, 1997).' },
    { phases: [{ to: { cam: 6 }, ms: 2600 }, { to: { irsP: 1 }, ms: 2200 }, { to: { pi3k: 1 }, ms: 2600 }, { to: { pip: 1 }, ms: 2800 }], labs: { irs: 1, pi3k: 1, pip3: 1 },
      pic: 'True sizes, simplified shapes: IRS-1 and PI3-kinase.' },
    { phases: [{ to: { cam: 7 }, ms: 2600 }, { to: { akt: 1 }, ms: 2400 }, { to: { aktP: 1 }, ms: 1600 }, { to: { aktGo: 1 }, ms: 3600 }, { hold: 1600, labs: { akt: 1, as160: 1 } }, { to: { as160: 1 }, ms: 2400 }, { to: { rab: 1 }, ms: 1400 }], labs: { akt: 1, rab: 1, vesicle: 1 },
      pic: 'True sizes, simplified shapes: Akt, AS160 and the Rab proteins.' },
    { phases: [{ to: { cam: 8 }, ms: 2000 }, { to: { ves: 1 }, ms: 5200 }], labs: { vesicle: 1, glutV: 1 },
      pic: 'The vesicle is drawn cut open, like the membrane.' },
    { phases: [{ to: { cam: 9 }, ms: 1800 }, { to: { dock: 1 }, ms: 2400 }, { hold: 1500, labs: { snare: 1 } }, { to: { fuse: 0.5 }, ms: 3600 }, { hold: 1500, labs: { fusing: 1 } }, { to: { fuse: 1, cam: 13 }, ms: 4600 }, { to: { cam: 12 }, ms: 2200 }], labs: { glutM: 1, mem: 2 } },
    { phases: [{ to: { cam: 10 }, ms: 2600 }, { to: { glc: 1 }, ms: 9000, lin: ['glc'] }], labs: { glucose: 1, glcIn: 1, glut1: 1 } },
    { phases: [{ to: { cam: 11 }, ms: 2600 }], labs: { receptorT: 1, glutM: 1, inside: 2, outside: 2 },
      pic: 'Sizes are true, times are not: in a muscle cell, these steps take several minutes.' }
  ];
  /* no name stands on a molecule of the close-up */
  const avoid = () => (lastK.cam > 4.5 && lastK.cam < 5.5) ? drawn.atoms.filter(a => a.el !== 'H' && (a.s == null || a.s > 0.5)).concat(mgW().map(p => ({ p, id: 'a' }))) : [];   /* the Mg2+ ions hold ATP's phosphate groups: named with it */
  return {
    group: g, knobs, views, steps, labels, draw, avoid, turn: true,
    dispose() { BS.dispose(); disposeGroup(g); }
  };
}
