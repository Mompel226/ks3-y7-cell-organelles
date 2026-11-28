/* ============================================================
   bath.js — a plant cell bathed in a solution (22 Nov 2026): the picture of the course's film at the vacuole step
   (js/plant/text.js FILMS.sol, FILMS.solib; leaf.js draws the cell itself; view.js plays the film).
   What the courses ask (0610 3.2.5, 3.2.8 (S): "the effects on plant cells of immersing them in solutions of different
   concentrations … turgid, turgor pressure, plasmolysis, flaccid"; the IB guide D2.3.6: "the development of turgor
   pressure in a hypotonic medium and plasmolysis in a hypertonic medium") is a cell IN a solution. The leaf's own cell
   (the Year 7 step) only goes soft: it is never plasmolysed. So with a course on a film takes this one cell out of the
   leaf, into a solution, and the picture shows WHY water moves:
   - dissolved particles, as dots: the same dots in the cell sap all through (they move closer together as the vacuole
     shrinks, further apart as it swells), and in the solution round the cell many (concentrated) or few (dilute).
     Drawn very much bigger than they are (the film's note says so): a sugar molecule is about 1 nm, a dot 600 nm;
   - blue arrows across the cell membrane (osmosis is through the membrane: 0610 3.2.3; so each arrow is centred on the
     membrane, and goes with it when it leaves the wall): the NET movement of water, out or in. While the cell changes
     they move; once the cell and the solution are in balance (plasmolysed in the concentrated solution: the dots match;
     turgid in the dilute one: turgor pressure stops more water entering) they stay a few seconds, then go: the net
     movement has stopped. The FLACCID cell in the concentrated solution is not in balance (the solution has nearly
     twice the sap's dots and there is no turgor pressure), so there the arrows never go: water is still leaving while
     the picture waits for Next (a fresh science read, 28 Nov 2026: they had gone after five seconds, which said that
     the net movement stops at the flaccid cell). A still keeps them;
   - a pale blue ground: the solution, round the cell and, once the cell is plasmolysed, between the cell wall and the
     cell membrane (the wall lets water and dissolved substances through: the Year 7 words of the membrane step).
   How far the cell shrinks (leaf.js applies it):
   - flaccid: the whole cell 12 % smaller by volume, the membrane still against the wall (the turgor loss point of a
     leaf: Bartlett, Scoffoni & Sack 2012, Ecology Letters 15:393; leaf.js);
   - plasmolysed: the wall stays as the flaccid cell's, and everything inside the membrane is drawn at PLAS of that
     (0.78 across, 0.88 along: 0.47 of the turgid cell's volume). ONE factor for every part, because every compartment
     (cytoplasm, vacuole, chloroplasts) stands in osmotic balance with the others, so each loses the same share of its
     water (the Boyle–van't Hoff relation: an osmometer's volume varies inversely with the concentration outside it:
     Nobel 2009, Physicochemical and Environmental Plant Physiology, ch. 2). A protoplast at half its volume is what a
     class sees in onion cells in 1 mol/dm³ sucrose. The solution's dots are as many, in the same area, as the sap's
     dots when the cell is plasmolysed: water leaves until the two are equal.
   Not drawn: the fine strands of cytoplasm that still join the membrane to the wall at the pits (Hechtian strands:
     Oparka 1994, New Phytologist 126:571); the protoplast is drawn free on every side, in the middle of the wall.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const PLAS = { x: 0.78, y: 0.88 };          /* the plasmolysed protoplast against the flaccid cell: across, along */
const N_IN = 60, N_OUT = 1500, DIL = 0.1;          /* the sap's dots; the solution's, when concentrated; the share of them in a dilute solution */
const BX = 56000, BY = 46000, DOT = 330;           /* the solution's half-width and half-height, nm; a dot's radius, nm */
export function makeBath({ stage, R0, HL, RIN, wallT, vacBase, KB, KT, rnd }) {
  const g = new THREE.Group(); g.name = 'bath'; g.visible = false;
  /* inside the cell's outline of radius r and half-length half (the same rounded ends as leaf.js capsuleGeo) */
  const inCap = (x, y, r, half) => { const yB = -(half - KB * r), yT = half - KT * r; if (Math.abs(x) >= r) return false;
    if (y < yB) { const u = (y - yB) / (KB * r); return (x / r) * (x / r) + u * u < 1; }
    if (y > yT) { const u = (y - yT) / (KT * r); return (x / r) * (x / r) + u * u < 1; }
    return true; };
  /* the solution: a pale blue ground behind the cell */
  const backMat = new THREE.MeshBasicMaterial({ color: 0x1f5a8c, transparent: true, opacity: 0, depthWrite: false });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(2 * BX + 60000, 2 * BY + 60000), backMat); back.position.set(0, 0, -R0 * 1.5); back.renderOrder = 0; g.add(back);
  /* the dots: the solution's (each has a rank: a dilute solution shows the first tenth of them) and the sap's */
  const OUT = [], IN = [];
  for (let i = 0; i < N_OUT; i++) OUT.push({ x: (rnd() * 2 - 1) * BX, y: (rnd() * 2 - 1) * BY, z: (rnd() * 2 - 1) * 500, u: rnd() });
  { const r = vacBase - 2600, half = HL - wallT - 2400 - 2400; let guard = 0;      /* (well inside the vacuole: its membrane bulges in round each chloroplast) */
    while (IN.length < N_IN && guard++ < 20000) { const x = (rnd() * 2 - 1) * r, y = (rnd() * 2 - 1) * half; if (inCap(x, y, r, half) && IN.every(d => Math.hypot(d.x - x, d.y - y) > 1500)) IN.push({ x, y, z: (rnd() * 2 - 1) * 500 }); } }
  /* (each dot has a dark edge: on the pale cell sap, over the chloroplasts behind it, a plain dot was hard to see) */
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xffb640, transparent: true, opacity: 1, depthTest: false, depthWrite: false });
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x141c3c, transparent: true, opacity: 0.62, depthTest: false, depthWrite: false });
  const edges = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), edgeMat, N_OUT + N_IN); edges.renderOrder = 6.8; edges.frustumCulled = false; g.add(edges);
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), dotMat, N_OUT + N_IN); dots.renderOrder = 7; dots.frustumCulled = false; g.add(dots);
  const M4 = new THREE.Matrix4(), Q0 = new THREE.Quaternion(), P3 = V(), S3 = V();
  const put = (n, x, y, z, r) => { M4.compose(P3.set(x, y, z), Q0, S3.set(r, r, r)); dots.setMatrixAt(n, M4); M4.compose(P3, Q0, S3.set(r * 1.36, r * 1.36, r * 1.36)); edges.setMatrixAt(n, M4); };
  /* the arrows of the water's net movement: three on each side, across the wall and the membrane */
  const ARROW_Y = [-19000, -1000, 17000], arrows = [];
  ARROW_Y.forEach((y, i) => [-1, 1].forEach(sd => {
    const mat = new THREE.MeshBasicMaterial({ color: 0x8fd8ff, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
    const a = new THREE.Group(), sh = new THREE.Mesh(new THREE.CylinderGeometry(330, 330, 3400, 10), mat), hd = new THREE.Mesh(new THREE.ConeGeometry(900, 1900, 14), mat);
    sh.rotation.z = Math.PI / 2; a.add(sh, hd); sh.renderOrder = hd.renderOrder = 9; a.userData = { sd, y, mat, hd, ph: (i * 2 + (sd > 0 ? 1 : 0)) / 6 }; arrows.push(a); g.add(a); }));
  const now = { dotsOut: 0, dotsGap: 0, dotsIn: 0, arrows: 0, dir: 0, back: 0, thin: 1, balance: false };
  /* (the arrows as they are shown now: they fade, never jump, when the film turns the flow off or round) */
  let vis = 0, dirNow = -1, lastT = null;
  /* one frame. K: the picture's knobs (sol 0 … 1 the solution is there; conc 0 dilute … 1 concentrated; flow −1 water
     leaves, +1 it enters); sc: the scales now ({ sx, sy } all that is inside the membrane, { wx, wy } the wall;
     plas 0 … 1 how far the membrane has left the wall; firm 0 … 1 how firm the cell is);
     film: { ts, still } while the film plays (ts: seconds since the shot's picture was reached; < 0 on the way) */
  function draw(K, t, sc, film) {
    const sol = Math.max(0, Math.min(1, K.sol || 0)); g.visible = sol > 0.004; now.dotsOut = now.dotsGap = now.dotsIn = now.arrows = 0; now.back = 0;
    if (!g.visible) { vis = 0; lastT = null; return; }
    backMat.opacity = 0.5 * sol; now.back = backMat.opacity;
    /* (a small picture, a phone's: a dot cannot be drawn under 2 px, so there it is much bigger against the cell, and the
       picture was nearly covered with dots: it shows 45 in 100 of them, of the sap's and of the solution's alike, so
       the two still match when the cell is plasmolysed) */
    const thin = stage.pxPerNm() * 1000 < 5 ? 0.45 : 1, nIn = Math.round(N_IN * thin); now.thin = thin;
    const thr = (DIL + (1 - DIL) * Math.max(0, Math.min(1, K.conc || 0))) * thin, r = Math.max(DOT, 2 / stage.pxPerNm()), m = r * 1.15;
    let n = 0;
    for (const d of OUT) {
      const k = Math.min(1, Math.max(0, (thr - d.u) / (0.05 * thin))) * sol; if (k < 0.03) continue;
      const xw = d.x / sc.wx, yw = d.y / sc.wy;
      if (!inCap(xw, yw, R0 + m, HL + m)) { put(n++, d.x, d.y, d.z, r * k); now.dotsOut++; continue; }      /* round the cell */
      /* between the wall and the membrane, once they are apart */
      if (inCap(xw, yw, RIN - m, HL - wallT - m) && !inCap(d.x / sc.sx, d.y / sc.sy, RIN + m / sc.sx, HL - wallT + m / sc.sy)) { put(n++, d.x, d.y, d.z, r * k); now.dotsGap++; }
    }
    for (let i = 0; i < nIn; i++) { const d = IN[i]; put(n++, d.x * sc.sx, d.y * sc.sy, d.z, r * sol); now.dotsIn++; }
    dots.count = edges.count = n; dots.instanceMatrix.needsUpdate = edges.instanceMatrix.needsUpdate = true;
    /* the arrows: while the cell changes; in balance, a few seconds more, then they go; out of balance they stay; a still keeps them */
    const fl = K.flow || 0, dir = fl < 0 ? -1 : 1, still = !!(film && film.still), ts = film ? film.ts : -1;
    const balance = (K.conc || 0) > 0.5 ? sc.plas > 0.98 : sc.firm > 0.98; now.balance = balance;
    const show = Math.min(1, Math.abs(fl) * 2) * sol * (still || ts < 0 || !balance ? 1 : 1 - Math.min(1, Math.max(0, (ts - 5) / 1.6)));
    if (still || lastT == null) { vis = show; dirNow = dir; }
    else { const dt = Math.min(0.1, Math.max(0, t - lastT));
      if (dirNow !== dir && vis > 0.03) vis = Math.max(0, vis - dt * 5); else { dirNow = dir; vis += (show - vis) * Math.min(1, dt * 7); } }
    lastT = t; now.dir = vis > 0.05 ? dirNow : 0;
    for (const a of arrows) { const u = a.userData, ph = still ? 0.5 : ((t * 0.42 + u.ph) % 1 + 1) % 1, out = dirNow < 0;
      /* (out of the cell: the arrow points away from the middle; into it: towards the middle) */
      const point = (out ? 1 : -1) * u.sd;
      a.visible = vis > 0.02; u.mat.opacity = 0.95 * vis * Math.sin(Math.PI * ph);
      a.position.set(u.sd * RIN * sc.sx + point * (ph - 0.5) * 3000, u.y * sc.sy, 700);
      u.hd.rotation.z = -point * Math.PI / 2; u.hd.position.x = point * 2600;
      if (a.visible) now.arrows++; }
  }
  /* where the name of an arrow of water ends its line: on the arrow's OUTER end, so that the line, which is level as
     the arrow is, never lies along the arrow and hides it (the fresh science read, 28 Nov 2026) */
  const arrowAt = sc => arrows.map(a => V(a.userData.sd * (RIN * sc.sx + 3600), a.userData.y * sc.sy, 700));
  return { group: g, draw, now, arrowAt, inCap, counts: { in: N_IN, out: N_OUT, dilute: DIL }, dispose() { dots.geometry.dispose(); edges.geometry.dispose(); dotMat.dispose(); edgeMat.dispose(); backMat.dispose(); } };
}
