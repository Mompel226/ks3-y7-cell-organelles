/* ============================================================
   found.js — which names of an IB view a pupil has opened (17 Nov 2026): the views' names are buttons now (memory
   teach-on-the-picture, "the names are the lesson": pressed, a name's card opens, the name is ticked and counted,
   "2 of 4 found"). One small record for all the views, kept in this browser only (nothing is sent anywhere; it is
   not part of the game's saved record, so the game's own store and its checks never see it):
     localStorage 'cellgame.ibNames' = { "<view>": ["<key>", …] }
   A browser that keeps nothing (a private window) remembers for the visit only.
     found(view) → a Set of keys     learn(view, key) → true if it was new
   ============================================================ */
const K = 'cellgame.ibNames';
let mem = null;
const read = () => { if (mem) return mem; try { const v = JSON.parse(localStorage.getItem(K) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } };
export function found(view) { const all = read(); return new Set(Array.isArray(all[view]) ? all[view] : []); }
export function learn(view, key) {
  const all = read(), list = Array.isArray(all[view]) ? all[view] : [];
  if (list.includes(key)) return false;
  all[view] = list.concat([key]);
  try { localStorage.setItem(K, JSON.stringify(all)); mem = null; } catch (e) { mem = all; }
  return true;
}
