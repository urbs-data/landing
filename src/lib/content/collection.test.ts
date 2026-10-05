// @vitest-environment node
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineBlogCollection } from "#/features/blog/lib/blog-collection";
import { type ContentFiles, defineCollection } from "./collection";
import { readContentFiles } from "./node-files";

const schema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
    cover: z.string().default(""),
  })
  .strict();

function post(fields: Record<string, string>, body = "Body.") {
  const frontmatter = Object.entries(fields)
    .map(([key, value]) => `${key}: "${value}"`)
    .join("\n");
  return `---\n${frontmatter}\n---\n\n${body}\n`;
}

const files: ContentFiles = {
  "../content/es/older.md": post({
    id: "older",
    slug: "mas-viejo",
    title: "Más viejo",
    date: "2026-01-01",
  }),
  "../content/en/older.md": post({
    id: "older",
    slug: "older",
    title: "Older",
    date: "2026-01-03",
  }),
  "../content/es/newer/index.md": post(
    {
      id: "newer",
      slug: "mas-nuevo",
      title: "Más nuevo",
      date: "2026-02-01",
      cover: "./cover.webp",
    },
    "![Diagram](./diagram.png)\n\n![Public](blog/shared/chart.webp?v=2)\n\n![Remote](https://example.com/a.png)",
  ),
  "../content/es/solo.md": post({
    id: "solo",
    slug: "solo-en-espanol",
    title: "Solo",
    date: "2026-01-15",
  }),
};

const assets = {
  "../content/es/newer/cover.webp": "/build/cover-hash.webp",
  "../content/es/newer/diagram.png": "/build/diagram-hash.png",
};

function createCollection(overrides: ContentFiles = {}) {
  return defineCollection({
    name: "test",
    files: { ...files, ...overrides },
    assets,
    schema,
    routeBase: "/posts",
    assetFields: ["cover"],
    publicAssetPrefix: "blog/",
  });
}

describe("defineCollection", () => {
  it("lists a locale's entries newest first", () => {
    const collection = createCollection();

    expect(collection.list("es").map((entry) => entry.slug)).toEqual([
      "mas-nuevo",
      "solo-en-espanol",
      "mas-viejo",
    ]);
    expect(collection.list("en").map((entry) => entry.slug)).toEqual(["older"]);
  });

  it("gets an entry by its localized slug, with rendered HTML", () => {
    const collection = createCollection();
    const entry = collection.get("en", "older");

    expect(entry?.title).toBe("Older");
    expect(entry?.html).toContain("<p>Body.</p>");
    expect(collection.get("en", "mas-viejo")).toBeNull();
    expect(collection.get("es", "does-not-exist")).toBeNull();
  });

  it("pairs locales by id into localized paths", () => {
    const collection = createCollection();

    expect(collection.get("es", "mas-viejo")?.localizedPaths).toEqual({
      es: "/posts/mas-viejo",
      en: "/en/posts/older",
    });
  });

  it("only lists the locales a single-language entry exists in", () => {
    const collection = createCollection();

    expect(collection.get("es", "solo-en-espanol")?.localizedPaths).toEqual({
      es: "/posts/solo-en-espanol",
    });
  });

  it("reads folder-format entries (<locale>/<name>/index.md)", () => {
    const entry = createCollection().get("es", "mas-nuevo");

    expect(entry?.title).toBe("Más nuevo");
    expect(entry?.localizedPaths).toEqual({ es: "/posts/mas-nuevo" });
  });

  it("rewrites relative image and asset-field references", () => {
    const entry = createCollection().get("es", "mas-nuevo");

    expect(entry?.cover).toBe("/build/cover-hash.webp");
    expect(entry?.html).toContain(
      '<img src="/build/diagram-hash.png" alt="Diagram" loading="lazy" decoding="async">',
    );
    expect(entry?.html).toContain('src="/assets/blog/shared/chart.webp?v=2"');
    expect(entry?.html).toContain('src="https://example.com/a.png"');
  });

  it("reports the file and field of invalid frontmatter", () => {
    expect(() =>
      createCollection({
        "../content/en/broken.md": post({
          id: "broken",
          slug: "broken",
          title: "Broken",
          date: "March 3rd",
        }),
      }),
    ).toThrow(
      /Invalid test frontmatter in \.\.\/content\/en\/broken\.md:\n- date: Expected YYYY-MM-DD/,
    );
  });

  it("rejects duplicate slugs within a locale", () => {
    expect(() =>
      createCollection({
        "../content/en/clash.md": post({
          id: "clash",
          slug: "older",
          title: "Clash",
          date: "2026-01-01",
        }),
      }),
    ).toThrow(/Duplicate test slug "older"/);
  });

  it("groups entries by id for the sitemap, with the latest date", () => {
    const entries = createCollection().entries();

    expect(entries).toHaveLength(3);
    expect(entries.find((entry) => entry.id === "older")).toEqual({
      id: "older",
      localizedPaths: { es: "/posts/mas-viejo", en: "/en/posts/older" },
      lastmod: "2026-01-03",
    });
  });

  it("ignores files outside a locale folder", () => {
    const collection = createCollection({
      "../content/README.md": "# Notes",
      "../content/fr/older.md": post({
        id: "older",
        slug: "plus-vieux",
        title: "Plus vieux",
        date: "2026-01-01",
      }),
    });

    expect(collection.entries()).toHaveLength(3);
  });
});

it("parses the real blog content", async () => {
  const blog = defineBlogCollection(
    await readContentFiles(
      join(import.meta.dirname, "../../features/blog/content"),
    ),
  );

  expect(blog.entries().length).toBeGreaterThan(0);
});
