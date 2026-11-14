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
     B1.1.12 "amphipathic": SL and HL.
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
  glycolipid: 'glycolipid', lipidTag: 'this phospholipid', protTag: 'this carrier protein'
};
export const PLACES = { out: 'Outside the cell', cyt: 'Cytoplasm (inside the cell)' };

export const STEPS = [
  { title: 'Two layers of phospholipids', view: 'whole', labels: ['head', 'tails', 'bilayer'],
    t: `[sl B2.1.1] This is a small piece of the cell membrane of an animal cell, {wide} nm wide. Most of its molecules have a round head and two tails: they are phospholipids. In water, phospholipids form two layers naturally: a phospholipid bilayer.
[sl B2.1.10] The head is attracted to water: it is hydrophilic. The tails are not attracted to water: they are hydrophobic. So the heads face the water on both sides of the membrane, and the tails face each other in the middle.
[sl B2.1.2] Ions, polar molecules and large molecules pass through the hydrophobic middle very slowly. So the membrane is a barrier between two solutions.
[sl B1.1.12] A molecule with a hydrophilic part and a hydrophobic part is amphipathic.
[x+] The bilayer is about 5 nm thick. Every molecule in this picture is drawn to the same scale: use the scale bar. You can drag the picture to turn it.` },
  { title: 'Fluid: the phospholipids move', view: 'top', labels: [], ctl: ['lipid'],
    t: `[sl B2.1.10] Watch the heads. No phospholipid stays in its place. Each one moves sideways in its own layer and changes places with its neighbours.
[sl B2.1.10] So a membrane behaves like a liquid in two dimensions. This is the "fluid" of the fluid mosaic model.
[x+] In a living cell this movement is very fast. A phospholipid changes places with a neighbour about 10 million times each second. In one second it moves about 1 to 2 µm from its start: 40 to 80 times the width of this picture. Here the sideways movement is slowed about {slow} times.
[x+] A phospholipid almost never crosses to the other layer: its hydrophilic head would have to pass through the hydrophobic middle. This rare crossing is called flip-flop. For one phospholipid it takes hours or days. At the speed of this picture you would wait thousands of years, so here no phospholipid crosses.` },
  { title: 'The tails: straight or bent', view: 'close', labels: ['unsat', 'sat'],
    t: `[x] The camera is now close to the cut edge. The tails are not stiff: they swing all the time.
[x+] Each phospholipid also turns around its own length. In a living cell these two movements are even faster than the sideways movement. Here they are slowed much more, so that you can see them.
[hl B2.1.11] Each tail is a fatty acid chain. A saturated fatty acid gives a straight tail. An unsaturated fatty acid has a double bond, which gives its tail a fixed bend.
[hl B2.1.11] Bent tails cannot pack closely. So unsaturated fatty acids have lower melting points. The membrane is fluid and flexible at the temperature of the cell.
[hl B2.1.11] Straight tails pack closely. Saturated fatty acids have higher melting points and make a membrane stronger at higher temperatures.
[hl B2.1.11] An example of adaptation to habitat: fish of cold seas have more unsaturated fatty acids in their membranes than fish of warm seas. So their membranes stay fluid in the cold.
[x+] In this picture most phospholipids have one saturated tail and one unsaturated tail, as many phospholipids of cell membranes have.` },
  { title: 'Cholesterol among the tails', view: 'close', labels: ['chol'],
    t: `[sl B2.1.10] The yellow molecules between the phospholipids are cholesterol. Cholesterol is a lipid in the membranes of animal cells. Most of the molecule is hydrophobic, so it stays among the tails.
[hl B2.1.12] Its small hydrophilic end (red here) is next to the heads of the phospholipids. Its stiff rings are beside the part of the tails nearest the heads.
[hl B2.1.12] Cholesterol adjusts the fluidity of the membrane: it is a modulator of fluidity. At higher temperatures it limits the movement of the tails, so the membrane is more stable. At lower temperatures it prevents the tails from packing closely, so the membrane does not stiffen.
[x+] In the cell membrane of an animal cell, about 30 to 40 of every 100 lipid molecules are cholesterol. In this picture: 1 in 3.` },
  { title: 'Mosaic: proteins in the membrane', view: 'whole', ghost: true, labels: ['channel', 'carrier', 'glyco', 'peri'],
    t: `[sl B2.1.4] The lipids are faded now, so that you see each protein whole. A protein that is embedded in one or both layers of the bilayer is an integral protein. The three integral proteins here cross both layers. A protein that is attached to one surface of the bilayer is a peripheral protein: this one is on the cytoplasm side.
[sl B2.1.4] Membrane proteins differ in structure, location and function.
[sl B2.1.6] A channel protein has a narrow opening through it: a pore. When the channel is open, specific ions diffuse through the pore. When it is closed, they cannot. This is facilitated diffusion.
[sl B2.1.8] Proteins like these let only specific particles cross. So the membrane is selectively permeable.
[x+] The carrier protein here is a model of the glucose transporter of the game. It binds glucose and changes its shape to move the glucose across.
[sl B2.1.10] A mosaic is a picture made of many small pieces. Many different proteins lie among the lipids, like the pieces of a mosaic: this is the "mosaic" of the fluid mosaic model.
[x+] These proteins are models made of beads, as computer simulations draw them. Their sizes are true. Their exact shapes are not measured shapes.` },
  { title: 'The proteins move too', view: 'top', labels: [], ctl: ['protein', 'lipid'],
    t: `[sl B2.1.10] The bilayer is fluid, so the proteins are not fixed. They move slowly among the lipids, and they turn. Follow the carrier protein and one phospholipid, and compare their paths.
[x+] A number says how fast a molecule spreads by random movement: its diffusion coefficient. In rat kidney cells, scientists measured 0.42 µm² s⁻¹ for a phospholipid and 0.07 µm² s⁻¹ for a membrane protein: {ratio} times smaller. This picture uses the same ratio.
[x+] So in the same time a phospholipid moves about 2.4 times as far as a protein, on average (the distance depends on the square root of the diffusion coefficient).
[x+] Why are proteins slower? A protein is much larger than a phospholipid. In a living cell, other proteins and the cytoskeleton (the cell's frame of protein fibres) also limit its movement.
[x+] Each path is random. Follow again and the path is different, so compare the averages too.
[x+] The evidence that membrane proteins move: in 1970, Frye and Edidin joined a mouse cell and a human cell into one cell. They marked the membrane proteins of each cell with a different colour. After 40 minutes the two colours were mixed over the whole surface of almost every joined cell.` },
  { title: 'Carbohydrate faces outside', view: 'whole', labels: ['glyco', 'glycolipid'],
    t: `[sl B2.1.9] Some proteins and some lipids of the membrane carry a short chain of sugar units: a carbohydrate chain. A protein with carbohydrate is a glycoprotein. A lipid with carbohydrate is a glycolipid.
[sl B2.1.9] The carbohydrate is always on the side of the membrane that faces outside the cell (the extracellular side). Cells use it to recognise each other (cell recognition) and to bind to each other (cell adhesion).
[x+] In this picture the green chains are the carbohydrate. Each green bead is one sugar unit, about 0.5 nm long.` },
  { title: 'The fluid mosaic model', view: 'side', labels: ['channel', 'carrier', 'glyco', 'peri', 'head2', 'tails', 'chol'],
    t: `[sl B2.1.10] Now you see the membrane from the side, like a drawing in two dimensions. This is the fluid mosaic model: a fluid bilayer of phospholipids and cholesterol, with a mosaic of integral proteins, peripheral proteins and glycoproteins.
[sl B2.1.10] Draw the model in two dimensions. Include peripheral and integral proteins, glycoproteins, phospholipids and cholesterol, and indicate the hydrophobic and the hydrophilic regions.
[x+] It is a model: Singer and Nicolson proposed it in 1972. A real membrane is more crowded and more varied than this picture. The list under these steps says what the picture simplifies.` }
];

/* what the picture simplifies: said once, here, under the steps (all beyond the guide) */
export const SIMPLE = [
  'Speed. The sideways movement is slowed about {slow} times: 1 second here is {real} millionths of a second in a cell. The swinging of the tails and the turning of each lipid are slowed much more.',
  'Edges. This piece is cut from a membrane that continues on every side. At an edge of the piece a molecule changes direction; in a cell it would continue.',
  'Lipids. You see one kind of phospholipid, cholesterol and one kind of glycolipid. A real cell membrane has hundreds of kinds of lipid, and its two layers differ in their lipids.',
  'Proteins. They are models made of beads, true in size. Here they fill about 10 % of the area. In the membrane of a red blood cell they fill about one quarter.',
  'The proteins do not work here: no ion passes through the channel, and the carrier does not change its shape.',
  'Protein movement. All four proteins have the same diffusion coefficient here, {ratio} times smaller than the phospholipids\'. In cells it differs from protein to protein (about 5 to 50 times smaller than the lipids\'), and the cytoskeleton holds some proteins in one region.',
  'The paths come from a computer model: discs that move at random and push each other. The sizes and the ratio of the speeds come from measurements; each exact path is random.',
  'Crossing between the layers. No lipid crosses here. In a cell, cholesterol crosses much faster than a phospholipid (the measurements differ: from less than a second to minutes). At the speed of this picture, even one second is more than a month.',
  'Not drawn: water molecules, ions and the cytoskeleton. A real membrane also bends; this one is flat.'
];

/* the sources, with what each one supports (the page ends with this list) */
export const SOURCES = [
  { c: 'International Baccalaureate Organization (2023). Biology guide, first assessment 2025. Topic B2.1, Membranes and membrane transport.', s: 'The statements and codes on the level tags.' },
  { c: 'Singer SJ, Nicolson GL (1972). The fluid mosaic model of the structure of cell membranes. Science 175: 720–731.', u: 'https://doi.org/10.1126/science.175.4023.720', s: 'The model itself.' },
  { c: 'Frye LD, Edidin M (1970). The rapid intermixing of cell surface antigens after formation of mouse-human heterokaryons. Journal of Cell Science 7: 319–335.', u: 'https://doi.org/10.1242/jcs.7.2.319', s: 'Membrane proteins move: mixed in over 90 % of fused cells after 40 minutes.' },
  { c: 'Alberts B, Johnson A, Lewis J, Raff M, Roberts K, Walter P (2002). Molecular Biology of the Cell, 4th edition, chapter 10: The lipid bilayer; Membrane proteins. Garland Science.', u: 'https://www.ncbi.nlm.nih.gov/books/NBK26871/', s: 'A lipid moves about 2 µm in a second (diffusion coefficient about 10⁻⁸ cm² s⁻¹), changes places with neighbours about 10⁷ times a second, spins and bends, and crosses to the other layer less than once a month.' },
  { c: 'Phillips R (2018). Membranes by the numbers. In: Physics of Biological Membranes. Springer. arXiv:1703.02066.', u: 'https://arxiv.org/abs/1703.02066', s: 'Lipid diffusion about 1 µm² s⁻¹, membrane proteins in cells 0.02–0.2 µm² s⁻¹; a lipid 0.25–0.75 nm² in area; membrane proteins 3–5 nm across.' },
  { c: 'Fujiwara T, Ritchie K, Murakoshi H, Jacobson K, Kusumi A (2002). Phospholipids undergo hop diffusion in compartmentalized cell membrane. Journal of Cell Biology 157: 1071–1082.', u: 'https://doi.org/10.1083/jcb.200202050', s: 'In the same rat kidney cells: a phospholipid 0.42 µm² s⁻¹, the transferrin receptor (a membrane protein) 0.07 µm² s⁻¹. The ratio of 6 in this picture.' },
  { c: 'van Meer G, Voelker DR, Feigenson GW (2008). Membrane lipids: where they are and how they behave. Nature Reviews Molecular Cell Biology 9: 112–124.', u: 'https://doi.org/10.1038/nrm2330', s: 'Crossing between the layers: hours to days for a phospholipid, seconds for cholesterol; the cholesterol of the cell membrane; carbohydrate-carrying lipids on the outer side.' },
  { c: 'Hazel JR (1995). Thermal adaptation in biological membranes: is homeoviscous adaptation the explanation? Annual Review of Physiology 57: 19–42.', u: 'https://doi.org/10.1146/annurev.ph.57.030195.000315', s: 'Animals of cold habitats have more unsaturated fatty acids in their membranes.' },
  { c: 'Kornberg RD, McConnell HM (1971). Inside-outside transitions of phospholipids in vesicle membranes. Biochemistry 10: 1111–1120.', u: 'https://doi.org/10.1021/bi00783a003', s: 'The first measurement of flip-flop: a half-time of hours.' },
  { c: 'Dupuy AD, Engelman DM (2008). Protein area occupancy at the center of the red blood cell membrane. PNAS 105: 2848–2852.', u: 'https://doi.org/10.1073/pnas.0712379105', s: 'Proteins fill at least 23 % of the area of a red blood cell membrane.' },
  { c: 'Mitra K, Ubarretxena-Belandia I, Taguchi T, Warren G, Engelman DM (2004). Modulation of the bilayer thickness of exocytic pathway membranes by membrane proteins rather than cholesterol. PNAS 101: 4083–4088.', u: 'https://doi.org/10.1073/pnas.0307332101', s: 'The thickness of the bilayer: about 4 nm from phosphate to phosphate.' },
  { c: 'Ingólfsson HI, Melo MN, van Eerden FJ, et al. (2014). Lipid organization of the plasma membrane. Journal of the American Chemical Society 136: 14554–14559.', u: 'https://doi.org/10.1021/ja507832e', s: 'A computer simulation of a cell membrane with 63 kinds of lipid and about 30 % cholesterol: the look of molecules as beads.' },
  { c: 'Allender DW, Sodt AJ, Schick M (2019). Cholesterol-dependent bending energy is important in cholesterol distribution of the plasma membrane. Biophysical Journal 116: 2356–2366.', u: 'https://doi.org/10.1016/j.bpj.2019.03.028', s: 'Cholesterol: 4 of every 10 lipid molecules in their model of the cell membrane; its rings lie below the phospholipid heads.' }
];
