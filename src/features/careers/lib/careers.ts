import { createServerFn } from "@tanstack/react-start";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { type ZodIssue, z } from "zod";
import { getSupportedLocale } from "#/features/landing/lib/seo";
import { type AppLocale, baseLocale, isLocale } from "#/i18n";

type SupportedLocale = ReturnType<typeof getSupportedLocale>;

const careerFrontmatterSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
    team: z.string().min(1),
    location: z.string().min(1),
    type: z.string().min(1),
    applyUrl: z.string().default(""),
  })
  .strict();

export type CareerPostMetadata = z.infer<typeof careerFrontmatterSchema> & {
  localizedPaths: Partial<Record<AppLocale, string>>;
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

function getPostLocale(path: string) {
  return path.split("/").at(-2) ?? "";
}

function localizeCareerPath(locale: AppLocale, slug: string) {
  const path = `/careers/${slug}`;
  return locale === baseLocale ? path : `/${locale}${path}`;
}

function getMarkdownPosts(locale: SupportedLocale) {
  return Object.entries(markdownFiles).reduce<
    Array<{ filePath: string; content: string }>
  >((posts, [path, content]) => {
    if (getPostLocale(path) !== locale || typeof content !== "string") {
      return posts;
    }

    posts.push({ filePath: path, content });
    return posts;
  }, []);
}

function formatIssuePath(issue: ZodIssue) {
  return issue.path.length > 0 ? issue.path.join(".") : "frontmatter";
}

function formatFrontmatterIssue(issue: ZodIssue) {
  return `- ${formatIssuePath(issue)}: ${issue.message}`;
}

function readCareerFrontmatter(filePath: string, data: unknown) {
  const result = careerFrontmatterSchema.safeParse(data);

  if (!result.success) {
    throw new Error(
      [
        `Invalid career frontmatter in ${filePath}:`,
        ...result.error.issues.map(formatFrontmatterIssue),
      ].join("\n"),
    );
  }

  return result.data;
}

function getCareerPostLocalizedPaths(id: string) {
  return Object.entries(markdownFiles).reduce<
    Partial<Record<AppLocale, string>>
  >((paths, [path, content]) => {
    const locale = getPostLocale(path);

    if (!isLocale(locale) || typeof content !== "string") {
      return paths;
    }

    const { data } = matter(content);
    const frontmatter = readCareerFrontmatter(path, data);

    if (frontmatter.id === id) {
      paths[locale] = localizeCareerPath(locale, frontmatter.slug);
    }

    return paths;
  }, {});
}

function parsePostMetadata(
  filePath: string,
  fileContents: string,
): CareerPostMetadata {
  const { data } = matter(fileContents);
  const frontmatter = readCareerFrontmatter(filePath, data);

  return {
    ...frontmatter,
    localizedPaths: getCareerPostLocalizedPaths(frontmatter.id),
  };
}

function parsePost(filePath: string, fileContents: string): CareerPost {
  const { content } = matter(fileContents);

  return {
    ...parsePostMetadata(filePath, fileContents),
    html: markdown.render(content),
  };
}

function getAllCareerPostsForLocale(locale: SupportedLocale) {
  return getMarkdownPosts(locale)
    .map(({ filePath, content }) => parsePostMetadata(filePath, content))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getCareerPostForLocale(locale: SupportedLocale, slug: string) {
  const post = getMarkdownPosts(locale).find(
    ({ filePath, content }) =>
      parsePostMetadata(filePath, content).slug === slug,
  );

  return post ? parsePost(post.filePath, post.content) : null;
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
