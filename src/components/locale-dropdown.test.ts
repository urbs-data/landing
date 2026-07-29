import { describe, expect, it } from "vitest";
import { getLocaleChangeAction } from "./locale-change";

describe("getLocaleChangeAction", () => {
  it("uses document navigation when a localized route exists", () => {
    expect(
      getLocaleChangeAction("en", {
        en: "/en/blog/company-evolution-is-designed",
        es: "/blog/la-evolucion-de-la-empresa-se-disena",
      }),
    ).toEqual({
      kind: "navigate",
      href: "/en/blog/company-evolution-is-designed",
    });
  });

  it("uses document navigation for the self-service article", () => {
    expect(
      getLocaleChangeAction("en", {
        en: "/en/blog/shortening-the-distance-self-service",
        es: "/blog/acortando-la-distancia-del-self-service",
      }),
    ).toEqual({
      kind: "navigate",
      href: "/en/blog/shortening-the-distance-self-service",
    });
  });

  it("falls back to Paraglide locale switching for unlocalized routes", () => {
    expect(getLocaleChangeAction("en")).toEqual({
      kind: "set-locale",
      locale: "en",
    });
  });
});
