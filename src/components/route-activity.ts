import { useSyncExternalStore } from "react";

let manualRouteActivityCount = 0;
const listeners = new Set<() => void>();

function emitRouteActivityChange() {
  for (const listener of listeners) listener();
}

export function beginManualRouteActivity() {
  manualRouteActivityCount += 1;
  emitRouteActivityChange();

  let active = true;
  return () => {
    if (!active) return;
    active = false;
    manualRouteActivityCount = Math.max(0, manualRouteActivityCount - 1);
    emitRouteActivityChange();
  };
}

export function useManualRouteActivity() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => manualRouteActivityCount > 0,
    () => false,
  );
}
