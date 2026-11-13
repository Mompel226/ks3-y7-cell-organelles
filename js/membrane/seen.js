/* ============================================================
   seen.js — which kind of molecule is drawn at one pixel of the membrane view's picture (13 Nov 2026), from its colour.
   The expert review of the view found two names whose lines ended on the wrong thing: "hydrophobic tails" on a
   cholesterol molecule that stood in front of the tails, "hydrophilic head" at the foot of a glycolipid's chain. A
   point of the model says where a part IS, not whether it is SEEN there. So the view reads the picture back at the
   point (view.js `pick`, scene.js `probe`) and names a part only where its own colour is drawn; the check tool
   (tools/membrane-check.mjs) reads the same pixels with this same rule.
   The colours are scene.js's: heads pink, tails pale, cholesterol yellow with a red end, sugar units green. Light and
   shade change how bright a colour is, not which of its red, green and blue is the strongest, so the rule uses ratios.
   ============================================================ */
export function classOf(r, g, b, a) {
  if (a < 200) return 'none';                                    /* nothing drawn there (the picture's background is clear) */
  if (g > r * 1.06 && g > b * 1.1) return 'sugar';               /* green */
  if (r > g * 2.2 && r > b * 2) return 'chol';                   /* cholesterol's red hydrophilic end */
  if (r > b * 1.9 && g > b * 1.4 && g > r * 0.66) return 'chol'; /* its yellow rings (the glycoprotein's orange has less green) */
  if (r > g * 1.35 && b > g * 1.1) return 'head';                /* pink */
  if (r <= g * 1.35 && b <= g * 1.1 && r >= b * 0.95) return 'tail';   /* pale */
  return 'other';                                                /* a protein */
}
