import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { VideoProject } from "../../../types/schema";
import { MediaBackground } from "../components/MediaBackground";
import { SpecOverlayCard } from "../components/SpecOverlayCard";
import { SubtitleBar } from "../components/SubtitleBar";

export const SmartphoneSpecVideo: React.FC<VideoProject> = ({
  scenes,
  theme,
}) => {
  const transitionDuration = 12; // 12 frames transisi (~0.4 detik)

  return (
    <AbsoluteFill style={{ backgroundColor: theme?.backgroundColor || "#09090b" }}>
      <TransitionSeries>
        {scenes.map((scene, index) => {
          const isLastScene = index === scenes.length - 1;

          // Pilih jenis transisi
          const getTransitionPresentation = () => {
            switch (scene.transition) {
              case "slide-left":
                return slide({ direction: "from-right" });
              case "fade":
              default:
                return fade();
            }
          };

          return (
            <React.Fragment key={scene.id || index}>
              <TransitionSeries.Sequence durationInFrames={scene.audio.durationInFrames}>
                {/* 1. Visual Background (Video / Foto) */}
                <MediaBackground
                  media={scene.media}
                  durationInFrames={scene.audio.durationInFrames}
                />

                {/* 2. Kartu Spesifikasi Bouncy Glassmorphism */}
                <SpecOverlayCard
                  highlightSpec={scene.text.highlightSpec}
                  theme={theme}
                  sceneIndex={index}
                />

                {/* 3. Subtitle Bar Narasi Suara */}
                <SubtitleBar
                  subtitle={scene.text.subtitle}
                  theme={theme}
                />

                {/* 4. Audio Voiceover (Jika ada file audio yang digenerate) */}
                {scene.audio.audioPath ? (
                  <Audio
                    src={
                      scene.audio.audioPath.startsWith("http")
                        ? scene.audio.audioPath
                        : staticFile(scene.audio.audioPath.replace(/^\//, ""))
                    }
                  />
                ) : null}
              </TransitionSeries.Sequence>

              {/* Transisi ke adegan berikutnya */}
              {!isLastScene && (
                <TransitionSeries.Transition
                  presentation={getTransitionPresentation()}
                  timing={linearTiming({ durationInFrames: transitionDuration })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
