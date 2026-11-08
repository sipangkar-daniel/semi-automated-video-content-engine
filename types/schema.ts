import { z } from "zod";

/**
 * Single Source of Truth (SSOT) untuk seluruh tipe data
 * pada Semi-Automated Video Content Engine.
 */

// 1. Tipe Media per Scene
export const MediaSchema = z.object({
  type: z.enum(["video", "image"]),
  localPath: z.string().default(""),
  fit: z.enum(["cover", "contain"]).default("cover"),
  // Background scope: apakah media ini berdiri sendiri atau mewarisi background sebelumnya
  backgroundMode: z.enum(["standalone", "inherit_previous"]).default("standalone"),
});

// 2. Tipe Layout & Tata Letak Teks/Media
export const SceneLayoutSchema = z.object({
  textPosition: z.enum(["top", "center", "bottom"]).default("bottom"),
  mediaPresentation: z.enum(["fullscreen", "floating-card", "split"]).default("fullscreen"),
});

// 3. Tipe Teks & Overlay Spek
export const SceneTextSchema = z.object({
  highlightSpec: z.string().min(1, "Judul / highlight harus diisi"),
  subtitle: z.string().min(1, "Skrip narasi adegan harus diisi"),
  customBadge: z.string().optional(), // Kustom label, misal: "INTRO", "PROS & CONS", "KESIMPULAN"
});

// 4. Peran / Tipe Adegan
export const SceneRoleSchema = z.enum(["intro", "feature", "comparison", "outro", "custom"]).default("feature");

// 5. Tipe Audio & Voiceover Narasi
export const SceneAudioSchema = z.object({
  voice: z.string().default("id-ID-GadisNeural"), // Default suara Edge-TTS Indonesia Wanita (Gadis)
  audioPath: z.string().nullable().default(null),
  durationInSeconds: z.number().default(3),
  durationInFrames: z.number().int().positive().default(90), // default 3 detik @ 30 FPS
});

// 6. Tipe Transisi Antar Scene
export const TransitionTypeSchema = z.enum(["fade", "slide-left", "zoom", "none"]).default("fade");

// 7. Definisi Adegan Tunggal (Scene)
export const SceneSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  role: SceneRoleSchema.default("feature"),
  layout: SceneLayoutSchema.default({
    textPosition: "bottom",
    mediaPresentation: "fullscreen",
  }),
  media: MediaSchema,
  text: SceneTextSchema,
  audio: SceneAudioSchema,
  transition: TransitionTypeSchema,
});

// 6. Tema Visual Video
export const DEFAULT_THEME = {
  primaryColor: "#3b82f6", // Blue-500
  accentColor: "#f59e0b",  // Amber-500
  backgroundColor: "#09090b", // Zinc-950
  fontFamily: "Inter, sans-serif",
  badgePosition: "bottom" as const,
};

export const VideoThemeSchema = z.object({
  primaryColor: z.string().default(DEFAULT_THEME.primaryColor),
  accentColor: z.string().default(DEFAULT_THEME.accentColor),
  backgroundColor: z.string().default(DEFAULT_THEME.backgroundColor),
  fontFamily: z.string().default(DEFAULT_THEME.fontFamily),
  badgePosition: z.enum(["bottom", "center"]).default(DEFAULT_THEME.badgePosition),
});

// 7. Payload Lengkap Satu Proyek Video (Input untuk Remotion)
export const VideoProjectSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "Judul video harus diisi"),
  fps: z.literal(30).default(30),
  width: z.literal(1080).default(1080),
  height: z.literal(1920).default(1920),
  theme: VideoThemeSchema.default(DEFAULT_THEME),
  scenes: z.array(SceneSchema).min(1, "Minimal harus ada 1 adegan"),
  totalDurationInFrames: z.number().int().positive().default(90),
});

// 8. Skema Status Render Job (Untuk Polling Status Render)
export const RenderJobStatusSchema = z.object({
  jobId: z.string(),
  projectId: z.string(),
  status: z.enum(["idle", "generating_tts", "rendering", "completed", "failed"]),
  progress: z.number().min(0).max(100).default(0), // Persentase 0-100%
  outputPath: z.string().nullable().default(null),
  errorMessage: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// TypeScript Types yang diinfer dari Zod
export type Media = z.infer<typeof MediaSchema>;
export type SceneLayout = z.infer<typeof SceneLayoutSchema>;
export type SceneRole = z.infer<typeof SceneRoleSchema>;
export type SceneText = z.infer<typeof SceneTextSchema>;
export type SceneAudio = z.infer<typeof SceneAudioSchema>;
export type TransitionType = z.infer<typeof TransitionTypeSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type VideoTheme = z.infer<typeof VideoThemeSchema>;
export type VideoProject = z.infer<typeof VideoProjectSchema>;
export type RenderJobStatus = z.infer<typeof RenderJobStatusSchema>;
