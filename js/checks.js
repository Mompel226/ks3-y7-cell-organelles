/* ============================================================
   checks.js — the checks of the Y7 cell game (4 Nov 2026): how each kind is drawn, marked and kept.
   A copy of Chemistry revision's js/checks.js (practicals/ks3-y7-chemistry-revision, 25 Oct 2026, with Daniel's rules),
   keeping the kinds this page uses: typed gaps, multiple choice, sort and order. What it keeps from there:
   - Key words are TYPED into gaps: spelling counts, capitals do not. A gap accepts every scientific word that makes its
     sentence right; the first word listed is the one the first letter, the word list and the answers show. The pupil types
     first; "Show the first letter" puts in the first letter of the gap they are working on; "Show the word list" shows
     every gap's word once, in a random order kept for that pupil.
   - Some checks have a 💡 Hint: an idea to think about, never the answer.
   - A first letter, the word list or a hint counts as a try on the teacher's board, so "right first time" stays honest.
   - Multiple choice: a new random order each time it is drawn; a wrong choice says only "Not this one"; the reason
     comes with the right answer. The record keeps each option by its place in the list (o0 = the first written).
   - "Show the answers" only after two complete tries. A sorted or ordered answer is kept as the pupil left it and
     marked as one whole: the page never says which piece is wrong.
   - Shown answers are put in place, but the check is not over: the pupil presses Check (Daniel, 4 Nov 2026: a place is
     done only when the pupil has "gotten to the correct answers by checking or by tapping the right answer"). Showing
     them counts as a try on the board ("answers shown"). A check shown before this rule is drawn the same way.
   What is new here: the checks are drawn when a place of the cell is finished (js/game/quest.js calls REVchecks.draw),
   not all at once; every check is registered for the teacher's board from window.QS by js/core.js.
   ============================================================ */
(function () {
  'use strict';
  const S = window.REV, { $, $$, h, esc, ans, L } = S;

  /* ---------- typed words: one canonical form ---------- */
  function canon(s, keepCase) {
    s = String(s == null ? '' : s).normalize('NFKC');
    if (!keepCase) s = s.toLowerCase();
    s = s.replace(/[‘’`]/g, "'").replace(/[-‐-―_/]/g, ' ').replace(/[.,;:!?"()]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!keepCase) s = s.replace(/^(the|a|an) /, '');
    s = s.replace(/crystalliz/g, 'crystallis').replace(/vaporiz/g, 'vaporis').replace(/sulph/g, 'sulf');
    s = s.replace(/\s*°\s*c$/i, '').trim();
    return s;
  }
  /* "[[residue]] … [[size|sizes]]": each gap's accepted answers, the first one shown when the answers are shown */
  function parseGaps(text) {
    const gaps = [];
    const html = esc(text).replace(/\[\[([^\]]+)\]\]/g, (m, inner) => {
      const opts = inner.split('|').map(x => x.replace(/&amp;/g, '&').replace(/&#39;/g, "'"));
      gaps.push(opts);
      const w = Math.max(6, Math.min(24, Math.max(...opts.map(o => o.length)) + 3));
      return `<input class="gap" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" data-g="${gaps.length - 1}" style="width:${w}ch" aria-label="gap ${gaps.length}">`;
    });
    return { html: html.replace(/\n/g, '<br>'), gaps };
  }
  /* Gaps listed together in q.anyOrder (numbered from 1, as on Separating mixtures) are the items of a list: their
     words may come in any order (Daniel, 25 Oct 2026). Each gap must hold a DIFFERENT item of its group, so marking is
     a matching, as in the labs' engine (labs-shared/engine/marking.js), never each word looked up on its own.
     A gap given its first letter keeps it: there, only a word that starts with that letter counts, so the letter
     fixes which word goes in that gap, unless both words start with it ("liquid", "lattice": either order is right).
     pairGroup returns, for each item of the group (by its gap index), the gap that holds it. */
  function pairGroup(idx, vals, gaps, keepCase, letters) {
    const c = v => canon(v, keepCase);
    const can = i => idx.filter(k => gaps[k].some(a => c(a) === c(vals[i])) && (!letters[i] || c(vals[i]).charAt(0) === c(letters[i]).charAt(0)));
    const heldBy = {};
    const pair = (i, seen) => can(i).some(k => {
      if (seen.has(k)) return false;
      seen.add(k);
      if (heldBy[k] === undefined || pair(heldBy[k], seen)) { heldBy[k] = i; return true; }
      return false;
    });
    idx.forEach(i => { if (String(vals[i] || '').trim()) pair(i, new Set()); });
    return heldBy;
  }
  function markGaps(vals, gaps, groups, keepCase, letters) {
    letters = letters || {};
    /* a gap given its first letter takes only an accepted word with that letter (Daniel, 26 Oct 2026: "physical" is
       also right for a reversible change, but not once the pupil has been shown the "r") */
    const fits = (v, i) => !letters[i] || canon(v, keepCase).charAt(0) === canon(letters[i], keepCase).charAt(0);
    const ok = vals.map((v, i) => gaps[i].some(a => canon(a, keepCase) === canon(v, keepCase)) && fits(v, i));
    (groups || []).forEach(gr => {
      const idx = gr.map(n => n - 1), held = pairGroup(idx, vals, gaps, keepCase, letters);
      idx.forEach(i => { ok[i] = false; });
      Object.keys(held).forEach(k => { ok[held[k]] = true; });
    });
    return ok;
  }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const LET = 'ABCDEFGH';

  /* ---------- the shell every check shares ---------- */
  const KIND_LABEL = { mcq: 'Quick check', gaps: 'Fill the gaps', sort: 'Sort', order: 'Put in order' };
  function shell(box, q) {
    box.innerHTML = '';
    box.appendChild(h('div', { class: 'q__k' }, `<span>${esc(q.label || KIND_LABEL[q.kind] || 'Quick check')}</span><span class="st" aria-live="polite"></span>`));
    /* where to look on the picture before answering (memory questions-show-their-animation) */
    if (q.look) box.appendChild(h('p', { class: 'q__look' }, '<span aria-hidden="true">👀</span> <span><b>On the picture</b> · ' + q.look + '</span>'));
    return {
      status(t, ok) { const s = $('.q__k .st', box); s.textContent = t || ''; box.classList.toggle('ok', !!ok); },
      say(el, text, cls) { el.className = 'say' + (cls ? ' ' + cls : ''); el.textContent = text || ''; },
      why(text, shown) {
        let w = $('.why', box);
        if (!text) { if (w) w.remove(); return; }
        if (!w) { w = h('div', { class: 'why' }); box.appendChild(w); }
        w.className = 'why' + (shown ? ' shown' : ''); w.innerHTML = text;
      }
    };
  }
  const RIGHT = '✓ Right';
  /* 💡 Hint: an idea, never the answer; it counts as a try on the board (once) */
  function addHint(box, row, id, q, isLocked) {
    if (!q.hint) return null;
    const A = ans.get(id) || {};
    const showBox = () => { if (!$('.hintbox', box)) row.insertAdjacentElement('afterend', h('div', { class: 'hintbox' }, '<b>💡 Hint:</b> ' + q.hint)); };
    if (A.hinted) { showBox(); return null; }
    if (isLocked) return null;
    const b = h('button', { class: 'btn help', type: 'button' }, '💡 Hint');
    row.insertBefore(b, $('.say', row));
    b.addEventListener('click', () => {
      L.check(id, false, ['hint']); ans.put(id, { hinted: 1 });
      b.remove(); showBox();
    });
    return b;
  }

  /* ---------- gaps ---------- */
  function drawGaps(box, id, q) {
    const ui = shell(box, q), A = ans.get(id) || {}, keepCase = !!q.case;
    const { html, gaps } = parseGaps(q.text);
    if (q.stem) box.appendChild(h('p', { class: 'q__stem' }, q.stem));
    const body = h('p', { class: 'q__stem gapline' }, html); box.appendChild(body);
    const ins = $$('input.gap', body);
    const row = h('div', { class: 'q__row' }, '<button class="btn" type="button">Check</button><button class="btn help fl" type="button">Show the first letter</button><button class="btn help wlb" type="button">Show the word list</button><span class="say"></span>');
    box.appendChild(row);
    const btn = $('.btn:not(.help)', row), flb = $('.fl', row), wlb = $('.wlb', row), say = $('.say', row);
    let tries = A.tries || 0, last = 0;
    /* the word list: each gap's own word (the first one it accepts), in a random order that stays for this pupil.
       ✕ closes it (Daniel, 26 Oct 2026: a pupil may press it by accident and not want to see it); the button then comes
       back and opens the same list again. Only the first opening is sent to the board: the help was already seen. */
    let wl = null, wlOrder = Array.isArray(A.wl) && A.wl.length === gaps.length ? A.wl : null;
    function wordList(order, shut) {
      const words = order.map(i => gaps[i] ? gaps[i][0] : '').filter(Boolean);
      wl = h('div', { class: 'q__wl', role: 'note', 'aria-label': 'Word list' },
        '<span class="q__wl-k">Word list</span>' + words.map(w => '<span class="q__wl-w">' + esc(w) + '</span>').join('') +
        '<button type="button" class="q__wl-x" aria-label="Close the word list">✕ Close</button>');
      body.insertAdjacentElement('afterend', wl);
      $('.q__wl-x', wl).addEventListener('click', () => { showList(false); ans.put(id, { wlShut: 1 }); });
      showList(!shut);
    }
    function showList(on) {
      if (wl) wl.hidden = !on;
      wlb.hidden = on || !!(A.ok || A.shown) || !wlb.isConnected;
    }
    function shuffled() {
      const o = gaps.map((g, i) => i);
      for (let t = 0; t < 20; t++) {
        for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
        if (o.length < 2 || o.some((x, i) => gaps[x][0] !== gaps[i][0])) break;   /* never the order of the gaps */
      }
      return o;
    }
    if (wlOrder) wordList(wlOrder, !!A.wlShut);
    /* the gaps given their first letter: gap → that letter (a save from before 25 Oct 2026 kept only the gap) */
    const hinted = new Map((A.hl || []).map(x => Array.isArray(x) ? x : [x, gaps[x] ? gaps[x][0].charAt(0) : '']));
    const groupOf = i => (q.anyOrder || []).map(g => g.map(n => n - 1)).find(g => g.indexOf(i) >= 0);
    (A.v || []).forEach((v, i) => { if (ins[i]) ins[i].value = v; });
    hinted.forEach((l, i) => { if (ins[i]) ins[i].classList.add('hinted'); });
    function lock(shown) {
      ins.forEach(i => { i.readOnly = true; }); btn.remove(); flb.remove(); wlb.remove();
      const sb = $('.show', row); if (sb) sb.remove();
      const hb = $('.btn.help', row); if (hb) hb.remove();
      ui.status(shown ? 'Answers shown' : RIGHT, !shown);
      ui.say(say, shown ? 'These are the answers. Read them, then continue.' : 'All right.', shown ? '' : 'ok');
      if (q.why) ui.why(q.why, shown);
    }
    function paint(ok) { ins.forEach((inp, i) => { inp.classList.toggle('right', !!ok[i]); inp.classList.toggle('wrong', !ok[i] && !!inp.value.trim()); }); }
    function rightNow() { return markGaps(ins.map(i => i.value), gaps, q.anyOrder, keepCase, Object.fromEntries(hinted)); }
    /* The letter for gap i: its own word's. In an anyOrder group, a word another gap already holds (typed right), or
       keeps with its own first letter, is taken: then the letter of a word of the group that is still free. */
    function letterFor(i) {
      const gr = groupOf(i);
      if (!gr) return gaps[i][0].charAt(0);
      const vals = ins.map(x => x.value), lt = Object.fromEntries(hinted);
      vals[i] = ''; delete lt[i];
      const held = pairGroup(gr, vals, gaps, keepCase, lt), holders = Object.values(held);
      const taken = new Set(Object.keys(held).map(Number)), first = s => canon(s, keepCase).charAt(0);
      gr.forEach(j => {
        if (!lt[j] || holders.indexOf(j) >= 0) return;
        const k = [j].concat(gr).find(m => !taken.has(m) && first(gaps[m][0]) === first(lt[j]));
        if (k !== undefined) taken.add(k);
      });
      const k = [i].concat(gr).find(m => !taken.has(m));
      return gaps[k === undefined ? i : k][0].charAt(0);
    }
    /* the answers shown after two tries; in a group, a gap given its first letter shows the word with that letter */
    function shownAnswers() {
      const out = gaps.map(g => g[0]), first = s => canon(s, keepCase).charAt(0);
      (q.anyOrder || []).forEach(g => {
        const idx = g.map(n => n - 1), free = new Set(idx), done = new Set();
        idx.forEach(i => {
          if (!hinted.get(i)) return;
          const k = [i].concat(idx).find(m => free.has(m) && first(gaps[m][0]) === first(hinted.get(i)));
          if (k !== undefined) { out[i] = gaps[k][0]; free.delete(k); done.add(i); }
        });
        idx.forEach(i => {
          if (done.has(i)) return;
          const k = free.has(i) ? i : idx.find(m => free.has(m));
          if (k !== undefined) { out[i] = gaps[k][0]; free.delete(k); }
        });
      });
      return out;
    }
    function flState() {
      const ok = rightNow(), left = ins.filter((inp, i) => !hinted.has(i) && !(ok[i] && inp.classList.contains('right')));
      flb.disabled = !left.length;
      flb.textContent = left.length ? 'Show the first letter' : 'No more first letters';
    }
    function showBtn() {
      if (tries < 2 || $('.show', row)) return;
      const sb = h('button', { class: 'btn ghost show', type: 'button' }, 'Show the answers'); row.insertBefore(sb, say);
      sb.addEventListener('click', () => { L.check(id, false, ['answers shown']); showAnswers(); sb.remove(); });
    }
    /* the answers go into the gaps; the pupil reads them, then presses Check */
    function showAnswers() {
      const sh = shownAnswers(); ins.forEach((inp, i) => { inp.value = sh[i]; inp.classList.remove('wrong', 'right'); });
      ans.put(id, { v: ins.map(i => i.value), shown: 1, marked: 0 });
      ui.say(say, 'These are the answers. Read them, then press Check.', ''); flState();
    }
    if (A.ok) { paint(rightNow()); lock(false); addHint(box, row, id, q, true); return; }
    if (A.marked) paint(rightNow());
    if (tries) ui.status('Try ' + (tries + 1));
    if (A.shown) showAnswers(); else showBtn();
    flState();
    addHint(box, row, id, q, false);
    ins.forEach((inp, i) => {
      inp.addEventListener('focus', () => { last = i; });
      inp.addEventListener('pointerdown', () => { last = i; });     /* the gap the pupil is working on: tapped, or typed in */
      inp.addEventListener('input', () => { last = i; inp.classList.remove('right', 'wrong'); ans.put(id, { v: ins.map(x => x.value), marked: 0 }); flState(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    });
    /* the first letter of the gap the pupil is working on (the last one they were in), else the first gap not right yet */
    flb.addEventListener('click', () => {
      const ok = rightNow();
      const open = i => !hinted.has(i) && !(ok[i] && ins[i].classList.contains('right'));
      let i = open(last) ? last : ins.findIndex((x, j) => open(j));
      if (i < 0) { flState(); return; }
      const letter = letterFor(i);
      ins[i].value = letter;                       /* the gap shows only the first letter: the pupil types the rest */
      hinted.set(i, letter); ins[i].classList.add('hinted'); ins[i].classList.remove('wrong');
      L.check(id, false, ['first letter, gap ' + (i + 1)]);
      ans.put(id, { v: ins.map(x => x.value), hl: Array.from(hinted) });
      ins[i].focus(); const n = ins[i].value.length; try { ins[i].setSelectionRange(n, n); } catch (e) {}
      ui.say(say, 'The first letter is in gap ' + (i + 1) + '. Type the rest of the word.', '');
      flState();
    });
    wlb.addEventListener('click', () => {
      if (wlOrder) { showList(true); ans.put(id, { wlShut: 0 }); return; }        /* open again: the same list, no new record */
      wlOrder = shuffled();
      wordList(wlOrder);
      L.check(id, false, ['word list']);
      ans.put(id, { v: ins.map(x => x.value), wl: wlOrder, wlShut: 0 });
      ui.say(say, 'The words for the gaps are under the sentence, in a random order. Type each one into its gap.', '');
    });
    btn.addEventListener('click', check);
    function check() {
      const vals = ins.map(i => i.value);
      if (vals.some(v => !v.trim())) { ui.say(say, 'Fill every gap first.', 'no'); return; }
      const ok = rightNow(), all = ok.every(Boolean);
      tries++; paint(ok);
      L.check(id, all, all ? [] : vals.map((v, i) => ok[i] ? null : (i + 1) + '=' + v.trim()).filter(Boolean));
      ans.put(id, { v: vals, tries, ok: all ? 1 : 0, marked: 1 });
      if (all) { lock(false); return; }
      ui.status('Try ' + (tries + 1));
      let msg = ok.some(Boolean) ? 'Not right yet: change the ones in amber. Spelling counts.' : 'Not right yet. Spelling counts: check the word bank.';
      if (keepCase && vals.some((v, i) => !ok[i] && gaps[i].some(a => canon(a) === canon(v)))) msg = 'Nearly: check the capital letters. A symbol starts with a capital letter; a second letter is small.';
      /* a gap given its first letter, holding a word (of its list, or another right word) that does not start with it */
      const off = ins.findIndex((x, i) => !ok[i] && hinted.get(i) && canon(vals[i], keepCase).charAt(0) !== canon(hinted.get(i), keepCase).charAt(0)
        && (groupOf(i) || gaps[i].some(a => canon(a, keepCase) === canon(vals[i], keepCase))));
      if (off >= 0) msg = 'Gap ' + (off + 1) + ' was given its first letter, "' + hinted.get(off) + '": the word in that gap must start with it.';
      ui.say(say, msg, 'no');
      if (!A.shown) showBtn(); flState();
    }
  }

  /* ---------- multiple choice ---------- */
  function drawMcq(box, id, q) {
    const ui = shell(box, q), A = ans.get(id) || {}, out = new Set(A.out || []);
    box.appendChild(h('p', { class: 'q__stem' }, q.stem));
    const ol = h('ol', { class: 'opts' }); box.appendChild(ol);
    const row = h('div', { class: 'q__row' }, '<span class="say"></span>'); box.appendChild(row);
    const order = shuffle(q.a.map((_, i) => i));
    order.forEach((oi, k) => {
      const li = h('li'), b = h('button', { type: 'button', 'data-o': oi }, `<span class="lt">${LET[k]}</span><span>${esc(q.a[oi])}<span class="nt"></span></span>`);
      li.appendChild(b); ol.appendChild(li);
      b.addEventListener('click', () => choose(oi, b));
    });
    let hintBtn = null;
    function mark(oi, b) {
      if (oi === 0) {
        b.classList.add('yes'); $$('button', ol).forEach(x => { x.disabled = true; }); ui.status(RIGHT, true);
        if (hintBtn) { hintBtn.remove(); hintBtn = null; }
        if (q.why) ui.why('<b>Why:</b> ' + q.why);
      }
      else { b.classList.add('no'); b.disabled = true; $('.nt', b).textContent = 'Not this one'; }
    }
    function choose(oi, b) {
      if (b.disabled) return;
      const right = oi === 0;
      L.check(id, right, right ? [] : ['o' + oi]);
      if (right) ans.put(id, { ok: 1 }); else { out.add(oi); ans.put(id, { out: Array.from(out) }); }
      mark(oi, b);
    }
    hintBtn = addHint(box, row, id, q, !!A.ok);
    out.forEach(oi => { const b = $(`button[data-o="${oi}"]`, ol); if (b) mark(oi, b); });
    if (A.ok) mark(0, $('button[data-o="0"]', ol));
  }

  /* ---------- sort into boxes (press a card, then a box; or drag it) ---------- */
  function chipHtml(it) { return { cls: 'chip', html: esc(it.t) }; }
  function drawSort(box, id, q) {
    const ui = shell(box, q), A = ans.get(id) || {};
    box.appendChild(h('p', { class: 'q__stem' }, q.stem));
    const tray = h('div', { class: 'tray', 'aria-label': 'Cards to sort' }); box.appendChild(tray);
    const bins = h('div', { class: 'bins' }); bins.style.setProperty('--n', q.cols || q.bins.length); box.appendChild(bins);
    q.bins.forEach((b, i) => {
      const d = h('div', { class: 'bin', 'data-b': i, role: 'button', tabindex: '0', 'aria-label': 'Put the chosen card in: ' + b.t }, `<h4>${esc(b.t)}${b.s ? `<small>${esc(b.s)}</small>` : ''}</h4><div class="in"></div>`);
      bins.appendChild(d);
    });
    const row = h('div', { class: 'q__row' }, '<button class="btn" type="button">Check</button><span class="say"></span>'); box.appendChild(row);
    const btn = $('.btn', row), say = $('.say', row);
    let tries = A.tries || 0, sel = null, locked = false;
    const place = Object.assign({}, A.place || {});
    const items = q.items.map(it => Array.isArray(it) ? { t: it[0], b: it[1] } : it);
    const chips = items.map((it, i) => { const c = chipHtml(it); return h('button', { type: 'button', class: c.cls, 'data-i': i, 'aria-label': it.t }, c.html); });
    const order = shuffle(chips.map((_, i) => i));      /* a new random order each time it is drawn */
    function layout() { order.forEach(i => { const b = place[i]; (b == null ? tray : $(`.bin[data-b="${b}"] .in`, bins)).appendChild(chips[i]); }); }
    layout();
    function select(c) { if (locked) return; if (sel) sel.classList.remove('sel'); sel = (sel === c) ? null : c; if (sel) sel.classList.add('sel'); $$('.bin', bins).forEach(b => b.classList.toggle('target', !!sel)); }
    function put(c, b) {
      const i = +c.dataset.i; if (b == null) delete place[i]; else place[i] = b;
      layout(); chips.forEach(x => x.classList.remove('right', 'wrong'));
      ans.put(id, { place: Object.assign({}, place) }); ui.say(say, '');
      if (sel) sel.classList.remove('sel'); sel = null; $$('.bin', bins).forEach(x => x.classList.remove('target'));
    }
    $$('.bin', bins).forEach(bn => {
      const go = () => { if (sel && !locked) put(sel, +bn.dataset.b); };
      bn.addEventListener('click', e => { if (e.target.closest('.chip') && e.target.closest('.chip') !== sel) return; go(); });
      bn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    tray.addEventListener('click', e => { if (sel && !e.target.closest('.chip') && !locked) put(sel, null); });
    dragify(chips, c => select(c), (c, target) => { if (locked) return; const bn = target && target.closest('.bin'); if (bn) put(c, +bn.dataset.b); else if (target && target.closest('.tray')) put(c, null); });
    function lock(shown) {
      locked = true; btn.remove(); const sb = $('.show', row); if (sb) sb.remove();
      const hb = $('.btn.help', row); if (hb) hb.remove();
      chips.forEach(c => { c.classList.add('right'); c.disabled = true; });
      ui.status(shown ? 'Answers shown' : RIGHT, !shown); ui.say(say, shown ? 'This is where each one goes.' : 'All in the right boxes.', shown ? '' : 'ok');
      if (q.why) ui.why(q.why, shown);
    }
    function showBtn() {
      if (tries < 2 || $('.show', row)) return;
      const sb = h('button', { class: 'btn ghost show', type: 'button' }, 'Show the answers'); row.insertBefore(sb, say);
      sb.addEventListener('click', () => { L.check(id, false, ['answers shown']); showAnswers(); sb.remove(); });
    }
    /* every card into its box; the pupil looks, then presses Check */
    function showAnswers() {
      items.forEach((it, i) => { place[i] = it.b; }); layout(); chips.forEach(x => x.classList.remove('right', 'wrong'));
      ans.put(id, { place: Object.assign({}, place), shown: 1 });
      ui.say(say, 'This is where each one goes. Look, then press Check.', '');
    }
    if (A.ok) { lock(false); addHint(box, row, id, q, true); return; }
    if (tries) ui.status('Try ' + (tries + 1));
    if (A.shown) showAnswers(); else showBtn();
    addHint(box, row, id, q, false);
    btn.addEventListener('click', () => {
      if (Object.keys(place).length < items.length) { ui.say(say, 'Put every card in a box first.', 'no'); return; }
      const wrong = items.map((it, i) => place[i] === it.b ? null : it.t + ' → ' + q.bins[place[i]].t).filter(Boolean);
      tries++; L.check(id, !wrong.length, wrong);
      ans.put(id, { place: Object.assign({}, place), tries, ok: wrong.length ? 0 : 1 });
      if (!wrong.length) { lock(false); return; }
      ui.status('Try ' + (tries + 1));
      ui.say(say, 'Not right yet. Your answer is kept as you left it: think again about each card.', 'no');
      if (!(ans.get(id) || {}).shown) showBtn();
    });
  }
  /* press = choose; press and move = drag (mouse, pen or finger) */
  function dragify(chips, onTap, onDrop) {
    chips.forEach(c => {
      c.addEventListener('pointerdown', e => {
        if (c.disabled || e.button > 0) return;
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

  /* ---------- put in order ---------- */
  function drawOrder(box, id, q) {
    const ui = shell(box, q), A = ans.get(id) || {};
    box.appendChild(h('p', { class: 'q__stem' }, q.stem));
    if (q.table) box.appendChild(h('div', null, q.table));
    const ol = h('ol', { class: 'order' }); box.appendChild(ol);
    const row = h('div', { class: 'q__row' }, '<button class="btn" type="button">Check</button><span class="say"></span>'); box.appendChild(row);
    const btn = $('.btn', row), say = $('.say', row);
    let tries = A.tries || 0, locked = false;
    let ord = (A.ord && A.ord.length === q.items.length) ? A.ord.slice() : (() => { let o; do { o = shuffle(q.items.map((_, i) => i)); } while (o.every((v, i) => v === i)); return o; })();
    /* The numbers are PLACES (1 = first) and stay where they are; only the card moves (21 Oct 2026). */
    function draw(moved) {
      const was = {}; $$('.oc', ol).forEach(c => { was[c.dataset.i] = c.getBoundingClientRect().top; });
      ol.innerHTML = '';
      ord.forEach((oi, k) => {
        const li = h('li', null, `<span class="n">${k + 1}</span><span class="oc" data-i="${oi}"><span class="tx">${esc(q.items[oi])}</span>` + (locked ? '' :
          `<span class="mv"><button type="button" aria-label="Move up" ${k === 0 ? 'disabled' : ''}>↑</button><button type="button" aria-label="Move down" ${k === ord.length - 1 ? 'disabled' : ''}>↓</button></span>`) + '</span>');
        if (locked) li.classList.add('right');
        ol.appendChild(li);
        if (!locked) {
          const [up, dn] = $$('.mv button', li);
          up.addEventListener('click', () => { swap(k, k - 1); const b = $$('.mv button', ol)[(k - 1) * 2]; if (b && !b.disabled) b.focus(); });
          dn.addEventListener('click', () => { swap(k, k + 1); const b = $$('.mv button', ol)[(k + 1) * 2 + 1]; if (b && !b.disabled) b.focus(); });
        }
      });
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      $$('.oc', ol).forEach(c => {
        const dy = was[c.dataset.i] != null ? was[c.dataset.i] - c.getBoundingClientRect().top : 0;
        if (dy && c.animate && !still) c.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 200, easing: 'ease-out' });
        if (c.dataset.i === String(moved)) { c.classList.add('is-moved'); setTimeout(() => c.classList.remove('is-moved'), 900); }
      });
    }
    function swap(a, b) { if (b < 0 || b >= ord.length) return; const m = ord[a]; [ord[a], ord[b]] = [ord[b], ord[a]]; ans.put(id, { ord: ord.slice() }); ui.say(say, ''); draw(m); }
    function lock(shown) { locked = true; btn.remove(); const sb = $('.show', row); if (sb) sb.remove(); const hb = $('.btn.help', row); if (hb) hb.remove(); draw(); ui.status(shown ? 'Order shown' : RIGHT, !shown); ui.say(say, shown ? 'This is the order.' : 'The right order.', shown ? '' : 'ok'); if (q.why) ui.why(q.why, shown); }
    function showBtn() {
      if (tries < 2 || $('.show', row)) return;
      const sb = h('button', { class: 'btn ghost show', type: 'button' }, 'Show the order'); row.insertBefore(sb, say);
      sb.addEventListener('click', () => { L.check(id, false, ['answers shown']); ord = q.items.map((_, i) => i); ans.put(id, { ord: ord.slice(), shown: 1 }); draw(); sb.remove(); ui.say(say, 'This is the order. Read it, then press Check.', ''); });
    }
    if (A.ok) { lock(false); addHint(box, row, id, q, true); return; }
    if (A.shown) ord = q.items.map((_, i) => i);
    draw(); if (tries) ui.status('Try ' + (tries + 1)); if (A.shown) ui.say(say, 'This is the order. Read it, then press Check.', ''); else showBtn(); addHint(box, row, id, q, false);
    btn.addEventListener('click', () => {
      const ok = ord.every((v, i) => v === i); tries++;
      L.check(id, ok, ok ? [] : ['order ' + ord.map(v => v + 1).join('-')]);
      ans.put(id, { ord: ord.slice(), tries, ok: ok ? 1 : 0 });
      if (ok) { lock(false); return; }
      ui.status('Try ' + (tries + 1)); ui.say(say, 'Not right yet. Your order is kept as you left it.', 'no'); if (!(ans.get(id) || {}).shown) showBtn();
    });
  }

  const DRAW = { gaps: drawGaps, mcq: drawMcq, sort: drawSort, order: drawOrder };
  /* one check, drawn into its box (<div class="q" data-q="<id>">) */
  function draw(box) {
    const id = box.dataset.q, q = (window.QS || {})[id];
    if (!q || !DRAW[q.kind]) { box.textContent = 'Missing question ' + id; return; }
    DRAW[q.kind](box, id, q);
  }
  window.REVchecks = { canon, markGaps, parseGaps, draw };
})();
