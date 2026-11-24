// A contact sheet of a captured clip, to choose in/out points for the edit:
//   node contact.mjs <clip> [from] [to] [count] [out.png]
// Frames are picked evenly between the two seconds and labelled with their time.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [name, fromS, toS, countS, outArg] = process.argv.slice(2);
const dir = path.join(HERE, "public", "capture", name);
const clip = JSON.parse(fs.readFileSync(path.join(dir, "clip.json"), "utf8"));
const from = Number(fromS ?? 0);
const to = Number(toS ?? clip.duration);
const count = Number(countS ?? 12);
const out = outArg ?? path.join(HERE, `contact-${name}.png`);

const at = (t) => {
  let i = 0;
  while (i + 1 < clip.frames.length && clip.frames[i + 1] <= t) i++;
  return i;
};
const cells = [];
for (let k = 0; k < count; k++) {
  const t = from + ((to - from) * k) / Math.max(1, count - 1);
  const i = at(t);
  const file = path.join(dir, `${String(i).padStart(5, "0")}.jpg`);
  cells.push(`<figure><img src="data:image/jpeg;base64,${fs.readFileSync(file).toString("base64")}"><figcaption>${t.toFixed(1)}s</figcaption></figure>`);
}
const cols = count <= 4 ? count : count <= 9 ? 3 : 4;
const html = `<style>body{margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px;font:600 22px system-ui;color:#ddf247}
figure{margin:0;position:relative}img{width:100%;display:block}figcaption{position:absolute;left:8px;top:6px;background:#000a;padding:2px 8px;border-radius:6px}</style>${cells.join("")}`;
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: cols * 720, height: 400 } });
await page.setContent(html);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(out);
