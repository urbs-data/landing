export const baseLocale = "es" as const;

export const locales = [baseLocale, "en"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale = baseLocale;

/**
 * Header the client attaches to auth requests so server-side email rendering
 * (which has no localized URL to infer from) can pick the recipient's locale.
 */
export const LOCALE_HEADER = "x-app-locale";

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  es: "Español",
};

export function isLocale(value: string): value is AppLocale {
  return locales.some((locale) => locale === value);
}
