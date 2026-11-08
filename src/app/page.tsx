"use client";

import React, { useState, useRef, useEffect } from "react";
import { Scene, VideoProject, VideoTheme, RenderJobStatus, DEFAULT_THEME } from "@/types/schema";
import { ProjectSetupForm } from "@/components/form/ProjectSetupForm";
import { SceneCard } from "@/components/form/SceneCard";
import { RemotionPlayerView } from "@/components/preview/RemotionPlayerView";
import { RenderProgressModal } from "@/components/preview/RenderProgressModal";
import {
  Plus,
  Mic,
  Video,
  Play,
  Sparkles,
  Loader2,
  Clock,
  Layers,
  CheckCircle,
  DownloadCloud,
} from "lucide-react";

const INITIAL_SCENES: Scene[] = [
  {
    id: "scene-1",
    order: 1,
    role: "intro",
    layout: {
      textPosition: "top",
      mediaPresentation: "fullscreen",
    },
    media: {
      type: "image",
      localPath: "/uploads/sample_bodi.jpg",
      fit: "cover",
      backgroundMode: "standalone",
    },
    text: {
      highlightSpec: "Review iPhone 15 Pro",
      subtitle: "Inilah smartphone flagship terbaru dengan material titanium super kokoh.",
      customBadge: "INTRODUCE",
    },
    audio: {
      voice: "id-ID-GadisNeural",
      audioPath: "/uploads/audio/test_gadis.mp3",
      durationInSeconds: 6.98,
      durationInFrames: 222,
    },
    transition: "fade",
  },
  {
    id: "scene-2",
    order: 2,
    role: "feature",
    layout: {
      textPosition: "bottom",
      mediaPresentation: "fullscreen",
    },
    media: {
      type: "image",
      localPath: "/uploads/sample_kamera.jpg",
      fit: "cover",
      backgroundMode: "standalone",
    },
    text: {
      highlightSpec: "Kamera Utama 48MP OIS",
      subtitle: "Kamera utamanya kini berkekuatan 48 megapixel dengan detail tajam.",
    },
    audio: {
      voice: "id-ID-GadisNeural",
      audioPath: null,
      durationInSeconds: 3.5,
      durationInFrames: 117,
    },
    transition: "slide-left",
  },
];

export default function VideoStudioDashboard() {
  const [projectTitle, setProjectTitle] = useState("Review Singkat iPhone 15 Pro");
  const [voice, setVoice] = useState("id-ID-GadisNeural");
  const [theme, setTheme] = useState<VideoTheme>(DEFAULT_THEME);
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES);

  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [ttsSuccessMessage, setTtsSuccessMessage] = useState<string | null>(null);

  // State untuk Render Job Modal & Polling
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [jobStatus, setJobStatus] = useState<RenderJobStatus | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Kalkulasi total frame & durasi
  const totalFrames = scenes.reduce(
    (acc, s) => acc + (s.audio?.durationInFrames || 90),
    0
  );
  const totalSeconds = (totalFrames / 30).toFixed(1);

  // Bersihkan polling saat komponen unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Fungsi tambah adegan
  const handleAddScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      order: scenes.length + 1,
      role: "feature",
      layout: {
        textPosition: "bottom",
        mediaPresentation: "fullscreen",
      },
      media: {
        type: "image",
        localPath: "",
        fit: "cover",
        backgroundMode: "standalone",
      },
      text: {
        highlightSpec: "Spesifikasi Unggulan Baru",
        subtitle: "Masukkan teks narasi yang akan dibacakan di sini.",
      },
      audio: {
        voice,
        audioPath: null,
        durationInSeconds: 3.0,
        durationInFrames: 102,
      },
      transition: "fade",
    };
    setScenes([...scenes, newScene]);
  };

  // Update adegan
  const handleUpdateScene = (index: number, updated: Scene) => {
    const newScenes = [...scenes];
    newScenes[index] = updated;
    setScenes(newScenes);
  };

  // Hapus adegan
  const handleDeleteScene = (index: number) => {
    if (scenes.length <= 1) return;
    const filtered = scenes.filter((_, i) => i !== index);
    const reordered = filtered.map((s, i) => ({ ...s, order: i + 1 }));
    setScenes(reordered);
  };

  // Pindah urutan ke atas
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newScenes = [...scenes];
    const temp = newScenes[index - 1];
    newScenes[index - 1] = newScenes[index];
    newScenes[index] = temp;
    setScenes(newScenes.map((s, i) => ({ ...s, order: i + 1 })));
  };

  // Pindah urutan ke bawah
  const handleMoveDown = (index: number) => {
    if (index === scenes.length - 1) return;
    const newScenes = [...scenes];
    const temp = newScenes[index + 1];
    newScenes[index + 1] = newScenes[index];
    newScenes[index] = temp;
    setScenes(newScenes.map((s, i) => ({ ...s, order: i + 1 })));
  };

  // Memicu Voiceover Generation untuk semua scene via API /api/tts
  const handleGenerateAllVoiceover = async () => {
    setIsGeneratingTTS(true);
    setTtsSuccessMessage(null);

    try {
      const payload = {
        defaultVoice: voice,
        scenes: scenes.map((s) => ({
          id: s.id,
          subtitle: s.text.subtitle,
          voice,
        })),
      };

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menggenerasi voiceover.");
      }

      const updatedScenes = scenes.map((s) => {
        const audioData = json.data.find((item: any) => item.sceneId === s.id);
        if (audioData) {
          return {
            ...s,
            audio: {
              voice,
              audioPath: audioData.audioPath,
              durationInSeconds: audioData.durationInSeconds,
              durationInFrames: audioData.durationInFrames,
            },
          };
        }
        return s;
      });

      setScenes(updatedScenes);
      setTtsSuccessMessage("Voiceover seluruh adegan berhasil dibuat!");
      setTimeout(() => setTtsSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Error TTS: ${err.message}`);
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  // Memulai Render MP4 Final
  const handleStartRender = async () => {
    try {
      const calculatedTotal = Math.max(
        30,
        totalFrames - (scenes.length > 1 ? (scenes.length - 1) * 12 : 0)
      );

      const projectPayload: VideoProject = {
        projectId: `proj_${Date.now()}`,
        title: projectTitle || "Video Review Gadget",
        fps: 30,
        width: 1080,
        height: 1920,
        theme,
        scenes,
        totalDurationInFrames: calculatedTotal,
      };

      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectPayload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal memulai render.");
      }

      setJobStatus(json.status);
      setIsRenderModalOpen(true);

      // Mulai polling progress ke /api/render/[jobId]
      const jobId = json.jobId;
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/render/${jobId}`);
          const pollJson = await pollRes.json();
          if (pollJson.success && pollJson.data) {
            setJobStatus(pollJson.data);
            if (
              pollJson.data.status === "completed" ||
              pollJson.data.status === "failed"
            ) {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 1500);
    } catch (err: any) {
      alert(`Render Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Video Content Engine
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                Studio 9:16
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Clipper, Voiceover & Automated Remotion Remixer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <Layers className="w-4 h-4 text-zinc-400" />
            <span>{scenes.length} Adegan</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span>{totalSeconds} Detik ({totalFrames}f)</span>
          </div>
        </div>
      </header>

      {/* Main Studio Body: Split-Screen Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Kolom Kiri: Form & Scene Manager (7 cols) */}
        <section className="lg:col-span-7 space-y-5">
          {/* Form Setup Proyek */}
          <ProjectSetupForm
            title={projectTitle}
            onTitleChange={setProjectTitle}
            voice={voice}
            onVoiceChange={setVoice}
            theme={theme}
            onThemeChange={setTheme}
          />

          {/* Scene List Controls */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Daftar Adegan Video ({scenes.length})
              </h2>
              <p className="text-xs text-zinc-400">
                Atur urutan, klip media, dan skrip per adegan
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddScene}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 transition-all border border-zinc-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Adegan
            </button>
          </div>

          {/* Daftar Kartu Adegan */}
          <div className="space-y-4">
            {scenes.map((scene, idx) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                index={idx}
                totalScenes={scenes.length}
                onUpdate={(updated) => handleUpdateScene(idx, updated)}
                onDelete={() => handleDeleteScene(idx)}
                onMoveUp={() => handleMoveUp(idx)}
                onMoveDown={() => handleMoveDown(idx)}
              />
            ))}
          </div>
        </section>

        {/* Kolom Kanan: Live Studio Preview & Action Controls (5 cols, Sticky) */}
        <section className="lg:col-span-5">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-blue-400" />
                  Live Preview Interaktif (9:16)
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  1080 x 1920 @ 30 FPS
                </span>
              </div>

              {/* Live Web Player 9:16 dari Remotion */}
              <div className="flex justify-center py-1">
                <RemotionPlayerView
                  project={{
                    projectId: "active-project",
                    title: projectTitle,
                    fps: 30,
                    width: 1080,
                    height: 1920,
                    theme,
                    scenes,
                    totalDurationInFrames: Math.max(
                      30,
                      totalFrames - (scenes.length > 1 ? (scenes.length - 1) * 12 : 0)
                    ),
                  }}
                />
              </div>

              {/* Status Pesan Sukses TTS */}
              {ttsSuccessMessage && (
                <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{ttsSuccessMessage}</span>
                </div>
              )}

              {/* Tombol Aksi Utama */}
              <div className="mt-4 space-y-2.5">
                {/* 1. Tombol Generate Voiceover */}
                <button
                  type="button"
                  onClick={handleGenerateAllVoiceover}
                  disabled={isGeneratingTTS}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 py-2.5 text-xs font-semibold text-zinc-100 transition-all shadow-sm disabled:opacity-50"
                >
                  {isGeneratingTTS ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      Menggenerasi Suara Gadis...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-blue-400" />
                      1. Generate Voiceover Seluruh Adegan
                    </>
                  )}
                </button>

                {/* 2. Tombol Render Video Final MP4 */}
                <button
                  type="button"
                  onClick={handleStartRender}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01]"
                >
                  <DownloadCloud className="w-4 h-4" />
                  2. Render Video Final (MP4)
                </button>

                <p className="text-[11px] text-zinc-500 text-center pt-1">
                  Video akan di-encode menggunakan Remotion CLI ke resolusi 1080x1920 MP4 siap upload.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Dialog Render Progress */}
      <RenderProgressModal
        isOpen={isRenderModalOpen}
        jobStatus={jobStatus}
        onClose={() => setIsRenderModalOpen(false)}
      />
    </div>
  );
}
