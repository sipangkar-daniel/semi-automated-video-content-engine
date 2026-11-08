import React, { useState } from "react";
import { Scene, SceneRole } from "@/types/schema";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from "lucide-react";

interface SceneCardProps {
  scene: Scene;
  index: number;
  totalScenes: number;
  onUpdate: (updated: Scene) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  index,
  totalScenes,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isInheritedBg = scene.media.backgroundMode === "inherit_previous";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah media.");
      }

      onUpdate({
        ...scene,
        media: {
          ...scene.media,
          type: data.mediaType,
          localPath: data.filePath,
          backgroundMode: "standalone",
        },
      });
    } catch (err: any) {
      setUploadError(err.message || "Upload gagal.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60 backdrop-blur-sm space-y-3.5">
      {/* Header Scene */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-xs font-bold text-blue-400">
            {index + 1}
          </span>

          {/* Selector Peran Adegan */}
          <select
            value={scene.role || "feature"}
            onChange={(e) =>
              onUpdate({
                ...scene,
                role: e.target.value as SceneRole,
                layout: {
                  ...scene.layout,
                  textPosition: e.target.value === "intro" ? "top" : "bottom",
                },
              })
            }
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-zinc-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="intro">Intro (Pembuka/Hook)</option>
            <option value="feature">Fitur / Spesifikasi</option>
            <option value="comparison">Perbandingan (VS)</option>
            <option value="outro">Outro (Kesimpulan)</option>
            <option value="custom">Kustom Bebas</option>
          </select>

          {scene.audio.audioPath ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              TTS Siap ({scene.audio.durationInSeconds}s)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-3 h-3" />
              Belum Ada Audio
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Pindahkan ke atas"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalScenes - 1}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Pindahkan ke bawah"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={totalScenes <= 1}
            className="rounded-lg p-1 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Hapus adegan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Kolom Background Media (4 cols) */}
        <div className="md:col-span-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
            <span>Media Background</span>
            {index > 0 && (
              <label className="flex items-center gap-1 text-[11px] text-blue-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInheritedBg}
                  onChange={(e) =>
                    onUpdate({
                      ...scene,
                      media: {
                        ...scene.media,
                        backgroundMode: e.target.checked
                          ? "inherit_previous"
                          : "standalone",
                      },
                    })
                  }
                  className="rounded border-zinc-700 bg-zinc-900 text-blue-500"
                />
                Lanjut Latar Sebelumnya
              </label>
            )}
          </div>

          {isInheritedBg ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 p-4 text-center min-h-[120px] space-y-1">
              <Layers className="w-6 h-6 text-blue-400" />
              <p className="text-xs font-medium text-blue-300">
                Meneruskan Latar Adegan #{index}
              </p>
              <span className="text-[10px] text-zinc-400">
                Video/gambar mengalir terus tanpa terputus
              </span>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 p-3 text-center overflow-hidden min-h-[120px]">
              {scene.media.localPath ? (
                <div className="w-full flex flex-col items-center gap-1.5">
                  {scene.media.type === "image" ? (
                    <img
                      src={scene.media.localPath}
                      alt="Preview"
                      className="h-20 w-full object-cover rounded-lg border border-zinc-800"
                    />
                  ) : (
                    <div className="flex h-20 w-full items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <Film className="w-8 h-8 text-blue-400" />
                    </div>
                  )}
                  <span className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                    {scene.media.localPath.split("/").pop()}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-zinc-500">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-medium">Unggah Video / Foto</span>
                </div>
              )}

              <input
                type="file"
                accept="video/mp4,video/webm,image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 cursor-pointer opacity-0"
                title="Pilih file media"
              />

              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                </div>
              )}
            </div>
          )}

          {uploadError && (
            <p className="text-[11px] text-red-400">{uploadError}</p>
          )}
        </div>

        {/* Kolom Teks & Posisi (8 cols) */}
        <div className="md:col-span-8 space-y-3">
          {/* Judul & Custom Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-zinc-400">
                Teks Judul / Highlight Layar
              </label>
              <input
                type="text"
                value={scene.text.highlightSpec}
                onChange={(e) =>
                  onUpdate({
                    ...scene,
                    text: { ...scene.text, highlightSpec: e.target.value },
                  })
                }
                placeholder="Contoh: Review iPhone 15 Pro / Kamera 48MP"
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">
                Badge / Label
              </label>
              <input
                type="text"
                value={scene.text.customBadge || ""}
                onChange={(e) =>
                  onUpdate({
                    ...scene,
                    text: { ...scene.text, customBadge: e.target.value },
                  })
                }
                placeholder="Kustom (mis: REVIEW)"
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Subtitle / Skrip Narasi */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">
              Skrip Voiceover Narasi (Akan dibacakan AI Gadis)
            </label>
            <textarea
              rows={2}
              value={scene.text.subtitle}
              onChange={(e) =>
                onUpdate({
                  ...scene,
                  text: { ...scene.text, subtitle: e.target.value },
                })
              }
              placeholder="Contoh: Ini smartphone flagship terbaru dengan material titanium..."
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Posisi Tata Letak Teks */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/60">
            <span className="text-zinc-400">Posisi Teks di Layar:</span>
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    ...scene,
                    layout: { ...scene.layout, textPosition: "top" },
                  })
                }
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  scene.layout?.textPosition === "top"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Atas
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    ...scene,
                    layout: { ...scene.layout, textPosition: "center" },
                  })
                }
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  scene.layout?.textPosition === "center"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Tengah
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    ...scene,
                    layout: { ...scene.layout, textPosition: "bottom" },
                  })
                }
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  scene.layout?.textPosition === "bottom"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Bawah
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
