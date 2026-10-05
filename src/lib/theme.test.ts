// @vitest-environment node
import { describe, expect, it } from "vitest";
import { applyStoredTheme, THEME_STORAGE_KEY, themeInitScript } from "./theme";

function createRoot() {
  const classes = new Set<string>(["light", "bg-background"]);
  const attributes = new Map<string, string>([["data-theme", "light"]]);

  return {
    classes,
    attributes,
    classList: {
      add: (...tokens: string[]) => {
        for (const token of tokens) classes.add(token);
      },
      remove: (...tokens: string[]) => {
        for (const token of tokens) classes.delete(token);
      },
    },
    setAttribute: (name: string, value: string) => {
      attributes.set(name, value);
    },
    removeAttribute: (name: string) => {
      attributes.delete(name);
    },
    style: { colorScheme: "light" },
  };
}

function storageWith(value: string | null) {
  return {
    getItem: (key: string) => (key === THEME_STORAGE_KEY ? value : null),
  };
}

describe("applyStoredTheme", () => {
  it("defaults to light when nothing (or garbage) is stored", () => {
    for (const storage of [null, storageWith(null), storageWith("purple")]) {
      const root = createRoot();
      expect(applyStoredTheme(root, storage, THEME_STORAGE_KEY, true)).toEqual({
        mode: "light",
        resolvedTheme: "light",
      });
      expect([...root.classes]).toEqual(["bg-background", "light"]);
      expect(root.attributes.get("data-theme")).toBe("light");
      expect(root.style.colorScheme).toBe("light");
    }
  });

  it("applies an explicit dark preference regardless of the OS", () => {
    const root = createRoot();
    const state = applyStoredTheme(
      root,
      storageWith("dark"),
      THEME_STORAGE_KEY,
      false,
    );

    expect(state).toEqual({ mode: "dark", resolvedTheme: "dark" });
    expect(root.classes.has("dark")).toBe(true);
    expect(root.classes.has("light")).toBe(false);
    expect(root.classes.has("bg-background")).toBe(true);
    expect(root.attributes.get("data-theme")).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
  });

  it("follows the OS in auto mode and drops data-theme", () => {
    for (const prefersDark of [true, false]) {
      const root = createRoot();
      const resolved = prefersDark ? "dark" : "light";
      const state = applyStoredTheme(
        root,
        storageWith("auto"),
        THEME_STORAGE_KEY,
        prefersDark,
      );

      expect(state).toEqual({ mode: "auto", resolvedTheme: resolved });
      expect(root.classes.has(resolved)).toBe(true);
      expect(root.attributes.has("data-theme")).toBe(false);
      expect(root.style.colorScheme).toBe(resolved);
    }
  });

  it("survives storage that throws (blocked cookies / private mode)", () => {
    const root = createRoot();
    const throwing = {
      getItem: () => {
        throw new Error("SecurityError");
      },
    };

    expect(applyStoredTheme(root, throwing, THEME_STORAGE_KEY, true)).toEqual({
      mode: "light",
      resolvedTheme: "light",
    });
  });
});

describe("themeInitScript", () => {
  function runScript(window: Record<string, unknown>) {
    const root = createRoot();
    new Function("window", "document", themeInitScript)(window, {
      documentElement: root,
    });
    return root;
  }

  it("is self-contained and applies the stored theme", () => {
    const root = runScript({
      localStorage: storageWith("auto"),
      matchMedia: () => ({ matches: true }),
    });

    expect(root.classes.has("dark")).toBe(true);
    expect(root.attributes.has("data-theme")).toBe(false);
  });

  it("never throws when storage access or matchMedia is unavailable", () => {
    const window = {};
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("SecurityError");
      },
    });

    expect(() => runScript(window)).not.toThrow();
    expect(runScript(window).classes.has("light")).toBe(true);
  });
});
