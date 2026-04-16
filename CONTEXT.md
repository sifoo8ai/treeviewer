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
* Refactor visual spouse: pisahkan spouse daripada hierarchy utama dan render sebagai linked node
* Implement auto-fit / auto-center dengan margin, dan butang Reset View
* Kecilkan node size, tambah offset, dan gunakan d3.tree().separation() untuk layout lebih padat
* Kemaskini litar penyambung anak (child connector) supaya jatuh lurus merentasi pasangan (family unit center) dari tengah.
* Hardening: CSV validation untuk kolum wajib, text normalization (nama, parent, status kematian), dan tooltip viewport-safe.
* Menambah Carian Nama dan fokus zoom kepada individu, berserta highlight node.
* Disepadukan pautan Hosted Sample CSV menggunakan Github REST API supaya pengguna boleh melayari fail CSV terbuka dari folder repositori "sample-data" tanpa upload.
* Menyediakan Radio Button Toggle untuk UX penukaran mode sumber data (Local/Sample) yang lebih baik berserta visual Status Loading.

## Next

* Pengujian penuh susanan layout (Compact vs Standard).

## Notes

* Fokus utama sekarang ialah kestabilan view, jangan tambah banyak library luar.
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
* compact spacing (Completed)
* spouse visual node (Completed)
* auto-fit (Completed)
* reset view (Completed)
* couple-centered connector logic (Completed)

## Fasa 3 — Hardening
* CSV validation (Completed)
* normalization nama (Completed)
* tooltip viewport-safe (Completed)
* layout mode compact/standard
