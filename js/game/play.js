/* ============================================================
   play.js — what happens at each step of each place (4 Nov 2026). Every step waits for the pupil (a button on the part,
   a choice, or Next step). A wrong choice plays out what would really happen, then the pupil chooses again (memory
   bench-sims-show-the-truth). Each step builds what it needs, so a pupil who left half-way and comes back starts that
   step again with everything in place.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { token, ribbon, chain, tween as tween0, wait as wait0, burst, wave, AMINO_COLORS } from './actors.js?v=202611081622';
import { state, COST, RESPIRE } from './state.js?v=202611081622';
import { nanoPatch, heroPoint, along, loadATP, H_COL, glowPoints, ionStream, atpMaker, haloSprite } from '../world/mitoparts.js?v=202611081622';
import { TRUE, STEPS, trueTrack, trueMotor, glowSprite, amylaseCore } from '../world/tracks.js?v=202611081622';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
/* the Explorer film, fetched when it is opened, not with the page (5 Nov 2026, speed) */
const openCopyFilm = o => import('./transcribe.js?v=202611081622').then(m => m.openCopyFilm(o));
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
  function reset() { kept.forEach(o => scene.remove(o)); kept = []; props = {}; mitoOff(); tracksLoop(false); }
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
  const onCarrier = (C, ys) => ys.flatMap(([y, z]) => C.halves.map((h, k) => { h.updateWorldMatrix(true, false); return h.localToWorld(V(k ? 0.2 : -0.2, y, z)); }));
  const wayNames = again => !again && (quest.names.items[0] || {}).key === 'w-in' ? null : quest.names.set([
    { key: 'w-in', free: true, small: '<span class="nm__t">Inside: the cytoplasm</span>', html: '<span class="nm__t">Inside the cell:<br>the cytoplasm</span>', spots: [V(-3.7, 1.55, 0.12), V(-3.3, 1.7, 0.12), V(-3.7, 1.3, 0.12), V(1.9, 1.3, 0.12)] },
    ibOn() ? { key: 'w-mem', free: true, side: 'L', cls: 'nm--ib', small: '<span class="nm__t">phospholipid bilayer</span>', html: '<span class="nm__t">Cell membrane:<br>phospholipid bilayer</span>',
        spots: (world.size.w < 640 ? [-4, -3.4, -2.8, -0.9, -0.2, 0.4, 2.2, 2.9, 3.6] : [-4, -3.7, -3.4]).map(x => V(x, -0.38, 0.2)) }
      : { key: 'w-mem', free: true, small: '<span class="nm__t">Cell membrane</span>', html: '<span class="nm__t">Cell membrane:<br>two layers of lipids</span>', spots: [V(-3.7, 0, 0.2), V(-3.4, 0, 0.2), V(-4.0, 0, 0.2), V(1.9, 0, 0.2)] },
    { key: 'w-out', free: true, small: '<span class="nm__t">Outside: the tissue fluid</span>', html: '<span class="nm__t">Outside the cell:<br>the tissue fluid</span>', spots: [V(-3.7, -1.3, 0.1), V(-3.4, -1.2, 0.1), V(1.9, -1.25, 0.1)] },
    { key: 'w-cap', free: true, small: '<span class="nm__t">Capillary (blood)</span>', html: '<span class="nm__t">Capillary,<br>with blood</span>', spots: [V(-3.5, -3.0, -0.7), V(-3.8, -3.3, -0.9), V(1.7, -3.0, -0.7)] }
  ].concat(ibOn() ? [
    { key: 'w-glut', free: true, side: 'L', aside: true, cls: 'nm--ib', small: '<span class="nm__t">glucose transporter</span>', html: '<span class="nm__t">glucose transporter</span>', spots: onCarrier(BL.carriers.glucose, [[0.555, 0.05]]) },
    { key: 'w-aat', free: true, side: 'R', aside: true, cls: 'nm--ib', small: '<span class="nm__t">amino acid transporter</span>', html: '<span class="nm__t">amino acid<br>transporter</span>', spots: onCarrier(BL.carriers.amino, [[-0.45, 0.21]]) }
  ] : []), [document.querySelector('.hud')], { l: V(-4.7, 0, 0.25), r: V(2.4, 0, 0.25) });
  /* each step starts in the place's view; already there, no flight (the names stay, never a flicker) */
  async function wayFly() {
    world.wayIn(true);
    if (world.camera.position.distanceTo(V(...WV.pos)) > 0.05 || world.controls.target.distanceTo(V(...WV.at)) > 0.05) await fly(WV.pos, WV.at);
    wayNames();
  }
  /* the first step opens further out, to the left: the red blood cells come as discs and fold as the capillary narrows,
     before they reach the cell; then the camera comes into the place's view, where every one is folded (Daniel, 8 Nov
     2026: "zoom ... out first to show this folding ... And then you kind of zoom in ... by the time it reaches the cell,
     it's already all thin"; cellbuild.js NARROW) */
  const WIDE = { pos: [-9.6, -1.6, 20.5], at: [-9.6, -4.3, -3.2] };
  async function look() {
    world.wayIn(true);
    await fly(WIDE.pos, WIDE.at, 2200);
    await wait(5200);
    await wayFly();
    await quest.next();
  }
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
  async function oxygen() {
    await wayFly();
    let ri = pickRbc();
    const rbcPoint = () => { let p = BLD.rbcAt(ri, BLD.t || 0); if (p.x > 1.4) { ri = pickRbc(); p = BLD.rbcAt(ri, BLD.t || 0); } return p.add(V(0, 0.6, 2.2)); };
    await press(rbcPoint, 'red blood cell', { cls: 'tok', side: 't' });
    /* two oxygen molecules leave the red blood cell, cross the thin wall of the capillary and the tissue fluid, and pass
       straight between the lipids into the cytoplasm, each by its own wandering way */
    const from = BLD.rbcAt(ri, BLD.t || 0).add(V(0, 0.6, 2.2)), xs = [-0.75, -0.05];
    const ox = xs.map((x, i) => { const t = keep(token('oxygen', 0.32)); t.position.copy(from).add(V(i ? 0.35 : -0.35, 0, 0)); return t; });
    burst(scene, from, { color: 0xff9aa2, n: 30, r: 0.55 });
    quest.say('The red blood cell releases oxygen.');
    await Promise.all(ox.map((t, i) => {
      const x = xs[i], a = t.position.clone();
      return tween(t, { path: curve([a, V((a.x + x) / 2 + jit(), -2.1, -0.2), V(x + jit(), -1.25, 0.06), V(x, -0.6, 0.12), V(x, 0, 0.14), V(x + jit(0.1), 0.45, 0.12), V(x + jit(), 0.68, 0.12)]), ms: R.FAST ? 0 : 4200 + i * 500 });
    }));
    quest.say(ib('Oxygen is a small molecule: it passes straight through the two layers of lipids. It spreads from the blood, where there is more oxygen, into the cell, where there is less. This is <dfn data-w="diffusion">diffusion</dfn>.', 'Oxygen is small and non-polar: it passes straight between the phospholipids, down its <dfn data-w="concentration-gradient">concentration gradient</dfn>, from the blood, where its concentration is higher, into the cell, where it is lower. This is simple <dfn data-w="diffusion">diffusion</dfn>.'), 'ok');
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
  const centred = (t, p) => { const c = new THREE.Box3().setFromObject(t).getCenter(new THREE.Vector3()); return p.clone().add(t.position).sub(c); };
  /* one molecule through a carrier protein, in the real order (cellbuild.js carrier). The carrier waits open to the
     outside; the molecule moves to its mouth and into its pocket; as it settles there (it binds), the open side shuts
     behind it; for a moment it is held inside, both sides shut; then the carrier opens to the inside, and the molecule
     leaves as soon as there is room; once it is clear, the empty carrier changes back, open to the outside for the next */
  async function viaCarrier(C, t) {
    unbob(t);
    const at = y => centred(t, V(C.at.x, y, C.at.z + 0.1));
    if (C.s !== -1) await turnTo(C, -1, 500);
    await tween(t, { path: curve([t.position.clone(), at(-C.mouth - 0.12).add(V(jit(0.1), 0, 0)), at(-C.mouth)]), ms: 900 });
    const shut = wait(R.FAST ? 0 : 540).then(() => turnTo(C, 0, 560));
    await tween(t, { to: at(0), ms: 650 });
    await shut;
    await wait(300);
    const open = turnTo(C, 1, 640);
    await wait(R.FAST ? 0 : 545);
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
      const t = keep(token(kind, size)); t.position.set(x0 - 0.5 + i * 1.0, -2.5, -0.6);
      if (second) { const b2 = token('amino', size * 0.85); b2.position.set(size * 0.9, size * 0.4, 0); b2.children[0].material = b2.children[0].material.clone(); b2.children[0].material.color.setHex(AMINO_COLORS[1]); t.add(b2); }
      ts.push(t);
    }
    await Promise.all(ts.map((t, i) => tween(t, { path: curve([t.position.clone(), V(t.position.x + jit(0.2), -1.9, -0.25), V(x0 - 0.45 + i * 0.9, -1.15, 0.06)]), ms: R.FAST ? 0 : 1700 + i * 250 })));
    ts.forEach(t => bob(t, 0.04));
    return ts;
  }
  async function carriers() {
    await wayFly();
    const C = BL.carriers.glucose; await turnTo(C, -1, 0);
    const g = await fromBlood('glucose', 2, C.at.x, 0.22);
    await press(() => g[0].position.clone().add(V(0, -0.3, 0)), 'glucose', { cls: 'tok', side: 'b' });
    await quest.choose(ibOn() ? ['Through a glucose transporter (a carrier protein)', 'Straight between the phospholipids'] : ['Through a carrier protein', 'Straight through the two layers of lipids'], 0, async () => {
      quest.say(ib('Glucose is a larger molecule: the two layers of lipids stop it.', 'Glucose is polar: the hydrophobic core of the phospholipid bilayer stops it.'), 'no');
      await bump(g[0], C.at.x + 1.15);
    });
    quest.say(ib('A <dfn data-w="carrier-protein">carrier protein</dfn> lets glucose pass through the membrane.', 'A <dfn data-w="glucose-transporter">glucose transporter</dfn> lets glucose pass through the membrane: <dfn data-w="facilitated-diffusion">facilitated diffusion</dfn>, down its concentration gradient, with no ATP.'), 'ok');
    for (const t of g) await viaCarrier(C, t);
    await quest.gain('glucose', g[0].position, 2); g.forEach(drop);
  }
  async function amino() {
    await wayFly();
    const C = BL.carriers.amino, G = BL.carriers.glucose; await Promise.all([turnTo(C, -1, 0), turnTo(G, -1, 0)]);
    const [a] = await fromBlood('amino', 1, C.at.x - 0.4, 0.28, true);
    await press(() => a.position.clone().add(V(0, -0.32, 0)), 'amino acid', { cls: 'tok', side: 'b' });
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
    await quest.gain('amino', a.position); drop(a);
  }
  async function co2() {
    await wayFly();
    const t = keep(token('co2', 0.34)); t.position.set(0.3, 0.7, 0.14); bob(t, 0.03);
    await press(() => t.position.clone().add(V(0, 0.3, 0)), 'carbon dioxide', { cls: 'tok', side: 't' });
    /* straight between the lipids, out through the tissue fluid and the capillary's thin wall */
    await tween(t, { path: curve([t.position.clone(), V(0.25 + jit(0.1), 0.42, 0.13), V(0.3, 0, 0.14), V(0.25, -0.6, 0.12), V(0.4 + jit(), -1.3, 0.04)]), ms: R.FAST ? 0 : 2200 });
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
    quest.say(ib('Carbon dioxide passes straight through the two layers of lipids, into the blood. It dissolves in the plasma, the liquid part of the blood, which carries it to your lungs.', 'Carbon dioxide is small and non-polar: it passes straight between the phospholipids, by simple diffusion, into the blood. It dissolves in the plasma, the liquid part of the blood, which carries it to your lungs.'), 'ok');
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
      const shut = wait(R.FAST ? 0 : 900).then(() => turnTo(C, 0, 600));
      await tween(t, { to: pW(-20, -25.5, -3.4), ms: 1100 });
      await shut;
      await wait(300);
      const open = turnTo(C, -1, 650);
      await wait(R.FAST ? 0 : 550);
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
        await wait(R.FAST ? 0 : j * 700);
        const s0 = h.scale.x;
        for (let k = 0; k < 3; k++) {
          nburst(h.position, 0xffe7a0, 10); await wait(R.FAST ? 0 : 300);
          const c = molAt('co2', h.position.clone()), a = k * 2.1 + j * 1.3; co2.push(c);
          tween(c, { to: h.position.clone().addScaledVector(pD(Math.cos(a), Math.sin(a), 0), 0.0026), ms: 800 });
          const hh = halo(keep(token('default', 0.00013)), 0.45, 0xffffff); hh.position.copy(h.position); hyd.push(hh);
          tween(hh, { to: h.position.clone().addScaledVector(pD(Math.cos(a + 2.4), Math.sin(a + 2.4) + 1.4, 0), 0.003), ms: 900 });
          await scaleTo(h, s0 * (1 - (k + 1) * 0.28), 500);
          await wait(R.FAST ? 0 : 650);
        }
        await scaleTo(h, s0 * 0.001, 450); drop(h);
      })()));
      /* each kind named, now that they are still (the review: with nothing named, carbon dioxide was "just a new dot") */
      nanoNames([['nm-co2', 'carbon dioxide', co2.slice(0, 4).map(c => c.position.clone())], ['nm-o2', 'oxygen', props.o2.slice(0, 4).map(c => c.position.clone())],
        ['nm-h', 'hydrogen', hyd.slice(0, 4).map(c => c.position.clone())]], -30, -2, -35);
      ok(ib('The smaller molecules are broken down, step by step: <b>carbon dioxide</b> and hydrogen are produced. The oxygen waits in the matrix: it is used in the next step.', 'The link reaction and the Krebs cycle oxidize the pyruvate, step by step: <b>carbon dioxide</b> is released (<dfn data-w="decarboxylation">decarboxylation</dfn>), and hydrogen is removed (<dfn data-w="dehydrogenation">dehydrogenation</dfn>), carried by reduced NAD and FADH₂. The oxygen waits in the matrix: it is used in the next step.'));
      /* time to read the three names and the sentence before the camera moves back (2.6 s had been too short: Daniel, 5 Nov
         2026, "it zooms out too early") */
      await wait(R.FAST ? 0 : 5000);
      /* one still view from the matrix to the cytosol: the carbon dioxide leaves the way the oxygen came, straight between the
         lipids, each by its own way, and out of the top of the picture; the oxygen stays in view (the review: the camera had
         followed it out into an empty cytosol and come back) */
      quest.names.set([]);
      await camGo(fitView(-16, -42, 14, 60), 1800);
      await Promise.all(co2.map((c, i) => { const u = -27 + Math.random() * 20, p0 = c.position.clone(); return wait(R.FAST ? 0 : i * 260 + Math.random() * 300).then(() => tween(c, { path: curve([p0, pW(u + jit(2), -27.5), pW(u + jit(1), -25.5), pW(u + jit(3), -15 + jit(3)), pW(u + jit(1), -3.5), pW(u + jit(3), 6 + jit(2)), pW(u + jit(4), 26)]), ms: R.FAST ? 0 : 4400 + Math.random() * 1400 })); }));
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
    const hGo = Promise.all(hyd.map((h, k) => wait(R.FAST ? 0 : 600 + k * 220).then(() => tween(h, { to: arm, ms: R.FAST ? 0 : 2600 }))));
    await camGo(fitView(pump4[0] - 4, -78, -42, 50), 2200);
    /* part 1: the space inside the fold is named before it fills (the review); the hydrogen reaches the first protein, its
       energy passes along the chain (a light, protein to protein), and the three pumps move hydrogen ions into the fold */
    nanoNames([p4name, ['nm-lum', 'the space<br>inside the fold', [[G.uc - 4, -60, -1], [G.uc - 4, -70, -1], [G.uc - 2, -66, -1]], 'inside the fold'], mxname], pump4[0] - 18, G.uc + G.hw + 3, -60);
    await hGo;
    hyd.forEach(drop); nburst(arm, 0xfff1a8, 14);
    const pulse = keep(token('default', 0.0004)); pulse.position.copy(arm);
    tween(pulse, { path: curve(PT.parts.pumps.map(p => pW(p.x - 1.5, p.n, p.w + 2.5))), ms: R.FAST ? 0 : 2400 }).then(() => drop(pulse));
    HC.start = performance.now();
    await Promise.all([wait(R.FAST ? 0 : HC.dur + 1300), drift]);
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
      return wait(R.FAST ? 0 : i * 320).then(() => tween(t, { path: curve([p0, pW(pump4[0] - 5 + jit(1), -68 + jit(2)), end]), ms: R.FAST ? 0 : 1800 })).then(async () => {
        const hs = [0, 1, 2, 3].map(k => { const h = halo(keep(token('default', 0.00013)), 0.4, 0xffffff); h.position.copy(end).addScaledVector(pD(Math.cos(k * 1.57), Math.sin(k * 1.57), 0), 0.0016); return h; });
        await Promise.all(hs.map(h => tween(h, { to: end, ms: 600 })));
        hs.forEach(drop); drop(t);
        for (let k = 0; k < 2; k++) { const w = molAt('water', end.clone()); out.push(w); tween(w, { to: end.clone().addScaledVector(pD(-1, 0, 0), 0.0016 + 0.0009 * k).addScaledVector(pD(0, 1, 0), (k ? 1 : -1) * 0.0012), ms: 700 }); }
      });
    }));
    props.water = out; props.o2 = null;
    await wait(R.FAST ? 0 : 800);
    nanoNames([p4name, ['nm-wat', 'water', out.slice(0, 6).map(w => w.position.clone())], ['nm-hi', 'many<br>hydrogen ions', crowdSpots(), 'hydrogen ions'], mxname], pump4[0] - 18, G.uc + G.hw + 3, -60);
    ok(ib('At the last protein in the chain, oxygen joins with hydrogen from the smaller molecules: <b>water</b> is produced.', 'At the end of the chain, in complex IV, oxygen accepts electrons and protons: <b>water</b> is produced. Oxygen is the terminal electron acceptor.'));
    await quest.next();
  }
  /* the dam: the hydrogen ions flow back only through ATP synthase, which turns in steps, one for each ion, and makes ATP
     (mitoparts.js ionStream, atpMaker) */
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
      world.kick && world.kick(); requestAnimationFrame(tick);
    };
    tick();
    await live(new Promise(res => { const f = () => (T >= T1 || quest.session !== s0 ? res() : requestAnimationFrame(f)); f(); }));
    /* ATP is named where it is made: the near side of each head, where a new one forms every eight ions */
    const site = a => { const rr = a.userData.measured ? 6.7 : 4.9; return a.localToWorld(V(Math.cos(Math.PI / 3) * rr, 13.2, Math.sin(Math.PI / 3) * rr)); };
    names([['nm-atpm', 'ATP', A.map(site)]]);
    ok(ib('As the hydrogen ions flow back through it, the ring of ATP synthase turns, and it makes <b>ATP</b>. The cell uses the energy in ATP for its work.', 'As the protons flow back through it, down their gradient (<dfn data-w="chemiosmosis">chemiosmosis</dfn>), the ring of ATP synthase turns, and it phosphorylates ADP: <b>ATP</b>. The cell uses the energy in ATP for its work.'));
    await quest.next();
    run = false;
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
  async function enter() {
    await fly(world.P.nucleus.view.pos, world.P.nucleus.view.at);
    const pore = W.pores.slice().sort((a, b) => a.distanceTo(world.camera.position) - b.distanceTo(world.camera.position))[0];
    const glowRing = keep(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 24), new THREE.MeshBasicMaterial({ color: 0xfff1a8 })));
    glowRing.position.copy(pore); glowRing.lookAt(N0);
    await press(() => pore.clone().add(V(0, 0.35, 0)), 'Enter through a nuclear pore', { side: 't' });
    drop(glowRing);
    const v = nucView(); await fly(v.pos, v.at, 2000);
    state.setFlag('in-nucleus');
    quest.say('You are inside the nucleus. The threads are the chromosomes.', 'ok');
    await quest.next();
  }
  function chr1Mat() { const m = W.chromosomes[0].mesh.material; if (!props.chrDim) { props.chrDim = m.color.getHex(); m.color.setHex(0xb9a6ff); m.emissive.setHex(0x2a1f6a); } return m; }
  async function findchr() {
    const v = nucView(); if (world.camera.position.distanceTo(v.pos) > 0.5) await fly(v.pos, v.at);
    chr1Mat();
    const picks = [0, 3, 6, 9, 12].map(i => W.chromosomes[i]).filter(Boolean);
    const OTHER = [7, 14, 21, 11];                     /* each other chromosome shown has its own number */
    await new Promise(done => {
      picks.forEach((ch, pi) => {
        const at = () => inN(ch.curve.getPointAt(0.5)).add(V(0, 0.18, 0));
        const b = quest.hot(at, '?', { cls: 'q3', aria: 'a chromosome' });
        b.done.then(() => {
          if (ch.n === 1) {
            quest.clearHots();
            ch.mesh.material.color.setHex(0xffcf6b); ch.mesh.material.emissive.setHex(0x7a4a00);
            burst(scene, inN(ch.curve.getPointAt(0.5)), { n: 40, r: 0.5 });
            quest.say('<b>Chromosome 1</b>: the largest kind of chromosome. (There are two of each kind: one from each parent.)', 'ok');
            done();
          } else {
            const k = OTHER[(pi - 1) % OTHER.length];
            b.el.querySelector('span').textContent = 'chromosome ' + k; b.el.disabled = true; b.el.classList.add('no');
            quest.say(`That is chromosome ${k}. Find chromosome 1, the largest kind.`);
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
    const rib = keep(ribbon(copyCurve(), { radius: 0.035 }));
    if (film) { await live(openCopyFilm()); rib.userData.grow(1); }
    else {
      const t0 = performance.now();
      await live(new Promise(r => { const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 2200); rib.userData.grow(k); if (k < 1) requestAnimationFrame(f); else r(); }; f(); }));
    }
    props.rib = rib;
    quest.say('The copy of the gene: <b>mRNA</b>.', 'ok');
  }
  async function exportCopy() {
    let rib = props.rib; if (!rib) { rib = props.rib = keep(ribbon(copyCurve(), { radius: 0.035 })); rib.userData.grow(1); }
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
    const SEG = 320, thread = keep(ribbon(way, { radius: 0.035, segs: SEG })), per = 8 * 6;
    const lenSegs = Math.max(6, Math.round(SEG * cc.getLength() / way.getLength()));
    drop(rib); props.rib = null;
    const t0 = performance.now(), MS = R.FAST ? 0 : 3600;
    await live(new Promise(res => {
      const f = () => {
        const k = MS ? Math.min(1, (performance.now() - t0) / MS) : 1, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        thread.geometry.setDrawRange(Math.round(e * (SEG - lenSegs)) * per, lenSegs * per); world.kick && world.kick();
        if (k < 1) requestAnimationFrame(f); else res();
      };
      f();
    }));
    quest.say('The copy, mRNA, is in the cytoplasm now. The DNA stays in the nucleus.', 'ok');
    await quest.gain('mrna', way.getPointAt(0.97));
    drop(thread); drop(ring);
    await quest.next('Back to the map');
  }

  /* ---------------- nucleolus ---------------- */
  const NOL = () => inN(N.nucleolus.position);
  async function build(kind) {
    const v = nucView(); if (world.camera.position.distanceTo(v.pos) > 0.6) { await fly(world.P.nucleolus.view.pos, world.P.nucleolus.view.at); }
    const c = NOL(), at = c.clone().add(V(0.9, kind === 'small' ? -0.2 : 0.5, 0.6));
    await press(() => at.clone().add(V(0, 0.38, 0)), 'Build', { cost: COST.parts / 2 });
    /* its RNA is made here, in the nucleolus; its proteins were made in the cytoplasm and enter through nuclear pores */
    const rna = keep(token('rna', 0.3)); rna.position.copy(c).add(V(0.35, 0.05, 0.55)); rna.scale.setScalar(0.15);
    await tween(rna, { to: rna.position.clone(), ms: 800, scale: 1 });
    const prots = W.pores.slice().sort((a, b) => a.distanceTo(at) - b.distanceTo(at)).slice(0, 2).map(p => { const t = keep(token('protein', 0.15)); t.position.copy(p); return t; });
    await Promise.all(prots.map(t => tween(t, { to: at, ms: 1200 })));
    await tween(rna, { to: at, ms: 500, scale: 0.5 });
    [rna, ...prots].forEach(drop);
    const part = keep(token(kind, 0.42)); part.position.copy(at); burst(scene, at, { n: 24, r: 0.35 });
    props[kind] = part;
    quest.say(kind === 'small' ? 'The small part of a ribosome: RNA made here, and proteins made in the cytoplasm.' : 'The large part of a ribosome: RNA and proteins too.', 'ok');
  }
  async function out() {
    const parts = ['small', 'large'].map(k => props[k] || (() => { const t = keep(token(k, 0.42)); t.position.copy(NOL()).add(V(0.9, k === 'small' ? -0.2 : 0.5, 0.6)); return t; })());
    for (const p of parts) {
      await press(() => p.position.clone().add(V(0, 0.4, 0)), p.userData.kind === 'small' ? 'small part' : 'large part', { cls: 'tok', side: 't' });
      const pore = W.pores.slice().sort((a, b) => a.distanceTo(p.position) - b.distanceTo(p.position))[0];
      await tween(p, { to: pore, ms: 1100, scale: 0.6 });
      drop(p);
    }
    await quest.gain('parts', NOL());
    await quest.next('Back to the map');
  }

  /* ---------------- ribosomes ---------------- */
  const RIB = world.P.ribosome.center;
  async function assemble() {
    await fly(world.P.ribosome.view.pos, world.P.ribosome.view.at);
    const curve = new THREE.CatmullRomCurve3([RIB.clone().add(V(-1.6, -0.3, 0)), RIB.clone().add(V(-0.5, 0.05, 0.1)), RIB.clone().add(V(0.6, -0.05, 0)), RIB.clone().add(V(1.7, 0.25, -0.1))]);
    const rib = keep(ribbon(curve, { radius: 0.035 })); rib.userData.grow(1); props.copy = curve;
    const s = keep(token('small', 0.42)), l = keep(token('large', 0.42));
    s.position.copy(RIB).add(V(-0.8, -1.4, 0.4)); l.position.copy(RIB).add(V(0.9, 1.5, 0.3));
    await press(() => RIB.clone().add(V(0, 0.9, 0)), 'Join', {});
    await tween(s, { to: curve.getPointAt(0.12).add(V(0, -0.16, 0)), ms: 900 });
    await tween(l, { to: curve.getPointAt(0.12).add(V(0, 0.22, 0)), ms: 900 });
    drop(s); drop(l);
    const r = keep(token('ribosome', 0.42)); r.position.copy(curve.getPointAt(0.12)); props.rib = r;
    burst(scene, r.position, { n: 30, r: 0.5 });
    quest.say('A whole ribosome, on the copy of the gene.', 'ok');
    state.use('parts');
  }
  const CODES = [[0, '▲'], [1, '●'], [2, '■'], [3, '◆'], [1, '●'], [0, '▲']];
  async function translate() {
    const curve = props.copy || new THREE.CatmullRomCurve3([RIB.clone().add(V(-1.6, -0.3, 0)), RIB.clone().add(V(1.7, 0.25, -0.1))]);
    if (!props.copy) { const rib = keep(ribbon(curve, { radius: 0.035 })); rib.userData.grow(1); }
    const r = props.rib || (() => { const t = keep(token('ribosome', 0.42)); t.position.copy(curve.getPointAt(0.12)); return t; })();
    const beads = [], colors = [];
    let chainObj = null;
    for (let k = 0; k < CODES.length; k++) {
      const [ci, sym] = CODES[k];
      const at = curve.getPointAt(0.12 + k * 0.12);
      await tween(r, { to: at, ms: 500 });
      const code = quest.hot(() => r.position.clone().add(V(0, -0.62, 0)), `code: <b class="sym s${ci}">${sym}</b>`, { cls: 'code', side: 'b', aria: 'the code' });
      code.el.disabled = true;
      /* three amino acids float near, each on its carrier; the carrier whose end has the same shape and colour fits */
      const opts = [ci, (ci + 1) % 4, (ci + 2) % 4].sort(() => Math.random() - 0.5);
      const toks = opts.map((c, i) => {
        const t = keep(token('amino', 0.3)); t.children[0].material = t.children[0].material.clone(); t.children[0].material.color.setHex(AMINO_COLORS[c]); t.children[0].material.emissive.setHex(AMINO_COLORS[c]);
        const cr = token('carrier', 0.3); cr.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.color.setHex(AMINO_COLORS[c]); o.material.emissive.setHex(AMINO_COLORS[c]); } }); cr.position.y = -0.2; t.add(cr);
        t.position.copy(r.position).add(V(-0.95 + i * 0.95, 1.05, 0.35)); return { t, c };
      });
      await new Promise(done => {
        toks.forEach(({ t, c }) => {
          const b = quest.hot(() => t.position.clone().add(V(0, 0.4, 0)), `<b class="sym s${c}">${['▲', '●', '■', '◆'][c]}</b>`, { cls: 'tok aa', aria: 'the carrier with a ' + ['triangle', 'circle', 'square', 'diamond'][c] });
          b.done.then(async () => {
            if (c !== ci) { quest.say('That carrier does not match the code. Look at its shape and colour.', 'no'); const p0 = t.position.clone(); await tween(t, { to: p0.clone().add(V(0, -0.2, 0)), ms: 200 }); await tween(t, { to: p0, ms: 200 }); return; }
            if (!quest.energy(COST.translate / CODES.length)) return;
            quest.clearHots(); quest.say('');
            await tween(t, { to: r.position.clone().add(V(0, 0.42, 0)), ms: 450 });
            toks.forEach(x => drop(x.t));
            colors.push(ci); beads.push(r.position.clone().add(V(0.15 * (beads.length % 2), 0.75 + beads.length * 0.17, 0)));
            if (chainObj) drop(chainObj);
            chainObj = keep(chain(beads, colors));
            done();
          });
        });
      });
    }
    props.chain = chainObj;
    quest.say('The ribosome reads the copy and joins the amino acids in its order: the start of the amylase chain.', 'ok');
    state.use('amino'); state.use('mrna');
  }
  async function where() {
    const r = props.rib || (() => { const t = keep(token('ribosome', 0.42)); t.position.copy(RIB); return t; })();
    await quest.choose(['On the rough ER', 'Here, floating in the cytosol', 'Inside the nucleus'], 0, async (i) => {
      if (i === 1) quest.say('Then amylase would stay in the cytosol, and it could never reach a vesicle or leave the cell. Proteins that leave the cell are made on the <b>rough ER</b>.', 'no');
      else quest.say('Ribosomes make proteins in the cytoplasm, never inside the nucleus. The signal takes this one to the <b>rough ER</b>.', 'no');
      await wait(300);
    });
    const go = world.P.rer.center.clone().add(V(0.6, 0.8, 1.2));
    await Promise.all([tween(r, { to: go, ms: 2200 }), props.chain ? tween(props.chain, { to: go.clone().sub(r.position), ms: 2200 }) : null]);
    await quest.gain('chain', go);
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
    return (props.face = { p, n });
  }
  const dockAt = () => rerFace().p.clone().addScaledVector(rerFace().n, 0.08);
  const insideAt = () => rerFace().p.clone().addScaledVector(rerFace().n, -0.32);
  async function dock() {
    await fly(world.P.rer.view.pos, world.P.rer.view.at);
    const r = keep(token('ribosome', 0.42)); r.position.copy(dockAt()).addScaledVector(rerFace().n, 1.1).add(V(0, 0.5, 0)); props.rib = r;
    const sig = keep(chain([r.position.clone().add(V(0, 0.75, 0)), r.position.clone().add(V(0.1, 0.92, 0))], [0, 1]));
    props.sig = sig;
    await press(() => r.position.clone().add(V(0, 0.75, 0)), 'Dock', {});
    const ch = keep(new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 20), new THREE.MeshBasicMaterial({ color: 0x9ff3ff })));
    ch.position.copy(dockAt()); ch.lookAt(dockAt().add(rerFace().n)); props.channel = ch;
    const seat = dockAt().addScaledVector(rerFace().n, 0.3);
    await Promise.all([tween(r, { to: seat, ms: 1100 }), tween(sig, { to: seat.clone().sub(r.position), ms: 1100 })]);
    quest.say('The ribosome sits on a channel in the membrane of the rough ER.', 'ok');
  }
  /* the ribosome joins amino acids from one count to another: a counter under it, and the chain flowing inside the ER */
  async function count(r, from, to, ms) {
    const counter = quest.hot(() => r.position.clone().add(V(0, -0.85, 0)), 'amino acids: ' + from, { cls: 'count', side: 'b' }); counter.el.disabled = true;
    const t0 = performance.now(), inside = insideAt(), flow = [], s0 = quest.session;
    await live(new Promise(res => {
      const f = () => {
        const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms);
        counter.el.querySelector('span').textContent = 'amino acids: ' + Math.round(from + (to - from) * k);
        if (!R.FAST && flow.length < 16 && Math.random() < 0.3 && quest.session === s0) { const b = keep(token('amino', 0.12)); b.position.copy(r.position); flow.push(b); tween(b, { to: inside.clone().add(V((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.3, 0)), ms: 900 }); }
        if (k < 1) requestAnimationFrame(f); else res();
      };
      f();
    }), s0);
    flow.forEach(drop);
    return counter;
  }
  const blob = (n) => keep(chain(Array.from({ length: n }, (_, i) => insideAt().add(V(Math.cos(i) * 0.25, Math.sin(i * 1.7) * 0.18, Math.sin(i) * 0.2))), Array.from({ length: n }, (_, i) => i % 4)));
  const ribAt = () => props.rib || (() => { const t = keep(token('ribosome', 0.42)); t.position.copy(dockAt()).addScaledVector(rerFace().n, 0.3); return (props.rib = t); })();
  async function grow() {
    /* the signal leaves the ribosome's tunnel when about 60 amino acids are joined: the count starts there */
    const r = ribAt();
    await press(() => r.position.clone().add(V(0, 0.75, 0)), 'Go', { cost: COST.grow });
    await count(r, 60, 150, 2400);
    if (props.blob) drop(props.blob);
    props.blob = blob(4);
    quest.say('The chain grows through the channel, inside the rough ER.', 'ok');
  }
  async function cut() {
    const r = ribAt();
    if (!props.blob) props.blob = blob(4);
    const sig = props.sig || keep(chain([insideAt().add(V(0.25, 0.1, 0)), insideAt().add(V(0.35, 0, 0))], [0, 1]));
    await press(() => insideAt().addScaledVector(rerFace().n, 0.5).add(V(0.4, 0.2, 0)), 'Cut', {});
    await tween(sig, { to: sig.position.clone().add(V(0.6, -0.4, 0.3)), ms: 900, fade: 0 });
    drop(sig); props.sig = null;
    quest.say('The signal is removed. The ribosome goes on joining amino acids.', 'ok');
    const counter = await count(r, 150, 511, 3600);
    counter.remove();
    drop(props.blob); props.blob = blob(8);
    /* the end of the copy: the ribosome releases the chain, and its two parts separate and leave the membrane */
    const sm = keep(token('small', 0.42)), lg = keep(token('large', 0.42));
    sm.position.copy(r.position).add(V(0, -0.16, 0)); lg.position.copy(r.position).add(V(0, 0.22, 0));
    drop(r); props.rib = null;
    await Promise.all([tween(sm, { to: sm.position.clone().add(V(-0.9, 1.0, 0.6)), ms: 1300, fade: 0 }), tween(lg, { to: lg.position.clone().add(V(0.9, 1.4, 0.6)), ms: 1300, fade: 0 })]);
    drop(sm); drop(lg);
    if (props.channel) { drop(props.channel); props.channel = null; }
    quest.say('All 511 amino acids are joined. At the end of the copy, the ribosome releases the chain, and its two parts separate and leave the membrane. Without its signal, amylase has 496 amino acids.', 'ok');
  }
  async function fold() {
    const inside = insideAt();
    await press(() => inside.clone().add(V(0, 0.55, 0)), 'Fold', {});
    if (props.blob) { await tween(props.blob, { to: props.blob.position.clone(), ms: 200, scale: 0.4 }); drop(props.blob); props.blob = null; }
    const a = keep(token('amylase', 0.34)); a.position.copy(inside); a.scale.setScalar(0.2);
    await tween(a, { to: inside, ms: 900, scale: 1 }); burst(scene, inside, { n: 40, r: 0.6 });
    props.amylase = a;
    const site = quest.hot(() => a.position.clone().add(V(0.05, 0.1, 0.42)), 'active site', { cls: 'tag', side: 'r' }); site.el.disabled = true;
    quest.say('Amylase, folded into its shape. Starch fits into its <b>active site</b>.', 'ok');
    await quest.next(); site.remove();
  }
  async function bud() {
    const inside = insideAt();
    const a = props.amylase || (() => { const t = keep(token('amylase', 0.34)); t.position.copy(inside); return (props.amylase = t); })();
    if (!state.has('lipids')) {
      quest.say('Every vesicle removes a piece of the ER membrane, so the ER needs new <b>lipids</b> first. The <b>smooth ER</b> makes them: go there, then return here.', 'no');
      return false;
    }
    await press(() => a.position.clone().add(V(0, 0.6, 0)), 'Bud', {});
    state.use('lipids'); state.use('chain');
    const ves = keep(token('vesicle', 0.55)); ves.position.copy(a.position); ves.scale.setScalar(0.3);
    await tween(ves, { to: a.position, ms: 900, scale: 1 });
    const g = new THREE.Group(); g.position.copy(a.position); keep(g); a.position.set(0, 0, 0); g.add(a); ves.position.set(0, 0, 0); g.add(ves);
    await tween(g, { to: g.position.clone().addScaledVector(rerFace().n, 1.0).add(V(0.6, 1.2, 0)), ms: 1400 });
    await quest.gain('amylase', g.position);
    drop(g); props.amylase = null;
    await quest.next('Back to the map');
  }

  /* ---------------- smooth ER ---------------- */
  const SER = world.P.ser.center;
  async function lipid() {
    await fly(world.P.ser.view.pos, world.P.ser.view.at);
    props.lipids = props.lipids || [];
    for (let i = props.lipids.length; i < 3; i++) {
      await press(() => SER.clone().add(V(0.9, 1.0, 1.4)), `Join (${i + 1} of 3)`, { cost: COST.lipid });
      const parts = ['lhead', 'ltail', 'ltail'].map((k, j) => { const p = keep(token(k, 0.42)); p.position.copy(SER).add(V(Math.cos(j * 2.1) * 0.8, Math.sin(j * 2.1) * 0.6 + 0.6, 1.3)); return p; });
      const at = SER.clone().add(V(-0.6 + i * 0.6, 0.4, 1.5));
      await Promise.all(parts.map(p => tween(p, { to: at, ms: 800 })));
      parts.forEach(drop);
      const l = keep(token('lipid', 0.42)); l.position.copy(at); burst(scene, at, { n: 20, r: 0.3, color: 0xffb3d6 });
      props.lipids.push(l);
    }
    quest.say('Three lipids: each one has a head and two tails.', 'ok');
  }
  async function layer() {
    /* a piece of the ER's own membrane, drawn much larger: two layers of lipids, tails inside, with gaps in the top layer
       (the side towards the cytosol, where new lipids join); the new lipids fill the gaps, then spread through the ER */
    const base = SER.clone().add(V(0, -0.45, 1.5)), slot = (k, top) => base.clone().add(V(-1.05 + k * 0.42, top ? 0.42 : -0.42, 0));
    const pale = (l) => { l.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.55; } }); return l; };
    const old = [];
    for (let k = 0; k < 6; k++) { const b = keep(pale(token('lipid', 0.42))); b.rotation.z = Math.PI; b.position.copy(slot(k, false)); old.push(b); }
    for (let k = 0; k < 6; k += 2) { const t = keep(pale(token('lipid', 0.42))); t.position.copy(slot(k, true)); old.push(t); }
    const tag = quest.hot(() => base.clone().add(V(0, -0.95, 0)), 'the membrane of the ER (drawn much larger)', { cls: 'tag', side: 'b' }); tag.el.disabled = true;
    const L = props.lipids && props.lipids.length ? props.lipids : [0, 1, 2].map(i => { const l = keep(token('lipid', 0.42)); l.position.copy(SER).add(V(-0.6 + i * 0.6, 0.4, 1.5)); return l; });
    await press(() => base.clone().add(V(0, 1.5, 0)), 'Add to the membrane', {});
    await Promise.all(L.map((l, i) => tween(l, { to: slot(1 + i * 2, true), ms: 1000 })));
    burst(scene, base, { n: 30, r: 0.7, color: 0xffb3d6 });
    tag.remove();
    quest.say('The new lipids are part of the membrane of the ER. They spread through it, as far as the rough ER.', 'ok');
    await live(wave(scene, base, { color: 0xffc8e4, to: 7, ms: R.FAST ? 0 : 2000 }));
    await quest.gain('lipids', base);
    L.concat(old).forEach(drop); props.lipids = null;
    await quest.next('Back to the map');
  }

  /* ---------------- Golgi apparatus ---------------- */
  const G = W.golgi.group;
  const sacPoint = (k) => G.localToWorld(V(1.2, k * 0.2 + 0.25, 0.9));
  async function join() {
    await fly(world.P.golgi.view.pos, world.P.golgi.view.at);
    const v = keep(token('vesicle', 0.32)); const a = token('amylase', 0.18); v.add(a); v.position.copy(sacPoint(0)).add(V(0.3, -1.2, 0.6));
    await press(() => v.position.clone().add(V(0, -0.5, 0)), 'Join', { side: 'b' });
    await tween(v, { to: sacPoint(0), ms: 1000 });
    await tween(v, { to: sacPoint(0), ms: 400, scale: 0.2 });
    drop(v); burst(scene, sacPoint(0), { n: 24, r: 0.3 });
    props.k = 0;
  }
  async function through() {
    const m = keep(token('amylase', 0.16)); props.k = props.k || 0; m.position.copy(sacPoint(props.k));
    while (props.k < 5) {
      await press(() => m.position.clone().add(V(0.5, 0.1, 0)), `Next sac (${props.k + 2} of 6)`, { side: 'r' });
      props.k++; await tween(m, { to: sacPoint(props.k), ms: 600 });
      if (props.k === 2) quest.say('In the sacs, the Golgi apparatus modifies proteins: it adds sugars to some of them.');
    }
    drop(m);
  }
  async function sortgame() {
    const top = sacPoint(5).add(V(0, 0.6, 0));
    const out = keep(token('vesicle', 0.5)); out.position.copy(top).add(V(-1.2, 0.9, 0.4));
    const lys = keep(token('vesicle', 0.42)); lys.position.copy(top).add(V(1.4, 0.8, 0.4));
    lys.userData.shell.material = lys.userData.shell.material.clone(); lys.userData.shell.material.color.setHex(0xff9ac0);
    const labOut = quest.hot(() => out.position.clone().add(V(0, 0.75, 0)), 'vesicle: out of the cell', { cls: 'tag', side: 't' }); labOut.el.disabled = true;
    const labLys = quest.hot(() => lys.position.clone().add(V(0, 0.68, 0)), 'vesicle: to a lysosome', { cls: 'tag', side: 't' }); labLys.el.disabled = true;
    const prots = [['amylase', 0], ['lysosome enzyme', 1], ['amylase', 0], ['amylase', 0], ['lysosome enzyme', 1]];
    for (let i = 0; i < prots.length; i++) {
      const [name, dest] = prots[i];
      const p = keep(token(dest ? 'amino' : 'amylase', dest ? 0.26 : 0.16)); p.position.copy(top).add(V(0, -0.1, 0.4));
      await tween(p, { to: top.clone().add(V(0, 0.2, 0.5)), ms: 400 });
      const lab = quest.hot(() => p.position.clone().add(V(0, -0.4, 0)), dest ? 'lysosome enzyme · label: to a lysosome' : 'amylase · no label', { cls: 'tag', side: 'b' }); lab.el.disabled = true;
      await new Promise(done => {
        const pick = (to, k) => quest.hot(() => to.position.clone().add(V(0, -0.65, 0)), 'Put it here', { side: 'b' }).done.then(async (b) => {
          if (k !== dest) { quest.say(dest ? 'Read its label: this lysosome enzyme goes to a lysosome.' : 'Amylase has no label: amylase molecules stick together and are packed into the large vesicle that leaves the cell.', 'no'); return; }
          quest.hots.filter(x => x.el.textContent === 'Put it here').forEach(x => x.remove());
          lab.remove(); quest.say('');
          await tween(p, { to: to.position, ms: 700, scale: 0.3 }); drop(p);
          done();
        });
        pick(out, 0); pick(lys, 1);
      });
    }
    labOut.remove(); labLys.remove();
    props.outVes = out; props.lysVes = lys;
    quest.say('Every protein is in the right vesicle.', 'ok');
  }
  async function packageIt() {
    const out = props.outVes || (() => { const t = keep(token('vesicle', 0.5)); t.position.copy(sacPoint(5)).add(V(-1.2, 1.5, 0.4)); return t; })();
    await press(() => out.position.clone().add(V(0, 0.75, 0)), 'Package', {});
    const fill = token('amylase', 0.22); out.add(fill);
    burst(scene, out.position, { n: 50, r: 0.7 });
    if (props.lysVes) { tween(props.lysVes, { to: props.lysVes.position.clone().add(V(2.0, -0.6, -0.8)), ms: 1600, fade: 0 }); }
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
    quest.say('Dynein now walks and carries your vesicle. Each time one head steps, your vesicle moves on, most often 8 nm. Some steps are longer, and some go backwards or to the side. A real one walks about 70 times faster: about 900 nm every second.', 'ok');
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
          quest.hot(() => at.clone(), 'this one', { side: 'c', aria: i === 0 ? 'the microtubule that goes up' : 'the microtubule that lies across the cell' }).done.then(async (b) => {
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

  /* ---------------- the way out ---------------- */
  const TOP = world.P.exit.center;
  async function smell() {
    await fly(world.P.exit.view.pos, world.P.exit.view.at);
    const ves = keep(token('vesicle', 0.5)); ves.add(token('amylase', 0.22)); ves.position.copy(TOP).add(V(0.6, -0.5, 1.1)); props.ves = ves;
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
    const ves = props.ves || (() => { const t = keep(token('vesicle', 0.5)); t.add(token('amylase', 0.22)); t.position.copy(TOP).add(V(0.6, -0.5, 1.1)); return (props.ves = t); })();
    const at = V(0.2, 16.05, 0.5);
    await tween(ves, { to: at.clone().add(V(0, -0.35, 0)), ms: 1200 });
    await press(() => ves.position.clone().add(V(0, -0.75, 0)), 'Release', { side: 'b' });
    /* the vesicle's membrane joins the cell membrane: it flattens into it, and its amylase streams into the lumen */
    const path = W.lumen.path;
    const flow = [];
    for (let i = 0; i < 14; i++) { const a = keep(token('amylase', 0.12)); a.position.copy(at); flow.push(a); }
    ves.children.slice(1).forEach(c => ves.remove(c));
    await Promise.all([tween(ves, { to: at.clone().add(V(0, 0.1, 0)), ms: 1400, scale: 0.15 }), ...flow.map((a, i) => new Promise(r => setTimeout(() => tween(a, { path: new THREE.CatmullRomCurve3([at.clone(), path.getPointAt(0.05 + i * 0.01), path.getPointAt(0.3 + i * 0.03)]), ms: 2600 }).then(r), R.FAST ? 0 : i * 120)))]);
    drop(ves); flow.forEach(drop);
    burst(scene, at, { n: 50, r: 0.8, color: 0xc8fff0 });
    quest.say('Exocytosis: the amylase leaves the cell and enters the duct.', 'ok');
    await quest.gain('saliva', at);
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
      ['nucleus-inside', P.nucleolus.center, [nameOf('nucleolus', 'nucleolus', P.nucleolus.spots, [N.group]),
        nameOf('chromosomes', 'chromosome', W.chromosomes.slice(0, 12).map(ch => inN(ch.curve.getPointAt(0.5))), [N.group])]],
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
  return {
    run: (name) => Promise.resolve().then(() => ACT[name] ? ACT[name]() : quest.next()).catch(e => { if (e === STALE) return false; throw e; }),
    reset
  };
}
