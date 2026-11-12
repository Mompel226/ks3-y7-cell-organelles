/* ============================================================
   ch0.js — the map: where everything happens (5 Nov 2026). Daniel's text: "I'll follow one glucose molecule from your blood
   to the ATP it ends up as. First, here's the map of where everything happens."
   A 3D map at the true sizes of the cell's parts (nm): a capillary 7 µm wide with red blood cells (7 µm across, single
   file) in the plasma; 1.2 µm of tissue fluid; the muscle cell's membrane; inside, a mitochondrion just under the membrane
   (as in muscle: subsarcolemmal), the game's own model cut open (2.7 µm long); above it, myofibrils (1 µm thick, their
   sarcomeres 2.5 µm long). Molecules are far too small to see at this size: each glowing dot STANDS for one, and the
   picture says so. Paths: glucose (from the plasma, through a glucose transporter, to glycolysis), its two pyruvate
   (into the mitochondrion), oxygen (from a red blood cell to the inner membrane), the NADH shuttle (dashed: only
   electrons enter), carbon dioxide (to the plasma), ATP (to a myofibril). A number at each chapter's place opens it
   (a press: light only where a press goes, memory name-it-on-the-picture).
   Sizes: capillary 5–10 µm (OpenStax A&P 20.1); red blood cell 7.5 µm (OpenStax A&P 18.2); myofibril about 1 µm, resting
   sarcomere about 2.5 µm (OpenStax A&P 10.2); the mitochondrion as in the game (mitoparts.js heroSpec).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { heroMito, heroPoint, along } from '../world/mitoparts.js?v=202611121723';
import { disposeGroup } from './stage.js?v=202611121723';

export async function build(stage, { V, glow, smooth }) {
  const g = new THREE.Group(); g.name = 'ch0-map';
  /* ---- the regions behind everything: the cytosol above the membrane, the tissue fluid below it ---- */
  const MEM_Y = -600, CAP = { y: -6200, z: -1200, r: 3600 };
  const back = new THREE.Mesh(new THREE.PlaneGeometry(40000, 30000), new THREE.ShaderMaterial({
    uniforms: { uM: { value: MEM_Y } }, depthWrite: false,
    vertexShader: 'varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.0); }',
    fragmentShader: `uniform float uM; varying vec3 vW;
      void main(){ float up = smoothstep(uM - 250.0, uM + 250.0, vW.y);
        vec3 cyt = mix(vec3(0.13, 0.12, 0.33), vec3(0.09, 0.08, 0.24), smoothstep(uM, uM + 9000.0, vW.y));
        vec3 tf = mix(vec3(0.06, 0.17, 0.22), vec3(0.04, 0.10, 0.15), smoothstep(uM, uM - 9000.0, vW.y));
        gl_FragColor = vec4(mix(tf, cyt, up), 1.0);
        #include <colorspace_fragment>
      }` }));
  back.position.set(0, 0, -6000); back.renderOrder = -10; g.add(back);
  /* ---- the capillary (cut open lengthways: its back half), its red blood cells, single file, and the plasma ---- */
  const tubeMat = new THREE.MeshStandardMaterial({ color: 0xc98a72, transparent: true, opacity: 0.5, roughness: 0.6, side: THREE.DoubleSide, depthWrite: false, emissive: 0x3a0a14, emissiveIntensity: 0.5 });
  const half = new THREE.CylinderGeometry(CAP.r, CAP.r, 20000, 48, 1, true, Math.PI, Math.PI);
  const tube = new THREE.Mesh(half, tubeMat); tube.rotation.z = Math.PI / 2; tube.position.set(0, CAP.y, CAP.z); g.add(tube);
  const wallLine = y => { const m = new THREE.Mesh(new THREE.BoxGeometry(20000, 110, 110), new THREE.MeshBasicMaterial({ color: 0xff9db0, transparent: true, opacity: 0.8 })); m.position.set(0, y, CAP.z); g.add(m); return m; };
  wallLine(CAP.y + CAP.r); wallLine(CAP.y - CAP.r);
  const prof = []; for (let i = 0; i <= 24; i++) { const r = 3200 * i / 24, x = r / 3200; prof.push(new THREE.Vector2(r, 1300 * Math.sqrt(Math.max(0, 1 - x * x)) * (0.34 + 0.66 * x * x) + 40)); }
  for (let i = 24; i >= 0; i--) prof.push(new THREE.Vector2(prof[i].x, -prof[i].y));
  const rbcGeo = new THREE.LatheGeometry(prof, 48); rbcGeo.computeVertexNormals();
  const rbcMat = new THREE.MeshStandardMaterial({ color: 0xd63a4a, roughness: 0.45, emissive: 0x5a0810, emissiveIntensity: 0.5 });
  const rbcs = [0, 1, 2, 3].map(i => { const m = new THREE.Mesh(rbcGeo, rbcMat); m.rotation.z = Math.PI / 2; m.rotation.y = 0.5; g.add(m); return m; });
  const plasma = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xffe9a8, size: 80, sizeAttenuation: true, transparent: true, opacity: 0.5, depthWrite: false }));
  { const n = 220, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const r = Math.sqrt(Math.random()) * (CAP.r - 300), t = Math.random() * 6.283; a[3 * i] = -10000 + Math.random() * 20000; a[3 * i + 1] = CAP.y + r * Math.cos(t); a[3 * i + 2] = CAP.z + Math.abs(r * Math.sin(t)) * -1 + 200; } plasma.geometry.setAttribute('position', new THREE.BufferAttribute(a, 3)); }
  g.add(plasma);
  /* ---- the muscle cell's membrane: a thin sheet, its cut edge a bright line across the picture ---- */
  const memMat = new THREE.MeshPhysicalMaterial({ color: 0xffb3d9, transparent: true, opacity: 0.28, roughness: 0.2, iridescence: 1, iridescenceIOR: 1.5, side: THREE.DoubleSide, depthWrite: false, emissive: 0x3a1030, emissiveIntensity: 0.5 });
  const mem = new THREE.Mesh(new THREE.BoxGeometry(20000, 90, 9000), memMat); mem.position.set(0, MEM_Y, -2500); g.add(mem);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(20000, 90, 60), new THREE.MeshBasicMaterial({ color: 0xffc7e4 })); edge.position.set(0, MEM_Y, 2000); g.add(edge);
  /* glucose transporters: at this size, only as points of light on the membrane (each is 5 nm across) */
  const glutDots = [-6200, -4200, -1500, 1400, 4300].map((x, i) => { const s = glow(300, 0x7ff0dc, 0.95); s.position.set(x, MEM_Y, 1900 - (i % 2) * 1500); g.add(s); return s; });
  /* ---- the mitochondrion (the game's own model, cut open), lying along the membrane ---- */
  const H = heroMito(), HS = H.spec;
  const mito = new THREE.Group(); mito.add(H.group); mito.scale.setScalar(1000); mito.rotation.z = -Math.PI / 2 + 0.04; mito.position.set(600, 1050, 400); g.add(mito);
  const hW = (s, a, b = 0) => mito.localToWorld(heroPoint(HS, s, a, b));
  /* ---- myofibrils: the parts of a muscle cell that contract, using ATP; striped by their sarcomeres ---- */
  const fibMat = new THREE.MeshStandardMaterial({ color: 0xa8566a, roughness: 0.7, emissive: 0x2a0812, emissiveIntensity: 0.35, transparent: true, opacity: 0.85 });
  fibMat.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vX;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvX = (modelMatrix * vec4(position, 1.0)).x;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vX;').replace('#include <color_fragment>', `#include <color_fragment>
      float ph = fract(vX / 2500.0);
      float aBand = smoothstep(0.17, 0.2, ph) * (1.0 - smoothstep(0.8, 0.83, ph));
      float zLine = 1.0 - smoothstep(0.0, 0.025, min(ph, 1.0 - ph));
      diffuseColor.rgb *= mix(1.25, 0.72, aBand);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.25, 0.05, 0.1), zLine * 0.8);`);
  };
  const fibs = [[-3800, 4400], [-2400, 3500]].map(([z, y]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(520, 520, 18000, 32), fibMat); m.rotation.z = Math.PI / 2; m.position.set(0, y, z); g.add(m); return m; });
  /* ---- glycolysis, in the cytosol: a glow where it happens (its enzymes are far too small to see here) ---- */
  const GLY = V(-3100, 300, 300);
  const glyGlow = glow(1500, 0x8f9bff, 0.65); glyGlow.position.copy(GLY); g.add(glyGlow);
  /* ---- the paths, and dots that stand for molecules ---- */
  const curve = pts => new THREE.CatmullRomCurve3(pts.map(p => V(...p)), false, 'centripetal');
  const P = {
    glucose: curve([[-7600, -6400, 0], [-6600, -5000, 200], [-5600, CAP.y + CAP.r, 300], [-4200, MEM_Y, 400], [-3700, -150, 350], [GLY.x, GLY.y, GLY.z]]),
    pyr1: curve([[GLY.x, GLY.y, GLY.z], [-2300, 900, 380], [-1000, 1150, 420]]),
    pyr2: curve([[GLY.x, GLY.y, GLY.z], [-2200, 500, 450], [-950, 950, 430]]),
    nadh: curve([[GLY.x, GLY.y, GLY.z], [-2400, 1650, 300], [-1000, 1500, 420], [-150, 1200, 430]]),
    o2: curve([[-1500, -6300, 0], [-1100, CAP.y + CAP.r, 500], [-700, MEM_Y, 700], [0, 500, 520], [450, 930, 430]]),
    co2: curve([[1500, 1050, 430], [2400, 200, 600], [3000, MEM_Y, 700], [3600, CAP.y + CAP.r, 400], [4600, -6200, 0]]),
    atp: curve([[1100, 1380, 430], [1250, 2400, -900], [1400, 3500 - 480, -2400]])
  };
  const COLS = { glucose: 0xbfe3ff, pyr1: 0xd8ecff, pyr2: 0xd8ecff, nadh: 0xc79bff, o2: 0xff6a5a, co2: 0xdfe4ea, atp: 0xffd27a };
  const tubeShader = (color, dashed, px) => new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Color(color) }, uA: { value: 0 }, uT: { value: 0 }, uPx: { value: px }, uK: { value: 0.001 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    /* the tube is made with radius 1: its middle is position - normal; it is drawn uPx pixels wide whatever the zoom */
    vertexShader: `uniform float uPx; uniform float uK; varying vec2 vU; varying float vE;
      void main(){ vU = uv; vec3 c = position - normal; vec4 mc = modelViewMatrix * vec4(c, 1.0);
        float r = uPx * (-mc.z) * uK; vec4 mv = modelViewMatrix * vec4(c + normal * r, 1.0);
        vE = abs(dot(normalize((modelViewMatrix * vec4(normal, 0.0)).xyz), vec3(0.0, 0.0, 1.0)));
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uC; uniform float uA; uniform float uT; varying vec2 vU; varying float vE;
      void main(){ float d = ${dashed ? 'step(0.5, fract(vU.x * 14.0 - uT * 0.6))' : '1.0'}; float f = 0.35 + 0.25 * sin(vU.x * 30.0 - uT * 3.0);
        gl_FragColor = vec4(uC * (0.6 + f), uA * d * (0.25 + 0.5 * vE)); }`
  });
  const paths = {};
  Object.keys(P).forEach(k => {
    const m = new THREE.Mesh(new THREE.TubeGeometry(P[k], 120, 1, 8, false), tubeShader(COLS[k], k === 'nadh', k === 'nadh' ? 2.6 : 3.4)); m.frustumCulled = false;
    g.add(m);
    const dots = Array.from({ length: k === 'atp' ? 4 : 6 }, () => { const s = glow(0.034, COLS[k], 1); s.material.sizeAttenuation = false; g.add(s); return s; });
    paths[k] = { mesh: m, dots };
  });
  /* ---- the chapters' numbers, where each chapter happens ---- */
  const numTex = n => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.beginPath(); x.arc(64, 64, 52, 0, 6.283); x.fillStyle = '#FFD27A'; x.fill(); x.lineWidth = 9; x.strokeStyle = '#1b1640'; x.stroke();
    x.fillStyle = '#1b1640'; x.font = '900 70px Nunito, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n), 64, 70);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  /* each number stands a little away from its place (above it), with a thin line to it, so that the numbers never crowd */
  const BEAC = [[1, [-5400, 300, 900], [-4200, MEM_Y, 400]], [2, [-4500, 2000, 900], [GLY.x, GLY.y, GLY.z]],
    [3, [-1900, 2350, 900], [-950, 1100, 430]], [4, [-300, 2450, 900], [100, 1080, 430]], [5, [1300, 2450, 900], [800, 1080, 430]], [6, [2900, 2250, 900], [1500, 1300, 430]]];
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.75, depthTest: false });
  const beacons = BEAC.map(([n, at, to]) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: numTex(n), depthTest: false, transparent: true, sizeAttenuation: false })); s.position.set(...at); s.scale.setScalar(0.04); s.renderOrder = 20; s.userData.ch = n; g.add(s);
    const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(...at), V(...to)]), lineMat); ln.renderOrder = 19; g.add(ln);
    return s;
  });
  let hot = null;
  /* the numbers and their lines, as boxes where no name may stand (view.js keepOut; the review: lines crossed names) */
  const kp = new THREE.Vector3();
  const keepOut = () => { const out = [], k = (stage.H / 2) / Math.tan(THREE.MathUtils.degToRad(stage.cam.fov / 2));
    BEAC.forEach(([n, at, to], i) => { const s = beacons[i]; if (!s.visible) return;
      const a = stage.project(kp.set(...at)), b = stage.project(kp.set(...to)); if (!a[2]) return;
      const r = s.scale.x * k / 2 + 4; out.push({ l: a[0] - r, r: a[0] + r, t: a[1] - r, b: a[1] + r });
      if (b[2]) for (let j = 1; j < 6; j++) { const x = a[0] + (b[0] - a[0]) * j / 6, y = a[1] + (b[1] - a[1]) * j / 6; out.push({ l: x - 3, r: x + 3, t: y - 3, b: y + 3 }); } });
    return out; };
  /* ---- the camera's views (nm): the whole map, then each place ---- */
  const D = (x, y, z) => V(x, y, z).normalize(), UP = V(0, 1, 0);
  const views = [
    { at: V(-500, -3000, 0), dist: 28000, dir: D(0.07, 0.14, 1), up: UP },
    { at: V(-3600, -5400, 0), dist: 12000, dir: D(0.06, 0.12, 1), up: UP },
    { at: V(-3900, -1000, 300), dist: 7600, dir: D(0.08, 0.2, 1), up: UP },
    { at: V(-2600, 450, 300), dist: 6600, dir: D(0.05, 0.14, 1), up: UP },
    { at: V(300, 1050, 400), dist: 5200, dir: D(0.02, 0.1, 1), up: UP },
    { at: V(500, -2800, 0), dist: 27000, dir: D(0.07, 0.14, 1), up: UP }
  ];
  /* ---- names ---- */
  const crist = hW(HS.total * 0.62, along(HS, HS.total * 0.62).r - 0.0255);
  const labels = {
    cap: { html: 'capillary', side: 'r', pts: () => [V(-7400, CAP.y + CAP.r, CAP.z), V(-6800, CAP.y + CAP.r, CAP.z), V(-6200, CAP.y + CAP.r, CAP.z)] },
    rbc: { html: 'red blood cell', side: 'r', pts: () => rbcs.filter(r => r.position.x > -7000 && r.position.x < 3000).map(r => r.position.clone().add(V(0, 1500, 900))) },
    plasma: { html: 'plasma', side: 'l', pts: () => [V(-5400, CAP.y - 2100, CAP.z - 800), V(-4600, CAP.y - 2400, CAP.z - 800), V(-3800, CAP.y - 2100, CAP.z - 800)] },
    tf: { html: 'tissue fluid', side: 'l', pts: () => [V(-7000, -1600, 1500), V(-6200, -1600, 1500)] },
    mem: { html: 'cell membrane', side: 'l', pts: () => [V(-7400, MEM_Y, 2000), V(-6600, MEM_Y, 2000), V(-5800, MEM_Y, 2000)] },
    /* clear of the chapter numbers' circles and lines (keep-outs) */
    cyt: { html: 'cytosol', side: 'l', pts: () => [V(-6600, 1500, 1000), V(-3600, 1300, 900), V(-2700, 1750, 900), V(-5800, 1100, 900), V(-3300, -300, 900)] },
    /* the line ends ON the glowing point (the review: it had ended 600 nm short) */
    gly: { html: 'glycolysis happens here', side: 'l', pts: () => [GLY.clone(), GLY.clone().add(V(-150, 0, 0))] },
    mito: { html: 'mitochondrion', side: 'r', pts: () => [hW(HS.total * 0.82, -(along(HS, HS.total * 0.82).r - 0.003)), hW(HS.total * 0.7, -(along(HS, HS.total * 0.7).r - 0.003))] },
    matrix: { html: 'matrix', side: 'r', pts: () => [hW(HS.total * 0.62, 0), hW(HS.total * 0.7, 0.04)] },
    /* points ON the inner membrane (25.5 nm inside the outer surface), along the mitochondrion */
    inner: { html: 'inner membrane (folded: cristae)', side: 'r', pts: () => [0.62, 0.7, 0.55, 0.78].map(f => hW(HS.total * f, along(HS, HS.total * f).r - 0.0255)) },
    fib: { html: 'myofibril: it contracts, using ATP', side: 'r', pts: () => [V(3200, 3500 + 500, -2400), V(4000, 3500 + 500, -2400), V(3200, 4400 + 500, -3800)] },
    glut: { html: 'a glucose transporter (5 nm across)', side: 'l', pts: () => [glutDots[1].position.clone()] },
    dots: { html: 'each glowing dot stands for one molecule', side: 'r', pts: () => paths.glucose.dots.filter(d => d.visible && d.position.y < CAP.y + CAP.r).map(d => d.position.clone()) },
    co2: { html: 'carbon dioxide', side: 'r', pts: () => paths.co2.dots.filter(d => d.visible && d.position.y < MEM_Y && d.position.y > CAP.y + CAP.r).map(d => d.position.clone()) },
    atp: { html: 'ATP', side: 'r', pts: () => paths.atp.dots.filter(d => d.visible).map(d => d.position.clone()) },
    o2: { html: 'oxygen', side: 'r', pts: () => paths.o2.dots.filter(d => d.visible && d.position.y > MEM_Y - 1500 && d.position.y < MEM_Y + 900).map(d => d.position.clone()) },
    pyr: { html: 'pyruvate', side: 'r', pts: () => paths.pyr1.dots.filter(d => d.visible).map(d => d.position.clone()) },
    nadh: { html: 'electrons of NADH (dashed: a shuttle)', side: 'l', pts: () => [P.nadh.getPointAt(0.45), P.nadh.getPointAt(0.6)] }
  };
  const knobs = { cam: 0, glu: 0, oxy: 0, pyr: 0, nad: 0, co2: 0, atp: 0 };
  const steps = [
    { phases: [{ to: { cam: 0, glu: 0.35, oxy: 0.35, pyr: 0.35, nad: 0.3, co2: 0.35, atp: 0.35 }, ms: 1200 }], labs: { cap: 1, mem: 1, cyt: 1, mito: 1, fib: 2 }, pic: 'Map: not to scale for molecules. Press a number to open its chapter.' },
    { phases: [{ to: { cam: 1, glu: 1, oxy: 1, pyr: 0.15, nad: 0.1, co2: 0.15, atp: 0.15 }, ms: 2200 }], labs: { rbc: 1, plasma: 1, cap: 2, dots: 2 }, pic: 'The sizes of the cells are true here; each dot stands for one molecule.' },
    { phases: [{ to: { cam: 2, glu: 1, oxy: 1, pyr: 0.15 }, ms: 2000 }], labs: { mem: 1, tf: 1, glut: 2, o2: 2 } },
    { phases: [{ to: { cam: 3, glu: 1, pyr: 1, oxy: 0.25, nad: 0.2 }, ms: 2000 }], labs: { gly: 1, cyt: 1, pyr: 2 } },
    { phases: [{ to: { cam: 4, pyr: 1, oxy: 1, nad: 1, co2: 0.25, atp: 0.25 }, ms: 2000 }], labs: { mito: 1, matrix: 1, inner: 1, nadh: 2 } },
    { phases: [{ to: { cam: 5, co2: 1, atp: 1, glu: 0.45, oxy: 0.45, pyr: 0.45, nad: 0.35 }, ms: 2400 }], labs: { co2: 1, atp: 1, fib: 1, cap: 2 }, pic: 'Press a number to open its chapter, or Next to begin chapter 1.' }
  ];
  const vec = new THREE.Vector3();
  function draw(K, t) {
    /* red blood cells move along the capillary, single file */
    rbcs.forEach((r, i) => { const x = ((i * 4800 + t * 900) % 19200) - 9600; r.position.set(x, CAP.y - 200 + 160 * Math.sin(i * 1.7 + t * 0.5), CAP.z); });
    const set = (k, a) => { const p = paths[k]; p.mesh.material.uniforms.uA.value = a; p.mesh.material.uniforms.uT.value = t;
      p.dots.forEach((d, i) => { const f = ((i / p.dots.length) + t * (k === 'atp' ? 0.12 : 0.07)) % 1; P[k].getPointAt(f, vec); d.position.copy(vec); d.material.opacity = a; d.visible = a > 0.02; }); };
    set('glucose', K.glu); set('o2', K.oxy); set('pyr1', K.pyr); set('pyr2', K.pyr); set('nadh', K.nad); set('co2', K.co2); set('atp', K.atp);
    glyGlow.material.opacity = 0.35 + 0.35 * K.pyr + 0.1 * Math.sin(t * 2);
    beacons.forEach(b => { const on = b === hot; b.scale.setScalar(on ? 0.05 : 0.04); });
    const uK = 2 * Math.tan(THREE.MathUtils.degToRad(stage.cam.fov / 2)) / stage.H;
    Object.values(paths).forEach(p => { p.mesh.material.uniforms.uK.value = uK; });
  }
  const pick = ray => { const h = ray.intersectObjects(beacons, false)[0]; return h ? h.object.userData.ch : null; };
  const hover = ray => { const h = ray.intersectObjects(beacons, false)[0]; hot = h ? h.object : null; return !!hot; };
  return { group: g, knobs, views, steps, labels, draw, pick, hover, keepOut, turn: true,
    dispose() { disposeGroup(g); } };
}
