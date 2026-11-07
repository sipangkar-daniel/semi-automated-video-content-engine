import { NextRequest, NextResponse } from "next/server";
import { getRenderJobStatus } from "@/server/services/renderer";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: "jobId diperlukan." },
      { status: 400 }
    );
  }

  const job = getRenderJobStatus(jobId);

  if (!job) {
    return NextResponse.json(
      { success: false, error: "Job render tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: job,
  });
}
