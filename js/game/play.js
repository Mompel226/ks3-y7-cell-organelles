/* ============================================================
   play.js — what happens at each step of each place (4 Nov 2026). Every step waits for the pupil (a button on the part,
   a choice, or Next step). A wrong choice plays out what would really happen, then the pupil chooses again (memory
   bench-sims-show-the-truth). Each step builds what it needs, so a pupil who left half-way and comes back starts that
   step again with everything in place.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { token, ribbon, chain, tween as tween0, wait as wait0, burst, wave, AMINO_COLORS, amylase, strand, AMY_S } from './actors.js?v=202611281626';
import { state, COST, RESPIRE } from './state.js?v=202611281626';
import { nanoPatch, heroPoint, along, loadATP, H_COL, glowPoints, ionStream, atpMaker, haloSprite, nucleotide, nucleotideMats } from '../world/mitoparts.js?v=202611281626';
import { TRUE, STEPS, trueTrack, trueMotor, glowSprite, amylaseCore } from '../world/tracks.js?v=202611281626';
import { sound } from './sound.js?v=202611281626';
import { magicStandard } from '../world/magic.js?v=202611281626';
import { buildCrowd } from '../world/crowd.js?v=202611281626';
import { Names } from './names.js?v=202611281626';
import { makePit } from './clathrin.js?v=202611281626';
import { makeFlow, flowCheck } from './wayflow.js?v=202611281626';
import { level } from './iblevel.js?v=202611281626';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
/* the Explorer film, fetched when it is opened, not with the page (5 Nov 2026, speed) */
const openCopyFilm = o => import('./transcribe.js?v=202611281626').then(m => m.openCopyFilm(o));
/* the course film of the ribosomes (js/game/ribofilm.js), fetched when its door is pressed; and the doors of the course
   boxes (quest.js courseSwitch: 'coursefilm'): the film opens over the place, and the place is as it was when it closes */
const openRiboFilm = o => import('./ribofilm.js?v=202611281626').then(m => m.openRiboFilm(o));
let filmOpen = false;
document.addEventListener('coursefilm', async e => {
  if (filmOpen) return; filmOpen = true;
  /* (code: the door of one HL statement, quest.js FILMAT; step: the IB map's line for a statement, from 0) */
  const step = e.detail.step != null ? e.detail.step : null;
  try { await (e.detail.film === 'ribo' ? openRiboFilm(step != null ? { step } : undefined) : openCopyFilm({ code: e.detail.code || '', step })); } finally { filmOpen = false; }
});
const R = window.REV;
/* IB mode (quest.js courseSwitch: "Your course", IB on, in the way in and the mitochondria, once every check is right):
   the names on the picture add the IB names (Daniel, 5 Nov 2026: the toggle "adds the labels to the transport protein,
   the carrier proteins") */
const ibOn = () => document.documentElement.classList.contains('ib-on');
/* in IB mode, what the place says is the Year 7 sentence and, under it, the same thing as IB writes it, each with its
   level (Daniel, 13 Nov 2026: "being a KS3 level sentence next to an IB level one (as long as the distinction is
   clear) is useful for the students to see how they need to improve/change the way they write as they progress";
   until then the IB sentence replaced the Year 7 one): ib(Year 7 words, IB words). The choices a pupil presses stay in
   the Year 7 words of the step they stand in. `lv`: the IB sentence's level in the guide of 2025, shown beside its
   name as on every line of the course's box ('sl' under "SL and HL", 'hl' under "Additional higher level", 'x' beyond
   the guide; the expert, 13 Nov 2026: an SL pupil read an HL sentence as plain "IB"). The names on the magnified view
   by key: [name, a phone's name] */
const IB_LV = { sl: 'SL and HL', hl: 'HL only', x: 'Beyond the guide' };
const ib = (y7, words, lv = 'sl') => ibOn() ? `<div class="say__lv say__lv--y7"><b class="say__k">Year 7 sentence</b>${y7}</div><div class="say__lv say__lv--ib"><b class="say__k">IB sentence <span class="ibl ibl--${lv}">${IB_LV[lv]}</span></b>${words}</div>` : y7;
/* (17 Nov 2026, the science read: each IB name at its level: 'hl', a word of an HL line, shown only at HL, where SL keeps
   the Year 7 name; no word that no course line has: "FADH₂" and "complex IV" went) */
const IB_NAMES = { 'nm-om': ['outer membrane:<br>phospholipid bilayer'], 'nm-ch': ['channel protein:<br>porin'], 'nm-cp': ['carrier protein:<br>pyruvate carrier', null, 'hl'],
  'nm-h': ['hydrogen, in<br>reduced NAD', 'hydrogen', 'hl'], 'nm-h2': ['hydrogen, in<br>reduced NAD', 'hydrogen', 'hl'],
  'nm-p4': ['the last protein of the<br>electron transport chain', null, 'hl'], 'nm-lum': ['intermembrane space<br>(inside a crista)', 'intermembrane space', 'hl'],
  'nm-hi': ['many protons<br>(hydrogen ions)', 'protons', 'hl'], 'nm-hi2': ['many protons:<br>a high concentration', 'many protons', 'hl'], 'nm-few': ['few protons', 'few protons', 'hl'] };
const ibName = key => { const I = ibOn() && IB_NAMES[key]; return I && !(I[2] === 'hl' && level() !== 'hl') ? I : null; };

/* the course on the picture (16 Nov 2026; Daniel: "once you toggle the IGCSE, you see it … on the 3D representation
   instead of text … teach the content as much as possible using the animations"): with a course switched on in the
   place (its bar, quest.js courseSwitch), a moving molecule's own name carries that course's word for how it crosses
   (IB's when IB is on, else IGCSE's), and a strip beside the picture shows where its concentration is higher and lower
   and which way it moves. The words are those of the place's own course lines (story.js wayin `course`): IGCSE names no
   carrier for diffusion, so for glucose it says only "down its concentration gradient", and for the amino acid it names
   the protein carrier and claims no process (the picture does not show whether energy is used). */
const lvHere = c => !!document.querySelector(`#quest .qp__lv [data-lv="${c}"][aria-pressed="true"]`);
const courseWord = (name, w) => () => (lvHere('ib') && w.ib ? `${name} · ${w.ib}` : lvHere('igcse') && w.igcse ? `${name} · ${w.igcse}` : name);
/* the mitochondria's course words (17 Nov 2026): IB's at the pupil's own level (an HL word only at HL, iblevel.js; the
   link reaction, the Krebs cycle, the chain and chemiosmosis are HL in the guide, simple and facilitated diffusion SL),
   else IGCSE's; '' when the course on has no word for it (no tag then: moveTag). `name` may be a function (pyruvate with
   IB on, as its button says) */
const ibHL = () => lvHere('ib') && level() === 'hl';
const lvWord = (name, w) => () => { const ibw = lvHere('ib') && (level() === 'hl' ? w.hl || w.sl : w.sl), s = ibw || (lvHere('igcse') && w.igcse); return s ? `${typeof name === 'function' ? name() : name} · ${s}` : ''; };
/* the names on the mitochondrion that the 0610 syllabus does not use, marked so on the name itself while IGCSE is on and
   IB is off (the audit's way 3, 16 Nov 2026): the place's own IGCSE lines say so of the two membranes, the cristae, the
   matrix, channel proteins, hydrogen ions, the chain of proteins, ATP and ATP synthase, and the syllabus (2026–2028)
   has no "intermembrane" and no "cytosol" (it says cytoplasm). Never "not asked" (memory: off the list is not "not asked"). The carrier protein is not marked:
   0610 names protein carriers (3.3.2) */
const NOT0610 = new Set(['nm-c', 'm-2m', 'm-cr', 'm-mx', 'nm-om', 'nm-om3', 'nm-im3', 'nm-ims', 'nm-lum', 'nm-ch', 'nm-mx', 'nm-mx2', 'nm-hi', 'nm-hi2', 'nm-few', 'nm-p4', 'nm-atp']);
const no0610 = key => lvHere('igcse') && !ibOn() && NOT0610.has(key) ? '<span class="nm__no">not named in 0610</span>' : '';
/* names to press, with IB on (17 Nov 2026; the audit's way 2, as the leaf's names: js/plant/view.js pressName): a name on
   the mitochondrion that the place's own IB lines speak of is a button; pressed, a small card opens under it with the
   piece of that line about the part, word for word (pieces of one line joined by " … "; checked: cardsBad), its level
   and code (an HL piece only at HL), and the name is ticked (kept: store 'namesFound'). The long B2.2.4 line of step 2
   is three parts' meaning: on the parts it now is too. [the place's IB block, its line, the pieces (none: the whole
   line)] */
const CARD_MEM = [1, 0, ['Adaptations for making ATP: a double membrane with a small volume of intermembrane space (so a few pumped protons (hydrogen ions) give a high concentration)']],
  CARD_MX = [1, 0, ['The matrix is a fluid with the enzymes of the link reaction and the Krebs cycle.']],
  CARD_IMS = [1, 0, ['The space between the two membranes is the intermembrane space, about 15 nm wide.']],
  CARD_HI = [6, 0, ['The concentration of protons is high in the intermembrane space and low in the matrix.']];
const CARD_ENV = [0, 0, ['The nucleus has a double membrane with pores']],
  CARD_PORE = [0, 1, ['The pores are needed: mRNA and the parts of ribosomes leave through them, and proteins enter.']],
  CARD_CTD = [2, 0, ['After replication, each chromosome consists of two elongated DNA molecules (chromatids), held together until anaphase (the stage of mitosis when the chromatids separate)']],
  CARD_STAY = [4, 0, ['The gene coding for the protein remains in the nucleus.'], 'igcse'],
  CARD_SEP = [5, 2, ['The nucleus separates transcription from translation: mRNA can be modified before it meets ribosomes in the cytoplasm.']];
const CARDS = { mito: {
  'm-2m': [CARD_MEM], 'nm-om': [CARD_MEM], 'nm-om3': [CARD_MEM], 'nm-im3': [CARD_MEM],
  'm-cr': [[1, 0, ['Adaptations for making ATP', 'the large surface area of the cristae']]],
  'm-mx': [CARD_MX], 'nm-mx': [CARD_MX], 'nm-mx2': [CARD_MX],
  'nm-ims': [CARD_IMS], 'nm-lum': [CARD_IMS],
  'nm-ch': [[3, 0]],
  'nm-cp': [[3, 2, ['The carrier protein in the inner membrane is the mitochondrial pyruvate carrier: it carries a hydrogen ion in with each pyruvate.']]],
  'nm-p4': [[5, 1]],
  'nm-hi': [CARD_HI], 'nm-hi2': [CARD_HI], 'nm-few': [CARD_HI],
  'nm-atp': [[6, 0, ['The phospholipid bilayer is a barrier to ions, so protons flow back only through ATP synthase, down the gradient, and the energy released phosphorylates ADP to ATP: this is chemiosmosis.']]]
},
/* the nucleus (17 Nov 2026): a fourth item names the course whose line it is ('igcse'; none: IB), so a name's card holds
   the line of each course that is on. The pieces are those about the part named */
nucleus: {
  'n-chr': [[1, 0, null, 'igcse'], [0, 0, ['chromosomes are made of DNA bound to histones (proteins that DNA is wrapped around)']]],
  'n-env': [CARD_ENV], 'n-pore': [CARD_ENV, CARD_PORE], 'x-pore': [CARD_ENV, CARD_PORE],
  'c-chr1': [[1, 0, null, 'igcse'], [1, 0], [1, 1]],
  'p-a': [[2, 0, null, 'igcse'], [2, 1, null, 'igcse'], CARD_CTD], 'p-b': [[2, 0, null, 'igcse'], [2, 1, null, 'igcse'], CARD_CTD],
  'g-gene': [[1, 1, null, 'igcse'], [3, 1, null, 'igcse'], [3, 0], [3, 1]], 'g-gene0': [[1, 1, null, 'igcse'], [3, 1, null, 'igcse'], [3, 0]],
  'c-mrna': [[4, 0, ['Messenger RNA (mRNA) is a copy of a gene. mRNA molecules are made in the nucleus.'], 'igcse'], [4, 0], [4, 2]],
  'c-gene': [CARD_STAY, [4, 0, ['Transcription is the synthesis of RNA using a DNA template.']]],
  'x-nuc': [CARD_STAY, CARD_SEP], 'x-cyt': [CARD_SEP, [5, 3]]
},
/* the nucleolus (17 Nov 2026): the region's card holds its lines (IGCSE: the line on what the syllabus does not name; IB:
   at HL D1.2.14, and the line beyond the guide on where the nucleolus forms); each part's, with IB on, "80S" (A2.2.6)
   and, marked "Beyond the guide", the line on 40S, 60S and what S measures, with a small drawing of a tube (CARD_ART):
   the guide itself has neither number, so they stand on no name and no label; the pore's, at HL, why the subunits leave
   by it (B2.2.6) */
nucleolus: {
  'nol-reg': [[0, 0, null, 'igcse'], [0, 0], [0, 1]],
  'nol-small': [[1, 0], [1, 1]], 'nol-large': [[1, 0], [1, 1]],
  'o-pore': [[2, 0]]
},
/* the ribosomes (17 Nov 2026): each name's card holds the piece of the place's lines about it. 'r-mine': "your
   ribosome" at the last step (its name keeps the key 'r-rib') */
ribosome: {
  'r-rib': [[0, 0, null, 'igcse'], [0, 0, ['mRNA binds to the small subunit (the small part) of the ribosome.']], [0, 1]],
  'r-whole': [[0, 0, null, 'igcse'], [1, 0, null, 'ib', 'nucleolus'], [0, 1]],   /* (the whole ribosome, just joined: "ribosome: 80S", the nucleolus's A2.2.6; a name, never a sum of the two parts) */
  'r-s': [[0, 0, ['mRNA binds to the small subunit (the small part) of the ribosome.']]],
  'r-l': [[0, 0, ['Two tRNAs (transfer RNA: the carriers that bring the amino acids, step 2) can bind at the same time to the large subunit.']]],
  'r-copy': [[1, 0, ['The mRNA passes through ribosomes.', 'The specific sequence of amino acids is determined by the sequence of bases in the mRNA.'], 'igcse'], [1, 0]],
  'r-car': [[1, 1]],
  'r-chain': [[1, 0, ['The ribosome assembles amino acids into protein molecules.'], 'igcse'], [1, 1, null, 'igcse'], [1, 2]],
  'r-free': [[2, 0, ['Free ribosomes synthesize proteins for retention in the cell.']]],
  'r-mine': [[2, 0, ['Ribosomes bound to the rough endoplasmic reticulum synthesize proteins for transport within the cell and for secretion. Amylase is secreted.']]],
  'r-sig': [[2, 1]],
  'r-mem': [[2, 0, null, 'igcse']]
},
/* the smooth ER (18 Nov 2026) */
ser: {
  's-mem': [[0, 1, null, 'igcse']],
  's-lipid': [[0, 1, null, 'igcse'], [0, 0, ['A phospholipid forms by condensation reactions (each one joins two molecules and releases water): one glycerol links two fatty acids and one phosphate group.']]],
  's-fat': [[0, 0, null, 'igcse'], [0, 0]],   /* (the whole line: "instead" needs the sentence before it) */
  's-hh': [[1, 0, ['A phospholipid is amphipathic: its head is hydrophilic (attracted to water) and its tails are hydrophobic (not attracted to water).']]],
  's-ht': [[1, 0, ['A phospholipid is amphipathic: its head is hydrophilic (attracted to water) and its tails are hydrophobic (not attracted to water).']]],
  's-bi': [[1, 0, ['So in water, phospholipids form a bilayer by themselves.']]]
},
/* the rough ER (18 Nov 2026). 'e-bound': the ribosome once it is on the channel; 'e-sig': the ribosomes' own line on the
   signal, then this place's on the particle; 'e-prim', 'e-tert', 'e-helix', 'e-sheet': the chain at the fold's rests */
rer: {
  'e-mem': [[0, 0, null, 'igcse']],
  'e-bound': [[0, 1]],
  'e-sig': [[2, 1, ['The signal is a short sequence of amino acids at the start of the polypeptide'], 'ib', 'ribosome'], [0, 2]],   /* (without the line's last words, "a signal sequence": the picture keeps that name for HL, D1.2.18) */
  'e-enz': [[2, 0]],   /* (the whole line: "signal sequence" is the game's word, and the line says what the guide's own example is) */
  'e-chain': [[1, 0, null, 'igcse'], [1, 1]],
  'e-prim': [[3, 0, null, 'igcse'], [3, 0]],
  'e-tert': [[3, 0, null, 'igcse'], [3, 2]],
  'e-helix': [[3, 1]], 'e-sheet': [[3, 1]],
  'e-amy': [[3, 1, null, 'igcse'], [3, 4]],
  'e-site': [[3, 2, null, 'igcse'], [3, 3, null, 'igcse']],
  'e-ves': [[4, 0], [4, 1], [4, 2]]
},
/* the Golgi apparatus (18 Nov 2026): each card a piece of the place's own B2.2.8 (HL), B2.2.3 (SL), B2.2.9 (HL) or A2.2.11
   (SL) line; the sac's name holds IGCSE's note (0610 does not name the Golgi apparatus). 'g-lys2' and 'g-sec' are the two
   vesicles' cards once each holds what its line speaks of (the enzymes sorted; amylase packed) */
golgi: {
  'g-golgi': [[0, 0, null, 'igcse'], [0, 0, ['The Golgi apparatus processes proteins and prepares them for secretion.']]],
  'g-first': [[0, 0, ['Vesicles from the rough ER fuse with the first sac of the stack.']]],
  'g-enz': [[1, 0, ['Enzymes in the sacs modify the proteins: for example, they add chains of sugars.']]],
  'g-gly': [[1, 0, ['Some amylase molecules leave as glycoproteins (proteins with sugars attached).']]],
  'g-lys2': [[2, 0]],
  'g-coat': [[2, 1]],
  'g-sec': [[3, 0]]
},
/* the microtubules (18 Nov 2026): the microtubule's card is the cytoskeleton's line (A2.2.6, B2.2.1), dynein's the line
   on what each step uses (C1.2.2); with IGCSE on, both hold the scope note */
tracks: {
  't-mt': [[0, 0, null, 'igcse'], [0, 0]],
  't-mot': [[0, 0, null, 'igcse'], [0, 1]]
},
/* the way out (18 Nov 2026): the gland cell's card is 14.1.6 (IGCSE), the synapse's C2.2.5 (SL); at HL the membrane's
   is B2.1.13's sentence on fusing, and the coat's the last sentence of the endocytosis line (B2.2.9) */
exit: {
  'x-eff': [[0, 0, null, 'igcse']],
  'x-syn': [[0, 0]],
  'x-mem': [[1, 0, ['Membranes are fluid, so the membrane of the vesicle can fuse with the plasma membrane.']]],
  'x-pit': [[2, 0, ['Clathrin, a coat protein, helps the membrane bend into a pit.']]]
} };
/* what S measures, drawn (the line's own words: "larger particles sink faster"): a tube after a spin in an ultracentrifuge,
   the 60S subunit further down than the 40S, and a whole 80S ribosome further still (so that nobody adds 40 and 60: the
   science read, 17 Nov 2026); the part whose card it is in a brighter band; a caption says what the tube is. Never a sum */
const TUBE = hot => `<svg class="ncard__art" viewBox="0 0 214 112" role="img" aria-label="A tube after a spin in an ultracentrifuge: the 40S subunit has sunk least, the 60S subunit further, and a whole 80S ribosome furthest."><text x="2" y="11" font-size="10.5" font-weight="700" fill="currentColor" opacity=".85">a tube after a spin in an ultracentrifuge</text><path d="M34 20v62a14 14 0 0 0 28 0V20" fill="none" stroke="currentColor" stroke-width="2"/><path d="M30 20h36" stroke="currentColor" stroke-width="2"/><rect x="36" y="36" width="24" height="6" rx="2" fill="currentColor" opacity="${hot === 'small' ? 1 : 0.4}"/><rect x="36" y="56" width="24" height="7" rx="2" fill="currentColor" opacity="${hot === 'large' ? 1 : 0.4}"/><rect x="36" y="76" width="24" height="8" rx="2" fill="currentColor" opacity=".4"/><text x="70" y="43" font-size="11.5" font-weight="800" fill="currentColor">40S: small subunit</text><text x="70" y="64" font-size="11.5" font-weight="800" fill="currentColor">60S: large subunit</text><text x="70" y="85" font-size="11.5" font-weight="700" fill="currentColor" opacity=".8">80S: a whole ribosome</text><path d="M16 30v50m-5-7 5 8 5-8" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".7"/><text x="2" y="107" font-size="10.5" font-weight="700" fill="currentColor" opacity=".85">larger particles sink faster ↓</text></svg>`;
const CARD_ART = { 'nol-small': TUBE('small'), 'nol-large': TUBE('large') };
const plainOf = t => String(t).replace(/<[^>]+>/g, '');
/* the card's lines for a name in the place now: of each course that is on, IB's at the pupil's level */
const cardLines = (id, key) => {
  const c = CARDS[id] && CARDS[id][key]; if (!c) return [];
  /* (a fifth entry: the line is another place's, the ribosome's "80S" is the nucleolus's A2.2.6) */
  return c.map(([b, l, pcs, co = 'ib', pl = id]) => { const C = (window.STORY[pl] || {}).course || {}, [lv, code, t] = lvHere(co) && ((C[co] || [])[b] || { p: [] }).p[l] || []; return { co, lv, code, t: pcs ? pcs.join(' … ') : t }; }).filter(x => x.lv && !(x.lv === 'hl' && level() === 'sl'));
};
/* every card's pieces are in their line, word for word (for the checks: ib-level H5, H6) */
const cardsBad = () => Object.entries(CARDS).flatMap(([id, m]) => Object.entries(m).flatMap(([key, c]) => c.filter(([b, l, pcs, co = 'ib', pl = id]) => {
  const L = ((((window.STORY[pl] || {}).course || {})[co] || [])[b] || { p: [] }).p[l]; return !L || (pcs || []).some(x => !plainOf(L[2]).includes(x)); }).map(() => key)));
const namesFound = () => new Set((R.store.get('namesFound', []) || []));

export function makePlay(world, quest) {
  const W = world.W, scene = world.scene;
  /* the concentration strip: higher where the substance comes from, lower where it goes; `up`: from the blood (below)
     into the cell (above); shown only with a course on, gone when the step or the place changes. With the step's many
     molecules (flowOn, wayflow.js; 17 Nov 2026) it counts them as they cross the membrane, both ways: more cross down
     the gradient than up it, though each moves at random, and that is the net movement of the definition (3.1.1) */
  let stripAt = -1;
  function stripPlace(el, st) {
    const q = document.getElementById('quest'), sr = st.getBoundingClientRect(), qr = q && q.getBoundingClientRect();
    const side = qr && qr.left > sr.left + sr.width * 0.5 && qr.top < sr.top + sr.height * 0.5;
    el.classList.toggle('is-foot', !side);
    if (side) { el.style.right = Math.max(8, sr.right - qr.left + 14) + 'px'; el.style.left = el.style.bottom = el.style.top = ''; return; }
    const hb = document.getElementById('qHide'), hr = hb && hb.getBoundingClientRect(), under = qr && qr.height && qr.top > sr.top + sr.height * 0.3;
    el.style.top = 'auto'; el.style.left = '10px';
    el.style.bottom = Math.round(under ? sr.bottom - qr.top + 8 : 10) + 'px';
    el.style.right = Math.round(hr && hr.width && Math.abs(hr.bottom - (sr.bottom - parseFloat(el.style.bottom))) < 60 ? sr.right - hr.left + 8 : 10) + 'px';
    /* (and clear of the mitochondria's scale bar: on a phone it had stood over "5 nm"; the equation, whose two lines every
       pupil needs (all sit Extended), stands the whole width above the scale bar and Hide text, the others right of it) */
    const sb = st.querySelector('.mscale'), b = sb && !sb.hidden && sb.offsetWidth ? sb.getBoundingClientRect() : null, y1 = sr.bottom - parseFloat(el.style.bottom), y0 = y1 - el.offsetHeight;
    if (el.classList.contains('conc--eq')) { const row = Math.min(...[b, hr && hr.width ? hr : null].filter(Boolean).map(r => r.top), y1 + 8); el.style.left = '10px'; el.style.right = '10px'; el.style.bottom = Math.round(sr.bottom - row + 6) + 'px'; }
    else if (b && b.top < y1 && b.bottom > y0) el.style.left = Math.round(b.right - sr.left + 10) + 'px';
  }
  function concStrip(name, up, counts) {
    const old = document.getElementById('conc'); if (old) old.remove();
    if (!name || !(lvHere('igcse') || lvHere('ib'))) return;
    const st = document.getElementById('stage'); if (!st) return;
    const hi = 'higher concentration', lo = 'lower concentration', way = up ? 'into the cell' : 'out of the cell';
    const el = document.createElement('div'); el.id = 'conc'; el.className = 'conc' + (up ? ' is-up' : ' is-down') + (counts ? ' has-n' : '');
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', `${name}: ${up ? lo : hi} in the cell, ${up ? hi : lo} in the blood; ${counts ? `more of its molecules cross ${way} than the other way, so the net movement is ${way}: ` : 'it moves '}down its concentration gradient`);
    /* (a small picture of the molecule beside its name, as the picture draws it: the key to which dots to watch; the
       science read, 17 Nov 2026, found the cell's ribosomes taken for more molecules. "crossed into the cell": a count
       of crossings, never of the molecules in the cell) */
    const ICON = { Oxygen: '<svg viewBox="0 0 24 12"><circle cx="7" cy="6" r="5" fill="#ff6b6b"/><circle cx="16" cy="6" r="5" fill="#ff8a8a"/></svg>',
      'Carbon dioxide': '<svg viewBox="0 0 30 12"><circle cx="7" cy="6" r="4.4" fill="#ff7b7b"/><circle cx="15" cy="6" r="4.8" fill="#9aa3b5"/><circle cx="23" cy="6" r="4.4" fill="#ff7b7b"/></svg>',
      Glucose: '<svg viewBox="0 0 14 14"><polygon points="7,1.5 11.8,4.2 11.8,9.8 7,12.5 2.2,9.8 2.2,4.2" fill="none" stroke="#ffd56a" stroke-width="2.2"/></svg>' };
    el.innerHTML = `<p class="conc__k"><span class="conc__mol" aria-hidden="true">${ICON[name] || ''}</span>${name}</p><div class="conc__row"><div class="conc__bar" aria-hidden="true"><i></i></div><div class="conc__side">`
      + `<p class="conc__t conc__t--in"><b>${up ? lo : hi}</b> in the cell</p>`
      + (counts ? `<p class="conc__n"><span class="conc__a">↑</span><b data-n="up">0</b> crossed into the cell</p><p class="conc__n"><span class="conc__a">↓</span><b data-n="down">0</b> crossed out of the cell</p>` : '')
      + `<p class="conc__t conc__t--out"><b>${up ? hi : lo}</b> in the blood</p></div></div>`
      + `<p class="conc__f">${counts ? `net movement ${way}: <br>` : ''}down its concentration gradient</p>`;
    st.appendChild(el);
    /* (the names are laid out again, clear of it: names.js keeps) */
    if (quest.names && !world.moving) requestAnimationFrame(() => quest.names.show());
    /* beside the picture: left of the panel on a laptop, at the right of the picture above it on a phone */
    /* (on a phone the corner's buttons fill the top of the picture: the strip stands under them, never over a button) */
    /* (on a phone it stands at the foot of the picture, left of Hide text, one short block: at the top right it covered the
       membrane and the cell, and the corner's buttons cover the top: the science read, 17 Nov 2026) */
    const place = () => stripPlace(el, st);
    place();
    const nUp = el.querySelector('[data-n="up"]'), nDown = el.querySelector('[data-n="down"]');
    const s0 = stripAt = quest.session, f = () => { if (!el.isConnected) return; if (quest.session !== s0 || stripAt !== s0) { el.remove(); return; } place();
      if (counts) { if (+nUp.textContent !== counts.up) nUp.textContent = counts.up; if (+nDown.textContent !== counts.down) nDown.textContent = counts.down; }
      requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  const stripOff = () => { stripAt = -1; const old = document.getElementById('conc'); if (old) old.remove(); };
  /* the mitochondria's strips (17 Nov 2026), where the way in's stands, with a course on (the audit's way 6, "the
     equation fills in"). The equation of aerobic respiration (0610 12.2.2, the word equation; 12.2.3, the balanced one),
     its terms lit one by one as the picture shows each: glucose when it is split, carbon dioxide when it is produced,
     oxygen when it is used at the end of the chain, water when it is produced there, and "energy is released" when ATP
     synthase makes ATP (12.2.1; the examiners' reports: never "produced"). With IB at HL, the chain's step and the dam
     show the protons' strip in its place (C1.2.13–15): how many are pumped into the intermembrane space, then where their
     concentration is high and low, how many flow back through ATP synthase and how many ATP are made. The counts are
     those of the picture's own ions (ionCount, set by the step) */
  let eqLit = new Set(), stripAgain = null, ionCount = () => ({ a: 0, b: 0, full: false });
  const EQN = { g: 'glucose', o: 'oxygen', c: 'carbon dioxide', w: 'water', e: 'energy is released' };
  function stripLoop(el, st, tick) {
    st.appendChild(el);
    if (quest.names && !world.moving) requestAnimationFrame(() => quest.names.show());
    stripPlace(el, st); if (tick) tick();
    const s0 = stripAt = quest.session, f = () => { if (!el.isConnected) return; if (quest.session !== s0 || stripAt !== s0) { el.remove(); return; } stripPlace(el, st); if (tick) tick(); requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  function eqPaint(el, now) {
    el.querySelectorAll('[data-t]').forEach(s => { s.classList.toggle('is-on', eqLit.has(s.dataset.t)); s.classList.toggle('is-now', s.dataset.t === now); });
    const on = Object.keys(EQN).filter(k => eqLit.has(k)).map(k => EQN[k]);
    el.setAttribute('aria-label', 'Aerobic respiration: glucose + oxygen → carbon dioxide + water; C6H12O6 + 6O2 → 6CO2 + 6H2O; energy is released. ' + (on.length ? 'In the picture so far: ' + on.join(', ') + '.' : 'None of it in the picture yet.'));
  }
  function eqStrip() {
    const old = document.getElementById('conc'); if (old) old.remove();
    if (!courseOn()) return;
    const st = document.getElementById('stage'); if (!st) return;
    const T = (k, t) => `<span class="eqs__t" data-t="${k}">${t}</span>`;
    const el = document.createElement('div'); el.id = 'conc'; el.className = 'conc conc--eq'; el.setAttribute('role', 'img');
    el.innerHTML = '<p class="conc__k">Aerobic respiration <span class="eqs__h">lit: used or produced in the picture</span></p>'
      + `<p class="eqs__l">${T('g', 'glucose')} + ${T('o', 'oxygen')} → ${T('c', 'carbon&nbsp;dioxide')} + ${T('w', 'water')}</p>`
      + `<p class="eqs__l eqs__l--b">${T('g', 'C₆H₁₂O₆')} + ${T('o', '6O₂')} → ${T('c', '6CO₂')} + ${T('w', '6H₂O')}</p>`
      + `<p class="eqs__l eqs__e">${T('e', 'energy is released')}</p>`
      /* (the picture makes two water molecules from each oxygen molecule, twelve, as at the real chain; the equation's 6H₂O is
         what is left when the water used in other steps is taken away: said once water is lit, the science read, 17 Nov
         2026) */
      + '<p class="eqs__w" data-t="w">12 water molecules are made here. Water is also used in other steps, so the equation shows 6H₂O.</p>';
    eqPaint(el); stripLoop(el, st);
  }
  const eqLight = k => { eqLit.add(k); const el = document.getElementById('conc'); if (el && el.classList.contains('conc--eq')) eqPaint(el, k); };
  function ionStrip(kind) {
    const old = document.getElementById('conc'); if (old) old.remove();
    const st = document.getElementById('stage'); if (!st) return;
    const el = document.createElement('div'); el.id = 'conc'; el.className = 'conc conc--ion'; el.setAttribute('role', 'img');
    const pump = kind === 'pump';
    el.innerHTML = '<p class="conc__k"><span class="conc__mol" aria-hidden="true"><svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.6" fill="#9dff3c"/></svg></span>Protons (hydrogen ions)</p>'
      + '<p class="conc__t" data-c="hi"><b>high concentration</b> in the intermembrane space</p>'
      + (pump ? '<p class="conc__n"><span class="conc__a">→</span><b data-n="a">0</b> pumped into the intermembrane space</p>'
        : '<p class="conc__n"><span class="conc__a">↓</span>they flow back only through ATP synthase, down the gradient</p>')
      + '<p class="conc__t" data-c="lo"><b>low concentration</b> in the matrix</p>'
      + `<p class="conc__f">${pump ? 'a proton gradient' : 'chemiosmosis: down the proton gradient'}</p>`;
    const nA = el.querySelector('[data-n="a"]'), nB = el.querySelector('[data-n="b"]'), cs = [...el.querySelectorAll('[data-c], .conc__f')];
    /* (while the pumps fill the space, only the count: the high and the low concentration once it is full) */
    const tick = () => { const c = ionCount(); if (nA && +nA.textContent !== c.a) nA.textContent = c.a; if (nB && +nB.textContent !== c.b) nB.textContent = c.b;
      cs.forEach(e => { e.hidden = !c.full; });
      el.setAttribute('aria-label', `Protons (hydrogen ions): ${pump ? `${c.a} pumped into the intermembrane space` : 'they flow back only through ATP synthase, down the gradient'}${c.full ? '; high concentration in the intermembrane space, low in the matrix' : ''}.`); };
    stripLoop(el, st, tick);
  }
  /* a course word on a molecule for this step only: the molecules stay from step to step (the oxygen into the matrix,
     then to the chain), and their words must not (the frames, 17 Nov 2026: "oxygen · diffusion" still stood beside the
     breakdown) */
  const stepTag = (t, fn) => { const k = mitoStepN; return molTag(t, () => mitoStepN === k ? fn() : ''); };
  /* a step's strip: the protons' (ion: 'pump' or 'flow') with IB at HL, else the equation, its terms `lit` so far; drawn
     again when a switch or the level changes (play.js 'courselv') */
  let mitoStepN = 0;
  function mitoStrip(ion, lit) {
    if (lit) { eqLit = new Set(lit); mitoStepN++; cardOff(); }   /* (a step's start: its own tags only, stepTag; no card left open) */
    const s0 = quest.session; stripAgain = () => { if (quest.session === s0) mitoStrip(ion); };
    if (ion && ibHL()) ionStrip(ion); else eqStrip();
  }
  let nanoAgain = null;   /* the last names on the magnified view, drawn again when the IB switch changes */
  let nucAgain = null;    /* the nucleus's names with a course on, drawn again when a switch or the level changes, or a name is ticked */
  /* a pupil may leave a place in the middle of a step (the map, another place): every wait of a step (a move, a pause, a
     flight) then stops the step, so it never puts a button, a token or an item into the place the pupil went to */
  const STALE = new Error('the pupil left this place');
  /* a button's own handler (b.done.then(async …)) may be waiting when the pupil leaves: its stop is expected, not an error */
  addEventListener('unhandledrejection', e => { if (e.reason === STALE) e.preventDefault(); });
  const live = (p, s = quest.session) => { const q = p.then(v => { if (quest.session !== s) throw STALE; return v; }); q.catch(() => {}); return q; };
  /* a token that bobs while it waits stops bobbing when it moves: the bob set its height every frame, so before
     4 Nov 2026 a bobbing molecule could never rise or fall (it never visibly crossed the membrane) */
  const unbob = o => { if (o && o.userData) o.userData.bob = null; };
  const tween = (o, opts) => { unbob(o); return live(tween0(o, opts)); };
  const wait = ms => live(wait0(ms));
  let kept = [], props = {};
  const FOLD = { on: false };   /* the rough ER's fold: the camera is close on the folding chain (fold, far below) */
  const keep = (o) => { scene.add(o); kept.push(o); return o; };
  const drop = (o) => { if (!o) return; scene.remove(o); kept = kept.filter(x => x !== o); };
  /* leaving a place takes its tokens away */
  /* stay: the pupil stays in the place (a step watched again with ↻, then the place set up again at the step they were
     on: main.js). While the camera is in a close view it stays there, and the close view stays as it is: the step that
     runs next finds it so (toPlace, nanoIn, nolZoom) and goes neither out nor in. Before, every ↻ in a close view flew
     out to the place's own view and back in, twice (Daniel, 12 Nov 2026: "the animation zooms out and then zooms in
     without any reason … you can press the repeat button, and because of that … So fix that"). The close drawing itself
     is made again by the step (a step may have changed it): the old one stays in the picture until the new one stands */
  function reset(stay) {
    const held = !!stay && (NZ.on || NS.close);
    realOff(); FOLD.on = false; if (props.pack) packOff(); else if (W.chromosomes[0]) W.chromosomes[0].mesh.visible = true;
    const ghost = held ? [props.mem, props.close].filter(Boolean) : [];
    kept.forEach(o => { if (!ghost.includes(o)) scene.remove(o); }); kept = []; props = {};
    /* (held: the camera stays as it is. mitoOff puts the camera's up and its near and far planes back for the map; in a
       close view whose up is not the world's, the rough ER's, the whole picture then rolled in one frame, a quarter of a
       second after a step watched again had ended with a move of the camera: found by tools/transitions.mjs --again on
       the fold, 12 Nov 2026) */
    const camUp = world.camera.up.clone();
    mitoOff(); tracksLoop(false); diveOff(); poreFree(); chrUndim(); damTagsOff(); nucAgain = null; EXPR.off = false; cardOff();   /* (and no name's card left open on the place the pupil goes to) */
    if (held) { world.camera.up.copy(camUp); world.nearFar(world.camera.position.distanceTo(world.controls.target)); LOD.ghost.push(...ghost); return; }
    lodGhosts(); nolOff(); nanoOff();
  }
  const lodGhosts = () => LOD.ghost.splice(0).forEach(o => { scene.remove(o); LOD.items = LOD.items.filter(it => it.o !== o); });
  const N = W.nucleus, N0 = N.center, inN = (v) => N.group.localToWorld(v.clone());
  const fly = (pos, at, ms) => live(world.flyTo({ pos: pos.toArray ? pos.toArray() : pos, at: at.toArray ? at.toArray() : at }, { ms }));
  /* a point on the "stage" in front of the camera: dx to the right, dy up, d ahead (µm); the camera's axis is the middle
     of the free part of the picture (the panel's side is never used), so a token placed here is always in view */
  const scr = (dx, dy, d) => {
    const cam = world.camera, f = new THREE.Vector3(); cam.getWorldDirection(f);
    const r = new THREE.Vector3().crossVectors(f, cam.up).normalize(), u = new THREE.Vector3().crossVectors(r, f).normalize();
    return cam.position.clone().addScaledVector(f, d).addScaledVector(r, dx).addScaledVector(u, dy);
  };
  const depthTo = (p, back = 0.8) => world.camera.position.distanceTo(p) - back;
  const bob = (o, k = 0.08) => {
    const y0 = o.position.y, ph = Math.random() * 6;
    const f = t => { if (!o.parent || o.userData.bob !== f) { W.anim.splice(W.anim.indexOf(f), 1); return; } o.position.y = y0 + k * Math.sin(t * 1.4 + ph); o.rotation.y += 0.005; };
    o.userData.bob = f; W.anim.push(f);
  };
  /* a button on a part, pressed once (the step goes on); the energy check, when a job costs energy (`cost`, and `key`,
     the job's name: quest.js energy charges a job once in a game) */
  const press = async (at, label, opts = {}) => {
    for (;;) {
      const b = quest.hot(at, label, opts); await b.done; b.remove(); cardOff();   /* (18 Nov 2026: an open card had stayed over what the press shows) */
      if (!opts.cost || quest.energy(opts.cost, opts.key)) return;
      await wait(400);
    }
  };

  /* ---------------- the way in: the membrane at the base, drawn bigger (cellbuild.js, the bilayer) ----------------
     Daniel, 4 Nov 2026: "you should still see an in and an out … the oxygen should come from the red blood cells … small
     non-polar molecules being able to diffuse in, while the large polar molecules are transported". So the membrane shows
     its two layers of lipids, with the inside (the cytoplasm) above and the outside (the tissue fluid, then the capillary)
     below, named on the picture; each press has a reason: a red blood cell releases oxygen, which passes straight between
     the lipids; glucose and an amino acid each choose their way in (the lipids stop them; each passes through its own
     carrier protein); carbon dioxide leaves, into the PLASMA, between two red blood cells, and flows away with it (Daniel,
     the same evening: "make sure that it doesn't go inside a red blood cell … Otherwise, it's leading to a
     misconception"; haemoglobin is kept out: "too complicated"). In KS3 words: small and larger molecules (not "polar"). */
  const BL = W.bilayer, BLD = W.blood, WV = world.P.wayin.view;
  const curve = pts => new THREE.CatmullRomCurve3(pts);
  const jit = (k = 0.18) => (Math.random() - 0.5) * 2 * k;
  /* the names of the way in, each on a level line that ends on its part: inside, the membrane, outside, the blood */
  /* with IB on, the two carrier proteins are named too (spots on the front of each half): the glucose transporter's name
     only on the left, at the carrier's top, a row above the membrane's, which then points at the outer layer's heads (the
     three a little smaller, game.css nm--ib, so that two fit in the membrane's height on a 1280 × 700 laptop); the
     amino acid transporter's only on the right, at its carrier's foot (names.js side). So no line crosses another
     carrier: a name with no room is left out. On a phone each name stands on its part, the membrane's anywhere along it */
  /* more places for the names, for the closer views while a molecule crosses (beside each carrier, and where oxygen and
     carbon dioxide cross): appended, so the whole view's names stand where they did */
  const WAY_NEAR = [-2.9, -0.75, 0.45, 2.3], WAY_NEAR_OUT = [-2.9, -0.75, 1.6, 2.3];   /* (outside: clear of carbon dioxide's way down, x 0.25 to 0.6, even on a phone, where the name is about 1.4 µm wide) */
  const onCarrier = (C, ys) => ys.flatMap(([y, z]) => C.halves.map((h, k) => { h.updateWorldMatrix(true, false); return h.localToWorld(V(k ? 0.2 : -0.2, y, z)); }));
  /* the tissue fluid is the narrow space between the membrane and the capillary. Seen from the front, most of it is
     drawn in FRONT of the capillary: a name whose line ended there read as a name of the blood (the picture
     inspection, 28 Nov 2026: "Outside: the tissue fluid" stood on a red blood cell in every close view). So its name
     stands only where neither the capillary, a red blood cell nor the membrane is drawn at that point (names.js
     `clear`): spots across that space, from its front to its back, after the ones it had */
  const OUT_CLEAR = world.W.groups.blood.children.filter(o => o.isMesh).concat(BL.group.children.filter(o => !o.isPoints));
  const OUT_DEEP = [-3.7, -2.9, -0.75, 0.45, 1.6, 2.3, 3.4].flatMap(x => [[-0.75, -0.6], [-0.85, -1.4], [-0.95, -2.1], [-1.05, -2.5]].map(([y, z]) => V(x, y, z)));
  /* solid: the molecule waiting close up, which no name may stand on (on a phone the names stand on their parts) */
  const wayNames = (again, solid) => !again && (quest.names.items[0] || {}).key === 'w-in' ? null : quest.names.set([
    { key: 'w-in', free: true, small: '<span class="nm__t">Inside: the cytoplasm</span>', html: '<span class="nm__t">Inside the cell:<br>the cytoplasm</span>', spots: [V(-3.7, 1.55, 0.12), V(-3.3, 1.7, 0.12), V(-3.7, 1.3, 0.12), V(1.9, 1.3, 0.12), ...WAY_NEAR.map(x => V(x, 0.78, 0.12))] },
    ibOn() ? { key: 'w-mem', free: true, side: 'L', cls: 'nm--ib', small: '<span class="nm__t">phospholipid bilayer</span>', html: '<span class="nm__t">Cell membrane:<br>phospholipid bilayer</span>',
        spots: (world.size.w < 640 ? [-4, -3.4, -2.8, -0.9, -0.2, 0.4, 2.2, 2.9, 3.6] : [-4, -3.7, -3.4, -2.9, 0.45]).map(x => V(x, -0.38, 0.2)) }
      : { key: 'w-mem', free: true, small: '<span class="nm__t">Cell membrane</span>', html: '<span class="nm__t">Cell membrane:<br>two layers of lipids</span>', spots: [V(-3.7, 0, 0.2), V(-3.4, 0, 0.2), V(-4.0, 0, 0.2), V(1.9, 0, 0.2), ...WAY_NEAR.map(x => V(x, 0, 0.2))] },
    { key: 'w-out', free: true, small: '<span class="nm__t">Outside: the tissue fluid</span>', html: '<span class="nm__t">Outside the cell:<br>the tissue fluid</span>', clear: OUT_CLEAR, spots: [V(-3.7, -1.3, 0.1), V(-3.4, -1.2, 0.1), V(1.9, -1.25, 0.1), ...WAY_NEAR_OUT.map(x => V(x, -1.05, 0.1)), ...OUT_DEEP] },
    { key: 'w-cap', free: true, small: '<span class="nm__t">Capillary (blood)</span>', html: '<span class="nm__t">Capillary,<br>with blood</span>', spots: [V(-3.5, -3.0, -0.7), V(-3.8, -3.3, -0.9), V(1.7, -3.0, -0.7)] }
  ].concat(ibOn() ? [
    { key: 'w-glut', free: true, side: 'L', aside: true, cls: 'nm--ib', small: '<span class="nm__t">glucose transporter</span>', html: '<span class="nm__t">glucose transporter</span>', spots: onCarrier(BL.carriers.glucose, [[0.555, 0.05]]) },
    { key: 'w-aat', free: true, side: 'R', aside: true, cls: 'nm--ib', small: '<span class="nm__t">amino acid transporter</span>', html: '<span class="nm__t">amino acid<br>transporter</span>', spots: onCarrier(BL.carriers.amino, [[-0.45, 0.21]]) }
  ] : []), [document.querySelector('.hud')], { l: V(-4.7, 0, 0.25), r: V(2.4, 0, 0.25) }, solid);
  /* each step starts in the place's view; already there, no flight (the names stay, never a flicker) */
  async function wayFly(wide) {
    world.wayIn(true);
    /* near the membrane already (the step before ended there): a step whose molecule comes from the blood (wide) begins
       with the blood in the picture again: the camera goes back, in one move, to the whole base of the cell, and only
       then does the molecule leave the blood (Daniel, 14 Nov 2026, of the oxygen step watched again from the glucose
       step: "I'm already very close up to the membrane … I don't see the [oxygen] appearing from the red blood cell
       because it has not zoomed out to show it to me"). A step whose molecule starts at the membrane (carbon dioxide)
       stays near. Before 12 Nov each step ENDED with the camera going back out, before the pupil had pressed Next,
       and that read as a move for no reason ("the animation zooms out and then zooms in without any reason … just
       remove it"); from 12 to 14 Nov no step went back at all, and glucose and the amino acid came up from under the
       picture's edge. Now the move back is the first thing of the step that needs it. Proof: tools/replay-view.mjs */
    if (wayNear()) { if (!wide) return; await wayBack(1500); wayNames(); return; }
    if (world.camera.position.distanceTo(V(...WV.pos)) > 0.05 || world.controls.target.distanceTo(V(...WV.at)) > 0.05) await fly(WV.pos, WV.at);
    wayNames();
  }
  async function look() { await wayFly(true); await quest.next(); }
  /* the red blood cells move to the right, along the capillary: the one a little left of the middle stays in view longest */
  const pickRbc = (x = -2.2, ahead = 3.5) => {
    let best = 0, bd = Infinity;
    for (let i = 0; i < BLD.n; i++) { const p = BLD.rbcAt(i, BLD.t || 0); if (p.x > x + 0.6 || p.x < x - ahead) continue; const d = Math.abs(p.x - x); if (d < bd) { bd = d; best = i; } }
    if (bd === Infinity) for (let i = 0; i < BLD.n; i++) { const d = Math.abs(BLD.rbcAt(i, BLD.t || 0).x - x); if (d < bd) { bd = d; best = i; } }
    return best;
  };
  /* a molecule follows a moving point (a red blood cell) and reaches it */
  const follow = (o, target, ms, opts = {}) => live(new Promise(res => {
    unbob(o);
    const p0 = o.position.clone(), s0 = o.scale.x, t0 = performance.now();
    const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms), e = k * k * (3 - 2 * k);
      o.position.lerpVectors(p0, target(), e); if (opts.scale != null) o.scale.setScalar(s0 + (opts.scale - s0) * e); world.kick && world.kick();
      if (k < 1) requestAnimationFrame(f); else res(); };
    f();
  }));
  /* the molecules at the membrane's own enlargement (10 Nov 2026, round 7; his "Yes, build it"): the membrane is drawn
     about 135 times thicker than it is (770 to 830 nm for 6 nm), and so is every molecule now, so that their sizes are right next
     to the lipids and next to each other. Before, oxygen (590 nm) and carbon dioxide (760 nm) were drawn bigger than glucose
     (540 nm) and an amino acid (about 500 nm), the opposite of the truth that the steps teach (the larger ones need a
     carrier). True sizes, longest way, with their atoms' own size: oxygen about 0.42 nm, carbon dioxide about 0.54 nm,
     glucose about 0.9 nm, an amino acid about 0.8 nm. At this size they are small from the place's view: each has a soft
     glow, and while one crosses the membrane the camera comes closer (wayZoom), then goes back out (wayBack).
     Proof: tools/true-size.mjs G */
  const WAY_K = 135;
  const WSZ = { oxygen: 0.42 * WAY_K / 1000 / 1.84, co2: 0.54 * WAY_K / 1000 / 2.24, glucose: 0.9 * WAY_K / 1000 / 2.44, amino: 0.8 * WAY_K / 1000 / 1.83 };   /* token sizes: each shape's length in token units */
  const WGLOW = { oxygen: 0xff9aa2, co2: 0xc8d2e0, glucose: 0xffe08a, amino: 0xc8b8ff };
  const wayMol = (kind, s = WSZ[kind]) => { const t = keep(token(kind, s)); haloSprite(t, kind === 'oxygen' || kind === 'co2' ? 0.05 : 0.042, WGLOW[kind]); return t; };
  /* the step's molecules, MANY of them, with a course on (wayflow.js; 17 Nov 2026; Daniel, of the leaf's films: "extremely
     simple"; then "Yes, carry on" to the way in): oxygen, glucose or carbon dioxide, more where the concentration is
     higher, each moving at random; oxygen and carbon dioxide cross the lipids both ways, glucose bounces off them. Made
     when the step starts, before the pupil presses anything (so the higher concentration is seen first); gone when the
     next step starts, or with the place (reset takes what was kept). With Reduce motion: one still, after 12 s of them */
  let flow = null, flowArrow = null;
  const courseOn = () => lvHere('igcse') || lvHere('ib');
  const arrowOff = () => { if (flowArrow) { drop(flowArrow); flowArrow = null; } if (quest.names && quest.names.avoid) { quest.names.avoid = null; quest.names.dirty = true; } };
  const flowOff = () => { if (flow) { drop(flow.group); flow.dispose(); flow = null; } arrowOff(); };
  function flowOn(kind) {
    flowOff(); if (!courseOn()) return null;
    const f = flow = makeFlow({ THREE, magicStandard, glowPoints }, kind, { carriers: [BL.carriers.glucose.at, BL.carriers.amino.at], size: WSZ[kind], glow: WGLOW[kind] });
    keep(f.group);
    if (R.FAST) f.still(12);
    /* (their lights keep one size on the screen: 4.2, about the close view's distance) */
    W.anim.push(function fl(t, dt) { if (flow !== f || !f.group.parent) { W.anim.splice(W.anim.indexOf(fl), 1); return; } if (!R.FAST) f.update(dt); f.glow(Math.max(1, world.camera.position.distanceTo(world.controls.target) / 4.2)); });
    return f;
  }
  /* the named molecule's way, with a course on: it wanders too (its Year 7 points, with a small random step between each
     two), never a smooth line, which would read as steered; with Reduce motion it jumps there, and a thin arrow shows its
     way (wayArrow), as each still of the leaf's films does */
  const wander = pts => { if (!courseOn()) return pts; const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; for (const k of [0.34, 0.67]) out.push(a.clone().lerp(b, k).add(V(jit(0.09), jit(0.05), jit(0.04)))); out.push(b); } return out; };
  /* (r: the tube's radius, in the world's units; the way in's is 0.016, and the magnified mitochondrion gives its own:
     arrowR, about 2.4 px on the screen) */
  const wayArrow = (c, r = 0.016, clear = true) => {
    if (!R.FAST || !courseOn()) return;
    arrowOff();
    const L = c.getLength(), u1 = Math.max(0.5, 1 - 8.1 * r / L), u2 = Math.max(0.6, 1 - 3.1 * r / L);   /* the tip stops short of the molecule */
    const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: 0xffe7a8, transparent: true, opacity: 0.9, depthTest: false, depthWrite: false });
    const pts = []; for (let i = 0; i <= 40; i++) pts.push(c.getPointAt(u1 * i / 40));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, r, 6, false), m));
    const tip = c.getPointAt(u2), dir = tip.clone().sub(c.getPointAt(u1)).normalize();
    const head = new THREE.Mesh(new THREE.ConeGeometry(2.8 * r, tip.distanceTo(c.getPointAt(u1)), 12), m); head.position.copy(tip).lerp(c.getPointAt(u1), 0.5); head.quaternion.setFromUnitVectors(V(0, 1, 0), dir); g.add(head);
    g.traverse(o => { o.renderOrder = 8; });
    flowArrow = keep(g);
    /* no name stands on the arrow (names.js keeps: avoid), nor its line crosses it (`clear` false: a name's line may end
       on it, the pore that the copy leaves by, which the arrow goes through) */
    if (quest.names && clear) { quest.names.avoid = pts.concat([tip]); quest.names.keeps(); quest.names.dirty = true; quest.names.still = 0; world.kick && world.kick(); }
  };
  const arrowR = () => 2.4 / world.pxPerUnit(world.camera.position.distanceTo(world.controls.target));
  /* a small name that moves with a molecule (as at the mitochondrion's dam: play.js moveTag), until the molecule goes */
  /* (text: the name, or a function that gives it each frame: courseWord, the course's word added while its switch is on) */
  const molTag = (t, text) => { const sp = newTag(t); const s0 = quest.session, f = () => { if (!t.parent || quest.session !== s0) { sp.visible = false; return; } moveTag(sp, typeof text === 'function' ? text() : text, t, V(0, 0, 0), 6); requestAnimationFrame(f); }; f(); return sp; };
  const WVdir = () => V(...WV.pos).sub(V(...WV.at)).normalize();
  const wayNear = () => { const c = world.controls.target, d = world.camera.position.distanceTo(c); return quest.cur === 'wayin' && d < 0.6 * V(...WV.pos).distanceTo(V(...WV.at)) && Math.abs(c.y) < 1.2 && Math.abs(c.x) < 4; };
  /* (on a phone with a course on, the close view looks 0.4 µm higher: the corner's buttons cover the top of the picture,
     and the cell side, with its count, was never seen: the science read, 17 Nov 2026) */
  const wayZoom = (x, y = -0.25, ms = 1700) => camGo({ at: V(x, y + (world.size.w < 640 && courseOn() ? 0.4 : 0), 0.12), dir: WVdir(), up: V(0, 1, 0), dist: fitDist(3300, 2500) }, R.FAST ? 0 : ms);
  const wayBack = (ms = 1600) => camGo({ at: V(...WV.at), dir: WVdir(), up: V(0, 1, 0), dist: V(...WV.pos).distanceTo(V(...WV.at)) }, R.FAST ? 0 : ms);
  async function oxygen() {
    await wayFly(true);
    /* (with a course on: oxygen in the blood and the tissue fluid, much more than in the cell, and the strip that counts it) */
    const fl = flowOn('oxygen'); if (fl) concStrip('Oxygen', true, fl.counts);
    let ri = pickRbc();
    const rbcPoint = () => { let p = BLD.rbcAt(ri, BLD.t || 0); if (p.x > 1.4) { ri = pickRbc(); p = BLD.rbcAt(ri, BLD.t || 0); } return p.add(V(0, 0.6, 2.2)); };
    await press(rbcPoint, 'red blood cell', { cls: 'tok', side: 't' });
    /* two oxygen molecules leave the red blood cell, cross the thin wall of the capillary and the tissue fluid, and pass
       straight between the lipids into the cytoplasm, each by its own wandering way */
    const from = BLD.rbcAt(ri, BLD.t || 0).add(V(0, 0.6, 2.2)), xs = courseOn() ? [-0.5, 0.15] : [-0.75, -0.05];
    /* (with a course on, the named one ends a little lower and to the right, where its name stays clear of the corner's
       buttons: at 0.68 it faded under Sound off as it arrived, 17 Nov 2026) */
    const yEnd = courseOn() ? 0.56 : 0.68;
    const ox = xs.map((x, i) => { const t = wayMol('oxygen'); t.position.copy(from).add(V(i ? 0.35 : -0.35, 0, 0)); return t; });
    molTag(ox[0], courseWord('oxygen', { igcse: 'diffusion', ib: 'simple diffusion' }));
    burst(scene, from, { color: 0xff9aa2, n: 30, r: 0.55 });
    quest.say('The red blood cell releases oxygen.');
    const near = wait(R.TEST ? 0 : 1200).then(() => wayZoom(-0.4, -0.3, 2200));
    await Promise.all(ox.map((t, i) => {
      const x = xs[i], a = t.position.clone();
      const c = curve(wander([a, V((a.x + x) / 2 + jit(), -2.1, -0.2), V(x + jit(), -1.25, 0.06), V(x, -0.6, 0.12), V(x, 0, 0.14), V(x + jit(0.1), 0.45, 0.12), V(x + jit(), yEnd, 0.12)]));
      if (!i) wayArrow(c);
      return tween(t, { path: c, ms: R.FAST ? 0 : 4200 + i * 500 });
    }));
    await near;
    quest.say(ib('<p>Oxygen is a small molecule: it passes straight through the two layers of lipids.</p><p>It spreads from the blood, where there is more oxygen, into the cell, where there is less. This is <dfn data-w="diffusion">diffusion</dfn>.</p>', '<p>Oxygen is small and non-polar: it passes straight between the phospholipids, down its <dfn data-w="concentration-gradient">concentration gradient</dfn>.</p><p>It goes from the blood, where its concentration is higher, into the cell, where it is lower. This is simple <dfn data-w="diffusion">diffusion</dfn>.</p>'), 'ok');
    await wait(R.TEST ? 0 : 1800);
    await quest.gain('oxygen', ox[0].position, 2); ox.forEach(drop);
    /* with a course on there is more to watch and read (the molecules crossing, their count, the definition): Next waits
       for the reader (memory animations-wait-for-the-reader); in Year 7 the next step starts by itself, as before */
    if (courseOn()) await quest.next();
  }
  /* a carrier protein changes shape, from its pose now to pose s (cellbuild.js carrier: -1 open to the outside, 0 shut on
     both sides, 1 open to the inside; the mitochondrion's carrier the same way, mitoparts.js) */
  const turnTo = (C, s, ms = 600) => live(new Promise(res => {
    const s0 = C.s, t0 = performance.now();
    const f = () => { const e = R.FAST || !ms ? 1 : Math.min(1, (performance.now() - t0) / ms); C.pose(s0 + (s - s0) * e * e * (3 - 2 * e)); world.kick && world.kick(); if (e < 1) requestAnimationFrame(f); else res(); };
    f();
  }));
  /* where a token stands so that the middle of its shape is at p (an amino acid's two parts are not round its centre) */
  /* (its shape only: not its glow nor its moving name, which stand above it) */
  const centred = (t, p) => { const b = new THREE.Box3(); t.updateMatrixWorld(true); t.traverse(o => { if (o.isMesh) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); b.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } }); return p.clone().add(t.position).sub(b.getCenter(new THREE.Vector3())); };
  /* one molecule through a carrier protein, in the real order (cellbuild.js carrier). The carrier waits open to the
     outside; the molecule moves to its mouth and into its pocket; as it settles there (it binds), the open side shuts
     behind it; for a moment it is held inside, both sides shut; then the carrier opens to the inside, and the molecule
     leaves as soon as there is room; once it is clear, the empty carrier changes back, open to the outside for the next */
  async function viaCarrier(C, t) {
    unbob(t);
    const at = y => centred(t, V(C.at.x, y, C.at.z + 0.1));
    if (C.s !== -1) await turnTo(C, -1, 500);
    await tween(t, { path: curve([t.position.clone(), at(-C.mouth - 0.12).add(V(jit(0.1), 0, 0)), at(-C.mouth)]), ms: 900 });
    const shut = wait(R.TEST ? 0 : 540).then(() => turnTo(C, 0, 560));
    await tween(t, { to: at(0), ms: 650 });
    await shut;
    await wait(300);
    const open = turnTo(C, 1, 640);
    await wait(R.TEST ? 0 : 545);
    await tween(t, { to: at(C.mouth), ms: 620 });
    await open;
    const back = turnTo(C, -1, 900);
    await tween(t, { to: V(C.at.x + jit(0.3), C.mouth + 0.14, 0.12), ms: 600 });
    await back;
  }
  /* a larger molecule meets the lipids beside a carrier, and stays outside: what really happens (memory
     bench-sims-show-the-truth) */
  async function bump(t, x) {
    const p0 = t.position.clone();
    await tween(t, { to: V(x, -0.5, 0.12), ms: 800 });
    await tween(t, { to: V(x, -0.62, 0.12), ms: 220 });
    await tween(t, { to: V(x, -0.5, 0.12), ms: 220 });
    await tween(t, { to: p0, ms: 800 });
  }
  /* molecules dissolved in the plasma leave the capillary through its thin wall, into the tissue fluid */
  async function fromBlood(kind, n, x0, size, second) {
    const ts = [];
    for (let i = 0; i < n; i++) {
      const t = wayMol(kind, size); t.position.set(x0 - 0.5 + i * 1.0, -2.5, -0.6);
      if (second) { const b2 = token('amino', size * 0.85); delete b2.userData.kind; b2.position.set(size * 0.9, size * 0.4, 0); b2.children[0].material = b2.children[0].material.clone(); b2.children[0].material.color.setHex(AMINO_COLORS[1]); t.add(b2); }
      ts.push(t);
    }
    await Promise.all(ts.map((t, i) => tween(t, { path: curve(wander([t.position.clone(), V(t.position.x + jit(0.2), -1.9, -0.25), V(x0 - 0.45 + i * 0.9, -1.15, 0.06)])), ms: R.FAST ? 0 : 1700 + i * 250 })));
    ts.forEach(t => bob(t, 0.04));
    return ts;
  }
  async function carriers() {
    stripOff(); flowOff();   /* (each strip stays while its step's words are read: gone when the next step starts) */
    await wayFly(true);
    /* (with a course on: glucose, much more outside the cell than in it; none passes between the lipids) */
    if (flowOn('glucose')) concStrip('Glucose', true);
    const C = BL.carriers.glucose; await turnTo(C, -1, 0);
    const g = await fromBlood('glucose', 2, C.at.x, WSZ.glucose);
    /* (the course's word only once the pupil has chosen the way in: before, it would give the answer away; the science
       read, 17 Nov 2026) */
    let chose = false; const gWord = courseWord('glucose', { igcse: 'down its concentration gradient', ib: 'facilitated diffusion · no ATP' });
    molTag(g[0], () => chose ? gWord() : 'glucose');
    await wayZoom(C.at.x + 0.2); wayNames(true, [...g, C.group]);   /* (and off the carrier, where the glucose goes through) */
    await press(() => g[0].position.clone().add(V(0, -0.1, 0)), 'glucose', { cls: 'tok', side: 'b' });
    await quest.choose(['Through a carrier protein', 'Straight through the two layers of lipids'], 0, async () => {
      quest.say(ib('Glucose is a larger molecule: the two layers of lipids stop it.', 'Glucose is polar: the hydrophobic core of the phospholipid bilayer stops it.'), 'no');
      await bump(g[0], C.at.x + 1.15);
    });
    chose = true;
    quest.say(ib('A <dfn data-w="carrier-protein">carrier protein</dfn> lets glucose pass through the membrane.', 'A <dfn data-w="glucose-transporter">glucose transporter</dfn> lets glucose pass through the membrane: <dfn data-w="facilitated-diffusion">facilitated diffusion</dfn>, down its concentration gradient, with no ATP.'), 'ok');
    for (const t of g) await viaCarrier(C, t);
    await quest.gain('glucose', g[0].position, 2); g.forEach(drop);
    if (courseOn()) await quest.next();
  }
  async function amino() {
    stripOff(); flowOff();
    await wayFly(true);
    const C = BL.carriers.amino, G = BL.carriers.glucose; await Promise.all([turnTo(C, -1, 0), turnTo(G, -1, 0)]);
    const [a] = await fromBlood('amino', 1, C.at.x - 0.4, WSZ.amino, true);
    /* ("through a protein carrier": "amino acid · a protein carrier" read as if the amino acid were the carrier; after
       the choice only, as glucose's) */
    let chose = false; const aWord = courseWord('amino acid', { igcse: 'through a protein carrier', ib: 'through a selective carrier protein' });
    molTag(a, () => chose ? aWord() : 'amino acid');
    await wayZoom(C.at.x - 0.5); wayNames(true, [a, C.group, G.group]);
    await press(() => a.position.clone().add(V(0, -0.1, 0)), 'amino acid', { cls: 'tok', side: 'b' });
    await quest.choose(['Through its own carrier protein', 'Through the carrier protein for glucose', 'Straight through the two layers of lipids'], 0, async (i) => {
      if (i === 1) {
        quest.say(ib('The carrier protein for glucose lets only glucose pass through. Each kind of carrier protein lets only one kind of substance pass through.', 'The glucose transporter lets only glucose pass through. Each carrier protein is selective: only particles of the right shape and charge fit it.'), 'no');
        /* into its open side, but it does not bind in the pocket: the carrier does not change shape, and it drifts out */
        const p0 = a.position.clone(), at = y => centred(a, V(G.at.x, y, G.at.z + 0.1));
        await tween(a, { to: at(-G.mouth), ms: 1100 });
        await tween(a, { to: at(-G.mouth + 0.42), ms: 520 });
        await wait(380);
        await tween(a, { to: at(-G.mouth), ms: 520 });
        await tween(a, { to: p0, ms: 1100 });
      } else {
        quest.say(ib('An amino acid is a larger molecule: the two layers of lipids stop it.', 'An amino acid has charged groups: the hydrophobic core of the phospholipid bilayer stops it.'), 'no');
        await bump(a, C.at.x - 1.2);
      }
    });
    chose = true;
    quest.say(ib('Its own carrier protein lets the amino acid pass through.', 'An amino acid transporter, a carrier protein that is selective for amino acids, lets the amino acid pass through.'), 'ok');
    await viaCarrier(C, a);
    await quest.gain('amino', a.position); drop(a);
    if (courseOn()) await quest.next();   /* (its IGCSE box, active transport, is read before carbon dioxide starts) */
  }
  async function co2() {
    stripOff(); flowOff();
    await wayFly();
    /* (with a course on: carbon dioxide, much more in the cell, where respiration produces it, than outside) */
    const fl = flowOn('co2'); if (fl) concStrip('Carbon dioxide', false, fl.counts);
    const t = wayMol('co2'); t.position.set(0.3, 0.7, 0.14); bob(t, 0.03);
    molTag(t, courseWord('carbon dioxide', { igcse: 'diffusion', ib: 'simple diffusion' }));
    await wayZoom(0.3, courseOn() ? 0.3 : -0.1); wayNames(true, [t]);   /* (with a course on, more of the cell, where its concentration is higher) */
    await press(() => t.position.clone().add(V(0, 0.1, 0)), 'carbon dioxide', { cls: 'tok', side: 't' });
    /* straight between the lipids, out through the tissue fluid and the capillary's thin wall */
    const cc = curve(wander([t.position.clone(), V(0.25 + jit(0.1), 0.42, 0.13), V(0.3, 0, 0.14), V(0.25, -0.6, 0.12), V(0.4 + jit(), -1.3, 0.04)])); wayArrow(cc);
    await tween(t, { path: cc, ms: R.FAST ? 0 : 2200 });
    wayNames(true, [t]);   /* the names laid again, off it, now that it is in the tissue fluid */
    await wayBack(1400);
    /* then into the plasma: first along the tissue fluid until it is over the middle of a space between two red blood
       cells, then down into that space, always over it as the blood flows (it never touches a red blood cell); then on
       with the plasma, out of the picture */
    const k = BLD.gapNear(t.position.x, BLD.t || 0), inPlasma = () => BLD.aimAt(k, BLD.t || 0), a = t.position.clone();
    unbob(t);
    await live(new Promise(res => {
      const t0 = performance.now(), sm = x => x * x * (3 - 2 * x);
      const f = () => {
        const s = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 2600), g = inPlasma(), e1 = sm(Math.min(1, s / 0.45)), e2 = sm(Math.max(0, (s - 0.45) / 0.55));
        t.position.set(a.x + (g.x - a.x) * e1, a.y + (g.y - a.y) * e2, a.z + (g.z - a.z) * e2); world.kick && world.kick();
        if (s < 1) requestAnimationFrame(f); else res();
      };
      f();
    }));
    W.anim.push(function flowOn() { const p = inPlasma(); if (!t.parent || p.x > 9) { W.anim.splice(W.anim.indexOf(flowOn), 1); drop(t); return; } t.position.copy(p); });
    quest.say(ib('<p>Carbon dioxide passes straight through the two layers of lipids, into the blood.</p><p>It dissolves in the plasma, the liquid part of the blood, which carries it to your lungs.</p>', '<p>Carbon dioxide is small and non-polar: it passes straight between the phospholipids, by simple diffusion, into the blood.</p><p>The plasma carries it to your lungs.</p>'), 'ok');
    /* with a course on, once the named one has gone with the plasma, the camera comes back close to the membrane, where
       its many molecules go on crossing, more out than in (from the whole base they are small dots: the frames of
       17 Nov 2026) */
    /* (with Reduce motion its arrow goes first: close up, it ended on a red blood cell, far from where the molecule went) */
    if (courseOn()) { arrowOff(); await wait(R.TEST ? 0 : 1200); await wayZoom(0.3, 0.3, 1800); }   /* (centred higher: more of the cell, where its concentration is higher) */
    await quest.next('Check what you learned');
  }

  /* ---------------- mitochondria ----------------
     Daniel, 5 Nov 2026: the glucose "was really at the top left, I could barely see it … make sure that when you show the
     instructions, the glucose molecule is very clearly visible"; then: "it needs to be relative … when it zooms in and you
     see the membrane, double membrane, and you see all of the structures in the membrane, and you see where the oxygen
     goes and where the glucose goes, clearly it's going to be to scale". A glucose molecule is about 1 nm across, this
     mitochondrion about 700 nm wide: at their true sizes the two cannot both be seen in one picture. So the place opens on
     the whole mitochondrion, cut open (mitoparts.js heroMito); Zoom in takes the camera, in one move, with a scale bar,
     to its edge, where its two membranes, every lipid, its proteins and the molecules are all drawn at their true sizes
     (nanoPatch). There the glucose is split, in the cytosol; the pupil sends the two smaller molecules into the matrix
     (through a channel protein in the outer membrane, then a carrier protein in the inner one) and the oxygen (straight
     between the lipids, as at the way in); in the matrix the smaller molecules are broken down (carbon dioxide leaves the
     way the oxygen came), at the last pump oxygen joins hydrogen (water), and ATP synthase turns: energy is released; the
     camera then comes out again to the whole mitochondrion and the bar fills. Nothing is drawn bigger than it is: the
     camera comes closer instead. One glucose needs six oxygen molecules, so six come in. */
  const MW = W.mito, hero = MW.hero, HS = MW.spec, SECT = MW.section.userData.u;
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  let PT = null;
  /* the magnified view, built the first time it is needed, on the outer membrane 30 nm before the crista it shows */
  function patch() {
    if (PT) return PT;
    PT = nanoPatch({ uc: 30, depth: HS.zoom.depthNm, lumen: HS.zoom.lumenNm });
    const F = along(HS, HS.zoom.s), o = heroPoint(HS, HS.zoom.s, F.r, 0), g = PT.group;
    g.matrixAutoUpdate = false;
    g.matrix.makeBasis(V(F.t.x, F.t.y, 0), V(F.n.x, F.n.y, 0), V(0, 0, 1)).scale(V(0.001, 0.001, 0.001)).setPosition(o);
    g.visible = false; hero.add(g); hero.updateMatrixWorld(true);
    return PT;
  }
  const pW = (u, n, w = 0) => PT.group.localToWorld(V(u, n, w));                  /* a point of the magnified view (nm) */
  const pD = (x, y, z) => V(x, y, z).transformDirection(PT.group.matrixWorld);    /* a direction in it */
  const heroView = () => { const v = world.P.mito.view, at = V(...v.at), pos = V(...v.pos); return { at, dist: pos.distanceTo(at), dir: pos.clone().sub(at).normalize(), up: V(0, 1, 0) }; };
  /* a magnified view: what it looks at (u, n), how far away (nm); up is out of the mitochondrion: the cytosol at the top */
  const nanoView = (u, n, dnm) => ({ at: pW(u, n, -2), dist: dnm / 1000, dir: pD(0, 0, 1), up: pD(0, 1, 0) });
  const MS = { deep: false, hidden: [], skin: false, skinned: [], tick: 0 };
  /* close to the membrane, the rest of the cell is far behind the magnified view and hidden by it: it is not drawn */
  /* (12 Nov 2026: by a dissolve of half a second, world.js draw, begun 260 nm away, so that it has ended before the
     magnified view's back begins to hide what stands behind it, 130 nm away: there, every other part round the
     mitochondrion had gone in one frame, in the middle of the zoom) */
  /* this mitochondrion's own membranes, as surfaces: close in (120 nm) they stood as thin bands in front of the magnified
     membranes (a skin over the lipids); the cut face and the magnified view show them instead */
  function setSkin(off) {
    if (off === !!MS.skin) return; MS.skin = off;
    if (off) [MW.real.inner, MW.real.outer, MW.sparks, MW.parts.outer, MW.parts.inner].forEach(o => { if (o.visible) { o.visible = false; MS.skinned.push(o); } });
    else MS.skinned.splice(0).forEach(o => { o.visible = true; });
  }
  function setDeep(on) {
    MS.deep = on;
    if (on) {
      Object.entries(W.groups).forEach(([k, g]) => { if (k !== 'mitochondria' && g.visible && !MS.hidden.includes(g)) MS.hidden.push(g); });
    }
    const objs = MS.hidden.slice(), show = v => objs.forEach(o => { o.visible = v; });
    if (!on) MS.hidden = [];
    const run = MS.run = (MS.run || 0) + 1, t0 = performance.now();
    if (R.FAST) { world.dissolve = null; show(!on); return; }
    world.dissolve = { t: 0.003, a: () => show(on), b: () => show(!on) };
    const f = () => {
      if (MS.run !== run) return;
      const k = (performance.now() - t0) / 500;
      if (k >= 1) { world.dissolve = null; show(!on); world.kick(); return; }
      world.dissolve.t = Math.max(0.003, Math.min(0.997, smooth(0, 1, k))); world.kick(); requestAnimationFrame(f);
    };
    f();
  }
  /* the scale bar, bottom left of the free part of the picture: a round length, 70 to 175 pixels long */
  let bar = null;
  const LENGTHS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
  function scaleBar(d) {
    if (!bar) { bar = R.h('div', { class: 'mscale', 'aria-hidden': 'true' }, '<i></i><b></b>'); R.$('#stage').appendChild(bar); }
    const pxNm = world.pxPerUnit(d) / 1000, L = LENGTHS.find(n => n * pxNm >= 70) || 2000;
    bar.firstChild.style.width = (L * pxNm).toFixed(1) + 'px';
    const t = L >= 1000 ? (L / 1000) + ' µm' : L + ' nm'; if (bar.lastChild.textContent !== t) bar.lastChild.textContent = t;
    bar.style.top = (world.size.h - (world.inset.bottom || 0) - 50) + 'px';
    bar.hidden = false;
  }
  /* every frame while in the place: the magnified view takes over from the cut face as the camera comes close (the face
     fades where it lies), the scale bar follows the zoom */
  function mitoLoop(on) {
    if (on && !MS.tick) {
      const f = () => {
        if (!MS.tick) return;
        const d = world.camera.position.distanceTo(world.controls.target);
        if (PT) {
          PT.group.visible = d < 0.9;
          /* the face fades out 64 to 76 nm from the middle of the magnified view, whose lipids reach 80 nm: no close view,
             even on a wide screen, sees the face at its edge */
          SECT.uHole.value.set(HS.zoom.s, 0.076, 0.135, smooth(0.55, 0.22, d));
          const bk = PT.parts.back.material; bk.uniforms.uA.value = smooth(0.3, 0.12, d); bk.depthWrite = d < 0.13;
          if ((d < 0.26) !== MS.deep) setDeep(d < 0.26);
          setSkin(d < 0.12);
        }
        scaleBar(d);
        MS.tick = requestAnimationFrame(f);
      };
      MS.tick = requestAnimationFrame(f);
    } else if (!on) { cancelAnimationFrame(MS.tick); MS.tick = 0; if (bar) bar.hidden = true; }
  }
  /* the lid: the front half lifts away and fades (o 0 → 1); closed, the mitochondrion looks whole */
  const FR = MW.front;
  const setLid = o => {
    /* it lifts upwards (−x of the hero's frame is up on the screen) and tips back, solid until it is clear of the cut
       face, then fades (the expert review: it had faded towards the camera instead of lifting) */
    FR.group.position.set(-0.95 * o, 0, 0.3 * o); FR.group.rotation.set(0, -0.55 * o, 0);
    FR.mats.forEach(m => { m.opacity = 1 - smooth(0.55, 0.95, o); m.depthWrite = o < 0.6; });
    FR.face.userData.u.uFade.value = 1 - smooth(0.5, 0.9, o); FR.group.visible = o < 0.99; FR.o = o; world.kick && world.kick();
  };
  const openLid = () => FR.o >= 1 ? Promise.resolve() : live(new Promise(res => { const t0 = performance.now();
    const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 2800); setLid(k * k * (3 - 2 * k)); if (k < 1) requestAnimationFrame(f); else res(); }; f(); }));
  setLid(0);
  /* leaving the place: everything as it was (the camera's up, its near and far planes, the cell, the cut face, the lid) */
  function mitoOff() {
    mitoLoop(false); if (MS.deep) setDeep(false); setSkin(false); setLid(0); if (HC) HC.on = false;
    if (props.flow) props.flow.forEach(F => { F.s.update(0, false); F.m.update(0, false); });
    if (props.follow) props.follow.visible = false;
    if (PT) PT.group.visible = false; SECT.uHole.value.set(0, 0, 0, 0);
    world.camera.up.set(0, 1, 0); world.nearFar(10);
  }
  /* after the camera arrives close up, the pupil may turn the view only a little (the magnified view is a thin slice) */
  function tight() {
    const c = world.controls, d = world.camera.position.distanceTo(c.target), sp = new THREE.Spherical().setFromVector3(world.camera.position.clone().sub(c.target));
    if (d > 1) return;
    c.minDistance = d * 0.8; c.maxDistance = d * 1.3;
    c.minAzimuthAngle = sp.theta - 0.22; c.maxAzimuthAngle = sp.theta + 0.22; c.minPolarAngle = sp.phi - 0.18; c.maxPolarAngle = sp.phi + 0.18;
  }
  const settle = () => live(new Promise(r => { const f = () => (world.flying ? requestAnimationFrame(f) : r()); f(); }));
  /* the camera to a view; the distance changes by the same factor each moment (a zoom of a hundred times reads as one
     smooth move), and what it looks at reaches its place as the distance does, so it stays where it is on the screen */
  async function camGo(to, ms = 2600) {
    await settle();
    const cam = world.camera, c = world.controls, s0 = quest.session;
    const at0 = c.target.clone(), off = cam.position.clone().sub(at0), d0 = off.length(), dir0 = off.normalize(), up0 = cam.up.clone();
    world.flying = true; c.enabled = false; world.setMoving(true);
    const t0 = performance.now(), d1 = to.dist, same = Math.abs(Math.log(d0 / d1)) < 0.02; let off0 = null;
    await live(new Promise(res => {
      const f = () => {
        if (quest.session !== s0) return res();
        const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms), e = k * k * (3 - 2 * k);
        const d = d0 * Math.pow(d1 / d0, e), g = same ? e : (d0 - d) / (d0 - d1);
        /* (to.turn: the part of the way by which the camera has turned to its new direction, 0.8 unless a view says) */
        /* (to.dirOf(at, d): a view that says where the camera stands for each point and distance on the way, such as
           the rough ER's fold, whose eye stays level with the membrane all the way; what the pupil had turned the view
           by goes over the first third of the move) */
        const turn = to.turn || 0.8, a = at0.clone().lerp(to.at, g), dd = to.dirOf ? to.dirOf(a, d).addScaledVector(off0 || (off0 = dir0.clone().sub(to.dirOf(at0, d0))), 1 - smooth(0, 0.3, e)).normalize() : dir0.clone().lerp(to.dir, smooth(0, turn, e)).normalize();
        cam.up.copy(up0).lerp(to.up, smooth(0.1, turn, e)).normalize();
        cam.position.copy(a).addScaledVector(dd, d); c.target.copy(a); cam.lookAt(a); world.nearFar(d); world.kick();
        if (k < 1) requestAnimationFrame(f); else res();
      };
      f();
    }));
    await live(world.landed({ pos: cam.position.toArray(), at: to.at.toArray() }, false)); tight();
  }
  /* while a molecule moves, the camera keeps it in view (stop() lands it) */
  function track(getP, dnm, k = 0.05) {
    const cam = world.camera, c = world.controls, d1 = dnm / 1000, s0 = quest.session, t0 = performance.now(); let on = true;
    world.flying = true; c.enabled = false; world.setMoving(true);
    const dir = cam.position.clone().sub(c.target).normalize(), d0 = cam.position.distanceTo(c.target);
    /* the distance eases to its new value over 0.6 s (the expert review: it had jumped in one frame) */
    const f = () => { if (!on || quest.session !== s0) return; const e = R.FAST ? 1 : smooth(0, 1, (performance.now() - t0) / 600), d = d0 + (d1 - d0) * e;
      c.target.lerp(getP(), R.FAST ? 1 : k); cam.position.copy(c.target).addScaledVector(dir, d); cam.lookAt(c.target); world.nearFar(d); world.kick(); requestAnimationFrame(f); };
    f();
    return async () => { on = false; await live(world.landed({ pos: cam.position.toArray(), at: c.target.toArray() }, false)); tight(); };
  }
  /* a molecule waiting to be pressed rocks gently (0.2 nm) along the view's up */
  const nbob = (o, k = 0.0002) => {
    const p0 = o.position.clone(), up = pD(0, 1, 0), ph = Math.random() * 6;
    const f = t => { if (!o.parent || o.userData.bob !== f) { W.anim.splice(W.anim.indexOf(f), 1); return; } o.position.copy(p0).addScaledVector(up, k * Math.sin(t * 1.6 + ph)); o.rotation.z += 0.004; };
    o.userData.bob = f; W.anim.push(f);
  };
  /* a molecule of true size (nm across), at a point of the magnified view */
  const SIZE = { glucose: 0.37, half: 0.42, oxygen: 0.24, co2: 0.24, water: 0.22 };
  let HALO = null;
  /* a molecule's glow has its own colour: the smaller molecule yellow (as in the bag), oxygen red, carbon dioxide grey,
     water pale blue (the expert review, 5 Nov 2026: with every glow cream, carbon dioxide was only "a new dot") */
  const HALO_COL = { glucose: 0xffe08a, half: 0xffe08a, oxygen: 0xff8080, co2: 0xb7c3d8, water: 0x9fd8ff };
  const halo = (t, nm, col = 0xfff4d0) => {
    if (!HALO) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      HALO = new THREE.CanvasTexture(c); HALO.colorSpace = THREE.SRGBColorSpace; }
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: HALO, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(nm * 3.2 / 1000 / t.scale.x); s.renderOrder = 9; t.add(s); return t;
  };
  const NMS = { glucose: 0.9, half: 0.6, oxygen: 0.45, co2: 0.55, water: 0.32 };
  const molAt = (kind, p) => { const t = keep(token(kind, SIZE[kind] / 1000)); t.position.copy(p); t.quaternion.copy(hero.quaternion); return halo(t, NMS[kind], HALO_COL[kind]); };
  const mol = (kind, u, n, w = -1.4) => molAt(kind, pW(u, n, w));
  const along3 = pts => curve(pts.map(([u, n, w]) => pW(u, n, w == null ? -1.4 : w)));
  const nburst = (p, color, n = 26) => burst(scene, p, { n, r: 0.0022, size: 0.00045, near: 0.0004, color, ms: 900 });
  const HUD2 = () => [document.querySelector('.hud'), bar, document.getElementById('conc')].filter(Boolean);   /* (and the way in's strip: a moving name fades under it) */
  /* the ribosome place and the rough ER: the corner box, the scale bar and the switch "Simple / As it really is" (REAL) */
  const HUDR = () => [document.querySelector('.hud'), bar, REAL.el].filter(Boolean);
  /* what is said after an action, scrolled into view in the panel (it was cut off at the panel's foot) */
  const ok = html => { quest.say(html, 'ok'); if (quest.step) quest.scrollTo(quest.step.say); };
  /* the view at the edge where the glucose is split: wide enough for both layers of lipids, the molecules in the middle */
  const SPLIT = () => nanoView(-21, 2 - footPx() / 2 / (world.pxPerUnit(1) / 34), 34);
  /* (on a phone with a course's strip at the foot of the picture: the px it takes, which the views keep clear of) */
  const footPx = () => { const c = world.size.w < 640 && document.getElementById('conc'); return c && c.classList.contains('is-foot') ? c.offsetHeight + 14 : 0; };
  /* names on the magnified view, each on one level line that ends on its part (names.js); frame: the middle of the view */
  const lr = (a, b) => world.project(a).x <= world.project(b).x ? { l: a, r: b } : { l: b, r: a };
  /* names on the magnified view: the frame is the named subject's own two sides (u0, u1 at height n): the names stand
     beside it, never on it */
  /* a name with a card: a button, its mark ("i", then "✓" once found); the card under it, kept on the picture */
  let ncard = null;
  /* (card: the card's own key in CARDS, when a name's card depends on what the picture shows: the gene in the other cell) */
  const pressOf = (key, card = key) => { if (!cardLines(quest.cur, card).length) return { mark: '', press: undefined, cls: undefined }; const f = namesFound().has(quest.cur + ':' + card);
    return { mark: `<span class="nm__p" aria-hidden="true">${f ? '✓' : 'i'}</span>`, press: () => nameCard(key, card), cls: 'nm--press' + (f ? ' is-found' : '') }; };
  const cardOff = () => { if (ncard) ncard.hidden = true; };
  function nameCard(key, card = key) {
    const L = cardLines(quest.cur, card), r = quest.names.m && quest.names.m.get(key), st = document.getElementById('stage'); if (!L.length || !r || !st) return;
    if (!ncard) { ncard = document.createElement('div'); ncard.className = 'ncard'; ncard.setAttribute('role', 'note'); st.appendChild(ncard); ncard.addEventListener('click', e => { if (e.target.closest('.ncard__x')) cardOff(); }); }
    const LVN = { c: 'Core', s: 'Supplement', n: 'Not named', sl: 'SL and HL', hl: 'HL only', x: 'Beyond the guide' }, name = plainOf((r.it.html || '').replace(/<span class="nm__(p|no)"[^]*?<\/span>/g, '').replace(/<br>/g, ' ')).trim();
    /* (an IGCSE line: its statement first, as in the course's box; a card of IGCSE lines only has the IGCSE green) */
    ncard.innerHTML = `<button type="button" class="ncard__x" aria-label="Close">×</button><p class="ncard__k">${name}</p>` + L.map(x => `<p><span class="ibl ibl--${x.lv}">${x.co === 'igcse' && x.code ? `<i>${x.code}</i> ` : ''}${LVN[x.lv]}${x.co !== 'igcse' && x.code ? ` <i>${x.code}</i>` : ''}</span> ${x.t}</p>`).join('');
    if (CARD_ART[card] && L.some(x => x.co === 'ib')) ncard.insertAdjacentHTML('beforeend', CARD_ART[card]);
    ncard.classList.toggle('ncard--ig', L.every(x => x.co === 'igcse'));
    R.terms && R.terms(ncard);
    ncard.hidden = false;
    /* under the name, or above it when there is no room; never on the name pressed, never off the picture */
    const s0 = st.getBoundingClientRect(), b = r.el.getBoundingClientRect(), w = Math.min(300, s0.width - 16); ncard.style.width = w + 'px';
    const hh = ncard.offsetHeight, x = Math.max(8, Math.min(s0.width - (world.inset.right || 0) - w - 8, b.left - s0.left)), below = b.bottom - s0.top + 8;   /* (18 Nov 2026: not under the panel on the picture's right) */
    ncard.style.left = x + 'px'; ncard.style.top = (below + hh < s0.height - 8 ? below : Math.max(8, b.top - s0.top - hh - 8)) + 'px';
    const F = namesFound(); if (!F.has(quest.cur + ':' + card)) { F.add(quest.cur + ':' + card); R.store.set('namesFound', [...F]); if (quest.cur === 'nucleus') { if (nucAgain) nucAgain(); } else if (nanoAgain && quest.names.m.has(key) && !/^m-/.test(key)) nanoAgain(); else if (/^m-/.test(key)) heroNames(); }
  }
  function nanoNames(list, u0, u1, n) {
    /* [key, the name, its spots, the shorter name a phone shows ON the part (names.js), if any, aside: on a phone the name
       stands beside its part first (a protein it would hide), its spots on a phone, if they differ: there the names stand
       on their parts, so a membrane is named away from the proteins named on it] */
    const phone = world.size.w < 640;
    nanoAgain = () => nanoNames(list, u0, u1, n);
    quest.names.set(list.map(([key, html, spots, small, aside, onPhone, more]) => { const I = ibName(key), hm = I ? I[0] : typeof html === 'function' ? html() : html, sm = I && I[1] || small, pk = pressOf(key); return { key, free: true, aside: !!aside, html: `<span class="nm__t">${hm}</span>${pk.mark}${no0610(key)}`, small: sm && `<span class="nm__t">${sm}</span>${pk.mark}${no0610(key)}`, press: pk.press, cls: pk.cls, spots: (phone && onPhone || spots).map(p => p.isVector3 ? p : pW(p[0], p[1], p[2] == null ? -0.5 : p[2])), ...(more || {}) }; }),
      HUD2(), lr(pW(u0, n), pW(u1, n)));
  }
  /* the names on the whole mitochondrion: one line to one part (Daniel, 5 Nov 2026: "if you're pointing to one
     mitochondrion, label it mitochondrion, not mitochondria"), so "a crista", one fold */
  function heroNames() {
    const P = (s, a) => hero.localToWorld(heroPoint(HS, s, a, 0)), T = HS.total, ks = [0.22, 0.34, 0.46, 0.58, 0.7, 0.82];
    const cr = HS.cristae.filter(c => !c.zoom), mx = [];
    for (let i = 0; i + 1 < HS.cristae.length; i++) mx.push(P((HS.cristae[i].s + HS.cristae[i + 1].s) / 2, 0));
    const all = [
      /* the two membranes, one name: here they are one line (15 nm apart); named apart where the camera zooms in (step 4).
         Two names on opposite edges had read as one membrane at the top and the other at the bottom (the expert review) */
      { key: 'm-2m', free: true, html: '<span class="nm__t">two membranes,<br>15 nm apart</span>', small: '<span class="nm__t">two membranes</span>', spots: ks.flatMap(k => { const r = along(HS, T * k).r - 0.004; return [P(T * k, r), P(T * k, -r)]; }) },
      { key: 'm-cr', free: true, html: '<span class="nm__t">a crista: a fold of<br>the inner membrane</span>', small: '<span class="nm__t">a crista (a fold)</span>', spots: cr.map(c => { const F = along(HS, c.s), across = c.f * (F.r - 0.029); return P(c.s + (c.amp || 0) * Math.sin(across * c.k + c.ph) + (c.tilt || 0) * across, c.side * (F.r - 0.0255 - across)); }) },
      { key: 'm-mx', free: true, html: '<span class="nm__t">matrix</span>', spots: mx }
    ];
    /* on a phone the names stand on their parts: three, so the mitochondrion still shows */
    /* the frame: its two ends (it lies across the view), so the names stand beside it, left and right */
    all.forEach(it => { const pk = pressOf(it.key), m = pk.mark + no0610(it.key); if (m) { it.html += m; if (it.small) it.small += m; } if (pk.press) { it.press = pk.press; it.cls = pk.cls; } });
    quest.names.set(world.size.w < 640 ? all.slice(0, 3) : all, HUD2(), lr(P(-0.2, 0), P(T + 0.2, 0)));
  }
  async function mlook() {
    world.wayIn(false); mitoLoop(true);
    await settle();
    if (world.camera.position.distanceTo(V(...world.P.mito.view.pos)) > 0.08) await camGo(heroView(), 1800);
    /* seen whole first; it is cut open when the pupil presses (the step waits: the review, 5 Nov 2026) */
    if (FR.o < 1) {
      const cb = quest.hot(() => hero.localToWorld(heroPoint(HS, HS.total * 0.62, -along(HS, HS.total * 0.62).r * 0.2, 0.3)), '✂ Cut it open', { side: 'r', cls: 'big' });
      await live(cb.done); cb.remove(); await openLid();
    }
    ok('Now you can see inside it.');
  }
  async function minside() {
    world.wayIn(false); mitoLoop(true); setLid(1);
    await settle();
    if (world.camera.position.distanceTo(V(...world.P.mito.view.pos)) > 0.08) await camGo(heroView(), 1800);
    heroNames();
    if (!state.has('glucose') || !state.has('oxygen')) { quest.say('You need glucose and oxygen: they enter the cell at <b>the way in</b>.', 'no'); return false; }
    await live(loadATP()); patch();
    /* where the zoom goes: a ring of light on the edge, and the button beside it (not over it) */
    const ring = keep(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.006, 8, 40), new THREE.MeshBasicMaterial({ color: 0xfff1a8 })));
    ring.position.copy(pW(-21, -3.5, 0)); ring.quaternion.copy(hero.quaternion);
    const zb = quest.hot(() => pW(-21, 0, 0), '🔍 Zoom in', { side: 'r', cls: 'big' });
    await live(zb.done); zb.remove(); drop(ring); quest.names.set([]);
    await camGo(SPLIT(), R.FAST ? 0 : 4200);
  }
  async function split() {
    mitoLoop(true); patch(); setLid(1); arrowOff(); mitoStrip(null, []);
    if (!MS.deep || world.camera.position.distanceTo(world.controls.target) > 0.05 || footPx()) await camGo(SPLIT(), footPx() ? 700 : 2600);
    nanoNames([['nm-c', 'cytosol', [[-17, 11.2], [-24, 11.6], [-27, 10.4]], null, false, [[-12, 4], [-30, 4], [-11, 1.5]]], ['nm-om', 'outer membrane:<br>two layers of lipids', [[-30, -1.0], [-12, -1.0], [-31, -6.0]]],
      ['nm-ch', 'channel protein', [[-22, -2.2, -2.6], [-22, -4.8, -2.6]]]], -30, -12, 2);
    const glu = mol('glucose', -21, 7.2); nbob(glu);
    await press(() => glu.position.clone().addScaledVector(pD(0, 1, 0), 0.0011), 'glucose', { cls: 'tok', side: 't' });
    state.use('glucose');
    const a = mol('half', -21, 7.2), b = mol('half', -21, 7.2); a.rotation.z = Math.PI; drop(glu);
    nburst(a.position, 0xfff1a8); eqLight('g');
    await Promise.all([tween(a, { to: pW(-22.8, 6.6), ms: 700 }), tween(b, { to: pW(-18.6, 5.4), ms: 700 })]);
    props.halves = [a, b];
    ok(ib('The glucose is split into two smaller molecules, in the cytosol. Each is smaller: about 0.6 nm across.', 'Glycolysis converts the glucose into two <b>pyruvate</b> molecules (3C each), in the cytosol; here one press shows all ten steps. Each pyruvate is about 0.6 nm across.', 'hl'));
    /* (with a course on, the pupil reads the strip and the words before the step moves on: Daniel's rule, Next waits) */
    if (courseOn()) await quest.next();
  }
  /* step 3's view: both membranes, the space between them, the top of the matrix and the cytosol where the molecules
     wait, all at once (46 nm, as tall as the free part of the screen allows), so that every name and every molecule to
     press is in view while the pupil chooses (the names had shown for an instant, then the camera moved on) */
  /* a still view in which the patch from n0 (below) to n1 (above) fills the free part of the screen, centred on u, never
     closer than dMin nm; on a phone the bag and its buttons cross the top of the picture, so it is fitted below them */
  const fitView = (u, n0, n1, dMin = 30) => {
    const st = world.canvas.getBoundingClientRect(), hd = document.querySelector('.hud'), hr = hd && hd.getBoundingClientRect();
    const top = hr && hr.width > st.width * 0.5 ? Math.max(0, hr.bottom - st.top + 6) : 0;
    const foot = footPx(), free = Math.max(160, world.size.h - (world.inset.bottom || 0) - top - foot), dnm = Math.max(dMin, (n1 - n0) * world.pxPerUnit(1) / free);
    return nanoView(u, (n0 + n1) / 2 + (top - foot) / 2 / (world.pxPerUnit(1) / dnm), dnm);
  };
  const OVER = () => fitView(-21, world.size.w < 640 ? -38 : -33, world.size.w < 640 ? 17 : 13, 40);   /* (a phone: room above the molecules for their buttons, under the corner's tools) */
  /* on a phone the names stand on their parts, and a membrane's name is as wide as half the screen: the proteins' names
     stand at the membranes' outer edges and the membranes' names at their inner edges, one above the other */
  const feedNames = () => nanoNames([['nm-ch', 'channel protein', [[-22, -1, -2.6], [-22, -5.5, -2.6]], null, false, [[-22, 0.8, -2.6], [-22, -1, -2.6]]],
    ['nm-ims', 'intermembrane space:<br>the space between<br>the membranes', [[-34, -14.5], [-8, -14.5], [-36, -12]], 'intermembrane space'],
    ['nm-cp', 'carrier protein', [[-21.5, -24, -3.4], [-21.5, -27.5, -3.4]], null, false, [[-20, -21, -3.4], [-20, -22.6, -3.4]]], ['nm-mx', 'matrix', [[-10, -30.5], [-14, -31], [-32, -30.5]], null, false, [[-6, -34], [-34, -34.5], [-10, -35]]],
    ['nm-om3', 'outer membrane', [[-10, -3.5, -0.5], [-30, -3.5, -0.5], [-14, -3.5, -0.5]], null, false, [[-40, -5.6, -0.5], [-2, -5.6, -0.5], [-36, -5.6, -0.5]]],
    ['nm-im3', 'inner membrane', [[-32, -25.5, -0.5], [-12, -25.5, -0.5], [-36, -25.5, -0.5]], null, false, [[-2, -27, -0.5], [1, -27, -0.5], [-40, -27, -0.5]]]], -36, -6, -11);
  async function feed() {
    mitoLoop(true); patch(); setLid(1); arrowOff(); mitoStrip(null, ['g']);
    const over = async () => { await camGo(OVER(), 1600); feedNames(); };
    const halves = props.halves && props.halves.every(t => t.parent) ? props.halves : [mol('half', -22.8, 6.6), mol('half', -18.6, 5.4)];
    halves.forEach(t => nbob(t, 0.00015));
    /* the six oxygen molecules for one glucose, in the cytosol beside it */
    /* clear of the corner box, and never on the channel protein's way */
    const O2 = props.o2 && props.o2.every(t => t.parent) ? props.o2 : [[-30, 3.2], [-27.5, 6.4], [-14.5, 4.0], [-12, 8.4], [-9.5, 5.4], [-16.5, 9.6]].map(([u, n]) => mol('oxygen', u, n, -1 - Math.random() * 1.2));
    props.o2 = O2; O2.forEach(t => nbob(t, 0.00012));
    const C = PT.parts.mpc;
    C.pose(1);   /* the carrier waits open to the space between the membranes, where pyruvate comes from */
    /* before each press the camera is back at this view: a button never points at something out of view */
    await over();
    for (let i = 0; i < 2; i++) {
      const t = halves[i];
      if (i) await over();
      await press(() => t.position.clone().addScaledVector(pD(0, 1, 0), 0.001), ibHL() ? 'pyruvate' : 'smaller molecule', { cls: 'tok', side: 't' });
      /* (with IB on, its way through porin carries its course word: through a channel protein, facilitated diffusion, B2.1.6
         SL; the word goes once it has left porin (n below −9), never at the carrier, which brings a hydrogen ion in with it
         (the science read, 17 Nov 2026). IGCSE names no channel protein: no word) */
      let inPorin = true; stepTag(t, () => inPorin && PT.group.worldToLocal(t.position.clone()).y > -9 ? lvWord(() => ibHL() ? 'pyruvate' : 'smaller molecule', { sl: 'facilitated diffusion' })() : '');
      /* through the channel protein in the outer membrane, across the space between the membranes, then through the carrier
         protein in the inner membrane, into the matrix; the camera follows it down */
      const stop = track(() => t.position.clone().addScaledVector(pD(0, 1, 0), -0.003), 42);
      const u0 = -22 + (i ? 0.5 : -0.5), w0 = -2.6;
      await tween(t, { path: along3([[i ? -18.6 : -22.8, i ? 5.4 : 6.6], [u0, 3.5, w0], [u0, -0.2, w0], [u0, -7.4, w0], [-21 + i * 0.4, -14, -3], [-20, -20.6, -3.4]]), ms: R.FAST ? 0 : 3600 });
      inPorin = false;
      /* the carrier's real order (the way in's carriers, viaCarrier): into its pocket, where it binds; as it settles, the
         open side shuts behind it; held for a moment, both sides shut; the carrier opens to the matrix and pyruvate
         leaves; once it is clear, the empty carrier changes back, open to the space between the membranes */
      if (C.s !== 1) await turnTo(C, 1, 500);
      const shut = wait(R.TEST ? 0 : 900).then(() => turnTo(C, 0, 600));
      await tween(t, { to: pW(-20, -25.5, -3.4), ms: 1100 });
      await shut;
      await wait(300);
      const open = turnTo(C, -1, 650);
      await wait(R.TEST ? 0 : 550);
      await tween(t, { to: pW(-20, -30.4, -3.4), ms: 800 });
      await open;
      const back = turnTo(C, 1, 900);
      await tween(t, { to: pW(-18 + i * 3.2, -35 - i * 1.6, -2), ms: 900 });
      await back;
      await stop();
      if (!i) ok(ib('It passes through a channel protein in the outer membrane, then a carrier protein in the inner membrane, into the matrix.', 'It passes through porin, a channel protein in the outer membrane, then the pyruvate carrier, a carrier protein in the inner membrane, into the matrix.', 'x'));
    }
    await over();
    await press(() => O2[2].position.clone().addScaledVector(pD(0, 1, 0), 0.0009), 'oxygen', { cls: 'tok', side: 't' });
    state.use('oxygen');
    quest.names.set([]);
    /* oxygen is small: each passes straight between the lipids of both membranes, by its own wandering way */
    const stopO = track(() => pW(-24, -16, -1.5), 56, 0.03);
    /* (the oxygen pressed carries the course's word as it goes, "oxygen · diffusion"; with Reduce motion an arrow shows its
       way: wayArrow) */
    stepTag(O2[2], lvWord('oxygen', { igcse: 'diffusion', sl: 'simple diffusion' }));
    const ways = O2.map((t, i) => {
      const u = [-33, -30, -15, -12, -9, -17][i] + jit(0.8), p0 = t.position.clone();      /* never through the channel protein (at −22) */
      return curve([p0, pW(u + jit(1.5), 1.5), pW(u, -3.5), pW(u + jit(1.2), -9), pW(u + jit(1.5), -17), pW(u, -25.5), pW(u + jit(1.5), -31), pW(-22 + i * 3 + jit(1), -36 - jit(2.5))]);
    });
    await Promise.all(O2.map((t, i) => wait(i * 260).then(() => tween(t, { path: ways[i], ms: R.FAST ? 0 : 3600 + i * 120 }))));
    await stopO();
    /* (the view from the cytosol to the matrix, so the oxygen's whole way and the six at its end are seen while Next waits:
       the following camera had left them under the picture's edge; with Reduce motion its arrow too) */
    await camGo(fitView(-21, world.size.w < 640 ? -42 : -41, 13, 40), R.FAST ? 0 : 1200);
    wayArrow(ways[2], arrowR());
    props.inside = halves; props.o2 = O2;
    ok(ib('Oxygen is a small molecule: it passes straight between the lipids of both membranes, by <dfn data-w="diffusion">diffusion</dfn>, as at the way in.', 'Oxygen is small and non-polar: it passes straight between the phospholipids of both membranes, by simple <dfn data-w="diffusion">diffusion</dfn>, as at the way in.'));
    if (courseOn()) await quest.next();
  }
  /* a molecule grows or shrinks to a size (scale), smoothly */
  const scaleTo = (o, s1, ms) => live(new Promise(res => { const s0 = o.scale.x, t0 = performance.now();
    const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms), e = k * k * (3 - 2 * k); o.scale.setScalar(s0 + (s1 - s0) * e); world.kick && world.kick(); if (k < 1) requestAnimationFrame(f); else res(); }; f(); }));
  async function respire() {
    mitoLoop(true); patch(); setLid(1); mitoStrip(null, ['g']);
    let halves = props.inside && props.inside.every(t => t.parent) ? props.inside : [mol('half', -18, -35), mol('half', -14.8, -36.6)];
    if (!props.o2 || !props.o2.every(t => t.parent)) props.o2 = [0, 1, 2, 3, 4, 5].map(i => mol('oxygen', -22 + i * 3, -36 - (i % 2) * 2));
    /* the breakdown plays once, and ↺ Watch again plays it once more from the start, as often as the pupil likes: a pupil
       who reads while it plays can see it again (the review; Daniel, 5 Nov 2026: "Yes, add it") */
    for (;;) {
      arrowOff();
      /* close, in the matrix: the two smaller molecules and the six oxygen molecules, all in view */
      await camGo(fitView(-16, -46, -24, 40), 1800);
      /* each smaller molecule is broken down by enzymes, step by step: at each step (a flash) one carbon dioxide molecule and
         some hydrogen leave it, and what is left is smaller; three steps (pyruvate has three carbons: one leaves in the link
         reaction, two in the Krebs cycle, which the IB view shows); its hydrogen is what the next step carries to the chain */
      const co2 = [], hyd = [];
      /* (with IB at HL, the first smaller molecule carries the name of the stage it has reached: the link reaction makes
         acetyl CoA, C1.2.11; then the Krebs cycle, C1.2.12) */
      const stg = [0, 0]; stepTag(halves[0], () => ibHL() ? ['pyruvate', 'pyruvate · link reaction', 'acetyl CoA', 'Krebs cycle'][stg[0]] : '');
      await Promise.all(halves.map((h, j) => (async () => {
        await wait(R.TEST ? 0 : j * 700);
        const s0 = h.scale.x;
        for (let k = 0; k < 3; k++) {
          stg[j] = k ? 3 : 1;   /* (the first carbon dioxide leaves in the link reaction, the next two in the Krebs cycle: C1.2.11, C1.2.12) */
          nburst(h.position, 0xffe7a0, 10); await wait(R.TEST ? 0 : 300);
          const c = molAt('co2', h.position.clone()), a = k * 2.1 + j * 1.3; co2.push(c); if (co2.length === 1) eqLight('c');
          tween(c, { to: h.position.clone().addScaledVector(pD(Math.cos(a), Math.sin(a), 0), 0.0026), ms: 800 });
          const hh = halo(keep(token('default', 0.00013)), 0.45, 0xffffff); hh.position.copy(h.position); hyd.push(hh);
          tween(hh, { to: h.position.clone().addScaledVector(pD(Math.cos(a + 2.4), Math.sin(a + 2.4) + 1.4, 0), 0.003), ms: 900 });
          await scaleTo(h, s0 * (1 - (k + 1) * 0.28), 500); if (!k) stg[j] = 2;
          await wait(R.TEST ? 0 : 650);
        }
        await scaleTo(h, s0 * 0.001, 450); drop(h);
      })()));
      /* each kind named, now that they are still (the review: with nothing named, carbon dioxide was "just a new dot") */
      nanoNames([['nm-co2', () => courseOn() ? 'carbon dioxide:<br>produced' : 'carbon dioxide', co2.slice(0, 4).map(c => c.position.clone())], ['nm-o2', 'oxygen', props.o2.slice(0, 4).map(c => c.position.clone())],
        ['nm-h', 'hydrogen', hyd.slice(0, 4).map(c => c.position.clone())]], -30, -2, -35);
      ok(ib('The smaller molecules are broken down, step by step: <b>carbon dioxide</b> and hydrogen are produced. The oxygen waits in the matrix: it is used in the next step.', 'The link reaction and the Krebs cycle oxidize the pyruvate, step by step: <b>carbon dioxide</b> is released (<dfn data-w="decarboxylation">decarboxylation</dfn>), and hydrogen is removed (<dfn data-w="dehydrogenation">dehydrogenation</dfn>): NAD accepts it and becomes reduced NAD. The oxygen waits in the matrix: it is used in the next step.', 'hl'));
      /* time to read the three names and the sentence before the camera moves back (2.6 s had been too short: Daniel, 5 Nov
         2026, "it zooms out too early") */
      await wait(R.TEST ? 0 : 5000);
      /* one still view from the matrix to the cytosol: the carbon dioxide leaves the way the oxygen came, straight between the
         lipids, each by its own way, and out of the top of the picture; the oxygen stays in view (the review: the camera had
         followed it out into an empty cytosol and come back) */
      quest.names.set([]);
      await camGo(fitView(-16, -42, 14, 60), 1800);
      /* (the first carries the course's word as it leaves, "carbon dioxide · diffusion"; with Reduce motion an arrow shows its way) */
      stepTag(co2[0], lvWord('carbon dioxide', { igcse: 'diffusion', sl: 'simple diffusion' }));
      const outs = co2.map(c => { const u = -27 + Math.random() * 20, p0 = c.position.clone(); return curve([p0, pW(u + jit(2), -27.5), pW(u + jit(1), -25.5), pW(u + jit(3), -15 + jit(3)), pW(u + jit(1), -3.5), pW(u + jit(3), 6 + jit(2)), pW(u + jit(4), 26)]); });
      await Promise.all(co2.map((c, i) => wait(R.TEST ? 0 : i * 260 + Math.random() * 300).then(() => tween(c, { path: outs[i], ms: R.FAST ? 0 : 4400 + Math.random() * 1400 }))));
      wayArrow(outs[0], arrowR());
      co2.forEach(drop);
      props.hyd = hyd;
      /* what stays for the next step, named again: the white dots are the hydrogen, beside the oxygen */
      nanoNames([['nm-h2', 'hydrogen', hyd.slice(0, 4).map(c => c.position.clone())], ['nm-o2c', 'oxygen', props.o2.slice(0, 4).map(c => c.position.clone())]], -34, 2, -36);
      ok(ib('Carbon dioxide leaves the mitochondrion: it passes straight between the lipids, as the oxygen did when it entered.', 'Carbon dioxide leaves the mitochondrion: it passes straight between the phospholipids, by simple diffusion, as the oxygen did when it entered.'));
      const nx = quest.next(), again = R.h('button', { type: 'button', class: 'btn ghost again' }, '↺ Watch again');
      quest.step.do.appendChild(again);
      const pick = await live(Promise.race([nx.then(() => 'next'), new Promise(r => again.addEventListener('click', () => r('again'), { once: true }))]));
      again.remove();
      if (pick === 'next') return;
      /* the same start again: Next waits until it has played, the two smaller molecules are back where they arrived, and
         the hydrogen is not made yet (the oxygen never moved) */
      const nb = quest.step.do.querySelector('.btn.next'); if (nb) nb.remove();
      quest.names.set([]); quest.say('');
      hyd.forEach(drop); props.hyd = null;
      halves = [mol('half', -18, -35, -2), mol('half', -14.8, -36.6, -2)];   /* where step 3 left them */
    }
  }
  /* ---------- the hydrogen ions the pumps move into the space inside the fold: they build up there, like water behind a
     dam, and flow back only through ATP synthase, which turns and makes ATP (Daniel, 5 Nov 2026: "protons going inside the
     membrane and accumulating there in high quantity, a high concentration … acting like a dam … leaving … through the
     ATP synthase … generating ATP"). Many inside the fold, a few in the matrix ---------- */
  let HC = null;
  function hCrowd() {
    if (HC) return HC;
    const G = PT.geo, N = 120, NM = 6, all = N + NM, pumps = PT.parts.pumps;
    const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 10, 8), new THREE.MeshStandardMaterial({ color: H_COL, emissive: H_COL, emissiveIntensity: 0.9, roughness: 0.3 }), all);
    mesh.frustumCulled = false; PT.group.add(mesh);
    const glow = glowPoints(all, 0.0028); PT.group.add(glow);
    const r = (i, k) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
    /* where each one stays: inside the fold, between its walls, more of them towards its round end (where the camera looks
       at ATP synthase), so that the crowd is seen; and a few in the matrix */
    const homes = [];
    for (let i = 0; i < N; i++) homes.push(V(G.uc + (r(i, 1) - 0.5) * (2 * G.hw - 8), G.nB - 6 - Math.pow(r(i, 2), 0.5) * (G.depth - 14), -0.8 - r(i, 3) * 8));
    /* the few in the matrix: three beside the chain, three beside the ATP synthases (both sides of the "dam" in view there) */
    for (let i = 0; i < NM; i++) homes.push(i < 3 ? V(G.uc - G.hw - 9 - r(i, 4) * 14, -50 - r(i, 5) * 28, -0.8 - r(i, 6) * 6)
      : V(G.uc + (i === 3 ? -24 : i === 4 ? 25 : -14) + r(i, 4) * 3, G.nR - 22 - r(i, 5) * 8, -0.8 - r(i, 6) * 5));
    /* each one inside the fold was pumped: from the matrix, through one of the three pumps, then to where it stays */
    const ways = homes.map((h, i) => { const p = pumps[i % 3]; return new THREE.CatmullRomCurve3([V(p.x - 7, p.n + (r(i, 7) - 0.5) * 4, p.w + 1.5), V(p.x, p.n, p.w + 1.2), V(p.x + 5, p.n - 2, p.w + 1.2), h]); });
    const tv = V(), tm = new THREE.Matrix4(), tq = new THREE.Quaternion(), ts = V(1, 1, 1), zero = new THREE.Matrix4().makeScale(0, 0, 0);
    HC = { N, NM, homes, on: false, full: false, start: null, dur: 7000, hidden: false, mark: null, markI: 30, markK: -1 };
    /* (how many have reached the space inside the fold: the IB strip's count, ionStrip) */
    HC.pumped = () => HC.full || R.FAST ? N : HC.start == null ? 0 : Math.max(0, Math.min(N, Math.floor((performance.now() - HC.start - 1300) * N / HC.dur) + 1));
    W.anim.push(t => {
      const gp = glow.geometry.attributes.position, gc = glow.geometry.attributes.color;
      if (!HC.on) { if (!HC.hidden) { for (let i = 0; i < all; i++) { mesh.setMatrixAt(i, zero); gc.setXYZ(i, 0, 0, 0); } mesh.instanceMatrix.needsUpdate = gc.needsUpdate = true; HC.hidden = true; } return; }
      HC.hidden = false; const now = performance.now();
      for (let i = 0; i < all; i++) {
        let k = 1;                                                     /* 1: where it stays */
        if (i < N && !HC.full) k = HC.start == null ? -1 : R.FAST ? 1 : (now - HC.start - HC.dur * i / N) / 1300;
        if (i === HC.markI) HC.markK = k;
        if (k < 0) { mesh.setMatrixAt(i, zero); gc.setXYZ(i, 0, 0, 0); continue; }
        if (k < 1) ways[i].getPointAt(k * k * (3 - 2 * k), tv);
        else { const h = homes[i]; tv.set(h.x + 0.5 * Math.sin(t * 1.3 + i), h.y + 0.5 * Math.cos(t * 1.1 + i * 1.7), h.z + 0.35 * Math.sin(t * 0.9 + i * 2.3)); }
        if (HC.mark && i === HC.markI) HC.mark.position.copy(tv);
        tm.compose(tv, tq, ts); mesh.setMatrixAt(i, tm); gp.setXYZ(i, tv.x, tv.y, tv.z); gc.setXYZ(i, 0.62, 0.85, 0.3);
      }
      mesh.instanceMatrix.needsUpdate = true; gp.needsUpdate = gc.needsUpdate = true;
    });
    return HC;
  }
  /* the crowd's places that the camera sees now, to end a name's line on (patch coordinates → the world) */
  const crowdSpots = (n = 5) => HC.homes.slice(0, HC.N).map(h => PT.group.localToWorld(h.clone())).filter(p => { const sc = world.project(p); return sc.inFront && sc.x > 40 && sc.x < world.size.w - (world.inset.right || 0) - 40 && sc.y > 40 && sc.y < world.size.h - (world.inset.bottom || 0) - 40; }).slice(0, n);
  async function water() {
    mitoLoop(true); patch(); setLid(1); quest.names.set([]);   /* the last step's names never stand on this view */
    const G = PT.geo, pump4 = [G.uc - G.hw - 4.5, -70], P1 = PT.parts.pumps[0], P4 = PT.parts.pumps[2];
    const O2 = props.o2 && props.o2.every(t => t.parent) ? props.o2 : [0, 1, 2, 3, 4, 5].map(i => mol('oxygen', -22 + i * 3, -36 - (i % 2) * 2));
    const HC = hCrowd(); HC.on = true; HC.full = false; HC.start = null;      /* the fold empty until the pumps work */
    arrowOff(); ionCount = () => ({ a: HC.pumped(), full: HC.full }); mitoStrip('pump', ['g', 'c']);
    /* (with IB at HL, one ion carries "proton · pumped" on its way through the pump into the fold: C1.2.13–14) */
    const mk = new THREE.Object3D(); PT.group.add(mk); HC.mark = mk;
    stepTag(mk, () => ibHL() && HC.markK > 0 && HC.markK < 2 ? 'proton · pumped' : '');
    const p4name = ['nm-p4', 'the last protein<br>in the chain', [[P4.x - 1.6, P4.n, P4.w + 2.4], [P4.x - 1.6, P4.n + 2, P4.w + 2.2]], null, true];
    const mxname = ['nm-mx2', 'matrix', [[pump4[0] - 14, -54], [pump4[0] - 16, -76]]];
    /* the hydrogen from the smaller molecules (step 4) goes on to the first protein's arm in the matrix, and the oxygen drifts
       nearer the last one, while the camera comes to the chain (the three proteins in view, below the bag on a phone) */
    const arm = pW(P1.x - 6.2, P1.n - 6.2, P1.w + 2);
    const hyd = props.hyd && props.hyd.every(t => t.parent) ? props.hyd : [0, 1, 2, 3].map(k => { const h = halo(keep(token('default', 0.00013)), 0.45, 0xffffff); h.position.copy(pW(P1.x - 20 - k * 2.5, P1.n - 14 + k * 2.5, -1.4)); return h; });
    props.hyd = null;
    const near = O2.map((t, i) => pW(pump4[0] - 9 - (i % 3) * 2.2 + jit(0.6), -63 - Math.floor(i / 3) * 4.5 - (i % 2) * 1.5, -1.2 - Math.random()));
    const drift = Promise.all(O2.map((t, i) => tween(t, { path: curve([t.position.clone(), pW(-6 + jit(3), -50 + jit(4)), near[i]]), ms: R.FAST ? 0 : 3800 + i * 200 })));
    const hGo = Promise.all(hyd.map((h, k) => wait(R.TEST ? 0 : 600 + k * 220).then(() => tween(h, { to: arm, ms: R.FAST ? 0 : 2600 }))));
    await camGo(fitView(pump4[0] - 4, -78, -42, 50), 2200);
    /* part 1: the space inside the fold is named before it fills (the review); the hydrogen reaches the first protein, its
       energy passes along the chain (a light, protein to protein), and the three pumps move hydrogen ions into the fold */
    nanoNames([p4name, ['nm-lum', 'the space<br>inside the fold', [[G.uc - 4, -60, -1], [G.uc - 4, -70, -1], [G.uc - 2, -66, -1]], 'inside the fold'], mxname], pump4[0] - 18, G.uc + G.hw + 3, -60);
    await hGo;
    hyd.forEach(drop); nburst(arm, 0xfff1a8, 14);
    const pulse = keep(token('default', 0.0004)); pulse.position.copy(arm);
    tween(pulse, { path: curve(PT.parts.pumps.map(p => pW(p.x - 1.5, p.n, p.w + 2.5))), ms: R.FAST ? 0 : 2400 }).then(() => drop(pulse));

    HC.start = performance.now();
    await Promise.all([wait(R.TEST ? 0 : HC.dur + 1300), drift]);
    HC.full = true;
    /* the oxygen is not named here: its own button says "oxygen" (a name beside it said the same word twice) */
    nanoNames([p4name, ['nm-hi', 'many<br>hydrogen ions', crowdSpots(), 'hydrogen ions'], mxname], pump4[0] - 18, G.uc + G.hw + 3, -60);
    ok(ib('The proteins pumped <b>hydrogen ions</b> into the space inside the fold: now many are there.', 'The electron transport chain pumped <b>protons</b> (hydrogen ions) into the intermembrane space: now their concentration there is high.', 'hl'));
    /* part 2, when the pupil presses: each oxygen molecule goes to the last protein; there it joins with hydrogen (four, from
       the smaller molecules): two water molecules (the review: four things had happened at once) */
    await press(() => O2[0].position.clone().addScaledVector(pD(0, 1, 0), 0.0009), 'oxygen', { cls: 'tok', side: 't' });
    quest.names.set([]);
    stepTag(O2[0], lvWord('oxygen', { igcse: 'used here', hl: 'terminal electron acceptor' }));
    const out = [];
    const toEnd = O2.map((t, i) => curve([t.position.clone(), pW(pump4[0] - 5 + jit(1), -68 + jit(2)), pW(pump4[0] - 1.2 + jit(0.6), -70 + (i - 2.5) * 1.3, -2.2)]));
    await Promise.all(O2.map((t, i) => {
      const end = toEnd[i].points[2];
      return wait(R.TEST ? 0 : i * 320).then(() => tween(t, { path: toEnd[i], ms: R.FAST ? 0 : 1800 })).then(async () => {
        if (!i) eqLight('o');
        const hs = [0, 1, 2, 3].map(k => { const h = halo(keep(token('default', 0.00013)), 0.4, 0xffffff); h.position.copy(end).addScaledVector(pD(Math.cos(k * 1.57), Math.sin(k * 1.57), 0), 0.0016); return h; });
        await Promise.all(hs.map(h => tween(h, { to: end, ms: 600 })));
        hs.forEach(drop); drop(t);
        if (!i) eqLight('w');
        for (let k = 0; k < 2; k++) { const w = molAt('water', end.clone()); out.push(w); tween(w, { to: end.clone().addScaledVector(pD(-1, 0, 0), 0.0016 + 0.0009 * k).addScaledVector(pD(0, 1, 0), (k ? 1 : -1) * 0.0012), ms: 700 }); }
      });
    }));
    props.water = out; props.o2 = null;
    wayArrow(toEnd[0], arrowR());   /* (with Reduce motion: the first oxygen's way to the last protein) */
    await wait(R.TEST ? 0 : 800);
    /* (a phone: the water and the ions only, the water's name on its left: on the last protein it had covered it and run
       along its line, the science read, 17 Nov 2026; the protein and the matrix were named before the oxygen came) */
    const wat = ['nm-wat', () => courseOn() ? 'water:<br>produced' : 'water', out.slice(0, 6).map(w => w.position.clone()), null, false, null, { prefer: -1 }];
    nanoNames(world.size.w < 640 ? [wat, ['nm-hi', 'many<br>hydrogen ions', crowdSpots(), 'hydrogen ions']] : [p4name, wat, ['nm-hi', 'many<br>hydrogen ions', crowdSpots(), 'hydrogen ions'], mxname], pump4[0] - 18, G.uc + G.hw + 3, -60);
    ok(ib('At the last protein in the chain, oxygen joins with hydrogen from the smaller molecules: <b>water</b> is produced.', 'At the end of the chain, oxygen accepts electrons and protons: <b>water</b> is produced. Oxygen is the terminal electron acceptor.', 'hl'));
    await quest.next();
    PT.group.remove(mk); HC.mark = null;
  }
  /* the dam: the hydrogen ions flow back only through ATP synthase, which turns in steps, one for each ion, and makes ATP
     (mitoparts.js ionStream, atpMaker) */
  /* a small name that moves with what it names (9 Nov 2026, Daniel, of the dam: "the ATP label and few hydrogen ions, they
     are static … show that the little yellow dots are hydrogen ions … labeling all of the ATP molecules … showing ADP and
     then converting it into ATP"): a sprite drawn over everything, the same size on the screen at any distance (22 px
     high), above its part, its words changed when the part changes. The names on level lines (names.js) stay for what
     stands still */
  const TAGS = {};
  function tagTex(text) {
    if (TAGS[text]) return TAGS[text];
    const c = document.createElement('canvas'), g = c.getContext('2d'), F = '800 44px Nunito, Arial, sans-serif';
    g.font = F; const w = Math.ceil(g.measureText(text).width) + 44; c.width = w; c.height = 68;
    g.font = F; g.fillStyle = 'rgba(28,20,44,0.92)'; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 3;
    g.beginPath(); if (g.roundRect) g.roundRect(2, 2, w - 4, 64, 30); else g.rect(2, 2, w - 4, 64); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 36);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return (TAGS[text] = { t, aspect: w / 68 });
  }
  function moveTag(sp, text, parent, local, lift) {      /* lift: px between the part and its tag */
    if (!text) { sp.visible = false; sp.material.opacity = 0; return; }   /* (no word for it in the course on: no tag) */
    const T = tagTex(text); if (sp.material.map !== T.t) { sp.material.map = T.t; sp.material.needsUpdate = true; }
    /* its size on the screen is always the same, 22 px high (12 Nov 2026; Daniel saw the names grow in the pictures: "be
       careful with huge [names] being shown"). It was worked out from how long the part's OWN x axis looks on the screen:
       a molecule that turns as it moves, or goes through a carrier, points that axis at the camera, the length goes to
       nothing, and its name grew until "amino acid" stood across the whole picture. Now from the camera's own right, one
       unit of the world at the part, and the part's own scale */
    const a = parent.localToWorld(local.clone()), rightW = V(1, 0, 0).applyQuaternion(world.camera.quaternion), upW = V(0, 1, 0).applyQuaternion(world.camera.quaternion);
    const pa = world.project(a), pb = world.project(a.clone().add(rightW)), px = Math.hypot(pb.x - pa.x, pb.y - pa.y), sc = parent.getWorldScale(V(1, 1, 1)).x || 1;   /* px for 1 unit of the world here */
    /* (a molecule that flies to the bag comes right up to the camera: there its name goes at once) */
    if (!pa.inFront || !(px > 0.5) || px > 1e6 || world.camera.position.distanceTo(a) < 0.25 * world.camera.position.distanceTo(world.controls.target)) { sp.material.opacity = 0; sp.visible = false; return; }
    const h = 22 / px / sc; sp.scale.set(h * T.aspect, h, 1); sp.position.copy(parent.worldToLocal(a.clone().addScaledVector(upW, (lift + 11) / px)));
    /* never over a name, the corner box or the panel, nor cut by the picture's edge: there it fades out, and back in when
       clear (a fade, never a blink: memory label-lines-never-cross) */
    const c = world.project(parent.localToWorld(sp.position.clone())), cr = world.canvas.getBoundingClientRect(), hw = 11 * T.aspect + 4;
    const box = { l: cr.left + c.x - hw, r: cr.left + c.x + hw, t: cr.top + c.y - 15, b: cr.top + c.y + 15 };
    const over = r => r.width > 0 && box.l < r.right && box.r > r.left && box.t < r.bottom && box.b > r.top;
    const s = world.size, clear = c.inFront && c.x - hw > 4 && c.x + hw < s.w - (world.inset.right || 0) - 4 && c.y - 15 > 4 && c.y + 15 < s.h - (world.inset.bottom || 0) - 4
      && ![...document.querySelectorAll('#names .nm')].some(e => e.style.visibility !== 'hidden' && over(e.getBoundingClientRect())) && !HUD2().some(e => over(e.getBoundingClientRect()));
    const m = sp.material; m.opacity += ((clear ? 1 : 0) - m.opacity) * 0.18; sp.visible = m.opacity > 0.02;
  }
  /* the dam's tags, made once (on the two ATP synthases, which stay in the world) and hidden when the pupil leaves */
  let damTags = null;
  function damTagsOff() { if (damTags) [damTags.h, ...damTags.m.flat()].forEach(sp => { sp.visible = false; sp.material.opacity = 0; }); }
  const newTag = parent => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex('ATP').t, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); sp.renderOrder = 30; sp.visible = false; parent.add(sp); return sp; };
  async function dam() {
    mitoLoop(true); patch(); setLid(1); quest.names.set([]); arrowOff();
    const G = PT.geo, HC = hCrowd(); HC.on = true; HC.full = true;
    /* far enough back that the two ATP synthases leave room beside them for the names (below the bag on a phone); the
       water goes on drifting where it was made, out of the picture as the camera moves (it is no longer dropped at once) */
    await camGo(fitView(G.uc, world.size.w < 640 ? G.nR - 46 : G.nR - 32, G.nR + 12, 74), 2200);   /* (a phone: room under the heads for the names) */
    (props.water || []).forEach(drop); props.water = null;
    const A = PT.parts.atp, s0 = quest.session;
    props.flow = props.flow || A.map(a => ({ s: ionStream(a), m: atpMaker(a), rotor: a.userData.rotor }));
    /* one ion followed, brighter, through the first ATP synthase */
    if (!props.follow) { props.follow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), new THREE.MeshStandardMaterial({ color: H_COL, emissive: H_COL, emissiveIntensity: 1.1, roughness: 0.3 })); haloSprite(props.follow, 1.1, 0xd9ff9e); A[0].add(props.follow); }
    const fol = props.follow;
    /* the tags: one on the ion followed ("hydrogen ion"), one on each molecule made at a head ("ADP + phosphate", then
       "ATP" once the phosphate has joined, until it has gone) */
    if (!damTags) damTags = { h: newTag(A[0]), m: props.flow.map((F, i) => F.m.made.map(() => newTag(A[i]))) };
    const TG = damTags;
    const tagsDraw = () => {
      if (fol.visible) moveTag(TG.h, ibHL() ? 'proton · chemiosmosis' : 'hydrogen ion', A[0], fol.position, 8); else { TG.h.visible = false; TG.h.material.opacity = 0; }
      props.flow.forEach((F, i) => F.m.made.forEach((m, j) => {
        const sp = TG.m[i][j], on = F.m.seen(m) && (m.userData.leave || 0) < 0.85;
        if (on) moveTag(sp, (m.userData.join || 0) > 0.6 ? 'ATP' : 'ADP + phosphate', A[i], m.position, 12); else { sp.visible = false; sp.material.opacity = 0; }
      }));
    };
    const names = extra => nanoNames([['nm-atp', 'ATP synthase<br>(a protein)', A.map(a => a.localToWorld(V(0, 12, 0))), 'ATP synthase', true, [A[0].localToWorld(V(0, 12, 0))], world.size.w < 640 ? { up: 1 } : null],   /* (a phone: under the left one's head, on one upright line, in the matrix: beside it, it had covered the right one's head) */
      ['nm-hi2', 'many<br>hydrogen ions', crowdSpots(), 'many hydrogen ions'],
      ['nm-few', 'few<br>hydrogen ions', HC.homes.slice(HC.N + 3).map(h => PT.group.localToWorld(h.clone())), 'few hydrogen ions'], ...extra], G.uc - 21, G.uc + 21, G.nR - 16);
    names([]);
    /* the flow: 2 ions a second through each; the ring moves in steps, one for each ion, and ADP and phosphate join into
       ATP each third of a turn. It goes on while the pupil reads, until Next (the review: it had stopped, frozen) */
    let T = 0, last = performance.now(), run = true;
    /* (the strip: with IB at HL the protons' concentrations and their way back, with no count: a count ran on past the 120
       pumped and invited 120 ÷ 8 × 3 = 45 ATP, against the place's 30–32: the science read, 17 Nov 2026; else the
       equation, "energy is released" still to come: never lit as ATP is made, which would read as "making ATP releases
       energy") */
    ionCount = () => ({ a: 0, b: 0, full: true }); mitoStrip('flow', ['g', 'c', 'o', 'w']);
    const T1 = 18.5;   /* after this, ATP is named: the seventh is being made on the near side of the head */
    const tick = () => {
      if (!run || quest.session !== s0) return;
      /* (with Reduce motion one still, at T1: it had added T1 each frame, and the protons' count ran away) */
      const now = performance.now(); T = R.FAST ? T1 : T + Math.min(0.1, (now - last) / 1000) * 2; last = now;
      props.flow.forEach(F => { F.rotor.rotation.y = F.s.rotorY(T); F.s.update(T, true); F.m.update(T, true); });   /* both the same way, with their ions */
      const kf = 8 * Math.floor(Math.max(0, T - 1e-6) / 8); fol.visible = props.flow[0].s.ionAt(kf, T, fol.position) > 0;
      tagsDraw();
      world.kick && world.kick(); requestAnimationFrame(tick);
    };
    tick();
    await live(new Promise(res => { const f = () => (T >= T1 || quest.session !== s0 ? res() : requestAnimationFrame(f)); f(); }));
    /* (each ATP is named by its own tag as it is made; the one fixed name "ATP" at the head had not shown that it is made
       again and again) */
    ok(ib('As the hydrogen ions flow back through it, the ring of ATP synthase turns, and it makes <b>ATP</b>. The cell uses the energy in ATP for its work.', 'As the protons flow back through it, down their gradient (<dfn data-w="chemiosmosis">chemiosmosis</dfn>), the ring of ATP synthase turns, and it phosphorylates ADP to <b>ATP</b>. The cell uses the energy in ATP for its work.', 'hl'));
    await quest.next();
    run = false; damTagsOff();
  }
  async function release() {
    mitoLoop(true); patch(); setLid(1); arrowOff(); mitoStrip(null, ['g', 'c', 'o', 'w']);
    (props.water || []).forEach(drop);
    quest.names.set([]);
    await camGo(heroView(), R.FAST ? 0 : 3600);
    if (HC) HC.on = false;
    mitoLoop(false); bar && (bar.hidden = true);
    burst(scene, hero.position, { color: 0xfff1a8, n: 90, r: 2.2, ms: 1600 }); eqLight('e');   /* (the place's words: "energy is released") */
    await quest.gain('energy', hero.position, RESPIRE);
    /* the way on. Beyond the Year 7 list, the place's end offers the IB extension once every check is right (quest.js;
       it replaced the Explorer film offered here, 5 Nov 2026) */
    await live(quest.next(state.has('glucose') && state.has('oxygen') && state.energy() < 70 ? 'Next step' : 'Back to the map'));
  }

  /* IB mode turned on or off in a place: its names follow at once (quest.js courseSwitch). A finished way in shows its
     names only with IB on, the carrier proteins named; on the magnified mitochondrion, the last names are drawn again */
  document.addEventListener('ib-switch', e => {
    if (quest.cur !== e.detail.id) return;
    if (e.detail.id === 'wayin') { if (state.done('wayin')) { quest.names.set([]); if (e.detail.on) wayNames(true); } else if ((quest.names.items[0] || {}).key === 'w-in') wayNames(true); }
    else if (e.detail.id === 'mito' && nanoAgain && quest.names.items.some(it => IB_NAMES[it.key] || (CARDS.mito || {})[it.key])) nanoAgain();
  });
  /* a course switched on or off, or the IB level changed, in the mitochondria: the strip, the not-named marks and the
     names that carry a course word follow (a frame later: the switch's own redraw sets the buttons lvHere reads) */
  const mitoFollow = () => requestAnimationFrame(() => {
    if (quest.cur !== 'mito') return;
    if (stripAgain) stripAgain();
    cardOff();
    const ks = ((quest.names && quest.names.items) || []).map(it => it.key);
    if (ks.some(k => /^m-/.test(k))) heroNames(); else if (nanoAgain && ks.some(k => NOT0610.has(k) || IB_NAMES[k] || (CARDS.mito || {})[k] || k === 'nm-co2' || k === 'nm-wat')) nanoAgain();
  });
  document.addEventListener('courselv', mitoFollow); document.addEventListener('iblevel', mitoFollow);

  /* ---------------- nucleus ---------------- */
  const win = N.winDir.clone();
  const nucView = () => ({ pos: N0.clone().addScaledVector(win, 6.4).add(V(0.5, -0.2, 0)), at: N0.clone().add(V(0.15, 0.1, 0.2)) });
  /* ---- the courses on the nucleus's picture (17 Nov 2026; the audit's ways 2 to 6, as at the mitochondria) ----
     With IGCSE or IB on, the picture teaches the place's own course lines (story.js nucleus `course`; no new fact):
     - a name that the 0610 syllabus does not use carries the grey mark (the nuclear envelope, the nuclear pores and the
       nucleolus: the place's own "not named" line and the nucleolus's; the syllabus has no "outer membrane" either);
     - a name that a course line speaks of is a button: its card holds that line's piece, with its level and code (CARDS);
     - chromosome 1, found, is named with the course's word, and with IGCSE a strip counts 23 pairs in two sets, a mark
       lit for each thread pressed (17.1.11, 17.1.12; the picture draws 14 of the 46, and the strip says so); with IB at
       HL the strip is the cell cycle, lit where the picture is: interphase, S while the second thread grows, mitosis
       while the X stands (D2.1.13, D2.1.14, D2.1.6);
     - the second thread's growing end, the packing thread and the copy carry the course's word as they move;
     - the gene, found, can be compared in two cells: expressed in this gland cell, there but not expressed in a cell
       that makes no amylase (17.1.9; D1.2.4);
     - the copy on its way out is named for every pupil ("the copy: mRNA"; nothing in that picture had a name), with
       the course's word; the pore it leaves by is named, and with a course on the nucleus and the cytoplasm too.
     Every step then waits for Next (the pupil is reading its line: the places planner's A3). */
  const NOT0610N = new Set(['d-pore', 'd-fg', 'd-om', 'd-gap', 'd-im', 'n-env', 'n-nol', 'n-pore', 'x-pore', 'nol-reg', 'nol-small', 'nol-large', 'o-pore', 'o-rer',
    'r-s', 'r-l', 'r-mem', 'r-car', 'r-sig', 's-mem', 's-in', 's-lipid', 's-lip', 's-cyt', 's-head', 's-tails', 's-t1', 's-t2',
    'e-mem', 'e-ch', 'e-in', 'e-cyt', 'e-sig', 'e-enz', 'g-sac', 'g-lys', 't-mt', 't-mt2', 't-mot', 't-dyn', 't-ada', 'x-pit', 'x-pit2', 'x-cv', 'x-ves3']);   /* (and the nucleolus's: the region, the two parts of a ribosome, the pores, the rough ER; the ribosomes': the two parts, the rough ER's membrane, the carrier, the signal) */
  const noN = key => lvHere('igcse') && !lvHere('ib') && NOT0610N.has(key) ? '<span class="nm__no">not named in 0610</span>' : '';
  /* a name of the nucleus with its course on it: w.ib or w.igcse in place of its Year 7 words, its mark, and its card's
     button when a line of a course that is on speaks of it */
  const cName = (it, w = {}) => {
    /* (w.hl: IB's words at HL only, a word of an HL line; SL then keeps w.ib or the Year 7 words) */
    const t = lvHere('ib') && (ibHL() && w.hl || w.ib) ? ibHL() && w.hl || w.ib : lvHere('igcse') && w.igcse ? w.igcse : '', pk = pressOf(it.key, w.card), add = pk.mark + noN(it.key);
    /* (where the names stand on their parts, the shorter words: IB's own short name; the course's words when they
       replace the Year 7 ones, or the shorter name would lose them) */
    const sm = lvHere('ib') && w.ibSmall ? `<span class="nm__t">${w.ibSmall}</span>` : t && it.small ? `<span class="nm__t">${t}</span>` : it.small;
    return Object.assign({}, it, { html: (t ? `<span class="nm__t">${t}</span>` : it.html) + add, small: sm ? sm + add : undefined, press: pk.press, cls: [it.cls, pk.cls].filter(Boolean).join(' ') });
  };
  /* the strips: the pairs (IGCSE), the cell cycle (IB at HL; not on a phone at the X, which needs the foot of the
     picture), the two cells of the gene's step (any course) */
  let pairLit = [], cycAt = 'i';
  const EXPR = { off: false };
  const pairPaint = () => {
    const el = document.getElementById('conc'); if (!el || !el.classList.contains('conc--pair')) return;
    el.querySelectorAll('.prs__c').forEach(c => { const k = +c.dataset.k; c.classList.toggle('is-on', pairLit.includes(k)); c.classList.toggle('is-1', k === 1); });
    el.setAttribute('aria-label', `Chromosomes of this nucleus: 23 pairs, 46 chromosomes. A diploid nucleus contains two sets of chromosomes. ${pairLit.length ? 'You pressed chromosome ' + pairLit.join(', ') + ': one of each pair is lit.' : 'No thread pressed yet.'} The picture draws 14 of the 46: one of each of 14 pairs.`);
  };
  /* (the science read, 17 Nov 2026: at interphase G1, S and G2 are not lit, since this cell made no second thread; 'n':
     nothing lit while the X loosens, and interphase again only when the second thread has gone from the picture) */
  const CYC = { i: 'Interphase is a metabolically active period: this cell makes proteins such as amylase.', s: 'A cell that is going to divide. S: the DNA is copied.', m: 'Chromosomes condense in mitosis.', n: 'The picture goes back to your cell.' };
  const cycPaint = () => {
    const el = document.getElementById('conc'); if (!el || !el.classList.contains('conc--cyc')) return;
    const on = { i: cycAt === 'i' || cycAt === 's', s: cycAt === 's', m: cycAt === 'm' };
    el.querySelectorAll('[data-c]').forEach(e => e.classList.toggle('is-on', !!on[e.dataset.c]));
    el.querySelector('.cyc__f').textContent = CYC[cycAt];
    el.setAttribute('aria-label', 'The cell cycle: interphase (G1, S, G2), then mitosis. ' + CYC[cycAt]);
  };
  const cycSet = k => { cycAt = k; cycPaint(); };
  function nucStrip(kind) {
    const s0 = quest.session; stripAgain = () => { if (quest.session === s0 && quest.cur === 'nucleus') nucStrip(kind); };
    const old = document.getElementById('conc'); if (old) old.remove();
    const st = document.getElementById('stage'); if (!st) return;
    const el = document.createElement('div'); el.id = 'conc';
    if (kind === 'pairs' && lvHere('igcse')) {
      el.className = 'conc conc--pair'; el.setAttribute('role', 'img');
      el.innerHTML = '<p class="conc__k">Chromosomes of this nucleus</p>'
        + `<div class="prs" aria-hidden="true">${[...Array(23)].map((_, i) => `<span class="prs__c" data-k="${i + 1}"><i></i><i></i></span>`).join('')}</div>`
        + '<p class="conc__f"><b>23 pairs</b>: 46 chromosomes</p><p class="prs__s">A diploid nucleus contains <b>two sets</b> of chromosomes.</p>'
        + '<p class="eqs__h prs__key">each column: a pair · each row: a set</p><p class="eqs__h prs__key">lit: a thread that you pressed</p><p class="eqs__h">The picture draws 14 of the 46: one of each of 14 pairs.</p>';
      stripLoop(el, st); pairPaint();
    } else if (kind === 'expr' && courseOn()) {
      el.className = 'conc conc--expr';
      el.innerHTML = '<p class="conc__k">The amylase gene in two cells</p>'
        + '<div class="exprsw" role="group" aria-label="Which cell the picture shows"><button type="button" class="exprsw__b" data-x="0">This gland cell</button><button type="button" class="exprsw__b" data-x="1">Another body cell: it makes no amylase</button></div>'
        + '<p class="exprsw__n" role="status"></p>';
      const set = off => { EXPR.off = off; el.querySelectorAll('[data-x]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.x === '1') === off)));
        /* (each course's own words, the science read, 17 Nov 2026: 0610 17.1.9 with IGCSE on; with IB alone, D1.2.4, whose
           lines do not say "the same gene" at SL nor "the specific proteins that it needs") */
        const ig = lvHere('igcse');
        el.querySelector('.exprsw__n').textContent = off
          ? (ig ? 'This cell contains the same gene, but does not express it: a cell makes only the specific proteins that it needs.' : 'In this cell the amylase gene is not expressed: not all genes in a cell are expressed at any given time.')
          : (ig ? 'This cell expresses the amylase gene: it makes amylase.' : 'In this cell the amylase gene is expressed: transcription is the first stage of gene expression.');
        cardOff(); geneNames(); world.kick && world.kick(); };
      el.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (b) set(b.dataset.x === '1'); });
      stripLoop(el, st); set(EXPR.off);
    } else if ((kind === 'pairs' || kind === 'cycle') && ibHL() && !(kind === 'cycle' && world.size.w < 640)) {
      el.className = 'conc conc--cyc'; el.setAttribute('role', 'img');
      el.innerHTML = '<p class="conc__k">The cell cycle <span class="eqs__h">lit: what the picture shows</span></p>'
        + '<p class="cyc"><span class="cyc__b" data-c="i">interphase <span class="cyc__p">G1</span><span class="cyc__p" data-c="s">S</span><span class="cyc__p">G2</span></span><span class="cyc__a" aria-hidden="true">→</span><span class="cyc__b" data-c="m">mitosis</span></p>'
        + '<p class="conc__f cyc__f"></p>';
      stripLoop(el, st); cycPaint();
    }
  }
  /* on a phone a strip stands at the foot of the picture, where chromosome 1 and its gene are: the view moves up by half
     the strip's height, so that they stay in the free part above it, and back when the strip has gone (a laptop's strip
     stands beside the panel: nothing moves there) */
  const nucLift = async () => {
    const v = nucView(), f = footPx(); if (f) { const dy = f / 2 / world.pxPerUnit(v.pos.distanceTo(v.at)); v.pos.y -= dy; v.at.y -= dy; }
    if (world.camera.position.distanceTo(v.pos) > 0.03 && world.camera.position.distanceTo(v.pos) < 1.2) await fly(v.pos, v.at, R.FAST ? 0 : 600);
  };
  /* a step of the nucleus starts: its own tags only (stepTag), no card left open, the gene expressed again, and no strip
     unless the step sets one */
  const nucStep = () => { mitoStepN++; nucAgain = null; cardOff(); arrowOff(); EXPR.off = false; stripAgain = null; stripOff(); };
  /* a word that rides on a moving part of the nucleus (the growing end of the second thread, the copy): a small label
     over the picture, a short line under it down to the part, for this step only, until off(). Not a sprite in the world
     (molTag): over a bright thread the nucleus's glow washed one out (the frames, 17 Nov 2026). `at`: the part's point in
     the world now; `text`: its words now ('' : no label); `below`: under the part (the copy on its way out: above it, the
     label stood on the pore's name); `sub`: a small grey second line now, or '' (the mark "not named in 0610") */
  function rideTag(at, text, below = false, sub = null, bare = false) {   /* (bare: no line under it: a count names no one part) */
    const st = document.getElementById('stage'), el = R.h('span', { class: 'rtag' }); el.hidden = true; st.appendChild(el);
    const s0 = quest.session, k = mitoStepN; let on = true, shown = '';
    (function f() {
      if (!on || quest.session !== s0 || mitoStepN !== k || !el.isConnected) { el.remove(); return; }
      const t = typeof text === 'function' ? text() : text, u = t && sub ? sub() : '', p = t && at(), c = p && world.project(p);
      if (!c || !c.inFront) el.hidden = true;
      else {
        if (t + '|' + u !== shown) { shown = t + '|' + u; el.textContent = t; if (u) el.appendChild(R.h('i', { class: 'rtag__no' }, u)); }
        el.hidden = false;
        const sr = st.getBoundingClientRect(), cr = world.canvas.getBoundingClientRect(), w = el.offsetWidth, x0 = cr.left - sr.left + c.x, y0 = cr.top - sr.top + c.y;
        const x = Math.max(6, Math.min(world.size.w - (world.inset.right || 0) - w - 6, x0 - w / 2)), yw = below ? y0 + 16 : y0 - 44, y = Math.max(6, Math.min(world.size.h - (world.inset.bottom || 0) - 40, yw));
        el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`; el.style.setProperty('--stem', Math.round(Math.max(0, Math.min(w - 2, x0 - x))) + 'px');
        el.classList.toggle('rtag--below', below); el.classList.toggle('rtag--off', bare || Math.abs(y - yw) > 1);   /* (held at the picture's edge: no line, it would not end on the part) */
      }
      requestAnimationFrame(f);
    })();
    return { off: () => { on = false; el.remove(); } };
  }
  /* a door on the picture (18 Nov 2026, the Golgi's "In a micrograph"): a button that rides with a part. It is not one
     of the step's buttons (quest.hot), so a step watched again does not press it, and it opens what onPress opens */
  function rideDoor(at, text, onPress) {
    const st = document.getElementById('stage'), el = R.h('button', { type: 'button', class: 'rtag rtag--door' }); el.hidden = true; st.appendChild(el);
    el.addEventListener('click', onPress);
    const s0 = quest.session, k = mitoStepN; let on = true, shown = null;
    (function f() {
      if (!on || quest.session !== s0 || mitoStepN !== k || !el.isConnected) { el.remove(); return; }
      const t = text(), c = t && world.project(at());
      if (!c || !c.inFront) el.hidden = true;
      else {
        if (t !== shown) { shown = t; el.textContent = t; }
        el.hidden = false;
        const sr = st.getBoundingClientRect(), cr = world.canvas.getBoundingClientRect(), w = el.offsetWidth;
        el.style.transform = `translate(${Math.round(Math.max(6, Math.min(world.size.w - (world.inset.right || 0) - w - 6, cr.left - sr.left + c.x - w / 2)))}px, ${Math.round(cr.top - sr.top + c.y - 15)}px)`;
      }
      requestAnimationFrame(f);
    })();
    return { off: () => { on = false; el.remove(); } };
  }
  /* a course switched on or off, or the IB level changed, in the nucleus: the strip, the marks and the names follow */
  const nucFollow = () => requestAnimationFrame(() => {
    if (!['nucleus', 'nucleolus', 'ribosome', 'ser', 'rer', 'golgi', 'tracks', 'exit'].includes(quest.cur)) return;
    cardOff(); if (stripAgain) stripAgain();
    if (nucAgain) nucAgain();
  });
  document.addEventListener('courselv', nucFollow); document.addEventListener('iblevel', nucFollow);
  /* the names on the nucleus once it is open: the chromosomes (many are in view: plural), the nucleolus, and the envelope at the edge of the window,
     where its two membranes show (cleared when the step ends: the next step's buttons stand on the threads) */
  function insideNames() {
    nucAgain = insideNames;
    /* (chromosome 1 is gold in the world: until the pupil has found it, in the next step, it looks like the other
       threads here too. Before 28 Nov 2026 it stood in gold, the name "chromosomes" on it, just before "find
       chromosome 1": the picture inspection's independent read. A finished nucleus keeps its gold thread) */
    if (!state.done('nucleus')) chr1Mat();
    /* (with a course on, a nuclear pore is named here too, one of those seen through the opening: both courses' first
       lines speak of the pores) */
    /* (only a pore seen clear of the nucleolus and of every thread: the names' ray test lets a see-through part such as the
       nucleolus pass, and the name had pointed at a pore behind it, so at the nucleolus) */
    const cam = world.camera.position, nc = world.project(NOL()), ne = world.project(NOL().add(V(0, 0.8, 0))), nr = Math.hypot(ne.x - nc.x, ne.y - nc.y);
    const threads = W.chromosomes.flatMap(ch => [...Array(41)].map((_, i) => world.project(inN(ch.curve.getPointAt(i / 40)))));
    /* (of the far wall's pores, those most in the open first: the furthest, on the screen, from every thread) */
    const open = p => { const q = world.project(p); return q.inFront && Math.hypot(q.x - nc.x, q.y - nc.y) > nr * 1.3 ? Math.min(...threads.map(t => Math.hypot(t.x - q.x, t.y - q.y))) : 0; };
    const pores = W.pores.filter(p => p.distanceTo(cam) > N0.distanceTo(cam)).map(p => [p, open(p)]).filter(x => x[1] > 20).sort((a, b) => b[1] - a[1]).slice(0, 12).map(x => x[0]);
    quest.names.set([
      cName(nameOf('n-chr', 'chromosomes', W.chromosomes.slice(0, 12).map(ch => inN(ch.curve.getPointAt(0.5))), [N.group])),
      cName(nameOf('n-nol', 'nucleolus', world.P.nucleolus.spots, [N.group])),
      cName(Object.assign(nameOf('n-env', 'nuclear envelope:<br>two membranes', N.rimPts.filter((p, i) => i % 10 === 0).map(p => inN(p)), [N.group]), { small: '<span class="nm__t">nuclear envelope</span>' }), { ib: 'nuclear envelope:<br>a double membrane' }),
      ...(courseOn() ? [cName(nameOf('n-pore', 'nuclear pore', pores, [N.pores, N.innerEnv, N.outerEnv, N.rim]))] : [])
    ], [...HUD(), document.getElementById('qHide')].filter(Boolean));
  }
  async function enter() {
    /* the first time, the nucleus is closed: the dive through one pore (below) */
    if (!state.flag('in-nucleus')) return dive();
    nucStep();
    await fly(world.P.nucleus.view.pos, world.P.nucleus.view.at);
    const pore = W.pores.slice().sort((a, b) => a.distanceTo(world.camera.position) - b.distanceTo(world.camera.position))[0];
    const glowRing = keep(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 24), new THREE.MeshBasicMaterial({ color: 0xfff1a8 })));
    glowRing.position.copy(pore); glowRing.lookAt(N0);
    await press(() => pore.clone().add(V(0, 0.35, 0)), 'Enter through a nuclear pore', { side: 't' });
    drop(glowRing);
    const v = nucView(); await fly(v.pos, v.at, 2000);
    state.setFlag('in-nucleus');
    quest.say('You are inside the nucleus. The threads are the <b>chromosomes</b>.', 'ok');
    insideNames();
    await quest.next(); quest.names.set([]); nucAgain = null; cardOff();
  }

  /* ---------------- the dive through a nuclear pore (8 Nov 2026) ----------------
     Daniel: "the first time you go in, it needs to be closed, and you need to go through a pore and then kind of travel
     through it and then reveal what's inside … really make it nice and incredible as you dive in, and then suddenly you
     enter through the doors of a pore. That needs to be magical. And then you see the inside." Until then the nucleus is
     closed (world.js setNucleus). Pressed, the camera dives in one move, with a scale bar, to one pore (cellbuild.js: the
     door), and every pore shrinks to its true size as it comes (120 nm across; the world draws them about twice as wide):
     there the pore is the real thing (pore.js: its three rings of proteins, its filaments, the soft threads in its
     channel, the basket), in the two membranes at their true thicknesses, and the camera stops while its names are read.
     Then it goes down the middle of the pore: the soft threads bend back before it, like doors, and close behind it; it
     passes the rings and the basket and comes out inside, where it is black; a light spreads from the pore through the
     nucleus and shows, as it reaches them, the chromosomes and the nucleolus. Only then is the nucleus opened (its front
     cut away, behind the camera, where it cannot be seen), and the camera moves back through the opening until the whole
     nucleus is seen, its parts named. After that it stays open: on the map and on every later visit ('in-nucleus'). */
  const DOOR = N.door, DV = { on: false, hidden: [], open: false };
  /* how far the camera drifts round the pore at its first stop (radians); the pore is built cut on the plane at this angle
     (pore.js), so that the cut faces the camera when it then stops beside the pore */
  const PORE_TURN = 0.35;
  let PD = null;
  /* the pore, built while the pupil reads (the place's first step), its shaders compiled in parallel as the world's are
     (world.js), so that the dive never waits for them; fetched only now (it is needed once) */
  function porePrep() {
    if (PD) return PD.ready;
    PD = { ready: null };
    PD.ready = import('../world/pore.js?v=202611281626').then(async m => {
      const P = await m.buildPore({ p0: DOOR.p, n0: DOOR.n, e1: DOOR.e1, e2: DOOR.e2, R: N.r, sy: N.sy, cut: PORE_TURN });
      P.group.matrixAutoUpdate = false;
      P.group.matrix.makeBasis(DOOR.e1, DOOR.n, DOOR.e2).scale(V(0.001, 0.001, 0.001)).setPosition(DOOR.p);
      P.group.visible = false; P.npc.visible = false; N.group.add(P.group); N.group.updateMatrixWorld(true);
      if (!R.TEST) {
        /* one mesh at a time, the page drawing between (all at once had stopped it for 0.3 s); with Reduce motion too (only
           the tests skip it): there the shaders had been made at the first frame of the pore, a stop of several seconds while
           its names' pause ran out, so they showed for 0.2 s */
        const r = world.renderer, meshes = [], waits = [];
        P.group.traverse(o => { if (o.isMesh) meshes.push(o); });
        for (const o of meshes) {
          r.setRenderTarget(world.glow ? world.composer.renderTarget1 : null);
          waits.push(r.compileAsync(o, world.camera, scene).catch(() => {})); r.setRenderTarget(null);
          await new Promise(res => setTimeout(res, 0));
        }
        await Promise.race([Promise.all(waits), new Promise(res => setTimeout(res, 6000))]);
        warmDraw(P);
      }
      return Object.assign(PD, P, { M: m.NPC });
    }).catch(e => { PD = null; throw e; });                 /* fetched again next time */
    return PD.ready;
  }
  /* the pore, the inside of the nucleus and the open nucleus drawn once, out of sight, into a small picture, while the pupil
     reads: every mesh's data goes to the graphics chip now, not at a frame of the dive (9 Nov 2026, Daniel: "make sure that
     you optimize it so everything is pre-stored or buffered, so the movement of the camera is smooth"; at CPU ×6 the press,
     the moment the real pore appears and the opening of the nucleus had each stopped the picture about 0.1 s). Only with
     the glow on: its shaders are the ones compiled; nothing of this reaches the screen */
  function warmDraw(P) {
    if (!world.glow) return;
    const r = world.renderer, rt = new THREE.WebGLRenderTarget(64, 64, { type: world.composer.renderTarget1.texture.type });
    const vis = [], cull = [], show = o => { if (o) { vis.push([o, o.visible]); o.visible = true; } };
    [P.group, P.npc, N.chromatin, N.nucleolus, N.nolSpark, N.rim].forEach(show);
    P.group.traverse(o => { if (o.isMesh || o.isPoints || o.isLine) { cull.push([o, o.frustumCulled]); o.frustumCulled = false; } });
    const geo = [N.outerEnv.geometry, N.innerEnv.geometry];
    try {
      r.setRenderTarget(rt); r.render(scene, world.camera);
      N.outerEnv.geometry = N.outerEnv.userData.geo.cut; N.innerEnv.geometry = N.innerEnv.userData.geo.cut;
      r.render(scene, world.camera);
    } catch (e) { /* a picture never drawn here is drawn at its first frame, as before */ }
    N.outerEnv.geometry = geo[0]; N.innerEnv.geometry = geo[1];
    r.setRenderTarget(null); rt.dispose();
    vis.forEach(([o, v]) => { o.visible = v; }); cull.forEach(([o, c]) => { o.frustumCulled = c; });
  }
  /* the pore is kept after the dive, for ↺ the dive again, and let go when the pupil leaves the place */
  function poreFree() {
    if (PD && PD.dispose) { PD.dispose(); N.group.remove(PD.group); }
    PD = null;
  }
  /* the pore's own frame (nm, pore.js) and the world */
  const pw = (x, y, z) => PD.group.localToWorld(V(x, y, z));
  const pd = (x, y, z) => V(x, y, z).transformDirection(PD.group.matrixWorld);
  const doorDot = new THREE.Matrix4();
  /* the dive's pore among the world's pores: hidden while the real one is drawn */
  function doorShown(on) {
    const F = N.poresFront; if (!DV.m0) { DV.m0 = new THREE.Matrix4(); F.getMatrixAt(0, DV.m0); }
    F.setMatrixAt(0, on ? DV.m0 : doorDot.makeScale(0, 0, 0)); F.instanceMatrix.needsUpdate = true;
  }
  /* close in, the rest of the cell is behind the camera or hidden by the envelope: it is not drawn */
  function diveDeep(on) {
    if (on && !DV.hidden.length) Object.entries(W.groups).forEach(([k, g]) => { if (k !== 'nucleus' && g.visible) { g.visible = false; DV.hidden.push(g); } });
    else if (!on) DV.hidden.splice(0).forEach(g => { g.visible = true; });
  }
  /* the nucleus as it was before the dive (a pupil who leaves half-way): closed, every pore at the world's size, no hole */
  function diveOff() {
    if (!DV.on) return; DV.on = false;
    diveDeep(false); N.PK.uPoreK.value = 1; N.REV.uRevK.value = 0; N.REV.uRevR.value = 0; N.HOLE.uHoleR.value = 0;
    if (PD && PD.group) { PD.group.visible = false; PD.npc.visible = false; }
    DOOR.torus.visible = false;
    if (!DV.open) {
      doorShown(true); world.nucDive = false; world.nucLook();
      /* a pupil who leaves from inside the closed nucleus goes back out at once (the flight to the map would cross it) */
      const nv = world.P.nucleus.view, inside = world.camera.position.clone().sub(N0).multiply(V(1, 1 / N.sy, 1)).length() < N.r + 0.05;
      if (inside || world.camera.position.distanceTo(doorW()) < 1.2) { world.camera.position.fromArray(nv.pos); world.controls.target.fromArray(nv.at); world.camera.lookAt(world.controls.target); }
      /* left during ↺ the dive again: the nucleus open again, as the saved game says */
      if (state.flag('in-nucleus')) world.setNucleus(true);
    }
    N.nolSpark.material.uniforms.uOpacity.value = DV.spark0 != null ? DV.spark0 : N.nolSpark.material.uniforms.uOpacity.value;
    if (bar) bar.hidden = true;
    world.camera.up.set(0, 1, 0); world.nearFar(10);
  }
  const doorW = () => N.group.localToWorld(DOOR.p.clone());
  /* one move of the camera, frame by frame: f(k) sets it for k 0 … 1 (ms long; at once with ?still=1) */
  const moveCam = (ms, f) => live(new Promise(res => {
    const s0 = quest.session, t0 = performance.now();
    const step = () => {
      if (quest.session !== s0) return res();
      const k = R.FAST || !ms ? 1 : Math.min(1, (performance.now() - t0) / ms);
      f(k); world.kick();
      if (k < 1) requestAnimationFrame(step); else res();
    };
    step();
  }));
  const setCam = (pos, at, d) => { const cam = world.camera; cam.position.copy(pos); world.controls.target.copy(at); cam.lookAt(at); world.nearFar(d); scaleBar(d); };
  /* names on the pore, while the camera stops there: the pore (its cytoplasmic ring) and the net of soft protein threads
     in its channel (its line ends in the channel, between the filaments); one level line each, ending on its part; on a
     phone each stands on its part (the net beside it), never on the Hide text button. The pore's own frame: x is the
     screen's right, z its down. "Protein net", not "threads": the chromosomes are the threads of this place (the expert
     review) */
  const HUDN = () => [...HUD2(), document.getElementById('qHide')].filter(Boolean);
  const oneName = (key, html, spots, o = {}) => Object.assign({ key, free: true, html: `<span class="nm__t">${html}</span>`, spots: spots.map(p => pw(p.x, p.y, p.z)) }, o);
  function poreNames() {
    const P = PD.pts, phone = world.size.w < 640;
    /* the ring's points 50 nm from the axis, in its band of proteins (at 60 nm, its outer edge, a line had ended short of
       the ring: the expert review) */
    const ringPt = k => V(50 * Math.cos(k), 9, 50 * Math.sin(k));
    if (phone) {
      /* a phone: "nuclear pore" above the pore, its line down onto the ring; "protein net" below it, its line up across the
         ring onto the net, long enough for the name to stand clear of the ring and of the filaments that hang below it (the
         names had stood on the pore, and "protein net" read as the ring: the expert review). Which side of the ring is at
         the top of the picture depends on where the pore is on the nucleus, so the points are chosen on the screen: the
         net's lowest, and the ring's highest of those at least 26 px to the side of it (straight above, the two lines had
         met in one line through the pore); each line long enough for its name to stand clear of the whole pore */
      const Nm = quest.names, sc = v => Nm.proj(pw(v.x, v.y, v.z)), sy = v => sc(v).y, round = n => [...Array(n)].map((_, i) => i * 2 * Math.PI / n);
      const low = round(8).map(k => P.thread(k, 14)).sort((a, b) => sy(b) - sy(a)).slice(0, 3), xn = sc(low[0]).x;
      const top = round(24).map(ringPt).filter(v => Math.abs(sc(v).x - xn) >= 26).sort((a, b) => sy(a) - sy(b)).slice(0, 4);
      const edge = round(16).flatMap(k => [V(64 * Math.cos(k), 9, 64 * Math.sin(k)), V(64 * Math.cos(k), -6, 64 * Math.sin(k)), V(52 * Math.cos(k), PD.M.tips, 52 * Math.sin(k))]).map(sy);
      const above = Math.min(...edge), below = Math.max(...edge);
      const lenT = Math.max(22, Math.round(sy(top[0]) - above + 10)), len = Math.max(22, Math.round(below - sy(low[0]) + 10));
      quest.names.set([
        cName(oneName('d-pore', 'nuclear pore', top, { up: -1, len: lenT })),
        cName(oneName('d-fg', 'protein net', low, { up: 1, len }))
      ], HUDN(), lr(pw(-98, 0, 0), pw(98, 0, 0)));
      return;
    }
    const ringL = [Math.PI - 0.6, Math.PI - 0.35, Math.PI + 0.35, Math.PI + 0.6], netL = [Math.PI - 0.12, Math.PI, Math.PI + 0.12];
    quest.names.set([
      cName(oneName('d-pore', 'nuclear pore', ringL.map(ringPt))),
      cName(oneName('d-fg', 'protein net', netL.map(k => P.thread(k, 12)), { aside: true }))
    ], HUDN(), lr(pw(-98, 0, 0), pw(98, 0, 0)));
  }
  /* the envelope in section, beside the pore (the second stop): the outer membrane named from above, in the cytoplasm, the
     inner membrane from below, in the nucleus, each with one upright line that ends on its membrane, and the space between
     them named inside it: no name covers a membrane, and both membranes and the space stay seen (names.js up; the names had
     stood on the membranes, beside the pore, and hidden them). Each stands where the membranes are flat, clear of the pore
     and its filaments (more than 74 nm from the axis): on the right of the picture first (side -1), else on the left */
  const cutFrame = () => lr(pw(...PD.pts.cut(250, PD.M.mid, 1).toArray()), pw(...PD.pts.cut(250, PD.M.mid, -1).toArray()));
  function cutNames() {
    const P = PD.pts, NP = PD.M, rs = world.size.w < 640 ? [118, 106, 130, 142] : [125, 150, 175, 100];
    const on = h => [-1, 1].flatMap(side => rs.map(r => P.cut(r, h, side)));
    /* (with IB on, each membrane is named as a part of the double membrane: A2.2.6, the place's first IB line; "of the",
       never "double membrane: outer membrane", which reads as if each were a double membrane: the science read) */
    quest.names.set([
      cName(oneName('d-om', 'outer membrane', on(NP.out - NP.mem / 2), { up: -1 }), { ib: 'outer membrane of<br>the double membrane' }),
      cName(oneName('d-gap', 'space between the membranes', on(NP.mid), { small: '<span class="nm__t">space between<br>the membranes</span>', cls: 'nm--in' })),
      cName(oneName('d-im', 'inner membrane', on(NP.in + NP.mem / 2), { up: 1 }), { ib: 'inner membrane of<br>the double membrane' })
    ], HUDN(), cutFrame());
  }
  /* again: ↺ the dive again (Daniel, 9 Nov 2026: "once you have seen the animation, there's no way to re-see the
     animation … a little button to re-enter into the nucleus with the same animation"), right after the dive (beside Next)
     or from the place's end card: the nucleus closed again, the same dive from the nucleus's view without the press, and
     open again at the end; the saved game is unchanged */
  async function dive(again = false) {
    nucStep();
    if (again) { world.setNucleus(false); doorShown(true); quest.names.set([]); }
    await fly(world.P.nucleus.view.pos, world.P.nucleus.view.at);
    const ready = porePrep();
    const P0 = doorW();
    if (!again) {
    const glowRing = keep(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 24), new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true })));
    glowRing.position.copy(P0); glowRing.lookAt(P0.clone().add(DOOR.n));
    await press(() => P0.clone().add(V(0, 0.35, 0)), 'Enter through a nuclear pore', { side: 't' });
    /* the ring that marked the pore fades (it had gone in one frame) */
    { const t0 = performance.now(); W.anim.push(function f() { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 350); glowRing.material.opacity = 1 - k; if (k >= 1) { W.anim.splice(W.anim.indexOf(f), 1); drop(glowRing); } }); }
    /* the pore is usually ready long before the press; if not, the wait is said only after 0.4 s */
    }
    const slow = setTimeout(() => quest.say('Getting the nuclear pore ready…'), R.FAST ? 1e9 : 400);
    /* the pore could not be fetched (no connection): the pupil goes in as on a later visit, never stuck */
    let got = null; try { got = await live(ready); } catch (e) { if (e === STALE) throw e; }
    clearTimeout(slow); quest.say('');
    if (!got) {
      world.setNucleus(true); state.setFlag('in-nucleus');
      const v = nucView(); await fly(v.pos, v.at, 2000);
      if (again) { insideNames(); return; }
      quest.say('You are inside the nucleus. The threads are the <b>chromosomes</b>.', 'ok');
      insideNames(); await quest.next(); quest.names.set([]); nucAgain = null; cardOff(); return;
    }
    const cam = world.camera, c = world.controls, NP = PD.M, TRUEK = 0.513, T0 = DOOR.torus;
    DV.on = true; DV.open = false; DV.hidden = [];
    world.flying = true; c.enabled = false; world.setMoving(true); quest.names.set([]);
    /* the inside is drawn from now on, black until the light reaches it (looking into the pore shows only the pore); the
       hole opens, filled by the pore's own patch */
    world.nucDive = true; world.nucLook();
    N.REV.uRevK.value = 1; N.REV.uRevR.value = 0;
    /* the nucleolus wakes once the pupil is in: its sleeping look (a grey mist round it) is not drawn in here (looks() in
       main.js sets it from the saved game when the place ends) */
    world.setPlace('nucleolus', 'open', { instant: true });
    N.HOLE.uHoleP.value.copy(DOOR.p); N.HOLE.uHoleN.value.copy(DOOR.n); N.HOLE.uHoleR.value = NP.patch / 1000;
    /* the world's ring of this pore (a see-through copy of it) stays until the real pore, the same size, is big enough to be
       read (about 40 pixels), then fades over it (the expert review: a dull speck had replaced the pore just chosen) */
    doorShown(false); T0.visible = true; T0.material.opacity = 1;
    PD.group.visible = true; PD.npc.visible = false; PD.npc.scale.setScalar(1 / TRUEK); PD.glow(1); PD.setLid(0);
    /* for tools/pore-dive.mjs: how much of the near half is taken away, and the near side's direction */
    DOOR.lid = PD.lid; DOOR.nearW = pd(PD.nearDir.x, PD.nearDir.y, PD.nearDir.z);
    DOOR.cutPt = (r, h, side) => pw(...PD.pts.cut(r, h, side).toArray());   /* a point of the cut, in the world (the tool checks that no name covers a membrane) */
    const spark = N.nolSpark.material.uniforms.uOpacity; DV.spark0 = DV.spark0 != null ? DV.spark0 : spark.value; spark.value = 0;
    PD.sway.forEach(u => { u.uOpen.value = 0; u.uCamY.value = 400; });
    /* 1. the dive to the pore: the distance falls by the same factor each moment (camGo), every pore shrinks to its true
       size (0.513 of the world's; the real pore with them), and the real pore's colours deepen as it comes close */
    const at0 = c.target.clone(), off0 = cam.position.clone().sub(at0), d0 = off0.length(), dir0 = off0.normalize();
    const AL = 0.5, LH = 480;         /* the stop: 480 nm from the pore, 29° from its axis (room for its names) */
    const PHI = PORE_TURN, turn = (p, f) => [p[0] * Math.cos(f) - p[2] * Math.sin(f), p[1], p[0] * Math.sin(f) + p[2] * Math.cos(f)];
    const phone = world.size.w < 640, D2 = phone ? 330 : 400, C1y = -10, C2y = NP.mid, Y0 = 70;
    const nW = pd(0, 1, 0), worldUp = V(0, 1, 0);
    /* a place round the pore: th from its axis, r from the point (0, cy, 0) on it, on the camera's side turned by f; and the
       camera's up there (beside the pore the axis then points up the picture) */
    const orbit = (th, r, cy, f) => {
      const side = turn([0, 0, -1], f), c = Math.cos(th), s = Math.sin(th);
      return { pos: turn([0, cy + r * c, -r * s], f), at: [0, cy, 0], up: nW.clone().multiplyScalar(s).addScaledVector(pd(...side), -c).normalize() };
    };
    /* on a phone the camera also moves, and the point it looks at with it, so that the names have room (nm, along the
       picture's right and up): at the first stop up, so that the pore stands lower, its names above and below it, clear of
       the buttons; beside the pore right and up, so that the pore stands on the left and the names of the section on the
       right, where the membranes are flat. The first along the picture's up there (the world's up), the second along the
       pore's axis (the picture's up beside the pore) */
    const PAN1 = phone ? [0, 36] : [0, 0], PAN2 = phone ? [62, 30] : [0, 0];
    const panAt = (pos, at, pan, up) => {
      if (!pan[0] && !pan[1]) return V(0, 0, 0);
      const v = at.clone().sub(pos).normalize(), u = up.clone().addScaledVector(v, -up.dot(v)).normalize(), rt = v.clone().cross(u).normalize();
      return rt.multiplyScalar(pan[0] / 1000).addScaledVector(u, pan[1] / 1000);
    };
    /* a view of the way round, with k1 of the first stop's move and k2 of the second's */
    const view = (th, r, cy, f, k1, k2) => {
      const o = orbit(th, r, cy, f), P = pw(...o.pos), A = pw(...o.at), off = V(0, 0, 0);
      if (k1) off.addScaledVector(panAt(P, A, PAN1, worldUp), k1);
      if (k2) off.addScaledVector(panAt(P, A, PAN2, o.up), k2);
      return { P: P.add(off), A: A.add(off), up: o.up };
    };
    const atH = view(AL, LH, C1y, 0, 1, 0).A, dirH = pd(0, Math.cos(AL), -Math.sin(AL)), dH = LH / 1000;
    await moveCam(4600, k => {
      const e = k * k * (3 - 2 * k), d = d0 * Math.pow(dH / d0, e), g = (d0 - d) / (d0 - dH);
      const pk = 1 - (1 - TRUEK) * smooth(0.04, 0.55, e); N.PK.uPoreK.value = pk; PD.npc.scale.setScalar(pk / TRUEK);
      PD.npc.visible = d < 3.3; T0.material.opacity = smooth(2.3, 3.1, d); T0.visible = T0.material.opacity > 0.004;
      if (d < 0.6) diveDeep(true);
      PD.glow(smooth(1.0, 3.0, d));
      setCam(at0.clone().lerp(atH, g).addScaledVector(dir0.clone().lerp(dirH, smooth(0, 0.8, e)).normalize(), d), at0.clone().lerp(atH, g), d);
    });
    T0.visible = false; PD.npc.visible = true; PD.npc.scale.setScalar(1); N.PK.uPoreK.value = TRUEK; diveDeep(true); PD.glow(0);
    /* 2. it stops: the pore and the net of protein threads in its middle are named, and stay while the names are read
       (memory animations-wait-for-the-reader: 0.5 s, 0.3 s for each other name, 1 s for every 4 words), the camera
       drifting round the pore (PORE_TURN, 20°), so that it is seen in depth: the filaments reach out */
    world.setMoving(false); poreNames();
    await moveCam(R.FAST ? 0 : 3600, k => { const v = view(AL, LH, C1y, PHI * smooth(0, 1, k), 1, 0); setCam(v.P, v.A, LH / 1000); });
    if (R.CALM) await wait(3600);          /* Reduce motion: no drift, but the names stay as long */
    /* the names go where they are (their frame kept: without it they had slid to the picture's edges) */
    quest.names.set([], HUDN(), lr(pw(-98, 0, 0), pw(98, 0, 0))); world.setMoving(true);
    /* 3. beside it, the envelope in section (Daniel, 8 Nov 2026: "you clearly see that there is a space between the inner
       membrane and the outer membrane … think how to do that properly. And take your time"): the camera goes slowly round
       and down to the side of the pore, level with the middle of the envelope, while the near half of the pore (pore.js: the
       lid) is taken away. Then the cut, which faces it, shows the outer membrane, the space between the two membranes and
       the inner membrane, each membrane two rows of lipids, the two joined round the pore; they are named and stay while they
       are read. On the way round the picture turns, so that at the side the cytoplasm is at the top and the nucleus at the
       bottom, as a textbook draws the envelope: the camera's up is then the pore's axis (its up along the way round: the way
       the camera would go next, round the pore) */
    /* the camera stops 20 nm above the outer membrane, looking a little down into the cut: the space between the membranes
       then shows its floor (level with the envelope's middle it had looked along the space, past the patch, onto the
       world's envelope seen from inside, black until the light), and it never goes into the nucleus beside the pore */
    const TH2 = Math.acos((20 - C2y) / D2);
    await moveCam(R.FAST ? 0 : 4400, k => {
      const e = k * k * (3 - 2 * k), r = LH + (D2 - LH) * e, v = view(AL + (TH2 - AL) * e, r, C1y + (C2y - C1y) * e, PHI, 1 - e, e);
      cam.up.copy(worldUp).lerp(v.up, smooth(0, 0.45, k)).normalize();
      setCam(v.P, v.A, r / 1000);
      PD.setLid(smooth(0.3, 0.75, k));
    });
    PD.setLid(1);
    world.setMoving(false); cutNames();
    const PHI2 = 0.12;          /* while the names are read the camera drifts a little further round: the cut seen in depth */
    await moveCam(R.FAST ? 0 : 6400, k => { const v = view(TH2, D2, C2y, PHI + PHI2 * smooth(0, 1, k), 0, 1); cam.up.copy(v.up); setCam(v.P, v.A, D2 / 1000); });
    if (R.CALM) await wait(6400);
    quest.names.set([], HUDN(), cutFrame()); world.setMoving(true);
    /* 4. the nucleus whole again first: beside the pore the camera moves a little back and up while the near half comes
       back, so that the cut is covered again before the camera goes over the pore (Daniel, 9 Nov 2026: "make sure that
       transition is smooth by basically covering again the nucleus and then getting again inside the hole") */
    const F2 = PHI + PHI2, D3 = D2 * 1.12, TH3 = TH2 - 0.1;
    await moveCam(R.FAST ? 0 : 2400, k => {
      const e = k * k * (3 - 2 * k), r = D2 + (D3 - D2) * e, v = view(TH2 + (TH3 - TH2) * e, r, C2y, F2, 0, 1);
      cam.up.copy(v.up); setCam(v.P, v.A, r / 1000);
      PD.setLid(1 - smooth(0.05, 0.85, k));
    });
    PD.setLid(0);
    /* then over the pore onto its axis, looking down its middle */
    await moveCam(R.FAST ? 0 : 3400, k => {
      const e = k * k * (3 - 2 * k), r = D3 + (Y0 - C2y - D3) * e, v = view(TH3 * (1 - e), r, C2y, F2, 0, 1 - e);
      cam.up.copy(v.up); setCam(v.P, v.A, r / 1000);
    });
    const downUp = orbit(0, 1, C2y, F2).up;          /* the camera's up while it looks down the axis */
    /* 5. through: down the middle of the pore, slowly through its protein net (Daniel: "The speed as you go through the pore
       should be nice and slow, beautiful"), whose soft threads bend back before the camera and close behind it; then, once
       past the net, quickly through the rest of the channel, the basket and past its small ring (Daniel, 9 Nov 2026: it had
       spent "too much time going through the hole at the end"), into the nucleus, where it is black. It looks down the
       axis, L nm ahead: the envelope's middle from above the pore, 45 nm ahead in it, and past the basket 1.2 µm deep, where
       the inside is. About 3 s above the pore, 3.6 s through the net (y 10 to -45: its threads part only just ahead of
       the camera, pore.js swaying, so that the net fills the view until the camera reaches it; parting 22 nm ahead, they had
       opened a clear tunnel, and the basket's ring had filled the view for seconds), then 1 s to the channel's end, through
       the basket and past its ring */
    const Y1 = -150, Lof = y => 45 + (Y0 - C2y - 45) * smooth(10, Y0, y) + 1155 * smooth(-140, Y1, y);
    const NS = 400, ys = [], ts = [0];
    for (let i = 0; i <= NS; i++) ys.push(Y0 + (Y1 - Y0) * i / NS);
    const pace = y => (0.3 + 0.7 * smooth(Y0, Y0 - 35, y) * smooth(Y1, Y1 + 16, y)) * (1 - 0.65 * Math.exp(-Math.pow((y + 15) / 26, 2))) * (1 + 3 * smooth(-40, -54, y));
    for (let i = 1; i <= NS; i++) ts.push(ts[i - 1] + Math.abs(ys[i] - ys[i - 1]) / pace((ys[i] + ys[i - 1]) / 2));
    const T = ts[NS], yAt = k => { const t = k * T; let i = 1; while (i < NS && ts[i] < t) i++; const f = (t - ts[i - 1]) / Math.max(1e-9, ts[i] - ts[i - 1]); return ys[i - 1] + (ys[i] - ys[i - 1]) * f; };
    await moveCam(R.FAST ? 0 : 7600, k => {
      const y = yAt(k), L = Lof(y);
      PD.sway.forEach(u => { u.uCamY.value = y; u.uOpen.value = smooth(170, 70, y); });
      cam.up.copy(downUp); setCam(pw(0, y, 0), pw(0, y - L, 0), L / 1000);
      /* inside the pore no scale bar: it measures L nm ahead, and the rings close by read wrong against it (the expert review) */
      if (bar) bar.hidden = y < 12;
    });
    /* 6. in the dark, out of the basket, the camera turns to look the way the whole nucleus will be seen, upright, before
       anything is lit (Daniel, 9 Nov 2026: "things appear, but the camera twists … things do not appear cleanly": it had
       turned while the inside appeared). The pore is put away first and the hole it filled closed (both behind the camera):
       through the hole, the turn had shown shapes outside the nucleus, dimly */
    PD.group.visible = false; N.HOLE.uHoleR.value = 0; doorShown(true);
    const v = nucView(), P1 = cam.position.clone(), dirF = v.at.clone().sub(v.pos).normalize(), d2 = v.pos.distanceTo(v.at);
    const qa = cam.quaternion.clone(), qb = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(P1, P1.clone().add(dirF), V(0, 1, 0)));
    const fwd = new THREE.Vector3(), upv = new THREE.Vector3(), q = new THREE.Quaternion();
    await moveCam(R.FAST ? 0 : 500, k => {
      q.copy(qa).slerp(qb, k * k * (3 - 2 * k)); fwd.set(0, 0, -1).applyQuaternion(q); upv.set(0, 1, 0).applyQuaternion(q);
      cam.up.copy(upv); setCam(P1, P1.clone().addScaledVector(fwd, 1.2), 1.2); if (bar) bar.hidden = true;
    });
    cam.up.set(0, 1, 0);
    /* then the nucleus is opened behind the camera (nothing of the opening can be seen from here), every pore grows back to
       the world's size, and a light spreads from the pore through the nucleus, about 1 µm a second, then faster: the
       threads near the camera light first, the nucleolus over about a second (the expert review: it had flashed, a large
       cream shape, in 4 frames). Meanwhile the camera moves straight back, without turning, out through the opening until
       the whole nucleus is seen */
    DV.open = true;
    world.nucDive = false; world.setNucleus(true); state.setFlag('in-nucleus');
    const C = pw(0, -150, 0), nolD = C.distanceTo(inN(N.nucleolus.position)), lt0 = performance.now();
    const lightR = () => R.FAST ? 8 : (t => 0.55 * smooth(0, 0.25, t) + 1.1 * t + 0.15 * t * t)((performance.now() - lt0) / 1000);
    N.REV.uRevC.value.copy(C); sound.wake();
    let lr0 = 0;
    await moveCam(4800, k => {
      /* slow at first, while the light shows what is near; then out to the whole view */
      const e = k * k * k * (k * (6 * k - 15) + 10), pos = P1.clone().lerp(v.pos, e), dn = 1.2 + (d2 - 1.2) * e;
      N.PK.uPoreK.value = TRUEK + (1 - TRUEK) * smooth(0.1, 0.9, e);
      lr0 = Math.max(lr0, lightR(), k >= 1 ? 8 : 0); N.REV.uRevR.value = lr0;
      spark.value = DV.spark0 * smooth(nolD - 0.3, nolD + 0.6, lr0);
      setCam(pos, pos.clone().addScaledVector(dirF, dn), dn); if (bar) bar.hidden = true;
      /* the rest of the cell comes back once the camera is out of the nucleus (the cytosol's lights are not drawn inside it) */
      if (DV.hidden.length && cam.position.clone().sub(N0).multiply(V(1, 1 / N.sy, 1)).length() > N.r + 0.02) diveDeep(false);
    });
    setCam(v.pos, v.at, d2);
    diveDeep(false); cam.up.set(0, 1, 0);
    N.PK.uPoreK.value = 1; N.REV.uRevK.value = 0; spark.value = DV.spark0; if (bar) bar.hidden = true;
    DV.on = false;
    await live(world.landed({ pos: cam.position.toArray(), at: c.target.toArray() }, false));
    /* (said again when the step is watched again by its ↻, not when ↺ Watch the dive again replays it under its own line) */
    const ENTERED = '<p>You entered the nucleus through a <b>nuclear pore</b>.</p><p>A pore is about 120&nbsp;nanometres (nm) across. If the cell were a football pitch, a pore would be nearly as wide as a door.</p><ul><li>Small molecules pass freely through the protein net in a pore.</li><li>A large molecule passes only if a special protein takes it through.</li></ul><p>Now the front of the nucleus is removed, so that you can see inside: the threads are the <b>chromosomes</b>.</p><p class="say__aside">The game draws the pores and the chromosomes larger than they are.</p>';
    if (again) { insideNames(); if (quest.watching) quest.say(ENTERED, 'ok'); return; }
    quest.say(ENTERED, 'ok');
    insideNames();
    /* Next, or ↺ the dive again (as often as wanted; the message stays) */
    for (;;) {
      const nx = quest.next(), ab = R.h('button', { type: 'button', class: 'btn ghost again' }, '↺ Watch the dive again');
      quest.step.do.appendChild(ab);
      const pick = await live(Promise.race([nx.then(() => 'next'), new Promise(r => ab.addEventListener('click', () => r('again'), { once: true }))]));
      ab.remove();
      if (pick === 'next') break;
      const nb = quest.step.do.querySelector('.btn.next'); if (nb) nb.remove();
      cardOff();
      await dive(true);
    }
    quest.names.set([]); nucAgain = null; cardOff();
  }
  /* ↺ the dive again from the nucleus's end card (quest.js): only in the nucleus, once the pupil has been in, and not while
     a dive plays */
  document.addEventListener('dive-again', e => {
    const b = e.detail && e.detail.btn;
    if (quest.cur !== 'nucleus' || DV.on || !state.flag('in-nucleus')) return;
    if (b) b.disabled = true;
    /* on a phone the end card is below the picture: the picture first comes into view */
    const st = document.getElementById('stage'); if (st && st.getBoundingClientRect().top < 0) st.scrollIntoView({ block: 'start', behavior: R.FAST ? 'auto' : 'smooth' });
    dive(true).catch(err => { if (err !== STALE) throw err; }).finally(() => { if (b) b.disabled = false; });
  });
  function chr1Mat() { const m = W.chromosomes[0].mesh.material; if (!props.chrDim) { props.chrDim = m.color.getHex(); m.color.setHex(0xb9a6ff); m.emissive.setHex(0x2a1f6a); } return m; }
  /* a thread pressed lights up along its whole length (Daniel, 9 Nov 2026: "As you click on the different chromosomes,
     it'd be nice if you could lit up the different chromosomes, so they actually, the students understand what a
     chromosome is … they're just clicking a label. They don't actually see what a chromosome is, and the idea is to see
     that the long tubes are the chromosomes"): a glowing sleeve, a little wider than the thread, grows along it from one
     end to the other at the same speed on every thread (so the longest takes longest), the light running round all its
     coils; it stays lit while its name is read, brighter than white (so that it glows), and the other threads are dimmed
     meanwhile, so that it stands out whole. Drawn after the see-through parts of the nucleus (renderOrder, as the copy's
     ribbon), its mesh built in the world's frame */
  let chrSaved = null;                                 /* the dimmed threads' own colours, put back by chrUndim (and reset) */
  function chrUndim() { if (!chrSaved) return; chrSaved.forEach(([m, c, e]) => { m.color.copy(c); m.emissiveIntensity = e; }); chrSaved = null; }
  function chrDim(except) {
    chrUndim();
    chrSaved = W.chromosomes.filter(c => c !== except).map(c => { const m = c.mesh.material; return [m, m.color.clone(), m.emissiveIntensity]; });
    chrSaved.forEach(([m]) => { m.color.multiplyScalar(0.45); m.emissiveIntensity *= 0.4; });
  }
  function lightThread(ch, color, glow) {
    const n = ch.curve.points.length, pts = [];
    for (let i = 0; i <= n * 2; i++) pts.push(inN(ch.curve.getPointAt(i / (n * 2))));
    const segs = n * 3, geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segs, ch.mesh.geometry.parameters.radius * 1.4, 8, false);
    const m = keep(new THREE.Mesh(geo, magicStandard({ color, emissive: color, emissiveIntensity: glow, roughness: 0.35, transparent: true, opacity: 1 }, { rim: 0xe8fbff, rimK: 0.45 })));
    m.renderOrder = 6; m.name = 'lit-chr' + ch.n;
    chrDim(ch);
    const per = 8 * 6, ms = n * 11, t0 = performance.now();
    geo.setDrawRange(0, 0);
    m.userData.done = live(new Promise(res => {
      const f = () => {
        if (!m.parent) return res();
        const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms);
        geo.setDrawRange(0, Math.round(segs * k) * per); world.kick();
        if (k < 1) requestAnimationFrame(f); else res();
      };
      f();
    }));
    return m;
  }
  const unlight = m => { if (!m) return; drop(m); m.geometry.dispose(); m.material.dispose(); chrUndim(); };
  async function findchr() {
    const v = nucView(); if (world.camera.position.distanceTo(v.pos) > 0.5) await fly(v.pos, v.at);
    chr1Mat();
    /* the threads with a button: chromosome 1 and the four seen best from the nucleus's view, spread round the picture
       (measured at a laptop, a large screen and a phone, the same: of each thread's length, the part in the picture and in
       front of the nucleolus and of every other thread, 0: 88 %, 2: 93-96 %, 9: 83-99 %, 12: 93 %, 8: 79 %; the threads
       pressed before, 3, 6, 9 and 12, had been 64 %, 28 %, 99 % and 93 %, so that two of them, lit, hardly showed) */
    const picks = [0, 2, 9, 12, 8].map(i => W.chromosomes[i]).filter(Boolean);
    const OTHER = [7, 14, 21, 11];                     /* each other chromosome shown has its own number */
    nucStep(); pairLit = []; cycAt = 'i'; nucStrip('pairs'); await nucLift();
    let lit = null, named = null;                      /* the thread lit now and its button: one at a time (the one before
                                                          goes dark and its name goes, so the buttons left are those not
                                                          yet tried, and no name stands on a lit thread) */
    const s0 = quest.session;
    await new Promise(done => {
      picks.forEach((ch, pi) => {
        const at = () => inN(ch.curve.getPointAt(0.5)).add(V(0, 0.18, 0));
        const b = quest.hot(at, '?', { cls: 'q3', aria: 'a chromosome', right: ch.n === 1 });
        b.done.then(async () => {
          if (quest.session !== s0) return;
          unlight(lit); lit = null;
          if (ch.n === 1) {
            quest.clearHots();
            if (!pairLit.includes(1)) pairLit.push(1); pairPaint();
            quest.say('This whole thread is <b>chromosome 1</b>: the largest kind of chromosome. (There are two of each kind: one from each parent.)', 'ok');
            /* the light runs along it in gold; then the thread itself is gold and the light fades from it */
            const m = lightThread(ch, 0xffc04a, 0.22);
            try { await m.userData.done; } catch (e) { return; }
            ch.mesh.material.color.setHex(0xffcf6b); ch.mesh.material.emissive.setHex(0x7a4a00);
            burst(scene, inN(ch.curve.getPointAt(0.5)), { n: 40, r: 0.5 });
            const t0 = performance.now();
            W.anim.push(function f() { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 700); m.material.opacity = 1 - k; if (k >= 1 || !m.parent) { W.anim.splice(W.anim.indexOf(f), 1); unlight(m); } });
            done();
          } else {
            const k = OTHER[(pi - 1) % OTHER.length];
            if (!pairLit.includes(k)) pairLit.push(k); pairPaint();
            if (named) named.remove();
            b.el.querySelector('span').textContent = 'chromosome ' + k; b.el.disabled = true; b.el.classList.add('no');
            quest.say(`This whole thread is chromosome ${k}. Find chromosome 1, the largest kind.`);
            lit = lightThread(ch, 0x10b8ff, 0.5); named = b;
            /* its name moves above the thread, so that it covers none of it; below it when the space above is under the box
               at the top left (on a phone a thread near the top of the picture had been hidden by the box and its name) */
            const P = ch.curve.points, above = inN(P.reduce((a, p) => p.y > a.y ? p : a)).add(V(0, 0.3, 0)), below = inN(P.reduce((a, p) => p.y < a.y ? p : a)).add(V(0, -0.3, 0));
            const cr = world.canvas.getBoundingClientRect(), sa = world.project(above), ax = cr.left + sa.x, ay = cr.top + sa.y;
            const boxed = HUD2().some(e => { const r = e.getBoundingClientRect(); return r.width > 0 && ax > r.left - 60 && ax < r.right + 60 && ay > r.top - 30 && ay < r.bottom + 40; });
            const spot = boxed ? below : above;
            b.at = () => spot;
          }
        });
      });
    });
    /* with a course on: chromosome 1 named with the course's word, a button (its card: 17.1.1; A1.2.1), and the step
       waits while its line is read */
    if (courseOn()) { chr1Name(); await quest.next(); quest.names.set([], HUD2()); nucAgain = null; cardOff(); }
  }
  function chr1Name() {
    nucAgain = chr1Name; const ch = W.chromosomes[0];
    quest.names.set(courseOn() ? [cName({ key: 'c-chr1', free: true, aside: true, html: '<span class="nm__t">chromosome 1</span>', spots: [0.3, 0.7, 0.15, 0.85, 0.5].map(t => inN(ch.curve.getPointAt(t))) },
      { igcse: 'chromosome 1:<br>made of DNA', ib: 'chromosome 1:<br>its DNA is the<br>genetic material' })] : [], HUD2());
  }
  /* ---- chromosome 1 packs into an X, and loosens again (12 Nov 2026) ----
     Daniel, of the film "From DNA to protein - 3D", which shows a chromosome first as an X: "the way it shows initially
     the chromosomes is not the best way. But then … you could have a chromosome all uncondensed and then condense it".
     The thread stays the true picture of this cell, which is not dividing. One beat, which the pupil starts, shows what
     the X of the books is: Second thread → a second, identical thread grows along the first (a cell makes one for every
     chromosome before it divides; never called "a copy" here: that is the game's word for mRNA); Pack → the two each
     wind up tightly, side by side, joined in the middle (chromosome 1's centromere is near its middle): the X, with a
     scale bar; Loosen → both unwind, and the second thread goes from the picture little by little (a cell never
     un-makes it: the words say that the picture showed a cell that is going to divide, and that this cell is not).
     What is true and what is drawn: the two packed copies together are 0.9 µm wide here (measured: 1.15 ± 0.12 µm for
     the paired sister chromatids of human metaphase chromosomes, Booth et al. 2016, Molecular Cell 64:790); they are
     drawn shorter than they are (1.7 µm; the same paper's volumes give chromosome 1 several micrometres, longer than
     this nucleus is wide: a dividing cell has no envelope round its chromosomes), and the words say so. It is the
     game's own thread (drawn thicker than it is, as the page says) that winds up: the same tube, bead for bead, so
     nothing goes or comes in one frame; the world's thread is hidden while its moving copy stands exactly on it.
     Proof: tools/pack-check.mjs */
  class Poly extends THREE.Curve {
    constructor(P) { super(); this.P = P; }
    getPoint(t, out = new THREE.Vector3()) { const x = Math.max(0, Math.min(1, t)) * (this.P.length - 1), i = Math.min(this.P.length - 2, Math.floor(x)); return out.lerpVectors(this.P[i], this.P[i + 1], x - i); }
    getPointAt(u, out) { return this.getPoint(u, out); }
    getTangentAt(u, out = new THREE.Vector3()) { const x = Math.max(0, Math.min(1, u)) * (this.P.length - 1), i = Math.min(this.P.length - 2, Math.floor(x)); return out.subVectors(this.P[i + 1], this.P[i]).normalize(); }
  }
  const PACK = { L: 1.7, RHO: 0.16, TURNS: 14, GAP: 0.215, BOW: 0.32, R: 0.05, N: 560 };   /* (µm; 14 turns 0.12 µm apart: the turns of the 0.1 µm tube almost touch, so each packed copy is a solid rod 0.42 µm wide, and the two side by side 0.9 µm) */
  function packParts() {
    if (props.pack) return props.pack;
    const ch = W.chromosomes[0], v = nucView(), z = v.pos.clone().sub(v.at).normalize(), x = new THREE.Vector3().crossVectors(V(0, 1, 0), z).normalize(), y = new THREE.Vector3().crossVectors(z, x);
    /* where the X stands: in front of the threads, in the middle of the nucleus's view */
    /* (in front of the nucleolus and of every thread, 1.75 µm nearer than the middle of the nucleus, a little to the left of
       the middle and below it, clear of the corner box; on a phone, whose picture is narrow, in the middle) */
    /* (a phone's free picture is small: there the X stands in the middle, a little lower) */
    const C = v.at.clone().addScaledVector(z, 1.75).addScaledVector(x, PHONE() ? -0.07 : -0.5).addScaledVector(y, PHONE() ? -0.42 : -0.4);
    const thread = [], side = [], X = [[], []];
    for (let i = 0; i <= PACK.N; i++) {
      const t = i / PACK.N, p = inN(ch.curve.getPointAt(t)), q = inN(ch.curve.getPointAt(Math.min(1, t + 0.002))), tan = q.sub(p).normalize();
      thread.push(p);
      /* the copy lies beside the thread, touching it (0.1 µm to its side) */
      const o = new THREE.Vector3().crossVectors(tan, z); if (o.lengthSq() < 0.01) o.copy(x); side.push(p.clone().addScaledVector(o.normalize(), 2 * PACK.R));
      /* packed: wound round a line, the two lines side by side, touching in the middle and a little apart at the ends */
      const a = (t - 0.5) * PACK.L, bow = PACK.GAP + PACK.BOW * Math.pow(Math.abs(2 * t - 1), 1.6), ph = t * PACK.TURNS * 2 * Math.PI;
      [-1, 1].forEach((k, j) => X[j].push(C.clone().addScaledVector(y, a).addScaledVector(x, k * bow + PACK.RHO * Math.cos(ph) * k).addScaledVector(z, PACK.RHO * Math.sin(ph))));
    }
    const mat = c => magicStandard({ color: c, emissive: c === 0xffcf6b ? 0x7a4a00 : 0x8a6a30, emissiveIntensity: 0.5, roughness: 0.45 }, { rim: 0xffe9b0, rimK: 0.6 });
    const tube = (c, name) => { const m = keep(new THREE.Mesh(new THREE.BufferGeometry(), mat(c))); m.renderOrder = 6; m.name = name; m.userData.kind = name; m.visible = false; return m; };
    return (props.pack = { ch, C, x, y, z, thread, side, X, a: tube(0xffcf6b, 'chr1-thread'), b: tube(0xfff3d2, 'chr1-copy'), e: 0, grown: 0,
      /* (and the nucleolus with its sparkles, 17 Nov 2026: "Only chromosome 1 is shown"; the X's second thread had stood on it,
         cream on pink, hard to see; in a cell that divides it is gone by then) */
      others: W.chromosomes.slice(1).map(c => c.mesh).concat([N.nucleolus, N.nolSpark]), away: false });
  }
  /* drawn at e (0 the threads … 1 the X) with the copy grown to g (0 … 1 of its length) */
  function packDraw(e, g) {
    const P = packParts(), s = smooth(0, 1, e), pts = (A, B) => A.map((p, i) => p.clone().lerp(B[i], s));
    const set = (m, path, k) => { m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(new Poly(path), PACK.N, PACK.R, 6, false); m.geometry.setDrawRange(0, Math.round(PACK.N * Math.max(0, Math.min(1, k))) * 36); m.visible = k > 0; };
    set(P.a, pts(P.thread, P.X[0]), 1); set(P.b, pts(P.side, P.X[1]), g);
    P.e = e; P.grown = g; P.ch.mesh.visible = false; world.kick();
  }
  const packRun = (e0, e1, g0, g1, ms) => { const t0 = performance.now(), s0 = quest.session; return live(new Promise(res => { const f = () => { if (quest.session !== s0) return res(); const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms); packDraw(e0 + (e1 - e0) * k, g0 + (g1 - g0) * k); if (k < 1) requestAnimationFrame(f); else res(); }; f(); }), s0); };
  /* the other 13 threads go while chromosome 1 is shown alone, and come back after, by the world's dissolve (the frame
     drawn both ways and blended: world.js draw), never in one frame: with them in the picture, threads crossed in front
     of the X */
  function packOthers(away, ms = 1000) {
    const P = packParts(), show = v => P.others.forEach(o => { o.visible = v; }), s0 = quest.session;
    P.away = away;
    if (R.FAST) { world.dissolve = null; show(!away); world.kick(); return Promise.resolve(); }
    const t0 = performance.now(), D = world.dissolve = { t: 0.003, a: () => show(away), b: () => show(!away) };
    return live(new Promise(res => { const f = () => {
      if (world.dissolve !== D) return res();
      const k = (performance.now() - t0) / ms;
      if (k >= 1 || quest.session !== s0) { world.dissolve = null; show(!P.away); world.kick(); return res(); }
      D.t = Math.max(0.003, Math.min(0.997, smooth(0, 1, k))); world.kick(); requestAnimationFrame(f); }; f(); }), s0);
  }
  /* the world's own thread back (the moving copy stood exactly on it), and the other threads */
  function packOff() { const P = props.pack; W.chromosomes.forEach(c => { c.mesh.visible = true; }); if (!P) return; P.others.forEach(o => { o.visible = true; }); if (P.bar && bar) bar.hidden = true; if (world.dissolve && P.away) world.dissolve = null; [P.a, P.b].forEach(m => { drop(m); m.geometry.dispose(); m.material.dispose(); }); props.pack = null; world.kick(); }
  async function pack() {
    const v = nucView(); if (world.camera.position.distanceTo(v.pos) > 0.5) await fly(v.pos, v.at);
    chr1Mat(); W.chromosomes[0].mesh.material.color.setHex(0xffcf6b); W.chromosomes[0].mesh.material.emissive.setHex(0x7a4a00);
    const ch = W.chromosomes[0];
    nucStep(); cycAt = 'i'; nucStrip('cycle'); await nucLift();
    /* (after the expert review, 12 Nov 2026: three presses, each message shown when its press is made and kept until the
       next, never changed by a timer; "a second thread", since "copy" is the game's word for mRNA; the camera never
       moves; Loosen never un-makes the second thread: it goes as a picture goes, and the words say why) */
    quest.names.set([{ key: 'p-chr', free: true, aside: true, html: '<span class="nm__t">chromosome 1:<br>one long thread</span>', small: '<span class="nm__t">chromosome 1</span>', spots: [0.3, 0.7, 0.15, 0.85, 0.5].map(t => inN(ch.curve.getPointAt(t))) }], HUD2());
    await press(() => inN(ch.curve.getPointAt(0.5)).add(V(0, 0.3, 0)), 'Second thread', { side: 't', w: 'thread2' });
    quest.names.set([], HUD2());
    const P = packParts();
    /* 1. chromosome 1 alone; a second, identical thread grows along it */
    quest.say('<p>This picture now shows what happens in a cell that is going to divide. Only chromosome 1 is shown.</p><p>Before it divides, the cell makes a second, identical thread for every chromosome. Here the second thread of chromosome 1 grows beside the first (drawn paler).</p>');
    packDraw(0, 0); cycSet('s');
    await packOthers(true);
    /* (with a course on, the growing end of the second thread carries the course's word: 17.2.3; D2.1.5) */
    const tip = rideTag(() => P.side[Math.min(PACK.N, Math.round(P.grown * PACK.N))], lvWord('second thread', { igcse: 'exact replication', sl: 'DNA replication' }));
    await packRun(0, 0, 0, 1, 3000);
    await press(() => inN(ch.curve.getPointAt(0.5)).add(V(0, 0.3, 0)), 'Pack', { side: 't', w: 'pack' });
    tip.off();
    /* 2. each winds up tightly; they stay joined in the middle */
    quest.say('The two threads each pack tightly. They stay joined in the middle.');
    cycSet('m');
    /* (IB: the end of the first thread carries "condenses by supercoiling" while it packs: D2.1.6) */
    const tip2 = rideTag(() => P.thread[PACK.N].clone().lerp(P.X[0][PACK.N], smooth(0, 1, P.e)), lvWord('chromosome 1', { sl: 'condenses by supercoiling' }));
    await packRun(0, 1, 1, 1, 6000);
    tip2.off();
    /* (a scale bar beside the X; not on a phone, where the X needs the foot of the picture: the words give its width) */
    if (!PHONE()) { scaleBar(world.camera.position.distanceTo(P.C)); P.bar = true; }
    const at = (k, a) => P.C.clone().addScaledVector(P.y, a).addScaledVector(P.x, k * (PACK.GAP + PACK.BOW * Math.pow(Math.abs(2 * a / PACK.L), 1.6) + PACK.RHO));
    /* (with a course on, each thread is a button: IGCSE, the second thread is "made by exact replication", 17.2.3 (the science read, 17 Nov 2026:
       never "second thread: exact replication", which calls a thread a process and puts replication at the X), and the
       card adds that the copies separate, 17.2.4; IB, each is a "chromatid" (never "chromosome 1: one chromatid": after
       replication the chromosome IS the two), the two held together, D2.1.5) */
    const xNames = () => { nucAgain = xNames; quest.names.set(PHONE() ? [
      /* (a phone: no room beside the X, nor above it: one name under it, for the pair; the words say the rest) */
      cName({ key: 'p-a', free: true, html: '<span class="nm__t">the two threads</span>', spots: [P.C.clone().addScaledVector(P.y, -PACK.L / 2 + 0.05)], up: 1, len: 24 }, { ib: 'two chromatids' })
    ] : [
      /* (each name on its own side, below the corner box's height: with a spot higher up, the first thread's name went to
         the right and its line crossed the second thread) */
      cName({ key: 'p-a', free: true, aside: true, prefer: -1, html: '<span class="nm__t">chromosome 1:<br>first thread, packed</span>', small: '<span class="nm__t">first thread</span>', spots: [at(-1, -0.45), at(-1, -0.2), at(-1, -0.7)], sides: [-1, -1, -1] }, { ib: 'chromatid' }),
      cName({ key: 'p-b', free: true, aside: true, prefer: 1, html: '<span class="nm__t">second thread,<br>packed</span>', small: '<span class="nm__t">second thread</span>', spots: [at(1, 0.45), at(1, 0.2), at(1, 0.7)], sides: [1, 1, 1] }, { igcse: 'second thread:<br>made by exact<br>replication', ib: 'chromatid' }),
      cName({ key: 'p-j', free: true, html: '<span class="nm__t">joined here</span>', spots: [P.C.clone()], up: 1, len: Math.round(world.pxPerUnit(world.camera.position.distanceTo(P.C)) * (PACK.L / 2 + 0.12)) }, { ib: 'held together here' })
    ], HUD2(), lr(P.C.clone().addScaledVector(P.x, -1), P.C.clone().addScaledVector(P.x, 1)), [P.a, P.b]); };
    xNames();
    quest.say('<p>This is the X that books draw: the two identical threads of chromosome 1, each packed tightly, joined in the middle.</p><p>Packed like this, the threads do not tangle with other chromosomes, so the cell can move one of the two to each new cell.</p><p>The two together are about 1 µm wide (look at the scale bar). The picture draws them much shorter than they are: a real packed chromosome 1 is several micrometres long, longer than this nucleus is wide. The other chromosomes are not shown.</p>', 'ok');
    await press(() => P.C.clone().addScaledVector(P.x, 0.95).addScaledVector(P.y, -0.6), 'Loosen', { side: 'r' });
    quest.names.set([], HUD2()); nucAgain = null; cardOff(); if (bar) bar.hidden = true; P.bar = false;
    cycSet('n');   /* (the cell cycle's strip: nothing lit while the X loosens) */
    /* 3. back to the long thread; the second thread is not un-made: it goes from the picture little by little */
    quest.say('The picture goes back to your cell. Your cell is not dividing: it did not make a second thread, so the second thread goes from the picture.');
    await packRun(1, 0, 1, 1, 4200);
    P.b.material.transparent = true; P.b.material.depthWrite = false;
    const t0 = performance.now(), s0 = quest.session;
    await live(new Promise(res => { const f = () => { if (quest.session !== s0) return res(); const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 1800); P.b.material.opacity = 1 - smooth(0, 1, k); world.kick(); if (k < 1) requestAnimationFrame(f); else res(); }; f(); }), s0);
    await packOthers(false);
    packOff(); cycSet('i');
    quest.say('The picture is your cell again. It is not dividing: it did not make a second thread, and its 46 chromosomes stay long, thin threads. A cell reads its genes while its chromosomes are long threads.', 'ok');
    if (courseOn()) await quest.next();
  }
  function gene() {
    if (props.gene) return props.gene;
    const ch = W.chromosomes[0], pts = [];
    for (let i = 0; i <= 20; i++) pts.push(inN(ch.curve.getPointAt(0.46 + i * 0.004)));
    const curve = new THREE.CatmullRomCurve3(pts);
    const m = keep(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.075, 8, false), new THREE.MeshBasicMaterial({ color: 0xfff1a8 })));
    /* (in the cell that does not express it, findgene's switch, the gene is there and does not glow) */
    W.anim.push(function f(t) { if (!m.parent) { W.anim.splice(W.anim.indexOf(f), 1); return; } if (EXPR.off) m.material.color.setHex(0x7d6a33); else m.material.color.setHSL(0.13, 1, 0.65 + 0.2 * Math.sin(t * 4)); });
    return (props.gene = { curve, mesh: m });
  }
  /* the gene, the copy and the start of its way out are seen from inside the nucleus, as the first time (the step before
     left the camera there). Watched again, or with the pupil back from the map, these three steps began at the place's
     own view, outside the nucleus, 10 µm away where the first time it was 6.2 µm (found by tools/replay-view.mjs,
     14 Nov 2026) */
  const nucIn = async () => { const v = nucView(); if (world.camera.position.distanceTo(v.pos) > 0.5) await fly(v.pos, v.at); };
  async function findgene() {
    await nucIn();
    nucStep(); await nucLift();
    chr1Mat(); W.chromosomes[0].mesh.material.color.setHex(0xffcf6b);
    const g = gene();
    await press(() => g.curve.getPointAt(0.5).add(V(0, 0.2, 0)), 'the amylase gene', { side: 't' });
    quest.say('The amylase gene: the instructions for making amylase.', 'ok');
    /* with a course on: the gene keeps its name, a button (17.1.2; D1.2.4), and a switch beside the picture shows it in
       two cells: expressed here; there too, but not expressed, in a cell that makes no amylase (17.1.9) */
    if (courseOn()) { nucStrip('expr'); await nucLift(); await quest.next(); quest.names.set([], HUD2()); nucStep(); await nucLift(); }
  }
  function geneNames() {
    nucAgain = geneNames; const g = gene();
    /* (above the gene, one upright line down to it: on the gene, the name had hidden it, and the gene is what changes) */
    /* (in the other cell its own card, 'g-gene0': the HL line "makes it a gland cell" is about this cell only. The name
       keeps its key, so its words change in place: as a new name it never came in on a phone's still picture) */
    quest.names.set(courseOn() ? [cName({ key: 'g-gene', free: true, up: -1, html: `<span class="nm__t">amylase gene:<br>${EXPR.off ? 'not expressed' : 'expressed'}</span>`, spots: [0.5, 0.25, 0.75].map(t => g.curve.getPointAt(t)) }, { card: EXPR.off ? 'g-gene0' : 'g-gene' })] : [], HUD2());
  }
  function copyCurve() {
    const g = gene(), pts = [];
    for (let i = 0; i <= 12; i++) pts.push(g.curve.getPointAt(i / 12).add(V(0.06, 0.12, 0.08)));
    return new THREE.CatmullRomCurve3(pts);
  }
  /* the copy (mRNA) at its true thickness, about 2 nm (10 Nov 2026, round 7; before, a thread 70 nm thick, about 35 times
     too thick): from the nucleus's view far too thin to see, so a soft glow round it shows where it is, as a ribosome or a
     vesicle on its way does. Both grow together; on its way out both slide through the pore together. Proof:
     tools/true-size.mjs H */
  function copyThread(curve, segs = 160) {
    const g = new THREE.Group(); g.userData.kind = 'mrna-copy';
    const th = ribbon(curve, { radius: 0.001, segs });
    /* the glow: soft dots along the thread, in the copy's own orange (a glowing tube had looked like chromosome 1) */
    const n = segs + 1, glow = glowPoints(n, 0.42), P = glow.geometry.attributes.position, C = glow.geometry.attributes.color, v = new THREE.Vector3();
    for (let i = 0; i < n; i++) { curve.getPointAt(i / segs, v); P.setXYZ(i, v.x, v.y, v.z); C.setXYZ(i, 1, 0.5, 0.12); }
    P.needsUpdate = true; C.needsUpdate = true; glow.renderOrder = 7; glow.userData.glow = true;
    g.add(th, glow);
    const per = 8 * 6;
    g.userData.grow = k => { th.userData.grow(k); glow.geometry.setDrawRange(0, Math.round(n * Math.min(1, k))); };
    /* a stretch of the thread, in segments: from a, n long */
    g.userData.range = (a, len) => { th.geometry.setDrawRange(a * per, len * per); glow.geometry.setDrawRange(a, len + 1); };
    g.userData.grow(0);
    return g;
  }
  /* the copy: one press (Copy) and it grows along the gene; or, beyond the Year 7 list, a film of how a cell copies a
     gene, step by step, which makes the copy too (transcribe.js; Daniel, 4 Nov 2026: "keep it simple … Unless you could
     add the option") */
  async function copy() {
    await nucIn();
    nucStep(); await nucLift();
    const g = gene();
    let film = false;
    for (;;) {
      const b = quest.hot(() => g.curve.getPointAt(0.5).add(V(0, 0.3, 0)), 'Copy', { side: 'c', w: 'copy' });
      const ex = document.createElement('button'); ex.type = 'button'; ex.className = 'btn ghost explore'; ex.textContent = '🔬 Explorer: how a cell copies a gene';
      quest.step.do.appendChild(ex);
      const pick = await live(Promise.race([b.done.then(() => 'copy'), new Promise(r => ex.addEventListener('click', () => r('film'), { once: true }))]));
      b.remove(); ex.remove();
      if (quest.energy(COST.copy, 'copy')) { film = pick === 'film'; break; }
      await wait(400);
    }
    const rib = keep(copyThread(copyCurve()));
    if (film) { await live(openCopyFilm()); rib.userData.grow(1); }
    else {
      /* (with a course on, the growing end carries the course's word: 17.1.8; D1.2.1) */
      const t0 = performance.now(), cc = copyCurve(); let kNow = 0;
      const tip = rideTag(() => cc.getPointAt(kNow), lvWord('mRNA', { igcse: 'a copy of the gene', sl: 'transcription' }));
      await live(new Promise(r => { const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 2200); rib.userData.grow(k); kNow = k; if (k < 1) requestAnimationFrame(f); else r(); }; f(); }));
      if (courseOn() && !R.FAST) await wait(900);
      tip.off();
    }
    props.rib = rib;
    quest.say('The copy of the gene: <b>mRNA</b>. It is only about 2 nm thick: far too thin to see from here, so a glow shows where it is.', 'ok');
    /* with a course on: the copy and the gene named, each a button, and the step waits while its line is read */
    if (courseOn()) { copyNames(); await quest.next(); quest.names.set([], HUD2()); nucAgain = null; cardOff(); }
  }
  function copyNames() {
    nucAgain = copyNames; const g = gene(), cc = copyCurve();
    /* (the copy lies along the gene, 0.15 µm from it, the two side by side on the screen: the copy's name stands above
       the end of the copy that is higher on the screen and the gene's below the gene's lower end, each with one upright
       line; beside them or on them only one of the two had room, and it hid both) */
    const ends = c => [0.04, 0.96].map(t => c.getPointAt(t)).sort((a, b) => world.project(a).y - world.project(b).y);
    quest.names.set(courseOn() ? [
      cName({ key: 'c-mrna', free: true, up: -1, html: '<span class="nm__t">mRNA</span>', spots: [ends(cc)[0]] }, { igcse: 'mRNA:<br>a copy of the gene', ib: 'mRNA: made by<br>transcription' }),
      cName({ key: 'c-gene', free: true, up: 1, html: '<span class="nm__t">amylase gene</span>', spots: [ends(g.curve)[1]] }, { igcse: 'gene: remains<br>in the nucleus', ib: 'gene:<br>the DNA template' })
    ] : [], HUD2());
  }
  async function exportCopy() {
    await nucIn();
    nucStep(); await nucLift();
    let rib = props.rib; if (!rib) { rib = props.rib = keep(copyThread(copyCurve())); rib.userData.grow(1); }
    await quest.choose(['Through a nuclear pore', 'Straight through the two membranes of the nucleus', 'Send the DNA itself, not a copy'], 0, async (i) => {
      if (i === 1) {
        quest.say('The <b>nuclear envelope</b> is two membranes. A large molecule such as mRNA cannot pass through them: it leaves only through a <b>nuclear pore</b>.', 'no');
        const p0 = rib.position.clone(); await tween(rib, { to: p0.clone().addScaledVector(win.clone().negate(), 0.4), ms: 500 }); await tween(rib, { to: p0, ms: 400 });
      } else {
        quest.say('The <b>DNA</b> never leaves the nucleus. Only copies of its genes leave.', 'no');
        const m = W.chromosomes[0].mesh; const p0 = m.position.clone(); await tween(m, { to: p0.clone().add(V(0, 0.08, 0.06)), ms: 300 }); await tween(m, { to: p0, ms: 300 });
      }
    });
    quest.say('The copy leaves through a nuclear pore.', 'ok');
    /* the camera goes back out of the nucleus, far enough to see all of it, and the pore that the copy leaves by is ringed
       (Daniel, 4 Nov 2026: "make sure that the zoom is far away and that you actually see the … copy leave one of the
       pores"); the copy, a thread, slides along its own length to that pore, through it, and out into the cytoplasm */
    const far = world.P.nucleus.view, camAt = V(...far.pos);
    const pore = W.pores.slice().sort((a, b) => b.clone().sub(N0).normalize().dot(camAt.clone().sub(N0).normalize()) - a.clone().sub(N0).normalize().dot(camAt.clone().sub(N0).normalize()))[0];
    const out = pore.clone().sub(N0).normalize();
    /* (the ring in a colour that no pore has, and a little thicker: in the pores' own cream it had looked like every pore) */
    const ring = keep(new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.045, 8, 28), new THREE.MeshBasicMaterial({ color: 0x8ff6ff })));
    ring.position.copy(pore); ring.lookAt(pore.clone().add(out));
    await fly(far.pos, N0.clone().lerp(pore, 0.55).toArray(), 1800);
    /* the thread's way: the copy itself (its far end first), then the pore, then the cytoplasm beyond */
    const cc = copyCurve(), pts = cc.getPoints(12);
    if (pts[0].distanceTo(pore) < pts[pts.length - 1].distanceTo(pore)) pts.reverse();
    const side = new THREE.Vector3().crossVectors(out, V(0, 1, 0)).normalize();
    const way = new THREE.CatmullRomCurve3(pts.concat([pore.clone().addScaledVector(out, -0.5), pore.clone().addScaledVector(out, -0.12), pore.clone().addScaledVector(out, 0.2),
      /* (it stops 1.35 µm outside the pore, in the picture: at 2.1 µm it had gone past the picture's foot, and now it stays, named) */
      pore.clone().addScaledVector(out, 0.6).addScaledVector(side, 0.12), pore.clone().addScaledVector(out, 1.0).addScaledVector(side, 0.28), pore.clone().addScaledVector(out, 1.35).addScaledVector(side, 0.36)]));
    const SEG = 320, thread = keep(copyThread(way, SEG)), per = 8 * 6;
    const lenSegs = Math.max(6, Math.round(SEG * cc.getLength() / way.getLength()));
    drop(rib); props.rib = null;
    /* the names of this view (nothing in it had one: the places planner, 17 Nov 2026): the pore that the copy leaves by,
       for every pupil (the choice is made); once the copy is out, with a course on, the nucleus and, with IB, the
       cytoplasm, each with what the course says happens there (17.1.8; B2.2.2) */
    const g0 = gene(), farNames = arrived => { nucAgain = () => farNames(arrived); quest.names.set([
      cName(Object.assign({ key: 'x-pore', free: true, html: '<span class="nm__t">nuclear pore</span>', spots: [pore.clone()] }, PHONE() ? { up: -1, len: 30 } : {})),   /* (a phone: above the pore, or the name hid its ring) */
      ...(arrived && courseOn() ? [cName({ key: 'x-nuc', free: true, html: '<span class="nm__t">nucleus</span>', spots: [0.5, 0.2, 0.8].map(t => g0.curve.getPointAt(t)) }, { igcse: 'nucleus: the gene<br>remains here', ib: 'nucleus:<br>transcription' })] : []),
      ...(arrived && lvHere('ib') ? [cName({ key: 'x-cyt', free: true, html: '<span class="nm__t">cytoplasm</span>', spots: [way.getPointAt(1).addScaledVector(side, 0.4), way.getPointAt(0.93).addScaledVector(side, -0.4), way.getPointAt(1).addScaledVector(out, 0.25)] }, { ib: 'cytoplasm:<br>translation' })] : [])
    ], [...HUD2(), document.querySelector('#stage .rtag')].filter(Boolean)); };   /* (no name under the copy's own label) */
    farNames(false);
    /* the copy carries its name all the way, for every pupil, with the course's word (17.1.8; B2.2.2; at HL B2.2.6) */
    let headK = 0;
    const word = lvWord('mRNA', { igcse: 'moves to the cytoplasm', sl: 'to the cytoplasm, for translation', hl: 'leaves through a nuclear pore' });
    /* (once it has stopped, the label says where it is: "moves" and "leaves" were no longer true of it, the science read) */
    let outNow = false;
    const head = rideTag(() => way.getPointAt(headK), () => (outNow && courseOn() ? 'mRNA · in the cytoplasm' : !outNow && word()) || 'the copy: mRNA', true);
    const t0 = performance.now(), MS = R.FAST ? 0 : 3600;
    await live(new Promise(res => {
      const f = () => {
        const k = MS ? Math.min(1, (performance.now() - t0) / MS) : 1, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const a = Math.round(e * (SEG - lenSegs));
        thread.userData.range(a, lenSegs); headK = Math.min(1, (a + lenSegs) / SEG); world.kick && world.kick();
        if (k < 1) requestAnimationFrame(f); else res();
      };
      f();
    }));
    outNow = true;
    quest.say('The copy, mRNA, is in the cytoplasm now. The DNA stays in the nucleus.', 'ok');
    wayArrow(way, arrowR(), false);   /* (Reduce motion, a course on: the still shows the way it went) */
    farNames(true);
    /* the copy stays where it stopped, named, with the pore's ring and the names, until the pupil leaves (it had gone in
       one frame while its line was read: the places planner; with Reduce motion the still would never have shown it) */
    await quest.gain('mrna', way.getPointAt(0.97));
    await quest.next('Back to the map');
    quest.names.set([]); nucAgain = null; cardOff(); head.off();
  }

  /* ---------------- nucleolus ----------------
     True sizes (9 Nov 2026; Daniel: "these two parts are extremely huge. They are as big as chromosomes, and that's not the
     case. Ribosomes are very small. So please zoom in or do whatever you need to do to actually represent the ribosome on
     its real size"; memory true-relative-sizes): the camera zooms to the nucleolus's edge, a view about 250 nm across with
     a scale bar, and each part is built there at its true size: the small part about 25 nm across, the large part about
     30 nm (a whole ribosome is 25 to 30 nm; the small part has about a third of its mass), from a strand of RNA made here
     (2 nm thick) and proteins (about 5 nm) that came in from the cytoplasm. The two stand side by side, named, so their
     sizes compare. The chromosomes and the sparkles, drawn larger than life, are hidden while the camera is close. The
     parts are then sent off: from far away they are far too small to see, so a glow shows each one on its way to a pore */
  const NOL = () => inN(N.nucleolus.position);
  const NS = { tick: 0, close: false, f: null };
  /* the close view's frame: the point of the nucleolus's surface facing the place's view, the way out of the surface (dir),
     and two ways along it (right, up); an offset in nm. The camera looks along the surface, 18° above it, so the
     nucleolus's edge lies across the foot of the picture like a horizon, the parts just above it against the nucleus
     (looking straight at the surface, the picture had been pink from edge to edge: nowhere to see where you are); on the
     screen the way out is up and `up` is across */
  function nolFrame() {
    if (NS.f) return NS.f;
    const c = NOL(), vp = V(...world.P.nucleolus.view.pos), dir = vp.clone().sub(c).normalize();
    N.group.updateMatrixWorld(true);
    const hit = new THREE.Raycaster(vp, dir.clone().negate()).intersectObject(N.nucleolus, false)[0];
    const S = hit ? hit.point.clone() : c.clone().addScaledVector(dir, 0.75);
    const right = new THREE.Vector3().crossVectors(V(0, 1, 0), dir).normalize(), up = new THREE.Vector3().crossVectors(dir, right).normalize();
    return (NS.f = { S, dir, right, up });
  }
  const nolPt = (x, y, z) => { const f = nolFrame(); return f.S.clone().addScaledVector(f.right, x / 1000).addScaledVector(f.up, y / 1000).addScaledVector(f.dir, z / 1000); };
  /* each part's place and true size (token sizes: the small part 1.49 s wide and 0.87 s high, the large 1.96 s by 1.45 s) */
  const PART = { small: { at: () => nolPt(0, -32, 20), s: 0.0168 }, large: { at: () => nolPt(0, 32, 23), s: 0.01535 } };
  function nolBar(on) {
    if (on && !NS.tick) { const f = () => { if (!NS.tick) return; scaleBar(world.camera.position.distanceTo(world.controls.target)); NS.tick = requestAnimationFrame(f); }; NS.tick = requestAnimationFrame(f); }
    else if (!on && NS.tick) { cancelAnimationFrame(NS.tick); NS.tick = 0; if (bar) bar.hidden = true; }
  }
  /* close: what is drawn larger than life hidden, the scale bar on, the camera to the edge; far: back to the place's view */
  async function nolZoom(close) {
    if (close === NS.close) return;
    if (close) {
      /* (and every nuclear pore at its true size, 120 nm across, as in the dive: drawn twice as wide, the pores of the far
         side had stood in the picture as rings far larger than the parts) */
      /* (12 Nov 2026: all three had changed in one frame as the camera set off; now they follow the camera, as every
         handover does: the handover, far below) */
      NS.close = true; nolBar(true);
      const f = nolFrame();
      const a = THREE.MathUtils.degToRad(18), cd = f.right.clone().multiplyScalar(Math.cos(a)).addScaledVector(f.dir, Math.sin(a)).normalize();
      const moving = lodOpen({ big: [N.nolSpark], org: [N.chromatin], onU: u => { N.PK.uPoreK.value = 1 - 0.487 * smooth(0.1, 0.75, u); }, after: () => world.nucLook() }, 0.3);
      if (moving) { await lodWarm(); lodDrive(); }
      await camGo({ at: nolPt(0, 0, 32), dir: cd, up: f.dir.clone(), dist: 0.3 }, R.FAST ? 0 : 3400);
      if (moving) lodHold();
    } else {
      NS.close = false;
      lodBack(V(...world.P.nucleus.view.pos).distanceTo(V(...world.P.nucleus.view.at)));
      await camGo({ at: V(...world.P.nucleus.view.at), dir: V(...world.P.nucleus.view.pos).sub(V(...world.P.nucleus.view.at)).normalize(), up: V(0, 1, 0), dist: V(...world.P.nucleus.view.pos).distanceTo(V(...world.P.nucleus.view.at)) }, R.FAST ? 0 : 3200);
      lodEnd(); nolBar(false); N.PK.uPoreK.value = 1; world.nucLook();
    }
  }
  /* leaving the place: the chromosomes and the sparkles as the nucleus's look says, no scale bar */
  function nolOff() { if (NS.close || NS.tick) { NS.close = false; nolBar(false); N.PK.uPoreK.value = 1; world.nucLook(); } }
  /* the two parts named beside them, on level lines (never on them: their names had stood on the parts and hidden them;
     on a phone too, aside: the small part's on its left, the large part's on its right, so neither stands on the other part) */
  /* (17 Nov 2026: the pink surface is named too, "nucleolus": nothing in the close view had said what it is; and with a
     course on, play.js cName: IGCSE, the grey mark on the names 0610 does not use; IB, "small subunit" and "large
     subunit", the guide's own words (D1.2.6), each a button whose card holds "80S" (A2.2.6) and, beyond the guide, 40S,
     60S and a drawing of what S measures; the nucleolus's card, at HL D1.2.14) */
  const nolNames = () => { nucAgain = nolNames; quest.names.set(['small', 'large'].filter(k => props[k]).map(k => cName(Object.assign({ key: 'nol-' + k, free: true, html: `<span class="nm__t">${k === 'small' ? 'small part' : 'large part'}</span>`, spots: [props[k].position.clone()] },
      /* (a phone: under the small part and over the large one, each on an upright line; beside them, "small subunit: 40S"
         had stood on the large part and the large part had no name: the science read, 17 Nov 2026) */
      PHONE() ? { up: k === 'small' ? 1 : -1 } : { aside: true, prefer: k === 'small' ? -1 : 1 }), { ib: k === 'small' ? 'small subunit' : 'large subunit' }))
    .concat([cName({ key: 'nol-reg', free: true, html: '<span class="nm__t">nucleolus</span>', spots: PHONE() ? [nolPt(92, 0, 0), nolPt(92, 30, 0)] : [nolPt(50, -80, 0), nolPt(50, 80, 0), nolPt(80, 0, 0)] })]),   /* (on the surface, in the lower third of the picture: nearer the camera they were under its foot; on a phone under the strand's own label, which had stood on the name) */
    HUD(), lr(nolPt(0, -48, 20), nolPt(0, 48, 20))); };
  /* a part at its true size; its glow much less than a token's elsewhere (a bright glow spread far beyond it and made the
     large part look larger than it is), on copies of the shared materials */
  const makePart = kind => { const t = keep(token(kind, PART[kind].s)); t.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.emissiveIntensity *= 0.25; } }); t.position.copy(PART[kind].at()); t.userData.kind = kind; return (props[kind] = t); };
  async function build(kind) {
    if (!NS.close) { const v = world.P.nucleolus.view; if (world.camera.position.distanceTo(V(...v.pos)) > 0.6) await fly(v.pos, v.at); }
    await nolZoom(true);
    nucStep();
    if (kind === 'large' && !props.small) makePart('small');
    nolNames();
    const f = nolFrame(), at = PART[kind].at();
    await press(() => at.clone().addScaledVector(f.dir, 0.03), 'Build', { cost: COST.parts / 2, key: 'part-' + kind });
    /* its RNA is made here: a strand grows up out of the nucleolus and folds up where the part forms */
    const S0 = at.clone().addScaledVector(f.dir, -0.02), pts = [];
    for (let i = 0; i <= 30; i++) { const t = i / 30; pts.push(S0.clone().lerp(at, t).addScaledVector(f.up, Math.sin(t * 11) * 0.007 * (1 - t * 0.6)).addScaledVector(f.right, Math.cos(t * 8) * 0.004)); }
    const rna = keep(ribbon(new THREE.CatmullRomCurve3(pts), { color: 0xffb35c, radius: 0.0012, segs: 120 }));
    /* (17 Nov 2026, for every pupil: the strand is named from its first frame, under its foot, "RNA"; with IB at HL
       "rRNA", the word of D1.2.14; nothing in this picture had a name until the part was made) */
    const rnaTag = rideTag(() => S0, () => ibHL() ? 'rRNA' : 'RNA', true);
    const t0 = performance.now();
    await live(new Promise(r => { const g = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 1800); rna.userData.grow(k); world.kick(); if (k < 1) requestAnimationFrame(g); else r(); }; g(); }));
    /* its proteins came into the nucleus from the cytoplasm, through nuclear pores: they arrive from the two sides, from
       beyond the picture's edge, one after another (17 Nov 2026: all had appeared in one frame in mid-picture, 50 to
       110 nm away); the first is named, "protein" (at HL with the nucleus's own line, B2.2.6: proteins enter through
       the pores), once it is in the picture */
    const n = kind === 'small' ? 6 : 9, prots = [...Array(n)].map((_, i) => { const t = keep(token('protein', 0.0025)); t.position.copy(at).addScaledVector(f.up, (i % 2 ? 1 : -1) * (0.2 + 0.012 * i)).addScaledVector(f.dir, 0.05 + 0.006 * i); return t; });
    const protTag = rideTag(() => { const c = world.project(prots[0].position); return c.x > 24 && c.x < world.size.w - (world.inset.right || 0) - 24 ? prots[0].position : null; }, () => ibHL() ? 'protein · entered through a nuclear pore' : 'protein');
    await Promise.all(prots.map((t, i) => wait(R.TEST ? 0 : i * 160).then(() => tween(t, { to: at.clone().addScaledVector(f.up, Math.cos(i * 2.4) * 0.006).addScaledVector(f.dir, Math.sin(i * 2.4) * 0.004), ms: 1500 }))));
    /* together they fold into the part: the strand and the proteins are seen together, named, for a moment; then they
       turn into the part: they fade as the part comes, in one second (it had grown over them from a third of its size in
       0.7 s, and nothing showed that it is made of them; a surface that came OVER them read as a shell that holds a little
       RNA, the science read, 17 Nov 2026: a part is RNA and protein all through) */
    await wait(R.TEST ? 0 : 900);
    const part = makePart(kind), mats = [], old = []; part.traverse(o => { if (o.isMesh) mats.push(o.material); });
    mats.forEach(m => { m.transparent = true; m.opacity = 0; m.depthWrite = false; });
    [rna, ...prots].forEach(o => o.traverse(c => { if (c.isMesh) { c.material = c.material.clone(); c.material.transparent = true; old.push(c.material); } }));
    const t1 = performance.now();
    await live(new Promise(r => { const g = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t1) / 1000); mats.forEach(m => { m.opacity = k; }); old.forEach(m => { m.opacity = 1 - k; }); world.kick(); if (k < 1) requestAnimationFrame(g); else r(); }; g(); }));
    old.forEach(m => m.dispose());
    mats.forEach(m => { m.transparent = false; m.opacity = 1; m.depthWrite = true; m.needsUpdate = true; });
    rnaTag.off(); protTag.off();
    [rna, ...prots].forEach(drop);
    burst(scene, at, { n: 18, r: 0.02 });
    nolNames();
    quest.say(kind === 'small'
      ? 'The small part of a ribosome: RNA made here, and proteins made in the cytoplasm. It is about 25 nanometres (nm) across: if the cell were a football pitch, it would be smaller than a football.'
      : 'The large part of a ribosome: RNA and proteins too. It is about 30 nm across: larger than the small part.', 'ok');
    if (courseOn()) await quest.next();   /* (with a course on, the step waits while its line is read) */
  }
  /* the glow of a ribosome part seen from far away: the nucleolus's own pink, bright, a colour that no ribosome of the
     map has (in the ribosomes' gold the two parts had read as two more ribosomes of the rough ER; a pale blue was lost
     on the pale rough ER) */
  const PARTGLOW = 0xff6fd2;
  async function out() {
    await nolZoom(true);
    nucStep();
    const parts = ['small', 'large'].map(k => props[k] || makePart(k));
    nolNames();
    const f = nolFrame();
    /* each part, pressed, drifts away from the nucleolus (out of the close view), its glow on */
    for (const p of parts) {
      await press(() => p.position.clone().addScaledVector(f.dir, 0.03), p.userData.kind === 'small' ? 'small part' : 'large part', { cls: 'tok', side: 't', w: p.userData.kind === 'small' ? 'smallpart' : 'largepart' });
      haloSprite(p, 0.035, 0xfff1a8);
      quest.names.set(quest.names.items.filter(it => it.key !== 'nol-' + p.userData.kind), HUD(), lr(nolPt(0, -48, 20), nolPt(0, 48, 20)));
      await tween(p, { to: p.position.clone().addScaledVector(f.dir, 0.16).addScaledVector(f.up, p.userData.kind === 'small' ? -0.03 : 0.03), ms: 1400 });
    }
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    /* from far away they are far too small to see: the glows show them on their way out, through two pores on the side of
       the rough ER, and on into the cytosol beside its outer layer, where the ribosome place is (Daniel, 11 Nov 2026: they
       had gone out through the pores nearest the nucleolus, at the top, "instead of to the rough ER"). In this cell the
       rough ER is all round the lower part of the nucleus, so they come out beside it (they do not join the rough ER
       themselves: they join on a copy of a gene first) */
    await nolZoom(false);
    parts.forEach(p => { marker(p, 0.5, PARTGLOW); marker(p, 0.17, 0xffffff); });   /* (a white middle: all pink, the glow was lost on the pink nucleolus) */
    quest.say('From here the two parts are far too small to see: the glows show where they are.');
    const ways = partWays();
    /* (17 Nov 2026, for every pupil) each glow carries its name all the way, the small part's above it and the large
       part's below: "small part", "large part"; with IB "small subunit", "large subunit", and at HL, at the pore,
       "exits through a nuclear pore" (B2.2.6). The two pores they leave by are ringed, and one is
       named. Until now the glows had no name until they stopped */
    /* ("exits through a nuclear pore" only while the glow is at its pore: within 0.5 µm of it, from just inside to just
       outside the envelope; it had stayed on all the way to the rough ER, the science read. With IGCSE on, IB off, the
       label carries the same grey mark as the names: 0610 names ribosomes, not their parts) */
    const word = (p, i) => () => p.userData.kind + (lvHere('ib') ? ' subunit' : ' part') + (ibHL() && p.position.distanceTo(ways[i][0]) < 0.5 ? ' · exits through a nuclear pore' : '');
    parts.forEach((p, i) => rideTag(() => p.position, word(p, i), i === 1, () => lvHere('igcse') && !lvHere('ib') ? 'not named in 0610' : ''));
    ways.forEach(w => { const o = w[0].clone().sub(N0).normalize(), ring = keep(new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.045, 8, 28), new THREE.MeshBasicMaterial({ color: 0x8ff6ff }))); ring.position.copy(w[0]); ring.lookAt(w[0].clone().add(o)); });
    const farNames = rer => { nucAgain = () => farNames(rer); const fc = rerFace(); quest.names.set([
      cName({ key: 'o-pore', free: true, html: '<span class="nm__t">nuclear pore</span>', spots: [ways[0][0].clone(), ways[1][0].clone()] }),
      ...(rer ? [cName({ key: 'o-rer', free: true, aside: true, html: '<span class="nm__t">rough ER</span>', spots: [fc.p.clone().addScaledVector(fc.right, 1.6), fc.p.clone().addScaledVector(fc.right, -1.6), fc.p.clone().addScaledVector(fc.along, 1.1), fc.p.clone().addScaledVector(fc.along, -1.1)] })] : [])
    ], [...HUD(), ...document.querySelectorAll('#stage .rtag')]); };
    await Promise.all(parts.map((p, i) => wait(R.TEST ? 0 : i * 500).then(() => tween(p, { to: ways[i][0], ms: 2200 }))));
    farNames(false);   /* (the pore is named once the glows are at the pores, clear of their labels: named before, a label passed over the name) */
    /* the camera turns to see the side of the nucleus and the rough ER together; the parts go out between its layers'
       edges (through its window at the front: never through a layer) to beside its outer layer */
    await camGo(outView(ways), R.FAST ? 0 : 2600);
    await Promise.all(parts.map((p, i) => wait(R.TEST ? 0 : i * 400).then(() => { trail(p, 3600, PARTGLOW); return tween(p, { path: new THREE.CatmullRomCurve3(ways[i]), ms: 3600 }); })));
    /* the rough ER named where they stop: the link (Daniel, 11 Nov 2026) */
    /* (the two parts, still glowing where they stop, keep their own labels: pupils keep them in sight, the expert review;
       the rough ER's name stands clear of both labels, its spots beside the parts first: it had pointed at the large
       part's own spot from the other side) */
    farNames(true);
    quest.say('<p>In this cell, the rough ER is all round the lower part of the nucleus. So the two parts pass into the cytosol beside the rough ER, where they wait for a copy of a gene.</p><p>Any ribosome can work on the rough ER: the chain it makes decides.</p>', 'ok');
    await wait(R.TEST ? 0 : 1200);
    await quest.gain('parts', ways[0][ways[0].length - 1]);
    await quest.next('Back to the map');   /* (the parts stay in sight until the pupil leaves: reset takes them) */
  }
  /* a glow that shows where something far too small to see is, from far away: a golden dot with a bright middle (normal
     blending: an additive glow was lost on the pale rough ER), drawn over everything (it is seen behind the rough ER's
     layers too), um µm across */
  let MARK = null;
  const marker = (o, um, col = 0xffc94a) => {
    if (!MARK) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.22, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      MARK = new THREE.CanvasTexture(c); MARK.colorSpace = THREE.SRGBColorSpace; }
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: MARK, color: col, transparent: true, depthTest: false, depthWrite: false }));
    sp.scale.setScalar(um / o.scale.x); sp.renderOrder = 20; o.add(sp); return sp;
  };
  /* the way it went, as dots that fade over 4 s (so that the way from the pore to the rough ER can be followed); none with
     Reduce motion (the move is one jump) */
  const trail = (p, ms, col) => {
    if (R.FAST) return;
    const s0 = quest.session, t0 = performance.now(), dots = [];
    const f = () => {
      if (quest.session !== s0) return;
      const now = performance.now();
      if (now - t0 < ms && (!dots.length || now - dots[dots.length - 1].t > 110)) { const d = keep(new THREE.Group()); d.position.copy(p.position); marker(d, 0.16, col); dots.push({ d, t: now }); }
      dots.forEach(o => { o.d.children[0].material.opacity = 0.85 * (1 - Math.min(1, (now - o.t) / 4000)); });
      world.kick();
      if (now - t0 < ms + 4000) requestAnimationFrame(f); else dots.forEach(o => drop(o.d));
    };
    f();
  };
  /* the two parts' ways from the nucleus to the ribosome place: from the two pores nearest it (not too close together), out
     into the cytosol between the nucleus and the rough ER, round to its window at the front (no layers there), out through
     it beyond the outer layer, and round outside that layer to the cytosol just off it (rerFace: where the ribosome place
     looks). Worked out in the rough ER's own round shape (its layers are ellipsoids about the nucleus, cellbuild.js); none
     crosses a layer (checked by rays, 11 Nov 2026) */
  function partWays() {
    const C = N0.clone().add(V(0, -0.1, 0)), K = V(1, 0.75, 0.9), f = rerFace(), spot = f.p.clone().addScaledVector(f.n, 0.06);
    const toS = p => { const q = p.clone().sub(C).divide(K), r = q.length(); return { r, az: Math.atan2(q.x, q.z), e: Math.asin(q.y / r) }; };
    const fromS = (r, az, e) => V(r * Math.cos(e) * Math.sin(az), r * Math.sin(e), r * Math.cos(e) * Math.cos(az)).multiply(K).add(C);
    const pores = W.pores.slice().sort((a, b) => a.distanceTo(spot) - b.distanceTo(spot)), p0 = pores[0], p1 = pores.find(p => p.distanceTo(p0) > 0.3) || pores[1];
    const ss = toS(spot), AZW = -0.72, RO = 6.0;
    return [p0, p1].map((p, i) => { const a = toS(p), e1 = Math.max(a.e, -0.5), end = spot.clone().addScaledVector(f.right, (i ? 0.35 : -0.35));   /* (apart: the two parts join only on a copy of a gene, the expert review, 11 Nov 2026) */
      return [p, fromS(3.13, a.az, a.e), fromS(3.13, AZW, e1), fromS(RO, AZW, e1), fromS(RO, (AZW + ss.az) / 2, (e1 + ss.e) / 2), fromS(ss.r + 0.35, ss.az, ss.e), end]; });
  }
  /* a view of the whole nucleus, the rough ER round it and both ways, from the front, a little to the left and above (from
     the rough ER's own side, its layers stood in front of the ways and the nucleus was pushed into a corner; close, only
     part of the ways showed): what it looks at between the nucleus's middle and the ways' middle, 11 µm away */
  const outView = ways => { const at = N0.clone().lerp(new THREE.Box3().setFromPoints(ways.flat()).getCenter(V(0, 0, 0)), 0.55);
    return { at, dir: V(-0.35, 0.3, 1).normalize(), up: V(0, 1, 0), dist: 11 }; };

  /* ---------------- ribosomes and the rough ER, at their true sizes ----------------
     (9 Nov 2026; Daniel, after the nucleolus: "do the same for any other organelle. If your building parts are huge and
     they shouldn't be huge, please be respectful with size"; his "Yes, build it" to the plan): close up, every molecule at
     its true size, with the scale bar: the copy (mRNA) a thread 2 nm thick, the ribosome about 30 nm (its large part above
     the copy, its small part below), each carrier (transfer RNA) about 7 nm long with its amino acid (about 1 nm), the chain
     a string of amino acids from the ribosome; at the rough ER its membrane at its true thickness (about 6 nm: two layers of
     lipids), the channel in it, the enzyme that removes the signal (about 5 nm), amylase (about 5 nm across) and the
     vesicle that buds (about 70 nm). What the world draws larger than life nearby (its ribosomes, four times their size so
     that the map shows them; the microtubules; the cytosol's motes and dust; the rough ER's sheet; the blood, drawn with
     no fog) is hidden while the camera is close (nanoIn), what is far fades into the cytosol (nanoFog), and all of it
     comes back while the camera goes out (nanoOut) or when the pupil leaves (reset: nanoOff). The rough ER is seen as a
     section, its cut face showing the membrane's two layers. Every press, choice and check is as before.
     Proof: tools/true-size.mjs B and C */
  const TSZ = { mrna: 0.001, rib: 0.0154, small: 0.0168, large: 0.01535, car: 0.0075, aa: 0.0011, bead: 0.00055, res: 0.0003, amy: AMY_S, ves: 0.035, enz: 0.0025 };   /* (res: one amino acid in a chain, a bead 0.6 nm across; neighbours are 0.38 nm apart, so the beads touch) */
  const NZ = { on: false };
  const groupsOf = names => names.map(k => W.groups[k]).filter(Boolean);
  /* what is far away fades into the cytosol while the camera is close: a mitochondrion 2 µm behind a ribosome must not
     look as small as the ribosome beside the scale bar (drawn in perspective, it did). The fog follows the camera's
     distance, so it thickens as the camera comes in and thins as it goes out; only its numbers change (no new shader) */
  const FOGC = new THREE.Color(0x52648c);
  function nanoFog() {
    const fog = scene.fog, o = NZ.fog0 || (NZ.fog0 = { c0: fog.color.clone(), n0: fog.near, f0: fog.far }), { c0, n0, f0 } = o, run = NZ.fogRun = (NZ.fogRun || 0) + 1;
    /* once the close-up ends, the world's own fog comes back over 0.9 s (never in one frame) */
    let tOff = 0;
    const f = () => {
      if (run !== NZ.fogRun) return;
      if (!NZ.on && !tOff) tOff = performance.now();
      const w = tOff ? 1 - smooth(0, 1, R.FAST ? 1 : (performance.now() - tOff) / 900) : 1;
      const d = world.camera.position.distanceTo(world.controls.target), k = smooth(0, 1, Math.log(20 / d) / Math.log(20 / 0.16));
      /* the fold's closer look, inside the rough ER (FOLD.on, the camera under 120 nm away): what is far, the nucleus
         below above all, goes into the world's own fog colour, which is the colour of the stage behind the picture, so
         it is no longer seen (in the cytosol's lighter blue it had stood under the folding chain as a flat hill with
         lumps, which read as objects about 1 nm in size: the expert review, 12 Nov 2026); it follows the camera's
         distance, so it comes and goes with the move */
      const deep = FOLD.on ? smooth(0.12, 0.055, d) : 0;
      const nn = n0 + (Math.min(n0, d * 1.75) - n0) * w, nf = f0 + (Math.min(f0, d * (13 - 7 * deep)) - f0) * w;
      if (Math.abs(nn - fog.near) > 1e-6 || Math.abs(nf - fog.far) > 1e-6) { fog.near = nn; fog.far = nf; fog.color.copy(c0).lerp(FOGC, k * w).lerp(c0, deep * w); world.kick(); }   /* a still picture is not drawn again */
      if (w > 0) requestAnimationFrame(f);
    };
    f();
  }
  /* ---------------- the handover: the world's drawing ↔ a place's close drawing (12 Nov 2026) ----------------
     Daniel, on the dive from the rough ER to the ribosome place: "you see the rough ER, but suddenly you see a flat square
     that doesn't look like the rough ER … all of the transitions when you change shapes or when you zoom into something,
     it's smooth. So you link all of the structure so it's easy to follow. Right now, it's impossible."
     Before: as the dive began, still micrometres away, the world's drawing (the organelle; what is drawn bigger than
     life) went in ONE frame, and the close drawing stood alone in space, a flat slab; on the way out all of it came back
     in one frame. Now nothing goes or comes in one frame. As the camera comes near, first what is drawn bigger than life
     fades (the map's ribosomes, the microtubules, the motes), then the organelle dissolves INTO its close drawing, which
     stands at the same place: the pupil sees one become the other. On the way out the same, backwards; and when the
     pupil leaves a close view for the map, the world comes back as the camera goes away.
     It follows the camera's distance: u is 0 at the place's own view and 1 at the close view, along the dive's own path
     (its distance changes by equal ratios), so it is the same at any speed and both ways. Each kind has its part of the
     way (BIG, DIS). With Reduce motion there is no dive: the end state at once, as before.
     What is drawn bigger than life (small things, many of them) fades through its own materials: by its opacity (a
     solid one is made see-through for that time only, and drawn first among the see-through parts, where it stood
     while solid), a shader by its uOpacity or uFade; the new shaders are made before the camera moves (never a stop in
     the dive); a material that a part outside the handover uses too is left alone, and its part goes at the middle of
     its fade. The organelle and its close drawing are large, and other see-through parts and lights stand in front of
     them and behind them: they change by the world's dissolve (world.js draw: the frame drawn both ways and blended),
     so neither ever changes its place in the drawing order. Proof: tools/transitions.mjs */
  const LOD = { mode: '', items: [], mats: new Map(), onU: null, after: null, glow: [], order: [], ghost: [], u: 0, d0: 1, d1: 1, run: 0, bar: false };
  const BIG = [0.04, 0.40], DIS = [0.40, 0.86];
  const lodK = (cls, u) => cls === 'big' ? 1 - smooth(BIG[0], BIG[1], u) : cls === 'close' ? smooth(DIS[0], DIS[1], u) : 1 - smooth(DIS[0], DIS[1], u);
  const camDist = () => world.camera.position.distanceTo(world.controls.target);
  /* the parts of one object; for what fades through its materials, each material once, with what it was */
  function lodItem(o, cls, own) {
    const it = { o, cls, was: o.visible, parts: [] };
    if (cls !== 'big') return it;
    o.traverse(m => {
      if (!m.material) return;
      for (let a = m; a && a !== o; a = a.parent) if (own.has(a)) return;   /* a part of it that fades as its own kind */
      const part = { m, vis: m.visible, mats: [] };
      (Array.isArray(m.material) ? m.material : [m.material]).forEach(mat => {
        let e = LOD.mats.get(mat);
        if (!e) {
          const un = mat.uniforms && (mat.uniforms.uOpacity || mat.uniforms.uFade);
          e = un ? { mat, kind: 'u', un, base: un.value } : (!mat.isShaderMaterial && typeof mat.opacity === 'number') ? { mat, kind: 'o', base: mat.opacity, tr: mat.transparent } : { mat, kind: 'x' };
          LOD.mats.set(mat, e);
        }
        part.mats.push(e);
      });
      it.parts.push(part);
    });
    return it;
  }
  /* a material that something outside the handover is drawn with is left alone (kind x) */
  function lodShared() {
    const mine = new Set(); LOD.items.forEach(it => it.parts.forEach(q => mine.add(q.m)));
    scene.traverse(m => { if (!m.material || mine.has(m)) return; (Array.isArray(m.material) ? m.material : [m.material]).forEach(mat => { const e = LOD.mats.get(mat); if (e && e.kind !== 'x') { e.kind = 'x'; e.shared = true; } }); });
  }
  function lodBegin() {
    LOD.mats.forEach(e => { if (e.kind === 'o' && !e.tr) { e.mat.transparent = true; e.mat.needsUpdate = true; } });
    LOD.items.forEach(it => it.parts.forEach(q => { if (q.mats.some(e => e.kind === 'o' && !e.tr)) { LOD.order.push([q.m, q.m.renderOrder]); q.m.renderOrder -= 100; } }));
  }
  /* the two drawings the world dissolves between: the organelle as on the map; its close drawing */
  const lodShow = close => LOD.items.forEach(it => { if (it.cls === 'org') it.o.visible = it.was && !close; else if (it.cls === 'close') it.o.visible = close; });
  function lodSet(u) {
    LOD.u = u; if (LOD.onU) LOD.onU(u);
    LOD.glow.forEach(([m, b]) => { m.opacity = b * (1 - smooth(0.5, 0.9, u)); });
    const kb = lodK('big', u), t = lodK('close', u);
    LOD.mats.forEach(e => { if (e.kind === 'o') e.mat.opacity = e.base * kb; else if (e.kind === 'u') e.un.value = e.base * kb; });
    LOD.items.forEach(it => { if (it.cls !== 'big') return; it.o.visible = it.was && kb > 0.004; it.parts.forEach(q => { if (q.mats.every(e => e.kind === 'x')) q.m.visible = q.vis && kb > 0.5; }); });
    if (t > 0.002 && t < 0.998) { if (!world.dissolve) world.dissolve = { t, a: () => lodShow(false), b: () => lodShow(true) }; world.dissolve.t = t; }
    else { world.dissolve = null; lodShow(t >= 0.998); }
    if (LOD.mode === 'out' && LOD.bar && u < 0.5) { LOD.bar = false; nolBar(false); }
    world.kick();
  }
  const lodAsWas = e => { if (e.kind === 'o') { e.mat.opacity = e.base; if (!e.tr) { e.mat.transparent = false; e.mat.needsUpdate = true; } } else if (e.kind === 'u') e.un.value = e.base; };
  /* the handover ends: every material and every part as it was; the close drawing, if it still stands, not shown */
  function lodEnd() {
    LOD.run++;
    world.dissolve = null;
    LOD.mats.forEach(lodAsWas);
    LOD.order.splice(0).forEach(([o, ro]) => { o.renderOrder = ro; });
    LOD.items.forEach(it => { it.parts.forEach(q => { q.m.visible = q.vis; }); it.o.visible = it.cls === 'close' ? false : it.was; });
    if (LOD.onU) LOD.onU(0);
    LOD.glow.splice(0).forEach(([m, b]) => { m.opacity = b; });
    const after = LOD.after;
    LOD.items = []; LOD.mats = new Map(); LOD.onU = null; LOD.after = null; LOD.mode = ''; LOD.u = 0;
    if (after) after();   /* (what the place itself decides about its parts, after they are as they were) */
    world.kick();
  }
  /* it follows the camera, every frame, while the game moves it in or out, or (gone: the pupil left) until the camera is far */
  function lodDrive() {
    const run = ++LOD.run, t0 = performance.now();
    const f = () => {
      if (run !== LOD.run) return;
      const span = Math.log(LOD.d0 / LOD.d1), u = span > 0.01 ? Math.max(0, Math.min(1, Math.log(LOD.d0 / camDist()) / span)) : 1;
      if (LOD.mode === 'gone' && (u <= 0 || performance.now() - t0 > 6000)) return lodEnd();
      lodSet(u);
      requestAnimationFrame(f);
    };
    f();
  }
  /* a handover begins: what fades as the camera comes near (big, then org), what comes in (close), and anything else
     that follows the way (onU). False with Reduce motion: the end state is set at once */
  function lodOpen({ big = [], org = [], close = [], onU = null, after = null }, d1) {
    lodEnd();   /* (the handover of a place the pupil left a moment ago: its end at once) */
    const vis = o => o && o.visible, B = [...new Set(big.filter(vis))], O = [...new Set(org.filter(vis))].filter(o => !B.includes(o)), C = close.filter(Boolean), own = new Set([...B, ...O, ...C]);
    LOD.items = B.map(o => lodItem(o, 'big', own)).concat(O.map(o => lodItem(o, 'org', own)), C.map(o => lodItem(o, 'close', own)));
    lodShared();
    LOD.onU = onU; LOD.after = after; LOD.d0 = camDist(); LOD.d1 = d1; LOD.mode = 'in';
    if (R.FAST) { lodSet(1); return false; }
    lodBegin(); lodSet(0); return true;
  }
  /* every shader the handover will need is made now, while the picture is still (at most 1.5 s; then the dive starts
     anyway): the see-through ones, the close drawing's (shown for the moment the list is made: a part not shown is left
     out of it, and its shaders were made in the dissolve's first frame, a stop of a tenth of a second) and the dissolve's own */
  const lodWarm = () => { lodShow(true); LOD.items.forEach(it => { if (it.cls === 'org') it.o.visible = it.was; });
    const p = Promise.all([world.renderer.compileAsync(scene, world.camera).catch(() => {}), world.dissolveWarm()]); lodShow(false);
    return live(Promise.race([p, new Promise(r => setTimeout(r, 1500))])); };
  const lodHold = () => { LOD.run++; LOD.mode = 'held'; lodSet(1); };
  /* the way out: the same handover, backwards, from where the camera is now to a view d0 away */
  const lodBack = d0 => { if (LOD.items.length && !R.FAST) { LOD.d1 = camDist(); LOD.d0 = d0; LOD.mode = 'out'; lodDrive(); } };
  /* a glow that shows, from far away, where something far too small to see is: it comes in as the camera goes away
     (12 Nov 2026: put on close up, in one frame, it filled the picture) */
  const farGlow = (o, nm, color) => { haloSprite(o, nm, color); const m = o.children[o.children.length - 1].material; if (NZ.on && !R.FAST) { LOD.glow.push([m, m.opacity]); m.opacity = 0; } return o; };
  /* a step of a close view begins at the place's own view, unless the camera is close already (the step before left it
     there). Before, the smooth ER's second step flew out to the place's view and back in, with nothing in the picture
     but the close drawing, far away (12 Nov 2026) */
  const toPlace = id => NZ.on ? Promise.resolve() : fly(world.P[id].view.pos, world.P[id].view.at);
  async function nanoIn(view, hide) {
    if (NZ.on) {
      /* close already: back to the step's own view only if the pupil has turned or moved the picture, in a time that fits
         how far (before: 3.2 s every time, and with the camera already there the step waited 3.2 s while nothing moved) */
      /* (after a ↻: the close drawing made again takes the old one's place in the handover) */
      const mine = [props.mem, props.close].filter(Boolean);
      if (LOD.ghost.some(o => !mine.includes(o)) || mine.some(o => !LOD.items.some(it => it.o === o))) {
        lodGhosts(); LOD.items = LOD.items.filter(it => it.cls !== 'close').concat(mine.map(o => lodItem(o, 'close', new Set()))); if (LOD.mode === 'held') lodSet(1);
      }
      const at = world.controls.target, dir = world.camera.position.clone().sub(at).normalize();
      const far = Math.max(at.distanceTo(view.at) / view.dist, dir.angleTo(view.dir), Math.abs(Math.log(camDist() / view.dist)));
      if (far < 0.02) return;
      return camGo(view, R.FAST ? 0 : Math.round(Math.min(3200, 700 + 2500 * far)));
    }
    const big = NEAR_HIDE();
    NZ.on = true;
    const moving = lodOpen({ big: hide.filter(o => big.includes(o)), org: hide, close: [props.mem, props.close] }, view.dist);
    LOD.bar = true; nolBar(true); nanoFog();
    if (!moving) return camGo(view, 0);
    await lodWarm();
    lodDrive();
    /* the camera has turned to the close view's own direction by the middle of the way: it then comes in level with the
       membrane, which is seen from its edge, as in a section (turning until the end, it looked down on the close
       drawing from above for most of the dive: a flat plate) */
    await camGo(Object.assign({ turn: 0.5 }, view), 3200);
    lodHold();
  }
  /* the close-up ends at once (the pupil leaves: reset; or the way out has ended): the scale bar goes; the world is as it
     was, or, when the camera is still near, comes back as it goes away (the close drawing has gone with the place) */
  function nanoOff() {
    if (NZ.on) { NZ.on = false; LOD.bar = false; nolBar(false); }
    if (!LOD.items.length && !LOD.onU) return;
    const near = !R.FAST && LOD.u > 0 && Math.log(LOD.d0 / camDist()) > 0;
    if (!near) return lodEnd();
    /* the close drawing has gone with the place: it leaves the handover, and the organelle comes back with the camera's distance */
    LOD.items = LOD.items.filter(it => it.cls !== 'close');
    LOD.mode = 'gone'; lodDrive();
  }
  /* on the way out the same handover, backwards: the close drawing fades into the world's own as the camera goes away
     (before: about 0.45 µm away the world's rough ER came back in one frame, and at 1.5 µm its ribosomes) */
  async function nanoOut(placeView) {
    const at = V(...placeView.at), pos = V(...placeView.pos);
    if (NZ.on) lodBack(pos.distanceTo(at));
    await camGo({ at, dir: pos.clone().sub(at).normalize(), up: V(0, 1, 0), dist: pos.distanceTo(at) }, R.FAST ? 0 : 3000);
    if (NZ.on) { NZ.on = false; LOD.bar = false; nolBar(false); }
    lodEnd();
  }
  /* a molecule at its true size glows little (a token's glow spread far beyond it), on copies of the shared materials */
  const calm = t => { t.traverse(o => { if (o.isMesh && o.material && o.material.emissive) { o.material = o.material.clone(); o.material.emissiveIntensity *= 0.3; } }); return t; };
  const NEAR_HIDE = () => groupsOf(['free-ribosomes', 'microtubules', 'cytosol', 'dust', 'blood']).concat([W.groups.rer && W.groups.rer.children.find(o => o.name === 'rer-ribosomes')]);

  /* ---------------- ribosomes ----------------
     beside the rough ER (Daniel, 11 Nov 2026: "when clicking the ribosome … be taken … to the rough endoplasmic reticulum
     … the students should link the rough ER with ribosomes and the fact that they end up in the membrane of the rough
     ER"): the close view is the rough ER's own piece of membrane (rerFace), seen from the same eye level, looking a little
     higher, at the cytosol just above it, where this ribosome begins its protein (a ribosome starts in the cytosol; the
     signal then takes it to the rough ER). The membrane lies across the foot of the picture the whole time. Offsets in
     nm: x across the picture (to the right), y up (out of the membrane, into the cytosol; 0 is the copy, RIB_Y above the
     membrane), z towards the camera; x 0 is above the channel where the ribosome will dock. The rough ER's own offsets
     (ep) run the other way across: ep(-28, 46), where Dock begins, is 28 nm to the right, 46 nm up */
  const RIB_Y = 52, RIB_AT = 46, RIB_X = 8, RIB_DIST = 0.17;   /* (the view's middle 8 nm to the right: on a phone, about 116 nm wide, the free ribosome of the last step is in it) */
  function ribFrame() {
    if (props.rf) return props.rf;
    const f = rerFace(), up = f.n.clone(), rd = f.along.clone(), right = new THREE.Vector3().crossVectors(up, rd).normalize();
    return (props.rf = { c: f.p.clone().addScaledVector(up, RIB_Y / 1000), rd, right, up });
  }
  const rp = (x, y, z = 0) => { const f = ribFrame(); return f.c.clone().addScaledVector(f.right, x / 1000).addScaledVector(f.up, y / 1000).addScaledVector(f.rd, z / 1000); };
  /* a token turned to the picture, its up the view's up (the rough ER's up is not the world's) */
  const faced = t => { const f = ribFrame(); t.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.right, f.up, f.rd)); return t; };
  /* the camera's eye level with the middle of the membrane (as at the rough ER: its cut face a thin band, never its top
     stretched back as a plane), looking up at a point RIB_AT nm above it */
  /* (on a phone the corner box covers the top of the picture: the camera a little further away, looking a little higher,
     so that what stands highest, the large part as it comes and the free ribosome's chain, is below it) */
  const ribClose = () => {
    membrane();
    const P = PHONE(), at = P ? 44 : RIB_AT, dist = P ? 0.225 : RIB_DIST;   /* (the membrane above the switch and the scale bar) */
    const f = ribFrame(), a = -Math.asin(at / 1000 / dist), cd = f.rd.clone().multiplyScalar(Math.cos(a)).addScaledVector(f.up, Math.sin(a)).normalize();
    return nanoIn({ at: rerFace().p.clone().addScaledVector(f.up, at / 1000).addScaledVector(f.right, RIB_X / 1000), dir: cd, up: f.up.clone(), dist }, NEAR_HIDE().concat([W.groups.rer]));
  };
  /* the copy: a thread across the picture; the ribosome reads it a codon (3 bases, about 1 nm) at a time */
  const makeCopy = () => { const curve = new THREE.CatmullRomCurve3([...Array(13)].map((_, i) => rp(-90 + i * 15, 1.4 * Math.sin(i * 0.9)))); const m = keep(ribbon(curve, { radius: TSZ.mrna, segs: 220 })); m.userData.grow(1); props.copy = curve; props.copyObj = m; return curve; };
  const ribPos = k => rp(-12 + k * 1.1, 0);
  const makeRib = k => { const t = faced(calm(keep(token('ribosome', TSZ.rib)))); t.position.copy(ribPos(k)); return (props.rib = t); };
  /* (17 Nov 2026, the courses on the picture: each name through cName, with IB's own words, the guide's: "small subunit",
     "large subunit", D1.2.6, "mRNA", "polypeptide", D1.2.5; IGCSE's grey mark on the names 0610 does not use; a card
     where a line of a course that is on speaks of the part. `o.w`: this name's own course words, over RIBW's) */
  const RIBW = { 'r-s': { ib: 'small subunit' }, 'r-l': { ib: 'large subunit' }, 'r-copy': { ib: 'mRNA' }, 'r-chain': { ib: 'growing<br>polypeptide' } };   /* ("growing": D1.2.10's line, six amino acids of 511) */
  let ribCode = null;   /* (the label under the ribosome, worded again when the course changes: translate) */
  const ribNames = (list, solid = [props.rib]) => { nucAgain = () => { if (ribCode) ribCode(); ribNames(list, solid); };
    quest.names.set(list.map(([key, html, spots, o]) => { const { w, ...opt } = o || {}; return cName(Object.assign({ key, free: true, aside: true, html: `<span class="nm__t">${html}</span>`, spots }, key === 'r-copy' ? { up: 1, small: '<span class="nm__t">copy<br>(mRNA)</span>' } : {}, opt), Object.assign({}, RIBW[key], w)); }), HUDR(), lr(rp(-50, 0), rp(45, 0)), solid.filter(Boolean)); };
  /* a thing inside the ribosome that the pupil must see (the carrier that holds the chain, the chain's newest amino
     acids, like the marks on the copy): drawn through the ribosome's body, its materials its own copies */
  const xray = o => { o.traverse(c => { if (!c.isMesh || !c.material) return; if (!c.userData.xr) { c.material = c.material.clone(); c.userData.xr = 1; } c.material.depthTest = false; c.material.depthWrite = false; c.material.transparent = true; c.renderOrder = 8; }); return o; };
  /* the code's shape as a small solid, seen from the front: a triangle, a circle, a square, a diamond */
  const GLYPH = [() => new THREE.ConeGeometry(0.0017, 0.0027, 3), () => new THREE.SphereGeometry(0.0015, 12, 9), () => new THREE.BoxGeometry(0.0025, 0.0025, 0.0025), () => new THREE.OctahedronGeometry(0.0018)];
  /* something that comes into the picture or leaves it while the camera is still: it fades in over ms (its materials are
     its own copies for that time), never in one frame */
  const fadeIn = (objs, ms = 600) => { const mats = []; objs.filter(Boolean).forEach(o => o.traverse(c => { if (c.isMesh || c.isPoints) { c.material = c.material.clone(); mats.push([c.material, c.material.transparent, c.material.opacity]); c.material.transparent = true; c.material.opacity = 0; } }));
    const t0 = performance.now(), s0 = quest.session;
    return live(new Promise(res => { const f = () => { if (quest.session !== s0) return res(); const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms); mats.forEach(([m, , o]) => { m.opacity = o * k; }); world.kick(); if (k < 1) requestAnimationFrame(f); else { mats.forEach(([m, tr]) => { m.transparent = tr; m.needsUpdate = true; }); res(); } }; f(); }), s0); };
  /* a large part's name stands beside its edge, on the screen's right or left, and its short line ends on the part: beside
     its middle, the name covered half a ribosome (names.js sides) */
  const edge = (c, ...rads) => { const R = new THREE.Vector3().setFromMatrixColumn(world.camera.matrixWorld, 0).normalize(); return [rads.flatMap(rad => [c.clone().addScaledVector(R, rad), c.clone().addScaledVector(R, -rad)]), { sides: rads.flatMap(() => [1, -1]) }]; };
  /* the same, on its left side only (at the last step the free ribosome, up on the right, needs the right; on a phone the
     name stands below this ribosome, then above it once it has turned and moved) */
  const edgeL = (c, rad) => { const [sp] = edge(c, rad); return [[sp[1]], { sides: [-1] }]; };
  /* the copy's name stands on the copy, away from the ribosome (on a phone the picture is about 125 nm wide) */
  const copySpots = () => PHONE() ? [rp(44, 1), rp(54, 1), rp(-62, 1)] : [rp(-48, 1), rp(-40, 1), rp(28, 1), rp(38, 1), rp(48, 1)];   /* (on a phone clear of the code's label under the ribosome: on the left it touched it, 11 Nov 2026) */
  /* the membrane of the rough ER named in this view too (the link: Daniel, 11 Nov 2026): above it, on the right, where
     nothing of the story is (below it there is no room at the foot of the picture) */
  const ribMem = () => ['r-mem', 'membrane of the rough ER', [rp(45, -RIB_Y + 3), rp(55, -RIB_Y + 3), rp(35, -RIB_Y + 3)], { up: -1, len: 26, small: '<span class="nm__t">rough ER<br>membrane</span>' }];
  async function assemble() {
    await toPlace('ribosome');
    nucStep();
    /* the copy and the two parts are in the cytosol before the dive: far too small to see from the rough ER's view, they
       come into sight as the camera comes near (12 Nov 2026: made once it had landed, they came in one frame) */
    if (!props.copy) makeCopy();
    const s = faced(calm(keep(token('small', TSZ.small)))), l = faced(calm(keep(token('large', TSZ.large))));
    /* they come from the sides: the large part from up on the right (up on the left it stood under the corner box), the
       small part from down on the left (above the switch at the foot of the picture) */
    s.position.copy(rp(-40, -28, 5)); l.position.copy(rp(24, 26, 5));
    await ribClose();
    const copyName = ['r-copy', 'the copy (mRNA)', copySpots()];
    ribNames([copyName, ribMem(), ['r-s', 'small part', ...edge(s.position, 0.011)], ['r-l', 'large part', ...edge(l.position, 0.014)]], [s, l]);
    await press(() => rp(-12, 18), 'Join', { w: 'ribjoin' });
    /* (while the two parts move, each keeps its name on a label that moves with it: their names had stayed where the
       parts had been, their lines ending on nothing, the frames of 17 Nov 2026. IB: once the small subunit is on the
       copy its label says what the guide says of it, D1.2.6: "binds the mRNA") */
    ribNames([copyName, ribMem()], [s, l]);
    let bound = false; const no0610 = () => lvHere('igcse') && !lvHere('ib') ? 'not named in 0610' : '';
    const tS = rideTag(() => s.position, () => lvHere('ib') ? 'small subunit' + (bound ? ' · binds the mRNA' : '') : 'small part', true, no0610);
    /* (on a phone the large part comes from under the corner box: its label stands on it, not above it) */
    const tL = rideTag(() => PHONE() ? l.position : l.position.clone().addScaledVector(ribFrame().up, 0.012), () => lvHere('ib') ? 'large subunit' : 'large part', PHONE(), no0610);
    await tween(s, { to: rp(-12, -5.9), ms: 900 }); bound = true;
    await tween(l, { to: rp(-12, 6.5), ms: 900 });
    await wait(R.TEST ? 0 : R.FAST ? 2200 : 500);   /* (with Reduce motion the two labels stand on the joined parts for 2 s: the still shows what the move showed) */
    tS.off(); tL.off();
    drop(s); drop(l);
    const r = makeRib(0);
    burst(scene, r.position, { n: 20, r: 0.02 });
    ribNames([copyName, ribMem(), ['r-rib', 'ribosome', ...(([sp, o]) => [sp, Object.assign({}, o, { w: { ib: 'ribosome: 80S', card: 'r-whole' } })])(edge(r.position.clone().addScaledVector(ribFrame().up, 0.009), 0.0135))]]);
    quest.say('A whole ribosome, on the copy of the gene. It is about 30 nanometres (nm) across, and the copy is a thread only 2 nm thick.', 'ok');
    state.use('parts');
    if (courseOn()) await quest.next();   /* (with a course on, the step waits while its line is read) */
  }
  const CODES = [[0, '▲'], [1, '●'], [2, '■'], [3, '◆'], [1, '●'], [0, '▲']];
  /* (17 Nov 2026, for every pupil; the places planner had found each fault in the frames:
     - the three carriers come in from beyond the picture's right edge and wait; the two not chosen drift out again, and
       the chosen one leaves the ribosome empty once its amino acid has joined the chain (all three had stood there in
       one frame and gone in one frame, the chosen one into the ribosome for good);
     - one carrier is named, at the first two codes: "carrier"; with IB "tRNA: its anticodon", its line ending on the end
       of the L that meets the copy (D1.2.7), and the label under the ribosome reads "codon";
     - the stretch of the copy that is read is lit, 1 nm of it, seen through the ribosome, and the stretches read stay
       marked (nothing on the copy had shown what is read: the ribosome moves 1.1 nm a code, 7 px);
     - with a course on the label counts: IGCSE "amino acids assembled so far" (17.1.8's verb); IB "codons read" and
       "peptide bonds" (D1.2.10), and "peptide bond" stands for a second at each new bond.)
     (18 Nov 2026, a science read of the frames:
     - a chosen carrier stays in the ribosome, its matching end on the stretch that it read, and holds the chain; it
       leaves empty only when the next carrier is in and has taken the chain. So two carriers are in the ribosome at
       the same time, as the place's own D1.2.6 line says (each had left at once: only one was ever in). The carriers
       inside and the chain's newest amino acids are seen through the ribosome, as the marks are;
     - the end of a carrier that matches the code carries the code's shape (the shape had stood only on the button
       above the amino acid, the other end);
     - a line joins the label under the ribosome to the stretch of the copy that it speaks of.)
     (the second read, the same day: two carriers 1 nm apart lay on each other and read as one. So the carrier that
     holds the chain leans to the left, towards the way out, when the ribosome steps on, and stays 1.5 s beside the
     next one before it leaves; a thin line joins the carrier that holds the chain to the chain, so "holds the chain"
     and "empty" look different; and the label's shape is an outline, the carrier's a solid that fits it: a codon and
     its anticodon are not the same thing.) */
  async function translate() {
    await ribClose();
    nucStep();
    if (!props.copy) makeCopy();
    const r = props.rib || makeRib(0), F = ribFrame();
    const beads = [], colors = [];
    let chainObj = null;
    /* (on a phone the carriers stand in a row below the copy, on the right, and the picture is 200 px high between the
       boxes: while they are there the copy's name stands above the copy, on the left, and the rough ER's membrane, no
       part of this step, has no name (it has one in steps 1 and 3). Under the copy and over the membrane the two names
       stood in the carriers' row, and the carriers' buttons were pushed away from them: the frames, 18 Nov 2026) */
    const base = end => { const rib = ['r-rib', 'ribosome', ...edge(r.position.clone().addScaledVector(F.up, 0.009), 0.0135)];
      return PHONE() ? [end ? ['r-copy', 'the copy (mRNA)', copySpots()] : ['r-copy', 'the copy (mRNA)', [rp(-48, 1), rp(-40, 1), rp(-56, 1)], { up: -1, len: 14 }], rib] : [['r-copy', 'the copy (mRNA)', copySpots()], ribMem(), rib]; };
    ribNames(base());
    (props.marks || []).forEach(m => m.parent && m.parent.remove(m));   /* (the step watched again: the copy is unread again) */
    if (props.trna) { drop(props.trna); props.trna = null; }
    let held = null, stem = null;   /* held: the carrier in the ribosome that holds the chain; stem: the label's line to the copy */
    /* the carrier that holds the chain leans 25° to the left about its matching end (it stays on its stretch of the copy) */
    const lean = (t, ms = 400) => { if (t.userData.leant) return; t.userData.leant = 1; const piv = t.position.clone().addScaledVector(F.right, -TSZ.car).addScaledVector(F.up, -0.93 * TSZ.car), p0 = t.position.clone().sub(piv), q0 = t.quaternion.clone(), t0 = performance.now(), s0 = quest.session, q = new THREE.Quaternion();
      (function f() { if (quest.session !== s0 || !t.parent) return; const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms), a = 0.44 * k * k * (3 - 2 * k); q.setFromAxisAngle(F.rd, a); t.position.copy(p0).applyQuaternion(q).add(piv); t.quaternion.copy(q).multiply(q0); world.kick(); if (k < 1) requestAnimationFrame(f); })(); };
    /* a thin line from the amino acid end of the carrier that holds the chain to the chain's root (the part of the chain
       inside the ribosome is not drawn amino acid by amino acid) */
    const tether = keep(new THREE.Mesh(new THREE.CylinderGeometry(0.00014, 0.00014, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, depthTest: false, depthWrite: false }))); tether.renderOrder = 8; tether.visible = false;
    { const s0 = quest.session, n0 = mitoStepN; (function f() { if (quest.session !== s0 || mitoStepN !== n0) { drop(tether); return; }
        tether.visible = !!(held && held.parent && !held.children[0].visible);
        if (tether.visible) { const a = held.position, b = r.position.clone().addScaledVector(F.up, 0.017), d = b.clone().sub(a); tether.position.copy(a).add(b).multiplyScalar(0.5); tether.scale.y = d.length(); tether.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); }
        requestAnimationFrame(f); })(); }
    const markAt = k => props.copy.getPoint((78 + k * 1.1) / 180).add(props.copyObj.position);
    const marks = props.marks = [], markGeo = new THREE.CylinderGeometry(0.0017, 0.0017, 0.0009, 10);
    /* (the stretch that is read: white and taller; once read it takes its code's colour, the colour of the amino acid it
       stands for, so the row of marks on the copy and the row of amino acids in the chain are in the same order) */
    const read = () => marks.forEach((m, i) => { m.material.color.setHex(AMINO_COLORS[CODES[i][0]]); m.scale.set(1, 1, 1); });
    const mark = k => { read();
      /* (a child of the copy: at the last step the copy moves with the ribosome, and its marks with it) */
      const m = new THREE.Mesh(markGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthTest: false, depthWrite: false })); m.renderOrder = 9;
      m.position.copy(props.copy.getPoint((78 + k * 1.1) / 180)); m.quaternion.setFromUnitVectors(V(0, 1, 0), F.right); m.scale.set(1.5, 1, 1.5); props.copyObj.add(m); marks.push(m); world.kick(); };
    const soFarT = n => !n || !courseOn() ? '' : lvHere('ib') ? `codons read: ${n} · peptide bonds: ${Math.max(0, n - 1)}` : `amino acids assembled so far: ${n}`;
    const soFar = n => soFarT(n) && `<small class="code__n">${soFarT(n)}</small>`;
    for (let k = 0; k < CODES.length; k++) {
      const [ci, sym] = CODES[k], home = ribPos(k), P = PHONE();
      /* three amino acids come near, each on its carrier (transfer RNA, about 7 nm); the carrier whose end has the same
         shape and colour fits */
      const opts = [ci, (ci + 1) % 4, (ci + 2) % 4].sort(() => Math.random() - 0.5);
      /* up on the right of the ribosome, clear of the corner box at the top left (each L hangs 7.5 nm to the left of its
         amino acid and 7 nm down: clear of the ribosome's top) */
      /* (on a phone the corner box covers the top: in a row below the copy, on the right, a button's width apart; up
         there they had been pushed under the box and touched) */
      const slot = i => home.clone().addScaledVector(F.right, (P ? 34 + i * 24 : 27 + i * 16) / 1000).addScaledVector(F.up, P ? -0.022 : 0.026).addScaledVector(F.rd, 0.006);
      const toks = opts.map((c, i) => {
        const t = faced(keep(token('amino', TSZ.aa))); t.children[0].material = t.children[0].material.clone(); t.children[0].material.color.setHex(AMINO_COLORS[c]); t.children[0].material.emissive.setHex(AMINO_COLORS[c]);
        const cr = token('carrier', TSZ.car); cr.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.color.setHex(AMINO_COLORS[c]); o.material.emissive.setHex(AMINO_COLORS[c]); o.material.emissiveIntensity *= 0.4; } }); t.add(cr);   /* (the L's amino acid end is the token's middle: actors.js carrier) */
        const gl = new THREE.Mesh(GLYPH[c](), new THREE.MeshBasicMaterial({ color: new THREE.Color(AMINO_COLORS[c]).lerp(new THREE.Color(0xffffff), 0.55) })); gl.position.set(-TSZ.car, -0.93 * TSZ.car, 0.0002); cr.add(gl);   /* (its matching end carries its shape, on the end itself: the carrier stays under 10 nm, tools/true-size.mjs B) */
        t.position.copy(slot(i)).addScaledVector(F.right, 0.14); return { t, c };
      });
      /* (from the second code on they wait 0.4 s: the carriers of the code before are on their way out) */
      /* (the carrier that holds the chain leans when the ribosome steps on; if the carrier before it is still inside, it
         leans only when that one leaves, 1.5 s after it came in: so for 1.5 s one stands upright beside one that leans,
         and the next three come in only then. Leaning both at once, they lay side by side and read as one: the third
         read, 18 Nov 2026) */
      const pair = !!(held && held.userData.pair);
      if (held && !pair) lean(held);
      await Promise.all([tween(r, { to: home, ms: 500 }), ...toks.map(({ t }, i) => wait(R.TEST ? 0 : (pair ? 1500 : k ? 400 : 0) + i * 90).then(() => tween(t, { to: slot(i), ms: 700 })))]);
      mark(k);
      const codeWords = () => `${lvHere('ib') ? 'codon' : 'code'}: <b class="sym s${ci}">${['△', '○', '□', '◇'][ci]}</b>${soFar(k)}`;   /* (an outline: the carrier's solid shape fits it) */
      const code = quest.hot(() => r.position.clone().addScaledVector(F.up, -0.019), codeWords(), { cls: 'code', side: 'b', aria: 'the code' });
      code.el.disabled = true;
      { const a = markAt(k), b = r.position.clone().addScaledVector(F.up, -0.019), d = a.clone().sub(b);
        stem = keep(new THREE.Mesh(new THREE.CylinderGeometry(0.00013, 0.00013, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthTest: false, depthWrite: false })));
        stem.renderOrder = 9; stem.position.copy(a).add(b).multiplyScalar(0.5); stem.scale.y = d.length(); stem.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); }
      ribCode = () => { const sp = code.el.isConnected && code.el.querySelector('span'); if (sp) sp.innerHTML = codeWords(); };
      /* (the carrier on the right is named, at the first two codes: its far end, the one that meets the copy, has room under it) */
      if (k < 2) { const car = toks[toks.length - 1].t; ribNames(base().concat([['r-car', 'carrier', [car.position.clone().addScaledVector(F.right, -TSZ.car).addScaledVector(F.up, -0.93 * TSZ.car)], { aside: false, up: 1, len: P ? 8 : 18, w: { igcse: 'carrier of<br>an amino acid', ib: 'tRNA:<br>its anticodon' } }]])); }   /* (IGCSE: 0610 uses "carrier" for proteins of a membrane, 3.3.3: this one is named in full) */   /* (a phone: a short line, the name clear of the switch at the picture's foot) */
      await new Promise(done => {
        toks.forEach(({ t, c }) => {
          const b = quest.hot(() => t.position.clone().addScaledVector(F.up, 0.008), `<b class="sym s${c}">${['▲', '●', '■', '◆'][c]}</b>`, { cls: 'tok aa', aria: 'the carrier with a ' + ['triangle', 'circle', 'square', 'diamond'][c], right: c === ci });
          b.done.then(async () => {
            if (c !== ci) { quest.say('That carrier does not match the code. Look at its shape and colour.', 'no'); const p0 = t.position.clone(); await tween(t, { to: p0.clone().addScaledVector(F.up, -0.003), ms: 200 }); await tween(t, { to: p0, ms: 200 }); return; }
            if (!quest.energy(COST.translate / CODES.length, 'aa-' + k)) return;
            quest.clearHots(); quest.say(''); cardOff();   /* (an open card would stand over the carriers as they leave and come) */
            if (k < 2) ribNames(base());
            if (stem) { drop(stem); stem = null; }
            /* into the ribosome, its matching end on the stretch of the copy that is read (the amino acid 7.5 nm to the
               right of it, in the large part) */
            xray(t);
            await tween(t, { to: markAt(k).addScaledVector(F.right, TSZ.car).addScaledVector(F.up, 0.93 * TSZ.car + 0.0024), ms: 450 });
            /* its amino acid is in the chain now, and this carrier holds the chain. The carrier of the code before, which
               held it until now, leaves empty, up to the left; the two not chosen drift out to the right, away from the
               row that the next three come in on (each is dropped only beyond the picture's edge) */
            t.children[0].visible = false;
            const old = held; held = t; t.userData.pair = !!old;
            if (old) wait(R.TEST ? 0 : 1500).then(() => { t.userData.pair = false; lean(t); return tween(old, { to: old.position.clone().addScaledVector(F.right, -0.17).addScaledVector(F.up, 0.05), ms: 900 }); }).then(() => drop(old)).catch(() => {});
            toks.forEach(x => { if (x.t !== t) tween(x.t, { to: x.t.position.clone().addScaledVector(F.right, 0.15).addScaledVector(F.up, PHONE() ? -0.05 : 0.06), ms: 900 }).then(() => drop(x.t)).catch(() => {}); });
            /* the chain leaves the large part's tunnel, at its top: one more amino acid at its root */
            colors.push(ci);
            beads.length = 0; for (let q = 0; q < colors.length; q++) beads.push(r.position.clone().addScaledVector(F.up, (17 + 1.15 * (colors.length - 1 - q)) / 1000).addScaledVector(F.right, ((q % 2) - 0.5) * 0.0008));
            if (chainObj) drop(chainObj);
            chainObj = xray(keep(chain(beads, colors, TSZ.bead)));
            burst(scene, r.position.clone().addScaledVector(F.up, 0.017), { n: 8, r: 0.004, size: 0.0007, near: 0.0006, ms: 700, color: AMINO_COLORS[ci] });   /* (a small light where the amino acid joins: the chain is 7 px longer, hard to see) */
            /* (IB: "peptide bond" for a second at the new bond, at the chain's root, D1.2.10: a name beside the chain,
               on a level line; under the root it lay on the two carriers' ends and on the line to the chain) */
            if (colors.length > 1 && lvHere('ib')) { const root = r.position.clone().addScaledVector(F.up, 0.0176), nm0 = k < 2 ? base() : base(k >= CODES.length - 1);
              ribNames(nm0.concat([['r-pb', 'peptide bond', [root], { sides: [-1] }]]), []);   /* (it may stand over the ribosome's shoulder: the root is at the ribosome's top, and beside it no place is clear of the ribosome) */
              const s0 = quest.session, n0 = mitoStepN; setTimeout(() => { if (quest.session === s0 && mitoStepN === n0 && k < CODES.length - 1) ribNames(base()); }, 1300); }
            done();
          });
        });
      });
    }
    props.chain = chainObj; props.trna = held; ribCode = null; read(); world.kick();
    /* (the chain is named, "polypeptide" with IB; with a course on the count stays under the ribosome, where the pupil
       watched it grow: these six are the start of 511, so "so far") */
    { const fin = pb => ribNames(base(true).concat([['r-chain', 'the chain of amino acids', beads.map(b => b.clone()), { sides: beads.map(() => 1), w: Object.assign({ igcse: 'chain of<br>amino acids' }, PHONE() ? { ib: 'polypeptide' } : {}) }]],   /* (a phone: one line, the box at the top leaves no room for two) */
        pb ? [['r-pb', 'peptide bond', [r.position.clone().addScaledVector(F.up, 0.0176)], { sides: [-1] }]] : []), pb ? [] : [props.rib]);
      const s0 = quest.session, n0 = mitoStepN, pb = lvHere('ib') && colors.length > 1; fin(pb);   /* (the last bond is named for a second too) */
      if (pb) setTimeout(() => { if (quest.session === s0 && mitoStepN === n0) fin(false); }, 1300); }
    rideTag(() => r.position.clone().addScaledVector(F.up, -0.019), () => soFarT(colors.length), true);
    quest.say('The ribosome reads the copy and joins the amino acids in its order: the start of the amylase chain. Each amino acid is about 1 nm across.', 'ok');
    state.use('amino'); state.use('mrna');
    if (courseOn()) await quest.next();
  }
  /* the chain as translate leaves it, for a pupil who comes back to the last step */
  const ribChain = r => { const F = ribFrame(), cols = CODES.map(c => c[0]); return xray(keep(chain(cols.map((_, q) => r.position.clone().addScaledVector(F.up, (17 + 1.15 * (cols.length - 1 - q)) / 1000).addScaledVector(F.right, ((q % 2) - 0.5) * 0.0008)), cols, TSZ.bead))); };
  /* another ribosome close by, on another copy, making a protein with no signal: it stays free in the cytosol, up on the
     right, away from the membrane (clear of the corner box at the top left, of this one's chain, and of where this one
     goes: 28 nm to the right, 46 nm above the membrane) */
  function freeRib() {
    const a = rp(22, 10), b = rp(85, 24), curve = new THREE.CatmullRomCurve3([a, a.clone().lerp(b, 0.35).addScaledVector(ribFrame().up, 0.0012), a.clone().lerp(b, 0.7).addScaledVector(ribFrame().up, -0.001), b]);
    const m = keep(ribbon(curve, { radius: TSZ.mrna, segs: 120 })); m.userData.grow(1); props.copy2 = curve;
    const at = curve.getPointAt(0.5), dir = b.clone().sub(a).normalize(), up = new THREE.Vector3().crossVectors(ribFrame().rd, dir).normalize();
    const t = calm(keep(token('ribosome', TSZ.rib))); t.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(dir, up, ribFrame().rd)); t.position.copy(at);
    const cols = [2, 3, 0, 2, 1, 3, 1], c = keep(chain(cols.map((_, q) => at.clone().addScaledVector(up, (17 + 1.15 * (cols.length - 1 - q)) / 1000).addScaledVector(dir, ((q % 2) - 0.5) * 0.0008)), cols, TSZ.bead));
    fadeIn([m, t, c]);   /* (17 Nov 2026: it comes into the still picture over 0.6 s; it had come in one frame) */
    return (props.free = { t, c, up });
  }
  async function where() {
    await ribClose();
    nucStep();
    if (!props.copy) makeCopy();
    const r = props.rib || makeRib(CODES.length - 1), F = ribFrame();
    const ch = props.chain || (props.chain = ribChain(r));
    /* (17 Nov 2026: the signal that the step speaks of is named on the chain's first amino acids, for every pupil; its
       card, with IB on, is the place's line beyond the guide on the signal sequence) */
    const sig = () => { const b = ch.children[0].getWorldPosition(new THREE.Vector3()), a = ch.children[1].getWorldPosition(new THREE.Vector3()); return ['r-sig', 'signal', [b, a], { sides: [1, 1] }]; };
    ribNames([['r-copy', 'the copy (mRNA)', copySpots()], ribMem(), ['r-rib', 'ribosome', ...edge(r.position.clone().addScaledVector(F.up, 0.009), 0.0135)], sig()]);
    await quest.choose(['On the rough ER', 'Here, floating in the cytosol', 'Inside the nucleus'], 0, async (i) => {
      if (i === 1) quest.say('<p>Then amylase would stay in the cytosol, and it could never reach a vesicle or leave the cell.</p><p>Proteins that leave the cell are made on the <b>rough ER</b>.</p>', 'no');
      else quest.say('Ribosomes make proteins in the cytoplasm, never inside the nucleus. Because of its signal, this one is taken to the <b>rough ER</b>.', 'no');
      await wait(300);
    });
    /* both paths (Daniel, 11 Nov 2026: "show both things, that the ribosomes go into the cytosol, but they can also go
       into the rough ER"): another ribosome close by makes a protein with no signal, so it stays free in the cytosol; this
       one, whose chain starts with a signal, goes down to the membrane of the rough ER with its copy, turning its large
       part (where the chain leaves) to the membrane, to where Dock begins at the rough ER (ep(-28, 46)) */
    const o = props.free || freeRib();
    /* (IB at HL, B2.2.7, on the two names: what each ribosome's protein is for; SL and the others keep the Year 7 names.
       Your ribosome gets its words only once it is at the membrane: until then it is as free as the other one, and
       B2.2.7 speaks of ribosomes bound to the rough ER: the science read, 18 Nov 2026) */
    const WF = { w: { hl: 'free ribosome:<br>its protein stays<br>in the cell' } }, WM = { w: { hl: 'your ribosome:<br>its protein<br>is secreted', card: 'r-mine' } };
    const withW = ([sp, o], w) => [sp, Object.assign({}, o, w)];
    /* (the other ribosome's name stands below it: beside it the HL name, two lines long, had no room between the two
       ribosomes and was left out) */
    /* (a phone: the two ribosomes stand against each other and the corner box covers the top, so a name beside or under
       either one lay on the other and was left out, before today too. There each name is two short lines: the other
       ribosome's under its lower right, yours under it and, at the membrane, on its left; the HL words stay on the
       cards: the probe of 18 Nov 2026) */
    const FU = () => ribFrame().up, FR = () => ribFrame().right, rW = () => r.getWorldPosition(new THREE.Vector3());
    const nmFree = (mine = true) => PHONE() ? (mine ? ['r-free', 'a free<br>ribosome', [o.t.position.clone().addScaledVector(FR(), 0.012).addScaledVector(FU(), -0.010)], { aside: false, up: 1, len: 12 }]
        : ['r-free', 'a free ribosome', [o.t.position.clone().addScaledVector(FR(), -0.015).addScaledVector(FU(), -0.0054)], { sides: [-1] }])   /* (at the membrane yours stands under it: its name goes to its left, one line) */
      : ['r-free', 'a free ribosome', [o.t.position.clone().addScaledVector(FU(), -0.012), o.t.position.clone().addScaledVector(FU(), -0.012).addScaledVector(FR(), 0.004)], Object.assign({ aside: false, up: 1, len: 42 }, WF)];   /* (its line ends inside the other ribosome: just under it, it had ended on the pupil's own copy, which passes there) */
    const nmMine = mine => PHONE() ? (mine ? ['r-rib', 'your<br>ribosome', [rW().addScaledVector(FU(), -0.0135)], { aside: false, up: 1, len: 12 }] : ['r-rib', 'your<br>ribosome', [rW().addScaledVector(FR(), -0.0152).addScaledVector(FU(), -0.007)], { sides: [-1], w: { card: 'r-mine' } }])
      : ['r-rib', 'your ribosome', ...withW(edgeL(rW().addScaledVector(FU(), mine ? 0.009 : -0.009), 0.0135), mine ? {} : WM)];
    const names = mine => ribNames([nmFree(mine), nmMine(mine), ribMem(), sig()], [r, o.t, ch]);   /* (r in its pivot: its world position) */
    cardOff();   /* (a card left open would stand where the other ribosome's name goes) */
    names(true);
    quest.say('<p>Not every protein has this signal. This other ribosome makes a protein with no signal: it stays in the cytosol, and its protein stays in the cytosol too.</p><p>Your chain starts with a signal, so your ribosome is taken to the membrane of the rough ER.</p>', 'ok');
    await wait(R.TEST ? 0 : 2200);
    const to = ep(-28, 46), d = to.clone().sub(r.position);
    const pivot = keep(new THREE.Group()); pivot.position.copy(r.position); pivot.attach(r); pivot.attach(ch);
    if (props.trna) { const a = props.trna.position, b = pivot.position.clone().addScaledVector(F.up, 0.017), d = b.clone().sub(a);   /* (the carrier that holds the chain, and its line to the chain; the ribosome is in its pivot now: the pivot's place) */
      const th = keep(new THREE.Mesh(new THREE.CylinderGeometry(0.00014, 0.00014, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, depthTest: false, depthWrite: false }))); th.renderOrder = 8;
      th.position.copy(a).add(b).multiplyScalar(0.5); th.scale.y = d.length(); th.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); pivot.attach(props.trna); pivot.attach(th); }
    /* (while it turns and moves, only what stays still keeps a name with a line; the ribosome carries a label) */
    cardOff(); ribNames([nmFree(), ribMem()], [r, o.t, ch]);
    const mv = rideTag(() => pivot.position, () => 'your ribosome', true);
    const copy = props.copyObj, c0 = copy ? copy.position.clone() : null, p0 = pivot.position.clone(), t0 = performance.now(), s0 = quest.session;
    /* it rolls over on its copy (about the copy's own line), so that its large part faces the membrane */
    await live(new Promise(res => {
      const f = () => {
        if (quest.session !== s0) return res();
        const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 2400), e = k * k * (3 - 2 * k);
        pivot.position.copy(p0).addScaledVector(d, e); pivot.quaternion.setFromAxisAngle(F.right, Math.PI * e);
        if (copy) copy.position.copy(c0).addScaledVector(d, e);
        world.kick(); if (k < 1) requestAnimationFrame(f); else res();
      };
      f();
    }));
    mv.off(); names(false);
    /* (with a course on, the step waits here: the names of the two ribosomes and their cards had stood for 2 s) */
    if (courseOn()) await quest.next(); else await wait(R.TEST ? 0 : 1600);
    /* from far away the ribosome is far too small to see: a glow shows it, at the rough ER */
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    /* (17 Nov 2026: the glow in the colour of the nucleolus's two parts, not the rough ER's ribosomes' gold, and it keeps
       its name, "your ribosome", until the pupil leaves: it had been one more golden dot among them, with no name) */
    farGlow(r, 0.05, PARTGLOW); farGlow(r, 0.02, 0xffffff);
    rideTag(() => r.getWorldPosition(new THREE.Vector3()), () => 'your ribosome' + (lvHere('ib') && ibHL() ? ' · its protein is secreted' : ''));
    await nanoOut(world.P.ribosome.view);
    await quest.gain('chain', to);
    await quest.next('Back to the map');
  }

  /* ---------------- rough ER ---------------- */
  const RER = world.P.rer.center;
  /* the point of the rough ER that the camera sees in the middle of its view, and the sheet's face there (towards the
     camera): the ribosome docks there; "inside" is just behind that face */
  const ray = new THREE.Raycaster();
  function rerFace() {
    if (props.face) return props.face;
    const cam = new THREE.Vector3(...world.P.rer.view.pos), at = new THREE.Vector3(...world.P.rer.view.at);   /* the view's own, not the camera's now */
    ray.set(cam, at.clone().sub(cam).normalize());
    const sheets = W.groups.rer.children.filter(m => m.name.startsWith('rer') && !m.isInstancedMesh);
    const hit = ray.intersectObjects(sheets, false)[0];
    const p = hit ? hit.point : at, n = hit && hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : cam.clone().sub(at).normalize();
    if (n.dot(cam.clone().sub(p)) < 0) n.negate();
    /* along: in the membrane, towards the view's camera, so that a close view at the membrane's eye level looks from the side
       the camera came from (11 Nov 2026: along had been the membrane's direction nearest the world's up; a camera looking up
       from it, as at the ribosome place, then pointed almost straight up, where the controls keep it 0.15 rad from the pole
       (world.limits), and it had stood 23 nm below the membrane) */
    const toCam = cam.clone().sub(p), along = toCam.addScaledVector(n, -toCam.dot(n)).normalize(), right = new THREE.Vector3().crossVectors(along, n).normalize();
    return (props.face = { p, n, right, along });
  }
  /* offsets in nm: x along the membrane (across the picture), y out of it (up: the cytosol; down, negative: inside the ER) */
  const ep = (x, y, z = 0) => { const f = rerFace(); return f.p.clone().addScaledVector(f.right, x / 1000).addScaledVector(f.n, y / 1000).addScaledVector(f.along, z / 1000); };
  const dockAt = () => ep(0, 0);
  const insideAt = () => ep(4, -16);
  /* the membrane close up, at its true thickness, as a section (a textbook's diagram): cut where the ribosome docks, it
     runs away from the camera from there, so its cut face shows its two layers of lipids: the heads (pink, about 1 nm)
     on each side of the tails (paler), about 6 nm in all; a piece 1 µm wide, its ends out of the picture. The channel is a
     protein through the membrane, cut open too, with the tunnel that the chain goes through (Daniel's "be respectful
     with size": seen from above, its flat top had filled the picture, and neither its thickness nor its inside showed) */
  const BUD = { x: 140, rho: 32, r: 4, neck: 1, far: 480 };   /* nm: where the vesicle buds (away from the channel and from the copy of the gene, which lies 20 nm above the membrane as far as 90 nm each way), the vesicle's radius (the middle of its membrane), the curve at its neck, how far the cut face is drawn */
  function membrane() {
    if (props.mem) { props.mem.visible = true; (props.mem.userData.slabs || []).forEach(m => { m.visible = true; }); return props.mem; }
    const f = rerFace(), g = new THREE.Group(); g.position.copy(f.p);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.right, f.n, f.along.clone().negate()));   /* x across, y out to the cytosol, z away from the camera */
    const head = magicStandard({ color: 0xff9ac8, roughness: 0.5 }, { rim: 0xffd6ea, rimK: 0.4 }), tail = magicStandard({ color: 0xfff0f5, roughness: 0.7 }, { rim: 0xffffff, rimK: 0.15 });
    const prot = magicStandard({ color: 0x5fe0d0, emissive: 0x1a6a60, emissiveIntensity: 0.4, roughness: 0.4 }, { rim: 0xc8fff6, rimK: 0.5 });
    const box = (x0, x1, y0, y1, z0, z1, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry((x1 - x0) / 1000, (y1 - y0) / 1000, (z1 - z0) / 1000), m); b.position.set((x0 + x1) / 2000, (y0 + y1) / 2000, (z0 + z1) / 2000); g.add(b); };
    const slab = (x0, x1, z0, z1) => { box(x0, x1, 1.8, 3, z0, z1, head); box(x0, x1, -1.8, 1.8, z0, z1, tail); box(x0, x1, -3, -1.8, z0, z1, head); };
    /* (while a vesicle buds, these boxes are hidden and budMake draws the membrane's cut face itself: seen from the
       membrane's own level, as here, a box shows only its cut face, so the two look the same) */
    slab(-500, -3.6, 0, 500); slab(3.6, 500, 0, 500); slab(-3.6, 3.6, 6, 500); g.userData.slabs = g.children.slice();
    box(-3.6, -1.1, -3.6, 3.6, 0, 6, prot); box(1.1, 3.6, -3.6, 3.6, 0, 6, prot); box(-1.1, 1.1, -3.6, 3.6, 4.6, 6, prot);
    return (props.mem = keep(g));
  }
  /* the camera's eye level with the middle of the membrane, looking a little up (about 5°) at what it frames: from there
     the membrane is only its cut face, a thin band between the cytosol above and the inside below. From 10° above, its
     top surface stretched back as a wide pink plane and the name "cytosol" stood on it (Daniel, 10 Nov 2026: "it's
     labeling the membrane itself rather than the cytosol") */
  const RER_AT = 14, RER_DIST = 0.17;
  const rerView = () => { const f = rerFace(), a = -Math.asin(RER_AT / 1000 / RER_DIST), cd = f.along.clone().multiplyScalar(Math.cos(a)).addScaledVector(f.n, Math.sin(a)).normalize(); return { at: ep(0, RER_AT), dir: cd, up: f.n.clone(), dist: RER_DIST }; };
  const rerClose = () => { membrane(); return nanoIn(rerView(), NEAR_HIDE().concat([W.groups.rer])); };
  /* solid: the large parts no name may cover (the ribosome, before it docks too, while it waits in the cytosol; the vesicle) */
  /* (18 Nov 2026, the courses on the rough ER's picture: each name through cName: IB's own words ("polypeptide"; at HL
     "signal sequence", D1.2.18), IGCSE's grey mark on the names 0610 does not use, a card where a line of a course that is
     on speaks of the part. `o.w`: this name's own course words, over RERW's. rerNear: the same for a closer view) */
  /* ('e-cyt', IGCSE: 0610's own word is cytoplasm, 2.1.1; the Word bank: "the jelly-like fluid of the cytoplasm") */
  const RERW = { 'e-chain': { ib: 'polypeptide' }, 'e-sig': { hl: 'signal sequence' }, 'e-cyt': { igcse: 'cytosol: the fluid<br>of the cytoplasm' } };
  const BOUNDW = () => (PHONE() ? 'bound<br>ribosome' : 'bound ribosome');   /* (a phone: in two lines, or the name has no room beside the ribosome; and a second pair of spots, clear of its outline) */
  const rerItem = ([key, html, spots, o]) => { const { w, ...opt } = o || {}; return cName(Object.assign({ key, free: true, aside: true, html: `<span class="nm__t">${html}</span>`, spots }, opt), Object.assign({}, RERW[key], w)); };
  const rerNames = (list, solid = [props.rib]) => { nucAgain = () => { if (ribCode) ribCode(); rerNames(list, solid); }; quest.names.set(list.filter(Boolean).map(rerItem), HUDR(), lr(ep(-34, 0), ep(34, 0)), solid.filter(Boolean)); };
  const rerNear = (F, list, solid = [], w = 40, c = F.p) => { nucAgain = () => rerNear(F, list, solid, w, c); quest.names.set(list.map(rerItem), HUD(), Object.assign(lr(c.clone().addScaledVector(F.right, -w / 1000), c.clone().addScaledVector(F.right, w / 1000)), { on: true }), solid.filter(Boolean)); };
  /* the ribosome's copy of the gene, named (18 Nov 2026, the second science read: "the orange strand is unnamed in
     every frame", though the step's words speak of it); not on a phone, whose picture has no room for one more name */
  const copyName = () => (PHONE() || !props.copy || !props.copyObj ? null : ['e-copy', 'copy of the gene', [0.86, 0.14, 0.8, 0.2].map(u => props.copy.getPoint(u).add(props.copyObj.position)), { aside: false, up: -1, len: 20, w: { igcse: 'mRNA:<br>the copy of the gene', ib: 'mRNA' } }]);
  /* the membrane's name below its cut face, the channel's below its own (a name on or beside a thin part hides it) */
  /* (a phone's picture is about 130 nm wide: its spots nearer the middle, last, and shorter words) */
  /* (a phone: 38 nm from the channel, so that the name is clear of the chain under the channel) */
  const memName = () => ['e-mem', 'membrane of the rough ER', PHONE() ? [ep(38, 0), ep(-38, 0)] : [ep(-60, 0), ep(-50, 0), ep(50, 0), ep(60, 0), ep(-26, 0), ep(26, 0)], { up: 1, small: '<span class="nm__t">rough ER<br>membrane</span>' }];
  const chName = () => ['e-ch', 'channel', [ep(0, -3.6)], { up: 1, len: 40 }];
  /* the two sides' names away from the middle, where the ribosome, the chain and amylase are (on a phone the inside's name
     had touched the chain) */
  const twoEdges = (a, b) => [a[0].concat(b[0]), { sides: a[1].sides.concat(b[1].sides) }];
  const sides = () => [['e-cyt', 'cytosol', ...twoEdges(twoEdges(edge(ep(0, 50), 0.05), edge(ep(0, 42), 0.02)), edge(ep(0, 25), 0.02))],
    (([sp, o]) => ['e-in', 'inside the rough ER', sp, Object.assign(o, { small: '<span class="nm__t">inside the<br>rough ER</span>' })])(edge(ep(0, -33), 0.045, 0.016))];
  /* the ribosome docked: its large part on the channel (turned so that the large part faces the membrane) */
  const seat = () => ep(0, 3 + 16.5);
  const makeDocked = () => { const t = calm(keep(token('ribosome', TSZ.rib))); t.quaternion.setFromUnitVectors(V(0, 1, 0), rerFace().n.clone().negate()); t.position.copy(seat()); return (props.rib = t); };
  /* the ribosome's copy of the gene (mRNA): a ribosome that is making a chain stays on its copy (the expert review, 11 Nov
     2026: at the rough ER it had none, while the ribosomes beside it had theirs), so a copy runs through it, between its two
     parts, across the picture, and moves with it; when the chain is finished the ribosome leaves it, and it stays */
  const rerCopy = c => {
    if (props.copyObj) { props.copyObj.position.copy(c).sub(props.copyAt); return props.copyObj; }
    const f = rerFace(), curve = new THREE.CatmullRomCurve3([...Array(13)].map((_, i) => c.clone().addScaledVector(f.right, (-90 + i * 15) / 1000).addScaledVector(f.n, 1.4 * Math.sin(i * 0.9) / 1000)));
    const m = keep(ribbon(curve, { radius: TSZ.mrna, segs: 220 })); m.userData.grow(1); props.copy = curve; props.copyObj = m; props.copyAt = c.clone(); return m;
  };
  async function dock() {
    await toPlace('rer');
    const f = rerFace();
    const r = calm(keep(token('ribosome', TSZ.rib))); r.quaternion.setFromUnitVectors(V(0, 1, 0), f.n.clone().negate()); r.position.copy(ep(-28, 46)); props.rib = r;
    const cp = rerCopy(r.position);
    /* the signal hangs from the ribosome's exit (the large part's foot, 16.5 nm below its middle), out in the cytosol, where
       the particle binds it: its 15 red amino acids in a short line toward the membrane (Daniel, 15 Nov 2026: "I didn't see
       the signal anywhere"; before, it lay across the channel's mouth already, under the ribosome, where nothing showed it).
       It moves with the ribosome as it docks, into the channel, and then takes its place there (hairSet below). */
    const sig = theSig(); sig.position.set(0, 0, 0);
    const down = f.n.clone().negate(), sigAt = m => r.position.clone().addScaledVector(down, (16.5 + 0.6 + m * 0.38) / 1000).addScaledVector(f.right, 0.45 * Math.sin(m * 0.9) / 1000);
    for (let m = 0; m < SIG.n; m++) { const v = sigAt(m); sig.userData.put(m, v.x, v.y, v.z); } sig.userData.done(); world.kick();
    await rerClose();   /* (the ribosome is there before the dive: it comes into sight as the camera comes near) */
    nucStep();
    /* the signal named, until the ribosome docks (step 1 says what it is and how the ribosome comes here) */
    rerNames([memName(), ...sides(), chName(), ['e-rib', 'ribosome', ...edge(r.position, 0.0135)], ['e-sig', 'signal', [sigAt(9)]]]);
    await press(() => r.position.clone().addScaledVector(f.n, 0.024), 'Dock', { w: 'dock' });
    /* (while the ribosome moves, its name and the signal's are off the picture: they stood where it had been, their
       lines ending on empty cytosol, until it sat on the channel: the picture inspection's independent read, 28 Nov 2026) */
    rerNames([memName(), ...sides(), chName()]);
    await Promise.all([tween(r, { to: seat(), ms: 1300 }), tween(sig, { to: seat().sub(r.position), ms: 1300 }), tween(cp, { to: cp.position.clone().add(seat().sub(r.position)), ms: 1300 })]);
    sig.position.set(0, 0, 0); hairSet(null, sig, 0);
    /* (IB at HL, B2.2.7: on the channel it is a bound ribosome; its card is the line) */
    rerNames([memName(), ...sides(), chName(), (([sp, o]) => ['e-rib', 'ribosome', sp, Object.assign({}, o, { w: { hl: BOUNDW(), card: 'e-bound' } })])(edge(seat(), 0.0135, 0.02))]);
    quest.say('The ribosome sits on a channel in the membrane of the rough ER, and the signal is now in the channel. The membrane is about 6 nm thick: two layers of lipids.', 'ok');
    if (courseOn()) await quest.next();   /* (with a course on, the step waits while its line is read) */
  }
  /* ---- the chain itself, drawn whole (12 Nov 2026) ----
     Daniel, of the film "From DNA to protein - 3D": "I really like when it shows at the end how the different proteins,
     when they kind of form the 3D structure, that 3D structure changes into what the animation itself shows the enzymes
     … so … the students understand, oh, so what we were looking at … were enzymes, or … chains of amino acids".
     Before: a few large beads stood for the chain ("only part of the chain is drawn"), and Fold shrank them and scaled up
     a lump. Now every amino acid of amylase is one bead (496, each 0.6 nm across: actors.js strand), and the pupil sees
     the same chain all the way: it grows out of the channel as the ribosome joins amino acids, lies loose inside the
     rough ER, folds bead by bead into amylase's measured shape (PDB 1SMD: actors.js amylase), and a smooth surface then
     grows over it: the lump the game draws for amylase from then on.
     The chain's way (amylase().way, in ep's own offsets, nm): from the top of the channel straight down through it, then
     a loose thread inside the rough ER. s is how far along that way the chain's first amino acid has come, in amino
     acids: amino acid j is at point s - j of the way (not yet in the channel: not drawn), so the whole chain moves along
     as it grows. While the ribosome works, s = the count - 60: the 15 amino acids of the signal are not part of amylase,
     and the newest 45 are still inside the ribosome. When the ribosome releases the chain, its last amino acids leave
     the channel too (s = STRAND_FREE). Proof: tools/fold-check.mjs */
  const STRAND_FREE = amylase().way.length / 3 - 1;
  const wayAt = (i, v = new THREE.Vector3()) => { const A = amylase().way, f = rerFace(), k = 3 * Math.max(0, Math.min(STRAND_FREE, Math.round(i))); return v.copy(f.p).addScaledVector(f.right, A[k] / 1000).addScaledVector(f.n, A[k + 1] / 1000).addScaledVector(f.along, A[k + 2] / 1000); };
  function strandSet(st, s) {
    const A = amylase(), Wy = A.way, f = rerFace(), v = new THREE.Vector3();
    for (let j = 0; j < A.n; j++) {
      const t = s - j;
      if (t < 0) { st.userData.put(j, 0, 0, 0, 0); continue; }
      const a = Math.min(STRAND_FREE, Math.floor(t)), b = Math.min(STRAND_FREE, a + 1), u = Math.min(1, t - a);
      v.copy(f.p).addScaledVector(f.right, (Wy[3 * a] + (Wy[3 * b] - Wy[3 * a]) * u) / 1000).addScaledVector(f.n, (Wy[3 * a + 1] + (Wy[3 * b + 1] - Wy[3 * a + 1]) * u) / 1000).addScaledVector(f.along, (Wy[3 * a + 2] + (Wy[3 * b + 2] - Wy[3 * a + 2]) * u) / 1000);
      st.userData.put(j, v.x, v.y, v.z);
    }
    st.userData.s = s; st.userData.done(); world.kick();
  }
  /* the chain as it stands now (made if the step before did not leave it: a game opened again at this step) */
  const theStrand = s => { let st = props.strand; if (!st) { st = props.strand = keep(strand(amylase().n, TSZ.res, amylase().kinds)); strandSet(st, s); } return st; };
  /* a point of the chain to name: half-way along the part that is inside the rough ER */
  const chainSpot = () => { const st = props.strand, s = st ? st.userData.s : STRAND_FREE; return wayAt(Math.max(21, s - Math.min(s, amylase().n) / 2)); };
  /* ---- the signal, and the chain that it holds until the cut (12 Nov 2026) ----
     The expert review, 12 Nov 2026: "The cut is nearly invisible: a pale dot leaves the enzyme and fades. Colour the 15
     signal beads and name them 'signal'. Leave them in the membrane after the cut, with 'The cell breaks it down'"
     (Weihofen et al. 2002, Science 296:2215: the signal peptide stays in the membrane and is broken down there).
     Before, two large beads stood for the signal and were not joined to the chain, so nothing was seen to be removed.
     Now the signal is the chain's own first 15 amino acids, 15 red beads of the chain's size, and it is drawn where it
     is: held at the channel's side, across the membrane (the channel's gate; its first amino acid at the cytosol's
     side, where it stays from the start). The chain behind it is joined to its end, so until the cut the
     chain grows as a loop (Alberts, Molecular Biology of the Cell, ch. 12: the signal and the chain enter the channel
     as a loop). Cut goes closer (the signal is about 5 nm long): the enzyme, in the membrane beside the channel, cuts
     where the signal joins the chain; the chain's start comes free inside the rough ER, the signal stays, and it fades
     while the ribosome joins the other amino acids (broken down).
     Places in ep's offsets (nm). t is how far along the way an amino acid is, in amino acids from the top of the
     channel: the channel, then the bend (never fewer than SIG.turn amino acids: its two ends are 3.6 nm apart), then
     the channel's side (hairPlan). The chain's amino acid j is at t = s - j (as in strandSet);
     the signal's are at s + 1 … s + 15. Proof: tools/fold-check.mjs (H: the chain is never broken, the signal stays) */
  const SIG = { n: 15, x: -2.3, y: -3.3, z: 0.45, turn: 12, color: 0xff5a4f }, TUN = 19;   /* (turn: from the channel's foot to the signal's end is 3.6 nm in a straight line, so the turn needs 12 amino acids, 4.6 nm; with 8 the beads stood 0.56 nm apart: fold-check H) */
  const wayNm = (t, o) => { const Wy = amylase().way, a = Math.max(0, Math.min(STRAND_FREE, Math.floor(t))), b = Math.min(STRAND_FREE, a + 1), u = Math.max(0, Math.min(1, t - a)); for (let k = 0; k < 3; k++) o[k] = Wy[3 * a + k] + (Wy[3 * b + k] - Wy[3 * a + k]) * u; return o; };
  /* (the second expert review, 13 Nov 2026: "the red start goes down the channel into the rough ER, turns, and re-enters
     the membrane from inside. In a real cell the start never enters the rough ER: it binds the channel's side from the
     cytosol side and only the chain behind it loops in": Voorhees and Hegde 2016, Science 351:88. So the signal's first
     amino acid stays at the top of the channel's side, on the cytosol's side, from the start. While few amino acids are
     out, the signal lies from there across the channel's mouth to the ribosome; as more come, the bend between the two
     goes down, one leg at the channel's side (the signal, which never moves again once it is there) and one in the
     channel; when the signal is all in its place (s = TUN + SIG.turn), the bend is under the membrane, and from then on
     it is the loop that grows.)
     the bend, l amino acids long (0.38 nm each), from M (in the channel) round to A (at the channel's side); it hangs
     below both, and once it is a loop inside the rough ER it widens and leans to where the loose chain will lie */
  function loopCurve(l, M, A) {
    const len = l * 0.38, k = Math.max(0, l - SIG.turn), w = Math.min(3.4, 0.2 + 0.05 * k), lean = Math.min(3, 0.045 * k), mx = (M[0] + A[0]) / 2 - lean, y0 = Math.min(M[1], A[1]);
    const make = D => new THREE.CatmullRomCurve3([V(M[0], M[1], M[2]), V(M[0] + w * 0.5 - lean * 0.3, y0 - 0.5 * D, M[2] + 0.3), V(mx, y0 - D, (M[2] + A[2]) / 2), V(A[0] - w - lean * 0.6, y0 - 0.5 * D, A[2] - 0.3), V(A[0], A[1], A[2])], false, 'centripetal');
    let lo = 0.05, hi = len, c = null;
    for (let i = 0; i < 14; i++) { const D = (lo + hi) / 2; c = make(D); c.arcLengthDivisions = 60; if (c.getLength() < len) lo = D; else hi = D; }
    return c;
  }
  /* how the amino acids that are out lie, when the chain's first one is s along: T of them in all (with the signal), u
     in the channel, l in the bend, g at the channel's side (the signal's own place, from its top down) */
  const SIG_TOP = SIG.y + SIG.n * 0.38;
  function hairPlan(s) {
    const T = s + SIG.n, g = s < TUN + SIG.turn ? Math.max(0, (s - 1) / 2) : SIG.n, l = s < TUN + SIG.turn ? SIG.turn : s - TUN, u = T - l - g;
    return { T, g, l, u, c: loopCurve(l, wayNm(u, []), [SIG.x, SIG_TOP - 0.38 * g, SIG.z]) };
  }
  /* where an amino acid is while the signal holds the chain: at(t) gives its place in the world (one vector, used again) */
  function hairAt(s, off) {
    const f = rerFace(), H = hairPlan(s), q = [], v = new THREE.Vector3(), p = new THREE.Vector3();
    return t => {
      if (t <= H.u) { wayNm(t, q); p.set(q[0], q[1], q[2]); } else if (t <= H.u + H.l) H.c.getPointAt((t - H.u) / H.l, p); else p.set(SIG.x, SIG_TOP - 0.38 * (H.T - t), SIG.z);
      v.copy(f.p).addScaledVector(f.right, p.x / 1000).addScaledVector(f.n, p.y / 1000).addScaledVector(f.along, p.z / 1000); if (off) v.add(off); return v;
    };
  }
  function hairSet(st, sig, s, off) {
    const at = hairAt(s, off);
    if (st) { const n = amylase().n; for (let j = 0; j < n; j++) { const u = s - j; if (u < 0) st.userData.put(j, 0, 0, 0, 0); else { const v = at(u); st.userData.put(j, v.x, v.y, v.z); } } st.userData.s = s; st.userData.done(); }
    if (sig) { for (let m = 1; m <= SIG.n; m++) { const v = at(s + m); sig.userData.put(m - 1, v.x, v.y, v.z); } sig.userData.done(); }
    world.kick();
  }
  const theSig = () => {
    if (props.sig) return props.sig;
    const m = keep(strand(SIG.n, TSZ.res, null)), c = new THREE.Color(SIG.color);
    for (let i = 0; i < SIG.n; i++) m.setColorAt(i, c); m.instanceColor.needsUpdate = true; m.material.emissive.setHex(0x8a1c14); m.material.emissiveIntensity = 0.8; m.userData.kind = 'signal';
    return (props.sig = m);
  };
  /* a point of the loop to name: its lowest part */
  const loopSpot = s => { const p = hairPlan(s).c.getPointAt(0.5); return ep(p.x, p.y, p.z); };
  /* a move of ms milliseconds: fn(k) at every frame, k from 0 to 1 (with Reduce motion: its end at once) */
  const play = (ms, fn) => { const t0 = performance.now(), s0 = quest.session; return live(new Promise(res => { const f = () => { if (quest.session !== s0) return res(); const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms); fn(k); world.kick(); if (k < 1) requestAnimationFrame(f); else res(); }; f(); }), s0); };
  /* the ribosome joins amino acids from one count to another: a counter under it, and the chain growing out of the
     channel, inside the ER, one bead for each amino acid joined (hair: the signal still holds the chain's start) */
  /* (18 Nov 2026: the count's words follow the course: IGCSE "amino acids assembled" (17.1.8's verb); IB a second line,
     "peptide bonds made · water molecules released", one fewer than the amino acids (B1.2.2: each new peptide bond
     releases one molecule of water; "made": after the cut the chain has one bond fewer than were made). `slow`: the first amino acids are joined one by one, 0.6 s each, so that a single one is
     seen to join (the count ran from 61 to 150 in 2.5 s); `onJoin(n)`: at each of those) */
  /* (a phone: the second line is "peptide bonds" alone: with both, the count lay on the membrane's name and on the switch
     at the picture's foot; the water molecules are on the picture, named) */
  const countWords = n => (lvHere('ib') ? 'amino acids linked: ' : lvHere('igcse') ? 'amino acids assembled: ' : 'amino acids joined: ') +   /* (IB: "linked", B1.2.2's word, as the button says; 19 Nov 2026) */ n + (lvHere('ib') ? `<small class="code__n">peptide bonds made: ${n - 1}${PHONE() ? '' : ` · water molecules released: ${n - 1}`}</small>` : '');
  async function count(r, from, to, ms, hair, slow = 0, onJoin = null) {
    /* (a phone: under the membrane, away from the channel and the chain; above the ribosome is the corner box, and it had
       stood on the channel: the second expert review, 13 Nov 2026) */
    const counter = quest.hot(() => (PHONE() ? ep(46, lvHere('ib') ? -4 : -9) : r.position.clone().addScaledVector(rerFace().n, 0.024)), countWords(from), { cls: 'count', side: PHONE() ? 'b' : 't' }); counter.el.disabled = true;
    let shown = from, last = from;
    ribCode = () => { const sp = counter.el.isConnected && counter.el.querySelector('span'); if (sp) sp.innerHTML = countWords(shown); };
    const t0 = performance.now(), s0 = quest.session, st = theStrand(from - 60), sig = hair ? theSig() : null, SL = slow * 600, T = SL + ms;
    await live(new Promise(res => {
      const f = () => {
        if (quest.session !== s0) return res();
        const t = R.FAST ? T : Math.min(T, performance.now() - t0), q = t / 600, c = t < SL ? from + Math.floor(q) + smooth(0.35, 0.9, q - Math.floor(q)) : from + slow + (to - from - slow) * (t - SL) / ms;
        const n = t < SL ? Math.floor(c + 0.05) : Math.round(c);
        if (n !== shown) { shown = n; counter.el.querySelector('span').innerHTML = countWords(n); }
        while (onJoin && last < Math.min(n, from + slow)) onJoin(++last);
        if (hair) hairSet(st, sig, c - 60); else strandSet(st, c - 60);
        if (t < T) requestAnimationFrame(f); else res();
      };
      f();
    }), s0);
    return counter;
  }
  /* a water molecule leaves the ribosome's large part into the cytosol (IB, B1.2.2): the peptide bond forms there, on the
     cytosol's side of the membrane, never inside the rough ER; the first one carries the words */
  /* (from the large part's own edge, 15.5 nm from its middle; the first one to the picture's left, away from the
     ribosome's name: ep's right runs to the picture's left) */
  const rerWater = (r, k) => { const f = rerFace(), sd = k % 2 ? -1 : 1, a = r.position.clone().addScaledVector(f.n, -0.009).addScaledVector(f.right, sd * 0.0145), w = keep(token('water', 0.0003));   /* (9 nm under the ribosome's middle: the large part's own side, clear of the copy of the gene, which runs between the two parts) */ w.position.copy(a); haloSprite(w, 0.003, 0xbfe6ff);
    /* (it moves level, away from the large part, never up to the copy of the gene; its words stand under it; with Reduce
       motion it stays 4 nm from the large part) */
    const to = a.clone().addScaledVector(f.right, sd * (R.FAST ? 0.004 : 0.012 + 0.002 * k)).addScaledVector(f.n, -0.0006 * k);
    const tg = k === 0 ? rideTag(() => w.position, () => lvHere('ib') ? 'water · condensation reaction' : '', true) : null;
    tween(w, { to, ms: 1300 }).then(() => { if (R.FAST && k === 0) return; if (tg) tg.off(); return tween(w, { to: to.clone().addScaledVector(f.right, sd * 0.003), ms: 500, fade: 0 }).then(() => drop(w)); }).catch(() => {}); };
  const ribAt = () => props.rib || makeDocked();
  async function grow() {
    await rerClose();
    nucStep();
    /* the signal leaves the ribosome's tunnel when about 60 amino acids are joined: the count starts there */
    const r = ribAt(); rerCopy(r.position);
    const sig = theSig(); if (!props.strand) hairSet(null, sig, 0);
    /* (IB at HL: it is a bound ribosome while it sits on the channel, in this step too: B2.2.7) */
    const ribName = () => (([sp, o]) => ['e-rib', 'ribosome', sp, Object.assign({}, o, { w: { hl: BOUNDW(), card: 'e-bound' } })])(edge(r.position, 0.0135, 0.02));
    rerNames([memName(), ...sides(), ribName(), copyName()]);
    await press(() => r.position.clone().addScaledVector(rerFace().n, 0.03), 'Go', { cost: COST.grow, key: 'grow', w: 'go' });
    if (PHONE() && lvHere('ib')) rerNames([...sides(), ribName()]);   /* (a phone: the count, two lines with IB, stands under the membrane where the membrane's name was: under that name it stood on the scale bar's number) */
    await count(r, 60, 150, 2400, true, 5, n => { if (lvHere('ib')) rerWater(r, n - 61); });
    rerNames([...(PHONE() && lvHere('ib') ? [] : [memName()]), ...sides(), ribName(), ['e-chain', 'the chain', [loopSpot(90)]], copyName()]);   /* (a phone with IB: the count keeps its place under the membrane) */
    quest.say('The chain grows through the channel and into the rough ER. It grows as a loop, because the channel holds the start of the chain: the signal.', 'ok');
    if (courseOn()) await quest.next();
  }
  async function cut() {
    await rerClose();
    nucStep();
    const r = ribAt(); rerCopy(r.position);
    const st = theStrand(90), sig = theSig(); sig.position.set(0, 0, 0); hairSet(st, sig, 90);
    /* the enzyme that removes the signal: a protein in the membrane beside the channel, about 5 nm. It stands at the
       membrane's inner side, where it cuts (the signal's end is there); so the signal's upper part is free of it, and
       the signal's name has room beside it */
    const enz = calm(keep(token('protein', TSZ.enz))), enzAt = ep(-6, -2.8); enz.position.copy(enzAt);
    rerNames([memName(), ...sides(), ['e-chain', 'the chain', [loopSpot(90)]]]);
    /* two presses, one for each thing that moves (the second expert review, 13 Nov 2026: three new names had 1.5 s before
       the cut): Go closer (the signal is 15 amino acids, about 5 nm long, and the cut is one bond), and there, with the
       names standing as long as the pupil reads, Cut */
    await press(() => ep(PHONE() ? 24 : -19, -8), 'Go closer', { side: 'b' });   /* (beside the loop, never on the chain) */
    FOLD.on = true; quest.names.set([], HUD());
    /* (the membrane in the upper middle of the picture and, on a wide screen, the channel to the right of the corner box,
       which is 230 px tall with its list of items open: no name may stand on the box, and the signal's name stands
       beside the signal) */
    const P = PHONE(), mid = ep(P ? -9 : 6, P ? -2.5 : -3.5);   /* (a phone: towards the enzyme's side, so that its name has room beside it) */
    await camGo(eyeLevel(foldView(mid, fitDist(P ? 27 : 34, 34), 0)), R.FAST ? 0 : 2000);
    const sigAt = ep(SIG.x, SIG.y + 0.38 * 14, SIG.z), cutAt = ep(SIG.x, SIG.y + 0.19, SIG.z);   /* (the signal's name beside its top end: its line passes above the enzyme) */
    /* (the enzyme's name level with it, on its far side from the channel: under it, the name lay on the chain) */
    const enzSpot = () => { const [sp] = edge(enzAt.clone().addScaledVector(rerFace().n, -0.0008), 0.0028), sx = q => world.project(q).x, sig = sx(sigAt); return Math.abs(sx(sp[0]) - sig) > Math.abs(sx(sp[1]) - sig) ? [[sp[0]], { sides: [1] }] : [[sp[1]], { sides: [-1] }]; };
    /* (the ribosome, the large shape over the channel, is named in this close view too: the second science read, 18 Nov 2026) */
    const ribNear = () => ['e-rib', 'ribosome', [r.position.clone().addScaledVector(rerFace().n, -0.0095).addScaledVector(rerFace().right, 0.011), r.position.clone().addScaledVector(rerFace().n, -0.0095).addScaledVector(rerFace().right, -0.011)], { sides: [1, -1], w: { hl: BOUNDW(), card: 'e-bound' } }];
    const near = chainAt => rerNear(rerFace(), [['e-sig', 'signal', [sigAt]], ['e-enz', 'cutting enzyme', ...enzSpot()], ribNear()].concat(chainAt ? [['e-chain', 'the chain', [chainAt]]] : []), [enz], 3, ep(1, -6));   /* (no name stands on the channel: 3 nm each way from its middle, a little to the far side of the signal) */
    near(loopSpot(90));
    quest.say('<p>Each bead is one amino acid. The 15 red beads are the signal: the start of the chain. The channel holds the signal at the side of the channel.</p><p>In the membrane beside the signal there is a cutting enzyme.</p>');
    await press(() => ep(P ? -17 : -13.5, -9.5), 'Cut', { side: 'b', w: 'cut' });   /* (beside the loop, under the enzyme's name) */
    /* the enzyme goes to where the signal joins the chain, cuts the bond there and goes back (so that the join is seen
       when the chain leaves); then the start of the chain leaves: every amino acid goes from its place in the loop to
       its place in the loose chain (strandSet's, the way) */
    near(null);   /* (the chain's name would stay behind while the chain moves) */
    await tween(enz, { to: enzAt.clone().lerp(cutAt, 0.45), ms: 550 });
    await wait(R.TEST ? 0 : 300);
    await tween(enz, { to: enzAt.clone(), ms: 500 });
    const at = hairAt(90), q = [], from = [], to = [], v = new THREE.Vector3();
    for (let j = 0; j <= 90; j++) { from.push(at(90 - j).clone()); wayNm(90 - j, q); to.push(ep(q[0], q[1], q[2])); }
    await play(2000, k => { const e = smooth(0, 1, k); for (let j = 0; j <= 90; j++) { v.lerpVectors(from[j], to[j], e); st.userData.put(j, v.x, v.y, v.z); } st.userData.done(); });
    enz.position.copy(enzAt); strandSet(st, 90);
    near(wayAt(60));
    /* (IB at HL, D1.2.18: the free start of the chain says what has happened to it, until Next) */
    const md = rideTag(() => wayAt(90), () => lvHere('ib') && ibHL() ? 'polypeptide modified: signal sequence removed' : '', true);
    quest.say('<p>The cutting enzyme has cut the signal from the chain. The work of the signal is finished: it stays in the membrane, and later other enzymes cut it into small pieces.</p><p>The start of the chain is now free inside the rough ER.</p>', 'ok');
    await quest.next();
    md.off();
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    await camGo(eyeLevel(rerView()), R.FAST ? 0 : 2000);
    FOLD.on = false;
    rerNames([memName(), ...sides(), ['e-chain', 'the chain', [chainSpot()]]]);
    quest.say('The ribosome continues to join amino acids.', 'ok');
    /* the signal is cut into pieces while the ribosome works: it fades little by little */
    sig.material.transparent = true;
    const gone = play(3600, k => { sig.material.opacity = 1 - smooth(0.1, 0.9, k); });
    const counter = await count(r, 150, 511, 3600);
    await gone;
    counter.remove(); drop(sig); props.sig = null;
    /* the end of the copy: the ribosome releases the chain, whose last amino acids leave the channel, and its two parts
       separate and leave the membrane */
    const up = rerFace().n;
    const sm = calm(keep(token('small', TSZ.small))), lg = calm(keep(token('large', TSZ.large)));
    lg.position.copy(r.position).addScaledVector(up, -0.0065); sm.position.copy(r.position).addScaledVector(up, 0.0059);
    drop(r); props.rib = null;
    const t0 = performance.now(), sA = st.userData.s, s0 = quest.session;
    const free = live(new Promise(res => { const f = () => { if (quest.session !== s0) return res(); const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / 1300); strandSet(st, sA + (STRAND_FREE - sA) * k * k * (3 - 2 * k)); if (k < 1) requestAnimationFrame(f); else res(); }; f(); }), s0);
    await Promise.all([free, tween(sm, { to: sm.position.clone().addScaledVector(up, 0.06).addScaledVector(rerFace().right, -0.03), ms: 1300, fade: 0 }), tween(lg, { to: lg.position.clone().addScaledVector(up, 0.07).addScaledVector(rerFace().right, 0.03), ms: 1300, fade: 0 })]);
    drop(sm); drop(lg); drop(enz);
    rerNames([...(PHONE() && lvHere('ib') ? [] : [memName()]), ...sides(), ['e-chain', 'the chain', [chainSpot()]], copyName()]);   /* (a phone with IB: the number stands where the membrane's name was) */
    quest.say('<p>All 511 amino acids are joined.</p><p>At the end of the copy of the gene, the ribosome releases the chain. The two parts of the ribosome separate and leave the membrane.</p><p>Without its signal, amylase has 496 amino acids: the chain in the picture has 496 beads.</p>', 'ok');
    /* (IB, B1.2.4: the number built from the picture, under the chain, until the pupil goes on) */
    /* (under the loose chain: on it, it covered the chain's loops. A phone: beside the chain, under the membrane, in two
       lines; under the chain stand the switch and the scale bar) */
    if (PHONE()) rideTag(() => ep(-37, -4), () => lvHere('ib') ? '496 amino acids' : '', true, () => '511 − 15 (the signal)', true);
    else rideTag(() => ep(4, -33), () => lvHere('ib') ? '511 − 15 (the signal) = 496 amino acids' : '', true, null, true);
    if (courseOn()) await quest.next();   /* (with a course on the step waits: its last words and that number are read) */
  }
  /* ---- the chain folds (12 Nov 2026) ----
     Fold: the camera goes closer, to the whole loose chain (the scale bar follows); each bead then moves from its place
     in the loose chain to its place in the folded one, the first amino acids first, so the chain is seen to wind into
     its shape from one end, never broken (neighbours stay 0.38 nm apart, a hair more on the way); the camera comes
     closer still, to the folded chain, once it is folded. It waits there: the pupil sees that the shape is the chain.
     Then the beads turn to amylase's colour and merge into its smooth surface (it comes little by little; nothing is
     added: the surface is the outside of the same amino acids, and the words say so), which is the lump
     the game draws for amylase everywhere; its groove, the active site, faces the camera and is named with a line that
     ends on it; then the camera goes back to the rough ER's close view. The folded molecule is turned by a rotation
     only, never mirrored: across the picture its x, up its y, towards the camera its z (ep's `right` runs to the
     picture's left, so its x is -right). With Reduce motion each part is a still: the loose chain, the folded chain,
     amylase with its names. Simple / As it really is does not show while the camera is this close (FOLD.on) */
  /* the camera's place for the folded chain: the molecule in the middle of the picture; the eye level with the membrane
     (looking level from inside the rough ER, the far underside of the membrane filled the top half of the picture, a pink
     plane), so the camera looks down on the molecule, which is turned to face it */
  /* (a phone: its corner box covers the top third of the picture and the sheet of words its foot, so the camera is a
     little further away and looks 2.9 nm above the molecule, which then stands in the free part between them) */
  const foldNear = () => { const P = PHONE(), d = fitDist(P ? 15.6 : 17, 11), v0 = foldView(insideAt(), d, 0); if (!P) return v0;
    return foldView(insideAt().addScaledVector(new THREE.Vector3().crossVectors(v0.dir, rerFace().right.clone().negate()), 0.0029), d, 0); };
  const foldQ = () => { const f = rerFace(), X = f.right.clone().negate(), Z = foldNear().dir, Y = new THREE.Vector3().crossVectors(Z, X); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); };
  /* the camera on a point inside the rough ER, its eye eyeY nm from the membrane's middle (0: level with the membrane,
     which is then seen from its edge only, as in the place's close view) */
  const foldView = (at, dist, eyeY) => { const f = rerFace(), a = Math.asin(Math.max(-0.9, Math.min(0.9, (eyeY - at.clone().sub(f.p).dot(f.n) * 1000) / 1000 / dist))); return { at, dir: f.along.clone().multiplyScalar(Math.cos(a)).addScaledVector(f.n, Math.sin(a)).normalize(), up: f.n.clone(), dist }; };
  /* on the way between two of these views the eye stays level with the membrane too (camGo's dirOf): turning evenly from
     one direction to the other, it had passed up to a few nanometres above or below the membrane's middle */
  const eyeLevel = view => Object.assign({ dirOf: (at, d) => foldView(at, d, 0).dir }, view);
  /* amylase where it folds, turned to the picture */
  const makeAmylase = () => { const t = keep(token('amylase', TSZ.amy)); t.position.copy(insideAt()); t.quaternion.copy(foldQ()); return (props.amylase = t); };
  const sitePin = a => a.localToWorld(new THREE.Vector3(...amylase().pin).multiplyScalar(0.001));
  const foldNames = (list, solid = []) => rerNear(rerFace(), list, solid, PHONE() ? 5 : 7, insideAt());
  /* IB at HL, B1.2.8: a switch lights the amino acids of the folded chain that are in an alpha helix, or in a
     beta-pleated sheet, and one of each is named. Which ones: amylase().ss, from 1SMD's own records (tools/amylase-fold.py
     `secondary`), never guessed from the shape. `to`: each amino acid's place in the folded chain */
  const SSCOL = { h: 0xffd24a, e: 0x5fe0ff }, FOLDSS = { k: '' };
  function foldStrip(st, to, names) {
    const A = amylase(), s0 = quest.session; stripAgain = () => { if (quest.session === s0 && quest.cur === 'rer') foldStrip(st, to, names); };
    const paint = k => { const c = new THREE.Color(); for (let j = 0; j < A.n; j++) { c.setHex(AMINO_COLORS[+A.kinds[j]]); if (k) { if (A.ss[j] === k) c.setHex(SSCOL[k]); else c.multiplyScalar(0.18); } st.setColorAt(j, c); } st.instanceColor.needsUpdate = true; world.kick(); };
    const old = document.getElementById('conc'); if (old) old.remove();
    const stg = document.getElementById('stage'); if (!stg || !A.ss) return;
    if (!(lvHere('ib') && ibHL())) { FOLDSS.k = ''; paint(''); names(null); return; }
    /* the amino acid of that kind that stands highest on the side of the folded chain that faces the camera (across the
       picture is the chain's own x, up its y, towards the camera its z): its name stands over the chain, on an upright
       line that ends on it, as the active site's does (beside it, the name lay on the chain and was left out) */
    /* (one such amino acid in each third of the chain's width, right to left: the name takes the first where it has room;
       on the left the corner box stands over the chain's top. Only an amino acid that no other one covers: none stands
       in front of its middle; a line had ended on a dim bead with the lit one behind it: the science read, 18 Nov 2026) */
    const open = (j, k) => { for (let i = 0; i < A.n; i++) if (A.ss[i] !== k && A.ca[3 * i + 2] > A.ca[3 * j + 2] && Math.hypot(A.ca[3 * i] - A.ca[3 * j], A.ca[3 * i + 1] - A.ca[3 * j + 1]) < 0.32) return false; return true; };   /* (0.32 nm: a bead's radius is 0.3; a lit bead in front is no fault: the line then ends on that one) */
    const front = k => { let top = -1e9, x0 = 1e9, x1 = -1e9; const sc = j => A.ca[3 * j + 1] + 0.6 * A.ca[3 * j + 2], best = [-1, -1, -1];
      for (let j = 0; j < A.n; j++) { top = Math.max(top, A.ca[3 * j + 1]); x0 = Math.min(x0, A.ca[3 * j]); x1 = Math.max(x1, A.ca[3 * j]); }
      for (let j = 0; j < A.n; j++) if (A.ss[j] === k && open(j, k)) { const t = Math.min(2, Math.floor(3 * (A.ca[3 * j] - x0) / (x1 - x0 + 1e-9))); if (best[t] < 0 || sc(j) > sc(best[t])) best[t] = j; }
      const up1 = new THREE.Vector3(0, 1, 0).applyQuaternion(world.camera.quaternion), pxOf = j => Math.abs(world.project(to[j].clone().addScaledVector(up1, 0.001)).y - world.project(to[j]).y);
      /* (a laptop, and only the left third has one: above it stands the corner box, so the name stands under the chain,
         on the lowest such amino acid; the name of the beta-pleated sheet had been left out: 18 Nov 2026) */
      if (!PHONE() && best[2] < 0 && best[1] < 0) { let bot = 1e9, lo = -1; for (let j = 0; j < A.n; j++) { bot = Math.min(bot, A.ca[3 * j + 1]); if (A.ss[j] === k && open(j, k) && (lo < 0 || 0.6 * A.ca[3 * j + 2] - A.ca[3 * j + 1] > 0.6 * A.ca[3 * lo + 2] - A.ca[3 * lo + 1])) lo = j; }
        if (lo >= 0) return [[to[lo]], { aside: false, up: 1, len: Math.round((A.ca[3 * lo + 1] - bot) * pxOf(lo)) + 22 }]; }
      const bs = [best[2], best[1], best[0]].filter(j => j >= 0), px = pxOf(bs[0]);
      return [bs.map(j => to[j]), { aside: false, up: -1, len: Math.round(Math.max(...bs.map(j => top - A.ca[3 * j + 1])) * px) + 22 }]; };
    const el = document.createElement('div'); el.id = 'conc'; el.className = 'conc conc--expr conc--ss';
    el.innerHTML = '<p class="conc__k">Secondary structure</p>'
      + '<div class="exprsw" role="group" aria-label="Which amino acids are lit"><button type="button" class="exprsw__b" data-x="0">The whole chain</button><button type="button" class="exprsw__b" data-x="1">Alpha helices</button><button type="button" class="exprsw__b" data-x="2">Beta-pleated sheets</button></div>'
      + '<p class="exprsw__n" role="status"></p>';
    const set = k => { FOLDSS.k = k; paint(k); el.querySelectorAll('[data-x]').forEach(b => b.setAttribute('aria-pressed', String(['', 'h', 'e'][+b.dataset.x] === k)));
      /* (the amino acids that are never lit are in neither: they are not loose, B1.2.7: each one has its position) */
      el.querySelector('.exprsw__n').textContent = k === 'h' ? 'Lit: the amino acids in the parts of the chain that coil into alpha helices. Each of the others still has its fixed position.' : k === 'e' ? 'Lit: the amino acids in the parts of the chain that form beta-pleated sheets. Each of the others still has its fixed position.' : 'Parts of the chain coil into alpha helices, and parts form beta-pleated sheets. Amylase has both.';
      cardOff(); names(k === 'h' ? ['e-helix', 'part of an<br>alpha helix', ...front('h')] : k === 'e' ? ['e-sheet', 'part of a<br>beta-pleated sheet', ...front('e')] : null); };
    el.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (b) set(['', 'h', 'e'][+b.dataset.x]); });
    stripLoop(el, stg); set(FOLDSS.k);
  }
  async function fold() {
    await rerClose();
    nucStep(); FOLDSS.k = '';
    const A = amylase(), f = rerFace(), inside = insideAt(), st = theStrand(STRAND_FREE);
    if (props.amylase) { drop(props.amylase); props.amylase = null; }
    /* (IB at HL, B1.2.7: the loose chain is the primary structure; three rests follow, each named before the next change) */
    rerNames([memName(), ...sides(), ['e-chain', 'the chain', [chainSpot()], { w: { hl: 'primary structure:<br>the sequence of<br>amino acids', card: 'e-prim' } }]]);
    await press(() => (PHONE() ? ep(-24, 13) : ep(2, -31)), 'Fold', { side: PHONE() ? 't' : 'b' });   /* (a phone: above the membrane; under the chain it stood on the scale bar's number) */
    FOLD.on = true; quest.names.set([], HUD());
    /* closer: the whole loose chain in the picture, each bead now seen */
    await camGo(eyeLevel(foldView(ep(2.4, PHONE() ? -10.5 : -16.5), fitDist(36, 29), 0)), R.FAST ? 0 : 2000);
    /* each bead from its place in the loose chain to its place in the folded one */
    const q = foldQ(), from = [], to = [], v = new THREE.Vector3();
    for (let j = 0; j < A.n; j++) { from.push(wayAt(STRAND_FREE - j)); to.push(v.set(A.ca[3 * j], A.ca[3 * j + 1], A.ca[3 * j + 2]).multiplyScalar(0.001).applyQuaternion(q).add(inside).clone()); }
    /* (the camera is still while the chain folds, and goes closer only after: moving in meanwhile, the zoom and the chain's
       gathering cancelled each other on the screen: the expert review, 12 Nov 2026) */
    const t0 = performance.now(), s0 = quest.session, LAG = 0.55, MS = 5600;
    const winding = live(new Promise(res => {
      const g = () => {
        if (quest.session !== s0) return res();
        const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / MS);
        for (let j = 0; j < A.n; j++) { const e = smooth(0, 1, k * (1 + LAG) - LAG * j / A.n); v.lerpVectors(from[j], to[j], e); st.userData.put(j, v.x, v.y, v.z); }
        st.userData.done(); world.kick();
        if (k < 1) requestAnimationFrame(g); else res();
      };
      g();
    }), s0);
    const near = foldNear();
    await winding;
    await camGo(eyeLevel(near), R.FAST ? 0 : 2400);
    st.userData.folded = true;
    /* amylase's surface stands there from now on, not yet seen (opacity 0): the names keep off the folded chain by it */
    const a = makeAmylase(), body = a.children[0];   /* (each token has a material of its own) */
    body.material.transparent = true; body.material.opacity = 0; body.material.depthWrite = false; body.renderOrder = 7;
    /* (a phone: no room beside it, so each name stands below or above it, on an upright line) */
    const camUp = () => new THREE.Vector3(0, 1, 0).applyQuaternion(world.camera.quaternion), below = () => [[inside.clone().addScaledVector(camUp(), -0.0026)], { up: 1, len: 14 }];
    /* (the place has a name in this close view too, for every pupil: nothing said where the black ground is. IB at HL: the
       folded chain is the tertiary structure, B1.2.9, and the switch lights its alpha helices and beta-pleated sheets) */
    const where = () => ['e-in', 'inside the rough ER', [inside.clone().addScaledVector(camUp(), 0.0046), inside.clone().addScaledVector(camUp(), -0.0046)], { aside: false, up: -1, len: 2, small: '<span class="nm__t">inside the<br>rough ER</span>' }];
    const folded = extra => foldNames([(([sp, o]) => ['e-chain', 'the chain, folded', sp, Object.assign({}, o, { w: { hl: 'tertiary structure', card: 'e-tert' } })])(PHONE() ? below() : edge(inside, 0.0042)), where(), ...(extra ? [extra] : [])], [a]);
    folded(null);
    foldStrip(st, to, folded);
    quest.say('<p>The chain has folded into its shape. Every bead is one amino acid: 496 in all. The four colours are four groups of amino acids: there are 20 different amino acids, and each one belongs to one group.</p><p>This is the real shape of amylase: scientists measured where each of its atoms is.</p><p>In a real cell the chain starts to fold while it is still growing. Here it waited, so that you could see the whole chain.</p>', 'ok');
    await quest.next('Show its surface');
    /* the smooth surface grows over the chain: the lump the game draws for amylase */
    stripAgain = null; stripOff(); FOLDSS.k = ''; for (let j = 0; j < A.n; j++) st.setColorAt(j, new THREE.Color(AMINO_COLORS[+A.kinds[j]])); st.instanceColor.needsUpdate = true;
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    /* nothing is added to the protein: the surface is only the outside of the same amino acids. So first every bead
       turns to amylase's own colour (the first third), and then the beads are seen to merge into the smooth shape, which
       comes in in that same colour; the beads go little by little as it closes (a few lie just under it). Before, a
       brown shell came over the coloured beads from outside, like a coat (the expert review, 12 Nov 2026) */
    st.material.transparent = true;
    const gold = new THREE.Color(0xf0b24a), c0 = [...Array(A.n)].map((_, j) => new THREE.Color(AMINO_COLORS[+A.kinds[j]])), cc = new THREE.Color();
    const t1 = performance.now();
    await live(new Promise(res => { const g = () => { if (quest.session !== s0) return res(); const k = R.FAST ? 1 : Math.min(1, (performance.now() - t1) / 3600), kc = smooth(0, 0.34, k), e = smooth(0.3, 1, k);
      for (let j = 0; j < A.n; j++) st.setColorAt(j, cc.copy(c0[j]).lerp(gold, kc)); st.instanceColor.needsUpdate = true;
      body.material.opacity = e; body.material.depthWrite = e > 0.9; st.material.opacity = 1 - smooth(0.7, 1, k); world.kick(); if (k < 1) requestAnimationFrame(g); else res(); }; g(); }), s0);
    /* the beads are inside the surface now, and no longer drawn */
    drop(st); props.strand = null;
    /* the active site is in the middle of the lump: its name stands above the lump, on an upright line that ends in the
       groove (the game's way for a part that a level line could reach only across another: names.js `up`; a level line
       from beside the lump was tried after the expert review, and the name then stood on the lump) */
    const pin = sitePin(a), top = pin.clone().addScaledVector(camUp(), 0.0034);
    /* (IB at HL, B1.2.12: "amylase: a globular protein"; IGCSE: "amylase" opens 5.1.2, "active site" 5.1.4 and 5.1.7) */
    foldNames([(([sp, o]) => ['e-amy', 'amylase', sp, Object.assign({}, o, { w: { hl: 'amylase:<br>a globular protein' } })])(PHONE() ? below() : edge(inside, 0.0045)), ['e-site', 'active site', [pin], { up: -1, len: Math.round(Math.abs(world.project(top).y - world.project(pin).y)) + 16 }], (([k0, h0, sp, o]) => [k0, h0, [sp[1]], Object.assign({}, o, { up: 1 })])(where())], [a]);   /* (the place's name under the lump here: over it stands the active site's) */
    quest.say('<p>Now the picture shows only the outside of the folded chain. Nothing is added: the smooth shape is the surface of the same amino acids. This is how the game draws amylase. It is about 8 nm long and 5 nm wide.</p><p>The groove is its <b>active site</b>: a short part of a starch chain fits into it.</p><p>Every enzyme and every other protein that the game draws as a smooth lump is one folded chain of amino acids like this, or a few folded chains together. A ribosome is different: it is RNA and many proteins together, as you saw at the nucleolus.</p>', 'ok');
    await quest.next();
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    await camGo(eyeLevel(rerView()), R.FAST ? 0 : 3200);
    FOLD.on = false;
  }
  /* ---- the vesicle buds (12 Nov 2026) ----
     The expert review, 12 Nov 2026: "amylase crosses an intact membrane … a bubble appears on the cytosol side and
     inflates to 70 nm in under 1 s. Amylase rises through the unbroken membrane into it" (Alberts, Molecular Biology of
     the Cell, ch. 13: a vesicle is a piece of the membrane itself, which bends out and pinches off; what it carries
     never crosses a membrane). So the membrane itself bends: budMake draws the piece that bends (BUD) in the game's own
     section, the same three layers on the same cut face, round a circle that rises out of the membrane's plane: a low
     swell, a dome, a ball on a narrow neck; then the neck closes, the ball is a vesicle, and the membrane is level
     again. The far half of the ball is drawn behind the cut face (a pale wall), so that it is a ball and not a ring.
     Amylase is inside the rough ER the whole time, then inside the swell, then inside the vesicle: it goes up through
     the open mouth, at the circle's middle. u: 0 level, 1 the neck is narrow, 2 closed, 3 the vesicle is free. */
  function budMake() {
    const f = rerFace(), front = world.camera.position.clone().sub(f.p).dot(f.along) < 0 ? -1 : 1, g = new THREE.Group();
    const NF = 2, NC = 16, NV = 73, NT = 26, NP = 16, v = new THREE.Vector3();
    const mat = (color, rim, rimK, rough, see) => magicStandard(Object.assign({ color, roughness: rough, side: THREE.DoubleSide }, see ? { transparent: true } : {}), { rim, rimK });
    /* (back: the strip runs the other way along the picture, so its triangles are wound the other way: each one must
       face the camera, or its light comes from behind and it is dark) */
    const strip = (n, m, back) => {
      const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 6), nor = new Float32Array(n * 6), idx = [], N = f.along.clone().multiplyScalar(front);
      for (let i = 0; i < 2 * n; i++) { nor[3 * i] = N.x; nor[3 * i + 1] = N.y; nor[3 * i + 2] = N.z; }
      for (let i = 0; i < n - 1; i++) { const a = 2 * i; if ((front > 0) !== !!back) idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); else idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setIndex(idx);
      const mesh = new THREE.Mesh(geo, m); mesh.frustumCulled = false; g.add(mesh); return { pos, geo, m, mesh };
    };
    const BANDS = [[3, 1.8, 0xff9ac8, 0xffd6ea, 0.4, 0.5], [1.8, -1.8, 0xfff0f5, 0xffffff, 0.15, 0.7], [-1.8, -3, 0xff9ac8, 0xffd6ea, 0.4, 0.5]];   /* (the membrane's own: heads, tails, heads) */
    const three = (n, see, back) => BANDS.map(b => strip(n, mat(b[2], b[3], b[4], b[5], see), back));
    const ML = three(NF + NC), MR = three(NF + NC, false, true), VS = three(NV, true), LL = three(2);   /* (LL: the membrane beyond the channel) */
    /* (for tools/fold-check.mjs: which part and which layer each strip is) */
    g.userData.kind = 'bud'; [['ML', ML], ['MR', MR], ['VS', VS], ['LL', LL]].forEach(([part, S3]) => S3.forEach((s, band) => { s.mesh.userData.part = part; s.mesh.userData.band = band; }));
    const w3 = (pos, k, x, y, z) => { v.copy(f.p).addScaledVector(f.right, x / 1000).addScaledVector(f.n, y / 1000).addScaledVector(f.along, z / 1000); pos[3 * k] = v.x; pos[3 * k + 1] = v.y; pos[3 * k + 2] = v.z; };
    const put = (S, i, x, y, nx, ny) => S.forEach((s, b) => { w3(s.pos, 2 * i, x + BANDS[b][0] * nx, y + BANDS[b][0] * ny, front * 0.02); w3(s.pos, 2 * i + 1, x + BANDS[b][1] * nx, y + BANDS[b][1] * ny, front * 0.02); });
    /* the far half of the ball: a pale wall behind the cut face */
    const bgeo = new THREE.BufferGeometry(), bpos = new Float32Array(NT * NP * 3), bnor = new Float32Array(NT * NP * 3), bidx = [];
    for (let i = 0; i < NT - 1; i++) for (let j = 0; j < NP - 1; j++) { const a = i * NP + j; bidx.push(a, a + 1, a + NP, a + 1, a + NP + 1, a + NP); }
    /* (its colour fades to nothing towards the open mouth, until the neck closes: the second expert review, 13 Nov 2026:
       "the pale fill of the far wall stops in a straight line across the mouth, and amylase sits on that line … it reads
       as a thin skin that amylase crosses") */
    const bcol = new Float32Array(NT * NP * 4).fill(1);
    bgeo.setAttribute('position', new THREE.BufferAttribute(bpos, 3)); bgeo.setAttribute('normal', new THREE.BufferAttribute(bnor, 3)); bgeo.setAttribute('color', new THREE.BufferAttribute(bcol, 4)); bgeo.setIndex(bidx);
    const bm = magicStandard({ color: 0xffd9e8, roughness: 0.35, side: THREE.DoubleSide, transparent: true, opacity: 0.34, depthWrite: false, vertexColors: true }, { rim: 0xffffff, rimK: 0.9 });
    const bowl = new THREE.Mesh(bgeo, bm); bowl.frustumCulled = false; bowl.renderOrder = 6; g.add(bowl);
    const { x: X, rho, r, neck, far } = BUD, ycT = r + Math.sqrt((rho + r) ** 2 - (r + 3 + neck) ** 2), dxT = r + 3 + neck, RISE = 6;
    const S = g.userData.S = { u: -1, yv: -rho, alpha: 0 };
    /* u: 0 to 1 the swell rises to a ball on a narrow neck; 1 to 2 the neck closes (b): the ball's two ends go round to
       its lowest point, and the membrane's two sides go with them, joined to them all the way, so that the ball and
       the membrane are each whole at the same moment, still touching, and the cytosol is never between open ends (the
       second look, 13 Nov 2026: the ball had risen while both were still open); 2 to 3 the ball rises and the membrane
       goes level (e) */
    function set(u) {
      const a = smooth(0, 1, Math.min(1, u)), b = smooth(0, 1, Math.max(0, Math.min(1, u - 1))), e = smooth(0, 1, Math.max(0, Math.min(1, u - 2)));
      const yc = -rho + (ycT + rho) * a, dx = u >= 1 ? dxT : Math.sqrt(Math.max(0, (rho + r) ** 2 - (yc - r) ** 2)), beta = Math.atan2(yc - r, dx);
      const al0 = Math.atan2(dx, r - yc), alpha = al0 + (Math.PI - al0) * b, yv = yc + RISE * e;
      /* the ball's end on one side (mirrored: x is the distance from the bud's middle line), and where the membrane's
         curve ended before the neck began to close */
      const ex = rho * Math.sin(alpha), ey = yc + rho * Math.cos(alpha), tx = rho * Math.sin(al0), ty = yc + rho * Math.cos(al0);
      /* the membrane on one side, as points (x from the middle line, y), from its level part up its small curve to the
         ball's end: the curve's own points, each moved with the ball's end (its last point all the way, the others less);
         at the end, level */
      const px = [], py = [];
      for (let j = 0; j < NC; j++) {
        const an = -Math.PI / 2 + (beta + Math.PI / 2) * j / (NC - 1), k = j / (NC - 1), x0 = dx - r * Math.cos(an) + (ex - tx) * k * k, y0 = r + r * Math.sin(an) + (ey - ty) * k * k;
        px.push(x0 + (dx * (1 - k) - x0) * e); py.push(y0 * (1 - e));
      }
      [[ML, -1], [MR, 1]].forEach(([M, sd]) => {
        put(M, 0, sd < 0 ? 3.6 : X + far, 0, 0, 1); put(M, 1, X + sd * dx, 0, 0, 1);
        for (let j = 0; j < NC; j++) {
          /* the cytosol's side of the curve: across its direction (from the points on each side of this one) */
          const j0 = Math.max(0, j - 1), j1 = Math.min(NC - 1, j + 1); let dxx = px[j1] - px[j0], dyy = py[j1] - py[j0]; if (j === 0 || Math.hypot(dxx, dyy) < 1e-6) { dxx = -1; dyy = 0; }
          const L = Math.hypot(dxx, dyy), nx = dyy / L, ny = -dxx / L;   /* (going towards the middle line, x falls: the cytosol is on the left of that way) */
          put(M, NF + j, X + sd * px[j], py[j], sd * nx, ny);
        }
      });
      /* the ball: an arc of its circle from one side over the top to the other, closed at the end */
      for (let k = 0; k < NV; k++) { const th = -alpha + 2 * alpha * k / (NV - 1); put(VS, k, X + rho * Math.sin(th), yv + rho * Math.cos(th), Math.sin(th), Math.cos(th)); }
      for (let i = 0; i < NT; i++) for (let j = 0; j < NP; j++) {
        const th = alpha * i / (NT - 1), ps = Math.PI * j / (NP - 1), k = i * NP + j, sx = Math.sin(th) * Math.cos(ps), sy = Math.cos(th), sz = -front * Math.sin(th) * Math.sin(ps);
        w3(bpos, k, X + rho * sx, yv + rho * sy, rho * sz); bcol[4 * k + 3] = 1 - (1 - b) * smooth(0.35, 0.95, i / (NT - 1));
        v.set(0, 0, 0).addScaledVector(f.right, sx).addScaledVector(f.n, sy).addScaledVector(f.along, sz); bnor[3 * k] = v.x; bnor[3 * k + 1] = v.y; bnor[3 * k + 2] = v.z;
      }
      put(LL, 0, -far, 0, 0, 1); put(LL, 1, -3.6, 0, 0, 1);
      [...ML, ...MR, ...VS, ...LL].forEach(s => { s.geo.attributes.position.needsUpdate = true; }); bgeo.attributes.position.needsUpdate = true; bgeo.attributes.normal.needsUpdate = true; bgeo.attributes.color.needsUpdate = true;
      S.u = u; S.yv = yv; S.alpha = alpha;
    }
    /* the ball's own drawing fades (the game's vesicle comes in its place); the membrane's does not */
    const fade = o => { VS.forEach(s => { s.m.opacity = o; s.m.depthWrite = o > 0.6; }); bm.opacity = 0.34 * o; };
    set(0);
    return { g, set, fade, S };
  }
  /* the camera for the bud: the whole vesicle and amylase below it in the free part of the picture, the eye level with
     the membrane (before, a phone's corner box covered the top half of the vesicle) */
  const budView = () => (PHONE() ? foldView(ep(BUD.x, 38), fitDist(108, 128), 0) : foldView(ep(BUD.x, 31), fitDist(108, 114), 0));   /* (a phone: lower, clear of the buttons under the corner box) */
  async function bud() {
    await rerClose();
    nucStep();
    const a = props.amylase || makeAmylase();
    if (props.strand) { drop(props.strand); props.strand = null; }
    if (!state.has('lipids')) {
      quest.say('Every vesicle removes a piece of the membrane of the rough ER, so the rough ER needs new <b>lipids</b> first. The <b>smooth ER</b> makes them: go there, then return here.', 'no');
      return false;
    }
    rerNames([memName(), ...sides(), ['e-amy', 'amylase', [a.position.clone()]]]);
    await press(() => (PHONE() ? ep(-24, 13) : a.position.clone().addScaledVector(rerFace().n, -0.012)), 'Bud', { side: PHONE() ? 't' : 'b', w: 'bud' });   /* (a phone: above the membrane; under amylase it stood on the scale bar's number) */
    state.use('lipids'); state.use('chain');
    /* no name stays on a part that moves away; the camera takes the place where the vesicle will be */
    FOLD.on = true; quest.names.set([], HUD());
    /* (a vesicle buds away from the ribosomes: amylase moves along inside the rough ER, and the camera with it) */
    await Promise.all([camGo(eyeLevel(budView()), R.FAST ? 0 : 2600), tween(a, { to: ep(BUD.x - 22, -15), ms: 2600 })]);
    const mem = membrane(), B = budMake(); keep(B.g); props.bud = B; (mem.userData.slabs || []).forEach(m => { m.visible = false; });
    const a0 = a.position.clone(), under = ep(BUD.x, -14), up = rerFace().n, A_MS = 3700, B_MS = 1100, E_MS = 700, MS = A_MS + B_MS + E_MS;   /* (the neck closes in 1.1 s; then the vesicle rises) */
    /* (18 Nov 2026, for every pupil: a label rides on the piece of membrane that bends, and then on the vesicle: "a
       vesicle forms" until the neck has closed, a word true of it at that moment, then "vesicle"; IB at HL, B2.2.9: what
       the vesicle does) */
    let closed = false;
    /* (a phone: the vesicle fills the picture under the corner box: the label stands inside its upper part, its HL words on a second line) */
    const vt = rideTag(() => ep(BUD.x, (B.S ? B.S.yv : 0) + (PHONE() ? 27 : closed ? 38 : 30)), () => !closed ? 'a vesicle forms' : 'vesicle', PHONE());
    await play(MS, k => {
      const ms = k * MS, u = ms < A_MS ? ms / A_MS : ms < A_MS + B_MS ? 1 + (ms - A_MS) / B_MS : 2 + (ms - A_MS - B_MS) / E_MS;
      B.set(u); closed = u >= 2;
      /* amylase: to under the swell, then up with the circle's middle, through the open mouth */
      a.position.lerpVectors(a0, under, smooth(0, 0.4, Math.min(1, u))).addScaledVector(up, Math.max(0, B.S.yv + 14) / 1000);
    });
    const c = ep(BUD.x, B.S.yv);
    /* the game's own vesicle stands there from now on, not yet seen (opacity 0): the names keep off the vesicle by it */
    const ves = keep(token('vesicle', TSZ.ves)), shell = ves.userData.shell, op = shell.material.opacity; ves.position.copy(c); shell.material.opacity = 0;
    /* (a phone: the vesicle fills most of the picture's width, so its name stands beside its lower part, where it is
       narrower, outside it, on a line that ends on its membrane; inside it, the name read as the name of what it holds:
       the second expert review, 13 Nov 2026; the membrane's name below the membrane, in the middle) */
    vt.off();   /* (the names take over: one "vesicle", not two; IB at HL, B2.2.9: its name says what it does) */
    const VW = { w: { hl: 'vesicle: transports amylase<br>to the Golgi apparatus' } };
    if (PHONE()) { const Rv = new THREE.Vector3().setFromMatrixColumn(world.camera.matrixWorld, 0).normalize(), ring = k => c.clone().addScaledVector(Rv, k * 0.0255).addScaledVector(rerFace().n, -0.0245);
      rerNear(rerFace(), [['e-ves', 'vesicle', [ring(1), ring(-1)], Object.assign({ sides: [1, -1] }, VW)], ['e-mem', 'membrane of the rough ER', [ep(BUD.x - 16, 0), ep(BUD.x - 8, 0), ep(BUD.x, 0)], { up: 1, small: '<span class="nm__t">rough ER<br>membrane</span>' }]], [ves], 2, c); }
    else rerNear(rerFace(), [['e-mem', 'membrane of the rough ER', [ep(BUD.x - 46, 0), ep(BUD.x + 46, 0), ep(BUD.x - 38, 0), ep(BUD.x + 38, 0)], { up: 1, small: '<span class="nm__t">rough ER<br>membrane</span>' }],
      (([sp, o]) => ['e-ves', 'vesicle', sp, Object.assign({}, o, VW)])(edge(c, 0.036)), ['e-cyt', 'cytosol', ...edge(ep(BUD.x, 66), 0.05)], ['e-in', 'inside the rough ER', ...edge(ep(BUD.x, -13), 0.046), { small: '<span class="nm__t">inside the<br>rough ER</span>' }]], [ves], 36, c);
    quest.say('<p>A piece of the membrane has bent round amylase and closed: this is a <b>vesicle</b>. Amylase did not cross the membrane: it was inside the rough ER, and now it is inside the vesicle.</p><p>The vesicle is about 70 nm across. Amylase is about 5 nm wide: the vesicle is fourteen times as wide.</p>', 'ok');
    await quest.next();
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    /* the game's vesicle comes in over the section's ball, and the membrane is its own boxes again (level, the two look the same) */
    await play(900, k => { const e = smooth(0, 1, k); shell.material.opacity = op * e; B.fade(1 - e); });
    (mem.userData.slabs || []).forEach(m => { m.visible = true; }); drop(B.g); props.bud = null;
    const g = new THREE.Group(); g.position.copy(c); keep(g); a.position.set(0, 0, 0); g.add(a); ves.position.set(0, 0, 0); g.add(ves);
    /* it leaves, and from far away it is too small to see, so a glow shows it on its way */
    farGlow(g, 0.06, 0xfff1a8);
    FOLD.on = false;
    await nanoOut(world.P.rer.view);
    await tween(g, { to: g.position.clone().addScaledVector(rerFace().n, 1.0).add(V(0.6, 1.2, 0)), ms: 1400 });
    await quest.gain('amylase', g.position);
    drop(g); props.amylase = null;
    await quest.next('Back to the map');
  }

  /* ---------------- "As it really is" (11 Nov 2026) ----------------
     Daniel, 11 Nov 2026: "if you're looking at something in the middle of nowhere, it feels like the cell is empty … once
     you have zoom in, you can have a toggle saying, this is to simplify, and then you click a toggle, and this is how it
     looks in reality … you'll be fixed in an area … and then you can pack it with all of the things that are inside the
     cell … make sure that once it stops the camera, you have that toggle"; his choice, the same day: the ribosome place
     and the rough ER first. A switch, Simple | As it really is, at the foot of the picture (left, above the scale bar),
     shown while the close view of one of them is still and its step waits for the pupil. As it really is: the slice
     behind the story's own molecules packed at true size (crowd.js), a few names on what is there, and a note in the step
     (the numbers, and that many ribosomes sit on the rough ER); the step's buttons wait (the buttons on the picture are
     hidden, the panel's are paused) until the pupil switches back. The camera stays in its place, turned and zoomed a
     little as before (tight). It is built when pressed and removed when switched off, when the step changes, when the
     pupil leaves (reset) or when a step is watched again. Proof: tools/real-view.mjs */
  const REAL = { on: false, el: null, note: null, crowd: null, names: null, places: ['ribosome', 'rer'] };
  /* the crowd's names on a layer of their own (#names2): the step's names stay as they are, only hidden while it is on, so
     Simple shows them again exactly where they stood (replacing them, a phone had placed a different few afterwards) */
  const crowdNames = () => REAL.names || (REAL.names = new Names(world, (() => { const l = R.h('div', { class: 'names', id: 'names2' }); R.$('#stage').insertBefore(l, R.$('#hots')); return l; })()));
  /* the step waits for the pupil: a button on the picture that can be pressed, or one in the step (a choice, Next) */
  const waitsForPupil = () => quest.hots.some(o => o.alive && !o.el.disabled) || !!(quest.step && quest.step.li && quest.step.li.querySelector('.step__do button:not([disabled])'));
  const realHere = () => NZ.on && !FOLD.on && REAL.places.includes(quest.cur) && !quest.watchingNow();
  function realUI() {
    if (REAL.el) return REAL.el;
    const el = R.h('div', { class: 'realsw', role: 'group', 'aria-label': 'How the picture is drawn' },
      '<button type="button" class="realsw__b" data-real="0" aria-pressed="true">Simple</button><button type="button" class="realsw__b" data-real="1" aria-pressed="false">As it really is</button>');
    el.hidden = true; R.$('#stage').appendChild(el);
    /* drawing the crowd takes up to a second on a slow phone: the button says so first (memory dashboard-busy-states) */
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-real]'); if (!b) return;
      if (b.dataset.real !== '1' || REAL.on) { realSet(b.dataset.real === '1'); return; }
      quest.names.frozen = true;   /* (before the label changes: the switch's new size would place the step's names again) */
      b.textContent = 'Drawing…'; el.setAttribute('aria-busy', 'true');
      requestAnimationFrame(() => setTimeout(() => { try { realSet(true); } finally { b.textContent = 'As it really is'; el.removeAttribute('aria-busy'); if (!REAL.on) quest.names.frozen = false; } }, 0));
    });
    REAL.el = el;
    setInterval(realTick, 200);
    return el;
  }
  /* shown only where it can be used; it stands at the foot of the free part of the picture, above the scale bar */
  function realTick() {
    const el = REAL.el;
    if (!realHere()) { if (REAL.on) realSet(false); if (!el.hidden) el.hidden = true; return; }
    const show = REAL.on || (!world.flying && waitsForPupil());
    if (el.hidden === show) el.hidden = !show;
    if (!show) return;
    /* placed once it shows (hidden, its height is 0: it had stood 36 px too low for a moment), and the names told when it
       moves: a move is not a change of size, so their ResizeObserver does not see it, and a name had stood under it */
    /* (on a phone at the bottom right, above Hide text: at the left, over the scale bar, it had stood on the rough ER's chain) */
    const qh = document.getElementById('qHide'), phone = PHONE() && qh && qh.offsetHeight;
    el.style.left = phone ? 'auto' : ''; el.style.right = phone ? '10px' : '';
    const top = Math.round(phone ? qh.offsetTop - el.offsetHeight - 8 : world.size.h - (world.inset.bottom || 0) - 50 - el.offsetHeight - 10) + 'px';
    if (el.style.top !== top) { el.style.top = top; [quest.names, REAL.names].forEach(N => { if (N && N.keepOut) { N.keeps(); N.dirty = true; N.still = 0; } }); world.kick(); }
  }
  /* what the crowd keeps clear (nm, in the rough ER's frame): every drawn part of the story's own molecules (a sphere
     round each mesh), the copies sampled along their lines (a copy's own sphere is as wide as the picture) */
  function realClear(F) {
    const out = [], sph = new THREE.Sphere(), inF = p => { const d = p.clone().sub(F.o); return [d.dot(F.right) * 1000, d.dot(F.up) * 1000, d.dot(F.back) * 1000]; };
    kept.forEach(o => {
      if (o === props.mem || !o.visible) return;
      o.updateMatrixWorld(true);
      o.traverse(m => {
        if (!m.isMesh || !m.visible) return;
        if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
        sph.copy(m.geometry.boundingSphere).applyMatrix4(m.matrixWorld);
        const r = sph.radius * 1000; if (r > 45) return;
        out.push([...inF(sph.center), r + 1]);
      });
    });
    out.push([0, 0, -3, 5.5]);   /* the channel where the story's ribosome docks (the membrane's own drawing: membrane()) */
    /* room round the chain and amylase inside the rough ER, so that they can be seen (the expert review: the chain was lost) */
    if (props.strand && props.strand.parent) { const sN = props.strand.userData.s; for (let i = Math.max(0, sN - amylase().n + 1); i <= Math.min(sN, STRAND_FREE); i += 6) out.push([...inF(wayAt(i)), 2.6]); }   /* (the chain's own way: every sixth bead) */
    if (props.amylase && props.amylase.parent) out.push([...inF(props.amylase.getWorldPosition(new THREE.Vector3())), 6.5]);
    [props.copy, props.copy2].forEach(cv => { if (cv) cv.getSpacedPoints(240).forEach(p => out.push([...inF(p), 2.5])); });
    /* a copy moved with its ribosome (the last step) */
    if (props.copyObj && props.copy && props.copyObj.position.lengthSq() > 0) props.copy.getSpacedPoints(240).forEach(p => out.push([...inF(p.clone().add(props.copyObj.position)), 2.5]));
    return out;
  }
  const NOTE = '<p class="realnote__h">As it really is</p><p>The cytosol is packed: large molecules, mostly proteins, fill 20–30 % of the space. Water and other small molecules fill the rest. They are not drawn.</p><p>Many ribosomes sit on the membrane of the rough ER. That is why it looks rough.</p><p class="realnote__s">Everything is at its true size. Real molecules have no colour: the colours only help you see each one. Source: Ellis 2001, Trends in Biochemical Sciences 26:597.</p><p class="realnote__go">Press <b>Simple</b> to continue the step.</p>';
  function realSet(on) {
    on = !!on && realHere(); if (on === REAL.on) return;
    REAL.on = on;
    REAL.el.querySelectorAll('[data-real]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.real === '1') === on)));
    R.$('#stage').classList.toggle('is-real', on);
    /* the step's names wait as they are (names.js frozen), and are placed again only once the panel is its own size again */
    quest.names.frozen = on; if (!on) { quest.names.dirty = true; quest.names.still = 0; world.kick(); }
    if (on) {
      const f = rerFace(), F = { o: f.p.clone(), up: f.n.clone(), back: f.along.clone() }; F.right = new THREE.Vector3().crossVectors(F.up, F.back).normalize();
      REAL.crowd = buildCrowd(F, realClear(F)); scene.add(REAL.crowd.group);
      const sp = REAL.crowd.spots, mine = props.rib && props.rib.parent ? [props.rib] : [];
      /* one line, one thing: each name in the singular, on one of them (the expert review, 11 Nov 2026) */
      const list = [['x-prot', 'a protein', sp.proteins], ['x-rib', 'another ribosome', sp.ribosomes], ['x-car', 'a carrier', sp.carriers]];
      if (quest.cur === 'rer') list.push(['x-in', 'a protein inside the rough ER', sp.lumen, { small: '<span class="nm__t">a protein inside<br>the rough ER</span>' }]);
      if (mine.length) list.push(['x-mine', 'your ribosome', ...edge(props.rib.getWorldPosition(new THREE.Vector3()).addScaledVector(f.n, 0.009), 0.0135)]);
      /* the story's own molecule in the rough ER, never lost in the crowd */
      if (props.amylase && props.amylase.parent) list.push(['x-amy', 'amylase', [props.amylase.getWorldPosition(new THREE.Vector3())]]);
      else if (props.strand && props.strand.parent && props.strand.userData.s > 30) list.push(['x-chain', 'the chain', [chainSpot()]]);
      const solid = mine.concat([props.amylase, props.free && props.free.t].filter(o => o && o.parent));   /* (no crowd name on the story's own molecules: on a phone one had hidden the chain) */
      crowdNames().set(list.filter(it => it[2].length).map(([key, html, spots, o]) => Object.assign({ key, free: true, aside: true, html: `<span class="nm__t">${html}</span>`, spots }, o || {})), HUDR(), Object.assign(lr(ep(50, 0), ep(-50, 0)), { on: true }), solid);   /* (on: beside their parts, never in columns round the picture: long lines across the crowd) */
      if (quest.step && quest.step.li) { REAL.note = R.h('div', { class: 'realnote', role: 'status' }, NOTE.replace('<p class="realnote__s">', quest.cur === 'rer' ? '<p>The inside of the rough ER is packed with proteins too.</p><p class="realnote__s">' : '<p class="realnote__s">')); quest.step.li.appendChild(REAL.note); quest.reveal(REAL.note, false); }
    } else {
      if (REAL.crowd) { scene.remove(REAL.crowd.group); REAL.crowd.dispose(); REAL.crowd = null; }
      if (REAL.note) { REAL.note.remove(); REAL.note = null; }
      if (REAL.names) REAL.names.set([]);
    }
    world.kick();
  }
  const realOff = () => { if (REAL.on) realSet(false); };
  realUI();

  /* ---------------- the smooth ER, the Golgi and the way out, at their true sizes (round 6, 10 Nov 2026) ----------------
     His "Yes, build it" to the plan (and to the close-up of the sugars): each place close up with the scale bar, every
     molecule at its true size, the far world faded (nanoFog) and what is drawn larger than life nearby hidden (nanoIn);
     names beside the parts, never on a large one (names.js solid). Shared here: a close-up's frame (p a point, n the side
     called up, right across the picture, along towards the camera; offsets in nm), its group (x across, y up, z towards
     the camera), the camera's distance that fits a width and a height (nm) into the free part of the picture, and the
     names. */
  const frameAt = (p, n, camPos) => { const c = camPos.clone().sub(p).normalize(), along = c.addScaledVector(n, -c.dot(n)).normalize(); return { p: p.clone(), n: n.clone(), right: new THREE.Vector3().crossVectors(n, along), along }; };
  const fp = (F, x, y, z = 0) => F.p.clone().addScaledVector(F.right, x / 1000).addScaledVector(F.n, y / 1000).addScaledVector(F.along, z / 1000);
  const frameGroup = F => { const g = new THREE.Group(); g.position.copy(F.p); g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(F.right, F.n, F.along)); return g; };
  const fitDist = (wNm, hNm) => { const k = world.pxPerUnit(1), s = world.size, ins = world.inset || {}, Wf = s.w - (ins.right || 0), Hf = s.h - (ins.bottom || 0) - (ins.top || 0); return Math.max(k * wNm / 1000 / (0.9 * Wf), k * hNm / 1000 / (0.82 * Hf)); };
  const PHONE = () => world.size.w < 640;   /* a phone: narrow, the corner box over the picture's top */
  const closeNames = (F, list, solid = [], w = 40, c = F.p) => quest.names.set(list.map(([key, html, spots, o]) => Object.assign({ key, free: true, aside: true, html: `<span class="nm__t">${html}</span>`, spots }, o || {})), HUD(), Object.assign(lr(c.clone().addScaledVector(F.right, -w / 1000), c.clone().addScaledVector(F.right, w / 1000)), { on: true }), solid.filter(Boolean));
  const Y = V(0, 1, 0);
  /* a lipid at its true size, about 3 nm from its head to the ends of its tails: the head about 0.9 nm, two tails */
  const LIPM = { head: magicStandard({ color: 0xff9ac8, roughness: 0.5, emissive: 0x5a1838, emissiveIntensity: 0.15 }, { rim: 0xffd6ea, rimK: 0.4 }), tail: magicStandard({ color: 0xfff0f5, roughness: 0.7 }, { rim: 0xffffff, rimK: 0.15 }) };
  const LIPG = { head: new THREE.SphereGeometry(0.00045, 12, 9), tail: new THREE.CylinderGeometry(0.00011, 0.00011, 0.0021, 6) };
  function lipid3() {
    const g = new THREE.Group(); g.userData.kind = 'lipid';
    const h = new THREE.Mesh(LIPG.head, LIPM.head); h.position.y = 0.00105; h.userData.home = h.position.clone(); g.add(h);
    [-1, 1].forEach(k => { const t = new THREE.Mesh(LIPG.tail, LIPM.tail); t.position.set(k * 0.00017, -0.00045, 0); t.userData.home = t.position.clone(); g.add(t); });
    return g;
  }

  /* ---------------- smooth ER ----------------
     Close up, one tube of the smooth ER cut through, like a textbook's diagram: 50 nm across (the true width of the world's
     tubes), its wall a membrane about 6 nm thick, two layers of lipids drawn one by one (the outer layer faces the
     cytosol, the inner one the inside of the tube), seen straight along the tube, so no surface of it stands behind the
     names. Join makes a lipid from a head and two tails in the cytosol beside the tube; Add to the membrane puts the three
     into gaps in the layer that faces the cytosol (the side where the ER makes its lipids); the camera then goes out and a
     glow spreads along the net. Before: each lipid 650 nm long, about 250 times too big. Proof: tools/true-size.mjs D */
  const SER = world.P.ser.center;
  const SR = { c: 22, n: [181, 144] };   /* the wall's middle 22 nm from the tube's middle (the wall 19 to 25 nm); lipids in each layer */
  const GAPS = [82, 90, 98];             /* the three gaps in the outer layer, at the top (degrees) */
  /* the close view stands ON one real tube of the net and looks along it (12 Nov 2026; Daniel: "the original organelle
     disappears and then a new structure appears. There is no linkage between that, and it happens with the smooth
     endoplasmic reticulum"). Before, the ring stood at the middle of the place, facing the camera, on no tube: the net
     went and a ring came. Now the camera flies to a tube of the net, turns along it, and the ring is that tube's own
     cut end, with the tube running on behind it (serTube: its stump). The tube chosen: near the middle of the place, and
     the one that points most nearly at the place's own camera, so the camera turns least */
  const serFrame = () => {
    if (props.sf) return props.sf;
    const cam = V(...world.P.ser.view.pos); let best = null;
    ((W.ser && W.ser.curves) || []).forEach(c => { for (let k = 3; k <= 17; k++) {
      const t = k / 20, p = c.getPoint(t), T = c.getTangent(t).normalize(), toC = cam.clone().sub(p).normalize(), d = p.distanceTo(SER), score = Math.abs(T.dot(toC)) - 0.35 * d;
      if (d < 1.6 && (!best || score > best.score)) best = { score, c, t, p, back: T.dot(toC) > 0 ? -1 : 1, along: T.dot(toC) > 0 ? T : T.negate() };
    } });
    if (!best) return (props.sf = frameAt(SER, Y, cam));
    const n = Y.clone().addScaledVector(best.along, -Y.dot(best.along)).normalize();
    return (props.sf = { p: best.p, n, right: new THREE.Vector3().crossVectors(n, best.along), along: best.along, curve: best.c, t: best.t, back: best.back });
  };
  const sp = (x, y, z) => fp(serFrame(), x, y, z);
  const polar = (deg, r) => [Math.cos(deg * Math.PI / 180) * r, Math.sin(deg * Math.PI / 180) * r];
  const gapDeg = i => { const n0 = SR.n[0]; return Math.round(GAPS[i] / 360 * n0) * 360 / n0; };
  const gapLocal = (i, r) => { const [x, y] = polar(gapDeg(i), r / 1000); return V(x, y, 0); };
  const gapDir = i => { const [x, y] = polar(gapDeg(i), 1); return V(x, y, 0); };
  function serTube() {
    if (props.close) { props.close.visible = true; return props.close; }
    const g = frameGroup(serFrame()); g.userData.kind = 'ser-tube';
    const n0 = SR.n[0], gi = GAPS.map((_, i) => Math.round(GAPS[i] / 360 * n0)), slots = [];
    for (let i = 0; i < n0; i++) if (!gi.includes(i)) slots.push({ deg: i * 360 / n0, out: 1 });
    for (let i = 0; i < SR.n[1]; i++) slots.push({ deg: (i + 0.5) * 360 / SR.n[1], out: -1 });
    const heads = new THREE.InstancedMesh(LIPG.head, LIPM.head, slots.length), tails = new THREE.InstancedMesh(LIPG.tail, LIPM.tail, slots.length * 2);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), one = V(1, 1, 1);
    slots.forEach((s, i) => {
      const [cx, cy] = polar(s.deg, 1), dir = V(cx * s.out, cy * s.out, 0), tan = V(-cy, cx, 0), c = V(cx, cy, 0).multiplyScalar((SR.c + 1.5 * s.out) / 1000);
      q.setFromUnitVectors(Y, dir);
      heads.setMatrixAt(i, M.compose(c.clone().addScaledVector(dir, 0.00105), q, one));
      [-1, 1].forEach((k, j) => tails.setMatrixAt(i * 2 + j, M.compose(c.clone().addScaledVector(dir, -0.00045).addScaledVector(tan, k * 0.00017), q, one)));
    });
    heads.instanceMatrix.needsUpdate = true; tails.instanceMatrix.needsUpdate = true;
    heads.computeBoundingSphere(); tails.computeBoundingSphere();
    heads.userData.kind = 'ser-heads'; g.add(heads, tails);
    /* (18 Nov 2026: a new lipid moves along the outer layer by changing places with its neighbour: `inst` says which
       drawn lipid stands in each place of the outer layer, `place` moves one to another place: serWalk) */
    g.userData.inst = new Map(); { let q0 = 0; for (let i = 0; i < n0; i++) if (!gi.includes(i)) g.userData.inst.set(i, q0++); }
    g.userData.place = (k, slot) => { const [cx, cy] = polar(slot * 360 / n0, 1), dir = V(cx, cy, 0), tan = V(-cy, cx, 0), c = V(cx, cy, 0).multiplyScalar((SR.c + 1.5) / 1000);
      q.setFromUnitVectors(Y, dir); heads.setMatrixAt(k, M.compose(c.clone().addScaledVector(dir, 0.00105), q, one));
      [-1, 1].forEach((d, j) => tails.setMatrixAt(k * 2 + j, M.compose(c.clone().addScaledVector(dir, -0.00045).addScaledVector(tan, d * 0.00017), q, one)));
      heads.instanceMatrix.needsUpdate = true; tails.instanceMatrix.needsUpdate = true; };
    /* the inside of the tube, faintly tinted, so that inside and outside differ */
    const lum = new THREE.Mesh(new THREE.CircleGeometry(0.0189, 64), new THREE.MeshBasicMaterial({ color: 0x7fe0c8, transparent: true, opacity: 0.12, depthWrite: false }));
    lum.position.z = -0.0006; g.add(lum);
    /* the tube runs on behind its cut end: the net's own tube, along its own line, as a thin wall in the membrane's
       colour (the wall's middle, 22 nm from the tube's middle), about half a micrometre of it; what is far fades */
    const F = serFrame();
    if (F.curve) {
      const pts = [], L = F.curve.getLength(), loc = P => { const d = P.clone().sub(F.p); return V(d.dot(F.right), d.dot(F.n), d.dot(F.along)); };
      for (let k = 0; k <= 24; k++) { const t = F.t + F.back * k * 0.55 / 24 / L; if (t < 0 || t > 1) break; pts.push(loc(F.curve.getPoint(t))); }
      const end = pts[pts.length - 1], dir = pts.length > 1 ? end.clone().sub(pts[pts.length - 2]).normalize() : V(0, 0, -1);
      for (let d = pts.reduce((a, q, i) => a + (i ? q.distanceTo(pts[i - 1]) : 0), 0); d < 0.5; d += 0.05) pts.push(pts[pts.length - 1].clone().addScaledVector(dir, 0.05));
      const stump = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, SR.c / 1000, 28, false),
        new THREE.MeshStandardMaterial({ color: 0xf3a9cd, roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.3, depthWrite: false }));
      stump.userData.kind = 'ser-stump'; stump.renderOrder = -1; g.add(stump);
    }
    return (props.close = keep(g));
  }
  const serClose = () => { serTube(); const F = serFrame(); return nanoIn({ at: fp(F, 0, 8), dir: F.along.clone(), up: F.n.clone(), dist: fitDist(100, 84) }, NEAR_HIDE().concat(groupsOf(['ser']))); };
  /* the names: the membrane beside the tube's wall (its line ends on the wall), the cytosol outside, the inside in it */
  const serBase = () => [
    PHONE() ? ['s-mem', 'membrane of the smooth ER', [sp(0, -22), sp(-8, -20.5), sp(8, -20.5)], { up: 1, len: 34, small: '<span class="nm__t">smooth ER membrane</span>' }]
      : ['s-mem', 'membrane of the smooth ER', [sp(-22, 0), sp(22, 0), sp(-15.6, -15.6), sp(15.6, -15.6)], { sides: [-1, 1, -1, 1], small: '<span class="nm__t">smooth ER membrane</span>' }],
    ['s-cyt', 'cytosol', [sp(-40, 30), sp(40, 30), sp(-40, -27), sp(40, -27), sp(-34, 36), sp(34, 36)], { aside: false }],
    ['s-in', 'inside the smooth ER', [sp(0, -6), sp(0, -10), sp(0, -2)], { aside: false, small: '<span class="nm__t">inside the<br>smooth ER</span>' }]
  ];
  const lipW = (l, y) => props.close.localToWorld(l.position.clone().addScaledVector(Y.clone().applyQuaternion(l.quaternion), y));
  const ORD = [1, 0, 2];   /* the first lipid is made over the middle gap, at the top of the ring: the close view stands there */
  /* (a new lipid stands with the ends of its tails at the outer heads of the membrane, 26.5 nm from the tube's middle: at
     31 nm, 4.5 nm of open cytosol lay between, and a pupil would answer "made in the cytosol": the ER makes its lipids
     at the face of its membrane; the science read, 18 Nov 2026) */
  const LIP_R = 26.5;
  const newLip = i => { const l = lipid3(); l.position.copy(gapLocal(i, LIP_R)); l.quaternion.setFromUnitVectors(Y, gapDir(i)); l.userData.gap = i; props.close.add(l); return l; };
  /* ---- the courses on the smooth ER's picture, and what every pupil gains (18 Nov 2026; the places planner's plan) ----
     - the first Join is seen close up, a view 14 nm wide beside the outer face of the membrane (its heads stand along
       the foot of the picture): at the ring's size a lipid is 20 px, and its head and two tails joining were three
       small marks. The parts are named before the press. Joins 2 and 3 play from the ring's view, as before;
     - with IB (B1.1.9) the head stands as its two parts, glycerol and the phosphate group, and Join plays as three
       joins: at each one a water molecule leaves the new bond ("water · condensation"), and a label counts them;
     - with a course on, a switch compares the lipid with a fat, drawn beside it, never in the membrane: IB
       "Phospholipid · Triglyceride (a fat)"; IGCSE "Membrane lipid · Fat" (4.1.2, a new first line in story.js:
       Daniel, 17 Nov). 0610 gives no number of fatty acids: no IGCSE word says one;
     - step 2: the three new lipids keep a brighter head and move apart along the outer layer, each by a random walk
       (it changes places with a neighbour: serWalk), one carrying "new lipid"; they never change layer. With IB
       (B1.1.12): "hydrophilic head", "hydrophobic tails", then "bilayer". Each step waits for Next with a course on.
     Proof: tools/ib-level.mjs H9 */
  const serNames = (list, w = 45, c = serFrame().p) => { const F = serFrame(); nucAgain = () => serNames(list, w, c);
    quest.names.set(list.map(([key, html, spots, o]) => { const { w: cw, ...opt } = o || {}; return cName(Object.assign({ key, free: true, aside: true, html: `<span class="nm__t">${html}</span>`, spots }, opt), cw || {}); }),
      HUD().concat([...document.querySelectorAll('#stage .rtag')]), Object.assign(lr(c.clone().addScaledVector(F.right, -w / 1000), c.clone().addScaledVector(F.right, w / 1000)), { on: true }), []); };   /* (the names keep clear of the labels that ride: the count) */
  const GLYM = magicStandard({ color: 0xffc4de, roughness: 0.55, emissive: 0x4a1830, emissiveIntensity: 0.12 }, { rim: 0xffffff, rimK: 0.3 });
  const glyMesh = () => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.00013, 0.00036, 4, 8), GLYM); m.rotation.z = Math.PI / 2; m.position.set(0, 0.00062, 0); m.userData.home = m.position.clone(); m.userData.kind = 'glycerol'; return m; };
  const serView = near => { const F = serFrame(); /* (a phone: the corner box covers the top 2.8 nm of this view, so the view stands 1.8 nm higher there: the lipid and the name over it stand under the box) */
    return near ? { at: props.close.localToWorld(gapLocal(1, LIP_R + (PHONE() ? 0.9 : -0.45))), dir: F.along.clone(), up: F.n.clone(), dist: fitDist(14, PHONE() ? 12 : 10.5) } : { at: fp(F, 0, 8), dir: F.along.clone(), up: F.n.clone(), dist: fitDist(100, 84) }; };
  const inL = (l, x, y) => { l.updateWorldMatrix(true, false); return l.localToWorld(V(x / 1e6, y / 1e6, 0)); };   /* a point of a lipid's own frame (x, y in pm: 1000 to a nm) */
  /* a water molecule leaves a new bond (IB, B1.1.9: each condensation reaction releases water). `say`: with its label */
  const waters = [];
  /* (each leaves at the side of its new bond: to the left, to the right, and up; on a phone, where the corner box covers
     what is above the lipid, to the sides and down. With Reduce motion each stays 1 nm from its bond, and only the last
     carries the words: three labels 35 px apart would lie on each other) */
  const WDIR = [[-1, 0.7], [1, 0.7], [0.4, 1]], WDIRP = [[-1, -0.15], [1, -0.15], [-1, -0.75]];
  const waterOut = async (l, x, y, k, say = true) => {
    const w = keep(token('water', 0.0003)); w.position.copy(inL(l, x, y)); haloSprite(w, 0.0005, 0xbfe6ff);
    const F = serFrame(), [dx, dy] = (PHONE() ? WDIRP : WDIR)[k % 3], far = R.FAST ? 0.001 : PHONE() ? 0.003 : 0.0024, to = w.position.clone().addScaledVector(F.right, dx * far).addScaledVector(F.n, dy * far);
    /* (with Reduce motion the still names one of them through the names layer, which keeps every name clear of the
       others: a riding label stood where the whole's name goes: lipid's `parts`) */
    const tg = say && !R.FAST ? rideTag(() => w.position, () => lvHere('ib') ? 'water · condensation reaction' : '') : null;
    await tween(w, { to, ms: 1200 });
    if (R.FAST) { waters.push([w, tg]); return; }   /* (with Reduce motion each stays beside its bond until the view moves on) */
    if (tg) tg.off(); tween(w, { to: to.clone().addScaledVector(F.n, 0.0008), ms: 500, fade: 0 }).then(() => drop(w)).catch(() => {});
  };
  const watersOff = () => { waters.forEach(([w, tg]) => { if (tg) tg.off(); drop(w); }); waters.length = 0; };
  /* the fat of the compare: glycerol and three fatty acids, beside the lipid */
  const FAT = { on: false, obj: null };
  const fatShow = (l, on) => { FAT.on = on;
    if (on && !(FAT.obj && FAT.obj.parent === props.close)) { const f = new THREE.Group(); f.userData.kind = 'fat'; f.add(glyMesh());
      [-0.00026, 0, 0.00026].forEach(x => { const t = new THREE.Mesh(LIPG.tail, LIPM.tail); t.position.set(x, -0.00045, 0); f.add(t); });
      f.position.copy(l.position).add(V(-0.0043, 0, 0)); f.quaternion.copy(l.quaternion); props.close.add(f); FAT.obj = f; }   /* (on the lipid's left: on its right its names stood under the switch) */
    if (FAT.obj) FAT.obj.visible = on; world.kick(); };
  function serStrip(l, parts) {
    const s0 = quest.session; stripAgain = () => { if (quest.session === s0 && quest.cur === 'ser') serStrip(l, parts); };
    const old = document.getElementById('conc'); if (old) old.remove();
    const st = document.getElementById('stage'); if (!st) return;
    if (!courseOn()) { fatShow(l, false); parts(true); return; }
    const el = document.createElement('div'); el.id = 'conc'; el.className = 'conc conc--expr';
    const ib = lvHere('ib');
    el.innerHTML = `<p class="conc__k">${ib ? 'Compare: a phospholipid and a triglyceride' : 'Compare: a membrane lipid and a fat'}</p>`
      + `<div class="exprsw" role="group" aria-label="Which molecule the picture names"><button type="button" class="exprsw__b" data-x="0">${ib ? 'Phospholipid' : 'Membrane lipid'}</button><button type="button" class="exprsw__b" data-x="1">${ib ? 'Triglyceride (a fat)' : 'Fat'}</button></div>`
      + '<p class="exprsw__n" role="status"></p>';
    const set = on => { fatShow(l, on); el.querySelectorAll('[data-x]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.x === '1') === on)));
      el.querySelector('.exprsw__n').textContent = on
        ? (ib ? 'A triglyceride (a fat) has three fatty acids and no phosphate group.' : 'Fats and oils are large molecules made from smaller molecules: fatty acids and glycerol.')
        : (ib ? 'One glycerol links two fatty acids and one phosphate group.' : 'The IGCSE syllabus names the cell membrane (2.1.1), but not the lipids of the membrane.');
      cardOff(); parts(true); };
    el.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (b) set(b.dataset.x === '1'); });
    stripLoop(el, st); set(FAT.on);
  }
  async function lipid() {
    await toPlace('ser');
    await serClose();
    nucStep(); FAT.on = false; props.serNear = false;
    const g = props.close, F = serFrame();
    props.lipids = props.lipids || [];
    let cond = props.lipids.length * 3, cur = null;
    /* (a phone: two short lines, under the ring) */
    /* (its words say what is counted: "3 phospholipids · condensation reactions: 9 · water molecules released: 9") */
    const made = () => cond % 3 || !cond ? '' : `phospholipids made: ${cond / 3} · `;
    rideTag(() => (props.serNear && cur ? inL(cur, 0, -4600) : sp(PHONE() ? 0 : 30, PHONE() ? -30 : 40)), () => lvHere('ib') && cond && !(PHONE() && props.serCmp) ? made() + `condensation reactions: ${cond}` + (PHONE() ? '' : ` · water molecules released: ${cond}`) : '', true, () => PHONE() && lvHere('ib') && cond ? `water molecules released: ${cond}` : '', true);   /* (a phone: not while the switch stands at the picture's foot, where it would lie under it) */
    const ringNames = () => { const f = props.lipids[0]; serNames(f ? [...serBase(), ['s-lipid', 'lipid', [lipW(f, 0.0003)], { sides: [-1], w: { ib: 'phospholipid' } }], ['s-head', 'head', [lipW(f, 0.00105)], { sides: [1] }], ['s-tails', 'two tails', [lipW(f, -0.00045)], { sides: [1] }]] : serBase()); };   /* (at the ring's size a lipid is 20 px: the whole's name stands on its left, its parts' names on its right) */
    ringNames();
    for (let i = props.lipids.length; i < 3; i++) {
      if (i === 0) {
        /* the first one, close up: its parts stand apart above the membrane, named, before the press */
        const l = cur = newLip(ORD[0]), [head, t0, t1] = l.children, gly = glyMesh(); l.add(gly);
        l.userData.kind = 'lipid-parts';   /* (not a lipid yet: its parts stand apart; tools/true-size.mjs D sizes lipids) */
        const two = lvHere('ib');   /* (with IB the head's two parts stand apart: glycerol, and the phosphate group) */
        head.position.set(two ? 0.0016 : 0, 0.0023, 0); if (!two) gly.position.set(0, 0.00187, 0);   /* (up on the right: on the left it stood under the corner box, and its name had no room) */
        t0.position.set(-0.0019, -0.0003, 0); t1.position.set(0.0019, -0.0003, 0);   /* (at its sides: under it are the membrane's heads) */
        quest.names.set([], HUD()); nucAgain = null;
        props.serNear = true;
        await camGo(serView(true), R.FAST ? 0 : 1800);
        const pt = (c, dy = 0) => { l.updateWorldMatrix(true, false); return l.localToWorld(c.position.clone().add(V(0, dy, 0))); };
        const parts = joined => { const ib = lvHere('ib'), c = serView(true).at;
          const mem = ['s-mem', 'membrane of the smooth ER', [inL(l, -3600, -2500), inL(l, 3600, -2500), inL(l, -5000, -2500)], { aside: false, up: 1, len: 22, small: '<span class="nm__t">smooth ER<br>membrane</span>' }];
          /* (joined, with IB five names stand round a molecule 3 nm long: on its right the phosphate group, the whole's
             name and a fatty acid; on its left glycerol and the other fatty acid) */
          /* (the whole's name stands over the molecule, on a short upright line: beside it, its line ended on one part,
             the collar under the head or a fatty acid, and read as that part's name) */
          const lip = ['s-lipid', 'lipid', [pt(head, 0.0005)], { aside: false, up: -1, len: 26, w: { ib: 'phospholipid' } }];   /* (with IGCSE's grey mark this name is 160 px wide and two lines high: the view stands so that it clears the corner box, which reaches 418 px across and 181 px down on a laptop: the probe, 18 Nov 2026; tools/ib-level.mjs H9) */
          const own = ib ? [['s-pho', 'phosphate group', [pt(head)], { sides: [PHONE() && !joined ? -1 : 1] }], ['s-gly', 'glycerol', [pt(gly)], { sides: [joined ? -1 : 1] }], ['s-t1', 'fatty acid', [pt(t0, -0.0008)], { sides: [-1] }], ['s-t2', 'fatty acid', [pt(t1, -0.0008)], { sides: [1] }]]
            : joined ? [['s-head', 'head', [pt(head)], { sides: [1] }], ['s-tails', 'two tails', [pt(t1, -0.0005)], { sides: [1] }]]
            : [['s-head', 'head', [pt(head)], { sides: [1] }], ['s-t1', 'tail', [pt(t0)], { sides: [-1] }], ['s-t2', 'tail', [pt(t1)], { sides: [1] }]];
          const f = FAT.on && FAT.obj, fp0 = (x, y) => { f.updateWorldMatrix(true, false); return f.localToWorld(V(x, y, 0)); };
          /* (a phone: the two molecules stand 100 px apart: only the fat's own name has room; its parts are in the switch's line) */
          const fat = !f ? [] : PHONE() ? [['s-fat', 'fat', [fp0(0, -0.0015)], { aside: false, up: 1, len: 8, w: { ib: 'triglyceride<br>(a fat)' } }]]   /* (a phone: under it; over it, it lay on the name over the lipid beside it: the probe, 18 Nov 2026) */
            : [['s-fat', 'fat', [fp0(0, 0.00078)], { aside: false, up: -1, len: 8, w: { ib: 'triglyceride<br>(a fat)' } }], ['s-fg', 'glycerol', [fp0(-0.0002, 0.00062)], { sides: [-1] }], ['s-ff', 'fatty acid', [fp0(-0.00026, -0.0008)], { sides: [-1], w: { ib: 'three<br>fatty acids' } }]];
          const wat = R.FAST && ib && joined && waters.length ? [['s-w', 'water · condensation reaction', [waters[0][0].position.clone()], { sides: [-1] }]] : [];
          /* (a phone, while the fat is shown: the membrane's name gives its place under the fat to the fat's name) */
          serNames([...(PHONE() && f ? [] : [mem]), ...(joined ? [lip] : []), ...(f ? [] : own), ...fat, ...wat], PHONE() ? 10 : 7, c); nucAgain = () => parts(joined); };
        parts(false);
        /* (a phone: under the parts; on their right it was pushed up over the phosphate group) */
        await press(() => PHONE() ? inL(l, 0, -3700) : inL(l, lvHere('ib') ? 6100 : 4300, 700), 'Join (1 of 3)',   /* (with IB the button's words are longer, "Form a phospholipid (1 of 3)": it stands further right, clear of the name "glycerol") */
          { cost: COST.lipid, key: 'lipid-0', w: 'serjoin', tail: ' (1 of 3)' });
        quest.names.set([], HUD()); nucAgain = null;
        if (lvHere('ib')) {
          /* three joins, each a condensation reaction: a fatty acid, the other fatty acid, then the phosphate group */
          if (gly.position.distanceTo(gly.userData.home) > 1e-7) tween(gly, { to: gly.userData.home, ms: 600 });
          await tween(t0, { to: t0.userData.home, ms: 900 }); cond++; waterOut(l, -260, 620, 0);
          await tween(t1, { to: t1.userData.home, ms: 900 }); cond++; waterOut(l, 260, 620, 1);
          await tween(head, { to: head.userData.home, ms: 900 }); cond++; await waterOut(l, 300, 760, 2);   /* (from the side of the joint: from behind the head, its words stood on the phosphate group) */
        } else { await Promise.all([head, gly, t0, t1].map(c => tween(c, { to: c.userData.home, ms: 900 }))); cond += 3; }
        l.userData.kind = 'lipid';
        burst(scene, lipW(l, 0), { n: 14, r: 0.003, size: 0.0006, near: 0.0005, color: 0xffb3d6, ms: 800 });
        props.lipids.push(l);
        parts(true);
        if (courseOn()) { props.serCmp = true; serStrip(l, parts); await quest.next(); props.serCmp = false; stripAgain = null; stripOff(); fatShow(l, false); }
        else await wait(R.TEST ? 0 : 1600);
        watersOff(); quest.names.set([], HUD()); nucAgain = null; cardOff();
        props.serNear = false;
        await camGo(serView(false), R.FAST ? 0 : 1800);
        ringNames();
        continue;
      }
      await press(() => g.localToWorld(gapLocal(1, 43)), `Join (${i + 1} of 3)`, { cost: COST.lipid, key: 'lipid-' + i, w: 'serjoin', tail: ` (${i + 1} of 3)` });
      /* a head and two tails, apart in the cytosol, come together into one lipid */
      const l = newLip(ORD[i]);
      l.children.forEach((c, j) => c.position.add(V(Math.cos(j * 1.17 + 0.4) * 0.0032, Math.sin(j * 1.17 + 0.4) * 0.0032, 0)));   /* (from its sides and above: under it is the membrane) */
      await Promise.all(l.children.map(c => tween(c, { to: c.userData.home, ms: 900 })));
      if (lvHere('ib')) [0, 1, 2].forEach(k => waterOut(l, (k - 1) * 260, 700, k, k === 2));
      cond += 3;
      burst(scene, lipW(l, 0), { n: 14, r: 0.003, size: 0.0006, near: 0.0005, color: 0xffb3d6, ms: 800 });
      props.lipids.push(l);
      ringNames();
    }
    quest.say('Three lipids: each one has a head and two tails, and is about 3 nm long.', 'ok');
    if (courseOn()) { await quest.next(); watersOff(); }
  }
  /* the three new lipids move apart along the outer layer: each changes places with a neighbour, again and again, to
     the left or to the right by chance (a random walk; the same walk every time, from a fixed seed). They stay in the
     outer layer: no line of the place speaks of a change of layer */
  async function serWalk(L, ms) {
    const g = props.close, n0 = SR.n[0], inst = g.userData.inst; let sd = 39;   /* (this seed leaves one of the three on each side of where they joined, and one near it: 2 places left, 11 left, 10 right; the first seed left all three on one side) */
    const rnd = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
    const put = (l, slot) => { const [x, y] = polar(slot * 360 / n0, (SR.c + 1.5) / 1000), [dx, dy] = polar(slot * 360 / n0, 1); l.position.set(x, y, 0); l.quaternion.setFromUnitVectors(Y, V(dx, dy, 0)); l.userData.slot = slot; };
    L.forEach(l => { l.userData.slot = Math.round(GAPS[l.userData.gap] / 360 * n0); });
    const once = () => L.forEach(l => { const a = l.userData.slot, b = (a + (rnd() < 0.5 ? -1 : 1) + n0) % n0; if (!inst.has(b)) return; const k = inst.get(b); g.userData.place(k, a); inst.delete(b); inst.set(a, k); put(l, b); });
    g.userData.walked = true;
    const N = 64, s0 = quest.session;
    for (let k = 0; k < N; k++) { if (quest.session !== s0) return; once(); world.kick(); if (ms) await wait(ms / N); }
    props.walkEnd = L.map(l => ({ from: Math.round(GAPS[l.userData.gap] / 360 * n0), slot: l.userData.slot, r: Math.round(l.position.length() * 1e5) / 100 }));
  }
  async function layer() {
    await toPlace('ser');
    /* (the step watched again: the ring as it was, three gaps in its outer layer) */
    if (props.close && props.close.userData.walked) { drop(props.close); props.close = null; props.lipids = null; }
    await serClose();
    nucStep();
    const g = props.close, F = serFrame();
    const L = props.lipids && props.lipids.length === 3 ? props.lipids : ORD.map(newLip);
    /* (the three keep a brighter head: they can be told from the others when they have joined the layer) */
    L.forEach(l => { const h = l.children[0]; if (!h.userData.lit) { h.material = h.material.clone(); h.material.emissive.setHex(0xff4f9e); h.material.emissiveIntensity = 1.1; h.userData.lit = 1; haloSprite(h, 0.0016, 0xff9ac8); } });
    const one = L.find(l => l.userData.gap === 2) || L[2];
    const at = (deg, r) => { const [x, y] = polar(deg, r / 1000); return g.localToWorld(V(x, y, 0)); };
    const lipName = () => ['s-lip', 'new lipid', [lipW(L[0], 0.00105), lipW(L[2], 0.00105)], { sides: [1, -1] }];
    const names = (inMem, noLip) => { const ib = lvHere('ib');
      serNames([...serBase(), ...(noLip ? [] : [lipName()]), ...(ib ? [['s-hh', 'hydrophilic head', [at(52, SR.c + 2.55), at(128, SR.c + 2.55)], { sides: [1, -1] }], ['s-ht', 'hydrophobic tails', [at(40, SR.c + 0.9), at(140, SR.c + 0.9)], { sides: [1, -1] }]] : []),
        ...(ib && inMem ? [['s-bi', 'bilayer', [at(205, SR.c), at(335, SR.c)], { sides: [-1, 1] }]] : [])]); nucAgain = () => names(inMem, noLip); };
    names(false);
    await press(() => g.localToWorld(gapLocal(1, 43)), 'Add to the membrane', {});
    const tg = rideTag(() => lipW(one, PHONE() ? -0.0016 : 0.0012), () => lvHere('ib') ? 'head towards the cytosol (mostly water)' + (PHONE() ? '' : ' · tails in the middle of the membrane') : '', PHONE(), () => PHONE() && lvHere('ib') ? 'tails in the middle of the membrane' : '');   /* (a phone: under the lipid, the corner box is above it. "out" and "in" read wrongly beside "inside the smooth ER"; "mostly water" is the Word bank's own word for the cytosol) */
    if (lvHere('ib')) names(false, true);   /* (while that label stands, it is the new lipids' name) */
    await Promise.all(L.map(l => tween(l, { to: gapLocal(l.userData.gap, SR.c + 1.5), ms: 1100 })));
    burst(scene, g.localToWorld(gapLocal(1, 25)), { n: 24, r: 0.006, size: 0.0007, near: 0.0006, color: 0xffb3d6 });
    names(true);
    quest.say('The new lipids are part of the membrane of the ER. They spread through it, as far as the rough ER.', 'ok');
    await wait(R.TEST ? 0 : 2000);
    tg.off();
    /* they move apart in the layer; one keeps its name on the way */
    serNames(serBase().concat(lvHere('ib') ? [['s-bi', 'bilayer', [at(205, SR.c), at(335, SR.c)], { sides: [-1, 1] }]] : []));
    const tg2 = rideTag(() => lipW(one, PHONE() ? -0.0016 : 0.0012), () => 'new lipid', PHONE(), () => lvHere('igcse') && !lvHere('ib') ? 'not named in 0610' : '');
    await serWalk(L, R.FAST ? 0 : 4000);
    await wait(R.TEST ? 0 : 1400);
    tg2.off();
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    await nanoOut(world.P.ser.view);
    await live(wave(scene, SER, { color: 0xffc8e4, to: 7, ms: R.FAST ? 0 : 2000 }));
    await quest.gain('lipids', SER);
    props.lipids = null;
    await quest.next('Back to the map');
  }

  /* ---------------- Golgi apparatus ----------------
     Close up, the stack cut through, every size true: six sacs, each two membranes (6 nm, two layers of lipids) round a
     space 18 nm wide, 42 nm apart (electron tomography: the middle of a sac about 20 nm thick, about 10 nm between sacs,
     the rims swollen; Engel et al. 2015, PNAS 112:11264), about 0.9 µm across, a shallow bowl; seen straight at the cut,
     a thin slice, so no surface stands behind the names. The vesicle from the rough ER (70 nm, as there) joins the first
     sac; amylase (about 5 nm: a speck at this size, glowing and named) goes sac by sac: along the sac to its rim, then in
     a small vesicle (about 60 nm) to the next sac's rim. In the third sac the camera goes close (scale bar about 10 nm)
     while three sugars join the short chain of sugars that amylase already carries (some salivary amylase carries sugars;
     the first ones are added in the rough ER). At the top the proteins are sorted: a vesicle to a lysosome about 80 nm,
     the large vesicle 0.9 µm (as the microtubules carry it), which then fills with amylase. The world's own Golgi (its
     sacs drawn about 200 nm apart) is hidden while the camera is close and comes back only once it is far.
     Before: amylase 320 to 360 nm, the vesicles 640 and 840 nm. Proof: tools/true-size.mjs E */
  const G = W.golgi.group;
  const sacPoint = (k) => G.localToWorld(V(1.2, k * 0.2 + 0.25, 0.9));
  const GS = { n: 6, step: 42, th: 30, w: 450, rise: 60 };
  const bowl = x => GS.rise * Math.pow(x / GS.w, 2);
  const sacW = k => GS.w - 12 * k;                    /* half its width */
  /* the middle of sac k at x (nm): a shallow bowl, the rims fanning out (each rim swells, and between the sacs there is
     only about 10 nm: without the fan, neighbouring rims crossed) */
  const sacY = (k, x = 0) => k * GS.step + bowl(x) + (k - 2.5) * 30 * smooth(sacW(k) - 150, sacW(k) - 20, Math.abs(x));
  function golgiFrame() {
    if (props.gf) return props.gf;
    const n = Y.clone().applyQuaternion(G.getWorldQuaternion(new THREE.Quaternion())).normalize();
    return (props.gf = frameAt(sacPoint(0), n, V(...world.P.golgi.view.pos)));
  }
  const gp = (x, y, z) => fp(golgiFrame(), x, y, z);
  /* sac k's outline, inset nm inside its outer surface: flat, swollen at its rims, its ends rounded.
     (18 Nov 2026: the two vesicles form on the last sac, so its outline can open. o.wl: its left rim nearer the middle,
     since the sac gives membrane to the large vesicle. o.neck, 0 to 1: a neck open upwards at GT.x, that part of
     GT.h high, its inside o.half nm wide each side. o.mouth: its right end has a flat face (o.md nm out from the cap's
     middle), with a mouth that many nm high each side of the middle, where the small vesicle's own membrane goes on
     (lysMake); 0.01: the face closed. With a neck or an open mouth the outline is one or two open lines, and sacGeo
     joins the lines of two insets into the membrane's layer) */
  const GT = { x: -60, half: 14, h: 20, wl: 250 };   /* nm: the neck's middle, half the width of its inside, its height above the sac; the last sac's left rim once the large vesicle has formed */
  const sacTop5 = x => sacY(5, x) + GS.th / 2;
  const neckTop = (nf = 1) => sacTop5(GT.x) + GT.h * nf;
  function sacPaths(k, inset, o = {}) {
    const wr = sacW(k) - inset, wl = (o.wl || sacW(k)) - inset, seq = [], V2 = (x, y) => new THREE.Vector2(x, y);
    const hf = x => GS.th / 2 - inset + 14 * (x >= 0 ? smooth(wr - 90, wr - 10, x) : smooth(wl - 90, wl - 10, -x));
    const top = x => sacY(k, x) + hf(x), bot = x => sacY(k, x) - hf(x), xs = []; for (let i = 0; i <= 40; i++) xs.push(-wl + (wl + wr) * i / 40);
    /* the top, left to right, with the neck */
    if (o.neck) {
      const hw = (o.half != null ? o.half : GT.half) + 6 - inset, xL = GT.x - hw, xR = GT.x + hw, H = neckTop(o.neck);
      xs.filter(x => x < xL - 1).forEach(x => seq.push(V2(x, top(x)))); seq.push(V2(xL, top(xL)), V2(xL, H), null, V2(xR, H), V2(xR, top(xR)));
      xs.filter(x => x > xR + 1).forEach(x => seq.push(V2(x, top(x))));
    } else xs.forEach(x => seq.push(V2(x, top(x))));
    /* the right end: round, or flat with a mouth */
    const cy = sacY(k, wr), r = hf(wr);
    if (o.mouth) {
      /* a flat face o.md nm out from the cap's middle, the cap's round shoulders behind it, and in the face a mouth while
         it is open (a flat end alone met the sac's slanting top in a sharp point) */
      const d = Math.min(o.md || 0, r), c = Math.sqrt(Math.max(0, r * r - d * d)), g = Math.acos(Math.min(1, d / r)), open = o.mouth > 0.02, m = Math.min(o.mouth, c), arc = g < Math.PI / 2 - 0.01;
      for (let i = 1; i <= 6 && arc; i++) { const a = Math.PI / 2 - (Math.PI / 2 - g) * i / 6; seq.push(V2(wr + r * Math.cos(a), cy + r * Math.sin(a))); }
      if (open) { if (m < c - 0.01) seq.push(V2(wr + d, cy + m)); seq.push(null); if (m < c - 0.01) seq.push(V2(wr + d, cy - m)); }
      for (let i = 6; i >= 1 && arc; i--) { const a = -(Math.PI / 2 - (Math.PI / 2 - g) * i / 6); seq.push(V2(wr + r * Math.cos(a), cy + r * Math.sin(a))); }
    }
    else for (let i = 1; i < 12; i++) { const a = Math.PI / 2 - Math.PI * i / 12; seq.push(V2(wr + r * Math.cos(a), cy + r * Math.sin(a))); }
    for (let i = 40; i >= 0; i--) seq.push(V2(xs[i], bot(xs[i])));
    const cl = sacY(k, -wl), rl = hf(-wl);
    for (let i = 1; i < 12; i++) { const a = -Math.PI / 2 - Math.PI * i / 12; seq.push(V2(-wl + rl * Math.cos(a), cl + rl * Math.sin(a))); }
    /* cut at each opening; the line that began at the top's left end goes on from the last opening */
    const parts = [[]]; seq.forEach(p => { if (p) parts[parts.length - 1].push(p); else parts.push([]); });
    if (parts.length > 1) parts[0] = parts.pop().concat(parts[0]);
    return parts;
  }
  const sacPts = (k, inset, o) => [].concat(...sacPaths(k, inset, o));
  const sacGeo = (k, a, b, o = {}) => {
    const A = sacPaths(k, a, o), B = sacPaths(k, b, o), open = !!(o.neck || o.mouth > 0.02);
    const shapes = open ? A.map((p, i) => new THREE.Shape(p.concat(B[i].slice().reverse()))) : (() => { const s = new THREE.Shape(A[0]); s.holes.push(new THREE.Path(B[0])); return [s]; })();
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 3, bevelEnabled: false }); geo.translate(0, 0, -1.5); geo.scale(0.001, 0.001, 0.001); return geo;
  };
  /* sac k drawn (again): its membrane's three layers and its inside */
  function sacDraw(g, k, o = {}) {
    const M = g.userData.mats;
    g.children.filter(c => c.userData.sacOf === k).forEach(c => { g.remove(c); c.geometry.dispose(); });
    [[0, 1.2, M.head, 'golgi-sac'], [1.2, 4.8, M.tail], [4.8, 6, M.head]].forEach(([a, b, m, kind]) => { const mesh = new THREE.Mesh(sacGeo(k, a, b, o), m); if (kind) { mesh.userData.kind = kind; mesh.userData.k = k; } mesh.userData.sacOf = k; g.add(mesh); });
    const lg = new THREE.ShapeGeometry(new THREE.Shape(sacPts(k, 6, o))); lg.scale(0.001, 0.001, 0.001);
    const l = new THREE.Mesh(lg, M.lum); l.position.z = -0.0016; l.userData.kind = 'golgi-lumen'; l.userData.k = k; l.userData.sacOf = k; g.add(l);
    if (k === 5) g.userData.o5 = o;
  }
  function golgiStack() {
    if (props.close) { props.close.visible = true; return props.close; }
    const g = frameGroup(golgiFrame()); g.userData.kind = 'golgi-stack';
    g.userData.mats = { head: magicStandard({ color: 0xeaa632, roughness: 0.4, emissive: 0x4a2c04, emissiveIntensity: 0.2 }, { rim: 0xffe0a0, rimK: 0.4 }),
      tail: magicStandard({ color: 0xfff3d6, roughness: 0.7 }, { rim: 0xffffff, rimK: 0.15 }),
      lum: new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }) };
    for (let k = 0; k < GS.n; k++) sacDraw(g, k);
    return (props.close = keep(g));
  }
  /* the last sac as it is now: whole, or with what forms on it */
  const lastSac = (o = {}) => { const g = golgiStack(), n = g.userData.o5 || {}; if (['neck', 'wl', 'mouth', 'half', 'md'].every(f => (n[f] || 0) === (o[f] || 0))) return; sacDraw(g, 5, o); world.kick(); };
  /* the views: the stack's right half with what joins it from below; the top, where the large vesicle forms; (18 Nov
     2026) the last sac's right rim, where the small vesicle forms; the last sac from the neck to that rim, where the
     proteins are sorted */
  const GV = { stack: [230, 40, 700, 620], top: [0, 560, 1080, 1270], stackP: [400, 150, 700, 620], topP: [120, 620, 2100, 1270],
    rim: [445, 330, 330, 250], rimP: [425, 345, 250, 300], sort: [205, 300, 640, 400], sortP: [250, 330, 600, 500] };   /* (a phone: from the neck to where the small vesicle stands once it has moved off the sac) */
  async function golgiClose(which, ms) {
    golgiStack(); const F = golgiFrame(), [x, y, w, h] = PHONE() ? GV[which + 'P'] : GV[which];
    /* (and the world's lysosomes: one stood beside the small vesicle to a lysosome, and looked like it) */
    if (!NZ.on) return nanoIn({ at: gp(x, y), dir: F.along.clone(), up: F.n.clone(), dist: fitDist(w, h) }, NEAR_HIDE().concat(groupsOf(['golgi', 'lysosomes'])));
    await camGo({ at: gp(x, y), dir: F.along.clone(), up: F.n.clone(), dist: fitDist(w, h) }, R.FAST ? 0 : (ms || 1800));
  }
  /* ---- the courses on the Golgi's picture (18 Nov 2026; the places planner's plan-golgi) ----
     Every pupil: a name rides with what moves (the vesicle that joins, amylase from sac to sac); in the third sac an
     enzyme of the sac stands on its membrane, each sugar comes along the inside of the sac to that enzyme, which joins
     it to the chain, and a count is built; both vesicles form on the last sac in the picture (before, they stood there
     whole from the first frame); each protein goes to its vesicle inside the sac and through that vesicle's neck,
     never across a membrane; at Package amylase streams from the last sac through the neck into the large vesicle.
     IB: the lines' own words as names and buttons (CARDS golgi); at HL the small vesicle forms in a coat of clathrin
     (clathrin.js, the way out's). IGCSE: one grey mark, on the sac's name (0610 does not name the Golgi apparatus). */
  const GOLW = key => (key === 'g-sac' ? { ib: 'Golgi apparatus:<br>this stack of sacs', ibSmall: PHONE() ? 'Golgi<br>apparatus' : 'Golgi apparatus:<br>this stack of sacs', card: 'g-golgi' } : null);   /* (a phone: the short name; on a laptop the whole words, or the name read as one sac's) */
  const golItem = ([key, html, spots, o]) => { const { w, ...opt } = o || {}; return cName(Object.assign({ key, free: true, aside: true, html: `<span class="nm__t">${html}</span>`, spots }, opt), Object.assign({}, GOLW(key), w)); };
  const golNames = (F, list, solid = [], w = 300, c = F.p) => { nucAgain = () => golNames(F, list, solid, w, c);
    quest.names.set((typeof list === 'function' ? list() : list).filter(Boolean).map(golItem), [...HUDR(), ...document.querySelectorAll('#stage .rtag')], Object.assign(lr(c.clone().addScaledVector(F.right, -w / 1000), c.clone().addScaledVector(F.right, w / 1000)), { on: true }), (typeof solid === 'function' ? solid() : solid).filter(Boolean)); };   /* (the names keep off the labels that ride, and off the scale bar) */
  /* (beside the fourth sac's right rim: above the last sac, its two lines with a course on stood over the picture's top edge) */
  const SACN = () => ['g-sac', 'a sac of the<br>Golgi apparatus', [gp(sacW(3) + 29, sacY(3, sacW(3))), gp(sacW(2) + 29, sacY(2, sacW(2)))], Object.assign({ sides: [1, 1] }, PHONE() ? { small: '<span class="nm__t">a Golgi sac</span>' } : {})];   /* (the short name on a phone only: on a laptop it had replaced the whole name) */
  const gNames = (list, solid) => golNames(golgiFrame(), () => [SACN(), ...(typeof list === 'function' ? list() : list)], solid, 300);
  /* the first and the last sac, each named at its right rim (beside the stack, not over a sac) */
  /* (under the first sac: its right end is where the vesicle joins, and on a phone amylase's name stands beside it) */
  const FIRSTN = (w = {}) => ['g-first', 'first sac', [300, 220, 360].map(x => gp(x, sacY(0, x) - 15)), { aside: false, up: 1, len: 12, w: Object.assign({ card: 'g-first' }, w) }];
  const LASTN = () => ['g-last', 'last sac', [gp(sacW(5) + 29, sacY(5, sacW(5)))], { sides: [1] }];
  /* spots round a large round part's edge, each name beside it on the outer side: right, up-right, down-right, then left */
  const rimSpots = (F, c, r) => { const P = [], S = []; [0, 40, -40, 180, 140, 220].forEach(d => { const a = d * Math.PI / 180; P.push(c.clone().addScaledVector(F.right, Math.cos(a) * r).addScaledVector(F.n, Math.sin(a) * r)); S.push(Math.cos(a) > 0 ? 1 : -1); }); return [P, { sides: S }]; };
  const OUTSM = { small: '<span class="nm__t">vesicle:<br>out of the cell</span>' }, LYSSM = { small: '<span class="nm__t">to a<br>lysosome</span>' };
  const speckName = a => ['g-amy', 'amylase', ...edge(a.getWorldPosition(V()), 0.0045)];
  /* a speck of amylase that can be found: a soft glow round it */
  const amySpeck = () => { const a = calm(token('amylase', TSZ.amy)); haloSprite(a, 0.009, 0xfff1a8); return a; };
  /* ---- a sac's right end as a port (18 Nov 2026, the science read: at every joining "the vesicle shrinks to a fifth
     and fades, and amylase crosses the sac's unbroken membrane") ----
     Where a vesicle buds from a sac's end or fuses with it, that end opens (sacPaths `mouth`: a flat face with a mouth
     24 nm high) and what the vesicle carries goes through the opening; a vesicle that fuses goes flat against the face
     as its membrane becomes the sac's. No protein crosses a membrane at any joining. */
  const portD = m => Math.sqrt(Math.max(0, 529 - Math.min(23, m + 4) ** 2));
  const portSet = (k, m, md = portD(m)) => { const g = golgiStack(); if (k === 5) lastSac(Object.assign({}, g.userData.o5, { mouth: m, md: m ? md : 0 })); else { sacDraw(g, k, m ? { mouth: m, md } : {}); world.kick(); } };
  const portOpen = k => play(260, e => portSet(k, 0.01 + 11.99 * e));
  const portShut = async k => { await play(240, e => portSet(k, 12 - 11.99 * e)); await play(200, e => portSet(k, 0.01, 22.65 + 6.35 * e)); portSet(k, 0); };
  /* a vesicle of radius r (µm) at sac k's open end, grown to s of its size: its near side on the end's flat face */
  const portAt = (k, r, s = 1) => gp(sacW(k) + portD(12) + 1000 * r * s * 0.94, sacY(k, sacW(k)));
  const frameQ = () => { const F = golgiFrame(); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(F.right, F.n, F.along)); };
  /* a part along the inside of sac k to x1 (nm), dy nm from the middle of its inside */
  const alongSac = (k, p, x1, dy, ms) => { const F = golgiFrame(), x0 = p.position.clone().sub(F.p).dot(F.right) * 1000; return play(ms, e => { const x = x0 + (x1 - x0) * smooth(0, 1, e); p.position.copy(gp(x, sacY(k, x) + dy * Math.min(1, 4 * e))); }); };
  /* a vesicle (turned to the stack's frame: frameQ) fuses with sac k's end: the end opens, the vesicle goes flat against
     it, what it carries goes through the opening and along the inside of the sac to x1; then the end closes */
  async function fuseAt(k, v, r, a, x1, slow = 1) {
    await portOpen(k);
    const sh = v.userData.shell, op = sh.material.opacity;
    await Promise.all([play(650 * slow, e => { const s = 1 - 0.94 * e; v.scale.set(s, 1 - 0.45 * e, 1 - 0.45 * e); v.position.copy(portAt(k, r, s)); sh.material.opacity = op * (1 - smooth(0.55, 1, e)); }),
      (async () => { await tween(a, { to: gp(sacW(k) - 8, sacY(k, sacW(k) - 8)), ms: 450 * slow }); await alongSac(k, a, x1, 0, 550 * slow); })()]);
    drop(v);
    await portShut(k);
  }
  async function join() {
    nucStep();
    await toPlace('golgi');
    const F = golgiFrame(), R0 = TSZ.ves;
    const v = calm(keep(token('vesicle', R0))), a = amySpeck(); v.quaternion.copy(frameQ()); v.add(a); v.position.copy(gp(sacW(0) + 40, -190));
    await golgiClose('stack'); lastSac();   /* (the vesicle is there before the dive: it comes into sight as the camera comes near) */
    gNames(() => [(([sp, o]) => ['g-ves', 'vesicle from the rough ER', sp, Object.assign({}, o, { small: '<span class="nm__t">vesicle from<br>the rough ER</span>' })])(edge(v.position, 0.034)), speckName(a), FIRSTN()], [v]);
    await press(() => v.position.clone().addScaledVector(F.n, -0.055), 'Join', { side: 'b', w: 'goljoin' });
    /* (its name rides with it; while its membrane joins the sac's, IB at HL: the line's own word, "fuses") */
    let fusing = false;
    gNames(() => [FIRSTN()], [v]);
    const tg = rideTag(() => v.position.clone().addScaledVector(F.n, -0.036), () => (fusing && ibHL() ? 'vesicle · fuses with the first sac' : 'vesicle from the rough ER'), true);
    wayArrow(new THREE.LineCurve3(v.position.clone(), portAt(0, R0)), arrowR());   /* (Reduce motion, a course on: the still showed only the result, no joining) */
    await tween(v, { to: portAt(0, R0), ms: 1300 });
    /* the vesicle's membrane joins the membrane of the first sac, at the sac's end: amylase goes through the opening into the sac */
    scene.attach(a); kept.push(a); fusing = true;
    await fuseAt(0, v, R0, a, sacW(0) - 110, courseOn() ? 1.7 : 1);
    tg.off();
    props.amy = a; props.k = 0;
    gNames(() => [speckName(a), FIRSTN({ hl: PHONE() ? 'first sac:<br>the vesicle<br>fused with it' : 'first sac:<br>the vesicle fused with it' })]);
    quest.say('The vesicle from the rough ER, about 70 nm across, joins the first sac. Your amylase is inside it.', 'ok');
    if (courseOn()) await quest.next();
  }
  /* three sugars join the end of the short chain that amylase carries, close up. (18 Nov 2026: an enzyme of the sac
     joins them: a protein on the sac's membrane, about 6 nm, blue, where amylase is amber; each sugar comes along the
     inside of the sac from beyond the picture's edge, with a light, to the enzyme, and from it onto the chain. Before,
     each bead was made in one frame 4 nm from amylase, and nothing in the picture added it) */
  const SUGM = magicStandard({ color: 0x8fe3a0, roughness: 0.45, emissive: 0x1f5a2a, emissiveIntensity: 0.25 }, { rim: 0xd8ffe0, rimK: 0.5 });
  const sugarAt = (a, i) => V(0.0004 * Math.sin(i * 1.3), 0.00265 + i * 0.00082, 0.0003 * Math.cos(i * 1.7));
  const SUG_AT = () => gp(sacW(2) - 110, sacY(2, sacW(2) - 110));   /* where amylase stops in the third sac */
  function golgiEnz() {
    if (props.genz) return props.genz;
    const e = keep(token('protein', 0.003)), F = golgiFrame();
    e.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.setHex(0x4f7df0); if (o.material.emissive) { o.material.emissive.setHex(0x10245e); o.material.emissiveIntensity = 0.3; } e.userData.mat = o.material; } });
    /* on the membrane's inner face (9 nm from the middle of the sac's inside), beside where the chain of sugars will end */
    e.position.copy(SUG_AT()).addScaledVector(F.right, sugarAt(null, 4).dot(F.right) + 0.0036).addScaledVector(F.n, 0.0063);
    return (props.genz = e);
  }
  async function sugars(a) {
    const F = golgiFrame(), view = { at: a.position.clone().addScaledVector(F.n, PHONE() ? 0.0082 : 0), dir: F.along.clone(), up: F.n.clone(), dist: PHONE() ? fitDist(58, 28) : fitDist(34, 28) };   /* (a phone: further out, so that the enzyme's and amylase's names have room beside them, and lower in the picture: the corner box stands over its top) */
    const glow = a.children.find(c => c.isSprite); if (glow) glow.visible = false;   /* close up it would fill the picture */
    const enz = golgiEnz(); cardOff();
    const bead = () => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.0004, 12, 9), SUGM); b.userData.kind = 'sugar'; return b; };
    if (!a.userData.sugars) { a.userData.sugars = [0, 1].map(i => { const b = bead(); b.position.copy(sugarAt(a, i)); a.add(b); return b; }); }
    await camGo(view, R.FAST ? 0 : 2000);
    const tipW = i => a.localToWorld(sugarAt(a, i).clone());
    const body = a.children.find(c => c.isMesh && !c.userData.kind);   /* names keep off amylase itself, not off its sugars */
    let n = 0;
    const names = () => golNames(F, () => [
      (([sp, o]) => ['g-amy2', 'amylase', sp, Object.assign({}, o, { w: { hl: PHONE() ? 'this<br>amylase: a<br>glycoprotein' : 'this amylase:<br>a glycoprotein', card: 'g-gly' } })])(PHONE() ? [[a.position.clone().addScaledVector(F.n, -0.0026).addScaledVector(F.right, -0.0036), a.position.clone().addScaledVector(F.n, -0.0038).addScaledVector(F.right, -0.003)], { sides: [-1, -1] }] : edge(a.position, 0.0036)),   /* (a phone: on the left of its lower part, under the sugars' name: on the right it took the place of the enzyme's name, whose card could then not be opened) */
      ['g-sug', 'sugars', [tipW(0), tipW(a.userData.sugars.length - 1)], { sides: [-1, -1] }],
      ['g-enz', 'enzyme of the<br>Golgi apparatus', [enz.position.clone().addScaledVector(F.right, 0.003), enz.position.clone().addScaledVector(F.right, -0.003).addScaledVector(F.n, 0.0012)], { sides: [1, -1], small: '<span class="nm__t">enzyme of<br>the Golgi<br>apparatus</span>', w: { card: 'g-enz' } }],
      ['g-mem', 'membrane of the sac', [a.position.clone().addScaledVector(F.n, -0.012).addScaledVector(F.right, -0.007), a.position.clone().addScaledVector(F.n, -0.012).addScaledVector(F.right, 0.007)], { aside: false, up: 1, len: 12 }]], [body, enz], 8, a.position);
    names();
    quest.say('In the sacs, the Golgi apparatus modifies proteins: it adds sugars to some of them.');
    /* (a phone: the count stands over the sac's upper membrane; under amylase it took the only room for amylase's own name, so at HL "this amylase: a glycoprotein" and its card were left out) */
    const cnt = rideTag(() => a.position.clone().addScaledVector(F.n, PHONE() ? 0.0098 : -0.0034), () => n ? `sugars joined here: ${n}` : '', !PHONE(), null, true);
    const hand = enz.position.clone().addScaledVector(F.right, -0.0027).addScaledVector(F.n, -0.0017);   /* the enzyme's side that faces the chain */
    for (let i = 2; i < 5; i++) {
      const b = keep(bead()); haloSprite(b, 0.0016, 0xc8ffd0);
      b.position.copy(a.position).addScaledVector(F.right, 0.05).addScaledVector(F.n, 0.0025);
      const tg = i === 2 ? rideTag(() => b.position, 'a sugar') : null;
      await tween(b, { to: hand, ms: 1500 });
      /* the enzyme joins it to the chain's end */
      const m = enz.userData.mat, e0 = m.emissiveIntensity;
      await play(380, k => { m.emissiveIntensity = e0 + 1.4 * Math.sin(Math.PI * k); });
      m.emissiveIntensity = e0;
      if (tg) tg.off();
      b.children.filter(c => c.isSprite).forEach(c => b.remove(c));
      a.attach(b); kept = kept.filter(x => x !== b);
      await tween(b, { to: sugarAt(a, i), ms: 450 });
      a.userData.sugars.push(b); n++;
      burst(scene, a.localToWorld(sugarAt(a, i).clone()), { n: 8, r: 0.0012, size: 0.00025, near: 0.0002, color: 0xc8ffd0, ms: 600 });
      names();
    }
    if (courseOn()) await quest.next(); else await wait(R.TEST ? 0 : 1600);
    cnt.off(); quest.names.set([], HUD()); nucAgain = null; cardOff();
    await golgiClose('stack', 2000);
    if (glow) glow.visible = true;
  }
  async function through() {
    nucStep();
    await golgiClose('stack'); lastSac();
    const F = golgiFrame();
    const a = props.amy || (() => { const t = keep(amySpeck()); t.position.copy(gp(sacW(0) - 110, sacY(0, sacW(0) - 110))); return (props.amy = t); })();
    props.k = props.k || 0;
    golgiEnz();   /* (the third sac's enzyme is in the picture from the step's first frame) */
    while (props.k < 5) {
      gNames(() => [speckName(a), FIRSTN()]);
      await press(() => a.position.clone().addScaledVector(F.right, 0.03), `Next sac (${props.k + 2} of 6)`, { side: 'r' });
      const k = props.k, w = sacW(k), w1 = sacW(k + 1), R1 = 0.03;
      /* along the sac to its end; that end opens and a small vesicle buds from it, with amylase in it; the vesicle goes
         to the next sac's end and fuses with it; amylase goes through the opening into the next sac. (Its name rides
         with it, one word: at rest it stood where amylase had been. The second science read, 18 Nov 2026: no course
         line says what carries a protein from sac to sac, so the word names amylase only) */
      cardOff(); gNames(() => [FIRSTN()]);
      const tg = rideTag(() => a.position.clone(), 'amylase');   /* (its line ends on the speck: it had ended on the ball's top, and the ball read as amylase) */
      await alongSac(k, a, w - 8, 0, 700);
      await portOpen(k);
      const sv = calm(keep(token('vesicle', R1))); sv.quaternion.copy(frameQ()); sv.scale.setScalar(0.4); sv.position.copy(portAt(k, R1, 0.4));
      await Promise.all([play(500, e => { const s = 0.4 + 0.6 * e; sv.scale.setScalar(s); sv.position.copy(portAt(k, R1, s)); }), tween(a, { to: portAt(k, R1), ms: 500 })]);
      await portShut(k);
      await Promise.all([tween(sv, { to: portAt(k + 1, R1), ms: 800 }), tween(a, { to: portAt(k + 1, R1), ms: 800 })]);
      await fuseAt(k + 1, sv, R1, a, w1 - 110);
      tg.off();
      props.k++;
      if (props.k === 2) await sugars(a);
    }
    gNames(() => [speckName(a), FIRSTN(), LASTN()]);
    if (courseOn()) await quest.next();
  }
  /* ---- the two vesicles form on the last sac, and the proteins are sorted inside it (18 Nov 2026) ----
     Before, both vesicles stood there whole from the first frame, each protein rose out of the sac through its membrane,
     and went into a closed vesicle through that membrane too. A protein never crosses a membrane here (the expert review
     of the rough ER's vesicle, 12 Nov 2026: Alberts, Molecular Biology of the Cell, ch. 13): a vesicle is a piece of the
     sac's own membrane that bends outwards, and what it carries goes in through its open neck.
     - The small vesicle (to a lysosome): clathrin.js's pit, the way out's, turned so that it grows out of the last sac's
       right end: first a half ball as wide as the rim, then a ball on a neck (its membrane vesicle 60 nm across; before,
       a ball of 80 nm). IB at HL: its coat of clathrin shows (B2.2.9); for the others the coat is not drawn.
     - The large vesicle: a swelling on the last sac's top, on a short neck, that grows to 0.9 µm; meanwhile the sac's
       left rim comes 140 nm nearer: the sac gives membrane. NOT TO SCALE: the vesicle's membrane is more than the whole
       sac's; no course line says how a secretory vesicle grows, so the picture shows only that it forms on the last
       sac and takes membrane from it (the plan: "draw no small vesicles joining to make it").
     - Each protein stands in the last sac; the one to sort is named, with its label; it goes along the inside of the
       sac to its vesicle's neck and through it. Then the small vesicle's neck closes and it moves off the sac. */
  const LD0 = 0.378;   /* the pit's depth at which it is a half ball on the sac's end, as wide as the rim: where it starts */
  function lysMake() {
    if (props.lys) return props.lys;
    const F = golgiFrame(), w = sacW(5);
    const mem = magicStandard({ color: 0xeaa632, transparent: true, opacity: 0.9, roughness: 0.2, depthWrite: false, side: THREE.DoubleSide }, { rim: 0xffe8f4, rimK: 1.1 });
    const coat = magicStandard({ color: 0xf1eadb, roughness: 0.55, emissive: 0x3a3428, emissiveIntensity: 0.3 }, { rim: 0xffffff, rimK: 0.5 });
    const P = makePit({ mem, coat });
    /* (the pit grows towards its own -y, from the face at y = -3 nm: that face is the sac's flat right end) */
    P.g.position.copy(gp(w - 3, sacY(5, w))); P.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(F.n, F.right.clone().negate(), F.along));
    P.parts.mem.renderOrder = 8; P.g.userData.kind = 'lys-vesicle'; P.mem = mem; keep(P.g);
    return (props.lys = P);
  }
  const lysC = P => P.g.localToWorld(P.centre());
  /* the pit set, and the last sac's mouth with it: as wide as the pit where the two meet (then the neck's width; closed: the end stays flat) */
  const lysSet = (P, s) => { P.set(s); const h = -3 - P.st.yc, ra = Math.abs(h) < 30 ? Math.sqrt(900 - h * h) : 0, m = P.st.open ? Math.max(Math.min(ra, 29), 12 * (s.neck != null ? s.neck : 1)) : 0.01;
    /* (as the mouth narrows the sac's end rounds up again behind the vesicle: the flat face, and the pit on it, move out) */
    const d = Math.sqrt(Math.max(0, 529 - Math.min(23, m + 4) ** 2));
    P.g.position.copy(gp(sacW(5) - 3 + d, sacY(5, sacW(5))));
    lastSac(Object.assign({}, golgiStack().userData.o5, { mouth: m, md: d })); };
  const PROTS = [['amylase', 0, 280], ['lysosome enzyme', 1, 245], ['amylase', 0, 210], ['amylase', 0, 175], ['lysosome enzyme', 1, 140]];
  const lysEnz = () => { const p = calm(keep(token('protein', 0.003))); const tag = new THREE.Mesh(new THREE.SphereGeometry(0.0007, 10, 8), magicStandard({ color: 0xff5fa8, emissive: 0x6a1038, emissiveIntensity: 0.4 }, { rim: 0xffd0e8, rimK: 0.5 })); tag.position.set(0.0032, 0.001, 0); p.add(tag); haloSprite(p, 0.009, 0xffc8e0); return p; };
  /* the large vesicle's middle when its radius is r nm: it stands on the neck, its lowest part in the neck's mouth */
  const outAt = (r, nf = 1) => gp(GT.x, neckTop(nf) + Math.sqrt(Math.max(0, r * r - 400)));
  function outMake(r = 450) { const out = props.outVes || (props.outVes = calm(keep(token('vesicle', 0.45)))); out.scale.setScalar(r / 450); out.position.copy(outAt(r)); return out; }
  /* a protein along the inside of the last sac to x1 (nm), dy nm from the middle of the inside */
  const along5 = (p, x1, dy, ms) => { const F = golgiFrame(), x0 = p.position.clone().sub(F.p).dot(F.right) * 1000; return play(ms, k => { const x = x0 + (x1 - x0) * smooth(0, 1, k); p.position.copy(gp(x, sacY(5, x) + dy * Math.min(1, 4 * k))); }); };
  async function sortgame() {
    nucStep();
    const F = golgiFrame(); golgiStack();
    /* (played again: both vesicles form again, and the proteins stand in the last sac again) */
    [props.outVes, props.lys && props.lys.g, ...(props.sorted || [])].forEach(drop); props.outVes = props.lys = null; lastSac();
    const mine = props.amy || (props.amy = keep(amySpeck()));
    const Q = PROTS.map(([, dest, x], i) => { const p = i === 0 ? mine : dest ? lysEnz() : keep(amySpeck()); p.position.copy(gp(x, sacY(5, x))); return p; });
    props.sorted = Q.slice(1);
    /* (the four others come along the inside of the last sac from its left part, beyond the picture's edge: they had
       faded in where they stand, from nothing: the third science read) */
    if (!R.FAST) Q.slice(1).forEach((p, i) => { const x1 = PROTS[i + 1][2], x0 = -(GT.wl + 110); p.position.copy(gp(x0, sacY(5, x0))); play(1000 + 160 * i, e => { const x = x0 + (x1 - x0) * smooth(0, 1, e); p.position.copy(gp(x, sacY(5, x))); }).catch(() => {}); });
    quest.names.set([], HUD());
    /* 1. the small vesicle forms at the last sac's right rim */
    await golgiClose('rim');
    const P = lysMake(), amber = new THREE.Color(0xeaa632), pink = new THREE.Color(0xff9ac0);
    const coatOn = () => { P.parts.struts.visible = P.parts.joins.visible = ibHL() && !P.uncoated; };
    coatOn(); lysSet(P, { depth: LD0 });
    let tg = rideTag(() => lysC(P).addScaledVector(F.n, ibHL() ? 0.052 : 0.034), () => { coatOn(); return ibHL() ? 'a vesicle forms, with a coat of clathrin' : 'a vesicle forms'; });
    await play(3400, k => { lysSet(P, { depth: LD0 + (1 - LD0) * k }); P.mem.color.lerpColors(amber, pink, k); P.mem.opacity = 0.9 - 0.4 * k; });
    tg.off();
    /* (a phone: over the vesicle; beside it the picture ends on one side and the large vesicle's name stands on the other) */
    const lysName = (w = {}) => (PHONE() ? ['g-lys', 'vesicle: to a lysosome', [lysC(P).addScaledVector(F.n, ibHL() && !P.uncoated ? 0.05 : 0.032)], Object.assign({ aside: false, up: -1, len: 14 }, LYSSM, { w })]
      : (([sp, o]) => ['g-lys', 'vesicle: to a lysosome', sp, Object.assign({ cls: 'nm--wide' }, o, LYSSM, { w })])(rimSpots(F, lysC(P), ibHL() && !P.uncoated ? 0.05 : 0.032)));   /* (nm--wide: its IB name in three lines; at the names' own width it wrapped to six) */
    const coatName = () => ibHL() ? ['g-coat', 'clathrin coat', [lysC(P).addScaledVector(F.n, -0.047)], { aside: false, up: 1, len: 18, w: { card: 'g-coat' } }] : null;
    const lysSolid = () => [ibHL() && !P.uncoated ? P.hull : P.parts.mem];
    golNames(F, () => { coatOn(); return [lysName(), coatName()]; }, lysSolid, 150, lysC(P));
    if (ibHL()) await quest.next(); else await wait(R.TEST ? 0 : 900);
    /* 2. the second vesicle begins on the last sac's top, in the view where the proteins are sorted: a swelling of the
       sac's membrane on a short neck (it grows to its full size at Package, while amylase streams in: amyStream) */
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    await golgiClose('sort');
    const out = outMake(2); out.position.copy(gp(GT.x, sacTop5(GT.x)));
    const sacNow = o => lastSac(Object.assign({}, golgiStack().userData.o5, o));
    tg = rideTag(() => out.position.clone().addScaledVector(F.n, 0.45 * out.scale.x), 'another vesicle forms');
    await play(700, k => { out.scale.setScalar((2 + 18.5 * k) / 450); });
    await play(800, k => { const nf = 0.05 + 0.95 * k, r = 20.5 + 10.5 * k; sacNow({ neck: nf }); out.scale.setScalar(r / 450); out.position.copy(outAt(r, nf)); });
    await play(1500, k => { const r = 31 + (BUD_R - 31) * smooth(0, 1, k); out.scale.setScalar(r / 450); out.position.copy(outAt(r)); });
    tg.off();
    /* 3. the proteins are sorted, in this view: the last sac from the neck to its right end */
    const pxn = () => Math.abs(world.project(gp(0, 1)).y - world.project(gp(0, 0)).y);
    let cur = null, lysW = {};
    /* (a phone: during the game the two vesicles' names ride, each beside its vesicle, always shown: the names' layer
       had left out one or both, and the pupil could not tell the vesicles apart; the coat was named in the close view) */
    let playing = true;
    const sortNames = () => golNames(F, () => { coatOn(); return PHONE() && playing ? [] : [PHONE() ? null : (([sp, o]) => ['g-out', 'vesicle: out of the cell', sp, Object.assign({}, o, OUTSM)])(rimSpots(F, out.position, 0.45 * out.scale.x)), lysName(lysW), playing && !PHONE() ? coatName() : null]; }, () => [out, ...lysSolid()], 200, gp(190, 300));
    const pt = PHONE() ? [rideTag(() => out.position.clone().addScaledVector(F.n, 0.02), 'out of the cell'), rideTag(() => lysC(P).addScaledVector(F.n, 0.05), 'to a lysosome')] : [];   /* (the first just over its button, under the corner box) */
    let nA = 0, nL = 0;
    for (let i = 0; i < PROTS.length; i++) {
      const [name, dest] = PROTS[i], p = Q[i];
      /* (its name and its label ride on it, always shown: a name of the names' layer was left out on a phone) */
      cur = rideTag(() => p.position.clone().addScaledVector(F.n, 0.009 / pxn()), name, false, () => (dest ? 'label: to a lysosome' : 'no label'));
      sortNames();
      await new Promise(done => {
        const pick = (k, at, side) => quest.hot(at, 'Put it here', { side, right: k === dest }).done.then(async () => {
          if (k !== dest) { quest.say(dest ? 'Read its label: this lysosome enzyme goes to a lysosome.' : 'Amylase has no label: amylase molecules join together and are packed into the large vesicle that leaves the cell.', 'no'); return; }
          quest.hots.filter(x => x.el.textContent === 'Put it here').forEach(x => x.remove());
          quest.say(''); cur.off(); cardOff();
          const rt = rideTag(() => p.position.clone().addScaledVector(F.n, 0.004), name);
          if (dest) {
            /* along the inside of the sac to its right end, through the neck, into the vesicle */
            await along5(p, sacW(5) - 8, 0, 800);
            await tween(p, { to: lysC(P).addScaledVector(F.n, nL ? 0.009 : -0.008).addScaledVector(F.right, nL ? -0.004 : 0.005), ms: 900 }); nL++;
          } else {
            /* along the inside of the sac to the neck, up the neck, into the vesicle */
            const dx = Math.abs(p.position.clone().sub(gp(GT.x, 0)).dot(F.right)) * 1000;
            await along5(p, GT.x, i % 2 ? 3 : -3, 400 + 3 * dx);
            await tween(p, { to: gp(GT.x, neckTop() + 10), ms: 600 });
            await tween(p, { to: gp(GT.x + (nA - 1) * 34, neckTop() + 62 + 16 * (nA % 2)), ms: 700 }); nA++;
            (props.inOut = props.inOut || []).push(p);   /* (it goes with the vesicle from Package on: packageIt) */
          }
          rt.off(); done();
        });
        pick(0, () => out.position.clone(), 'c');
        if (PHONE()) pick(1, () => lysC(P).addScaledVector(F.n, -0.062), 'b');   /* (a phone: under it; over it rides its name) */
        else pick(1, () => lysC(P).addScaledVector(F.n, 0.066), 't');   /* (over the small vesicle: under it, the button's line crossed the coat's name) */
      });
    }
    /* the small vesicle's neck closes, and it moves off the sac with its two enzymes */
    const kids = Q.filter((p, i) => PROTS[i][1]), off = kids.map(p => p.position.clone().sub(lysC(P)));
    playing = false; pt.forEach(t => t.off());
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    await play(900, k => { lysSet(P, { depth: 1, neck: 1 - k }); });
    /* (a coat of clathrin comes off soon after its vesicle has left the membrane: the science read; so it fades as the vesicle moves off) */
    const cm = P.parts.struts.material; cm.transparent = true;
    await play(1300, k => { lysSet(P, { depth: 1, neck: 0, drop: 0.28 * smooth(0, 0.7, k) }); kids.forEach((p, j) => p.position.copy(lysC(P)).add(off[j])); cm.opacity = 1 - smooth(0.35, 1, k); });
    P.parts.struts.visible = P.parts.joins.visible = false; P.uncoated = true;
    await play(500, k => { lastSac(Object.assign({}, golgiStack().userData.o5, { mouth: 0.01, md: 22.65 + 6.35 * k })); });   /* the sac's end is round again */
    lastSac(Object.assign({}, golgiStack().userData.o5, { mouth: 0, md: 0 }));
    kids.forEach(p => P.g.attach(p));
    quest.say('Every protein is in the right vesicle.', 'ok');
    /* (IB, SL, B2.2.3: now that its enzymes are in it, its name says what a lysosome's compartment is for; the line on its card) */
    /* (a phone: the picture moves on to the small vesicle, so that its name has room; the other vesicle is named again in step 4) */
    if (PHONE()) await camGo({ at: gp(330, 380), dir: F.along.clone(), up: F.n.clone(), dist: fitDist(600, 500) }, R.FAST ? 0 : 700);   /* (380, was 330: the vesicle 25 px lower, so that its name has room over it, under the Word bank) */
    lysW = { ib: 'vesicle to a lysosome: its enzymes<br>kept apart from the rest of the cell', ibSmall: PHONE() ? 'vesicle to<br>a lysosome' : 'vesicle to a lysosome:<br>its enzymes kept apart<br>from the rest of the cell', card: 'g-lys2' };   /* (a phone: the short name, which has room beside the vesicle; its card holds the line) */   /* (the second read: beside two enzymes drawn apart, "kept apart" read as apart from each other; B2.2.3's own words: "apart from the rest of the cell") */   /* (the science read: "to a lysosome: …" alone read as the name of a lysosome) */
    sortNames();
    if (courseOn()) await quest.next();
  }
  /* the large vesicle, packed with amylase: very many specks, each about 5 nm */
  const AMYM = magicStandard({ color: 0xf6b84a, roughness: 0.45, emissive: 0x6a4008, emissiveIntensity: 0.25 }, { rim: 0xffe9b0, rimK: 0.5 });
  const AMYG = new THREE.IcosahedronGeometry(0.0026, 0).scale(1.55, 1, 1);   /* a speck for one amylase molecule: about 8 nm long and 5 nm wide, as measured (actors.js amylase) */
  function amyCloud(R0, n) {
    const c = new THREE.InstancedMesh(AMYG, AMYM, n); c.userData.kind = 'amylase-cloud';
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), one = V(1, 1, 1), e = new THREE.Euler();
    for (let i = 0; i < n; i++) { const r = R0 * Math.cbrt(Math.random()), d = V(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(); q.setFromEuler(e.set(Math.random() * 6.3, Math.random() * 6.3, 0)); c.setMatrixAt(i, M.compose(d.multiplyScalar(r), q, one)); }
    c.instanceMatrix.needsUpdate = true; c.computeBoundingSphere(); return c;
  }
  /* (18 Nov 2026) the vesicle forms and fills in the picture, at Package: it grows from the swelling on its neck to
     0.9 µm while amylase streams in (the step's own Year 7 words: "A new vesicle forms, tightly packed with amylase
     molecules"; the science read: an empty ball that had swelled to its full size in step 3, and was filled later,
     claimed a way of growing). Each speck goes from the last sac's left part along the inside of the sac to the neck,
     up the neck, and to its own place in the vesicle by a wandering way; the specks that are in move apart as the
     vesicle grows; meanwhile the sac's left rim comes nearer (it gives membrane; NOT to scale: the vesicle's membrane
     is more than the whole sac's, and no course line says how a secretory vesicle grows). Before, 6000 specks came
     into sight inside the vesicle in one frame */
  const BUD_R = 90;   /* nm: the large vesicle's radius while the proteins are sorted: a swelling on its neck (180 nm across: whole in the sorting view) */
  /* (the second science read, 18 Nov 2026: each speck grew from nothing inside the last sac's left end, so a pupil
     read "the last sac makes amylase". Now amylase comes in where step 2 showed it entering a sac: at the last sac's
     right end. That end is open while small vesicles from the sac before, each with amylase in it, come to it one
     after another and go flat against it; each speck comes through the opening whole, goes along the inside of the
     sac to the neck, up the neck, and to its own place in the vesicle) */
  function amyStream(out, n, ms) {
    const F = golgiFrame(), c = amyCloud(0.43, n), fin = [], M = new THREE.Matrix4(), sc = new THREE.Vector3(), one = V(1, 1, 1), Z = new THREE.Matrix4().makeScale(0, 0, 0), pos = new THREE.Vector3();
    for (let i = 0; i < n; i++) { c.getMatrixAt(i, M); const p0 = new THREE.Vector3(), q0 = new THREE.Quaternion(); M.decompose(p0, q0, sc); fin.push([p0, q0]); c.setMatrixAt(i, Z); }
    c.frustumCulled = false; keep(c);
    let end5 = [0, 0];
    const grow = e => { const r = BUD_R + (450 - BUD_R) * e; lastSac({ neck: 1, wl: Math.round(390 - (390 - GT.wl) * e), mouth: end5[0], md: end5[1] }); out.scale.setScalar(r / 450); out.position.copy(outAt(r)); return r / 450; };
    /* an end's opening at time t: it opens from t0 (0.26 s), closes from t1 (0.24 s), and its face then rounds again (0.2 s), as portOpen and portShut */
    const endAt = (t, t0, t1) => { if (R.FAST || t < t0 || t >= t1 + 440) return [0, 0]; if (t >= t1 + 240) return [0.01, 22.65 + 6.35 * (t - t1 - 240) / 200];
      const m = Math.max(0.01, 12 * smooth(t0, t0 + 260, t) * (1 - smooth(t1, t1 + 240, t))); return [m, portD(m)]; };
    /* the feeding vesicles: one every 700 ms; each grows on the open end of the sac before (0.4 s), goes to the last
       sac's open end (0.7 s) and goes flat against it (0.5 s) */
    const R1 = 0.03, LEAD = 1300, EVERY = 700, D = 1500, T = ms - D - LEAD, NV = Math.max(1, Math.floor(T / EVERY) + 1), wE = sacW(5), xE = wE + portD(12) * 0.4;
    const feed = R.FAST ? [] : [...Array(NV)].map((_, j) => { const v = calm(keep(token('vesicle', R1))); v.quaternion.copy(frameQ()); v.visible = false;
      v.add(amyCloud(0.022, 70));   /* (full of amylase: with three specks in each, the amounts still said that the sac's end makes amylase: the third science read) */
      return { v, t0: j * EVERY, op: v.userData.shell ? v.userData.shell.material.opacity : 1 }; });
    props.feed = { n: feed.length, from: 'right end' };
    const rnd = i => { const s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); }, A = [];
    for (let i = 0; i < n; i++) A.push({ t0: LEAD + T * i / n, dy: (rnd(i) - 0.5) * 11, dx: (rnd(i + 0.5) - 0.5) * 16, wob: (rnd(i + 0.75) - 0.5) * 0.16 });
    const yN = sacY(5, GT.x), yT = neckTop() + 6;
    return play(ms, k => {
      const t = R.FAST ? ms : k * ms;
      /* the two ends: the end of the sac before is open until its last vesicle has left it, the last sac's until the last vesicle has gone flat against it */
      end5 = endAt(t, 0, (NV - 1) * EVERY + 1600); { const e4 = endAt(t, 0, (NV - 1) * EVERY + 420); portSet(4, e4[0], e4[1]); }
      const g = grow(smooth(0, 1, Math.max(0, Math.min(1, (t - LEAD) / T))));
      feed.forEach(f => { const u = t - f.t0, v = f.v; v.visible = u >= 0 && u < 1600; if (!v.visible) return;
        if (u < 400) { const e = 0.4 + 0.6 * u / 400; v.scale.setScalar(e); v.position.copy(portAt(4, R1, e)); }
        else if (u < 1100) { v.scale.setScalar(1); v.position.copy(portAt(4, R1)).lerp(portAt(5, R1), smooth(400, 1100, u)); }
        else { const e = (u - 1100) / 500, q = 1 - 0.94 * e; v.scale.set(q, 1 - 0.45 * e, 1 - 0.45 * e); v.position.copy(portAt(5, R1, q)); if (v.userData.shell) v.userData.shell.material.opacity = f.op * (1 - smooth(0.55, 1, e)); } });
      for (let i = 0; i < n; i++) {
        const a = A[i], u = (t - a.t0) / D; if (u < 0) break;
        /* its own place in the vesicle as the vesicle is now */
        pos.copy(fin[i][0]).multiplyScalar(g).add(out.position);
        if (u < 1) {
          if (u < 0.5) { const e = u / 0.5, x = xE + (GT.x + a.dx - xE) * e; pos.copy(gp(x, sacY(5, x) + a.dy * (0.5 + 0.2 * e))); }
          else if (u < 0.64) { const e = (u - 0.5) / 0.14; pos.copy(gp(GT.x + a.dx * (1 - 0.3 * e), yN + a.dy * 0.7 + (yT - yN - a.dy * 0.7) * e)); }
          else { const e = smooth(0, 1, (u - 0.64) / 0.36); pos.copy(gp(GT.x + a.dx * 0.7, yT).lerp(pos.clone(), e)).addScaledVector(F.right, a.wob * Math.sin(Math.PI * e) * g); }
        }
        c.setMatrixAt(i, M.compose(pos, fin[i][1], one));   /* (whole from its first frame: it came through the opening) */
      }
      c.instanceMatrix.needsUpdate = true;
    }).then(() => { feed.forEach(f => drop(f.v)); end5 = [0, 0]; portSet(4, 0); grow(1); for (let i = 0; i < n; i++) c.setMatrixAt(i, M.compose(pos.copy(fin[i][0]).add(out.position), fin[i][1], one)); c.instanceMatrix.needsUpdate = true; out.attach(c); kept = kept.filter(x => x !== c); c.computeBoundingSphere(); });
  }
  async function packageIt() {
    nucStep(); quest.names.set([], HUD());
    await golgiClose('top');
    const F = golgiFrame(); golgiStack();
    /* (the picture begins where step 3 ended: the vesicle a swelling on its neck, on the last sac) */
    lastSac({ neck: 1 });
    const out = outMake(BUD_R);
    out.children.filter(c => c.userData.kind === 'amylase-cloud').forEach(c => out.remove(c));
    const outName = (w = {}) => (([sp, o]) => ['g-out', 'vesicle: out of the cell', sp, Object.assign({}, o, OUTSM, { w })])(rimSpots(F, out.position, 0.45 * out.scale.x));
    const lastLeft = (right = false) => (right ? ['g-last', 'last sac', [gp(sacW(5) + 29, sacY(5, sacW(5)))], { sides: [1] }] : ['g-last', 'last sac', [gp(-(golgiStack().userData.o5.wl || 390) - 29, sacY(5, -(golgiStack().userData.o5.wl || 390)))], { sides: [-1] }]);
    golNames(F, () => [outName(), lastLeft()], [out], 300, gp(0, 560));
    await press(() => out.position.clone().addScaledVector(F.n, 0.2), 'Package', { side: 'c', w: 'package' });
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    /* the small vesicle leaves, towards a lysosome */
    if (props.lys) { const g = props.lys.g; props.lys = null; tween(g, { to: g.position.clone().addScaledVector(F.right, 0.5).addScaledVector(F.n, 0.12), ms: 1800 }).then(() => drop(g)).catch(() => {}); }
    /* (the science read: one ball on a narrow neck, with more membrane than the whole sac has, is a way of growing that no course line gives: the label says that the picture is simplified) */
    const tg0 = rideTag(() => out.position.clone(), 'the vesicle forms: it fills with amylase', false, () => 'a simplified picture');   /* (on its middle: over its top the corner box stands) */
    /* (Reduce motion, a course on: the still keeps the way: from the last sac's right end, along the sac, up the neck) */
    wayArrow(new THREE.CatmullRomCurve3([gp(sacW(5) - 10, sacY(5, sacW(5) - 10)), gp(sacW(5) * 0.45, sacY(5, sacW(5) * 0.45)), gp(GT.x + 60, sacY(5, GT.x + 60)), gp(GT.x, sacY(5, GT.x)), gp(GT.x, neckTop() + 30)]), arrowR());
    await amyStream(out, 6000, 8400); out.userData.packed = true;
    tg0.off();
    /* (the amylase molecules sorted in step 3 are in it: they go with it from now on) */
    (props.inOut || []).forEach(p => { if (p.parent === scene) out.attach(p); }); props.inOut = [];
    /* the neck closes: its walls come together; then the vesicle, whole, moves off the sac */
    await play(700, k => { lastSac({ neck: 1, wl: GT.wl, half: 14 * (1 - k) + 0.01 }); });
    const p0 = out.position.clone();
    await play(600, k => { lastSac({ neck: Math.max(0.02, 1 - k), wl: GT.wl, half: 0.01 }); out.position.copy(p0).addScaledVector(F.n, 0.03 * smooth(0, 1, k)); });
    lastSac({ wl: GT.wl });
    burst(scene, out.position, { n: 50, r: 0.3, size: 0.012, near: 0.006 });
    /* (IB, SL, A2.2.11: its name, the line on its card, and a door to the game's own micrograph of secretory vesicles) */
    golNames(F, () => [outName({ ib: 'secretory vesicle', ibSmall: 'secretory<br>vesicle', card: 'g-sec' }), PHONE() && lvHere('ib') ? null : ['g-pk', 'amylase', [-40, 40, -140].map(d => out.position.clone().addScaledVector(F.right, Math.cos(d * Math.PI / 180) * 0.43).addScaledVector(F.n, Math.sin(d * Math.PI / 180) * 0.43)), { sides: [1, 1, -1] }], lastLeft(!PHONE())], [out], 300, gp(0, 560));
    quest.say('The vesicle is about 0.9 µm across, packed with amylase molecules: each one is a tiny speck at this size.', 'ok');
    const door = rideDoor(() => (PHONE() ? gp(120, -260) : out.position.clone().addScaledVector(F.n, -0.2)), () => lvHere('ib') && !quest.watchingNow() ? '🔬 In a micrograph: large and dark' : '',
      () => document.dispatchEvent(new CustomEvent('lens', { detail: { pic: 'exit', n: 0, title: 'Secretory vesicles in an electron micrograph' } })));
    if (courseOn()) await quest.next(); else await wait(R.TEST ? 0 : 2200);
    door.off(); arrowOff();
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    /* (the vesicle keeps its name while the camera goes out) */
    const tg = rideTag(() => out.position, () => lvHere('ib') ? 'secretory vesicle' : 'vesicle: out of the cell');
    await nanoOut(world.P.golgi.view);
    await tween(out, { to: out.position.clone().add(V(0.6, 1.1, 0.4)), ms: 1200 });
    tg.off();
    await quest.gain('packed', out.position);
    state.use('amylase');
    await quest.next('Back to the map');
  }

  /* ---------------- microtubules, at their true sizes (tracks.js) ----------------
     Daniel, 6 Nov 2026, of the red blood cells at the way in: "I have really gone small"; for this place, 7 Nov 2026:
     "Yes, build it". The place opens on your vesicle from far away. Then the camera comes close, with the scale bar, to
     the microtubule beside it, where the microtubule (25 nm wide), the motor protein and the vesicle (900 nm across) are
     all at their true sizes. The motor protein is dynein, its heads rings 14 nm across, with dynactin (38 nm) and an
     adaptor protein, joined together on the vesicle (tracks.js has every size and its source). Attach: dynein's heads
     land on the microtubule, and it walks seven steps of different sizes (slowed down: a real one moves about 0.9 µm a
     second). The maze is
     seen from far again: there the motor is too small to see (a glow shows where it is), and the microtubules are drawn
     three times thicker, as everywhere in the game (the How big? card says so); while the camera comes close, those fade
     and the true one shows. The vesicle hangs beside its microtubule, held by the motor, never threaded on it. */
  const T = world.P.tracks.center, TV = world.P.tracks.view;
  const TDIR = V(...TV.pos).sub(V(...TV.at)).normalize(), FRONT = V(0, 0, 1);
  /* the vesicle's side of a microtubule: on its left, seen from the cut front of the cell, when the microtubule goes up
     (so that, close up, the motor and the microtubule stand clear of the pupil's bag, top left) */
  const sideOf = a => FRONT.clone().cross(a).normalize();
  const HOLD = TRUE.mt + TRUE.reach + 0.45;            /* from a microtubule's middle to the vesicle's (radius 0.45 µm), across it */
  /* three crossings; each move is 80 % of what it was before 7 Nov 2026, because the vesicle now starts higher */
  const FORKS = [[V(0.4, 1.1, -0.1), V(-1.3, 0.15, 0.3)], [V(-0.2, 1.0, 0.2), V(1.2, -0.1, 0.1)], [V(0.3, 1.2, -0.3), V(-1.2, 0.2, 0.2)]].map(f => f.map(v => v.multiplyScalar(0.8)));
  /* the motor starts on the first microtubule, with the vesicle 1.9 µm further up it than the top of the Golgi
     apparatus, where it waited before: only the cytoplasm and the other vesicles stand round the close view */
  const A0 = FORKS[0][0].clone().normalize();
  const M0 = T.clone().add(V(-0.6, -1.6, 0.4)).addScaledVector(A0, 1.9).addScaledVector(sideOf(A0), -HOLD);
  const frameOf = a => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(a, sideOf(a), a.clone().cross(sideOf(a))));
  /* a microtubule as the game draws it from far: three times thicker than it is (the maze's tracks), a stronger blue
     than the cell's other microtubules, so that a pupil sees which way each one goes (the expert review, 7 Nov 2026:
     they looked like the cell's other pale lines) */
  const drawnTrack = (from, to) => keep(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(from, to), 8, 0.035, 6), new THREE.MeshBasicMaterial({ color: 0x38c8ff, transparent: true, opacity: 1 })));
  /* something that changes every frame for ms milliseconds (fn gets 0 … 1); it stops if the pupil leaves */
  const moveFor = (ms, fn) => live(new Promise(res => { const t0 = performance.now();
    const f = () => { const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms); fn(k); world.kick(); if (k < 1) requestAnimationFrame(f); else res(); }; f(); }));
  /* the motor and your vesicle, built once in the place (a pupil who comes back to the maze has them at the start) */
  function rig() {
    if (props.rig) return props.rig;
    const mot = trueMotor(), ves = token('vesicle', 0.45), core = amylaseCore(0.45, 70000, 300), glow = glowSprite(0xff6ec4);
    /* the vesicle on the adaptor's end, a little behind dynein's heads (towards the plus end): it is towed */
    ves.add(core); ves.position.set(TRUE.lag, HOLD, 0); mot.cargo.add(ves);
    glow.position.set(-0.02, TRUE.mt + 0.035, 0); mot.group.add(glow);
    keep(mot.group); mot.group.position.copy(M0); mot.group.quaternion.copy(frameOf(A0));
    return (props.rig = { mot, ves, core, glow, at: M0.clone(), a: A0.clone() });
  }
  /* every frame while in the place: the scale bar; between 3.5 and 1.8 µm, while the bar still reads 1 µm or 500 nm,
     what is drawn bigger than it is fades: the microtubules drawn three times thicker (the true one shows instead), the
     free ribosomes (drawn 4 times bigger) and the cytosol's motes of light, so that close up nothing is drawn bigger
     (the expert review, 7 Nov 2026: at 200 nm they still showed); the motor's glow keeps one size on the screen and goes
     once the motor itself shows; each amylase dot is drawn 5 nm across at any distance */
  const TS = { tick: 0, fade: null };
  const railFade = () => { const m = W.groups.microtubules && W.groups.microtubules.children[0]; return m && m.material.uniforms && m.material.uniforms.uFade; };
  /* the ribosomes' material is shared by the free ones and the rough ER's (far below here): seen through while this
     place is open, as it was before when it closes */
  function tracksFade(k) {
    const rib = W.groups['free-ribosomes'], mot = W.groups.cytosol;
    if (!TS.fade) { if (!rib || !mot) return; TS.fade = { rib: rib.material, tr: rib.material.transparent, mot: mot.material.uniforms.uOpacity.value }; rib.material.transparent = true; rib.material.needsUpdate = true; }
    if (k == null) {
      TS.fade.rib.transparent = TS.fade.tr; TS.fade.rib.opacity = 1; TS.fade.rib.needsUpdate = true; mot.material.uniforms.uOpacity.value = TS.fade.mot;
      rib.visible = true; mot.visible = true; TS.fade = null; return;
    }
    TS.fade.rib.opacity = k; rib.visible = k > 0.01; mot.material.uniforms.uOpacity.value = TS.fade.mot * k; mot.visible = k > 0.01;
  }
  function tracksLoop(on) {
    if (on && !TS.tick) {
      const f = () => {
        if (!TS.tick) return;
        const cam = world.camera, d = cam.position.distanceTo(world.controls.target), far = smooth(1.8, 3.5, d), u = railFade();
        if (u) u.value = far;
        (props.drawn || []).forEach(m => { m.material.opacity = far; m.visible = far > 0.002; });
        if (props.near) { props.near.material.opacity = 1 - far; props.near.visible = far < 0.998; }
        tracksFade(far);
        const r = props.rig;
        if (r) {
          r.glow.visible = d > 0.5; r.glow.material.opacity = smooth(0.5, 1.4, d); r.glow.scale.setScalar(d * 0.075);
          const p = r.core.userData.points; p.material.size = p.userData.nm * world.fullH / (world.size.h * Math.tan(cam.fov * Math.PI / 360));
        }
        scaleBar(d);
        TS.tick = requestAnimationFrame(f);
      };
      TS.tick = requestAnimationFrame(f);
    } else if (!on && TS.tick) {
      cancelAnimationFrame(TS.tick); TS.tick = 0; if (bar) bar.hidden = true;
      const u = railFade(); if (u) u.value = 1;
      if (TS.fade) tracksFade(null);
    }
  }
  /* close to the motor, from the cut front of the cell (nothing stands there), a little from the microtubule's other
     side, so that the vesicle looms over it; dynein and dynactin in the middle of the picture, clear of the bag. The
     camera turns as it comes close (40 degrees), so that dynein's heads are at the top and dynactin hangs below them
     towards the vesicle: then each part's name has a height of its own (seen with the microtubule upright, they lay in
     one row across the picture) */
  const closeView = r => { const n = sideOf(r.a), f = FRONT.clone().addScaledVector(r.a, -r.a.z).normalize(), phone = world.size.w < 640;
    /* on a phone, closer, and dynein lower in the picture, below the tools, with the microtubule further in */
    return { at: r.at.clone().addScaledVector(n, phone ? 0.05 : 0.045).addScaledVector(r.a, phone ? -0.004 : -0.015), dist: phone ? 0.25 : 0.22, dir: f.multiplyScalar(Math.cos(0.18)).addScaledVector(n, -Math.sin(0.18)).normalize(),
      up: r.a.clone().multiplyScalar(0.94).addScaledVector(n, -0.34).normalize() }; };
  /* the names close up, each with its true size (on a phone too): dynein's ends on its front head, dynactin's on its
     filament, the adaptor's between dynactin and the vesicle, as they are now; the vesicle's two on its skin and its
     amylase, on their side (left), the microtubule's on its own (right), so that no line crosses the microtubule; on a
     phone the proteins' names stand beside them, so that they do not hide them (the expert review, 7 Nov 2026) */
  function nearNames(r) {
    const n = sideOf(r.a), P = (x, y) => r.mot.group.localToWorld(V(x, y, 0)), c = r.ves.getWorldPosition(V(0, 0, 0));
    /* a point of the vesicle's skin (or just inside it), deg degrees round from its edge nearest the microtubule
       towards the camera, and along µm round it, along the microtubule: on the sphere itself, wherever the camera is */
    const cam = world.camera.position.clone().sub(c); cam.addScaledVector(n, -cam.dot(n)).normalize();
    const onVes = (deg, along, inside = 0) => { const t = deg * Math.PI / 180, b = along / 0.45;
      const d = n.clone().multiplyScalar(-Math.cos(t) * Math.cos(b)).addScaledVector(cam, Math.sin(t) * Math.cos(b)).addScaledVector(r.a, Math.sin(b)).normalize();
      return c.clone().addScaledVector(d, 0.45 - inside); };
    const t = (a, b) => '<span class="nm__t">' + a + (b ? '<br>' + b : '') + '</span>', phone = world.size.w < 640;
    /* (18 Nov 2026, the courses on the microtubules' picture: each name through cName: IGCSE's grey mark on the
       microtubule, dynein and its two helpers, which 0610 does not name; a card on the microtubule and on dynein) */
    nucAgain = () => nearNames(r);
    quest.names.set([
      { key: 't-mt', free: true, side: 'R', html: t('microtubule:', '25 nm wide'), small: t('microtubule:', '25 nm'), spots: (phone ? [-0.06, -0.075, -0.05, -0.09] : [-0.035, -0.02, -0.005, 0.01, 0.025, -0.05, -0.065, -0.08, 0.04, 0.055, 0.07]).map(x => P(x, 0)) },   /* (the last five: further along the microtubule, where there is room beside it for the wider name of a course: with IGCSE on and the text open, no spot of the first six had room, and the microtubule had no name) */
      { key: 't-mot', free: true, side: 'L', aside: true, html: t('dynein:', 'each head 14 nm'), small: t('dynein:', 'each head 14 nm'), spots: r.mot.spots.dynein() },
      { key: 't-dyn', free: true, side: 'L', aside: true, prefer: -1, html: t('dynactin: 38 nm long'), small: t('dynactin:', '38 nm'), spots: r.mot.spots.dynactin() },
      { key: 't-ada', free: true, side: 'L', aside: true, html: t('adaptor protein'), small: t('adaptor', 'protein'), spots: r.mot.spots.adaptor() },
      /* the vesicle's names below the adaptor's, on its skin a little down the microtubule (the picture is turned, so
         there its skin is right of the names' column) */
      { key: 't-ves', free: true, side: 'L', html: t('your vesicle: 900 nm'), small: t('your vesicle: 900 nm'), spots: [-0.014, -0.02, -0.017, -0.008, -0.011, -0.026].map(u => onVes(0, u)).concat(phone ? [[30, 0.01], [40, -0.02], [30, 0.04], [45, 0.03]].map(([d, u]) => onVes(d, u)) : []) },
      { key: 't-amy', free: true, side: 'L', html: t('amylase: 8 nm long'), small: t('amylase: 8 nm'), spots: (phone ? [[-0.015, 0.03], [-0.005, 0.03], [0.015, 0.03], [0.03, 0.035], [-0.03, 0.02], [0.045, 0.04], [0.06, 0.03]].map(([u, inside]) => onVes(0, u, inside)) : [-0.036, -0.03, -0.042, -0.046, -0.05].map(u => onVes(2, u, 0.006))) }
    /* the edges of what is named: just inside the vesicle's skin, nearest the microtubule, on one side; just past the
       microtubule, by dynein, on the other (names.js stands names outside them and uses only spots inside them) */
    /* (the microtubule's grey mark stands inside its words, as their last line. As a part of its own beside the words,
       a mark makes a name as wide as its words, its button and the mark in one row (up to the names' greatest width,
       205 px): wider than the 149 px beside the microtubule when the text is open, so with IGCSE on the microtubule
       had no name: the probe of 18 Nov 2026) */
    ].map(it => cName(it)).map(n => { if (n.key !== 't-mt' || !/nm__no/.test(n.html)) return n;
      const mv = h => h && h.replace(/<\/span>(.*?)<span class="nm__no">not named in 0610<\/span>/, '<br><span class="nm__no">not named in 0610</span></span>$1');
      return Object.assign(n, { html: mv(n.html), small: mv(n.small) }); }), [...HUD2(), ...document.querySelectorAll('#stage .rtag')], lr(onVes(0, 0, 0.012), P(-0.02, -0.0204)));   /* (-0.0204, was -0.022: 8 px more room beside the microtubule; with IGCSE on its name, 153 px wide, had 149 px: the probe of 18 Nov 2026) */
  }
  /* (18 Nov 2026) IB, C1.2.2: "Each step of dynein uses one ATP". With IB on, an ATP molecule comes to the head that is
     going to step, from beyond the picture's edge, by a wandering way, with a light (it is 1.5 nm long); the head
     steps; ADP and phosphate leave that head, apart, and go out of the picture; a count is built beside the motor,
     "steps: n · ATP used: n". The first step is slow: its ATP rests on the head, named "ATP", before the head steps,
     and "ADP + phosphate" is named before the two leave; the six others keep the walk's own pace, unnamed. ATP is used
     at a head's ring only (the planner's risks: never at the microtubule, the vesicle or the helpers; no count in the
     maze, where dynein takes thousands of steps) */
  const NUCM = nucleotideMats();
  const atpTok = np => { const g = nucleotide(np, NUCM); g.scale.setScalar(0.001); haloSprite(g, np ? 1.8 : 0.9); return g; };
  async function atpWalk(r, walked) {
    const camR = () => new THREE.Vector3().setFromMatrixColumn(world.camera.matrixWorld, 0), camU = () => new THREE.Vector3().setFromMatrixColumn(world.camera.matrixWorld, 1);
    const ringAt = h => { const bs = r.mot.heads[h].beads, c = V(0, 0, 0); r.mot.group.updateMatrixWorld(true); bs.forEach(b => c.add(b.getWorldPosition(V(0, 0, 0)))); return c.multiplyScalar(1 / bs.length); };
    /* (the science read: ATP came from the picture's right edge, and ADP and phosphate left that way: all of them
       crossed the microtubule. Now ATP comes from above on the left, the side of the heads that is free, and the two
       products leave to the left, above dynein's stalks) */
    const away = (a, d) => V(0, 0, 0).addScaledVector(camR(), -Math.cos(a) * d).addScaledVector(camU(), Math.sin(a) * d);   /* (a: degrees above the picture's left, as radians; d: µm) */
    const come = (h, k) => { const t = keep(atpTok(3)); t.position.copy(ringAt(h)).add(away((57 + 7 * ((k % 3) - 1)) * Math.PI / 180, 0.17)); return t; };
    const flyIn = (tok, h, ms) => { const from = tok.position.clone(); return moveFor(ms, k => { const e = smooth(0, 1, k); tok.position.copy(from).lerp(ringAt(h), e).addScaledVector(camU(), 0.008 * Math.sin(3 * Math.PI * e) * (1 - e)); }); };
    const T = props.trk = { steps: 0, used: 0 };
    rideTag(() => r.mot.group.localToWorld(V(0.004, -0.034, 0)), () => (lvHere('ib') && T.steps ? `steps: ${T.steps} · ATP used: ${T.used}` : ''), true, null, true);
    const T1 = 1300, cam = camGo(walked, 1400 + 900 + T1 + 800 + (STEPS.length - 1) * 560);
    let tok = come(STEPS[0][0], 0), tg = rideTag(() => tok.position, 'ATP');
    await flyIn(tok, STEPS[0][0], 1400);
    await wait(R.TEST ? 0 : 900);
    for (let i = 0; i < STEPS.length; i++) {
      const h = STEPS[i][0], hn = i + 1 < STEPS.length ? STEPS[i + 1][0] : -1, next = hn >= 0 ? come(hn, i + 1) : null, ms = i ? 560 : T1;
      /* the head steps with its ATP on it; meanwhile the ATP of the next step comes to its head */
      await Promise.all([moveFor(ms, e => { r.mot.pose(i, e); tok.position.copy(ringAt(h)); }), next ? flyIn(next, hn, ms) : null]);
      T.steps++; T.used++;
      /* ADP and phosphate, where the ATP was: they leave the head, apart, and go out of the picture */
      const at = tok.position.clone(), adp = keep(atpTok(2)), pi = keep(atpTok(0)); drop(tok);
      adp.position.copy(at); pi.position.copy(at).addScaledVector(camR(), 0.0011);
      const t1 = tg; if (t1) { t1.off(); tg = null; }
      const t2 = t1 ? rideTag(() => adp.position, 'ADP + phosphate') : null;
      if (t2) await wait(R.TEST ? 0 : 800);
      if (t2) t2.off();   /* (the name ends as the two part: it had ridden on the ADP alone) */
      Promise.all([tween(adp, { to: at.clone().add(away(24 * Math.PI / 180, 0.18)), ms: 1500 }), tween(pi, { to: at.clone().add(away(8 * Math.PI / 180, 0.18)), ms: 1300 })]).then(() => { drop(adp); drop(pi); }).catch(() => {});
      tok = next;
    }
    await cam;
  }
  async function grab() {
    nucStep();
    /* the words follow the picture (Daniel's rule): the step names dynein, dynactin and the rest only once the camera is
       close enough to show them */
    const later = quest.step ? [...quest.step.li.querySelectorAll('.step__t p')].slice(1) : [];
    later.forEach(p => { p.hidden = true; });
    await fly(TV.pos, TV.at);
    const r = rig(); r.mot.reach(0); r.mot.pose(0, 0);
    /* the first microtubule twice in one place: drawn as seen from far, and at its true size for the close view */
    props.drawn = [drawnTrack(M0.clone().addScaledVector(FORKS[0][0], -0.7), M0.clone().add(FORKS[0][0]))];
    props.near = keep(trueTrack(M0.clone().addScaledVector(A0, -1.0), M0.clone().addScaledVector(A0, 1.0)));
    tracksLoop(true);
    await wait(900);
    await camGo(closeView(r), 3800);
    later.forEach(p => { p.hidden = false; });
    if (later.length) quest.reveal(later[later.length - 1]);
    nearNames(r);
    /* the button on the microtubule, down it, below dynein and dynactin: on a phone, next to the motor, it hid dynein */
    await press(() => r.mot.group.localToWorld(V(-0.06, -0.015, 0)), 'Attach', { side: 'b' });
    quest.names.set([]);
    /* dynein's two heads land on the microtubule; now it walks */
    await moveFor(1100, k => r.mot.reach(k * k * (3 - 2 * k)));
    quest.say('<p>Dynein now walks and carries your vesicle.</p><p>Two helpers make it walk: <b>dynactin</b>, a rod 38&nbsp;nm long, and an <b>adaptor protein</b>, which holds dynein and dynactin together and joins them to your vesicle. Without these two, dynein is folded and almost never walks.</p><p>Each time one head steps, your vesicle moves forward, most often 8&nbsp;nm. Some steps are longer, and some go backwards or to the side.</p><p>A real one walks about 70 times faster: about 900&nbsp;nm every second.</p>', 'ok');
    /* the camera follows dynein, so that it stays in the free part of the picture as it walks 48 nm */
    const walked = closeView({ at: r.at.clone().addScaledVector(r.a, TRUE.walk), a: r.a });
    if (lvHere('ib')) await atpWalk(r, walked);
    else await Promise.all([(async () => { for (let i = 0; i < STEPS.length; i++) await moveFor(560, e => r.mot.pose(i, e)); })(), camGo(walked, STEPS.length * 560)]);
    /* the seven steps kept: the motor's frame moves on 48 nm, and its parts go back to their first places (no change seen:
       each head's own steps add up to 48 nm) */
    r.at.addScaledVector(r.a, TRUE.walk); r.mot.group.position.copy(r.at); r.mot.pose(0, 0);
    nearNames(r);
    await quest.next();
  }
  /* three crossings: at each, the microtubule the vesicle is on meets one that lies across the cell; microtubules never
     branch, and the motor walks one way along them (towards their top end), so the pupil chooses which one to step onto */
  async function maze() {
    nucStep();
    tracksLoop(true);
    const r = rig();
    /* (18 Nov 2026: from far away nothing had a name. The vesicle carries its name on its whole way; at the first
       crossing one of the two lit microtubules is named) */
    rideTag(() => r.ves.getWorldPosition(V(0, 0, 0)).addScaledVector(V(0, 1, 0), 0.45), 'your vesicle');
    if (!props.drawn) r.mot.reach(1);            /* a pupil who comes back to this step: the motor already holds it */
    quest.names.set([]);
    /* from as far away as the place's own view, the camera follows your vesicle: the crossing it is at in the middle
       (from the place's own view the maze climbed out of the top of the picture) */
    const DFAR = V(...TV.pos).distanceTo(V(...TV.at));
    const viewAt = (p, a) => ({ at: p.clone().addScaledVector(sideOf(a), HOLD * 0.5), dist: DFAR, dir: TDIR.clone(), up: V(0, 1, 0) });
    if (world.camera.position.distanceTo(world.controls.target) < 3) await camGo(viewAt(r.at, r.a), 3000);
    else { await fly(TV.pos, TV.at); await camGo(viewAt(r.at, r.a), 900); }
    /* the motor walks to a point of a microtubule; at a crossing the vesicle swings round to the new one's side
       (turn false: back along the same microtubule after a wrong choice, the vesicle stays where it hangs) */
    const walk = (to, ms, turn = true) => {
      const from = r.at.clone(), a1 = to.clone().sub(from).normalize(), q0 = r.mot.group.quaternion.clone(), q1 = turn ? frameOf(a1) : q0;
      return moveFor(ms, k => { r.at.copy(from).lerp(to, k * k * (3 - 2 * k)); r.mot.group.position.copy(r.at); r.mot.group.quaternion.slerpQuaternions(q0, q1, smooth(0, 0.35, k)); })
        .then(() => { if (turn) r.a.copy(a1); });
    };
    /* the motor turns onto the microtubule it is on now (each piece of the maze leans a little differently): the vesicle
       swings round it to that microtubule's side */
    const turnTo = (a1, ms) => { const q0 = r.mot.group.quaternion.clone(), q1 = frameOf(a1); return moveFor(ms, k => r.mot.group.quaternion.slerpQuaternions(q0, q1, k * k * (3 - 2 * k))).then(() => { r.a.copy(a1); }); };
    /* the vesicle waits 0.65 µm before each crossing: its edge is only 90 nm from its microtubule, so a microtubule
       through the motor's own point would pass through it; one that would still pass too close lies deeper (they cross
       at different depths), turned about the line to the vesicle, away from the camera, until the vesicle is clear */
    const GAP = 0.65;
    const segDist = (p, a, b) => { const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq())); return a.clone().addScaledVector(ab, t).distanceTo(p); };
    const clearOf = (X, to) => {
      const c = r.ves.getWorldPosition(V(0, 0, 0)), d = to.clone().sub(X), L = d.length();
      const w = c.clone().sub(X).cross(d).normalize(); if (w.lengthSq() < 0.5) w.copy(TDIR).negate(); else if (w.dot(TDIR) > 0) w.negate();
      for (let b = 0; b <= 1.5; b += 0.05) {
        const t = X.clone().add(d.clone().addScaledVector(w, b * L));
        if (segDist(c, X.clone().lerp(t, -0.7), t) >= 0.5) return t;
      }
      return to;
    };
    for (let f = 0; f < FORKS.length; f++) {
      const u = FORKS[f][0].clone().normalize();
      if (r.a.angleTo(u) > 0.01) await turnTo(u, 600);
      const here = r.at.clone(), X = here.clone().addScaledVector(u, GAP), up = here.clone().add(FORKS[f][0]), down = clearOf(X, X.clone().add(FORKS[f][1]));
      /* each microtubule runs on through the crossing, so the two cross instead of splitting; the motor's own runs back
         past the vesicle */
      const lines = [drawnTrack(here.clone().addScaledVector(FORKS[f][0], -0.7), up), drawnTrack(X.clone().lerp(down, -0.7), down)];
      (props.drawn || []).forEach(drop); props.drawn = lines;
      if (props.near) { drop(props.near); props.near = null; }
      /* (the science read: only the right one was named, which gave the answer: both are named now) */
      if (f === 0) { const mtName = () => quest.names.set([cName({ key: 't-mt', free: true, side: 'R', html: '<span class="nm__t">microtubule</span>', spots: [0.55, 0.7, 0.4].map(k => X.clone().lerp(up, k)) }), cName({ key: 't-mt2', free: true, html: '<span class="nm__t">microtubule</span>', spots: [0.55, 0.7, 0.4, 0.85].map(k => X.clone().lerp(down, k)) }, { card: 't-mt' })], [...HUD2(), ...document.querySelectorAll('#stage .rtag')]); nucAgain = mtName; mtName(); }
      else { quest.names.set([]); nucAgain = null; cardOff(); }
      const order = Math.random() < 0.5 ? [0, 1] : [1, 0];
      /* each button stands 0.35 µm past the end of its microtubule, with the same words on both: a pupil looks at where
         each one goes (the expert review, 7 Nov 2026: arrows on them gave the answer, and on a phone they hid the
         vesicle and the crossing); a screen reader still hears which is which */
      const past = (from, to) => to.clone().addScaledVector(to.clone().sub(from).normalize(), 0.35);
      await new Promise(done => {
        order.forEach(i => {
          const to = i === 0 ? up : down, at = i === 0 ? past(here, up) : past(X, down);
          quest.hot(() => at.clone(), 'this one', { side: 'c', aria: i === 0 ? 'the microtubule that goes up' : 'the microtubule that lies across the cell', right: i === 0 }).done.then(async (b) => {
            if (!quest.energy(COST.step, 'mt-' + f + '-' + i)) return;
            quest.clearHots(); cardOff(); quest.names.set([]); nucAgain = null;   /* (the microtubule's name goes while the vesicle moves) */
            if (i === 1) {
              quest.say('This microtubule lies across the cell: on it, your vesicle moves to the side, not to the top. Amylase must reach the top, next to the duct. Choose again.', 'no');
              /* to the crossing, onto the other microtubule a little way, then back to where it waited */
              await walk(X, 500); await walk(X.clone().lerp(down, 0.45), 900); await walk(X, 600, false); await turnTo(u, 300); await walk(here, 500, false);
              done('again');
              return;
            }
            quest.say('');
            await Promise.all([walk(up, 1500), camGo(viewAt(up, u), 1500)]);
            done('up');
          });
        });
      }).then(async (res) => { if (res === 'again') f--; });
    }
    (props.drawn || []).forEach(drop); props.drawn = [];
    const vp = () => r.ves.getWorldPosition(V(0, 0, 0));
    const g = W.granules.filter(x => x.p.y > 12.5).sort((a, b) => a.p.distanceTo(vp()) - b.p.distanceTo(vp()))[0];
    if (g) {
      const goal = g.p.clone().add(V(0.9, -0.3, 0.6)), a1 = goal.clone().sub(vp()).normalize(), to = goal.addScaledVector(sideOf(a1), -HOLD);
      await Promise.all([walk(to, 1200), camGo(viewAt(to, a1), 1200)]);
    }
    await quest.gain('top', vp());
    state.use('packed');
    /* the vesicle waits at the top with the others; the motor lets it go */
    scene.attach(r.ves); kept.push(r.ves); drop(r.mot.group); props.rig = null;
    await quest.next('Back to the map');
  }

  /* ---------------- the way out ----------------
     The vesicle is about 1 µm across (a zymogen granule, as the world draws them), packed with amylase, each molecule
     about 5 nm: a speck at this size. Close up at the top of the cell, the cell membrane as a section (about 6 nm), the
     camera level with it (no surface of it behind the names); Release: the two membranes join, an opening widens, the
     amylase streams out into the lumen, and the opening closes as the vesicle's membrane becomes part of the cell
     membrane. Then, from far away, a glow shows the amylase flowing on to the duct. Before: one amylase molecule almost
     half the vesicle's width (about 90 times too big), and 14 streaming out about 50 times too big.
     Proof: tools/true-size.mjs F */
  const TOP = world.P.exit.center, FUSE = V(0.2, 16.05, 0.5), GR = 0.5;
  const exitFrame = () => props.xf || (props.xf = frameAt(FUSE, Y, V(...world.P.exit.view.pos)));
  const xp = (x, y, z) => fp(exitFrame(), x, y, z);
  const granule = () => { const v = keep(token('vesicle', GR)); v.add(amyCloud(GR - 0.03, 7000)); return v; };
  /* the cell membrane close up: two halves that meet where the vesicle joins it, each 3 µm wide, running away from the
     camera; heads (pink, about 1 nm) on each side of the tails (paler), about 6 nm in all */
  function exitMembrane() {
    if (props.close) { props.close.visible = true; return props.close; }
    const g = frameGroup(exitFrame()); g.userData.kind = 'cell-membrane';
    const head = magicStandard({ color: 0xff9ac8, roughness: 0.5 }, { rim: 0xffd6ea, rimK: 0.4 }), tail = magicStandard({ color: 0xfff0f5, roughness: 0.7 }, { rim: 0xffffff, rimK: 0.15 });
    g.userData.halves = [-1, 1].map(s => {
      const h = new THREE.Group();
      [[1.8, 3, head], [-1.8, 1.8, tail], [-3, -1.8, head]].forEach(([y0, y1, m]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(3, (y1 - y0) / 1000, 0.5), m); b.position.set(s * 1.5, (y0 + y1) / 2000, -0.25); h.add(b); });
      g.add(h); return h;
    });
    return (props.close = keep(g));
  }
  /* the camera's eye level with the membrane: the view's middle a little below it (where the vesicle is) */
  const exitClose = () => { exitMembrane(); const F = exitFrame(), at = PHONE() ? 80 : -380,   /* (a phone, 18 Nov 2026: 80 nm above the membrane, was 150 nm below: "outside the cell" and the membrane's name had no room between the corner boxes and the membrane) */ dist = PHONE() ? fitDist(2100, 1500) : fitDist(1560, 1440), a = Math.asin(-at / 1000 / dist), dir = F.along.clone().multiplyScalar(Math.cos(a)).addScaledVector(F.n, Math.sin(a)).normalize();
    /* (hidden too while close: the world's other vesicles, whose amylase it draws as one large core, the centrioles, the
       light's beams and the neighbouring cells of the gland, whose vesicles and edges stood round the close-up) */
    return nanoIn({ at: xp(0, at), dir, up: F.n.clone(), dist }, NEAR_HIDE().concat(groupsOf(['membrane', 'apex', 'granules', 'centrosome', 'beam', 'acinus']))); };
  const xBase = () => [
    ['x-mem', 'cell membrane', [xp(-640, 0), xp(640, 0), xp(-560, 0), xp(560, 0)], { up: -1, len: 30 }],
    /* (28 Nov 2026: the outside here is the duct, and the step's words say that the amylase "enters the duct") */
    ['x-out', 'the duct:<br>outside the cell', [xp(-420, 230), xp(420, 230), xp(-560, 160), xp(560, 160), xp(-760, 200), xp(760, 200)], { aside: false, small: '<span class="nm__t">the duct:<br>outside the cell</span>' }],
    ['x-in', 'inside the cell', [xp(-640, -260), xp(640, -260), xp(-640, -560), xp(640, -560), xp(-780, -500), xp(780, -500)], { aside: false, small: '<span class="nm__t">inside<br>the cell</span>' }]
  ];
  /* ---- the courses on the way out's picture (18 Nov 2026; the places planner's plan-exit) ----
     Every pupil: at the side of the cell the nerve ending and the cell membrane are named; the chemical is drawn: 40
     lights leave the nerve ending, each by its own random way, and stop on the cell membrane (none goes back: the signal
     passes one way), one of them named; the message that spreads carries its name; at Release the vesicle's membrane
     has a tint of its own, and once it has joined the cell membrane that tint spreads along the line and grows paler
     (its lipids spread: the same light over a longer stretch); "exocytosis" and "endocytosis" ride on what they name.
     IGCSE (14.1.6): "gland cell: the effector". IB: "synapse" where the two meet (C2.2.5; with IGCSE alone no synapse:
     0610 14.1.7 keeps the word for two neurones), "plasma membrane (cell membrane)"; at HL the chemical is
     "noradrenaline", and the message is many small lights, "cAMP: the second messenger" (C2.1.9, C2.1.10: a second
     messenger is molecules that spread, so no single ball of light), "the membranes fuse: they are fluid" (B2.1.13),
     "clathrin: a coat protein" (B2.2.9). The receptor, the G protein and the enzyme are not drawn, so they have no
     name on the picture: they stay in the box */
  const EXW = { 'x-mem': { ib: 'plasma membrane<br>(cell membrane)', card: 'x-mem' }, 'x-pit': { ib: 'coated pit', hl: 'clathrin:<br>a coat protein', card: 'x-pit' }, 'x-pit2': { ib: 'coated pit', hl: 'clathrin-coated pit' } };   /* (the science read: "clathrin" is a word of B2.2.9, an HL line: with IB on at SL the pit is a "coated pit") */
  const xItem = ([key, html, spots, o]) => { const { w, ...opt } = o || {}; return cName(Object.assign({ key, free: true, aside: true, html: `<span class="nm__t">${html}</span>`, spots }, opt), Object.assign({}, EXW[key], w)); };
  const xKeep = () => [...HUD(), ...document.querySelectorAll('#stage .rtag')];
  const xNames = (F, list, solid = [], w = 40, c = F.p) => { nucAgain = () => xNames(F, list, solid, w, c);
    quest.names.set((typeof list === 'function' ? list() : list).filter(Boolean).map(xItem), xKeep(), Object.assign(lr(c.clone().addScaledVector(F.right, -w / 1000), c.clone().addScaledVector(F.right, w / 1000)), { on: true }), solid.filter(Boolean)); };
  const farNames = list => { nucAgain = () => farNames(list); quest.names.set(list().filter(Boolean).map(xItem), xKeep()); };
  /* a number from 0 to 1 that is the same every time for the same k (the lights' ways: a seed, as wayflow.js) */
  const seed01 = k => { const s = Math.sin(k * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  async function smell() {
    nucStep();
    await fly(world.P.exit.view.pos, world.P.exit.view.at);
    const ves = props.ves || (props.ves = granule()); ves.position.copy(TOP).add(V(0.6, -0.5, 1.1));
    await press(() => TOP.clone().add(V(-2.2, 0.3, 1.4)), '🍞 Taste the bread', {});
    /* (the nerve takes its place before it is first seen: the gap is there from its first frame, not from the release) */
    const e = W.nerve.end;
    if (!W.nerve.back) { const e0 = e.getWorldPosition(V(0, 0, 0)), away = V(e0.x, 0, e0.z).normalize(); [W.nerve.tube, e].forEach(o => o.position.addScaledVector(away, 0.6)); e.scale.multiplyScalar(0.8); e.updateMatrixWorld(true); W.nerve.back = away.multiplyScalar(0.6); }
    W.nerve.tube.visible = true; W.nerve.end.visible = true;
    /* (a phone: the camera looks nearer the nerve ending; in the laptop's view it stood in the picture's corner, under Hide text) */
    const look = PHONE() ? { pos: [10.5, 7.5, 13], at: [5.2, 4.2, -2.4] } : { pos: [9, 9.5, 14], at: [3, 6.5, -1] };
    await live(world.flyTo(look, { ms: 1800 }));
    /* (the last check, 18 Nov 2026: the nerve ending's ball reached into the cell membrane (its middle 0.36 µm from the
       membrane, its radius there 0.48 µm), so there was no gap for the chemical to cross: its lights moved inside the
       ball, unseen, and "chemical" named the ending. Once, when the nerve first shows, it stands 0.6 µm further from
       the cell and its ending is four fifths of its size: a gap of about 0.55 µm, which the chemical is seen to cross) */
    const E0 = e.getWorldPosition(V(0, 0, 0)), u = V(-E0.x, 0, -E0.z).normalize(), nPath = t => W.nerve.path.getPoint(t).add(W.nerve.back);
    /* (how far the ending's surface is from its middle on the side that faces the cell) */
    const rU = 1 / Math.hypot(u.x / (e.geometry.parameters.radius * e.scale.x), u.z / (e.geometry.parameters.radius * e.scale.z));
    /* where the nerve ending meets the cell: the cell membrane's own surface, on the way from the ending to the cell's middle line */
    const memHit = dy => { const o = E0.clone().add(V(0, dy, 0)).addScaledVector(u, -0.6), h = new THREE.Raycaster(o, u, 0, 4).intersectObject(W.groups.membrane, true)[0]; return h ? h.point : o.addScaledVector(u, 1.1); };
    const C = memHit(0), gapD = Math.max(0.35, C.distanceTo(E0)), lat1 = V(0, 1, 0), lat2 = u.clone().cross(lat1).normalize();
    props.syn = { gap: +C.distanceTo(E0).toFixed(3), free: +(C.distanceTo(E0) - rU).toFixed(3) };   /* (free: from the ending's surface to the cell membrane) */
    farNames(() => [
      ['x-nerve', 'nerve ending', [E0.clone().addScaledVector(u, -0.2).add(V(0, -0.45, 0)), nPath(0.3), nPath(0.22)], { aside: false, up: 1, len: 26 }],   /* (under it: beside it, on the right, the picture ends) */
      ['x-mem', 'cell membrane', [memHit(2.2), memHit(3.2), memHit(-1.4), memHit(1.4), memHit(4.0), memHit(-2.4)], Object.assign({ sides: [1, 1, 1, 1, 1, 1], w: Object.assign({ card: null }, PHONE() ? { ibSmall: 'plasma<br>membrane' } : {}) }, PHONE() ? { small: '<span class="nm__t">cell<br>membrane</span>' } : {})],   /* (no card here: its card speaks of a vesicle that fuses, which is step 2's picture) */
      /* (the science read: 0610 14.1.6 makes the gland the effector, and this is one cell of it; its line ended on the nucleus: its spots are now in the cytoplasm above the nucleus) */
      lvHere('igcse') ? ['x-eff', 'gland cell:<br>part of the effector', [V(2.35, 8.34, 2.6), V(1.95, 8.4, 2.6), V(2.75, 8.3, 2.6), V(2.35, 8.5, 2.6), V(2.0, 8.25, 2.6)], { sides: [-1, -1, -1, -1, -1] }] : null,   /* (in the cytoplasm between the corner boxes and the nucleus: a probe of 18 Nov 2026 gave their places on a laptop, about (330, 275) px; higher, the name met the boxes and was left out) */
      /* (the synapse: where the two meet, the gap between them) */
      lvHere('ib') ? ['x-syn', 'synapse', [E0.clone().addScaledVector(u, (rU + gapD) / 2).add(V(0, 0.42, 0)), E0.clone().addScaledVector(u, (rU + gapD) / 2).add(V(0, 0.6, 0)), E0.clone().addScaledVector(u, (rU + gapD) / 2).add(V(0, -0.45, 0))], { sides: [1, 1, 1] }] : null]);
    const em = e.material; em.emissive = em.emissive || new THREE.Color(); em.emissive.setHex(0xffd84a); em.emissiveIntensity = 0.55;   /* (the science read: at 1.6 the ending's glare hid the 40 lights, so "chemical" named a glare; and a burst of 60 sparks flew from the ending in every direction, into the cell too: the chemical does not enter the cell, so it is gone) */
    wayArrow(new THREE.LineCurve3(E0.clone().addScaledVector(u, rU), C.clone()), 0.03);   /* (Reduce motion, a course on: the still keeps the way) */
    /* the chemical: each light from the ending's side that faces the cell, by its own random way, to the cell membrane,
       where it stops; along the way it only ever comes nearer the cell */
    /* (16 lights of 0.05, were 40 of 0.1: in the small gap forty lights that add their light ran together into one
       white glow, and "chemical" named a glow: the last check read) */
    /* (each a solid red-orange ball, about 0.1 µm across in this far view, from the ending's surface: lights that add their light only whitened the pale ending and the pale membrane) */
    /* (drawn over the membrane's own pale, see-through front, which wraps round them at the cell's edge: there they turned pale pink and read as sinking in and becoming the pink message; a red-orange, not the ribosomes' yellow-orange) */
    const chemM = new THREE.MeshBasicMaterial({ color: 0xff3d00, transparent: true, depthTest: false, depthWrite: false }), chemG = new THREE.SphereGeometry(0.058, 12, 8);
    const NC = 16, STEPSN = 20, lights = [...Array(NC)].map((_, i) => {
      const g = keep(new THREE.Group()); { const m = new THREE.Mesh(chemG, chemM); m.renderOrder = 40; g.add(m); } g.visible = false;
      const way = [], end = gapD - 0.06; let s = rU * (1.0 + 0.04 * seed01(i)), a = (seed01(i + 0.3) - 0.5) * 0.3, b = (seed01(i + 0.6) - 0.5) * 0.3;
      for (let j = 0; j <= STEPSN; j++) { way.push(E0.clone().addScaledVector(u, Math.min(end, s)).addScaledVector(lat1, a).addScaledVector(lat2, b));
        s += (end - s) * (0.08 + 0.2 * seed01(i * 31 + j)); a += (seed01(i * 17 + j + 0.2) - 0.5) * 0.1; b += (seed01(i * 13 + j + 0.7) - 0.5) * 0.1; if (j === STEPSN - 1) s = end; }
      return { g, way, t0: 700 * seed01(i + 0.9) };
    });
    props.syn.back = lights.some(L => L.way.some((p, j) => j && p.clone().sub(E0).dot(u) < L.way[j - 1].clone().sub(E0).dot(u) - 1e-9));   /* (for the check: no light ever goes back towards the nerve ending) */
    const chemTag = rideTag(() => lights[7].g.position, () => (lights[7].g.visible ? (ibHL() ? 'noradrenaline' : 'chemical') : ''), true);   /* (under it: over it stands the name of the place where the two meet) */
    await play(2600, k => { const t = k * 2600; lights.forEach(L => { const q = Math.max(0, Math.min(1, (t - L.t0) / 1800)) * STEPSN, j = Math.min(STEPSN - 1, Math.floor(q)); L.g.visible = t >= L.t0; L.g.position.copy(L.way[j]).lerp(L.way[j + 1], q - j); }); });
    /* the message spreads through the cell, towards the vesicles at the top: 70 small lights that start at the
       membrane's inner face and spread, each by its own way, in a colour of their own (the science read: the message
       was a ball of light centred on the nerve ending, which crossed the membrane and spread outside the cell too, so
       it read as the chemical entering the cell; and at HL cAMP's lights had the chemical's colour and started where
       the chemical stopped, so they read as noradrenaline passing through). The name rides on one of the lights.
       IB at HL names them: cAMP, the second messenger */
    let mk = 0;
    const camp = [...Array(70)].map((_, i) => { const g = keep(new THREE.Group()); haloSprite(g, 0.24, 0xff86dc); g.visible = false;   /* (pink, and larger: pale blue lights of 0.16 could hardly be seen on the cell's blue and green) */
      const a = C.clone().addScaledVector(u, 0.2).addScaledVector(lat1, (seed01(i + 0.11) - 0.5) * 0.9).addScaledVector(lat2, (seed01(i + 0.22) - 0.5) * 0.9);
      const b = C.clone().lerp(TOP, 0.2 + 0.8 * seed01(i + 0.33)).add(V((seed01(i + 0.44) - 0.5) * 2.4, (seed01(i + 0.55) - 0.5) * 2.4, (seed01(i + 0.66) - 0.5) * 2.4));
      { const d = b.clone().sub(C).dot(u); if (d < 0.3) b.addScaledVector(u, 0.3 - d); }   /* (never outside the cell: at least 0.3 µm inside the membrane where the chemical stopped) */
      g.position.copy(a); return { g, a, b, ph: 6.28 * seed01(i + 0.77) }; });
    /* (the light that carries the name: the one that ends nearest the middle of the way; a phone: nearer the membrane, inside its picture) */
    const mAim = C.clone().lerp(TOP, PHONE() ? 0.3 : 0.5), nearAim = L => L.reduce((m, o) => (o.b.distanceTo(mAim) < m.b.distanceTo(mAim) ? o : m), L[0]);
    /* (a phone: of the lights that end in the free part of the picture, under the corner boxes and over the text: the name had ridden up under the Word bank) */
    const seen = PHONE() ? camp.filter(o => { const c = world.project(o.b); return c && c.inFront && c.x > 110 && c.x < world.size.w - 110 && c.y > 200 && c.y < world.size.h - (world.inset.bottom || 0) - 70; }) : [];
    const lead = nearAim(seen.length ? seen : camp);
    const msgTag = rideTag(() => lead.g.position, () => (mk > 0 ? (ibHL() ? 'cAMP: the second messenger' : 'the message') : ''));
    props.syn.camp = ibHL() ? camp.length : 0; props.syn.msg = camp.length; props.syn.in = camp.every(o => o.a.clone().sub(C).dot(u) > 0 && o.b.clone().sub(C).dot(u) > 0);   /* (for the check: every light of the message starts and ends inside the cell) */
    await play(3000, k => { mk = k; camp.forEach(o => { const q = smooth(0, 1, Math.min(1, k * 1.2)); o.g.visible = k > 0; o.g.position.copy(o.a).lerp(o.b, q).addScaledVector(lat1, 0.25 * Math.sin(o.ph + 9 * q) * (1 - q)); }); });
    em.emissiveIntensity = 0.3;
    if (courseOn()) await quest.next(); else await wait(R.TEST ? 0 : 2000);   /* (the names are read while the camera rests here) */
    chemTag.off(); msgTag.off(); arrowOff();
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    camp.forEach(o => drop(o.g));
    await fly(world.P.exit.view.pos, world.P.exit.view.at, 1600);
    quest.say('The message reaches the vesicles at the top of the cell.', 'ok');
  }
  /* the close membrane as it was made: its two halves together, nothing of an earlier Release left on it */
  const exitReset = () => { const c = props.close; if (!c) return; c.userData.halves.forEach(h => { h.position.x = 0; h.children.filter(m => m.userData.kind === 'tint').forEach(m => h.remove(m)); }); c.children.filter(m => m.userData.kind === 'bridge').forEach(m => c.remove(m)); };
  async function fuse() {
    exitReset();
    const ves = props.ves || (() => { const t = granule(); t.position.copy(TOP).add(V(0.6, -0.5, 1.1)); return (props.ves = t); })();
    nucStep();
    /* (the vesicle's membrane has a tint of its own from the step's start, so that the pupil can follow it into the cell membrane) */
    const TINT = 0x5fe0d0;
    if (ves.userData.shell && !ves.userData.tinted) { ves.userData.shell.material = ves.userData.shell.material.clone(); ves.userData.shell.material.color.setHex(TINT); ves.userData.tinted = true; }
    await exitClose();
    const F = exitFrame(), cloud = ves.children.find(c => c.userData.kind === 'amylase-cloud');
    await tween(ves, { to: xp(0, -(GR * 1000 + 4)), ms: 1400 });
    const someSpeck = (x, y) => { const M = new THREE.Matrix4(), v = V(), aim = xp(x, y); let best = null, bd = Infinity; for (let i = 0; i < cloud.count; i += 7) { cloud.getMatrixAt(i, M); v.setFromMatrixPosition(M); const w = cloud.localToWorld(v.clone()), d = w.distanceTo(aim); if (d < bd) { bd = d; best = w; } } return best; };
    xNames(F, [...xBase(), ['x-ves', 'vesicle', ...rimSpots(F, ves.position, GR)], ['x-amy', 'amylase', [someSpeck(-445, -560), someSpeck(445, -420), someSpeck(-420, -320)], { sides: [-1, 1, -1] }]], [ves], 700);
    await press(() => xp(GR * 1000 + 30, -GR * 1000), 'Release', { side: 'r', w: 'release' });
    /* the membranes join: an opening widens; the vesicle flattens into it; its amylase streams out into the lumen */
    quest.names.set([], HUD());
    /* (gap: half the opening when it has formed; GF: half the flat vesicle's width: as the vesicle flattens the opening
       widens from the first to the second, so the cut ends of the cell membrane stay on the vesicle's rim. The last
       check read: for a moment the flat vesicle lay under the cell membrane, wider than the opening: two layers) */
    const [L, Rh] = props.close.userData.halves, gap = 0.21, GF = GR * 1.15;
    /* "exocytosis", the step's own word, rides on the vesicle from Release to the end; IB at HL, as the two membranes
       touch: why they can join (B2.1.13) */
    /* (IB at SL: "exocytosis" is Year 7's own word here, and in the IB guide a word of B2.1.13, an HL line: the mark says so) */
    const no0610 = () => (lvHere('igcse') && !lvHere('ib') ? 'not named in 0610' : lvHere('ib') && !ibHL() ? 'HL in the IB guide: B2.1.13' : '');
    const exoTag = rideTag(() => xp(0, -2 * (GR * 1000 + 4) * ves.scale.y - 26), 'exocytosis', true, no0610);
    const fuseTag = rideTag(() => (PHONE() ? xp(0, 44) : xp(560, -46)), () => (ibHL() ? 'the membranes fuse: they are fluid' : ''), !PHONE(), null, true);   /* (a laptop: beside the opening, under the membrane on the right: over the opening the label covered the amylase that streams out, and on the left it stood under the corner buttons) */
    /* the vesicle's membrane in the cell membrane: a tinted stretch at each side of the opening, which then spreads along
       the line and grows paler: the same light over a longer stretch (its lipids spread into the cell membrane) */
    const tintM = new THREE.MeshBasicMaterial({ color: TINT, transparent: true, opacity: 0, depthWrite: false }), W0 = 0.3, W1 = 1.1;   /* (1.1, was 1.5: the tinted stretch ends about as long as the vesicle's own outline, and it is still seen: at 1.5 it was too pale to see) */
    const tint = [[L, -1], [Rh, 1]].map(([h, sgn]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 0.0074, 0.502), tintM); m.userData.kind = 'tint'; m.userData.s = sgn; m.scale.x = W0; m.position.set(sgn * W0 / 2, 0, -0.25); m.renderOrder = 3; h.add(m); return m; });
    /* (the science read: the opening closed and the line kept its length, so no membrane was added, against "adds
       membrane". Now the two halves stay apart, and the stretch between them is the vesicle's own membrane, flat: the
       cell membrane is longer by it. Its tint then spreads along the line, as before) */
    const bm = [magicStandard({ color: 0xff9ac8, roughness: 0.5, transparent: true, opacity: 0 }, { rim: 0xffd6ea, rimK: 0.4 }), magicStandard({ color: 0xfff0f5, roughness: 0.7, transparent: true, opacity: 0 }, { rim: 0xffffff, rimK: 0.15 })];
    const bridge = new THREE.Group(); bridge.userData.kind = 'bridge'; bridge.visible = false;
    [[1.8, 3, 0], [-1.8, 1.8, 1], [-3, -1.8, 0]].forEach(([y0, y1, m]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(2 * GF, (y1 - y0) / 1000, 0.5), bm[m]); b.position.set(0, (y0 + y1) / 2000, -0.25); bridge.add(b); });
    { const b = new THREE.Mesh(new THREE.BoxGeometry(2 * GF, 0.0074, 0.502), tintM); b.position.set(0, 0, -0.25); b.renderOrder = 3; bridge.add(b); }
    props.close.add(bridge);
    props.tint = { w: W0, op: 0, gap: 0 };
    /* (the second science read, 18 Nov 2026: the cell membrane parted over a vesicle that was still closed, and its cut
       ends stood free: a hole at each side, nothing joined. Now the two membranes are one from the moment they touch:
       the vesicle's middle rises so that its skin passes through the two cut ends of the cell membrane at every moment,
       and the part of its skin over the line is not drawn: that is the opening) */
    world.renderer.localClippingEnabled = true;
    if (ves.userData.shell) ves.userData.shell.material.clippingPlanes = [new THREE.Plane().setFromNormalAndCoplanarPoint(F.n.clone().negate(), xp(0, 0))];
    scene.attach(cloud);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), one = V(1, 1, 1), n = cloud.count, from = [], to = [], mid = [], t0s = [];
    for (let i = 0; i < n; i++) {
      cloud.getMatrixAt(i, M); const p = V().setFromMatrixPosition(M); from.push(p);
      const ox = (Math.random() - 0.5) * 0.36, ex = ox * 2.4 + (Math.random() - 0.5) * 0.9;
      mid.push(cloud.worldToLocal(xp(ox * 1000, 12)));
      to.push(cloud.worldToLocal(xp(ex * 1000, 60 + Math.random() * 520, (Math.random() - 0.5) * 200)));
      t0s.push(Math.pow(Math.random(), 0.7) * 1500);
    }
    /* (the science read: the vesicle was flat at 1.7 s while most of its amylase still lay under it, loose in the
       cytoplasm. Now it flattens only as fast as its amylase leaves, and a molecule that has not left yet stays inside
       it: its place is pressed towards the opening as the vesicle flattens) */
    const topL = cloud.worldToLocal(xp(0, 0)), nL = cloud.worldToLocal(xp(0, 1000)).sub(topL).normalize(), inVes = (p, sy) => p.clone().addScaledVector(nL, -p.clone().sub(topL).dot(nL) * (1 - sy));
    const t0 = performance.now(), s0 = quest.session, T = R.FAST ? 0 : 3400;
    await live(new Promise(res => {
      const f = () => {
        if (quest.session !== s0) return res();
        const t = R.FAST ? 1e9 : performance.now() - t0, open = smooth(0, 900, t), join = smooth(2500, 3300, t);
        const k = smooth(300, 2500, t), sy = Math.max(0.02, 1 - k), aW = GR * (1 + 0.15 * k), g1 = gap * open + (aW - gap * open) * k * k;   /* (g1: half the opening now) */
        L.position.x = -g1; Rh.position.x = g1;
        ves.scale.set(1 + 0.15 * k, sy, 1 + 0.15 * k);
        ves.position.copy(xp(0, -GR * 1000 * sy * Math.sqrt(Math.max(0, 1 - Math.min(1, (g1 / aW) ** 2)))));   /* (its skin on the two cut ends) */
        if (ves.userData.shell) { const m = ves.userData.shell.material; m.opacity = 0.42 * (1 - join); }
        bridge.visible = join > 0; bm.forEach(m => { m.opacity = join; });
        tintM.opacity = props.tint.op = 0.9 * join; props.tint.gap = 2 * g1;
        for (let i = 0; i < n; i++) {
          const u = Math.max(0, Math.min(1, (t - 300 - t0s[i]) / 1500)), e = u * u * (3 - 2 * u);
          const p = e < 0.5 ? inVes(from[i], sy * (1 - 0.08 * open)).lerp(mid[i], e * 2) : mid[i].clone().lerp(to[i], e * 2 - 1);
          cloud.setMatrixAt(i, M.compose(p, q, one));
        }
        cloud.instanceMatrix.needsUpdate = true; cloud.computeBoundingSphere(); world.kick && world.kick();
        if (t < T + 1500) requestAnimationFrame(f); else res();
      };
      f();
    }));
    drop(ves); props.ves = null; kept.push(cloud);
    burst(scene, xp(0, 40), { n: 40, r: 0.12, size: 0.006, near: 0.004, color: 0xc8fff0 });
    xNames(F, [...xBase(), ['x-amy', 'amylase', [xp(-300, 380), xp(300, 380), xp(0, 300)].map(p => { let best = p, bd = Infinity; const v = V(); for (let i = 0; i < n; i += 9) { cloud.getMatrixAt(i, M); v.setFromMatrixPosition(M); const w = cloud.localToWorld(v.clone()), d = w.distanceTo(p); if (d < bd) { bd = d; best = w; } } return best; })]], [], 700);
    quest.say('Exocytosis: the amylase leaves the cell and enters the duct.', 'ok');
    /* the tint spreads for 5 s, as fast at first as lipids that spread at random would (the square root of the time) */
    /* (Reduce motion: the still keeps the tinted stretch as it is just after the join; spread, the whole line was one pale colour) */
    const spread = R.FAST ? Promise.resolve() : play(5000, k => { const w = W0 + (W1 - W0) * Math.sqrt(k); tint.forEach(m => { m.scale.x = w; m.position.x = m.userData.s * w / 2; }); tintM.opacity = 0.9 * (W0 + GF) / (w + GF); props.tint = { w, op: tintM.opacity, gap: 2 * GF }; });   /* (the tinted stretch: the vesicle's own, between the halves, and w on each side of it) */
    spread.then(() => { if (!R.FAST) fuseTag.off(); }).catch(() => {});   /* (HL: "the membranes fuse" stays from the join through the spread: it had gone as the join began) */
    if (courseOn()) await quest.next(); else await wait(R.TEST ? 0 : 5000);   /* (the spreading is watched; with a course on the step waits) */
    exoTag.off();
    quest.names.set([], HUD()); nucAgain = null; cardOff();
    await nanoOut(world.P.exit.view);
    exitReset();   /* (far away now: the next step's close view is as before) */
    drop(cloud);
    /* from far away each molecule is far too small to see: glows show the amylase flowing on, to the duct */
    const path = W.lumen.path, glows = [];
    for (let i = 0; i < 10; i++) { const g = keep(new THREE.Group()); haloSprite(g, 0.09, 0xc8fff0); g.position.copy(FUSE); glows.push(g); }
    await Promise.all(glows.map((g, i) => new Promise(r => setTimeout(() => tween(g, { path: new THREE.CatmullRomCurve3([FUSE.clone(), path.getPointAt(0.05 + i * 0.01), path.getPointAt(0.3 + i * 0.03)]), ms: 2600 }).then(r), R.FAST ? 0 : i * 140))));
    glows.forEach(drop);
    await quest.gain('saliva', FUSE);
    state.use('top');
  }
  /* ---------------- endocytosis: the membrane used again (16 Nov 2026) ----------------
     The way out's last line (story.js exit, step 3): "Later, new vesicles form from this membrane and return inside the
     cell, so the membrane is used again" (its IB box: endocytosis, and clathrin bending the membrane into a pit). Before,
     the step showed nothing. Now the camera comes close again, at true sizes, beside another vesicle of amylase waiting
     under the membrane (1 µm across, as at Release): on the inner face of the cell membrane two clathrin-coated pits
     (clathrin.js: the coat a cage of 12 pentagons and 30 hexagons of 7-nm strands; a coated vesicle about 100 nm across,
     the membrane vesicle in it about 60 nm; Heuser 1980, J Cell Biol 84:560; Paraan et al. 2020, Sci Adv 6:eaba8397).
     One deepens, its neck closes and it leaves as a coated vesicle, 220 nm into the cell; the other is still a pit, so
     both are named at the end. With Reduce motion that end shows at once, both named. The pits hang under the membrane
     80 nm behind its cut face (seen past its edge, eye level with it); the vesicle of amylase stands in the cut face's
     own plane, as at Release. All of it belongs to the close drawing (props.close), so it comes and goes with it.
     Proof: tools/look.mjs --place exit, tools/true-size.mjs F */
  const ENDO = { A: 430, B: 665, Z: -80, VX: -330, VY: -(GR * 1000 + 70), DX: 40 };   /* nm: the two pits, how far behind the cut face, the vesicle of amylase, how far sideways the coated vesicle goes */
  /* the view: the right part of the vesicle of amylase, both pits, and where the coated vesicle goes (nm; a phone: taller) */
  const endoView = () => (PHONE() ? { x: 390, y: 40, w: 800, h: 980 } : { x: 290, y: -120, w: 1000, h: 760 });   /* (the membrane under the corner boxes: a third of the way down on a laptop, lower on a phone, whose boxes are larger) */
  function endoMake() {
    const close = exitMembrane();
    if (props.endo && props.endo.g.parent === close) return props.endo;
    const g = new THREE.Group(); g.userData.kind = 'endocytosis';
    const coat = magicStandard({ color: 0xf1eadb, roughness: 0.55, emissive: 0x3a3428, emissiveIntensity: 0.3 }, { rim: 0xffffff, rimK: 0.5 });
    const mem = magicStandard({ color: 0xff9ac8, roughness: 0.5 }, { rim: 0xffd6ea, rimK: 0.4 });   /* (the membrane's own heads: exitMembrane) */
    const A = makePit({ mem, coat }), B = makePit({ mem, coat });
    A.g.position.set(ENDO.A / 1000, 0, ENDO.Z / 1000); B.g.position.set(ENDO.B / 1000, 0, ENDO.Z / 1000);
    A.g.userData.kind = 'coated-vesicle';
    const ves = token('vesicle', GR); ves.add(amyCloud(GR - 0.03, 7000)); ves.position.set(ENDO.VX / 1000, ENDO.VY / 1000, 0);
    g.add(A.g, B.g, ves); close.add(g);
    return (props.endo = { g, A, B, ves });
  }
  const endoClose = () => { exitMembrane(); const F = exitFrame(), v = endoView(), dist = fitDist(v.w, v.h), a = Math.asin(-v.y / 1000 / dist), dir = F.along.clone().multiplyScalar(Math.cos(a)).addScaledVector(F.n, Math.sin(a)).normalize();
    return nanoIn({ at: xp(v.x, v.y), dir, up: F.n.clone(), dist }, NEAR_HIDE().concat(groupsOf(['membrane', 'apex', 'granules', 'centrosome', 'beam', 'acinus']))); };
  /* the names: the membrane between the pits and beside them, the two sides, the vesicle of amylase by its right edge, the
     pit that stays (on its coat, below and to each side), and the coated vesicle by its edge (the cut face's plane of a
     pit is 80 nm nearer the camera than its middle: the points stand on its near side) */
  function endoNames(E, end) {
    const F = exitFrame(), at = (P, X, a, r) => fp(F, X + P.st.x + Math.cos(a) * r, P.st.yc + Math.sin(a) * r, ENDO.Z + 40), deg = Math.PI / 180, C = exitMembrane();
    const vesAt = C.localToWorld(E.ves.position.clone()), cv = C.localToWorld(E.A.centre().add(E.A.g.position));
    const list = [
      ['x-mem', 'cell membrane', [xp(160, 0), xp(548, 0), xp(780, 0), xp(260, 0)], { up: -1, len: 30 }],
      ['x-out', 'the duct:<br>outside the cell', [xp(560, 120), xp(300, 130), xp(720, 110), xp(420, 90), xp(790, 70)], { aside: false, small: '<span class="nm__t">the duct:<br>outside the cell</span>' }],
      ['x-in', 'inside the cell', [xp(760, -440), xp(700, -520), xp(520, -420), xp(480, -400), xp(640, -470), xp(330, -440)], { aside: false, small: '<span class="nm__t">inside<br>the cell</span>' }],
      [end ? 'x-ves3' : 'x-ves2', end ? 'vesicle with amylase:<br>exocytosis next, adds membrane' : 'a vesicle with amylase', [0, -30, 30, -55, 45, 60].map(d => vesAt.clone().addScaledVector(F.right, Math.cos(d * deg) * GR).addScaledVector(F.n, Math.sin(d * deg) * GR)), Object.assign({ sides: [1, 1, 1, 1, 1, 1], small: end ? '<span class="nm__t">vesicle with amylase:<br>exocytosis next,<br>adds membrane</span>' : '<span class="nm__t">vesicle with<br>amylase</span>' },
        /* (IB at SL: "exocytosis" is a word of B2.1.13, an HL line: this name says so, as the riding word does in step 2; "endocytosis" needs no mark: C3.2.5, SL) */
        end && lvHere('ib') && !ibHL() ? { w: { ib: 'vesicle with amylase:<br>exocytosis next, adds membrane<br><span class="nm__no">exocytosis: HL in the IB guide (B2.1.13)</span>', ibSmall: 'vesicle with amylase:<br>exocytosis next,<br>adds membrane<br><span class="nm__no">exocytosis: HL in the IB guide (B2.1.13)</span>' } } : {})],
      ['x-pit', 'clathrin-coated pit', [at(E.B, ENDO.B, -90 * deg, 46), at(E.B, ENDO.B, -40 * deg, 46), at(E.B, ENDO.B, -140 * deg, 46)], { sides: [1, 1, -1], small: '<span class="nm__t">clathrin-<br>coated pit</span>' }]
    ];
    /* (its two places, at its sides: the name with the fewest places is placed first, and a small part needs its room) */
    if (end) { const [P, o] = rimSpots(F, cv.addScaledVector(F.along, 0.04), 0.049); list.push(['x-cv', 'coated vesicle:<br>endocytosis, takes membrane back', [P[0], P[3]], { sides: [o.sides[0], o.sides[3]], small: '<span class="nm__t">coated vesicle:<br>endocytosis,<br>takes membrane<br>back</span>' }]); }
    else list.push(['x-pit2', 'clathrin-coated pit', [at(E.A, ENDO.A, -90 * deg, 46), at(E.A, ENDO.A, -140 * deg, 46)], { sides: [-1, -1], small: '<span class="nm__t">clathrin-<br>coated pit</span>' }]);
    /* (as closeNames, with the scale bar and Hide text kept clear too: on a phone "inside the cell" had stood on Hide text,
       and the vesicle's line had run over the scale bar) */
    const c = xp(endoView().x, endoView().y);
    nucAgain = () => endoNames(E, end);
    quest.names.set((end ? list : list.filter(n => n[0] !== 'x-pit')).map(xItem), [...HUDN(), ...document.querySelectorAll('#stage .rtag')],
      Object.assign(lr(c.clone().addScaledVector(F.right, -0.5), c.clone().addScaledVector(F.right, 0.5)), { on: true }), [E.ves, E.A.hull, E.B.hull, E.A.parts.mem, E.B.parts.mem]);
  }
  async function flatten() {
    nucStep(); exitReset();
    const E = endoMake();
    E.A.set({ depth: 0 }); E.B.set({ depth: 0 });
    await endoClose();
    /* first the pit that will close, named; then, without names (nothing named moves), it deepens and closes, the
       coated vesicle goes into the cell, and the other pit deepens */
    endoNames(E, false);
    await wait(R.FAST || R.TEST ? 0 : 2000);
    quest.names.set([], HUD());
    const D = 3400, N = 900, G = 1900, MS = D + N + G;
    /* (the said line's word rides on the pit as it deepens, and on the coated vesicle as it leaves) */
    const endoTag = rideTag(() => exitMembrane().localToWorld(E.A.centre().add(E.A.g.position)).addScaledVector(exitFrame().n, -0.056), 'endocytosis', true, () => (lvHere('igcse') && !lvHere('ib') ? 'not named in 0610' : ''));
    await play(MS, k => {
      const t = k * MS;
      E.A.set({ depth: Math.min(1, t / D), neck: 1 - Math.max(0, Math.min(1, (t - D) / N)), drop: Math.max(0, Math.min(1, (t - D - N) / G)), dx: ENDO.DX });
      E.B.set({ depth: 0.5 * Math.max(0, Math.min(1, (t - 600) / 4000)) });
    });
    endoTag.off();
    endoNames(E, true);
    quest.say('<p>Part of this membrane bends inwards into a pit, coated with a protein called clathrin. The pit closes into a coated vesicle, which moves into the cell: this is <dfn data-w="endocytosis">endocytosis</dfn> (endo = in). So the membrane is used again.</p><p>The coated vesicle is about 100 nm across. The vesicle with amylase is about ten times as wide.</p>', 'ok');
    await quest.next('Back to the map');
    /* the place ends as the way out ended before: from far away, the world as it is (tools/true-size.mjs F "after") */
    quest.names.set([], HUD()); nucAgain = null; cardOff();   /* (a card left open stood over the far view) */
    await nanoOut(world.P.exit.view);
  }

  /* ---------------- the start (simple, full, the mission) ---------------- */
  /* the names in the first place are laid out as the map's are (names.js): each on ONE level line that ends on its part,
     names a row apart and never over one another (Daniel's rule, memory label-lines-never-cross), several spots per
     part so every name finds a free row; they show while the camera is still */
  const spotsOf = (g, n = 8) => {
    const pts = [], m = new THREE.Matrix4(); if (!g) return pts; g.updateMatrixWorld(true);
    g.traverse(o => {
      if (pts.length >= n || !o.isMesh) return;
      if (o.isInstancedMesh) { const k = Math.max(1, Math.floor(o.count / n)); for (let i = 0; i < o.count && pts.length < n; i += k) { o.getMatrixAt(i, m); pts.push(new THREE.Vector3().setFromMatrixPosition(m).applyMatrix4(o.matrixWorld)); } }
      /* a mesh that is one drawing of many parts (every other mitochondrion is in ONE mesh, drawn where it stands: the
         mesh's own position is the world's middle, where no mitochondrion is; until 28 Nov 2026 the line of
         "mitochondria" could end there, on empty cytoplasm at the base of the cell: the picture inspection): points
         of its own surface, spread through it, a few a mesh */
      else { const A = o.geometry && o.geometry.attributes && o.geometry.attributes.position, take = Math.min(n - pts.length, Math.max(2, Math.ceil(n / 3)));
        if (A && A.count) { const k = Math.max(1, Math.floor(A.count / take)); for (let i = Math.floor(k / 2), c = 0; i < A.count && c < take; i += k, c++) pts.push(new THREE.Vector3().fromBufferAttribute(A, i).applyMatrix4(o.matrixWorld)); }
        else pts.push(o.getWorldPosition(new THREE.Vector3())); }
    });
    return pts;
  };
  const nameOf = (key, text, spots, own, cls = '') => ({ key, text, html: `<span class="nm__t">${text}</span>`, cls, spots: spots.filter(Boolean), own: own.filter(Boolean) });
  const HUD = () => [document.querySelector('.hud')];
  async function simple() {
    world.simple(true);
    const G = W.groups, P = world.P;
    quest.names.set(y7Names(), HUD());
    await quest.next();
    quest.names.set([]);
  }
  /* a name that stands for many parts in view is plural: mitochondria, ribosomes, vesicles (Daniel, 13 Nov 2026: "when
     showing names, if you show multiple structures, use the plural form, this is not the case at the start of the
     game"). At the start every mitochondrion and every ribosome is lit and the name is the kind's, so it is plural;
     a name whose line ends on the one part a step is about stays singular (the map, main.js: 5 Nov 2026, "if you're
     pointing to one mitochondrion, label it mitochondrion") */
  /* the cell membrane's name ends ON the membrane: points of the shell's own rim at the cut face, at these heights
     (until 28 Nov 2026 six points set by hand; four of them stood a few pixels outside the cell's outline: the picture
     inspection, tools/ib-level.mjs R) */
  const rimAt = (y, side) => { const A = W.membraneMesh.geometry.attributes.position, v = new THREE.Vector3(); let best = null, bx = -Infinity;
    for (let i = 0; i < A.count; i++) { v.fromBufferAttribute(A, i); if (Math.abs(v.y - y) > 0.2 || Math.abs(v.z - 0.3) > 0.45) continue; if (v.x * side > bx) { bx = v.x * side; best = v.clone(); } }
    return best ? W.membraneMesh.localToWorld(best) : null; };
  const y7Names = () => { const G = W.groups, P = world.P; return [
      nameOf('membrane', 'cell membrane', [rimAt(9.5, -1), rimAt(9.2, 1), rimAt(5.2, -1), rimAt(5.0, 1), rimAt(12.6, -1), rimAt(12.4, 1)], [G.membrane], 'is-y7'),
      /* (28 Nov 2026, the picture inspection's independent read: "cytoplasm" ended on a piece of mitochondrion, "ribosomes"
         crossed a long mitochondrion and ended beside it, "microtubules" ended where a mitochondrion is drawn behind the
         thin tube. So: the cytoplasm's name ends where no organelle is drawn (names.js `clear`), from many points of the
         cell's front; a ribosome named has no mitochondrion at its point nor under its line (`lineClear`)) */
      Object.assign(nameOf('cytoplasm', 'cytoplasm', [V(-3.0, 12.6, 1.0), V(3.0, 12.2, 1.2), V(-3.8, 9.0, 1.8), V(3.8, 8.6, 1.8), V(-2.2, 14.0, 0.8)].concat(
        [4, 5.5, 7, 8.5, 10, 11.5, 13].flatMap(y => [-1, 1].flatMap(sd => { const r = rimAt(y, sd); return r ? [0.4, 0.6, 0.8].map(f => V(r.x * f, y, 1.0)) : []; }))), [G.cytosol], 'is-y7'),
        { clear: [G.mitochondria, G.rer, G.ser, G.golgi, G.lysosomes, G.vesicles, N.group].filter(Boolean) }),
      nameOf('nucleus', 'nucleus', P.nucleus.spots, [N.group], 'is-y7'),
      nameOf('mito', 'mitochondria', P.mito.spots.concat(spotsOf(G.mitochondria, 8)), [G.mitochondria], 'is-y7'),
      Object.assign(nameOf('ribo', 'ribosomes', P.ribosome.spots.concat(W.freeRibosomes.slice(0, 120).filter((r, i) => i % 5 === 0).map(r => r.p.clone())), [G['free-ribosomes'], G.rer], 'is-y7'),
        { clear: [G.mitochondria], lineClear: [G.mitochondria] })
    ]; };
  /* each structure an electron microscope shows appears in turn, and its name joins the others */
  /* every structure of the first place with its name: they stay on the picture from Show everything on, through the
     place's last steps and while its checks are answered (12 Nov 2026; Daniel, from a lesson: a pupil who had pressed ↻
     on Show everything "is stuck. He can not answer the questions because the labels have disappeared": before, the
     names went at the next press, and a step watched again showed them for three seconds only) */
  const fullShow = () => { const G = W.groups, P = world.P; return [
      ['rer', P.rer.center, [nameOf('rer', 'rough ER', P.rer.spots, [G.rer])]],
      /* the nucleus closed (the pupil has not been inside yet: the inside is seen first in the dive): named "nucleus", as in
         the Year 7 view before (Daniel, 9 Nov 2026: it had been named "nuclear pore", for its pores, and "it should be
         nucleus") */
      world.nucOpen ? ['nucleus-inside', P.nucleolus.center, [nameOf('nucleolus', 'nucleolus', P.nucleolus.spots, [N.group]),
        nameOf('chromosomes', 'chromosomes', W.chromosomes.slice(0, 12).map(ch => inN(ch.curve.getPointAt(0.5))), [N.group])]]
        : ['nucleus-inside', inN(N.front[0].p), [nameOf('nucleus', 'nucleus', P.nucleus.spots, [N.group])]],
      ['ser', P.ser.center, [nameOf('ser', 'smooth ER', P.ser.spots, [G.ser])]],
      ['golgi', P.golgi.center, [nameOf('golgi', 'Golgi apparatus', P.golgi.spots, [G.golgi])]],
      ['granules', P.exit.center, [nameOf('vesicles', 'vesicles', W.granules.slice(0, 40).filter((g, i) => i % 4 === 0).map(g => g.p.clone()), [G.granules])]],
      ['microtubules', P.tracks.center, [Object.assign(nameOf('tracks', 'microtubules', P.tracks.spots, [G.microtubules]), { clear: [G.mitochondria, G.golgi, G.lysosomes, G.rer, N.group].filter(Boolean) })]],   /* (a microtubule is a hair's width here: its name ends where nothing else is drawn behind it) */
      ['lysosomes', V(-2.9, 10.6, -0.6), [nameOf('lysosomes', 'lysosomes', [V(-2.9, 10.6, -0.6)].concat(spotsOf(G.lysosomes, 8)), [G.lysosomes])]],
      ['centrosome', V(0.1, 14.55, -1.1), [nameOf('centrosome', 'centrosome', [V(0.1, 14.55, -1.1)].concat(spotsOf(G.centrosome, 4)), [G.centrosome])]],
      ['apex', V(0, 16.6, 0), [nameOf('duct', 'the duct', [V(0, 16.6, 0), V(-0.9, 16.3, 0.4), V(0.9, 16.3, 0.4)].concat(spotsOf(G.apex, 6)), [G.apex])]]
    ]; };
  /* all of them, with the Year 7 five (the nucleus once only) */
  function arriveNames() { const all = fullShow().flatMap(x => x[2]); quest.names.set(all.concat(y7Names().filter(n => !all.some(a => a.key === n.key))), HUD()); }
  async function full() {
    const b = quest.hot(() => V(0, 10.5, 3), 'Show everything', { side: 'c', cls: 'big' });
    await b.done; b.remove();
    const show = fullShow();
    const list = [];
    for (const [k, p, items] of show) {
      world.reveal(k); burst(scene, p, { n: 36, r: 0.8 });
      list.push(...items); quest.names.set(list.slice(), HUD());
      await wait(700);
    }
    world.simple(false);
    arriveNames();
    await quest.next();
  }
  async function organelles() { arriveNames(); await quest.next(); }
  /* (the map opens only once this place's checks are right: until then the last button says what comes next. It had
     said Go to the map, and the checks came instead) */
  async function mission() { arriveNames(); await quest.next(state.checked('arrive') ? 'Go to the map' : 'Answer the checks'); }

  const ACT = { look, oxygen, carriers, amino, co2, mlook, minside, split, feed, respire, water, dam, release, enter, findchr, pack, findgene, copy, export: exportCopy, small: () => build('small'), large: () => build('large'), out,
    assemble, translate, where, dock, grow, cut, fold, bud, lipid, layer, join, through, sortgame, package: packageIt, grab, maze, smell, fuse, flatten,
    simple, full, organelles, mission };
  /* ---------------- ↻ a finished step again (round 8, 10 Nov 2026) ----------------
     Daniel, 9 Nov 2026: "add … circle arrow … to repeat next to every action in case the students want to re-see the
     animation … you just replay that section … Otherwise, to replay an animation, they have to click restart
     everything"; his "Yes, build it" to the plan, the replay playing by itself. A finished step's ↻ (quest.js againBtn)
     plays that step's own code again in watch mode: each button it uses shows for a moment and presses itself (of
     several, the right one: quest.hot right), a choice picks its right answer, Next waits a moment, nothing is said
     again and no item flies to the bag (quest.js). (14 Nov 2026: its lines ARE said again, Next waits for the reader,
     and at its end the picture stays until Continue: quest.js "watched again".) Nothing of the game changes: while it plays, every change to the
     saved game does nothing (items, energy, flags, saving), and what the step needs is there; the step that was running
     stops, as when a pupil leaves. Then main.js sets the place up again as when the pupil comes back to it, at the step
     they were on. Stop ends it early. With Reduce motion the moves jump and the pauses keep their time, so the stills
     show. The dive replays as its own ↺ does (dive(true)); the mitochondrion is seen whole again before ✂ Cut it open.
     Proof: tools/replay-check.mjs */
  const REWIND = { mlook: () => setLid(0) };
  async function watch(id, i, li, fromMap = false) {   /* (fromMap: a step opened from the IB map, main.js ibLandPlace: its bar says so, and its last button takes the student back to their own step) */
    const name = STORY_STEPS(id)[i] && STORY_STEPS(id)[i].play;
    const keep0 = { has: state.has, use: state.use, add: state.add, spend: state.spend, setFlag: state.setFlag, setStep: state.setStep, finish: state.finish, save: state.save };
    const W8 = { session: ++quest.session, active: true };
    state.has = item => W8.active && quest.session === W8.session ? true : keep0.has.call(state, item);
    state.spend = (...a) => W8.active ? true : keep0.spend.apply(state, a);
    ['use', 'add', 'setFlag', 'setStep', 'finish', 'save'].forEach(k => { state[k] = (...a) => { if (!W8.active) return keep0[k].apply(state, a); }; });
    quest.clearHots(); quest.names.set([]); reset(true);
    /* from the IB map, a step inside the nucleus for a student who has not dived in yet (the nucleus is drawn closed
       until the dive: world.js setNucleus): it is drawn open while the step plays, as after the dive, and closed again
       at the end. The dive stays theirs to play */
    const shut = fromMap && id === 'nucleus' && !state.flag('in-nucleus');
    if (shut) world.setNucleus(true);
    /* a camera that the stopped step was still moving (track() keeps it moving until its step lands it) is landed here, or
       the replay's first wait for a still camera (settle) would wait for ever */
    if (world.flying) world.landed({ pos: world.camera.position.toArray(), at: world.controls.target.toArray() }, false);
    quest.panel.querySelectorAll('.step.is-now .step__do').forEach(d => { d.innerHTML = ''; });   /* the stopped step's own buttons go */
    quest.watching = W8; quest.step = { li, do: li.querySelector('.step__do'), say: li.querySelector('.step__say'), i };
    li.classList.add('is-watching');
    quest.lvOpen(li);   /* (its course boxes open with it: they had stayed shut, the places planner, 17 Nov 2026) */
    const bar = R.h('p', { class: 'step__watch' + (fromMap ? ' step__watch--map' : ''), role: 'status' }, fromMap ? '<span>🧬 From the IB map: this step plays for you</span>' : '<span>↻ Watching this step again</span>');
    const stop = R.h('button', { type: 'button', class: 'btn ghost step__stop' }, '■ Stop'); bar.appendChild(stop); li.appendChild(bar);
    stop.addEventListener('click', () => { if (quest.session === W8.session) { W8.stopped = true; quest.session++; } });
    if (!fromMap) quest.scrollTo(li);   /* (from the IB map the panel already stands at the marked sentence: quest.js ibPaint) */
    /* it ends when the step has played, or at once on Stop or when the pupil leaves; a stopped step goes no further (its
       waits throw, and its watched buttons and pauses never come: quest.js), so nothing of it can change the game after */
    let tick = 0;
    const stopped = new Promise(res => { tick = setInterval(() => { if (W8.stopped || quest.session !== W8.session) res(); }, 100); });
    try {
      if (REWIND[name]) REWIND[name]();
      const played = (name === 'enter' ? dive(true) : ACT[name] ? ACT[name]() : Promise.resolve());
      played.catch(e => { if (e !== STALE) console.error(e); });
      await Promise.race([played, stopped]);
      /* played to its end: the picture and the step's last line stay until the pupil presses Continue (14 Nov 2026,
         Daniel: "there is very little time to see the animation and see the green text"; before, the place was set up
         again at once, and the end of the step was gone with its line). Not when Next was the step's own last thing
         (the pupil has just pressed it), and with nothing said only a moment; by itself after a minute, so that no
         pupil is left in a replay */
      /* (from the IB map the step always stays, however it ended and for as long as the student reads: they came for its
         marked sentence, and at the end of the watch the step and its marks go; 18 Nov 2026) */
      if (!W8.stopped && quest.session === W8.session && !R.TEST && (fromMap || !(W8.nextT && performance.now() - W8.nextT < 600))) {
        if (!W8.last && !fromMap) await Promise.race([new Promise(r => setTimeout(r, 1500)), stopped]);
        else {
          bar.firstChild.textContent = fromMap ? '🧬 From the IB map: you watched this step' : '↻ You watched this step again'; stop.remove();
          const cont = R.h('button', { type: 'button', class: 'btn next pulse step__cont' }, fromMap ? '↩ Back to my own step' : 'Continue →'); bar.appendChild(cont); if (!fromMap) quest.scrollTo(bar);
          await Promise.race([new Promise(r => cont.addEventListener('click', r, { once: true })), ...(fromMap ? [] : [new Promise(r => setTimeout(r, 60000))]), stopped]);
        }
      }
    } catch (e) { if (e !== STALE) console.error(e); }
    finally {
      clearInterval(tick);
      /* what it said is kept if it played to its end (a replay that was stopped keeps the lines of before) */
      if (W8.said && !W8.stopped && quest.session === W8.session) { Object.keys(W8.said).forEach(k => { if (W8.said[k]) quest.said[k] = W8.said[k]; }); R.store.set('said', quest.said); }
      Object.assign(state, keep0); W8.active = false; quest.watching = null;
      if (shut) world.setNucleus(false);
      li.classList.remove('is-watching'); bar.remove(); quest.clearHots();
    }
    return quest.cur === id && (quest.session === W8.session || !!W8.stopped);   /* still in the place (played to its end, or stopped): set it up again (main.js) */
  }
  const STORY_STEPS = id => (window.STORY[id] || {}).steps || [];

  return {
    watch, arriveNames,
    /* a step that another file plays (main.js: the test's three steps), so that ↻ can play it again */
    act: (name, fn) => { ACT[name] = fn; },
    /* the way in's molecules now (wayflow.js), and the check of their numbers, for the tests (tools/ib-level.mjs H4) */
    flow: () => flow ? { kind: flow.kind, n: flow.n, up: flow.counts.up, down: flow.counts.down, arrow: !!flowArrow } : null,
    /* the mitochondria's strip, for the checks: its kind, the terms lit, the counts it shows, an arrow (Reduce motion) */
    cardsBad: () => cardsBad(),
    /* (for tools/ib-level.mjs H8: how many carriers are in the picture now: the ones that wait and the one in the ribosome) */
    /* (for tools/ib-level.mjs H9: the smooth ER's close view, its fat, its water molecules, and where the three new lipids stand after their walk) */
    /* (for tools/ib-level.mjs H10: which secondary structure the fold's switch lights, and how many amino acids of each the data marks) */
    trk: () => Object.assign({ steps: 0, used: 0 }, props.trk),
    exo: () => ({ syn: Object.assign({}, props.syn), tint: Object.assign({}, props.tint) }),
    gol: () => ({ feed: props.feed || null, sugars: props.amy && props.amy.userData.sugars ? props.amy.userData.sugars.length : 0, enz: !!props.genz, o5: Object.assign({}, props.close && props.close.userData.o5), coat: !!(props.lys && props.lys.parts.struts.visible), out: props.outVes ? +props.outVes.scale.x.toFixed(3) : 0, cloud: props.outVes ? (props.outVes.children.find(c => c.userData.kind === 'amylase-cloud') || { count: 0 }).count : 0 }),
    rer: () => ({ ss: FOLDSS.k, helix: (amylase().ss.match(/h/g) || []).length, sheet: (amylase().ss.match(/e/g) || []).length, lit: (() => { const st = props.strand; if (!st || !st.instanceColor || !FOLDSS.k) return 0; const c = new THREE.Color(SSCOL[FOLDSS.k]), a = st.instanceColor.array; let n = 0; for (let j = 0; j < amylase().n; j++) if (Math.abs(a[3 * j] - c.r) < 0.01 && Math.abs(a[3 * j + 1] - c.g) < 0.01 && Math.abs(a[3 * j + 2] - c.b) < 0.01) n++; return n; })() }),
    ser: () => ({ near: !!props.serNear, fat: !!(FAT.obj && FAT.obj.visible && FAT.on), water: waters.length, walk: props.walkEnd || null }),
    rib: () => ({ carriers: kept.filter(o => o.userData && o.userData.kind === 'amino' && o.children.length > 1).length }),
    nuc: () => { const e = document.getElementById('conc'); return { strip: e ? (e.classList.contains('conc--pair') ? 'pair' : e.classList.contains('conc--cyc') ? 'cyc' : e.classList.contains('conc--expr') ? 'expr' : 'other') : '', lit: pairLit.slice(), cyc: cycAt, expr: EXPR.off ? 'off' : 'on', arrow: !!flowArrow }; },
    mito: () => { const e = document.getElementById('conc'); return { strip: e ? (e.classList.contains('conc--eq') ? 'eq' : e.classList.contains('conc--ion') ? 'ion' : 'conc') : '', lit: [...eqLit].sort().join(''), now: e ? [...e.querySelectorAll('[data-n]')].map(b => b.textContent).join(' ') : '', arrow: !!flowArrow }; },
    flowCheck: () => flowCheck([BL.carriers.glucose.at, BL.carriers.amino.at]),
    run: (name) => Promise.resolve().then(() => ACT[name] ? ACT[name]() : quest.next()).catch(e => { if (e === STALE) return false; throw e; }),
    reset,
    /* is the camera in a close view now (main.js: the place set up again after a ↻ stays there) */
    close: () => NZ.on || NS.close,
    /* the handover now, for the checks (tools/transitions.mjs): world = how much of the organelle's own drawing shows, close = how much of the close drawing */
    dive: () => ({ on: NZ.on || NS.close ? 1 : 0, mode: LOD.mode, u: LOD.u, world: LOD.items.length ? lodK('org', LOD.u) : 1, close: LOD.items.length ? lodK('close', LOD.u) : 0,
      kinds: [...LOD.mats.values()].reduce((a, e) => { const k = e.kind + (e.shared ? 's' : ''); a[k] = (a[k] || 0) + 1; return a; }, {}) })
  };
}
