/* ============================================================
   state.js — what the pupil carries and which places are awake (4 Nov 2026).
   Daniel's map (4 Nov 2026): "not just one path. It can fork … you might be able to choose different places at some
   point, not many … but clearly you're gonna need something from one place to then continue on the other place".
   So every place NEEDS items that other places GIVE, and every need is a real dependency in the cell (story.js):
     start: the way in · the nucleus (and, once inside, the nucleolus)      ← three choices of order
     mitochondria ← glucose + oxygen (the way in)
     ribosomes ← the copy (nucleus) + the two parts (nucleolus) + amino acids (the way in) + energy (mitochondria)
     smooth ER ← energy · rough ER ← the start of the chain (ribosomes); its last step ← lipids (smooth ER)
     Golgi ← amylase in a vesicle (rough ER) · microtubules ← the packed vesicle (Golgi) + energy
     the way out ← the vesicle at the top (microtubules) · the test ← amylase in saliva (the way out)
   Energy is a bar: every job costs some (COST); the mitochondria fill it again from glucose and oxygen, so a pupil may
   return there. Saved in this browser (cellgame.state); ↺ Start again clears it.
   A place is DONE (✦) only when its jobs are done AND every check of it is right (Daniel, 4 Nov 2026: "You cannot have an
   area marked as done if the students have not answered the questions … It's like completing a game"): done(id) is the
   jobs, complete(id) is both. What a place gives wakes the next places only once its checks are right too (an item in the
   bag from a place whose checks wait: "answer the checks at … first"); a check, once right, stays right, so a place done
   again for more (the way in, the mitochondria) never puts the others back to sleep.
   ============================================================ */
const R = window.REV;
export const COST = { copy: 6, parts: 6, translate: 20, grow: 20, lipid: 6, step: 4 };
export const RESPIRE = 50;     /* one glucose + one oxygen, in the game's units */

const blank = () => ({ v: 1, items: { glucose: 0, oxygen: 0, amino: 0, energy: 30, mrna: 0, parts: 0, chain: 0, lipids: 0, amylase: 0, packed: 0, top: 0, saliva: 0 },
  flags: {}, done: {}, step: {}, visits: {} });
let S = R.store.get('state', null);
if (!S || S.v !== 1) S = blank();
const listeners = [];
/* which place gives an item (the first that lists it) */
const giverOf = item => Object.keys(window.STORY).find(k => (window.STORY[k].gives || []).indexOf(item) >= 0);
export const state = {
  get: () => S,
  save() { R.store.set('state', S); listeners.forEach(f => f(S)); },
  on(f) { listeners.push(f); },
  has(item) { return item === 'energy' ? !!S.flags.respired : (S.items[item] || 0) > 0; },
  add(item, n = 1) { S.items[item] = (S.items[item] || 0) + n; if (item === 'energy') { S.items.energy = Math.min(100, S.items.energy); S.flags.respired = true; } this.save(); },
  use(item, n = 1) { S.items[item] = Math.max(0, (S.items[item] || 0) - n); this.save(); },
  energy: () => S.items.energy,
  spend(n) { if (S.items.energy < n) return false; S.items.energy -= n; this.save(); return true; },
  done: id => !!S.done[id],
  /* a check is right once the pupil has answered it right, by Check or by pressing the right option (js/checks.js) */
  checkRight(q) { const A = R.ans.get(q); return !!(A && A.ok); },
  checks(id) { const P = window.STORY[id], QS = window.QS || {}; return P ? Object.keys(QS).filter(k => QS[k].part === P.part) : []; },
  checked(id) { return this.checks(id).every(q => this.checkRight(q)); },
  complete(id) { return !!S.done[id] && this.checked(id); },
  finish(id) { S.done[id] = true; delete S.step[id]; this.save(); },
  step: id => S.step[id] || 0,
  setStep(id, n) { S.step[id] = n; this.save(); },
  flag: k => !!S.flags[k],
  setFlag(k, v = true) { S.flags[k] = v; this.save(); },
  /* is a place awake? Every item it needs is carried, from a place whose checks are all right; or (the nucleolus) the
     pupil has gone into the nucleus */
  awake(id) {
    const P = window.STORY[id];
    if (id === 'arrive') return true;
    if (!this.complete('arrive')) return false;
    if (S.done[id]) return true;
    /* a place whose steps have begun stays awake: its first steps have used what it needed (the ribosome place uses the
       two parts at its first step), so by its needs alone it slept again, and a pupil who left it for the map, or
       watched one of its steps again with ↻, could not go on with it (12 Nov 2026) */
    if ((S.step[id] || 0) > 0) return true;
    if (P.inside) return !!S.flags['in-' + P.inside];
    return (P.needs || []).every(n => this.has(n) && this.checked(giverOf(n)));
  },
  /* what a sleeping place still needs: an item's name, 'in-<place>', or 'checks:<place>' (its checks are not all right) */
  missing(id) {
    const P = window.STORY[id]; if (P.inside && !S.flags['in-' + P.inside]) return ['in-' + P.inside];
    const out = [];
    (P.needs || []).forEach(n => {
      if (!this.has(n)) { out.push(n); return; }
      const g = giverOf(n); if (g && !this.checked(g) && out.indexOf('checks:' + g) < 0) out.push('checks:' + g);
    });
    return out;
  }
};
