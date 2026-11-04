/* ============================================================
   play.js — what happens at each step of each place (4 Nov 2026). Every step waits for the pupil (a button on the part,
   a choice, or Next step). A wrong choice plays out what would really happen, then the pupil chooses again (memory
   bench-sims-show-the-truth). Each step builds what it needs, so a pupil who left half-way and comes back starts that
   step again with everything in place.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { token, ribbon, chain, tween as tween0, wait as wait0, burst, wave, AMINO_COLORS } from './actors.js?v=202611041337';
import { state, COST, RESPIRE } from './state.js?v=202611041337';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const R = window.REV;

export function makePlay(world, quest) {
  const W = world.W, scene = world.scene;
  /* a pupil may leave a place in the middle of a step (the map, another place): every wait of a step (a move, a pause, a
     flight) then stops the step, so it never puts a button, a token or an item into the place the pupil went to */
  const STALE = new Error('the pupil left this place');
  /* a button's own handler (b.done.then(async …)) may be waiting when the pupil leaves: its stop is expected, not an error */
  addEventListener('unhandledrejection', e => { if (e.reason === STALE) e.preventDefault(); });
  const live = (p, s = quest.session) => { const q = p.then(v => { if (quest.session !== s) throw STALE; return v; }); q.catch(() => {}); return q; };
  const tween = (o, opts) => live(tween0(o, opts));
  const wait = ms => live(wait0(ms));
  let kept = [], props = {};
  const keep = (o) => { scene.add(o); kept.push(o); return o; };
  const drop = (o) => { if (!o) return; scene.remove(o); kept = kept.filter(x => x !== o); };
  /* leaving a place takes its tokens away */
  function reset() { kept.forEach(o => scene.remove(o)); kept = []; props = {}; }
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
  const bob = (o, k = 0.08) => { const y0 = o.position.y, ph = Math.random() * 6; W.anim.push(function f(t) { if (!o.parent) { W.anim.splice(W.anim.indexOf(f), 1); return; } o.position.y = y0 + k * Math.sin(t * 1.4 + ph); o.rotation.y += 0.005; }); };
  /* a button on a part, pressed once (the step goes on); the energy check, when a job costs energy */
  const press = async (at, label, opts = {}) => {
    for (;;) {
      const b = quest.hot(at, label, opts); await b.done; b.remove();
      if (!opts.cost || quest.energy(opts.cost)) return;
      await wait(400);
    }
  };

  /* ---------------- the way in ---------------- */
  const WAY = world.P.wayin.center;
  async function gate() {
    await fly(world.P.wayin.view.pos, world.P.wayin.view.at);
    const want = { glucose: 2, oxygen: 2, amino: 1 }, got = { glucose: 0, oxygen: 0, amino: 0 };
    const spots = [V(-6.6, -1.1, 0.4), V(-5.6, -1.5, 1.4), V(-4.2, -1.2, 0.6), V(-3.2, -1.6, 1.6), V(-5.2, -1.0, -0.6), V(-3.9, -1.3, -1.4)];
    const kinds = ['glucose', 'oxygen', 'amino', 'glucose', 'oxygen', 'amino'];
    const label = { glucose: 'glucose', oxygen: 'oxygen', amino: 'amino acids' };
    let left = 5;
    await new Promise(done => {
      kinds.forEach((k, i) => {
        const t = keep(token(k, 0.36)); t.position.copy(spots[i]); bob(t);
        if (k === 'amino') { const b2 = token('amino', 0.3); b2.position.set(0.3, 0.15, 0); b2.children[0].material = b2.children[0].material.clone(); b2.children[0].material.color.setHex(AMINO_COLORS[1]); t.add(b2); }
        const b = quest.hot(() => t.position.clone().add(V(0, -0.55, 0)), label[k], { cls: 'tok', side: 'b' });
        b.done.then(async () => {
          b.remove();
          if (got[k] >= want[k]) { quest.say(`You have enough ${label[k]}.`); return; }
          got[k]++; left--;
          const gateP = V(t.position.x, 0.02, t.position.z);
          /* a ring for the carrier protein; oxygen passes straight through the membrane, so it has none */
          const door = k === 'oxygen' ? null : keep(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 8, 24), new THREE.MeshBasicMaterial({ color: 0xffe39a })));
          if (door) { door.rotation.x = Math.PI / 2; door.position.copy(gateP); }
          if (k !== 'oxygen') quest.say('A <b>carrier protein</b> carries it through the membrane.');
          else quest.say('Oxygen passes straight through the membrane.');
          await tween(t, { to: gateP, ms: 900 });
          await tween(t, { to: gateP.clone().add(V(0, 1.4, 0)), ms: 700 });
          burst(scene, t.position, { color: 0xffe39a, n: 30, r: 0.5 });
          await quest.gain(k, t.position);
          drop(t); drop(door);
          if (!left) done();
        });
      });
      const rbc = keep(token('rbc', 1)); rbc.position.set(-4.4, -3.9, -3.3); bob(rbc, 0.15);
      const rb = quest.hot(() => rbc.position.clone().add(V(0, 1.1, 0)), 'red blood cell', { cls: 'tok', side: 't' });
      const tryRbc = () => rb.done.then(async () => {
        quest.say('A red blood cell is a <b>whole cell</b>, about 7.5 µm across: much too large to pass through the membrane. It stays in the blood and carries oxygen.', 'no');
        const p0 = rbc.position.clone();
        await tween(rbc, { to: p0.clone().add(V(0, 2.4, 1.2)), ms: 700 }); await tween(rbc, { to: p0, ms: 700 });
      });
      tryRbc();
    });
    quest.say('');
  }
  async function co2() {
    const t = keep(token('co2', 0.36)); t.position.copy(WAY).add(V(0.6, 1.3, 0.6)); bob(t);
    await press(() => t.position.clone().add(V(0, 0.55, 0)), 'carbon dioxide', { cls: 'tok', side: 't' });
    await tween(t, { to: V(t.position.x, 0, t.position.z), ms: 800 });
    await tween(t, { to: V(t.position.x - 0.5, -3.0, t.position.z - 2.2), ms: 1300 });
    drop(t);
    quest.say('Carbon dioxide leaves into the blood, which carries it to the lungs.', 'ok');
    await quest.next('Back to the map');
  }

  /* ---------------- mitochondria ---------------- */
  const hero = W.mito.hero;
  const inMito = (x, y, z) => hero.localToWorld(V(x, y, z));
  async function split() {
    await fly(world.P.mito.view.pos, world.P.mito.view.at);
    if (!state.has('glucose') || !state.has('oxygen')) { quest.say('You need glucose and oxygen: they enter the cell at <b>the way in</b>.', 'no'); return false; }
    const d = depthTo(hero.position, 1.0);
    const glu = keep(token('glucose', 0.3)); glu.position.copy(scr(-1.1, 0.35, d)); bob(glu);
    await press(() => glu.position.clone().add(V(0, 0.5, 0)), 'glucose', { cls: 'tok', side: 't' });
    state.use('glucose');
    const a = keep(token('half', 0.3)), b = keep(token('half', 0.3));
    a.position.copy(glu.position); b.position.copy(glu.position); drop(glu);
    burst(scene, a.position, { n: 24, r: 0.4 });
    await Promise.all([tween(a, { to: scr(-1.35, 0.5, d), ms: 600 }), tween(b, { to: scr(-0.85, 0.15, d), ms: 600 })]);
    props.halves = [a, b];
    quest.say('The glucose is split into two smaller molecules, in the cytosol.', 'ok');
  }
  async function feed() {
    const d = depthTo(hero.position, 1.0);
    const halves = props.halves || [0, 1].map((i) => { const t = keep(token('half', 0.3)); t.position.copy(scr(-1.35 + i * 0.5, 0.5 - i * 0.35, d)); return t; });
    const ox = keep(token('oxygen', 0.3)); ox.position.copy(scr(-1.1, -0.45, d)); bob(ox, 0.05);
    const items = [[halves[0], 'smaller molecule'], [halves[1], 'smaller molecule'], [ox, 'oxygen']];
    for (const [t, l] of items) {
      await press(() => t.position.clone().add(V(0, 0.42, 0)), l, { cls: 'tok', side: 't' });
      await tween(t, { to: inMito(0, (Math.random() - 0.5) * 1.2, -0.15), ms: 800, scale: 0.6 });
    }
    state.use('oxygen');
    props.inside = items.map(x => x[0]);
  }
  async function respire() {
    (props.inside || []).forEach(drop);
    const cr = hero.children.filter(c => c.isMesh && c.geometry.type === 'RingGeometry');
    const t0 = performance.now();
    const glowF = (t) => { const k = Math.min(1, (performance.now() - t0) / 2600); cr.forEach(c => { c.material.emissiveIntensity = 0.5 + 1.6 * Math.sin(k * Math.PI); }); return k < 1; };
    await live(new Promise(r => { const f = () => { if (glowF()) requestAnimationFrame(f); else r(); }; R.FAST ? r() : f(); }));
    cr.forEach(c => { c.material.emissiveIntensity = 0.5; });
    burst(scene, hero.position, { color: 0xfff1a8, n: 90, r: 2.2, ms: 1600 });
    const out = [keep(token('co2', 0.26)), keep(token('water', 0.26))];
    const d = depthTo(hero.position, 1.0);
    out.forEach((t, i) => t.position.copy(hero.position).add(V(0, i ? 0.4 : -0.4, 0.3)));
    await Promise.all(out.map((t, i) => tween(t, { to: scr(-1.2, i ? 0.55 : -0.55, d), ms: 1400 })));
    quest.say(`<b>Carbon dioxide</b> and <b>water</b> are produced; energy is released.`, 'ok');
    await quest.gain('energy', hero.position, RESPIRE);
    out.forEach(drop);
    await quest.next(state.has('glucose') && state.has('oxygen') && state.energy() < 70 ? 'Next step' : 'Back to the map');
  }

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
  async function copy() {
    const g = gene();
    await press(() => g.curve.getPointAt(0.5).add(V(0, 0.3, 0)), 'Copy', { cost: COST.copy });
    const rib = keep(ribbon(copyCurve(), { radius: 0.035 }));
    const t0 = performance.now();
    await live(new Promise(r => { const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 2200); rib.userData.grow(k); if (k < 1) requestAnimationFrame(f); else r(); }; f(); }));
    props.rib = rib;
    quest.say('The copy of the gene: <b>mRNA</b>.', 'ok');
  }
  async function exportCopy() {
    let rib = props.rib; if (!rib) { rib = props.rib = keep(ribbon(copyCurve(), { radius: 0.035 })); rib.userData.grow(1); }
    /* the pore nearest the window's rim, so the copy is seen leaving */
    const rimPore = W.pores.slice().sort((a, b) => a.clone().sub(N0).normalize().dot(win) - b.clone().sub(N0).normalize().dot(win)).reverse()[0];
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
    const c = rib.geometry.boundingSphere ? rib.geometry.boundingSphere.center.clone() : N0.clone();
    await tween(rib, { to: rimPore.clone().sub(c).multiplyScalar(1.15), ms: 1600 });
    await quest.gain('mrna', rimPore);
    drop(rib); props.rib = null;
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

  /* ---------------- microtubules ---------------- */
  const T = world.P.tracks.center;
  async function grab() {
    await fly(world.P.tracks.view.pos, world.P.tracks.view.at);
    const ves = keep(token('vesicle', 0.45)); ves.add(token('amylase', 0.2)); ves.position.copy(T).add(V(-0.6, -1.6, 0.4));
    const mot = keep(token('motor', 0.6)); mot.position.copy(ves.position).add(V(0.9, -0.5, 0.2));
    props.ves = ves; props.mot = mot;
    await press(() => mot.position.clone().add(V(0, -0.6, 0)), 'Attach', { side: 'b' });
    await tween(mot, { to: ves.position.clone().add(V(0, -0.65, 0)), ms: 900 });
    quest.say('A motor protein holds the vesicle.', 'ok');
  }
  /* three crossings: at each, the microtubule the vesicle is on meets one that lies across the cell; microtubules never
     branch, and the motor walks one way along them (towards their top end), so the pupil chooses which one to step onto */
  async function maze() {
    const ves = props.ves || (() => { const t = keep(token('vesicle', 0.45)); t.add(token('amylase', 0.2)); t.position.copy(T).add(V(-0.6, -1.6, 0.4)); return (props.ves = t); })();
    const mot = props.mot || (() => { const t = keep(token('motor', 0.6)); t.position.copy(ves.position).add(V(0, -0.65, 0)); return (props.mot = t); })();
    const walk = async (to, ms) => {
      const steps = Math.max(3, Math.round(ves.position.distanceTo(to) / 0.25));
      const p0 = ves.position.clone();
      for (let s = 1; s <= steps; s++) {
        const k = s / steps, p = p0.clone().lerp(to, k);
        await Promise.all([tween(ves, { to: p, ms: ms / steps }), tween(mot, { to: p.clone().add(V(0, -0.65, 0)), ms: ms / steps })]);
        if (mot.userData.feet) mot.userData.feet.forEach((f, i) => { f.position.y = -0.3 + ((s + i) % 2 ? 0.06 : 0); });
      }
    };
    const forks = [[V(0.4, 1.1, -0.1), V(-1.3, 0.15, 0.3)], [V(-0.2, 1.0, 0.2), V(1.2, -0.1, 0.1)], [V(0.3, 1.2, -0.3), V(-1.2, 0.2, 0.2)]];
    for (let f = 0; f < forks.length; f++) {
      const here = ves.position.clone(), up = here.clone().add(forks[f][0]), down = here.clone().add(forks[f][1]);
      /* each microtubule runs on through the crossing, so the two cross instead of splitting */
      const lines = [up, down].map((to) => { const from = here.clone().lerp(to, -0.7); const c = new THREE.LineCurve3(from, to); const m = keep(new THREE.Mesh(new THREE.TubeGeometry(c, 8, 0.035, 6), new THREE.MeshBasicMaterial({ color: 0x9ff3ff, transparent: true, opacity: 0.85 }))); return m; });
      const order = Math.random() < 0.5 ? [0, 1] : [1, 0];
      await new Promise(done => {
        order.forEach(i => {
          const to = i === 0 ? up : down;
          quest.hot(() => to.clone(), i === 0 ? '↑ this one' : '↔ this one', { side: 'c', aria: i === 0 ? 'the microtubule that goes up' : 'the microtubule that lies across the cell' }).done.then(async (b) => {
            if (!quest.energy(COST.step)) return;
            quest.clearHots();
            if (i === 1) {
              quest.say('This microtubule lies across the cell: on it, your vesicle moves to the side, not to the top. Amylase must reach the top, next to the duct. Choose again.', 'no');
              await walk(here.clone().lerp(down, 0.45), 900); await walk(here, 700);
              done('again');
              return;
            }
            quest.say('');
            await walk(up, 1500);
            done('up');
          });
        });
      }).then(async (r) => { lines.forEach(drop); if (r === 'again') f--; });
    }
    const g = W.granules.filter(x => x.p.y > 12.5).sort((a, b) => a.p.distanceTo(ves.position) - b.p.distanceTo(ves.position))[0];
    if (g) await walk(g.p.clone().add(V(0.9, -0.3, 0.6)), 1200);
    await quest.gain('top', ves.position);
    state.use('packed');
    drop(mot);
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
  async function simple() {
    world.simple(true);
    const five = [[V(-6.2, 9.5, 0.2), 'cell membrane'], [V(-3.0, 12.6, 1.0), 'cytoplasm'], [V(0, 5.0, 2.7), 'nucleus'], [W.mito.hero.position.clone(), 'mitochondria'], [W.freeRibosomes[0].p.clone(), 'ribosomes']];
    const tags = five.map(([p, t]) => { const b = quest.hot(p, t, { cls: 'tag y7', side: 'c' }); b.el.disabled = true; return b; });
    await quest.next();
    tags.forEach(t => t.remove());
  }
  /* each structure an electron microscope shows appears in turn, named where it is */
  async function full() {
    const b = quest.hot(() => V(0, 10.5, 3), 'Show everything', { side: 'c', cls: 'big' });
    await b.done; b.remove();
    const show = [['rer', 'rough ER', world.P.rer.center], ['nucleus-inside', 'nucleolus and chromosomes', world.P.nucleolus.center], ['ser', 'smooth ER', world.P.ser.center],
      ['golgi', 'Golgi apparatus', world.P.golgi.center], ['granules', 'vesicles', world.P.exit.center], ['microtubules', 'microtubules', world.P.tracks.center],
      ['lysosomes', 'lysosomes', V(-2.9, 10.6, -0.6)], ['centrosome', 'centrosome', V(0.1, 14.55, -1.1)], ['apex', 'the duct, at the top of the cell', V(0, 16.6, 0)]];
    const tags = [];
    for (const [k, t, p] of show) {
      world.reveal(k); burst(scene, p, { n: 36, r: 0.8 });
      const tg = quest.hot(p, t, { cls: 'tag', side: 'c' }); tg.el.disabled = true; tags.push(tg);
      await wait(700);
    }
    world.simple(false);
    await quest.next();
    tags.forEach(t => t.remove());
  }
  async function organelles() { await quest.next(); }
  async function mission() { await quest.next('Go to the map'); }

  const ACT = { gate, co2, split, feed, respire, enter, findchr, findgene, copy, export: exportCopy, small: () => build('small'), large: () => build('large'), out,
    assemble, translate, where, dock, grow, cut, fold, bud, lipid, layer, join, through, sortgame, package: packageIt, grab, maze, smell, fuse, flatten,
    simple, full, organelles, mission };
  return {
    run: (name) => Promise.resolve().then(() => ACT[name] ? ACT[name]() : quest.next()).catch(e => { if (e === STALE) return false; throw e; }),
    reset
  };
}
