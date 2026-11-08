/* ============================================================
   story.js — the words of the Y7 cell game (4 Nov 2026): each place of the cell, what it is, what the pupil does there,
   and what they bring away. The behaviour of each step (`play`) is in js/game/play.js; the checks of each place are in
   js/questions.js; the board's parts and the game squares (TASKS) are here.
   The biology (memory biology-before-pedagogy: every step true):
   - one serous cell of a salivary gland makes amylase (511 amino acids; a 15-amino-acid signal at its start, UniProt
     P0DUB6) and releases it by exocytosis into the duct, when a nerve message arrives (regulated secretion);
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
  { n: 13, title: 'Final check', test: true }
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
  'game-test':      { part: 12, title: 'Game: tested the amylase on starch' }
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
      { play: 'simple', text: 'In Year 7 you learn five parts of an animal <dfn data-w="cell">cell</dfn>: the <dfn data-w="cell-membrane">cell membrane</dfn>, the <dfn data-w="cytoplasm">cytoplasm</dfn>, the <dfn data-w="nucleus">nucleus</dfn>, the <dfn data-w="mitochondria">mitochondria</dfn> and the <dfn data-w="ribosome">ribosomes</dfn>.\nIn the cell around you, only these five are lit now.' },
      { play: 'full', text: 'An <dfn data-w="electron-microscope">electron microscope</dfn> shows much more: it uses a beam of electrons instead of light, so it shows much smaller details.\n<mark class="do">Press Show everything.</mark>\nEach new structure appears with its name.' },
      { play: 'organelles', text: 'An <dfn data-w="organelle">organelle</dfn> is a membrane-bound structure (surrounded by a <dfn data-w="membrane">membrane</dfn>) with a specific function, such as the nucleus.\nSome structures have no membrane, so they are <b>not</b> organelles: the ribosomes, the nucleolus, the microtubules and the centrosome.\n<dfn data-w="vesicle">Vesicles</dfn>, small bubbles of membrane, last only a short time: each one forms, then joins another membrane. So they are not organelles either.\nThe <dfn data-w="cytoplasm">cytoplasm</dfn> is the <dfn data-w="cytosol">cytosol</dfn> (a jelly-like fluid) and the organelles in it, but not the nucleus.' },
      { play: 'mission', text: 'This cell is in your <dfn data-w="salivary-gland">salivary gland</dfn>. It makes <dfn data-w="amylase">amylase</dfn>, the <dfn data-w="enzyme">enzyme</dfn> in your saliva that digests <dfn data-w="starch">starch</dfn>.\n<b>Your mission: make amylase and release it from the cell.</b>\nIn this game, each place in the cell does one job. A place that is asleep wakes when you bring what it needs.' }
    ],
    done: 'You know the map. Two places are awake: <b>the nucleus</b> and <b>the way in</b>, at the base of the cell. Choose one.',
    fact: { text: 'Your body is made of about 37 trillion cells (37 000 000 000 000).', src: 'Bianconi et al. 2013, Annals of Human Biology 40:463' }
  },
  wayin: {
    part: 2, task: 'game-wayin', title: 'Cell membrane: the way in', kind: 'The cell membrane: part of every cell', y7: true, def: 'cell-membrane',
    needs: [], gives: ['glucose', 'oxygen', 'amino'],
    intro: 'You are at the base of the cell. Below its membrane are the <dfn data-w="tissue-fluid">tissue fluid</dfn> (the liquid round the cells) and a <dfn data-w="capillary">capillary</dfn> full of blood: red blood cells in the <dfn data-w="plasma">plasma</dfn>, the liquid part of the blood.\nThe cell needs <dfn data-w="glucose">glucose</dfn> and <dfn data-w="oxygen">oxygen</dfn> for respiration, and <dfn data-w="amino-acid">amino acids</dfn> to make <dfn data-w="protein">proteins</dfn>. The blood brings them.\nThe <dfn data-w="cell-membrane">cell membrane</dfn> controls what enters and leaves the cell.',
    steps: [
      { play: 'look', text: 'Here the membrane is drawn about 100 times bigger, so that you can see it: two layers of <dfn data-w="lipid">lipid</dfn> molecules, with proteins in them.\nAbove the membrane is the <b>inside</b> of the cell. Below it is the <b>outside</b>.' },
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
      { ch: 1, text: 'Here the membrane is drawn about 100 times bigger, so that you can see it: a <dfn data-w="phospholipid">phospholipid</dfn> bilayer, with proteins in it.\nAbove the membrane is the <b>inside</b> of the cell. Below it is the <b>outside</b>.',
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
    explore: '🧬 IB extension: from glucose to ATP',
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
      { play: 'minside', text: 'Inside, the inner membrane is folded. Its folds are the <dfn data-w="cristae">cristae</dfn> (one: a crista). Inside the inner membrane is a thick liquid, the <dfn data-w="matrix">matrix</dfn>.\nHere its two membranes look like one line: they are only 15 nm apart.\nA glucose molecule is about 1 <dfn data-w="nanometre">nanometre</dfn> (nm) across: this mitochondrion is 700 times wider. In this place everything is drawn at its true size compared with everything else, so to see glucose and the two membranes, you zoom in.\n<mark class="do">Press 🔍 Zoom in, beside the ring of light on its edge.</mark>' },
      { play: 'split', text: 'You are at the edge of the mitochondrion. The bar at the bottom left shows the scale. Above is the <dfn data-w="cytosol">cytosol</dfn>; below, the outer membrane: two layers of lipids, with proteins in it.\nIn the cytosol, each glucose molecule is first split into two smaller molecules.\n<mark class="do">Press the glucose to split it.</mark>' },
      { play: 'feed', text: 'The smaller molecules pass through the two membranes into the matrix: through a <dfn data-w="channel-protein">channel protein</dfn>, then a <dfn data-w="carrier-protein">carrier protein</dfn>. One glucose molecule needs six oxygen molecules.\n<mark class="do">Press the two smaller molecules, then the oxygen,</mark> to move them into the mitochondrion.' },
      { play: 'respire', text: 'In the matrix, <dfn data-w="enzyme">enzymes</dfn> break the smaller molecules down, step by step. Watch what is produced.' },
      { play: 'water', text: 'Hydrogen from the smaller molecules is carried to a chain of proteins in the folded inner membrane. The proteins use its energy to pump <dfn data-w="hydrogen-ion">hydrogen ions</dfn> into the space inside the fold.\nWatch the hydrogen ions collect there. Then <mark class="do">press the oxygen</mark> to send it to the last protein in the chain.' },
      { play: 'dam', text: 'Now there are many hydrogen ions inside the fold, and few in the matrix. The membrane stops them, as a dam (a wall across a river) stops water.\nThey can flow back into the matrix only through <dfn data-w="atp-synthase">ATP synthase</dfn>. As they flow through, a ring inside it turns, like a watermill (a wheel that water turns), and it makes <dfn data-w="atp">ATP</dfn>: a small molecule that carries energy.' },
      { play: 'release', text: '<span class="eq"><b class="eq-g">glucose</b> + <b class="eq-o">oxygen</b> → <b class="eq-c">carbon dioxide</b> + <b class="eq-w">water</b></span>\nAerobic respiration: <b>carbon dioxide</b> and <b>water</b> are produced, and energy is released. The cell uses this energy for its work: to join amino acids, to make lipids and to move vesicles.\nBeyond the Year 7 list: when every check of this place is right, <b>🧬 IB extension: from glucose to ATP</b> follows one glucose molecule to ATP, step by step.' }
    ],
    done: 'The energy bar is full. Every job of the cell uses some: when it is low, return here with more glucose and oxygen.',
    /* the IB switch (quest.js ibSwitch, once every check is right): what IB adds to each step, one sentence a level, and
       its chapter in "From glucose to ATP" (it replaced this place's Explorer film, 5 Nov 2026), and `text`: the step in IB terms */
    ib: [
      { ch: 0, p: [['sl', 'C1.2.5', 'Mitochondria are needed for aerobic respiration, but not for anaerobic respiration.']] },
      { ch: 3, text: 'Inside, the inner membrane is folded. Its folds are the <dfn data-w="cristae">cristae</dfn> (one: a crista). Inside the inner membrane is the <dfn data-w="matrix">matrix</dfn>, a fluid with the enzymes of the link reaction and the Krebs cycle.\nHere its two membranes look like one line: the <dfn data-w="intermembrane-space">intermembrane space</dfn> between them is only about 15 nm wide.\nA glucose molecule is about 1 <dfn data-w="nanometre">nanometre</dfn> (nm) across: this mitochondrion is 700 times wider. In this place everything is drawn at its true size compared with everything else, so to see glucose and the two membranes, you zoom in.\n<mark class="do">Press 🔍 Zoom in, beside the ring of light on its edge.</mark>',
        p: [['hl', 'B2.2.4', 'Adaptations for making ATP: a double membrane with a small volume of intermembrane space (so a few pumped protons give a high concentration), the large surface area of the cristae, and the enzymes and substrates of the Krebs cycle kept together in the matrix.']] },
      { ch: 2, text: 'You are at the edge of the mitochondrion. The bar at the bottom left shows the scale. Above is the <dfn data-w="cytosol">cytosol</dfn>; below, the outer membrane: a phospholipid bilayer, with proteins in it.\nIn the cytosol, <dfn data-w="glycolysis">glycolysis</dfn> converts each glucose molecule (6C) into two <dfn data-w="pyruvate">pyruvate</dfn> molecules (3C), in ten steps. Here one press stands for all ten.\n<mark class="do">Press the glucose.</mark>',
        p: [['hl', 'C1.2.8', '<dfn data-w="glycolysis">Glycolysis</dfn> converts glucose (6C) into two <dfn data-w="pyruvate">pyruvate</dfn> (3C), in the cytosol, in ten steps, each catalysed by a different enzyme: phosphorylation, lysis, oxidation and ATP formation. Net yield per glucose: 2 ATP and 2 reduced NAD.']] },
      { ch: 3, text: 'The two pyruvate molecules pass through the two membranes into the matrix: through porin, a <dfn data-w="channel-protein">channel protein</dfn>, then the pyruvate carrier, a <dfn data-w="carrier-protein">carrier protein</dfn>. One glucose molecule needs six oxygen molecules.\n<mark class="do">Press the two pyruvate molecules, then the oxygen,</mark> to move them into the mitochondrion.',
        p: [['sl', 'B2.1.6', 'The channel protein is porin: pyruvate crosses the outer membrane through its wide pore, by facilitated diffusion.'],
        ['x', '', 'The carrier protein in the inner membrane is the mitochondrial pyruvate carrier: it carries a hydrogen ion in with each pyruvate. Reduced NAD from glycolysis cannot cross the inner membrane: only its electrons enter, by a shuttle.']] },
      { ch: 4, text: 'In the matrix, the <dfn data-w="link-reaction">link reaction</dfn> and the <dfn data-w="krebs-cycle">Krebs cycle</dfn> oxidize the pyruvate, step by step; an <dfn data-w="enzyme">enzyme</dfn> catalyses each step. Watch what is produced.',
        p: [['hl', 'C1.2.11', 'The link reaction: each pyruvate is decarboxylated and oxidized, and its acetyl group (2C) joins coenzyme A: acetyl CoA.'],
        ['hl', 'C1.2.12', 'The Krebs cycle: the acetyl group joins oxaloacetate (4C) to form citrate (6C). Four oxidations and two decarboxylations give oxaloacetate back.']] },
      { ch: 6, text: 'Reduced NAD and FADH₂ pass electrons from this hydrogen to the <dfn data-w="electron-transport-chain">electron transport chain</dfn>, in the inner membrane of the cristae. As the electrons flow along the chain, the energy released pumps protons (<dfn data-w="hydrogen-ion">hydrogen ions</dfn>) into the intermembrane space.\nWatch the protons collect there. Then <mark class="do">press the oxygen</mark> to send it to the end of the chain: oxygen is the terminal electron acceptor.',
        p: [['hl', 'C1.2.13, C1.2.14', 'Reduced NAD passes a pair of electrons to the first carrier of the electron transport chain. As the electrons flow along the chain, the energy released pumps protons (hydrogen ions) into the intermembrane space: a <dfn data-w="proton-gradient">proton gradient</dfn>.'],
        ['hl', 'C1.2.16', 'Oxygen is the terminal electron acceptor: it accepts electrons and protons, so water is produced and the electrons can keep flowing.']] },
      { ch: 6, text: 'Now the concentration of protons is high in the intermembrane space and low in the matrix: a <dfn data-w="proton-gradient">proton gradient</dfn>. The phospholipid bilayer is a barrier to ions, as a dam (a wall across a river) holds water.\nProtons can diffuse back into the matrix only through <dfn data-w="atp-synthase">ATP synthase</dfn>: this is <dfn data-w="chemiosmosis">chemiosmosis</dfn>. As they flow through, a ring inside it turns, like a watermill (a wheel that water turns), and ATP synthase phosphorylates ADP to <dfn data-w="atp">ATP</dfn>.',
        p: [['hl', 'C1.2.15', '<dfn data-w="chemiosmosis">Chemiosmosis</dfn>: protons flow back through ATP synthase, down the gradient, and the energy released phosphorylates ADP to ATP.']] },
      { ch: 7, text: '<span class="eq"><b class="eq-g">glucose</b> + <b class="eq-o">oxygen</b> → <b class="eq-c">carbon dioxide</b> + <b class="eq-w">water</b></span>\nAerobic respiration: <b>carbon dioxide</b> and <b>water</b> are produced, and the energy released makes ATP: about 30–32 ATP per glucose. ATP supplies the energy for the work of the cell: to join amino acids, to make lipids and to move vesicles.\nThe whole story, molecule by molecule: <b>🧬 IB extension: from glucose to ATP</b>, at the end of this place.',
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
      { play: 'enter', text: 'You become even smaller, and you enter the nucleus through a nuclear pore.\nIn a cell that is not dividing, every chromosome is a long, thin thread. (Chromosomes look like an X only when a cell divides.)' },
      { play: 'findchr', text: 'A <dfn data-w="gene">gene</dfn> is a short section of DNA that carries the instructions for making one <dfn data-w="protein">protein</dfn>. The amylase gene is on chromosome 1, the largest kind of chromosome.\n<mark class="do">Press the threads to find chromosome 1.</mark>' },
      { play: 'findgene', text: '<mark class="do">Press the glowing section: the amylase gene.</mark>' },
      { play: 'copy', text: 'The DNA never leaves the nucleus. The cell makes a copy of the gene instead, called <dfn data-w="mrna">mRNA</dfn> (messenger RNA).\n<mark class="do">Press Copy to make the copy.</mark>\nExplorer, beyond the Year 7 list: <b>🔬 how a cell copies a gene</b> shows it step by step, and makes the copy too.' },
      { play: 'export', text: '<mark class="do">Choose how the copy leaves the nucleus.</mark>' }
    ],
    done: 'You carry the copy of the amylase gene. Next it needs a <b>ribosome</b>: the nucleolus makes the parts of ribosomes.',
    explore: '🔬 Explorer: how a cell copies a gene',
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
    intro: '<dfn data-w="ribosome">Ribosomes</dfn> are very small structures where proteins are made. A ribosome reads the copy of a gene and joins amino acids in the order the copy gives.\nA <dfn data-w="protein">protein</dfn> is a long chain of amino acids.\nRibosomes have no membrane, so they are not organelles.',
    steps: [
      { play: 'assemble', text: '<mark class="do">Press Join:</mark> the small part attaches to the copy, then the large part joins it. Now it is a whole ribosome.' },
      { play: 'translate', text: 'The copy is a code: each part of the code means one amino acid. Each amino acid arrives on a small carrier molecule.\n<mark class="do">Press the carrier that matches the code under the ribosome.</mark>\nEvery amino acid you join uses some energy.' },
      { play: 'where', text: 'The first part of the amylase chain is a <b>signal</b>: it means that this protein must be made on the rough ER. Proteins that the cell releases are made there.\n<mark class="do">Choose where this ribosome must work.</mark>' }
    ],
    done: 'The ribosome is moving to the <b>rough ER</b>, with the start of the chain.',
    fact: { text: 'Electron micrographs showed one small box of a HeLa cell (a human cell grown in laboratories), only 7.5 × 4.6 × 7.5 µm. In it, a computer program found 553 130 ribosomes.', src: 'OpenOrganelle, dataset jrc_hela-2 (Xu et al. 2021, Nature 599:147; Heinrich et al. 2021, Nature 599:141)' },
    fact2: { text: 'The part of a ribosome that joins amino acids together is made of <dfn data-w="rna">RNA</dfn>, not protein.', src: 'Nissen et al. 2000, Science 289:920' }
  },
  rer: {
    part: 7, task: 'game-rer', title: 'Rough ER', kind: 'Organelle: flattened sacs of membrane', def: 'rough-er',
    needs: ['chain'], gives: ['amylase'], alsoNeeds: ['lipids'],
    intro: 'The <dfn data-w="rough-er">rough ER</dfn> (rough endoplasmic reticulum) is a network of flattened sacs, joined to the nucleus. The ribosomes on its surface make it look rough.\nThe <dfn data-w="protein">proteins</dfn> they make go inside the rough ER, where they fold into their shape.',
    steps: [
      { play: 'dock', text: '<mark class="do">Press Dock:</mark> the signal takes the ribosome to a channel in the membrane of the rough ER, a tunnel through the membrane.' },
      { play: 'grow', text: 'The ribosome joins more amino acids. The chain goes through the channel, inside the rough ER.\n<mark class="do">Press Go.</mark>' },
      { play: 'cut', text: 'While the chain is still growing, an enzyme in the membrane of the rough ER removes the signal.\n<mark class="do">Press Cut.</mark>' },
      { play: 'fold', text: '<mark class="do">Press Fold.</mark>\nThe chain folds into its shape. A groove in it, the <dfn data-w="active-site">active site</dfn>, is where starch fits: the shape is what lets amylase work.' },
      { play: 'bud', text: 'Amylase leaves the rough ER in a vesicle, a small bubble of membrane: a piece of the membrane of the rough ER closes round it.\nSo every vesicle removes some membrane, and the ER needs new <dfn data-w="lipid">lipids</dfn>.\n<mark class="do">Press Bud to make a vesicle.</mark>' }
    ],
    done: 'A vesicle carries your amylase to the <b>Golgi apparatus</b>.',
    fact: { text: 'In a pancreas cell of a guinea pig, which makes digestive enzymes, 60 % of all its membrane is rough ER, and less than 1 % is smooth ER.', src: 'Bolender 1974, Journal of Cell Biology 61:269; Alberts et al., Molecular Biology of the Cell, 4th edition, table 12-2' }
  },
  ser: {
    part: 8, task: 'game-ser', title: 'Smooth ER', kind: 'Organelle: a network of tubes', def: 'smooth-er',
    needs: ['energy'], gives: ['lipids'],
    intro: 'The <dfn data-w="smooth-er">smooth ER</dfn> is a network of tubes with no ribosomes. It makes <dfn data-w="lipid">lipids</dfn> (fats, oils and similar molecules).\nA membrane is two layers of lipids, with <dfn data-w="protein">proteins</dfn> in it. Every new <dfn data-w="vesicle">vesicle</dfn> removes a piece of the ER membrane, so the ER needs new lipids.\nThe rough ER and the smooth ER are one joined membrane, so new lipids spread from one to the other. This cell has only a little smooth ER.',
    steps: [
      { play: 'lipid', text: 'A membrane lipid has a head and two tails.\n<mark class="do">Press Join three times</mark> to make three lipids. Each one uses some energy.' },
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
      { play: 'sortgame', text: 'Enzymes for a <dfn data-w="lysosome">lysosome</dfn> (a small sac of enzymes that digest old parts of the cell) carry a label that sends them there.\nAmylase has no label: amylase molecules stick together and are packed into large vesicles, which leave the cell.\n<mark class="do">Press each protein, then the vesicle where it belongs.</mark>' },
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
      { play: 'grab', text: 'Close up, nothing is drawn bigger than it is. So the camera comes very close to the microtubule next to your vesicle: it is only 25 <dfn data-w="nanometre">nanometres</dfn> (nm) wide.\nScientists found dynein, a <dfn data-w="motor-protein">motor protein</dfn>, on vesicles like yours in the pancreas, another gland. So the motor protein here is probably dynein. Each of its two heads is a ring, 14 nm across.\nDynactin, a rod 38 nm long, helps dynein walk. An adaptor protein holds dynein and dynactin together and joins them to your vesicle. Without these two, dynein is folded and almost never walks.\nYour vesicle is 900 nm across. The dots in it are amylase molecules, each 5 nm across. Only some of them are shown: a real vesicle is packed full.\n<mark class="do">Press Attach:</mark> dynein\'s two heads hold the microtubule.' },
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
      { play: 'smell', text: '<mark class="do">Press Smell the bread.</mark>\nA nerve ending next to the cell releases a chemical, and the message spreads through the cell.' },
      { play: 'fuse', text: 'The vesicle joins the cell membrane and opens to the outside.\n<mark class="do">Press Release.</mark>\nThis is <dfn data-w="exocytosis">exocytosis</dfn> (exo = out, cyto = cell).' },
      { play: 'flatten', text: 'The amylase leaves the cell and enters the duct. The membrane of the vesicle becomes part of the cell membrane.\nLater, new vesicles form from this membrane and return inside the cell, so the membrane is used again.' }
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
