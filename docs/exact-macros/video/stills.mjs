// Preview stills of the film at chosen seconds, laid out as one contact sheet:
//   node stills.mjs <sheet.png> <second> [second …]
// One bundle and one browser for all of them; half-size frames.
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [sheet, ...secs] = process.argv.slice(2);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "koi-stills-"));

const serveUrl = await bundle({ entryPoint: path.join(HERE, "src", "index.jsx") });
const browser = await openBrowser("chrome");
const composition = await selectComposition({ serveUrl, id: "KoiWhatsNew", puppeteerInstance: browser });
console.log(`film: ${(composition.durationInFrames / composition.fps).toFixed(1)}s, ${composition.durationInFrames} frames`);
const files = [];
for (const s of secs.map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  const output = path.join(dir, `${String(frame).padStart(5, "0")}.jpg`);
  await renderStill({ composition, serveUrl, frame, output, imageFormat: "jpeg", jpegQuality: 82, scale: 0.5, puppeteerInstance: browser });
  files.push([s, output]);
}
await browser.close({ silent: true });

const cols = files.length <= 4 ? files.length : 3;
const html = `<style>body{margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},960px);gap:6px;padding:6px;font:600 26px system-ui;color:#ddf247}
figure{margin:0;position:relative}img{display:block;width:960px}figcaption{position:absolute;left:10px;top:8px;background:#000b;padding:2px 10px;border-radius:6px}</style>
${files.map(([s, f]) => `<figure><img src="data:image/jpeg;base64,${fs.readFileSync(f).toString("base64")}"><figcaption>${s}s</figcaption></figure>`).join("")}`;
const b = await chromium.launch({ channel: "chrome" });
const page = await b.newPage({ viewport: { width: cols * 966 + 6, height: 400 } });
await page.setContent(html);
await page.screenshot({ path: sheet, fullPage: true });
await b.close();
fs.rmSync(dir, { recursive: true, force: true });
console.log(sheet);
