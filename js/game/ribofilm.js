/* ============================================================
   ribofilm.js — the course film of the ribosomes: how a ribosome reads the copy of a gene (12 Nov 2026).
   Daniel, 12 Nov 2026, of the film "From DNA to protein - 3D" (yourgenome): "some content here, it's not covered in the
   current animation … You can, however, add it as an IB toggle and show the 3D animation as detailed as in the video
   … It doesn't need to be one whole animation. It can be … divided … depending on where it's happening … you can add a
   toggle for IGCSE and a toggle for IB, and it can be the same one but with more information for the IB".
   So the Year 7 step of the ribosomes stays as it is (a code of shapes, a carrier that fits), and this film is behind
   the place's course switches (quest.js courseSwitch), once its Year 7 checks are right: ONE film for IGCSE and IB, in
   steps that each wait for the reader (memory animations-wait-for-the-reader), with the lines of each course on under
   the words (LINES), each with its level and statement.
   What it shows (the film's beats: codons, tRNA with its anticodon, the peptide bond, the ribosome's step):
   0  the start of the copy of the amylase gene, base by base, read three at a time: codons;
   1  the small part of the ribosome attaches to the mRNA, then the large part;
   2  a tRNA brings the first amino acid: its anticodon pairs with the codon AUG (hydrogen bonds drawn);
   3  the second tRNA arrives beside it: two at the same time;
   4  the peptide bond;
   5  the mRNA moves through the ribosome by one codon; the first tRNA leaves;
   6  the same four more times: the chain grows in the order of the codons;
   7  the end: 511 amino acids, the signal, the name "translation".
   True (memory biology-before-pedagogy):
   - the codons are the real first codons of the mRNA of human salivary amylase, AMY1A (NCBI RefSeq NM_004038.4, coding
     sequence 216..1751: ATG AAG CTC TTT TGG TTG CTT TTC ACC …), and the amino acids its real first six (UniProt P0DUB6:
     MKLFWL…, 511 amino acids, the first 15 the signal); Leu has two different codons among them (CUC, UUG);
   - an anticodon is drawn base under base, each the partner of the codon's base (A with U, C with G: two and three
     hydrogen bonds); the words never spell an anticodon, so its direction is not at stake;
   - the new amino acid's tRNA sits to the right of the one that holds the chain (A site, P site), the empty tRNA leaves
     on the left (E site): the three names show only with IB on (D1.2.17 is under "Additional higher level");
   - the picture is a DIAGRAM, and its words say so: the mRNA is drawn stretched (a real codon is about 1 nm long, a
     tRNA about 7 nm, a ribosome about 25 to 30 nm), so that every letter can be read; the game's own ribosome place
     shows the true sizes. In the picture the ribosome stays in the middle and the mRNA moves through it (the IGCSE
     syllabus: "the mRNA passes through ribosomes"; the IB guide: "stepwise movement of the ribosome along mRNA").
   Left out: the cap and the 5' end before AUG (grey stubs: bases not shown), the proteins that help, the energy (GTP),
   the stop codon (the guide: "Focus on elongation … rather than on initiation and termination").
   Everything is worked out from ONE number, p (how far the film has gone), so any moment can be drawn, Back plays in
   reverse, and nothing ever jumps. With Reduce motion each step is one still, which holds every name of the step.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';

const R = window.REV, { $ } = R;
const CODONS = ['AUG', 'AAG', 'CUC', 'UUU', 'UGG', 'UUG', 'CUU', 'UUC', 'ACC'];   /* NM_004038.4, codons 1 to 9 */
const AA = ['Met', 'Lys', 'Leu', 'Phe', 'Trp', 'Leu'], K = AA.length;             /* the six the film joins */
const COMP = { A: 'U', U: 'A', C: 'G', G: 'C' }, HB = { A: 2, U: 2, C: 3, G: 3 };
const COL = { A: 0xff6b6b, C: 0xffc94a, G: 0x4fd18b, U: 0xc38bff };
const AACOL = { Met: 0xffd166, Lys: 0x6fd0e8, Leu: 0xff8fab, Phe: 0x9bde7e, Trp: 0xd6b3ff };
const CW = 2.4, BW = 0.8;                      /* a codon's and a base's width in the drawing */
const PX = -1.2, AX = 1.2, EX = -3.6;          /* the three seats of a tRNA in the ribosome */
const TOP = 6.45;                              /* where a tRNA holds its amino acid */
const DX = -0.75, DY = 0.95;                   /* the chain's way out: one amino acid further up and to the left */
const END = 3 + 3 * (K - 1);
const cl = x => Math.max(0, Math.min(1, x)), ease = x => { const t = cl(x); return t * t * (3 - 2 * t); };
const win = (a, b, x) => ease((x - a) / (b - a));
const B = c => 3 + 3 * (c - 1);                /* where cycle c begins (c = 1 … K - 1) */
/* how far cycle c has moved the mRNA (0 … 1), and how far the tRNA of amino acid t has left */
const moved = (c, p) => ease((p - (B(c) + 2)) / 0.6);
const shift = p => { let s = 0; for (let c = 1; c < K; c++) s += moved(c, p); return s; };
const came = (t, p) => t === 0 ? win(2, 3, p) : win(B(t), B(t) + 1, p);
const left = (t, p) => t + 1 < K ? win(B(t + 1) + 2.55, B(t + 1) + 3, p) : 0;
const bond = (r, p) => win(B(r) + 1, B(r) + 2, p);     /* the peptide bond between amino acids r - 1 and r */

function disc(text, ring, size = 74) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(64, 64, 56, 0, 6.283); g.fill();
  g.lineWidth = 9; g.strokeStyle = '#' + ring.toString(16).padStart(6, '0'); g.stroke();
  g.fillStyle = '#141a3a'; g.font = `900 ${size}px Nunito, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
/* a clear shape with a bright edge: a part of the ribosome (what happens inside it stays visible) */
function glassMat(color) {
  return new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Color(color) }, uA: { value: 1 } }, transparent: true, depthWrite: false,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uC; uniform float uA; varying vec3 vN; varying vec3 vV; void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(uC * (0.5 + 0.9 * rim), (0.07 + 0.62 * rim) * uA); }'
  });
}

function film(wrap, ibOn) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  wrap.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a3266, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(-3, 5, 7); scene.add(key);
  const shiny = (color, k = 0.2) => new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: k, roughness: 0.34, clearcoat: 0.6, clearcoatRoughness: 0.3, transparent: true });
  const all = new THREE.Group(); scene.add(all);
  const up = new THREE.Vector3(0, 1, 0);

  /* ---------- the copy: a strand, its bases with their letters, a bar under each codon ---------- */
  const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 60, 12), shiny(0xffa64d, 0.25)); strand.rotation.z = Math.PI / 2; all.add(strand);
  const baseGeo = new THREE.CapsuleGeometry(0.2, 0.42, 4, 10), stubGeo = new THREE.CapsuleGeometry(0.13, 0.2, 3, 8);
  const baseMat = {}, letTex = {}; Object.keys(COL).forEach(k => { baseMat[k] = shiny(COL[k], 0.24); letTex[k] = disc(k, COL[k]); });
  const mrna = new THREE.Group(); all.add(mrna);
  const letterOf = (k, mats) => { const m = new THREE.SpriteMaterial({ map: letTex[k], depthWrite: false, transparent: true }); if (mats) mats.push(m); const s = new THREE.Sprite(m); s.scale.setScalar(0.62); s.renderOrder = 8; return s; };
  const barMat = [shiny(0xffffff, 0.5), shiny(0xffd27a, 0.5)], barGeo = new THREE.BoxGeometry(CW - 0.3, 0.09, 0.2);
  CODONS.forEach((cd, i) => {
    cd.split('').forEach((b, j) => {
      const x = i * CW + (j - 1) * BW, m = new THREE.Mesh(baseGeo, baseMat[b]); m.position.set(x, 0.45, 0); mrna.add(m);
      const s = letterOf(b); s.position.set(x, 0.5, 0.3); mrna.add(s);
    });
    const bar = new THREE.Mesh(barGeo, barMat[i % 2]); bar.position.set(i * CW, -0.34, 0); mrna.add(bar);
  });
  /* bases the film does not show, before the first codon and after the ninth: grey stubs */
  const stubMat = shiny(0x9aa3c8, 0.1);
  for (let n = 0; n < 9; n++) [-(n + 2) * BW - 0.0, (CODONS.length - 1) * CW + (n + 2) * BW].forEach(x => { const m = new THREE.Mesh(stubGeo, stubMat); m.position.set(x, 0.28, 0); mrna.add(m); });

  /* ---------- the two parts of the ribosome ---------- */
  const ball = new THREE.SphereGeometry(1, 48, 32);
  const small = new THREE.Mesh(ball, glassMat(0x8fb5ff)), large = new THREE.Mesh(ball, glassMat(0x6fe3c8));
  small.scale.set(5.6, 1.35, 2.0); large.scale.set(6.6, 4.7, 2.4); small.renderOrder = large.renderOrder = 6; all.add(small, large);

  /* ---------- the tRNAs, each with its anticodon; the amino acids; the peptide bonds; the hydrogen bonds ---------- */
  /* a tRNA is an L: the anticodon at one end, the amino acid at the other, an elbow between them */
  const bodyGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 2.2, 0), new THREE.Vector3(-0.04, 3.0, 0), new THREE.Vector3(-0.42, 4.2, 0), new THREE.Vector3(-0.5, 4.9, 0), new THREE.Vector3(-0.05, 5.5, 0), new THREE.Vector3(0, 5.8, 0)]), 40, 0.34, 12, false);
  const armGeo = new THREE.SphereGeometry(0.47, 20, 16), plateGeo = new THREE.BoxGeometry(2.2, 0.3, 0.5), aaGeo = new THREE.SphereGeometry(0.62, 28, 20);
  const tr = AA.map((aa, t) => {
    const g = new THREE.Group(), mats = [], col = new THREE.Color(AACOL[aa]).lerp(new THREE.Color(0xffffff), 0.35).getHex();
    const bm = shiny(col, 0.16); mats.push(bm);
    const body = new THREE.Mesh(bodyGeo, bm), arm = new THREE.Mesh(armGeo, bm), plate = new THREE.Mesh(plateGeo, bm);
    arm.position.set(-0.56, 4.72, 0); plate.position.set(0, 2.12, 0); g.add(body, arm, plate);
    CODONS[t].split('').forEach((b, j) => {
      const a = COMP[b], m = shiny(COL[a], 0.24); mats.push(m);
      const base = new THREE.Mesh(baseGeo, m); base.position.set((j - 1) * BW, 1.64, 0); g.add(base);
      const s = letterOf(a, mats); s.position.set((j - 1) * BW, 1.6, 0.3); g.add(s);
    });
    all.add(g);
    const am = shiny(AACOL[aa], 0.3), bead = new THREE.Mesh(aaGeo, am); all.add(bead);
    const lm = new THREE.SpriteMaterial({ map: disc(aa, AACOL[aa], 46), depthWrite: false, transparent: true }), lab = new THREE.Sprite(lm); lab.scale.setScalar(1.02); lab.renderOrder = 9; lab.position.z = 0.7; bead.add(lab);
    return { g, mats, bead, am, lm, pos: new THREE.Vector3() };
  });
  const stickGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 10), stickMat = shiny(0xffffff, 0.5);
  const sticks = AA.slice(1).map(() => { const m = new THREE.Mesh(stickGeo, stickMat.clone()); all.add(m); return m; });
  const DASH = 3, dashGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 6), hbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const hbs = new THREE.InstancedMesh(dashGeo, hbMat, K * 3 * 3 * DASH); hbs.frustumCulled = false; all.add(hbs);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

  /* ---------- names on the picture (HTML over the view, at the parts they name) ---------- */
  const tag = (cls, html) => { const el = document.createElement('div'); el.className = cls; el.innerHTML = html; el.style.opacity = 0; wrap.appendChild(el); return el; };
  const S = { p: 0, from: 0, to: 0, t0: 0, ms: 0, done: null, lin: false };
  const seatX = (t, p) => PX + (t - shift(p)) * CW;
  const marks = [
    { el: tag('cf__lab', 'the copy: mRNA'), at: () => [cam.userData.narrow ? -0.6 : -5.4, 1.0], show: p => 1 - win(1.05, 1.4, p) },
    { el: tag('cf__lab cf__lab--below', 'one codon: three bases'), at: p => [seatX(2, p), -0.75], show: p => win(0.3, 0.9, p) * (1 - win(1.05, 1.4, p)) },
    { el: tag('cf__lab cf__lab--below', 'small part of the ribosome'), at: () => [-1.2, -3.0], show: p => win(1.25, 1.5, p) * (1 - win(2.15, 2.5, p)) },
    { el: tag('cf__lab', 'large part of the ribosome'), at: () => [-0.6, 10.1], show: p => win(1.8, 2, p) * (1 - win(2.15, 2.5, p)) },
    { el: tag('cf__lab cf__lab--right', 'tRNA'), at: () => [PX - 0.75, 4.1], show: p => win(2.75, 3, p) * (1 - win(3.1, 3.5, p)) },
    { el: tag('cf__lab cf__lab--right', 'anticodon'), at: () => [PX - (cam.userData.narrow ? 1.45 : 1.25), 1.62], show: p => win(2.75, 3, p) * (1 - win(3.1, 3.5, p)) },
    { el: tag('cf__lab', 'amino acid'), at: () => [PX, TOP + 0.95], show: p => win(2.75, 3, p) * (1 - win(3.1, 3.5, p)) },
    { el: tag('cf__lab cf__lab--left', 'hydrogen bonds'), at: () => [PX + 1.25, 1.5], show: p => win(2.85, 3, p) * (1 - win(3.1, 3.5, p)) },
    { el: tag('cf__lab', 'peptide bond'), at: () => [0, TOP + 0.95], show: p => win(4.6, 5, p) * (1 - win(5.1, 5.5, p)) },
    { el: tag('cf__lab cf__lab--left', 'the chain of amino acids'), at: () => [PX + 3.5 * DX + 0.95, TOP + 3.5 * DY], show: p => win(B(4) + 2.6, B(4) + 3, p) },
    /* with IB on: the three binding sites for tRNA (Additional higher level), and the mRNA's two ends while the strand is
       shown and the ribosome attaches (steps 1 and 2, where the HL lines on its direction are) */
    { el: tag('cf__lab cf__site', 'E'), ib: 1, at: () => [EX, -1.45], show: p => win(2.6, 3, p) },
    { el: tag('cf__lab cf__site', 'P'), ib: 1, at: () => [PX, -1.45], show: p => win(2.6, 3, p) },
    { el: tag('cf__lab cf__site', 'A'), ib: 1, at: () => [AX, -1.45], show: p => win(2.6, 3, p) },
    { el: tag('cf__lab cf__site', '← 5′ end'), ib: 1, at: () => [-12, 1.0], show: p => 1 - win(2.1, 2.5, p) },
    { el: tag('cf__lab cf__site', '3′ end →'), ib: 1, at: () => [12, 1.0], show: p => 1 - win(2.1, 2.5, p) }
  ];
  const v = new THREE.Vector3();
  let W = 1, H = 1, alive = true;
  const proj = (x, y) => { v.set(x, y, 0).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };
  function overlay(p) {
    marks.forEach(m => {
      const o = m.ib && !ibOn ? 0 : m.show(p); m.el.style.opacity = o.toFixed(3); if (o < 0.01) return;
      const [x, y] = m.at(p), [sx, sy] = proj(x, y), w = m.el.offsetWidth, h = m.el.offsetHeight, right = m.el.classList.contains('cf__lab--right'), below = m.el.classList.contains('cf__lab--below');
      /* above its part, below it, to its left (its right edge at the part) or to its right; kept inside the picture */
      const leftOf = m.el.classList.contains('cf__lab--left'), lx = right ? sx - w - 6 : leftOf ? sx + 6 : sx - w / 2, ly = right || leftOf ? sy - h / 2 : below ? sy + 4 : sy - h - 4;
      m.el.style.transform = `translate(${Math.max(4, Math.min(W - w - 4, lx)).toFixed(1)}px, ${Math.max(4, Math.min(H - h - 4, ly)).toFixed(1)}px)`;
    });
  }

  /* ---------- one moment of the film, from p ---------- */
  function draw(p) {
    const s = shift(p);
    mrna.position.x = PX - s * CW;
    barMat.forEach(m => { m.opacity = win(0.2, 0.9, p); });
    const sm = win(1, 1.5, p), lg = win(1.5, 2, p);
    small.position.set(-1.2, -1.6 - 6 * (1 - sm), 0); small.material.uniforms.uA.value = sm; small.visible = sm > 0.001;
    large.position.set(-0.6, 4.9 + 10 * (1 - lg), 0); large.material.uniforms.uA.value = lg; large.visible = lg > 0.001;
    /* each amino acid's depth in the chain: how many amino acids have joined after it and moved it up */
    for (let t = 0; t < K; t++) {
      const a = came(t, p), l = left(t, p), T = tr[t], x = seatX(t, p) + 7 * (1 - a) - 5 * l, y = 6 * (1 - a) + 5 * l, o = a * (1 - l);
      T.g.visible = o > 0.001; T.g.position.set(x, y, 0); T.mats.forEach(m => { m.opacity = o; m.depthWrite = o > 0.6; });
      let depth = 0; for (let c = t + 1; c < K; c++) depth += moved(c, p);
      if (depth > 0) T.pos.set(PX + depth * DX + 0.14 * Math.sin(depth * 2.1), TOP + depth * DY, 0); else T.pos.set(x, y + TOP, 0);
      T.bead.position.copy(T.pos); T.bead.visible = a > 0.001; T.am.opacity = T.lm.opacity = a; T.am.depthWrite = a > 0.6;
      /* the hydrogen bonds between this anticodon and its codon: they form as the tRNA lands and break as it leaves */
      const hv = win(0.8, 1, a) * (1 - win(0, 0.25, l));
      CODONS[t].split('').forEach((b, j) => {
        const n = HB[b], bx = x + (j - 1) * BW, y0 = 0.9, y1 = y + 1.2;
        for (let q = 0; q < 3; q++) for (let d = 0; d < DASH; d++) {
          const k = ((t * 3 + j) * 3 + q) * DASH + d, off = n === 2 ? (q === 2 ? null : (q - 0.5) * 0.2) : (q - 1) * 0.17;
          if (hv < 0.01 || off == null) { hbs.setMatrixAt(k, ZERO); continue; }
          V1.set(bx + off, y0 + (y1 - y0) * (d + 0.5) / DASH, 0.05); V2.set(1, (y1 - y0) / DASH * 0.55 * hv, 1);
          hbs.setMatrixAt(k, M.compose(V1, Q.identity(), V2));
        }
      });
    }
    hbs.instanceMatrix.needsUpdate = true;
    sticks.forEach((m, i) => {
      const bv = bond(i + 1, p), a = tr[i].pos, b = tr[i + 1].pos; m.visible = bv > 0.001; if (!m.visible) return;
      V1.copy(b).sub(a); const len = V1.length();
      m.position.copy(a).addScaledVector(V1, 0.5); m.quaternion.setFromUnitVectors(up, V1.normalize()); m.scale.set(1, Math.max(0.01, len * bv), 1); m.material.opacity = bv;
    });
  }

  const size = () => {
    W = wrap.clientWidth; H = Math.max(200, wrap.clientHeight || Math.min(360, W * 0.62));
    renderer.setSize(W, H); cam.aspect = W / H; cam.updateProjectionMatrix();
    const tv = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), narrow = W < 520;
    /* a laptop: the whole ribosome and the chain above it; a phone: closer, from the mRNA to the amino acids, so that the
       letters can be read (the chain then leaves the top of the picture) */
    cam.userData.narrow = narrow;
    cam.userData.dist = narrow ? Math.max(4.7 / (tv * cam.aspect), 4.6 / tv) : Math.max(7.6 / tv, 9.6 / (tv * cam.aspect));
    cam.userData.at = narrow ? [-0.2, 3.1] : [-0.6, 4.2];
  };
  size(); addEventListener('resize', size);
  const loop = () => {
    if (!alive) return;
    const now = performance.now(), k = S.ms ? Math.min(1, (now - S.t0) / S.ms) : 1, e = S.lin ? k : k * k * (3 - 2 * k);
    S.p = S.from + (S.to - S.from) * e;
    draw(S.p);
    const far = cam.userData.narrow ? win(B(2) + 2, B(4) + 3, S.p) : 0, [ax, ay0] = cam.userData.at, ay = ay0 + 1.6 * far, dist = cam.userData.dist * (1 + 0.36 * far);
    cam.position.set(ax, ay + 0.4, dist); cam.lookAt(ax, ay, 0); cam.updateMatrixWorld();
    renderer.render(scene, cam); overlay(S.p);
    if (k >= 1 && S.done) { const d = S.done; S.done = null; d(); }
    requestAnimationFrame(loop);
  };
  loop();
  return {
    go(to, ms, lin) { return new Promise(res => { S.from = S.p; S.to = to; S.lin = !!lin; S.t0 = performance.now(); S.ms = R.FAST ? 0 : ms; S.done = res; }); },
    stop() { alive = false; removeEventListener('resize', size); renderer.dispose(); renderer.domElement.remove(); },
    /* where the film stands (read by tools/course-check.mjs) */
    peek: () => ({ p: S.p, s: shift(S.p), chain: tr.filter((T, t) => { let d = 0; for (let c = t + 1; c < K; c++) d += moved(c, S.p); return d > 0.99; }).length,
      trnas: tr.filter(T => T.g.visible && T.mats[0].opacity > 0.5).length, bonds: sticks.filter(m => m.visible && m.material.opacity > 0.99).length,
      names: marks.filter(m => +m.el.style.opacity > 0.5).map(m => m.el.textContent) })
  };
}

/* each step: its words, where the film goes (p, ms, even pace), and LINES: what each course asks about what it shows */
const STEPS = [
  { p: 1, ms: 1800,
    t: 'This is how a ribosome reads the copy of a gene.\nHere is the start of the copy of the amylase gene: <dfn data-w="mrna">mRNA</dfn>. It is one strand, with bases along it: A, U, C and G. These are the real bases where the ribosome starts to read.\nThe bases are read three at a time. Three bases together are one word of the code: a <b>codon</b>. Each codon means one amino acid.\n(This picture is a diagram: the mRNA is drawn stretched, so that you can read every letter.)',
    igcse: [['s', '17.1.8', 'The specific sequence of amino acids is determined by the sequence of bases in the mRNA.']],
    ib: [['sl', 'D1.2.8', 'The genetic code is a triplet code. There are four bases. With one base for each amino acid, the code could name only 4 amino acids; with two bases, 16. Three bases give 64 codons: enough for the 20 amino acids.'],
      ['sl', 'A1.2.7', 'RNA differs from DNA: one strand, not two; the base uracil (U) where DNA has thymine (T); the sugar ribose.'],
      ['hl', 'D1.2.12', 'Translation is 5′ to 3′: the mRNA is read from its 5′ end towards its 3′ end.']] },
  { p: 2, ms: 2800,
    t: 'The small part of the ribosome attaches to the mRNA. Then the large part joins it.\nThe ribosome starts to read at the codon AUG.',
    igcse: [['c', '2.1.1, 2.1.4', 'Ribosomes are in the list of cell structures: they are where proteins are made.'], ['n', '', 'The syllabus does not name the two parts of a ribosome.']],
    ib: [['sl', 'D1.2.6', 'mRNA binds to the small subunit of the ribosome.'],
      ['hl', 'D1.2.17', 'Initiation of translation: the small subunit attaches to the 5′ terminal of the mRNA and moves to the start codon; the initiator tRNA binds; then the large subunit attaches.'],
      ['x', '', 'The start codon, AUG, codes for the amino acid methionine (Met): a new chain begins with Met.'],
      ['x', '', 'The film draws the large subunit first. In a cell, the initiator tRNA binds before the large subunit attaches.']] },
  { p: 3, ms: 2600,
    t: 'An amino acid arrives on a carrier: a small molecule of RNA, called <b>transfer RNA</b> (tRNA).\nAt its other end, the tRNA has three bases: its <b>anticodon</b>. The anticodon pairs with the codon: U with A, and C with G. <dfn data-w="hydrogen-bond">Hydrogen bonds</dfn> hold each pair.\nSo only a tRNA with the right anticodon fits this codon, and it carries one kind of amino acid: here Met (methionine).',
    igcse: [['n', '', 'The IGCSE syllabus does not name tRNA, codons or anticodons. It says: "knowledge of the details of transcription or translation is not required".']],
    ib: [['sl', 'D1.2.6', 'The role of tRNA in translation: each tRNA carries one specific amino acid to the ribosome.'],
      ['sl', 'D1.2.7', 'Complementary base pairing between tRNA and mRNA: the anticodon of the tRNA pairs with the codon of the mRNA.'],
      ['hl', 'D1.2.17', 'The first tRNA is the initiator tRNA. It binds at the P site.']] },
  { p: 4, ms: 2300,
    t: 'The next codon is AAG. The tRNA whose anticodon pairs with AAG arrives beside the first one. It carries the amino acid Lys (lysine).\nNow two tRNAs are in the ribosome at the same time, side by side.',
    igcse: [['s', '17.1.8', 'The specific sequence of amino acids is determined by the sequence of bases in the mRNA: the next three bases determine the second amino acid.']],
    ib: [['sl', 'D1.2.6', 'Two tRNAs can bind at the same time to the large subunit.'],
      ['hl', 'D1.2.17', 'The ribosome has three binding sites for tRNA. The new tRNA binds at the A site. The tRNA that holds the chain is at the P site. A tRNA leaves from the E site.']] },
  { p: 5, ms: 1700,
    t: 'The ribosome joins the two amino acids: a bond forms between them, called a <b>peptide bond</b>.\nThe first amino acid is now joined to the second one.',
    igcse: [['s', '17.1.8', 'The ribosome assembles amino acids into protein molecules.'], ['c', '4.1.2', 'Proteins are large molecules made from smaller molecules: amino acids.']],
    ib: [['sl', 'D1.2.10', 'Amino acids are linked to the growing polypeptide chain by peptide bonding.'],
      ['hl', 'D1.2.17', 'The peptide bond transfers the chain from the tRNA at the P site to the amino acid on the tRNA at the A site.'],
      ['sl', 'B1.2.2', 'A peptide bond forms by a condensation reaction: one molecule of water is released.'],
      ['x', '', 'The catalyst of this reaction is RNA of the large subunit, not a protein.']] },
  { p: 6, ms: 2800,
    t: 'The mRNA moves through the ribosome by one codon. (In a cell, you can also say that the ribosome moves along the mRNA.)\nThe first tRNA has given its amino acid. It leaves, and it can carry another Met later.\nThe next codon, CUC, is now free for the next tRNA.',
    igcse: [['s', '17.1.8', 'The mRNA passes through ribosomes.']],
    ib: [['sl', 'D1.2.10', 'Stepwise movement of the ribosome along the mRNA: one codon at a time.'],
      ['hl', 'D1.2.17', 'The tRNA that gave its amino acid moves to the E site and leaves. The tRNA that holds the chain moves from the A site to the P site. The A site is free.']] },
  { p: END, ms: (END - 6) * 850, lin: true,
    t: 'The same happens again and again: a tRNA arrives, a peptide bond forms, the mRNA moves by one codon.\nFour more amino acids join here: Leu, Phe, Trp and Leu. The chain grows in the order of the codons of the mRNA.',
    igcse: [['s', '17.1.8', 'The specific sequence of amino acids is determined by the sequence of bases in the mRNA.']],
    ib: [['sl', 'D1.2.5', 'Translation is the synthesis of polypeptides from mRNA: the base sequence of the mRNA is translated into the amino acid sequence of a polypeptide.'],
      ['sl', 'D1.2.8', 'The code is degenerate: more than one codon can code for the same amino acid. Here CUC and UUG both code for Leu. The code is universal: almost all organisms use the same code.'],
      ['sl', 'D1.2.9', 'With a table of mRNA codons you can deduce the amino acids: AUG AAG CUC UUU UGG UUG codes for Met, Lys, Leu, Phe, Trp, Leu.']] },
  { p: END, ms: 0,
    t: 'The whole chain of amylase has 511 amino acids. The first 15 are the signal that you saw in the game: it takes this ribosome to the rough ER, where the signal is removed.\nMaking a chain of amino acids in the order of the codons of mRNA has a name: <dfn data-w="translation">translation</dfn>.',
    igcse: [['s', '17.1.6', 'Different sequences of amino acids give different shapes to protein molecules. At the rough ER, this chain folds into the shape of amylase.']],
    ib: [['sl', 'D1.2.10', 'The guide says: "Focus on elongation of the polypeptide, rather than on initiation and termination." Elongation is what this film shows. At higher level, D1.2.17 adds initiation.'],
      ['sl', 'B1.2.4', 'A peptide chain can have any number of amino acids, in any order: here 511.'],
      ['hl', 'D1.2.18', 'Many polypeptides must be modified before they can function: the signal of this chain is removed in the rough ER.']] }
];
const paras = t => t.split('\n').map(x => `<p>${x}</p>`).join('');
const LVN = { c: 'Core', s: 'Supplement', n: 'Not named', sl: 'SL and HL', hl: 'HL only', x: 'Beyond the guide' };
/* the lines of the courses that are on, as the place's own boxes draw them (quest.js courseSwitch) */
export function courseLines(step, LV) {
  return ['igcse', 'ib'].filter(c => LV[c] && step[c]).map(c => `<div class="step__ib step__lv cf__lv" data-lv="${c}"><p class="step__lvk">${c === 'ib' ? 'IB' : 'IGCSE'}</p>`
    + step[c].map(([lv, code, t]) => `<p><span class="ibl ibl--${lv}">${c === 'igcse' && code ? `<i>${code}</i> ` : ''}${LVN[lv]}${c === 'ib' && code ? ` <i>${code}</i>` : ''}</span> ${t}</p>`).join('') + '</div>').join('');
}

/* the film, in its own window over the world; resolves when it is closed (watched to the end, or not) */
export function openRiboFilm({ last = 'Back to the ribosomes' } = {}) {
  return new Promise(done => {
    let box = $('#ribofilm');
    if (!box) { box = document.createElement('div'); box.className = 'lens'; box.id = 'ribofilm'; $('#stage').appendChild(box); }
    const LV = Object.assign({ igcse: false, ib: false }, R.store.get('courseLv', {}));
    box.innerHTML = `<div class="lens__card cf rf" role="dialog" aria-modal="true" aria-labelledby="rf-h">
      <div class="lens__top"><h2 id="rf-h">🔬 How a ribosome reads the copy</h2><button type="button" class="close-x" aria-label="Close">×</button></div>
      <div class="cf__grid"><div class="lens__3d cf__3d"></div><div class="cf__side">
      <p class="cf__x">${LV.igcse && LV.ib ? 'IGCSE and IB' : LV.ib ? 'IB' : LV.igcse ? 'IGCSE' : 'Explorer'}: beyond the Year 7 list</p>
      <p class="cf__n" aria-live="polite"></p><div class="cf__t" aria-live="polite"></div>
      <div class="cf__do"><button type="button" class="btn next pulse">Next step →</button><button type="button" class="btn ghost back" disabled>← Back</button></div>
      <div class="cf__lvs"></div>
    </div></div></div>`;
    box.hidden = false;
    const F = film($('.cf__3d', box), !!LV.ib); box.peek = F.peek;
    const nEl = $('.cf__n', box), tEl = $('.cf__t', box), btn = $('.cf__do .btn.next', box), back = $('.cf__do .btn.back', box), lEl = $('.cf__lvs', box);
    let i = 0, busy = false;
    const close = () => { F.stop(); box.hidden = true; box.innerHTML = ''; document.removeEventListener('keydown', esc1); done(); };
    const esc1 = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc1);
    $('.close-x', box).addEventListener('click', close);
    /* Next plays the step; Back plays the step after it in reverse, to where this step ended. Both wait while it plays */
    const show = async (dir = 1) => {
      const s = STEPS[i]; busy = true; btn.disabled = true; back.disabled = true;
      nEl.textContent = `${i + 1} of ${STEPS.length}`; tEl.innerHTML = paras(s.t); lEl.innerHTML = courseLines(s, LV); if (R.terms) { R.terms(tEl); R.terms(lEl); }
      if (dir > 0) await F.go(s.p, s.ms, s.lin); else await F.go(s.p, Math.max(1200, Math.min(4500, STEPS[i + 1].ms)), false);
      busy = false; btn.disabled = false; back.disabled = i === 0;
      btn.textContent = i === STEPS.length - 1 ? last + ' →' : 'Next step →'; btn.focus({ preventScroll: true });
    };
    btn.addEventListener('click', () => { if (busy) return; if (i === STEPS.length - 1) { close(); return; } i++; show(); });
    back.addEventListener('click', () => { if (busy || i === 0) return; i--; show(-1); });
    show();
  });
}
