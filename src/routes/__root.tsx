import ibmPlexSansUrl from "@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2?url";
import instrumentSansUrl from "@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2?url";
import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { Footer } from "#/components/layout/footer";
import { Header } from "#/components/layout/header";
import { RouteActivityIndicator } from "#/components/route-activity-indicator";
import {
  getHomeJsonLd,
  getHomeSeo,
  getOgImageUrl,
  isNoIndexPath,
  jsonLdScript,
  pageHead,
  SITE_NAME,
} from "#/features/landing/lib/seo";
import { type LocalizedPaths, normalizePath, toAppLocale } from "#/i18n";
import { themeInitScript } from "#/lib/theme";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  beforeLoad: async () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", getLocale());
    }
  },

  head: ({ matches }) => {
    const locale = toAppLocale(getLocale());
    const home = getHomeSeo();
    // De-localized pathname of the deepest match; the router rewrite strips the
    // locale prefix on the way in, so this is the shared path across locales.
    const deepestMatch = matches.at(-1);
    const pathname = normalizePath(deepestMatch?.pathname ?? "/");
    // A loader `notFound()` (unknown slug) or an unmatched URL: no canonical or
    // hreflang for a page that does not exist.
    const isNotFound = matches.some(
      (match) => match.status === "notFound" || match._notFound,
    );
    const isHome = pathname === "/" && !isNotFound;
    // Slug routes (blog, careers) return `localizedPaths` from their loader;
    // the same protocol the locale switcher reads. Everything else maps the
    // shared path to every locale.
    const page = pageHead({
      locale,
      path: pathname,
      localizedPaths: getLocalizedPaths(deepestMatch?.loaderData),
      title: isNotFound ? m.not_found_title() : home.title,
      description: isNotFound ? m.not_found_description() : home.description,
      image: getOgImageUrl(locale),
      imageAlt: home.imageAlt,
      noIndex: isNotFound || isNoIndexPath(pathname),
    });

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "keywords", content: home.keywords },
        { name: "author", content: SITE_NAME },
        { name: "theme-color", content: "#ffffff" },
        { name: "application-name", content: SITE_NAME },
        { name: "apple-mobile-web-app-title", content: SITE_NAME },
        { name: "geo.region", content: "AR" },
        ...page.meta,
      ],
      links: [
        ...page.links,
        {
          rel: "icon",
          href: "/favicon.svg",
          type: "image/svg+xml",
        },
        {
          rel: "icon",
          href: "/favicon-96x96.png",
          type: "image/png",
          sizes: "96x96",
        },
        {
          rel: "shortcut icon",
          href: "/favicon.ico",
          sizes: "any",
        },
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
          sizes: "180x180",
        },
        {
          rel: "manifest",
          href: "/manifest.json",
        },
        // The hero paints before hydration, so fetch its fonts alongside the
        // CSS instead of after it; avoids a visible font swap on slow networks.
        ...[instrumentSansUrl, ibmPlexSansUrl].map((href) => ({
          rel: "preload",
          href,
          as: "font",
          type: "font/woff2",
          crossOrigin: "anonymous" as const,
        })),
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
      scripts: isHome ? [jsonLdScript(getHomeJsonLd(locale))] : [],
    };
  },
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function getLocalizedPaths(loaderData: unknown): LocalizedPaths | undefined {
  if (
    loaderData &&
    typeof loaderData === "object" &&
    "localizedPaths" in loaderData &&
    loaderData.localizedPaths &&
    typeof loaderData.localizedPaths === "object"
  ) {
    return loaderData.localizedPaths;
  }

  return undefined;
}

function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-24">
      <section className="mx-auto max-w-md text-center">
        <p className="font-medium text-muted-foreground text-sm">404</p>
        <h1 className="mt-3 font-semibold text-3xl tracking-tight">
          {m.not_found_title()}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {m.not_found_description()}
        </p>
        <Link
          className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          to="/"
        >
          {m.not_found_home()}
        </Link>
      </section>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={getLocale()}
      className="light bg-background"
      data-theme="light"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <head>
        {/* The server and client bundles stringify the init function
            differently; the script only matters on the server-rendered HTML. */}
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        {/* "user": honour prefers-reduced-motion for every motion component
            (transform/layout animations are skipped, opacity still fades). */}
        <MotionConfig reducedMotion="user">
          <Header />
          {children}
          <Footer />
        </MotionConfig>
        <RouteActivityIndicator />
        <Scripts />
      </body>
    </html>
  );
}
