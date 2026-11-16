/* ============================================================
   restore.js — a signed-in pupil's progress back from their record (16 Nov 2026).
   Daniel, 16 Nov 2026: "usually students, when they have completed work … everything is stored in the spreadsheet. And
   then when they reconnect, even if they erase that, their answers are saved and it shows that it is completed. Right
   now, a few students, they seem to have completed things, but then their progress got erased." The game kept its
   progress only in the browser (cellgame.*): a browser cleared, another computer, or ↺ Start again pressed by someone
   else on a shared computer started the game again, while the teacher's record kept everything (js/lesson.js; the labs
   script's 🔬 Practicals tab). It had never been read back. Now, when the record arrives (lesson.mine), what it says is
   right or done is put back, never taken away:
   - a check right in the record's newest round (f: right first time; 1: right after more checks) is right here too, and
     drawn as answered: its right option, its words, its cards in their boxes, its order (js/checks.js reads these);
   - a place whose square is done (d: its jobs finished) is done; the nucleus is open once it was finished; energy has
     been released once the mitochondria were;
   - the bag holds what a finished place gave and no finished place has used yet, so the next places wake;
   - the side quest is finished when its square is.
   A round closed by ↺ Start again (e) does not count: starting again means starting again. Nothing is told to the record
   (no check is sent twice). Only for a pupil on the class list (Lesson.who: the record is theirs).
   ============================================================ */
const R = window.REV;
/* the record's newest round of a square: right or done, and not closed by Start again */
const okIn = (rec, id) => { const x = rec[id], r = x && Array.isArray(x.r) && x.r[x.r.length - 1]; return !!(r && !r.e && (r.s === 'f' || r.s === '1' || r.s === 'd')); };
/* a right answer as js/checks.js draws one */
function answerOf(q) {
  if (q.kind === 'gaps') {
    const g = window.REVchecks && window.REVchecks.parseGaps ? window.REVchecks.parseGaps(q.text).gaps : [];
    return { ok: 1, v: g.map(x => x[0]), marked: 1 };
  }
  if (q.kind === 'sort') { const place = {}; q.items.forEach((it, i) => { place[i] = Array.isArray(it) ? it[1] : it.b; }); return { ok: 1, place }; }
  if (q.kind === 'order') return { ok: 1, ord: q.items.map((_, i) => i) };
  return { ok: 1 };
}
export function fromRecord(state) {
  const rec = (window.Lesson && window.Lesson.record ? window.Lesson.record().q : {}) || {};
  const QS = window.QS || {}, STORY = window.STORY || {}, S = state.get();
  let answers = 0; const places = [];
  /* the checks (the final check, part 13, keeps its own one go: js/game/final.js reads the record itself) */
  Object.keys(QS).forEach(id => {
    if (QS[id].part === 13 || !okIn(rec, id) || (R.ans.get(id) || {}).ok) return;
    R.ans.put(id, answerOf(QS[id])); answers++;
  });
  /* the places */
  Object.keys(STORY).forEach(id => {
    const P = STORY[id];
    if (!P.task || !okIn(rec, P.task) || S.done[id]) return;
    S.done[id] = true; delete S.step[id]; places.push(id);
  });
  if (S.done.nucleus) S.flags['in-nucleus'] = true;
  if (S.done.mito) S.flags.respired = true;
  /* the bag: given by a finished place, used by no finished place */
  if (places.length) Object.keys(S.items).forEach(item => {
    if (item === 'energy' || S.items[item] > 0) return;
    const giver = Object.keys(STORY).find(k => (STORY[k].gives || []).indexOf(item) >= 0);
    if (!giver || !S.done[giver]) return;
    const used = Object.keys(STORY).some(k => S.done[k] && (STORY[k].needs || []).concat(STORY[k].alsoNeeds || []).indexOf(item) >= 0);
    if (!used) S.items[item] = 1;
  });
  /* the side quest */
  if (okIn(rec, 'game-plant')) { const P = R.store.get('plant', {}) || {}; if (!P.done) { R.store.set('plant', Object.assign({}, P, { done: true })); places.push('plant'); } }
  if (answers || places.length) state.save();
  return { answers, places };
}
