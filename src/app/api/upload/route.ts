import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file yang diunggah." },
        { status: 400 }
      );
    }

    const mimeType = file.type;
    const isVideo = mimeType.startsWith("video/");
    const isImage = mimeType.startsWith("image/");

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { success: false, error: "Format file tidak didukung. Unggah video (.mp4, .webm) atau gambar (.jpg, .png, .webp)." },
        { status: 400 }
      );
    }

    // Pastikan folder target ada
    const uploadDir = path.join(process.cwd(), "public", "uploads", "media");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Buat nama file aman & unik
    const extension = path.extname(file.name) || (isVideo ? ".mp4" : ".jpg");
    const sanitizedBase = path
      .basename(file.name, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const fileName = `media_${Date.now()}_${sanitizedBase}${extension}`;
    const destinationPath = path.join(uploadDir, fileName);

    // Tulis buffer ke disk lokal
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destinationPath, buffer);

    const relativeWebPath = `/uploads/media/${fileName}`;

    return NextResponse.json({
      success: true,
      filePath: relativeWebPath,
      mediaType: isVideo ? "video" : "image",
      originalName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("[API Upload Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengunggah file." },
      { status: 500 }
    );
  }
}
