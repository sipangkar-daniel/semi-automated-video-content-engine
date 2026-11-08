import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VideoTheme, SceneRole } from "../../../types/schema";

interface TextOverlayProps {
  text: string;
  role?: SceneRole;
  customBadge?: string;
  position?: "top" | "center" | "bottom";
  theme?: VideoTheme;
  sceneIndex: number;
}

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  role = "feature",
  customBadge,
  position = "bottom",
  theme,
  sceneIndex,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accentColor = theme?.accentColor || "#f59e0b";

  // Animasi masuk halus berbasis spring
  const entry = spring({
    frame,
    fps,
    config: {
      damping: 14,
      mass: 0.7,
      stiffness: 100,
    },
  });

  const translateY = interpolate(entry, [0, 1], [position === "top" ? -30 : 30, 0]);
  const opacity = interpolate(entry, [0, 1], [0, 1]);
  const scale = interpolate(entry, [0, 1], [0.95, 1]);

  // Tentukan badge teks jika ada
  let badgeLabel: string | null = null;
  if (customBadge && customBadge.trim().length > 0) {
    badgeLabel = customBadge.trim();
  } else if (role === "intro") {
    badgeLabel = "REVIEW";
  } else if (role === "comparison") {
    badgeLabel = "VS";
  } else if (role === "outro") {
    badgeLabel = "VERDICT";
  } else if (role === "feature") {
    // Opsional: jika fitur biasa dan tidak ada custom badge, tampilkan nomor kecil
    badgeLabel = `#${sceneIndex + 1}`;
  }

  // Tentukan posisi vertikal di layar 9:16 (1920px)
  let verticalStyle: React.CSSProperties = {
    bottom: 340, // default bottom (di atas subtitle narasi)
  };
  if (position === "top") {
    verticalStyle = {
      top: 180, // Safe zone atas (di bawah kamera selfie/header)
    };
  } else if (position === "center") {
    verticalStyle = {
      top: "45%",
      transform: `translateY(-50%) translateY(${translateY}px) scale(${scale})`,
    };
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 48,
        right: 48,
        ...verticalStyle,
        transform:
          position === "center"
            ? verticalStyle.transform
            : `translateY(${translateY}px) scale(${scale})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: position === "center" ? "center" : "flex-start",
        gap: 10,
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      {/* Badge Minimalis (Tanpa kotak tebal yang menutupi video) */}
      {badgeLabel && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 14px",
            borderRadius: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            border: `1px solid ${accentColor}80`,
            backdropFilter: "blur(6px)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: accentColor,
            }}
          />
          <span
            style={{
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: theme?.fontFamily || "Inter, sans-serif",
            }}
          >
            {badgeLabel}
          </span>
        </div>
      )}

      {/* Teks Judul Bersih & Tajam (Tanpa Kotak Kaca Tebal) */}
      <h2
        style={{
          margin: 0,
          fontSize: position === "top" ? 54 : 48,
          fontWeight: 900,
          lineHeight: 1.15,
          color: "#ffffff",
          fontFamily: theme?.fontFamily || "Inter, sans-serif",
          textAlign: position === "center" ? "center" : "left",
          letterSpacing: "-0.02em",
          // Text shadow berlapis agar terbaca sangat tajam di atas video apapun tanpa perlu kotak card
          textShadow:
            "0 2px 4px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.8), 0 0 25px rgba(0,0,0,0.6)",
        }}
      >
        {text}
      </h2>
    </div>
  );
};
