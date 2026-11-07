# ARCHITECTURE BLUEPRINT & ANTI-CONTEXT-LOSS RULES
**Project:** Semi-Automated Video Content Engine (Clipper & Remixer)  
**Format Target:** Video Vertikal 9:16 (1080 x 1920, 30 FPS)  
**Stack Utama:** Next.js (App Router, TypeScript, Tailwind CSS), Remotion, Edge-TTS, FFmpeg  

---

## 1. Aturan Baku AI (Anti-Drift Guardrails)
Setiap agen AI yang bekerja pada codebase ini **WAJIB** mematuhi aturan berikut:
1. **Single Source of Truth (SSOT):** Seluruh struktur data HARUS mengikuti definisi di `types/schema.ts`. Dilarang menambah field atau mengubah nama atribut tanpa memperbarui schema tersebut terlebih dahulu.
2. **Decoupled Architecture:** 
   - Remotion Composition di `src/remotion/` TIDAK BOLEH mengimpor modul Next.js server/API atau modul Node.js backend. Remotion adalah React murni.
   - Modul TTS di `src/server/services/tts.ts` berdiri sendiri (menggunakan Edge-TTS gratis bahasa Indonesia: `id-ID-ArdiNeural` / `id-ID-GadisNeural` tanpa ketergantungan API key).
   - Render runner di `src/server/services/renderer.ts` mengeksekusi CLI Remotion dan mengelola job status secara terisolasi.
3. **Local Storage & Static Binaries:**
   - Semua media upload disimpan di `public/uploads/` dan output video di `public/renders/`. Gunakan absolute web path (`/uploads/...`) saat diakses di browser/Remotion.
   - FFmpeg & FFprobe menggunakan paket npm otomatis (`ffmpeg-static` dan `ffprobe-static`) agar berjalan mulus di Windows tanpa instalasi manual.
4. **Project Root:** Aplikasi diinisialisasi langsung di root (`d:\Project\semi-automated-video-content-engine`) dengan folder `src/`.
5. **Context Recovery Protocol:** Jika sesi AI terputus atau token limit tercapai, langkah pertama AI pada sesi berikutnya adalah membaca file ini (`ARCHITECTURE.md`) dan `TODO.md` untuk mengetahui sprint & task yang sedang aktif.

---

## 2. Directory Structure Blueprint
```text
semi-automated-video-content-engine/
├── ARCHITECTURE.md             # Cetak biru sistem & panduan AI
├── TODO.md                     # Roadmap detail & checklist sprint
├── package.json
├── tsconfig.json
├── types/
│   └── schema.ts               # SSOT data contract (Zod + TypeScript)
├── public/
│   ├── uploads/                # Tempat simpan video/foto/audio upload
│   └── renders/                # Tempat output video MP4 hasil render
├── src/
│   ├── app/                    # Next.js App Router (UI & API)
│   │   ├── api/
│   │   │   ├── tts/route.ts          # Endpoint generate voiceover
│   │   │   ├── upload/route.ts       # Endpoint upload media lokal
│   │   │   └── render/
│   │   │       ├── route.ts          # Trigger CLI render job
│   │   │       └── [jobId]/route.ts  # Polling render progress
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Dashboard Studio Utama
│   ├── components/             # UI Components (React/Tailwind)
│   │   ├── form/
│   │   │   ├── ProjectSetupForm.tsx
│   │   │   └── SceneCard.tsx
│   │   ├── preview/
│   │   │   └── RemotionPlayerView.tsx
│   │   └── ui/                       # Shadcn / Primitives
│   ├── remotion/               # Pure Remotion Code (Dapat dites standalone)
│   │   ├── Root.tsx                  # Entry point komposisi Remotion
│   │   ├── index.ts                  # Remotion bundle entry
│   │   ├── compositions/
│   │   │   └── SmartphoneSpecVideo.tsx
│   │   └── components/
│   │       ├── MediaBackground.tsx   # Video/Image background layer
│   │       ├── SpecOverlayCard.tsx   # Animasi teks spec gadget
│   │       ├── SubtitleBar.tsx       # Teks subtitle sinkron narasi
│   │       └── TransitionEffect.tsx  # Efek transisi antar scene
│   └── server/                 # Backend Core Logic (Node.js)
│       └── services/
│           ├── tts.ts                # Audio generator & duration extractor
│           └── renderer.ts           # CLI wrapper runner & progress tracker
└── remotion.config.ts          # Konfigurasi Chromium & bundling Remotion
```

---

## 3. Data Pipeline & Lifecycle
Alur data video mengikuti State Machine linier:

```text
[User Form / Dashboard]
       │
       ▼ (1. Submit Data Adegan)
[Next.js API: /api/tts]
       │  - Edge-TTS menghasilkan file .mp3 per adegan
       │  - ffprobe / music-metadata membaca durasi audio milidetik
       │  - frames = Math.ceil((durationMs / 1000) * 30)
       ▼
[JSON Payload Terfinalisasi (input.json)]
       │
       ├──► [Remotion Player (Web Preview)] : Live test sebelum render
       │
       ▼ (2. Trigger Render)
[Next.js API: /api/render]
       │  - Menjalankan child_process: npx remotion render
       │  - Parsing stdout log untuk mendapatkan % progress
       ▼
[File MP4 di public/renders/output_{timestamp}.mp4]
```

---

## 4. Standar Resolusi & Render
- **Canvas:** 1080 x 1920 (Vertical 9:16)
- **FPS:** 30 FPS
- **Codec:** H.264 (`--codec=h264`), Audio AAC
- **Duration Formula:**  
  `Total Project Frames = Sum(Scene[i].audio.durationInFrames) + PaddingFrames`
- **Safe Zone:** Card spesifikasi berada di range Y 60% s/d 85% untuk menghindari tabrakan dengan UI TikTok/Shorts (tombol like, deskripsi akun).
