import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Footer } from "#/components/layout/footer";
import { Header } from "#/components/layout/header";
import { RouteActivityIndicator } from "#/components/route-activity-indicator";
import {
  getHomeJsonLd,
  getHomeSeo,
  getPageSeoLinks,
  getSupportedLocale,
  isNoIndexPath,
  stringifyJsonLd,
} from "#/features/landing/lib/seo";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'light';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRoute({
  beforeLoad: async () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", getLocale());
    }
  },

  head: ({ matches }) => {
    const locale = getSupportedLocale(getLocale());
    const seo = getHomeSeo(locale);
    // De-localized pathname of the deepest match; the router rewrite strips the
    // locale prefix on the way in, so this is the shared path across locales.
    const deepestMatch = matches.at(-1);
    const pathname = deepestMatch?.pathname ?? "/";
    // Blog articles and career posts have a different slug per locale, so the
    // identity path mapping below would produce wrong alternates. Those routes
    // build their own canonical/hreflang from the loader's `localizedPaths`.
    const ownsSeoLinks =
      deepestMatch?.routeId === "/blog/$slug" ||
      deepestMatch?.routeId === "/careers/$slug";

    return {
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: seo.title,
        },
        {
          name: "description",
          content: seo.description,
        },
        {
          name: "keywords",
          content: seo.keywords,
        },
        {
          name: "author",
          content: seo.siteName,
        },
        {
          name: "robots",
          content: isNoIndexPath(pathname)
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        },
        {
          name: "theme-color",
          content: "#ffffff",
        },
        {
          name: "application-name",
          content: seo.siteName,
        },
        {
          name: "apple-mobile-web-app-title",
          content: seo.siteName,
        },
        {
          name: "geo.region",
          content: "AR",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:site_name",
          content: seo.siteName,
        },
        {
          property: "og:title",
          content: seo.title,
        },
        {
          property: "og:description",
          content: seo.description,
        },
        {
          property: "og:url",
          content: seo.url,
        },
        {
          property: "og:image",
          content: seo.image,
        },
        {
          property: "og:image:type",
          content: "image/png",
        },
        {
          property: "og:image:width",
          content: "1200",
        },
        {
          property: "og:image:height",
          content: "630",
        },
        {
          property: "og:image:alt",
          content: seo.imageAlt,
        },
        {
          property: "og:locale",
          content: seo.locale,
        },
        {
          property: "og:locale:alternate",
          content: seo.alternateLocale,
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: seo.title,
        },
        {
          name: "twitter:description",
          content: seo.description,
        },
        {
          name: "twitter:image",
          content: seo.image,
        },
        {
          name: "twitter:image:alt",
          content: seo.imageAlt,
        },
      ],
      links: [
        ...(ownsSeoLinks ? [] : getPageSeoLinks(locale, pathname)),
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
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    };
  },
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

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
        <a
          className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          href="/"
        >
          {m.not_found_home()}
        </a>
      </section>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const locale = getSupportedLocale(getLocale());
  const jsonLd = stringifyJsonLd(getHomeJsonLd(locale));

  return (
    <html
      lang={getLocale()}
      className="light bg-background"
      data-theme="light"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <Header />
        {children}
        <Footer />
        <RouteActivityIndicator />
        <Scripts />
      </body>
    </html>
  );
}
