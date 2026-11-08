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

  const entrance = spring({
    frame: frame - 3,
    fps,
    config: {
      damping: 15,
      mass: 0.6,
      stiffness: 110,
    },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [15, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 48,
        right: 48,
        bottom: 180, // Safe zone platform
        transform: `translateY(${translateY}px)`,
        opacity,
        display: "flex",
        justifyContent: "center",
        zIndex: 25,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: "95%",
          padding: "10px 20px",
          borderRadius: 12,
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(4px)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1.35,
            color: "#f8fafc",
            fontFamily: theme?.fontFamily || "Inter, sans-serif",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.9)",
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
};
