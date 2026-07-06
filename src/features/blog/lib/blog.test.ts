// @vitest-environment node

import { expect, it } from "vitest";
import { resolveBlogAssetUrl } from "./blog";

const articlePath = "../content/es/company-evolution-is-designed.md";

it("resolves public blog image aliases from Markdown image references", () => {
  expect(
    resolveBlogAssetUrl(
      articlePath,
      "./blog/company-evolution-is-designed/cover.webp",
    ),
  ).toBe("/assets/blog/company-evolution-is-designed/cover.webp");
});

it("preserves suffixes when resolving public blog image aliases", () => {
  expect(
    resolveBlogAssetUrl(articlePath, "blog/post/image.webp?size=large"),
  ).toBe("/assets/blog/post/image.webp?size=large");
  expect(
    resolveBlogAssetUrl(articlePath, "./blog/post/image.webp#caption"),
  ).toBe("/assets/blog/post/image.webp#caption");
});

it("preserves absolute and external image references", () => {
  expect(resolveBlogAssetUrl(articlePath, "/assets/blog/post/image.webp")).toBe(
    "/assets/blog/post/image.webp",
  );
  expect(
    resolveBlogAssetUrl(articlePath, "https://example.com/image.webp"),
  ).toBe("https://example.com/image.webp");
});
