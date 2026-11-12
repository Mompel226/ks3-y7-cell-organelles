/* ============================================================
   core.js — the Y7 cell game's frame (4 Nov 2026), from Chemistry revision's js/core.js.
   Everything a pupil types or chooses survives a reload (cellgame.answers); how each check and each place's game went
   goes to js/lesson.js, which keeps it for the teacher's 🔬 Practicals board when the pupil is signed in. The list of
   questions the board reads (data/questions.json) comes from window.QS (the checks) and window.TASKS (each place's game),
   printed by ?manifest=1. ↺ Start again forgets every cellgame.* key on this computer.
   A hard word's meaning, its line in the word bank and each place's definition say how to say it: sayHtml below.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const KEY = 'cellgame.';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    /* (store.dead: ↺ Start again has been pressed. Nothing is saved any more until the page has opened again: a step
       still running, a molecule on its way to the bag, had saved the OLD game again in that moment, and the "new" game
       began with the old one's places and items and with every check unanswered: found 12 Nov 2026, after Daniel's
       pupils had "a vesicle packed with amylase" with no copy of the gene. Proof: tools/restart-clean.mjs) */
    set(k, v) { if (store.dead) return; try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* private window: this visit only */ } }
  };
  const ANS = store.get('answers', {});
  const ans = {
    get: id => (ANS[id] && typeof ANS[id] === 'object') ? ANS[id] : null,
    put: (id, o) => { if (!id) return; ANS[id] = Object.assign({}, ANS[id] || {}, o); store.set('answers', ANS); }
  };
  function h(tag, attrs, html) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
  const params = new URLSearchParams(location.search);
  /* ?still=1 (tests, and a computer that asks for less motion): every animation jumps to its end. TEST: the tests only,
     where the pauses go too; CALM: a computer that asks for less motion, where every pause keeps its time, so that each
     moment a pause shows (its names, its words) is seen as a still (Daniel, 9 Nov 2026: "Nothing should disappear.
     Everything was there for a reason.") */
  const TEST = params.has('still') || params.has('manifest');
  const CALM = !TEST && !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const FAST = TEST || CALM;

  /* ---------------- the lesson record ---------------- */
  const L0 = window.Lesson || { check() {}, done() {}, restart() {}, restartAll() {}, record: () => ({ q: {} }) };
  const L = {
    check: (...a) => { L0.check(...a); changed(); },
    done: (...a) => { L0.done(...a); changed(); },
    restartAll: () => { L0.restartAll(); changed(); }
  };
  let chT = 0;
  function changed() { clearTimeout(chT); chT = setTimeout(() => document.dispatchEvent(new Event('progress')), 60); }
  function qDone(id) { const x = (L0.record ? L0.record() : { q: {} }).q[id], r = x && x.r[x.r.length - 1]; return !!(r && !r.e && (r.s === 'f' || r.s === '1' || r.s === 'd')); }

  /* ---------------- the list of questions for the teacher's board ---------------- */
  /* the final check (js/game/final.js, from js/final-data.js): one square per mark, and fc-begin, when it started. Only
     what the page already shows: the options in the file's own order (a wrong one is o<n>), never which is right */
  function finalRows(part) {
    const F = window.FINAL; if (!F) return [];
    const rows = [{ id: 'fc-begin', part, title: 'Final check: started (its time is counted from here)', short: 'start', kind: 'task' }];
    F.qs.forEach((q, k) => {
      const n = 'F' + (k + 1), base = { part, title: `Final check ${k + 1}: ${q.title}`, short: n };
      if (q.tag === 'x') base.ext = 1;               /* an Explorer question: marked on the board as the game's own are */
      if (q.kind === 'one') rows.push(Object.assign({ id: q.id }, base, { kind: 'mcq', opts: q.opts.slice() }));
      else if (q.kind === 'all') rows.push(Object.assign({ id: q.id }, base, { kind: 'all', gaps: q.opts.slice() }));
      else if (q.kind === 'label') q.h.forEach((_, i) => rows.push({ id: q.id + '-' + (i + 1), part, title: `Final check ${k + 1}: ${q.title}, number ${i + 1}`, short: n + '.' + (i + 1), kind: 'label' }));
      else if (q.kind === 'order') rows.push(Object.assign({ id: q.id }, base, { kind: 'order', gaps: q.items.map((_, i) => 'place ' + (i + 1)) }));
      else if (q.kind === 'sort') rows.push(Object.assign({ id: q.id }, base, { kind: 'sort', gaps: q.bins.slice() }));
    });
    return rows;
  }
  function manifest() {
    const PARTS = window.PARTS || [], QS = window.QS || {}, TASKS = window.TASKS || {};
    const qs = [];
    PARTS.forEach(p => {
      if (p.test) { finalRows(p.n).forEach(r => qs.push(r)); return; }
      Object.keys(TASKS).filter(id => TASKS[id].part === p.n).forEach(id => qs.push({ id, part: p.n, title: TASKS[id].title, short: 'game', kind: 'task' }));
      Object.keys(QS).filter(id => QS[id].part === p.n).forEach(id => {
        const q = QS[id], r = { id, part: q.part, title: q.title, short: q.short, kind: q.kind };
        if (q.kind === 'mcq') r.opts = q.a.slice();
        if (q.kind === 'gaps') r.gaps = q.text.match(/\[\[([^\]]+)\]\]/g).map(m => m.slice(2, -2).split('|')[0]);
        if (q.ext) r.ext = 1;
        qs.push(r);
      });
    });
    return { id: (window.PRACTICAL_CONFIG || {}).id, v: 1, parts: PARTS.map(p => Object.assign({ n: p.n, title: p.title }, p.test ? { test: 1 } : {})), groups: [], questions: qs };
  }

  /* ---------------- ☀ Bright / ☾ Dark (biology.theme, the site's own key) ---------------- */
  function initTheme() {
    const tb = $('#btnTheme'); if (!tb) return;
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const nowDark = () => { const t = document.documentElement.getAttribute('data-theme'); return t ? t === 'dark' : !!(mq && mq.matches); };
    const paint = () => { const d = nowDark(); tb.textContent = d ? '☀ Bright' : '☾ Dark'; tb.setAttribute('aria-label', d ? 'Switch to the bright version' : 'Switch to the dark version'); };
    tb.addEventListener('click', () => {
      const next = nowDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('biology.theme', next); } catch (e) { /* private window */ }
      paint(); document.dispatchEvent(new Event('themechange'));
    });
    if (mq && mq.addEventListener) mq.addEventListener('change', paint);
    tb.hidden = false; paint();
  }

  /* ---------------- ↺ Start again ---------------- */
  function initRestart() {
    const b = $('#btnRestart'); if (!b) return;
    b.addEventListener('click', () => {
      if (!confirm('Start the whole game again? Your answers and your progress on this computer are cleared. What your teacher already has is kept.')) return;
      L.restartAll();
      store.dead = true;   /* from here on nothing of the old game can be saved again (store.set) */
      try { Object.keys(localStorage).filter(k => k.indexOf(KEY) === 0).forEach(k => localStorage.removeItem(k)); } catch (e) {}
      setTimeout(() => { try { Object.keys(localStorage).filter(k => k.indexOf(KEY) === 0).forEach(k => localStorage.removeItem(k)); } catch (e) {} location.replace(location.pathname); }, 150);
    });
  }

  /* ---------------- the word bank (one list for the page, with Korean and Chinese) ---------------- */
  const WORD = {};
  (window.WORDS || []).forEach(g => g.w.forEach(w => { WORD[w.k] = w; }));
  /* a word of the shared KS3 glossary that this page's bank does not list (the IB words of quest.js ibSwitch) still opens
     its meaning where it is used; the bank's list stays the Year 7 words */
  const wordOf = k => WORD[k] || (window.KS3_GLOSSARY && window.KS3_GLOSSARY.by[k]) || null;
  /* how to say a hard word (Daniel, 8 Nov 2026: "the students can click on the very complex words ... to know how they
     pronounce", then "and us pronunciation too"): js/say.js, labs-shared/say/say.js copied here by
     tools/practicals-sync.mjs, knows the hard words. A word it knows as a whole gives one line: its spelling guide, the
     Cambridge Dictionary's UK and US recordings where Cambridge has the word, and "Audio: Cambridge Dictionary", a link to
     its page (a word without them keeps its guide and has no button). Any other key word gives a line for each hard word in
     it, the word named (Golgi apparatus: Golgi, apparatus); a simple word has none. SAY_AS: the words a key word's line
     says when its name is not the word to hear. The music pauses while a word plays (js/game/sound.js, the 'say' event). */
  const SAY_AS = { 'rough-er': ['endoplasmic reticulum'], 'smooth-er': ['endoplasmic reticulum'], 'mitochondria': ['mitochondrion'], 'villi': ['villus'] };
  function sayHtml(w) {
    const S = window.Say; if (!S || !w) return '';
    const name = String(w.en).replace(/\s*\([^)]*\)/g, '').trim(), list = SAY_AS[w.k] || S.words(name);
    if (!list.length) return '';
    const whole = !SAY_AS[w.k] && list.length === 1 && list[0].toLowerCase() === name.toLowerCase();
    return '<div class="says">' + list.map(x => whole ? S.html(x) : `<div class="says__r"><span class="says__w">${esc(x)}</span>${S.html(x)}</div>`).join('') + '</div>';
  }
  function initWordBank() {
    const wb = $('#wb'), btn = $('#wbBtn'), list = $('#wbList'), find = $('#wbFind');
    if (!wb || !btn) return;
    /* each word opens its KS3 definition under it; a word of the bank inside a definition is a link to its own
       definition. One definition per word: labs-shared/ks3-glossary.js (memory ks3-glossary) */
    const G = window.KS3_GLOSSARY, has = k => !!WORD[k];
    const defHtml = w => G ? G.links(w.d, has, w.k).map(([t, k]) => k ? `<button type="button" class="wb__link" data-k="${esc(k)}">${esc(t)}</button>` : esc(t)).join('') : esc(w.d);
    list.innerHTML = (window.WORDS || []).map(g => `<p class="wb__g">${esc(g.g)}</p>` + g.w.map(w =>
      `<div class="wb__item" data-k="${esc(w.k)}" data-s="${esc((w.en + ' ' + w.ko + ' ' + w.zh).toLowerCase())}"><button type="button" class="wb__row" aria-expanded="false"><b>${esc(w.en)}</b><span class="ko" lang="ko">${esc(w.ko)}</span><span class="zh" lang="zh-Hans">${esc(w.zh)}</span></button><div class="wb__def" hidden></div></div>`).join('')).join('');
    /* a definition and its links are made the first time it is opened (5 Nov 2026, speed: all of them at once cost the
       page about 60 ms as it loaded) */
    const openItem = (item, on) => { const d = $('.wb__def', item), r = $('.wb__row', item); on = on == null ? d.hidden : on;
      if (on && !d.firstChild && WORD[item.dataset.k]) d.innerHTML = defHtml(WORD[item.dataset.k]) + sayHtml(WORD[item.dataset.k]);
      d.hidden = !on; r.setAttribute('aria-expanded', String(on)); item.classList.toggle('open', on); };
    const goTo = k => {
      const item = $(`.wb__item[data-k="${k}"]`, list); if (!item) return;
      if (item.classList.contains('hide')) { find.value = ''; $$('.wb__item', list).forEach(i => i.classList.remove('hide')); }
      openItem(item, true);
      item.scrollIntoView({ block: 'nearest', behavior: FAST ? 'auto' : 'smooth' });
      item.classList.remove('flash'); void item.offsetWidth; item.classList.add('flash');
      $('.wb__row', item).focus({ preventScroll: true });
    };
    list.addEventListener('click', e => {
      const link = e.target.closest('.wb__link'); if (link) { goTo(link.dataset.k); return; }
      const row = e.target.closest('.wb__row'); if (row) openItem(row.parentNode);
    });
    const setLang = l => {
      wb.setAttribute('data-lang', l); store.set('lang', l);
      $$('.langs button', wb).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === l)));
      const s = $('.lang', btn); if (s) s.textContent = l === 'ko' ? '· 한국어' : l === 'zh' ? '· 中文' : l === 'all' ? '· 한국어 中文' : '';
      document.dispatchEvent(new Event('langchange'));
    };
    $$('.langs button', wb).forEach(b => b.addEventListener('click', () => setLang(b.dataset.l)));
    setLang(store.get('lang', 'all'));
    const open = on => { wb.hidden = !on; btn.setAttribute('aria-expanded', String(on)); if (on) find.focus(); };
    btn.addEventListener('click', () => open(wb.hidden));
    $('#wbClose').addEventListener('click', () => { open(false); btn.focus(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !wb.hidden) { open(false); btn.focus(); } });
    /* a click or tap anywhere outside the word bank closes it too, not only the × */
    document.addEventListener('pointerdown', e => { if (!wb.hidden && !wb.contains(e.target) && !btn.contains(e.target)) open(false); });
    find.addEventListener('input', () => {
      const v = find.value.trim().toLowerCase();
      $$('.wb__item', list).forEach(r => r.classList.toggle('hide', !!v && r.dataset.s.indexOf(v) < 0));
    });
    window.REV.wordBank = goTo;
  }
  const lang = () => store.get('lang', 'all');

  /* ---------------- key words: the meaning opens where you are (never the title attribute) ---------------- */
  let tipEl = null, tipFor = null;
  function closeTip() { if (tipEl) { tipEl.remove(); tipEl = null; tipFor = null; } }
  function showTip(btn) {
    const w = wordOf(btn.dataset.w); if (!w) return;
    if (tipFor === btn) { closeTip(); return; }
    closeTip();
    const l = lang();
    const tr = (l === 'en') ? '' : '<div class="tr">' + (l !== 'zh' ? `<span lang="ko"><i>한국어</i>${esc(w.ko)}</span>` : '') + (l !== 'ko' ? `<span lang="zh-Hans"><i>中文</i>${esc(w.zh)}</span>` : '') + '</div>';
    tipEl = h('div', { class: 'tip', role: 'note' }, `<b>${esc(w.en)}</b>: ${esc(w.d)}${tr}${sayHtml(w)}`);
    document.body.appendChild(tipEl); tipFor = btn;
    const r = btn.getBoundingClientRect(), tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
    let x = r.left + scrollX; x = Math.max(8, Math.min(x, scrollX + document.documentElement.clientWidth - tw - 8));
    let y = r.bottom + scrollY + 6;
    if (r.bottom + th + 12 > innerHeight && r.top - th - 6 > 0) y = r.top + scrollY - th - 6;   /* above the word, near the foot of a panel */
    tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
  }
  /* <dfn data-w="key">word</dfn> becomes a button that opens the word's meaning (inside text drawn later, too) */
  function terms(root) {
    $$('dfn[data-w]', root || document).forEach(d => {
      if (!wordOf(d.dataset.w)) { console.warn('word bank has no ' + d.dataset.w); d.replaceWith(document.createTextNode(d.textContent)); return; }
      const b = h('button', { type: 'button', class: 'term', 'data-w': d.dataset.w, 'aria-label': d.textContent + ': show its meaning' });
      b.innerHTML = d.innerHTML; d.replaceWith(b);
    });
  }
  function initTerms() {
    terms();
    document.addEventListener('click', e => {
      const t = e.target.closest && e.target.closest('.term');
      if (t) { showTip(t); e.stopPropagation(); return; }
      if (tipEl && !e.target.closest('.tip')) closeTip();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTip(); });
    addEventListener('resize', closeTip);
  }

  /* ---------------- start ---------------- */
  function start() {
    initTheme(); initRestart(); initWordBank(); initTerms();
    if (params.has('manifest')) {
      const pre = h('pre', { id: 'manifest' }); pre.textContent = JSON.stringify(manifest());
      document.body.appendChild(pre);
    }
    document.dispatchEvent(new Event('cellgame:core'));
  }
  window.REV = { $, $$, h, esc, store, ans, L, qDone, manifest, FAST, TEST, CALM, WORD, lang, params, terms, closeTip, say: sayHtml };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
