/* ============================================================
   scene.js — the membrane view's picture (13 Nov 2026): the model of sim.js drawn in 3D with three.js, every size
   true relative to the others (nm; the camera zooms, nothing is ever enlarged: memory true-relative-sizes).
   Up (+y) is outside the cell, down is the cytoplasm; the cut face is at the front (z = +9).

   SIZES (nm), and where they come from:
   - bilayer: the heads' middles 2.0 nm each side of the membrane's middle, a head 0.8 nm across, so about 5 nm thick
     with its heads (phosphate to phosphate about 4 nm: Mitra et al. 2004, PNAS 101:4083; the same figures as the game's
     js/ib/membrane.js); tails 1.6 nm, meeting in the middle, each 0.42 nm thick (a hydrocarbon chain is 0.4–0.5 nm across: the
     expert review, 13 Nov 2026: thinner tails left gaps in the middle that a real bilayer does not have); a phospholipid
     about 2.5 nm long;
   - cholesterol: 1.7 nm long: its small hydrophilic –OH end just under the heads' level, its stiff rings beside the upper
     part of the tails, a short tail below (its rings lie below the phospholipid heads: Allender, Sodt and Schick 2019,
     Biophys J 116:2356);
   - one sugar unit of a carbohydrate chain about 0.5 nm; a chain on a glycolipid 4 units, on the glycoprotein 9;
   - proteins (models built of beads, as coarse-grained computer simulations draw them; right in size, NOT measured
     shapes): a channel protein of 4 subunits round a pore, 6 nm across and 7 nm tall; a carrier protein of 12 helices,
     about 5 nm across and 7 nm tall (a glucose transporter is about that size); a glycoprotein with one helix through
     the membrane and its larger part outside the cell; a peripheral protein 3.4 nm across on the cytoplasm side.
     Membrane proteins are typically 3–5 nm across (Phillips 2018, arXiv:1703.02066).
   MOTION drawn here on top of the model's sideways movement: each tail bends (in the vertex shader: no work for the
   page's script), a phospholipid's second tail keeps a bend if it is unsaturated, each lipid turns about its long axis
   and bobs a little. All of it is far slower than real (the page says so).
   Nothing is allocated while it runs: every molecule is an instance whose numbers are written in place.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { classOf } from './seen.js?v=202611150027';

export const Y = { head: 2.0, headR: 0.4, tailTop: 1.66, tailL: 1.6, tailOff: 0.23, tailR: 0.21, chol: 1.78, top: 2.4 };
const COL = {
  head: 0xff9ac8, tail: 0xffd8a8, cholRing: 0xf4b93a, cholOH: 0xe5484d, sugar: 0x6fd08c,
  gold: 0xffd24a, channel: [0x5d8df2, 0x7fa6ff], carrier: [0x2fb5a8, 0x57cdb6], glyco: 0xf08a4b, peri: 0xb47be8
};
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* several shapes as one, each with its own colour (no library needed for three small parts) */
function merge(parts) {
  const pos = [], nor = [], col = [];
  for (const [g, c] of parts) {
    const n = g.index ? g.toNonIndexed() : g, P = n.attributes.position, N = n.attributes.normal, k = new THREE.Color(c);
    for (let i = 0; i < P.count; i++) { pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i)); col.push(k.r, k.g, k.b); }
    g.dispose(); if (n !== g) n.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return out;
}

/* the tails' bending, the same sum in the shader and here (a name's line must end ON the tail it names) */
const FLEX = { ax: 0.20, ax2: 0.09, az: 0.18, az2: 0.08, kinkAt: 0.42, kink: 0.95 };
export function tailBend(t, ph, kink, s, out) {
  const s2 = s * s;
  out.x = s2 * (FLEX.ax * Math.sin(t * 1.7 + ph) + FLEX.ax2 * Math.sin(t * 3.1 + ph * 2.3)) + kink * Math.max(0, s - FLEX.kinkAt) * FLEX.kink;
  out.z = s2 * (FLEX.az * Math.cos(t * 1.3 + ph * 1.7) + FLEX.az2 * Math.sin(t * 2.7 + ph * 0.6));
  return out;
}

/* ---- a protein built of beads: [{x, y, z, r, c}] in its own frame (y through the membrane) ---- */
function beadMesh(beads, mat) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), mat, beads.length), o = new THREE.Object3D(), c = new THREE.Color();
  beads.forEach((b, i) => { o.position.set(b.x, b.y, b.z); o.scale.setScalar(b.r); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, c.set(b.c)); });
  m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; m.computeBoundingSphere();
  return m;
}
function ball(R, cx, cy, cz, radius, r, n, c, out, flat = 1) {
  /* n beads inside a ball (flat < 1: lower than wide), none closer than 0.9 r to another */
  let tries = 0; const mine = [];
  while (mine.length < n && tries++ < 4000) {
    const u = R() * 2 - 1, a = R() * 6.283, q = Math.cbrt(R()) * radius, s = Math.sqrt(1 - u * u);
    const p = { x: cx + q * s * Math.cos(a), y: cy + q * u * flat, z: cz + q * s * Math.sin(a), r, c };
    if (mine.every(m => Math.hypot(m.x - p.x, m.y - p.y, m.z - p.z) > 0.9 * r)) mine.push(p);
  }
  out.push(...mine);
}
function buildProteins(R) {
  const shade = (c, k) => new THREE.Color(c).multiplyScalar(k).getHex();
  /* channel protein: 4 subunits round a pore that is narrow in the middle of the membrane */
  const channel = [];
  for (let q = 0; q < 4; q++) for (let y = -2.85; y <= 3.1; y += 0.74) {
    const base = q * Math.PI / 2, mid = 1 - Math.min(1, Math.abs(y - 0.1) / 2.9), c = COL.channel[q % 2];
    /* wider towards the outside of the cell (as the potassium channel KcsA is), its pore narrow in the middle */
    const up = (y + 2.85) / 5.9, rin = 1.3 - 0.3 * mid + 0.22 * up, rout = 1.92 + 0.5 * up;
    for (const da of [-0.44, 0.44]) channel.push({ x: rin * Math.cos(base + da), y: y + (R() - 0.5) * 0.2, z: rin * Math.sin(base + da), r: 0.6, c: shade(c, 0.9 + R() * 0.14) });
    for (const da of [-0.52, 0, 0.52]) channel.push({ x: rout * Math.cos(base + da) + (R() - 0.5) * 0.14, y: y + (R() - 0.5) * 0.24, z: rout * Math.sin(base + da) + (R() - 0.5) * 0.14, r: 0.64, c: shade(c, 0.86 + R() * 0.18) });
  }
  /* carrier protein: 12 helices in two halves, leaning a little, with a loop on the cytoplasm side */
  const carrier = [];
  /* (its two halves lean apart towards the outside of the cell: a cleft open to the outside, where its molecule binds) */
  for (let half = 0; half < 2; half++) for (let k = 0; k < 6; k++) {
    const th = (k / 5 - 0.5) * 2.5 + (half ? 0 : Math.PI), lean = (k % 2 ? 1 : -1) * 0.12, c = COL.carrier[half], side = half ? 1 : -1;
    for (let y = -2.9; y <= 3.1; y += 0.66) {
      const t2 = th + lean * y / 2.9, open = 0.1 * Math.max(0, y + 0.6);
      carrier.push({ x: side * (0.62 + open) + 0.98 * Math.cos(t2), y, z: 1.3 * Math.sin(t2) * (half ? 1 : -1), r: 0.55, c: shade(c, 0.86 + R() * 0.18) });
    }
  }
  for (let y = -2.7; y <= -0.4; y += 0.7) carrier.push({ x: (R() - 0.5) * 0.3, y, z: (R() - 0.5) * 0.5, r: 0.56, c: shade(COL.carrier[0], 0.8) });
  ball(R, 0.4, -3.75, 0.2, 1.05, 0.52, 9, shade(COL.carrier[1], 0.92), carrier, 0.6);
  /* glycoprotein: one helix through the membrane, a short end in the cytoplasm, its larger part outside the cell with
     two branched carbohydrate chains (each bead of a chain is one sugar unit) */
  const glyco = [], sugar = [];
  for (let y = -3.1; y <= 2.5; y += 0.56) glyco.push({ x: 0.1 * y, y, z: 0.06 * y, r: 0.5, c: shade(COL.glyco, 0.86 + R() * 0.16) });
  ball(R, -0.25, -3.6, 0.1, 0.55, 0.42, 3, shade(COL.glyco, 0.8), glyco);
  ball(R, 0.3, 4.35, 0.15, 1.3, 0.6, 24, COL.glyco, glyco, 0.92);
  glyco.forEach(b => { if (b.y > 2.6) b.c = shade(COL.glyco, 0.88 + R() * 0.2); });
  const tree = (x, y, z, dx, dz) => {
    for (let k = 0; k < 3; k++) sugar.push({ x: x + dx * k * 0.2, y: y + k * 0.5, z: z + dz * k * 0.2, r: 0.27, c: COL.sugar });
    for (const side of [-1, 1]) for (let k = 1; k <= 3; k++) sugar.push({ x: x + dx * 0.4 + side * (dz ? 0.34 : 0.1) * k + dx * 0.1 * k, y: y + 1.0 + k * 0.4, z: z + dz * 0.4 + side * (dx ? 0.34 : 0.1) * k + dz * 0.1 * k, r: 0.27, c: side < 0 ? COL.sugar : shade(COL.sugar, 0.88) });
  };
  tree(1.25, 5.25, 0.2, 1, 0); tree(-0.75, 5.5, -0.5, 0, -1);
  /* peripheral protein: one compact ball on the cytoplasm side, touching the heads of the inner layer */
  const peri = [];
  ball(R, 0, -(Y.top + 1.62), 0, 1.22, 0.6, 26, COL.peri, peri);
  peri.forEach(b => { b.c = shade(COL.peri, 0.84 + R() * 0.22); });
  return { channel: { beads: channel, top: 3.7, bottom: -3.5 }, carrier: { beads: carrier, top: 3.6, bottom: -4.4 },
    glyco: { beads: glyco, sugar, top: 8.1, bottom: -4.0, body: 4.9 }, peripheral: { beads: peri, top: -Y.top, bottom: -(Y.top + 3.4) } };
}

function haloTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 96;
  const g = c.getContext('2d'), gr = g.createRadialGradient(48, 48, 6, 48, 48, 48);
  gr.addColorStop(0, 'rgba(255,238,170,.85)'); gr.addColorStop(0.35, 'rgba(255,214,90,.34)'); gr.addColorStop(1, 'rgba(255,214,90,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 96, 96);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function makeScene(S) {
  const P = S.P, R = rng(11), group = new THREE.Group(); group.name = 'membrane';
  const uT = { value: 0 };
  const pl = [], ch = [], gl = [];
  for (let i = 0; i < S.N; i++) { if (S.kind[i] === 1) ch.push(i); else { pl.push(i); if (S.kind[i] === 2) gl.push(i); } }
  const plAt = new Int32Array(S.N).fill(-1); pl.forEach((i, n) => { plAt[i] = n; });

  /* ---- materials: the lipids can fade (step "mosaic": the proteins are then seen whole); see-through from the start, so
     no colour program is made in the middle of a fade (memory threejs-see-through-draw-order) ---- */
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x5c1a3c, emissiveIntensity: 0.38, roughness: 0.42, transparent: true });
  const tailMat = new THREE.MeshStandardMaterial({ color: COL.tail, emissive: 0x4a3614, emissiveIntensity: 0.25, roughness: 0.6, transparent: true });
  const cholMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, emissive: 0x4a3008, emissiveIntensity: 0.3, roughness: 0.5, transparent: true });
  const sugarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x0c3a1c, emissiveIntensity: 0.35, roughness: 0.5 });
  const glSugarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x0c3a1c, emissiveIntensity: 0.35, roughness: 0.5, transparent: true });   /* the glycolipids' chains fade with their lipids */
  tailMat.onBeforeCompile = sh => {
    sh.uniforms.uT = uT;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aTail;\nuniform float uT;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float mvS = clamp(-position.y / ${Y.tailL.toFixed(3)}, 0.0, 1.0);
        float mvS2 = mvS * mvS;
        transformed.x += aTail.z * mvS2 * (${FLEX.ax} * sin(uT * 1.7 + aTail.x) + ${FLEX.ax2} * sin(uT * 3.1 + aTail.x * 2.3)) + aTail.y * max(0.0, mvS - ${FLEX.kinkAt}) * ${FLEX.kink};
        transformed.z += aTail.z * mvS2 * (${FLEX.az} * cos(uT * 1.3 + aTail.x * 1.7) + ${FLEX.az2} * sin(uT * 2.7 + aTail.x * 0.6));`);
  };
  tailMat.customProgramCacheKey = () => 'mv-tail';

  /* ---- heads ---- */
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(Y.headR, 18, 12), headMat, pl.length);
  const baseHead = new THREE.Color(COL.head), gold = new THREE.Color(COL.gold), I4 = new THREE.Matrix4();
  for (let n = 0; n < pl.length; n++) { heads.setMatrixAt(n, I4); heads.setColorAt(n, baseHead); }
  /* ---- tails: a tube from the head down (inner layer: turned over), 7 rings so that it can bend ---- */
  const tg = new THREE.CylinderGeometry(Y.tailR, Y.tailR * 0.86, Y.tailL, 8, 7, false); tg.translate(0, -Y.tailL / 2, 0);
  const aTail = new Float32Array(pl.length * 2 * 3);
  pl.forEach((i, n) => { for (let k = 0; k < 2; k++) { const o = (n * 2 + k) * 3; aTail[o] = S.phase[i] + k * 2.1; aTail[o + 1] = k === 1 && S.kink[i] ? 1 : 0; aTail[o + 2] = 1; } });
  tg.setAttribute('aTail', new THREE.InstancedBufferAttribute(aTail, 3));
  const tails = new THREE.InstancedMesh(tg, tailMat, pl.length * 2);
  for (let n = 0; n < pl.length * 2; n++) tails.setMatrixAt(n, I4);
  /* ---- cholesterol: the –OH end (red, at the top), the stiff rings (a flat plate), a short tail ---- */
  const plate = new THREE.SphereGeometry(1, 12, 9); plate.scale(0.34, 0.5, 0.15); plate.translate(0, -0.66, 0);
  const oh = new THREE.SphereGeometry(0.135, 10, 8);
  const ct = new THREE.CylinderGeometry(0.07, 0.055, 0.6, 6, 1, false); ct.translate(0, -1.4, 0);
  const chol = new THREE.InstancedMesh(merge([[plate, COL.cholRing], [oh, COL.cholOH], [ct, COL.cholRing]]), cholMat, ch.length);
  for (let n = 0; n < ch.length; n++) chol.setMatrixAt(n, I4);
  /* ---- the glycolipids' carbohydrate chains: 4 sugar units each, on the side outside the cell ---- */
  const GL_N = 4, glBeads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.27, 12, 9), glSugarMat, Math.max(1, gl.length * GL_N));
  const sugarCol = new THREE.Color(COL.sugar);
  for (let n = 0; n < gl.length * GL_N; n++) { glBeads.setMatrixAt(n, I4); glBeads.setColorAt(n, sugarCol); }
  heads.renderOrder = 3; tails.renderOrder = 1; chol.renderOrder = 2; glBeads.renderOrder = 4;
  [heads, tails, chol, glBeads].forEach(m => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; group.add(m); });

  /* ---- proteins ---- */
  const shapes = buildProteins(R), prots = [];
  S.prot.forEach((p, k) => {
    const sh = shapes[p.id], g = new THREE.Group(); g.name = p.id;
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.55 });
    g.add(beadMesh(sh.beads, mat));
    if (sh.sugar) g.add(beadMesh(sh.sugar, sugarMat));
    group.add(g); prots.push({ g, mat, sh, p, lit: 0 });
  });

  /* ---- what is followed: a soft light on it (light, not size), and its path ---- */
  const haloTex = haloTexture();
  const mkHalo = through => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthTest: !through, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.renderOrder = 10; s.visible = false; group.add(s); return s; };
  const haloL = mkHalo(false), haloP = mkHalo(true);
  const TR = 1400;
  /* a path lies just above the heads. The phospholipid's is hidden where a protein stands in front of it (drawn over a
     protein it looked as if the lipid had gone through it); the protein's own is seen through the protein, or its first
     nanometres could not be seen at all */
  const mkTrail = (col, through) => {
    const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, depthTest: !through, depthWrite: false });
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 8, 6), mat, TR); m.count = 0; m.frustumCulled = false; m.renderOrder = 9;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.06, 8, 28), mat); ring.rotation.x = Math.PI / 2; ring.renderOrder = 9; ring.visible = false;
    group.add(m, ring);
    const arr = m.instanceMatrix.array; for (let n = 0; n < TR; n++) m.setMatrixAt(n, I4);
    const T = { mesh: m, ring, n: 0, lx: 0, lz: 0, on: false,
      start(x, z) { T.n = 0; m.count = 0; T.lx = x; T.lz = z; T.on = true; ring.position.set(x, Y.top + 0.27, z); ring.visible = true; T.add(x, z, true); },
      add(x, z, force) {
        if (!T.on) return;
        if (!force && (x - T.lx) * (x - T.lx) + (z - T.lz) * (z - T.lz) < 0.0064) return;
        const o = (T.n % TR) * 16; arr[o + 12] = x; arr[o + 13] = Y.top + 0.27; arr[o + 14] = z;
        T.n++; m.count = Math.min(T.n, TR); T.lx = x; T.lz = z; m.instanceMatrix.needsUpdate = true;
      },
      stop() { T.on = false; m.count = 0; ring.visible = false; T.n = 0; } };
    return T;
  };
  const trailL = mkTrail(0xffd24a, false), trailP = mkTrail(0x8fe8ff, true);
  let litLipid = -1, litProt = -1;

  const bobOf = (i, t) => 0.09 * Math.sin(t * 1.9 + S.phase[i]), toCam = new THREE.Vector3();
  function draw(t, camPos) {
    uT.value = t;
    const hx = heads.instanceMatrix.array, tx = tails.instanceMatrix.array, cx = chol.instanceMatrix.array, gx = glBeads.instanceMatrix.array;
    for (let n = 0; n < pl.length; n++) {
      const i = pl[n], sg = S.layer[i] ? -1 : 1, bob = bobOf(i, t), X = S.x[i], Z = S.z[i];
      let o = n * 16; hx[o + 12] = X; hx[o + 13] = sg * (Y.head + bob); hx[o + 14] = Z;
      const a = S.turn0[i] + S.spin[i] * t, c = Math.cos(a), s = Math.sin(a), ty = sg * (Y.tailTop + bob);
      o = n * 32;
      tx[o] = c; tx[o + 2] = -s; tx[o + 5] = sg; tx[o + 8] = sg * s; tx[o + 10] = sg * c;
      tx[o + 12] = X - Y.tailOff * c; tx[o + 13] = ty; tx[o + 14] = Z + Y.tailOff * s;
      o += 16;
      tx[o] = c; tx[o + 2] = -s; tx[o + 5] = sg; tx[o + 8] = sg * s; tx[o + 10] = sg * c;
      tx[o + 12] = X + Y.tailOff * c; tx[o + 13] = ty; tx[o + 14] = Z - Y.tailOff * s;
    }
    for (let n = 0; n < ch.length; n++) {
      const i = ch[n], sg = S.layer[i] ? -1 : 1, a = S.turn0[i] + S.spin[i] * t * 0.7, c = Math.cos(a), s = Math.sin(a), o = n * 16;
      cx[o] = c; cx[o + 2] = -s; cx[o + 5] = sg; cx[o + 8] = sg * s; cx[o + 10] = sg * c;
      cx[o + 12] = S.x[i]; cx[o + 13] = sg * (Y.chol + 0.6 * bobOf(i, t)); cx[o + 14] = S.z[i];
    }
    for (let n = 0; n < gl.length; n++) {
      const i = gl[n], bob = bobOf(i, t), sw = Math.sin(t * 0.8 + S.phase[i]), sw2 = Math.cos(t * 0.63 + S.phase[i] * 1.3);
      for (let k = 0; k < GL_N; k++) {
        const o = (n * GL_N + k) * 16, lift = k + 1;
        gx[o + 12] = S.x[i] + 0.05 * lift * lift * sw + (k === 3 ? 0.3 : 0); gx[o + 13] = Y.top + 0.2 + k * 0.5 + bob - (k === 3 ? 0.18 : 0); gx[o + 14] = S.z[i] + 0.04 * lift * lift * sw2;
      }
    }
    heads.instanceMatrix.needsUpdate = tails.instanceMatrix.needsUpdate = chol.instanceMatrix.needsUpdate = glBeads.instanceMatrix.needsUpdate = true;
    for (let k = 0; k < prots.length; k++) { const q = prots[k]; q.g.position.set(q.p.x, 0, q.p.z); q.g.rotation.y = q.p.ang; }
    /* the followed head's light stands 0.9 nm nearer the camera than the head: it shines over the heads beside it, and a
       protein that stands in front of the head hides it (the expert review: it had shone through the carrier protein) */
    if (litLipid >= 0) {
      haloL.position.set(S.x[litLipid], Y.head + bobOf(litLipid, t), S.z[litLipid]);
      if (camPos) haloL.position.add(toCam.copy(camPos).sub(haloL.position).normalize().multiplyScalar(0.9));
      trailL.add(S.x[litLipid], S.z[litLipid]);
    }
    if (litProt >= 0) { const q = prots[litProt]; haloP.position.set(q.p.x, Math.min(q.sh.top, q.sh.body || 9) - 1.2, q.p.z); trailP.add(q.p.x, q.p.z); }
  }

  /* the lipids' fade (1 = solid, 0.13 = a ghost through which the proteins are seen whole) */
  let ghost = 1;
  function setGhost(a) {
    if (a === ghost) return; ghost = a;
    const solid = a > 0.995;
    for (const m of [headMat, tailMat, cholMat, glSugarMat]) { m.opacity = a; m.depthWrite = solid; }
  }
  function lightLipid(i) {
    if (litLipid >= 0) { heads.setColorAt(plAt[litLipid], baseHead); }
    litLipid = i;
    if (i >= 0) { heads.setColorAt(plAt[i], gold); haloL.visible = true; haloL.material.opacity = 1; trailL.mesh.material.opacity = 0.95; haloL.scale.setScalar(2.6); trailL.start(S.x[i], S.z[i]); }
    else { haloL.visible = false; trailL.stop(); }
    heads.instanceColor.needsUpdate = true;
  }
  function lightProtein(k) {
    if (litProt >= 0) prots[litProt].mat.emissiveIntensity = 0;
    litProt = k;
    if (k >= 0) { const q = prots[k]; q.mat.emissiveIntensity = 0.05; haloP.visible = true; haloP.material.opacity = 0.2; trailP.mesh.material.opacity = 0.95; haloP.scale.setScalar(9); trailP.start(q.p.x, q.p.z); }
    else { haloP.visible = false; trailP.stop(); }
  }

  /* what is followed fades before it goes (a = 1 lit, 0 gone): its light and its path */
  function dimFollow(aL, aP) {
    haloL.material.opacity = aL; trailL.mesh.material.opacity = 0.95 * aL;
    haloP.material.opacity = 0.2 * aP; trailP.mesh.material.opacity = 0.95 * aP;
    if (litProt >= 0) prots[litProt].mat.emissiveIntensity = 0.05 * aP;
  }

  /* ---- points that names end on ---- */
  const tb = { x: 0, z: 0 };
  function lipidPoint(i, part, t, out) {
    const sg = S.layer[i] ? -1 : 1, bob = bobOf(i, t);
    if (part === 'head') return out.set(S.x[i], sg * (Y.head + bob), S.z[i]);
    /* the top of a head: of a head in the sea of heads, seen from above, only this part shows (the head in front covers the rest) */
    if (part === 'crown') return out.set(S.x[i], sg * (Y.head + 0.2 + bob), S.z[i]);
    if (part === 'oh') return out.set(S.x[i], sg * (Y.chol + 0.6 * bob), S.z[i]);      /* cholesterol's hydrophilic end */
    if (part === 'ring') return out.set(S.x[i], sg * (Y.chol - 0.66 + 0.6 * bob), S.z[i]);      /* the middle of its rings */
    /* the third sugar unit of a glycolipid's chain, where draw() puts it */
    if (part === 'sugar') return out.set(S.x[i] + 0.45 * Math.sin(t * 0.8 + S.phase[i]), Y.top + 0.2 + 1.0 + bob, S.z[i] + 0.36 * Math.cos(t * 0.63 + S.phase[i] * 1.3));
    /* a tail: 'tail0' the first (always straight), a third of the way down it; 'tail1' the second (bent if unsaturated),
       past its bend */
    const k = part === 'tail1' ? 1 : 0, s = part === 'tail1' ? 0.62 : 0.3, a = S.turn0[i] + S.spin[i] * t, c = Math.cos(a), sn = Math.sin(a);
    tailBend(t, S.phase[i] + k * 2.1, k === 1 && S.kink[i] ? 1 : 0, s, tb);
    const lx = (k ? Y.tailOff : -Y.tailOff) + tb.x, lz = tb.z;
    /* the instance's turn: local x → (c, 0, -s), local z → sg·(s, 0, c) */
    return out.set(S.x[i] + lx * c + sg * lz * sn, sg * (Y.tailTop + bob - s * Y.tailL), S.z[i] - lx * sn + sg * lz * c);
  }
  /* the lipid of one kind and layer nearest a point; the one it had is kept unless another is clearly nearer */
  function nearest(layer, want, x, z, cur) {
    let best = -1, bd = 1e9;
    const a = layer * S.PER, b = a + S.PER;
    for (let i = a; i < b; i++) {
      if (!want(i)) continue;
      const d = (S.x[i] - x) * (S.x[i] - x) + (S.z[i] - z) * (S.z[i] - z);
      if (d < bd) { bd = d; best = i; }
    }
    if (cur >= 0 && cur !== best && want(cur)) { const d = (S.x[cur] - x) * (S.x[cur] - x) + (S.z[cur] - z) * (S.z[cur] - z); if (Math.sqrt(d) < Math.sqrt(bd) + 0.45) return cur; }
    return best;
  }
  /* a point in the lower part of a protein (the peripheral protein's name comes from below) */
  function protLow(k, out) { const q = prots[k]; return out.set(q.p.x, q.sh.bottom + 0.9, q.p.z); }
  function dispose() {
    group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
    haloTex.dispose();
  }
  return { group, draw, setGhost, lightLipid, lightProtein, dimFollow, lipidPoint, nearest, protLow, dispose, pl, ch, gl, prots, heads, tails, chol, trailL, trailP,
    get ghost() { return ghost; }, get litLipid() { return litLipid; }, get litProt() { return litProt; } };
}

/* ============================================================
   The stage: the renderer, the lights and a camera that zooms (a view = what it looks at, from where, and how wide).
   ============================================================ */
export function makeStage(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  let ratio = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(ratio);
  renderer.domElement.className = 'memv__canvas'; renderer.domElement.setAttribute('role', 'img');
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(26, 1, 1, 400);
  scene.fog = new THREE.Fog(0x0a0d29, 60, 160);
  scene.add(new THREE.HemisphereLight(0xe6ecff, 0x2a1c4a, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(18, 30, 24); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9db4ff, 0.7); rim.position.set(-20, 6, -18); scene.add(rim);
  let W = 1, H = 1;
  const V = { at: new THREE.Vector3(), az: 0, el: 0.3, dist: 80 };
  function size() {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    if (w === W && h === H) return false;
    W = w; H = h; renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); return true;
  }
  /* how far back the camera stands so that a width and a height (nm, at the point looked at) are both in the picture */
  const distFor = (spanW, spanH) => { const th = Math.tan(cam.fov * Math.PI / 360) * 2; return Math.max(spanW / (th * cam.aspect), spanH / th); };
  function place() {
    const ce = Math.cos(V.el);
    cam.position.set(V.at.x + V.dist * ce * Math.sin(V.az), V.at.y + V.dist * Math.sin(V.el), V.at.z + V.dist * ce * Math.cos(V.az));
    cam.lookAt(V.at); cam.updateMatrixWorld();
    scene.fog.near = V.dist - 6; scene.fog.far = V.dist + 70;
  }
  const v3 = new THREE.Vector3();
  /* a point of the model on the screen (px in the stage); out.z < 1 means in front of the camera */
  function project(p, out) { v3.copy(p).project(cam); out.x = (v3.x + 1) / 2 * W; out.y = (1 - v3.y) / 2 * H; out.z = v3.z; return out; }
  /* px for 1 nm at the point looked at */
  function pxPerNm() { return H / (2 * Math.tan(cam.fov * Math.PI / 360) * V.dist); }
  function render() { renderer.render(scene, cam); }
  /* which kind of molecule is drawn at a point of the picture (px in the stage): read back from the frame just drawn,
     so call it in the same task as render(); `raw` gives the four numbers instead (the check tool) */
  const pb = new Uint8Array(4);
  function probe(x, y, raw) {
    const gl = renderer.getContext(), r = renderer.getPixelRatio();
    gl.readPixels(Math.round(x * r), Math.round((H - y) * r), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pb);
    return raw ? [pb[0], pb[1], pb[2], pb[3]] : classOf(pb[0], pb[1], pb[2], pb[3]);
  }
  /* fewer pixels on a slow computer, judged over 90 frames (never above 1.75 per point: the IB view's rule) */
  let acc = 0, cnt = 0;
  function pace(ms) {
    acc += ms; if (++cnt < 90) return;
    const avg = acc / cnt; acc = 0; cnt = 0;
    if (avg > 34 && ratio > 1) { ratio = Math.max(1, ratio - 0.25); renderer.setPixelRatio(ratio); renderer.setSize(W, H, false); }
  }
  function stop() { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); }
  return { renderer, scene, cam, V, size, place, project, probe, pxPerNm, distFor, render, pace, stop, get W() { return W; }, get H() { return H; } };
}
