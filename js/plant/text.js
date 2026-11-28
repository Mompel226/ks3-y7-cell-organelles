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
/* the ring's last link, from your cell back to the leaf (28 Nov 2026, the picture inspection: it was drawn as the
   others, an arrow of "the loop of glucose" from "your cell" to "leaf", and glucose does not go that way). What does
   go from your cell to a leaf is the carbon dioxide of respiration, through the air: the game's own Year 7 words (the
   way in: "Carbon dioxide is a waste product of respiration"; this branch's light step: "Carbon dioxide comes from
   the air"). So that link is dashed, and the large ring names what it carries */
export const LOOPBACK = { t: 'carbon dioxide', s: 'from respiration' };

export const STEPS = [
  { id: 'leaf', scene: 'leaf', where: 'leaf',
    text: 'The glucose at the way in of your cell came from your food. A plant made it.\nThis is a small piece of a potato leaf, with its cells. The piece is about a quarter of a millimetre thick.\nLight falls on the top of the leaf. Under its top layer is a row of tall cells: the <b><span data-cw="palisades">palisade cells</span></b>.' },
  { id: 'cell', scene: 'leaf', where: 'leaf',
    text: 'The other cells are faint now, so that you see one <span data-cw="palisade">palisade cell</span> alone.\nIt is tall and narrow: about 72 <dfn data-w="micrometre">micrometres</dfn> (µm) long and 16 µm wide.\nYour salivary gland cell is about 16 µm across. It is drawn beside the <span data-cw="palisade">palisade cell</span> only to compare their sizes: it is not in the leaf.' },
  { id: 'open', scene: 'leaf', where: 'leaf',
    text: 'The front of the cell is cut away, so that you can see inside.\nLike your salivary gland cell, it has a <dfn data-w="cell-membrane"><span data-cw="membrane">cell membrane</span></dfn>, <dfn data-w="cytoplasm">cytoplasm</dfn>, a <dfn data-w="nucleus">nucleus</dfn> and <dfn data-w="mitochondria">mitochondria</dfn>.\nIt also has <dfn data-w="ribosome">ribosomes</dfn>, ER (endoplasmic reticulum) and a <dfn data-w="golgi">Golgi apparatus</dfn>, as your cell has. From here the ribosomes and the ER are too small to see; the small gold stacks are its Golgi apparatus.' },
  { id: 'three', scene: 'leaf', where: 'leaf',
    text: 'A plant cell has three structures that your salivary gland cell does not have.\n<mark class="do">Press each <b>What is this?</b> to find the three.</mark>',
    say: {
      chl: '<b>Chloroplasts</b>: the green <dfn data-w="organelle">organelles</dfn>. A <dfn data-w="chloroplast">chloroplast</dfn> absorbs light to make glucose. This cell has many chloroplasts.',
      wall: 'The <b>cell wall</b>: a strong layer outside the <span data-cw="membrane">cell membrane</span>. The <dfn data-w="cell-wall">cell wall</dfn> strengthens the cell and supports the plant.\nIn the picture, the wall is the yellow band at the edge of the cell and the <span data-cw="membrane">cell membrane</span> is the pink line just inside it. They are very thin: zoom towards the edge (scroll, or press +) to see both.',
      vac: 'The <b><span data-cw="vacuole">permanent vacuole</span></b>: the large space in the middle of the cell, inside its own thin membrane. The <dfn data-w="permanent-vacuole"><span data-cw="vacuole">permanent vacuole</span></dfn> is filled with <dfn data-w="cell-sap">cell sap</dfn>, and it keeps the cell rigid (firm).\nIn the picture the cell sap is pale blue, so that you can see it. Real cell sap in a leaf cell has no colour.',
      done: 'You found the three: chloroplasts, the cell wall and the <span data-cw="vacuole">permanent vacuole</span>.'
    } },
  { id: 'chloroplast', scene: 'leaf', where: 'leaf',
    text: 'This is one <dfn data-w="chloroplast">chloroplast</dfn>, cut open. It is about 5 µm long. (A red blood cell is 7.5 µm across.)\nA chloroplast is an <dfn data-w="organelle">organelle</dfn>. Two membranes surround it.\nInside it are stacks of flat membranes, joined to each other by single sheets of membrane. They hold <dfn data-w="chlorophyll">chlorophyll</dfn>, a green pigment that absorbs light. Chlorophyll makes a leaf green.\nRound them is a watery liquid, with many <dfn data-w="enzyme">enzymes</dfn>.' },
  { id: 'light', scene: 'leaf', where: 'leaf',
    text: 'The light is off now. The camera is very close to one stack. The bar shows the scale in <dfn data-w="nanometre">nanometres</dfn> (nm): 1 nanometre is 1 millionth of a millimetre. Every molecule is drawn at its true size.\n<dfn data-w="carbon-dioxide">Carbon dioxide</dfn> comes from the air, through tiny holes in the leaf. Water comes from the soil, through the roots.\n<mark class="do">Press ☀ Light on.</mark>',
    say: {
      on: '<p>In the light, the chloroplast uses carbon dioxide and water to make <b>glucose</b>. <b>Oxygen</b> is released.</p><p>The energy comes from the light that chlorophyll absorbs.</p><div class="y8"><span class="y8__k">Year 8</span><p>This is <dfn data-w="photosynthesis">photosynthesis</dfn>:</p><p class="y8__eq">carbon dioxide + water → glucose + oxygen</p><p>In the picture: 6 carbon dioxide molecules and 6 water molecules make 1 glucose molecule and 6 oxygen molecules.</p></div><p><mark class="do">Press ☾ Light off</mark> to see what happens in the dark, or press Next step.</p>',
      /* (17 Nov 2026, the science read, decided: with Light off the picture's glucose and oxygen go and its carbon dioxide and
         water are back; without a word that reads as the reaction running backwards in the dark) */
      off: 'In the dark, the chloroplast makes no glucose: chlorophyll has no light to absorb.\nThe picture is back at its start.'
    } },
  { id: 'starch', scene: 'leaf', where: 'leaf',
    text: 'The cell uses some of its glucose for respiration, in its own mitochondria: a plant cell needs energy too.\nSome of the sugar moves at once to other parts of the plant. The chloroplast stores some: it <span data-cw="joins">joins</span> many glucose molecules in a long chain.\n<mark class="do">Press <span data-cw="join">Join</span>.</mark>',
    say: { join: 'A chain of glucose molecules: this is <span class="nb"><dfn data-w="starch">starch</dfn>.</span> Only the start of the chain is drawn: a real starch molecule has thousands of glucose molecules.' } },
  { id: 'grain', scene: 'leaf', where: 'leaf',
    text: 'The camera moves back. Very many starch molecules lie together in a <b>starch grain</b>, inside the chloroplast.\nBy day, in the light, the grain grows.\n<mark class="do">Press ☾ Night.</mark>',
    /* (18 Nov 2026: night is a press. Its sentence was the step's third, with no picture; the words are the same) */
    say: {
      night: 'At night, the plant changes the starch into sugar again, and the sugar moves to other parts of the plant.\nDuring the night, the grain becomes smaller: the dashed line shows its size at the end of the day.\n<mark class="do">Press ☀ Day</mark> to see the grain grow again, or press Next step.',
      day: 'By day, in the light, the chloroplast makes glucose and stores some of it as starch: the grain grows again.'
    } },
  { id: 'wall', scene: 'leaf', where: 'leaf',
    text: 'A leaf must stay flat, with its top to the light. So its cells must be firm.\nThis is the <dfn data-w="cell-wall">cell wall</dfn> at the edge of the cell, from very near: the bar shows the scale.\nThe wall is about 200 nm thick. It is made of <dfn data-w="cellulose">cellulose</dfn>: long, strong fibres, in layers.\nEvery plant cell has its own wall. On the left is the wall of the next cell.' },
  { id: 'membrane', scene: 'leaf', where: 'leaf',
    text: 'Nearer still. The <dfn data-w="cell-membrane"><span data-cw="membrane">cell membrane</span></dfn> touches the inside of the cell wall. It is two layers of <dfn data-w="lipid">lipids</dfn>, with proteins in them, like the membrane at the way in of your cell.\nThe membrane is thin and soft: the wall is about 40 times thicker.\nThe membrane controls what enters and leaves the cell. The wall does not: water and dissolved substances pass through it freely.' },
  { id: 'vacuole', scene: 'leaf', where: 'leaf',
    text: 'The whole cell again.\nThe <dfn data-w="permanent-vacuole"><span data-cw="vacuole">permanent vacuole</span></dfn> fills most of the cell. It is full of <dfn data-w="cell-sap">cell sap</dfn>: water with sugars and salts dissolved in it.\nThe cell sap pushes the cytoplasm against the cell wall (the arrows). The wall is strong, so the cell is firm: it is <b>rigid</b>.\n<mark class="do">Press 💧 <span data-cw="lose">Lose water</span>.</mark>',
    say: {
      soft: 'With less water, the cell sap pushes less on the wall: the cell is soft. When many cells are soft, the plant <dfn data-w="wilt">wilts</dfn>: its leaves bend downwards.\n<mark class="do">Press 💧 <span data-cw="take">Take in water</span>.</mark>',
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
    text: '<p>Nearer: five cells of the wall of the villus, side by side. Each cell is tall and narrow.</p><p>A blood <dfn data-w="capillary">capillary</dfn> lies just under the cells. Red blood cells pass through it, one after another.</p><p>The surface of each cell has thousands of <b>microvilli</b>: tiny fingers of the <span data-cw="membrane">cell membrane</span>.</p>' },
  { id: 'gut', scene: 'gut', where: 'gut',
    text: 'Nearer still: the camera is at the surface of one cell, and the molecules are at their true sizes.\nIn the small intestine, amylase from the pancreas digests the rest of the starch into maltose.\nAnother enzyme works here: <dfn data-w="maltase">maltase</dfn>. It is <span data-cw="embedded">attached to</span> the membrane of the cells of the villi.\n<mark class="do">Press Digest.</mark>',
    say: { digest: 'Maltase digests each maltose molecule into two <b>glucose</b> molecules. The digestion of starch is complete.' } },
  { id: 'blood', scene: 'gut', where: 'blood',
    text: 'The camera moves back to the whole villus.\nFrom here a glucose molecule is far too small to see: a glow shows where each one is.\n<mark class="do">Press Absorb.</mark>',
    say: { absorb: 'Glucose passes through the cells of the wall of the villus, through <dfn data-w="carrier-protein">carrier proteins</dfn> in their <span data-cw="membranes">cell membranes</span> (you met a carrier protein at the way in of your cell), and into the blood of the capillaries. The blood leaves the villus and carries the glucose to every cell of your body.' } },
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
  leaf: { intro: 'For IGCSE, you learn these names for the parts of a leaf.', on: 'leaf', card: 'Part of the leaf', store: 'leafNames', rows: [
    ['xcut', 'cuticle', 'a waxy, waterproof layer; it reduces water loss'],
    ['xupper', 'upper epidermis', 'the top layer of cells; light passes through it'],
    ['xpal', 'palisade mesophyll', 'the layer of <span data-cw="palisades">palisade cells</span>; most photosynthesis happens here'],
    ['xchl', 'chloroplasts', 'where photosynthesis happens; most of them are in the palisade mesophyll cells'],
    ['xbundle', 'vascular bundle', 'a vein: xylem and phloem together'],
    ['xxylem', 'xylem', 'the tissue that transports water and mineral ions, and supports the plant'],
    ['xphloem', 'phloem', 'the tissue that transports sucrose and amino acids'],
    ['xspongy', 'spongy mesophyll', 'the cells below the <span data-cw="palisades">palisade cells</span>, with air spaces between them'],
    ['xair', 'air space', 'gases diffuse through the air spaces to and from the cells'],
    ['xlower', 'lower epidermis', 'the bottom layer of cells; most of the stomata are in it'],
    ['xguard', 'guard cell', 'one of the pair of cells round a stoma; they open and close it'],
    ['xstoma', 'stoma', 'a pore (plural: stomata): carbon dioxide diffuses in; oxygen and water vapour diffuse out']
  ] },
  /* the membrane's IB names (17 Nov 2026): the four parts that the step's two IB lines name (COURSE.ib.membrane:
     B2.1.1, B2.1.2, B2.1.4; all under "SL and HL"), each with that line's own words; shown with IB on, in the order
     of the pins on a phone, from the top of the picture down. lines: the IB lines of the step that these names say on
     the picture (COURSE.ib.membrane[n]): they are not repeated in the box */
  membrane: { ib: true, on: 'membrane', card: 'Part of the plasma membrane', store: 'memNames', lines: [0, 1], rows: [
    ['xbil', 'phospholipid bilayer', 'the plasma membrane is a bilayer of phospholipids'],
    ['xcore', 'hydrophobic core', 'it has a low permeability to large molecules and to hydrophilic particles, such as ions and polar molecules'],
    ['xint', 'integral protein', 'a protein that is embedded in the bilayer'],
    ['xper', 'peripheral protein', 'a protein that is attached to one of the surfaces of the bilayer']
  ] },
  /* the chloroplast's names (17 Nov 2026). A set may say: step (the step it belongs to, when its key is not the step's),
     igcse (shown with IGCSE on only; ib: with IB on only), chips: false (few names: each stands in full on a phone too,
     so the box needs no key of chips), whole: true (a row's words are whole sentences with the name in them, not
     "name: what it is"), a row's fourth entry is its IB level (an HL name is not shown at SL), and its fifth the
     card's heading when it is not the set's (where the pigments are: the Year 7 words of this step say that the flat
     membranes hold chlorophyll, and the HL line that the thylakoid membranes have the groups of pigment molecules; "the
     flat membranes inside", because the same words say that two membranes surround the chloroplast: those hold none).
     IB: the three parts that the step's IB lines name (COURSE.ib.chloroplast: C1.3.5 under "SL and HL", B2.2.5 under
     "Additional higher level"), each with that line's own words; lines: the IB lines that the names say (not repeated
     in the box). Pressed, a name first shows its part in the picture (leaf.js, the step's looks) */
  chloroplast: { ib: true, on: 'chloroplast', card: 'Part of the chloroplast', store: 'chlNames', lines: [0, 2], chips: false, whole: true, rows: [
    ['xpig', 'photosynthetic pigments', '<b>Photosynthetic pigments</b> absorb specific wavelengths of light. An electron in the pigment molecule is excited: light energy is transformed to chemical energy.', 'SL', 'In the flat membranes inside the chloroplast'],
    ['xthy', 'thylakoid', 'The flat membranes are flat sacs, each with fluid inside: the <b>thylakoids</b>. Adaptations of the chloroplast: the large surface area of thylakoid membranes with photosystems (groups of pigment molecules), and the small volume of fluid inside thylakoids.', 'HL'],
    ['xstr', 'stroma', 'The watery liquid round the thylakoids is the <b>stroma</b>. Adaptation of the chloroplast: the enzymes and substrates of the Calvin cycle (the reactions that fix carbon dioxide) are kept together in the stroma.', 'HL']
  ] },
  /* IGCSE: the one name the 0610 syllabus has at this picture, chlorophyll (6.1.4; 6.1.6 b), with the step's IGCSE line
     whole (COURSE.igcse.chloroplast[0]; linesG: the IGCSE lines that the name says) */
  /* the light step's IB names (17 Nov 2026): glucose and oxygen stand on the picture once the light is on (hint: what
     the count's line then says); the two HL names are the two places the HL lines name, the thylakoid membrane and
     the stroma, there from the start. (Not "Rubisco" on the large enzyme: the picture's one press shows the glucose
     leaving that enzyme, and a pupil would learn that Rubisco makes glucose: the science read, 17 Nov 2026.) The card
     of the thylakoid membrane holds the two HL lines about it. Each card: the IB lines' own words (COURSE.ib.light) */
  light: { ib: true, on: 'picture', card: 'In the chloroplast', store: 'lightNames', lines: [1, 2, 3, 4, 5], chips: false, whole: true, hint: 'Press ☀ Light on, then each name', rows: [
    ['xglu', 'glucose', 'Carbon dioxide is converted to <b>glucose</b>, using hydrogen obtained by splitting water.', 'SL'],
    ['xoxy', 'oxygen', '<b>Oxygen</b> is a by-product: it comes from the water.', 'SL'],
    ['xtm', 'thylakoid membrane', 'On the <b>thylakoid membrane</b> (the light-dependent reactions), photosystem II uses light energy to split water: photolysis. ATP is made by chemiosmosis, and photosystem I reduces NADP (NADP gains hydrogen).', 'HL'],
    ['xstm', 'stroma', 'In the <b>stroma</b> (the Calvin cycle), the enzyme Rubisco fixes carbon dioxide, and reduced NADP and ATP are used to make triose phosphate, a sugar with three carbon atoms.', 'HL']
  ] },
  /* the starch step's names (18 Nov 2026), there once Join has made the chain (hint: what the count's line says).
     IB: the chain is "starch: a polysaccharide"; its card holds the two IB lines about starch itself (the first:
     what it is, B1.1.2; the third: why it stores energy well, B1.1.5); the second line stays in the box. ONE name for a
     course on the chain: with two, a phone's small picture had no room, and one name is plainer. With IB on the
     picture also shows what "condensation" means: a water molecule comes away at each
     join (leaf.js). IGCSE: the chain is "starch"; its card is the step's first IGCSE line, whole (6.1.5: the five uses
     of the carbohydrates made in photosynthesis; this picture shows the first of them) */
  starch: { ib: true, on: 'picture', card: 'In the chloroplast', store: 'starchNames', lines: [0, 2, 3], chips: false, whole: true, hint: 'Press <span data-cw="join">Join</span>, then the two names on the chain', rows: [
    /* (the zoom on the atoms of one join: leaf.js "two glucose and the bond between them"; its card is the fourth IB line) */
    ['xgly', 'a glycosidic bond', 'In each condensation reaction, the −OH group of carbon 1 of one glucose and a hydrogen atom from the −OH group of carbon 4 of the next glucose are removed and form one water molecule. The oxygen atom of carbon 4 stays and joins carbon 1 to carbon 4 (C−O−C): a <b>glycosidic bond</b>.', 'SL', 'Between two glucose monomers'],
    ['xpol', 'starch: a polysaccharide', '<b>Starch</b> is a polysaccharide: a polymer (a long chain) of alpha-glucose monomers (the small units), linked by condensation reactions. Starch stores energy well: coiling and branching make it compact, its large molecules are relatively insoluble, and glucose is added or removed easily by condensation and hydrolysis.', 'SL']
  ] },
  /* the wall step's names (18 Nov 2026): with a course on, the fibres' name is a name to press. Pressed, the picture
     goes to ONE fibre and shows it as straight chains of glucose (leaf.js "one cellulose fibre from near"), and then
     its card says the course's line about cellulose, whole. IB: both IB lines (the second begins "Its": alone on a
     card it had no noun: the science read); the first, "Cellulose is a structural polysaccharide.", also stays in
     the box. From far the name to press is the Year 7 name of the fibres; from near it stands on one chain. IGCSE:
     the first IGCSE line; the second (two separate layers: the next step's picture) stays in the box. Both courses
     on: ONE name on the fibres, IB's, and the IGCSE name is a chip in its box */
  /* (19 Nov 2026) from near, the note "hydrogen bonds" is a second name to press: it shows a piece of two chains with
     their atoms (leaf.js "a piece of the fibre and its atoms"); its card is the third IB line */
  wall: { ib: true, on: 'picture', card: 'In one cellulose fibre', store: 'wallNames', lines: [1, 2], chips: false, whole: true, hint: 'Press the name of the fibres, then <i>hydrogen bonds</i>', rows: [
    ['xcel', 'cellulose fibres', '<b>Cellulose</b> is a structural polysaccharide. Its <b>beta-glucose</b> monomers alternate in orientation, which gives straight chains; the chains are grouped in bundles and cross-linked with hydrogen bonds.', 'SL'],
    ['xhb', 'hydrogen bonds', 'A <b>hydrogen bond</b> is a weak attraction between the hydrogen atom of an −OH group (δ+) of one chain and an oxygen atom (δ−) of the next chain. One hydrogen bond is weak; very many together hold the chains in a strong bundle.', 'SL', 'Between two cellulose chains']
  ] },
  wallG: { igcse: true, step: 'wall', on: 'picture', card: 'In the cell wall', store: 'wallNameG', linesG: [0], chips: 'pins', whole: true, hint: 'Press the name of the fibres', rows: [
    ['xcelg', 'cellulose', '<b>Cellulose</b> is a large molecule made from many glucose molecules.']
  ] },
  /* the grain step's names (18 Nov 2026). IB: at night the grain is "starch: hydrolysis at night"; pressed, the picture
     goes to the grain's surface and shows the step's second IB line happening (leaf.js: a water molecule goes to each bond
     that is split), and then its card says that line, whole; the first IB line ("At night the store is mobilized.") stays in the box. IGCSE: the grain is "starch: insoluble" by day (the
     step's first IGCSE line) and "starch: less after one night in the dark" at night (its third: a plant is de-starched in the dark,
     which takes longer than one night);
     the second line (sucrose, translocation) stays in the box. chips 'pins': with both courses on, the grain at night
     has ONE name, IB's, and the IGCSE names are chips in their box */
  grain: { ib: true, on: 'picture', card: 'At the surface of the starch grain', store: 'grainNames', lines: [1], chips: false, whole: true, hint: 'Press ☾ Night, then the name of the grain', rows: [
    ['xhyd', 'starch: hydrolysis at night', 'Alpha-glucose monomers are removed from starch by <b>hydrolysis</b> reactions (a water molecule is used to split each bond).', 'SL']
  ] },
  grainStore: { igcse: true, step: 'grain', on: 'picture', card: 'Starch in the leaf', store: 'grainNameG', linesG: [0, 2], chips: 'pins', whole: true, hint: 'Press the name of the grain: by day, then at night', rows: [
    ['xins', 'starch: insoluble', '<b>Starch</b> is insoluble, so a store of starch does not draw water into the cell by osmosis.', '', 'A store of starch'],
    ['xdark', 'starch: less after one night in the dark', 'To investigate photosynthesis, a plant is first <b class="nb">de-starched</b>: it is kept in the dark until its leaves have no starch.', '', 'Starch in the dark']
  ] },
  /* (chips: 'pins': with both courses on, the chain has ONE name on the picture, IB's (two names on one chain read as
     two parts: the science read), and the IGCSE name is a chip to press in its box. The card's heading is "In the whole
     plant": of the five uses only the starch store is in the chloroplast) */
  starchUses: { igcse: true, step: 'starch', on: 'picture', card: 'In the whole plant', store: 'starchNameG', linesG: [0], chips: 'pins', whole: true, hint: 'Press <span data-cw="join">Join</span>, then the name of the chain', rows: [
    ['xsta', 'starch', 'The carbohydrates made in photosynthesis have five uses: <b>starch</b> as an energy store; <b>cellulose</b> to build cell walls; <b>glucose</b> used in respiration to provide energy; <b>sucrose</b> for transport in the phloem; nectar to attract insects for pollination.']
  ] },
  chlorophyll: { igcse: true, step: 'chloroplast', on: 'chloroplast', card: 'In the flat membranes inside the chloroplast', store: 'chlNameG', linesG: [0], chips: false, whole: true, rows: [
    ['xchlo', 'chlorophyll', '<b>Chlorophyll</b> transfers energy from light into energy in chemicals, for the synthesis of carbohydrates. Magnesium ions are needed to make chlorophyll.']
  ] }
};
/* ---------------- the course layers (12 Nov 2026) ----------------
   Daniel: "just like for all the main quest, you can always add a toggle for IGCSE and then a toggle for IB … extra
   information that the IGCSE covers … related to what you're showing here … only toggles that are activated once the
   student is done with the key stage 3, and the key stage 3 should be easy to understand."
   COURSE[course][step id]: what that course asks about what THIS step's picture shows, and nothing else. The Year 7
   words above do not change (but for a button's word and a part's name, which are the course's own since 20 and 21 Nov
   2026: WORDS and NAMES below). Shown in a violet box under the step's words while the course's switch is on (view.js).
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
      'The water lost is replaced from the xylem. The loss of water vapour causes a <b>transpiration pull</b> that draws up a column of water molecules, held together by forces of attraction between water molecules.'],
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
      'Nitrate ions are needed to make amino acids, and so proteins: the plant combines nitrate ions with some of the glucose it has made.'],
    /* 6.1.5 (a), (d); 8.4.1 (S); 6.1.7 */
    grain: ['Starch is insoluble, so a store of starch does not draw water into the cell by osmosis.',
      'The sugar that leaves the cell is <b>sucrose</b>. <b>Translocation</b> is the movement of sucrose and amino acids in the phloem, from sources to sinks.',
      'To investigate photosynthesis, a plant is first de-starched: it is kept in the dark until its leaves have no starch.'],
    /* 4.1.2 (a); 6.1.5 (b); 3.2.6 */
    wall: ['<b>Cellulose</b> is a large molecule made from many glucose molecules.',
      'The cell wall and the cell membrane are two separate layers.'],
    /* 3.1.1, 3.1.3; 3.2.2, 3.2.7 (S); 3.3.1, 3.3.3 (S). The three definitions word for word as the syllabus for 2026 to
       2028 writes them (17 Nov 2026: osmosis without the two "a", active transport with "through a cell membrane" and
       its "i.e.", and 3.3.3 in the syllabus's own words). With a course on they are shown at the membrane itself, a
       scene each (MEMSCENES below), and not in the box */
    membrane: ['The cell membrane is <b>partially permeable</b>: it lets some substances through but not others.',
      '<b>Diffusion</b>: the net movement of particles from a region of their higher concentration to a region of their lower concentration (i.e. down a concentration gradient), as a result of their random movement.',
      '<b>Osmosis</b>: the net movement of water molecules from a region of higher water potential (dilute solution) to a region of lower water potential (concentrated solution), through a partially permeable membrane.',
      '<b>Active transport</b>: the movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration (i.e. against a concentration gradient), using energy from respiration. Protein carriers move molecules or ions across a membrane during active transport.'],
    /* 3.2.6; 3.2.8 (S); 8.3.7 (S) */
    vacuole: ['Water enters the cell by osmosis. The contents press outwards on the cell wall: this is <b>turgor pressure</b>, and the cell is <b>turgid</b> (the firm, rigid cell of this step).',
      'When the cell loses water by osmosis, the vacuole shrinks. The contents no longer press the cell membrane out against the cell wall, so turgor pressure falls and the cell becomes <b>flaccid</b> (the soft cell). A plant wilts when it loses water by transpiration faster than its roots absorb water.',
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
    villus: ['A villus has an epithelium one cell thick (the wall of the villus in this step: one layer of cells), with microvilli, a network of capillaries, a lacteal, and goblet cells that make mucus.',
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
    /* B3.1.7, B3.1.8 (SL); then the lines of the two films (19 Nov 2026; FILMS.co2ib, FILMS.h2oib: each shot's caption
       is a piece of one of them, word for word, so they are said on the picture and not in the box): B3.1.7 with
       B3.1.2 (a gas-exchange surface is moist); B3.1.9 with B3.2.7, in the guide's own words ("loss of water by
       transpiration from cell walls in leaf cells causes water to be drawn out of xylem vessels and through cell walls
       by capillary action, generating tension (negative pressure potentials). It is this tension that draws water up
       in the xylem. Cohesion ensures a continuous column of water."); A1.1.2, A1.1.3 and A1.1.4 ("adhesion of water to
       materials that are polar or charged … capillary action … in plant cell walls"). Daniel, 18 Nov 2026: "If you're
       talking about IB, it should be diffuse in … everything that is vocabulary, make sure it aligns with the way the
       students should read about it." After the science read (20 Nov 2026): the sentence about the xylem has its own
       subject ("As water is drawn out of the xylem vessels", which its picture shows; "This generates" came two shots
       after what "this" was); capillary action needs cohesion as well as adhesion; and carbon dioxide's line names
       no moist wall, which its film does not draw. */
    leaf: [['SL', 'Adaptations of a leaf for gas exchange: the waxy cuticle, the epidermis, air spaces, spongy mesophyll, stomatal guard cells and veins. You draw a plan diagram of the tissues in a transverse section of a leaf.'],
      ['SL', '<b>Carbon dioxide</b> diffuses into the leaf through the stomata, between the guard cells, and through the air spaces to the mesophyll cells.'],
      ['SL', '<b>Transpiration</b> is a consequence of gas exchange in a leaf. The loss of water by transpiration from the cell walls of leaf cells causes water to be drawn through cell walls by capillary action. As water is drawn out of the xylem vessels, tension is generated in them (a negative pressure potential): this tension draws water up in the xylem, and cohesion ensures a continuous column of water.'],
      ['SL', 'Water molecules are polar, so hydrogen bonds form between them. This attraction between water molecules is <b>cohesion</b>. Water also adheres to materials that are polar or charged, such as the cellulose of a cell wall: this is <b>adhesion</b>. With cohesion, it causes capillary action in cell walls.']],
    /* A2.2.2 (SL) */
    cell: [['SL', 'Microscopy skills: you calculate actual size and magnification, and you produce a scale bar, as on this picture.']],
    /* A2.2.6, B2.2.1 (SL); B2.2.7, B2.2.8 (AHL) */
    open: [['SL', 'The IB guide calls the membrane round a cell the <b>plasma membrane</b>. A eukaryotic cell has a plasma membrane round a cytoplasm divided into compartments (compartmentalized), with 80S ribosomes (S is a measure of size), a nucleus inside a double membrane with pores, and organelles with membranes: mitochondria, endoplasmic reticulum, Golgi apparatus, vesicles and vacuoles.'],
      ['SL', 'The cell wall, the cytoskeleton and the cytoplasm are not considered organelles.'],
      ['HL', 'The structure and function of free ribosomes, of the rough endoplasmic reticulum and of the Golgi apparatus (processing and secretion of protein).']],
    /* A2.2.8, A2.2.10, A2.2.11 (SL) */
    three: [['SL', 'Cells of animals, fungi and plants differ in their cell walls (present or not, and what they are made of), in the size and function of their vacuoles, and in chloroplasts and other plastids.'],
      ['SL', 'The IB name of this vacuole is the <b>sap vacuole</b>. You identify the chloroplast, the sap vacuole and the cell wall in electron micrographs, and you draw and annotate them with their functions.']],
    /* C1.3.5 (SL); B2.2.5, C1.3.14 (AHL) */
    /* (17 Nov 2026: the SL line is now two, word for word as before: the first is said by a name on the picture, and
       the HL line by two more, XKEY.chloroplast; the second is the box's one line) */
    chloroplast: [['SL', 'Photosynthetic pigments absorb specific wavelengths of light. An electron in the pigment molecule is excited: light energy is transformed to chemical energy.'],
      /* (17 Nov 2026, the science read, decided: an absorption spectrum is a graph of HOW MUCH light a pigment absorbs at
         each wavelength; "which wavelengths a pigment absorbs" read as yes or no) */
      ['SL', 'An absorption spectrum shows how much light a pigment absorbs at each wavelength.'],
      /* (17 Nov 2026, the science read: "the flat membranes are thylakoids" was not exact, and the next words name the
         fluid inside them: a thylakoid is a flat sac of membrane; the stroma is the liquid round the thylakoids) */
      ['HL', 'The flat membranes are flat sacs, each with fluid inside: the <b>thylakoids</b>. The watery liquid round them is the <b>stroma</b>. Adaptations of the chloroplast: the large surface area of thylakoid membranes with photosystems (groups of pigment molecules), the small volume of fluid inside thylakoids, and the enzymes and substrates of the Calvin cycle (the reactions that fix carbon dioxide) kept together in the stroma.']],
    /* C1.3.1 to C1.3.3 (SL); C1.3.11 to C1.3.16 (AHL) */
    /* (17 Nov 2026: the SL line is now three, its three sentences word for word: the first is the box's one line; the
       second and the third are said by the names glucose and oxygen on the picture, and the three HL lines by the names
       thylakoid membrane and Rubisco: XKEY.light) */
    light: [['SL', 'Light energy is transformed to chemical energy when carbon compounds are produced.'],
      ['SL', 'Carbon dioxide is converted to glucose, using hydrogen obtained by splitting water.'],
      ['SL', 'Oxygen is a by-product: it comes from the water.'],
      ['HL', 'On the thylakoid membrane (the light-dependent reactions), photosystem II uses light energy to split water: photolysis.'],
      ['HL', 'ATP is made by chemiosmosis, and photosystem I reduces NADP (NADP gains hydrogen).'],
      ['HL', 'In the stroma (the Calvin cycle), the enzyme Rubisco fixes carbon dioxide, and reduced NADP and ATP are used to make triose phosphate, a sugar with three carbon atoms.']],
    /* B1.1.2, B1.1.5 (SL); C1.1.3 (SL) */
    /* (18 Nov 2026: the first SL line is now two, its two sentences; the second says "Making starch" where it said
       "Making it", because it now stands alone in the box. The first and the third are said by the chain's name,
       XKEY.starch) */
    starch: [['SL', 'Starch is a polysaccharide: a polymer (a long chain) of alpha-glucose monomers (the small units), linked by condensation reactions.'],
      ['SL', 'Making starch is an anabolic reaction (it builds a large molecule from small ones).'],
      ['SL', 'Starch stores energy well: coiling and branching make it compact, its large molecules are relatively insoluble, and glucose is added or removed easily by condensation and hydrolysis.'],
      /* (18 Nov 2026, Daniel: a zoom on the atoms, "to see how the bonds are formed": this line is its card, XKEY.starch xgly) */
      ['SL', 'In each condensation reaction, the −OH group of carbon 1 of one glucose and a hydrogen atom from the −OH group of carbon 4 of the next glucose are removed and form one water molecule. The oxygen atom of carbon 4 stays and joins carbon 1 to carbon 4 (C−O−C): a <b>glycosidic bond</b>.']],
    /* B1.1.3, B1.1.5 (SL) */
    /* (18 Nov 2026: the one line is now two, word for word but for the colon and one capital: the first stays in the
       box, where the picture of the night shows it (the grain smaller); the second is said by the grain's name at
       night, where the picture shows it happening: XKEY.grain) */
    grain: [['SL', 'At night the store is mobilized.'],
      ['SL', 'Alpha-glucose monomers are removed from starch by hydrolysis reactions (a water molecule is used to split each bond).']],
    /* B1.1.6 (SL) */
    /* (18 Nov 2026: the line's two sentences are now two lines, word for word: the first stays in the box, the second
       is said by the fibres' name, where the picture shows it: XKEY.wall) */
    wall: [['SL', 'Cellulose is a structural polysaccharide.'],
      ['SL', 'Its beta-glucose monomers alternate in orientation, which gives straight chains; the chains are grouped in bundles and cross-linked with hydrogen bonds.'],
      /* (19 Nov 2026, Daniel: a zoom on the atoms, "several glucose molecules and several fibers, so you see the cross-linking": this line is its card, XKEY.wall xhb) */
      ['SL', 'A <b>hydrogen bond</b> is a weak attraction between the hydrogen atom of an −OH group (δ+) of one chain and an oxygen atom (δ−) of the next chain. One hydrogen bond is weak; very many together hold the chains in a strong bundle.']],
    /* B2.1.1, B2.1.2, B2.1.4, B2.1.8, B2.1.10 (SL) */
    /* (17 Nov 2026: the second line is now two, word for word as before: the first two lines are said by the names on
       the picture, XKEY.membrane, and are not in the box; the third is the box's one line) */
    membrane: [['SL', 'The plasma membrane is a bilayer of phospholipids. Its hydrophobic core has a low permeability to large molecules and to hydrophilic particles, such as ions and polar molecules.'],
      ['SL', 'Integral proteins are embedded in the bilayer; peripheral proteins are attached to one of its surfaces.'],
      ['SL', 'This is the fluid mosaic model. Facilitated diffusion and active transport make the membrane selectively permeable.']],
    /* D2.3.2, D2.3.3, D2.3.6 (SL); D2.3.8 to D2.3.10 (AHL) */
    /* (22 Nov 2026: the SL line is now three, its three sentences word for word: the first is the box's one line; the
       second and the third are said on the picture, by the film of the cell in a solution: FILMS.solib) */
    vacuole: [['SL', 'Water moves by osmosis from a less concentrated solution to a more concentrated solution.'],
      ['SL', 'In a hypotonic medium (less concentrated than the cell), water enters a cell with a wall and <b>turgor pressure</b> develops.'],
      ['SL', 'In a hypertonic medium (more concentrated than the cell), the cell is plasmolysed: its plasma membrane separates from the wall.'],
      ['HL', 'Water moves from a higher to a lower water potential. In a cell with a wall, the water potential is the sum of the solute potential (the effect of the dissolved substances) and the pressure potential (the effect of the wall pressing on the cell).'],
      /* (20 Nov 2026, the science read of the buttons' words: with "Lose water by osmosis" on the button, the only IB line
         about a cell that loses water was the plasmolysed cell in a hypertonic medium, and a pupil would write that the
         cells of a wilting leaf are plasmolysed. The fence that IGCSE's third line has; on show while the cell is soft:
         STATE below. No level: it is about this picture, not a statement of the guide) */
      ['', 'In the soft cell of this step, turgor pressure has fallen. The cell is not plasmolysed: its plasma membrane still touches the cell wall.']],
    /* B1.1.5, A2.2.8 (SL); B3.2.18 (AHL) */
    potato: [['SL', 'Plant cells have chloroplasts and other plastids.'],
      ['', 'In a potato cell each starch grain is inside a plastid that has no pigments. The guide says "other plastids" and does not name them.'],
      ['HL', 'Translocation of sap in the phloem: carbon compounds are loaded into the sieve tubes at sources and unloaded at sinks, with the help of companion cells.']],
    /* B1.1.3, C1.1.3, C1.1.4, C1.1.5 (SL); C1.1.11 (AHL) */
    mouth: [['SL', 'Digestion of a polymer into monomers is <b>hydrolysis</b>: a water molecule is split for each bond broken. It is catabolic (it breaks a large molecule down). Here the product is maltose: two glucose units still joined.'],
      ['SL', 'An enzyme is a globular protein with an active site. In induced-fit binding, the substrate and the enzyme both change shape.'],
      ['HL', 'Chemical digestion in the gut is an extracellular enzyme-catalysed reaction.'],
      ['', 'The IB guide does not name amylase, maltose or maltase.']],
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
      ['HL', 'Cells of the small intestine absorb glucose with sodium-dependent glucose cotransporters: each one carries glucose together with sodium ions, which move down a gradient that a pump made. This is indirect active transport.']],
    /* C1.2.1, C1.2.2, C1.2.4, C1.2.5 (SL); D3.3.3 (SL) */
    loop: [['SL', 'Cell respiration produces ATP, using energy released from carbon compounds such as glucose. ATP distributes energy within the cell, for example for the synthesis of macromolecules: here, amylase. Aerobic respiration needs mitochondria.'],
      ['SL', 'The concentration of glucose in the blood is regulated by the hormones insulin and glucagon.']]
  }
};
/* ---------------- the course's own word on each button (20 Nov 2026) ----------------
   Daniel, 18 Nov 2026, with IB on: "everything that is vocabulary, make sure it aligns with the way the students should
   read about it … Right now, it seems that you're providing IB content with the simplification of Key Stage 3 and even
   the wording." The game's places have this since 19 Nov (js/game/coursewords.js: the same fields); this is the plant
   cell's own table. With a course on, a button of the picture (its `w` in the scene's step) and each sentence that
   names it (data-cw: a step's words, what a press says, a box's hint) carry the word of that course's own line at
   that step. Year 7 keeps every word.
     y7     the Year 7 word (the button keeps its Year 7 words as data-y7: the handle the checks press it by)
     igcse  with IGCSE on and IB off
     sl     with IB on, at SL and at HL (with both courses on IB's word shows, as IB's name does on the picture)
     at     the step whose course lines carry the word
     src    for each course word, a piece of a line of that step: tools/plant-check.mjs T proves the word is the line's
   No word here is new science: each is a term out of the line beside it, and each is true of what the press shows.
   - join: with IB on the picture shows one water molecule coming away at each join (leaf.js): a condensation reaction,
     the guide's B1.1.2 ("condensation reactions that link monomers to form a polymer"). 0610 names no reaction here
     (4.1.2: starch is made from glucose), so IGCSE keeps "Join".
   - joins: the verb of the Year 7 sentence before that button ("it joins many glucose molecules").
   - lose, take: water crosses the cell membrane by osmosis in both directions (0610 3.2.3: "water moves into and out
     of cells by osmosis through the cell membrane"; the guide's D2.3.3: "Water movement by osmosis into or out of
     cells"). Not "hypertonic" or "plasmolysed" on a button: the soft cell of this step is flaccid, in a leaf that
     loses water, not a cell in a concentrated solution. */
export const WORDS = {
  join: { y7: 'Join', sl: 'Link by condensation', at: 'starch', src: { sl: /linked by condensation reactions/ } },
  /* (the verb of the sentence before the button: with "Link" on the button and "joins" beside it, one thing had two words: the science read) */
  joins: { y7: 'joins', sl: 'links', at: 'starch', src: { sl: /linked by condensation reactions/ } },
  lose: { y7: 'Lose water', igcse: 'Lose water by osmosis', sl: 'Lose water by osmosis', at: 'vacuole', src: { igcse: /the cell loses water by osmosis/, sl: /Water moves by osmosis/ } },
  /* (not "Take in water by osmosis": neither the syllabus nor the guide has that verb, and it makes the cell the agent
     of a passive process; both courses' lines say "enters": the science read) */
  take: { y7: 'Take in water', igcse: 'Water enters by osmosis', sl: 'Water enters by osmosis', at: 'vacuole', src: { igcse: /Water enters the cell by osmosis/, sl: /water enters a cell with a wall/ } }
};
/* The course line on show follows the picture (20 Nov 2026). STATE[step][state][course]: while the step's picture is
   in that state (the name of what its press says: the vacuole's 'soft'), the box of that course shows THIS line of
   COURSE[course][step] first, and the others under More. Without it the IGCSE box read "Water enters … turgid"
   beside a soft cell, and IB's fence was one press away (the science read). */
/* (21 Nov 2026, the science read of the names) a press that shows a part or a process may have its line too: the vacuole
   found, IB's line that names it ("sap vacuole" stood on the picture and its reason under More); glucose absorbed, IB's
   fence (the line on show said "Pump proteins do this" beside "carrier proteins in their plasma membranes") */
export const STATE = { vacuole: { soft: { igcse: 1, ib: 4 } }, three: { vac: { ib: 1 } }, blood: { absorb: { ib: 1 } } };
/* EVERY other press of the plant cell, read against its step's lines on 20 Nov 2026: it keeps its words, and why.
   [the button's words, its step, why]; where the reason is "the course's own word", the piece of the course's line
   that has it ([course, step, piece]): the same check reads these, so a new button cannot be forgotten. */
export const SAME = [
  ['What is this?', 'three', 'a question: it names nothing'],
  ['☀ Light on', 'light', 'the course\'s own word', ['igcse', 'light', /energy from light/], ['ib', 'light', /Light energy/]],
  ['☾ Light off', 'light', 'the same word as Light on'],
  ['☾ Night', 'grain', 'the course\'s own word', ['ib', 'grain', /At night the store is mobilized/]],
  ['☀ Day', 'grain', 'the same kind of word as Night: a time, not a process'],
  ['Add iodine solution', 'iodine', 'the course\'s own word', ['igcse', 'iodine', /iodine solution test/]],
  /* (IB: its line calls digestion "hydrolysis" (B1.1.3 names digestion by its reaction, as B1.1.2 names linking: the
     science read), and the mouth's picture does not yet show the water that is split: when the mouth's step is built
     for the courses, it draws that water and the button says "Digest by hydrolysis", as the grain's name does at night) */
  ['Digest', 'mouth', 'the course\'s own word', ['igcse', 'mouth', /chemical digestion of starch/], ['ib', 'mouth', /Digestion of a polymer into monomers/]],
  ['Digest', 'gut', 'the course\'s own word', ['igcse', 'gut', /Chemical digestion produces/], ['ib', 'folds', /digested internally/]],   /* (maltose is not a polymer: the guide's general word, B4.2.4) */
  ['Absorb', 'blood', 'the course\'s own word', ['igcse', 'folds', /Absorption<\/b> is the movement of nutrients from the intestines into the blood/], ['ib', 'folds', /digested internally, absorbed and assimilated/]]
];
/* ---------------- the course's own name on each part (21 Nov 2026) ----------------
   Daniel, 18 Nov 2026, with IB on: "everything that is vocabulary, make sure it aligns with the way the students should
   read about it … Right now, it seems that you're providing IB content with the simplification of Key Stage 3 and even
   the wording." After the buttons (WORDS above; his "Yes, carry on", 21 Nov), the names: where a course's own line
   calls a part by another name than Year 7 does, the picture's name (the scene's label, its `nm`) and every sentence
   that uses the name (data-cw) carry the course's. The same fields as WORDS, read by the same wordOf; `n` is the
   short form of a phone's picture (the scene's htmlN), where the short Year 7 name does not hold the long one.
   No name here is new science: each is a term out of the line beside it (src; tools/plant-check.mjs V).
   - membrane, vacuole: the guide's own terms (A2.2.4, A2.2.10: "plasma membrane", "sap vacuole"); the step's IB line
     says which Year 7 name each replaces. 0610 says "cell membrane" and "vacuoles" (2.1.1), and the IGCSE line of
     this cell says "large permanent vacuole", so IGCSE keeps both Year 7 names.
   - palisade: 0610 2.1.6 (c), "palisade mesophyll cells". The guide names the tissue of no palisade cell, so IB keeps
     the Year 7 name.
   - epi, epicell, incell: 0610 7.4.6 (b), "the epithelium lining the small intestine"; Year 7 says "the wall of the
     villus". Only the picture's names: the sentences describe the wall ("Its wall is one layer of cells") and stay.
   - lacteal: 0610 7.5.5; Year 7's picture says "digested fats enter here" (its name carries the tag IGCSE).
   The guide names no part of a villus but the microvilli, so IB keeps every Year 7 name of the gut's pictures.
   A plain description that Year 7 uses in a sentence ("top layer", "tiny holes", "a watery liquid", "sugar") stays:
   the course's box or key joins it to the course's term. */
export const NAMES = {
  membrane: { y7: 'cell membrane', sl: 'plasma membrane', n: { y7: 'cell membrane', sl: 'plasma<br>membrane' }, at: 'open', src: { sl: /The IB guide calls the membrane round a cell the plasma membrane/ } },
  membranes: { y7: 'cell membranes', sl: 'plasma membranes', at: 'open', src: { sl: /The IB guide calls the membrane round a cell the plasma membrane/ } },
  vacuole: { y7: 'permanent vacuole', sl: 'sap vacuole', at: 'three', src: { sl: /The IB name of this vacuole is the sap vacuole/ } },
  palisade: { y7: 'palisade cell', igcse: 'palisade mesophyll cell', at: 'cell', src: { igcse: /A palisade mesophyll cell is a specialised cell/ } },
  palisades: { y7: 'palisade cells', igcse: 'palisade mesophyll cells', at: 'cell', src: { igcse: /A palisade mesophyll cell is a specialised cell/ } },
  /* (the name with the cell's length: the longer name on one line had no room beside the cell and stood ON it: the science read) */
  palisadeat: { y7: 'palisade cell: ', igcse: 'palisade mesophyll cell:<br>', n: { y7: 'palisade cell: ', igcse: 'palisade mesophyll<br>cell: ' }, at: 'cell', src: { igcse: /A palisade mesophyll cell is a specialised cell/ } },
  epi: { y7: 'the wall of the villus: one layer of cells', igcse: 'the epithelium: one cell thick', n: { y7: 'one layer of cells', igcse: 'the epithelium' }, at: 'villus', src: { igcse: /The epithelium is one cell thick/ } },
  epicell: { y7: 'one cell of the wall of the villus', igcse: 'one epithelial cell', n: { y7: 'one cell', igcse: 'one epithelial cell' }, at: 'cells', src: { igcse: /Each of these cells is an epithelial cell/ } },
  incell: { y7: 'inside a cell of its wall', igcse: 'inside an epithelial cell', n: { y7: 'inside a cell', igcse: 'in an epithelial cell' }, at: 'cells', src: { igcse: /Each of these cells is an epithelial cell/ } },
  /* (two lines: on one line the name was longer than Year 7's and, in a window 1280 px wide, went to the other side of the lacteal) */
  lacteal: { y7: 'digested fats enter here', igcse: 'it absorbs fatty<br>acids and glycerol', at: 'villus', src: { igcse: /absorbs fatty acids and glycerol/ } },
  /* (IB: "integral proteins are embedded in the bilayer; peripheral proteins are attached to one of its surfaces", so with IB on
     "attached to the membrane" read as a peripheral protein; the step's IB line says "embedded in a membrane, as maltase is here") */
  embedded: { y7: 'attached to', sl: 'embedded in', at: 'gut', src: { sl: /they are embedded in a membrane, as maltase is here/ } }
};
/* a picture's name that holds a Year 7 name of the table and keeps it with a course on, with the reason (the scene's key) */
export const NAMEKEPT = {
  mmem: 'the IGCSE scene of diffusion: its name is the word of the 0610 definition that the scene shows, with IB on too',
  mmem2: 'the IGCSE scene of active transport: the definition says "through a cell membrane"'
};
/* the word now. on: { igcse, ib, hl } (which courses are on, and the IB level). IB's word first, at the student's own
   level; else IGCSE's; else Year 7's (as js/game/coursewords.js pick) */
const pickOf = (w, on) => { const ib = on && on.ib ? (on.hl ? w.hl || w.sl : w.sl) : ''; return ib || (on && on.igcse && w.igcse) || w.y7; };
export function wordOf(key, on) { const w = WORDS[key] || NAMES[key]; return w ? pickOf(w, on) : key; }
/* a picture's name now: its Year 7 words with the course's name in place of Year 7's (narrow: a phone's short form) */
export function nameOf(html, key, on, narrow) { const N = NAMES[key]; if (!N) return html; const P = narrow && N.n ? Object.assign({}, N, N.n) : N; return html.replace(P.y7, pickOf(P, on)); }
/* on the end card, once the five checks are right */
/* the leaf's two films (16 Nov 2026, rebuilt the same evening; their motion: films.js, shots by the same ids): each
   shot's words are a piece of one IGCSE line of the leaf above (COURSE.igcse.leaf[line]), word for word, so a film adds
   no new words; the caption shows the piece of its shot lit and, before it, the pieces of the same sentence already
   shown. "Transpiration pull" stays in the box: this piece of leaf shows its vein cut across, so nothing here goes up. */
/* (19 Nov 2026) The button's verb is the course's own: "diffuses into", so "Watch carbon dioxide diffuse in" (it said
   "go in"). With IB on, each film has the IB lines' words (ib: true; line: its place in COURSE.ib.leaf), and the film
   of transpiration goes near, into a cell wall (films.js, wet.js): a near shot's `note` says how its molecules are
   drawn, in place of FILMSIZE. */
/* (20 Nov 2026, the science read) each shot's note first says what the picture needs said and has no line for (why
   the stomata are open; why a molecule leaves: Daniel's own "when it gains enough kinetic energy, then it evaporates";
   what the surface does; which colour is which atom and what δ means; why nothing here goes "up"), then how it is
   drawn. A note shows when the camera has arrived (view.js). */
export const FILMSIZE = 'Molecules drawn 3000 times bigger than they are.';      /* what the far shots' molecules are drawn as, said on the picture (memory true-relative-sizes) */
const LEAFNOTE = 'The stomata are open so that carbon dioxide can diffuse in: water vapour diffuses out through them. ' + FILMSIZE;
const EVAPNOTE = 'A molecule with enough kinetic energy breaks its hydrogen bonds and leaves the surface: evaporation. True sizes, shown very much slower than it is; in the air only water is drawn, and more of it than so small a space holds.';
const CAPNOTE = 'Where a molecule has left, the surface dips; the water under it is then drawn up. True sizes, shown very much slower than it is; the curve of the surface is drawn deeper than it is.';
const BONDNOTE = 'Red: oxygen (O). White: hydrogen (H). δ+, δ−: a small positive, a small negative charge. Three dashes: a hydrogen bond. Atoms drawn smaller here, so that the bonds show; real hydrogen bonds break and form again all the time.';
const XYLEMNOTE = 'The xylem vessels are cut across here. Each is a tube that comes from the roots: “up” is from the roots to this leaf. ' + FILMSIZE;
/* (22 Nov 2026) the vacuole step's film, one for each course: the cell bathed in a solution (its picture: bath.js;
   leaf.js has its shots). Both courses ask about a plant cell IN a solution (0610 3.2.5, 3.2.8 (S); the guide's
   D2.3.6); the leaf's own cell of the Year 7 step only goes soft. `step`: the step it belongs to; `back`: the words
   of its last button. Each shot is one state reached, with the piece of the course line that names it: IGCSE flaccid
   (line 1), plasmolysed (line 2), turgid (line 0); IB plasmolysed in a hypertonic medium (line 2), turgor pressure
   in a hypotonic one (line 1). The IB guide's "isotonic" is in no line of this step, so no shot shows it. */
/* the notes of the cell in a solution: the key of each shot's picture (a fresh science read, 28 Nov 2026: one note had
   said "An arrow is the net movement of water" under the white arrows of turgor pressure too, and the dashed line had
   no name: a dashed line is how a school diagram draws a partially permeable membrane). In the flaccid shot the blue
   arrows never go (water is still leaving: bath.js); in the others they go when the net movement has stopped, and a
   still (Reduce motion), which keeps them, says that they are the movement while the cell changed */
const SOLDOT = 'Each dot is a dissolved particle, drawn very much bigger than it is: the same dots stay in the cell sap.';
const SOLBLUE = ' Blue arrows: the net movement of water', SOLGO = SOLBLUE + ' (no arrows: no net movement).', SOLWAS = SOLBLUE + ' while the cell changed.';
const SOLDASH = ' Dashed line: the size of the turgid cell.', SOLDASHIB = ' Dashed line: the size of the cell before it lost water.', SOLWHITE = ' White arrows: turgor pressure.';
export const FILMS = {
  sol: { button: 'Watch the cell in a concentrated solution', step: 'vacuole', back: 'Back to the cell in the leaf', shots: [
    { id: 'sol-flaccid', line: 1, part: 'When the cell loses water by osmosis, the vacuole shrinks. The contents no longer press the cell membrane out against the cell wall, so turgor pressure falls and the cell becomes <b>flaccid</b>', note: SOLDOT + SOLBLUE + '.' + SOLDASH },
    { id: 'sol-plasmolysed', line: 2, part: '<b>Plasmolysis</b>: a plant cell in a concentrated solution loses much water by osmosis, and its cell membrane separates from the cell wall.', note: SOLDOT + SOLGO + SOLDASH, noteStill: SOLDOT + SOLWAS + SOLDASH },
    { id: 'sol-turgid', line: 0, part: 'Water enters the cell by osmosis. The contents press outwards on the cell wall: this is <b>turgor pressure</b>, and the cell is <b>turgid</b>', note: SOLDOT + SOLGO + SOLWHITE, noteStill: SOLDOT + SOLWAS + SOLWHITE }] },
  solib: { button: 'Watch the cell in a hypertonic medium', ib: true, step: 'vacuole', back: 'Back to the cell in the leaf', shots: [
    { id: 'solib-hypertonic', line: 2, part: 'In a hypertonic medium (more concentrated than the cell), the cell is plasmolysed: its plasma membrane separates from the wall.', note: SOLDOT + SOLGO + SOLDASHIB, noteStill: SOLDOT + SOLWAS + SOLDASHIB },
    { id: 'solib-hypotonic', line: 1, part: 'In a hypotonic medium (less concentrated than the cell), water enters a cell with a wall and <b>turgor pressure</b> develops.', note: SOLDOT + SOLGO + SOLWHITE, noteStill: SOLDOT + SOLWAS + SOLWHITE }] },
  co2: { button: 'Watch carbon dioxide diffuse in', shots: [
    { id: 'co2-stoma', line: 1, part: '<b>Carbon dioxide</b> diffuses into the leaf through the stomata,' },
    { id: 'co2-air', line: 1, part: 'and through the air spaces' },
    { id: 'co2-cells', line: 1, part: 'to every mesophyll cell.' }] },
  h2o: { button: 'Watch transpiration', shots: [
    { id: 'h2o-leaf', line: 2, part: '<b>Transpiration</b> is the loss of water vapour from leaves.' },
    { id: 'h2o-xylem', line: 3, part: 'The water lost is replaced from the xylem.' },
    { id: 'h2o-cells', line: 2, part: 'Water evaporates from the surfaces of the mesophyll cells into the air spaces,' },
    { id: 'h2o-stoma', line: 2, part: 'and then diffuses out of the leaf through the stomata as water vapour.' }] },
  co2ib: { button: 'Watch carbon dioxide diffuse in', ib: true, shots: [
    { id: 'co2-stoma', line: 1, part: '<b>Carbon dioxide</b> diffuses into the leaf through the stomata, between the guard cells,' },
    { id: 'co2-air', line: 1, part: 'and through the air spaces' },
    { id: 'co2-cells', line: 1, part: 'to the mesophyll cells.' }] },
  h2oib: { button: 'Watch transpiration', ib: true, shots: [
    { id: 'tib-leaf', line: 2, part: '<b>Transpiration</b> is a consequence of gas exchange in a leaf.', note: LEAFNOTE },
    { id: 'tib-evap', line: 2, part: 'The loss of water by transpiration from the cell walls of leaf cells', note: EVAPNOTE },
    { id: 'tib-cap', line: 2, part: 'causes water to be drawn through cell walls by capillary action.', note: CAPNOTE },
    { id: 'tib-coh', line: 3, part: 'Water molecules are polar, so hydrogen bonds form between them. This attraction between water molecules is <b>cohesion</b>.', note: BONDNOTE },
    { id: 'tib-adh', line: 3, part: 'Water also adheres to materials that are polar or charged, such as the cellulose of a cell wall: this is <b>adhesion</b>. With cohesion, it causes capillary action in cell walls.', note: BONDNOTE },
    { id: 'tib-xylem', line: 2, part: 'As water is drawn out of the xylem vessels, tension is generated in them (a negative pressure potential): this tension draws water up in the xylem, and cohesion ensures a continuous column of water.', note: XYLEMNOTE }] }
};
/* the membrane step's three scenes (17 Nov 2026; their motion: memflow.js; view.js plays them, beat by beat): each
   scene's words are the pieces of ONE line of the step's IGCSE lines above (line: its place in
   COURSE.igcse.membrane), word for word, so a scene adds no new words: `term`, then `parts` joined by spaces (and, for
   active transport, `also`: the line's second sentence, 3.3.3). The caption shows the whole sentence, the pieces of
   the beat lit (`lit`); `also: true`: the second sentence alone.
   A beat: lit; tag: the name that rides on the followed particle (tagIn: its words from the moment it is in the
   membrane, or in the carrier: the process is named where it happens; a still shows these); names: the names on level lines (leaf.js labels);
   regions: the two sides say their concentration from this beat on; board: the counter of crossings shows;
   next: when Next comes: 'time' (after `s` seconds), 'crossed' (the followed particle has crossed; at the latest after
   `s`), 'net' (`n` more have crossed into the cytoplasm than out of it, and with `both` at least one out of it too, so
   that "net" is seen; at the latest after `s`); still: the second of the scene from which its still is taken (Reduce
   motion: one still a beat, with the followed particle's true way as an arrow that passes through the particle);
   stillAt: the still's own moment (memflow.js still: 'wander' a particle of the wall's side on its random way, 'start'
   the next to cross at the start of its way, 'in' between the lipids, 'bind' an ion entering the open carrier, 'turn'
   the carrier changing shape round it, the light on).
   What the picture draws, said on it: `what` (the counter's heading), `keys` ([picture, words, from which beat]: what
   is drawn and not counted, and the light that stands for energy), `note` (sizes, pace and numbers: memory
   true-relative-sizes). The sides: [where, what the definition calls it]. The counter says "the cytoplasm", never
   "the cell": the wall is part of the cell (the science read, 17 Nov 2026). The scenes are IGCSE's: with IB on alone
   they are not offered (the IB guide teaches aquaporins for water, B2.1.5, and pump proteins with ATP, B2.1.7). */
export const MEMSCENES = {
  diffusion: { button: 'Watch diffusion', code: '3.1.1', line: 1, term: 'Diffusion', what: 'Carbon dioxide', icon: 'co2',
    parts: ['the net movement of particles', 'from a region of their higher concentration to a region of their lower concentration (i.e. down a concentration gradient),', 'as a result of their random movement.'],
    beats: [
      { lit: [2], tag: 'carbon dioxide molecule', names: { mmem: 1 }, next: 'time', s: 4, still: 5, stillAt: 'wander' },
      { lit: [1], tag: 'carbon dioxide molecule', names: { mmem: 1 }, regions: true, next: 'time', s: 2, still: 8, stillAt: 'start' },
      { lit: [0], tag: 'carbon dioxide molecule', tagIn: 'carbon dioxide · diffusion', names: { mmem: 1 }, regions: true, board: true, next: 'net', n: 3, both: true, s: 20, still: 26, stillAt: 'in' }],
    sides: [['in the cell wall', 'higher concentration'], ['in the cytoplasm', 'lower concentration']],
    rows: ['crossed into the cytoplasm', 'crossed out of the cytoplasm'], net: 'net movement into the cytoplasm',
    note: 'At true size, shown much slower than it is. A real space this small holds far fewer carbon dioxide molecules.' },
  osmosis: { button: 'Watch osmosis', code: '3.2.7', line: 2, term: 'Osmosis', what: 'Water molecules', icon: 'water',
    parts: ['the net movement of water molecules', 'from a region of higher water potential (dilute solution) to a region of lower water potential (concentrated solution),', 'through a partially permeable membrane.'],
    beats: [
      { lit: [2], tag: 'water molecule', names: { mpp: 1 }, next: 'crossed', s: 10, still: 5, stillAt: 'in' },
      { lit: [1], tag: 'water molecule', names: { mpp: 1 }, regions: true, next: 'time', s: 2, still: 8, stillAt: 'start' },
      { lit: [0], tag: 'water molecule', tagIn: 'water · osmosis', names: { mpp: 1 }, regions: true, board: true, next: 'net', n: 3, both: true, s: 20, still: 28, stillAt: 'in' }],
    sides: [['in the cell wall', 'dilute solution: higher water potential'], ['in the cytoplasm', 'concentrated solution: lower water potential']],
    rows: ['crossed into the cytoplasm', 'crossed out of the cytoplasm'], net: 'net movement of water into the cytoplasm',
    keys: [['sugar', 'dissolved glucose', 0]],
    note: 'At true size, shown much slower than it is. Only some of the water molecules are drawn, and the difference between the two sides is drawn larger than it is.' },
  active: { button: 'Watch active transport', code: '3.3.1', line: 3, term: 'Active transport', what: 'Nitrate ions', icon: 'nitrate',
    parts: ['the movement of particles through a cell membrane', 'from a region of lower concentration to a region of higher concentration (i.e. against a concentration gradient),', 'using energy from respiration.'],
    also: 'Protein carriers move molecules or ions across a membrane during active transport.', alsoCode: '3.3.3',
    beats: [
      { lit: [1], tag: 'nitrate ion', names: { mmem2: 1 }, regions: true, next: 'time', s: 3, still: 4, stillAt: 'wander' },
      { also: true, tag: 'nitrate ion', tagIn: 'nitrate ion · active transport', names: { mcar: 1, mmem2: 2 }, regions: true, next: 'crossed', s: 18, still: 7, stillAt: 'bind' },
      { lit: [0, 2], tag: 'nitrate ion', tagIn: 'nitrate ion · active transport', names: { mcar: 1, mmem2: 2 }, regions: true, board: true, next: 'net', n: 1, s: 20, still: 30, stillAt: 'turn' }],
    sides: [['in the cell wall', 'lower concentration'], ['in the cytoplasm', 'higher concentration']],
    rows: ['moved into the cytoplasm', 'moved out of the cytoplasm'], net: 'into the cytoplasm: against the concentration gradient, using energy from respiration',
    keys: [['energy', 'light: energy from respiration', 1]],
    note: 'At true size, shown much slower than it is. A real space this small holds far fewer nitrate ions.' }
};
/* ---------------- an equation built from the picture (17 Nov 2026; view.js "the equation's strip") ----------------
   Daniel's rule (memory teach-on-the-picture): an equation stands beside the picture, each term lit only when the
   picture shows it used or produced. EQS[step id]: the IGCSE lines of the step that are the equation (lines: they are
   on the strip, not in the box), as pieces: a piece [term, words] lights with its term (leaf.js, the step's eq), a
   plain piece is the words between. The pieces of a row, joined, are the IGCSE line word for word (plant-check M).
   tail: for each row, the piece from which the row goes on a new line on the strip (the conditions, after the comma).
   key: the one line that says what a bright term means (the mitochondria's strip says "lit: used or produced in the
   picture"; here light and chlorophyll are neither used up nor produced, the syllabus's "in the presence of", and "lit"
   beside "light" is hard for a pupil who reads English as a second language: the science read, 17 Nov 2026). */
export const EQS = {
  light: { title: 'Photosynthesis', key: 'bright: the picture has shown it', lines: [1, 2], tail: [8], rows: [
    [['co2', 'carbon dioxide'], ' + ', ['h2o', 'water'], ' → ', ['glu', 'glucose'], ' + ', ['o2', 'oxygen'], ',', ' in the presence of ', ['light', 'light'], ' and ', ['chl', 'chlorophyll']],
    [['co2', '6CO<sub>2</sub>'], ' + ', ['h2o', '6H<sub>2</sub>O'], ' → ', ['glu', 'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>'], ' + ', ['o2', '6O<sub>2</sub>']]
  ] }
};
export const LVNOTE = 'Do you study IGCSE or IB Biology? At the top of this panel, <b>Your course</b> now has two switches. Switch one on, then press <b>↺ From the start</b>: every step adds what your course asks about its picture.';
export const CHECKS = ['p14-sort-plant', 'p14-gaps-chloroplast', 'p14-gaps-firm', 'p14-q-maltose', 'p14-order-loop'];
export const TASK = 'game-plant';
