/* ============================================================
   ibpass.js — the IB pass: Year 12 and 13 find the IB layer open (15 Nov 2026).
   Daniel, 15 Nov 2026 (to the proposal "A: an IB map with direct doors; B: Year 12 and 13 open the IB layer by
   themselves"): "make sure that this only appears for IB students. So when an IB student signs in and that IB student
   is a year 12 or year 13, then this is activated. Otherwise, just leave it as it is for any other year group".
   So the pass is on only for a pupil who is signed in with the school Google account, is on the teacher's class list,
   and whose class is in Year 12 or 13: its first number, the labs script's own rule (_classCohort_: "12A", "Y13" and
   "13 Bio" are Year 12 or 13). A teacher signed in with Google has it too, so that Daniel can see what they see.
   Anyone else (signed out, Year 7 to 11, not on the list) has today's game, unchanged.
   The class comes from js/lesson.js (Lesson.who and its 'lesson:who' event): what the reply to lesson.mine already
   holds; nothing more is asked. The last answer is kept for that account only (cellgame.ibpass: { email, on }), so a
   page opened again is ready before the records answer; another account signed in on the same computer never gets it,
   and signing out ends it. What the pass opens is in the game's own files: state.js awake, quest.js courseSwitch and
   openPlace, main.js go (the bag) and the IB map (js/game/ibmap.js), js/plant/view.js.
     IBPASS.on()        true while the pass is on
     IBPASS.why()       'year' (Year 12 or 13), 'teacher', or '' (no pass)
     IBPASS.known()     true once this account's records have answered (or a kept answer for it was found)
   The document hears 'ibpass' (detail: { on, why }) each time it changes.
   ============================================================ */
(function (global) {
  'use strict';
  var KEY = 'cellgame.ibpass', SI = global.SignIn || null;
  function store() { try { return global.localStorage || null; } catch (e) { return null; } }
  function kept() { var s = store(); try { var o = s ? JSON.parse(s.getItem(KEY) || 'null') : null; return o && typeof o.email === 'string' ? o : null; } catch (e) { return null; } }
  function keep(o) { var s = store(); try { if (!s) return; if (o) s.setItem(KEY, JSON.stringify(o)); else s.removeItem(KEY); } catch (e) {} }
  /* the year group of a class: its first number (the labs script's _classCohort_) */
  function yearOf(cls) { var m = String(cls || '').match(/\d+/); return m ? +m[0] : 0; }
  function decide(w) {
    if (!w) return '';
    if (w.teacher) return 'teacher';
    var y = yearOf(w.cls);
    return w.onList && (y === 12 || y === 13) ? 'year' : '';
  }
  var why = '', known = false;
  /* at load: the answer kept for the account signed in now (none for another account) */
  var me = SI && SI.who ? SI.who() : null, k = kept();
  if (me && k && k.email === me.email) { why = k.why === 'teacher' || k.why === 'year' ? k.why : ''; known = true; }
  else if (k) keep(null);
  function tell() { try { document.dispatchEvent(new CustomEvent('ibpass', { detail: { on: !!why, why: why } })); } catch (e) {} }
  function hear(w) {
    var was = why;
    if (w && w.email) { why = decide(w); known = true; keep({ email: w.email, why: why }); }
    else { why = ''; known = false; keep(null); }
    if (why !== was) tell();
    else if (w) document.dispatchEvent(new CustomEvent('ibpass-known', { detail: { on: !!why, why: why } }));
  }
  global.addEventListener('lesson:who', function (e) { hear(e.detail || null); });
  /* (the records may have answered before this file ran) */
  if (global.Lesson && global.Lesson.who && global.Lesson.who()) hear(global.Lesson.who());
  global.IBPASS = { on: function () { return !!why; }, why: function () { return why; }, known: function () { return known; } };
})(window);
