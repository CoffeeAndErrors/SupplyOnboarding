// ============================================================================
// "What's new in KOI": the film. A cream stage. Above the card, the chapter
// title on a lime highlighter. In the card, the real store, the camera easing
// in on what matters. Under it, a dark subtitle saying what's happening, step
// by step. The cursor is drawn here from the recorded moves, since a headless
// screen recording has none. Opens and closes on forest.
// ============================================================================
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLIPS } from "./clips";
import { CAPTIONS, CAPTION_SPANS, FPS, TIMELINE, cameraAt, cursorAt, frameAt, shotSecondOf, sourceAt, subtitleAt } from "./edit";
import { DISPLAY, MONO, SANS } from "./fonts";

const C = { forest: "#083d2d", lime: "#ddf247", bg: "#f6f5f1", ink: "#1c1e17", ember: "#e8743b" };
const CARD = { x: 320, y: 150, w: 1280, h: 800 };
const SUB_TOP = CARD.y + CARD.h + 26;
const S = CARD.w / 1440; // card pixels per page pixel at zoom 1

export function KoiWhatsNew() {
  const intro = TIMELINE.find((s) => s.kind === "intro");
  const outro = TIMELINE.find((s) => s.kind === "outro");
  const shots = TIMELINE.filter((s) => s.clip);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 24, overflow: "hidden",
          background: "#fff", boxShadow: "0 50px 90px -46px rgba(8,61,45,.55), 0 0 0 1px rgba(8,61,45,.09)",
        }}
      >
        {shots.map((s) => (
          <Sequence key={s.index} from={s.from} durationInFrames={s.frames + s.tail} layout="absolute-fill">
            <Shot shot={s} />
          </Sequence>
        ))}
      </div>
      {shots.map((s) => (
        <Sequence key={`sub-${s.index}`} from={s.from} durationInFrames={s.frames} layout="absolute-fill">
          <Subtitle shot={s} />
        </Sequence>
      ))}
      {CAPTION_SPANS.map((span) => (
        <Sequence key={`${span.cap}-${span.from}`} from={span.from} durationInFrames={span.frames} layout="absolute-fill">
          <Caption cap={CAPTIONS[span.cap]} frames={span.frames} />
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={intro.frames + 18} layout="absolute-fill">
        <Intro frames={intro.frames} />
      </Sequence>
      <Sequence from={outro.from - 14} durationInFrames={outro.frames + 14} layout="absolute-fill">
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
}

// ── One shot of footage, inside the card ────────────────────────────────────
function Shot({ shot }) {
  const frame = useCurrentFrame();
  const clip = CLIPS[shot.clip];
  const t = Math.min(frame, shot.frames) / FPS;
  const src = sourceAt(shot.seg, t);
  const i = frameAt(clip.frames, src);
  const cam = cameraAt(shot.cam, src);
  const scale = S * cam.z;
  const left = CARD.w / 2 - cam.x * scale;
  const top = CARD.h / 2 - cam.y * scale;
  const opacity = shot.fade ? interpolate(frame, [0, shot.fade], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }) : 1;
  const cur = cursorAt(clip, src);
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={staticFile(`capture/${shot.clip}/${String(i).padStart(5, "0")}.jpg`)}
        style={{ position: "absolute", left, top, width: 1440 * scale, height: 900 * scale, maxWidth: "none" }}
      />
      {cur && cur.show > 0.01 && <Cursor x={left + cur.x * scale} y={top + cur.y * scale} show={cur.show} ripple={cur.ripple} z={cam.z} />}
    </AbsoluteFill>
  );
}

function Cursor({ x, y, show, ripple, z }) {
  const size = 24 * Math.sqrt(z);
  return (
    <>
      {ripple != null && (
        <div
          style={{
            position: "absolute", left: x, top: y, width: 56 * Math.sqrt(z), height: 56 * Math.sqrt(z), borderRadius: "50%",
            transform: `translate(-50%, -50%) scale(${0.25 + ripple * 0.95})`, opacity: (1 - ripple) * 0.9 * show,
            border: `${3 * Math.sqrt(z)}px solid ${C.ember}`, background: "rgba(232,116,59,.14)",
          }}
        />
      )}
      <svg
        width={size} height={size} viewBox="0 0 24 24"
        style={{ position: "absolute", left: x - size * 0.16, top: y - size * 0.08, opacity: show, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))", overflow: "visible" }}
      >
        <path d="M4 2.5 L4 19.2 L8.2 15.4 L11.1 21.6 L14.2 20.2 L11.3 14.2 L17.2 14.2 Z" fill="#fff" stroke={C.ink} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </>
  );
}

// ── The subtitle under the card: what's happening, step by step ─────────────
function Subtitle({ shot }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.min(frame, shot.frames) / FPS;
  const now = subtitleAt(shot.sub, sourceAt(shot.seg, t));
  if (!now) return null;
  const since = frame - Math.round(shotSecondOf(shot.seg, now.s) * FPS);
  const p = spring({ frame: since, fps, config: { damping: 200 }, durationInFrames: 12 });
  const out = interpolate(frame, [shot.frames - 6, shot.frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: SUB_TOP, display: "flex", justifyContent: "center", opacity: out }}>
      <div
        key={now.i}
        style={{
          ...SANS, display: "flex", alignItems: "center", gap: 16, maxWidth: 1500, padding: "15px 30px 15px 22px", borderRadius: 999,
          background: C.forest, color: C.bg, fontSize: 31, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.005em",
          boxShadow: "0 18px 40px -22px rgba(8,61,45,.7)", opacity: p, transform: `translateY(${(1 - p) * 12}px)`,
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: C.lime, flexShrink: 0 }} />
        {now.text}
      </div>
    </div>
  );
}

// ── The chapter title above the card, on a lime highlighter ─────────────────
function Caption({ cap, frames }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = (delay) => spring({ frame: f - delay, fps, config: { damping: 200 }, durationInFrames: 16 });
  const out = interpolate(f, [frames - 7, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eyebrow = rise(0);
  const mark = rise(6);
  return (
    <div style={{ position: "absolute", left: CARD.x, top: 26, width: CARD.w, opacity: out, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ ...MONO, fontWeight: 600, fontSize: 18, letterSpacing: "0.2em", textTransform: "uppercase", color: C.ember, opacity: eyebrow, transform: `translateY(${(1 - eyebrow) * 8}px)` }}>
        {cap.n}
        <span style={{ margin: "0 0.7em", color: "rgba(8,61,45,.45)" }}>·</span>
        <span style={{ color: "rgba(8,61,45,.75)" }}>{cap.eyebrow}</span>
      </div>
      <div style={{ position: "relative", alignSelf: "flex-start" }}>
        <div style={{ position: "absolute", left: -10, right: -12, top: "34%", bottom: "-6%", background: C.lime, borderRadius: 6, transformOrigin: "left", transform: `scaleX(${mark})` }} />
        <div style={{ ...DISPLAY, position: "relative", fontSize: 64, lineHeight: 1, color: C.forest, whiteSpace: "nowrap" }}>
          {cap.title.split(" ").map((w, i) => {
            const p = rise(3 + i * 2);
            return (
              <span key={i} style={{ display: "inline-block", marginRight: "0.22em", opacity: p, transform: `translateY(${(1 - p) * 22}px)` }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Opening and closing, on forest ──────────────────────────────────────────
function Wordmark({ size, color = C.bg }) {
  return (
    <span style={{ ...DISPLAY, fontSize: size, lineHeight: 1, color, letterSpacing: "-0.02em", display: "inline-flex", alignItems: "baseline" }}>
      KOI
      <span style={{ display: "inline-block", width: size * 0.15, height: size * 0.15, borderRadius: "50%", background: C.ember, marginLeft: size * 0.04 }} />
    </span>
  );
}

function Intro({ frames }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mark = spring({ frame: f - 2, fps, config: { damping: 200 }, durationInFrames: 20 });
  const sub = spring({ frame: f - 12, fps, config: { damping: 200 }, durationInFrames: 18 });
  const wipe = interpolate(f, [frames - 12, frames + 16], [0, -100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.7, 0, 0.2, 1) });
  return (
    <AbsoluteFill style={{ background: C.forest, transform: `translateY(${wipe}%)`, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
      <div style={{ opacity: mark, transform: `scale(${0.94 + mark * 0.06})` }}>
        <Wordmark size={230} />
      </div>
      <div style={{ ...MONO, fontWeight: 600, fontSize: 24, letterSpacing: "0.3em", textTransform: "uppercase", color: C.lime, opacity: sub, transform: `translateY(${(1 - sub) * 10}px)` }}>
        What’s new · the KOI agent
      </div>
    </AbsoluteFill>
  );
}

function Outro() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = interpolate(f, [0, 16], [100, 0], { extrapolateRight: "clamp", easing: Easing.bezier(0.7, 0, 0.2, 1) });
  const a = spring({ frame: f - 14, fps, config: { damping: 200 }, durationInFrames: 18 });
  const b = spring({ frame: f - 22, fps, config: { damping: 200 }, durationInFrames: 18 });
  const c = spring({ frame: f - 34, fps, config: { damping: 200 }, durationInFrames: 18 });
  return (
    <AbsoluteFill style={{ background: C.forest, transform: `translateY(${rise}%)`, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
      <div style={{ opacity: a }}>
        <Wordmark size={64} />
      </div>
      <div style={{ ...DISPLAY, fontSize: 132, lineHeight: 0.94, textAlign: "center" }}>
        <div style={{ color: C.bg, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>One bar.</div>
        <div style={{ color: C.lime, opacity: b, transform: `translateY(${(1 - b) * 24}px)` }}>The whole week.</div>
      </div>
      <div style={{ ...MONO, fontWeight: 500, fontSize: 17, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(246,245,241,.6)", opacity: c, marginTop: 10 }}>
        Recorded live on KOI’s demo build · 5 Nov 2026
      </div>
    </AbsoluteFill>
  );
}
