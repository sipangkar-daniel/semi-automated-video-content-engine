import fs from "fs";
import path from "path";
import { EdgeTTS } from "node-edge-tts";
import * as mm from "music-metadata";

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
  if (!text || text.trim().length === 0) {
    throw new Error("Teks voiceover tidak boleh kosong.");
  }

  // Siapkan folder penyimpanan audio lokal
  const audioDir = path.join(process.cwd(), "public", "uploads", "audio");
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Nama file unik per request
  const sanitizedId = sceneId.replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `voice_${Date.now()}_${sanitizedId}.mp3`;
  const absolutePath = path.join(audioDir, filename);
  const audioWebPath = `/uploads/audio/${filename}`;

  // Inisialisasi Edge-TTS
  const tts = new EdgeTTS({
    voice: voice || DEFAULT_VOICE,
    lang: "id-ID",
    outputFormat: "audio-24khz-48kbitrate-mono-mp3",
  });

  // Sintesis audio ke file
  await tts.ttsPromise(text, absolutePath);

  // Baca metadata durasi audio secara presisi
  let durationInSeconds = 3.0; // fallback default
  try {
    const metadata = await mm.parseFile(absolutePath);
    if (metadata.format.duration && metadata.format.duration > 0) {
      durationInSeconds = metadata.format.duration;
    }
  } catch (err) {
    console.warn(`[TTS] Gagal membaca durasi file audio via music-metadata: ${err}`);
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
 * Menghasilkan voiceover untuk sekumpulan adegan sekaligus secara paralel
 */
export async function generateBatchVoiceovers(
  items: Array<{ id: string; subtitle: string; voice?: string }>
): Promise<Map<string, VoiceoverResult>> {
  const results = new Map<string, VoiceoverResult>();

  // Jalankan sekuensial atau paralel terkelola
  for (const item of items) {
    const result = await generateVoiceover({
      text: item.subtitle,
      voice: item.voice || DEFAULT_VOICE,
      sceneId: item.id,
    });
    results.set(item.id, result);
  }

  return results;
}
