/* ============================================================
   bench.js — IB investigation: heat and time (16 Nov 2026; the IB audit's addition 11, built on Daniel's "build
   everything that you recommended"). Opened from the starch test's IB box (story.js test course.ib[0] `bench`; quest.js
   courseSwitch → 'ibbench' → main.js) and from the IB map. The Year 7 test is not changed.
   Step 1: a third well, C, with saliva that was boiled and cooled: after 5 minutes and iodine it stays blue-black, like
   the control (the true outcome: boiled amylase is denatured). Step 2: how to measure how fast amylase digests starch: a
   drop every 30 seconds on iodine solution, rate = 1 ÷ time. The method only: no time is shown or invented (Daniel's
   rule: the class measures it). Statements: B1.2.5, C1.1.7 (denaturation), C1.1.8, C1.1.9 (SL).
   ============================================================ */
const R = window.REV, { $, $$, h, esc } = R;
const IODINE = { blue: '#1B1F3B', orange: '#C8771C', pale: '#EEF1F4' };
const STEPS = [
  { t: ['[!] This step tests what heat does to amylase.',
    'Well C has saliva that was boiled for 5 minutes, then cooled. Wells A and B are as in your test: saliva, and water (the control).',
    '<mark class="do">Press Add iodine solution: 5 minutes have passed.</mark>'],
    after: ['[sl B1.2.5, C1.1.7] Boiling breaks the bonds that hold amylase in its shape. The active site of amylase changes shape, so starch no longer fits: amylase is <b>denatured</b>.',
      'Well C stays blue-black, like the control: no starch was digested. Cooling does not give amylase its shape back.'] },
  { t: ['[!] This step shows how to measure how fast amylase digests starch.',
    'Mix starch solution and saliva, and start a timer. Every 30 seconds, add one drop of the mixture to a fresh drop of iodine solution on the tile.',
    'At first the iodine solution turns blue-black. The first drop that stays orange-brown gives your time: all the starch has been digested.',
    '[sl C1.1.9] Rate of reaction = 1 ÷ time. The unit of this rate is s⁻¹ (per second).',
    '[sl C1.1.8] At a higher temperature, molecules move faster and collide more often, so the rate increases. Above the optimum temperature (the best temperature), amylase is denatured and the rate decreases.',
    '[x] This view shows the method only: your class measures the times.'] }
];
const LV = { sl: 'SL and HL', hl: 'HL only', x: 'Beyond the guide' };
const para = s => {
  const m = /^\[(!|sl|hl|x)(?:\s+([A-Z][0-9.]+(?:,\s*[A-Z][0-9.]+)*))?\]\s*/.exec(s);
  if (!m) return `<p>${s}</p>`;
  const body = s.slice(m[0].length);
  if (m[1] === '!') return `<p class="bench__for">${body}</p>`;
  return `<p><span class="ibl ibl--${m[1]}">${LV[m[1]]}${m[2] ? ' <i>' + esc(m[2]) + '</i>' : ''}</span> ${body}</p>`;
};
/* the tile: three wells (step 1) or a row of eight drops, one every 30 seconds (step 2) */
function tile(step, done) {
  if (step === 0) {
    const well = (x, k, name, fill) => `<g><circle cx="${x}" cy="88" r="44" fill="#FFFFFF" stroke="#B9C2CE" stroke-width="3"/><circle class="bench__w" cx="${x}" cy="88" r="36" fill="${fill}"/>
      <text x="${x}" y="152" text-anchor="middle" class="bench__k">${k}</text><text x="${x}" y="174" text-anchor="middle" class="bench__n">${name}</text></g>`;
    const c = done ? [IODINE.orange, IODINE.blue, IODINE.blue] : [IODINE.pale, IODINE.pale, IODINE.pale];
    return `<svg viewBox="0 0 480 190" role="img" aria-label="A spotting tile with three wells. ${done ? 'Well A is orange-brown; wells B and C are blue-black.' : 'Each holds starch solution.'}">
      <rect x="10" y="20" width="460" height="136" rx="18" fill="#F7F8FA" stroke="#C8CFD9" stroke-width="2"/>
      ${well(90, 'A', 'saliva', c[0])}${well(240, 'B', 'water (control)', c[1])}${well(390, 'C', 'boiled saliva', c[2])}</svg>`;
  }
  const drops = [...Array(8)].map((_, i) => `<g><circle cx="${45 + i * 56}" cy="70" r="20" fill="#FFFFFF" stroke="#B9C2CE" stroke-width="2.5"/>
    <text x="${45 + i * 56}" y="76" text-anchor="middle" class="bench__q">?</text><text x="${45 + i * 56}" y="118" text-anchor="middle" class="bench__n">${i * 30} s</text></g>`).join('');
  return `<svg viewBox="0 0 480 140" role="img" aria-label="A row of eight drops of iodine solution on a tile, one tested every 30 seconds, from 0 to 210 seconds. The colours are not shown: your class finds them.">
    <rect x="10" y="38" width="460" height="64" rx="14" fill="#F7F8FA" stroke="#C8CFD9" stroke-width="2"/>${drops}</svg>`;
}
export function openBench({ onClose = null } = {}) {
  const root = document.documentElement;
  let box = $('#bench');
  if (!box) { box = h('div', { class: 'bench', id: 'bench', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'benchT' }); $('#stage').appendChild(box); }
  let at = 0, done = false;
  const draw = () => {
    const S = STEPS[at];
    box.innerHTML = `<div class="bench__card">
      <button type="button" class="close-x bench__x" aria-label="Close the investigation">×</button>
      <p class="ibmap__k">IB Biology · the starch test</p>
      <h2 class="ibmap__t" id="benchT">IB investigation: heat and time</h2>
      <nav class="bench__steps" aria-label="Steps">${STEPS.map((_, i) => `<button type="button" data-s="${i}" aria-pressed="${i === at}">Step ${i + 1}</button>`).join('')}</nav>
      <div class="bench__pic">${tile(at, done)}</div>
      <div class="bench__words">${S.t.map(para).join('')}${at === 0 && done ? S.after.map(para).join('') : ''}</div>
      <div class="bench__acts">${at === 0 && !done ? '<button type="button" class="btn next bench__go">Add iodine solution</button>' : ''}
        ${at < STEPS.length - 1 && (at !== 0 || done) ? '<button type="button" class="btn next bench__next">Next step →</button>' : ''}
        <button type="button" class="btn ghost bench__close">Back to the test</button></div></div>`;
    R.terms && R.terms(box);
    const go = $('.bench__go', box);
    if (go) go.addEventListener('click', () => {
      go.disabled = true; done = true;
      /* the colours change over 1.2 s (at once with Reduce motion); the words and Next come when they have changed */
      const ws = $$('.bench__w', box), c = [IODINE.orange, IODINE.blue, IODINE.blue];
      ws.forEach((w, i) => { w.style.transition = R.FAST ? 'none' : 'fill 1.2s ease'; w.setAttribute('fill', c[i]); });
      setTimeout(draw, R.FAST ? 0 : 1300);
    });
    const nx = $('.bench__next', box); if (nx) nx.addEventListener('click', () => { at++; draw(); });
    $$('.bench__steps button', box).forEach(b => b.addEventListener('click', () => { at = +b.dataset.s; draw(); }));
    $$('.bench__x, .bench__close', box).forEach(b => b.addEventListener('click', close));
    const f = $('.bench__go, .bench__next', box); if (f) f.focus({ preventScroll: true });
  };
  const key = e => { if (e.key === 'Escape') close(); };
  function close() { box.hidden = true; root.classList.remove('benchv-open'); document.removeEventListener('keydown', key); if (onClose) onClose(); }
  document.addEventListener('keydown', key);
  box.hidden = false; root.classList.add('benchv-open'); draw();
  return { close };
}
