/* ============================================================
   text.js — every word of the water-potential view (16 Nov 2026; on the picture since 17 Nov 2026): its steps, the
   cards of its names, the words on its pictures, its sources.
   Each paragraph starts with its level, as in the membrane view (js/membrane/text.js): [!] the step's plain first line
   (what the step is FOR), [sl CODE] SL and HL, [hl CODE] HL only (the guide's "Additional higher level"), [x] beyond the
   guide, [x+] beyond the guide and folded under "More detail" ([x+] [sl CODE] folds a guide line that the step can be
   followed without). The codes are the IB Biology guide's own (first assessment 2025), topic D2.3 Water potential, read
   from the guide itself:
     SL and HL: D2.3.1 solvation · D2.3.2 less to more concentrated (hypotonic, hypertonic, isotonic) · D2.3.3 into or
     out of cells, dynamic equilibrium · D2.3.4 plant tissue in hypotonic and hypertonic solutions (mass, length, SD, SE,
     isotonic concentration) · D2.3.5 cells without a wall (bursting, crenation, contractile vacuoles, isotonic tissue
     fluid) · D2.3.6 cells with a wall (turgor pressure, plasmolysis) · D2.3.7 medical uses of isotonic solutions.
     Additional higher level: D2.3.8 water potential, relative to pure water at atmospheric pressure and 20 °C, kPa ·
     D2.3.9 higher to lower · D2.3.10 ψw = ψs + ψp · D2.3.11 potentials of tissue in hypotonic and hypertonic solutions.
   Words (memory eal-korean-students, exam-wording-not-everyday-english): short sentences to "you"; a term is explained
   the first time it is used in this view; no idiom, no phrasal verb, never "amount"; nothing about what an examination
   asks. Every number is from a source in SOURCES (the Course Companion's pages, read on the page images); bars with no
   source say "relative sizes". One number is worked out, and the working is shown (steps 2 and 3, More detail): normal
   saline's 0.154 mol dm⁻³ of sodium chloride (pp. 657–658) gives 0.308 mol dm⁻³ of ions; water is 1000 g ÷ 18 g mol⁻¹ = 55.5
   mol dm⁻³; 55.5 ÷ 0.308 = 180. D2.3.4 may be a practical the pupils carry out: the step gives what is measured and how a
   graph is read, never data, a table, a method in full or an analysis (memory never-do-the-assessment).
   ============================================================ */
export const LEVELS = {
  sl: { name: 'SL and HL', long: 'in the IB guide for standard level and higher level' },
  hl: { name: 'HL only', long: 'in the IB guide for higher level only (additional higher level)' },
  x: { name: 'Beyond the guide', long: 'not in the IB guide: it helps you follow the step' }
};

/* the steps: scene = the picture (scenes.js); hl = a step of the higher level only (its button is marked).
   Since 17 Nov 2026 a step teaches on its picture (memory teach-on-the-picture; Daniel: "Yes, carry on" to the membrane
   view's frames): t keeps at most 49 words on show, and no guide line is folded under More detail. A guide line that
   says what ONE named part of the picture is stands in `cards`, under that part's id: { name (on its chip), t (the
   line, with its own tag; a line beyond the guide that says what the part is may follow, tagged [x]) }. The names and captions of the picture that carry that id are buttons (scenes.js: card);
   pressed, the part stays bright and the card opens in the sheet. `modes`: a picture with a switch; each choice shows
   its own guide line under the step's first line. */
export const STEPS = [
  { id: 'solvent', scene: 'solvate', title: 'Water: the solvent',
    t: `[!] Why does water enter or leave a cell? First: how substances dissolve in water.
[sl D2.3.1] A solute (a substance that dissolves) dissolves in a solvent, here water, and forms a solution.
[sl D2.3.1] Water molecules surround each solute particle: solvation.
[x+] Only the water molecules that touch each solute particle are drawn. In a real solution more water molecules surround them, touching each other and moving all the time; their hydrogen bonds break and form again.
[x+] Solvation keeps the solute particles apart, so the solute stays dissolved.`,
    cards: {
      water: { name: 'water molecule', t: `[sl D2.3.1] A water molecule is polar: its oxygen is slightly negative (δ−), its hydrogens slightly positive (δ+).` },
      ion: { name: 'ions: Na⁺ and Cl⁻', t: `[sl D2.3.1] Ions (charged particles) attract the oppositely charged end of water molecules.` },
      glu: { name: 'glucose', t: `[sl D2.3.1] Glucose forms hydrogen bonds (weak δ+ to δ− attractions) with water.` }
    } },
  { id: 'osmosis', scene: 'osmosis', title: 'Osmosis: water moves towards more solute',
    t: `[!] Water molecules cross a selectively permeable membrane in both directions. Which way do more of them cross?
[sl D2.3.2] Concentration is how many solute particles there are in a set volume.
[sl D2.3.2] More water crosses towards the more concentrated solution. This net (overall) movement of water is osmosis.
[x+] Water crosses a cell membrane between the phospholipids and through channel proteins (aquaporins). The gaps in this membrane represent these ways across.
[x+] The picture is a model with few molecules. Each one moves at random; none is pushed towards a side. The counts are of this picture.
[x+] The solutions of the model are far more concentrated than real ones, so that one minute shows the difference. In normal saline (step 7) about 1 particle in 180 is an ion: 1 dm³ holds 0.308 mol of ions and about 55.5 mol of water.
[x+] The surface of each solution can move. The solution that gains water molecules has a larger volume, so its level rises.`,
    cards: {
      mem: { name: 'selectively permeable membrane', t: `[sl D2.3.2] Water passes through the selectively permeable membrane. The solute particles in the picture cannot.` },   /* (28 Nov 2026: the guide's word, B2.1.6 and B2.1.8, as in the membrane view; "partially permeable" is the 0610 syllabus's) */
      tonic: { name: 'hypotonic, hypertonic', t: `[sl D2.3.2] Compared with the other solution: less concentrated is hypotonic, more concentrated is hypertonic, equal is isotonic.` }
    } },
  { id: 'cells', scene: 'tonicity', title: 'Water into or out of a cell',
    t: `[!] The cytoplasm of a cell is a solution too. The solution outside the cell decides which way water moves.
[x+] The picture is a model with few molecules. Each one moves at random; none is pushed towards a side. The counts are of this picture.
[x+] In the isotonic solution the two counts are not equal at every moment: each crossing happens by chance. Over a longer time the two counts stay close.
[x+] The solutions of the model are far more concentrated than real ones, so that one minute shows the difference. In normal saline (step 7) about 1 particle in 180 is an ion: 1 dm³ holds 0.308 mol of ions and about 55.5 mol of water.`,
    modes: { ask: 'The solution outside the cell', list: [
      { id: 'hypo', name: 'Hypotonic', t: `[sl D2.3.3] Hypotonic solution (less concentrated than the cytoplasm): the net movement of water is into the cell, by osmosis.` },
      { id: 'iso', name: 'Isotonic', t: `[sl D2.3.3] Isotonic solution (the same concentration as the cytoplasm): water still crosses, at the same rate in both directions. There is no net movement: a dynamic equilibrium.` },
      { id: 'hyper', name: 'Hypertonic', t: `[sl D2.3.3] Hypertonic solution (more concentrated than the cytoplasm): the net movement of water is out of the cell, by osmosis.` }
    ] } },
  { id: 'animal', scene: 'rbc', title: 'Cells without a wall: red blood cells',
    t: `[!] An animal cell has no cell wall. Only its thin plasma membrane holds its contents.
[sl D2.3.5] In an animal, the tissue fluid (the liquid around the cells; for red blood cells, the blood plasma) must stay isotonic, to prevent the harmful changes that the picture shows.
[x+] Before a red blood cell bursts, it becomes a sphere. The burst, empty membrane is called a red cell ghost.`,
    cards: {
      burst: { name: 'haemolysis', t: `[sl D2.3.5] In a hypotonic solution, water enters. The red blood cell swells and can burst: haemolysis.` },
      shrink: { name: 'crenation', t: `[sl D2.3.5] In a hypertonic solution, water leaves. The red blood cell shrinks, and its surface forms many small points: crenation.` }
    } },
  { id: 'fresh', scene: 'protist', title: 'Fresh water: the contractile vacuole',
    t: `[!] Paramecium is a unicellular organism (one cell) with no cell wall. Paramecium lives in fresh water, so water enters the cell all the time.
[sl D2.3.5] Fresh water is hypotonic to the cytoplasm, so water enters by osmosis.
[x+] How does a contractile vacuole fill? The cell pumps ions into the vacuole, and water follows by osmosis. Then the vacuole contracts and expels the water. Pumping the ions uses energy.
[x+] Paramecium has two contractile vacuoles.`,
    cards: {
      cv: { name: 'contractile vacuole', t: `[sl D2.3.5] A contractile vacuole collects the water that enters and expels it from the cell, again and again. Without contractile vacuoles, the cell would swell and burst.` }
    } },
  { id: 'plant', scene: 'plant', title: 'Cells with a wall: plant cells',
    t: `[!] A plant cell has a strong cell wall around its plasma membrane. Compare the plant cells with the red blood cells above.
[x+] The cell wall is freely permeable. So in plasmolysis the outside solution fills the space between the cell wall and the plasma membrane.
[x+] Plasmolysis damages a cell and can kill it. A plant whose cells are flaccid wilts.`,
    cards: {
      turgid: { name: 'turgid', t: `[sl D2.3.6] Hypotonic: water enters the vacuole (the large central space). The contents press on the wall: turgor pressure. The wall prevents bursting, so the cell is turgid (firm).` },
      flaccid: { name: 'flaccid', t: `[sl D2.3.6] Isotonic: no net movement. The contents do not press on the wall: the cell is flaccid (soft).` },
      plasmo: { name: 'plasmolysed', t: `[sl D2.3.6] Hypertonic: water leaves. The plasma membrane separates from the cell wall: plasmolysis.` }
    } },
  { id: 'medicine', scene: 'medicine', title: 'Isotonic solutions in medicine',
    t: `[!] Fluids that touch the cells of a patient must be isotonic, so that the cells neither swell nor shrink.
[x+] If pure water flowed into a vein, red blood cells would swell and burst.
[x+] Normal saline is also used to rinse wounds and in eye drops.`,
    cards: {
      iv: { name: 'intravenous drip', t: `[sl D2.3.7] Intravenous fluids flow through a tube into a vein (intravenous: into a vein). The usual one is normal saline: 9 g of sodium chloride per dm³ (0.154 mol dm⁻³).` },
      organ: { name: 'organ for transplantation', t: `[sl D2.3.7] An organ for transplantation (moving it to another person) is bathed in an isotonic solution and kept cold until the operation.` }
    } },
  { id: 'tissue', scene: 'tissue', title: 'Measuring water movement in plant tissue',
    t: `[!] At which concentration does plant tissue neither gain nor lose water?
[sl D2.3.4] Bathe similar pieces of tissue (such as potato) in solutions of several concentrations. Measure the mass, or length, of each piece before and after.
[x+] Above 0 %, the tissue gained water: the solution was hypotonic to the tissue. Below 0 %, the tissue lost water: the solution was hypertonic.`,
    cards: {
      formula: { name: 'percentage change', t: `[sl D2.3.4] Use the percentage change in mass: the pieces start with different masses.` },
      repeats: { name: 'repeats', t: `[sl D2.3.4] With repeats (several pieces of tissue in each solution), calculate the mean, the standard deviation (the spread) and the standard error (how reliable the mean is).
[sl D2.3.4] With these, the reliability of the length measurements and of the mass measurements can be compared.
[sl D2.3.4] The standard error can be shown on the graph as error bars.` },
      iso: { name: 'isotonic concentration', t: `[sl D2.3.4] The line crosses 0 % at the isotonic concentration.` }
    } },
  { id: 'potential', scene: 'potential', hl: true, title: 'Water potential',
    t: `[!] One quantity predicts the direction of water movement: water potential.
[hl D2.3.8] Water potential (ψ, psi) is the potential energy of water per unit volume. Potential energy is stored energy.
[x+] Heights work in the same way: sea level is given the height 0 m by choice. Pure water is given 0 kPa by choice.`,
    cards: {
      pure: { name: 'pure water: 0 kPa', t: `[hl D2.3.8] Absolute values cannot be measured. So pure water at atmospheric pressure and 20 °C is given a water potential of zero: 0 kPa (kilopascals).` },
      salt: { name: 'a solution: below zero', t: `[hl D2.3.10] Dissolved solutes lower the water potential: a solution at atmospheric pressure has a water potential below zero.` }
    } },
  { id: 'downhill', scene: 'downhill', hl: true, title: 'From higher to lower water potential',
    t: `[!] Water moves from a higher water potential to a lower one, as a ball rolls to the bottom of a slope.
[hl D2.3.9] Water at a higher water potential has more potential energy. Movement to a lower water potential reduces the potential energy of the water.
[x+] When the pressure is the same on both sides, osmosis gives the same direction: water moves towards the more concentrated solution, which has the lower water potential.
[x+] In cells, water potential is zero or negative. A lower value is more negative.`,
    cards: {
      net: { name: 'net movement of water', t: `[hl D2.3.9] Example: water moves from a cell at −200 kPa to a cell at −300 kPa, because −200 kPa is higher (less negative).` }
    } },
  { id: 'parts', scene: 'parts', hl: true, title: 'Solute potential and pressure potential',
    t: `[!] In a cell with a wall, two things set the water potential: the solutes and the pressure.
[hl D2.3.10] ψw = ψs + ψp: water potential = solute potential + pressure potential.`,
    cards: {
      s: { name: 'solute potential', t: `[hl D2.3.10] Solute potential (ψs) is zero for pure water. Dissolved solutes make solute potential negative, never positive.` },
      p: { name: 'pressure potential', t: `[hl D2.3.10] Pressure potential (ψp) is generally positive inside cells: the contents press on the wall. In xylem vessels (the tubes that carry water) under tension (pulling), pressure potential is negative.
[x] Pressure potential is the pressure above or below atmospheric pressure: atmospheric pressure is its zero.` }
    } },
  { id: 'tissueHL', scene: 'tissueHL', hl: true, title: 'Potentials in plant tissue',
    t: `[!] Water enters or leaves plant tissue until ψw of its cells equals ψw of the solution.
[x+] At ψw = 0 in pure water, ψs and ψp are equal in size and opposite in sign: the cells are fully turgid.
[x+] Why does ψs change? Water that enters dilutes the solutes of the cell; water that leaves concentrates them.`,
    cards: {
      hypo: { name: 'in pure water', t: `[hl D2.3.11] Hypotonic solution (here pure water, ψw = 0): water enters. ψp rises and ψs becomes slightly less negative, until ψw of the cells reaches 0.` },
      hyper: { name: 'in a hypertonic solution', t: `[hl D2.3.11] Hypertonic solution: water leaves, and ψs becomes more negative. ψp falls to zero: the cells are flaccid. As more water leaves, the cells plasmolyse, until ψw of the cells equals ψw of the solution.` }
    } }
];

/* the words on the pictures: captions (cap…), names with a line (the rest), notes under the picture (note) */
export const PIC = {
  solvate: {
    na: 'A positive ion: sodium, Na⁺', cl: 'A negative ion: chloride, Cl⁻', glu: 'A polar molecule: glucose',
    naN: 'Positive ion: Na⁺', clN: 'Negative ion: Cl⁻', gluN: 'Polar molecule: glucose',
    water: 'water molecule (the solvent)', hb: 'hydrogen bond',
    note: 'Not to scale. Only the water molecules that touch each solute particle are drawn.'
  },
  osmosis: {
    left: 'Fewer solute particles: less concentrated (hypotonic)', right: 'More solute particles: more concentrated (hypertonic)',
    leftN: 'Less concentrated (hypotonic)', rightN: 'More concentrated (hypertonic)',
    mem: 'selectively permeable membrane', start: 'level at the start', hero: 'a water molecule', heroK: 'two water molecules, followed', heroN: 'two, followed',
    same: 'At the start the two solutions have the same volume.',
    kw: 'water molecule', ks: 'solute particle', kwN: 'water', ksN: 'solute',
    crossed: 'Water molecules that crossed', to: ['to the less concentrated solution', 'to the more concentrated solution'], toN: ['to the left', 'to the right'],
    net: 'net movement of water: osmosis', none: 'no net movement',
    note: 'A model, not to scale: the molecules move at random.'
  },
  tonicity: {
    cyto: 'Cytoplasm', sol: { hypo: 'Hypotonic solution: less concentrated than the cytoplasm', iso: 'Isotonic solution: the same concentration as the cytoplasm', hyper: 'Hypertonic solution: more concentrated than the cytoplasm' },
    solN: { hypo: 'Hypotonic solution', iso: 'Isotonic solution', hyper: 'Hypertonic solution' },
    mem: 'plasma membrane', start: 'level at the start', hero: 'a water molecule', heroK: 'two water molecules, followed', heroN: 'two, followed',
    same: 'At the start the cytoplasm and the solution have the same volume.',
    kw: 'water molecule', ks: 'solute particle', kwN: 'water', ksN: 'solute',
    crossed: 'Water molecules that crossed', to: ['into the cell', 'out of the cell'],
    net: { hypo: 'net movement of water: into the cell', hyper: 'net movement of water: out of the cell' }, none: 'no net movement: a dynamic equilibrium',
    note: 'A model, not to scale: the molecules move at random.'
  },
  rbc: {
    title: 'Red blood cells, seen from the side',
    hypo: 'Hypotonic solution', iso: 'Isotonic solution', hyper: 'Hypertonic solution',
    burst: 'Swells, then bursts: haemolysis', normal: 'Normal shape', shrink: 'Shrinks: crenation',
    mem: 'plasma membrane',
    note: 'Not to scale.'
  },
  protist: {
    fresh: 'Fresh water (hypotonic)', name: 'Paramecium (one cell)',
    cv: 'contractile vacuole', enters: 'water enters by osmosis', out: 'water is expelled',
    note: 'Not to scale.'
  },
  plant: {
    hypo: 'Hypotonic', iso: 'Isotonic', hyper: 'Hypertonic',
    rowA: 'Red blood cells: no wall', rowP: 'Plant cells: with a wall',
    burst: 'bursts', normal: 'normal', shrink: 'shrinks',
    turgid: 'Turgid', flaccid: 'Flaccid', plasmo: 'Plasmolysed',
    vac: 'vacuole', press: 'turgor pressure', wall: 'cell wall', mem: 'plasma membrane',
    note: 'Not to scale.'
  },
  medicine: {
    iv: 'Intravenous drip', organ: 'An organ ready for transplantation',
    bag: 'bag of normal saline', tube: 'tube into a vein', cells: 'Red blood cells keep their normal shape',
    kidney: 'kidney in a bag of isotonic solution', slush: 'isotonic slush (partly frozen)', box: 'insulated box',
    note: 'Not to scale.'
  },
  tissue: {
    s1: 'Similar pieces of tissue', s2: 'Mass before', s3: 'Solutions of several concentrations', s4: 'Mass after', rep: 'with repeats',
    formula: 'Percentage change in mass = (mass after − mass before) ÷ mass before × 100',
    /* the same, shorter, for a phone */
    short: { s1: 'Similar pieces', s2: 'Mass before', s3: 'Several concentrations', s4: 'Mass after', formula: 'Change in mass / % = (after − before) ÷ before × 100', gain: 'Gain: water entered', loss: 'Loss: water left' },
    y: 'Change in mass / %', x: 'Concentration of solution / mol dm⁻³',
    gain: 'Gain in mass: water entered', loss: 'Loss in mass: water left',
    fit: 'line of best fit', iso: 'isotonic concentration',
    note: 'No data: this graph shows how to read the line, not results.'
  },
  potential: {
    axis: 'Water potential / kPa', higher: 'higher', lower: 'lower',
    pure: 'Pure water, 20 °C, atmospheric pressure: 0 kPa', salt: 'Sodium chloride solution, 1.0 mol dm⁻³: −4,540 kPa',
    note: 'Value: Allott and Mindorff (2023), p. 659. The two beakers hold the same volume.'
  },
  downhill: {
    a: 'Cell A', b: 'Cell B', axis: 'Water potential / kPa', net: 'net movement of water',
    ball: 'Like a ball that rolls to the bottom of a slope',
    note: 'Values: Allott and Mindorff (2023), p. 658. Not to scale.'
  },
  parts: {
    eq: 'ψw = ψs + ψp', s: 'solute potential', p: 'pressure potential', w: 'water potential',
    vac: 'vacuole: its solutes lower ψs', press: 'the contents press on the wall: ψp',
    xylem: 'Xylem vessel under tension: ψp below zero', pull: 'tension',
    note: 'Bars: relative sizes, not measured values.'
  },
  tissueHL: {
    hypo: 'In pure water (hypotonic)', hyper: 'In a hypertonic solution',
    turgid: 'Turgid: ψw of the cells = 0', plasmo: 'Plasmolysed: ψw of the cells = ψw of the solution',
    note: 'Bars: relative sizes, not measured values. The dashed line is ψw of the solution.'
  }
};

/* the sources, with what each one supports (the page ends with this list) */
export const SOURCES = [
  { c: 'International Baccalaureate Organization (2023). Biology guide, first assessment 2025. Topic D2.3, Water potential.', s: 'The statements and codes on the level tags.' },
  { c: 'Allott A, Mindorff D (2023). Oxford Resources for IB DP Biology: Course Book. Oxford University Press. ISBN 978-1-38-201633-9. Topic D2.3, Water potential, pp. 648–663.', u: 'https://www.oup.com.au/books/secondary-education/biology/9781382016339',
    s: 'The contractile vacuoles of Paramecium (p. 648); solvation of ions and of glucose (pp. 649–650); water crosses in both directions, more towards the more concentrated solution (p. 650); red blood cells swell and burst, or shrink and form crenations (pp. 655–656); turgid, flaccid and plasmolysed cells (p. 657); normal saline, 9 g of sodium chloride per dm³ (0.154 mol dm⁻³), and organs bathed in isotonic solution and kept cold (pp. 657–658); water potential relative to pure water at 20 °C and atmospheric pressure, and water moving from −200 kPa to −300 kPa (p. 658); −4,540 kPa for 1.0 mol dm⁻³ sodium chloride, and the potentials of tissue in hypotonic and hypertonic solutions (pp. 659–660).' }
];
