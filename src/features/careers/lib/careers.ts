import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { toAppLocale } from "#/i18n";
import type {
  Collection,
  CollectionEntry,
  RenderedCollectionEntry,
} from "#/lib/content/collection";
import {
  type CareerFrontmatter,
  defineCareersCollection,
} from "./careers-collection";

export type CareerPostMetadata = CollectionEntry<CareerFrontmatter>;

export type CareerPost = RenderedCollectionEntry<CareerFrontmatter>;

let careers: Collection<CareerFrontmatter> | undefined;

// Content is static: index it once, on first use, and only on the server so
// the Markdown sources and parsers stay out of the client bundle.
const getCareers = createServerOnlyFn(
  () =>
    (careers ??= defineCareersCollection(
      import.meta.glob<string>("../content/**/*.md", {
        query: "?raw",
        import: "default",
        eager: true,
      }),
    )),
);

export const getAllCareerPosts = createServerFn({ method: "GET" })
  .validator((data: { locale?: string } | undefined) => data ?? {})
  .handler(
    async ({ data }): Promise<CareerPostMetadata[]> =>
      getCareers().list(toAppLocale(data.locale)),
  );

export const getCareerPost = createServerFn({ method: "GET" })
  .validator((data: { locale?: string; slug: string }) => data)
  .handler(
    async ({ data }): Promise<CareerPost | null> =>
      getCareers().get(toAppLocale(data.locale), data.slug),
  );
