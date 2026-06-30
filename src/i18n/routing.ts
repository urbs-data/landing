import { localizeHref } from "#/paraglide/runtime";
import { locales } from "./index";
import { staticRoutePaths } from "./url-patterns";

export {
  staticRoutePaths,
  translatedPathnames,
  urlPatterns,
} from "./url-patterns";

export const prerenderRoutes = staticRoutePaths.flatMap((path) =>
  locales.map((locale) => ({
    path: localizeHref(path, { locale }),
    prerender: {
      enabled: true,
    },
  })),
);
