# Master Project Plan: Family Tree Viewer

## Objective
To develop a web-based Family Tree Viewer using vanilla HTML, CSS, and JS (D3.js), focusing on a clean layout, proper spouse visualization, and performance, without requiring server-side processing for the CSV data file.

## Phases

### Phase 1: Baseline Refactor (Status: In Progress)
- Restructure project into separate files (`index.html`, `styles.css`, `app.js`).
- Ensure core functionalities (CSV upload, tree rendering, zoom/pan) remain intact.
- Create `Master_Project_Plan.md` and `CONTEXT.md` as single sources of truth.

### Phase 2: Layout Fix (Status: Pending)
- Implement compact spacing for larger trees like Family Echo.
- Fix spouse visual node to correctly attach to waris instead of appearing in the main hierarchy.
- Implement auto-fit and reset view functionality.

### Phase 3: Hardening (Status: Pending)
- Add CSV validation.
- Name normalization.
- Viewport-safe tooltips.
- Switchable layout modes (compact vs standard).

## Tech Stack
- HTML5
- CSS3 (Vanilla)
- JavaScript (ES6+ Vanilla)
- D3.js (for tree rendering)

## Constraints
- **No JS Frameworks** (e.g., React, Vue, Angular).
- **Maintain CSV Format**: Do not alter the expected column structure of the CSV data.
- **Root Directory**: All files must reside in or be referenced from the project root (`\TreeViewer`).
- **No additional planning docs**: Maintain updates strictly in this file and `CONTEXT.md`.

## Task Breakdown
- [x] T001 - Setup project structure dalam \TreeViewer
- [x] T002 - Pindahkan viewer_v13 kepada struktur baru index.html + styles.css + app.js
- [x] T003 - Kekalkan parser CSV dengan format lama
- [x] T004 - Tambah CSV required-column validation
- [x] T005 - Tambah helper normalization untuk nama, parent, spouse
- [x] T006 - Refactor data mapping supaya parent-child hierarchy lebih stabil
- [x] T007 - Buang spouse daripada hierarchy utama
- [x] T008 - Render spouse sebagai visual attached node
- [x] T009 - Kecilkan node size, spacing, spouse offset
- [x] T010 - Tambah separation() untuk compact layout
- [x] T011 - Tambah auto-fit dan auto-center berdasarkan bounding box
- [ ] T012 - Tambah layout mode Compact / Standard
- [x] T013 - Kemaskan tooltip dan pastikan tak terkeluar viewport
- [x] T014 - Tambah error display yang jelas untuk CSV invalid
- [x] T015 - Tambah butang Reset View
- [ ] T016 - Ujian dengan CSV contoh sedia ada
- [ ] T017 - Kemas dokumentasi ringkas untuk Gemini / maintainers
- [x] T018 - Ubah connector anak supaya turun dari tengah pasangan (family unit center)
- [x] T019 - Fine-tune spacing kecil untuk kurangkan overlap selepas perubahan connector
- [x] T020 - Ujian visual untuk family kecil dan family besar selepas couple-center connector
- [x] T021 - Tambah input carian nama di panel UI.
- [x] T022 - Bina logik padanan teks "normalizeText" bagi mengesan hasil carian.
- [x] T023 - Guna auto-pan dan transform ke kedudukan node (focus) sekiranya pilihan diklik.
- [x] T024 - Warnakan kotak nod sebagai di-highlight bagi identifikasi pantas.
- [x] T025 - Tambah dropdown `sampleCsvSelector` di UI
- [x] T026 - Tulis logic loadSampleCsvList guna utiliti fetch (Github API)
- [x] T027 - Tapis response JSON API untuk `.csv` ke dalam fail senarai (dropdown)
- [x] T028 - Ekstrak onload function file tempatan ke dalam processCsvData untuk kegunaan awam
- [x] T029 - Benarkan fail CSV lokal dan sampel awam wujud serentak (reset mana yg tidak relevan)
- [x] T030 - Tambah butang Export PNG di panel kiri UI.
- [x] T031 - Membina rekaan clone SVG menggunakan canvas dengan padanan ukuran dan latar belakang resolusi tinggi (skala 2x).
- [x] T032 - Terap gaya CSS sebaris (inline/style block) ke dalam DOM SVG supaya rekabentuk kekal semasa eksport.
- [x] T033 - Tambah input radio toggle untuk memilih punca sumber data.
- [x] T034 - Asingkan section muat-naik dan section github API ikut paparan secara logikal.
- [x] T035 - Bina Visual Indikator status loading agar memberitahu pengguna muatan sedang berjalan.
- [x] T036 - Rencana UI Disable logic (halang interaksi user) semasa process CSV sedang berlaku untuk mencegah ralat rendering.
- [x] T037 - Bina paparan struktur 'Legend Pokok' di bawah menu supaya mudah difahami warna/jenis nod.
- [x] T038 - Tambah Dropdown 'Filter Status' (Semua / Hidup / Meninggal).
- [x] T039 - Tulis logik saringan sasar-pengamatan CSS (opacity dimming) dalam kelas `.node-dimmed` & `.link-dimmed`.
- [x] T040 - Menetapkan sifat peralihan visual (CSS transition) agar dimming berlaku secara anggun (graceful degradation).
- [x] T041 - Integrasi Filter ke dalam export image layout (CSS embedded ke dalam ekspot PNG).
