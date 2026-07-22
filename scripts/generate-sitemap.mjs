/**
 * Regenerates public/sitemap.xml from the routes and content on disk.
 *
 * Kept as a build step rather than a hand-maintained file so new blog articles
 * cannot silently go unlisted. Access-gated and empty routes are excluded on
 * purpose — they carry a `noindex` tag (see `noIndexPaths` in
 * src/features/landing/lib/seo.ts) and must not be advertised here.
 *
 * Usage: node scripts/generate-sitemap.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://urbsdata.com";
const LOCALES = ["es", "en"];
const BASE_LOCALE = "es";
const HREFLANG = { es: "es-AR", en: "en" };

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogContentDir = join(rootDir, "src/features/blog/content");
const outputFile = join(rootDir, "public/sitemap.xml");

/** Static routes, as de-localized paths, with their crawl priority. */
const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/careers", priority: "0.6", changefreq: "weekly" },
];

function localizeUrl(locale, path) {
  const prefix = locale === BASE_LOCALE ? "" : `/${locale}`;
  return path === "/"
    ? `${SITE_URL}${prefix}/`
    : `${SITE_URL}${prefix}${path}`;
}

/** Minimal frontmatter reader — only the scalar fields the sitemap needs. */
function readFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  return Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^([a-zA-Z0-9_]+):\s*"?([^"]*?)"?\s*$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value]),
  );
}

/**
 * Blog articles use a different slug per locale, linked by their `id`.
 * Groups them so each entry carries every localized URL as an alternate.
 */
async function readBlogEntries() {
  const byId = new Map();

  for (const locale of LOCALES) {
    const dir = join(blogContentDir, locale);
    let files;

    try {
      files = await readdir(dir);
    } catch {
      continue;
    }

    for (const file of files.filter((name) => name.endsWith(".md"))) {
      const source = await readFile(join(dir, file), "utf8");
      const { id, slug, date } = readFrontmatter(source);

      if (!id || !slug) continue;

      const entry = byId.get(id) ?? { urls: {}, lastmod: date };
      entry.urls[locale] = localizeUrl(locale, `/blog/${slug}`);
      if (date && (!entry.lastmod || date > entry.lastmod)) entry.lastmod = date;
      byId.set(id, entry);
    }
  }

  return [...byId.values()].map((entry) => ({
    urls: entry.urls,
    lastmod: entry.lastmod,
    priority: "0.7",
    changefreq: "monthly",
  }));
}

function renderUrl({ urls, lastmod, priority, changefreq }) {
  const alternates = LOCALES.filter((locale) => urls[locale])
    .map(
      (locale) =>
        `    <xhtml:link rel="alternate" hreflang="${HREFLANG[locale]}" href="${urls[locale]}" />`,
    )
    .concat(
      urls[BASE_LOCALE]
        ? [
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${urls[BASE_LOCALE]}" />`,
          ]
        : [],
    )
    .join("\n");

  // One <url> block per locale, each advertising the full alternate set.
  return LOCALES.filter((locale) => urls[locale])
    .map((locale) =>
      [
        "  <url>",
        `    <loc>${urls[locale]}</loc>`,
        alternates,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${locale === BASE_LOCALE ? priority : (Number(priority) - 0.1).toFixed(1)}</priority>`,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");
}

const entries = [
  ...staticRoutes.map(({ path, priority, changefreq }) => ({
    urls: Object.fromEntries(
      LOCALES.map((locale) => [locale, localizeUrl(locale, path)]),
    ),
    priority,
    changefreq,
  })),
  ...(await readBlogEntries()),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...entries.map(renderUrl),
  "</urlset>",
  "",
].join("\n");

await writeFile(outputFile, xml, "utf8");

console.log(
  `Wrote ${outputFile} (${entries.reduce((total, entry) => total + Object.keys(entry.urls).length, 0)} URLs)`,
);
