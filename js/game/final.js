/* ============================================================
   final.js — the final check of the Y7 cell game (4 Nov 2026).
   Daniel, 4 Nov 2026: "after they have completed the journey and they know how everything works, they should get a
   unique code. With that unique code, they can then start the final check … about 15 minutes … that final score will
   then determine if they have understood the journey". His yes to the plan: 20 questions, 30 marks (12 with one right
   answer, 4 "choose every right answer", 2 "label the cell" with six names each, 1 order, 1 sort), all new, no help,
   nothing marked until the end, one go; the pupil sees the score and which questions were not right, never the answers;
   his board gets every answer, the score and the time.
   Since 12 Nov 2026 (Daniel: "four for the plants, one for IB … 25 questions in total"): 25 questions, 35 marks. The last
   five carry a `tag`: 'side' (the side quest, the plant cell) and 'x' (Explorer, beyond the Year 7 list); the page prints
   it beside the question's number, and the first card says which questions they are.
   - The code: CELL- and four letters or digits, made from who the pupil is (the email they are signed in with, or this
     browser's own number when signed out), so a friend's code does not work here. It shows at the end of the journey (the
     win card of "Does your amylase work?", main.js); the Final check, last in the list of places, asks for it.
   - The questions come from js/final-data.js (tools/make-final.mjs): each right answer is only a scrambled fingerprint
     (SHA-256 of a salt, the question's id and the answer), so the page marks by making the same fingerprint and a pupil
     cannot read the answers out of the page. Options, names and cards are shown in an order of the pupil's own.
   - Answers are kept as the pupil works (a reload goes back to the same question); nothing is marked until Finish; once
     started, the check stays on the screen until it is finished (the game, which shows the answers, is under it).
   - One go: kept in this browser under cellfinal.* (↺ Start again keeps it) and, signed in, in the teacher's record, so
     another computer does not open it again. Each mark is one square on the board (js/core.js lists them, part 13);
     "fc-begin" is when it started.
   - Started on one computer and not finished (12 Nov 2026; Daniel: "fix any gaps in the code"): signed in, the start is
     in the teacher's record (fc-begin), so on any other computer, or in this browser after its data was removed, the
     check opens by itself and continues, with no code and no way back to the game, which shows the answers. The answers
     given before are not there (they are kept only in the browser they were given in); the time is counted from the
     first start. Before, the pupil could read the questions on one computer, play the game on another and start there.
   ============================================================ */
const R = window.REV, { $, $$, h, esc } = R;
const F = window.FINAL || null;
const J = ' ¦ ', KEY = 'cellfinal.', PEPPER = 'y7-cell-final';
const st = {
  get(k, d) { try { const v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { if (v == null) localStorage.removeItem(KEY + k); else localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* private window */ } }
};
const enc = new TextEncoder();
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', enc.encode(s)); return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join(''); }

/* ---------- who the pupil is, and their code ---------- */
const CFG = window.PRACTICAL_CONFIG || {};
const syncOn = () => !!(CFG.submitUrl && CFG.googleClientId && window.SignIn);
function email() { try { const w = window.SignIn && window.SignIn.who && window.SignIn.who(); return w && w.email ? String(w.email).trim().toLowerCase() : ''; } catch (e) { return ''; } }
function browserId() {
  let id = st.get('id', '');
  if (!id) { id = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, '0')).join(''); st.set('id', id); }
  return id;
}
const me = () => email() ? 'e:' + email() : 'b:' + browserId();
const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';               /* no 0 and O, no 1, I and L: they look alike */
async function codeOf(who) {
  const x = await sha(PEPPER + '|' + who); let n = parseInt(x.slice(0, 12), 16), s = '';
  for (let i = 0; i < 4; i++) { s += ABC[n % ABC.length]; n = Math.floor(n / ABC.length); }
  return 'CELL-' + s;
}
/* the code the end of the journey shows: the email's when signed in (it works on any computer they sign in on) */
export function finalCode() { return codeOf(me()); }
const tidy = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^CELL/, '');
async function codeIsMine(typed) {
  const t = tidy(typed); if (t.length !== 4) return false;
  const mine = [await codeOf('b:' + browserId())]; if (email()) mine.push(await codeOf('e:' + email()));
  return mine.some(c => tidy(c) === t);
}

/* ---------- the squares of the board: label questions have one per number ---------- */
const squares = q => q.kind === 'label' ? q.h.map((_, i) => q.id + '-' + (i + 1)) : [q.id];
function record() { try { return (window.Lesson && window.Lesson.record ? window.Lesson.record().q : {}) || {}; } catch (e) { return {}; } }
/* done here (with its result), or on another computer (the teacher's record has its squares) */
function finished() {
  const all = st.get('done', {}) || {}, d = all[me()] || all['b:' + browserId()]; if (d) return d;   /* done signed out, now signed in */
  const q = record();
  return F && F.qs.some(x => squares(x).some(id => q[id] && q[id].r && q[id].r.length)) ? { elsewhere: 1 } : null;
}

/* started, on this computer or another: when (fc-begin in the record; 0: not started) */
function begun() {
  const b = record()['fc-begin'], r = b && Array.isArray(b.r) ? b.r.filter(x => x && x.c > 0) : [];
  return r.length ? (Math.min(...r.map(x => x.a || x.z || 0)) * 1000 || Date.now()) : 0;
}
/* started and not finished, and this browser does not hold the work: it continues here (signed in only: the record is theirs) */
const elsewhere = () => !!(F && email() && !work() && !finished() && begun());

/* ---------- the pupil's work: their answers and their own order of every list ---------- */
let W = null, box = null, svgText = null, cur = 0;
function rng(seed) { let x = 0; for (let i = 0; i < seed.length; i++) x = (Math.imul(x, 31) + seed.charCodeAt(i)) | 0; x = x || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
function mix(n, seed) { const r = rng(seed), a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
async function newWork() {
  const w = { me: me(), t0: Date.now(), i: 0, a: {}, ord: {}, moved: {} };
  for (const q of F.qs) {
    const n = (q.opts || q.names || q.items).length;
    let o = mix(n, w.me + '|' + q.id), k = 0;
    /* an order question never starts in the right order (the page can test an order against its fingerprint) */
    while (q.kind === 'order' && k++ < 20 && await sha(`${F.salt}|${q.id}|${o.map(i => q.items[i]).join(J)}`) === q.h) o = mix(n, w.me + '|' + q.id + '|' + k);
    w.ord[q.id] = o;
  }
  return w;
}
const work = () => { const w = st.get('work', null); return w && w.me === me() && w.ord ? w : null; };
const save = () => st.set('work', W);
function answered(q) {
  const a = W.a[q.id];
  if (q.kind === 'one') return a != null ? 2 : 0;
  if (q.kind === 'all') return a && a.length ? 2 : 0;
  if (q.kind === 'label') { const n = Object.keys(a || {}).length; return n === q.h.length ? 2 : n ? 1 : 0; }
  if (q.kind === 'order') return W.moved[q.id] ? 2 : 0;
  if (q.kind === 'sort') { const n = Object.keys(a || {}).length; return n === q.items.length ? 2 : n ? 1 : 0; }
  return 0;
}
const marksOf = q => q.kind === 'label' ? q.h.length : 1;

/* a question's tag, as the pupil reads it (js/final-data.js `tag`): the side quest, or Explorer */
const TAGS = { side: 'Side quest · the plant cell', x: 'Explorer · beyond the Year 7 list' };
const tagOf = q => q.tag && TAGS[q.tag] ? `<span class="fc__tag fc__tag--${q.tag}">${TAGS[q.tag]}</span>` : '';
/* "21 to 24", "25", "3, 7 and 9": the numbers of the questions with a tag */
function numsOf(tag) {
  const n = F.qs.map((q, k) => q.tag === tag ? k + 1 : 0).filter(Boolean); if (!n.length) return '';
  const run = n.every((x, i) => !i || x === n[i - 1] + 1);
  return n.length === 1 ? String(n[0]) : run ? `${n[0]} to ${n[n.length - 1]}` : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
}
function tagFacts() {
  const s = numsOf('side'), x = numsOf('x'), many = v => / |,/.test(v);
  return (s ? `<li>Question${many(s) ? 's' : ''} ${s} ${many(s) ? 'are' : 'is'} about the <b>side quest</b>: the plant cell.</li>` : '') +
    (x ? `<li>Question${many(x) ? 's' : ''} ${x} ${many(x) ? 'are' : 'is'} for <b>Explorers</b>: beyond the Year 7 list.</li>` : '');
}

/* ---------- the layer over the page ---------- */
function layer() {
  if (!box) { box = $('#final'); }
  box.hidden = false; document.documentElement.classList.add('is-final');
  return box;
}
function close() { if (!box) return; box.hidden = true; box.innerHTML = ''; document.documentElement.classList.remove('is-final'); document.dispatchEvent(new Event('final-closed')); }
const focusTop = () => { const t = $('[data-first]', box); if (t) t.focus({ preventScroll: true }); box.scrollTop = 0; };
function card(html) {
  layer().innerHTML = `<div class="fc fc--card" role="dialog" aria-modal="true" aria-labelledby="fcH">${html}</div>`;
  focusTop();
}
const fmtList = ns => ns.length === 1 ? String(ns[0]) : ns.slice(0, -1).join(', ') + ' and ' + ns[ns.length - 1];

/* ---------- 1. the start: what it is, and the code ---------- */
export async function openFinal(opts = {}) {
  if (!F || !window.crypto || !crypto.subtle) {
    card(`<p class="fc__eyebrow">Final check</p><h2 id="fcH" tabindex="-1" data-first>This computer cannot open the final check</h2><p>Try another browser (Chrome, Edge or Safari).</p><div class="fc__acts"><button type="button" class="btn" data-close>Back to the cell</button></div>`);
    $('[data-close]', box).addEventListener('click', close); return;
  }
  const done = finished();
  if (done) return result(done);
  const w = work();
  if (w) { W = w; return question(W.i || 0); }            /* started: straight back to the question they were on */
  if (elsewhere()) return carryOn();                      /* started on another computer: it continues here */
  const needSign = syncOn() && !email();
  card(`<p class="fc__eyebrow">Final check</p>
    <h2 id="fcH" tabindex="-1" data-first>Show what you learned on your journey</h2>
    <ul class="fc__facts">
      <li><b>${F.qs.length} questions, ${F.marks} marks.</b> It takes about 15 minutes.</li>
      ${tagFacts()}
      <li>No hints, no word bank: nothing is marked until you finish.</li>
      <li>You have <b>one go</b>. When you start, the questions stay on the screen until you finish.</li>
      <li>At the end you see your score and which questions were not right.</li>
    </ul>
    ${needSign ? `<p class="fc__warn"><b>Sign in first</b> with your school Google account, at the top of this page. Your teacher receives your result only when you are signed in.</p>
      <div class="fc__acts"><button type="button" class="btn" data-close>Back to the cell</button></div>` :
    `<label class="fc__lbl" for="fcCode">Type your code from the end of your journey</label>
      <div class="fc__code"><input id="fcCode" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" placeholder="CELL-····">
      <button type="button" class="btn" data-start>Start the final check</button></div>
      <p class="fc__say" role="status" aria-live="polite"></p>
      <div class="fc__acts"><button type="button" class="btn ghost" data-close>Back to the cell</button></div>`}`);
  $('[data-close]', box).addEventListener('click', close);
  const go = $('[data-start]', box); if (!go) return;
  const input = $('#fcCode', box), say = $('.fc__say', box);
  if (opts.focusCode) input.focus();
  const tryIt = async () => {
    if (!(await codeIsMine(input.value))) {
      const journey = R.store.get('state', {}) && (R.store.get('state', {}).done || {}).test;
      say.className = 'fc__say no';
      say.textContent = tidy(input.value).length !== 4 ? 'A code is CELL- and four letters or numbers.' :
        journey ? 'This is not your code. Type the code from the end of your journey.' : 'This is not your code. You get your code when you finish the journey.';
      return;
    }
    go.disabled = true;
    W = await newWork(); save();
    R.L.done('fc-begin');
    question(0);
  };
  go.addEventListener('click', tryIt);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); tryIt(); } });
}

/* started before, and this browser has none of it: one card, then the questions (no code: it was given at the start; no
   way back to the game) */
function carryOn() {
  card(`<p class="fc__eyebrow">Final check</p><h2 id="fcH" tabindex="-1" data-first>You have already started the final check</h2>
    <p>You have <b>one go</b>, so the final check continues here.</p>
    <p>The answers that you gave before are not on this computer: answer every question here.</p>
    <div class="fc__acts"><button type="button" class="btn" data-carry>Continue the final check</button></div>`);
  $('[data-carry]', box).addEventListener('click', async e => {
    e.currentTarget.disabled = true;
    const t0 = begun(); W = await newWork(); if (t0) W.t0 = Math.min(t0, W.t0); W.carried = 1; save();
    question(0);
  });
}
/* the record comes back a moment after the page opens (js/lesson.js asks for it at sign-in): from then on a check that
   was started on another computer is open here too */
const watch = setInterval(() => {
  if (!F || finished()) return clearInterval(watch);
  if (!window.READY || (window.HOWTO && !window.HOWTO.done) || (box && !box.hidden)) return;
  if (elsewhere()) openFinal();
}, 3000);

/* ---------- 2. a question, one at a time ---------- */
function question(i) {
  cur = Math.max(0, Math.min(F.qs.length - 1, i)); W.i = cur; save();
  const q = F.qs[cur], last = cur === F.qs.length - 1, mk = marksOf(q);
  layer().innerHTML = `<div class="fc fc--q" role="dialog" aria-modal="true" aria-labelledby="fcH">
    <div class="fc__bar"><b>Final check</b><span class="fc__n">Question ${cur + 1} of ${F.qs.length}</span>${tagOf(q)}<span class="fc__mk">${mk} mark${mk > 1 ? 's' : ''}</span></div>
    <nav class="fc__dots" aria-label="Questions">${F.qs.map((x, k) => { const s = answered(x); return `<button type="button" data-k="${k}" class="${s === 2 ? 'is-done' : s ? 'is-part' : ''}${k === cur ? ' is-cur' : ''}" aria-label="Question ${k + 1}${s === 2 ? ', answered' : s ? ', partly answered' : ''}"${k === cur ? ' aria-current="step"' : ''}>${k + 1}</button>`; }).join('')}</nav>
    <section class="fc__q"><h2 id="fcH" class="fc__stem" tabindex="-1" data-first>${q.stem}</h2><div class="fc__a"></div></section>
    <div class="fc__nav"><button type="button" class="btn ghost" data-back ${cur ? '' : 'disabled'}>← Back</button>
      ${last ? '<button type="button" class="btn" data-finish>Finish</button>' : '<button type="button" class="btn" data-next>Next →</button>'}</div>
  </div>`;
  const a = $('.fc__a', box);
  ({ one: drawOne, all: drawAll, label: drawLabel, order: drawOrder, sort: drawSort })[q.kind](a, q);
  $$('.fc__dots button', box).forEach(b => b.addEventListener('click', () => question(+b.dataset.k)));
  $('[data-back]', box).addEventListener('click', () => question(cur - 1));
  const nx = $('[data-next]', box); if (nx) nx.addEventListener('click', () => question(cur + 1));
  const fin = $('[data-finish]', box); if (fin) fin.addEventListener('click', confirmFinish);
  focusTop();
}
/* after each answer: the dots say which are answered, and the work is kept */
function changed(q) {
  save();
  const s = answered(q), b = $(`.fc__dots button[data-k="${F.qs.indexOf(q)}"]`, box);
  if (b) { b.classList.toggle('is-done', s === 2); b.classList.toggle('is-part', s === 1); b.setAttribute('aria-label', `Question ${F.qs.indexOf(q) + 1}${s === 2 ? ', answered' : s ? ', partly answered' : ''}`); }
}

/* one right answer: press one option */
function drawOne(a, q) {
  const ord = W.ord[q.id];
  a.innerHTML = `<ul class="opts fc-opts">${ord.map((oi, k) => `<li><button type="button" data-o="${oi}" aria-pressed="${W.a[q.id] === oi}"><span class="lt">${'ABCDE'[k]}</span><span>${esc(q.opts[oi])}</span></button></li>`).join('')}</ul>`;
  $$('button', a).forEach(b => b.addEventListener('click', () => {
    W.a[q.id] = +b.dataset.o; $$('button', a).forEach(x => x.setAttribute('aria-pressed', String(x === b))); changed(q);
  }));
}
/* choose every right answer: each option on or off */
function drawAll(a, q) {
  const ord = W.ord[q.id], on = () => new Set(W.a[q.id] || []);
  a.innerHTML = `<p class="fc__hint">You can choose more than one.</p><ul class="opts fc-opts fc-opts--all">${ord.map(oi => `<li><button type="button" data-o="${oi}" aria-pressed="${on().has(oi)}"><span class="lt" aria-hidden="true"></span><span>${esc(q.opts[oi])}</span></button></li>`).join('')}</ul>`;
  $$('button', a).forEach(b => b.addEventListener('click', () => {
    const s = on(), oi = +b.dataset.o; if (s.has(oi)) s.delete(oi); else s.add(oi);
    W.a[q.id] = Array.from(s).sort((x, y) => x - y); b.setAttribute('aria-pressed', String(s.has(oi))); changed(q);
  }));
}
/* press = choose; press and move = drag (mouse, pen or finger): the checks' own way (js/checks.js) */
function dragify(chips, onTap, onDrop) {
  chips.forEach(c => {
    c.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      const x0 = e.clientX, y0 = e.clientY; let ghost = null;
      const move = ev => {
        if (!ghost && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 7) { ghost = c.cloneNode(true); ghost.classList.add('ghost'); document.body.appendChild(ghost); c.classList.add('dragging'); }
        if (ghost) { ghost.style.left = (ev.clientX - ghost.offsetWidth / 2) + 'px'; ghost.style.top = (ev.clientY - ghost.offsetHeight / 2) + 'px'; }
      };
      const up = ev => {
        removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        if (ghost) { ghost.remove(); c.classList.remove('dragging'); onDrop(c, document.elementFromPoint(ev.clientX, ev.clientY)); c._dragged = true; setTimeout(() => { c._dragged = false; }, 0); }
      };
      addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    });
    c.addEventListener('click', e => { e.stopPropagation(); if (!c._dragged) onTap(c); });
  });
}
/* cards into places (a label's numbers, a sort's boxes): press a card, then its place; or drag it there */
function placer(a, q, opts) {
  const { items, places, many, key } = opts;              /* key: where the answer is kept, W.a[q.id][item] = place */
  const A = () => (W.a[q.id] = W.a[q.id] || {});
  const chips = items.map((t, i) => h('button', { type: 'button', class: 'chip', 'data-i': i, 'aria-label': t }, esc(t)));
  let sel = null;
  const tray = $('.tray', a), where = p => $(`[data-p="${p}"] .in`, a);
  function layout() {
    const pl = A();
    W.ord[q.id].forEach(i => { const p = key(pl, i); (p == null ? tray : where(p)).appendChild(chips[i]); });
    $$('[data-p]', a).forEach(s => s.classList.toggle('is-full', !!$('.chip', s)));
  }
  function select(c) {
    if (sel) sel.classList.remove('sel'); sel = (sel === c) ? null : c; if (sel) sel.classList.add('sel');
    $$('[data-p]', a).forEach(s => s.classList.toggle('target', !!sel));
  }
  function put(c, p) {
    const i = +c.dataset.i, pl = A();
    if (p == null) opts.clear(pl, i); else opts.set(pl, i, p);
    if (sel) sel.classList.remove('sel'); sel = null; $$('[data-p]', a).forEach(s => s.classList.remove('target'));
    layout(); changed(q);
  }
  $$('[data-p]', a).forEach(s => {
    const go = () => { if (sel) put(sel, s.dataset.p); };
    s.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c && c !== sel) return; go(); });
    s.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.chip')) { e.preventDefault(); go(); } });
  });
  tray.addEventListener('click', e => { if (sel && !e.target.closest('.chip')) put(sel, null); });
  dragify(chips, select, (c, target) => { const s = target && target.closest('[data-p]'); if (s && a.contains(s)) put(c, s.dataset.p); else if (target && target.closest('.tray') === tray) put(c, null); });
  layout();
  return { many };
}
/* label the cell: six names on six numbers */
async function drawLabel(a, q) {
  a.innerHTML = `<div class="fc-lab"><figure class="fc-lab__pic" data-pins="${esc(q.pins)}"><div class="fc-lab__svg" aria-hidden="false"></div>
      <figcaption>One cell of a salivary gland, cut through from its top (by the duct) to its base.</figcaption></figure>
    <div class="fc-lab__side"><p class="fc__hint">Press a name, then its number. Or drag it.</p>
      <div class="tray" aria-label="Names to place"></div>
      <ol class="fc-slots">${q.h.map((_, k) => `<li><span class="n">${k + 1}</span><div class="fc-slot" data-p="${k + 1}" role="button" tabindex="0" aria-label="Number ${k + 1}"><span class="in"></span><span class="fc-slot__e">empty</span></div></li>`).join('')}</ol></div></div>`;
  placer(a, q, {
    items: q.names, places: q.h.length,
    key: (pl, i) => { const p = Object.keys(pl).find(k => pl[k] === i); return p == null ? null : p; },
    set: (pl, i, p) => { const was = Object.keys(pl).find(k => pl[k] === i); if (was != null) delete pl[was]; pl[p] = i; },   /* a number holds one name: the one there goes back */
    clear: (pl, i) => { const was = Object.keys(pl).find(k => pl[k] === i); if (was != null) delete pl[was]; }
  });
  if (svgText == null) { try { svgText = await (await fetch('img/final/cell.svg?v=202611141733')).text(); } catch (e) { svgText = ''; } }
  const s = $('.fc-lab__svg', a); if (s) s.innerHTML = svgText || '<p>The drawing could not load: check the connection, then go to another question and back.</p>';
}
/* put in order: the numbers are places and stay; only the card moves (the estate's rule, 21 Oct 2026) */
function drawOrder(a, q) {
  a.innerHTML = '<ol class="order fc-order"></ol>';
  const ol = $('ol', a);
  const ord = () => W.a[q.id] || W.ord[q.id];
  function draw(moved) {
    const was = {}; $$('.oc', ol).forEach(c => { was[c.dataset.i] = c.getBoundingClientRect().top; });
    const o = ord(); ol.innerHTML = '';
    o.forEach((oi, k) => {
      const li = h('li', null, `<span class="n">${k + 1}</span><span class="oc" data-i="${oi}"><span class="tx">${esc(q.items[oi])}</span><span class="mv"><button type="button" aria-label="Move up" ${k === 0 ? 'disabled' : ''}>↑</button><button type="button" aria-label="Move down" ${k === o.length - 1 ? 'disabled' : ''}>↓</button></span></span>`);
      ol.appendChild(li);
      const [up, dn] = $$('.mv button', li);
      up.addEventListener('click', () => { swap(k, k - 1); const b = $$('.mv button', ol)[(k - 1) * 2]; if (b && !b.disabled) b.focus(); });
      dn.addEventListener('click', () => { swap(k, k + 1); const b = $$('.mv button', ol)[(k + 1) * 2 + 1]; if (b && !b.disabled) b.focus(); });
    });
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    $$('.oc', ol).forEach(c => {
      const dy = was[c.dataset.i] != null ? was[c.dataset.i] - c.getBoundingClientRect().top : 0;
      if (dy && c.animate && !still) c.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 200, easing: 'ease-out' });
      if (c.dataset.i === String(moved)) { c.classList.add('is-moved'); setTimeout(() => c.classList.remove('is-moved'), 900); }
    });
  }
  function swap(x, y) { const o = ord().slice(); if (y < 0 || y >= o.length) return; const m = o[x]; [o[x], o[y]] = [o[y], o[x]]; W.a[q.id] = o; W.moved[q.id] = 1; changed(q); draw(m); }
  draw();
}
/* sort into boxes */
function drawSort(a, q) {
  a.innerHTML = `<p class="fc__hint">Press a card, then its box. Or drag it.</p><div class="tray" aria-label="Cards to sort"></div>
    <div class="bins" style="--n:${q.bins.length}">${q.bins.map((b, k) => `<div class="bin" data-p="${k}" role="button" tabindex="0" aria-label="Put the chosen card in: ${esc(b)}"><h4>${esc(b)}</h4><div class="in"></div></div>`).join('')}</div>`;
  placer(a, q, {
    items: q.items, places: q.bins.length, many: true,
    key: (pl, i) => pl[i] == null ? null : pl[i],
    set: (pl, i, p) => { pl[i] = +p; },
    clear: (pl, i) => { delete pl[i]; }
  });
}

/* ---------- 3. finish: say what is not answered, then mark ---------- */
function confirmFinish() {
  const open = F.qs.map((q, k) => answered(q) === 2 ? null : k + 1).filter(Boolean);
  card(`<p class="fc__eyebrow">Final check</p><h2 id="fcH" tabindex="-1" data-first>Finish the final check?</h2>
    ${open.length ? `<p>You have answered ${F.qs.length - open.length} of ${F.qs.length} questions. Not answered yet: question${open.length > 1 ? 's' : ''} ${fmtList(open)}.</p>` : '<p>You have answered every question.</p>'}
    <p>After you finish, you cannot change your answers.</p>
    <div class="fc__acts"><button type="button" class="btn ghost" data-back>${open.length ? 'Go to question ' + open[0] : 'Go back to the questions'}</button><button type="button" class="btn" data-finish>Finish now</button></div>`);
  $('[data-back]', box).addEventListener('click', () => question(open.length ? open[0] - 1 : cur));
  $('[data-finish]', box).addEventListener('click', e => { e.target.disabled = true; finish(); });
}
/* mark one question: its marks, and each square's record for the board (what the pupil gave, never the right answer) */
async function mark(q) {
  const a = W.a[q.id], fp = s => sha(`${F.salt}|${q.id}|${s}`);
  if (q.kind === 'one') {
    const ok = a != null && await fp(q.opts[a]) === q.h;
    return { q, got: ok ? 1 : 0, sq: [[q.id, ok, ok ? [] : [a == null ? 'no answer' : 'o' + a]]] };
  }
  if (q.kind === 'all') {
    const ch = (a || []).slice().sort((x, y) => x - y), ok = ch.length > 0 && await fp(ch.map(i => q.opts[i]).sort().join(J)) === q.h;
    return { q, got: ok ? 1 : 0, sq: [[q.id, ok, ok ? [] : ch.length ? ch.map(i => (i + 1) + '=chosen') : ['nothing chosen']]] };
  }
  if (q.kind === 'label') {
    const sq = []; let got = 0, wrong = [];
    for (let p = 1; p <= q.h.length; p++) {
      const ni = a ? a[p] : null, name = ni == null ? null : q.names[ni];
      const ok = name != null && await sha(`${F.salt}|${q.id}|${p}=${name}`) === q.h[p - 1];
      if (ok) got++; else wrong.push(p);
      sq.push([q.id + '-' + p, ok, ok ? [] : [name == null ? 'left empty' : name]]);
    }
    return { q, got, sq, wrongPins: wrong };
  }
  if (q.kind === 'order') {
    const o = a || W.ord[q.id], ok = await fp(o.map(i => q.items[i]).join(J)) === q.h;
    return { q, got: ok ? 1 : 0, sq: [[q.id, ok, ok ? [] : o.map((i, k) => (k + 1) + '=' + q.items[i])]] };
  }
  if (q.kind === 'sort') {
    const pl = a || {}, all = q.items.every((_, i) => pl[i] != null);
    const ok = all && await fp(q.items.map((t, i) => `${t}=${q.bins[pl[i]]}`).sort().join(J)) === q.h;
    return { q, got: ok ? 1 : 0, sq: [[q.id, ok, ok ? [] : q.items.map((t, i) => pl[i] == null ? 'not placed: ' + t : (pl[i] + 1) + '=' + t)]] };
  }
  return { q, got: 0, sq: [] };
}
async function finish() {
  const out = [];
  for (const q of F.qs) out.push(await mark(q));
  out.forEach(m => m.sq.forEach(([id, ok, wrong]) => R.L.check(id, ok, wrong)));
  const score = out.reduce((s, m) => s + m.got, 0), t1 = Date.now();
  const res = { score, marks: F.marks, at: t1, took: Math.round((t1 - W.t0) / 1000),
    each: out.map(m => ({ id: m.q.id, got: m.got, of: marksOf(m.q), pins: m.wrongPins || null })) };
  const all = st.get('done', {}) || {}; all[me()] = res; st.set('done', all); st.set('work', null);
  W = null;
  result(res, true);
}

/* ---------- 4. the result: the score and which were not right, never the answers ---------- */
function result(res, now) {
  if (res.elsewhere) {
    card(`<p class="fc__eyebrow">Final check</p><h2 id="fcH" tabindex="-1" data-first>You have done the final check</h2>
      <p>You have one go, and your teacher has your result.</p>
      <div class="fc__acts"><button type="button" class="btn" data-close>Back to the cell</button></div>`);
    $('[data-close]', box).addEventListener('click', close); return;
  }
  const by = {}; (res.each || []).forEach(e => { by[e.id] = e; });
  const rows = F.qs.map((q, k) => {
    const e = by[q.id] || { got: 0, of: marksOf(q) }, ok = e.got === e.of;
    const how = q.kind === 'label' ? (ok ? 'all 6 right' : `${e.got} of ${e.of} right` + (e.pins && e.pins.length ? `: number${e.pins.length > 1 ? 's' : ''} ${fmtList(e.pins)} not right` : '')) : (ok ? 'right' : 'not right');
    return `<li class="${ok ? 'ok' : e.got ? 'part' : 'no'}"><span class="fc-res__m" aria-hidden="true">${ok ? '✓' : '✗'}</span><span class="fc-res__t"><b>Question ${k + 1}</b> · ${how}<span class="fc-res__s">${q.stem.replace(/<[^>]+>/g, '')}</span></span></li>`;
  }).join('');
  const signed = syncOn() && email();
  card(`<p class="fc__eyebrow">Final check</p>
    <h2 id="fcH" tabindex="-1" data-first>Your score: ${res.score} out of ${res.marks}</h2>
    <p>${signed ? 'Your teacher has your answers.' : 'You were not signed in, so this result is only on this computer.'} ${res.score === res.marks ? 'Every answer was right. Well done.' : 'Here is how each question went. The right answers are not shown: think again about the ones that were not right.'}</p>
    <ol class="fc-res">${rows}</ol>
    <div class="fc__acts"><button type="button" class="btn" data-close>Back to the cell</button></div>`);
  $('[data-close]', box).addEventListener('click', close);
  if (now && window.CELLGAME && window.CELLGAME.sound) window.CELLGAME.sound.wake();
}

/* the place's line in the list of places (js/game/quest.js) */
export function finalLine() {
  const d = finished();
  if (d && d.elsewhere) return '✦ done';
  if (d) return `✦ done: ${d.score} of ${d.marks}`;
  return work() || elsewhere() ? 'started: continue' : 'needs your code from the end of the journey';
}
/* started and not finished: the page opens on it again (the game would show the answers) */
export const finalOpen = () => !!(F && !finished() && (work() || elsewhere()));
window.CELLFINAL = { openFinal, finalCode, finalLine };
