import { createServerFn } from "@tanstack/react-start";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { getSupportedLocale } from "#/features/landing/lib/seo";

type SupportedLocale = ReturnType<typeof getSupportedLocale>;

export type BlogArticleMetadata = {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  readTime: string;
  tags: string[];
};

export type BlogArticle = BlogArticleMetadata & {
  html: string;
};

const markdownFiles = import.meta.glob("../content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

function normalizeLocale(locale: string | undefined): SupportedLocale {
  return getSupportedLocale(locale ?? "es");
}

function getArticleFileId(path: string) {
  return path.split("/").at(-1)?.replace(/\.md$/, "") ?? "";
}

function getArticleLocale(path: string) {
  return path.split("/").at(-2) ?? "";
}

function getMarkdownArticles(locale: SupportedLocale) {
  return Object.entries(markdownFiles).reduce<
    Array<{ fileId: string; content: string }>
  >(
    (articles, [path, content]) => {
      if (getArticleLocale(path) !== locale || typeof content !== "string") {
        return articles;
      }

      const fileId = getArticleFileId(path);

      if (fileId) articles.push({ fileId, content });
      return articles;
    },
    [],
  );
}

function readStringField(data: Record<string, unknown>, field: string) {
  const value = data[field];
  return typeof value === "string" ? value : "";
}

function readTags(data: Record<string, unknown>) {
  const tags = data.tags;

  if (!Array.isArray(tags)) return [];

  return tags.filter((tag): tag is string => typeof tag === "string");
}

function parseArticleMetadata(
  fileId: string,
  fileContents: string,
): BlogArticleMetadata {
  const { data } = matter(fileContents);
  const id = readStringField(data, "id") || fileId;

  return {
    id,
    slug: readStringField(data, "slug") || id,
    title: readStringField(data, "title"),
    description: readStringField(data, "description"),
    date: readStringField(data, "date"),
    author: readStringField(data, "author"),
    readTime: readStringField(data, "readTime"),
    tags: readTags(data),
  };
}

function parseArticle(fileId: string, fileContents: string): BlogArticle {
  const { content } = matter(fileContents);

  return {
    ...parseArticleMetadata(fileId, fileContents),
    html: markdown.render(content),
  };
}

function getAllBlogArticlesForLocale(locale: SupportedLocale) {
  return getMarkdownArticles(locale)
    .map(({ fileId, content }) => parseArticleMetadata(fileId, content))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getBlogArticleForLocale(locale: SupportedLocale, slug: string) {
  const article = getMarkdownArticles(locale).find(
    ({ fileId, content }) => parseArticleMetadata(fileId, content).slug === slug,
  );

  return article ? parseArticle(article.fileId, article.content) : null;
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
