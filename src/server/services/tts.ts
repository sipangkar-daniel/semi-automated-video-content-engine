import fs from "fs";
import path from "path";
import crypto from "crypto";
import * as mm from "music-metadata";
import { synthesizeToFile } from "./edge-tts-client";

export interface GenerateVoiceoverOptions {
  text: string;
  voice?: string;
  sceneId: string;
}

export interface VoiceoverResult {
  audioPath: string;       // Path relatif web (e.g. /uploads/audio/...)
  absolutePath: string;    // Path fisik file lokal
  durationInSeconds: number;
  durationInFrames: number;
}

export const DEFAULT_VOICE = "id-ID-GadisNeural";
export const SILENCE_PADDING_FRAMES = 12; // 0.4 detik buffer jeda antar scene @ 30fps

/**
 * Mengonversi skrip teks menjadi file audio MP3 menggunakan Edge-TTS
 * dan mengekstrak durasi presisi ke satuan frame Remotion.
 */
export async function generateVoiceover({
  text,
  voice = DEFAULT_VOICE,
  sceneId,
}: GenerateVoiceoverOptions): Promise<VoiceoverResult> {
  const cleanText = text?.trim();
  if (!cleanText) {
    throw new Error("Teks voiceover tidak boleh kosong.");
  }

  // Siapkan folder penyimpanan audio lokal
  const audioDir = path.join(process.cwd(), "public", "uploads", "audio");
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Buat hash unik dari konten (Teks + Suara) untuk audio caching
  const contentHash = crypto
    .createHash("md5")
    .update(`${voice}_${cleanText}`)
    .digest("hex")
    .slice(0, 10);

  const sanitizedId = sceneId.replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `voice_${sanitizedId}_${contentHash}.mp3`;
  const absolutePath = path.join(audioDir, filename);
  const audioWebPath = `/uploads/audio/${filename}`;

  // 1. Cek Audio Cache: jika file sudah pernah digenerate dengan teks & suara yang sama, gunakan langsung
  let fileReady = false;
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).size > 1000) {
    fileReady = true;
  }

  // 2. Jika belum ada, sintesis menggunakan native edge-tts-client
  if (!fileReady) {
    await synthesizeToFile({
      text: cleanText,
      voice: voice || DEFAULT_VOICE,
      outputPath: absolutePath,
    });
  }

  // 3. Baca metadata durasi audio secara presisi
  let durationInSeconds = 3.0; // fallback default
  try {
    const metadata = await mm.parseFile(absolutePath);
    if (metadata.format.duration && metadata.format.duration > 0) {
      durationInSeconds = metadata.format.duration;
    }
  } catch (err) {
    console.warn(`[TTS] Gagal membaca durasi file audio: ${err}`);
  }

  // Konversi durasi detik ke total frames pada 30 FPS + padding hening
  const rawFrames = Math.ceil(durationInSeconds * 30);
  const durationInFrames = rawFrames + SILENCE_PADDING_FRAMES;

  return {
    audioPath: audioWebPath,
    absolutePath,
    durationInSeconds: Number(durationInSeconds.toFixed(2)),
    durationInFrames,
  };
}

/**
 * Menghasilkan voiceover untuk sekumpulan adegan dengan rate-limit safety delay
 */
export async function generateBatchVoiceovers(
  items: Array<{ id: string; subtitle: string; voice?: string }>
): Promise<Map<string, VoiceoverResult>> {
  const results = new Map<string, VoiceoverResult>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const result = await generateVoiceover({
      text: item.subtitle,
      voice: item.voice || DEFAULT_VOICE,
      sceneId: item.id,
    });
    results.set(item.id, result);

    // Beri jeda 600ms antar adegan agar tidak memicu rate-limit Microsoft
    if (i < items.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  return results;
}
