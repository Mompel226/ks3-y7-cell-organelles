/* ============================================================
   names.js — the names on the 3D world (4 Nov 2026), by Daniel's rules (memory label-lines-never-cross):
   - names show only while the camera is still, all at once, and go when it moves again;
   - every name is joined to its part by ONE level line that ends ON the part (no dot, no full stop);
   - names on one side stand a full row apart; a name that finds no free row moves along its own part (another of its
     spots), then to the other side; only then is it left out (on the map every place is also in the list of places);
   - a spot hidden behind something solid is never used (a ray from the camera must reach the part first).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';

export class Names {
  constructor(world, layer) {
    this.w = world; this.layer = layer; this.items = []; this.ray = new THREE.Raycaster();
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); this.svg.setAttribute('class', 'names__lines');
    layer.appendChild(this.svg);
    world.on('moving', () => this.hide());
    world.on('still', () => this.show());
    world.on('resize', () => { if (!world.moving) this.show(); });
  }
  /* list: [{ key, text, html, cls, spots: [Vector3], own: [Object3D] (what counts as the part itself), press,
     free (a spot in the open, a region such as the cytoplasm: no ray test), small (shorter words for a phone, where each
     name stands on its part) }];
     keepOut: elements on the world (the bag, the tools) that no name may cover;
     frame: { l, r } (Vector3), the left and right edges of what is named, when it is not the whole cell (the way in) */
  set(list, keepOut, frame) {
    this.items = list; this.frame = frame || null;
    if (keepOut) {
      this.keepOut = keepOut;
      /* a box that grows (the bag fills as the pupil gains items) never ends up over a name: the names are placed again */
      this.ro = this.ro || new ResizeObserver(() => { if (this.items.length && !this.w.moving && this.layer.classList.contains('on')) this.show(); });
      keepOut.forEach(e => e && this.ro.observe(e));
    }
    if (!this.w.moving) this.show();
  }
  hide() { this.layer.classList.remove('on'); }
  visible(p, own) {
    const cam = this.w.camera, d = p.clone().sub(cam.position), len = d.length();
    this.ray.set(cam.position, d.normalize()); this.ray.far = len + 0.05;
    /* a part hidden from view (the Year 7 cell hides the rest) blocks nothing */
    const shown = o => { for (let x = o; x; x = x.parent) if (!x.visible) return false; return true; };
    const hits = this.ray.intersectObjects(this.w.solids, true).filter(h => shown(h.object));
    if (!hits.length) return true;
    const h = hits[0];
    if (h.distance > len - 0.35) return true;
    return !!(own && own.some(o => { let x = h.object; while (x) { if (x === o) return true; x = x.parent; } return false; }));
  }
  show() {
    const W = this.w, s = W.size, cam = W.camera;
    cam.updateMatrixWorld();
    [...this.layer.querySelectorAll('.nm')].forEach(e => e.remove());
    this.svg.innerHTML = ''; this.svg.setAttribute('viewBox', `0 0 ${s.w} ${s.h}`);
    const right = s.w - (W.inset.right || 0), bottom = s.h - (W.inset.bottom || 0);
    const GAP = s.w < 700 ? 8 : 10;                 /* names on one side stand at least this far apart */
    /* the cell's edges on screen, at the height of its middle: names stand just outside them */
    const midL = W.project(this.frame ? this.frame.l : new THREE.Vector3(-7.4, 7, 0)), midR = W.project(this.frame ? this.frame.r : new THREE.Vector3(7.4, 7, 0));
    const cx = (midL.x + midR.x) / 2;
    const colL = Math.max(8, Math.min(midL.x - 6, cx - 40)), colR = Math.min(right - 8, Math.max(midR.x + 6, cx + 40));
    const lr = this.layer.getBoundingClientRect();
    /* no room beside the cell (a phone, a tablet held upright): names stand on their parts instead */
    if (s.w < 640 || (colL < 140 && right - colR < 140)) return this.showOn(lr, right, bottom);
    const out = (this.keepOut || []).map(e => e.getBoundingClientRect()).filter(r => r.width).map(r => ({ l: r.left - lr.left - 6, r: r.right - lr.left + 6, t: r.top - lr.top - 6, b: r.bottom - lr.top + 6 }));
    /* every name is made once and measured; then each of its spots is tried, on its own side first */
    const made = this.items.map(it => {
      const el = document.createElement(it.press ? 'button' : 'span');
      el.className = 'nm ' + (it.cls || ''); if (it.press) el.type = 'button';
      el.innerHTML = it.html || it.text; el.style.visibility = 'hidden';
      this.layer.appendChild(el);
      const r = el.getBoundingClientRect();
      return { it, el, w: r.width, h: r.height };
    });
    const rows = { L: [], R: [] };
    const boxAt = (m, side, y) => side === 'L' ? { l: colL - m.w, r: colL, t: y - m.h / 2, b: y + m.h / 2 } : { l: colR, r: colR + m.w, t: y - m.h / 2, b: y + m.h / 2 };
    const ok = (m, side, y) => {
      const bx = boxAt(m, side, y);
      m.why = m.why || { edge: 0, bag: 0, row: 0 };
      if (bx.l < 4 || bx.r > right - 4 || bx.t < 4 || bx.b > bottom - 4) { m.why.edge++; return false; }
      if (out.some(o => bx.l < o.r && bx.r > o.l && bx.t < o.b && bx.b > o.t)) { m.why.bag++; return false; }
      if (rows[side].every(r => Math.abs(r.y - y) >= (r.h + m.h) / 2 + GAP)) return true;
      m.why.row++; return false;
    };
    const cand = made.map(m => {
      const pts = m.it.spots.map(p => ({ p, sc: W.project(p) })).filter(o => o.sc.inFront && o.sc.x > 6 && o.sc.x < right - 6 && o.sc.y > 20 && o.sc.y < bottom - 10);
      return { m, pts: pts.filter(o => m.it.free || this.visible(o.p, m.it.own)) };
    });
    /* the names with the fewest choices first */
    const order = cand.filter(c => c.pts.length).sort((a, b) => a.pts.length - b.pts.length);
    const placed = [];
    order.forEach(c => {
      const pref = c.pts.reduce((a, o) => a + o.sc.x, 0) / c.pts.length < cx ? 'L' : 'R';
      let best = null;
      for (const side of [pref, pref === 'L' ? 'R' : 'L']) {
        for (const o of c.pts) {
          const y = Math.round(o.sc.y);
          if (side === 'L' && o.sc.x < colL + 20) continue;
          if (side === 'R' && o.sc.x > colR - 20) continue;
          if (!ok(c.m, side, y)) continue;
          const cost = Math.abs(o.sc.x - (side === 'L' ? colL : colR)) * 0.2;
          if (!best || cost < best.cost) best = { side, y, x: o.sc.x, cost };
        }
        if (best) break;
      }
      if (!best) return;
      rows[best.side].push({ y: best.y, h: c.m.h });
      placed.push({ c, ...best });
    });
    made.forEach(m => { if (!placed.some(p => p.c.m === m)) m.el.remove(); });
    placed.forEach(({ c, side, y, x }) => {
      const { it, el } = c.m;
      el.classList.add('nm--' + side); el.style.top = y + 'px'; el.style.visibility = '';
      if (side === 'L') el.style.right = (s.w - colL) + 'px'; else el.style.left = colR + 'px';
      if (it.press) el.addEventListener('click', it.press);
      if (it.label) el.setAttribute('aria-label', it.label);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', side === 'L' ? colL : colR); line.setAttribute('x2', x); line.setAttribute('y1', y); line.setAttribute('y2', y);
      line.setAttribute('class', 'nml ' + (it.cls || ''));
      this.svg.appendChild(line);
    });
    this.count = placed.length; this.left = this.items.length - placed.length;
    /* for the checks (tools/names-check.mjs): what was placed or left out */
    this.report = cand.map(c => { const p = placed.find(x => x.c === c); return { key: c.m.it.key, spots: c.m.it.spots.length, seen: c.pts.length, placed: !!p, side: p && p.side, y: p && p.y, w: Math.round(c.m.w), why: p ? undefined : c.m.why }; });
    requestAnimationFrame(() => this.layer.classList.add('on'));
  }
  /* a phone: no room beside the cell, so each name stands ON its part (at one of its spots), no line; names never cover
     one another or the bag; a name with no free spot is left out (the panel lists every place) */
  showOn(lr, right, bottom) {
    const W = this.w, out = (this.keepOut || []).map(e => e.getBoundingClientRect()).filter(r => r.width).map(r => ({ l: r.left - lr.left - 4, r: r.right - lr.left + 4, t: r.top - lr.top - 4, b: r.bottom - lr.top + 4 }));
    const boxes = [], placed = [];
    const cand = this.items.map(it => {
      const el = document.createElement(it.press ? 'button' : 'span');
      el.className = 'nm nm--on ' + (it.cls || ''); if (it.press) el.type = 'button';
      el.innerHTML = it.small || it.html || it.text; el.style.visibility = 'hidden'; this.layer.appendChild(el);
      const r = el.getBoundingClientRect();
      const pts = it.spots.map(p => W.project(p)).filter(sc => sc.inFront && sc.x > 0 && sc.x < right && sc.y > 0 && sc.y < bottom);
      return { it, el, w: r.width, h: r.height, pts };
    }).sort((a, b) => a.pts.length - b.pts.length);
    this.svg.innerHTML = '';
    cand.forEach(c => {
      const hit = (bx) => bx.l < 2 || bx.r > right - 2 || bx.t < 2 || bx.b > bottom - 2 || out.concat(boxes).some(o => bx.l < o.r && bx.r > o.l && bx.t < o.b && bx.b > o.t);
      /* on the part itself; else just beside it, with a short level line that ends on it */
      const tries = [];
      c.pts.forEach(sc => {
        tries.push({ sc, bx: { l: sc.x - c.w / 2, r: sc.x + c.w / 2, t: sc.y - c.h / 2, b: sc.y + c.h / 2 } });
        [1, -1].forEach(k => { const gap = 22, l = k > 0 ? sc.x + gap : sc.x - gap - c.w; tries.push({ sc, line: k, bx: { l, r: l + c.w, t: sc.y - c.h / 2, b: sc.y + c.h / 2 } }); });
      });
      const at = tries.find(o => !hit(o.bx));
      if (!at) { c.el.remove(); return; }
      boxes.push({ l: at.bx.l - 3, r: at.bx.r + 3, t: at.bx.t - 3, b: at.bx.b + 3 });
      c.el.style.left = at.bx.l + 'px'; c.el.style.top = at.sc.y + 'px'; c.el.style.visibility = '';
      if (at.line) {
        const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', at.line > 0 ? at.bx.l : at.bx.r); ln.setAttribute('x2', at.sc.x); ln.setAttribute('y1', at.sc.y); ln.setAttribute('y2', at.sc.y);
        ln.setAttribute('class', 'nml ' + (c.it.cls || '')); this.svg.appendChild(ln);
      }
      if (c.it.press) c.el.addEventListener('click', c.it.press);
      if (c.it.label) c.el.setAttribute('aria-label', c.it.label);
      placed.push(c);
    });
    this.count = placed.length; this.left = this.items.length - placed.length;
    this.report = cand.map(c => ({ key: c.it.key, spots: c.it.spots.length, seen: c.pts.length, placed: placed.includes(c), side: 'on' }));
    requestAnimationFrame(() => this.layer.classList.add('on'));
  }
}
