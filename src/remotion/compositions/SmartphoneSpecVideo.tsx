import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { VideoProject, Media } from "../../../types/schema";
import { MediaBackground } from "../components/MediaBackground";
import { TextOverlay } from "../components/TextOverlay";
import { SubtitleBar } from "../components/SubtitleBar";

export const SmartphoneSpecVideo: React.FC<VideoProject> = ({
  scenes,
  theme,
}) => {
  // 1. Hitung alur background groups (Shared Background antar adegan)
  const { backgroundSegments, sceneTimeline } = useMemo(() => {
    let currentFrame = 0;
    const timeline: Array<{
      sceneIndex: number;
      startFrame: number;
      durationInFrames: number;
    }> = [];

    interface BgSegment {
      media: Media;
      startFrame: number;
      durationInFrames: number;
    }

    const segments: BgSegment[] = [];
    let currentSegment: BgSegment | null = null;

    scenes.forEach((scene, index) => {
      const duration = scene.audio?.durationInFrames || 90;
      timeline.push({
        sceneIndex: index,
        startFrame: currentFrame,
        durationInFrames: duration,
      });

      const isInherit =
        scene.media.backgroundMode === "inherit_previous" && currentSegment !== null;

      if (isInherit && currentSegment) {
        // Teruskan background dari segmen sebelumnya tanpa jeda/restart
        currentSegment.durationInFrames += duration;
      } else {
        // Buat segmen background baru
        currentSegment = {
          media: scene.media,
          startFrame: currentFrame,
          durationInFrames: duration,
        };
        segments.push(currentSegment);
      }

      currentFrame += duration;
    });

    return { backgroundSegments: segments, sceneTimeline: timeline };
  }, [scenes]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme?.backgroundColor || "#09090b" }}>
      {/* LAYER 1: Background Track (Mendukung Video Mengalir Kontinu Lintas Scene) */}
      {backgroundSegments.map((seg, idx) => (
        <Sequence
          key={`bg-seg-${idx}-${seg.startFrame}`}
          from={seg.startFrame}
          durationInFrames={seg.durationInFrames}
        >
          <MediaBackground
            media={seg.media}
            durationInFrames={seg.durationInFrames}
          />
        </Sequence>
      ))}

      {/* LAYER 2: Overlay Typography & Voiceover Per Adegan */}
      {scenes.map((scene, index) => {
        const timeInfo = sceneTimeline[index];
        if (!timeInfo) return null;

        const resolvedAudioSrc = scene.audio.audioPath
          ? scene.audio.audioPath.startsWith("http")
            ? scene.audio.audioPath
            : staticFile(scene.audio.audioPath.replace(/^\//, ""))
          : null;

        return (
          <Sequence
            key={scene.id || index}
            from={timeInfo.startFrame}
            durationInFrames={timeInfo.durationInFrames}
          >
            {/* Teks Judul Bersih Tanpa Kotak Kaca Tebal */}
            <TextOverlay
              text={scene.text.highlightSpec}
              role={scene.role}
              customBadge={scene.text.customBadge}
              position={scene.layout?.textPosition || "bottom"}
              theme={theme}
              sceneIndex={index}
            />

            {/* Subtitle Narasi Suara */}
            <SubtitleBar
              subtitle={scene.text.subtitle}
              theme={theme}
            />

            {/* Audio Voiceover Narasi */}
            {resolvedAudioSrc ? <Audio src={resolvedAudioSrc} /> : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
