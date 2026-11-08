/* ============================================================
   world.js — the cell world: renderer, light, glow, the camera's flights and what a pupil points at (4 Nov 2026).
   The world is ONE scene (cellbuild.js). The camera flies between places along a gentle arc; the names on the world
   follow their parts as it moves, the pupil's own zoom and turn too (names.js, on the 'frame' event that each frame
   sends before it is drawn; Daniel, 8 Nov 2026: "the labels should stick to the right position"). A place sleeps (grey, in mist)
   until the pupil has what it needs; it then wakes (the mist clears, a ring of light turns round it).
   Quality: Retina screens draw at most 1.75 pixels per point; a slow computer drops to 1, then switches the glow off.
   ?still=1 (tests and less motion): flights jump to their end, nothing drifts.
   Speed (5 Nov 2026; Daniel: "without losing quality, without losing fluidity, optimize … all of the 3D renders",
   measured with tools/speed.mjs before and after): the shaders are compiled in parallel while the loading screen shows
   (the first frame had compiled them all at once on the page's main thread); tone mapping, the screen's colours and the
   grade are one pass at the end, not two; the glow is worked out at a quarter of the screen's pixels (it is a blur);
   the screen itself keeps no anti-aliasing buffer, which only the glow's final picture ever reached (the 3D is drawn
   into the glow's own picture, which never had one).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { OrbitControls } from '../vendor/three/examples/jsm/controls/OrbitControls.js?v=0.185.1';
import { EffectComposer } from '../vendor/three/examples/jsm/postprocessing/EffectComposer.js?v=0.185.1';
import { RenderPass } from '../vendor/three/examples/jsm/postprocessing/RenderPass.js?v=0.185.1';
import { UnrealBloomPass } from '../vendor/three/examples/jsm/postprocessing/UnrealBloomPass.js?v=0.185.1';
import { ShaderPass } from '../vendor/three/examples/jsm/postprocessing/ShaderPass.js?v=0.185.1';
import { buildCell, places as placeList } from './cellbuild.js?v=202611090712';
import { CUT, setLook, mist, haloRing } from './magic.js?v=202611090712';

const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/* the structures beyond the Year 7 list, hidden in the simple view */
const BEYOND = ['ser', 'golgi', 'granules', 'microtubules', 'centrosome', 'lysosomes', 'apex'];
export const MAP_VIEW = { pos: [0, 9.4, 27.5], at: [0, 8.2, 0] };

export class World {
  constructor(canvas, { still = false, quality = '' } = {}) {
    this.canvas = canvas; this.still = still; this.loop = this.loop.bind(this);
    this.listeners = {}; this.moving = false; this.inset = { right: 0, bottom: 0 }; this.frameH = 0;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false });
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.96;
    this.dprMax = quality === 'low' ? 1 : Math.min(window.devicePixelRatio || 1, 1.75);
    r.setPixelRatio(this.dprMax);
    this.glow = quality !== 'low';

    const scene = this.scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x141845, 36, 95);       /* only the far cells of the acinus fade, never the cell itself */
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 500);
    this.camera.position.fromArray(MAP_VIEW.pos);

    this.sky();
    this.lights();
    this.W = buildCell(scene);
    this.P = placeList(this.W);
    this.placeFx();
    this.nucOpen = false; this.nucShown = false; this.nucDive = false; this.nucLook();

    this.controls = new OrbitControls(this.camera, canvas);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.08, enablePan: false, rotateSpeed: 0.55, zoomSpeed: 0.7 });
    this.controls.target.fromArray(MAP_VIEW.at);
    this.limits(MAP_VIEW, true);
    this.controls.addEventListener('start', () => this.emit('grab'));
    this.controls.addEventListener('end', () => this.emit('release'));

    this.composer = new EffectComposer(r);
    this.composer.addPass(new RenderPass(scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.55, 0.8);
    this.composer.addPass(this.bloom);
    /* the last pass: tone mapping and the screen's colours (as three's OutputPass), then the grade, in one */
    this.composer.addPass(new ShaderPass({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform sampler2D tDiffuse; varying vec2 vUv;
        void main() {
          vec4 c = texture2D(tDiffuse, vUv);
          #ifdef TONE_MAPPING
          c.rgb = toneMapping(c.rgb);
          #endif
          c = linearToOutputTexel(c);
          float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
          c.rgb = mix(c.rgb, c.rgb * vec3(0.92, 0.98, 1.10), 1.0 - smoothstep(0.0, 0.45, l));   /* cool shadows */
          c.rgb = mix(c.rgb, c.rgb * vec3(1.06, 1.0, 0.92), smoothstep(0.55, 1.0, l));          /* warm light */
          vec2 d = vUv - 0.5; float v = smoothstep(0.85, 0.25, length(d * vec2(1.0, 0.8)));
          c.rgb *= mix(0.62, 1.0, v);
          gl_FragColor = c;
        }`
    }));

    /* the shaders, compiled in parallel (KHR_parallel_shader_compile) while the loading screen shows: the variants the
       glow's render target needs (no tone mapping there), so the first frame finds every one ready; nothing is drawn
       until then (main.js waits for world.ready before it takes the loading screen away) */
    this.compiled = false;
    r.setRenderTarget(this.composer.renderTarget1);
    this.ready = r.compileAsync(scene, this.camera).catch(() => {}).then(() => { this.compiled = true; this.kick(); });
    r.setRenderTarget(null);
    setTimeout(() => { if (!this.compiled) { this.compiled = true; this.kick(); } }, 6000);   /* never a world that waits for ever */
    this.t0 = performance.now(); this.frames = [];
    this.pointer();
    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas.parentElement);
    this.t0 = performance.now(); this.frames = [];
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.kick(); });
    this.kick();
  }

  /* ---------- events ---------- */
  on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
  emit(ev, a) { (this.listeners[ev] || []).forEach(f => f(a)); }

  /* ---------- the sky round the acinus: a deep twilight, violet above and sea-blue below ---------- */
  sky() {
    const g = new THREE.SphereGeometry(300, 32, 20);
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uTime: CUT.uTime },
      vertexShader: `varying vec3 vP; void main() { vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        varying vec3 vP; uniform float uTime;
        void main() {
          float h = vP.y * 0.5 + 0.5;
          vec3 low = vec3(0.020, 0.095, 0.150), mid = vec3(0.075, 0.070, 0.230), high = vec3(0.150, 0.075, 0.270);
          vec3 c = mix(low, mid, smoothstep(0.15, 0.55, h));
          c = mix(c, high, smoothstep(0.55, 0.95, h));
          float band = exp(-pow((h - 0.52) * 7.0, 2.0)) * (0.5 + 0.5 * sin(vP.x * 3.0 + uTime * 0.05));
          c += vec3(0.05, 0.10, 0.12) * band;
          gl_FragColor = vec4(c, 1.0);
        }`
    });
    const s = new THREE.Mesh(g, m); s.renderOrder = -10; this.scene.add(s);
  }

  lights() {
    const S = this.scene;
    S.add(new THREE.HemisphereLight(0xa596ff, 0x147a7a, 0.78));
    const key = new THREE.DirectionalLight(0xffe7c9, 1.9); key.position.set(12, 24, 18); S.add(key);
    const rim = new THREE.DirectionalLight(0x7fd8ff, 1.7); rim.position.set(-16, 9, -18); S.add(rim);
    const low = new THREE.DirectionalLight(0xff9ad0, 0.55); low.position.set(4, -12, 10); S.add(low);
    const heart = new THREE.PointLight(0x9ff3ff, 12, 18, 1.6); heart.position.set(0, 8, 3); S.add(heart);
    /* a soft reflection of a coloured sky for the glossy parts */
    const pm = new THREE.PMREMGenerator(this.renderer);
    const env = new THREE.Scene();
    const panel = (c, p, s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); env.add(m); };
    env.background = new THREE.Color(0x101436);
    panel(0x8f7cff, [0, 10, 0], 14); panel(0x2fb39a, [0, -10, 0], 14); panel(0xffd27a, [10, 3, 6], 6); panel(0x7fd8ff, [-10, 2, -6], 8); panel(0xff9ad0, [4, -2, -10], 5);
    S.environment = pm.fromScene(env, 0.04).texture;
    pm.dispose();
  }

  /* ---------- each place: a press target, its mist and its ring ---------- */
  placeFx() {
    this.hitMeshes = [];
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    Object.values(this.P).forEach(p => {
      const h = new THREE.Mesh(new THREE.SphereGeometry(p.hit, 12, 8), hitMat);
      h.position.copy(p.center); h.userData.place = p.id; this.scene.add(h); this.hitMeshes.push(h);
      p.mistObj = mist({ center: p.center, radius: p.mist }); this.scene.add(p.mistObj); p.mistObj.userData.fade(0);
      p.ring = haloRing(p.hit * 1.05); p.ring.position.copy(p.center); p.ring.visible = false; this.scene.add(p.ring);
      p.state = 'open'; p.lit = 0; p.litTo = 0;
    });
  }
  /* sleep (grey, misty), open (awake, a turning ring), done (awake, calm) */
  setPlace(id, state, { instant = false } = {}) {
    const p = this.P[id]; if (!p) return;
    const was = p.state; p.state = state;
    const groups = p.groups.map(g => this.W.groups[g]).filter(Boolean);
    if (id === 'nucleolus') groups.push(this.W.nucleus.nucleolus);
    const to = state === 'sleep' ? 1 : 0;
    const from = instant || this.still ? to : (was === 'sleep' ? 1 : 0);
    const dur = instant || this.still ? 0 : 1600;
    const t0 = performance.now();
    const step = () => {
      const k = dur ? Math.min(1, (performance.now() - t0) / dur) : 1, v = from + (to - from) * ease(k);
      groups.forEach(g => setLook(g, { sleep: v }));
      p.mistObj.userData.fade(v);
      if (k < 1) requestAnimationFrame(step);
    };
    step();
    if (was === 'sleep' && state !== 'sleep' && !instant) this.emit('woke', id);
  }
  light(id, on) { Object.values(this.P).forEach(p => { p.litTo = (p.id === id && on) ? 1 : 0; }); }

  /* the neighbouring cells of the acinus: faint on the map; clearer in the dive (k 0 … 1) */
  /* the neighbouring cells of the bunch: faint in the game (k = 0), clear in the intro's view of the whole bunch (k = 1) */
  acinus(k) { (this.W.acinusMats || []).forEach(([m, a, b]) => { m.opacity = a + (b - a) * k; }); }

  /* the way in (k 0 … 1): the membrane at the base drawn bigger, as two layers of lipids with carrier proteins
     (cellbuild.js), in place of the base's thin film; the front of the base is cut away too, so that its two layers show
     in section. A smooth change both ways (Daniel, 4 Nov 2026: no glitches as things appear) */
  wayIn(on, ms = 1200) {
    const B = this.W.bilayer; if (!B) return Promise.resolve();
    const to = on ? 1 : 0, from = this.wayK || 0;
    if (from === to && !this.wayGo) { B.group.visible = !!to; return Promise.resolve(); }
    const go = this.wayGo = {}, t0 = performance.now(), dur = this.still ? 0 : ms * Math.abs(to - from);
    const paint = k => {
      this.wayK = k; B.group.visible = k > 0.001;
      CUT.uBase.value = k; CUT.uCutY.value = 0.45 + (-2.5 - 0.45) * k;
      B.mats.forEach(([m, top]) => { m.opacity = k * top; m.depthWrite = k > 0.95; });
      B.fluid.material.uniforms.uOpacity.value = 0.55 * k;
      this.kick();
    };
    return new Promise(res => {
      const step = () => {
        if (this.wayGo !== go) return res();
        const t = dur ? Math.min(1, (performance.now() - t0) / dur) : 1;
        paint(from + (to - from) * ease(t));
        if (t < 1) requestAnimationFrame(step); else { this.wayGo = null; res(); }
      };
      step();
    });
  }

  /* ---------- the cell you know (Year 7: membrane, cytoplasm, nucleus, mitochondria, ribosomes) and the rest ----------
     simple(true) hides every structure beyond the Year 7 list; reveal(key) shows one again (play.js names each). */
  simple(on) {
    const G = this.W.groups;
    this.isSimple = on; if (on) this.nucShown = false;
    BEYOND.forEach(k => { if (G[k]) G[k].visible = !on; });
    G.rer.children.forEach(m => { if (m.name !== 'rer-ribosomes') m.visible = !on; });
    this.nucLook();
  }
  reveal(key) {
    const G = this.W.groups;
    if (key === 'rer') G.rer.children.forEach(m => { m.visible = true; });
    else if (key === 'nucleus-inside') { this.nucShown = true; this.nucLook(); }
    else if (G[key]) G[key].visible = true;
  }

  /* ---------- the nucleus, closed or open (8 Nov 2026) ----------
     Daniel: "the first time you go in, it needs to be closed, and you need to go through a pore and then kind of travel
     through it and then reveal what's inside … if you go to the map, then you will see the nucleus open as you see it now".
     Closed: the whole envelope, its pores all over it (those of the front too), nothing inside drawn (none of it can be
     seen); open: its front cut away (the window, its glowing rim) and the inside shown, as before. main.js sets it from
     the saved game ('in-nucleus': the pupil has been inside); the dive (play.js) opens it, unseen, once the pupil is in.
     nucDive: during the dive the inside is drawn (black until its light reaches it). In the Year 7 view (simple) only the
     outer envelope shows; the start's Show everything (reveal 'nucleus-inside') shows the rest that can be seen. */
  setNucleus(open) { this.nucOpen = !!open; this.nucLook(); }
  nucLook() {
    const N = this.W.nucleus, full = !this.isSimple || !!this.nucShown, open = !!this.nucOpen, inside = full && (open || !!this.nucDive);
    N.outerEnv.geometry = open ? N.outerEnv.userData.geo.cut : N.outerEnv.userData.geo.whole;
    N.innerEnv.geometry = open ? N.innerEnv.userData.geo.cut : N.innerEnv.userData.geo.whole;
    N.innerEnv.visible = full; N.pores.visible = full; N.poresFront.visible = full && !open; N.rim.visible = full && open;
    [N.chromatin, N.nucleolus, N.nolSpark].forEach(o => { o.visible = inside; });
    this.kick();
  }

  /* ---------- the camera ---------- */
  limits(view, isMap) {
    const c = this.controls, at = new THREE.Vector3().fromArray(view.at), pos = new THREE.Vector3().fromArray(view.pos);
    const d = pos.distanceTo(at), off = pos.clone().sub(at), sph = new THREE.Spherical().setFromVector3(off);
    c.minDistance = d * (isMap ? 0.55 : 0.6); c.maxDistance = d * (isMap ? 1.35 : 1.5);
    const az = isMap ? 1.05 : 0.75, po = isMap ? 0.42 : 0.5;
    c.minAzimuthAngle = sph.theta - az; c.maxAzimuthAngle = sph.theta + az;
    c.minPolarAngle = Math.max(0.15, sph.phi - po); c.maxPolarAngle = Math.min(Math.PI - 0.15, sph.phi + po);
  }
  /* fly to a view along an arc; the promise ends when the camera is still */
  flyTo(view, { ms = 2600, isMap = false } = {}) {
    const cam = this.camera, c = this.controls;
    const p0 = cam.position.clone(), a0 = c.target.clone();
    const p1 = new THREE.Vector3().fromArray(view.pos), a1 = new THREE.Vector3().fromArray(view.at);
    this.flying = true; c.enabled = false; this.setMoving(true);
    if (this.hover) { this.hover = null; this.light(null, false); this.canvas.style.cursor = 'grab'; this.emit('hover', null); }
    if (this.still || p0.distanceTo(p1) < 0.01) { cam.position.copy(p1); c.target.copy(a1); return this.landed(view, isMap); }
    /* the arc rises away from the middle of the cell, so the flight passes over things, not through them */
    const mid = p0.clone().add(p1).multiplyScalar(0.5), out = mid.clone().sub(new THREE.Vector3(0, 7, 0)).setY(0).normalize();
    const lift = Math.min(8, p0.distanceTo(p1) * 0.28);
    const ctrl = mid.clone().addScaledVector(out, lift).add(new THREE.Vector3(0, lift * 0.6, 0));
    const t0 = performance.now(), dur = Math.max(1200, Math.min(ms, 900 + p0.distanceTo(p1) * 90));
    return new Promise(res => {
      const step = () => {
        const k = Math.min(1, (performance.now() - t0) / dur), e = ease(k), u = 1 - e;
        cam.position.set(u * u * p0.x + 2 * u * e * ctrl.x + e * e * p1.x, u * u * p0.y + 2 * u * e * ctrl.y + e * e * p1.y, u * u * p0.z + 2 * u * e * ctrl.z + e * e * p1.z);
        c.target.lerpVectors(a0, a1, ease(Math.min(1, k * 1.15)));
        cam.lookAt(c.target);
        if (k < 1) requestAnimationFrame(step); else this.landed(view, isMap).then(res);
      };
      step();
    });
  }
  landed(view, isMap) {
    this.flying = false; this.limits(view, isMap); this.controls.enabled = true; this.controls.update();
    this.view = view; this.isMap = isMap;
    return new Promise(res => setTimeout(() => { this.setMoving(false); res(); }, this.still ? 0 : 250));
  }
  setMoving(on) { if (this.moving === on) return; this.moving = on; this.emit(on ? 'moving' : 'still'); }
  /* the camera's near and far planes for its distance (µm) to what it looks at: the magnified views of a mitochondrion
     (mitoparts.js) are a few nanometres away, the map tens of micrometres; nothing changes beyond 1 µm */
  nearFar(d) {
    const c = this.camera, n = d >= 1 ? 0.05 : Math.max(2e-5, Math.min(0.05, d / 30)), f = d >= 1 ? 500 : Math.max(12, Math.min(500, d * 2500));
    if (Math.abs(c.near - n) > 1e-9 || Math.abs(c.far - f) > 1e-6) { c.near = n; c.far = f; c.updateProjectionMatrix(); }
  }

  /* the side panel or the bottom sheet covers part of the picture: the picture's middle moves to the free part */
  setInset({ right = 0, bottom = 0, top = 0 }) { this.inset = { right, bottom, top }; this.resize(); }
  /* a place that must be seen whole from side to side (the way in: the whole base of the cell) asks for more than 20° to
     each side on a laptop or a full screen (a stage over 860 px wide; a phone keeps its own view) (Daniel, 8 Nov 2026: in
     full screen "you don't see the left or you don't see the right"); 0: the usual view */
  setFrame(h = 0) { if (this.frameH === h) return; this.frameH = h; this.resize(); }
  /* how many pixels one micrometre covers at a distance from the camera (the intro matches its drawing to the 3D) */
  pxPerUnit(dist = 1) { return (this.fullH / 2) / (dist * Math.tan(this.camera.fov * Math.PI / 360)); }
  resize() {
    const el = this.canvas.parentElement, w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    this.size = { w, h };
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    /* the glow from a quarter of the screen's pixels (the composer had set it from half) */
    const pr = this.renderer.getPixelRatio();
    this.bloom.setSize(Math.round(w * pr / 2), Math.round(h * pr / 2));
    const R = Math.min(this.inset.right, w * 0.5), B = Math.min(this.inset.bottom, h * 0.6), T = Math.min(this.inset.top || 0, h * 0.6);
    const cam = this.camera;
    if (R > 0) { cam.aspect = (w + R) / h; cam.setViewOffset(w + R, h, R, 0, w, h); }
    else if (B > 0) { cam.aspect = w / (h + B); cam.setViewOffset(w, h + B, 0, B, w, h); }
    else if (T > 0) { cam.aspect = w / (h + T); cam.setViewOffset(w, h + T, 0, 0, w, h); }      /* the free part below a card */
    else { cam.aspect = w / h; cam.clearViewOffset(); }
    /* the free part of the picture (beside the panel, or above it on a phone) shows at least 19° above and below its middle
       and 20° to each side, at any size: on a laptop that is the 38° view the places were made for; on a phone, where the
       free part is small and narrow, the view widens, so a place's parts stay in view (a fixed 52° showed only 17° across) */
    const fw = Math.max(1, w - R), fh = Math.max(1, h - B - T), H = B > 0 ? h + B : T > 0 ? h + T : h, rad = Math.PI / 180;
    this.fullH = H;
    const hMin = this.frameH && w > 860 ? this.frameH : 20;
    const k = Math.max(Math.tan(19 * rad) / (fh / 2), Math.tan(hMin * rad) / (fw / 2));
    cam.fov = 2 * Math.atan(k * H / 2) / rad;
    cam.updateProjectionMatrix();
    this.emit('resize');
    this.kick();
  }

  /* ---------- pointing and pressing ---------- */
  pointer() {
    const ray = new THREE.Raycaster(), v = new THREE.Vector2();
    let down = null, last = 0;
    const pick = (e) => {
      const r = this.canvas.getBoundingClientRect();
      v.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(v, this.camera);
      const hit = ray.intersectObjects(this.hitMeshes, false)[0];
      return hit ? hit.object.userData.place : null;
    };
    this.pickAt = (x, y) => pick({ clientX: x, clientY: y });
    this.canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    this.canvas.addEventListener('pointerup', e => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved > 7 || this.flying) return;
      const id = pick(e);
      this.emit('press', id);
    });
    /* a place lights under the mouse only where pressing it takes you there: on the map, with no place open (Daniel,
       4 Nov 2026: inside the nucleus "everything lights up … even if I'm not selecting anything … very, very bright";
       inside a place a press on the cell does nothing, and the place you are in filled the view, lit). main.js sets
       canPress; until it does, every place may light */
    this.canPress = this.canPress || (() => true);
    this.canvas.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || this.flying) return;
      const now = performance.now(); if (now - last < 60) return; last = now;
      const id = this.canPress() ? pick(e) : null;
      if (id !== this.hover) { this.hover = id; this.light(id, !!id); this.canvas.style.cursor = id ? 'pointer' : 'grab'; this.emit('hover', id); }
    });
    this.canvas.addEventListener('pointerleave', () => { this.hover = null; this.light(null, false); this.emit('hover', null); });
  }

  /* where a point is on the screen (px), and whether it can be seen from the camera (nothing solid in front) */
  project(v) {
    const p = v.clone().project(this.camera), s = this.size;
    return { x: (p.x * 0.5 + 0.5) * s.w, y: (-p.y * 0.5 + 0.5) * s.h, inFront: p.z < 1 && p.z > -1 };
  }

  /* ---------- the loop ---------- */
  kick() { if (!this.running && this.compiled) { this.running = true; this.last = performance.now(); requestAnimationFrame(this.loop); } }
  loop(now) {
    /* hidden, or covered by the IB view (main.js sets hold), nothing is drawn; kick() starts it again */
    if (document.hidden || this.hold) { this.running = false; return; }
    const dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
    const t = this.still ? 4 : Math.max(0, (now - this.t0) / 1000);   /* rAF's time can be a little before t0 */
    this.renderFrame(t, dt);
    this.measure(dt);
    requestAnimationFrame(this.loop);
  }
  renderFrame(t, dt = 0.016) {
    CUT.uTime.value = t;
    this.W.anim.forEach(f => f(t, dt));
    Object.values(this.P).forEach(p => {
      p.lit += (p.litTo - p.lit) * Math.min(1, dt * 8);
      if (Math.abs(p.lit - p.litTo) > 0.002 || p.lit > 0.002) p.groups.forEach(g => this.W.groups[g] && setLook(this.W.groups[g], { lit: p.lit * 0.8 }));
      p.ring.visible = p.state === 'open' && !!this.isMap && !this.flying;   /* the halo shows on the map only (close up it is a hoop in the way) */
      if (p.ring.visible) { p.ring.lookAt(this.camera.position); p.ring.rotateZ(t * 0.3); p.ring.scale.setScalar(1 + 0.04 * Math.sin(t * 2)); }   /* a halo that faces you */
    });
    if (!this.flying) this.controls.update();
    /* the names on the world (names.js) follow their parts with the camera this frame is drawn with (8 Nov 2026) */
    this.emit('frame', t);
    if (this.glow) this.composer.render(dt); else this.renderer.render(this.scene, this.camera);
  }
  /* a slow computer: fewer pixels first, then no glow */
  measure(dt) {
    if (this.still) return;
    this.frames.push(dt); if (this.frames.length < 90) return;
    const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length; this.frames = [];
    if (avg > 0.034) {
      const pr = this.renderer.getPixelRatio();
      if (pr > 1.01) { this.renderer.setPixelRatio(Math.max(1, pr - 0.5)); this.resize(); }
      else if (this.glow) { this.glow = false; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; }
    }
  }
}
