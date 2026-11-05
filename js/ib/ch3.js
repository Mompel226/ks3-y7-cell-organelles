/* ============================================================
   ch3.js — chapter 3, into the mitochondrion (5 Nov 2026). Daniel's text: "pyruvate goes into the mitochondrion. It
   crosses the outer membrane through porin channels, then the inner membrane through a specific pyruvate carrier protein,
   and arrives in the matrix. The 2 NADH from glycolysis cannot cross the inner membrane. Only their electrons get in,
   carried by shuttle systems."
   The game's own mitochondrion (mitoparts.js heroMito: 2.7 µm long, cut open, its membranes at true thickness), then one
   zoom (the distance changes by the same factor each moment; a scale bar) to its edge, where a gap between two cristae
   on that side leaves room for a flat piece of its double membrane (membrane.js), drawn exactly where the cut face draws
   it: the outer membrane's middle 3.5 nm below its surface, the intermembrane space 15 nm, the inner membrane's middle
   25.5 nm below the surface (mitoparts.js TH). In it: porin (VDAC1, PDB 2JK4, a barrel of 19 strands, its pore about
   2.5 nm wide) and the mitochondrial pyruvate carrier (MPC1–MPC2, measured in 2025 in three shapes: open to the
   intermembrane space 8YW6, occluded 9KNX, open to the matrix 8YW9; Liang et al. 2025, Nature), which passes from one
   to the next as pyruvate goes through, with a hydrogen ion (the carrier is a pyruvate/H⁺ symporter: Herzig et al.
   2012, Science 337:96; Bricker et al. 2012). NADH cannot cross the inner membrane: two electrons go on by a shuttle
   (in muscle, the glycerol phosphate shuttle passes them to FAD in the inner membrane: Mráček et al. 2013, BBA 1827:401).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { heroMito, heroPoint, along } from '../world/mitoparts.js?v=202611051947';
import { ballStick, gather, molData, poseAt, faceRing } from './mol.js?v=202611051947';
import { loadProts, protein, surfacePoints, fadeProt } from './prot.js?v=202611051947';
import { bilayer, MEM } from './membrane.js?v=202611051947';
import { disposeGroup, glow, smooth } from './stage.js?v=202611051947';

export async function build(stage, { V }) {
  const [VD, MI, MO, MM] = await loadProts(['vdac', 'mpc_ims', 'mpc_occ', 'mpc_mat']);
  const g = new THREE.Group(); g.name = 'ch3';
  /* ---- the whole mitochondrion, its axis along x, its cut face towards the viewer ---- */
  const H = heroMito(), HS = H.spec;
  const mito = new THREE.Group(); mito.add(H.group); mito.scale.setScalar(1000); mito.rotation.z = -Math.PI / 2; g.add(mito);
  mito.updateMatrixWorld(true);
  /* where to zoom: the middle of the widest gap between two cristae on its upper side (no crista under the flat piece) */
  const up = HS.cristae.filter(c => c.side > 0).map(c => c.s).sort((a, b) => a - b);
  let s0 = HS.total * 0.5, gap = 0;
  for (let i = 0; i + 1 < up.length; i++) if (up[i + 1] - up[i] > gap && up[i] > 0.3 && up[i + 1] < HS.total - 0.3) { gap = up[i + 1] - up[i]; s0 = (up[i] + up[i + 1]) / 2; }
  const F = along(HS, s0), O = mito.localToWorld(heroPoint(HS, s0, F.r, 0));
  const tW = V(F.t.x, F.t.y, 0).applyQuaternion(mito.quaternion).normalize(), nW = V(F.n.x, F.n.y, 0).applyQuaternion(mito.quaternion).normalize();
  /* ---- the magnified double membrane, in nm, at that point: x along the membrane, y out (towards the cytosol), z to the viewer ---- */
  const patch = new THREE.Group(); patch.matrixAutoUpdate = false;
  patch.matrix.makeBasis(tW, nW, V(0, 0, 1)).setPosition(O); g.add(patch);
  const OM = -3.5, IM = -25.5;
  const VDx = -9, MPx = 9, PZ = -3.4;
  const om = bilayer({ x0: -64, x1: 64, depth: 10, holes: [{ x: VDx, z: PZ, r: 2.9 }], seed: 5, head: 0xffa8c8 }); om.position.y = OM; patch.add(om);
  const im = bilayer({ x0: -64, x1: 64, depth: 10, holes: [{ x: MPx, z: PZ, r: 3.4 }], seed: 9, head: 0xffb8a8, tail: 0xffe0b0 }); im.position.y = IM; patch.add(im);
  /* the spaces' colours, far behind the lipids (as the cut face colours them) */
  const sp = (y0, y1, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(150, y1 - y0), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85, depthWrite: false })); m.position.set(0, (y0 + y1) / 2, -14); patch.add(m); return m; };
  /* one colour per space in every chapter (the expert review): cytosol blue, intermembrane space purple, matrix brown */
  const spaces = [sp(-1, 40, 0x1c2660), sp(-23, -6, 0x4a2449), sp(-90, -28, 0x4a2e1a)];
  const vdac = protein(VD, { color: 0x3fd6c0 }); vdac.position.set(VDx, OM, PZ); patch.add(vdac);
  /* see-through, so that pyruvate is seen inside it (the expert review: it was hidden in the carrier) */
  const mpcs = [MI, MO, MM].map(P => { const m = protein(P, { colors: { MPC1: 0xffb35c, MPC2: 0xff8f4d }, glass: true, opacity: 0.32 }); m.position.set(MPx, IM, PZ); patch.add(m); return m; });
  /* ---- the molecules: pyruvate (glucose's carbons 4, 5 and 6), a hydrogen ion with it, an NADH that stays out ---- */
  const BS = ballStick(260, 300); patch.add(BS.group);
  const pq = faceRing('pyruvate', ['C1', 'C2', 'C3', 'O2'], 0.3);
  const PP = [V(-14, 9, 1.2), V(VDx, 2, PZ + 0.6), V(VDx, OM, PZ + 0.4), V(VDx, -9, PZ + 0.6), V(MPx - 1.2, -15, 0.8), V(MPx, -21, PZ + 0.8), V(MPx, IM, PZ + 0.6), V(MPx, -31, PZ + 0.6), V(MPx + 4, -34.5, 1.2)];
  const along3 = (pts, f) => { const n = pts.length - 1, i = Math.max(0, Math.min(n - 1, Math.floor(f * n))), k = f * n - i; return pts[i].clone().lerp(pts[i + 1], k * k * (3 - 2 * k)); };
  /* p: 0 in the cytosol … 1 through porin, in the intermembrane space; 2 through the carrier; 3 in the matrix */
  const pAt = p => p <= 1 ? along3(PP.slice(0, 4), p) : p <= 2 ? along3(PP.slice(3, 8), p - 1) : PP[7].clone().lerp(PP[8], smooth(0, 1, p - 2));
  const hIon = glow(1.6, 0xff4f9a, 1); patch.add(hIon);
  const hCore = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), new THREE.MeshStandardMaterial({ color: 0xff4f9a, emissive: 0xff4f9a, emissiveIntensity: 0.9 })); patch.add(hCore);
  const NP = [V(-24, 10, 1.2), V(VDx - 0.5, 2, PZ + 0.6), V(VDx, OM, PZ + 0.4), V(VDx - 2, -10, 0.8), V(-3, -19.2, 1.0)];
  const nq = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0.4, 0.3));
  const eSp = [0, 1].map(() => { const s = glow(1.1, 0xfff07a, 1); patch.add(s); return s; });
  const halo = glow(3.2, 0xfff4d0, 0.5); patch.add(halo);
  const knobs = { cam: 0, p: 0, mpc: 0, n: 0, e: 0 };
  let drawn = { atoms: [], bonds: [] };
  function draw(K, t) {
    /* the cut face and the magnified piece: the piece takes over as the camera comes close */
    const d = stage.view.dist, near = smooth(700, 180, d);
    H.parts.outer.visible = H.parts.inner.visible = H.parts.cristae.visible = d > 140;
    const U = H.section.userData.u;
    if (U.uHole) U.uHole.value.set(s0, 0.066, 0.11, near);
    patch.visible = d < 900;
    [om, im].forEach(b => b.userData.mats.forEach(m => { m.transparent = near < 0.999; m.opacity = near; }));
    spaces.forEach(m => { m.material.opacity = 0.85 * near; });
    fadeProt(vdac, near);
    /* the carrier's three measured shapes, one after the other as pyruvate passes (mpc: 0 open to the intermembrane space,
       1 closed round pyruvate, 2 open to the matrix) */
    const w = [1 - smooth(0, 1, K.mpc), smooth(0, 1, K.mpc) * (1 - smooth(1, 2, K.mpc)), smooth(1, 2, K.mpc)];
    mpcs.forEach((m, i) => fadeProt(m, w[i] * near));
    /* pyruvate, and its hydrogen ion beside it from the intermembrane space to the matrix */
    const pp = pAt(K.p), insts = [{ key: 'pyruvate', id: 't', P: { p: pp, q: pq }, num: { C1: 4, C2: 5, C3: 6 } }];
    const hp = K.p < 1 ? V(MPx + 1.6, -12, 1) : pp.clone().add(V(1.0, 0.4, 0.6)); hIon.position.copy(hp); hCore.position.copy(hp);
    hIon.visible = hCore.visible = near > 0.5 && K.p > 0.6 && K.p < 2.9;
    /* NADH: through porin, then turned back by the inner membrane; two electrons go on (a shuttle) */
    if (K.n > 0) {
      const f = Math.min(1, K.n), back = smooth(1, 2, K.n);
      const np = along3(NP, f).add(V(-2, 3.5, 0).multiplyScalar(back));
      insts.push({ key: 'nadh', id: 'n', P: { p: np, q: nq } });
      eSp.forEach((s, i) => { const k = smooth(0, 1, K.e - i * 0.15); s.visible = K.e > 0 && k < 0.999; s.position.copy(NP[4].clone().lerp(V(-1 + i * 1.2, IM + 0.8, 0.4), k)); });
    } else eSp.forEach(s => { s.visible = false; });
    const all = gather(insts); BS.draw(all.atoms, all.bonds, stage.cam.position.clone().sub(stage.view.at).normalize()); drawn = all;
    halo.position.copy(pp); halo.visible = near > 0.5;
    BS.group.visible = near > 0.3;
  }
  const nums = () => drawn.atoms.filter(a => a.el === 'C' && a.gn != null).map(a => ({ n: String(a.gn), p: patch.localToWorld(a.p.clone()) }));
  /* ---- views: the whole mitochondrion, its edge, the carrier ---- */
  const D = (x, y, z) => V(x, y, z).normalize(), UPw = V(0, 1, 0);
  const pW = (x, y, z) => patch.localToWorld(V(x, y, z));
  patch.updateMatrixWorld(true);
  const nUp = nW.clone();
  const views = [
    { at: mito.localToWorld(heroPoint(HS, HS.total / 2, 0, 0)), dist: 4200, dir: D(0.06, 0.16, 1), up: UPw },
    { at: pW(-2, -13, -2), dist: 66, dir: D(0.03, 0.08, 1), up: nUp },
    /* framed so that pyruvate is in the picture at each step's end (the review: it had been under the bottom edge) */
    { at: pW(VDx, -5, -2), dist: 17, dir: D(0.04, 0.1, 1), up: nUp },
    { at: pW(MPx, -26, -2), dist: 19, dir: D(0.04, 0.08, 1), up: nUp },
    { at: pW(-4, -13, -2), dist: 40, dir: D(0.03, 0.08, 1), up: nUp },
    { at: pW(MPx + 2, -30, -2), dist: 19, dir: D(0.04, 0.08, 1), up: nUp }
  ];
  /* ---- names ---- */
  const hW = (s, a) => mito.localToWorld(heroPoint(HS, s, a, 0));
  const crW = (() => { const c = HS.cristae.find(c => Math.abs(c.s - HS.total * 0.3) < 0.12) || HS.cristae[3], Fc = along(HS, c.s); return hW(c.s, c.side * (Fc.r - 0.06)); })();
  const labels = {
    mOM: { html: 'outer membrane', side: 'r', pts: () => [0.55, 0.6, 0.65].map(f => hW(HS.total * f, along(HS, HS.total * f).r - 0.0035)) },
    mIM: { html: 'inner membrane', side: 'l', pts: () => [0.35, 0.4].map(f => hW(HS.total * f, -(along(HS, HS.total * f).r - 0.0255))) },
    mCr: { html: 'a crista: a fold of the inner membrane', side: 'l', pts: () => [crW] },
    mMx: { html: 'matrix', side: 'r', pts: () => [hW(HS.total * 0.62, 0.05), hW(HS.total * 0.7, -0.08)] },
    cyt: { html: 'cytosol', side: 'l', pts: () => [pW(-17, 6, 0), pW(-21, 9, 0), pW(-12, 7, 0)] },
    om: { html: 'outer membrane', side: 'l', pts: () => [pW(-17, OM + 2.1, 0.05), pW(-21, OM + 2.1, 0.05), pW(-13, OM + 2.1, 0.05)] },
    ims: { html: 'intermembrane space (15 nm)', side: 'l', pts: () => [pW(-17, -14.5, 0), pW(-21, -14.5, 0), pW(-13, -14.5, 0)] },
    im: { html: 'inner membrane', side: 'l', pts: () => [pW(-17, IM + 2.1, 0.05), pW(-21, IM + 2.1, 0.05), pW(-13, IM + 2.1, 0.05)] },
    mx: { html: 'matrix', side: 'l', pts: () => [pW(-17, -34, 0), pW(-21, -36, 0), pW(-12, -33, 0), pW(5, -33, 0), pW(16, -33.5, 0), pW(3, -35, 0)] },
    vdac: { html: 'a channel protein: <i>porin (VDAC1)</i>', side: 'r', pts: () => surfacePoints(vdac, [pW(VDx + 2.6, OM, PZ + 2), pW(VDx + 2.8, OM + 1, PZ + 1.5)]) },
    mpc: { html: '<i>pyruvate carrier (MPC1 and MPC2)</i>', side: 'r', lv: 'x', pts: () => surfacePoints(mpcs[Math.min(2, Math.round(knobs.mpc))] || mpcs[0], [pW(MPx + 2.8, IM, PZ + 2), pW(MPx + 3, IM - 1, PZ + 1.5)]) },
    pyr: { html: 'pyruvate', side: 'l', pts: () => drawn.atoms.filter(a => a.id === 't' && a.el !== 'H').map(a => patch.localToWorld(a.p.clone())) },
    h: { html: 'a proton, H⁺', side: 'r', pts: () => hIon.visible ? [hIon.getWorldPosition(V())] : [] },
    nadh: { html: 'NADH: it cannot cross', side: 'l', pts: () => drawn.atoms.filter(a => a.id === 'n' && a.el !== 'H').map(a => patch.localToWorld(a.p.clone())) },
    e: { html: 'its two electrons enter (a shuttle)', side: 'r', pts: () => eSp.filter(s => s.visible).map(s => s.getWorldPosition(V())).concat([pW(-0.5, IM + 0.8, 0.4), pW(-2.5, IM + 0.8, 0.4), pW(1.5, IM + 0.8, 0.4), pW(-4.5, IM + 0.8, 0.4)]) }
  };
  const steps = [
    { phases: [{ to: { cam: 0 }, ms: 800 }], labs: { mOM: 1, mIM: 1, mCr: 1, mMx: 2 } },
    { phases: [{ to: { cam: 1 }, ms: 3800 }], labs: { cyt: 1, om: 1, ims: 1, im: 1, mx: 1 } },
    { phases: [{ to: { cam: 2 }, ms: 1600 }, { to: { p: 1 }, ms: 3200 }], labs: { vdac: 1, pyr: 1, ims: 2 } },
    { phases: [{ to: { cam: 3 }, ms: 1800 }, { to: { p: 1.45 }, ms: 1600 }, { to: { p: 1.7, mpc: 1 }, ms: 1800 }, { to: { p: 1.95, mpc: 2 }, ms: 1800 }], labs: { mpc: 1, pyr: 1, h: 1 } },
    { phases: [{ to: { p: 3, mpc: 0, cam: 5 }, ms: 2400 }], labs: { pyr: 1, mx: 1, mpc: 2 } },
    { phases: [{ to: { cam: 4, n: 1 }, ms: 3600 }, { to: { e: 1.2 }, ms: 2200 }, { to: { n: 2 }, ms: 1600 }], labs: { nadh: 1, e: 1, im: 2 } },
    { phases: [{ to: { cam: 1 }, ms: 2000 }], labs: { om: 1, im: 1, mx: 1 } }
  ];
  return { group: g, knobs, views, steps, labels, draw, nums, narrowZoom: 0.85, key: [['cytosol', '#1c2660'], ['intermembrane space', '#4a2449'], ['matrix', '#4a2e1a']], turn: true, dispose() { BS.dispose(); disposeGroup(g); } };
}
