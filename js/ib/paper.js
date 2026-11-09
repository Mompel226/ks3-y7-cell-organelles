/* ============================================================
   paper.js — the three pages of "From glucose to ATP" that are read, not watched (5 Nov 2026): the tally per glucose,
   Test yourself (Daniel's two questions: one typed, one an explanation put in order, then the model answer) and Read more
   (his article), which opens only when both questions are answered (Daniel, 5 Nov 2026: "add the article that explains
   even further. But only when the students have completed all of the questions").
   Nothing here is marked for the teacher: the answers stay on this computer (cellgame.ibtest).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { TEST, ARTICLE } from './text.js?v=202611091831';

const store = {
  get(k, d) { try { const v = localStorage.getItem('cellgame.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('cellgame.' + k, JSON.stringify(v)); } catch (e) { /* this visit only */ } }
};
export const testDone = () => { const s = store.get('ibtest', {}); return !!(s.q1 && s.q2); };
const shuffle = (a, seed) => { const r = a.slice(); let x = seed || 7; for (let i = r.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; const j = Math.floor(x / 233280 * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

const TALLY = [
  `<h3>The tally per glucose</h3>
   <table class="ibv__t ibv__t--cards"><thead><tr><th>Stage</th><th>Where</th><th>Net ATP made directly</th><th>NADH</th><th>FADH₂</th><th>Carbon dioxide</th></tr></thead>
   <tbody><tr><td data-h="Stage">Glycolysis</td><td data-h="Where">cytosol</td><td data-h="Net ATP made directly">4 − 2 = 2</td><td data-h="NADH">2</td><td data-h="FADH₂">0</td><td data-h="Carbon dioxide">0</td></tr>
   <tr><td data-h="Stage">Link reaction</td><td data-h="Where">matrix</td><td data-h="Net ATP made directly">0</td><td data-h="NADH">2</td><td data-h="FADH₂">0</td><td data-h="Carbon dioxide">2</td></tr>
   <tr><td data-h="Stage">Krebs cycle (2 turns)</td><td data-h="Where">matrix</td><td data-h="Net ATP made directly">2</td><td data-h="NADH">6</td><td data-h="FADH₂">2</td><td data-h="Carbon dioxide">4</td></tr>
   <tr><td data-h="Stage">Electron transport chain and ATP synthase</td><td data-h="Where">inner membrane</td><td colspan="4" data-h="ATP made">In this muscle cell: 8 NADH × about 2.5 + 4 pairs of electrons at FAD (the 2 FADH₂, and the electrons of glycolysis\'s 2 NADH, by the shuttle) × about 1.5 = about 26 ATP (28 where the shuttle gives those electrons to NAD)</td></tr>
   <tr class="tot"><th data-h="">Total</th><th data-h=""></th><th colspan="4" data-h="In all">about 30 ATP per glucose in this muscle cell (32 by the other shuttle)</th></tr></tbody></table>`,
  `<h3>Why do older books say 36–38?</h3>
   <div class="ibv__bars"><div><b>Old count</b><span style="--w:100%">3 per NADH, 2 per FADH₂ → 36–38 ATP</span></div><div><b>Measured</b><span style="--w:84%">2.5 per NADH, 1.5 per FADH₂ → 30–32 ATP</span></div></div>
   <p>The yield per NADH depends on how many protons each pair of electrons pumps (10) and how many protons each ATP needs: 8 for one turn of ATP synthase's ring (3 ATP), plus 1 for each ATP to be moved out of the matrix, so about 3.7 per ATP, and 10 ÷ 3.7 ≈ 2.7. Some protons also leak back, so the number is never exact.</p>`,
  `<h3>The overall equation, and a common mistake</h3>
   <p class="ibv__eq">C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub> → 6 CO<sub>2</sub> + 6 H<sub>2</sub>O</p>
   <svg class="ibv__mist" viewBox="0 0 640 210" role="img" aria-label="The carbon atoms of glucose become carbon dioxide; the oxygen inhaled becomes water">
     <g font-family="Nunito, sans-serif" font-weight="800" font-size="17">
       <rect x="12" y="20" width="190" height="62" rx="14" fill="#2a2f6a" stroke="#9EA9F0"/><text x="107" y="47" fill="#fff" text-anchor="middle">glucose: its carbon</text><text x="107" y="69" fill="#FFD27A" text-anchor="middle">atoms 1–6</text>
       <rect x="12" y="122" width="190" height="62" rx="14" fill="#4a1a2a" stroke="#ff9aa8"/><text x="107" y="149" fill="#fff" text-anchor="middle">oxygen inhaled</text><text x="107" y="171" fill="#ff9aa8" text-anchor="middle">O₂</text>
       <rect x="438" y="20" width="190" height="62" rx="14" fill="#2a2f6a" stroke="#9EA9F0"/><text x="533" y="47" fill="#fff" text-anchor="middle">carbon dioxide</text><text x="533" y="69" fill="#FFD27A" text-anchor="middle">link reaction, Krebs</text>
       <rect x="438" y="122" width="190" height="62" rx="14" fill="#4a1a2a" stroke="#ff9aa8"/><text x="533" y="149" fill="#fff" text-anchor="middle">water</text><text x="533" y="171" fill="#ff9aa8" text-anchor="middle">at complex IV</text>
       <path d="M206 51 H430" stroke="#FFD27A" stroke-width="4" marker-end="url(#ah)"/><path d="M206 153 H430" stroke="#ff9aa8" stroke-width="4" marker-end="url(#ah2)"/>
       <path d="M206 140 C 300 110, 340 90, 430 62" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="7 7" fill="none"/>
       <g transform="translate(318 96)"><circle r="17" fill="#ff6b6b"/><path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>
       <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#FFD27A"/></marker><marker id="ah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#ff9aa8"/></marker></defs>
     </g></svg>
   <p>The dashed arrow is the mistake: oxygen is not used to make carbon dioxide. The carbon of carbon dioxide comes from glucose.</p>`
];

export async function build(stage, { def, id }) {
  const g = new THREE.Group();
  const st = store.get('ibtest', {});
  const save = () => store.set('ibtest', st);
  const norm = s => String(s || '').toLowerCase().replace(/[^a-z]/g, '');
  function paper(i) {
    if (id === 'tally') return TALLY[i] || '';
    if (id === 'read') return testDone() ? `<article class="ibv__art">${ARTICLE}</article>` : `<h3>Read more</h3><p>The article opens when you have answered the two questions of Test yourself.</p><p><button type="button" class="ibv__go" data-go="test">Go to Test yourself →</button></p>`;
    if (i === 0) return `<h3>Question 1</h3><p class="ibv__q"><span class="lv lv--hl">HL only <i>C1.2.8</i></span> ${TEST.q1.ask}</p><p class="ibv__hint"><span class="lv lv--x">Beyond the IB guide</span> The name of this process is not in the IB guide, which says "ATP formation"; textbooks give it a name.</p>
      <div class="ibv__ans"><input type="text" class="ibv__in" aria-label="Your answer" placeholder="Type the name of the process" value="${st.q1t ? st.q1t.replace(/"/g, '&quot;') : ''}"><button type="button" class="ibv__chk">Check</button></div>
      <p class="ibv__fb" ${st.q1 ? '' : 'hidden'}></p><div class="ibv__model" ${st.q1 ? '' : 'hidden'}><b>Model answer</b><p>${TEST.q1.model}</p></div>`;
    if (i === 1) {
      const order = st.q2o || shuffle(TEST.q2.order.map((_, k) => k), 11);
      const card = k => `<span class="ibv__oc" data-k="${k}"><span class="ibv__tx">${TEST.q2.order[k]}</span><b><button type="button" class="up" aria-label="Move up">↑</button><button type="button" class="dn" aria-label="Move down">↓</button></b></span>`;
      st.q2o = order; save();
      return `<h3>Question 2</h3><p class="ibv__q"><span class="lv lv--hl">HL only <i>C1.2.12, C1.2.16</i></span> ${TEST.q2.ask}</p><p class="ibv__hint">Put the five sentences in the order of the explanation: move each with its arrows.</p>
        <ol class="ibv__ord">${order.map((k, j) => `<li><span class="ibv__n" aria-hidden="true">${j + 1}</span>${card(k)}</li>`).join('')}</ol>
        <p><button type="button" class="ibv__chk2">Check the order</button></p><p class="ibv__fb2" hidden></p><div class="ibv__model" ${st.q2 ? '' : 'hidden'}><b>Model answer</b><p>${TEST.q2.model}</p></div>`;
    }
    return testDone() ? `<h3>Both questions answered</h3><p>Read more is open: the whole story in one article.</p><p><button type="button" class="ibv__go" data-go="read">Read more →</button></p>`
      : `<h3>Not yet</h3><p>Answer both questions first (Back).</p>`;
  }
  function wire(el, i, api) {
    el.querySelectorAll('.ibv__go').forEach(b => b.addEventListener('click', () => api.open(b.dataset.go)));
    const chk = el.querySelector('.ibv__chk');
    if (chk) {
      const inp = el.querySelector('.ibv__in'), fb = el.querySelector('.ibv__fb'), mod = el.querySelector('.ibv__model');
      const check = () => {
        const v = norm(inp.value); st.q1t = inp.value; st.tries1 = (st.tries1 || 0) + 1;
        const ok = TEST.q1.accept.some(a => v.includes(a)) && v.includes('phosphorylation') || v === 'substratelevelphosphorylation';
        fb.hidden = false; fb.className = 'ibv__fb ' + (ok ? 'ok' : 'no');
        fb.textContent = ok ? '✓ Right: substrate-level phosphorylation.' : (st.tries1 >= 2 ? 'Not yet. Read the model answer below.' : 'Not yet. Think: where does the phosphate group come from? Try again.');
        if (ok || st.tries1 >= 2) { st.q1 = 1; mod.hidden = false; api.changed(); }
        save();
      };
      chk.addEventListener('click', check); inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    }
    const ord = el.querySelector('.ibv__ord');
    if (ord) {
      /* each li is a place with its number, which never moves; only the card (.ibv__oc) moves, slides there and is outlined
         for a moment (with reduce motion set: no slide, the outline still), and the keyboard stays with it */
      const places = () => [...ord.children], cards = () => places().map(li => li.querySelector('.ibv__oc'));
      const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
      const redraw = () => { const cs = cards(); cs.forEach((c, j) => { c.querySelector('.up').disabled = j === 0; c.querySelector('.dn').disabled = j === cs.length - 1; }); st.q2o = cs.map(c => +c.dataset.k); save(); };
      redraw();
      ord.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        const c = b.closest('.ibv__oc'), cs = cards(), j = cs.indexOf(c), t = j + (b.classList.contains('up') ? -1 : 1);
        if (t < 0 || t >= cs.length) return;
        const was = new Map(cs.map(x => [x, x.getBoundingClientRect().top]));
        const P = places(); P[j].appendChild(cs[t]); P[t].appendChild(c);
        [c, cs[t]].forEach(x => { const d = was.get(x) - x.getBoundingClientRect().top; if (d && !still() && x.animate) x.animate([{ transform: `translateY(${d}px)` }, { transform: 'none' }], { duration: 260, easing: 'ease-out' }); });
        cs.forEach(x => x.classList.remove('is-moved')); void c.offsetWidth; c.classList.add('is-moved');
        redraw();
        const nb = c.querySelector(b.classList.contains('up') ? '.up' : '.dn'); (nb.disabled ? c.querySelector(b.classList.contains('up') ? '.dn' : '.up') : nb).focus();
      });
      el.querySelector('.ibv__chk2').addEventListener('click', () => {
        const now = cards().map(c => +c.dataset.k), right = now.every((k, j) => k === j), fb = el.querySelector('.ibv__fb2');
        st.tries2 = (st.tries2 || 0) + 1;
        cards().forEach((c, j) => c.classList.toggle('bad', +c.dataset.k !== j && !right));
        fb.hidden = false; fb.className = 'ibv__fb2 ' + (right ? 'ok' : 'no');
        fb.textContent = right ? '✓ Right: that is the chain of causes.' : (st.tries2 >= 2 ? 'Not yet: the model answer is below.' : 'Not yet: your order is kept as you left it. Start from oxygen\'s job at the end of the chain.');
        if (right || st.tries2 >= 2) { st.q2 = 1; el.querySelector('.ibv__model').hidden = false; api.changed(); }
        save();
      });
    }
    if (id === 'read') {/* the article's words open where they are */}
  }
  const steps = def.steps.map(() => ({ phases: [] }));
  return { group: g, knobs: {}, views: null, steps, labels: {}, draw() {}, paper, wire, dispose() {} };
}
