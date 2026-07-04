import { createServerFn } from "@tanstack/react-start";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { getSupportedLocale } from "#/features/landing/lib/seo";

type SupportedLocale = ReturnType<typeof getSupportedLocale>;

export type BlogArticleMetadata = {
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

function getArticleSlug(path: string) {
  return path.split("/").at(-1)?.replace(/\.md$/, "") ?? "";
}

function getArticleLocale(path: string) {
  return path.split("/").at(-2) ?? "";
}

function getMarkdownArticles(locale: SupportedLocale) {
  return Object.entries(markdownFiles).reduce<Record<string, string>>(
    (articles, [path, content]) => {
      if (getArticleLocale(path) !== locale || typeof content !== "string") {
        return articles;
      }

      const slug = getArticleSlug(path);

      if (slug) articles[slug] = content;
      return articles;
    },
    {},
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
  slug: string,
  fileContents: string,
): BlogArticleMetadata {
  const { data } = matter(fileContents);

  return {
    slug,
    title: readStringField(data, "title"),
    description: readStringField(data, "description"),
    date: readStringField(data, "date"),
    author: readStringField(data, "author"),
    readTime: readStringField(data, "readTime"),
    tags: readTags(data),
  };
}

function parseArticle(slug: string, fileContents: string): BlogArticle {
  const { content } = matter(fileContents);

  return {
    ...parseArticleMetadata(slug, fileContents),
    html: markdown.render(content),
  };
}

function getAllBlogArticlesForLocale(locale: SupportedLocale) {
  return Object.entries(getMarkdownArticles(locale))
    .map(([slug, content]) => parseArticleMetadata(slug, content))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getBlogArticleForLocale(locale: SupportedLocale, slug: string) {
  const articles = getMarkdownArticles(locale);
  const article = articles[slug];

  return article ? parseArticle(slug, article) : null;
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
