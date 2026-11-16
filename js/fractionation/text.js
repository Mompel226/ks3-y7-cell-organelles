/* ============================================================
   text.js — every word of the cell fractionation lab (16 Nov 2026), js/fractionation/view.js: its steps, the result of
   each choice, the names on the picture, what the picture simplifies, its sources.
   Each step's first line ([!]) says what the step is FOR; then each line starts with its level, as in the IB views
   (js/ib/text.js, js/membrane/text.js): [sl CODE] SL and HL, [x] beyond the IB guide, [x+] beyond the guide and folded
   under "More detail". (No statement here is HL only, so there is no [hl] tag.) The codes are the IB Biology guide's own (first assessment 2025), read from the guide itself, each
   under its "SL and HL" heading:
     B2.2.1 organelles as discrete subunits; its NOS: ultracentrifuges and cell fractionation made the study of
     organelles possible · B2.2.3 compartmentalization, lysosomes as the example · D2.3.2 hypotonic, isotonic,
     hypertonic · D2.3.3 osmosis into or out of cells, dynamic equilibrium · D2.3.7 isotonic solutions for organs ready
     for transplantation · C1.1.6 and C1.1.8 molecular motion, collisions and temperature · B1.2.5 pH, temperature and
     protein structure (denaturation).
   Numbers: only the spins of Alberts et al., Fig. 8-8 (the B2.2 build's research/data_sources.md, "typical values"),
   the sucrose of de Duve's Nobel lecture, the lysosome's pH (Alberts, ch. 13). De Duve's latency is told in words only:
   no source read gives its numbers. The B2.2 build's errors.md, item 4: differential centrifugation separates mainly by
   size (density and shape count too), never "not by size but by density".
   Words (memory eal-korean-students): short sentences to "you"; a term is explained where it is first used (a pupil may
   open this view first); no idiom, no phrasal verb, never "amount", nothing about what an examination asks.
   ============================================================ */
export const LEVELS = {
  sl: { name: 'SL and HL', long: 'in the IB guide for standard level and higher level' },
  x: { name: 'Beyond the guide', long: 'not in the IB guide: the method and its history, which explain the picture' }
};

export const TITLE = 'The cell fractionation lab';
export const EYEBROW = 'IB Biology · B2.2 Organelles and compartmentalization';

/* the spins of differential centrifugation, in the order of the buttons (not the order to use) */
export const SPINS = [
  { id: 'p3', g: '80,000', time: '1 hour', min: 60 },
  { id: 'p1', g: '1,000', time: '10 minutes', min: 10 },
  { id: 'p4', g: '150,000', time: '3 hours', min: 180 },
  { id: 'p2', g: '20,000', time: '20 minutes', min: 20 }
];
/* what each spin's pellet holds, in the order of the spins (Alberts et al., Fig. 8-8) */
export const FRACTIONS = [
  { id: 'p1', name: 'nuclei', parts: ['nuc'] },
  { id: 'p2', name: 'mitochondria and lysosomes', parts: ['mito', 'lyso'] },
  { id: 'p3', name: 'microsomes', parts: ['micro'] },
  { id: 'p4', name: 'ribosomes', parts: ['ribo'] }
];
export const PART_NAMES = { nuc: 'nuclei', mito: 'mitochondria', lyso: 'lysosomes', micro: 'microsomes', ribo: 'ribosomes' };

/* the names on the picture: [name, what it is or does] */
export const NAMES = {
  nucleus: ['nucleus', 'holds the DNA'],
  mito: ['mitochondrion', 'aerobic respiration'],
  lyso: ['lysosome', 'digestive enzymes in a membrane'],
  rer: ['rough ER', 'endoplasmic reticulum: membranes with ribosomes'],
  ribo: ['ribosomes', 'make proteins'],
  pm: ['plasma membrane', 'surrounds the cell'],
  cyto: ['cytoplasm', 'not an organelle'],
  m2mito: ['mitochondrion', ''],
  m2lyso: ['lysosome', ''],
  protease: ['protease', 'an enzyme that digests proteins'],
  m3mito: ['mitochondrion', ''],
  protein: ['a protein', 'a folded chain of amino acids'],
  pestle: ['pestle', 'turns and moves up and down'],
  tube: ['glass tube', ''],
  ice: ['ice', 'keeps the medium cold'],
  livercell: ['liver cell', 'whole'],
  h4nuc: ['nucleus', ''],
  h4mito: ['mitochondrion', ''],
  h4lyso: ['lysosome', ''],
  h4micro: ['microsome', 'a small vesicle from the ER'],
  h4ribo: ['ribosomes', ''],
  h4pm: ['piece of plasma membrane', ''],
  rotor: ['centrifuge', 'seen from above'],
  homog: ['homogenate', 'the broken cells in the medium'],
  super: ['supernatant', 'the liquid above the pellet'],
  mixed: ['pellet', 'a mixture'],
  d6lyso: ['lysosome', ''],
  d6mito: ['mitochondrion', ''],
  d6enz: ['acid phosphatase', 'the enzyme']
};

export const STEPS = [
  { id: 'why', title: 'Why separate the parts of a cell?',
    t: `[!] Cell fractionation separates the parts of cells, so that you can study each part alone.
[sl B2.2.1] Organelles are discrete (separate) parts of a cell, each adapted to a specific function. Nuclei, vesicles (small sacs of membrane), ribosomes and the plasma membrane are organelles. The cytoplasm and the cytoskeleton (protein fibres) are not.
[sl B2.2.1] In a cell, all the organelles work at once. So you break many cells and collect each kind in its own tube: a fraction.
[x+] A lysosome is one kind of vesicle. The cytoskeleton is not drawn here.
[x+] Here the tissue is liver. The method was developed for liver, usually from rats or mice, in the 1940s.` },
  { id: 'conc', title: 'Choose the medium: its concentration',
    t: `[!] The medium is the solution in which you break the cells. Its concentration must keep the organelles whole.
[sl D2.3.2] Compare the solute concentration (dissolved particles in a set volume) of each solution with the inside of the organelles: hypotonic (lower), isotonic (equal) or hypertonic (higher).
[sl D2.3.3] Water moves through membranes by osmosis, to the side with the higher solute concentration. Choose a tube:`,
    done: `[sl D2.3.7] For the same reason, organs ready for transplantation are bathed in an isotonic solution.
[x+] In the method that de Duve followed, the medium was a solution of sucrose, for example 0.25 mol dm⁻³.` },
  { id: 'cold', title: 'Choose the medium: cold and buffered',
    t: `[!] When cells break, they release enzymes such as proteases (enzymes that digest proteins). The medium must protect the organelles.
[sl C1.1.6, C1.1.8] At a lower temperature, molecules move more slowly and collide less often, so enzymes work more slowly.
[sl B1.2.5] A pH far from the usual pH changes the shape of proteins: they are denatured. A buffer (a solution that resists changes of pH) keeps the pH steady. Choose:`,
    done: `[x] Your medium is ready: isotonic, ice-cold and buffered.
[x+] A lysosome holds enzymes that digest proteins, fats, carbohydrates and nucleic acids. When lysosomes break, all of these enzymes are released.` },
  { id: 'homog', title: 'Homogenize: break the cells',
    t: `[!] Homogenizing breaks the cells, so that their organelles are free in the medium.
[x] Small pieces of liver are in the cold medium, in a glass tube. A pestle (a rod with a close-fitting end) turns in the tube and moves up and down. Press Homogenize:`,
    done: `[x] The pestle tears the plasma membranes, but most organelles stay whole. The mixture is the homogenate.
[x] The endoplasmic reticulum (ER) breaks into small closed vesicles: microsomes.
[x+] This kind of homogenizer is a Potter-Elvehjem homogenizer. In the 1940s and 1950s, liver was ground with one.` },
  { id: 'spin', title: 'Spin: differential centrifugation',
    t: `[!] Spinning the homogenate separates its parts, so that each kind of organelle collects in its own tube.
[x] A centrifuge spins tubes very fast. The spinning pushes particles to the bottom of each tube with a force measured in × g (times the force of gravity).
[sl B2.2.1] Larger and denser particles sink first. Size matters most; shape matters too. Choose the four spins in the right order:`,
    done: `[sl B2.2.1] The fastest spins need an ultracentrifuge: a centrifuge that spins very fast. Progress in science often follows new techniques: with ultracentrifuges, the function of each kind of organelle could be studied.
[x+] The forces and times here are typical values. No fraction is pure: each pellet holds some particles of other kinds.
[x+] Some books say that centrifugation separates organelles "not by size but by density". That is not true of this method, differential centrifugation: size matters most. Another method, density-gradient centrifugation, separates particles by their density.` },
  { id: 'deduve', title: 'De Duve\'s test: a new organelle',
    t: `[!] This test shows how a new organelle, the lysosome, was discovered in the 1950s.
[x] Acid phosphatase is an enzyme that removes phosphate groups; it works best in acid conditions. Christian de Duve measured its activity in the fraction of mitochondria (pellet 2).
[x] Measure the activity with the membranes whole, then break the membranes and measure again:`,
    done: `[sl B2.2.1] So the enzyme is inside particles with a membrane. These particles sink with the mitochondria, but they are not mitochondria. In 1955 de Duve named them lysosomes.
[sl B2.2.3] A lysosome keeps its digestive enzymes apart from the rest of the cell, in a compartment (a space closed by a membrane).
[x] Claude, de Duve and Palade shared the Nobel Prize in Physiology or Medicine in 1974 for their discoveries about the organization of the cell.
[x+] The first clue: fractions kept for some days in a refrigerator showed more acid phosphatase activity than fresh fractions.
[x+] Inside a lysosome the pH is about 4.5 to 5; in the cytosol (the fluid of the cytoplasm) it is about 7.2.
[x+] Lysosomes and mitochondria sink at similar speeds. To separate them better, de Duve divided this fraction into a heavy part and a light part.
[x+] In 1955 electron micrographs of fractions rich in lysosomes showed dense bodies, each surrounded by a membrane.` }
];

/* what the pupil's choices do: one or two lines each, tagged like the steps (view.js shows them in the step's box) */
export const RESULT = {
  water: { ok: false, t: '[sl D2.3.3] Pure water is hypotonic. Water enters the organelles by osmosis: they swell, their membranes burst and their enzymes escape. Try another tube.' },
  iso: { ok: true, t: '[sl D2.3.3] Isotonic: water enters and leaves the organelles at the same rate (a dynamic equilibrium). They keep their size and shape. Use this medium.' },
  conc: { ok: false, t: '[sl D2.3.3] This solution is hypertonic. Water leaves the organelles by osmosis: they shrink and change shape. Try another tube.' },
  warm: { ok: false, t: '[sl C1.1.8] At 37 °C (body temperature) the proteases work fast: they digest the proteins of the organelles. Try the other temperature.' },
  ice: { ok: true, t: '[sl C1.1.8] Ice-cold (about 0 °C): the proteases still work, but much more slowly, so the organelles stay whole.' },
  nobuf: { ok: false, t: '[sl B1.2.5] Without a buffer, acids from the broken cells change the pH, and the proteins are denatured. Try the other choice.' },
  buf: { ok: true, t: '[sl B1.2.5] The buffer keeps the pH steady, so the proteins keep their shape.' },
  /* a spin chosen too soon: {list} = what sinks together */
  early: { ok: false, t: '[x] Too fast for now: at {g} × g, {list} all sink together, so this pellet is a mixture. Spin at a lower force first, so that only the largest particles sink. Press Try again.' },
  p1: { ok: true, t: '[sl B2.2.1] Pellet 1: nuclei, the largest organelles. The pellet is the solid at the bottom of the tube. The supernatant (the liquid above the pellet) is poured into a new tube.' },
  p2: { ok: true, t: '[sl B2.2.1] Pellet 2: mitochondria and lysosomes (in plant cells, chloroplasts too). The supernatant is poured into a new tube.' },
  p3: { ok: true, t: '[sl B2.2.1] Pellet 3: microsomes, small vesicles made mostly from the ER. The supernatant is poured into a new tube.' },
  p4: { ok: true, t: '[sl B2.2.1] Pellet 4: ribosomes. The liquid left at the end holds the dissolved molecules of the cytoplasm.' },
  measureA: { ok: true, t: '[x] Low activity: the substrate (the molecule the enzyme acts on) cannot cross the membranes, so it does not reach most of the enzyme.' },
  breakWater: { ok: true, t: '[sl D2.3.3] Pure water is hypotonic: water enters the particles by osmosis, and they swell and burst.' },
  breakDet: { ok: true, t: '[x] A detergent dissolves membranes. De Duve\'s group used digitonin.' },
  measureB: { ok: true, t: '[x] High activity: the enzyme is free in the solution, and the substrate reaches it.' }
};

/* words on buttons and on the picture */
export const UI = {
  water: ['Pure water', 'hypotonic'], iso: ['Isotonic solution', ''], conc: ['Concentrated solution', 'hypertonic'],
  tempQ: 'Temperature', warm: ['Warm', '37 °C'], ice: ['Ice-cold', 'about 0 °C'],
  phQ: 'pH', nobuf: ['Not buffered', ''], buf: ['Buffered', ''],
  homog: 'Homogenize', again: 'Try again',
  measureA: 'Measure: membranes whole', breakQ: 'Break the membranes with', breakWater: 'pure water', breakDet: 'a detergent', measureB: 'Measure: membranes broken',
  medium: 'medium', inside: 'organelle', solute: 'a solute particle', waterMove: 'net movement of water', pair: 'each pair of squares, the same volume: the medium (left), inside the organelle (right)',
  burst: 'burst', same: 'no change', shrunk: 'shrunk',
  notScale: 'Not to scale', fast: 'shown in about 2 seconds', fresh: 'A: membranes whole', broken: 'B: membranes broken',
  lowHigh: 'Low and high activity only: not measured values', mediumIs: 'Medium: isotonic · ice-cold · buffered',
  denat: 'denatured', shape: 'keeps its shape', digested: 'digested', whole: 'whole', acid: 'acid', alk: 'alkaline', phOf: 'pH of the medium',
  steady: 'steady', changes: 'changes'
};

/* what the picture simplifies: said once, under the steps (all beyond the guide) */
export const SIMPLE = [
  'Sizes. The picture is not to scale. A nucleus is many times wider than a mitochondrion, and a ribosome is far too small to see at this scale.',
  'Time. Each spin is shown in about 2 seconds; the real times are on the buttons. Enzyme reactions are shown in seconds too.',
  'Concentrations are drawn as particles in squares of the same volume. They show lower, equal and higher only: not measured values.',
  'Enzyme activity is drawn as low or high only. No measured value is shown.',
  'Purity. Each pellet is drawn with one kind of particle. Real pellets always hold some particles of other kinds.',
  'Few particles are drawn. A real homogenate holds millions of each kind of organelle.'
];

/* the sources, with what each one supports (the page ends with this list) */
export const SOURCES = [
  { c: 'International Baccalaureate Organization (2023). Biology guide, first assessment 2025. B2.2.1, B2.2.3, B1.2.5, C1.1.6, C1.1.8, D2.3.2, D2.3.3, D2.3.7.', s: 'The statements and codes on the level tags, and the Nature of Science of B2.2.1 (ultracentrifuges and cell fractionation).' },
  { c: 'Alberts B, Johnson A, Lewis J, Morgan D, Raff M, Roberts K, Walter P (2015). Molecular Biology of the Cell, 6th edition. Garland Science. Figure 8-8 (cell fractionation by centrifugation) and chapter 13.', u: 'https://doi.org/10.1201/9781315735368', s: 'The four spins, typical values: 1,000 × g for 10 minutes (nuclei); 20,000 × g for 20 minutes (mitochondria, lysosomes, chloroplasts); 80,000 × g for 1 hour (microsomes, small vesicles); 150,000 × g for 3 hours (ribosomes). The pH of a lysosome (4.5 to 5) and of the cytosol (about 7.2).' },
  { c: 'de Duve C (1975). Exploring cells with a centrifuge (Nobel lecture, 12 December 1974). Science 189: 186–194.', u: 'https://doi.org/10.1126/science.1138375', s: 'Liver ground with a Potter-Elvehjem homogenizer in sucrose (0.25 M in one scheme); spins at increasing force and time for nuclei, mitochondria, microsomes and a final supernatant; size and density set how fast particles sink; fractions are never pure; latency (the membrane keeps the substrate from the enzyme until the membrane is broken; digitonin releases acid phosphatase); the heavy and light mitochondrial fractions; lysosomes proposed in 1955 and seen as dense bodies with a membrane; density-gradient centrifugation. Also at nobelprize.org/uploads/2018/06/duve-lecture.pdf.' },
  { c: 'de Duve C, Pressman BC, Gianetto R, Wattiaux R, Appelmans F (1955). Tissue fractionation studies. 6. Intracellular distribution patterns of enzymes in rat-liver tissue. Biochemical Journal 60: 604–617.', u: 'https://doi.org/10.1042/bj0600604', s: 'The paper that proposed the lysosome.' },
  { c: 'Appelmans F, Wattiaux R, de Duve C (1955). Tissue fractionation studies. 5. The association of acid phosphatase with a special class of cytoplasmic granules in rat liver. Biochemical Journal 59: 438–445.', u: 'https://doi.org/10.1042/bj0590438', s: 'Acid phosphatase in particles of their own, separated from mitochondria by the heavy and light mitochondrial fractions.' },
  { c: 'Nobel Prize Outreach. The Nobel Prize in Physiology or Medicine 1974: Albert Claude, Christian de Duve, George E. Palade.', u: 'https://www.nobelprize.org/prizes/medicine/1974/summary/', s: 'The prize "for their discoveries concerning the structural and functional organization of the cell".' },
  { c: 'Lindau Nobel Laureate Meetings, Mediatheque. Christian de Duve: research profile.', u: 'https://mediatheque.lindau-nobel.org/laureates/de-duve/research-profile', s: 'The first clue: samples kept in a refrigerator showed more acid phosphatase activity some days later; a latent enzyme closed off from its substrate.' }
];
