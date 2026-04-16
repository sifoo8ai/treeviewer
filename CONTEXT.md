# CONTEXT.md

## Completed

* Review awal `viewer_v13` dibuat
* Masalah utama dikenalpasti:
  * spacing terlalu besar
  * spouse dalam hierarchy utama
  * tiada auto-fit
  * validation CSV lemah
* Scope versi baru dipersetujui:
  * HTML-only
  * guna tool Google Antigravity + Gemini Pro 3.1
  * kekal format CSV
  * root folder `\TreeViewer`
* Setup semula struktur projek (Pindah ke `index.html + styles.css + app.js`)

## Next

* Selepas baseline stabil, teruskan compact layout dan spouse rendering refactor

## Notes

* Fokus utama sekarang ialah layout lebih padat seperti Family Echo
* Jangan tambah feature luar scope terlalu awal
* Keutamaan tinggi pada kestabilan data mapping dan readability layout

## Open Questions

* Adakah node size kecil perlu dibezakan ikut desktop sahaja atau responsive sekali?
* Adakah tooltip cukup, atau perlukan side info panel kemudian?
* Perlu atau tidak tambah search nama dalam fasa selepas MVP?

# Cadangan Fasa Implementasi

## Fasa 1 — Baseline Refactor
* Pindah ke `index.html + styles.css + app.js` (Completed)
* Pastikan CSV flow kekal berfungsi (Completed)

## Fasa 2 — Layout Fix
* compact spacing
* spouse visual node
* auto-fit
* reset view

## Fasa 3 — Hardening
* CSV validation
* normalization nama
* tooltip viewport-safe
* layout mode compact/standard
