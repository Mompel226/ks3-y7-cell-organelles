/* ============================================================
   quest.js — the quest panel and the buttons on the world (4 Nov 2026).
   The panel is the pupil's book: on the map it holds the mission, what they carry and the places; in a place it holds
   what the structure is (its one definition, from the shared KS3 glossary, and how to say it: core.js sayHtml), the story
   steps one at a time (each waits: memory animations-wait-for-the-reader), the choices, a "Did you know?", the checks,
   and "See the real thing".
   What to press stands ON the 3D part it acts on (hot buttons, memory year7-text-and-instructions), and is also
   written, highlighted, in the step. On a phone the panel is a sheet at the bottom; the world is above it.
   ============================================================ */
import { ICON } from './icons.js?v=202611141733';
import { state, COST } from './state.js?v=202611141733';
import { sound } from './sound.js?v=202611141733';
import { finalLine } from './final.js?v=202611141733';
/* See the real thing (lens.js) is fetched a few seconds after the page, not with it (5 Nov 2026, speed: it brings the
   3D model loader); a place's end card adds its button as soon as it is here */
let HAS_LENS = null;
const lensReady = new Promise(res => setTimeout(() => import('./lens.js?v=202611141733').then(m => { HAS_LENS = m.HAS_LENS; res(m); }, () => res(null)), 3000));
import { simpleCard } from './simplecard.js?v=202611141733';

const R = window.REV, { $, $$, h, esc } = R;
/* a text of the story: each line (\n in story.js) is a short paragraph of its own, one idea each (Daniel, 4 Nov 2026) */
const paras = t => String(t).split('\n').map(x => `<p>${x}</p>`).join('');
const STORY = window.STORY, ITEMS = window.ITEMS;
const MAPPED = ['wayin', 'nucleus', 'nucleolus', 'mito', 'ribosome', 'ser', 'rer', 'golgi', 'tracks', 'exit'];

export class Quest {
  constructor({ world, names, panel, hots, bag, onPlace }) {
    this.w = world; this.names = names; this.panel = panel; this.hotsEl = hots; this.bag = bag; this.onPlace = onPlace;
    this.hots = []; this.cur = null; this.session = 0;
    /* the line each step said last (say below), kept so that a finished step still shows it: place:step → { html, cls } */
    this.said = R.store.get('said', {}) || {};
    this.loop = this.loop.bind(this); requestAnimationFrame(this.loop);
    state.on(() => this.paintBag());
    /* the bag's fold button (paintBag): the pupil's own choice, until they go to another place or the map */
    bag.addEventListener('click', e => {
      if (!e.target.closest('.bag__fold')) return;
      this.bagFold = !this.bag.classList.contains('is-folded'); this.paintBag();
      const b = this.bag.querySelector('.bag__fold'); if (b) b.focus();
      if (!this.w.moving) this.names.show();
    });
    this.paintBag();
  }

  /* ---------- buttons on the world, following their 3D point ---------- */
  /* right: of several buttons at once, the right one (a step watched again presses it by itself: watching below) */
  hot(at, label, { cls = '', icon = '', side = 'c', aria, right = false } = {}) {
    /* the wrapper follows the 3D point; the button inside stands on it (c), above it (t), below it (b) or beside it */
    const wrap = h('div', { class: 'hot3 ' + cls + ' hot3--' + side });
    const el = h('button', { type: 'button', class: 'hot3__b', 'aria-label': aria || label.replace(/<[^>]+>/g, '') }, (icon ? ICON[icon] || '' : '') + `<span>${label}</span>`);
    wrap.appendChild(el); this.hotsEl.appendChild(wrap);
    const o = { el, wrap, at, side, alive: true };
    o.done = new Promise(res => { el.addEventListener('click', () => { if (o.alive) { sound.tap(); res(o); } }); });
    o.remove = () => { o.alive = false; wrap.remove(); this.hots = this.hots.filter(x => x !== o); };
    this.hots.push(o); this.place1(o); if (o.box) this.paint(o);
    if (this.watchingNow()) {
      const w = this.watching;
      setTimeout(() => { if (!o.alive || o.el.disabled || this.watching !== w || this.session !== w.session) return; if (right || !this.hots.some(x => x !== o && x.alive && !x.el.disabled)) { o.el.classList.add('is-auto'); o.el.click(); } }, R.TEST ? 0 : 900);
    }
    return o;
  }
  /* a finished step watched again (play.js watch): its buttons press themselves, a choice picks its right answer, and
     no item flies to the bag; with Reduce motion these pauses keep their time (only the tests' ?still=1 skips them), so
     the stills show.
     (14 Nov 2026, Daniel: "there is very little time to see the animation and see the green text … when I press watch
     this again, the green text disappears. I cannot see the green text again". Before, a step watched again said
     nothing, its Next waited 3 s whatever there was to read, and the panel, drawn again after it, had lost every
     finished step's line. Now its lines are said again, where they were said the first time; Next is a button again,
     which presses itself only after the time the line needs to be read (0.3 s a word, 3 to 15 s); and every finished
     step keeps the line it said last (this.said, saved with the game). Proof: tools/replay-view.mjs) */
  watchingNow() { return !!(this.watching && this.watching.session === this.session); }
  place1(o) {
    const p = typeof o.at === 'function' ? o.at() : o.at; if (!p) return;
    /* a button never leaves the free part of the picture (never under the panel or off the edge): it stays at the edge,
       nearest its part, until its part comes into view. Its own size and side are measured (again when its words change),
       so a button beside its point (side l or r) or a long one never reaches past the edge either */
    const t = o.el.textContent;
    if (o.t !== t || !o.bw) { o.t = t; o.bw = o.el.offsetWidth; o.bh = o.el.offsetHeight; }
    const sd = o.side, bw = o.bw, bh = o.bh, G = 10;
    const [l, r] = sd === 'r' ? [8, 8 + bw] : sd === 'l' ? [-bw - 8, -8] : [-bw / 2, bw / 2];
    const [tp, bt] = sd === 't' ? [-bh, 0] : sd === 'b' ? [0, bh] : [-bh / 2, bh / 2];
    const sc = this.w.project(p), s = this.w.size;
    const R = s.w - (this.w.inset.right || 0) - G, B = s.h - (this.w.inset.bottom || 0) - G;
    let x = Math.max(G - l, Math.min(R - r, sc.x)), y = Math.max(G - tp, Math.min(B - bt, sc.y));
    /* never under the box at the top left (energy, the bag, the word bank), nor on a name on the world: the nearest free
       place beside, below or above what it touches (on a phone the names stand close together: a button pushed below
       one only met the next) */
    const keeps = this.keeps || [], hit = (px, py) => keeps.some(k => px + r > k.l - 6 && px + l < k.r + 6 && py + bt > k.t - 6 && py + tp < k.b + 6);
    if (hit(x, y)) {
      const fits = ([px, py]) => px + l >= G && px + r <= R && py + tp >= G && py + bt <= B && !hit(px, py);
      const near = keeps.flatMap(k => [[x, k.b + 8 - tp], [x, k.t - 8 - bt], [k.r + 8 - l, y], [k.l - 8 - r, y]]).filter(fits)
        .sort((a, b) => Math.hypot(a[0] - x, a[1] - y) - Math.hypot(b[0] - x, b[1] - y))[0];
      if (near) { x = near[0]; y = near[1]; }
    }
    o.x = x; o.y = y; o.box = { l: x + l, r: x + r, t: y + tp, b: y + bt };
    o.on = sc.inFront; o.isEdge = Math.abs(x - sc.x) > 0.5 || Math.abs(y - sc.y) > 0.5;
  }
  /* buttons and labels on the world never cover each other (Daniel's rule): of two that touch, one moves the smallest
     step, down, up, right or left, that keeps it in the free part of the picture and off the corner box; again until
     none touch (a crowded phone: seven buttons in a narrow strip needed sideways steps); one moved off its point is
     drawn dashed */
  spread() {
    const on = this.hots.filter(o => o.on && o.box), s = this.w.size, G = 10, keeps = this.keeps || [];
    const B = s.h - (this.w.inset.bottom || 0) - G, Rt = s.w - (this.w.inset.right || 0) - G;
    const touch = (a, b) => b.l < a.r + 4 && b.r > a.l - 4 && b.t < a.b + 4 && b.b > a.t - 4;
    const fits = (b, dx, dy) => b.l + dx >= G && b.r + dx <= Rt && b.t + dy >= G && b.b + dy <= B &&
      !keeps.some(k => b.r + dx > k.l - 6 && b.l + dx < k.r + 6 && b.b + dy > k.t - 6 && b.t + dy < k.b + 6);
    const shift = (o, dx, dy) => { o.x += dx; o.y += dy; o.box.l += dx; o.box.r += dx; o.box.t += dy; o.box.b += dy; o.isEdge = true; };
    /* the smallest step that takes box b clear of box a */
    const steps = (a, b) => [[0, a.b + 6 - b.t], [0, a.t - 6 - b.b], [a.r + 6 - b.l, 0], [a.l - 6 - b.r, 0]].sort((x, y) => Math.abs(x[0]) + Math.abs(x[1]) - Math.abs(y[0]) - Math.abs(y[1]));
    for (let pass = 0; pass < 24; pass++) {
      let moved = false;
      on.sort((a, b) => a.box.t - b.box.t || a.box.l - b.box.l);
      for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) {
        const p = on[i], o = on[j]; if (!touch(p.box, o.box)) continue;
        moved = true;
        const mo = steps(p.box, o.box).find(([dx, dy]) => fits(o.box, dx, dy));
        if (mo) { shift(o, mo[0], mo[1]); continue; }
        const mp = steps(o.box, p.box).find(([dx, dy]) => fits(p.box, dx, dy));
        if (mp) shift(p, mp[0], mp[1]); else shift(o, 0, p.box.b + 6 - o.box.t);   /* no room at all: below, even if low */
      }
      if (!moved) break;
    }
  }
  paint(o) {
    o.wrap.style.transform = `translate(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px)`;
    o.wrap.style.visibility = o.on ? 'visible' : 'hidden';
    o.wrap.classList.toggle('edge', o.isEdge);
  }
  loop() {
    if (this.hots.length) {
      const L = this.hotsEl.getBoundingClientRect(), box = el => { const r = el.getBoundingClientRect(); return r.width ? { l: r.left - L.left, r: r.right - L.left, t: r.top - L.top, b: r.bottom - L.top } : null; };
      /* what a button keeps off: the box at the top left, and the names on the world (the way in names its parts) */
      /* (and the switch "Simple / As it really is" at the foot of the picture, when it shows: play.js REAL) */
      this.keeps = [document.querySelector('.hud'), document.querySelector('.realsw:not([hidden])'), ...document.querySelectorAll('#names.on .nm')].filter(Boolean).map(box).filter(Boolean);
      this.w.camera.updateMatrixWorld(); this.hots.forEach(o => this.place1(o)); this.spread(); this.hots.forEach(o => { if (o.box) this.paint(o); });
    }
    requestAnimationFrame(this.loop);
  }
  clearHots() { this.hots.slice().forEach(o => o.remove()); }

  /* ---------- the bag: what the pupil carries, and the energy bar ----------
     It folds (Daniel, 7 Nov 2026: "as the things gets bigger and bigger, the panel on the left hides more and more, so
     you don't see things ... make this panel collapsible ... always consider what this panel is hiding when showing
     animations"): in a place, where the steps play, it folds by itself once it holds three kinds of item, to its energy
     bar and a button that says how many; on the map, where the pupil chooses where to go, it opens. A press on the
     button holds until the pupil goes to another place or to the map (openPlace, openMap). */
  paintBag() {
    const S = state.get(), b = this.bag; if (!b) return;
    const keys = Object.keys(ITEMS).filter(k => k !== 'energy' && (S.items[k] || 0) > 0);
    const e = Math.round(S.items.energy);
    const folded = keys.length > 0 && (this.bagFold != null ? this.bagFold : !!this.inPlace && keys.length >= 3);
    const fold = keys.length ? `<button type="button" class="bag__fold" aria-expanded="${!folded}" aria-controls="bagItems">${folded ? `Show ${keys.length} item${keys.length > 1 ? 's' : ''} ▾` : 'Hide ▴'}</button>` : '';
    b.innerHTML = `<div class="bag__top"><div class="bag__e" role="img" aria-label="Energy ${e} out of 100"><span class="bag__ek">${ICON.energy}<b>Energy</b></span><span class="bag__bar"><i style="width:${e}%"></i></span></div>${fold}</div>` +
      `<div class="bag__items" id="bagItems" aria-label="What you carry"${folded ? ' hidden' : ''}>${keys.length ? keys.map(k => `<span class="bag__it" data-it="${k}" title="">${ICON[k] || ''}<span>${esc(ITEMS[k].name)}${ITEMS[k].many && S.items[k] > 1 ? ' ×' + S.items[k] : ''}</span></span>`).join('') : '<span class="bag__none">You carry nothing yet.</span>'}</div>`;
    b.classList.toggle('low', e < 20); b.classList.toggle('is-folded', folded);
  }
  /* an item flies from the world into the bag, then the bag holds it */
  gain(item, from, n = 1) {
    if (this.watching) return Promise.resolve();
    const slot = this.bag.getBoundingClientRect(), stage = this.hotsEl.getBoundingClientRect();
    const sc = from ? this.w.project(from) : { x: stage.width / 2, y: stage.height / 2 };
    const f = h('span', { class: 'flyer' }, ICON[item] || ICON.star);
    f.style.left = (stage.left + sc.x) + 'px'; f.style.top = (stage.top + sc.y) + 'px';
    document.body.appendChild(f);
    requestAnimationFrame(() => { f.style.left = (slot.left + 40) + 'px'; f.style.top = (slot.top + 30) + 'px'; f.classList.add('go'); });
    setTimeout(() => { f.remove(); state.add(item, n); sound.gain(); this.bag.classList.remove('pop'); void this.bag.offsetWidth; this.bag.classList.add('pop'); }, R.FAST ? 0 : 900);
    return new Promise(r => setTimeout(r, R.FAST ? 0 : 950));
  }

  /* ---------- the panel ---------- */
  setPanel(html) { this.panel.innerHTML = html; R.terms(this.panel); this.panel.scrollTop = 0; this.panel.classList.toggle('is-map', html.indexOf('qp--map') >= 0); }
  /* the map: the mission, the places (awake or asleep), and the bag */
  openMap() {
    this.session++; this.clearHots(); this.cur = null;
    this.inPlace = false; this.bagFold = null; this.paintBag();
    this.w.setPlaceLook && this.w.setPlaceLook();
    const list = MAPPED.concat(['test']).filter(id => STORY[id]);
    const row = id => {
      const P = STORY[id], awake = state.awake(id), done = state.complete(id), miss = state.missing(id);
      const needs = miss.map(needName);
      return `<li class="pl ${done ? 'is-done' : awake ? 'is-open' : 'is-asleep'}"><button type="button" data-go="${id}" ${awake ? '' : 'aria-disabled="true"'}>
        <span class="pl__n">${esc(P.title)}</span>
        <span class="pl__s">${done ? '✦ done' : state.done(id) ? 'answer its checks to finish' : awake ? (state.step(id) ? 'continue' : 'awake: go there') : 'asleep · needs ' + needs.map(esc).join(', ')}</span></button></li>`;
    };
    const left = list.filter(id => !state.complete(id)).length;
    /* the final check is not a place in the cell: always there, it needs the code from the end of the journey */
    const fin = `<li class="pl pl--final"><button type="button" data-go="final"><span class="pl__n">✦ Final check</span><span class="pl__s">${esc(finalLine())}</span></button></li>`;
    this.setPanel(`<div class="qp qp--map">
      <p class="qp__eyebrow">Your mission</p>
      <h2 class="qp__title">Make amylase and release it from the cell</h2>
      <div class="qp__lead">${left ? paras('Go to a place that is <b>awake</b>. A place that is asleep wakes when you carry what it needs.\n<mark class="do">Press a glowing place on the cell, or choose one here.</mark>') : paras('Every place is done. Well done: you made amylase, released it and tested it.\n<mark class="do">Then do the ✦ Final check, last in this list, with the code you got at the end of your journey.</mark>')}</div>
      <ol class="pls">${list.map(row).join('')}${fin}</ol>
      <p class="qp__note">On the map, small things such as ribosomes are drawn larger, so that you can see them. From very near, everything is at its true size.</p>
    </div>`);
    $$('[data-go]', this.panel).forEach(b => b.addEventListener('click', () => { if (b.getAttribute('aria-disabled') !== 'true') this.onPlace(b.dataset.go); else this.whyAsleep(b.dataset.go, b); }));
  }
  whyAsleep(id, near) {
    const miss = state.missing(id).map(n => n.indexOf('in-') === 0 ? 'Enter the nucleus first: the nucleolus is inside it.'
      : n.indexOf('checks:') === 0 ? `Answer every check at <b>${esc(STORY[n.slice(7)].title)}</b> first: that finishes it.`
      : `You need <b>${esc(ITEMS[n].name)}</b> (from ${esc(STORY[giver(n)] ? STORY[giver(n)].title : 'another place')}).`);
    const t = h('div', { class: 'asleep', role: 'note' }, `<b>${esc(STORY[id].title)} ${isAre(id)} asleep.</b> ${miss.join(' ')}`);
    $$('.asleep', this.panel).forEach(x => x.remove());
    (near && near.closest('li') || this.panel.firstChild).appendChild(t);
  }

  /* a place: its definition, then its steps one at a time */
  async openPlace(id, run) {
    const my = ++this.session; this.clearHots(); this.cur = id;
    this.inPlace = true; this.bagFold = null; this.paintBag();
    const P = STORY[id], G = window.KS3_GLOSSARY;
    const def = P.def && G && G.by[P.def] ? G.by[P.def] : null;
    /* a word with two meanings (nucleus: a cell's and an atom's): here, only the cell's */
    const defText = def ? def.d.replace(/^In a cell: (.*?) In an atom:.*$/, (m, a) => a.charAt(0).toUpperCase() + a.slice(1)) : '';
    this.setPanel(`<div class="qp qp--place" data-place="${id}">
      <div class="qp__top">${id === 'arrive' && !state.done('arrive') ? '' : '<button type="button" class="qp__back">← The map</button>'}${P.kind ? `<span class="qp__kind">${esc(P.kind)}</span>` : ''}</div>
      <h2 class="qp__title">${esc(P.title)}</h2>
      ${def ? `<div class="qp__def">${P.y7 ? '<span class="qp__y7">Year 7 must know</span>' : '<span class="qp__x">Explorer: beyond the Year 7 list</span>'}<p><b>${esc(def.en)}:</b> ${esc(defText)}</p>${R.say(def)}</div>` : ''}
      ${P.intro ? `<div class="qp__intro">${paras(P.intro)}</div>` : ''}
      ${P.figure === 'simple' ? simpleCard() : ''}
      <ol class="steps"></ol>
      <div class="qp__end" hidden></div>
    </div>`);
    /* the first place has no way to the map until it is finished: before it, every place sleeps and the map has no way back */
    const back = $('.qp__back', this.panel); if (back) back.addEventListener('click', () => this.onPlace(null));
    const ol = $('.steps', this.panel);
    const from = state.done(id) ? P.steps.length : state.step(id);
    P.steps.forEach((s, i) => {
      const li = h('li', { class: 'step' + (i < from ? ' is-done' : i === from ? ' is-now' : ' is-later') }, `<div class="step__t">${paras(s.text)}</div><div class="step__do"></div><p class="step__say" aria-live="polite"></p>`);
      if (i > from) li.hidden = true;
      /* a finished step shows the line it said (Daniel, 14 Nov 2026: "the green text disappears. I cannot see the green
         text again"): the panel is drawn again each time the pupil comes back to a place, and after each ↻ */
      const sd = i < from && this.said[id + ':' + i];
      if (sd && sd.html) { const y = $('.step__say', li); y.className = 'step__say ' + (sd.cls || ''); y.innerHTML = sd.html; }
      ol.appendChild(li);
      if (i < from) this.againBtn(id, i, li);
    });
    R.terms(ol);
    this.courseSwitch(id);
    if (from >= P.steps.length) { this.finishPanel(id); return; }
    for (let i = from; i < P.steps.length; i++) {
      if (my !== this.session) return;
      const li = ol.children[i]; li.hidden = false; li.classList.remove('is-later'); li.classList.add('is-now');
      this.scrollTo(li, i === from);                               /* the panel just opened: no scrolling to watch */
      this.step = { li, do: $('.step__do', li), say: $('.step__say', li), i };
      const ok = await run(P.steps[i].play, i, () => my === this.session);
      if (my !== this.session || ok === false) return;
      li.classList.remove('is-now'); li.classList.add('is-done'); this.step.do.innerHTML = ''; this.clearHots();
      state.setStep(id, i + 1);
      this.againBtn(id, i, li);
    }
    if (my !== this.session) return;
    state.finish(id);
    if (P.task) R.L.done(P.task);
    this.finishPanel(id, true);
  }
  /* ↻ beside a finished step whose picture moves (Daniel, 9 Nov 2026: "add … circle arrow … to repeat next to every action
     in case the students want to re-see the animation"): it plays that step again, by itself (main.js, play.js watch);
     not for a step that only shows words (story.js watch: false), nor the starch test */
  againBtn(id, i, li) {
    const s = STORY[id].steps[i];
    if (id === 'test' || !s || s.watch === false || $('.step__again', li)) return;
    const b = h('button', { type: 'button', class: 'step__again', 'aria-label': 'Watch this step again', 'data-tip': 'Watch this step again' }, '↻');
    const t = $('.step__t', li), last = t && t.lastElementChild;
    (last || t || li).appendChild(b);
    b.addEventListener('click', () => document.dispatchEvent(new CustomEvent('step-again', { detail: { id, i, li } })));
  }
  /* the course switches, "Your course: IGCSE · IB", in a place that has course layers (story.js `course`: the way in,
     the mitochondria, the nucleus, the ribosomes, the rough ER) and whose every Year 7 check is right (Daniel, 5 Nov
     2026: "Don't provide the IB toggle until they have completed everything"; 12 Nov 2026: "you can add a toggle for
     IGCSE and a toggle for IB … only toggles that are activated once the student is done with the key stage 3"; the
     side quest's own switches, js/plant/view.js, are the model). A switch on adds, under the words of each step, a
     violet box with what that course asks about what the step shows, each line with its level and its statement. The
     Year 7 words and the Year 7 checks never change, and while a box stands under them the step's own words say their
     level, "Year 7" (game.css `steps--lv`; Daniel, 13 Nov 2026: "being a KS3 level sentence next to an IB level one
     (as long as the distinction is clear) is useful for the students to see how they need to improve/change the way
     they write as they progress"). A box may hold a door: to the film that shows the step in detail (`film`; play.js
     opens it: 'coursefilm'), to a chapter of "From glucose to ATP" (`ch`; js/ib/view.js; main.js opens it:
     'ibview') or to "The cell membrane: fluid and mosaic" (`mem`; js/membrane/view.js; main.js: 'memview'). In a place with `names` (the way in, the mitochondria), IB on also puts the page in IB mode (the class
     ib-on): the names on the picture add the IB terms, and what the place says adds its IB sentence under the Year 7
     one (play.js `ib`, which hears 'ib-switch'). The choice is kept (store 'courseLv') and is the same in every
     place. Until 13 Nov 2026 those two places had a switch of their own, "IB Biology" (store 'ibon'), which changed
     the Year 7 sentences into IB ones and hid the checks: a pupil who had it on finds IB on. */
  courseSwitch(id) {
    const P = STORY[id], C = P.course, top = $('.qp__top', this.panel), ol = $('.steps', this.panel), root = document.documentElement;
    if ($('.qp__lv', this.panel)) return;
    if (!C || !top || !ol || !state.checks(id).length || !state.checked(id)) { root.classList.remove('ib-on'); return; }
    const NAME = { igcse: 'IGCSE', ib: 'IB' }, LVN = { c: 'Core', s: 'Supplement', n: 'Not named', sl: 'SL and HL', hl: 'HL only', x: 'Beyond the guide' };
    const FILM = { copy: '🔬 How a cell copies a gene: the film, with your course →', ribo: '🔬 How a ribosome reads the copy: the film →' };
    const CH = ['the map', 'into the cell', 'glycolysis', 'into the mitochondrion', 'the link reaction', 'the Krebs cycle', 'the electron transport chain', 'the tally'];
    const saved = R.store.get('courseLv', null), LV = Object.assign({ igcse: false, ib: !saved && R.store.get('ibon', false) === true }, saved || {});
    if (!saved && LV.ib) R.store.set('courseLv', LV);
    /* its doors into "From glucose to ATP" now show: the view's code may come (main.js warms it, never before a door shows) */
    if (C.ib.some(b => b && (b.ch != null || b.mem))) document.dispatchEvent(new CustomEvent('ib-door'));
    const bar = h('div', { class: 'qp__lv' }, '<span class="qp__lvk">Your course</span>' + ['igcse', 'ib'].map(c =>
      `<button type="button" class="qp__lvb" data-lv="${c}" aria-pressed="false"><span class="qp__ibt" aria-hidden="true"><i></i></span>${NAME[c]}</button>`).join(''));
    top.insertAdjacentElement('afterend', bar);
    let mode = null;
    const draw = () => {
      $$('.step__lv', ol).forEach(x => x.parentNode.removeChild(x));
      ol.classList.toggle('steps--lv', !!(LV.igcse || LV.ib));
      ['igcse', 'ib'].forEach(c => {
        $(`[data-lv="${c}"]`, bar).setAttribute('aria-pressed', String(!!LV[c]));
        if (LV[c]) C[c].forEach((b, i) => {
          const li = ol.children[i]; if (!li || !b) return;
          li.appendChild(h('div', { class: 'step__ib step__lv', 'data-lv': c }, `<p class="step__lvk">${NAME[c]}</p>`
            + b.p.map(([lv, code, t]) => `<p><span class="ibl ibl--${lv}">${c === 'igcse' && code ? `<i>${code}</i> ` : ''}${LVN[lv]}${c === 'ib' && code ? ` <i>${code}</i>` : ''}</span> ${t}</p>`).join('')
            + (b.film ? `<button type="button" class="step__ibdoor step__lvfilm" data-film="${b.film}">${FILM[b.film]}</button>` : '')
            + (b.mem ? '<button type="button" class="step__ibdoor step__lvmem">🧬 The cell membrane: fluid and mosaic →</button>' : '')
            + (b.ch == null ? '' : `<button type="button" class="step__ibdoor step__lvdoor" data-ch="${b.ch}">🧬 From glucose to ATP: ${CH[b.ch]} →</button>`)));
        });
      });
      R.terms(ol);
      /* IB mode, in a place whose picture has IB names: the picture follows only when it changes (IGCSE pressed: no redraw) */
      const on = !!(C.names && LV.ib); root.classList.toggle('ib-on', on);
      if (C.names && on !== mode) { mode = on; document.dispatchEvent(new CustomEvent('ib-switch', { detail: { id, on } })); }
      this.courseQuestions(id);
    };
    bar.addEventListener('click', e => {
      const b = e.target.closest('.qp__lvb'); if (!b) return;
      const c = b.dataset.lv; LV[c] = !LV[c]; R.store.set('courseLv', LV); draw();
      /* the first box just opened comes into view */
      const first = LV[c] && $(`.step__lv[data-lv="${c}"]`, ol);
      if (first && first.scrollIntoView) first.scrollIntoView({ block: 'nearest', behavior: R.FAST ? 'auto' : 'smooth' });
    });
    ol.addEventListener('click', e => {
      const f = e.target.closest('.step__lvfilm'), d = e.target.closest('.step__lvdoor'), m = e.target.closest('.step__lvmem');
      if (f) document.dispatchEvent(new CustomEvent('coursefilm', { detail: { film: f.dataset.film, id } }));
      else if (d) document.dispatchEvent(new CustomEvent('ibview', { detail: { ch: +d.dataset.ch } }));
      else if (m) document.dispatchEvent(new CustomEvent('memview'));
    });
    draw();
  }
  /* the course's own questions (js/questions.js: `place`, `lv`; parts 15 and 16), drawn at the end of their place under
     its Year 7 checks while that course's switch is on, IGCSE above IB (Daniel, 13 Nov 2026: "if you toggle IGCSE and
     you toggle IB, maybe you want to add questions to those levels … if you're key stage 3, you just do the key stage 3
     questions. If you're IGCSE, you do key stage 3 and IGCSE, and if you're IB, you do all of them"). They show only
     where the switches do: once every Year 7 check of the place is right. They are extra: a place's own checks are
     those of its own part (state.js `checks`), so these never keep a place from being done, wake nothing and are not in
     the final check; each is a square of its own on the teacher's board. An IB student is told to answer the IGCSE
     ones too. Called when a switch is pressed (courseSwitch `draw`) and when the place's end is drawn (finishPanel). */
  courseQuestions(id) {
    const end = $('.qp__end', this.panel); if (!end) return;
    $$('.qp__cq', end).forEach(x => x.parentNode.removeChild(x));
    const won = $('.qp__won', end);
    if (!won || end.hidden || !$('.qp__lv', this.panel) || !state.checked(id)) return;
    const QS = window.QS || {}, LV = Object.assign({ igcse: false, ib: false }, R.store.get('courseLv', {})), NAME = { igcse: 'IGCSE', ib: 'IB' };
    const of = c => Object.keys(QS).filter(k => QS[k].place === id && QS[k].lv === c);
    ['igcse', 'ib'].forEach(c => {
      const ids = of(c); if (!LV[c] || !ids.length) return;
      const box = h('div', { class: 'qp__cq', 'data-lv': c }, `<p class="qp__k">${NAME[c]} questions</p>
        <p class="qp__cqn">These questions are extra, for ${NAME[c]} students. They do not change your mission or your final check.${c === 'ib' && !LV.igcse && of('igcse').length ? ' <b>For IB, answer the IGCSE questions as well: switch IGCSE on.</b>' : ''}</p>`
        + ids.map(q => `<div class="q" data-q="${q}"></div>`).join(''));
      end.insertBefore(box, won);
      $$('.q', box).forEach(b => window.REVchecks.draw(b));
      R.terms(box);
    });
  }
  /* the end of a place: first its checks, then, when every one is right, the place is done (✦): its message, a "Did you
     know?", the real thing, and the way to the map (Daniel, 4 Nov 2026: "You have to complete the questions. It's like
     completing a game"). The first place has no way to the map before that: nothing is awake yet. */
  finishPanel(id, fresh) {
    const P = STORY[id], end = $('.qp__end', this.panel); if (!end) return;
    const qs = state.checks(id), my = this.session, first = id === 'arrive';
    end.hidden = false;
    end.innerHTML = `${P.more ? '<div class="qp__more"></div>' : ''}<p class="qp__k">Check what you learned</p>
      <p class="qp__todo" role="status"></p>
      ${qs.map(q => `<div class="q" data-q="${q}"></div>`).join('')}
      <div class="qp__won"></div>
      <div class="qp__nav"${first ? ' hidden' : ''}><button type="button" class="qp__mapbtn">← Back to the map</button></div>`;
    R.terms(end);
    this.moreBox(id);
    $$('.q', end).forEach(b => window.REVchecks.draw(b));
    $('.qp__mapbtn', end).addEventListener('click', () => this.onPlace(null));
    const todo = $('.qp__todo', end), won = $('.qp__won', end), nav = $('.qp__nav', end);
    let was = null;
    const paint = () => {
      if (my !== this.session || !end.isConnected) { document.removeEventListener('progress', paint); return; }
      const right = qs.filter(q => state.checkRight(q)).length, all = right === qs.length;
      todo.hidden = all;
      todo.innerHTML = `To finish this place, answer every check: <b>${right} of ${qs.length}</b> right.`;
      if (all === was) return;
      const now = was === false; was = all;
      if (!all) return;
      document.removeEventListener('progress', paint);
      won.innerHTML = `<div class="qp__done">${ICON.star}<div>${paras(P.done)}</div></div>
        ${P.fact ? fact(P.fact) : ''}${P.fact2 ? fact(P.fact2) : ''}
        ${P.again ? `<button type="button" class="qp__real qp__again">${esc(P.again)}</button>` : ''}
        ${P.plant ? `<div class="qp__side"><p class="qp__sidek">Side quest · extra</p><p class="qp__sidet">${esc(P.plantNote || '')}</p><button type="button" class="qp__real qp__plant">${esc(P.plant)}</button></div>` : ''}
        ${P.explore ? `<button type="button" class="qp__real qp__explore${P.course && P.course.names ? ' qp__explore--ib' : ''}">${esc(P.explore)}</button>` : ''}`;
      R.terms(won);
      this.courseSwitch(id); this.courseQuestions(id);
      /* See the real thing, before the place's extension (now, or once lens.js is here) */
      const lensBtn = () => {
        if (!HAS_LENS || !HAS_LENS(id) || !won.isConnected || $('.qp__real:not(.qp__explore):not(.qp__again):not(.qp__plant)', won)) return;
        const rb = h('button', { type: 'button', class: 'qp__real' }, `🔍 See the real thing: ${esc(P.title.split(':')[0].toLowerCase())}`);
        won.insertBefore(rb, $('.qp__again', won) || $('.qp__side', won) || $('.qp__explore', won));
        rb.addEventListener('click', () => document.dispatchEvent(new CustomEvent('lens', { detail: id })));
      };
      if (HAS_LENS) lensBtn(); else lensReady.then(lensBtn);
      /* the place's extension, again at any time: the nucleus's Explorer film (how a cell copies a gene); the way in's and the
         mitochondria's IB extension, "From glucose to ATP" (main.js) */
      const xb = $('.qp__explore', won); if (xb) xb.addEventListener('click', () => document.dispatchEvent(new CustomEvent('explore', { detail: id })));
      /* the way in: the door to the plant-cell branch, "Where glucose comes from" (js/plant/view.js, opened by main.js;
         Daniel, 11 Nov 2026). It shows with the place's end, once every check is right, as the IB switch does */
      const pb = $('.qp__plant', won); if (pb) pb.addEventListener('click', () => document.dispatchEvent(new CustomEvent('plant', { detail: { from: id } })));
      /* the nucleus: its dive through a pore again (play.js) */
      const ab = $('.qp__again', won); if (ab) ab.addEventListener('click', () => document.dispatchEvent(new CustomEvent('dive-again', { detail: { id, btn: ab } })));
      nav.hidden = false; if (first) $('.qp__mapbtn', nav).textContent = 'Go to the map →';
      /* the place is done now: the map wakes what it gave (main.js), and the pupil sees it at once */
      if (now) { sound.gain(); document.dispatchEvent(new CustomEvent('place-complete', { detail: id })); this.scrollTo(won); }
    };
    paint();
    if (!was) document.addEventListener('progress', paint);
    if (fresh) this.scrollTo(end);
  }
  /* a return visit to a finished place that gives something again (the way in: glucose and oxygen; the mitochondria:
     energy): ONE press, never every step again (the audit, 11 Nov 2026: a play went through the mitochondria's eight
     steps three times and the way in's five twice; ↻ beside each step still plays its film). story.js `more`: needs (the
     items it uses) or lacks (it gives them only when one is used up), its words, and the press's name; main.js does the
     giving ('place-more'). The box says what to bring when the press cannot be made. */
  moreBox(id) {
    const P = STORY[id], box = $('.qp__more', this.panel); if (!P.more || !box) return;
    const M = P.more, my = this.session;
    const can = () => M.needs ? M.needs.every(n => state.has(n)) : M.lacks.some(n => !state.has(n));
    const draw = said => {
      if (my !== this.session || !box.isConnected) return;
      const ok = can();
      /* the way on for a pupil whom a job stopped for energy (energy, above; `lowAt`: that place): from the way in to
         the mitochondria once glucose and oxygen are carried; in the mitochondria, to the way in when they are
         missing, and back to the place of the job once energy is released */
      const low = this.lowAt && this.lowAt !== id && STORY[this.lowAt] ? this.lowAt : null;
      const on = id === 'wayin' ? (low && !ok && state.awake('mito') ? ['mito', 'Go to the mitochondria'] : null)
        : id === 'mito' ? (said && low ? [low, 'Back to: ' + STORY[low].title] : !ok ? ['wayin', 'Go to the way in'] : null) : null;
      box.innerHTML = `${said ? `<p class="qp__moresaid" role="status">${said}</p>` : ''}<p>${ok ? M.text : M.wait}</p>${ok ? `<button type="button" class="btn next${said ? '' : ' pulse'} qp__morebtn">${esc(M.label)} →</button>` : ''}${on ? `<button type="button" class="btn next pulse qp__morego">${esc(on[1])} →</button>` : ''}`;
      R.terms(box);
      const g = $('.qp__morego', box);
      if (g) g.addEventListener('click', () => { if (on[0] === low) this.lowAt = null; this.onPlace(on[0]); }, { once: true });
      const b = $('.qp__morebtn', box);
      if (b) b.addEventListener('click', () => { b.disabled = true; document.dispatchEvent(new CustomEvent('place-more', { detail: { id, done: () => draw(M.did) } })); }, { once: true });
      /* a pupil who comes for energy finds the box in view: it stands at the place's end, under all its steps, and a
         finished place opens at its top (13 Nov 2026: the button to press was out of sight) */
      if (!said && (b || g) && (this.lowAt || state.energy() < 20)) setTimeout(() => { if (my === this.session && box.isConnected) this.scrollTo(box, true); }, 60);
    };
    draw('');
  }
  /* resolves true when a place is done (its jobs and every check), false if the pupil leaves it first */
  whenComplete(id) {
    const my = this.session;
    return new Promise(res => { const f = () => { if (this.session !== my) return res(false); if (state.complete(id)) return res(true); setTimeout(f, 300); }; f(); });
  }

  /* only the panel scrolls, never the page (a step or the end comes into view inside it) */
  scrollTo(el, instant) {
    const p = this.panel, top = el.getBoundingClientRect().top - p.getBoundingClientRect().top + p.scrollTop - 12;
    if (top < p.scrollTop || top + Math.min(el.offsetHeight, p.clientHeight - 24) > p.scrollTop + p.clientHeight) p.scrollTo({ top, behavior: R.FAST || instant ? 'auto' : 'smooth' });
  }
  /* what a press adds to a step (a question's choices, a message, the Next button) comes into view inside the panel, and a
     question or a message glows for a moment, so the pupil sees at once what to answer (Daniel, 6 Nov 2026: "I couldn't see
     the rest. I had to scroll down ... it gets highlighted a little bit so that the student immediately knows that it needs
     to answer a question on the right"). The whole step stays in view when it fits; when it does not, what is new does.
     The page moves only here, and only down to show the whole game: with the page at its top (a saved game opened again)
     the header is above the game and the bottom of the panel lay below the window. */
  reveal(el, glow = true) {
    const st = this.step; if (!el || !st) return;
    requestAnimationFrame(() => {
      if (!el.isConnected || this.step !== st) return;
      const p = this.panel, g = (p.closest('.stage') || p.parentElement).getBoundingClientRect(), vh = innerHeight;
      if (!document.fullscreenElement && g.bottom > vh + 1) {
        const d = g.height <= vh ? g.bottom - vh + 8 : g.top - 8;
        if (d > 1) window.scrollBy({ top: d, behavior: R.FAST ? 'auto' : 'smooth' });
      }
      const pt = p.getBoundingClientRect().top, y = v => v - pt + p.scrollTop, room = p.clientHeight;
      const er = el.getBoundingClientRect(), sr = st.say.offsetParent ? st.say.getBoundingClientRect() : er;
      const end = y(Math.max(er.bottom, sr.bottom)) + 12, li = y(st.li.getBoundingClientRect().top) - 12;
      const start = end - li <= room ? li : y(er.top) - 12;
      let top = p.scrollTop;
      if (end > top + room) top = end - room;
      if (start < top) top = start;
      if (Math.abs(top - p.scrollTop) > 1) p.scrollTo({ top, behavior: R.FAST ? 'auto' : 'smooth' });
      if (!glow) return;
      el.classList.remove('is-new'); void el.offsetWidth; el.classList.add('is-new');
      clearTimeout(el.newT); el.newT = setTimeout(() => el.classList.remove('is-new'), 1800);
    });
  }

  /* ---------- inside a step ---------- */
  say(html, cls = '') {
    const w = this.watching;
    if (!this.step || (w && w.session !== this.session)) return;   /* (a replay that was stopped says nothing more) */
    this.step.say.className = 'step__say ' + cls; this.step.say.innerHTML = html; R.terms(this.step.say); if (html) this.reveal(this.step.say);
    const key = this.cur + ':' + this.step.i;
    if (w) {
      /* a step watched again: what it says is kept only if it plays to its end (play.js watch), and the time of its
         last line is noted, for the pause after it */
      (w.said || (w.said = {}))[key] = html ? { html, cls } : null;
      if (html) w.last = { t: performance.now(), words: String(html).replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length };
    } else { if (html) this.said[key] = { html, cls }; else delete this.said[key]; R.store.set('said', this.said); }
  }
  /* how long a line of n words stays before a replay goes on by itself: 0.3 s a word, 3 to 15 s */
  readMs(words) { return Math.max(3000, Math.min(15000, 300 * (words || 0))); }
  next(label = 'Next step') {
    if (this.watching) {
      /* (stopped: it never resolves, so the stopped step goes no further) */
      const w = this.watching, b = h('button', { type: 'button', class: 'btn next step__wnext' }, 'Next →');
      const ms = R.TEST ? 0 : w.last ? Math.max(1500, this.readMs(w.last.words) - (performance.now() - w.last.t)) : 3000;
      b.dataset.ms = Math.round(ms); this.step.do.appendChild(b);
      return new Promise(r => {
        let t = 0; const go = () => { clearTimeout(t); b.remove(); if (this.watching === w && this.session === w.session) { w.last = null; w.nextT = performance.now(); r(); } };
        t = setTimeout(go, ms); b.addEventListener('click', go, { once: true });
      });
    }
    const b = h('button', { type: 'button', class: 'btn next pulse' }, label + ' →');
    this.step.do.appendChild(b); b.focus({ preventScroll: true }); this.reveal(b, false);
    return new Promise(res => b.addEventListener('click', () => { b.remove(); res(); }, { once: true }));
  }
  /* choices written in the step: resolves with the index of the right one; a wrong one calls onWrong(i), which shows what
     really happens, then the pupil chooses again */
  choose(opts, right, onWrong) {
    if (this.watching) { const w = this.watching; return new Promise(r => setTimeout(() => { if (this.watching === w && this.session === w.session) r(right); }, R.TEST ? 0 : 700)); }
    const box = h('div', { class: 'choices' });
    /* a new order each time they are drawn, so the right one is not always A (memory feedback-questions); data-i keeps
       each choice's own number */
    const order = opts.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    order.forEach((i, k) => box.appendChild(h('button', { type: 'button', class: 'choice', 'data-i': i }, `<span class="lt">${'ABC'[k]}</span><span>${opts[i]}</span>`)));
    this.step.do.appendChild(box); this.reveal(box);
    return new Promise(res => {
      $$('.choice', box).forEach(b => b.addEventListener('click', async () => {
        const i = +b.dataset.i; if (b.disabled) return;
        if (i === right) { b.classList.add('yes'); $$('.choice', box).forEach(x => { x.disabled = true; }); res(i); return; }
        b.classList.add('no'); sound.no(); $$('.choice', box).forEach(x => { x.disabled = true; });
        await onWrong(i);
        $$('.choice', box).forEach(x => { if (!x.classList.contains('no')) x.disabled = false; });
      }));
    });
  }
  /* enough energy for a job? If not, the step says so and gives the way on: a button to the mitochondria, or to the
     way in first when the pupil carries no glucose or no oxygen; the mitochondria then give a button back to this place
     (moreBox). Before 13 Nov 2026 it was one sentence and the job's button came back unchanged: a pupil wrote to
     Daniel that "the energy is deducted by itself, therefore I can't move to another level".
     `key`: the job's name. A job is paid once in a game (the flag paid-<key>): a step begun again after the pupil left
     the place or opened the page again had charged the same job again (the rough ER's Go, 20 each time). A step
     watched again (play.js watch) pays nothing and marks nothing. */
  energy(n, key) {
    if (key && state.get().flags['paid-' + key]) return true;
    if (state.spend(n)) { if (key) state.setFlag('paid-' + key); return true; }
    const both = state.has('glucose') && state.has('oxygen'), to = both ? 'mito' : 'wayin';
    this.lowAt = this.cur;
    this.say(`<b>Not enough energy for this job.</b> The mitochondria release more energy from glucose and oxygen.${both ? '' : ' You need more glucose and oxygen first: they enter the cell at the way in.'}
      <button type="button" class="btn next qp__lowgo">${both ? 'Go to the mitochondria' : 'Go to the way in'} →</button>`, 'no');
    const b = this.step && $('.qp__lowgo', this.step.say);
    if (b) b.addEventListener('click', () => this.onPlace(to), { once: true });
    this.bag.classList.add('low');
    document.dispatchEvent(new CustomEvent('low-energy', { detail: { to } }));
    return false;
  }
}
function needName(n) {
  if (n.indexOf('in-') === 0) return 'enter the nucleus first';
  if (n.indexOf('checks:') === 0) return 'the checks at ' + STORY[n.slice(7)].title;
  return ITEMS[n] ? ITEMS[n].name : n;
}
function fact(f) { return `<aside class="fact"><p class="fact__k">✦ Did you know?</p><p>${f.text}</p>${f.src ? `<p class="fact__src">${esc(f.src)}</p>` : ''}</aside>`; }
/* which place gives an item */
/* "is" or "are" after a place's title (Mitochondria are awake) */
export const isAre = id => STORY[id].plural ? 'are' : 'is';
export function giver(item) { return Object.keys(STORY).find(k => (STORY[k].gives || []).indexOf(item) >= 0); }
export { COST, MAPPED };
