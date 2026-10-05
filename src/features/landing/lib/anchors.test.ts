import { afterEach, describe, expect, it } from "vitest";
import { getLocale, overwriteGetLocale } from "#/paraglide/runtime";
import { getLandingAnchors } from "./anchors";

const originalGetLocale = getLocale;

afterEach(() => {
  overwriteGetLocale(originalGetLocale);
});

describe("getLandingAnchors", () => {
  it("returns unprefixed router targets with Spanish section ids", () => {
    overwriteGetLocale(() => "es");
    const { links, hrefs } = getLandingAnchors();

    expect(links.services).toEqual({ to: "/", hash: "servicios" });
    expect(links.contact).toEqual({ to: "/", hash: "contacto" });
    expect(links.blog).toEqual({ to: "/blog", hash: undefined });
    expect(hrefs.contact).toBe("/#contacto");
    expect(hrefs.careers).toBe("/careers");
  });

  it("keeps router targets unprefixed in English; plain hrefs get /en", () => {
    overwriteGetLocale(() => "en");
    const { links, hrefs } = getLandingAnchors();

    // The router's Paraglide rewrite adds the /en prefix when rendering <Link>.
    expect(links.pymes).toEqual({ to: "/", hash: "smbs" });
    expect(links.careers).toEqual({ to: "/careers", hash: undefined });
    expect(hrefs.pymes).toBe("/en/#smbs");
    expect(hrefs.blog).toBe("/en/blog");
  });
});
