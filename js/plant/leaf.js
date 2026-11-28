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
   dispose }. Every step can be shown from its start: the picture depends only on the knobs (and, for one bright
   thylakoid, on which names stand on the picture: named).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { magicStandard, sparkles, setLook, PAL } from '../world/magic.js?v=202611282133';
import { token, riboPart } from '../game/actors.js?v=202611282133';
import { bilayer } from '../ib/membrane.js?v=202611282133';
import { glow, smooth, disposeGroup, halo } from '../ib/stage.js?v=202611282133';
import { makeFilms } from './films.js?v=202611282133';
import { makeBath, PLAS } from './bath.js?v=202611282133';
import { makeMem, BOX as MBOX } from './memflow.js?v=202611282133';

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
  /* (18 Nov 2026, the science read: a sheet passed THROUGH the starch grain's place and, seen from the side, hid a
     third of the grain at night. A grain lies between the membranes, never through one: a sheet that would cut the
     grain's place ends before it, on the side where most of the sheet lies; one left too short is not drawn) */
  { const gp = V(-hx * 0.2, -hy * 0.36, hy * 0.42);
    sheets.forEach(o => { const dx = Math.abs(o.p.x - gp.x); if (dx > 345) return;
      const k = Math.sqrt(Math.max(0.04, 1 - (dx / 345) ** 2)), ry = 800 * k + 60, rz = 650 * k + 60, a = o.s.x / 2, b = o.s.z / 2;
      if (Math.abs(gp.z - o.p.z) > b + rz || Math.abs(gp.y - o.p.y) > a + ry) return;
      let y0 = o.p.y - a, y1 = o.p.y + a; if (o.p.y >= gp.y) y0 = Math.max(y0, gp.y + ry); else y1 = Math.min(y1, gp.y - ry);
      if (y1 - y0 < 300) { o.s.set(0, 0, 0); return; } o.p.y = (y0 + y1) / 2; o.s.x = y1 - y0; }); }
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
  /* ---- a course name pressed shows its part (17 Nov 2026; the chloroplast step's looks, below) ----
     the pigments: every membrane lit, the discs and the single sheets (draw).
     one thylakoid: the last flat sac of that stack on the viewer's right. While its name stands on the picture, that
     one sac is bright (the name's line ends on it: a thylakoid is one sac, not a stack). Looked at from near, the same
     sac is CUT OPEN: the half toward the viewer is away, and its cut edge shows what a thylakoid is: two membranes with
     a narrow space of fluid between them (14 nm in all: the membranes about 4.7 nm each, as the next step draws them;
     the science read, 17 Nov 2026: a solid lit slab could not show "the fluid inside thylakoids").
     the liquid: lit from behind, by a pale shell just inside the chloroplast's inner membrane: every membrane, stack or
     single sheet, stands dark against it, and no light lies outside the chloroplast (the science read: a light among
     the stacks also lit the sheets behind it) */
  const T_AT = V(G0.p.x - (G0.n - 1) / 2 * S.thylakoid, G0.p.y, G0.p.z), T_W = 14, T_M = 4.7;
  const oneT = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 40), new THREE.MeshBasicMaterial({ color: 0xe4fb86, transparent: true, opacity: 0.9, depthWrite: false }));
  oneT.position.copy(T_AT); oneT.quaternion.copy(zq); oneT.scale.set(G0.r * 2 + 10, 17, G0.r * 2 + 10); oneT.renderOrder = 8; oneT.visible = false; hc.add(oneT);
  const tCut = new THREE.Group(); tCut.position.copy(T_AT); tCut.visible = false; hc.add(tCut);
  const tLitMat = new THREE.MeshBasicMaterial({ color: 0xc4e060, transparent: true, opacity: 1, side: THREE.DoubleSide }), tEdgeMat = new THREE.MeshBasicMaterial({ color: 0xfbffd8, transparent: true, opacity: 1, side: THREE.DoubleSide });   /* (its round faces; its cut edge, paler: the two membranes at the cut are two plain lines) */
  { /* the half that stays (away from the viewer: the group's z > 0); its cut edge; the fluid inside */
    const half = new THREE.Mesh(new THREE.CylinderGeometry(G0.r, G0.r, T_W, 56, 1, false, -Math.PI / 2, Math.PI), tLitMat); half.quaternion.copy(zq); tCut.add(half);
    const sh = new THREE.Shape(); sh.moveTo(-T_W / 2, -G0.r); sh.lineTo(T_W / 2, -G0.r); sh.lineTo(T_W / 2, G0.r); sh.lineTo(-T_W / 2, G0.r); sh.closePath();
    const ho = new THREE.Path(), ix = T_W / 2 - T_M, iy = G0.r - T_M; ho.moveTo(-ix, -iy); ho.lineTo(-ix, iy); ho.lineTo(ix, iy); ho.lineTo(ix, -iy); ho.closePath(); sh.holes.push(ho);
    const edgeF = new THREE.Mesh(new THREE.ShapeGeometry(sh), tEdgeMat); edgeF.position.z = -0.4; tCut.add(edgeF);
    const fluid = new THREE.Mesh(new THREE.PlaneGeometry(2 * ix, 2 * iy), new THREE.MeshBasicMaterial({ color: 0x1c6a3a, side: THREE.DoubleSide })); fluid.position.z = -0.3; tCut.add(fluid); }
  /* (that sac's own disc among the stacks' discs: away while the cut one stands in its place) */
  const T_IDX = grana.slice(0, grana.indexOf(G0)).reduce((n, G) => n + G.n, 0), T_MAT = new THREE.Matrix4(), T_NONE = new THREE.Matrix4().makeScale(0, 0, 0); thyl.getMatrixAt(T_IDX, T_MAT);
  let tCutOn = false, namedNow = {};
  const strGlow = new THREE.Mesh(env.geometry, new THREE.MeshBasicMaterial({ color: 0xd9f8a0, transparent: true, opacity: 0, depthWrite: false, side: THREE.BackSide }));
  strGlow.scale.set(hx - 40, hy - 40, hy - 40); strGlow.renderOrder = 6.5; strGlow.visible = false; hc.add(strGlow);
  /* where the liquid is plain to see: places on the cut face that no stack lies behind. First those nearest the
     chloroplast's edge on the viewer's right, one for each height (the name then stands outside the chloroplast, its
     line ending in the liquid; the other course names stand on the left), the most open first; then those beside that
     one stack (for the near look) */
  const STR_PTS = (() => {
    const open = [], clear = (x, y) => Math.min(...grana.filter(G => !G.hidden).map(G => Math.max(Math.abs(x - G.p.x) - G.n * S.thylakoid / 2, Math.abs(y - G.p.y) - G.r)));
    for (let x = -0.8 * hx; x <= 0.8 * hx; x += 70) for (let y = -0.86 * hy; y <= 0.86 * hy; y += 90) { if ((x / hx) ** 2 + (y / hy) ** 2 > 0.74) continue; const c = clear(x, y); if (c > 45) open.push({ x, y, c, near: Math.hypot(x - G0.p.x, y - G0.p.y) }); }
    const rows = {}; open.filter(o => o.c > 70 && o.x < 0 && o.y < G0.p.y - 500).forEach(o => { if (!rows[o.y] || o.x < rows[o.y].x) rows[o.y] = o; });
    const far = Object.values(rows).sort((a, b) => b.c - a.c).slice(0, 10), near = open.filter(o => o.near < 620).sort((a, b) => b.c - a.c).slice(0, 5);
    /* (for the near look, first of all: the liquid just beside that stack's last flat membrane, on the viewer's right
       and at the stack's own depth: places inside no stack and on no single sheet) */
    const free = q => !grana.some(G => !G.hidden && Math.abs(q.x - G.p.x) < G.n * S.thylakoid / 2 + 30 && Math.hypot(q.y - G.p.y, q.z - G.p.z) < G.r + 30)
      && !sheets.some(o => Math.abs(q.x - o.p.x) < 30 && ((q.y - o.p.y) / (o.s.x / 2)) ** 2 + ((q.z - o.p.z) / (o.s.z / 2)) ** 2 < 1.1);
    const beside = [];
    for (const dx of [-110, -170, -240]) for (const dy of [-0.75, 0.75, -0.3, 0.3, -1.25, 1.25]) for (const dz of [-0.55, 0]) { const q = V(T_AT.x + dx, T_AT.y + dy * G0.r, T_AT.z + dz * G0.r); if (free(q)) beside.push(q); }
    return far.map(o => V(o.x, o.y, 8)).concat(beside.slice(0, 10), near.map(o => V(o.x, o.y, 8)));
  })();
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
     (18 Nov 2026, decided on Daniel's word "not confuse the students … not overwhelm them": the six water stay. In the
     chloroplast twelve are split and six are made again; that is beyond every course line here, and a second flow of
     water would confuse Year 7. The picture, the Year 7 sentence and the equation's strip show the same numbers.)
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
  /* (17 Nov 2026, the science read: water is split at the membrane's INNER face, beside the narrow space inside the sac,
     so the water goes into the membrane as far as that face and the oxygen comes from there; and the oxygen leaves as
     the water goes in, not after the sugar is built: "oxygen comes from the water") */
  const H2O_1 = h2o.map((_, i) => V(8.6, PROT_Y[1 + (i % 3)] + (i < 3 ? 0.5 : -0.5), 0.9)), O2_0 = o2.map((_, i) => V(8.6, PROT_Y[1 + (i % 3)] + (i < 3 ? -0.4 : 0.6), 1.0));
  const O2_1 = o2.map((_, i) => grid(i, 0.2, 4.6, 1.2, 1.1));
  const flash = glow(4.2, 0xfff1a8, 0); flash.position.copy(MEET); site.add(flash);
  /* light is not drawn as things that drift among the molecules (a wave of light is far longer than this whole picture):
     in the light the picture is lit from the upper left, the chlorophyll in the membrane glows, and one pulse of its
     energy goes from the membrane to the enzymes (the expert review, 11 Nov 2026) */
  const lightWash = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); lightWash.position.set(-6, 3, -13); site.add(lightWash);
  /* (three pulses, one from each green protein that took water: energy is seen to LEAVE the membrane for the enzymes;
     one glow that only appeared at the enzyme read as light reaching the enzyme: the science read) */
  const pulses = [0, 1, 2].map(() => { const q = glow(1.9, 0xbfffb0, 0); site.add(q); return q; });
  /* glucose joined into a chain: the start of a starch molecule (in the chain each glucose adds about 0.5 nm) */
  const chainN = 14, chainT = Array.from({ length: chainN }, () => { const t = token('glucose', 0.37); site.add(t); return t; });
  /* (18 Nov 2026, the science read: the chain was an almost straight ribbon, the shape of cellulose; the bonds of starch
     turn the chain into a coil, six glucose in each turn, about 1.3 nm across (Lehninger, Principles of Biochemistry,
     ch. 7). Drawn so: six in each turn, 0.9 nm between the centres across the coil. Along its length the coil is
     drawn stretched, 0.5 nm from one glucose to the next where a real coil rises 0.13 nm, so that each glucose of the
     chain can be seen) */
  const CH_T = Math.PI / 3, CH_R = 0.45;
  const chainAt = k => V(-8.9 + k * 0.5, -4.8 + CH_R * Math.sin(k * CH_T), 1.4 + CH_R * Math.cos(k * CH_T));
  const chainFrom = k => V(-2.6 + (k % 5) * 1.1, -1.6 - (k % 3) * 1.0 - ((k * 7) % 4) * 0.12, 1.6);
  const chainTilt = k => new THREE.Euler(0.3 * Math.sin(k * CH_T), 0.78, 0.25 * Math.cos(k * CH_T));
  /* when glucose k has arrived, as a share of the press: the first two joins are slow, to be watched (with IB on the
     water is then seen at its bond before it leaves); the others fast. The chain is whole at nine tenths */
  const chainWhen = k => (k <= 2 ? k * 0.2 : 0.4 + (k - 2) * (0.5 / (chainN - 3)));
  /* (18 Nov 2026) with IB on, the picture shows what "linked by condensation reactions" means: each time a glucose
     joins the chain, one water molecule appears at the new bond, then comes away from it (14 glucose: 13 bonds, 13
     water molecules), and they stay in view under the chain, each under its own bond, to be counted. Not for Year 7 or IGCSE: their words name no water here */
  const cWat = Array.from({ length: chainN - 1 }, () => { const t = mk('water', 0.21, 1.2, 0xbfe9ff); t.visible = false; return t; });
  /* (each rests under its own bond, in two staggered rows so that the 13 can be counted: a grid away from the bonds tied
     no water to a bond: the science read) */
  const cWatFrom = i => chainAt(i).clone().add(chainAt(i + 1)).multiplyScalar(0.5), cWatTo = i => V(-8.9 + (i + 0.5) * 0.5, -6.2 - (i % 2) * 0.5, 1.5);
  let courseNow = {};
  /* ---- the grain at night (18 Nov 2026): the starch step in reverse, at the grain's own surface ----
     Every pupil: Night is a press. The grain gets smaller (GN: what is left at the end of the night, as a share of
     its size by day; a leaf uses nearly all of its starch in one night: Graf et al. 2010, PNAS 107:9458, about 5 %
     is left at dawn; GN 0.45 across is about 9 % by volume), and a dashed line keeps its size by day.
     With IB on, the grain's name at night shows what "removed from starch by hydrolysis reactions (a water molecule
     is used to split each bond)" means: the camera goes to the grain's surface, where the end of one chain stands in
     the watery liquid. A water molecule goes to the chain's last bond, the bond splits, the glucose at the end comes
     away; then the next: H_USE bonds, H_USE water molecules, H_USE glucose. Each water molecule waits under the bond
     that it will split (as each one of the step before came to rest under the bond that it left); two more wait
     under the next two bonds: the hydrolysis goes on all night.
     The grain there: its chains lie side by side with their ends at its surface (the chains of a starch grain point
     outwards: Zeeman, Kossmann & Smith 2010), drawn as rods of the coil's own width; one chain's end is drawn glucose
     by glucose. (In a leaf most of the starch leaves the chloroplast as maltose, two glucose still joined; the IB line
     names monomers, and each bond split uses one water molecule in both cases. The picture shows the line's own
     words and names no enzyme.) */
  const GN = 0.45, H_N = 10, H_USE = 4, H_WAT = 6;
  const hsite = new THREE.Group(); hsite.name = 'hydrolysis'; hsite.visible = false; hc.add(hsite);
  /* its own frame, as the molecules' site: x to the viewer's right (out of the grain), y up, z to the viewer; its
     origin is on the grain's surface at the end of the night, at the grain's right edge */
  hsite.position.set(grain.position.x - 300 * GN, grain.position.y, grain.position.z); hsite.rotation.y = Math.PI;
  const hBack = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0x0b2331, transparent: true, opacity: 0.95, depthWrite: false })); hBack.position.set(0, 0, -14.5); hBack.renderOrder = 0; hsite.add(hBack);
  /* (round ends and no rim of light: flat ends with a bright rim read as pale hexagons, and a hexagon is a glucose here: the science read) */
  const rodMat = magicStandard({ color: 0xf1ecda, roughness: 0.5, emissive: 0x5a563f, emissiveIntensity: 0.55 }, { rim: 0xffffff, rimK: 0 });
  const rodBack = (n, j) => (n === 0 && j === 0 ? 0 : 0.08 + 0.42 * Math.abs(Math.sin(n * 12.9898 + j * 78.233))), rodY = (n, j) => j * 1.3 + (n & 1 ? 0.65 : 0), rodZ = n => 1.4 + n * 1.13;
  const rods = (() => { const P = []; for (let n = -11; n <= 2; n++) for (let j = -24; j <= 24; j++) P.push([n, j]);
    const m = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.58, 45, 6, 16), rodMat, P.length), o = new THREE.Object3D(), col = new THREE.Color(); o.rotation.z = Math.PI / 2;
    P.forEach(([n, j], i) => { /* (each rod's round end is at x = -rodBack: at the grain's surface, or a little inside it) */
      o.position.set(-23.08 - rodBack(n, j), rodY(n, j), rodZ(n)); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      /* (each chain a little lighter or darker than the next: side by side they read as many chains, not as one wall) */
      m.setColorAt(i, col.setScalar(0.8 + 0.2 * Math.abs(Math.sin(n * 4.1 + j * 2.7)))); });
    m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; hsite.add(m); return m; })();
  const hChain = Array.from({ length: H_N }, () => { const t = token('glucose', 0.37); hsite.add(t); return t; });
  const hAt = k => V(0.25 + k * 0.5, CH_R * Math.sin(k * CH_T), 1.4 + CH_R * Math.cos(k * CH_T));
  const hBond = e => hAt(H_N - 2 - e).add(hAt(H_N - 1 - e)).multiplyScalar(0.5);
  const hWat = Array.from({ length: H_WAT }, () => { const t = token('water', 0.21); const h = glow(1.2 * 0.8, 0xbfe9ff, 0.6); t.add(h); hsite.add(t); return t; });
  /* (the four that the play uses wait just under the chain, in two rows; the two that wait all through it stand a
     little lower, each still under its own bond: the note's level line ends on them and passes under the others) */
  const hWat0 = e => V(hBond(e).x, e < H_USE ? -1.85 - (e % 2) * 0.5 : -3.15, 1.5);
  /* the glucose that comes away rests to the right, above the chain's line, in a row of its own: to be counted. The
     first one goes farthest, so that no later one passes one that rests (touching rings read as a bond: the science read) */
  /* (a phone's picture is small: there the row is nearer the chain, so that its name has room at the row's right) */
  const H_GX = stage.W < 560 ? [6.3, 0.9] : [8.5, 1.0];
  const hGluTo = e => V(H_GX[0] - e * H_GX[1], 1.9 - (e % 2) * 1.1, 1.5);
  /* when split e begins and how long it takes, as shares of the play (knob hyd): the first is slow, to be watched */
  const H_T0 = [0.04, 0.36, 0.60, 0.80], H_D = [0.30, 0.22, 0.18, 0.18];
  const hFlash = glow(1.5, 0xfff1c0, 0); hsite.add(hFlash);
  /* (Reduce motion: one still, a moment of the third split, with an arrow from the water molecule to its bond) */
  const hArrow = (() => { const a = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: 0xeaf6ff, depthTest: false, transparent: true }), sh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 8), mat), hd = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 12), mat);
    sh.position.y = 0.5; hd.position.y = 1; a.add(sh, hd); a.renderOrder = 9; a.visible = false; hsite.add(a); return a; })();
  /* the grain's size by day, kept as a dashed line while it is night */
  const grainLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 72 }, (_, i) => V(300 * Math.cos(i / 72 * 2 * Math.PI), 800 * Math.sin(i / 72 * 2 * Math.PI), 0))), new THREE.LineDashedMaterial({ color: 0xfff6d0, dashSize: 60, gapSize: 46, transparent: true, opacity: 0, depthTest: false }));
  grainLine.computeLineDistances(); grainLine.position.copy(grain.position); grainLine.renderOrder = 9; grainLine.visible = false; hc.add(grainLine);
  let nightNow = 0, hFree = [], celNow = 0; const K_cel = () => celNow;
  /* ---- two glucose and the bond between them, with their atoms (18 Nov 2026): the starch step's IB zoom ----
     Daniel, on the cellulose fibre drawn as plain rings (memory teach-on-the-picture, "a zoom on the ATOMS"): "I like
     the simplification … but you might want to add a section that amplifies … a zoom in section to see how the bonds
     are formed. Not the whole thing, otherwise it's a bit too chemical." So, with IB on, the chain has a second name
     to press, "a glycosidic bond": the camera goes into one join of the chain and shows two glucose with their atoms.
     Each glucose as pupils draw it (the ring form, seen a little from above): a ring of five carbon atoms and one
     oxygen atom; on carbon 1 and on carbon 4 an −OH group, drawn whole; on carbon 5 the side group (−CH2OH: its
     carbon, its oxygen and that oxygen's hydrogen); the −OH groups of carbons 2 and 3 one small pale ball each; the
     hydrogen atoms on carbon not drawn (the key in the corner says both). Ball and stick, the atoms small so that
     the bonds show: C−C 0.154 nm, the −OH and bridge C−O 0.143 nm, O−H 0.096 nm (the ring is a regular hexagon, so
     its two C−O bonds are drawn as long as its C−C bonds; the pale groups' bonds are drawn short, 0.11 nm, so that
     each ball stands clear of the ring's atoms). Alpha-glucose: the −OH of carbon 1 points down, as that of carbon 4.
     The two rings' middles are 0.55 nm apart: the angle C−O−C is then 116° (maltose: about 117°). The colours are the
     game's: carbon grey, oxygen red, hydrogen white.
     The play (knob gly 0 … 1): the two −OH groups that meet, carbon 1's of the left glucose and carbon 4's of the
     right one, shine; the −OH of carbon 1 and the H of the other −OH are removed and form one water molecule, which
     goes straight down between the two glucose; the oxygen atom of carbon 4 stays and joins carbon 1 to carbon 4:
     the glycosidic bond, C−O−C, both of its bonds lit. With Reduce motion: the end, with pale shapes where the −OH
     and the H were, and an arrow from there to the water. (In the chloroplast an enzyme does this, and the glucose
     that joins carries a helper group: neither is drawn, as in the step's own picture.)
     (19 Nov 2026, the science read: seen at 26° a pale ball stood in front of carbon 5 and the ring could not be
     read: the whole is now tilted 40°, so that an upward group of a front carbon ends INSIDE the ring's outline.) */
  const gsite = new THREE.Group(); gsite.name = 'atoms'; gsite.visible = false; site.add(gsite);
  /* (in front of the chain, at one of its joins: the camera goes into that join; a backdrop of its own hides the rest) */
  gsite.position.copy(chainAt(6).add(chainAt(7)).multiplyScalar(0.5)).add(V(0, 0, 1.7));
  const gBack = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({ color: 0x0c2a1f, transparent: true, opacity: 0, depthWrite: false })); gBack.position.set(0, 0, -0.6); gBack.renderOrder = 4; gsite.add(gBack);
  const gmol = new THREE.Group(); gmol.rotation.x = 0.7; gsite.add(gmol);
  const G_R = 0.154, G_S = Math.sqrt(3) / 2, G_X = 0.275;      /* a ring's side; half the distance between the two rings' middles */
  const aMat = (c, e = 0.5) => magicStandard({ color: c, roughness: 0.35, emissive: c, emissiveIntensity: e * 0.35 }, { rim: 0xffffff, rimK: 0.45 });
  const A_MAT = { C: aMat(0x9aa3b5), O: aMat(0xff7b7b), H: aMat(0xffffff, 0.25), o: aMat(0xa86a6a, 0.3) }, A_RAD = { C: 0.042, O: 0.042, H: 0.028, o: 0.03 };
  const stickMat = new THREE.MeshBasicMaterial({ color: 0xc9cfda }), newMat = new THREE.MeshBasicMaterial({ color: 0xffe9a0 }), paleMat = new THREE.MeshBasicMaterial({ color: 0x6f7480 });
  const G_AT = { C1: [G_R, 0, 0], C2: [G_R / 2, 0, G_R * G_S], C3: [-G_R / 2, 0, G_R * G_S], C4: [-G_R, 0, 0], C5: [-G_R / 2, 0, -G_R * G_S], O5: [G_R / 2, 0, -G_R * G_S],
    O1: [G_R + 0.02, -0.142, 0], H1: [G_R + 0.05, -0.232, 0], O4: [-G_R - 0.02, -0.142, 0], H4: [-G_R - 0.05, -0.232, 0],
    O2: [G_R / 2, -0.11, G_R * G_S], O3: [-G_R / 2 + 0.01, 0.11, G_R * G_S], C6: [-G_R / 2, 0.148, -G_R * G_S - 0.02], O6: [-G_R / 2 + 0.06, 0.278, -G_R * G_S - 0.02], H6: [-G_R / 2 + 0.135, 0.336, -G_R * G_S - 0.02] };
  const G_KIND = k => (k === 'O2' || k === 'O3' ? 'o' : k[0]);
  const gAtoms = {}; ['A', 'B'].forEach(n => { gAtoms[n] = {}; Object.keys(G_AT).forEach(k => { const kd = G_KIND(k), m = new THREE.Mesh(new THREE.SphereGeometry(A_RAD[kd], 18, 14), A_MAT[kd]); gmol.add(m); gAtoms[n][k] = { m, p: m.position, kind: kd }; }); });
  const gStick = (a, b, mat = stickMat, r = 0.014) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 8), mat); gmol.add(m); return { m, a, b }; };
  const G_PAIRS = [['C1', 'C2'], ['C2', 'C3'], ['C3', 'C4'], ['C4', 'C5'], ['C5', 'O5'], ['O5', 'C1'], ['C5', 'C6'], ['C6', 'O6'], ['O6', 'H6']];
  const gSticks = ['A', 'B'].flatMap(n => G_PAIRS.map(([a, b]) => gStick(gAtoms[n][a], gAtoms[n][b])).concat([gStick(gAtoms[n].C2, gAtoms[n].O2, paleMat, 0.01), gStick(gAtoms[n].C3, gAtoms[n].O3, paleMat, 0.01)]));
  /* the two −OH groups at the far ends (they take no part), and those that meet */
  gSticks.push(gStick(gAtoms.A.C4, gAtoms.A.O4), gStick(gAtoms.A.O4, gAtoms.A.H4), gStick(gAtoms.B.C1, gAtoms.B.O1), gStick(gAtoms.B.O1, gAtoms.B.H1), gStick(gAtoms.A.O1, gAtoms.A.H1));
  /* (the bond of carbon 4 to its oxygen: once that oxygen joins the two, it is one of the bridge's two bonds, and lit as the new one is) */
  const keepMat = new THREE.MeshBasicMaterial({ color: 0xc9cfda }), gKeep = gStick(gAtoms.B.C4, gAtoms.B.O4, keepMat, 0.014);
  const gOld1 = gStick(gAtoms.A.C1, gAtoms.A.O1), gOld4 = gStick(gAtoms.B.O4, gAtoms.B.H4), gWatH = gStick(gAtoms.A.O1, gAtoms.B.H4), gNew = gStick(gAtoms.A.C1, gAtoms.B.O4, newMat, 0.018);
  const gGlowA = glow(0.16, 0xfff1c0, 0), gGlowB = glow(0.16, 0xfff1c0, 0), gGlowN = glow(0.2, 0xffe9a0, 0); gmol.add(gGlowA, gGlowB, gGlowN);
  /* the names' short upright lines (a level line would pass other atoms on its way to the middle of the picture) */
  const gLineMat = new THREE.MeshBasicMaterial({ color: 0xfff6d0, depthTest: false, transparent: true, opacity: 0.9 }), gNoteMat = new THREE.MeshBasicMaterial({ color: 0xd9c8ff, depthTest: false, transparent: true, opacity: 0.95 });
  const gBar = (a, b, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, a.distanceTo(b), 6), mat); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); m.renderOrder = 9; gmol.add(m); return m; };
  const G_TOP = 0.58, G_LOW = stage.W < 560 ? -0.5 : -0.36 /* (a phone: lower, so that the bond's name is clear of the right glucose's own −OH) */, G_C1 = V(-G_X + G_R, 0, 0), G_C4 = V(G_X - G_R, 0, 0), G_BRIDGE = V(0, -0.076, 0);
  const gLead1 = gBar(G_C1.clone().add(V(0, 0.055, 0)), V(G_C1.x, G_TOP, 0), gLineMat), gLead4 = gBar(G_C4.clone().add(V(0, 0.055, 0)), V(G_C4.x, G_TOP, 0), gLineMat), gLeadB = gBar(G_BRIDGE.clone().add(V(0, -0.055, 0)), V(0, G_LOW, 0), gNoteMat);
  /* (the water: first straight down the space between the two glucose, then aside to rest; a slanted way passed carbon 2's pale ball and the −OH seemed to leave carbon 2: the science read) */
  const G_W0 = V(0, -0.34, 0.05), G_W1 = V(-0.2, -0.62, 0.05);
  const gArrow = (() => { const a = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: 0xeaf6ff, depthTest: false, transparent: true }), sh = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 8), mat), hd = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.06, 12), mat);
    const from = V(-0.03, -0.27, 0.05), to = G_W1.clone().add(V(0.075, 0.105, 0)), L = from.distanceTo(to); sh.scale.y = L - 0.06; sh.position.y = (L - 0.06) / 2; hd.position.y = L - 0.03; a.add(sh, hd); a.position.copy(from); a.quaternion.setFromUnitVectors(V(0, 1, 0), to.clone().sub(from).normalize()); a.renderOrder = 9; a.visible = false; gmol.add(a); return a; })();
  /* (the still's pale shapes: where the −OH of carbon 1 and the H of carbon 4's −OH were before they were removed) */
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false });
  const gGhosts = [['A', 'O1', 0.042], ['A', 'H1', 0.028], ['B', 'H4', 0.028]].map(([n, k, r]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), ghostMat); m.position.set(G_AT[k][0] + (n === 'A' ? -G_X : G_X), G_AT[k][1], G_AT[k][2]); m.visible = false; m.renderOrder = 6 /* (after the backdrop, which else was drawn over them) */; gmol.add(m); return m; });
  let gNow = 0;
  const gT = V(), gY = V(0, 1, 0);
  function gPlace(g, t, arrow) {
    gNow = g;
    /* the two groups shine (to 0.3); the water comes away (0.3 to 0.55) and moves off (to 0.9); the oxygen atom that
       is left goes to its place between the two carbon atoms and the new bond grows (0.45 to 0.7) */
    const u = smooth(0.3, 0.55, g), u2 = smooth(0.45, 0.7, g), w = smooth(0.58, 0.9, g), Wp = G_W0.clone().lerp(G_W1, w);
    ['A', 'B'].forEach(n => { const sx = n === 'A' ? -G_X : G_X; Object.keys(G_AT).forEach(k => { gAtoms[n][k].p.set(G_AT[k][0] + sx, G_AT[k][1], G_AT[k][2]); }); });
    gAtoms.A.O1.p.lerp(Wp, u); gAtoms.A.H1.p.lerp(gT.copy(Wp).add(V(-0.076, 0.058, 0)), u); gAtoms.B.H4.p.lerp(gT.copy(Wp).add(V(0.076, 0.058, 0)), u);
    gAtoms.B.O4.p.lerp(G_BRIDGE, u2);
    gSticks.concat([gOld1, gOld4, gWatH, gNew, gKeep]).forEach(s => { const d = gT.copy(s.b.p).sub(s.a.p), L = d.length(); s.m.position.copy(s.a.p).addScaledVector(d, 0.5); s.m.quaternion.setFromUnitVectors(gY, d.normalize()); s.m.scale.set(1, L, 1); });
    gOld1.m.visible = u < 0.45; gOld4.m.visible = u < 0.45; gWatH.m.visible = u > 0.55; gNew.m.visible = u2 > 0.4; if (gNew.m.visible) gNew.m.scale.x = gNew.m.scale.z = 0.4 + 0.6 * smooth(0.4, 1, u2);
    keepMat.color.setHex(0xc9cfda).lerp(newMat.color, smooth(0.6, 1, u2)); gKeep.m.scale.x = gKeep.m.scale.z = 1 + 0.29 * smooth(0.6, 1, u2);
    const pulse = 0.55 + 0.45 * Math.sin(t * 5), pre = (1 - smooth(0.26, 0.36, g)) * smooth(0, 0.04, g);
    gGlowA.position.copy(gAtoms.A.O1.p).add(V(0.01, -0.04, 0.05)); gGlowB.position.copy(gAtoms.B.O4.p).add(V(-0.01, -0.04, 0.05)); gGlowA.material.opacity = gGlowB.material.opacity = 0.6 * pre * pulse;
    gGlowN.position.copy(G_BRIDGE).add(V(0, 0.02, 0.05)); gGlowN.material.opacity = 0.55 * smooth(0.6, 0.75, g) * (0.7 + 0.3 * pulse);
    gLead1.visible = !!namedNow.gc1; gLead4.visible = !!namedNow.gc4; gLeadB.visible = !!namedNow.fgly && g > 0.74; gArrow.visible = !!arrow && g > 0.95; gGhosts.forEach(m => { m.visible = gArrow.visible; });
  }

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
  /* (17 Nov 2026) the first of its two proteins is a protein carrier, as at the game's way in: two halves round a pocket,
     at the cut face, where the course's scene of active transport shows it at work (memflow.js); the second a lump */
  /* (where each scene is along the strip: diffusion and osmosis at a stretch of plain lipids, clear of the three
     proteins; active transport at the carrier) */
  const MEMX = S.wall / 2 + 2.5, MEM_AT = { diffusion: 42, osmosis: 42, active: 15 };
  /* the wall's inner face, seen a little from the side (the step's own view): a plane of the wall's colour just outside
     the membrane, so that the room between the nearest fibres and the membrane reads as wall. Before, a pale band lay
     there, and a gap between wall and membrane reads as plasmolysis (the science read, 17 Nov 2026). Seen from in front
     (the scenes) it lies behind the lipids */
  const wface = new THREE.Mesh(new THREE.PlaneGeometry(320, 1000), new THREE.MeshBasicMaterial({ color: 0x8f9150, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  wface.rotation.y = Math.PI / 2; wface.position.set(S.wall / 2 - 0.7, 0, -160.5); wface.renderOrder = 1; wface.raycast = () => {}; ws.add(wface);
  const wmem = bilayer({ x0: -84, x1: 84, depth: 12, seed: 8, holes: [{ x: MEM_AT.active, z: (MBOX.W0 + MBOX.W1) / 2, r: 3.0 }, { x: -24, z: -5.6, r: 2.6 }] }); wmem.rotation.z = Math.PI / 2; wmem.position.set(MEMX, 0, 0); ws.add(wmem);
  /* a membrane is two layers of lipids WITH PROTEINS in them (the game's way in): two of them in the strip drawn */
  [[-24, -5.6, 2.5, PAL.envelope]].forEach(([y, z, r, c], i) => { const t = lump(r, c, 5.3 + i * 2.3, 0x10203a, 0.5); t.position.set(MEMX, y, z); t.scale.set(0.8, 1.15, 1); t.rotation.set(0, 1.3, 0); ws.add(t); wprot.push(t); });
  /* and a small protein ON the membrane, attached to its inner surface (a peripheral protein, in the IB's words: the
     step's IB names, text.js XKEY.membrane) */
  const PERI = V(MEMX + 2.4 + 1.25, -12, -1.5);
  { const t = lump(1.45, 0xffc46b, 9.1, 0x3a2408, 0.5); t.position.copy(PERI); t.scale.set(0.85, 1.1, 1); ws.add(t); wprot.push(t); }
  const wfilm = new THREE.Mesh(new THREE.BoxGeometry(5, 1000, 320), new THREE.MeshBasicMaterial({ color: 0xff9ac8, transparent: true, opacity: 0.6, depthWrite: false })); wfilm.position.set(S.wall / 2 + 2.9, 0, -160.5); ws.add(wfilm);
  /* ---- one cellulose fibre from near (18 Nov 2026): the wall step's course names ----
     With a course on, the name on the fibres shows ONE fibre from near (view 14), drawn as what it is: straight
     chains of glucose, side by side (js/plant/text.js XKEY.wall, XKEY.wallG).
     - a chain: its glucose rings in one flat ribbon, 0.515 nm from one to the next (cellulose repeats every 1.04 nm,
       two glucose: Nishiyama, Langan & Chanzy 2002, J. Am. Chem. Soc. 124:9074), each ring turned over from the one
       before: one corner of every ring carries a red mark (its side group, the −CH2OH), and the mark stands on one
       side of the chain, then on the other. A ring in a chain is drawn at the ring's own size (about 0.6 nm); the
       free glucose of the steps before is 0.9 nm across with all its −OH groups;
     - a sheet: chains 0.82 nm apart in one plane, held by hydrogen bonds from each side group to the next chain
       (a short pale link; with IB's names only: the IGCSE line names none);
     - the fibre: sheets 0.39 nm apart, each shifted half a chain from the last (the same paper): here 6 sheets of 4
       chains, 24 chains (Fernandes et al. 2011, PNAS 108:E1195; other models have 18: Nixon et al. 2016, Sci. Rep.
       6:28696), about 3 nm wide: the fibre of the far view. The front sheet is drawn in full; those behind stay dim
       behind a veil, at a third of its brightness (brighter, their rings filled the spaces between the front
       chains and the whole read as one net of rings: the science read).
     The play (knob cel 0 … 1): ONE chain lights, whole, and stands alone for two seconds (one chain = one molecule);
     with IB its red marks then come one by one, right, left, right; then the other chains of its sheet and the
     hydrogen bonds between them; then, dimly, the sheets behind. The chain is never lit ring by ring from one end:
     after the starch step's Join that read as glucose joining a chain in the wall, and cellulose is made at the cell
     membrane (McFarlane, Döring & Persson 2014, Annu. Rev. Plant Biol. 65:69): nothing here shows it being made.
     With Reduce motion: the end of the play, held: the first chain brightest. */
  const C_STEP = 0.515, C_ROW = 0.82, C_LAY = 0.39, C_N = 4, C_SHEETS = 6, C_HALF = 30, C_R = 0.27, C_FLAT = C_R * Math.cos(Math.PI / 6) + C_R * 0.22, C_WIN = 9;
  const C_NARROW = stage.W < 560;
  /* (22 Nov 2026) a small laptop's picture (under 960 px wide or under 720 px high, no phone: view.js midPic): its near views
     are fitted a little tighter, and a name's card stands beside the picture, so the fibre's atoms need no room above them */
  const C_MID = stage.W >= 560 && (stage.W < 960 || stage.H < 720), C_SHORT = stage.W >= 560 && stage.H < 720;
  const CF_I = (() => { let best = 0, bz = -1e9; fibres.forEach((f, i) => { const ax = V(0, 1, 0).applyQuaternion(f.q), c = V(0, 0, 30).applyQuaternion(f.q).add(f.p);
    if (Math.abs(ax.z) > 0.1 || Math.abs(c.y) > 170 || c.z > -6 || c.x > S.wall / 2 - 70 || c.x < -S.wall / 2 + 30) return; if (c.z > bz) { bz = c.z; best = i; } }); return best; })();
  const csite = new THREE.Group(); csite.name = 'cellulose'; csite.visible = false; ws.add(csite);
  { const f = fibres[CF_I], ax = V(0, 1, 0).applyQuaternion(f.q); if (ax.y < 0) ax.negate(); csite.quaternion.setFromUnitVectors(V(0, 1, 0), ax); csite.position.copy(V(0, 0, 30).applyQuaternion(f.q).add(f.p)); }
  const cBack = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshBasicMaterial({ color: 0x242b12, transparent: true, opacity: 0.96, depthWrite: false })); cBack.position.set(0, 0, -6); cBack.renderOrder = 2; csite.add(cBack);
  const cMat = (b, e = 0.7) => { const m = magicStandard({ color: 0xffd56a, roughness: 0.4, emissive: 0x7a5a14, emissiveIntensity: e }, { rim: 0xffffff, rimK: 0.3 }); m.userData.c0 = m.color.clone(); m.userData.e0 = m.emissiveIntensity; m.color.multiplyScalar(b); m.emissiveIntensity *= b; return m; };
  const cDim = (m, b) => { m.color.copy(m.userData.c0).multiplyScalar(b); m.emissiveIntensity = m.userData.e0 * b; };
  /* chain i of sheet s (0 the front one), ring k: x across the fibre, y along it, z to the viewer (every second sheet
     stands half a chain to the left and half a ring up) */
  const cAt = (i, k, s = 0) => V((i - (C_N - 1) / 2 - (s & 1 ? 0.5 : 0)) * C_ROW, (k + (s & 1 ? 0.5 : 0)) * C_STEP, -s * C_LAY);
  /* the side of the chain that ring k's mark stands on: it alternates along the chain, and the chains of a sheet are
     alike (so in each space between two chains a mark comes from the left chain, then from the right one) */
  const cSide = (i, k) => (k & 1 ? 1 : -1);
  const cInst = (geo, mat, list, turn) => { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)), o = new THREE.Object3D(); if (turn) o.rotation.z = Math.PI / 2; list.forEach((p, n) => { o.position.copy(p); o.updateMatrix(); m.setMatrixAt(n, o.matrix); }); m.count = list.length; m.userData.n = list.length; m.instanceMatrix.needsUpdate = true; m.frustumCulled = false; csite.add(m); return m; };
  const C_K = Array.from({ length: 2 * C_HALF + 1 }, (_, n) => n - C_HALF), C_HERO = C_N - 1;
  /* (the marks are small and the bonds two short dashes: a solid bar read as a covalent rung, and pupils draw a
     hydrogen bond dashed: the science read) */
  const ringGeo = new THREE.TorusGeometry(C_R, C_R * 0.22, 8, 6), markGeo = new THREE.SphereGeometry(0.05, 12, 9), bondGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.042, 6);
  const cHeroMat = cMat(0.2, 0.9), cFrontMat = cMat(0.16), cBackMat = cMat(0.08);
  const markMat = magicStandard({ color: 0xff6a5e, roughness: 0.4, emissive: 0x7a1c14, emissiveIntensity: 1.0 }, { rim: 0xffffff, rimK: 0.3 });
  const bondMat = new THREE.MeshBasicMaterial({ color: 0xbfe9ff });
  const byY = (a, b) => a.y - b.y;
  const cHero = cInst(ringGeo, cHeroMat, C_K.map(k => cAt(C_HERO, k)), true);
  const markAt = (i, k) => cAt(i, k).add(V(cSide(i, k) * (C_FLAT + 0.055), 0, 0.02));
  /* (the first chain's marks: those in the picture first, from its foot upwards, one by one; then the others) */
  const C_HK = C_K.filter(k => Math.abs(k) <= C_WIN).concat(C_K.filter(k => Math.abs(k) > C_WIN));
  const cHeroMark = cInst(markGeo, markMat, C_HK.map(k => markAt(C_HERO, k)));
  const cFront = cInst(ringGeo, cFrontMat, [0, 1, 2].flatMap(i => C_K.map(k => cAt(i, k))), true);
  const cFrontMark = cInst(markGeo, markMat, [0, 1, 2].flatMap(i => C_K.map(k => markAt(i, k))).sort(byY));
  /* (a hydrogen bond: from a ring's mark to the next chain, where there is one on that side: two dashes) */
  const bondAt = (i, k, n) => cAt(i, k).add(V(cSide(i, k) * (C_FLAT + 0.135 + 0.062 * n), 0, 0.02));
  const cBond = (() => { const L = []; for (let i = 0; i < C_N; i++) C_K.forEach(k => { const sd = cSide(i, k); if (i + sd < 0 || i + sd >= C_N) return; L.push(bondAt(i, k, 0), bondAt(i, k, 1)); }); return cInst(bondGeo, bondMat, L.sort(byY), true); })();
  const cBackRings = cInst(ringGeo, cBackMat, Array.from({ length: C_SHEETS - 1 }, (_, n) => n + 1).flatMap(s => Array.from({ length: C_N }, (_, i) => i).flatMap(i => C_K.map(k => cAt(i, k, s)))), true);
  /* (a thin veil between the front sheet and those behind: through the open rings of the front sheet the sheets
     behind, shifted half a chain, made one mesh of hexagons in which no chain could be followed) */
  const cVeil = new THREE.Mesh(new THREE.PlaneGeometry(60, 80), new THREE.MeshBasicMaterial({ color: 0x242b12, transparent: true, opacity: 0, depthWrite: false })); cVeil.position.set(0, 0, -0.2); cVeil.renderOrder = 3; csite.add(cVeil);
  /* the names' own marks on the picture (the science read): a bracket across the whole fibre for "one fibre" (a line
     to one chain's edge made the fibre and the chain look alike), and for "hydrogen bonds" a small ring round ONE bond
     with a slanted line out of the fibre (a level line lay along the bonds and passed a red mark on its way) */
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xfff6d0, depthTest: false, transparent: true, opacity: 0.95 }), noteMat = new THREE.MeshBasicMaterial({ color: 0xd9c8ff, depthTest: false, transparent: true, opacity: 0.95 });
  const bar3 = (a, b, mat, r = 0.014) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, a.distanceTo(b), 6), mat); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); m.renderOrder = 9; csite.add(m); return m; };
  const C_XL = cAt(0, 0, 1).x - C_FLAT, C_XR = cAt(C_HERO, 0).x + C_FLAT + 0.105, C_BY = (C_NARROW ? -1.5 : 1.5) * C_STEP;
  const cBracket = [bar3(V(C_XL, C_BY, 0.3), V(C_XR, C_BY, 0.3), lineMat), bar3(V(C_XL, C_BY - 0.11, 0.3), V(C_XL, C_BY + 0.11, 0.3), lineMat), bar3(V(C_XR, C_BY - 0.11, 0.3), V(C_XR, C_BY + 0.11, 0.3), lineMat)];
  /* (the bond that the note rings: on a laptop in the first space from the left, low; on a phone in the last, high.
     Its row is one where the bond comes from the far chain's mark, so that the ring holds the two dashes alone) */
  const C_HB = C_NARROW ? { i: C_HERO, k: 4, out: V(C_XR + 0.3, 4 * C_STEP + 0.62, 0.3) } : { i: 1, k: -4, out: V(C_XL - 0.3, -4 * C_STEP - 0.74, 0.3) };
  const cHbAt = bondAt(C_HB.i, C_HB.k, 0.5).add(V(0, 0, 0.28));
  const cHbRing = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.013, 6, 24), noteMat); cHbRing.position.copy(cHbAt); cHbRing.renderOrder = 9; csite.add(cHbRing);
  const cHbLine = bar3(cHbAt.clone().add(C_HB.out.clone().sub(cHbAt).normalize().multiplyScalar(0.105)), C_HB.out, noteMat, 0.012);
  let cMarks = 0, cStage = 0, cIb = false;
  /* ---------------- a piece of the fibre and its atoms (19 Nov 2026) ----------------
     Daniel, 18 Nov: "a zoom in section to see how the bonds are formed … several glucose molecules and several
     fibers, so you see the cross-linking"; 19 Nov, of the starch step's zoom: "Yes, carry on". With IB on, the near
     view's "hydrogen bonds" is a name to press: the camera goes into the bond that the name rings, and there TWO
     chains stand with their atoms, three glucose of each (a phone: two), at their own places in the sheet and at
     their true sizes (the rings 0.515 nm apart along a chain, the chains 0.82 nm apart; C−C 0.15 nm, C−O 0.143 nm,
     O−H 0.097 nm; Nishiyama, Langan & Chanzy 2002, J. Am. Chem. Soc. 124:9074). A ring is seen from its flat side,
     as the hexagons of the near view are; the atoms and their colours are the starch zoom's (its key).
     What the atoms show: (1) each glucose is turned over from the one before, so its −CH2OH group (carbon 6: the red
     mark of the near view) stands on one side of the chain, then on the other, and the oxygen atom of its ring with
     it; (2) the oxygen atom that joins carbon 1 to carbon 4 (the glycosidic bond, lit as in the starch zoom) changes
     side too; (3) between the chains, the −OH of each −CH2OH group points its hydrogen atom at the oxygen atom of an
     −OH group of the next chain: a hydrogen bond, three pale dashes (O6−H···O3, the bond between chains of one
     sheet: the same paper), with δ+ and δ− on the two atoms of the bond that has the name. In each space the bond
     comes from the left chain, then from the right one, as the dashes of the near view do.
     The science read (19 Nov) and what it changed: each ring is turned 15° about its middle, one way then the other
     (as in the crystal), so that the C−O−C of the glycosidic bond is 117° with both bonds 0.143 nm, and the three
     pairs of −OH groups that bond in cellulose stand 0.26 nm apart (between chains O6···O3; inside a chain O3···O5
     and O2···O6); every −OH is drawn whole (the −OH of carbon 2 was the starch zoom's small ball: a third way to
     draw one group); the −CH2OH groups and −OH groups at the piece's two edges have faint dashes that lead outward
     (three of six groups pointed at nothing: "half make no bond"; the next chains are not drawn); the carbon atoms
     1, 4 and 6 of two glucose have their numbers (a laptop); the dashes are thin (they were as thick as a bond).
     Still a flat drawing: the angles at carbon 1, 4 and 6 are a flat ring's (104° and 137°; 130°), not 110°.
     The play (knob cat 0 … 1): the −CH2OH groups shine, row by row from the top (right, left, right); then the
     hydrogen bonds come one by one: the hydrogen atom and the oxygen atom shine, then the dashes grow from the
     hydrogen atom. Nothing moves: the chains are not shown coming together (cellulose is made at the cell membrane,
     and the chains bond as they are made). With Reduce motion: the end, held.
     Not drawn, and said in the key: the next chains on each side; the hydrogen atoms on carbon; the hydrogen bonds
     inside one chain (they are not the cross-links of the course's line: each −OH's hydrogen atom points where its
     bond would be). */
  const A_I = C_HB.i - 1, A_K0 = C_HB.k, A_KS = C_NARROW ? [A_K0, A_K0 + 1] : [A_K0 - 1, A_K0, A_K0 + 1];
  const asite = new THREE.Group(); asite.name = 'cellulose atoms'; asite.visible = false; csite.add(asite);
  asite.position.copy(cAt(A_I, A_K0).add(cAt(A_I + 1, A_K0)).multiplyScalar(0.5)).add(V(0, 0, 0.9));
  const aBack = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshBasicMaterial({ color: 0x242b12, transparent: true, opacity: 0, depthWrite: false })); aBack.position.set(0, 0, -0.35); aBack.renderOrder = 4; asite.add(aBack);
  const A_R = 0.14, A_P = 0.022;
  const aDir = (deg, L = 1) => [L * Math.cos(deg * Math.PI / 180), L * Math.sin(deg * Math.PI / 180)], aAdd = (q, d) => [q[0] + d[0], q[1] + d[1], 0];
  /* one glucose about the middle of its ring, its −CH2OH group on the side x > 0, turned 15° to the left (a glucose
     turned over: x and z change sign, so it is turned 15° to the right). Each −OH's hydrogen atom points at the
     oxygen atom that it bonds to in cellulose: carbon 6's at the oxygen atom of carbon 3 of the next chain; carbon
     3's at the ring oxygen of the glucose before; carbon 2's at the oxygen atom of carbon 6 of the glucose after */
  const A_AT = (() => { const ring = (deg, z) => [...aDir(deg, A_R), z], T = { C1: ring(105, A_P), O5: ring(45, -A_P), C5: ring(-15, A_P), C4: ring(-75, -A_P), C3: ring(225, A_P), C2: ring(165, -A_P) };
    T.C6 = aAdd(T.C5, aDir(-15, 0.152)); T.O6 = aAdd(T.C6, aDir(-65, 0.143)); T.O3 = aAdd(T.C3, aDir(215, 0.143)); T.O2 = aAdd(T.C2, aDir(170, 0.143));
    const u = (q, to) => { const d = V(to[0] - q[0], to[1] - q[1], 0).normalize().multiplyScalar(0.097); return [q[0] + d.x, q[1] + d.y, 0]; };
    T.H6 = u(T.O6, [C_ROW + T.O3[0], T.O3[1]]); T.H3 = u(T.O3, [-T.O5[0], -C_STEP + T.O5[1]]); T.H2 = u(T.O2, [-T.O6[0], C_STEP + T.O6[1]]);
    return T; })();
  /* (the oxygen atom between ring k and the ring after it: off the chain's line, on the side away from ring k's
     −CH2OH group, where both its bonds are 0.143 nm long) */
  const A_BX = (() => { const g2 = C_STEP / 2 - A_AT.C1[1]; return -A_AT.C1[0] + Math.sqrt(0.143 * 0.143 - g2 * g2); })();
  const aMid = (c, k) => V((c - 0.5) * C_ROW, (k - A_K0) * C_STEP, 0);
  const aPos = (c, k, n) => { const sd = cSide(0, k), q = A_AT[n], o = aMid(c, k); return V(o.x + sd * q[0], o.y + q[1], sd * q[2]); };
  const aBridge = (c, k) => aMid(c, k).add(V(-cSide(0, k) * A_BX, C_STEP / 2, 0));
  const aBalls = { C: [], O: [], H: [] }, aRods = { st: [], pale: [], lit: [] };
  const A_TOPK = A_KS[A_KS.length - 1], A_BOTK = A_KS[0];
  [0, 1].forEach(c => {
    A_KS.forEach(k => { Object.keys(A_AT).forEach(n => { aBalls[n[0]].push(aPos(c, k, n)); });
      [['C1', 'C2'], ['C2', 'C3'], ['C3', 'C4'], ['C4', 'C5'], ['C5', 'O5'], ['O5', 'C1'], ['C5', 'C6'], ['C6', 'O6'], ['O6', 'H6'], ['C3', 'O3'], ['O3', 'H3'], ['C2', 'O2'], ['O2', 'H2']].forEach(([a, b]) => { aRods.st.push([aPos(c, k, a), aPos(c, k, b)]); }); });
    /* the glycosidic bonds: carbon 1, the oxygen atom, carbon 4 of the next ring; at the two ends of the piece the
       oxygen atom and a short pale bond that leads on, towards the carbon atom that is not drawn (the chain goes on) */
    for (let k = A_BOTK - 1; k <= A_TOPK; k++) { const o = aBridge(c, k); aBalls.O.push(o);
      if (k >= A_BOTK) aRods.lit.push([aPos(c, k, 'C1'), o]); else aRods.pale.push([o, o.clone().lerp(aPos(c, k, 'C1'), 0.55)]);
      if (k < A_TOPK) aRods.lit.push([o, aPos(c, k + 1, 'C4')]); else aRods.pale.push([o, o.clone().lerp(aPos(c, k + 1, 'C4'), 0.55)]); } });
  const aInst = (geo, mat, list, rod) => { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)), o = new THREE.Object3D(), y = V(0, 1, 0);
    list.forEach((q, n) => { if (rod) { const d = q[1].clone().sub(q[0]), L = d.length(); o.position.copy(q[0]).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(y, d.normalize()); o.scale.set(1, L, 1); } else o.position.copy(q); o.updateMatrix(); m.setMatrixAt(n, o.matrix); });
    m.count = list.length; m.instanceMatrix.needsUpdate = true; m.frustumCulled = false; asite.add(m); return m; };
  Object.keys(aBalls).forEach(kd => aInst(new THREE.SphereGeometry(A_RAD[kd], 18, 14), A_MAT[kd], aBalls[kd]));
  aInst(new THREE.CylinderGeometry(0.014, 0.014, 1, 8), stickMat, aRods.st, true); aInst(new THREE.CylinderGeometry(0.01, 0.01, 1, 8), paleMat, aRods.pale, true); aInst(new THREE.CylinderGeometry(0.018, 0.018, 1, 8), newMat, aRods.lit, true);
  const aAll = Object.values(aBalls).flat();
  /* a hydrogen bond's dashes, from the hydrogen atom h to the oxygen atom o: thin (a dash as thick as a bond's stick
     read as a covalent bond: the science read), which of the three, in which material */
  const A_GAP = 0.028 + 0.012, aDimA = new THREE.MeshBasicMaterial({ color: 0x86a6b6 }), aDimB = new THREE.MeshBasicMaterial({ color: 0x4f646e });
  const aDashes = (h, o, which, mats) => { const d = o.clone().sub(h), L = d.length(), u = d.normalize(), seg = (L - A_GAP - 0.042 - 0.012) / 4.2;
    return which.map((n, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, seg, 6), mats[i]); m.position.copy(h).addScaledVector(u, A_GAP + seg * (0.5 + 1.6 * n)); m.quaternion.setFromUnitVectors(V(0, 1, 0), u); m.visible = false; asite.add(m); return m; }); };
  /* the hydrogen bonds of the space between the two chains (listed from below; the play brings them from the top):
     which chain gives the hydrogen atom, the two atoms, and three dashes between them. With each: the faint dashes
     of its row that lead to the chains not drawn (out from the −CH2OH group at one edge of the piece, in to the −OH
     of carbon 3 at the other) */
  const aHb = A_KS.map(k => { const sd = cSide(0, k), from = sd > 0 ? 0 : 1, h = aPos(from, k, 'H6'), o = aPos(1 - from, k, 'O3'), L = h.distanceTo(o);
    const dash = aDashes(h, o, [0, 1, 2], [bondMat, bondMat, bondMat]);
    /* (the chain whose −CH2OH group is at the piece's edge: 1 − from; the chain whose carbon-3 −OH is at the other edge: from) */
    const stub = aDashes(aPos(1 - from, k, 'H6'), aPos(1 - from + sd, k, 'O3'), [0, 1], [aDimA, aDimB]).concat(aDashes(aPos(from - sd, k, 'H6'), aPos(from, k, 'O3'), [2, 1], [aDimA, aDimB]));
    const gh = glow(0.2, 0xe6f5ff, 0), go = glow(0.24, 0xe6f5ff, 0); gh.position.copy(h).add(V(0, 0, 0.06)); go.position.copy(o).add(V(0, 0, 0.06)); asite.add(gh, go);
    return { k, from, h, o, L, oo: aPos(from, k, 'O6').distanceTo(o), mid: h.clone().add(o).multiplyScalar(0.5), first: dash[0].position.clone(), dash, stub, gh, go, on: 0 }; });
  /* (a soft red light behind each −CH2OH group: the red mark of the near view) */
  const aHalo = A_KS.map(k => [0, 1].map(c => { const sp = glow(0.36, 0xff6a5e, 0); sp.position.copy(aPos(c, k, 'C6')).lerp(aPos(c, k, 'O6'), 0.55).add(V(0, 0, -0.07)); asite.add(sp); return sp; }));
  /* small signs drawn on the picture itself: the numbers of carbon atoms 1, 4 and 6 of two glucose of the right chain
     (1 and 4 inside the ring, beside their atoms; a laptop: on a phone they would be 10 px high), and δ+ and δ− on the
     two atoms of the bond that has the name (IB pupils write a hydrogen bond with them) */
  const aGlyph = (txt, col, h, at) => { const c = document.createElement('canvas'); c.width = txt.length > 1 ? 128 : 64; c.height = 80; const x = c.getContext('2d');
    x.font = '900 60px Nunito, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = 'rgba(22,26,10,0.92)'; x.strokeText(txt, c.width / 2, 42); x.fillStyle = col; x.fillText(txt, c.width / 2, 42);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); sp.scale.set(h * c.width / c.height, h, 1); sp.position.copy(at); sp.renderOrder = 9; asite.add(sp); return sp; };
  const aNums = C_NARROW ? [] : [A_K0, A_K0 + 1].flatMap(k => [aGlyph('1', '#fff3c4', 0.064, aMid(1, k).lerp(aPos(1, k, 'C1'), 0.46).setZ(0.06)), aGlyph('4', '#fff3c4', 0.064, aMid(1, k).lerp(aPos(1, k, 'C4'), 0.46).setZ(0.06)), aGlyph('6', '#fff3c4', 0.064, aPos(1, k, 'C6').add(V(cSide(0, k) * 0.02, 0.088, 0.06)))]);
  /* the names' own lines out of the piece (a level line to a bond in the space would pass a chain's atoms): the
     bond's name stands above the piece, at the top of a slanted line from the first dash of the highest bond (the
     space above that bond holds an −OH of the other chain: the line leans away from it), so that its card has the
     picture's top right corner and covers no atom. (A phone has no room for the note of the −CH2OH group: there the
     card says it) */
  const aBar = (a, b, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, a.distanceTo(b), 6), mat); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); m.renderOrder = 9; m.visible = false; asite.add(m); return m; };
  const A_YB = (A_BOTK - A_K0) * C_STEP - C_STEP / 2, A_YT = (A_TOPK - A_K0) * C_STEP + C_STEP / 2;      /* the oxygen atoms at the piece's two ends */
  /* (a laptop: the name stands high above the piece, so that its card, beside it, ends above the highest atoms; a phone's card is under the picture) */
  const A_HIGH = A_YT + (C_NARROW || C_MID ? 0.28 /* (just above the chain's end: on a 375 × 812 phone the atoms were 10 px across; on a small laptop a carbon atom was 16 px, and its card stands beside the picture) */ : 0.83), A_YC = (A_YB - 0.1 + A_HIGH + 0.08) / 2, A_XC = C_NARROW ? 0 : 0.2 /* (a laptop: the piece a little to the left: the note stands on its right) */, A_TOPB = aHb[aHb.length - 1], A_SG = A_TOPB.from ? -1 : 1;
  const A_HEAD = V(A_TOPB.first.x - 0.22 * A_SG, A_HIGH, 0.06), aLeadB = aBar(A_TOPB.first.clone().add(V(0, 0.024, 0.06)), A_HEAD, gNoteMat);
  const aDelta = [aGlyph('δ+', '#eaf6ff', C_NARROW ? 0.1 : 0.085, A_TOPB.h.clone().add(V(-0.012 * A_SG, -0.078, 0.06))), aGlyph('δ−', '#eaf6ff', C_NARROW ? 0.1 : 0.085, A_TOPB.o.clone().add(V(-0.036 * A_SG, 0.092, 0.06)))];
  const A_GRP = aPos(1, A_TOPK, 'C6');
  let aNow = 0, aLit = 0;
  function aPlace(a, t) {
    aNow = a; const n = A_KS.length, w = 0.36 / n, v = 0.48 / n, pulse = 0.6 + 0.4 * Math.sin(t * 5);
    /* the −CH2OH groups, row by row (0.04 to 0.4); the hydrogen bonds one by one (0.46 to 0.94): the two atoms shine, then the dashes */
    aLit = 0; aHalo.forEach((row, jj) => { const j = n - 1 - jj, up = smooth(0.04 + j * w, 0.04 + (j + 0.35) * w, a), down = smooth(0.04 + (j + 0.6) * w, 0.04 + (j + 1) * w, a), op = up * (0.9 - 0.55 * down); if (up > 0.5) aLit++; row.forEach(sp => { sp.material.opacity = op; }); });
    aHb.forEach((b, jj) => { const j = n - 1 - jj, t0 = 0.46 + j * v, pre = smooth(t0, t0 + 0.22 * v, a) * (1 - smooth(t0 + 0.7 * v, t0 + v, a)), g = smooth(t0 + 0.3 * v, t0 + 0.8 * v, a);
      b.gh.material.opacity = b.go.material.opacity = 0.75 * pre * pulse; b.dash.forEach((m, q) => { m.visible = g > (q + 0.5) / 3; }); b.stub.forEach(m => { m.visible = g >= 0.999; }); b.on = g >= 0.999 ? 1 : 0; });
    aLeadB.visible = !!namedNow.fhb && A_TOPB.on > 0; aDelta.forEach(sp => { sp.visible = aLeadB.visible; });
  }
  const wcyto = sparkles({ count: 260, size: 9, color: 0xcfffe0, opacity: 0.6, drift: 1.2, near: 30, sample: v => v.set(S.wall / 2 + 12 + R() * 320, (R() - 0.5) * 900, -6 - R() * 280) }); ws.add(wcyto);
  /* the course's three scenes at this membrane: diffusion, osmosis, active transport (memflow.js; view.js plays them) */
  const memSc = makeMem({ THREE, magicStandard, halo, stage, X0: MEMX, at: MEM_AT, fibres, carrierColor: PAL.rer });
  ws.add(memSc.carrier, memSc.group); wprot.push(memSc.carrier);

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
    const slit = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), front ? slitCut : slitMat); slit.position.copy(o.p); slit.scale.set(1700, th * 0.3, 4300); leaf.add(slit); });
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
  const knobs = { cam: 0, open: 0, ghost: 0, sal: 0, day: 1, hi: 0, hiC: 0, hiW: 0, hiV: 0, ps: 0, chain: 0, grain: 0, firm: 1, push: 0, sol: 0, conc: 0, plas: 0, flow: 0, sect: 0, mem: 0, hiM: 0, hiT: 0, hiS: 0, night: 0, hyd: 0, harr: 0, cel: 0, gly: 0, garr: 0, cat: 0, cta: 0 };
  const setOp = (m, k) => { const row = mats.find(x => x[0] === m); m.opacity = row[1] * k; m.visible = m.opacity > 0.004; };
  const worldOf = (obj, p) => obj.localToWorld(p.clone());
  g.updateMatrixWorld(true);
  const HCW = worldOf(hc, V(0, 0, 0)), SITEW = worldOf(site, V(0, 0, 0)), WSW = worldOf(ws, V(0, 0, 0)), GRAINW = worldOf(hc, grain.position), HSITEW = worldOf(hsite, V(0, 0, 0)), CSITEW = worldOf(csite, V(0, 0, 0)), GSITEW = worldOf(gsite, V(0, 0, 0)), ASITEW = worldOf(asite, V(A_XC, A_YC, 0));
  /* arrows of the cell sap's push on the wall, drawn only while the cell is firm (step: the vacuole) */
  const arrows = new THREE.Group(); hero.add(arrows);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xe6f2ff, transparent: true, opacity: 0, depthWrite: false, depthTest: false }); 
  [-22000, -8000, 6000, 20000].forEach(y => [-1, 1].forEach(sd => {
    const a = new THREE.Group(), sh = new THREE.Mesh(new THREE.CylinderGeometry(300, 300, 3000, 10), arrowMat), hd = new THREE.Mesh(new THREE.ConeGeometry(820, 1700, 14), arrowMat);
    sh.rotation.z = Math.PI / 2; hd.rotation.z = -sd * Math.PI / 2; hd.position.x = sd * 2300; a.add(sh, hd); a.position.set(sd * 2600, y, 500); a.userData.sd = sd; arrows.add(a); }));

  /* the firm cell's own outline, left as a dotted line when the cell has lost water (so the change can be seen) */
  const firmLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ring2(() => R0, HL).map(p => V(p.x, p.y, 40))), new THREE.LineDashedMaterial({ color: 0xfff6d0, dashSize: 900, gapSize: 700, transparent: true, opacity: 0 }));
  firmLine.computeLineDistances(); firmLine.renderOrder = 9; firmLine.visible = false; g.add(firmLine);
  /* the cell bathed in a solution (22 Nov 2026): the vacuole step's film with a course on (bath.js has what is drawn and
     why). solSc: the scales now, for the names (sx, sy: all that is inside the membrane; wx, wy: the wall);
     solFilm: { ts, still } while that film plays (the film object below sets it) */
  const bath = makeBath({ stage, R0, HL, RIN, wallT: S.wall, vacBase: S.vacBase, KB, KT, rnd: rng(7741) }); g.add(bath.group);
  const solSc = { sx: 1, sy: 1, wx: 1, wy: 1, plas: 0, firm: 1, sol: 0 }; let solFilm = null;
  /* (where the solution's name may end, on the cell's right: on a phone nearer the cell, so that the name, on two lines there,
     has room before the picture's edge: with no room it went to the other side and lay across the cell) */
  /* (a small laptop's picture too: at 1280 px "a concentrated solution" had no room before the picture's right edge) */
  const solPts = () => (stage.W < 560 || C_MID ? [[1.85, 26000], [1.85, 12000], [1.85, -22000], [1.85, -30000], [1.85, 2000], [1.85, 31000]] : [[2.4, 26000], [2.4, 12000], [2.8, -22000], [2.4, -30000], [2.6, 2000]]).map(([k, y]) => V(R0 * k, y, 0));
  /* the space between the wall and the membrane of the plasmolysed cell, on the cut face: in the solution's own blue (it IS
     the solution: without it the wall's inner side showed there, pale, and read as a very thick wall). Its hole is the
     membrane's outline when the cell is fully plasmolysed; it keeps the wall's size, as the wall does */
  const gapShape = new THREE.Shape(ring2(() => RIN, HL - S.wall)); gapShape.holes.push(new THREE.Path(ring2(() => RIN, HL - S.wall).map(p => new THREE.Vector2(p.x * PLAS.x, p.y * PLAS.y)).reverse()));
  const gapMat = new THREE.MeshBasicMaterial({ color: 0x234484 /* (measured on the picture, 28 Nov 2026: with this the space is the blue of the solution round the cell; it was a little paler, as if it held something else) */, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const gapFace = new THREE.Mesh(new THREE.ShapeGeometry(gapShape, 1), gapMat); gapFace.renderOrder = 3.5 /* (after the wall, whose pale inner side lies behind it; before the wall's cut band and the membrane's line) */; gapFace.visible = false; hero.add(gapFace);
  function draw(K, t) {
    const d = stage.view.dist;
    /* a film's section (sect 0 … 1): the front face's plane comes in to the piece's own face, then the cut faces appear */
    const sk = K.sect || 0; faceF.constant = sk > 0.002 ? FACE_Z + 26000 * (1 - smooth(0, 0.7, sk)) : 1e9; backF.constant = sk > 0.002 ? -BACK_Z + 90000 * (1 - smooth(0, 0.7, sk)) : 1e9;
    const ck = smooth(0.55, 1, sk); capsG.visible = ck > 0.01; capMats.forEach(([m, o]) => { m.opacity = o * ck; });
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
    /* (during a film the cells stay, however near the camera is: IB's film of transpiration goes into the wall of a
       spongy cell, films.js and wet.js, 19 Nov 2026; before, they were gone from 26 µm, and the way in led through empty air) */
    /* (in the film of the cell in a solution the other cells are away: the cell is alone in its solution) */
    const gk = (1 - 0.93 * smooth(0, 1, K.ghost)) * (1 - smooth(0, 0.7, K.sol || 0)), far = Math.max(smooth(26000, 60000, d), smooth(0.02, 0.5, K.sect || 0));
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
    /* (ONE measure of the water in the cell, from the two knobs: 1 turgid … 0 flaccid … −1 plasmolysed. So, whatever the
       film changes at once, the cell is never firm and plasmolysed together: on the way from plasmolysed to turgid the
       membrane first comes back against the wall, and only then does turgor pressure develop (its arrows too); on the
       way from turgid to plasmolysed the cell is flaccid first. The fresh science read, 28 Nov 2026: the two had
       changed side by side, and the arrows of turgor pressure showed while the membrane was still free of the wall) */
    const wq = K.firm - Math.max(0, Math.min(1, K.plas || 0)), firm = Math.max(0, Math.min(1, wq)), pl = Math.max(0, Math.min(1, -wq));
    const f = 0.94 + 0.06 * firm, fy = 0.99 + 0.01 * firm, px = 1 - (1 - PLAS.x) * pl, py = 1 - (1 - PLAS.y) * pl;
    hero.scale.set(f * px, fy * py, f * px);
    /* (plasmolysed, in the film of the cell in a solution: the wall keeps the flaccid cell's size while all that is inside
       the membrane leaves it; one factor for every part: bath.js says why) */
    wall.scale.set(1 / px, 1 / py, 1 / px); rim.scale.set(1 / px, 1 / py, 1); wallLayers.forEach(m => m.scale.set(1 / px, 1 / py, 1));
    gapFace.scale.set(1 / px, 1 / py, 1); gapFace.position.z = cut.constant - 14; gapMat.opacity = 0.94 * smooth(0.15, 0.95, pl) * smooth(0, 1, K.sol || 0); gapFace.visible = opened && gapMat.opacity > 0.01;
    solSc.sx = f * px; solSc.sy = fy * py; solSc.wx = f; solSc.wy = fy; solSc.plas = pl; solSc.firm = firm; solSc.sol = K.sol || 0;
    bath.draw(K, t, solSc, solFilm);
    /* (in a solution the arrows are the turgor pressure itself: none once the cell is flaccid) */
    const sl = smooth(0, 1, K.sol || 0);
    arrowMat.opacity = 0.9 * K.push * ((0.45 + 0.55 * firm) * (1 - sl) + firm * sl); arrows.visible = arrowMat.opacity > 0.01;
    arrows.children.forEach(a => a.scale.setScalar(0.42 + 0.58 * firm));
    firmLine.visible = K.push > 0.5 && firm < 0.97; firmLine.material.opacity = 0.9 * (1 - firm);
    arrows.children.forEach((a, i) => { a.renderOrder = 8; a.position.x = a.userData.sd * (2300 + 700 * (0.5 + 0.5 * Math.sin(t * 2.4 + i))); });
    /* close up: the chloroplast's inside, then the molecules; the wall's fibres */
    const inC = smooth(60000, 22000, d);
    thyl.visible = sheet.visible = inC > 0.01 && opened; nightNow = K.night || 0; celNow = K.cel || 0;
    /* (with the light off a mitochondrion's own red stood out, by day it was pale: "plants respire only at night". One look: the science read) */
    mitoMat.emissiveIntensity = 0.5 * (1 - 0.7 * nightNow);
    /* (the near look at the grain's surface: there the grain is its rods, and the molecules' own site stays away) */
    const nearH = stage.view.at.distanceTo(HSITEW) < 250, nh = nearH ? smooth(900, 220, d) : 0, gs = K.grain * (1 - (1 - GN) * nightNow);
    grain.visible = K.grain > 0.01 && opened && nh < 0.5; grain.scale.set(300 * gs, 800 * gs, 650 * gs);
    grainLine.visible = nightNow > 0.03 && opened && inC > 0.01 && nh < 0.5; grainLine.material.opacity = 0.9 * nightNow;
    const nm = (nearH ? 0 : 1) * smooth(900, 220, d) * (stage.view.at.distanceTo(SITEW) < 4000 ? 1 : 0) * (1 - Math.min(1, (K.hiT || 0) * 5));   /* (not while one thylakoid is looked at from near: that is the chloroplast step's look, not the molecules') */
    site.visible = nm > 0.01; thyl.visible = sheet.visible = thyl.visible && nm < 0.6 && nh < 0.6;
    hsite.visible = nh > 0.01; if (!hsite.visible) hFree = [];
    /* (the zoom on the atoms of one join: only when the camera is there) */
    { const ng = stage.view.at.distanceTo(GSITEW) < 3 ? smooth(26, 8, d) : 0; gsite.visible = ng > 0.01; if (gsite.visible) { gBack.material.opacity = ng; gPlace(K.gly || 0, t, (K.garr || 0) > 0.5); } }
    if (hsite.visible) {
      hBack.material.opacity = 0.95 * nh; const h = K.hyd || 0; let fl = 0; hFree = []; hArrow.visible = false;
      /* split e, u 0 … 1: the water molecule goes to its bond (to 0.45), goes into it as the bond splits (to 0.6),
         and the glucose at the chain's end comes away (from 0.55) */
      hChain.forEach((m, k) => { const e = H_N - 1 - k, u = e < H_USE ? (h - H_T0[e]) / H_D[e] : -1, g = smooth(0.55, 1, u);
        m.position.copy(hAt(k)); if (g > 0) { m.position.lerp(hGluTo(e), g); if (g > 0.5) hFree.push(m); } m.rotation.copy(chainTilt(k)); m.userData.away = g; });
      hWat.forEach((m, e) => { const u = e < H_USE ? (h - H_T0[e]) / H_D[e] : -1, go = smooth(0, 0.45, u), into = smooth(0.45, 0.6, u), b = hBond(e), p0 = hWat0(e);
        m.visible = into < 0.98; m.position.copy(p0).lerp(b, go).add(V(0, go > 0 ? 0 : 0.07 * Math.sin(t * 1.4 + e * 2), 0)); m.rotation.z = t * 0.6 + e; m.scale.setScalar(Math.max(0.001, 1 - into)); m.userData.used = into > 0.98;
        if (u > 0.4 && u < 0.75) { fl = Math.sin(Math.PI * (u - 0.4) / 0.35); hFlash.position.copy(b); }
        /* (the still's arrow: from the water molecule on its way to the bond that it will split) */
        if ((K.harr || 0) > 0.5 && go > 0.02 && go < 0.98) { const v = b.clone().sub(m.position), L = v.length(); if (L > 0.5) { hArrow.visible = true; hArrow.position.copy(m.position).addScaledVector(v, 0.34 / L); hArrow.quaternion.setFromUnitVectors(V(0, 1, 0), v.clone().normalize()); hArrow.children[0].scale.y = L - 0.86; hArrow.children[0].position.y = (L - 0.86) / 2; hArrow.children[1].position.y = L - 0.86 + 0.12; } } });
      hFlash.material.opacity = 0.7 * fl;
    }
    /* a course name pressed (the chloroplast step's looks): its part shows. hiM: the membranes, where the pigments are;
       hiT: one thylakoid; hiS: the liquid */
    { const hm = K.hiM || 0, ht = K.hiT || 0, hs = K.hiS || 0, beat = 0.84 + 0.16 * Math.sin(t * 3.2), look = { lit: hm * 0.5, sleep: hs * 0.9 };
      setLook(thyl, look); setLook(sheet, look);
      /* (the membranes stay green and shine: their own green light, more of it; the chloroplast round them dims) */
      discMat.emissiveIntensity = 0.9 + 2.8 * hm * beat; sheetMat.emissiveIntensity = 0.7 + 2.8 * hm * beat;
      if (hm > 0.01) setLook(env, { sleep: hm * 0.7 });
      /* one thylakoid: cut open while it is looked at; else bright while its name stands on the picture */
      const cut = ht > 0.02; if (cut !== tCutOn) { tCutOn = cut; thyl.setMatrixAt(T_IDX, cut ? T_NONE : T_MAT); thyl.instanceMatrix.needsUpdate = true; }
      tCut.visible = cut && thyl.visible; tLitMat.opacity = tEdgeMat.opacity = Math.min(1, ht * 2); tLitMat.color.setHex(0xc4e060).multiplyScalar(0.92 + 0.08 * Math.sin(t * 3.2));
      oneT.visible = !cut && !!namedNow.xthy && thyl.visible;
      strGlow.visible = hs > 0.01 && thyl.visible; strGlow.material.opacity = 0.62 * hs * beat; }
    if (site.visible) {
      back.material.opacity = 0.94 * nm; lumen.material.opacity = 0.7 * nm;
      /* ps 0 … 1: the water goes to the membrane and the carbon dioxide to the enzymes; a pulse of energy passes from the
         membrane to the enzymes. 1 … 2: oxygen comes away from the membrane; glucose comes from the enzymes */
      const a = smooth(0, 1, K.ps), b = smooth(1, 2, K.ps);
      co2.forEach((m, i) => { m.visible = b < 0.02; m.position.copy(CO2_0[i]).lerp(MEET, smooth(0.25 + i * 0.05, 0.85 + i * 0.03, a)).add(V(0, 0.14 * Math.sin(t * 1.3 + i), 0)); m.rotation.z = t * 0.5 + i; m.scale.setScalar(Math.max(0.001, 1 - smooth(0.92, 1, a))); });
      h2o.forEach((m, i) => { m.visible = a < 0.995; m.position.copy(H2O_0[i]).lerp(H2O_1[i], smooth(i * 0.05, 0.5 + i * 0.05, a)).add(V(0, 0.12 * Math.sin(t * 1.5 + i * 2) * (1 - a), 0)); m.rotation.z = t * 0.6 + i; m.scale.setScalar(Math.max(0.001, 1 - smooth(0.7, 0.9, a))); });
      glu.visible = b > 0.02 && K.chain < 0.02; glu.position.copy(MEET).lerp(GLU_1, smooth(0.25, 1, b)); glu.rotation.set(0.3, 0.78 + 0.2 * Math.sin(t * 0.6), 0); glu.scale.setScalar(Math.max(0.001, smooth(0, 0.25, b)));
      /* (the oxygen: from the moment the water has gone into the membrane, o 0 … 1 over the end of the first part and the second) */
      const o = 0.4 * smooth(0.72, 1, a) + 0.6 * b;
      o2.forEach((m, i) => { m.visible = o > 0.02; m.position.copy(O2_0[i]).lerp(O2_1[i], smooth(i * 0.05, 0.6 + i * 0.07, o)); m.rotation.z = t * 0.7 + i; m.scale.setScalar(Math.max(0.001, smooth(0, 0.2, o))); });
      flash.material.opacity = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (K.ps - 0.8) / 0.45)))) * 0.75;
      lightWash.material.opacity = 0.085 * K.day * nm;
      pulses.forEach((q, i) => { const d0 = 0.4 + i * 0.07; q.position.set(4.2, PROT_Y[1 + i], 1).lerp(MEET, smooth(d0 + 0.03, d0 + 0.42, a)); q.material.opacity = 0.95 * Math.sin(Math.PI * Math.min(1, Math.max(0, (K.ps - d0) / 0.46))) * (K.ps < 1 ? 1 : 0); });
      chlProt.forEach((p, i) => p.traverse(o => { if (o.isMesh) o.material.emissiveIntensity = 0.25 + K.day * (1.3 + 0.5 * Math.sin(t * 3 + i * 2)); }));
      /* the chain: the glucose just made is its first ring; the others join one by one */
      chainT.forEach((m, i) => { const k = i === 0 ? smooth(0, 0.04, K.chain) : smooth(chainWhen(i - 1) + (i <= 2 ? 0.02 : 0), chainWhen(i), K.chain); m.visible = k > 0.01;
        m.position.copy(i === 0 ? GLU_1 : chainFrom(i)).lerp(chainAt(i), k); m.rotation.copy(chainTilt(i)); });
      /* (the water from each join: it appears at the bond as its glucose arrives, stays there a moment (the first two:
         long enough to be seen at the bond), then moves down to its place under that bond) */
      cWat.forEach((m, i) => { const t0 = chainWhen(i + 1), hold = i < 2 ? 0.09 : 0.012, w = courseNow.ib ? smooth(t0 - 0.015, t0 + 0.005, K.chain) : 0; m.visible = w > 0.01;
        if (m.visible) { m.position.copy(cWatFrom(i)).lerp(cWatTo(i), smooth(t0 + hold, t0 + hold + 0.07, K.chain)); m.rotation.z = t * 0.6 + i; m.scale.setScalar(Math.max(0.001, w)); } });
      /* (in the zoom on the atoms the chain's own rings and the water of its joins stand back: at that size they were giant shapes behind the atoms) */
      if (gsite.visible && gBack.material.opacity > 0.3) [...chainT, ...cWat, glu].forEach(m => { m.visible = false; });
    }
    /* the thin sheets that stand for the wall and its membrane from far away give way to the fibres and the lipids */
    const nw = smooth(5200, 1400, d) * (stage.view.at.distanceTo(WSW) < 6000 ? 1 : 0), nl = smooth(700, 180, d) * nw;
    /* (the near look at one fibre: there the fibre is its chains; the smooth fibres and what lies between them stand back) */
    const nc = stage.view.at.distanceTo(CSITEW) < 20 ? smooth(420, 110, d) : 0;
    csite.visible = nc > 0.01;
    if (csite.visible) { cBack.material.opacity = 0.96 * nc; cVeil.material.opacity = 0.86 * nc; const c = K.cel || 0, na = smooth(1.1, 0.3, stage.view.at.distanceTo(ASITEW));
      /* (the marks and bonds are the IB look's: there once its names stand, and they stay while the camera goes on into the atoms, when the names are away; the IGCSE look, or a look begun again, has none) */
      if (namedNow.cbeta) cIb = true; else if (namedNow.fcelg || c <= 0) cIb = false; const ibN = cIb;
      /* the first chain, whole (to 0.06), alone (to 0.26); with IB its marks one by one (to 0.56); the sheet and its
         bonds; the sheets behind, dim. Without IB's names the sheet follows the first chain at once */
      const h1 = smooth(0, 0.06, c), m1 = ibN ? smooth(0.26, 0.56, c) : 0, p2 = ibN ? smooth(0.62, 0.8, c) : smooth(0.3, 0.6, c), p3 = ibN ? smooth(0.82, 1, c) : smooth(0.66, 1, c);
      cDim(cHeroMat, 0.2 + 0.8 * h1);
      cMarks = !ibN ? 0 : m1 >= 0.999 ? cHeroMark.userData.n : Math.floor(m1 * (2 * C_WIN + 1) + 0.001); cHeroMark.count = cMarks;
      cDim(cFrontMat, 0.16 + 0.64 * p2); cFrontMark.count = ibN ? Math.floor(p2 * cFrontMark.userData.n) : 0; cBond.count = ibN ? 2 * Math.floor(smooth(0.66, 0.8, c) * cBond.userData.n / 2) : 0;
      cDim(cBackMat, 0.08 + 0.22 * p3); cStage = c;
      cBracket.forEach(m => { m.visible = !!(namedNow.cfib || namedNow.cfibg); }); cHbLine.visible = ibN && !!namedNow.xhb && cBond.count >= cBond.userData.n; cHbRing.visible = ibN && (!!namedNow.xhb || (K.cta || 0) > 0.01) && cBond.count >= cBond.userData.n && na < 0.6;
      /* (the zoom on the atoms of a piece of the fibre: only when the camera is there) */
      asite.visible = na > 0.01; if (asite.visible) { aBack.material.opacity = na; aPlace(K.cat || 0, t); } } else asite.visible = false;
    ws.visible = nw > 0.01; fib.visible = fib2.visible = nw > 0.01 && nc < 0.5; wmem.visible = nl > 0.02; wprot.forEach(t => { t.visible = nl > 0.02; }); wfilm.material.opacity = 0.6 * nw * (1 - nl);
    /* (in a scene of the course the wall's fibres stand back a little behind what lies between them, so that the small
       particles in front show) */
    slabs.forEach((s, i) => { s.material.opacity = Math.min(0.93, SLAB[i] * nw * (1 + 0.42 * (K.mem || 0))) * (1 - nc); }); wface.material.opacity = 0.9 * nw;
    /* (in a scene of the course the cytoplasm's soft motes go: beside the scene's particles they read as more particles) */
    wcyto.visible = nw > 0.5 && !(K.mem > 0.5);
    rimMat.opacity = 1 - nw; memLineMat.opacity *= 1 - nl; if (nw > 0.01) wallMat.opacity *= 1 - 0.75 * nw;
    /* (and the cell membrane's own thin sheet, the cell's whole surface seen from far away: where the lipids are drawn
       it goes too. Left on, its rim of light lay as a pale band between the wall's fibres and the lipids, and a gap
       between wall and membrane reads as plasmolysis: the science read, 17 Nov 2026) */
    if (nl > 0.01) { memMat.opacity *= 1 - nl; memMat.visible = memMat.opacity > 0.004; }
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
    /* (20 Nov 2026: a phone looks a little to the right of the cell, so that the cell stands left of the middle and its
       button has room beside it: "Take in water" stood 16 px on the cell, and the longer words of a course more) */
    /* 8 the vacuole (the cell) */ { zoom: 20, at: V(stage.W < 560 ? 14000 : 0, 0, -1500), dist: 150000, dir: D(-0.08, 0.05, 1), up: UP, fit: { pts: [[R0 + 1500, HL + 2500, 2000]], min: 110000 } },
    /* 9, 10 the course's scenes at the membrane (memflow.js): the membrane in the middle, the same width of the wall's
       side and of the cytoplasm on each side of it; 9 diffusion and osmosis, 10 active transport, at the carrier */
    { zoom: 3, at: worldOf(ws, V(MEMX, MEM_AT.diffusion, 0.7)), dist: 38, dir: D(0.012, 0.02, 1), up: UP, fit: { pts: [[7.8, 6.4, 2]], min: 30 }, fitN: { pts: [[6.6, 9, 2]], min: 14 } },
    { zoom: 3, at: worldOf(ws, V(MEMX, MEM_AT.active, 0.7)), dist: 38, dir: D(0.012, 0.02, 1), up: UP, fit: { pts: [[7.8, 6.4, 2]], min: 30 }, fitN: { pts: [[6.6, 9, 2]], min: 14 } }
  ];
  memSc.views = { diffusion: 9, osmosis: 9, active: 10 };
  /* 11 one thylakoid, from near (17 Nov 2026): where the name "thylakoid" looks: the last flat sac of the stack that the
     next step goes to, near enough for its two membranes and the fluid between them to be seen (a sac is 14 nm thick).
     The camera stands a little to the viewer's right, so that the sac shows its round face behind its cut edge */
  views.push({ at: worldOf(hc, T_AT.clone().add(V(30, 0, 0))), dist: 1000, dir: D(0.36, 0.1, 1), up: UP, fit: C_MID ? { pts: [[182, 218, 60]], min: 640 } /* (the fluid inside the thylakoid stays 5 px wide: 4.6 nm at 1.09 px a nm or more) */ : { pts: [[235, 265, 60]], min: 880 }, fitN: { pts: [[150, 150, 60]], min: 560 } });
  /* 12 the molecules, for the starch step (18 Nov 2026): the same view as 4 on a laptop; on a phone the picture is
     short, and the chain with the water that comes away under it (IB) lay at its foot, behind the scale bar and the
     zoom buttons: there the camera looks a little lower */
  views.push(Object.assign({}, views[4], { at: worldOf(site, V(-2.0, stage.W < 560 ? -2.6 : 0.2, 0)) }));
  /* 13 the grain's surface at night, from near (18 Nov 2026): where the IB name of the grain looks; a little
     nearer than view 4: there is less to show, and the water molecules are small */
  views.push({ zoom: 4, at: worldOf(hsite, stage.W < 560 ? V(2.0, -0.3, 0) : V(2.7, -0.3, 0)), dist: 16, dir: D(0.02, 0.02, 1), up: UP, fit: { pts: [[6.3, 4.1, 3]], min: 12 }, fitN: { pts: [[9.0, 4.1, 3]], min: 12 } });   /* (a phone: a little wider, so that each name has room beside its part) */

  /* 14 one cellulose fibre, from near (18 Nov 2026): where the course name of the fibres looks; the fibre, 3 nm wide,
     takes about a third of the picture's width, and its names stand on both sides */
  /* (a phone: a little farther, and the fibre a little to the left: three names stand on its right, each at its own
     level, and the fibre's own name on its left, under the small map) */
  views.push({ zoom: 4, at: stage.W < 560 ? worldOf(csite, V(stage.W < 385 ? 1.1 : 0.47, 0, 0)) : CSITEW.clone(), dist: 15, dir: D(0.02, 0.02, 1), up: UP, fit: { pts: [[2.4, 3.0, 2]], min: 10 }, fitN: { pts: [[1.9, 3.22, 2]], min: 8 } });

  /* 15 two glucose and their atoms (18 Nov 2026): where "a glycosidic bond" looks; about 2.3 nm across */
  views.push({ zoom: 3, at: worldOf(gmol, V(0, -0.03, 0)), dist: 4, dir: D(0.02, 0.02, 1), up: UP, fit: { pts: [[0.58, 0.54, 0.3]], min: 2.0 }, fitN: { pts: [[0.6, 0.62, 0.3]], min: 1.8 } });

  /* 16 a piece of the fibre and its atoms (19 Nov 2026): where "hydrogen bonds" looks; two chains, about 1.7 nm across */
  views.push({ zoom: 3, at: ASITEW.clone(), dist: 6, dir: D(0.02, 0.02, 1), up: UP, fit: { pts: [[0.98, (A_HIGH + 0.18 - A_YB) / 2, 0.4]], min: 3 }, fitN: { pts: [[0.93, (A_HIGH + 0.16 - A_YB) / 2, 0.4]], min: 2.4 } });
  /* 17 the cell in a solution (22 Nov 2026): the vacuole step's film. The step's own view, but with the whole cell clear of
     the film's caption: on a laptop the cell stands a little right of the middle (the caption is at the top left); on a
     phone the caption lies across the top of the picture, so the camera looks higher and from further, and the cell
     stands in the picture's lower three fifths */
  const SOLCAM = views.length, SOLN = stage.W < 560;
  views.push(SOLN ? { zoom: 20, at: V(14000, 27300, -1500), dist: 240000, dir: D(-0.08, 0.05, 1), up: UP, fit: { pts: [[R0 + 1500, 62300, 2000]], min: 110000 } }
    : { zoom: 20, at: V(-6000, 0, -1500), dist: 150000, dir: D(-0.08, 0.05, 1), up: UP, fit: { pts: [[R0 + 1500, HL + 2500, 2000]], min: 110000 } });

  /* ================= names: each on ONE level line that ends on its part ================= */
  const W = (x, y, z) => V(x, y, z);
  /* (the course name of the fibres, from far: on the fibre that it shows from near, then on the Year 7 name's own) */
  const cFar = () => [CSITEW.clone()].concat(fibres.filter(f => f.p.z > -60 && Math.abs(f.p.y) < 240).slice(0, 8).map(f => worldOf(ws, f.p)));
  /* (a name of the grain ends inside it, at its size now: smaller at night) */
  const grainPts = () => { const k = 1 - (1 - GN) * nightNow; return [GRAINW.clone().add(V(-120 * k, 300 * k, 0)), GRAINW.clone().add(V(-100 * k, -200 * k, 0)), GRAINW.clone()]; };
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
      /* (from 30 µm above the lower epidermis: lower, the line of sight goes on to the epidermis, and the name seemed to
         point at it: Daniel, 16 Nov 2026, "you don't know actually what this is pointing at") */
      for (let x = -3.0 * PX; x <= 3.0 * PX; x += 2000) for (let y = y0 + 30000; y <= y1 - 8000; y += 2000) {
        const p = V(x, y, 6000); let d = 1e9; for (const o of spo) if (!front || o.p.z > -22000) d = Math.min(d, off(o.p, p) - o.r * 1.22);
        d = Math.min(d, off(V(VEIN.x, VEIN.y, p.z), p) - VEIN.r - 3000); if (d > 1500) cand.push([d, p]); }
      cand.sort((a, b) => b[0] - a[0]); const out = [];
      for (const c of cand) { if (out.length >= 5) break; if (out.every(o => o.distanceTo(c[1]) > 14000)) out.push(c[1]); }
      return out; };
    const a = find(false).concat(find(true));
    return a.length ? a : [CAVE.clone().add(V(0, -6000, 0))]; })();
  const MEMV = [5.6, 4.4, 6.6, 3.2, 2, -4.6, -5.8, -3.4, 0.8, -1.4, 7.4, -6.8];
  const labels = {
    light: { html: 'light', side: 'r', pts: () => [3.0, 1.4, -0.2].map((k, i) => W(k * PX, HL + S.epiTop + 34000, -1.6 * PZ + ((i === 0 ? 4 : i === 1 ? 3 : 2) % 2) * 14000)) },
    wax: { html: 'a thin layer of wax', htmlN: 'wax', side: 'r', pts: () => [2.4, 3.3, 1.5].map(k => W(k * PX, HL + S.epiTop * 0.84 + 700, 7800)) },
    vein: { html: 'a vein: water arrives, sugar leaves', htmlN: 'a vein', side: 'l', pts: () => [W(VEIN.x - 5000, VEIN.y + 3000, VEIN.z0), W(VEIN.x - 9000, VEIN.y + 8000, VEIN.z0), W(VEIN.x - 2000, VEIN.y - 9000, VEIN.z0)] },
    skin: { html: 'the top layer of the leaf', htmlN: 'top layer', side: 'l', pts: () => [-3.4, -2.2, -1].map(k => W(k * PX, HL + S.epiTop * 0.55, 6000)) },
    pal: { html: 'a palisade cell', nm: 'palisade', side: 'l', pts: () => [W(-R0 + 600, 8000, 6500), W(-R0 + 600, -6000, 6500), W(-R0 + 600, 20000, 6500)] },
    spongy: { html: 'cells with air spaces between them', htmlN: 'air spaces', side: 'l', pts: () => spo.filter(o => o.p.z > -12000 && o.p.x < -8000).slice(0, 5).map(o => o.p.clone().add(V(0, 0, o.r * 0.9))) },
    hole: { html: 'a tiny hole: air enters here', htmlN: 'a tiny hole', side: 'r', pts: () => [HOLE.clone().add(V(0, 0, 0)), HOLE.clone().add(V(0, 2500, 0))] },
    /* (21 Nov 2026: a phone has no room on the cell's left, and the name stood on the cell with its line across it: there the name stands on the right, its line ending on the cell's right edge; the salivary gland cell's name, three short lines, on its own right, clear of the palisade cell's foot) */
    one: { html: 'one palisade cell: <b>72 µm</b> long', htmlN: 'palisade cell: <b>72 µm</b>', nm: 'palisadeat', side: stage.W < 560 ? 'r' : 'l', pts: () => [12000, 2000, 22000].map(y => W(stage.W < 560 ? R0 : -R0, y, 0)) },
    sal: { html: 'your salivary gland cell: <b>16 µm</b>', htmlN: 'your salivary<br>gland cell:<br><b>16 µm</b>', side: 'r', pts: () => [worldOf(sal, V(S.salivary / 2 - 300, 1500, 0)), worldOf(sal, V(S.salivary / 2 - 900, 3400, 0))] },
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
    /* (nm: with a course on, the name is the course's own: text.js NAMES; view.js namesPaint) */
    membrane: { html: 'cell membrane', nm: 'membrane', side: 'r', pts: () => MEM_Y.map(y => W(RIN - 4, y, 0)).concat(MEM_Y.map(y => W(-RIN + 4, y, 0))) },
    cyto: { html: 'cytoplasm', side: 'r', pts: () => [-27000, -24000, -30000, 16000].map(y => W((vacR(0, y) + RIN) / 2, y, 0)) },
    nucleus: { html: 'nucleus', side: 'r', pts: () => [nucleus.position.clone().add(V(600, 0, NUC.r)), nucleus.position.clone().add(V(1400, 900, NUC.r * 0.9))] },
    golgi: { html: 'a stack of the Golgi apparatus', htmlN: 'Golgi apparatus', side: 'l', pts: () => golgiSpots.filter(G => Math.cos(G.th) < 0.2).slice(0, 4).map(G => onWall(G).add(V(-300, 0, 500))) },
    er: { html: 'ER: a fine net of tubes', htmlN: 'ER', side: 'r', pts: () => erPts.filter(p => p.distanceTo(HCW) < 5200 && p.distanceTo(HCW) > 2700 && p.z < -300 && p.x > HCW.x + 200).slice(0, 6) },
    mito: { html: 'mitochondrion', side: 'r', pts: () => mitoSpots.filter(m => Math.sin(m.th) < -0.5 && Math.cos(m.th) > -0.1).slice(0, 5).map(m => onWall(m).add(V(0, 0, 330))) },
    chl: { html: 'chloroplast', side: 'l', pts: () => [HCW.clone().add(V(-hx + 80, 400, 0)), HCW.clone().add(V(-hx + 300, 1500, 0))].concat(chlPts()) },
    vac: { html: 'permanent vacuole', nm: 'vacuole', side: 'r', pts: () => [W(2600, 4000, 0), W(3200, -3000, 0), W(2000, 12000, 0)] },
    sap: { html: 'cell sap', side: 'l', pts: () => [W(-1800, -20000, 0), W(-2400, -26000, 0), W(-1500, -12000, 0)] },
    /* the vacuole step's film, the cell in a solution (22 Nov 2026; bath.js; text.js FILMS.sol, FILMS.solib): each name's
       line ends on its part as the part is NOW (the membrane leaves the wall; the wall keeps its place). The solution's
       names are each course's own word (0610: concentrated, dilute solution; the guide: hypertonic, hypotonic medium) */
    sconc: { html: 'a concentrated solution', htmlN: 'a concentrated<br>solution', side: 'r', pts: () => solPts() },
    sdil: { html: 'a dilute solution', htmlN: 'a dilute<br>solution', side: 'r', pts: () => solPts() },
    shyper: { html: 'a hypertonic medium', htmlN: 'a hypertonic<br>medium', side: 'r', pts: () => solPts() },
    shypo: { html: 'a hypotonic medium', htmlN: 'a hypotonic<br>medium', side: 'r', pts: () => solPts() },
    /* (a phone: the cell stands at the picture's left, so the film's longer names stand on its right; the one word
       "water" has room on the left, and the right side then has room for the others: on a 375 px phone "turgor
       pressure" had none) */
    /* (the line of an arrow's name ends on the arrow's outer end, bath.js arrowAt: never along the arrow) */
    swout: { html: 'water: net movement out of the cell', htmlN: 'water', side: 'l', pts: () => bath.arrowAt(solSc).filter(p => p.x < 0) },
    swin: { html: 'water: net movement into the cell', htmlN: 'water', side: 'l', pts: () => bath.arrowAt(solSc).filter(p => p.x < 0) },
    /* (many places along each edge, on both sides: a phone's small picture has room in few of them) */
    /* (the flaccid cell: the membrane has NOT left the wall. Said on the picture, in the membrane step's own word,
       "touches": a pupil reads "no longer press the cell membrane out against the cell wall" as "separated", which is
       plasmolysis, the next shot: the fresh science read, 28 Nov 2026) */
    /* (a long name: on a laptop it stands on the cell's left, where it has room, and ends on the membrane's left edge; on
       the right it had no room before the picture's edge, went to the left and its line crossed the whole cell. Many
       places along the membrane: on a 375 × 812 phone its three lines found none among six, and it crossed the cell) */
    smemat: { html: 'cell membrane: it still touches the cell wall', htmlN: 'cell membrane:<br>it still touches<br>the cell wall', nm: 'membrane', side: stage.W < 560 ? 'r' : 'l', pts: () => [-12000, -6000, -20000, 3000, -27000, 9000, -9000, -15000, -3000, -17000, 0, -23000, -25000, 6000, -30000, 12000].map(y => W((stage.W < 560 ? 1 : -1) * solSc.sx * (RIN - 4), y * solSc.sy, 0)) },
    smem: { html: 'cell membrane', nm: 'membrane', side: 'r', pts: () => [9000, 3000, 15000, -6000, -14000, 21000].map(y => W(solSc.sx * (RIN - 4), y * solSc.sy, 0)) },
    swall: { html: 'cell wall', side: 'r', pts: () => [24000, 28000, 20000, -22000, -28000, 31000, 12000, -10000].map(y => W(solSc.wx * (R0 - S.wall / 2), y * solSc.wy, 0)) },
    /* (the space between the wall and the membrane: there only once they are apart. The wall lets the solution through: the Year 7 words of the membrane step) */
    /* (a phone says the whole of it too, on three short lines, a phone's name being at most 11.5 em wide: with no name
       there, and "water" beside it, a pupil writes that the space holds water: the fresh science read, 28 Nov 2026.
       So on a phone the plasmolysed cell has three names, the membrane, the wall and what is between them; the
       solution round the cell is named by the caption and by this name) */
    sgap: { html: 'the solution: it passes through the cell wall', htmlN: 'the solution:<br>it passes through<br>the cell wall', side: stage.W < 560 ? 'r' : 'l', pts: () => solSc.plas > 0.6 ? [6000, 12000, 0, -8000, -16000].map(y => W((stage.W < 560 ? 1 : -1) * (solSc.sx + solSc.wx) * RIN / 2, y * solSc.wy, 0)) : [] },
    sgapib: { html: 'the medium: it passes through the cell wall', htmlN: 'the medium:<br>it passes through<br>the cell wall', side: stage.W < 560 ? 'r' : 'l', pts: () => solSc.plas > 0.6 ? [6000, 12000, 0, -8000, -16000].map(y => W((stage.W < 560 ? 1 : -1) * (solSc.sx + solSc.wx) * RIN / 2, y * solSc.wy, 0)) : [] },
    /* (its line ends on the arrow's point, where the arrow presses on the wall, and is long enough for the name to stand
       clear of the wall: the name had covered the wall that its arrow presses on) */
    sturg: { html: 'turgor pressure', side: stage.W < 560 ? 'r' : 'l', gaps: [44, 64, 96, 140], pts: () => arrows.children.filter(a => (stage.W < 560 ? a.userData.sd > 0 : a.userData.sd < 0) && arrows.visible).map(a => a.localToWorld(V(a.userData.sd * 3150, 0, 0))) },
    chl1: { html: 'one chloroplast: <b>5 µm</b> long', htmlN: 'chloroplast: <b>5 µm</b>', side: 'l', pts: () => [HCW.clone().add(V(-hx * 0.86, 1200, 0)), HCW.clone().add(V(-hx * 0.7, 1700, 0))] },
    stacks: { html: 'a stack of membranes: it holds chlorophyll', htmlN: 'a stack of membranes', side: 'r', pts: () => grana.filter(G => !G.hidden).sort((a, b) => a.p.z - b.p.z).slice(0, 6).map(G => worldOf(hc, G.p.clone().add(V(0, 0, -G.r * 0.9)))) },
    stroma: { html: 'a watery liquid, with many enzymes', side: 'l', pts: () => [worldOf(hc, V(hx * 0.5, -hy * 0.72, 0)), worldOf(hc, V(hx * 0.4, hy * 0.72, 0))] },
    /* the step's course names (17 Nov 2026; text.js XKEY.chloroplast and XKEY.chlorophyll; view.js "a name that shows its
       part"). The pigments are in the membranes: each of the two names ends on a stack (not the same ones); the
       thylakoid's ends on the one flat membrane that its look lights; the stroma's in the liquid, where no stack lies
       behind. With a course name on, the Year 7 name of the stacks is its short form */
    stacks2: { html: 'a stack of membranes', side: 'r', pts: () => grana.filter(G => !G.hidden && G !== G0).sort((a, b) => a.p.z - b.p.z).slice(0, 6).map(G => worldOf(hc, G.p.clone().add(V(0, 0, -G.r * 0.9)))) },
    xchlo: { html: 'chlorophyll', cls: 'plv-xlab', side: 'l', pts: () => memPts(0) },
    xpig: { html: 'photosynthetic pigments', htmlN: 'photosynthetic<br>pigments', cls: 'plv-xlab', side: 'l', pts: () => memPts(1) },
    /* (cut open: on its membrane at the cut edge; whole: on its round face and its rim) */
    xthy: { html: 'thylakoid', cls: 'plv-xlab', side: 'r', pts: () => tCutOn ? [0.45, 0.2, 0.7, -0.1].map(v => worldOf(hc, T_AT.clone().add(V(-(T_W - T_M) / 2, v * G0.r, -0.6))))
      : [worldOf(hc, T_AT.clone().add(V(-9, 0, 0)))].concat([0, 0.4, -0.4, 0.75, -0.75].map(v => worldOf(hc, T_AT.clone().add(V(0, v * G0.r, -G0.r * Math.sqrt(1 - v * v) * 0.98))))) },
    /* (in the near look only: the space inside the cut sac. A violet note, not a name to press: its words are the HL line's) */
    xlum: { html: 'fluid inside the thylakoid', htmlN: 'fluid inside<br>the thylakoid', cls: 'plv-xlab plv-xnote', side: 'r', pts: () => tCutOn ? [-0.45, -0.2, -0.7, 0.1].map(v => worldOf(hc, T_AT.clone().add(V(0, v * G0.r, -0.6)))) : [] },
    xstr: { html: 'stroma', cls: 'plv-xlab', side: 'r', pts: () => STR_PTS.map(q => worldOf(hc, q)) },
    grain: { html: 'a starch grain', side: 'l', through: true /* it lies inside the chloroplast, drawn through its cut face */, pts: () => grainPts() },
    /* the grain at night (18 Nov 2026): the same name on the smaller grain, and the dashed line of its size by day.
       With a course on the grain's name is the course's (text.js XKEY.grain, XKEY.grainStore): IGCSE "starch:
       insoluble" by day and "starch: less after one night in the dark" at night; IB, at night, "starch: hydrolysis at night", which
       shows the grain's surface from near: there it stands on the chain, with the water (a violet note, not a name to
       press: its words are the IB line's), the glucose that came away, and the grain */
    grainN: { html: 'a starch grain: at the end of the night', htmlN: 'the grain at the<br>end of the night', side: 'l', through: true, pts: () => grainPts() },   /* (the dashed line has a time, so the small grain has one too: without it the grain read as made smaller at once by the dark: the science read) */
    gday: { html: 'its size at the end of the day', htmlN: 'its size by day', side: 'r', through: true, pts: () => nightNow > 0.5 ? [50, 35, 62, 20, 130, 145].map(a => worldOf(hc, grain.position.clone().add(V(-300 * Math.cos(a * Math.PI / 180), 800 * Math.sin(a * Math.PI / 180), 0)))) : [] },
    xins: { html: 'starch: insoluble', cls: 'plv-xlab', side: 'l', through: true, pts: () => grainPts() },
    xdark: { html: 'starch: less after one night in the dark', htmlN: 'less starch after<br>one night in the dark', cls: 'plv-xlab', side: 'l', through: true, pts: () => grainPts() },
    xhyd: { html: 'starch: hydrolysis at night', htmlN: 'starch: hydrolysis', cls: 'plv-xlab', side: 'l', through: true, pts: () => hsite.visible ? [2, 1, 3, 0].map(k => worldOf(hsite, hAt(k).add(V(0, 0.3, 0)))) : grainPts() },
    /* (the science read, 18 Nov 2026: every name of the near view stands still through the whole play, clear of the six
       water molecules and of every path. The water's note: its line ends on the nearer of the two molecules that wait
       all through; "catalysed by an enzyme: not drawn", because water alone does not split starch. The glucose's
       name: on the first one that came away, once it rests. The grain's name: in the liquid, its line ending on the
       round ends of the chains, above everything that moves) */
    hwat: { html: 'water: one molecule is used to split each bond<br>(a hydrolysis reaction, catalysed by an enzyme: not drawn)', htmlM: 'water: one molecule is used<br>to split each bond<br>(a hydrolysis reaction,<br>catalysed by an enzyme: not drawn)', htmlN: 'water: 1 molecule<br>for each bond', cls: 'plv-xlab plv-xnote', side: stage.W < 560 ? 'l' : 'r', gaps: C_MID ? [64, 96, 140] /* (its four lines stand a little further out, where no water molecule passes: at 40 px the note waited for one to leave and then moved) */ : undefined, pts: () => hsite.visible ? [worldOf(hsite, stage.W < 560 ? hWat0(H_WAT - 1).add(V(-0.24, 0, 0)) : hWat0(H_USE).add(V(0.24, 0, 0)))] : [] },   /* (a phone: the note stands on the grain's side of the two, over the grain: on the liquid's side it lay on the four that wait above) */
    hglu: { html: 'glucose', side: 'r', pts: () => hsite.visible && hChain[H_N - 1].userData.away > 0.98 ? [worldOf(hsite, hGluTo(0).add(V(0.45, 0, 0)))] : [] },
    hgrain: { html: 'the starch grain: the ends of its chains', htmlN: 'the starch grain', side: 'r', pts: () => hsite.visible ? [[2, 3], [1, 3], [2, 4]].map(([n, j]) => worldOf(hsite, V(-rodBack(n, j) + 0.1, rodY(n, j), rodZ(n) + 0.45))) : [] },
    co2: { html: 'carbon dioxide', side: 'l', pts: () => co2.filter(m => m.visible).map(m => worldOf(site, m.position)) },
    h2o: { html: 'water', side: 'l', pts: () => h2o.filter(m => m.visible).map(m => worldOf(site, m.position)) },
    glu: { html: 'glucose', side: 'l', pts: () => glu.visible ? [worldOf(site, glu.position)] : [] },
    o2: { html: 'oxygen', side: 'l', pts: () => o2.filter(m => m.visible).map(m => worldOf(site, m.position)) },
    tmem: { html: 'a membrane of a stack: chlorophyll is in it', htmlN: 'chlorophyll is here', side: 'l', pts: () => [worldOf(site, V(3.7, -6.2, 0.4)), worldOf(site, V(3.7, 6.1, 0.4)), worldOf(site, V(3.7, -5.4, 0.4))] },
    enz: { html: 'enzymes', side: 'l', pts: () => [worldOf(site, V(-11.5, 2.6, 0.4)), worldOf(site, V(-12.4, -8.8, -1))] },
    /* the light step's course names (17 Nov 2026; text.js XKEY.light, and XKEY.chlorophyll again: fchlo is the name xchlo
       on this picture, where its line is shown happening: view.js nameKey). chlorophyll: on the green proteins of the
       membrane, which hold it; the thylakoid membrane: on its lipids; the stroma: in the liquid, clear of the molecules;
       glucose and oxygen: the molecules made, once they are there */
    fchlo: { html: 'chlorophyll', cls: 'plv-xlab', side: 'l', pts: () => [3, 0, 1, 4, 2].map(i => worldOf(site, V(4.9, PROT_Y[i], 0.3))) },
    xtm: { html: 'thylakoid membrane', htmlN: 'thylakoid<br>membrane', cls: 'plv-xlab', side: 'l', pts: () => [worldOf(site, V(3.7, 9.4, 0.4)), worldOf(site, V(3.7, -9.6, 0.4)), worldOf(site, V(3.7, 6.1, 0.4)), worldOf(site, V(3.7, -6.2, 0.4))] },
    xstm: { html: 'stroma', cls: 'plv-xlab', side: 'l', pts: () => [[0.6, 0.6], [1.4, -8.4], [1.6, 8.6]].map(([x, y]) => worldOf(site, V(x, y, 0.4))) },   /* (the open liquid between the enzymes and the membrane, where no molecule waits in either state of the light; among molecules the stage tries a name's points from the viewer's left, so the one wanted is the leftmost) */
    xglu: { html: 'glucose', cls: 'plv-xlab', side: 'l', pts: () => glu.visible ? [worldOf(site, glu.position)] : [] },
    xoxy: { html: 'oxygen', cls: 'plv-xlab', side: 'l', pts: () => o2.filter(m => m.visible).map(m => worldOf(site, m.position)) },
    starch: { html: 'glucose molecules joined in a chain: starch', htmlN: 'starch: a chain of glucose', side: 'r', pts: () => chainT.filter(m => m.visible).slice(5).map(m => worldOf(site, m.position)) },
    /* the starch step's course names (18 Nov 2026; text.js XKEY.starch, XKEY.starchUses): the chain, named for IGCSE
       ("starch") and for IB ("starch: a polysaccharide"), each from the chain's right end; and, with IB on, a violet
       note on the water molecules that came away (not a name to press) */
    xsta: { html: 'starch', cls: 'plv-xlab', side: 'r', pts: () => chainT.filter(m => m.visible).slice(10).reverse().map(m => worldOf(site, m.position)) },
    xpol: { html: 'starch: a polysaccharide', htmlN: 'polysaccharide', cls: 'plv-xlab', side: 'r', pts: () => chainT.filter(m => m.visible).slice(9).reverse().map(m => worldOf(site, m.position)) },
    /* (its line ends BESIDE the group, on no molecule: on a phone it lay on the thirteenth and hid it; its words tie
       "condensation" to the button's word, Join: the science read) */
    /* the zoom on the atoms (18 Nov 2026; text.js XKEY.starch, the row xgly). From far the name stands on one join of the
       chain; from near (fgly, the same name: view.js nameKey) on the oxygen atom that joins the two carbon atoms, once
       it is there. The two carbon atoms have their numbers, each on a short upright line; the water its name */
    xgly: { html: 'a glycosidic bond', htmlN: 'glycosidic<br>bond', cls: 'plv-xlab', side: 'l', pts: () => chainT[3].visible ? [[1, 2], [2, 3], [0, 1]].map(([a, b]) => worldOf(site, chainAt(a).add(chainAt(b)).multiplyScalar(0.5).add(V(0, 0.1, 0.5)))) : [] },
    fgly: { html: 'a glycosidic bond', htmlN: 'glycosidic<br>bond', cls: 'plv-xlab', side: 'r', pts: () => gsite.visible && gNow > 0.74 ? [worldOf(gmol, V(0, G_LOW, 0))] : [] },
    gc1: { html: 'carbon 1', side: 'l', pts: () => gsite.visible ? [worldOf(gmol, V(G_C1.x, G_TOP, 0))] : [] },
    gc4: { html: 'carbon 4', side: 'r', pts: () => gsite.visible ? [worldOf(gmol, V(G_C4.x, G_TOP, 0))] : [] },
    gwat: { html: 'water', side: 'l', pts: () => gsite.visible && gNow > 0.9 ? [worldOf(gmol, G_W1.clone().add(V(-0.112, 0.058, 0.05)))] : [] },   /* (just left of its left hydrogen atom, in front of it: a point inside the ball counted as hidden) */
    /* (20 Nov 2026: IB's own words; it said "from each join", Year 7's word, beside "a glycosidic bond": the science read) */
    xcw: { html: 'water: one molecule from each<br>condensation reaction', htmlN: '13 bonds: 13 water', cls: 'plv-xlab plv-xnote', side: 'r', pts: () => cWat[chainN - 2].visible ? [cWatTo(chainN - 2).add(V(0.55, 0.25, 0)), cWatTo(9).add(V(0, -0.75, 0)), cWatTo(3).add(V(0, -0.75, 0)), cWatTo(0).add(V(-0.55, 0.25, 0))].map(q => worldOf(site, q)) : [] },   /* (beside the group's right end; else just under the group; else beside its left end) */
    /* the wall step's course names (18 Nov 2026; text.js XKEY.wall, XKEY.wallG). From far the name stands on the
       fibres (first on the one that it shows from near). From near (csite): the name is on the chain that the play
       lights, at the fibre's right edge. IB: a violet note on a red mark of that chain (the beta-glucose monomers
       alternate in orientation), one on a hydrogen bond (its line must pass the first chain: a long line, so that the
       note stands clear of the fibre), and the fibre's own name. IGCSE: glucose, on one ring, and the fibre */
    /* (from far the course name is the Year 7 name itself, now a name to press: "cellulose: straight chains" on fibres,
       each a bundle of chains, taught that a fibre is a chain: the science read. From near, on ONE chain: fcel and
       fcelg, the same names for the view: view.js nameKey) */
    xcel: { html: 'cellulose fibres, each about <b>3 nm</b> wide', htmlN: 'cellulose fibres: <b>3 nm</b>', cls: 'plv-xlab', side: 'r', pts: () => cFar() },
    xcelg: { html: 'cellulose fibres, each about <b>3 nm</b> wide', htmlN: 'cellulose fibres: <b>3 nm</b>', cls: 'plv-xlab', side: 'r', pts: () => cFar() },
    fcel: { html: 'cellulose: a straight chain', htmlN: 'cellulose', cls: 'plv-xlab', side: 'r', pts: () => csite.visible ? [worldOf(csite, cAt(C_HERO, C_NARROW ? 2 : 4).add(V(C_FLAT + 0.02, 0, 0.1)))] : [] },
    fcelg: { html: 'one cellulose molecule', htmlN: 'one cellulose<br>molecule', cls: 'plv-xlab', side: 'r', pts: () => csite.visible ? [worldOf(csite, cAt(C_HERO, C_NARROW ? 2 : 4).add(V(C_FLAT + 0.02, 0, 0.1)))] : [] },
    cbeta: { html: 'beta-glucose monomers<br>alternate in orientation', htmlN: 'beta-glucose:<br>the red marks<br>change side', cls: 'plv-xlab plv-xnote', side: 'r', pts: () => csite.visible && cMarks > C_WIN + 2 ? [worldOf(csite, markAt(C_HERO, C_NARROW ? -3 : 1).add(V(0.065, 0, 0.1)))] : [] },   /* (a phone: two rings lower than it could be: on the shortest pictures it touched the chain's name above it and was put on the fibre) */
    /* (the key of the red mark, a note of its own on a laptop: a red ball is an oxygen atom in pupils' models) */
    cmark: { html: 'red mark: the same side group<br>of each monomer; it changes side', htmlM: 'red mark: the same<br>side group of each<br>monomer; it changes side', cls: 'plv-xlab plv-xnote', side: 'r', pts: () => csite.visible && cMarks > C_WIN + 2 ? [worldOf(csite, markAt(C_HERO, -3).add(V(0.065, 0, 0.1)))] : [] },
    /* (19 Nov 2026: a name to press, no longer a note: it shows the atoms of the bond that it rings; text.js XKEY.wall) */
    xhb: { html: 'hydrogen bonds:<br>they cross-link the chains', htmlM: 'hydrogen bonds:<br>they cross-link<br>the chains', htmlN: 'hydrogen<br>bonds', cls: 'plv-xlab', side: C_NARROW ? 'r' : 'l', pts: () => csite.visible && !asite.visible && cBond.count >= cBond.userData.n ? [worldOf(csite, C_HB.out)] : [] },
    /* the atoms of a piece of the fibre: the bond's name at the top of its line; the note of the −CH2OH
       group on carbon 6 of the group at the piece's right edge (a laptop) */
    fhb: { html: 'a hydrogen bond', htmlN: 'hydrogen bond', cls: 'plv-xlab', side: 'r', pts: () => asite.visible && A_TOPB.on ? [worldOf(asite, A_HEAD)] : [] },
    /* (four short lines: on a laptop window 1280 wide the note has 260 px on the piece's right) */
    aside: { html: 'the −CH<sub>2</sub>OH group<br>(the red mark):<br>it changes side from one<br>glucose to the next', htmlN: '−CH<sub>2</sub>OH group:<br>it changes side', cls: 'plv-xlab plv-xnote', side: 'r', pts: () => asite.visible && aLit > 0 ? [worldOf(asite, A_GRP.clone().add(V(0.046, 0, 0.06)))] : [] },   /* (its line ends on carbon 6 itself: on the hydroxyl's hydrogen atom, the −OH alone could be taken for the group: the science read) */
    cfib: { html: 'one fibre: a bundle of chains', htmlM: 'one fibre:<br>a bundle of chains', htmlN: 'one fibre', side: 'l', pts: () => csite.visible ? [worldOf(csite, V(C_XL - 0.02, C_BY, 0.3))] : [] },
    cfibg: { html: 'one fibre: about <b>3 nm</b> wide', htmlM: 'one fibre:<br>about <b>3 nm</b> wide', htmlN: 'one fibre', side: 'l', pts: () => csite.visible ? [worldOf(csite, V(C_XL - 0.02, C_BY, 0.3))] : [] },
    cgl: { html: 'glucose', side: 'r', pts: () => csite.visible ? [worldOf(csite, cAt(C_HERO, -4).add(V(C_FLAT + 0.02, 0, 0.1)))] : [] },
    fibres: { html: 'cellulose fibres, each about <b>3 nm</b> wide', htmlN: 'cellulose fibres: <b>3 nm</b>', side: 'r', pts: () => fibres.filter(f => f.p.z > -60 && Math.abs(f.p.y) < 240).slice(0, 8).map(f => worldOf(ws, f.p)) },
    wall2: { html: 'cell wall: about <b>200 nm</b> thick', htmlN: 'cell wall: <b>200 nm</b>', side: 'l', pts: () => [worldOf(ws, V(-22, 210, -4)), worldOf(ws, V(-10, 120, -4))] },
    lam: { html: 'a thin layer joins the two walls', htmlN: 'a thin layer', side: 'l', pts: () => [worldOf(ws, V(-S.wall / 2 - 20, -40, -4)), worldOf(ws, V(-S.wall / 2 - 20, 60, -4))] },
    next: { html: 'the wall of the next cell', side: 'l', pts: () => [worldOf(ws, V(-S.wall / 2 - 40 - S.wall * 0.6, -160, -4)), worldOf(ws, V(-S.wall / 2 - 40 - S.wall * 0.5, -240, -4))] },
    wmem: { html: 'cell membrane: two layers of lipids, with proteins', htmlN: 'cell membrane', nm: 'membrane', side: 'r', pts: () => [-9, 3, 12].map(y => worldOf(ws, V(S.wall / 2 + 2.9, y, 0.4))) },
    wwall: { html: 'cell wall', side: 'l', pts: () => [10, -4, 16].map(y => worldOf(ws, V(S.wall / 2 - 14, y, -6))) },
    wcyt: { html: 'cytoplasm', side: 'r', pts: () => [-14, 8, -4].map(y => worldOf(ws, V(S.wall / 2 + 20, y, -2))) },
    /* the scenes' names (memflow.js): the membrane (in osmosis by the definition's own words) and the carrier */
    /* (many points along the membrane, the upper ones first: the name stands clear of the caption, the counter and the
       followed particle's way) */
    mmem: { html: 'cell membrane', htmlN: 'cell<br>membrane', side: 'r', pts: () => MEMV.map(v => worldOf(ws, V(MEMX + 2.0, MEM_AT.diffusion + v, 0.1))) },
    mpp: { html: 'partially permeable membrane', htmlN: 'partially<br>permeable<br>membrane', side: 'r', pts: () => MEMV.map(v => worldOf(ws, V(MEMX + 2.0, MEM_AT.osmosis + v, 0.1))) },
    mmem2: { html: 'cell membrane', htmlN: 'cell<br>membrane', side: 'r', pts: () => MEMV.filter(v => Math.abs(v) > 4.2).map(v => worldOf(ws, V(MEMX + 2.0, MEM_AT.active + v, 0.1))) },
    /* the step's IB names (text.js XKEY.membrane; pin: its number on a phone) */
    xbil: { html: 'phospholipid bilayer', pin: 1, cls: 'plv-xlab', side: 'l', pts: () => [31, 28, 34].map(y => worldOf(ws, V(MEMX - 2.0, y, 0.1))) },
    xcore: { html: 'hydrophobic core', pin: 2, cls: 'plv-xlab', side: 'r', pts: () => [23, 21.4, 25].map(y => worldOf(ws, V(MEMX, y, -0.2))) },
    /* (the integral protein named is the carrier, at the cut face; the lump further back is one too) */
    xint: { html: 'integral protein', pin: 3, cls: 'plv-xlab', side: 'r', pts: () => [1.2, 0.4, 1.9].map(v => worldOf(ws, V(MEMX + 2.4, MEM_AT.active + v, 2.0))) },
    xper: { html: 'peripheral protein', pin: 4, cls: 'plv-xlab', side: 'r', pts: () => [0.2, -0.5, 0.8].map(v => worldOf(ws, PERI.clone().add(V(0.9, v, 1.0)))) },
    /* (points on both ends of the carrier: the name stands beside it, on the cytoplasm's side or the wall's, never on it) */
    mcar: { html: 'protein carrier', htmlN: 'protein<br>carrier', side: 'r', pts: () => [0.9, 1.5, 0.3].map(v => worldOf(ws, V(MEMX + 2.7, MEM_AT.active - v, 2.0))).concat([0.9, 1.5, 0.3].map(v => worldOf(ws, V(MEMX - 2.7, MEM_AT.active - v, 2.0)))) }
  };

  /* (a point on the viewer's left end of a stack, nearest the viewer: the stacks of the viewer's left half, those
     nearest the cut first, which are the plainest; odd: every second one) */
  function memPts(odd) { return grana.filter(G => !G.hidden && G !== G0 && G.p.x > -100).sort((a, b) => a.p.z - b.p.z).filter((_, i) => i % 2 === odd).slice(0, 6).map(G => worldOf(hc, V(G.p.x + (G.n - 1) / 2 * S.thylakoid, G.p.y, G.p.z - G.r * 0.96))); }
  /* the molecules no name may cover (the stage keeps every name and its line off these points) */
  const avoid = () => asite.visible ? aAll.map((q, i) => ({ p: worldOf(asite, q), id: 'a' + i })) : site.visible ? [...co2, ...h2o, ...o2, glu, ...chainT, ...cWat, ...enz].filter(m => m.visible).map((m, i) => ({ p: worldOf(site, m.position), id: 'm' + i }))
    : hsite.visible ? [...hChain, ...hWat].filter(m => m.visible).map((m, i) => ({ p: worldOf(hsite, m.position), id: 'h' + i })) : [];
  /* buttons that stand on a part (the view places them): where each one is */
  const hots = {
    chl: () => HCW.clone().add(V(0, 0, 200)), wall: () => W(R0 - S.wall / 2, 14000, 0), vac: () => W(0, -4000, 0),
    /* (a short picture, under 720 px: a little lower, clear of the equation's strip at the top) */
    light: () => stage.view.dist > 2000 ? HCW.clone().add(V(4200, 3600, 0)) : worldOf(site, V(-9.4, C_SHORT ? 5.3 : 6.5, 0)),
    join: () => worldOf(site, V(-1.6, -5.4, 2)), water: () => W(R0 + 1800, 22000, 0),
    night: () => worldOf(hc, grain.position.clone().add(V(-560, -620, 0)))
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
    /* (17 Nov 2026) with a course on, its names (labsC; c: which courses are on, and hl: IB at HL): IGCSE names
       chlorophyll; IB names the photosynthetic pigments and, at HL, the thylakoid and the stroma; while the thylakoid is
       looked at from near (c.look), only it and the fluid inside it are named. looks: what the picture does when a name
       is pressed, before its card opens: the camera's view, and the part that lights. On a phone, and beside course
       names, the chloroplast's own size is a second name (rank 2): it stood on the stacks there */
    { id: 'chloroplast', phases: [{ to: { hiC: 0, hiW: 0, hiV: 0, cam: 3 }, ms: 3800 }], labs: { chl1: 1, stacks: 1, stroma: 2, er: 2 },
      labsC: c => c.look === 'xthy' && c.hl ? { xthy: 1, xlum: 1 }
        : Object.assign({ chl1: c.igcse || c.ib ? 2 : 1 }, c.igcse ? { xchlo: 1 } : {}, c.ib ? { xpig: 1 } : {}, c.hl ? { xthy: 1, xstr: 1 } : { stroma: 2 }, c.igcse || c.ib ? { stacks2: 2 } : { stacks: 1 }, { er: 2 }),
      /* (where: for the near look's small map: the chloroplast's size and where the picture now is in it, nm, x to the viewer's right) */
      looks: { xchlo: { cam: 3, hiM: 1 }, xpig: { cam: 3, hiM: 1 }, xthy: { cam: 11, hiT: 1 }, xstr: { cam: 3, hiS: 1 } },
      where: { xthy: { w: S.chlThick, h: S.chl, x: -T_AT.x, y: T_AT.y, name: 'the chloroplast' } } },
    { id: 'light', phases: [{ to: { day: 0 }, ms: 900 }, { to: { cam: 4 }, ms: 4200 }], labs: { co2: 1, h2o: 1, tmem: 1, enz: 1 },
      press: { toggle: { at: 'light', side: 'c', states: [
        { label: '☀ Light on', to: { day: 1 }, ms: 700, then: [{ to: { ps: 1 }, ms: 3200 }, { to: { ps: 2 }, ms: 2800 }], labs: { glu: 1, o2: 1, tmem: 2, enz: 1 }, say: 'on' },
        { label: '☾ Light off', to: { day: 0, ps: 0 }, ms: 900, labs: { co2: 1, h2o: 1 }, say: 'off' }] } },
      end: { day: 1, ps: 2 }, endLabs: { glu: 1, o2: 1 },
      /* (17 Nov 2026) with a course on, the names the step would show (c.base, by the light's state) get the course's:
         IGCSE: chlorophyll, on the membrane's green proteins (in place of the Year 7 name of that membrane); IB: the
         glucose and the oxygen made are names to press; at HL also the thylakoid membrane and the stroma */
      labsC: c => { const L = Object.assign({}, c.base);
        if (c.igcse) { delete L.tmem; L.fchlo = 1; }
        if (c.ib) { if (L.glu) { delete L.glu; L.xglu = 1; } if (L.o2) { delete L.o2; L.xoxy = 1; } }
        if (c.hl) { L.xstm = 1; L.xtm = 1; delete L.tmem; }
        /* (with a course on, the enzymes keep their name in every state of the light, and at SL the membrane its Year 7 name) */
        if (!L.enz) L.enz = 2; if (!c.igcse && !c.hl && !L.tmem) L.tmem = 2;
        return L; },
      /* the equation's terms that the picture shows now (text.js EQS.light; view.js "the equation's strip"): light and
         chlorophyll while the light is on (the green proteins shine); a reactant once it has been used (the water gone
         into the membrane, the carbon dioxide into the enzyme), never while it only waits; a product once it is there */
      eq: K => { const a = smooth(0, 1, K.ps), b = smooth(1, 2, K.ps), on = K.day > 0.5; return { light: on, chl: on, h2o: on && a > 0.88, o2: on && a > 0.93, co2: on && a > 0.97, glu: on && b > 0.25 }; } },
    { id: 'starch', phases: [{ to: { day: 1, ps: 2 }, ms: 0 }, { to: { cam: 12 }, ms: stage.W < 560 ? 900 : 0 }],
      press: { all: [{ id: 'join', label: 'Join', w: 'join', at: 'join', side: 'r', to: { chain: 1 }, ms: 4200, labs: { starch: 1 } }] },
      end: { chain: 1 }, endLabs: { starch: 1 }, labs: { glu: 1 },
      /* (18 Nov 2026) with a course on, once the chain is there (c.base has its Year 7 name) the course names it: IGCSE
         "starch", IB "starch: a polysaccharide", and with IB the water from each condensation has its note */
      labsC: c => { if (c.look === 'xgly') return { fgly: 1, gc1: 1, gc4: 1, gwat: 1 };
        const L = Object.assign({}, c.base);
        /* (both courses: ONE name on the chain, IB's, which holds the word starch; IGCSE's is then a chip in its box) */
        if (L.starch) { delete L.starch; if (c.igcse && !c.ib) L.xsta = 1; if (c.ib) { L.xpol = 1; L.xcw = 1; L.xgly = 1; } }
        return L; },
      /* (the IB zoom on the atoms of one join: a look that plays; the corner holds the atoms' key, not a map) */
      looks: { xgly: { cam: 15, play: { to: { gly: 1 }, ms: 9000, still: { gly: 1, garr: 1 } } } },
      /* (the key says also what is small and what is left out: without it the pale balls were a fourth kind of atom and each carbon atom seemed to have two or three bonds: the science read) */
      where: { xgly: { key: [['#9aa3b5', 'carbon'], ['#ff7b7b', 'oxygen'], ['#ffffff', 'hydrogen'], ['#a86a6a', 'small: an −OH group that takes no part']], note: 'Not drawn: the hydrogen atoms on carbon',
        /* (a phone's picture has room for the three atoms only: the rest of the key is said on the card, under the picture) */
        under: 'In the picture: a small dark red ball is an −OH group that takes no part; the hydrogen atoms on carbon are not drawn.' } } },
    /* (18 Nov 2026) Night is a press, for every pupil: the light goes off (the knob day, as in the light step: look.js), the grain gets
       smaller and a dashed line keeps its size by day; Day brings the light and the grain back. With a course on the
       grain's name is the course's (c.base tells day from night by the grain's own name). IB at night: the name shows
       the grain's surface from near, and there (c.look) the names are the near picture's. looks.play: what the picture
       does once the camera is there (still: with Reduce motion, the moment held) */
    { id: 'grain', phases: [{ to: { cam: 5, grain: 0 }, ms: 3600 }, { to: { grain: 1 }, ms: 2600 }], labs: { grain: 1, stacks: 2 },
      press: { toggle: { at: 'night', side: 'r', states: [
        { label: '☾ Night', to: { day: 0, night: 1 }, ms: 2800, labs: { grainN: 1, gday: 1 }, say: 'night' },
        { label: '☀ Day', to: { day: 1, night: 0 }, ms: 2400, labs: { grain: 1, stacks: 2 }, say: 'day' }] } },
      end: { day: 1, night: 0 }, endLabs: { grain: 1, stacks: 2 },
      labsC: c => { if (c.look === 'xhyd') return { xhyd: 1, hwat: 1, hglu: 1, hgrain: 1 };
        const L = Object.assign({}, c.base);
        if (L.grainN) { if (c.ib) { delete L.grainN; L.xhyd = 1; } else if (c.igcse) { delete L.grainN; L.xdark = 1; } }
        else if (L.grain && c.igcse) { delete L.grain; L.xins = 1; }
        return L; },
      looks: { xhyd: { cam: 13, play: { to: { hyd: 1 }, ms: 10000, still: { hyd: H_T0[2] + 0.2 * H_D[2], harr: 1 } } } },
      where: { xhyd: { w: 600 * GN, h: 1600 * GN, x: 300 * GN, y: 0, name: 'the starch grain', pale: true } } },
    /* (18 Nov 2026) with a course on, the fibres' name is the course's and a name to press: it shows one fibre from
       near and plays its chains (looks.play), then its card says the line. Year 7's picture and names are as before */
    { id: 'wall', phases: [{ to: { cam: 2 }, ms: 2600 }, { to: { cam: 6 }, ms: 4200 }], labs: { wall2: 1, fibres: 1, next: 2, lam: 2 },
      /* (the narrowest phones have no room on the fibre's left for its own name: there it and its bracket are away) */
      labsC: c => { const fb = stage.W >= 385; if (c.look === 'xcel') return Object.assign({ fcel: 1, cbeta: 1, xhb: 1 }, fb ? { cfib: 1 } : {}, C_NARROW ? {} : { cmark: 1 }); if (c.look === 'xhb') return C_NARROW ? { fhb: 1 } : { fhb: 1, aside: 1 }; if (c.look === 'xcelg') return Object.assign({ fcelg: 1, cgl: 1 }, fb ? { cfibg: 1 } : {});
        const L = Object.assign({}, c.base); if (L.fibres) { delete L.fibres; if (c.ib) L.xcel = 1; else if (c.igcse) L.xcelg = 1; else L.fibres = 1; } return L; },
      looks: { xcel: { cam: 14, play: { to: { cel: 1 }, ms: 9000, still: { cel: 1 } } }, xcelg: { cam: 14, play: { to: { cel: 1 }, ms: 7000, still: { cel: 1 } } },
        /* (from the fibre's near view on into its atoms: the fibre stays as it is, cel 1, while the camera goes; cta keeps the ring round the bond until the atoms are there) */
        xhb: { cam: 16, cel: 1, cta: 1, play: { to: { cat: 1 }, ms: 9000, still: { cat: 1 } } } },
      where: (W => ({ xcel: W, xcelg: W, xhb: { key: [['#9aa3b5', 'carbon'], ['#ff7b7b', 'oxygen'], ['#ffffff', 'hydrogen'], ['#ffe9a0', 'yellow bond: a glycosidic bond (carbon 1 − O − carbon 4)'], ['#fff3c4', '1, 4, 6: the number of a carbon atom']], note: 'Not drawn: the next chains on each side (faint dashes lead to them); the hydrogen atoms on carbon; the hydrogen bonds inside one chain. Each chain goes on at both ends.', under: 'In the picture: the −CH<sub>2</sub>OH group (the red mark) changes side from one glucose to the next. A yellow bond is a glycosidic bond (C−O−C). Not drawn: the next chains on each side (faint dashes lead to them); the hydrogen atoms on carbon; the hydrogen bonds inside one chain.' } }))({ w: S.wall, h: 300, x: Math.max(-S.wall / 2, Math.min(S.wall / 2, csite.position.x)), y: Math.max(-140, Math.min(140, csite.position.y)), name: 'the cell wall', rect: true }) },
    { id: 'membrane', phases: [{ to: { cam: 7 }, ms: 3200 }], labs: { wwall: 1, wmem: 1, wcyt: 1 },
      labsIB: { xbil: 1, xcore: 1, xint: 1, xper: 1, wwall: 2, wcyt: 2 } },
    { id: 'vacuole', phases: [{ to: { cam: 8 }, ms: 4200 }, { to: { push: 1, hiV: 0.6 }, ms: 900 }], labs: { vac: 1, sap: 1, wall: 2 },
      press: { toggle: { at: 'water', side: 'r', states: [
        { label: '💧 Lose water', w: 'lose', to: { firm: 0, hiV: 0.2 }, ms: 2200, labs: { vac: 1 }, say: 'soft' },
        { label: '💧 Take in water', w: 'take', to: { firm: 1, hiV: 0.6 }, ms: 2200, labs: { vac: 1, sap: 1 }, say: 'firm' }] } },
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
  /* the course layer's two films (16 Nov 2026, rebuilt the same evening): shots in this picture, with the camera's own
     views and the names they need (films.js; view.js plays them) */
  /* ---- a film's section (16 Nov 2026): the piece's front face as a transverse section ----
     The spongy cells stand a little out of the piece's front face (their middles are behind it), so from in front the air
     spaces between them hardly show, and a molecule in an air space behind one seemed to be inside it. During a film the
     face is a section, as in the textbook's transverse section of a leaf: everything in front of the plane of the cut
     stoma and the cut vein goes, and each spongy cell the plane cuts shows its cut face (its outline, its cut
     chloroplasts and nucleus), with the air spaces dark between them. Only the films use it (the knob `sect`). */
  const FACE_Z = 8200, faceF = new THREE.Plane(V(0, 0, -1), 1e9);
  /* (and a back face, 14 µm behind it: a thick section, as under a microscope, so that between the cut cells the air
     spaces are dark, not the cells further back; the expert review, 16 Nov 2026: molecules in an air space, seen against
     a cell behind it, looked as if they were inside that cell) */
  const BACK_Z = -6000, backF = new THREE.Plane(V(0, 0, 1), 1e9);
  [spoMat, nbChl, nbNucMat].forEach(m => { m.clippingPlanes = [faceF, backF]; });
  [nbWall, epiMat, guardMat, slitMat, ...extra.filter(m => ![spoMat, nbNucMat].includes(m))].forEach(m => { m.clippingPlanes = (m.clippingPlanes || []).concat([backF]); });
  const BLOBK = (x, y, z) => 0.9 + 0.3 * Math.sin(x * 2.6 + y * 1.9 + 0.7) * Math.sin(z * 2.9 - x * 1.5) + 0.07 * Math.sin(y * 5 + z * 4);
  const inCell = (o, p, qi) => { const l = p.clone().sub(o.p).applyQuaternion(qi); l.set(l.x / o.s.x, l.y / o.s.y, l.z / o.s.z); const n = l.length(); return n < 1e-9 || n < BLOBK(l.x / n, l.y / n, l.z / n); };
  const capsG = new THREE.Group(); capsG.visible = false; leaf.add(capsG);
  const capMats = [], cut2 = [];
  { const fill = new THREE.MeshBasicMaterial({ color: 0xbfe09a, transparent: true, opacity: 0, depthWrite: true, side: THREE.DoubleSide }), rim2 = new THREE.LineBasicMaterial({ color: 0xf2ffd8, transparent: true, opacity: 0 });
    const chlC = new THREE.MeshBasicMaterial({ color: 0x3a9a44, transparent: true, opacity: 0 }), nucC = new THREE.MeshBasicMaterial({ color: PAL.nucleus, transparent: true, opacity: 0 });
    capMats.push([fill, 0.9], [rim2, 0.95], [chlC, 0.95], [nucC, 0.9]);
    const discs = [], nucs = [], rimChl = [];
    spo.forEach(o => { if (o.p.z + Math.max(o.s.x, o.s.y, o.s.z) * 1.3 < FACE_Z) return; const qi = o.q.clone().invert(), c = V(o.p.x, o.p.y, FACE_Z);
      if (!inCell(o, c, qi)) return;
      const pts = []; for (let k = 0; k < 72; k++) { const a = k / 72 * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a); let r = 0; while (r < 40000 && inCell(o, V(c.x + dx * (r + 150), c.y + dy * (r + 150), FACE_Z), qi)) r += 150; pts.push(new THREE.Vector2(c.x + dx * r, c.y + dy * r)); }
      const area = pts.reduce((a, q, i) => { const n = pts[(i + 1) % pts.length]; return a + q.x * n.y - n.x * q.y; }, 0) / 2; if (Math.abs(area) < 4e6) return;
      const m = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(pts), 1), fill); m.position.z = FACE_Z - 4; m.renderOrder = 3; m.raycast = () => {}; capsG.add(m);
      const ln = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts.map(q => V(q.x, q.y, FACE_Z - 2))), rim2); ln.renderOrder = 4; capsG.add(ln);
      cut2.push({ o, c, pts });
      /* a cell in section: its chloroplasts lie along its wall (the vacuole presses them there), each a lens cut across */
      { let run = 0; for (let k = 0; k < pts.length; k++) { const q0 = pts[k], q1 = pts[(k + 1) % pts.length], L = q0.distanceTo(q1); run += L; if (run < 3400) continue; run = 0;
          const t = V(q1.x - q0.x, q1.y - q0.y, 0).normalize(), inw = V(c.x - q0.x, c.y - q0.y, 0).normalize(), p = V(q0.x, q0.y, 0).addScaledVector(inw, 1300);
          rimChl.push({ p: V(p.x, p.y, FACE_Z - 1), q: new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), t), s: V(1050, 2050, 1) }); } }
      /* its cut chloroplasts (those the plane passes through) and, if the plane cuts it, its nucleus */
      spoChl.forEach(h => { if (Math.abs(h.p.z - FACE_Z) < 1100 && inCell(o, V(h.p.x, h.p.y, FACE_Z), qi)) discs.push(h.p); });
      nbNuc.forEach(h => { if (Math.abs(h.p.z - FACE_Z) < 2400 && h.p.distanceTo(o.p) < o.r && inCell(o, V(h.p.x, h.p.y, FACE_Z), qi)) nucs.push(h.p); }); });
    const disc = new THREE.CircleGeometry(1, 20);
    if (rimChl.length) { const d = many(new THREE.CircleGeometry(1, 20), chlC, rimChl); d.renderOrder = 4; d.raycast = () => {}; capsG.add(d); }
    if (discs.length) { const d = many(disc, chlC, discs.map(p => ({ p: V(p.x, p.y, FACE_Z - 1), s: V(1150, 1700, 1) }))); d.renderOrder = 4; d.raycast = () => {}; capsG.add(d); }
    if (nucs.length) { const d = many(disc, nucC, nucs.map(p => ({ p: V(p.x, p.y, FACE_Z - 1), s: V(2600, 2600, 1) }))); d.renderOrder = 4; d.raycast = () => {}; capsG.add(d); } }
  /* (during a film the spongy and palisade cells hide the molecules behind them, as solid things do: a copy of each that
     only writes depth, drawn after the cells and before the molecules, so the molecules show only in the air spaces
     between the cells and never seem to be inside one; the cells themselves, and what is in them, look as before) */
  const depthOnly = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true, transparent: true, clippingPlanes: [backF] }), depthCut = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true, transparent: true, clippingPlanes: [faceF, backF] });
  const twins = [[spoWalls, blob, depthCut], [palWalls, palWalls.geometry, depthOnly]].map(([m, geo, dm]) => { const d = new THREE.InstancedMesh(geo, dm, m.count); d.instanceMatrix = m.instanceMatrix; d.renderOrder = 5; d.frustumCulled = false; d.visible = false; d.raycast = () => {}; leaf.add(d); return d; });
  const film = makeFilms({ S, spo, pal, HOLE, CAVE, CAVES, STOMA, VEIN, y0, y1, HL, R0, PX, PZ, KB, KT, AIR, rng, views, labels, stage, cut: cut2, slab: [BACK_Z, FACE_Z], depth: on => twins.forEach(d => { d.visible = on; }) });
  g.add(film.group);
  /* the vacuole step's film (22 Nov 2026): the cell in a solution, each course's own (text.js FILMS.sol, FILMS.solib: a
     shot's words are a piece of one course line of the step). A shot: the view (the step's own), its moves in order
     (set: knobs changed at once; to, ms: knobs changed over that time), how long before Next (secs), its names. The
     (A phone's picture has room for three names in a shot: there the flaccid cell's are what the film brings, the
     solution, the membrane still on the wall, the water's arrow; the vacuole's name, on the step's own picture a moment
     before, stays for a laptop: on a 375 × 812 phone a fourth name lay on the cell.) The
     order of the moves is the order of cause and effect: FIRST the solution round the cell changes (its dots), with
     no arrow; THEN the water moves (the arrows, in the new direction) and the cell changes. The fresh science read,
     28 Nov 2026: all had changed side by side, so arrows pointed out of the cell under "Water enters the cell". IGCSE: flaccid, then plasmolysed, in
     a concentrated solution; then turgid, in a dilute one. IB: plasmolysed in a hypertonic medium; turgor pressure in a
     hypotonic one. The leaf's films are films.js's: one film object for the view, which asks it by a film's name */
  const solShots = {
    sol: [
      { id: 'sol-flaccid', cam: SOLCAM, moves: [{ set: { flow: 0 } }, { to: { sol: 1, conc: 1, push: 1 }, ms: 1500 }, { set: { flow: -1 } }, { to: { firm: 0, plas: 0, hiV: 0.2 }, ms: 2800 }], secs: 3.4, labs: { sconc: 1, swout: 1, smemat: 1, vac: 2 } },
      { id: 'sol-plasmolysed', cam: SOLCAM, moves: [{ set: { flow: -1 } }, { to: { plas: 1 }, ms: 3400 }], secs: 3.4, labs: { smem: 1, swall: 1, sgap: 1, sconc: 2 } },
      { id: 'sol-turgid', cam: SOLCAM, moves: [{ set: { flow: 0 } }, { to: { conc: 0 }, ms: 1500 }, { set: { flow: 1 } }, { to: { plas: 0, firm: 1, hiV: 0.6 }, ms: 4200 }], secs: 3.8, labs: { sdil: 1, swin: 1, sturg: 1 } }],
    solib: [
      { id: 'solib-hypertonic', cam: SOLCAM, moves: [{ set: { flow: 0 } }, { to: { sol: 1, conc: 1, push: 1 }, ms: 1500 }, { set: { flow: -1 } }, { to: { firm: 0, plas: 1, hiV: 0.2 }, ms: 4600 }], secs: 4.2, labs: { smem: 1, swall: 1, sgapib: 1, shyper: 2, swout: 2 } },
      { id: 'solib-hypotonic', cam: SOLCAM, moves: [{ set: { flow: 0 } }, { to: { conc: 0 }, ms: 1500 }, { set: { flow: 1 } }, { to: { plas: 0, firm: 1, hiV: 0.6 }, ms: 4200 }], secs: 4, labs: { shypo: 1, swin: 1, sturg: 1 } }] };
  const solNowF = { hero: V(), words: '', on: false, id: null, shot: -1, drawn: 0 };
  const filmAll = { group: film.group, views: film.views, shots: Object.assign({}, film.shots, solShots),
    frame(id, si, t, ts, still) { if (id && solShots[id]) { film.frame(null); solFilm = { ts, still: !!still }; solNowF.id = id; solNowF.shot = si; return; } solFilm = null; solNowF.id = null; film.frame(id, si, t, ts, still); },
    get now() { return solFilm ? solNowF : film.now; }, route: (id, si) => solShots[id] ? [] : film.route(id, si), check: film.check, near: film.near };
  return { group: g, knobs, views, steps, labels, hots, draw, measure, avoid, film: filmAll, mem: memSc,
    /* (the cell in a solution, as drawn now: tools/plant-check.mjs X) */
    bathNow: () => Object.assign({ sc: Object.assign({}, solSc), plas: [PLAS.x, PLAS.y], push: arrows.visible ? arrowMat.opacity : 0, nb: nbWall.opacity, firmLine: firmLine.visible, gap: gapFace.visible ? gapMat.opacity : 0 }, bath.now, bath.counts), narrowZoom: 1, turn: true, dusk: () => nightNow * (hsite.visible ? 0 : 1), named: keys => { namedNow = {}; (keys || []).forEach(k => { namedNow[k] = 1; }); }, course: c => { courseNow = c || {}; },
    atomsNow: () => { const D = (a, b) => a.p.distanceTo(b.p), A = gAtoms.A, B = gAtoms.B; return { near: gsite.visible, gly: gNow, atoms: Object.keys(G_AT).length * 2,
      /* nm: the ring's bonds; the old bond of carbon 1's oxygen; the two bonds of the bridge; the water's two bonds and its distance from the bridge */
      ring: D(A.C1, A.C2), c1o1: D(A.C1, A.O1), c1o: D(A.C1, B.O4), c4o: D(B.C4, B.O4), oh: [D(A.O1, A.H1), D(A.O1, B.H4)], o4h4: D(B.O4, B.H4), away: A.O1.p.distanceTo(G_BRIDGE),
      old: gOld1.m.visible, bond: gNew.m.visible, arrow: gArrow.visible, ghosts: gGhosts.filter(m => m.visible).length, angle: (() => { const a = A.C1.p.clone().sub(B.O4.p), b = B.C4.p.clone().sub(B.O4.p); return Math.round(a.angleTo(b) * 180 / Math.PI); })(), o6h6: D(A.O6, A.H6), c6o6: D(A.C6, A.O6),
      /* (how near, on the screen's plane, a pale ball stands to a ring atom of its own glucose that is not its carbon: nm) */
      clear: Math.min(...['A', 'B'].flatMap(n => [['O3', 'C3'], ['O2', 'C2']].flatMap(([o, own]) => ['C1', 'C2', 'C3', 'C4', 'C5', 'O5'].filter(k => k !== own).map(k => { const p = gAtoms[n][o].p.clone().applyAxisAngle(V(1, 0, 0), gmol.rotation.x), q = gAtoms[n][k].p.clone().applyAxisAngle(V(1, 0, 0), gmol.rotation.x); return Math.hypot(p.x - q.x, p.y - q.y); })))), down1: A.O1.p.y < A.C1.p.y || gNow > 0.3, alpha: G_AT.O1[1] < 0 && G_AT.O4[1] < 0 }; },
    /* (the piece of the fibre and its atoms: counts, and lengths in nm) */
    fibreAtomsNow: () => { const D = (a, b) => a.distanceTo(b), ang = (a, o, b) => Math.round(a.clone().sub(o).angleTo(b.clone().sub(o)) * 180 / Math.PI), k = A_K0;
      return { near: asite.visible, cat: aNow, chains: 2, rings: A_KS.length, atoms: aAll.length, step: D(aMid(0, k), aMid(0, k + 1)), row: D(aMid(0, k), aMid(1, k)),
        cc: D(aPos(0, k, 'C1'), aPos(0, k, 'C2')), co: [D(aPos(0, k, 'C1'), aBridge(0, k)), D(aBridge(0, k), aPos(0, k + 1, 'C4')), D(aPos(0, k, 'C6'), aPos(0, k, 'O6'))], cOc: ang(aPos(0, k, 'C1'), aBridge(0, k), aPos(0, k + 1, 'C4')),
        oh: [D(aPos(0, k, 'O6'), aPos(0, k, 'H6')), D(aPos(0, k, 'O3'), aPos(0, k, 'H3')), D(aPos(0, k, 'O2'), aPos(0, k, 'H2'))], hbond: aHb.map(b => b.L), oo: aHb.map(b => b.oo), from: aHb.map(b => b.from), bonds: aHb.filter(b => b.on).length, dashes: aHb.reduce((n, b) => n + b.dash.filter(m => m.visible).length, 0), allBonds: aHb.length,
        /* inside one chain: the two pairs of −OH groups that bond in cellulose (not drawn as bonds), O to O; the faint dashes outward; the numbers; δ+ and δ− */
        o3o5: D(aPos(0, k + 1, 'O3'), aPos(0, k, 'O5')), o2o6: D(aPos(0, k, 'O2'), aPos(0, k + 1, 'O6')), stubs: aHb.reduce((n, b) => n + b.stub.filter(m => m.visible).length, 0), nums: aNums.length, delta: aDelta.every(sp => sp.visible), dashR: 0.008,
        lit: aLit, halo: aHalo.map(r => +r[0].material.opacity.toFixed(2)), lead: aLeadB.visible, top: A_TOPB.on,
        /* does the −CH2OH group change side from each ring to the next, and the ring's oxygen atom with it; is each chain straight */
        alternate: A_KS.every((q, n) => n === 0 || Math.sign(aPos(0, q, 'C6').x - aMid(0, q).x) !== Math.sign(aPos(0, A_KS[n - 1], 'C6').x - aMid(0, A_KS[n - 1]).x)) && A_KS.every(q => Math.sign(aPos(0, q, 'O5').x - aMid(0, q).x) === Math.sign(aPos(0, q, 'C6').x - aMid(0, q).x)),
        bend: Math.max(...A_KS.map(q => Math.abs(aMid(0, q).x - aMid(0, k).x))),
        /* the nearest that two atoms that are not bonded stand (nm), on the picture's plane */
        clear: (() => { let m = 9; for (let i = 0; i < aAll.length; i++) for (let j = i + 1; j < aAll.length; j++) { const d = Math.hypot(aAll[i].x - aAll[j].x, aAll[i].y - aAll[j].y); if (d < m) m = d; } return m; })(),
        px: aAll.map(q => worldOf(asite, q)), ring: cHbRing.visible } },
    /* (what a name's card must not cover: the atoms of the piece; view.js showCard) */
    /* (and, in the fibre's near view, the fibre itself across its width: its card had stood on it, over the mark of its width) */
    keepClear: () => (asite.visible ? aAll.map(q => worldOf(asite, q)) : csite.visible ? [-9, -6, -3, 0, 3, 6, 9].flatMap(j => [C_XL, (C_XL + C_XR) / 2, C_XR].map(x => worldOf(csite, V(x, C_BY + j * C_STEP, 0.3)))) : []),
    wallNow: () => ({ near: csite.visible, cel: K_cel(), chains: C_SHEETS * C_N, front: C_N, step: C_STEP, row: C_ROW, ring: 2 * C_FLAT, across: (C_N - 1) * C_ROW + 2 * C_FLAT, fibre: S.fibre, rings: C_K.length,
      hero1: cHeroMat.color.r / cHeroMat.userData.c0.r, heroMarks: cHeroMark.count, marks: cHeroMark.count + cFrontMark.count, bonds: cBond.count / 2, allBonds: cBond.userData.n / 2, bracket: cBracket[0].visible, hbRing: cHbRing.visible, ends: [worldOf(csite, V(C_XL, 0, 0.3)), worldOf(csite, V(C_XR, 0, 0.3))],
      /* along the first chain: does every ring's mark stand on the other side from the one before, and is the chain straight (nm off its line) */
      alternate: C_K.every((k, n) => n === 0 || cSide(C_HERO, k) !== cSide(C_HERO, C_K[n - 1])), bend: Math.max(...C_K.map(k => Math.abs(cAt(C_HERO, k).x - cAt(C_HERO, 0).x))), front1: cFrontMat.color.r / cFrontMat.userData.c0.r, back1: cBackMat.color.r / cBackMat.userData.c0.r }),
    grainNow: () => ({ night: nightNow, across: 2 * grain.scale.x, share: GN, near: hsite.visible, rings: hChain.filter(m => !(m.userData.away > 0.5)).length, free: hFree.length, waiting: hWat.filter(m => m.visible).length, used: hWat.filter(m => m.userData.used).length, arrow: hArrow.visible,
      /* the nearest that a waiting water molecule is to the bond that it will split, and to any other bond (nm) */
      own: hWat.map((m, e) => m.visible && m.scale.x > 0.9 ? Math.abs(m.position.x - hBond(e).x) : 0).reduce((a, b) => Math.max(a, b), 0) }),
    starchNow: () => ({ perTurn: Math.round(2 * Math.PI / CH_T), across: 2 * CH_R, rings: chainT.filter(m => m.visible).length, water: cWat.filter(m => m.visible).length, apart: cWat.filter(m => m.visible).reduce((a, m) => Math.min(a, ...chainT.filter(q => q.visible).map(q => q.position.distanceTo(m.position))), 99) }),
    sizes: { cell: [S.cellLen, S.cellW], chloroplast: [S.chl, S.chlThick], wall: S.wall, fibre: S.fibre, chloroplasts: allSpots.length + 1, grana: grana.length, vacuoleBase: S.vacBase },
    dispose() { disposeGroup(g); } };
}
