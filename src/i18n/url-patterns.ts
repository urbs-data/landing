import type { FileRoutesByTo } from "#/routeTree.gen";
import { type AppLocale, locales, localizedPath } from "./index.ts";

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

function createTranslatedPathnames(
  input: Record<PublicRoutePath, Record<AppLocale, string>>,
): TranslatedPathname[] {
  return Object.entries(input).map(([pattern, localizedPaths]) => ({
    pattern: toUrlPattern(pattern),
    localized: locales.map((locale) => [
      locale,
      localizedPath(locale, toUrlPattern(localizedPaths[locale])),
    ]),
  }));
}

// Identity today; give a locale its own segment here (e.g. es "/carreras").
const translatedPathnames = createTranslatedPathnames({
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
  "/social": {
    en: "/social",
    es: "/social",
  },
});

const defaultLocalizedPathPattern: TranslatedPathname = {
  pattern: "/:path(.*)?",
  localized: locales.map((locale) => [
    locale,
    localizedPath(locale, "/:path(.*)?"),
  ]),
};

export const urlPatterns = [
  ...translatedPathnames,
  defaultLocalizedPathPattern,
] satisfies TranslatedPathname[];
