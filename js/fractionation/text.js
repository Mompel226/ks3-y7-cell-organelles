/* ============================================================
   text.js — every word of the cell fractionation lab (16 Nov 2026; on the picture since 18 Nov 2026),
   js/fractionation/view.js: its steps, the result of each choice, the names on the picture and their cards, what the
   picture simplifies, its sources.
   A step's words (memory teach-on-the-picture: at most 49 on show at any moment, and no guide line folded away):
     t     always on show: first what the step is FOR ([!]), then at most a line or two;
     ask   on show until the step's experiment is done: the rule the pupil needs to choose, and what to do (step 2,
           askUntil 'choice': until the first tube is chosen; each result then says the rule for its own tube);
     done  on show in its place once the experiment is done: what it showed;
     cards { name: line }: a guide line that says what ONE named part is lives in that name's card. A name with a card
           is a button on the picture (a ring at its left); pressed, its part stays bright and the card opens.
   RESULT: what the last choice did (one at a time). Lines beyond the guide may be folded: [x+] ("More detail").
   Each line starts with its level, as in the IB views (js/ib/text.js, js/membrane/text.js): [sl CODE] SL and HL,
   [x] beyond the IB guide. (No statement here is HL only, so there is no [hl] tag.) The codes are the IB Biology
   guide's own (first assessment 2025), read from the guide itself, each under its "SL and HL" heading:
     B2.2.1 organelles as discrete subunits (the cell wall, cytoskeleton and cytoplasm are not organelles; nuclei,
     vesicles, ribosomes and the plasma membrane are); its NOS: ultracentrifuges and cell fractionation made the study
     of organelles possible · B2.2.3 compartmentalization, lysosomes as the example · D2.3.2 hypotonic, isotonic,
     hypertonic · D2.3.3 osmosis into or out of cells, dynamic equilibrium · D2.3.7 isotonic solutions for organs ready
     for transplantation · C1.1.6 and C1.1.8 molecular motion, collisions and temperature · B1.2.5 pH and protein
     structure (denaturation).
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

/* the names on the picture: [name, what it is or does (shown under a name that has no card)] */
export const NAMES = {
  nucleus: ['nucleus', ''], mito: ['mitochondrion', ''], lyso: ['lysosome', ''], rer: ['rough ER', ''], ribo: ['ribosomes', ''],
  pm: ['plasma membrane', ''], cyto: ['cytoplasm', ''],
  m2mito: ['mitochondrion', ''], m2lyso: ['lysosome', ''], m2mem: ['membrane', 'of the organelle'],
  hypo: ['hypotonic', ''], iso: ['isotonic', ''], hyper: ['hypertonic', ''], solute: ['solute particle', ''],
  protease: ['protease', ''], m3mito: ['mitochondrion', ''], m3prot: ['a protein', 'of the mitochondrion'], m3cut: ['a digested protein', ''],
  protein: ['a protein', ''],
  pestle: ['pestle', ''], tube: ['glass tube', ''], ice: ['ice', 'keeps the medium cold'], livercell: ['liver cell', 'whole'],
  h4nuc: ['nucleus', ''], h4mito: ['mitochondrion', ''], h4lyso: ['lysosome', ''], h4micro: ['microsome', ''], h4ribo: ['ribosomes', ''],
  h4pm: ['piece of plasma membrane', ''],
  rotor: ['centrifuge', 'seen from above'], homog: ['homogenate', 'the broken cells in the medium'], super: ['supernatant', ''],
  mixed: ['pellet', 'a mixture'], pellet: ['The pellets', ''], left: ['Last liquid', ''],
  d6lyso: ['lysosome', ''], d6mito: ['mitochondrion', ''], d6enz: ['acid phosphatase', ''], sub: ['substrate', ''], prod: ['product', '']
};

export const STEPS = [
  { id: 'why', title: 'Why separate the parts of a cell?',
    t: `[!] In a cell, all the organelles work at the same time. Cell fractionation separates them, so that you can study each kind alone.
[sl B2.2.1] Organelles are discrete (separate) parts of a cell, each adapted to a specific function.
[sl B2.2.1] The cytoskeleton (protein fibres) and the cell wall are not organelles.
[x+] Here the tissue is liver. The method was developed for liver, usually from rats or mice, in the 1940s.`,
    cards: {
      nucleus: '[sl B2.2.1] The nucleus is an organelle. It contains the DNA.',
      mito: '[sl B2.2.1] A mitochondrion is an organelle. Its function is aerobic respiration.',
      lyso: '[sl B2.2.1] A lysosome is a vesicle: a small sac of membrane. Vesicles are organelles. A lysosome contains digestive enzymes.',
      rer: '[sl B2.2.1] The rough endoplasmic reticulum (rough ER) is an organelle: membranes with ribosomes on them.',
      ribo: '[sl B2.2.1] Ribosomes are organelles. They make proteins.',
      pm: '[sl B2.2.1] The plasma membrane is an organelle. It surrounds the cell.',
      cyto: '[sl B2.2.1] The cytoplasm is not an organelle.'
    } },
  { id: 'conc', title: 'Choose the medium: its concentration',
    t: `[!] Choose the medium: a solution that keeps the organelles whole while you break the cells.
[x+] In the method that de Duve followed, the medium was a solution of sucrose, for example 0.25 mol dm⁻³.`,
    ask: `[sl D2.3.2] Osmosis: the net movement of water through a membrane, to the side with the higher solute concentration.`,
    askUntil: 'choice',
    done: `[sl D2.3.7] Organs for transplantation, and fluids put into a patient's vein, need isotonic solutions too.`,
    cards: {
      hypo: '[sl D2.3.2] Pure water is hypotonic to the organelles: its solute concentration is lower than theirs.',
      iso: '[sl D2.3.2] This sucrose solution is isotonic to the organelles: its solute concentration is equal to theirs.',
      hyper: '[sl D2.3.2] This concentrated sucrose solution is hypertonic to the organelles: its solute concentration is higher than theirs.',
      solute: '[sl D2.3.2] A solute particle: a dissolved particle. Solute concentration is the number of solute particles in a set volume. Compare the two sides of the membrane.',
      m2mem: '[x] In this picture the membrane has pores. Water molecules cross it through the pores, in both directions. Solute particles cannot cross it.'
    } },
  { id: 'cold', title: 'Choose the medium: its temperature',
    t: `[!] Broken cells release proteases: enzymes that digest proteins. Choose a temperature that protects the organelles.`,
    ask: `[sl C1.1.6] A protease digests a protein only when the two collide.`,
    cards: {
      protease: '[sl C1.1.6] Movement is needed for a substrate (the molecule an enzyme acts on) and the active site of the enzyme to meet. In the picture the active site is the notch of each protease. The substrate, a protein of the organelle, stays in its membrane.'
    } },
  { id: 'ph', title: 'Choose the medium: its pH',
    t: `[!] Acids from the broken cells can change the pH of the medium. The medium must protect the shape of the proteins.`,
    done: `[x] Your medium is ready: isotonic, ice-cold and buffered.
[x+] A lysosome contains enzymes that digest proteins, fats, carbohydrates and nucleic acids. When lysosomes break, all of these enzymes are released.`,
    cards: {
      protein: '[sl B1.2.5] A protein is a chain of amino acids, folded into its own shape. A pH far from the usual pH changes this shape.'
    } },
  { id: 'homog', title: 'Homogenize: break the cells',
    t: `[!] Homogenizing breaks the cells, so that their organelles are free in the medium.`,
    ask: `[x] Small pieces of liver are in the cold medium, in a glass tube. Press Homogenize:`,
    done: `[x] The pestle tears the plasma membranes, but most organelles stay whole. The mixture is the homogenate.
[x+] This kind of homogenizer is a Potter-Elvehjem homogenizer. In the 1940s and 1950s, liver was ground with one.`,
    cards: {
      pestle: '[x] The pestle is a rod with a close-fitting end. It turns in the tube and moves up and down.',
      h4micro: '[x] The endoplasmic reticulum (ER) breaks into small closed vesicles: microsomes.'
    } },
  { id: 'spin', title: 'Spin: differential centrifugation',
    t: `[!] Spinning separates the homogenate: particles of similar size collect together in a tube, a fraction.
[x+] The shape of a particle matters too.
[x+] The forces and times here are typical values. No fraction is pure: each pellet contains some particles of other kinds.
[x+] Some books say that centrifugation separates organelles "not by size but by density". That is not true of this method, differential centrifugation: size matters most. Another method, density-gradient centrifugation, separates particles by their density.`,
    ask: `[sl B2.2.1] Larger and denser particles sink first. Size matters most. Choose the four spins in the right order:`,
    done: `[sl B2.2.1] Progress in science often follows new techniques: with ultracentrifuges (very fast centrifuges), the function of each kind of organelle could be studied.`,
    cards: {
      rotor: '[x] A centrifuge spins tubes very fast. The spinning pushes particles to the bottom of each tube with a force measured in × g (times the force of gravity).',
      super: '[x] The supernatant is the liquid above the pellet. After each spin it is poured into a new tube, for the next spin.',
      pellet: '[x] A pellet is the solid at the bottom of the tube after a spin.',
      left: '[sl B2.2.1] The liquid that remains after the last spin contains the dissolved molecules of the cytoplasm.'
    } },
  { id: 'deduve', title: 'De Duve\'s test: a new organelle',
    t: `[!] This test shows how a new organelle, the lysosome, was discovered.
[x+] Claude, de Duve and Palade shared the Nobel Prize in Physiology or Medicine in 1974 for their discoveries about the organization of the cell.
[x+] The first clue: fractions kept for some days in a refrigerator showed more acid phosphatase activity than fresh fractions.
[x+] Inside a lysosome the pH is about 4.5 to 5; in the cytosol (the fluid of the cytoplasm) it is about 7.2.
[x+] Lysosomes and mitochondria sink at similar speeds. To separate them better, de Duve divided this fraction into a heavy part and a light part.
[x+] In 1955 electron micrographs of fractions rich in lysosomes showed dense bodies, each surrounded by a membrane.`,
    ask: `[x] Measure the activity of an enzyme with the membranes whole. Break the membranes, then measure again:`,
    done: `[sl B2.2.1] So the enzyme is inside particles with a membrane. De Duve separated these particles from the mitochondria: a new organelle, named the lysosome in 1955.`,
    cards: {
      d6enz: '[x] Acid phosphatase is an enzyme that removes phosphate groups; it works best in acid conditions. Christian de Duve measured its activity in the fraction of mitochondria (pellet 2).',
      d6lyso: '[sl B2.2.3] A lysosome is a compartment: a space closed by a membrane. It keeps its digestive enzymes concentrated in one place, and apart from the rest of the cell.',
      d6mito: '[x] Pellet 2 is called the fraction of mitochondria. Lysosomes sink with the mitochondria: the two are similar in size.'
    } }
];

/* what the pupil's choices do: one line or two, tagged like the steps (view.js shows the last one in the step's box) */
export const RESULT = {
  water: { ok: false, t: '[sl D2.3.2, D2.3.3] Pure water is hypotonic: a lower solute concentration than the organelles. More water enters them than leaves: they swell and burst. Try another tube.' },
  iso: { ok: true, t: '[sl D2.3.2, D2.3.3] Isotonic: the same solute concentration as the organelles. Water enters and leaves at the same rate: a dynamic equilibrium.' },
  conc: { ok: false, t: '[sl D2.3.2, D2.3.3] This solution is hypertonic: a higher solute concentration than the organelles. More water leaves them than enters: they shrink. Try another tube.' },
  warm: { ok: false, t: '[sl C1.1.8] At 37 °C (body temperature) molecules move fast and collide often: the proteases digest many proteins. Try the other temperature.' },
  ice: { ok: true, t: '[sl C1.1.6, C1.1.8] At about 0 °C molecules move more slowly: they collide less often and with less energy. The proteases digest very few proteins.' },
  nobuf: { ok: false, t: '[sl B1.2.5] Without a buffer the pH changes. A pH far from the usual pH changes the shape of proteins: this is denaturation. Try the other choice.' },
  buf: { ok: true, t: '[sl B1.2.5] A buffer is a solution that resists changes of pH. The pH stays steady, so the proteins keep their shape.' },
  /* a spin chosen too soon: {list} = what sinks together */
  early: { ok: false, t: '[x] Too fast: {list} sink together, a mixture. Press Try again.' },
  p1: { ok: true, t: '[sl B2.2.1] Pellet 1: nuclei, the largest organelles.' },
  p2: { ok: true, t: '[sl B2.2.1] Pellet 2: mitochondria and lysosomes.' },
  p3: { ok: true, t: '[sl B2.2.1] Pellet 3: microsomes, small vesicles made mostly from the ER.' },
  p4: { ok: true, t: '[sl B2.2.1] Pellet 4: ribosomes.' },
  measureA: { ok: true, t: '[x] Low activity: the substrate (the molecule the enzyme acts on) cannot cross the membranes to reach the enzyme.' },
  breakWater: { ok: true, t: '[sl D2.3.3] Pure water has a lower solute concentration (it is hypotonic): more water enters the particles than leaves, and they burst.' },
  breakDet: { ok: true, t: '[x] A detergent dissolves membranes. De Duve\'s group used digitonin.' },
  measureB: { ok: true, t: '[x] High activity: the enzyme is free, and the substrate reaches it.' }
};

/* words on buttons and on the picture */
export const UI = {
  /* (the tubes are named by what they are: which is hypotonic, isotonic or hypertonic is what the step teaches) */
  water: ['Pure water', ''], iso: ['Sucrose solution', ''], conc: ['Concentrated sucrose solution', ''],
  tube: { water: 'pure water', iso: 'sucrose solution', conc: 'concentrated solution' }, tubeN: { water: 'water', iso: 'sucrose', conc: 'concentrated' },
  tempQ: 'Temperature', warm: ['Warm', '37 °C'], ice: ['Ice-cold', 'about 0 °C'],
  phQ: 'pH', nobuf: ['Not buffered', ''], buf: ['Buffered', ''],
  homog: 'Homogenize', again: 'Try again',
  measureA: 'Measure: membranes whole', breakQ: 'Break the membranes with', breakWater: 'pure water', breakDet: 'a detergent', measureB: 'Measure: membranes broken',
  /* step 2: the counted liquid */
  inside: 'inside the organelle', medium: 'the medium', choose: 'choose a tube', magnified: 'the membrane of the lysosome, magnified',
  waterMol: 'water molecule', waterShort: 'water', crossed: 'Water molecules through the membrane', into: 'into the organelle', out: 'out of the organelle',
  net: { water: 'net movement: into the organelle', conc: 'net movement: out of the organelle', iso: 'no net movement' },
  burst: 'burst', same: 'no change', shrunk: 'shrunk',
  /* step 3: the proteases */
  inMedium: 'in the medium, magnified', collisions: 'Collisions with the mitochondrion', digestedN: 'proteins digested', of: 'of', after: 'after', secs: 's', path: 'the path of each protease in its last seconds', bump: 'a collision', bumpHit: 'a collision that digests a protein',
  notScale: 'Not to scale', fast: 'shown in about 2 seconds', fresh: 'A: membranes whole', broken: 'B: membranes broken',
  lowHigh: 'Low and high activity only: not measured values', mediumIs: 'Medium: isotonic · ice-cold · buffered',
  low: 'low activity', high: 'high activity',
  denat: 'denatured', shape: 'keeps its shape', digested: 'many proteins digested', whole: 'very few digested', xg: '× g: times the force of gravity', acid: 'acid', alk: 'alkaline', phOf: 'pH of the medium',
  steady: 'steady', changes: 'changes',
  found: 'Names found', press: 'Press a name with a ring.', close: 'Close'
};

/* what the picture simplifies: said once, under the steps (all beyond the guide) */
export const SIMPLE = [
  'Sizes. The picture is not to scale. A nucleus is many times wider than a mitochondrion, and a ribosome is far too small to see at this scale.',
  'Time. Each spin is shown in about 2 seconds; the real times are on the buttons. Osmosis and enzyme reactions are shown in seconds too.',
  'Step 2 is a model. Its molecules move at random, and each crossing of the membrane is counted. Each run is one run of the model: another run gives other counts. On average, 10 water molecules leave the organelle in a run in every medium, and 18, 10 or 6 enter it (pure water, the sucrose solution, the concentrated solution). Very few molecules are drawn, and the model\'s solutions are far more concentrated than real ones. The two liquids may change their volume, as a real organelle does when it swells or shrinks.',
  'Step 3. Each protease moves at random. Slower and fewer only: no number here is a measured value. In the picture every collision beside a protein digests it at 37 °C, and one in three at about 0 °C; a real protease digests a protein at far fewer of its collisions.',
  'Enzyme activity in step 7 is drawn as low or high only. No measured value is shown.',
  'Purity. Each pellet is drawn with one kind of particle. Real pellets always hold some particles of other kinds.',
  'Few particles are drawn. A real homogenate contains millions of each kind of organelle.'
];

/* the sources, with what each one supports (the page ends with this list) */
export const SOURCES = [
  { c: 'Servier Medical Art. Kits: Intracellular components; Chemistry; Microbiology and cell culture; Lab apparatus. Licence: Creative Commons Attribution 4.0 (CC BY 4.0).', u: 'https://smart.servier.com/', s: 'The drawings of the animal cell, the mitochondria, the nucleus, the lysosomes, the enzymes, the test tubes, the beaker, the thermometer, the pestle, the water bath and the centrifuge. Adapted: each is cut from its kit; some are stretched, faded or shown in pieces by the lab. The liquids, the particles of the counted pictures, the ice and every name are the lab\'s own.' },
  { c: 'International Baccalaureate Organization (2023). Biology guide, first assessment 2025. B2.2.1, B2.2.3, B1.2.5, C1.1.6, C1.1.8, D2.3.2, D2.3.3, D2.3.7.', s: 'The statements and codes on the level tags, and the Nature of Science of B2.2.1 (ultracentrifuges and cell fractionation).' },
  { c: 'Alberts B, Johnson A, Lewis J, Morgan D, Raff M, Roberts K, Walter P (2015). Molecular Biology of the Cell, 6th edition. Garland Science. Figure 8-8 (cell fractionation by centrifugation) and chapter 13.', u: 'https://doi.org/10.1201/9781315735368', s: 'The four spins, typical values: 1,000 × g for 10 minutes (nuclei); 20,000 × g for 20 minutes (mitochondria, lysosomes); 80,000 × g for 1 hour (microsomes, small vesicles); 150,000 × g for 3 hours (ribosomes). The pH of a lysosome (4.5 to 5) and of the cytosol (about 7.2).' },
  { c: 'de Duve C (1975). Exploring cells with a centrifuge (Nobel lecture, 12 December 1974). Science 189: 186–194.', u: 'https://doi.org/10.1126/science.1138375', s: 'Liver ground with a Potter-Elvehjem homogenizer in sucrose (0.25 M in one scheme); spins at increasing force and time for nuclei, mitochondria, microsomes and a final supernatant; size and density set how fast particles sink; fractions are never pure; latency (the membrane keeps the substrate from the enzyme until the membrane is broken; digitonin releases acid phosphatase); the heavy and light mitochondrial fractions; lysosomes proposed in 1955 and seen as dense bodies with a membrane; density-gradient centrifugation. Also at nobelprize.org/uploads/2018/06/duve-lecture.pdf.' },
  { c: 'de Duve C, Pressman BC, Gianetto R, Wattiaux R, Appelmans F (1955). Tissue fractionation studies. 6. Intracellular distribution patterns of enzymes in rat-liver tissue. Biochemical Journal 60: 604–617.', u: 'https://doi.org/10.1042/bj0600604', s: 'The paper that proposed the lysosome.' },
  { c: 'Appelmans F, Wattiaux R, de Duve C (1955). Tissue fractionation studies. 5. The association of acid phosphatase with a special class of cytoplasmic granules in rat liver. Biochemical Journal 59: 438–445.', u: 'https://doi.org/10.1042/bj0590438', s: 'Acid phosphatase in particles of their own, separated from mitochondria by the heavy and light mitochondrial fractions.' },
  { c: 'Nobel Prize Outreach. The Nobel Prize in Physiology or Medicine 1974: Albert Claude, Christian de Duve, George E. Palade.', u: 'https://www.nobelprize.org/prizes/medicine/1974/summary/', s: 'The prize "for their discoveries concerning the structural and functional organization of the cell".' },
  { c: 'Lindau Nobel Laureate Meetings, Mediatheque. Christian de Duve: research profile.', u: 'https://mediatheque.lindau-nobel.org/laureates/de-duve/research-profile', s: 'The first clue: samples kept in a refrigerator showed more acid phosphatase activity some days later; a latent enzyme closed off from its substrate.' }
];
