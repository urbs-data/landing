import { paraglideVitePlugin } from "@inlang/paraglide-js";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { urlPatterns } from "./src/i18n/url-patterns";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      outputStructure: "message-modules",
      strategy: ["url", "baseLocale"],
      urlPatterns,
    }),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart({
      router: {
        virtualRouteConfig: "src/routes.ts",
      },
      importProtection: {
        behavior: "error",
      },
    }),
    viteReact(),
    babel({
      exclude: [
        /[/\\]node_modules[/\\]/,
        /^\0rolldown\/runtime\.js$/,
        /[/\\]src[/\\]paraglide[/\\]/,
      ],
      presets: [reactCompilerPreset()],
    }),
  ],
  server: {
    allowedHosts: [
      "urbs-landing-page.local",
      "urbs-landing-page-18.localcan.dev",
    ],
  },
});

export default config;
