export const baseLocale = "es" as const;

export const locales = [baseLocale, "en"] as const;

export type AppLocale = (typeof locales)[number];

/** Path per locale for pages whose slug differs between languages. */
export type LocalizedPaths = Partial<Record<AppLocale, string>>;

export const SITE_URL = "https://urbsdata.com";

export const hreflangByLocale: Record<AppLocale, string> = {
  es: "es-AR",
  en: "en",
};

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  es: "Español",
};

export function isLocale(value: string): value is AppLocale {
  return locales.some((locale) => locale === value);
}

/** Narrows any input (URL segment, header, query param) to a known locale. */
export function toAppLocale(value?: string | null): AppLocale {
  return value && isLocale(value) ? value : baseLocale;
}

/**
 * Normalizes a de-localized pathname: leading slash, no trailing slash, "/"
 * for the home page.
 */
export function normalizePath(pathname: string) {
  const path = pathname.replace(/\/+$/, "");
  return path.startsWith("/") ? path || "/" : `/${path}`;
}

/**
 * The single locale URL policy: the base locale lives at the root, every other
 * locale is prefixed (`/blog` → `/en/blog`, `/` → `/en/`). Works for plain
 * paths and URL patterns alike.
 */
export function localizedPath(locale: AppLocale, pathname: string) {
  const path = normalizePath(pathname);
  return locale === baseLocale ? path : `/${locale}${path}`;
}

/** Absolute URL for a de-localized path in a given locale. */
export function localizedUrl(locale: AppLocale, pathname: string) {
  return `${SITE_URL}${localizedPath(locale, pathname)}`;
}
