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
   19 Nov 2026 (flow.js; Daniel's rule for the IB views: random movement for diffusion, many molecules where a line speaks
   of concentration, crossings counted both ways). From step 2 the picture shows MANY glucose molecules, each on a random
   walk: twelve in the tissue fluid, two in the cytosol, none through the bilayer (the meetings with the bilayer are
   counted beside the picture). The one glucose that is followed, with its numbered carbons, still goes through the
   transporter. From step 5, forty oxygen molecules on both sides, more below (they come from the blood and are used in
   the cell): each crosses between the phospholipids at random, in both directions, and the crossings are counted both
   ways. Before: one glucose alone, and four oxygen molecules that rose side by side through the bilayer. The many keep
   moving while anything in the picture moves (two clocks, the knobs `flow` and `ot`), and stand still with it, so a
   step shown again, or as one still, is the same run.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { ballStick, gather, Reaction, molData, smooth, faceRing } from './mol.js?v=202611212238';
import { loadProts, protein, surfacePoints } from './prot.js?v=202611212238';
import { bilayer, MEM } from './membrane.js?v=202611212238';
import { disposeGroup, glow, halo as haloTex } from './stage.js?v=202611212238';
import { c1Run, C1, SPACE, rng, wander } from './flow.js?v=202611212238';

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
  /* (its way to the transporter, and later to hexokinase, wanders: flow.js wander) */
  const off = (p, w) => p.add(V(w[0], w[1], w[2]));
  const gAt = k => k <= 1 ? off(lerp3(gPath.slice(0, 3), k), wander(k, 0.8)) : k > 3 ? off(lerp3(gPath.slice(4), k - 3), wander(k - 3, 0.7, 2)) : k <= 2 ? gPath[2].clone().lerp(gPath[3], smooth(0, 1, k - 1)) : gPath[3].clone().lerp(gPath[4], smooth(0, 1, k - 2));
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
  /* ---- the many (flow.js): each molecule's place at every moment is worked out here, once; each also turns, at its own pace ---- */
  const runG = c1Run('glucose'), runO = c1Run('oxygen');
  const BSP = ballStick(runG.n * G0.P.length + runO.n * 2 + 8, runG.n * G0.B.length + runO.n + 8); g.add(BSP.group);
  const rnd = rng(77), turn = (n, k) => Array.from({ length: n }, () => ({ q0: new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 6.283, rnd() * 6.283, rnd() * 6.283)), ax: V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), w: (rnd() < 0.5 ? -k : k) * (0.5 + rnd()) }));
  const turnG = turn(runG.n, 0.8), turnO = turn(runO.n, 2);
  /* a soft light on each oxygen molecule (it is a quarter of a nanometre long: without it, a pupil does not find it) */
  const oGlow = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ map: haloTex(), color: 0xff6a58, size: 1.5, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  oGlow.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(runO.n * 3), 3)); oGlow.frustumCulled = false; oGlow.visible = false; g.add(oGlow);
  const at = { x: 0, y: 0, z: 0, s: 0 }, qT = new THREE.Quaternion();
  /* in the bilayer an oxygen molecule is drawn against the cut face, so that it is seen between the lipids and not in front of them */
  const zCut = (y, z) => { const k = 1 - smooth(SPACE.M - 0.2, SPACE.M + 1, Math.abs(y)); return z + (0.2 + (z - SPACE.z0) * 0.12 - z) * k; };
  let popKey = '', lastK = null;
  function drawMany(K, view) {
    const insts = [], sg = smooth(0, 1, K.pop), so = smooth(0, 1, K.o2), gp = oGlow.geometry.attributes.position; let no = 0;
    if (sg > 0.001) for (let i = 0; i < runG.n; i++) {
      runG.at(K.flow, i, at); const T = turnG[i];
      insts.push({ key: 'glucose', id: 'q' + i, P: { p: V(at.x, at.y, at.z), q: T.q0.clone().multiply(qT.setFromAxisAngle(T.ax, T.w * K.flow)) }, s: sg * at.s });
    }
    if (so > 0.001) for (let i = 0; i < runO.n; i++) {
      runO.at(K.ot, i, at); const T = turnO[i], z = zCut(at.y, at.z);
      insts.push({ key: 'o2', id: 'x' + i, P: { p: V(at.x, at.y, z), q: T.q0.clone().multiply(qT.setFromAxisAngle(T.ax, T.w * K.ot)) }, s: so * at.s });
      if (at.s > 0.5) gp.setXYZ(no++, at.x, at.y, z);
    }
    const all = gather(insts); BSP.draw(all.atoms, all.bonds, view);
    oGlow.geometry.setDrawRange(0, no); gp.needsUpdate = true; oGlow.visible = no > 0 && so > 0.001; oGlow.material.opacity = so;
  }
  /* the oxygen molecules a name may point at: in the tissue fluid or the cytosol (not in the bilayer, not beside a protein, not
     where the still's arrow stands), in the picture; those at the lower left first */
  const o2Pts = () => {
    const out = []; if (!lastK) return out;
    for (let i = 0; i < runO.n; i++) { runO.at(lastK.ot, i, at); if (at.s > 0.9 && Math.abs(at.y) > 3.3 && at.y > -8 && at.y < 6.5 && ((at.x > -11 && at.x < -7.6) || (at.x > 4.6 && at.x < 8))) out.push(V(at.x, at.y, at.z)); }
    return out.sort((a, b) => Math.hypot(a.x + 8, a.y + 5.5) - Math.hypot(b.x + 8, b.y + 5.5));
  };
  /* the counts beside the picture: drawn again as the picture moves (view.js `live`) */
  const liveG = K => `<b>Glucose at the bilayer</b><span class="n">met the bilayer <i>${runG.hits(Math.min(C1.STEP2, Math.max(0, K.flow)))}</i></span><span class="n">crossed the bilayer <i>0</i></span>`;
  const liveO = K => { const t = Math.min(C1.COUNT, Math.max(0, K.ot)), a = runO.up(t), b = runO.down(t); return `<b>Oxygen through the bilayer</b><span class="n">into the cell <i>${a}</i></span><span class="n">out of the cell <i>${b}</i></span><span class="b">${t >= C1.COUNT && a > b ? `net movement: into the cell (${a} − ${b} = ${a - b})` : '&nbsp;'}</span>`; };      /* (the net movement is said when the count ends, with its sum: at 2 against 1 it would claim too much; the science read) */
  const halos = [glow(2.6, 0xfff4d0, 0.55), glow(2.4, 0xffd8a0, 0.5)]; halos.forEach(h => g.add(h));
  /* ---- the knobs, the views, the steps ---- */
  const knobs = { cam: 0, bounce: 0, g: 0, rock: -1, o2: 0, atp: 0, hk: 0, out: 0, trap: 0, pop: 0, flow: 0, ot: 0 };
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
    /* (in between the phosphate heads, as far as the tails: 2.75 nm up; until 19 Nov 2026 it turned back under the heads) */
    if (K.bounce > 0) gp = gp.clone().add(V(0, 2.75 * Math.sin(Math.PI * Math.min(1, K.bounce)), 0));
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
    BS.draw(all.atoms, all.bonds, view);
    /* the many: worked out again only when their clocks or the view have changed (at rest: nothing) */
    lastK = K;
    const key = `${K.flow.toFixed(3)}|${K.ot.toFixed(3)}|${K.pop.toFixed(3)}|${K.o2.toFixed(3)}|${view.x.toFixed(2)}|${view.y.toFixed(2)}|${view.z.toFixed(2)}`;
    if (key !== popKey) { popKey = key; drawMany(K, view); }
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
    /* (step 1's close-up sees the membrane from below: the heads far behind glucose, at the top of the picture) */
    memU: { html: 'cell membrane', side: 'l', pts: () => [V(-7.2, -2.1, -6.5), V(-5.6, -2.1, -8), V(-8.6, -2.1, -8.5), V(-4.4, -2.1, -9), V(-6.4, -2.1, -5)] },
    outHi: { html: 'tissue fluid: higher glucose concentration', side: 'l', pts: () => [V(-17, -6.5, 0), V(-19, -5.5, 0), V(-8, -6.2, 0)] },
    inLo: { html: 'cytosol: lower glucose concentration', side: 'l', pts: () => [V(-17, 6.5, 0), V(-19, 5.5, 0), V(-8, 6.6, 0)] },
    o2b: { html: 'oxygen, O<sub>2</sub>', side: 'l', pts: o2Pts },
    /* (why the net movement is into the cell: as step 4 says of glucose) */
    o2Hi: { html: 'tissue fluid: higher oxygen concentration', side: 'r', pts: () => [V(5.5, -7.2, 0), V(4.5, -6.2, 0), V(6.5, -5.4, 0), V(3, -7.6, 0)] },
    o2Lo: { html: 'cytosol: lower oxygen concentration', side: 'l', pts: () => [V(-8, 6.4, 0), V(-9.5, 5.6, 0), V(-6.5, 6.9, 0)] },
    /* on its lower lobe, clear of the molecules in its active site (the review: the line had ended on ADP) */
    hk: { html: '<i>hexokinase</i>, an enzyme', side: 'r', lv: 'x', pts: () => surfacePoints(hk, [hk.position.clone().add(V(4, -4.5, 2)), hk.position.clone().add(V(5.5, -3.5, 2)), hk.position.clone().add(V(3, -5.5, 1.5))]) },
    atp: { html: 'ATP', side: 'r', pts: molPts('a') },
    adp: { html: 'ADP', side: 'r', pts: molPts('a') },
    g6p: { html: '<i>glucose 6-phosphate</i>', side: 'l', lv: 'x', pts: molPts('g') },
    pgrp: { html: 'phosphate group, from ATP', side: 'r', pts: atomP('g', 'P6') },
    trapped: { html: '<i>glucose 6-phosphate</i>: it cannot leave', side: 'r', pts: molPts('g') }
  };
  const steps = [
    { phases: [{ to: { cam: 0 }, ms: 400 }, { to: { cam: 1 }, ms: 2600 }], labs: { glucose: 1, memU: 1 }, labsN: { glucose: 1 }, nums: 'all', pic: 'Every size is true: the bar shows the scale. Cholesterol and glycoproteins are left out of this membrane. Drag the picture to turn it a little.' },
    /* (the still's arrow: up to the heads and back, the way of the glucose that is followed) */
    { phases: [{ to: { cam: 0, pop: 1 }, ms: 1800 }, { to: { bounce: 1 }, ms: 2600 }, { to: { bounce: 0 }, ms: 10 }], labs: { polar: 1, tails: 1, heads: 2, outside: 2 }, live: liveG,
      /* (what is true here and what is not: far more molecules are drawn than so small a space holds; the insulin path says the like of its insulin) */
      pic: 'Sizes are true, numbers are not: more glucose molecules are drawn than this small space holds.',
      arrow: () => { const a = gAt(0); return [a.clone().add(V(-0.8, 0.8, 0)), a.clone().add(V(-0.55, 2.0, 0)), a.clone().add(V(0, 2.8, 0)), a.clone().add(V(0.55, 2.0, 0)), a.clone().add(V(0.8, 0.8, 0))]; } },
    { phases: [{ to: { cam: 2 }, ms: 2400 }, { to: { g: 1 }, ms: 2600 }], labs: { glut: 1, glucose: 1, outside: 2, inside: 2 }, arrow: 'auto' },      /* (a still: an arrow along glucose's way; view.js stillArrow) */
    /* the real order (Daniel, 8 Nov 2026: "make sure that it matches the reality ... in terms of timing"): glucose binds in
       the middle; then the transporter closes to the outside, a moment later opens to the inside; only then glucose leaves */
    { phases: [{ to: { g: 2 }, ms: 1600 }, { to: { rock: 0 }, ms: 1100 }, { to: { rock: 0 }, ms: 300 }, { to: { rock: 1 }, ms: 1300 }, { to: { g: 3 }, ms: 1800 }], labs: { glut: 1, glucose: 1, inLo: 2, outHi: 2 }, arrow: 'auto' },
    /* oxygen: the many appear, then ten seconds of them are counted (the still's arrow: the net movement, through the lipids) */
    { phases: [{ to: { o2: 1 }, ms: 900 }, { to: { ot: C1.COUNT }, ms: C1.COUNT * 1000, lin: ['ot'] }], labs: { o2b: 1, o2Hi: 2, o2Lo: 2, glut: 2 }, live: liveO,
      pic: 'Sizes are true, numbers are not: far more oxygen molecules are drawn than this small space holds.',
      /* (the still: a thick arrow into the cell and a thin one out, as the count says: both ways, more in. Until the science read
         of 19 Nov 2026 one long arrow, which read as one way and in a straight line) */
      arrow: () => [{ pts: [V(-6.6, -5.6, 0.6), V(-6.6, 5.2, 0.6)], k: 1 }, { pts: [V(-5.3, 5.2, 0.6), V(-5.3, -5.4, 0.6)], k: 0.45 }] },
    /* the enzyme and ATP are named first, while they are seen, and the phosphate group moves in a step of its own (Daniel,
       6 Nov 2026: "you label it at the end after you've seen the transformation ... Suddenly, you label ADP, but not ATP") */
    { phases: [{ to: { cam: 3, g: 4 }, ms: 2800 }, { to: { atp: 1 }, ms: 2400 }], labs: { hk: 1, atp: 1, glucose: 1 }, arrow: 'auto:glucose' },      /* (the way of glucose, which wanders; ATP's is a straight line) */
    { phases: [{ to: { hk: 1 }, ms: 4200 }], labs: { g6p: 1, adp: 1, hk: 2, pgrp: 2 }, nums: [6] },
    { phases: [{ to: { cam: 4, out: 1 }, ms: 2400 }, { to: { trap: 1 }, ms: 4200 }], labs: { trapped: 1, glut: 1 }, arrow: 'auto' },
    { phases: [{ to: { cam: 5 }, ms: 2400 }], labs: { glut: 1, hk: 1, g6p: 1, mem: 2, o2b: 2 }, labsN: { glut: 1, hk: 1 } }
  ];
  /* the many keep moving while anything moves: every phase from step 2 on takes glucose's clock on by its own length, and
     every phase after oxygen's count takes oxygen's clock on */
  let tg = 0, to = C1.COUNT;
  steps.forEach((st, k) => st.phases.forEach(ph => {
    const sec = (ph.ms != null ? ph.ms : 1600) / 1000;
    if (k >= 1) { tg += sec; ph.to.flow = +tg.toFixed(3); ph.lin = (ph.lin || []).concat('flow'); }
    if (k >= 5) { to += sec; ph.to.ot = +to.toFixed(3); ph.lin = (ph.lin || []).concat('ot'); }
  }));
  if (tg > C1.glucose.end || to > C1.oxygen.end) console.error(`From glucose to ATP: chapter 1 runs ${tg.toFixed(1)} s of glucose and ${to.toFixed(1)} s of oxygen, longer than flow.js works out`);
  /* for the checks: the runs themselves, and the proteins' outlines as measured (flow.js C1.solids must hold them) */
  const outline = o => { const b = new THREE.Box3().setFromObject(o); return { x0: b.min.x, x1: b.max.x, y0: b.min.y, y1: b.max.y }; };
  return { group: g, knobs, views, steps, labels, draw, narrowZoom: 0.85, nums, turn: true, flow: { runG, runO, outlines: () => [outline(glut), outline(hk)] }, dispose() { BS.dispose(); BSP.dispose(); disposeGroup(g); } };
}
