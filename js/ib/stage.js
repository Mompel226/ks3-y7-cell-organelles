/* ============================================================
   stage.js — the 3D picture of the IB view (5 Nov 2026): one renderer, a camera that zooms (never a thing made bigger:
   memory true-relative-sizes), names on the picture on ONE level line that ends ON its part and never crosses another
   (memory label-lines-never-cross), shown only when the picture is at rest (names that move are "very annoying"), glucose's
   carbons numbered on their atoms, and a scale bar that says how far the camera has zoomed.
   Units: nm everywhere (a chapter that shows a whole mitochondrion uses nm too: 700 nm across).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';

export const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/* a soft glow round a small thing (light, not size), so that pupils find it */
let haloTex = null;
export function halo() {
  if (haloTex) return haloTex;
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  haloTex = new THREE.CanvasTexture(c); haloTex.colorSpace = THREE.SRGBColorSpace; haloTex.userData.shared = true; return haloTex;
}
/* free a chapter's group (the shared glow texture stays) */
export function disposeGroup(g) {
  g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map && !(m.map.userData && m.map.userData.shared)) m.map.dispose(); m.dispose(); }); });
}
export function glow(size, color = 0xfff4d0, opacity = 1) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo(), color, transparent: true, depthWrite: false, opacity, blending: THREE.AdditiveBlending }));
  sp.scale.setScalar(size); sp.renderOrder = 9; return sp;
}

export function makeStage(wrap, { onFrame } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: false });
  /* at most 1.75 pixels per point, as the game draws (world.js); a slow computer drops to 1 (measure, below) */
  renderer.setPixelRatio(Math.min(1.75, devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.setClearColor(0x070a1f, 1);
  renderer.domElement.className = 'ibv__canvas';
  wrap.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(34, 1, 0.01, 5000);
  scene.add(new THREE.HemisphereLight(0xc9c2ff, 0x1f4a5a, 1.15));
  const key = new THREE.DirectionalLight(0xfff1dc, 1.9); key.position.set(3, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0x86d6ff, 0.9); rim.position.set(-6, 2, -5); scene.add(rim);
  { /* a soft coloured sky for the glossy parts */
    const pm = new THREE.PMREMGenerator(renderer), env = new THREE.Scene(); env.background = new THREE.Color(0x0e1236);
    const panel = (c, p, s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); env.add(m); };
    panel(0x8f7cff, [0, 10, 0], 14); panel(0x2fb39a, [0, -10, 0], 14); panel(0xffd27a, [10, 3, 6], 6); panel(0x7fd8ff, [-10, 2, -6], 8);
    scene.environment = pm.fromScene(env, 0.04).texture; pm.dispose();
  }
  scene.fog = new THREE.FogExp2(0x070a1f, 0.0);
  /* the overlay: names, glucose's carbon numbers, the scale bar */
  const labs = document.createElement('div'); labs.className = 'ibv__labs'; wrap.appendChild(labs);
  const nums = document.createElement('div'); nums.className = 'ibv__nums'; wrap.appendChild(nums);
  const bar = document.createElement('div'); bar.className = 'ibv__bar'; bar.innerHTML = '<i></i><b></b>'; wrap.appendChild(bar);
  /* an overview above the picture, for a chapter that asks for one (glycolysis's row of enzymes, the Krebs cycle): a camera
     of its own, far away, in a band across the top. It sees layer 1 (what the chapter draws for it) and never layer 0, so
     the close-up below shows the molecules and the band the map (Daniel, 6 Nov 2026: "see what's happening into the
     molecule big below ... and at the same time to really clearly know in which stage you are") */
  const ocam = new THREE.PerspectiveCamera(26, 1, 1, 5000); ocam.layers.disableAll(); ocam.layers.enable(1);
  const ovRoot = document.createElement('div'); ovRoot.className = 'ibv__ov'; ovRoot.hidden = true; wrap.appendChild(ovRoot);
  const ovBar = document.createElement('div'); ovBar.className = 'ibv__bar ibv__bar--ov'; ovBar.innerHTML = '<i></i><b></b>';
  let ov = null, ovH = 0, ovD = 1;
  let W = 1, H = 1;
  const size = () => {
    W = Math.max(50, wrap.clientWidth); H = Math.max(120, wrap.clientHeight);
    renderer.setSize(W, H);
    const nar = W < 560;
    ovH = ov ? Math.round(Math.max(nar ? 110 : 150, Math.min(nar ? 170 : (ov.max || 280), H * ((nar ? ov.fracN : ov.frac) || (nar ? 0.3 : 0.34))))) : 0;
    const h = H - ovH; cam.aspect = W / h;
    /* a narrow picture (a phone) sees as much across as a wide one */
    cam.fov = W / h < 1.3 ? 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(17)) * 1.3 / (W / h)) * 180 / Math.PI : 34;
    cam.updateProjectionMatrix();
    wrap.style.setProperty('--ovh', ovH + 'px'); ovRoot.style.height = ovH + 'px'; ovRoot.hidden = !ov;
    if (ov) fitOv();
  };
  /* the overview's camera: at its middle, far enough for its width to fit across the band (a band that is a drawing, with
     no view, has none) */
  function fitOv() {
    if (!ov.view) return;
    const a = W / Math.max(1, ovH), t = Math.tan(THREE.MathUtils.degToRad(ocam.fov / 2));
    ocam.aspect = a; ovD = (ov.width / 2) / (t * a) * 1.04;
    ocam.position.copy(ov.view.at).addScaledVector(ov.view.dir.clone().normalize(), ovD); ocam.up.copy(ov.view.up); ocam.lookAt(ov.view.at);
    ocam.near = ovD / 30; ocam.far = ovD * 30; ocam.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(size); ro.observe(wrap); size();

  /* ---------------- the camera: a view is { at, dist, dir (from at towards the camera), up } ---------------- */
  const view = { at: V(), dist: 10, dir: V(0, 0, 1), up: V(0, 1, 0) };
  function setView(v) {
    view.at.copy(v.at); view.dist = v.dist; view.dir.copy(v.dir).normalize(); view.up.copy(v.up).normalize();
    cam.position.copy(view.at).addScaledVector(view.dir, view.dist); cam.up.copy(view.up); cam.lookAt(view.at);
    cam.near = Math.max(0.002, view.dist / 60); cam.far = Math.max(60, view.dist * 60); cam.updateProjectionMatrix();
    scene.fog.density = 0.55 / (view.dist * 6);
  }
  /* between two views: the distance changes by the same factor each moment (a zoom feels even), the point looked at with it */
  function between(A, B, k) {
    const d = A.dist * Math.pow(B.dist / A.dist, k), g = Math.abs(A.dist - B.dist) > 1e-9 ? (A.dist - d) / (A.dist - B.dist) : k;
    return { at: A.at.clone().lerp(B.at, g), dist: d, dir: A.dir.clone().lerp(B.dir, smooth(0, 0.85, k)).normalize(), up: A.up.clone().lerp(B.up, smooth(0.1, 0.85, k)).normalize() };
  }
  /* a view may say what it must hold (fit: { pts: [[|x| across, |y| up, z towards the camera], …] round the point looked
     at, min, side }): the distance at which every point lies in the close-up, with room round them for the names, at this
     screen's shape (6 Nov 2026: at two-lane stations the second molecule lay at the picture's edge, cut, and unnamed on a
     phone). A picture much taller than the screen allows (two lanes one above the other, on a phone) is turned a quarter
     round, its `side` up, when that shows it at least a third larger */
  function fitView(v) {
    const f = v.fit, h = H - ovH, key = W + 'x' + h;
    if (f._k !== key) {
      const nar = W < 560, t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), a = W / h;
      /* the margins the names stand in: beside the molecules on a wide screen, above and below them on a phone */
      const mx = nar ? 18 : Math.min(250, W * 0.2), my = nar ? 44 : 32;
      const kx = (W / 2) / (t * a * Math.max(20, W / 2 - mx)), ky = (h / 2) / (t * Math.max(20, h / 2 - my));
      let d0 = f.min || 0, d1 = d0;
      for (const p of f.pts) { d0 = Math.max(d0, p[2] + p[0] * kx, p[2] + p[1] * ky); d1 = Math.max(d1, p[2] + p[1] * kx, p[2] + p[0] * ky); }
      f._roll = !!f.side && d1 * 1.3 < d0; f._d = f._roll ? d1 : d0; f._k = key;
    }
    return f._roll ? { dist: f._d, up: f.side } : { dist: f._d };
  }
  /* the close-up lies below the overview's band (ovH: 0 without one) */
  const pxPerNm = () => ((H - ovH) / 2) / (view.dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
  const pv = new THREE.Vector3();
  const project = p => { pv.copy(p).project(cam); return [(pv.x + 1) / 2 * W, ovH + (1 - pv.y) / 2 * (H - ovH), pv.z < 1 && pv.z > -1]; };
  const projectOv = p => { pv.copy(p).project(ocam); return [(pv.x + 1) / 2 * W, (1 - pv.y) / 2 * ovH, pv.z < 1 && pv.z > -1]; };
  const ovPxPerNm = () => (ovH / 2) / (ovD * Math.tan(THREE.MathUtils.degToRad(ocam.fov / 2)));

  /* ---------------- names on level lines ---------------- */
  const L = {};            /* key → { el, html, side, pts(), lv } */
  let want = {}, rest = false, keepOut = [], avoid = [];
  function defineLabels(defs) {
    Object.keys(L).forEach(k => { L[k].el.remove(); delete L[k]; });
    Object.keys(defs).forEach(k => {
      const d = defs[k], el = document.createElement('div');
      el.className = 'ibv__lab' + (d.lv === 'x' ? ' ibv__lab--x' : '') + (d.cls ? ' ' + d.cls : '');
      el.innerHTML = `<span>${d.html}</span><i></i>`; el.style.opacity = 0; el.style.visibility = 'hidden'; labs.appendChild(el);
      L[k] = Object.assign({ el, f: 0 }, d);
    });
  }
  function showLabels(map) { want = map || {}; }
  /* a name's size is measured once, and again when the page's fonts arrive (the comparison, 5 Nov 2026: names measured
     in the stand-in font kept lines a few pixels too long or short) */
  const refit = () => Object.values(L).forEach(D => { D.w = D.h = 0; });
  if (document.fonts) document.fonts.addEventListener('loadingdone', refit);
  function placeLabels() {
    const narrow = W < 560, placed = keepOut.slice(), soft = numBoxes;
    placed.push({ l: 0, r: 190, t: H - 46, b: H });                  /* the scale bar's corner */
    const keys = Object.keys(L).sort((a, b) => (want[a] || 9) - (want[b] || 9));
    /* no name covers an atom (6 Nov 2026: the ATP's name stood on the ATP); a phone's name ON its part may cover only its
       own molecule */
    const av = rest && avoid.length ? avoid.map(a => { const q = project(a.p); return q[2] ? { x: q[0], y: q[1], id: a.id, h: a.h } : null; }).filter(Boolean) : [];
    const ar = Math.max(3, 0.06 * pxPerNm() + 1);    /* an atom's drawn radius (mol.js ELR, about 0.05 nm), and a little more */
    const covers = (box, own) => av.some(a => a.id !== own && a.x > box.l - ar && a.x < box.r + ar && a.y > box.t - ar && a.y < box.b + ar);
    /* nor does its line pass over an atom (but the one it names, and that one's own hydrogens beside it): which molecule a
       name is for must be plain */
    const crossesAtoms = (ln, p, own) => av.some(a => a.x > ln.l + 2 && a.x < ln.r - 2 && Math.abs(a.y - p[1]) < ar + 2 && Math.hypot(a.x - p[0], a.y - p[1]) > 4 && !(a.id === own && a.h && Math.hypot(a.x - p[0], a.y - p[1]) < 16));
    for (const k of keys) {
      const D = L[k], el = D.el, on = rest && !!want[k] && !(narrow && want[k] > 1);
      let at = null; const why = { pts: 0, edge: 0, name: 0, num: 0, atom: 0 };
      if (on) {
        D.w = D.w || el.offsetWidth; D.h = D.h || el.offsetHeight;
        const pts = (D.pts() || []).map(project).filter(p => p[2] && p[0] > 8 && p[0] < W - 8 && p[1] > ovH + 14 && p[1] < H - 14);
        const pref = D.side || 'r', sides = [pref, pref === 'l' ? 'r' : 'l'];
        /* among molecules (a chapter that names its atoms, setAvoid), a name's line starts at its molecule's edge on that
           side, so that it crosses none of its own atoms */
        const byX = av.length ? { l: pts.slice().sort((a, b) => a[0] - b[0]), r: pts.slice().sort((a, b) => b[0] - a[0]) } : { l: pts, r: pts };
        /* a main name tries longer lines before it gives up (the expert review: main names had been dropped silently) */
        search: for (const sd of sides) for (const gap of (want[k] === 1 ? (narrow ? [10, 24, 52, 90, 140] : [24, 52, 90, 140, 200, 270]) : [24, 52, 90, 140])) for (const p of byX[sd]) {
          const l = sd === 'l' ? p[0] - gap - D.w : p[0] + gap, box = { l, r: l + D.w, t: p[1] - D.h / 2, b: p[1] + D.h / 2 };
          if (box.l < 6 || box.r > W - 6 || box.t < ovH + 4 || box.b > H - 4) { why.edge++; continue; }
          const line = sd === 'l' ? { l: box.r, r: p[0], t: p[1] - 1, b: p[1] + 1 } : { l: p[0], r: box.l, t: p[1] - 1, b: p[1] + 1 };
          const hit = o => box.l < o.r + 6 && box.r > o.l - 6 && box.t < o.b + 4 && box.b > o.t - 4, cross = (L, o) => L.r > L.l && L.l < o.r && L.r > o.l && L.t < o.b && L.b > o.t;
          if (placed.some(o => hit(o) || cross(line, o))) { why.name++; continue; }
          /* the carbon numbers: no name on them, and no line across them, but a line's last 18 px may end among its own
             molecule's numbers (on a phone a small molecule is covered by them) */
          const end = sd === 'l' ? { l: box.r, r: p[0] - 18, t: line.t, b: line.b } : { l: p[0] + 18, r: box.l, t: line.t, b: line.b };
          if (soft.some(o => hit(o) || (!narrow && cross(end, o)))) { why.num++; continue; }   /* on a phone a line may cross numbers */
          if (covers(box, null) || crossesAtoms(line, p, D.mid)) { why.atom++; continue; }
          at = { sd, gap, p, box }; break search;
        }
      }
      /* a phone, and no room beside its part: a MAIN name stands ON its part, just above the point it names, as the game's
         names do on a phone (names.js showOn), so a word met for the first time is still named on the picture (memory
         name-it-on-the-picture); never on another name or a keep-out */
      if (on && !at && narrow && want[k] === 1) {
        const pts2 = (D.pts() || []).map(project).filter(p => p[2] && p[0] > 8 && p[0] < W - 8 && p[1] > ovH + 14 && p[1] < H - 14);
        /* just above the point, else just below it (a part near the top of the picture, under an overview's band) */
        /* (a little further from the point when its carbon's number is in the way) */
        search2: for (const off of [4, 14, 24]) for (const p of pts2) for (const below of [false, true]) {
          const l = Math.max(6, Math.min(W - 6 - D.w, p[0] - D.w / 2)), box = below ? { l, r: l + D.w, t: p[1] + off, b: p[1] + D.h + off } : { l, r: l + D.w, t: p[1] - D.h - off, b: p[1] - off };
          if (box.t < ovH + 4 || box.b > H - 4) continue;
          if (placed.some(o => box.l < o.r + 4 && box.r > o.l - 4 && box.t < o.b + 3 && box.b > o.t - 3)) continue;
          if (covers(box, D.mid)) continue;
          if (soft.some(o => box.l < o.r + 2 && box.r > o.l - 2 && box.t < o.b + 2 && box.b > o.t - 2)) continue;   /* nor on a carbon's number */
          at = { sd: 'on', gap: 0, p, box }; break search2;
        }
      }
      if (on && !at) { why.pts = (D.pts() || []).length; D.why = why; } else D.why = null;
      D.f += ((at ? 1 : 0) - D.f) * (at ? 0.18 : 1);
      el.style.opacity = D.f.toFixed(3); el.style.visibility = at && D.f > 0.01 ? 'visible' : 'hidden';
      D.at = at;
      if (!at) continue;
      if (at.sd === 'on') placed.push(at.box);
      else placed.push(at.box, at.sd === 'l' ? { l: at.box.r, r: at.p[0], t: at.p[1] - 1, b: at.p[1] + 1 } : { l: at.p[0], r: at.box.l, t: at.p[1] - 1, b: at.p[1] + 1 });
      el.classList.toggle('ibv__lab--r', at.sd === 'r'); el.classList.toggle('ibv__lab--on', at.sd === 'on'); el.lastElementChild.style.width = at.gap + 'px';
      const X = at.sd === 'l' || at.sd === 'on' ? at.box.l : at.p[0], Y = at.sd === 'on' ? (at.box.t + at.box.b) / 2 : at.p[1];
      el.style.transform = `translate(${X.toFixed(1)}px, ${Y.toFixed(1)}px) translate(0, -50%)`;
    }
  }

  /* ---------------- glucose's carbons, numbered on their atoms ---------------- */
  const badge = [];
  let numList = [], numBoxes = [];
  function setNums(list) { numList = list || []; }
  function placeNums() {
    /* only when an atom is large enough on the screen to carry its number */
    const show = rest || true, k = pxPerNm() * 0.15;  /* a number shows when a bond (0.15 nm) is at least 10 px long */
    let n = 0; numBoxes = [];
    if (show && k >= (W < 560 ? 8.5 : 10)) for (const it of numList) {
      const p = project(it.p); if (!p[2]) continue;
      numBoxes.push({ l: p[0] - 9, r: p[0] + 9, t: p[1] - 9, b: p[1] + 9 });
      let b = badge[n]; if (!b) { b = document.createElement('b'); b.className = 'ibv__num'; nums.appendChild(b); badge.push(b); }
      if (b.textContent !== String(it.n)) b.textContent = it.n;
      b.className = 'ibv__num' + (it.cls ? ' ' + it.cls : '');
      b.style.transform = `translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px) translate(-50%, -50%)`; b.style.display = '';
      n++;
    }
    for (let i = n; i < badge.length; i++) badge[i].style.display = 'none';
  }

  /* ---------------- the scale bar: a round length, 60 to 150 pixels long, bottom left ---------------- */
  function placeBar() {
    const ppn = pxPerNm();
    const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    const Ln = steps.find(x => x * ppn >= 60) || 20000;
    bar.firstChild.style.width = (Ln * ppn).toFixed(1) + 'px';
    const txt = Ln >= 1000 ? (Ln / 1000) + ' µm' : Ln + ' nm';
    if (bar.lastChild.textContent !== txt) bar.lastChild.textContent = txt;
    bar.style.transform = `translate(16px, ${H - 36}px)`;
  }
  /* the overview's own scale bar, bottom left of its band */
  function placeOvBar() {
    const ppn = ovPxPerNm(), steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    const Ln = steps.find(x => x * ppn >= 50) || 1000, txt = Ln >= 1000 ? (Ln / 1000) + ' µm' : Ln + ' nm';
    ovBar.firstChild.style.width = (Ln * ppn).toFixed(1) + 'px';
    if (ovBar.lastChild.textContent !== txt) ovBar.lastChild.textContent = txt;
    ovBar.style.transform = `translate(14px, ${ovH - 32}px)`;
  }

  let alive = true, t0 = performance.now(), last = t0, paused = false, busy = false, slow = [];
  const still = new URLSearchParams(location.search).has('ibstill');
  function loop() {
    if (!alive) return;
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    /* a page to read (the tally, the questions, the article) covers the whole picture: nothing is drawn under it */
    if (!paused) {
      const t = still ? 0 : (now - t0) / 1000;
      if (onFrame) onFrame(t, dt);
      if (ov) {
        /* the overview in its band, then the close-up below it; the fog suits each camera's distance */
        const fog = scene.fog.density;
        renderer.setScissorTest(true);
        renderer.setViewport(0, H - ovH, W, ovH); renderer.setScissor(0, H - ovH, W, ovH);
        renderer.setClearColor(ov.bg != null ? ov.bg : 0x0c1030, 1);
        if (ov.view) { scene.fog.density = 0.55 / (ovD * 6); renderer.render(scene, ocam); } else renderer.clear();
        renderer.setViewport(0, 0, W, H - ovH); renderer.setScissor(0, 0, W, H - ovH);
        renderer.setClearColor(0x070a1f, 1); scene.fog.density = fog; renderer.render(scene, cam);
        renderer.setScissorTest(false);
      } else renderer.render(scene, cam);
      placeNums(); placeLabels(); placeBar();
      if (ov) { if (ov.view) placeOvBar(); if (ov.place) ov.place(projectOv, { W, H: ovH, ppn: ov.view ? ovPxPerNm() : 0 }); }
      measure(dt);
    }
    requestAnimationFrame(loop);
  }
  /* a slow computer: fewer pixels, the game's rule (world.js measure): 90 frames slower than 34 ms on average take half a
     pixel per point off, down to 1; never while a chapter is being made, whose first frames are slow on purpose */
  function measure(dt) {
    if (busy || still) { slow = []; return; }
    slow.push(dt); if (slow.length < 90) return;
    const avg = slow.reduce((a, b) => a + b, 0) / slow.length; slow = [];
    const pr = renderer.getPixelRatio();
    if (avg > 0.034 && pr > 1.01) { renderer.setPixelRatio(Math.max(1, pr - 0.5)); size(); }
  }
  requestAnimationFrame(loop);
  return {
    renderer, scene, cam, wrap, view, setView, between, project, pxPerNm, fitView,
    get W() { return W; }, get H() { return H; },
    defineLabels, showLabels, setRest(r) { rest = r; }, setKeepOut(list) { keepOut = list || []; }, setAvoid(list) { avoid = list || []; }, setNums,
    setPaused(p) { paused = !!p; }, setBusy(b) { busy = !!b; slow = []; },
    /* a chapter's overview ({ view: {at, dir, up}, width (nm across), frac, fracN (a phone), max, bg, el (its names),
       place(projectOv, band) }), or none. Without a view it is a drawing (the Krebs cycle: a diagram of the order of its
       steps, not to scale): nothing 3D in it, and no scale bar */
    setOverview(o) { ov = o || null; ovRoot.replaceChildren(...(ov ? [ov.el, ov.view ? ovBar : null].filter(Boolean) : [])); size(); },
    get ovH() { return ovH; },
    labelState: () => Object.keys(L).map(k => ({ key: k, on: !!L[k].at, want: want[k] || 0, box: L[k].at && L[k].at.box, p: L[k].at && L[k].at.p, why: L[k].why || null })),
    /* the drawing context goes back at once: Chrome keeps 16 on a page and drops the oldest, the game's own (the audit,
       5 Nov 2026: after about 16 openings of this view the game's 3D picture was lost) */
    stop() {
      alive = false; ro.disconnect(); if (scene.environment) scene.environment.dispose();
      if (document.fonts) document.fonts.removeEventListener('loadingdone', refit);
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); labs.remove(); nums.remove(); bar.remove(); ovRoot.remove();
    }
  };
}
