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
   ============================================================ */
const R = window.REV;
export const COST = { copy: 6, parts: 6, translate: 20, grow: 20, lipid: 6, step: 4 };
export const RESPIRE = 50;     /* one glucose + one oxygen, in the game's units */

const blank = () => ({ v: 1, items: { glucose: 0, oxygen: 0, amino: 0, energy: 30, mrna: 0, parts: 0, chain: 0, lipids: 0, amylase: 0, packed: 0, top: 0, saliva: 0 },
  flags: {}, done: {}, step: {}, visits: {} });
let S = R.store.get('state', null);
if (!S || S.v !== 1) S = blank();
const listeners = [];
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
  finish(id) { S.done[id] = true; delete S.step[id]; this.save(); },
  step: id => S.step[id] || 0,
  setStep(id, n) { S.step[id] = n; this.save(); },
  flag: k => !!S.flags[k],
  setFlag(k, v = true) { S.flags[k] = v; this.save(); },
  /* is a place awake? Every item it needs is carried, or (the nucleolus) the pupil has gone into the nucleus */
  awake(id) {
    const P = window.STORY[id];
    if (id === 'arrive') return true;
    if (!S.done.arrive) return false;
    if (S.done[id]) return true;
    if (P.inside) return !!S.flags['in-' + P.inside];
    return (P.needs || []).every(n => this.has(n));
  },
  /* what a sleeping place still needs, by name */
  missing(id) { const P = window.STORY[id]; if (P.inside && !S.flags['in-' + P.inside]) return ['in-' + P.inside]; return (P.needs || []).filter(n => !this.has(n)); }
};
