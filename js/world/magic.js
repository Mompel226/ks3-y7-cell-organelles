/* ============================================================
   magic.js — the materials of the cell world (4 Nov 2026).
   Daniel: "Fantasyland inspired … make it magical … like you're diving into a new world". The magic is in the light,
   never in the shapes: every structure keeps its true shape (cellbuild.js); these materials give it a glowing rim, a soft
   inner light, a sleeping (misty, grey) look while its place is not yet open, and a brighter look when it is pointed at.
   - magicStandard(): a MeshStandardMaterial with a fresnel rim, uSleep (0 awake … 1 asleep) and uLit (0 … 1 pointed at).
   - membraneMat(): the cell membrane, a thin iridescent film (like a soap bubble), cut open at the front (uCutZ).
   - cutMat(): any material cut by the same front plane (thin sheets and tubes that cross it).
   - sparkles(), mist(), haloRing(), railMat(): the light in the cytosol, the mist over a sleeping place, the ring over an
     open place, and the flowing light along a microtubule.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';

export const PAL = {
  /* the hub's colours for the same parts (Foundations hub: nucleus violet 0x5b4bb5, ER teal, mitochondria orange, Golgi
     gold): the same colour means the same thing on every page */
  nucleus: 0x6b5be0, envelope: 0x8f7cff, chromatin: 0xb9a6ff, nucleolus: 0xd04fa8,
  rer: 0x2fb39a, ser: 0x7fe0c8, ribosome: 0xffd27a, golgi: 0xf0b43a, vesicle: 0xbfe9ff, granule: 0xffe7a8,
  mito: 0xf07a45, cristae: 0xffb070, mt: 0x9ff3ff, lyso: 0xe0558f, centriole: 0xc8d6ff,
  membrane: 0xa8ecff, cytosol: 0x2a8aa8, blood: 0xd8344a, nerve: 0xffe08a, lumen: 0x9ff7e0
};

/* a fresnel rim, sleep and lit, added to a standard material */
const RIM_COMMON = `
uniform vec3 uRim; uniform float uRimPow; uniform float uRimK; uniform float uSleep; uniform float uLit; uniform float uGlow;`;
function addRim(m, fx) {
  const u = m.userData.u = {
    uStripe: { value: new THREE.Color(fx.stripe != null ? fx.stripe : 0x000000) }, uStripeK: { value: fx.stripeK || 0 },
    uRim: { value: new THREE.Color(fx.rim != null ? fx.rim : m.color) },
    uRimPow: { value: fx.rimPow != null ? fx.rimPow : 2.4 },
    uRimK: { value: fx.rimK != null ? fx.rimK : 0.9 },
    uSleep: { value: 0 }, uLit: { value: 0 }, uGlow: { value: fx.glow != null ? fx.glow : 0 }
  };
  const before = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    if (before) before(sh, r);
    Object.assign(sh.uniforms, u);
    if (fx.stripeK) sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOPos;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvOPos = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>' + RIM_COMMON + (fx.stripeK ? '\nvarying vec3 vOPos; uniform vec3 uStripe; uniform float uStripeK;' : ''))
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        {
          float nv = clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0);
          float fr = pow(1.0 - nv, uRimPow);
          totalEmissiveRadiance += uRim * (fr * uRimK + uGlow) * (1.0 + 1.4 * uLit);
          totalEmissiveRadiance += diffuseColor.rgb * 0.35 * uLit;
          ` + (fx.stripeK ? `totalEmissiveRadiance += uStripe * uStripeK * pow(0.5 + 0.5 * sin(vOPos.y * 11.0), 10.0) * (0.25 + 0.75 * nv);` : '') + `
        }`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
        {
          float g = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
          vec3 asleep = vec3(0.30, 0.31, 0.52) * (0.25 + g * 0.9);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, asleep, uSleep * 0.6);
        }`);
  };
  m.customProgramCacheKey = () => 'rim' + (m.userData.cut ? 'cut' : '') + (fx.stripeK ? 'st' : '');
  return m;
}

/* the world position, for the front cut (instanced meshes too) */
function addWorldPos(sh) {
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
    .replace('#include <project_vertex>', `#include <project_vertex>
      {
        vec4 wp = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
        #endif
        vWPos = (modelMatrix * wp).xyz;
      }`);
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos;');
}

/* the front of the cell is cut away (like LadyofHats' drawing) so that the inside shows; uCutZ moves the cut */
export const CUT = { uCutZ: { value: 0.25 }, uCutY: { value: 0.45 }, uTime: { value: 0 } };

export function magicStandard(params, fx = {}) {
  const m = new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.42, metalness: 0.0, envMapIntensity: 0.9 }, params));
  return addRim(m, fx);
}

/* a material cut by the front plane: fragments in front of it are not drawn (thin sheets and tubes only: closed bodies
   are placed behind the plane, so that nothing hollow is ever seen) */
export function cutMat(m) {
  m.userData.cut = true;
  const before = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    if (before) before(sh, r);
    sh.uniforms.uCutZ = CUT.uCutZ; sh.uniforms.uCutY = CUT.uCutY;
    addWorldPos(sh);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uCutZ; uniform float uCutY;')
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        if (vWPos.z > uCutZ && vWPos.y > uCutY) discard;`);
  };
  return m;
}

/* the cell membrane: a thin film, iridescent like a soap bubble, double-sided, cut open at the front; along the cut it
   glows, so the edge of the opening reads as an edge */
export function membraneMat(opts = {}) {
  const m = new THREE.MeshPhysicalMaterial({
    color: opts.color || PAL.membrane, roughness: 0.18, metalness: 0.0, transparent: true, opacity: opts.opacity != null ? opts.opacity : 0.17,
    iridescence: 1.0, iridescenceIOR: 1.6, iridescenceThicknessRange: [260, 820], side: THREE.DoubleSide, depthWrite: false,
    envMapIntensity: 1.1, emissive: new THREE.Color(0x10304a), emissiveIntensity: 0.3
  });
  const u = m.userData.u = { uEdge: { value: new THREE.Color(opts.edge || 0xbff6ff) }, uSleep: { value: 0 }, uLit: { value: 0 }, uCutOn: { value: opts.cut === false ? 0 : 1 } };
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.uniforms.uCutZ = CUT.uCutZ; sh.uniforms.uCutY = CUT.uCutY; sh.uniforms.uTime = CUT.uTime;
    addWorldPos(sh);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uCutZ; uniform float uCutY; uniform float uTime; uniform vec3 uEdge; uniform float uSleep; uniform float uLit; uniform float uCutOn;')
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        if (uCutOn > 0.5 && vWPos.z > uCutZ && vWPos.y > uCutY) discard;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        {
          float nv = clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0);
          float fr = pow(1.0 - nv, 2.2);
          totalEmissiveRadiance += uEdge * fr * 0.5;
          float edge = uCutOn * (1.0 - smoothstep(0.0, 0.22, abs(vWPos.z - uCutZ))) * step(uCutY, vWPos.y);
          totalEmissiveRadiance += uEdge * edge * 1.5;
          diffuseColor.a = max(diffuseColor.a, edge * 0.9);
          float shimmer = 0.5 + 0.5 * sin(vWPos.y * 1.3 + vWPos.x * 0.7 + uTime * 0.6);
          totalEmissiveRadiance += uEdge * 0.06 * shimmer;
          totalEmissiveRadiance *= (1.0 + uLit);
        }`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.32, 0.34, 0.56) * dot(gl_FragColor.rgb, vec3(0.3, 0.59, 0.11)), uSleep * 0.8);`);
  };
  m.customProgramCacheKey = () => 'membrane';
  return m;
}

/* a round soft sprite (one texture for every sparkle) */
function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
let DOT = null;

/* sparkles: points that twinkle and drift (Brownian-like, small) — the crowded molecules of the cytosol, light motes */
export function sparkles({ count, sample, size = 0.09, color = 0xffffff, colors = null, drift = 0.06, twinkle = 1, opacity = 0.9, additive = true }) {
  DOT = DOT || dotTexture();
  const pos = new Float32Array(count * 3), ph = new Float32Array(count), sz = new Float32Array(count), col = new Float32Array(count * 3);
  const c0 = new THREE.Color(color), v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    sample(v, i); pos.set([v.x, v.y, v.z], i * 3);
    ph[i] = Math.random() * 6.283; sz[i] = size * (0.55 + Math.random() * 0.9);
    const c = colors ? new THREE.Color(colors[i % colors.length]) : c0;
    col.set([c.r, c.g, c.b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
  g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: CUT.uTime, uMap: { value: DOT }, uScale: { value: 600 }, uDrift: { value: drift }, uTw: { value: twinkle }, uOpacity: { value: opacity }, uSleep: { value: 0 } },
    vertexShader: `
      attribute float aPhase; attribute float aSize; attribute vec3 aColor;
      uniform float uTime; uniform float uScale; uniform float uDrift; uniform float uTw;
      varying vec3 vC; varying float vA;
      void main() {
        vec3 p = position + uDrift * vec3(sin(uTime * 0.7 + aPhase * 3.1), sin(uTime * 0.53 + aPhase * 2.3), sin(uTime * 0.61 + aPhase * 1.7));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uScale / max(0.5, -mv.z);
        vA = mix(1.0, 0.45 + 0.55 * sin(uTime * 2.2 + aPhase * 5.0), uTw);
        vC = aColor;
      }`,
    fragmentShader: `
      uniform sampler2D uMap; uniform float uOpacity; uniform float uSleep;
      varying vec3 vC; varying float vA;
      void main() {
        vec4 t = texture2D(uMap, gl_PointCoord);
        float a = t.a * vA * uOpacity * (1.0 - 0.7 * uSleep);
        if (a < 0.01) discard;
        gl_FragColor = vec4(vC * (1.0 - 0.5 * uSleep), a);
      }`,
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
  });
  const p = new THREE.Points(g, mat); p.frustumCulled = false;
  return p;
}

/* mist: big soft clouds that hide a sleeping place, turning slowly; mist.userData.fade(0…1) */
export function mist({ center, radius, count = 34, color = 0x9a8ff0 }) {
  DOT = DOT || dotTexture();
  const pos = new Float32Array(count * 3), ph = new Float32Array(count), sz = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1, a = Math.random() * 6.283, r = radius * Math.cbrt(Math.random()) * 0.9;
    const s = Math.sqrt(1 - u * u);
    pos.set([r * s * Math.cos(a), r * u * 0.8, r * s * Math.sin(a)], i * 3);
    ph[i] = Math.random() * 6.283; sz[i] = radius * (0.9 + Math.random() * 0.9);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
  g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: CUT.uTime, uMap: { value: DOT }, uScale: { value: 520 }, uColor: { value: new THREE.Color(color) }, uFade: { value: 1 } },
    vertexShader: `
      attribute float aPhase; attribute float aSize; uniform float uTime; uniform float uScale; uniform float uFade;
      varying float vA;
      void main() {
        float a = uTime * 0.12 + aPhase;
        vec3 p = position;
        p.xz = mat2(cos(a * 0.3), -sin(a * 0.3), sin(a * 0.3), cos(a * 0.3)) * p.xz * (1.0 + (1.0 - uFade) * 1.6);
        p.y += 0.12 * sin(uTime * 0.4 + aPhase);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uScale / max(0.5, -mv.z);
        vA = 0.5 + 0.5 * sin(uTime * 0.5 + aPhase * 2.0);
      }`,
    fragmentShader: `
      uniform sampler2D uMap; uniform vec3 uColor; uniform float uFade; varying float vA;
      void main() {
        float a = texture2D(uMap, gl_PointCoord).a * (0.10 + 0.06 * vA) * uFade;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor, a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const p = new THREE.Points(g, mat); p.position.copy(center); p.frustumCulled = false; p.renderOrder = 5;
  p.userData.fade = f => { mat.uniforms.uFade.value = f; p.visible = f > 0.01; };
  return p;
}

/* a ring of light that turns slowly round an open place */
export function haloRing(radius, color = 0xffe39a) {
  const g = new THREE.TorusGeometry(radius, radius * 0.018, 8, 160);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: CUT.uTime, uColor: { value: new THREE.Color(color) }, uOn: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uColor; uniform float uOn; varying vec2 vUv;
      void main() {
        float b = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(vUv.x * 6.2832 * 3.0 - uTime * 1.6), 3.0);
        gl_FragColor = vec4(uColor * (1.6 * b), b * uOn);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const m = new THREE.Mesh(g, mat); m.renderOrder = 6;
  return m;
}

/* light flowing along a microtubule: bands that move from the minus end (the top of this cell) … the flow shows the
   tracks, it is not the motor (the motor is drawn walking, places/tracks.js) */
export function railMat(color = PAL.mt) {
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: CUT.uTime, uColor: { value: new THREE.Color(color) }, uSleep: { value: 0 }, uLit: { value: 0 }, uCutZ: CUT.uCutZ, uCutY: CUT.uCutY },
    vertexShader: `varying vec2 vUv; varying vec3 vWPos; void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vWPos = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uColor; uniform float uSleep; uniform float uLit; uniform float uCutZ; uniform float uCutY;
      varying vec2 vUv; varying vec3 vWPos;
      void main() {
        if (vWPos.z > uCutZ && vWPos.y > uCutY) discard;
        float band = pow(0.5 + 0.5 * sin(vUv.x * 60.0 + uTime * 2.0), 6.0);
        float base = 0.20 + 0.65 * band;
        vec3 c = uColor * base * (1.0 + 1.2 * uLit);
        c = mix(c, vec3(0.3, 0.32, 0.55) * 0.4, uSleep * 0.8);
        gl_FragColor = vec4(c, 0.30 + 0.40 * band);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  m.userData.u = m.uniforms;
  return m;
}

/* set sleep / lit on every material of a group (each material keeps its uniforms in userData.u or uniforms) */
export function setLook(obj, { sleep, lit }) {
  obj.traverse(o => {
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    ms.forEach(m => {
      const u = (m.userData && m.userData.u) || m.uniforms;
      if (!u) return;
      if (sleep != null && u.uSleep) u.uSleep.value = sleep;
      if (lit != null && u.uLit) u.uLit.value = lit;
    });
  });
}
