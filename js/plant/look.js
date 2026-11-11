/* ============================================================
   look.js — the plant-cell branch drawn in the game's own light (11 Nov 2026).
   The branch's picture stands on the shared 3D stage (js/ib/stage.js: the camera that zooms, names on level lines, the
   scale bar); this file gives that stage the look of the game's world (js/world/world.js): the same twilight sky, a
   warm light from above (the Sun on the leaf: it can be switched off), the same glow, and the same last pass (tone
   mapping, the screen's colours, cool shadows, warm light, a soft vignette). The glow is worked out from a quarter of the
   screen's pixels, as in the game.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { EffectComposer } from '../vendor/three/examples/jsm/postprocessing/EffectComposer.js?v=0.185.1';
import { RenderPass } from '../vendor/three/examples/jsm/postprocessing/RenderPass.js?v=0.185.1';
import { UnrealBloomPass } from '../vendor/three/examples/jsm/postprocessing/UnrealBloomPass.js?v=0.185.1';
import { ShaderPass } from '../vendor/three/examples/jsm/postprocessing/ShaderPass.js?v=0.185.1';
import { CUT } from '../world/magic.js?v=202611120025';

export function gameLook(stage) {
  const R = stage.renderer, scene = stage.scene, cam = stage.cam;
  R.toneMappingExposure = 0.98; R.setClearColor(0x0b0f2a, 1); R.localClippingEnabled = true;
  scene.fog.color.set(0x141845);
  /* the sky: the game's twilight, violet above and sea-blue below; it stays round the camera at any zoom */
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false, uniforms: { uDay: { value: 1 } },
    vertexShader: `varying vec3 vP; void main() { vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec3 vP; uniform float uDay;
      void main() {
        float h = vP.y * 0.5 + 0.5;
        vec3 low = vec3(0.020, 0.095, 0.150), mid = vec3(0.075, 0.070, 0.230), high = vec3(0.150, 0.075, 0.270);
        vec3 c = mix(low, mid, smoothstep(0.15, 0.55, h));
        c = mix(c, high, smoothstep(0.55, 0.95, h));
        /* in the light, a warm glow high in the sky (the light falls from above) */
        c += vec3(0.30, 0.22, 0.08) * uDay * smoothstep(0.62, 1.0, h);
        gl_FragColor = vec4(c, 1.0);
      }`
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
  /* the Sun on the leaf: a warm light from above, and a little of it from below (light that passed through the leaf) */
  const sun = new THREE.DirectionalLight(0xfff0c2, 1.5); sun.position.set(1.5, 10, 3); scene.add(sun);
  const low = new THREE.DirectionalLight(0xff9ad0, 0.4); low.position.set(4, -12, 10); scene.add(low);

  const composer = new EffectComposer(R);
  composer.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.42, 0.55, 0.82);
  composer.addPass(bloom);
  composer.addPass(new ShaderPass({
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
        c.rgb = mix(c.rgb, c.rgb * vec3(0.92, 0.98, 1.10), 1.0 - smoothstep(0.0, 0.45, l));
        c.rgb = mix(c.rgb, c.rgb * vec3(1.06, 1.0, 0.92), smoothstep(0.55, 1.0, l));
        vec2 d = vUv - 0.5; float v = smoothstep(0.85, 0.25, length(d * vec2(1.0, 0.8)));
        c.rgb *= mix(0.66, 1.0, v);
        gl_FragColor = c;
      }`
  }));
  let w0 = 0, h0 = 0, p0 = 0, t0 = performance.now(), day = 1;
  const size = new THREE.Vector2();
  return {
    sun,
    /* the light on the leaf: 1 on, 0 off (a dim blue night light stays, so that the picture can still be read) */
    setDay(k) { day = k; sun.intensity = 1.5 * k; sky.material.uniforms.uDay.value = k; R.toneMappingExposure = 0.78 + 0.2 * k; },
    get day() { return day; },
    render(renderer, sc, camera, dt) {
      renderer.getSize(size); const pr = renderer.getPixelRatio();
      if (size.x !== w0 || size.y !== h0 || pr !== p0) {
        w0 = size.x; h0 = size.y; p0 = pr; composer.setPixelRatio(pr); composer.setSize(w0, h0);
        bloom.setSize(Math.round(w0 * pr / 2), Math.round(h0 * pr / 2));
      }
      /* the game's materials (js/world/magic.js) read their time from here: sparkles drift, a membrane shimmers */
      CUT.uTime.value = (performance.now() - t0) / 1000;
      sky.position.copy(camera.position); sky.scale.setScalar(camera.far * 0.9);
      composer.render(dt);
    },
    dispose() { composer.dispose(); sky.geometry.dispose(); sky.material.dispose(); }
  };
}
