/* ============================================================
   iblevel.js — one course choice and one IB level for the whole game (16 Nov 2026).
   Daniel, 16 Nov 2026, after opening the IB map: "there is no SL HL toggle, which should be existing because otherwise
   my SL students, yeah, they are struggling a little bit. So everything should be SL HL toggle, and … when you toggle IB
   anywhere, it toggles IB everywhere … you toggle it off, you toggle it off, you toggle it on. It does that everywhere."
   So this file holds the two choices, for every part of the game and every view's own address (one browser, one
   choice; another tab hears it through the 'storage' event):
   - the course switches, "Your course: IGCSE · IB" (store 'courseLv', as before: the places, quest.js courseSwitch; the
     two films, ribofilm.js courseLines; and since today the plant cell too, js/plant/view.js, which had a switch of its
     own, 'plantLv');
   - the IB level, "IB level: SL · HL" (store 'ibLevel'): at SL, every line the guide puts under "Additional higher level"
     is hidden (the views' `lvp--hl` paragraphs; the places', films' and plant cell's `ibln--hl` lines; a box that holds
     only HL lines, `iblv-hlbox`; words for HL only, `iblv-hlonly`, and their SL version, `iblv-slonly`), a step or chapter that holds only HL lines is marked HL on its button and Next goes
     past it (skip below), and the IB map shows only the SL statements. Until a pupil chooses, everything shows, as
     before (HL), and the switch asks them to choose once.
   The page hears 'courselv' (detail: the course) and 'iblevel' (detail: { level }) each time a choice changes.
     course()  setCourse(c, on)  level()  chosen()  setLevel('sl' | 'hl')
     levelSwitch()      the switch, as HTML; any number on a page, each kept right by this file (one click listener)
     hlOnly(x)          true when x (a step, a chapter or its text) has HL lines and no SL line
     skip(list, i, dir) the next index from i in dir (+1, -1) to show at this level: past the HL-only ones at SL, unless
                        every one of the list is HL-only (a chapter the pupil chose to read); list.length or -1 at the end
   ============================================================ */
const KC = 'cellgame.courseLv', KL = 'cellgame.ibLevel';
const read = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
let memC = null, memL = null;     /* (a browser that keeps nothing, a private window: the choice holds for this visit) */
export function course() { return Object.assign({ igcse: false, ib: false }, memC || read(KC, {}) || {}); }
export function setCourse(c, on) {
  const L = course(); if (!!L[c] === !!on) return;
  L[c] = !!on; memC = write(KC, L) ? null : L; tell('courselv', L);
}
export function level() { const v = memL || read(KL, null); return v === 'sl' ? 'sl' : 'hl'; }
export function chosen() { const v = memL || read(KL, null); return v === 'sl' || v === 'hl'; }
export function setLevel(v) {
  v = v === 'sl' ? 'sl' : 'hl'; const was = chosen() ? level() : '';
  memL = write(KL, v) ? null : v; paint();
  if (was !== v) tell('iblevel', { level: v });
}
function tell(name, detail) { try { document.dispatchEvent(new CustomEvent(name, { detail })); } catch (e) {} }

const TAGS = /\[(sl|hl)\b/g;
export function hlOnly(x) {
  /* (a step may say it is HL only, hl: true: its words have no tag of their own, as a plain line about the HL steps) */
  if (x && typeof x === 'object' && x.hl === true) return true;
  const s = typeof x === 'string' ? x : JSON.stringify(x || ''); let hl = false;
  for (const m of s.matchAll(TAGS)) { if (m[1] === 'sl') return false; hl = true; }
  return hl;
}
export function skip(list, i, dir) {
  const all = level() === 'sl' && list.length && list.every(hlOnly);
  for (let j = i + dir; j >= 0 && j < list.length; j += dir) if (level() !== 'sl' || all || !hlOnly(list[j])) return j;
  return dir > 0 ? list.length : -1;
}

/* the switch: "IB level SL HL"; while nobody has chosen, both are up and it asks once */
export function levelSwitch() {
  const c = chosen(), v = level();
  return `<div class="iblvs${c ? '' : ' is-open'}" role="group" aria-label="Your IB level"><span class="iblvs__k">IB level</span>`
    + ['sl', 'hl'].map(x => `<button type="button" data-iblv="${x}" aria-pressed="${c && v === x}">${x.toUpperCase()}</button>`).join('')
    + `<span class="iblvs__ask"${c ? ' hidden' : ''}>Choose yours once: the whole game follows</span></div>`;
}
function paint() {
  const c = chosen(), v = level(), root = document.documentElement;
  root.classList.toggle('iblv-sl', v === 'sl');
  document.querySelectorAll('.iblvs').forEach(g => {
    g.classList.toggle('is-open', !c);
    g.querySelectorAll('[data-iblv]').forEach(b => b.setAttribute('aria-pressed', String(c && b.dataset.iblv === v)));
    const a = g.querySelector('.iblvs__ask'); if (a) a.hidden = c;
  });
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.iblvs [data-iblv]'); if (b) setLevel(b.dataset.iblv); });
addEventListener('storage', e => {
  if (e.key === KL) { memL = null; paint(); tell('iblevel', { level: level() }); }
  if (e.key === KC) { memC = null; tell('courselv', course()); }
});

/* the look, the same in the game and in every view's own page (on paper and on the views' dark ground alike) */
if (!document.getElementById('iblv-css')) {
  const st = document.createElement('style'); st.id = 'iblv-css';
  st.textContent = `
.iblv-sl .lvp--hl,.iblv-sl .ibln--hl,.iblv-sl .iblv-hlbox,.iblv-sl .iblv-hlonly,.iblv-slonly{display:none!important}
.iblv-sl .iblv-slonly{display:inline!important}
.iblvs{display:inline-flex;flex-wrap:wrap;align-items:center;gap:4px 0;font:700 13px/1 var(--sans,inherit);color:inherit;vertical-align:middle}
.iblvs__k{padding:0 7px 0 0;font-weight:800;opacity:.8;white-space:nowrap}
.iblvs button{font:800 13.5px/1 var(--sans,inherit);color:inherit;background:transparent;border:1.5px solid currentColor;padding:6px 11px;cursor:pointer;opacity:.72}
.iblvs button+button{border-left:0}
.iblvs button:first-of-type{border-radius:100px 0 0 100px}
.iblvs button:last-of-type{border-radius:0 100px 100px 0}
.iblvs button[aria-pressed="true"]{background:#7243C0;border-color:#7243C0;color:#fff;opacity:1}
.iblvs button:hover{opacity:1}
.iblvs button:focus-visible{outline:2px solid #7243C0;outline-offset:2px}
.iblvs.is-open button{opacity:1}
.iblvs__ask{flex-basis:100%;margin-top:4px;font:600 12.5px/1.3 var(--sans,inherit);opacity:.85}
.iblvs__ask[hidden]{display:none}
.iblv-sl [data-hlo]{opacity:.42}
.iblv-sl [data-hlo]::after{content:"HL";margin-left:3px;font-size:.72em;font-weight:900;vertical-align:super}
.iblv-cline{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px 10px}
.iblv-cline .iblvs__ask{display:none}
/* (on the step count's line the switch keeps the line as tall as it was: the views fit their panel to the window) */
.iblv-cline .iblvs{margin:-5px 0}
.iblv-cline .iblvs button{padding:3px 9px;font-size:12.5px;line-height:1.1}
.iblv-cline .iblvs__k{font-size:12px}
/* on a phone the views keep their step line as it was (the count and the step buttons share it: there is no room), and
   the switch stands under Back and Next instead, beside the key to the tags (iblv-foot) */
.iblv-foot{display:none}
@media (max-width:860px){ .iblv-cline{display:contents} .iblv-cline>div{display:none} .iblv-foot{display:block;margin:14px 0 2px} }
.cbox-more{margin:2px 0 0}
.cbox-more>summary{display:inline-flex;align-items:center;gap:5px;font:800 13.5px/1 var(--sans,inherit);color:#5A2FA8;background:rgba(114,67,192,.08);border:1.5px solid #7243C0;border-radius:999px;padding:5px 11px;cursor:pointer;list-style:none}
.cbox-more>summary::-webkit-details-marker{display:none}
.cbox-more>summary::before{content:"+";font-weight:900;font-size:1.15em;line-height:.8}
.cbox-more[open]>summary::before{content:"−"}
.cbox-more[open]>summary{margin-bottom:8px}
.cbox-more__n{font-weight:700}
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]) .cbox-more>summary{color:#D9C8FF;border-color:#B388FF;background:rgba(179,136,255,.12)} }
:root[data-theme="dark"] .cbox-more>summary{color:#D9C8FF;border-color:#B388FF;background:rgba(179,136,255,.12)}
.iblv-note{display:none}
.iblv-sl .iblv-note{display:block;margin:0 0 8px;padding:7px 10px;border-radius:8px;border:1px dashed currentColor;font-weight:700;opacity:.85}
@media (prefers-color-scheme:dark){.iblvs button[aria-pressed="true"]{background:#B388FF;border-color:#B388FF;color:#1b1430}}
:root[data-theme="light"] .iblvs button[aria-pressed="true"]{background:#7243C0;border-color:#7243C0;color:#fff}
:root[data-theme="dark"] .iblvs button[aria-pressed="true"]{background:#B388FF;border-color:#B388FF;color:#1b1430}`;
  document.head.appendChild(st);
}
paint();
/* a course box's lines, few on show (16 Nov 2026; Daniel, with a picture of the leaf's IGCSE box: "I am a student, I see
   this … I'm not going to read it. It's going to overwhelm me"): one line on show, the first that the pupil's level shows
   and that is not a scope line (what a syllabus does not name, `scope`) or beyond the guide; the others one press away
   under "More (n)", n counting only what the level shows. A box of scope lines only shows its first. Each line:
   { html, hl } (hl: an HL line, hidden at SL); `mid`, on show after the first line (buttons). The page draws the box
   again when the level changes ('iblevel'). */
export function boxLines(lines, { scope = () => false, mid = '' } = {}) {
  const sl = level() === 'sl', vis = l => !(sl && l.hl);
  const lead = lines.find(l => !scope(l) && vis(l)) || lines.find(vis) || null;
  const rest = lines.filter(l => l !== lead), n = rest.filter(vis).length;
  const p = l => `<p${l.hl ? ' class="ibln--hl"' : ''}>${l.html}</p>`;
  return (lead ? p(lead) : '') + mid + (rest.length ? `<details class="cbox-more"${n ? '' : ' hidden'}><summary>More <span class="cbox-more__n">(${n})</span></summary>${rest.map(p).join('')}</details>` : '');
}
/* the words on show in a step of an IB view (16 Nov 2026; Daniel, 15 Nov: about 49 words a step; 16 Nov: "I'm not going
   to read it"). Every line the guide asks ([sl …], [hl …]) and every line with no tag stay on show: a first version also
   folded guide lines to keep to 49 words, and the science read found 25 steps where a line on show then leaned on a
   folded one (water's step 8 lost its answer, the link reaction its acetyl CoA). So only the lines beyond the guide ([x])
   fold, in order, once the words on show pass `max`, under the step's More detail; a line marked [=] stays on show
   whatever its words (a beyond-the-guide line a later line needs: "about 30–32 ATP"). A line the level hides (HL at SL)
   is not counted. Nothing is removed. */
export function fit(t, max = 49) {
  const sl = level() === 'sl', words = p => p.replace(/^(\[[^\]]*\]\s*)+/, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const L = String(t || '').split('\n').map(p => ({ p: p.replace(/^\[=\]\s*/, ''), keep: /^\[=\]/.test(p) }));
  let used = L.reduce((a, l) => { const tag = /^\[(sl|hl|x)\b/.exec(l.p); return a + (!l.p || l.p.startsWith('[x+] ') || (tag && tag[1] === 'x' && !l.keep) || (sl && tag && tag[1] === 'hl') ? 0 : words(l.p)); }, 0);
  return L.map(({ p, keep }) => {
    if (!p || p.startsWith('[x+] ') || keep || !/^\[x\b/.test(p)) return p;
    const w = words(p); if (used + w <= max) { used += w; return p; }
    return '[x+] ' + p;
  }).join('\n');
}
/* a step that holds only HL lines, opened at SL (its button, or its chapter chosen): what the pupil sees above its words */
/* (a box, not a paragraph: the views' checks count a step's paragraphs, each with its level) */
export const hlNote = x => hlOnly(x) ? '<div class="iblv-note" role="note">HL only. Your level is SL: you can go past this step. To read its HL lines, choose HL.</div>' : '';
