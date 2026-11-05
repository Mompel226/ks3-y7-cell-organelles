/* ============================================================
   ks3-glossary.js — the ONE list of KS3 science words: each word once, with Korean, Chinese and ONE definition at Key
   Stage 3 level (Daniel, 15 Oct 2026: "create a kind of a document that contains all of those definitions. So if I need
   to provide those definitions in a later lab … it uses that as reference, and we are not recreating multiple
   definitions of the same words over and over again").
   - Where Daniel's Year 7 lessons already define a word, his words are used (src: 'Y7 L2'; his slides
     KS3/KS3 Lessons/Y7/2.Chemistry/L2.Atoms-Compounds/1.Atoms_elements_compounds.pptx), corrected only where a slide is
     not accurate (particle: an element is a substance, not a particle).
   - Particles follow the model the pupils draw (memory particle-model-in-diagrams).
   - A word of another entry inside a definition becomes a link to that entry (the page and tools/ks3-glossary.mjs share
     the rule in forms() below); link: false keeps a word with two meanings from linking ("separate" particles).
   NEVER edit a page's copy (js/glossary.js): edit this file, then run node tools/practicals-sync.mjs (it copies it into
   every KS3 practical) and node tools/ks3-glossary.mjs (it checks the list and writes KS3-GLOSSARY.md, the readable copy).
   ko: the word used in Korean school science; zh: Simplified Chinese as in mainland school chemistry.
   25 Oct 2026: 38 words added for the Year 7 Chemistry revision page (atoms, elements, states and changes, suspensions,
   concentration, variables), from Daniel's knowledge organisers KO_Atoms and KO_States of Matter and his Year 7 syllabus;
   Korean and Chinese checked by an independent reviewer the same day. Later that day: conduct, ratio and recover added, and
   phrasal verbs taken out of the definitions ("takes up", "broken down", "turns into", "stays behind"), as on the page.
   4 Nov 2026: 40 words for the Year 7 cell game (practicals/ks3-y7-cell-organelles), group "Cells and proteins", from
   Daniel's Y7 Cells slides (1.Plant-and-Animal-Cells: organelle = a membrane-bound structure with a specific function, so
   ribosomes, the nucleolus, vesicles and microtubules are not organelles), his KO_Cells and Organisation (cell, nucleus,
   mitochondria, cell membrane), The Cell.pdf (cytoplasm = the cytosol and the organelles, not the nucleus) and his
   enzymes and food-test slides (src: 'Y7 Cells'). "nucleus" now has both meanings, the cell's and the atom's (the
   checker allows each word once); "protein" gained what a protein is, keeping its food sentence.
   4 Nov 2026, evening: diffusion, for the cell game's way in (oxygen and carbon dioxide pass straight through the two
   layers of lipids; Korean 확산 and Chinese 扩散, the school science words).
   Later that evening (Daniel: "when you mentioned for the first time lipids or proteins … say it's a molecule with the
   elements … and its specific organization"): protein, lipid and the new carbohydrate say which elements they are made of
   and that the arrangement makes them what they are; plasma, tissue fluid, RNA and base (in DNA) added for the way in and
   the nucleus's Explorer film (Korean and Chinese: the school science words). Then nucleotide and histone, for the film's zoom from a
   chromosome to its bases (Daniel's Year 9 slides on biological molecules), and base (in DNA) says what A, T, C and G
   stand for.
   5 Nov 2026: hydrogen bond says what it does in DNA too (the bases of the two strands held in pairs), for the film's
   hydrogen bonds (Daniel: "make sure that there is a hydrogen bonds shown").
   5 Nov 2026, later: ten words for the cell game's mitochondria, drawn at their true sizes, and its Explorer film inside a
   mitochondrion (cristae, matrix, intermembrane space, channel protein, ATP, ATP synthase, electron transport chain,
   hydrogen ion, micrometre, nanometre; Daniel: the space between the two membranes is the intermembrane space, explained
   as such); carrier protein now says "a membrane", since the inner membrane of a mitochondrion has them too.
   5 Nov 2026, evening: 25 words for the cell game's IB view "From glucose to ATP" (group "Respiration in detail (IB)":
   glycolysis, pyruvate, NAD and reduced NAD, FAD, coenzyme A, the link reaction, the Krebs cycle, oxidation and reduction,
   dehydrogenation, decarboxylation, both kinds of phosphorylation, chemiosmosis, facilitated diffusion, the glucose
   transporter …), in the IB guide's own terms (C1.2.7–C1.2.16; B2.1.8), plain enough for Korean EAL pupils.
   ============================================================ */
(function () {
  'use strict';
  const G = [
    { g: 'Particles and substances', w: [
      { k: 'matter',          en: 'matter',          ko: '물질',              zh: '物质',        src: 'Y7 L2', d: 'Anything that has mass and fills space.' },
      { k: 'substance',       en: 'substance',       ko: '물질',              zh: '物质',        src: 'Y7 L2', d: 'A type of matter that has specific properties and a uniform composition: it is the same all through. For example, water, salt or oxygen. Every substance is an element or a compound.' },
      { k: 'particle',        en: 'particle',        ko: '입자',              zh: '粒子',        src: 'Y7 L2', d: 'A very small piece of matter, such as an atom, a molecule or an ion. Every substance is made of particles.' },
      { k: 'atom',            en: 'atom',            ko: '원자',              zh: '原子',        src: 'Y7 L2', d: 'The smallest particle of an element. Atoms are the building blocks of all matter.' },
      { k: 'element',         en: 'element',         ko: '원소',              zh: '元素（单质）', src: 'Y7 L2', d: 'A pure substance made of only one type of atom. It cannot be split into simpler substances. Each element has a chemical symbol, such as O for oxygen.' },
      { k: 'chemical-symbol', en: 'chemical symbol', ko: '원소 기호',         zh: '元素符号',    src: 'Y7 L2', d: 'One or two letters that stand for an element, such as O for oxygen or Na for sodium.' },
      { k: 'bond',            en: 'bond',            ko: '결합',              zh: '化学键',      src: 'Y7 L2', d: 'A force that holds atoms or ions together.' },
      { k: 'molecule',        en: 'molecule',        ko: '분자',              zh: '分子',        src: 'Y7 L2', d: 'A particle made of two or more atoms joined by bonds, such as water (H₂O) or oxygen (O₂).' },
      { k: 'compound',        en: 'compound',        ko: '화합물',            zh: '化合物',      src: 'Y7 L2', d: 'A pure substance made of two or more different elements chemically joined together, always in the same ratio: its composition is fixed. Its properties are different from those of its elements. Water (H₂O) is made of molecules; salt (NaCl) is made of ions in a lattice.' },
      { k: 'ion',             en: 'ion',             ko: '이온',              zh: '离子',        src: 'Y7 L2', d: 'A particle with an electric charge, + or −. Salt is made of sodium ions (+) and chloride ions (−).' },
      { k: 'lattice',         en: 'lattice',         ko: '격자 (결정 격자)',  zh: '晶格',        src: 'Y7 L2', d: 'Particles held in a regular pattern that repeats in every direction, as in a crystal of salt or a piece of metal. A lattice has no exact number of particles: a bigger crystal has more.' },
      { k: 'state',           en: 'state of matter', ko: '물질의 상태',       zh: '物质的状态',  also: ['states of matter', 'state'], d: 'The form a substance is in: solid, liquid or gas.' },
      { k: 'solid',           en: 'solid',           ko: '고체',              zh: '固体',        d: 'A state of matter. Its particles are held close together in a regular pattern: they vibrate but stay in place.' },
      { k: 'liquid',          en: 'liquid',          ko: '액체',              zh: '液体',        d: 'A state of matter. Its particles touch and slide past each other, so it flows and takes the shape of its container.' },
      { k: 'gas',             en: 'gas',             ko: '기체',              zh: '气体',        d: 'A state of matter. Its particles are far apart and move fast in all directions; the pull between them is very weak.' },
      { k: 'hydrogen-bond',   en: 'hydrogen bond',   ko: '수소 결합',         zh: '氢键',        d: 'A weak pull between molecules, such as between a hydrogen atom of one water molecule and the oxygen atom of the next. It is much weaker than the bonds inside a molecule. In liquid water it keeps the molecules close while they slide past each other. In DNA, hydrogen bonds join the bases of its two strands in pairs.' },
      { k: 'polar',           en: 'polar',           ko: '극성 (극성을 띤)',  zh: '极性的',      d: 'Having a slightly positive end and a slightly negative end. A water molecule is polar: its oxygen end is slightly negative (δ−) and its hydrogen end is slightly positive (δ+).' }
    ]},
    { g: 'Inside atoms', w: [
      { k: 'nucleus',           en: 'nucleus',             ko: '핵 (세포) · 원자핵 (원자)', zh: '细胞核 · 原子核',  src: 'Y7 Cells', d: 'In a cell: the part that contains the genetic material (DNA) and controls the activities of the cell. In an atom: the tiny centre, which holds the protons and the neutrons.' },
      { k: 'proton',            en: 'proton',              ko: '양성자',                 zh: '质子',          d: 'A particle in the nucleus of an atom. It has a positive charge (+).' },
      { k: 'neutron',           en: 'neutron',             ko: '중성자',                 zh: '中子',          d: 'A particle in the nucleus of an atom. It has no charge: it is neutral.' },
      { k: 'electron',          en: 'electron',            ko: '전자',                  zh: '电子',          d: 'A very small particle that moves around the nucleus of an atom. It has a negative charge (−).' },
      { k: 'charge',            en: 'charge',              ko: '전하',                  zh: '电荷',          d: 'An electrical property of a particle: it can be positive (+) or negative (−). Protons are positive and electrons are negative; a particle with no charge is neutral. Opposite charges attract each other. An atom has the same number of protons and electrons, so it has no overall charge.' }
    ]},
    { g: 'Elements and compounds', w: [
      { k: 'metal',             en: 'metal',               ko: '금속',                  zh: '金属',          d: 'An element that is shiny and conducts heat and electricity well, such as iron, copper and aluminium. Most metals are solid at room temperature; mercury is a liquid.' },
      { k: 'non-metal',         en: 'non-metal',           ko: '비금속',                 zh: '非金属',         d: 'An element that is not a metal, such as carbon, sulfur, oxygen and nitrogen. Most non-metals are dull and do not conduct electricity. At room temperature, some are solids, many are gases and one is a liquid.' },
      { k: 'conduct',           en: 'conduct',             ko: '전도하다',                zh: '传导（导电、导热）',  d: 'To let heat or electricity pass through easily. Metals conduct heat and electricity well.' },
      { k: 'periodic-table',    en: 'periodic table',      ko: '주기율표',                zh: '元素周期表',       d: 'A table of all the elements, in order of the number of protons in their atoms. The metals are to the left of a zigzag line and the non-metals to its right; hydrogen is a non-metal at the top left.' },
      { k: 'chemical-formula',  en: 'chemical formula',    ko: '화학식',                 zh: '化学式',        also: ['formula', 'formulae'], d: 'Symbols and small numbers that show the atoms in a substance. H₂O means two hydrogen atoms joined to one oxygen atom.' },
      { k: 'ratio',             en: 'ratio',               ko: '비율',                   zh: '比例',          d: 'How many there are of one thing for each of another. In water, H₂O, the ratio of hydrogen atoms to oxygen atoms is 2 : 1.' },
      { k: 'diatomic',          en: 'diatomic',            ko: '이원자 (두 원자로 된)',       zh: '双原子的',        d: 'Made of two atoms joined together. Hydrogen (H₂), oxygen (O₂), nitrogen (N₂) and chlorine (Cl₂) are diatomic elements: each molecule has two atoms of the same element.' }
    ]},
    { g: 'States and changes', w: [
      { k: 'energy',            en: 'energy',              ko: '에너지',                 zh: '能量',          d: 'What is needed for things to change or move. Heating gives the particles of a substance more energy, so they vibrate or move faster.' },
      { k: 'temperature',       en: 'temperature',         ko: '온도',                  zh: '温度',          d: 'How hot or cold something is, measured in degrees Celsius (°C). The higher the temperature, the faster the particles move.' },
      { k: 'room-temperature',  en: 'room temperature',    ko: '상온 (실온)',                  zh: '室温',          d: 'About 20 to 25 °C: how warm a normal classroom is.' },
      { k: 'vibrate',           en: 'vibrate',             ko: '진동하다',                zh: '振动',         also: ['vibration'], d: 'To go quickly backwards and forwards around one fixed place, without leaving it. The particles in a solid vibrate; they do not move from place to place.' },
      { k: 'compress',          en: 'compress',            ko: '압축하다',                zh: '压缩',         also: ['compressible'], d: 'To squash something into a smaller volume. You can compress a gas, because its particles are far apart; you cannot compress a solid or a liquid, because their particles already touch.' },
      { k: 'expand',            en: 'expand',              ko: '팽창하다',                zh: '膨胀',         also: ['expansion'], d: 'To get bigger: to fill more space. A substance expands when it is heated, because its particles move more and the gaps between them get bigger. The particles themselves do not get bigger.' },
      { k: 'contract',          en: 'contract',            ko: '수축하다',                zh: '收缩',         also: ['contraction'], d: 'To get smaller: to fill less space. A substance contracts when it cools, because its particles move less and the gaps between them get smaller.' },
      { k: 'melt',              en: 'melt',                ko: '녹다 (융해)',             zh: '熔化',          d: 'To change from a solid into a liquid when it is heated. This happens at its melting point.' },
      { k: 'freeze',            en: 'freeze',              ko: '얼다 (응고)',             zh: '凝固',         also: ['froze', 'frozen'], d: 'To change from a liquid into a solid when it is cooled. This happens at its freezing point.' },
      { k: 'melting-point',     en: 'melting point',       ko: '녹는점',                 zh: '熔点',          d: 'The temperature at which a solid changes into a liquid. Ice melts at 0 °C. A pure substance melts and freezes at the same temperature.' },
      { k: 'freezing-point',    en: 'freezing point',      ko: '어는점',                 zh: '凝固点',         d: 'The temperature at which a liquid changes into a solid. It is the same temperature as the melting point: water freezes at 0 °C, and ice melts at 0 °C.' },
      { k: 'sublimation',       en: 'sublimation',         ko: '승화 (고체 → 기체)',        zh: '升华',          d: 'A change of state straight from a solid into a gas, with no liquid in between. Dry ice (solid carbon dioxide) does this.' },
      { k: 'deposition',        en: 'deposition',          ko: '승화 (기체 → 고체)',        zh: '凝华',          d: 'A change of state straight from a gas into a solid, with no liquid in between. Frost forms like this on a very cold night.' },
      { k: 'physical-change',   en: 'physical change',     ko: '물리 변화',               zh: '物理变化',        d: 'A change in which no new substance forms, such as melting, dissolving or bending. It is usually reversible.' },
      { k: 'chemical-change',   en: 'chemical change',     ko: '화학 변화',               zh: '化学变化',       also: ['chemical reaction', 'chemical reactions'], d: 'A change in which a new substance forms, such as burning, rusting, or iron and sulfur making iron sulfide. It is a chemical reaction.' },
      { k: 'reversible',        en: 'reversible',          ko: '가역적인 (되돌릴 수 있는)',     zh: '可逆的',         d: 'Able to happen in the opposite direction too: ice melts into water, and the water can freeze into ice again.' },
      { k: 'precipitation',     en: 'precipitation',       ko: '강수',                  zh: '降水',          d: 'Water that falls from clouds to the ground as rain, snow or hail: one stage of the water cycle.' },
      { k: 'mass',              en: 'mass',                ko: '질량',                  zh: '质量',          d: 'How much matter something has, measured in grams (g) or kilograms (kg).' },
      { k: 'volume',            en: 'volume',              ko: '부피',                  zh: '体积',          d: 'How much space something fills, measured in cm³ (cubic centimetres) or litres.' }
    ]},
    { g: 'Mixtures', w: [
      { k: 'mixture',         en: 'mixture',         ko: '혼합물',            zh: '混合物',      d: 'Two or more different substances that are not chemically joined together. Its composition can vary: you can change how much of each substance it has. Each substance keeps its own properties, so you can separate them by physical methods.' },
      { k: 'pure',            en: 'pure substance',  ko: '순물질',            zh: '纯净物',      d: 'Only one substance, with no other substance mixed with it: one element or one compound. It has a sharp melting point: it melts at one exact temperature.' },
      { k: 'solution',        en: 'solution',        ko: '용액',              zh: '溶液',        d: 'A mixture made when a solute dissolves in a solvent. It has a uniform composition: it is the same all through, with only one phase (it is homogeneous).' },
      { k: 'solute',          en: 'solute',          ko: '용질',              zh: '溶质',        d: 'The substance that is dissolved: it dissolves in a solvent.' },
      { k: 'solvent',         en: 'solvent',         ko: '용매',              zh: '溶剂',        d: 'The substance that does the dissolving: the liquid that a solute dissolves in, such as water.' },
      { k: 'dissolve',        en: 'dissolve',        ko: '용해되다 (녹다)',    zh: '溶解',        d: 'To separate into particles that spread between the particles of a solvent, so you can no longer see the solid.' },
      { k: 'soluble',         en: 'soluble',         ko: '녹는 (가용성)',      zh: '可溶的',      d: 'Able to dissolve in a solvent.' },
      { k: 'insoluble',       en: 'insoluble',       ko: '녹지 않는 (불용성)', zh: '不溶的',      d: 'Not able to dissolve in a solvent.' },
      { k: 'saturated',       en: 'saturated solution', ko: '포화 용액',      zh: '饱和溶液',    also: ['saturated'], d: 'A solution in which no more solute can dissolve at that temperature.' },
      { k: 'phase',           en: 'phase',           ko: '상',                zh: '相',          d: 'One part of a mixture that looks the same all through, such as the sand or the water in muddy water.' },
      { k: 'homogeneous',     en: 'homogeneous',     ko: '균일한',            zh: '均一的',      d: 'Having a uniform composition and the same properties all through: you see only one phase, as in salt water, air or brass.' },
      { k: 'heterogeneous',   en: 'heterogeneous',   ko: '불균일한',          zh: '不均一的',    d: 'Not having a uniform composition: its properties are not the same all through. You can often see more than one phase, as in oil and water.' },
      { k: 'mechanical',      en: 'mechanical mixture', ko: '불균일 혼합물',  zh: '不均一混合物', d: 'A heterogeneous mixture: you can see more than one phase, such as sand in water.' },
      { k: 'miscible',        en: 'miscible',        ko: '서로 섞이는',       zh: '互溶的',      d: 'Able to mix completely and make one liquid, such as ethanol and water.' },
      { k: 'immiscible',      en: 'immiscible',      ko: '서로 섞이지 않는',  zh: '不互溶的',    d: 'Not able to mix: the liquids form layers, such as oil and water.' },
      { k: 'alloy',           en: 'alloy',           ko: '합금',              zh: '合金',        d: 'A mixture of a metal with other elements, such as brass (copper and zinc). It has a uniform composition: it is the same all through (it is homogeneous).' },
      { k: 'colloid',         en: 'colloid',         ko: '콜로이드',          zh: '胶体',        d: 'A heterogeneous mixture in which very small pieces of an insoluble substance are spread through another substance. The pieces are bigger than the particles in a solution and smaller than those in a suspension: they do not settle, they are too small to see, and they scatter light (the Tyndall effect). Milk is a colloid.' },
      { k: 'droplet',         en: 'droplet',         ko: '작은 방울',         zh: '小液滴',      d: 'A very small drop of a liquid.' },
      { k: 'fat',             en: 'fat',             ko: '지방',              zh: '脂肪',        d: 'An oily substance in food, such as butter or olive oil. Milk has tiny droplets of fat.' },
      { k: 'protein',         en: 'protein',         ko: '단백질',            zh: '蛋白质',      src: 'Y7 Cells', d: 'A large molecule made of the elements carbon, hydrogen, oxygen and nitrogen, arranged in a particular way: amino acids joined in a chain. Cells make proteins on their ribosomes, and every enzyme is a protein. In food, egg white, meat and milk contain protein, which the body uses to grow and repair itself.' },
      { k: 'tyndall',         en: 'Tyndall effect',  ko: '틴들 현상',         zh: '丁达尔效应',  d: 'A beam of light shows as it passes through a colloid, because its tiny droplets or pieces scatter the light.' },
      { k: 'suspension',        en: 'suspension',          ko: '현탁액',                 zh: '悬浊液',         d: 'A mixture with small pieces of an insoluble solid spread through a liquid, such as chalk powder stirred into water. It is cloudy, and the pieces settle to the bottom when you leave it to stand (keep it still, with no stirring).' },
      { k: 'concentration',     en: 'concentration',       ko: '농도',                  zh: '浓度',          d: 'The mass of solute dissolved in a certain volume of solution, for example 5 g in 100 cm³.' },
      { k: 'concentrated',      en: 'concentrated',        ko: '진한 (농도가 높은)',         zh: '浓的',          d: 'Having a large mass of solute dissolved in a small volume: many solute particles in each part of the solution.' },
      { k: 'dilute',            en: 'dilute',              ko: '묽은 (농도가 낮은)',         zh: '稀的',          d: 'Having only a small mass of solute dissolved in a large volume: few solute particles in each part of the solution. Adding more solvent makes a solution more dilute.' },
      { k: 'transparent',       en: 'transparent',         ko: '투명한',                 zh: '透明的',         d: 'See-through: light passes through it. A solution is transparent, even when it has a colour.' }
    ]},
    { g: 'Separation methods', w: [
      { k: 'recover',         en: 'recover',         ko: '회수하다 (되찾다)',  zh: '回收',        d: 'To collect a substance again from a mixture, separate from the other substances.' },
      { k: 'filtration',      en: 'filtration',      ko: '거르기 (여과)',     zh: '过滤',        d: 'Separating an insoluble solid from a liquid with filter paper. The solid stays on the paper; the liquid passes through.' },
      { k: 'evaporation',     en: 'evaporation',     ko: '증발',              zh: '蒸发',        d: 'Heating a solution so the solvent changes to a gas and leaves; the dissolved solid remains.' },
      { k: 'crystallisation', en: 'crystallisation', ko: '결정화',            zh: '结晶',        d: 'Making crystals of a dissolved solid: heat the solution until it is saturated, then leave it to cool.' },
      { k: 'distillation',    en: 'simple distillation', ko: '단순 증류',     zh: '蒸馏',        also: ['distillation'], d: 'Boiling a solution and cooling the vapour in a condenser, to collect the pure solvent.' },
      { k: 'fractional',      en: 'fractional distillation', ko: '분별 증류', zh: '分馏',        d: 'Separating miscible liquids with different boiling points. A fractionating column above the flask lets the liquid with the lowest boiling point reach the condenser first.' },
      { k: 'chromatography',  en: 'chromatography',  ko: '크로마토그래피',    zh: '色谱法（层析法）', d: 'Separating the dissolved substances in a mixture, such as the dyes in an ink, as a solvent moves up paper.' },
      { k: 'decanting',       en: 'decanting',       ko: '기울여 따르기',     zh: '倾析',        d: 'Pouring the top liquid slowly into another container, leaving the solid or the lower liquid behind.' },
      { k: 'funnel-sep',      en: 'separating funnel', ko: '분별 깔때기',     zh: '分液漏斗',    d: 'Glassware with a tap at the bottom, for separating immiscible liquids.' },
      { k: 'sieve',           en: 'sieve',           ko: '체',                zh: '筛子',        d: 'A mesh that lets small pieces fall through and keeps big pieces.' },
      { k: 'magnet',          en: 'magnet',          ko: '자석',              zh: '磁铁',        d: 'An object that attracts iron, steel, nickel and cobalt.' }
    ]},
    { g: 'Apparatus', w: [
      { k: 'filter-paper',    en: 'filter paper',    ko: '거름종이',          zh: '滤纸',        d: 'Paper with tiny holes. A liquid passes through; bigger solid pieces stay on it.' },
      { k: 'funnel',          en: 'funnel',          ko: '깔때기',            zh: '漏斗',        d: 'A cone of glass or plastic that guides a liquid into a narrow opening.' },
      { k: 'beaker',          en: 'beaker',          ko: '비커',              zh: '烧杯',        d: 'A glass container with straight sides and a lip for pouring.' },
      { k: 'flask',           en: 'round-bottomed flask', ko: '둥근바닥 플라스크', zh: '圆底烧瓶', d: 'A glass flask with a round bottom and a narrow neck, heated evenly in distillation.' },
      { k: 'conical-flask',   en: 'conical flask',   ko: '삼각 플라스크',     zh: '锥形瓶',      d: 'A glass flask shaped like a cone, with a narrow neck.' },
      { k: 'basin',           en: 'evaporating basin', ko: '증발 접시',       zh: '蒸发皿',      d: 'A shallow dish that can be heated, for evaporating a liquid.' },
      { k: 'bunsen',          en: 'Bunsen burner',   ko: '분젠 버너',         zh: '本生灯',      d: 'A gas burner that heats things in the laboratory.' },
      { k: 'glass-rod',       en: 'glass rod',       ko: '유리 막대',         zh: '玻璃棒',      d: 'A thin glass stick, for stirring or for guiding a liquid as you pour.' },
      { k: 'condenser',       en: 'condenser',       ko: '냉각기',            zh: '冷凝管',      d: 'A glass tube cooled by cold water around it. It turns a vapour back into a liquid.' },
      { k: 'thermometer',     en: 'thermometer',     ko: '온도계',            zh: '温度计',      d: 'An instrument that measures temperature.' }
    ]},
    { g: 'Results', w: [
      { k: 'residue',         en: 'residue',         ko: '거르고 남은 것 (잔류물)', zh: '滤渣',   d: 'The solid left on the filter paper.' },
      { k: 'filtrate',        en: 'filtrate',        ko: '거른 액체 (여과액)', zh: '滤液',       d: 'The liquid that passes through the filter paper.' },
      { k: 'crystal',         en: 'crystal',         ko: '결정',              zh: '晶体',        d: 'A solid with flat faces and straight edges. Its particles are held in a lattice.' },
      { k: 'distillate',      en: 'distillate',      ko: '증류액',            zh: '馏出液',      d: 'The pure liquid collected after distillation.' },
      { k: 'vapour',          en: 'vapour',          ko: '증기',              zh: '蒸气',        d: 'The gas of a substance that is usually a liquid at room temperature. Steam is water vapour.' },
      { k: 'chromatogram',    en: 'chromatogram',    ko: '크로마토그램',      zh: '色谱图',      d: 'The pattern of spots on the paper after chromatography.' },
      { k: 'baseline',        en: 'start line',      ko: '출발선 (기준선)',   zh: '起始线',      d: 'The pencil line near the bottom of the paper, where the spots are put.' },
      { k: 'solvent-front',   en: 'solvent front',   ko: '용매 전선',         zh: '溶剂前沿',    d: 'The line the solvent has reached at the top of its path up the paper.' },
      { k: 'stationary',      en: 'stationary phase', ko: '고정상',           zh: '固定相',      d: 'The part that does not move: in paper chromatography, the paper.' },
      { k: 'mobile',          en: 'mobile phase',    ko: '이동상',            zh: '流动相',      d: 'The part that moves: in paper chromatography, the solvent.' },
      { k: 'rf',              en: 'Rf value',        ko: 'Rf 값',             zh: '比移值（Rf值）', d: 'Distance moved by a dye ÷ distance moved by the solvent, both from the start line. It has no unit.' },
      { k: 'dye',             en: 'dye',             ko: '염료 (색소)',       zh: '染料',        d: 'A coloured substance. An ink is often a mixture of dyes.' }
    ]},
    { g: 'Properties', w: [
      { k: 'size',            en: 'size',            ko: '크기',              zh: '大小',        d: 'How big the particles or pieces are.' },
      { k: 'solubility',      en: 'solubility',      ko: '용해도',            zh: '溶解度',      d: 'The mass of a substance that can dissolve in a given volume of a solvent.' },
      { k: 'volatility',      en: 'volatility',      ko: '휘발성',            zh: '挥发性',      d: 'How easily a substance changes to a gas.' },
      { k: 'boiling-point',   en: 'boiling point',   ko: '끓는점',            zh: '沸点',        d: 'The temperature at which a liquid boils.' },
      { k: 'density',         en: 'density',         ko: '밀도',              zh: '密度',        d: 'How much mass there is in a certain volume. A less dense liquid floats on a denser one.' },
      { k: 'magnetism',       en: 'magnetism',       ko: '자성',              zh: '磁性',        d: 'Being attracted by a magnet. Iron, steel, nickel and cobalt are magnetic.' },
      { k: 'affinity',        en: 'affinity',        ko: '친화력',            zh: '亲和力',      d: 'How strongly a substance is attracted to something: to the paper or to the solvent.' },
      { k: 'property',          en: 'property',            ko: '성질',                  zh: '性质',          d: 'What a substance is like or how it behaves, such as its colour, its melting point, or whether it is magnetic.' }
    ]},
    { g: 'Doing words', w: [
      { k: 'boil',            en: 'boil',            ko: '끓다',              zh: '沸腾',        d: 'To change to a gas all through the liquid, with bubbles, at the boiling point.' },
      { k: 'evaporate',       en: 'evaporate',       ko: '증발하다',          zh: '蒸发',        d: 'To change from a liquid into a gas. It happens at the surface; heating makes it faster.' },
      { k: 'vaporisation',    en: 'vaporisation',    ko: '기화',              zh: '汽化',        also: ['vaporization', 'vaporise', 'vaporize'], d: 'A liquid changing to a gas. It happens in two ways: evaporating, only at the surface and at any temperature, and boiling, all through the liquid and only at the boiling point.' },
      { k: 'condense',        en: 'condense',        ko: '액화하다 (응결하다)', zh: '冷凝（液化）', also: ['condensation'], d: 'To change from a gas into a liquid when cooled.' },
      { k: 'heat',            en: 'heat',            ko: '가열하다',          zh: '加热',        d: 'To make something hotter.' },
      { k: 'cool',            en: 'cool',            ko: '식히다 (냉각하다)', zh: '冷却',        d: 'To make something colder, or to become colder.' },
      { k: 'separate',        en: 'separate',        ko: '분리하다',          zh: '分离',        link: false, d: 'To take the parts of a mixture away from each other.' },
      { k: 'attract',         en: 'attract',         ko: '끌어당기다',        zh: '吸引',        d: 'To pull something towards itself, as a magnet pulls iron.' },
      { k: 'float',           en: 'float',           ko: '뜨다',              zh: '漂浮',        d: 'To stay on the top of a liquid.' },
      { k: 'settle',          en: 'settle',          ko: '가라앉다',          zh: '沉降',        d: 'To sink slowly to the bottom of a liquid and stay there.' }
    ]},
    { g: 'Cells and proteins', w: [
      { k: 'cell',            en: 'cell',            ko: '세포',              zh: '细胞',        src: 'Y7 Cells', d: 'The smallest unit of a living organism. It contains the structures it needs for life processes.' },
      { k: 'organelle',       en: 'organelle',       ko: '세포 소기관',       zh: '细胞器',      src: 'Y7 Cells', d: 'A membrane-bound structure with a specific function in a cell, such as the nucleus or a mitochondrion. Ribosomes have no membrane, so they are not organelles.' },
      { k: 'cell-membrane',   en: 'cell membrane',   ko: '세포막',            zh: '细胞膜',      src: 'Y7 Cells', d: 'The thin layer round a cell. It controls the movement of substances into and out of the cell: for example, oxygen and glucose enter, and carbon dioxide leaves.' },
      { k: 'membrane',        en: 'membrane',        ko: '막',                zh: '膜',          d: 'A thin layer round a cell, or round a structure inside it such as the nucleus. It is two layers of lipids, with proteins in it, and it controls what passes through it.' },
      { k: 'cytoplasm',       en: 'cytoplasm',       ko: '세포질',            zh: '细胞质',      src: 'Y7 Cells', d: 'Everything inside the cell membrane except the nucleus: the cytosol and the organelles in it. Most of the chemical reactions of the cell happen here.' },
      { k: 'cytosol',         en: 'cytosol',         ko: '세포질 기질',       zh: '细胞质基质',  src: 'Y7 Cells', d: 'The jelly-like fluid of the cytoplasm. It is mostly water, with many substances dissolved in it. Ribosomes, microtubules and vesicles are in the cytosol.' },
      { k: 'nucleolus',       en: 'nucleolus',       ko: '인 (핵소체)',       zh: '核仁',        d: 'A dense region inside the nucleus of a cell. It makes the two parts of ribosomes. It has no membrane, so it is not an organelle.' },
      { k: 'nuclear-envelope', en: 'nuclear envelope', ko: '핵막',            zh: '核膜',        d: 'The two membranes round the nucleus of a cell. They have holes in them, the nuclear pores.' },
      { k: 'nuclear-pore',    en: 'nuclear pore',    ko: '핵공',              zh: '核孔',        d: 'A hole through the two membranes round the nucleus. Copies of genes (mRNA) and the parts of ribosomes leave the nucleus through nuclear pores.' },
      { k: 'chromosome',      en: 'chromosome',      ko: '염색체',            zh: '染色体',      src: 'Y7 Cells', d: 'A long thread of DNA in the nucleus, its DNA wound round small proteins (histones). Most human body cells have 46. In a cell that is not dividing they are long and thin; they look like an X only when a cell divides.' },
      { k: 'dna',             en: 'DNA',             ko: 'DNA',               zh: 'DNA',         src: 'Y7 Cells', d: 'The genetic material. It carries the instructions (genes) for making the proteins of the cell. Most of it is in the nucleus, and it stays there; mitochondria have a little DNA of their own.' },
      { k: 'gene',            en: 'gene',            ko: '유전자',            zh: '基因',        d: 'A short section of DNA that carries the instructions for making one protein.' },
      { k: 'mrna',            en: 'mRNA',            ko: '전령 RNA (mRNA)',   zh: '信使RNA (mRNA)', d: 'Messenger RNA: a copy of a gene, made in the nucleus. It carries the instructions from the DNA to the ribosomes.' },
      { k: 'ribosome',        en: 'ribosome',        ko: '리보솜',            zh: '核糖体',      src: 'Y7 Cells', d: 'A very small structure where proteins are made: it joins amino acids in the order that a copy of a gene (mRNA) gives. It has no membrane, so it is not an organelle.' },
      { k: 'amino-acid',      en: 'amino acid',      ko: '아미노산',          zh: '氨基酸',      src: 'Y7 Cells', d: 'A small molecule. Proteins are made of amino acids joined in a chain, and digestion splits proteins into amino acids again.' },
      { k: 'enzyme',          en: 'enzyme',          ko: '효소',              zh: '酶',          src: 'Y7 Cells', d: 'A protein that increases the rate of a chemical reaction and is not changed by it (a biological catalyst). Amylase is an enzyme.' },
      { k: 'active-site',     en: 'active site',     ko: '활성 부위',         zh: '活性部位',    d: 'The part of an enzyme where the molecule that it changes fits, as starch fits into amylase. If the shape of the enzyme changes, it no longer works.' },
      { k: 'amylase',         en: 'amylase',         ko: '아밀레이스',        zh: '淀粉酶',      src: 'Y7 Cells', d: 'An enzyme made in the salivary glands (and in the pancreas). It digests starch into maltose, a sugar.' },
      { k: 'starch',          en: 'starch',          ko: '녹말',              zh: '淀粉',        src: 'Y7 Cells', d: 'A carbohydrate: a large molecule made of many glucose molecules joined together. Bread, rice and potatoes contain starch. Iodine solution turns blue-black when starch is present.' },
      { k: 'iodine',          en: 'iodine solution', ko: '아이오딘 용액',     zh: '碘液',        src: 'Y7 Cells', d: 'An orange-brown solution used to test for starch: if starch is present, it turns blue-black.' },
      { k: 'glucose',         en: 'glucose',         ko: '포도당',            zh: '葡萄糖',      d: 'A sugar, a kind of carbohydrate. Cells release energy from glucose by respiration.' },
      { k: 'oxygen',          en: 'oxygen',          ko: '산소',              zh: '氧气',        d: 'A gas in the air. Cells use oxygen in aerobic respiration.' },
      { k: 'carbon-dioxide',  en: 'carbon dioxide',  ko: '이산화 탄소',       zh: '二氧化碳',    d: 'A gas produced by respiration. Cells release it as a waste product, and the blood carries it to the lungs.' },
      { k: 'mitochondria',    en: 'mitochondria',    ko: '미토콘드리아',      zh: '线粒体',      src: 'Y7 Cells', also: ['mitochondrion'], d: 'Organelles that contain the enzymes for aerobic respiration, which releases energy for the cell. One of them is a mitochondrion.' },
      { k: 'aerobic-respiration', en: 'aerobic respiration', ko: '산소 호흡 (유산소 호흡)', zh: '有氧呼吸', src: 'Y7 Cells', d: 'The chemical reactions that release energy from glucose, using oxygen. They start in the cytosol; most of the energy is released in the mitochondria. Carbon dioxide and water are produced.' },
      { k: 'rough-er',        en: 'rough ER',        ko: '거친면 소포체',     zh: '粗面内质网',  d: 'Rough endoplasmic reticulum: a network of flattened sacs covered in ribosomes. Proteins made by these ribosomes go inside it and fold into their shape.' },
      { k: 'smooth-er',       en: 'smooth ER',       ko: '매끈면 소포체',     zh: '光面内质网',  d: 'Smooth endoplasmic reticulum: a network of tubes with no ribosomes. It makes lipids, which build new membrane.' },
      { k: 'lipid',           en: 'lipid',           ko: '지질',              zh: '脂质',        src: 'Y7 Cells', d: 'A molecule made of the elements carbon, hydrogen and oxygen, arranged in a particular way. Fats and oils are lipids. The lipids of a membrane also contain phosphorus: a membrane is two layers of them, with proteins in it.' },
      { k: 'golgi',           en: 'Golgi apparatus', ko: '골지체',            zh: '高尔基体',    d: 'A stack of flattened, curved sacs. It modifies proteins, sorts them and packages them into vesicles.' },
      { k: 'vesicle',         en: 'vesicle',         ko: '소낭',              zh: '囊泡',        src: 'Y7 Cells', d: 'A small bubble of membrane that carries substances in a cell. A vesicle lasts only a short time: it forms, then joins another membrane, so it is not an organelle.' },
      { k: 'microtubule',     en: 'microtubule',     ko: '미세 소관',         zh: '微管',        src: 'Y7 Cells', d: 'A thin hollow tube made of protein. Motor proteins carry vesicles along microtubules. It has no membrane, so it is not an organelle.' },
      { k: 'motor-protein',   en: 'motor protein',   ko: '운동 단백질',       zh: '马达蛋白',    d: 'A protein that walks along a track in the cell, such as a microtubule, one step at a time. Some carry vesicles. Each step uses energy from respiration.' },
      { k: 'lysosome',        en: 'lysosome',        ko: '리소좀',            zh: '溶酶体',      d: 'A small sac of enzymes that digest old parts of the cell and things that have entered the cell.' },
      { k: 'centrosome',      en: 'centrosome',      ko: '중심체',            zh: '中心体',      d: 'A small structure from which microtubules grow. It has two centrioles: each is a ring of nine groups of short tubes. It has no membrane, so it is not an organelle.' },
      { k: 'exocytosis',      en: 'exocytosis',      ko: '세포외 배출',       zh: '胞吐',        d: 'Releasing substances from a cell: a vesicle joins the cell membrane and opens to the outside (exo = out, cyto = cell).' },
      { k: 'carrier-protein', en: 'carrier protein', ko: '운반체 단백질',     zh: '载体蛋白',    d: 'A protein in a membrane, such as the cell membrane, that lets one kind of substance, such as glucose, pass through.' },
      { k: 'carbohydrate',    en: 'carbohydrate',    ko: '탄수화물',          zh: '碳水化合物',  d: 'A molecule made of the elements carbon, hydrogen and oxygen, arranged in a particular way. Sugars, such as glucose, and starch are carbohydrates.' },
      { k: 'plasma',          en: 'plasma',          ko: '혈장',              zh: '血浆',        d: 'The liquid part of the blood. It is mostly water, with substances dissolved in it, such as glucose, amino acids and carbon dioxide. The blood cells are carried in it.' },
      { k: 'tissue-fluid',    en: 'tissue fluid',    ko: '조직액',            zh: '组织液',      d: 'The liquid round the cells of the body. It comes from the plasma, through the thin walls of the capillaries, and substances pass through it between the blood and the cells.' },
      { k: 'rna',             en: 'RNA',             ko: 'RNA',               zh: 'RNA',         d: 'A substance like DNA, but made of one strand, with the base U where DNA has T. A copy of a gene (mRNA) is made of RNA, and so are parts of ribosomes.' },
      { k: 'dna-base',        en: 'base (in DNA)',   ko: '염기',              zh: '碱基',        also: ['bases'], d: 'The part of a nucleotide that joins a base on the other strand of DNA. There are four: A (adenine), T (thymine), C (cytosine) and G (guanine). A always pairs with T, and C with G, and their order carries the instructions of the genes.' },
      { k: 'nucleotide',      en: 'nucleotide',      ko: '뉴클레오타이드',    zh: '核苷酸',      d: 'A building block of DNA (and of RNA): a sugar, a phosphate and a base, joined. It is made of the elements carbon, hydrogen, oxygen, nitrogen and phosphorus. DNA is a long chain of nucleotides; there are four kinds, named by their bases: A, T, C and G.' },
      { k: 'histone',         en: 'histone',         ko: '히스톤',            zh: '组蛋白',      also: ['histones'], d: 'A small protein. In a chromosome, the DNA is wound round groups of histones, like thread round beads, so that its 2 metres fit inside a nucleus.' },
      { k: 'diffusion',       en: 'diffusion',       ko: '확산',              zh: '扩散',        d: 'The movement of particles from where there are many of them to where there are fewer, as they move at random. Gases and dissolved substances spread in this way. It needs no energy from the cell.' },
      { k: 'saliva',          en: 'saliva',          ko: '침 (타액)',         zh: '唾液',        src: 'Y7 Cells', d: 'The liquid made by the salivary glands. It is mostly water, with mucus (a slimy substance) and the enzyme amylase.' },
      { k: 'salivary-gland',  en: 'salivary gland',  ko: '침샘',              zh: '唾液腺',      src: 'Y7 Cells', d: 'An organ that makes saliva. You have three large pairs round your mouth.' },
      { k: 'capillary',       en: 'capillary',       ko: '모세 혈관',         zh: '毛细血管',    also: ['capillaries'], d: 'The smallest kind of blood vessel. Its wall is one cell thick, so substances pass between the blood and the cells.' },
      { k: 'red-blood-cell',  en: 'red blood cell',  ko: '적혈구',            zh: '红细胞',      d: 'A blood cell that carries oxygen. It has no nucleus, and it is a disc that is thinner in the middle.' },
      { k: 'electron-microscope', en: 'electron microscope', ko: '전자 현미경', zh: '电子显微镜', src: 'Y7 Cells', d: 'A microscope that uses a beam of electrons instead of light. It shows much smaller details than a light microscope, such as ribosomes.' },
      { k: 'cristae',         en: 'cristae',         ko: '크리스타',          zh: '嵴（线粒体嵴）', also: ['crista'], d: 'The folds of the inner membrane of a mitochondrion (one: a crista). They give the inner membrane a large surface, where most of the energy of aerobic respiration is released.' },
      { k: 'matrix',          en: 'matrix',          ko: '기질 (미토콘드리아 기질; 효소의 기질과 다름)', zh: '基质（线粒体基质）', d: 'In a mitochondrion: the thick liquid inside the inner membrane. It contains enzymes of aerobic respiration, and the mitochondrion\'s own DNA and ribosomes.' },
      { k: 'intermembrane-space', en: 'intermembrane space', ko: '막 사이 공간 (막간 공간)', zh: '膜间隙', d: 'The narrow space between the two membranes of a mitochondrion, about 15 nm wide ("inter" means between). The space inside each crista is part of it.' },
      { k: 'channel-protein', en: 'channel protein', ko: '통로 단백질',       zh: '通道蛋白',    d: 'A protein in a membrane that makes a channel (a way) through it, so that some substances can pass, such as water, or the smaller molecules made from glucose.' },
      { k: 'atp',             en: 'ATP',             ko: 'ATP (아데노신 삼인산)', zh: 'ATP（腺苷三磷酸）', d: 'A small molecule that carries energy to the jobs of a cell. Respiration releases energy from glucose, and the cell uses this energy to make ATP; ATP then gives energy to each job, such as joining amino acids, making lipids and moving vesicles.' },
      { k: 'atp-synthase',    en: 'ATP synthase',    ko: 'ATP 합성 효소',     zh: 'ATP合酶',     d: 'An enzyme in the inner membrane of a mitochondrion that makes ATP. Hydrogen ions flowing through it turn part of it, like water turning a water wheel.' },
      { k: 'electron-transport-chain', en: 'electron transport chain', ko: '전자 전달계', zh: '电子传递链', d: 'A row of proteins in the inner membrane of a mitochondrion. Electrons from the food molecules pass from one protein to the next, and the proteins use their energy to pump hydrogen ions into the intermembrane space. At the end, the electrons join oxygen: water is produced.' },
      { k: 'hydrogen-ion',    en: 'hydrogen ion (H⁺)', ko: '수소 이온',        zh: '氢离子',      also: ['hydrogen ions'], d: 'A hydrogen atom that has lost its electron: just one proton, with a positive charge (H⁺).' },
      { k: 'micrometre',      en: 'micrometre (µm)', ko: '마이크로미터',      zh: '微米',        also: ['micrometres'], d: 'A unit of length: one thousandth of a millimetre (1 µm = 0.001 mm). Most cells are 10 to 100 µm across.' },
      { k: 'nanometre',       en: 'nanometre (nm)',  ko: '나노미터',          zh: '纳米',        also: ['nanometres'], d: 'A unit of length: one millionth of a millimetre (1 nm = 0.000001 mm). A glucose molecule is about 1 nm across.' },
    ]},
    { g: 'Respiration in detail (IB)', w: [
      { k: 'haemoglobin',     en: 'haemoglobin',     ko: '헤모글로빈',        zh: '血红蛋白',    d: 'The red protein inside red blood cells. It binds oxygen in the lungs and releases it in the tissues, where the concentration of oxygen is low.' },
      { k: 'glycolysis',      en: 'glycolysis',      ko: '해당 과정',         zh: '糖酵解',      d: 'The first stage of respiration, in the cytosol: each glucose molecule is split into two pyruvate molecules, with a net yield of 2 ATP and 2 reduced NAD. It needs no oxygen. Its four stages are phosphorylation, lysis, oxidation and ATP formation.' },
      { k: 'pyruvate',        en: 'pyruvate',        ko: '피루브산',          zh: '丙酮酸',      d: 'A molecule with 3 carbon atoms, made from glucose in glycolysis (two from each glucose). With oxygen, it enters a mitochondrion; without oxygen, it becomes lactate in humans, or ethanol and carbon dioxide in yeast.' },
      { k: 'triose-phosphate', en: 'triose phosphate', ko: '삼탄당 인산',     zh: '磷酸丙糖',    d: 'A sugar with 3 carbon atoms and a phosphate group. In glycolysis, each glucose molecule is split into two of them.' },
      { k: 'phosphorylation', en: 'phosphorylation', ko: '인산화',            zh: '磷酸化',      d: 'Adding a phosphate group to a molecule. In glycolysis, ATP gives phosphate groups to glucose; in a mitochondrion, ATP synthase adds a phosphate to ADP to make ATP.' },
      { k: 'substrate-level-phosphorylation', en: 'substrate-level phosphorylation', ko: '기질 수준 인산화 (효소의 기질, substrate)', zh: '底物水平磷酸化', d: 'Making ATP when an enzyme passes a phosphate group from a substrate molecule straight to ADP. No membrane and no gradient of protons (hydrogen ions) are needed: glycolysis and the Krebs cycle make ATP this way. The IB guide calls it ATP formation.' },
      { k: 'oxidative-phosphorylation', en: 'oxidative phosphorylation', ko: '산화적 인산화', zh: '氧化磷酸化', d: 'Making ATP in the inner membrane of a mitochondrion: ATP synthase uses the energy of hydrogen ions that flow back through it (chemiosmosis), after the electron transport chain has pumped them across. Most of the ATP of aerobic respiration is made this way.' },
      { k: 'oxidation',       en: 'oxidation',       ko: '산화',              zh: '氧化',        d: 'The loss of electrons by a molecule. In respiration, a molecule is oxidized when hydrogen, with its electron, is removed from it.' },
      { k: 'reduction',       en: 'reduction',       ko: '환원',              zh: '还原',        d: 'The gain of electrons by a molecule. NAD is reduced when it accepts hydrogen. Oxidation and reduction always happen together (a redox reaction).' },
      { k: 'dehydrogenation', en: 'dehydrogenation', ko: '탈수소 반응',       zh: '脱氢',        d: 'Removing hydrogen, with its electrons, from a molecule: a kind of oxidation. NAD or FAD accepts the hydrogen. The enzymes that do it are dehydrogenases.' },
      { k: 'decarboxylation', en: 'decarboxylation', ko: '탈카복실화 반응',   zh: '脱羧',        d: 'Removing a carbon atom from a molecule as carbon dioxide (from its carboxyl group, COO⁻). It happens in the link reaction, twice in each turn of the Krebs cycle, and in yeast, when pyruvate becomes ethanal.' },
      { k: 'nad',             en: 'NAD',             ko: 'NAD (니코틴아마이드 아데닌 다이뉴클레오타이드)', zh: 'NAD（烟酰胺腺嘌呤二核苷酸）', also: ['NAD⁺'], d: 'A coenzyme (nicotinamide adenine dinucleotide) that carries hydrogen in respiration. It accepts hydrogen from a substrate of an enzyme, so it is reduced, and gives it to the electron transport chain. It is made from niacin, vitamin B3, and is used again and again.' },
      { k: 'reduced-nad',     en: 'reduced NAD',     ko: '환원된 NAD (NADH)', zh: '还原型NAD（NADH）', also: ['NADH'], d: 'NAD that has accepted hydrogen. It is often written NADH (NADH + H⁺). It carries the electrons to the electron transport chain, where it becomes NAD again.' },
      { k: 'fad',             en: 'FAD',             ko: 'FAD (플라빈 아데닌 다이뉴클레오타이드)', zh: 'FAD（黄素腺嘌呤二核苷酸）', also: ['FADH₂', 'FADH2'], d: 'A coenzyme (flavin adenine dinucleotide) that carries hydrogen. In the Krebs cycle, it is part of an enzyme in the inner membrane of the mitochondrion (complex II), and it is made from riboflavin, vitamin B2. Reduced, it is FADH₂.' },
      { k: 'coenzyme-a',      en: 'coenzyme A',      ko: '조효소 A (코엔자임 A)', zh: '辅酶A',     also: ['CoA'], d: 'A carrier molecule that takes acetyl groups (2 carbon atoms) to the Krebs cycle. It is released there, to carry the next acetyl group. It is made from pantothenic acid, vitamin B5.' },
      { k: 'link-reaction',   en: 'link reaction',   ko: '연결 반응 (피루브산 산화)',         zh: '连接反应（丙酮酸氧化脱羧）', d: 'The reaction in the matrix of a mitochondrion that changes each pyruvate into acetyl coenzyme A: one carbon atom leaves as carbon dioxide (decarboxylation) and hydrogen is removed (oxidation), to NAD.' },
      { k: 'krebs-cycle',     en: 'Krebs cycle',     ko: '크렙스 회로 (TCA 회로)',       zh: '克雷布斯循环（三羧酸循环）', d: 'A cycle of reactions in the matrix of a mitochondrion. An acetyl group (2C) joins oxaloacetate (4C) to make citrate (6C); in the steps back to oxaloacetate, two carbon atoms leave as carbon dioxide, hydrogen is removed four times (to NAD and FAD), and one ATP is made.' },
      { k: 'proton-gradient', en: 'proton gradient', ko: '양성자 농도 기울기', zh: '质子梯度', d: 'A difference in the concentration of hydrogen ions (protons) across a membrane. In a mitochondrion, the electron transport chain pumps them into the intermembrane space, so their concentration there is high and in the matrix low.' },
      { k: 'chemiosmosis',    en: 'chemiosmosis',    ko: '화학 삼투',         zh: '化学渗透',    d: 'The flow of protons (hydrogen ions) down their concentration gradient, back through ATP synthase: in a mitochondrion, from the intermembrane space into the matrix (it happens in a chloroplast too). The energy released is used to make ATP from ADP and phosphate.' },
      { k: 'facilitated-diffusion', en: 'facilitated diffusion', ko: '촉진 확산', zh: '协助扩散（易化扩散）', d: 'Diffusion through a membrane with the help of a protein: a channel protein or a carrier protein. The substance moves down its concentration gradient, so no energy from ATP is needed.' },
      { k: 'glucose-transporter', en: 'glucose transporter', ko: '포도당 수송체', zh: '葡萄糖转运蛋白', also: ['glucose transporters'], d: 'A carrier protein in the cell membrane that lets glucose through by facilitated diffusion: it opens to one side, then to the other. In muscle cells, insulin brings more of them to the membrane.' },
      { k: 'concentration-gradient', en: 'concentration gradient', ko: '농도 기울기', zh: '浓度梯度', d: 'A difference in the concentration of a substance between two places. Particles diffuse down a concentration gradient: from the higher to the lower concentration.' },
      { k: 'hydrophobic',     en: 'hydrophobic',     ko: '소수성',            zh: '疏水的',      d: 'Water-avoiding: not attracted to water molecules. The tails of the lipids in a membrane are like this, so the middle of a membrane stops polar molecules and ions.' },
      { k: 'lactate',         en: 'lactate',         ko: '젖산',              zh: '乳酸',        d: 'The product of anaerobic respiration in humans, with 3 carbon atoms. Pyruvate accepts the hydrogen of reduced NAD, so NAD is regenerated and glycolysis can continue. Muscles make it during hard exercise.' },
      { k: 'ethanol',         en: 'ethanol',         ko: '에탄올',            zh: '乙醇',        d: 'An alcohol with 2 carbon atoms. Yeast makes it, with carbon dioxide, in anaerobic respiration; brewing uses it.' },
      { k: 'anaerobic-respiration', en: 'anaerobic respiration', ko: '무산소 호흡', zh: '无氧呼吸', d: 'Respiration without oxygen: in humans, glucose → lactate; in yeast, glucose → ethanol + carbon dioxide. It happens in the cytosol and yields only 2 ATP per glucose.' }
    ]},
    { g: 'Investigations', w: [
      { k: 'independent-variable', en: 'independent variable', ko: '조작 변인 (독립 변인)',       zh: '自变量',         d: 'The thing you change in an experiment, to see what effect it has. On a graph, you plot it on the x-axis (across).' },
      { k: 'dependent-variable', en: 'dependent variable',  ko: '종속 변인',               zh: '因变量',         d: 'The thing you measure in an experiment, to see how the independent variable affects it. On a graph, you plot it on the y-axis (up).' },
      { k: 'control-variable',  en: 'control variable',    ko: '통제 변인',               zh: '控制变量',       also: ['control variables', 'controlled variable', 'controlled variables'], d: 'Something you keep the same in an experiment, so that the test is fair.' }
    ]}
  ];
  const BY = {};
  G.forEach(g => g.w.forEach(w => { w.g = g.g; BY[w.k] = w; }));
  /* the forms of a word that link to it inside a definition: the word, its plural, and for a doing word its other forms
     (a phrase changes only its last word: "boiling points", "chemical symbols"), and any other form it lists in also */
  function forms(w) {
    const parts = w.en.split(' '), last = parts.pop(), head = parts.length ? parts.join(' ') + ' ' : '';
    const ends = new Set([last, last + 's', last + 'es', last.replace(/y$/, 'ies'), last + 'd', last + 'ed', last.replace(/e$/, '') + 'ing', last + 'ing', last.replace(/e$/, '') + 'ed']);
    return Array.from(ends).map(e => head + e).concat(w.also || []).sort((a, b) => b.length - a.length);
  }
  /* a definition cut into words and links: [text, key or null], each key at most once; longest names first */
  function links(d, has, self) {
    const cands = [];
    Object.keys(BY).forEach(k => { const w = BY[k]; if (k === self || w.link === false || (has && !has(k))) return; forms(w).forEach(f => cands.push([f, k])); });
    cands.sort((a, b) => b[0].length - a[0].length);
    const out = [], used = new Set();
    let rest = d;
    for (;;) {
      let best = null;
      for (const [f, k] of cands) {
        if (used.has(k)) continue;
        const m = new RegExp('(^|[^A-Za-z])(' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![A-Za-z])', 'i').exec(rest);
        if (m && (!best || m.index + m[1].length < best.at || (m.index + m[1].length === best.at && m[2].length > best.len))) best = { at: m.index + m[1].length, len: m[2].length, k };
      }
      if (!best) { if (rest) out.push([rest, null]); return out; }
      if (best.at) out.push([rest.slice(0, best.at), null]);
      out.push([rest.substr(best.at, best.len), best.k]); used.add(best.k);
      rest = rest.slice(best.at + best.len);
    }
  }
  const api = { groups: G, by: BY, forms, links };
  if (typeof window !== 'undefined') window.KS3_GLOSSARY = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
