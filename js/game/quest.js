/* ============================================================
   quest.js — the quest panel and the buttons on the world (4 Nov 2026).
   The panel is the pupil's book: on the map it holds the mission, what they carry and the places; in a place it holds
   what the structure is (its one definition, from the shared KS3 glossary), the story steps one at a time (each waits:
   memory animations-wait-for-the-reader), the choices, a "Did you know?", the checks, and "See the real thing".
   What to press stands ON the 3D part it acts on (hot buttons, memory year7-text-and-instructions), and is also
   written, highlighted, in the step. On a phone the panel is a sheet at the bottom; the world is above it.
   ============================================================ */
import { ICON } from './icons.js?v=202611041337';
import { state, COST } from './state.js?v=202611041337';
import { sound } from './sound.js?v=202611041337';
import { HAS_LENS } from './lens.js?v=202611041337';
import { simpleCard } from './simplecard.js?v=202611041337';

const R = window.REV, { $, $$, h, esc } = R;
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
    o.done = new Promise(res => { el.addEventListener('click', () => { if (o.alive) res(o); }); });
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
    /* never under the box at the top left (energy, the bag, the word bank): below it instead */
    const k = this.keep;
    if (k && x + r > k.l - 6 && x + l < k.r + 6 && y + bt > k.t - 6 && y + tp < k.b + 6) y = Math.min(B - bt, k.b + 8 - tp);
    o.x = x; o.y = y; o.box = { l: x + l, r: x + r, t: y + tp, b: y + bt };
    o.on = sc.inFront; o.isEdge = Math.abs(x - sc.x) > 0.5 || Math.abs(y - sc.y) > 0.5;
  }
  /* buttons held at the edge never cover each other: each one that overlaps an earlier one moves down (or up, at the
     foot) by the overlap */
  spread() {
    const edge = this.hots.filter(o => o.on && o.isEdge && o.box), s = this.w.size, B = s.h - (this.w.inset.bottom || 0) - 10;
    edge.sort((a, b) => a.box.t - b.box.t);
    for (let i = 1; i < edge.length; i++) for (let j = 0; j < i; j++) {
      const a = edge[j].box, o = edge[i], b = o.box;
      if (b.l < a.r + 4 && b.r > a.l - 4 && b.t < a.b + 4 && b.b > a.t - 4) {
        let dy = a.b + 6 - b.t; if (b.b + dy > B) dy = a.t - 6 - b.b;
        o.y += dy; b.t += dy; b.b += dy;
      }
    }
  }
  paint(o) {
    o.wrap.style.transform = `translate(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px)`;
    o.wrap.style.visibility = o.on ? 'visible' : 'hidden';
    o.wrap.classList.toggle('edge', o.isEdge);
  }
  loop() {
    if (this.hots.length) {
      const hud = document.querySelector('.hud'), L = this.hotsEl.getBoundingClientRect(), r = hud && hud.getBoundingClientRect();
      this.keep = r && r.width ? { l: r.left - L.left, r: r.right - L.left, t: r.top - L.top, b: r.bottom - L.top } : null;
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
      const P = STORY[id], awake = state.awake(id), done = state.done(id), miss = state.missing(id);
      const needs = miss.map(n => n.indexOf('in-') === 0 ? 'enter the nucleus first' : (ITEMS[n] ? ITEMS[n].name : n));
      return `<li class="pl ${done ? 'is-done' : awake ? 'is-open' : 'is-asleep'}"><button type="button" data-go="${id}" ${awake ? '' : 'aria-disabled="true"'}>
        <span class="pl__n">${esc(P.title)}</span>
        <span class="pl__s">${done ? '✦ done' : awake ? (state.step(id) ? 'continue' : 'awake: go there') : 'asleep · needs ' + needs.map(esc).join(', ')}</span></button></li>`;
    };
    const left = list.filter(id => !state.done(id)).length;
    this.setPanel(`<div class="qp qp--map">
      <p class="qp__eyebrow">Your mission</p>
      <h2 class="qp__title">Make amylase and release it from the cell</h2>
      <p class="qp__lead">${left ? `Go to a place that is <b>awake</b>. A place that is asleep wakes when you carry what it needs. <mark class="do">Press a glowing place on the cell, or choose one here.</mark>` : 'Every place is done. Well done: you made amylase, released it and tested it.'}</p>
      <ol class="pls">${list.map(row).join('')}</ol>
      <p class="qp__note">Molecules in this world are drawn thousands of times larger than they are, so that you can see them.</p>
    </div>`);
    $$('[data-go]', this.panel).forEach(b => b.addEventListener('click', () => { if (b.getAttribute('aria-disabled') !== 'true') this.onPlace(b.dataset.go); else this.whyAsleep(b.dataset.go, b); }));
  }
  whyAsleep(id, near) {
    const miss = state.missing(id).map(n => n.indexOf('in-') === 0 ? 'Enter the nucleus first: the nucleolus is inside it.' : `You need <b>${esc(ITEMS[n].name)}</b> (from ${esc(STORY[giver(n)] ? STORY[giver(n)].title : 'another place')}).`);
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
      ${P.intro ? `<p class="qp__intro">${P.intro}</p>` : ''}
      ${P.figure === 'simple' ? simpleCard() : ''}
      <ol class="steps"></ol>
      <div class="qp__end" hidden></div>
    </div>`);
    /* the first place has no way to the map until it is finished: before it, every place sleeps and the map has no way back */
    const back = $('.qp__back', this.panel); if (back) back.addEventListener('click', () => this.onPlace(null));
    const ol = $('.steps', this.panel);
    const from = state.done(id) ? P.steps.length : state.step(id);
    P.steps.forEach((s, i) => {
      const li = h('li', { class: 'step' + (i < from ? ' is-done' : i === from ? ' is-now' : ' is-later') }, `<div class="step__t">${s.text}</div><div class="step__do"></div><p class="step__say" aria-live="polite"></p>`);
      if (i > from) li.hidden = true;
      ol.appendChild(li);
    });
    R.terms(ol);
    if (from >= P.steps.length) { this.finishPanel(id); return; }
    for (let i = from; i < P.steps.length; i++) {
      if (my !== this.session) return;
      const li = ol.children[i]; li.hidden = false; li.classList.remove('is-later'); li.classList.add('is-now');
      this.scrollTo(li);
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
  finishPanel(id, fresh) {
    const P = STORY[id], end = $('.qp__end', this.panel); if (!end) return;
    const qs = Object.keys(window.QS).filter(k => window.QS[k].part === P.part);
    end.hidden = false;
    end.innerHTML = `<div class="qp__done">${ICON.star}<p>${P.done}</p></div>
      ${P.fact ? fact(P.fact) : ''}${P.fact2 ? fact(P.fact2) : ''}
      ${HAS_LENS(id) ? `<button type="button" class="qp__real">🔍 See the real thing: ${esc(P.title.split(':')[0].toLowerCase())}</button>` : ''}
      <p class="qp__k">Check what you learned</p>
      ${qs.map(q => `<div class="q" data-q="${q}"></div>`).join('')}
      <div class="qp__nav"><button type="button" class="qp__mapbtn">← Back to the map</button></div>`;
    R.terms(end);
    $$('.q', end).forEach(b => window.REVchecks.draw(b));
    $('.qp__mapbtn', end).addEventListener('click', () => this.onPlace(null));
    const rb = $('.qp__real', end); if (rb) rb.addEventListener('click', () => document.dispatchEvent(new CustomEvent('lens', { detail: id })));
    if (fresh) this.scrollTo(end);
  }

  /* only the panel scrolls, never the page (a step or the end comes into view inside it) */
  scrollTo(el) {
    const p = this.panel, top = el.getBoundingClientRect().top - p.getBoundingClientRect().top + p.scrollTop - 12;
    if (top < p.scrollTop || top + Math.min(el.offsetHeight, p.clientHeight - 24) > p.scrollTop + p.clientHeight) p.scrollTo({ top, behavior: R.FAST ? 'auto' : 'smooth' });
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
    opts.forEach((t, i) => box.appendChild(h('button', { type: 'button', class: 'choice', 'data-i': i }, `<span class="lt">${'ABC'[i]}</span><span>${t}</span>`)));
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
function fact(f) { return `<aside class="fact"><p class="fact__k">✦ Did you know?</p><p>${f.text}</p>${f.src ? `<p class="fact__src">${esc(f.src)}</p>` : ''}</aside>`; }
/* which place gives an item */
/* "is" or "are" after a place's title (Mitochondria are awake) */
export const isAre = id => STORY[id].plural ? 'are' : 'is';
export function giver(item) { return Object.keys(STORY).find(k => (STORY[k].gives || []).indexOf(item) >= 0); }
export { COST, MAPPED };
