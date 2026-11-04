// The brand's own type, as the store loads it (app/store/layout.js): Bricolage
// Grotesque with its width and optical-size axes (headlines are "koi-condensed":
// wdth 84, opsz 96), Plus Jakarta Sans, IBM Plex Mono and Space Grotesk.
// Latin and latin-ext (₹ lives in latin-ext). The render waits until all are in.
import { continueRender, delayRender } from "remotion";

const LATIN = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT = "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF";
const G = "https://fonts.gstatic.com/s/";

const FACES = [
  ["Bricolage Grotesque", `${G}bricolagegrotesque/v9/3y996as8bTXq_nANBjzKo3IeZx8z6up5L-iNGQ.woff2`, { weight: "200 800", stretch: "75% 100%", unicodeRange: LATIN }],
  ["Bricolage Grotesque", `${G}bricolagegrotesque/v9/3y996as8bTXq_nANBjzKo3IeZx8z6up5L-aNGe6N.woff2`, { weight: "200 800", stretch: "75% 100%", unicodeRange: LATIN_EXT }],
  ["Plus Jakarta Sans", `${G}plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2`, { weight: "400 800", unicodeRange: LATIN }],
  ["Plus Jakarta Sans", `${G}plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko40yyygA.woff2`, { weight: "400 800", unicodeRange: LATIN_EXT }],
  ["IBM Plex Mono", `${G}ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3twJwlBFgg.woff2`, { weight: "500", unicodeRange: LATIN }],
  ["IBM Plex Mono", `${G}ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3vAOwlBFgg.woff2`, { weight: "600", unicodeRange: LATIN }],
  ["Space Grotesk", `${G}spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2`, { weight: "500 700", unicodeRange: LATIN }],
  ["Space Grotesk", `${G}spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPb94C-s0.woff2`, { weight: "500 700", unicodeRange: LATIN_EXT }],
];

if (typeof document !== "undefined") {
  const handle = delayRender("Loading KOI's fonts");
  Promise.all(
    FACES.map(([family, url, descriptors]) =>
      new FontFace(family, `url(${url}) format('woff2')`, descriptors).load().then((face) => document.fonts.add(face)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error("A KOI font did not load", err);
      continueRender(handle);
    });
}

export const DISPLAY = {
  fontFamily: "'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif",
  fontWeight: 800,
  fontVariationSettings: '"wdth" 84, "opsz" 96',
  letterSpacing: "-0.03em",
};
export const SANS = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" };
export const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" };
