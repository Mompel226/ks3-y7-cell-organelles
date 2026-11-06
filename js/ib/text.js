/* ============================================================
   text.js — the words of the IB view "From glucose to ATP" (5 Nov 2026): every chapter's steps, in order, from Daniel's
   own text (pasted 5 Nov 2026, kept word for word in the brief: side-session-notes …/ib-extension-brief.md §7), checked
   against the IB Biology guide (first assessment 2025: C1.2.1–C1.2.17, B1.1.4, B2.1.2–8, B2.2.4, C2.1.11).
   Corrected gently where his text was loose (memory biology-before-pedagogy): glucose is trapped by its FIRST phosphate
   group (glucose 6-phosphate); the sugar with two is fructose 1,6-bisphosphate; "1,3" is 1,3-bisphosphoglycerate, after
   the oxidation step; the mitochondrion receives pyruvate.
   Each paragraph starts with its level: [sl] SL and HL, [hl] HL only (Additional higher level), [x] beyond the IB guide
   (true, not needed for the exam); an IB code may follow in braces: [hl C1.2.8]. A step's `x` lists its Explore paths.
   Words (memory exam-wording-not-everyday-english, eal-korean-students, write-to-the-student-reader): "you", short
   sentences, one idea each, the IB's own terms (reduced NAD, dehydrogenation, decarboxylation, chemiosmosis, terminal
   electron acceptor), no idioms, no phrasal verbs, never "amount". <dfn data-w="key"> opens a word's meaning (the one KS3
   glossary, labs-shared/ks3-glossary.js); "\n" starts a new paragraph.
   ============================================================ */
export const LEVELS = {
  sl: { name: 'SL and HL', long: 'In the IB guide for SL and HL' },
  hl: { name: 'HL only', long: 'In the IB guide for HL only (Additional higher level)' },
  x: { name: 'Beyond the IB guide', long: 'True, and it helps the story make sense: you are not asked to learn it for the IB exam' }
};

export const CHAPTERS = [
  {
    id: 'c0', n: '0', title: 'Where everything happens', short: 'Map', mod: 'ch0', where: 'all',
    steps: [
      { t: '[sl C1.2.4] This is a map of the journey. You follow ONE glucose molecule, from your blood to the ATP made with the energy released from it.\n[sl] In the game you were inside a cell of a salivary gland. Here you follow glucose into a muscle cell. Every cell with mitochondria respires in the same way, and a muscle cell can also respire without oxygen.' },
      { t: '[sl] Glucose comes from your gut: starch in food is digested to glucose, which is absorbed into the blood. The <dfn data-w="plasma">plasma</dfn> carries it to every cell.\n[sl] Oxygen comes from your lungs, carried by <dfn data-w="haemoglobin">haemoglobin</dfn> in the red blood cells.' },
      { t: '[sl B2.1.8] Both cross the cell membrane of the muscle cell: glucose through a glucose transporter, oxygen between the phospholipids. Chapter 1.' },
      { t: '[sl C1.2.5] The first reactions happen in the <dfn data-w="cytosol">cytosol</dfn> and need no oxygen.\n[hl C1.2.8] They are <dfn data-w="glycolysis">glycolysis</dfn>: each glucose molecule becomes two <dfn data-w="pyruvate">pyruvate</dfn> molecules. Chapter 2.' },
      { t: '[sl C1.2.5] With oxygen, respiration continues in a mitochondrion (chapter 3): mitochondria are needed for aerobic respiration, not for anaerobic respiration.\n[hl C1.2.11–16] In its <dfn data-w="matrix">matrix</dfn>: the <dfn data-w="link-reaction">link reaction</dfn> (chapter 4) and the <dfn data-w="krebs-cycle">Krebs cycle</dfn> (chapter 5), where the carbon atoms leave as carbon dioxide. In its inner membrane: the <dfn data-w="electron-transport-chain">electron transport chain</dfn> and <dfn data-w="atp-synthase">ATP synthase</dfn> (chapter 6), where oxygen is used and most of the ATP is made.' },
      { t: '[sl C1.2.2] Carbon dioxide diffuses out of the cell, into the blood. ATP leaves the mitochondrion and gives energy to the jobs of the cell: in a muscle cell, mostly to contraction.\nPress a number on the map to open its chapter, or Next to begin chapter 1.' }
    ]
  },
  {
    id: 'c1', n: '1', title: 'Into the cell', short: 'Into the cell', mod: 'ch1', where: 'membrane',
    steps: [
      { t: '[sl B2.1.1] This is the cell membrane of the muscle cell, at its true size: a phospholipid bilayer, about 5 nm thick. Below is the <dfn data-w="tissue-fluid">tissue fluid</dfn>, outside the cell. Above is the cytosol.\n[sl B1.1.4] Below the membrane is one glucose molecule, about 1 nm across: its six carbon atoms carry the yellow numbers 1 to 6, red balls are oxygen, white hydrogen. Follow the numbers: they are shown in every chapter.' },
      { t: '[sl B2.1.2] Almost no glucose crosses the bilayer by itself. It is polar: its OH groups form hydrogen bonds with water. The middle of the bilayer is <dfn data-w="hydrophobic">hydrophobic</dfn>, so glucose is stopped.' },
      { t: '[sl B2.1.8] Glucose enters through a transport protein: <dfn data-w="facilitated-diffusion">facilitated diffusion</dfn>.\n[hl C2.1.11] In a muscle cell this protein is a <dfn data-w="glucose-transporter">glucose transporter</dfn>.\n[x] Its name is GLUT4. Open to the inside, its shape is measured (electron cryo-microscopy, 2022). Open to the outside, its two halves are turned from that shape: a model.' },
      { t: '[sl B2.1.8] Glucose binds in the middle of the transporter. The transporter changes shape: it closes to the outside and opens to the inside. Glucose is released into the cytosol.\n[sl B2.1.8] No ATP is used: glucose moves down its <dfn data-w="concentration-gradient">concentration gradient</dfn>, from where there is more glucose to where there is less.\n[hl C2.1.11] Insulin binds to a receptor in the cell membrane. A sequence of reactions then moves vesicles containing glucose transporters to the membrane, so more glucose can enter.' },
      { t: '[sl B2.1.3] Oxygen arrives separately: red blood cells release it in the capillaries. Oxygen molecules are small and non-polar, so they diffuse straight through the bilayer: simple diffusion.\n[hl C1.2.16] Oxygen is not used until the last step of aerobic respiration (chapter 6).' },
      { t: '[hl C1.2.8] In the cytosol, glucose and ATP bind to an enzyme.\n[x] The enzyme is hexokinase.' },
      { t: '[hl C1.2.8] The enzyme adds a phosphate group to carbon 6 of glucose. The phosphate group comes from ATP, which becomes ADP. This is <dfn data-w="phosphorylation">phosphorylation</dfn>, the first step of glycolysis.\n[x] The product is glucose 6-phosphate.' },
      { t: '[x] Why: the phosphate group carries two negative charges. The glucose transporter does not carry glucose 6-phosphate, so it cannot leave the cell: it is trapped.\n[x] It also keeps the concentration of glucose itself low inside the cell, so more glucose keeps diffusing in.' },
      { t: '[sl B2.1.8] So far: glucose entered by facilitated diffusion, with no ATP.\n[hl C1.2.8] Then one ATP was used to trap it: phosphorylation, the first stage of glycolysis.\nNext: glycolysis, in the cytosol (chapter 2).' }
    ]
  },
  {
    id: 'c2', n: '2', title: 'Glycolysis', short: 'Glycolysis', mod: 'ch2', where: 'cytosol',
    steps: [
      { t: '[hl C1.2.8] Glycolysis ("sugar splitting") happens in the cytosol and needs no oxygen. It has four stages: phosphorylation, lysis, oxidation and ATP formation.\n[hl C1.2.8] Each step is catalysed by a different enzyme. Above: every enzyme in its measured shape, at its true size, and a gold dot where the molecule is. Below: the molecule itself, magnified more.\n[x] You do not need to learn the names of the enzymes or of the molecules between glucose and pyruvate. They are named here so that you can follow them.' },
      { t: '[hl C1.2.8] Phosphorylation, part 1 (chapter 1): an enzyme added a phosphate group from ATP to carbon 6. This trapped glucose in the cell.\n[x] The enzyme is hexokinase; the product is glucose 6-phosphate.' },
      { t: '[x] An enzyme rearranges glucose 6-phosphate into fructose 6-phosphate: its ring now has five atoms, and carbon 1 is outside the ring.\n[x] Why: the C=O group moves from carbon 1 to carbon 2. So the molecule can later split into two halves of 3 carbons each, and carbon 1 is free to accept a phosphate group.\n[x] The enzyme is glucose-6-phosphate isomerase.' },
      { t: '[hl C1.2.8] Phosphorylation, part 2: a second ATP gives a phosphate group to carbon 1. The sugar now has a phosphate group at each end.\n[hl C1.2.8] Why: the sugar is less stable, ready to split, and each half will carry a phosphate group. Two ATP have been used: an investment that makes more ATP later.\n[x] The product is fructose 1,6-bisphosphate. The enzyme is phosphofructokinase. It is the main control point of glycolysis: a high concentration of ATP slows it.' },
      { t: '[hl C1.2.8] Lysis: the 6-carbon sugar splits between carbons 3 and 4, into two 3-carbon sugars, each with a phosphate group.\n[x] The enzyme is aldolase. One product is glyceraldehyde 3-phosphate (carbons 4, 5 and 6). The other is dihydroxyacetone phosphate (carbons 1, 2 and 3).' },
      { t: '[hl C1.2.8] Both halves are <dfn data-w="triose-phosphate">triose phosphates</dfn>: 3-carbon sugars with a phosphate group. One is changed into the other, so both continue the same way. From here on, everything happens twice for each glucose molecule.\n[x] The enzyme is triose phosphate isomerase: it changes dihydroxyacetone phosphate into glyceraldehyde 3-phosphate. Look at the numbers: in the glyceraldehyde 3-phosphate made this way, carbon 3 of glucose is at the end with the C=O group, where carbon 4 is in the other one.' },
      { t: '[hl C1.2.7] Oxidation: hydrogen is removed from triose phosphate (<dfn data-w="dehydrogenation">dehydrogenation</dfn>). <dfn data-w="nad">NAD</dfn> accepts it: NAD is reduced to NADH (<dfn data-w="reduced-nad">reduced NAD</dfn>).\n[hl C1.2.8] The energy released lets a second phosphate group attach. It comes from a phosphate ion in the cytosol, not from ATP.\n[x] The enzyme is GAPDH. The product is 1,3-bisphosphoglycerate.', x: ['x-nad', 'x-redox'] },
      { t: '[hl C1.2.8] ATP formation, part 1: the enzyme passes the new phosphate group straight to ADP: one ATP. No membrane and no gradient are needed.\n[x] Textbooks call this <dfn data-w="substrate-level-phosphorylation">substrate-level phosphorylation</dfn>; the IB guide says ATP formation. The enzyme is phosphoglycerate kinase. The product is 3-phosphoglycerate.', x: ['x-slp'] },
      { t: '[x] The enzyme gives a phosphate group of its own to the middle carbon atom (here glucose\'s carbon 5) and takes back the one on the end (carbon 6): the phosphate group does not move along the molecule. The enzyme is phosphoglycerate mutase; the product is 2-phosphoglycerate.' },
      { t: '[x] A water molecule is removed (enolase). This changes the molecule so that its phosphate group passes easily to ADP. The product is phosphoenolpyruvate.' },
      { t: '[hl C1.2.8] ATP formation, part 2: the phosphate group passes to ADP: one more ATP. The product is pyruvate, with 3 carbon atoms.\n[x] The enzyme is pyruvate kinase.' },
      { t: '[hl C1.2.8] For each glucose, everything from the oxidation step on happened twice. Net yield: 2 pyruvate, 2 reduced NAD and 4 − 2 = 2 ATP.\n[x] Glucose\'s carbons are now in two pyruvates: carbons 1, 2 and 3 in one, carbons 4, 5 and 6 in the other.' },
      { t: '[sl C1.2.5] What if there is no oxygen?\n[hl C1.2.9] Without oxygen, the electron transport chain stops (chapter 6). NADH cannot give its hydrogen to the chain, so soon all the NAD is reduced. Glycolysis needs NAD for its oxidation step, so glycolysis would stop too.' },
      { t: '[hl C1.2.9] In humans: an enzyme passes the hydrogen from NADH to pyruvate. Pyruvate is reduced to <dfn data-w="lactate">lactate</dfn>, and NAD is regenerated, so glycolysis continues.\n[sl C1.2.5] This is anaerobic respiration: glucose → lactate. It happens in the cytosol, needs no mitochondria and gives only 2 ATP per glucose.\n[x] The enzyme is lactate dehydrogenase.' },
      { t: '[hl C1.2.10] In yeast: pyruvate first loses carbon dioxide. Then the 2-carbon molecule left accepts the hydrogen from NADH: <dfn data-w="ethanol">ethanol</dfn>. NAD is regenerated.\n[hl C1.2.10] Glucose → ethanol + carbon dioxide. Brewing uses the ethanol; in baking, the carbon dioxide makes the dough rise.\n[x] The enzymes are pyruvate decarboxylase and alcohol dehydrogenase; the 2-carbon molecule is ethanal.' },
      { t: '[hl C1.2.9] Anaerobic respiration makes no extra ATP. It only regenerates NAD, so that glycolysis can keep making its 2 ATP per glucose.\nWith oxygen, pyruvate enters the mitochondrion instead: chapter 3.' }
    ]
  },
  {
    id: 'c3', n: '3', title: 'Into the mitochondrion', short: 'Into the mitochondrion', mod: 'ch3', where: 'mito',
    steps: [
      { t: '[sl C1.2.5] With oxygen present, respiration continues in a mitochondrion. This one is about 0.7 µm wide and 2.7 µm long, cut open: it has two membranes, and the inner one is folded into <dfn data-w="cristae">cristae</dfn>.\n[hl C1.2.11] Pyruvate enters it, for the link reaction.\n[sl] The scale bar shows how far the camera zooms: everything is at its true size.' },
      { t: '[hl B2.2.4] At its edge: the outer membrane, the <dfn data-w="intermembrane-space">intermembrane space</dfn> (about 15 nm wide) and the inner membrane. The intermembrane space has a small volume: this matters in chapter 6.' },
      { t: '[sl B2.1.6] Pyruvate crosses the outer membrane through a <dfn data-w="channel-protein">channel protein</dfn> with a wide pore: facilitated diffusion.\n[x] This channel protein is porin (VDAC1). Its shape is measured.' },
      { t: '[x] The inner membrane lets very few substances through. Pyruvate has its own carrier protein, the mitochondrial pyruvate carrier. Its shape was measured in 2025, in three positions: open to the intermembrane space, closed round pyruvate, open to the matrix.\n[x] It carries a proton (H⁺) in with each pyruvate.' },
      { t: '[hl B2.2.4] Pyruvate is now in the matrix. The enzymes of the link reaction and the Krebs cycle are here, together with their substrates: compartmentalization.' },
      { t: '[x] The two NADH from glycolysis cannot cross the inner membrane. Only their electrons enter, passed by shuttle systems (the dashed line on the map). In skeletal muscle much of it goes by the glycerol phosphate shuttle, which gives the electrons to FAD, not NAD: fewer ATP are made. The heart and the liver use another shuttle, which gives them to NAD. This is one reason why ATP totals differ.' },
      { t: 'Next: the link reaction, in the matrix (chapter 4).' }
    ]
  },
  {
    id: 'c4', n: '4', title: 'The link reaction', short: 'Link reaction', mod: 'ch4', where: 'matrix',
    steps: [
      { t: '[hl C1.2.11] In the matrix, pyruvate meets the enzyme complex of the link reaction, one of the largest enzymes in a cell.\n[x] It is the pyruvate dehydrogenase complex. Its core alone is 24 nm across: 60 protein chains, in its measured shape (2018). More enzymes of the complex, not shown here, sit round the core.' },
      { t: '[hl C1.2.11] <dfn data-w="decarboxylation">Decarboxylation</dfn>: one carbon atom is removed, as carbon dioxide. This is the first carbon dioxide that you exhale.\n[x] For this pyruvate it is glucose\'s carbon 4; for the other pyruvate, carbon 3.\n[hl C1.2.11] The remaining acetyl group (2 carbon atoms: here glucose\'s carbons 5 and 6) is attached to the sulfur atom of <dfn data-w="coenzyme-a">coenzyme A</dfn>: acetyl coenzyme A (acetyl CoA). Coenzyme A carries the acetyl group to the Krebs cycle.', x: ['x-coa'] },
      { t: '[hl C1.2.7] Oxidation: hydrogen is removed (dehydrogenation), and NAD accepts it. NAD is reduced to NADH.\n[x] The hydrogen that NAD accepts comes from the SH group of coenzyme A, as the acetyl group joins it; the electrons come from pyruvate\'s carbon (glucose\'s carbon 5): pyruvate is oxidized. Inside the enzyme complex, NAD is reduced last.' },
      { t: '[hl C1.2.11] For each glucose this happens twice: 2 carbon dioxide, 2 NADH and 2 acetyl CoA. No ATP is made.\n[hl C1.2.17] Fatty acids from lipids are also converted to acetyl groups (2C), which enter the Krebs cycle on coenzyme A in the same way. Glycolysis and anaerobic respiration happen only with carbohydrate.\n[hl C1.2.17] Lipids yield more energy per gram than carbohydrates: they have less oxygen and more oxidizable hydrogen and carbon.' }
    ]
  },
  {
    id: 'c5', n: '5', title: 'The Krebs cycle', short: 'Krebs cycle', mod: 'ch5', where: 'matrix',
    steps: [
      { t: '[hl C1.2.12] The <dfn data-w="krebs-cycle">Krebs cycle</dfn> is a cycle of reactions in the matrix. Above is a diagram of their order: each seat shows one molecule of the cycle and its number of carbon atoms, and each arrow is one step, with what enters it and what leaves it. The gold dot shows where the molecule is; below, you see the molecule itself.\n[hl C1.2.12] You need the names of two of the molecules: citrate (6C) and oxaloacetate (4C), in gold.\n[x] The others are named so that you can follow them, and so is the enzyme of each step. A grey dot marks a carbon atom that entered the cycle in an earlier turn.' },
      { t: '[hl C1.2.12] Acetyl CoA brings its acetyl group (2C), which joins oxaloacetate (4C): citrate (6C). Coenzyme A is released, to carry the next acetyl group.\n[x] The enzyme is citrate synthase. Glucose\'s carbons 5 and 6 are now in citrate.' },
      { t: '[x] The OH group moves to the next carbon atom (aconitase): isocitrate. This makes the next oxidation possible.' },
      { t: '[hl C1.2.12] Oxidation (dehydrogenation): NAD is reduced to NADH. Decarboxylation: a carbon atom leaves as carbon dioxide. The 6C molecule becomes a 5C molecule.\n[x] The 5C molecule is α-ketoglutarate. This carbon dioxide is not one of the carbons that entered in this turn: it entered in an earlier turn.' },
      { t: '[hl C1.2.12] A second oxidation (NADH) and a second decarboxylation (carbon dioxide): the 5C molecule becomes a 4C molecule, joined to coenzyme A.\n[x] It is succinyl CoA. The enzyme complex is built like the pyruvate dehydrogenase of the link reaction.' },
      { t: '[hl C1.2.12] Coenzyme A is released, and enough energy is released with it to make one ATP: a phosphate ion from the matrix joins the molecule, then passes, through the enzyme, to ADP.\n[x] Textbooks call this substrate-level phosphorylation. In some tissues the enzyme makes GTP, which then gives its phosphate group to ADP. The product is succinate.' },
      { t: '[hl C1.2.12] A third oxidation (dehydrogenation): two hydrogen atoms are removed.\n[x] They pass to <dfn data-w="fad">FAD</dfn>, not NAD, which is reduced to FADH₂. This enzyme is part of complex II, in the inner membrane: its FADH₂ stays inside it and passes its electrons to the electron transport chain (chapter 6). The product is fumarate.', x: ['x-fad'] },
      { t: '[x] Water is added (fumarase): malate.' },
      { t: '[hl C1.2.12] A fourth oxidation: NAD is reduced to NADH, and oxaloacetate (4C) is made again. It can accept the next acetyl group.' },
      { t: '[hl C1.2.12] One turn: four oxidations and two decarboxylations give 2 carbon dioxide, 3 NADH and 1 ATP. Two carbon atoms entered (the acetyl group) and two left (carbon dioxide).\n[x] The third oxidation gives 1 FADH₂ instead of NADH.' },
      { t: '[hl C1.2.12] Each glucose gives two acetyl groups, so the cycle turns twice per glucose: 4 carbon dioxide, 6 NADH and 2 ATP.\n[x] And 2 FADH₂. Watch the numbers in the second turn: glucose\'s carbon 5 leaves as carbon dioxide.' },
      { t: '[hl C1.2.12] Per glucose, 6 carbon dioxide molecules are released, as many as glucose has carbon atoms: 2 in the link reaction and 4 in the Krebs cycle.\n[x] The cycle releases carbon atoms that entered in earlier turns: glucose\'s carbons 1, 2 and 6 are still in oxaloacetate, and leave as carbon dioxide in later turns.\n[hl C1.2.13] Most of the energy of glucose is not in ATP yet: it is carried by the electrons of NADH (and FADH₂) (chapter 6).' }
    ]
  },
  {
    id: 'c6', n: '6', title: 'The electron transport chain and ATP synthase', short: 'Electron transport chain', mod: 'ch6', where: 'inner',
    steps: [
      { t: '[hl C1.2.14] This is the inner membrane at its true size, with the proteins of the electron transport chain and ATP synthase, each in its measured shape. Above is the intermembrane space; below, the matrix.\n[x] You do not need the names of the protein complexes (I, II, III and IV) for the IB. They are named here so that you can follow the electrons.' },
      { t: '[hl C1.2.13] NADH gives a pair of electrons to the first carrier of the chain. NADH is oxidized back to NAD, which returns to the Krebs cycle.\n[x] The first carrier is in complex I. The electrons pass along eight carriers inside it (a flavin, then iron–sulfur clusters), each where the measured structure puts it, to ubiquinone, a small carrier in the membrane.' },
      { t: '[hl C1.2.14] The electrons release energy as they pass from carrier to carrier. The first complex uses it to pump protons (hydrogen ions, H⁺) from the matrix into the intermembrane space.\n[x] Complex I pumps four protons for each pair of electrons.' },
      { t: '[x] FADH₂ is part of complex II, so its electrons enter the chain here, after complex I, and go to ubiquinone. Complex II pumps no protons, so fewer ATP are made from FADH₂ than from NADH.' },
      { t: '[hl C1.2.14] A small carrier in the membrane takes the electrons to the next complex, which pumps more protons. That complex passes the electrons to a small protein in the intermembrane space.\n[x] The carrier is ubiquinone: with the two electrons it takes two protons from the matrix (ubiquinol, QH₂) and moves within the membrane to complex III. Complex III passes the electrons, one at a time, to cytochrome c, which carries one electron. Four protons for each pair of electrons (the Q cycle: one electron of each pair first returns to a ubiquinone; this picture shows where the electrons end).' },
      { t: '[hl C1.2.16] At the end of the chain, oxygen is the terminal electron acceptor. An oxygen molecule waits at the last complex for electrons.\n[x] Cytochrome c carries one electron at a time to complex IV: each cytochrome c here carries one. An oxygen molecule needs 4 electrons, so it waits for the electrons of a second NADH.' },
      { t: '[hl C1.2.16] With 4 electrons, and 4 protons from the matrix, oxygen becomes 2 water molecules (metabolic water). This keeps the electrons flowing along the chain.\n[hl C1.2.14] The last complex pumps protons too.\n[x] Two more cytochrome c molecules bring the electrons of a second NADH. The water leaves into the matrix.' },
      { t: '[hl C1.2.14] The protons collect in the intermembrane space: a <dfn data-w="proton-gradient">proton gradient</dfn>. The phospholipid bilayer is a barrier to ions, so almost none can diffuse back, like water held high behind a dam.\n[hl B2.2.4] The intermembrane space is small, so its concentration of protons rises quickly.\n[x] Each pink dot stands for protons: a real space this small holds far fewer free protons at one moment. What matters is the difference in concentration.\n[x] The matrix becomes about 0.8 pH units more alkaline, and the membrane carries an electrical potential of about 0.15–0.18 V.' },
      { t: '[hl C1.2.15] <dfn data-w="chemiosmosis">Chemiosmosis</dfn>: protons flow back into the matrix through ATP synthase, down their gradient of concentration (and of charge). Their flow turns its ring and stalk, and the head uses the energy to join ADP and phosphate: ATP. This is <dfn data-w="oxidative-phosphorylation">oxidative phosphorylation</dfn>.\n[x] In human ATP synthase, 8 protons turn the ring once, and one turn makes 3 ATP.' },
      { t: '[x] ATP leaves the matrix through a transporter in the inner membrane that exchanges one ATP out for one ADP in: the ATP–ADP exchanger. It opens to one side at a time: it takes ADP in from the intermembrane space, changes shape and releases it into the matrix; then it carries ATP out the same way. Only its shape open to the intermembrane space is measured; its change of shape is not drawn. Phosphate enters with a proton, through a carrier of its own.' },
      { t: '[sl C1.2.2] ATP gives energy to the jobs of the cell: muscle contraction, active transport across membranes, and the synthesis of macromolecules (anabolism), such as proteins and DNA.\n[sl C1.2.3] Hydrolysis of ATP to ADP and phosphate releases the energy. ADP returns, to be phosphorylated to ATP again.\n[x] ATP leaves the mitochondrion through porin.' },
      { t: '[hl C1.2.13] Reduced NAD from glycolysis, the link reaction and the Krebs cycle gives its electrons to the chain. 6 oxygen molecules accept them: 12 water molecules are produced here.\n[x] In this muscle cell, 8 NADH (2 from the link reaction, 6 from the Krebs cycle) give their electrons to complex I. The electrons of the 2 NADH from glycolysis enter by a shuttle, at FAD; with the 2 FADH₂ of the Krebs cycle, 24 electrons in all.\nNext: the tally.' }
    ]
  },
  {
    id: 'tally', n: '∑', title: 'The tally per glucose', short: 'Tally', mod: 'paper', where: 'all',
    steps: [
      { t: '[hl C1.2.8, C1.2.12] ATP made directly: glycolysis makes 4 and uses 2, and the Krebs cycle makes 2, so a net 4 ATP per glucose.\n[x] Textbooks call this substrate-level phosphorylation. Most ATP comes from the electrons: about 2.5 ATP per NADH and about 1.5 per FADH₂.\n[sl C1.2.5] Aerobic respiration yields many more ATP per glucose than anaerobic respiration, which yields only 2.\n[x] In all, about 30–32 ATP per glucose.' },
      { t: '[x] Older textbooks say 36–38 ATP. They counted whole numbers: 3 per NADH and 2 per FADH₂. Measurements later showed about 2.5 and 1.5. The total is never exact: some protons leak back through the membrane, and the gradient is also used for transport (pyruvate, phosphate, ATP out).\n[x] The 2 NADH of glycolysis give about 3 or 5 ATP: it depends on the shuttle that passes their electrons into the mitochondrion (chapter 3).' },
      { t: '[sl C1.2.5] The overall equation: glucose + oxygen → carbon dioxide + water; C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O.\n[hl C1.2.16] A common mistake: oxygen is not used to make carbon dioxide. Oxygen becomes water at the end of the electron transport chain. The carbon of carbon dioxide comes from glucose, in the link reaction and the Krebs cycle.\n[x] Complex IV makes 12 water molecules per glucose. Other steps use some water, so the overall equation shows 6, the net result.' }
    ]
  },
  {
    id: 'test', n: '?', title: 'Test yourself', short: 'Test yourself', mod: 'paper', where: 'all',
    steps: [
      { t: 'Question 1. Answer it on the picture, then press Check.' },
      { t: 'Question 2. Put the steps of the explanation in order, then press Check.' },
      { t: 'When both questions are answered, Read more opens: the whole story in one article.' }
    ]
  },
  {
    id: 'read', n: '≡', title: 'Read more', short: 'Read more', mod: 'paper', where: 'all',
    steps: [
      { t: 'The whole journey of one glucose molecule, in one article. Press a word to see its meaning.' }
    ]
  }
];

/* the Explore paths: one molecule each (or an idea), opened from a step, then back to it */
export const EXPLORE = {
  'x-nad': { title: 'Explore: what is NAD?', mod: 'xmol', mol: ['nad', 'nadh'], steps: [
    { t: '[hl C1.2.7] NAD (nicotinamide adenine dinucleotide) is a coenzyme: a small molecule that an enzyme needs. It carries hydrogen from one reaction to another.\n[x] It is made of two nucleotides joined by their phosphate groups: one with the base adenine, one with nicotinamide.' },
    { t: '[x] Nicotinamide is the part that carries the hydrogen. Your cells make it from niacin, vitamin B3 (and from the amino acid tryptophan). Without enough niacin (or tryptophan) in your food, you cannot make enough NAD.' },
    { t: '[hl C1.2.7] NAD is reduced when it accepts hydrogen: NAD⁺ + 2H → NADH + H⁺. Two hydrogen atoms (two protons and two electrons) are removed from the substrate. The ring of NAD⁺ accepts one proton and both electrons; the other proton is released into the solution (H⁺).\n[x] The IB guide writes NAD and reduced NAD; textbooks also write NAD⁺ and NADH.' },
    { t: '[hl C1.2.13] NADH gives its two electrons to the electron transport chain and becomes NAD⁺ again. It is recycled: the same NAD molecule carries hydrogen again and again.' }
  ] },
  'x-redox': { title: 'Explore: oxidation and reduction', mod: 'xmol', mol: ['g3p', 'nad'], steps: [
    { t: '[hl C1.2.7] Oxidation is the loss of electrons. When hydrogen (a proton with its electron) is removed from a molecule, the molecule loses electrons: it is oxidized. Removing hydrogen is dehydrogenation.' },
    { t: '[hl C1.2.7] Reduction is the gain of electrons: the molecule that accepts the hydrogen (here NAD) is reduced.\n[hl C1.2.7] The two always happen together: a redox reaction.' },
    { t: '[x] In respiration, glucose is oxidized step by step, and NAD and FAD carry the hydrogen (its electrons) to the electron transport chain. At the end, oxygen is reduced to water.' }
  ] },
  'x-coa': { title: 'Explore: what is coenzyme A?', mod: 'xmol', mol: ['coa', 'acetylcoa'], steps: [
    { t: '[hl C1.2.11] Coenzyme A (CoA) is a carrier molecule. It carries acetyl groups (2C), from the link reaction and from the breakdown of fatty acids, to the Krebs cycle.' },
    { t: '[x] Its working end is a sulfur atom (yellow). The acetyl group joins it by a thioester bond: when this bond is hydrolysed, much energy is released.\n[x] Most of the rest of it is made from pantothenic acid, vitamin B5, joined to part of the amino acid cysteine and to an ADP with one more phosphate group.' },
    { t: '[x] Coenzyme A is released in the first step of the Krebs cycle, and carries the next acetyl group: it is recycled.' }
  ] },
  'x-fad': { title: 'Explore: what is FAD?', mod: 'xmol', mol: ['fad', 'fadh2'], steps: [
    { t: '[x] FAD (flavin adenine dinucleotide) is a coenzyme that carries hydrogen, like NAD. The IB guide does not name it: it counts four oxidations in the Krebs cycle, and this is the one that does not use NAD.' },
    { t: '[x] Its working part is the flavin ring, made from riboflavin, vitamin B2. It accepts two hydrogen atoms, on two of its nitrogen atoms: FADH₂ (reduced FAD).' },
    { t: '[x] In the Krebs cycle, FAD is bound inside complex II, in the inner membrane. FADH₂ passes its electrons to ubiquinone without leaving the enzyme. They enter the chain after complex I, so fewer protons are pumped: about 1.5 ATP per FADH₂, compared with about 2.5 per NADH.' }
  ] },
  'x-slp': { title: 'Explore: two ways to make ATP', mod: 'xmol', mol: ['atp'], steps: [
    { t: '[sl C1.2.1] ATP is adenosine triphosphate, a nucleotide: the base adenine, the sugar ribose and three phosphate groups.\n[hl C1.2.8] ATP formation in glycolysis: an enzyme passes a phosphate group from a substrate molecule straight to ADP.\n[x] Textbooks call this substrate-level phosphorylation. Glycolysis makes 4 ATP this way (and uses 2), and the Krebs cycle 2 per glucose.' },
    { t: '[hl C1.2.15] Oxidative phosphorylation: ATP synthase in the inner membrane of the mitochondrion joins ADP and phosphate, using the energy of protons flowing back through it (chemiosmosis). Most ATP is made this way: about 26 to 28 per glucose (chapter 6).' },
    { t: '[sl C1.2.3] Either way, energy is needed to make ATP from ADP and phosphate. The hydrolysis of ATP to ADP and phosphate releases that energy for the cell\'s jobs.' }
  ] }
};

/* the two questions of Daniel's text, and his article (his words, made plain for pupils who read English as a second
   language, and corrected where the biology needed it: which phosphate traps glucose, and that the Krebs cycle releases
   as many carbon atoms as glucose had, not glucose's own atoms in the same turn) */
export const TEST = {
  q1: { ask: 'Glycolysis makes ATP without any membrane or gradient. How? Name the process.',
    accept: ['substratelevelphosphorylation', 'substratephosphorylation', 'substratelevel'],
    model: 'Substrate-level phosphorylation: an enzyme passes a phosphate group from a substrate molecule (1,3-bisphosphoglycerate, then phosphoenolpyruvate) straight to ADP. No membrane and no proton gradient are needed.' },
  q2: { ask: 'Why does a shortage of oxygen soon stop the Krebs cycle, although no step of the Krebs cycle uses oxygen?',
    order: ['Without oxygen, there is no terminal electron acceptor at complex IV.', 'So electrons cannot flow along the electron transport chain.',
      'So NADH and FADH₂ cannot give their electrons to the chain: they are not oxidized back to NAD and FAD.', 'Soon all the NAD and FAD are reduced: none is left to accept hydrogen.',
      'The oxidations (dehydrogenations) of the Krebs cycle need NAD and FAD, so the cycle stops.'],
    model: 'Oxygen is the terminal electron acceptor. Without it, the chain stops, NADH and FADH₂ are not oxidized, and the supply of NAD and FAD ends. The four oxidations of the Krebs cycle need NAD and FAD, so the cycle stops, though no step of it uses oxygen.' }
};

export const ARTICLE = `
<h3>From glucose to ATP</h3>
<p>This article follows one glucose molecule from your blood to the ATP made with the energy released from it. The tags show what the IB guide asks: <span class="lv lv--sl">SL and HL</span>, <span class="lv lv--hl">HL only</span>, or <span class="lv lv--x">Beyond the IB guide</span>.</p>
<h4>1. Getting into the cell</h4>
<p><span class="lv lv--sl">SL and HL <i>B2.1.2, B2.1.8</i></span> Starch in food is digested to glucose, which is absorbed into the blood. Glucose is polar, so almost none crosses the phospholipid bilayer by itself. At a muscle cell, glucose enters by <dfn data-w="facilitated-diffusion">facilitated diffusion</dfn> through glucose transporters. This is passive: it needs no ATP. <span class="lv lv--x">Beyond the IB guide</span> In muscle cells the transporter is GLUT4.</p>
<p><span class="lv lv--sl">SL and HL <i>B2.1.3</i></span> Oxygen arrives separately: haemoglobin in red blood cells carries it from the lungs, and it diffuses into the cell between the phospholipids. <span class="lv lv--hl">HL only <i>C1.2.16</i></span> It is not used until the very last step.</p>
<p><span class="lv lv--hl">HL only <i>C1.2.8</i></span> Inside the cell, an enzyme at once adds a phosphate group from ATP to carbon 6 of glucose. The product is charged, so it cannot leave through the transporter: glucose is trapped in the cell. <span class="lv lv--x">Beyond the IB guide</span> The enzyme is hexokinase; the product, glucose 6-phosphate.</p>
<h4>2. Glycolysis (cytosol, no oxygen needed)</h4>
<p><span class="lv lv--sl">SL and HL <i>C1.2.5</i></span> The first reactions of respiration happen in the cytosol and need no oxygen. <span class="lv lv--hl">HL only <i>C1.2.8</i></span> They are glycolysis ("sugar splitting"): four stages, each step catalysed by a different enzyme.</p>
<p><span class="lv lv--hl">HL only <i>C1.2.8</i></span> <b>Phosphorylation.</b> Two ATP give two phosphate groups to the sugar: the first traps it, the second (after the ring is rearranged) puts one at each end. The sugar is now less stable, ready to split. Two ATP are an investment, to make more ATP later. <span class="lv lv--x">Beyond the IB guide</span> The products are glucose 6-phosphate, fructose 6-phosphate, then fructose 1,6-bisphosphate.</p>
<p><span class="lv lv--hl">HL only <i>C1.2.8</i></span> <b>Lysis.</b> The 6-carbon sugar splits into two 3-carbon sugars, triose phosphates. From the next stage on, everything happens twice for each glucose.</p>
<p><span class="lv lv--hl">HL only <i>C1.2.7, C1.2.8</i></span> <b>Oxidation.</b> Hydrogen is removed from each triose phosphate and accepted by NAD, which is reduced to NADH: 2 NADH per glucose. The energy released lets a second phosphate group, from a phosphate ion, attach. <span class="lv lv--x">Beyond the IB guide</span> The product is 1,3-bisphosphoglycerate.</p>
<p><span class="lv lv--hl">HL only <i>C1.2.8</i></span> <b>ATP formation.</b> Each 3-carbon molecule passes its two phosphate groups to ADP: 4 ATP. The enzyme passes each phosphate group straight across: no membrane or gradient is involved. The product is pyruvate (3C). <span class="lv lv--x">Beyond the IB guide</span> Textbooks call this <dfn data-w="substrate-level-phosphorylation">substrate-level phosphorylation</dfn>.</p>
<p><span class="lv lv--hl">HL only <i>C1.2.8</i></span> <b>Net yield per glucose:</b> 2 pyruvate, 2 NADH, 4 − 2 = 2 ATP.</p>
<p><span class="lv lv--hl">HL only <i>C1.2.9, C1.2.10</i></span> <b>What if there is no oxygen?</b> The electron transport chain stops, NADH cannot give its electrons to it, and soon no NAD is left. Glycolysis needs NAD for its oxidation step, so it would stop too. So the hydrogen of NADH is given to pyruvate. Humans: pyruvate + NADH → lactate + NAD. Yeast: pyruvate → ethanol + carbon dioxide, and NAD is regenerated. This makes no extra ATP: it regenerates NAD, so that glycolysis can keep making its 2 ATP. <span class="lv lv--sl">SL and HL <i>C1.2.5</i></span> This is anaerobic respiration.</p>
<h4>3. Into the mitochondrion</h4>
<p><span class="lv lv--sl">SL and HL <i>C1.2.5, B2.1.6</i></span> With oxygen present, respiration continues in the mitochondrion. Pyruvate crosses its outer membrane through a channel protein, then its inner membrane through a carrier protein, into the matrix. <span class="lv lv--x">Beyond the IB guide</span> The channel protein is porin; the carrier, the mitochondrial pyruvate carrier. The 2 NADH from glycolysis cannot cross the inner membrane: only their electrons enter, passed by shuttle systems. In skeletal muscle much of it goes to FAD, not NAD: one reason why ATP totals differ between textbooks.</p>
<h4>4. The link reaction (matrix)</h4>
<p><span class="lv lv--hl">HL only <i>C1.2.11</i></span> Each pyruvate (3C) changes in three ways: <b>decarboxylation</b> (one carbon atom is removed as carbon dioxide: the first carbon dioxide you exhale), <b>oxidation</b> (hydrogen is removed and NAD becomes NADH), and the remaining <b>acetyl group</b> (2C) is attached to coenzyme A: acetyl CoA. Per glucose (×2): 2 carbon dioxide, 2 NADH, 2 acetyl CoA. No ATP.</p>
<h4>5. The Krebs cycle (matrix)</h4>
<p><span class="lv lv--hl">HL only <i>C1.2.12</i></span> Coenzyme A delivers the acetyl group and is released, to be used again. In one turn: acetyl (2C) + oxaloacetate (4C) → citrate (6C); citrate is decarboxylated and oxidized (a 5C compound, carbon dioxide and NADH); the 5C compound is decarboxylated and oxidized again (a 4C compound, carbon dioxide and NADH); the 4C compound is changed back to oxaloacetate in several steps, with one ATP and two more oxidations. Oxaloacetate can accept the next acetyl group. <span class="lv lv--x">Beyond the IB guide</span> One of the last two oxidations reduces FAD, not NAD: FADH₂.</p>
<p><span class="lv lv--hl">HL only <i>C1.2.12</i></span> Per turn: 2 carbon dioxide, 3 NADH, 1 ATP (and 1 FADH₂). Per glucose (2 turns): 4 carbon dioxide, 6 NADH, 2 ATP (and 2 FADH₂). So per glucose, 6 carbon dioxide molecules are released (2 in the link reaction, 4 in the Krebs cycle): as many carbon atoms as glucose had. <span class="lv lv--x">Beyond the IB guide</span> The cycle releases carbon atoms that entered in earlier turns; glucose's own carbons leave over the next turns. <span class="lv lv--hl">HL only <i>C1.2.13</i></span> Most of glucose's energy is not in ATP yet: it is carried by the electrons of NADH (and FADH₂).</p>
<h4>6. The electron transport chain and ATP synthase (inner membrane)</h4>
<p><span class="lv lv--hl">HL only <i>C1.2.13, C1.2.14</i></span> NADH gives its electrons to the electron transport chain. Electrons pass from carrier to carrier, releasing energy, and protein complexes of the chain use it to pump protons from the matrix into the intermembrane space. <span class="lv lv--x">Beyond the IB guide</span> In this muscle cell, 8 NADH (2 from the link reaction, 6 from the Krebs cycle) give their electrons to complex I; the electrons of the 2 NADH from glycolysis enter by a shuttle, at FAD. The 2 FADH₂ pass theirs in at complex II, after complex I. Complexes I, III and IV pump the protons.</p>
<p><span class="lv lv--hl">HL only <i>C1.2.14, C1.2.15</i></span> The protons collect in the small intermembrane space, and the phospholipid bilayer of the inner membrane lets almost none diffuse back. They flow back through ATP synthase (chemiosmosis), which turns and joins ADP and phosphate: ATP. This is oxidative phosphorylation.</p>
<p><span class="lv lv--hl">HL only <i>C1.2.16</i></span> At the end of the chain, the electrons combine with oxygen and protons to form water: oxygen is the terminal electron acceptor. This is the only step of respiration that uses oxygen. <span class="lv lv--x">Beyond the IB guide</span> This happens at complex IV. New ATP leaves the matrix through a transporter that exchanges one ATP out for one ADP in. <span class="lv lv--sl">SL and HL <i>C1.2.2</i></span> ATP is then used all over the cell: muscle contraction, active transport, protein synthesis.</p>
<h4>The tally per glucose</h4>
<p><span class="lv lv--sl">SL and HL <i>C1.2.5</i></span> Aerobic respiration yields far more ATP per glucose than anaerobic respiration. <span class="lv lv--x">Beyond the IB guide</span> The numbers below are measured values, not part of the IB guide.</p>
<table class="ibv__t"><thead><tr><th>Source</th><th>Net ATP made directly</th><th>Carriers</th><th>ATP from the carriers (about 2.5 per NADH, 1.5 per FADH₂)</th></tr></thead>
<tbody><tr><td data-h="Source">Glycolysis</td><td data-h="Net ATP made directly">2</td><td data-h="Carriers">2 NADH</td><td data-h="ATP from the carriers">about 3 in this muscle cell (5 by the other shuttle)</td></tr><tr><td data-h="Source">Link reaction</td><td data-h="Net ATP made directly">0</td><td data-h="Carriers">2 NADH</td><td data-h="ATP from the carriers">about 5</td></tr><tr><td data-h="Source">Krebs cycle</td><td data-h="Net ATP made directly">2</td><td data-h="Carriers">6 NADH, 2 FADH₂</td><td data-h="ATP from the carriers">about 15 + 3</td></tr><tr class="tot"><th data-h="">Total</th><th data-h="Net ATP made directly">4</th><th data-h=""></th><th data-h="In all">about 30 in this muscle cell (32 by the other shuttle)</th></tr></tbody></table>
<p><span class="lv lv--x">Beyond the IB guide</span> Older textbooks say 36–38: that figure assumed whole numbers (3 per NADH, 2 per FADH₂), since measured as lower. The number is never exact, because some protons leak back and some of the gradient is used for transport.</p>
<p><span class="lv lv--sl">SL and HL <i>C1.2.5</i></span> <b>Overall equation:</b> C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O.</p>
<p><span class="lv lv--hl">HL only <i>C1.2.16</i></span> <b>A common mistake:</b> oxygen is not used to make carbon dioxide. Oxygen becomes water at the end of the electron transport chain. The carbon of carbon dioxide comes from glucose, in the link reaction and the Krebs cycle.</p>
<p class="ibv__src">Text: Dr Daniel Mompel Riera (5 Nov 2026), written in plain English for this page. Checked against the IB Biology guide (C1.2), and against Berg, Tymoczko and Stryer, Biochemistry (2019).</p>`;
