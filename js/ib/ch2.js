/* ============================================================
   ch2.js — chapter 2, glycolysis in the cytosol (5 Nov 2026). Daniel's text: four stages (phosphorylation, lysis,
   oxidation, ATP formation), "why every single step happens"; the IB guide (C1.2.8): "not required to know the names of
   the intermediates, but ... each step in the pathway is catalysed by a different enzyme". So every one of the ten steps
   is shown at its own enzyme, each in its measured shape (glass, so the molecules in its active site are seen), each at
   its true size compared with the molecules; the ten enzymes stand in a row only to be visited one after another (in the
   cytosol they are mixed among thousands of other proteins).
   The molecules: ball-and-stick (mol.js), every atom from the Chemical Component Dictionary, as at pH 7.2; each reaction
   moves the real atoms (mol.js Reaction): a phosphate group from ATP onto glucose (C6, then C1), the ring opening and
   closing, the split between carbons 3 and 4 (lysis), the hydrogen from carbon 1 of triose phosphate onto NAD (oxidation)
   and a phosphate ion attaching, phosphate groups passing to ADP (substrate-level phosphorylation), water leaving.
   Glucose's carbons keep their numbers on their atoms throughout (lane t: carbons 4, 5, 6; lane d: carbons 1, 2, 3, which
   triose phosphate isomerase turns end to end: its carbon 1 is glucose's carbon 3).
   Where a measured structure holds the substrate (aldolase with fructose 1,6-bisphosphate, GAPDH with NAD, pyruvate
   kinase with pyruvate, lactate dehydrogenase with NADH and oxamate), the molecule is put at that bound molecule's middle;
   the others at the named point (tools/ib-proteins.py). A cofactor (ATP, ADP, NAD, Pi) stands beside the substrate, its
   reacting atom 0.35–0.45 nm from the substrate's.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { ballStick, gather, Reaction, molData, smooth, poseAt, moved, faceRing } from './mol.js?v=202611060935';
import { loadProts, protein, surfacePoints, siteW } from './prot.js?v=202611060935';
import { disposeGroup, glow } from './stage.js?v=202611060935';

const NAME = { glucose: 'glucose', g6p: '<i>glucose 6-phosphate</i>', f6p: '<i>fructose 6-phosphate</i>', fbp: '<i>fructose 1,6-bisphosphate</i>', dhap: '<i>dihydroxyacetone phosphate</i>',
  g3p: 'triose phosphate', bpg: '<i>1,3-bisphosphoglycerate</i>', pg3: '<i>3-phosphoglycerate</i>', pg2: '<i>2-phosphoglycerate</i>', pep: '<i>phosphoenolpyruvate</i>', pyruvate: 'pyruvate',
  atp: 'ATP', adp: 'ADP', nad: 'NAD', nadh: 'NADH (reduced NAD)', pi: 'phosphate ion (Pi)', water: 'water', co2: 'carbon dioxide', lactate: 'lactate', ethanal: '<i>ethanal</i>', ethanol: 'ethanol' };
const ENZ = { hk2: 'hexokinase', gpi: 'glucose-6-phosphate isomerase', pfk: 'phosphofructokinase', aldolase: 'aldolase', tpi: 'triose phosphate isomerase', gapdh: 'GAPDH',
  pgk: 'phosphoglycerate kinase', pgam: 'phosphoglycerate mutase', enolase: 'enolase', pkm: 'pyruvate kinase', ldh: 'lactate dehydrogenase', pdc: 'pyruvate decarboxylase (yeast)', adh: 'alcohol dehydrogenase (yeast)' };
const COL = { hk2: 0xb3a6ff, gpi: 0x9fc6ff, pfk: 0xc0a8ff, aldolase: 0x9fe0d0, tpi: 0xa8d8ff, gapdh: 0xb8b0ff, pgk: 0xffc8a0, pgam: 0xa6e3ff, enolase: 0xc4f0b0, pkm: 0xffd59a, ldh: 0xffb3c8, pdc: 0xd9c2ff, adh: 0xc2e8ff };
const SUB = new THREE.Vector3(-1, 0.12, 0.32), COF = new THREE.Vector3(1, 0.3, 0.35);

/* its measured shapes: the view fetches them while the pupil reads the chapter before (view.js ahead) */
const PROTS = ['hk2', 'gpi', 'pfk', 'aldolase', 'tpi', 'gapdh', 'pgk', 'pgam', 'enolase', 'pkm', 'ldh', 'pdc', 'adh'];
export const prefetch = () => loadProts(PROTS);

export async function build(stage, { V }) {
  const keys = PROTS;
  const PR = {}; (await loadProts(keys)).forEach((p, i) => { PR[keys[i]] = p; });
  const g = new THREE.Group(); g.name = 'ch2';
  /* ---- the stations: an enzyme each, its site(s) at (x, 0, 0) ---- */
  const X = { A: 0, B: 21, C: 44, D: 67, E: 86, F: 104, G: 123, H: 140, I: 156, J: 174, K: 197, L: 220, M: 238 };
  const enz = {}, siteOf = {};
  const place = (st, key, { pair = false, copies = null, site = 'site' } = {}) => {
    const S = V(X[st], 0, 0), list = [];
    if (copies) { siteOf[st] = S.clone(); } if (copies) copies.forEach((off, i) => { const e = protein(PR[key], { color: COL[key], glass: true, opacity: 0.2 }); e.position.copy(S).add(off).sub(e.userData.sites[site]); g.add(e); list.push(e); siteOf[st + i] = S.clone().add(off); e.userData.hole.set(S.x + off.x, S.y + off.y, S.z + off.z + 1.6, 3.0); });
    else {
      const e = protein(PR[key], { color: COL[key], glass: true, opacity: 0.2 }), s = e.userData.sites;
      const mid = pair && s.a ? s.a.clone().add(s.b).multiplyScalar(0.5) : s[site];
      e.position.copy(S).sub(mid); g.add(e); list.push(e);
      e.userData.hole.set(S.x, S.y, S.z + 1.6, pair ? 4.2 : 3.0);
      if (pair && s.a) { siteOf[st + 'a'] = e.position.clone().add(s.a); siteOf[st + 'b'] = e.position.clone().add(s.b); }
      siteOf[st] = S.clone();
    }
    enz[st] = { key, list };
  };
  place('A', 'hk2', { site: 'glucose' }); place('B', 'gpi'); place('C', 'pfk'); place('D', 'aldolase'); place('E', 'tpi');
  place('F', 'gapdh', { pair: true }); place('G', 'pgk', { copies: [V(0, 3.6, 0), V(0, -3.6, 0)], site: 'pg3' }); place('H', 'pgam', { pair: true });
  place('I', 'enolase', { pair: true }); place('J', 'pkm', { pair: true }); place('K', 'ldh', { pair: true }); place('L', 'pdc'); place('M', 'adh');
  const at = (st, lane) => siteOf[st + lane] || siteOf[st];
  /* ---- the lanes' molecules, station by station (worked out once: any step can be shown from its start) ---- */
  const gStart = { p: V(-7, 4.5, 2.5), q: faceRing('glucose', ['C1', 'C2', 'C3', 'C4', 'C5', 'O5'], 0.4) };
  let lanes = { g: { key: 'glucose', P: gStart, num: { C1: 1, C2: 2, C3: 3, C4: 4, C5: 5, C6: 6 } } };
  const P = (st, lane, key, atom, away = SUB, roll = 0) => poseAt(key, atom, at(st, lane), away, roll);
  /* the definition of each station: what each lane does there */
  const DEF = {
    A: [{ lane: 'g', key: 'glucose', atom: 'O6', cof: [{ key: 'atp', id: 'a', atom: 'PG', near: 'O6', d: V(0.42, 0.05, 0.18) }], out: [['g6p', 'g'], ['adp', 'a', V(6, 5, 3)]],
      moves: [['a:PG', 'g:P6'], ['a:O1G', 'g:OP6a'], ['a:O2G', 'g:OP6b'], ['a:O3G', 'g:OP6c']] }],
    B: [{ lane: 'g', key: 'g6p', atom: 'C2', out: [['f6p', 'g']] }],
    C: [{ lane: 'g', key: 'f6p', atom: 'O1', cof: [{ key: 'atp', id: 'a', atom: 'PG', near: 'O1', d: V(0.42, 0.06, 0.16) }], out: [['fbp', 'g'], ['adp', 'a', V(6, 5, 3)]],
      moves: [['a:PG', 'g:P1'], ['a:O1G', 'g:OP1a'], ['a:O2G', 'g:OP1b'], ['a:O3G', 'g:OP1c']] }],
    D: [{ lane: 'g', key: 'fbp', atom: 'C3', out: [['dhap', 'd', null, V(-0.9, 0.5, 0.3)], ['g3p', 't', null, V(0.9, -0.5, 0.3)]],
      moves: [['g:C1', 'd:C1'], ['g:C2', 'd:C2'], ['g:C3', 'd:C3'], ['g:O1', 'd:O1'], ['g:P1', 'd:P1'], ['g:OP1a', 'd:OP1a'], ['g:OP1b', 'd:OP1b'], ['g:OP1c', 'd:OP1c'], ['g:O2', 'd:O2'], ['g:O3', 'd:O3'],
        ['g:C4', 't:C1'], ['g:C5', 't:C2'], ['g:C6', 't:C3'], ['g:O4', 't:O1'], ['g:O5', 't:O2'], ['g:O6', 't:O3'], ['g:P6', 't:P3'], ['g:OP6a', 't:OP3a'], ['g:OP6b', 't:OP3b'], ['g:OP6c', 't:OP3c']] }],
    E: [{ lane: 'd', key: 'dhap', atom: 'C2', out: [['g3p', 'd']],
      moves: [['d:C3', 'd:C1'], ['d:C2', 'd:C2'], ['d:C1', 'd:C3'], ['d:O3', 'd:O1'], ['d:O2', 'd:O2'], ['d:O1', 'd:O3'], ['d:P1', 'd:P3'], ['d:OP1a', 'd:OP3a'], ['d:OP1b', 'd:OP3b'], ['d:OP1c', 'd:OP3c']] }],
    F: ['t', 'd'].map((L, i) => ({ lane: L, key: 'g3p', atom: 'C1', site: 'ab'[i],
      cof: [{ key: 'nad', id: 'n' + L, atom: 'N_C4', near: 'C1', d: V(0.36, 0.22, 0.12) }, { key: 'pi', id: 'p' + L, atom: 'P', near: 'C1', d: V(0.05, -0.42, 0.25), away: V(0.2, -1, 0.3) }],
      out: [['bpg', L], ['nadh', 'n' + L, V(6, 6, 3)]],
      moves: [['p' + L + ':P', L + ':P1'], ['p' + L + ':OPd', L + ':O1b'], ['p' + L + ':OPa', L + ':OP1a'], ['p' + L + ':OPb', L + ':OP1b'], ['p' + L + ':OPc', L + ':OP1c'], [L + ':O1', L + ':O1a'], [L + ':H1', 'n' + L + ':HN_C4a']] })),
    G: ['t', 'd'].map((L, i) => ({ lane: L, key: 'bpg', atom: 'P1', site: String(i), cof: [{ key: 'adp', id: 'a' + L, atom: 'O3B', near: 'P1', d: V(0.4, 0.08, 0.15) }],
      out: [['pg3', L], ['atp', 'a' + L, V(6, 5, 3)]],
      moves: [[L + ':P1', 'a' + L + ':PG'], [L + ':OP1a', 'a' + L + ':O1G'], [L + ':OP1b', 'a' + L + ':O2G'], [L + ':OP1c', 'a' + L + ':O3G']] })),
    /* phosphoglycerate mutase: the enzyme gives a phosphate group of its own to carbon 2's oxygen and takes back the one on
       carbon 3 (the expert review, 5 Nov 2026: the same phosphate does not move; Berg et al. 2019 §16.1). The enzyme's
       phosphate comes out of it (a phosphate ion stands for it: its fourth oxygen, the enzyme's hold, stays and takes the
       old one back, so every atom is counted) */
    H: ['t', 'd'].map((L, i) => ({ lane: L, key: 'pg3', atom: 'C2', site: 'ab'[i],
      cof: [{ key: 'pi', id: 'e' + L, atom: 'P', near: 'O2', d: V(0.1, 0.5, -0.35), from: V(0, 0.8, -2.5) }],
      out: [['pg2', L], ['pi', 'q' + L, V(0, 0.6, -3)]],
      moves: [['e' + L + ':P', L + ':P2'], ['e' + L + ':OPa', L + ':OP2a'], ['e' + L + ':OPb', L + ':OP2b'], ['e' + L + ':OPc', L + ':OP2c'],
        [L + ':P3', 'q' + L + ':P'], [L + ':OP3a', 'q' + L + ':OPa'], [L + ':OP3b', 'q' + L + ':OPb'], [L + ':OP3c', 'q' + L + ':OPc'], ['e' + L + ':OPd', 'q' + L + ':OPd']] })),
    I: ['t', 'd'].map((L, i) => ({ lane: L, key: 'pg2', atom: 'C2', site: 'ab'[i], out: [['pep', L], ['water', 'w' + L, V(4, 5, 3)]],
      moves: [[L + ':O3', 'w' + L + ':O'], [L + ':HO3', 'w' + L + ':HO'], [L + ':H2', 'w' + L + ':HOa']] })),
    J: ['t', 'd'].map((L, i) => ({ lane: L, key: 'pep', atom: 'P2', site: 'ab'[i], cof: [{ key: 'adp', id: 'a' + L, atom: 'O3B', near: 'P2', d: V(0.4, 0.08, 0.15) }],
      out: [['pyruvate', L], ['atp', 'a' + L, V(6, 5, 3)]],
      moves: [[L + ':P2', 'a' + L + ':PG'], [L + ':OP2a', 'a' + L + ':O1G'], [L + ':OP2b', 'a' + L + ':O2G'], [L + ':OP2c', 'a' + L + ':O3G']] })),
    K: ['t', 'd'].map((L, i) => ({ lane: L, key: 'pyruvate', atom: 'C2', site: 'ab'[i], cof: [{ key: 'nadh', id: 'n' + L, atom: 'N_C4', near: 'C2', d: V(0.36, 0.2, 0.14), from: V(-6, 6, 3) }],
      out: [['lactate', L], ['nad', 'n' + L, V(6, 6, 3)]], moves: [['n' + L + ':HN_C4a', L + ':H2']] })),
    L: [{ lane: 'y', key: 'pyruvate', atom: 'C2', out: [['ethanal', 'y'], ['co2', 'cy', V(5, 6, 3)]],
      moves: [['y:C1', 'cy:C1'], ['y:O1a', 'cy:O1'], ['y:O1b', 'cy:O2'], ['y:C2', 'y:C1'], ['y:C3', 'y:C2'], ['y:O2', 'y:O1']] }],
    M: [{ lane: 'y', key: 'ethanal', atom: 'C1', cof: [{ key: 'nadh', id: 'ny', atom: 'N_C4', near: 'C1', d: V(0.36, 0.2, 0.14), from: V(-6, 6, 3) }],
      out: [['ethanol', 'y'], ['nad', 'ny', V(6, 6, 3)]], moves: [['ny:HN_C4a', 'y:H1a']] }]
  };
  const ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  /* the yeast's own pyruvate (step 15): carbons 1 … 3 of a glucose of its own */
  const ST = {};
  for (const s of ORDER) {
    if (s === 'L') lanes = { y: { key: 'pyruvate', P: { p: V(X.L - 8, 4, 2), q: new THREE.Quaternion() }, num: { C1: 3, C2: 2, C3: 1 } } };
    const start = {}; Object.keys(lanes).forEach(k => { start[k] = Object.assign({}, lanes[k]); });
    const procs = DEF[s].map(d => {
      const L = lanes[d.lane];
      if (!L) throw new Error('glycolysis: station ' + s + ' has no lane ' + d.lane);
      const site = d.site != null ? at(s, d.site) : at(s);
      const inP = poseAt(d.key, d.atom, site, SUB, 0.3);
      const from = [{ key: d.key, id: d.lane, P: inP, num: L.num }];
      const cofs = (d.cof || []).map(c => {
        const nearW = molData(d.key).P[molData(d.key).idx[c.near]].clone().applyQuaternion(inP.q).add(inP.p);
        const cp = poseAt(c.key, c.atom, nearW.clone().add(c.d), c.away || COF, 0.4);
        return Object.assign({ P: cp, fromP: moved(cp, c.from || V(6, 4, 2.5)) }, c);
      });
      cofs.forEach(c => from.push({ key: c.key, id: c.id, P: c.P }));
      const to = d.out.map(([key, id]) => ({ key, id }));
      const rx = new Reaction({ from, to, moves: d.moves || [] });
      /* glucose's numbers on the products, from their atoms' sources */
      const nums = {};
      rx.B.forEach(b => { if (b.el === 'C' && b.src != null && rx.A[b.src].gn != null) (nums[b.t.id] = nums[b.t.id] || {})[b.name] = rx.A[b.src].gn; });
      const outs = d.out.map(([key, id, leave, shift]) => ({ key, id, leave, shift, P: rx.placeOf(id), num: nums[id] }));
      return { d, inP, cofs, rx, outs, lane: d.lane };
    });
    /* a lane not used here waits beside the station */
    const used = new Set(DEF[s].map(d => d.lane));
    const waits = Object.keys(lanes).filter(k => !used.has(k)).map(k => ({ lane: k, P: { p: at(s).clone().add(V(-3.2, -5.2, 2.5)), q: lanes[k].P.q }, key: lanes[k].key, num: lanes[k].num }));
    ST[s] = { start, procs, waits };
    /* after it: the lanes that go on */
    const next = {};
    waits.forEach(w => { next[w.lane] = { key: w.key, P: w.P, num: w.num }; });
    procs.forEach(pr => pr.outs.forEach(o => { if (!o.leave) next[o.id] = { key: o.key, P: o.shift ? moved(o.P, o.shift) : o.P, num: o.num }; }));
    lanes = next; ST[s].end = next;
  }
  /* ---- knobs: one per station (0 → 1 the molecules arrive, → 2 the cofactors arrive, → 3 the reaction, → 4 what is
     released moves aside, and STOPS in view, so that it is named at rest; it leaves, fading, while the next station's
     molecules arrive: the expert review, 5 Nov 2026, "ATP, NADH and CO₂ are almost never named"), the camera ---- */
  const PARK = 0.3;   /* how far along its way out a released molecule waits (a third: still in the station's view) */
  /* where it waits: to the side and towards the viewer, at its own height (two lanes fill the view's height) */
  const parkV = L => V(L.x * PARK, 0, L.z * PARK);
  const knobs = { cam: 0 }; ORDER.forEach(s => { knobs['k' + s] = 0; });
  const BS = ballStick(700, 800); g.add(BS.group);
  let drawn = { atoms: [], bonds: [] };
  const lerpPose = (A, B, f) => ({ p: A.p.clone().lerp(B.p, f), q: A.q.clone().slerp(B.q, f) });
  function instances(K) {
    let cur = null; for (const s of ORDER) if (K['k' + s] > 0) cur = s;
    if (!cur) return { insts: Object.keys(ST.A.start).map(k => Object.assign({ id: k }, ST.A.start[k])), rx: [] };
    const k = K['k' + cur], S = ST[cur], insts = [], rxs = [];
    /* what the station before released, still waiting in view: it leaves now, as these molecules arrive */
    const prev = ORDER[ORDER.indexOf(cur) - 1];
    if (prev && k < 1) { const f = smooth(0, 1, k); ST[prev].procs.forEach(pr => pr.outs.forEach(o => { if (o.leave && f < 0.98) insts.push({ key: o.key, id: o.id, P: moved(o.P, parkV(o.leave).lerp(o.leave, f), 1), s: 1 - f }); })); }
    S.waits.forEach(w => { const s0 = S.start[w.lane]; insts.push({ key: w.key, id: w.lane, P: lerpPose(s0.P, w.P, smooth(0, 1, Math.min(1, k))), num: w.num }); });
    for (const pr of S.procs) {
      const s0 = S.start[pr.lane];
      if (k < 2) {
        insts.push({ key: pr.d.key, id: pr.lane, P: k < 1 ? lerpPose(s0.P, pr.inP, smooth(0, 1, k)) : pr.inP, num: s0.num });
        pr.cofs.forEach(c => { if (k > 1) insts.push({ key: c.key, id: c.id, P: lerpPose(c.fromP, c.P, smooth(0, 1, k - 1)), s: Math.min(1, (k - 1) * 3) }); });
      } else if (k < 3) rxs.push(pr.rx.at(k - 2));
      else pr.outs.forEach(o => {
        const f = smooth(0, 1, k - 3);
        if (o.leave) insts.push({ key: o.key, id: o.id, P: moved(o.P, parkV(o.leave), f) });
        else insts.push({ key: o.key, id: o.id, P: o.shift ? moved(o.P, o.shift, f) : o.P, num: o.num });
      });
    }
    return { insts, rx: rxs };
  }
  const halo = glow(3, 0xfff4d0, 0.45); g.add(halo);
  function draw(K, t) {
    const I = instances(K), all = gather(I.insts);
    I.rx.forEach(r => { const base = all.atoms.length; all.atoms.push(...r.atoms); r.bonds.forEach(b => all.bonds.push({ a: b.a + base, b: b.b + base, o: b.o, s: b.s })); });
    BS.draw(all.atoms, all.bonds, stage.cam.position.clone().sub(stage.view.at).normalize());
    drawn = all;
    const lane = all.atoms.filter(a => a.gn != null); if (lane.length) { halo.position.copy(lane.reduce((c, a) => c.add(a.p), V()).divideScalar(lane.length)); halo.visible = true; } else halo.visible = false;
  }
  function nums() {
    const out = [];
    for (const a of drawn.atoms) {
      if (a.el === 'C' && a.gn != null && (a.s == null || a.s > 0.5)) out.push({ n: String(a.gn), p: a.p });
    }
    return out;
  }
  /* ---- the views: the row of enzymes, then each station ---- */
  const D = (x, y, z) => V(x, y, z).normalize(), UP = V(0, 1, 0);
  const views = [{ at: V(120, 1, -2), dist: 150, dir: D(0.1, 0.22, 1), up: UP }].concat(ORDER.map(s => ({ at: at(s).clone().add(V(0.3, 0.3, 0.6)), dist: s === 'G' ? 12.5 : ['F', 'H', 'I', 'J', 'K'].includes(s) ? 10.5 : 7.5, dir: D(0.04, 0.1, 1), up: UP })));
  const vi = s => 1 + ORDER.indexOf(s);
  /* ---- names ---- */
  const molPts = (id) => () => drawn.atoms.filter(a => a.id === id && a.el !== 'H' && (a.s == null || a.s > 0.5)).map(a => a.p.clone());
  const labels = {};
  ORDER.forEach(s => {
    /* the enzyme's name on points of its glass inside the station's view (the review: points 4.5 nm out had been off the
       picture, so the name was left out) */
    enz[s].list.forEach((e, i) => { labels[s + 'e' + i] = { html: `<i>${ENZ[enz[s].key]}</i>`, lv: 'x', side: 'r', pts: () => surfacePoints(e, [at(s).clone().add(V(2.8, 1.8, 3)), at(s).clone().add(V(2.8, -1.8, 3)), at(s).clone().add(V(3.2, 0, 2.5)), at(s).clone().add(V(-2.8, 1.8, 3)), at(s).clone().add(V(-2.8, -1.8, 3))]) }; });
  });
  const mol = (id, key, side = 'l') => ({ html: NAME[key], side, lv: /<i>/.test(NAME[key]) ? 'x' : null, pts: molPts(id) });
  Object.assign(labels, {
    g6p: mol('g', 'g6p'), f6p: mol('g', 'f6p'), fbp: mol('g', 'fbp'), adp: mol('a', 'adp', 'r'), dhap: mol('d', 'dhap'), g3pt: mol('t', 'g3p', 'r'), g3pd: mol('d', 'g3p'),
    nadh: mol('nt', 'nadh', 'r'), nadhd: mol('nd', 'nadh', 'r'), bpg: mol('t', 'bpg', 'r'), atpt: mol('at', 'atp', 'r'), pg3: mol('t', 'pg3', 'r'), pg2: mol('t', 'pg2', 'r'),
    water: mol('wt', 'water', 'r'), pep: mol('t', 'pep', 'r'), pyr: mol('t', 'pyruvate', 'r'), pyrd: mol('d', 'pyruvate', 'l'), lact: mol('t', 'lactate', 'r'), nadt: mol('nt', 'nad', 'r'),
    ethanal: mol('y', 'ethanal', 'l'), co2: mol('cy', 'co2', 'r'), ethanol: mol('y', 'ethanol', 'l'), nady: mol('ny', 'nad', 'r'),
    row: { html: 'each see-through shape: one enzyme molecule', side: 'r', pts: () => surfacePoints(enz.F.list[0], [at('F').clone().add(V(4, 4, 3))]) }
  });
  const run = (s, ms = [1800, 1400, 3000, 1600]) => [{ to: { cam: vi(s), ['k' + s]: 1 }, ms: ms[0] }, { to: { ['k' + s]: 2 }, ms: ms[1] }, { to: { ['k' + s]: 3 }, ms: ms[2] }, { to: { ['k' + s]: 4 }, ms: ms[3] }];
  const steps = [
    { phases: [{ to: { cam: 0 }, ms: 800 }], labs: { row: 1 }, pic: 'Each see-through shape is one enzyme, at its true size. In the cytosol they are mixed among thousands of other proteins. The last two, on the right, are a yeast cell\'s.' },
    { phases: run('A'), labs: { Ae0: 1, g6p: 1, adp: 2 } },
    { phases: run('B'), labs: { Be0: 1, f6p: 1 } },
    { phases: run('C'), labs: { Ce0: 1, fbp: 1, adp: 2 } },
    { phases: run('D'), labs: { De0: 1, dhap: 1, g3pt: 1 } },
    { phases: run('E'), labs: { Ee0: 1, g3pd: 1, g3pt: 2 } },
    { phases: run('F', [2200, 1800, 3400, 1600]), labs: { Fe0: 1, bpg: 1, nadh: 1, nadhd: 2 } },
    { phases: run('G', [2200, 1600, 3000, 1600]), labs: { Ge0: 1, pg3: 1, atpt: 1 } },
    { phases: run('H'), labs: { He0: 1, pg2: 1 } },
    { phases: run('I'), labs: { Ie0: 1, pep: 1, water: 1 } },
    { phases: run('J', [2000, 1600, 3000, 1600]), labs: { Je0: 1, pyr: 1, atpt: 1, pyrd: 2 } },
    { phases: [{ to: { cam: vi('J') }, ms: 400 }], labs: { pyr: 1, pyrd: 1 }, board: '<b>For each glucose</b><span>ATP used: 2</span><span>ATP made: 4</span><span class="b">Net: 2 ATP</span><span class="b">2 reduced NAD</span><span class="b">2 pyruvate</span>' },
    { phases: [{ to: { cam: vi('J') }, ms: 400 }], labs: { pyr: 1, pyrd: 1 }, board: '<b>Without oxygen</b><span>the electron transport chain stops</span><span>↓ NADH cannot give its electrons to it</span><span>↓ soon no NAD is left</span><span class="b">↓ glycolysis would stop</span>' },
    { phases: run('K', [2400, 1800, 3000, 1600]), labs: { Ke0: 1, lact: 1, nadt: 1 } },
    { phases: [...run('L', [1800, 600, 2600, 1400]), ...run('M', [1800, 1600, 2600, 1400])], labs: { Me0: 1, ethanol: 1, nady: 1, Le0: 2 } },
    { phases: [{ to: { cam: 0 }, ms: 2400 }], labs: { row: 1 }, pic: 'The last two enzymes, on the right, are a yeast cell\'s: a muscle cell makes no ethanol.', board: '<b>Anaerobic respiration</b><span>humans: glucose → lactate</span><span>yeast: glucose → ethanol + carbon dioxide</span><span class="b">only 2 ATP per glucose</span><span>its only job: NAD is regenerated</span>' }
  ];
  return { group: g, knobs, views, steps, labels, draw, nums, narrowZoom: 0.82, turn: true, dispose() { BS.dispose(); disposeGroup(g); } };
}
