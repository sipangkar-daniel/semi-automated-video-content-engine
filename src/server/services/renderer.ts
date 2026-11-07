import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { VideoProject, RenderJobStatus } from "@/types/schema";

// Penyimpanan status job render di memori backend
const jobStore = new Map<string, RenderJobStatus>();

export function getRenderJobStatus(jobId: string): RenderJobStatus | null {
  return jobStore.get(jobId) || null;
}

export function createRenderJob(project: VideoProject): { jobId: string; status: RenderJobStatus } {
  const jobId = `job_${Date.now()}`;
  const now = new Date();
  
  // Format timestamp terbaca: YYYYMMDD_HHMM
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const timeFormatted = `${yyyy}${mm}${dd}_${hh}${min}`;

  // Judul slug aman
  const slug =
    project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "video";

  const outputFileName = `video_${slug}_${timeFormatted}.mp4`;
  const outputRelativeWebPath = `/renders/${outputFileName}`;

  const initialStatus: RenderJobStatus = {
    jobId,
    projectId: project.projectId,
    status: "rendering",
    progress: 0,
    outputPath: outputRelativeWebPath,
    errorMessage: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  jobStore.set(jobId, initialStatus);

  // Jalankan render di background secara asinkron
  executeRenderProcess(jobId, project, outputFileName, outputRelativeWebPath).catch((err) => {
    console.error(`[Renderer] Error unhandled pada job ${jobId}:`, err);
    updateJob(jobId, {
      status: "failed",
      errorMessage: err.message || "Gagal mengeksekusi render video.",
    });
  });

  return { jobId, status: initialStatus };
}

function updateJob(jobId: string, partial: Partial<RenderJobStatus>) {
  const current = jobStore.get(jobId);
  if (!current) return;
  const updated: RenderJobStatus = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  jobStore.set(jobId, updated);
}

async function executeRenderProcess(
  jobId: string,
  project: VideoProject,
  outputFileName: string,
  outputRelativeWebPath: string
) {
  const rendersDir = path.join(process.cwd(), "public", "renders");
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }

  // Tulis file input JSON sementara
  const tempPayloadPath = path.join(rendersDir, `temp_${jobId}.json`);
  fs.writeFileSync(tempPayloadPath, JSON.stringify(project, null, 2), "utf-8");

  const outputAbsolutePath = path.join(rendersDir, outputFileName);
  const entryPoint = "src/remotion/index.ts";
  const compositionId = "SmartphoneSpecVideo";

  // Gunakan npx remotion render dengan flag terstandardisasi
  const args = [
    "remotion",
    "render",
    entryPoint,
    compositionId,
    outputAbsolutePath,
    `--props=${tempPayloadPath}`,
    "--log=info",
  ];

  console.log(`[Renderer] Memulai job render: ${jobId}`);
  const isWindows = process.platform === "win32";
  const child = spawn(isWindows ? "npx.cmd" : "npx", args, {
    cwd: process.cwd(),
    shell: true,
  });

  let errorLogs = "";

  child.stdout.on("data", (chunk: Buffer) => {
    const text = chunk.toString();

    // 1. Parsing progress frame render: "Rendered 45/180"
    const renderMatch = text.match(/Rendered\s+(\d+)\/(\d+)/i);
    if (renderMatch) {
      const current = parseInt(renderMatch[1], 10);
      const total = parseInt(renderMatch[2], 10);
      if (total > 0) {
        // Alokasikan 0% s/d 85% untuk tahap frame rendering
        const pct = Math.min(85, Math.round((current / total) * 85));
        updateJob(jobId, { progress: pct });
      }
    }

    // 2. Parsing progress encoding: "Encoded 50/180"
    const encodeMatch = text.match(/Encoded\s+(\d+)\/(\d+)/i);
    if (encodeMatch) {
      const current = parseInt(encodeMatch[1], 10);
      const total = parseInt(encodeMatch[2], 10);
      if (total > 0) {
        // Alokasikan 85% s/d 99% untuk tahap encoding akhir
        const pct = Math.min(99, 85 + Math.round((current / total) * 14));
        updateJob(jobId, { progress: pct });
      }
    }
  });

  child.stderr.on("data", (chunk: Buffer) => {
    errorLogs += chunk.toString();
  });

  child.on("close", (code) => {
    // Hapus file payload sementara
    try {
      if (fs.existsSync(tempPayloadPath)) {
        fs.unlinkSync(tempPayloadPath);
      }
    } catch {}

    if (code === 0) {
      console.log(`[Renderer] Sukses render job: ${jobId} -> ${outputRelativeWebPath}`);
      updateJob(jobId, {
        status: "completed",
        progress: 100,
        outputPath: outputRelativeWebPath,
      });
    } else {
      console.error(`[Renderer] Render gagal dengan kode keluar ${code}: ${errorLogs}`);
      updateJob(jobId, {
        status: "failed",
        errorMessage: errorLogs.slice(-400) || `Proses render keluar dengan kode ${code}.`,
      });
    }
  });
}
