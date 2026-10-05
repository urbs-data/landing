import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` during SSR and the hydration render, `true` afterwards (and on any
 * client-only mount) — without an extra effect-driven re-render.
 */
export function useIsHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
