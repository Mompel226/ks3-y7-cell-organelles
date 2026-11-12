/* ============================================================
   mitoparts.js — the mitochondria, drawn from real ones (5 Nov 2026).
   Daniel, 5 Nov 2026: "They don't look like real mitochondria … improve the generation … so it looks … like it has a
   double membrane inside"; and of the glucose and the oxygen: "it needs to be relative … as close to relative size as
   possible". So:
   - the world's mitochondria are REAL shapes (mito-shapes.js: mitochondria of one human cell, measured by an electron
     microscope, tools/mito-shapes.py): short ones, long tubes and branched ones, each a tube round its real centre line,
     with its real radius. Each shows its two membranes: a clear outer membrane with a bright edge, and inside it the
     inner membrane, its folds (the cristae) showing through as bands;
   - the one you visit (heroMito) is cut open lengthways, at its true thicknesses: each membrane 7 nm, the space between
     them 15 nm, the inside of a crista 12 nm. Its cut face is worked out from those numbers for every point of the
     screen (a shader: is this point in the outer membrane, the space between the membranes, the inner membrane or the
     matrix?), so it stays sharp however close the camera comes;
   - the magnified view (nanoPatch): the same double membrane at its true size, in nanometres, every lipid a head and two
     tails (as at the way in), with its proteins: channel proteins (porins) in the outer membrane; in the inner membrane
     the carrier protein of the smaller molecules (pyruvate), and on a crista the pumps (the electron transport chain) and
     ATP synthase. It fits exactly into the cut face where the camera zooms in, so the zoom is one move, never a jump.
   Sizes (nm, the textbook ones; memory biology-before-pedagogy): a membrane 7; the space between the membranes 15 (it
   varies); a lipid's head 0.9, its tails about 2; a porin about 4 across; ATP synthase's head 10 across, its ring 6, the
   head about 12 from the middle of the membrane; a glucose molecule 0.9; the smaller molecule 0.6; oxygen 0.4; carbon
   dioxide 0.5; water 0.3. Molecules are drawn at these sizes too: nothing is made bigger to be seen; the camera comes
   closer instead.
   Coordinates: the hero's own, in µm: y along it, x across, its cut face the plane z = 0 (the half kept is z ≤ 0). A
   point of the hero is (s, a, b): s along its middle line (µm from its first end), a across (+ the left side), b deep
   (behind the cut face). The patch's, in nm: u along the membrane, n out of the mitochondrion (into the cytosol), w
   towards the viewer (w = 0 is the cut face).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { mergeGeometries, mergeVertices } from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js?v=0.185.1';
import { magicStandard } from './magic.js?v=202611121048';

/* the mitochondria's own random numbers: the rest of the seeded world stays exactly as it was */
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* true thicknesses, in µm (the hero) and nm (the patch) */
export const TH = { om: 0.007, ims: 0.015, im: 0.007 };
const IM_MID = TH.om + TH.ims + TH.im / 2;        /* the inner membrane's middle, from the outer surface: 25.5 nm */
export const COL = {
  core: 0xc0605a, om: 0xffc0a0, ims: 0x9a3f66, im: 0xffc8a0, matrix: 0xe08236, outside: 0xf07a45, inside: 0xffb070,
  head: 0xff9ac8, tail: 0xffd8a8, porin: 0x3fd6c0, mpc: 0xffa94d, pump: 0x5b9cff, alpha: 0xff7f95, beta: 0xffc85a, rotor: 0x8fe7d6, stalk: 0xd6c9ff
};

/* ============================================================ the hero: one mitochondrion cut open ============================================================ */
const NA = 17, NC = 24;
/* its shape: a gently bent rod, thicker in some places, round at both ends (not a perfect cylinder) */
export function heroSpec({ L = 2.05, R = 0.34, seed = 7 } = {}) {
  const r = rng(seed), axis = [], rad = [];
  for (let i = 0; i < NA; i++) {
    const t = i / (NA - 1), y = (t - 0.5) * L;
    axis.push(new THREE.Vector2(0.07 * Math.sin(Math.PI * t) - 0.035, y));
    rad.push(R * (1 + 0.055 * Math.sin(5.3 * t + 1.0) + 0.03 * Math.sin(12.7 * t + 0.4) - 0.07 * Math.pow(2 * t - 1, 6)));
  }
  const len = []; let acc = 0; axis.forEach((p, i) => { if (i) acc += p.distanceTo(axis[i - 1]); len.push(acc); });
  /* the cristae: folds of the inner membrane, shelves across the matrix from one side or the other, most of the way across
     or less; each is two membranes with a space inside (12 nm, 10 to 15). Like real ones (electron tomography: Frey and
     Mannella 2000, Trends Biochem Sci 25:319), none is a straight line: each bends a little and leans, its rim is round
     and a little thicker, and where it joins the inner membrane it narrows (the crista junction) */
  const cristae = [];
  let s = 0.13;
  while (s < acc - 0.13 && cristae.length < NC) {
    const prev = cristae.length ? cristae[cristae.length - 1].side : -1, side = r() < 0.72 ? -prev : prev;
    cristae.push({ s, side, f: 0.42 + 0.4 * r(), lumen: 0.010 + 0.005 * r(), amp: 0.004 + 0.008 * r(), k: 22 + 30 * r(), ph: r() * 6.283, tilt: (r() - 0.5) * 0.22 });
    s += 0.088 + 0.04 * r();
  }
  /* the one the camera zooms into (play.js): on the left side (+), a short one (85 nm), straight; the outer membrane 30 nm
     before it is the middle of the magnified view (nanoPatch), so no other crista may come near */
  const zi = cristae.reduce((b, c, i) => Math.abs(c.s - acc * 0.55) < Math.abs(cristae[b].s - acc * 0.55) ? i : b, 0);
  const zc = cristae[zi], zr = along({ axis, rad, len }, zc.s).r - IM_MID - TH.im / 2;
  Object.assign(zc, { side: 1, f: 0.085 / (2 * zr), lumen: 0.012, amp: 0, tilt: 0, zoom: true });
  cristae.forEach(c => { if (c === zc || Math.abs(c.s - zc.s) > 0.17) return; if (c.side > 0 && Math.abs(c.s - zc.s) < 0.12) c.side = -1; if (c.side < 0) c.f = Math.min(c.f, 0.52); });
  return { L, R, axis, rad, len, total: acc, cristae, zoom: { s: zc.s - 0.030, crista: zc, depthNm: 85, lumenNm: 12 } };
}
/* the middle line at a distance s along it: the point, the direction along it, the left side, the radius */
export function along(spec, s) {
  const { axis, rad, len } = spec;
  let i = 0; while (i < len.length - 2 && len[i + 1] < s) i++;
  const k = Math.max(0, Math.min(1, (s - len[i]) / Math.max(1e-6, len[i + 1] - len[i])));
  const p = axis[i].clone().lerp(axis[i + 1], k), t = axis[i + 1].clone().sub(axis[i]).normalize();
  return { p, t, n: new THREE.Vector2(-t.y, t.x), r: rad[i] + (rad[i + 1] - rad[i]) * k };
}
/* a point of the hero (s along, a across, b behind the cut face) in its own coordinates */
export function heroPoint(spec, s, a, b = 0) { const f = along(spec, s); return new THREE.Vector3(f.p.x + f.n.x * a, f.p.y + f.n.y * a, -b); }

/* half a tube round the middle line (the part behind the cut face), round at both ends; dr moves its surface in or out,
   inward turns it to face the middle (the inner membrane, seen from inside) */
function halfTube(spec, dr, { inward = false, seg = 28, ends = 7 } = {}) {
  const rings = [];
  const n0 = along(spec, 0), n1 = along(spec, spec.total);
  for (let j = ends; j >= 1; j--) { const ph = (j / ends) * Math.PI / 2, r = Math.max(0, n0.r + dr); rings.push({ p: n0.p.clone().addScaledVector(n0.t, -Math.sin(ph) * r), n: n0.n, r: r * Math.cos(ph) }); }
  const steps = Math.ceil(spec.total / 0.03);
  for (let i = 0; i <= steps; i++) { const f = along(spec, (i / steps) * spec.total); rings.push({ p: f.p, n: f.n, r: Math.max(0, f.r + dr) }); }
  for (let j = 1; j <= ends; j++) { const ph = (j / ends) * Math.PI / 2, r = Math.max(0, n1.r + dr); rings.push({ p: n1.p.clone().addScaledVector(n1.t, Math.sin(ph) * r), n: n1.n, r: r * Math.cos(ph) }); }
  const pos = [], uv = [], idx = [];
  let u = 0;
  rings.forEach((g, i) => {
    if (i) u += g.p.distanceTo(rings[i - 1].p);
    for (let j = 0; j <= seg; j++) {
      const th = (j / seg) * Math.PI, c = Math.cos(th), sn = Math.sin(th);
      pos.push(g.p.x + g.n.x * g.r * c, g.p.y + g.n.y * g.r * c, -g.r * sn); uv.push(u, j / seg);
    }
  });
  for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < seg; j++) {
    const a = i * (seg + 1) + j, b = a + seg + 1;
    if (inward) idx.push(a, a + 1, b, b, a + 1, b + 1); else idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}
/* a crista's shape, as a function of `across` (µm from the inner membrane's middle at the wall, inwards): where its middle
   is along the axis, and its half width to the middle of its membranes; the cut face's shader does the same sums */
export const NECK = [0.79, 0.002, 0.016], BULB = 1.08;
function cristaShape(c, across) {
  const t = Math.max(0, Math.min(1, (across - NECK[1]) / (NECK[2] - NECK[1]))), neck = NECK[0] + (1 - NECK[0]) * t * t * (3 - 2 * t);
  const cz = c.lumen / 2 + TH.im / 2, wobble = c.amp ? 1 + 0.12 * Math.sin(across * c.k * 0.7 + c.ph * 1.3) : 1;
  return { mid: (c.amp || 0) * Math.sin(across * (c.k || 0) + (c.ph || 0)) + (c.tilt || 0) * across, half: cz * neck * wobble, cz };
}
/* a crista behind the cut face: a shelf of the inner membrane (two membranes and the space inside), from the wall to
   its round free edge; f is how far across it reaches (a share of the matrix's width) */
function cristaGeo(spec, c) {
  const F = along(spec, c.s), rm = F.r - IM_MID - TH.im / 2, wallA = F.r - IM_MID, ext = c.f * 2 * rm, cz = c.lumen / 2 + TH.im / 2;
  /* across, from the middle line: where the two faces end and the round free edge begins (it may pass the middle); the
     same numbers as the cut face's shader, so the 3D shelf and its cut edge meet exactly */
  const tipC = ext - cz, tip = wallA - tipC, rTip = cz * BULB + TH.im / 2;
  const N3 = new THREE.Vector3(F.n.x * c.side, F.n.y * c.side, 0), T3 = new THREE.Vector3(F.t.x, F.t.y, 0), D = new THREE.Vector3(0, 0, -1);
  const at = (a, b, h) => new THREE.Vector3(F.p.x, F.p.y, 0).addScaledVector(N3, a).addScaledVector(D, b).addScaledVector(T3, h);
  const pos = [], idx = [];
  const NI = 16, NJ = 12;
  /* the fold the camera zooms into begins 12.5 nm behind the cut, behind the magnified view (its lipids and the water
     behind them, nanoPatch): from its first nanometres it had stood in front of the magnified wall, a pale stripe over
     the pumps. Further away the cut face covers those nanometres, so nothing else changes */
  const b0 = c.zoom ? 0.0125 : 0, depthAt = (bmax, j) => { const lo = Math.min(b0, bmax); return lo + (bmax - lo) * (j / NJ); };
  /* the two faces: from the free edge (a = tip) to the wall, all the way back to where the wall turns */
  for (const side of [-1, 1]) {
    const base = pos.length / 3;
    for (let i = 0; i <= NI; i++) {
      const a = tip + (rm + 0.004 - tip) * (i / NI), bmax = Math.sqrt(Math.max(0, rm * rm - Math.min(a * a, rm * rm * 0.999)));
      const sh = cristaShape(c, wallA - a), hw = sh.half + TH.im / 2;
      for (let j = 0; j <= NJ; j++) {
        const b = depthAt(bmax, j), wave = 0.005 * Math.sin(9 * a / rm + 5 * b / rm + c.s * 20) * (b / rm);
        const p = at(a, b, sh.mid + side * hw + wave); pos.push(p.x, p.y, p.z);
      }
    }
    for (let i = 0; i < NI; i++) for (let j = 0; j < NJ; j++) { const a = base + i * (NJ + 1) + j, b = a + NJ + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  }
  /* the round free edge, joining the two faces */
  const base = pos.length / 3, bmax = Math.sqrt(Math.max(0, rm * rm - tip * tip)), NK = 8, midT = cristaShape(c, tipC).mid;
  for (let k = 0; k <= NK; k++) {
    const ps = -Math.PI / 2 + Math.PI * k / NK;
    for (let j = 0; j <= NJ; j++) { const b = depthAt(bmax, j), p = at(tip - rTip * Math.cos(ps), b, midT + rTip * Math.sin(ps)); pos.push(p.x, p.y, p.z); }
  }
  for (let k = 0; k < NK; k++) for (let j = 0; j < NJ; j++) { const a = base + k * (NJ + 1) + j, b = a + NJ + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}

/* the cut face: for each point of it, which part it is (from the same numbers as the 3D), sharp at any zoom.
   uHole (s, half length, depth, k): where the magnified view takes over, the face fades (k 0 … 1) */
function sectionMat(spec) {
  const cr = spec.cristae.map(c => { const F = along(spec, c.s), rm = F.r - IM_MID - TH.im / 2; return new THREE.Vector4(c.s, c.side * c.f * 2 * rm, c.lumen / 2 + TH.im / 2, 0); });
  const cw = spec.cristae.map(c => new THREE.Vector4(c.amp || 0, c.k || 0, c.ph || 0, c.tilt || 0));
  while (cr.length < NC) { cr.push(new THREE.Vector4(-9, 0.01, 0.001, 0)); cw.push(new THREE.Vector4(0, 0, 0, 0)); }
  const u = {
    uAx: { value: spec.axis.map(p => p.clone()) }, uRad: { value: spec.rad.slice() }, uCr: { value: cr }, uCw: { value: cw }, uNC: { value: spec.cristae.length },
    uHole: { value: new THREE.Vector4(0, 0, 0, 0) }, uSleep: { value: 0 }, uLit: { value: 0 }, uFade: { value: 1 },
    uOM: { value: new THREE.Color(COL.om) }, uIMS: { value: new THREE.Color(COL.ims) }, uIM: { value: new THREE.Color(COL.im) }, uMX: { value: new THREE.Color(COL.matrix) },
    uCore: { value: new THREE.Color(COL.core) }, uAT: { value: new THREE.Color(COL.beta) }
  };
  const m = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      #define NA ${NA}
      #define NC ${NC}
      uniform vec2 uAx[NA]; uniform float uRad[NA]; uniform vec4 uCr[NC]; uniform vec4 uCw[NC]; uniform int uNC; uniform vec4 uHole;
      uniform float uSleep; uniform float uLit; uniform float uFade; uniform vec3 uOM; uniform vec3 uIMS; uniform vec3 uIM; uniform vec3 uMX; uniform vec3 uCore; uniform vec3 uAT;
      varying vec2 vP;
      float sdRoundBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        float best = 1e9, s = 0.0, a = 0.0, rad = 0.0, acc = 0.0;
        for (int i = 0; i < NA - 1; i++) {
          vec2 A = uAx[i], B = uAx[i + 1], ab = B - A, ap = vP - A;
          float l = length(ab), h = clamp(dot(ap, ab) / (l * l), 0.0, 1.0);
          float d = length(vP - (A + ab * h));
          if (d < best) { best = d; s = acc + h * l; a = (ab.x * ap.y - ab.y * ap.x) >= 0.0 ? d : -d; rad = mix(uRad[i], uRad[i + 1], h); }
          acc += l;
        }
        float dO = best - rad;
        float e = -(dO + ${IM_MID.toFixed(4)});
        float wallA = rad - ${IM_MID.toFixed(4)};
        float knob = 1e9;                        /* ATP synthase: its head, two at each crista's rim, in the matrix */
        for (int k = 0; k < NC; k++) {
          if (k >= uNC) break;
          vec4 c = uCr[k], w = uCw[k];
          float side = sign(c.y), ext = abs(c.y);
          float across = wallA - side * a;
          /* the crista's middle line (it bends and leans) and its half width (narrow at the junction, a thicker rim) */
          float sx = s - c.x - w.x * sin(across * w.y + w.z) - w.w * across;
          float t = clamp((across - ${NECK[1]}) / ${(NECK[2] - NECK[1]).toFixed(4)}, 0.0, 1.0);
          float hw = c.z * mix(${NECK[0]}, 1.0, t * t * (3.0 - 2.0 * t)) * (w.x > 0.0 ? 1.0 + 0.12 * sin(across * w.y * 0.7 + w.z * 1.3) : 1.0);
          float tipC = ext - c.z;
          float sxT = s - c.x - w.x * sin(tipC * w.y + w.z) - w.w * tipC;
          float shaft = max(abs(sx) - hw, max(-across - 0.004, across - tipC));
          float cap = length(vec2(sxT, across - tipC)) - c.z * ${BULB};
          e = smin(e, min(shaft, cap), 0.003);
          for (int j = 0; j < 2; j++) {
            float an = (j == 0 ? -0.75 : 0.75);
            vec2 hc = vec2(sin(an), cos(an)) * (c.z * ${BULB} + 0.012);
            knob = min(knob, length(vec2(sxT, across - tipC) - hc) - 0.0048);
            vec2 q = vec2(sxT, across - tipC), b0 = vec2(sin(an), cos(an)) * (c.z * ${BULB} + 0.003), b1 = hc * 0.7;
            float h = clamp(dot(q - b0, b1 - b0) / dot(b1 - b0, b1 - b0), 0.0, 1.0);
            knob = min(knob, length(q - b0 - (b1 - b0) * h) - 0.0011);
          }
        }
        float aa = fwidth(dO) * 1.25 + 1e-6, ae = fwidth(e) * 1.25 + 1e-6;
        float inside = 1.0 - smoothstep(-aa, aa, dO);
        if (inside < 0.004) discard;
        float om = smoothstep(-${TH.om.toFixed(4)} - aa, -${TH.om.toFixed(4)} + aa, dO);
        float im = 1.0 - smoothstep(${(TH.im / 2).toFixed(4)} - ae, ${(TH.im / 2).toFixed(4)} + ae, abs(e));
        float mx = smoothstep(${(TH.im / 2).toFixed(4)} - ae, ${(TH.im / 2).toFixed(4)} + ae, e);
        /* each membrane two layers of lipids: the heads (bright) on each side, the tails (darker) in the middle; seen from
           far away the two blend into one line, close up they part, as the lipids of the magnified view will */
        float tO = abs(dO + ${(TH.om / 2).toFixed(4)}) / ${(TH.om / 2).toFixed(4)}, tI = abs(e) / ${(TH.im / 2).toFixed(4)};
        float lay = clamp(1.0 - fwidth(dO) / 0.0016, 0.0, 1.0);
        vec3 omc = mix(uOM, mix(uCore, uOM, smoothstep(0.3, 0.72, tO)), lay), imc = mix(uIM, mix(uCore, uIM, smoothstep(0.3, 0.72, tI)), lay);
        float kn = 1.0 - smoothstep(-ae, ae, knob);
        /* the matrix: dense, with a few dark granules (about 30 nm) */
        vec2 g = vP / 0.06, gi = floor(g), gf = fract(g) - 0.5;
        float gr = hash(gi); float gran = gr > 0.86 ? smoothstep(0.28, 0.12, length(gf - (vec2(hash(gi + 3.1), hash(gi + 7.7)) - 0.5) * 0.4)) : 0.0;
        vec3 mxc = uMX * (0.82 + 0.18 * smoothstep(0.0, 0.3, e)) * (1.0 - 0.35 * gran);
        vec3 col = mix(uIMS, mxc, mx);
        col = mix(col, imc, im);
        col = mix(col, omc, om);
        col = mix(col, uAT, kn * mx);
        col *= 1.0 + 0.55 * uLit;
        float gy = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(col, vec3(0.30, 0.31, 0.52) * (0.25 + gy * 0.9), uSleep * 0.6);
        float alpha = inside * mix(1.0, 0.5, mx * (1.0 - kn)) * uFade;          /* the matrix is clear enough to see the folds behind */
        if (uHole.w > 0.001) alpha *= 1.0 - uHole.w * (1.0 - smoothstep(uHole.y - 0.012, uHole.y, abs(s - uHole.x))) * smoothstep(rad - uHole.z, rad - uHole.z + 0.012, a);
        if (alpha < 0.004) discard;
        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  m.userData.u = u;
  return m;
}

/* ATP synthase's shape: its measured structure (PDB 8H9S, human ATP synthase, Lai et al. 2023; downloaded on Daniel's
   go, 5 Nov 2026, and made into the game's model by tools/atp-synthase.py); false falls back to the one drawn from the
   published architecture (atpSynthase); the film says which */
export const ATP_MEASURED = true;
let ATP_DATA = null;
/* the measured model (atp-synthase.js, written by tools/atp-synthase.py), fetched the first time it is needed */
export async function loadATP() {
  /* a download that fails (slow school Wi-Fi) must not stop the place: then the drawn one stands in, and says so */
  if (ATP_MEASURED && !ATP_DATA) try { ATP_DATA = (await import('./atp-synthase.js?v=202611121048')).ATP_SYNTHASE; } catch (e) { console.warn('ATP synthase: the measured shape did not load, the drawn one is used', e); }
  return ATP_DATA;
}
/* is the ATP synthase drawn now the measured one? (the film's source line says which) */
export const atpIsMeasured = () => !!ATP_DATA;
/* ATP synthase: the measured one when it is here, else the one drawn from the published architecture */
export const anAtpSynthase = () => (ATP_DATA ? atpMeasured(ATP_DATA) : atpSynthase());
/* the hero: { group (its own coordinates; the caller places it), spec, section (its cut face's material) } */
export function heroMito(opts = {}) {
  const spec = heroSpec(opts), g = new THREE.Group(); g.name = 'mito-hero';
  const outer = new THREE.Mesh(halfTube(spec, 0), magicStandard({ color: COL.outside, side: THREE.DoubleSide, roughness: 0.34, emissive: 0x6a2008, emissiveIntensity: 0.45 }, { rim: 0xffc39a, rimK: 1.1 }));
  outer.name = 'hero-outer';
  /* the inner membrane, seen from inside through the cut: its matrix side */
  const inner = new THREE.Mesh(halfTube(spec, -(IM_MID + TH.im / 2), { inward: true }), magicStandard({ color: COL.inside, roughness: 0.5, emissive: 0x7a3010, emissiveIntensity: 0.42 }, { rim: 0xffd2a8, rimK: 0.5 }));
  inner.name = 'hero-inner';
  const crMat = magicStandard({ color: 0xffbf86, side: THREE.DoubleSide, roughness: 0.55, emissive: 0x6a2a08, emissiveIntensity: 0.42 }, { rim: 0xffe0c0, rimK: 0.55 });
  const cr = new THREE.Mesh(mergeGeometries(spec.cristae.map(c => cristaGeo(spec, c))), crMat); cr.name = 'hero-cristae';
  /* the cut face: a flat sheet over the whole outline, drawn by sectionMat */
  let x0 = 1e9, x1 = -1e9; spec.axis.forEach((p, i) => { x0 = Math.min(x0, p.x - spec.rad[i]); x1 = Math.max(x1, p.x + spec.rad[i]); });
  const H = spec.total / 2 + spec.R * 1.1;
  const faceGeo = new THREE.PlaneGeometry(x1 - x0 + 0.02, 2 * H + 0.02); faceGeo.translate((x0 + x1) / 2, 0, 0);
  const section = sectionMat(spec), face = new THREE.Mesh(faceGeo, section); face.name = 'hero-face'; face.renderOrder = 4;
  g.add(outer, inner, cr, face);
  return { group: g, spec, section, parts: { outer, inner, cristae: cr, face } };
}

/* ============================================================ the world's mitochondria: real shapes ============================================================ */
/* parallel frames along a curve (no twist) */
function frames(pts) {
  const T = pts.map((p, i) => pts[Math.min(pts.length - 1, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize());
  const N = [], B = [];
  const t0 = T[0], ref = Math.abs(t0.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  N.push(new THREE.Vector3().crossVectors(t0, ref).normalize()); B.push(new THREE.Vector3().crossVectors(t0, N[0]));
  for (let i = 1; i < pts.length; i++) {
    const ax = new THREE.Vector3().crossVectors(T[i - 1], T[i]), n = N[i - 1].clone();
    if (ax.lengthSq() > 1e-10) n.applyAxisAngle(ax.normalize(), Math.acos(Math.max(-1, Math.min(1, T[i - 1].dot(T[i])))));
    n.addScaledVector(T[i], -n.dot(T[i])).normalize(); N.push(n); B.push(new THREE.Vector3().crossVectors(T[i], n));
  }
  return { T, N, B };
}
/* a tube round a centre line with its radius at each point, round at both ends; k scales the radius (the inner one) */
function tubeArrays(pts, rads, rf, seg, out) {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const L = curve.getLength(), n = Math.max(4, Math.ceil(L / 0.06));      /* a ring every 60 nm: the line is smooth at that */
  const P = curve.getSpacedPoints(n), F = frames(P);
  const rAt = f => { const x = f * (rads.length - 1), i = Math.min(rads.length - 2, Math.floor(x)); return rads[i] + (rads[i + 1] - rads[i]) * (x - i); };
  const rings = [];
  const r0 = rf(rAt(0)), r1 = rf(rAt(1)), E = 5;
  for (let j = E; j >= 1; j--) { const ph = (j / E) * Math.PI / 2; rings.push({ p: P[0].clone().addScaledVector(F.T[0], -Math.sin(ph) * r0), f: 0, r: r0 * Math.cos(ph) }); }
  P.forEach((p, i) => rings.push({ p, f: i, r: rf(rAt(i / n)) }));
  for (let j = 1; j <= E; j++) { const ph = (j / E) * Math.PI / 2; rings.push({ p: P[n].clone().addScaledVector(F.T[n], Math.sin(ph) * r1), f: n, r: r1 * Math.cos(ph) }); }
  const base = out.pos.length / 3;
  let u = 0;
  rings.forEach((g, i) => {
    if (i) u += g.p.distanceTo(rings[i - 1].p);
    const Nn = F.N[g.f], Bn = F.B[g.f];
    for (let j = 0; j <= seg; j++) {
      const th = (j / seg) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
      out.pos.push(g.p.x + (Nn.x * c + Bn.x * s) * g.r, g.p.y + (Nn.y * c + Bn.y * s) * g.r, g.p.z + (Nn.z * c + Bn.z * s) * g.r);
      out.uv.push(u, j / seg);
    }
  });
  for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < seg; j++) {
    const a = base + i * (seg + 1) + j, b = a + seg + 1;
    out.idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
}
/* the inner membrane, seen through the outer one: its folds (the cristae) as bands across it, about 90 nm apart, each
   a little wavy (uv.x is the distance along the tube, µm) */
function innerMat() {
  const m = magicStandard({ color: COL.outside, roughness: 0.4, emissive: 0x5a1c06, emissiveIntensity: 0.5 }, { rim: 0xffcfa0, rimK: 0.7 });
  const before = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    before(sh, r);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aMU; varying vec2 vMU;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMU = aMU;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vMU;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        {
          /* faint, as folds seen through the outer membrane; they fade where they would be finer than a pixel */
          float ph = vMU.x / 0.095 + 0.35 * sin(vMU.x * 4.1) + 0.22 * sin(vMU.y * 12.566 + vMU.x * 7.0) + 0.15 * sin(vMU.x * 23.0);
          float band = pow(0.5 + 0.5 * cos(ph * 6.2832), 5.0) * (1.0 - smoothstep(0.1, 0.3, fwidth(ph)));
          totalEmissiveRadiance += vec3(1.0, 0.7, 0.45) * band * 0.08;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.8, 0.6), band * 0.06);
        }`);
  };
  m.customProgramCacheKey = () => 'mito-inner';
  return m;
}
/* list: [{ shape, pos: Vector3, q: Quaternion }] → two meshes: the inner membranes (solid) and the outer ones (clear) */
export function realMitos(list) {
  const I = { pos: [], uv: [], idx: [] }, O = { pos: [], uv: [], idx: [] };
  for (const it of list) {
    for (const path of it.shape.paths) {
      const pts = path.map(p => new THREE.Vector3(p[0], p[1], p[2]).applyQuaternion(it.q).add(it.pos)), rads = path.map(p => p[3]);
      if (pts.length < 2) { const p = pts[0]; pts.push(p.clone().add(new THREE.Vector3(0.01, 0, 0).applyQuaternion(it.q))); rads.push(rads[0]); }
      tubeArrays(pts, rads, r => Math.max(0.03, r), 12, O);
      /* the inner membrane: inside the outer membrane and the space between them (22 nm; a thin tube keeps two thirds) */
      tubeArrays(pts, rads, r => Math.max(0.02, Math.max(0.03, r) - Math.min(0.026, Math.max(0.03, r) / 3)), 10, I);
    }
  }
  const mk = (A, mat) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(A.pos, 3)); geo.setAttribute('aMU', new THREE.Float32BufferAttribute(A.uv, 2));
    geo.setIndex(A.idx); geo.computeVertexNormals(); geo.computeBoundingSphere();
    return new THREE.Mesh(geo, mat);
  };
  const inner = mk(I, innerMat());
  const outer = mk(O, magicStandard({ color: 0xffa070, transparent: true, opacity: 0.3, depthWrite: false, roughness: 0.18, emissive: 0x5a1c06, emissiveIntensity: 0.25 }, { rim: 0xffd8b8, rimK: 1.35, rimPow: 1.7 }));
  inner.name = 'mito-inner'; outer.name = 'mito-outer'; outer.renderOrder = 3;
  return { inner, outer };
}

/* ============================================================ the magnified view: the double membrane in nanometres ============================================================ */
/* a lumpy protein of a given size (nm): its outline, drawn simply */
function blob(sx, sy, sz, seed = 1, detail = 3) {
  let geo = new THREE.IcosahedronGeometry(1, detail); geo.deleteAttribute('normal'); geo.deleteAttribute('uv'); geo = mergeVertices(geo);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const k = 1 + 0.1 * Math.sin(v.x * 5 + seed) * Math.sin(v.y * 4 - seed * 0.7) + 0.06 * Math.sin(v.z * 7 + seed * 2);
    p.setXYZ(i, v.x * sx * k, v.y * sy * k, v.z * sz * k);
  }
  geo.computeVertexNormals();
  return geo;
}
const protMat = (color, k = 0.4) => magicStandard({ color, emissive: color, emissiveIntensity: 0.18 * k, roughness: 0.42 }, { rim: 0xffffff, rimK: 0.45 });

/* ATP synthase (drawn from the published architecture of the human enzyme, Lai et al. 2023, Mol Cell 83:2137; replaced
   by the measured structure once it is on this computer): in the membrane a ring of 8 c subunits that turns (the rotor),
   joined to a central stalk that turns inside the head; the head (F1), three α and three β alternating, held still by
   the side stalk from subunit a. y is the axis, from the middle of the membrane (0) towards the matrix. */
export function atpSynthase() {
  const g = new THREE.Group(), rotor = new THREE.Group(), stator = new THREE.Group(); g.add(rotor, stator);
  const cMat = protMat(COL.rotor), aMat = protMat(COL.alpha), bMat = protMat(COL.beta), sMat = protMat(COL.stalk), gMat = protMat(0x6fd0c0, 0.6);
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4, c = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 4.4, 4, 10), cMat);
    c.position.set(Math.cos(a) * 2.25, 0.2, Math.sin(a) * 2.25); rotor.add(c);
  }
  const foot = new THREE.Mesh(blob(2.2, 1.2, 2.2, 3), gMat); foot.position.y = 3.6; rotor.add(foot);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 8.4, 12), gMat); shaft.position.y = 8.2; rotor.add(shaft);
  const head = new THREE.Group(); head.position.y = 12; stator.add(head);
  for (let k = 0; k < 6; k++) {
    const a = k * Math.PI / 3, l = new THREE.Mesh(blob(2.2, 3.7, 2.4, k + 2), k % 2 ? bMat : aMat);
    l.position.set(Math.cos(a) * 2.75, 0, Math.sin(a) * 2.75); l.rotation.y = -a; head.add(l);
  }
  const oscp = new THREE.Mesh(blob(1.6, 1.1, 1.6, 9), sMat); oscp.position.y = 16.4; stator.add(oscp);
  const sa = new THREE.Mesh(blob(1.8, 3.1, 2.4, 5), sMat); sa.position.set(3.7, 0, 0); stator.add(sa);
  const stalk = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(3.9, 1.5, 0), new THREE.Vector3(5.6, 6, 0.2), new THREE.Vector3(5.7, 11, 0.3), new THREE.Vector3(4.2, 15, 0.1), new THREE.Vector3(1.4, 16.4, 0)]), 30, 0.55, 8, false), sMat);
  stator.add(stalk);
  g.userData = { rotor, stator, headY: 12, ringR: 2.25, kind: 'atp-synthase' };
  return g;
}
/* the measured ATP synthase: each subunit's own surface, in the same frame as atpSynthase() (nm, +y the rotor's axis from
   the middle of the membrane); the parts that turn (the c ring, gamma, delta, epsilon) in `rotor` */
export function atpMeasured(D) {
  const g = new THREE.Group(), rotor = new THREE.Group(), stator = new THREE.Group(); g.add(rotor, stator);
  const COLS = { alpha: COL.alpha, beta: COL.beta, gamma: 0x6fd0c0, delta: 0x5fc0b0, epsilon: 0x7fe0d0, c: COL.rotor, a: 0xb9a6ff, b: COL.stalk, d: COL.stalk, f6: COL.stalk, oscp: 0xe6dcff, a6l: 0xcabfff, minor: 0xbfb3ee, other: 0xcccccc };
  const mats = {}, bytes = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; };
  let marked = false;
  for (const p of D.parts) {
    const q = new Int16Array(bytes(p.pos)), pos = new Float32Array(q.length);
    for (let i = 0; i < q.length; i++) pos[i] = q[i] * p.sc[i % 3] + p.off[i % 3];
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(new THREE.BufferAttribute(new Uint16Array(bytes(p.idx)), 1)); geo.computeVertexNormals();
    /* one c subunit pale, so that the ring is seen to turn (eight alike, moving in steps of 45°, looked still) */
    const mark = p.part === 'c' && !marked && (marked = true);
    (p.rotor ? rotor : stator).add(new THREE.Mesh(geo, mark ? (mats.cMark || (mats.cMark = protMat(0xf6fff2))) : mats[p.part] || (mats[p.part] = protMat(COLS[p.part] || 0xcccccc))));
  }
  g.userData = { rotor, stator, headY: D.head, ringR: 2.4, kind: 'atp-synthase', measured: true };
  return g;
}
/* the pumps of the electron transport chain, drawn simply (their sizes, not their shapes): the first a long L, the
   others smaller; each spans the membrane and stands out on the matrix side (+y) */
export function pump(kind) {
  const g = new THREE.Group(), m = protMat(COL.pump);
  if (kind === 1) {
    const arm = new THREE.Mesh(blob(9, 2.6, 3, 11), m); arm.position.set(0, 0, 0); g.add(arm);
    const up = new THREE.Mesh(blob(3.2, 5.2, 3.4, 12), m); up.position.set(-6.2, 6.2, 0); g.add(up);
  } else if (kind === 3) {
    const b = new THREE.Mesh(blob(5, 3.6, 3.6, 13), m); b.position.y = 1.6; g.add(b);
  } else {
    const b = new THREE.Mesh(blob(3.6, 3.4, 3.2, 14), m); b.position.y = 0.8; g.add(b);
  }
  return g;
}

/* the patch: { group (nm; the caller scales it by 0.001 and places it on the hero), at(name) a point to name or to aim
   at, parts }. spec: the crista at u = uc (nm), reaching `depth` into the matrix; rows of lipids behind the cut face; its
   membranes from u = −U to U: 80 nm, so that no close view of the game or the film (a laptop, a wide screen) sees past
   them (at 64 nm the cut face had shown at the left edge) */
export function nanoPatch({ uc = 30, depth = 85, lumen = 12, U = 80, rows = 12 } = {}) {
  const g = new THREE.Group(); g.name = 'mito-patch';
  const R = rng(5), rr = (a, b) => a + (b - a) * R();
  const hw = lumen / 2 + 3.5, f = 3.2, nB = -25.5, nR = nB - depth + hw;            /* the crista: half width to its membrane's middle; its round end's centre */
  /* the membranes' middle lines (u, n): the outer membrane, and the inner membrane with its crista */
  const om = [[-U, -3.5], [U, -3.5]];
  const im = [];
  const arc = (cx, cy, r, a0, a1, n) => { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; im.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  /* the crista as the hero's cut face draws it (mitoparts cristaShape): narrow where it joins (the crista junction),
     then its full width, and a round rim a little thicker than the rest */
  const neck = a => { const t = Math.max(0, Math.min(1, (a / 1000 - NECK[1]) / (NECK[2] - NECK[1]))); return NECK[0] + (1 - NECK[0]) * t * t * (3 - 2 * t); };
  const hwN = hw * neck(f), rB = hw * BULB, dB = Math.sqrt(rB * rB - hw * hw), a0 = Math.atan2(dB, -hw);
  const wall = (sd) => { const out = []; for (let a = f; a <= nB - nR - dB + 0.01; a += 2) out.push([uc + sd * hw * neck(a), nB - a]); return out; };
  im.push([-U, nB], [uc - hwN - f, nB]);
  arc(uc - hwN - f, nB - f, f, Math.PI / 2, 0, 6);
  im.push(...wall(-1));
  arc(uc, nR, rB, a0, 2 * Math.PI + (Math.PI - a0), 22);
  im.push(...wall(1).reverse());
  arc(uc + hwN + f, nB - f, f, Math.PI, Math.PI / 2, 6);
  im.push([U, nB]);
  /* the proteins and where they stand (nm) */
  const P = {
    porins: [[-22, -2.6], [6, -7.2], [36, -3.4]].map(([u, w]) => ({ u, w })),
    mpc: { u: -20, w: -3.4 },
    /* the pumps side by side on ONE wall (as in the respirasome: Gu et al. 2016, Nature 537:639): the first passes its
       electrons to the third inside the membrane, the third to the last through the space inside the crista */
    pumps: [{ kind: 1, wall: -1, n: -41, w: -4.2 }, { kind: 3, wall: -1, n: -57, w: -4.6 }, { kind: 4, wall: -1, n: -71, w: -3.8 }],
    atp: { w: -4.6 }
  };
  /* no lipid where a protein is; and none IN FRONT of one either, so that the whole protein is seen (Daniel, 5 Nov 2026:
     "if the idea is to show how something is going through it, make sure that the proteins are completely visible to
     the student"); the lipids beside it and behind it stay, so it is still seen in the membrane */
  const blockedOM = (u, w) => P.porins.some(p => Math.hypot(u - p.u, w - p.w) < 2.5 || (Math.abs(u - p.u) < 2.9 && w > p.w));
  const blockedIM = (u, n, w) => n > nB - 4 && (Math.hypot(u - P.mpc.u, w - P.mpc.w) < 2.9 || (Math.abs(u - P.mpc.u) < 3.3 && w > P.mpc.w)) ||
    P.pumps.some(p => Math.abs(u - (uc + p.wall * hw)) < 4.2 && (Math.abs(n - p.n) < (p.kind === 1 ? 9.2 : 5.2) && Math.abs(w - p.w) < (p.kind === 1 ? 3.4 : 3.8) ||
      Math.abs(n - p.n) < (p.kind === 1 ? 9.8 : 5.8) && w > p.w)) ||
    /* in front of each ATP synthase's ring, so that the ring is seen turning (like the cut face) */
    (n < nR - hw * 0.2 && w > P.atp.w - 3.4 && [-1, 1].some(sd => Math.hypot(u - (uc + sd * Math.sin(0.75) * hw * BULB), n - (nR - Math.cos(0.75) * hw * BULB)) < 4.6));
  /* the lipids: along each middle line every 0.85 nm, in rows behind the cut face; a head on each side (towards the
     water) and two tails towards the middle */
  const lip = [];
  const walk = (line, blocked) => {
    const seg = []; let L = 0;
    for (let i = 1; i < line.length; i++) { const a = line[i - 1], b = line[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push([a, b, l, L]); L += l; }
    for (let r = 0; r < rows; r++) {
      const w = -0.45 - r * 0.85;
      for (let s = (r % 2) * 0.42; s < L; s += 0.85) {
        const S = seg.find(x => s >= x[3] && s <= x[3] + x[2]) || seg[seg.length - 1];
        const k = (s - S[3]) / S[2], u = S[0][0] + (S[1][0] - S[0][0]) * k, n = S[0][1] + (S[1][1] - S[0][1]) * k;
        const tu = (S[1][0] - S[0][0]) / S[2], tn = (S[1][1] - S[0][1]) / S[2];
        if (blocked(u, n, w)) continue;
        for (const side of [1, -1]) lip.push({ u: u + rr(-0.08, 0.08), n: n + rr(-0.08, 0.08), w: w + rr(-0.1, 0.1), nu: -tn * side, nn: tu * side, a: rr(0, 6.283) });
      }
    }
  };
  walk(om, (u, n, w) => blockedOM(u, w));
  walk(im, blockedIM);
  const headMat = magicStandard({ color: COL.head, emissive: 0x5c1a3c, emissiveIntensity: 0.45, roughness: 0.45 }, { rim: 0xffd2e8, rimK: 0.45 });
  const tailMat = magicStandard({ color: COL.tail, emissive: 0x4a3614, emissiveIntensity: 0.3, roughness: 0.6 });
  const front = lip.filter(L => L.w > -2.9), rest = lip.filter(L => L.w <= -2.9);
  lip.length = 0; lip.push(...front, ...rest);
  const heads = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.45, 1), headMat, front.length);
  const headsB = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.45, 0), headMat, rest.length);
  const tails = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.13, 0.1, 2.0, 5, 1, true), tailMat, lip.length * 2);
  {
    const o = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3(), side = new THREE.Vector3();
    lip.forEach((L, i) => {
      d.set(L.nu, L.nn, 0);
      o.quaternion.identity(); o.scale.setScalar(1);
      o.position.set(L.u + L.nu * 2.6, L.n + L.nn * 2.6, L.w); o.updateMatrix(); if (i < front.length) heads.setMatrixAt(i, o.matrix); else headsB.setMatrixAt(i - front.length, o.matrix);
      o.quaternion.setFromUnitVectors(up, d);
      for (let k = 0; k < 2; k++) {
        side.set(-L.nn, L.nu, 0).multiplyScalar(Math.cos(L.a) * 0.21 * (k ? 1 : -1)).add(new THREE.Vector3(0, 0, Math.sin(L.a) * 0.21 * (k ? 1 : -1)));
        o.position.set(L.u + L.nu * 1.15, L.n + L.nn * 1.15, L.w).add(side); o.updateMatrix(); tails.setMatrixAt(i * 2 + k, o.matrix);
      }
    });
    [heads, headsB, tails].forEach(m => { m.instanceMatrix.needsUpdate = true; m.computeBoundingSphere(); });
  }
  heads.name = 'patch-heads'; headsB.name = 'patch-heads-back'; tails.name = 'patch-tails'; g.add(heads, headsB, tails);
  /* channel proteins (porins) in the outer membrane: a barrel of strands round a wide way through */
  const porinGeo = (() => {
    const geo = new THREE.CylinderGeometry(1.95, 1.95, 4.8, 38, 6, true), p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const a = Math.atan2(v.z, v.x), k = 1 + 0.06 * Math.cos(19 * a + v.y * 0.9); p.setXYZ(i, v.x * k, v.y, v.z * k); }
    geo.computeVertexNormals();
    const inner = new THREE.CylinderGeometry(1.3, 1.3, 4.8, 24, 1, true); inner.scale(-1, 1, 1);
    const rimT = new THREE.RingGeometry(1.3, 2.05, 38); rimT.rotateX(-Math.PI / 2); rimT.translate(0, 2.4, 0);
    const rimB = rimT.clone(); rimB.rotateX(Math.PI);
    return mergeGeometries([geo.toNonIndexed(), inner.toNonIndexed(), rimT.toNonIndexed(), rimB.toNonIndexed()]);
  })();
  const porMat = protMat(COL.porin, 0.7); porMat.side = THREE.DoubleSide;
  const porins = P.porins.map(p => { const m = new THREE.Mesh(porinGeo, porMat); m.position.set(p.u, -3.5, p.w); g.add(m); return m; });
  /* the carrier protein of the smaller molecules (the mitochondrial pyruvate carrier): two halves that meet face to face
     round a pocket that pyruvate fits, and change shape in the real order, as the way in's carriers do (cellbuild.js
     carrier; play.js feed). pose(s): -1 open to the matrix (below), 0 shut on both sides, 1 open to the space between
     the membranes (above). Each half is its old shape moved 0.2 nm across the middle plane, and the part past it made
     its flat face, with half of the pocket cut into it */
  const mpc = new THREE.Group(); mpc.position.set(P.mpc.u, nB, P.mpc.w); g.add(mpc);
  const mpcMat = protMat(COL.mpc, 0.8);
  const MP = { cx: 0.85, P: 0.55, Ph: 0.6, Pz: 0.55, turn: 0.32 }, mEnd = 2.8 * Math.sqrt(1 - (MP.cx / 1.05) ** 2);
  const halves = [-1, 1].map(s => {
    const geo = blob(1.05, 2.8, 1.9, s + 4), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), z = p.getZ(i); let x = p.getX(i) + s * MP.cx;
      if (s * x <= 0) { const q = 1 - (y / MP.Ph) ** 2 - (z / MP.Pz) ** 2; x = q > 0 ? s * MP.P * Math.sqrt(q) : 0; }
      p.setX(i, x);
    }
    geo.computeVertexNormals();
    const h = new THREE.Mesh(geo, mpcMat); mpc.add(h); return h;
  });
  const mpcPart = { group: mpc, halves, s: 0, Ph: MP.Ph, end: mEnd, top: 3.08,
    pose(s) {
      mpcPart.s = s;
      const py = s < 0 ? mEnd : -mEnd;
      halves.forEach((h, k) => { const a = (k ? -1 : 1) * Math.sign(s) * MP.turn * Math.abs(s); h.rotation.z = a; h.position.set(py * Math.sin(a), py * (1 - Math.cos(a)), 0); });
    } };
  mpcPart.pose(1); mpc.name = 'mpc'; mpc.userData.part = mpcPart;   /* (tools/carrier-order.mjs reads its pose) */
  /* the pumps on the crista's two walls (their matrix side outwards), and ATP synthase at its round end, two together */
  const pumps = P.pumps.map(p => {
    const m = pump(p.kind), x = uc + p.wall * hw;
    m.position.set(x, p.n, p.w); m.rotation.z = p.wall < 0 ? Math.PI / 2 : -Math.PI / 2;   /* the matrix side (+y of the pump) away from the crista */
    g.add(m); return Object.assign({ obj: m, x }, p);
  });
  const atp = [-1, 1].map(s => {
    const a = anAtpSynthase(), ang = s * 0.75, rb = hw * BULB;                              /* two at the crista's rim, about 86° apart */
    a.position.set(uc + Math.sin(ang) * rb, nR - Math.cos(ang) * rb, P.atp.w); a.rotation.z = Math.PI + ang;
    g.add(a); return a;
  });
  /* behind the rows of lipids: the same parts, darker, as water further away */
  const BW = 2 * U + 120, BH = 260;
  const backGeo = new THREE.PlaneGeometry(BW, BH); backGeo.translate(0, -80, 0);      /* in the patch's own u, n */
  const back = new THREE.Mesh(backGeo, new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Color(0x173a7a) }, uI: { value: new THREE.Color(COL.ims).multiplyScalar(0.8) }, uM: { value: new THREE.Color(COL.matrix).multiplyScalar(0.8) }, uA: { value: 1 } }, transparent: true,
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform vec3 uC; uniform vec3 uI; uniform vec3 uM; uniform float uA; varying vec2 vP;
      float sdRoundBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
      void main() {
        float n = vP.y;
        float e = -(n - (${nB.toFixed(2)}));
        e = smin(e, sdRoundBox(vec2(vP.x - (${uc.toFixed(2)}), n - (${((nB + 4 + nR - hw) / 2).toFixed(2)})), vec2(${hw.toFixed(2)}, ${((nB + 4 - (nR - hw)) / 2).toFixed(2)}), ${hw.toFixed(2)}), 3.0);
        /* seen far behind the lipids, in perspective: no membranes on it, the spaces' colours blended into each other */
        vec3 c = mix(uI, uM, smoothstep(-6.0, 6.0, e));
        c = mix(c, uC, smoothstep(-9.0, -2.0, n));
        /* soft edges, so it never shows as a rectangle while the camera passes */
        float edge = smoothstep(0.0, 12.0, ${(BW / 2).toFixed(1)} - abs(vP.x)) * smoothstep(0.0, 12.0, ${(BH / 2).toFixed(1)} - abs(vP.y + 80.0));
        gl_FragColor = vec4(c, uA * edge);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  }));
  back.position.set(0, 0, -rows * 0.85 - 1.6); g.add(back);
  /* points to name and to aim at, in the patch's coordinates (nm) */
  const pts = {
    cytosol: new THREE.Vector3(-34, 6, 0), om: new THREE.Vector3(-36, -1.5, 0), ims: new THREE.Vector3(-36, -14.5, 0), im: new THREE.Vector3(-38, nB + 1.5, 0),
    matrix: new THREE.Vector3(-30, -46, 0), porin: new THREE.Vector3(P.porins[0].u, -3.5, P.porins[0].w), mpc: new THREE.Vector3(P.mpc.u, nB, P.mpc.w),
    crista: new THREE.Vector3(uc, nB - depth * 0.45, 0), lumen: new THREE.Vector3(uc, nB - 20, 0), pump4: new THREE.Vector3(uc - hw - 3, -70, -3.8),
    atp: new THREE.Vector3(uc, nR - hw - 12, P.atp.w)
  };
  return { group: g, pts, parts: { heads, tails, porins, mpc: mpcPart, pumps, atp, back }, geo: { uc, hw, nB, nR, depth, U }, count: lip.length };
}

/* ============================================================ hydrogen ions through ATP synthase, and ATP made ============================================================ */
/* the place's dam (play.js); the Explorer film that also used them (mitofilm.js) was replaced by the IB extension (js/ib/)
   on 5 Nov 2026 */
const smooth01 = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/* hydrogen ions: lime, a colour nothing else in the mitochondrion has (the expert review, 5 Nov 2026: pink ions on the
   plum fold, beside pink lipid heads, were the faintest thing there, so the crowd behind the "dam" was hardly seen) */
export const H_COL = 0x9dff3c;
let HALO_TEX = null;
/* a soft round light round a small molecule (light, not size: memory true-relative-sizes), so that pupils find it */
export function haloTexture() {
  if (HALO_TEX) return HALO_TEX;
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  HALO_TEX = new THREE.CanvasTexture(c); HALO_TEX.colorSpace = THREE.SRGBColorSpace; return HALO_TEX;
}
export const haloSprite = (o, nm, color = 0xfff4d0) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.setScalar(nm * 3); sp.renderOrder = 9; o.add(sp); return o; };
/* glows for many small molecules at once (one draw): colour black = not drawn (additive light adds nothing) */
export function glowPoints(n, sizeUnits) {
  const p = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ map: haloTexture(), size: sizeUnits, sizeAttenuation: true, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  p.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); p.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  p.frustumCulled = false; return p;
}
/* a small molecule of the head: ADP or ATP (adenine, ribose and two or three phosphates) or one phosphate (nm) */
export function nucleotide(np, mats) {
  const g = new THREE.Group();
  if (np > 0) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 6, 6), mats.base); ring.position.set(-0.62, 0.08, 0); g.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.06, 6, 5), mats.base); ring2.position.set(-0.92, 0.2, 0); g.add(ring2);
    const sugar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.055, 6, 5), mats.sugar); sugar.position.set(-0.28, -0.12, 0); g.add(sugar);
  }
  for (let i = 0; i < Math.max(1, np); i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), mats.p); p.position.set(np ? 0.05 + i * 0.36 : 0, np ? -0.12 : 0, 0); g.add(p); }
  return g;
}
export const nucleotideMats = () => ({ base: new THREE.MeshStandardMaterial({ color: 0x6fa8ff, emissive: 0x2a4a9a, emissiveIntensity: 0.5, roughness: 0.4 }), sugar: new THREE.MeshStandardMaterial({ color: 0xf2f2ff, emissive: 0x404060, emissiveIntensity: 0.4, roughness: 0.4 }), p: new THREE.MeshStandardMaterial({ color: 0xffb02e, emissive: 0x7a4a00, emissiveIntensity: 0.6, roughness: 0.35 }) });
/* the stream of hydrogen ions through ONE ATP synthase, a watermill (Daniel, 5 Nov 2026: "churning … due to the proton
   flow … seeing the protons flowing and that triggering the turning"). In its own frame (nm; +y towards the head, the
   crista's space at −y, +z towards the camera): ion k waits in the crista's space, goes into the inlet beside subunit a
   while the ring is still, then the ring moves one eighth of a turn (in steps, one for each ion: 8 c subunits); 7 steps
   later it is at the outlet and leaves into the matrix. At every step one goes in and one comes out. T counts the ions.
   The ring turns as it does when ATP is MADE: clockwise seen from the membrane (from −y). Turning the other way, as
   when ATP is broken down, is what Noji et al. 1997 (Nature 386:299) filmed; the expert review, 5 Nov 2026, caught the
   first version turning that way. So the ion goes in on the far side of subunit a (−z) and comes out on the near side. */
export function ionStream(AS, { n = 17, mat = null, glowSize = 0.0036 } = {}) {
  const RR = (AS.userData.ringR || 2.25) + 0.75, IN = -0.4, DIR = -1;             /* the ring's outer face; the inlet's angle; clockwise from −y */
  const ringAt = T => Math.floor(T) + smooth01(0.5, 1, T - Math.floor(T));       /* the ring: still, then one eighth */
  /* the way, through open water so that it is seen: from the middle of the crista's space (C) to the inlet's mouth (M);
     out of the outlet (S7) to just above the membrane on the near side (E1), clear of the side arm, then into the matrix */
  const M = new THREE.Vector3(2.4, -5.2, -1.5), C = new THREE.Vector3(0.4, -9.0, -1.8), E1 = new THREE.Vector3(1.0, 3.8, 3.4);
  const ringSite = a => new THREE.Vector3(Math.cos(a) * RR, 0.4, Math.sin(a) * RR), S0 = ringSite(IN), S7 = ringSite(IN + DIR * 7 * Math.PI / 4);
  const far = new THREE.Vector3();
  const ionAt = (k, T, out) => {                                     /* where ion k is, and how bright (0: not drawn) */
    const q = T - k;
    if (q < -3 || q >= 12) return 0;
    if (q < 0) { out.copy(M).lerp(C, -q / 3); out.x += 0.4 * Math.sin(2.3 * q + k); out.z += 0.5 * Math.cos(1.9 * q + 2 * k); return 1; }   /* waiting */
    if (q < 0.5) { out.copy(M).lerp(S0, smooth01(0, 0.5, q)); return 1; }                                                        /* in, through subunit a */
    if (q < 7) { const a = IN + DIR * (ringAt(T) - k) * Math.PI / 4; out.set(Math.cos(a) * RR, 0.4, Math.sin(a) * RR); return 1; }   /* on the ring */
    if (q < 7.5) { out.copy(S7).lerp(E1, smooth01(7, 7.5, q)); return 1; }                                                       /* out */
    /* then away into the matrix, a little further each moment, fading among the others there: the outflow is seen */
    const f = smooth01(7.5, 12, q);
    out.copy(E1).lerp(far.set(-3.0 + 2.5 * Math.sin(k), 10.5, 4.3), f);
    return 1 - f;
  };
  const ions = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 10, 8), mat || new THREE.MeshStandardMaterial({ color: H_COL, emissive: H_COL, emissiveIntensity: 0.9, roughness: 0.3 }), n);
  ions.frustumCulled = false; AS.add(ions);
  const glow = glowPoints(n, glowSize); AS.add(glow);
  const tv = new THREE.Vector3(), tm = new THREE.Matrix4(), tq = new THREE.Quaternion(), ts = new THREE.Vector3(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
  return {
    RR, ringAt, ionAt, ions, glow,
    /* the rotor's turn about +y for T (three.js turns +x towards −z for a positive angle: the ring's ions go the same way) */
    rotorY: T => -DIR * ringAt(T) * Math.PI / 4,
    /* T: the hydrogen ions through so far (eighths of a turn); on: the stream drawn at all */
    update(T, on = true) {
      const k0 = Math.floor(T), gp = glow.geometry.attributes.position, gc = glow.geometry.attributes.color;
      for (let j = 0; j < n; j++) {
        const k = k0 - 12 + ((j - (k0 - 12)) % n + n) % n, sz = on ? ionAt(k, T, tv) : 0;
        if (!sz) { ions.setMatrixAt(j, zero); gc.setXYZ(j, 0, 0, 0); continue; }
        tm.compose(tv, tq, ts.setScalar(sz)); ions.setMatrixAt(j, tm); gp.setXYZ(j, tv.x, tv.y, tv.z); gc.setXYZ(j, 0.75 * sz, 1.0 * sz, 0.4 * sz);
      }
      ions.instanceMatrix.needsUpdate = true; gp.needsUpdate = gc.needsUpdate = true;
    }
  };
}
/* ADP and phosphate join into ATP at the head: one for each third of a turn, which then leaves (nine, used again every
   three turns). On the head's surface: the measured head reaches 5 to 6.4 nm from its axis (the drawn one, 4.9) */
export function atpMaker(AS, mats = nucleotideMats()) {
  const made = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(() => { const g = new THREE.Group(), adp = nucleotide(2, mats), pi = nucleotide(0, mats), p3 = nucleotide(0, mats); p3.position.set(0.77, -0.12, 0); g.add(adp, pi, p3); haloSprite(adp, 1.6); haloSprite(pi, 0.6); g.userData = { adp, pi, p3 }; g.visible = false; AS.add(g); return g; });
  const rr = AS.userData.measured ? 6.7 : 4.9, sp = new THREE.Vector3(), far = new THREE.Vector3();
  return {
    made,
    /* the one being made now (or, for ATP, the newest made) */
    nowMade: T => made[Math.max(0, Math.floor(T / (8 / 3) - 1e-6)) % 9],
    /* on the head's near side (one of the three sites faces away, behind the head) */
    seen: m => m.visible && m.position.z > -1.5,
    update(T, on = true) {
      made.forEach((m, j) => {
        const d = T - j * 8 / 3, kk = d < 23.4 ? d : ((d + 0.6) % 24) - 0.6;   /* 0 … 8/3 while this one is made (then again, every 3 turns) */
        m.visible = on && kk > -0.6 && kk < 8 / 3 + 1.6;
        if (!m.visible) return;
        const site = (j % 3) * 2 * Math.PI / 3 + Math.PI / 3;
        const arrive = smooth01(-0.6, 0.6, kk), join = smooth01(1.4, 2.4, kk), leave = smooth01(8 / 3, 8 / 3 + 1.6, kk);
        sp.set(Math.cos(site) * rr, 12 + 1.2, Math.sin(site) * rr); far.copy(sp).multiplyScalar(1.6).setY(16 + 3 * leave);
        m.position.copy(far).lerp(sp, arrive * (1 - leave)); m.position.y += 4 * leave;
        m.userData.pi.position.set(1.6 - 0.83 * join, 0.4 - 0.52 * join, 0); m.userData.p3.visible = false; m.userData.pi.visible = true;
        m.userData.join = join; m.userData.leave = leave;      /* read by the tags that name it (play.js dam) */
      });
    }
  };
}
