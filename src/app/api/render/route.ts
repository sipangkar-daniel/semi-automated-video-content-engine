import { NextRequest, NextResponse } from "next/server";
import { VideoProjectSchema } from "@/types/schema";
import { createRenderJob } from "@/server/services/renderer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const validation = VideoProjectSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi data proyek gagal.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const project = validation.data;
    const { jobId, status } = createRenderJob(project);

    return NextResponse.json({
      success: true,
      jobId,
      status,
    });
  } catch (error: any) {
    console.error("[API /api/render Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memicu render video." },
      { status: 500 }
    );
  }
}
