/* ============================================================
   real.js — the real micrographs of "See the real thing" (4 Nov 2026), one list per place. Written by hand from the
   pictures made by tools/real-em.py (from the OpenOrganelle dataset jrc_hela-2, CC BY 4.0) and from public-domain
   electron micrographs; every picture's source and changes are in img/real/CREDITS.md.
   - The HeLa pictures are all cut from ONE real cell; the outline in each is the dataset's own segmentation of that
     part, in the colour the part has in the game (tools/real-em.py also writes twins without the outline, not published).
   - The two pancreas pictures (Louisa Howard, Dartmouth College, public domain) show what the HeLa cell cannot: a
     cell that makes amylase, packed with rough ER and secretory vesicles. Both are under rer; the one with secretory
     vesicles is the only picture under exit (the HeLa vesicles at the cell membrane are too small to see clearly).
   - No picture yet for ser and tracks (tools/real-em.py says why for tracks).
   ============================================================ */
const HELA = 'Janelia Research Campus, OpenOrganelle jrc_hela-2, CC BY 4.0';
const HOWARD = 'Louisa Howard, Dartmouth College, Wikimedia Commons, public domain';
const ONE_CELL = 'This is part of one real human cell (a HeLa cell, a kind of cell grown in laboratories), seen with an electron microscope.';
const PANCREAS_CELLS = { src: 'img/real/pancreas-cells.jpg', credit: HOWARD,
  alt: 'Electron micrograph of pancreas cells: a large nucleus in the middle, many thin parallel lines of rough ER round it, and large dark round secretory vesicles on the right and at the bottom left.' };

export const REAL = {
  wayin: { em: [
    { src: 'img/real/wayin.jpg', credit: HELA,
      alt: 'Electron micrograph of the top edge of a cell: smooth pale grey plastic above, a thin dark cell membrane with a pale purple line along it, and cytoplasm with many black dots below.',
      cap: `<b>The cell membrane</b> (pale purple line), the thin layer round the cell. Above it is the outside of the cell, here the clear plastic that holds the cell for the microscope; below it is the cytoplasm, with many ribosomes (the black dots). ${ONE_CELL}` }
  ] },
  nucleus: { em: [
    { src: 'img/real/nucleus.jpg', credit: HELA,
      alt: 'Electron micrograph of the lower edge of a nucleus: the nucleus above, a grey double line of membranes across the picture, and under it a purple line with three gaps; cytoplasm and a round mitochondrion below.',
      cap: `<b>The nuclear envelope</b> (purple line) is the edge of the nucleus: the nucleus is above it, the cytoplasm below. Its two membranes show as a grey double line, and the purple line has a gap at each <b>nuclear pore</b>, a hole through both membranes. ${ONE_CELL}` }
  ] },
  nucleolus: { em: [
    { src: 'img/real/nucleolus.jpg', credit: HELA,
      alt: 'Electron micrograph inside a nucleus: a large round grainy area outlined in pink, with darker clumps round it; the edge of the nucleus at the top right.',
      cap: `<b>The nucleolus</b> (pink line) is the large grainy area inside the nucleus. It makes the two parts of ribosomes. At the top right is the edge of the nucleus. ${ONE_CELL}` }
  ] },
  mito: { em: [
    { src: 'img/real/mito.jpg', credit: HELA,
      alt: 'Electron micrograph of cytoplasm with several mitochondria outlined in orange; the one in the middle is long, with dark lines across it.',
      cap: `<b>Mitochondria</b> (orange lines). The one in the middle is cut along its length: the dark lines across it are the folds of its inner membrane. ${ONE_CELL}` }
  ] },
  ribosome: { em: [
    { src: 'img/real/ribosome.jpg', credit: HELA,
      alt: 'Electron micrograph of cytoplasm full of small black dots, each in a yellow ring, with two round mitochondria.',
      cap: `<b>Ribosomes</b> (yellow rings): each black dot in a ring is one ribosome, about 25 nanometres across. The two large round shapes are mitochondria. ${ONE_CELL}` }
  ] },
  rer: { em: [
    { src: 'img/real/rer.jpg', credit: HELA,
      alt: 'Electron micrograph of two long flat sacs of rough ER, outlined in green, with black dots in rows along them; more black dots in the cytoplasm round them.',
      cap: `Two flattened sacs of <b>rough ER</b> (green lines). The black dots along them are ribosomes; the dots away from the sacs are ribosomes that are not on the ER. ${ONE_CELL}` },
    { src: 'img/real/pancreas-rer.jpg', credit: HOWARD,
      alt: 'Electron micrograph of a pancreas cell: stacks of thin parallel lines of rough ER on the left and at the top right, round a large nucleus.',
      cap: '<b>Rough ER</b> in a pancreas cell, a cell that makes amylase too: the stacks of thin lines on the left and at the top right. The tiny dots along the lines are ribosomes. The nucleus fills the middle, and the thin double line round it is the nuclear envelope. The bar at the bottom left is 500 nanometres (0.5 µm).' },
    Object.assign({ cap: '<b>Rough ER</b> in pancreas cells, which make amylase too: the many thin lines in layers round the nucleus, the large shape in the middle. A cell that makes proteins to release from the cell is full of rough ER. The bar at the bottom left is 500 nanometres (0.5 µm).' }, PANCREAS_CELLS)
  ] },
  golgi: { em: [
    { src: 'img/real/golgi.jpg', credit: HELA,
      alt: 'Electron micrograph of Golgi stacks, outlined in yellow: curved stacks of thin flat sacs, with a large pale round shape under one; the nucleus at the top and white glass at the bottom.',
      cap: `<b>The Golgi apparatus</b> (yellow line): stacks of flattened, curved sacs, with small vesicles round them. The nucleus is at the top, and the white strip at the bottom is outside the cell, under it. ${ONE_CELL}` }
  ] },
  exit: { em: [
    Object.assign({ cap: '<b>Vesicles full of enzymes</b> in pancreas cells, which make amylase too: the large dark round shapes on the right and at the bottom left. They hold the enzymes until the cell gets a signal; then each one joins the cell membrane and releases its enzymes outside the cell. The bar at the bottom left is 500 nanometres (0.5 µm).' }, PANCREAS_CELLS)
  ] }
};
