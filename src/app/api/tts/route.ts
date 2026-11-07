import { NextRequest, NextResponse } from "next/server";
import { generateVoiceover, DEFAULT_VOICE } from "@/server/services/tts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Skenario 1: Single Scene
    if (body.sceneId && body.subtitle) {
      const result = await generateVoiceover({
        text: body.subtitle,
        voice: body.voice || DEFAULT_VOICE,
        sceneId: body.sceneId,
      });

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Skenario 2: Batch Scenes
    if (Array.isArray(body.scenes) && body.scenes.length > 0) {
      const results = [];
      for (const scene of body.scenes) {
        if (!scene.subtitle || !scene.id) continue;
        const res = await generateVoiceover({
          text: scene.subtitle,
          voice: scene.voice || body.defaultVoice || DEFAULT_VOICE,
          sceneId: scene.id,
        });
        results.push({
          sceneId: scene.id,
          ...res,
        });
      }

      return NextResponse.json({
        success: true,
        data: results,
      });
    }

    return NextResponse.json(
      { success: false, error: "Format request tidak valid. Berikan 'scenes' array atau 'sceneId' & 'subtitle'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[API /api/tts Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal menggenerasi voiceover.",
      },
      { status: 500 }
    );
  }
}
