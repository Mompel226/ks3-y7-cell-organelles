# Picture credits: img/real/

The real electron micrographs of "See the real thing" (`js/game/real.js`), 4 November 2026.

## The HeLa pictures

All of them come from ONE real human cell: **OpenOrganelle dataset jrc_hela-2**, Janelia Research Campus
(<https://openorganelle.janelia.org/datasets/jrc_hela-2>; data `s3://janelia-cosem-datasets/jrc_hela-2/jrc_hela-2.n5`).
FIB-SEM: Xu, C. S. et al. (2021) *Nature* 599, 147–151. Segmentations: Heinrich, L. et al. (2021) *Nature* 599, 141–146.
Licence: **CC BY 4.0** (<https://creativecommons.org/licenses/by/4.0/>). Credit line on the page: "Janelia Research Campus,
OpenOrganelle jrc_hela-2, CC BY 4.0".

Made by `tools/real-em.py` (not published). What it does to every HeLa picture:

- **Plane.** One plane of the raw FIB-SEM volume (`em/fibsem-uint16`), never mixed across planes. Places are in the
  dataset's own frame, in µm (y = 0 at the coverslip). Every plane here is a plane of constant z, the microscope's own
  imaging plane: across = x, up = y.
- **Scale.** s0 = 4 nm voxels (5.24 nm apart in z), s1 = 8 nm (10.48 nm in z). Enlarged with a cubic filter, by the
  factor in the table (2.1 at most). The s0 planes are smoothed first with a Gaussian of 0.5 voxel.
- **Contrast.** Stretched between the 0.5th and 99.5th percentile of the crop and inverted, so membranes are dark on
  pale (the stretch of the Foundations hub's `build_em_slice.py`).
- **Outline.** The edge of the dataset's own segmentation of that structure, read at 8 nm (s1) in the same plane,
  smoothed a little (binary close and open, holes filled, a slight blur), drawn 2.5 px wide about 8 nm outside the
  structure, so the line does not cover its membrane. Pale colours have a thin dark edge either side.
- **Scale bar** added at the bottom left. No other text.
- The script also writes each crop without its outline (`<name>-plain.jpg`). The page does not use them, so they are not
  published: they are in the Biology Hub's `Archive/2026-11-04/` (4 Nov 2026).

| File | What it shows | Source / author | Licence | Changes |
|---|---|---|---|---|
| `nucleus.jpg` | The lower edge of the nucleus: the nuclear envelope (two membranes) running nearly level, three nuclear pores, the cytoplasm below with a mitochondrion | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 13.10 µm (s0 voxel plane 2500); x 15.10–16.88, y 0.80–2.02 µm; s0, ×1.90 (2.10 nm a pixel), 846 × 580 px; outline (#8F7CFF) round `nucleus_seg` + `ne_seg` + `np_seg` (only the nucleoplasm inside the envelope; blurred 1.5 voxels), broken within 25 nm of each pore of `np_seg` (instances 1767, 2632, 143) |
| `nucleolus.jpg` | A nucleolus (`nucleolus_seg` 453, about 3 µm across) inside the nucleus; the edge of the nucleus at the top right | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 14.12 µm (s1 voxel plane 1347); x 26.40–31.20, y 1.65–5.05 µm; s1, ×1.42 (5.61 nm a pixel), 855 × 606 px; outline (#D04FA8) round `nucleolus_seg`, open 2 / close 3 voxels, holes filled. The label is a ring round a paler middle; in this plane the ring is closed, so the filled outline is the whole nucleolus |
| `mito.jpg` | A mitochondrion cut lengthways (`mito_seg` 150), the folds of its inner membrane (cristae) across it, with four more mitochondria; the coverslip at the bottom | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 12.80 µm (s1 voxel plane 1221); x 8.70–11.90, y 0.20–2.32 µm; s1, ×2.00 (4.00 nm a pixel), 800 × 530 px; outline (#F07A45) round every `mito_seg` piece, open 1 / close 1 voxel |
| `rer.jpg` | Two sheets of rough ER cut edge on, ribosomes in rows along them; free ribosomes round them | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 13.30 µm (s0 voxel plane 2538); x 9.76–11.44, y 2.16–3.24 µm; s0, ×2.00 (2.00 nm a pixel), 840 × 540 px; outline (#2FB39A) round the `er_seg` pieces that carry at least six `ribo_seg` ribosomes (within 24 nm), together with those ribosomes, closed 3 voxels |
| `golgi.jpg` | Golgi stacks (curved stacks of flattened sacs, with vesicles) in the thin cytoplasm between the nucleus (top) and the coverslip (bottom) | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 13.20 µm (s1 voxel plane 1259); x 24.60–27.80, y 0.10–2.20 µm; s1, ×2.10 (3.81 nm a pixel), 840 × 551 px; outline (#F0B43A) round `golgi_seg`, closed 5 voxels (so one line goes round a stack's separate sacs) and opened 2 |
| `wayin.jpg` | The cell membrane at the top of the cell: embedding resin above, cytoplasm with ribosomes, ER and a mitochondrion below | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 13.34 µm (s1 voxel plane 1272); x 8.65–11.85, y 2.15–4.25 µm; s1, ×2.00 (4.00 nm a pixel), 800 × 525 px; outline (#E8C6FF) along the longest piece of `pm_seg` in the plane, on the outside of the cell only (blurred 1.5 voxels) |
| `ribosome.jpg` | Free ribosomes in the cytoplasm, each ringed; two mitochondria | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 13.95 µm (s0 voxel plane 2662); x 10.78–12.48, y 2.08–3.28 µm; s0, ×1.98 (2.02 nm a pixel), 840 × 593 px; a ring (#FFD27A, 2 px, 4 nm outside) round every `ribo_seg` piece in the plane, not smoothed |

**Where it is** (5 Nov 2026; Daniel: "You always have to have some sort of reference"): before each close-up, a wider view
of the same cell made by `tools/real-em.py --where` from data already cached (the script stops rather than download).
The same processing (one plane, the same contrast), at s2 (16 nm voxels, 20.96 nm apart in z) or s3 (32 nm, 41.92 nm),
800 px wide; outlines from the dataset's own segmentations at s3 or s4 (64 nm), holes filled, pieces under 0.05 µm²
left out, drawn 2.5 px wide just outside the structure; a white box with a dark edge where the close-up is; the scale bar
on a dark band under the picture. Where the close-up's own plane is not cached at a wide scale, the nearest cached plane
is used, 13.45 µm: 0.35 µm from the nucleus close-up's plane and 0.25 µm from the Golgi close-up's (the box marks the
same place in the cell; the slice is a little further in).

| File | What it shows | Source / author | Licence | Changes |
|---|---|---|---|---|
| `nucleolus-where.jpg` | The whole nucleus (violet) with its nucleoli (pink); the box: `nucleolus.jpg` | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 14.12 µm (the close-up's plane), s3; x 12.5–35.5, y 0–6 µm; 28.8 nm a pixel |
| `nucleus-where.jpg` | The whole nucleus (violet); the box: `nucleus.jpg`, on its lower edge | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 13.45 µm (0.35 µm from the close-up's 13.10), s3; x 12.5–35.5, y 0–6 µm; 28.8 nm a pixel |
| `golgi-where.jpg` | The whole nucleus (violet), the Golgi apparatus under it (yellow); the box: `golgi.jpg` | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 13.45 µm (0.25 µm from the close-up's 13.20), s3; x 12.5–35.5, y 0–6 µm; 28.8 nm a pixel |
| `ribosome-where.jpg` | The cell's left end, the edge of the nucleus (violet); the box: `ribosome.jpg` | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 13.95 µm (the close-up's plane), s3; x 4.5–19.5, y 0–5.5 µm; 18.8 nm a pixel |
| `mito-where.jpg` | The cell's left end, its mitochondria (orange), the edge of the nucleus (violet); the box: `mito.jpg` | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 12.80 µm (the close-up's plane), s2; x 4.2–17.3, y 0–5 µm; 16.4 nm a pixel |
| `rer-where.jpg` | The cell's left end, the edge of the nucleus (violet); the box: `rer.jpg` | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 13.30 µm (the close-up's plane), s2; x 4.2–17.3, y 0–5 µm; 16.4 nm a pixel |
| `wayin-where.jpg` | The cell's left end, its top edge (the cell membrane), the edge of the nucleus (violet); the box: `wayin.jpg` | jrc_hela-2, Janelia Research Campus | CC BY 4.0 | z = 13.34 µm (the close-up's plane), s2; x 4.2–17.3, y 0–5 µm; 16.4 nm a pixel |

Tried and left out (4 Nov 2026): **exit**, the vesicles at the cell membrane (the `vesicle_seg` vesicles near the
membrane are 40 to 60 nm across, too small to see clearly even at 4 nm, and the larger bodies there are endosomes), and
**tracks**, a microtubule lying in the plane (they run along z, so no plane of constant z holds one; a plane of constant
y would need 2.5 times enlarging at 8 nm, or about 50 more blocks at 4 nm).

## The pancreas pictures

Transmission electron micrographs by **Louisa Howard**, Dartmouth College (its electron microscope facility,
remf.dartmouth.edu; JEOL 100CX), on Wikimedia Commons. Licence: **public domain** (the Commons API's `LicenseShortName` read "Public domain" for both, 4 Nov
2026). Credit line on the page: "Louisa Howard, Dartmouth College, Wikimedia Commons, public domain".

| File | What it shows | Source / author | Licence | Changes |
|---|---|---|---|---|
| `pancreas-cells.jpg` | Pancreatic acinar cells (cells that make amylase and other digestive enzymes): a nucleus in the middle; **rough ER, clearly**, as many parallel sheets in layers (its ribosomes are too small to see one by one at this size; they make the sheets look grainy); **secretory (zymogen) granules, clearly**, the large dark round bodies on the right and at the bottom left; mitochondria | [File:Pancreatic acinar cells - TEM.jpg](https://commons.wikimedia.org/wiki/File:Pancreatic_acinar_cells_-_TEM.jpg), Louisa Howard | Public domain | None: the original file (640 × 480 px, under 900 px, so not resized; SHA-1 5945a84d55a0ab08416b329502faf3080c8b6daa), with the microscope's own strip at the bottom (500 nm bar, "1Pancreas", "1/7/0 REMF") |
| `pancreas-rer.jpg` | A pancreatic acinar cell: **rough ER, clearly**, stacked sheets with their ribosomes as fine dots along them (left and top right); the nucleus and its envelope. **No secretory granules.** The nuclear pores of the file's title are hard to pick out at this size | [File:Mammalian pancreatic tissue, nuclear pores and rough endoplasmic reticulum.jpg](https://commons.wikimedia.org/wiki/File:Mammalian_pancreatic_tissue,_nuclear_pores_and_rough_endoplasmic_reticulum.jpg), Louisa Howard | Public domain | None: the original file (640 × 480 px, not resized; SHA-1 0ea8dd4eb3f964190c4ace2f20fe8bc325e25491), with the microscope's own strip at the bottom (500 nm bar, "1NuclearPore", "1/7/0 REMF") |
