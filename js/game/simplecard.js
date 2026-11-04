/* ============================================================
   simplecard.js — the cell as Year 7 pupils draw it (4 Nov 2026), at the top of the first place's panel (STORY.arrive
   figure), beside the 3D cell with the same five parts lit.
   Daniel: "Show a very simple cell, the type of cell that key stage 3s are going to be shown. And then show the
   complexity, but at the same time … showing the simplicity". The diagram is domdomegg's Simple diagram of animal cell
   (Wikimedia Commons, CC BY 4.0; ribosomes added by the Cells Lab); the names are this page's, each on ONE level line that
   ends ON its part (memory label-lines-never-cross), the points measured on the drawing's own outlines (4 Nov 2026:
   membrane x 271 at y 300, nucleus 383–455 × 173–264, the mitochondrion at 365, 433, the ribosome at 356, 151).
   ============================================================ */
const LAB = [
  /* text, label side, the point on the part (drawing units), the label row */
  ['ribosome', 'L', 356, 151], ['nucleus', 'L', 383, 218], ['cell membrane', 'L', 271, 300], ['mitochondrion', 'L', 365, 433],
  ['cytoplasm', 'R', 610, 420]
];
export function simpleCard() {
  const lines = LAB.map(([t, side, x, y]) => {
    const x0 = side === 'L' ? 258 : 712;
    return `<line x1="${x0}" y1="${y}" x2="${x}" y2="${y}" stroke="#1B1B33" stroke-width="2.4"/>` +
      `<text x="${side === 'L' ? x0 - 8 : x0 + 8}" y="${y + 11}" text-anchor="${side === 'L' ? 'end' : 'start'}" font-family="Nunito, sans-serif" font-weight="800" font-size="34" fill="#1B1B33">${t}</text>`;
  }).join('');
  return `<figure class="simple" aria-label="The cell you learn in Year 7: an animal cell with its five parts named.">
    <p class="simple__k">The cell as you draw it in Year 7</p>
    <svg viewBox="0 0 900 560" role="img" aria-label="A simple animal cell: cell membrane, cytoplasm, nucleus, mitochondria and ribosomes, each named.">
      <image href="img/diagram/simple-animal-cell.svg" x="0" y="0" width="730.39" height="560.42"/>${lines}</svg>
    <figcaption>Diagram: domdomegg, Wikimedia Commons, CC BY 4.0 (ribosomes added by the Cells Lab). The same five parts are lit in the 3D cell.</figcaption>
  </figure>`;
}
