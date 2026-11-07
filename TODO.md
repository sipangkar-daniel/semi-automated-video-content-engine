# MASTER ROADMAP & SPRINT CHECKLIST
**Project:** Semi-Automated Video Content Engine  
**Durasi Total:** 5 Sprint (Modular & Terisolasi)  

> **Panduan Eksekusi AI:**  
> - Kerjakan hanya 1 sub-task (misal: Task 1.1) dalam satu sesi/prompt.  
> - Centang `[x]` setelah sub-task lolos pengujian (Acceptance Criteria terpenuhi).  
> - Jika token limit tercapai, cek task terakhir yang belum tercentang di file ini.

---

## Ringkasan Sprint
- **Sprint 0:** Setup Lingkungan & Scaffolding Proyek (Selesai dalam 1 sesi)
- **Sprint 1:** Remotion Core Engine (Visual 9:16 & Standalone Render via CLI)
- **Sprint 2:** Audio & Voiceover Pipeline (Edge-TTS & Perhitungan Durasi Frame)
- **Sprint 3:** Web Studio Dashboard & Scene Manager (Form Next.js & Upload Lokal)
- **Sprint 4:** Live Web Preview (Integrasi `@remotion/player` di Browser)
- **Sprint 5:** Render Execution Engine, Progress Tracker & Export Manager

---

## Detail Sprint & Actionable Checklist

### Sprint 0: Environment & Project Scaffolding
**Tujuan:** Menyiapkan fondasi monorepo Next.js + Remotion + Tailwind tanpa error dependensi.
- [x] **Task 0.1:** Buat blueprint `ARCHITECTURE.md` dan kontrak data `types/schema.ts`.
- [x] **Task 0.2:** Inisialisasi Next.js 14+ (App Router, TypeScript, Tailwind CSS, Lucide Icons).
- [x] **Task 0.3:** Instal dan konfigurasi Remotion dependencies (`remotion`, `@remotion/cli`, `@remotion/player`, `@remotion/transitions`).
- [x] **Task 0.4:** Setup folder statis lokal: `public/uploads/` dan `public/renders/` beserta `.gitkeep`.
- [x] **Task 0.5:** Buat file konfigurasi Remotion (`remotion.config.ts`) dan tes build awal.
*Kriteria Selesai:* `npm run build` dan `npx remotion versions` dapat dijalankan di terminal tanpa error. (SELESAI)

---

### Sprint 1: Remotion Core Engine (Visual 9:16)
**Tujuan:** Membuat template video vertikal yang tajam, modern, dan dapat dirender secara headless dari terminal.
- [x] **Task 1.1:** Setup entry point Remotion di `src/remotion/Root.tsx` dan `src/remotion/index.ts` dengan komposisi `SmartphoneSpecVideo` (1080x1920, 30 FPS).
- [x] **Task 1.2:** Buat komponen `MediaBackground.tsx`: mendukung video (.mp4) looping/autoplay dan gambar (.jpg/.png) dengan efek subtle Ken Burns zoom.
- [x] **Task 1.3:** Buat komponen `SpecOverlayCard.tsx`: card animasi teks spesifikasi gadget (misal: "Snapdragon 8 Gen 3") menggunakan `spring()` dari Remotion di zona aman (safe zone) layar.
- [x] **Task 1.4:** Buat komponen `SubtitleBar.tsx`: bar subtitle narasi suara di bawah kartu spesifikasi dengan gaya TikTok/Shorts.
- [x] **Task 1.5:** Buat komponen transisi antar scene menggunakan `TransitionSeries` (fade/slide).
- [x] **Task 1.6:** Buat file pengujian `sample-input.json` dan jalankan uji coba render CLI:  
  `npx remotion render src/remotion/index.ts SmartphoneSpecVideo public/renders/test_render.mp4 --props=sample-input.json`
*Kriteria Selesai:* Menghasilkan file MP4 berdurasi ~6-10 detik di `public/renders/` dengan tampilan 9:16 yang mulus. (SELESAI)

---

### Sprint 2: Automated Audio & Voiceover Engine (Edge-TTS)
**Tujuan:** Otomasi konversi teks skrip menjadi suara voiceover bahasa Indonesia dan kalkulasi durasi frame otomatis.
- [x] **Task 2.1:** Buat modul utilitas audio di `src/server/services/tts.ts` menggunakan library `node-edge-tts` (suara `id-ID-GadisNeural` default).
- [x] **Task 2.2:** Integrasikan parser durasi audio (`music-metadata`) untuk mengekstrak durasi file `.mp3` dalam detik dan milidetik.
- [x] **Task 2.3:** Buat fungsi konversi durasi: `durationInFrames = Math.ceil(durationInSeconds * 30) + 12` (buffer 0.4 detik).
- [x] **Task 2.4:** Buat API Route Next.js `POST /api/tts`: menerima array teks adegan, menghasilkan file audio ke `public/uploads/audio/`, dan mengembalikan metadata durasi per adegan.
- [x] **Task 2.5:** Uji coba endpoint API TTS dan verifikasi render MP4 dengan trek suara di `public/renders/test_render_with_audio.mp4`.
*Kriteria Selesai:* Input teks "Layar AMOLED 120Hz" otomatis menghasilkan file MP3 valid dan mengembalikan `durationInFrames` yang presisi. (SELESAI)

---

### Sprint 3: Web Studio Dashboard & Scene Manager
**Tujuan:** UI interaktif untuk mengelola proyek video, upload klip lokal, dan input teks per adegan.
- [x] **Task 3.1:** Buat layout studio di `src/app/page.tsx` dengan sidebar editor dan canvas preview area (Split-Screen Studio).
- [x] **Task 3.2:** Buat form Project Setup (`title`, `voiceSelection`, `colorTheme`).
- [x] **Task 3.3:** Buat komponen `SceneCard.tsx`: form dinamis untuk setiap adegan (Tambah, Hapus, Reorder urutan adegan).
- [x] **Task 3.4:** Buat API Route `POST /api/upload`: menangani penyimpanan file video (.mp4) dan gambar dari user ke `public/uploads/media/`.
- [x] **Task 3.5:** Pasang form validasi menggunakan Zod schema dari `types/schema.ts` dan hubungkan state form.
*Kriteria Selesai:* User dapat menambah 3 adegan, upload klip masing-masing, mengisi teks spesifikasi & skrip narasi tanpa error UI. (SELESAI)

---

### Sprint 4: Remotion Player Live Web Preview
**Tujuan:** Memungkinkan user menonton video secara real-time di browser sebelum memutuskan untuk merender MP4.
- [x] **Task 4.1:** Buat komponen `RemotionPlayerView.tsx` menggunakan `@remotion/player`.
- [x] **Task 4.2:** Sambungkan state dari Scene Manager (Sprint 3) ke props `<Player />` secara reaktif.
- [x] **Task 4.3:** Tambahkan tombol "Generate Voiceover Preview": memicu API `/api/tts` agar audio adegan terpasang ke preview player.
- [x] **Task 4.4:** Optimasi performa preview (playback controls, play/pause, seekbar frame, responsive scale 9:16).
*Kriteria Selesai:* Video beserta animasi teks dan suara narasi dapat diputar langsung di dashboard web Next.js dengan rasio 9:16. (SELESAI)

---

### Sprint 5: Full Render Pipeline & Export Manager
**Tujuan:** Eksekusi render MP4 di background dengan progress bar dan download hasil render.
- [x] **Task 5.1:** Buat service `src/server/services/renderer.ts`: mengeksekusi perintah CLI `remotion render` via Node.js `spawn`.
- [x] **Task 5.2:** Implementasikan parsing log stdout CLI Remotion untuk membaca progress render (misal: "Rendering frame 120/300 (40%)").
- [x] **Task 5.3:** Buat API Route `POST /api/render`: menerima payload proyek, menulis file sementara `input.json`, dan memicu worker render.
- [x] **Task 5.4:** Buat API Route `GET /api/render/[jobId]`: endpoint polling untuk mengembalikan progress rendering (0% - 100%) dan path file MP4 saat selesai.
- [x] **Task 5.5:** Buat Modal/Dialog Render di UI: menampilkan progress bar dinamis, estimasi waktu, dan tombol "Download MP4" / "Play Video".
- [x] **Task 5.6:** Pengujian end-to-end (E2E): dari input form -> generate audio -> preview player -> export MP4 -> download.
*Kriteria Selesai:* Sekali klik tombol "Render Video", sistem menghasilkan file video MP4 final di folder `public/renders/` dan siap diunduh. (SELESAI)
