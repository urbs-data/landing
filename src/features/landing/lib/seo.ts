import { baseLocale, hreflangByLocale, locales, SITE_URL } from "#/i18n";
import { m } from "#/paraglide/messages";

type SupportedLocale = "es" | "en";

const BRAND_NAME = "Urbs Data";
const CONTACT_EMAIL = "hola@urbsdata.com";
const LOGO_URL = `${SITE_URL}/web-app-manifest-512x512.png`;
const ES_URL = `${SITE_URL}/`;
const EN_URL = `${SITE_URL}/en/`;
const ES_OG_IMAGE_URL = `${SITE_URL}/og-image`;
const EN_OG_IMAGE_URL = `${SITE_URL}/en/og-image`;

const localeMetadata: Record<
  SupportedLocale,
  {
    locale: string;
    alternateLocale: string;
    url: string;
    image: string;
  }
> = {
  es: {
    locale: "es_AR",
    alternateLocale: "en_US",
    url: ES_URL,
    image: ES_OG_IMAGE_URL,
  },
  en: {
    locale: "en_US",
    alternateLocale: "es_AR",
    url: EN_URL,
    image: EN_OG_IMAGE_URL,
  },
};

export function getSupportedLocale(locale: string): SupportedLocale {
  return locale === "en" ? "en" : "es";
}

/**
 * Internal-only pages. They render an access gate (or no content at all) to a
 * crawler, so Google reads them as soft 404s and clusters them as duplicates.
 * Kept out of the index and out of the sitemap.
 */
const noIndexPaths = new Set(["/presentations", "/signatures", "/social"]);

/**
 * Normalizes a de-localized router pathname into the form used to build
 * absolute URLs: no trailing slash, "/" for the home page.
 */
export function normalizePath(pathname: string) {
  const path = pathname.replace(/\/+$/, "");
  return path.startsWith("/") ? path || "/" : `/${path}`;
}

export function isNoIndexPath(pathname: string) {
  return noIndexPaths.has(normalizePath(pathname));
}

/**
 * Absolute URL for a de-localized path in a given locale. The base locale (es)
 * lives at the root; other locales are prefixed. The home page keeps its
 * trailing slash, every other path drops it.
 */
export function getLocalizedUrl(locale: SupportedLocale, pathname: string) {
  const path = normalizePath(pathname);
  const prefix = locale === "es" ? "" : `/${locale}`;

  return path === "/" ? `${SITE_URL}${prefix}/` : `${SITE_URL}${prefix}${path}`;
}

/**
 * Canonical + hreflang links for the page currently being rendered. Declared
 * once at the root so every route emits alternates that point at itself
 * instead of at the home page.
 *
 * `localizedPaths` covers routes whose slug differs per locale (blog articles,
 * career posts). It holds already-prefixed paths, e.g.
 * `{ es: "/blog/la-evolucion...", en: "/en/blog/the-evolution..." }`. When it
 * only carries one locale — a post published in a single language — we emit an
 * alternate for that locale alone. Emitting the other one would advertise a
 * URL that does not exist, which Google reports as a soft 404 / duplicate.
 */
export function getPageSeoLinks(
  locale: SupportedLocale,
  pathname: string,
  localizedPaths?: Partial<Record<SupportedLocale, string>>,
) {
  if (isNoIndexPath(pathname)) return [];

  // Absolute URL per locale that actually has a page. Static routes exist in
  // every locale, so we synthesize both from the shared path; slug routes only
  // list the locales present in `localizedPaths`.
  const urlByLocale = new Map<SupportedLocale, string>(
    localizedPaths
      ? locales
          .filter((value) => Boolean(localizedPaths[value]))
          .map((value) => [value, `${SITE_URL}${localizedPaths[value]}`])
      : locales.map((value) => [value, getLocalizedUrl(value, pathname)]),
  );

  const canonicalHref = urlByLocale.get(locale);

  // Should never happen (the page renders in `locale`, so its own URL exists),
  // but guard rather than emit a broken canonical.
  if (!canonicalHref) return [];

  const links: Array<{ rel: string; href: string; hrefLang?: string }> = [
    { rel: "canonical", href: canonicalHref },
  ];

  for (const [value, href] of urlByLocale) {
    links.push({ rel: "alternate", hrefLang: hreflangByLocale[value], href });
  }

  // x-default points at the base locale when it exists, else the canonical.
  links.push({
    rel: "alternate",
    hrefLang: "x-default",
    href: urlByLocale.get(baseLocale) ?? canonicalHref,
  });

  return links;
}

export function getHomeSeo(locale: SupportedLocale) {
  const metadata = localeMetadata[locale];

  return {
    ...metadata,
    title: m.seo_home_title(),
    description: m.seo_home_description(),
    keywords: m.seo_home_keywords(),
    imageAlt: m.seo_og_image_alt(),
    siteName: BRAND_NAME,
    alternates: {
      es: ES_URL,
      en: EN_URL,
      default: ES_URL,
    },
  };
}

export function getSeoTitle(title: string) {
  return title.startsWith(`${BRAND_NAME} |`)
    ? title
    : `${BRAND_NAME} | ${title}`;
}

export function getOgImageUrl(
  locale: SupportedLocale,
  params?: {
    title?: string;
    description?: string;
  },
) {
  const url = new URL(localeMetadata[locale].image);

  if (params?.title) url.searchParams.set("title", params.title);
  if (params?.description) {
    url.searchParams.set("description", params.description);
  }

  return url.toString();
}

export function getHomeJsonLd(locale: SupportedLocale) {
  const seo = getHomeSeo(locale);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: BRAND_NAME,
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
        name: BRAND_NAME,
        inLanguage: [seo.locale, seo.alternateLocale],
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${seo.url}#webpage`,
        url: seo.url,
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
          url: seo.image,
        },
        inLanguage: seo.locale,
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

export function stringifyJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
