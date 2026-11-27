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
  { n: 14, title: 'Side quest (extra): a plant cell, where glucose comes from' },
  /* the course questions (js/questions.js, 13 Nov 2026): not places of the cell. Each is drawn at the end of its own
     place (`place`), under the Year 7 checks, while that course's switch is on (quest.js courseQuestions); a place's
     own checks are the questions of its own part, so these never count for a place, the mission or the final check */
  { n: 15, title: 'Your course (extra): IGCSE questions' },
  { n: 16, title: 'Your course (extra): IB questions' }
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
   needs: items the place needs before it wakes; gives: what it gives; kind: what the structure is. The word "organelle"
   (Daniel's rule of 21 Nov 2026, for every course, Year 7 included: "I don't want to teach something incorrect to the key
   stage 3 … right now ribosomes are considered membraneless organelles … I don't want to teach something to the year 7s
   that then they're going to have to forget and relearn"): an organelle is a separate part of a cell with a specific
   function (the IB guide, B2.2.1: a discrete subunit); a membrane is NOT part of the definition. Ribosomes are organelles
   with no membrane; vesicles are organelles; the cytoplasm and the cytoskeleton (so the microtubules) are not, and the
   reason is never "no membrane"; the nucleolus and the centrosome get no claim about the word (his rulings). Until then
   the rule was his Year 7 slides': a membrane-bound structure. y7: in the Year 7 list (the five parts);
   figure: a picture at the top of the panel ('simple': the cell as Year 7 pupils draw it, js/game/simplecard.js);
   plural: the title names many (Mitochondria are awake, never "is"). */
window.STORY = {
  arrive: {
    part: 1, task: 'game-arrive', title: 'The cell you know', tag: 'Start here', figure: 'simple',
    steps: [
      { play: 'simple', watch: false, text: 'In Year 7 you learn five parts of an animal <dfn data-w="cell">cell</dfn>: the <dfn data-w="cell-membrane">cell membrane</dfn>, the <dfn data-w="cytoplasm">cytoplasm</dfn>, the <dfn data-w="nucleus">nucleus</dfn>, the <dfn data-w="mitochondria">mitochondria</dfn> and the <dfn data-w="ribosome">ribosomes</dfn>.\nIn the cell around you, only these five are lit now.' },
      { play: 'full', text: 'An <dfn data-w="electron-microscope">electron microscope</dfn> shows much more: it uses a beam of electrons instead of light, so it shows much smaller details.\n<mark class="do">Press Show everything.</mark>\nEach new structure appears with its name.' },
      { play: 'organelles', watch: false, text: 'An <dfn data-w="organelle">organelle</dfn> is a separate part of a cell with a specific function, such as the nucleus.\nMost kinds of organelle have a <dfn data-w="membrane">membrane</dfn> round them. A <dfn data-w="vesicle">vesicle</dfn>, a small bubble of membrane, is one of these organelles.\nRibosomes have no membrane: they are membraneless organelles. (Some books still say that ribosomes are not organelles, because ribosomes have no membrane. Many scientists now use the word organelle for parts with a membrane and for parts with no membrane.)\nThe microtubules are part of the <dfn data-w="cytoskeleton">cytoskeleton</dfn>, a network of protein fibres through the whole cell. The cytoskeleton is not one separate part, so microtubules are <b>not</b> organelles.\nThe <dfn data-w="cytoplasm">cytoplasm</dfn> is <b>not</b> an organelle: the cytoplasm is the <dfn data-w="cytosol">cytosol</dfn> (a jelly-like fluid) and the organelles in the cytosol, but not the nucleus.' },
      { play: 'mission', watch: false, text: 'This cell is in your <dfn data-w="salivary-gland">salivary gland</dfn>. It makes <dfn data-w="amylase">amylase</dfn>, the <dfn data-w="enzyme">enzyme</dfn> in your saliva that digests <dfn data-w="starch">starch</dfn>.\n<b>Your mission: make amylase and release it from the cell.</b>\nIn this game, each place in the cell does one job. A place that is asleep wakes when you bring what it needs.' }
    ],
    done: 'You know the map. Two places are awake: <b>the nucleus</b> and <b>the way in</b>, at the base of the cell. Choose one.',
    fact: { text: 'Your body is made of about 37 trillion cells (37 000 000 000 000).', src: 'Bianconi et al. 2013, Annals of Human Biology 40:463' }
  },
  wayin: {
    part: 2, task: 'game-wayin', title: 'Cell membrane: the way in', kind: 'The cell membrane: part of every cell', y7: true, def: 'cell-membrane',
    needs: [], gives: ['glucose', 'oxygen', 'amino'],
    intro: 'You are at the base of the cell.\nBelow its membrane are the <dfn data-w="tissue-fluid">tissue fluid</dfn> (the liquid round the cells) and a <dfn data-w="capillary">capillary</dfn> full of blood: red blood cells in the <dfn data-w="plasma">plasma</dfn>, the liquid part of the blood.\nThe cell needs <dfn data-w="glucose">glucose</dfn> and <dfn data-w="oxygen">oxygen</dfn> for respiration (the reactions that release energy from glucose), and <dfn data-w="amino-acid">amino acids</dfn> to make <dfn data-w="protein">proteins</dfn>. The blood brings them.\nThe <dfn data-w="cell-membrane">cell membrane</dfn> controls what enters and leaves the cell.',
    steps: [
      { play: 'look', watch: false, text: 'Here the membrane and the molecules are drawn about 100 times bigger, so that you can see them. The membrane is two layers of <dfn data-w="lipid">lipid</dfn> molecules, with proteins in them.\nAbove the membrane is the <b>inside</b> of the cell. Below it is the <b>outside</b>.' },
      { play: 'oxygen', text: '<dfn data-w="red-blood-cell">Red blood cells</dfn> carry oxygen from your lungs. Here, the gland cells use oxygen, so the red blood cells release it.\nA red blood cell is a disc, thinner in the middle.\n<mark class="do">Press a red blood cell.</mark>' },
      { play: 'carriers', text: 'Glucose and amino acids are dissolved in the plasma. They leave the capillary through its thin wall.\n<mark class="do">Press the glucose, then choose how it enters the cell.</mark>' },
      { play: 'amino', text: 'A <dfn data-w="carrier-protein">carrier protein</dfn> carried the glucose through the membrane: glucose is too large to pass between the lipids. An amino acid is a larger molecule too.\n<mark class="do">Press the amino acid, then choose how it enters the cell.</mark>' },
      { play: 'co2', text: '<dfn data-w="carbon-dioxide">Carbon dioxide</dfn> is a waste product of respiration. It is a small molecule, like oxygen.\n<mark class="do">Press the carbon dioxide.</mark>' }
    ],
    /* the course layers of this place (quest.js courseSwitch; the rules are above the nucleus's `course`, below). They
       replaced its "IB Biology" switch, which changed the Year 7 sentences into IB ones (13 Nov 2026; Daniel: "being a
       KS3 level sentence next to an IB level one (as long as the distinction is clear) is useful for the students to
       see how they need to improve/change the way they write as they progress"). `names`: with IB on, the names on
       the picture add the IB terms, and what the place says adds its IB sentence under the Year 7 one (play.js `ib`).
       `ch`: a door to that chapter of "From glucose to ATP". `plant`: a door to the scene of the plant cell's membrane
       step that shows, in detail, a process this box names in a line only (IGCSE's osmosis and active transport;
       quest.js PLANT; 20 Nov 2026, Daniel's "Yes, add doors"). `mem`: a door to "The cell membrane: fluid and mosaic"
       (js/membrane/view.js; Daniel, 13 Nov 2026: "show that the phospholipids move within their own layer, and so that
       actually proteins can migrate … how the cell membrane probably looks like and moves like in reality"). IGCSE and the carrier protein for glucose: the examiners'
       report of November 2016 says "Facilitated diffusion is beyond the scope of IGCSE", and the syllabus names
       protein carriers only in active transport (3.3.3), so the lines say what the syllabus names and what it does not.
       The oxygen step's definition of diffusion is its first line (on show; 17 Nov 2026): the picture now shows it, with
       many molecules moving at random and a count of their crossings (play.js flowOn, wayflow.js). */
    course: {
      names: true,
      igcse: [
        { plant: 'osmosis', p: [
          ["c", "2.1.1, 2.1.4", "The cell membrane is in the list of cell structures that you describe and compare. Its function: it controls what enters and leaves the cell."],
          ["c", "3.2.2, 3.2.3", "The IGCSE term for a membrane like this is partially permeable: some substances pass through it, and others do not. Water passes through it by osmosis."],
          ["n", "", "The syllabus does not name the lipids of the membrane. Of its proteins, it names one kind: the protein carriers of active transport."]
        ] },
        { p: [
          ["c", "3.1.1, 3.1.3", "Oxygen enters the cell by <dfn data-w=\"diffusion\">diffusion</dfn> through the cell membrane. Diffusion is the net movement of particles from a region of their higher concentration to a region of their lower concentration (i.e. down a <dfn data-w=\"concentration-gradient\">concentration gradient</dfn>), as a result of their random movement."],
          ["c", "9.4.3", "Red blood cells transport oxygen. Haemoglobin, inside the red blood cells, carries it."]
        ] },
        { p: [
          ["c", "9.4.3", "Plasma transports nutrients, such as glucose and amino acids."],
          ["s", "9.3.5", "The wall of a capillary is one cell thick, so the distance for diffusion through it is short."],
          ["n", "", "Here the glucose moves through its carrier protein from a higher concentration to a lower concentration (down a concentration gradient), and no energy from respiration is used: this agrees with the description of diffusion. The syllabus does not name a protein carrier for diffusion."]
        ] },
        { plant: 'active', p: [
          ["c", "3.3.1", "Active transport is the movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration (i.e. against a concentration gradient), using energy from respiration. The picture does not show whether the carrier protein for amino acids uses energy."],
          ["s", "3.3.3", "The syllabus names protein carriers in one process, active transport: they move molecules or ions across a membrane."]
        ] },
        { p: [
          ["c", "3.1.3", "Carbon dioxide leaves the cell by diffusion through the cell membrane: its concentration is higher inside the cell, where respiration produces it."],
          ["c", "9.4.3", "Plasma transports carbon dioxide."]
        ] }
      ],
      ib: [
        { ch: 1, mem: true, p: [
          ["sl", "B2.1.1, B2.1.2", "The membrane is a <dfn data-w=\"phospholipid\">phospholipid</dfn> bilayer, about 5 nm thick, with proteins in it. The phosphate heads are <dfn data-w=\"hydrophilic\">hydrophilic</dfn>: they face the water on each side. The hydrocarbon tails are <dfn data-w=\"hydrophobic\">hydrophobic</dfn>: they form the core, a barrier to ions and <dfn data-w=\"polar\">polar</dfn> molecules."]
        ] },
        { ch: null, p: [
          ["sl", "B2.1.3", "Oxygen molecules are small and non-polar, so they pass between the phospholipids by simple diffusion, down their <dfn data-w=\"concentration-gradient\">concentration gradient</dfn>."],
          ["sl", "B2.2.1", "The IB guide counts the plasma membrane as an organelle."],
          ["sl", "A2.2.9", "A <dfn data-w=\"red-blood-cell\">red blood cell</dfn> has no nucleus: an atypical cell structure. So the cell has more space for <dfn data-w=\"haemoglobin\">haemoglobin</dfn>."],
          ["hl", "B2.3.7", "A red blood cell is a flattened disc, so its surface area-to-volume ratio is large: oxygen diffuses in and out quickly."],
          ["hl", "B1.2.11", "Haemoglobin has quaternary structure: four polypeptides (chains of amino acids). Haemoglobin is a conjugated protein: each chain holds a haem group, which contains iron."]
        ] },
        { ch: 1, p: [
          ["sl", "B2.1.8", "Glucose is polar, so it cannot pass between the phospholipids. The carrier protein for glucose is a <dfn data-w=\"glucose-transporter\">glucose transporter</dfn>: glucose enters by <dfn data-w=\"facilitated-diffusion\">facilitated diffusion</dfn>, down its concentration gradient, and no ATP is used."],
          ["hl", "C1.2.8", "Inside the cell, an enzyme immediately adds a phosphate group from ATP (the molecule that carries energy in the cell) to the glucose (<dfn data-w=\"phosphorylation\">phosphorylation</dfn>). Glucose 6-phosphate is charged, so it cannot leave through the transporter."],
          ["x", "", "In many body cells the transporter is GLUT1. <b>From glucose to ATP</b> shows GLUT4, the one in muscle cells. The enzyme is hexokinase."]
        ] },
        { ch: null, p: [
          ["sl", "B2.1.8", "An amino acid has charged groups, so it is hydrophilic: it cannot pass between the phospholipids. Each carrier protein is selective: only particles of the right shape and charge fit it. So the membrane is selectively permeable."],
          ["x", "", "Many amino acid transporters are cotransporters: a sodium ion enters with each amino acid. The picture does not show which kind this one is."]
        ] },
        { ch: 4, p: [
          ["sl", "B2.1.3", "Carbon dioxide is small and non-polar, like oxygen: it leaves by simple diffusion too."],
          ["hl", "C1.2.11, C1.2.12", "It is produced in the mitochondria: in the <dfn data-w=\"link-reaction\">link reaction</dfn> and the <dfn data-w=\"krebs-cycle\">Krebs cycle</dfn> (two stages of respiration), each carbon dioxide molecule is removed from a larger molecule (<dfn data-w=\"decarboxylation\">decarboxylation</dfn>). Its carbon atoms come from glucose."]
        ] }
      ]
    },
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
      { play: 'minside', text: 'Inside, the inner membrane is folded. Its folds are the <dfn data-w="cristae">cristae</dfn> (one: a crista).\nInside the inner membrane is a thick liquid, the <dfn data-w="matrix">matrix</dfn>.\nHere its two membranes look like one line: they are only 15 <dfn data-w="nanometre">nanometres</dfn> (nm) apart.\nA glucose molecule is about 1 nm across: this mitochondrion is 700 times wider.\nIn this place everything is drawn at its true size compared with everything else, so to see glucose and the two membranes, you zoom in.\n<mark class="do">Press 🔍 Zoom in, beside the ring of light on its edge.</mark>' },
      { play: 'split', text: 'You are at the edge of the mitochondrion. The bar at the bottom left shows the scale.\nAbove is the <dfn data-w="cytosol">cytosol</dfn>; below, the outer membrane: two layers of lipids, with proteins in it.\nIn the cytosol, each glucose molecule is first split into two smaller molecules.\n<mark class="do">Press the glucose to <span data-cw="split">split it</span>.</mark>' },
      { play: 'feed', text: 'The smaller molecules pass through the two membranes into the matrix: through a <dfn data-w="channel-protein">channel protein</dfn>, then a <dfn data-w="carrier-protein">carrier protein</dfn>.\nOne glucose molecule needs six oxygen molecules.\n<mark class="do">Press <span data-cw="pyr2">the two smaller molecules</span>, then the oxygen,</mark> to move them into the mitochondrion.' },
      { play: 'respire', text: 'In the matrix, <dfn data-w="enzyme">enzymes</dfn> break the smaller molecules down, step by step. Watch what is produced.' },
      { play: 'water', text: 'Hydrogen from the smaller molecules is carried to a chain of proteins in the folded inner membrane.\nThe proteins use its energy to pump <dfn data-w="hydrogen-ion">hydrogen ions</dfn> into the space inside the fold.\nWatch the hydrogen ions collect there. Then <mark class="do">press the oxygen</mark> to send it to <span data-cw="etc">the last protein in the chain</span>.' },
      { play: 'dam', text: 'Now there are many hydrogen ions inside the fold, and few in the matrix. The membrane stops them, as a dam (a wall across a river) stops water.\nThey can flow back into the matrix only through <dfn data-w="atp-synthase">ATP synthase</dfn>.\nAs they flow through, a ring inside it turns, like a watermill (a wheel that water turns), and it makes <dfn data-w="atp">ATP</dfn>: a small molecule that carries energy.\nWatch the top of ATP synthase: each ADP (a molecule like ATP, with one phosphate group fewer) joins a phosphate and becomes ATP, again and again.' },
      { play: 'release', text: '<span class="eq"><b class="eq-g">glucose</b> + <b class="eq-o">oxygen</b> → <b class="eq-c">carbon dioxide</b> + <b class="eq-w">water</b></span>\nAerobic respiration: <b>carbon dioxide</b> and <b>water</b> are produced, and energy is released. The cell uses this energy for its work: to join amino acids, to make lipids and to move vesicles.\nBeyond the Year 7 list: when every check of this place is right, <b>🧬 IB extension: from glucose to ATP</b> follows one glucose molecule to ATP, step by step.' }
    ],
    done: 'The energy bar is full. Every job of the cell uses some: when it is low, return here with more glucose and oxygen.',
    more: { needs: ['glucose', 'oxygen'], label: '⚡ Release energy again', text: 'You carry glucose and oxygen. The mitochondria release their energy as before: press ↻ beside a step to watch it again.', wait: 'To release more energy, bring glucose and oxygen from <b>the way in</b>.', did: 'Aerobic respiration released more energy: look at the energy bar.' },
    /* the course layers of this place (quest.js courseSwitch; see the way in's, above, and the rules above the
       nucleus's). `ch`: the step's chapter in "From glucose to ATP" (it replaced this place's Explorer film, 5 Nov
       2026). IGCSE: the syllabus names the site, the two equations and the uses of energy, and none of the parts in
       between. "Energy is released": the examiners' reports (March 2021, March 2022, November 2022) list "energy is
       produced" as a common error; mark schemes (March 2016 paper 42, November 2023 paper 41) have "mitochondria are
       site of aerobic respiration". */
    course: {
      names: true,
      igcse: [
        { p: [
          ["c", "2.1.1, 2.1.3", "Mitochondria are in the list of cell structures that you describe and compare, and that you identify in diagrams and images of cells."],
          ["n", "", "The syllabus does not name the two membranes of a mitochondrion."]
        ] },
        { p: [
          ["c", "2.1.4", "The function of mitochondria: they are the site of aerobic respiration."],
          ["n", "", "The syllabus does not name the cristae or the matrix."]
        ] },
        { p: [
          ["c", "12.2.1", "Aerobic respiration is the chemical reactions in cells that use oxygen to break down nutrient molecules to release energy. Glucose is a nutrient molecule."],
          ["n", "", "The syllabus does not name the steps of respiration. The split of glucose in the cytosol is the first step."]
        ] },
        { p: [
          ["s", "12.2.3", "The six oxygen molecules are the 6O₂ of the balanced chemical equation: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O."],
          ["n", "", "The syllabus does not name channel proteins."]
        ] },
        { p: [
          ["c", "5.1.2", "Enzymes are proteins that function as biological catalysts in all metabolic reactions. The reactions of respiration are metabolic reactions."]
        ] },
        { p: [
          ["c", "12.2.1", "Aerobic respiration uses oxygen: this is the step that uses it. Water is produced here."],
          ["n", "", "The syllabus does not name hydrogen ions in respiration, or the chain of proteins."]
        ] },
        { p: [
          ["c", "12.2.1", "The syllabus says that respiration releases energy. Write \"energy is released\": the reports of the examiners for this syllabus list \"energy is produced\" as a common error."],
          ["n", "", "The syllabus does not name ATP or ATP synthase."]
        ] },
        { p: [
          ["c", "12.1.1", "Uses of energy in living organisms: muscle contraction, protein synthesis, cell division, active transport, growth, the passage of nerve impulses and the maintenance of a constant body temperature. To join amino acids is protein synthesis."],
          ["c", "12.2.2", "The word equation above is the one that the syllabus asks you to state."],
          ["s", "12.2.3", "The balanced chemical equation: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O."]
        ] }
      ],
      ib: [
        { ch: 0, p: [
          ["sl", "C1.2.5", "Mitochondria are needed for aerobic respiration (with oxygen), but not for anaerobic respiration (without oxygen)."],
          ["hl", "A2.2.12", "Mitochondria have their own circular DNA and ribosomes like those of bacteria, and they divide by themselves. This is evidence that mitochondria evolved from bacteria that lived inside another cell: endosymbiosis."],
          ["x", "", "The guide says these ribosomes are 70S (S is a measure of size), as in bacteria. In human mitochondria they are 55S: smaller, but of the bacterial kind."]
        ] },
        { ch: 3, p: [
          ["hl", "B2.2.4", "The matrix is a fluid with the enzymes of the link reaction and the Krebs cycle. The space between the two membranes is the <dfn data-w=\"intermembrane-space\">intermembrane space</dfn>, about 15 nm wide. Adaptations for making ATP: a double membrane with a small volume of intermembrane space (so a few pumped protons (hydrogen ions) give a high concentration), the large surface area of the cristae, and the enzymes of the Krebs cycle and their substrates (the molecules they act on) kept together in the matrix."]
        ] },
        { ch: 2, p: [
          ["hl", "C1.2.8", "<dfn data-w=\"glycolysis\">Glycolysis</dfn> converts glucose (6C) into two <dfn data-w=\"pyruvate\">pyruvate</dfn> (3C), in the cytosol, in ten steps, each catalysed by a different enzyme: phosphorylation (adding phosphate), lysis (splitting), oxidation (removing hydrogen) and ATP formation. Net yield per glucose: 2 ATP and 2 <dfn data-w=\"reduced-nad\">reduced NAD</dfn>. Here one press shows all ten steps."]
        ] },
        { ch: 3, p: [
          ["sl", "B2.1.6", "A channel protein has a pore: particles diffuse through it, down their concentration gradient. This is facilitated diffusion."],
          ["hl", "C1.2.8", "The smaller molecules are pyruvate."],
          ["x", "", "This channel protein is porin: its pore is wide, so pyruvate passes through it. The carrier protein in the inner membrane is the mitochondrial pyruvate carrier: it carries a hydrogen ion in with each pyruvate. Reduced NAD from glycolysis cannot cross the inner membrane: only its electrons enter, by a shuttle."]
        ] },
        { ch: 4, p: [
          ["hl", "C1.2.11", "The <dfn data-w=\"link-reaction\">link reaction</dfn>: each pyruvate is decarboxylated and oxidized, and its acetyl group (2C) joins <dfn data-w=\"coenzyme-a\">coenzyme A</dfn>: acetyl CoA."],
          ["hl", "C1.2.12", "The <dfn data-w=\"krebs-cycle\">Krebs cycle</dfn>: the acetyl group joins oxaloacetate (4C) to form citrate (6C). Four oxidations and two decarboxylations make oxaloacetate again."]
        ] },
        { ch: 6, p: [
          ["hl", "C1.2.13, C1.2.14", "The chain of proteins is the <dfn data-w=\"electron-transport-chain\">electron transport chain</dfn>. Reduced NAD passes a pair of electrons to its first carrier. As the electrons flow along the chain, the energy released pumps protons (hydrogen ions) into the intermembrane space: a <dfn data-w=\"proton-gradient\">proton gradient</dfn>."],
          ["hl", "C1.2.16", "Oxygen is the terminal electron acceptor: it accepts electrons and protons, so water is produced and the electrons can keep flowing."]
        ] },
        { ch: 6, p: [
          ["hl", "C1.2.15", "The concentration of protons is high in the intermembrane space and low in the matrix. The phospholipid bilayer is a barrier to ions, so protons flow back only through ATP synthase, down the gradient, and the energy released phosphorylates ADP to ATP: this is <dfn data-w=\"chemiosmosis\">chemiosmosis</dfn>."]
        ] },
        { ch: 7, p: [
          ["sl", "C1.2.1, C1.2.2", "The energy released makes ATP, and ATP supplies the energy for the work of the cell: here, to join amino acids, to make lipids and to move vesicles."],
          ["sl", "C1.2.5", "Aerobic respiration yields many more ATP per glucose than anaerobic respiration."],
          ["x", "", "Measured: about 30–32 ATP per glucose (older books say 36–38)."],
          ["hl", "C1.1.12", "No reaction transfers energy with 100 % efficiency, so some energy is released as heat. Your body uses this heat to keep its temperature constant."]
        ] }
      ]
    },
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
      { play: 'pack', text: 'Many books draw a chromosome as an X. A chromosome looks like an X only for a short time, when a cell divides. Your cell is not dividing, so this step shows you a picture of a cell that is.\n<mark class="do">Press <b data-cw="thread2" data-b>Second thread</b>, then <b data-cw="pack" data-b>Pack</b>: see how the thread of chromosome 1 becomes an X. Then press Loosen.</mark>\n(In the nucleus the game draws each thread about three times thicker than it is, so that you can see it.)' },
      { play: 'findgene', text: '<mark class="do">Press the glowing section: the amylase gene.</mark>' },
      { play: 'copy', text: 'The DNA never leaves the nucleus. The cell makes a copy of the gene instead, called <dfn data-w="mrna">mRNA</dfn> (messenger RNA).\n<mark class="do">Press <b data-cw="copyline" data-b>Copy to make the copy</b>.</mark>\n<span class="step__x"><b>Explorer · beyond the Year 7 list.</b> Making a copy of a gene like this has a name: <dfn data-w="transcription">transcription</dfn>. <b>🔬 How a cell copies a gene</b> shows it step by step. When you finish it, the copy is made.</span>' },
      { play: 'export', text: '<mark class="do">Choose how <span data-cw="thecopy">the copy</span> leaves the nucleus.</mark>' }
    ],
    /* the course layers of this place (12 Nov 2026; Daniel: "you can add a toggle for IGCSE and a toggle for IB … be
       specific for IGCSE students and IB"): shown by the panel's "Your course: IGCSE · IB" switches once every Year 7
       check of the place is right (quest.js courseSwitch); the Year 7 words above never change. One entry per step, in
       the steps' order (null: the course says nothing about what that step shows). Each line: [level, statement, words].
       IGCSE: Cambridge 0610, syllabus for 2026 to 2028 (labs-shared/syllabus.json): 'c' Core, 's' Supplement, 'n' a
       note on what the syllabus does not name. IB: the DP Biology guide, first assessment 2025: 'sl' under "SL and HL",
       'hl' under "Additional higher level", 'x' beyond the guide. Every statement number was read in its source
       (tools/course-check.mjs checks each one again); the words follow the source's own. `film`: a door to the film
       that shows the step in detail. `out`: doors to another page of the site that shows a process of the step in
       detail, where the game shows it simply (quest.js OUT; 20 Nov 2026; Daniel, 18 Nov: "any animation is
       professionally done that shows as much detail, at least in one place or another"; his "Yes, add doors" to the
       audit of the places): here, replication and mitosis, which this place shows as a second thread and an X.
       No line says what an examination will or will not ask. */
    course: {
      igcse: [
        { p: [
          ["c", "2.1.1", "The nucleus is in the list of cell structures that you describe and compare: cell membrane, nucleus, cytoplasm, ribosomes, mitochondria and, in plant cells, cell wall, chloroplasts and vacuoles."],
          ["n", "", "The nuclear envelope and the nuclear pores are not in that list."]
        ] },
        { p: [
          ["c", "17.1.1", "Chromosomes are made of DNA, which contains genetic information in the form of genes."],
          ["c", "17.1.2", "A gene is a length of DNA that codes for a protein."],
          ["s", "17.1.11, 17.1.12", "A diploid nucleus contains two sets of chromosomes. In a human diploid cell there are 23 pairs: the 46 threads of this nucleus."]
        ] },
        { out: ['replication', 'mitosis'], p: [
          ["s", "17.2.3", "The exact replication of chromosomes occurs before mitosis: the second thread of this step."],
          ["s", "17.2.4", "During mitosis, the copies of chromosomes separate, maintaining the chromosome number in each daughter cell."],
          ["s", "17.2.1", "Mitosis is nuclear division giving rise to genetically identical cells. The syllabus says: \"details of the stages of mitosis are not required\"."]
        ] },
        { p: [
          ["s", "17.1.5", "The sequence of bases in a gene determines the sequence of amino acids used to make a specific protein."],
          ["s", "17.1.9", "Most body cells in an organism contain the same genes, but many genes in a particular cell are not expressed, because the cell only makes the specific proteins it needs. A cell of a salivary gland expresses the amylase gene."]
        ] },
        { p: [
          ["s", "17.1.8", "The gene coding for the protein remains in the nucleus. Messenger RNA (mRNA) is a copy of a gene. mRNA molecules are made in the nucleus."],
          ["s", "4.1.4", "A DNA molecule is two strands coiled together to form a double helix. Each strand contains chemicals called bases. Bonds between pairs of bases hold the strands together. The bases always pair up in the same way: A with T, and C with G."],
          ["n", "", "The syllabus says: \"knowledge of the details of transcription or translation is not required\". The film shows how it happens."]
        ], film: "copy" },
        { p: [
          ["s", "17.1.8", "mRNA molecules move from the nucleus to the cytoplasm."]
        ] }
      ],
      ib: [
        { p: [
          ["sl", "A2.2.6", "The nucleus has a double membrane with pores, and its chromosomes are made of DNA bound to <dfn data-w=\"histone\">histones</dfn> (proteins that DNA is wrapped around)."],
          ["hl", "B2.2.6", "The pores are needed: mRNA and the parts of ribosomes leave through them, and proteins enter. During mitosis and meiosis the nuclear membrane breaks into vesicles."]
        ] },
        { p: [
          ["sl", "A1.2.1", "DNA is the genetic material of all living organisms."],
          ["hl", "A1.2.13", "A nucleosome is a DNA molecule wrapped around a core of eight histone proteins, held together by an additional histone protein attached to linker DNA. The film of the copy step shows the nucleosomes of this thread."],
          ["hl", "D2.1.13, D2.1.14", "Between divisions, a cell is in interphase: G1, S (the DNA is copied) and G2. Interphase is a metabolically active period: this cell makes proteins such as amylase."]
        ] },
        { out: ['replication', 'mitosis'], p: [
          ["sl", "D2.1.5", "DNA replication is a prerequisite for mitosis and for meiosis. After replication, each chromosome consists of two elongated DNA molecules (chromatids), held together until anaphase (the stage of mitosis when the chromatids separate): the two threads of this step, joined in the middle."],
          ["sl", "D2.1.6", "Chromosomes condense in mitosis and in meiosis: histones condense the DNA by supercoiling. Microtubules and microtubule motors then move the chromosomes."]
        ] },
        { p: [
          ["sl", "D1.2.4", "Not all genes in a cell are expressed at any given time. Transcription is the first stage of gene expression, and a key stage at which the expression of a gene can be switched on and off."],
          ["hl", "D2.2.5, A2.2.13", "Every cell of your body has the same genome (all the genes), but this cell transcribes only some of them: its transcriptome. This pattern of gene expression makes it a gland cell: the cell is differentiated."]
        ] },
        { p: [
          ["sl", "D1.2.1", "Transcription is the synthesis of RNA using a DNA template. RNA polymerase separates the two DNA strands and joins the RNA nucleotides into one strand."],
          ["hl", "A1.2.11", "The carbon atoms of each nucleotide’s sugar are numbered 1′ to 5′, so each strand has a 5′ end (a phosphate group) and a 3′ end (an –OH group)."],
          ["sl", "D1.2.2", "Each RNA nucleotide pairs with the complementary base of the DNA template strand, held by hydrogen bonds: adenine (A) on the DNA pairs with uracil (U) on the RNA."],
          ["x", "", "The film shows the next lines of the guide step by step: the template strand does not change, RNA grows 5′ to 3′, and transcription starts at the promoter."]
        ], film: "copy" },
        { film: "copy", filmAt: "D1.2.15", p: [
          ["hl", "D1.2.15", "Post-transcriptional modification in eukaryotic cells: introns (sections that do not code for amino acids) are removed and exons (the coding sections) are spliced together to form mature mRNA, and a 5′ cap and a 3′ polyA tail are added, which stabilize the mRNA. This happens in the nucleus, before the mRNA leaves."],
          ["x", "", "This step shows the mRNA leaving as one finished strand: this step does not show the modification."],
          ["sl", "B2.2.2", "The nucleus separates transcription from translation: mRNA can be modified before it meets ribosomes in the cytoplasm. In prokaryotes (cells with no nucleus, such as bacteria) this is not possible."],
          ["hl", "D2.2.3", "In the cytoplasm, each mRNA lasts from minutes to days before enzymes (nucleases) digest it. So the cell can control translation by how long each mRNA lasts."]
        ] }
      ]
    },
    done: 'You carry the copy of the amylase gene. Next it needs a <b>ribosome</b>: the nucleolus makes the parts of ribosomes.',
    explore: '🔬 Explorer: how a cell copies a gene',
    again: '↺ Dive through a nuclear pore again',   /* the end card's button: the dive again (play.js dive-again; Daniel, 9 Nov 2026) */
    fact: { text: 'The DNA in one of your cells is about 2 metres long, but it fits into a nucleus about 6 µm across.', src: 'Annunziato 2008, Nature Education 1:26 (open)' },
    fact2: { text: 'Some people have more copies of the amylase gene than others. People from groups that have eaten foods rich in starch for thousands of years have more copies, on average.', src: 'Perry et al. 2007, Nature Genetics 39:1256' }
  },
  nucleolus: {
    /* (17 Nov 2026, after a science read's doubt and a look in the guide itself: A2.2.6 has "80S ribosomes" and no 40S or
       60S; D1.2.14 has "genes for rRNAs" and no nucleolus. Each line's words beyond its statement are now a line of their
       own, 'x', beyond the guide. The guide's own words for the two parts: "small subunit", "large subunit", D1.2.6) */
    course: {
      igcse: [
        { p: [
          ["n", "", "The IGCSE syllabus for 2026 to 2028 does not name the nucleolus. Its list of cell structures has ribosomes (2.1.1)."]
        ] },
        null,
        null
      ],
      ib: [
        { p: [
          ["hl", "D1.2.14", "The genes for ribosomal RNA (rRNA) code for no polypeptide (no chain of amino acids): they are non-coding sequences."],
          ["x", "", "The nucleolus forms around the genes for ribosomal RNA."]
        ] },
        { p: [
          ["sl", "A2.2.6", "Eukaryote ribosomes are 80S."],
          ["x", "", "A ribosome has a small 40S subunit and a large 60S subunit. S is a unit of how fast a particle sinks in an ultracentrifuge: larger particles sink faster."]
        ] },
        { p: [
          ["hl", "B2.2.6", "The subunits are too large to cross a membrane, so they exit through the nuclear pores."]
        ] }
      ]
    },
    part: 5, task: 'game-nucleolus', title: 'Nucleolus', kind: 'Part of the nucleus: no membrane', def: 'nucleolus',
    needs: [], gives: ['parts'], inside: 'nucleus',
    intro: 'The <dfn data-w="nucleolus">nucleolus</dfn> is a dense region inside the nucleus. It makes the two parts of <dfn data-w="ribosome">ribosomes</dfn>, a small part and a large part.\nEach part is made of <dfn data-w="rna">RNA</dfn> (a molecule like DNA), which the nucleolus makes, and <dfn data-w="protein">proteins</dfn>, which enter the nucleus from the cytoplasm.\nThe nucleolus has no membrane.',
    steps: [
      { play: 'small', text: '<mark class="do">Press Build to make the <span data-cw="smallpart">small part</span>.</mark>' },
      { play: 'large', text: '<mark class="do">Press Build to make the <span data-cw="largepart">large part</span>.</mark>' },
      { play: 'out', text: 'The two parts leave the nucleus separately, through nuclear pores. They join only in the cytoplasm, on a copy of a gene (mRNA).\n<mark class="do">Press <span data-cw="eachpart">each part</span>: it leaves through a nuclear pore.</mark>' }
    ],
    done: 'You carry the two ribosome parts.',
    fact: { text: 'A growing human cell can make thousands of ribosome parts every minute.', src: 'Lewis and Tollervey 2000, Science 288:1385' }
  },
  ribosome: {
    part: 6, task: 'game-ribosome', title: 'Ribosomes', onPic: 'Ribosome', plural: true, kind: 'Organelle: no membrane', y7: true, def: 'ribosome',
    needs: ['mrna', 'parts', 'amino', 'energy'], gives: ['chain'],
    intro: '<dfn data-w="ribosome">Ribosomes</dfn> are very small structures where proteins are made. A ribosome has two parts, a small part and a large part, made in the nucleolus. A ribosome reads the copy of a gene (mRNA, made in the nucleus) and joins amino acids in the order the copy gives.\nA <dfn data-w="protein">protein</dfn> is a long chain of amino acids.\nThis place is in the <dfn data-w="cytosol">cytosol</dfn>, just beside the rough ER: many ribosomes work on its membrane.\nFrom very near, everything here is drawn at its true size: a ribosome is about 30 nm across (30 millionths of a millimetre). On the map, ribosomes are drawn about four times larger, so that you can see them.\nRibosomes have no membrane: they are membraneless organelles.\nWhen the picture is still, press <b>As it really is</b> at the bottom of the picture: it shows how packed the cell really is.',
    steps: [
      { play: 'assemble', text: '<mark class="do">Press <b data-cw="ribjoin" data-b>Join</b>:</mark> <span data-cw="ribline">the small part attaches to the copy, then the large part joins it</span>. Now it is a whole ribosome.' },
      { play: 'translate', text: 'The copy is a code: each part of the code means one amino acid. Each amino acid arrives on a small carrier molecule.\n<mark class="do">Press <span data-cw="carrier">the carrier that matches the code</span> under the ribosome.</mark>\nEvery amino acid you join uses some energy.\n<span class="step__x"><b>Explorer · beyond the Year 7 list.</b> The ribosome reads the code of the copy and joins amino acids in that order. This has a name: <dfn data-w="translation">translation</dfn>.</span>' },
      { play: 'where', text: 'The first part of the amylase chain is a <b>signal</b>: it means that this protein must be made on the rough ER. Proteins that the cell releases are made there.\n<mark class="do">Choose where this ribosome must work.</mark>' }
    ],
    course: {
      igcse: [
        { p: [
          ["c", "2.1.1, 2.1.4", "Ribosomes are in the list of cell structures: they are where proteins are made (protein synthesis)."],
          ["n", "", "The syllabus does not name the two parts of a ribosome."]
        ] },
        { p: [
          ["s", "17.1.8", "The mRNA passes through ribosomes. The ribosome assembles amino acids into protein molecules. The specific sequence of amino acids is determined by the sequence of bases in the mRNA."],
          ["c", "4.1.2", "Proteins are large molecules made from smaller molecules: amino acids."],
          ["n", "", "The syllabus says: \"knowledge of the details of transcription or translation is not required\". The film shows how it happens."]
        ], film: "ribo" },
        { p: [
          ["n", "", "The IGCSE syllabus for 2026 to 2028 does not name the rough ER. Its list of cell structures has ribosomes."]
        ] }
      ],
      ib: [
        { p: [
          ["sl", "D1.2.6", "mRNA binds to the small subunit (the small part) of the ribosome. Two tRNAs (transfer RNA: the carriers that bring the amino acids, step 2) can bind at the same time to the large subunit."],
          ["sl", "B2.2.1", "The IB guide counts nuclei, vesicles, ribosomes and the plasma membrane as organelles."]
        ], frac: true },
        { p: [
          ["sl", "D1.2.5", "Translation is the synthesis of polypeptides (chains of amino acids) from mRNA: the base sequence of the mRNA is translated into the amino acid sequence of a polypeptide."],
          ["sl", "D1.2.7", "Each carrier of the game is a transfer RNA (tRNA). Its anticodon, three bases, pairs with a codon of the mRNA by complementary base pairing. The shapes of the game stand for that fit."],
          ["sl", "D1.2.10", "The ribosome moves along the mRNA one codon at a time, and links each amino acid to the growing polypeptide chain by a peptide bond (the bond between two amino acids)."],
          ["x", "", "The film shows how translation starts, and the three sites where tRNAs bind (HL)."]
        ], film: "ribo" },
        { p: [
          ["hl", "B2.2.7", "Free ribosomes synthesize proteins for retention in the cell. Ribosomes bound to the rough endoplasmic reticulum synthesize proteins for transport within the cell and for secretion. Amylase is secreted."],
          ["x", "", "The signal is a short sequence of amino acids at the start of the polypeptide: a signal sequence."]
        ] }
      ]
    },
    done: 'Your ribosome is at the <b>rough ER</b>, with the start of the chain.',
    fact: { text: 'Electron micrographs showed one small box of a HeLa cell (a human cell grown in laboratories), only 7.5 × 4.6 × 7.5 µm. In it, a computer program found 553 130 ribosomes.', src: 'OpenOrganelle, dataset jrc_hela-2 (Xu et al. 2021, Nature 599:147; Heinrich et al. 2021, Nature 599:141)' },
    fact2: { text: 'The part of a ribosome that joins amino acids together is made of <dfn data-w="rna">RNA</dfn>, not protein.', src: 'Nissen et al. 2000, Science 289:920' }
  },
  rer: {
    part: 7, task: 'game-rer', title: 'Rough ER', kind: 'Organelle: flattened sacs of membrane', def: 'rough-er',
    needs: ['chain'], gives: ['amylase'], alsoNeeds: ['lipids'],
    intro: 'The <dfn data-w="rough-er">rough ER</dfn> (rough endoplasmic reticulum) is made of flattened sacs of membrane, joined together and joined to the nucleus. The ribosomes on its surface make it look rough.\nThe <dfn data-w="protein">proteins</dfn> they make go inside the rough ER, where they fold into their shape.\nWhen the picture is still, press <b>As it really is</b> at the bottom of the picture: it shows how packed the cell really is.',
    steps: [
      { play: 'dock', text: 'Amylase must leave the cell. Proteins that leave the cell are made on the rough ER.\nA ribosome does not choose where it works: the chain decides. The first 15 amino acids of amylase are a <b>signal</b> (red, under the ribosome). The signal means: this protein must leave the cell.\nA small particle in the cytosol (not drawn) binds to the signal, then to the membrane of the rough ER. So the ribosome is held on a channel: a tunnel through the membrane.\n<mark class="do">Press <b data-cw="dock" data-b>Dock</b>.</mark>' },
      { play: 'grow', text: 'The ribosome joins more amino acids. The chain goes through the channel and into the rough ER.\n<mark class="do">Press <b data-cw="go" data-b>Go</b>.</mark>' },
      { play: 'cut', text: 'The signal is not part of amylase. While the chain is still growing, a cutting enzyme in the membrane of the rough ER removes the signal.\n<mark class="do">Press Go closer</mark> to see the signal. <mark class="do">Then press <b data-cw="cut" data-b>Cut</b>.</mark>' },
      { play: 'fold', text: 'The chain cannot work yet: first the chain must fold into its shape.\n<mark class="do">Press Fold.</mark> The camera goes closer: each bead is one amino acid.\nIn the folded chain, look for a groove: the <dfn data-w="active-site">active site</dfn>, where part of a starch chain fits. This shape is what lets amylase work.' },
      { play: 'bud', text: 'Amylase leaves the rough ER in a vesicle, a small organelle that is a bubble of membrane: a piece of the membrane of the rough ER bends round amylase and closes.\nSo every vesicle removes some membrane, and the rough ER needs new <dfn data-w="lipid">lipids</dfn>.\n<mark class="do">Press <b data-cw="budline" data-b>Bud to make a vesicle</b>.</mark>' }
    ],
    course: {
      igcse: [
        { p: [
          ["n", "", "The IGCSE syllabus for 2026 to 2028 does not name the rough ER or the channel. It names vesicles only at a synapse (14.1.8, 14.1.9). Its list of cell structures has ribosomes."]
        ] },
        { p: [
          ["s", "17.1.8", "The ribosome assembles amino acids into protein molecules."]
        ] },
        null,
        { p: [
          ["s", "17.1.6", "Different sequences of amino acids give different shapes to protein molecules."],
          ["c", "5.1.2", "Enzymes are proteins that are involved in all metabolic reactions, where they function as biological catalysts."],
          ["c", "5.1.4", "The shape of the active site of an enzyme is complementary to its substrate. For amylase the substrate is starch."],
          ["s", "5.1.7", "An enzyme is specific because of the complementary shape and fit of its active site with its substrate."],
          ["s", "17.1.7", "DNA controls cell function by controlling the production of proteins, including enzymes."]
        ] },
        null
      ],
      ib: [
        { p: [
          ["sl", "A2.2.6", "Eukaryote cells have membrane-bound organelles in their cytoplasm, including endoplasmic reticulum, a Golgi apparatus and vesicles."],
          ["hl", "B2.2.7", "Ribosomes bound to the rough endoplasmic reticulum synthesize proteins for transport within the cell and for secretion."],
          ["x", "", "The particle is the signal recognition particle. It stops the ribosome for a short time, until the ribosome is on the channel."]
        ] },
        { out: ['peptide'], p: [
          ["sl", "B1.2.2", "Amino acids are linked by condensation reactions: each new peptide bond releases one molecule of water."],
          ["sl", "B1.2.4", "20 amino acids are coded for in the genetic code. A peptide chain can have any number of them, in any order. The chain of amylase has 496 amino acids once its signal is removed."]
        ] },
        { p: [
          ["hl", "D1.2.18", "Many polypeptides must be modified before they can function. Removing a signal sequence is one modification. The example of the guide is the two-stage modification of pre-proinsulin to insulin: its first stage, in the rough ER, also removes a signal sequence."]
        ] },
        { out: ['fold'], p: [
          ["hl", "B1.2.7", "Primary structure: the sequence of amino acids, and the position of each one, determines the three-dimensional shape of a protein. So the same chain folds into the same precise shape every time."],
          ["hl", "B1.2.8", "Secondary structure: parts of the chain coil into alpha helices, and parts form beta-pleated sheets, stabilized by hydrogen bonding in regular positions. Amylase has both."],
          ["hl", "B1.2.9", "Tertiary structure depends on hydrogen bonds, ionic bonds, disulfide covalent bonds (between pairs of cysteines) and hydrophobic interactions, all between R-groups (the side chains that make each amino acid different)."],
          ["hl", "B1.2.10", "Amylase is soluble in water: in such proteins the <dfn data-w=\"hydrophobic\">hydrophobic</dfn> amino acids are clustered in the core."],
          ["hl", "B1.2.12", "Amylase is a globular protein: its rounded shape, with an active site, suits its function as an enzyme."]
        ] },
        { p: [
          /* (18 Nov 2026, a science read: B2.2.1 leads. With B2.2.9 first, the one line on show while the bare membrane
             bends was "Clathrin … helps a piece of membrane bend and form a vesicle", and a pupil concluded that clathrin
             makes THIS vesicle. The line on the rough ER's own coat stands right after B2.2.9 and reads by itself: at SL,
             where B2.2.9 is hidden, "another coat protein" referred to nothing. The second read: it names no clathrin, an
             HL word; where clathrin coats vesicles is shown at the Golgi apparatus and at the way out) */
          ["sl", "B2.2.1", "In the IB guide, a vesicle is an organelle."],
          ["hl", "B2.2.9", "Vesicles transport materials within the cell. Clathrin is a coat protein: it helps a piece of membrane bend and form a vesicle."],
          ["x", "", "The vesicles that leave the rough ER have their own coat protein, called COPII."],
          ["hl", "B2.2.8", "The Golgi apparatus processes proteins and prepares them for secretion: the next place of your mission."]
        ] }
      ]
    },
    done: 'A vesicle carries your amylase to the <b>Golgi apparatus</b>.',
    fact: { text: 'In a pancreas cell of a guinea pig, which makes digestive enzymes, 60 % of all its membrane is rough ER, and less than 1 % is smooth ER.', src: 'Bolender 1974, Journal of Cell Biology 61:269; Alberts et al., Molecular Biology of the Cell, 4th edition, table 12-2' }
  },
  ser: {
    course: {
      igcse: [
        /* (18 Nov 2026; Daniel, 17 Nov: add it. 0610 4.1.2(c), the model is the ribosomes' 4.1.2 line. Never alone beside
           the membrane lipid, which has two tails and a head 0610 does not name: the picture's switch "Membrane lipid ·
           Fat" shows a fat beside it, play.js serStrip) */
        { p: [
          ["c", "4.1.2", "Fats and oils are large molecules made from smaller molecules: fatty acids and glycerol."],
          ["n", "", "The IGCSE syllabus for 2026 to 2028 does not name the smooth ER. It names the cell membrane (2.1.1), but not the lipids of the membrane."]
        ] },
        null
      ],
      ib: [
        { out: ['phospholipid'], p: [
          ["sl", "B1.1.9", "A phospholipid forms by condensation reactions (each one joins two molecules and releases water): one glycerol links two fatty acids and one phosphate group. A triglyceride (a fat) has three fatty acids instead."]
        ] },
        { p: [
          ["sl", "B1.1.12", "A phospholipid is amphipathic: its head is hydrophilic (attracted to water) and its tails are hydrophobic (not attracted to water). So in water, phospholipids form a bilayer by themselves."]
        ] }
      ]
    },
    part: 8, task: 'game-ser', title: 'Smooth ER', kind: 'Organelle: tubes of membrane, joined together', def: 'smooth-er',   /* (22 Nov 2026, Daniel's yes: not "a network of tubes": "network" is the word for the cytoskeleton, which is not an organelle; the rough ER's words the same) */
    needs: ['energy'], gives: ['lipids'],
    intro: 'The <dfn data-w="smooth-er">smooth ER</dfn> is made of tubes of membrane, joined together, with no ribosomes. It makes <dfn data-w="lipid">lipids</dfn> (fats, oils and similar molecules).\nA membrane is two layers of lipids, with <dfn data-w="protein">proteins</dfn> in it. Every new <dfn data-w="vesicle">vesicle</dfn> removes a piece of the ER membrane, so the ER needs new lipids.\nThe rough ER (the ER with ribosomes) and the smooth ER are one joined membrane, so new lipids spread from one to the other. This cell has only a little smooth ER.',
    steps: [
      { play: 'lipid', text: 'You look into one tube of the smooth ER, cut across. The ring is its membrane: two layers of lipids. Behind it, the tube runs on.\nA membrane lipid has a head and two tails.\n<mark class="do">Press <b data-cw="serjoin" data-b>Join</b> three times</mark> to make <span data-cw="serthree">three lipids</span>. Each one uses some energy.' },
      { play: 'layer', text: 'The new lipids join the membrane of the ER: two layers, with their tails inside. The ER is one joined membrane, so they spread through it to the rough ER.\n<mark class="do">Press Add to the membrane.</mark>' }
    ],
    done: 'The ER membrane has new lipids, so the rough ER can make vesicles.',
    fact: { text: 'In your liver cells, a lot of smooth ER helps to make some drugs and poisons harmless.', src: 'Alberts et al., Molecular Biology of the Cell, 4th edition, chapter 12 (free at NCBI Bookshelf)' }
  },
  golgi: {
    course: {
      igcse: [
        { p: [
          ["n", "", "The IGCSE syllabus for 2026 to 2028 does not name the Golgi apparatus or lysosomes. It names vesicles only at a synapse (14.1.8, 14.1.9)."]
        ] },
        null,
        null,
        null
      ],
      ib: [
        { p: [
          ["hl", "B2.2.8", "The Golgi apparatus processes proteins and prepares them for secretion. Vesicles from the rough ER fuse with the first sac of the stack."]
        ] },
        { p: [
          ["hl", "B2.2.8", "Enzymes in the sacs modify the proteins: for example, they add chains of sugars. Some amylase molecules leave as <dfn data-w=\"glycoprotein\">glycoproteins</dfn> (proteins with sugars attached)."]
        ] },
        { p: [
          ["sl", "B2.2.3", "A lysosome keeps its digestive enzymes in a compartment of their own. So the enzymes stay concentrated, and digestion is kept apart from the rest of the cell: incompatible processes are separated."],
          ["hl", "B2.2.9", "The vesicles that carry these enzymes to lysosomes form with a coat of clathrin, a protein that helps a piece of membrane bend and form a vesicle."]
        ] },
        { p: [
          ["sl", "A2.2.11", "This is a secretory vesicle: it stores protein until the cell secretes it. In electron micrographs, secretory vesicles look large and dark: label them with this function when you annotate a drawing."]
        ] }
      ]
    },
    part: 9, task: 'game-golgi', title: 'Golgi apparatus', kind: 'Organelle: a stack of flattened sacs', def: 'golgi',
    needs: ['amylase'], gives: ['packed'],
    intro: 'The <dfn data-w="golgi">Golgi apparatus</dfn> is a stack of flattened, curved sacs. It modifies <dfn data-w="protein">proteins</dfn> (for example, it adds sugars to some of them), sorts them, and packages them into vesicles.\nVesicles from the rough ER join it on one side; new vesicles leave from the other side.',
    steps: [
      { play: 'join', text: '<mark class="do">Press <b data-cw="goljoin" data-b>Join</b>:</mark> the vesicle joins the first sac of the stack.' },
      { play: 'through', text: 'Your amylase moves through the stack, sac by sac.\n<mark class="do">Press Next sac until it reaches the last one.</mark>' },
      { play: 'sortgame', text: 'Enzymes for a <dfn data-w="lysosome">lysosome</dfn> (a small sac of enzymes that digest old parts of the cell) carry a label (a sugar with a phosphate group) that sends them there.\nAmylase has no label: amylase molecules join together and are packed into large vesicles, which leave the cell.\n<mark class="do">Press each protein, then the vesicle where it belongs.</mark>' },
      { play: 'package', text: 'A new vesicle forms, tightly packed with amylase molecules.\n<mark class="do">Press <b data-cw="package" data-b>Package</b>.</mark>' }
    ],
    done: 'You carry a vesicle packed with amylase. It must reach the top of the cell, next to the duct.',
    fact: { text: 'Camillo Golgi saw it in 1898, in nerve cells. For about 50 years many scientists thought it was a mistake made by his stain, until electron microscopes showed it in the 1950s.', src: 'Dröscher 1998, Histochemistry and Cell Biology 109:425' }
  },
  tracks: {
    course: {
      igcse: [
        { p: [
          ["n", "", "The IGCSE syllabus for 2026 to 2028 does not name microtubules or motor proteins."]
        ] },
        null
      ],
      ib: [
        { p: [
          ["sl", "A2.2.6, B2.2.1", "Microtubules and microfilaments form the cytoskeleton. The IB guide does not count the cytoskeleton as an organelle."],
          ["sl", "C1.2.2", "Each step of dynein uses one ATP: ATP supplies the energy to move parts of the cell."]
        ] },
        { out: ['mitosis'], p: [
          ["sl", "D2.1.6", "In mitosis and meiosis, microtubules and their motor proteins move the chromosomes."]
        ] }
      ]
    },
    part: 10, task: 'game-tracks', title: 'Microtubules', onPic: 'Microtubule', plural: true, kind: 'Cytoskeleton: not an organelle', def: 'microtubule',
    needs: ['packed', 'energy'], gives: ['top'],
    intro: '<dfn data-w="microtubule">Microtubules</dfn> are thin hollow tubes made of <dfn data-w="protein">protein</dfn>. They are like tracks: <dfn data-w="motor-protein">motor proteins</dfn> walk along them, one step at a time, and carry vesicles.\nMicrotubules are part of the <dfn data-w="cytoskeleton">cytoskeleton</dfn>, a network of protein fibres through the whole cell. The cytoskeleton is not one separate part, so microtubules are not organelles.\nIn this cell most microtubules start at the top of the cell and grow towards the base. The motor protein on your vesicle walks towards their top end.',
    steps: [
      { play: 'grab', text: 'Nothing here is drawn bigger than it is. So the camera comes very close to the microtubule next to your vesicle: it is only 25 <dfn data-w="nanometre">nanometres</dfn> (nm) wide.\nScientists found dynein, a <dfn data-w="motor-protein">motor protein</dfn>, on vesicles like yours in the pancreas, another gland. So the motor protein here is probably dynein.\nEach of its two heads is a ring, 14 nm across.\nYour vesicle is 900 nm across. The dots in it are amylase molecules, each 8 nm long: a real vesicle is full of them.\n<mark class="do">Press Attach:</mark> dynein\'s two heads hold the microtubule.' },
      { play: 'maze', text: 'From far away the motor protein is too small to see: the glow shows where it is. The game draws the microtubules three times thicker, so that you can see them.\nEach step uses energy. Where two microtubules cross, the vesicle can step onto the other one.\n<mark class="do">At each crossing, choose the microtubule that leads to the top of the cell.</mark>' }
    ],
    done: 'Your vesicle waits at the top of the cell, with the others.',
    fact: { text: 'In a test tube at body temperature (37 °C), dynein with dynactin moves about 900 nanometres every second: about the width of your vesicle.', src: 'McKenney et al. 2014, Science 345:337' },
    fact2: { text: 'Scientists are still studying which motor proteins carry these vesicles in gland cells.', src: 'Kraemer et al. 1999, European Journal of Cell Biology 78:265' }
  },
  exit: {
    course: {
      igcse: [
        { p: [
          ["c", "14.1.6", "Salivating when you taste food is a reflex action: the salivary gland is the effector."]
        ] },
        null,
        null
      ],
      ib: [
        { p: [
          ["sl", "C2.2.5", "The nerve ending and this gland cell meet at a synapse: a junction between a neuron and an effector cell. The signal passes in one direction only."],
          ["hl", "C2.1.9, C2.1.10", "The nerve ending releases noradrenaline. Noradrenaline binds a receptor in the plasma membrane that is coupled to a G protein: the G protein activates an enzyme that makes cAMP (cyclic AMP). cAMP is the second messenger: it carries the signal inside the cell. Adrenaline (epinephrine) works in the same way."],
          ["hl", "C2.1.5", "A neurotransmitter acts only near the place where it is released. A hormone, such as insulin, travels in the blood to distant cells."]
        ] },
        { p: [
          ["hl", "B2.1.13", "Membranes are fluid, so the membrane of the vesicle can fuse with the plasma membrane. This release of material from the cell is <dfn data-w=\"exocytosis\">exocytosis</dfn>."]
        ] },
        { p: [
          ["hl", "B2.1.13, B2.2.9", "The cell removes membrane from its surface by <dfn data-w=\"endocytosis\">endocytosis</dfn>: the membrane folds inwards and forms a small vesicle. Clathrin, a coat protein, helps the membrane bend into a pit."]
        ] }
      ]
    },
    part: 11, task: 'game-exit', title: 'Cell membrane: the way out', kind: 'The cell membrane: part of every cell', y7: true, def: 'cell-membrane',
    needs: ['top'], gives: ['saliva'],
    intro: 'The vesicles wait at the top of the cell.\nWhen you smell or taste food, nerves send a message to your salivary glands. The message makes the vesicles join the cell membrane and release their amylase.',
    steps: [
      { play: 'smell', text: '<mark class="do">Press Taste the bread.</mark>\nA nerve ending next to the cell releases a chemical, and the message spreads through the cell.' },
      { play: 'fuse', text: 'The vesicle joins the cell membrane and opens to the outside.\n<mark class="do">Press <b data-cw="release" data-b>Release</b>.</mark>\nThis is <dfn data-w="exocytosis">exocytosis</dfn> (exo = out, cyto = cell).' },
      { play: 'flatten', text: 'The amylase leaves the cell and enters the duct (a tube that carries saliva to your mouth). The membrane of the vesicle becomes part of the cell membrane.\nLater, a piece of this membrane bends inwards into a small pit, closes into a small vesicle and returns inside the cell, so the membrane is used again.\n<span class="step__x"><b>Explorer · beyond the Year 7 list.</b> The pit and the small vesicle are coated with a protein called clathrin, which helps the membrane bend.</span>' }
    ],
    done: 'Your amylase is in the saliva. Does it work? Test it.',
    fact: { text: 'Your salivary glands make between 1 and 1.5 litres of saliva every day.', src: 'de Almeida et al. 2008, Journal of Contemporary Dental Practice 9(3):72' },
    fact2: { text: 'Amylase is one of the most common <dfn data-w="protein">proteins</dfn> in your saliva.', src: 'Peyrot des Gachons and Breslin 2016, Current Diabetes Reports 16:102' }
  },
  test: {
    course: {
      igcse: [
        { p: [
          ["c", "4.1.3", "The iodine solution test for starch: iodine solution turns from orange-brown to blue-black when starch is present."],
          ["c", "5.1.1, 5.1.2", "A catalyst increases the rate of a chemical reaction and is not changed by the reaction. Enzymes are proteins that act as biological catalysts."]
        ] },
        null,
        { p: [
          ["s", "7.4.6", "Amylase breaks down starch to maltose."]
        ] }
      ],
      ib: [
        { p: [
          ["sl", "C1.1.1", "Amylase is a catalyst: it increases the rate of the reaction. Well B is the control: without the enzyme, the starch hardly changes in 5 minutes."]
        ], bench: true },
        { p: [
          ["hl", "C1.1.11", "This reaction happens outside the cells that made the enzyme: an extracellular enzyme-catalysed reaction."]
        ] },
        { p: [
          ["sl", "B1.1.3", "Amylase digests starch by hydrolysis: one water molecule is split for each bond broken between two glucose units. The product is maltose."],
          ["hl", "D2.2.1", "This is gene expression: the amylase gene was transcribed (copied into mRNA) and translated (read by ribosomes), and now its protein product has an effect you can see."]
        ] }
      ]
    },
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
