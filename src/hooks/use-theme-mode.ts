import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
};

const THEME_STORAGE_KEY = "theme";
const DEFAULT_THEME_STATE: ThemeState = {
  mode: "light",
  resolvedTheme: "light",
};

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "auto";
}

function getStoredThemeMode(): ThemeMode {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(stored) ? stored : "light";
}

function getDocumentTheme(): ResolvedTheme | null {
  if (typeof document === "undefined") {
    return null;
  }

  if (document.documentElement.classList.contains("dark")) {
    return "dark";
  }

  if (document.documentElement.classList.contains("light")) {
    return "light";
  }

  return null;
}

function resolveThemeMode(mode: ThemeMode): ResolvedTheme {
  if (mode !== "auto") {
    return mode;
  }

  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getThemeState(): ThemeState {
  const mode = getStoredThemeMode();

  return {
    mode,
    resolvedTheme: getDocumentTheme() ?? resolveThemeMode(mode),
  };
}

function applyThemeMode(mode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const resolved = resolveThemeMode(mode);
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(resolved);

  if (mode === "auto") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", mode);
  }

  root.style.colorScheme = resolved;
}

/**
 * Subscribes to the document color theme: reads/writes the `"theme"` key in `localStorage`,
 * applies `light`/`dark` classes plus `data-theme` and `colorScheme` on `<html>`, and stays
 * in sync via `MutationObserver`, system `prefers-color-scheme`, and cross-tab `storage` events.
 */
export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeState>(DEFAULT_THEME_STATE);

  const syncTheme = useCallback(() => {
    setTheme(getThemeState());
  }, []);

  const setThemeMode = useCallback((nextMode: ThemeMode) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    }

    applyThemeMode(nextMode);
    setTheme(getThemeState());
  }, []);

  useEffect(() => {
    const syncAppliedTheme = () => {
      applyThemeMode(getStoredThemeMode());
      syncTheme();
    };

    syncAppliedTheme();

    const observer =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(syncTheme);

    observer?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const media =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    const onSystemThemeChange = () => {
      if (getStoredThemeMode() === "auto") {
        applyThemeMode("auto");
      }

      syncTheme();
    };

    media?.addEventListener("change", onSystemThemeChange);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== THEME_STORAGE_KEY) {
        return;
      }

      syncAppliedTheme();
    };

    window.addEventListener("storage", onStorage);

    return () => {
      observer?.disconnect();
      media?.removeEventListener("change", onSystemThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [syncTheme]);

  return {
    /** User preference (`light`, `dark`, or `auto` to follow the OS/browser). */
    mode: theme.mode,
    /** Effective palette (`light` or `dark`), including resolution of `auto`
     * from `prefers-color-scheme` when the document does not already encode a theme class. */
    resolvedTheme: theme.resolvedTheme,
    /** Persists the choice, updates `<html>` (classes / `data-theme` / `colorScheme`),
     * and refreshes hook state so consumers re-render with the new `mode` and `resolvedTheme`. */
    setThemeMode,
    /** `true` when `resolvedTheme` is `"dark"`. */
    isDark: theme.resolvedTheme === "dark",
    /** `true` when `resolvedTheme` is `"light"`. */
    isLight: theme.resolvedTheme === "light",
  };
}

/** Same return shape as {@link useThemeMode}; exported under an alternate name. */
export const useCurrentTheme = useThemeMode;
