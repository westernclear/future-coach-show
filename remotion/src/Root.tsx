import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { FifaVideo } from "./FifaVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="main"
        component={MainVideo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="fifa"
        component={FifaVideo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
