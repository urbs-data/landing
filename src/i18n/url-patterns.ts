import type { FileRoutesByTo } from "#/routeTree.gen";
import { type AppLocale, baseLocale, locales } from "./index.ts";

type RoutePath = keyof FileRoutesByTo;

const excludedPathSegments = ["og-image"] as const;

export type PublicRoutePath = Exclude<
  RoutePath,
  `${string}${(typeof excludedPathSegments)[number]}${string}`
>;

type TranslatedPathname = {
  pattern: string;
  localized: Array<[AppLocale, string]>;
};

function toUrlPattern(path: string) {
  const pattern = path
    .replace(/\/\$$/, "/:path(.*)?")
    .replace(/\{-\$([a-zA-Z0-9_]+)\}/g, ":$1?")
    .replace(/\$([a-zA-Z0-9_]+)/g, ":$1")
    .replace(/\/+$/, "");

  return pattern || "/";
}

function withLocalePrefix(locale: AppLocale, path: string) {
  if (locale === baseLocale) {
    return toUrlPattern(path);
  }

  return `/${locale}${toUrlPattern(path)}`;
}

function createTranslatedPathnames(
  input: Record<PublicRoutePath, Record<AppLocale, string>>,
): TranslatedPathname[] {
  return Object.entries(input).map(([pattern, localizedPaths]) => ({
    pattern: toUrlPattern(pattern),
    localized: locales.map((locale) => [
      locale,
      withLocalePrefix(locale, localizedPaths[locale]),
    ]),
  }));
}

export const translatedPathnames = createTranslatedPathnames({
  "/": {
    en: "/",
    es: "/",
  },
  "/presentations": {
    en: "/presentations",
    es: "/presentations",
  },
  "/blog": {
    en: "/blog",
    es: "/blog",
  },
  "/blog/$slug": {
    en: "/blog/$slug",
    es: "/blog/$slug",
  },
  "/careers": {
    en: "/careers",
    es: "/careers",
  },
  "/careers/$slug": {
    en: "/careers/$slug",
    es: "/careers/$slug",
  },
  "/signatures": {
    en: "/signatures",
    es: "/signatures",
  },
});

const defaultLocalizedPathPattern: TranslatedPathname = {
  pattern: "/:path(.*)?",
  localized: locales.map((locale) => [
    locale,
    locale === baseLocale ? "/:path(.*)?" : `/${locale}/:path(.*)?`,
  ]),
};

export const urlPatterns = [
  ...translatedPathnames,
  defaultLocalizedPathPattern,
] satisfies TranslatedPathname[];

export const staticRoutePaths = ["/"] satisfies PublicRoutePath[];
