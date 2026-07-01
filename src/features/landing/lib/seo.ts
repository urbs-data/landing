import { m } from "#/paraglide/messages";

type SupportedLocale = "es" | "en";

const SITE_URL = "https://urbsdata.com";
const BRAND_NAME = "Urbs Data";
const CONTACT_EMAIL = "hola@urbsdata.com";
const LOGO_URL = `${SITE_URL}/web-app-manifest-512x512.png`;
const ES_URL = `${SITE_URL}/`;
const EN_URL = `${SITE_URL}/en/`;
const ES_OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
const EN_OG_IMAGE_URL = `${SITE_URL}/en/og-image.png`;

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
