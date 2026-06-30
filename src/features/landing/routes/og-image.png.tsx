import { readFile } from "node:fs/promises";
import { createFileRoute } from "@tanstack/react-router";
import { Renderer } from "takumi-js/node";
import { ImageResponse } from "takumi-js/response";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";

const WIDTH = 1200;
const HEIGHT = 630;

const instrumentSansUrl = new URL(
  "../../../../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2",
  import.meta.url,
);
let rendererPromise: Promise<Renderer> | undefined;

async function getOgRenderer() {
  rendererPromise ??= (async () => {
    const renderer = new Renderer();
    const instrumentSans = await readFile(instrumentSansUrl);

    await renderer.registerFont({
      name: "Instrument Sans Variable",
      data: instrumentSans,
      weight: 500,
      style: "normal",
    });

    return renderer;
  })();

  return rendererPromise;
}

export const Route = createFileRoute("/og-image/png")({
  server: {
    handlers: {
      GET: async () => {
        const renderer = await getOgRenderer();

        return new ImageResponse(<OgImage />, {
          renderer,
          width: WIDTH,
          height: HEIGHT,
          format: "png",
          lang: getLocale(),
          fontFamilies: ["Instrument Sans Variable"],
          headers: {
            "Cache-Control":
              "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      },
    },
  },
});

function OgImage() {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 50% 34%, rgba(123, 63, 208, 0.11), transparent 28%), radial-gradient(circle at 50% 82%, rgba(22, 163, 127, 0.07), transparent 24%), #fcfcfd",
        color: "#28252d",
        fontFamily: "Instrument Sans Variable",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          width: 1040,
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          transform: "translateY(-14px)",
        }}
      >
        <Brand />

        <div
          style={{
            width: 940,
            marginTop: 42,
            fontSize: 58,
            lineHeight: 1.03,
            letterSpacing: -1.1,
            fontWeight: 650,
            color: "#26242b",
          }}
        >
          {m.seo_og_image_title()}
        </div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
      <UrbsMark size={178} />
      <div
        style={{
          display: "flex",
          position: "relative",
          top: -5,
          fontFamily: "Instrument Sans Variable",
          fontSize: 136,
          fontWeight: 500,
          letterSpacing: -3.6,
          color: "#28252d",
        }}
      >
        urbs
      </div>
    </div>
  );
}

function UrbsMark({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <title>Urbs Data</title>
      <path
        fill="#7b3fd0"
        d="M6.002 8.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"
      />
      <path
        fill="#7b3fd0"
        fillOpacity={0.32}
        d="m12.625 10.49 3.296-3.297c.211.368.517.673.885.885l-3.296 3.297H21v1.25h-7.49l3.296 3.296a2.409 2.409 0 0 0-.885.885l-3.296-3.296V21h-1.25v-7.49L8.08 16.804a2.408 2.408 0 0 0-.885-.885l3.295-3.294H3v-1.25h7.49L5.558 6.442l.884-.884 4.933 4.932V3h1.25v7.49Z"
      />
      <path
        fill="#7b3fd0"
        fillOpacity={0.6}
        d="M18.002 8.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM6.002 20.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"
      />
      <path
        fill="#7b3fd0"
        d="M12.002 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z"
      />
      <path
        fill="#7b3fd0"
        fillOpacity={0.6}
        d="M18.002 20.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"
      />
    </svg>
  );
}
