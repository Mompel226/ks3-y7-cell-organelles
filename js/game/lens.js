/* ============================================================
   lens.js — "See the real thing" (4 Nov 2026). Daniel: "You can see normal diagrams, but also electron microscope images
   or 3D representations of those organelles." The world is a picture made for the game; the lens shows the structure as
   it really is, and says plainly that both are right (memory book-vs-real-one-example):
   - Diagram: the Year 7 diagram (domdomegg, CC BY 4.0) for the five Year 7 parts; LadyofHats' detailed animal cell
     (public domain) for the others; the part ringed and named.
   - Electron microscope: real micrographs (js/game/real.js: OpenOrganelle jrc_hela-2, CC BY 4.0; Louisa Howard,
     public domain), the part outlined from the same data.
   - Real 3D: one real human cell (a HeLa cell), reconstructed from its electron micrographs (OpenOrganelle jrc_hela-2,
     CC BY 4.0; the model the Foundations hub made, assets/real/hela-cell.glb), the structure in its colour, the rest pale;
     drag to turn it. Loaded only when the tab is opened.
     The nucleus and the nucleolus (Daniel, 4 Nov 2026: "very hard … to see the nucleolus while also trying to understand
     what the nucleus is … show the membrane of the nucleus, and then the nucleolus"; and the nucleolus "all spread out …
     billions of different parts"): the nucleus is drawn as its envelope, see-through with a bright edge, the nucleoli solid
     inside it, and nothing else of the cell. The data's nucleolus has 120 pieces: its three large nucleoli (94% of its
     volume, each 4 to 6 µm long) and 117 specks, none over 2 µm, that the computer program also marked; only the large
     pieces are drawn (bigPieces), and the caption says so.
   - How big: its real size, and what in the game is drawn larger than life.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { GLTFLoader } from '../vendor/three/examples/jsm/loaders/GLTFLoader.js?v=0.185.1';
import { OrbitControls } from '../vendor/three/examples/jsm/controls/OrbitControls.js?v=0.185.1';
import { MeshoptDecoder } from '../vendor/three/examples/jsm/libs/meshopt_decoder.module.js?v=0.185.1';
import { mergeVertices } from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js?v=0.185.1';
import { REAL } from './real.js?v=202611050034';
const R = window.REV, { $, $$, h, esc } = R;

const SIMPLE = { src: 'img/diagram/simple-animal-cell.svg', vb: [730.39, 560.42], credit: 'Diagram: domdomegg, Wikimedia Commons, CC BY 4.0 (ribosomes added by the Cells Lab)' };
const DETAIL = { src: 'img/diagram/animal-cell-ladyofhats.svg', vb: [10, 22, 520, 320], credit: 'Diagram: LadyofHats (Mariana Ruiz), Wikimedia Commons, public domain (names and the flagellum taken off for this page)' };
/* where each part is on each diagram (in the drawing's own units), and its real size */
const PART = {
  wayin:    { d: 'simple', at: [466, 40], r: 30, name: 'cell membrane', size: 'The cell membrane is about 8 nanometres thick (8 millionths of a millimetre). A sheet of paper is about 10 000 times thicker.' },
  exit:     { d: 'simple', at: [700, 330], r: 30, name: 'cell membrane', size: 'A vesicle that holds amylase in a salivary gland cell is about 1 µm across. The membrane it joins is about 8 nanometres thick.' },
  nucleus:  { d: 'simple', at: [418, 216], r: 52, name: 'nucleus', size: 'The nucleus of this cell is about 6 µm across. A nuclear pore is about 0.12 µm across; a nucleus has thousands of them (the game shows fewer, and larger).' },
  nucleolus:{ d: 'detail', at: [231, 145], r: 12, name: 'nucleolus', size: 'A nucleolus is about 1 to 2 µm across. A cell that makes a lot of protein has a large nucleolus, or more than one.' },
  mito:     { d: 'simple', at: [502.75, 464.4], r: 26, name: 'mitochondrion', size: 'A mitochondrion is about 0.5 to 1 µm wide and 1 to 2 µm long; some are long tubes, up to 10 µm or more.' },
  ribosome: { d: 'simple', at: [356, 151], r: 18, name: 'ribosome', size: 'A ribosome is about 25 nanometres across: 40 000 of them in a row would cover 1 millimetre. The game draws them about four times larger.' },
  rer:      { d: 'detail', at: [172, 171], r: 26, name: 'rough ER', size: 'Each flattened sac of rough ER is about 0.05 to 0.1 µm thick. The game draws the gaps between the sacs two or three times wider, so you can see them.' },
  ser:      { d: 'detail', at: [229, 210], r: 22, name: 'smooth ER', size: 'The tubes of smooth ER are about 0.03 to 0.06 µm wide.' },
  golgi:    { d: 'detail', at: [146, 140], r: 26, name: 'Golgi apparatus', size: 'A stack of Golgi sacs is about 1 to 3 µm across, with about 4 to 8 sacs.' },
  tracks:   { d: 'detail', at: [345, 111], r: 18, name: 'microtubule', size: 'A microtubule is 25 nanometres wide, but it can be many micrometres long. Kinesin, one kind of motor protein, walks along it in steps of 8 nanometres. The game draws microtubules about three times thicker.' }
};

/* the parts of the real cell model each place lights (the ER: rough and smooth together, as the data has them) */
const REAL3D = {
  nucleus: { parts: ['w_nucleus', 'w_nucleolus'], name: 'nucleus', nuc: 1 }, nucleolus: { parts: ['w_nucleolus'], name: 'nucleolus', nuc: 0.6 },
  mito: { parts: ['w_mito'], name: 'mitochondria' }, rer: { parts: ['w_er'], name: 'endoplasmic reticulum (rough and smooth together)' },
  ser: { parts: ['w_er'], name: 'endoplasmic reticulum (rough and smooth together)' }, golgi: { parts: ['w_golgi'], name: 'Golgi apparatus' },
  wayin: { parts: ['w_cell'], name: 'cell membrane' }, exit: { parts: ['w_cell'], name: 'cell membrane' }
};
const COL = { w_nucleus: 0x6b5be0, w_nucleolus: 0xd04fa8, w_mito: 0xf07a45, w_er: 0x2fb39a, w_golgi: 0xf0b43a, w_cell: 0x7fd8ff, w_sacs: 0xe0558f, w_cut: 0x8a8fa8 };
let model = null;
/* the nucleus as a membrane: see-through where you look straight at it, bright at its edge, both walls drawn (k: how
   strongly; the nucleus's own view more than the nucleolus's) */
const envelopeMat = k => new THREE.ShaderMaterial({
  uniforms: { uC: { value: new THREE.Color(COL.w_nucleus) }, uK: { value: k } }, transparent: true, depthWrite: false, side: THREE.DoubleSide,
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform vec3 uC; uniform float uK; varying vec3 vN; varying vec3 vV; void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(uC * (0.75 + 0.9 * rim), (0.06 + 0.62 * rim) * uK);\n#include <colorspace_fragment>\n}'
});
/* the model's meshes carry no normals (the way each bit of surface faces): their corners joined and normals worked out,
   so the nucleus's edge can glow and the nucleoli are smooth, not faceted. Once per mesh */
const smoothCache = new WeakMap();
function smoothed(geo) {
  if (!smoothCache.has(geo)) {
    /* the positions as plain numbers first (the file stores them packed, which mergeVertices cannot write) */
    const pos = geo.attributes.position, f = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) { f[i * 3] = pos.getX(i); f[i * 3 + 1] = pos.getY(i); f[i * 3 + 2] = pos.getZ(i); }
    const plain = new THREE.BufferGeometry(); plain.setAttribute('position', new THREE.BufferAttribute(f, 3)); if (geo.index) plain.setIndex(geo.index.clone());
    const g = mergeVertices(plain, 1e-4); g.computeVertexNormals(); smoothCache.set(geo, g);
  }
  return smoothCache.get(geo);
}
/* only the large pieces of a mesh: its triangles joined into pieces (by corners at the same place), each piece's volume,
   and the pieces of at least a tenth of the largest one kept. Worked out once per mesh */
const bigCache = new WeakMap();
function bigPieces(geo) {
  if (bigCache.has(geo)) return bigCache.get(geo);
  const pos = geo.attributes.position, idx = geo.index ? geo.index.array : null, nT = idx ? idx.length / 3 : pos.count / 3;
  const corner = (t, c) => idx ? idx[t * 3 + c] : t * 3 + c;
  const key = new Map(), weld = new Int32Array(pos.count);
  for (let i = 0; i < pos.count; i++) { const k = Math.round(pos.getX(i) * 1e4) + ',' + Math.round(pos.getY(i) * 1e4) + ',' + Math.round(pos.getZ(i) * 1e4); if (!key.has(k)) key.set(k, key.size); weld[i] = key.get(k); }
  const up = Int32Array.from({ length: key.size }, (_, i) => i), top = a => { while (up[a] !== a) a = up[a] = up[up[a]]; return a; };
  for (let t = 0; t < nT; t++) { const a = top(weld[corner(t, 0)]); up[top(weld[corner(t, 1)])] = a; up[top(weld[corner(t, 2)])] = a; }
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), vol = new Map(), of = new Int32Array(nT);
  for (let t = 0; t < nT; t++) {
    const r = of[t] = top(weld[corner(t, 0)]);
    A.fromBufferAttribute(pos, corner(t, 0)); B.fromBufferAttribute(pos, corner(t, 1)); C.fromBufferAttribute(pos, corner(t, 2));
    vol.set(r, (vol.get(r) || 0) + A.dot(B.cross(C)) / 6);
  }
  const most = Math.max(...[...vol.values()].map(Math.abs)), keep = new Set([...vol].filter(([, v]) => Math.abs(v) >= most / 10).map(([r]) => r));
  const out = []; for (let t = 0; t < nT; t++) if (keep.has(of[t])) out.push(corner(t, 0), corner(t, 1), corner(t, 2));
  const g = geo.clone(); g.setIndex(out);
  const res = { geo: g, kept: keep.size, left: vol.size - keep.size };
  bigCache.set(geo, res);
  return res;
}
function loadModel() {
  if (model) return model;
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  return (model = loader.loadAsync('assets/real/hela-cell.glb?v=202611050034'));
}
function viewer(pane, id) {
  const R3 = REAL3D[id], wrap = pane.querySelector('.lens__3d');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  wrap.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, 0.1, 2000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.6)); const d = new THREE.DirectionalLight(0xffffff, 1.6); d.position.set(1, 2, 3); scene.add(d);
  const controls = new OrbitControls(cam, renderer.domElement); controls.enableDamping = true; controls.autoRotate = !R.FAST; controls.autoRotateSpeed = 0.8; controls.enablePan = false;
  let alive = true;
  const size = () => { const w = wrap.clientWidth, h = Math.max(260, Math.min(420, w * 0.62)); renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); addEventListener('resize', size);
  loadModel().then(g => {
    if (!alive) return;
    const root = g.scene.clone(true);
    root.traverse(o => {
      if (!o.isMesh) return;
      const name = o.name || (o.parent && o.parent.name), lit = R3.parts.includes(name);
      /* the nucleus's views: its envelope, see-through, and the large nucleoli inside it; nothing else */
      if (R3.nuc) {
        if (name === 'w_nucleus') { o.geometry = smoothed(o.geometry); o.material = envelopeMat(R3.nuc); o.renderOrder = 2; }
        else if (name === 'w_nucleolus') { o.geometry = bigPieces(smoothed(o.geometry)).geo; o.material = new THREE.MeshStandardMaterial({ color: COL.w_nucleolus, emissive: COL.w_nucleolus, emissiveIntensity: 0.22, roughness: 0.45 }); }
        else o.visible = false;
        return;
      }
      o.material = new THREE.MeshStandardMaterial({ color: COL[name] || 0x999999, roughness: 0.5, transparent: !lit, opacity: lit ? 1 : (name === 'w_cell' ? 0.12 : 0.07), depthWrite: lit, side: THREE.DoubleSide });
    });
    scene.add(root);
    /* look at the lit part, close enough to see it, far enough to see where it is in the cell */
    const lit = new THREE.Box3(); root.traverse(o => { if (o.isMesh && (R3.nuc ? (o.name || (o.parent && o.parent.name)) === 'w_nucleus' : R3.parts.includes(o.name || (o.parent && o.parent.name)))) lit.expandByObject(o); });
    const all = new THREE.Box3().setFromObject(root), box = lit.isEmpty() ? all : lit;
    const c = box.getCenter(new THREE.Vector3()), r = Math.max(box.getSize(new THREE.Vector3()).length() / 2, all.getSize(new THREE.Vector3()).length() / 7);
    /* the nucleus fills the view, also in a narrow one (a phone): far enough for its width to fit */
    const fit = R3.nuc ? Math.max(r * 2.1, r * 0.95 / (Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect)) : r * 2.6;
    /* (the nucleus seen from the side where its three nucleoli stand apart) */
    controls.target.copy(c); cam.position.copy(c).add(new THREE.Vector3(R3.nuc ? -0.3 : 0.3, 0.85, R3.nuc ? -1.0 : 1.0).normalize().multiplyScalar(fit)); controls.update();
    pane.querySelector('.lens__wait').hidden = true;
  }).catch(e => { console.error('Real 3D:', e); pane.querySelector('.lens__wait').textContent = 'The 3D cell could not be loaded on this computer.'; });
  const loop = () => { if (!alive) return; controls.update(); renderer.render(scene, cam); requestAnimationFrame(loop); };
  loop();
  return () => { alive = false; removeEventListener('resize', size); controls.dispose(); renderer.dispose(); renderer.domElement.remove(); };
}

export function openLens(id) {
  const P = PART[id]; if (!P) return;
  const real = REAL[id] || {};
  const box = $('#lens'), D = P.d === 'simple' ? SIMPLE : DETAIL;
  const tabs = [['dia', 'Diagram'], real.em ? ['em', 'Electron microscope'] : null, REAL3D[id] ? ['r3d', 'Real 3D'] : null, ['size', 'How big?']].filter(Boolean);
  const vb = D.vb.length === 4 ? D.vb : [0, 0, D.vb[0], D.vb[1]];
  box.innerHTML = `<div class="lens__card" role="dialog" aria-modal="true" aria-labelledby="lens-h">
    <div class="lens__top"><h2 id="lens-h">🔍 The real thing: ${esc(P.name)}</h2><button type="button" class="close-x" aria-label="Close">×</button></div>
    <p class="lens__both">The cell world is a picture made for this game. Below is the ${esc(P.name)} as scientists draw it${real.em ? ', and as it looks in an electron micrograph' : ''}. <b>Both are right</b>: the game makes things brighter and some of them larger, so that you can find them.</p>
    <div class="lens__tabs" role="tablist">${tabs.map(([k, t], i) => `<button role="tab" type="button" data-t="${k}" aria-selected="${i === 0}">${t}</button>`).join('')}</div>
    <div class="lens__pane" data-p="dia"><figure class="lens__fig"><svg viewBox="${vb.join(' ')}" role="img" aria-label="A diagram of an animal cell with the ${esc(P.name)} ringed"><image href="${D.src}" x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}"/><circle cx="${P.at[0]}" cy="${P.at[1]}" r="${P.r}" fill="none" stroke="#FFD84A" stroke-width="${vb[2] / 160}"/></svg>
      <figcaption><b>${esc(P.name)}</b>, ringed in yellow. ${esc(D.credit)}.</figcaption></figure></div>
    ${real.em ? `<div class="lens__pane" data-p="em" hidden>${real.em.map(e => `<figure class="lens__fig"><img src="${e.src}" alt="${esc(e.alt)}" loading="lazy"><figcaption>${e.cap} <span class="lens__cr">${esc(e.credit)}</span></figcaption></figure>`).join('')}</div>` : ''}
    ${REAL3D[id] ? `<div class="lens__pane" data-p="r3d" hidden>${REAL3D[id].nuc ? `<p class="lens__key"><span style="--c:#8f80ff">nuclear envelope (see-through)</span><span style="--c:#e05cb4">nucleolus</span></p>` : ''}<div class="lens__3d"><p class="lens__wait">Loading the real cell…</p></div><p class="lens__cap">${REAL3D[id].nuc
      ? 'The nucleus of one real human cell (a HeLa cell, a kind of cell grown in laboratories), rebuilt in 3D from thousands of electron micrographs, each about 5 nanometres from the next. Only the nucleus is shown: its envelope, the two membranes round it (violet, drawn see-through), and inside it the nucleoli (pink). This cell has three large nucleoli, each about 4 to 6 µm long: larger than in most cells, because it grows fast and makes many ribosomes. The computer program that found them in the micrographs also marked many small specks; they are not shown here.'
      : `One real human cell (a HeLa cell, a kind of cell grown in laboratories), rebuilt in 3D from thousands of electron micrographs, each about 5 nanometres from the next. The ${esc(REAL3D[id].name)} is in colour; the rest is pale. The flat faces are the edges of the part that was imaged. A HeLa cell is not a gland cell: it has far less rough ER than the cell in this game.`} <b>Drag to turn it.</b></p><p class="lens__cr">Janelia Research Campus, OpenOrganelle dataset jrc_hela-2 (Xu et al. 2021, Nature 599:147; Heinrich et al. 2021, Nature 599:141), CC BY 4.0. 3D model made for the Foundations hub.</p></div>` : ''}
    <div class="lens__pane" data-p="size" hidden><p class="lens__size">${esc(P.size)}</p><p class="lens__size">1 millimetre (mm) = 1000 micrometres (µm). 1 µm = 1000 nanometres (nm).</p></div>
  </div>`;
  box.hidden = false;
  let stop3d = null;
  const close = () => { if (stop3d) stop3d(); box.hidden = true; box.innerHTML = ''; document.removeEventListener('keydown', esc1); };
  const esc1 = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc1);
  $('.close-x', box).addEventListener('click', close);
  box.addEventListener('click', e => { if (e.target === box) close(); });
  $$('.lens__tabs button', box).forEach(b => b.addEventListener('click', () => {
    $$('.lens__tabs button', box).forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $$('.lens__pane', box).forEach(p => { p.hidden = p.dataset.p !== b.dataset.t; });
    if (b.dataset.t === 'r3d' && !stop3d) stop3d = viewer($('[data-p="r3d"]', box), id);
  }));
  $('.close-x', box).focus();
}
export const HAS_LENS = id => !!PART[id];
