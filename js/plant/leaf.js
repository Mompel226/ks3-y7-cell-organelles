/* ============================================================
   leaf.js — the plant-cell branch's first picture (11 Nov 2026): a piece of a potato leaf, one palisade cell of it cut
   open, one chloroplast of that cell cut open, and the molecules, all in ONE picture at true relative sizes: the camera
   zooms (js/ib/stage.js), nothing is ever drawn bigger (memory true-relative-sizes). Units: nanometres.

   The sizes, and where each comes from (memory biology-before-pedagogy: cite, never guess):
   - the leaf: potato, Solanum tuberosum 'Agria', mature leaves grown outdoors: palisade layer 72 ± 10 µm thick (one layer
     of cells, so a palisade cell is about 72 µm long), spongy layer 116 ± 16 µm; a palisade cell's cut area in a section
     across the leaf 1170 ± 353 µm², so it is about 1170 / 72 = 16 µm wide; a spongy cell 533 ± 252 µm² (about 26 µm
     across); more stomata on the lower side (231 per mm²) than on the upper (100 per mm²). Stegner, Buchner, Schäfernolte,
     Holzinger & Neuner 2022, Crops 2(4):378–389, doi 10.3390/crops2040026 (open access, CC BY 4.0), section 2.2 and
     figure 1. The two epidermis layers are drawn 22 and 15 µm thick: no measured potato value was found (drawn, not
     stated to pupils).
   - a chloroplast: a lens about 5 µm across and 2.5 µm thick (here 5 × 2.3 µm), with 40–60 stacks of membranes (grana),
     each 0.3–0.6 µm across (Staehelin 2003, Photosynthesis Research 76:185; BioNumbers 107012–107014); the membranes of
     a stack repeat about every 20 nm (Kirchhoff et al. 2011, PNAS 108:20248: 16.3 nm in the dark, each membrane 4 nm and
     the space inside a sac 4.7 nm; in the light that space widens to about 9 nm, so about 21 nm). Starch made by day lies in the
     chloroplast as a few flat grains (Zeeman, Kossmann & Smith 2010, Annual Review of Plant Biology 61:209).
   - how many chloroplasts in ONE potato palisade cell: no count was found. The number follows the cell's size (Pyke &
     Leech 1987, Planta 170:416), so they are placed as closely as real ones lie, about half of the side wall covered:
     the drawing has about 55. No number is given to pupils.
   - the permanent vacuole: about 80 % of a mesophyll cell's volume (spinach 79 %: Winter, Robinson & Heldt 1994, Planta
     193:530; BioNumbers 104368). Here its membrane lies over the chloroplasts and the nucleus, which it presses against
     the wall, as in a real cell.
   - the cell wall: a leaf cell's first wall is about 0.1–0.3 µm thick (here 200 nm); its cellulose fibres (microfibrils)
     are about 3 nm wide (Cosgrove 2018, Plant Physiology 176:16; Cosgrove 2005, Nature Reviews Molecular Cell Biology
     6:850). When the cell loses water it is drawn about 12 % smaller by volume and no longer pushes on its wall: leaves
     stop being firm when they have lost roughly a tenth of their water (the turgor loss point: Bartlett, Scoffoni &
     Sack 2012, Ecology Letters 15:393). The cell membrane stays against the wall (it leaves it only in a strong solution). The cell membrane: 7 nm with its proteins (the game's own figure); its two layers of lipids about 5 nm.
   - the nucleus is drawn 6 µm across and the mitochondria 0.6 µm wide, as in the game's animal cell; the salivary gland
     cell beside the palisade cell is the game's own, 16 µm (js/world/cellbuild.js).
   - molecules: glucose 0.9 nm, carbon dioxide 0.55, oxygen 0.45, water 0.3 (the game's numbers, js/game/play.js).
   The colours are the game's (js/world/magic.js PAL): nucleus violet, mitochondria orange, membrane pale blue; green is
   new, for chlorophyll.
   A scene module, as the IB view's chapters are: build(stage, kit) → { group, knobs, views, steps, labels, hots, draw,
   dispose }. Every step can be shown from its start: the picture depends only on the knobs.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { magicStandard, sparkles, setLook, PAL } from '../world/magic.js?v=202611142141';
import { token, riboPart } from '../game/actors.js?v=202611142141';
import { bilayer } from '../ib/membrane.js?v=202611142141';
import { glow, smooth, disposeGroup } from '../ib/stage.js?v=202611142141';

/* every size in nm */
export const S = {
  cellLen: 72000, cellW: 16000, wall: 200, membrane: 7, vacBase: 7050,
  chl: 5000, chlThick: 2300, granum: 440, thylakoid: 20, nucleus: 6000, mitoW: 600,
  spongy: 26000, spongyLayer: 116000, epiTop: 22000, epiLow: 15000, salivary: 16000,
  glucose: 0.9, co2: 0.55, o2: 0.45, water: 0.3, fibre: 3
};
const R0 = S.cellW / 2, HL = S.cellLen / 2, RIN = R0 - S.wall;
const Y_LO = -(HL - 0.9 * R0 - 500), Y_HI = HL - 0.42 * R0 - 1700;      /* the straight side (KB, KT below), less a chloroplast's half width */
const GREEN = 0x4fb24a, GREEN_DARK = 0x1f7a3a, WALL = 0xd9eaa0, SAP = 0xcfe2f4, WALL_CUT = 0xe7cf86, WALL_LIT = 0xffe27a, MEM_CUT = 0xff7ad1, SAP_CUT = 0xb4d0f4, CYT_CUT = 0x86cfd6;      /* cell sap is colourless in a leaf cell: a faint tint only, so the chloroplasts behind it stay green */
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
/* a protein as the game draws one: a smooth, uneven folded lump (actors.js riboPart), r its radius */
const lump = (r, color, seed, emissive = 0x10305a, k = 0.6) => { const g = new THREE.Group(); g.add(new THREE.Mesh(riboPart(r, 1, 0.9, 0.95, 1, 3, seed), magicStandard({ color, roughness: 0.42, emissive, emissiveIntensity: k }, { rim: 0xffffff, rimK: 0.6 }))); return g; };
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* a palisade cell's shape, round the y axis: a tall cell whose top is pressed nearly flat against the leaf's top layer and
   whose foot is rounded (Stegner et al. 2022, figures 1 and 3: the real cells). KT, KB: how high each end's dome is, as
   a share of the cell's radius. rAt(theta, y) → the radius of the side (a function, so that the vacuole's membrane can
   lie over the chloroplasts) */
const KT = 0.42, KB = 0.9;
const ends = (r0, half) => ({ yB: -(half - KB * r0), yT: half - KT * r0, hB: KB * r0, hT: KT * r0 });
function capsuleGeo(rAt, half, radial = 72, rows = 96) {
  const pos = [], idx = [], r0 = rAt(0, 0), E = ends(r0, half);
  /* rows go from the bottom pole to the top pole: a dome, the straight side, a flatter dome */
  const ys = [];
  for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + (i / 14) * (Math.PI / 2); ys.push([E.yB + E.hB * Math.sin(a), Math.cos(a), E.yB]); }
  for (let i = 1; i < rows; i++) ys.push([E.yB + (E.yT - E.yB) * (i / rows), 1, 0]);
  for (let i = 0; i <= 14; i++) { const a = (i / 14) * (Math.PI / 2); ys.push([E.yT + E.hT * Math.sin(a), Math.cos(a), E.yT]); }
  ys.forEach(([y, k, ye]) => { for (let j = 0; j <= radial; j++) { const th = (j / radial) * Math.PI * 2, r = (k >= 1 ? rAt(th, y) : k * rAt(th, ye)); pos.push(r * Math.cos(th), y, r * Math.sin(th)); } });
  const W = radial + 1;
  for (let i = 0; i + 1 < ys.length; i++) for (let j = 0; j < radial; j++) { const a = i * W + j, b = a + 1, c = a + W, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
/* many copies of one shape: list of { p: Vector3, q: Quaternion, s: Vector3 | number } */
function many(geo, mat, list) {
  const m = new THREE.InstancedMesh(geo, mat, list.length), o = new THREE.Object3D();
  list.forEach((it, i) => { o.position.copy(it.p); if (it.q) o.quaternion.copy(it.q); else o.quaternion.identity(); if (it.s && it.s.isVector3) o.scale.copy(it.s); else o.scale.setScalar(it.s || 1); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
  m.instanceMatrix.needsUpdate = true; m.frustumCulled = false; return m;
}
const Y = V(0, 1, 0);
const lensGeo = (w, h) => { const g = new THREE.SphereGeometry(1, w, h); g.scale(0.5, 0.5, 0.5); return g; };   /* a ball 1 across: scaled to a lens */

/* where the chloroplasts of one palisade cell lie: on the inside of the side wall, close together as in a real cell (rows
   round the cell, each row half a step round from the last, each place a little off its row). keep: places left free */
function chloroplastSpots(R, { keep = [] } = {}) {
  /* along the whole straight side of the cell, from just above its rounded foot to just under its flat top */
  const out = [], yLo = Y_LO, yHi = Y_HI, rho = RIN - 150 - S.chlThick / 2, pitch = S.chl + 330, ring = Math.floor(2 * Math.PI * rho / pitch), rows = Math.floor((yHi - yLo) / (pitch * 0.9)), a0 = R() * 6.283;
  for (let r = 0; r <= rows; r++) for (let k = 0; k < ring; k++) {
    const th = (a0 + (k + (r % 2) * 0.5) / ring * Math.PI * 2 + (R() - 0.5) * 0.05) % (Math.PI * 2), y = yLo + (yHi - yLo) * (r / rows) + (R() - 0.5) * 300;
    if (keep.some(q => Math.hypot(arc(th, q.th) * rho, y - q.y) < q.r)) continue;
    out.push({ th, y, rho });
  }
  return out;
}
const arc = (a, b) => { let d = Math.abs(a - b) % (Math.PI * 2); return d > Math.PI ? Math.PI * 2 - d : d; };
const onWall = c => V(c.rho * Math.cos(c.th), c.y, c.rho * Math.sin(c.th));
/* a lens lying flat against the wall: its thin axis (local x) along the radius */
const flat = th => new THREE.Quaternion().setFromAxisAngle(Y, -th);

export async function build(stage, kit) {
  const R = rng(7), g = new THREE.Group(); g.name = 'leaf';
  const mats = [];      /* [material, its full opacity]: faded by the knobs */
  const fadeable = (m, full) => { m.transparent = true; mats.push([m, full == null ? m.opacity : full]); return m; };

  /* ================= the hero cell: one palisade cell, its front half cut away ================= */
  const hero = new THREE.Group(); hero.name = 'hero'; g.add(hero);
  const cut = new THREE.Plane(V(0, 0, -1), 20000);          /* keeps z ≤ constant: 20000 whole, 0 the front half away */
  /* its own chloroplast, the one the camera goes into: on the left side wall, cut by the same plane */
  const HC = { th: Math.PI, y: 9000, rho: RIN - 150 - S.chlThick / 2 };
  const NUC = { th: -Math.PI / 2 - 0.55, y: -17000, r: S.nucleus / 2 };
  NUC.rho = RIN - 250 - NUC.r;
  /* chloroplasts that lie exactly on the cut, on both sides of the cell: once the front half is away each one is seen
     in profile, a lens between the wall and the vacuole's membrane (the expert review, 11 Nov 2026: with chloroplasts only
     on the back wall, seen face-on through the cell sap, they read as floating in the vacuole) */
  const RIM = [], PITCH = S.chl + 330;
  [Math.PI, 0].forEach((th, k) => { for (let y = HC.y - 12 * PITCH + k * PITCH / 2; y <= Y_HI; y += PITCH) {
    if (y < Y_LO || (th === HC.th && Math.abs(y - HC.y) < 100) || Math.hypot(arc(th, NUC.th) * HC.rho, y - NUC.y) < NUC.r + S.chl / 2 + 300) continue;
    RIM.push({ th, y, rho: HC.rho }); } });
  const allSpots = chloroplastSpots(R, { keep: [{ th: HC.th, y: HC.y, r: S.chl + 300 }, { th: NUC.th, y: NUC.y, r: NUC.r + S.chl / 2 + 300 }].concat(RIM.map(c => ({ th: c.th, y: c.y, r: S.chl + 50 }))) });
  /* behind the cut, each one whole; those of the front half go with the front half */
  const spots = allSpots.filter(c => c.rho * Math.sin(c.th) <= -2700), frontSpots = allSpots.filter(c => c.rho * Math.sin(c.th) > -2700);
  /* the vacuole's membrane: 0.75 µm inside the wall where the cytoplasm is thin, and lying over each chloroplast and
     over the nucleus (it presses them against the wall) */
  const lumps = allSpots.concat(RIM, [HC]).map(c => ({ th: c.th, y: c.y, w: 2900, depth: S.vacBase - (c.rho - S.chlThick / 2 - 150), e: 0.6 }))
    .concat([{ th: NUC.th, y: NUC.y, w: 4300, depth: S.vacBase - (NUC.rho - NUC.r - 200), e: 0.6 }]);
  const vacR = (th, y) => {
    let r = S.vacBase;
    for (const L of lumps) { const d = Math.hypot(arc(th, L.th) * 6900, y - L.y); if (d < L.w) r = Math.min(r, S.vacBase - L.depth * Math.pow(1 - (d / L.w) * (d / L.w), L.e)); }
    return r;
  };
  const wallMat = fadeable(magicStandard({ color: WALL, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6, clippingPlanes: [cut] }, { rim: 0xf6ffd2, rimK: 1.1, rimPow: 2.0 }));
  const wall = new THREE.Mesh(capsuleGeo(() => R0, HL), wallMat); wall.renderOrder = 3; hero.add(wall);
  const memMat = fadeable(magicStandard({ color: PAL.membrane, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, roughness: 0.2, clippingPlanes: [cut] }, { rim: 0xbff6ff, rimK: 1.2 }));
  const membrane = new THREE.Mesh(capsuleGeo(() => RIN - S.membrane / 2, HL - S.wall), memMat); membrane.renderOrder = 2; hero.add(membrane);
  const vacMat = fadeable(magicStandard({ color: SAP, transparent: true, opacity: 0.13, depthWrite: false, roughness: 0.15, clippingPlanes: [cut] }, { rim: 0xcfe0ff, rimK: 1.6, rimPow: 2.2 }));
  const vacGeo = capsuleGeo(vacR, HL - S.wall - 2400, 96, 150);
  const vacuole = new THREE.Mesh(vacGeo, vacMat); vacuole.renderOrder = 1; hero.add(vacuole);
  /* the cut faces, where the plane meets the wall (a pale band 200 nm wide) and the cell sap (the vacuole's own outline) */
  const outline = (rAt, half, sign) => { const pts = [], r0 = rAt(0, 0), E = ends(r0, half), th = sign > 0 ? 0 : Math.PI;
    for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + (i / 24) * (Math.PI / 2); pts.push([sign * rAt(th, E.yB) * Math.cos(a), E.yB + E.hB * Math.sin(a)]); }
    for (let i = 1; i < 160; i++) { const y = E.yB + (E.yT - E.yB) * (i / 160); pts.push([sign * rAt(th, y), y]); }
    for (let i = 0; i <= 24; i++) { const a = (i / 24) * (Math.PI / 2); pts.push([sign * rAt(th, E.yT) * Math.cos(a), E.yT + E.hT * Math.sin(a)]); }
    return pts; };
  const ring2 = (rAt, half) => outline(rAt, half, 1).concat(outline(rAt, half, -1).reverse()).map(([x, y]) => new THREE.Vector2(x, y));
  const lineBand = (loop, w, mat) => {
    const n = loop.length, pos = new Float32Array(n * 2 * 3), idx = [], nor = [];
    for (let i = 0; i < n; i++) { const a = loop[(i + n - 1) % n], b = loop[(i + 1) % n], tx = b.x - a.x, ty = b.y - a.y, L = Math.hypot(tx, ty) || 1; let nx = ty / L, ny = -tx / L;
      if (nx * loop[i].x + ny * loop[i].y > 0) { nx = -nx; ny = -ny; }      /* towards the inside of the loop */
      nor.push([nx, ny]); const j = (i + 1) % n; idx.push(2 * i, 2 * j, 2 * i + 1, 2 * j, 2 * j + 1, 2 * i + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
    const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; let last = -1;
    m.fit = w2 => { if (Math.abs(w2 - last) < last * 0.03) return; last = w2; for (let i = 0; i < n; i++) { pos[6 * i] = loop[i].x; pos[6 * i + 1] = loop[i].y; pos[6 * i + 3] = loop[i].x + nor[i][0] * w2; pos[6 * i + 4] = loop[i].y + nor[i][1] * w2; } geo.attributes.position.needsUpdate = true; };
    m.fit(w); return m; };
  const rimShape = new THREE.Shape(ring2(() => R0, HL)); rimShape.holes.push(new THREE.Path(ring2(() => RIN, HL - S.wall).reverse()));
  const rimMat = fadeable(new THREE.MeshBasicMaterial({ color: WALL_CUT, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false }));
  const rim = new THREE.Mesh(new THREE.ShapeGeometry(rimShape, 1), rimMat); rim.renderOrder = 4; hero.add(rim);
  /* nearer, the band is not a plain colour: the wall's layers (fibres lie in layers, the wall step) as five fine lines
     along it, each 8 nm wide; from the whole-cell view they are far thinner than a pixel and do not show */
  const layerMat = fadeable(new THREE.MeshBasicMaterial({ color: 0xa98f48, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
  const wallLayers = [32, 66, 100, 134, 168].map(off => { const m = lineBand(ring2(() => R0 - off, HL - off), 8, layerMat); m.renderOrder = 5; hero.add(m); return m; });
  /* the cut face must read as a section (Daniel, 12 Nov 2026: "it's very hard to tell the difference between the cell
     wall and any other structure, particularly the cell membrane … very hard to tell that there's something there",
     the permanent vacuole): from the outside in, the wall's band (its fibres' colour), the cell membrane (a pink line,
     the colour of its lipids from near), the cytoplasm (a thin pale band), the vacuole's membrane (a pink line) and the
     cell sap (pale blue: a drawing's colour, the real sap of this cell is clear and colourless; the words say so). */
  const sapMat = fadeable(new THREE.MeshBasicMaterial({ color: SAP_CUT, transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false }));
  const cytShape = new THREE.Shape(ring2(() => RIN, HL - S.wall)); cytShape.holes.push(new THREE.Path(ring2(vacR, HL - S.wall - 2400).reverse()));
  const cytMat = fadeable(new THREE.MeshBasicMaterial({ color: CYT_CUT, transparent: true, opacity: 0.26, side: THREE.DoubleSide, depthWrite: false }));
  const cytFace = new THREE.Mesh(new THREE.ShapeGeometry(cytShape, 1), cytMat); cytFace.renderOrder = 2; hero.add(cytFace);
  /* a membrane where it is cut: 7 nm thick, far too thin to see from here, so it is drawn as a band that is never
     thinner than 2 pixels on the screen (ribbon.fit, each frame) and has its true thickness once the camera is near */
  const ribbon = (loop, mat) => lineBand(loop, S.membrane, mat);
  const memLineMat = fadeable(new THREE.MeshBasicMaterial({ color: MEM_CUT, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false }));
  const memLine = ribbon(ring2(() => RIN, HL - S.wall), memLineMat); memLine.renderOrder = 6; hero.add(memLine);
  const sapFace = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(ring2(vacR, HL - S.wall - 2400)), 1), sapMat); sapFace.renderOrder = 2; hero.add(sapFace);
  const vacLine = ribbon(ring2(vacR, HL - S.wall - 2400), fadeable(new THREE.MeshBasicMaterial({ color: MEM_CUT, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })));
  vacLine.renderOrder = 5; hero.add(vacLine);

  /* chloroplasts: lenses 5 µm across, 2.3 µm thick, flat against the wall */
  const chlMat = magicStandard({ color: GREEN, roughness: 0.5, emissive: 0x0d3a12, emissiveIntensity: 0.55 }, { rim: 0xc9ffb0, rimK: 0.75 });
  const chlScale = V(S.chlThick, S.chl, S.chl);
  /* real chloroplasts are not all one size or all turned one way: each is 4.5 to 5.3 µm across (the open one and those on
     the cut are 5 µm) */
  const sized = c => { const k = 0.9 + R() * 0.16; return { p: onWall(c), q: flat(c.th).multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), R() * 6.283)), s: V(S.chlThick * (0.92 + R() * 0.14), S.chl * k, S.chl * k * (0.92 + R() * 0.1)) }; };
  const chloroplasts = many(lensGeo(22, 14), chlMat, spots.map(sized));
  hero.add(chloroplasts);
  /* chloroplasts line the rounded foot of the cell too (three behind the cut), each flat against the wall there */
  { const hB = KB * RIN, yB = -(HL - S.wall - hB), a = -0.78, n2 = V(Math.cos(a) / RIN, Math.sin(a) / hB, 0).normalize();
    hero.add(many(lensGeo(22, 14), chlMat, [-Math.PI / 2, -Math.PI / 2 - 1.05, -Math.PI / 2 + 1.05].map(th => { const n = V(n2.x * Math.cos(th), n2.y, n2.x * Math.sin(th));
      return { p: V(RIN * Math.cos(a) * Math.cos(th), yB + hB * Math.sin(a), RIN * Math.cos(a) * Math.sin(th)).addScaledVector(n, -(150 + S.chlThick / 2)), q: new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), n), s: chlScale }; }))); }
  const frontMat = fadeable(magicStandard({ color: GREEN, transparent: true, opacity: 1, roughness: 0.5, emissive: 0x0d3a12, emissiveIntensity: 0.55 }, { rim: 0xc9ffb0, rimK: 0.75 }));
  const frontChl = many(lensGeo(22, 14), frontMat, frontSpots.map(sized)); hero.add(frontChl);
  /* those on the cut: whole while the cell is whole (the cut takes their front halves with it), then the back half and
     its flat cut face */
  const wholeMat = magicStandard({ color: GREEN, roughness: 0.5, emissive: 0x0d3a12, emissiveIntensity: 0.55, clippingPlanes: [cut] }, { rim: 0xc9ffb0, rimK: 0.75 });
  const rimWhole = many(lensGeo(22, 14), wholeMat, RIM.map(c => ({ p: onWall(c), q: flat(c.th), s: chlScale }))); hero.add(rimWhole);
  const turnX = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI);
  const rimHalf = many(new THREE.SphereGeometry(0.5, 22, 14, 0, Math.PI), chlMat, RIM.map(c => ({ p: onWall(c), q: c.th === Math.PI ? flat(c.th) : flat(c.th).multiply(turnX), s: chlScale }))); hero.add(rimHalf);
  /* their cut faces are not a plain green (Daniel, 11 Nov 2026: no plain cut face; nearer still now that the pupil can
     zoom): the stacks of membranes (grana) seen from the side, each a few short lines that lie along the chloroplast,
     joined by single membranes, in the liquid round them; the same pattern as inside the open chloroplast */
  const cutTex = (() => { const c = document.createElement('canvas'); c.width = 184; c.height = 400; const x = c.getContext('2d'), Q = rng(31);
    x.fillStyle = '#3f9d47'; x.fillRect(0, 0, 184, 400);
    x.strokeStyle = 'rgba(24,96,40,.55)'; x.lineWidth = 1.2;          /* single membranes between the stacks */
    for (let i = 0; i < 9; i++) { const u = 28 + i * 16 + (Q() - 0.5) * 6; x.beginPath(); x.moveTo(u, 30); x.bezierCurveTo(u + (Q() - 0.5) * 14, 140, u + (Q() - 0.5) * 14, 260, u + (Q() - 0.5) * 8, 370); x.stroke(); }
    const put = []; for (let i = 0; i < 900 && put.length < 34; i++) { const u = 22 + Q() * 140, v = 26 + Q() * 348, r = Math.hypot((u - 92) / 92, (v - 200) / 200); if (r > 0.86 || put.some(o => Math.abs(o[0] - u) < 30 && Math.abs(o[1] - v) < 40)) continue; put.push([u, v]); }
    put.forEach(([u, v]) => { x.fillStyle = '#1c6a2c'; x.fillRect(u - 10, v - 15, 20, 30); x.strokeStyle = '#7fd08a'; x.lineWidth = 1; for (let k = -8; k <= 8; k += 4) { x.beginPath(); x.moveTo(u + k, v - 14); x.lineTo(u + k, v + 14); x.stroke(); } });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; })();
  const rimFaceMat = new THREE.MeshBasicMaterial({ color: 0xd8d8d8, map: cutTex, side: THREE.DoubleSide });
  const rimFace = many(new THREE.CircleGeometry(0.5, 40), rimFaceMat, RIM.map(c => ({ p: onWall(c), q: flat(c.th), s: V(S.chlThick, S.chl, 1) }))); hero.add(rimFace);
  const rimEdge = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(RIM.flatMap(c => { const o = onWall(c), pts = []; for (let i = 0; i < 48; i++) { const a = i / 48 * 6.2832, b = (i + 1) / 48 * 6.2832; pts.push(V(o.x + S.chlThick / 2 * Math.cos(a), o.y + S.chl / 2 * Math.sin(a), 6), V(o.x + S.chlThick / 2 * Math.cos(b), o.y + S.chl / 2 * Math.sin(b), 6)); } return pts; })), new THREE.LineBasicMaterial({ color: 0xd8ffc4, transparent: true, opacity: 0.9 })); rimEdge.renderOrder = 7; hero.add(rimEdge);
  /* the nucleus (6 µm) and mitochondria (0.6 µm wide), in the game's colours */
  const nucMat = magicStandard({ color: PAL.nucleus, roughness: 0.4, emissive: 0x1a1250, emissiveIntensity: 0.5 }, { rim: PAL.envelope, rimK: 1.0 });
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(NUC.r, 40, 28), nucMat); nucleus.position.copy(onWall(NUC)); hero.add(nucleus);
  /* a nucleus in a plant cell is pressed a little flat against the wall, and its nucleolus shows as a darker body */
  nucleus.quaternion.copy(flat(NUC.th)); nucleus.scale.set(0.8, 1, 1);
  nucMat.transparent = true; nucMat.opacity = 0.78;
  const nucleolus = new THREE.Mesh(new THREE.SphereGeometry(950, 20, 14), magicStandard({ color: PAL.nucleolus, roughness: 0.5, emissive: 0x4a1238, emissiveIntensity: 0.6 }, { rim: 0xffb0e0, rimK: 0.5 })); nucleolus.position.copy(onWall(NUC)).add(V(300, 500, 400)); hero.add(nucleolus);
  const mitoMat = magicStandard({ color: PAL.mito, roughness: 0.45, emissive: 0x4a1c06, emissiveIntensity: 0.5 }, { rim: PAL.cristae, rimK: 0.8 });
  const mitoSpots = [];
  /* a leaf cell has some hundreds of mitochondria (means of about 300 in young and 450 in mature leaves of Arabidopsis:
     Preuten et al. 2010, The Plant Journal 64:948), each a short rod
     0.5 to 1 µm long: over a hundred in the half shown, between the chloroplasts */
  for (let i = 0; i < 60000 && mitoSpots.length < 120; i++) {
    const th = Math.PI + R() * Math.PI, y = Y_LO - 1500 + R() * (Y_HI - Y_LO + 3000), len = 500 + R() * 500;
    if (spots.concat(RIM, [HC]).some(c => Math.hypot(arc(th, c.th) * 6900, y - c.y) < S.chl / 2 + 330)) continue;
    if (Math.hypot(arc(th, NUC.th) * 6900, y - NUC.y) < NUC.r + 1500 || Math.hypot(arc(th, HC.th) * 6900, y - HC.y) < S.chl / 2 + 1500) continue;
    if (mitoSpots.some(m => Math.hypot(arc(th, m.th) * 6900, y - m.y) < 1250)) continue;
    mitoSpots.push({ th, y, rho: RIN - 150 - S.mitoW / 2, len, tilt: (R() - 0.5) * 2.4 });
  }
  const mitos = many(new THREE.CapsuleGeometry(S.mitoW / 2, 1, 6, 12), mitoMat, mitoSpots.map(m => {
    /* a rod lying along the wall: its long axis in the wall's own plane, turned a little */
    const q = flat(m.th).multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), m.tilt));
    return { p: onWall(m), q, s: V(1, 1, 1) };
  }));
  /* each rod's own length (a capsule's straight part is 1 nm long in the shape: it is stretched here) */
  { const o = new THREE.Object3D(); mitoSpots.forEach((m, i) => { o.position.copy(onWall(m)); o.quaternion.copy(flat(m.th).multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), m.tilt))); o.scale.set(1, 1, 1); o.updateMatrix(); mitos.setMatrixAt(i, o.matrix); }); }
  hero.add(mitos);
  /* the Golgi apparatus of a plant cell is many small separate stacks (Staehelin & Moore 1995, Annual
     Review of Plant Physiology and Plant Molecular Biology 46:261), drawn about 1 µm across (no size is stated to pupils); the ER is a fine net of tubes (about 60 nm wide)
     just under the cell membrane. Both in the game's colours (Golgi gold, ER teal) */
  const free = (th, y, d) => !spots.concat(RIM, [HC]).some(c => Math.hypot(arc(th, c.th) * 6900, y - c.y) < S.chl / 2 + d) && Math.hypot(arc(th, NUC.th) * 6900, y - NUC.y) > NUC.r + d + 600;
  const golgiSpots = [];
  for (let i = 0; i < 9000 && golgiSpots.length < 8; i++) { const th = Math.PI + 0.25 + R() * (Math.PI - 0.5), y = (R() * 2 - 1) * (HL - R0 - 2500);
    if (!free(th, y, 520) || mitoSpots.some(m => Math.hypot(arc(th, m.th) * 6900, y - m.y) < 1700) || golgiSpots.some(m => Math.hypot(arc(th, m.th) * 6900, y - m.y) < 9000)) continue; golgiSpots.push({ th, y, rho: RIN - 420 }); }
  const golgiMat = magicStandard({ color: PAL.golgi, roughness: 0.4, emissive: 0x5a3c06, emissiveIntensity: 0.7 }, { rim: 0xffe9a8, rimK: 0.8 });
  const golgi = many(new THREE.CylinderGeometry(0.5, 0.5, 1, 18), golgiMat, golgiSpots.flatMap(G => [-2, -1, 0, 1, 2].map(k => {
    const n = V(Math.cos(G.th), 0, Math.sin(G.th)), w = 900 * (1 - 0.07 * Math.abs(k));
    return { p: onWall(G).addScaledVector(n, -k * 75), q: new THREE.Quaternion().setFromUnitVectors(Y, n), s: V(w, 34, w) }; })));
  hero.add(golgi);
  const erNodes = [];
  for (let i = 0; i < 4000 && erNodes.length < 110; i++) { const th = Math.PI + R() * Math.PI, y = (R() * 2 - 1) * (HL - R0 - 600); if (erNodes.some(n => Math.hypot(arc(th, n.th) * 7600, y - n.y) < 1500)) continue; erNodes.push({ th, y }); }
  const erPts = [], erAt = (th, y) => V((RIN - 110) * Math.cos(th), y, (RIN - 110) * Math.sin(th));
  erNodes.forEach((a, i) => erNodes.map((b, j) => [Math.hypot(arc(a.th, b.th) * 7600, a.y - b.y), j]).filter(x => x[1] > i).sort((x, y) => x[0] - y[0]).slice(0, 2).forEach(([d, j]) => {
    if (d > 4600) return; const b = erNodes[j]; let dth = b.th - a.th; if (dth > Math.PI) dth -= 2 * Math.PI; if (dth < -Math.PI) dth += 2 * Math.PI;
    for (let k = 0; k < 6; k++) erPts.push(erAt(a.th + dth * k / 6, a.y + (b.y - a.y) * k / 6), erAt(a.th + dth * (k + 1) / 6, a.y + (b.y - a.y) * (k + 1) / 6)); }));
  /* each stretch of the net as a thin tube, 60 nm wide (drawn as many short tubes of one shape) */
  const erMat = magicStandard({ color: PAL.rer, roughness: 0.5, emissive: 0x0a4a3c, emissiveIntensity: 0.8 }, { rim: 0xbff6e6, rimK: 0.6 });
  const er = many(new THREE.CylinderGeometry(30, 30, 1, 6), erMat, Array.from({ length: erPts.length / 2 }, (_, k) => { const a = erPts[2 * k], b = erPts[2 * k + 1], d = b.clone().sub(a);
    return { p: a.clone().add(b).multiplyScalar(0.5), q: new THREE.Quaternion().setFromUnitVectors(Y, d.clone().normalize()), s: V(1, d.length() * 1.04, 1) }; }));
  hero.add(er);
  mitos.geometry.dispose(); mitos.geometry = new THREE.CapsuleGeometry(S.mitoW / 2, 320, 6, 12);
  /* the cytoplasm: its crowded molecules as motes of light between the wall and the vacuole */
  const cyto = sparkles({ count: 700, size: 520, color: 0xcfffe0, opacity: 0.5, drift: 60, near: 4000, sample: v => {
    for (;;) { const th = Math.PI + R() * Math.PI, y = (R() * 2 - 1) * (HL - R0), r = vacR(th, y) + 60 + R() * Math.max(40, RIN - 120 - vacR(th, y)); if (r < RIN - 60) { v.set(r * Math.cos(th), y, r * Math.sin(th)); return; } } } });
  hero.add(cyto);

  /* ---- the open chloroplast: its envelope's back half, its cut face, its stacks of membranes, a starch grain ---- */
  const hc = new THREE.Group(); hc.name = 'chloroplast'; hc.position.copy(onWall(HC)); hc.quaternion.copy(flat(HC.th)); hero.add(hc);
  const hx = S.chlThick / 2, hy = S.chl / 2;
  const envMat = fadeable(magicStandard({ color: 0x2f8f3a, transparent: true, opacity: 0.86, side: THREE.DoubleSide, depthWrite: false, roughness: 0.5, emissive: 0x0d3a12, emissiveIntensity: 0.25 }, { rim: 0xd8ffc4, rimK: 0.7 }));
  /* flat(π) turns the group half a turn: its local +z is the world's −z, so the half kept (behind the cut) is local z > 0 */
  const env = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32, 0, Math.PI), envMat); env.scale.set(hx, hy, hy); env.renderOrder = 6; hc.add(env);
  const faceMat = fadeable(new THREE.MeshBasicMaterial({ color: 0x2c7a3a, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }));
  const face = new THREE.Mesh(new THREE.CircleGeometry(1, 64), faceMat); face.scale.set(hx, hy, 1); face.renderOrder = 5; hc.add(face);
  const edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 96 }, (_, i) => V(hx * Math.cos(i / 96 * 6.2832), hy * Math.sin(i / 96 * 6.2832), 0))), fadeable(new THREE.LineBasicMaterial({ color: 0xd8ffc4, transparent: true, opacity: 0.95 })));
  edge.renderOrder = 7; hc.add(edge);
  /* a chloroplast has TWO membranes round it, about 25 nm apart with the space between them: the second line */
  { const k = 25, e2 = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 96 }, (_, i) => V((hx - k) * Math.cos(i / 96 * 6.2832), (hy - k) * Math.sin(i / 96 * 6.2832), 0))), edge.material); e2.renderOrder = 7; hc.add(e2);
    const env2 = new THREE.Mesh(env.geometry, envMat); env2.scale.set(hx - k, hy - k, hy - k); env2.renderOrder = 6; hc.add(env2); }
  /* the stacks: each a pile of flat discs, a disc every 20 nm, the pile's axis along the chloroplast's thin axis */
  const grana = [], discs = [];
  /* the stacks lie through the whole chloroplast, to within about 0.15 µm of its two membranes, at several levels
     across its thin axis (Austin & Staehelin 2011, Plant Physiology 155:1601) */
  const LEVELS = [-3, -2, -1, 0, 1, 2, 3].map(k => k * 290);
  for (let i = 0; i < 60000 && grana.length < 31; i++) {
    const lv = LEVELS[Math.floor(R() * LEVELS.length)], r = S.granum / 2 * (0.75 + R() * 0.5), n = 9 + Math.floor(R() * 7);
    const p = V(lv + (R() - 0.5) * 60, (R() * 2 - 1) * hy, r + 60 + R() * hy);
    if (Math.hypot((Math.abs(p.x) + n * S.thylakoid / 2) / hx, (Math.hypot(p.y, p.z) + r) / hy) > 0.95) continue;
    if (grana.some(o => Math.hypot(p.y - o.p.y, p.z - o.p.z) < r + o.r + 90 && Math.abs(p.x - o.p.x) < (n + o.n) * S.thylakoid / 2 + 50)) continue;
    grana.push({ p, r, n, lv });
  }
  const zq = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), Math.PI / 2);     /* a disc's axis (its y) laid along x */
  grana.forEach(G => { for (let k = 0; k < G.n; k++) discs.push({ p: V(G.p.x + (k - (G.n - 1) / 2) * S.thylakoid, G.p.y, G.p.z), q: zq, s: V(G.r * 2, 14, G.r * 2) }); });
  /* the stacks are not loose: broad single sheets of the same membrane, parallel to the discs, pass through the stacks
     of a level and join them (Staehelin 2003; Mustárdy & Garab 2003, Trends in Plant Science 8:117; Austin & Staehelin
     2011), so that all the membranes of a chloroplast are one net. Each sheet: a flat plate 14 nm thick, 1 to 4 µm long
     (drawn flat: real ones wind round the stacks at 20 to 25°, Austin & Staehelin 2011) */
  const sheets = [];
  LEVELS.forEach(lv => { const here = grana.filter(G => G.lv === lv); if (!here.length) return;
    [-1, 1].forEach(side => { const g = here.filter(G => side * G.p.y >= 0); if (!g.length) return;
      const x = lv + (R() - 0.5) * 50, rho = hy * Math.sqrt(Math.max(0.05, 1 - (x / hx) ** 2)) * 0.93;
      const ys = g.map(G => G.p.y), zs = g.map(G => G.p.z), rr = Math.max(...g.map(G => G.r));
      let y0 = Math.min(...ys) - rr - 220, y1 = Math.max(...ys) + rr + 220, z1 = Math.max(...zs) + rr + 220, z0 = 30;
      const c = V(x, (y0 + y1) / 2, (z0 + z1) / 2); let a = (y1 - y0) / 2 * 1.2, b = (z1 - z0) / 2 * 1.15;
      /* kept inside the chloroplast: the plate is made smaller until its edge lies within the lens at its level */
      for (let n = 0; n < 40; n++) { let out = false; for (let t = 0; t < 24; t++) { const yy = c.y + a * Math.cos(t / 24 * 6.2832), zz = c.z + b * Math.sin(t / 24 * 6.2832); if (Math.hypot(yy, zz) > rho || zz < 12) { out = true; break; } } if (!out) break; a *= 0.95; b *= 0.95; if (c.z - b < 12) c.z = b + 14; c.y *= 0.97; }
      sheets.push({ p: c, q: zq, s: V(2 * a, 14, 2 * b) }); }); });
  const discMat = magicStandard({ color: GREEN_DARK, roughness: 0.5, emissive: 0x0a3d18, emissiveIntensity: 0.9 }, { rim: 0x9dffa0, rimK: 0.9 });
  const thyl = many(new THREE.CylinderGeometry(0.5, 0.5, 1, 22), discMat, discs); hc.add(thyl);
  const sheetMat = magicStandard({ color: 0x2f9a48, roughness: 0.55, emissive: 0x0a3d18, emissiveIntensity: 0.7 }, { rim: 0x9dffa0, rimK: 0.6 });
  const sheet = many(new THREE.CylinderGeometry(0.5, 0.5, 1, 40), sheetMat, sheets); hc.add(sheet);
  /* starch made by day: a flat grain that grows in the stroma */
  const grainMat = magicStandard({ color: 0xfbf8ee, roughness: 0.3, emissive: 0x6a6650, emissiveIntensity: 0.7 }, { rim: 0xffffff, rimK: 0.6 });
  const grain = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), grainMat); grain.position.set(-hx * 0.2, -hy * 0.36, hy * 0.42); hc.add(grain);
  { /* its place is kept free of stacks */
    const o = new THREE.Object3D(); let k = 0;
    grana.forEach(G => { const hide = Math.hypot((G.p.y - grain.position.y) / 900, (G.p.z - grain.position.z) / 760) < 1.25; for (let j = 0; j < G.n; j++, k++) if (hide) { thyl.getMatrixAt(k, o.matrix); o.matrix.decompose(o.position, o.quaternion, o.scale); o.scale.setScalar(0); o.updateMatrix(); thyl.setMatrixAt(k, o.matrix); } G.hidden = hide; });
    thyl.instanceMatrix.needsUpdate = true;
  }

  /* ---- where the molecules are seen: in the stroma, just outside the end of one stack ---- */
  const G0 = grana.filter(G => !G.hidden).sort((a, b) => (a.p.z + Math.abs(a.p.y - 300) * 0.4) - (b.p.z + Math.abs(b.p.y - 300) * 0.4))[0];
  const site = new THREE.Group(); site.name = 'molecules'; hc.add(site);
  /* the site's own frame: x to the viewer's right (into the stack), y up the cell, z to the viewer. The chloroplast's
     group is turned half a turn, so the site is turned back; the stack's last membrane is 9 nm to its right */
  site.position.set(G0.p.x + (G0.n * S.thylakoid) / 2 + 6, G0.p.y, G0.p.z - G0.r * 0.4);
  site.rotation.y = Math.PI;
  /* from far away the stack's discs are flat green plates, each one a closed sac of membrane 14 nm thick; here, at the
     molecules' own size, the last sac is drawn as it is: two membranes (each two layers of lipids, about 5 nm) with a
     narrow space between them. The plates give way to it as the camera comes (draw) */
  const mem = bilayer({ x0: -36, x1: 36, depth: 12, seed: 4, head: 0x7fe08a, tail: 0xd8f0a0 }); mem.rotation.z = Math.PI / 2; mem.position.set(6, 0, 0); site.add(mem);
  const mem2 = bilayer({ x0: -36, x1: 36, depth: 12, seed: 5, head: 0x6fcf7a, tail: 0xcfe89a }); mem2.rotation.z = Math.PI / 2; mem2.position.set(15, 0, 0); site.add(mem2);
  const lumen = new THREE.Mesh(new THREE.BoxGeometry(4.6, 76, 12), new THREE.MeshBasicMaterial({ color: 0x1c6a3a, transparent: true, opacity: 0.7, depthWrite: false })); lumen.position.set(10.5, 0, -6.4); site.add(lumen);
  /* the watery liquid round the stacks, behind the molecules: what lies far behind is not drawn at this size */
  const back = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0x0f3324, transparent: true, opacity: 0.94, depthWrite: false })); back.position.set(0, 0, -13.5); back.renderOrder = 0; site.add(back);
  /* chlorophyll is held by proteins in that membrane, and a real stack's membrane is crowded with them (most of its
     area is protein: Kirchhoff et al. 2008, Plant Physiology 146:1571): five green lumps in the strip drawn */
  const PROT_Y = [-7.2, -3.5, 0.4, 3.9, 7.3];
  const chlProt = PROT_Y.map((y, i) => { const t = lump(2.2, 0x35c45a, i * 1.7, 0x0f5a22, 0.9); t.position.set(6, y, -2.2 - (i % 3) * 0.9); t.rotation.set(i, i * 2.1, 0); site.add(t); return t; });
  /* six carbon dioxide and six water in; one glucose and six oxygen out (the numbers of the equation pupils learn).
     Where each one goes is true to the chloroplast (the check of the shapes, 11 Nov 2026): the water goes to the
     membrane, where the light's energy is, and the oxygen comes from there; the carbon dioxide goes to enzymes in the
     watery liquid, which build the sugar with energy passed on from the membrane. (The real path has many steps and
     the first sugars are smaller than glucose: one press stands for all of it, as in the game's mitochondria.) */
  const mk = (kind, s, gl, col) => { const t = token(kind, s); const h = glow(gl * 0.8, col, 0.6); t.add(h); t.userData.halo = h; site.add(t); return t; };
  /* two enzymes of the liquid: the one that takes carbon dioxide (Rubisco) is large, about 11 nm across, twice the
     membrane's thickness (BioNumbers 105125: about 11 nm across and 10 nm high); the other about 5 nm (most enzymes are 4 to 10 nm) */
  const enz = [[-10.6, 0.4, -4.6, 5.5, 0x8fb8ff, 2.1], [-12.4, -8.8, -3.4, 2.5, 0xa9a6ff, 4.4]].map(([x, y, z, r, c, sd], i) => { const t = lump(r, c, sd); t.position.set(x, y, z); t.rotation.set(i * 1.7, i + 0.4, 0.3); site.add(t); return t; });
  const MEET = V(-5.0, 0.4, -1.4), GLU_1 = V(-7.4, -5.6, 2.2);
  const co2 = Array.from({ length: 6 }, () => mk('co2', 0.245, 1.5, 0xdfe6ff));
  const h2o = Array.from({ length: 6 }, () => mk('water', 0.21, 1.2, 0xbfe9ff));
  const o2 = Array.from({ length: 6 }, () => mk('oxygen', 0.245, 1.5, 0xffb0b0));
  const glu = mk('glucose', 0.37, 2.6, 0xffe39a);
  const grid = (i, x0, y0, dx, dy) => V(x0 + (i % 3) * dx + ((i * 7) % 5) * 0.14, y0 + Math.floor(i / 3) * dy + ((i * 3) % 4) * 0.13, 1 + ((i * 5) % 6) * 0.3);
  const CO2_0 = co2.map((_, i) => grid(i, -4.6, 4.9, 1.3, 1.05)), H2O_0 = h2o.map((_, i) => grid(i, -1.4, -3.4, 1.25, -1.15));
  /* each water goes to a protein of the membrane; each oxygen comes away from one */
  const H2O_1 = h2o.map((_, i) => V(4.1, PROT_Y[1 + (i % 3)] + (i < 3 ? 0.5 : -0.5), 0.9)), O2_0 = o2.map((_, i) => V(4.0, PROT_Y[1 + (i % 3)] + (i < 3 ? -0.4 : 0.6), 1.0));
  const O2_1 = o2.map((_, i) => grid(i, 0.2, 4.6, 1.2, 1.1));
  const flash = glow(4.2, 0xfff1a8, 0); flash.position.copy(MEET); site.add(flash);
  /* light is not drawn as things that drift among the molecules (a wave of light is far longer than this whole picture):
     in the light the picture is lit from the upper left, the chlorophyll in the membrane glows, and one pulse of its
     energy goes from the membrane to the enzymes (the expert review, 11 Nov 2026) */
  const lightWash = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); lightWash.position.set(-6, 3, -13); site.add(lightWash);
  const pulse = glow(2.4, 0xbfffb0, 0); site.add(pulse);
  /* glucose joined into a chain: the start of a starch molecule (in the chain each glucose adds about 0.5 nm) */
  const chainN = 14, chainT = Array.from({ length: chainN }, () => { const t = token('glucose', 0.37); site.add(t); return t; });
  const chainAt = k => V(-8.9 + k * 0.5, -4.8 + 0.5 * Math.sin(k * 0.62), 1.4 + 0.5 * Math.cos(k * 0.62));
  const chainFrom = k => V(-2.6 + (k % 5) * 1.1, -1.6 - (k % 3) * 1.0 - ((k * 7) % 4) * 0.12, 1.6);
  const chainTilt = k => new THREE.Euler(0.3 * Math.sin(k * 0.62), 0.78, 0.25 * Math.cos(k * 0.62));

  /* ================= the cell wall close up, at the left of the cell, at the cut ================= */
  const ws = new THREE.Group(); ws.name = 'wall'; ws.position.set(-R0 + S.wall / 2, -9000, 0); hero.add(ws);
  /* its frame: x from the outside of the cell (−) to the inside (+), y along the cell, z to the viewer */
  const wprot = [];
  const fibreMat = magicStandard({ color: 0xdccf96, roughness: 0.6, emissive: 0x3a3418, emissiveIntensity: 0.3, clippingPlanes: [cut], side: THREE.DoubleSide }, { rim: 0xfff6d0, rimK: 0.3 });
  const fibres = [], fibres2 = [];
  /* a fibre runs for micrometres and bends a little (Zhang, Zheng & Cosgrove 2016, The Plant Journal 85:179, on onion walls): each is a long thin
     tube, bowed 30 nm in the wall's own plane (the layers that run towards the viewer are shorter, so that they stay
     inside the curved wall).
     The fibres lie in the wall's own plane, a thin layer at a time, each layer turned from the last (so a wall is
     strong in every direction): in one layer they run up the cell, in the next towards the viewer, cut at the cut */
  const layer = (list, x0, x1, n, seed) => { const Q = rng(seed); for (let i = 0; i < n; i++) {
    const x = x0 + Q() * (x1 - x0), lay = Math.floor((x - x0) / 24), a = [0, 1.15, -0.5, -1.15, 0.5][lay % 5] + (Q() - 0.5) * 0.16, ang = Math.abs([0, 1.15, -0.5, -1.15, 0.5][lay % 5]), len = ang > 1 ? 1300 + Q() * 400 : 3000 + Q() * 1200;
    list.push({ p: V(x, (Q() - 0.5) * 900, -Q() * 300), q: new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), a).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Q() < 0.5 ? 0 : Math.PI)), s: V(1, len, 1) }); } };
  layer(fibres, -S.wall / 2 + 5, S.wall / 2 - 1.6, 580, 11); layer(fibres2, -S.wall / 2 - 40 - S.wall + 5, -S.wall / 2 - 40 - 5, 520, 12);
  const fibreGeo = (() => { const g = new THREE.CylinderGeometry(S.fibre / 2, S.fibre / 2, 1, 6, 24), P = g.attributes.position; for (let i = 0; i < P.count; i++) P.setZ(i, P.getZ(i) + 30 * Math.cos(P.getY(i) * Math.PI)); g.computeVertexNormals(); return g; })();
  const fib = many(fibreGeo, fibreMat, fibres); ws.add(fib);
  const fib2 = many(fibreGeo, fibreMat, fibres2); ws.add(fib2);
  /* what lies between the fibres (other carbohydrates and water), and the thin layer that joins two cells' walls */
  const slab = (x0, x1, c, a) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 1000, 320), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: a, depthWrite: false })); m.position.set((x0 + x1) / 2, 0, -160.5); m.renderOrder = 1; ws.add(m); return m; };
  /* the next cell is a cell too: inside its wall, its own cell membrane and its cytoplasm (the second check of the shapes) */
  const nextCell = [slab(-S.wall * 1.5 - 40 - 8, -S.wall * 1.5 - 40 - 1, 0xa8ecff, 0.75), slab(-S.wall * 1.5 - 40 - 520, -S.wall * 1.5 - 40 - 9, 0xcfe9c8, 0.2)];
  const SLAB = [0.62, 0.62, 0.7], slabs = [slab(-S.wall / 2, S.wall / 2, 0x4d5a26, SLAB[0]), slab(-S.wall / 2 - 40 - S.wall, -S.wall / 2 - 40, 0x4d5a26, SLAB[1]), slab(-S.wall / 2 - 40, -S.wall / 2, 0x7a5c2c, SLAB[2])];
  /* the cell membrane, touching the inside of the wall: two layers of lipids (about 5 nm), as at the game's way in */
  const wmem = bilayer({ x0: -64, x1: 64, depth: 12, seed: 8, holes: [{ x: 15, z: -4.2, r: 3.0 }, { x: -24, z: -5.6, r: 2.6 }] }); wmem.rotation.z = Math.PI / 2; wmem.position.set(S.wall / 2 + 2.5, 0, 0); ws.add(wmem);
  /* a membrane is two layers of lipids WITH PROTEINS in them (the game's way in): two of them in the strip drawn */
  [[15, -4.2, 2.9, PAL.rer], [-24, -5.6, 2.5, PAL.envelope]].forEach(([y, z, r, c], i) => { const t = lump(r, c, 3 + i * 2.3, 0x10203a, 0.5); t.position.set(S.wall / 2 + 2.5, y, z); t.scale.set(0.8, 1.15, 1); t.rotation.set(0, i * 1.3, 0); ws.add(t); wprot.push(t); });
  const wfilm = new THREE.Mesh(new THREE.BoxGeometry(5, 1000, 320), new THREE.MeshBasicMaterial({ color: 0xff9ac8, transparent: true, opacity: 0.6, depthWrite: false })); wfilm.position.set(S.wall / 2 + 2.9, 0, -160.5); ws.add(wfilm);
  const wcyto = sparkles({ count: 260, size: 9, color: 0xcfffe0, opacity: 0.6, drift: 1.2, near: 30, sample: v => v.set(S.wall / 2 + 12 + R() * 320, (R() - 0.5) * 900, -6 - R() * 280) }); ws.add(wcyto);

  /* ================= the rest of the leaf: the cells round the hero =================
     Drawn after the real leaf (Stegner et al. 2022, figures 1 and 3; the expert check of the shapes, 11 Nov 2026):
     - palisade cells stand side by side and touch, each a little different in width, length and lean, their flat tops
       against the top layer;
     - spongy cells are rounded and uneven, and each TOUCHES its neighbours: together they are a loose net with air
       spaces between (never single cells hanging in air);
     - each skin of the leaf (epidermis) is ONE layer of flat, clear cells, joined edge to edge, their outer faces a
       little domed; the lower one is thinner;
     - the tiny hole (a stoma) is a slit between two small bean-shaped cells IN the lower skin, with an air space above. */
  const leaf = new THREE.Group(); leaf.name = 'block'; g.add(leaf);
  const nbWall = fadeable(magicStandard({ color: 0xb9dd8a, transparent: true, opacity: 0.36, depthWrite: false, roughness: 0.6 }, { rim: 0xf0ffc8, rimK: 0.9 }));
  const nbChl = fadeable(magicStandard({ color: GREEN, transparent: true, opacity: 1, roughness: 0.55, emissive: 0x0d3a12, emissiveIntensity: 0.5 }, { rim: 0xc9ffb0, rimK: 0.6 }));
  const pal = [], palChl = [], nbNuc = [], extra = [], PX = 16350, PZ = 14200;      /* nbNuc: the nucleus of every other cell; extra: more materials that fade with the piece of leaf */
  for (let j = 0; j >= -4; j--) for (let i = -4; i <= 4; i++) {
    if (i === 0 && j === 0) continue;
    const x = i * PX + (j % 2 ? PX / 2 : 0) + (R() - 0.5) * 300, z = j * PZ + (R() - 0.5) * 300, k = 0.92 + R() * 0.13, sx = 0.94 + R() * 0.1, sz = 0.94 + R() * 0.1;
    if (Math.abs(x) > 4.3 * PX) continue;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((R() - 0.5) * 0.05, R() * 6.283, (R() - 0.5) * 0.05)), at = V(x, HL - HL * k, z), sc = V(sx, k, sz);
    pal.push({ p: at, q, s: sc });
    const Q = rng(100 + pal.length);
    /* every cell has a nucleus, against its wall, between its chloroplasts */
    const nu = { th: Q() * 6.283, y: (Q() - 0.5) * HL * 1.1, rho: RIN - 150 - S.nucleus / 2, r: S.nucleus / 2 + 300 };
    nbNuc.push({ p: onWall(nu).multiply(sc).applyQuaternion(q).add(at), q: null, s: V(S.nucleus * 0.42, S.nucleus / 2, S.nucleus / 2) });
    chloroplastSpots(Q, { keep: [nu] }).forEach(c => { { const u = 0.9 + Q() * 0.16; palChl.push({ p: onWall(c).multiply(sc).applyQuaternion(q).add(at), q: q.clone().multiply(flat(c.th)), s: V(S.chlThick, S.chl * u, S.chl * u) }); } });
  }
  const palWalls = many(capsuleGeo(() => R0, HL, 28, 6), nbWall, pal); palWalls.renderOrder = 2; leaf.add(palWalls);
  const palChls = many(lensGeo(10, 7), nbChl, palChl); leaf.add(palChls);
  /* spongy cells: on an uneven grid closer than their own width, so that each touches its neighbours; some places left
     empty (the air spaces), and the space above the tiny hole */
  const spo = [], spoChl = [], y1 = -HL - 1500, y0 = -HL - S.spongyLayer, GAP = 27500, GW = 16000, GL = 20600;
  const HOLE = V(PX * 1.5, y0 - S.epiLow / 2, 8200), CAVE = HOLE.clone().add(V(0, 21000, -1000));
  /* the tiny holes (stomata): a potato leaf has them on both sides, more below (231 per mm²) than above (100 per mm²:
     Stegner et al. 2022), so this piece (about 0.01 mm² of leaf) has two below and one above */
  const STOMA = [{ p: HOLE, down: true }, { p: V(-PX * 0.9, y0 - S.epiLow / 2, -41000), down: true }, { p: V(-PX * 1.5, HL + S.epiTop / 2, -30000), down: false }];
  const CAVES = STOMA.filter(o => o.down).map(o => o.p.clone().add(V(0, 21000, o === STOMA[0] ? -1000 : 0)));
  /* a vein (a small vascular bundle) runs through the piece, just under the palisade cells: water arrives in its wide
     empty tubes (xylem, above), sugar leaves in its narrow living tubes (phloem, below), and a ring of cells holds
     them (0610 6.2: "vascular bundles, xylem and phloem"; Daniel's slides 6.2 Leaf Structure 8 and 9). Drawn 58 µm
     across with xylem tubes 9 to 11 µm wide and phloem tubes 5 to 6 µm: a potato vein this small was not found
     measured, so no size of it is stated to pupils */
  const VEIN = { x: -PX * 2.75, y: y1 - 30000, r: 29000, z0: 6000, z1: -4.45 * PZ };
  for (let ky = 0; ky < 4; ky++) for (let kz = 0; kz >= -2; kz--) for (let kx = -3; kx <= 3; kx++) {
    const r = S.spongy / 2 * (0.9 + R() * 0.24), p = V((kx + ((ky + kz) % 2 ? 0.5 : 0)) * GAP + (R() - 0.5) * 4000, y1 - 14000 - ky * 26000 + (R() - 0.5) * 3000, kz * GAP * 0.95 + (R() - 0.5) * 4000 - 4000);
    if (R() < 0.2 || Math.abs(p.x) > 4.55 * PX - r * 0.5 || CAVES.some(c => p.distanceTo(c) < 19000) || Math.hypot(p.x - VEIN.x, p.y - VEIN.y) < VEIN.r + r * 0.4) continue;
    const k = [0.98 + R() * 0.2, 0.9 + R() * 0.18, 0.98 + R() * 0.2];
    spo.push({ p, r, e: r * 1.06, s: V(r * k[0], r * k[1], r * k[2]), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(R() * 3, R() * 3, R() * 3)) });
  }
  /* each cell is closed: where two were drawn into each other they move apart until they only press together (a small
     flat face of contact), and stay inside the layer */
  for (let n = 0; n < 60; n++) { for (let i = 0; i < spo.length; i++) for (let j = i + 1; j < spo.length; j++) { const A = spo[i], B = spo[j], d = B.p.clone().sub(A.p), L = d.length(), need = (A.e + B.e) * 0.94;
      if (L < need) { d.multiplyScalar((need - L) / 2 / L); A.p.sub(d); B.p.add(d); } }
    /* the air space above the tiny hole stays empty */
    spo.forEach(o => { CAVES.forEach(c => { const d = o.p.clone().sub(c), L = d.length(); if (L < 17500) o.p.addScaledVector(d, (17500 - L) / L); });
      /* and no cell lies inside the vein */
      const dx = o.p.x - VEIN.x, dy = o.p.y - VEIN.y, L = Math.hypot(dx, dy), need = VEIN.r + o.e * 0.9; if (L < need) { o.p.x += dx / L * (need - L); o.p.y += dy / L * (need - L); } });
    spo.forEach(o => { o.p.y = Math.min(y1 - o.e * 0.95, Math.max(y0 + o.e * 0.98, o.p.y)); o.p.x = Math.max(-4.6 * PX + o.e * 0.6, Math.min(4.6 * PX - o.e * 0.6, o.p.x)); o.p.z = Math.max(-4.4 * PZ + o.e * 0.5, Math.min(1500, o.p.z)); }); }
  spo.forEach(o => { for (let k = 0; k < 11; k++) { const u = R() * 2 - 1, a = R() * 6.283, w = Math.sqrt(1 - u * u), n = V(w * Math.cos(a), u, w * Math.sin(a)), c = o.p.clone().addScaledVector(n, o.r * 0.76);
      /* a chloroplast lies against its own cell's wall, never inside the next cell */
      if (spo.some(q => q !== o && q.p.distanceTo(c) < q.e * 1.02)) continue;
      spoChl.push({ p: c, q: new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), n), s: chlScale }); }
    { const u = R() * 2 - 1, a = R() * 6.283, w = Math.sqrt(1 - u * u); nbNuc.push({ p: o.p.clone().add(V(w * Math.cos(a), u, w * Math.sin(a)).multiplyScalar(o.r * 0.5)), q: null, s: V(S.nucleus / 2, S.nucleus / 2, S.nucleus / 2) }); } });
  const blob = new THREE.IcosahedronGeometry(1, 3);
  { const P = blob.attributes.position, v = V(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).normalize(); const k = 0.9 + 0.3 * Math.sin(v.x * 2.6 + v.y * 1.9 + 0.7) * Math.sin(v.z * 2.9 - v.x * 1.5) + 0.07 * Math.sin(v.y * 5 + v.z * 4);      /* a spongy cell is lobed: its arms touch the next cells, and air lies between */ P.setXYZ(i, v.x * k, v.y * k, v.z * k); } blob.computeVertexNormals(); }
  const spoMat = fadeable(magicStandard({ color: 0xa9d47c, transparent: true, opacity: 0.52, depthWrite: false, roughness: 0.6 }, { rim: 0xf0ffc8, rimK: 0.9 })); extra.push(spoMat);
  const spoWalls = many(blob, spoMat, spo); spoWalls.renderOrder = 2; leaf.add(spoWalls);
  const spoChls = many(lensGeo(10, 7), nbChl, spoChl); leaf.add(spoChls);
  /* the two skins: one layer each of flat clear cells with no chloroplasts, joined edge to edge, the outer face domed */
  const epiMat = fadeable(magicStandard({ color: 0xd8f0e0, transparent: true, opacity: 0.34, depthWrite: false, roughness: 0.3 }, { rim: 0xffffff, rimK: 0.9 }));
  const epi = [], box = new THREE.BoxGeometry(1, 1, 1, 6, 2, 6);
  { const P = box.attributes.position, v = V(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const dome = (1 - 4 * v.x * v.x) * (1 - 4 * v.z * v.z); P.setXYZ(i, v.x, v.y > 0 ? v.y + 0.28 * dome : v.y, v.z); } box.computeVertexNormals(); }
  const flip = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), Math.PI);
  const wax = { up: [], down: [] };
  const tile = (yc, th, w, d, down) => {
    const X0 = -4.55 * PX, X1 = 4.55 * PX + 2000, Z0 = 8200, Z1 = -4.5 * PZ, cols = [], here = STOMA.filter(o => o.down === down).sort((a, b) => a.p.x - b.p.x);
    const parts = (a, b, w0) => { const n = Math.max(1, Math.round(Math.abs(b - a) / w0)), ws = Array.from({ length: n }, () => 0.75 + R() * 0.5), sum = ws.reduce((p, q) => p + q, 0); let x = a; return ws.map(k => { const wx = (b - a) * k / sum, o = [x, wx]; x += wx; return o; }); };
    /* each tiny hole has its own narrow column of cells: its two cells fill their place in it, joined to the cells round them */
    let x = X0; here.forEach(o => { parts(x, o.p.x - GW / 2, w).forEach(c => cols.push([c[0], c[1], null])); cols.push([o.p.x - GW / 2, GW, o]); x = o.p.x + GW / 2; }); parts(x, X1, w).forEach(c => cols.push([c[0], c[1], null]));
    const put = (x, wx, z, dz) => { const p = V(x + wx / 2, yc, z + dz / 2); epi.push({ p, q: down ? flip : null, s: V(wx, th, Math.abs(dz)) });
      (down ? wax.down : wax.up).push({ p: V(p.x, yc + (down ? -1 : 1) * (th / 2 + 500), p.z), q: down ? flip : null, s: V(wx, 1, Math.abs(dz)) });
      nbNuc.push({ p: V(p.x + (R() - 0.5) * wx * 0.4, yc - (down ? -1 : 1) * th * 0.18, p.z + (R() - 0.5) * Math.abs(dz) * 0.4), q: null, s: V(S.nucleus / 2, S.nucleus * 0.3, S.nucleus / 2) }); };
    cols.forEach(([x, wx, slot]) => { if (!slot) { parts(Z0, Z1, d).forEach(c => put(x, wx, c[0], c[1])); return; }
      const za = slot.p.z + GL / 2, zb = slot.p.z - GL / 2; if (Z0 - za > 3000) parts(Z0, za, d).forEach(c => put(x, wx, c[0], c[1])); parts(zb, Z1, d).forEach(c => put(x, wx, c[0], c[1])); }); };
  tile(HL + S.epiTop * 0.42, S.epiTop * 0.84, 36000, 32000, false); tile(y0 - S.epiLow * 0.42, S.epiLow * 0.84, 30000, 27000, true);
  const epis = many(box, epiMat, epi); epis.renderOrder = 2; leaf.add(epis);
  /* the cuticle: a thin layer of wax over the outside of both skins (0610 6.2; Daniel's slide 6.2 Leaf Structure 8),
     drawn 1 µm thick (no measured value for potato was read: not stated to pupils), on every cell of the skin */
  const waxMat = fadeable(magicStandard({ color: 0xf3e6a8, transparent: true, opacity: 0.42, depthWrite: false, roughness: 0.15 }, { rim: 0xfff8d8, rimK: 0.45 })); extra.push(waxMat);
  const waxSlab = th => { const b = new THREE.BoxGeometry(1, 1000, 1, 6, 1, 6), P = b.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i); P.setY(i, P.getY(i) + 0.28 * th * (1 - 4 * x * x) * (1 - 4 * z * z)); } b.computeVertexNormals(); return b; };
  const waxUp = many(waxSlab(S.epiTop * 0.84), waxMat, wax.up), waxDown = many(waxSlab(S.epiLow * 0.84), waxMat, wax.down); waxUp.renderOrder = waxDown.renderOrder = 3; leaf.add(waxUp, waxDown);
  /* each tiny hole: two small bean-shaped cells in the skin (guard cells: the only cells of the skin with
     chloroplasts), joined all round to the cells of the skin, a slit between them */
  const guardMat = fadeable(magicStandard({ color: 0xa8e08c, transparent: true, opacity: 0.62, depthWrite: false, roughness: 0.5 }, { rim: 0xe6ffd0, rimK: 0.9 }));
  const slitMat = fadeable(new THREE.MeshBasicMaterial({ color: 0x05070f, transparent: true, opacity: 0.92 }));
  const guardChl = [];
  /* the hole at the front is cut in half by the piece's own front face, as in a section: its two cells show as two
     ovals with the slit between them (the second check of the shapes: it seemed to hang off the edge) */
  const faceCut = new THREE.Plane(V(0, 0, -1), 8200);
  const guardCut = fadeable(magicStandard({ color: 0xa8e08c, transparent: true, opacity: 0.62, depthWrite: false, roughness: 0.5, clippingPlanes: [faceCut] }, { rim: 0xe6ffd0, rimK: 0.9 })); extra.push(guardCut);
  const slitCut = fadeable(new THREE.MeshBasicMaterial({ color: 0x05070f, transparent: true, opacity: 0.92, clippingPlanes: [faceCut] })); extra.push(slitCut);
  const capMat2 = fadeable(new THREE.MeshBasicMaterial({ color: 0x8fd070, transparent: true, opacity: 0.95, side: THREE.DoubleSide })); extra.push(capMat2);
  const nucDot = fadeable(new THREE.MeshBasicMaterial({ color: PAL.nucleus, transparent: true, opacity: 0.95 })), chlDot = fadeable(new THREE.MeshBasicMaterial({ color: 0x2f8f3a, transparent: true, opacity: 0.95 })); extra.push(nucDot, chlDot);
  STOMA.forEach((o, si) => { const th = o.down ? S.epiLow : S.epiTop, front = si === 0;
    [-1, 1].forEach(k => { const m = new THREE.Mesh(new THREE.TorusGeometry(4300, 2800, 12, 24, Math.PI), front ? guardCut : guardMat); m.position.copy(o.p).add(V(k * 800, 0, 0)); m.rotation.set(Math.PI / 2, 0, k > 0 ? -Math.PI / 2 : Math.PI / 2); m.scale.set(1.45, 1, 1.5); m.renderOrder = 4; leaf.add(m);
      /* its chloroplasts (smaller than a palisade cell's) and its nucleus, inside the bean */
      if (front) { const c = new THREE.Mesh(new THREE.CircleGeometry(1, 24), capMat2); c.position.copy(o.p).add(V(k * (800 + 4300), 0, -8)); c.scale.set(2800, 4200, 1); c.renderOrder = 5; leaf.add(c);
        /* what the cut shows inside each of the two cells: its nucleus and two of its chloroplasts (never a plain oval) */
        [[0, 900, 1000, 1000, nucDot], [-700, -1700, 620, 950, chlDot], [800, -1100, 620, 950, chlDot]].forEach(([dx, dy, rx, ry, mat]) => { const d = new THREE.Mesh(new THREE.CircleGeometry(1, 16), mat); d.position.copy(o.p).add(V(k * (800 + 4300) + dx, dy, -4)); d.scale.set(rx, ry, 1); d.renderOrder = 6; leaf.add(d); }); }
      (front ? [-0.95, -0.4] : [-0.95, -0.35, 0.45, 1.0]).forEach(a => guardChl.push({ p: o.p.clone().add(V(k * (800 + 4300 * Math.cos(a)), (a * 7 % 1) * 900, 4300 * 1.45 * Math.sin(a))), q: null, s: V(1500, 2600, 3000) }));
      nbNuc.push({ p: o.p.clone().add(V(k * (800 + 4300), 300, front ? -2600 : 600)), q: null, s: V(1900, 1900, 2300) }); });
    const slit = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), front ? slitCut : slitMat); slit.position.copy(o.p); slit.scale.set(1700, th * 0.42, 4300); leaf.add(slit); });
  leaf.add(many(lensGeo(10, 7), nbChl, guardChl));
  /* the nucleus of every cell of the piece: palisade, spongy, skin and guard cells */
  const nbNucMat = fadeable(magicStandard({ color: PAL.nucleus, transparent: true, opacity: 0.72, roughness: 0.5, emissive: 0x1a1460, emissiveIntensity: 0.6 }, { rim: PAL.envelope, rimK: 0.7 })); extra.push(nbNucMat);
  leaf.add(many(new THREE.SphereGeometry(1, 14, 10), nbNucMat, nbNuc));
  /* ---- the vein ---- */
  const veinG = new THREE.Group(); veinG.position.set(VEIN.x, VEIN.y, 0); leaf.add(veinG);
  { const LZ = VEIN.z0 - VEIN.z1, ZC = (VEIN.z0 + VEIN.z1) / 2, alongZ = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI / 2);
    /* xylem: wide tubes with thick walls and nothing inside (their ends are open at the cut), with rings that stiffen them */
    const xyMat = fadeable(magicStandard({ color: 0xf0cdbf, transparent: true, opacity: 1, roughness: 0.5, side: THREE.DoubleSide, emissive: 0x4a1a14, emissiveIntensity: 0.35 }, { rim: 0xffe9e0, rimK: 0.6 })); extra.push(xyMat);
    const ringMat = fadeable(magicStandard({ color: 0xc8566a, transparent: true, opacity: 1, roughness: 0.5, emissive: 0x4a0c18, emissiveIntensity: 0.5 }, { rim: 0xffc0cc, rimK: 0.6 })); extra.push(ringMat);
    const XY = [[-9500, 9000, 5200], [1000, 13000, 5500], [11000, 8500, 4800], [-4000, 800, 4500], [6500, -300, 4600], [-14500, 500, 4200], [15500, -1000, 3900]], rings = [];
    veinG.add(many(new THREE.CylinderGeometry(1, 1, 1, 18, 1, true), xyMat, XY.map(([x, y, r]) => ({ p: V(x, y, ZC), q: alongZ, s: V(r, LZ, r) }))));
    XY.forEach(([x, y, r], i) => { for (let z = VEIN.z0 - 1500 - (i % 3) * 1500; z > VEIN.z1; z -= 5200) rings.push({ p: V(x, y, z), q: null, s: V(r * 0.93, r * 0.93, 900) }); });
    veinG.add(many(new THREE.TorusGeometry(1, 0.13, 6, 18), ringMat, rings));
    /* phloem: narrow living tubes, under the xylem */
    const phMat = fadeable(magicStandard({ color: 0x57b9c6, transparent: true, opacity: 1, roughness: 0.5, emissive: 0x0c3a44, emissiveIntensity: 0.5 }, { rim: 0xc8f6ff, rimK: 0.7 })); extra.push(phMat);
    const PH = []; for (let i = 0; i < 400 && PH.length < 15; i++) { const a = R() * 6.283, d = Math.sqrt(R()) * 10500, x = d * Math.cos(a) * 1.25, y = -13500 + d * Math.sin(a) * 0.7, r = 2400 + R() * 700; if (PH.some(o => Math.hypot(o[0] - x, o[1] - y) < o[2] + r + 250)) continue; PH.push([x, y, r]); }
    veinG.add(many(new THREE.CylinderGeometry(1, 1, 1, 12), phMat, PH.map(([x, y, r]) => ({ p: V(x, y, ZC - 400), q: alongZ, s: V(r, LZ - 800, r) }))));
    /* the ring of cells that holds them (they have a few chloroplasts) */
    const sheath = [], shChl = [], NS = 12;
    for (let row = 0; row < 3; row++) for (let i = 0; i < NS; i++) { const a = (i + (row % 2) * 0.5) / NS * 6.283, rr = VEIN.r - 6600, c = V(rr * Math.cos(a) * 1.02, rr * Math.sin(a) * 0.96, VEIN.z0 - 12500 - row * 23500 + (i % 2) * 1500);
        if (c.z - 12000 < VEIN.z1) c.z = VEIN.z1 + 12000;
        sheath.push({ p: c, q: null, s: V(7300, 7300, 12400) });
        [0.7, -0.6].forEach(k => shChl.push({ p: c.clone().add(V(Math.cos(a) * 3900, Math.sin(a) * 3900, k * 6500)), q: new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), V(Math.cos(a), Math.sin(a), 0)), s: V(1500, 3600, 3600) })); }
    const shMat = fadeable(magicStandard({ color: 0xcfe0a4, transparent: true, opacity: 0.66, depthWrite: false, roughness: 0.6 }, { rim: 0xf6ffd8, rimK: 0.8 })); extra.push(shMat);
    const sh = many(new THREE.SphereGeometry(1, 16, 12), shMat, sheath); sh.renderOrder = 2; veinG.add(sh); veinG.add(many(lensGeo(10, 7), nbChl, shChl));
    VEIN.xylem = XY; VEIN.phloem = PH; VEIN.sheath = sheath.length; }
  /* light from above: soft beams that fall on the top of the leaf */
  const beamMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uOn: { value: 1 }, uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uOn; uniform float uTime; varying vec2 vUv;
      void main() { float side = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x); float fall = 0.55 + 0.45 * sin(vUv.y * 9.0 + uTime * 2.2);
        float a = side * side * (0.09 + 0.07 * fall) * smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.6, vUv.y) * uOn; gl_FragColor = vec4(vec3(1.0, 0.86, 0.46) * a * 1.5, a); }` });
  const beams = new THREE.Group(); leaf.add(beams);
  [-3.2, -1.7, -0.2, 1.4, 3.0].forEach((k, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(17000, 200000), beamMat); m.position.set(k * PX, 34000, -1.6 * PZ + (i % 2) * 14000); m.rotation.y = 0.2 * (i - 2); beams.add(m); });
  /* the same light inside the cell and the chloroplast: one soft beam down the cut */
  const beamIn = new THREE.Mesh(new THREE.PlaneGeometry(9000, 2 * HL + 60000), beamMat); beamIn.position.set(-4200, 20000, -3500); g.add(beamIn);

  /* your salivary gland cell, for its size only: a pale outline beside the palisade cell, at the same scale */
  const sal = new THREE.Group(); sal.position.set(R0 + 15000, -HL + 9500, 0); g.add(sal);
  const salMat = fadeable(magicStandard({ color: 0xf2b08a, transparent: true, opacity: 0.55, depthWrite: false, roughness: 0.45, emissive: 0x4a2412, emissiveIntensity: 0.35 }, { rim: 0xffe8d6, rimK: 1.1 }), 0.55);
  const salBody = new THREE.Mesh(new THREE.SphereGeometry(S.salivary / 2, 40, 28), salMat); salBody.scale.set(1, 1.05, 1); sal.add(salBody);
  const salNuc = new THREE.Mesh(new THREE.SphereGeometry(3000, 28, 20), fadeable(magicStandard({ color: PAL.nucleus, transparent: true, opacity: 0.8, roughness: 0.4 }, { rim: PAL.envelope, rimK: 1 }), 0.8)); salNuc.position.set(0, -2800, 0); salNuc.renderOrder = 6; salBody.renderOrder = 7; sal.add(salNuc);

  /* ================= the knobs, and what each does to the picture ================= */
  const WALLC = new THREE.Color(WALL);
  const knobs = { cam: 0, open: 0, ghost: 0, sal: 0, day: 1, hi: 0, hiC: 0, hiW: 0, hiV: 0, ps: 0, chain: 0, grain: 0, firm: 1, push: 0 };
  const setOp = (m, k) => { const row = mats.find(x => x[0] === m); m.opacity = row[1] * k; m.visible = m.opacity > 0.004; };
  const worldOf = (obj, p) => obj.localToWorld(p.clone());
  g.updateMatrixWorld(true);
  const HCW = worldOf(hc, V(0, 0, 0)), SITEW = worldOf(site, V(0, 0, 0)), WSW = worldOf(ws, V(0, 0, 0)), GRAINW = worldOf(hc, grain.position);
  /* arrows of the cell sap's push on the wall, drawn only while the cell is firm (step: the vacuole) */
  const arrows = new THREE.Group(); hero.add(arrows);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xe6f2ff, transparent: true, opacity: 0, depthWrite: false, depthTest: false }); 
  [-22000, -8000, 6000, 20000].forEach(y => [-1, 1].forEach(sd => {
    const a = new THREE.Group(), sh = new THREE.Mesh(new THREE.CylinderGeometry(300, 300, 3000, 10), arrowMat), hd = new THREE.Mesh(new THREE.ConeGeometry(820, 1700, 14), arrowMat);
    sh.rotation.z = Math.PI / 2; hd.rotation.z = -sd * Math.PI / 2; hd.position.x = sd * 2300; a.add(sh, hd); a.position.set(sd * 2600, y, 500); a.userData.sd = sd; arrows.add(a); }));

  /* the firm cell's own outline, left as a dotted line when the cell has lost water (so the change can be seen) */
  const firmLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ring2(() => R0, HL).map(p => V(p.x, p.y, 40))), new THREE.LineDashedMaterial({ color: 0xfff6d0, dashSize: 900, gapSize: 700, transparent: true, opacity: 0 }));
  firmLine.computeLineDistances(); firmLine.renderOrder = 9; firmLine.visible = false; g.add(firmLine);
  function draw(K, t) {
    const d = stage.view.dist;
    cut.constant = 20000 * (1 - smooth(0.25, 1, K.open));
    /* the front half's chloroplasts fade just before the cut passes; closed and far, the hero looks like the cells round it */
    setOp(frontMat, 1 - smooth(0, 0.28, K.open)); frontChl.visible = K.open < 0.3;
    const focus = Math.max(smooth(0, 1, K.ghost), smooth(0, 1, K.open));
    wallMat.color.setHex(0xb9dd8a).lerp(WALLC, focus); setOp(vacMat, 0.15 + 0.85 * focus); setOp(wallMat, 0.72 + 0.28 * focus); setOp(memMat, focus);
    const opened = K.open > 0.02;
    rim.visible = sapFace.visible = vacLine.visible = cytFace.visible = memLine.visible = opened; rim.position.z = cut.constant; wallLayers.forEach(m => { m.visible = opened && stage.pxPerNm() > 0.05; m.position.z = cut.constant + 2; }); layerMat.opacity = 0.85 * smooth(0.05, 0.12, stage.pxPerNm()); sapFace.position.z = cytFace.position.z = cut.constant - 10; memLine.position.z = vacLine.position.z = cut.constant + 4;
    { const w = Math.max(S.membrane, 2 / stage.pxPerNm()); memLine.fit(w); vacLine.fit(Math.max(S.membrane, 1.5 / stage.pxPerNm())); }
    /* the open chloroplast: whole (a lens like the others) until the cell is cut; then its front half is away too */
    /* the chloroplasts on the cut: whole (cut with the cell) until the cut has reached them, then each a half with its face */
    const cutDone = cut.constant < 60;
    face.visible = edge.visible = env.visible = cutDone; hcWhole.visible = rimWhole.visible = !cutDone; rimHalf.visible = rimFace.visible = rimEdge.visible = cutDone;
    /* the cells round the hero: clear, then pale, so that the one cell is seen alone */
    const gk = 1 - 0.93 * smooth(0, 1, K.ghost), far = smooth(26000, 60000, d);
    setOp(nbWall, gk * far); setOp(nbChl, gk * far); nbChl.depthWrite = gk > 0.5;   /* faint cells hide nothing that stands among them */ setOp(epiMat, gk * far); setOp(guardMat, gk * far); setOp(slitMat, gk * far); extra.forEach(m => setOp(m, gk * far));
    leaf.visible = far > 0.003;
    beamMat.uniforms.uOn.value = K.day * (1 - 0.7 * smooth(0, 1, K.ghost)); beamMat.uniforms.uTime.value = t;
    beams.visible = K.day > 0.01 && d > 60000; beamIn.visible = K.day > 0.01 && opened && d < 200000 && d > 9000;
    /* the salivary gland cell, for its size */
    setOp(salMat, K.sal); setOp(salNuc.material, K.sal); sal.visible = K.sal > 0.01;
    /* which structure is lit (the three that an animal cell does not have): the others dim a little */
    const any = Math.max(K.hiC, K.hiW, K.hiV);
    setLook(chloroplasts, { lit: K.hiC * 0.9, sleep: any * (1 - K.hiC) * 0.55 }); rimFaceMat.color.setHex(K.hiC > 0.5 ? 0xffffff : any > 0.5 ? 0x8c8c8c : 0xd8d8d8); setLook(env, { lit: K.hiC * 0.9, sleep: any * (1 - K.hiC) * 0.55 });
    setLook(wall, { lit: K.hiW * 0.55, sleep: 0 }); rimMat.color.setHex(K.hiW > 0.5 ? WALL_LIT : WALL_CUT);
    setLook(vacuole, { lit: K.hiV * 0.8, sleep: 0 }); sapMat.opacity = (0.24 + 0.24 * K.hiV - 0.12 * Math.max(K.hiC, K.hiW)) * (opened ? 1 : 0); cytMat.opacity = 0.26 * (opened ? 1 : 0); memLineMat.opacity = opened ? 1 : 0;
    setLook(nucleus, { sleep: any * 0.55 }); setLook(mitos, { sleep: any * 0.55 });
    /* firm or soft: the cell sap pushes on the wall; with less water the whole cell is a little smaller and no longer firm */
    const f = 0.94 + 0.06 * K.firm; hero.scale.set(f, 0.99 + 0.01 * K.firm, f);
    arrowMat.opacity = 0.9 * K.push * (0.45 + 0.55 * K.firm); arrows.visible = arrowMat.opacity > 0.01;
    arrows.children.forEach(a => a.scale.setScalar(0.42 + 0.58 * K.firm));
    firmLine.visible = K.push > 0.5 && K.firm < 0.97; firmLine.material.opacity = 0.9 * (1 - K.firm);
    arrows.children.forEach((a, i) => { a.renderOrder = 8; a.position.x = a.userData.sd * (2300 + 700 * (0.5 + 0.5 * Math.sin(t * 2.4 + i))); });
    /* close up: the chloroplast's inside, then the molecules; the wall's fibres */
    const inC = smooth(60000, 22000, d);
    thyl.visible = sheet.visible = inC > 0.01 && opened; grain.visible = K.grain > 0.01 && opened; grain.scale.set(300 * K.grain, 800 * K.grain, 650 * K.grain);
    const nm = smooth(900, 220, d) * (stage.view.at.distanceTo(SITEW) < 4000 ? 1 : 0);
    site.visible = nm > 0.01; thyl.visible = sheet.visible = thyl.visible && nm < 0.6;
    if (site.visible) {
      back.material.opacity = 0.94 * nm; lumen.material.opacity = 0.7 * nm;
      /* ps 0 … 1: the water goes to the membrane and the carbon dioxide to the enzymes; a pulse of energy passes from the
         membrane to the enzymes. 1 … 2: oxygen comes away from the membrane; glucose comes from the enzymes */
      const a = smooth(0, 1, K.ps), b = smooth(1, 2, K.ps);
      co2.forEach((m, i) => { m.visible = b < 0.02; m.position.copy(CO2_0[i]).lerp(MEET, smooth(0.25 + i * 0.05, 0.85 + i * 0.03, a)).add(V(0, 0.14 * Math.sin(t * 1.3 + i), 0)); m.rotation.z = t * 0.5 + i; m.scale.setScalar(Math.max(0.001, 1 - smooth(0.92, 1, a))); });
      h2o.forEach((m, i) => { m.visible = a < 0.995; m.position.copy(H2O_0[i]).lerp(H2O_1[i], smooth(i * 0.05, 0.5 + i * 0.05, a)).add(V(0, 0.12 * Math.sin(t * 1.5 + i * 2) * (1 - a), 0)); m.rotation.z = t * 0.6 + i; m.scale.setScalar(Math.max(0.001, 1 - smooth(0.7, 0.9, a))); });
      glu.visible = b > 0.02 && K.chain < 0.02; glu.position.copy(MEET).lerp(GLU_1, smooth(0.25, 1, b)); glu.rotation.set(0.3, 0.78 + 0.2 * Math.sin(t * 0.6), 0); glu.scale.setScalar(Math.max(0.001, smooth(0, 0.25, b)));
      o2.forEach((m, i) => { m.visible = b > 0.02; m.position.copy(O2_0[i]).lerp(O2_1[i], smooth(i * 0.05, 0.6 + i * 0.07, b)); m.rotation.z = t * 0.7 + i; m.scale.setScalar(Math.max(0.001, smooth(0, 0.2, b))); });
      flash.material.opacity = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (K.ps - 0.8) / 0.45)))) * 0.75;
      lightWash.material.opacity = 0.085 * K.day * nm;
      pulse.position.set(4.2, PROT_Y[2], 1).lerp(MEET, smooth(0.45, 0.85, a)); pulse.material.opacity = 0.85 * Math.sin(Math.PI * Math.min(1, Math.max(0, (K.ps - 0.4) / 0.5))) * (K.ps < 1 ? 1 : 0);
      chlProt.forEach((p, i) => p.traverse(o => { if (o.isMesh) o.material.emissiveIntensity = 0.25 + K.day * (1.3 + 0.5 * Math.sin(t * 3 + i * 2)); }));
      /* the chain: the glucose just made is its first ring; the others join one by one */
      chainT.forEach((m, i) => { const k = i === 0 ? smooth(0, 0.06, K.chain) : smooth(i / chainN, (i + 1) / chainN, K.chain); m.visible = k > 0.01;
        m.position.copy(i === 0 ? GLU_1 : chainFrom(i)).lerp(chainAt(i), k); m.rotation.copy(chainTilt(i)); });
    }
    /* the thin sheets that stand for the wall and its membrane from far away give way to the fibres and the lipids */
    const nw = smooth(5200, 1400, d) * (stage.view.at.distanceTo(WSW) < 6000 ? 1 : 0), nl = smooth(700, 180, d) * nw;
    ws.visible = nw > 0.01; fib.visible = fib2.visible = nw > 0.01; wmem.visible = nl > 0.02; wprot.forEach(t => { t.visible = nl > 0.02; }); wfilm.material.opacity = 0.6 * nw * (1 - nl);
    slabs.forEach((s, i) => { s.material.opacity = SLAB[i] * nw; }); wcyto.visible = nw > 0.5;
    rimMat.opacity = 1 - nw; memLineMat.opacity *= 1 - nl; if (nw > 0.01) wallMat.opacity *= 1 - 0.75 * nw;
    /* far from the cell, the motes of the cytoplasm would be dots larger than a chloroplast: they show only near */
    cyto.visible = opened && d < 240000 && d > 900;
  }
  /* the open chloroplast before the cell is cut: a whole lens like the others */
  const hcWhole = new THREE.Mesh(lensGeo(22, 14), wholeMat); hcWhole.position.copy(onWall(HC)); hcWhole.quaternion.copy(flat(HC.th)); hcWhole.scale.copy(chlScale); hero.add(hcWhole);

  /* ================= views (at, dist, dir towards the camera, up) ================= */
  const D = (x, y, z) => V(x, y, z).normalize(), UP = V(0, 1, 0);
  const blockMid = V(0, (HL + S.epiTop + y0 - S.epiLow) / 2 + 26000, -1.2 * PZ);
  const views = [
    /* 0 the piece of leaf */      { zoom: 8, at: blockMid, dist: 560000, dir: D(0.34, 0.2, 1), up: UP, fit: { pts: [[4.6 * PX, 164000, 30000]], min: 380000 } },
    /* 1 one palisade cell */      { zoom: 20, at: V(11000, -1000, 0), dist: 175000, dir: D(0.1, 0.08, 1), up: UP, fit: { pts: [[36000, HL + 4000, 9000]], min: 120000 } },
    /* 2 the cell cut open */      { zoom: 20, at: V(0, 0, -1500), dist: 150000, dir: D(0.1, 0.05, 1), up: UP, fit: { pts: [[R0 + 1500, HL + 2500, 2000]], min: 110000 } },
    /* 3 one chloroplast */        { at: HCW.clone().add(V(300, 0, 0)), dist: 15500, dir: D(0.05, 0.04, 1), up: UP, fit: { pts: [[1900, 3100, 300]], min: 11000 } },
    /* 4 the molecules */          { zoom: 4, at: worldOf(site, V(-2.0, 0.2, 0)), dist: 31, dir: D(0.02, 0.02, 1), up: UP, fit: { pts: [[8.8, 6.4, 3]], min: 23 } },
    /* 5 the starch grain */       { at: GRAINW.clone(), dist: 5600, dir: D(0.06, 0.05, 1), up: UP },
    /* 6 the wall: its fibres */   { at: WSW.clone().add(V(-70, 0, -40)), dist: 1500, dir: D(0.03, 0.04, 1), up: UP, fit: { pts: [[330, 300, 40]], min: 1100 } },
    /* 7 the wall and membrane */  { zoom: 4, at: WSW.clone().add(V(S.wall / 2 - 22, 0, -4)), dist: 150, dir: D(0.02, 0.03, 1), up: UP, fit: { pts: [[40, 26, 6]], min: 110 } },
    /* 8 the vacuole (the cell) */ { zoom: 20, at: V(0, 0, -1500), dist: 150000, dir: D(-0.08, 0.05, 1), up: UP, fit: { pts: [[R0 + 1500, HL + 2500, 2000]], min: 110000 } }
  ];

  /* ================= names: each on ONE level line that ends on its part ================= */
  const W = (x, y, z) => V(x, y, z);
  /* a name of the edge has a point every 2.5 µm along it (the pupil may zoom anywhere), its usual place first */
  const EDGE_Y = [14000, 9000, 19000], MEM_Y = [26000, 21000, 30000]; for (let y = -31000; y <= 31000; y += 2500) { EDGE_Y.push(y + 600); MEM_Y.push(y - 600); }
  const rimPts = (sd, ys) => ys.map(y => W(sd * (R0 - S.wall / 2), y, cut.constant < 100 ? 0 : R0));
  const chlPts = () => spots.filter(c => Math.sin(c.th) < -0.55).slice(0, 9).map(c => onWall(c).add(V(0, 0, S.chlThick / 2 + 20)));
  /* where an air space is, for its IGCSE name: a gap that the first view shows as a gap. For each point of the spongy
     layer near the front, the line of sight through it (the first view's direction) must pass clear of every spongy
     cell, of the vein and of the two skins: then the dark background shows there, between the cells. The clearest
     few, well apart (worked out once); if the piece had none, the space above the tiny hole */
  const AIR = (() => { const u = D(0.34, 0.2, 1), q = V();
    const off = (c, p) => q.copy(c).sub(p).cross(u).length();      /* how far a centre is from the line of sight through p */
    /* inside the piece (not at its open sides); first with the whole line of sight clear, else clear of the cells near the front */
    const find = front => { const cand = [];
      for (let x = -3.0 * PX; x <= 3.0 * PX; x += 2000) for (let y = y0 + 16000; y <= y1 - 8000; y += 2000) {
        const p = V(x, y, 6000); let d = 1e9; for (const o of spo) if (!front || o.p.z > -22000) d = Math.min(d, off(o.p, p) - o.r * 1.22);
        d = Math.min(d, off(V(VEIN.x, VEIN.y, p.z), p) - VEIN.r - 3000); if (d > 1500) cand.push([d, p]); }
      cand.sort((a, b) => b[0] - a[0]); const out = [];
      for (const c of cand) { if (out.length >= 5) break; if (out.every(o => o.distanceTo(c[1]) > 14000)) out.push(c[1]); }
      return out; };
    const a = find(false).concat(find(true));
    return a.length ? a : [CAVE.clone().add(V(0, -6000, 0))]; })();
  const labels = {
    light: { html: 'light', side: 'r', pts: () => [3.0, 1.4, -0.2].map((k, i) => W(k * PX, HL + S.epiTop + 34000, -1.6 * PZ + ((i === 0 ? 4 : i === 1 ? 3 : 2) % 2) * 14000)) },
    wax: { html: 'a thin layer of wax', htmlN: 'wax', side: 'r', pts: () => [2.4, 3.3, 1.5].map(k => W(k * PX, HL + S.epiTop * 0.84 + 700, 7800)) },
    vein: { html: 'a vein: water arrives, sugar leaves', htmlN: 'a vein', side: 'l', pts: () => [W(VEIN.x - 5000, VEIN.y + 3000, VEIN.z0), W(VEIN.x - 9000, VEIN.y + 8000, VEIN.z0), W(VEIN.x - 2000, VEIN.y - 9000, VEIN.z0)] },
    skin: { html: 'the top layer of the leaf', htmlN: 'top layer', side: 'l', pts: () => [-3.4, -2.2, -1].map(k => W(k * PX, HL + S.epiTop * 0.55, 6000)) },
    pal: { html: 'a palisade cell', side: 'l', pts: () => [W(-R0 + 600, 8000, 6500), W(-R0 + 600, -6000, 6500), W(-R0 + 600, 20000, 6500)] },
    spongy: { html: 'cells with air spaces between them', htmlN: 'air spaces', side: 'l', pts: () => spo.filter(o => o.p.z > -12000 && o.p.x < -8000).slice(0, 5).map(o => o.p.clone().add(V(0, 0, o.r * 0.9))) },
    hole: { html: 'a tiny hole: air enters here', htmlN: 'a tiny hole', side: 'r', pts: () => [HOLE.clone().add(V(0, 0, 0)), HOLE.clone().add(V(0, 2500, 0))] },
    one: { html: 'one palisade cell: <b>72 µm</b> long', htmlN: 'palisade cell: <b>72 µm</b>', side: 'l', pts: () => [W(-R0, 12000, 0), W(-R0, 2000, 0), W(-R0, 22000, 0)] },
    sal: { html: 'your salivary gland cell: <b>16 µm</b>', side: 'r', pts: () => [worldOf(sal, V(S.salivary / 2 - 300, 1500, 0)), worldOf(sal, V(S.salivary / 2 - 900, 3400, 0))] },
    /* the IGCSE names of the piece of leaf (0610 6.2.2: twelve), shown while the panel's IGCSE switch is on (view.js "the course layers");
       pin: the name's number on a phone, the same as in the step's key (text.js XKEY.leaf) */
    /* (small parts first: a name is placed in this order, and a small part has few places for its line) */
    xstoma: { html: 'stoma', pin: 12, cls: 'plv-xlab', side: 'r', pts: () => [HOLE.clone(), HOLE.clone().add(V(0, -2500, 0)), HOLE.clone().add(V(0, 2500, 0)), HOLE.clone().add(V(0, -5000, 0))] },
    xguard: { html: 'guard cell', pin: 11, cls: 'plv-xlab', side: 'l', pts: () => [HOLE.clone().add(V(-5100, 0, -200)), HOLE.clone().add(V(-5100, 1500, -200))] },
    xxylem: { html: 'xylem', pin: 6, cls: 'plv-xlab', side: 'l', pts: () => VEIN.xylem.slice().sort((a, b) => a[0] - b[0]).slice(0, 4).map(o => W(VEIN.x + o[0] - o[2] * 0.92, VEIN.y + o[1], VEIN.z0 - 200)) },
    xphloem: { html: 'phloem', pin: 7, cls: 'plv-xlab', side: 'l', pts: () => VEIN.phloem.slice().sort((a, b) => a[0] - b[0]).slice(0, 5).map(o => W(VEIN.x + o[0], VEIN.y + o[1], VEIN.z0 - 800)) },
    xbundle: { html: 'vascular bundle', pin: 5, cls: 'plv-xlab', side: 'l', pts: () => [2.15, 2.5, 2.85, 3.5].map(a => W(VEIN.x + (VEIN.r - 1500) * Math.cos(a), VEIN.y + (VEIN.r - 1500) * 0.96 * Math.sin(a), VEIN.z0 - 4000)) },
    xair: { html: 'air space', pin: 9, cls: 'plv-xlab', side: 'r', through: true, pts: () => AIR },
    xcut: { html: 'cuticle', pin: 1, cls: 'plv-xlab', side: 'r', pts: () => [2.4, 3.3, 1.5].map(k => W(k * PX, HL + S.epiTop * 0.84 + 700, 7800)) },
    xupper: { html: 'upper epidermis', pin: 2, cls: 'plv-xlab', side: 'l', pts: () => [-3.4, -2.2, -1].map(k => W(k * PX, HL + S.epiTop * 0.5, 6000)) },
    xlower: { html: 'lower epidermis', pin: 10, cls: 'plv-xlab', side: 'l', pts: () => [-3.3, -2.3, -1.3].map(k => W(k * PX, y0 - 400, -1.6 * PZ)).concat([-3.3, -2.3].map(k => W(k * PX, y0 - S.epiLow * 0.5, 8000))) },
    xpal: { html: 'palisade mesophyll', pin: 3, cls: 'plv-xlab', side: 'l', pts: () => [W(-R0 + 600, 8000, 6500), W(-R0 + 600, -6000, 6500), W(-R0 + 600, 20000, 6500)].map(p => p.add(V(-3 * PX, 0, 0))) },
    xchl: { html: 'chloroplasts', pin: 4, cls: 'plv-xlab', side: 'r', pts: () => palChl.filter(c => c.p.z > 4000 && c.p.x > 2.4 * PX && c.p.y > -22000 && c.p.y < 26000).slice(0, 10).map(c => c.p.clone()) },
    xspongy: { html: 'spongy mesophyll', pin: 8, cls: 'plv-xlab', side: 'r', pts: () => spo.filter(o => o.p.z > -12000 && o.p.x > 14000).slice(0, 6).map(o => o.p.clone().add(V(0, 0, o.r * 0.9))) },
    wall: { html: 'cell wall', side: 'r', pts: () => rimPts(1, EDGE_Y).concat(rimPts(-1, EDGE_Y)) },
    membrane: { html: 'cell membrane', side: 'r', pts: () => MEM_Y.map(y => W(RIN - 4, y, 0)).concat(MEM_Y.map(y => W(-RIN + 4, y, 0))) },
    cyto: { html: 'cytoplasm', side: 'r', pts: () => [-27000, -24000, -30000, 16000].map(y => W((vacR(0, y) + RIN) / 2, y, 0)) },
    nucleus: { html: 'nucleus', side: 'r', pts: () => [nucleus.position.clone().add(V(600, 0, NUC.r)), nucleus.position.clone().add(V(1400, 900, NUC.r * 0.9))] },
    golgi: { html: 'a stack of the Golgi apparatus', htmlN: 'Golgi apparatus', side: 'l', pts: () => golgiSpots.filter(G => Math.cos(G.th) < 0.2).slice(0, 4).map(G => onWall(G).add(V(-300, 0, 500))) },
    er: { html: 'ER: a fine net of tubes', htmlN: 'ER', side: 'r', pts: () => erPts.filter(p => p.distanceTo(HCW) < 5200 && p.distanceTo(HCW) > 2700 && p.z < -300 && p.x > HCW.x + 200).slice(0, 6) },
    mito: { html: 'mitochondrion', side: 'r', pts: () => mitoSpots.filter(m => Math.sin(m.th) < -0.5 && Math.cos(m.th) > -0.1).slice(0, 5).map(m => onWall(m).add(V(0, 0, 330))) },
    chl: { html: 'chloroplast', side: 'l', pts: () => [HCW.clone().add(V(-hx + 80, 400, 0)), HCW.clone().add(V(-hx + 300, 1500, 0))].concat(chlPts()) },
    vac: { html: 'permanent vacuole', side: 'r', pts: () => [W(2600, 4000, 0), W(3200, -3000, 0), W(2000, 12000, 0)] },
    sap: { html: 'cell sap', side: 'l', pts: () => [W(-1800, -20000, 0), W(-2400, -26000, 0), W(-1500, -12000, 0)] },
    chl1: { html: 'one chloroplast: <b>5 µm</b> long', htmlN: 'chloroplast: <b>5 µm</b>', side: 'l', pts: () => [HCW.clone().add(V(-hx * 0.86, 1200, 0)), HCW.clone().add(V(-hx * 0.7, 1700, 0))] },
    stacks: { html: 'a stack of membranes: it holds chlorophyll', htmlN: 'a stack of membranes', side: 'r', pts: () => grana.filter(G => !G.hidden).sort((a, b) => a.p.z - b.p.z).slice(0, 6).map(G => worldOf(hc, G.p.clone().add(V(0, 0, -G.r * 0.9)))) },
    stroma: { html: 'a watery liquid, with many enzymes', side: 'l', pts: () => [worldOf(hc, V(hx * 0.5, -hy * 0.72, 0)), worldOf(hc, V(hx * 0.4, hy * 0.72, 0))] },
    grain: { html: 'a starch grain', side: 'l', through: true /* it lies inside the chloroplast, drawn through its cut face */, pts: () => [GRAINW.clone().add(V(-120, 300, 0)), GRAINW.clone().add(V(-100, -200, 0))] },
    co2: { html: 'carbon dioxide', side: 'l', pts: () => co2.filter(m => m.visible).map(m => worldOf(site, m.position)) },
    h2o: { html: 'water', side: 'l', pts: () => h2o.filter(m => m.visible).map(m => worldOf(site, m.position)) },
    glu: { html: 'glucose', side: 'l', pts: () => glu.visible ? [worldOf(site, glu.position)] : [] },
    o2: { html: 'oxygen', side: 'l', pts: () => o2.filter(m => m.visible).map(m => worldOf(site, m.position)) },
    tmem: { html: 'a membrane of a stack: chlorophyll is in it', htmlN: 'chlorophyll is here', side: 'l', pts: () => [worldOf(site, V(3.7, -6.2, 0.4)), worldOf(site, V(3.7, 6.1, 0.4)), worldOf(site, V(3.7, -5.4, 0.4))] },
    enz: { html: 'enzymes', side: 'l', pts: () => [worldOf(site, V(-11.5, 2.6, 0.4)), worldOf(site, V(-12.4, -8.8, -1))] },
    starch: { html: 'glucose molecules joined in a chain: starch', htmlN: 'starch: a chain of glucose', side: 'r', pts: () => chainT.filter(m => m.visible).slice(5).map(m => worldOf(site, m.position)) },
    fibres: { html: 'cellulose fibres, each about <b>3 nm</b> wide', htmlN: 'cellulose fibres: <b>3 nm</b>', side: 'r', pts: () => fibres.filter(f => f.p.z > -60 && Math.abs(f.p.y) < 240).slice(0, 8).map(f => worldOf(ws, f.p)) },
    wall2: { html: 'cell wall: about <b>200 nm</b> thick', htmlN: 'cell wall: <b>200 nm</b>', side: 'l', pts: () => [worldOf(ws, V(-22, 210, -4)), worldOf(ws, V(-10, 120, -4))] },
    lam: { html: 'a thin layer joins the two walls', htmlN: 'a thin layer', side: 'l', pts: () => [worldOf(ws, V(-S.wall / 2 - 20, -40, -4)), worldOf(ws, V(-S.wall / 2 - 20, 60, -4))] },
    next: { html: 'the wall of the next cell', side: 'l', pts: () => [worldOf(ws, V(-S.wall / 2 - 40 - S.wall * 0.6, -160, -4)), worldOf(ws, V(-S.wall / 2 - 40 - S.wall * 0.5, -240, -4))] },
    wmem: { html: 'cell membrane: two layers of lipids, with proteins', htmlN: 'cell membrane', side: 'r', pts: () => [-9, 3, 12].map(y => worldOf(ws, V(S.wall / 2 + 2.9, y, 0.4))) },
    wwall: { html: 'cell wall', side: 'l', pts: () => [10, -4, 16].map(y => worldOf(ws, V(S.wall / 2 - 14, y, -6))) },
    wcyt: { html: 'cytoplasm', side: 'r', pts: () => [-14, 8, -4].map(y => worldOf(ws, V(S.wall / 2 + 20, y, -2))) }
  };

  /* the molecules no name may cover (the stage keeps every name and its line off these points) */
  const avoid = () => site.visible ? [...co2, ...h2o, ...o2, glu, ...chainT, ...enz].filter(m => m.visible).map((m, i) => ({ p: worldOf(site, m.position), id: 'm' + i })) : [];
  /* buttons that stand on a part (the view places them): where each one is */
  const hots = {
    chl: () => HCW.clone().add(V(0, 0, 200)), wall: () => W(R0 - S.wall / 2, 14000, 0), vac: () => W(0, -4000, 0),
    light: () => stage.view.dist > 2000 ? HCW.clone().add(V(4200, 3600, 0)) : worldOf(site, V(-9.4, 6.5, 0)),
    join: () => worldOf(site, V(-1.6, -5.4, 2)), water: () => W(R0 + 1800, 22000, 0)
  };

  /* ================= the steps' motion (their words: js/plant/text.js, by id) ================= */
  const steps = [
    { id: 'leaf', phases: [{ to: { cam: 0, ghost: 0, open: 0, day: 1 }, ms: 0 }], labs: { light: 1, skin: 2, pal: 1, spongy: 2, hole: 2, vein: 2, wax: 2 },
      labsX: { xcut: 1, xupper: 1, xpal: 1, xchl: 1, xbundle: 1, xxylem: 1, xphloem: 1, xspongy: 1, xair: 1, xlower: 1, xguard: 1, xstoma: 1 } },
    { id: 'cell', phases: [{ to: { ghost: 1 }, ms: 1400 }, { to: { cam: 1, sal: 1 }, ms: 3600 }], labs: { one: 1, sal: 1 } },
    { id: 'open', phases: [{ to: { sal: 0, cam: 2 }, ms: 1800 }, { to: { open: 1 }, ms: 2600 }], labs: { membrane: 1, cyto: 1, nucleus: 1, mito: 1, golgi: 2 } },
    { id: 'three', phases: [], labs: {},
      press: { all: [
        { id: 'chl', label: 'What is this?', at: 'chl', side: 'l', to: { hiC: 1, hiW: 0, hiV: 0 }, lab: 'chl' },
        { id: 'wall', label: 'What is this?', at: 'wall', side: 'r', to: { hiW: 1, hiC: 0, hiV: 0 }, lab: 'wall', labs: { membrane: 2 } },
        { id: 'vac', label: 'What is this?', at: 'vac', side: 'c', to: { hiV: 1, hiC: 0, hiW: 0 }, lab: 'vac' }] },
      end: { hiC: 0, hiW: 0, hiV: 0 }, endLabs: { chl: 1, wall: 1, vac: 1 } },
    { id: 'chloroplast', phases: [{ to: { hiC: 0, hiW: 0, hiV: 0, cam: 3 }, ms: 3800 }], labs: { chl1: 1, stacks: 1, stroma: 2, er: 2 } },
    { id: 'light', phases: [{ to: { day: 0 }, ms: 900 }, { to: { cam: 4 }, ms: 4200 }], labs: { co2: 1, h2o: 1, tmem: 1, enz: 1 },
      press: { toggle: { at: 'light', side: 'c', states: [
        { label: '☀ Light on', to: { day: 1 }, ms: 700, then: [{ to: { ps: 1 }, ms: 3200 }, { to: { ps: 2 }, ms: 2800 }], labs: { glu: 1, o2: 1, tmem: 2, enz: 1 }, say: 'on' },
        { label: '☾ Light off', to: { day: 0, ps: 0 }, ms: 900, labs: { co2: 1, h2o: 1 }, say: 'off' }] } },
      end: { day: 1, ps: 2 }, endLabs: { glu: 1, o2: 1 } },
    { id: 'starch', phases: [{ to: { day: 1, ps: 2 }, ms: 0 }],
      press: { all: [{ id: 'join', label: 'Join', at: 'join', side: 'r', to: { chain: 1 }, ms: 4200, labs: { starch: 1 } }] },
      end: { chain: 1 }, endLabs: { starch: 1 }, labs: { glu: 1 } },
    { id: 'grain', phases: [{ to: { cam: 5, grain: 0 }, ms: 3600 }, { to: { grain: 1 }, ms: 2600 }], labs: { grain: 1, stacks: 2 } },
    { id: 'wall', phases: [{ to: { cam: 2 }, ms: 2600 }, { to: { cam: 6 }, ms: 4200 }], labs: { wall2: 1, fibres: 1, next: 2, lam: 2 } },
    { id: 'membrane', phases: [{ to: { cam: 7 }, ms: 3200 }], labs: { wwall: 1, wmem: 1, wcyt: 1 } },
    { id: 'vacuole', phases: [{ to: { cam: 8 }, ms: 4200 }, { to: { push: 1, hiV: 0.6 }, ms: 900 }], labs: { vac: 1, sap: 1, wall: 2 },
      press: { toggle: { at: 'water', side: 'r', states: [
        { label: '💧 Lose water', to: { firm: 0, hiV: 0.2 }, ms: 2200, labs: { vac: 1 }, say: 'soft' },
        { label: '💧 Take in water', to: { firm: 1, hiV: 0.6 }, ms: 2200, labs: { vac: 1, sap: 1 }, say: 'firm' }] } },
      end: { firm: 1, push: 1, hiV: 0.6 }, endLabs: { vac: 1, sap: 1 } }
  ];

  /* what is drawn, measured from the shapes themselves (never from the numbers above), in nm: tools/plant-check.mjs
     compares each with its cited size */
  const span = (o, ax) => { const b = new THREE.Box3().setFromObject(o); return b.max[ax] - b.min[ax]; };
  const instSize = (m, i, local) => { const M = new THREE.Matrix4(); m.getMatrixAt(i, M); const sc = new THREE.Vector3().setFromMatrixScale(M); if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox; return (b.max[local] - b.min[local]) * sc[local]; };
  function measure() {
    const was = [site.visible, ws.visible, hcWhole.visible]; site.visible = ws.visible = hcWhole.visible = true; g.updateMatrixWorld(true);
    glu.scale.setScalar(1); o2.forEach(m => m.scale.setScalar(1));
    /* a molecule's own size, in its own frame (however it is turned) */
    const tok = t => { const b = new THREE.Box3(); t.children.filter(c => c.isMesh).forEach(c => { c.updateMatrix(); if (!c.geometry.boundingBox) c.geometry.computeBoundingBox(); b.union(c.geometry.boundingBox.clone().applyMatrix4(c.matrix)); }); const v = b.getSize(new THREE.Vector3()); return Math.max(v.x, v.y, v.z); };
    const out = {
      cellLen: span(wall, 'y') / hero.scale.y, cellW: span(wall, 'x') / hero.scale.x, salivary: span(salBody, 'x'),
      chloroplast: spots.reduce((a, _, i) => a + instSize(chloroplasts, i, 'y'), 0) / spots.length, chloroplastThick: spots.reduce((a, _, i) => a + instSize(chloroplasts, i, 'x'), 0) / spots.length, openChloroplast: 2 * hy, nucleus: span(nucleus, 'y') / hero.scale.y, mitoW: 2 * mitos.geometry.parameters.radius,
      wall: R0 - RIN, wallSlab: slabs[0].geometry.parameters.width, fibre: 2 * fib.geometry.parameters.radiusTop, granum: grana.reduce((a, G) => a + 2 * G.r, 0) / grana.length, thylakoid: S.thylakoid,
      glucose: tok(glu), co2: tok(co2[0]), o2: tok(o2[0]), water: tok(h2o[0]), chainStep: chainAt(1).distanceTo(chainAt(0)),
      vacuoleShare: (() => { /* the vacuole's share of the cell's volume, from the two shapes (slices up the cell) */ let v = 0, c = 0; for (let y = -HL + 200; y < HL - 200; y += 400) { const half = (HL - S.wall - 2400), cyl = half - S.vacBase, ry = Math.abs(y) <= cyl ? 1 : Math.sqrt(Math.max(0, 1 - ((Math.abs(y) - cyl) / S.vacBase) ** 2)); let a = 0; for (let k = 0; k < 48; k++) { const r = Math.abs(y) <= cyl ? vacR(k / 48 * 6.2832, y) : S.vacBase * ry; a += r * r; } v += Math.PI * a / 48; const cc = HL - RIN, rc = Math.abs(y) <= cc ? RIN : RIN * Math.sqrt(Math.max(0, 1 - ((Math.abs(y) - cc) / RIN) ** 2)); c += Math.PI * rc * rc; } return v / c; })(),
      chloroplasts: allSpots.length + 1, grana: grana.length, palisadeCells: pal.length + 1, spongyCells: spo.length, stomata: STOMA.length, stomataBelow: STOMA.filter(o => o.down).length, xylemTubes: VEIN.xylem.length, phloemTubes: VEIN.phloem.length, sheathCells: VEIN.sheath, nuclei: nbNuc.length + 1, cells: pal.length + 1 + spo.length + epi.length + 2 * STOMA.length, cuticle: wax.up.length + wax.down.length, skinCells: epi.length,
      xylemAbovePhloem: Math.min(...VEIN.xylem.map(o => o[1])) > Math.max(...VEIN.phloem.map(o => o[1])) - 6000, xylemWider: Math.min(...VEIN.xylem.map(o => o[2])) > Math.max(...VEIN.phloem.map(o => o[2])),
      /* the check of the shapes, 11 Nov 2026 */
      mitochondria: mitoSpots.length, sheets: sheets.length, sheetMax: Math.max(...sheets.map(o => Math.max(o.s.x, o.s.z))), rubisco: 2 * 5.5,
      spongyApart: Math.min(...spo.flatMap((A, i) => spo.slice(i + 1).map(B => A.p.distanceTo(B.p) / (A.e + B.e)))),
      strayChloroplasts: spoChl.filter(c => spo.filter(o => o.p.distanceTo(c.p) < o.e * 0.98).length > 1).length,
      cutFace: { wall: rimMat.color.getHex(), membrane: memLineMat.color.getHex(), sapColour: sapMat.color.getHex(), cytoColour: cytMat.color.getHex(), sap: sapMat.opacity, cyto: cytMat.opacity, shown: rim.visible && memLine.visible && cytFace.visible && sapFace.visible, memPx: Math.max(S.membrane, 2 / stage.pxPerNm()) * stage.pxPerNm(), chloroplastFaces: !!rimFaceMat.map, wallLayers: wallLayers.length },
      granaReach: Math.max(...grana.map(G => Math.hypot(G.p.y, G.p.z) / hy)), sapOpacity: mats.find(x => x[0] === vacMat)[1]
    };
    [site.visible, ws.visible, hcWhole.visible] = was; return out;
  }
  return { group: g, knobs, views, steps, labels, hots, draw, measure, avoid, narrowZoom: 1, turn: true,
    sizes: { cell: [S.cellLen, S.cellW], chloroplast: [S.chl, S.chlThick], wall: S.wall, fibre: S.fibre, chloroplasts: allSpots.length + 1, grana: grana.length, vacuoleBase: S.vacBase },
    dispose() { disposeGroup(g); } };
}
