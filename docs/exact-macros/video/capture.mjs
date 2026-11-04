// ============================================================================
// Footage for the founder video: real KOI, recorded from the demo app.
//
//   node capture.mjs reset              start the demo again (tables, cart, KOI's conversation)
//   node capture.mjs clip <name> [...]  record clips into public/capture/<name>/
//   node capture.mjs all                reset, then every clip in order
//   node capture.mjs shot <file.png>    a screenshot of the page as it is now
//   node capture.mjs state              what KOI is doing (status, pending, last lines)
//   node capture.mjs goto <path> [png]  open a store page (and screenshot it)
//   node capture.mjs eval <file.js>     run a probe in the page (the file is an async function body)
//
// Needs the demo app (`npm run dev:demo -- -p 3114` in web/) and a Chrome left
// running with a DevTools port, so a run can stop after any clip and carry on
// from there with the same tab, conversation and cart (see README.md):
//
//   chrome --headless=new --remote-debugging-port=9333 --window-size=1440,900
//          --force-device-scale-factor=2 --hide-scrollbars --user-data-dir=<tmp>
//
// Frames come from the DevTools screencast (JPEG at 2x pixels), each with the
// second it was taken, at most 30 a second. Beside them, clip.json keeps the
// marks (KOI's status changes, sends, approvals), the clicks and the mouse's
// moves, so the edit can draw the cursor and cut on the beats. Nothing here is
// staged: every line KOI says is the live model's, every figure the engine's.
// ============================================================================

import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.KOI_URL ?? "http://localhost:3114";
const CDP_URL = process.env.KOI_CDP ?? "http://127.0.0.1:9333";
const OUT = path.join(HERE, "public", "capture");
const FPS_CAP = 30;
const VIEW = { width: 1440, height: 900 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => Date.now() / 1000;

// The demo's own badge is a developer control, not KOI: the shopper never sees it.
const HIDE_CSS = '[aria-label="Demo mode: reset"]{display:none!important}';

async function connect() {
  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => !p.url().startsWith("devtools:")) ?? (await context.newPage());
  await context.addInitScript((css) => {
    const add = () => {
      if (document.getElementById("cap-hide")) return;
      const s = document.createElement("style");
      s.id = "cap-hide";
      s.textContent = css;
      (document.head ?? document.documentElement).appendChild(s);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add);
    else add();
  }, HIDE_CSS);
  await page.evaluate((css) => {
    if (document.getElementById("cap-hide")) return;
    const s = document.createElement("style");
    s.id = "cap-hide";
    s.textContent = css;
    document.head?.appendChild(s);
  }, HIDE_CSS).catch(() => {});
  // Headless Chrome's window is bigger than its page: size the window so the page is exactly VIEW.
  for (let i = 0; i < 3; i++) {
    const size = await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]).catch(() => null);
    if (!size || (size[0] === VIEW.width && size[1] === VIEW.height)) break;
    const s = await context.newCDPSession(page);
    const { targetInfo } = await s.send("Target.getTargetInfo");
    await s.detach();
    const bs = await browser.newBrowserCDPSession();
    const { windowId, bounds } = await bs.send("Browser.getWindowForTarget", { targetId: targetInfo.targetId });
    await bs.send("Browser.setWindowBounds", { windowId, bounds: { width: bounds.width + VIEW.width - size[0], height: bounds.height + VIEW.height - size[1] } });
    await bs.detach();
    await sleep(500);
  }
  const size = await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]).catch(() => null);
  if (size && (size[0] !== VIEW.width || size[1] !== VIEW.height)) console.warn(`viewport is ${size.join("x")}, expected ${VIEW.width}x${VIEW.height}@2`);
  return { browser, context, page };
}

// ── The recorder ────────────────────────────────────────────────────────────
class Recorder {
  constructor(page, cdp, name) {
    this.page = page;
    this.cdp = cdp;
    this.name = name;
    this.dir = path.join(OUT, name);
    this.mx = VIEW.width / 2;
    this.my = VIEW.height - 60;
  }

  rel() {
    return +(now() - this.t0).toFixed(3);
  }

  async start() {
    fs.rmSync(this.dir, { recursive: true, force: true });
    fs.mkdirSync(this.dir, { recursive: true });
    Object.assign(this, { frames: [], marks: [], clicks: [], moves: [], typed: [], pending: null, lastT: 0, timer: null, meta: null, t0: now() });
    this.onFrame = ({ data, metadata, sessionId }) => {
      this.cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
      if (!this.meta) this.meta = metadata;
      const t = now();
      this.pending = { data, t };
      const gap = t - this.lastT;
      if (gap >= 1 / FPS_CAP) this.flush();
      else if (!this.timer) this.timer = setTimeout(() => { this.timer = null; this.flush(); }, (1 / FPS_CAP - gap) * 1000 + 1);
    };
    this.cdp.on("Page.screencastFrame", this.onFrame);
    await this.cdp.send("Page.startScreencast", { format: "jpeg", quality: 82, maxWidth: 2400, maxHeight: 1500, everyNthFrame: 1 });
    // A still page sends no frames: paint one pixel so the clip has its first picture.
    await this.page.evaluate(() => {
      const d = document.createElement("div");
      d.style.cssText = "position:fixed;left:0;bottom:0;width:1px;height:1px;background:rgba(0,0,0,.01);z-index:2147483647;pointer-events:none";
      document.body.appendChild(d);
      requestAnimationFrame(() => requestAnimationFrame(() => d.remove()));
    }).catch(() => {});
    this.mark("start");
  }

  flush() {
    const p = this.pending;
    if (!p) return;
    this.pending = null;
    const file = `${String(this.frames.length).padStart(5, "0")}.jpg`;
    fs.writeFileSync(path.join(this.dir, file), Buffer.from(p.data, "base64"));
    this.frames.push(+(p.t - this.t0).toFixed(3));
    this.lastT = p.t;
  }

  async stop() {
    this.mark("end");
    await sleep(120);
    await this.cdp.send("Page.stopScreencast").catch(() => {});
    this.cdp.off("Page.screencastFrame", this.onFrame);
    clearTimeout(this.timer);
    this.flush();
    const clip = {
      name: this.name,
      viewport: VIEW,
      frameMeta: this.meta,
      duration: this.rel(),
      frames: this.frames,
      marks: this.marks,
      clicks: this.clicks,
      moves: this.moves,
      typed: this.typed,
    };
    fs.writeFileSync(path.join(this.dir, "clip.json"), JSON.stringify(clip));
    console.log(`${this.name}: ${this.frames.length} frames over ${clip.duration.toFixed(1)}s`);
    for (const m of this.marks) console.log(`  ${m.t.toFixed(2).padStart(7)}  ${m.name}`);
  }

  mark(name) {
    this.marks.push({ t: this.rel(), name });
  }

  wait(ms) {
    return sleep(ms);
  }

  /** The cursor glides (drawn in the edit); the real mouse lands when it arrives. */
  async moveTo(x, y, ms = 520) {
    const d = Math.hypot(x - this.mx, y - this.my);
    const dur = d < 4 ? 0 : Math.round(Math.min(900, Math.max(280, ms * (0.55 + d / 1400))));
    if (dur) {
      this.moves.push({ t: this.rel(), from: [this.mx, this.my], to: [x, y], ms: dur });
      await sleep(dur);
    }
    await this.page.mouse.move(x, y);
    this.mx = x;
    this.my = y;
  }

  async click(target, { dwell = 240, timeout = 20000 } = {}) {
    const loc = typeof target === "string" ? this.page.locator(target).first() : target;
    await loc.waitFor({ state: "visible", timeout });
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    let b = await loc.boundingBox();
    await this.moveTo(b.x + b.width / 2, b.y + b.height / 2);
    await sleep(dwell);
    b = (await loc.boundingBox()) ?? b;
    const x = b.x + b.width / 2;
    const y = b.y + b.height / 2;
    if (Math.hypot(x - this.mx, y - this.my) > 3) await this.moveTo(x, y, 200);
    this.clicks.push({ t: this.rel(), x, y });
    await this.page.mouse.click(x, y);
  }

  async type(loc, text, { delay = 40, click = true } = {}) {
    if (click) await this.click(loc);
    const t = this.rel();
    await loc.pressSequentially(text, { delay });
    this.typed.push({ t, end: this.rel(), text });
  }

  /** Bring something into view the way a person scrolls: smoothly. */
  async scrollTo(target, block = "center", settle = 1100) {
    const loc = typeof target === "string" ? this.page.locator(target).first() : target;
    await loc.waitFor({ state: "attached", timeout: 15000 });
    await loc.evaluate((el, b) => el.scrollIntoView({ behavior: "smooth", block: b }), block);
    this.mark("scroll");
    await sleep(settle);
  }

  async scrollBy(dy, settle = 1000) {
    await this.page.evaluate((y) => window.scrollBy({ top: y, behavior: "smooth" }), dy);
    this.mark("scroll");
    await sleep(settle);
  }
}

// ── KOI: what it's doing, read from its own conversation (AgentProvider) ────
async function koiState(page) {
  return page.evaluate(() => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (!k?.startsWith("koi_agent_v1:")) continue;
      try {
        const s = JSON.parse(sessionStorage.getItem(k));
        const e = s.entries ?? [];
        return {
          status: s.status,
          open: s.open,
          follow: s.follow,
          pending: s.pending ? { kind: s.pending.kind, entryId: s.pending.entryId } : null,
          n: e.length,
          tail: e.slice(-5).map((x) => ({ kind: x.kind, tool: x.tool, state: x.state, text: typeof x.text === "string" ? x.text.slice(0, 220) : undefined, title: x.card?.title ?? x.title })),
        };
      } catch {
        return null;
      }
    }
    return { status: "none", n: 0, tail: [] };
  }).catch(() => null);
}

const visible = (loc) => loc.isVisible().catch(() => false);

/**
 * Ask KOI something and see it through: Skip optional questions, Allow what it
 * asks to save, and finish when it has been quiet for a moment.
 */
async function askKoi(r, text, { approve = true, keepCommentary = false, readCard = 1700, timeout = 180000, onAsk = null } = {}) {
  const page = r.page;
  const sheetBox = page.locator('textarea[aria-label="Message KOI"]');
  const dock = page.locator("input.ka-input");
  const sideBtn = page.getByRole("button", { name: "Side panel", exact: true });

  if (!keepCommentary && (await visible(sideBtn))) await r.click(sideBtn);
  let box;
  if (await visible(sheetBox)) box = sheetBox;
  else {
    await r.click(dock);
    await sleep(600);
    if (!keepCommentary && (await visible(sideBtn))) { await r.click(sideBtn); await sleep(400); }
    box = (await visible(sheetBox)) ? sheetBox : dock;
    if (box === sheetBox) await r.click(sheetBox, { dwell: 120 });
  }
  const before = (await koiState(page))?.n ?? 0;
  await r.type(box, text, { click: false });
  await sleep(380);
  r.mark(`send: ${text}`);
  await r.click(page.locator('button[aria-label="Send to KOI"]').filter({ visible: true }).first(), { dwell: 160 });

  const t0 = Date.now();
  let started = false;
  let last = "";
  let quietSince = null;
  while (Date.now() - t0 < timeout) {
    await sleep(220);
    if (!keepCommentary && (await visible(sideBtn))) { r.mark("commentary → side panel"); await r.click(sideBtn); continue; }
    const s = await koiState(page);
    if (!s) continue;
    const sig = `${s.status}|${s.pending?.kind ?? ""}|${s.pending?.entryId ?? ""}`;
    if (sig !== last) {
      last = sig;
      const said = s.tail.filter((x) => x.kind === "say").slice(-1)[0]?.text;
      r.mark(`koi ${s.status}${s.pending ? ` · ${s.pending.kind}` : ""}${said ? ` · "${said.slice(0, 90)}"` : ""}`);
    }
    if (s.status === "running" || s.status === "waiting" || s.n > before + 1) started = true;
    if (!started) { if (Date.now() - t0 > 12000) throw new Error("KOI never started"); continue; }

    if (s.status === "waiting" && s.pending) {
      if (s.pending.kind === "approval") {
        const btn = page.locator(".ka-card-warm .ka-primary:not([disabled])").filter({ visible: true }).last();
        await btn.waitFor({ state: "visible", timeout: 8000 });
        await btn.scrollIntoViewIfNeeded().catch(() => {});
        await sleep(readCard);
        const label = (await btn.textContent())?.trim();
        if (!approve) { r.mark(`left waiting: ${label}`); return s; }
        r.mark(`approve: ${label}`);
        await r.click(btn);
        await sleep(400);
        continue;
      }
      if (onAsk) { await onAsk(r, s); await sleep(400); continue; }
      const skip = page.locator(".ka-secondary:not([disabled])", { hasText: /^Skip$/ }).filter({ visible: true }).last();
      if (await visible(skip)) {
        await sleep(readCard);
        r.mark("skip");
        await r.click(skip);
        await sleep(400);
        continue;
      }
      await page.screenshot({ path: path.join(r.dir, "_stuck.png") });
      throw new Error(`KOI asked something with no Skip: ${JSON.stringify(s.tail.slice(-2))}`);
    }
    if (s.status !== "running" && s.status !== "waiting") {
      quietSince ??= Date.now();
      if (Date.now() - quietSince > 1400) break;
    } else quietSince = null;
  }
  const s = await koiState(page);
  r.mark("koi done");
  console.log(`  KOI: ${JSON.stringify(s?.tail?.slice(-3))}`);
  return s;
}

async function closeKoi(r) {
  const close = r.page.getByRole("button", { name: "Close KOI" });
  if (await visible(close)) { await r.click(close); await sleep(500); return; }
  const lightsUp = r.page.locator('section[aria-label="KOI, long form"]');
  if (await visible(lightsUp)) { await r.page.keyboard.press("Escape"); await sleep(600); }
}

async function nav(r, label) {
  await r.click(r.page.locator("header").getByRole("link", { name: label, exact: true }).first());
  await r.page.waitForLoadState("domcontentloaded").catch(() => {});
  await sleep(1200);
}

async function go(r, url) {
  await r.page.goto(BASE + url, { waitUntil: "domcontentloaded" });
  await r.page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await sleep(800);
}

// ── The clips, in the order the story is told ───────────────────────────────
const CLIPS = {
  /** The KOI bar: a suggestion for the page you're on, page after page. */
  async bar(r) {
    await go(r, "/store");
    await r.wait(5200);
    await nav(r, "Plan");
    await r.wait(4200);
    await nav(r, "Track");
    await r.wait(4200);
    await nav(r, "Calendar");
    await r.wait(3600);
  },

  /** A new person, in one sentence: KOI reads it, asks before saving. */
  async household(r) {
    await go(r, "/store/plan");
    await r.wait(1500);
    await askKoi(r, "Add my 64-year-old mother to the household. She's vegetarian and doesn't eat onion or garlic.");
    await r.wait(3500);
  },

  /** The Household page: Mother's whole profile, and her numbers done the advanced way. */
  async members(r) {
    const page = r.page;
    await closeKoi(r);
    if (!page.url().includes("/store/household")) {
      await r.click(page.locator("a[href='/store/household']").filter({ visible: true }).first());
      await page.waitForURL("**/store/household", { timeout: 15000 });
    }
    await r.wait(1800);
    await r.click(page.locator("button").filter({ hasText: "Mother" }).filter({ hasText: "60 or over" }).first());
    await r.wait(1600);
    await r.click(page.locator("button, a").filter({ hasText: /^Numbers$/ }).filter({ visible: true }).first());
    await r.wait(1500);
    await r.click(page.getByRole("radio", { name: "Advanced" }));
    await r.wait(700);
    await r.scrollTo(page.getByText("It adds up.").first(), "center", 1300);
    await r.wait(2600);
    await r.click(page.getByRole("button", { name: "Discard", exact: true }));
    await r.wait(1600);
  },

  /** One sentence becomes a weekly event, and the plan will know Me is out. */
  async calendar(r) {
    await askKoi(r, "I have lunch at the office every Tuesday, put it on my calendar");
    await r.wait(3500);
  },

  /** The week, for all four, under a budget. */
  async plan(r) {
    await askKoi(r, "Plan this week for all four of us, under ₹4,000");
    await r.wait(4000);
  },

  /** The grid behind it: Tuesday's lunch is out for Me, Mother's dinners have no onion or garlic. */
  async grid(r) {
    await closeKoi(r);
    await r.wait(700);
    await showGrid(r);
    await r.wait(1200);
    await pointAt(r, r.page.getByText(": out").first(), 1800);
    await pointAt(r, r.page.getByText("(no onion-garlic)").first(), 1800);
    await r.wait(600);
  },

  /** A house rule, kept: KOI saves it and solves the week again without peanuts. */
  async peanuts(r) {
    await askKoi(r, "We never keep peanuts in the house, remember that, and update the plan");
    await r.wait(2600);
    await closeKoi(r);
    await showGrid(r);
    await r.wait(2600);
  },

  /** And maida, left out of the plan. */
  async maida(r) {
    await askKoi(r, "No maida in the plan, please");
    await r.wait(2600);
    await closeKoi(r);
    await showGrid(r);
    await r.wait(2600);
  },

  /** The week into the cart, after an OK. */
  async cart(r) {
    await askKoi(r, "Put it in my cart");
    await r.wait(3200);
  },

  /** The Pantry's shop (only what's safe for everyone), one thing added, the cart split, the export. */
  async shop(r) {
    const page = r.page;
    await closeKoi(r);
    await go(r, "/store/plan?step=pantry");
    await r.wait(1000);
    await r.scrollTo(page.getByText("Anything else for the week?").first(), "start", 1600);
    await r.wait(900);
    await pointAt(r, page.getByText(/products are hidden because/).first(), 1700);
    await r.click(page.getByRole("button", { name: "Add Roasted Chana", exact: true }));
    await r.wait(1400);
    await r.click(page.locator("a, button").filter({ hasText: /you added/ }).filter({ visible: true }).first());
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await r.wait(2200);
    const added = page.getByText("You added", { exact: true }).first();
    if (await visible(added)) await r.scrollTo(added, "center", 1500);
    await r.wait(1800);
    await r.scrollBy(-4000, 1200);
    await r.click(page.getByRole("button", { name: /Export/ }).filter({ visible: true }).first());
    await r.wait(2600);
    await page.keyboard.press("Escape");
    await r.wait(800);
  },

  /** On a product: is it right for everyone at home? KOI reads the label against each person. */
  async label(r) {
    await closeKoi(r);
    await go(r, "/store/product/off-8904335601890");
    await r.wait(2600);
    await askKoi(r, "Is this okay for everyone at home?");
    await r.wait(3800);
  },

  /** Ate out, told KOI from any page: it logs the meal and Track offers a Take 2 in the bar. */
  async track(r) {
    await askKoi(r, "Had 2 samosas and a chai at the canteen for my evening snack");
    await r.wait(5000);
  },

  /** The Take 2, in the bar: what to do with the day, KOI's suggestion picked, applied. */
  async take2(r) {
    const page = r.page;
    const scroller = page.locator(".ka-ask .overflow-y-auto").first();
    if (!(await visible(scroller))) throw new Error("no Take 2 in the bar");
    await r.wait(1200);
    const b = await scroller.boundingBox();
    await r.moveTo(b.x + b.width * 0.72, b.y + b.height * 0.55);
    await scroller.evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }));
    r.mark("scroll: take2");
    await r.wait(3600);
    await r.click(page.locator(".ka-ask").getByRole("button", { name: "Log it and apply" }));
    await r.wait(4200);
  },

  /** Next week on the Calendar: the office lunch, every Tuesday. */
  async calweek(r) {
    const page = r.page;
    if (!page.url().includes("/store/calendar")) await nav(r, "Calendar");
    await r.wait(1600);
    await r.click(page.getByRole("button", { name: "The week after", exact: true }));
    await r.wait(2800);
  },

  /** From the week's grid to the recipe, everything ticked, and Cook mode with a timer running. */
  async cook(r) {
    const page = r.page;
    await go(r, "/store/plan?step=plan");
    await r.wait(800);
    await showGrid(r);
    await r.wait(700);
    await r.click(page.locator('[aria-haspopup="menu"]').filter({ hasText: "Moong dal (no" }).first());
    await r.wait(1300);
    await r.click(page.getByRole("menuitem").filter({ hasText: /Moong dal/ }).first());
    await page.waitForURL("**/store/plan/dish/**", { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await r.wait(2600);
    await r.click(page.getByRole("button", { name: "Tick all", exact: true }));
    await r.wait(1500);
    await r.click(page.getByRole("button", { name: /Start cook mode/ }));
    await r.wait(1800);
    const start = page.getByRole("button", { name: "Start timer", exact: true });
    for (let i = 0; i < 8 && !(await visible(start)); i++) {
      await r.click(page.getByRole("button", { name: "Next step", exact: true }));
      await r.wait(900);
    }
    await r.wait(900);
    await r.click(start);
    await r.wait(4200);
    const next = page.getByRole("button", { name: "Next step", exact: true });
    if (await visible(next)) {
      await r.click(next);
      await r.wait(3200);
    }
  },
};

/** Scroll the plan page to its week grid (the legend above it sits under the sticky bars). */
async function showGrid(r) {
  const page = r.page;
  if (!page.url().includes("/store/plan")) return;
  const y = await page.evaluate(() => {
    const el = [...document.querySelectorAll("span")].find((s) => s.textContent.trim() === "Left out for them");
    return el ? el.getBoundingClientRect().top + scrollY : null;
  });
  if (y == null) return;
  await page.evaluate((top) => window.scrollTo({ top, behavior: "smooth" }), Math.max(0, y - 170));
  r.mark("scroll: grid");
  await sleep(1400);
}

/** Move the cursor to something and rest on it, without clicking. */
async function pointAt(r, loc, rest = 1500) {
  if (!(await visible(loc))) return;
  const b = await loc.boundingBox();
  await r.moveTo(b.x + Math.min(b.width / 2, 40), b.y + b.height / 2);
  r.mark("point");
  await sleep(rest);
}

const ORDER = Object.keys(CLIPS);

async function record(page, context, name) {
  const fn = CLIPS[name];
  if (!fn) throw new Error(`no clip "${name}" (have: ${ORDER.join(", ")})`);
  const cdp = await context.newCDPSession(page);
  const r = new Recorder(page, cdp, name);
  await r.start();
  try {
    await fn(r);
  } finally {
    await r.stop();
    await cdp.detach().catch(() => {});
  }
}

async function reset(page) {
  await page.goto(BASE + "/store", { waitUntil: "domcontentloaded" });
  await page.evaluate(async () => {
    await fetch("/api/demo/db", { method: "DELETE" });
    for (const k of Object.keys(localStorage)) if (k.startsWith("koi_")) localStorage.removeItem(k);
    sessionStorage.clear();
  });
  await page.goto(BASE + "/store", { waitUntil: "domcontentloaded" });
  // The cart writes itself back from memory: empty it through the page, then load clean.
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (/cart/i.test(k)) localStorage.removeItem(k); });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  console.log("demo reset");
}

const [cmd, ...args] = process.argv.slice(2);
const { page, context } = await connect();
try {
  if (cmd === "reset") await reset(page);
  else if (cmd === "clip") for (const name of args) await record(page, context, name);
  else if (cmd === "all") {
    await reset(page);
    for (const name of ORDER) await record(page, context, name);
  } else if (cmd === "shot") {
    await page.screenshot({ path: args[0] ?? path.join(HERE, "shot.png") });
    console.log(`shot: ${page.url()}`);
  } else if (cmd === "state") console.log(page.url(), JSON.stringify(await koiState(page), null, 1));
  else if (cmd === "goto") {
    await page.goto(BASE + args[0], { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await sleep(1500);
    if (args[1]) await page.screenshot({ path: args[1], fullPage: args[2] === "full" });
    console.log(page.url());
  } else if (cmd === "eval") {
    // A probe: the file's text is an async function body run in the page.
    const body = fs.readFileSync(args[0], "utf8");
    console.log(JSON.stringify(await page.evaluate(`(async () => { ${body} })()`), null, 1));
  } else console.log("usage: node capture.mjs reset | clip <name…> | all | shot <file> | state | eval <file>");
} catch (err) {
  console.error(err?.message ?? err);
  await page.screenshot({ path: path.join(HERE, "error.png") }).catch(() => {});
  process.exitCode = 1;
} finally {
  // Leave Chrome running for the next clip.
  setTimeout(() => process.exit(), 100);
}
