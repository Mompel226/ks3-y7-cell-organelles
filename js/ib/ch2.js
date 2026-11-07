/* ============================================================
   ch2.js — chapter 2, glycolysis in the cytosol (5 Nov 2026). Daniel's text: four stages (phosphorylation, lysis,
   oxidation, ATP formation), "why every single step happens"; the IB guide (C1.2.8): "not required to know the names of
   the intermediates, but ... each step in the pathway is catalysed by a different enzyme". So every one of the ten steps
   is shown at its own enzyme, each in its measured shape at its true size; the ten enzymes stand in a row only to be
   visited one after another (in the cytosol they are mixed among thousands of other proteins).
   Two views (Daniel, 6 Nov 2026: "you lost track of the overview ... which step I'm ... the idea is to really show what's
   happening to the molecule, but at the same time to really clearly know in which stage you are"): the OVERVIEW above
   (stage.js setOverview) is the whole row from far away, every enzyme named, the four stages over them, the enzyme at
   work lit and the molecule a gold dot on it; the CLOSE-UP below is the molecule itself, without the enzyme's surface.
   The enzymes are drawn only in the overview (layer 1). Each station first holds still with what takes part named (the
   molecule and its ATP, NAD, ADP or phosphate ion), then the reaction runs and the products are named at rest.
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
import { ballStick, gather, Reaction, molData, smooth, poseAt, moved, faceRing } from './mol.js?v=202611071821';
import { loadProts, protein } from './prot.js?v=202611071821';
import { disposeGroup, glow } from './stage.js?v=202611071821';

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
  /* ---- the stations: an enzyme each, its site(s) at (x, 0, 0); phosphoglycerate kinase works alone, so two of it stand
     one above the other, as close as their shapes allow (4.8 nm tall), so that both lanes fit one close-up ---- */
  const X = { A: 0, B: 21, C: 44, D: 67, E: 86, F: 104, G: 123, H: 140, I: 156, J: 174, K: 197, L: 220, M: 238 };
  const enz = {}, siteOf = {};
  const inOv = e => e.traverse(o => o.layers.set(1));          /* an enzyme: in the overview only */
  const place = (st, key, { pair = false, copies = null, site = 'site' } = {}) => {
    const S = V(X[st], 0, 0), list = [];
    if (copies) { siteOf[st] = S.clone(); } if (copies) copies.forEach((off, i) => { const e = protein(PR[key], { color: COL[key] }); e.position.copy(S).add(off).sub(e.userData.sites[site]); g.add(e); inOv(e); list.push(e); siteOf[st + i] = S.clone().add(off); });
    else {
      const e = protein(PR[key], { color: COL[key] }), s = e.userData.sites;
      const mid = pair && s.a ? s.a.clone().add(s.b).multiplyScalar(0.5) : s[site];
      e.position.copy(S).sub(mid); g.add(e); inOv(e); list.push(e);
      if (pair && s.a) { siteOf[st + 'a'] = e.position.clone().add(s.a); siteOf[st + 'b'] = e.position.clone().add(s.b); }
      siteOf[st] = S.clone();
    }
    enz[st] = { key, list };
  };
  place('A', 'hk2', { site: 'glucose' }); place('B', 'gpi'); place('C', 'pfk'); place('D', 'aldolase'); place('E', 'tpi');
  place('F', 'gapdh', { pair: true }); place('G', 'pgk', { copies: [V(0, 2.5, 0), V(0, -2.5, 0)], site: 'pg3' }); place('H', 'pgam', { pair: true });
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
    /* a lane not used here waits beside the station, below and to the left, clear of the other lane's way to the next */
    const used = new Set(DEF[s].map(d => d.lane));
    const waits = Object.keys(lanes).filter(k => !used.has(k)).map(k => ({ lane: k, P: { p: at(s).clone().add(V(-2.6, -2.6, 1.6)), q: lanes[k].P.q }, key: lanes[k].key, num: lanes[k].num }));
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
  /* the lanes' molecules (glucose; the two triose phosphates; the yeast's pyruvate), for the overview's gold dots */
  const LANES = ['g', 't', 'd', 'y'], lanePos = {};
  let cur = null;
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
    /* for the overview: the station at work, and the middle of each lane's molecule */
    cur = null; for (const s of ORDER) if (K['k' + s] > 0) cur = s;
    for (const id of LANES) lanePos[id] = null;
    const n = {}; for (const a of all.atoms) if (LANES.includes(a.id) && (a.s == null || a.s > 0.5)) { const c = n[a.id] || (n[a.id] = { p: V(), k: 0 }); c.p.add(a.p); c.k++; }
    for (const id in n) lanePos[id] = n[id].p.divideScalar(n[id].k);
    const lane = all.atoms.filter(a => a.gn != null); if (lane.length) { halo.position.copy(lane.reduce((c, a) => c.add(a.p), V()).divideScalar(lane.length)); halo.visible = true; } else halo.visible = false;
  }
  function nums() {
    const out = [];
    for (const a of drawn.atoms) {
      if (a.el === 'C' && a.gn != null && (a.s == null || a.s > 0.5)) out.push({ n: String(a.gn), p: a.p });
    }
    return out;
  }
  /* ---- the views: glucose at the start, then each station. The enzymes are drawn only in the overview, so a station's
     close-up is framed on its molecules alone: all of them, from their arrival to the released ones waiting aside, at
     their middle, as far back as the screen needs to show them all with their names (stage.js fitView; 6 Nov 2026: the
     second lane had lain at the picture's edge; on a phone it may turn a quarter round, the lanes then side by side) ---- */
  const D = (x, y, z) => V(x, y, z).normalize(), UP = V(0, 1, 0), DIR = D(0.04, 0.1, 1);
  const RIGHT = new THREE.Vector3().crossVectors(UP, DIR).normalize(), UPV = new THREE.Vector3().crossVectors(DIR, RIGHT).normalize();
  function frame(s) {      /* s: a station; null: glucose before the first */
    const pts = [];
    for (const k of s ? [1, 1.999, 2.5, 3, 4] : [0]) {
      const K = {}; ORDER.forEach(x => { K['k' + x] = 0; }); if (s) K['k' + s] = k;
      const I = instances(K), all = gather(I.insts);
      I.rx.forEach(r => all.atoms.push(...r.atoms));
      for (const a of all.atoms) if (a.s == null || a.s > 0.5) pts.push(a.p);
    }
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z = 0;
    for (const p of pts) { const x = p.dot(RIGHT), y = p.dot(UPV); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); z += p.dot(DIR); }
    const c = RIGHT.clone().multiplyScalar((x0 + x1) / 2).addScaledVector(UPV, (y0 + y1) / 2).addScaledVector(DIR, z / pts.length);
    const PAD = 0.14;   /* an atom's radius */
    return { at: c, dist: 7.5, dir: DIR, up: UP, fit: { min: 5.5, side: RIGHT, pts: pts.map(p => { const q = p.clone().sub(c); return [Math.abs(q.dot(RIGHT)) + PAD, Math.abs(q.dot(UPV)) + PAD, q.dot(DIR)]; }) } };
  }
  const views = [frame(null)].concat(ORDER.map(frame));
  const vi = s => 1 + ORDER.indexOf(s);
  /* ---- names ---- */
  const molPts = (id) => () => drawn.atoms.filter(a => a.id === id && a.el !== 'H' && (a.s == null || a.s > 0.5)).map(a => a.p.clone());
  const labels = {};
  /* a name on the left of the molecule that changes (it stands on the left of its site), on the right of what helps it
     (ATP, ADP, NAD, a phosphate ion: on the right), so that no name's line crosses the other molecule */
  const mol = (id, key, side = 'l') => ({ html: NAME[key], side, lv: /<i>/.test(NAME[key]) ? 'x' : null, pts: molPts(id), mid: id });
  Object.assign(labels, {
    g6p: mol('g', 'g6p'), f6p: mol('g', 'f6p'), fbp: mol('g', 'fbp'), adp: mol('a', 'adp', 'r'), dhap: mol('d', 'dhap'), g3pt: mol('t', 'g3p', 'r'), g3pd: mol('d', 'g3p'),
    nadh: mol('nt', 'nadh', 'r'), nadhd: mol('nd', 'nadh', 'r'), bpg: mol('t', 'bpg', 'l'), atpt: mol('at', 'atp', 'r'), pg3: mol('t', 'pg3', 'l'), pg2: mol('t', 'pg2', 'l'),
    water: mol('wt', 'water', 'r'), pep: mol('t', 'pep', 'l'), pyr: mol('t', 'pyruvate', 'l'), pyrd: mol('d', 'pyruvate', 'l'), lact: mol('t', 'lactate', 'l'), nadt: mol('nt', 'nad', 'r'),
    ethanal: mol('y', 'ethanal', 'l'), co2: mol('cy', 'co2', 'r'), ethanol: mol('y', 'ethanol', 'l'), nady: mol('ny', 'nad', 'r'),
    /* what takes part, named before it changes (memory name-it-on-the-picture) */
    glucose: mol('g', 'glucose', 'l'), atpa: mol('a', 'atp', 'r'), pit: mol('pt', 'pi', 'r'), adpt: mol('at', 'adp', 'r'), pyry: mol('y', 'pyruvate', 'l'), nadhy: mol('ny', 'nadh', 'r')
  });
  /* a station: its molecules arrive, its cofactor arrives, a hold (what takes part, named), the reaction, what is released
     moves aside (Daniel, 6 Nov 2026: "a bit faster", and named before as well as after) */
  const HOLD = { A: { glucose: 1, atpa: 1 }, B: { g6p: 1 }, C: { f6p: 1, atpa: 1 }, D: { fbp: 1 }, E: { dhap: 1 }, F: { g3pt: 1, nadt: 1, pit: 2 },
    G: { bpg: 1, adpt: 1 }, H: { pg3: 1 }, I: { pg2: 1 }, J: { pep: 1, adpt: 1 }, K: { pyr: 1, nadh: 1 }, L: { pyry: 1 }, M: { ethanal: 1, nadhy: 1 } };
  const run = (s, ms = [1300, 1000, 2300, 1200]) => [{ to: { cam: vi(s), ['k' + s]: 1 }, ms: ms[0] }, { to: { ['k' + s]: 1.999 }, ms: ms[1] }, { hold: 1700, labs: HOLD[s] },
    { to: { ['k' + s]: 3 }, ms: ms[2] }, { to: { ['k' + s]: 4 }, ms: ms[3] }];
  const steps = [
    { phases: [{ to: { cam: 0 }, ms: 800 }], labs: { glucose: 1 }, pic: 'Above, each shape is one enzyme at its true size, and the gold dot is the molecule. The last two, on the right, are a yeast cell\'s.' },
    { phases: run('A'), labs: { g6p: 1, adp: 1 } },
    { phases: run('B'), labs: { f6p: 1 } },
    { phases: run('C'), labs: { fbp: 1, adp: 1 } },
    { phases: run('D'), labs: { dhap: 1, g3pt: 1 } },
    { phases: run('E'), labs: { g3pd: 1, g3pt: 2 } },
    { phases: run('F', [1600, 1300, 2600, 1200]), labs: { bpg: 1, nadh: 1, nadhd: 2 } },
    { phases: run('G', [1600, 1200, 2300, 1200]), labs: { pg3: 1, atpt: 1 } },
    { phases: run('H'), labs: { pg2: 1 } },
    { phases: run('I'), labs: { pep: 1, water: 1 } },
    { phases: run('J', [1500, 1200, 2300, 1200]), labs: { pyr: 1, atpt: 1, pyrd: 2 } },
    { phases: [{ to: { cam: vi('J') }, ms: 400 }], labs: { pyr: 1, pyrd: 1 }, board: '<b>For each glucose</b><span>ATP used: 2</span><span>ATP made: 4</span><span class="b">Net: 2 ATP</span><span class="b">2 reduced NAD</span><span class="b">2 pyruvate</span>' },
    { phases: [{ to: { cam: vi('J') }, ms: 400 }], labs: { pyr: 1, pyrd: 1 }, board: '<b>Without oxygen</b><span>the electron transport chain stops</span><span>↓ NADH cannot give its electrons to it</span><span>↓ soon no NAD is left</span><span class="b">↓ glycolysis would stop</span>' },
    { phases: run('K', [1800, 1300, 2300, 1200]), labs: { lact: 1, nadt: 1 } },
    { phases: [...run('L', [1300, 500, 2000, 1000]), ...run('M', [1300, 1200, 2000, 1000])], labs: { ethanol: 1, nady: 1, co2: 2 } },
    { phases: [{ to: { cam: vi('M') }, ms: 800 }], labs: { ethanol: 1 }, pic: 'The last two enzymes above, on the right, are a yeast cell\'s: a muscle cell makes no ethanol.', board: '<b>Anaerobic respiration</b><span>humans: glucose → lactate</span><span>yeast: glucose → ethanol + carbon dioxide</span><span class="b">only 2 ATP per glucose</span><span>its only job: NAD is regenerated</span>' }
  ];
  /* ---- the overview: the whole row from far away; the names in rows above and below it, each in the first place where
     it touches no other (Daniel: "Make sure that labels do not overlap"); the four stages of the IB guide over them ---- */
  g.updateMatrixWorld(true);
  const STAGES = [['1 Phosphorylation', 'A', 'C'], ['2 Lysis', 'D', 'E'], ['3 Oxidation', 'F', 'F'], ['4 ATP formation', 'G', 'J'], ['Without oxygen', 'K', 'M', 'is-grey']];
  const box = {}; ORDER.forEach(s => { const b = new THREE.Box3(); enz[s].list.forEach(e => b.expandByObject(e)); const sp = b.getBoundingSphere(new THREE.Sphere()); box[s] = { c: sp.center, r: sp.radius * 0.8 }; });
  const ovEl = document.createElement('div'); ovEl.className = 'ibv__ovin';
  const nmEl = {}, lnEl = {}, NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'ibv__ovsvg'); ovEl.appendChild(svg);
  ORDER.forEach(s => {
    const l = document.createElementNS(NS, 'line'); svg.appendChild(l); lnEl[s] = l;
    const n = document.createElement('span'); n.className = 'ibv__ovn'; n.innerHTML = `<i>${ENZ[enz[s].key]}</i>`; ovEl.appendChild(n); nmEl[s] = n;
  });
  const stEl = STAGES.map(([t, a, b, cls]) => { const e = document.createElement('span'); e.className = 'ibv__ovs' + (cls ? ' ' + cls : ''); e.innerHTML = `<em>${t}</em>`; ovEl.appendChild(e); return { e, a, b }; });
  const ring = document.createElement('i'); ring.className = 'ibv__ovr'; ring.hidden = true; ovEl.appendChild(ring);
  const dots = LANES.map(id => { const e = document.createElement('i'); e.className = 'ibv__ovd'; e.hidden = true; ovEl.appendChild(e); return { id, e }; });
  let laid = '';
  /* each name: a row above or below the row of enzymes (its own side first), straight over its enzyme or moved sideways,
     in the first place where it touches no other name and its line crosses none; a name that finds no place at all is the
     only one left out, and the check (tools/ib-look.mjs) says so */
  function layout(P, B, narrow) {
    const placed = [{ l: 0, r: 130, t: B.H - 44, b: B.H }], gap = 7;   /* the band's scale bar */
    const touches = bx => placed.some(o => bx.l < o.r + gap && bx.r > o.l - gap && bx.t < o.b + 3 && bx.b > o.t - 3);
    const crosses = (x0, y0, x1, y1) => placed.some(o => { for (let k = 1; k < 8; k++) { const px = x0 + (x1 - x0) * k / 8, py = y0 + (y1 - y0) * k / 8; if (px > o.l && px < o.r && py > o.t && py < o.b) return true; } return false; });
    /* the stages' brackets: each over its enzymes, or as wide as its name where that is wider ("3 Oxidation", one enzyme,
       had run into the next bracket), a neighbour with room to spare giving way */
    const bk = stEl.map(x => {
      const a = P(box[x.a].c)[0] - box[x.a].r * B.ppn - 6, b = P(box[x.b].c)[0] + box[x.b].r * B.ppn + 6, w = x.e.firstChild.offsetWidth;
      const need = w ? w + 14 : 14, c = (a + b) / 2, half = Math.max((b - a) / 2, need / 2);
      return { x, l: c - half, r: c + half, need };
    });
    for (let i = 1; i < bk.length; i++) {
      const A = bk[i - 1], Z = bk[i]; let over = A.r + 8 - Z.l; if (over <= 0) continue;
      const tz = Math.min(over, Math.max(0, Z.r - Z.l - Z.need)); Z.l += tz; over -= tz;
      const ta = Math.min(over, Math.max(0, A.r - A.l - A.need)); A.r -= ta; over -= ta;
      if (over > 0) { A.l -= over / 2; A.r -= over / 2; Z.l += over / 2; Z.r += over / 2; }
    }
    bk.forEach(k => { k.x.e.style.left = k.l.toFixed(1) + 'px'; k.x.e.style.width = (k.r - k.l).toFixed(1) + 'px'; });
    /* a stage's name, where it shows, is a place no enzyme's name may touch (measured where it is drawn) */
    const R0 = ovEl.getBoundingClientRect(); let stB = 0;
    bk.forEach(k => { if (k.need > 14) { const r = k.x.e.firstChild.getBoundingClientRect(); placed.push({ l: r.left - R0.left, r: r.right - R0.left, t: r.top - R0.top, b: r.bottom - R0.top }); stB = Math.max(stB, r.bottom - R0.top); } });
    ORDER.forEach((s, i) => {
      const el = nmEl[s], ln = lnEl[s];
      if (narrow && s !== cur) { el.hidden = true; ln.style.display = 'none'; return; }
      el.hidden = false; ln.style.display = '';
      const w = el.offsetWidth, h = el.offsetHeight, [x, y] = P(box[s].c), r = box[s].r * B.ppn;
      const up = [28, 28 + h + 6, 28 + 2 * h + 12], dn = [B.H - 30 - h, B.H - 36 - 2 * h, B.H - 42 - 3 * h];
      const rows = (i % 2 ? [['dn', dn], ['up', up]] : [['up', up], ['dn', dn]]).flatMap(([side, tops]) => tops.map(t => [side, t]));
      let at = null;
      search: for (const [side, top] of rows) {
        if (side === 'up' ? top + h > y - r - 4 : top < y + r + 4) continue;
        for (const dx of [0, -26, 26, -52, 52, -78, 78, -104, 104]) {
          const l = Math.max(4, Math.min(B.W - w - 4, x + dx - w / 2)), bx = { l, r: l + w, t: top, b: top + h };
          const ex = Math.max(bx.l + 6, Math.min(bx.r - 6, x)), ey = side === 'up' ? bx.b : bx.t, ty = side === 'up' ? y - r : y + r;
          if (touches(bx) || crosses(ex, ey, x, ty)) continue;
          at = { bx, x1: ex, y1: ey, x2: x, y2: ty }; break search;
        }
      }
      /* no row free (a phone's band is too short for a name above or below the row): beside its enzyme, at its height, a
         short line to the ring round it */
      if (!at) side: for (const t0 of [y - h / 2, stB + 4, B.H - h - 2]) for (const sd of [1, -1]) {
        const rr = Math.max(9, r + 5), l = sd > 0 ? x + rr + 12 : x - rr - 12 - w, tt = Math.max(2, Math.min(B.H - h - 2, t0));
        const bx = { l, r: l + w, t: tt, b: tt + h };
        if (bx.l < 4 || bx.r > B.W - 4 || touches(bx)) continue;
        at = { bx, x1: sd > 0 ? bx.l : bx.r, y1: Math.max(bx.t + 6, Math.min(bx.b - 6, y)), x2: x + sd * rr, y2: y }; break side;
      }
      if (!at) { el.hidden = true; ln.style.display = 'none'; return; }
      placed.push(at.bx);
      el.style.transform = `translate(${at.bx.l.toFixed(1)}px, ${at.bx.t.toFixed(1)}px)`;
      ln.setAttribute('x1', at.x1.toFixed(1)); ln.setAttribute('y1', at.y1.toFixed(1)); ln.setAttribute('x2', at.x2.toFixed(1)); ln.setAttribute('y2', at.y2.toFixed(1));
    });
  }
  function placeOv(P, B) {
    const narrow = B.W < 560, key = B.W + 'x' + B.H + (narrow ? cur : '');
    ovEl.classList.toggle('is-narrow', narrow);
    ORDER.forEach(s => { nmEl[s].classList.toggle('is-on', s === cur); lnEl[s].classList.toggle('is-on', s === cur); });
    const ci = cur ? ORDER.indexOf(cur) : -1;
    stEl.forEach(x => x.e.classList.toggle('is-on', ci >= ORDER.indexOf(x.a) && ci <= ORDER.indexOf(x.b)));
    if (key !== laid) { laid = key; layout(P, B, narrow); }
    ring.hidden = !cur;
    if (cur) { const [x, y] = P(box[cur].c), r = Math.max(9, box[cur].r * B.ppn + 5); ring.style.width = ring.style.height = (2 * r).toFixed(1) + 'px'; ring.style.transform = `translate(${(x - r).toFixed(1)}px, ${(y - r).toFixed(1)}px)`; }
    dots.forEach(d => { const p = lanePos[d.id]; d.e.hidden = !p; if (p) { const [x, y] = P(p); d.e.style.transform = `translate(${(x - 6).toFixed(1)}px, ${(y - 6).toFixed(1)}px)`; } });
  }
  const overview = { view: { at: V(116, 0, 0), dir: D(0, 0.28, 1), up: UP }, width: 268, el: ovEl, place: placeOv };
  /* every atom on the screen, which no name may cover (stage.js setAvoid) */
  const avoid = () => drawn.atoms.filter(a => a.s == null || a.s > 0.5).map(a => ({ p: a.p, id: a.id, h: a.el === 'H' }));
  return { group: g, knobs, views, steps, labels, draw, nums, avoid, overview, narrowZoom: 0.82, turn: true, dispose() { BS.dispose(); disposeGroup(g); } };
}
