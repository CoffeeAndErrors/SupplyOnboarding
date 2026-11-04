import { Composition, registerRoot } from "remotion";
import { KoiWhatsNew } from "./KoiWhatsNew";
import { FPS, TOTAL_FRAMES } from "./edit";
import "./fonts";

function Root() {
  return <Composition id="KoiWhatsNew" component={KoiWhatsNew} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />;
}

registerRoot(Root);
