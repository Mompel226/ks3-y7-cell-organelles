/* ============================================================
   quest.js — the quest panel and the buttons on the world (4 Nov 2026).
   The panel is the pupil's book: on the map it holds the mission, what they carry and the places; in a place it holds
   what the structure is (its one definition, from the shared KS3 glossary), the story steps one at a time (each waits:
   memory animations-wait-for-the-reader), the choices, a "Did you know?", the checks, and "See the real thing".
   What to press stands ON the 3D part it acts on (hot buttons, memory year7-text-and-instructions), and is also
   written, highlighted, in the step. On a phone the panel is a sheet at the bottom; the world is above it.
   ============================================================ */
import { ICON } from './icons.js?v=202611051707';
import { state, COST } from './state.js?v=202611051707';
import { sound } from './sound.js?v=202611051707';
import { finalLine } from './final.js?v=202611051707';
/* See the real thing (lens.js) is fetched a few seconds after the page, not with it (5 Nov 2026, speed: it brings the
   3D model loader); a place's end card adds its button as soon as it is here */
let HAS_LENS = null;
const lensReady = new Promise(res => setTimeout(() => import('./lens.js?v=202611051707').then(m => { HAS_LENS = m.HAS_LENS; res(m); }, () => res(null)), 3000));
import { simpleCard } from './simplecard.js?v=202611051707';

const R = window.REV, { $, $$, h, esc } = R;
/* a text of the story: each line (\n in story.js) is a short paragraph of its own, one idea each (Daniel, 4 Nov 2026) */
const paras = t => String(t).split('\n').map(x => `<p>${x}</p>`).join('');
const STORY = window.STORY, ITEMS = window.ITEMS;
const MAPPED = ['wayin', 'nucleus', 'nucleolus', 'mito', 'ribosome', 'ser', 'rer', 'golgi', 'tracks', 'exit'];

export class Quest {
  constructor({ world, names, panel, hots, bag, onPlace }) {
    this.w = world; this.names = names; this.panel = panel; this.hotsEl = hots; this.bag = bag; this.onPlace = onPlace;
    this.hots = []; this.cur = null; this.session = 0;
    this.loop = this.loop.bind(this); requestAnimationFrame(this.loop);
    state.on(() => this.paintBag());
    this.paintBag();
  }

  /* ---------- buttons on the world, following their 3D point ---------- */
  hot(at, label, { cls = '', icon = '', side = 'c', aria } = {}) {
    /* the wrapper follows the 3D point; the button inside stands on it (c), above it (t), below it (b) or beside it */
    const wrap = h('div', { class: 'hot3 ' + cls + ' hot3--' + side });
    const el = h('button', { type: 'button', class: 'hot3__b', 'aria-label': aria || label.replace(/<[^>]+>/g, '') }, (icon ? ICON[icon] || '' : '') + `<span>${label}</span>`);
    wrap.appendChild(el); this.hotsEl.appendChild(wrap);
    const o = { el, wrap, at, side, alive: true };
    o.done = new Promise(res => { el.addEventListener('click', () => { if (o.alive) { sound.tap(); res(o); } }); });
    o.remove = () => { o.alive = false; wrap.remove(); this.hots = this.hots.filter(x => x !== o); };
    this.hots.push(o); this.place1(o); if (o.box) this.paint(o);
    return o;
  }
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
      this.keeps = [document.querySelector('.hud'), ...document.querySelectorAll('#names.on .nm')].filter(Boolean).map(box).filter(Boolean);
      this.w.camera.updateMatrixWorld(); this.hots.forEach(o => this.place1(o)); this.spread(); this.hots.forEach(o => { if (o.box) this.paint(o); });
    }
    requestAnimationFrame(this.loop);
  }
  clearHots() { this.hots.slice().forEach(o => o.remove()); }

  /* ---------- the bag: what the pupil carries, and the energy bar ---------- */
  paintBag() {
    const S = state.get(), b = this.bag; if (!b) return;
    const keys = Object.keys(ITEMS).filter(k => k !== 'energy' && (S.items[k] || 0) > 0);
    const e = Math.round(S.items.energy);
    b.innerHTML = `<div class="bag__e" role="img" aria-label="Energy ${e} out of 100"><span class="bag__ek">${ICON.energy}<b>Energy</b></span><span class="bag__bar"><i style="width:${e}%"></i></span></div>` +
      `<div class="bag__items" aria-label="What you carry">${keys.length ? keys.map(k => `<span class="bag__it" data-it="${k}" title="">${ICON[k] || ''}<span>${esc(ITEMS[k].name)}${ITEMS[k].many && S.items[k] > 1 ? ' ×' + S.items[k] : ''}</span></span>`).join('') : '<span class="bag__none">You carry nothing yet.</span>'}</div>`;
    b.classList.toggle('low', e < 20);
  }
  /* an item flies from the world into the bag, then the bag holds it */
  gain(item, from, n = 1) {
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
      <p class="qp__note">Molecules in this world are drawn thousands of times larger than they are, so that you can see them.</p>
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
    const P = STORY[id], G = window.KS3_GLOSSARY;
    const def = P.def && G && G.by[P.def] ? G.by[P.def] : null;
    /* a word with two meanings (nucleus: a cell's and an atom's): here, only the cell's */
    const defText = def ? def.d.replace(/^In a cell: (.*?) In an atom:.*$/, (m, a) => a.charAt(0).toUpperCase() + a.slice(1)) : '';
    this.setPanel(`<div class="qp qp--place" data-place="${id}">
      <div class="qp__top">${id === 'arrive' && !state.done('arrive') ? '' : '<button type="button" class="qp__back">← The map</button>'}${P.kind ? `<span class="qp__kind">${esc(P.kind)}</span>` : ''}</div>
      <h2 class="qp__title">${esc(P.title)}</h2>
      ${def ? `<div class="qp__def">${P.y7 ? '<span class="qp__y7">Year 7 must know</span>' : '<span class="qp__x">Explorer: beyond the Year 7 list</span>'}<p><b>${esc(def.en)}:</b> ${esc(defText)}</p></div>` : ''}
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
      ol.appendChild(li);
    });
    R.terms(ol);
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
    }
    if (my !== this.session) return;
    state.finish(id);
    if (P.task) R.L.done(P.task);
    this.finishPanel(id, true);
  }
  /* the end of a place: first its checks, then, when every one is right, the place is done (✦): its message, a "Did you
     know?", the real thing, and the way to the map (Daniel, 4 Nov 2026: "You have to complete the questions. It's like
     completing a game"). The first place has no way to the map before that: nothing is awake yet. */
  finishPanel(id, fresh) {
    const P = STORY[id], end = $('.qp__end', this.panel); if (!end) return;
    const qs = state.checks(id), my = this.session, first = id === 'arrive';
    end.hidden = false;
    end.innerHTML = `<p class="qp__k">Check what you learned</p>
      <p class="qp__todo" role="status"></p>
      ${qs.map(q => `<div class="q" data-q="${q}"></div>`).join('')}
      <div class="qp__won"></div>
      <div class="qp__nav"${first ? ' hidden' : ''}><button type="button" class="qp__mapbtn">← Back to the map</button></div>`;
    R.terms(end);
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
        ${P.explore ? `<button type="button" class="qp__real qp__explore">${esc(P.explore)}</button>` : ''}`;
      R.terms(won);
      /* See the real thing, before the Explorer film (now, or once lens.js is here) */
      const lensBtn = () => {
        if (!HAS_LENS || !HAS_LENS(id) || !won.isConnected || $('.qp__real:not(.qp__explore)', won)) return;
        const rb = h('button', { type: 'button', class: 'qp__real' }, `🔍 See the real thing: ${esc(P.title.split(':')[0].toLowerCase())}`);
        won.insertBefore(rb, $('.qp__explore', won));
        rb.addEventListener('click', () => document.dispatchEvent(new CustomEvent('lens', { detail: id })));
      };
      if (HAS_LENS) lensBtn(); else lensReady.then(lensBtn);
      /* an Explorer film of this place (the nucleus: how a cell copies a gene), again at any time */
      const xb = $('.qp__explore', won); if (xb) xb.addEventListener('click', () => document.dispatchEvent(new CustomEvent('explore', { detail: id })));
      nav.hidden = false; if (first) $('.qp__mapbtn', nav).textContent = 'Go to the map →';
      /* the place is done now: the map wakes what it gave (main.js), and the pupil sees it at once */
      if (now) { sound.gain(); document.dispatchEvent(new CustomEvent('place-complete', { detail: id })); this.scrollTo(won); }
    };
    paint();
    if (!was) document.addEventListener('progress', paint);
    if (fresh) this.scrollTo(end);
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

  /* ---------- inside a step ---------- */
  say(html, cls = '') { if (!this.step) return; this.step.say.className = 'step__say ' + cls; this.step.say.innerHTML = html; R.terms(this.step.say); }
  next(label = 'Next step') {
    const b = h('button', { type: 'button', class: 'btn next pulse' }, label + ' →');
    this.step.do.appendChild(b); b.focus({ preventScroll: true });
    return new Promise(res => b.addEventListener('click', () => { b.remove(); res(); }, { once: true }));
  }
  /* choices written in the step: resolves with the index of the right one; a wrong one calls onWrong(i), which shows what
     really happens, then the pupil chooses again */
  choose(opts, right, onWrong) {
    const box = h('div', { class: 'choices' });
    /* a new order each time they are drawn, so the right one is not always A (memory feedback-questions); data-i keeps
       each choice's own number */
    const order = opts.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    order.forEach((i, k) => box.appendChild(h('button', { type: 'button', class: 'choice', 'data-i': i }, `<span class="lt">${'ABC'[k]}</span><span>${opts[i]}</span>`)));
    this.step.do.appendChild(box);
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
  /* enough energy for a job? If not, the step says where to get more and waits for the pupil to come back */
  energy(n) {
    if (state.spend(n)) return true;
    this.say(`Not enough energy. <b>Go to the mitochondria</b>: with glucose and oxygen they release more. (Glucose and oxygen enter the cell at <b>the way in</b>.)`, 'no');
    this.bag.classList.add('low');
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
