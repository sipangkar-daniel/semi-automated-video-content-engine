import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VideoTheme } from "../../../types/schema";

interface SpecOverlayCardProps {
  highlightSpec: string;
  theme?: VideoTheme;
  sceneIndex: number;
}

export const SpecOverlayCard: React.FC<SpecOverlayCardProps> = ({
  highlightSpec,
  theme,
  sceneIndex,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const primaryColor = theme?.primaryColor || "#3b82f6";
  const accentColor = theme?.accentColor || "#f59e0b";

  // Animasi masuk menggunakan Spring Physics (bouncy & smooth)
  const entryProgress = spring({
    frame,
    fps,
    config: {
      damping: 13,
      mass: 0.8,
      stiffness: 95,
    },
  });

  const translateY = interpolate(entryProgress, [0, 1], [60, 0]);
  const opacity = interpolate(entryProgress, [0, 0.6, 1], [0, 0.8, 1]);
  const scale = interpolate(entryProgress, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 380, // Safe Zone: di atas subtitle & tombol interaksi platform
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 20,
      }}
    >
      {/* Pill Badge Penanda Fitur */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-start",
          padding: "8px 18px",
          borderRadius: 9999,
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          border: `1px solid ${accentColor}40`,
          boxShadow: `0 0 20px ${accentColor}25`,
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: accentColor,
            boxShadow: `0 0 8px ${accentColor}`,
          }}
        />
        <span
          style={{
            color: "#f8fafc",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: theme?.fontFamily || "Inter, sans-serif",
          }}
        >
          FITUR #{sceneIndex + 1}
        </span>
      </div>

      {/* Main Glassmorphism Card */}
      <div
        style={{
          padding: "24px 32px",
          borderRadius: 24,
          backgroundColor: "rgba(10, 10, 16, 0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.6), 0 0 35px ${primaryColor}20`,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.2,
            color: "#ffffff",
            fontFamily: theme?.fontFamily || "Inter, sans-serif",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            background: `linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {highlightSpec}
        </h2>
      </div>
    </div>
  );
};
