import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { toAppLocale } from "#/i18n";
import type {
  Collection,
  CollectionEntry,
  RenderedCollectionEntry,
} from "#/lib/content/collection";
import { type BlogFrontmatter, defineBlogCollection } from "./blog-collection";

export type BlogArticleMetadata = CollectionEntry<BlogFrontmatter>;

export type BlogArticle = RenderedCollectionEntry<BlogFrontmatter>;

let blog: Collection<BlogFrontmatter> | undefined;

// Content is static: index it once, on first use, and only on the server so
// the Markdown sources and parsers stay out of the client bundle.
const getBlog = createServerOnlyFn(
  () =>
    (blog ??= defineBlogCollection(
      import.meta.glob<string>("../content/**/*.md", {
        query: "?raw",
        import: "default",
        eager: true,
      }),
      import.meta.glob<string>(
        "../content/**/*.{png,jpg,jpeg,webp,avif,gif,svg}",
        {
          query: "?url",
          import: "default",
          eager: true,
        },
      ),
    )),
);

export const getAllBlogArticles = createServerFn({ method: "GET" })
  .validator((data: { locale?: string } | undefined) => data ?? {})
  .handler(
    async ({ data }): Promise<BlogArticleMetadata[]> =>
      getBlog().list(toAppLocale(data.locale)),
  );

export const getBlogArticle = createServerFn({ method: "GET" })
  .validator((data: { locale?: string; slug: string }) => data)
  .handler(
    async ({ data }): Promise<BlogArticle | null> =>
      getBlog().get(toAppLocale(data.locale), data.slug),
  );
