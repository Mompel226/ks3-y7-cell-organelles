/* ============================================================
   ibmap.js — the IB map (15 Nov 2026): every IB part of the game, by IB topic, each with a door straight to it.
   Daniel, 15 Nov 2026, to the proposal "A: an IB map with direct doors" (and "B: Year 12 and 13 open the IB layer by
   themselves"): yes, and "only for IB students … a year 12 or year 13". So the map opens only with the IB pass
   (js/ibpass.js); main.js gives the doors their actions and fetches this file when the map is first opened.
   Where the codes come from, so that the map never says more than the game teaches:
   - the five places with course layers (story.js `course.ib`: the way in, the mitochondria, the nucleus, the ribosomes,
     the rough ER): the statements of their IB lines;
   - "From glucose to ATP" (js/ib/text.js CHAPTERS) and "The cell membrane: fluid and mosaic" (js/membrane/text.js
     STEPS): the [sl CODE] and [hl CODE] tags of their paragraphs, read when the map opens;
   - the side quest's plant cell (js/plant/text.js COURSE, whose IB lines carry their codes in comments): its two IB
     steps for B2.2 and D2.3, listed here (PLANT) and checked against those comments by tools/ib-pass.mjs.
   A door to a place opens it with the course on IB; a door to a view opens the view (at its chapter); every door has an
   address of its own, #ib-<door> (main.js), which a teacher can copy from the map for a slide or Google Classroom.
   ============================================================ */
const R = window.REV, { $, $$, h, esc } = R;
const STORY = window.STORY;
/* the IB guide's topic names (Biology guide, first assessment 2025) */
const TOPIC = {
  'A1.1': 'Water', 'A1.2': 'Nucleic acids', 'A2.2': 'Cell structure', 'B1.1': 'Carbohydrates and lipids', 'B1.2': 'Proteins',
  'B2.1': 'Membranes and membrane transport', 'B2.2': 'Organelles and compartmentalization', 'B2.3': 'Cell specialization',
  'B3.1': 'Gas exchange', 'B3.2': 'Transport', 'B4.2': 'Ecological niches', 'C1.1': 'Enzymes and metabolism', 'C1.2': 'Cell respiration',
  'C1.3': 'Photosynthesis', 'C2.1': 'Chemical signalling', 'C2.2': 'Neural signalling', 'D1.1': 'DNA replication',
  'D1.2': 'Protein synthesis', 'D2.1': 'Cell and nuclear division', 'D2.2': 'Gene expression', 'D2.3': 'Water potential',
  'D3.3': 'Homeostasis'
};
/* every place with an IB layer (story.js `course.ib`), in the order of the story (16 Nov 2026: eleven of the twelve) */
export const PLACES = Object.keys(STORY).filter(id => STORY[id].course && STORY[id].course.ib);
/* the plant cell's IB lines (js/plant/text.js COURSE: `chloroplast` B2.2.5 AHL; `vacuole` D2.3.2, D2.3.3, D2.3.6 SL and
   D2.3.8 to D2.3.10 AHL) */
/* (16 Nov 2026: every statement of the side quest's IB lines, from the comments of its COURSE, not only B2.2.5 and D2.3:
   the audit found 51 taught statements with no door on the map) */
export const PLANT = {'A1.1.3': 'sl', 'A2.2.10': 'sl', 'A2.2.11': 'sl', 'A2.2.2': 'sl', 'A2.2.6': 'sl', 'A2.2.8': 'sl', 'B1.1.2': 'sl', 'B1.1.3': 'sl', 'B1.1.5': 'sl', 'B1.1.6': 'sl', 'B2.1.1': 'sl', 'B2.1.10': 'sl', 'B2.1.16': 'hl', 'B2.1.2': 'sl', 'B2.1.4': 'sl', 'B2.1.7': 'sl', 'B2.1.8': 'sl', 'B2.2.1': 'sl', 'B2.2.5': 'hl', 'B2.2.7': 'hl', 'B2.2.8': 'hl', 'B2.3.6': 'sl', 'B2.3.7': 'hl', 'B3.1.7': 'sl', 'B3.1.8': 'sl', 'B3.1.9': 'sl', 'B3.2.1': 'sl', 'B3.2.18': 'hl', 'B3.2.7': 'sl', 'B4.2.4': 'sl', 'C1.1.11': 'hl', 'C1.1.3': 'sl', 'C1.1.4': 'sl', 'C1.1.5': 'sl', 'C1.1.6': 'sl', 'C1.2.1': 'sl', 'C1.2.2': 'sl', 'C1.2.4': 'sl', 'C1.2.5': 'sl', 'C1.3.1': 'sl', 'C1.3.11': 'hl', 'C1.3.12': 'hl', 'C1.3.13': 'hl', 'C1.3.14': 'hl', 'C1.3.15': 'hl', 'C1.3.16': 'hl', 'C1.3.2': 'sl', 'C1.3.3': 'sl', 'C1.3.5': 'sl', 'D2.3.10': 'hl', 'D2.3.2': 'sl', 'D2.3.3': 'sl', 'D2.3.6': 'sl', 'D2.3.8': 'hl', 'D2.3.9': 'hl', 'D3.3.3': 'sl'};
/* the two films of the places' IB boxes (js/game/transcribe.js LINES, js/game/ribofilm.js STEPS: their lines, by level),
   opened from the map as from their boxes ('coursefilm') */
export const FILMS = {
  copy: { title: 'Film: how a cell copies a gene (the nucleus)', codes: {'A1.2.1': 'sl', 'A1.2.12': 'hl', 'A1.2.13': 'hl', 'A1.2.2': 'sl', 'A1.2.3': 'sl', 'A1.2.4': 'sl', 'A1.2.5': 'sl', 'A1.2.6': 'sl', 'A1.2.7': 'sl', 'A2.2.6': 'sl', 'D1.2.1': 'sl', 'D1.2.12': 'hl', 'D1.2.13': 'hl', 'D1.2.15': 'hl', 'D1.2.2': 'sl', 'D1.2.3': 'sl', 'D1.2.4': 'sl'} },
  ribo: { title: 'Film: how a ribosome reads the copy (the ribosomes)', codes: {'A1.2.7': 'sl', 'B1.2.2': 'sl', 'B1.2.4': 'sl', 'D1.2.10': 'sl', 'D1.2.12': 'hl', 'D1.2.17': 'hl', 'D1.2.18': 'hl', 'D1.2.5': 'sl', 'D1.2.6': 'sl', 'D1.2.7': 'sl', 'D1.2.8': 'sl', 'D1.2.9': 'sl'} }
};
const TAG = /\[(sl|hl)\s+([A-D]\d\.\d\.\d+(?:\s*,\s*[A-D]\d\.\d\.\d+)*)\]/g;
const tagged = (o, into = {}) => { JSON.stringify(o).replace(TAG, (m, lv, cs) => { cs.split(/\s*,\s*/).forEach(c => { into[c] = into[c] === 'sl' ? 'sl' : lv; }); return m; }); return into; };
const topicOf = c => c.split('.').slice(0, 2).join('.');
/* the guide's order: the letter, then each number (A1.2 before A2.2; B2.2.7 before B2.2.10) */
const codeSort = (a, b) => {
  if (a[0] !== b[0]) return a < b ? -1 : 1;
  const x = a.slice(1).split('.').map(Number), y = b.slice(1).split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
};

/* every door, with the statements it shows: { id, kind, title, codes: { code: 'sl' | 'hl' } } */
export async function doors() {
  const out = [];
  PLACES.forEach(id => {
    const C = STORY[id] && STORY[id].course, codes = {};
    if (!C || !C.ib) return;
    C.ib.forEach(b => b && b.p.forEach(([lv, code]) => String(code || '').split(/\s*,\s*/).filter(Boolean).forEach(c => { if (lv === 'sl' || lv === 'hl') codes[c] = codes[c] === 'sl' ? 'sl' : lv; })));
    out.push({ id, kind: 'place', title: STORY[id].title, codes });
  });
  const [M, T] = await Promise.all([import('../membrane/text.js?v=202611161111'), import('../ib/text.js?v=202611161111')]);
  out.push({ id: 'membrane', kind: 'view', title: 'The cell membrane: fluid and mosaic', codes: tagged(M.STEPS) });
  T.CHAPTERS.forEach((c, i) => { const codes = tagged(c); if (Object.keys(codes).length) out.push({ id: 'atp-' + c.id, ci: i, kind: 'view', title: 'From glucose to ATP: ' + c.title.charAt(0).toLowerCase() + c.title.slice(1), codes }); });
  /* the insulin path, an Explore of the view (text.js EXPLORE 'x-insulin'): opened at its start */
  const X = T.EXPLORE && T.EXPLORE['x-insulin'];
  if (X) out.push({ id: 'atp-x-insulin', ci: 'x-insulin', kind: 'view', title: 'From glucose to ATP: insulin and its receptor', codes: tagged(X) });
  Object.entries(FILMS).forEach(([k, f]) => out.push({ id: 'film-' + k, film: k, kind: 'film', title: f.title, codes: Object.assign({}, f.codes) }));
  /* the three views of 16 Nov 2026, each read from its own words (js/<view>/text.js STEPS, tagged as the others) */
  for (const [v, title] of [['water', 'Water potential'], ['light', 'From light to glucose'], ['fractionation', 'Cell fractionation lab']]) {
    try { const m = await import(`../${v}/text.js?v=202611160713`); const codes = tagged(m.STEPS || m); if (Object.keys(codes).length) out.push({ id: v, kind: 'view2', view: v, title, codes }); }
    catch (e) { /* (a view not on this copy of the site) */ }
  }
  /* the starch test's investigation (js/game/bench.js: its tagged lines) */
  out.push({ id: 'bench', kind: 'bench', title: 'IB investigation: heat and time (the starch test)', codes: { 'B1.2.5': 'sl', 'C1.1.7': 'sl', 'C1.1.8': 'sl', 'C1.1.9': 'sl' } });
  out.push({ id: 'plant', kind: 'side', title: 'Side quest: the plant cell (from light to glucose, starch, water)', codes: Object.assign({}, PLANT) });
  return out;
}

/* the card: one section a topic, in the guide's order; in each, the doors that show it, with their statements */
export async function openIBMap({ open, teacher }) {
  let box = $('#ibmap');
  if (!box) { box = h('div', { class: 'ibmap', id: 'ibmap', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ibmapT' }); $('#stage').appendChild(box); }
  box.innerHTML = '<div class="ibmap__card"><p class="ibmap__k">IB Biology · Year 12 and 13</p><h2 class="ibmap__t" id="ibmapT">IB map</h2><p class="ibmap__p">Opening…</p></div>';
  box.hidden = false; document.documentElement.classList.add('ibmap-open');
  const D = await doors(), topics = {};
  D.forEach(d => Object.keys(d.codes).forEach(c => { const t = topicOf(c); if (!TOPIC[t]) return; ((topics[t] = topics[t] || new Map()).get(d) || topics[t].set(d, []).get(d)).push(c); }));
  const KIND = { place: 'Place in the cell', view: 'IB view', film: 'Film', bench: 'Investigation', side: 'Side quest' };
  const link = id => location.origin + location.pathname.replace(/index\.html$/, '') + '#ib-' + id;
  const row = (d, cs) => `<li class="ibmap__row"><button type="button" class="ibmap__door" data-door="${d.id}"><span class="ibmap__dt">${esc(d.title)}</span><span class="ibmap__dk">${KIND[d.kind]} →</span></button>
    <span class="ibmap__codes">${cs.sort(codeSort).map(c => `<span class="ibl ibl--${d.codes[c]}">${c}${d.codes[c] === 'hl' ? ' HL' : ''}</span>`).join(' ')}</span>${teacher ? `<button type="button" class="ibmap__copy" data-link="${esc(link(d.id))}">Copy link</button>` : ''}</li>`;
  const secs = Object.keys(topics).sort(codeSort).map(t => `<section class="ibmap__sec"><h3 class="ibmap__h"><span>${t}</span> ${esc(TOPIC[t])}</h3><ul class="ibmap__list">${[...topics[t]].map(([d, cs]) => row(d, cs)).join('')}</ul></section>`).join('');
  box.innerHTML = `<div class="ibmap__card">
      <button type="button" class="close-x ibmap__x" aria-label="Close the IB map">×</button>
      <p class="ibmap__k">IB Biology · Year 12 and 13</p>
      <h2 class="ibmap__t" id="ibmapT">IB map</h2>
      <p class="ibmap__p">Each IB topic of the guide that this game shows, and where it shows it. Press a place or a view to go there. A place opens with your course on IB: under each step, its IB lines and its statement numbers. <span class="ibl ibl--sl">SL</span> is for SL and HL; <span class="ibl ibl--hl">HL</span> is for HL only.</p>
      ${teacher ? '<p class="ibmap__p ibmap__p--t">Teacher: each door has its own address. Copy it for a slide or for Google Classroom: a Year 12 or 13 student who is signed in goes straight there.</p>' : ''}
      ${secs}
      <div class="ibmap__end"><button type="button" class="btn ibmap__close">Back to the game</button></div>
    </div>`;
  R.terms && R.terms(box);
  const close = () => { box.hidden = true; document.documentElement.classList.remove('ibmap-open'); document.removeEventListener('keydown', esc_); };
  const esc_ = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc_);
  $$('.ibmap__x, .ibmap__close', box).forEach(b => b.addEventListener('click', close));
  box.addEventListener('click', e => { if (e.target === box) close(); });
  $$('.ibmap__door', box).forEach(b => b.addEventListener('click', () => { const d = D.find(x => x.id === b.dataset.door); close(); open(d); }));
  $$('.ibmap__copy', box).forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.link, done = ok => { b.textContent = ok ? 'Copied ✓' : t; setTimeout(() => { b.textContent = 'Copy link'; }, ok ? 1800 : 8000); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => done(true), () => done(false)); else done(false);
  }));
  const first = $('.ibmap__door', box); if (first) first.focus({ preventScroll: true });
  return D;
}
