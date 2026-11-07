import React from "react";
import { Composition } from "remotion";
import { SmartphoneSpecVideo } from "./compositions/SmartphoneSpecVideo";
import { VideoProjectSchema, VideoProject } from "../../types/schema";
import sampleProject from "../../sample-input.json";

export const RemotionRoot: React.FC = () => {
  const transitionDuration = 12;

  return (
    <>
      <Composition
        id="SmartphoneSpecVideo"
        component={SmartphoneSpecVideo}
        durationInFrames={sampleProject.totalDurationInFrames}
        fps={30}
        width={1080}
        height={1920}
        schema={VideoProjectSchema}
        defaultProps={sampleProject as VideoProject}
        calculateMetadata={({ props }) => {
          const numScenes = props.scenes.length;
          const totalRawFrames = props.scenes.reduce(
            (acc, scene) => acc + (scene.audio?.durationInFrames ?? 90),
            0
          );
          // Kurangi waktu overlap transisi antar adegan
          const totalFrames = Math.max(
            30,
            totalRawFrames - (numScenes > 1 ? (numScenes - 1) * transitionDuration : 0)
          );

          return {
            durationInFrames: totalFrames,
            fps: props.fps || 30,
            width: props.width || 1080,
            height: props.height || 1920,
            props,
          };
        }}
      />
    </>
  );
};
