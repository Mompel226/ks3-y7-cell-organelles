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
import { level, levelSwitch } from './iblevel.js?v=202611162123';
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
  const [M, T] = await Promise.all([import('../membrane/text.js?v=202611162123'), import('../ib/text.js?v=202611162123')]);
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
  out.push({ id: 'plant', kind: 'side', title: 'The plant cell: from light to glucose, starch, water', codes: Object.assign({}, PLANT) });
  return out;
}

/* the map (16 Nov 2026; Daniel, the first time he opened it: "it's overwhelming. You cannot collapse the units and then
   everything shows up and it's a scroll after scroll after scroll to reach the end … As a student, I would be
   overwhelmed … It doesn't need to be a list. It could be just a pop-up window with different buttons that opens"; and
   "there is no SL HL toggle"). Before, one long list: every topic, and under it every door with its statements.
   Now the guide's own roadmap, which IB students know from their course: the four themes across (A Unity and diversity,
   B Form and function, C Interaction and interdependence, D Continuity and change), the four levels of organisation down
   (1 Molecules, 2 Cells, 3 Organisms, 4 Ecosystems), and in each square a button for each topic this game teaches.
   A topic's button opens its own small window: the places and views that teach it, each a door with its statements,
   and Back to the roadmap. On a phone the roadmap is read by level of organisation, the topics in rows.
   The IB level (js/game/iblevel.js) is at the top: at SL the map shows only the SL statements, a door that shows only HL
   statements of a topic is left out (the window says how many), and a topic with no SL statement is marked HL only.
   A teacher has a Copy link on each door, and one for each topic (#ib-b2.2: the map, open at that topic). */
const THEME = { A: 'Unity and diversity', B: 'Form and function', C: 'Interaction and interdependence', D: 'Continuity and change' };
const ORG = { 1: 'Molecules', 2: 'Cells', 3: 'Organisms', 4: 'Ecosystems' };
/* a topic's window groups its doors by kind, in this order */
const GROUPS = [['place', 'Places in the cell'], ['view', 'IB views'], ['film', 'Films'], ['bench', 'Investigation'], ['side', 'Side quest']];
const kindOf = d => d.kind === 'view2' ? 'view' : d.kind;
export async function openIBMap({ open, teacher, topic = null }) {
  let box = $('#ibmap');
  if (!box) { box = h('div', { class: 'ibmap', id: 'ibmap', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ibmapT' }); $('#stage').appendChild(box); }
  box.innerHTML = '<div class="ibmap__card"><p class="ibmap__k">IB Biology · Year 12 and 13</p><h2 class="ibmap__t" id="ibmapT">IB map</h2><p class="ibmap__p">Opening…</p></div>';
  box.hidden = false; document.documentElement.classList.add('ibmap-open');
  const D = await doors(), all = {};
  D.forEach(d => Object.keys(d.codes).forEach(c => { const t = topicOf(c); if (!TOPIC[t]) return; ((all[t] = all[t] || new Map()).get(d) || all[t].set(d, []).get(d)).push(c); }));
  const T = Object.keys(all).sort(codeSort);
  const link = id => location.origin + location.pathname.replace(/index\.html$/, '') + '#ib-' + id;
  /* a topic at the level now: its doors with the statements they show at that level, and how many doors are HL only */
  const at = t => {
    const sl = level() === 'sl', rows = [], codes = new Set(); let hlDoors = 0;
    all[t].forEach((cs, d) => { const keep = cs.filter(c => !sl || d.codes[c] === 'sl').sort(codeSort); if (!keep.length) { hlDoors++; return; } rows.push([d, keep]); keep.forEach(c => codes.add(c)); });
    return { rows, n: codes.size, hlDoors };
  };
  const chip = (d, c) => `<span class="ibl ibl--${d.codes[c]}">${c}${d.codes[c] === 'hl' ? ' HL' : ''}</span>`;
  const copyB = (id, what) => teacher ? `<button type="button" class="ibmap__copy" data-link="${esc(link(id))}">Copy link${what ? ' ' + what : ''}</button>` : '';
  const topicBtn = t => {
    const a = at(t), hlo = !a.n;
    return `<button type="button" class="ibmap__topic${hlo ? ' is-hlo' : ''}" data-topic="${t}"><b>${t}</b><span class="ibmap__tn">${esc(TOPIC[t])}</span><span class="ibmap__tm" aria-label="${hlo ? 'HL only' : a.n + (a.n === 1 ? ' statement' : ' statements')}">${hlo ? 'HL' : a.n}</span></button>`;
  };
  const road = () => {
    const lv = [...new Set(T.map(t => t[1]))].sort();
    return `<div class="ibmap__road" style="--rows:${lv.length}"><span class="ibmap__corner" aria-hidden="true"></span>`
      + Object.keys(THEME).map(k => `<p class="ibmap__th"><b>${k}</b> ${THEME[k]}</p>`).join('')
      + lv.map(n => `<div class="ibmap__r"><p class="ibmap__lv"><b>${n}</b> ${ORG[n]}</p>`
        + Object.keys(THEME).map(k => `<div class="ibmap__cell" data-th="${k}" aria-label="${k} ${THEME[k]}, ${ORG[n]}">${T.filter(t => t[0] === k && t[1] === n).map(topicBtn).join('')}</div>`).join('') + '</div>').join('')
      + '</div>';
  };
  const win = t => {
    const a = at(t);
    return `<div class="ibmap__wcard" role="dialog" aria-modal="true" aria-labelledby="ibmapW">
      <button type="button" class="close-x ibmap__wx" aria-label="Back to the IB map">×</button>
      <p class="ibmap__k">${t[0]} · ${THEME[t[0]]} · ${ORG[t[1]]}</p>
      <h3 class="ibmap__wt" id="ibmapW"><span>${t}</span> ${esc(TOPIC[t])}</h3>
      <p class="ibmap__p">${a.rows.length ? 'Where this game teaches it. Press one to go there.' : 'This topic is HL only. Your level is SL: you do not need it. To see where the game teaches it, choose HL.'}</p>
      ${GROUPS.map(([k, name]) => { const rs = a.rows.filter(([d]) => kindOf(d) === k); return rs.length ? `<section class="ibmap__grp"><h4 class="ibmap__gk">${name}</h4><ul class="ibmap__doors">${rs.map(([d, cs]) => `<li class="ibmap__row"><button type="button" class="ibmap__door" data-door="${d.id}"><span class="ibmap__dt">${esc(d.title)}</span><span class="ibmap__go" aria-hidden="true">→</span><span class="ibmap__codes">${cs.map(c => chip(d, c)).join(' ')}</span></button>${copyB(d.id)}</li>`).join('')}</ul></section>` : ''; }).join('')}
      ${a.rows.length && a.hlDoors ? `<p class="ibmap__more">And ${a.hlDoors === 1 ? 'one more part of the game' : a.hlDoors + ' more parts of the game'} for HL only: choose HL to see ${a.hlDoors === 1 ? 'it' : 'them'}.</p>` : ''}
      <div class="ibmap__wend">${copyB(t.toLowerCase(), 'to this topic')}<button type="button" class="btn ghost ibmap__wback">← All topics</button></div>
    </div>`;
  };
  let openT = null;
  const draw = () => {
    box.innerHTML = `<div class="ibmap__card">
        <button type="button" class="close-x ibmap__x" aria-label="Close the IB map">×</button>
        <p class="ibmap__k">IB Biology · Year 12 and 13</p>
        <div class="ibmap__head"><h2 class="ibmap__t" id="ibmapT">IB map</h2>${levelSwitch()}</div>
        <p class="ibmap__p">The IB topics this game teaches, in the guide's own roadmap. Press a topic to see where the game teaches it. The number on a topic: how many of its statements the game shows.</p>
        ${teacher ? '<p class="ibmap__p ibmap__p--t">Teacher: each topic and each place or view has its own address. Copy it for a slide or for Google Classroom: a Year 12 or 13 student who is signed in goes straight there.</p>' : ''}
        ${road()}
        <div class="ibmap__end"><p class="ibmap__key"><span class="ibl ibl--sl">SL</span> for SL and HL <span class="ibl ibl--hl">HL</span> for HL only</p><button type="button" class="btn ibmap__close">Back to the game</button></div>
      </div>
      <div class="ibmap__win"${openT ? '' : ' hidden'}>${openT ? win(openT) : ''}</div>`;
    R.terms && R.terms(box);
  };
  const showT = t => {
    openT = t; const w = $('.ibmap__win', box);
    w.innerHTML = win(t); w.hidden = false; R.terms && R.terms(w);
    const f = $('.ibmap__door', w) || $('.ibmap__wback', w); if (f) f.focus({ preventScroll: true });
  };
  const hideT = () => {
    const t = openT; openT = null; const w = $('.ibmap__win', box); w.hidden = true; w.innerHTML = '';
    const b = t && $(`.ibmap__topic[data-topic="${t}"]`, box); if (b) b.focus({ preventScroll: true });
  };
  const close = () => { box.hidden = true; openT = null; document.documentElement.classList.remove('ibmap-open'); document.removeEventListener('keydown', esc_); document.removeEventListener('iblevel', relevel); box.onclick = null; };
  const esc_ = e => { if (e.key !== 'Escape') return; if (openT) hideT(); else close(); };
  /* the level changed (here, or in another tab): the roadmap and the window drawn again at it */
  const relevel = () => { if (box.hidden) return; const focusT = openT; draw(); if (focusT) { const w = $('.ibmap__win', box); w.hidden = false; } };
  document.addEventListener('keydown', esc_);
  document.addEventListener('iblevel', relevel);
  draw();
  box.onclick = e => {
    const el = e.target;
    if (el === box || el.closest('.ibmap__x, .ibmap__close')) { close(); return; }
    if (el.classList && el.classList.contains('ibmap__win') || el.closest('.ibmap__wx, .ibmap__wback')) { hideT(); return; }
    const tb = el.closest('.ibmap__topic'); if (tb) { showT(tb.dataset.topic); return; }
    const db = el.closest('.ibmap__door'); if (db) { const d = D.find(x => x.id === db.dataset.door); close(); open(d); return; }
    const cb = el.closest('.ibmap__copy');
    if (cb) {
      const t = cb.dataset.link, was = cb.textContent, done = ok => { cb.textContent = ok ? 'Copied ✓' : t; setTimeout(() => { cb.textContent = was; }, ok ? 1800 : 8000); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => done(true), () => done(false)); else done(false);
    }
  };
  if (topic && all[topic]) showT(topic);
  else { const first = $('.ibmap__topic', box); if (first) first.focus({ preventScroll: true }); }
  return D;
}
