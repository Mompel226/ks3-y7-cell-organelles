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
    text: '<p>Nearer: five cells of the wall of the villus, side by side. Each cell is tall and narrow.</p><p>A blood <dfn data-w="capillary">capillary</dfn> lies just under the cells. Red blood cells pass through it, one after another.</p><p>The surface of each cell has thousands of <b>microvilli</b>: tiny fingers of the cell membrane.</p>' },
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
   upper and lower epidermis, palisade mesophyll, spongy mesophyll, air spaces, vascular bundles, xylem and phloem": twelve
   names), and
   what it is in plain words. Functions as 0610 gives them (8.1: xylem, water and mineral ions; phloem, sucrose and amino
   acids). The rows are in the order of the pins on a phone: from the top of the leaf down. */
export const XKEY = {
  leaf: { intro: 'For IGCSE, you learn these names for the parts of a leaf.', rows: [
    ['xcut', 'cuticle', 'a waxy, waterproof layer; it reduces water loss'],
    ['xupper', 'upper epidermis', 'the top layer of cells; light passes through it'],
    ['xpal', 'palisade mesophyll', 'the layer of palisade cells; most photosynthesis happens here'],
    ['xchl', 'chloroplasts', 'inside the mesophyll cells; most of them are in the palisade layer'],
    ['xbundle', 'vascular bundle', 'a vein: xylem and phloem together'],
    ['xxylem', 'xylem', 'the tissue that transports water and mineral ions, and supports the plant'],
    ['xphloem', 'phloem', 'the tissue that transports sucrose and amino acids'],
    ['xspongy', 'spongy mesophyll', 'the cells below the palisade cells, with air spaces between them'],
    ['xair', 'air space', 'gases diffuse through the air spaces to and from the cells'],
    ['xlower', 'lower epidermis', 'the bottom layer of cells; most of the stomata are in it'],
    ['xguard', 'guard cell', 'one of the pair of cells round a stoma; they open and close it'],
    ['xstoma', 'stoma', 'a pore (plural: stomata): carbon dioxide diffuses in; oxygen and water vapour diffuse out']
  ] }
};
/* ---------------- the course layers (12 Nov 2026) ----------------
   Daniel: "just like for all the main quest, you can always add a toggle for IGCSE and then a toggle for IB … extra
   information that the IGCSE covers … related to what you're showing here … only toggles that are activated once the
   student is done with the key stage 3, and the key stage 3 should be easy to understand."
   COURSE[course][step id]: what that course asks about what THIS step's picture shows, and nothing else. The Year 7
   words above do not change. Shown in a violet box under the step's words while the course's switch is on (view.js).
   IGCSE: Cambridge 0610, syllabus for 2026 to 2028; the statement numbers are beside each entry; the wording follows the
   syllabus and the keywords of Daniel's own labs (the glossary, the Plants Lab, the Digestion Lab), so that a pupil
   meets one word for one thing: turgid and flaccid, breaks down … to, protein carriers, pore; where the Year 7 word
   differs, the box joins the two ("turgid (the firm, rigid cell of this step)").
   IB: the DP Biology guide, first assessment 2025; each entry is [level, words]: 'SL' = under "SL and HL", 'HL' =
   under "Additional higher level"; the guide's own terms (plasma membrane, sap vacuole, photosynthetic pigments at SL).
   The guide has no topic on the human digestive system (no amylase, maltose, villus): the gut steps rest only on its
   general statements, and say so. No sentence here claims what an examination will or will not ask. */
export const COURSE = {
  igcse: {
    /* 6.2.1, 6.2.3; 8.3.1, 8.3.2; 8.3.5 (S); the names: XKEY.leaf (6.2.2, 8.1.1) */
    leaf: ['Most leaves are thin and have a large surface area: more light is absorbed, and gases diffuse only a short distance.',
      '<b>Carbon dioxide</b> diffuses into the leaf through the stomata, and through the air spaces to every mesophyll cell.',
      '<b>Transpiration</b> is the loss of water vapour from leaves. Water evaporates from the surfaces of the mesophyll cells into the air spaces, and then diffuses out of the leaf through the stomata as water vapour.',
      'The water lost is replaced from the xylem. That draws up a column of water molecules, held together by forces of attraction between water molecules: this is the <b>transpiration pull</b>.'],
    /* 2.1.6 (c); 2.2.1; 2.2.3 (S) */
    cell: ['A <b>palisade mesophyll cell</b> is a specialised cell: its function is photosynthesis.',
      'magnification = image size ÷ actual size. 1 mm = 1000 µm, so this cell is 0.072 mm long.'],
    /* 2.1.1, 2.1.4 */
    open: ['You compare a plant cell with an animal cell with these structures: cell wall, cell membrane, nucleus, cytoplasm, chloroplasts, ribosomes, mitochondria and vacuoles.',
      'The ER and the Golgi apparatus are not in the list of the IGCSE syllabus.',
      'Mitochondria are where aerobic respiration takes place. Cells that use much energy have many.'],
    /* 2.1.1; 6.1.3; 4.1.2; 3.2.6 */
    three: ['<b>Chlorophyll</b> is a green pigment that is found in chloroplasts.',
      'The cell wall is made of <b>cellulose</b>. It supports the cell and keeps its shape, and it stops the cell bursting when water enters.',
      'The large permanent vacuole is filled with cell sap: it stores water and helps to support the cell. Plants are supported by the pressure of water inside the cells pressing outwards on the cell wall.'],
    /* 6.1.3, 6.1.4; 6.1.6 (b) */
    chloroplast: ['Chlorophyll transfers energy from light into energy in chemicals, for the synthesis of carbohydrates. Magnesium ions are needed to make chlorophyll.',
      'The IGCSE syllabus names no part inside a chloroplast.'],
    /* 6.1.1, 6.1.2; 6.1.10 (S); 8.2.3. Not here: limiting factors (6.1.11): the picture has light only on or off */
    light: ['<b>Photosynthesis</b> is the process by which plants synthesise carbohydrates from raw materials using energy from light.',
      'carbon dioxide + water → glucose + oxygen, in the presence of light and chlorophyll',
      '6CO<sub>2</sub> + 6H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>',
      'The water comes from the roots, through the xylem, to the mesophyll cells.'],
    /* 6.1.5; 6.1.6 */
    starch: ['The carbohydrates made in photosynthesis have five uses: <b>starch</b> as an energy store; <b>cellulose</b> to build cell walls; <b>glucose</b> used in respiration to provide energy; <b>sucrose</b> for transport in the phloem; nectar to attract insects for pollination.',
      'Nitrate ions are needed to make amino acids, and so proteins: the plant combines them with some of the glucose it has made.'],
    /* 6.1.5 (a), (d); 8.4.1 (S); 6.1.7 */
    grain: ['Starch is insoluble, so a store of starch does not draw water into the cell by osmosis.',
      'The sugar that leaves the cell is <b>sucrose</b>. <b>Translocation</b> is the movement of sucrose and amino acids in the phloem, from sources to sinks.',
      'To investigate photosynthesis, a plant is first de-starched: it is kept in the dark until its leaves have no starch.'],
    /* 4.1.2 (a); 6.1.5 (b); 3.2.6 */
    wall: ['<b>Cellulose</b> is a large molecule made from many glucose molecules.',
      'The cell wall and the cell membrane are two separate layers.'],
    /* 3.1.1, 3.1.3; 3.2.2, 3.2.7 (S); 3.3.1, 3.3.3 (S) */
    membrane: ['The cell membrane is <b>partially permeable</b>: it lets some substances through but not others.',
      '<b>Diffusion</b>: the net movement of particles from a region of their higher concentration to a region of their lower concentration (down a concentration gradient), as a result of their random movement.',
      '<b>Osmosis</b>: the net movement of water molecules from a region of higher water potential (a dilute solution) to a region of lower water potential (a concentrated solution), through a partially permeable membrane.',
      '<b>Active transport</b>: the movement of particles from a region of lower concentration to a region of higher concentration, using energy from respiration. Protein carriers in the membrane move them.'],
    /* 3.2.6; 3.2.8 (S); 8.3.7 (S) */
    vacuole: ['Water enters the cell by osmosis. The contents press outwards on the cell wall: this is <b>turgor pressure</b>, and the cell is <b>turgid</b> (the firm, rigid cell of this step).',
      'When the cell loses water, the vacuole shrinks. The contents no longer press the cell membrane out against the cell wall, so turgor pressure falls and the cell becomes <b>flaccid</b> (the soft cell). A plant wilts when it loses water by transpiration faster than its roots absorb water.',
      '<b>Plasmolysis</b>: a plant cell in a concentrated solution loses much water by osmosis, and its cell membrane separates from the cell wall. The soft cell of this step is flaccid, not plasmolysed.'],
    /* 8.4.1 to 8.4.3 (S); 8.1.1 (b) */
    potato: ['Sucrose reaches the potato in the phloem. A part of a plant that releases sucrose or amino acids is a <b>source</b>; a part that uses or stores them is a <b>sink</b>.',
      'Starch is insoluble and is not translocated: the phloem carries sucrose, and the tuber converts sucrose to starch to store it. A potato tuber is a sink in summer. In spring it is a source: its starch is converted to sucrose for the new shoots.',
      'Only the cells in the green parts of a plant have chloroplasts. A tuber is underground and has no chlorophyll, so it cannot photosynthesise.'],
    /* 4.1.3 */
    iodine: ['The <b>iodine solution test</b> for starch: iodine solution is orange-brown, and it turns blue-black where starch is present.'],
    /* 7.4.1, 7.4.3, 7.4.4; 7.4.6 (S); 5.1.4 */
    mouth: ['<b>Chemical digestion</b> is the breakdown of large insoluble molecules into small soluble molecules.',
      'Amylase breaks down starch to maltose, a reducing sugar. Amylase is secreted by the salivary glands and by the pancreas. Salivary amylase acts in the mouth: it begins the chemical digestion of starch.',
      'Benedict\'s solution is the test for reducing sugars, such as maltose and glucose.',
      'The active site of an enzyme has a shape that is complementary to its substrate: amylase acts on starch, not on protein or fat.'],
    /* 7.2.1, 7.2.2 (c); 7.5.1; 7.5.3 (S) */
    folds: ['The syllabus names two parts of the small intestine: the duodenum, then the ileum. The small intestine is the region where nutrients are absorbed.',
      '<b>Absorption</b> is the movement of nutrients from the intestines into the blood.',
      'Villi and microvilli increase the internal surface area of the small intestine. The folds of the wall are not named in the IGCSE syllabus.'],
    /* 7.5.4, 7.5.5 (S); 9.3.5 (S) */
    villus: ['A villus has an epithelium one cell thick with microvilli, a network of capillaries, a lacteal, and goblet cells that make mucus.',
      'The <b>epithelium</b> is one cell thick, so the diffusion distance is short.',
      'A dense network of capillaries carries the absorbed glucose and amino acids away, which keeps the concentration gradient steep.',
      'The <b>lacteal</b> in the centre absorbs fatty acids and glycerol.'],
    /* 7.5.3 (S); 7.4.6 (b) (S); 3.3.1, 12.1.1 */
    cells: ['Each of these cells is an epithelial cell. A villus is built from many cells; microvilli belong to the cell membrane of one cell.',
      'Microvilli give the cell a much larger surface area, so more glucose is absorbed in the same time.',
      'Active transport needs much energy, so these cells have many mitochondria.'],
    /* 7.4.6 (S); 7.4.2; 5.1.7 (S) */
    gut: ['Maltase breaks down maltose to glucose on the membranes of the epithelium lining the small intestine.',
      'The membrane in this picture is the membrane of one microvillus: maltose meets maltase on the surface of the cell.',
      'Amylase from the pancreas acts in the small intestine. Chemical digestion produces small soluble molecules that can be absorbed.'],
    /* 3.3.1; 3.3.3 (S); 9.4.3 (d); 9.3.6 (S); 7.5.5 (S) */
    blood: ['Glucose is taken into the epithelial cells by <b>active transport</b>: protein carriers (the carrier proteins of this step) move it, using energy from respiration. It then diffuses into the capillary. The syllabus for 2026 to 2028 does not name this process for glucose; older syllabuses did.',
      'The glucose is carried dissolved in the <b>plasma</b>. The blood travels first to the liver, in the <b>hepatic portal vein</b>, and then to the rest of the body.'],
    /* 7.2.2 (d); 12.2.1, 12.2.2; 12.2.3 (S); 12.1.1 */
    loop: ['<b>Assimilation</b> is the uptake and use of nutrients by cells.',
      'Aerobic respiration: glucose + oxygen → carbon dioxide + water',
      'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O',
      'The energy released is used, for example, for protein synthesis: your cell uses it to make amylase.']
  },
  ib: {
    /* B3.1.7, B3.1.8, B3.1.9 (SL); B3.2.7, A1.1.3 (SL) */
    leaf: [['SL', 'Adaptations of a leaf for gas exchange: the waxy cuticle, the epidermis, air spaces, spongy mesophyll, stomatal guard cells and veins. You draw a plan diagram of the tissues in a transverse section of a leaf.'],
      ['SL', 'Transpiration is a consequence of gas exchange in a leaf. The water lost puts the water in the xylem under tension; cohesion between water molecules keeps the column of water continuous.']],
    /* A2.2.2 (SL) */
    cell: [['SL', 'Microscopy skills: you calculate actual size and magnification, and you produce a scale bar, as on this picture.']],
    /* A2.2.6, B2.2.1 (SL); B2.2.7, B2.2.8 (AHL) */
    open: [['SL', 'The IB name of the cell membrane is the <b>plasma membrane</b>. A eukaryotic cell has a plasma membrane round a compartmentalized cytoplasm with 80S ribosomes, a nucleus inside a double membrane with pores, and organelles with membranes: mitochondria, endoplasmic reticulum, Golgi apparatus, vesicles and vacuoles.'],
      ['SL', 'The cell wall, the cytoskeleton and the cytoplasm are not considered organelles.'],
      ['HL', 'The structure and function of free ribosomes, of the rough endoplasmic reticulum and of the Golgi apparatus (processing and secretion of protein).']],
    /* A2.2.8, A2.2.10, A2.2.11 (SL) */
    three: [['SL', 'Cells of animals, fungi and plants differ in their cell walls (present or not, and what they are made of), in the size and function of their vacuoles, and in chloroplasts and other plastids.'],
      ['SL', 'The IB name of this vacuole is the <b>sap vacuole</b>. You identify the chloroplast, the sap vacuole and the cell wall in electron micrographs, and you draw and annotate them with their functions.']],
    /* C1.3.5 (SL); B2.2.5, C1.3.14 (AHL) */
    chloroplast: [['SL', 'Photosynthetic pigments absorb specific wavelengths of light. An electron in the pigment molecule is excited: light energy is transformed to chemical energy. An absorption spectrum shows which wavelengths a pigment absorbs.'],
      ['HL', 'The flat membranes are <b>thylakoids</b> and the liquid is the <b>stroma</b>. Adaptations of the chloroplast: the large surface area of thylakoid membranes with photosystems, the small volume of fluid inside thylakoids, and the enzymes and substrates of the Calvin cycle kept together in the stroma.']],
    /* C1.3.1 to C1.3.3 (SL); C1.3.11 to C1.3.16 (AHL) */
    light: [['SL', 'Light energy is transformed to chemical energy when carbon compounds are produced. Carbon dioxide is converted to glucose, using hydrogen obtained by splitting water. Oxygen is a by-product: it comes from the water.'],
      ['HL', 'On the membrane (the light-dependent reactions): photolysis of water in photosystem II, ATP production by chemiosmosis, and reduction of NADP by photosystem I. In the liquid (the Calvin cycle): Rubisco fixes carbon, and reduced NADP and ATP are used to make triose phosphate.']],
    /* B1.1.2, B1.1.5 (SL); C1.1.3 (SL) */
    starch: [['SL', 'Starch is a polysaccharide: a polymer of alpha-glucose monomers, linked by condensation reactions. Making it is an anabolic reaction.'],
      ['SL', 'Starch stores energy well: coiling and branching make it compact, its large molecules are relatively insoluble, and glucose is added or removed easily by condensation and hydrolysis.']],
    /* B1.1.3, B1.1.5 (SL) */
    grain: [['SL', 'At night the store is mobilized: alpha-glucose monomers are removed from starch by hydrolysis reactions.']],
    /* B1.1.6 (SL) */
    wall: [['SL', 'Cellulose is a structural polysaccharide. Its beta-glucose monomers alternate in orientation, which gives straight chains; the chains are grouped in bundles and cross-linked with hydrogen bonds.']],
    /* B2.1.1, B2.1.2, B2.1.4, B2.1.8, B2.1.10 (SL) */
    membrane: [['SL', 'The plasma membrane is a bilayer of phospholipids. Its hydrophobic core has a low permeability to large molecules and to hydrophilic particles, such as ions and polar molecules.'],
      ['SL', 'Integral proteins are embedded in the bilayer; peripheral proteins are attached to one of its surfaces. This is the fluid mosaic model. Facilitated diffusion and active transport make the membrane selectively permeable.']],
    /* D2.3.2, D2.3.3, D2.3.6 (SL); D2.3.8 to D2.3.10 (AHL) */
    vacuole: [['SL', 'Water moves by osmosis from a less concentrated solution to a more concentrated solution. In a hypotonic medium, water enters a cell with a wall and <b>turgor pressure</b> develops. In a hypertonic medium, the cell is plasmolysed.'],
      ['HL', 'Water moves from a higher to a lower water potential. In a cell with a wall, the water potential is the sum of the solute potential and the pressure potential.']],
    /* B1.1.5, A2.2.8 (SL); B3.2.18 (AHL) */
    potato: [['SL', 'Plant cells have chloroplasts and other plastids.'],
      ['', 'In a potato cell each starch grain is inside a plastid that has no pigments. The guide says "other plastids" and does not name them.'],
      ['HL', 'Translocation of sap in the phloem: carbon compounds are loaded into the sieve tubes at sources and unloaded at sinks, with the help of companion cells.']],
    /* B1.1.3, C1.1.3, C1.1.4, C1.1.5 (SL); C1.1.11 (AHL) */
    mouth: [['SL', 'Digestion of a polymer into monomers is a <b>hydrolysis</b> reaction: a water molecule is split for each bond that is broken. It is a catabolic reaction. In this step the product is maltose: two glucose monomers still joined. Maltase makes the monomers, in the small intestine.'],
      ['SL', 'An enzyme is a globular protein with an active site. In induced-fit binding, the substrate and the enzyme both change shape.'],
      ['HL', 'Chemical digestion in the gut is an extracellular enzyme-catalysed reaction.'],
      ['', 'The IB guide has no topic on the human digestive system: it does not name amylase, maltose or maltase.']],
    /* B4.2.4 (SL) */
    folds: [['SL', 'Animals have holozoic nutrition: food is ingested, digested internally, absorbed and assimilated.'],
      ['', 'The guide names no part of the wall of the small intestine: no fold and no villus.']],
    /* B3.2.1 (SL) */
    villus: [['SL', 'Capillaries are adapted for exchange: a large surface area, because they branch and are narrow; thin walls; and, where exchange must be rapid, fenestrations.']],
    /* A2.2.10, A2.2.11, B2.3.6 (SL); B2.3.7 (AHL) */
    cells: [['SL', 'You identify microvilli in electron micrographs, and you draw and annotate them with their function. The exchange of materials across the surface of a cell depends on the area of that surface.'],
      ['HL', 'Microvilli are an adaptation that increases the surface area-to-volume ratio of a cell.']],
    /* C1.1.6, B2.1.4 (SL) */
    gut: [['SL', 'A substrate molecule and an active site must come together by movement. Some enzymes are immobilized: they are embedded in a membrane, as maltase is here.']],
    /* B2.1.7 (SL); B2.1.16 (AHL) */
    blood: [['SL', 'Active transport moves specific particles across a membrane against a concentration gradient. Pump proteins do this with energy from ATP.'],
      ['', 'No SL statement says how glucose is absorbed. A pump protein does not move the glucose itself: the HL line names the protein that does.'],
      ['HL', 'Cells of the small intestine absorb glucose with sodium-dependent glucose cotransporters: an example of indirect active transport.']],
    /* C1.2.1, C1.2.2, C1.2.4, C1.2.5 (SL); D3.3.3 (SL) */
    loop: [['SL', 'Cell respiration produces ATP, using energy released from carbon compounds such as glucose. ATP distributes energy within the cell, for example for the synthesis of macromolecules: here, amylase. Aerobic respiration needs mitochondria.'],
      ['SL', 'The concentration of glucose in the blood is regulated by the hormones insulin and glucagon.']]
  }
};
/* on the end card, once the five checks are right */
export const LVNOTE = 'Do you study IGCSE or IB Biology? At the top of this panel, <b>Your course</b> now has two switches. Switch one on, then press <b>↺ From the start</b>: every step adds what your course asks about its picture.';
export const CHECKS = ['p14-sort-plant', 'p14-gaps-chloroplast', 'p14-gaps-firm', 'p14-q-maltose', 'p14-order-loop'];
export const TASK = 'game-plant';
