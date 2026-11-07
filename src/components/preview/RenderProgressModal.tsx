import React from "react";
import { RenderJobStatus } from "@/types/schema";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  X,
  Film,
} from "lucide-react";

interface RenderProgressModalProps {
  isOpen: boolean;
  jobStatus: RenderJobStatus | null;
  onClose: () => void;
}

export const RenderProgressModal: React.FC<RenderProgressModalProps> = ({
  isOpen,
  jobStatus,
  onClose,
}) => {
  if (!isOpen || !jobStatus) return null;

  const isCompleted = jobStatus.status === "completed";
  const isFailed = jobStatus.status === "failed";
  const isRendering = jobStatus.status === "rendering";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
        {/* Tombol Close jika sudah selesai atau gagal */}
        {(isCompleted || isFailed) && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Icon & Status */}
        <div className="text-center space-y-2">
          {isRendering && (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
          )}
          {isCompleted && (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          )}
          {isFailed && (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shadow-lg shadow-red-500/10">
              <AlertTriangle className="w-7 h-7" />
            </div>
          )}

          <h3 className="text-lg font-bold text-white">
            {isRendering && "Sedang Merender Video MP4..."}
            {isCompleted && "Video Berhasil Di-render!"}
            {isFailed && "Proses Render Mengalami Kendala"}
          </h3>
          <p className="text-xs text-zinc-400">
            {isRendering && "Remotion sedang memproses frame dan menyematkan audio voiceover."}
            {isCompleted && "File video 9:16 berkualitas tinggi siap untuk dipublikasikan."}
            {isFailed && (jobStatus.errorMessage || "Terjadi kesalahan saat memproses video.")}
          </p>
        </div>

        {/* Progress Bar */}
        {isRendering && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-zinc-400">Progres Encoding</span>
              <span className="text-blue-400 font-mono">{jobStatus.progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${Math.max(5, jobStatus.progress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons saat Selesai */}
        {isCompleted && jobStatus.outputPath && (
          <div className="space-y-3 pt-2">
            <a
              href={jobStatus.outputPath}
              download
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Video MP4 ({jobStatus.outputPath.split("/").pop()})
            </a>
            <a
              href={jobStatus.outputPath}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 py-2.5 text-xs font-medium text-zinc-300 transition-all"
            >
              <Film className="w-4 h-4 text-zinc-400" />
              Buka File di Tab Baru
            </a>
          </div>
        )}

        {isFailed && (
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-semibold text-zinc-200 transition-all"
          >
            Tutup & Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
};
