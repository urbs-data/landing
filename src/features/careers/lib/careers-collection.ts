/**
 * Careers content definition. Runtime-agnostic (no Vite APIs) so the sitemap
 * script can build the same collection from the file system.
 */
import { z } from "zod";
import {
  type ContentFiles,
  defineCollection,
} from "#/lib/content/collection.ts";

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
    /** External application form; empty falls back to a mailto link. */
    applyUrl: z.union([z.literal(""), z.url()]).default(""),
  })
  .strict();

export type CareerFrontmatter = z.output<typeof careerFrontmatterSchema>;

export const CAREERS_ROUTE_BASE = "/careers";

export function defineCareersCollection(files: ContentFiles) {
  return defineCollection({
    name: "career",
    files,
    schema: careerFrontmatterSchema,
    routeBase: CAREERS_ROUTE_BASE,
  });
}
