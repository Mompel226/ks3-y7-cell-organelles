/* ============================================================
   coursewords.js — the course's own word on every button (19 Nov 2026).
   Daniel, 18 Nov 2026, with IB on: "everything that is vocabulary, make sure it aligns with the way the students should
   read about it … Right now, it seems that you're providing IB content with the simplification of Key Stage 3 and even
   the wording"; his "Yes, build it" to the table of buttons. With a course on, a button and the sentence that names it
   carry the word of that course's own line at that step. Year 7 keeps every word (`y7`).
   One table, read by the button on the picture (quest.js hot, `w`) and by the sentence in the panel (story.js
   `data-cw`), so the two always agree.
     y7     the Year 7 word (also the handle the checks press a button by: its data-y7)
     igcse  with IGCSE on (and IB off, or IB with no word of its own here)
     sl     with IB on, at SL and at HL
     hl     with IB on at HL only (a word of an "Additional higher level" line: never shown at SL)
     at     [place, step from 0]: the step whose course lines carry the word
     src    for each course word, a piece of that line: tools/ib-level.mjs N proves the word is the line's, at its level
   No word here is new science: each is a verb or a name out of the line beside it. A course with no word of its own
   for a step (0610 does not name the rough ER, the Golgi apparatus or the parts of a ribosome) keeps the Year 7 word.
   This file imports nothing, so the checks can read it.
   ============================================================ */
export const WORDS = {
  /* the mitochondria: the buttons are the molecules themselves; the sentence says what the press does */
  split:     { y7: 'split it', igcse: 'start to break it down', hl: 'convert it into pyruvate by glycolysis', at: ['mito', 2], src: { igcse: /break down nutrient molecules/, hl: /Glycolysis converts glucose \(6C\) into two pyruvate/ } },   /* (the science read, 19 Nov: "break it down" is all of respiration and this press only splits the glucose; "start glycolysis" said that the split starts it, and the press shows all ten steps) */
  etc:       { y7: 'the last protein in the chain', hl: 'the last protein of the electron transport chain', at: ['mito', 5], src: { hl: /chain of proteins is the electron transport chain/ } },
  pyr2:      { y7: 'the two smaller molecules', hl: 'the two pyruvate molecules', at: ['mito', 3], src: { hl: /smaller molecules are pyruvate/ } },
  /* the nucleus */
  thread2:   { y7: 'Second thread', igcse: 'Replicate the chromosome', sl: 'Replicate the DNA', at: ['nucleus', 2], src: { igcse: /exact replication of chromosomes/, sl: /DNA replication/ } },
  pack:      { y7: 'Pack', sl: 'Condense', at: ['nucleus', 2], src: { sl: /Chromosomes condense/ } },
  copy:      { y7: 'Copy', igcse: 'Make mRNA', sl: 'Transcribe', at: ['nucleus', 4], src: { igcse: /mRNA molecules are made in the nucleus/, sl: /Transcription is the synthesis of RNA/ } },
  copyline:  { y7: 'Copy to make the copy', igcse: 'Make mRNA', sl: 'Transcribe to make the mRNA', at: ['nucleus', 4], src: { igcse: /mRNA molecules are made in the nucleus/, sl: /Transcription is the synthesis of RNA/ } },
  thecopy:   { y7: 'the copy', igcse: 'the mRNA', sl: 'the mRNA', at: ['nucleus', 5], src: { igcse: /mRNA molecules move from the nucleus/, sl: /mRNA can be modified/ } },
  /* the nucleolus: "subunit" is the guide's word (D1.2.6, in the ribosomes' first step), as the names on the picture say */
  smallpart: { y7: 'small part', sl: 'small subunit', at: ['ribosome', 0], src: { sl: /binds to the small subunit/ } },
  largepart: { y7: 'large part', sl: 'large subunit', at: ['ribosome', 0], src: { sl: /small subunit/ } },
  eachpart:  { y7: 'each part', sl: 'each subunit', at: ['ribosome', 0], src: { sl: /small subunit/ } },
  /* the ribosomes */
  ribjoin:   { y7: 'Join', sl: 'Bind the mRNA', at: ['ribosome', 0], src: { sl: /mRNA binds to the small subunit/ } },
  ribline:   { y7: 'the small part attaches to the copy, then the large part joins it', sl: 'the mRNA binds to the small subunit, then the large subunit joins it', at: ['ribosome', 0], src: { sl: /mRNA binds to the small subunit/ } },
  carrier:   { y7: 'the carrier that matches the code', sl: 'the tRNA whose anticodon pairs with the codon', at: ['ribosome', 1], src: { sl: /transfer RNA \(tRNA\)\. Its anticodon, three bases, pairs with a codon/ } },
  /* the rough ER */
  dock:      { y7: 'Dock', hl: 'Bind to the rough ER', at: ['rer', 0], src: { hl: /Ribosomes bound to the rough endoplasmic reticulum/ } },
  go:        { y7: 'Go', igcse: 'Assemble amino acids', sl: 'Link the amino acids', at: ['rer', 1], src: { igcse: /ribosome assembles amino acids/, sl: /Amino acids are linked/ } },
  cut:       { y7: 'Cut', hl: 'Modify the polypeptide', at: ['rer', 2], src: { hl: /polypeptides must be modified/ } },   /* ("signal sequence" is not the guide's word: D1.2.18 says that polypeptides must be modified; the science read) */
  bud:       { y7: 'Bud', sl: 'Form a vesicle', at: ['rer', 4], src: { sl: /a vesicle is an organelle/ } },
  budline:   { y7: 'Bud to make a vesicle', sl: 'Form a vesicle', at: ['rer', 4], src: { sl: /a vesicle is an organelle/ } },
  /* the smooth ER */
  serjoin:   { y7: 'Join', sl: 'Form a phospholipid', at: ['ser', 0], src: { sl: /A phospholipid forms by condensation reactions/ } },   /* ("Join by condensation (1 of 3)" read as the first of three reactions: one press shows the three condensation reactions of ONE phospholipid; the science read) */
  serthree:  { y7: 'three lipids', sl: 'three phospholipids', at: ['ser', 0], src: { sl: /A phospholipid forms/ } },
  /* the Golgi apparatus */
  goljoin:   { y7: 'Join', hl: 'Fuse', at: ['golgi', 0], src: { hl: /fuse with the first sac/ } },
  package:   { y7: 'Package', sl: 'Form a secretory vesicle', at: ['golgi', 3], src: { sl: /secretory vesicle/ } },
  /* the way out */
  release:   { y7: 'Release', hl: 'Release by exocytosis', at: ['exit', 1], src: { hl: /release of material from the cell is exocytosis/ } }
};
/* the word now. on: { ib, igcse, hl } (which course is on at this place, and the IB level). IB's word first, at the
   student's own level, as play.js lvWord; else IGCSE's; else Year 7's */
export function pick(key, on) {
  const w = WORDS[key]; if (!w) return key;
  const ib = on && on.ib ? (on.hl ? w.hl || w.sl : w.sl) : '';
  return ib || (on && on.igcse && w.igcse) || w.y7;
}
