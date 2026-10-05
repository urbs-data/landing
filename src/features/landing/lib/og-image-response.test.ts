// @vitest-environment node
import { describe, expect, it } from "vitest";
import { sanitizeOgText } from "./og-image-response";

describe("sanitizeOgText", () => {
  it("returns undefined for missing or blank input", () => {
    expect(sanitizeOgText(null, 10)).toBeUndefined();
    expect(sanitizeOgText(" \n\t ", 10)).toBeUndefined();
  });

  it("strips control/bidi characters and collapses whitespace", () => {
    expect(sanitizeOgText("  Hola\u0000\n‮mundo  ", 50)).toBe("Hola mundo");
  });

  it("clamps long text with an ellipsis within the limit", () => {
    const result = sanitizeOgText("a".repeat(300), 120);
    expect(result).toHaveLength(120);
    expect(result?.endsWith("…")).toBe(true);
  });

  it("never splits surrogate pairs", () => {
    const result = sanitizeOgText("😀".repeat(10), 5);
    expect(Array.from(result ?? "")).toEqual(["😀", "😀", "😀", "😀", "…"]);
  });
});
