import { useRouterState } from "@tanstack/react-router";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { useManualRouteActivity } from "./route-activity";

export function RouteActivityIndicator() {
  const isHydrated = useIsHydrated();
  const hasManualRouteActivity = useManualRouteActivity();

  const isLoading = useRouterState({
    select: (state) => state.isLoading || state.status === "pending",
  });

  // Avoid an SSR/client hydration mismatch: the router can report a loading
  // state during SSR that has already settled by the client's first render.
  // Keep the indicator hidden until after hydration, then reflect real state.
  const visible = isHydrated && (isLoading || hasManualRouteActivity);

  return (
    <div
      aria-hidden="true"
      className="route-activity-indicator"
      data-visible={visible ? "true" : "false"}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
