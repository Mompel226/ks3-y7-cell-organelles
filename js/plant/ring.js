/* ============================================================
   ring.js — the plant-cell branch's last page (11 Nov 2026): the loop closed, as a drawing to read (no 3D): light on a
   leaf, glucose made in a chloroplast, stored as starch, eaten, digested by amylase and maltase, absorbed through the
   villi, carried by the blood to the way in of the game's cell. The same ring as the small map in the panel (view.js
   loopMap), large, each stop with what happens there.
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { loopMap } from './view.js?v=202611142038';

export async function build() {
  return {
    group: new THREE.Group(), knobs: {}, views: [], labels: {}, hots: {}, turn: false,
    steps: [{ id: 'loop', phases: [], labs: {} }],
    paper: () => `<div class="plv__ring"><p class="plv__ringk">The loop of glucose</p>${loopMap('cell', true)}
      <p class="plv__ringt">Light gives the energy. The plant makes glucose and stores it as starch. Your enzymes digest the starch into glucose again, and your blood carries it to your cells.</p></div>`,
    draw() {}, dispose() {}
  };
}
