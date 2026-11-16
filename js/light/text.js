/* ============================================================
   text.js — every word of the IB view "From light to glucose" (16 Nov 2026), the photosynthesis sibling of "From glucose
   to ATP" (js/ib/text.js, whose house style it follows): its steps, the names on its pictures, the words of its three
   diagrams of boxes, what the pictures simplify, and its sources.
   What it teaches: IB Biology topic C1.3 Photosynthesis (first assessment 2025), every statement that fits a view inside
   a chloroplast, read from the guide itself: C1.3.1–C1.3.8 SL and HL; C1.3.9–C1.3.19 HL only (Additional higher level);
   B2.2.5, the adaptations of the chloroplast (HL only); A2.2.11, a chloroplast drawn and annotated (SL and HL). C1.3.4
   (chromatography), C1.3.6 and C1.3.7 are skills of the pupils' own practical work: the view says the method and the
   rule only (how Rf is worked out, how each factor is varied), never a result, a data table or a hypothesis.
   Each paragraph starts with its level, as in js/ib/text.js: [!] the step's first line, what the step is FOR (no tag);
   [sl CODE] SL and HL, [hl CODE] HL only, [x] beyond the guide; [x+] beyond the guide and folded under "More detail"
   (a folded line may carry a guide tag of its own: [x+] [hl C1.3.11] …). CODE: the guide's own numbers, or a range
   (C1.3.15–17).
   Words (Daniel's rules; memories eal-korean-students, exam-wording-not-everyday-english, write-to-the-student-reader):
   short sentences to "you", present tense, British spelling; a term is explained the first time this view uses it (a
   pupil may open this view first); no idiom, no phrasal verb, never "amount", nothing about what an examination asks;
   the guide's own terms ("NADP and reduced NADP", always paired; triose phosphate; glycerate 3-phosphate; Rubisco).
   Numbers: only those of the sources below (the guide's five-sixths; OpenStax's 9 ATP and 6 reduced NADP for three
   turns of the cycle; 2 H₂O → 4 H⁺ + 4 e⁻ + O₂), and the arithmetic from them, shown.
   ============================================================ */
export const LEVELS = {
  sl: { name: 'SL and HL', long: 'in the IB guide for standard level and higher level' },
  hl: { name: 'HL only', long: 'in the IB guide for higher level only (additional higher level)' },
  x: { name: 'Beyond the guide', long: 'not in the IB guide: true, and it helps the step make sense' }
};

export const TITLE = 'From light to glucose';
export const EYEBROW = 'IB Biology · C1.3 Photosynthesis';
export const BY = 'Made by Dr Daniel Mompel Riera';

/* the names on the pictures (a name in violet is beyond the guide: view.js reads `ext` from the scene) */
export const NAMES = {
  /* step 1 */
  palisade: 'palisade cell', chls: 'chloroplasts', chl: 'one chloroplast', light: 'light', co2: 'carbon dioxide', water: 'water', glucose: 'glucose', oxygen: 'oxygen',
  /* step 2 */
  envelope: 'two membranes', thylakoid: 'thylakoid', granum: 'granum', stroma: 'stroma', lumen: 'lumen', photosystems: 'photosystems', enzymes: 'enzymes of the Calvin cycle',
  /* step 3 */
  white: 'white light', chlorophyll: 'chlorophyll (a pigment)', absorbed: 'red and blue light:\nabsorbed', reflected: 'green light: reflected',
  excited: 'excited electron', high: 'higher energy level', low: 'lower energy level',
  /* steps 4 and 5 */
  chla: 'chlorophyll a', chlb: 'chlorophyll b', carot: 'carotenoids', action: 'action spectrum',
  /* step 6 */
  hydrogen: 'hydrogen', thylakoids: 'thylakoids', ld: 'light-dependent reactions', li: 'light-independent reactions (Calvin cycle)',
  /* step 7 */
  lamp: 'lamp', distance: 'distance', bath: 'water bath', thermo: 'thermometer', bicarb: 'sodium hydrogencarbonate solution', plant: 'water plant', bubbles: 'oxygen bubbles',
  face: 'FACE: pipes release carbon dioxide', greenhouse: 'closed greenhouse',
  /* step 8 */
  protein: 'proteins', pigchl: 'chlorophyll', accessory: 'accessory pigment (carotenoid)', rc: 'reaction centre',
  /* steps 9 to 13 */
  psII: 'photosystem II', psI: 'photosystem I', b6f: 'cytochrome b6f', carrier: 'electron carrier', protons: 'protons (H⁺)', pumped: 'protons pumped',
  synthase: 'ATP synthase', adp: 'ADP + phosphate', atp: 'ATP', nadp: 'NADP', rnadp: 'reduced NADP', hstroma: 'proton (H⁺) from the stroma', electrons: 'excited electrons',
  wherePl: 'photolysis of water', whereAtp: 'ATP synthesis', whereNadp: 'reduction of NADP', cyclic: 'cyclic route',
  /* steps 14 to 16 */
  rubp: 'RuBP', rubisco: 'Rubisco', gp: 'GP (glycerate\n3-phosphate)', tp: 'triose phosphate', tpOut: 'triose phosphate\nleaving the cycle', rubpNew: 'new RuBP'
};
/* the spaces, named on the picture itself (no line); `n`: the shorter name on a phone */
export const PLACES = { stroma: 'stroma', membrane: 'thylakoid\nmembrane', membraneN: 'membrane', lumen: 'lumen', calvin: 'Calvin cycle\n(in the stroma)' };
/* keys on the pictures (words beside a sample, never a name with a line) */
export const KEYS = {
  carbon: 'carbon atom', sugarC: 'carbon atom of a sugar', phosphate: 'phosphate group', electron: 'electron', proton: 'proton (H⁺)',
  water: 'water (H₂O)', oxygen: 'oxygen (O₂)', chla: 'chlorophyll a', chlb: 'chlorophyll b', carot: 'carotenoid', special: 'special chlorophyll',
  equal: 'Two equal volumes', equalN: 'Equal volumes', eqStroma: 'stroma', eqLumen: 'lumen'
};
/* the words on the axes of the spectra, and the symbols inside shapes. colours: [name, the middle of its range in nm
   (Wikipedia, Visible spectrum), true if it is left out on a phone, where the names would touch] */
export const AXIS = {
  x: 'wavelength of light / nm', yAbs: 'light absorbed', yAct: 'light absorbed, or rate',
  colours: [['violet', 415], ['blue', 468], ['green', 532], ['yellow', 578], ['orange', 608, true], ['red', 662]],
  mg: 'Mg', two: 'II', one: 'I'
};

/* the steps. scene: the picture (js/light/scenes.js); cap: a line over the picture; note: what the picture is */
export const STEPS = [
  { title: 'Light energy becomes chemical energy', scene: 'cell', note: 'Not to scale',
    t: `[!] This view follows light energy into the chemical energy of glucose. You are in a palisade cell of a leaf, full of chloroplasts (the organelles of photosynthesis).
[sl C1.3.1] In photosynthesis, light energy is transformed to chemical energy when carbon compounds are produced. This supplies most of the chemical energy for life in ecosystems.
[sl C1.3.2] The word equation: carbon dioxide + water → glucose + oxygen.
[x+] Palisade cells are the cells just under the upper surface of a leaf, where the light is brightest.` },
  { title: 'Inside a chloroplast', scene: 'chloro', note: 'Not to scale',
    t: `[!] Each stage of photosynthesis has its own place in the chloroplast.
[sl A2.2.11] Two membranes surround the chloroplast. Inside are thylakoids: flat sacs of membrane, in stacks called grana (one stack: a granum). The fluid round them is the stroma.
[hl B2.2.5] Adaptations: a large surface area of thylakoid membrane, with many photosystems (groups of pigments: molecules that absorb light); a small volume of fluid, the lumen, inside each thylakoid; the enzymes and substrates of the Calvin cycle (reactions that make sugar) together in the stroma.
[x+] Single sheets of thylakoid membrane join one granum to the next.` },
  { title: 'Pigments absorb light', scene: 'pigment', note: 'Not to scale',
    t: `[!] Light energy enters photosynthesis only when a pigment absorbs the light.
[sl C1.3.5] Light travels as waves; each colour has its own wavelength (the length of one wave). Chlorophyll, the main pigment, absorbs mostly red and blue light and reflects green light, so leaves look green.
[sl C1.3.5] The light excites an electron in chlorophyll: the electron rises to a higher energy level. Light energy is now chemical energy.
[sl C1.3.5] Only some wavelengths are absorbed: the energy of the light must match a jump between two energy levels.` },
  { title: 'The absorption spectrum', scene: 'spectra', phase: 'abs', note: 'Shapes drawn by hand, not measured values',
    t: `[!] A graph shows which wavelengths each pigment absorbs: its absorption spectrum.
[sl C1.3.5] Horizontal axis: the wavelength and the colour of the light. Vertical axis: how strongly the light is absorbed.
[sl C1.3.5] Chlorophyll a and chlorophyll b absorb violet, blue and red light strongly, and green light weakly. Carotenoids, other pigments, absorb violet and blue light.
[sl C1.3.4] Chromatography separates the pigments of a leaf. Each is identified by its colour and its Rf value (distance moved by the pigment ÷ distance moved by the solvent).
[x+] These curves are drawn by hand. They show in which colours each pigment absorbs most, not measured values.` },
  { title: 'The action spectrum', scene: 'spectra', phase: 'act', note: 'Shapes drawn by hand, not measured values',
    t: `[!] Which wavelengths drive photosynthesis fastest? The action spectrum shows this.
[sl C1.3.6] An action spectrum shows the rate of photosynthesis at each wavelength. The rate is measured as oxygen produced or carbon dioxide used.
[sl C1.3.6] Similar: both kinds of spectrum are high in blue and red light, and low in green light.
[sl C1.3.6] Different: an absorption spectrum shows the light that pigments absorb; an action spectrum shows how fast photosynthesis goes. In green light the rate is not zero.
[x+] The first action spectrum: Engelmann shone light, split into its colours by a prism, onto a strand of the alga <i>Cladophora</i>, in water with bacteria that need oxygen. The bacteria gathered in the blue and the red light.
[x+] Absorption spectra are usually measured with the pigments in a solvent. In a leaf, proteins hold the pigments, and this changes their spectra a little.` },
  { title: 'Oxygen comes from water', scene: 'overview', note: 'Not to scale',
    t: `[!] Follow water and carbon dioxide through the chloroplast.
[sl C1.3.2] Light energy is used to split water. The hydrogen from the water is used to convert carbon dioxide to glucose.
[sl C1.3.3] The oxygen released comes from the water. Oxygen is a by-product (made as well as the main product, glucose), in plants, algae and cyanobacteria (bacteria that photosynthesise).
[hl C1.3.14, C1.3.19] Water is split on the thylakoids: the light-dependent reactions. Carbon dioxide is converted in the stroma: the light-independent reactions (the Calvin cycle).` },
  { title: 'Limiting factors', scene: 'limits', note: 'One way to vary each factor. Not to scale',
    t: `[!] Three factors limit how fast photosynthesis goes.
[sl C1.3.7] Light intensity, carbon dioxide concentration and temperature each affect the rate. The factor furthest from its best value is the limiting factor.
[sl C1.3.7] Techniques: the distance of a lamp (light intensity), sodium hydrogencarbonate solutions (carbon dioxide), a water bath (temperature). The rate: the oxygen that a water plant releases.
[sl C1.3.8] Carbon dioxide enrichment experiments, in closed greenhouses or in open fields (FACE: free-air carbon dioxide enrichment), help predict future rates of photosynthesis and plant growth.
[x+] In FACE, pipes in a ring, 1 to 30 m across, release carbon dioxide round the plants. Sensors tell a computer how much carbon dioxide to release. Rings with no extra carbon dioxide are the controls.
[x+] Variables are easier to control in a laboratory than in a field.` },
  { title: 'Photosystems', scene: 'psys', note: 'Seen from above, looking down on the membrane. Not to scale',
    t: `[!] Pigments work in groups: photosystems.
[hl C1.3.9] A photosystem is an array (an ordered group) of chlorophyll and accessory pigments (such as carotenoids), held by proteins in a membrane of a chloroplast or a cyanobacterium. Its reaction centre is a special chlorophyll.
[hl C1.3.9] Light energy passes from pigment to pigment to the reaction centre, which emits an excited electron.
[hl C1.3.10] One pigment molecule alone could not do any part of this. Many pigments of several types absorb more light, of more wavelengths, for each reaction centre.` },
  { title: 'Photosystem II splits water', scene: 'thyl', phase: 'psII', note: 'A section of a thylakoid. Not to scale', cap: 'Photolysis: 2 H₂O → O₂ + 4 H⁺ + 4 e⁻',
    t: `[!] Photosystem II loses an excited electron. Water gives photosystem II a replacement electron.
[hl C1.3.11] Light excites photosystem II, which emits an excited electron. Then photosystem II splits water: photolysis (splitting by light).
[hl C1.3.11] Two water molecules give four electrons, four protons (hydrogen ions, H⁺) and one oxygen molecule.
[hl C1.3.11] The electrons and the protons are used in photosynthesis. Oxygen is a waste product: it diffuses out of the chloroplast.
[x+] [hl C1.3.11] Oxygen from photolysis changed the Earth. Once cyanobacteria released it, oxygen gradually accumulated in the oceans and the air, with immense consequences for living organisms and for geological processes (the rocks).` },
  { title: 'Electrons pump protons', scene: 'thyl', phase: 'chain', note: 'A section of a thylakoid. Not to scale',
    t: `[!] The energy of the excited electron is used to pump protons into the lumen.
[hl C1.3.12] The electron passes along a chain of electron carriers (molecules that accept an electron and transfer it) to photosystem I. With energy from the electron, the chain pumps protons from the stroma into the lumen.
[hl C1.3.12, B2.2.5] The lumen has a small volume, so its proton concentration rises fast: a steep proton gradient (a difference in concentration) forms across the membrane.
[x+] The large complex of the chain, cytochrome b6f, pumps the protons. Two small carriers move between it and the photosystems: one in the membrane, one in the lumen.
[x+] Photolysis also releases protons into the lumen (step 9).` },
  { title: 'ATP synthase makes ATP', scene: 'thyl', phase: 'atp', note: 'A section of a thylakoid. Not to scale', cap: 'ADP + phosphate → ATP',
    t: `[!] The proton gradient stores energy. ATP synthase uses this energy to make ATP (adenosine triphosphate), the molecule that carries energy in cells.
[hl C1.3.12] Protons diffuse from the lumen back into the stroma, down their concentration gradient, through ATP synthase, an enzyme in the membrane. Their flow turns part of the enzyme, which joins ADP (adenosine diphosphate) and phosphate to make ATP.
[hl C1.3.12] Making ATP with the energy of a proton gradient is chemiosmosis.
[x+] The part of ATP synthase that makes ATP faces the stroma, so the ATP is released into the stroma, where the Calvin cycle uses it.` },
  { title: 'Photosystem I reduces NADP', scene: 'thyl', phase: 'psI', note: 'A section of a thylakoid. Not to scale', cap: 'NADP + 2 e⁻ + H⁺ → reduced NADP',
    t: `[!] Photosystem I makes the second product of the thylakoid: a carrier of hydrogen for the Calvin cycle.
[hl C1.3.13] Light excites photosystem I, which emits excited electrons. On its stroma side, NADP (a molecule that carries hydrogen) accepts two electrons from photosystem I and one proton (H⁺) from the stroma.
[hl C1.3.13] Gaining electrons is reduction: NADP becomes reduced NADP.
[hl C1.3.13] Electrons from the chain replace the electrons that photosystem I lost.
[x+] On their way to NADP the electrons pass through a small protein (ferredoxin), and an enzyme (NADP reductase) catalyses the reduction. Neither is drawn.` },
  { title: 'One thylakoid, one system', scene: 'thyl', phase: 'all', note: 'A section of a thylakoid. Not to scale',
    t: `[!] Here every part works together, in one thylakoid.
[hl C1.3.14] Photolysis of water: at photosystem II, on the lumen side. ATP synthesis: at ATP synthase, on the stroma side. Reduction of NADP: at photosystem I, on the stroma side.
[hl C1.3.12] This is non-cyclic photophosphorylation (making ATP with light energy): its electrons come from photosystem II. In cyclic photophosphorylation, electrons from photosystem I return to the chain (the dashed arrow): ATP is made, but no NADP is reduced.` },
  { title: 'Rubisco fixes carbon dioxide', scene: 'calvin', phase: 'fix', note: 'Three turns of the cycle at once. Not to scale', cap: '3 RuBP + 3 CO₂ → 6 GP',
    t: `[!] Carbon dioxide now becomes part of a sugar, in the stroma: the Calvin cycle starts.
[hl C1.3.15] To fix carbon is to join carbon dioxide to an organic compound. Rubisco, an enzyme, joins carbon dioxide to RuBP (ribulose bisphosphate, 5 carbon atoms): two GP (glycerate 3-phosphate, 3 carbon atoms) form.
[hl C1.3.15] Rubisco is the most abundant enzyme on Earth. It works slowly and is not effective in low carbon dioxide concentrations, so the stroma needs a high concentration of Rubisco.
[x+] The picture shows three turns of the cycle at once: three carbon dioxide molecules, three RuBP.` },
  { title: 'GP becomes triose phosphate', scene: 'calvin', phase: 'reduce', note: 'Three turns of the cycle at once. Not to scale', cap: '6 GP + 6 ATP + 6 reduced NADP → 6 triose phosphate',
    t: `[!] Energy and hydrogen from the thylakoid convert GP to a sugar.
[hl C1.3.16] GP is converted to triose phosphate (a sugar with 3 carbon atoms and a phosphate group), using ATP and reduced NADP. GP is reduced: it gains hydrogen from reduced NADP.
[hl C1.3.19] ADP, phosphate and NADP return to the thylakoid, to be used again.
[x+] For three carbon dioxide molecules, this uses 6 ATP and 6 reduced NADP.` },
  { title: 'RuBP is regenerated', scene: 'calvin', phase: 'regen', note: 'Three turns of the cycle at once. Not to scale', cap: '5 triose phosphate + 3 ATP → 3 RuBP',
    t: `[!] The cycle must make new RuBP, or the fixation of carbon dioxide would stop.
[hl C1.3.17] Five triose phosphates (5 × 3 = 15 carbon atoms) are converted to three RuBP (3 × 5 = 15 carbon atoms), using ATP. So the Calvin cycle continues.
[hl C1.3.17] One triose phosphate in six leaves the cycle. One glucose (6 carbon atoms) needs two, so five-sixths of all the triose phosphate made is converted back to RuBP.
[x+] For three carbon dioxide molecules, this uses 3 more ATP: in all, 9 ATP and 6 reduced NADP for every three turns of the cycle.` },
  { title: 'What triose phosphate makes', scene: 'products', note: '',
    t: `[!] All the carbon in the compounds of a plant was fixed in the Calvin cycle.
[hl C1.3.18] Two triose phosphates make one glucose. From glucose, the plant makes sucrose, starch and cellulose.
[hl C1.3.18] Other carbon compounds are made by pathways that start at an intermediate of the cycle (a compound made on the way). Mineral nutrients from the soil are needed too: for example, amino acids need nitrogen, from nitrate ions.` },
  { title: 'The two stages need each other', scene: 'inter', note: '', ctl: 'inter',
    t: `[!] Neither stage can continue for long without the other. Compare with the buttons below.
[hl C1.3.19] The light-dependent reactions supply ATP and reduced NADP to the Calvin cycle. The Calvin cycle returns ADP, phosphate and NADP.
[hl C1.3.19] No light: no ATP and no reduced NADP are made, so the Calvin cycle stops.
[hl C1.3.19] No carbon dioxide: the Calvin cycle stops, so no NADP returns. Photosystem I has no NADP to accept its electrons, the electron carriers stay full, and photosystem II cannot function.` },
  { title: 'The tally for one glucose', scene: 'tally', note: '',
    t: `[!] The whole journey, counted for one glucose molecule.
[sl C1.3.2] carbon dioxide + water → glucose + oxygen
[hl C1.3.15–17] Six turns of the Calvin cycle fix 6 carbon dioxide and make 12 triose phosphates: 10 regenerate RuBP, 2 make one glucose. They use 18 ATP and 12 reduced NADP.
[hl C1.3.11, C1.3.13] Reducing 12 NADP takes 24 electrons: the photolysis of 12 water molecules, which releases 6 oxygen molecules.` }
];

/* the three diagrams of boxes (scenes.js products, inter, tally) */
export const BOXES = {
  products: {
    aria: 'Triose phosphate from the Calvin cycle makes glucose, then sucrose, starch and cellulose; with nitrogen from nitrate ions it makes amino acids; it also makes other carbon compounds.',
    tp: 'triose phosphate', tpS: 'from the Calvin cycle',
    rows: [
      { t: 'glucose', s: '2 triose phosphates', to: ['sucrose', 'starch', 'cellulose'], lv: 'hl' },
      { t: 'amino acids', s: 'with nitrogen from nitrate ions (a mineral nutrient)', to: ['proteins'], lv: 'hl', x: [1] },
      { t: 'other carbon compounds', s: 'pathways that start at an intermediate of the cycle', to: ['for example: fatty acids'], lv: 'hl', x: [0] }
    ],
    xnote: 'A name in violet italics is beyond the guide.'
  },
  inter: {
    states: { both: 'Both stages working', light: 'No light', co2: 'No carbon dioxide' },
    ld: 'Light-dependent reactions', ldWhere: 'thylakoids', li: 'Calvin cycle', liWhere: 'stroma (light-independent reactions)',
    go: 'ATP and reduced NADP', back: 'ADP, phosphate and NADP',
    inLd: 'light, water', outLd: 'oxygen', inLi: 'carbon dioxide', outLi: 'triose phosphate',
    stop: 'stopped',
    say: {
      both: 'Each stage makes what the other needs.',
      light: 'No light: the thylakoids make no ATP and no reduced NADP. The Calvin cycle stops too.',
      co2: 'No carbon dioxide: the Calvin cycle stops, so no NADP returns. Photosystem I has no NADP to accept its electrons, and photosystem II cannot function.'
    }
  },
  tally: {
    head: ['For one glucose molecule', 'How many', 'Working'],
    rows: [
      ['carbon dioxide fixed', '6', 'glucose has 6 carbon atoms'],
      ['turns of the Calvin cycle', '6', 'one carbon dioxide fixed in each turn'],
      ['triose phosphate made', '12', '6 carbon dioxide + 6 RuBP → 12 GP → 12 triose phosphate'],
      ['  of which: regenerate RuBP', '10', 'five-sixths of 12: 10 × 3 = 30 carbon atoms = 6 RuBP × 5'],
      ['  of which: make glucose', '2', '2 × 3 = 6 carbon atoms'],
      ['ATP used', '18', '9 for every 3 turns: 12 to make triose phosphate, 6 to regenerate RuBP'],
      ['reduced NADP used', '12', '6 for every 3 turns'],
      ['water split (photolysis)', '12', 'each reduced NADP takes 2 electrons: 12 × 2 = 24; each water gives 2'],
      ['oxygen released', '6', '2 water → 1 oxygen molecule']
    ],
    eq: 'carbon dioxide + water → glucose + oxygen'
  }
};

/* what the pictures simplify: said once, under the steps (all beyond the guide) */
export const SIMPLE = [
  'Size. No picture is to scale: the molecules are drawn far larger than they are, beside the chloroplast and its membranes.',
  'The spectra. The curves are drawn by hand: each pigment absorbs most in the right colours, but the heights and the exact wavelengths of the peaks are not measured values.',
  'Where the complexes are. In a real thylakoid, photosystem II is mostly in the grana, and photosystem I and ATP synthase are mostly in the single sheets of membrane between grana and in the outer layers of grana. The section shows all four in one row.',
  'Protons. The lumen holds more protons than the stroma, in equal volumes, but not the numbers drawn: the real numbers are not shown.',
  'One at a time. Electrons and molecules are shown one or two at a time. In a chloroplast, very many photosystems and enzymes work at once, all the time.',
  'The Calvin cycle. Only the compounds named in the guide are drawn; the reactions between triose phosphate and RuBP are not.',
  'A photosystem has more pigment molecules than are drawn, held in three dimensions.',
  'Not drawn: the chloroplast\'s own DNA and ribosomes, its starch grains, water molecules in the stroma and the lumen.'
];

/* the sources, with what each one supports (the page ends with this list) */
export const SOURCES = [
  { c: 'International Baccalaureate Organization (2023). Biology guide, first assessment 2025. Topic C1.3 Photosynthesis; B2.2.5; A2.2.11.', s: 'The statements and codes on the level tags; Rubisco the most abundant enzyme; five triose phosphates to three RuBP, five-sixths; NADP accepts two electrons from photosystem I and a proton from the stroma; rates for an action spectrum from oxygen produced and carbon dioxide used.' },
  { c: 'Clark MA, Douglas M, Choi J (2018). Biology 2e, section 8.2: The light-dependent reactions of photosynthesis. OpenStax, Rice University.', u: 'https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis', s: 'Chlorophyll a absorbs blue and red, not green; carotenoids absorb blue; a photosystem: a light-harvesting complex and a reaction centre with a special pair of chlorophyll a; energy passes from chlorophyll to chlorophyll; the chain pumps protons into the lumen; ATP synthase.' },
  { c: 'Clark MA, Douglas M, Choi J (2018). Biology 2e, section 8.3: Using light energy to make organic molecules. OpenStax, Rice University.', u: 'https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules', s: 'Fixation, reduction, regeneration; per three carbon dioxide: 6 ATP and 6 NADPH in reduction, 3 more ATP in regeneration; one of six G3P leaves the cycle; ADP and NADP+ return to the light-dependent reactions.' },
  { c: 'Wikipedia (accessed 16 November 2026). Light-dependent reactions.', u: 'https://en.wikipedia.org/wiki/Light-dependent_reactions', s: 'The cytochrome b6f complex between photosystem II and photosystem I pumps protons from the stroma into the lumen; the order of the carriers; 2 H₂O → 4 H⁺ + 4 e⁻ + O₂; NADP reductase in the stroma; cyclic photophosphorylation.' },
  { c: 'Wikipedia (accessed 16 November 2026). Thylakoid.', u: 'https://en.wikipedia.org/wiki/Thylakoid', s: 'Grana (stacks of thylakoids) and the stroma thylakoids that join them; photosystem II mostly in the grana, photosystem I and ATP synthase mostly in the stroma thylakoids and the outer layers of grana.' },
  { c: 'Wikipedia (accessed 16 November 2026). Action spectrum.', u: 'https://en.wikipedia.org/wiki/Action_spectrum', s: 'An action spectrum: the rate of a biological effect against the wavelength of light; Engelmann\'s experiment with Cladophora and aerobic bacteria; pigments in proteins change the spectra a little.' },
  { c: 'Wikipedia (accessed 16 November 2026). Retardation factor.', u: 'https://en.wikipedia.org/wiki/Retardation_factor', s: 'Rf: the distance moved by a substance ÷ the distance moved by the solvent front.' },
  { c: 'Wikipedia (accessed 16 November 2026). Free-air concentration enrichment.', u: 'https://en.wikipedia.org/wiki/Free-air_concentration_enrichment', s: 'FACE: pipes in a circle 1 to 30 m across release carbon dioxide; sensors and a computer adjust the flow; control plots at the normal concentration.' },
  { c: 'NASA Science (accessed 16 November 2026). Visible light.', u: 'https://science.nasa.gov/ems/09_visiblelight/', s: 'The eye detects wavelengths from about 380 nm (violet) to 700 nm (red).' },
  { c: 'Wikipedia (accessed 16 November 2026). Visible spectrum.', u: 'https://en.wikipedia.org/wiki/Visible_spectrum', s: 'The colours on the wavelength axis: violet 380–450 nm, blue 450–485 nm, cyan 485–500 nm, green 500–565 nm, yellow 565–590 nm, orange 590–625 nm, red 625–750 nm.' }
];
