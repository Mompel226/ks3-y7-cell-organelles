/* ============================================================
   transcribe.js — Explorer, beyond the Year 7 list: how a cell copies a gene (4 Nov 2026).
   Daniel, 4 Nov 2026: "let's just keep it simple. Unless you could add the option … if the students decide to see how
   the DNA or the gene is made a copy of, then you should create that animation in detail". So the nucleus's copy step
   stays one press (Copy), and this film is a choice beside it (and at the nucleus's end), in a 3D view of its own, in
   steps that each wait for the pupil (memory animations-wait-for-the-reader).
   Of a first version: "clunky … the things are not clear. They're overlapping … make it professional": the DNA is drawn
   untwisted, as a flat ladder facing the pupil, where nothing lies over anything; a letter on every base; the enzyme a
   clear shape with a bright edge; one building block of RNA at a time; the copy laid above the DNA, parallel to it.
   Then: "my slides of biological molecules within year 9 … go from a packed chromosome into inside one of the strands,
   and then see the histones and see how the DNA is packed … so the students actually see … how small they are compared
   to the whole thing", and A, T, C and G explained as nucleotides. So the film first zooms in, as on his slide (30 nm →
   11 nm → 2 nm), with a scale bar at each size and the parts named on the picture:
   0  the whole thread of chromosome 1, from far away (scale bar 1 µm), the gene's place lit (since 12 Nov 2026);
   1  closer, a short piece of it: the chromatin fibre, nucleosomes packed in a coil (30 nm);
   2  it loosens into beads on a string: DNA wound round histones (a nucleosome, 11 nm);
   3  into the DNA between two beads: the double helix (2 nm), which turns slowly;
   4  untwisted: a chain of nucleotides (a sugar, a phosphate and a base: A, T, C or G);
   5  the bases pair, A with T and C with G, held by hydrogen bonds (two between A and T, three between C and G);
   6  an enzyme, RNA polymerase, joins the gene (unwound from its histones) and separates the two strands: the hydrogen
      bonds between them break;
   7  building blocks of RNA arrive one at a time; each fits against a base of ONE strand (U with A, A with T, …), held
      by hydrogen bonds;
   8  they join in a chain, the copy (mRNA), which leaves the enzyme as it grows; behind it the DNA joins again;
   9  at the end of the gene the enzyme leaves the DNA: the copy is finished; the DNA stays in the nucleus.
   Then (Daniel, 4 Nov 2026): "you start already mentioning ATCG, and it's not already visible in the image … when you
   finally can see the nucleic bases, then you show AT fits each other, CG fits each other … make sure that there is a
   hydrogen bonds shown". So nothing names a base before the bases are on the picture: the key beside the film appears at
   step 5 (and U in it at step 7), and the hydrogen bonds are drawn: dashes between the bases of each pair, which break
   where the strands are apart and form again behind the enzyme; the same between a building block of RNA and its base.
   True at this level (memory biology-before-pedagogy): the sizes are the textbook ones (his slide); one strand is copied;
   RNA has U where DNA has T; the strands are apart only inside the enzyme; the copy reads like the other strand, with U
   for T. Left out, for Year 7: the start signal, the strands' directions, the copy's changes before it leaves the nucleus.
   The bases are an example, not the amylase gene's own. The ladder is spaced out a little, so that its letters can be read.
   12 Nov 2026 (Daniel, of the film "From DNA to protein - 3D": "it's so nice, the transitions"; and, of the chromosome
   it shows first as an X: "you could have a chromosome all uncondensed and then condense it … and then show how … the
   chromosome is made"): the film now starts from the whole thread of chromosome 1, the one the pupil found in the
   nucleus (the game's own curve, W.chromosomes[0], turned so that the gene's place lies along the picture), drawn at
   the fibre's true width, 30 nm, with a 1 µm scale bar and a light where the amylase gene is; one unbroken zoom then
   goes thread → fibre → DNA round histones → double helix (z from -1 to 2). Nothing is cut: close in, the piece of the
   thread at the gene shows what it is made of (the fibre drawn nucleosome by nucleosome comes in through it), and the
   thread runs on at both sides of that piece until the fibre loosens. The film has ten steps (it had nine).
   Everything is worked out from a few numbers (how far the view has zoomed, z; how loose the chromatin is, L; how
   untwisted the DNA is, u; how far the enzyme has gone, p), so any moment can be drawn, and nothing ever jumps.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { courseLines } from './ribofilm.js?v=202611141922';   /* how a course's lines are drawn, the same in both films */

const R = window.REV, { $ } = R;
const N = 14, RISE = 0.6, YT = 1.0, YB = -1.0, LIFT = 1.35, YR = 1.0, YC = 3.05;   /* pairs; spacing; strands; copy */
const LB = 0.82;                         /* a base's length from its sugar: a gap between the two bases of a pair, for the hydrogen bonds */
const tipOf = L => L / 2 + 0.62 * (L - 0.24);   /* how far from its sugar a base ends (its rounded end included) */
const BONDS = { A: 2, T: 2, U: 2, C: 3, G: 3 };   /* hydrogen bonds in a pair: two between A and T (or U), three between C and G */
const COL = { A: 0xff6b6b, T: 0x4fa3ff, C: 0xffc94a, G: 0x4fd18b, U: 0xc38bff };
const PAIR_DNA = { A: 'T', T: 'A', C: 'G', G: 'C' }, PAIR_RNA = { A: 'U', T: 'A', C: 'G', G: 'C' };
/* the coding strand's bases (an example); the template strand is its partner, and the copy reads like the coding strand */
const SEQ = 'ATGCCTAGGACTTG'.split('');
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const X = i => (i - (N - 1) / 2) * RISE;
/* the chromatin, in nanometres like the ladder: nucleosomes (histones with DNA wound round them) */
const NK = 30, MID = 15;                 /* nucleosomes; the linker between MID - 1 and MID is where the helix is */
const WRAP = 1.65, RW = 4.2, PITCH = 1.2;  /* turns of DNA round each; its radius; half the distance between its turns */
const HIGHLIGHT = 6;                     /* the nucleotide named on the picture */

function letterMat(ch) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,255,255,0.94)'; g.beginPath(); g.arc(64, 64, 56, 0, 6.283); g.fill();
  g.lineWidth = 9; g.strokeStyle = '#' + COL[ch].toString(16).padStart(6, '0'); g.stroke();
  g.fillStyle = '#141a3a'; g.font = '900 74px Nunito, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true });
}
/* a clear shape with a bright edge: the enzyme (what happens inside it stays visible) */
function glassMat(color) {
  return new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Color(color) }, uA: { value: 1 } }, transparent: true, depthWrite: false,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uC; uniform float uA; varying vec3 vN; varying vec3 vV; void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4); gl_FragColor = vec4(uC * (0.55 + 0.9 * rim), (0.05 + 0.6 * rim) * uA); }'
  });
}

function film(wrap, thread) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  wrap.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.1, 600);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a3266, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(-3, 5, 7); scene.add(key);
  const back = new THREE.DirectionalLight(0x9fb8ff, 0.8); back.position.set(4, -2, -5); scene.add(back);
  const shiny = (color, k = 0.18) => new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: k, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.25, transparent: true });
  const all = new THREE.Group(); scene.add(all);                  /* everything; tilted while far away, level close up */

  /* ---------- the chromatin: nucleosomes, and the DNA wound round them and between them ---------- */
  const chrom = new THREE.Group(); all.add(chrom);
  const histMat = shiny(0x6fd0e8, 0.22), dnaMat = shiny(0xb9c4ff, 0.2);
  const ball = new THREE.SphereGeometry(1.55, 18, 14);
  const hist = new THREE.InstancedMesh(ball, histMat, NK * 8); chrom.add(hist);
  const dna = new THREE.Mesh(new THREE.BufferGeometry(), dnaMat); chrom.add(dna);
  /* the eight histones of a nucleosome: two layers of four, a squat ball of protein */
  const OCT = []; for (let l = 0; l < 2; l++) for (let j = 0; j < 4; j++) { const a = j * Math.PI / 2 + l * Math.PI / 4; OCT.push(new THREE.Vector3(1.75 * Math.cos(a), 1.75 * Math.sin(a), l ? 0.85 : -0.85)); }
  /* where each nucleosome is, packed in the fibre (L = 0) and loose, beads on a string (L = 1): a centre and a turn */
  const Z = new THREE.Vector3(0, 0, 1), rnd = (k, m) => Math.sin(k * 12.9898 + m * 78.233) * 0.5;
  const packed = [], loose = [];
  for (let k = 0; k < NK; k++) {
    /* packed: six to a turn round the fibre, each lying flat on its surface like a tile (its face outwards), each turn a
       nucleosome's width further along: a neat fibre about 30 nm wide */
    const th = k * Math.PI / 3, ax = new THREE.Vector3(0, Math.cos(th), Math.sin(th));
    packed.push({ c: new THREE.Vector3((k - MID + 0.5) * 1.85, 10.5 * Math.cos(th), 10.5 * Math.sin(th)), q: new THREE.Quaternion().setFromUnitVectors(Z, ax) });
    /* beads on a string, 21 nm apart; the two either side of the helix sit so that the DNA between them is straight,
       along the ladder's own line (y = 0, z = 0) */
    const x = (k - MID + 0.5) * 21;
    let c, q;
    if (k === MID - 1 || k === MID) { c = new THREE.Vector3(x, RW, k === MID - 1 ? -PITCH : PITCH); q = new THREE.Quaternion(); }
    else { c = new THREE.Vector3(x, RW + 4 * rnd(k, 1), 3 * rnd(k, 2)); q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5 * rnd(k, 3), 0.9 * rnd(k, 4), 0.6 * rnd(k, 5))); }
    loose.push({ c, q });
  }
  const tmpQ = new THREE.Quaternion(), tmpM = new THREE.Matrix4(), one = new THREE.Vector3(1, 1, 1);
  let lastL = -1;
  /* the DNA's way: round each nucleosome (WRAP turns, its ends at the bottom of the disc, so the DNA between the two
     middle ones runs straight along the ladder), then on to the next */
  function chromatin(L) {
    if (Math.abs(L - lastL) < 1e-4) return;
    lastL = L;
    const e = L * L * (3 - 2 * L), pts = [];
    for (let k = 0; k < NK; k++) {
      const c = packed[k].c.clone().lerp(loose[k].c, e); tmpQ.copy(packed[k].q).slerp(loose[k].q, e);
      for (let j = 0; j < 8; j++) { tmpM.compose(OCT[j].clone().applyQuaternion(tmpQ).add(c), tmpQ, one); hist.setMatrixAt(k * 8 + j, tmpM); }
      /* the middle pair turn so that one leaves, and the next enters, at its bottom */
      const a0 = k === MID ? -Math.PI / 2 : k === MID - 1 ? -Math.PI / 2 - WRAP * 2 * Math.PI : -Math.PI / 2 + k * 1.3;
      for (let s = 0; s <= 40; s++) {
        const f = s / 40, a = a0 + f * WRAP * 2 * Math.PI;
        pts.push(new THREE.Vector3(RW * Math.cos(a), RW * Math.sin(a), -PITCH + 2 * PITCH * f).applyQuaternion(tmpQ).add(c));
      }
    }
    hist.instanceMatrix.needsUpdate = true;
    dna.geometry.dispose(); dna.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 2, 1.0, 8, false);
  }

  /* ---------- the whole thread, from far away (12 Nov 2026) ----------
     thread: its points in nm, the gene's place at 0, 0, 0 with the thread running along x there. Three tubes 30 nm
     wide: the part before the piece that is drawn nucleosome by nucleosome, the part after it, and the piece itself
     (HALF nm either side of the gene), which goes little by little as the camera comes close, so that the nucleosomes
     show through it; the two sides stay until the fibre loosens. A light marks the gene from far away */
  const HALF = 29, FR = 15;
  const far = new THREE.Group(); all.add(far);
  const sideMat = shiny(0xffcf6b, 0.28), midMat = shiny(0xffcf6b, 0.28);
  const TH = thread.map(p => new THREE.Vector3(p[0], p[1], p[2])), mid0 = TH.findIndex(p => Math.abs(p.x + HALF) < 0.01 && Math.hypot(p.y, p.z) < 1e-6);   /* (the thread's own point at the piece's left end: worldThread, below) */
  const left = TH.slice(0, mid0 + 1), right = TH.slice(mid0 + 1);
  const tubeOf = (pts, m) => { const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), Math.max(8, pts.length * 3), FR, 10, false); const o = new THREE.Mesh(g, m); far.add(o); return o; };
  tubeOf(left, sideMat); tubeOf(right, sideMat);
  const midTube = new THREE.Mesh(new THREE.CylinderGeometry(FR, FR, 2 * HALF, 16, 1, true), midMat); midTube.rotation.z = Math.PI / 2; far.add(midTube);
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.3, 'rgba(255,240,170,0.5)'); gr.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const geneGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); geneGlow.scale.setScalar(260); geneGlow.renderOrder = 9; far.add(geneGlow);
  /* the far view's own middle and size (the thread's box, as the far view's tilt turns it) */
  const TILT = -0.32, FB = (() => { const c = Math.cos(TILT), sn = Math.sin(TILT); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, top = TH[0], low = TH[0]; TH.forEach(p => { const x = p.x * c - p.y * sn, y = p.x * sn + p.y * c; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); if (y > top.x * sn + top.y * c) top = p; if (y < low.x * sn + low.y * c) low = p; }); return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, hx: (x1 - x0) / 2, hy: (y1 - y0) / 2, top, low }; })();

  /* ---------- the ladder (the DNA between the two middle nucleosomes, drawn base by base) ---------- */
  const root = new THREE.Group(); all.add(root);
  const sugarGeo = new THREE.SphereGeometry(0.15, 20, 14), phosGeo = new THREE.SphereGeometry(0.085, 14, 10), baseGeo = new THREE.CapsuleGeometry(0.12, 1, 6, 14);
  const bead = { a: shiny(0xe9e5ff, 0.12), b: shiny(0xb7b0ee, 0.12), r: shiny(0xffa64d, 0.25) }, phosMat = shiny(0xffd27a, 0.3);
  const glowMat = shiny(0xfff3b0, 0.9);
  const baseMat = {}; Object.keys(COL).forEach(k => { baseMat[k] = shiny(COL[k], 0.22); });
  const letters = {}, lettersR = {}; Object.keys(COL).forEach(k => { letters[k] = letterMat(k); lettersR[k] = letterMat(k); });
  const part = (base, bm, withP, rna) => {
    const g = new THREE.Group(), b = new THREE.Mesh(sugarGeo, bm), r = new THREE.Mesh(baseGeo, baseMat[base]), s = new THREE.Sprite((rna ? lettersR : letters)[base]);
    const ph = withP ? new THREE.Mesh(phosGeo, phosMat) : null;
    s.scale.setScalar(0.36); s.renderOrder = 8; g.add(b, r, s); if (ph) g.add(ph); root.add(g);
    return { g, b, r, s, ph };
  };
  const P = [];
  for (let i = 0; i < N; i++) { const a = SEQ[i], t = PAIR_DNA[a]; P.push({ a: part(a, bead.a, true), b: part(t, bead.b, true), u: part(PAIR_RNA[t], bead.r, false, true) }); }
  const tubeMat = { a: shiny(0xe9e5ff, 0.1), b: shiny(0xb7b0ee, 0.1), r: shiny(0xffa64d, 0.25) };
  const tubes = { a: new THREE.Mesh(new THREE.BufferGeometry(), tubeMat.a), b: new THREE.Mesh(new THREE.BufferGeometry(), tubeMat.b), r: new THREE.Mesh(new THREE.BufferGeometry(), tubeMat.r) };
  Object.values(tubes).forEach(t => root.add(t));
  const tube = (mesh, pts) => { mesh.geometry.dispose(); mesh.geometry = pts.length > 1 ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 8, 0.065, 10, false) : new THREE.BufferGeometry(); };
  const enz = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), glassMat(0x6fe3c8)); enz.scale.set(1.75, 2.15, 1.25); enz.renderOrder = 6; root.add(enz);
  const ladderMats = [bead.a, bead.b, bead.r, phosMat, glowMat, tubeMat.a, tubeMat.b, tubeMat.r, ...Object.values(baseMat)];   /* (and the hydrogen bonds', below) */
  const up = new THREE.Vector3(0, 1, 0);
  /* a base from its sugar towards `to`; its letter on its outer half, a little in front, so no two letters meet */
  const place = (o, from, to, len) => {
    o.b.position.copy(from);
    const dir = to.clone().sub(from), L = len != null ? len : dir.length(); dir.normalize();
    o.r.position.copy(from).addScaledVector(dir, L / 2); o.r.scale.set(1, Math.max(0.01, L - 0.24), 1); o.r.quaternion.setFromUnitVectors(up, dir);
    o.s.position.copy(from).addScaledVector(dir, Math.min(0.52, L * 0.55)); o.s.position.z += 0.2;
  };
  /* the hydrogen bonds: for each pair (and each building block of RNA, from N on) up to three bonds, each a dashed line
     of three dashes from one base's end to the other's; v (0 … 1) grows or shrinks them, so a bond forms or breaks */
  const DASH = 3, dashGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 6), hbMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
  const hbs = new THREE.InstancedMesh(dashGeo, hbMat, 2 * N * 3 * DASH); hbs.frustumCulled = false; root.add(hbs);
  const hbM = new THREE.Matrix4(), hbQ = new THREE.Quaternion(), hbS = new THREE.Vector3(), hbP = new THREE.Vector3(), hbD = new THREE.Vector3(), hbX = new THREE.Vector3(1, 0, 0);
  function bonds(slot, n, from, to, v = 0) {
    if (n && v > 0.01) { hbD.copy(to).sub(from); }
    const len = n && v > 0.01 ? hbD.length() : 0;
    if (len) hbQ.setFromUnitVectors(up, hbD.clone().normalize());
    for (let j = 0; j < 3; j++) {
      const off = n === 2 ? (j === 2 ? null : (j - 0.5) * 0.11) : (j - 1) * 0.075;
      for (let d = 0; d < DASH; d++) {
        const k = (slot * 3 + j) * DASH + d;
        if (!len || off == null) { hbM.makeScale(0, 0, 0); hbs.setMatrixAt(k, hbM); continue; }
        hbP.copy(from).addScaledVector(hbD, (d + 0.5) / DASH).addScaledVector(hbX, off);
        hbS.set(v, len / DASH * 0.55 * v, v); hbM.compose(hbP, hbQ, hbS); hbs.setMatrixAt(k, hbM);
      }
    }
    hbs.instanceMatrix.needsUpdate = true;
  }
  function ladder(u, p, spin, hl, hb) {
    const A = [], B = [], C = [], c = p - 0.5;
    Object.values(letters).forEach(m => { m.opacity = smooth(0.6, 0.95, u) * fade; });
    for (let i = 0; i < N; i++) {
      const q = P[i], x = X(i);
      const phi = (1 - u) * ((i - (N - 1) / 2) * 0.62 + spin), o = smooth(2.7, 1.3, Math.abs(i - c));
      const top = new THREE.Vector3(x, YT * Math.cos(phi) + LIFT * o, YT * Math.sin(phi)), bot = new THREE.Vector3(x, YB * Math.cos(phi), YB * Math.sin(phi));
      const mid = new THREE.Vector3(x, 0, (top.z + bot.z) / 2);
      place(q.a, top, mid, LB); place(q.b, bot, mid, LB);
      /* each sugar's phosphate, half-way to the next sugar: the sugar-phosphate backbone */
      const nx = X(i + 1), phiN = (1 - u) * ((i + 1 - (N - 1) / 2) * 0.62 + spin), oN = smooth(2.7, 1.3, Math.abs(i + 1 - c));
      q.a.ph.visible = q.b.ph.visible = i < N - 1;
      q.a.ph.position.set((x + nx) / 2, (YT * Math.cos(phi) + LIFT * o + YT * Math.cos(phiN) + LIFT * oN) / 2, (YT * Math.sin(phi) + YT * Math.sin(phiN)) / 2);
      q.b.ph.position.set((x + nx) / 2, (YB * Math.cos(phi) + YB * Math.cos(phiN)) / 2, (YB * Math.sin(phi) + YB * Math.sin(phiN)) / 2);
      const lit = hl > 0.01 && i === HIGHLIGHT;
      q.a.b.material = lit ? glowMat : bead.a; q.a.ph.material = lit ? glowMat : phosMat; q.a.r.material = lit ? glowMat : baseMat[SEQ[i]];
      q.a.s.visible = q.b.s.visible = u > 0.6;
      A.push(top); B.push(bot);
      const arrive = smooth(-1.05, -0.05, p - i), lift = smooth(2.3, 4.1, p - i), shown = arrive > 0.001;
      q.u.g.visible = shown;
      if (shown) {
        const dock = new THREE.Vector3(x, YR, 0);
        const k = Math.max(0, p - i - 3.2), xe = X(Math.max(-1, Math.min(N, c - 2.6)));
        const done = smooth(N + 1.2, N + 4, p);
        const inCopy = new THREE.Vector3(xe - k * RISE, YC + 0.25 * (1 - Math.exp(-k / 2.5)) + 0.4 * done, 0);
        const from = new THREE.Vector3(x + 1.0, 3.9, 1.2), e = arrive * arrive * (3 - 2 * arrive);
        const flight = from.clone().lerp(dock, e).add(new THREE.Vector3(0, Math.sin(e * Math.PI) * 0.35, 0));
        const rise = dock.clone().lerp(inCopy, lift).add(new THREE.Vector3(0, 0, Math.sin(lift * Math.PI) * 0.75));
        const pos = lift > 0 ? rise : flight;
        place(q.u, pos, pos.clone().add(new THREE.Vector3(0, -1, 0)), LB - 0.1 * lift);
        if (arrive > 0.97) C.push(pos.clone());
        /* docked, it is held to its base of the lower strand by hydrogen bonds, which break as the copy lifts away */
        const rTip = pos.clone().add(new THREE.Vector3(0, -tipOf(LB - 0.1 * lift), 0)), bTip = bot.clone().addScaledVector(mid.clone().sub(bot).normalize(), tipOf(LB));
        bonds(N + i, BONDS[PAIR_DNA[SEQ[i]]], bTip, rTip, smooth(0.9, 1, arrive) * (1 - smooth(0, 0.3, lift)) * hb);
      } else bonds(N + i, 0);
      /* the pair's own hydrogen bonds, where the two strands are together */
      bonds(i, BONDS[SEQ[i]], bot.clone().addScaledVector(mid.clone().sub(bot).normalize(), tipOf(LB)), top.clone().addScaledVector(mid.clone().sub(top).normalize(), tipOf(LB)), hb * (1 - smooth(0.02, 0.12, o)));   /* only once the strands are (almost) together */
    }
    tube(tubes.a, A); tube(tubes.b, B); tube(tubes.r, C);
    enz.visible = p > -4 && p < N + 4;
    enz.material.uniforms.uA.value = smooth(-4, -2.2, p) * (1 - smooth(N + 1.6, N + 3.6, p));
    enz.position.set(X(Math.max(-2.2, Math.min(N + 1.2, c))), 0.75, 0);
  }

  /* ---------- names and scale bars on the picture (HTML over the view, at the parts they name) ---------- */
  const tag = (cls, html) => { const el = document.createElement('div'); el.className = cls; el.innerHTML = html; el.style.opacity = 0; wrap.appendChild(el); return el; };
  const marks = [
    { el: tag('cf__bar', '<i></i><b>30 nm</b>'), nm: 30, show: z => smooth(-0.5, -0.15, z) * (1 - smooth(0.25, 0.6, z)) },   /* (not from far away, where it would be a dot: the 1 µm bar stands there) */
    { el: tag('cf__bar', '<i></i><b>11 nm</b>'), nm: 11, show: z => smooth(0.7, 0.95, z) * (1 - smooth(1.2, 1.5, z)) },
    { el: tag('cf__bar cf__bar--v', '<i></i><b>2 nm</b>'), nm: 2, show: (z, u) => smooth(1.75, 1.95, z) * (1 - smooth(0.05, 0.4, u)) },
    { el: tag('cf__lab', 'histones (proteins)'), show: z => smooth(0.75, 0.95, z) * (1 - smooth(1.2, 1.5, z)) },
    { el: tag('cf__lab cf__lab--below', 'DNA'), show: z => smooth(0.75, 0.95, z) * (1 - smooth(1.2, 1.5, z)) },
    { el: tag('cf__lab', 'one nucleotide'), show: (z, u, p, hl) => hl },
    { el: tag('cf__lab cf__lab--line', '<span>hydrogen bonds</span><i></i>'), line: true, show: (z, u, p, hl, hb) => hb * (1 - smooth(-4.5, -3, p)) },
    { el: tag('cf__lab', 'RNA polymerase'), show: (z, u, p) => smooth(-1.5, -0.3, p) * (1 - smooth(2.0, 3.0, p)) },
    { el: tag('cf__lab', 'the copy: mRNA'), show: (z, u, p) => smooth(7, 8.5, p) },
    { el: tag('cf__bar', '<i></i><b>1 µm</b>'), nm: 1000, show: z => 1 - smooth(-0.85, -0.55, z) },
    { el: tag('cf__lab', 'chromosome 1: one long thread'), show: z => 1 - smooth(-0.85, -0.55, z) },
    { el: tag('cf__lab cf__lab--below', ''), show: () => 0 }   /* (the gene is shown by its light and the step's words: a name there lay over the thread) */
  ];
  const v = new THREE.Vector3(), proj = (pt) => { v.copy(pt).applyMatrix4(all.matrixWorld).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z < 1]; };
  const pxPerNm = (pt) => { const a = proj(pt), b = proj(pt.clone().add(new THREE.Vector3(1, 0, 0))); return Math.hypot(b[0] - a[0], b[1] - a[1]); };
  function overlay(z, u, p, hl, hb) {
    all.updateMatrixWorld(); cam.updateMatrixWorld();
    const kM = loose[MID].c, fibreLow = new THREE.Vector3(0, -19, 0);
    const at = [
      () => { const a = proj(fibreLow), s = 30 * pxPerNm(fibreLow); return [a[0] - s / 2, a[1], s]; },
      () => { const b = kM.clone().add(new THREE.Vector3(0, -6.8, 0)), a = proj(b), s = 11 * pxPerNm(b); return [a[0] - s / 2, a[1], s]; },
      () => { const a = proj(new THREE.Vector3(X(0) - 0.65, -1, 0)), b = proj(new THREE.Vector3(X(0) - 0.65, 1, 0)); return [a[0], b[1], a[1] - b[1]]; },
      () => { const a = proj(kM.clone().add(new THREE.Vector3(0, 0, 3))); return [a[0], a[1]]; },
      () => { const a = proj(new THREE.Vector3(0, -1.1, 0.9)); return [a[0], a[1] + 6]; },
      () => { const a = proj(new THREE.Vector3(X(HIGHLIGHT), YT + 0.32, 0.2)); return [a[0], a[1]]; },
      () => { const a = proj(new THREE.Vector3(X(0) - 0.09, 0, 0)); return [a[0], a[1]]; },
      () => { const a = proj(enz.position.clone().add(new THREE.Vector3(0, 2.45, 0))); return [a[0], a[1]]; },
      () => { const a = proj(new THREE.Vector3(X(2), YC + 0.95, 0)); return [a[0], a[1]]; },
      () => { const b = FB.low.clone().add(new THREE.Vector3(0, -140, 0)), a = proj(b), sx = 1000 * pxPerNm(b); return [a[0] - sx / 2, a[1], sx]; },
      () => { const a = proj(FB.top.clone().add(new THREE.Vector3(0, 70, 0))); return [a[0], a[1]]; },
      () => { const a = proj(new THREE.Vector3(0, -70, 0)); return [a[0], a[1] + 6]; }
    ];
    marks.forEach((m, i) => {
      const o = m.show(z, u, p, hl, hb);
      m.el.style.opacity = o.toFixed(3); m.el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      if (o <= 0.01) return;
      const r = at[i]();
      if (m.nm) {
        if (m.el.classList.contains('cf__bar--v')) { m.el.style.transform = `translate(${r[0].toFixed(1)}px, ${r[1].toFixed(1)}px) translate(-100%, 0)`; m.el.firstChild.style.height = r[2].toFixed(1) + 'px'; }   /* its bracket ends at the helix's left, its words beyond */
        else { m.el.style.transform = `translate(${r[0].toFixed(1)}px, ${r[1].toFixed(1)}px)`; m.el.firstChild.style.width = r[2].toFixed(1) + 'px'; }
      } else if (m.line) {
        /* a name on the left, its level line ending on the part */
        m.el.style.transform = `translate(${r[0].toFixed(1)}px, ${r[1].toFixed(1)}px) translate(-100%, -50%)`;
      } else {
        /* a name stays inside the view, however near the edge its part is */
        const hw = (m.w = m.w || m.el.offsetWidth) / 2, x = Math.max(hw + 6, Math.min(W - hw - 6, r[0]));
        m.el.style.transform = `translate(${x.toFixed(1)}px, ${r[1].toFixed(1)}px) translate(-50%, ${m.el.classList.contains('cf__lab--below') ? '0' : '-100%'})`;
      }
    });
  }

  let alive = true, W = 1, H = 1, fade = 1;
  const size = () => {
    W = wrap.clientWidth; H = Math.max(200, wrap.clientHeight || Math.min(360, W * 0.62));
    renderer.setSize(W, H); cam.aspect = W / H; cam.updateProjectionMatrix();
    /* the whole ladder and the copy above it in view; in a narrow window (a phone) the view comes closer and follows the
       enzyme along the DNA, so that every letter can still be read */
    const tv = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), narrow = W < 520;
    cam.userData.narrow = narrow; cam.userData.tv = tv; cam.userData.distW = (narrow ? 2.7 : 5.0) / (tv * cam.aspect); cam.userData.dist = Math.max(cam.userData.distW, 3.1 / tv);
    /* far away: the fibre fills the width (z = 0); then a few beads (z = 1) */
    cam.userData.d0 = Math.max(44 / (tv * cam.aspect), 20 / tv); cam.userData.d1 = Math.max(30 / (tv * cam.aspect), 14 / tv);
    /* furthest (z = -1): the whole thread in view, with room for its name above it and the scale bar below it */
    cam.userData.dF = Math.max(FB.hx * 1.12 / (tv * cam.aspect), (FB.hy + 330) / tv);
  };
  size(); addEventListener('resize', size);
  const S = { z: -1, L: 0, u: 0, p: -6, hl: 0, hb: 0, from: null, to: null, t0: 0, ms: 0, done: null, lin: false, cx: null };
  const t0 = performance.now();
  /* the helix's slow turn, added up frame by frame, slower as it untwists, and kept within half a turn while it is a helix
     (where a whole turn cannot be seen): untwisting then undoes at most half a turn (9 Nov 2026, Daniel: the untwisting
     "a bit too hectic"; it had undone every turn since the helix appeared, several turns in under two seconds) */
  let spin = 0, lastT = 0;
  const loop = () => {
    if (!alive) return;
    const now = performance.now(), k = S.ms ? Math.min(1, (now - S.t0) / S.ms) : 1, e = k * k * (3 - 2 * k);
    if (S.from) ['z', 'L', 'u', 'p', 'hl', 'hb'].forEach(n => { S[n] = S.from[n] + (S.to[n] - S.from[n]) * (n === 'p' && S.lin ? k : e); });
    const t = R.FAST ? 0 : (now - t0) / 1000;
    spin += Math.max(0, t - lastT) * 0.35 * (1 - S.u); lastT = t;
    if (S.u < 0.001) spin = ((spin + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    /* the chromatin fades as the view reaches the DNA between two beads, where the ladder (the same DNA, drawn base by
       base) takes its place; the tilt of the far view goes as it comes close */
    chromatin(S.L);
    const near = smooth(1.45, 1.9, S.z);
    /* from far away the thread is one tube; the piece at the gene goes as the camera comes close (z -0.45 to -0.08), and
       the fibre drawn nucleosome by nucleosome comes in through it (z -0.6 to -0.2); the two sides of the thread stay
       until the fibre loosens (L 0 to 0.3); the gene's light goes as its piece fills the picture */
    const fin = smooth(-0.6, -0.2, S.z), side = 1 - smooth(0, 0.3, S.L), midO = 1 - smooth(-0.45, -0.08, S.z);
    chrom.visible = near < 0.999 && fin > 0.001; histMat.opacity = dnaMat.opacity = (1 - near) * fin; histMat.depthWrite = dnaMat.depthWrite = near < 0.5 && fin > 0.5;
    far.visible = side > 0.001; sideMat.opacity = side; sideMat.depthWrite = side > 0.5; midTube.visible = midO > 0.001; midMat.opacity = midO * side; midMat.depthWrite = midO > 0.95;
    geneGlow.material.opacity = (1 - smooth(-0.75, -0.4, S.z)) * (R.FAST ? 1 : 0.75 + 0.25 * Math.sin(t * 3));
    fade = near; root.visible = near > 0.001; ladderMats.forEach(m => { m.opacity = near; m.depthWrite = near > 0.5; }); hbMat.opacity = near;
    ladder(S.u, S.p, spin, S.hl, S.hb);
    all.rotation.z = -0.32 * (1 - smooth(0.9, 1.9, S.z));
    /* on a phone, as the copy grows above the DNA, the view rises and steps back a little, so that the copy's name fits */
    const tall = cam.userData.narrow ? smooth(6, 9, S.p) : 0;
    const d0 = cam.userData.d0, d1 = cam.userData.d1, d2 = Math.max(cam.userData.distW, (3.1 + 0.45 * tall) / cam.userData.tv);
    const dist = S.z < 0 ? d0 * Math.pow(cam.userData.dF / d0, -S.z) : S.z <= 1 ? d0 * Math.pow(d1 / d0, S.z) : d1 * Math.pow(d2 / d1, S.z - 1);
    /* from far away the view's middle is the middle of the whole thread; it moves to the gene as the camera comes in */
    const fk = smooth(-0.25, -1, S.z), fx = FB.cx * fk, fy = FB.cy * fk;
    const sway = R.FAST ? 0 : Math.sin(t * 0.35) * 0.12 * S.u;
    /* while the helix turns, the view moves a little to the right of it, so the 2 nm bar has room on its left */
    /* (on a phone, to the helix's left end, where its 2 nm bar is) */
    /* (and while the hydrogen bonds are named, to the DNA's left end, where the name is) */
    const want = (cam.userData.narrow && S.p > -3 ? Math.max(X(2), Math.min(X(N - 3), X(S.p - 1.5))) : 0) - (cam.userData.narrow ? 3.2 : 1.1) * (1 - S.u) * smooth(1.6, 2, S.z)
      - (cam.userData.narrow ? 3.9 : 1.6) * S.hb * (1 - smooth(-4.5, -3, S.p));
    S.cx = S.cx == null || R.FAST ? want : S.cx + (want - S.cx) * 0.06;
    const lookY = S.z <= 1 ? 0 : 1.05 * smooth(1, 2, S.z) + 0.4 * tall;
    cam.position.set(S.cx + fx + Math.sin(sway) * dist, lookY + fy + (0.15 + 0.4 * (1 - S.u)) * Math.min(1, dist / 12), Math.cos(sway) * dist); cam.lookAt(S.cx + fx, lookY + fy, 0);
    cam.far = Math.max(600, dist * 3); cam.updateProjectionMatrix();
    renderer.render(scene, cam);
    overlay(S.z, S.u, S.p, S.hl, S.hb);
    if (k >= 1 && S.done) { const d = S.done; S.done = null; d(); }
    requestAnimationFrame(loop);
  };
  loop();
  return {
    /* to a moment: zoom z, loosened L, untwisted u, enzyme at p, nucleotide named hl, hydrogen bonds hb; `lin` keeps an even pace (the
       building blocks arrive one by one) */
    go(to) {
      return new Promise(res => {
        S.from = { z: S.z, L: S.L, u: S.u, p: S.p, hl: S.hl, hb: S.hb }; S.to = Object.assign({}, S.from, to);
        S.lin = !!to.lin; S.t0 = performance.now(); S.ms = R.FAST ? 0 : (to.ms || 1200); S.done = res;
      });
    },
    stop() { alive = false; removeEventListener('resize', size); renderer.dispose(); renderer.domElement.remove(); },
    /* where the film stands (read by tools/copyfilm-check.mjs): its numbers and the helix's turn */
    peek: () => ({ z: S.z, L: S.L, u: S.u, p: S.p, hl: S.hl, hb: S.hb, spin, far: far.visible ? sideMat.opacity : 0, piece: midTube.visible ? midMat.opacity : 0, fibre: chrom.visible ? histMat.opacity : 0, dist: cam.position.distanceTo(new THREE.Vector3(S.cx || 0, 0, 0)) })
  };
}

const STEPS = [
  { t: 'This is how a cell copies a gene.\nHere is <dfn data-w="chromosome">chromosome</dfn> 1 again: one very long thread of DNA and protein, now drawn at its true width. (The real thread is more than 100 times longer than this drawing.)\nThe amylase gene is a short section of it: a light shows where it is.' },
  { t: 'Closer and closer. Now the picture shows the thread about one million times bigger than it really is.\nThe yellow is the same thread. In the middle, a short piece of it is drawn open, so that you can see what it is made of: a fibre 30 nanometres (nm) wide, about 30 millionths of a millimetre.\nScientists saw this tidy fibre outside cells. Inside a living nucleus it is folded less regularly.', go: { z: 0, ms: 4200 } },
  { t: 'Closer. Here the fibre is drawn pulled open, so that you can see one bead at a time.\nThe DNA is wound round small balls of protein, the <dfn data-w="histone">histones</dfn>, like thread round beads. This keeps 2 metres of DNA tidy inside a nucleus.', go: { z: 1, L: 1, ms: 3800 } },
  { t: 'Closer again, between two beads: the DNA itself. It is two strands, twisted round each other: a double helix, only 2 nm wide.', go: { z: 2, ms: 3000 } },
  { t: 'Here it is drawn untwisted, so that you can see each part.\nDNA is a chain of building blocks, the <dfn data-w="nucleotide">nucleotides</dfn>. Each one is a sugar, a phosphate and a <dfn data-w="dna-base">base</dfn>. There are four bases: A, T, C and G (adenine, thymine, cytosine and guanine).', go: [{ u: 1, ms: 4500 }, { hl: 1, ms: 900 }] },
  { t: 'The bases of the two strands form pairs: A with T, and C with G.\n<dfn data-w="hydrogen-bond">Hydrogen bonds</dfn> join the two bases of each pair: two between A and T, three between C and G. A hydrogen bond is weak, so the two strands can be separated.', go: { hb: 1, hl: 0, ms: 1600 }, key: 1 },
  { t: 'Where a gene is copied, its DNA is unwound from the histones. An <dfn data-w="enzyme">enzyme</dfn>, RNA polymerase, joins the gene and separates the two strands there, like opening a zip: the hydrogen bonds between the bases break.', go: { p: 0, ms: 1900 }, key: 1 },
  { t: 'Building blocks of <dfn data-w="rna">RNA</dfn> arrive, one at a time. Each one fits against a base of <b>one</b> strand only, held by hydrogen bonds: U against A, A against T, G against C, and C against G.\n(RNA has U where DNA has T.)', go: { p: 5, ms: 5 * 1150, lin: true }, key: 2 },
  { t: 'The building blocks join in a chain: the copy of the gene, <dfn data-w="mrna">mRNA</dfn>. It leaves the enzyme as it grows.\nBehind the enzyme, the two strands of DNA join again.', go: { p: N, ms: (N - 5) * 520, lin: true }, key: 2 },
  { t: 'At the end of the gene, the enzyme leaves the DNA, and the copy is finished: it reads like the top strand, with U where the strand has T.\nThe DNA stays in the nucleus. The copy leaves through a nuclear pore.\nMaking a copy of a gene like this has a name: <dfn data-w="transcription">transcription</dfn>.', go: { p: N + 5, ms: 2600 }, key: 2 }
];
const paras = t => t.split('\n').map(x => `<p>${x}</p>`).join('');
/* what each course asks about what each step shows (12 Nov 2026; Daniel: "you can add a toggle for IGCSE and a toggle for
   IB, and it can be the same one but with more information for the IB"): shown under the step's words while that
   course's switch is on (quest.js courseSwitch, store 'courseLv'); the film's own words never change. One entry per
   step, in the steps' order; each line [level, statement, words] as in story.js `course` (IGCSE: Cambridge 0610 for
   2026 to 2028, 'c' Core, 's' Supplement, 'n' not named; IB: the guide of 2025, 'sl' under "SL and HL", 'hl' under
   "Additional higher level", 'x' beyond it). tools/course-check.mjs reads every statement number in its source. */
const LINES = [
  { igcse: [['c', '17.1.1', 'Chromosomes are made of DNA, which contains genetic information in the form of genes.']],
    ib: [['sl', 'A1.2.1', 'DNA is the genetic material of all living organisms.']] },
  { igcse: [['n', '', 'The IGCSE syllabus does not name this fibre.']],
    ib: [['x', '', 'The guide does not name the 30 nm fibre.']] },
  { igcse: [['n', '', 'The IGCSE syllabus does not name histones.']],
    ib: [['sl', 'A2.2.6', 'Chromosomes are made of DNA bound to histones.'],
      ['hl', 'A1.2.13', 'The structure of a nucleosome: a DNA molecule wrapped around a core of eight histone proteins, held together by an additional histone protein attached to linker DNA.']] },
  { igcse: [['s', '4.1.4', 'A DNA molecule is two strands coiled together to form a double helix.']],
    ib: [['sl', 'A1.2.6', 'DNA is a double helix made of two antiparallel strands of nucleotides.']] },
  { igcse: [['s', '4.1.4', 'Each strand contains chemicals called bases.'], ['n', '', 'The syllabus says: "knowledge of the details of nucleotide structure is not required" (17.1.5).']],
    ib: [['sl', 'A1.2.2', 'The components of a nucleotide: a phosphate, a pentose sugar and a base. In diagrams you draw them as a circle, a pentagon and a rectangle.'],
      ['sl', 'A1.2.3', 'Sugar–phosphate bonding makes a continuous chain of covalently bonded atoms in each strand: a strong "backbone".'],
      ['sl', 'A1.2.4', 'You know the names of the bases: adenine, thymine, cytosine and guanine in DNA.']] },
  { igcse: [['s', '4.1.4', 'Bonds between pairs of bases hold the strands together. The bases always pair up in the same way: A with T, and C with G.']],
    ib: [['sl', 'A1.2.6', 'The two strands are linked by hydrogen bonding between complementary base pairs: adenine (A) with thymine (T), and guanine (G) with cytosine (C). The guide says: "not required to memorize … the numbers of hydrogen bonds".'],
      ['hl', 'A1.2.12', 'The A–T and C–G pairs have equal length, so the DNA helix has the same three-dimensional structure whatever its base sequence.']] },
  { igcse: [['s', '17.1.8', 'The gene coding for the protein remains in the nucleus.'], ['n', '', 'The syllabus says: "knowledge of the details of transcription or translation is not required". It does not name RNA polymerase.']],
    ib: [['sl', 'D1.2.1', 'Transcription is the synthesis of RNA using a DNA template. You understand the roles of RNA polymerase: here it separates the two strands.'],
      ['hl', 'D1.2.13', 'Transcription is initiated at the promoter, a base sequence just before the start of the gene. Transcription factors bind to it; then RNA polymerase can bind.']] },
  { igcse: [['s', '17.1.8', 'Messenger RNA (mRNA) is a copy of a gene.']],
    ib: [['sl', 'D1.2.2', 'Hydrogen bonding and complementary base pairing in transcription: adenine (A) on the DNA template strand pairs with uracil (U) on the RNA strand.'],
      ['sl', 'D1.2.3', 'The single DNA strand is only a template: its base sequence does not change.'],
      ['sl', 'A1.2.7', 'RNA differs from DNA: one strand, not two; uracil where DNA has thymine; the sugar ribose, not deoxyribose.']] },
  { igcse: [['s', '17.1.8', 'mRNA molecules are made in the nucleus.']],
    ib: [['sl', 'A1.2.5', 'RNA is a polymer formed by condensation of nucleotide monomers: RNA polymerase joins them.'],
      ['hl', 'D1.2.12', 'Transcription is 5′ to 3′: each RNA nucleotide is added to the 3′ end of the growing strand.']] },
  { igcse: [['s', '17.1.8', 'mRNA molecules are made in the nucleus and move to the cytoplasm.']],
    ib: [['sl', 'D1.2.4', 'Transcription is the first stage of gene expression: a key stage at which the expression of a gene can be switched on and off.'],
      ['hl', 'D1.2.15', 'Before the mRNA leaves the nucleus: introns are removed, exons are spliced together, and a 5′ cap and a 3′ polyA tail are added.']] }
];

/* chromosome 1's thread as the game's nucleus draws it (cellbuild.js W.chromosomes[0].curve, µm), for the film's first
   picture: in nm, the middle of the amylase gene (half-way along it: play.js gene) at 0, 0, 0, the thread running along
   x there; the piece HALF = 29 nm either side of the gene is left out and two points mark its ends, since that piece is
   drawn by itself. If the world is not there (the film opened by itself), a thread of the same kind is made */
function worldThread() {
  const V = THREE.Vector3; let pts = null;
  try {
    const ch = window.CELLGAME && window.CELLGAME.world && window.CELLGAME.world.W.chromosomes[0];
    if (ch) pts = t => ch.curve.getPointAt(Math.max(0, Math.min(1, t))).clone().multiplyScalar(1000);
  } catch (e) {}
  if (!pts) { const P = []; let p = new V(0, 0, 0), v = new V(1, 0, 0), k = 7; const rnd = () => { k = (k * 16807) % 2147483647; return k / 2147483647 * 2 - 1; };
    for (let i = 0; i < 151; i++) { v.add(new V(rnd() * 0.9, rnd() * 0.9, rnd() * 0.9)).normalize(); if (p.length() > 650) v.addScaledVector(p.clone().normalize(), -0.6).normalize(); p = p.clone().addScaledVector(v, 90); P.push(p); }
    const c = new THREE.CatmullRomCurve3(P); pts = t => c.getPointAt(Math.max(0, Math.min(1, t))).clone(); }
  const g = pts(0.5), X = pts(0.503).sub(pts(0.497)).normalize(), up = Math.abs(X.y) > 0.9 ? new V(0, 0, 1) : new V(0, 1, 0), Y = up.clone().addScaledVector(X, -up.dot(X)).normalize(), Z = new V().crossVectors(X, Y);
  /* (its depth is drawn at a third: at its own depth a loop of the thread passed close to the camera, across the picture) */
  const at = t => { const q = pts(t).sub(g); return [q.dot(X), q.dot(Y), q.dot(Z) * 0.33]; };
  const N = 330, out = [];
  /* (the thread comes into the piece's two ends along x: its last points before them are eased onto the line) */
  for (let i = 0; i <= N; i++) { const t = i / N * 0.493; out.push(at(t)); }
  const ease = (a, toX) => a.map((p, i) => { const k = i / (a.length - 1); return [p[0], p[1] * (1 - k * k), p[2] * (1 - k * k)]; });
  const L = ease(out.slice(-12)); out.splice(-12, 12, ...L); out.push([-29, 0, 0]);
  const r = []; for (let i = 0; i <= N; i++) { const t = 1 - i / N * 0.493; r.push(at(t)); }
  const Rr = ease(r.slice(-12)); r.splice(-12, 12, ...Rr); r.push([29, 0, 0]); r.reverse();
  return out.concat(r);
}

/* the film, in its own window over the world; resolves when it is closed (watched to the end, or not) */
export function openCopyFilm({ last = 'Back to the nucleus' } = {}) {
  return new Promise(done => {
    let box = $('#copyfilm');
    if (!box) { box = document.createElement('div'); box.className = 'lens'; box.id = 'copyfilm'; $('#stage').appendChild(box); }
    box.innerHTML = `<div class="lens__card cf" role="dialog" aria-modal="true" aria-labelledby="cf-h">
      <div class="lens__top"><h2 id="cf-h">🔬 How a cell copies a gene</h2><button type="button" class="close-x" aria-label="Close">×</button></div>
      <div class="cf__grid"><div class="lens__3d cf__3d"></div><div class="cf__side">
      <p class="cf__x">Explorer: beyond the Year 7 list</p>
      <p class="cf__n" aria-live="polite"></p><div class="cf__t" aria-live="polite"></div>
      <p class="cf__key" hidden></p>
      <div class="cf__do"><button type="button" class="btn next pulse">Next step →</button><button type="button" class="btn ghost back" disabled>← Back</button></div>
      <div class="cf__lvs"></div>
    </div></div></div>`;
    box.hidden = false;
    const F = film($('.cf__3d', box), worldThread()); box.peek = F.peek;
    const nEl = $('.cf__n', box), tEl = $('.cf__t', box), btn = $('.cf__do .btn.next', box), kEl = $('.cf__key', box), back = $('.cf__do .btn.back', box);
    /* the courses that are on (a pupil whose Year 7 checks of a place are right may switch them on: quest.js courseSwitch) */
    const LV = Object.assign({ igcse: false, ib: false }, R.store.get('courseLv', {})), lEl = $('.cf__lvs', box);
    /* which base fits which: shown from the step where the pairs are on the picture, and U from the step where RNA comes */
    const KEY = ['', '<span style="--c:#ff6b6b">A</span><span style="--c:#4fa3ff">T</span> fit each other, <span style="--c:#ffc94a">C</span><span style="--c:#4fd18b">G</span> fit each other.',
      '<span style="--c:#ff6b6b">A</span><span style="--c:#4fa3ff">T</span> fit each other, <span style="--c:#ffc94a">C</span><span style="--c:#4fd18b">G</span> fit each other; in RNA, <span style="--c:#c38bff">U</span> replaces T.'];
    let i = 0, busy = false;
    const close = () => { F.stop(); box.hidden = true; box.innerHTML = ''; document.removeEventListener('keydown', esc1); done(); };
    const esc1 = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc1);
    $('.close-x', box).addEventListener('click', close);
    /* where the film stands at the end of step k: every move of the steps up to it, in turn (a step's go is one move or a
       list of moves) */
    const moves = k => [].concat(STEPS[k].go || []);
    const stateAt = k => { const st = { z: -1, L: 0, u: 0, p: -6, hl: 0, hb: 0 }; for (let j = 0; j <= k; j++) moves(j).forEach(g => Object.keys(st).forEach(n => { if (g[n] != null) st[n] = g[n]; })); return st; };
    /* back (9 Nov 2026, Daniel: "you can only go forward and not backward"): the film plays in reverse to the end of the
       step before, as long as that step took (1.2 to 4.5 s): everything is worked out from a few numbers, so any moment can
       be drawn and nothing jumps. Both buttons wait while a step plays */
    const show = async (dir = 1) => {
      const s = STEPS[i]; busy = true; btn.disabled = true; back.disabled = true;
      nEl.textContent = `${i + 1} of ${STEPS.length}`; tEl.innerHTML = paras(s.t); if (R.terms) R.terms(tEl);
      lEl.innerHTML = courseLines(LINES[i] || {}, LV); if (R.terms) R.terms(lEl);
      kEl.hidden = !s.key; kEl.innerHTML = KEY[s.key || 0];
      if (dir > 0) { for (const g of moves(i)) await F.go(g); }
      else { const ms = moves(i + 1).reduce((a, g) => a + (g.ms || 1200), 0); await F.go(Object.assign(stateAt(i), { ms: Math.max(1200, Math.min(4500, ms)) })); }
      busy = false; btn.disabled = false; back.disabled = i === 0;
      btn.textContent = i === STEPS.length - 1 ? last + ' →' : 'Next step →'; btn.focus({ preventScroll: true });
    };
    btn.addEventListener('click', () => { if (busy) return; if (i === STEPS.length - 1) { close(); return; } i++; show(); });
    back.addEventListener('click', () => { if (busy || i === 0) return; i--; show(-1); });
    show();
  });
}
