/* ============================================================
   pore.js — one nuclear pore at its true size, in the two membranes of the nucleus (8 Nov 2026).
   Daniel, 8 Nov 2026: "show it closed. And then when you click on enter through a pore, really make it nice and incredible
   as you dive in, and then suddenly you enter through the doors of a pore. That needs to be magical. And then you see the
   inside." Until a pupil has first been inside, the nucleus is closed (cellbuild.js); the camera then dives to ONE pore
   (play.js dive), and there every part is drawn at its true size: the camera comes closer, nothing is made bigger (memory
   true-relative-sizes; the world's pores are drawn about twice as wide, and they shrink to their true size as the camera
   comes in).
   Sizes (nm), the human nuclear pore complex in cells (Beck and Hurt 2017, Nat Rev Mol Cell Biol 18:73; Schuller et al.
   2021, Nature 598:667; Mosalaganti et al. 2022, Science 376:eabm9506; Alberts, Molecular Biology of the Cell, 7th ed.,
   ch. 12):
   - the nuclear envelope: two membranes, each 7 nm thick (a bilayer of lipids, each head about 0.9 nm), 40 nm apart (the
     space between them is 30 to 50 nm); at a pore the two membranes join round a hole about 94 nm wide;
   - the pore complex in that hole: about 120 nm across and 80 nm high, three rings of proteins one above the other, each
     the same part eight times round the middle (eightfold symmetry): the cytoplasmic ring, the inner ring (in the hole,
     round a channel about 55 nm wide) and the nuclear ring;
   - eight filaments about 45 nm long reach into the cytoplasm from the cytoplasmic ring (Nup358);
   - eight filaments about 70 nm long reach into the nucleus from the nuclear ring and join at a small ring about 40 nm
     wide: the nuclear basket (Tpr);
   - the channel is filled with soft protein threads that move all the time (the FG repeats of several nucleoporins):
     small molecules pass between them, larger ones only with a carrier protein; about 1000 molecules pass through one pore
     every second (Ribbeck and Görlich 2001, EMBO J 20:1320). As the camera passes, the threads near it bend back, like
     doors that open, and close behind it.
   Coordinates: the pore's own, in nm: y along its axis, out of the nucleus (towards the cytoplasm), y = 0 the outer face of
   the outer membrane (where the world's envelope is); x and z across. The caller places the group (nm → µm, on the pore).
   The membranes follow the world's envelope exactly: a point of the plane that touches the envelope at the pore, (x, z),
   is carried along the line from the middle of the nucleus onto the envelope, then h nm in along its normal. The world's
   two envelopes have a hole there along the same lines (cellbuild.js uHole), so the patch fits it with nothing between, and
   at its edge it has the envelope's own look. Close up each lipid head shows: a pattern worked out for every point of the
   screen, sharp however close the camera comes, and faded where a head would be smaller than about two pixels.
   Each membrane is a layer 7 nm thick: its outer faces (towards the cytoplasm, the pore and the nucleus) and its faces
   towards the space between the two membranes are both drawn, so the space is really there.
   The cut (8 Nov 2026; Daniel, of a round window that had shown the inner membrane: "I don't think that is very clear …
   you clearly see that there is a space between the inner membrane and the outer membrane … think how to do that
   properly"): the pore is drawn in two halves on either side of a plane through its axis, as a textbook draws the envelope
   in section. The near half (towards where the camera stops beside it) is a lid that the dive takes away and puts back;
   then the cut faces show each membrane in section, two rows of lipid heads with their tails between, pink and peach as
   at the way in, and the space between the two membranes. No protein is cut: each goes with the half its middle is in.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { mergeGeometries, mergeVertices } from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js?v=0.185.1';
import { PAL, magicStandard, CUT } from './magic.js?v=202611100738';

/* the sizes above, in nm (play.js reads them for the camera's way through) */
export const NPC = {
  mem: 7, lum: 40, out: 0, mid: -27, in: -54,     /* the outer membrane's outer face (y 0), the middle of the envelope, the inner membrane's inner face */
  hole: 47, bend: 74,                              /* the pore membrane's narrowest radius (a hole 94 nm wide); where the two membranes become flat */
  ring: 60, chan: 28,                              /* the complex's outer radius (120 nm across); its channel's radius (56 nm across) */
  crY: [-6, 10], irY: [-47, -7], nrY: [-64, -48], /* the three rings: cytoplasmic, inner, nuclear (74 nm from top to bottom) */
  tips: 56, distal: -136, distalR: 19,             /* the cytoplasmic filaments' tips; the basket's distal ring and its radius */
  patch: 450                                       /* the patch of membrane round the pore: 0.9 µm across */
};

function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(20261108), rr = (a, b) => a + (b - a) * R();

/* a protein's rounded shape (as in mitoparts.js): an ellipsoid, a little lumpy; the round shape it starts from is made
   once and copied (making it for each of the 72 proteins took most of the build) */
const BALL = {};
function blob(sx, sy, sz, seed, detail = 2) {
  if (!BALL[detail]) { let b = new THREE.IcosahedronGeometry(1, detail); b.deleteAttribute('normal'); b.deleteAttribute('uv'); BALL[detail] = mergeVertices(b); }
  const g = BALL[detail].clone(), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const k = 1 + 0.09 * Math.sin(v.x * 5 + seed) * Math.sin(v.y * 4 - seed * 0.7) + 0.05 * Math.sin(v.z * 7 + seed * 2);
    p.setXYZ(i, v.x * sx * k, v.y * sy * k, v.z * sz * k);
  }
  return g;
}
/* a protein bent along a ring: its length along the ring of radius r, from angle a0 (radians, in the x-z plane) */
function arcBlob(r, a0, y, len, wid, hgt, seed, detail = 2) {
  const g = blob(wid / 2, hgt / 2, len / 2, seed, detail), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), yy = p.getY(i), z = p.getZ(i), a = a0 + z / r, rad = r + x;
    p.setXYZ(i, rad * Math.cos(a), y + yy, rad * Math.sin(a));
  }
  g.computeVertexNormals();
  return g;
}
/* a protein at a place, its own x along the radius at angle a */
function placed(g, r, a, y, tilt = 0) {
  const m = new THREE.Matrix4().makeRotationY(-a).multiply(new THREE.Matrix4().makeRotationZ(tilt)).setPosition(r * Math.cos(a), y, r * Math.sin(a));
  g.applyMatrix4(m); g.computeVertexNormals(); return g;
}
/* a thin thread along a curve, its radius rad(s) (s 0 at its root … 1 at its tip), with what the shader needs to move it:
   its root, s, a phase and how far its tip may sway (nm) */
function thread(curve, n, radial, rad, amp) {
  const g = new THREE.TubeGeometry(curve, n, 1, radial, false), p = g.attributes.position, nrm = g.attributes.normal;
  const root = curve.getPointAt(0), ph = rr(0, 6.283), c = new THREE.Vector3(), v = new THREE.Vector3();
  const S = new Float32Array(p.count), RT = new Float32Array(p.count * 3), PH = new Float32Array(p.count), AM = new Float32Array(p.count);
  for (let i = 0; i <= n; i++) {
    const s = i / n; curve.getPointAt(s, c);
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(p, k).sub(c).multiplyScalar(rad(s)).add(c); p.setXYZ(k, v.x, v.y, v.z);
      S[k] = s; RT.set([root.x, root.y, root.z], k * 3); PH[k] = ph; AM[k] = amp;
    }
  }
  nrm.needsUpdate = true;
  g.setAttribute('aS', new THREE.BufferAttribute(S, 1)); g.setAttribute('aRoot', new THREE.BufferAttribute(RT, 3));
  g.setAttribute('aPh', new THREE.BufferAttribute(PH, 1)); g.setAttribute('aAmp', new THREE.BufferAttribute(AM, 1));
  g.deleteAttribute('uv');
  return g;
}
const strip = g => { ['uv', 'aS', 'aRoot', 'aPh', 'aAmp'].forEach(a => g.attributes[a] && g.deleteAttribute(a)); return g; };

/* the threads' motion, in the vertex shader (one draw for all of them): each sways a little, more towards its tip; near the
   camera (uCamY, its height on the axis, nm; most 22 nm ahead of it, so that they are seen opening) the channel's threads
   bend back towards the wall and a little the way it goes (uOpen 0 … 1): the doors open as it comes and close behind it */
function swaying(m, open, shared) {
  const u = m.userData.sway = shared || { uCamY: { value: 400 }, uOpen: { value: 0 } };
  const before = m.onBeforeCompile, key = m.customProgramCacheKey;
  m.onBeforeCompile = (sh, r) => {
    before(sh, r);
    sh.uniforms.uTime = CUT.uTime; Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aS; attribute vec3 aRoot; attribute float aPh; attribute float aAmp; uniform float uTime; uniform float uCamY; uniform float uOpen;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        {
          float s2 = aS * aS;
          transformed += aAmp * s2 * vec3(sin(uTime * 1.3 + aPh), 0.55 * sin(uTime * 1.7 + aPh * 1.9), sin(uTime * 1.05 + aPh * 0.7));
          ${open ? `float k = uOpen * exp(-pow((transformed.y - uCamY + 8.0) / 16.0, 2.0)) * pow(aS, 1.1);
          transformed.xz += normalize(aRoot.xz + vec2(1e-4, 0.0)) * k * 30.0;
          transformed.y -= k * 8.0;` : ''}
        }`);
  };
  m.customProgramCacheKey = () => key() + (open ? '|fg' : '|sway');
  return m;
}

/* the membrane's look: the outer membrane's colour outside, the inner membrane's inside (aT 0 … 1 along the profile), and
   close up, its lipid heads, packed 0.85 nm apart (a jittered grid on the plane's x, z: each head a soft disc 0.9 nm
   across, a little lighter, on the darker tails between) */
function membraneLook(m) {
  const u = m.userData.mem = { uInner: { value: new THREE.Color(0x4f42b8) }, uRmax: { value: NPC.patch }, uHeads: { value: 1 } };
  const before = m.onBeforeCompile, key = m.customProgramCacheKey;
  m.onBeforeCompile = (sh, r) => {
    before(sh, r);
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 aXZ; attribute float aT; varying vec2 vXZ; varying float vT; varying vec3 vON;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvXZ = aXZ; vT = aT; vON = normal;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec3 uInner; uniform float uRmax; uniform float uHeads; varying vec2 vXZ; varying float vT; varying vec3 vON;
        vec2 hh22(vec2 p) { return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        {
          diffuseColor.a *= 1.0 - smoothstep(uRmax, uRmax + 20.0, length(vXZ));   /* beyond the hole it fades over the envelope */
          diffuseColor.rgb = mix(diffuseColor.rgb, uInner, smoothstep(0.3, 0.7, vT));
          vec2 fw = fwidth(vXZ); float px = max(fw.x, fw.y);
          float k = uHeads * smoothstep(0.5, 0.22, px) * smoothstep(uRmax, uRmax * 0.55, length(vXZ)) * smoothstep(0.5, 0.8, abs(normalize(vON).y));
          if (k > 0.002) {
            vec2 q = vXZ / 0.85, ci = floor(q), cf = fract(q); float best = 9.0; float id = 0.0;
            for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
              vec2 o = vec2(float(i), float(j)), h = hh22(ci + o), d = o + 0.5 + 0.36 * (h - 0.5) - cf;
              float dd = dot(d, d); if (dd < best) { best = dd; id = h.x; }
            }
            float head = smoothstep(0.30, 0.15, best);
            vec3 c = mix(diffuseColor.rgb * 0.5, diffuseColor.rgb * 1.4 + vec3(0.07, 0.05, 0.12), head) * (0.9 + 0.2 * id);
            diffuseColor.rgb = mix(diffuseColor.rgb, c, k);
          }
        }`);
  };
  m.customProgramCacheKey = () => key() + '|patch';
  return m;
}

/* a membrane in section (the cut faces): across it (aV 0 … 7 nm, 0 its outer face) two rows of lipid heads, one at each
   face, their tails between, a head every 0.85 nm along it (aU, nm); the colours of the lipids at the way in (pink heads,
   peach tails: cellbuild.js); seen from further away, where a head is smaller than about two pixels, the same as bands */
function bilayerLook(m) {
  const before = m.onBeforeCompile, key = m.customProgramCacheKey;
  m.onBeforeCompile = (sh, r) => {
    before(sh, r);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aU; attribute float aV; varying float vU; varying float vV;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvU = aU; vV = aV;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vU; varying float vV;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        {
          float px = max(fwidth(vU), fwidth(vV)), a = vU / 0.85;
          vec2 hA = vec2((fract(a) - 0.5) * 0.85, vV - 0.45), hB = vec2((fract(a + 0.5) - 0.5) * 0.85, vV - 6.55);
          float head = max(smoothstep(0.47, 0.3, length(hA)), smoothstep(0.47, 0.3, length(hB)));
          float tail = smoothstep(0.17, 0.05, abs(hA.x)) * step(0.85, vV) * step(vV, 3.45) + smoothstep(0.17, 0.05, abs(hB.x)) * step(3.55, vV) * step(vV, 6.15);
          vec3 HEAD = vec3(1.0, 0.33, 0.58), TAIL = vec3(1.0, 0.69, 0.39);
          float band = 1.0 - smoothstep(1.3, 1.8, min(vV, 7.0 - vV));      /* from further away: a row of heads at each face */
          vec3 coarse = mix(TAIL * 0.8, HEAD * 0.9, band), fine = mix(mix(TAIL * 0.55, TAIL, tail), HEAD, head);
          diffuseColor.rgb = mix(coarse, fine, smoothstep(0.6, 0.25, px));
        }`);
  };
  m.customProgramCacheKey = () => key() + '|bilayer';
  return m;
}

/* the whole: { group (nm, nucleus-local after the caller's matrix), npc (the complex, a child: it may be faded or hidden on
   its own), patch (the membranes), parts, sway (the threads' uniforms), mats (the materials, to compile and dispose) }.
   env: the envelope in nucleus-local µm: p0 (the pore on the outer envelope), n0 (its normal), e1, e2 (across), R and sy
   (the envelope: |(x, y / sy, z)| = R) */
export async function buildPore(env) {
  /* built in parts, the page drawing between them (a slow phone would otherwise stop for a quarter of a second) */
  const pause = () => new Promise(r => setTimeout(r, 0)), T0 = performance.now(), took = [];
  const g = new THREE.Group(); g.name = 'pore-dive';
  const npc = new THREE.Group(); npc.name = 'pore-complex'; g.add(npc);
  /* the lid: the near half of the membranes and of the complex (the cut, below) */
  const lidM = new THREE.Group(); lidM.name = 'pore-lid-membranes'; g.add(lidM);
  const lidP = new THREE.Group(); lidP.name = 'pore-lid-complex'; npc.add(lidP);
  const mats = [], lidMats = [];
  /* ---------- the membranes. Two surfaces turned round the axis: the outer faces (from the outer membrane's outer face,
     round the pore's edge, the pore membrane, where the two membranes join, to the inner membrane's inner face) and,
     7 nm in from them, the faces towards the space between the membranes; each in two halves (the lid: the cut, below) ---------- */
  const { p0, n0, e1, e2, R: ER, sy } = env;
  const CUT = env.cut || 0, TWO = Math.PI * 2;
  const isNear = a => (((a - CUT) % TWO) + TWO) % TWO > Math.PI;          /* in the lid's half */
  const T = new THREE.Vector3(), S = new THREE.Vector3(), Nn = new THREE.Vector3(), out = new THREE.Vector3();
  /* the point of the envelope over the plane's (x, z) nm, h nm in along its normal, in the pore's own nm */
  const surf = (x, z, h) => {
    T.copy(p0).addScaledVector(e1, x / 1000).addScaledVector(e2, z / 1000);
    S.copy(T).multiplyScalar(ER / Math.hypot(T.x, T.y / sy, T.z));
    Nn.set(S.x, S.y / (sy * sy), S.z).normalize();
    out.copy(S).addScaledVector(Nn, h / 1000).sub(p0).multiplyScalar(1000);
    return [out.dot(e1), out.dot(n0), out.dot(e2)];
  };
  const rb = NPC.bend, rad = (NPC.out - NPC.in) / 2, radL = rad - NPC.mem, MID = NPC.mid, RE = NPC.patch + 20, nF = 34, nB = 34;
  /* a profile: [r, h (nm), t (0 the outer membrane … 1 the inner)] from the far edge of the outer membrane round the pore to
     the far edge of the inner one. The outer faces' flats go 20 nm past the hole, lifted by 1 nm there and fading (the
     shader), so that no crack shows between them and the envelope's flat facets (the expert review: "a dotted arc where the
     patch meets the envelope") */
  const profile = (top, bottom, bend, edge) => {
    const prof = [], lift = r => r > NPC.patch ? (r - NPC.patch) / 20 : 0;
    if (edge) prof.push([RE, top + 1, 0]);
    for (let i = 0; i <= nF; i++) prof.push([NPC.patch * Math.pow(rb / NPC.patch, i / nF), top, 0]);
    for (let i = 1; i < nB; i++) { const q = Math.PI / 2 + Math.PI * i / nB; prof.push([rb + bend * Math.cos(q), MID + bend * Math.sin(q), i / nB]); }
    for (let i = 0; i <= nF; i++) prof.push([rb * Math.pow(NPC.patch / rb, i / nF), bottom, 1]);
    if (edge) prof.push([RE, bottom - lift(RE), 1]);
    return prof;
  };
  const profO = profile(NPC.out, NPC.in, rad, true), profL = profile(NPC.out - NPC.mem, NPC.in + NPC.mem, radL, false);
  /* a profile turned through the angles a0 … a1 (the edges exactly on the cut) */
  const revolve = (prof, a0, a1, n) => {
    const P = [], XZ = [], TT = [], idx = [];
    for (let i = 0; i < prof.length; i++) {
      const [r, h, t] = prof[i];
      for (let j = 0; j <= n; j++) { const q = a0 + (a1 - a0) * j / n, x = r * Math.cos(q), z = r * Math.sin(q); P.push(...surf(x, z, h)); XZ.push(x, z); TT.push(t); }
    }
    for (let i = 0; i + 1 < prof.length; i++) for (let j = 0; j < n; j++) {
      const A = i * (n + 1) + j, B = A + 1, C = A + n + 1, D = C + 1;
      idx.push(A, C, B, B, C, D);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    geo.setAttribute('aXZ', new THREE.Float32BufferAttribute(XZ, 2));
    geo.setAttribute('aT', new THREE.Float32BufferAttribute(TT, 1));
    geo.setIndex(idx); geo.computeVertexNormals();
    return geo;
  };
  /* a cut face, in the half-plane at angle q: each membrane in section, from the patch's edge along the outer membrane,
     round the pore membrane, and back along the inner membrane (aU along it, nm; aV across, 0 at its outer face) */
  const capStrip = q => {
    const path = [];
    for (let i = 0; i <= nF; i++) { const r = NPC.patch * Math.pow(rb / NPC.patch, i / nF); path.push([[r, NPC.out], [r, NPC.out - NPC.mem], 0]); }
    for (let i = 1; i < nB; i++) { const w = Math.PI / 2 + Math.PI * i / nB, c = Math.cos(w), sn = Math.sin(w); path.push([[rb + rad * c, MID + rad * sn], [rb + radL * c, MID + radL * sn], i / nB]); }
    for (let i = 0; i <= nF; i++) { const r = rb * Math.pow(NPC.patch / rb, i / nF); path.push([[r, NPC.in], [r, NPC.in + NPC.mem], 1]); }
    const ACROSS = 6, P = [], U = [], Vv = [], TT = [], idx = [];
    let u = 0;
    for (let i = 0; i < path.length; i++) {
      const [[ro, ho], [rl, hl], t] = path[i];
      if (i) { const [[ro0, ho0], [rl0, hl0]] = path[i - 1]; u += Math.hypot((ro + rl) / 2 - (ro0 + rl0) / 2, (ho + hl) / 2 - (ho0 + hl0) / 2); }
      for (let j = 0; j <= ACROSS; j++) {
        const f = j / ACROSS, r = ro + (rl - ro) * f, h = ho + (hl - ho) * f;
        P.push(...surf(r * Math.cos(q), r * Math.sin(q), h)); U.push(u); Vv.push(NPC.mem * f); TT.push(t);
      }
    }
    for (let i = 0; i + 1 < path.length; i++) for (let j = 0; j < ACROSS; j++) {
      const A = i * (ACROSS + 1) + j, B = A + 1, C = A + ACROSS + 1, D = C + 1;
      idx.push(A, C, B, B, C, D);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    geo.setAttribute('aU', new THREE.Float32BufferAttribute(U, 1)); geo.setAttribute('aV', new THREE.Float32BufferAttribute(Vv, 1));
    geo.setIndex(idx); geo.computeVertexNormals();
    return geo;
  };
  /* the same look as the world's outer envelope (cellbuild.js), solid, so its edge cannot be told from it; the lid has its
     own copy, the same program, so that it alone can fade */
  const memLook = () => membraneLook(magicStandard({ color: PAL.nucleus, transparent: true, opacity: 1, side: THREE.DoubleSide, roughness: 0.3, depthWrite: true }, { rim: PAL.envelope, rimK: 1.1, rimPow: 2.0 }));
  const memMat = memLook(), memLid = memLook();
  /* the faces towards the space between the membranes: one soft colour, lit evenly (a light of their own), so that the
     space reads as one space between the two (the inner membrane's own deep blue had made its face there almost black) */
  const lumenLook = () => magicStandard({ color: 0x8b78dc, emissive: 0x2c2266, emissiveIntensity: 0.9, roughness: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 1, depthWrite: true }, { rim: 0xc8bcff, rimK: 0.4 });
  const lumenMat = lumenLook(), lumenLid = lumenLook();
  mats.push(memMat, memLid, lumenMat, lumenLid); lidMats.push(memLid, lumenLid);
  {
    const o = new THREE.Mesh(revolve(profO, CUT, CUT + Math.PI, 80), memMat); o.name = 'pore-membranes'; g.add(o);
    const l = new THREE.Mesh(revolve(profL, CUT, CUT + Math.PI, 80), lumenMat); l.name = 'pore-membranes-space'; g.add(l);
    /* the space closed where the patch ends, in the far half (inside the membranes, so seen only through the cut): looking
       along the space from beside the pore had shown, past the patch, the world's envelope seen from inside, dark */
    const endR = NPC.patch - 6, end = [];
    for (let i = 0; i <= 8; i++) end.push([endR, NPC.out - NPC.mem + (NPC.in - NPC.out + 2 * NPC.mem) * i / 8, 0.5]);
    const w = new THREE.Mesh(revolve(end, CUT, CUT + Math.PI, 80), lumenMat); w.name = 'pore-space-end'; g.add(w);
  }
  took.push(performance.now() - T0); await pause();
  {
    const o = new THREE.Mesh(revolve(profO, CUT + Math.PI, CUT + TWO, 80), memLid); o.name = 'pore-membranes-lid'; lidM.add(o);
    const l = new THREE.Mesh(revolve(profL, CUT + Math.PI, CUT + TWO, 80), lumenLid); l.name = 'pore-membranes-space-lid'; lidM.add(l);
    const capMat = bilayerLook(magicStandard({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.6, emissive: 0x3a0f26, emissiveIntensity: 0.3 }, { rim: 0xffd2e8, rimK: 0.1 }));
    mats.push(capMat);
    const caps = new THREE.Mesh(mergeGeometries([capStrip(CUT), capStrip(CUT + Math.PI)]), capMat); caps.name = 'pore-cut-faces'; g.add(caps);
  }
  took.push(performance.now() - T0); await pause();
  /* ---------- the complex: proteins in gold, the world's colour for a pore (deeper close up, so that each part keeps its
     shape in the light; the inner ring darker than the outer ones) ---------- */
  const goldMats = () => [
    magicStandard({ color: 0xd8993a, emissive: 0x8a5a10, emissiveIntensity: 1.3, roughness: 0.55, envMapIntensity: 0.35 }, { rim: 0xffe2a8, rimK: 0.35 }),
    magicStandard({ color: 0xa9622a, emissive: 0x5a3008, emissiveIntensity: 1.0, roughness: 0.6, envMapIntensity: 0.3 }, { rim: 0xffc890, rimK: 0.3 }),
    magicStandard({ color: 0xebbd62, emissive: 0x9a6a20, emissiveIntensity: 1.3, roughness: 0.5, envMapIntensity: 0.35 }, { rim: 0xfff0c8, rimK: 0.35 })];
  const [ringMat, innerMat, knobMat] = goldMats(), [ringLid, innerLid, knobLid] = goldMats().map(m => { m.transparent = true; return m; });
  [ringMat, innerMat, knobMat, ringLid, innerLid, knobLid].forEach(m => mats.push(m)); lidMats.push(ringLid, innerLid, knobLid);
  /* each part goes with the half its middle is in, by its angle round the axis: no protein is cut */
  const half = () => ({ far: [], near: [] }), cr = half(), nr = half(), ir = half(), kn = half(), dr = half();
  const put = (list, a, geo) => (isNear(a) ? list.near : list.far).push(geo);
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4, s = k * 3.1;
    /* the cytoplasmic and the nuclear rings: two rings of Y-shaped parts each, head to tail (16 a ring), the outer reaching
       60 nm from the axis */
    put(cr, a + 0.06, arcBlob(54.5, a + 0.06, 3, 44, 11, 14, s + 1)); put(cr, a - 0.13, arcBlob(45.5, a - 0.13, 0, 36, 9.5, 12, s + 2));
    put(nr, a - 0.06, arcBlob(54.5, a - 0.06, -57, 44, 11, 14, s + 3)); put(nr, a + 0.13, arcBlob(45.5, a + 0.13, -54, 36, 9.5, 12, s + 4));
    /* the inner ring: each of its eight spokes two parts above two, round the channel (56 nm across), with a gap between
       spokes; a smaller part joins each to the pore membrane */
    [-17, -37].forEach((y, i) => {
      put(ir, a, placed(blob(9, 9.5, 12.5, s + 5 + i), 37, a, y)); put(ir, a, placed(blob(5, 7, 9, s + 7 + i), 44.5, a, y + (i ? 3 : -3)));
    });
    /* where each cytoplasmic filament is held: a round part on the ring */
    put(kn, a + 0.26, placed(blob(5.5, 5, 5.5, s + 9), 51, a + 0.26, 11));
    /* the basket's distal ring (about 40 nm across, where the eight basket filaments meet), made of proteins like the other
       rings: eight curved parts head to tail, and a round part where each filament joins it (Daniel, 9 Nov 2026: the smooth
       ring that stood there "doesn't look like a protein"). Filament k ends at the angle a + 0.08 */
    const j = a + 0.08;
    put(dr, j + Math.PI / 8, arcBlob(NPC.distalR, j + Math.PI / 8, NPC.distal, 12.5, 5.5, 5, s + 11));
    put(kn, j, placed(blob(3.4, 3.2, 3.4, s + 12), NPC.distalR + 0.5, j, NPC.distal + 0.5));
  }
  [[cr, ringMat, ringLid, 'ring-cyto'], [nr, ringMat, ringLid, 'ring-nuclear'], [ir, innerMat, innerLid, 'ring-inner'], [kn, knobMat, knobLid, 'knobs'], [dr, ringMat, ringLid, 'ring-distal']].forEach(([list, m, ml, name]) => {
    const merge = l => mergeGeometries(l.map(x => { x.deleteAttribute('uv'); return x; }));
    const mesh = new THREE.Mesh(merge(list.far), m); mesh.name = name; npc.add(mesh);
    const lid = new THREE.Mesh(merge(list.near), ml); lid.name = name + '-lid'; lidP.add(lid);
  });
  took.push(performance.now() - T0); await pause();
  /* ---------- the threads: filaments into the cytoplasm, the basket into the nucleus, and the soft threads of the channel ---------- */
  const filLook = shared => swaying(magicStandard({ color: 0xe2ba6a, emissive: 0x8a5a14, emissiveIntensity: 1.3, roughness: 0.5, envMapIntensity: 0.35 }, { rim: 0xfff0c8, rimK: 0.4 }), false, shared);
  /* the soft threads: a pale light of their own (cyan beside the gold), the "doors" */
  const fgLook = shared => swaying(magicStandard({ color: 0x62d2e6, emissive: 0x137a90, emissiveIntensity: 0.4, roughness: 0.5, envMapIntensity: 0.25 }, { rim: 0xc8f6ff, rimK: 0.45 }), true, shared);
  const filMat = filLook(), fgMat = fgLook(), filLid = filLook(filMat.userData.sway), fgLid = fgLook(fgMat.userData.sway);
  filLid.transparent = true; fgLid.transparent = true;
  mats.push(filMat, fgMat, filLid, fgLid); lidMats.push(filLid, fgLid);
  const fil = half(), fg = half();
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4 + 0.26, lean = rr(-0.25, 0.25), at = (r, y, da = 0) => new THREE.Vector3(r * Math.cos(a + da), y, r * Math.sin(a + da));
    /* a cytoplasmic filament (Nup358: a chain of folded parts, so beaded), 45 nm into the cytoplasm */
    const c = new THREE.CatmullRomCurve3([at(51, 14), at(50, 27, lean * 0.3), at(47, 41, lean * 0.7), at(43 + rr(-4, 4), NPC.tips, lean)]);
    put(fil, a, thread(c, 30, 6, s => 1.7 + 1.3 * Math.pow(Math.sin(s * Math.PI * 7), 2) * (1 - 0.4 * s), 2.6));
    /* a basket filament (Tpr: a long coiled coil, so thin), 70 nm into the nucleus, to the distal ring */
    const b = new THREE.CatmullRomCurve3([at(52, -64, -0.26), at(50, -84, -0.24), at(39, -112, -0.2), at(NPC.distalR + 2, NPC.distal + 3, -0.18)]);
    put(fil, a - 0.22, thread(b, 28, 5, () => 1.35, 0.5));
  }
  /* (the basket's distal ring is made with the other rings, above, of proteins) */
  /* the channel's soft threads (FG repeats): from the inner ring's wall, and from the edges of the two outer rings, towards
     the middle, so that they fill the channel; each about 1 nm thick */
  took.push(performance.now() - T0); await pause();
  const fgFrom = (r, y, dy, n) => {
    for (let i = 0; i < n; i++) {
      const a = rr(0, Math.PI * 2), L = rr(18, r - 2), y0 = y + rr(-4, 4), root = new THREE.Vector3(r * Math.cos(a), y0, r * Math.sin(a));
      const inw = new THREE.Vector3(-Math.cos(a), 0, -Math.sin(a)), side = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
      const pts = [root];
      for (let j = 1; j <= 4; j++) {
        const t = j / 4;
        pts.push(root.clone().addScaledVector(inw, L * t).addScaledVector(side, rr(-3.5, 3.5) * t).add(new THREE.Vector3(0, dy * t + rr(-2.5, 2.5) * t, 0)));
      }
      put(fg, a, thread(new THREE.CatmullRomCurve3(pts), 16, 5, s => 0.4 - 0.1 * s, 1.6));
    }
  };
  /* so many that they fill the channel, crossing its middle (a net, the expert review: "a pore reads as an open door") */
  for (let k = 0; k < 4; k++) { fgFrom(NPC.chan, -12 - k * 9, rr(-3, 3), 30); if (k === 1) { took.push(performance.now() - T0); await pause(); } }
  fgFrom(41, -2, -6, 22);
  fgFrom(41, -52, 6, 22);
  took.push(performance.now() - T0); await pause();
  const filMesh = new THREE.Mesh(mergeGeometries(fil.far), filMat); filMesh.name = 'filaments';
  const fgMesh = new THREE.Mesh(mergeGeometries(fg.far), fgMat); fgMesh.name = 'fg-threads';
  [filMesh, fgMesh].forEach(m => { m.frustumCulled = false; npc.add(m); });
  const filL = new THREE.Mesh(mergeGeometries(fil.near), filLid); filL.name = 'filaments-lid';
  const fgL = new THREE.Mesh(mergeGeometries(fg.near), fgLid); fgL.name = 'fg-threads-lid';
  [filL, fgL].forEach(m => { m.frustumCulled = false; lidP.add(m); });
  /* where to name and to aim (nm) */
  const pts = {
    ring: k => new THREE.Vector3(NPC.ring * Math.cos(k), 9, NPC.ring * Math.sin(k)),
    thread: (k, r = 12) => new THREE.Vector3(r * Math.cos(k), -12, r * Math.sin(k)),
    membrane: (k, r = 118) => { const [x, y, z] = surf(r * Math.cos(k), r * Math.sin(k), 0); return new THREE.Vector3(x, y, z); },
    /* a point of the cut, r nm from the axis, h nm in from the outer face (side 1: the edge at CUT; -1: the other) */
    cut: (r, h, side = 1) => { const q = side > 0 ? CUT : CUT + Math.PI, [x, y, z] = surf(r * Math.cos(q), r * Math.sin(q), h); return new THREE.Vector3(x, y, z); }
  };
  /* how the proteins look: far away (1) as the world's pores (their colour, their glow), so that the real pore takes over
     from the world's ring unseen; close up (0) deeper and glowing much less, so that each part keeps its shape (a strong
     glow had made it one white blur) */
  const FAR = new THREE.Color(0xffd58a), FARE = new THREE.Color(0x9a6a18);
  const glowMats = [[ringMat, 0.06, 1.3], [innerMat, 0.05, 1.0], [knobMat, 0.08, 1.3], [filMat, 0.1, 1.3], [fgMat, 0.22, 0.3],
    [ringLid, 0.06, 1.3], [innerLid, 0.05, 1.0], [knobLid, 0.08, 1.3], [filLid, 0.1, 1.3], [fgLid, 0.22, 0.3]].map(([m, near, far]) => [m, near, far, m.color.clone(), m.emissive.clone()]);
  const glow = k => glowMats.forEach(([m, near, far, c0, e0]) => {
    m.emissiveIntensity = near + (far - near) * k;
    if (m !== fgMat && m !== fgLid) { m.color.copy(c0).lerp(FAR, k); m.emissive.copy(e0).lerp(FARE, k); }
  });
  took.push(performance.now() - T0);
  /* the lid (k 0: in place … 1: taken away): it fades, moving a little out towards the near side, and is then not drawn.
     nearDir: the direction from the axis to the middle of its half (where the camera stops to see the cut) */
  const nearDir = new THREE.Vector3(Math.cos(CUT - Math.PI / 2), 0, Math.sin(CUT - Math.PI / 2));
  /* the membranes of the lid fade a little ahead of its proteins (as k², the proteins as k): bright gold at half its
     strength reads more than lilac on the dark inside, so the proteins had seemed back about a second before their
     membranes, floating in front of the cut (the expert review) */
  const memLids = new Set([memLid, lumenLid]);
  const setLid = k => {
    lidMats.forEach(m => { m.opacity = 1 - (memLids.has(m) ? k * k : k); m.depthWrite = k < 0.02; });
    lidM.visible = lidP.visible = k < 0.999;
    lidM.position.copy(nearDir).multiplyScalar(30 * k); lidP.position.copy(nearDir).multiplyScalar(30 * k);
    lid.k = k;
  };
  const lid = { k: 0 };
  return { took, group: g, npc, pts, glow, setLid, lid, nearDir, cut: CUT, sway: [filMat.userData.sway, fgMat.userData.sway], fg: fgMat.userData.sway, mats, surf,
    dispose() { g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); mats.forEach(m => m.dispose()); } };
}
