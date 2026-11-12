/* ============================================================
   ch6.js — chapter 6, the electron transport chain and ATP synthase: the inner membrane (5 Nov 2026). Daniel: "one for IB that is more
   detailed, stating the names of all of the different proteins and actually showing what exactly happens"; his text:
   10 NADH give their electrons to complex I, 2 FADH₂ at complex II, complexes I, III and IV pump H⁺ into the
   intermembrane space, H⁺ builds up "and the inner membrane won't let it leak back", flows back through ATP synthase
   (chemiosmosis), at complex IV "the spent electrons combine with O₂ and H⁺ to form water", ATP leaves by "a transporter
   that swaps one ATP out for one ADP in". IB C1.2.13–C1.2.16 (HL); the names of the complexes are beyond the guide.
   Every protein is its measured shape, at its true size, each in a window of the membrane (membrane.js footprint):
   complexes I, III (two, a dimer) and IV together as a respirasome (PDB 5XTH, Guo et al. 2017, Cell 170:1247), complex
   II (8GS8), cytochrome c (3ZCF), ATP synthase (8H9S, the game's model, js/world/atp-synthase.js) and the ATP–ADP exchanger
   (1OKC). The electrons pass along the carriers where the measured structures put them (tools/ib-proteins.py sites):
   complex I's FMN and its chain of iron–sulfur clusters to N2, ubiquinone in the membrane, complex III's haem bL, the
   Rieske iron–sulfur cluster and haem c1, cytochrome c, then complex IV's CuA, haem a and haem a3 with CuB, where oxygen
   accepts them with hydrogen ions from the matrix: water. Per pair of electrons from NADH: 4 H⁺ pumped by complex I, 4 by
   complex III (the Q cycle), 2 by complex IV (Wikström et al. 2018, Chem Rev 118:2469); none by complex II. ATP synthase:
   8 H⁺ per turn of its ring (human c8), 3 ATP per turn (Lai et al. 2023). Sizes: membrane 5 nm thick (heads); the
   intermembrane space inside a crista, closed above by the crista's other side (the expert review, 5 Nov 2026: the space
   must look small, B2.2.4). After the review: one electron per cytochrome c, and one at a time through complexes III and
   IV (the Q cycle's net result); oxygen waits at complex IV until 4 electrons (two NADH) have arrived: 2 water.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { ballStick, gather, Reaction, poseAt, moved, molData } from './mol.js?v=202611121326';
import { loadProts, protein, protMat, surfacePoints, fadeProt } from './prot.js?v=202611121326';
import { bilayer, footprint } from './membrane.js?v=202611121326';
import { disposeGroup, glow, smooth, halo as haloTex } from './stage.js?v=202611121326';

const H_COL = 0xff4f9a, E_COL = 0xfff07a;
const along = (pts, f) => { const n = pts.length - 1; if (n < 1) return pts[0].clone(); const x = Math.max(0, Math.min(1, f)) * n, i = Math.min(n - 1, Math.floor(x)), k = x - i; return pts[i].clone().lerp(pts[i + 1], k); };

/* its measured shapes and ATP synthase's: the view fetches them while the pupil reads the chapter before (view.js ahead) */
const PROTS = ['resp', 'c2', 'cytc', 'ant'], synthase = () => import('../world/atp-synthase.js?v=202611121326');
export const prefetch = () => Promise.all([loadProts(PROTS), synthase()]);

export async function build(stage, { V }) {
  const [RS, C2, CC, AN] = await loadProts(PROTS);
  const AT = (await synthase()).ATP_SYNTHASE;
  const g = new THREE.Group(); g.name = 'ch6';
  /* the spaces: the intermembrane space above, the matrix below (far behind the lipids) */
  const sp = (y0, y1, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(260, y1 - y0), new THREE.MeshBasicMaterial({ color: c })); m.position.set(0, (y0 + y1) / 2, -40); g.add(m); };
  /* (the spaces are set below, once the proteins' height is known) */
  /* ---- the proteins ---- */
  const resp = protein(RS, { colors: { I: 0x6f9bff, III: 0x9a7bff, IV: 0x84d46a } }); resp.position.set(-16, 0, -8); g.add(resp);
  const c2 = protein(C2, { colors: { II: 0x8fd4ff } }); c2.position.set(8, 0, -4); g.add(c2);
  const atp = new THREE.Group(), rotor = new THREE.Group(), stator = new THREE.Group(); atp.add(rotor, stator);
  { const COLS = { alpha: 0xff7f95, beta: 0xffc85a, gamma: 0x6fd0c0, delta: 0x5fc0b0, epsilon: 0x7fe0d0, c: 0x8fe7d6, a: 0xb9a6ff, b: 0xd6c9ff, d: 0xd6c9ff, f6: 0xd6c9ff, oscp: 0xe6dcff, a6l: 0xcabfff, minor: 0xbfb3ee };
    const P = protein({ key: 'atp', name: 'ATP synthase', parts: AT.parts.map(p => Object.assign({ grp: p.part }, p)), sites: {} }, { colors: COLS });
    P.children.slice().forEach((m, i) => (AT.parts[i].rotor ? rotor : stator).add(m)); atp.userData.mats = P.userData.mats; }
  atp.position.set(24, 0, -4); atp.rotation.z = Math.PI; g.add(atp);       /* its head (F1) in the matrix, below */
  const ant = protein(AN, { color: 0xffb3d1 }); ant.position.set(36, 0, -3); g.add(ant);
  /* cytochrome c carries ONE electron: four of them here, each with one (two for each NADH) */
  const cytcs = [0, 1, 2, 3].map(() => { const p = protein(CC, { color: 0xff6b6b }); g.add(p); return p; });
  const cytc = cytcs[0];
  g.updateMatrixWorld(true);
  const block = footprint([resp, c2, atp, ant]);
  const mem = bilayer({ x0: -95, x1: 95, depth: 22, block, seed: 21, head: 0xffb8a8, tail: 0xffe0b0 }); g.add(mem);
  /* the crista's other side: the intermembrane space between is small (B2.2.4), its width true; its own proteins are not
     drawn. Above it, the matrix again. */
  const top = Math.max(...[resp, c2, atp, ant].map(o => new THREE.Box3().setFromObject(o).max.y));
  const IMS_TOP = Math.max(13, top + 2.2), FACE = IMS_TOP + 2.4;
  const mem2 = bilayer({ x0: -95, x1: 95, depth: 22, seed: 22, head: 0xffb8a8, tail: 0xffe0b0 }); mem2.position.y = FACE; g.add(mem2);
  sp(2.8, IMS_TOP, 0x3a1c3a); sp(-60, -2.8, 0x3a2414); sp(FACE + 2.8, FACE + 60, 0x3a2414);
  /* ---- the electron carriers, where the measured structures have them (world) ---- */
  const rW = n => resp.localToWorld(new THREE.Vector3(...RS.sites[n]));
  const cW = n => c2.localToWorld(new THREE.Vector3(...C2.sites[n]));
  const I = ['I00_FMN', 'I01_SF4', 'I02_FES', 'I03_SF4', 'I04_SF4', 'I05_SF4', 'I06_SF4', 'I07_SF4'].map(rW);
  const N2 = I[7], QI = N2.clone().add(V(0, 1.4, 0.2)), QIm = V(N2.x + 0.5, 0.1, N2.z + 0.4);
  const bL = rW('III_HEM_AJ401'), Qo = bL.clone().add(V(-0.6, -0.4, 0.6)), rieske = rW('III_FES_AP301'), c1 = rW('III_HEC_AH402');
  const CuA = rW('IV_CU_y301'), hemeA = rW('IV_HEA_x603'), hemeA3 = rW('IV_HEA_x604'), CuB = rW('IV_CU_x601');
  const II = ['e0_FAD', 'e1_FES', 'e2_SF4', 'e3_F3S', 'e4_UQ1'].map(cW);
  /* cytochrome c: in the intermembrane space, from complex III's haem c1 to complex IV's CuA */
  const ccHaem = new THREE.Vector3(...CC.sites.haem);
  const ccFrom = c1.clone().add(V(0, 1.6, 0.4)), ccTo = CuA.clone().add(V(0, 1.7, 0.4));
  const ccFrom2 = ccFrom.clone().add(V(1.2, 1.4, 3.2)), ccWait = ccTo.clone().add(V(-2.2, 2.2, 3.2)), ccAway = ccTo.clone().add(V(-4.5, 3.2, 1.2));
  const ccWait3 = ccTo.clone().add(V(-3.2, 4.2, -1.6)), ccWait4 = ccTo.clone().add(V(-5.6, 3.6, 2.6));
  /* ---- the molecules ---- */
  const BS = ballStick(700, 800); g.add(BS.group);
  const fmnW = I[0];
  const nadhP = poseAt('nadh', 'N_C4', fmnW.clone().add(V(0.2, -0.3, 0.5)), V(-0.4, -1, 0.5), 0.3);
  const qPose = (head, dir) => poseAt('ubiquinone', 'C2', head, dir, 0);
  const o2P = poseAt('o2', 'O0', CuB.clone().add(V(0.25, -0.35, 0.3)), V(1, 0, 0));
  const water = new Reaction({ from: [{ key: 'o2', id: 'w', P: o2P }], to: [{ key: 'water', id: 'w1', P: poseAt('water', 'O', CuB.clone().add(V(-1.4, -6.2, 2.2)), V(-1, -0.5, 0.4)) }, { key: 'water', id: 'w2', P: poseAt('water', 'O', CuB.clone().add(V(1.3, -6.6, 2.4)), V(1, -0.5, 0.4)) }],
    moves: [['w:O0', 'w1:O'], ['w:O1', 'w2:O']] });
  /* ATP synthase: ADP and phosphate join in the head, three per turn */
  const headW = atp.localToWorld(V(0, AT.head, 0));
  const sites = [0, 1, 2].map(k => { const a = k * 2 * Math.PI / 3 + 0.5; return atp.localToWorld(V(Math.cos(a) * 5.4, AT.head + 0.6, Math.sin(a) * 5.4)); }).sort((a, b) => b.z - a.z);
  const made = sites.map((s, k) => new Reaction({
    from: [{ key: 'adp', id: 'a' + k, P: poseAt('adp', 'O3B', s, V(0.4, -1, 0.6), 0.3) }, { key: 'pi', id: 'p' + k, P: poseAt('pi', 'P', s.clone().add(V(0.38, 0.12, 0.15)), V(1, -0.2, 0.4)) }],
    to: [{ key: 'atp', id: 'a' + k }], moves: [['p' + k + ':P', 'a' + k + ':PG'], ['p' + k + ':OPa', 'a' + k + ':O1G'], ['p' + k + ':OPb', 'a' + k + ':O2G'], ['p' + k + ':OPc', 'a' + k + ':O3G']] }));
  /* the ATP–ADP exchanger: ATP out to the intermembrane space, ADP in */
  const antW = ant.position.clone();
  /* ---- hydrogen ions: a pool in the intermembrane space, and the ones that move ---- */
  const NH = 160, hMat = new THREE.MeshStandardMaterial({ color: H_COL, emissive: H_COL, emissiveIntensity: 0.9, roughness: 0.3 });
  const hs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 10, 8), hMat, NH); hs.frustumCulled = false; g.add(hs);
  const hGlow = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ map: haloTex(), color: 0xff8fc0, size: 1.3, sizeAttenuation: true, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
  hGlow.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NH * 3), 3)); hGlow.frustumCulled = false; g.add(hGlow);
  const rnd = (k, m) => { const x = Math.sin(k * 12.9898 + m * 78.233) * 43758.5453; return x - Math.floor(x); };
  const homes = Array.from({ length: NH }, (_, i) => V(-44 + rnd(i, 1) * 88, 3.6 + rnd(i, 2) * 6.5, -12 + rnd(i, 3) * 13.5));
  const mHomes = Array.from({ length: 10 }, (_, i) => V(-40 + rnd(i, 7) * 80, -4 - rnd(i, 8) * 5, -10 + rnd(i, 9) * 11));
  /* the pumped ones: their ways through each complex (matrix → intermembrane space) */
  const pumpPts = ['pump_ND5', 'pump_ND4', 'pump_ND2', 'pump_ND1'].map(rW);
  const wayI = pumpPts.map(p => [V(p.x, -6.5, p.z + 2), V(p.x, -1.5, p.z + 0.4), V(p.x, 1.5, p.z + 0.4), V(p.x + 0.5, 5.5, p.z + 2)]);
  const wayIII = [0, 1, 2, 3].map(k => { const x = Qo.x - 1.5 + k; return [V(x, -1, Qo.z + 0.6), V(x, 1.2, Qo.z + 0.6), V(x + 0.3, 3.4, Qo.z + 1.2), V(x + 0.6, 6, Qo.z + 2.2)]; });
  const wayIV = [0, 1].map(k => [V(CuB.x - 1 + 2 * k, -6.5, CuB.z + 2), V(CuB.x - 0.6 + 1.2 * k, -1, CuB.z + 0.8), V(CuB.x - 0.6 + 1.2 * k, 1.6, CuB.z + 0.8), V(CuB.x + 2 * k - 1, 5.5, CuB.z + 2)]);
  const waterH = [0, 1, 2, 3].map(k => [V(CuB.x - 1.5 + k, -6.5, CuB.z + 2.4), V(CuB.x + 0.4 * (k - 1.5), -1.6, CuB.z + 0.8)]);
  /* the way back through ATP synthase: down beside its ring, out into the matrix */
  const ringW = (a, y) => atp.localToWorld(V(Math.cos(a) * 3.1, y, Math.sin(a) * 3.1));
  /* ---- electrons ---- */
  /* the electrons, and the carriers they pass between, are seen through the proteins (as in an X-ray picture) */
  const bead = (r, c) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), new THREE.MeshBasicMaterial({ color: c, depthTest: false, transparent: true })); m.renderOrder = 30; return m; };
  const eS = [0, 1, 2, 3].map(() => { const s = glow(1.6, E_COL, 1); s.material.depthTest = false; s.renderOrder = 31; s.add(bead(0.16, 0xffffb0)); g.add(s); return s; });
  const carriers = [...I, QI, ...II, Qo, rieske, c1, CuA, hemeA, hemeA3, CuB].map(p => { const s = bead(0.24, 0xffa23a); s.position.copy(p); const gl = glow(0.9, 0xffb35c, 0.8); gl.material.depthTest = false; gl.renderOrder = 29; s.add(gl); g.add(s); return s; });
  const halo = glow(2.6, 0xfff4d0, 0.4); halo.material.depthTest = false; halo.renderOrder = 28; g.add(halo);
  const knobs = { cam: 0, n1: 0, e1: 0, p1: 0, e2: 0, q: 0, e3: 0, p3: 0, c: 0, e4: 0, cc2: 0, e5: 0, p4: 0, w: 0, pool: 0.15, turn: 0, mk: 0, ant: 0, see: 0 };
  let drawn = { atoms: [], bonds: [] };
  const tq = new THREE.Quaternion(), ts = new THREE.Vector3(1, 1, 1), tm = new THREE.Matrix4(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
  function draw(K, t) {
    const insts = [], extra = [];
    /* NADH arrives at FMN, gives its electrons, leaves as NAD⁺ */
    /* NADH arrives at FMN, gives its electrons; NAD moves aside and waits in view (named at rest), and leaves in the next
       step (n1: 2 → 3) */
    if (K.n1 > 0 && K.n1 < 3) insts.push({ key: K.e1 >= 0.15 ? 'nad' : 'nadh', id: 'n', P: moved(nadhP, V(-3, -5, 3), K.n1 < 1 ? 1 - smooth(0, 1, K.n1) : K.n1 <= 2 ? 0.4 * smooth(1, 2, K.n1) : 0.4 + 0.6 * smooth(2, 3, K.n1)), s: K.n1 > 2 ? 1 - smooth(2, 3, K.n1) : 1 });
    /* ubiquinone from complex I (q: 0 at complex I … 1 at complex III), and the one at complex II */
    const qAt = f => f < 0.2 ? QI.clone().lerp(QIm, f / 0.2) : QIm.clone().lerp(V(Qo.x - 0.4, 0.1, Qo.z), (f - 0.2) / 0.8);
    insts.push({ key: 'ubiquinone', id: 'q', P: qPose(qAt(K.q), V(K.q > 0.2 ? -1 : 0.2, K.q > 0.2 ? 0 : -1, 0.1)) });
    insts.push({ key: 'ubiquinone', id: 'q2', P: qPose(II[4].clone().add(V(0.6, 0.9, 0.4)), V(1, 0.2, 0.1)) });
    /* oxygen arrives at complex IV and becomes water */
    if (K.w > 0 && K.w < 1) extra.push(water.at(K.w));
    else if (K.w >= 1) water.to.forEach(t => insts.push({ key: 'water', id: t.id, P: t.P }));
    else if (K.e4 > 0.3) insts.push({ key: 'o2', id: 'w', P: moved(o2P, V(0, -5, 2), 1 - smooth(0.3, 1, K.e4)) });
    /* ADP and phosphate in ATP synthase's head; ATP to the exchanger */
    made.forEach((rx, k) => {
      const f = Math.max(0, Math.min(1, K.mk - k));
      if (f > 0 && f < 1) extra.push(rx.at(f));
      else if (f >= 1) {
        const P0 = rx.placeOf('a' + k);
        if (k === 0 && K.ant > 0) { const a = K.ant; const p = a < 0.5 ? P0.p.clone().lerp(antW.clone().add(V(0, -3.2, 1.2)), smooth(0, 0.5, a)) : antW.clone().add(V(0, -3.2 + 8.2 * smooth(0.55, 1, a), 1.2)); insts.push({ key: 'atp', id: 'x' + k, P: { p, q: P0.q } }); }
        else insts.push({ key: 'atp', id: 'x' + k, P: P0 });
      } else if (K.mk > k - 0.5) insts.push({ key: 'adp', id: 'a' + k, P: rx.from[0].P }, { key: 'pi', id: 'p' + k, P: rx.from[1].P });
    });
    /* the exchanger opens to one side at a time: ADP in first (from the intermembrane space), then ATP out */
    if (K.ant > 0) { const a = smooth(0, 0.5, K.ant); insts.push({ key: 'adp', id: 'y', P: { p: antW.clone().add(V(0.6, 5.2 - 8.6 * a, 1.2)), q: new THREE.Quaternion() } }); }
    const all = gather(insts); extra.forEach(r => { const b = all.atoms.length; all.atoms.push(...r.atoms); r.bonds.forEach(x => all.bonds.push({ a: x.a + b, b: x.b + b, o: x.o, s: x.s })); });
    BS.draw(all.atoms, all.bonds, stage.cam.position.clone().sub(stage.view.at).normalize()); drawn = all;
    /* the four cytochrome c: A and B carry this NADH's two electrons, one each; C and D, a second NADH's (they appear for
       the oxygen's last two electrons) */
    const cA = smooth(0, 0.5, K.c), cB = smooth(0.3, 1, K.c), out = smooth(0.42, 0.62, K.e4), inB = smooth(0.5, 0.68, K.e4);
    const posA = ccFrom.clone().lerp(ccTo, cA).lerp(ccAway, out), posB = ccFrom2.clone().lerp(ccWait, cB).lerp(ccTo, inB);
    const inC = smooth(0.02, 0.2, K.e5), outC = smooth(0.45, 0.55, K.e5), inD = smooth(0.5, 0.65, K.e5);
    const posC = ccWait3.clone().lerp(ccTo, inC).lerp(ccAway.clone().add(V(-1.5, 0.8, -2.2)), outC), posD = ccWait4.clone().lerp(ccTo, inD);
    [posA, posB, posC, posD].forEach((p, i) => cytcs[i].position.copy(p).sub(ccHaem));
    [2, 3].forEach(i => { fadeProt(cytcs[i], K.cc2); cytcs[i].visible = K.cc2 > 0.02; });
    const haemOf = i => cytcs[i].position.clone().add(ccHaem);
    /* the electrons: a pair together as far as ubiquinone (it carries two), then one at a time */
    const eP = [null, null, null, null], o4 = [V(-0.3, 0.15, 0.6), V(0.3, 0.15, 0.6), V(0, 0.5, 0.6), V(0, -0.25, 0.6)], atO = i => CuB.clone().add(o4[i]);
    if (K.e1 > 0 && K.e1 < 1) eP[0] = eP[1] = along([fmnW, ...I.slice(1), QI], K.e1);
    else if (K.e2 > 0 && K.e2 < 1) eP[0] = eP[1] = along(II, K.e2);
    else if (K.q > 0 && K.q < 1) eP[0] = eP[1] = qAt(K.q);
    else if (K.e3 > 0 && K.e4 <= 0 && K.c <= 0) {
      const a1 = smooth(0, 0.48, K.e3), a2 = smooth(0.52, 1, K.e3);
      eP[0] = along([Qo, rieske, c1, ccFrom], a1); eP[1] = K.e3 < 0.52 ? Qo.clone() : along([Qo, rieske, c1, ccFrom2], a2);
      if (K.e3 >= 1) { eP[0] = haemOf(0); eP[1] = haemOf(1); }
    } else if (K.c > 0 && K.e4 <= 0) { eP[0] = haemOf(0); eP[1] = haemOf(1); }
    else if (K.e4 > 0 && K.w <= 0) {
      const a1 = smooth(0, 0.42, K.e4), a2 = smooth(0.68, 1, K.e4);
      eP[0] = a1 < 1 ? along([haemOf(0), CuA, hemeA, hemeA3, atO(0)], a1) : atO(0);
      eP[1] = K.e4 < 0.68 ? haemOf(1) : a2 < 1 ? along([ccTo.clone().add(ccHaem).sub(ccHaem), CuA, hemeA, hemeA3, atO(1)], a2) : atO(1);
      if (K.e5 > 0) {
        const a3 = smooth(0.2, 0.45, K.e5), a4 = smooth(0.68, 0.95, K.e5);
        eP[2] = K.e5 < 0.2 ? haemOf(2) : a3 < 1 ? along([ccTo, CuA, hemeA, hemeA3, atO(2)], a3) : atO(2);
        eP[3] = K.e5 < 0.68 ? haemOf(3) : a4 < 1 ? along([ccTo, CuA, hemeA, hemeA3, atO(3)], a4) : atO(3);
      } else if (K.cc2 > 0.5) { eP[2] = haemOf(2); eP[3] = haemOf(3); }
    } else if (K.w > 0 && K.w < 0.5) [0, 1, 2, 3].forEach(i => { eP[i] = atO(i); });
    const pairMove = (K.e1 > 0 && K.e1 < 1) || (K.e2 > 0 && K.e2 < 1) || (K.q > 0 && K.q < 1);
    eS.forEach((sp, i) => { sp.visible = !!eP[i]; if (eP[i]) sp.position.copy(eP[i]).add(pairMove ? V(0.35 * (i % 2 ? 1 : -1) * Math.cos(t * 3), 0.3 * Math.sin(t * 3 + i), 0.5) : V(0, 0, 0.4)); });
    const ePa = eP.find(p => p);
    /* hydrogen ions: the pool in the intermembrane space (its size follows `pool`), the ones on their way */
    const gp = hGlow.geometry.attributes.position; let n = 0;
    const put = p => { if (n >= NH) return; tm.compose(p, tq, ts); hs.setMatrixAt(n, tm); gp.setXYZ(n, p.x, p.y, p.z); n++; };
    const nPool = Math.round(K.pool * 110);
    for (let i = 0; i < nPool; i++) put(homes[i].clone().add(V(Math.sin(t * 1.3 + i) * 0.5, Math.cos(t * 1.1 + i * 1.7) * 0.4, Math.sin(t * 0.9 + i * 2.3) * 0.4)));
    mHomes.forEach((p, i) => put(p.clone().add(V(Math.sin(t + i) * 0.4, Math.cos(t * 1.2 + i) * 0.3, 0))));
    if (K.p1 > 0 && K.p1 < 1) wayI.forEach((w, i) => put(along(w, smooth(0, 1, K.p1 * 1.3 - i * 0.1))));
    if (K.p3 > 0 && K.p3 < 1) wayIII.forEach((w, i) => put(along(w, smooth(0, 1, K.p3 * 1.3 - i * 0.1))));
    if (K.p4 > 0 && K.p4 < 1) wayIV.forEach((w, i) => put(along(w, smooth(0, 1, K.p4 * 1.2 - i * 0.15))));
    if (K.w > 0 && K.w < 0.7) waterH.forEach((w, i) => put(along(w, smooth(0, 0.7, K.w))));   /* 4 protons from the matrix */
    /* through ATP synthase: one ion per eighth of a turn, down beside the ring (which turns with it) */
    const ringA = K.turn * Math.PI / 4;
    rotor.rotation.y = -ringA;
    if (K.turn > 0) for (let j = 0; j < 8; j++) {
      const q = K.turn - j; if (q < -1.2 || q > 2.5) continue;
      const p = q < 0 ? atp.localToWorld(V(3.4, -6.4 - q * 0, 1.5)).lerp(ringW(0.3, 0), 1 + q / 1.2) : q < 1 ? ringW(0.3 + (Math.floor(K.turn) - j) * 0, 0) : ringW(0.3, 0).lerp(atp.localToWorld(V(2.6, 6.5, 2.2)), smooth(1, 2.5, q));
      put(p);
    }
    for (let i = n; i < NH; i++) { hs.setMatrixAt(i, zero); gp.setXYZ(i, 0, -999, 0); }
    hs.instanceMatrix.needsUpdate = true; gp.needsUpdate = true;
    halo.visible = !!ePa && pairMove; if (ePa) halo.position.copy(ePa);
    /* the carriers show while electrons are on their way (steps 2 to 6), and the complexes become see-through */
    const showC = (K.e1 > 0 && K.w < 1) ? 1 : 0; carriers.forEach(c => { c.visible = !!showC; });
    fadeProt(resp, 1 - 0.5 * K.see); fadeProt(c2, 1 - 0.5 * K.see);
  }
  const D = (x, y, z) => V(x, y, z).normalize(), UP = V(0, 1, 0);
  const views = [
    { at: V(2, 0.5, -5), dist: 92, dir: D(0.06, 0.12, 1), up: UP },
    { at: V(-24, -4, -5), dist: 48, dir: D(0.1, 0.08, 1), up: UP },
    { at: V(8, -3, -3), dist: 32, dir: D(0.06, 0.08, 1), up: UP },
    { at: V(-12, 1, -5), dist: 44, dir: D(0.05, 0.1, 1), up: UP },
    { at: CuB.clone().add(V(-2, 1.5, 0)), dist: 36, dir: D(0.05, 0.1, 1), up: UP },
    { at: V(24, -4, -4), dist: 42, dir: D(0.06, 0.1, 1), up: UP },
    { at: V(33, 0, -3), dist: 32, dir: D(0.05, 0.1, 1), up: UP }
  ];
  const sPts = (obj, offs) => () => surfacePoints(obj, offs.map(o => obj.position.clone().add(o)));
  const molPts = id => () => drawn.atoms.filter(a => a.id === id && a.el !== 'H' && (a.s == null || a.s > 0.5)).map(a => a.p.clone());
  /* one complex of the respirasome, as one thing for its name's points: made once, so the points found can be kept */
  const grpPts = (grp, offs) => {
    const ms = resp.children.filter(m => m.userData.grp === grp);
    const part = { matrixWorld: resp.matrixWorld, userData: resp.userData, updateWorldMatrix: (p, c) => resp.updateWorldMatrix(p, c), traverse: f => ms.forEach(f) };
    return () => surfacePoints(part, offs.map(o => resp.position.clone().add(o)));
  };
  const labels = {
    cI: { html: '<i>complex I</i>', side: 'l', lv: 'x', pts: grpPts('I', [V(-14, -10, 6), V(-12, -12, 6), V(-15, -6, 6)]) },
    cIII: { html: '<i>complex III (two)</i>', side: 'r', lv: 'x', pts: grpPts('III', [V(4, 6, 8), V(2, 7, 6), V(6, 5, 7)]) },
    cIV: { html: '<i>complex IV</i>', side: 'r', lv: 'x', pts: grpPts('IV', [V(15, 3, 2), V(15, -3, 2), V(14, 0, 3)]) },
    cII: { html: '<i>complex II</i>', side: 'r', lv: 'x', pts: sPts(c2, [V(3, -6, 3), V(3, -3, 3)]) },
    atps: { html: 'ATP synthase', side: 'r', pts: () => surfacePoints(atp, [atp.localToWorld(V(5, 10, 3)), atp.localToWorld(V(5, 13, 3))]) },
    ant: { html: '<i>ATP–ADP exchanger</i>', side: 'r', lv: 'x', pts: sPts(ant, [V(3, 1, 2), V(3, -1, 2)]) },
    cyt: { html: '<i>cytochrome c</i>, carrying one electron', side: 'r', lv: 'x', pts: () => surfacePoints(cytc, [cytc.position.clone().add(V(2, 1, 2)), cytc.position.clone().add(V(2, -1, 2))]) },
    /* ubiquinone: its line ends on the molecule's far end, clear of the iron–sulfur cluster's bead (the review) */
    q: { html: '<i>ubiquinone</i>, in the membrane', side: 'l', lv: 'x', pts: () => { const P = molPts('q')(); return P.filter(p => p.distanceTo(N2) > 1.4).concat(P.length ? [] : []); } },
    face: { html: 'the other side of the crista', side: 'l', pts: () => [V(-34, FACE, 0.05), V(-30, FACE, 0.05), V(-38, FACE, 0.05)] },
    ims: { html: 'intermembrane space', side: 'l', pts: () => [V(-34, 8, 0), V(-30, 9.5, 0), V(-38, 7, 0)] },
    mx: { html: 'matrix', side: 'l', pts: () => [V(-34, -8, 0), V(-30, -9.5, 0), V(-38, -7, 0)] },
    im: { html: 'inner membrane', side: 'l', pts: () => [V(-34, 2.3, 0.05), V(-30, 2.3, 0.05), V(-38, 2.3, 0.05)] },
    nadh: { html: 'NADH', side: 'l', pts: molPts('n') },
    nad: { html: 'NAD (it was NADH): recycled', side: 'l', pts: molPts('n') },
    e: { html: 'two electrons', side: 'r', pts: () => eS.filter(s => s.visible).map(s => s.position.clone()) },
    h: { html: 'protons (H⁺)', side: 'r', pts: () => homes.slice(0, 30).filter(p => p.x > -10 && p.x < 20).map(p => p.clone()) },
    hpool: { html: 'many protons: a high concentration', side: 'r', pts: () => homes.slice(0, 60).filter(p => p.x > 0 && p.x < 30).map(p => p.clone()) },
    hfew: { html: 'few protons', side: 'r', pts: () => mHomes.filter(p => p.x > 0 && p.x < 30).map(p => p.clone()) },
    o2: { html: 'oxygen: it waits for 4 electrons', side: 'r', pts: molPts('w') },
    water: { html: 'water, into the matrix', side: 'r', pts: () => molPts('w1')().concat(molPts('w2')()) },
    atpm: { html: 'ATP', side: 'r', pts: molPts('x0') },
    adp: { html: 'ADP', side: 'l', pts: molPts('y') },
    ring: { html: 'its ring turns', side: 'l', pts: () => [ringW(Math.PI, 0.5), ringW(Math.PI * 0.8, 0.5)] }
  };
  const steps = [
    { phases: [{ to: { cam: 0 }, ms: 800 }], labs: { cI: 1, cIII: 1, cIV: 1, cII: 1, atps: 1, ant: 2, cyt: 2, ims: 2, mx: 2, face: 2 }, pic: 'The inner membrane at its true size: each protein in its measured shape. Above: the other side of the crista (its proteins are not drawn).' },
    { phases: [{ to: { cam: 1, n1: 1, see: 1 }, ms: 2600 }, { to: { e1: 1 }, ms: 4200 }, { to: { n1: 2 }, ms: 1400 }], labs: { cI: 1, q: 1, nad: 1 } },
    { phases: [{ to: { p1: 1, pool: 0.3, n1: 3 }, ms: 3600 }], labs: { cI: 1, h: 1, ims: 2, mx: 2 } },
    { phases: [{ to: { cam: 2 }, ms: 2200 }, { to: { e2: 1 }, ms: 3200 }], labs: { cII: 1, q: 2 } },
    { phases: [{ to: { cam: 3 }, ms: 2000 }, { to: { q: 1 }, ms: 3000 }, { to: { e3: 1, p3: 1, pool: 0.45 }, ms: 3600 }], labs: { cIII: 1, cyt: 1, q: 2 } },
    { phases: [{ to: { cam: 4 }, ms: 2000 }, { to: { c: 1 }, ms: 2800 }, { to: { e4: 1 }, ms: 4200 }], labs: { cIV: 1, o2: 1, cyt: 2 } },
    { phases: [{ to: { cc2: 1 }, ms: 900 }, { to: { e5: 1 }, ms: 4200 }, { to: { w: 1, p4: 1, pool: 0.55 }, ms: 3200 }], labs: { water: 1, cIV: 1 } },
    { phases: [{ to: { cam: 0, pool: 1, see: 0, cc2: 0 }, ms: 4200 }], labs: { hpool: 1, hfew: 1, im: 1 }, board: '<b>Like water behind a dam</b><span>many H⁺ above, in the small intermembrane space</span><span>few H⁺ below, in the matrix</span><span>the phospholipid bilayer lets almost none back</span><span class="b">the only way back: ATP synthase</span>' },
    { phases: [{ to: { cam: 5 }, ms: 2400 }, { to: { turn: 8, mk: 3, pool: 0.94 }, ms: 9000, lin: ['turn', 'mk'] }], labs: { atps: 1, ring: 1, atpm: 2 } },
    { phases: [{ to: { cam: 6 }, ms: 2000 }, { to: { ant: 1 }, ms: 3600 }], labs: { ant: 1, atpm: 1, adp: 1 } },
    { phases: [{ to: { cam: 0, turn: 16 }, ms: 3000, lin: ['turn'] }], labs: { atps: 1, ant: 2 }, board: '<b>ATP gives energy for</b><span>muscle contraction</span><span>active transport across membranes</span><span>making proteins and DNA</span><span class="b">ATP leaves the mitochondrion through porin</span>' },
    { phases: [{ to: { cam: 0, turn: 24 }, ms: 3000, lin: ['turn'] }], labs: { cI: 1, cIV: 1, atps: 1 }, board: '<b>Per glucose</b><span>8 NADH → complex I</span><span>2 NADH of glycolysis → by a shuttle, at FAD</span><span>2 FADH₂ → complex II</span><span>6 oxygen used → 12 water</span><span class="b">about 26 ATP made here</span>' }
  ];
  return { group: g, knobs, views, steps, labels, draw, key: [['intermembrane space', '#4a2449'], ['matrix', '#4a2e1a']], turn: true, dispose() { BS.dispose(); disposeGroup(g); } };
}
