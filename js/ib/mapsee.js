/* ============================================================
   mapsee.js — what a student will SEE at each statement of the IB views, for the IB map (22 Nov 2026).
   Daniel, 21 Nov 2026, about the IB map: "I get the name of the station where I'm going. Many times it's the same
   name ... It's not really informative of what I am going to explore ... what is that I'm going to observe?"; and to
   the new window (a topic lists its statements, each with what you will see): "it's good as long as you don't
   overwhelm the students with what they're going to see."
   So: one short line for each statement that each door of the IB views teaches. js/game/ibmap.js reads this file when
   the map opens (as it reads js/game/mapsee.js and js/plant/mapsee.js); where a door or a line is missing, the map
   keeps its own line. The statements' short NAMES are not here: the map keeps one table of them (js/game/mapsee.js),
   so that a statement has one name, whoever teaches it.
     LINES = { '<door>': { '<code>': [[step, 'line'], …] } }
     door   the map's own id (ibmap.js doors()): 'membrane', 'atp-<chapter id>', 'atp-x-insulin', 'water', 'light',
            'fractionation'
     step   the number the student sees, from 1 (the map turns it into its own index). It must be a step that TEACHES
            that statement: a paragraph tagged with the code in that step of the view's text.js
     line   what the student SEES there: one sentence, at most 12 words, plain text (no HTML), no code in it
   A statement taught in several steps of one door has one line, at the step with the best picture; a second line only
   where two steps show different things (never more than three). An EMPTY list means "no row for this door here": the
   step only points to another step of the same view, which has the row.
   A line never gives the answer to a choice that its step asks of the student (the lab's medium, its spins, De Duve's
   test): it says what the student will do or look for.
   Proof: node tools/mapsee-check.mjs (every statement of every door has a line; every line's step teaches its
   statement; no line over 12 words). Change a step of a view, and its line here changes with it.
   This file imports nothing, so the checks can read it.
   ============================================================ */
export const LINES = {
  'membrane': {
    'B1.1.10': [[3, 'Saturated fatty acid tails are straight; unsaturated tails are bent.']],
    'B1.1.12': [[1, 'Hydrophilic heads face the water; hydrophobic tails stay inside.']],
    'B2.1.1': [[1, 'A piece of membrane in 3D: two layers of phospholipids.']],
    'B2.1.2': [[1, 'Press the tails: a hydrophobic barrier to ions and polar molecules.']],
    'B2.1.4': [[5, 'Integral proteins in the bilayer; a peripheral protein attached to its surface.']],
    'B2.1.5': [[9, 'Water molecules pass through an aquaporin, counted both ways.']],
    'B2.1.6': [[5, 'A channel protein, with a pore through the membrane.']],
    'B2.1.8': [[5, 'A carrier protein and a channel protein: only specific particles cross.']],
    'B2.1.9': [[7, 'Green carbohydrate chains on proteins and lipids, all on the outside.']],
    'B2.1.10': [[2, 'Phospholipids change places sideways: the membrane is fluid.'], [8, 'The membrane from the side, as you draw it.']],
    'B2.1.11': [[3, 'Straight saturated tails and bent unsaturated tails, close up.']],
    'B2.1.12': [[4, 'Cholesterol molecules (yellow) among the tails of the phospholipids.']],
    'D2.3.2': [[9, 'More water molecules cross towards the side with more solute.']],
  },
  'atp-c0': {
    'B2.1.8': [],   /* (no row: step 3 is the map's overview; chapter 1, step 4 shows this crossing itself) */
    'C1.2.2': [[6, 'On the map: ATP leaves the mitochondrion for the cell\'s jobs.']],
    'C1.2.4': [[1, 'A map of a muscle cell: the path of one glucose molecule.']],
    'C1.2.5': [[4, 'On the map: which reactions need oxygen, and where they happen.']],
    'C1.2.8': [[4, 'On the map: glycolysis, in the cytosol.']],
  },
  'atp-c1': {
    'B1.1.4': [[1, 'One glucose molecule, with its six carbon atoms numbered.']],
    'B2.1.1': [[1, 'The bilayer of a muscle cell, at its true size.']],
    'B2.1.2': [[2, 'Glucose molecules move at random: almost none crosses the bilayer.']],
    'B2.1.3': [[5, 'Oxygen molecules cross between the phospholipids, both ways, with a count.']],
    'B2.1.8': [[4, 'The glucose transporter closes to the outside and opens to the inside.']],
    'C1.2.8': [[7, 'An enzyme adds a phosphate group from ATP to glucose.']],
    'C1.2.16': [[5, 'Oxygen enters the muscle cell, long before the step that uses it.']],
    'C2.1.11': [[3, 'The glucose transporter of a muscle cell, in its measured shape.']],
  },
  'atp-c2': {
    'C1.1.14': [[4, 'The control enzyme of glycolysis: ATP binds its allosteric site.']],
    'C1.1.16': [[4, 'The enzyme that ATP, the end product, inhibits: feedback inhibition.']],
    'C1.2.5': [[14, 'Without oxygen, in a human cell: glucose becomes lactate.']],
    'C1.2.7': [[7, 'Hydrogen is removed from triose phosphate, and NAD accepts it.']],
    'C1.2.8': [[1, 'Glycolysis step by step: each enzyme above, the molecule below.']],
    'C1.2.9': [[14, 'Pyruvate accepts hydrogen from NADH and becomes lactate; NAD is regenerated.']],
    'C1.2.10': [[15, 'In yeast: pyruvate loses carbon dioxide, then becomes ethanol.']],
  },
  'atp-c3': {
    'B2.1.6': [[3, 'Pyruvate passes through a channel protein with a wide pore.']],
    'B2.2.4': [[2, 'The edge of a mitochondrion: two membranes and the space between them.']],
    'C1.2.5': [[1, 'A mitochondrion cut open: two membranes, the inner one folded.']],
    'C1.2.11': [[1, 'Pyruvate arrives at the mitochondrion, for the link reaction.']],
  },
  'atp-c4': {
    'C1.2.7': [[3, 'Oxidation in the link reaction: NAD accepts the hydrogen.']],
    'C1.2.11': [[2, 'Pyruvate loses carbon dioxide; its acetyl group joins coenzyme A.']],
    'C1.2.17': [[4, 'The count for the link reaction; fatty acids join the path here.']],
  },
  'atp-c5': {
    'C1.1.13': [[1, 'The Krebs cycle drawn as a ring: a cyclical pathway.']],
    'C1.2.12': [[2, 'The acetyl group joins oxaloacetate to make citrate; the cycle turns.']],
    'C1.2.13': [[12, 'The count for the cycle: most energy is now in NADH.']],
  },
  'atp-c6': {
    'B2.2.4': [[8, 'Protons collect in the small intermembrane space.']],
    'C1.2.2': [[11, 'ATP leaves for the jobs of the cell, such as muscle contraction.']],
    'C1.2.3': [[11, 'ATP becomes ADP and phosphate; ADP returns to the mitochondrion.']],
    'C1.2.13': [[2, 'NADH gives a pair of electrons to the first carrier.']],
    'C1.2.14': [[3, 'Electrons pass along the chain; each complex pumps protons across.']],
    'C1.2.15': [[9, 'Protons flow through ATP synthase; its ring turns and ATP is made.']],
    'C1.2.16': [[6, 'Oxygen waits at the last complex, accepts electrons and becomes water.']],
  },
  'atp-tally': {
    'C1.2.5': [[1, 'The count: aerobic respiration yields far more ATP than anaerobic.']],
    'C1.2.8': [[1, 'The count of ATP for one glucose: glycolysis makes 4, uses 2.']],
    'C1.2.12': [[1, 'The count for one glucose: the Krebs cycle makes 2 ATP.']],
    'C1.2.16': [[3, 'The whole equation: the oxygen you breathe in ends in water.']],
  },
  'atp-x-insulin': {
    'B1.2.11': [[1, 'Insulin\'s two polypeptide chains, joined by disulfide bonds.']],
    'B2.1.8': [[11, 'More glucose transporters in the membrane, so more glucose enters.']],
    'B2.1.9': [[2, 'The insulin receptor, with its carbohydrate chains outside the cell.']],
    'B2.1.13': [[10, 'A vesicle with glucose transporters fuses with the plasma membrane: exocytosis.']],
    'C2.1.1': [[3, 'Insulin binds to its receptor, and the receptor changes shape.']],
    'C2.1.4': [[1, 'Insulin close up: a small protein hormone.']],
    'C2.1.6': [[2, 'The insulin receptor crosses the membrane: a transmembrane receptor.']],
    'C2.1.7': [[7, 'The signal passes from protein to protein inside the cell.']],
    'C2.1.11': [[5, 'Inside the cell, the receptor adds phosphate groups to its own tyrosines.']],
    'D3.3.3': [[1, 'Insulin arrives in the blood at a muscle cell.']],
  },
  'water': {
    'D2.3.1': [[1, 'Water molecules surround an ion and a glucose molecule: solvation.']],
    'D2.3.2': [[2, 'Water crosses a membrane both ways, counted; one level rises.']],
    'D2.3.3': [[3, 'A cell in three solutions: hypotonic, isotonic, hypertonic.']],
    'D2.3.4': [[8, 'Plant tissue in several solutions: the graph of the change in mass.']],
    'D2.3.5': [[4, 'Red blood cells swell and burst, or shrink and crenate.'], [5, 'A contractile vacuole fills and empties in a freshwater cell.']],
    'D2.3.6': [[6, 'A plant cell: turgid, flaccid, then plasmolysed.']],
    'D2.3.7': [[7, 'Isotonic solutions: a drip into a vein, and an organ for transplantation.']],
    'D2.3.8': [[9, 'A scale of water potential: pure water at 0 kPa.']],
    'D2.3.9': [[10, 'Water moves from −200 kPa to −300 kPa: from higher to lower.']],
    'D2.3.10': [[11, 'Solute potential and pressure potential add up to water potential.']],
    'D2.3.11': [[12, 'Plant tissue in two solutions: how ψs, ψp and ψw change.']],
  },
  'light': {
    'A2.2.11': [[2, 'A chloroplast cut open: thylakoids, grana and stroma to label.']],
    'B2.2.5': [[2, 'The large area of thylakoid membrane inside one chloroplast.']],
    'C1.3.1': [[1, 'A palisade cell full of chloroplasts: light energy enters.']],
    'C1.3.2': [[6, 'Water is split; its hydrogen converts carbon dioxide to glucose.']],
    'C1.3.3': [[6, 'Oxygen molecules leave: their atoms come from the water.']],
    'C1.3.4': [[4, 'Chromatography separates the pigments of a leaf: find each Rf value.']],
    'C1.3.5': [[3, 'Move the wavelength: which colours of light does chlorophyll absorb?']],
    'C1.3.6': [[5, 'The action spectrum beside the absorption spectrum: compare them.']],
    'C1.3.7': [[7, 'Change light, carbon dioxide or temperature: the rate changes.']],
    'C1.3.8': [[7, 'Carbon dioxide enrichment: greenhouses and open fields (FACE).']],
    'C1.3.9': [[8, 'A photosystem: an array of pigments round a reaction centre.']],
    'C1.3.10': [[8, 'Many pigments pass the energy of light to one reaction centre.']],
    'C1.3.11': [[9, 'Photosystem II splits water: electrons, protons and oxygen.']],
    'C1.3.12': [[11, 'Protons flow through ATP synthase and ATP is made, with a count.']],
    'C1.3.13': [[12, 'Photosystem I passes electrons to NADP: reduced NADP.']],
    'C1.3.14': [[13, 'One thylakoid: where water is split, ATP made and NADP reduced.']],
    'C1.3.15': [[14, 'Rubisco joins carbon dioxide to RuBP.']],
    'C1.3.16': [[15, 'GP becomes triose phosphate, using ATP and reduced NADP.']],
    'C1.3.17': [[16, 'Five triose phosphates become three RuBP: the cycle turns again.']],
    'C1.3.18': [[17, 'Triose phosphate becomes glucose, then sucrose, starch and cellulose.']],
    'C1.3.19': [[18, 'Take away the light or the carbon dioxide: see what stops first.']],
  },
  'fractionation': {
    'B1.2.5': [[4, 'Change the pH of the medium: a protein loses its shape.']],
    'B2.2.1': [[1, 'An animal cell: press each organelle\'s name.'], [6, 'Spin the broken cells four times: which organelles come down each time?']],
    'B2.2.3': [[7, 'De Duve\'s test: where is the enzyme? Three presses to find out.']],
    'C1.1.6': [[3, 'Warm or ice-cold: how often a protease meets a protein.']],
    'D2.3.2': [[2, 'Organelles in three media: they burst, stay whole or shrink.']],
    'D2.3.7': [[2, 'The medium round the organelles, and the same idea in medicine.']],
  },
};
