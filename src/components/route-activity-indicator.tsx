import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useIsHydrated } from "#/hooks/use-is-hydrated";

/** Matches the `done` fill + fade in `.route-activity-indicator` (styles.css). */
const DONE_MS = 360;

/**
 * Decorative top progress bar for client-side navigations. Hidden from
 * assistive tech: the route change itself (new title/content) is the signal.
 */
export function RouteActivityIndicator() {
  const isHydrated = useIsHydrated();

  const isLoading = useRouterState({
    select: (state) => state.isLoading || state.status === "pending",
  });

  // Avoid an SSR/client hydration mismatch: the router can report a loading
  // state during SSR that has already settled by the client's first render.
  // Keep the indicator hidden until after hydration, then reflect real state.
  const visible = isHydrated && isLoading;

  // When loading ends, fill the bar before fading it so it reads as finished
  // rather than abandoned mid-way.
  const [prevVisible, setPrevVisible] = useState(visible);
  const [done, setDone] = useState(false);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    setDone(!visible);
  }

  useEffect(() => {
    if (!done) return;
    const timeout = window.setTimeout(() => setDone(false), DONE_MS);
    return () => window.clearTimeout(timeout);
  }, [done]);

  return (
    <div
      aria-hidden="true"
      className="route-activity-indicator"
      data-state={visible ? "loading" : done ? "done" : "idle"}
    />
  );
}
