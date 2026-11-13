/* ============================================================
   names.js — the names on the membrane view's picture (13 Nov 2026). The molecules never stop moving, so each name
   follows its part, every frame (as the game's own names do: memory label-lines-never-cross, "names FOLLOW their parts").
   The rules it keeps (Daniel's):
   - each name's line is ONE level line (from the left or right margin) or ONE upright line (from a band above or
     below), and it ENDS ON its part: the end is the part's own point of this frame;
   - lines never cross, a line never runs over another name, names never cover each other, and an upright line never
     runs over another named protein; a name that has no free place fades out (0.3 s) and fades in when one is free,
     never two over each other: the test looks a little ahead (PAD), so a name starts to go before it would touch;
   - a name keeps its place while it can (its row and its side are tried first), so nothing flickers; one whose part
     changes (another lipid of the kind is now the one at the cut face) fades where it stands and comes back there;
   - on a phone (a narrow picture) there is no room for words: each part has a numbered pin just above it or under the
     membrane, with a short upright line that ends on the part, and the numbers' names stand in a key under the
     picture (the estate's rule for a name with no free row).
   A label: { id, text, mode: 'L' | 'R' | 'T' | 'B' | 'tag', anchor(out) → false if it has no point now, own: the
   protein it names (its line may run over that one), pri }. 'tag' stands just above the one molecule that is followed.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';

const hit = (a, b, pad) => a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad;
const FADE = 320;

export function makeNames(stageEl, stage, keyEl) {
  const layer = document.createElement('div'); layer.className = 'memv__names'; layer.setAttribute('aria-hidden', 'true'); stageEl.appendChild(layer);
  let labs = [], narrow = false, keepOut = () => [], obstacles = () => [];
  const wp = new THREE.Vector3(), sp = { x: 0, y: 0, z: 0 }, cb = { l: 0, t: 0, r: 0, b: 0 }, cl = { l: 0, t: 0, r: 0, b: 0 };
  const px = n => (Math.round(n * 10) / 10) + 'px';

  function define(list, isNarrow) {
    /* a name that stays (the same part, the same words) keeps its place and does not blink */
    const old = new Map(narrow === !!isNarrow ? labs.map(L => [L.id, L]) : []);
    labs.forEach(L => { if (!old.has(L.id)) { L.box.remove(); L.line.remove(); L.pin.remove(); } });
    narrow = !!isNarrow; layer.classList.toggle('is-narrow', narrow);
    labs = list.map((d, n) => {
      const o = old.get(d.id);
      if (o && o.mode === d.mode && o.text === d.text) { old.delete(d.id); o.n = n; o.anchor = d.anchor; o.pri = d.pri || 0; o.own = d.own; if (d.mode !== 'tag') o.pin.textContent = String(n + 1); return o; }
      const box = document.createElement('span'); box.className = 'memv__nm memv__nm--' + d.mode + (d.tag ? ' memv__nm--tag' : ''); box.textContent = d.text; box.dataset.id = d.id;
      const line = document.createElement('i'); line.className = 'memv__ln';
      const pin = document.createElement('b'); pin.className = 'memv__pin' + (d.mode === 'tag' ? ' memv__pin--tag' : ''); pin.textContent = d.mode === 'tag' ? (d.mark || '★') : String(n + 1);
      layer.append(line, box, pin);
      return Object.assign({ n, box, line, pin, w: 0, h: 0, why: '', lowY: 0, cur: -1, vis: false, since: -1e9, ax: 0, ay: 0, ok: false,
        B: { l: 0, t: 0, r: 0, b: 0 }, Ln: { l: 0, t: 0, r: 0, b: 0 }, has: false, pri: 0 }, d);
    });
    old.forEach(L => { L.box.remove(); L.line.remove(); L.pin.remove(); });
    labs.sort((a, b) => b.pri - a.pri || a.n - b.n);
    measure();
    if (keyEl) {
      keyEl.innerHTML = labs.slice().sort((a, b) => a.n - b.n).map(L => `<span class="memv__k"><b>${L.mode === 'tag' ? (L.mark || '★') : L.n + 1}</b>${L.text}</span>`).join('');
      keyEl.hidden = !narrow || !labs.length;
    }
  }
  function measure() { labs.forEach(L => { L.w = L.box.offsetWidth; L.h = L.box.offsetHeight; }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure).catch(() => {});

  /* candidate k of a label: its name's box and its line, for the part's point of this frame; false if it cannot be */
  const SLIDE = [0, 1, -1];
  function geom(L, k, box, line) {
    const W = stage.W, H = stage.H, ax = L.ax, ay = L.ay, w = L.w, h = L.h;
    if (narrow) {
      /* a pin never stands ON the part it names (a pin is wider than a lipid: the expert review): above it for a part
         reached from above, under the membrane for the others, with a short upright line to the part */
      const up = L.mode === 'T' || L.mode === 'tag', cy = up ? ay - 28 : Math.max(ay + 26, L.lowY + 18);
      box.l = ax - 12; box.r = ax + 12; box.t = cy - 12; box.b = cy + 12; line.l = ax - 1; line.r = ax + 1;
      if (up) { line.t = box.b; line.b = ay; } else { line.t = ay; line.b = box.t; }
      return k === 0 && box.t >= 2 && box.b <= H - 2;
    }
    if (L.mode === 'L') {
      if (k > 0 || ax < w + 26) return false;
      box.l = 8; box.r = 8 + w; box.t = ay - h / 2; box.b = ay + h / 2; line.l = box.r; line.r = ax; line.t = ay - 1; line.b = ay + 1;
    } else if (L.mode === 'R') {
      if (k > 0 || ax > W - w - 26) return false;
      box.r = W - 8; box.l = W - 8 - w; box.t = ay - h / 2; box.b = ay + h / 2; line.l = ax; line.r = box.l; line.t = ay - 1; line.b = ay + 1;
    } else if (L.mode === 'T' || L.mode === 'B') {
      const row = Math.floor(k / 3), sl = SLIDE[k % 3] * (w / 2 - 16);
      if (row > (L.mode === 'T' ? 4 : 2)) return false;
      box.l = ax - w / 2 + sl; box.r = box.l + w;
      if (box.l < 8) { box.l = 8; box.r = 8 + w; } else if (box.r > W - 8) { box.r = W - 8; box.l = box.r - w; }
      if (ax < box.l + 10 || ax > box.r - 10) return false;
      /* rows 12 px apart: two names in neighbouring rows may stand one above the other (names keep 10 px from each other) */
      if (L.mode === 'T') { box.t = 10 + row * (h + 12); box.b = box.t + h; if (ay < box.b + 12) return false; line.t = box.b; line.b = ay; }
      else { box.b = H - 10 - row * (h + 12); box.t = box.b - h; if (ay > box.t - 12) return false; line.t = ay; line.b = box.t; }
      line.l = ax - 1; line.r = ax + 1;
    } else {    /* a tag: just above the molecule that is followed, or just under it */
      if (k > 1) return false;
      box.l = Math.max(8, Math.min(W - 8 - w, ax - w / 2)); box.r = box.l + w;
      if (ax < box.l + 8 || ax > box.r - 8) return false;
      if (k === 0) { box.b = ay - 34; box.t = box.b - h; line.t = box.b; line.b = ay; } else { box.t = ay + 34; box.b = box.t + h; line.t = ay; line.b = box.t; }
      line.l = ax - 1; line.r = ax + 1;
    }
    return box.t >= 4 && box.b <= H - 4 && box.l >= 4 && box.r <= W - 4;
  }
  function free(L, box, line, placed, keeps, obst) {
    const pad = narrow ? 3 : L.mode === 'tag' ? 26 : 10;
    for (const Q of placed) {
      if (hit(box, Q.B, pad)) { L.why = 'the name ' + Q.id; return false; }
      if (narrow) continue;
      if (hit(box, Q.Ln, 4) || hit(line, Q.B, 4) || hit(line, Q.Ln, 3)) { L.why = 'the line of ' + Q.id; return false; }
    }
    for (const kq of keeps) if (hit(box, kq, 6)) { L.why = 'a word or button on the picture'; return false; }
    if (!narrow && L.mode !== 'tag') for (const o of obst) {      /* (the tag of what is followed goes where its molecule goes) */
      if (o.id === L.own || o.b <= o.t + 1) continue;
      /* an upright line or a name over another named protein's part (a box on the screen, taken 4 px smaller): no */
      if ((L.mode === 'T' || L.mode === 'B') && line.r > o.l + 4 && line.l < o.r - 4 && line.b > o.t + 4 && line.t < o.b - 4) { L.why = 'its line over ' + o.id; return false; }
      if (box.r > o.l + 4 && box.l < o.r - 4 && box.b > o.t + 4 && box.t < o.b - 4) { L.why = 'its name over ' + o.id; return false; }
    }
    return true;
  }
  const placed = [];
  /* every frame the picture draws: show = names are wanted now (not during a camera move) */
  function frame(now, show) {
    placed.length = 0;
    const keeps = keepOut(), obst = narrow ? [] : obstacles(), W = stage.W, H = stage.H;
    for (const L of labs) {
      let ok = show && L.w > 0 && L.anchor(wp) !== false;
      const edge = narrow ? 13 : 6;      /* a pin is 24 px across: all of it in the picture */
      if (ok) { stage.project(wp, sp); ok = sp.z < 1 && sp.x > edge && sp.x < W - edge && sp.y > edge && sp.y < H - edge; }
      let want = -1;
      if (!ok) L.why = show ? 'its part is not in the picture' : '';
      /* a name whose line now ends on ANOTHER molecule (the one it had went behind a protein) never jumps there: it fades
         where it stands, then comes back at the new one */
      if (ok && L.vis && L.has && Math.hypot(sp.x - L.ax, sp.y - L.ay) > 28) { L.vis = false; L.since = now; }
      if (!L.vis && L.has && now - L.since < FADE) { placed.push(L); L.box.classList.remove('is-on'); L.line.classList.remove('is-on'); L.pin.classList.remove('is-on'); continue; }
      if (ok) {
        L.ax = sp.x; L.ay = sp.y;
        if (narrow) { wp.y = Math.min(wp.y, -2.5); stage.project(wp, sp); L.lowY = sp.y; }      /* the membrane's underside under the part */
        L.why = 'no room: w ' + L.w + ' at ' + Math.round(L.ax) + ', ' + Math.round(L.ay);
        /* its own place first; then every other */
        if (L.cur >= 0 && geom(L, L.cur, cb, cl) && free(L, cb, cl, placed, keeps, obst)) want = L.cur;
        else for (let k = 0; k < 15; k++) { if (k !== L.cur && geom(L, k, cb, cl) && free(L, cb, cl, placed, keeps, obst)) { want = k; break; } }
      }
      const gone = !L.vis && now - L.since >= FADE;
      if (want < 0) { if (L.vis) { L.vis = false; L.since = now; } }
      else if (L.cur === want) { if (!L.vis && gone) { L.vis = true; L.since = now; } }
      else if (L.vis) { L.vis = false; L.since = now; }
      else if (gone) { L.cur = want; L.vis = true; L.since = now; }
      /* where it stands this frame (also while it fades out: nothing may be put over it yet) */
      L.has = false;
      if (ok && L.cur >= 0 && (L.vis || !gone) && geom(L, L.cur, L.B, L.Ln)) { L.has = true; placed.push(L); }
      L.ok = ok;
      const on = L.vis && L.has;
      L.pin.classList.toggle('is-on', on && narrow); L.box.classList.toggle('is-on', on && !narrow); L.line.classList.toggle('is-on', on);
      if (L.has) {
        if (narrow) L.pin.style.transform = `translate(${px(L.B.l)},${px(L.B.t)})`; else L.box.style.transform = `translate(${px(L.B.l)},${px(L.B.t)})`;
        const s = L.line.style; s.transform = `translate(${px(L.Ln.l)},${px(L.Ln.t)})`; s.width = px(Math.max(2, L.Ln.r - L.Ln.l)); s.height = px(Math.max(2, L.Ln.b - L.Ln.t));
      }
    }
  }
  /* for the check tool: each name, whether it shows, its box, its line's end and its part's point (px in the stage) */
  function state(now) {
    return labs.map(L => {
      const up = L.mode === 'T' || L.mode === 'tag';
      const end = narrow ? { x: (L.Ln.l + L.Ln.r) / 2, y: up ? L.Ln.b : L.Ln.t } : L.mode === 'L' ? { x: L.Ln.r, y: (L.Ln.t + L.Ln.b) / 2 } : L.mode === 'R' ? { x: L.Ln.l, y: (L.Ln.t + L.Ln.b) / 2 }
        : { x: (L.Ln.l + L.Ln.r) / 2, y: (L.mode === 'T' || (L.mode === 'tag' && L.cur === 0)) ? L.Ln.b : L.Ln.t };
      return { id: L.id, text: L.text, mode: L.mode, why: L.vis ? '' : L.why, w: L.w, h: L.h, shown: L.vis && L.has, settled: now - L.since >= FADE, box: Object.assign({}, L.B), line: Object.assign({}, L.Ln), end, part: { x: L.ax, y: L.ay }, n: L.n + 1 };
    });
  }
  return { define, frame, state, measure, setKeepOut: f => { keepOut = f; }, setObstacles: f => { obstacles = f; }, get narrow() { return narrow; }, remove() { layer.remove(); } };
}
