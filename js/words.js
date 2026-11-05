/* ============================================================
   words.js — this page's word bank: WHICH words of the KS3 glossary it shows, and in which groups (4 Nov 2026).
   The words themselves, their Korean and Chinese, and their ONE definition each live in labs-shared/ks3-glossary.js,
   copied here as js/glossary.js by tools/practicals-sync.mjs (memory ks3-glossary). Never write a definition here: add
   the word to the glossary first.
   ============================================================ */
window.WORD_KEYS = [
  { g: 'The cell you know', w: ['cell', 'cell-membrane', 'membrane', 'cytoplasm', 'cytosol', 'nucleus', 'mitochondria', 'ribosome', 'organelle', 'electron-microscope'] },
  { g: 'Inside the nucleus', w: ['nuclear-envelope', 'nuclear-pore', 'chromosome', 'dna', 'histone', 'nucleotide', 'dna-base', 'hydrogen-bond', 'gene', 'rna', 'mrna', 'nucleolus'] },
  { g: 'Making and releasing a protein', w: ['amino-acid', 'protein', 'enzyme', 'active-site', 'amylase', 'rough-er', 'smooth-er', 'lipid', 'fat', 'carbohydrate', 'golgi', 'vesicle', 'microtubule', 'motor-protein', 'centrosome', 'lysosome', 'exocytosis'] },
  { g: 'Respiration and the blood', w: ['aerobic-respiration', 'glucose', 'oxygen', 'carbon-dioxide', 'energy', 'diffusion', 'carrier-protein', 'capillary', 'plasma', 'tissue-fluid', 'red-blood-cell'] },
  { g: 'Saliva and the starch test', w: ['salivary-gland', 'saliva', 'starch', 'iodine', 'control-variable'] }
];
/* the bank as the page reads it: each group's words, from the glossary */
window.WORDS = window.WORD_KEYS.map(g => ({ g: g.g, w: g.w.map(k => window.KS3_GLOSSARY && window.KS3_GLOSSARY.by[k]).filter(Boolean) }));
