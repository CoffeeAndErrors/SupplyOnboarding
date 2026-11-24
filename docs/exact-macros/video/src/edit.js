// ============================================================================
// The edit: what plays when, from which clip, where the camera looks, and
// what the subtitle says.
//
// A shot plays one captured clip (public/capture/<clip>):
//   seg  [[from, to, seconds], …]  source seconds from→to, played over `seconds`
//   cam  [[s, zoom, x, y], …]      at SOURCE second s the camera is centred on page
//                                  point (x, y) of the 1440×900 page, at `zoom`
//                                  (1 = the whole page); eased between keys.
//                                  Keyed to the source, so re-timing a shot
//                                  never moves the camera off what it frames.
//   sub  [[s, text], …]            the subtitle from SOURCE second s
//   cap  the chapter title above the card (CAPTIONS)
//   fade frames of cross-fade from the shot before (default 10)
//
// Paced to be followed by someone seeing KOI for the first time: close to real
// time, with holds on every card KOI asks you to read.
// ============================================================================

export const FPS = 30;

export const CAPTIONS = {
  bar: { n: "01", eyebrow: "The KOI bar", title: "One bar, on every page." },
  people: { n: "02", eyebrow: "Household", title: "Add someone in a sentence." },
  script: { n: "02", eyebrow: "Household", title: "The whole conversation, as a script." },
  profile: { n: "03", eyebrow: "Household", title: "Everyone’s whole profile." },
  calendar: { n: "04", eyebrow: "Calendar", title: "Tell it about your week." },
  plan: { n: "05", eyebrow: "Meal plan", title: "A week of meals for the whole family." },
  grid: { n: "05", eyebrow: "Meal plan", title: "Planned around every person." },
  rules: { n: "06", eyebrow: "House rules", title: "Change your mind. It re-plans." },
  cart: { n: "07", eyebrow: "Cart", title: "From plan to cart, with your OK." },
  shop: { n: "07", eyebrow: "Cart", title: "A shop that’s safe for everyone." },
  label: { n: "08", eyebrow: "Any product", title: "Is this okay for everyone?" },
  track: { n: "09", eyebrow: "Track", title: "Ate out? Just tell KOI." },
  cook: { n: "10", eyebrow: "Cook", title: "From the plan to the pan." },
};

// Framings used again and again.
const FULL = [1, 720, 450];
const DOCK = [1.4, 720, 579]; // typing in the bar
const PTOP = [1.7, 1016, 300]; // KOI's panel, top half
const PMID = [1.7, 1016, 470];
const PLOW = [1.7, 1016, 635]; // KOI's panel, newest cards and the composer
const k = (s, f) => [s, ...f];

export const SHOTS = [
  { kind: "intro", seconds: 3.0 },

  // 01 · The bar, page by page.
  {
    cap: "bar", clip: "bar", fade: 0,
    seg: [[1.6, 7.4, 4.6]],
    cam: [k(1.6, [1.08, 667, 483]), k(7.4, [1.13, 667, 498])],
    sub: [[1.6, "This is the KOI bar. It sits at the bottom of every page."], [4.0, "It suggests what you can ask, based on the page you’re on."]],
  },
  { cap: "bar", clip: "bar", seg: [[10.6, 13.9, 2.8]], cam: [k(10.6, [1.18, 600, 520]), k(13.9, [1.24, 600, 535])], sub: [[10.6, "On the Plan page, it suggests planning requests."]] },
  { cap: "bar", clip: "bar", seg: [[16.6, 19.9, 2.8]], cam: [k(16.6, [1.08, 667, 483]), k(19.9, [1.13, 667, 498])], sub: [[16.6, "On Track, it suggests logging what you ate."]] },
  { cap: "bar", clip: "bar", seg: [[22.2, 25.5, 3.2]], cam: [k(22.2, [1.08, 720, 483]), k(25.5, [1.13, 720, 500])], sub: [[22.2, "On the Calendar, it even spots your habits."]] },

  // 02 · Mother, in one sentence.
  {
    cap: "people", clip: "household",
    seg: [[5.2, 11.2, 4.4], [11.2, 19.0, 2.8], [19.0, 21.8, 2.6], [21.8, 24.2, 0.8], [24.2, 27.1, 5.0], [27.1, 28.85, 2.4]],
    cam: [k(5.2, DOCK), k(11.0, DOCK), k(12.5, PTOP), k(18.8, PTOP), k(19.4, PMID), k(23.6, PMID), k(24.3, PLOW), k(27.3, PLOW), k(28.3, FULL)],
    sub: [
      [5.2, "Type one sentence: add Mom, she’s vegetarian, no onion or garlic."],
      [11.2, "KOI reads it and drafts her profile."],
      [19.0, "It offers to ask a few optional details. We skip them."],
      [24.2, "Before saving, KOI shows what it understood, and asks for your OK."],
      [27.1, "Saved. The household now has 4 people."],
    ],
  },
  { cap: "script", clip: "household", seg: [[28.95, 30.6, 3.0]], cam: [k(28.95, FULL)], sub: [[28.95, "Long chats can be read full screen, line by line."]] },

  // 03 · Mother's profile.
  {
    cap: "profile", clip: "members",
    seg: [[2.3, 7.1, 3.8], [7.1, 12.6, 5.4]],
    cam: [k(2.3, FULL), k(7.0, FULL), k(7.8, [1.5, 891, 400])],
    sub: [[2.3, "Each person has a full profile: diet, food rules and daily numbers."], [7.1, "Numbers can be suggested by KOI, or entered exactly. KOI checks they add up."]],
  },

  // 04 · Calendar.
  {
    cap: "calendar", clip: "calendar",
    seg: [[3.6, 7.4, 2.8], [7.4, 10.8, 1.2], [10.8, 13.45, 4.0]],
    cam: [k(3.6, PLOW)],
    sub: [[3.6, "Tell KOI about your routine: lunch at the office every Tuesday."], [10.8, "It turns that into a weekly event, and asks before adding it."]],
  },
  {
    cap: "calendar", clip: "calweek", seg: [[1.5, 5.3, 3.8]],
    cam: [k(1.5, FULL), k(2.5, FULL), k(3.3, [1.7, 520, 440])],
    sub: [[1.5, "Next week, Tuesday lunch is marked “out”. No food is cooked for it."]],
  },

  // 05 · The plan, then the grid.
  {
    cap: "plan", clip: "plan",
    seg: [[0.0, 3.0, 2.4], [3.0, 7.0, 3.2], [7.0, 9.0, 1.2], [9.0, 12.4, 4.4]],
    cam: [k(0, PLOW), k(11.6, PLOW), k(12.4, FULL)],
    sub: [
      [0.0, "Ask for the week’s plan, for all four, with a budget."],
      [3.0, "KOI checks who’s eating, what to avoid, and what’s in stock."],
      [9.0, "Done: ₹3,026 for the week, and every person gets all their protein."],
    ],
  },
  {
    cap: "grid", clip: "grid",
    seg: [[2.6, 4.5, 1.6], [4.5, 10.8, 6.6]],
    cam: [k(2.6, FULL), k(4.6, FULL), k(5.6, [2.0, 1060, 420]), k(7.6, [2.0, 1060, 420]), k(8.3, [2.0, 400, 560])],
    sub: [
      [2.6, "The whole week: every meal, every day, for everyone."],
      [5.4, "Tuesday lunch: “Me: out”, straight from the calendar."],
      [7.9, "Dinners are cooked without onion or garlic, so Mom can eat them too."],
    ],
  },

  // 06 · A house rule.
  {
    cap: "rules", clip: "peanuts",
    seg: [[2.0, 6.6, 2.8], [6.6, 9.9, 1.0], [9.9, 12.7, 3.8], [12.7, 18.3, 2.4], [18.3, 21.4, 3.4], [23.2, 26.4, 2.8]],
    cam: [k(2.0, PLOW), k(18.3, PLOW), k(19.6, PMID), k(21.4, PMID), k(23.2, [1.5, 720, 380])],
    sub: [
      [2.0, "Change of mind? Just say it: we never keep peanuts in the house."],
      [9.9, "KOI saves it as a house rule, once you say OK."],
      [12.7, "Then it re-plans the whole week."],
      [18.3, "New plan: no peanuts, and everyone still gets all their protein."],
      [23.2, "The peanut-butter breakfasts are gone from the week."],
    ],
  },

  // 07 · Cart, then the safe shop, the split and the export.
  {
    cap: "cart", clip: "cart",
    seg: [[1.9, 6.0, 2.4], [6.0, 8.8, 4.0], [8.8, 12.4, 2.8]],
    cam: [k(1.9, PLOW), k(8.8, PLOW), k(10.4, FULL)],
    sub: [[1.9, "Say “put it in my cart”."], [6.0, "KOI lists every pack and asks first. It never pays for you."], [8.8, "Your cart: every line says who it’s for."]],
  },
  { cap: "shop", clip: "shop", seg: [[4.7, 7.3, 3.2]], cam: [k(4.7, [1.9, 430, 300]), k(7.3, [2.0, 420, 290])], sub: [[4.7, "Shopping for extras? Anything unsafe for someone at home is hidden."]] },
  { cap: "shop", clip: "shop", seg: [[10.5, 11.95, 2.2]], cam: [k(10.5, FULL)], sub: [[10.5, "We add a pack of roasted chana."]] },
  {
    cap: "shop", clip: "shop",
    seg: [[14.0, 17.3, 3.2], [17.3, 20.3, 1.2], [20.3, 22.9, 3.4]],
    cam: [k(14.0, [1.8, 420, 330]), k(17.3, [1.8, 420, 330]), k(20.3, [1.6, 900, 330])],
    sub: [[14.0, "It sits separately in the cart, under “You added”."], [19.9, "Send the shopping list on WhatsApp, download it or print it."]],
  },

  // 08 · A product.
  { cap: "label", clip: "label", seg: [[2.0, 5.8, 3.0]], cam: [k(2.0, [1.18, 600, 520]), k(5.8, [1.24, 600, 535])], sub: [[2.0, "On any product page…"]] },
  {
    cap: "label", clip: "label",
    seg: [[9.9, 12.9, 2.2], [12.9, 17.4, 1.6], [17.4, 20.4, 5.0]],
    cam: [k(9.9, PLOW), k(15.8, PLOW), k(17.6, [1.8, 1040, 310])],
    sub: [[9.9, "…ask: is this okay for everyone at home?"], [17.4, "KOI checks the label for each person: fine for three, not for Kid (peanuts)."]],
  },

  // 09 · Ate out, then the Take 2.
  {
    cap: "track", clip: "track",
    seg: [[0.0, 4.3, 3.0], [4.3, 7.1, 1.0], [7.1, 9.9, 5.0], [9.9, 15.8, 3.0]],
    cam: [k(0, PLOW), k(9.9, PLOW), k(12.5, FULL)],
    sub: [
      [0.0, "Ate outside? Tell KOI, from any page."],
      [7.1, "KOI estimates the meal (about 670 kcal, as a range) and asks to log it."],
      [9.9, "It opens Track, and asks what to do with the rest of the day."],
    ],
  },
  {
    cap: "track", clip: "take2",
    seg: [[0.2, 2.2, 2.0], [2.2, 6.5, 5.4], [6.5, 9.4, 3.0]],
    cam: [k(0.2, [1.5, 715, 470]), k(2.2, [1.5, 715, 470]), k(3.4, [1.9, 715, 640]), k(6.3, [1.9, 715, 640]), k(7.6, FULL)],
    sub: [
      [0.2, "Fix anything KOI got wrong: portion, place, what else you had."],
      [2.2, "Then choose a Take 2. KOI suggests spreading it over the next 6 days."],
      [6.5, "Done. The rest of the week adjusts, and you can undo it any time."],
    ],
  },

  // 10 · Cook.
  {
    cap: "cook", clip: "cook",
    // The recipe page first paints "for one", then its plan context: cut in once it says "for 4".
    seg: [[6.3, 9.2, 2.8], [11.15, 13.4, 2.8], [13.4, 16.3, 2.4], [16.3, 19.5, 2.0], [19.5, 22.3, 2.8], [24.3, 27.6, 3.2]],
    cam: [k(6.3, [1.5, 840, 480]), k(9.2, [1.5, 840, 480]), k(11.15, [1.35, 700, 450]), k(16.3, [1.35, 700, 450]), k(17.6, [1.3, 720, 400])],
    sub: [
      [6.3, "Tap any meal in the plan to open its recipe."],
      [11.15, "Recipes are sized to the plan: 4 servings, for these four people."],
      [13.4, "Tick off what you have, then start Cook mode."],
      [16.3, "One step at a time, big enough to read from the stove."],
      [19.5, "Start a timer with a tap…"],
      [24.3, "…and it keeps running while you move to the next step."],
    ],
  },

  { kind: "outro", seconds: 4.0 },
];

// ── The timeline ────────────────────────────────────────────────────────────
const shotSeconds = (s) => s.seconds ?? s.seg.reduce((a, [, , d]) => a + d, 0);

export const TIMELINE = (() => {
  let at = 0;
  return SHOTS.map((s, i) => {
    const frames = Math.round(shotSeconds(s) * FPS);
    const next = SHOTS[i + 1];
    const item = { ...s, index: i, from: at, frames, fade: s.fade ?? 10, tail: next && !next.kind ? (next.fade ?? 10) : 0 };
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

/** The shot second at which source second s is first on screen (the next segment's start, in a gap). */
export function shotSecondOf(seg, s) {
  let acc = 0;
  for (const [a, b, d] of seg) {
    if (s <= a) return acc;
    if (s <= b) return acc + (b === a ? 0 : ((s - a) / (b - a)) * d);
    acc += d;
  }
  return acc;
}

/** The subtitle on screen at source second s: its index and text. */
export function subtitleAt(sub, s) {
  if (!sub?.length) return null;
  let i = -1;
  for (let j = 0; j < sub.length; j++) if (s >= sub[j][0] - 1e-6) i = j;
  return i < 0 ? { i: 0, s: sub[0][0], text: sub[0][1] } : { i, s: sub[i][0], text: sub[i][1] };
}

const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/** The camera at source second s: { z, x, y }, kept inside the page. */
export function cameraAt(keys, s) {
  let z, x, y;
  if (s <= keys[0][0]) [, z, x, y] = keys[0];
  else if (s >= keys[keys.length - 1][0]) [, z, x, y] = keys[keys.length - 1];
  else {
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, z0, x0, y0] = keys[i];
      const [t1, z1, x1, y1] = keys[i + 1];
      if (s >= t0 && s <= t1) {
        const p = ease(t1 === t0 ? 1 : (s - t0) / (t1 - t0));
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
