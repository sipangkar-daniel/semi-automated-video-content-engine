# Semi-Automated Video Content Engine

> Studio produksi video vertikal otomatis untuk konten Shorts / TikTok / Reels — dari klip mentah hingga MP4 siap upload, dalam satu klik.

![Stack](https://img.shields.io/badge/Next.js_14-black?logo=next.js)
![Remotion](https://img.shields.io/badge/Remotion_4-0b84f3?logo=react)
![TTS](https://img.shields.io/badge/Edge--TTS-Gadis_🇮🇩-purple)
![License](https://img.shields.io/badge/License-Private-red)

---

## Apa Ini?

Aplikasi web lokal yang memungkinkan content creator gadget/smartphone memproduksi puluhan video vertikal (9:16) per hari **tanpa editing manual** di Premiere atau CapCut.

**Alur kerja:**
1. Upload klip video / foto unboxing yang sudah dipotong (2–8 detik per klip).
2. Ketik judul spesifikasi & skrip narasi per adegan di dashboard web.
3. Klik **Generate Voiceover** → AI membacakan skrip dengan suara natural bahasa Indonesia.
4. Tonton preview langsung di browser via **Remotion Player**.
5. Klik **Render Video Final** → file MP4 1080×1920 siap upload ke YouTube Shorts / TikTok.

---

## Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| **Dynamic Scene Roles** | Atur tipe adegan: Intro (pembuka), Feature (spek), Comparison (VS), Outro (kesimpulan), atau Custom. |
| **Clean Text Overlay** | Teks judul tajam langsung di atas video dengan shadow lembut — tanpa kotak kaca tebal yang menutupi visual. |
| **Flexible Text Position** | Posisikan teks di **Atas**, **Tengah**, atau **Bawah** layar per adegan. |
| **Shared Background** | Satu klip video bisa mengalir kontinu melintasi beberapa adegan — teks berganti, background tetap mulus. |
| **AI Voiceover (Edge-TTS)** | Narasi suara bahasa Indonesia natural (Gadis / Ardi) tanpa API key berbayar. |
| **Live Web Preview** | Tonton hasil video langsung di browser sebelum render, lengkap dengan kontrol play/pause/seek. |
| **One-Click MP4 Export** | Render video H.264 via Remotion CLI dengan progress bar real-time dan tombol download. |
| **Audio Caching** | File audio yang sudah digenerate tidak akan di-generate ulang jika teks & suaranya sama. |

---

## Tech Stack

- **Frontend & Backend:** Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Video Rendering:** Remotion 4 (`@remotion/cli`, `@remotion/player`, `@remotion/transitions`)
- **Voiceover:** Edge-TTS (Microsoft, gratis, suara `id-ID-GadisNeural`)
- **Audio Metadata:** music-metadata + ffmpeg-static
- **Icons:** Lucide React
- **Schema Validation:** Zod 4

---

## Prasyarat

- **Node.js** v18+ (disarankan v20+)
- **npm** v9+
- Tidak perlu install FFmpeg secara manual (sudah tercakup via `ffmpeg-static`)

---

## Instalasi & Menjalankan

```bash
# 1. Clone repositori
git clone https://github.com/sipangkar-daniel/semi-automated-video-content-engine.git
cd semi-automated-video-content-engine

# 2. Install dependensi
npm install

# 3. Jalankan development server
npm run dev
```

Buka browser di **http://localhost:3000** dan mulai membuat video!

---

## Scripts

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Next.js development server |
| `npm run build` | Build produksi |
| `npm run remotion:preview` | Membuka Remotion Studio untuk preview standalone |
| `npm run remotion:render` | Render video via CLI (menggunakan `sample-input.json`) |

---

## Struktur Folder

```text
├── ARCHITECTURE.md          # Cetak biru sistem & aturan anti-drift AI
├── TODO.md                  # Roadmap sprint & checklist pengerjaan
├── types/schema.ts          # SSOT kontrak data (Zod + TypeScript)
├── src/
│   ├── app/                 # Next.js App Router (UI & API Routes)
│   │   ├── api/tts/         # POST /api/tts — generate voiceover
│   │   ├── api/upload/      # POST /api/upload — upload media lokal
│   │   ├── api/render/      # POST /api/render & GET /api/render/[jobId]
│   │   └── page.tsx         # Dashboard Studio Utama
│   ├── components/          # UI Components (Form, Preview, Modal)
│   ├── remotion/            # Pure Remotion Compositions (standalone)
│   │   ├── compositions/SmartphoneSpecVideo.tsx
│   │   └── components/      # TextOverlay, SubtitleBar, MediaBackground
│   └── server/services/     # Backend: TTS client, Render runner
├── public/
│   ├── uploads/             # Media & audio upload lokal
│   └── renders/             # Output video MP4
└── remotion.config.ts       # Konfigurasi Remotion bundler
```

---

## Cara Kerja Arsitektur

```text
[Dashboard Web UI]
       │
       ▼ Submit Adegan + Teks
[API /api/tts] ─── Edge-TTS ──► File .mp3 + Durasi Frame
       │
       ▼
[Remotion Player] ──► Live Preview di Browser (9:16)
       │
       ▼ Klik "Render Video"
[API /api/render] ─── remotion render CLI ──► MP4 (1080×1920, H.264)
       │
       ▼
[public/renders/video_judul_YYYYMMDD_HHMM.mp4] ──► Download / Upload
```

---

## Kontribusi

Proyek ini dibuat untuk penggunaan internal / personal. Untuk pertanyaan atau kolaborasi, silakan hubungi melalui GitHub Issues.
