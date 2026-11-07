import React from "react";
import { VideoTheme } from "@/types/schema";
import { Sparkles, Sliders, Volume2, Palette } from "lucide-react";

interface ProjectSetupFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  voice: string;
  onVoiceChange: (voice: string) => void;
  theme: VideoTheme;
  onThemeChange: (theme: VideoTheme) => void;
}

export const ProjectSetupForm: React.FC<ProjectSetupFormProps> = ({
  title,
  onTitleChange,
  voice,
  onVoiceChange,
  theme,
  onThemeChange,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center gap-2 text-zinc-200 border-b border-zinc-800/80 pb-3">
        <Sliders className="w-5 h-5 text-blue-400" />
        <h2 className="text-base font-semibold">Pengaturan Proyek Video</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Judul Proyek */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-zinc-400">
            Judul Proyek / Produk
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Contoh: Review Singkat iPhone 15 Pro"
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Karakter Suara Voiceover */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
            Suara Voiceover (Edge-TTS)
          </label>
          <select
            value={voice}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          >
            <option value="id-ID-GadisNeural">Gadis (Wanita - Jernih & Dinamis)</option>
            <option value="id-ID-ArdiNeural">Ardi (Pria - Formal & Reviewer)</option>
          </select>
        </div>

        {/* Pilihan Warna Tema */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-zinc-400" />
            Warna Aksen Highlight
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.accentColor}
              onChange={(e) =>
                onThemeChange({ ...theme, accentColor: e.target.value })
              }
              className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-700 bg-transparent p-1"
            />
            <input
              type="text"
              value={theme.accentColor}
              onChange={(e) =>
                onThemeChange({ ...theme, accentColor: e.target.value })
              }
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-200 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
