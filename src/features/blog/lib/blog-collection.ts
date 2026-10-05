/**
 * Blog content definition. Runtime-agnostic (no Vite APIs) so the sitemap
 * script can build the same collection from the file system.
 */
import { z } from "zod";
import {
  type ContentAssets,
  type ContentFiles,
  defineCollection,
} from "#/lib/content/collection.ts";

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

export type BlogFrontmatter = z.output<typeof blogFrontmatterSchema>;

export const BLOG_ROUTE_BASE = "/blog";

export function defineBlogCollection(
  files: ContentFiles,
  assets?: ContentAssets,
) {
  return defineCollection({
    name: "blog",
    files,
    assets,
    schema: blogFrontmatterSchema,
    routeBase: BLOG_ROUTE_BASE,
    assetFields: ["coverImage"],
    publicAssetPrefix: "blog/",
  });
}
