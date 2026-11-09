/* ============================================================
   xmol.js — the Explore paths' molecule bench (5 Nov 2026). Daniel: "where is this coming from? What do you need to build
   NADH and FADH or FAD ... explain it a little bit more. So you know, within one single place, you can explore everything
   and understand every single term." One molecule (or two side by side) close up, its parts named on the picture (the
   part that does the work glowing), and its change shown atom by atom (NAD to NADH, FAD to FADH₂, CoA to acetyl CoA, ATP
   to ADP and phosphate). Sizes true: the scale bar says how close the camera is.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { ballStick, gather, Reaction, molData, poseAt } from './mol.js?v=202611091831';
import { disposeGroup, glow, smooth } from './stage.js?v=202611091831';

/* for each Explore path: the molecules, and per step which is shown, what glows, and whether it changes */
const PLAN = {
  'x-nad': { show: [{ m: 0 }, { m: 0, hi: ['nicotinamide'] }, { rx: [0, 1], hi: ['c4'] }, { rx: [1, 0], hi: ['c4'] }],
    names: { nic: ['nicotinamide (made from niacin, vitamin B3)', 'atoms:N_C4,C37,C42,C43,C36,N_N1'], ade: ['adenine', 'adenine'], pp: ['two phosphate groups', 'pp'], c4: ['it accepts the hydrogen here', 'c4'] },
    labs: [{ nic: 1, ade: 1, pp: 2 }, { nic: 1 }, { c4: 1, nic: 2 }, { c4: 1 }] },
  'x-fad': { show: [{ m: 0, hi: ['riboflavin'] }, { rx: [0, 1], hi: ['flavin'] }, { m: 1, hi: ['flavin'] }],
    names: { rib: ['flavin and ribitol: riboflavin, vitamin B2', 'riboflavin'], ade: ['adenine', 'adenine'], fl: ['the flavin ring accepts two hydrogen atoms', 'flavin'] },
    labs: [{ rib: 1, ade: 1 }, { fl: 1 }, { fl: 1, ade: 2 }] },
  'x-coa': { show: [{ m: 0, hi: ['cysteamine'] }, { m: 0, hi: ['pantothenate'] }, { rx: [0, 1], hi: ['cysteamine'] }],
    names: { s: ['sulfur: the working end', 'atoms:S'], pan: ['from pantothenic acid, vitamin B5', 'pantothenate'], adp: ['ADP part', 'adp'], ac: ['the acetyl group (2C), joined to the sulfur', 'atoms:A1,A2,OA1'] },
    labs: [{ s: 1, adp: 2 }, { pan: 1, s: 2 }, { ac: 1, pan: 2 }] },
  'x-slp': { show: [{ m: 0, hi: ['pg'] }, { m: 0, hi: ['pg'] }, { rx: [0, 'split'], hi: ['pg'] }],
    names: { pg: ['the last phosphate group', 'pg'], ade: ['adenine', 'adenine'], rib: ['ribose', 'ribose'], pi: ['the last phosphate group, now a phosphate ion', 'atoms:P,OPa,OPb,OPc,OPd,PG,O1G,O2G,O3G'] },
    labs: [{ pg: 1, ade: 1, rib: 2 }, { pg: 1 }, { pi: 1 }] },
  'x-redox': { show: [{ m: 0, hi: ['h1'] }, { m: 1, hi: ['c4'] }, { both: true, hi: ['h1', 'c4'] }],
    names: { h1: ['this hydrogen is removed: oxidized', 'h1'], c4: ['NAD accepts it here: reduced', 'c4'] },
    labs: [{ h1: 1 }, { c4: 1 }, { h1: 1, c4: 1 }] }
};

export async function build(stage, { V, def, id }) {
  const P = PLAN[id];
  const g = new THREE.Group(); g.name = 'xmol';
  const BS = ballStick(260, 300); g.add(BS.group);
  const mols = def.mol;
  const poseOf = k => ({ p: V(0, 0, 0), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.35, 0.25, 0)) });
  const len = Math.max(...mols.map(k => { const D = molData(k); let lo = 1e9, hi = -1e9; D.P.forEach(p => { lo = Math.min(lo, p.x); hi = Math.max(hi, p.x); }); return hi - lo; }));
  /* the changes: A → B by names; ATP → ADP + phosphate for 'split' */
  const rxs = {};
  const rxOf = (a, b) => {
    const k = a + '>' + b; if (rxs[k]) return rxs[k];
    if (b === 'split') return (rxs[k] = new Reaction({ from: [{ key: mols[a], id: 'm', P: poseOf() }], to: [{ key: 'adp', id: 'm' }, { key: 'pi', id: 'p', P: null }],
      moves: [['m:PG', 'p:P'], ['m:O1G', 'p:OPa'], ['m:O2G', 'p:OPb'], ['m:O3G', 'p:OPc']] }));
    return (rxs[k] = new Reaction({ from: [{ key: mols[a], id: 'm', P: poseOf() }], to: [{ key: mols[b], id: 'm' }] }));
  };
  const halos = [0, 1].map(() => { const h = glow(1, 0x7fd8ff, 0.7); g.add(h); return h; });
  const knobs = { cam: 0, s: 0, f: 0 };
  let drawn = { atoms: [], bonds: [] }, cur = 0;
  const groupAtoms = (all, gname) => {
    if (gname === 'h1') return all.atoms.filter(a => a.id === 'm' && a.name === 'H1');
    if (gname === 'c4') return all.atoms.filter(a => (a.id === 'm' || a.id === 'n') && ['N_C4', 'HN_C4', 'HN_C4a'].includes(a.name));
    /* 'atoms:A,B,…' anchors a name on those atoms only (the review: the nicotinamide and sulfur lines ended on other parts) */
    if (gname.startsWith('atoms:')) { const ns = gname.slice(6).split(','); return all.atoms.filter(a => ns.includes(a.name)); }
    return all.atoms.filter(a => a.grp && a.grp.includes(gname));
  };
  function draw(K) {
    const st = P.show[Math.max(0, Math.min(P.show.length - 1, Math.round(K.s)))];
    let all;
    if (st.rx) { const r = rxOf(st.rx[0], st.rx[1]); all = r.at(Math.max(0, Math.min(1, K.f))); }
    else if (st.both) all = gather([{ key: mols[0], id: 'm', P: { p: V(-1.1, 0, 0), q: poseOf().q } }, { key: mols[1], id: 'n', P: { p: V(1.4, 0, 0), q: poseOf().q } }]);
    else all = gather([{ key: mols[st.m], id: 'm', P: poseOf() }]);
    /* each atom's named parts (for what glows) */
    all.atoms.forEach(a => { const D = molData(a.id === 'n' ? mols[1] : (st.m != null ? mols[st.m] : mols[0])); a.grp = Object.keys(D.groups).filter(gk => D.groups[gk].some(i => D.names[i] === a.name)); });
    BS.draw(all.atoms, all.bonds, stage.cam.position.clone().sub(stage.view.at).normalize()); drawn = all;
    (st.hi || []).slice(0, 2).forEach((h, i) => { const A = groupAtoms(all, h); halos[i].visible = A.length > 0; if (A.length) { const c = A.reduce((s, a) => s.add(a.p), V()).divideScalar(A.length); halos[i].position.copy(c); const r = Math.max(0.5, ...A.map(a => a.p.distanceTo(c))); halos[i].scale.setScalar(r * 3.2); } });
    for (let i = (st.hi || []).length; i < 2; i++) halos[i].visible = false;
  }
  const labels = {};
  Object.keys(P.names).forEach(k => { const [html, gname] = P.names[k]; labels[k] = { html, side: 'r', pts: () => groupAtoms(drawn, gname).map(a => a.p.clone()) }; });
  const views = [{ at: V(0, 0, 0), dist: Math.max(3.2, len * 1.9), dir: V(0, 0.05, 1).normalize(), up: V(0, 1, 0) }];
  const steps = P.show.map((st, i) => ({ phases: st.rx ? [{ to: { s: i, f: 0 }, ms: 10 }, { to: { f: 1 }, ms: 2800 }] : [{ to: { s: i, f: 1 }, ms: 600 }], labs: P.labs[i] }));
  return { group: g, knobs, views, steps, labels, draw, turn: true, dispose() { BS.dispose(); disposeGroup(g); } };
}
