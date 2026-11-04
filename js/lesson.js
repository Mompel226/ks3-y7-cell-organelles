/* ============================================================
   lesson.js — an IB practical keeps how each pupil is doing, question by question, for their teacher.
   SHARED: labs-shared/practical/lesson.js is the source. tools/practicals-sync.mjs copies it into every practical in
   labs-shared/practicals.json as js/lesson.js (with labs-shared/signin.js as js/signin.js). Never edit a copy.

   Daniel, 11 Oct 2026: "a live board for IB practicals … how many times they press, the different options, when they get
   the right answer the first time, what are the questions that they are struggling with". Not homework, not a mark.

   The page tells this file what happens, and nothing else changes on the page:
     Lesson.check(id, right, wrong)  a press of Check, or a choice: right or not, and the wrong answers given this time
                                     (a list of short strings: "o2" for the third option, "3=accepted" for gap 3);
     Lesson.done(id)                 a written answer finished (a model answer opened after their own);
     Lesson.restart(ids)             ↺ Start again: the next check of each opens a new round (nothing is deleted);
     Lesson.restartAll()             the whole page started again.
   Each question keeps its rounds (round 1 is the first go), each with its checks, how it went (f right at the first
   check, 1 right after more checks, t tried and not right yet, d written) and its wrong answers. The rules are the labs
   script's own (§practicals: _prRound_, _prMergeQ_, _prFold_): round 1 and the newest five kept, older ones only add
   their checks.

   The same one Google sign-in as the Biology Hub and every lab (js/signin.js). Signed out, the page works exactly as
   before and nothing leaves the browser. Signed in, the record goes to the labs' Apps Script (PRACTICAL_CONFIG.submitUrl),
   which keeps it only for pupils on the teacher's class list. Cadence (memory labs-save-on-their-own): a minute after the
   last change (practical classes are small), at once when the page is left, and at sign-in (their record comes back
   first, then what this browser holds goes). A save the records could not take goes again a minute later.
   ============================================================ */
(function (global) {
  'use strict';
  var CFG = global.PRACTICAL_CONFIG || {}, SI = global.SignIn || null, CID = CFG.googleClientId || '';
  var ID = String(CFG.id || ''), KEY = 'lesson.' + ID, OWNER_KEY = KEY + '.owner', UNSENT_KEY = KEY + '.unsent';
  var QID = /^[a-z0-9][a-z0-9-]{0,47}$/, ROUNDS = 6, WRONG = 6, SAVE_AFTER = 60000, RETRY = 60000;
  var RANK = { '': 0, t: 1, '1': 2, f: 3, d: 3 };
  var me = SI ? SI.who() : null, server = null, pending = {}, timer = null, gen = 0, state = 'idle', notListedSaid = false;

  /* ---------- the record, kept in this browser ---------- */
  function store() { try { return global.localStorage || null; } catch (e) { return null; } }
  function load() {
    var st = store(), o = null;
    try { o = st ? JSON.parse(st.getItem(KEY) || 'null') : null; } catch (e) { o = null; }
    return o && typeof o === 'object' && o.q && typeof o.q === 'object' ? o : { q: {} };
  }
  var REC = load();
  function persist() { var st = store(); try { if (st) st.setItem(KEY, JSON.stringify(REC)); } catch (e) { /* full or blocked: memory only */ } }
  function now() { return Math.floor(Date.now() / 1000); }
  function topWrong(w) {
    var out = {};
    Object.keys(w).sort(function (a, b) { return w[b] - w[a] || (a < b ? -1 : 1); }).slice(0, WRONG).forEach(function (k) { out[k] = w[k]; });
    return out;
  }
  function fold(x) {
    var first = x.r.length && x.r[0].n === 1 ? 1 : 0, keep = ROUNDS - first;
    while (x.r.length - first > keep) { var gone = x.r.splice(first, 1)[0]; x.f = Math.max(x.f || 0, gone.n); x.mc = (x.mc || 0) + gone.c; }
    return x;
  }
  function q(id) { return REC.q[id] || (REC.q[id] = { r: [], f: 0, mc: 0 }); }
  /* the open round: the newest, unless ↺ Start again closed it */
  function open(x) {
    var last = x.r[x.r.length - 1];
    if (last && !last.e) return last;
    var r = { n: last ? last.n + 1 : (x.f ? x.f + 1 : 1), c: 0, s: '', w: {}, a: 0, z: 0 };
    x.r.push(r); fold(x);
    return x.r[x.r.length - 1];
  }
  function check(id, right, wrong) {
    if (!ID || !QID.test(String(id))) return;
    var x = q(id), r = open(x), t = now();
    r.c++; if (!r.a) r.a = t; r.z = t;
    var s = right ? (r.c === 1 ? 'f' : '1') : 't';
    if (RANK[s] > RANK[r.s]) r.s = s;
    if (!right && wrong && wrong.length) {
      wrong.forEach(function (k) {
        k = String(k == null ? '' : k).replace(/\s+/g, ' ').trim().slice(0, 48);
        if (k) r.w[k] = (r.w[k] || 0) + 1;
      });
      r.w = topWrong(r.w);
    }
    changed(id);
  }
  function done(id) {
    if (!ID || !QID.test(String(id))) return;
    var x = q(id), r = open(x), t = now();
    if (r.s === 'd') return;                          /* written once is enough */
    r.c++; if (!r.a) r.a = t; r.z = t; r.s = 'd';
    changed(id);
  }
  function restart(ids) {
    (ids || []).forEach(function (id) {
      var x = REC.q[id], last = x && x.r[x.r.length - 1];
      if (last && last.c > 0 && !last.e) { last.e = 1; changed(id); }
    });
  }
  function restartAll() { restart(Object.keys(REC.q)); if (Object.keys(pending).length) flush(true); }

  /* two copies of one question's record (this browser and the teacher's records): the labs script's own rule */
  function mergeRound(a, b) {
    var w = {}, k;
    for (k in a.w) w[k] = a.w[k];
    for (k in b.w) w[k] = Math.max(w[k] || 0, b.w[k]);
    var r = { n: a.n, c: Math.max(a.c, b.c), s: RANK[b.s] > RANK[a.s] ? b.s : a.s, w: topWrong(w),
              a: a.a && b.a ? Math.min(a.a, b.a) : (a.a || b.a), z: Math.max(a.z, b.z) };
    if (a.e || b.e) r.e = 1;
    return r;
  }
  function mergeQ(a, b) {
    if (!a) return b; if (!b) return a;
    var by = {};
    a.r.concat(b.r).forEach(function (r) { by[r.n] = by[r.n] ? mergeRound(by[r.n], r) : r; });
    var x = { r: Object.keys(by).map(Number).sort(function (p, s) { return p - s; }).map(function (n) { return by[n]; }),
              f: Math.max(a.f || 0, b.f || 0), mc: Math.max(a.mc || 0, b.mc || 0) };
    x.r = x.r.filter(function (r) { return r.n === 1 || r.n > x.f; });
    return fold(x);
  }
  function sameQ(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  /* ---------- whose work this browser holds (a shared computer) ----------
     The record belongs to the account it was last saved for. Another account signing in does not get it: it leaves
     this browser (it is in its owner's record already, unless it could not be sent: then the message says so). */
  function markUnsent(on) { var st = store(); try { if (!st) return; if (on) st.setItem(UNSENT_KEY, '1'); else st.removeItem(UNSENT_KEY); } catch (e) {} }
  function unsentHere() { var st = store(); try { return !!(st && st.getItem(UNSENT_KEY)); } catch (e) { return true; } }
  function workHere() { return Object.keys(REC.q).length > 0; }
  function claimFor(email) {
    var st = store(), was = '';
    try { was = st ? (st.getItem(OWNER_KEY) || '') : ''; } catch (e) {}
    if (was && email && was !== email && workHere()) {
      var unsent = unsentHere() || Object.keys(pending).length > 0;
      REC = { q: {} }; persist(); pending = {}; markUnsent(false);
      say(unsent ? 'This computer had another student’s answers, and some may not have reached their record. They have been removed from this computer; none were added to yours.'
                 : 'This computer had another student’s answers. They stay in their record; none were added to yours.');
    }
    try { if (st && email) st.setItem(OWNER_KEY, email); } catch (e) {}
  }

  /* ---------- the line under the page's title ---------- */
  function syncOn() { return !!(CFG.submitUrl && SI && CID && ID); }
  function creds() { var c = SI && SI.creds ? SI.creds() : null; return (c && me && c.email === me.email) ? c : null; }
  function notListed() { return !!(server && server.onList === false); }
  function words() {
    if (!me) return 'Sign in with your school Google account, so your teacher can see how you are doing. Nothing else is shared.';
    if (state === 'stale') return 'Not sent yet: your sign-in has expired. Sign in again; nothing is lost.';
    if (!server) return state === 'failed' ? 'Could not reach your teacher’s records: kept in this browser for now.' : 'Connecting to your teacher’s records…';
    if (!server.onList && server.teacher) return 'You are signed in as a teacher: your own answers are not recorded.';
    if (!server.onList) return 'You are not on your teacher’s class list yet, so this is kept in this browser only.';
    if (state === 'saving' || Object.keys(pending).length) return 'Saves as you go…';
    if (state === 'failed') return 'Could not save just now: it will try again in a minute.';
    return state === 'saved' ? 'Saved for your teacher ✓' : 'Saves as you go.';
  }
  var bar = null, sayTimer = null;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function paint() {
    bar = bar || document.getElementById('lessonBar');
    if (!bar) return;
    if (!syncOn()) { bar.hidden = true; return; }
    bar.hidden = false; bar.innerHTML = '';
    if (me) bar.appendChild(el('span', 'lesson__who', 'Signed in as ' + String(me.name || me.email || '').split(' ')[0]));
    var w = el('span', 'lesson__say' + (state === 'stale' || state === 'failed' || (notListed() && !server.teacher) ? ' is-no' : ''), words());
    w.setAttribute('aria-live', 'polite'); bar.appendChild(w);
    if (server && server.teacher && server.teacherPage && /^https:\/\//.test(server.teacherPage)) {
      var a = el('a', 'lesson__t', 'Teacher board ↗'); a.href = server.teacherPage; a.target = '_blank'; a.rel = 'noopener'; bar.appendChild(a);
    }
    if (me && state !== 'stale') {
      var out = el('button', 'lesson__out', 'Sign out'); out.type = 'button';
      out.addEventListener('click', function () { if (Object.keys(pending).length && creds()) flush(); SI.out(); });
      bar.appendChild(out);
    }
    if (!me || state === 'stale') {
      var g = el('span', 'lesson__g'); bar.appendChild(g);
      SI.loaded(function (ok) {
        if (!ok || !g.isConnected) return;
        var small = global.matchMedia && global.matchMedia('(max-width: 560px)').matches;
        SI.button(g, CID, small ? { type: 'icon', theme: 'outline', size: 'medium', shape: 'circle', locale: 'en-GB' }
                                : { theme: 'outline', size: 'medium', text: 'signin_with', shape: 'pill', locale: 'en-GB' });
      }, 10000);
    }
    if (sayTimer) { var m = el('span', 'lesson__msg', sayTimer.text); bar.appendChild(m); }
  }
  function say(text) {   /* a message that stays on the line for a while (another student's answers, a refusal) */
    if (sayTimer) clearTimeout(sayTimer.id);
    sayTimer = { text: text, id: setTimeout(function () { sayTimer = null; paint(); }, 12000) };
    paint();
  }
  function set(st) { state = st; paint(); }
  function spent() { if (me && syncOn()) set('stale'); }

  /* ---------- saving ---------- */
  function post(body, leaving) {
    var opts = { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) };
    if (leaving) opts.keepalive = true;              /* the page is going: let the request outlive it */
    return fetch(CFG.submitUrl, opts).then(function (r) { return r.ok ? r.json() : null; });
  }
  function changed(id) {
    persist(); gen++; markUnsent(true);
    if (!syncOn() || !me || notListed()) return;
    pending[id] = 1; paint();
    if (!timer) timer = setTimeout(function () { timer = null; flush(); }, SAVE_AFTER);
  }
  function flush(leaving) {
    var ids = Object.keys(pending);
    if (!ids.length || !me || notListed() || !syncOn()) return;
    var c = creds(), g0 = gen;
    if (!c) { if (leaving) return; SI.renew(CID, function (v) { if (v && creds()) flush(); else spent(); }); return; }
    pending = {}; clearTimeout(timer); timer = null;
    if (!leaving) set('saving');
    var body = { action: 'lesson.save', id: ID, token: c.token, pass: c.pass, q: {} };
    ids.forEach(function (id) { if (REC.q[id]) body.q[id] = REC.q[id]; });
    function again() { ids.forEach(function (id) { pending[id] = 1; }); clearTimeout(timer); timer = setTimeout(function () { timer = null; flush(); }, RETRY); }
    post(body, leaving).then(function (j) {
      if (j && !j.ok && /^not on your teacher/.test(String(j.why || ''))) {
        server = server || {}; server.onList = false; set('failed');
        if (!notListedSaid) { notListedSaid = true; say('Not saved for your teacher: ' + j.why); }
        return;
      }
      if (!j || !j.ok) {
        again();
        if (j && j.why === 'not signed in') { if (c.pass && SI.dropPass) SI.dropPass(c.pass); if (creds()) set('failed'); else spent(); }
        else set('failed');
        return;
      }
      set('saved');
      if (!Object.keys(pending).length && g0 === gen) markUnsent(false);
    }).catch(function () { again(); set('failed'); });
  }
  global.addEventListener('pagehide', function () { if (Object.keys(pending).length) flush(true); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && Object.keys(pending).length) flush(true); });

  /* ---------- their own record back, then everything this browser holds ---------- */
  var asking = '';
  function fetchMine() {
    if (!syncOn() || !me) return;
    var c = creds();
    if (!c) { SI.renew(CID, function (v) { if (v && creds()) fetchMine(); else spent(); }); return; }
    if (asking === c.email) return;
    var asked = asking = c.email;
    post({ action: 'lesson.mine', id: ID, token: c.token, pass: c.pass }).then(function (j) {
      if (asking === asked) asking = '';
      if (!me || me.email !== asked) return;
      if (!j || !j.ok) {
        if (j && j.why === 'not signed in') { if (c.pass && SI.dropPass) SI.dropPass(c.pass); if (creds()) set('failed'); else spent(); }
        else set('failed');
        return;
      }
      server = j;
      /* their record from another computer: it only ever adds */
      Object.keys(j.q || {}).forEach(function (id) {
        if (!QID.test(id) || !j.q[id] || !Array.isArray(j.q[id].r)) return;
        var m = mergeQ(REC.q[id] || null, j.q[id]);
        if (!REC.q[id] || !sameQ(m, REC.q[id])) REC.q[id] = m;
      });
      persist();
      if (j.onList) {                     /* and what this browser holds, once, so nothing done signed out is lost */
        Object.keys(REC.q).forEach(function (id) { pending[id] = 1; });
        flush();
      }
      set(state === 'saving' ? 'saving' : 'saved');
    }).catch(function () { if (asking === asked) asking = ''; if (me && me.email === asked) set('failed'); });
  }

  /* The sign-in changed, here or in another tab of the site: another account starts afresh; the same pupil with a new
     sign-in sends what waited while the old one had expired. */
  if (SI) SI.on(function (v) {
    var was = me && me.email, other = !v || v.email !== was;
    me = v;
    if (v && other) { server = null; notListedSaid = false; state = 'idle'; claimFor(v.email); paint(); fetchMine(); return; }
    if (!v) { server = null; state = 'idle'; paint(); return; }
    if (state === 'stale' || !server || Object.keys(pending).length || unsentHere()) { state = 'idle'; fetchMine(); }
    paint();
  });

  global.Lesson = { check: check, done: done, restart: restart, restartAll: restartAll,
                    /* for tests and the page's own checks */
                    record: function () { return JSON.parse(JSON.stringify(REC)); }, mergeQ: mergeQ };
  function start() {
    paint();
    if (SI && SI.passFrom && syncOn()) SI.passFrom(CFG.submitUrl);   /* the labs script's own pass, when it is due */
    if (me && syncOn()) { claimFor(me.email); fetchMine(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(window);
