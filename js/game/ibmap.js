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
   (18 Nov 2026; Daniel, after using the map: "it doesn't necessarily take me to the step where you actually have that
   information … I have to go through all of the steps … and not only that, I have to find it in the text … It should
   be highlighted".) Each door knows where each of its statements is taught (`at`: the steps of a place, by the blocks
   of story.js `course.ib`; the steps of a view, by the tags of its words). A door pressed gives main.js a target
   ({ topic, codes, code }): the door itself, the first step that teaches a statement of the topic; a statement's own
   code, now a button of its own, the step that teaches that statement. main.js and quest.js land there and mark the
   sentence.
   (22 Nov 2026; Daniel, 21 Nov: "when I click, I get the name of the station where I'm going. Many times it's the same
   name … It's not really informative of what I am going to explore … what is that I'm going to observe?"; of the new
   shape: "I suppose it's good as long as you don't overwhelm the students"; his "Yes, B2.1 first".) A topic's window
   now lists its statements, each with a short name; one opens at a time, with a line for each place: what the student
   will see there, then the station and the step (`win`; the names and lines: js/game/mapsee.js, js/ib/mapsee.js,
   js/plant/mapsee.js). The doors themselves (`doors()`), their addresses and the landing are as before.
   ============================================================ */
const R = window.REV, { $, $$, h, esc } = R;
import { level, levelSwitch } from './iblevel.js?v=202611281626';
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
   opened from the map as from their boxes ('coursefilm'). `at`: the steps of the film (from 0) whose own lines carry each
   statement, so that a line of the map opens the film AT that step (28 Nov 2026; tools/ib-level.mjs Q proves the two
   tables against the films' files) */
export const FILMS = {
  copy: { title: 'Film: how a cell copies a gene (the nucleus)', codes: {'A1.2.1': 'sl', 'A1.2.12': 'hl', 'A1.2.13': 'hl', 'A1.2.2': 'sl', 'A1.2.3': 'sl', 'A1.2.4': 'sl', 'A1.2.5': 'sl', 'A1.2.6': 'sl', 'A1.2.7': 'sl', 'A2.2.6': 'sl', 'D1.2.1': 'sl', 'D1.2.12': 'hl', 'D1.2.13': 'hl', 'D1.2.15': 'hl', 'D1.2.2': 'sl', 'D1.2.3': 'sl', 'D1.2.4': 'sl'},
    at: {'A1.2.1': [0], 'A1.2.2': [4], 'A1.2.3': [4], 'A1.2.4': [4], 'A1.2.5': [8], 'A1.2.6': [3, 5], 'A1.2.7': [7], 'A1.2.12': [5], 'A1.2.13': [2], 'A2.2.6': [2], 'D1.2.1': [6], 'D1.2.2': [7], 'D1.2.3': [7], 'D1.2.4': [9], 'D1.2.12': [8], 'D1.2.13': [6], 'D1.2.15': [9, 10, 11, 12]} },
  ribo: { title: 'Film: how a ribosome reads the copy (the ribosomes)', codes: {'A1.2.7': 'sl', 'B1.2.2': 'sl', 'B1.2.4': 'sl', 'D1.2.10': 'sl', 'D1.2.12': 'hl', 'D1.2.17': 'hl', 'D1.2.18': 'hl', 'D1.2.5': 'sl', 'D1.2.6': 'sl', 'D1.2.7': 'sl', 'D1.2.8': 'sl', 'D1.2.9': 'sl'},
    at: {'A1.2.7': [0], 'B1.2.2': [4], 'B1.2.4': [7], 'D1.2.5': [6], 'D1.2.6': [1, 2, 3], 'D1.2.7': [2], 'D1.2.8': [0, 6], 'D1.2.9': [6], 'D1.2.10': [4, 5, 7], 'D1.2.12': [0], 'D1.2.17': [1, 2, 3, 4, 5], 'D1.2.18': [7]} }
};
const TAG = /\[(sl|hl)\s+([A-D]\d\.\d\.\d+(?:\s*,\s*[A-D]\d\.\d\.\d+)*)\]/g;
const tagged = (o, into = {}) => { JSON.stringify(o).replace(TAG, (m, lv, cs) => { cs.split(/\s*,\s*/).forEach(c => { into[c] = into[c] === 'sl' ? 'sl' : lv; }); return m; }); return into; };
const topicOf = c => c.split('.').slice(0, 2).join('.');
/* where each statement stands in a list of steps: { code: [the steps' numbers, from 0] } */
const stepsAt = list => { const at = {}; (Array.isArray(list) ? list : []).forEach((s, i) => Object.keys(tagged(s)).forEach(c => { (at[c] = at[c] || []).push(i); })); return at; };
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
    const C = STORY[id] && STORY[id].course, codes = {}, at = {};
    if (!C || !C.ib) return;
    C.ib.forEach((b, i) => b && b.p.forEach(([lv, code]) => String(code || '').split(/\s*,\s*/).filter(Boolean).forEach(c => { if (lv === 'sl' || lv === 'hl') { codes[c] = codes[c] === 'sl' ? 'sl' : lv; if (!(at[c] = at[c] || []).includes(i)) at[c].push(i); } })));
    out.push({ id, kind: 'place', title: STORY[id].title, codes, at });
  });
  const [M, T] = await Promise.all([import('../membrane/text.js?v=202611281626'), import('../ib/text.js?v=202611281626')]);
  out.push({ id: 'membrane', kind: 'view', title: 'The cell membrane: fluid and mosaic', codes: tagged(M.STEPS), at: stepsAt(M.STEPS) });
  T.CHAPTERS.forEach((c, i) => { const codes = tagged(c); if (Object.keys(codes).length) out.push({ id: 'atp-' + c.id, ci: i, kind: 'view', title: 'From glucose to ATP: ' + c.title.charAt(0).toLowerCase() + c.title.slice(1), codes, at: stepsAt(c.steps) }); });
  /* the insulin path, an Explore of the view (text.js EXPLORE 'x-insulin'): opened at its start */
  const X = T.EXPLORE && T.EXPLORE['x-insulin'];
  if (X) out.push({ id: 'atp-x-insulin', ci: 'x-insulin', kind: 'view', title: 'From glucose to ATP: insulin and its receptor', codes: tagged(X), at: stepsAt(X.steps) });
  Object.entries(FILMS).forEach(([k, f]) => out.push({ id: 'film-' + k, film: k, kind: 'film', title: f.title, codes: Object.assign({}, f.codes), at: f.at }));
  /* the three views of 16 Nov 2026, each read from its own words (js/<view>/text.js STEPS, tagged as the others) */
  for (const [v, title] of [['water', 'Water potential'], ['light', 'From light to glucose'], ['fractionation', 'Cell fractionation lab']]) {
    try { const m = await import('../' + v + '/text.js?v=202611281626');   /* (18 Nov 2026: a quote after the stamp, as tools/stamp.mjs wants it: inside backticks the stamp had stayed at 16 Nov, so a browser could have kept that day's text and the map's steps with it) */
      const codes = tagged(m.STEPS || m); if (Object.keys(codes).length) out.push({ id: v, kind: 'view2', view: v, title, codes, at: stepsAt(m.STEPS) }); }
    catch (e) { /* (a view not on this copy of the site) */ }
  }
  /* the starch test's investigation (js/game/bench.js: its tagged lines) */
  out.push({ id: 'bench', kind: 'bench', title: 'IB investigation: heat and time (the starch test)', codes: { 'B1.2.5': 'sl', 'C1.1.7': 'sl', 'C1.1.8': 'sl', 'C1.1.9': 'sl' }, at: { 'B1.2.5': [0], 'C1.1.7': [0], 'C1.1.8': [1], 'C1.1.9': [1] } });
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
export async function openIBMap({ open, teacher, topic = null }) {
  let box = $('#ibmap');
  if (!box) { box = h('div', { class: 'ibmap', id: 'ibmap', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ibmapT' }); $('#stage').appendChild(box); }
  box.innerHTML = '<div class="ibmap__card"><p class="ibmap__k">IB Biology · Year 12 and 13</p><h2 class="ibmap__t" id="ibmapT">IB map</h2><p class="ibmap__p">Opening…</p></div>';
  box.hidden = false; document.documentElement.classList.add('ibmap-open');
  const D = await doors(), all = {};
  /* what you will see (22 Nov 2026): the statements' names and the game's own lines (mapsee.js), the IB views' and the
     plant cell's (their own files, the same shape). A file that is not on this copy of the site: its doors keep the
     rows they had */
  const SEE = { names: {}, lines: {} };
  for (const f of ['./mapsee.js?v=202611281626', '../ib/mapsee.js?v=202611281626', '../plant/mapsee.js?v=202611281626']) {
    try { const m = await import(f); if (m.NAMES && f[1] === '/') Object.assign(SEE.names, m.NAMES); Object.entries(m.LINES || {}).forEach(([k, v]) => { SEE.lines[k] = Object.assign(SEE.lines[k] || {}, v); }); } catch (e) { /* (not on this copy) */ }
  }
  D.forEach(d => Object.keys(d.codes).forEach(c => { const t = topicOf(c); if (!TOPIC[t]) return; ((all[t] = all[t] || new Map()).get(d) || all[t].set(d, []).get(d)).push(c); }));
  const T = Object.keys(all).sort(codeSort);
  const link = id => location.origin + location.pathname.replace(/index\.html$/, '') + '#ib-' + id;
  /* a topic at the level now: its doors with the statements they show at that level, and how many doors are HL only */
  const at = t => {
    const sl = level() === 'sl', rows = [], codes = new Set(); let hlDoors = 0;
    all[t].forEach((cs, d) => { const keep = cs.filter(c => !sl || d.codes[c] === 'sl').sort(codeSort); if (!keep.length) { hlDoors++; return; } rows.push([d, keep]); keep.forEach(c => codes.add(c)); });
    return { rows, n: codes.size, hlDoors };
  };
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
  /* a topic's window (22 Nov 2026: its STATEMENTS, not its stations; the header of this file has Daniel's words).
     A statement is one line: its code, its short name (mapsee.js NAMES), how many places show it. One statement is open
     at a time; open, it has a line for each place: what the student will see there (the owner's LINES), then, small, the
     station and the step. Three lines at most, the rest behind "More places". A place with no line for the statement
     keeps the row it had: the station's name and its step. A line goes where a code went: to that step, the statement's
     sentence marked. */
  const KORD = { view: 0, view2: 0, place: 1, film: 2, bench: 3, side: 4 }, SHOW = 3;
  let openC = null; const allOf = new Set();
  const stOf = t => {
    const a = at(t), list = [];
    [...new Set(a.rows.flatMap(r => r[1]))].sort(codeSort).forEach(c => {
      /* (an owner's EMPTY list for a statement: "no row for this door here", where a step only points on to the step that
         shows the thing: js/ib/mapsee.js, atp-c0. Never when that would leave the statement with no place at all) */
      const rowsOf = skip => { const ent = [];
        a.rows.forEach(([d, cs]) => {
          if (!cs.includes(c)) return;
          const L = SEE.lines[d.id] && SEE.lines[d.id][c], first = d.at && d.at[c] ? d.at[c][0] : null;
          if (L && L.length) L.forEach(([n, text]) => ent.push({ d, c, i: n - 1, text, first: n - 1 === first }));
          else if (!(skip && L && !L.length)) ent.push({ d, c, i: first, text: '', first: true });
        });
        return ent; };
      let ent = rowsOf(true); if (!ent.length) ent = rowsOf(false);
      ent.sort((x, y) => KORD[x.d.kind] - KORD[y.d.kind] || D.indexOf(x.d) - D.indexOf(y.d) || (x.i || 0) - (y.i || 0));
      list.push({ c, hl: ent.every(e => e.d.codes[c] === 'hl'), ent });
    });
    return { a, list };
  };
  const lineB = e => {
    const st = e.i != null ? 'step ' + (e.i + 1) : '', where = e.text ? esc(e.d.title) + (st ? ' · ' + st : '') : (st || 'opens at its start');
    return `<li class="ibmap__lrow"><button type="button" class="ibmap__line" data-door="${e.d.id}" data-code="${e.c}"${e.i != null && !e.first ? ` data-step="${e.i}"` : ''}><span class="ibmap__see">${esc(e.text || e.d.title)}</span><span class="ibmap__where">${where}</span><span class="ibmap__lgo" aria-hidden="true">→</span></button>${copyB(e.d.id)}</li>`;
  };
  const win = t => {
    const { a, list } = stOf(t), sl = level() === 'sl';
    const hlN = sl ? [...new Set([...all[t].values()].flat())].length - list.length : 0;
    return `<div class="ibmap__wcard" role="dialog" aria-modal="true" aria-labelledby="ibmapW">
      <button type="button" class="close-x ibmap__wx" aria-label="Back to the IB map">×</button>
      <p class="ibmap__k">${t[0]} · ${THEME[t[0]]} · ${ORG[t[1]]}</p>
      <h3 class="ibmap__wt" id="ibmapW"><span>${t}</span> ${esc(TOPIC[t])}</h3>
      <p class="ibmap__p">${list.length ? 'Press a statement to see where the game shows it. Then press a line to go there: the statement\'s sentence is marked in yellow.' : 'This topic is HL only. Your level is SL: you do not need it. To see where the game teaches it, choose HL.'}</p>
      <ul class="ibmap__sts">${list.map(({ c, hl, ent }) => {
        const on = openC === c, more = !allOf.has(c) && ent.length > SHOW, shown = more ? ent.slice(0, SHOW) : ent;
        return `<li class="ibmap__st${on ? ' is-open' : ''}" data-code="${c}"><button type="button" class="ibmap__sb" aria-expanded="${on}" aria-controls="ibst-${c}"><span class="ibl ibl--${hl ? 'hl' : 'sl'}">${c}${hl ? ' HL' : ''}</span><span class="ibmap__sn">${esc(SEE.names[c] || 'Statement ' + c)}</span><span class="ibmap__sm">${ent.length} ${ent.length === 1 ? 'place' : 'places'}</span><span class="ibmap__sv" aria-hidden="true">▾</span></button>`
          + `<ul class="ibmap__lines" id="ibst-${c}"${on ? '' : ' hidden'}>${on ? shown.map(lineB).join('') + (more ? `<li class="ibmap__lrow"><button type="button" class="ibmap__moreb" data-code="${c}">More places (${ent.length - SHOW})</button></li>` : '') : ''}</ul></li>`;
      }).join('')}</ul>
      ${list.length && hlN > 0 ? `<p class="ibmap__more">And ${hlN === 1 ? 'one more statement' : hlN + ' more statements'} for HL only: choose HL to see ${hlN === 1 ? 'it' : 'them'}.</p>` : ''}
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
  const showT = (t, keep) => {
    if (openT !== t && !keep) openC = null;
    openT = t; const w = $('.ibmap__win', box);
    w.innerHTML = win(t); w.hidden = false; R.terms && R.terms(w);
    const f = (keep && $(keep, w)) || $('.ibmap__sb', w) || $('.ibmap__wback', w); if (f) f.focus({ preventScroll: true });
  };
  const hideT = () => {
    const t = openT; openT = null; const w = $('.ibmap__win', box); w.hidden = true; w.innerHTML = '';
    const b = t && $(`.ibmap__topic[data-topic="${t}"]`, box); if (b) b.focus({ preventScroll: true });
  };
  const close = () => { box.hidden = true; openT = null; openC = null; document.documentElement.classList.remove('ibmap-open'); document.removeEventListener('keydown', esc_); document.removeEventListener('iblevel', relevel); box.onclick = null; };
  const esc_ = e => { if (e.key !== 'Escape') return; if (openT) hideT(); else close(); };
  /* the level changed (here, or in another tab): the roadmap and the window drawn again at it */
  const relevel = () => { if (box.hidden) return; const focusT = openT; if (focusT && openC && !stOf(focusT).list.some(x => x.c === openC)) openC = null; draw(); if (focusT) { const w = $('.ibmap__win', box); w.hidden = false; } };
  document.addEventListener('keydown', esc_);
  document.addEventListener('iblevel', relevel);
  draw();
  box.onclick = e => {
    const el = e.target;
    if (el === box || el.closest('.ibmap__x, .ibmap__close')) { close(); return; }
    if (el.classList && el.classList.contains('ibmap__win') || el.closest('.ibmap__wx, .ibmap__wback')) { hideT(); return; }
    const tb = el.closest('.ibmap__topic'); if (tb) { showT(tb.dataset.topic); return; }
    /* a statement: it opens (the one that was open closes), or closes; More places: every line of that statement */
    const sb = el.closest('.ibmap__sb');
    if (sb && openT) { const c = sb.parentNode.dataset.code; openC = openC === c ? null : c; showT(openT, `.ibmap__st[data-code="${c}"] .ibmap__sb`); return; }
    const mb = el.closest('.ibmap__moreb');
    if (mb && openT) { const c = mb.dataset.code, n = SHOW + 1; allOf.add(c); showT(openT, `.ibmap__st[data-code="${c}"] .ibmap__lrow:nth-child(${n}) .ibmap__line`); return; }
    /* a statement's code, or the door itself: the target says which topic the pupil came from, which of its statements this door shows at the level now, and the one pressed */
    /* a line: the target says which topic the pupil came from, which of its statements this door shows at the level now,
       the statement of the line, and its step when that is not the first step that teaches it */
    const db = el.closest('.ibmap__line');
    if (db) { const d = D.find(x => x.id === db.dataset.door), t = openT, row = t && at(t).rows.find(r => r[0] === d);
      close(); open(d, t ? Object.assign({ topic: t, name: TOPIC[t], codes: row ? row[1] : [], code: db.dataset.code }, db.dataset.step != null ? { step: +db.dataset.step } : {}) : null); return; }
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
