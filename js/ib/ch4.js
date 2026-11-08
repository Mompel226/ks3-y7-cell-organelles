/* ============================================================
   ch4.js — chapter 4, the link reaction in the matrix (5 Nov 2026). Daniel's text: "Each pyruvate (3C) goes through three
   changes: Decarboxylation. One carbon is removed as CO₂ ... Oxidation. Hydrogen is removed and NAD⁺ becomes NADH. The
   remaining acetyl group (2C) is attached to coenzyme A, making acetyl CoA." IB C1.2.11 (HL).
   The enzyme: the pyruvate dehydrogenase complex, the largest enzyme of respiration. Its core (E2, 60 chains, 24 nm
   across) is its measured shape (PDB 6CT0, the biological assembly: Jiang et al. 2018, Biochemistry 57:2325); its other
   enzymes (E1, which removes the carbon dioxide, and E3) sit round the core and are not shown: the chapter says so. The
   reaction is shown in its three stages, one atom group at a time (mol.js Reaction `when`): the carboxyl group leaves as
   carbon dioxide (glucose's carbon 4 for this pyruvate), the hydrogen reaches NAD (its electrons: NADH), the acetyl group
   (glucose's carbons 5 and 6) joins coenzyme A's sulfur. In the enzyme, the hydrogen goes by way of the lipoyl arms and
   FAD of E3 (Patel and Roche 1990, FASEB J 4:3224); the picture shows where it starts and where it ends.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { ballStick, gather, Reaction, poseAt, moved, faceRing, molData } from './mol.js?v=202611081649';
import { loadProts, protein, surfacePoints, fadeProt } from './prot.js?v=202611081649';
import { bilayer } from './membrane.js?v=202611081649';
import { disposeGroup, glow, smooth } from './stage.js?v=202611081649';

/* its measured shapes: the view fetches them while the pupil reads the chapter before (view.js ahead) */
const PROTS = ['pdh', 'mpc_mat'];
export const prefetch = () => loadProts(PROTS);

export async function build(stage, { V }) {
  const [PDH, MM] = await loadProts(PROTS);
  const g = new THREE.Group(); g.name = 'ch4';
  /* the matrix's colour far behind, the inner membrane at the top with the pyruvate carrier, open to the matrix */
  const back = new THREE.Mesh(new THREE.PlaneGeometry(400, 300), new THREE.MeshBasicMaterial({ color: 0x3a2214 })); back.position.set(0, 0, -60); g.add(back);
  const IMY = 17;
  const im = bilayer({ x0: -40, x1: 40, depth: 9, holes: [{ x: -6, z: -3.2, r: 3.4 }], seed: 11, head: 0xffb8a8, tail: 0xffe0b0 }); im.position.y = IMY; g.add(im);
  const mpc = protein(MM, { colors: { MPC1: 0xffb35c, MPC2: 0xff8f4d } }); mpc.position.set(-6, IMY, -3.2); g.add(mpc);
  /* the core of the pyruvate dehydrogenase complex, see-through */
  const pdh = protein(PDH, { color: 0xb7a8ff, glass: true, opacity: 0.16, rimK: 0.4 }); pdh.position.set(1, -7, -15.5); g.add(pdh);
  /* the molecules at the reaction's place R, in front of the core */
  const R = V(0, 0, 0.5);
  const pin = poseAt('pyruvate', 'C2', R, V(-1, 0.2, 0.3), 0.3);
  const pyrW = n => molData('pyruvate').P[molData('pyruvate').idx[n]].clone().applyQuaternion(pin.q).add(pin.p);
  const cP = poseAt('coa', 'S', pyrW('C2').add(V(0.45, -0.12, 0.15)), V(1, -0.35, 0.25), 0.6);
  const nP = poseAt('nad', 'N_C4', pyrW('C2').add(V(0.1, 0.65, 0.2)), V(0.3, 1, 0.3), 0.2);
  const rx = new Reaction({
    from: [{ key: 'pyruvate', id: 't', P: pin, num: { C1: 4, C2: 5, C3: 6 } }, { key: 'coa', id: 'c', P: cP }, { key: 'nad', id: 'n', P: nP }],
    to: [{ key: 'acetylcoa', id: 'c' }, { key: 'co2', id: 'x' }, { key: 'nadh', id: 'n' }],
    moves: [['t:C1', 'x:C1'], ['t:O1a', 'x:O1'], ['t:O1b', 'x:O2'], ['t:C2', 'c:A1'], ['t:O2', 'c:OA1'], ['t:C3', 'c:A2'], ['c:HS', 'n:HN_C4a']],
    /* the enzyme's order (the expert review, 5 Nov 2026): carbon dioxide leaves; the acetyl group joins coenzyme A's sulfur
       as its hydrogen leaves it; NAD is reduced last (in the enzyme, through its lipoamide and FAD) */
    when: (id, name) => id === 'x' ? [0, 0.3] : id === 'c' ? [0.18, 0.62] : id === 'n' && name === 'HN_C4a' ? [0.18, 1] : id === 'n' ? [0.62, 1] : [0, 0.3]
  });
  const start = { p: V(-6, IMY - 4.5, 0.6), q: faceRing('pyruvate', ['C1', 'C2', 'C3', 'O2'], 0.3) };
  const BS = ballStick(320, 360); g.add(BS.group);
  const halo = glow(3, 0xfff4d0, 0.5); g.add(halo);
  const knobs = { cam: 0, p: 0, cof: 0, rx: 0, out: 0 };
  let drawn = { atoms: [], bonds: [] };
  const lerpP = (A, B, f) => ({ p: A.p.clone().lerp(B.p, f), q: A.q.clone().slerp(B.q, f) });
  function draw(K) {
    let all;
    if (K.rx <= 0) {
      const insts = [{ key: 'pyruvate', id: 't', P: lerpP(start, pin, smooth(0, 1, K.p)), num: { C1: 4, C2: 5, C3: 6 } }];
      if (K.cof > 0) { insts.push({ key: 'coa', id: 'c', P: moved(cP, V(6, -3, 2), 1 - smooth(0, 1, K.cof)) }, { key: 'nad', id: 'n', P: moved(nP, V(4, 4, 2), 1 - smooth(0, 1, K.cof)) }); }
      all = gather(insts);
    } else if (K.rx < 1 || K.out <= 0) all = rx.at(Math.min(1, K.rx));
    else {
      const f = smooth(0, 1, K.out);
      all = gather([{ key: 'acetylcoa', id: 'c', P: moved(rx.placeOf('c'), V(9, -2, 1), f) }, { key: 'co2', id: 'x', P: moved(rx.placeOf('x'), V(-5, 3, 3), f), s: 1 - smooth(0.7, 1, f) },
        { key: 'nadh', id: 'n', P: moved(rx.placeOf('n'), V(-3, 7, 2), f), s: 1 - smooth(0.7, 1, f) }]);
      /* glucose's numbers stay on the acetyl group and on the carbon dioxide */
      all.atoms.forEach(a => { if (a.id === 'c' && a.name === 'A1') a.gn = 5; if (a.id === 'c' && a.name === 'A2') a.gn = 6; if (a.id === 'x' && a.name === 'C1') a.gn = 4; });
    }
    BS.draw(all.atoms, all.bonds, stage.cam.position.clone().sub(stage.view.at).normalize()); drawn = all;
    const c = all.atoms.filter(a => a.gn != null); if (c.length) halo.position.copy(c.reduce((s, a) => s.add(a.p), V()).divideScalar(c.length));
  }
  const nums = () => drawn.atoms.filter(a => a.el === 'C' && a.gn != null && (a.s == null || a.s > 0.4)).map(a => ({ n: String(a.gn), p: a.p }));
  const D = (x, y, z) => V(x, y, z).normalize(), UP = V(0, 1, 0);
  const views = [
    { at: V(0, 3, -6), dist: 58, dir: D(0.06, 0.12, 1), up: UP },
    { at: R.clone().add(V(0.2, 0.4, 0)), dist: 8.5, dir: D(0.04, 0.08, 1), up: UP },
    { at: V(3, 0, -2), dist: 30, dir: D(0.05, 0.1, 1), up: UP }
  ];
  const molPts = id => () => drawn.atoms.filter(a => a.id === id && a.el !== 'H' && (a.s == null || a.s > 0.5)).map(a => a.p.clone());
  const atomPts = (id, names) => () => drawn.atoms.filter(a => a.id === id && names.includes(a.name)).map(a => a.p.clone());
  const labels = {
    pdh: { html: '<i>pyruvate dehydrogenase complex (its core: 60 protein chains)</i>', side: 'r', lv: 'x', pts: () => surfacePoints(pdh, [V(13, -2, -4), V(12, -9, -4), V(11, 4, -5)]) },
    im: { html: 'inner membrane', side: 'l', pts: () => [V(-26, IMY + 2.1, 0.05), V(-30, IMY + 2.1, 0.05), V(-22, IMY + 2.1, 0.05)] },
    mx: { html: 'matrix', side: 'l', pts: () => [V(-26, 4, 0), V(-30, -2, 0)] },
    mpc: { html: '<i>pyruvate carrier</i>', side: 'r', lv: 'x', pts: () => surfacePoints(mpc, [V(-3, IMY, 0), V(-3, IMY - 2, 0)]) },
    pyr: { html: 'pyruvate (3C)', side: 'l', pts: molPts('t') },
    co2: { html: 'carbon dioxide', side: 'l', pts: molPts('x') },
    nadh: { html: 'NADH (reduced NAD)', side: 'r', pts: atomPts('n', ['N_C4', 'C37', 'C42', 'C43', 'C36', 'N_N1']) },
    nad: { html: 'NAD', side: 'r', pts: atomPts('n', ['N_C4', 'C37', 'C42', 'C43', 'C36', 'N_N1']) },
    coa: { html: 'coenzyme A', side: 'r', pts: molPts('c') },
    acoa: { html: 'acetyl CoA: an acetyl group (2C) on coenzyme A', side: 'r', pts: atomPts('c', ['A1', 'A2', 'OA1', 'S']) }
  };
  const steps = [
    { phases: [{ to: { cam: 0 }, ms: 600 }, { to: { p: 1 }, ms: 3000 }], labs: { pdh: 1, pyr: 1, im: 2, mx: 2, mpc: 2 }, pic: 'The see-through shape is the core of one enzyme complex, at its true size.' },
    { phases: [{ to: { cam: 1, cof: 1 }, ms: 2600 }, { to: { rx: 0.62 }, ms: 4200 }], labs: { co2: 1, acoa: 1, nad: 2 } },
    { phases: [{ to: { rx: 1 }, ms: 2800 }], labs: { nadh: 1, acoa: 2 } },
    { phases: [{ to: { cam: 2, out: 1 }, ms: 3200 }], labs: { acoa: 1, pdh: 2 }, board: '<b>Per glucose (×2)</b><span>2 carbon dioxide</span><span>2 NADH</span><span>2 acetyl CoA</span><span class="b">no ATP</span>' }
  ];
  return { group: g, knobs, views, steps, labels, draw, narrowZoom: 0.8, nums, turn: true, dispose() { BS.dispose(); disposeGroup(g); } };
}
