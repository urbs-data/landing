import { readFile } from "node:fs/promises";
import { Renderer } from "takumi-js/node";
import { ImageResponse } from "takumi-js/response";
import { getLocale } from "#/paraglide/runtime";
import enMessages from "../../../../src/i18n/messages/en.json" with {
  type: "json",
};
import esMessages from "../../../../src/i18n/messages/es.json" with {
  type: "json",
};

const WIDTH = 1200;
const HEIGHT = 630;

const instrumentSansUrl = new URL(
  "../../../../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2",
  import.meta.url,
);
const wordmarkUrl = new URL(
  "../../../../public/brand/wordmark-light.svg",
  import.meta.url,
);
const markUrl = new URL("../../../../public/brand/logo.svg", import.meta.url);

let rendererPromise: Promise<Renderer> | undefined;
let wordmarkDataUriPromise: Promise<string> | undefined;
let markDataUriPromise: Promise<string> | undefined;

type OgLocale = "es" | "en";

const messages = {
  en: enMessages,
  es: esMessages,
} satisfies Record<OgLocale, typeof esMessages>;

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

async function getWordmarkDataUri() {
  wordmarkDataUriPromise ??= readFile(wordmarkUrl, "utf8").then(
    (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
  );

  return wordmarkDataUriPromise;
}

async function getMarkDataUri() {
  markDataUriPromise ??= readFile(markUrl, "utf8").then(
    (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
  );

  return markDataUriPromise;
}

function getOgLocale(request?: Request): OgLocale {
  if (request) {
    const { pathname } = new URL(request.url);

    if (pathname === "/en/og-image" || pathname.startsWith("/en/")) {
      return "en";
    }
  }

  return getLocale() === "en" ? "en" : "es";
}

export async function createOgImageResponse(request?: Request) {
  const [renderer, wordmarkDataUri, markDataUri] = await Promise.all([
    getOgRenderer(),
    getWordmarkDataUri(),
    getMarkDataUri(),
  ]);
  const locale = getOgLocale(request);

  return new ImageResponse(
    <OgImage
      markDataUri={markDataUri}
      text={messages[locale]}
      wordmarkDataUri={wordmarkDataUri}
    />,
    {
      renderer,
      width: WIDTH,
      height: HEIGHT,
      format: "png",
      lang: locale,
      fontFamilies: ["Instrument Sans Variable"],
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

function OgImage({
  markDataUri,
  text,
  wordmarkDataUri,
}: {
  markDataUri: string;
  text: typeof esMessages;
  wordmarkDataUri: string;
}) {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px 72px",
        background:
          "linear-gradient(105deg, #f3f7fa 0%, #f4efff 48%, #b67cff 100%)",
        color: "#28252d",
        fontFamily: "Instrument Sans Variable",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          background:
            "radial-gradient(circle at 78% 52%, rgba(255, 255, 255, 0.34), transparent 28%), radial-gradient(circle at 55% 8%, rgba(110, 77, 171, 0.12), transparent 24%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: -44,
          top: 120,
          display: "flex",
          width: 420,
          height: 326,
          opacity: 0.12,
        }}
      >
        <img
          src={markDataUri}
          alt=""
          width={420}
          height={326}
          style={{
            display: "block",
            width: 420,
            height: 326,
            objectFit: "contain",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          width: 168,
          height: 68,
        }}
      >
        <img
          src={wordmarkDataUri}
          alt="Urbs Data"
          width={168}
          height={68}
          style={{
            display: "block",
            width: 168,
            height: 68,
            objectFit: "contain",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: 860,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#1f2230",
            fontSize: 76,
            fontWeight: 750,
            lineHeight: 0.96,
            letterSpacing: 0,
          }}
        >
          Urbs Data
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 18,
            flexWrap: "wrap",
            columnGap: 8,
            rowGap: 0,
            color: "#3f4050",
            fontSize: 27,
            fontWeight: 500,
            lineHeight: 1.22,
          }}
        >
          <span>{text.hero_title_prefix}</span>
          <span style={{ color: "#6E4DAB", fontWeight: 700 }}>
            {text.hero_title_highlight}
          </span>
          <span>{text.hero_title_suffix}</span>
        </div>
      </div>
    </div>
  );
}
