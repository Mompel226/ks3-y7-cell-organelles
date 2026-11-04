/* ============================================================
   icons.js — the small pictures of what a pupil carries (4 Nov 2026), drawn for this page: each one shows the thing
   itself in the colours it has in the cell (a ring of glucose, two atoms of oxygen, a bead chain, the two parts of a
   ribosome, a lipid with its head and two tails, a vesicle full of amylase). 24 × 24 units.
   ============================================================ */
const g = (body) => `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico">${body}</svg>`;
export const ICON = {
  glucose: g('<path d="M12 3.2 19.6 7.6v8.8L12 20.8 4.4 16.4V7.6z" fill="#FFE08A" stroke="#B9831A" stroke-width="1.6"/><circle cx="12" cy="12" r="2.4" fill="#B9831A"/>'),
  oxygen: g('<circle cx="8.4" cy="12" r="5" fill="#FF6B6B" stroke="#A3242F" stroke-width="1.4"/><circle cx="15.6" cy="12" r="5" fill="#FF8A8A" stroke="#A3242F" stroke-width="1.4"/>'),
  amino: g('<path d="M4 15c3-6 5 4 8-2s5 4 8-2" fill="none" stroke="#7FE0C8" stroke-width="1.6"/><circle cx="4.5" cy="15" r="2.6" fill="#5BC8A8"/><circle cx="12" cy="12.6" r="2.6" fill="#7FA8FF"/><circle cx="19.5" cy="11.2" r="2.6" fill="#F2A65A"/>'),
  energy: g('<path d="M12 2.5 14 9.4 21.2 9.6 15.4 13.9 17.6 20.8 12 16.6 6.4 20.8 8.6 13.9 2.8 9.6 10 9.4z" fill="#FFF1A8" stroke="#E0A800" stroke-width="1.4" stroke-linejoin="round"/>'),
  mrna: g('<path d="M3 15c2.5-6 4.5-6 7 0s4.5 6 7 0 3-5 4-4" fill="none" stroke="#FF9F43" stroke-width="2.6" stroke-linecap="round"/>'),
  parts: g('<ellipse cx="12" cy="9" rx="7.2" ry="4.6" fill="#FFC95E" stroke="#9A6410" stroke-width="1.4"/><ellipse cx="12" cy="16.2" rx="5" ry="3.2" fill="#FFE3A0" stroke="#9A6410" stroke-width="1.4"/>'),
  chain: g('<ellipse cx="9" cy="9" rx="6" ry="4" fill="#FFC95E" stroke="#9A6410" stroke-width="1.3"/><path d="M14 11c3 1 2 4 5 5" fill="none" stroke="#7FA8FF" stroke-width="1.4"/><circle cx="15" cy="11.6" r="1.7" fill="#7FA8FF"/><circle cx="17.4" cy="14.2" r="1.7" fill="#5BC8A8"/><circle cx="19.8" cy="16.6" r="1.7" fill="#F2A65A"/>'),
  lipids: g('<circle cx="12" cy="6" r="3.6" fill="#FF9AC8" stroke="#A3245F" stroke-width="1.3"/><path d="M10.4 9.4c-.6 4 .8 7-.6 11M13.6 9.4c.6 4-.8 7 .6 11" fill="none" stroke="#FFD0E4" stroke-width="2" stroke-linecap="round"/>'),
  amylase: g('<circle cx="12" cy="12" r="8.6" fill="rgba(191,233,255,.45)" stroke="#BFE9FF" stroke-width="1.6"/><path d="M8 12.5c1.5-3 3.5-3.5 5-1.5s3 1.5 3.5-1" fill="none" stroke="#FFD27A" stroke-width="2.2" stroke-linecap="round"/>'),
  packed: g('<circle cx="12" cy="12" r="8.8" fill="rgba(255,231,168,.5)" stroke="#FFE7A8" stroke-width="1.6"/><circle cx="9.4" cy="10" r="1.6" fill="#E8A42A"/><circle cx="13.8" cy="9.4" r="1.6" fill="#E8A42A"/><circle cx="12" cy="13.6" r="1.6" fill="#E8A42A"/><circle cx="15.2" cy="14" r="1.6" fill="#E8A42A"/><circle cx="8.8" cy="14.6" r="1.6" fill="#E8A42A"/>'),
  top: g('<path d="M12 3 16 8h-2.6v4h-2.8V8H8z" fill="#9FF3FF"/><circle cx="12" cy="16" r="5.6" fill="rgba(255,231,168,.5)" stroke="#FFE7A8" stroke-width="1.5"/><circle cx="10.6" cy="15.6" r="1.3" fill="#E8A42A"/><circle cx="13.4" cy="16.6" r="1.3" fill="#E8A42A"/>'),
  saliva: g('<path d="M12 3.4c3.8 5 6.2 8.3 6.2 11.4a6.2 6.2 0 0 1-12.4 0C5.8 11.7 8.2 8.4 12 3.4z" fill="#BFF3FF" stroke="#4FB8D8" stroke-width="1.5"/><circle cx="10" cy="14.6" r="1.3" fill="#E8A42A"/><circle cx="13.4" cy="16.2" r="1.3" fill="#E8A42A"/>'),
  co2: g('<circle cx="12" cy="12" r="4.6" fill="#9AA3B5" stroke="#4A5468" stroke-width="1.3"/><circle cx="5" cy="12" r="3.4" fill="#FF8A8A" stroke="#A3242F" stroke-width="1.2"/><circle cx="19" cy="12" r="3.4" fill="#FF8A8A" stroke="#A3242F" stroke-width="1.2"/>'),
  nucleus: g('<circle cx="12" cy="12" r="8.6" fill="#6B5BE0" stroke="#B8A8FF" stroke-width="1.5"/><circle cx="13.6" cy="10.6" r="2.8" fill="#D04FA8"/>'),
  star: g('<path d="M12 3.5 14.2 9.3 20.4 9.6 15.6 13.4 17.3 19.4 12 16 6.7 19.4 8.4 13.4 3.6 9.6 9.8 9.3z" fill="#FFE39A"/>')
};
