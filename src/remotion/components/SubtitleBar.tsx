import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VideoTheme } from "../../../types/schema";

interface SubtitleBarProps {
  subtitle: string;
  theme?: VideoTheme;
}

export const SubtitleBar: React.FC<SubtitleBarProps> = ({
  subtitle,
  theme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth entrance
  const entrance = spring({
    frame: frame - 4, // sedikit delay setelah spec card muncul
    fps,
    config: {
      damping: 15,
      mass: 0.6,
      stiffness: 110,
    },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [25, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 220, // Tepat di bawah spec card, di atas watermark/navigasi platform
        transform: `translateY(${translateY}px)`,
        opacity,
        display: "flex",
        justifyContent: "center",
        zIndex: 25,
      }}
    >
      <div
        style={{
          maxWidth: "92%",
          padding: "16px 28px",
          borderRadius: 16,
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 600,
            lineHeight: 1.4,
            color: "#f1f5f9",
            fontFamily: theme?.fontFamily || "Inter, sans-serif",
            letterSpacing: "0.01em",
          }}
        >
          “{subtitle}”
        </p>
      </div>
    </div>
  );
};
