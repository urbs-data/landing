// @vitest-environment node
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { getSocialAssetBytes } from "#/features/social/lib/social-asset-files.server";
import { socialAssetKeys } from "#/features/social/lib/social-assets";

describe("getSocialAssetBytes", () => {
  it.each(socialAssetKeys)("serves the bundled %s PNG bytes", async (key) => {
    const source = await readFile(
      new URL(`../assets/${key}.png`, import.meta.url),
    );

    expect(Buffer.from(getSocialAssetBytes(key)).equals(source)).toBe(true);
  });
});
