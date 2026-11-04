/* ============================================================
   intro.js — the dive into the cell (4 Nov 2026). Daniel: "it must feel like you're diving into a new world". Three
   steps, each waiting for the pupil (memory animations-wait-for-the-reader), each keeping one thing to follow:
   1. a head with the three pairs of salivary glands (Blausen Medical, CC BY 3.0); the picture moves in to one gland;
   2. inside a gland: small bunches of cells round tiny tubes, the ducts (NIH BioArt 656, CC BY 4.0); it moves in to one
      bunch;
   3. the same bunch in 3D, cut at the front like the cell, its cells lit (world.acinus(1)); the camera dives into
      one of them while the others fade back (acinus 1 → 0).
   Real proportions are kept where they are shown; the pictures are credited on the picture.
   ============================================================ */
import { MAP_VIEW } from '../world/world.js?v=202611041337';
const R = window.REV, { $, h } = R;

const STEPS = [
  { img: 'img/intro/salivary-glands', alt: 'A head seen from the side, with the three salivary glands: the parotid gland in front of the ear, the submandibular gland under the jaw and the sublingual gland under the tongue.',
    credit: 'Blausen Medical, Medical gallery of Blausen Medical 2014, WikiJournal of Medicine 1(2), CC BY 3.0',
    text: 'Your mouth is always a little wet: <b>saliva</b>. Most of it is made by three pairs of large <dfn data-w="salivary-gland">salivary glands</dfn>, round your mouth.',
    zoom: [0.47, 0.42, 3.2] },
  { img: 'img/intro/gland-acinus', alt: 'A drawing of the inside of a salivary gland: small round bunches of cells, each round a tiny tube, joined to a larger tube, the duct.',
    credit: 'NIH BioArt Source 656, Mouth submandibular gland (NIAID), CC BY 4.0',
    text: 'Inside a gland, the cells sit in small round bunches. Each bunch surrounds a tiny tube. The cells make saliva. It flows along these tubes, the <b>ducts</b>, into your mouth.',
    zoom: [0.72, 0.42, 3.0] },
  { text: 'This is one bunch, in 3D, cut at the front so that you can see inside. You will enter one of its cells. Imagine you become about a million times smaller: as small as a mitochondrion. <mark class="do">Press Dive in.</mark>', world: true }
];

/* the bunch's other cells fade back as the camera dives into this one */
function fade(world, ms) {
  const t0 = performance.now();
  const step = () => { const k = ms ? Math.min(1, (performance.now() - t0) / ms) : 1; world.acinus(1 - k); if (k < 1) requestAnimationFrame(step); };
  step();
}

export function intro(world) {
  return new Promise(async done => {
    const box = $('#intro'); box.hidden = false;
    world.camera.position.set(-12, 26, 88); world.controls.target.set(0, 12, 0); world.controls.enabled = false; world.camera.lookAt(world.controls.target);
    for (let i = 0; i < STEPS.length; i++) {
      const S = STEPS[i], last = i === STEPS.length - 1;
      box.classList.toggle('is-world', !!S.world);
      if (S.world) world.acinus(1);
      box.innerHTML = (S.img ? `<figure class="intro__pic"><picture><source srcset="${S.img}.webp" type="image/webp"><img src="${S.img}.jpg" alt="${S.alt}"></picture><figcaption>${S.credit}</figcaption></figure>` : '') +
        `<div class="intro__card"><p class="intro__n">${i + 1} of ${STEPS.length}</p><p class="intro__t">${S.text}</p><button type="button" class="btn next pulse">${last ? '✦ Dive in' : 'Next step →'}</button></div>`;
      R.terms(box);
      const b = $('.btn', box); b.focus({ preventScroll: true });
      await new Promise(r => b.addEventListener('click', r, { once: true }));
      if (S.zoom && !R.FAST) {
        const img = $('img', box), [x, y, k] = S.zoom;
        img.style.transformOrigin = `${x * 100}% ${y * 100}%`; img.classList.add('zoom'); img.style.transform = `scale(${k})`;
        box.classList.add('fading');
        await new Promise(r => setTimeout(r, 1500));
        box.classList.remove('fading');
      }
    }
    box.classList.add('out');
    /* on a phone or a tablet the game fills the screen from the dive on (the heading, with the maker's name, was on the
       first screen) */
    if (matchMedia('(max-width:860px)').matches) { const st = $('#stage'); scrollTo({ top: st.getBoundingClientRect().top + scrollY - 6, behavior: R.FAST ? 'auto' : 'smooth' }); }
    world.flyTo(MAP_VIEW, { ms: 5200, isMap: true });
    fade(world, R.FAST ? 0 : 3200);
    await new Promise(r => setTimeout(r, R.FAST ? 0 : 700));
    box.hidden = true; box.classList.remove('out', 'is-world'); box.innerHTML = '';
    world.controls.enabled = true;
    done();
  });
}
