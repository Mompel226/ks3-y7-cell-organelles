/* ============================================================
   names.js — the names on the 3D world (4 Nov 2026), by Daniel's rules (memory label-lines-never-cross):
   - every name is joined to its part by ONE level line that ends ON the part (no dot, no full stop);
   - names on one side stand a full row apart; a name that finds no free row moves along its own part (another of its
     spots), then to the other side; only then is it left out (on the map every place is also in the list of places);
   - a spot hidden behind something solid is never used (a ray from the camera must reach the part first);
   - the names follow their parts (Daniel, 8 Nov 2026: "as you zoom in and out, as you move around … the labels should
     stick to the right position … in a very smooth way and not blinking"). Every frame the world draws (world.js, its
     'frame' event), each name and its line move with their part, with the camera that frame is drawn with: each keeps
     its side, its row and its point while the camera moves. A name steps back while its part is out of the picture or
     behind something (it fades), or at once while it would cover a name placed before it (never two over each other),
     and fades in again when it is free; a new name waits until a name fading out where it would stand has gone. When
     the camera has stopped (or the list changes: the IB switch), the layout is made again: which names show is decided
     as before (the fewest choices first, so that the most fit), and each of them keeps its place when it still can; the
     names that must move go to their new rows smoothly (to the other side: out at the old place, in at the new). Until 8 Nov 2026 the
     names went while the game's camera flew and came back when it stopped (a blink), and a pupil's own zoom or turn
     left them where they were, their lines pointing at the wrong places.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';

const GLIDE = 420;    /* ms: a name moving to its new row once the camera has stopped */
const FADE = 180;     /* ms: a name stepping back or coming in (game.css: .nm and .nml, their transition) */
const SETTLE = 10;    /* frames (about 1/6 s) in which its parts moved less than 0.3 px each: the camera has stopped (the
                         wheel's notches come about 0.1 s apart: a pause between two is not a stop) */
const ease = k => 1 - Math.pow(1 - k, 3);
const se = c => Math.sign(c) * Math.pow(Math.abs(c), 2 / 3);   /* the cell's outline, a superellipse (cellbuild.js CELL) */
const NS = 'http://www.w3.org/2000/svg';

/* ---------- what hides a part: a quick ray test (8 Nov 2026) ----------
   three.js's own test tries every triangle of every solid part: 12 ms a ray on the map (249,000 triangles), so placing
   the map's names took 3 s (4 s after the mitochondria), each time. Here each shape's triangles are kept in a tree of
   boxes, made once, the first time a ray meets the shape: a ray tests only the triangles in the boxes it passes through.
   The same triangles and the same rules as three.js (each material's sides, its groups, what is drawn, each instance,
   a cloud of points within 1 µm of the ray), so the same answer, about a hundred times quicker. */
const TREES = new WeakMap();
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _p = new THREE.Vector3(), _q = new THREE.Vector3();
const _m = new THREE.Matrix4(), _inv = new THREE.Matrix4(), _ray = new THREE.Ray(), _s = new THREE.Sphere();
function treeOf(geo, groups) {
  const pos = geo.attributes.position, idx = geo.index, dr = geo.drawRange;
  const key = [pos.version, idx ? idx.version : -1, dr.start, dr.count, groups ? geo.groups.length : -1].join();
  let T = (TREES.get(geo) || {})[groups ? 'g' : 'd'];
  if (T && T.key === key) return T;
  const total = idx ? idx.count : pos.count, vx = i => idx ? idx.getX(i) : i, A = [], G = [];
  /* the triangles three.js would test: with a material for each group, those of the groups; else those drawn */
  const range = (s, e, g) => { for (let j = Math.max(0, s); j + 2 < Math.min(total, e); j += 3) { A.push(vx(j), vx(j + 1), vx(j + 2)); G.push(g); } };
  if (groups) geo.groups.forEach(g => range(Math.max(g.start, dr.start), Math.min(g.start + g.count, dr.start + dr.count), g.materialIndex));
  else range(dr.start, dr.start + dr.count, 0);
  /* each triangle's own box and middle, then boxes of boxes: each splits its triangles at the middle of its longest side */
  const n = A.length / 3, P = pos, tb = new Float32Array(n * 6), cen = new Float32Array(n * 3), order = new Int32Array(n), box = [], kid = [], leaf = [];
  for (let t = 0; t < n; t++) {
    order[t] = t; const j = t * 6; tb[j] = tb[j + 1] = tb[j + 2] = Infinity; tb[j + 3] = tb[j + 4] = tb[j + 5] = -Infinity;
    for (let k = 0; k < 3; k++) { const v = A[t * 3 + k], q = [P.getX(v), P.getY(v), P.getZ(v)]; for (let e = 0; e < 3; e++) { if (q[e] < tb[j + e]) tb[j + e] = q[e]; if (q[e] > tb[j + e + 3]) tb[j + e + 3] = q[e]; } }
    for (let e = 0; e < 3; e++) cen[t * 3 + e] = (tb[j + e] + tb[j + e + 3]) / 2;
  }
  const node = (lo, hi) => {
    const me = box.length / 6, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity], cb = b.slice();
    for (let i = lo; i < hi; i++) { const t = order[i], j = t * 6;
      for (let e = 0; e < 3; e++) { if (tb[j + e] < b[e]) b[e] = tb[j + e]; if (tb[j + e + 3] > b[e + 3]) b[e + 3] = tb[j + e + 3]; const c = cen[t * 3 + e]; if (c < cb[e]) cb[e] = c; if (c > cb[e + 3]) cb[e + 3] = c; } }
    box.push(...b); kid.push(-1, -1); leaf.push(lo, hi);
    if (hi - lo <= 12) return me;
    const ax = [0, 1, 2].sort((p, q) => (cb[q + 3] - cb[q]) - (cb[p + 3] - cb[p]))[0], mid = (cb[ax] + cb[ax + 3]) / 2;
    let m = lo; for (let i = lo; i < hi; i++) if (cen[order[i] * 3 + ax] < mid) { const x = order[i]; order[i] = order[m]; order[m] = x; m++; }
    if (m === lo || m === hi) m = (lo + hi) >> 1;
    const l = node(lo, m), r = node(m, hi); kid[me * 2] = l; kid[me * 2 + 1] = r;
    return me;
  };
  if (n) node(0, n);
  T = { key, A: Int32Array.from(A), G: Int32Array.from(G), order, box: Float32Array.from(box), kid: Int32Array.from(kid), leaf: Int32Array.from(leaf), n };
  TREES.set(geo, Object.assign(TREES.get(geo) || {}, { [groups ? 'g' : 'd']: T }));
  return T;
}
/* the nearest triangle of one shape (as drawn with the matrix M) that the world's ray meets within far */
function meshHit(mesh, M, ray, far, best) {
  const geo = mesh.geometry, mat = mesh.material, groups = Array.isArray(mat) && geo.groups.length > 0;
  if (!geo.attributes.position || (Array.isArray(mat) && !groups)) return;
  geo.boundingSphere || geo.computeBoundingSphere();
  _s.copy(geo.boundingSphere).applyMatrix4(M); if (!ray.intersectsSphere(_s)) return;
  const T = treeOf(geo, groups); if (!T.n) return;
  _inv.copy(M).invert(); _ray.copy(ray).applyMatrix4(_inv);
  const o = _ray.origin, d = _ray.direction, ix = 1 / d.x, iy = 1 / d.y, iz = 1 / d.z, P = geo.attributes.position, B = T.box;
  const stack = [0];
  while (stack.length) {
    const k = stack.pop(), j = k * 6;
    let t1 = (B[j] - o.x) * ix, t2 = (B[j + 3] - o.x) * ix, tn = Math.min(t1, t2), tf = Math.max(t1, t2);
    t1 = (B[j + 1] - o.y) * iy; t2 = (B[j + 4] - o.y) * iy; tn = Math.max(tn, Math.min(t1, t2)); tf = Math.min(tf, Math.max(t1, t2));
    t1 = (B[j + 2] - o.z) * iz; t2 = (B[j + 5] - o.z) * iz; tn = Math.max(tn, Math.min(t1, t2)); tf = Math.min(tf, Math.max(t1, t2));
    if (tf < Math.max(tn, 0)) continue;
    const l = T.kid[k * 2];
    if (l >= 0) { stack.push(l, T.kid[k * 2 + 1]); continue; }
    for (let i = T.leaf[k * 2]; i < T.leaf[k * 2 + 1]; i++) {
      const t = T.order[i], mt = groups ? mat[T.G[t]] : mat;
      if (!mt) continue;   /* a group with no material is not drawn */
      const side = mt.side;
      _a.fromBufferAttribute(P, T.A[t * 3]); _b.fromBufferAttribute(P, T.A[t * 3 + 1]); _c.fromBufferAttribute(P, T.A[t * 3 + 2]);
      const hit = side === THREE.BackSide ? _ray.intersectTriangle(_c, _b, _a, true, _p) : _ray.intersectTriangle(_a, _b, _c, side === THREE.FrontSide, _p);
      if (!hit) continue;
      const dist = ray.origin.distanceTo(_q.copy(_p).applyMatrix4(M));
      if (dist <= far && dist < best.d) { best.d = dist; best.o = mesh; }
    }
  }
}
/* a cloud of points meets a ray that passes within 1 µm of one of them (three.js's own rule for points) */
function pointsHit(pts, ray, far, best) {
  const geo = pts.geometry, P = geo.attributes.position; if (!P) return;
  geo.boundingSphere || geo.computeBoundingSphere();
  _s.copy(geo.boundingSphere).applyMatrix4(pts.matrixWorld); _s.radius += 1; if (!ray.intersectsSphere(_s)) return;
  _inv.copy(pts.matrixWorld).invert(); _ray.copy(ray).applyMatrix4(_inv);
  const th = 1 / ((pts.scale.x + pts.scale.y + pts.scale.z) / 3), idx = geo.index, dr = geo.drawRange, total = idx ? idx.count : P.count;
  for (let i = Math.max(0, dr.start); i < Math.min(total, dr.start + dr.count); i++) {
    _p.fromBufferAttribute(P, idx ? idx.getX(i) : i);
    if (_ray.distanceSqToPoint(_p) >= th * th) continue;
    _ray.closestPointToPoint(_p, _q); _q.applyMatrix4(pts.matrixWorld);
    const dist = ray.origin.distanceTo(_q); if (dist <= far && dist < best.d) { best.d = dist; best.o = pts; }
  }
}
/* the first solid thing a ray from the camera meets within far, among the parts that show */
function firstHit(roots, ray, far) {
  const best = { d: Infinity, o: null };
  const visit = x => {
    if (!x.visible) return;
    if (x.isInstancedMesh) { for (let i = 0; i < x.count; i++) { x.getMatrixAt(i, _m); meshHit(x, _m.premultiply(x.matrixWorld).clone(), ray, far, best); } }
    else if (x.isMesh) meshHit(x, x.matrixWorld, ray, far, best);
    else if (x.isPoints) pointsHit(x, ray, far, best);
    x.children.forEach(visit);
  };
  roots.forEach(r => { for (let x = r.parent; x; x = x.parent) if (!x.visible) return; visit(r); });
  return best.o ? best : null;
}

export class Names {
  constructor(world, layer) {
    this.w = world; this.layer = layer; this.items = [];
    this.svg = document.createElementNS(NS, 'svg'); this.svg.setAttribute('class', 'names__lines');
    layer.appendChild(this.svg);
    this.m = new Map();      /* each name of the list by its key: its element, its line, its sizes, where it stands */
    this.gone = new Set();   /* names taken off the list, stepping back before they go */
    this.order = [];         /* the names placed, in the order the layout placed them: the first keeps its row */
    this.v = new THREE.Vector3(); this.eL = new THREE.Vector3(); this.eR = new THREE.Vector3();
    this.still = 0; this.dirty = false; this.rr = 0; this.count = 0; this.left = 0; this.report = [];
    /* tests (?still=1) and a pupil who asked for less motion: a name goes to its new row at once */
    this.calm = world.still || matchMedia('(prefers-reduced-motion: reduce)').matches;
    world.on('frame', () => { try { this.frame(); } catch (e) { console.error(e); } });
    world.on('still', () => this.show());
    world.on('resize', () => { this.measure([...this.m.values()]); this.dirty = true; this.still = 0; });
  }
  /* list: [{ key, text, html, cls, spots: [Vector3], own: [Object3D] (what counts as the part itself), press,
     free (a spot in the open, a region such as the cytoplasm: no ray test), small (shorter words for a phone, where each
     name stands on its part), alt (on a phone, other parts of the same kind to stand on when its own have no room), aside
     (on a phone, beside its part first: a protein the name would hide), prefer (-1: on a phone, beside it on the left
     first), side ('L' or 'R': beside the cell, the only side it may stand on, when its line from the other side would
     cross another part; with no room there it is left out) }];
     keepOut: elements on the world (the bag, the tools) that no name may cover;
     frame: { l, r } (Vector3), the left and right edges of what is named, when it is not the whole cell (the way in).
     A name whose key stays in the next list is the same name: it moves to its new place, never out and in again. */
  set(list, keepOut, frame) {
    this.items = list; this.edges = frame || null;
    if (keepOut) {
      this.keepOut = keepOut;
      /* a box that grows (the bag fills as the pupil gains items; the mitochondria's scale bar, as the camera zooms) never
         ends up over a name: from the next frame a name steps back from its new size, and once the camera is still the
         names are placed again */
      this.ro = this.ro || new ResizeObserver(() => { this.keeps(); this.dirty = true; this.still = Math.min(this.still, SETTLE - 3); });
      this.ro.disconnect(); keepOut.forEach(e => e && this.ro.observe(e));
    }
    const keys = new Set(list.map(it => it.key)), fresh = [];
    for (const [k, r] of this.m) if (!keys.has(k)) this.drop(r);
    list.forEach(it => {
      let r = this.m.get(it.key);
      if (!r) { r = [...this.gone].find(g => g.key === it.key && g.el.tagName === (it.press ? 'BUTTON' : 'SPAN')); if (r) { this.gone.delete(r); r.leaving = false; this.m.set(it.key, r); } }
      if (r && r.el.tagName !== (it.press ? 'BUTTON' : 'SPAN')) { this.drop(r); r = null; }
      if (!r) { r = this.make(it); this.m.set(it.key, r); }
      const was = r.it; r.it = it;
      if (!was || was !== it && (was.html !== it.html || was.text !== it.text || was.small !== it.small || was.cls !== it.cls)) { r.mode = null; fresh.push(r); }
      if (it.label) r.el.setAttribute('aria-label', it.label); else r.el.removeAttribute('aria-label');
    });
    this.measure(fresh);
    this.order = this.order.filter(k => keys.has(k));
    if (!this.w.moving) this.show(); else { this.dirty = true; this.still = 0; }
  }
  make(it) {
    const el = document.createElement(it.press ? 'button' : 'span'); if (it.press) el.type = 'button';
    el.className = 'nm nm--away'; el.setAttribute('data-key', it.key); el.style.display = 'none'; el.style.visibility = 'hidden';
    const line = document.createElementNS(NS, 'line'); line.setAttribute('class', 'nml nml--away'); line.setAttribute('data-key', it.key); line.style.display = 'none';
    const r = { key: it.key, it: null, el, line, at: null, place: false, st: { s: 'hidden' }, lst: { s: 'hidden' } };
    el.addEventListener('click', () => { if (r.it && r.it.press) r.it.press(); });
    this.layer.appendChild(el); this.svg.appendChild(line);
    return r;
  }
  /* taken off the list: it steps back where it is (still on its part), then goes */
  drop(r) {
    this.m.delete(r.key); r.place = false; r.next = null; r.leaving = true; this.gone.add(r);
    setTimeout(() => { if (r.leaving && this.gone.delete(r)) { r.el.remove(); r.line.remove(); } }, FADE + 80);
  }
  /* each name's size beside the cell and on its part (a phone's words), measured once, and again when the screen changes */
  measure(list) {
    list = list.filter(r => r.it); if (!list.length) return;
    const keep = list.map(r => [r.el.className, r.el.innerHTML, r.el.style.display, r.el.style.visibility, r.el.style.transform]);
    const put = on => list.forEach(r => { r.el.className = 'nm ' + (on ? 'nm--on ' : '') + (r.it.cls || ''); r.el.innerHTML = on ? (r.it.small || r.it.html || r.it.text) : (r.it.html || r.it.text); });
    list.forEach(r => { r.el.style.display = ''; r.el.style.visibility = 'hidden'; r.el.style.transform = 'none'; });
    put(false); list.forEach(r => { const b = r.el.getBoundingClientRect(); r.wc = b.width; r.hc = b.height; });
    put(true); list.forEach(r => { const b = r.el.getBoundingClientRect(); r.wo = b.width; r.ho = b.height; });
    list.forEach((r, i) => { [r.el.className, r.el.innerHTML, r.el.style.display, r.el.style.visibility, r.el.style.transform] = keep[i]; r.mode = null; r.tr = null; });
  }
  /* the boxes no name may cover (the bag, the tools), on the names' layer, with a margin */
  keeps(pad = this.pad || 6) {
    const lr = this.layer.getBoundingClientRect(); this.pad = pad;
    this.out = (this.keepOut || []).map(e => e && e.getBoundingClientRect()).filter(r => r && r.width).map(r => ({ l: r.left - lr.left - pad, r: r.right - lr.left + pad, t: r.top - lr.top - pad, b: r.bottom - lr.top + pad }));
  }
  /* can the camera see this point of a part? Nothing solid between them, or only the part itself (its own envelope);
     a part hidden from view (the Year 7 cell hides the rest) blocks nothing */
  visible(p, own) {
    const cam = this.w.camera, d = p.clone().sub(cam.position), len = d.length();
    const h = firstHit(this.w.solids || [], new THREE.Ray(cam.position.clone(), d.normalize()), len + 0.05);
    if (!h || h.d > len - 0.35) return true;
    return !!(own && own.some(o => { for (let x = h.o; x; x = x.parent) if (x === o) return true; return false; }));
  }
  /* where a point is on the screen (px), with the camera as it is now */
  proj(p) {
    const v = this.v.copy(p).project(this.w.camera), s = this.w.size;
    return { x: (v.x * 0.5 + 0.5) * s.w, y: (-v.y * 0.5 + 0.5) * s.h, front: v.z < 1 && v.z > -1 };
  }
  /* the two edges of what is named: the frame given (the way in, a magnified view), or the cell's two sides at the height
     of its middle across the view: at the map's own view the points (±7.4, 7, 0), turned, the sides of its outline (CELL:
     half-widths 7.4 and 6.2) where the view's right points; the names stand just outside them */
  cols(right) {
    let l = this.edges && this.edges.l, r = this.edges && this.edges.r;
    if (!l) {
      const e = this.w.camera.matrixWorld.elements, th = Math.atan2(e[2], e[0]), x = 7.4 * se(Math.cos(th)), z = 6.2 * se(Math.sin(th));
      l = this.eL.set(-x, 7, -z); r = this.eR.set(x, 7, z);
    }
    const pl = this.proj(l), pr = this.proj(r), cx = (pl.x + pr.x) / 2;
    return { pl, pr, cx, colL: Math.max(8, Math.min(pl.x - 6, cx - 40)), colR: Math.min(right - 8, Math.max(pr.x + 6, cx + 40)) };
  }
  /* where a placed name stands now: its middle (cx, cy), its size and its line (x1 at the name, x2 on the part) */
  target(r, c) {
    const a = r.at, sc = this.proj(a.spot);
    if (a.mode === 'col') { const x1 = a.side === 'L' ? c.colL : c.colR, w = r.wc; return { sc, w, h: r.hc, cx: a.side === 'L' ? x1 - w / 2 : x1 + w / 2, cy: sc.y, ln: { x1, x2: sc.x, y: sc.y } }; }
    const w = r.wo, h = r.ho;
    if (!a.line) return { sc, w, h, cx: sc.x, cy: sc.y, ln: null };
    const cx = a.line > 0 ? sc.x + 22 + w / 2 : sc.x - 22 - w / 2;
    return { sc, w, h, cx, cy: sc.y, ln: { x1: a.line > 0 ? cx - w / 2 : cx + w / 2, x2: sc.x, y: sc.y } };
  }

  /* ---------- the layout, made when the list changes and each time the camera stops ---------- */
  show() {
    const W = this.w, s = W.size;
    this.dirty = false;
    if (!this.items.length) { this.order = []; this.report = []; this.count = 0; this.left = 0; this.frame(); return; }
    W.camera.updateMatrixWorld();
    this.svg.setAttribute('viewBox', `0 0 ${s.w} ${s.h}`);
    const right = s.w - (W.inset.right || 0), bottom = s.h - (W.inset.bottom || 0), c = this.cols(right);
    /* (a name still seen at all, even one just left out and fading, is where it was: it never jumps to a new place, it
       glides or goes out and in; one stepping back to go to another place is still where it was, until it is in there) */
    const was = new Map([...this.m.values()].map(r => [r, { at: r.at, shows: r.st.s !== 'hidden', swap: r.next ? r.swap : null }]));
    [...this.m.values()].forEach(r => { r.place = false; r.next = null; r.back = false; });
    /* no room beside the cell (a phone, a tablet held upright, the camera close): names stand on their parts instead */
    if (s.w < 640 || (c.colL < 140 && right - c.colR < 140)) this.layOn(right, bottom); else this.layCol(c, right, bottom);
    /* the names that move go there smoothly: up or down to a new row, along to another point of their part; to the other
       side, from beside the cell onto their part (the camera came close), or past another name, out at the old place and
       in at the new, so that no name crosses the picture or another name; a name that was not showing comes in there */
    const now = performance.now(), placed = [...was.keys()].filter(r => r.place);
    const at = new Map(placed.map(r => { const T = this.target(r, c); return [r, { T, l: T.cx - T.w / 2, r: T.cx + T.w / 2, t: T.cy - T.h / 2, b: T.cy + T.h / 2 }]; }));
    const meets = (q, o) => q.l < o.r + 2 && q.r > o.l - 2 && q.t < o.b + 2 && q.b > o.t - 2;
    for (const [r, b] of was) {
      if (!r.place) { if (b.at && !r.at) r.at = b.at; continue; }
      const a = r.at, N = at.get(r), T = N.T, g0 = r.g; r.g = null;
      if (!b.shows || !b.at || this.calm || r.x == null) continue;
      const same = a.mode === b.at.mode && (a.mode === 'col' ? a.side === b.at.side : a.line === b.at.line);
      /* the same place as before (side, point): a glide on its way goes on as it was; a step out to go elsewhere is
         called off (it comes back in where it is) */
      if (same && a.spot.distanceToSquared(b.at.spot) < 1e-12) { if (b.swap == null) r.g = g0; continue; }
      /* to the other side, onto its part or off it, or already on its way out: out at the old place, in at the new */
      const out = () => { r.next = a; r.at = b.at; r.place = false; r.swap = b.swap ?? now; };
      if (!same || b.swap != null) { out(); continue; }
      /* the same side, another point: it glides there (beside the cell its column stays: only up or down) */
      const g = { t0: now, dx: a.mode === 'col' ? 0 : r.x - T.cx, dy: r.y - T.cy, ex: (r.ex ?? r.x) - (T.ln ? T.ln.x2 : T.cx), ey: (r.ey ?? r.y) - (T.ln ? T.ln.y : T.cy) };
      if (Math.max(Math.abs(g.dx), Math.abs(g.dy), Math.abs(g.ex), Math.abs(g.ey)) <= 0.5) continue;
      /* the way it would glide: from where it is to where it goes; over another name, it goes out and in instead */
      const path = { l: Math.min(N.l, N.l + g.dx), r: Math.max(N.r, N.r + g.dx), t: Math.min(N.t, N.t + g.dy), b: Math.max(N.b, N.b + g.dy) };
      if (placed.some(o => o !== r && meets(path, at.get(o)))) { out(); continue; }
      r.g = g;
    }
    this.layer.classList.add('on');
    this.idle = false;
    this.pl = this.pr = null;   /* the layout is made for the camera as it is: no motion counted since (a new frame given) */
    this.frame();
  }
  /* which names show is decided as before 8 Nov 2026: the names with the fewest choices first, so that the most fit
     (with IB on at the way in, the IB name for the membrane among them). Where each of those stands is kept from before
     when every one of them still fits that way (the camera has moved or the list has changed: nothing moves that need
     not); else they stand where the first way puts them */
  choose(plan) {
    const fresh = plan(false), keep = plan(true, new Set(fresh.got.keys()));
    return { use: keep.got.size === fresh.got.size ? keep : fresh, fresh };
  }
  layCol(c, right, bottom) {
    const W = this.w, s = W.size, { colL, colR, cx } = c;
    const GAP = s.w < 700 ? 8 : 10;                 /* names on one side stand at least this far apart */
    this.keeps(6);
    const boxAt = (r, side, y) => side === 'L' ? { l: colL - r.wc, r: colL, t: y - r.hc / 2, b: y + r.hc / 2 } : { l: colR, r: colR + r.wc, t: y - r.hc / 2, b: y + r.hc / 2 };
    const cand = this.items.map(it => {
      const pts = it.spots.map(p => ({ p, sc: this.proj(p) })).filter(o => o.sc.front && o.sc.x > 6 && o.sc.x < right - 6 && o.sc.y > 20 && o.sc.y < bottom - 10);
      return { r: this.m.get(it.key), it, pts: pts.filter(o => it.free || this.visible(o.p, it.own)) };
    });
    /* one way of placing them: sticky, the names that stand already first, each on its side at its point, while that point
       is still seen, its row is free and its line does not cross most of the cell (the camera turned far); then the
       others, the fewest choices first, each on its own side first, at its nearest point */
    const plan = (sticky, only) => {
      const rows = { L: [], R: [] }, got = new Map(), why = new Map();
      const ok = (cd, side, y) => {
        const bx = boxAt(cd.r, side, y), w = why.get(cd) || { edge: 0, bag: 0, row: 0 }; why.set(cd, w);
        if (bx.l < 4 || bx.r > right - 4 || bx.t < 4 || bx.b > bottom - 4) { w.edge++; return false; }
        if (this.out.some(o => bx.l < o.r && bx.r > o.l && bx.t < o.b && bx.b > o.t)) { w.bag++; return false; }
        if (rows[side].every(o => Math.abs(o.y - y) >= (o.h + cd.r.hc) / 2 + GAP)) return true;
        w.row++; return false;
      };
      const take = (cd, side, o) => { rows[side].push({ y: Math.round(o.sc.y), h: cd.r.hc }); got.set(cd, { side, o }); };
      if (sticky) this.order.forEach(k => {
        const cd = cand.find(x => x.it.key === k), a = cd && cd.r.at; if (!a || a.mode !== 'col' || !only.has(cd)) return;
        const o = cd.pts.find(x => x.p.distanceToSquared(a.spot) < 1e-12); if (!o) return;
        if (cd.it.side && cd.it.side !== a.side) return;
        if (a.side === 'L' ? o.sc.x < colL + 20 : o.sc.x > colR - 20) return;
        if (!cd.it.side && Math.abs(o.sc.x - (a.side === 'L' ? colL : colR)) > 0.6 * (colR - colL)) return;
        if (ok(cd, a.side, Math.round(o.sc.y))) take(cd, a.side, o);
      });
      cand.filter(cd => !got.has(cd) && cd.pts.length && (!only || only.has(cd))).sort((a, b) => a.pts.length - b.pts.length).forEach(cd => {
        const pref = cd.pts.reduce((a, o) => a + o.sc.x, 0) / cd.pts.length < cx ? 'L' : 'R';
        let best = null;
        for (const side of cd.it.side ? [cd.it.side] : [pref, pref === 'L' ? 'R' : 'L']) {
          for (const o of cd.pts) {
            const y = Math.round(o.sc.y);
            if (side === 'L' && o.sc.x < colL + 20) continue;
            if (side === 'R' && o.sc.x > colR - 20) continue;
            if (!ok(cd, side, y)) continue;
            const cost = Math.abs(o.sc.x - (side === 'L' ? colL : colR)) * 0.2;
            if (!best || cost < best.cost) best = { side, o, cost };
          }
          if (best) break;
        }
        if (best) take(cd, best.side, best.o);
      });
      return { got, why };
    };
    const { use, fresh } = this.choose(plan);
    use.got.forEach(({ side, o }, cd) => { cd.r.place = true; cd.r.hid = false; cd.r.at = { mode: 'col', side, spot: o.p }; });
    this.order = [...use.got.keys()].map(cd => cd.it.key);
    this.count = use.got.size; this.left = this.items.length - use.got.size;
    /* for the checks (tools/names-check.mjs, names-follow.mjs): what was placed or left out, and why */
    this.report = cand.map(cd => { const p = use.got.get(cd); return { key: cd.it.key, spots: cd.it.spots.length, seen: cd.pts.length, placed: !!p, side: p && p.side, y: p && Math.round(p.o.sc.y), w: Math.round(cd.r.wc), why: p ? undefined : fresh.why.get(cd) || { edge: 0, bag: 0, row: 0 } }; });
  }
  /* a phone: no room beside the cell, so each name stands ON its part (at one of its spots), no line; names never cover
     one another or the bag; a name with no free spot is left out (the panel lists every place) */
  layOn(right, bottom) {
    this.keeps(4);
    const seen = sc => sc.front && sc.x > 0 && sc.x < right && sc.y > 0 && sc.y < bottom;
    /* alt: other parts of the same kind its name may stand on when its own spots have no room, each only if nothing
       hides it (the mitochondrion on a phone's map: it lies small among other names) */
    const cand = this.items.map(it => ({ r: this.m.get(it.key), it,
      pts: it.spots.map(p => ({ p, sc: this.proj(p) })).filter(o => seen(o.sc)).concat((it.alt || []).filter(p => this.visible(p, it.own)).map(p => ({ p, sc: this.proj(p) })).filter(o => seen(o.sc))) }));
    /* on the part itself; else just beside it, with a short level line that ends on it. A name marked aside (a protein it
       would hide) tries beside it first */
    const tries = cd => {
      const w = cd.r.wo, h = cd.r.ho, t = [];
      cd.pts.forEach(o => {
        const sc = o.sc, on = { o, line: 0, bx: { l: sc.x - w / 2, r: sc.x + w / 2, t: sc.y - h / 2, b: sc.y + h / 2 } };
        const by = (cd.it.prefer === -1 ? [-1, 1] : [1, -1]).map(k => { const l = k > 0 ? sc.x + 22 : sc.x - 22 - w; return { o, line: k, bx: { l, r: l + w, t: sc.y - h / 2, b: sc.y + h / 2 } }; });
        if (cd.it.aside) t.push(...by, on); else t.push(on, ...by);
      });
      return t;
    };
    /* one way of placing them: sticky, the names that stand already first, where they stand, while that is still free;
       then the others, the fewest spots first */
    const plan = (sticky, only) => {
      const boxes = [], got = new Map(), why = new Map();
      const hit = bx => bx.l < 2 || bx.r > right - 2 || bx.t < 2 || bx.b > bottom - 2 || this.out.concat(boxes).some(o => bx.l < o.r && bx.r > o.l && bx.t < o.b && bx.b > o.t);
      const take = (cd, t) => { boxes.push({ l: t.bx.l - 3, r: t.bx.r + 3, t: t.bx.t - 3, b: t.bx.b + 3 }); got.set(cd, t); };
      if (sticky) this.order.forEach(k => {
        const cd = cand.find(x => x.it.key === k), a = cd && cd.r.at; if (!a || a.mode !== 'on' || !only.has(cd)) return;
        const t = tries(cd).find(x => x.line === a.line && x.o.p.distanceToSquared(a.spot) < 1e-12);
        if (t && !hit(t.bx)) take(cd, t);
      });
      cand.filter(cd => !got.has(cd) && (!only || only.has(cd))).sort((a, b) => a.pts.length - b.pts.length).forEach(cd => {
        const ts = tries(cd), t = ts.find(x => !hit(x.bx));
        if (!t) { why.set(cd, { edge: ts.filter(x => x.bx.l < 2 || x.bx.r > right - 2 || x.bx.t < 2 || x.bx.b > bottom - 2).length, box: ts.length }); return; }
        take(cd, t);
      });
      return { got, why };
    };
    const { use, fresh } = this.choose(plan);
    use.got.forEach((t, cd) => { cd.r.place = true; cd.r.hid = false; cd.r.at = { mode: 'on', line: t.line, spot: t.o.p }; });
    this.order = [...use.got.keys()].map(cd => cd.it.key);
    this.count = use.got.size; this.left = this.items.length - use.got.size;
    this.report = cand.map(cd => { const t = use.got.get(cd); return { key: cd.it.key, spots: cd.it.spots.length, seen: cd.pts.length, placed: !!t, side: t && t.line ? (t.line > 0 ? 'R' : 'L') : 'on', y: t && Math.round(t.o.sc.y), why: t ? undefined : fresh.why.get(cd) }; });
  }

  /* ---------- every frame the world draws: each name with its part ---------- */
  frame() {
    const W = this.w, s = W.size, now = performance.now();
    if (!this.m.size && !this.gone.size) return;
    W.camera.updateMatrixWorld();
    /* a frame where nothing changed (the most common one: a pupil reading): the camera and the screen as before, no part's
       point moved, no name moving, fading or waiting for its place, no layout due: nothing to do */
    const cam = this.camChanged();
    if (this.idle && !cam && !this.dirty && !this.spotsMoved()) return;
    const right = s.w - (W.inset.right || 0), bottom = s.h - (W.inset.bottom || 0), c = this.cols(right);
    /* has the camera moved? (the edges and the parts moved on the screen) */
    const d = (a, b) => b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    let move = Math.max(d(c.pl, this.pl), d(c.pr, this.pr)); this.pl = c.pl; this.pr = c.pr;
    /* a name going to the other side, or onto its part: in at its new place once it has stepped back at the old */
    for (const r of this.m.values()) if (r.next && now - r.swap >= FADE) { r.at = r.next; r.next = null; r.place = true; r.g = null; }
    const recs = this.order.map(k => this.m.get(k)).filter(r => r && r.at)
      .concat([...this.m.values()].filter(r => r.at && !this.order.includes(r.key)), [...this.gone].filter(r => r.at));
    /* (a name the layout moved to another point has not moved with the camera) */
    const T = recs.map(r => { const t = this.target(r, c); if (r.on === r.at.spot) move = Math.max(move, d(t.sc, r.sc)); r.on = r.at.spot; r.sc = t.sc; return t; });
    const moving = move > 0.3;
    if (moving) { this.still = 0; this.dirty = true; } else this.still++;
    /* while the camera moves, one name a frame is looked at again: has its part gone behind something solid? */
    if (moving) {
      const look = recs.filter(r => r.place && r.at.mode === 'col' && !r.it.free);
      if (look.length) { const r = look[this.rr++ % look.length]; r.hid = !this.visible(r.at.spot, r.it.own); }
    }
    const shown = [], rest = !moving && this.still >= SETTLE;
    /* names on their way out where they stand (taken off the list, left out, or going to another place), still seen: a
       name not yet showing waits until they have gone (out, then in: two names never over each other) */
    const going = recs.filter(r => r.st.s !== 'hidden' && (r.leaving || !r.place || r.next) && r.x != null).map(r => {
      const w = r.at.mode === 'col' ? r.wc : r.wo, h = r.at.mode === 'col' ? r.hc : r.ho;
      return { r, l: r.x - w / 2, rr: r.x + w / 2, t: r.y - h / 2, b: r.y + h / 2 };
    });
    recs.forEach((r, i) => {
      const t = T[i];
      let gx = 0, gy = 0, ex = 0, ey = 0;
      if (r.g) { const k = (now - r.g.t0) / GLIDE; if (k >= 1) r.g = null; else { const q = 1 - ease(k); gx = r.g.dx * q; gy = r.g.dy * q; ex = r.g.ex * q; ey = r.g.ey * q; } }
      const cx = t.cx + gx, cy = t.cy + gy, b = { l: cx - t.w / 2, r: cx + t.w / 2, t: cy - t.h / 2, b: cy + t.h / 2 };
      const ln = t.ln && { x1: t.ln.x1 + gx, y1: t.ln.y + gy, x2: t.ln.x2 + ex, y2: t.ln.y + ey };
      r.x = cx; r.y = cy; r.ex = ln ? ln.x2 : cx; r.ey = ln ? ln.y2 : cy;
      const fit = r.place && !r.leaving && !r.next ? this.fits(r, t, b, right, bottom, shown, going) : 1, want = fit === 0;
      if (r.place && !r.leaving && !r.next) r.back = !want;
      if (want) shown.push({ ...b, g: !!r.g });
      this.paint(r, b, ln, want, now, rest && !r.g, fit === 2);
    });
    this.idle = rest && !this.dirty && !this.gone.size && recs.every(r => !r.g && !r.next && (r.st.s === 'in' || r.st.s === 'hidden') && (r.lst.s === 'in' || r.lst.s === 'hidden'));
    if (this.idle) recs.forEach(r => { r.sp = [r.at.spot.x, r.at.spot.y, r.at.spot.z]; });
    if (this.dirty && this.still >= SETTLE && !W.moving && !W.flying && this.items.length) this.show();
  }
  /* has the camera, the screen or the panel's inset changed since the last frame? */
  camChanged() {
    const W = this.w, c = W.camera, k = this.ck || (this.ck = new Float64Array(36)); let ch = false;
    const put = (i, v) => { if (k[i] !== v) { k[i] = v; ch = true; } };
    for (let i = 0; i < 16; i++) { put(i, c.matrixWorld.elements[i]); put(16 + i, c.projectionMatrix.elements[i]); }
    put(32, W.size.w); put(33, W.size.h); put(34, W.inset.right || 0); put(35, W.inset.bottom || 0);
    return ch;
  }
  /* has a part's point moved (a point that play.js moves with its part)? */
  spotsMoved() {
    for (const r of this.m.values()) { const p = r.at && r.at.spot; if (p && (!r.sp || r.sp[0] !== p.x || r.sp[1] !== p.y || r.sp[2] !== p.z)) return true; }
    return false;
  }
  /* may a placed name show this frame? 0: yes. 1: no, it fades out: its part is out of the picture or behind something,
     or its line is too short or the wrong way (or, not showing yet, a name going away still stands where it would).
     2: no, at once: it would cover a name placed before it, the bag or the panel, or leave the picture (a name never
     lies over another, not even while it fades). A name that stepped back needs a little more room to come back (no
     flicker at the edge), a name just placed none */
  fits(r, t, b, right, bottom, shown, going = []) {
    const sc = t.sc, mg = r.back ? 4 : 0;
    if (!sc.front || r.hid) return 1;
    if (r.at.mode === 'col') {
      if (sc.x < 6 + mg || sc.x > right - 6 - mg || sc.y < 20 + mg || sc.y > bottom - 10 - mg) return 1;
      if ((r.at.side === 'L' ? sc.x - t.ln.x1 : t.ln.x1 - sc.x) < 12 + mg) return 1;
    } else if (sc.x < mg || sc.x > right - mg || sc.y < mg || sc.y > bottom - mg) return 1;
    if (b.l < 2 + mg || b.r > right - 2 - mg || b.t < 2 + mg || b.b > bottom - 2 - mg) return 2;
    const hit = o => b.l < o.r + mg && b.r > o.l - mg && b.t < o.b + mg && b.b > o.t - mg;
    if ((this.out || []).some(hit)) return 2;
    if (r.st.s !== 'in' && going.some(o => o.r !== r && b.l < o.rr + mg && b.r > o.l - mg && b.t < o.b + mg && b.b > o.t - mg)) return 1;
    return !r.g && shown.some(o => !o.g && hit(o)) ? 2 : 0;
  }
  /* a name shows (in), steps back (out: it fades), or is away (hidden: not drawn, so nothing on the world avoids it);
     at once (now) when it would lie over another name; it always comes back with its fade */
  vis(el, st, want, cls, now, at) {
    if (want) {
      if (st.s === 'hidden') { el.style.display = ''; el.style.visibility = ''; st.s = 'wake'; }   /* in from the next frame */
      else if (st.s !== 'in') { el.style.transition = ''; el.classList.remove(cls); st.s = 'in'; }
    } else if (at && st.s !== 'hidden') { el.classList.add(cls); el.style.transition = 'none'; el.style.display = 'none'; el.style.visibility = 'hidden'; st.s = 'hidden'; }
    else if (st.s === 'in' || st.s === 'wake') { el.classList.add(cls); st.s = 'out'; st.t = now; }
    else if (st.s === 'out' && now - st.t >= FADE) { el.style.display = 'none'; el.style.visibility = 'hidden'; st.s = 'hidden'; }
  }
  paint(r, b, ln, want, now, rest, at) {
    const el = r.el, L = r.line, it = r.it || {};
    /* its words and look for where it stands: beside the cell (L, R) or on its part (a phone's words) */
    const mode = r.at.mode === 'on' ? 'on' : r.at.side;
    if (r.mode !== mode) {
      r.mode = mode;
      const html = mode === 'on' ? (it.small || it.html || it.text) : (it.html || it.text);
      if (el.innerHTML !== html) el.innerHTML = html;
      el.className = 'nm ' + (mode === 'on' ? 'nm--on' : 'nm--' + mode) + (it.cls ? ' ' + it.cls : '') + (r.st.s === 'in' ? '' : ' nm--away');
      L.setAttribute('class', 'nml' + (it.cls ? ' ' + it.cls : '') + (r.lst.s === 'in' ? '' : ' nml--away'));
    }
    this.vis(el, r.st, want, 'nm--away', now, at);
    /* a name standing on its part has no line (it has just faded out with the name, beside the cell) */
    if (ln) this.vis(L, r.lst, want, 'nml--away', now, at);
    else if (r.lst.s !== 'hidden') { L.classList.add('nml--away'); L.style.display = 'none'; r.lst.s = 'hidden'; }
    if (!!r.g !== !!r.gm) { if (r.g) el.setAttribute('data-glide', ''); else el.removeAttribute('data-glide'); r.gm = !!r.g; }
    if (r.st.s !== 'hidden') {
      /* while it moves, where its part is to a fraction of a pixel; at rest, on whole pixels (sharp words) */
      const x = rest ? Math.round(b.l) : b.l, y = rest ? Math.round(b.t) : b.t, tr = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      if (tr !== r.tr) { el.style.transform = tr; r.tr = tr; }
    }
    if (ln && r.lst.s !== 'hidden') {
      const a = [ln.x1, ln.y1, ln.x2, ln.y2].map(v => v.toFixed(2)), k = a.join();
      if (k !== r.lk) { L.setAttribute('x1', a[0]); L.setAttribute('y1', a[1]); L.setAttribute('x2', a[2]); L.setAttribute('y2', a[3]); r.lk = k; }
    }
  }
}
