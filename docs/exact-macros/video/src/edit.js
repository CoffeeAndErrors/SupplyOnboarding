// ============================================================================
// The edit: what plays when, from which clip, and where the camera looks.
//
// A shot plays one captured clip (public/capture/<clip>):
//   seg  [[from, to, seconds], …]  source seconds from→to, played over `seconds`
//                                  (faster than real time where KOI is thinking)
//   cam  [[t, zoom, x, y], …]      at shot second t the camera is centred on page
//                                  point (x, y) of the 1440×900 page, at `zoom`
//                                  (1 shows the whole page); eased between keys
//   cap  the caption above the card (CAPTIONS)
//   fade frames of cross-fade from the shot before (default 8)
// ============================================================================

export const FPS = 30;

export const CAPTIONS = {
  bar: { n: "01", eyebrow: "The KOI bar", title: "One bar, on every page.", line: "It reads the page you’re on, and suggests what you can do there." },
  people: { n: "02", eyebrow: "Household", title: "Add someone in a sentence.", line: "KOI drafts the profile, then asks before it saves anything." },
  script: { n: "02", eyebrow: "Commentary", title: "Long chats read like a script.", line: "Lights down: the whole conversation, line by line." },
  profile: { n: "03", eyebrow: "Household", title: "Everyone’s whole profile.", line: "A simple goal, or their own macros, checked to add up." },
  calendar: { n: "04", eyebrow: "Calendar", title: "Tell it about your week.", line: "Office lunch every Tuesday: on the calendar, and off the plan." },
  plan: { n: "05", eyebrow: "Plan", title: "Four people. One week. ₹4,000.", line: "Everyone gets 100% of their protein, for ₹3,026." },
  grid: { n: "05", eyebrow: "Plan", title: "Planned around everyone.", line: "Tuesday lunch is out for Me. Shared dinners skip onion and garlic for Mother." },
  rules: { n: "06", eyebrow: "House rules", title: "Change your mind. It re-plans.", line: "“We never keep peanuts”: saved as a house rule, and the week solved again." },
  cart: { n: "07", eyebrow: "Cart", title: "Into the cart, with your OK.", line: "Every line says who it’s for. KOI never checks out for you." },
  shop: { n: "07", eyebrow: "Cart", title: "One cart. A shop that’s safe.", line: "Extras come from a shop that hides what anyone at home can’t have." },
  label: { n: "08", eyebrow: "Any product", title: "Is this okay for everyone?", line: "KOI reads the label against each person at home." },
  track: { n: "09", eyebrow: "Track", title: "Ate out? Just say so.", line: "KOI estimates the meal, logs it, and offers a Take 2 for the day." },
  cook: { n: "10", eyebrow: "Cook", title: "From the plan to the pan.", line: "Recipes sized to the plan. Cook mode keeps your timers running." },
};

// Framings used again and again.
const FULL = [1, 720, 450];
const DOCK = [1.4, 720, 579]; // typing in the bar
const PTOP = [1.7, 1016, 300]; // KOI's panel, top half
const PMID = [1.7, 1016, 470];
const PLOW = [1.7, 1016, 635]; // KOI's panel, newest cards and the composer
const k = (t, f) => [t, ...f];

export const SHOTS = [
  { kind: "intro", seconds: 2.2 },

  // 01 · The bar, page by page: Home, Plan, Track, Calendar (a slow push on each).
  { cap: "bar", clip: "bar", seg: [[1.6, 6.4, 2.0]], cam: [k(0, [1.08, 667, 483]), k(2.0, [1.13, 667, 498])], fade: 0 },
  { cap: "bar", clip: "bar", seg: [[10.6, 13.6, 1.4]], cam: [k(0, [1.18, 600, 520]), k(1.4, [1.24, 600, 535])], fade: 6 },
  { cap: "bar", clip: "bar", seg: [[16.6, 19.6, 1.4]], cam: [k(0, [1.08, 667, 483]), k(1.4, [1.13, 667, 498])], fade: 6 },
  { cap: "bar", clip: "bar", seg: [[22.2, 25.5, 1.6]], cam: [k(0, [1.08, 720, 483]), k(1.6, [1.13, 720, 500])], fade: 6 },

  // 02 · Mother, in one sentence: typed in the bar, drafted, details skipped, saved with an OK.
  {
    cap: "people", clip: "household",
    seg: [[5.2, 11.2, 1.9], [11.2, 19.0, 0.9], [19.0, 21.8, 1.1], [21.8, 24.2, 0.4], [24.2, 27.1, 2.1], [27.1, 28.85, 0.7]],
    cam: [k(0, DOCK), k(1.8, DOCK), k(2.5, PTOP), k(2.8, PTOP), k(3.2, PMID), k(4.0, PMID), k(4.3, PLOW), k(6.4, PLOW), k(7.1, FULL)],
  },
  { cap: "script", clip: "household", seg: [[28.95, 30.6, 1.5]], cam: [k(0, FULL)], fade: 6 },

  // 03 · The Household page: Mother's profile, her numbers the advanced way.
  { cap: "profile", clip: "members", seg: [[2.3, 7.1, 1.7], [7.1, 12.6, 2.3]], cam: [k(0, FULL), k(1.6, FULL), k(2.3, [1.5, 891, 400])] },

  // 04 · Calendar: a weekly lunch out, with an OK; next week shows it.
  {
    cap: "calendar", clip: "calendar",
    seg: [[3.6, 7.4, 1.1], [7.4, 10.8, 0.5], [10.8, 13.45, 1.9]],
    cam: [k(0, PLOW)],
  },
  { cap: "calendar", clip: "calweek", seg: [[1.5, 5.3, 1.8]], cam: [k(0, FULL), k(0.55, FULL), k(1.25, [1.7, 520, 440])] },

  // 05 · The plan: four people, a budget, every protein target met; then the grid.
  {
    cap: "plan", clip: "plan",
    seg: [[0.0, 3.0, 1.1], [3.0, 7.0, 1.3], [7.0, 9.0, 0.5], [9.0, 12.4, 2.1]],
    cam: [k(0, PLOW), k(4.4, PLOW), k(5.0, FULL)],
  },
  {
    cap: "grid", clip: "grid",
    seg: [[2.6, 4.5, 0.8], [4.5, 10.8, 2.6]],
    cam: [k(0, FULL), k(0.8, FULL), k(1.4, [2.0, 1060, 420]), k(2.1, [2.0, 1060, 420]), k(2.8, [2.0, 400, 560])],
  },

  // 06 · A house rule: no peanuts, saved with an OK, the week solved again.
  {
    cap: "rules", clip: "peanuts",
    seg: [[2.0, 6.6, 1.1], [6.6, 9.9, 0.4], [9.9, 12.7, 1.8], [12.7, 18.3, 1.0], [18.3, 21.4, 1.4], [23.2, 26.4, 1.3]],
    cam: [k(0, PLOW), k(4.3, PLOW), k(5.0, PMID), k(5.7, PMID), k(6.3, [1.5, 720, 380])],
  },

  // 07 · Cart: the week in, with an OK; the safe shop, the split, the export.
  {
    cap: "cart", clip: "cart",
    seg: [[1.9, 6.0, 0.8], [6.0, 8.8, 1.5], [8.8, 12.4, 1.1]],
    cam: [k(0, PLOW), k(2.3, PLOW), k(2.9, FULL)],
  },
  // The Pantry's shop hides what anyone can't have; one thing added; the cart's "You added"; Export.
  { cap: "shop", clip: "shop", seg: [[4.7, 7.3, 1.3]], cam: [k(0, [1.9, 430, 300]), k(1.3, [2.0, 420, 290])] },
  { cap: "shop", clip: "shop", seg: [[10.5, 11.95, 0.9]], cam: [k(0, FULL)] },
  {
    cap: "shop", clip: "shop",
    seg: [[14.0, 17.3, 1.4], [17.3, 20.3, 0.5], [20.3, 22.9, 1.5]],
    cam: [k(0, [1.8, 420, 330]), k(1.4, [1.8, 420, 330]), k(1.9, [1.6, 900, 330])],
  },

  // 08 · A product: is it right for everyone? Fits three, not the kid (peanuts).
  { cap: "label", clip: "label", seg: [[2.0, 5.8, 1.5]], cam: [k(0, [1.18, 600, 520]), k(1.5, [1.24, 600, 535])] },
  {
    cap: "label", clip: "label",
    seg: [[9.9, 12.9, 0.9], [12.9, 17.4, 0.7], [17.4, 20.4, 2.2]],
    cam: [k(0, PLOW), k(1.3, PLOW), k(1.85, [1.8, 1040, 310])],
  },

  // 09 · Ate out, said from another page: logged with an OK, Track offers a Take 2.
  {
    cap: "track", clip: "track",
    seg: [[0.0, 4.3, 1.4], [4.3, 7.1, 0.4], [7.1, 9.9, 1.9], [9.9, 15.8, 1.2]],
    cam: [k(0, PLOW), k(3.7, PLOW), k(4.5, FULL)],
  },
  {
    cap: "track", clip: "take2",
    seg: [[0.2, 2.2, 0.5], [2.2, 6.5, 2.2], [6.5, 9.4, 1.3]],
    cam: [k(0, [1.5, 715, 470]), k(0.5, [1.5, 715, 470]), k(1.1, [1.9, 715, 640]), k(2.6, [1.9, 715, 640]), k(3.3, FULL)],
  },

  // 10 · Cook: grid → recipe → Tick all → Cook mode, a timer that keeps running.
  {
    cap: "cook", clip: "cook",
    // The recipe page first paints "for one", then its plan context: cut in once it says "for 4".
    seg: [[6.3, 9.2, 1.1], [11.15, 13.4, 1.1], [13.4, 16.3, 1.0], [16.3, 19.5, 0.7], [19.5, 22.3, 1.3], [24.3, 27.6, 1.8]],
    cam: [k(0, [1.5, 840, 480]), k(1.1, [1.5, 840, 480]), k(1.12, [1.35, 700, 450]), k(3.2, [1.35, 700, 450]), k(3.6, [1.3, 720, 400])],
  },

  { kind: "outro", seconds: 3.2 },
];

// ── The timeline ────────────────────────────────────────────────────────────
const shotSeconds = (s) => s.seconds ?? s.seg.reduce((a, [, , d]) => a + d, 0);

export const TIMELINE = (() => {
  let at = 0;
  return SHOTS.map((s, i) => {
    const frames = Math.round(shotSeconds(s) * FPS);
    const next = SHOTS[i + 1];
    const item = { ...s, index: i, from: at, frames, fade: s.fade ?? 8, tail: next && !next.kind ? (next.fade ?? 8) : 0 };
    at += frames;
    return item;
  });
})();

export const TOTAL_FRAMES = TIMELINE.reduce((a, s) => a + s.frames, 0);

/** Consecutive shots that share a caption, as one span. */
export const CAPTION_SPANS = (() => {
  const spans = [];
  for (const s of TIMELINE) {
    if (!s.cap) continue;
    const last = spans[spans.length - 1];
    if (last && last.cap === s.cap && last.from + last.frames === s.from) last.frames += s.frames;
    else spans.push({ cap: s.cap, from: s.from, frames: s.frames });
  }
  return spans;
})();

// ── Time and camera ─────────────────────────────────────────────────────────
/** The source second shown at shot second t. */
export function sourceAt(seg, t) {
  let acc = 0;
  for (const [a, b, d] of seg) {
    if (t <= acc + d) return d <= 0 ? a : a + ((b - a) * (t - acc)) / d;
    acc += d;
  }
  return seg[seg.length - 1][1];
}

const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/** The camera at shot second t: { z, x, y }, kept inside the page. */
export function cameraAt(keys, t) {
  let z, x, y;
  if (t <= keys[0][0]) [, z, x, y] = keys[0];
  else if (t >= keys[keys.length - 1][0]) [, z, x, y] = keys[keys.length - 1];
  else {
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, z0, x0, y0] = keys[i];
      const [t1, z1, x1, y1] = keys[i + 1];
      if (t >= t0 && t <= t1) {
        const p = ease(t1 === t0 ? 1 : (t - t0) / (t1 - t0));
        z = Math.exp(Math.log(z0) + (Math.log(z1) - Math.log(z0)) * p);
        x = x0 + (x1 - x0) * p;
        y = y0 + (y1 - y0) * p;
        break;
      }
    }
  }
  const hw = 720 / z;
  const hh = 450 / z;
  return { z, x: Math.min(1440 - hw, Math.max(hw, x)), y: Math.min(900 - hh, Math.max(hh, y)) };
}

/** The last captured frame at or before source second t. */
export function frameAt(times, t) {
  let lo = 0;
  let hi = times.length - 1;
  if (t <= times[0]) return 0;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (times[mid] <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

const smooth = (p) => p * p * (3 - 2 * p);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Where the mouse was at source second t, whether to show it, and a click ripple. */
export function cursorAt(clip, t) {
  const moves = clip.moves ?? [];
  const clicks = clip.clicks ?? [];
  if (!moves.length && !clicks.length) return null;
  let pos = moves.length ? moves[0].from : [clicks[0].x, clicks[0].y];
  for (const m of moves) {
    const end = m.t + m.ms / 1000;
    if (t < m.t) break;
    if (t <= end) {
      const p = smooth((t - m.t) / (m.ms / 1000));
      pos = [m.from[0] + (m.to[0] - m.from[0]) * p, m.from[1] + (m.to[1] - m.from[1]) * p];
      break;
    }
    pos = m.to;
  }
  let show = 0;
  for (const [a, b] of [...moves.map((m) => [m.t, m.t + m.ms / 1000]), ...clicks.map((c) => [c.t, c.t])]) {
    show = Math.max(show, Math.min(clamp01((t - (a - 0.5)) / 0.25), clamp01((b + 1.6 - t) / 0.35)));
  }
  const click = clicks.find((c) => t >= c.t && t < c.t + 0.55);
  return { x: pos[0], y: pos[1], show, ripple: click ? (t - click.t) / 0.55 : null };
}
