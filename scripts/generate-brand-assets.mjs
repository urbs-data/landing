// Generates every raster asset of the Urbs brand:
//
//   node scripts/generate-brand-assets.mjs
//
//   - public/signatures/urbs-wordmark-{light,dark}.png — hosted images referenced
//     by the email-signature HTML (email clients need a real URL).
//   - src/features/presentations/lib/brand-assets.ts — logo/wordmark as base64
//     data URIs baked into the .pptx generator (no runtime fs dependency).
//
// The logo paths + the "urbs" wordmark in Syne make the brand wordmark; they are
// rasterized with headless Chrome because Syne is not guaranteed on machines
// that open the .pptx or render the signature email.
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const tempDir = mkdtempSync(join(tmpdir(), "urbs-brand-assets-"));
const syneFont = readFileSync(
  join(
    process.cwd(),
    "node_modules/@fontsource-variable/syne/files/syne-latin-wght-normal.woff2",
  ),
).toString("base64");

const logoPaths = (color) => `
  <path fill="${color}" d="M6.002 8.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"/>
  <path fill="${color}" fill-opacity="0.32" d="m12.625 10.49 3.296-3.297c.211.368.517.673.885.885l-3.296 3.297H21v1.25h-7.49l3.296 3.296a2.409 2.409 0 0 0-.885.885l-3.296-3.296V21h-1.25v-7.49L8.08 16.804a2.408 2.408 0 0 0-.885-.885l3.295-3.294H3v-1.25h7.49L5.558 6.442l.884-.884 4.933 4.932V3h1.25v7.49Z"/>
  <path fill="${color}" fill-opacity="0.6" d="M18.002 8.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM6.002 20.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"/>
  <path fill="${color}" d="M12.002 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z"/>
  <path fill="${color}" fill-opacity="0.6" d="M18.002 20.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"/>
`;

const logoSvg = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">${logoPaths(color)}</svg>`;

// The signature wordmark (154pt wide, wordmark at x=64) and the presentation
// wordmark (162pt, x=62) keep their historical geometry so downstream layout
// boxes stay valid.
function wordmarkSvg({ logo, word, width, textX }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="54" viewBox="0 0 ${width} 54">
  <defs><style>
    @font-face { font-family: "SyneLocal"; src: url("data:font/woff2;base64,${syneFont}") format("woff2"); }
  </style></defs>
  <svg x="0" y="0" width="54" height="54" viewBox="0 0 24 24" fill="none">${logoPaths(logo)}</svg>
  <text x="${textX}" y="40" fill="${word}" font-family="SyneLocal, Syne, Arial, sans-serif" font-size="42" font-weight="500">urbs</text>
</svg>`;
}

function shoot(name, pngPath, svg, w, h, scale) {
  const htmlPath = join(tempDir, `${name}.html`);
  writeFileSync(
    htmlPath,
    `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{width:${w}px;height:${h}px;margin:0;overflow:hidden;background:transparent}
    svg{display:block}
  </style></head><body>${svg}</body></html>`,
  );
  execFileSync(
    chromePath,
    [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      "--default-background-color=00000000",
      `--force-device-scale-factor=${scale}`,
      `--window-size=${w},${h}`,
      `--screenshot=${pngPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: "inherit" },
  );
  console.log(`✓ ${pngPath}`);
}

/* ---- Email signature wordmarks (served from public/) ---- */

const signaturesDir = join(process.cwd(), "public", "signatures");
mkdirSync(signaturesDir, { recursive: true });

for (const [mode, colors] of Object.entries({
  light: { logo: "#7241b5", word: "#292a2f" },
  dark: { logo: "#8f5bd1", word: "#f6f3fb" },
})) {
  shoot(
    `urbs-wordmark-${mode}`,
    join(signaturesDir, `urbs-wordmark-${mode}.png`),
    wordmarkSvg({ ...colors, width: 154, textX: 64 }),
    154,
    54,
    2,
  );
}

/* ---- Presentation brand module (base64, embedded in .pptx) ---- */

// [svg, width, height] — rendered at 8x so they stay crisp at slide sizes.
const presentationRenders = {
  logoPrimary: [logoSvg("#6E4DAB"), 24, 24],
  logoIntensified: [logoSvg("#C087FF"), 24, 24],
  logoWhite: [logoSvg("#FFFFFF"), 24, 24],
  wordmarkLight: [
    wordmarkSvg({ logo: "#6E4DAB", word: "#1C2024", width: 162, textX: 62 }),
    162,
    54,
  ],
  wordmarkDark: [
    wordmarkSvg({ logo: "#C087FF", word: "#EDEEF0", width: 162, textX: 62 }),
    162,
    54,
  ],
  wordmarkWhite: [
    wordmarkSvg({ logo: "#FFFFFF", word: "#FFFFFF", width: 162, textX: 62 }),
    162,
    54,
  ],
};

const moduleBody = Object.entries(presentationRenders)
  .map(([name, [svg, w, h]]) => {
    const pngPath = join(tempDir, `${name}.png`);
    shoot(name, pngPath, svg, w, h, 8);
    const b64 = readFileSync(pngPath).toString("base64");
    return `  ${name}: "data:image/png;base64,${b64}",`;
  })
  .join("\n");

const modulePath = join(
  process.cwd(),
  "src",
  "features",
  "presentations",
  "lib",
  "brand-assets.ts",
);
writeFileSync(
  modulePath,
  `// AUTO-GENERATED by scripts/generate-brand-assets.mjs — do not edit by hand.
// Base64 data URIs of the Urbs logo / wordmark for embedding in .pptx files.
export const brandAssets = {
${moduleBody}
} as const;

export type BrandAsset = keyof typeof brandAssets;
`,
);
console.log(`✓ ${modulePath}`);

rmSync(tempDir, { recursive: true, force: true });
console.log("Done.");
