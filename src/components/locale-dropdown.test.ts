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

  it("falls back to Paraglide locale switching for unlocalized routes", () => {
    expect(getLocaleChangeAction("en")).toEqual({
      kind: "set-locale",
      locale: "en",
    });
  });
});
