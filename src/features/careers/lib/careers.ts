import { createServerFn } from "@tanstack/react-start";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { getSupportedLocale } from "#/features/landing/lib/seo";

type SupportedLocale = ReturnType<typeof getSupportedLocale>;

export type CareerPostMetadata = {
  slug: string;
  title: string;
  description: string;
  date: string;
  team: string;
  location: string;
  type: string;
  applyUrl: string;
};

export type CareerPost = CareerPostMetadata & {
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

function getPostSlug(path: string) {
  return path.split("/").at(-1)?.replace(/\.md$/, "") ?? "";
}

function getPostLocale(path: string) {
  return path.split("/").at(-2) ?? "";
}

function getMarkdownPosts(locale: SupportedLocale) {
  return Object.entries(markdownFiles).reduce<Record<string, string>>(
    (posts, [path, content]) => {
      if (getPostLocale(path) !== locale || typeof content !== "string") {
        return posts;
      }

      const slug = getPostSlug(path);

      if (slug) posts[slug] = content;
      return posts;
    },
    {},
  );
}

function readStringField(data: Record<string, unknown>, field: string) {
  const value = data[field];
  return typeof value === "string" ? value : "";
}

function parsePostMetadata(
  slug: string,
  fileContents: string,
): CareerPostMetadata {
  const { data } = matter(fileContents);

  return {
    slug,
    title: readStringField(data, "title"),
    description: readStringField(data, "description"),
    date: readStringField(data, "date"),
    team: readStringField(data, "team"),
    location: readStringField(data, "location"),
    type: readStringField(data, "type"),
    applyUrl: readStringField(data, "applyUrl"),
  };
}

function parsePost(slug: string, fileContents: string): CareerPost {
  const { content } = matter(fileContents);

  return {
    ...parsePostMetadata(slug, fileContents),
    html: markdown.render(content),
  };
}

function getAllCareerPostsForLocale(locale: SupportedLocale) {
  return Object.entries(getMarkdownPosts(locale))
    .map(([slug, content]) => parsePostMetadata(slug, content))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getCareerPostForLocale(locale: SupportedLocale, slug: string) {
  const posts = getMarkdownPosts(locale);
  const post = posts[slug];

  return post ? parsePost(slug, post) : null;
}

export const getAllCareerPosts = createServerFn({ method: "GET" })
  .validator((data: { locale?: string } | undefined) => data ?? {})
  .handler(async ({ data }) =>
    getAllCareerPostsForLocale(normalizeLocale(data.locale)),
  );

export const getCareerPost = createServerFn({ method: "GET" })
  .validator((data: { locale?: string; slug: string }) => data)
  .handler(async ({ data }) =>
    getCareerPostForLocale(normalizeLocale(data.locale), data.slug),
  );
