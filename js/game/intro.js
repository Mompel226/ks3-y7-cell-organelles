/* ============================================================
   intro.js — the dive into the cell (4 Nov 2026). Daniel: "it must feel like you're diving into a new world". Three
   steps, each waiting for the pupil (memory animations-wait-for-the-reader), each keeping one thing to follow:
   1. a head with the three pairs of salivary glands (Blausen Medical, CC BY 3.0);
   2. inside a gland: small bunches of cells round tiny tubes, the ducts: a drawing made for this page, to scale and named
      in big words (img/intro/gland.svg, from tools/gland-svg.py; Daniel, 4 Nov 2026, found the HuBMAP illustration of
      before "extremely confusing"), put inline so its words are in the page's font;
   3. the same bunch in 3D: a ring of peach cells round the lumen, as in the drawing, lit (world.acinus(1)), and this
      cell, its front removed; the camera dives into it while the others fade back (acinus 1 → 0).
   The moves between steps show how one picture leads to the next (Daniel, 4 Nov 2026: "transitions should help with the
   understanding of what you're showing in the next stage", not fade out and in "from nothing"):
   1 → 2: the head moves in until the parotid gland fills the picture, its middle moving to the picture's middle (Daniel,
          4 Nov 2026: "you don't zoom into the salivary gland … you zoom into the middle of this kind of image"); a round
          window opens on the gland as it comes, showing what is inside it (the drawing), at the gland's size all the way,
          and widens until the drawing fills the picture;
   2 → 3: the bunch with "one cell" moves to the middle of the free part of the screen, turning until that cell is at the
          bottom, at the size the 3D bunch has there (1 µm of the drawing = 1 µm of the 3D bunch), and the rest of the
          drawing fades with the picture's frame; the 3D bunch, seen from the front, stands exactly behind it, cell for cell
          (tools/gland-svg.py draws each cell as the 3D cell seen from the front); the dark ground fades, then the drawn
          bunch fades into the 3D one; then the camera turns slowly round it, so the pupil sees that it is the same bunch,
          in 3D. Nothing jumps: every move is one smooth change (tools/frames.mjs films each move, frame by frame).
   Real proportions are kept where they are shown; the pictures are credited on the picture.
   The corner's tools (Word bank, Sound, Full screen) stand above the intro from its first step, with room kept for them
   (stage.is-intro; Daniel, 4 Nov 2026: "I would like to be able to full screen since the beginning"); the card has no
   Sound button of its own. The press on ✦ Dive in lets the music start (cellgame:dive → sound.allowMusic).
   ============================================================ */
import * as THREE from '../vendor/three/build/three.module.min.js?v=0.185.1';
import { MAP_VIEW } from '../world/world.js?v=202611051947';
const R = window.REV, { $, h } = R;

const STEPS = [
  { img: 'img/intro/salivary-glands', alt: 'A head seen from the side, with the three salivary glands: the parotid gland in front of the ear, the submandibular gland under the jaw and the sublingual gland under the tongue.',
    credit: 'Blausen Medical, Medical gallery of Blausen Medical 2014, WikiJournal of Medicine 1(2), CC BY 3.0',
    text: 'Your mouth is always a little wet: <b>saliva</b>.\nMost of it is made by three pairs of large <dfn data-w="salivary-gland">salivary glands</dfn>, round your mouth.',
    gland: [0.552, 0.580, 0.161, 0.235] },         /* the parotid gland: its middle, its width and its height, as parts of the
                                                      picture (measured on the picture's colours, 4 Nov 2026) */
  { svg: 'img/intro/gland.svg?v=202611051947',
    credit: 'Drawing made for this page, to scale: the bar is 20 µm.',
    text: 'Inside a gland, the cells sit in small round bunches. Each bunch surrounds a tiny tube.\nThe cells make saliva. It flows along these tubes, the <b>ducts</b>, into your mouth.' },
  { text: 'This is one bunch of cells, in 3D. The front of one cell is removed, so that you can see inside it. You will enter that cell.\nImagine you become about a million times smaller: as small as a mitochondrion.\n<mark class="do">Press Dive in.</mark>', world: true }
];
/* the bunch in 3D (js/world/cellbuild.js): its lumen, and the outer edge of its ring of cells, in µm */
const LUMEN = new THREE.Vector3(0, 17.4, 0), RING = 18.4;

const later = ms => new Promise(r => setTimeout(r, R.FAST ? 0 : ms));
const paras = t => t.split('\n').map(x => `<p>${x}</p>`).join('');
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/* 1 → 2, drawn frame by frame, so that the head and the drawing move as one. Both are the same straight move at the same
   pace: the head's scale goes from 1 to k1 (the gland then fills the picture) while the gland's middle goes to the
   picture's middle; the drawing's scale goes from 1/k1 to 1, its middle always on the gland's middle, so it is always the
   gland's size. It is seen through a soft round window that opens until the drawing fills the picture. Round the gland,
   the head fades first (a soft circle closing on the gland), so the picture's printed names never swell across it. */
function into(head, inside, gland, ms) {
  const img = $('img', head), W = head.clientWidth, H = head.clientHeight;
  const nw = img.naturalWidth || 1, nh = img.naturalHeight || 1, s = Math.min(W / nw, H / nh);   /* object-fit: contain */
  const [fx, fy, fw, fh] = gland, gw = fw * nw * s, gh = fh * nh * s;
  const gx = (W - nw * s) / 2 + fx * nw * s, gy = (H - nh * s) / 2 + fy * nh * s, cx = W / 2, cy = H / 2;
  const k1 = Math.min(W / gw, H / gh), soft = 0.3;
  /* the window's radius, in the drawing's own pixels: a third of the gland at first, then past every corner */
  const r0 = 0.32 * Math.min(gw, gh) * k1, r1 = Math.hypot(W, H) / 2 / (1 - soft);
  /* the circle round the gland that the head is seen in, in the head's own pixels: the whole picture, then the gland */
  const h0 = Math.hypot(W, H) / (1 - soft), h1 = 0.8 * Math.max(gw, gh), at = `${gx.toFixed(1)}px ${gy.toFixed(1)}px`;
  img.style.transformOrigin = inside.style.transformOrigin = '0 0';
  img.style.willChange = inside.style.willChange = 'transform, opacity';
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, t0 = performance.now();
  return new Promise(res => {
    const frame = () => {
      const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms), e = ease(k), ki = 1 + e * (k1 - 1);
      img.style.transform = `translate(${(e * (cx - k1 * gx)).toFixed(2)}px, ${(e * (cy - k1 * gy)).toFixed(2)}px) scale(${ki.toFixed(4)})`;
      inside.style.transform = `translate(${((1 - e) * (gx - cx / k1)).toFixed(2)}px, ${((1 - e) * (gy - cy / k1)).toFixed(2)}px) scale(${(ki / k1).toFixed(4)})`;
      const r = r0 + (r1 - r0) * e * e, m = `radial-gradient(circle at 50% 50%, #000 ${(r * (1 - soft)).toFixed(1)}px, transparent ${r.toFixed(1)}px)`;
      inside.style.webkitMaskImage = m; inside.style.maskImage = m;
      const rh = h0 + (h1 - h0) * smooth(0, 0.35, k), mh = `radial-gradient(circle at ${at}, #000 ${(rh * (1 - soft)).toFixed(1)}px, transparent ${rh.toFixed(1)}px)`;
      img.style.webkitMaskImage = mh; img.style.maskImage = mh;
      inside.style.opacity = Math.min(1, k / 0.2).toFixed(3);
      img.style.opacity = (1 - smooth(0.55, 0.95, k)).toFixed(3);
      if (k < 1) { requestAnimationFrame(frame); return; }
      ['transform', 'opacity', 'webkitMaskImage', 'maskImage', 'willChange'].forEach(p => { inside.style[p] = ''; });
      res();
    };
    frame();
  });
}
/* the bunch's other cells fade back as the camera dives into this one */
function fade(world, ms) {
  const t0 = performance.now();
  const step = () => { const k = ms ? Math.min(1, (performance.now() - t0) / ms) : 1; world.acinus(1 - k); if (k < 1) requestAnimationFrame(step); };
  step();
}
/* the camera turns round the lumen: from the front to a view from above and to the side */
function turn(world, d0, d1, yaw, pitch, ms) {
  const cam = world.camera, t0 = performance.now(), ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  return new Promise(res => {
    const step = () => {
      const k = R.FAST ? 1 : Math.min(1, (performance.now() - t0) / ms), e = ease(k), a = yaw * e, b = pitch * e, d = d0 + (d1 - d0) * e;
      cam.position.set(LUMEN.x + d * Math.sin(a) * Math.cos(b), LUMEN.y + d * Math.sin(b), LUMEN.z + d * Math.cos(a) * Math.cos(b));
      world.controls.target.copy(LUMEN); cam.lookAt(LUMEN); world.kick && world.kick();
      if (k < 1) requestAnimationFrame(step); else res();
    };
    step();
  });
}

export function intro(world) {
  return new Promise(async done => {
    const box = $('#intro'), stage = $('#stage'); box.hidden = false; stage.classList.add('is-intro');
    /* the drawing of step 2, fetched while the pupil reads step 1 */
    const drawings = {};
    STEPS.filter(S => S.svg).forEach(S => { drawings[S.svg] = fetch(S.svg).then(r => r.ok ? r.text() : '').catch(() => ''); });
    world.camera.position.set(-12, 26, 88); world.controls.target.set(0, 12, 0); world.controls.enabled = false; world.camera.lookAt(world.controls.target);
    /* the game keeps the camera near the cell; the intro sees the whole bunch from further away (the dive to the map sets
       the game's limits again) */
    world.controls.minDistance = 0; world.controls.maxDistance = Infinity;
    /* one picture for steps 1 and 2: each step's picture is a layer in it, so the next can grow out of the last */
    box.innerHTML = `<figure class="intro__pic"><div class="intro__layers"></div><figcaption></figcaption></figure><div class="intro__card"></div>`;
    const fig = $('.intro__pic', box), layers = $('.intro__layers', box), cap = $('figcaption', box), cardEl = $('.intro__card', box);
    const card = i => {
      const S = STEPS[i], last = i === STEPS.length - 1;
      cardEl.innerHTML = `<p class="intro__n">${i + 1} of ${STEPS.length}</p><div class="intro__t">${paras(S.text)}</div><button type="button" class="btn next pulse">${last ? '✦ Dive in' : 'Next step →'}</button>`;
      cardEl.classList.remove('is-going'); R.terms(cardEl);
      const b = $('.btn', cardEl); b.focus({ preventScroll: true });
      /* the dive: the music may start, inside this press (a browser starts sound only from a press) */
      return new Promise(r => b.addEventListener('click', () => { cardEl.classList.add('is-going'); if (last) document.dispatchEvent(new Event('cellgame:dive')); r(); }, { once: true }));
    };
    const layer = async S => {
      const el = h('div', { class: 'intro__layer' });
      el.innerHTML = S.img ? `<picture><source srcset="${S.img}.webp" type="image/webp"><img src="${S.img}.jpg" alt="${S.alt}"></picture>`
        : `<div class="intro__svg">${await drawings[S.svg]}</div>`;
      layers.appendChild(el); return el;
    };

    /* ---- 1. the head ---- */
    const head = await layer(STEPS[0]); cap.textContent = STEPS[0].credit;
    await card(0);

    /* ---- 1 → 2: into the gland; what is inside it shows through a window that widens ---- */
    const inside = await layer(STEPS[1]);
    inside.style.opacity = '0';                                           /* until the move's first frame */
    await into(head, inside, STEPS[0].gland, R.FAST ? 0 : 2300);
    head.remove(); cap.textContent = STEPS[1].credit;
    await card(1);

    /* ---- 2 → 3: the bunch with "one cell" becomes the bunch in 3D ---- */
    const st = $('#stage').getBoundingClientRect(), cr = cardEl.getBoundingClientRect(), narrow = matchMedia('(max-width:860px)').matches;
    /* the free part of the screen in step 3: beside the card (a laptop) or below it (a phone, where the card is on top) */
    if (narrow) world.setInset({ top: Math.max(0, cr.bottom - st.top + 8) }); else world.setInset({ right: Math.max(0, st.right - cr.left + 12) });
    const s = world.size, ins = world.inset, fw = s.w - (ins.right || 0), fh = s.h - (ins.top || 0);
    const cx = fw / 2, cy = (ins.top || 0) + fh / 2, rT = 0.34 * Math.min(fw, fh);
    const D = RING * world.pxPerUnit(1) / rT;                              /* the camera's distance that shows the ring at rT */
    /* the 3D bunch, from the front, drawn now behind the picture (its first frame may take a moment: nothing of it shows yet) */
    world.acinus(1);
    world.camera.position.set(LUMEN.x, LUMEN.y, LUMEN.z + D); world.controls.target.copy(LUMEN); world.camera.lookAt(LUMEN); world.kick && world.kick();
    const svg = $('svg', inside), g = svg && $('.g-acinus[data-mark]', svg);
    if (g) {
      const vb = svg.viewBox.baseVal, box2 = svg.getBoundingClientRect(), sc = Math.min(svg.clientWidth / vb.width, svg.clientHeight / vb.height);
      const px = (svg.clientWidth - vb.width * sc) / 2 + (+g.dataset.cx) * sc, py = (svg.clientHeight - vb.height * sc) / 2 + (+g.dataset.cy) * sc;
      const k = (rT / RING) / (+g.dataset.px * sc);                       /* 1 µm drawn = 1 µm of the 3D bunch at its lumen */
      const qx = st.left + cx - box2.left, qy = st.top + cy - box2.top;
      svg.style.transformOrigin = `${px.toFixed(1)}px ${py.toFixed(1)}px`;
      svg.style.transform = `translate(${(qx - px).toFixed(1)}px, ${(qy - py).toFixed(1)}px) rotate(${g.dataset.turn}deg) scale(${k.toFixed(4)})`;
      svg.querySelectorAll('.g-bg, .g-tubes, .g-flow, .g-labels, .g-acinus:not([data-mark])').forEach(e => e.classList.add('gone'));
    }
    box.classList.add('is-moving');                                       /* the frame and its credit fade with the drawing's ground */
    await later(1700);
    /* the dark ground fades: around the drawn bunch, the 3D world; behind it, the same bunch in 3D */
    box.classList.add('is-world');
    await later(800);
    inside.classList.add('is-gone');                                      /* the drawn bunch fades into the 3D one */
    await later(1300);
    fig.remove();
    /* a slow turn round the bunch: it is the same bunch, and it has depth */
    await turn(world, D, D * 1.12, -0.62, 0.3, R.FAST ? 0 : 3000);

    /* ---- 3. the bunch in 3D ---- */
    await card(2);
    box.classList.add('out');
    /* on a phone or a tablet the game fills the screen from the dive on (the heading, with the maker's name, was on the
       first screen) */
    if (narrow) { const stg = $('#stage'); scrollTo({ top: stg.getBoundingClientRect().top + scrollY - 6, behavior: R.FAST ? 'auto' : 'smooth' }); }
    world.flyTo(MAP_VIEW, { ms: 5200, isMap: true });
    fade(world, R.FAST ? 0 : 3200);
    await later(700);
    box.hidden = true; box.classList.remove('out', 'is-world', 'is-moving'); box.innerHTML = ''; stage.classList.remove('is-intro');
    /* the panel and the bag come in gently while the camera dives (css: .stage.is-arriving), never all at once */
    stage.classList.add('is-arriving'); setTimeout(() => stage.classList.remove('is-arriving'), R.FAST ? 0 : 1400);
    world.controls.enabled = true;
    done();
  });
}
