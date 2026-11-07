"use client";

import React, { useMemo } from "react";
import { Player } from "@remotion/player";
import { SmartphoneSpecVideo } from "@/remotion/compositions/SmartphoneSpecVideo";
import { VideoProject } from "@/types/schema";

interface RemotionPlayerViewProps {
  project: VideoProject;
}

export const RemotionPlayerView: React.FC<RemotionPlayerViewProps> = ({
  project,
}) => {
  const transitionDuration = 12;

  // Hitung total frames dengan memperhitungkan overlap transisi antar adegan
  const calculatedDurationInFrames = useMemo(() => {
    const numScenes = project.scenes.length;
    const totalRawFrames = project.scenes.reduce(
      (acc, s) => acc + (s.audio?.durationInFrames || 90),
      0
    );
    const overlap = numScenes > 1 ? (numScenes - 1) * transitionDuration : 0;
    return Math.max(30, totalRawFrames - overlap);
  }, [project.scenes]);

  return (
    <div className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl">
      <Player
        component={SmartphoneSpecVideo}
        inputProps={project}
        durationInFrames={calculatedDurationInFrames}
        fps={project.fps || 30}
        compositionWidth={project.width || 1080}
        compositionHeight={project.height || 1920}
        style={{
          width: "100%",
          aspectRatio: "9/16",
        }}
        controls
        loop
        autoPlay={false}
      />
    </div>
  );
};
