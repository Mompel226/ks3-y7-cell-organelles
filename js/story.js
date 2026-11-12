/* ============================================================
   story.js — the words of the Y7 cell game (4 Nov 2026): each place of the cell, what it is, what the pupil does there,
   and what they bring away. The behaviour of each step (`play`) is in js/game/play.js; the checks of each place are in
   js/questions.js; the board's parts and the game squares (TASKS) are here.
   The biology (memory biology-before-pedagogy: every step true):
   - one serous cell of a salivary gland makes amylase (511 amino acids; a 15-amino-acid signal at its start, UniProt
     P0DUB6; without it 496, the measured molecule: PDB 1SMD, about 8 × 5 × 5 nm) and releases it by exocytosis into the duct, when a nerve message arrives (regulated secretion);
   - the copy of the gene (mRNA) leaves through a nuclear pore; the two ribosome parts are made in the nucleolus and
     leave separately, joining only on the mRNA in the cytoplasm; the first part of the chain (the signal) takes the
     ribosome to the rough ER, where the chain is made into the ER; an enzyme in the ER membrane removes the signal while
     the chain grows; at the end of the copy the ribosome releases the chain and its parts separate; the chain folds;
   - a vesicle is a piece of the ER's own membrane, so the ER needs new lipids: the game makes them at the smooth ER (the
     rough ER makes some too), and they spread through the one joined ER membrane (never carried as a loose membrane);
   - the Golgi apparatus modifies, sorts and packages proteins: lysosome enzymes carry a label (a sugar with a
     phosphate), amylase has none (it clumps and is packed into large vesicles); a motor protein carries each vesicle
     along microtubules (they never branch; most start at the top of the cell), to the top, where it waits for the signal;
   - glucose is split into two smaller molecules in the cytosol before the mitochondria release most of its energy;
   - the starch test is the school method: starch with saliva (A) or water (B, the control), then iodine solution.
   Checked by an independent review (4 Nov 2026), every point weighed against the files and fixed or answered.
   Words pupils read (memory exam-wording-not-everyday-english, eal-korean-students, year7-text-and-instructions): short
   sentences, "you", a new word explained first and then named, no idioms, no phrasal verbs, never "amount".
   <dfn data-w="key"> opens a word's meaning (the shared KS3 glossary); <mark class="do"> is what to do now.
   ============================================================ */
window.PARTS = [
  { n: 1, title: 'Arrive: the cell you know' }, { n: 2, title: 'Cell membrane: the way in' }, { n: 3, title: 'Mitochondria' },
  { n: 4, title: 'Nucleus' }, { n: 5, title: 'Nucleolus' }, { n: 6, title: 'Ribosomes' }, { n: 7, title: 'Rough ER' },
  { n: 8, title: 'Smooth ER' }, { n: 9, title: 'Golgi apparatus' }, { n: 10, title: 'Microtubules' },
  { n: 11, title: 'Cell membrane: the way out' }, { n: 12, title: 'Does your amylase work?' },
  /* the final check (js/game/final.js): a test, one go, marked at the end; the board shows its score and its time */
  { n: 13, title: 'Final check', test: true },
  /* the plant-cell branch (js/plant/, 11 Nov 2026): not a place of the cell; its checks are drawn at its own end */
  { n: 14, title: 'Side quest (extra): a plant cell, where glucose comes from' }
];
/* a game finished is one square on the teacher's board (Lesson.done) */
window.TASKS = {
  'game-arrive':    { part: 1,  title: 'Game: met the cell, simple and real' },
  'game-wayin':     { part: 2,  title: 'Game: glucose, oxygen and amino acids entered; carbon dioxide left' },
  'game-mito':      { part: 3,  title: 'Game: released energy by aerobic respiration' },
  'game-nucleus':   { part: 4,  title: 'Game: found the gene and copied it; the copy left the nucleus' },
  'game-nucleolus': { part: 5,  title: 'Game: built the two ribosome parts' },
  'game-ribosome':  { part: 6,  title: 'Game: joined the amino acids; chose the rough ER' },
  'game-rer':       { part: 7,  title: 'Game: made the chain inside the rough ER; folded it' },
  'game-ser':       { part: 8,  title: 'Game: made lipids for the ER membrane' },
  'game-golgi':     { part: 9,  title: 'Game: sorted and packaged the proteins' },
  'game-tracks':    { part: 10, title: 'Game: steered the vesicle to the top of the cell' },
  'game-exit':      { part: 11, title: 'Game: exocytosis after the nerve message' },
  'game-test':      { part: 12, title: 'Game: tested the amylase on starch' },
  'game-plant':     { part: 14, title: 'Side quest: followed glucose from a leaf to the blood' }
};

/* Items the pupil carries between places. icon: js/game/icons.js */
window.ITEMS = {
  glucose:  { name: 'glucose', w: 'glucose', many: true },
  oxygen:   { name: 'oxygen', w: 'oxygen', many: true },
  amino:    { name: 'amino acids', w: 'amino-acid' },
  energy:   { name: 'energy', w: 'energy' },
  mrna:     { name: 'copy of the gene (mRNA)', w: 'mrna' },
  parts:    { name: 'ribosome parts', w: 'ribosome' },
  chain:    { name: 'ribosome with the start of the chain', w: 'ribosome' },
  lipids:   { name: 'new lipids in the ER membrane', w: 'lipid' },
  amylase:  { name: 'amylase in a vesicle', w: 'vesicle' },
  packed:   { name: 'vesicle packed with amylase', w: 'vesicle' },
  top:      { name: 'vesicle at the top of the cell', w: 'vesicle' },
  saliva:   { name: 'amylase in saliva', w: 'saliva' }
};

/* ---------------- the places ----------------
   needs: items the place needs before it wakes; gives: what it gives; kind: what the structure is (Daniel's definition:
   an organelle is a membrane-bound structure with a specific function); y7: in the Year 7 list (the five parts);
   figure: a picture at the top of the panel ('simple': the cell as Year 7 pupils draw it, js/game/simplecard.js);
   plural: the title names many (Mitochondria are awake, never "is"). */
window.STORY = {
  arrive: {
    part: 1, task: 'game-arrive', title: 'The cell you know', tag: 'Start here', figure: 'simple',
    steps: [
      { play: 'simple', watch: false, text: 'In Year 7 you learn five parts of an animal <dfn data-w="cell">cell</dfn>: the <dfn data-w="cell-membrane">cell membrane</dfn>, the <dfn data-w="cytoplasm">cytoplasm</dfn>, the <dfn data-w="nucleus">nucleus</dfn>, the <dfn data-w="mitochondria">mitochondria</dfn> and the <dfn data-w="ribosome">ribosomes</dfn>.\nIn the cell around you, only these five are lit now.' },
      { play: 'full', text: 'An <dfn data-w="electron-microscope">electron microscope</dfn> shows much more: it uses a beam of electrons instead of light, so it shows much smaller details.\n<mark class="do">Press Show everything.</mark>\nEach new structure appears with its name.' },
      { play: 'organelles', watch: false, text: 'An <dfn data-w="organelle">organelle</dfn> is a membrane-bound structure (surrounded by a <dfn data-w="membrane">membrane</dfn>) with a specific function, such as the nucleus.\nSome structures have no membrane, so they are <b>not</b> organelles: the ribosomes, the nucleolus, the microtubules and the centrosome.\n<dfn data-w="vesicle">Vesicles</dfn>, small bubbles of membrane, last only a short time: each one forms, then joins another membrane. So they are not organelles either.\nThe <dfn data-w="cytoplasm">cytoplasm</dfn> is the <dfn data-w="cytosol">cytosol</dfn> (a jelly-like fluid) and the organelles in it, but not the nucleus.' },
      { play: 'mission', watch: false, text: 'This cell is in your <dfn data-w="salivary-gland">salivary gland</dfn>. It makes <dfn data-w="amylase">amylase</dfn>, the <dfn data-w="enzyme">enzyme</dfn> in your saliva that digests <dfn data-w="starch">starch</dfn>.\n<b>Your mission: make amylase and release it from the cell.</b>\nIn this game, each place in the cell does one job. A place that is asleep wakes when you bring what it needs.' }
    ],
    done: 'You know the map. Two places are awake: <b>the nucleus</b> and <b>the way in</b>, at the base of the cell. Choose one.',
    fact: { text: 'Your body is made of about 37 trillion cells (37 000 000 000 000).', src: 'Bianconi et al. 2013, Annals of Human Biology 40:463' }
  },
  wayin: {
    part: 2, task: 'game-wayin', title: 'Cell membrane: the way in', kind: 'The cell membrane: part of every cell', y7: true, def: 'cell-membrane',
    needs: [], gives: ['glucose', 'oxygen', 'amino'],
    intro: 'You are at the base of the cell.\nBelow its membrane are the <dfn data-w="tissue-fluid">tissue fluid</dfn> (the liquid round the cells) and a <dfn data-w="capillary">capillary</dfn> full of blood: red blood cells in the <dfn data-w="plasma">plasma</dfn>, the liquid part of the blood.\nThe cell needs <dfn data-w="glucose">glucose</dfn> and <dfn data-w="oxygen">oxygen</dfn> for respiration, and <dfn data-w="amino-acid">amino acids</dfn> to make <dfn data-w="protein">proteins</dfn>. The blood brings them.\nThe <dfn data-w="cell-membrane">cell membrane</dfn> controls what enters and leaves the cell.',
    steps: [
      { play: 'look', watch: false, text: 'Here the membrane and the molecules are drawn about 100 times bigger, so that you can see them. The membrane is two layers of <dfn data-w="lipid">lipid</dfn> molecules, with proteins in them.\nAbove the membrane is the <b>inside</b> of the cell. Below it is the <b>outside</b>.' },
      { play: 'oxygen', text: '<dfn data-w="red-blood-cell">Red blood cells</dfn> carry oxygen from your lungs. Here, the gland cells use oxygen, so the red blood cells release it.\nA red blood cell is a disc, thinner in the middle.\n<mark class="do">Press a red blood cell.</mark>' },
      { play: 'carriers', text: 'Glucose and amino acids are dissolved in the plasma. They leave the capillary through its thin wall.\n<mark class="do">Press the glucose, then choose how it enters the cell.</mark>' },
      { play: 'amino', text: 'A <dfn data-w="carrier-protein">carrier protein</dfn> carried the glucose through the membrane. An amino acid is a larger molecule too.\n<mark class="do">Press the amino acid, then choose how it enters the cell.</mark>' },
      { play: 'co2', text: '<dfn data-w="carbon-dioxide">Carbon dioxide</dfn> is a waste product of respiration. It is a small molecule, like oxygen.\n<mark class="do">Press the carbon dioxide.</mark>' }
    ],
    /* the IB switch (quest.js ibSwitch, once every check is right): what IB adds to each step, one sentence a level
       (sl: SL and HL; hl: HL only; x: beyond the IB guide, 2025), the chapter of "From glucose to ATP" that shows it, and
       `text`: the step's own words with the IB terms where Year 7 has simpler ones (Daniel, 5 Nov 2026: "if you used lipids
       for Key Stage 3, now you use phospholipids") */
    ib: [
      { ch: 1, text: 'Here the membrane and the molecules are drawn about 100 times bigger, so that you can see them. The membrane is a <dfn data-w="phospholipid">phospholipid</dfn> bilayer, with proteins in it.\nAbove the membrane is the <b>inside</b> of the cell. Below it is the <b>outside</b>.',
        p: [['sl', 'B2.1.1, B2.1.2', 'The membrane is a phospholipid bilayer, about 5 nm thick. The phosphate heads are hydrophilic: they face the water on each side. The hydrocarbon tails are <dfn data-w="hydrophobic">hydrophobic</dfn>: they form the core, a barrier to ions and polar molecules.']] },
      { ch: null, p: [['sl', 'B2.1.3', 'Oxygen molecules are small and non-polar, so they pass between the phospholipids by simple diffusion, down their <dfn data-w="concentration-gradient">concentration gradient</dfn>.']] },
      { ch: 1, p: [['sl', 'B2.1.8', 'Glucose is polar, so it cannot pass between the phospholipids. The carrier protein for glucose is a <dfn data-w="glucose-transporter">glucose transporter</dfn>: glucose enters by <dfn data-w="facilitated-diffusion">facilitated diffusion</dfn>, down its concentration gradient, and no ATP is used.'],
        ['hl', 'C1.2.8', 'Inside the cell, an enzyme at once adds a phosphate group from ATP to the glucose (<dfn data-w="phosphorylation">phosphorylation</dfn>). Glucose 6-phosphate is charged, so it cannot leave through the transporter.'],
        ['x', '', 'In most body cells the transporter is GLUT1. From glucose to ATP shows GLUT4, the one in muscle cells. The enzyme is hexokinase.']] },
      { ch: null, text: 'A <dfn data-w="glucose-transporter">glucose transporter</dfn> (a <dfn data-w="carrier-protein">carrier protein</dfn>) carried the glucose through the membrane. An amino acid is charged, so it is polar too.\n<mark class="do">Press the amino acid, then choose how it enters the cell.</mark>',
        p: [['sl', 'B2.1.8', 'Each carrier protein is selective: only particles of the right shape and charge fit it. So the membrane is selectively permeable.']] },
      { ch: 4, text: '<dfn data-w="carbon-dioxide">Carbon dioxide</dfn> is a waste product of respiration. It is small and non-polar, like oxygen.\n<mark class="do">Press the carbon dioxide.</mark>',
        p: [['sl', 'B2.1.3', 'Carbon dioxide leaves by simple diffusion too.'],
        ['hl', 'C1.2.11, C1.2.12', 'It is produced in the mitochondria: in the link reaction and the Krebs cycle, each carbon dioxide molecule is removed from a larger molecule (<dfn data-w="decarboxylation">decarboxylation</dfn>). Its carbon atoms come from glucose.']] }
    ],
    done: 'You carry glucose, oxygen and amino acids. The <b>mitochondria</b> are awake now.',
    /* a return visit (quest.js `more`, main.js `place-more`; the audit, 11 Nov 2026): one press, never the five steps again */
    more: { lacks: ['glucose', 'oxygen'], label: 'Take in more glucose and oxygen', text: 'Your cell has used its glucose or its oxygen. The blood brings more: they enter as before, glucose through its carrier protein and oxygen straight through the lipids.', wait: 'You still carry glucose and oxygen. Return here when the cell has used them.', did: 'More glucose and oxygen are in the cell.' },
    explore: '🧬 IB extension: from glucose to ATP',
    /* a door to the plant-cell branch (js/plant/view.js), on the end card once every check is right (quest.js) */
    /* a SIDE QUEST, said plainly (Daniel, 11 Nov 2026: the game is about the animal cell; the plant story "should be
       something extra … be very specific that is a side quest … they can decide"): its mark, what it is, and that the
       mission waits */
    plant: '🌱 Side quest: where does this glucose come from?',
    plantNote: 'This is extra: you do not need it for your mission. It is another story, in a plant cell. You can do it now or after your mission: your game waits here.',
    fact: { text: 'A red blood cell is about 7.5 µm across: almost half as wide as this cell. In the narrowest capillaries, red blood cells bend to pass.', src: 'OpenStax, Anatomy and Physiology 2e, 18.2 (open textbook)' }
  },
  mito: {
    part: 3, task: 'game-mito', title: 'Mitochondria', onPic: 'Mitochondrion', plural: true, kind: 'Organelle: two membranes', y7: true, def: 'mitochondria',
    needs: ['glucose', 'oxygen'], gives: ['energy'],
    intro: '<dfn data-w="mitochondria">Mitochondria</dfn> (one: a mitochondrion) are the site of <dfn data-w="aerobic-respiration">aerobic respiration</dfn>, which releases energy from glucose, using oxygen.\nA mitochondrion has two membranes. The inner membrane is folded: the folds give a large surface, where most of the energy is released.',
    /* every size true (Daniel, 5 Nov 2026: "it needs to be relative … as close to relative size as possible"): the camera
       zooms in to the molecules, never the molecules made bigger (play.js, mitoparts.js) */
    steps: [
      { play: 'mlook', text: 'This is one mitochondrion, about 2.7 <dfn data-w="micrometre">micrometres</dfn> (µm) long. From outside, you see only its smooth outer membrane.\n<mark class="do">Press ✂ Cut it open</mark> to see inside.' },
      { play: 'minside', text: 'Inside, the inner membrane is folded. Its folds are the <dfn data-w="cristae">cristae</dfn> (one: a crista).\nInside the inner membrane is a thick liquid, the <dfn data-w="matrix">matrix</dfn>.\nHere its two membranes look like one line: they are only 15 nm apart.\nA glucose molecule is about 1 <dfn data-w="nanometre">nanometre</dfn> (nm) across: this mitochondrion is 700 times wider.\nIn this place everything is drawn at its true size compared with everything else, so to see glucose and the two membranes, you zoom in.\n<mark class="do">Press 🔍 Zoom in, beside the ring of light on its edge.</mark>' },
      { play: 'split', text: 'You are at the edge of the mitochondrion. The bar at the bottom left shows the scale.\nAbove is the <dfn data-w="cytosol">cytosol</dfn>; below, the outer membrane: two layers of lipids, with proteins in it.\nIn the cytosol, each glucose molecule is first split into two smaller molecules.\n<mark class="do">Press the glucose to split it.</mark>' },
      { play: 'feed', text: 'The smaller molecules pass through the two membranes into the matrix: through a <dfn data-w="channel-protein">channel protein</dfn>, then a <dfn data-w="carrier-protein">carrier protein</dfn>.\nOne glucose molecule needs six oxygen molecules.\n<mark class="do">Press the two smaller molecules, then the oxygen,</mark> to move them into the mitochondrion.' },
      { play: 'respire', text: 'In the matrix, <dfn data-w="enzyme">enzymes</dfn> break the smaller molecules down, step by step. Watch what is produced.' },
      { play: 'water', text: 'Hydrogen from the smaller molecules is carried to a chain of proteins in the folded inner membrane.\nThe proteins use its energy to pump <dfn data-w="hydrogen-ion">hydrogen ions</dfn> into the space inside the fold.\nWatch the hydrogen ions collect there. Then <mark class="do">press the oxygen</mark> to send it to the last protein in the chain.' },
      { play: 'dam', text: 'Now there are many hydrogen ions inside the fold, and few in the matrix. The membrane stops them, as a dam (a wall across a river) stops water.\nThey can flow back into the matrix only through <dfn data-w="atp-synthase">ATP synthase</dfn>.\nAs they flow through, a ring inside it turns, like a watermill (a wheel that water turns), and it makes <dfn data-w="atp">ATP</dfn>: a small molecule that carries energy.\nWatch the top of ATP synthase: each ADP joins a phosphate and becomes ATP, again and again.' },
      { play: 'release', text: '<span class="eq"><b class="eq-g">glucose</b> + <b class="eq-o">oxygen</b> → <b class="eq-c">carbon dioxide</b> + <b class="eq-w">water</b></span>\nAerobic respiration: <b>carbon dioxide</b> and <b>water</b> are produced, and energy is released. The cell uses this energy for its work: to join amino acids, to make lipids and to move vesicles.\nBeyond the Year 7 list: when every check of this place is right, <b>🧬 IB extension: from glucose to ATP</b> follows one glucose molecule to ATP, step by step.' }
    ],
    done: 'The energy bar is full. Every job of the cell uses some: when it is low, return here with more glucose and oxygen.',
    more: { needs: ['glucose', 'oxygen'], label: '⚡ Release energy again', text: 'You carry glucose and oxygen. The mitochondria release their energy as before: press ↻ beside a step to watch it again.', wait: 'To release more energy, bring glucose and oxygen from <b>the way in</b>.', did: 'Aerobic respiration released more energy: look at the energy bar.' },
    /* the IB switch (quest.js ibSwitch, once every check is right): what IB adds to each step, one sentence a level, and
       its chapter in "From glucose to ATP" (it replaced this place's Explorer film, 5 Nov 2026), and `text`: the step in IB terms */
    ib: [
      { ch: 0, p: [['sl', 'C1.2.5', 'Mitochondria are needed for aerobic respiration, but not for anaerobic respiration.']] },
      { ch: 3, text: 'Inside, the inner membrane is folded. Its folds are the <dfn data-w="cristae">cristae</dfn> (one: a crista).\nInside the inner membrane is the <dfn data-w="matrix">matrix</dfn>, a fluid with the enzymes of the link reaction and the Krebs cycle.\nHere its two membranes look like one line: the <dfn data-w="intermembrane-space">intermembrane space</dfn> between them is only about 15 nm wide.\nA glucose molecule is about 1 <dfn data-w="nanometre">nanometre</dfn> (nm) across: this mitochondrion is 700 times wider.\nIn this place everything is drawn at its true size compared with everything else, so to see glucose and the two membranes, you zoom in.\n<mark class="do">Press 🔍 Zoom in, beside the ring of light on its edge.</mark>',
        p: [['hl', 'B2.2.4', 'Adaptations for making ATP: a double membrane with a small volume of intermembrane space (so a few pumped protons give a high concentration), the large surface area of the cristae, and the enzymes and substrates of the Krebs cycle kept together in the matrix.']] },
      { ch: 2, text: 'You are at the edge of the mitochondrion. The bar at the bottom left shows the scale.\nAbove is the <dfn data-w="cytosol">cytosol</dfn>; below, the outer membrane: a phospholipid bilayer, with proteins in it.\nIn the cytosol, <dfn data-w="glycolysis">glycolysis</dfn> converts each glucose molecule (6C) into two <dfn data-w="pyruvate">pyruvate</dfn> molecules (3C), in ten steps. Here one press stands for all ten.\n<mark class="do">Press the glucose.</mark>',
        p: [['hl', 'C1.2.8', '<dfn data-w="glycolysis">Glycolysis</dfn> converts glucose (6C) into two <dfn data-w="pyruvate">pyruvate</dfn> (3C), in the cytosol, in ten steps, each catalysed by a different enzyme: phosphorylation, lysis, oxidation and ATP formation. Net yield per glucose: 2 ATP and 2 reduced NAD.']] },
      { ch: 3, text: 'The two pyruvate molecules pass through the two membranes into the matrix: through porin, a <dfn data-w="channel-protein">channel protein</dfn>, then the pyruvate carrier, a <dfn data-w="carrier-protein">carrier protein</dfn>.\nOne glucose molecule needs six oxygen molecules.\n<mark class="do">Press the two pyruvate molecules, then the oxygen,</mark> to move them into the mitochondrion.',
        p: [['sl', 'B2.1.6', 'The channel protein is porin: pyruvate crosses the outer membrane through its wide pore, by facilitated diffusion.'],
        ['x', '', 'The carrier protein in the inner membrane is the mitochondrial pyruvate carrier: it carries a hydrogen ion in with each pyruvate. Reduced NAD from glycolysis cannot cross the inner membrane: only its electrons enter, by a shuttle.']] },
      { ch: 4, text: 'In the matrix, the <dfn data-w="link-reaction">link reaction</dfn> and the <dfn data-w="krebs-cycle">Krebs cycle</dfn> oxidize the pyruvate, step by step; an <dfn data-w="enzyme">enzyme</dfn> catalyses each step. Watch what is produced.',
        p: [['hl', 'C1.2.11', 'The link reaction: each pyruvate is decarboxylated and oxidized, and its acetyl group (2C) joins coenzyme A: acetyl CoA.'],
        ['hl', 'C1.2.12', 'The Krebs cycle: the acetyl group joins oxaloacetate (4C) to form citrate (6C). Four oxidations and two decarboxylations give oxaloacetate back.']] },
      { ch: 6, text: 'Reduced NAD and FADH₂ pass electrons from this hydrogen to the <dfn data-w="electron-transport-chain">electron transport chain</dfn>, in the inner membrane of the cristae.\nAs the electrons flow along the chain, the energy released pumps protons (<dfn data-w="hydrogen-ion">hydrogen ions</dfn>) into the intermembrane space.\nWatch the protons collect there. Then <mark class="do">press the oxygen</mark> to send it to the end of the chain: oxygen is the terminal electron acceptor.',
        p: [['hl', 'C1.2.13, C1.2.14', 'Reduced NAD passes a pair of electrons to the first carrier of the electron transport chain. As the electrons flow along the chain, the energy released pumps protons (hydrogen ions) into the intermembrane space: a <dfn data-w="proton-gradient">proton gradient</dfn>.'],
        ['hl', 'C1.2.16', 'Oxygen is the terminal electron acceptor: it accepts electrons and protons, so water is produced and the electrons can keep flowing.']] },
      { ch: 6, text: 'Now the concentration of protons is high in the intermembrane space and low in the matrix: a <dfn data-w="proton-gradient">proton gradient</dfn>.\nThe phospholipid bilayer is a barrier to ions, as a dam (a wall across a river) holds water.\nProtons can diffuse back into the matrix only through <dfn data-w="atp-synthase">ATP synthase</dfn>: this is <dfn data-w="chemiosmosis">chemiosmosis</dfn>.\nAs they flow through, a ring inside it turns, like a watermill (a wheel that water turns), and ATP synthase phosphorylates ADP to <dfn data-w="atp">ATP</dfn>.',
        p: [['hl', 'C1.2.15', '<dfn data-w="chemiosmosis">Chemiosmosis</dfn>: protons flow back through ATP synthase, down the gradient, and the energy released phosphorylates ADP to ATP.']] },
      { ch: 7, text: '<span class="eq"><b class="eq-g">glucose</b> + <b class="eq-o">oxygen</b> → <b class="eq-c">carbon dioxide</b> + <b class="eq-w">water</b></span>\nAerobic respiration: <b>carbon dioxide</b> and <b>water</b> are produced, and the energy released makes ATP: about 30–32 ATP per glucose.\nATP supplies the energy for the work of the cell: to join amino acids, to make lipids and to move vesicles.\nThe whole story, molecule by molecule: <b>🧬 IB extension: from glucose to ATP</b>, at the end of this place.',
        p: [['sl', 'C1.2.5', 'Aerobic respiration yields many more ATP per glucose than anaerobic respiration, which yields only the 2 ATP of glycolysis.'],
        ['x', '', 'Measured: about 30–32 ATP per glucose (older books say 36–38).']] }
    ],
    explore: '🧬 IB extension: from glucose to ATP',
    fact: { text: 'Mitochondria have their own small piece of DNA. You inherit all of it from your mother.', src: 'MedlinePlus Genetics, Mitochondrial DNA (US National Library of Medicine)' }
  },
  nucleus: {
    part: 4, task: 'game-nucleus', title: 'Nucleus', kind: 'Organelle: two membranes, with pores', y7: true, def: 'nucleus',
    needs: [], gives: ['mrna'],
    intro: 'The <dfn data-w="nucleus">nucleus</dfn> contains the genetic material (<dfn data-w="dna">DNA</dfn>) and controls the activities of the cell. The DNA is in 46 long threads, the <dfn data-w="chromosome">chromosomes</dfn>.\nTwo membranes surround the nucleus, the <dfn data-w="nuclear-envelope">nuclear envelope</dfn>, with holes in them: the <dfn data-w="nuclear-pore">nuclear pores</dfn>.',
    steps: [
      { play: 'enter', text: 'You become even smaller, and you enter the nucleus through a nuclear pore: a hole through both membranes, with a ring of proteins in it.\n<mark class="do">Press Enter through a nuclear pore.</mark>' },
      { play: 'findchr', text: 'In a cell that is not dividing, every chromosome is a long, thin thread. (Chromosomes look like an X only when a cell divides.)\nA <dfn data-w="gene">gene</dfn> is a short section of DNA that carries the instructions for making one <dfn data-w="protein">protein</dfn>. The amylase gene is on chromosome 1, the largest kind of chromosome.\n<mark class="do">Press the threads to find chromosome 1.</mark>' },
      { play: 'pack', text: 'Many books draw a chromosome as an X. A chromosome looks like an X only for a short time, when a cell divides. Your cell is not dividing, so this step shows you a picture of a cell that is.\n<mark class="do">Press Second thread, then Pack: see how the thread of chromosome 1 becomes an X. Then press Loosen.</mark>\n(In the nucleus the game draws each thread about three times thicker than it is, so that you can see it.)' },
      { play: 'findgene', text: '<mark class="do">Press the glowing section: the amylase gene.</mark>' },
      { play: 'copy', text: 'The DNA never leaves the nucleus. The cell makes a copy of the gene instead, called <dfn data-w="mrna">mRNA</dfn> (messenger RNA).\n<mark class="do">Press Copy to make the copy.</mark>\n<span class="step__x"><b>Explorer · beyond the Year 7 list.</b> Making a copy of a gene like this has a name: <dfn data-w="transcription">transcription</dfn>. <b>🔬 How a cell copies a gene</b> shows it step by step. When you finish it, the copy is made.</span>' },
      { play: 'export', text: '<mark class="do">Choose how the copy leaves the nucleus.</mark>' }
    ],
    /* the course layers of this place (12 Nov 2026; Daniel: "you can add a toggle for IGCSE and a toggle for IB … be
       specific for IGCSE students and IB"): shown by the panel's "Your course: IGCSE · IB" switches once every Year 7
       check of the place is right (quest.js courseSwitch); the Year 7 words above never change. One entry per step, in
       the steps' order (null: the course says nothing about what that step shows). Each line: [level, statement, words].
       IGCSE: Cambridge 0610, syllabus for 2026 to 2028 (labs-shared/syllabus.json): 'c' Core, 's' Supplement, 'n' a
       note on what the syllabus does not name. IB: the DP Biology guide, first assessment 2025: 'sl' under "SL and HL",
       'hl' under "Additional higher level", 'x' beyond the guide. Every statement number was read in its source
       (tools/course-check.mjs checks each one again); the words follow the source's own. `film`: a door to the film
       that shows the step in detail. No line says what an examination will or will not ask. */
    course: {
     "igcse": [
      {
       "p": [
        [
         "c",
         "2.1.1",
         "The nucleus is in the list of cell structures that you describe and compare: cell membrane, nucleus, cytoplasm, ribosomes, mitochondria and, in plant cells, cell wall, chloroplasts and vacuoles."
        ],
        [
         "n",
         "",
         "The nuclear envelope and the nuclear pores are not in that list."
        ]
       ]
      },
      {
       "p": [
        [
         "c",
         "17.1.1",
         "Chromosomes are made of DNA, which contains genetic information in the form of genes."
        ],
        [
         "c",
         "17.1.2",
         "A gene is a length of DNA that codes for a protein."
        ],
        [
         "s",
         "17.1.11, 17.1.12",
         "A diploid nucleus contains two sets of chromosomes. In a human diploid cell there are 23 pairs: the 46 threads of this nucleus."
        ]
       ]
      },
      {
       "p": [
        [
         "s",
         "17.2.3",
         "The exact replication of chromosomes occurs before mitosis: the second thread of this step."
        ],
        [
         "s",
         "17.2.4",
         "During mitosis, the copies of chromosomes separate, maintaining the chromosome number in each daughter cell."
        ],
        [
         "s",
         "17.2.1",
         "Mitosis is nuclear division giving rise to genetically identical cells. The syllabus says: \"details of the stages of mitosis are not required\"."
        ]
       ]
      },
      {
       "p": [
        [
         "s",
         "17.1.5",
         "The sequence of bases in a gene determines the sequence of amino acids used to make a specific protein."
        ],
        [
         "s",
         "17.1.9",
         "Most body cells in an organism contain the same genes, but many genes in a particular cell are not expressed, because the cell only makes the specific proteins it needs. A cell of a salivary gland expresses the amylase gene."
        ]
       ]
      },
      {
       "p": [
        [
         "s",
         "17.1.8",
         "The gene coding for the protein remains in the nucleus. Messenger RNA (mRNA) is a copy of a gene. mRNA molecules are made in the nucleus."
        ],
        [
         "s",
         "4.1.4",
         "A DNA molecule is two strands coiled together to form a double helix. Each strand contains chemicals called bases. Bonds between pairs of bases hold the strands together. The bases always pair up in the same way: A with T, and C with G."
        ],
        [
         "n",
         "",
         "The syllabus says: \"knowledge of the details of transcription or translation is not required\". The film shows how it happens."
        ]
       ],
       "film": "copy"
      },
      {
       "p": [
        [
         "s",
         "17.1.8",
         "mRNA molecules move from the nucleus to the cytoplasm."
        ]
       ]
      }
     ],
     "ib": [
      {
       "p": [
        [
         "sl",
         "A2.2.6",
         "The nucleus has a double membrane with pores, and its chromosomes are made of DNA bound to histones."
        ],
        [
         "hl",
         "B2.2.6",
         "The pores are needed: mRNA and the parts of ribosomes leave through them, and proteins enter. During mitosis and meiosis the nuclear membrane breaks into vesicles."
        ],
        [
         "sl",
         "B2.2.2",
         "The nucleus separates transcription from translation: mRNA can be modified before it meets ribosomes in the cytoplasm. In prokaryotes this is not possible."
        ]
       ]
      },
      {
       "p": [
        [
         "sl",
         "A1.2.1",
         "DNA is the genetic material of all living organisms."
        ],
        [
         "hl",
         "A1.2.13",
         "A nucleosome is a DNA molecule wrapped around a core of eight histone proteins, held together by an additional histone protein attached to linker DNA. The film of the copy step shows the nucleosomes of this thread."
        ]
       ]
      },
      {
       "p": [
        [
         "sl",
         "D2.1.5",
         "DNA replication is a prerequisite for mitosis and for meiosis. After replication, each chromosome consists of two elongated DNA molecules (chromatids), held together until anaphase: the two threads of this step, joined in the middle."
        ],
        [
         "sl",
         "D2.1.6",
         "Chromosomes condense in mitosis and in meiosis: histones condense the DNA by supercoiling. Microtubules and microtubule motors then move the chromosomes."
        ]
       ]
      },
      {
       "p": [
        [
         "sl",
         "D1.2.4",
         "Not all genes in a cell are expressed at any given time. Transcription is the first stage of gene expression, and a key stage at which the expression of a gene can be switched on and off."
        ]
       ]
      },
      {
       "p": [
        [
         "sl",
         "D1.2.1",
         "Transcription is the synthesis of RNA using a DNA template. RNA polymerase separates the two DNA strands and joins the RNA nucleotides into one strand."
        ],
        [
         "sl",
         "D1.2.2",
         "Complementary base pairing and hydrogen bonding: each RNA nucleotide pairs with the complementary base of the DNA template strand. Adenine (A) on the template strand pairs with uracil (U) on the RNA strand."
        ],
        [
         "sl",
         "D1.2.3",
         "The single DNA strand is only a template: its base sequence does not change when it is transcribed."
        ],
        [
         "hl",
         "D1.2.12",
         "Transcription is 5′ to 3′: each RNA nucleotide is added to the 3′ end of the growing RNA strand."
        ],
        [
         "hl",
         "D1.2.13",
         "Transcription is initiated at the promoter, a base sequence just before the start of the gene. Transcription factors bind to it; then RNA polymerase can bind."
        ]
       ],
       "film": "copy"
      },
      {
       "p": [
        [
         "hl",
         "D1.2.15",
         "Post-transcriptional modification in eukaryotic cells: introns are removed and exons are spliced together to form mature mRNA, and a 5′ cap and a 3′ polyA tail are added, which stabilize the mRNA. This happens in the nucleus, before the mRNA leaves."
        ],
        [
         "x",
         "",
         "The game shows the copy leaving as one finished strand: it does not show the modification."
        ]
       ]
      }
     ]
    },
    done: 'You carry the copy of the amylase gene. Next it needs a <b>ribosome</b>: the nucleolus makes the parts of ribosomes.',
    explore: '🔬 Explorer: how a cell copies a gene',
    again: '↺ Dive through a nuclear pore again',   /* the end card's button: the dive again (play.js dive-again; Daniel, 9 Nov 2026) */
    fact: { text: 'The DNA in one of your cells is about 2 metres long, but it fits into a nucleus about 6 µm across.', src: 'Annunziato 2008, Nature Education 1:26 (open)' },
    fact2: { text: 'Some people have more copies of the amylase gene than others. People from groups that have eaten foods rich in starch for thousands of years have more copies, on average.', src: 'Perry et al. 2007, Nature Genetics 39:1256' }
  },
  nucleolus: {
    part: 5, task: 'game-nucleolus', title: 'Nucleolus', kind: 'Not an organelle: no membrane', def: 'nucleolus',
    needs: [], gives: ['parts'], inside: 'nucleus',
    intro: 'The <dfn data-w="nucleolus">nucleolus</dfn> is a dense region inside the nucleus. It makes the two parts of <dfn data-w="ribosome">ribosomes</dfn>, a small part and a large part.\nEach part is made of <dfn data-w="rna">RNA</dfn> (a molecule like DNA), which the nucleolus makes, and <dfn data-w="protein">proteins</dfn>, which enter the nucleus from the cytoplasm.\nIt has no membrane, so it is not an organelle.',
    steps: [
      { play: 'small', text: '<mark class="do">Press Build to make the small part.</mark>' },
      { play: 'large', text: '<mark class="do">Press Build to make the large part.</mark>' },
      { play: 'out', text: 'The two parts leave the nucleus separately, through nuclear pores. They join only in the cytoplasm, on a copy of a gene.\n<mark class="do">Press each part: it leaves through a nuclear pore.</mark>' }
    ],
    done: 'You carry the two ribosome parts.',
    fact: { text: 'A growing human cell can make thousands of ribosome parts every minute.', src: 'Lewis and Tollervey 2000, Science 288:1385' }
  },
  ribosome: {
    part: 6, task: 'game-ribosome', title: 'Ribosomes', onPic: 'Ribosome', plural: true, kind: 'Not an organelle: no membrane', y7: true, def: 'ribosome',
    needs: ['mrna', 'parts', 'amino', 'energy'], gives: ['chain'],
    intro: '<dfn data-w="ribosome">Ribosomes</dfn> are very small structures where proteins are made. A ribosome reads the copy of a gene and joins amino acids in the order the copy gives.\nA <dfn data-w="protein">protein</dfn> is a long chain of amino acids.\nThis place is in the <dfn data-w="cytosol">cytosol</dfn>, just beside the rough ER: many ribosomes work on its membrane.\nFrom very near, everything here is drawn at its true size: a ribosome is about 30 nm across (30 millionths of a millimetre). On the map, ribosomes are drawn about four times larger, so that you can see them.\nRibosomes have no membrane, so they are not organelles.\nWhen the picture is still, press <b>As it really is</b> at the bottom of the picture: it shows how packed the cell really is.',
    steps: [
      { play: 'assemble', text: '<mark class="do">Press Join:</mark> the small part attaches to the copy, then the large part joins it. Now it is a whole ribosome.' },
      { play: 'translate', text: 'The copy is a code: each part of the code means one amino acid. Each amino acid arrives on a small carrier molecule.\n<mark class="do">Press the carrier that matches the code under the ribosome.</mark>\nEvery amino acid you join uses some energy.\n<span class="step__x"><b>Explorer · beyond the Year 7 list.</b> The ribosome reads the code of the copy and joins amino acids in that order. This has a name: <dfn data-w="translation">translation</dfn>.</span>' },
      { play: 'where', text: 'The first part of the amylase chain is a <b>signal</b>: it means that this protein must be made on the rough ER. Proteins that the cell releases are made there.\n<mark class="do">Choose where this ribosome must work.</mark>' }
    ],
    course: {
     "igcse": [
      {
       "p": [
        [
         "c",
         "2.1.1, 2.1.4",
         "Ribosomes are in the list of cell structures: they are where proteins are made (protein synthesis)."
        ],
        [
         "n",
         "",
         "The syllabus does not name the two parts of a ribosome."
        ]
       ]
      },
      {
       "p": [
        [
         "s",
         "17.1.8",
         "The mRNA passes through ribosomes. The ribosome assembles amino acids into protein molecules. The specific sequence of amino acids is determined by the sequence of bases in the mRNA."
        ],
        [
         "c",
         "4.1.2",
         "Proteins are large molecules made from smaller molecules: amino acids."
        ],
        [
         "n",
         "",
         "The syllabus says: \"knowledge of the details of transcription or translation is not required\". The film shows how it happens."
        ]
       ],
       "film": "ribo"
      },
      {
       "p": [
        [
         "n",
         "",
         "The IGCSE syllabus for 2026 to 2028 does not name the rough ER. Its list of cell structures has ribosomes."
        ]
       ]
      }
     ],
     "ib": [
      {
       "p": [
        [
         "sl",
         "B2.2.1",
         "In the IB guide, ribosomes and vesicles are organelles. The Year 7 list calls a structure an organelle only if it has a membrane of its own."
        ],
        [
         "sl",
         "D1.2.6",
         "mRNA binds to the small subunit of the ribosome. Two tRNAs can bind at the same time to the large subunit."
        ],
        [
         "hl",
         "D1.2.17",
         "Initiation of translation: the small subunit attaches to the 5′ terminal of the mRNA and moves to the start codon; the initiator tRNA binds; the large subunit attaches; then a second tRNA binds."
        ]
       ]
      },
      {
       "p": [
        [
         "sl",
         "D1.2.5",
         "Translation is the synthesis of polypeptides from mRNA: the base sequence of the mRNA is translated into the amino acid sequence of a polypeptide."
        ],
        [
         "sl",
         "D1.2.7",
         "Each carrier of the game is a transfer RNA (tRNA). Its anticodon, three bases, pairs with a codon of the mRNA by complementary base pairing. The shapes of the game stand for that fit."
        ],
        [
         "sl",
         "D1.2.10",
         "The ribosome moves along the mRNA one codon at a time, and links each amino acid to the growing polypeptide chain by a peptide bond."
        ],
        [
         "hl",
         "D1.2.17",
         "During elongation the ribosome has three binding sites for tRNA: A, P and E."
        ]
       ],
       "film": "ribo"
      },
      {
       "p": [
        [
         "hl",
         "B2.2.7",
         "Free ribosomes synthesize proteins for retention in the cell. Ribosomes bound to the rough endoplasmic reticulum synthesize proteins for transport within the cell and for secretion. Amylase is secreted."
        ],
        [
         "x",
         "",
         "The signal is a short sequence of amino acids at the start of the polypeptide: a signal sequence."
        ]
       ]
      }
     ]
    },
    done: 'Your ribosome is at the <b>rough ER</b>, with the start of the chain.',
    fact: { text: 'Electron micrographs showed one small box of a HeLa cell (a human cell grown in laboratories), only 7.5 × 4.6 × 7.5 µm. In it, a computer program found 553 130 ribosomes.', src: 'OpenOrganelle, dataset jrc_hela-2 (Xu et al. 2021, Nature 599:147; Heinrich et al. 2021, Nature 599:141)' },
    fact2: { text: 'The part of a ribosome that joins amino acids together is made of <dfn data-w="rna">RNA</dfn>, not protein.', src: 'Nissen et al. 2000, Science 289:920' }
  },
  rer: {
    part: 7, task: 'game-rer', title: 'Rough ER', kind: 'Organelle: flattened sacs of membrane', def: 'rough-er',
    needs: ['chain'], gives: ['amylase'], alsoNeeds: ['lipids'],
    intro: 'The <dfn data-w="rough-er">rough ER</dfn> (rough endoplasmic reticulum) is a network of flattened sacs, joined to the nucleus. The ribosomes on its surface make it look rough. (On the map they are drawn about four times larger, so that you can see them; from very near, everything is at its true size.)\nThe <dfn data-w="protein">proteins</dfn> they make go inside the rough ER, where they fold into their shape.\nWhen the picture is still, press <b>As it really is</b> at the bottom of the picture: it shows how packed the cell really is.',
    steps: [
      { play: 'dock', text: '<mark class="do">Press Dock:</mark> because of the signal, the ribosome is taken to a channel in the membrane of the rough ER, a tunnel through the membrane.' },
      { play: 'grow', text: 'The ribosome joins more amino acids. The chain goes through the channel and into the rough ER.\n<mark class="do">Press Go.</mark>' },
      { play: 'cut', text: 'While the chain is still growing, a cutting enzyme in the membrane of the rough ER removes the signal: the red start of the chain.\n<mark class="do">Press Go closer</mark> to see the signal. <mark class="do">Then press Cut.</mark>' },
      { play: 'fold', text: 'The chain cannot work yet: first it must fold into its shape.\n<mark class="do">Press Fold.</mark> The camera goes closer, so that you can see every bead: each bead is one amino acid.\nWhen the chain has folded, look for a groove in it. This groove is the <dfn data-w="active-site">active site</dfn>, where a short part of a starch chain fits: the shape is what lets amylase work.' },
      { play: 'bud', text: 'Amylase leaves the rough ER in a vesicle, a small bubble of membrane: a piece of the membrane of the rough ER bends round amylase and closes.\nSo every vesicle removes some membrane, and the rough ER needs new <dfn data-w="lipid">lipids</dfn>.\n<mark class="do">Press Bud to make a vesicle.</mark>' }
    ],
    course: {
     "igcse": [
      {
       "p": [
        [
         "n",
         "",
         "The IGCSE syllabus for 2026 to 2028 does not name the rough ER or the channel. It names vesicles only at a synapse (14.1.8). Its list of cell structures has ribosomes."
        ]
       ]
      },
      {
       "p": [
        [
         "s",
         "17.1.8",
         "The ribosome assembles amino acids into protein molecules."
        ]
       ]
      },
      null,
      {
       "p": [
        [
         "s",
         "17.1.6",
         "Different sequences of amino acids give different shapes to protein molecules."
        ],
        [
         "c",
         "5.1.2",
         "Enzymes are proteins that are involved in all metabolic reactions, where they function as biological catalysts."
        ],
        [
         "c",
         "5.1.4",
         "The shape of the active site of an enzyme is complementary to its substrate. For amylase the substrate is starch."
        ],
        [
         "s",
         "5.1.7",
         "An enzyme is specific because of the complementary shape and fit of its active site with its substrate."
        ],
        [
         "s",
         "17.1.7",
         "DNA controls cell function by controlling the production of proteins, including enzymes."
        ]
       ]
      },
      null
     ],
     "ib": [
      {
       "p": [
        [
         "sl",
         "A2.2.6",
         "Eukaryote cells have membrane-bound organelles in their cytoplasm, including endoplasmic reticulum, a Golgi apparatus and vesicles."
        ],
        [
         "hl",
         "B2.2.7",
         "Ribosomes bound to the rough endoplasmic reticulum synthesize proteins for transport within the cell and for secretion."
        ]
       ]
      },
      {
       "p": [
        [
         "sl",
         "B1.2.2",
         "Amino acids are linked by condensation reactions: each new peptide bond releases one molecule of water."
        ],
        [
         "sl",
         "B1.2.4",
         "20 amino acids are coded for in the genetic code. A peptide chain can have any number of them, in any order. The chain of amylase has 496 amino acids once its signal is removed."
        ]
       ]
      },
      {
       "p": [
        [
         "hl",
         "D1.2.18",
         "Many polypeptides must be modified before they can function. Removing a signal sequence is one modification. The example of the guide is the two-stage modification of pre-proinsulin to insulin: its first stage, in the rough ER, also removes a signal sequence."
        ]
       ]
      },
      {
       "p": [
        [
         "hl",
         "B1.2.7",
         "Primary structure: the sequence of amino acids, and the position of each one, determines the three-dimensional shape of a protein. So the same chain folds into the same precise shape every time."
        ],
        [
         "hl",
         "B1.2.8",
         "Secondary structure: parts of the chain coil into alpha helices, and parts form beta-pleated sheets, stabilized by hydrogen bonding in regular positions. Amylase has both."
        ],
        [
         "hl",
         "B1.2.9",
         "Tertiary structure depends on hydrogen bonds, ionic bonds, disulfide covalent bonds (between pairs of cysteines) and hydrophobic interactions, all between R-groups."
        ],
        [
         "hl",
         "B1.2.10",
         "Amylase is soluble in water: in such proteins the hydrophobic amino acids are clustered in the core."
        ],
        [
         "hl",
         "B1.2.12",
         "Amylase is a globular protein: its rounded shape, with an active site, suits its function as an enzyme."
        ]
       ]
      },
      {
       "p": [
        [
         "sl",
         "B2.2.1",
         "In the IB guide, a vesicle is an organelle."
        ],
        [
         "hl",
         "B2.2.9",
         "Vesicles transport materials within the cell. The guide includes the role of clathrin in the formation of vesicles."
        ],
        [
         "x",
         "",
         "The vesicles that leave the rough ER have another coat protein (COPII). Clathrin coats vesicles that form at the cell membrane and at the Golgi apparatus."
        ],
        [
         "hl",
         "B2.2.8",
         "The Golgi apparatus processes proteins and prepares them for secretion: the next place of your mission."
        ]
       ]
      }
     ]
    },
    done: 'A vesicle carries your amylase to the <b>Golgi apparatus</b>.',
    fact: { text: 'In a pancreas cell of a guinea pig, which makes digestive enzymes, 60 % of all its membrane is rough ER, and less than 1 % is smooth ER.', src: 'Bolender 1974, Journal of Cell Biology 61:269; Alberts et al., Molecular Biology of the Cell, 4th edition, table 12-2' }
  },
  ser: {
    part: 8, task: 'game-ser', title: 'Smooth ER', kind: 'Organelle: a network of tubes', def: 'smooth-er',
    needs: ['energy'], gives: ['lipids'],
    intro: 'The <dfn data-w="smooth-er">smooth ER</dfn> is a network of tubes with no ribosomes. It makes <dfn data-w="lipid">lipids</dfn> (fats, oils and similar molecules).\nA membrane is two layers of lipids, with <dfn data-w="protein">proteins</dfn> in it. Every new <dfn data-w="vesicle">vesicle</dfn> removes a piece of the ER membrane, so the ER needs new lipids.\nThe rough ER and the smooth ER are one joined membrane, so new lipids spread from one to the other. This cell has only a little smooth ER.',
    steps: [
      { play: 'lipid', text: 'You look into one tube of the smooth ER, cut across. The ring is its membrane: two layers of lipids. Behind it, the tube runs on.\nA membrane lipid has a head and two tails.\n<mark class="do">Press Join three times</mark> to make three lipids. Each one uses some energy.' },
      { play: 'layer', text: 'The new lipids join the membrane of the ER: two layers, with their tails inside. The ER is one joined membrane, so they spread through it to the rough ER.\n<mark class="do">Press Add to the membrane.</mark>' }
    ],
    done: 'The ER membrane has new lipids, so the rough ER can make vesicles.',
    fact: { text: 'In your liver cells, a lot of smooth ER helps to make some drugs and poisons harmless.', src: 'Alberts et al., Molecular Biology of the Cell, 4th edition, chapter 12 (free at NCBI Bookshelf)' }
  },
  golgi: {
    part: 9, task: 'game-golgi', title: 'Golgi apparatus', kind: 'Organelle: a stack of flattened sacs', def: 'golgi',
    needs: ['amylase'], gives: ['packed'],
    intro: 'The <dfn data-w="golgi">Golgi apparatus</dfn> is a stack of flattened, curved sacs. It modifies <dfn data-w="protein">proteins</dfn> (for example, it adds sugars to some of them), sorts them, and packages them into vesicles.\nVesicles from the rough ER join it on one side; new vesicles leave from the other side.',
    steps: [
      { play: 'join', text: '<mark class="do">Press Join:</mark> the vesicle joins the first sac of the stack.' },
      { play: 'through', text: 'Your amylase moves through the stack, sac by sac.\n<mark class="do">Press Next sac until it reaches the last one.</mark>' },
      { play: 'sortgame', text: 'Enzymes for a <dfn data-w="lysosome">lysosome</dfn> (a small sac of enzymes that digest old parts of the cell) carry a label that sends them there.\nAmylase has no label: amylase molecules join together and are packed into large vesicles, which leave the cell.\n<mark class="do">Press each protein, then the vesicle where it belongs.</mark>' },
      { play: 'package', text: 'A new vesicle forms, tightly packed with amylase molecules.\n<mark class="do">Press Package.</mark>' }
    ],
    done: 'You carry a vesicle packed with amylase. It must reach the top of the cell, next to the duct.',
    fact: { text: 'Camillo Golgi saw it in 1898, in nerve cells. For about 50 years many scientists thought it was a mistake made by his stain, until electron microscopes showed it in the 1950s.', src: 'Dröscher 1998, Histochemistry and Cell Biology 109:425' }
  },
  tracks: {
    part: 10, task: 'game-tracks', title: 'Microtubules', onPic: 'Microtubule', plural: true, kind: 'Not an organelle: no membrane', def: 'microtubule',
    needs: ['packed', 'energy'], gives: ['top'],
    intro: '<dfn data-w="microtubule">Microtubules</dfn> are thin hollow tubes made of <dfn data-w="protein">protein</dfn>. They are like tracks: <dfn data-w="motor-protein">motor proteins</dfn> walk along them, one step at a time, and carry vesicles.\nMicrotubules have no membrane, so they are not organelles.\nIn this cell most microtubules start at the top of the cell and grow towards the base. The motor protein on your vesicle walks towards their top end.',
    steps: [
      { play: 'grab', text: 'Nothing here is drawn bigger than it is. So the camera comes very close to the microtubule next to your vesicle: it is only 25 <dfn data-w="nanometre">nanometres</dfn> (nm) wide.\nScientists found dynein, a <dfn data-w="motor-protein">motor protein</dfn>, on vesicles like yours in the pancreas, another gland. So the motor protein here is probably dynein.\nEach of its two heads is a ring, 14 nm across.\nYour vesicle is 900 nm across. The dots in it are amylase molecules, each 8 nm long: a real vesicle is full of them.\n<mark class="do">Press Attach:</mark> dynein\'s two heads hold the microtubule.' },
      { play: 'maze', text: 'From far away the motor protein is too small to see: the glow shows where it is. The game draws the microtubules three times thicker, so that you can see them.\nEach step uses energy. Where two microtubules cross, the vesicle can step onto the other one.\n<mark class="do">At each crossing, choose the microtubule that leads to the top of the cell.</mark>' }
    ],
    done: 'Your vesicle waits at the top of the cell, with the others.',
    fact: { text: 'In a test tube at body temperature (37 °C), dynein with dynactin moves about 900 nanometres every second: about the width of your vesicle.', src: 'McKenney et al. 2014, Science 345:337' },
    fact2: { text: 'Scientists are still studying which motor proteins carry these vesicles in gland cells.', src: 'Kraemer et al. 1999, European Journal of Cell Biology 78:265' }
  },
  exit: {
    part: 11, task: 'game-exit', title: 'Cell membrane: the way out', kind: 'The cell membrane: part of every cell', y7: true, def: 'cell-membrane',
    needs: ['top'], gives: ['saliva'],
    intro: 'The vesicles wait at the top of the cell.\nWhen you smell or taste food, nerves send a message to your salivary glands. The message makes the vesicles join the cell membrane and release their amylase.',
    steps: [
      { play: 'smell', text: '<mark class="do">Press Taste the bread.</mark>\nA nerve ending next to the cell releases a chemical, and the message spreads through the cell.' },
      { play: 'fuse', text: 'The vesicle joins the cell membrane and opens to the outside.\n<mark class="do">Press Release.</mark>\nThis is <dfn data-w="exocytosis">exocytosis</dfn> (exo = out, cyto = cell).' },
      { play: 'flatten', watch: false, text: 'The amylase leaves the cell and enters the duct. The membrane of the vesicle becomes part of the cell membrane.\nLater, new vesicles form from this membrane and return inside the cell, so the membrane is used again.' }
    ],
    done: 'Your amylase is in the saliva. Does it work? Test it.',
    fact: { text: 'Your salivary glands make between 1 and 1.5 litres of saliva every day.', src: 'de Almeida et al. 2008, Journal of Contemporary Dental Practice 9(3):72' },
    fact2: { text: 'Amylase is one of the most common <dfn data-w="protein">proteins</dfn> in your saliva.', src: 'Peyrot des Gachons and Breslin 2016, Current Diabetes Reports 16:102' }
  },
  test: {
    part: 12, task: 'game-test', title: 'Does your amylase work?', tag: 'The test',
    needs: ['saliva'], gives: [],
    intro: 'In a food test, <dfn data-w="iodine">iodine solution</dfn> turns blue-black when <dfn data-w="starch">starch</dfn> is present.\nIf amylase has digested the starch into a sugar (maltose), the iodine solution stays orange-brown.',
    steps: [
      { play: 'wells', text: 'Two wells of a spotting tile hold starch solution.\n<mark class="do">Press Add saliva for well A, and Add water for well B.</mark>\nWell B is the control: it is the same as well A, but with water instead of saliva.' },
      { play: 'wait', text: '<mark class="do">Press Wait 5 minutes.</mark>' },
      { play: 'iodine', text: 'Now test both wells for starch.\n<mark class="do">Press Add iodine solution.</mark>' }
    ],
    done: 'Well A stays orange-brown: there is no starch left, because your amylase digested it.\nWell B turns blue-black: water has no amylase, so the starch is still there.\n<b>Mission complete.</b>',
    fact: { text: 'Chew a piece of bread for a minute: it starts to taste a little sweet. That is your amylase, digesting starch into sugar.' }
  }
};

/* the map's order for keyboards and phones (the list of places), and where the game starts */
window.PLACE_ORDER = ['wayin', 'nucleus', 'nucleolus', 'mito', 'ribosome', 'ser', 'rer', 'golgi', 'tracks', 'exit', 'test'];
