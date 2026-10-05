import type { ComponentProps } from "react";
import {
  type AppLocale,
  baseLocale,
  hreflangByLocale,
  type LocalizedPaths,
  locales,
  localizedUrl,
  normalizePath,
  SITE_URL,
} from "#/i18n";
import { m } from "#/paraglide/messages";
import { CONTACT_EMAIL } from "./contact-email";

export const SITE_NAME = "Urbs Data";
const LOGO_URL = `${SITE_URL}/web-app-manifest-512x512.png`;

const ogLocaleByLocale: Record<AppLocale, string> = {
  es: "es_AR",
  en: "en_US",
};

/**
 * Internal-only pages. They render an access gate (or no content at all) to a
 * crawler, so Google reads them as soft 404s and clusters them as duplicates.
 * Kept out of the index and out of the sitemap.
 */
const noIndexPaths = new Set(["/presentations", "/signatures", "/social"]);

export function isNoIndexPath(pathname: string) {
  return noIndexPaths.has(normalizePath(pathname));
}

export function getSeoTitle(title: string) {
  return title.startsWith(`${SITE_NAME} |`) ? title : `${SITE_NAME} | ${title}`;
}

/** Generated 1200×630 PNG share card, optionally captioned. */
export function getOgImageUrl(
  locale: AppLocale,
  params?: { title?: string; description?: string },
) {
  const url = new URL(localizedUrl(locale, "/og-image"));

  if (params?.title) url.searchParams.set("title", params.title);
  if (params?.description) {
    url.searchParams.set("description", params.description);
  }

  return url.toString();
}

/**
 * Absolute URL per locale that actually has this page. Static routes exist in
 * every locale, so they map the shared path; slug routes (blog, careers) pass
 * `localizedPaths` — already-prefixed paths — and only list the locales the
 * content is published in. Advertising the missing one would point Google at a
 * URL that does not exist (soft 404 / duplicate).
 */
function getUrlByLocale(path: string, localizedPaths?: LocalizedPaths) {
  return new Map<AppLocale, string>(
    localizedPaths
      ? locales.flatMap((locale) => {
          const localized = localizedPaths[locale];
          return localized
            ? [[locale, `${SITE_URL}${localized}`] as const]
            : [];
        })
      : locales.map((locale) => [locale, localizedUrl(locale, path)]),
  );
}

export type PageHeadInput = {
  locale: AppLocale;
  /** De-localized router pathname, e.g. `/blog/my-post`. */
  path: string;
  /** Per-locale paths for pages whose slug differs per locale. */
  localizedPaths?: LocalizedPaths;
  title: string;
  description: string;
  type?: "website" | "article";
  article?: {
    publishedTime: string;
    author: string;
    tags: readonly string[];
  };
  /** Absolute 1200×630 PNG URL; defaults to the generated share card. */
  image?: string;
  imageAlt?: string;
  /** Drops canonical/hreflang links and tells crawlers not to index. */
  noIndex?: boolean;
};

export type PageHeadMeta = ComponentProps<"meta">;
export type PageHeadLink = { rel: string; href: string; hrefLang?: string };
export type PageHeadScript = { type: string; children: string };

/** JSON-LD `<script>` for a route's `head().scripts`. */
export function jsonLdScript(value: unknown): PageHeadScript {
  return {
    type: "application/ld+json",
    children: JSON.stringify(value).replace(/</g, "\\u003c"),
  };
}

/**
 * Page-level `<head>` entries: title, description, robots, Open Graph,
 * Twitter card and canonical/hreflang links.
 *
 * TanStack Router de-duplicates `meta` by `name`/`property` with the deepest
 * route winning, but concatenates `links`. So child routes return only
 * `meta`, and the root route emits `links` once for the deepest match (it reads
 * `localizedPaths` from that match's loader data).
 */
export function pageHead({
  locale,
  path,
  localizedPaths,
  title,
  description,
  type = "website",
  article,
  image = getOgImageUrl(locale, { title, description }),
  imageAlt = title,
  noIndex = false,
}: PageHeadInput): {
  meta: PageHeadMeta[];
  links: PageHeadLink[];
  scripts: PageHeadScript[];
} {
  const urlByLocale = getUrlByLocale(path, localizedPaths);
  const url = urlByLocale.get(locale) ?? localizedUrl(locale, path);
  const alternateLocales = [...urlByLocale.keys()].filter(
    (value) => value !== locale,
  );

  const meta: PageHeadMeta[] = [
    { title: getSeoTitle(title) },
    { name: "description", content: description },
    {
      name: "robots",
      content: noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: imageAlt },
    { property: "og:locale", content: ogLocaleByLocale[locale] },
    // Meta tags are de-duplicated by property, so only one alternate fits.
    ...alternateLocales.slice(0, 1).map((value) => ({
      property: "og:locale:alternate",
      content: ogLocaleByLocale[value],
    })),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: imageAlt },
  ];

  const scripts: PageHeadScript[] = [];

  if (article) {
    meta.push(
      { property: "article:published_time", content: article.publishedTime },
      { property: "article:author", content: article.author },
    );
    // `article:tag` cannot repeat (meta is de-duplicated by property), so the
    // full tag list goes to structured data instead.
    scripts.push(
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        url,
        image,
        datePublished: article.publishedTime,
        author: { "@type": "Person", name: article.author },
        keywords: article.tags,
        inLanguage: ogLocaleByLocale[locale],
        publisher: { "@id": `${SITE_URL}/#organization` },
      }),
    );
  }

  return {
    meta,
    links: noIndex ? [] : getSeoLinks(locale, urlByLocale),
    scripts,
  };
}

function getSeoLinks(
  locale: AppLocale,
  urlByLocale: Map<AppLocale, string>,
): PageHeadLink[] {
  const canonicalHref = urlByLocale.get(locale);

  // Should never happen (the page renders in `locale`, so its own URL exists),
  // but guard rather than emit a broken canonical.
  if (!canonicalHref) return [];

  return [
    { rel: "canonical", href: canonicalHref },
    ...[...urlByLocale].map(([value, href]) => ({
      rel: "alternate",
      hrefLang: hreflangByLocale[value],
      href,
    })),
    // x-default points at the base locale when it exists, else the canonical.
    {
      rel: "alternate",
      hrefLang: "x-default",
      href: urlByLocale.get(baseLocale) ?? canonicalHref,
    },
  ];
}

/** Home page copy, shared by the root head defaults and the home JSON-LD. */
export function getHomeSeo() {
  return {
    title: m.seo_home_title(),
    description: m.seo_home_description(),
    keywords: m.seo_home_keywords(),
    imageAlt: m.seo_og_image_alt(),
  };
}

/** Organization/WebSite/WebPage/Service graph. Emitted on the home page only. */
export function getHomeJsonLd(locale: AppLocale) {
  const seo = getHomeSeo();
  const url = localizedUrl(locale, "/");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: LOGO_URL,
        email: CONTACT_EMAIL,
        foundingLocation: {
          "@type": "Country",
          name: "Argentina",
        },
        areaServed: [
          {
            "@type": "Country",
            name: "Argentina",
          },
          {
            "@type": "Place",
            name: m.seo_json_ld_region_name(),
          },
        ],
        knowsAbout: [
          "Data Engineering",
          "Business Intelligence",
          "Artificial Intelligence",
          "Software Development",
          "Automation",
          "ETL",
          "BigQuery",
          "Metabase",
          "dbt",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          email: CONTACT_EMAIL,
          contactType: "sales",
          availableLanguage: ["Spanish", "English"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: locales.map((value) => ogLocaleByLocale[value]),
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: seo.title,
        description: seo.description,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${SITE_URL}/#organization`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: getOgImageUrl(locale),
        },
        inLanguage: ogLocaleByLocale[locale],
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/#services`,
        name: m.seo_json_ld_service_name(),
        provider: {
          "@id": `${SITE_URL}/#organization`,
        },
        serviceType: [
          "Data Engineering",
          "Artificial Intelligence",
          "Software Development",
          "Automation",
          "Business Intelligence",
        ],
        areaServed: {
          "@type": "Place",
          name: m.seo_json_ld_area_served(),
        },
      },
    ],
  };
}
