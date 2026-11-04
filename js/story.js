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
  { n: 11, title: 'Cell membrane: the way out' }, { n: 12, title: 'Does your amylase work?' }
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
      { play: 'simple', text: 'In Year 7 you learn five parts of an animal <dfn data-w="cell">cell</dfn>: the <dfn data-w="cell-membrane">cell membrane</dfn>, the <dfn data-w="cytoplasm">cytoplasm</dfn>, the <dfn data-w="nucleus">nucleus</dfn>, the <dfn data-w="mitochondria">mitochondria</dfn> and the <dfn data-w="ribosome">ribosomes</dfn>. In the cell around you, only these five are lit now.' },
      { play: 'full', text: 'An <dfn data-w="electron-microscope">electron microscope</dfn> shows much more: it uses a beam of electrons instead of light, so it shows much smaller details. <mark class="do">Press Show everything.</mark> Each new structure appears with its name.' },
      { play: 'organelles', text: 'An <dfn data-w="organelle">organelle</dfn> is a membrane-bound structure (surrounded by a <dfn data-w="membrane">membrane</dfn>) with a specific function, such as the nucleus. Some structures have no membrane, so they are <b>not</b> organelles: the ribosomes, the nucleolus, the microtubules and the centrosome. <dfn data-w="vesicle">Vesicles</dfn>, small bubbles of membrane, last only a short time: each one forms, then joins another membrane. So they are not organelles either. The <dfn data-w="cytoplasm">cytoplasm</dfn> is the <dfn data-w="cytosol">cytosol</dfn> (a jelly-like fluid) and the organelles in it, but not the nucleus.' },
      { play: 'mission', text: 'This cell is in your <dfn data-w="salivary-gland">salivary gland</dfn>. It makes <dfn data-w="amylase">amylase</dfn>, the <dfn data-w="enzyme">enzyme</dfn> in your saliva that digests <dfn data-w="starch">starch</dfn>. <b>Your mission: make amylase and release it from the cell.</b> In this game, each place in the cell does one job. A place that is asleep wakes when you bring what it needs.' }
    ],
    done: 'You know the map. Two places are awake: <b>the nucleus</b> and <b>the way in</b>, at the base of the cell. Choose one.',
    fact: { text: 'Your body is made of about 37 trillion cells (37 000 000 000 000).', src: 'Bianconi et al. 2013, Annals of Human Biology 40:463' }
  },
  wayin: {
    part: 2, task: 'game-wayin', title: 'Cell membrane: the way in', kind: 'The cell membrane: part of every cell', y7: true, def: 'cell-membrane',
    needs: [], gives: ['glucose', 'oxygen', 'amino'],
    intro: 'You are at the base of the cell. The tissue fluid (the liquid round the cells) and a <dfn data-w="capillary">capillary</dfn> full of blood are below its membrane. The cell needs substances from the blood: <dfn data-w="glucose">glucose</dfn> and <dfn data-w="oxygen">oxygen</dfn> for respiration, and <dfn data-w="amino-acid">amino acids</dfn> to make proteins. The <dfn data-w="cell-membrane">cell membrane</dfn> controls what enters and leaves the cell.',
    steps: [
      { play: 'gate', text: '<mark class="do">Press each substance that the cell needs, so that it enters the cell.</mark> Oxygen passes straight through the membrane. Glucose and amino acids pass through <dfn data-w="carrier-protein">carrier proteins</dfn> in it. A <dfn data-w="red-blood-cell">red blood cell</dfn> is a whole cell, much too large to pass through the membrane: press it to see.' },
      { play: 'co2', text: '<dfn data-w="carbon-dioxide">Carbon dioxide</dfn> is a waste product of respiration. <mark class="do">Press the carbon dioxide to release it into the blood.</mark>' }
    ],
    done: 'You carry glucose, oxygen and amino acids. The <b>mitochondria</b> are awake now.',
    fact: { text: 'A red blood cell is about 7.5 µm across: almost half as wide as this cell. In the narrowest capillaries, red blood cells bend to pass.', src: 'OpenStax, Anatomy and Physiology 2e, 18.2 (open textbook)' }
  },
  mito: {
    part: 3, task: 'game-mito', title: 'Mitochondria', plural: true, kind: 'Organelle: two membranes', y7: true, def: 'mitochondria',
    needs: ['glucose', 'oxygen'], gives: ['energy'],
    intro: '<dfn data-w="mitochondria">Mitochondria</dfn> (one: a mitochondrion) are the site of <dfn data-w="aerobic-respiration">aerobic respiration</dfn>, which releases energy from glucose, using oxygen. A mitochondrion has two membranes. The inner membrane is folded: the folds give a large surface, where most of the energy is released.',
    steps: [
      { play: 'split', text: 'In the <dfn data-w="cytosol">cytosol</dfn>, each glucose molecule is first split into two smaller molecules. <mark class="do">Press the glucose to split it.</mark>' },
      { play: 'feed', text: '<mark class="do">Press the two smaller molecules, then the oxygen,</mark> to move them into the mitochondrion.' },
      { play: 'respire', text: 'Aerobic respiration: <b>carbon dioxide</b> and <b>water</b> are produced, and energy is released. The cell uses this energy for its work: to join amino acids, to make lipids and to move vesicles.' }
    ],
    done: 'The energy bar is full. Every job of the cell uses some: when it is low, return here with more glucose and oxygen.',
    fact: { text: 'Mitochondria have their own small piece of DNA. You inherit all of it from your mother.', src: 'MedlinePlus Genetics, Mitochondrial DNA (US National Library of Medicine)' }
  },
  nucleus: {
    part: 4, task: 'game-nucleus', title: 'Nucleus', kind: 'Organelle: two membranes, with pores', y7: true, def: 'nucleus',
    needs: [], gives: ['mrna'],
    intro: 'The <dfn data-w="nucleus">nucleus</dfn> contains the genetic material (<dfn data-w="dna">DNA</dfn>) and controls the activities of the cell. The DNA is in 46 long threads, the <dfn data-w="chromosome">chromosomes</dfn>. Two membranes surround the nucleus, the <dfn data-w="nuclear-envelope">nuclear envelope</dfn>, with holes in them: the <dfn data-w="nuclear-pore">nuclear pores</dfn>.',
    steps: [
      { play: 'enter', text: 'You become even smaller, and you enter the nucleus through a nuclear pore. In a cell that is not dividing, every chromosome is a long, thin thread. (Chromosomes look like an X only when a cell divides.)' },
      { play: 'findchr', text: 'A <dfn data-w="gene">gene</dfn> is a short section of DNA that carries the instructions for making one protein. The amylase gene is on chromosome 1, the largest kind of chromosome. <mark class="do">Press the threads to find chromosome 1.</mark>' },
      { play: 'findgene', text: '<mark class="do">Press the glowing section: the amylase gene.</mark>' },
      { play: 'copy', text: 'The DNA never leaves the nucleus. The cell makes a copy of the gene instead, called <dfn data-w="mrna">mRNA</dfn> (messenger RNA). <mark class="do">Press Copy to make the copy.</mark>' },
      { play: 'export', text: '<mark class="do">Choose how the copy leaves the nucleus.</mark>' }
    ],
    done: 'You carry the copy of the amylase gene. Next it needs a <b>ribosome</b>: the nucleolus makes the parts of ribosomes.',
    fact: { text: 'The DNA in one of your cells is about 2 metres long, but it fits into a nucleus about 6 µm across.', src: 'Annunziato 2008, Nature Education 1:26 (open)' },
    fact2: { text: 'Some people have more copies of the amylase gene than others. People from groups that have eaten foods rich in starch for thousands of years have more copies, on average.', src: 'Perry et al. 2007, Nature Genetics 39:1256' }
  },
  nucleolus: {
    part: 5, task: 'game-nucleolus', title: 'Nucleolus', kind: 'Not an organelle: no membrane', def: 'nucleolus',
    needs: [], gives: ['parts'], inside: 'nucleus',
    intro: 'The <dfn data-w="nucleolus">nucleolus</dfn> is a dense region inside the nucleus. It makes the two parts of <dfn data-w="ribosome">ribosomes</dfn>, a small part and a large part. Each part is made of RNA (a molecule like DNA), which the nucleolus makes, and proteins, which enter the nucleus from the cytoplasm. It has no membrane, so it is not an organelle.',
    steps: [
      { play: 'small', text: '<mark class="do">Press Build to make the small part.</mark>' },
      { play: 'large', text: '<mark class="do">Press Build to make the large part.</mark>' },
      { play: 'out', text: 'The two parts leave the nucleus separately, through nuclear pores. They join only in the cytoplasm, on a copy of a gene. <mark class="do">Press each part: it leaves through a nuclear pore.</mark>' }
    ],
    done: 'You carry the two ribosome parts.',
    fact: { text: 'A growing human cell can make thousands of ribosome parts every minute.', src: 'Lewis and Tollervey 2000, Science 288:1385' }
  },
  ribosome: {
    part: 6, task: 'game-ribosome', title: 'Ribosomes', plural: true, kind: 'Not an organelle: no membrane', y7: true, def: 'ribosome',
    needs: ['mrna', 'parts', 'amino', 'energy'], gives: ['chain'],
    intro: '<dfn data-w="ribosome">Ribosomes</dfn> are very small structures where proteins are made. A ribosome reads the copy of a gene and joins amino acids in the order the copy gives. A <dfn data-w="protein">protein</dfn> is a long chain of amino acids. Ribosomes have no membrane, so they are not organelles.',
    steps: [
      { play: 'assemble', text: '<mark class="do">Press Join:</mark> the small part attaches to the copy, then the large part joins it. Now it is a whole ribosome.' },
      { play: 'translate', text: 'The copy is a code: each part of the code means one amino acid. Each amino acid arrives on a small carrier molecule. <mark class="do">Press the carrier that matches the code under the ribosome.</mark> Every amino acid you join uses some energy.' },
      { play: 'where', text: 'The first part of the amylase chain is a <b>signal</b>: it means that this protein must be made on the rough ER. Proteins that the cell releases are made there. <mark class="do">Choose where this ribosome must work.</mark>' }
    ],
    done: 'The ribosome is moving to the <b>rough ER</b>, with the start of the chain.',
    fact: { text: 'Electron micrographs showed one small box of a HeLa cell (a human cell grown in laboratories), only 7.5 × 4.6 × 7.5 µm. In it, a computer program found 553 130 ribosomes.', src: 'OpenOrganelle, dataset jrc_hela-2 (Xu et al. 2021, Nature 599:147; Heinrich et al. 2021, Nature 599:141)' },
    fact2: { text: 'The part of a ribosome that joins amino acids together is made of RNA, not protein.', src: 'Nissen et al. 2000, Science 289:920' }
  },
  rer: {
    part: 7, task: 'game-rer', title: 'Rough ER', kind: 'Organelle: flattened sacs of membrane', def: 'rough-er',
    needs: ['chain'], gives: ['amylase'], alsoNeeds: ['lipids'],
    intro: 'The <dfn data-w="rough-er">rough ER</dfn> (rough endoplasmic reticulum) is a network of flattened sacs, joined to the nucleus. The ribosomes on its surface make it look rough. The proteins they make go inside the rough ER, where they fold into their shape.',
    steps: [
      { play: 'dock', text: '<mark class="do">Press Dock:</mark> the signal takes the ribosome to a channel in the membrane of the rough ER, a tunnel through the membrane.' },
      { play: 'grow', text: 'The ribosome joins more amino acids. The chain goes through the channel, inside the rough ER. <mark class="do">Press Go.</mark>' },
      { play: 'cut', text: 'While the chain is still growing, an enzyme in the membrane of the rough ER removes the signal. <mark class="do">Press Cut.</mark>' },
      { play: 'fold', text: '<mark class="do">Press Fold.</mark> The chain folds into its shape. A groove in it, the <dfn data-w="active-site">active site</dfn>, is where starch fits: the shape is what lets amylase work.' },
      { play: 'bud', text: 'Amylase leaves the rough ER in a vesicle, a small bubble of membrane: a piece of the membrane of the rough ER closes round it. So every vesicle removes some membrane, and the ER needs new <dfn data-w="lipid">lipids</dfn>. <mark class="do">Press Bud to make a vesicle.</mark>' }
    ],
    done: 'A vesicle carries your amylase to the <b>Golgi apparatus</b>.',
    fact: { text: 'In a pancreas cell of a guinea pig, which makes digestive enzymes, 60 % of all its membrane is rough ER, and less than 1 % is smooth ER.', src: 'Bolender 1974, Journal of Cell Biology 61:269; Alberts et al., Molecular Biology of the Cell, 4th edition, table 12-2' }
  },
  ser: {
    part: 8, task: 'game-ser', title: 'Smooth ER', kind: 'Organelle: a network of tubes', def: 'smooth-er',
    needs: ['energy'], gives: ['lipids'],
    intro: 'The <dfn data-w="smooth-er">smooth ER</dfn> is a network of tubes with no ribosomes. It makes <dfn data-w="lipid">lipids</dfn> (fats, oils and similar molecules). A membrane is two layers of lipids, with proteins in it. Every new <dfn data-w="vesicle">vesicle</dfn> removes a piece of the ER membrane, so the ER needs new lipids. The rough ER and the smooth ER are one joined membrane, so new lipids spread from one to the other. This cell has only a little smooth ER.',
    steps: [
      { play: 'lipid', text: 'A membrane lipid has a head and two tails. <mark class="do">Press Join three times</mark> to make three lipids. Each one uses some energy.' },
      { play: 'layer', text: 'The new lipids join the membrane of the ER: two layers, with their tails inside. The ER is one joined membrane, so they spread through it to the rough ER. <mark class="do">Press Add to the membrane.</mark>' }
    ],
    done: 'The ER membrane has new lipids, so the rough ER can make vesicles.',
    fact: { text: 'In your liver cells, a lot of smooth ER helps to make some drugs and poisons harmless.', src: 'Alberts et al., Molecular Biology of the Cell, 4th edition, chapter 12 (free at NCBI Bookshelf)' }
  },
  golgi: {
    part: 9, task: 'game-golgi', title: 'Golgi apparatus', kind: 'Organelle: a stack of flattened sacs', def: 'golgi',
    needs: ['amylase'], gives: ['packed'],
    intro: 'The <dfn data-w="golgi">Golgi apparatus</dfn> is a stack of flattened, curved sacs. It modifies proteins (for example, it adds sugars to some of them), sorts them, and packages them into vesicles. Vesicles from the rough ER join it on one side; new vesicles leave from the other side.',
    steps: [
      { play: 'join', text: '<mark class="do">Press Join:</mark> the vesicle joins the first sac of the stack.' },
      { play: 'through', text: 'Your amylase moves through the stack, sac by sac. <mark class="do">Press Next sac until it reaches the last one.</mark>' },
      { play: 'sortgame', text: 'Enzymes for a <dfn data-w="lysosome">lysosome</dfn> (a small sac of enzymes that digest old parts of the cell) carry a label that sends them there. Amylase has no label: amylase molecules stick together and are packed into large vesicles, which leave the cell. <mark class="do">Press each protein, then the vesicle where it belongs.</mark>' },
      { play: 'package', text: 'A new vesicle forms, tightly packed with amylase molecules. <mark class="do">Press Package.</mark>' }
    ],
    done: 'You carry a vesicle packed with amylase. It must reach the top of the cell, next to the duct.',
    fact: { text: 'Camillo Golgi saw it in 1898, in nerve cells. For about 50 years many scientists thought it was a mistake made by his stain, until electron microscopes showed it in the 1950s.', src: 'Dröscher 1998, Histochemistry and Cell Biology 109:425' }
  },
  tracks: {
    part: 10, task: 'game-tracks', title: 'Microtubules', plural: true, kind: 'Not an organelle: no membrane', def: 'microtubule',
    needs: ['packed', 'energy'], gives: ['top'],
    intro: '<dfn data-w="microtubule">Microtubules</dfn> are thin hollow tubes made of protein. They are like tracks: <dfn data-w="motor-protein">motor proteins</dfn> walk along them, one step at a time, and carry vesicles. Microtubules have no membrane, so they are not organelles. In this cell most microtubules start at the top of the cell and grow towards the base. The motor protein on your vesicle walks towards their top end.',
    steps: [
      { play: 'grab', text: '<mark class="do">Press Attach:</mark> a motor protein holds the vesicle.' },
      { play: 'maze', text: 'Each step uses energy. Where two microtubules cross, the vesicle can step onto the other one. <mark class="do">At each crossing, choose the microtubule that leads to the top of the cell.</mark>' }
    ],
    done: 'Your vesicle waits at the top of the cell, with the others.',
    fact: { text: 'Kinesin, a motor protein, walks in steps of 8 nanometres: about 125 000 steps to cross 1 millimetre.', src: 'Svoboda et al. 1993, Nature 365:721; Yildiz et al. 2004, Science 303:676' },
    fact2: { text: 'Scientists are still studying which motor proteins carry these vesicles in gland cells.', src: 'Kraemer et al. 1999, European Journal of Cell Biology 78:265' }
  },
  exit: {
    part: 11, task: 'game-exit', title: 'Cell membrane: the way out', kind: 'The cell membrane: part of every cell', y7: true, def: 'cell-membrane',
    needs: ['top'], gives: ['saliva'],
    intro: 'The vesicles wait at the top of the cell. When you smell or taste food, nerves send a message to your salivary glands. The message makes the vesicles join the cell membrane and release their amylase.',
    steps: [
      { play: 'smell', text: '<mark class="do">Press Smell the bread.</mark> A nerve ending next to the cell releases a chemical, and the message spreads through the cell.' },
      { play: 'fuse', text: 'The vesicle joins the cell membrane and opens to the outside. <mark class="do">Press Release.</mark> This is <dfn data-w="exocytosis">exocytosis</dfn> (exo = out, cyto = cell).' },
      { play: 'flatten', text: 'The amylase leaves the cell and enters the duct. The membrane of the vesicle becomes part of the cell membrane. Later, new vesicles form from this membrane and return inside the cell, so the membrane is used again.' }
    ],
    done: 'Your amylase is in the saliva. Does it work? Test it.',
    fact: { text: 'Your salivary glands make between 1 and 1.5 litres of saliva every day.', src: 'de Almeida et al. 2008, Journal of Contemporary Dental Practice 9(3):72' },
    fact2: { text: 'Amylase is one of the most common proteins in your saliva.', src: 'Peyrot des Gachons and Breslin 2016, Current Diabetes Reports 16:102' }
  },
  test: {
    part: 12, task: 'game-test', title: 'Does your amylase work?', tag: 'The test',
    needs: ['saliva'], gives: [],
    intro: 'In a food test, <dfn data-w="iodine">iodine solution</dfn> turns blue-black when <dfn data-w="starch">starch</dfn> is present. If amylase has digested the starch into a sugar (maltose), the iodine solution stays orange-brown.',
    steps: [
      { play: 'wells', text: 'Two wells of a spotting tile hold starch solution. <mark class="do">Press Add saliva for well A, and Add water for well B.</mark> Well B is the control: it is the same as well A, but with water instead of saliva.' },
      { play: 'wait', text: '<mark class="do">Press Wait 5 minutes.</mark>' },
      { play: 'iodine', text: 'Now test both wells for starch. <mark class="do">Press Add iodine solution.</mark>' }
    ],
    done: 'Well A stays orange-brown: there is no starch left, because your amylase digested it. Well B turns blue-black: water has no amylase, so the starch is still there. <b>Mission complete.</b>',
    fact: { text: 'Chew a piece of bread for a minute: it starts to taste a little sweet. That is your amylase, digesting starch into sugar.' }
  }
};

/* the map's order for keyboards and phones (the list of places), and where the game starts */
window.PLACE_ORDER = ['wayin', 'nucleus', 'nucleolus', 'mito', 'ribosome', 'ser', 'rer', 'golgi', 'tracks', 'exit', 'test'];
