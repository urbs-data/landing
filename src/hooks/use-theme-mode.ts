import { useSyncExternalStore } from "react";
import {
  applyStoredTheme,
  DEFAULT_THEME_STATE,
  PREFERS_DARK_QUERY,
  type ResolvedTheme,
  THEME_STORAGE_KEY,
  type ThemeMode,
  type ThemeState,
} from "#/lib/theme";

export type { ResolvedTheme, ThemeMode } from "#/lib/theme";

/* -------------------------------------------------------------------------- */
/*  Module-level store: one set of DOM/media/storage listeners for the whole  */
/*  app, installed on the first subscriber and torn down after the last.      */
/* -------------------------------------------------------------------------- */

const listeners = new Set<() => void>();
let snapshot: ThemeState = DEFAULT_THEME_STATE;
let teardown: (() => void) | null = null;

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getMediaQuery() {
  return typeof window.matchMedia === "function"
    ? window.matchMedia(PREFERS_DARK_QUERY)
    : null;
}

function readDocumentTheme(): ResolvedTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function publish(next: ThemeState) {
  if (
    next.mode === snapshot.mode &&
    next.resolvedTheme === snapshot.resolvedTheme
  ) {
    return;
  }

  snapshot = next;
  for (const listener of listeners) listener();
}

/** Applies the theme to `<html>` and publishes the new preference. */
function applyAndPublish(storage: Pick<Storage, "getItem"> | null) {
  const { mode } = applyStoredTheme(
    document.documentElement,
    storage,
    THEME_STORAGE_KEY,
    getMediaQuery()?.matches ?? false,
  );
  // Read back from the DOM in case something else also touched <html>.
  publish({ mode, resolvedTheme: readDocumentTheme() });
}

/** External `<html>` mutations change the palette, never the preference. */
function syncFromDocument() {
  publish({ mode: snapshot.mode, resolvedTheme: readDocumentTheme() });
}

function reapplyStoredTheme() {
  applyAndPublish(getStorage());
}

function install() {
  // Covers anything that touched <html> before hydration.
  reapplyStoredTheme();

  const observer =
    typeof MutationObserver === "undefined"
      ? null
      : new MutationObserver(syncFromDocument);
  observer?.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });

  const media = getMediaQuery();
  const onSystemThemeChange = () => {
    if (snapshot.mode === "auto") reapplyStoredTheme();
  };
  media?.addEventListener("change", onSystemThemeChange);

  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === THEME_STORAGE_KEY) {
      reapplyStoredTheme();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    observer?.disconnect();
    media?.removeEventListener("change", onSystemThemeChange);
    window.removeEventListener("storage", onStorage);
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  teardown ??= install();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      teardown?.();
      teardown = null;
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return DEFAULT_THEME_STATE;
}

/**
 * Persists the theme preference (`"theme"` in `localStorage`) and applies it
 * to `<html>`. Applies even when storage is unavailable (private mode).
 */
export function setThemeMode(mode: ThemeMode) {
  try {
    getStorage()?.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage blocked or full: still apply for this page view.
  }

  applyAndPublish({ getItem: () => mode });
}

/**
 * Subscribes to the document color theme. All consumers share one store (and
 * one set of `MutationObserver` / `prefers-color-scheme` / `storage`
 * listeners). The server snapshot matches the SSR markup (`light`), so
 * hydration never mismatches; the real value is picked up right after.
 */
export function useThemeMode() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    /** User preference (`light`, `dark`, or `auto` to follow the OS/browser). */
    mode: theme.mode,
    /** Effective palette (`light` or `dark`) currently applied to `<html>`. */
    resolvedTheme: theme.resolvedTheme,
    /** Persists the choice and updates `<html>`; every consumer re-renders. */
    setThemeMode,
    /** `true` when `resolvedTheme` is `"dark"`. */
    isDark: theme.resolvedTheme === "dark",
    /** `true` when `resolvedTheme` is `"light"`. */
    isLight: theme.resolvedTheme === "light",
  };
}
