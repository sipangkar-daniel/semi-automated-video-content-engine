import React from "react";
import { Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { Media } from "../../../types/schema";

interface MediaBackgroundProps {
  media: Media;
  durationInFrames: number;
}

export const MediaBackground: React.FC<MediaBackgroundProps> = ({
  media,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // Helper untuk resolve path lokal Remotion (staticFile jika path relatif atau /uploads)
  const resolvedSrc = media.localPath.startsWith("http")
    ? media.localPath
    : staticFile(media.localPath.replace(/^\//, ""));

  // Efek subtle Ken Burns zoom (1x -> 1.08x) agar gambar statis tetap dinamis
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#09090b",
      }}
    >
      {media.type === "video" ? (
        <OffthreadVideo
          src={resolvedSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: media.fit || "cover",
          }}
        />
      ) : (
        <Img
          src={resolvedSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: media.fit || "cover",
            transform: `scale(${scale})`,
          }}
        />
      )}

      {/* Vignette & Gradient Overlay di bagian bawah layar untuk kontras teks */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, rgba(9,9,11,0.85) 85%, rgba(9,9,11,0.98) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
