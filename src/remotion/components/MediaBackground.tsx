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

  if (!media.localPath || media.localPath.trim() === "") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, #1e293b 0%, #09090b 100%)",
        }}
      />
    );
  }

  // Helper untuk resolve path lokal Remotion
  const resolvedSrc = media.localPath.startsWith("http")
    ? media.localPath
    : staticFile(media.localPath.replace(/^\//, ""));

  // Efek subtle Ken Burns zoom (1x -> 1.05x)
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.05], {
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

      {/* Vignette lembut di atas & bawah agar teks tetap kontras tanpa menutupi media */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.0) 70%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
