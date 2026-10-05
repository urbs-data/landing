/**
 * Regenerates public/sitemap.xml from the routes and content on disk.
 *
 * Kept as a build step rather than a hand-maintained file so new blog articles
 * cannot silently go unlisted. Access-gated and empty routes are excluded on
 * purpose — they carry a `noindex` tag (see `noIndexPaths` in
 * src/features/landing/lib/seo.ts) and must not be advertised here.
 *
 * Usage: node scripts/generate-sitemap.ts
 */
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineBlogCollection } from "../src/features/blog/lib/blog-collection.ts";
import { defineCareersCollection } from "../src/features/careers/lib/careers-collection.ts";
import {
  type AppLocale,
  baseLocale,
  hreflangByLocale,
  type LocalizedPaths,
  locales,
  localizedUrl,
  SITE_URL,
} from "../src/i18n/index.ts";
import type { Collection } from "../src/lib/content/collection.ts";
import { readContentFiles } from "../src/lib/content/node-files.ts";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputFile = join(rootDir, "public/sitemap.xml");

type SitemapEntry = {
  urls: Partial<Record<AppLocale, string>>;
  lastmod?: string;
  priority: string;
  changefreq: string;
};

// Same collections (schema validation, folder-format posts, slug pairing by
// `id`) the app serves, built from the file system instead of import.meta.glob.
const blog = defineBlogCollection(
  await readContentFiles(join(rootDir, "src/features/blog/content")),
);
const careers = defineCareersCollection(
  await readContentFiles(join(rootDir, "src/features/careers/content")),
);

function staticEntry(
  path: string,
  priority: string,
  changefreq: string,
): SitemapEntry {
  return {
    urls: Object.fromEntries(
      locales.map((locale) => [locale, localizedUrl(locale, path)]),
    ),
    priority,
    changefreq,
  };
}

function toAbsoluteUrls(paths: LocalizedPaths) {
  return Object.fromEntries(
    Object.entries(paths).map(([locale, path]) => [locale, `${SITE_URL}${path}`]),
  );
}

function collectionEntries<T>(
  collection: Collection<T>,
  priority: string,
): SitemapEntry[] {
  return collection.entries().map(({ localizedPaths, lastmod }) => ({
    urls: toAbsoluteUrls(localizedPaths),
    lastmod,
    priority,
    changefreq: "monthly",
  }));
}

function renderUrl({ urls, lastmod, priority, changefreq }: SitemapEntry) {
  const alternates = locales
    .filter((locale) => urls[locale])
    .map(
      (locale) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflangByLocale[locale]}" href="${urls[locale]}" />`,
    )
    .concat(
      urls[baseLocale]
        ? [
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${urls[baseLocale]}" />`,
          ]
        : [],
    )
    .join("\n");

  // One <url> block per locale, each advertising the full alternate set.
  return locales
    .filter((locale) => urls[locale])
    .map((locale) =>
      [
        "  <url>",
        `    <loc>${urls[locale]}</loc>`,
        alternates,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${locale === baseLocale ? priority : (Number(priority) - 0.1).toFixed(1)}</priority>`,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");
}

const careerEntries = collectionEntries(careers, "0.5");

const entries: SitemapEntry[] = [
  staticEntry("/", "1.0", "monthly"),
  staticEntry("/blog", "0.8", "weekly"),
  // The careers index is only worth crawling while there are open roles.
  ...(careerEntries.length > 0
    ? [staticEntry("/careers", "0.6", "weekly"), ...careerEntries]
    : []),
  ...collectionEntries(blog, "0.7"),
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
