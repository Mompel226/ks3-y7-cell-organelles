/* ============================================================
   mark.js — a visit from the IB map marks the sentence (18 Nov 2026; Daniel, of the map: "when I press on one thing …
   I have to find it in the text … It should be highlighted. It should blink in yellow or something when you are
   there, at least when you access it from the map"). js/game/main.js opens a view with `mark`: the statement's code
   ('B2.1.8'), or the codes of the door (['B2.1.8', 'B2.1.9']). Every paragraph of the view whose level tag holds one
   of them (<p class="lvp"><span class="lv">… <i>CODE, CODE</i></span> …</p>: a step's lines, a result, a name's card)
   gets the yellow mark of the game's places (css/game.css `p.ib-hit`: a place and a view read as one) and pulses twice
   the first time it is shown; a fold that holds it opens. No pulse with Reduce motion or ?still=1. The views draw
   their words again at every step and every choice, so this watches the view and marks what comes. It changes no
   word. Without `mark` it does nothing.
   A statement may live in the card of a name (memory teach-on-the-picture), which is not on the page until the name
   is pressed: a view gives such a name's button `data-codes` (the codes of its card), and the button gets a yellow
   ring that pulses twice, so the student sees which name to press; the card's line is then marked like any other.
     marks(root, mark) → stop()
   ============================================================ */
const CALM = new URLSearchParams(location.search).has('still') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const CSS = `[data-ibmark] p.ib-hit{background:#FFE98A;color:#231A00;border-radius:6px;box-shadow:0 0 0 5px #FFE98A}
[data-ibmark] p.ib-hit--go{animation:ibmarkhit .9s ease-in-out 2}
@keyframes ibmarkhit{0%,100%{background:#FFE98A;box-shadow:0 0 0 5px #FFE98A}50%{background:#FFC83D;box-shadow:0 0 0 9px #FFC83D}}
[data-ibmark] .ib-hitname{outline:3px solid #FFC83D;outline-offset:2px}
[data-ibmark] .ib-hitname--go{animation:ibmarkname .9s ease-in-out 2}
@keyframes ibmarkname{0%,100%{outline-width:3px;outline-offset:2px}50%{outline-width:6px;outline-offset:4px}}
@media (prefers-reduced-motion:reduce){[data-ibmark] p.ib-hit--go,[data-ibmark] .ib-hitname--go{animation:none}}`;
/* the codes of a card's lines, for its name's `data-codes`: '[sl B2.2.3] …' → 'B2.2.3' */
export const codesOf = t => (String(t || '').match(/\[(?:sl|hl) [^\]]+\]/g) || []).map(c => c.replace(/^\[(?:sl|hl) /, '').slice(0, -1)).join(',');
export function marks(root, mark) {
  const codes = new Set((Array.isArray(mark) ? mark : mark ? [mark] : []).map(c => String(c).trim()));
  if (!codes.size || !root) return () => {};
  root.setAttribute('data-ibmark', '');
  const style = document.createElement('style'); style.textContent = CSS; root.appendChild(style);
  const seen = new Set();      /* (the lines that have pulsed: a line drawn again stays marked and does not pulse again) */
  const apply = () => {
    root.querySelectorAll('p.lvp:not(.ib-hit)').forEach(p => {
      const i = p.querySelector(':scope > .lv > i');
      if (!i || !i.textContent.split(',').some(c => codes.has(c.trim()))) return;
      p.classList.add('ib-hit');
      const key = p.textContent;
      if (!CALM && !seen.has(key)) p.classList.add('ib-hit--go');
      seen.add(key);
      const fold = p.closest('details'); if (fold && !fold.open) fold.open = true;
    });
    root.querySelectorAll('[data-codes]:not(.ib-hitname)').forEach(b => {
      if (!b.dataset.codes.split(',').some(c => codes.has(c.trim()))) return;
      b.classList.add('ib-hitname');
      const key = 'name ' + b.dataset.codes + ' ' + b.textContent;
      if (!CALM && !seen.has(key)) b.classList.add('ib-hitname--go');
      seen.add(key);
    });
  };
  const watch = new MutationObserver(apply);
  watch.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-codes'] });
  apply();
  return () => watch.disconnect();
}
