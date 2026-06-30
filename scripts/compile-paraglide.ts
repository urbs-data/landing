import { compile } from "@inlang/paraglide-js";
import { urlPatterns } from "../src/i18n/url-patterns.ts";

await compile({
  project: "./project.inlang",
  outdir: "./src/paraglide",
  strategy: ["url", "baseLocale"],
  urlPatterns,
});
