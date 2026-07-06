import { Renderer } from "takumi-js/node";
import { ImageResponse } from "takumi-js/response";
import { getLocale } from "#/paraglide/runtime";
import instrumentSansDataUri from "../../../../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2?inline";
import markSvg from "../../../../public/assets/brand/logo.svg?raw";
import wordmarkSvg from "../../../../public/assets/brand/wordmark-light.svg?raw";
import enMessages from "../../../../src/i18n/messages/en.json" with { type: "json" };
import esMessages from "../../../../src/i18n/messages/es.json" with { type: "json" };

const WIDTH = 1200;
const HEIGHT = 630;

let rendererPromise: Promise<Renderer> | undefined;

type OgLocale = "es" | "en";

type OgImageContent = {
  title?: string;
  description?: string;
};

const messages = {
  en: enMessages,
  es: esMessages,
} satisfies Record<OgLocale, typeof esMessages>;

function dataUriToBuffer(dataUri: string) {
  const base64 = dataUri.split(",").at(1);

  if (!base64) {
    throw new Error("Invalid OG image font data URI");
  }

  return Buffer.from(base64, "base64");
}

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

async function getOgRenderer() {
  rendererPromise ??= (async () => {
    const renderer = new Renderer();

    await renderer.registerFont({
      name: "Instrument Sans Variable",
      data: dataUriToBuffer(instrumentSansDataUri),
      weight: 500,
      style: "normal",
    });

    return renderer;
  })();

  return rendererPromise;
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

function getOgImageContent(request?: Request): OgImageContent {
  if (!request) return {};

  const { searchParams } = new URL(request.url);

  return {
    title: searchParams.get("title") ?? undefined,
    description: searchParams.get("description") ?? undefined,
  };
}

export async function createOgImageResponse(request?: Request) {
  const renderer = await getOgRenderer();
  const locale = getOgLocale(request);
  const content = getOgImageContent(request);

  return new ImageResponse(
    <OgImage
      content={content}
      markDataUri={svgToDataUri(markSvg)}
      text={messages[locale]}
      wordmarkDataUri={svgToDataUri(wordmarkSvg)}
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
  content,
  markDataUri,
  text,
  wordmarkDataUri,
}: {
  content: OgImageContent;
  markDataUri: string;
  text: typeof esMessages;
  wordmarkDataUri: string;
}) {
  const isCustom = Boolean(content.title);
  const titleLength = content.title?.length ?? 0;
  const titleFontSize = !isCustom ? 104 : titleLength > 10 ? 56 : 64;
  const descriptionFontSize = isCustom ? 32 : 36;

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
        padding: "56px 72px 68px",
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
          right: -64,
          top: 108,
          display: "flex",
          width: 460,
          height: 356,
          opacity: 0.11,
        }}
      >
        <img
          src={markDataUri}
          alt=""
          width={460}
          height={356}
          style={{
            display: "block",
            width: 460,
            height: 356,
            objectFit: "contain",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          width: 190,
          height: 76,
        }}
      >
        <img
          src={wordmarkDataUri}
          alt="Urbs Data"
          width={190}
          height={76}
          style={{
            display: "block",
            width: 190,
            height: 76,
            objectFit: "contain",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: isCustom ? 990 : 940,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#1f2230",
            flexWrap: "wrap",
            fontSize: titleFontSize,
            fontWeight: 750,
            lineHeight: isCustom ? 1.04 : 0.92,
            letterSpacing: 0,
          }}
        >
          {isCustom ? content.title : "Urbs Data"}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: isCustom ? 22 : 20,
            flexWrap: "wrap",
            columnGap: 10,
            rowGap: 0,
            color: "#3f4050",
            fontSize: descriptionFontSize,
            fontWeight: 500,
            lineHeight: 1.18,
          }}
        >
          {isCustom ? (
            <span>{content.description}</span>
          ) : (
            <>
              <span>{text.hero_title_prefix}</span>
              <span style={{ color: "#6E4DAB", fontWeight: 700 }}>
                {text.hero_title_highlight}
              </span>
              <span>{text.hero_title_suffix}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
