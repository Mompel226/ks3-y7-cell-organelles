/* ============================================================
   mitofilm.js — Explorer, beyond the Year 7 list: inside a mitochondrion (5 Nov 2026).
   Daniel, 5 Nov 2026: "see it from outside, then split it in two … the two membranes and the folded inner one"; the
   protons "collect" between the two membranes (in his words "one of the cisternae, if that's the correct name": the
   right name is the intermembrane space, so the film uses it and says what it means); "the pumps" quickly; ATP synthase,
   "a huge windmill": protons flowing through turn it, and ADP and phosphate become ATP, "very detailed … the students
   don't need to fully understand or know all of the terms". Like the gene-copy film (transcribe.js): its own 3D view, in
   steps that each wait for the pupil (memory animations-wait-for-the-reader), names on the picture on level lines, and
   nothing named before the picture shows it (memory name-it-on-the-picture). Every size is true, from the whole
   mitochondrion (2.7 µm) down to ATP synthase (about 25 nm tall) and its hydrogen ions: the camera zooms, nothing is
   made bigger (Daniel, the same day: "as close to relative size as possible"); a scale bar says how far.
   The same shapes as the game's mitochondrion (mitoparts.js): its cut face, its cristae, the magnified double membrane.
   The biology (memory biology-before-pedagogy), simplified, never false:
   - in the matrix the food molecules (from glucose) are broken down; their electrons pass along the pumps of the inner
     membrane (the electron transport chain: three of them pump), whose energy pumps hydrogen ions (H⁺, protons) from the
     matrix into the intermembrane space (inside the cristae too); at the last pump the electrons join oxygen and
     hydrogen ions: water;
   - the inner membrane's lipids do not let hydrogen ions back, so they collect; their only way back into the matrix is
     through ATP synthase: each turns its ring (8 c subunits in human ATP synthase) one eighth of a turn; the ring turns
     the central stalk inside the head (three αβ pairs); each third of a turn changes the shape of one β, which joins ADP
     and phosphate into ATP: three ATP each turn;
   - ATP synthases stand in pairs along the rims of the cristae (Davies et al. 2011, PNAS 108:14121).
   The numbers that drive every moment: z (where the camera is), open (the two halves apart), pump (the pumps working),
   fill (how many hydrogen ions have collected), turn (how many have passed through ATP synthase), so any moment can be
   drawn and nothing ever jumps.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { heroMito, heroPoint, along, nanoPatch, ATP_MEASURED, loadATP } from '../world/mitoparts.js?v=202611051508';

const R = window.REV, { $ } = R;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const H_COL = 0xff4f9a, E_COL = 0xfff07a;

/* a small molecule of the head: ADP or ATP (adenine, ribose and two or three phosphates) or one phosphate (nm) */
function nucleotide(np, mats) {
  const g = new THREE.Group();
  if (np > 0) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 6, 6), mats.base); ring.position.set(-0.62, 0.08, 0); g.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.06, 6, 5), mats.base); ring2.position.set(-0.92, 0.2, 0); g.add(ring2);
    const sugar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.055, 6, 5), mats.sugar); sugar.position.set(-0.28, -0.12, 0); g.add(sugar);
  }
  for (let i = 0; i < Math.max(1, np); i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), mats.p); p.position.set(np ? 0.05 + i * 0.36 : 0, np ? -0.12 : 0, 0); g.add(p); }
  return g;
}

function film(wrap) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.setClearColor(0x0d1238, 1);
  wrap.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.05, 500);
  scene.add(new THREE.HemisphereLight(0xb9b0ff, 0x1f5a6a, 1.2));
  const key = new THREE.DirectionalLight(0xffe7c9, 1.8); key.position.set(3, 5, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0x7fd8ff, 1.0); rim.position.set(-5, 2, -4); scene.add(rim);
  { /* a soft coloured sky for the glossy parts, as in the game */
    const pm = new THREE.PMREMGenerator(renderer), env = new THREE.Scene(); env.background = new THREE.Color(0x101436);
    const panel = (c, p, s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); env.add(m); };
    panel(0x8f7cff, [0, 10, 0], 14); panel(0x2fb39a, [0, -10, 0], 14); panel(0xffd27a, [10, 3, 6], 6); panel(0x7fd8ff, [-10, 2, -6], 8);
    scene.environment = pm.fromScene(env, 0.04).texture; pm.dispose();
  }
  /* the mitochondrion, lying across the view: its back half (with its cut face) and its front half (the same, turned
     over), which lifts away when it opens */
  const all = new THREE.Group(); all.rotation.z = -Math.PI / 2 + 0.18; scene.add(all);
  const back = heroMito(), front = heroMito(), HS = back.spec; all.add(back.group, front.group);
  front.group.scale.z = -1;
  const fronts = []; let frontFace = null;
  front.group.traverse(o => { if (o.material && !o.material.uniforms) { o.material = o.material.clone(); o.material.transparent = true; fronts.push(o.material); } else if (o.material) frontFace = o.material; });
  /* the magnified double membrane, at the crista the camera zooms into (the same place as in the game) */
  const PT = nanoPatch({ uc: 30, depth: HS.zoom.depthNm, lumen: HS.zoom.lumenNm });
  { const F = along(HS, HS.zoom.s), o = heroPoint(HS, HS.zoom.s, F.r, 0), g = PT.group;
    g.matrixAutoUpdate = false; g.matrix.makeBasis(new THREE.Vector3(F.t.x, F.t.y, 0), new THREE.Vector3(F.n.x, F.n.y, 0), new THREE.Vector3(0, 0, 1)).scale(new THREE.Vector3(0.001, 0.001, 0.001)).setPosition(o);
    back.group.add(g); }
  const G = PT.geo, SECT = back.section.userData.u;
  scene.updateMatrixWorld(true);
  const pW = (u, n, w = 0) => PT.group.localToWorld(new THREE.Vector3(u, n, w));
  const pD = (x, y, z) => new THREE.Vector3(x, y, z).transformDirection(PT.group.matrixWorld);
  const hW = (s, a, b = 0) => back.group.localToWorld(heroPoint(HS, s, a, b));
  /* hydrogen ions (H⁺): in the space inside the crista and between the membranes, where the pumps put them */
  const NH = 40, hMat = new THREE.MeshStandardMaterial({ color: H_COL, emissive: H_COL, emissiveIntensity: 0.9, roughness: 0.3 });
  const hs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 10, 8), hMat, NH); hs.frustumCulled = false; PT.group.add(hs);
  const rnd = (k, m) => { const x = Math.sin(k * 12.9898 + m * 78.233) * 43758.5453; return x - Math.floor(x); };
  const homes = [];
  for (let i = 0; i < NH; i++) {
    const inCrista = i % 3 !== 0;
    homes.push(inCrista ? new THREE.Vector3(G.uc + (rnd(i, 1) - 0.5) * (G.hw * 2 - 8), G.nB - 6 - rnd(i, 2) * (G.depth - 14), -0.6 - rnd(i, 3) * 9)
      : new THREE.Vector3(-40 + rnd(i, 4) * 64, -9.5 - rnd(i, 5) * 9, -0.6 - rnd(i, 6) * 9));
  }
  /* the hydrogen ions being pumped (matrix → intermembrane space, through a pump), and those flowing back through ATP
     synthase (intermembrane space → matrix), and the electrons passing from pump to pump */
  const pumpsAt = PT.parts.pumps.map(p => ({ x: p.x, n: p.n, w: p.w, wall: p.wall }));
  const NP = 9, flowH = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 10, 8), hMat, NP); flowH.frustumCulled = false; PT.group.add(flowH);
  const eMat = new THREE.MeshBasicMaterial({ color: E_COL, transparent: true }), eSpark = new THREE.InstancedMesh(new THREE.SphereGeometry(0.45, 10, 8), eMat, 4); eSpark.frustumCulled = false; PT.group.add(eSpark);
  /* electrons: from the first pump's arm in the matrix, inside the membrane to the third pump (carried by a small molecule
     in the lipids), then through the space inside the crista to the last (carried by a small protein) */
  const wx = G.uc - G.hw;
  const ePath = new THREE.CatmullRomCurve3([[wx - 13, pumpsAt[0].n + 6, -4], [wx - 1, pumpsAt[0].n, -4.2], [wx, (pumpsAt[0].n + pumpsAt[1].n) / 2, -4.4], [wx - 0.5, pumpsAt[1].n, -4.6], [wx + 4, (pumpsAt[1].n + pumpsAt[2].n) / 2, -4.2], [wx - 0.5, pumpsAt[2].n, -3.8]].map(p => new THREE.Vector3(...p)));
  /* ATP synthase: the left one of the pair is the one the camera visits; its hydrogen ions ride its ring */
  const AS = PT.parts.atp[0], rotor = AS.userData.rotor, rotor2 = PT.parts.atp[1].userData.rotor;
  const asW = (x, y, z) => AS.localToWorld(new THREE.Vector3(x, y, z));
  const RR = (AS.userData.ringR || 2.25) + 0.75;                /* the ring's outer face, where its hydrogen ions are held */
  const passH = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), hMat); passH.visible = false; AS.add(passH);
  /* the stream of hydrogen ions through it, a watermill (Daniel, 5 Nov 2026: in the animations online it is "churning …
     due to the proton flow … seeing the protons flowing and that triggering the turning … I would like to have it
     visualized"). Ion k waits in the crista's space, goes into the inlet beside subunit a while the ring is still, then
     the ring moves one eighth of a turn (in steps, one for each ion: 8 c subunits); 7 steps later the ion is at the
     outlet and leaves into the matrix. At every step one goes in and one comes out. S.turn counts the ions (eighths). */
  const NS = 15, streamH = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 10, 8), hMat, NS); streamH.frustumCulled = false; AS.add(streamH);
  const IN = 0.4, ringAt = T => Math.floor(T) + smooth(0.5, 1, T - Math.floor(T));   /* the ring: still, then one eighth */
  /* the way, in ATP synthase's frame (nm; +y towards the head, the crista's space at −y, +z towards the camera), through
     open water so that it is seen: from the middle of the crista's space (C) to the inlet's mouth (M) beside subunit a;
     out of the outlet (S7) to just above the membrane on the near side (E1), clear of the side arm, then into the matrix */
  const M = new THREE.Vector3(2.4, -5.2, 1.5), C = new THREE.Vector3(0.4, -9.0, 1.8), E1 = new THREE.Vector3(1.0, 3.8, 3.4);
  const ringSite = a => new THREE.Vector3(Math.cos(a) * RR, 0.4, Math.sin(a) * RR), S0 = ringSite(IN), S7 = ringSite(IN + 7 * Math.PI / 4);
  const ionAt = (k, T, out) => {                                     /* where ion k is, and how bright (0: not drawn) */
    const q = T - k;
    if (q < -3 || q >= 10) return 0;
    if (q < 0) { out.copy(M).lerp(C, -q / 3); out.x += 0.4 * Math.sin(2.3 * q + k); out.z += 0.5 * Math.cos(1.9 * q + 2 * k); return 1; }   /* waiting */
    if (q < 0.5) { out.copy(M).lerp(S0, smooth(0, 0.5, q)); return 1; }                                                          /* in, through subunit a */
    if (q < 7) { const a = IN + (ringAt(T) - k) * Math.PI / 4; out.set(Math.cos(a) * RR, 0.4, Math.sin(a) * RR); return 1; }     /* on the ring */
    if (q < 7.5) { out.copy(S7).lerp(E1, smooth(7, 7.5, q)); return 1; }                                                         /* out */
    const f = smooth(7.5, 10, q);
    out.copy(E1).lerp(new THREE.Vector3(-2.0 + 1.5 * Math.sin(k), 7.5, 4.2), f);
    return 1 - f;                                                    /* out in the matrix it fades among the others */
  };
  /* a soft glow round each (light, not size: memory true-relative-sizes), so that the stream is seen */
  const sGlow = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ map: null, size: 0.0026, sizeAttenuation: true, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sGlow.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 3), 3)); sGlow.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(NS * 3), 3));
  sGlow.frustumCulled = false; AS.add(sGlow);
  /* ADP and phosphate arrive at the head; ATP leaves it */
  const nMats = { base: new THREE.MeshStandardMaterial({ color: 0x6fa8ff, emissive: 0x2a4a9a, emissiveIntensity: 0.5, roughness: 0.4 }), sugar: new THREE.MeshStandardMaterial({ color: 0xf2f2ff, emissive: 0x404060, emissiveIntensity: 0.4, roughness: 0.4 }), p: new THREE.MeshStandardMaterial({ color: 0xffb02e, emissive: 0x7a4a00, emissiveIntensity: 0.6, roughness: 0.35 }) };
  /* the one being made now (or, for ATP, the newest one made) */
  const nowMade = () => made[Math.max(0, Math.floor(S.turn / (8 / 3) - 1e-6)) % 9];
  /* the followed ion is named only while it is seen: not inside subunit a, not behind the ring (a ray from the camera
     reaches it before any part of ATP synthase) */
  const sightRay = new THREE.Raycaster(), sightP = new THREE.Vector3();
  const inSight = o => { o.getWorldPosition(sightP); const d = sightP.clone().sub(cam.position), L = d.length(); sightRay.set(cam.position, d.normalize()); sightRay.far = L;
    return !sightRay.intersectObjects([AS.userData.rotor, AS.userData.stator], true).some(h => h.distance < L - 0.0003); };
  /* named only on the head's near side: one of the three sites faces away, behind the head, where a line cannot end on it */
  const seenMade = m => m.visible && m.position.z > -1.5;
  const halo = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const glow = (o, nm, color = 0xfff4d0) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.setScalar(nm * 3); sp.renderOrder = 9; o.add(sp); return o; };
  glow(passH, 0.9, 0xffb0d0); sGlow.material.map = halo;
  const made = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(() => { const g = new THREE.Group(), adp = nucleotide(2, nMats), pi = nucleotide(0, nMats), p3 = nucleotide(0, nMats); p3.position.set(0.77, -0.12, 0); g.add(adp, pi, p3); glow(adp, 1.6); glow(pi, 0.6); g.userData = { adp, pi, p3 }; g.visible = false; AS.add(g); return g; });

  /* ---------- names on the picture (HTML over the view), each on a level line that ends on its part ---------- */
  const tag = (html, side) => { const el = document.createElement('div'); el.className = 'cf__lab cf__lab--line mf__lab'; el.innerHTML = `<span>${html}</span><i></i>`; el.style.opacity = 0; el.dataset.side = side; wrap.appendChild(el); return el; };
  const each = (n, f) => () => Array.from({ length: n }, (_, i) => f(i / Math.max(1, n - 1)));
  const crista = (k, f) => { const c = HS.cristae[k], F = along(HS, c.s), a = c.f * (F.r - 0.029) * f * 2; return hW(c.s + (c.amp || 0) * Math.sin(a * c.k + c.ph) + (c.tilt || 0) * a, c.side * (F.r - 0.0255 - a)); };
  let tNow = 0;
  const hpos = (i, t) => homes[i].clone().add(new THREE.Vector3(Math.sin(t * 1.3 + i) * 0.6, Math.cos(t * 1.1 + i * 1.7) * 0.6, Math.sin(t * 0.9 + i * 2.3) * 0.4));
  const lumenIons = () => homes.map((h, i) => [h, i]).filter(([h, i]) => i % 3 !== 0 && i < Math.round(S.fill * NH) && h.y < -40 && h.y > -66).slice(0, 6).map(([h, i]) => PT.group.localToWorld(hpos(i, tNow)));
  /* each name: its side (l: left of its part), and the points of its part where its line may end */
  const LABS = {
    om: { el: tag('outer membrane', 'r'), pts: each(5, f => hW(HS.total * (0.25 + 0.5 * f), along(HS, HS.total * (0.25 + 0.5 * f)).r - 0.0035)) },
    om2: { el: tag('outer membrane', 'l'), pts: each(4, f => pW(-34 + 26 * f, -3.5, -0.4)) },
    im: { el: tag('inner membrane', 'l'), pts: each(5, f => hW(HS.total * (0.3 + 0.45 * f), along(HS, HS.total * (0.3 + 0.45 * f)).r - 0.0255)) },
    im2: { el: tag('inner membrane', 'l'), pts: each(4, f => pW(-34 + 26 * f, -25.5, -0.4)) },
    cr: { el: tag('a crista: one fold<br>of the inner membrane', 'r'), pts: () => [2, 4, 6, 8, 10].map(k => crista(k, 0.5)) },
    mx: { el: tag('matrix', 'l'), pts: () => [3, 5, 7, 9].map(k => hW((HS.cristae[k].s + HS.cristae[k + 1].s) / 2, 0)) },
    ims: { el: tag('intermembrane space', 'l'), pts: each(4, f => pW(-34 + 26 * f, -14.5, -0.4)) },
    lum: { el: tag('the space inside a crista:<br>part of it', 'r'), pts: each(4, f => pW(G.uc + 1.5, G.nB - 10 - 26 * f, -0.4)) },
    mx2: { el: tag('matrix', 'l'), pts: each(4, f => pW(-24 + 14 * f, -46 - 10 * f, -1)) },
    /* ON a pump: the first one's arm in the matrix, its part in the membrane, then the second pump (in front of each) */
    pump: { el: tag('a pump (a protein)', 'l'), pts: () => [pW(pumpsAt[0].x - 6.2, pumpsAt[0].n - 6.2, pumpsAt[0].w + 2), pW(pumpsAt[0].x - 1, pumpsAt[0].n + 4, pumpsAt[0].w + 2.5), pW(pumpsAt[1].x - 1.6, pumpsAt[1].n, pumpsAt[1].w + 2.5)] },
    hion: { el: tag('a hydrogen ion, H⁺', 'r'), pts: lumenIons },
    atp: { el: tag('ATP synthase', 'r'), pts: () => [asW(4.4, 12, 0), asW(4.4, 10.5, 0), asW(3.2, 14, 0)] },
    head: { el: tag('head: stays still', 'l'), pts: () => [asW(-4.4, 12.4, 0), asW(-4.2, 11, 0), asW(-3.6, 14, 0)] },
    stalk: { el: tag('stalk: turns', 'l'), pts: () => [asW(-0.9, 7.2, 0), asW(-0.9, 6.2, 0), asW(-0.9, 8.4, 0)] },
    ring: { el: tag('ring: turns', 'l'), pts: () => [asW(-3.0, 0.4, 0), asW(-3.0, -1.2, 0), asW(-3.0, 1.6, 0)] },
    side: { el: tag('side arm: holds the head', 'r'), pts: () => [asW(5.7, 6.5, 0.3), asW(5.7, 9, 0.3), asW(5.5, 4, 0.2)] },
    hpass: { el: tag('a hydrogen ion, H⁺', 'r'), pts: () => passH.visible && inSight(passH) ? [passH.getWorldPosition(new THREE.Vector3())] : [] },
    adp: { el: tag('ADP', 'l'), pts: () => { const m = nowMade(); return seenMade(m) ? [m.userData.adp.localToWorld(new THREE.Vector3(-0.75, 0.15, 0))] : []; } },
    pi: { el: tag('phosphate', 'r'), pts: () => { const m = nowMade(); return seenMade(m) ? [m.userData.pi.getWorldPosition(new THREE.Vector3())] : []; } },
    atpm: { el: tag('ATP', 'r'), pts: () => { const m = nowMade(); return seenMade(m) ? [m.userData.adp.localToWorld(new THREE.Vector3(0.6, -0.12, 0))] : []; } }
  };
  const bar = document.createElement('div'); bar.className = 'cf__bar mf__bar'; bar.innerHTML = '<i></i><b></b>'; wrap.appendChild(bar);
  const v = new THREE.Vector3(), proj = p => { v.copy(p).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z < 1]; };

  /* ---------- the camera: a path of views, from the whole mitochondrion to one ATP synthase ---------- */
  const views = () => {
    const nT = new THREE.Vector3(0, 0, 1).transformDirection(back.group.matrixWorld), out = pD(0, 1, 0);
    return [
      { at: hW(HS.total / 2, 0, 0.1), dist: 4.4, dir: new THREE.Vector3(0.18, 0.42, 1).normalize(), up: new THREE.Vector3(0, 1, 0) },
      { at: hW(HS.total / 2, 0, 0), dist: 3.7, dir: nT.clone().add(new THREE.Vector3(0.05, 0.12, 0)).normalize(), up: new THREE.Vector3(0, 1, 0) },
      { at: pW(-8, -12, -2), dist: 0.15, dir: nT, up: out },
      { at: pW(6, -50, -3), dist: 0.115, dir: nT, up: out },
      { at: asW(0.8, 7.5, 0), dist: 0.05, dir: nT, up: out }
    ];
  };
  let VW = views();
  const camAt = z => {
    const i = Math.max(0, Math.min(VW.length - 2, Math.floor(z))), k = Math.max(0, Math.min(1, z - i)), A = VW[i], B = VW[i + 1];
    const d = A.dist * Math.pow(B.dist / A.dist, k), g = Math.abs(A.dist - B.dist) > 1e-9 ? (A.dist - d) / (A.dist - B.dist) : k;
    return { at: A.at.clone().lerp(B.at, g), d, dir: A.dir.clone().lerp(B.dir, smooth(0, 0.8, k)).normalize(), up: A.up.clone().lerp(B.up, smooth(0.1, 0.8, k)).normalize() };
  };

  let alive = true, W = 1, H = 1;
  const size = () => {
    W = wrap.clientWidth; H = Math.max(200, wrap.clientHeight || Math.min(380, W * 0.62));
    renderer.setSize(W, H); cam.aspect = W / H;
    /* a narrow view (a phone) sees as much across as a wide one: the view widens */
    cam.fov = W / H < 1.25 ? 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(16)) * 1.25 / (W / H)) * 180 / Math.PI : 32;
    cam.updateProjectionMatrix();
  };
  size(); addEventListener('resize', size);
  const S = { z: 0, open: 0, pump: 0, fill: 0, turn: 0, chem: 0, labs: {}, next: null, from: null, to: null, t0: 0, ms: 0, done: null, lin: false };
  const NUM = ['z', 'open', 'pump', 'fill', 'turn', 'chem'];
  const fade = {};
  const t0 = performance.now();
  const tmpM = new THREE.Matrix4(), zero = new THREE.Matrix4().makeScale(0, 0, 0), tq = new THREE.Quaternion(), ts = new THREE.Vector3(1, 1, 1), tv = new THREE.Vector3();
  const loop = () => {
    if (!alive) return;
    const now = performance.now(), k = S.ms ? Math.min(1, (now - S.t0) / S.ms) : 1, e = k * k * (3 - 2 * k);
    if (S.from) NUM.forEach(n => { S[n] = S.from[n] + (S.to[n] - S.from[n]) * (n === 'turn' && S.lin ? k : e); });
    const t = tNow = R.FAST ? 0 : (now - t0) / 1000;
    /* the front half lifts away like a lid and fades */
    const o = S.open;
    front.group.position.set(0, 0, 0.9 * o); front.group.rotation.set(-1.0 * o, 0, 0); front.group.position.y = 0.4 * o;
    fronts.forEach(m => { m.opacity = 1 - smooth(0.25, 0.9, o); m.depthWrite = o < 0.5; });
    if (frontFace) frontFace.uniforms.uFade.value = 1 - smooth(0.2, 0.75, o);
    front.group.visible = o < 0.99;
    /* the camera, and the magnified view taking over from the cut face as it comes close */
    const C = camAt(S.z);
    cam.position.copy(C.at).addScaledVector(C.dir, C.d); cam.up.copy(C.up); cam.lookAt(C.at);
    cam.near = Math.max(2e-5, Math.min(0.05, C.d / 30)); cam.far = Math.max(12, C.d * 2500); cam.updateProjectionMatrix();
    PT.group.visible = C.d < 0.6;
    SECT.uHole.value.set(HS.zoom.s, 0.076, 0.135, smooth(0.5, 0.2, C.d));
    /* close in, the mitochondrion's own membranes as surfaces are hidden: they stood as thin bands in front of the
       magnified membranes (the water behind the magnified view hides everything further back) */
    back.parts.outer.visible = back.parts.inner.visible = C.d >= 0.12;
    PT.parts.back.material.uniforms.uA.value = smooth(0.3, 0.12, C.d); PT.parts.back.material.depthWrite = C.d < 0.13;
    /* hydrogen ions: the pumps put them into the space inside the crista; they collect (fill) */
    const nh = Math.round(S.fill * NH);
    for (let i = 0; i < NH; i++) {
      if (i >= nh) { hs.setMatrixAt(i, zero); continue; }
      const p = hpos(i, t);
      tmpM.compose(p, tq, ts); hs.setMatrixAt(i, tmpM);
    }
    hs.instanceMatrix.needsUpdate = true;
    /* while the pumps work: electrons pass from pump to pump, and each pump moves hydrogen ions across */
    for (let i = 0; i < 4; i++) {
      if (S.pump < 0.02) { eSpark.setMatrixAt(i, zero); continue; }
      const f = ((t * 0.32 + i / 4) % 1); tmpM.compose(ePath.getPointAt(f), tq, ts); eSpark.setMatrixAt(i, tmpM);
    }
    eSpark.instanceMatrix.needsUpdate = true; eMat.opacity = S.pump;
    for (let i = 0; i < NP; i++) {
      const pm = pumpsAt[i % 3], f = ((t * 0.45 + i * 0.37) % 1);
      if (S.pump < 0.02) { flowH.setMatrixAt(i, zero); continue; }
      /* from the matrix, through the pump (its wall), into the crista's inside */
      const out = pm.wall, a = new THREE.Vector3(pm.x + out * 9, pm.n + 2, pm.w + 1.5), b = new THREE.Vector3(pm.x, pm.n, pm.w + 1.2), c = new THREE.Vector3(pm.x - out * 4, pm.n - 2, pm.w + 1.2);   /* out: the matrix side */
      const p = f < 0.5 ? a.lerp(b, f * 2) : b.lerp(c, (f - 0.5) * 2);
      tmpM.compose(p, tq, ts); flowH.setMatrixAt(i, tmpM);
    }
    flowH.instanceMatrix.needsUpdate = true;
    /* ATP synthase: one eighth of a turn for each hydrogen ion through it; the other of the pair turns too */
    const T = S.turn, ang = ringAt(T) * Math.PI / 4;
    rotor.rotation.y = -ang; rotor2.rotation.y = ang;
    /* the stream, once the hydrogen ions have collected (the fourth step on): those waiting, on the ring, leaving */
    const k0 = Math.floor(T);
    for (let j = 0; j < NS; j++) {
      const k = k0 - 10 + ((j - (k0 - 10)) % NS + NS) % NS, sz = S.fill > 0.5 ? ionAt(k, T, tv) : 0;
      const gp = sGlow.geometry.attributes.position, gc = sGlow.geometry.attributes.color;
      if (!sz) { streamH.setMatrixAt(j, zero); gc.setXYZ(j, 0, 0, 0); continue; }
      tmpM.compose(tv, tq, ts.setScalar(sz)); streamH.setMatrixAt(j, tmpM);
      gp.setXYZ(j, tv.x, tv.y, tv.z); gc.setXYZ(j, 1.0 * sz, 0.5 * sz, 0.78 * sz);
    }
    ts.setScalar(1); streamH.instanceMatrix.needsUpdate = true; sGlow.geometry.attributes.position.needsUpdate = sGlow.geometry.attributes.color.needsUpdate = true;
    /* the ONE followed, brighter: ion 0, then 8, then 16 (8 a turn, so each rides 7 of the others' steps) */
    { const kf = 8 * Math.floor((T - 1e-6) / 8), on = T > 0.01 && T < 24 && ionAt(kf, T, passH.position) > 0;
      passH.visible = !!on; }
    /* ADP and phosphate join into ATP at the head: one for each third of a turn, which then leaves */
    made.forEach((m, j) => {
      const d = S.turn - j * 8 / 3, kk = d < 23.4 ? d : ((d + 0.6) % 24) - 0.6;   /* 0 … 8/3 while this one is made (then again, every 3 turns) */
      m.visible = S.chem > 0.5 && kk > -0.6 && kk < 8 / 3 + 1.6;
      if (!m.visible) return;
      /* on the head's surface: the measured head reaches 5 to 6.4 nm from its axis (the drawn one, 4.9) */
      const site = (j % 3) * 2 * Math.PI / 3 + Math.PI / 3, rr = AS.userData.measured ? 6.7 : 4.9;
      const arrive = smooth(-0.6, 0.6, kk), join = smooth(1.4, 2.4, kk), leave = smooth(8 / 3, 8 / 3 + 1.6, kk);
      const sp = new THREE.Vector3(Math.cos(site) * rr, 12 + 1.2, Math.sin(site) * rr), far = sp.clone().multiplyScalar(1.6).setY(16 + 3 * leave);
      m.position.copy(far).lerp(sp, arrive * (1 - leave)).add(new THREE.Vector3(0, 4 * leave, 0));
      m.userData.pi.position.set(1.6 - 0.83 * join, 0.4 - 0.52 * join, 0); m.userData.p3.visible = false; m.userData.pi.visible = true;
    });
    renderer.render(scene, cam);
    overlay(C);
    if (k >= 1 && S.done) { const d = S.done; S.done = null; d(); }
    requestAnimationFrame(loop);
  };
  function overlay(C) {
    const narrow = W < 520, placed = [{ l: 0, r: 170, t: H - 46, b: H }];   /* the scale bar's corner */
    const keys = Object.keys(LABS).sort((a, b) => (S.labs[a] || 9) - (S.labs[b] || 9));
    keys.forEach(key => {
      const L = LABS[key], el = L.el, wantIt = !!S.labs[key] && !(narrow && S.labs[key] > 1);
      let at = null;
      if (wantIt) {
        L.w = L.w || el.offsetWidth; L.h = L.h || el.offsetHeight;
        const pts = L.pts().map(proj).filter(p => p[2] && p[0] > 6 && p[0] < W - 6 && p[1] > 12 && p[1] < H - 12);
        const pref = el.dataset.side, sides = [pref, pref === 'l' ? 'r' : 'l'];
        /* this side first, the nearest gap first: a box beside the point, on its level line, clear of every other name */
        search: for (const sd of sides) for (const gap of [26, 56, 96]) for (const p of pts) {
          const l = sd === 'l' ? p[0] - gap - L.w : p[0] + gap, box = { l, r: l + L.w, t: p[1] - L.h / 2, b: p[1] + L.h / 2 };
          if (box.l < 6 || box.r > W - 6 || box.t < 4 || box.b > H - 4) continue;
          const line = sd === 'l' ? { l: box.r, r: p[0], t: p[1] - 1, b: p[1] + 1 } : { l: p[0], r: box.l, t: p[1] - 1, b: p[1] + 1 };
          if (placed.some(o => (box.l < o.r + 6 && box.r > o.l - 6 && box.t < o.b + 4 && box.b > o.t - 4) || (line.l < o.r && line.r > o.l && line.t < o.b && line.b > o.t))) continue;
          at = { sd, gap, p, box }; break search;
        }
      }
      fade[key] = (fade[key] || 0) + ((at ? 1 : 0) - (fade[key] || 0)) * (R.FAST || !at ? 1 : 0.14);
      el.style.opacity = fade[key].toFixed(3); el.style.visibility = at && fade[key] > 0.01 ? 'visible' : 'hidden';
      if (!at) return;
      placed.push(at.box, at.sd === 'l' ? { l: at.box.r, r: at.p[0], t: at.p[1] - 1, b: at.p[1] + 1 } : { l: at.p[0], r: at.box.l, t: at.p[1] - 1, b: at.p[1] + 1 });
      el.classList.toggle('mf__lab--r', at.sd === 'r'); el.lastChild.style.width = at.gap + 'px';
      el.style.transform = `translate(${(at.sd === 'l' ? at.box.l : at.p[0]).toFixed(1)}px, ${at.p[1].toFixed(1)}px) translate(0, -50%)`;
    });
    /* the scale bar: a round length, 60 to 150 pixels long, at the bottom left */
    const pxPer = (H / 2) / (C.d * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));     /* pixels per µm at the point looked at */
    const L = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2].find(x => x * pxPer >= 60) || 2;
    bar.firstChild.style.width = (L * pxPer).toFixed(1) + 'px';
    const txt = L >= 1 ? L + ' µm' : Math.round(L * 1000) + ' nm'; if (bar.lastChild.textContent !== txt) bar.lastChild.textContent = txt;
    bar.style.transform = `translate(14px, ${H - 34}px)`;
  }
  loop();
  return {
    go(to) {
      return new Promise(res => {
        if (to.chem != null) S.chem = to.chem;
        S.from = {}; NUM.forEach(n => { S.from[n] = S[n]; }); S.to = Object.assign({}, S.from, to);
        const moves = (to.z != null && to.z !== S.z) || (to.open != null && to.open !== S.open);
        if (moves) { S.labs = {}; S.next = to.labs || {}; } else if (to.labs) S.labs = to.labs;
        S.lin = !!to.lin; S.t0 = performance.now(); S.ms = R.FAST ? 0 : (to.ms || 1400);
        S.done = () => { if (S.next) { S.labs = S.next; S.next = null; } res(); };
      });
    },
    stop() { alive = false; removeEventListener('resize', size); renderer.dispose(); renderer.domElement.remove(); }
  };
}

const STEPS = [
  { t: 'This is one mitochondrion, seen from outside: about 2.7 <dfn data-w="micrometre">micrometres</dfn> (µm) long. Its outside is smooth: the outer membrane.', go: { labs: { om: 1 } } },
  { t: 'Now it is cut in two. A mitochondrion has two membranes; here they look like one line, because they are only 15 nm apart. The inner membrane is folded: each fold is a <dfn data-w="cristae">crista</dfn> (two or more: cristae). Inside the inner membrane is the <dfn data-w="matrix">matrix</dfn>, a thick liquid.', go: { z: 1, open: 1, ms: 3200, labs: { om: 1, im: 1, cr: 1, mx: 2 } } },
  { t: 'Closer, at the edge: between the two membranes is a narrow space, about 15 <dfn data-w="nanometre">nanometres</dfn> (nm) wide. It is the <dfn data-w="intermembrane-space">intermembrane space</dfn> ("inter" means between). The space inside each crista is part of it.', go: { z: 2, ms: 3600, labs: { om2: 1, im2: 1, ims: 1, lum: 2 } } },
  { t: 'Closer again, on a crista: each membrane is two layers of lipids, with proteins in it. In the matrix, the smaller molecules from glucose are broken down. Their electrons pass from one protein to the next: the <dfn data-w="electron-transport-chain">electron transport chain</dfn>. These proteins use the energy to pump <dfn data-w="hydrogen-ion">hydrogen ions</dfn> (H⁺) out of the matrix, into the space inside the crista.', go: { z: 3, pump: 1, fill: 0.2, ms: 3600, labs: { pump: 1, mx2: 2 } } },
  { t: 'The hydrogen ions collect in the intermembrane space: soon there are more there than in the matrix. They cannot cross the lipids again.\nThere are far fewer free hydrogen ions than drawn here: we show more, so that you can follow them.', go: { fill: 1, ms: 4200, labs: { hion: 1, mx2: 2 } } },
  { t: 'There is one way back for them: through <dfn data-w="atp-synthase">ATP synthase</dfn>, a protein that stands in pairs on the rim of each crista. Its parts: a ring in the membrane, a stalk, a head (three pairs of parts, in two colours) and a side arm.', src: 1, go: { z: 4, pump: 0.35, ms: 3600, labs: { atp: 1, head: 1, stalk: 1, ring: 1, side: 2 } } },
  { t: 'Hydrogen ions return to the matrix through ATP synthase, one at a time. Each one turns the ring and the stalk an eighth of a turn, like water turning a watermill. Eight hydrogen ions make one full turn.\nFollow the bright one: in from the crista, round with the ring, out into the matrix.', go: { turn: 8, ms: 8 * 900, lin: true, labs: { hpass: 1, ring: 1, stalk: 2 } } },
  { t: 'The stalk turns inside the head, which does not turn. Each third of a turn changes the shape of the head\'s parts: in one of them, ADP and phosphate join into <dfn data-w="atp">ATP</dfn> (ADP is ATP with one phosphate fewer). One turn makes three ATP.', go: { turn: 15, chem: 1, ms: 7 * 950, lin: true, labs: { adp: 1, pi: 1, head: 2 } } },
  { t: 'ATP carries the energy to the jobs of the cell: joining amino acids, making lipids, moving vesicles. In the game, the energy bar counts it.\nAll of this happens in each of your mitochondria, again and again, every second.', go: { turn: 24, ms: 9 * 700, lin: true, labs: { atpm: 1, hpass: 2 } } },
  { t: 'The hydrogen ions flow through all the time, so ATP synthase keeps turning, like a watermill turned by flowing water: each hydrogen ion that enters turns it an eighth of a turn.\nIn a living cell it turns much faster than this: many times every second.', go: { turn: 56, ms: 8000, lin: true, labs: {} } }
];
const paras = t => t.split('\n').map(x => `<p>${x}</p>`).join('');

/* the film, in its own window over the world; resolves when it is closed (watched to the end, or not) */
export function openMitoFilm({ last = 'Back to the mitochondrion' } = {}) {
  return new Promise(done => {
    let box = $('#mitofilm');
    if (!box) { box = document.createElement('div'); box.className = 'lens'; box.id = 'mitofilm'; $('#stage').appendChild(box); }
    box.innerHTML = `<div class="lens__card cf mf" role="dialog" aria-modal="true" aria-labelledby="mf-h">
      <div class="lens__top"><h2 id="mf-h">🔬 Inside a mitochondrion</h2><button type="button" class="close-x" aria-label="Close">×</button></div>
      <div class="cf__grid"><div class="lens__3d cf__3d mf__3d"></div><div class="cf__side">
      <p class="cf__x">Explorer: beyond the Year 7 list</p>
      <p class="cf__n" aria-live="polite"></p><div class="cf__t" aria-live="polite"></div>
      <p class="mf__src" hidden></p>
      <p class="mf__note">Everything is drawn at its true size compared with everything else: the camera zooms in. The bar at the bottom left shows the scale.</p>
      <div class="cf__do"><button type="button" class="btn next pulse">Next step →</button></div>
    </div></div></div>`;
    box.hidden = false;
    loadATP().then(() => { if (!box.hidden) start(); });
    const start = () => {
    const F = film($('.mf__3d', box)), nEl = $('.cf__n', box), tEl = $('.cf__t', box), btn = $('.cf__do .btn', box), srcEl = $('.mf__src', box);
    let i = 0, busy = false;
    const close = () => { F.stop(); box.hidden = true; box.innerHTML = ''; document.removeEventListener('keydown', esc1); done(); };
    const esc1 = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc1);
    $('.close-x', box).addEventListener('click', close);
    const show = async () => {
      const s = STEPS[i]; busy = true; btn.disabled = true;
      nEl.textContent = `${i + 1} of ${STEPS.length}`;
      tEl.innerHTML = paras(s.t);
      srcEl.hidden = !s.src; srcEl.textContent = !s.src ? '' : ATP_MEASURED ? 'Its real shape, measured with an electron microscope: human ATP synthase (Lai and others, 2023, Molecular Cell).'
        : 'Its parts are where the measured shape has them (human ATP synthase: Lai and others, 2023, Molecular Cell); their outlines are simpler.';
      if (R.terms) R.terms(tEl);
      if (s.go) await F.go(s.go);
      busy = false; btn.disabled = false;
      btn.textContent = i === STEPS.length - 1 ? last + ' →' : 'Next step →'; btn.focus({ preventScroll: true });
    };
    btn.addEventListener('click', () => { if (busy) return; if (i === STEPS.length - 1) { close(); return; } i++; show(); });
    show();
    };
  });
}
