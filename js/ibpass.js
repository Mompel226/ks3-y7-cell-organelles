/* ============================================================
   ibpass.js — the IB pass: Year 12 and 13 find the IB layer open (15 Nov 2026).
   Daniel, 15 Nov 2026 (to the proposal "A: an IB map with direct doors; B: Year 12 and 13 open the IB layer by
   themselves"): "make sure that this only appears for IB students. So when an IB student signs in and that IB student
   is a year 12 or year 13, then this is activated. Otherwise, just leave it as it is for any other year group".
   So the pass is on only for a pupil who is signed in with the school Google account, is on the teacher's class list,
   and whose class is in Year 12 or 13: its first number, the labs script's own rule (_classCohort_: "12A", "Y13" and
   "13 Bio" are Year 12 or 13). Anyone else (signed out, Year 7 to 11, not on the list) has today's game, unchanged.
   A teacher chooses (Daniel, the same evening: "as a teacher, it'd be nice to have it as a toggle, either see it as a
   Key Stage 3 or [IGCSE] student and see it as an IB student, depending on the toggle. Right now, I just keep seeing it
   as a Key Stage 3"): "See it as: Year 7 · IB" at the top of the page (main.js), IB at first, the choice kept in this
   browser (cellgame.teacherView). A teacher is whoever the records name a teacher, or anyone signed in with a staff
   address of the school (js/config.js staffDomain: exactly that domain, so never a pupil's @pupils.…). The address is
   needed: the labs script names a teacher only while Google's hour-long sign-in is fresh, never on its own 30-day pass,
   and before it the game kept showing Daniel the Year 7 game.
   The class comes from js/lesson.js (Lesson.who and its 'lesson:who' event): what the reply to lesson.mine already
   holds; nothing more is asked. The last answer is kept for that account only (cellgame.ibpass: { email, why }), so a
   page opened again is ready before the records answer; another account signed in on the same computer never gets it,
   and signing out ends it. What the pass opens is in the game's own files: state.js awake, quest.js courseSwitch and
   openPlace, main.js go (the bag) and the IB map (js/game/ibmap.js), js/plant/view.js.
     IBPASS.on()          true while the pass is on (a Year 12 or 13 pupil; a teacher seeing it as IB)
     IBPASS.why()         'year' (Year 12 or 13), 'teacher', or '' (no pass)
     IBPASS.teacher()     true for a teacher, whichever way they see it
     IBPASS.view()        a teacher's choice: 'ib' or 'y7';  IBPASS.setView('ib' | 'y7') changes it
     IBPASS.known()       true once this account's records have answered (or a kept answer, or a staff address)
   The document hears 'ibpass' (detail: { on, why, toggled }) each time the pass or the kind of visitor changes.
   ============================================================ */
(function (global) {
  'use strict';
  var KEY = 'cellgame.ibpass', VKEY = 'cellgame.teacherView', SI = global.SignIn || null, CFG = global.PRACTICAL_CONFIG || {};
  var STAFF = String(CFG.staffDomain || '').toLowerCase();
  function store() { try { return global.localStorage || null; } catch (e) { return null; } }
  function kept() { var s = store(); try { var o = s ? JSON.parse(s.getItem(KEY) || 'null') : null; return o && typeof o.email === 'string' ? o : null; } catch (e) { return null; } }
  function keep(o) { var s = store(); try { if (!s) return; if (o) s.setItem(KEY, JSON.stringify(o)); else s.removeItem(KEY); } catch (e) {} }
  /* a staff address: exactly the school's domain after the @ (a pupil's is under it: @pupils.<domain>) */
  function staff(email) { return !!STAFF && String(email || '').toLowerCase().split('@').pop() === STAFF; }
  /* the year group of a class: its first number (the labs script's _classCohort_) */
  function yearOf(cls) { var m = String(cls || '').match(/\d+/); return m ? +m[0] : 0; }
  function decide(w) {
    if (!w) return '';
    if (w.teacher || staff(w.email)) return 'teacher';
    var y = yearOf(w.cls);
    return w.onList && (y === 12 || y === 13) ? 'year' : '';
  }
  function view() { var s = store(); try { return s && s.getItem(VKEY) === 'y7' ? 'y7' : 'ib'; } catch (e) { return 'ib'; } }
  var why = '', known = false;
  function on() { return why === 'year' || (why === 'teacher' && view() === 'ib'); }
  /* at load: a staff address at once; else the answer kept for the account signed in now (none for another account) */
  var me = SI && SI.who ? SI.who() : null, k = kept();
  if (me && staff(me.email)) { why = 'teacher'; known = true; }
  else if (me && k && k.email === me.email) { why = k.why === 'teacher' || k.why === 'year' ? k.why : ''; known = true; }
  else if (k) keep(null);
  function tell(toggled) { try { document.dispatchEvent(new CustomEvent('ibpass', { detail: { on: on(), why: why, toggled: !!toggled } })); } catch (e) {} }
  function hear(w) {
    var was = why, wasOn = on();
    if (w && w.email) { why = decide(w); known = true; keep({ email: w.email, why: why }); }
    else {
      /* signed out, or another account signing in before its records answer: a staff address is known at once */
      var m = SI && SI.who ? SI.who() : null;
      if (m && staff(m.email)) { why = 'teacher'; known = true; } else { why = ''; known = false; keep(null); }
    }
    if (why !== was || on() !== wasOn) tell();
    else if (w) document.dispatchEvent(new CustomEvent('ibpass-known', { detail: { on: on(), why: why } }));
  }
  function setView(v) {
    var wasOn = on(), s = store();
    try { if (s) s.setItem(VKEY, v === 'y7' ? 'y7' : 'ib'); } catch (e) {}
    if (on() !== wasOn) tell(true);
  }
  global.addEventListener('lesson:who', function (e) { hear(e.detail || null); });
  /* (the records may have answered before this file ran) */
  if (global.Lesson && global.Lesson.who && global.Lesson.who()) hear(global.Lesson.who());
  global.IBPASS = { on: on, why: function () { return why; }, teacher: function () { return why === 'teacher'; },
                    view: view, setView: setView, known: function () { return known; } };
})(window);
