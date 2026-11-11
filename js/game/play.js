/* ============================================================
   play.js — what happens at each step of each place (4 Nov 2026). Every step waits for the pupil (a button on the part,
   a choice, or Next step). A wrong choice plays out what would really happen, then the pupil chooses again (memory
   bench-sims-show-the-truth). Each step builds what it needs, so a pupil who left half-way and comes back starts that
   step again with everything in place.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { token, ribbon, chain, tween as tween0, wait as wait0, burst, wave, AMINO_COLORS } from './actors.js?v=202611120025';
import { state, COST, RESPIRE } from './state.js?v=202611120025';
import { nanoPatch, heroPoint, along, loadATP, H_COL, glowPoints, ionStream, atpMaker, haloSprite } from '../world/mitoparts.js?v=202611120025';
import { TRUE, STEPS, trueTrack, trueMotor, glowSprite, amylaseCore } from '../world/tracks.js?v=202611120025';
import { sound } from './sound.js?v=202611120025';
import { magicStandard } from '../world/magic.js?v=202611120025';
import { buildCrowd } from '../world/crowd.js?v=202611120025';
import { Names } from './names.js?v=202611120025';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
/* the Explorer film, fetched when it is opened, not with the page (5 Nov 2026, speed) */
const openCopyFilm = o => import('./transcribe.js?v=202611120025').then(m => m.openCopyFilm(o));
const R = window.REV;
/* the IB switch (quest.js ibSwitch), shown in a place once every check is right: on, the names on the picture add the
   IB names (Daniel, 5 Nov 2026: the toggle "adds the labels to the transport protein, the carrier proteins") */
const ibOn = () => document.documentElement.classList.contains('ib-on');
/* with IB on, the IB terms where Year 7 has simpler ones (Daniel, 5 Nov 2026: "if you used lipids for Key Stage 3, now
   you use phospholipids"): ib(Year 7 words, IB words); the names on the magnified view by key: [name, a phone's name] */
const ib = (y7, words) => ibOn() ? words : y7;
const IB_NAMES = { 'nm-om': ['outer membrane:<br>phospholipid bilayer'], 'nm-ch': ['channel protein:<br>porin'], 'nm-cp': ['carrier protein:<br>pyruvate carrier'],
  'nm-h': ['hydrogen, in reduced<br>NAD and FADH₂', 'hydrogen'], 'nm-h2': ['hydrogen, in reduced<br>NAD and FADH₂', 'hydrogen'],
  'nm-p4': ['complex IV, the last<br>protein of the chain'], 'nm-lum': ['intermembrane space<br>(inside a crista)', 'intermembrane space'],
  'nm-hi': ['many protons<br>(hydrogen ions)', 'protons'], 'nm-hi2': ['many protons:<br>a high concentration', 'many protons'], 'nm-few': ['few protons', 'few protons'] };

export function makePlay(world, quest) {
  const W = world.W, scene = world.scene;
  let nanoAgain = null;   /* the last names on the magnified view, drawn again when the IB switch changes */
  /* a pupil may leave a place in the middle of a step (the map, another place): every wait of a step (a move, a pause, a
     flight) then stops the step, so it never puts a button, a token or an item into the place the pupil went to */
  const STALE = new Error('the pupil left this place');
  /* a button's own handler (b.done.then(async …)) may be waiting when the pupil leaves: its stop is expected, not an error */
  addEventListener('unhandledrejection', e => { if (e.reason === STALE) e.preventDefault(); });
  const live = (p, s = quest.session) => { const q = p.then(v => { if (quest.session !== s) throw STALE; return v; }); q.catch(() => {}); return q; };
  /* a token that bobs while it waits stops bobbing when it moves: the bob set its height every frame, so before
     4 Nov 2026 a bobbing molecule could never rise or fall (it never visibly crossed the membrane) */
  const unbob = o => { if (o && o.userData) o.userData.bob = null; };
  const tween = (o, opts) => { unbob(o); return live(tween0(o, opts)); };
  const wait = ms => live(wait0(ms));
  let kept = [], props = {};
  const keep = (o) => { scene.add(o); kept.push(o); return o; };
  const drop = (o) => { if (!o) return; scene.remove(o); kept = kept.filter(x => x !== o); };
  /* leaving a place takes its tokens away */
  function reset() { realOff(); kept.forEach(o => scene.remove(o)); kept = []; props = {}; mitoOff(); tracksLoop(false); diveOff(); poreFree(); chrUndim(); damTagsOff(); nolOff(); nanoOff(); }
  const N = W.nucleus, N0 = N.center, inN = (v) => N.group.localToWorld(v.clone());
  const fly = (pos, at, ms) => live(world.flyTo({ pos: pos.toArray ? pos.toArray() : pos, at: at.toArray ? at.toArray() : at }, { ms }));
  /* a point on the "stage" in front of the camera: dx to the right, dy up, d ahead (µm); the camera's axis is the middle
     of the free part of the picture (the panel's side is never used), so a token placed here is always in view */
  const scr = (dx, dy, d) => {
    const cam = world.camera, f = new THREE.Vector3(); cam.getWorldDirection(f);
    const r = new THREE.Vector3().crossVectors(f, cam.up).normalize(), u = new THREE.Vector3().crossVectors(r, f).normalize();
    return cam.position.clone().addScaledVector(f, d).addScaledVector(r, dx).addScaledVector(u, dy);
  };
  const depthTo = (p, back = 0.8) => world.camera.position.distanceTo(p) - back;
  const bob = (o, k = 0.08) => {
    const y0 = o.position.y, ph = Math.random() * 6;
    const f = t => { if (!o.parent || o.userData.bob !== f) { W.anim.splice(W.anim.indexOf(f), 1); return; } o.position.y = y0 + k * Math.sin(t * 1.4 + ph); o.rotation.y += 0.005; };
    o.userData.bob = f; W.anim.push(f);
  };
  /* a button on a part, pressed once (the step goes on); the energy check, when a job costs energy */
  const press = async (at, label, opts = {}) => {
    for (;;) {
      const b = quest.hot(at, label, opts); await b.done; b.remove();
      if (!opts.cost || quest.energy(opts.cost)) return;
      await wait(400);
    }
  };

  /* ---------------- the way in: the membrane at the base, drawn bigger (cellbuild.js, the bilayer) ----------------
     Daniel, 4 Nov 2026: "you should still see an in and an out … the oxygen should come from the red blood cells … small
     non-polar molecules being able to diffuse in, while the large polar molecules are transported". So the membrane shows
     its two layers of lipids, with the inside (the cytoplasm) above and the outside (the tissue fluid, then the capillary)
     below, named on the picture; each press has a reason: a red blood cell releases oxygen, which passes straight between
     the lipids; glucose and an amino acid each choose their way in (the lipids stop them; each passes through its own
     carrier protein); carbon dioxide leaves, into the PLASMA, between two red blood cells, and flows away with it (Daniel,
     the same evening: "make sure that it doesn't go inside a red blood cell … Otherwise, it's leading to a
     misconception"; haemoglobin is kept out: "too complicated"). In KS3 words: small and larger molecules (not "polar"). */
  const BL = W.bilayer, BLD = W.blood, WV = world.P.wayin.view;
  const curve = pts => new THREE.CatmullRomCurve3(pts);
  const jit = (k = 0.18) => (Math.random() - 0.5) * 2 * k;
  /* the names of the way in, each on a level line that ends on its part: inside, the membrane, outside, the blood */
  /* with IB on, the two carrier proteins are named too (spots on the front of each half): the glucose transporter's name
     only on the left, at the carrier's top, a row above the membrane's, which then points at the outer layer's heads (the
     three a little smaller, game.css nm--ib, so that two fit in the membrane's height on a 1280 × 700 laptop); the
     amino acid transporter's only on the right, at its carrier's foot (names.js side). So no line crosses another
     carrier: a name with no room is left out. On a phone each name stands on its part, the membrane's anywhere along it */
  /* more places for the names, for the closer views while a molecule crosses (beside each carrier, and where oxygen and
     carbon dioxide cross): appended, so the whole view's names stand where they did */
  const WAY_NEAR = [-2.9, -0.75, 0.45, 2.3], WAY_NEAR_OUT = [-2.9, -0.75, 1.6, 2.3];   /* (outside: clear of carbon dioxide's way down, x 0.25 to 0.6, even on a phone, where the name is about 1.4 µm wide) */
  const onCarrier = (C, ys) => ys.flatMap(([y, z]) => C.halves.map((h, k) => { h.updateWorldMatrix(true, false); return h.localToWorld(V(k ? 0.2 : -0.2, y, z)); }));
  /* solid: the molecule waiting close up, which no name may stand on (on a phone the names stand on their parts) */
  const wayNames = (again, solid) => !again && (quest.names.items[0] || {}).key === 'w-in' ? null : quest.names.set([
    { key: 'w-in', free: true, small: '<span class="nm__t">Inside: the cytoplasm</span>', html: '<span class="nm__t">Inside the cell:<br>the cytoplasm</span>', spots: [V(-3.7, 1.55, 0.12), V(-3.3, 1.7, 0.12), V(-3.7, 1.3, 0.12), V(1.9, 1.3, 0.12), ...WAY_NEAR.map(x => V(x, 0.78, 0.12))] },
    ibOn() ? { key: 'w-mem', free: true, side: 'L', cls: 'nm--ib', small: '<span class="nm__t">phospholipid bilayer</span>', html: '<span class="nm__t">Cell membrane:<br>phospholipid bilayer</span>',
        spots: (world.size.w < 640 ? [-4, -3.4, -2.8, -0.9, -0.2, 0.4, 2.2, 2.9, 3.6] : [-4, -3.7, -3.4, -2.9, 0.45]).map(x => V(x, -0.38, 0.2)) }
      : { key: 'w-mem', free: true, small: '<span class="nm__t">Cell membrane</span>', html: '<span class="nm__t">Cell membrane:<br>two layers of lipids</span>', spots: [V(-3.7, 0, 0.2), V(-3.4, 0, 0.2), V(-4.0, 0, 0.2), V(1.9, 0, 0.2), ...WAY_NEAR.map(x => V(x, 0, 0.2))] },
    { key: 'w-out', free: true, small: '<span class="nm__t">Outside: the tissue fluid</span>', html: '<span class="nm__t">Outside the cell:<br>the tissue fluid</span>', spots: [V(-3.7, -1.3, 0.1), V(-3.4, -1.2, 0.1), V(1.9, -1.25, 0.1), ...WAY_NEAR_OUT.map(x => V(x, -1.05, 0.1))] },
    { key: 'w-cap', free: true, small: '<span class="nm__t">Capillary (blood)</span>', html: '<span class="nm__t">Capillary,<br>with blood</span>', spots: [V(-3.5, -3.0, -0.7), V(-3.8, -3.3, -0.9), V(1.7, -3.0, -0.7)] }
  ].concat(ibOn() ? [
    { key: 'w-glut', free: true, side: 'L', aside: true, cls: 'nm--ib', small: '<span class="nm__t">glucose transporter</span>', html: '<span class="nm__t">glucose transporter</span>', spots: onCarrier(BL.carriers.glucose, [[0.555, 0.05]]) },
    { key: 'w-aat', free: true, side: 'R', aside: true, cls: 'nm--ib', small: '<span class="nm__t">amino acid transporter</span>', html: '<span class="nm__t">amino acid<br>transporter</span>', spots: onCarrier(BL.carriers.amino, [[-0.45, 0.21]]) }
  ] : []), [document.querySelector('.hud')], { l: V(-4.7, 0, 0.25), r: V(2.4, 0, 0.25) }, solid);
  /* each step starts in the place's view; already there, no flight (the names stay, never a flicker) */
  async function wayFly() {
    world.wayIn(true);
    if (world.camera.position.distanceTo(V(...WV.pos)) > 0.05 || world.controls.target.distanceTo(V(...WV.at)) > 0.05) await fly(WV.pos, WV.at);
    wayNames();
  }
  async function look() { await wayFly(); await quest.next(); }
  /* the red blood cells move to the right, along the capillary: the one a little left of the middle stays in view longest */
  const pickRbc = (x = -2.2, ahead = 3.5) => {
    let best = 0, bd = Infinity;
    for (let i = 0; i < BLD.n; i++) { const p = BLD.rbcAt(i, BLD.t || 0); if (p.x > x + 0.6 || p.x < x - ahead) continue; const d = Math.abs(p.x - x); if (d < bd) { bd = d; best = i; } }
    if (bd === Infinity) for (let i = 0; i < BLD.n; i++) { const d = Math.abs(BLD.rbcAt(i, BLD.t || 0).x - x); if (d < bd) { bd = d; best = i; } }
    return best;
  };
  /* a molecule follows a moving point (a red blood cell) and reaches it */
  const follow = (o, target, ms, opts = {}) => live(new Promise(res => {
    unbob(o);
    const p0 = o.position.clone(), s0 = o.scale.x, t0 = performance.now();
    const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms), e = k * k * (3 - 2 * k);
      o.position.lerpVectors(p0, target(), e); if (opts.scale != null) o.scale.setScalar(s0 + (opts.scale - s0) * e); world.kick && world.kick();
      if (k < 1) requestAnimationFrame(f); else res(); };
    f();
  }));
  /* the molecules at the membrane's own enlargement (10 Nov 2026, round 7; his "Yes, build it"): the membrane is drawn
     about 135 times thicker than it is (770 to 830 nm for 6 nm), and so is every molecule now, so that their sizes are right next
     to the lipids and next to each other. Before, oxygen (590 nm) and carbon dioxide (760 nm) were drawn bigger than glucose
     (540 nm) and an amino acid (about 500 nm), the opposite of the truth that the steps teach (the larger ones need a
     carrier). True sizes, longest way, with their atoms' own size: oxygen about 0.42 nm, carbon dioxide about 0.54 nm,
     glucose about 0.9 nm, an amino acid about 0.8 nm. At this size they are small from the place's view: each has a soft
     glow, and while one crosses the membrane the camera comes closer (wayZoom), then goes back out (wayBack).
     Proof: tools/true-size.mjs G */
  const WAY_K = 135;
  const WSZ = { oxygen: 0.42 * WAY_K / 1000 / 1.84, co2: 0.54 * WAY_K / 1000 / 2.24, glucose: 0.9 * WAY_K / 1000 / 2.44, amino: 0.8 * WAY_K / 1000 / 1.83 };   /* token sizes: each shape's length in token units */
  const WGLOW = { oxygen: 0xff9aa2, co2: 0xc8d2e0, glucose: 0xffe08a, amino: 0xc8b8ff };
  const wayMol = (kind, s = WSZ[kind]) => { const t = keep(token(kind, s)); haloSprite(t, kind === 'oxygen' || kind === 'co2' ? 0.05 : 0.042, WGLOW[kind]); return t; };
  /* a small name that moves with a molecule (as at the mitochondrion's dam: play.js moveTag), until the molecule goes */
  const molTag = (t, text) => { const sp = newTag(t); const s0 = quest.session, f = () => { if (!t.parent || quest.session !== s0) { sp.visible = false; return; } moveTag(sp, text, t, V(0, 0, 0), 6); requestAnimationFrame(f); }; f(); return sp; };
  const WVdir = () => V(...WV.pos).sub(V(...WV.at)).normalize();
  const wayZoom = (x, y = -0.25, ms = 1700) => camGo({ at: V(x, y, 0.12), dir: WVdir(), up: V(0, 1, 0), dist: fitDist(3300, 2500) }, R.FAST ? 0 : ms);
  const wayBack = (ms = 1600) => camGo({ at: V(...WV.at), dir: WVdir(), up: V(0, 1, 0), dist: V(...WV.pos).distanceTo(V(...WV.at)) }, R.FAST ? 0 : ms);
  async function oxygen() {
    await wayFly();
    let ri = pickRbc();
    const rbcPoint = () => { let p = BLD.rbcAt(ri, BLD.t || 0); if (p.x > 1.4) { ri = pickRbc(); p = BLD.rbcAt(ri, BLD.t || 0); } return p.add(V(0, 0.6, 2.2)); };
    await press(rbcPoint, 'red blood cell', { cls: 'tok', side: 't' });
    /* two oxygen molecules leave the red blood cell, cross the thin wall of the capillary and the tissue fluid, and pass
       straight between the lipids into the cytoplasm, each by its own wandering way */
    const from = BLD.rbcAt(ri, BLD.t || 0).add(V(0, 0.6, 2.2)), xs = [-0.75, -0.05];
    const ox = xs.map((x, i) => { const t = wayMol('oxygen'); t.position.copy(from).add(V(i ? 0.35 : -0.35, 0, 0)); return t; });
    molTag(ox[0], 'oxygen');
    burst(scene, from, { color: 0xff9aa2, n: 30, r: 0.55 });
    quest.say('The red blood cell releases oxygen.');
    const near = wait(R.TEST ? 0 : 1200).then(() => wayZoom(-0.4, -0.3, 2200));
    await Promise.all(ox.map((t, i) => {
      const x = xs[i], a = t.position.clone();
      return tween(t, { path: curve([a, V((a.x + x) / 2 + jit(), -2.1, -0.2), V(x + jit(), -1.25, 0.06), V(x, -0.6, 0.12), V(x, 0, 0.14), V(x + jit(0.1), 0.45, 0.12), V(x + jit(), 0.68, 0.12)]), ms: R.FAST ? 0 : 4200 + i * 500 });
    }));
    await near;
    quest.say(ib('<p>Oxygen is a small molecule: it passes straight through the two layers of lipids.</p><p>It spreads from the blood, where there is more oxygen, into the cell, where there is less. This is <dfn data-w="diffusion">diffusion</dfn>.</p>', '<p>Oxygen is small and non-polar: it passes straight between the phospholipids, down its <dfn data-w="concentration-gradient">concentration gradient</dfn>.</p><p>It goes from the blood, where its concentration is higher, into the cell, where it is lower. This is simple <dfn data-w="diffusion">diffusion</dfn>.</p>'), 'ok');
    await wait(R.TEST ? 0 : 1800);
    await wayBack();
    await quest.gain('oxygen', ox[0].position, 2); ox.forEach(drop);
  }
  /* a carrier protein changes shape, from its pose now to pose s (cellbuild.js carrier: -1 open to the outside, 0 shut on
     both sides, 1 open to the inside; the mitochondrion's carrier the same way, mitoparts.js) */
  const turnTo = (C, s, ms = 600) => live(new Promise(res => {
    const s0 = C.s, t0 = performance.now();
    const f = () => { const e = R.FAST || !ms ? 1 : Math.min(1, (performance.now() - t0) / ms); C.pose(s0 + (s - s0) * e * e * (3 - 2 * e)); world.kick && world.kick(); if (e < 1) requestAnimationFrame(f); else res(); };
    f();
  }));
  /* where a token stands so that the middle of its shape is at p (an amino acid's two parts are not round its centre) */
  /* (its shape only: not its glow nor its moving name, which stand above it) */
  const centred = (t, p) => { const b = new THREE.Box3(); t.updateMatrixWorld(true); t.traverse(o => { if (o.isMesh) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); b.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } }); return p.clone().add(t.position).sub(b.getCenter(new THREE.Vector3())); };
  /* one molecule through a carrier protein, in the real order (cellbuild.js carrier). The carrier waits open to the
     outside; the molecule moves to its mouth and into its pocket; as it settles there (it binds), the open side shuts
     behind it; for a moment it is held inside, both sides shut; then the carrier opens to the inside, and the molecule
     leaves as soon as there is room; once it is clear, the empty carrier changes back, open to the outside for the next */
  async function viaCarrier(C, t) {
    unbob(t);
    const at = y => centred(t, V(C.at.x, y, C.at.z + 0.1));
    if (C.s !== -1) await turnTo(C, -1, 500);
    await tween(t, { path: curve([t.position.clone(), at(-C.mouth - 0.12).add(V(jit(0.1), 0, 0)), at(-C.mouth)]), ms: 900 });
    const shut = wait(R.TEST ? 0 : 540).then(() => turnTo(C, 0, 560));
    await tween(t, { to: at(0), ms: 650 });
    await shut;
    await wait(300);
    const open = turnTo(C, 1, 640);
    await wait(R.TEST ? 0 : 545);
    await tween(t, { to: at(C.mouth), ms: 620 });
    await open;
    const back = turnTo(C, -1, 900);
    await tween(t, { to: V(C.at.x + jit(0.3), C.mouth + 0.14, 0.12), ms: 600 });
    await back;
  }
  /* a larger molecule meets the lipids beside a carrier, and stays outside: what really happens (memory
     bench-sims-show-the-truth) */
  async function bump(t, x) {
    const p0 = t.position.clone();
    await tween(t, { to: V(x, -0.5, 0.12), ms: 800 });
    await tween(t, { to: V(x, -0.62, 0.12), ms: 220 });
    await tween(t, { to: V(x, -0.5, 0.12), ms: 220 });
    await tween(t, { to: p0, ms: 800 });
  }
  /* molecules dissolved in the plasma leave the capillary through its thin wall, into the tissue fluid */
  async function fromBlood(kind, n, x0, size, second) {
    const ts = [];
    for (let i = 0; i < n; i++) {
      const t = wayMol(kind, size); t.position.set(x0 - 0.5 + i * 1.0, -2.5, -0.6);
      if (second) { const b2 = token('amino', size * 0.85); delete b2.userData.kind; b2.position.set(size * 0.9, size * 0.4, 0); b2.children[0].material = b2.children[0].material.clone(); b2.children[0].material.color.setHex(AMINO_COLORS[1]); t.add(b2); }
      ts.push(t);
    }
    await Promise.all(ts.map((t, i) => tween(t, { path: curve([t.position.clone(), V(t.position.x + jit(0.2), -1.9, -0.25), V(x0 - 0.45 + i * 0.9, -1.15, 0.06)]), ms: R.FAST ? 0 : 1700 + i * 250 })));
    ts.forEach(t => bob(t, 0.04));
    return ts;
  }
  async function carriers() {
    await wayFly();
    const C = BL.carriers.glucose; await turnTo(C, -1, 0);
    const g = await fromBlood('glucose', 2, C.at.x, WSZ.glucose);
    molTag(g[0], 'glucose');
    await wayZoom(C.at.x + 0.2); wayNames(true, [...g, C.group]);   /* (and off the carrier, where the glucose goes through) */
    await press(() => g[0].position.clone().add(V(0, -0.1, 0)), 'glucose', { cls: 'tok', side: 'b' });
    await quest.choose(ibOn() ? ['Through a glucose transporter (a carrier protein)', 'Straight between the phospholipids'] : ['Through a carrier protein', 'Straight through the two layers of lipids'], 0, async () => {
      quest.say(ib('Glucose is a larger molecule: the two layers of lipids stop it.', 'Glucose is polar: the hydrophobic core of the phospholipid bilayer stops it.'), 'no');
      await bump(g[0], C.at.x + 1.15);
    });
    quest.say(ib('A <dfn data-w="carrier-protein">carrier protein</dfn> lets glucose pass through the membrane.', 'A <dfn data-w="glucose-transporter">glucose transporter</dfn> lets glucose pass through the membrane: <dfn data-w="facilitated-diffusion">facilitated diffusion</dfn>, down its concentration gradient, with no ATP.'), 'ok');
    for (const t of g) await viaCarrier(C, t);
    await wayBack();
    await quest.gain('glucose', g[0].position, 2); g.forEach(drop);
  }
  async function amino() {
    await wayFly();
    const C = BL.carriers.amino, G = BL.carriers.glucose; await Promise.all([turnTo(C, -1, 0), turnTo(G, -1, 0)]);
    const [a] = await fromBlood('amino', 1, C.at.x - 0.4, WSZ.amino, true);
    molTag(a, 'amino acid');
    await wayZoom(C.at.x - 0.5); wayNames(true, [a, C.group, G.group]);
    await press(() => a.position.clone().add(V(0, -0.1, 0)), 'amino acid', { cls: 'tok', side: 'b' });
    await quest.choose(ibOn() ? ['Through its own transporter', 'Through the glucose transporter', 'Straight between the phospholipids'] : ['Through its own carrier protein', 'Through the carrier protein for glucose', 'Straight through the two layers of lipids'], 0, async (i) => {
      if (i === 1) {
        quest.say(ib('The carrier protein for glucose lets only glucose pass through. Each kind of carrier protein lets only one kind of substance pass through.', 'The glucose transporter lets only glucose pass through. Each carrier protein is selective: only particles of the right shape and charge fit it.'), 'no');
        /* into its open side, but it does not bind in the pocket: the carrier does not change shape, and it drifts out */
        const p0 = a.position.clone(), at = y => centred(a, V(G.at.x, y, G.at.z + 0.1));
        await tween(a, { to: at(-G.mouth), ms: 1100 });
        await tween(a, { to: at(-G.mouth + 0.42), ms: 520 });
        await wait(380);
        await tween(a, { to: at(-G.mouth), ms: 520 });
        await tween(a, { to: p0, ms: 1100 });
      } else {
        quest.say(ib('An amino acid is a larger molecule: the two layers of lipids stop it.', 'An amino acid is charged: the hydrophobic core of the phospholipid bilayer stops it.'), 'no');
        await bump(a, C.at.x - 1.2);
      }
    });
    quest.say(ib('Its own carrier protein lets the amino acid pass through.', 'Its own carrier protein, an amino acid transporter, lets the amino acid pass through.'), 'ok');
    await viaCarrier(C, a);
    await wayBack();
    await quest.gain('amino', a.position); drop(a);
  }
  async function co2() {
    await wayFly();
    const t = wayMol('co2'); t.position.set(0.3, 0.7, 0.14); bob(t, 0.03);
    molTag(t, 'carbon dioxide');
    await wayZoom(0.3, -0.1); wayNames(true, [t]);
    await press(() => t.position.clone().add(V(0, 0.1, 0)), 'carbon dioxide', { cls: 'tok', side: 't' });
    /* straight between the lipids, out through the tissue fluid and the capillary's thin wall */
    await tween(t, { path: curve([t.position.clone(), V(0.25 + jit(0.1), 0.42, 0.13), V(0.3, 0, 0.14), V(0.25, -0.6, 0.12), V(0.4 + jit(), -1.3, 0.04)]), ms: R.FAST ? 0 : 2200 });
    wayNames(true, [t]);   /* the names laid again, off it, now that it is in the tissue fluid */
    await wayBack(1400);
    /* then into the plasma: first along the tissue fluid until it is over the middle of a space between two red blood
       cells, then down into that space, always over it as the blood flows (it never touches a red blood cell); then on
       with the plasma, out of the picture */
    const k = BLD.gapNear(t.position.x, BLD.t || 0), inPlasma = () => BLD.aimAt(k, BLD.t || 0), a = t.position.clone();
    unbob(t);
    await live(new Promise(res => {
      const t0 = performance.now(), sm = x => x * x * (3 - 2 * x);
      const f = () => {
        const s = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 2600), g = inPlasma(), e1 = sm(Math.min(1, s / 0.45)), e2 = sm(Math.max(0, (s - 0.45) / 0.55));
        t.position.set(a.x + (g.x - a.x) * e1, a.y + (g.y - a.y) * e2, a.z + (g.z - a.z) * e2); world.kick && world.kick();
        if (s < 1) requestAnimationFrame(f); else res();
      };
      f();
    }));
    W.anim.push(function flowOn() { const p = inPlasma(); if (!t.parent || p.x > 9) { W.anim.splice(W.anim.indexOf(flowOn), 1); drop(t); return; } t.position.copy(p); });
    quest.say(ib('<p>Carbon dioxide passes straight through the two layers of lipids, into the blood.</p><p>It dissolves in the plasma, the liquid part of the blood, which carries it to your lungs.</p>', '<p>Carbon dioxide is small and non-polar: it passes straight between the phospholipids, by simple diffusion, into the blood.</p><p>It dissolves in the plasma, the liquid part of the blood, which carries it to your lungs.</p>'), 'ok');
    await quest.next('Check what you learned');
  }

  /* ---------------- mitochondria ----------------
     Daniel, 5 Nov 2026: the glucose "was really at the top left, I could barely see it … make sure that when you show the
     instructions, the glucose molecule is very clearly visible"; then: "it needs to be relative … when it zooms in and you
     see the membrane, double membrane, and you see all of the structures in the membrane, and you see where the oxygen
     goes and where the glucose goes, clearly it's going to be to scale". A glucose molecule is about 1 nm across, this
     mitochondrion about 700 nm wide: at their true sizes the two cannot both be seen in one picture. So the place opens on
     the whole mitochondrion, cut open (mitoparts.js heroMito); Zoom in takes the camera, in one move, with a scale bar,
     to its edge, where its two membranes, every lipid, its proteins and the molecules are all drawn at their true sizes
     (nanoPatch). There the glucose is split, in the cytosol; the pupil sends the two smaller molecules into the matrix
     (through a channel protein in the outer membrane, then a carrier protein in the inner one) and the oxygen (straight
     between the lipids, as at the way in); in the matrix the smaller molecules are broken down (carbon dioxide leaves the
     way the oxygen came), at the last pump oxygen joins hydrogen (water), and ATP synthase turns: energy is released; the
     camera then comes out again to the whole mitochondrion and the bar fills. Nothing is drawn bigger than it is: the
     camera comes closer instead. One glucose needs six oxygen molecules, so six come in. */
  const MW = W.mito, hero = MW.hero, HS = MW.spec, SECT = MW.section.userData.u;
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  let PT = null;
  /* the magnified view, built the first time it is needed, on the outer membrane 30 nm before the crista it shows */
  function patch() {
    if (PT) return PT;
    PT = nanoPatch({ uc: 30, depth: HS.zoom.depthNm, lumen: HS.zoom.lumenNm });
    const F = along(HS, HS.zoom.s), o = heroPoint(HS, HS.zoom.s, F.r, 0), g = PT.group;
    g.matrixAutoUpdate = false;
    g.matrix.makeBasis(V(F.t.x, F.t.y, 0), V(F.n.x, F.n.y, 0), V(0, 0, 1)).scale(V(0.001, 0.001, 0.001)).setPosition(o);
    g.visible = false; hero.add(g); hero.updateMatrixWorld(true);
    return PT;
  }
  const pW = (u, n, w = 0) => PT.group.localToWorld(V(u, n, w));                  /* a point of the magnified view (nm) */
  const pD = (x, y, z) => V(x, y, z).transformDirection(PT.group.matrixWorld);    /* a direction in it */
  const heroView = () => { const v = world.P.mito.view, at = V(...v.at), pos = V(...v.pos); return { at, dist: pos.distanceTo(at), dir: pos.clone().sub(at).normalize(), up: V(0, 1, 0) }; };
  /* a magnified view: what it looks at (u, n), how far away (nm); up is out of the mitochondrion: the cytosol at the top */
  const nanoView = (u, n, dnm) => ({ at: pW(u, n, -2), dist: dnm / 1000, dir: pD(0, 0, 1), up: pD(0, 1, 0) });
  const MS = { deep: false, hidden: [], tick: 0 };
  /* close to the membrane, the rest of the cell is far behind the magnified view and hidden by it: it is not drawn */
  function setDeep(on) {
    MS.deep = on;
    if (on) {
      Object.entries(W.groups).forEach(([k, g]) => { if (k !== 'mitochondria' && g.visible) { g.visible = false; MS.hidden.push(g); } });
      /* and this mitochondrion's own membranes, as surfaces: close in they stood as thin bands in front of the magnified
         membranes (a skin over the lipids); the cut face and the magnified view show them instead */
      [MW.real.inner, MW.real.outer, MW.sparks, MW.parts.outer, MW.parts.inner].forEach(o => { if (o.visible) { o.visible = false; MS.hidden.push(o); } });
    } else MS.hidden.splice(0).forEach(g => { g.visible = true; });
  }
  /* the scale bar, bottom left of the free part of the picture: a round length, 70 to 175 pixels long */
  let bar = null;
  const LENGTHS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
  function scaleBar(d) {
    if (!bar) { bar = R.h('div', { class: 'mscale', 'aria-hidden': 'true' }, '<i></i><b></b>'); R.$('#stage').appendChild(bar); }
    const pxNm = world.pxPerUnit(d) / 1000, L = LENGTHS.find(n => n * pxNm >= 70) || 2000;
    bar.firstChild.style.width = (L * pxNm).toFixed(1) + 'px';
    const t = L >= 1000 ? (L / 1000) + ' µm' : L + ' nm'; if (bar.lastChild.textContent !== t) bar.lastChild.textContent = t;
    bar.style.top = (world.size.h - (world.inset.bottom || 0) - 50) + 'px';
    bar.hidden = false;
  }
  /* every frame while in the place: the magnified view takes over from the cut face as the camera comes close (the face
     fades where it lies), the scale bar follows the zoom */
  function mitoLoop(on) {
    if (on && !MS.tick) {
      const f = () => {
        if (!MS.tick) return;
        const d = world.camera.position.distanceTo(world.controls.target);
        if (PT) {
          PT.group.visible = d < 0.9;
          /* the face fades out 64 to 76 nm from the middle of the magnified view, whose lipids reach 80 nm: no close view,
             even on a wide screen, sees the face at its edge */
          SECT.uHole.value.set(HS.zoom.s, 0.076, 0.135, smooth(0.55, 0.22, d));
          const bk = PT.parts.back.material; bk.uniforms.uA.value = smooth(0.3, 0.12, d); bk.depthWrite = d < 0.13;
          if ((d < 0.12) !== MS.deep) setDeep(d < 0.12);
        }
        scaleBar(d);
        MS.tick = requestAnimationFrame(f);
      };
      MS.tick = requestAnimationFrame(f);
    } else if (!on) { cancelAnimationFrame(MS.tick); MS.tick = 0; if (bar) bar.hidden = true; }
  }
  /* the lid: the front half lifts away and fades (o 0 → 1); closed, the mitochondrion looks whole */
  const FR = MW.front;
  const setLid = o => {
    /* it lifts upwards (−x of the hero's frame is up on the screen) and tips back, solid until it is clear of the cut
       face, then fades (the expert review: it had faded towards the camera instead of lifting) */
    FR.group.position.set(-0.95 * o, 0, 0.3 * o); FR.group.rotation.set(0, -0.55 * o, 0);
    FR.mats.forEach(m => { m.opacity = 1 - smooth(0.55, 0.95, o); m.depthWrite = o < 0.6; });
    FR.face.userData.u.uFade.value = 1 - smooth(0.5, 0.9, o); FR.group.visible = o < 0.99; FR.o = o; world.kick && world.kick();
  };
  const openLid = () => FR.o >= 1 ? Promise.resolve() : live(new Promise(res => { const t0 = performance.now();
    const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 2800); setLid(k * k * (3 - 2 * k)); if (k < 1) requestAnimationFrame(f); else res(); }; f(); }));
  setLid(0);
  /* leaving the place: everything as it was (the camera's up, its near and far planes, the cell, the cut face, the lid) */
  function mitoOff() {
    mitoLoop(false); if (MS.deep) setDeep(false); setLid(0); if (HC) HC.on = false;
    if (props.flow) props.flow.forEach(F => { F.s.update(0, false); F.m.update(0, false); });
    if (props.follow) props.follow.visible = false;
    if (PT) PT.group.visible = false; SECT.uHole.value.set(0, 0, 0, 0);
    world.camera.up.set(0, 1, 0); world.nearFar(10);
  }
  /* after the camera arrives close up, the pupil may turn the view only a little (the magnified view is a thin slice) */
  function tight() {
    const c = world.controls, d = world.camera.position.distanceTo(c.target), sp = new THREE.Spherical().setFromVector3(world.camera.position.clone().sub(c.target));
    if (d > 1) return;
    c.minDistance = d * 0.8; c.maxDistance = d * 1.3;
    c.minAzimuthAngle = sp.theta - 0.22; c.maxAzimuthAngle = sp.theta + 0.22; c.minPolarAngle = sp.phi - 0.18; c.maxPolarAngle = sp.phi + 0.18;
  }
  const settle = () => live(new Promise(r => { const f = () => (world.flying ? requestAnimationFrame(f) : r()); f(); }));
  /* the camera to a view; the distance changes by the same factor each moment (a zoom of a hundred times reads as one
     smooth move), and what it looks at reaches its place as the distance does, so it stays where it is on the screen */
  async function camGo(to, ms = 2600) {
    await settle();
    const cam = world.camera, c = world.controls, s0 = quest.session;
    const at0 = c.target.clone(), off = cam.position.clone().sub(at0), d0 = off.length(), dir0 = off.normalize(), up0 = cam.up.clone();
    world.flying = true; c.enabled = false; world.setMoving(true);
    const t0 = performance.now(), d1 = to.dist, same = Math.abs(Math.log(d0 / d1)) < 0.02;
    await live(new Promise(res => {
      const f = () => {
        if (quest.session !== s0) return res();
        const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms), e = k * k * (3 - 2 * k);
        const d = d0 * Math.pow(d1 / d0, e), g = same ? e : (d0 - d) / (d0 - d1);
        const a = at0.clone().lerp(to.at, g), dd = dir0.clone().lerp(to.dir, smooth(0, 0.8, e)).normalize();
        cam.up.copy(up0).lerp(to.up, smooth(0.1, 0.8, e)).normalize();
        cam.position.copy(a).addScaledVector(dd, d); c.target.copy(a); cam.lookAt(a); world.nearFar(d); world.kick();
        if (k < 1) requestAnimationFrame(f); else res();
      };
      f();
    }));
    await live(world.landed({ pos: cam.position.toArray(), at: to.at.toArray() }, false)); tight();
  }
  /* while a molecule moves, the camera keeps it in view (stop() lands it) */
  function track(getP, dnm, k = 0.05) {
    const cam = world.camera, c = world.controls, d1 = dnm / 1000, s0 = quest.session, t0 = performance.now(); let on = true;
    world.flying = true; c.enabled = false; world.setMoving(true);
    const dir = cam.position.clone().sub(c.target).normalize(), d0 = cam.position.distanceTo(c.target);
    /* the distance eases to its new value over 0.6 s (the expert review: it had jumped in one frame) */
    const f = () => { if (!on || quest.session !== s0) return; const e = R.FAST ? 1 : smooth(0, 1, (performance.now() - t0) / 600), d = d0 + (d1 - d0) * e;
      c.target.lerp(getP(), R.FAST ? 1 : k); cam.position.copy(c.target).addScaledVector(dir, d); cam.lookAt(c.target); world.nearFar(d); world.kick(); requestAnimationFrame(f); };
    f();
    return async () => { on = false; await live(world.landed({ pos: cam.position.toArray(), at: c.target.toArray() }, false)); tight(); };
  }
  /* a molecule waiting to be pressed rocks gently (0.2 nm) along the view's up */
  const nbob = (o, k = 0.0002) => {
    const p0 = o.position.clone(), up = pD(0, 1, 0), ph = Math.random() * 6;
    const f = t => { if (!o.parent || o.userData.bob !== f) { W.anim.splice(W.anim.indexOf(f), 1); return; } o.position.copy(p0).addScaledVector(up, k * Math.sin(t * 1.6 + ph)); o.rotation.z += 0.004; };
    o.userData.bob = f; W.anim.push(f);
  };
  /* a molecule of true size (nm across), at a point of the magnified view */
  const SIZE = { glucose: 0.37, half: 0.42, oxygen: 0.24, co2: 0.24, water: 0.22 };
  let HALO = null;
  /* a molecule's glow has its own colour: the smaller molecule yellow (as in the bag), oxygen red, carbon dioxide grey,
     water pale blue (the expert review, 5 Nov 2026: with every glow cream, carbon dioxide was only "a new dot") */
  const HALO_COL = { glucose: 0xffe08a, half: 0xffe08a, oxygen: 0xff8080, co2: 0xb7c3d8, water: 0x9fd8ff };
  const halo = (t, nm, col = 0xfff4d0) => {
    if (!HALO) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      HALO = new THREE.CanvasTexture(c); HALO.colorSpace = THREE.SRGBColorSpace; }
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: HALO, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(nm * 3.2 / 1000 / t.scale.x); s.renderOrder = 9; t.add(s); return t;
  };
  const NMS = { glucose: 0.9, half: 0.6, oxygen: 0.45, co2: 0.55, water: 0.32 };
  const molAt = (kind, p) => { const t = keep(token(kind, SIZE[kind] / 1000)); t.position.copy(p); t.quaternion.copy(hero.quaternion); return halo(t, NMS[kind], HALO_COL[kind]); };
  const mol = (kind, u, n, w = -1.4) => molAt(kind, pW(u, n, w));
  const along3 = pts => curve(pts.map(([u, n, w]) => pW(u, n, w == null ? -1.4 : w)));
  const nburst = (p, color, n = 26) => burst(scene, p, { n, r: 0.0022, size: 0.00045, near: 0.0004, color, ms: 900 });
  const HUD2 = () => [document.querySelector('.hud'), bar].filter(Boolean);
  /* the ribosome place and the rough ER: the corner box, the scale bar and the switch "Simple / As it really is" (REAL) */
  const HUDR = () => [document.querySelector('.hud'), bar, REAL.el].filter(Boolean);
  /* what is said after an action, scrolled into view in the panel (it was cut off at the panel's foot) */
  const ok = html => { quest.say(html, 'ok'); if (quest.step) quest.scrollTo(quest.step.say); };
  /* the view at the edge where the glucose is split: wide enough for both layers of lipids, the molecules in the middle */
  const SPLIT = () => nanoView(-21, 2, 34);
  /* names on the magnified view, each on one level line that ends on its part (names.js); frame: the middle of the view */
  const lr = (a, b) => world.project(a).x <= world.project(b).x ? { l: a, r: b } : { l: b, r: a };
  /* names on the magnified view: the frame is the named subject's own two sides (u0, u1 at height n): the names stand
     beside it, never on it */
  function nanoNames(list, u0, u1, n) {
    /* [key, the name, its spots, the shorter name a phone shows ON the part (names.js), if any, aside: on a phone the name
       stands beside its part first (a protein it would hide), its spots on a phone, if they differ: there the names stand
       on their parts, so a membrane is named away from the proteins named on it] */
    const phone = world.size.w < 640;
    nanoAgain = () => nanoNames(list, u0, u1, n);
    quest.names.set(list.map(([key, html, spots, small, aside, onPhone]) => { const I = ibOn() && IB_NAMES[key], hm = I ? I[0] : html, sm = I && I[1] || small; return { key, free: true, aside: !!aside, html: `<span class="nm__t">${hm}</span>`, small: sm && `<span class="nm__t">${sm}</span>`, spots: (phone && onPhone || spots).map(p => p.isVector3 ? p : pW(p[0], p[1], p[2] == null ? -0.5 : p[2])) }; }),
      HUD2(), lr(pW(u0, n), pW(u1, n)));
  }
  /* the names on the whole mitochondrion: one line to one part (Daniel, 5 Nov 2026: "if you're pointing to one
     mitochondrion, label it mitochondrion, not mitochondria"), so "a crista", one fold */
  function heroNames() {
    const P = (s, a) => hero.localToWorld(heroPoint(HS, s, a, 0)), T = HS.total, ks = [0.22, 0.34, 0.46, 0.58, 0.7, 0.82];
    const cr = HS.cristae.filter(c => !c.zoom), mx = [];
    for (let i = 0; i + 1 < HS.cristae.length; i++) mx.push(P((HS.cristae[i].s + HS.cristae[i + 1].s) / 2, 0));
    const all = [
      /* the two membranes, one name: here they are one line (15 nm apart); named apart where the camera zooms in (step 4).
         Two names on opposite edges had read as one membrane at the top and the other at the bottom (the expert review) */
      { key: 'm-2m', free: true, html: '<span class="nm__t">two membranes,<br>15 nm apart</span>', small: '<span class="nm__t">two membranes</span>', spots: ks.flatMap(k => { const r = along(HS, T * k).r - 0.004; return [P(T * k, r), P(T * k, -r)]; }) },
      { key: 'm-cr', free: true, html: '<span class="nm__t">a crista: a fold of<br>the inner membrane</span>', small: '<span class="nm__t">a crista (a fold)</span>', spots: cr.map(c => { const F = along(HS, c.s), across = c.f * (F.r - 0.029); return P(c.s + (c.amp || 0) * Math.sin(across * c.k + c.ph) + (c.tilt || 0) * across, c.side * (F.r - 0.0255 - across)); }) },
      { key: 'm-mx', free: true, html: '<span class="nm__t">matrix</span>', spots: mx }
    ];
    /* on a phone the names stand on their parts: three, so the mitochondrion still shows */
    /* the frame: its two ends (it lies across the view), so the names stand beside it, left and right */
    quest.names.set(world.size.w < 640 ? all.slice(0, 3) : all, HUD2(), lr(P(-0.2, 0), P(T + 0.2, 0)));
  }
  async function mlook() {
    world.wayIn(false); mitoLoop(true);
    await settle();
    if (world.camera.position.distanceTo(V(...world.P.mito.view.pos)) > 0.08) await camGo(heroView(), 1800);
    /* seen whole first; it is cut open when the pupil presses (the step waits: the review, 5 Nov 2026) */
    if (FR.o < 1) {
      const cb = quest.hot(() => hero.localToWorld(heroPoint(HS, HS.total * 0.62, -along(HS, HS.total * 0.62).r * 0.2, 0.3)), '✂ Cut it open', { side: 'r', cls: 'big' });
      await live(cb.done); cb.remove(); await openLid();
    }
    ok('Now you can see inside it.');
  }
  async function minside() {
    world.wayIn(false); mitoLoop(true); setLid(1);
    await settle();
    if (world.camera.position.distanceTo(V(...world.P.mito.view.pos)) > 0.08) await camGo(heroView(), 1800);
    heroNames();
    if (!state.has('glucose') || !state.has('oxygen')) { quest.say('You need glucose and oxygen: they enter the cell at <b>the way in</b>.', 'no'); return false; }
    await live(loadATP()); patch();
    /* where the zoom goes: a ring of light on the edge, and the button beside it (not over it) */
    const ring = keep(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.006, 8, 40), new THREE.MeshBasicMaterial({ color: 0xfff1a8 })));
    ring.position.copy(pW(-21, -3.5, 0)); ring.quaternion.copy(hero.quaternion);
    const zb = quest.hot(() => pW(-21, 0, 0), '🔍 Zoom in', { side: 'r', cls: 'big' });
    await live(zb.done); zb.remove(); drop(ring); quest.names.set([]);
    await camGo(SPLIT(), R.FAST ? 0 : 4200);
  }
  async function split() {
    mitoLoop(true); patch(); setLid(1);
    if (!MS.deep || world.camera.position.distanceTo(world.controls.target) > 0.05) await camGo(SPLIT(), 2600);
    nanoNames([['nm-c', 'cytosol', [[-17, 11.2], [-24, 11.6], [-27, 10.4]], null, false, [[-12, 4], [-30, 4], [-11, 1.5]]], ['nm-om', 'outer membrane:<br>two layers of lipids', [[-30, -1.0], [-12, -1.0], [-31, -6.0]]],
      ['nm-ch', 'channel protein', [[-22, -2.2, -2.6], [-22, -4.8, -2.6]]]], -30, -12, 2);
    const glu = mol('glucose', -21, 7.2); nbob(glu);
    await press(() => glu.position.clone().addScaledVector(pD(0, 1, 0), 0.0011), 'glucose', { cls: 'tok', side: 't' });
    state.use('glucose');
    const a = mol('half', -21, 7.2), b = mol('half', -21, 7.2); a.rotation.z = Math.PI; drop(glu);
    nburst(a.position, 0xfff1a8);
    await Promise.all([tween(a, { to: pW(-22.8, 6.6), ms: 700 }), tween(b, { to: pW(-18.6, 5.4), ms: 700 })]);
    props.halves = [a, b];
    ok(ib('The glucose is split into two smaller molecules, in the cytosol. Each is smaller: about 0.6 nm across.', 'Glycolysis converts the glucose into two <b>pyruvate</b> molecules (3C each), in the cytosol; here one press stands for its ten steps. Each pyruvate is about 0.6 nm across.'));
  }
  /* step 3's view: both membranes, the space between them, the top of the matrix and the cytosol where the molecules
     wait, all at once (46 nm, as tall as the free part of the screen allows), so that every name and every molecule to
     press is in view while the pupil chooses (the names had shown for an instant, then the camera moved on) */
  /* a still view in which the patch from n0 (below) to n1 (above) fills the free part of the screen, centred on u, never
     closer than dMin nm; on a phone the bag and its buttons cross the top of the picture, so it is fitted below them */
  const fitView = (u, n0, n1, dMin = 30) => {
    const st = world.canvas.getBoundingClientRect(), hd = document.querySelector('.hud'), hr = hd && hd.getBoundingClientRect();
    const top = hr && hr.width > st.width * 0.5 ? Math.max(0, hr.bottom - st.top + 6) : 0;
    const free = Math.max(160, world.size.h - (world.inset.bottom || 0) - top), dnm = Math.max(dMin, (n1 - n0) * world.pxPerUnit(1) / free);
    return nanoView(u, (n0 + n1) / 2 + top / 2 / (world.pxPerUnit(1) / dnm), dnm);
  };
  const OVER = () => fitView(-21, world.size.w < 640 ? -38 : -33, 13, 40);
  /* on a phone the names stand on their parts, and a membrane's name is as wide as half the screen: the proteins' names
     stand at the membranes' outer edges and the membranes' names at their inner edges, one above the other */
  const feedNames = () => nanoNames([['nm-ch', 'channel protein', [[-22, -1, -2.6], [-22, -5.5, -2.6]], null, false, [[-22, 0.8, -2.6], [-22, -1, -2.6]]],
    ['nm-ims', 'intermembrane space:<br>the space between<br>the membranes', [[-34, -14.5], [-8, -14.5], [-36, -12]], 'intermembrane space'],
    ['nm-cp', 'carrier protein', [[-21.5, -24, -3.4], [-21.5, -27.5, -3.4]], null, false, [[-20, -21, -3.4], [-20, -22.6, -3.4]]], ['nm-mx', 'matrix', [[-10, -30.5], [-14, -31], [-32, -30.5]], null, false, [[-6, -34], [-34, -34.5], [-10, -35]]],
    ['nm-om3', 'outer membrane', [[-10, -3.5, -0.5], [-30, -3.5, -0.5], [-14, -3.5, -0.5]], null, false, [[-40, -5.6, -0.5], [-2, -5.6, -0.5], [-36, -5.6, -0.5]]],
    ['nm-im3', 'inner membrane', [[-32, -25.5, -0.5], [-12, -25.5, -0.5], [-36, -25.5, -0.5]], null, false, [[-2, -27, -0.5], [1, -27, -0.5], [-40, -27, -0.5]]]], -36, -6, -11);
  async function feed() {
    mitoLoop(true); patch(); setLid(1);
    const over = async () => { await camGo(OVER(), 1600); feedNames(); };
    const halves = props.halves && props.halves.every(t => t.parent) ? props.halves : [mol('half', -22.8, 6.6), mol('half', -18.6, 5.4)];
    halves.forEach(t => nbob(t, 0.00015));
    /* the six oxygen molecules for one glucose, in the cytosol beside it */
    /* clear of the corner box, and never on the channel protein's way */
    const O2 = props.o2 && props.o2.every(t => t.parent) ? props.o2 : [[-30, 3.2], [-27.5, 6.4], [-14.5, 4.0], [-12, 8.4], [-9.5, 5.4], [-16.5, 9.6]].map(([u, n]) => mol('oxygen', u, n, -1 - Math.random() * 1.2));
    props.o2 = O2; O2.forEach(t => nbob(t, 0.00012));
    const C = PT.parts.mpc;
    C.pose(1);   /* the carrier waits open to the space between the membranes, where pyruvate comes from */
    /* before each press the camera is back at this view: a button never points at something out of view */
    await over();
    for (let i = 0; i < 2; i++) {
      const t = halves[i];
      if (i) await over();
      await press(() => t.position.clone().addScaledVector(pD(0, 1, 0), 0.001), ibOn() ? 'pyruvate' : 'smaller molecule', { cls: 'tok', side: 't' });
      /* through the channel protein in the outer membrane, across the space between the membranes, then through the carrier
         protein in the inner membrane, into the matrix; the camera follows it down */
      const stop = track(() => t.position.clone().addScaledVector(pD(0, 1, 0), -0.003), 42);
      const u0 = -22 + (i ? 0.5 : -0.5), w0 = -2.6;
      await tween(t, { path: along3([[i ? -18.6 : -22.8, i ? 5.4 : 6.6], [u0, 3.5, w0], [u0, -0.2, w0], [u0, -7.4, w0], [-21 + i * 0.4, -14, -3], [-20, -20.6, -3.4]]), ms: R.FAST ? 0 : 3600 });
      /* the carrier's real order (the way in's carriers, viaCarrier): into its pocket, where it binds; as it settles, the
         open side shuts behind it; held for a moment, both sides shut; the carrier opens to the matrix and pyruvate
         leaves; once it is clear, the empty carrier changes back, open to the space between the membranes */
      if (C.s !== 1) await turnTo(C, 1, 500);
      const shut = wait(R.TEST ? 0 : 900).then(() => turnTo(C, 0, 600));
      await tween(t, { to: pW(-20, -25.5, -3.4), ms: 1100 });
      await shut;
      await wait(300);
      const open = turnTo(C, -1, 650);
      await wait(R.TEST ? 0 : 550);
      await tween(t, { to: pW(-20, -30.4, -3.4), ms: 800 });
      await open;
      const back = turnTo(C, 1, 900);
      await tween(t, { to: pW(-18 + i * 3.2, -35 - i * 1.6, -2), ms: 900 });
      await back;
      await stop();
      if (!i) ok(ib('It passes through a channel protein in the outer membrane, then a carrier protein in the inner membrane, into the matrix.', 'It passes through porin, a channel protein in the outer membrane, then the pyruvate carrier, a carrier protein in the inner membrane, into the matrix.'));
    }
    await over();
    await press(() => O2[2].position.clone().addScaledVector(pD(0, 1, 0), 0.0009), 'oxygen', { cls: 'tok', side: 't' });
    state.use('oxygen');
    quest.names.set([]);
    /* oxygen is small: each passes straight between the lipids of both membranes, by its own wandering way */
    const stopO = track(() => pW(-24, -16, -1.5), 56, 0.03);
    await Promise.all(O2.map((t, i) => {
      const u = [-33, -30, -15, -12, -9, -17][i] + jit(0.8), p0 = t.position.clone();      /* never through the channel protein (at −22) */
      return wait(i * 260).then(() => tween(t, { path: curve([p0, pW(u + jit(1.5), 1.5), pW(u, -3.5), pW(u + jit(1.2), -9), pW(u + jit(1.5), -17), pW(u, -25.5), pW(u + jit(1.5), -31), pW(-22 + i * 3 + jit(1), -36 - jit(2.5))]), ms: R.FAST ? 0 : 3600 + i * 120 }));
    }));
    await stopO();
    props.inside = halves; props.o2 = O2;
    ok(ib('Oxygen is a small molecule: it passes straight between the lipids of both membranes, by <dfn data-w="diffusion">diffusion</dfn>, as at the way in.', 'Oxygen is small and non-polar: it passes straight between the phospholipids of both membranes, by simple <dfn data-w="diffusion">diffusion</dfn>, as at the way in.'));
  }
  /* a molecule grows or shrinks to a size (scale), smoothly */
  const scaleTo = (o, s1, ms) => live(new Promise(res => { const s0 = o.scale.x, t0 = performance.now();
    const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms), e = k * k * (3 - 2 * k); o.scale.setScalar(s0 + (s1 - s0) * e); world.kick && world.kick(); if (k < 1) requestAnimationFrame(f); else res(); }; f(); }));
  async function respire() {
    mitoLoop(true); patch(); setLid(1);
    let halves = props.inside && props.inside.every(t => t.parent) ? props.inside : [mol('half', -18, -35), mol('half', -14.8, -36.6)];
    if (!props.o2 || !props.o2.every(t => t.parent)) props.o2 = [0, 1, 2, 3, 4, 5].map(i => mol('oxygen', -22 + i * 3, -36 - (i % 2) * 2));
    /* the breakdown plays once, and ↺ Watch again plays it once more from the start, as often as the pupil likes: a pupil
       who reads while it plays can see it again (the review; Daniel, 5 Nov 2026: "Yes, add it") */
    for (;;) {
      /* close, in the matrix: the two smaller molecules and the six oxygen molecules, all in view */
      await camGo(fitView(-16, -46, -24, 40), 1800);
      /* each smaller molecule is broken down by enzymes, step by step: at each step (a flash) one carbon dioxide molecule and
         some hydrogen leave it, and what is left is smaller; three steps (pyruvate has three carbons: one leaves in the link
         reaction, two in the Krebs cycle, which the IB view shows); its hydrogen is what the next step carries to the chain */
      const co2 = [], hyd = [];
      await Promise.all(halves.map((h, j) => (async () => {
        await wait(R.TEST ? 0 : j * 700);
        const s0 = h.scale.x;
        for (let k = 0; k < 3; k++) {
          nburst(h.position, 0xffe7a0, 10); await wait(R.TEST ? 0 : 300);
          const c = molAt('co2', h.position.clone()), a = k * 2.1 + j * 1.3; co2.push(c);
          tween(c, { to: h.position.clone().addScaledVector(pD(Math.cos(a), Math.sin(a), 0), 0.0026), ms: 800 });
          const hh = halo(keep(token('default', 0.00013)), 0.45, 0xffffff); hh.position.copy(h.position); hyd.push(hh);
          tween(hh, { to: h.position.clone().addScaledVector(pD(Math.cos(a + 2.4), Math.sin(a + 2.4) + 1.4, 0), 0.003), ms: 900 });
          await scaleTo(h, s0 * (1 - (k + 1) * 0.28), 500);
          await wait(R.TEST ? 0 : 650);
        }
        await scaleTo(h, s0 * 0.001, 450); drop(h);
      })()));
      /* each kind named, now that they are still (the review: with nothing named, carbon dioxide was "just a new dot") */
      nanoNames([['nm-co2', 'carbon dioxide', co2.slice(0, 4).map(c => c.position.clone())], ['nm-o2', 'oxygen', props.o2.slice(0, 4).map(c => c.position.clone())],
        ['nm-h', 'hydrogen', hyd.slice(0, 4).map(c => c.position.clone())]], -30, -2, -35);
      ok(ib('The smaller molecules are broken down, step by step: <b>carbon dioxide</b> and hydrogen are produced. The oxygen waits in the matrix: it is used in the next step.', 'The link reaction and the Krebs cycle oxidize the pyruvate, step by step: <b>carbon dioxide</b> is released (<dfn data-w="decarboxylation">decarboxylation</dfn>), and hydrogen is removed (<dfn data-w="dehydrogenation">dehydrogenation</dfn>), carried by reduced NAD and FADH₂. The oxygen waits in the matrix: it is used in the next step.'));
      /* time to read the three names and the sentence before the camera moves back (2.6 s had been too short: Daniel, 5 Nov
         2026, "it zooms out too early") */
      await wait(R.TEST ? 0 : 5000);
      /* one still view from the matrix to the cytosol: the carbon dioxide leaves the way the oxygen came, straight between the
         lipids, each by its own way, and out of the top of the picture; the oxygen stays in view (the review: the camera had
         followed it out into an empty cytosol and come back) */
      quest.names.set([]);
      await camGo(fitView(-16, -42, 14, 60), 1800);
      await Promise.all(co2.map((c, i) => { const u = -27 + Math.random() * 20, p0 = c.position.clone(); return wait(R.TEST ? 0 : i * 260 + Math.random() * 300).then(() => tween(c, { path: curve([p0, pW(u + jit(2), -27.5), pW(u + jit(1), -25.5), pW(u + jit(3), -15 + jit(3)), pW(u + jit(1), -3.5), pW(u + jit(3), 6 + jit(2)), pW(u + jit(4), 26)]), ms: R.FAST ? 0 : 4400 + Math.random() * 1400 })); }));
      co2.forEach(drop);
      props.hyd = hyd;
      /* what stays for the next step, named again: the white dots are the hydrogen, beside the oxygen */
      nanoNames([['nm-h2', 'hydrogen', hyd.slice(0, 4).map(c => c.position.clone())], ['nm-o2c', 'oxygen', props.o2.slice(0, 4).map(c => c.position.clone())]], -34, 2, -36);
      ok(ib('Carbon dioxide leaves the mitochondrion: it passes straight between the lipids, as the oxygen did when it entered.', 'Carbon dioxide leaves the mitochondrion: it passes straight between the phospholipids, by simple diffusion, as the oxygen did when it entered.'));
      const nx = quest.next(), again = R.h('button', { type: 'button', class: 'btn ghost again' }, '↺ Watch again');
      quest.step.do.appendChild(again);
      const pick = await live(Promise.race([nx.then(() => 'next'), new Promise(r => again.addEventListener('click', () => r('again'), { once: true }))]));
      again.remove();
      if (pick === 'next') return;
      /* the same start again: Next waits until it has played, the two smaller molecules are back where they arrived, and
         the hydrogen is not made yet (the oxygen never moved) */
      const nb = quest.step.do.querySelector('.btn.next'); if (nb) nb.remove();
      quest.names.set([]); quest.say('');
      hyd.forEach(drop); props.hyd = null;
      halves = [mol('half', -18, -35, -2), mol('half', -14.8, -36.6, -2)];   /* where step 3 left them */
    }
  }
  /* ---------- the hydrogen ions the pumps move into the space inside the fold: they build up there, like water behind a
     dam, and flow back only through ATP synthase, which turns and makes ATP (Daniel, 5 Nov 2026: "protons going inside the
     membrane and accumulating there in high quantity, a high concentration … acting like a dam … leaving … through the
     ATP synthase … generating ATP"). Many inside the fold, a few in the matrix ---------- */
  let HC = null;
  function hCrowd() {
    if (HC) return HC;
    const G = PT.geo, N = 120, NM = 6, all = N + NM, pumps = PT.parts.pumps;
    const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 10, 8), new THREE.MeshStandardMaterial({ color: H_COL, emissive: H_COL, emissiveIntensity: 0.9, roughness: 0.3 }), all);
    mesh.frustumCulled = false; PT.group.add(mesh);
    const glow = glowPoints(all, 0.0028); PT.group.add(glow);
    const r = (i, k) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
    /* where each one stays: inside the fold, between its walls, more of them towards its round end (where the camera looks
       at ATP synthase), so that the crowd is seen; and a few in the matrix */
    const homes = [];
    for (let i = 0; i < N; i++) homes.push(V(G.uc + (r(i, 1) - 0.5) * (2 * G.hw - 8), G.nB - 6 - Math.pow(r(i, 2), 0.5) * (G.depth - 14), -0.8 - r(i, 3) * 8));
    /* the few in the matrix: three beside the chain, three beside the ATP synthases (both sides of the "dam" in view there) */
    for (let i = 0; i < NM; i++) homes.push(i < 3 ? V(G.uc - G.hw - 9 - r(i, 4) * 14, -50 - r(i, 5) * 28, -0.8 - r(i, 6) * 6)
      : V(G.uc + (i === 3 ? -24 : i === 4 ? 25 : -14) + r(i, 4) * 3, G.nR - 22 - r(i, 5) * 8, -0.8 - r(i, 6) * 5));
    /* each one inside the fold was pumped: from the matrix, through one of the three pumps, then to where it stays */
    const ways = homes.map((h, i) => { const p = pumps[i % 3]; return new THREE.CatmullRomCurve3([V(p.x - 7, p.n + (r(i, 7) - 0.5) * 4, p.w + 1.5), V(p.x, p.n, p.w + 1.2), V(p.x + 5, p.n - 2, p.w + 1.2), h]); });
    const tv = V(), tm = new THREE.Matrix4(), tq = new THREE.Quaternion(), ts = V(1, 1, 1), zero = new THREE.Matrix4().makeScale(0, 0, 0);
    HC = { N, NM, homes, on: false, full: false, start: null, dur: 7000, hidden: false };
    W.anim.push(t => {
      const gp = glow.geometry.attributes.position, gc = glow.geometry.attributes.color;
      if (!HC.on) { if (!HC.hidden) { for (let i = 0; i < all; i++) { mesh.setMatrixAt(i, zero); gc.setXYZ(i, 0, 0, 0); } mesh.instanceMatrix.needsUpdate = gc.needsUpdate = true; HC.hidden = true; } return; }
      HC.hidden = false; const now = performance.now();
      for (let i = 0; i < all; i++) {
        let k = 1;                                                     /* 1: where it stays */
        if (i < N && !HC.full) k = HC.start == null ? -1 : R.FAST ? 1 : (now - HC.start - HC.dur * i / N) / 1300;
        if (k < 0) { mesh.setMatrixAt(i, zero); gc.setXYZ(i, 0, 0, 0); continue; }
        if (k < 1) ways[i].getPointAt(k * k * (3 - 2 * k), tv);
        else { const h = homes[i]; tv.set(h.x + 0.5 * Math.sin(t * 1.3 + i), h.y + 0.5 * Math.cos(t * 1.1 + i * 1.7), h.z + 0.35 * Math.sin(t * 0.9 + i * 2.3)); }
        tm.compose(tv, tq, ts); mesh.setMatrixAt(i, tm); gp.setXYZ(i, tv.x, tv.y, tv.z); gc.setXYZ(i, 0.62, 0.85, 0.3);
      }
      mesh.instanceMatrix.needsUpdate = true; gp.needsUpdate = gc.needsUpdate = true;
    });
    return HC;
  }
  /* the crowd's places that the camera sees now, to end a name's line on (patch coordinates → the world) */
  const crowdSpots = (n = 5) => HC.homes.slice(0, HC.N).map(h => PT.group.localToWorld(h.clone())).filter(p => { const sc = world.project(p); return sc.inFront && sc.x > 40 && sc.x < world.size.w - (world.inset.right || 0) - 40 && sc.y > 40 && sc.y < world.size.h - (world.inset.bottom || 0) - 40; }).slice(0, n);
  async function water() {
    mitoLoop(true); patch(); setLid(1); quest.names.set([]);   /* the last step's names never stand on this view */
    const G = PT.geo, pump4 = [G.uc - G.hw - 4.5, -70], P1 = PT.parts.pumps[0], P4 = PT.parts.pumps[2];
    const O2 = props.o2 && props.o2.every(t => t.parent) ? props.o2 : [0, 1, 2, 3, 4, 5].map(i => mol('oxygen', -22 + i * 3, -36 - (i % 2) * 2));
    const HC = hCrowd(); HC.on = true; HC.full = false; HC.start = null;      /* the fold empty until the pumps work */
    const p4name = ['nm-p4', 'the last protein<br>in the chain', [[P4.x - 1.6, P4.n, P4.w + 2.4], [P4.x - 1.6, P4.n + 2, P4.w + 2.2]], null, true];
    const mxname = ['nm-mx2', 'matrix', [[pump4[0] - 14, -54], [pump4[0] - 16, -76]]];
    /* the hydrogen from the smaller molecules (step 4) goes on to the first protein's arm in the matrix, and the oxygen drifts
       nearer the last one, while the camera comes to the chain (the three proteins in view, below the bag on a phone) */
    const arm = pW(P1.x - 6.2, P1.n - 6.2, P1.w + 2);
    const hyd = props.hyd && props.hyd.every(t => t.parent) ? props.hyd : [0, 1, 2, 3].map(k => { const h = halo(keep(token('default', 0.00013)), 0.45, 0xffffff); h.position.copy(pW(P1.x - 20 - k * 2.5, P1.n - 14 + k * 2.5, -1.4)); return h; });
    props.hyd = null;
    const near = O2.map((t, i) => pW(pump4[0] - 9 - (i % 3) * 2.2 + jit(0.6), -63 - Math.floor(i / 3) * 4.5 - (i % 2) * 1.5, -1.2 - Math.random()));
    const drift = Promise.all(O2.map((t, i) => tween(t, { path: curve([t.position.clone(), pW(-6 + jit(3), -50 + jit(4)), near[i]]), ms: R.FAST ? 0 : 3800 + i * 200 })));
    const hGo = Promise.all(hyd.map((h, k) => wait(R.TEST ? 0 : 600 + k * 220).then(() => tween(h, { to: arm, ms: R.FAST ? 0 : 2600 }))));
    await camGo(fitView(pump4[0] - 4, -78, -42, 50), 2200);
    /* part 1: the space inside the fold is named before it fills (the review); the hydrogen reaches the first protein, its
       energy passes along the chain (a light, protein to protein), and the three pumps move hydrogen ions into the fold */
    nanoNames([p4name, ['nm-lum', 'the space<br>inside the fold', [[G.uc - 4, -60, -1], [G.uc - 4, -70, -1], [G.uc - 2, -66, -1]], 'inside the fold'], mxname], pump4[0] - 18, G.uc + G.hw + 3, -60);
    await hGo;
    hyd.forEach(drop); nburst(arm, 0xfff1a8, 14);
    const pulse = keep(token('default', 0.0004)); pulse.position.copy(arm);
    tween(pulse, { path: curve(PT.parts.pumps.map(p => pW(p.x - 1.5, p.n, p.w + 2.5))), ms: R.FAST ? 0 : 2400 }).then(() => drop(pulse));
    HC.start = performance.now();
    await Promise.all([wait(R.TEST ? 0 : HC.dur + 1300), drift]);
    HC.full = true;
    /* the oxygen is not named here: its own button says "oxygen" (a name beside it said the same word twice) */
    nanoNames([p4name, ['nm-hi', 'many<br>hydrogen ions', crowdSpots(), 'hydrogen ions'], mxname], pump4[0] - 18, G.uc + G.hw + 3, -60);
    ok(ib('The proteins pumped <b>hydrogen ions</b> into the space inside the fold: now many are there.', 'The electron transport chain pumped <b>protons</b> (hydrogen ions) into the intermembrane space: now their concentration there is high.'));
    /* part 2, when the pupil presses: each oxygen molecule goes to the last protein; there it joins with hydrogen (four, from
       the smaller molecules): two water molecules (the review: four things had happened at once) */
    await press(() => O2[0].position.clone().addScaledVector(pD(0, 1, 0), 0.0009), 'oxygen', { cls: 'tok', side: 't' });
    quest.names.set([]);
    const out = [];
    await Promise.all(O2.map((t, i) => {
      const p0 = t.position.clone(), end = pW(pump4[0] - 1.2 + jit(0.6), -70 + (i - 2.5) * 1.3, -2.2);
      return wait(R.TEST ? 0 : i * 320).then(() => tween(t, { path: curve([p0, pW(pump4[0] - 5 + jit(1), -68 + jit(2)), end]), ms: R.FAST ? 0 : 1800 })).then(async () => {
        const hs = [0, 1, 2, 3].map(k => { const h = halo(keep(token('default', 0.00013)), 0.4, 0xffffff); h.position.copy(end).addScaledVector(pD(Math.cos(k * 1.57), Math.sin(k * 1.57), 0), 0.0016); return h; });
        await Promise.all(hs.map(h => tween(h, { to: end, ms: 600 })));
        hs.forEach(drop); drop(t);
        for (let k = 0; k < 2; k++) { const w = molAt('water', end.clone()); out.push(w); tween(w, { to: end.clone().addScaledVector(pD(-1, 0, 0), 0.0016 + 0.0009 * k).addScaledVector(pD(0, 1, 0), (k ? 1 : -1) * 0.0012), ms: 700 }); }
      });
    }));
    props.water = out; props.o2 = null;
    await wait(R.TEST ? 0 : 800);
    nanoNames([p4name, ['nm-wat', 'water', out.slice(0, 6).map(w => w.position.clone())], ['nm-hi', 'many<br>hydrogen ions', crowdSpots(), 'hydrogen ions'], mxname], pump4[0] - 18, G.uc + G.hw + 3, -60);
    ok(ib('At the last protein in the chain, oxygen joins with hydrogen from the smaller molecules: <b>water</b> is produced.', 'At the end of the chain, in complex IV, oxygen accepts electrons and protons: <b>water</b> is produced. Oxygen is the terminal electron acceptor.'));
    await quest.next();
  }
  /* the dam: the hydrogen ions flow back only through ATP synthase, which turns in steps, one for each ion, and makes ATP
     (mitoparts.js ionStream, atpMaker) */
  /* a small name that moves with what it names (9 Nov 2026, Daniel, of the dam: "the ATP label and few hydrogen ions, they
     are static … show that the little yellow dots are hydrogen ions … labeling all of the ATP molecules … showing ADP and
     then converting it into ATP"): a sprite drawn over everything, the same size on the screen at any distance (22 px
     high), above its part, its words changed when the part changes. The names on level lines (names.js) stay for what
     stands still */
  const TAGS = {};
  function tagTex(text) {
    if (TAGS[text]) return TAGS[text];
    const c = document.createElement('canvas'), g = c.getContext('2d'), F = '800 44px Nunito, Arial, sans-serif';
    g.font = F; const w = Math.ceil(g.measureText(text).width) + 44; c.width = w; c.height = 68;
    g.font = F; g.fillStyle = 'rgba(28,20,44,0.92)'; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 3;
    g.beginPath(); if (g.roundRect) g.roundRect(2, 2, w - 4, 64, 30); else g.rect(2, 2, w - 4, 64); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 36);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return (TAGS[text] = { t, aspect: w / 68 });
  }
  function moveTag(sp, text, parent, local, lift) {      /* lift: px between the part and its tag */
    const T = tagTex(text); if (sp.material.map !== T.t) { sp.material.map = T.t; sp.material.needsUpdate = true; }
    const a = parent.localToWorld(local.clone()), b = parent.localToWorld(local.clone().add(V(1, 0, 0)));
    const pa = world.project(a), pb = world.project(b), px = Math.max(0.01, Math.hypot(pb.x - pa.x, pb.y - pa.y));   /* px for 1 unit here */
    /* above its part on the SCREEN (the camera's up, carried into the part's own frame), lift px clear of it */
    const upW = V(0, 1, 0).applyQuaternion(world.camera.quaternion), upL = parent.worldToLocal(a.clone().add(upW)).sub(local).normalize();
    const h = 22 / px; sp.scale.set(h * T.aspect, h, 1); sp.position.copy(local).addScaledVector(upL, (lift + 11) / px);
    /* never over a name, the corner box or the panel, nor cut by the picture's edge: there it fades out, and back in when
       clear (a fade, never a blink: memory label-lines-never-cross) */
    const c = world.project(parent.localToWorld(sp.position.clone())), cr = world.canvas.getBoundingClientRect(), hw = 11 * T.aspect + 4;
    const box = { l: cr.left + c.x - hw, r: cr.left + c.x + hw, t: cr.top + c.y - 15, b: cr.top + c.y + 15 };
    const over = r => r.width > 0 && box.l < r.right && box.r > r.left && box.t < r.bottom && box.b > r.top;
    const s = world.size, clear = c.inFront && c.x - hw > 4 && c.x + hw < s.w - (world.inset.right || 0) - 4 && c.y - 15 > 4 && c.y + 15 < s.h - (world.inset.bottom || 0) - 4
      && ![...document.querySelectorAll('#names .nm')].some(e => e.style.visibility !== 'hidden' && over(e.getBoundingClientRect())) && !HUD2().some(e => over(e.getBoundingClientRect()));
    const m = sp.material; m.opacity += ((clear ? 1 : 0) - m.opacity) * 0.18; sp.visible = m.opacity > 0.02;
  }
  /* the dam's tags, made once (on the two ATP synthases, which stay in the world) and hidden when the pupil leaves */
  let damTags = null;
  function damTagsOff() { if (damTags) [damTags.h, ...damTags.m.flat()].forEach(sp => { sp.visible = false; sp.material.opacity = 0; }); }
  const newTag = parent => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex('ATP').t, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); sp.renderOrder = 30; sp.visible = false; parent.add(sp); return sp; };
  async function dam() {
    mitoLoop(true); patch(); setLid(1); quest.names.set([]);
    const G = PT.geo, HC = hCrowd(); HC.on = true; HC.full = true;
    /* far enough back that the two ATP synthases leave room beside them for the names (below the bag on a phone); the
       water goes on drifting where it was made, out of the picture as the camera moves (it is no longer dropped at once) */
    await camGo(fitView(G.uc, G.nR - 32, G.nR + 12, 74), 2200);
    (props.water || []).forEach(drop); props.water = null;
    const A = PT.parts.atp, s0 = quest.session;
    props.flow = props.flow || A.map(a => ({ s: ionStream(a), m: atpMaker(a), rotor: a.userData.rotor }));
    /* one ion followed, brighter, through the first ATP synthase */
    if (!props.follow) { props.follow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), new THREE.MeshStandardMaterial({ color: H_COL, emissive: H_COL, emissiveIntensity: 1.1, roughness: 0.3 })); haloSprite(props.follow, 1.1, 0xd9ff9e); A[0].add(props.follow); }
    const fol = props.follow;
    /* the tags: one on the ion followed ("hydrogen ion"), one on each molecule made at a head ("ADP + phosphate", then
       "ATP" once the phosphate has joined, until it has gone) */
    if (!damTags) damTags = { h: newTag(A[0]), m: props.flow.map((F, i) => F.m.made.map(() => newTag(A[i]))) };
    const TG = damTags;
    const tagsDraw = () => {
      if (fol.visible) moveTag(TG.h, 'hydrogen ion', A[0], fol.position, 8); else { TG.h.visible = false; TG.h.material.opacity = 0; }
      props.flow.forEach((F, i) => F.m.made.forEach((m, j) => {
        const sp = TG.m[i][j], on = F.m.seen(m) && (m.userData.leave || 0) < 0.85;
        if (on) moveTag(sp, (m.userData.join || 0) > 0.6 ? 'ATP' : 'ADP + phosphate', A[i], m.position, 12); else { sp.visible = false; sp.material.opacity = 0; }
      }));
    };
    const names = extra => nanoNames([['nm-atp', 'ATP synthase<br>(a protein)', A.map(a => a.localToWorld(V(0, 12, 0))), 'ATP synthase', true],
      ['nm-hi2', 'many<br>hydrogen ions', crowdSpots(), 'many hydrogen ions'],
      ['nm-few', 'few<br>hydrogen ions', HC.homes.slice(HC.N + 3).map(h => PT.group.localToWorld(h.clone())), 'few hydrogen ions'], ...extra], G.uc - 21, G.uc + 21, G.nR - 16);
    names([]);
    /* the flow: 2 ions a second through each; the ring moves in steps, one for each ion, and ADP and phosphate join into
       ATP each third of a turn. It goes on while the pupil reads, until Next (the review: it had stopped, frozen) */
    let T = 0, last = performance.now(), run = true;
    const T1 = 18.5;   /* after this, ATP is named: the seventh is being made on the near side of the head */
    const tick = () => {
      if (!run || quest.session !== s0) return;
      const now = performance.now(); T += R.FAST ? T1 : Math.min(0.1, (now - last) / 1000) * 2; last = now;
      props.flow.forEach(F => { F.rotor.rotation.y = F.s.rotorY(T); F.s.update(T, true); F.m.update(T, true); });   /* both the same way, with their ions */
      const kf = 8 * Math.floor(Math.max(0, T - 1e-6) / 8); fol.visible = props.flow[0].s.ionAt(kf, T, fol.position) > 0;
      tagsDraw();
      world.kick && world.kick(); requestAnimationFrame(tick);
    };
    tick();
    await live(new Promise(res => { const f = () => (T >= T1 || quest.session !== s0 ? res() : requestAnimationFrame(f)); f(); }));
    /* (each ATP is named by its own tag as it is made; the one fixed name "ATP" at the head had not shown that it is made
       again and again) */
    ok(ib('As the hydrogen ions flow back through it, the ring of ATP synthase turns, and it makes <b>ATP</b>. The cell uses the energy in ATP for its work.', 'As the protons flow back through it, down their gradient (<dfn data-w="chemiosmosis">chemiosmosis</dfn>), the ring of ATP synthase turns, and it phosphorylates ADP: <b>ATP</b>. The cell uses the energy in ATP for its work.'));
    await quest.next();
    run = false; damTagsOff();
  }
  async function release() {
    mitoLoop(true); patch(); setLid(1);
    (props.water || []).forEach(drop);
    quest.names.set([]);
    await camGo(heroView(), R.FAST ? 0 : 3600);
    if (HC) HC.on = false;
    mitoLoop(false); bar && (bar.hidden = true);
    burst(scene, hero.position, { color: 0xfff1a8, n: 90, r: 2.2, ms: 1600 });
    await quest.gain('energy', hero.position, RESPIRE);
    /* the way on. Beyond the Year 7 list, the place's end offers the IB extension once every check is right (quest.js;
       it replaced the Explorer film offered here, 5 Nov 2026) */
    await live(quest.next(state.has('glucose') && state.has('oxygen') && state.energy() < 70 ? 'Next step' : 'Back to the map'));
  }

  /* the IB switch turned on or off in a place: its names follow at once (quest.js ibSwitch). A finished way in shows its
     names only with IB on, the carrier proteins named; on the magnified mitochondrion, the last names are drawn again */
  document.addEventListener('ib-switch', e => {
    if (quest.cur !== e.detail.id) return;
    if (e.detail.id === 'wayin') { if (state.done('wayin')) { quest.names.set([]); if (e.detail.on) wayNames(true); } else if ((quest.names.items[0] || {}).key === 'w-in') wayNames(true); }
    else if (e.detail.id === 'mito' && nanoAgain && quest.names.items.some(it => IB_NAMES[it.key])) nanoAgain();
  });

  /* ---------------- nucleus ---------------- */
  const win = N.winDir.clone();
  const nucView = () => ({ pos: N0.clone().addScaledVector(win, 6.4).add(V(0.5, -0.2, 0)), at: N0.clone().add(V(0.15, 0.1, 0.2)) });
  /* the names on the nucleus once it is open: a chromosome, the nucleolus, and the envelope at the edge of the window,
     where its two membranes show (cleared when the step ends: the next step's buttons stand on the threads) */
  function insideNames() {
    quest.names.set([
      nameOf('n-chr', 'chromosome', W.chromosomes.slice(0, 12).map(ch => inN(ch.curve.getPointAt(0.5))), [N.group]),
      nameOf('n-nol', 'nucleolus', world.P.nucleolus.spots, [N.group]),
      Object.assign(nameOf('n-env', 'nuclear envelope:<br>two membranes', N.rimPts.filter((p, i) => i % 10 === 0).map(p => inN(p)), [N.group]), { small: '<span class="nm__t">nuclear envelope</span>' })
    ], [...HUD(), document.getElementById('qHide')].filter(Boolean));
  }
  async function enter() {
    /* the first time, the nucleus is closed: the dive through one pore (below) */
    if (!state.flag('in-nucleus')) return dive();
    await fly(world.P.nucleus.view.pos, world.P.nucleus.view.at);
    const pore = W.pores.slice().sort((a, b) => a.distanceTo(world.camera.position) - b.distanceTo(world.camera.position))[0];
    const glowRing = keep(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 24), new THREE.MeshBasicMaterial({ color: 0xfff1a8 })));
    glowRing.position.copy(pore); glowRing.lookAt(N0);
    await press(() => pore.clone().add(V(0, 0.35, 0)), 'Enter through a nuclear pore', { side: 't' });
    drop(glowRing);
    const v = nucView(); await fly(v.pos, v.at, 2000);
    state.setFlag('in-nucleus');
    quest.say('You are inside the nucleus. The threads are the <b>chromosomes</b>.', 'ok');
    insideNames();
    await quest.next(); quest.names.set([]);
  }

  /* ---------------- the dive through a nuclear pore (8 Nov 2026) ----------------
     Daniel: "the first time you go in, it needs to be closed, and you need to go through a pore and then kind of travel
     through it and then reveal what's inside … really make it nice and incredible as you dive in, and then suddenly you
     enter through the doors of a pore. That needs to be magical. And then you see the inside." Until then the nucleus is
     closed (world.js setNucleus). Pressed, the camera dives in one move, with a scale bar, to one pore (cellbuild.js: the
     door), and every pore shrinks to its true size as it comes (120 nm across; the world draws them about twice as wide):
     there the pore is the real thing (pore.js: its three rings of proteins, its filaments, the soft threads in its
     channel, the basket), in the two membranes at their true thicknesses, and the camera stops while its names are read.
     Then it goes down the middle of the pore: the soft threads bend back before it, like doors, and close behind it; it
     passes the rings and the basket and comes out inside, where it is black; a light spreads from the pore through the
     nucleus and shows, as it reaches them, the chromosomes and the nucleolus. Only then is the nucleus opened (its front
     cut away, behind the camera, where it cannot be seen), and the camera moves back through the opening until the whole
     nucleus is seen, its parts named. After that it stays open: on the map and on every later visit ('in-nucleus'). */
  const DOOR = N.door, DV = { on: false, hidden: [], open: false };
  /* how far the camera drifts round the pore at its first stop (radians); the pore is built cut on the plane at this angle
     (pore.js), so that the cut faces the camera when it then stops beside the pore */
  const PORE_TURN = 0.35;
  let PD = null;
  /* the pore, built while the pupil reads (the place's first step), its shaders compiled in parallel as the world's are
     (world.js), so that the dive never waits for them; fetched only now (it is needed once) */
  function porePrep() {
    if (PD) return PD.ready;
    PD = { ready: null };
    PD.ready = import('../world/pore.js?v=202611120025').then(async m => {
      const P = await m.buildPore({ p0: DOOR.p, n0: DOOR.n, e1: DOOR.e1, e2: DOOR.e2, R: N.r, sy: N.sy, cut: PORE_TURN });
      P.group.matrixAutoUpdate = false;
      P.group.matrix.makeBasis(DOOR.e1, DOOR.n, DOOR.e2).scale(V(0.001, 0.001, 0.001)).setPosition(DOOR.p);
      P.group.visible = false; P.npc.visible = false; N.group.add(P.group); N.group.updateMatrixWorld(true);
      if (!R.TEST) {
        /* one mesh at a time, the page drawing between (all at once had stopped it for 0.3 s); with Reduce motion too (only
           the tests skip it): there the shaders had been made at the first frame of the pore, a stop of several seconds while
           its names' pause ran out, so they showed for 0.2 s */
        const r = world.renderer, meshes = [], waits = [];
        P.group.traverse(o => { if (o.isMesh) meshes.push(o); });
        for (const o of meshes) {
          r.setRenderTarget(world.glow ? world.composer.renderTarget1 : null);
          waits.push(r.compileAsync(o, world.camera, scene).catch(() => {})); r.setRenderTarget(null);
          await new Promise(res => setTimeout(res, 0));
        }
        await Promise.race([Promise.all(waits), new Promise(res => setTimeout(res, 6000))]);
        warmDraw(P);
      }
      return Object.assign(PD, P, { M: m.NPC });
    }).catch(e => { PD = null; throw e; });                 /* fetched again next time */
    return PD.ready;
  }
  /* the pore, the inside of the nucleus and the open nucleus drawn once, out of sight, into a small picture, while the pupil
     reads: every mesh's data goes to the graphics chip now, not at a frame of the dive (9 Nov 2026, Daniel: "make sure that
     you optimize it so everything is pre-stored or buffered, so the movement of the camera is smooth"; at CPU ×6 the press,
     the moment the real pore appears and the opening of the nucleus had each stopped the picture about 0.1 s). Only with
     the glow on: its shaders are the ones compiled; nothing of this reaches the screen */
  function warmDraw(P) {
    if (!world.glow) return;
    const r = world.renderer, rt = new THREE.WebGLRenderTarget(64, 64, { type: world.composer.renderTarget1.texture.type });
    const vis = [], cull = [], show = o => { if (o) { vis.push([o, o.visible]); o.visible = true; } };
    [P.group, P.npc, N.chromatin, N.nucleolus, N.nolSpark, N.rim].forEach(show);
    P.group.traverse(o => { if (o.isMesh || o.isPoints || o.isLine) { cull.push([o, o.frustumCulled]); o.frustumCulled = false; } });
    const geo = [N.outerEnv.geometry, N.innerEnv.geometry];
    try {
      r.setRenderTarget(rt); r.render(scene, world.camera);
      N.outerEnv.geometry = N.outerEnv.userData.geo.cut; N.innerEnv.geometry = N.innerEnv.userData.geo.cut;
      r.render(scene, world.camera);
    } catch (e) { /* a picture never drawn here is drawn at its first frame, as before */ }
    N.outerEnv.geometry = geo[0]; N.innerEnv.geometry = geo[1];
    r.setRenderTarget(null); rt.dispose();
    vis.forEach(([o, v]) => { o.visible = v; }); cull.forEach(([o, c]) => { o.frustumCulled = c; });
  }
  /* the pore is kept after the dive, for ↺ the dive again, and let go when the pupil leaves the place */
  function poreFree() {
    if (PD && PD.dispose) { PD.dispose(); N.group.remove(PD.group); }
    PD = null;
  }
  /* the pore's own frame (nm, pore.js) and the world */
  const pw = (x, y, z) => PD.group.localToWorld(V(x, y, z));
  const pd = (x, y, z) => V(x, y, z).transformDirection(PD.group.matrixWorld);
  const doorDot = new THREE.Matrix4();
  /* the dive's pore among the world's pores: hidden while the real one is drawn */
  function doorShown(on) {
    const F = N.poresFront; if (!DV.m0) { DV.m0 = new THREE.Matrix4(); F.getMatrixAt(0, DV.m0); }
    F.setMatrixAt(0, on ? DV.m0 : doorDot.makeScale(0, 0, 0)); F.instanceMatrix.needsUpdate = true;
  }
  /* close in, the rest of the cell is behind the camera or hidden by the envelope: it is not drawn */
  function diveDeep(on) {
    if (on && !DV.hidden.length) Object.entries(W.groups).forEach(([k, g]) => { if (k !== 'nucleus' && g.visible) { g.visible = false; DV.hidden.push(g); } });
    else if (!on) DV.hidden.splice(0).forEach(g => { g.visible = true; });
  }
  /* the nucleus as it was before the dive (a pupil who leaves half-way): closed, every pore at the world's size, no hole */
  function diveOff() {
    if (!DV.on) return; DV.on = false;
    diveDeep(false); N.PK.uPoreK.value = 1; N.REV.uRevK.value = 0; N.REV.uRevR.value = 0; N.HOLE.uHoleR.value = 0;
    if (PD && PD.group) { PD.group.visible = false; PD.npc.visible = false; }
    DOOR.torus.visible = false;
    if (!DV.open) {
      doorShown(true); world.nucDive = false; world.nucLook();
      /* a pupil who leaves from inside the closed nucleus goes back out at once (the flight to the map would cross it) */
      const nv = world.P.nucleus.view, inside = world.camera.position.clone().sub(N0).multiply(V(1, 1 / N.sy, 1)).length() < N.r + 0.05;
      if (inside || world.camera.position.distanceTo(doorW()) < 1.2) { world.camera.position.fromArray(nv.pos); world.controls.target.fromArray(nv.at); world.camera.lookAt(world.controls.target); }
      /* left during ↺ the dive again: the nucleus open again, as the saved game says */
      if (state.flag('in-nucleus')) world.setNucleus(true);
    }
    N.nolSpark.material.uniforms.uOpacity.value = DV.spark0 != null ? DV.spark0 : N.nolSpark.material.uniforms.uOpacity.value;
    if (bar) bar.hidden = true;
    world.camera.up.set(0, 1, 0); world.nearFar(10);
  }
  const doorW = () => N.group.localToWorld(DOOR.p.clone());
  /* one move of the camera, frame by frame: f(k) sets it for k 0 … 1 (ms long; at once with ?still=1) */
  const moveCam = (ms, f) => live(new Promise(res => {
    const s0 = quest.session, t0 = performance.now();
    const step = () => {
      if (quest.session !== s0) return res();
      const k = R.FAST || !ms ? 1 : Math.min(1, (performance.now() - t0) / ms);
      f(k); world.kick();
      if (k < 1) requestAnimationFrame(step); else res();
    };
    step();
  }));
  const setCam = (pos, at, d) => { const cam = world.camera; cam.position.copy(pos); world.controls.target.copy(at); cam.lookAt(at); world.nearFar(d); scaleBar(d); };
  /* names on the pore, while the camera stops there: the pore (its cytoplasmic ring) and the net of soft protein threads
     in its channel (its line ends in the channel, between the filaments); one level line each, ending on its part; on a
     phone each stands on its part (the net beside it), never on the Hide text button. The pore's own frame: x is the
     screen's right, z its down. "Protein net", not "threads": the chromosomes are the threads of this place (the expert
     review) */
  const HUDN = () => [...HUD2(), document.getElementById('qHide')].filter(Boolean);
  const oneName = (key, html, spots, o = {}) => Object.assign({ key, free: true, html: `<span class="nm__t">${html}</span>`, spots: spots.map(p => pw(p.x, p.y, p.z)) }, o);
  function poreNames() {
    const P = PD.pts, phone = world.size.w < 640;
    /* the ring's points 50 nm from the axis, in its band of proteins (at 60 nm, its outer edge, a line had ended short of
       the ring: the expert review) */
    const ringPt = k => V(50 * Math.cos(k), 9, 50 * Math.sin(k));
    if (phone) {
      /* a phone: "nuclear pore" above the pore, its line down onto the ring; "protein net" below it, its line up across the
         ring onto the net, long enough for the name to stand clear of the ring and of the filaments that hang below it (the
         names had stood on the pore, and "protein net" read as the ring: the expert review). Which side of the ring is at
         the top of the picture depends on where the pore is on the nucleus, so the points are chosen on the screen: the
         net's lowest, and the ring's highest of those at least 26 px to the side of it (straight above, the two lines had
         met in one line through the pore); each line long enough for its name to stand clear of the whole pore */
      const Nm = quest.names, sc = v => Nm.proj(pw(v.x, v.y, v.z)), sy = v => sc(v).y, round = n => [...Array(n)].map((_, i) => i * 2 * Math.PI / n);
      const low = round(8).map(k => P.thread(k, 14)).sort((a, b) => sy(b) - sy(a)).slice(0, 3), xn = sc(low[0]).x;
      const top = round(24).map(ringPt).filter(v => Math.abs(sc(v).x - xn) >= 26).sort((a, b) => sy(a) - sy(b)).slice(0, 4);
      const edge = round(16).flatMap(k => [V(64 * Math.cos(k), 9, 64 * Math.sin(k)), V(64 * Math.cos(k), -6, 64 * Math.sin(k)), V(52 * Math.cos(k), PD.M.tips, 52 * Math.sin(k))]).map(sy);
      const above = Math.min(...edge), below = Math.max(...edge);
      const lenT = Math.max(22, Math.round(sy(top[0]) - above + 10)), len = Math.max(22, Math.round(below - sy(low[0]) + 10));
      quest.names.set([
        oneName('d-pore', 'nuclear pore', top, { up: -1, len: lenT }),
        oneName('d-fg', 'protein net', low, { up: 1, len })
      ], HUDN(), lr(pw(-98, 0, 0), pw(98, 0, 0)));
      return;
    }
    const ringL = [Math.PI - 0.6, Math.PI - 0.35, Math.PI + 0.35, Math.PI + 0.6], netL = [Math.PI - 0.12, Math.PI, Math.PI + 0.12];
    quest.names.set([
      oneName('d-pore', 'nuclear pore', ringL.map(ringPt)),
      oneName('d-fg', 'protein net', netL.map(k => P.thread(k, 12)), { aside: true })
    ], HUDN(), lr(pw(-98, 0, 0), pw(98, 0, 0)));
  }
  /* the envelope in section, beside the pore (the second stop): the outer membrane named from above, in the cytoplasm, the
     inner membrane from below, in the nucleus, each with one upright line that ends on its membrane, and the space between
     them named inside it: no name covers a membrane, and both membranes and the space stay seen (names.js up; the names had
     stood on the membranes, beside the pore, and hidden them). Each stands where the membranes are flat, clear of the pore
     and its filaments (more than 74 nm from the axis): on the right of the picture first (side -1), else on the left */
  const cutFrame = () => lr(pw(...PD.pts.cut(250, PD.M.mid, 1).toArray()), pw(...PD.pts.cut(250, PD.M.mid, -1).toArray()));
  function cutNames() {
    const P = PD.pts, NP = PD.M, rs = world.size.w < 640 ? [118, 106, 130, 142] : [125, 150, 175, 100];
    const on = h => [-1, 1].flatMap(side => rs.map(r => P.cut(r, h, side)));
    quest.names.set([
      oneName('d-om', 'outer membrane', on(NP.out - NP.mem / 2), { up: -1 }),
      oneName('d-gap', 'space between the membranes', on(NP.mid), { small: '<span class="nm__t">space between<br>the membranes</span>', cls: 'nm--in' }),
      oneName('d-im', 'inner membrane', on(NP.in + NP.mem / 2), { up: 1 })
    ], HUDN(), cutFrame());
  }
  /* again: ↺ the dive again (Daniel, 9 Nov 2026: "once you have seen the animation, there's no way to re-see the
     animation … a little button to re-enter into the nucleus with the same animation"), right after the dive (beside Next)
     or from the place's end card: the nucleus closed again, the same dive from the nucleus's view without the press, and
     open again at the end; the saved game is unchanged */
  async function dive(again = false) {
    if (again) { world.setNucleus(false); doorShown(true); quest.names.set([]); }
    await fly(world.P.nucleus.view.pos, world.P.nucleus.view.at);
    const ready = porePrep();
    const P0 = doorW();
    if (!again) {
    const glowRing = keep(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 24), new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true })));
    glowRing.position.copy(P0); glowRing.lookAt(P0.clone().add(DOOR.n));
    await press(() => P0.clone().add(V(0, 0.35, 0)), 'Enter through a nuclear pore', { side: 't' });
    /* the ring that marked the pore fades (it had gone in one frame) */
    { const t0 = performance.now(); W.anim.push(function f() { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 350); glowRing.material.opacity = 1 - k; if (k >= 1) { W.anim.splice(W.anim.indexOf(f), 1); drop(glowRing); } }); }
    /* the pore is usually ready long before the press; if not, the wait is said only after 0.4 s */
    }
    const slow = setTimeout(() => quest.say('Getting the nuclear pore ready…'), R.FAST ? 1e9 : 400);
    /* the pore could not be fetched (no connection): the pupil goes in as on a later visit, never stuck */
    let got = null; try { got = await live(ready); } catch (e) { if (e === STALE) throw e; }
    clearTimeout(slow); quest.say('');
    if (!got) {
      world.setNucleus(true); state.setFlag('in-nucleus');
      const v = nucView(); await fly(v.pos, v.at, 2000);
      if (again) { insideNames(); return; }
      quest.say('You are inside the nucleus. The threads are the <b>chromosomes</b>.', 'ok');
      insideNames(); await quest.next(); quest.names.set([]); return;
    }
    const cam = world.camera, c = world.controls, NP = PD.M, TRUEK = 0.513, T0 = DOOR.torus;
    DV.on = true; DV.open = false; DV.hidden = [];
    world.flying = true; c.enabled = false; world.setMoving(true); quest.names.set([]);
    /* the inside is drawn from now on, black until the light reaches it (looking into the pore shows only the pore); the
       hole opens, filled by the pore's own patch */
    world.nucDive = true; world.nucLook();
    N.REV.uRevK.value = 1; N.REV.uRevR.value = 0;
    /* the nucleolus wakes once the pupil is in: its sleeping look (a grey mist round it) is not drawn in here (looks() in
       main.js sets it from the saved game when the place ends) */
    world.setPlace('nucleolus', 'open', { instant: true });
    N.HOLE.uHoleP.value.copy(DOOR.p); N.HOLE.uHoleN.value.copy(DOOR.n); N.HOLE.uHoleR.value = NP.patch / 1000;
    /* the world's ring of this pore (a see-through copy of it) stays until the real pore, the same size, is big enough to be
       read (about 40 pixels), then fades over it (the expert review: a dull speck had replaced the pore just chosen) */
    doorShown(false); T0.visible = true; T0.material.opacity = 1;
    PD.group.visible = true; PD.npc.visible = false; PD.npc.scale.setScalar(1 / TRUEK); PD.glow(1); PD.setLid(0);
    /* for tools/pore-dive.mjs: how much of the near half is taken away, and the near side's direction */
    DOOR.lid = PD.lid; DOOR.nearW = pd(PD.nearDir.x, PD.nearDir.y, PD.nearDir.z);
    DOOR.cutPt = (r, h, side) => pw(...PD.pts.cut(r, h, side).toArray());   /* a point of the cut, in the world (the tool checks that no name covers a membrane) */
    const spark = N.nolSpark.material.uniforms.uOpacity; DV.spark0 = DV.spark0 != null ? DV.spark0 : spark.value; spark.value = 0;
    PD.sway.forEach(u => { u.uOpen.value = 0; u.uCamY.value = 400; });
    /* 1. the dive to the pore: the distance falls by the same factor each moment (camGo), every pore shrinks to its true
       size (0.513 of the world's; the real pore with them), and the real pore's colours deepen as it comes close */
    const at0 = c.target.clone(), off0 = cam.position.clone().sub(at0), d0 = off0.length(), dir0 = off0.normalize();
    const AL = 0.5, LH = 480;         /* the stop: 480 nm from the pore, 29° from its axis (room for its names) */
    const PHI = PORE_TURN, turn = (p, f) => [p[0] * Math.cos(f) - p[2] * Math.sin(f), p[1], p[0] * Math.sin(f) + p[2] * Math.cos(f)];
    const phone = world.size.w < 640, D2 = phone ? 330 : 400, C1y = -10, C2y = NP.mid, Y0 = 70;
    const nW = pd(0, 1, 0), worldUp = V(0, 1, 0);
    /* a place round the pore: th from its axis, r from the point (0, cy, 0) on it, on the camera's side turned by f; and the
       camera's up there (beside the pore the axis then points up the picture) */
    const orbit = (th, r, cy, f) => {
      const side = turn([0, 0, -1], f), c = Math.cos(th), s = Math.sin(th);
      return { pos: turn([0, cy + r * c, -r * s], f), at: [0, cy, 0], up: nW.clone().multiplyScalar(s).addScaledVector(pd(...side), -c).normalize() };
    };
    /* on a phone the camera also moves, and the point it looks at with it, so that the names have room (nm, along the
       picture's right and up): at the first stop up, so that the pore stands lower, its names above and below it, clear of
       the buttons; beside the pore right and up, so that the pore stands on the left and the names of the section on the
       right, where the membranes are flat. The first along the picture's up there (the world's up), the second along the
       pore's axis (the picture's up beside the pore) */
    const PAN1 = phone ? [0, 36] : [0, 0], PAN2 = phone ? [62, 30] : [0, 0];
    const panAt = (pos, at, pan, up) => {
      if (!pan[0] && !pan[1]) return V(0, 0, 0);
      const v = at.clone().sub(pos).normalize(), u = up.clone().addScaledVector(v, -up.dot(v)).normalize(), rt = v.clone().cross(u).normalize();
      return rt.multiplyScalar(pan[0] / 1000).addScaledVector(u, pan[1] / 1000);
    };
    /* a view of the way round, with k1 of the first stop's move and k2 of the second's */
    const view = (th, r, cy, f, k1, k2) => {
      const o = orbit(th, r, cy, f), P = pw(...o.pos), A = pw(...o.at), off = V(0, 0, 0);
      if (k1) off.addScaledVector(panAt(P, A, PAN1, worldUp), k1);
      if (k2) off.addScaledVector(panAt(P, A, PAN2, o.up), k2);
      return { P: P.add(off), A: A.add(off), up: o.up };
    };
    const atH = view(AL, LH, C1y, 0, 1, 0).A, dirH = pd(0, Math.cos(AL), -Math.sin(AL)), dH = LH / 1000;
    await moveCam(4600, k => {
      const e = k * k * (3 - 2 * k), d = d0 * Math.pow(dH / d0, e), g = (d0 - d) / (d0 - dH);
      const pk = 1 - (1 - TRUEK) * smooth(0.04, 0.55, e); N.PK.uPoreK.value = pk; PD.npc.scale.setScalar(pk / TRUEK);
      PD.npc.visible = d < 3.3; T0.material.opacity = smooth(2.3, 3.1, d); T0.visible = T0.material.opacity > 0.004;
      if (d < 0.6) diveDeep(true);
      PD.glow(smooth(1.0, 3.0, d));
      setCam(at0.clone().lerp(atH, g).addScaledVector(dir0.clone().lerp(dirH, smooth(0, 0.8, e)).normalize(), d), at0.clone().lerp(atH, g), d);
    });
    T0.visible = false; PD.npc.visible = true; PD.npc.scale.setScalar(1); N.PK.uPoreK.value = TRUEK; diveDeep(true); PD.glow(0);
    /* 2. it stops: the pore and the net of protein threads in its middle are named, and stay while the names are read
       (memory animations-wait-for-the-reader: 0.5 s, 0.3 s for each other name, 1 s for every 4 words), the camera
       drifting round the pore (PORE_TURN, 20°), so that it is seen in depth: the filaments reach out */
    world.setMoving(false); poreNames();
    await moveCam(R.FAST ? 0 : 3600, k => { const v = view(AL, LH, C1y, PHI * smooth(0, 1, k), 1, 0); setCam(v.P, v.A, LH / 1000); });
    if (R.CALM) await wait(3600);          /* Reduce motion: no drift, but the names stay as long */
    /* the names go where they are (their frame kept: without it they had slid to the picture's edges) */
    quest.names.set([], HUDN(), lr(pw(-98, 0, 0), pw(98, 0, 0))); world.setMoving(true);
    /* 3. beside it, the envelope in section (Daniel, 8 Nov 2026: "you clearly see that there is a space between the inner
       membrane and the outer membrane … think how to do that properly. And take your time"): the camera goes slowly round
       and down to the side of the pore, level with the middle of the envelope, while the near half of the pore (pore.js: the
       lid) is taken away. Then the cut, which faces it, shows the outer membrane, the space between the two membranes and
       the inner membrane, each membrane two rows of lipids, the two joined round the pore; they are named and stay while they
       are read. On the way round the picture turns, so that at the side the cytoplasm is at the top and the nucleus at the
       bottom, as a textbook draws the envelope: the camera's up is then the pore's axis (its up along the way round: the way
       the camera would go next, round the pore) */
    /* the camera stops 20 nm above the outer membrane, looking a little down into the cut: the space between the membranes
       then shows its floor (level with the envelope's middle it had looked along the space, past the patch, onto the
       world's envelope seen from inside, black until the light), and it never goes into the nucleus beside the pore */
    const TH2 = Math.acos((20 - C2y) / D2);
    await moveCam(R.FAST ? 0 : 4400, k => {
      const e = k * k * (3 - 2 * k), r = LH + (D2 - LH) * e, v = view(AL + (TH2 - AL) * e, r, C1y + (C2y - C1y) * e, PHI, 1 - e, e);
      cam.up.copy(worldUp).lerp(v.up, smooth(0, 0.45, k)).normalize();
      setCam(v.P, v.A, r / 1000);
      PD.setLid(smooth(0.3, 0.75, k));
    });
    PD.setLid(1);
    world.setMoving(false); cutNames();
    const PHI2 = 0.12;          /* while the names are read the camera drifts a little further round: the cut seen in depth */
    await moveCam(R.FAST ? 0 : 6400, k => { const v = view(TH2, D2, C2y, PHI + PHI2 * smooth(0, 1, k), 0, 1); cam.up.copy(v.up); setCam(v.P, v.A, D2 / 1000); });
    if (R.CALM) await wait(6400);
    quest.names.set([], HUDN(), cutFrame()); world.setMoving(true);
    /* 4. the nucleus whole again first: beside the pore the camera moves a little back and up while the near half comes
       back, so that the cut is covered again before the camera goes over the pore (Daniel, 9 Nov 2026: "make sure that
       transition is smooth by basically covering again the nucleus and then getting again inside the hole") */
    const F2 = PHI + PHI2, D3 = D2 * 1.12, TH3 = TH2 - 0.1;
    await moveCam(R.FAST ? 0 : 2400, k => {
      const e = k * k * (3 - 2 * k), r = D2 + (D3 - D2) * e, v = view(TH2 + (TH3 - TH2) * e, r, C2y, F2, 0, 1);
      cam.up.copy(v.up); setCam(v.P, v.A, r / 1000);
      PD.setLid(1 - smooth(0.05, 0.85, k));
    });
    PD.setLid(0);
    /* then over the pore onto its axis, looking down its middle */
    await moveCam(R.FAST ? 0 : 3400, k => {
      const e = k * k * (3 - 2 * k), r = D3 + (Y0 - C2y - D3) * e, v = view(TH3 * (1 - e), r, C2y, F2, 0, 1 - e);
      cam.up.copy(v.up); setCam(v.P, v.A, r / 1000);
    });
    const downUp = orbit(0, 1, C2y, F2).up;          /* the camera's up while it looks down the axis */
    /* 5. through: down the middle of the pore, slowly through its protein net (Daniel: "The speed as you go through the pore
       should be nice and slow, beautiful"), whose soft threads bend back before the camera and close behind it; then, once
       past the net, quickly through the rest of the channel, the basket and past its small ring (Daniel, 9 Nov 2026: it had
       spent "too much time going through the hole at the end"), into the nucleus, where it is black. It looks down the
       axis, L nm ahead: the envelope's middle from above the pore, 45 nm ahead in it, and past the basket 1.2 µm deep, where
       the inside is. About 3 s above the pore, 3.6 s through the net (y 10 to -45: its threads part only just ahead of
       the camera, pore.js swaying, so that the net fills the view until the camera reaches it; parting 22 nm ahead, they had
       opened a clear tunnel, and the basket's ring had filled the view for seconds), then 1 s to the channel's end, through
       the basket and past its ring */
    const Y1 = -150, Lof = y => 45 + (Y0 - C2y - 45) * smooth(10, Y0, y) + 1155 * smooth(-140, Y1, y);
    const NS = 400, ys = [], ts = [0];
    for (let i = 0; i <= NS; i++) ys.push(Y0 + (Y1 - Y0) * i / NS);
    const pace = y => (0.3 + 0.7 * smooth(Y0, Y0 - 35, y) * smooth(Y1, Y1 + 16, y)) * (1 - 0.65 * Math.exp(-Math.pow((y + 15) / 26, 2))) * (1 + 3 * smooth(-40, -54, y));
    for (let i = 1; i <= NS; i++) ts.push(ts[i - 1] + Math.abs(ys[i] - ys[i - 1]) / pace((ys[i] + ys[i - 1]) / 2));
    const T = ts[NS], yAt = k => { const t = k * T; let i = 1; while (i < NS && ts[i] < t) i++; const f = (t - ts[i - 1]) / Math.max(1e-9, ts[i] - ts[i - 1]); return ys[i - 1] + (ys[i] - ys[i - 1]) * f; };
    await moveCam(R.FAST ? 0 : 7600, k => {
      const y = yAt(k), L = Lof(y);
      PD.sway.forEach(u => { u.uCamY.value = y; u.uOpen.value = smooth(170, 70, y); });
      cam.up.copy(downUp); setCam(pw(0, y, 0), pw(0, y - L, 0), L / 1000);
      /* inside the pore no scale bar: it measures L nm ahead, and the rings close by read wrong against it (the expert review) */
      if (bar) bar.hidden = y < 12;
    });
    /* 6. in the dark, out of the basket, the camera turns to look the way the whole nucleus will be seen, upright, before
       anything is lit (Daniel, 9 Nov 2026: "things appear, but the camera twists … things do not appear cleanly": it had
       turned while the inside appeared). The pore is put away first and the hole it filled closed (both behind the camera):
       through the hole, the turn had shown shapes outside the nucleus, dimly */
    PD.group.visible = false; N.HOLE.uHoleR.value = 0; doorShown(true);
    const v = nucView(), P1 = cam.position.clone(), dirF = v.at.clone().sub(v.pos).normalize(), d2 = v.pos.distanceTo(v.at);
    const qa = cam.quaternion.clone(), qb = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(P1, P1.clone().add(dirF), V(0, 1, 0)));
    const fwd = new THREE.Vector3(), upv = new THREE.Vector3(), q = new THREE.Quaternion();
    await moveCam(R.FAST ? 0 : 500, k => {
      q.copy(qa).slerp(qb, k * k * (3 - 2 * k)); fwd.set(0, 0, -1).applyQuaternion(q); upv.set(0, 1, 0).applyQuaternion(q);
      cam.up.copy(upv); setCam(P1, P1.clone().addScaledVector(fwd, 1.2), 1.2); if (bar) bar.hidden = true;
    });
    cam.up.set(0, 1, 0);
    /* then the nucleus is opened behind the camera (nothing of the opening can be seen from here), every pore grows back to
       the world's size, and a light spreads from the pore through the nucleus, about 1 µm a second, then faster: the
       threads near the camera light first, the nucleolus over about a second (the expert review: it had flashed, a large
       cream shape, in 4 frames). Meanwhile the camera moves straight back, without turning, out through the opening until
       the whole nucleus is seen */
    DV.open = true;
    world.nucDive = false; world.setNucleus(true); state.setFlag('in-nucleus');
    const C = pw(0, -150, 0), nolD = C.distanceTo(inN(N.nucleolus.position)), lt0 = performance.now();
    const lightR = () => R.FAST ? 8 : (t => 0.55 * smooth(0, 0.25, t) + 1.1 * t + 0.15 * t * t)((performance.now() - lt0) / 1000);
    N.REV.uRevC.value.copy(C); sound.wake();
    let lr0 = 0;
    await moveCam(4800, k => {
      /* slow at first, while the light shows what is near; then out to the whole view */
      const e = k * k * k * (k * (6 * k - 15) + 10), pos = P1.clone().lerp(v.pos, e), dn = 1.2 + (d2 - 1.2) * e;
      N.PK.uPoreK.value = TRUEK + (1 - TRUEK) * smooth(0.1, 0.9, e);
      lr0 = Math.max(lr0, lightR(), k >= 1 ? 8 : 0); N.REV.uRevR.value = lr0;
      spark.value = DV.spark0 * smooth(nolD - 0.3, nolD + 0.6, lr0);
      setCam(pos, pos.clone().addScaledVector(dirF, dn), dn); if (bar) bar.hidden = true;
      /* the rest of the cell comes back once the camera is out of the nucleus (the cytosol's lights are not drawn inside it) */
      if (DV.hidden.length && cam.position.clone().sub(N0).multiply(V(1, 1 / N.sy, 1)).length() > N.r + 0.02) diveDeep(false);
    });
    setCam(v.pos, v.at, d2);
    diveDeep(false); cam.up.set(0, 1, 0);
    N.PK.uPoreK.value = 1; N.REV.uRevK.value = 0; spark.value = DV.spark0; if (bar) bar.hidden = true;
    DV.on = false;
    await live(world.landed({ pos: cam.position.toArray(), at: c.target.toArray() }, false));
    if (again) { insideNames(); return; }
    quest.say('<p>You entered the nucleus through a <b>nuclear pore</b>.</p><p>A pore is about 120&nbsp;nanometres (nm) across. If the cell were a football pitch, a pore would be nearly as wide as a door.</p><ul><li>Small molecules pass freely through the protein net in a pore.</li><li>A large molecule passes only together with a carrier protein.</li></ul><p>Now the front of the nucleus is removed, so that you can see inside: the threads are the <b>chromosomes</b>.</p><p class="say__aside">The game draws the pores and the chromosomes larger than they are.</p>', 'ok');
    insideNames();
    /* Next, or ↺ the dive again (as often as wanted; the message stays) */
    for (;;) {
      const nx = quest.next(), ab = R.h('button', { type: 'button', class: 'btn ghost again' }, '↺ Watch the dive again');
      quest.step.do.appendChild(ab);
      const pick = await live(Promise.race([nx.then(() => 'next'), new Promise(r => ab.addEventListener('click', () => r('again'), { once: true }))]));
      ab.remove();
      if (pick === 'next') break;
      const nb = quest.step.do.querySelector('.btn.next'); if (nb) nb.remove();
      await dive(true);
    }
    quest.names.set([]);
  }
  /* ↺ the dive again from the nucleus's end card (quest.js): only in the nucleus, once the pupil has been in, and not while
     a dive plays */
  document.addEventListener('dive-again', e => {
    const b = e.detail && e.detail.btn;
    if (quest.cur !== 'nucleus' || DV.on || !state.flag('in-nucleus')) return;
    if (b) b.disabled = true;
    /* on a phone the end card is below the picture: the picture first comes into view */
    const st = document.getElementById('stage'); if (st && st.getBoundingClientRect().top < 0) st.scrollIntoView({ block: 'start', behavior: R.FAST ? 'auto' : 'smooth' });
    dive(true).catch(err => { if (err !== STALE) throw err; }).finally(() => { if (b) b.disabled = false; });
  });
  function chr1Mat() { const m = W.chromosomes[0].mesh.material; if (!props.chrDim) { props.chrDim = m.color.getHex(); m.color.setHex(0xb9a6ff); m.emissive.setHex(0x2a1f6a); } return m; }
  /* a thread pressed lights up along its whole length (Daniel, 9 Nov 2026: "As you click on the different chromosomes,
     it'd be nice if you could lit up the different chromosomes, so they actually, the students understand what a
     chromosome is … they're just clicking a label. They don't actually see what a chromosome is, and the idea is to see
     that the long tubes are the chromosomes"): a glowing sleeve, a little wider than the thread, grows along it from one
     end to the other at the same speed on every thread (so the longest takes longest), the light running round all its
     coils; it stays lit while its name is read, brighter than white (so that it glows), and the other threads are dimmed
     meanwhile, so that it stands out whole. Drawn after the see-through parts of the nucleus (renderOrder, as the copy's
     ribbon), its mesh built in the world's frame */
  let chrSaved = null;                                 /* the dimmed threads' own colours, put back by chrUndim (and reset) */
  function chrUndim() { if (!chrSaved) return; chrSaved.forEach(([m, c, e]) => { m.color.copy(c); m.emissiveIntensity = e; }); chrSaved = null; }
  function chrDim(except) {
    chrUndim();
    chrSaved = W.chromosomes.filter(c => c !== except).map(c => { const m = c.mesh.material; return [m, m.color.clone(), m.emissiveIntensity]; });
    chrSaved.forEach(([m]) => { m.color.multiplyScalar(0.45); m.emissiveIntensity *= 0.4; });
  }
  function lightThread(ch, color, glow) {
    const n = ch.curve.points.length, pts = [];
    for (let i = 0; i <= n * 2; i++) pts.push(inN(ch.curve.getPointAt(i / (n * 2))));
    const segs = n * 3, geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segs, ch.mesh.geometry.parameters.radius * 1.4, 8, false);
    const m = keep(new THREE.Mesh(geo, magicStandard({ color, emissive: color, emissiveIntensity: glow, roughness: 0.35, transparent: true, opacity: 1 }, { rim: 0xe8fbff, rimK: 0.45 })));
    m.renderOrder = 6; m.name = 'lit-chr' + ch.n;
    chrDim(ch);
    const per = 8 * 6, ms = n * 11, t0 = performance.now();
    geo.setDrawRange(0, 0);
    m.userData.done = live(new Promise(res => {
      const f = () => {
        if (!m.parent) return res();
        const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms);
        geo.setDrawRange(0, Math.round(segs * k) * per); world.kick();
        if (k < 1) requestAnimationFrame(f); else res();
      };
      f();
    }));
    return m;
  }
  const unlight = m => { if (!m) return; drop(m); m.geometry.dispose(); m.material.dispose(); chrUndim(); };
  async function findchr() {
    const v = nucView(); if (world.camera.position.distanceTo(v.pos) > 0.5) await fly(v.pos, v.at);
    chr1Mat();
    /* the threads with a button: chromosome 1 and the four seen best from the nucleus's view, spread round the picture
       (measured at a laptop, a large screen and a phone, the same: of each thread's length, the part in the picture and in
       front of the nucleolus and of every other thread, 0: 88 %, 2: 93-96 %, 9: 83-99 %, 12: 93 %, 8: 79 %; the threads
       pressed before, 3, 6, 9 and 12, had been 64 %, 28 %, 99 % and 93 %, so that two of them, lit, hardly showed) */
    const picks = [0, 2, 9, 12, 8].map(i => W.chromosomes[i]).filter(Boolean);
    const OTHER = [7, 14, 21, 11];                     /* each other chromosome shown has its own number */
    let lit = null, named = null;                      /* the thread lit now and its button: one at a time (the one before
                                                          goes dark and its name goes, so the buttons left are those not
                                                          yet tried, and no name stands on a lit thread) */
    const s0 = quest.session;
    await new Promise(done => {
      picks.forEach((ch, pi) => {
        const at = () => inN(ch.curve.getPointAt(0.5)).add(V(0, 0.18, 0));
        const b = quest.hot(at, '?', { cls: 'q3', aria: 'a chromosome', right: ch.n === 1 });
        b.done.then(async () => {
          if (quest.session !== s0) return;
          unlight(lit); lit = null;
          if (ch.n === 1) {
            quest.clearHots();
            quest.say('This whole thread is <b>chromosome 1</b>: the largest kind of chromosome. (There are two of each kind: one from each parent.)', 'ok');
            /* the light runs along it in gold; then the thread itself is gold and the light fades from it */
            const m = lightThread(ch, 0xffc04a, 0.22);
            try { await m.userData.done; } catch (e) { return; }
            ch.mesh.material.color.setHex(0xffcf6b); ch.mesh.material.emissive.setHex(0x7a4a00);
            burst(scene, inN(ch.curve.getPointAt(0.5)), { n: 40, r: 0.5 });
            const t0 = performance.now();
            W.anim.push(function f() { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 700); m.material.opacity = 1 - k; if (k >= 1 || !m.parent) { W.anim.splice(W.anim.indexOf(f), 1); unlight(m); } });
            done();
          } else {
            const k = OTHER[(pi - 1) % OTHER.length];
            if (named) named.remove();
            b.el.querySelector('span').textContent = 'chromosome ' + k; b.el.disabled = true; b.el.classList.add('no');
            quest.say(`This whole thread is chromosome ${k}. Find chromosome 1, the largest kind.`);
            lit = lightThread(ch, 0x10b8ff, 0.5); named = b;
            /* its name moves above the thread, so that it covers none of it; below it when the space above is under the box
               at the top left (on a phone a thread near the top of the picture had been hidden by the box and its name) */
            const P = ch.curve.points, above = inN(P.reduce((a, p) => p.y > a.y ? p : a)).add(V(0, 0.3, 0)), below = inN(P.reduce((a, p) => p.y < a.y ? p : a)).add(V(0, -0.3, 0));
            const cr = world.canvas.getBoundingClientRect(), sa = world.project(above), ax = cr.left + sa.x, ay = cr.top + sa.y;
            const boxed = HUD2().some(e => { const r = e.getBoundingClientRect(); return r.width > 0 && ax > r.left - 60 && ax < r.right + 60 && ay > r.top - 30 && ay < r.bottom + 40; });
            const spot = boxed ? below : above;
            b.at = () => spot;
          }
        });
      });
    });
  }
  function gene() {
    if (props.gene) return props.gene;
    const ch = W.chromosomes[0], pts = [];
    for (let i = 0; i <= 20; i++) pts.push(inN(ch.curve.getPointAt(0.46 + i * 0.004)));
    const curve = new THREE.CatmullRomCurve3(pts);
    const m = keep(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.075, 8, false), new THREE.MeshBasicMaterial({ color: 0xfff1a8 })));
    W.anim.push(function f(t) { if (!m.parent) { W.anim.splice(W.anim.indexOf(f), 1); return; } m.material.color.setHSL(0.13, 1, 0.65 + 0.2 * Math.sin(t * 4)); });
    return (props.gene = { curve, mesh: m });
  }
  async function findgene() {
    chr1Mat(); W.chromosomes[0].mesh.material.color.setHex(0xffcf6b);
    const g = gene();
    await press(() => g.curve.getPointAt(0.5).add(V(0, 0.2, 0)), 'the amylase gene', { side: 't' });
    quest.say('The amylase gene: the instructions for making amylase.', 'ok');
  }
  function copyCurve() {
    const g = gene(), pts = [];
    for (let i = 0; i <= 12; i++) pts.push(g.curve.getPointAt(i / 12).add(V(0.06, 0.12, 0.08)));
    return new THREE.CatmullRomCurve3(pts);
  }
  /* the copy (mRNA) at its true thickness, about 2 nm (10 Nov 2026, round 7; before, a thread 70 nm thick, about 35 times
     too thick): from the nucleus's view far too thin to see, so a soft glow round it shows where it is, as a ribosome or a
     vesicle on its way does. Both grow together; on its way out both slide through the pore together. Proof:
     tools/true-size.mjs H */
  function copyThread(curve, segs = 160) {
    const g = new THREE.Group(); g.userData.kind = 'mrna-copy';
    const th = ribbon(curve, { radius: 0.001, segs });
    /* the glow: soft dots along the thread, in the copy's own orange (a glowing tube had looked like chromosome 1) */
    const n = segs + 1, glow = glowPoints(n, 0.42), P = glow.geometry.attributes.position, C = glow.geometry.attributes.color, v = new THREE.Vector3();
    for (let i = 0; i < n; i++) { curve.getPointAt(i / segs, v); P.setXYZ(i, v.x, v.y, v.z); C.setXYZ(i, 1, 0.5, 0.12); }
    P.needsUpdate = true; C.needsUpdate = true; glow.renderOrder = 7; glow.userData.glow = true;
    g.add(th, glow);
    const per = 8 * 6;
    g.userData.grow = k => { th.userData.grow(k); glow.geometry.setDrawRange(0, Math.round(n * Math.min(1, k))); };
    /* a stretch of the thread, in segments: from a, n long */
    g.userData.range = (a, len) => { th.geometry.setDrawRange(a * per, len * per); glow.geometry.setDrawRange(a, len + 1); };
    g.userData.grow(0);
    return g;
  }
  /* the copy: one press (Copy) and it grows along the gene; or, beyond the Year 7 list, a film of how a cell copies a
     gene, step by step, which makes the copy too (transcribe.js; Daniel, 4 Nov 2026: "keep it simple … Unless you could
     add the option") */
  async function copy() {
    const g = gene();
    let film = false;
    for (;;) {
      const b = quest.hot(() => g.curve.getPointAt(0.5).add(V(0, 0.3, 0)), 'Copy', { side: 'c' });
      const ex = document.createElement('button'); ex.type = 'button'; ex.className = 'btn ghost explore'; ex.textContent = '🔬 Explorer: how a cell copies a gene';
      quest.step.do.appendChild(ex);
      const pick = await live(Promise.race([b.done.then(() => 'copy'), new Promise(r => ex.addEventListener('click', () => r('film'), { once: true }))]));
      b.remove(); ex.remove();
      if (quest.energy(COST.copy)) { film = pick === 'film'; break; }
      await wait(400);
    }
    const rib = keep(copyThread(copyCurve()));
    if (film) { await live(openCopyFilm()); rib.userData.grow(1); }
    else {
      const t0 = performance.now();
      await live(new Promise(r => { const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 2200); rib.userData.grow(k); if (k < 1) requestAnimationFrame(f); else r(); }; f(); }));
    }
    props.rib = rib;
    quest.say('The copy of the gene: <b>mRNA</b>. It is only about 2 nm thick: far too thin to see from here, so a glow shows where it is.', 'ok');
  }
  async function exportCopy() {
    let rib = props.rib; if (!rib) { rib = props.rib = keep(copyThread(copyCurve())); rib.userData.grow(1); }
    await quest.choose(['Through a nuclear pore', 'Straight through the two membranes of the nucleus', 'Send the DNA itself, not a copy'], 0, async (i) => {
      if (i === 1) {
        quest.say('The <b>nuclear envelope</b> is two membranes. A large molecule such as mRNA cannot pass through them: it leaves only through a <b>nuclear pore</b>.', 'no');
        const p0 = rib.position.clone(); await tween(rib, { to: p0.clone().addScaledVector(win.clone().negate(), 0.4), ms: 500 }); await tween(rib, { to: p0, ms: 400 });
      } else {
        quest.say('The <b>DNA</b> never leaves the nucleus. Only copies of its genes leave.', 'no');
        const m = W.chromosomes[0].mesh; const p0 = m.position.clone(); await tween(m, { to: p0.clone().add(V(0, 0.08, 0.06)), ms: 300 }); await tween(m, { to: p0, ms: 300 });
      }
    });
    quest.say('The copy leaves through a nuclear pore.', 'ok');
    /* the camera goes back out of the nucleus, far enough to see all of it, and the pore that the copy leaves by is ringed
       (Daniel, 4 Nov 2026: "make sure that the zoom is far away and that you actually see the … copy leave one of the
       pores"); the copy, a thread, slides along its own length to that pore, through it, and out into the cytoplasm */
    const far = world.P.nucleus.view, camAt = V(...far.pos);
    const pore = W.pores.slice().sort((a, b) => b.clone().sub(N0).normalize().dot(camAt.clone().sub(N0).normalize()) - a.clone().sub(N0).normalize().dot(camAt.clone().sub(N0).normalize()))[0];
    const out = pore.clone().sub(N0).normalize();
    const ring = keep(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 28), new THREE.MeshBasicMaterial({ color: 0xfff1a8 })));
    ring.position.copy(pore); ring.lookAt(pore.clone().add(out));
    await fly(far.pos, N0.clone().lerp(pore, 0.55).toArray(), 1800);
    /* the thread's way: the copy itself (its far end first), then the pore, then the cytoplasm beyond */
    const cc = copyCurve(), pts = cc.getPoints(12);
    if (pts[0].distanceTo(pore) < pts[pts.length - 1].distanceTo(pore)) pts.reverse();
    const side = new THREE.Vector3().crossVectors(out, V(0, 1, 0)).normalize();
    const way = new THREE.CatmullRomCurve3(pts.concat([pore.clone().addScaledVector(out, -0.5), pore.clone().addScaledVector(out, -0.12), pore.clone().addScaledVector(out, 0.2),
      pore.clone().addScaledVector(out, 0.75).addScaledVector(side, 0.15), pore.clone().addScaledVector(out, 1.4).addScaledVector(side, 0.35), pore.clone().addScaledVector(out, 2.1).addScaledVector(side, 0.45)]));
    const SEG = 320, thread = keep(copyThread(way, SEG)), per = 8 * 6;
    const lenSegs = Math.max(6, Math.round(SEG * cc.getLength() / way.getLength()));
    drop(rib); props.rib = null;
    const t0 = performance.now(), MS = R.FAST ? 0 : 3600;
    await live(new Promise(res => {
      const f = () => {
        const k = MS ? Math.min(1, (performance.now() - t0) / MS) : 1, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        thread.userData.range(Math.round(e * (SEG - lenSegs)), lenSegs); world.kick && world.kick();
        if (k < 1) requestAnimationFrame(f); else res();
      };
      f();
    }));
    quest.say('The copy, mRNA, is in the cytoplasm now. The DNA stays in the nucleus.', 'ok');
    await quest.gain('mrna', way.getPointAt(0.97));
    drop(thread); drop(ring);
    await quest.next('Back to the map');
  }

  /* ---------------- nucleolus ----------------
     True sizes (9 Nov 2026; Daniel: "these two parts are extremely huge. They are as big as chromosomes, and that's not the
     case. Ribosomes are very small. So please zoom in or do whatever you need to do to actually represent the ribosome on
     its real size"; memory true-relative-sizes): the camera zooms to the nucleolus's edge, a view about 250 nm across with
     a scale bar, and each part is built there at its true size: the small part about 25 nm across, the large part about
     30 nm (a whole ribosome is 25 to 30 nm; the small part has about a third of its mass), from a strand of RNA made here
     (2 nm thick) and proteins (about 5 nm) that came in from the cytoplasm. The two stand side by side, named, so their
     sizes compare. The chromosomes and the sparkles, drawn larger than life, are hidden while the camera is close. The
     parts are then sent off: from far away they are far too small to see, so a glow shows each one on its way to a pore */
  const NOL = () => inN(N.nucleolus.position);
  const NS = { tick: 0, close: false, f: null };
  /* the close view's frame: the point of the nucleolus's surface facing the place's view, the way out of the surface (dir),
     and two ways along it (right, up); an offset in nm. The camera looks along the surface, 18° above it, so the
     nucleolus's edge lies across the foot of the picture like a horizon, the parts just above it against the nucleus
     (looking straight at the surface, the picture had been pink from edge to edge: nowhere to see where you are); on the
     screen the way out is up and `up` is across */
  function nolFrame() {
    if (NS.f) return NS.f;
    const c = NOL(), vp = V(...world.P.nucleolus.view.pos), dir = vp.clone().sub(c).normalize();
    N.group.updateMatrixWorld(true);
    const hit = new THREE.Raycaster(vp, dir.clone().negate()).intersectObject(N.nucleolus, false)[0];
    const S = hit ? hit.point.clone() : c.clone().addScaledVector(dir, 0.75);
    const right = new THREE.Vector3().crossVectors(V(0, 1, 0), dir).normalize(), up = new THREE.Vector3().crossVectors(dir, right).normalize();
    return (NS.f = { S, dir, right, up });
  }
  const nolPt = (x, y, z) => { const f = nolFrame(); return f.S.clone().addScaledVector(f.right, x / 1000).addScaledVector(f.up, y / 1000).addScaledVector(f.dir, z / 1000); };
  /* each part's place and true size (token sizes: the small part 1.49 s wide and 0.87 s high, the large 1.96 s by 1.45 s) */
  const PART = { small: { at: () => nolPt(0, -32, 20), s: 0.0168 }, large: { at: () => nolPt(0, 32, 23), s: 0.01535 } };
  function nolBar(on) {
    if (on && !NS.tick) { const f = () => { if (!NS.tick) return; scaleBar(world.camera.position.distanceTo(world.controls.target)); NS.tick = requestAnimationFrame(f); }; NS.tick = requestAnimationFrame(f); }
    else if (!on && NS.tick) { cancelAnimationFrame(NS.tick); NS.tick = 0; if (bar) bar.hidden = true; }
  }
  /* close: what is drawn larger than life hidden, the scale bar on, the camera to the edge; far: back to the place's view */
  async function nolZoom(close) {
    if (close === NS.close) return;
    if (close) {
      /* (and every nuclear pore at its true size, 120 nm across, as in the dive: drawn twice as wide, the pores of the far
         side had stood in the picture as rings far larger than the parts) */
      N.chromatin.visible = false; N.nolSpark.visible = false; N.PK.uPoreK.value = 0.513; NS.close = true; nolBar(true);
      const f = nolFrame();
      const a = THREE.MathUtils.degToRad(18), cd = f.right.clone().multiplyScalar(Math.cos(a)).addScaledVector(f.dir, Math.sin(a)).normalize();
      await camGo({ at: nolPt(0, 0, 32), dir: cd, up: f.dir.clone(), dist: 0.3 }, R.FAST ? 0 : 3400);
    } else {
      NS.close = false;
      await camGo({ at: V(...world.P.nucleus.view.at), dir: V(...world.P.nucleus.view.pos).sub(V(...world.P.nucleus.view.at)).normalize(), up: V(0, 1, 0), dist: V(...world.P.nucleus.view.pos).distanceTo(V(...world.P.nucleus.view.at)) }, R.FAST ? 0 : 3200);
      nolBar(false); N.PK.uPoreK.value = 1; world.nucLook();
    }
  }
  /* leaving the place: the chromosomes and the sparkles as the nucleus's look says, no scale bar */
  function nolOff() { if (NS.close || NS.tick) { NS.close = false; nolBar(false); N.PK.uPoreK.value = 1; world.nucLook(); } }
  /* the two parts named beside them, on level lines (never on them: their names had stood on the parts and hidden them;
     on a phone too, aside: the small part's on its left, the large part's on its right, so neither stands on the other part) */
  const nolNames = () => quest.names.set(['small', 'large'].filter(k => props[k]).map(k => ({ key: 'nol-' + k, free: true, aside: true, prefer: k === 'small' ? -1 : 1, html: `<span class="nm__t">${k === 'small' ? 'small part' : 'large part'}</span>`, spots: [props[k].position.clone()] })),
    HUD(), lr(nolPt(0, -48, 20), nolPt(0, 48, 20)));
  /* a part at its true size; its glow much less than a token's elsewhere (a bright glow spread far beyond it and made the
     large part look larger than it is), on copies of the shared materials */
  const makePart = kind => { const t = keep(token(kind, PART[kind].s)); t.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.emissiveIntensity *= 0.25; } }); t.position.copy(PART[kind].at()); t.userData.kind = kind; return (props[kind] = t); };
  async function build(kind) {
    if (!NS.close) { const v = world.P.nucleolus.view; if (world.camera.position.distanceTo(V(...v.pos)) > 0.6) await fly(v.pos, v.at); }
    await nolZoom(true);
    if (kind === 'large' && !props.small) makePart('small');
    nolNames();
    const f = nolFrame(), at = PART[kind].at();
    await press(() => at.clone().addScaledVector(f.dir, 0.03), 'Build', { cost: COST.parts / 2 });
    /* its RNA is made here: a strand grows up out of the nucleolus and folds up where the part forms */
    const S0 = at.clone().addScaledVector(f.dir, -0.02), pts = [];
    for (let i = 0; i <= 30; i++) { const t = i / 30; pts.push(S0.clone().lerp(at, t).addScaledVector(f.up, Math.sin(t * 11) * 0.007 * (1 - t * 0.6)).addScaledVector(f.right, Math.cos(t * 8) * 0.004)); }
    const rna = keep(ribbon(new THREE.CatmullRomCurve3(pts), { color: 0xffb35c, radius: 0.0012, segs: 120 }));
    const t0 = performance.now();
    await live(new Promise(r => { const g = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 1800); rna.userData.grow(k); world.kick(); if (k < 1) requestAnimationFrame(g); else r(); }; g(); }));
    /* its proteins came into the nucleus from the cytoplasm, through nuclear pores: they arrive from the side */
    const n = kind === 'small' ? 6 : 9, prots = [...Array(n)].map((_, i) => { const t = keep(token('protein', 0.0025)); t.position.copy(at).addScaledVector(f.up, (i % 2 ? 1 : -1) * (0.05 + 0.006 * i)).addScaledVector(f.dir, 0.06 + 0.007 * i); return t; });
    await Promise.all(prots.map((t, i) => wait(R.TEST ? 0 : i * 140).then(() => tween(t, { to: at.clone().addScaledVector(f.up, Math.cos(i * 2.4) * 0.006).addScaledVector(f.dir, Math.sin(i * 2.4) * 0.004), ms: 1200 }))));
    /* together they fold into the part */
    const part = makePart(kind); part.scale.setScalar(0.3);
    await Promise.all([tween(part, { to: at, ms: 700, scale: 1 }), ...prots.map(t => tween(t, { to: at, ms: 600, scale: 0.4 }))]);
    [rna, ...prots].forEach(drop);
    burst(scene, at, { n: 18, r: 0.02 });
    nolNames();
    quest.say(kind === 'small'
      ? 'The small part of a ribosome: RNA made here, and proteins made in the cytoplasm. It is about 25 nanometres (nm) across: if the cell were a football pitch, it would be smaller than a football.'
      : 'The large part of a ribosome: RNA and proteins too. It is about 30 nm across: larger than the small part.', 'ok');
  }
  async function out() {
    await nolZoom(true);
    const parts = ['small', 'large'].map(k => props[k] || makePart(k));
    nolNames();
    const f = nolFrame();
    /* each part, pressed, drifts away from the nucleolus (out of the close view), its glow on */
    for (const p of parts) {
      await press(() => p.position.clone().addScaledVector(f.dir, 0.03), p.userData.kind === 'small' ? 'small part' : 'large part', { cls: 'tok', side: 't' });
      haloSprite(p, 0.035, 0xfff1a8);
      quest.names.set(quest.names.items.filter(it => it.key !== 'nol-' + p.userData.kind), HUD(), lr(nolPt(0, -48, 20), nolPt(0, 48, 20)));
      await tween(p, { to: p.position.clone().addScaledVector(f.dir, 0.16).addScaledVector(f.up, p.userData.kind === 'small' ? -0.03 : 0.03), ms: 1400 });
    }
    quest.names.set([], HUD());
    /* from far away they are far too small to see: the glows show them on their way out, through two pores on the side of
       the rough ER, and on into the cytosol beside its outer layer, where the ribosome place is (Daniel, 11 Nov 2026: they
       had gone out through the pores nearest the nucleolus, at the top, "instead of to the rough ER"). In this cell the
       rough ER is all round the lower part of the nucleus, so they come out beside it (they do not join the rough ER
       themselves: they join on a copy of a gene first) */
    await nolZoom(false);
    parts.forEach(p => marker(p, 0.5));
    quest.say('From here the two parts are far too small to see: the glows show where they are.');
    const ways = partWays();
    await Promise.all(parts.map((p, i) => wait(R.TEST ? 0 : i * 500).then(() => tween(p, { to: ways[i][0], ms: 2200 }))));
    /* the camera turns to see the side of the nucleus and the rough ER together; the parts go out between its layers'
       edges (through its window at the front: never through a layer) to beside its outer layer */
    await camGo(outView(ways), R.FAST ? 0 : 2600);
    await Promise.all(parts.map((p, i) => wait(R.TEST ? 0 : i * 400).then(() => { trail(p, 3600); return tween(p, { path: new THREE.CatmullRomCurve3(ways[i]), ms: 3600 }); })));
    /* the rough ER named where they stop: the link (Daniel, 11 Nov 2026) */
    /* (and the two parts, still glowing where they stop: pupils keep them in sight, the expert review) */
    { const f = rerFace(); quest.names.set([{ key: 'o-rer', free: true, aside: true, html: '<span class="nm__t">rough ER</span>', spots: [f.p.clone().addScaledVector(f.along, 0.45), f.p.clone().addScaledVector(f.along, -0.45), f.p.clone().addScaledVector(f.right, 0.9), f.p.clone().addScaledVector(f.right, -0.9)] },
      ...parts.map(p => ({ key: 'o-' + p.userData.kind, free: true, aside: true, html: `<span class="nm__t">${p.userData.kind === 'small' ? 'small part' : 'large part'}</span>`, spots: [p.position.clone()] }))], HUD()); }
    quest.say('<p>In this cell, the rough ER is all round the lower part of the nucleus. So the two parts pass into the cytosol beside the rough ER, where they wait for a copy of a gene.</p><p>Any ribosome can work on the rough ER: the chain it makes decides.</p>', 'ok');
    await wait(R.TEST ? 0 : 1200);
    await quest.gain('parts', ways[0][ways[0].length - 1]);
    await quest.next('Back to the map');   /* (the parts stay in sight until the pupil leaves: reset takes them) */
  }
  /* a glow that shows where something far too small to see is, from far away: a golden dot with a bright middle (normal
     blending: an additive glow was lost on the pale rough ER), drawn over everything (it is seen behind the rough ER's
     layers too), um µm across */
  let MARK = null;
  const marker = (o, um, col = 0xffc94a) => {
    if (!MARK) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.22, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      MARK = new THREE.CanvasTexture(c); MARK.colorSpace = THREE.SRGBColorSpace; }
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: MARK, color: col, transparent: true, depthTest: false, depthWrite: false }));
    sp.scale.setScalar(um / o.scale.x); sp.renderOrder = 20; o.add(sp); return sp;
  };
  /* the way it went, as dots that fade over 4 s (so that the way from the pore to the rough ER can be followed); none with
     Reduce motion (the move is one jump) */
  const trail = (p, ms) => {
    if (R.FAST) return;
    const s0 = quest.session, t0 = performance.now(), dots = [];
    const f = () => {
      if (quest.session !== s0) return;
      const now = performance.now();
      if (now - t0 < ms && (!dots.length || now - dots[dots.length - 1].t > 110)) { const d = keep(new THREE.Group()); d.position.copy(p.position); marker(d, 0.16); dots.push({ d, t: now }); }
      dots.forEach(o => { o.d.children[0].material.opacity = 0.85 * (1 - Math.min(1, (now - o.t) / 4000)); });
      world.kick();
      if (now - t0 < ms + 4000) requestAnimationFrame(f); else dots.forEach(o => drop(o.d));
    };
    f();
  };
  /* the two parts' ways from the nucleus to the ribosome place: from the two pores nearest it (not too close together), out
     into the cytosol between the nucleus and the rough ER, round to its window at the front (no layers there), out through
     it beyond the outer layer, and round outside that layer to the cytosol just off it (rerFace: where the ribosome place
     looks). Worked out in the rough ER's own round shape (its layers are ellipsoids about the nucleus, cellbuild.js); none
     crosses a layer (checked by rays, 11 Nov 2026) */
  function partWays() {
    const C = N0.clone().add(V(0, -0.1, 0)), K = V(1, 0.75, 0.9), f = rerFace(), spot = f.p.clone().addScaledVector(f.n, 0.06);
    const toS = p => { const q = p.clone().sub(C).divide(K), r = q.length(); return { r, az: Math.atan2(q.x, q.z), e: Math.asin(q.y / r) }; };
    const fromS = (r, az, e) => V(r * Math.cos(e) * Math.sin(az), r * Math.sin(e), r * Math.cos(e) * Math.cos(az)).multiply(K).add(C);
    const pores = W.pores.slice().sort((a, b) => a.distanceTo(spot) - b.distanceTo(spot)), p0 = pores[0], p1 = pores.find(p => p.distanceTo(p0) > 0.3) || pores[1];
    const ss = toS(spot), AZW = -0.72, RO = 6.0;
    return [p0, p1].map((p, i) => { const a = toS(p), e1 = Math.max(a.e, -0.5), end = spot.clone().addScaledVector(f.right, (i ? 0.35 : -0.35));   /* (apart: the two parts join only on a copy of a gene, the expert review, 11 Nov 2026) */
      return [p, fromS(3.13, a.az, a.e), fromS(3.13, AZW, e1), fromS(RO, AZW, e1), fromS(RO, (AZW + ss.az) / 2, (e1 + ss.e) / 2), fromS(ss.r + 0.35, ss.az, ss.e), end]; });
  }
  /* a view of the whole nucleus, the rough ER round it and both ways, from the front, a little to the left and above (from
     the rough ER's own side, its layers stood in front of the ways and the nucleus was pushed into a corner; close, only
     part of the ways showed): what it looks at between the nucleus's middle and the ways' middle, 11 µm away */
  const outView = ways => { const at = N0.clone().lerp(new THREE.Box3().setFromPoints(ways.flat()).getCenter(V(0, 0, 0)), 0.55);
    return { at, dir: V(-0.35, 0.3, 1).normalize(), up: V(0, 1, 0), dist: 11 }; };

  /* ---------------- ribosomes and the rough ER, at their true sizes ----------------
     (9 Nov 2026; Daniel, after the nucleolus: "do the same for any other organelle. If your building parts are huge and
     they shouldn't be huge, please be respectful with size"; his "Yes, build it" to the plan): close up, every molecule at
     its true size, with the scale bar: the copy (mRNA) a thread 2 nm thick, the ribosome about 30 nm (its large part above
     the copy, its small part below), each carrier (transfer RNA) about 7 nm long with its amino acid (about 1 nm), the chain
     a string of amino acids from the ribosome; at the rough ER its membrane at its true thickness (about 6 nm: two layers of
     lipids), the channel in it, the enzyme that removes the signal (about 5 nm), amylase (about 5 nm across) and the
     vesicle that buds (about 70 nm). What the world draws larger than life nearby (its ribosomes, four times their size so
     that the map shows them; the microtubules; the cytosol's motes and dust; the rough ER's sheet; the blood, drawn with
     no fog) is hidden while the camera is close (nanoIn), what is far fades into the cytosol (nanoFog), and all of it
     comes back while the camera goes out (nanoOut) or when the pupil leaves (reset: nanoOff). The rough ER is seen as a
     section, its cut face showing the membrane's two layers. Every press, choice and check is as before.
     Proof: tools/true-size.mjs B and C */
  const TSZ = { mrna: 0.001, rib: 0.0154, small: 0.0168, large: 0.01535, car: 0.0075, aa: 0.0011, bead: 0.00055, amy: 0.0024, ves: 0.035, enz: 0.0025 };
  const NZ = { on: false, hidden: [] };
  const groupsOf = names => names.map(k => W.groups[k]).filter(Boolean);
  /* what is far away fades into the cytosol while the camera is close: a mitochondrion 2 µm behind a ribosome must not
     look as small as the ribosome beside the scale bar (drawn in perspective, it did). The fog follows the camera's
     distance, so it thickens as the camera comes in and thins as it goes out; only its numbers change (no new shader) */
  const FOGC = new THREE.Color(0x52648c);
  function nanoFog() {
    const fog = scene.fog, o = NZ.fog0 || (NZ.fog0 = { c0: fog.color.clone(), n0: fog.near, f0: fog.far }), { c0, n0, f0 } = o, run = NZ.fogRun = (NZ.fogRun || 0) + 1;
    /* once the close-up ends, the world's own fog comes back over 0.9 s (never in one frame) */
    let tOff = 0;
    const f = () => {
      if (run !== NZ.fogRun) return;
      if (!NZ.on && !tOff) tOff = performance.now();
      const w = tOff ? 1 - smooth(0, 1, R.FAST ? 1 : (performance.now() - tOff) / 900) : 1;
      const d = world.camera.position.distanceTo(world.controls.target), k = smooth(0, 1, Math.log(20 / d) / Math.log(20 / 0.16));
      const nn = n0 + (Math.min(n0, d * 1.75) - n0) * w, nf = f0 + (Math.min(f0, d * 13) - f0) * w;
      if (Math.abs(nn - fog.near) > 1e-6 || Math.abs(nf - fog.far) > 1e-6) { fog.near = nn; fog.far = nf; fog.color.copy(c0).lerp(FOGC, k * w); world.kick(); }   /* a still picture is not drawn again */
      if (w > 0) requestAnimationFrame(f);
    };
    f();
  }
  async function nanoIn(view, hide) {
    if (!NZ.on) { hide.forEach(o => { if (o && o.visible) { o.visible = false; NZ.hidden.push(o); } }); NZ.on = true; nolBar(true); nanoFog(); }
    await camGo(view, R.FAST ? 0 : 3200);
  }
  /* the close-up ends: the scale bar and the close-up's membrane go, and what the world hid comes back; all but its
     ribosomes (four times their size) when ribs is false */
  const bigRibs = () => groupsOf(['free-ribosomes']).concat([W.groups.rer && W.groups.rer.children.find(o => o.name === 'rer-ribosomes')]);
  /* (a place's own close-up drawing, props.close, goes with the scale bar; or, when the world's own drawing of it comes
     back only once far, NZ.late with NZ.keepClose, at the same moment as that: the Golgi, whose world sacs are drawn far
     apart, never missing from the picture) */
  function nanoOff(ribs = true) {
    if (NZ.on) { NZ.on = false; nolBar(false); if (props.mem) props.mem.visible = false; }
    if (props.close && (ribs || !NZ.keepClose)) props.close.visible = false;
    const late = ribs ? [] : bigRibs().concat(NZ.late || []);
    NZ.hidden = NZ.hidden.filter(o => { if (late.includes(o)) return true; o.visible = true; return false; });
    if (ribs) { NZ.late = null; NZ.keepClose = false; }
  }
  /* on the way out, the world comes back while the camera flies: about 0.45 µm away its rough ER's sheet and the cytosol
     (the close-up's membrane and scale bar go); about 1.5 µm away its ribosomes, four times their size, which beside a
     molecule at its true size would look larger than a vesicle (at the end of the flight, the world had been missing its
     rough ER for two seconds) */
  async function nanoOut(placeView) {
    const at = V(...placeView.at), pos = V(...placeView.pos), s0 = quest.session; let on = true;
    const watch = () => {
      if (!on || quest.session !== s0) return;
      const d = world.camera.position.distanceTo(world.controls.target);
      if (d > 1.5) { nanoOff(true); return; }
      if (d > 0.45 && NZ.on) nanoOff(false);
      requestAnimationFrame(watch);
    };
    watch();
    await camGo({ at, dir: pos.clone().sub(at).normalize(), up: V(0, 1, 0), dist: pos.distanceTo(at) }, R.FAST ? 0 : 3000);
    on = false; nanoOff(true);
  }
  /* a molecule at its true size glows little (a token's glow spread far beyond it), on copies of the shared materials */
  const calm = t => { t.traverse(o => { if (o.isMesh && o.material && o.material.emissive) { o.material = o.material.clone(); o.material.emissiveIntensity *= 0.3; } }); return t; };
  const NEAR_HIDE = () => groupsOf(['free-ribosomes', 'microtubules', 'cytosol', 'dust', 'blood']).concat([W.groups.rer && W.groups.rer.children.find(o => o.name === 'rer-ribosomes')]);

  /* ---------------- ribosomes ----------------
     beside the rough ER (Daniel, 11 Nov 2026: "when clicking the ribosome … be taken … to the rough endoplasmic reticulum
     … the students should link the rough ER with ribosomes and the fact that they end up in the membrane of the rough
     ER"): the close view is the rough ER's own piece of membrane (rerFace), seen from the same eye level, looking a little
     higher, at the cytosol just above it, where this ribosome begins its protein (a ribosome starts in the cytosol; the
     signal then takes it to the rough ER). The membrane lies across the foot of the picture the whole time. Offsets in
     nm: x across the picture (to the right), y up (out of the membrane, into the cytosol; 0 is the copy, RIB_Y above the
     membrane), z towards the camera; x 0 is above the channel where the ribosome will dock. The rough ER's own offsets
     (ep) run the other way across: ep(-28, 46), where Dock begins, is 28 nm to the right, 46 nm up */
  const RIB_Y = 52, RIB_AT = 46, RIB_X = 8, RIB_DIST = 0.17;   /* (the view's middle 8 nm to the right: on a phone, about 116 nm wide, the free ribosome of the last step is in it) */
  function ribFrame() {
    if (props.rf) return props.rf;
    const f = rerFace(), up = f.n.clone(), rd = f.along.clone(), right = new THREE.Vector3().crossVectors(up, rd).normalize();
    return (props.rf = { c: f.p.clone().addScaledVector(up, RIB_Y / 1000), rd, right, up });
  }
  const rp = (x, y, z = 0) => { const f = ribFrame(); return f.c.clone().addScaledVector(f.right, x / 1000).addScaledVector(f.up, y / 1000).addScaledVector(f.rd, z / 1000); };
  /* a token turned to the picture, its up the view's up (the rough ER's up is not the world's) */
  const faced = t => { const f = ribFrame(); t.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.right, f.up, f.rd)); return t; };
  /* the camera's eye level with the middle of the membrane (as at the rough ER: its cut face a thin band, never its top
     stretched back as a plane), looking up at a point RIB_AT nm above it */
  /* (on a phone the corner box covers the top of the picture: the camera a little further away, looking a little higher,
     so that what stands highest, the large part as it comes and the free ribosome's chain, is below it) */
  const ribClose = () => {
    membrane();
    const P = PHONE(), at = P ? 44 : RIB_AT, dist = P ? 0.225 : RIB_DIST;   /* (the membrane above the switch and the scale bar) */
    const f = ribFrame(), a = -Math.asin(at / 1000 / dist), cd = f.rd.clone().multiplyScalar(Math.cos(a)).addScaledVector(f.up, Math.sin(a)).normalize();
    return nanoIn({ at: rerFace().p.clone().addScaledVector(f.up, at / 1000).addScaledVector(f.right, RIB_X / 1000), dir: cd, up: f.up.clone(), dist }, NEAR_HIDE().concat([W.groups.rer]));
  };
  /* the copy: a thread across the picture; the ribosome reads it a codon (3 bases, about 1 nm) at a time */
  const makeCopy = () => { const curve = new THREE.CatmullRomCurve3([...Array(13)].map((_, i) => rp(-90 + i * 15, 1.4 * Math.sin(i * 0.9)))); const m = keep(ribbon(curve, { radius: TSZ.mrna, segs: 220 })); m.userData.grow(1); props.copy = curve; props.copyObj = m; return curve; };
  const ribPos = k => rp(-12 + k * 1.1, 0);
  const makeRib = k => { const t = faced(calm(keep(token('ribosome', TSZ.rib)))); t.position.copy(ribPos(k)); return (props.rib = t); };
  const ribNames = (list, solid = [props.rib]) => quest.names.set(list.map(([key, html, spots, o]) => Object.assign({ key, free: true, aside: true, html: `<span class="nm__t">${html}</span>`, spots }, key === 'r-copy' ? { up: 1, small: '<span class="nm__t">copy<br>(mRNA)</span>' } : {}, o || {})), HUDR(), lr(rp(-50, 0), rp(45, 0)), solid.filter(Boolean));
  /* a large part's name stands beside its edge, on the screen's right or left, and its short line ends on the part: beside
     its middle, the name covered half a ribosome (names.js sides) */
  const edge = (c, ...rads) => { const R = new THREE.Vector3().setFromMatrixColumn(world.camera.matrixWorld, 0).normalize(); return [rads.flatMap(rad => [c.clone().addScaledVector(R, rad), c.clone().addScaledVector(R, -rad)]), { sides: rads.flatMap(() => [1, -1]) }]; };
  /* the same, on its left side only (at the last step the free ribosome, up on the right, needs the right; on a phone the
     name stands below this ribosome, then above it once it has turned and moved) */
  const edgeL = (c, rad) => { const [sp] = edge(c, rad); return [[sp[1]], { sides: [-1] }]; };
  /* the copy's name stands on the copy, away from the ribosome (on a phone the picture is about 125 nm wide) */
  const copySpots = () => PHONE() ? [rp(44, 1), rp(54, 1), rp(-62, 1)] : [rp(-48, 1), rp(-40, 1), rp(28, 1), rp(38, 1), rp(48, 1)];   /* (on a phone clear of the code's label under the ribosome: on the left it touched it, 11 Nov 2026) */
  /* the membrane of the rough ER named in this view too (the link: Daniel, 11 Nov 2026): above it, on the right, where
     nothing of the story is (below it there is no room at the foot of the picture) */
  const ribMem = () => ['r-mem', 'membrane of the rough ER', [rp(45, -RIB_Y + 3), rp(55, -RIB_Y + 3), rp(35, -RIB_Y + 3)], { up: -1, len: 26, small: '<span class="nm__t">rough ER membrane</span>' }];
  async function assemble() {
    await fly(world.P.ribosome.view.pos, world.P.ribosome.view.at);
    await ribClose();
    if (!props.copy) makeCopy();
    const s = faced(calm(keep(token('small', TSZ.small)))), l = faced(calm(keep(token('large', TSZ.large))));
    /* they come from the sides: the large part from up on the right (up on the left it stood under the corner box), the
       small part from down on the left (above the switch at the foot of the picture) */
    s.position.copy(rp(-40, -28, 5)); l.position.copy(rp(24, 26, 5));
    const copyName = ['r-copy', 'the copy (mRNA)', copySpots()];
    ribNames([copyName, ribMem(), ['r-s', 'small part', ...edge(s.position, 0.011)], ['r-l', 'large part', ...edge(l.position, 0.014)]], [s, l]);
    await press(() => rp(-12, 18), 'Join', {});
    await tween(s, { to: rp(-12, -5.9), ms: 900 });
    await tween(l, { to: rp(-12, 6.5), ms: 900 });
    drop(s); drop(l);
    const r = makeRib(0);
    burst(scene, r.position, { n: 20, r: 0.02 });
    ribNames([copyName, ribMem(), ['r-rib', 'ribosome', ...edge(r.position.clone().addScaledVector(ribFrame().up, 0.009), 0.0135)]]);
    quest.say('A whole ribosome, on the copy of the gene. It is about 30 nanometres (nm) across, and the copy is a thread only 2 nm thick.', 'ok');
    state.use('parts');
  }
  const CODES = [[0, '▲'], [1, '●'], [2, '■'], [3, '◆'], [1, '●'], [0, '▲']];
  async function translate() {
    await ribClose();
    if (!props.copy) makeCopy();
    const r = props.rib || makeRib(0), F = ribFrame();
    const beads = [], colors = [];
    let chainObj = null;
    ribNames([['r-copy', 'the copy (mRNA)', copySpots()], ribMem(), ['r-rib', 'ribosome', ...edge(r.position.clone().addScaledVector(F.up, 0.009), 0.0135)]]);
    for (let k = 0; k < CODES.length; k++) {
      const [ci, sym] = CODES[k];
      await tween(r, { to: ribPos(k), ms: 500 });
      const code = quest.hot(() => r.position.clone().addScaledVector(F.up, -0.019), `code: <b class="sym s${ci}">${sym}</b>`, { cls: 'code', side: 'b', aria: 'the code' });
      code.el.disabled = true;
      /* three amino acids float near, each on its carrier (transfer RNA, about 7 nm); the carrier whose end has the same
         shape and colour fits */
      const opts = [ci, (ci + 1) % 4, (ci + 2) % 4].sort(() => Math.random() - 0.5);
      const toks = opts.map((c, i) => {
        const t = faced(keep(token('amino', TSZ.aa))); t.children[0].material = t.children[0].material.clone(); t.children[0].material.color.setHex(AMINO_COLORS[c]); t.children[0].material.emissive.setHex(AMINO_COLORS[c]);
        const cr = token('carrier', TSZ.car); cr.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.color.setHex(AMINO_COLORS[c]); o.material.emissive.setHex(AMINO_COLORS[c]); o.material.emissiveIntensity *= 0.4; } }); t.add(cr);   /* (the L's amino acid end is the token's middle: actors.js carrier) */
        /* up on the right of the ribosome, clear of the corner box at the top left (each L hangs 7.5 nm to the left of its
           amino acid and 7 nm down: clear of the ribosome's top) */
        /* (on a phone the corner box covers the top: in a row below the copy, on the right, a button's width apart; up
           there they had been pushed under the box and touched) */
        const P = PHONE();
        t.position.copy(r.position).addScaledVector(F.right, (P ? 34 + i * 24 : 27 + i * 16) / 1000).addScaledVector(F.up, P ? -0.022 : 0.026).addScaledVector(F.rd, 0.006); return { t, c };
      });
      await new Promise(done => {
        toks.forEach(({ t, c }) => {
          const b = quest.hot(() => t.position.clone().addScaledVector(F.up, 0.008), `<b class="sym s${c}">${['▲', '●', '■', '◆'][c]}</b>`, { cls: 'tok aa', aria: 'the carrier with a ' + ['triangle', 'circle', 'square', 'diamond'][c], right: c === ci });
          b.done.then(async () => {
            if (c !== ci) { quest.say('That carrier does not match the code. Look at its shape and colour.', 'no'); const p0 = t.position.clone(); await tween(t, { to: p0.clone().addScaledVector(F.up, -0.003), ms: 200 }); await tween(t, { to: p0, ms: 200 }); return; }
            if (!quest.energy(COST.translate / CODES.length)) return;
            quest.clearHots(); quest.say('');
            await tween(t, { to: r.position.clone().addScaledVector(F.up, 0.008), ms: 450 });
            toks.forEach(x => drop(x.t));
            /* the chain leaves the large part's tunnel, at its top: one more amino acid at its root */
            colors.push(ci);
            beads.length = 0; for (let q = 0; q < colors.length; q++) beads.push(r.position.clone().addScaledVector(F.up, (17 + 1.15 * (colors.length - 1 - q)) / 1000).addScaledVector(F.right, ((q % 2) - 0.5) * 0.0008));
            if (chainObj) drop(chainObj);
            chainObj = keep(chain(beads, colors, TSZ.bead));
            done();
          });
        });
      });
    }
    props.chain = chainObj;
    ribNames([['r-copy', 'the copy (mRNA)', copySpots()], ribMem(), ['r-rib', 'ribosome', ...edge(r.position.clone().addScaledVector(F.up, 0.009), 0.0135)],
      ['r-chain', 'the chain of amino acids', beads.slice(-3).map(b => b.clone())]]);
    quest.say('The ribosome reads the copy and joins the amino acids in its order: the start of the amylase chain. Each amino acid is about 1 nm across.', 'ok');
    state.use('amino'); state.use('mrna');
  }
  /* the chain as translate leaves it, for a pupil who comes back to the last step */
  const ribChain = r => { const F = ribFrame(), cols = CODES.map(c => c[0]); return keep(chain(cols.map((_, q) => r.position.clone().addScaledVector(F.up, (17 + 1.15 * (cols.length - 1 - q)) / 1000).addScaledVector(F.right, ((q % 2) - 0.5) * 0.0008)), cols, TSZ.bead)); };
  /* another ribosome close by, on another copy, making a protein with no signal: it stays free in the cytosol, up on the
     right, away from the membrane (clear of the corner box at the top left, of this one's chain, and of where this one
     goes: 28 nm to the right, 46 nm above the membrane) */
  function freeRib() {
    const a = rp(22, 10), b = rp(85, 24), curve = new THREE.CatmullRomCurve3([a, a.clone().lerp(b, 0.35).addScaledVector(ribFrame().up, 0.0012), a.clone().lerp(b, 0.7).addScaledVector(ribFrame().up, -0.001), b]);
    const m = keep(ribbon(curve, { radius: TSZ.mrna, segs: 120 })); m.userData.grow(1); props.copy2 = curve;
    const at = curve.getPointAt(0.5), dir = b.clone().sub(a).normalize(), up = new THREE.Vector3().crossVectors(ribFrame().rd, dir).normalize();
    const t = calm(keep(token('ribosome', TSZ.rib))); t.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(dir, up, ribFrame().rd)); t.position.copy(at);
    const cols = [2, 3, 0, 2, 1, 3, 1], c = keep(chain(cols.map((_, q) => at.clone().addScaledVector(up, (17 + 1.15 * (cols.length - 1 - q)) / 1000).addScaledVector(dir, ((q % 2) - 0.5) * 0.0008)), cols, TSZ.bead));
    return (props.free = { t, c, up });
  }
  async function where() {
    await ribClose();
    if (!props.copy) makeCopy();
    const r = props.rib || makeRib(CODES.length - 1), F = ribFrame();
    const ch = props.chain || (props.chain = ribChain(r));
    ribNames([['r-copy', 'the copy (mRNA)', copySpots()], ribMem(), ['r-rib', 'ribosome', ...edge(r.position.clone().addScaledVector(F.up, 0.009), 0.0135)]]);
    await quest.choose(['On the rough ER', 'Here, floating in the cytosol', 'Inside the nucleus'], 0, async (i) => {
      if (i === 1) quest.say('<p>Then amylase would stay in the cytosol, and it could never reach a vesicle or leave the cell.</p><p>Proteins that leave the cell are made on the <b>rough ER</b>.</p>', 'no');
      else quest.say('Ribosomes make proteins in the cytoplasm, never inside the nucleus. Because of its signal, this one is taken to the <b>rough ER</b>.', 'no');
      await wait(300);
    });
    /* both paths (Daniel, 11 Nov 2026: "show both things, that the ribosomes go into the cytosol, but they can also go
       into the rough ER"): another ribosome close by makes a protein with no signal, so it stays free in the cytosol; this
       one, whose chain starts with a signal, goes down to the membrane of the rough ER with its copy, turning its large
       part (where the chain leaves) to the membrane, to where Dock begins at the rough ER (ep(-28, 46)) */
    const o = props.free || freeRib();
    const names = mine => ribNames([(PHONE() ? ['r-free', 'a free ribosome', [o.t.position.clone().addScaledVector(ribFrame().up, -0.011)], { up: 1, len: 26 }] : ['r-free', 'a free ribosome', ...edge(o.t.position.clone().addScaledVector(ribFrame().up, -0.004), 0.0125, 0.0145)]), (PHONE() ? ['r-rib', 'your ribosome', [r.getWorldPosition(new THREE.Vector3()).addScaledVector(ribFrame().up, mine ? -0.012 : 0.012)], { up: mine ? 1 : -1, len: 34 }] : ['r-rib', 'your ribosome', ...edgeL(r.getWorldPosition(new THREE.Vector3()).addScaledVector(ribFrame().up, mine ? 0.009 : -0.009), 0.0135)]), ribMem()], [r, o.t, ch]);   /* (r in its pivot: its world position) */
    names(true);
    quest.say('<p>Not every protein has this signal. This other ribosome makes a protein with no signal: it stays in the cytosol, and its protein stays in the cytosol too.</p><p>Your chain starts with a signal, so your ribosome is taken to the membrane of the rough ER.</p>', 'ok');
    await wait(R.TEST ? 0 : 2200);
    const to = ep(-28, 46), d = to.clone().sub(r.position);
    const pivot = keep(new THREE.Group()); pivot.position.copy(r.position); pivot.attach(r); pivot.attach(ch);
    const copy = props.copyObj, c0 = copy ? copy.position.clone() : null, p0 = pivot.position.clone(), t0 = performance.now(), s0 = quest.session;
    /* it rolls over on its copy (about the copy's own line), so that its large part faces the membrane */
    await live(new Promise(res => {
      const f = () => {
        if (quest.session !== s0) return res();
        const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 2400), e = k * k * (3 - 2 * k);
        pivot.position.copy(p0).addScaledVector(d, e); pivot.quaternion.setFromAxisAngle(F.right, Math.PI * e);
        if (copy) copy.position.copy(c0).addScaledVector(d, e);
        world.kick(); if (k < 1) requestAnimationFrame(f); else res();
      };
      f();
    }));
    names(false);
    await wait(R.TEST ? 0 : 1600);
    /* from far away the ribosome is far too small to see: a glow shows it, at the rough ER */
    quest.names.set([], HUD());
    haloSprite(r, 0.05, 0xfff1a8);
    await nanoOut(world.P.ribosome.view);
    await quest.gain('chain', to);
    await quest.next('Back to the map');
  }

  /* ---------------- rough ER ---------------- */
  const RER = world.P.rer.center;
  /* the point of the rough ER that the camera sees in the middle of its view, and the sheet's face there (towards the
     camera): the ribosome docks there; "inside" is just behind that face */
  const ray = new THREE.Raycaster();
  function rerFace() {
    if (props.face) return props.face;
    const cam = new THREE.Vector3(...world.P.rer.view.pos), at = new THREE.Vector3(...world.P.rer.view.at);   /* the view's own, not the camera's now */
    ray.set(cam, at.clone().sub(cam).normalize());
    const sheets = W.groups.rer.children.filter(m => m.name.startsWith('rer') && !m.isInstancedMesh);
    const hit = ray.intersectObjects(sheets, false)[0];
    const p = hit ? hit.point : at, n = hit && hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : cam.clone().sub(at).normalize();
    if (n.dot(cam.clone().sub(p)) < 0) n.negate();
    /* along: in the membrane, towards the view's camera, so that a close view at the membrane's eye level looks from the side
       the camera came from (11 Nov 2026: along had been the membrane's direction nearest the world's up; a camera looking up
       from it, as at the ribosome place, then pointed almost straight up, where the controls keep it 0.15 rad from the pole
       (world.limits), and it had stood 23 nm below the membrane) */
    const toCam = cam.clone().sub(p), along = toCam.addScaledVector(n, -toCam.dot(n)).normalize(), right = new THREE.Vector3().crossVectors(along, n).normalize();
    return (props.face = { p, n, right, along });
  }
  /* offsets in nm: x along the membrane (across the picture), y out of it (up: the cytosol; down, negative: inside the ER) */
  const ep = (x, y, z = 0) => { const f = rerFace(); return f.p.clone().addScaledVector(f.right, x / 1000).addScaledVector(f.n, y / 1000).addScaledVector(f.along, z / 1000); };
  const dockAt = () => ep(0, 0);
  const insideAt = () => ep(4, -16);
  /* the membrane close up, at its true thickness, as a section (a textbook's diagram): cut where the ribosome docks, it
     runs away from the camera from there, so its cut face shows its two layers of lipids: the heads (pink, about 1 nm)
     on each side of the tails (paler), about 6 nm in all; a piece 1 µm wide, its ends out of the picture. The channel is a
     protein through the membrane, cut open too, with the tunnel that the chain goes through (Daniel's "be respectful
     with size": seen from above, its flat top had filled the picture, and neither its thickness nor its inside showed) */
  function membrane() {
    if (props.mem) { props.mem.visible = true; return props.mem; }
    const f = rerFace(), g = new THREE.Group(); g.position.copy(f.p);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.right, f.n, f.along.clone().negate()));   /* x across, y out to the cytosol, z away from the camera */
    const head = magicStandard({ color: 0xff9ac8, roughness: 0.5 }, { rim: 0xffd6ea, rimK: 0.4 }), tail = magicStandard({ color: 0xfff0f5, roughness: 0.7 }, { rim: 0xffffff, rimK: 0.15 });
    const prot = magicStandard({ color: 0x5fe0d0, emissive: 0x1a6a60, emissiveIntensity: 0.4, roughness: 0.4 }, { rim: 0xc8fff6, rimK: 0.5 });
    const box = (x0, x1, y0, y1, z0, z1, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry((x1 - x0) / 1000, (y1 - y0) / 1000, (z1 - z0) / 1000), m); b.position.set((x0 + x1) / 2000, (y0 + y1) / 2000, (z0 + z1) / 2000); g.add(b); };
    const slab = (x0, x1, z0, z1) => { box(x0, x1, 1.8, 3, z0, z1, head); box(x0, x1, -1.8, 1.8, z0, z1, tail); box(x0, x1, -3, -1.8, z0, z1, head); };
    slab(-500, -3.6, 0, 500); slab(3.6, 500, 0, 500); slab(-3.6, 3.6, 6, 500);
    box(-3.6, -1.1, -3.6, 3.6, 0, 6, prot); box(1.1, 3.6, -3.6, 3.6, 0, 6, prot); box(-1.1, 1.1, -3.6, 3.6, 4.6, 6, prot);
    return (props.mem = keep(g));
  }
  /* the camera's eye level with the middle of the membrane, looking a little up (about 5°) at what it frames: from there
     the membrane is only its cut face, a thin band between the cytosol above and the inside below. From 10° above, its
     top surface stretched back as a wide pink plane and the name "cytosol" stood on it (Daniel, 10 Nov 2026: "it's
     labeling the membrane itself rather than the cytosol") */
  const RER_AT = 14, RER_DIST = 0.17;
  const rerClose = () => { membrane(); const f = rerFace(), a = -Math.asin(RER_AT / 1000 / RER_DIST), cd = f.along.clone().multiplyScalar(Math.cos(a)).addScaledVector(f.n, Math.sin(a)).normalize();
    return nanoIn({ at: ep(0, RER_AT), dir: cd, up: f.n.clone(), dist: RER_DIST }, NEAR_HIDE().concat([W.groups.rer])); };
  /* solid: the large parts no name may cover (the ribosome, before it docks too, while it waits in the cytosol; the vesicle) */
  const rerNames = (list, solid = [props.rib]) => quest.names.set(list.map(([key, html, spots, o]) => Object.assign({ key, free: true, aside: true, html: `<span class="nm__t">${html}</span>`, spots }, o || {})), HUDR(), lr(ep(-34, 0), ep(34, 0)), solid.filter(Boolean));
  /* the membrane's name below its cut face, the channel's below its own (a name on or beside a thin part hides it) */
  /* (a phone's picture is about 130 nm wide: its spots nearer the middle, last, and shorter words) */
  const memName = () => ['e-mem', 'membrane of the rough ER', [ep(-60, 0), ep(-50, 0), ep(50, 0), ep(60, 0), ep(-26, 0), ep(26, 0)], { up: 1, small: '<span class="nm__t">rough ER membrane</span>' }];
  const chName = () => ['e-ch', 'channel', [ep(0, -3.6)], { up: 1, len: 40 }];
  /* the two sides' names away from the middle, where the ribosome, the chain and amylase are (on a phone the inside's name
     had touched the chain) */
  const twoEdges = (a, b) => [a[0].concat(b[0]), { sides: a[1].sides.concat(b[1].sides) }];
  const sides = () => [['e-cyt', 'cytosol', ...twoEdges(twoEdges(edge(ep(0, 50), 0.05), edge(ep(0, 42), 0.02)), edge(ep(0, 25), 0.02))],
    (([sp, o]) => ['e-in', 'inside the rough ER', sp, Object.assign(o, { small: '<span class="nm__t">inside the<br>rough ER</span>' })])(edge(ep(0, -33), 0.045, 0.016))];
  /* the ribosome docked: its large part on the channel (turned so that the large part faces the membrane) */
  const seat = () => ep(0, 3 + 16.5);
  const makeDocked = () => { const t = calm(keep(token('ribosome', TSZ.rib))); t.quaternion.setFromUnitVectors(V(0, 1, 0), rerFace().n.clone().negate()); t.position.copy(seat()); return (props.rib = t); };
  /* the ribosome's copy of the gene (mRNA): a ribosome that is making a chain stays on its copy (the expert review, 11 Nov
     2026: at the rough ER it had none, while the ribosomes beside it had theirs), so a copy runs through it, between its two
     parts, across the picture, and moves with it; when the chain is finished the ribosome leaves it, and it stays */
  const rerCopy = c => {
    if (props.copyObj) { props.copyObj.position.copy(c).sub(props.copyAt); return props.copyObj; }
    const f = rerFace(), curve = new THREE.CatmullRomCurve3([...Array(13)].map((_, i) => c.clone().addScaledVector(f.right, (-90 + i * 15) / 1000).addScaledVector(f.n, 1.4 * Math.sin(i * 0.9) / 1000)));
    const m = keep(ribbon(curve, { radius: TSZ.mrna, segs: 220 })); m.userData.grow(1); props.copy = curve; props.copyObj = m; props.copyAt = c.clone(); return m;
  };
  async function dock() {
    await fly(world.P.rer.view.pos, world.P.rer.view.at);
    await rerClose();
    const f = rerFace();
    const r = calm(keep(token('ribosome', TSZ.rib))); r.quaternion.setFromUnitVectors(V(0, 1, 0), f.n.clone().negate()); r.position.copy(ep(-28, 46)); props.rib = r;
    const cp = rerCopy(r.position);
    const sig = keep(chain([ep(-28, 46 - 17), ep(-27.5, 46 - 18.2)], [0, 1], TSZ.bead)); props.sig = sig;
    rerNames([memName(), ...sides(), chName(), ['e-rib', 'ribosome', ...edge(r.position, 0.0135)]]);
    await press(() => r.position.clone().addScaledVector(f.n, 0.024), 'Dock', {});
    await Promise.all([tween(r, { to: seat(), ms: 1300 }), tween(sig, { to: seat().sub(r.position), ms: 1300 }), tween(cp, { to: cp.position.clone().add(seat().sub(r.position)), ms: 1300 })]);
    rerNames([memName(), ...sides(), chName(), ['e-rib', 'ribosome', ...edge(seat(), 0.0135)]]);
    quest.say('The ribosome sits on a channel in the membrane of the rough ER. The membrane is about 6 nm thick: two layers of lipids.', 'ok');
  }
  /* the ribosome joins amino acids from one count to another: a counter under it, and the chain flowing down through the
     channel, inside the ER */
  async function count(r, from, to, ms) {
    const counter = quest.hot(() => r.position.clone().addScaledVector(rerFace().n, 0.024), 'amino acids: ' + from, { cls: 'count', side: 't' }); counter.el.disabled = true;
    const t0 = performance.now(), flow = [], s0 = quest.session;
    await live(new Promise(res => {
      const f = () => {
        const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms);
        counter.el.querySelector('span').textContent = 'amino acids: ' + Math.round(from + (to - from) * k);
        if (!R.FAST && flow.length < 18 && Math.random() < 0.3 && quest.session === s0) { const b = keep(token('amino', TSZ.aa)); b.position.copy(ep(0, 2)); flow.push(b); tween(b, { to: ep((Math.random() - 0.5) * 16, -8 - Math.random() * 12, (Math.random() - 0.5) * 8), ms: 1200 }); }
        if (k < 1) requestAnimationFrame(f); else res();
      };
      f();
    }), s0);
    flow.forEach(drop);
    return counter;
  }
  /* the chain inside the ER: a string of amino acids, loose */
  const blob = (n) => keep(chain(Array.from({ length: n }, (_, i) => ep(4 + Math.cos(i * 0.9) * 3, -9 - i * 0.55 + Math.sin(i * 1.7) * 1.2, Math.sin(i * 0.9) * 2)), Array.from({ length: n }, (_, i) => i % 4), TSZ.bead));
  const ribAt = () => props.rib || makeDocked();
  async function grow() {
    await rerClose();
    /* the signal leaves the ribosome's tunnel when about 60 amino acids are joined: the count starts there */
    const r = ribAt(); rerCopy(r.position);
    rerNames([memName(), ...sides(), ['e-rib', 'ribosome', ...edge(r.position, 0.0135)]]);
    await press(() => r.position.clone().addScaledVector(rerFace().n, 0.03), 'Go', { cost: COST.grow });
    await count(r, 60, 150, 2400);
    if (props.blob) drop(props.blob);
    props.blob = blob(14);
    rerNames([memName(), ...sides(), ['e-rib', 'ribosome', ...edge(r.position, 0.0135)], ['e-chain', 'the chain', [ep(4, -14)]]]);
    quest.say('The chain grows through the channel, inside the rough ER.', 'ok');
  }
  async function cut() {
    await rerClose();
    const r = ribAt(); rerCopy(r.position);
    if (!props.blob) props.blob = blob(14);
    const sig = props.sig || keep(chain([ep(-3, -5), ep(-4, -6)], [0, 1], TSZ.bead));
    /* the enzyme that removes the signal: a protein in the membrane beside the channel, about 5 nm */
    const enz = calm(keep(token('protein', TSZ.enz))); enz.position.copy(ep(-6, -1.5));
    rerNames([memName(), ...sides(), ['e-enz', 'enzyme', [enz.position.clone()]]]);
    await press(() => ep(-6, -14), 'Cut', { side: 'b' });
    await tween(sig, { to: sig.position.clone().addScaledVector(rerFace().right, -0.012).addScaledVector(rerFace().n, -0.01), ms: 900, fade: 0 });
    drop(sig); props.sig = null;
    quest.say('The signal is removed. The ribosome goes on joining amino acids.', 'ok');
    const counter = await count(r, 150, 511, 3600);
    counter.remove();
    drop(props.blob); props.blob = blob(30);
    /* the end of the copy: the ribosome releases the chain, and its two parts separate and leave the membrane */
    const up = rerFace().n;
    const sm = calm(keep(token('small', TSZ.small))), lg = calm(keep(token('large', TSZ.large)));
    lg.position.copy(r.position).addScaledVector(up, -0.0065); sm.position.copy(r.position).addScaledVector(up, 0.0059);
    drop(r); props.rib = null;
    await Promise.all([tween(sm, { to: sm.position.clone().addScaledVector(up, 0.06).addScaledVector(rerFace().right, -0.03), ms: 1300, fade: 0 }), tween(lg, { to: lg.position.clone().addScaledVector(up, 0.07).addScaledVector(rerFace().right, 0.03), ms: 1300, fade: 0 })]);
    drop(sm); drop(lg); drop(enz);
    rerNames([memName(), ...sides(), ['e-chain', 'the chain', [ep(4, -16)]]]);
    quest.say('<p>All 511 amino acids are joined.</p><p>At the end of the copy, the ribosome releases the chain, and its two parts separate and leave the membrane.</p><p>Without its signal, amylase has 496 amino acids. Only part of the chain is drawn here.</p>', 'ok');
  }
  async function fold() {
    await rerClose();
    const inside = insideAt();
    await press(() => inside.clone().addScaledVector(rerFace().n, -0.014), 'Fold', { side: 'b' });
    if (props.blob) { await tween(props.blob, { to: props.blob.position.clone(), ms: 200, scale: 0.6 }); drop(props.blob); props.blob = null; }
    const a = keep(token('amylase', TSZ.amy)); a.position.copy(inside); a.scale.setScalar(0.3);
    await tween(a, { to: inside, ms: 900, scale: 1 }); burst(scene, inside, { n: 18, r: 0.01 });
    props.amylase = a;
    rerNames([memName(), ...sides(), ['e-amy', 'amylase', [inside.clone()]]]);
    const site = quest.hot(() => a.position.clone().addScaledVector(rerFace().n, 0.003), 'active site', { cls: 'tag', side: 'r' }); site.el.disabled = true;
    quest.say('Amylase, folded into its shape: about 5 nm across. Starch fits into its <b>active site</b>.', 'ok');
    await quest.next(); site.remove();
  }
  async function bud() {
    await rerClose();
    const inside = insideAt();
    const a = props.amylase || (() => { const t = keep(token('amylase', TSZ.amy)); t.position.copy(inside); return (props.amylase = t); })();
    if (!state.has('lipids')) {
      quest.say('Every vesicle removes a piece of the ER membrane, so the ER needs new <b>lipids</b> first. The <b>smooth ER</b> makes them: go there, then return here.', 'no');
      return false;
    }
    rerNames([memName(), ...sides(), ['e-amy', 'amylase', [a.position.clone()]]]);
    await press(() => a.position.clone().addScaledVector(rerFace().n, -0.012), 'Bud', { side: 'b' });
    state.use('lipids'); state.use('chain');
    /* a piece of the membrane closes round amylase and pinches off into the cytosol: the vesicle grows up out of the
       membrane (its foot on the membrane), about 70 nm across, amylase rising into it from inside the ER; it leaves, and
       from far away it is too small to see, so a glow shows it on its way */
    const ves = keep(token('vesicle', TSZ.ves)); const c = ep(30, 3 + 35); ves.position.copy(ep(30, 3)); ves.scale.setScalar(0.05);
    await Promise.all([tween(a, { to: c, ms: 1600 }), tween(ves, { to: c, ms: 1600, scale: 1 })]);
    const g = new THREE.Group(); g.position.copy(c); keep(g); a.position.set(0, 0, 0); g.add(a); ves.position.set(0, 0, 0); g.add(ves);
    rerNames([memName(), ...sides(), ['e-ves', 'vesicle', ...edge(c, 0.034)]], [g]);
    quest.say('The vesicle is about 70 nm across: fourteen times as wide as the amylase inside it.', 'ok');
    await wait(R.TEST ? 0 : 2200);
    quest.names.set([], HUD());
    haloSprite(g, 0.06, 0xfff1a8);
    await nanoOut(world.P.rer.view);
    await tween(g, { to: g.position.clone().addScaledVector(rerFace().n, 1.0).add(V(0.6, 1.2, 0)), ms: 1400 });
    await quest.gain('amylase', g.position);
    drop(g); props.amylase = null;
    await quest.next('Back to the map');
  }

  /* ---------------- "As it really is" (11 Nov 2026) ----------------
     Daniel, 11 Nov 2026: "if you're looking at something in the middle of nowhere, it feels like the cell is empty … once
     you have zoom in, you can have a toggle saying, this is to simplify, and then you click a toggle, and this is how it
     looks in reality … you'll be fixed in an area … and then you can pack it with all of the things that are inside the
     cell … make sure that once it stops the camera, you have that toggle"; his choice, the same day: the ribosome place
     and the rough ER first. A switch, Simple | As it really is, at the foot of the picture (left, above the scale bar),
     shown while the close view of one of them is still and its step waits for the pupil. As it really is: the slice
     behind the story's own molecules packed at true size (crowd.js), a few names on what is there, and a note in the step
     (the numbers, and that many ribosomes sit on the rough ER); the step's buttons wait (the buttons on the picture are
     hidden, the panel's are paused) until the pupil switches back. The camera stays in its place, turned and zoomed a
     little as before (tight). It is built when pressed and removed when switched off, when the step changes, when the
     pupil leaves (reset) or when a step is watched again. Proof: tools/real-view.mjs */
  const REAL = { on: false, el: null, note: null, crowd: null, names: null, places: ['ribosome', 'rer'] };
  /* the crowd's names on a layer of their own (#names2): the step's names stay as they are, only hidden while it is on, so
     Simple shows them again exactly where they stood (replacing them, a phone had placed a different few afterwards) */
  const crowdNames = () => REAL.names || (REAL.names = new Names(world, (() => { const l = R.h('div', { class: 'names', id: 'names2' }); R.$('#stage').insertBefore(l, R.$('#hots')); return l; })()));
  /* the step waits for the pupil: a button on the picture that can be pressed, or one in the step (a choice, Next) */
  const waitsForPupil = () => quest.hots.some(o => o.alive && !o.el.disabled) || !!(quest.step && quest.step.li && quest.step.li.querySelector('.step__do button:not([disabled])'));
  const realHere = () => NZ.on && REAL.places.includes(quest.cur) && !quest.watchingNow();
  function realUI() {
    if (REAL.el) return REAL.el;
    const el = R.h('div', { class: 'realsw', role: 'group', 'aria-label': 'How the picture is drawn' },
      '<button type="button" class="realsw__b" data-real="0" aria-pressed="true">Simple</button><button type="button" class="realsw__b" data-real="1" aria-pressed="false">As it really is</button>');
    el.hidden = true; R.$('#stage').appendChild(el);
    /* drawing the crowd takes up to a second on a slow phone: the button says so first (memory dashboard-busy-states) */
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-real]'); if (!b) return;
      if (b.dataset.real !== '1' || REAL.on) { realSet(b.dataset.real === '1'); return; }
      quest.names.frozen = true;   /* (before the label changes: the switch's new size would place the step's names again) */
      b.textContent = 'Drawing…'; el.setAttribute('aria-busy', 'true');
      requestAnimationFrame(() => setTimeout(() => { try { realSet(true); } finally { b.textContent = 'As it really is'; el.removeAttribute('aria-busy'); if (!REAL.on) quest.names.frozen = false; } }, 0));
    });
    REAL.el = el;
    setInterval(realTick, 200);
    return el;
  }
  /* shown only where it can be used; it stands at the foot of the free part of the picture, above the scale bar */
  function realTick() {
    const el = REAL.el;
    if (!realHere()) { if (REAL.on) realSet(false); if (!el.hidden) el.hidden = true; return; }
    const show = REAL.on || (!world.flying && waitsForPupil());
    if (el.hidden === show) el.hidden = !show;
    if (!show) return;
    /* placed once it shows (hidden, its height is 0: it had stood 36 px too low for a moment), and the names told when it
       moves: a move is not a change of size, so their ResizeObserver does not see it, and a name had stood under it */
    /* (on a phone at the bottom right, above Hide text: at the left, over the scale bar, it had stood on the rough ER's chain) */
    const qh = document.getElementById('qHide'), phone = PHONE() && qh && qh.offsetHeight;
    el.style.left = phone ? 'auto' : ''; el.style.right = phone ? '10px' : '';
    const top = Math.round(phone ? qh.offsetTop - el.offsetHeight - 8 : world.size.h - (world.inset.bottom || 0) - 50 - el.offsetHeight - 10) + 'px';
    if (el.style.top !== top) { el.style.top = top; [quest.names, REAL.names].forEach(N => { if (N && N.keepOut) { N.keeps(); N.dirty = true; N.still = 0; } }); world.kick(); }
  }
  /* what the crowd keeps clear (nm, in the rough ER's frame): every drawn part of the story's own molecules (a sphere
     round each mesh), the copies sampled along their lines (a copy's own sphere is as wide as the picture) */
  function realClear(F) {
    const out = [], sph = new THREE.Sphere(), inF = p => { const d = p.clone().sub(F.o); return [d.dot(F.right) * 1000, d.dot(F.up) * 1000, d.dot(F.back) * 1000]; };
    kept.forEach(o => {
      if (o === props.mem || !o.visible) return;
      o.updateMatrixWorld(true);
      o.traverse(m => {
        if (!m.isMesh || !m.visible) return;
        if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
        sph.copy(m.geometry.boundingSphere).applyMatrix4(m.matrixWorld);
        const r = sph.radius * 1000; if (r > 45) return;
        out.push([...inF(sph.center), r + 1]);
      });
    });
    out.push([0, 0, -3, 5.5]);   /* the channel where the story's ribosome docks (the membrane's own drawing: membrane()) */
    /* room round the chain and amylase inside the rough ER, so that they can be seen (the expert review: the chain was lost) */
    if (props.blob && props.blob.parent) props.blob.children.forEach(b => out.push([...inF(b.getWorldPosition(new THREE.Vector3())), 3.5]));
    if (props.amylase && props.amylase.parent) out.push([...inF(props.amylase.getWorldPosition(new THREE.Vector3())), 6.5]);
    [props.copy, props.copy2].forEach(cv => { if (cv) cv.getSpacedPoints(240).forEach(p => out.push([...inF(p), 2.5])); });
    /* a copy moved with its ribosome (the last step) */
    if (props.copyObj && props.copy && props.copyObj.position.lengthSq() > 0) props.copy.getSpacedPoints(240).forEach(p => out.push([...inF(p.clone().add(props.copyObj.position)), 2.5]));
    return out;
  }
  const NOTE = '<p class="realnote__h">As it really is</p><p>The cytosol is packed: large molecules, mostly proteins, fill 20–30 % of the space. Water and other small molecules fill the rest. They are not drawn.</p><p>Many ribosomes sit on the membrane of the rough ER. That is why it looks rough.</p><p class="realnote__s">Everything is at its true size. Real molecules have no colour: the colours only help you see each one. Source: Ellis 2001, Trends in Biochemical Sciences 26:597.</p><p class="realnote__go">Press <b>Simple</b> to continue the step.</p>';
  function realSet(on) {
    on = !!on && realHere(); if (on === REAL.on) return;
    REAL.on = on;
    REAL.el.querySelectorAll('[data-real]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.real === '1') === on)));
    R.$('#stage').classList.toggle('is-real', on);
    /* the step's names wait as they are (names.js frozen), and are placed again only once the panel is its own size again */
    quest.names.frozen = on; if (!on) { quest.names.dirty = true; quest.names.still = 0; world.kick(); }
    if (on) {
      const f = rerFace(), F = { o: f.p.clone(), up: f.n.clone(), back: f.along.clone() }; F.right = new THREE.Vector3().crossVectors(F.up, F.back).normalize();
      REAL.crowd = buildCrowd(F, realClear(F)); scene.add(REAL.crowd.group);
      const sp = REAL.crowd.spots, mine = props.rib && props.rib.parent ? [props.rib] : [];
      /* one line, one thing: each name in the singular, on one of them (the expert review, 11 Nov 2026) */
      const list = [['x-prot', 'a protein', sp.proteins], ['x-rib', 'another ribosome', sp.ribosomes], ['x-car', 'a carrier', sp.carriers]];
      if (quest.cur === 'rer') list.push(['x-in', 'a protein inside the rough ER', sp.lumen, { small: '<span class="nm__t">a protein inside<br>the rough ER</span>' }]);
      if (mine.length) list.push(['x-mine', 'your ribosome', ...edge(props.rib.getWorldPosition(new THREE.Vector3()).addScaledVector(f.n, 0.009), 0.0135)]);
      /* the story's own molecule in the rough ER, never lost in the crowd */
      if (props.amylase && props.amylase.parent) list.push(['x-amy', 'amylase', [props.amylase.getWorldPosition(new THREE.Vector3())]]);
      else if (props.blob && props.blob.parent && props.blob.children.length) list.push(['x-chain', 'the chain', [props.blob.children[props.blob.children.length - 1].getWorldPosition(new THREE.Vector3())]]);
      const solid = mine.concat([props.blob, props.amylase, props.free && props.free.t].filter(o => o && o.parent));   /* (no crowd name on the story's own molecules: on a phone one had hidden the chain) */
      crowdNames().set(list.filter(it => it[2].length).map(([key, html, spots, o]) => Object.assign({ key, free: true, aside: true, html: `<span class="nm__t">${html}</span>`, spots }, o || {})), HUDR(), Object.assign(lr(ep(50, 0), ep(-50, 0)), { on: true }), solid);   /* (on: beside their parts, never in columns round the picture: long lines across the crowd) */
      if (quest.step && quest.step.li) { REAL.note = R.h('div', { class: 'realnote', role: 'status' }, NOTE.replace('<p class="realnote__s">', quest.cur === 'rer' ? '<p>The inside of the rough ER is packed with proteins too.</p><p class="realnote__s">' : '<p class="realnote__s">')); quest.step.li.appendChild(REAL.note); quest.reveal(REAL.note, false); }
    } else {
      if (REAL.crowd) { scene.remove(REAL.crowd.group); REAL.crowd.dispose(); REAL.crowd = null; }
      if (REAL.note) { REAL.note.remove(); REAL.note = null; }
      if (REAL.names) REAL.names.set([]);
    }
    world.kick();
  }
  const realOff = () => { if (REAL.on) realSet(false); };
  realUI();

  /* ---------------- the smooth ER, the Golgi and the way out, at their true sizes (round 6, 10 Nov 2026) ----------------
     His "Yes, build it" to the plan (and to the close-up of the sugars): each place close up with the scale bar, every
     molecule at its true size, the far world faded (nanoFog) and what is drawn larger than life nearby hidden (nanoIn);
     names beside the parts, never on a large one (names.js solid). Shared here: a close-up's frame (p a point, n the side
     called up, right across the picture, along towards the camera; offsets in nm), its group (x across, y up, z towards
     the camera), the camera's distance that fits a width and a height (nm) into the free part of the picture, and the
     names. */
  const frameAt = (p, n, camPos) => { const c = camPos.clone().sub(p).normalize(), along = c.addScaledVector(n, -c.dot(n)).normalize(); return { p: p.clone(), n: n.clone(), right: new THREE.Vector3().crossVectors(n, along), along }; };
  const fp = (F, x, y, z = 0) => F.p.clone().addScaledVector(F.right, x / 1000).addScaledVector(F.n, y / 1000).addScaledVector(F.along, z / 1000);
  const frameGroup = F => { const g = new THREE.Group(); g.position.copy(F.p); g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(F.right, F.n, F.along)); return g; };
  const fitDist = (wNm, hNm) => { const k = world.pxPerUnit(1), s = world.size, ins = world.inset || {}, Wf = s.w - (ins.right || 0), Hf = s.h - (ins.bottom || 0) - (ins.top || 0); return Math.max(k * wNm / 1000 / (0.9 * Wf), k * hNm / 1000 / (0.82 * Hf)); };
  const PHONE = () => world.size.w < 640;   /* a phone: narrow, the corner box over the picture's top */
  const closeNames = (F, list, solid = [], w = 40, c = F.p) => quest.names.set(list.map(([key, html, spots, o]) => Object.assign({ key, free: true, aside: true, html: `<span class="nm__t">${html}</span>`, spots }, o || {})), HUD(), Object.assign(lr(c.clone().addScaledVector(F.right, -w / 1000), c.clone().addScaledVector(F.right, w / 1000)), { on: true }), solid.filter(Boolean));
  const Y = V(0, 1, 0);
  /* a lipid at its true size, about 3 nm from its head to the ends of its tails: the head about 0.9 nm, two tails */
  const LIPM = { head: magicStandard({ color: 0xff9ac8, roughness: 0.5, emissive: 0x5a1838, emissiveIntensity: 0.15 }, { rim: 0xffd6ea, rimK: 0.4 }), tail: magicStandard({ color: 0xfff0f5, roughness: 0.7 }, { rim: 0xffffff, rimK: 0.15 }) };
  const LIPG = { head: new THREE.SphereGeometry(0.00045, 12, 9), tail: new THREE.CylinderGeometry(0.00011, 0.00011, 0.0021, 6) };
  function lipid3() {
    const g = new THREE.Group(); g.userData.kind = 'lipid';
    const h = new THREE.Mesh(LIPG.head, LIPM.head); h.position.y = 0.00105; h.userData.home = h.position.clone(); g.add(h);
    [-1, 1].forEach(k => { const t = new THREE.Mesh(LIPG.tail, LIPM.tail); t.position.set(k * 0.00017, -0.00045, 0); t.userData.home = t.position.clone(); g.add(t); });
    return g;
  }

  /* ---------------- smooth ER ----------------
     Close up, one tube of the smooth ER cut through, like a textbook's diagram: 50 nm across (the true width of the world's
     tubes), its wall a membrane about 6 nm thick, two layers of lipids drawn one by one (the outer layer faces the
     cytosol, the inner one the inside of the tube), seen straight along the tube, so no surface of it stands behind the
     names. Join makes a lipid from a head and two tails in the cytosol beside the tube; Add to the membrane puts the three
     into gaps in the layer that faces the cytosol (the side where the ER makes its lipids); the camera then goes out and a
     glow spreads along the net. Before: each lipid 650 nm long, about 250 times too big. Proof: tools/true-size.mjs D */
  const SER = world.P.ser.center;
  const SR = { c: 22, n: [181, 144] };   /* the wall's middle 22 nm from the tube's middle (the wall 19 to 25 nm); lipids in each layer */
  const GAPS = [82, 90, 98];             /* the three gaps in the outer layer, at the top (degrees) */
  const serFrame = () => props.sf || (props.sf = frameAt(SER, Y, V(...world.P.ser.view.pos)));
  const sp = (x, y, z) => fp(serFrame(), x, y, z);
  const polar = (deg, r) => [Math.cos(deg * Math.PI / 180) * r, Math.sin(deg * Math.PI / 180) * r];
  const gapDeg = i => { const n0 = SR.n[0]; return Math.round(GAPS[i] / 360 * n0) * 360 / n0; };
  const gapLocal = (i, r) => { const [x, y] = polar(gapDeg(i), r / 1000); return V(x, y, 0); };
  const gapDir = i => { const [x, y] = polar(gapDeg(i), 1); return V(x, y, 0); };
  function serTube() {
    if (props.close) { props.close.visible = true; return props.close; }
    const g = frameGroup(serFrame()); g.userData.kind = 'ser-tube';
    const n0 = SR.n[0], gi = GAPS.map((_, i) => Math.round(GAPS[i] / 360 * n0)), slots = [];
    for (let i = 0; i < n0; i++) if (!gi.includes(i)) slots.push({ deg: i * 360 / n0, out: 1 });
    for (let i = 0; i < SR.n[1]; i++) slots.push({ deg: (i + 0.5) * 360 / SR.n[1], out: -1 });
    const heads = new THREE.InstancedMesh(LIPG.head, LIPM.head, slots.length), tails = new THREE.InstancedMesh(LIPG.tail, LIPM.tail, slots.length * 2);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), one = V(1, 1, 1);
    slots.forEach((s, i) => {
      const [cx, cy] = polar(s.deg, 1), dir = V(cx * s.out, cy * s.out, 0), tan = V(-cy, cx, 0), c = V(cx, cy, 0).multiplyScalar((SR.c + 1.5 * s.out) / 1000);
      q.setFromUnitVectors(Y, dir);
      heads.setMatrixAt(i, M.compose(c.clone().addScaledVector(dir, 0.00105), q, one));
      [-1, 1].forEach((k, j) => tails.setMatrixAt(i * 2 + j, M.compose(c.clone().addScaledVector(dir, -0.00045).addScaledVector(tan, k * 0.00017), q, one)));
    });
    heads.instanceMatrix.needsUpdate = true; tails.instanceMatrix.needsUpdate = true;
    heads.computeBoundingSphere(); tails.computeBoundingSphere();
    heads.userData.kind = 'ser-heads'; g.add(heads, tails);
    /* the inside of the tube, faintly tinted, so that inside and outside differ */
    const lum = new THREE.Mesh(new THREE.CircleGeometry(0.0189, 64), new THREE.MeshBasicMaterial({ color: 0x7fe0c8, transparent: true, opacity: 0.12, depthWrite: false }));
    lum.position.z = -0.0006; g.add(lum);
    return (props.close = keep(g));
  }
  const serClose = () => { serTube(); const F = serFrame(); return nanoIn({ at: fp(F, 0, 8), dir: F.along.clone(), up: F.n.clone(), dist: fitDist(100, 84) }, NEAR_HIDE().concat(groupsOf(['ser']))); };
  /* the names: the membrane beside the tube's wall (its line ends on the wall), the cytosol outside, the inside in it */
  const serBase = () => [
    PHONE() ? ['s-mem', 'membrane of the smooth ER', [sp(0, -22), sp(-8, -20.5), sp(8, -20.5)], { up: 1, len: 34, small: '<span class="nm__t">smooth ER membrane</span>' }]
      : ['s-mem', 'membrane of the smooth ER', [sp(-22, 0), sp(22, 0), sp(-15.6, -15.6), sp(15.6, -15.6)], { sides: [-1, 1, -1, 1], small: '<span class="nm__t">smooth ER membrane</span>' }],
    ['s-cyt', 'cytosol', [sp(-40, 30), sp(40, 30), sp(-40, -27), sp(40, -27), sp(-34, 36), sp(34, 36)], { aside: false }],
    ['s-in', 'inside the smooth ER', [sp(0, -6), sp(0, -10), sp(0, -2)], { aside: false, small: '<span class="nm__t">inside the<br>smooth ER</span>' }]
  ];
  const lipW = (l, y) => props.close.localToWorld(l.position.clone().addScaledVector(Y.clone().applyQuaternion(l.quaternion), y));
  const newLip = i => { const l = lipid3(); l.position.copy(gapLocal(i, 31)); l.quaternion.setFromUnitVectors(Y, gapDir(i)); props.close.add(l); return l; };
  async function lipid() {
    await fly(world.P.ser.view.pos, world.P.ser.view.at);
    await serClose();
    const g = props.close, F = serFrame();
    props.lipids = props.lipids || [];
    closeNames(F, serBase(), [], 45);
    for (let i = props.lipids.length; i < 3; i++) {
      await press(() => g.localToWorld(gapLocal(1, 43)), `Join (${i + 1} of 3)`, { cost: COST.lipid });
      /* a head and two tails, apart in the cytosol, come together into one lipid */
      const l = newLip(i);
      l.children.forEach((c, j) => c.position.add(V(Math.cos(j * 2.1 + 0.4) * 0.0032, Math.sin(j * 2.1 + 0.4) * 0.0032, 0)));
      await Promise.all(l.children.map(c => tween(c, { to: c.userData.home, ms: 900 })));
      burst(scene, lipW(l, 0), { n: 14, r: 0.003, size: 0.0006, near: 0.0005, color: 0xffb3d6, ms: 800 });
      props.lipids.push(l);
      /* the first one: its head and its two tails named */
      const f = props.lipids[0];
      closeNames(F, [...serBase(), ['s-head', 'head', [lipW(f, 0.00105)]], ['s-tails', 'two tails', [lipW(f, -0.00045)]]], [], 45);
    }
    quest.say('Three lipids: each one has a head and two tails, and is about 3 nm long.', 'ok');
  }
  async function layer() {
    await fly(world.P.ser.view.pos, world.P.ser.view.at);
    await serClose();
    const g = props.close, F = serFrame();
    const L = props.lipids && props.lipids.length === 3 ? props.lipids : [0, 1, 2].map(newLip);
    const lipName = () => ['s-lip', 'new lipid', [lipW(L[0], 0.00105), lipW(L[2], 0.00105)], { sides: [1, -1] }];
    closeNames(F, [...serBase(), lipName()], [], 45);
    await press(() => g.localToWorld(gapLocal(1, 43)), 'Add to the membrane', {});
    await Promise.all(L.map((l, i) => tween(l, { to: gapLocal(i, SR.c + 1.5), ms: 1100 })));
    burst(scene, g.localToWorld(gapLocal(1, 25)), { n: 24, r: 0.006, size: 0.0007, near: 0.0006, color: 0xffb3d6 });
    closeNames(F, [...serBase(), lipName()], [], 45);
    quest.say('The new lipids are part of the membrane of the ER. They spread through it, as far as the rough ER.', 'ok');
    await wait(R.TEST ? 0 : 2000);
    quest.names.set([], HUD());
    await nanoOut(world.P.ser.view);
    await live(wave(scene, SER, { color: 0xffc8e4, to: 7, ms: R.FAST ? 0 : 2000 }));
    await quest.gain('lipids', SER);
    props.lipids = null;
    await quest.next('Back to the map');
  }

  /* ---------------- Golgi apparatus ----------------
     Close up, the stack cut through, every size true: six sacs, each two membranes (6 nm, two layers of lipids) round a
     space 18 nm wide, 42 nm apart (electron tomography: the middle of a sac about 20 nm thick, about 10 nm between sacs,
     the rims swollen; Engel et al. 2015, PNAS 112:11264), about 0.9 µm across, a shallow bowl; seen straight at the cut,
     a thin slice, so no surface stands behind the names. The vesicle from the rough ER (70 nm, as there) joins the first
     sac; amylase (about 5 nm: a speck at this size, glowing and named) goes sac by sac: along the sac to its rim, then in
     a small vesicle (about 60 nm) to the next sac's rim. In the third sac the camera goes close (scale bar about 10 nm)
     while three sugars join the short chain of sugars that amylase already carries (some salivary amylase carries sugars;
     the first ones are added in the rough ER). At the top the proteins are sorted: a vesicle to a lysosome about 80 nm,
     the large vesicle 0.9 µm (as the microtubules carry it), which then fills with amylase. The world's own Golgi (its
     sacs drawn about 200 nm apart) is hidden while the camera is close and comes back only once it is far.
     Before: amylase 320 to 360 nm, the vesicles 640 and 840 nm. Proof: tools/true-size.mjs E */
  const G = W.golgi.group;
  const sacPoint = (k) => G.localToWorld(V(1.2, k * 0.2 + 0.25, 0.9));
  const GS = { n: 6, step: 42, th: 30, w: 450, rise: 60 };
  const bowl = x => GS.rise * Math.pow(x / GS.w, 2);
  const sacW = k => GS.w - 12 * k;                    /* half its width */
  /* the middle of sac k at x (nm): a shallow bowl, the rims fanning out (each rim swells, and between the sacs there is
     only about 10 nm: without the fan, neighbouring rims crossed) */
  const sacY = (k, x = 0) => k * GS.step + bowl(x) + (k - 2.5) * 30 * smooth(sacW(k) - 150, sacW(k) - 20, Math.abs(x));
  function golgiFrame() {
    if (props.gf) return props.gf;
    const n = Y.clone().applyQuaternion(G.getWorldQuaternion(new THREE.Quaternion())).normalize();
    return (props.gf = frameAt(sacPoint(0), n, V(...world.P.golgi.view.pos)));
  }
  const gp = (x, y, z) => fp(golgiFrame(), x, y, z);
  /* sac k's outline, inset nm inside its outer surface: flat, swollen at its rims, its ends rounded */
  function sacPts(k, inset) {
    const w = sacW(k) - inset, hf = x => GS.th / 2 - inset + 14 * smooth(w - 90, w - 10, Math.abs(x)), P = [];
    const cy = sacY(k, w), r = hf(w);
    for (let i = 0; i <= 40; i++) { const x = -w + 2 * w * i / 40; P.push(new THREE.Vector2(x, sacY(k, x) + hf(x))); }
    for (let i = 1; i < 12; i++) { const a = Math.PI / 2 - Math.PI * i / 12; P.push(new THREE.Vector2(w + r * Math.cos(a), cy + r * Math.sin(a))); }
    for (let i = 0; i <= 40; i++) { const x = w - 2 * w * i / 40; P.push(new THREE.Vector2(x, sacY(k, x) - hf(x))); }
    for (let i = 1; i < 12; i++) { const a = -Math.PI / 2 - Math.PI * i / 12; P.push(new THREE.Vector2(-w + r * Math.cos(a), cy + r * Math.sin(a))); }
    return P;
  }
  function golgiStack() {
    if (props.close) { props.close.visible = true; return props.close; }
    const g = frameGroup(golgiFrame()); g.userData.kind = 'golgi-stack';
    const head = magicStandard({ color: 0xeaa632, roughness: 0.4, emissive: 0x4a2c04, emissiveIntensity: 0.2 }, { rim: 0xffe0a0, rimK: 0.4 });
    const tail = magicStandard({ color: 0xfff3d6, roughness: 0.7 }, { rim: 0xffffff, rimK: 0.15 });
    const lumM = new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
    const band = (k, a, b, m, kind) => {
      const s = new THREE.Shape(sacPts(k, a)); s.holes.push(new THREE.Path(sacPts(k, b)));
      const geo = new THREE.ExtrudeGeometry(s, { depth: 3, bevelEnabled: false }); geo.translate(0, 0, -1.5); geo.scale(0.001, 0.001, 0.001);
      const mesh = new THREE.Mesh(geo, m); if (kind) { mesh.userData.kind = kind; mesh.userData.k = k; } g.add(mesh);
    };
    for (let k = 0; k < GS.n; k++) {
      band(k, 0, 1.2, head, 'golgi-sac'); band(k, 1.2, 4.8, tail); band(k, 4.8, 6, head);
      const lg = new THREE.ShapeGeometry(new THREE.Shape(sacPts(k, 6))); lg.scale(0.001, 0.001, 0.001);
      const l = new THREE.Mesh(lg, lumM); l.position.z = -0.0016; l.userData.kind = 'golgi-lumen'; l.userData.k = k; g.add(l);
    }
    return (props.close = keep(g));
  }
  /* the views: the stack's right half with what joins it from below; the top, where the large vesicle forms */
  const GV = { stack: [230, 40, 700, 620], top: [0, 560, 1080, 1270], stackP: [230, 150, 700, 620], topP: [0, 620, 2100, 1270] };
  async function golgiClose(which, ms) {
    golgiStack(); const F = golgiFrame(), [x, y, w, h] = PHONE() ? GV[which + 'P'] : GV[which];
    NZ.late = groupsOf(['golgi']); NZ.keepClose = true;
    /* (and the world's lysosomes: one stood beside the small vesicle to a lysosome, and looked like it) */
    if (!NZ.on) return nanoIn({ at: gp(x, y), dir: F.along.clone(), up: F.n.clone(), dist: fitDist(w, h) }, NEAR_HIDE().concat(groupsOf(['golgi', 'lysosomes'])));
    await camGo({ at: gp(x, y), dir: F.along.clone(), up: F.n.clone(), dist: fitDist(w, h) }, R.FAST ? 0 : (ms || 1800));
  }
  const gNames = (list, solid) => closeNames(golgiFrame(), [['g-sac', 'a sac of the Golgi', [330, 250, -330, 120].map(x => gp(x, sacY(5, x) + 15)), { up: -1, len: 34, small: '<span class="nm__t">a Golgi sac</span>' }], ...list], solid, 300);
  /* spots round a large round part's edge, each name beside it on the outer side: right, up-right, down-right, then left */
  const rimSpots = (F, c, r) => { const P = [], S = []; [0, 40, -40, 180, 140, 220].forEach(d => { const a = d * Math.PI / 180; P.push(c.clone().addScaledVector(F.right, Math.cos(a) * r).addScaledVector(F.n, Math.sin(a) * r)); S.push(Math.cos(a) > 0 ? 1 : -1); }); return [P, { sides: S }]; };
  const OUTSM = { small: '<span class="nm__t">vesicle:<br>out of the cell</span>' }, LYSSM = { small: '<span class="nm__t">to a<br>lysosome</span>' };
  const speckName = a => ['g-amy', 'amylase', ...edge(a.getWorldPosition(V()), 0.0045)];
  /* a speck of amylase that can be found: a soft glow round it */
  const amySpeck = () => { const a = calm(token('amylase', TSZ.amy)); haloSprite(a, 0.009, 0xfff1a8); return a; };
  async function join() {
    await fly(world.P.golgi.view.pos, world.P.golgi.view.at);
    await golgiClose('stack');
    const F = golgiFrame(), x0 = 260, end = gp(x0, sacY(0, x0) - GS.th / 2 - 36);
    const v = calm(keep(token('vesicle', TSZ.ves))), a = amySpeck(); v.add(a); v.position.copy(gp(x0 - 60, -170));
    gNames([['g-ves', 'vesicle from the rough ER', ...edge(v.position, 0.034)], speckName(a)], [v]);
    await press(() => v.position.clone().addScaledVector(F.n, -0.055), 'Join', { side: 'b' });
    await tween(v, { to: end, ms: 1100 });
    /* the vesicle's membrane joins the membrane of the first sac: amylase is inside the sac */
    scene.attach(a); kept.push(a);
    await Promise.all([tween(v, { to: end.clone().addScaledVector(F.n, 0.022), ms: 700, scale: 0.2, fade: 0 }), tween(a, { to: gp(x0, sacY(0, x0)), ms: 1000 })]);
    drop(v); burst(scene, gp(x0, sacY(0, x0)), { n: 16, r: 0.012, size: 0.002, near: 0.001 });
    props.amy = a; props.k = 0;
    gNames([speckName(a)]);
    quest.say('The vesicle from the rough ER, about 70 nm across, joins the first sac. Your amylase is inside it.', 'ok');
  }
  /* three sugars join the end of the short chain that amylase carries, close up */
  const SUGM = magicStandard({ color: 0x8fe3a0, roughness: 0.45, emissive: 0x1f5a2a, emissiveIntensity: 0.25 }, { rim: 0xd8ffe0, rimK: 0.5 });
  const sugarAt = (a, i) => V(0.0004 * Math.sin(i * 1.3), 0.00265 + i * 0.00082, 0.0003 * Math.cos(i * 1.7));
  async function sugars(a) {
    const F = golgiFrame(), view = { at: a.position.clone(), dir: F.along.clone(), up: F.n.clone(), dist: fitDist(34, 28) };
    const glow = a.children.find(c => c.isSprite); if (glow) glow.visible = false;   /* close up it would fill the picture */
    await camGo(view, R.FAST ? 0 : 2000);
    const bead = () => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.0004, 12, 9), SUGM); b.userData.kind = 'sugar'; return b; };
    if (!a.userData.sugars) { a.userData.sugars = [0, 1].map(i => { const b = bead(); b.position.copy(sugarAt(a, i)); a.add(b); return b; }); }
    const chainW = () => a.localToWorld(sugarAt(a, a.userData.sugars.length - 1).clone());
    const body = a.children.find(c => c.isMesh && !c.userData.kind);   /* names keep off amylase itself, not off its sugars */
    closeNames(F, [['g-amy2', 'amylase', ...edge(a.position.clone(), 0.0036)], ['g-sug', 'sugars', [chainW(), chainW()], { sides: [1, -1] }]], [body], 8, a.position);
    quest.say('In the sacs, the Golgi apparatus modifies proteins: it adds sugars to some of them.');
    for (let i = 2; i < 5; i++) {
      const b = bead(); a.add(b); const to = sugarAt(a, i); b.position.copy(to).add(V(0.004 * (i % 2 ? 1 : -1), 0.003, 0));
      await tween(b, { to, ms: 800 });
      a.userData.sugars.push(b);
      burst(scene, a.localToWorld(to.clone()), { n: 8, r: 0.0012, size: 0.00025, near: 0.0002, color: 0xc8ffd0, ms: 600 });
      closeNames(F, [['g-amy2', 'amylase', ...edge(a.position.clone(), 0.0036)], ['g-sug', 'sugars', [chainW(), chainW()], { sides: [1, -1] }]], [body], 8, a.position);
    }
    await wait(R.TEST ? 0 : 1600);
    quest.names.set([], HUD());
    await golgiClose('stack', 2000);
    if (glow) glow.visible = true;
  }
  async function through() {
    await golgiClose('stack');
    const F = golgiFrame();
    const a = props.amy || (() => { const t = keep(amySpeck()); t.position.copy(gp(260, sacY(0, 260))); return (props.amy = t); })();
    props.k = props.k || 0;
    while (props.k < 5) {
      gNames([speckName(a)]);
      await press(() => a.position.clone().addScaledVector(F.right, 0.03), `Next sac (${props.k + 2} of 6)`, { side: 'r' });
      const k = props.k, w = sacW(k), w1 = sacW(k + 1);
      /* along the sac to its rim; a small vesicle buds from the rim with amylase in it, goes to the next sac's rim and joins
         it; amylase moves into the next sac */
      await tween(a, { to: gp(w - 24, sacY(k, w - 24)), ms: 700 });
      const sv = calm(keep(token('vesicle', 0.03))); sv.position.copy(gp(w + 22, sacY(k, w))); sv.scale.setScalar(0.2);
      await Promise.all([tween(sv, { to: sv.position.clone(), ms: 500, scale: 1 }), tween(a, { to: gp(w + 22, sacY(k, w)), ms: 500 })]);
      const up = gp(w1 + 22, sacY(k + 1, w1));
      await Promise.all([tween(sv, { to: up, ms: 800 }), tween(a, { to: up, ms: 800 })]);
      await Promise.all([tween(sv, { to: gp(w1 - 6, sacY(k + 1, w1)), ms: 500, scale: 0.2, fade: 0 }), tween(a, { to: gp(w1 - 110, sacY(k + 1, w1 - 110)), ms: 900 })]);
      drop(sv);
      props.k++;
      if (props.k === 2) await sugars(a);
    }
    gNames([speckName(a)]);
  }
  async function sortgame() {
    await golgiClose('top');
    const F = golgiFrame(), top = gp(60, sacY(5, 60) + 26);
    const out = props.outVes || (props.outVes = calm(keep(token('vesicle', 0.45))));
    out.position.copy(gp(-60, sacY(5, -60) + 15 + 470));
    const lys = props.lysVes || (props.lysVes = calm(keep(token('vesicle', 0.04))));
    lys.position.copy(PHONE() ? gp(720, 220) : gp(400, 330));   /* (on a phone further out: its name stands above it, clear of the large vesicle) */
    lys.userData.shell.material = lys.userData.shell.material.clone(); lys.userData.shell.material.color.setHex(0xff9ac0);
    gNames([['g-out', 'vesicle: out of the cell', ...rimSpots(F, out.position, 0.45), OUTSM], PHONE() ? ['g-lys', 'vesicle: to a lysosome', [lys.position.clone().addScaledVector(F.n, 0.04)], { up: -1, len: 26 }, LYSSM] : ['g-lys', 'vesicle: to a lysosome', ...rimSpots(F, lys.position, 0.04), LYSSM]].map(([k, h, s, o, sm]) => [k, h, s, Object.assign(o, sm)]), [out, lys]);
    const prots = [['amylase', 0], ['lysosome enzyme', 1], ['amylase', 0], ['amylase', 0], ['lysosome enzyme', 1]];
    for (let i = 0; i < prots.length; i++) {
      const dest = prots[i][1];
      let p;
      if (dest) { p = calm(keep(token('protein', 0.003))); const tag = new THREE.Mesh(new THREE.SphereGeometry(0.0007, 10, 8), magicStandard({ color: 0xff5fa8, emissive: 0x6a1038, emissiveIntensity: 0.4 }, { rim: 0xffd0e8, rimK: 0.5 })); tag.position.set(0.0032, 0.001, 0); p.add(tag); haloSprite(p, 0.009, 0xffc8e0); }
      else p = keep(amySpeck());
      p.position.copy(top).addScaledVector(F.n, -0.01);
      await tween(p, { to: top, ms: 400 });
      const lab = quest.hot(() => p.position.clone().addScaledVector(F.n, -0.012), dest ? 'lysosome enzyme · label: to a lysosome' : 'amylase · no label', { cls: 'tag', side: 'b' }); lab.el.disabled = true;
      await new Promise(done => {
        const pick = (to, k, at, side) => quest.hot(at, 'Put it here', { side, right: k === dest }).done.then(async () => {
          if (k !== dest) { quest.say(dest ? 'Read its label: this lysosome enzyme goes to a lysosome.' : 'Amylase has no label: amylase molecules stick together and are packed into the large vesicle that leaves the cell.', 'no'); return; }
          quest.hots.filter(x => x.el.textContent === 'Put it here').forEach(x => x.remove());
          lab.remove(); quest.say('');
          await tween(p, { to: to.position.clone().add(V(0, 0, 0)), ms: 700 }); drop(p);
          done();
        });
        pick(out, 0, () => out.position.clone(), 'c');
        pick(lys, 1, () => lys.position.clone().addScaledVector(F.n, -0.045), 'b');
      });
    }
    quest.say('Every protein is in the right vesicle.', 'ok');
  }
  /* the large vesicle, packed with amylase: very many specks, each about 5 nm */
  const AMYM = magicStandard({ color: 0xf6b84a, roughness: 0.45, emissive: 0x6a4008, emissiveIntensity: 0.25 }, { rim: 0xffe9b0, rimK: 0.5 });
  const AMYG = new THREE.IcosahedronGeometry(0.0026, 0);
  function amyCloud(R0, n) {
    const c = new THREE.InstancedMesh(AMYG, AMYM, n); c.userData.kind = 'amylase-cloud';
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), one = V(1, 1, 1), e = new THREE.Euler();
    for (let i = 0; i < n; i++) { const r = R0 * Math.cbrt(Math.random()), d = V(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(); q.setFromEuler(e.set(Math.random() * 6.3, Math.random() * 6.3, 0)); c.setMatrixAt(i, M.compose(d.multiplyScalar(r), q, one)); }
    c.instanceMatrix.needsUpdate = true; c.computeBoundingSphere(); return c;
  }
  async function packageIt() {
    await golgiClose('top');
    const F = golgiFrame();
    const out = props.outVes || (props.outVes = calm(keep(token('vesicle', 0.45))));
    out.position.copy(gp(-60, sacY(5, -60) + 15 + 470));
    gNames([['g-out', 'vesicle: out of the cell', rimSpots(F, out.position, 0.45)[0], Object.assign(rimSpots(F, out.position, 0.45)[1], OUTSM)]], [out]);
    await press(() => out.position.clone(), 'Package', { side: 'c' });
    out.add(amyCloud(0.43, 6000)); out.userData.packed = true;
    burst(scene, out.position, { n: 50, r: 0.3, size: 0.012, near: 0.006 });
    if (props.lysVes) tween(props.lysVes, { to: props.lysVes.position.clone().addScaledVector(F.right, 0.25).addScaledVector(F.n, 0.15), ms: 1600, fade: 0 });
    gNames([['g-out', 'vesicle: out of the cell', rimSpots(F, out.position, 0.45)[0], Object.assign(rimSpots(F, out.position, 0.45)[1], OUTSM)], ['g-pk', 'amylase', [-40, 40, -140].map(d => out.position.clone().addScaledVector(F.right, Math.cos(d * Math.PI / 180) * 0.43).addScaledVector(F.n, Math.sin(d * Math.PI / 180) * 0.43)), { sides: [1, 1, -1] }]], [out]);
    quest.say('The vesicle is about 0.9 µm across, packed with amylase molecules: each one is a tiny speck at this size.', 'ok');
    await wait(R.TEST ? 0 : 2200);
    quest.names.set([], HUD());
    await nanoOut(world.P.golgi.view);
    await tween(out, { to: out.position.clone().add(V(0.6, 1.1, 0.4)), ms: 1200 });
    await quest.gain('packed', out.position);
    state.use('amylase');
    await quest.next('Back to the map');
  }

  /* ---------------- microtubules, at their true sizes (tracks.js) ----------------
     Daniel, 6 Nov 2026, of the red blood cells at the way in: "I have really gone small"; for this place, 7 Nov 2026:
     "Yes, build it". The place opens on your vesicle from far away. Then the camera comes close, with the scale bar, to
     the microtubule beside it, where the microtubule (25 nm wide), the motor protein and the vesicle (900 nm across) are
     all at their true sizes. The motor protein is dynein, its heads rings 14 nm across, with dynactin (38 nm) and an
     adaptor protein, joined together on the vesicle (tracks.js has every size and its source). Attach: dynein's heads
     land on the microtubule, and it walks seven steps of different sizes (slowed down: a real one moves about 0.9 µm a
     second). The maze is
     seen from far again: there the motor is too small to see (a glow shows where it is), and the microtubules are drawn
     three times thicker, as everywhere in the game (the How big? card says so); while the camera comes close, those fade
     and the true one shows. The vesicle hangs beside its microtubule, held by the motor, never threaded on it. */
  const T = world.P.tracks.center, TV = world.P.tracks.view;
  const TDIR = V(...TV.pos).sub(V(...TV.at)).normalize(), FRONT = V(0, 0, 1);
  /* the vesicle's side of a microtubule: on its left, seen from the cut front of the cell, when the microtubule goes up
     (so that, close up, the motor and the microtubule stand clear of the pupil's bag, top left) */
  const sideOf = a => FRONT.clone().cross(a).normalize();
  const HOLD = TRUE.mt + TRUE.reach + 0.45;            /* from a microtubule's middle to the vesicle's (radius 0.45 µm), across it */
  /* three crossings; each move is 80 % of what it was before 7 Nov 2026, because the vesicle now starts higher */
  const FORKS = [[V(0.4, 1.1, -0.1), V(-1.3, 0.15, 0.3)], [V(-0.2, 1.0, 0.2), V(1.2, -0.1, 0.1)], [V(0.3, 1.2, -0.3), V(-1.2, 0.2, 0.2)]].map(f => f.map(v => v.multiplyScalar(0.8)));
  /* the motor starts on the first microtubule, with the vesicle 1.9 µm further up it than the top of the Golgi
     apparatus, where it waited before: only the cytoplasm and the other vesicles stand round the close view */
  const A0 = FORKS[0][0].clone().normalize();
  const M0 = T.clone().add(V(-0.6, -1.6, 0.4)).addScaledVector(A0, 1.9).addScaledVector(sideOf(A0), -HOLD);
  const frameOf = a => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(a, sideOf(a), a.clone().cross(sideOf(a))));
  /* a microtubule as the game draws it from far: three times thicker than it is (the maze's tracks), a stronger blue
     than the cell's other microtubules, so that a pupil sees which way each one goes (the expert review, 7 Nov 2026:
     they looked like the cell's other pale lines) */
  const drawnTrack = (from, to) => keep(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(from, to), 8, 0.035, 6), new THREE.MeshBasicMaterial({ color: 0x38c8ff, transparent: true, opacity: 1 })));
  /* something that changes every frame for ms milliseconds (fn gets 0 … 1); it stops if the pupil leaves */
  const moveFor = (ms, fn) => live(new Promise(res => { const t0 = performance.now();
    const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms); fn(k); world.kick(); if (k < 1) requestAnimationFrame(f); else res(); }; f(); }));
  /* the motor and your vesicle, built once in the place (a pupil who comes back to the maze has them at the start) */
  function rig() {
    if (props.rig) return props.rig;
    const mot = trueMotor(), ves = token('vesicle', 0.45), core = amylaseCore(0.45, 70000, 300), glow = glowSprite(0xff6ec4);
    /* the vesicle on the adaptor's end, a little behind dynein's heads (towards the plus end): it is towed */
    ves.add(core); ves.position.set(TRUE.lag, HOLD, 0); mot.cargo.add(ves);
    glow.position.set(-0.02, TRUE.mt + 0.035, 0); mot.group.add(glow);
    keep(mot.group); mot.group.position.copy(M0); mot.group.quaternion.copy(frameOf(A0));
    return (props.rig = { mot, ves, core, glow, at: M0.clone(), a: A0.clone() });
  }
  /* every frame while in the place: the scale bar; between 3.5 and 1.8 µm, while the bar still reads 1 µm or 500 nm,
     what is drawn bigger than it is fades: the microtubules drawn three times thicker (the true one shows instead), the
     free ribosomes (drawn 4 times bigger) and the cytosol's motes of light, so that close up nothing is drawn bigger
     (the expert review, 7 Nov 2026: at 200 nm they still showed); the motor's glow keeps one size on the screen and goes
     once the motor itself shows; each amylase dot is drawn 5 nm across at any distance */
  const TS = { tick: 0, fade: null };
  const railFade = () => { const m = W.groups.microtubules && W.groups.microtubules.children[0]; return m && m.material.uniforms && m.material.uniforms.uFade; };
  /* the ribosomes' material is shared by the free ones and the rough ER's (far below here): seen through while this
     place is open, as it was before when it closes */
  function tracksFade(k) {
    const rib = W.groups['free-ribosomes'], mot = W.groups.cytosol;
    if (!TS.fade) { if (!rib || !mot) return; TS.fade = { rib: rib.material, tr: rib.material.transparent, mot: mot.material.uniforms.uOpacity.value }; rib.material.transparent = true; rib.material.needsUpdate = true; }
    if (k == null) {
      TS.fade.rib.transparent = TS.fade.tr; TS.fade.rib.opacity = 1; TS.fade.rib.needsUpdate = true; mot.material.uniforms.uOpacity.value = TS.fade.mot;
      rib.visible = true; mot.visible = true; TS.fade = null; return;
    }
    TS.fade.rib.opacity = k; rib.visible = k > 0.01; mot.material.uniforms.uOpacity.value = TS.fade.mot * k; mot.visible = k > 0.01;
  }
  function tracksLoop(on) {
    if (on && !TS.tick) {
      const f = () => {
        if (!TS.tick) return;
        const cam = world.camera, d = cam.position.distanceTo(world.controls.target), far = smooth(1.8, 3.5, d), u = railFade();
        if (u) u.value = far;
        (props.drawn || []).forEach(m => { m.material.opacity = far; m.visible = far > 0.002; });
        if (props.near) { props.near.material.opacity = 1 - far; props.near.visible = far < 0.998; }
        tracksFade(far);
        const r = props.rig;
        if (r) {
          r.glow.visible = d > 0.5; r.glow.material.opacity = smooth(0.5, 1.4, d); r.glow.scale.setScalar(d * 0.075);
          const p = r.core.userData.points; p.material.size = p.userData.nm * world.fullH / (world.size.h * Math.tan(cam.fov * Math.PI / 360));
        }
        scaleBar(d);
        TS.tick = requestAnimationFrame(f);
      };
      TS.tick = requestAnimationFrame(f);
    } else if (!on && TS.tick) {
      cancelAnimationFrame(TS.tick); TS.tick = 0; if (bar) bar.hidden = true;
      const u = railFade(); if (u) u.value = 1;
      if (TS.fade) tracksFade(null);
    }
  }
  /* close to the motor, from the cut front of the cell (nothing stands there), a little from the microtubule's other
     side, so that the vesicle looms over it; dynein and dynactin in the middle of the picture, clear of the bag. The
     camera turns as it comes close (40 degrees), so that dynein's heads are at the top and dynactin hangs below them
     towards the vesicle: then each part's name has a height of its own (seen with the microtubule upright, they lay in
     one row across the picture) */
  const closeView = r => { const n = sideOf(r.a), f = FRONT.clone().addScaledVector(r.a, -r.a.z).normalize(), phone = world.size.w < 640;
    /* on a phone, closer, and dynein lower in the picture, below the tools, with the microtubule further in */
    return { at: r.at.clone().addScaledVector(n, phone ? 0.05 : 0.045).addScaledVector(r.a, phone ? -0.004 : -0.015), dist: phone ? 0.25 : 0.22, dir: f.multiplyScalar(Math.cos(0.18)).addScaledVector(n, -Math.sin(0.18)).normalize(),
      up: r.a.clone().multiplyScalar(0.94).addScaledVector(n, -0.34).normalize() }; };
  /* the names close up, each with its true size (on a phone too): dynein's ends on its front head, dynactin's on its
     filament, the adaptor's between dynactin and the vesicle, as they are now; the vesicle's two on its skin and its
     amylase, on their side (left), the microtubule's on its own (right), so that no line crosses the microtubule; on a
     phone the proteins' names stand beside them, so that they do not hide them (the expert review, 7 Nov 2026) */
  function nearNames(r) {
    const n = sideOf(r.a), P = (x, y) => r.mot.group.localToWorld(V(x, y, 0)), c = r.ves.getWorldPosition(V(0, 0, 0));
    /* a point of the vesicle's skin (or just inside it), deg degrees round from its edge nearest the microtubule
       towards the camera, and along µm round it, along the microtubule: on the sphere itself, wherever the camera is */
    const cam = world.camera.position.clone().sub(c); cam.addScaledVector(n, -cam.dot(n)).normalize();
    const onVes = (deg, along, inside = 0) => { const t = deg * Math.PI / 180, b = along / 0.45;
      const d = n.clone().multiplyScalar(-Math.cos(t) * Math.cos(b)).addScaledVector(cam, Math.sin(t) * Math.cos(b)).addScaledVector(r.a, Math.sin(b)).normalize();
      return c.clone().addScaledVector(d, 0.45 - inside); };
    const t = (a, b) => '<span class="nm__t">' + a + (b ? '<br>' + b : '') + '</span>', phone = world.size.w < 640;
    quest.names.set([
      { key: 't-mt', free: true, side: 'R', html: t('microtubule:', '25 nm wide'), small: t('microtubule:', '25 nm'), spots: (phone ? [-0.06, -0.075, -0.05, -0.09] : [-0.035, -0.02, -0.005, 0.01, 0.025, -0.05]).map(x => P(x, 0)) },
      { key: 't-mot', free: true, side: 'L', aside: true, html: t('dynein:', 'each head 14 nm'), small: t('dynein:', 'each head 14 nm'), spots: r.mot.spots.dynein() },
      { key: 't-dyn', free: true, side: 'L', aside: true, prefer: -1, html: t('dynactin: 38 nm long'), small: t('dynactin:', '38 nm'), spots: r.mot.spots.dynactin() },
      { key: 't-ada', free: true, side: 'L', aside: true, html: t('adaptor protein'), small: t('adaptor', 'protein'), spots: r.mot.spots.adaptor() },
      /* the vesicle's names below the adaptor's, on its skin a little down the microtubule (the picture is turned, so
         there its skin is right of the names' column) */
      { key: 't-ves', free: true, side: 'L', html: t('your vesicle: 900 nm'), small: t('your vesicle: 900 nm'), spots: [-0.014, -0.02, -0.017, -0.008, -0.011, -0.026].map(u => onVes(0, u)).concat(phone ? [[30, 0.01], [40, -0.02], [30, 0.04], [45, 0.03]].map(([d, u]) => onVes(d, u)) : []) },
      { key: 't-amy', free: true, side: 'L', html: t('amylase: 5 nm'), small: t('amylase: 5 nm'), spots: (phone ? [[-0.015, 0.03], [-0.005, 0.03], [0.015, 0.03], [0.03, 0.035], [-0.03, 0.02], [0.045, 0.04], [0.06, 0.03]].map(([u, inside]) => onVes(0, u, inside)) : [-0.036, -0.03, -0.042, -0.046, -0.05].map(u => onVes(2, u, 0.006))) }
    /* the edges of what is named: just inside the vesicle's skin, nearest the microtubule, on one side; just past the
       microtubule, by dynein, on the other (names.js stands names outside them and uses only spots inside them) */
    ], HUD2(), lr(onVes(0, 0, 0.012), P(-0.02, -0.022)));
  }
  async function grab() {
    /* the words follow the picture (Daniel's rule): the step names dynein, dynactin and the rest only once the camera is
       close enough to show them */
    const later = quest.step ? [...quest.step.li.querySelectorAll('.step__t p')].slice(1) : [];
    later.forEach(p => { p.hidden = true; });
    await fly(TV.pos, TV.at);
    const r = rig(); r.mot.reach(0); r.mot.pose(0, 0);
    /* the first microtubule twice in one place: drawn as seen from far, and at its true size for the close view */
    props.drawn = [drawnTrack(M0.clone().addScaledVector(FORKS[0][0], -0.7), M0.clone().add(FORKS[0][0]))];
    props.near = keep(trueTrack(M0.clone().addScaledVector(A0, -1.0), M0.clone().addScaledVector(A0, 1.0)));
    tracksLoop(true);
    await wait(900);
    await camGo(closeView(r), 3800);
    later.forEach(p => { p.hidden = false; });
    if (later.length) quest.reveal(later[later.length - 1]);
    nearNames(r);
    /* the button on the microtubule, down it, below dynein and dynactin: on a phone, next to the motor, it hid dynein */
    await press(() => r.mot.group.localToWorld(V(-0.06, -0.015, 0)), 'Attach', { side: 'b' });
    quest.names.set([]);
    /* dynein's two heads land on the microtubule; now it walks */
    await moveFor(1100, k => r.mot.reach(k * k * (3 - 2 * k)));
    quest.say('<p>Dynein now walks and carries your vesicle.</p><p>Each time one head steps, your vesicle moves forward, most often 8&nbsp;nm. Some steps are longer, and some go backwards or to the side.</p><p>A real one walks about 70 times faster: about 900&nbsp;nm every second.</p>', 'ok');
    /* the camera follows dynein, so that it stays in the free part of the picture as it walks 48 nm */
    const walked = closeView({ at: r.at.clone().addScaledVector(r.a, TRUE.walk), a: r.a });
    await Promise.all([(async () => { for (let i = 0; i < STEPS.length; i++) await moveFor(560, e => r.mot.pose(i, e)); })(), camGo(walked, STEPS.length * 560)]);
    /* the seven steps kept: the motor's frame moves on 48 nm, and its parts go back to their first places (no change seen:
       each head's own steps add up to 48 nm) */
    r.at.addScaledVector(r.a, TRUE.walk); r.mot.group.position.copy(r.at); r.mot.pose(0, 0);
    nearNames(r);
    await quest.next();
  }
  /* three crossings: at each, the microtubule the vesicle is on meets one that lies across the cell; microtubules never
     branch, and the motor walks one way along them (towards their top end), so the pupil chooses which one to step onto */
  async function maze() {
    tracksLoop(true);
    const r = rig();
    if (!props.drawn) r.mot.reach(1);            /* a pupil who comes back to this step: the motor already holds it */
    quest.names.set([]);
    /* from as far away as the place's own view, the camera follows your vesicle: the crossing it is at in the middle
       (from the place's own view the maze climbed out of the top of the picture) */
    const DFAR = V(...TV.pos).distanceTo(V(...TV.at));
    const viewAt = (p, a) => ({ at: p.clone().addScaledVector(sideOf(a), HOLD * 0.5), dist: DFAR, dir: TDIR.clone(), up: V(0, 1, 0) });
    if (world.camera.position.distanceTo(world.controls.target) < 3) await camGo(viewAt(r.at, r.a), 3000);
    else { await fly(TV.pos, TV.at); await camGo(viewAt(r.at, r.a), 900); }
    /* the motor walks to a point of a microtubule; at a crossing the vesicle swings round to the new one's side
       (turn false: back along the same microtubule after a wrong choice, the vesicle stays where it hangs) */
    const walk = (to, ms, turn = true) => {
      const from = r.at.clone(), a1 = to.clone().sub(from).normalize(), q0 = r.mot.group.quaternion.clone(), q1 = turn ? frameOf(a1) : q0;
      return moveFor(ms, k => { r.at.copy(from).lerp(to, k * k * (3 - 2 * k)); r.mot.group.position.copy(r.at); r.mot.group.quaternion.slerpQuaternions(q0, q1, smooth(0, 0.35, k)); })
        .then(() => { if (turn) r.a.copy(a1); });
    };
    /* the motor turns onto the microtubule it is on now (each piece of the maze leans a little differently): the vesicle
       swings round it to that microtubule's side */
    const turnTo = (a1, ms) => { const q0 = r.mot.group.quaternion.clone(), q1 = frameOf(a1); return moveFor(ms, k => r.mot.group.quaternion.slerpQuaternions(q0, q1, k * k * (3 - 2 * k))).then(() => { r.a.copy(a1); }); };
    /* the vesicle waits 0.65 µm before each crossing: its edge is only 90 nm from its microtubule, so a microtubule
       through the motor's own point would pass through it; one that would still pass too close lies deeper (they cross
       at different depths), turned about the line to the vesicle, away from the camera, until the vesicle is clear */
    const GAP = 0.65;
    const segDist = (p, a, b) => { const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq())); return a.clone().addScaledVector(ab, t).distanceTo(p); };
    const clearOf = (X, to) => {
      const c = r.ves.getWorldPosition(V(0, 0, 0)), d = to.clone().sub(X), L = d.length();
      const w = c.clone().sub(X).cross(d).normalize(); if (w.lengthSq() < 0.5) w.copy(TDIR).negate(); else if (w.dot(TDIR) > 0) w.negate();
      for (let b = 0; b <= 1.5; b += 0.05) {
        const t = X.clone().add(d.clone().addScaledVector(w, b * L));
        if (segDist(c, X.clone().lerp(t, -0.7), t) >= 0.5) return t;
      }
      return to;
    };
    for (let f = 0; f < FORKS.length; f++) {
      const u = FORKS[f][0].clone().normalize();
      if (r.a.angleTo(u) > 0.01) await turnTo(u, 600);
      const here = r.at.clone(), X = here.clone().addScaledVector(u, GAP), up = here.clone().add(FORKS[f][0]), down = clearOf(X, X.clone().add(FORKS[f][1]));
      /* each microtubule runs on through the crossing, so the two cross instead of splitting; the motor's own runs back
         past the vesicle */
      const lines = [drawnTrack(here.clone().addScaledVector(FORKS[f][0], -0.7), up), drawnTrack(X.clone().lerp(down, -0.7), down)];
      (props.drawn || []).forEach(drop); props.drawn = lines;
      if (props.near) { drop(props.near); props.near = null; }
      const order = Math.random() < 0.5 ? [0, 1] : [1, 0];
      /* each button stands 0.35 µm past the end of its microtubule, with the same words on both: a pupil looks at where
         each one goes (the expert review, 7 Nov 2026: arrows on them gave the answer, and on a phone they hid the
         vesicle and the crossing); a screen reader still hears which is which */
      const past = (from, to) => to.clone().addScaledVector(to.clone().sub(from).normalize(), 0.35);
      await new Promise(done => {
        order.forEach(i => {
          const to = i === 0 ? up : down, at = i === 0 ? past(here, up) : past(X, down);
          quest.hot(() => at.clone(), 'this one', { side: 'c', aria: i === 0 ? 'the microtubule that goes up' : 'the microtubule that lies across the cell', right: i === 0 }).done.then(async (b) => {
            if (!quest.energy(COST.step)) return;
            quest.clearHots();
            if (i === 1) {
              quest.say('This microtubule lies across the cell: on it, your vesicle moves to the side, not to the top. Amylase must reach the top, next to the duct. Choose again.', 'no');
              /* to the crossing, onto the other microtubule a little way, then back to where it waited */
              await walk(X, 500); await walk(X.clone().lerp(down, 0.45), 900); await walk(X, 600, false); await turnTo(u, 300); await walk(here, 500, false);
              done('again');
              return;
            }
            quest.say('');
            await Promise.all([walk(up, 1500), camGo(viewAt(up, u), 1500)]);
            done('up');
          });
        });
      }).then(async (res) => { if (res === 'again') f--; });
    }
    (props.drawn || []).forEach(drop); props.drawn = [];
    const vp = () => r.ves.getWorldPosition(V(0, 0, 0));
    const g = W.granules.filter(x => x.p.y > 12.5).sort((a, b) => a.p.distanceTo(vp()) - b.p.distanceTo(vp()))[0];
    if (g) {
      const goal = g.p.clone().add(V(0.9, -0.3, 0.6)), a1 = goal.clone().sub(vp()).normalize(), to = goal.addScaledVector(sideOf(a1), -HOLD);
      await Promise.all([walk(to, 1200), camGo(viewAt(to, a1), 1200)]);
    }
    await quest.gain('top', vp());
    state.use('packed');
    /* the vesicle waits at the top with the others; the motor lets it go */
    scene.attach(r.ves); kept.push(r.ves); drop(r.mot.group); props.rig = null;
    await quest.next('Back to the map');
  }

  /* ---------------- the way out ----------------
     The vesicle is about 1 µm across (a zymogen granule, as the world draws them), packed with amylase, each molecule
     about 5 nm: a speck at this size. Close up at the top of the cell, the cell membrane as a section (about 6 nm), the
     camera level with it (no surface of it behind the names); Release: the two membranes join, an opening widens, the
     amylase streams out into the lumen, and the opening closes as the vesicle's membrane becomes part of the cell
     membrane. Then, from far away, a glow shows the amylase flowing on to the duct. Before: one amylase molecule almost
     half the vesicle's width (about 90 times too big), and 14 streaming out about 50 times too big.
     Proof: tools/true-size.mjs F */
  const TOP = world.P.exit.center, FUSE = V(0.2, 16.05, 0.5), GR = 0.5;
  const exitFrame = () => props.xf || (props.xf = frameAt(FUSE, Y, V(...world.P.exit.view.pos)));
  const xp = (x, y, z) => fp(exitFrame(), x, y, z);
  const granule = () => { const v = keep(token('vesicle', GR)); v.add(amyCloud(GR - 0.03, 7000)); return v; };
  /* the cell membrane close up: two halves that meet where the vesicle joins it, each 3 µm wide, running away from the
     camera; heads (pink, about 1 nm) on each side of the tails (paler), about 6 nm in all */
  function exitMembrane() {
    if (props.close) { props.close.visible = true; return props.close; }
    const g = frameGroup(exitFrame()); g.userData.kind = 'cell-membrane';
    const head = magicStandard({ color: 0xff9ac8, roughness: 0.5 }, { rim: 0xffd6ea, rimK: 0.4 }), tail = magicStandard({ color: 0xfff0f5, roughness: 0.7 }, { rim: 0xffffff, rimK: 0.15 });
    g.userData.halves = [-1, 1].map(s => {
      const h = new THREE.Group();
      [[1.8, 3, head], [-1.8, 1.8, tail], [-3, -1.8, head]].forEach(([y0, y1, m]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(3, (y1 - y0) / 1000, 0.5), m); b.position.set(s * 1.5, (y0 + y1) / 2000, -0.25); h.add(b); });
      g.add(h); return h;
    });
    return (props.close = keep(g));
  }
  /* the camera's eye level with the membrane: the view's middle a little below it (where the vesicle is) */
  const exitClose = () => { exitMembrane(); const F = exitFrame(), at = PHONE() ? -150 : -380, dist = PHONE() ? fitDist(2100, 1500) : fitDist(1560, 1440), a = Math.asin(-at / 1000 / dist), dir = F.along.clone().multiplyScalar(Math.cos(a)).addScaledVector(F.n, Math.sin(a)).normalize();
    /* (hidden too while close: the world's other vesicles, whose amylase it draws as one large core, the centrioles, the
       light's beams and the neighbouring cells of the gland, whose vesicles and edges stood round the close-up) */
    return nanoIn({ at: xp(0, at), dir, up: F.n.clone(), dist }, NEAR_HIDE().concat(groupsOf(['membrane', 'apex', 'granules', 'centrosome', 'beam', 'acinus']))); };
  const xBase = () => [
    ['x-mem', 'cell membrane', [xp(-640, 0), xp(640, 0), xp(-560, 0), xp(560, 0)], { up: -1, len: 30 }],
    ['x-out', 'outside the cell', [xp(-420, 230), xp(420, 230), xp(-560, 160), xp(560, 160), xp(-760, 200), xp(760, 200)], { aside: false, small: '<span class="nm__t">outside<br>the cell</span>' }],
    ['x-in', 'inside the cell', [xp(-640, -260), xp(640, -260), xp(-640, -560), xp(640, -560), xp(-780, -500), xp(780, -500)], { aside: false, small: '<span class="nm__t">inside<br>the cell</span>' }]
  ];
  async function smell() {
    await fly(world.P.exit.view.pos, world.P.exit.view.at);
    const ves = props.ves || (props.ves = granule()); ves.position.copy(TOP).add(V(0.6, -0.5, 1.1));
    await press(() => TOP.clone().add(V(-2.2, 0.3, 1.4)), '🍞 Smell the bread', {});
    W.nerve.tube.visible = true; W.nerve.end.visible = true;
    const look = { pos: [9, 9.5, 14], at: [3, 6.5, -1] };
    await live(world.flyTo(look, { ms: 1800 }));
    const e = W.nerve.end; const em = e.material; em.emissive = em.emissive || new THREE.Color(); em.emissive.setHex(0xffd84a); em.emissiveIntensity = 1.6;
    burst(scene, e.position, { color: 0xffe08a, n: 60, r: 0.9 });
    await live(wave(scene, e.position, { to: 18, ms: R.FAST ? 0 : 3000 }));
    em.emissiveIntensity = 0.3;
    await fly(world.P.exit.view.pos, world.P.exit.view.at, 1600);
    quest.say('The message reaches the vesicles at the top of the cell.', 'ok');
  }
  async function fuse() {
    const ves = props.ves || (() => { const t = granule(); t.position.copy(TOP).add(V(0.6, -0.5, 1.1)); return (props.ves = t); })();
    await exitClose();
    const F = exitFrame(), cloud = ves.children.find(c => c.userData.kind === 'amylase-cloud');
    await tween(ves, { to: xp(0, -(GR * 1000 + 4)), ms: 1400 });
    const someSpeck = (x, y) => { const M = new THREE.Matrix4(), v = V(), aim = xp(x, y); let best = null, bd = Infinity; for (let i = 0; i < cloud.count; i += 7) { cloud.getMatrixAt(i, M); v.setFromMatrixPosition(M); const w = cloud.localToWorld(v.clone()), d = w.distanceTo(aim); if (d < bd) { bd = d; best = w; } } return best; };
    closeNames(F, [...xBase(), ['x-ves', 'vesicle', ...rimSpots(F, ves.position, GR)], ['x-amy', 'amylase', [someSpeck(-445, -560), someSpeck(445, -420), someSpeck(-420, -320)], { sides: [-1, 1, -1] }]], [ves], 700);
    await press(() => xp(GR * 1000 + 30, -GR * 1000), 'Release', { side: 'r' });
    /* the membranes join: an opening widens; the vesicle flattens into it; its amylase streams out into the lumen */
    quest.names.set([], HUD());
    const [L, Rh] = props.close.userData.halves, gap = 0.21;
    scene.attach(cloud);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), one = V(1, 1, 1), n = cloud.count, from = [], to = [], mid = [], t0s = [];
    for (let i = 0; i < n; i++) {
      cloud.getMatrixAt(i, M); const p = V().setFromMatrixPosition(M); from.push(p);
      const ox = (Math.random() - 0.5) * 0.36, ex = ox * 2.4 + (Math.random() - 0.5) * 0.9;
      mid.push(cloud.worldToLocal(xp(ox * 1000, 12)));
      to.push(cloud.worldToLocal(xp(ex * 1000, 60 + Math.random() * 520, (Math.random() - 0.5) * 200)));
      t0s.push(Math.pow(Math.random(), 0.7) * 1500);
    }
    const t0 = performance.now(), s0 = quest.session, T = R.FAST ? 0 : 3400;
    await live(new Promise(res => {
      const f = () => {
        if (quest.session !== s0) return res();
        const t = R.FAST ? 1e9 : performance.now() - t0, open = smooth(0, 900, t) * (1 - smooth(2600, 3400, t));
        L.position.x = -gap * open; Rh.position.x = gap * open;
        const k = smooth(200, 1700, t); ves.scale.set(1 + 0.15 * k, Math.max(0.02, 1 - k), 1 + 0.15 * k); ves.position.copy(xp(0, -(GR * 1000 + 4) * Math.max(0.02, 1 - k)));
        if (ves.userData.shell) { const m = ves.userData.shell.material; m.opacity = 0.42 * (1 - smooth(1700, 2800, t)); }
        for (let i = 0; i < n; i++) {
          const u = Math.max(0, Math.min(1, (t - 300 - t0s[i]) / 1500)), e = u * u * (3 - 2 * u);
          const p = e < 0.5 ? from[i].clone().lerp(mid[i], e * 2) : mid[i].clone().lerp(to[i], e * 2 - 1);
          cloud.setMatrixAt(i, M.compose(p, q, one));
        }
        cloud.instanceMatrix.needsUpdate = true; cloud.computeBoundingSphere(); world.kick && world.kick();
        if (t < T + 1500) requestAnimationFrame(f); else res();
      };
      f();
    }));
    L.position.x = 0; Rh.position.x = 0; drop(ves); props.ves = null; kept.push(cloud);
    burst(scene, xp(0, 40), { n: 40, r: 0.12, size: 0.006, near: 0.004, color: 0xc8fff0 });
    closeNames(F, [...xBase(), ['x-amy', 'amylase', [xp(-300, 380), xp(300, 380), xp(0, 300)].map(p => { let best = p, bd = Infinity; const v = V(); for (let i = 0; i < n; i += 9) { cloud.getMatrixAt(i, M); v.setFromMatrixPosition(M); const w = cloud.localToWorld(v.clone()), d = w.distanceTo(p); if (d < bd) { bd = d; best = w; } } return best; })]], [], 700);
    quest.say('Exocytosis: the amylase leaves the cell and enters the duct.', 'ok');
    await wait(R.TEST ? 0 : 2400);
    quest.names.set([], HUD());
    await nanoOut(world.P.exit.view);
    drop(cloud);
    /* from far away each molecule is far too small to see: glows show the amylase flowing on, to the duct */
    const path = W.lumen.path, glows = [];
    for (let i = 0; i < 10; i++) { const g = keep(new THREE.Group()); haloSprite(g, 0.09, 0xc8fff0); g.position.copy(FUSE); glows.push(g); }
    await Promise.all(glows.map((g, i) => new Promise(r => setTimeout(() => tween(g, { path: new THREE.CatmullRomCurve3([FUSE.clone(), path.getPointAt(0.05 + i * 0.01), path.getPointAt(0.3 + i * 0.03)]), ms: 2600 }).then(r), R.FAST ? 0 : i * 140))));
    glows.forEach(drop);
    await quest.gain('saliva', FUSE);
    state.use('top');
  }
  async function flatten() { await quest.next('Back to the map'); }

  /* ---------------- the start (simple, full, the mission) ---------------- */
  /* the names in the first place are laid out as the map's are (names.js): each on ONE level line that ends on its part,
     names a row apart and never over one another (Daniel's rule, memory label-lines-never-cross), several spots per
     part so every name finds a free row; they show while the camera is still */
  const spotsOf = (g, n = 8) => {
    const pts = [], m = new THREE.Matrix4(); if (!g) return pts; g.updateMatrixWorld(true);
    g.traverse(o => {
      if (pts.length >= n || !o.isMesh) return;
      if (o.isInstancedMesh) { const k = Math.max(1, Math.floor(o.count / n)); for (let i = 0; i < o.count && pts.length < n; i += k) { o.getMatrixAt(i, m); pts.push(new THREE.Vector3().setFromMatrixPosition(m).applyMatrix4(o.matrixWorld)); } }
      else pts.push(o.getWorldPosition(new THREE.Vector3()));
    });
    return pts;
  };
  const nameOf = (key, text, spots, own, cls = '') => ({ key, text, html: `<span class="nm__t">${text}</span>`, cls, spots: spots.filter(Boolean), own: own.filter(Boolean) });
  const HUD = () => [document.querySelector('.hud')];
  async function simple() {
    world.simple(true);
    const G = W.groups, P = world.P;
    quest.names.set([
      nameOf('membrane', 'cell membrane', [V(-6.2, 9.5, 0.2), V(6.1, 9.2, 0.2), V(-6.7, 5.2, 0.6), V(6.6, 5.0, 0.6), V(-5.4, 12.6, 0.3), V(5.3, 12.4, 0.3)], [G.membrane], 'is-y7'),
      nameOf('cytoplasm', 'cytoplasm', [V(-3.0, 12.6, 1.0), V(3.0, 12.2, 1.2), V(-3.8, 9.0, 1.8), V(3.8, 8.6, 1.8), V(-2.2, 14.0, 0.8)], [G.cytosol], 'is-y7'),
      nameOf('nucleus', 'nucleus', P.nucleus.spots, [N.group], 'is-y7'),
      nameOf('mito', 'mitochondrion', P.mito.spots.concat(spotsOf(G.mitochondria, 8)), [G.mitochondria], 'is-y7'),
      nameOf('ribo', 'ribosome', P.ribosome.spots.concat(W.freeRibosomes.slice(0, 40).filter((r, i) => i % 5 === 0).map(r => r.p.clone())), [G['free-ribosomes'], G.rer], 'is-y7')
    ], HUD());
    await quest.next();
    quest.names.set([]);
  }
  /* each structure an electron microscope shows appears in turn, and its name joins the others */
  async function full() {
    const b = quest.hot(() => V(0, 10.5, 3), 'Show everything', { side: 'c', cls: 'big' });
    await b.done; b.remove();
    const G = W.groups, P = world.P;
    const show = [
      ['rer', P.rer.center, [nameOf('rer', 'rough ER', P.rer.spots, [G.rer])]],
      /* the nucleus closed (the pupil has not been inside yet: the inside is seen first in the dive): named "nucleus", as in
         the Year 7 view before (Daniel, 9 Nov 2026: it had been named "nuclear pore", for its pores, and "it should be
         nucleus") */
      world.nucOpen ? ['nucleus-inside', P.nucleolus.center, [nameOf('nucleolus', 'nucleolus', P.nucleolus.spots, [N.group]),
        nameOf('chromosomes', 'chromosome', W.chromosomes.slice(0, 12).map(ch => inN(ch.curve.getPointAt(0.5))), [N.group])]]
        : ['nucleus-inside', inN(N.front[0].p), [nameOf('nucleus', 'nucleus', P.nucleus.spots, [N.group])]],
      ['ser', P.ser.center, [nameOf('ser', 'smooth ER', P.ser.spots, [G.ser])]],
      ['golgi', P.golgi.center, [nameOf('golgi', 'Golgi apparatus', P.golgi.spots, [G.golgi])]],
      ['granules', P.exit.center, [nameOf('vesicles', 'vesicle', W.granules.slice(0, 40).filter((g, i) => i % 4 === 0).map(g => g.p.clone()), [G.granules])]],
      ['microtubules', P.tracks.center, [nameOf('tracks', 'microtubule', P.tracks.spots, [G.microtubules])]],
      ['lysosomes', V(-2.9, 10.6, -0.6), [nameOf('lysosomes', 'lysosome', [V(-2.9, 10.6, -0.6)].concat(spotsOf(G.lysosomes, 8)), [G.lysosomes])]],
      ['centrosome', V(0.1, 14.55, -1.1), [nameOf('centrosome', 'centrosome', [V(0.1, 14.55, -1.1)].concat(spotsOf(G.centrosome, 4)), [G.centrosome])]],
      ['apex', V(0, 16.6, 0), [nameOf('duct', 'the duct', [V(0, 16.6, 0), V(-0.9, 16.3, 0.4), V(0.9, 16.3, 0.4)].concat(spotsOf(G.apex, 6)), [G.apex])]]
    ];
    const list = [];
    for (const [k, p, items] of show) {
      world.reveal(k); burst(scene, p, { n: 36, r: 0.8 });
      list.push(...items); quest.names.set(list.slice(), HUD());
      await wait(700);
    }
    world.simple(false);
    await quest.next();
    quest.names.set([]);
  }
  async function organelles() { await quest.next(); }
  async function mission() { await quest.next('Go to the map'); }

  const ACT = { look, oxygen, carriers, amino, co2, mlook, minside, split, feed, respire, water, dam, release, enter, findchr, findgene, copy, export: exportCopy, small: () => build('small'), large: () => build('large'), out,
    assemble, translate, where, dock, grow, cut, fold, bud, lipid, layer, join, through, sortgame, package: packageIt, grab, maze, smell, fuse, flatten,
    simple, full, organelles, mission };
  /* ---------------- ↻ a finished step again (round 8, 10 Nov 2026) ----------------
     Daniel, 9 Nov 2026: "add … circle arrow … to repeat next to every action in case the students want to re-see the
     animation … you just replay that section … Otherwise, to replay an animation, they have to click restart
     everything"; his "Yes, build it" to the plan, the replay playing by itself. A finished step's ↻ (quest.js againBtn)
     plays that step's own code again in watch mode: each button it uses shows for a moment and presses itself (of
     several, the right one: quest.hot right), a choice picks its right answer, Next waits a moment, nothing is said
     again and no item flies to the bag (quest.js). Nothing of the game changes: while it plays, every change to the
     saved game does nothing (items, energy, flags, saving), and what the step needs is there; the step that was running
     stops, as when a pupil leaves. Then main.js sets the place up again as when the pupil comes back to it, at the step
     they were on. Stop ends it early. With Reduce motion the moves jump and the pauses keep their time, so the stills
     show. The dive replays as its own ↺ does (dive(true)); the mitochondrion is seen whole again before ✂ Cut it open.
     Proof: tools/replay-check.mjs */
  const REWIND = { mlook: () => setLid(0) };
  async function watch(id, i, li) {
    const name = STORY_STEPS(id)[i] && STORY_STEPS(id)[i].play;
    const keep0 = { has: state.has, use: state.use, add: state.add, spend: state.spend, setFlag: state.setFlag, setStep: state.setStep, finish: state.finish, save: state.save };
    const W8 = { session: ++quest.session, active: true };
    state.has = item => W8.active && quest.session === W8.session ? true : keep0.has.call(state, item);
    state.spend = (...a) => W8.active ? true : keep0.spend.apply(state, a);
    ['use', 'add', 'setFlag', 'setStep', 'finish', 'save'].forEach(k => { state[k] = (...a) => { if (!W8.active) return keep0[k].apply(state, a); }; });
    quest.clearHots(); quest.names.set([]); reset();
    /* a camera that the stopped step was still moving (track() keeps it moving until its step lands it) is landed here, or
       the replay's first wait for a still camera (settle) would wait for ever */
    if (world.flying) world.landed({ pos: world.camera.position.toArray(), at: world.controls.target.toArray() }, false);
    quest.panel.querySelectorAll('.step.is-now .step__do').forEach(d => { d.innerHTML = ''; });   /* the stopped step's own buttons go */
    quest.watching = W8; quest.step = { li, do: li.querySelector('.step__do'), say: li.querySelector('.step__say'), i };
    li.classList.add('is-watching');
    const bar = R.h('p', { class: 'step__watch', role: 'status' }, '<span>↻ Watching this step again</span>');
    const stop = R.h('button', { type: 'button', class: 'btn ghost step__stop' }, '■ Stop'); bar.appendChild(stop); li.appendChild(bar);
    stop.addEventListener('click', () => { if (quest.session === W8.session) { W8.stopped = true; quest.session++; } });
    quest.scrollTo(li);
    /* it ends when the step has played, or at once on Stop or when the pupil leaves; a stopped step goes no further (its
       waits throw, and its watched buttons and pauses never come: quest.js), so nothing of it can change the game after */
    let tick = 0;
    const stopped = new Promise(res => { tick = setInterval(() => { if (W8.stopped || quest.session !== W8.session) res(); }, 100); });
    try {
      if (REWIND[name]) REWIND[name]();
      const played = (name === 'enter' ? dive(true) : ACT[name] ? ACT[name]() : Promise.resolve());
      played.catch(e => { if (e !== STALE) console.error(e); });
      await Promise.race([played, stopped]);
    } catch (e) { if (e !== STALE) console.error(e); }
    finally {
      clearInterval(tick);
      Object.assign(state, keep0); W8.active = false; quest.watching = null;
      li.classList.remove('is-watching'); bar.remove(); quest.clearHots();
    }
    return quest.cur === id && (quest.session === W8.session || !!W8.stopped);   /* still in the place (played to its end, or stopped): set it up again (main.js) */
  }
  const STORY_STEPS = id => (window.STORY[id] || {}).steps || [];

  return {
    watch,
    run: (name) => Promise.resolve().then(() => ACT[name] ? ACT[name]() : quest.next()).catch(e => { if (e === STALE) return false; throw e; }),
    reset
  };
}
