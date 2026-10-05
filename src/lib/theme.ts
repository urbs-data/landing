export type ThemeMode = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

export type ThemeState = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
};

export const THEME_STORAGE_KEY = "theme";

/** What the server renders on `<html>` before the init script runs. */
export const DEFAULT_THEME_STATE: ThemeState = {
  mode: "light",
  resolvedTheme: "light",
};

export const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

type ThemeRoot = {
  classList: Pick<DOMTokenList, "add" | "remove">;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  style: { colorScheme: string };
};

type ThemeStorage = Pick<Storage, "getItem">;

/**
 * Reads the stored theme preference and applies it to `root` (`light`/`dark`
 * class, `data-theme`, `color-scheme`).
 *
 * This is the single source of truth for theme application: it runs both
 * inline in `<head>` (via {@link themeInitScript}, before first paint) and from
 * `useThemeMode`. It is serialised with `Function#toString`, so it MUST stay
 * self-contained — no references to imports, module constants or helpers.
 */
export function applyStoredTheme(
  root: ThemeRoot,
  storage: ThemeStorage | null,
  storageKey: string,
  prefersDark: boolean,
): ThemeState {
  let stored: string | null = null;
  try {
    stored = storage ? storage.getItem(storageKey) : null;
  } catch (_error) {
    stored = null;
  }
  const mode: ThemeMode =
    stored === "light" || stored === "dark" || stored === "auto"
      ? stored
      : "light";
  const resolvedTheme: ResolvedTheme =
    mode === "auto" ? (prefersDark ? "dark" : "light") : mode;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  if (mode === "auto") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", mode);
  }
  root.style.colorScheme = resolvedTheme;

  return { mode: mode, resolvedTheme: resolvedTheme };
}

/**
 * Inline `<head>` script that applies the stored theme before first paint,
 * so reloading in dark mode never flashes light.
 */
export const themeInitScript = `(function(){try{var s=null;try{s=window.localStorage}catch(e){}var d=typeof window.matchMedia==="function"&&window.matchMedia(${JSON.stringify(PREFERS_DARK_QUERY)}).matches;(${applyStoredTheme.toString()})(document.documentElement,s,${JSON.stringify(THEME_STORAGE_KEY)},d)}catch(e){}})();`;
