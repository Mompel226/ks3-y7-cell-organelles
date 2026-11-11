/* ============================================================
   text.js — the words of the plant-cell branch of the Y7 cell game (11 Nov 2026): "Where glucose comes from".
   The loop it closes (Daniel, 11 Nov 2026): light falls on a potato leaf; in a palisade cell, chloroplasts make glucose;
   the plant stores it as starch, in the leaf by day and then in the potato; the cell wall and the permanent vacuole keep
   the cell firm; the pupil eats the potato, and their amylase starts to digest the starch (as in well A of the game's
   test); maltase makes glucose; it passes through the villi into the blood and reaches the way in of the game's cell.
   The fence (his Year 7 lessons, read 11 Nov 2026: KO_Cells and Organisation, Plant-and-Animal-Cells, Bacteria-and-Enzymes
   s16–17, The Digestive System s35 and s52, Food Tests):
   - Year 7 learns the three structures and their jobs (chloroplasts absorb light to make glucose; the cell wall, made of
     cellulose, strengthens the cell and supports the plant; the permanent vacuole, filled with cell sap, keeps the cell
     rigid), that plant cells have mitochondria too, amylase → maltose, maltase → glucose, villi → blood.
   - Photosynthesis and its word equation are YEAR 8: they stand once, in a violet "Year 8" box (the one extension
     violet, memory level-colours-never-blank). The Year 8 lab report is light intensity against the rate of
     photosynthesis, so here light is only on or off: no dial, no rate, no bubbles counted.
   - The tube that carries sugar is not named; the sugar that moves is called "sugar". Never "amylase makes glucose".
   Words pupils read (memory eal-korean-students, year7-text-and-instructions): "you", short sentences, one idea a
   paragraph ("\n"), a new word explained first and then named, no idioms, no phrasal verbs, never "amount".
   <dfn data-w="key"> opens a word's meaning (the shared KS3 glossary); <mark class="do"> is what to press now.
   A step: id (its motion is the scene's step of the same id), scene (the picture's module in js/plant/), where (its stop
   on the loop), text; say: what a press answers.
   ============================================================ */
export const TITLE = 'Where glucose comes from';
export const KIND = 'A palisade cell of a potato leaf';

/* the loop's stops, in order: the small map in the panel lights the one the step is at */
export const LOOP = [
  { id: 'leaf', t: 'leaf', s: 'glucose is made' },
  { id: 'potato', t: 'potato', s: 'stored as starch' },
  { id: 'mouth', t: 'mouth', s: 'amylase: maltose' },
  { id: 'gut', t: 'small intestine', s: 'maltase: glucose' },
  { id: 'blood', t: 'blood', s: 'carried to every cell' },
  { id: 'cell', t: 'your cell', s: 'the way in' }
];

export const STEPS = [
  { id: 'leaf', scene: 'leaf', where: 'leaf',
    text: 'The glucose at the way in of your cell came from your food. A plant made it.\nThis is a small piece of a potato leaf, with its cells. The piece is about a quarter of a millimetre thick.\nLight falls on the top of the leaf. Under its top layer is a row of tall cells: the <b>palisade cells</b>.' },
  { id: 'cell', scene: 'leaf', where: 'leaf',
    text: 'The other cells are faint now, so that you see one palisade cell alone.\nIt is tall and narrow: about 72 <dfn data-w="micrometre">micrometres</dfn> (µm) long and 16 µm wide.\nYour salivary gland cell is about 16 µm across. It is drawn beside the palisade cell only to compare their sizes: it is not in the leaf.' },
  { id: 'open', scene: 'leaf', where: 'leaf',
    text: 'The front of the cell is cut away, so that you can see inside.\nLike your salivary gland cell, it has a <dfn data-w="cell-membrane">cell membrane</dfn>, <dfn data-w="cytoplasm">cytoplasm</dfn>, a <dfn data-w="nucleus">nucleus</dfn> and <dfn data-w="mitochondria">mitochondria</dfn>.\nIt also has <dfn data-w="ribosome">ribosomes</dfn>, ER and a <dfn data-w="golgi">Golgi apparatus</dfn>, as your cell has. From here the ribosomes and the ER are too small to see; the small gold stacks are its Golgi apparatus.' },
  { id: 'three', scene: 'leaf', where: 'leaf',
    text: 'A plant cell has three structures that your salivary gland cell does not have.\n<mark class="do">Press each <b>What is this?</b> to find the three.</mark>',
    say: {
      chl: '<b>Chloroplasts</b>: the green <dfn data-w="organelle">organelles</dfn>. A <dfn data-w="chloroplast">chloroplast</dfn> absorbs light to make glucose. This cell has many chloroplasts.',
      wall: 'The <b>cell wall</b>: a strong layer outside the cell membrane. The <dfn data-w="cell-wall">cell wall</dfn> strengthens the cell and supports the plant.\nIn the picture, the wall is the yellow band at the edge of the cell and the cell membrane is the pink line just inside it. They are very thin: zoom towards the edge (scroll, or press +) to see both.',
      vac: 'The <b>permanent vacuole</b>: the large space in the middle of the cell, inside its own thin membrane. The <dfn data-w="permanent-vacuole">permanent vacuole</dfn> is filled with <dfn data-w="cell-sap">cell sap</dfn>, and it keeps the cell rigid (firm).\nIn the picture the cell sap is pale blue, so that you can see it. Real cell sap in a leaf cell has no colour.',
      done: 'You found the three: chloroplasts, the cell wall and the permanent vacuole.'
    } },
  { id: 'chloroplast', scene: 'leaf', where: 'leaf',
    text: 'This is one <dfn data-w="chloroplast">chloroplast</dfn>, cut open. It is about 5 µm long. (A red blood cell is 7.5 µm across.)\nA chloroplast is an <dfn data-w="organelle">organelle</dfn>. Two membranes surround it.\nInside it are stacks of flat membranes, joined to each other by single sheets of membrane. They hold <dfn data-w="chlorophyll">chlorophyll</dfn>, a green pigment that absorbs light. Chlorophyll makes a leaf green.\nRound them is a watery liquid, with many <dfn data-w="enzyme">enzymes</dfn>.' },
  { id: 'light', scene: 'leaf', where: 'leaf',
    text: 'The light is off now. The camera is very close to one stack. The bar shows 5 <dfn data-w="nanometre">nanometres</dfn> (nm): 5 millionths of a millimetre. Every molecule is drawn at its true size.\n<dfn data-w="carbon-dioxide">Carbon dioxide</dfn> comes from the air, through tiny holes in the leaf. Water comes from the soil, through the roots.\n<mark class="do">Press ☀ Light on.</mark>',
    say: {
      on: '<p>In the light, the chloroplast uses carbon dioxide and water to make <b>glucose</b>. <b>Oxygen</b> is released.</p><p>The energy comes from the light that chlorophyll absorbs.</p><div class="y8"><span class="y8__k">Year 8</span><p>This is <dfn data-w="photosynthesis">photosynthesis</dfn>:</p><p class="y8__eq">carbon dioxide + water → glucose + oxygen</p><p>In the picture: 6 carbon dioxide molecules and 6 water molecules make 1 glucose molecule and 6 oxygen molecules.</p></div><p><mark class="do">Press ☾ Light off</mark> to see what happens in the dark, or press Next step.</p>',
      off: 'In the dark, the chloroplast makes no glucose: chlorophyll has no light to absorb.'
    } },
  { id: 'starch', scene: 'leaf', where: 'leaf',
    text: 'The cell uses some of its glucose for respiration, in its own mitochondria: a plant cell needs energy too.\nSome of the sugar moves at once to other parts of the plant. The chloroplast stores some: it joins many glucose molecules in a long chain.\n<mark class="do">Press Join.</mark>',
    say: { join: 'A chain of glucose molecules: this is <dfn data-w="starch">starch</dfn>. Only the start of the chain is drawn: a real starch molecule has thousands of glucose molecules.' } },
  { id: 'grain', scene: 'leaf', where: 'leaf',
    text: 'The camera moves back. Very many starch molecules lie together in a <b>starch grain</b>, inside the chloroplast.\nBy day, in the light, the grain grows.\nAt night, the plant changes the starch into sugar again, and the sugar moves to other parts of the plant.' },
  { id: 'wall', scene: 'leaf', where: 'leaf',
    text: 'A leaf must stay flat, with its top to the light. So its cells must be firm.\nThis is the <dfn data-w="cell-wall">cell wall</dfn> at the edge of the cell, from very near: the bar shows the scale.\nThe wall is about 200 nm thick. It is made of <dfn data-w="cellulose">cellulose</dfn>: long, strong fibres, in layers.\nEvery plant cell has its own wall. On the left is the wall of the next cell.' },
  { id: 'membrane', scene: 'leaf', where: 'leaf',
    text: 'Nearer still. The <dfn data-w="cell-membrane">cell membrane</dfn> touches the inside of the cell wall. It is two layers of <dfn data-w="lipid">lipids</dfn>, with proteins in them, like the membrane at the way in of your cell.\nThe membrane is thin and soft: the wall is about 40 times thicker.\nThe membrane controls what enters and leaves the cell. The wall does not: water and dissolved substances pass through it freely.' },
  { id: 'vacuole', scene: 'leaf', where: 'leaf',
    text: 'The whole cell again.\nThe <dfn data-w="permanent-vacuole">permanent vacuole</dfn> fills most of the cell. It is full of <dfn data-w="cell-sap">cell sap</dfn>: water with sugars and salts dissolved in it.\nThe cell sap pushes the cytoplasm against the cell wall (the arrows). The wall is strong, so the cell is firm: it is <b>rigid</b>.\n<mark class="do">Press 💧 Lose water.</mark>',
    say: {
      soft: 'With less water, the cell sap pushes less on the wall: the cell is soft. When many cells are soft, the plant <dfn data-w="wilt">wilts</dfn>: its leaves bend downwards.\n<mark class="do">Press 💧 Take in water.</mark>',
      firm: 'Water enters the cell again. The cell is rigid: with the cells round it, it holds the leaf flat, in the light.'
    } },
  { id: 'potato', scene: 'potato', where: 'potato',
    text: 'Sugar from the leaves moves through the plant to the potatoes, under the ground.\nThis is one cell of a potato. It changes the sugar into starch again and stores it in large grains: food for a new plant next year.\nThis cell has no chloroplasts: it is in the dark. It still has a cell wall, as every plant cell has.' },
  { id: 'iodine', scene: 'potato', where: 'potato',
    text: 'You know the test for starch: <dfn data-w="iodine">iodine solution</dfn> turns blue-black when starch is present.\n<mark class="do">Press Add iodine solution.</mark>',
    say: { iodine: 'Blue-black: the grains are <b>starch</b>. A potato is a store of starch, made from the glucose of the leaves.' } },
  { id: 'mouth', scene: 'gut', where: 'mouth',
    text: 'You eat the potato. In your mouth, saliva mixes with the food.\nSaliva contains <dfn data-w="amylase">amylase</dfn>: the enzyme that your salivary gland cells make and release.\nThis is part of one starch molecule, and one amylase molecule, at their true sizes.\n<mark class="do">Press Digest.</mark>',
    say: {
      digest: 'Amylase digests starch into <dfn data-w="maltose">maltose</dfn>: a sugar made of two glucose molecules. In your mouth, the digestion of starch only starts.',
      wellA: '<b>Your amylase did this in well A</b> of your test: no starch was left, so the iodine solution stayed orange-brown.',
      later: 'This is the job of the amylase in your mission. At the end of the game, you test it on starch.'
    } },
  /* the small intestine, in the order of understanding: where the food is, then nearer and nearer, then the glucose's way out */
  { id: 'folds', scene: 'gut', where: 'gut',
    text: 'You swallow the food. It passes through your stomach and enters the <dfn data-w="small-intestine">small intestine</dfn>: a long tube, about 2.5 centimetres wide.\nThis is a short piece of it, cut in half so that you can see inside. Food passes through the middle.\nWhere the wall is cut, you see its layers: muscle on the outside, and inside it connective tissue with blood vessels.\nThe wall has folds. The same connective tissue fills each fold. Tiny structures like fingers cover every fold and the wall between the folds: the <dfn data-w="villi">villi</dfn>. The small intestine has millions of them.' },
  { id: 'villus', scene: 'gut', where: 'gut',
    text: 'The camera moves to one villus. It is less than 1 millimetre long.\nThis villus is cut in half, so that you can see inside. Its wall is one layer of cells.\nJust under the cells is a net of blood <dfn data-w="capillary">capillaries</dfn>. Blood arrives in the red vessel and leaves in the blue vessel. The small red discs are red blood cells: they travel with the blood.' },
  { id: 'cells', scene: 'gut', where: 'gut',
    text: '<p>Nearer: five cells of the wall of the villus, side by side. Each cell is tall and narrow.</p><p>A blood <dfn data-w="capillary">capillary</dfn> lies just under the cells. Red blood cells pass through it, one after another.</p><div class="y8"><span class="y8__k">IGCSE</span><p>The surface of each cell has thousands of <b>microvilli</b>: tiny fingers of the cell membrane. They give the cell a much larger surface, so more glucose enters the cell in the same time.</p></div>' },
  { id: 'gut', scene: 'gut', where: 'gut',
    text: 'Nearer still: the camera is at the surface of one cell, and the molecules are at their true sizes.\nIn the small intestine, amylase from the pancreas digests the rest of the starch into maltose.\nAnother enzyme works here: <dfn data-w="maltase">maltase</dfn>. It is attached to the membrane of the cells of the villi.\n<mark class="do">Press Digest.</mark>',
    say: { digest: 'Maltase digests each maltose molecule into two <b>glucose</b> molecules. The digestion of starch is complete.' } },
  { id: 'blood', scene: 'gut', where: 'blood',
    text: 'The camera moves back to the whole villus.\nFrom here a glucose molecule is far too small to see: a glow shows where each one is.\n<mark class="do">Press Absorb.</mark>',
    say: { absorb: 'Glucose passes through the cells of the wall of the villus, through <dfn data-w="carrier-protein">carrier proteins</dfn> in their cell membranes (you met a carrier protein at the way in of your cell), and into the blood of the capillaries. The blood leaves the villus and carries the glucose to every cell of your body.' } },
  { id: 'loop', scene: 'ring', where: 'cell',
    text: 'The loop is closed.\nThe blood brings the glucose to your salivary gland cell. It enters through a <dfn data-w="carrier-protein">carrier protein</dfn>, at the way in.\nThere the cell uses it in respiration, which releases the energy to make more amylase.\nSo the glucose in your cell was made in a leaf, with the energy of light.' }
];

/* the end of the branch: its checks (js/questions.js, part 14), then this */
export const DONE = 'You followed glucose from a leaf to your own cell: made in a chloroplast, stored as starch, digested by amylase and maltase, and carried by the blood.';
export const FACT = { text: 'A potato is not a root. It is a tuber: the swollen end of a stem that grows under the ground. Its "eyes" are buds, and each one can grow into a new plant, using the stored starch.', src: 'OpenStax, Biology 2e, 30.2 Stems (open textbook)' };
/* the IGCSE names of a step's picture (view.js "the IGCSE names"): the key that opens with the switch. Each row: the
   name's key in the scene, the name as the 0610 syllabus writes it (6.2: "chloroplasts, cuticle, guard cells and stomata,
   upper and lower epidermis, palisade mesophyll, spongy mesophyll, air spaces, vascular bundles, xylem and phloem"), and
   what it is in plain words. Functions as 0610 gives them (8.1: xylem, water and mineral ions; phloem, sucrose and amino
   acids). The rows are in the order of the pins on a phone: from the top of the leaf down. */
export const XKEY = {
  leaf: { intro: 'For IGCSE, you learn these names for the parts of a leaf.', rows: [
    ['xcut', 'cuticle', 'a thin layer of wax; it reduces the loss of water'],
    ['xupper', 'upper epidermis', 'the top layer of cells; light passes through it'],
    ['xpal', 'palisade mesophyll', 'the layer of palisade cells; most photosynthesis happens here'],
    ['xbundle', 'vascular bundle', 'a vein: xylem and phloem together'],
    ['xxylem', 'xylem', 'tubes that transport water and mineral ions to the leaf'],
    ['xphloem', 'phloem', 'tubes that transport sucrose and amino acids from the leaf'],
    ['xspongy', 'spongy mesophyll', 'the cells below the palisade cells, with air spaces between them'],
    ['xair', 'air space', 'gases diffuse through the air spaces to and from the cells'],
    ['xlower', 'lower epidermis', 'the bottom layer of cells'],
    ['xguard', 'guard cell', 'two guard cells open and close each stoma'],
    ['xstoma', 'stoma', 'a hole (plural: stomata); gases enter and leave the leaf through it']
  ] }
};
export const CHECKS = ['p14-sort-plant', 'p14-gaps-chloroplast', 'p14-gaps-firm', 'p14-q-maltose', 'p14-order-loop'];
export const TASK = 'game-plant';
