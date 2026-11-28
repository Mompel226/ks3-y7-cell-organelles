/* doors.js — which steps of the plant cell a door of the game may open directly (20 Nov 2026).
   Daniel, 18 Nov 2026: "any animation is professionally done that shows as much detail, at least in one place or
   another"; 20 Nov, to the places session: "Yes, add doors". A place of the game that names a process in a line only
   (the way in's IGCSE box: osmosis, active transport) has a door to the step of this side quest that shows it in
   detail (the membrane step's three scenes).
     openPlant({ inGame: true, at: { step: 'membrane', scene: 'osmosis' } })     (view.js, "a visit by a door")
   OPEN_AT: step id → the scenes of that step that a door may start (text.js MEMSCENES).
   This file imports nothing and is a few lines, so that a page can read it to know whether to draw its door without
   loading the plant cell (import it dynamically: where the file is not there yet, there is no door). */
export const OPEN_AT = { membrane: ['diffusion', 'osmosis', 'active'] };
