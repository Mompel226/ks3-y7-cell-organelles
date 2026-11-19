/* ============================================================
   text.js — every word of the membrane view (13 Nov 2026): its steps, its names, what it simplifies, its sources.
   Each paragraph starts with its level, as in "From glucose to ATP" (js/ib/text.js): [sl CODE] SL and HL, [hl CODE] HL
   only (the guide's "Additional higher level"), [x] beyond the IB guide; [x+] beyond the guide and folded under "More detail"
   (15 Nov 2026, Daniel: "there's quite a lot of text … the idea is to help the students understand, not to overwhelm them"). The codes are the IB Biology guide's own
   (first assessment 2025), topic B2.1 Membranes and membrane transport, read from the guide itself:
     B2.1.1 lipid bilayers · B2.1.2 barriers · B2.1.4 integral and peripheral proteins · B2.1.6 channel proteins ·
     B2.1.8 selectivity (the game's way in tags its carrier proteins with it) · B2.1.9 glycoproteins and glycolipids ·
     B2.1.10 the fluid mosaic model (phospholipids, cholesterol, proteins, hydrophobic and hydrophilic regions): all SL
     and HL; B2.1.11 fatty acids and fluidity · B2.1.12 cholesterol's position and its effect on fluidity: HL only;
     B1.1.12 "amphipathic": SL and HL; B2.1.5 osmosis and aquaporins and D2.3.2 water's movement towards the more
     concentrated solution (step 9, 16 Nov 2026): SL and HL. [!] is a step's plain first line: what the step is for.
   Words (memory eal-korean-students): short sentences to "you"; a new word is explained first, then named; no idiom,
   no phrasal verb, the estate's never-amount rule; nothing about what an examination asks. {slow}, {wide}, {real} and {ratio} are
   filled from the model's own numbers (sim.js), so the page cannot say a number the model does not have.
   ============================================================ */
export const LEVELS = {
  sl: { name: 'SL and HL', long: 'in the IB guide for standard level and higher level' },
  hl: { name: 'HL only', long: 'in the IB guide for higher level only (additional higher level)' },
  x: { name: 'Beyond the guide', long: 'not in the IB guide: measured science that explains the picture' }
};

export const NAMES = {
  head: 'hydrophilic head', tails: 'hydrophobic tails', bilayer: 'phospholipid bilayer',
  sat: 'saturated tail (straight)', unsat: 'unsaturated tail (bent)', chol: 'cholesterol',
  channel: 'channel protein', carrier: 'carrier protein', glyco: 'glycoprotein', peri: 'peripheral protein',
  glycolipid: 'glycolipid', lipidTag: 'this phospholipid', protTag: 'this carrier protein',
  aquaporin: 'aquaporin', subunit: 'one subunit', file: 'water in a pore', crossing: 'water crossing the bilayer', solute: 'solute',
  /* the freeze fracture film (FILMS.fracture) */
  fOuter: 'outer layer, turned back', fInner: 'inner layer: its tails', fBump: 'bump: an integral protein', fHole: 'where a protein was'
};
/* a second, small word on a name (17 Nov 2026): what kind of membrane protein each one is, said where the protein is */
export const SUBS = { integral: 'integral' };
export const PLACES = { out: 'Outside the cell', cyt: 'Cytoplasm (inside the cell)' };

/* 17 Nov 2026, the view on the picture (Daniel, 16 Nov, of the cell game's courses: "I am a student, I see this … I'm
   not going to read it … teach the content as much as possible using the animations and the … images … even with labels
   and as a discovery way"; memory teach-on-the-picture). A step now keeps about 49 words on show: its plain first line
   and the guide lines that no name can carry. A guide line that says what ONE named part is stands in that name's card
   (`cards`: the name on the picture is a button; pressed, its part lights and its card opens, with the line's own level
   and code): nothing of the guide is folded under More detail, and no line on show needs a card to be understood.
   `subs`: a small second word on a name. `note`: said on the picture itself. `films`: buttons that play FILMS below. */
export const STEPS = [
  { title: 'Two layers of phospholipids', view: 'whole', labels: ['head', 'tails', 'bilayer'],
    t: `[!] This is a small piece of the cell membrane of an animal cell, {wide} nm wide.
[sl B2.1.1] Most of its molecules have a round head and two tails: they are phospholipids. In water, phospholipids form two layers naturally: a phospholipid bilayer.
[x+] The bilayer is about 5 nm thick. Every molecule in this picture is drawn to the same scale: use the scale bar. You can drag the picture to turn it.`,
    cards: {
      head: `[sl B2.1.10] The head is attracted to water: it is hydrophilic. So the heads face the water on both sides of the membrane.`,
      tails: `[sl B2.1.10] The tails are not attracted to water: they are hydrophobic. So the tails face each other in the middle of the membrane.
[sl B2.1.2] Ions, polar molecules and large molecules pass through this hydrophobic middle very slowly. So the membrane is a barrier between two solutions.`,
      bilayer: `[sl B1.1.12] A molecule with a hydrophilic part and a hydrophobic part is amphipathic. Phospholipids are amphipathic: for this reason they form a bilayer in water.` } },
  { title: 'Fluid: the phospholipids move', view: 'top', labels: [], ctl: ['lipid'],
    t: `[sl B2.1.10] Watch the heads. No phospholipid stays in its place. Each one moves sideways in its own layer and changes places with its neighbours.
[sl B2.1.10] So a membrane behaves like a liquid in two dimensions. This is the "fluid" of the fluid mosaic model.
[x+] In a living cell this movement is very fast. A phospholipid changes places with a neighbour about 10 million times each second. In one second it moves about 1 to 2 µm from its start: 40 to 80 times the width of this picture. Here the sideways movement is slowed about {slow} times.
[x+] A phospholipid almost never crosses to the other layer: its hydrophilic head would have to pass through the hydrophobic middle. This rare crossing is called flip-flop. For one phospholipid it takes hours or days. At the speed of this picture you would wait thousands of years, so here no phospholipid crosses.` },
  { title: 'The tails: straight or bent', view: 'close', labels: ['unsat', 'sat'],
    t: `[!] Close to the cut edge: look at the tails.
[sl B1.1.10] Each tail is a fatty acid chain: saturated or unsaturated.
[hl B2.1.11] Adaptation to habitat, an example: fish of cold seas have more unsaturated fatty acids in their membranes than fish of warm seas. So their membranes stay fluid in the cold.
[x+] The tails are not stiff: they swing all the time. Each phospholipid also turns around its own length. In a living cell these two movements are even faster than the sideways movement. Here they are slowed much more, so that you can see them.
[x+] In this picture most phospholipids have one saturated tail and one unsaturated tail, as many phospholipids of cell membranes have.`,
    cards: {
      unsat: `[sl B1.1.10] An unsaturated fatty acid has a C=C double bond, which gives its tail a fixed bend. A monounsaturated fatty acid has one C=C double bond; a polyunsaturated fatty acid has more than one.
[hl B2.1.11] Bent tails cannot pack closely. So unsaturated fatty acids have lower melting points. The membrane is fluid and flexible at the temperature of the cell.`,
      sat: `[sl B1.1.10] A saturated fatty acid has no C=C double bond and gives a straight tail.
[hl B2.1.11] Straight tails pack closely. Saturated fatty acids have higher melting points and make a membrane stronger at higher temperatures.` } },
  { title: 'Cholesterol among the tails', view: 'close', labels: ['chol'],
    t: `[!] The yellow molecules between the phospholipids are cholesterol.
[sl B2.1.10] Cholesterol is a lipid in the membranes of animal cells. Most of the molecule is hydrophobic, so it stays among the tails.
[hl B2.1.12] Cholesterol adjusts the fluidity of the membrane: it is a modulator of fluidity.
[x+] In the cell membrane of an animal cell, about 30 to 40 of every 100 lipid molecules are cholesterol. In this picture: 1 in 3.`,
    cards: {
      chol: `[hl B2.1.12] Its position: the small hydrophilic end of cholesterol (red here) is next to the heads of the phospholipids. Its stiff rings are beside the part of the tails nearest the heads.
[hl B2.1.12] At higher temperatures cholesterol limits the movement of the tails, so the membrane is more stable. At lower temperatures it prevents the tails from packing closely, so the membrane does not stiffen.` } },
  { title: 'Mosaic: proteins in the membrane', view: 'whole', ghost: true, labels: ['channel', 'carrier', 'glyco', 'peri'],
    subs: { channel: 'integral', carrier: 'integral', glyco: 'integral' }, note: 'The lipids are faded: you see each protein whole', films: ['fracture'],
    t: `[sl B2.1.4] An integral protein is embedded in one or both layers of the bilayer. A peripheral protein is attached to one surface. Membrane proteins differ in structure, location and function.
[sl B2.1.10] Many different proteins lie among the lipids like the pieces of a mosaic: the "mosaic" of the fluid mosaic model.
[x+] A mosaic is a picture made of many small pieces.
[x+] These proteins are models made of beads, as computer simulations draw them. Their sizes are true. Their exact shapes are not measured shapes.`,
    cards: {
      channel: `[sl B2.1.6] A channel protein has a narrow opening through it: a pore. When the channel is open, specific ions diffuse through the pore. When it is closed, they cannot. This is facilitated diffusion.
[sl B2.1.4] This integral protein crosses both layers.`,
      carrier: `[sl B2.1.8] Proteins like this one and the channel protein let only specific particles cross. So the membrane is selectively permeable.
[sl B2.1.4] This integral protein crosses both layers.
[x] It is a model of a glucose transporter, the one at the cell game's way in. It binds glucose and changes its shape to move the glucose across.`,
      glyco: `[sl B2.1.4] This integral protein crosses both layers. Its larger part is outside the cell.
[sl B2.1.9] It carries carbohydrate (green), so it is a glycoprotein: step 7 shows more.`,
      peri: `[sl B2.1.4] This peripheral protein is attached to the surface of the bilayer on the cytoplasm side.` } },
  { title: 'The proteins move too', view: 'top', labels: [], ctl: ['protein', 'lipid'], films: ['mix'],
    t: `[sl B2.1.10] The bilayer is fluid, so the proteins are not fixed. They move slowly among the lipids, and they turn. Follow the carrier protein and one phospholipid, and compare their paths.
[x+] A number says how fast a molecule spreads by random movement: its diffusion coefficient. In rat kidney cells, scientists measured 0.42 µm² s⁻¹ for a phospholipid and 0.07 µm² s⁻¹ for a membrane protein: {ratio} times smaller. This picture uses the same ratio.
[x+] So in the same time a phospholipid moves about 2.4 times as far as a protein, on average (the distance depends on the square root of the diffusion coefficient, and the square root of {ratio} is about 2.4).
[x+] Why are proteins slower? A protein is much larger than a phospholipid. In a living cell, other proteins and the cytoskeleton (the cell's frame of protein fibres) also limit its movement.
[x+] Each path is random. Follow again and the path is different, so compare the averages too.` },
  { title: 'Carbohydrate faces outside', view: 'whole', labels: ['glyco', 'glycolipid'],
    t: `[!] Some proteins and some lipids carry a short chain of sugar units (green): a carbohydrate chain.
[sl B2.1.9] The carbohydrate is always on the side that faces outside the cell (the extracellular side). Cells use it to recognise each other (cell recognition) and to bind to each other (cell adhesion).
[x+] Each green bead is one sugar unit, about 0.5 nm long.`,
    cards: {
      glyco: `[sl B2.1.9] A protein with carbohydrate is a glycoprotein.`,
      glycolipid: `[sl B2.1.9] A lipid with carbohydrate is a glycolipid.` } },
  { title: 'The fluid mosaic model', view: 'side', labels: ['channel', 'carrier', 'glyco', 'peri', 'head2', 'tails', 'chol'],
    subs: { channel: 'integral', carrier: 'integral', glyco: 'integral' },
    t: `[!] The membrane seen from the side, like a drawing in two dimensions.
[sl B2.1.10] This is the fluid mosaic model: a fluid bilayer with a mosaic of proteins. Draw it in two dimensions. Include peripheral and integral proteins, glycoproteins, phospholipids and cholesterol, and indicate the hydrophobic and the hydrophilic regions.
[x+] It is a model: Singer and Nicolson proposed it in 1972. A real membrane is more crowded and more varied than this picture. The list under these steps says what the picture simplifies.` },
  /* 16 Nov 2026: another piece of the same membrane (view.js patch 'aqp'), with aquaporin 1 in its measured shape.
     17 Nov 2026: osmosis as the guide asks it explained (B2.1.5: "random movement of particles, impermeability of
     membranes to solutes and differences in solute concentration"): many water molecules and solute particles, each on
     a random walk (water.js); a strip on the picture counts the water that crosses, both ways (OSMO below) */
  { title: 'Water crosses: osmosis and aquaporins', view: 'aqp', patch: 'aqp', labels: ['aquaporin', 'subunit', 'file', 'crossing', 'solute'], osmo: true,
    note: 'The water is slowed much more than the lipids',
    t: `[!] Here you see how water crosses the membrane.
[sl B2.1.5] Water molecules move at random, both ways. The membrane is selectively permeable: water crosses it, most solutes (dissolved particles) do not.
[sl B2.1.5, D2.3.2] Osmosis is the net movement of water across the membrane, towards the higher solute concentration.
[x+] Your salivary gland cells have aquaporin 5 in the membrane next to the duct, so water follows the salts into saliva.
[x+] Scientists put small bags of membrane into a more concentrated solution. Bags with aquaporin 1 shrank, as water left them, in about 20 milliseconds (thousandths of a second). Bags without it took about half a second.
[x+] The pore is about 2 nm long. At its narrowest it is about 0.3 nm wide: just wide enough for one water molecule. A positive charge there repels protons (hydrogen ions), so they do not cross with the water.
[x+] Mice without aquaporin 5 make more than 60 % less saliva when their salivary glands are stimulated.
[x+] This is aquaporin 1, drawn in its measured shape. It is held still here so that you can follow the water. In a cell it moves like the other proteins.`,
    cards: {
      aquaporin: `[sl B2.1.5] Many more water molecules cross, much faster, through aquaporins than between the phospholipids. An aquaporin is a channel protein for water.`,
      subunit: `[sl B2.1.5] An aquaporin has four subunits, each with its own narrow pore.`,
      file: `[x] In each pore the water molecules pass one behind another. In a cell, about 3 billion water molecules pass through one pore of aquaporin 1 every second. This picture is much slower.`,
      crossing: `[sl B2.1.5] A few water molecules cross slowly between the phospholipids.`,
      solute: `[sl B2.1.5] A solute is a dissolved particle. Here no solute crosses the membrane: each one that reaches it turns back.
[sl B2.1.5] On the side with more solute particles, fewer water molecules reach the pores. So more water crosses towards that side than away from it.` } }
];

/* step 9's strip and its switch (on the picture): the words are pieces of the step's own lines */
export const OSMO = {
  name: 'Water', hi: 'higher solute concentration', lo: 'lower solute concentration',
  out: 'outside the cell', cyt: 'in the cell', up: 'crossed out of the cell', down: 'crossed into the cell',
  net: 'net movement of water', osmosis: 'osmosis', toward: 'towards the higher solute concentration',
  ask: 'More solutes', choices: { out: 'outside the cell', cyt: 'in the cell' }
};

/* the films (17 Nov 2026): a guide line about a technique is shown as the technique itself; its caption is that line,
   word for word, a piece for each shot (as the leaf's films: js/plant/films.js) */
export const FILMS = {
  /* in the picture's own 3D (view.js fracture): the molecules stop, the outer layer lifts, the camera looks down */
  fracture: { btn: 'Freeze fracture: split the membrane', tag: '[sl A2.2.3]',
    shots: [
      { say: 'Freeze fracture splits a frozen membrane between its two layers.', labels: ['fOuter', 'fInner'] },
      { say: 'Electron micrographs of the split faces show bumps: the integral proteins.', labels: ['fBump', 'fHole'] }],
    grey: ['In colour', 'No colour'] },
  /* a small drawing in the sheet (view.js mixFilm): the joined cell's surface, each dot many proteins */
  mix: { btn: 'The evidence: two cells joined', tag: '[sl A2.2.3]',
    shots: [
      { say: 'In 1970, Frye and Edidin joined a mouse cell and a human cell into one cell.' },
      { say: 'They marked the membrane proteins of each cell with fluorescent antibodies of a different colour (immunofluorescence).' },
      { say: 'After 40 minutes the two colours were mixed over the whole surface of almost every joined cell.' }],
    key: { mouse: 'proteins of the mouse cell', human: 'proteins of the human cell' }, clock: ['0 minutes', '40 minutes'] }
};

/* what the picture simplifies: said once, here, under the steps (all beyond the guide) */
export const SIMPLE = [
  'Speed. The sideways movement is slowed about {slow} times: 1 second here is {real} millionths of a second in a cell. The swinging of the tails and the turning of each lipid are slowed much more.',
  'Edges. This piece is cut from a membrane that continues on every side. At an edge of the piece a molecule changes direction; in a cell it would continue.',
  'Lipids. You see one kind of phospholipid, cholesterol and one kind of glycolipid. A real cell membrane has hundreds of kinds of lipid, and its two layers differ in their lipids.',
  'Proteins. They are models made of beads, true in size. Here they fill about 10 % of the area. In the membrane of a red blood cell they fill about one quarter. The aquaporin of step 9 is not a model of beads: it is the measured shape of aquaporin 1.',
  'In steps 1 to 8 the proteins do not work: no ion passes through the channel, and the carrier does not change its shape.',
  'Freeze fracture (step 5). In the film the outer layer is turned back, so that you see both split faces; in the real method the two halves come apart. All three integral proteins stay with the layer on the cytoplasm side here; in a real split membrane some stay with the other layer. "No colour" only takes the colours out of the picture: a real electron micrograph shows the bumps, not each tail.',
  'The two cells joined (step 6). The film is a drawing of the joined cell\'s surface. Each dot stands for many proteins. The dots move at random, as the proteins of this picture do.',
  'Protein movement. All four proteins have the same diffusion coefficient here, {ratio} times smaller than the phospholipids\'. In cells it differs from protein to protein (about 5 to 50 times smaller than the lipids\'), and the cytoskeleton holds some proteins in one region.',
  'The paths come from a computer model: discs that move at random and push each other. The sizes and the ratio of the speeds come from measurements; each exact path is random.',
  'Crossing between the layers. No lipid crosses here. In a cell, cholesterol crosses much faster than a phospholipid (the measurements differ: from less than a second to minutes). At the speed of this picture, even one second is more than a month.',
  'Not drawn: ions, the cytoskeleton, and water (except in step 9). A real membrane also bends; this one is flat.',
  'Step 9 shows another piece of the membrane, 16 nm × 13 nm. Only some of the water molecules are drawn: in a cell, water fills the space on both sides of the membrane. Far more solute particles are drawn for each water molecule than a cell has: in a cell, about 1 particle in 200 is a solute, and the net movement is a small part of all the water that crosses. The two sides hold the same number of drawn particles, so the side with more solute particles has fewer water molecules. Every particle moves at random; none is pushed. The solute particles keep clear of the aquaporin here, so that none seems to be inside it. The aquaporin is held still. The water moves much more slowly than in a cell.'
];

/* the sources, with what each one supports (the page ends with this list) */
export const SOURCES = [
  { c: 'International Baccalaureate Organization (2023). Biology guide, first assessment 2025. Topics B2.1, Membranes and membrane transport, and D2.3, Water potential.', s: 'The statements and codes on the level tags.' },
  { c: 'Singer SJ, Nicolson GL (1972). The fluid mosaic model of the structure of cell membranes. Science 175: 720–731.', u: 'https://doi.org/10.1126/science.175.4023.720', s: 'The model itself.' },
  { c: 'Branton D (1966). Fracture faces of frozen membranes. PNAS 55: 1048–1056.', u: 'https://doi.org/10.1073/pnas.55.5.1048', s: 'Step 5, freeze fracture: a frozen membrane splits between its two layers.' },
  { c: 'Frye LD, Edidin M (1970). The rapid intermixing of cell surface antigens after formation of mouse-human heterokaryons. Journal of Cell Science 7: 319–335.', u: 'https://doi.org/10.1242/jcs.7.2.319', s: 'Membrane proteins move: mixed in over 90 % of fused cells after 40 minutes. The film of step 6: the mouse cell\'s proteins marked green, the human cell\'s red.' },
  { c: 'Alberts B, Johnson A, Lewis J, Raff M, Roberts K, Walter P (2002). Molecular Biology of the Cell, 4th edition, chapter 10: The lipid bilayer; Membrane proteins. Garland Science.', u: 'https://www.ncbi.nlm.nih.gov/books/NBK26871/', s: 'A lipid moves about 2 µm in a second (diffusion coefficient about 10⁻⁸ cm² s⁻¹), changes places with neighbours about 10⁷ times a second, spins and bends, and crosses to the other layer less than once a month.' },
  { c: 'Phillips R (2018). Membranes by the numbers. In: Physics of Biological Membranes. Springer. arXiv:1703.02066.', u: 'https://arxiv.org/abs/1703.02066', s: 'Lipid diffusion about 1 µm² s⁻¹, membrane proteins in cells 0.02–0.2 µm² s⁻¹; a lipid 0.25–0.75 nm² in area; membrane proteins 3–5 nm across.' },
  { c: 'Fujiwara T, Ritchie K, Murakoshi H, Jacobson K, Kusumi A (2002). Phospholipids undergo hop diffusion in compartmentalized cell membrane. Journal of Cell Biology 157: 1071–1082.', u: 'https://doi.org/10.1083/jcb.200202050', s: 'In the same rat kidney cells: a phospholipid 0.42 µm² s⁻¹, the transferrin receptor (a membrane protein) 0.07 µm² s⁻¹. The ratio of 6 in this picture.' },
  { c: 'van Meer G, Voelker DR, Feigenson GW (2008). Membrane lipids: where they are and how they behave. Nature Reviews Molecular Cell Biology 9: 112–124.', u: 'https://doi.org/10.1038/nrm2330', s: 'Crossing between the layers: hours to days for a phospholipid, seconds for cholesterol; the cholesterol of the cell membrane; carbohydrate-carrying lipids on the outer side.' },
  { c: 'Hazel JR (1995). Thermal adaptation in biological membranes: is homeoviscous adaptation the explanation? Annual Review of Physiology 57: 19–42.', u: 'https://doi.org/10.1146/annurev.ph.57.030195.000315', s: 'Animals of cold habitats have more unsaturated fatty acids in their membranes.' },
  { c: 'Kornberg RD, McConnell HM (1971). Inside-outside transitions of phospholipids in vesicle membranes. Biochemistry 10: 1111–1120.', u: 'https://doi.org/10.1021/bi00783a003', s: 'The first measurement of flip-flop: a half-time of hours.' },
  { c: 'Dupuy AD, Engelman DM (2008). Protein area occupancy at the center of the red blood cell membrane. PNAS 105: 2848–2852.', u: 'https://doi.org/10.1073/pnas.0712379105', s: 'Proteins fill at least 23 % of the area of a red blood cell membrane.' },
  { c: 'Mitra K, Ubarretxena-Belandia I, Taguchi T, Warren G, Engelman DM (2004). Modulation of the bilayer thickness of exocytic pathway membranes by membrane proteins rather than cholesterol. PNAS 101: 4083–4088.', u: 'https://doi.org/10.1073/pnas.0307332101', s: 'The thickness of the bilayer: about 4 nm from phosphate to phosphate.' },
  { c: 'Ingólfsson HI, Melo MN, van Eerden FJ, et al. (2014). Lipid organization of the plasma membrane. Journal of the American Chemical Society 136: 14554–14559.', u: 'https://doi.org/10.1021/ja507832e', s: 'A computer simulation of a cell membrane with 63 kinds of lipid and about 30 % cholesterol: the look of molecules as beads.' },
  { c: 'Murata K, Mitsuoka K, Hirai T, Walz T, Agre P, Heymann JB, Engel A, Fujiyoshi Y (2000). Structural determinants of water permeation through aquaporin-1. Nature 407: 599–605. Its atomic model: PDB 1FQY (wwPDB, CC0), rcsb.org/structure/1FQY.', u: 'https://doi.org/10.1038/35036519', s: 'Step 9: the measured shape of aquaporin 1, its four subunits and their pores, drawn from PDB 1FQY; the pore narrows to about 0.3 nm.' },
  { c: 'Finkelstein A (1987). Water Movement Through Lipid Bilayers, Pores, and Plasma Membranes: Theory and Reality. Wiley.', s: 'Step 9: in a pore that holds one file of water molecules, water enters from a side as often as a water molecule is at the opening on that side.' },
  { c: 'Agre P (2003). Aquaporin water channels. Nobel Lecture, 8 December 2003. The Nobel Foundation.', u: 'https://www.nobelprize.org/uploads/2018/06/agre-lecture.pdf', s: 'Step 9: about 3 billion water molecules per subunit per second; a pore in each of the four subunits, about 2 nm long, where water passes in single file, 2.8 Å at its narrowest, its arginine repelling protons; membranes with aquaporin 1 lost water in about 20 ms, without it in about 0.5 s; aquaporin 5 in the membrane of salivary gland cells next to the duct (the apical membrane), the last membrane that water crosses to make saliva.' },
  { c: 'Ma T, Song Y, Gillespie A, Carlson EJ, Epstein CJ, Verkman AS (1999). Defective secretion of saliva in transgenic mice lacking aquaporin-5 water channels. Journal of Biological Chemistry 274: 20071–20074.', u: 'https://doi.org/10.1074/jbc.274.29.20071', s: 'Step 9: aquaporin 5 in salivary gland cells; mice without it made more than 60 % less saliva when stimulated, and their saliva was more concentrated.' },
  { c: 'Allender DW, Sodt AJ, Schick M (2019). Cholesterol-dependent bending energy is important in cholesterol distribution of the plasma membrane. Biophysical Journal 116: 2356–2366.', u: 'https://doi.org/10.1016/j.bpj.2019.03.028', s: 'Cholesterol: 4 of every 10 lipid molecules in their model of the cell membrane; its rings lie below the phospholipid heads.' }
];
