/* ============================================================
   ch1.js — chapter 1, into the cell (5 Nov 2026). Daniel's text: "glucose enters by facilitated diffusion through GLUT
   transport proteins. That's passive and needs no ATP. Glucose is polar, so it can't cross the phospholipid bilayer by
   itself. Oxygen arrives separately ... It isn't needed until the very last step." And his note: "you can show actually
   immediately what happens to the glucose that is phosphorylated ... because it gets phosphorylated, it cannot then exit
   the carrier protein ... You can add that detail."
   Everything at its true size (nm): the bilayer about 5 nm thick (membrane.js), glucose about 1 nm, GLUT4 in its measured
   shape (PDB 7WSM, inward-open: Yuan et al. 2022), hexokinase 2 (PDB 2NZT, 14 nm long), ATP and ADP. The transporter's
   alternating access is shown by rocking its two halves (N: TM1–6, C: TM7–12; tools/ib-proteins.py splits the chain at
   residue 272) about an axis in the membrane's plane, 9° each: the rocker switch seen between the outward GLUT3 and the
   inward GLUT1 structures (Deng et al. 2015, Nature 526:391). Its measured shape is the inward-open one (rock = 1).
   Hexokinase: glucose in its measured site (the glucose of 2NZT's C-terminal half); ATP placed beside it, its last
   phosphate group 0.4 nm from glucose's O6 (2NZT holds no ATP); the phosphate group (P and its three outer oxygens) moves
   to O6, and the hydrogen of O6 leaves as a hydrogen ion: glucose 6-phosphate and ADP (mol.js Reaction).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { ballStick, gather, Reaction, molData, smooth, faceRing } from './mol.js?v=202611081443';
import { loadProts, protein, surfacePoints } from './prot.js?v=202611081443';
import { bilayer, MEM } from './membrane.js?v=202611081443';
import { disposeGroup, glow } from './stage.js?v=202611081443';

const lerp3 = (pts, f) => { const n = pts.length - 1, i = Math.max(0, Math.min(n - 1, Math.floor(f * n))), k = f * n - i, e = k * k * (3 - 2 * k); return pts[i].clone().lerp(pts[i + 1], e); };
const qAxis = (a, t) => new THREE.Quaternion().setFromAxisAngle(a, t);
/* a rotation that takes direction a onto direction b, then turns round b by `roll` */
const qOnto = (a, b, roll = 0) => qAxis(b.clone().normalize(), roll).multiply(new THREE.Quaternion().setFromUnitVectors(a.clone().normalize(), b.clone().normalize()));

/* its measured shapes: the view fetches them while the pupil reads the chapter before (view.js ahead) */
const PROTS = ['glut4', 'hk2'];
export const prefetch = () => loadProts(PROTS);

export async function build(stage, { V }) {
  const [GL, HK] = await loadProts(PROTS);
  const g = new THREE.Group(); g.name = 'ch1';
  /* ---- the membrane and the glucose transporter in its window ---- */
  const GA = V(0, 0, -3.2);
  g.add(bilayer({ x0: -30, x1: 30, depth: 10, holes: [{ x: GA.x, z: GA.z, r: 3.5 }] }));
  /* see-through, with a window into its middle, so that glucose is seen inside it as it changes shape (the expert review,
     5 Nov 2026: opaque, glucose vanished in it) */
  const glut = protein(GL, { colors: { N: 0x37d2bd, C: 0x2aa9cf }, glass: true, opacity: 0.3 }); glut.position.copy(GA); g.add(glut);
  glut.userData.hole.set(GA.x, GA.y, GA.z + 2.4, 2.4);
  const S = glut.userData.sites, half = { N: null, C: null };
  glut.children.forEach(m => { half[m.userData.grp] = m; });
  const pivot = S.nHalf.clone().add(S.cHalf).multiplyScalar(0.5).setY(0);
  const dN = S.cHalf.clone().sub(S.nHalf).setY(0).normalize(), axis = new THREE.Vector3(0, 1, 0).cross(dN).normalize();
  const TH = THREE.MathUtils.degToRad(9);
  const rockTo = r => {                         /* r = 1: open to the inside (as measured); r = -1: open to the outside */
    const th = (1 - r) / 2 * TH;
    for (const [m, sg] of [[half.N, 1], [half.C, -1]]) { const q = qAxis(axis, sg * th); m.quaternion.copy(q); m.position.copy(pivot).sub(pivot.clone().applyQuaternion(q)); }
  };
  /* ---- hexokinase, see-through, its active site towards the viewer ---- */
  const SITE = V(6.5, 9.6, -0.6);
  const hk = protein(HK, { color: 0xb3a6ff, glass: true, opacity: 0.2 });
  hk.position.copy(SITE).sub(hk.userData.sites.glucose); g.add(hk);
  hk.userData.hole.set(SITE.x, SITE.y, SITE.z + 1.6, 3.2);   /* a window into its active site */
  /* ---- the molecules ---- */
  const BS = ballStick(); g.add(BS.group);
  const G0 = molData('glucose'), A0 = molData('atp');
  const gq0 = faceRing('glucose', ['C1', 'C2', 'C3', 'C4', 'C5', 'O5'], 0.45, 0.1);
  /* in the site: O6 (with its CH2, carbon 6) towards the ATP, on the right */
  const o6 = G0.P[G0.idx.O6].clone(), c1 = G0.P[G0.idx.C1].clone();
  const gqSite = qOnto(o6.clone().sub(c1), V(1, 0.15, 0.35), 0.6);
  const gPath = [V(-4.6, -4.7, 0.4), V(-1.6, -4.4, -1.4), GA.clone().add(V(0, -3.2, 0.6)), GA.clone().add(S.cavity).add(V(0, -0.3, 0)),
    GA.clone().add(V(0, 3.6, 0.8)), V(2.6, 6.2, -0.2), SITE.clone()];
  /* g: 0 at the start; 1 at the transporter's outer mouth; 2 in its middle; 3 inside the cell; 4 in hexokinase's site */
  const gAt = k => k <= 1 ? lerp3(gPath.slice(0, 3), k) : k <= 2 ? gPath[2].clone().lerp(gPath[3], smooth(0, 1, k - 1)) : k <= 3 ? gPath[3].clone().lerp(gPath[4], smooth(0, 1, k - 2)) : lerp3(gPath.slice(4), k - 3);
  /* ATP beside it: its last phosphate 0.4 nm from glucose's O6, the rest of it pointing away */
  const o6Site = SITE.clone().add(o6.clone().applyQuaternion(gqSite));
  const pg = A0.P[A0.idx.PG], aCen = A0.groups.adenine.reduce((c, i) => c.add(A0.P[i]), V()).divideScalar(A0.groups.adenine.length);
  const aq = qOnto(aCen.clone().sub(pg), V(0.85, 0.55, 0.35), 0.4);
  const aSite = o6Site.clone().add(V(0.42, 0.05, 0.18)).sub(pg.clone().applyQuaternion(aq));
  const aFrom = aSite.clone().add(V(6, 4, 2));
  const rx = new Reaction({
    from: [{ key: 'glucose', id: 'g', P: { p: SITE.clone(), q: gqSite } }, { key: 'atp', id: 'a', P: { p: aSite.clone(), q: aq } }],
    to: [{ key: 'g6p', id: 'g' }, { key: 'adp', id: 'a' }],
    moves: [['a:PG', 'g:P6'], ['a:O1G', 'g:OP6a'], ['a:O2G', 'g:OP6b'], ['a:O3G', 'g:OP6c']]
  });
  const g6pP = rx.placeOf('g'), adpP = rx.placeOf('a');
  /* oxygen molecules: straight through the bilayer, between the lipids */
  const O2s = [[-7.4, 0.15, 0.0], [-6.1, 0.15, 1.1], [-8.6, 0.15, 0.55], [-5.2, 0.15, 0.3]].map(([x, z, d]) => ({ x, z, d, q: new THREE.Quaternion().setFromEuler(new THREE.Euler(d, d * 2, 0.5)) }));
  const halos = [glow(2.6, 0xfff4d0, 0.55), glow(2.4, 0xffd8a0, 0.5)]; halos.forEach(h => g.add(h));
  /* ---- the knobs, the views, the steps ---- */
  const knobs = { cam: 0, bounce: 0, g: 0, rock: -1, o2: 0, atp: 0, hk: 0, out: 0, trap: 0 };
  const D = (x, y, z) => V(x, y, z).normalize(), UP = V(0, 1, 0);
  const views = [
    { at: V(-3.6, -2.6, 0), dist: 14, dir: D(0.03, 0.08, 1), up: UP },
    { at: V(-4.6, -4.7, 0.4), dist: 4.6, dir: D(0.02, 0.05, 1), up: UP },
    { at: V(-1.2, -0.6, -1.2), dist: 27, dir: D(0.06, 0.14, 1), up: UP },
    { at: SITE.clone().add(V(0.9, 0.2, 0)), dist: 12.5, dir: D(0.05, 0.08, 1), up: UP },
    { at: GA.clone().add(V(0.8, 3.6, 2.2)), dist: 9, dir: D(0.05, 0.12, 1), up: UP },
    { at: V(2.5, 3.4, -2), dist: 36, dir: D(0.08, 0.14, 1), up: UP }
  ];
  /* where each molecule is, from the knobs */
  let cur = { gl: null, at: null, rxF: 0 };
  function molecules(K, t) {
    const insts = [];
    const gk = Math.max(0, K.g + 0 * t);
    let gp = gAt(Math.min(4, gk));
    if (K.bounce > 0) gp = gp.clone().add(V(0, 1.9 * Math.sin(Math.PI * Math.min(1, K.bounce)), 0));
    const toSite = smooth(3.2, 4, gk), gq = gq0.clone().slerp(gqSite, toSite);
    const ap = aFrom.clone().lerp(aSite, smooth(0, 1, K.atp));
    if (K.hk <= 0) {
      insts.push({ key: 'glucose', id: 'g', P: { p: gp, q: gq } });
      if (K.atp > 0) insts.push({ key: 'atp', id: 'a', P: { p: ap, q: aq } });
      return { insts, rx: null, gCen: gp, aCen: ap };
    }
    if (K.hk < 1) return { insts: [], rx: rx.at(K.hk), gCen: SITE, aCen: aSite };
    /* after: ADP leaves; glucose 6-phosphate moves to the transporter's inner mouth and is turned back */
    const adp = { key: 'adp', id: 'a', P: { p: adpP.p.clone().add(V(5, 5, 2).multiplyScalar(smooth(0, 1, K.out))), q: adpP.q } };
    const mouth = GA.clone().add(V(0.3, 3.0, 0.9)), away = GA.clone().add(V(1.0, 4.9, 2.4));
    const tr = K.trap, f1 = smooth(0, 0.55, tr), f2 = smooth(0.6, 1, tr);
    const gpos = g6pP.p.clone().lerp(mouth, f1).lerp(away, f2);
    const g6p = { key: 'g6p', id: 'g', P: { p: gpos, q: g6pP.q } };
    if (K.out < 1) insts.push(adp); insts.push(g6p);
    return { insts, rx: null, gCen: gpos, aCen: adp.P.p, g6p };
  }
  let last = null, drawn = { atoms: [], bonds: [] };
  function draw(K, t) {
    rockTo(K.rock);
    const M = molecules(K, t); last = M;
    const view = stage.cam.position.clone().sub(stage.view.at).normalize();
    const all = M.rx || gather(M.insts);
    /* the oxygen molecules */
    if (K.o2 > 0) {
      const extra = O2s.map((o, i) => { const y = -7 + 14 * smooth(0, 1, Math.min(1, K.o2 * 1.15 - i * 0.05)); return { key: 'o2', id: 'o' + i, P: { p: V(o.x, y, o.z), q: o.q } }; });
      const ox = gather(extra), base = all.atoms.length;
      all.atoms.push(...ox.atoms); ox.bonds.forEach(b => all.bonds.push({ a: b.a + base, b: b.b + base, o: b.o, s: b.s }));
    }
    BS.draw(all.atoms, all.bonds, view);
    halos[0].position.copy(M.gCen); halos[0].visible = true;
    halos[1].position.copy(M.aCen); halos[1].visible = K.atp > 0 && K.out < 1;
    drawn = all;
  }
  /* glucose's carbons, numbered on their atoms; the negative charges of glucose 6-phosphate's phosphate group */
  function nums(K) {
    const A = drawn.atoms, out = [];
    for (const a of A) if (a.id === 'g' && a.el === 'C' && /^C[1-6]$/.test(a.name) && (a.s == null || a.s > 0.5)) out.push({ n: a.name.slice(1), p: a.p });
    if (K.trap > 0 && last && last.g6p) {
      const D6 = molData('g6p');
      D6.q.forEach((q, i) => { if (q < 0) out.push({ n: '−', p: D6.P[i].clone().applyQuaternion(last.g6p.P.q).add(last.g6p.P.p), cls: 'neg' }); });
    }
    return out;
  }
  /* ---- names ---- */
  const atomP = (id, name) => () => { const a = drawn.atoms.find(x => x.id === id && x.name === name); return a ? [a.p.clone()] : []; };
  const molPts = id => () => { const A = drawn.atoms.filter(x => x.id === id && x.el !== 'H' && (x.s == null || x.s > 0.5)); return A.map(a => a.p.clone()); };
  const labels = {
    glucose: { html: 'glucose, C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>', side: 'r', pts: molPts('g') },
    polar: { html: 'glucose: its OH groups are polar', side: 'r', pts: molPts('g') },
    heads: { html: 'phosphate heads (hydrophilic)', side: 'l', pts: () => [-7.5, -6.7, -5.9, -5.1].map(x => V(x, -MEM.headY, 0.05)) },
    tails: { html: 'tails (hydrophobic)', side: 'l', pts: () => [-7.1, -6.3, -5.5].map(x => V(x, -0.9, -0.3)) },
    mem: { html: 'cell membrane: a phospholipid bilayer', side: 'l', pts: () => [-20, -18, -16, -14].map(x => V(x, MEM.headY + 0.3, 0.05)) },
    outside: { html: 'tissue fluid: outside the cell', side: 'l', pts: () => [V(-17, -6.5, 0), V(-19, -5.5, 0), V(-8, -6.2, 0)] },
    inside: { html: 'cytosol: inside the cell', side: 'l', pts: () => [V(-17, 6.5, 0), V(-19, 5.5, 0), V(-8, 6.6, 0)] },
    glut: { html: 'glucose transporter <i>(GLUT4)</i>', side: 'r', pts: () => surfacePoints(glut, [GA.clone().add(V(2.6, 0.6, 2.2)), GA.clone().add(V(2.8, -1.4, 2)), GA.clone().add(V(2.4, 2, 2))]) },
    o2: { html: 'oxygen, O<sub>2</sub>', side: 'l', pts: () => O2s.map(o => V(o.x - 0.3, -7 + 14 * Math.min(1, 1.15 - 0.05), o.z)).filter(p => p.y > -6.5 && p.y < 6.5) },
    o2b: { html: 'oxygen, O<sub>2</sub>', side: 'l', pts: () => [V(-7.7, 6.9, 0.15), V(-8.9, 6.9, 0.15), V(-6.4, 6.9, 0.15)] },
    /* on its lower lobe, clear of the molecules in its active site (the review: the line had ended on ADP) */
    hk: { html: '<i>hexokinase</i>, an enzyme', side: 'r', lv: 'x', pts: () => surfacePoints(hk, [hk.position.clone().add(V(4, -4.5, 2)), hk.position.clone().add(V(5.5, -3.5, 2)), hk.position.clone().add(V(3, -5.5, 1.5))]) },
    atp: { html: 'ATP', side: 'r', pts: molPts('a') },
    adp: { html: 'ADP', side: 'r', pts: molPts('a') },
    g6p: { html: '<i>glucose 6-phosphate</i>', side: 'l', lv: 'x', pts: molPts('g') },
    pgrp: { html: 'phosphate group, from ATP', side: 'r', pts: atomP('g', 'P6') },
    trapped: { html: '<i>glucose 6-phosphate</i>: it cannot leave', side: 'r', pts: molPts('g') }
  };
  const steps = [
    { phases: [{ to: { cam: 0 }, ms: 400 }, { to: { cam: 1 }, ms: 2600 }], labs: { glucose: 1 }, pic: 'Every size is true: the bar shows the scale. Cholesterol and glycoproteins are left out of this membrane. Drag the picture to turn it a little.' },
    { phases: [{ to: { cam: 0 }, ms: 1800 }, { to: { bounce: 1 }, ms: 2600 }, { to: { bounce: 0 }, ms: 10 }], labs: { polar: 1, tails: 1, heads: 2, outside: 2 } },
    { phases: [{ to: { cam: 2 }, ms: 2400 }, { to: { g: 1 }, ms: 2600 }], labs: { glut: 1, glucose: 1, outside: 2, inside: 2 } },
    /* the real order (Daniel, 8 Nov 2026: "make sure that it matches the reality ... in terms of timing"): glucose binds in
       the middle; then the transporter closes to the outside, a moment later opens to the inside; only then glucose leaves */
    { phases: [{ to: { g: 2 }, ms: 1600 }, { to: { rock: 0 }, ms: 1100 }, { to: { rock: 0 }, ms: 300 }, { to: { rock: 1 }, ms: 1300 }, { to: { g: 3 }, ms: 1800 }], labs: { glut: 1, glucose: 1, inside: 2, outside: 2 } },
    { phases: [{ to: { o2: 1 }, ms: 4200 }], labs: { o2b: 1, mem: 2, glut: 2 } },
    /* the enzyme and ATP are named first, while they are seen, and the phosphate group moves in a step of its own (Daniel,
       6 Nov 2026: "you label it at the end after you've seen the transformation ... Suddenly, you label ADP, but not ATP") */
    { phases: [{ to: { cam: 3, g: 4 }, ms: 2800 }, { to: { atp: 1 }, ms: 2400 }], labs: { hk: 1, atp: 1, glucose: 1 } },
    { phases: [{ to: { hk: 1 }, ms: 4200 }], labs: { g6p: 1, adp: 1, hk: 2, pgrp: 2 } },
    { phases: [{ to: { cam: 4, out: 1 }, ms: 2400 }, { to: { trap: 1 }, ms: 4200 }], labs: { trapped: 1, glut: 1 } },
    { phases: [{ to: { cam: 5 }, ms: 2400 }], labs: { glut: 1, hk: 1, g6p: 1, mem: 2, o2b: 2 } }
  ];
  return { group: g, knobs, views, steps, labels, draw, narrowZoom: 0.85, nums, turn: true, dispose() { BS.dispose(); disposeGroup(g); } };
}
