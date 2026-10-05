/**
 * Localized Markdown content collection (blog articles, career posts, ...).
 *
 * One entry is a Markdown file with YAML frontmatter, stored per locale as
 * either `<locale>/<name>.md` or `<locale>/<name>/index.md` (folder format,
 * for posts that ship their own images). Entries in different locales are the
 * same piece of content when they share a frontmatter `id`; each locale has
 * its own `slug`.
 *
 * The file source is injected so the same code runs in the app (Vite
 * `import.meta.glob`) and in plain Node scripts (see `./node-files.ts`). Keep
 * this module free of Vite-only APIs and paraglide virtual modules.
 */
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import type { z } from "zod";
import {
  type AppLocale,
  isLocale,
  type LocalizedPaths,
  locales,
  localizedPath,
} from "#/i18n/index.ts";

/** Raw Markdown sources keyed by path (`.../<locale>/<name>.md`). */
export type ContentFiles = Record<string, string>;

/** Public URLs of co-located assets, keyed by path on the same scheme. */
export type ContentAssets = Record<string, string>;

/** Fields every collection's frontmatter must provide. */
export type BaseFrontmatter = {
  id: string;
  slug: string;
  /** `YYYY-MM-DD`; drives ordering and the sitemap `lastmod`. */
  date: string;
};

export type CollectionOptions<TSchema extends z.ZodType<BaseFrontmatter>> = {
  /** Human name used in validation errors, e.g. "blog". */
  name: string;
  files: ContentFiles;
  assets?: ContentAssets;
  schema: TSchema;
  /** De-localized route the slug hangs off, e.g. "/blog". */
  routeBase: string;
  /** Frontmatter fields holding relative asset references to resolve. */
  assetFields?: ReadonlyArray<keyof z.output<TSchema>>;
  /**
   * Relative references starting with this prefix that do not match a
   * co-located asset are served from `public/assets/` (e.g. "blog/").
   */
  publicAssetPrefix?: string;
};

export type CollectionEntry<T> = T & { localizedPaths: LocalizedPaths };

export type RenderedCollectionEntry<T> = CollectionEntry<T> & { html: string };

/** One piece of content across every locale it is published in. */
export type CollectionSitemapEntry = {
  id: string;
  localizedPaths: LocalizedPaths;
  /** Most recent `date` among its locales. */
  lastmod: string;
};

export type Collection<T> = {
  /** Entries published in `locale`, newest first. */
  list(locale: AppLocale): Array<CollectionEntry<T>>;
  /** Entry by its localized slug, with rendered HTML; `null` when missing. */
  get(locale: AppLocale, slug: string): RenderedCollectionEntry<T> | null;
  /** Every entry grouped by `id`, for the sitemap. */
  entries(): CollectionSitemapEntry[];
};

type ZodIssue = z.core.$ZodIssue;

type IndexedEntry<T> = {
  filePath: string;
  body: string;
  locale: AppLocale;
  data: CollectionEntry<T>;
  html?: string;
};

const indexFileName = "index.md";
const externalAssetPattern = /^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/i;
const assetSuffixPattern = /[?#]/;

export function defineCollection<TSchema extends z.ZodType<BaseFrontmatter>>(
  options: CollectionOptions<TSchema>,
): Collection<z.output<TSchema>> {
  type T = z.output<TSchema>;

  const resolveAsset = (filePath: string, value: string) =>
    resolveAssetUrl(
      filePath,
      value,
      options.assets ?? {},
      options.publicAssetPrefix,
    );
  const markdown = createMarkdownRenderer(resolveAsset);

  // Built once: every file parsed and validated a single time.
  const parsed = Object.entries(options.files).flatMap(([filePath, source]) => {
    const locale = getEntryLocale(filePath);
    if (!locale) return [];

    const { data, content } = matter(source);
    const frontmatter = readFrontmatter(options, filePath, data);

    for (const field of options.assetFields ?? []) {
      const value = frontmatter[field];
      if (typeof value === "string") {
        (frontmatter as Record<keyof T, unknown>)[field] = resolveAsset(
          filePath,
          value,
        );
      }
    }

    return [{ filePath, body: content, locale, frontmatter }];
  });

  const pathsById = new Map<string, LocalizedPaths>();
  const filesByLocaleId = new Map<string, string>();

  for (const { filePath, locale, frontmatter } of parsed) {
    const key = `${locale}:${frontmatter.id}`;
    const duplicate = filesByLocaleId.get(key);
    if (duplicate) {
      throw new Error(
        `Duplicate ${options.name} id "${frontmatter.id}" for locale "${locale}" in ${duplicate} and ${filePath}`,
      );
    }
    filesByLocaleId.set(key, filePath);

    const paths = pathsById.get(frontmatter.id) ?? {};
    paths[locale] = localizedPath(
      locale,
      `${options.routeBase}/${frontmatter.slug}`,
    );
    pathsById.set(frontmatter.id, paths);
  }

  const byLocale = new Map<AppLocale, Array<IndexedEntry<T>>>(
    locales.map((locale) => [locale, []]),
  );
  const bySlug = new Map<string, IndexedEntry<T>>();

  for (const { filePath, body, locale, frontmatter } of parsed) {
    const entry: IndexedEntry<T> = {
      filePath,
      body,
      locale,
      data: {
        ...frontmatter,
        localizedPaths: pathsById.get(frontmatter.id) ?? {},
      },
    };
    const slugKey = `${locale}:${frontmatter.slug}`;
    const duplicate = bySlug.get(slugKey);
    if (duplicate) {
      throw new Error(
        `Duplicate ${options.name} slug "${frontmatter.slug}" for locale "${locale}" in ${duplicate.filePath} and ${filePath}`,
      );
    }
    bySlug.set(slugKey, entry);
    byLocale.get(locale)?.push(entry);
  }

  const listByLocale = new Map(
    [...byLocale].map(([locale, entries]) => [
      locale,
      entries
        .map((entry) => entry.data)
        .sort((a, b) => b.date.localeCompare(a.date)),
    ]),
  );

  return {
    list: (locale) => listByLocale.get(locale) ?? [],
    get(locale, slug) {
      const entry = bySlug.get(`${locale}:${slug}`);
      if (!entry) return null;

      entry.html ??= markdown.render(entry.body, { filePath: entry.filePath });
      return { ...entry.data, html: entry.html };
    },
    entries() {
      const lastmodById = new Map<string, string>();
      for (const { frontmatter } of parsed) {
        const current = lastmodById.get(frontmatter.id);
        if (!current || frontmatter.date > current) {
          lastmodById.set(frontmatter.id, frontmatter.date);
        }
      }

      return [...pathsById].map(([id, localizedPaths]) => ({
        id,
        localizedPaths,
        lastmod: lastmodById.get(id) ?? "",
      }));
    },
  };
}

function getEntryLocale(filePath: string): AppLocale | null {
  const parts = filePath.split("/");
  const fileName = parts.at(-1) ?? "";
  if (!fileName.endsWith(".md")) return null;

  const locale = fileName === indexFileName ? parts.at(-3) : parts.at(-2);
  return locale && isLocale(locale) ? locale : null;
}

function formatIssue(issue: ZodIssue) {
  const field = issue.path.length > 0 ? issue.path.join(".") : "frontmatter";
  return `- ${field}: ${issue.message}`;
}

function readFrontmatter<TSchema extends z.ZodType<BaseFrontmatter>>(
  options: CollectionOptions<TSchema>,
  filePath: string,
  data: unknown,
): z.output<TSchema> {
  const result = options.schema.safeParse(data);

  if (!result.success) {
    throw new Error(
      [
        `Invalid ${options.name} frontmatter in ${filePath}:`,
        ...result.error.issues.map(formatIssue),
      ].join("\n"),
    );
  }

  return result.data;
}

function createMarkdownRenderer(
  resolveAsset: (filePath: string, value: string) => string,
) {
  const renderer = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  });
  const defaultImageRenderer =
    renderer.renderer.rules.image ??
    ((tokens, index, options, _env, self) =>
      self.renderToken(tokens, index, options));

  renderer.renderer.rules.image = (tokens, index, options, env, self) => {
    const token = tokens[index];
    const source = token.attrGet("src");
    const filePath =
      typeof env?.filePath === "string" ? env.filePath : undefined;

    if (typeof source === "string" && filePath) {
      token.attrSet("src", resolveAsset(filePath, source));
    }

    token.attrSet("loading", "lazy");
    token.attrSet("decoding", "async");

    return defaultImageRenderer(tokens, index, options, env, self);
  };

  return renderer;
}

/** Resolves `..`/`.` segments of a slash-separated path. */
function normalizeSegments(path: string) {
  return path
    .split("/")
    .reduce<string[]>((parts, part) => {
      if (!part || part === ".") return parts;
      if (part === "..") parts.pop();
      else parts.push(part);
      return parts;
    }, [])
    .join("/");
}

function resolveAssetUrl(
  filePath: string,
  value: string,
  assets: ContentAssets,
  publicAssetPrefix: string | undefined,
) {
  if (!value || externalAssetPattern.test(value)) return value;

  const separatorIndex = value.search(assetSuffixPattern);
  const reference =
    separatorIndex === -1 ? value : value.slice(0, separatorIndex);
  const suffix = separatorIndex === -1 ? "" : value.slice(separatorIndex);

  // Keep a leading "../" or "./" from the glob key so lookups match it.
  const directory = filePath.slice(0, filePath.lastIndexOf("/"));
  const leading = directory.match(/^(?:\.\.?\/)+/)?.[0] ?? "";
  const colocated =
    assets[
      `${leading}${normalizeSegments(`${directory.slice(leading.length)}/${reference}`)}`
    ];
  if (colocated) return `${colocated}${suffix}`;

  const publicPath = normalizeSegments(reference);
  if (publicAssetPrefix && publicPath.startsWith(publicAssetPrefix)) {
    return `/assets/${publicPath}${suffix}`;
  }

  return value;
}
