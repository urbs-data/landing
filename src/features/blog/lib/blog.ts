import { createServerFn } from "@tanstack/react-start";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { type ZodIssue, z } from "zod";
import { getSupportedLocale } from "#/features/landing/lib/seo";
import { type AppLocale, baseLocale, isLocale } from "#/i18n";

type SupportedLocale = ReturnType<typeof getSupportedLocale>;

const blogFrontmatterSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
    author: z.string().min(1),
    readTime: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1),
    coverImage: z.string().default(""),
    coverImageAlt: z.string().default(""),
  })
  .strict();

type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

export type BlogArticleMetadata = Omit<
  BlogFrontmatter,
  "coverImage" | "coverImageAlt"
> & {
  coverImage: string;
  coverImageAlt: string;
  localizedPaths: Partial<Record<AppLocale, string>>;
};

export type BlogArticle = BlogArticleMetadata & {
  html: string;
};

const markdownFiles = import.meta.glob("../content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const imageFiles = import.meta.glob<string>(
  "../content/**/*.{png,jpg,jpeg,webp,avif,gif,svg}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);

const markdown = createMarkdownRenderer();

function createMarkdownRenderer() {
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
    const sourceIndex = token.attrIndex("src");

    if (sourceIndex >= 0 && token.attrs) {
      const filePath =
        typeof env?.filePath === "string" ? env.filePath : undefined;
      const source = token.attrs[sourceIndex]?.[1] ?? "";
      token.attrs[sourceIndex][1] = filePath
        ? resolveBlogAssetUrl(filePath, source)
        : source;
    }

    token.attrSet("loading", "lazy");
    token.attrSet("decoding", "async");

    return defaultImageRenderer(tokens, index, options, env, self);
  };

  return renderer;
}

const externalAssetPattern = /^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/i;

function shouldPreserveAssetUrl(value: string) {
  return !value || externalAssetPattern.test(value);
}

function normalizeBlogPath(path: string) {
  return path
    .split("/")
    .reduce<string[]>((parts, part) => {
      if (!part || part === ".") return parts;
      if (part === "..") {
        parts.pop();
        return parts;
      }
      parts.push(part);
      return parts;
    }, [])
    .join("/");
}

function getContainingDirectory(path: string) {
  return path.slice(0, path.lastIndexOf("/"));
}

function splitAssetReference(value: string) {
  const separatorIndex = value.search(/[?#]/);

  if (separatorIndex === -1) {
    return { path: value, suffix: "" };
  }

  return {
    path: value.slice(0, separatorIndex),
    suffix: value.slice(separatorIndex),
  };
}

function resolvePublicBlogAssetUrl(value: string) {
  const path = normalizeBlogPath(value);

  return path.startsWith("blog/") ? `/assets/${path}` : null;
}

export function resolveBlogAssetUrl(filePath: string, value: string) {
  if (shouldPreserveAssetUrl(value)) return value;

  const asset = splitAssetReference(value);
  const path = normalizeBlogPath(
    `${getContainingDirectory(filePath)}/${asset.path}`,
  );
  const resolved = imageFiles[path];
  const publicBlogAssetUrl = resolvePublicBlogAssetUrl(asset.path);

  if (resolved) return `${resolved}${asset.suffix}`;
  if (publicBlogAssetUrl) return `${publicBlogAssetUrl}${asset.suffix}`;

  return value;
}

type MarkdownArticleSource = {
  filePath: string;
  content: string;
};

const indexPostFileName = "index.md";

function normalizeLocale(locale: string | undefined): SupportedLocale {
  return getSupportedLocale(locale ?? "es");
}

function getArticlePathDetails(path: string) {
  const parts = path.split("/");
  const fileName = parts.at(-1) ?? "";
  const isIndexPost = fileName === indexPostFileName;

  return {
    fileId: isIndexPost ? (parts.at(-2) ?? "") : fileName.replace(/\.md$/, ""),
    locale: isIndexPost ? (parts.at(-3) ?? "") : (parts.at(-2) ?? ""),
  };
}

function localizeBlogPath(locale: AppLocale, slug: string) {
  const path = `/blog/${slug}`;
  return locale === baseLocale ? path : `/${locale}${path}`;
}

function getMarkdownArticles(locale: SupportedLocale) {
  return Object.entries(markdownFiles).reduce<MarkdownArticleSource[]>(
    (articles, [path, content]) => {
      const details = getArticlePathDetails(path);

      if (details.locale !== locale || typeof content !== "string") {
        return articles;
      }

      if (details.fileId) {
        articles.push({ filePath: path, content });
      }

      return articles;
    },
    [],
  );
}

function formatIssuePath(issue: ZodIssue) {
  return issue.path.length > 0 ? issue.path.join(".") : "frontmatter";
}

function formatFrontmatterIssue(issue: ZodIssue) {
  return `- ${formatIssuePath(issue)}: ${issue.message}`;
}

function readBlogFrontmatter(filePath: string, data: unknown) {
  const result = blogFrontmatterSchema.safeParse(data);

  if (!result.success) {
    throw new Error(
      [
        `Invalid blog frontmatter in ${filePath}:`,
        ...result.error.issues.map(formatFrontmatterIssue),
      ].join("\n"),
    );
  }

  return result.data;
}

function getBlogArticleLocalizedPaths(id: string) {
  return Object.entries(markdownFiles).reduce<
    Partial<Record<AppLocale, string>>
  >((paths, [path, content]) => {
    const details = getArticlePathDetails(path);

    if (!isLocale(details.locale) || typeof content !== "string") {
      return paths;
    }

    const { data } = matter(content);
    const frontmatter = readBlogFrontmatter(path, data);

    if (frontmatter.id === id) {
      paths[details.locale] = localizeBlogPath(
        details.locale,
        frontmatter.slug,
      );
    }

    return paths;
  }, {});
}

function parseArticleMetadata(
  filePath: string,
  fileContents: string,
): BlogArticleMetadata {
  const { data } = matter(fileContents);
  const frontmatter = readBlogFrontmatter(filePath, data);
  const coverImage = resolveBlogAssetUrl(filePath, frontmatter.coverImage);

  return {
    id: frontmatter.id,
    slug: frontmatter.slug,
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    author: frontmatter.author,
    readTime: frontmatter.readTime,
    coverImage,
    coverImageAlt: frontmatter.coverImageAlt,
    localizedPaths: getBlogArticleLocalizedPaths(frontmatter.id),
    tags: frontmatter.tags,
  };
}

function parseArticle(filePath: string, fileContents: string): BlogArticle {
  const { content } = matter(fileContents);

  return {
    ...parseArticleMetadata(filePath, fileContents),
    html: markdown.render(content, { filePath }),
  };
}

function getAllBlogArticlesForLocale(locale: SupportedLocale) {
  return getMarkdownArticles(locale)
    .map(({ filePath, content }) => parseArticleMetadata(filePath, content))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getBlogArticleForLocale(locale: SupportedLocale, slug: string) {
  const article = getMarkdownArticles(locale).find(
    ({ filePath, content }) =>
      parseArticleMetadata(filePath, content).slug === slug,
  );

  return article ? parseArticle(article.filePath, article.content) : null;
}

export const getAllBlogArticles = createServerFn({ method: "GET" })
  .validator((data: { locale?: string } | undefined) => data ?? {})
  .handler(async ({ data }) =>
    getAllBlogArticlesForLocale(normalizeLocale(data.locale)),
  );

export const getBlogArticle = createServerFn({ method: "GET" })
  .validator((data: { locale?: string; slug: string }) => data)
  .handler(async ({ data }) =>
    getBlogArticleForLocale(normalizeLocale(data.locale), data.slug),
  );
