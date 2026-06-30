"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@/lib/utils";

type BeamAnchor = "center" | "top" | "bottom" | "left" | "right";

type BeamStore = {
  containerRef: RefObject<HTMLDivElement | null>;
  register: (id: string, el: HTMLElement | null) => void;
  getNode: (id: string) => HTMLElement | null;
  subscribe: (callback: () => void) => () => void;
  getRevision: () => number;
  notify: () => void;
};

const BeamFlowContext = createContext<BeamStore | null>(null);

function useBeamFlow(component: string): BeamStore {
  const store = useContext(BeamFlowContext);
  if (!store) {
    throw new Error(`<${component}> must be rendered inside <BeamFlow>.`);
  }
  return store;
}

function createBeamStore(
  containerRef: RefObject<HTMLDivElement | null>,
): BeamStore {
  const nodes = new Map<string, HTMLElement>();
  const listeners = new Set<() => void>();
  let revision = 0;

  const emit = () => {
    revision += 1;
    for (const listener of listeners) listener();
  };

  return {
    containerRef,
    register(id, el) {
      if (el) {
        nodes.set(id, el);
      } else {
        nodes.delete(id);
      }
      emit();
    },
    getNode: (id) => nodes.get(id) ?? null,
    subscribe(callback) {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    getRevision: () => revision,
    notify: emit,
  };
}

type BeamFlowProps = ComponentPropsWithoutRef<"div">;

function BeamFlowRoot({ className, children, ...props }: BeamFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const store = useMemo(() => createBeamStore(containerRef), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => store.notify();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    window.addEventListener("resize", handleResize);
    // Recompute once layout/fonts have settled.
    handleResize();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [store]);

  return (
    <BeamFlowContext.Provider value={store}>
      <div ref={containerRef} className={cn("relative", className)} {...props}>
        {children}
      </div>
    </BeamFlowContext.Provider>
  );
}

type BeamNodeProps = ComponentPropsWithoutRef<"div"> & {
  /** Unique id referenced by `<BeamFlow.Beam from / to>`. */
  id: string;
};

function BeamNode({ id, className, children, ...props }: BeamNodeProps) {
  const store = useBeamFlow("BeamFlow.Node");
  const setRef = useCallback(
    (el: HTMLDivElement | null) => store.register(id, el),
    [store, id],
  );

  return (
    <div
      ref={setRef}
      data-beam-node={id}
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </div>
  );
}

type BeamProps = {
  /** Source node id. */
  from: string;
  /** Target node id. */
  to: string;
  className?: string;
  /** Where on the source/target node the beam attaches. */
  startAnchor?: BeamAnchor;
  endAnchor?: BeamAnchor;
  /** Vertical bend of the path, in px. Positive curves up, negative down. */
  curvature?: number;
  /** Reverse the direction the light travels. */
  reverse?: boolean;
  /** Seconds for one sweep of the travelling light. */
  duration?: number;
  /** Seconds before the first sweep. */
  delay?: number;
  /** Seconds between sweeps. */
  repeatDelay?: number;
  /** Render the static rail as a dashed line. */
  dashed?: boolean;
  /** When dashed, march the dashes continuously. Set false for a static dashed line. */
  animateDash?: boolean;
  /** Static rail color (any CSS color / variable). */
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  /** Travelling light gradient colors. */
  gradientStartColor?: string;
  gradientStopColor?: string;
  /** Fine-tune the attach points after the anchor is resolved, in px. */
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
};

type Point = { x: number; y: number };

type GradientCoordinates = Record<"x1" | "x2" | "y1" | "y2", string[]>;

type BeamGeometry = {
  width: number;
  height: number;
  d: string;
  start: Point;
  end: Point;
};

function anchorPoint(
  rect: DOMRect,
  container: DOMRect,
  anchor: BeamAnchor,
): Point {
  const left = rect.left - container.left;
  const top = rect.top - container.top;
  switch (anchor) {
    case "top":
      return { x: left + rect.width / 2, y: top };
    case "bottom":
      return { x: left + rect.width / 2, y: top + rect.height };
    case "left":
      return { x: left, y: top + rect.height / 2 };
    case "right":
      return { x: left + rect.width, y: top + rect.height / 2 };
    default:
      return { x: left + rect.width / 2, y: top + rect.height / 2 };
  }
}

function Beam({
  from,
  to,
  className,
  startAnchor = "center",
  endAnchor = "center",
  curvature = 0,
  reverse = false,
  duration = 4,
  delay = 0,
  repeatDelay = 0,
  dashed = false,
  animateDash = true,
  pathColor = "currentColor",
  pathWidth = 2,
  pathOpacity = 0.16,
  gradientStartColor = "var(--color-primary)",
  gradientStopColor = "var(--color-primary)",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: BeamProps) {
  const store = useBeamFlow("BeamFlow.Beam");
  const gradientId = useId();
  const prefersReducedMotion = useReducedMotion();
  const revision = useSyncExternalStore(
    store.subscribe,
    store.getRevision,
    () => 0,
  );

  const [geometry, setGeometry] = useState<BeamGeometry | null>(null);

  useEffect(() => {
    const container = store.containerRef.current;
    const fromEl = store.getNode(from);
    const toEl = store.getNode(to);

    if (!container || !fromEl || !toEl) {
      setGeometry(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const start = anchorPoint(
      fromEl.getBoundingClientRect(),
      containerRect,
      startAnchor,
    );
    const end = anchorPoint(
      toEl.getBoundingClientRect(),
      containerRect,
      endAnchor,
    );

    start.x += startXOffset;
    start.y += startYOffset;
    end.x += endXOffset;
    end.y += endYOffset;

    const controlX = (start.x + end.x) / 2;
    const controlY = (start.y + end.y) / 2 - curvature;
    const d = `M ${start.x},${start.y} Q ${controlX},${controlY} ${end.x},${end.y}`;

    setGeometry({
      width: containerRect.width,
      height: containerRect.height,
      d,
      start,
      end,
    });
  }, [
    store,
    revision,
    from,
    to,
    startAnchor,
    endAnchor,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  if (!geometry) return null;

  const { start, end } = geometry;
  // Sweep the light along the dominant axis so vertical branches flow
  // vertically and horizontal pipelines flow horizontally.
  const horizontal = Math.abs(end.x - start.x) >= Math.abs(end.y - start.y);
  const goesPositive = horizontal ? end.x >= start.x : end.y >= start.y;
  const forward = reverse ? !goesPositive : goesPositive;

  const lead: string[] = forward ? ["10%", "110%"] : ["90%", "-10%"];
  const trail: string[] = forward ? ["0%", "100%"] : ["100%", "0%"];
  const constant: string[] = ["0%", "0%"];
  const gradientCoordinates: GradientCoordinates = horizontal
    ? { x1: lead, x2: trail, y1: constant, y2: constant }
    : { x1: constant, x2: constant, y1: lead, y2: trail };

  // Dashed + animateDash → marching ants; otherwise the rail keeps the
  // travelling-light "rayo" (dashed or solid).
  const marching = dashed && animateDash && !prefersReducedMotion;

  return (
    <svg
      aria-hidden="true"
      fill="none"
      width={geometry.width}
      height={geometry.height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0",
        prefersReducedMotion ? "" : "transform-gpu",
        className,
      )}
    >
      {marching ? (
        // Dashed + animateDash: a glowing "packet" glides along the dashed pipe.
        <>
          <path
            d={geometry.d}
            stroke={pathColor}
            strokeWidth={pathWidth}
            strokeOpacity={pathOpacity}
            strokeLinecap="round"
            strokeDasharray="6 6"
          />
          <motion.g
            style={{ offsetPath: `path("${geometry.d}")` }}
            initial={{ offsetDistance: reverse ? "100%" : "0%", opacity: 0 }}
            animate={{
              offsetDistance: reverse
                ? ["100%", "88%", "12%", "0%"]
                : ["0%", "12%", "88%", "100%"],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration,
              delay,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay,
              times: [0, 0.12, 0.88, 1],
            }}
          >
            <circle r={7} fill={gradientStartColor} fillOpacity={0.18} />
            <circle r={3} fill={gradientStartColor} />
          </motion.g>
        </>
      ) : (
        <>
          {/* Static rail (dashed when requested) */}
          <path
            d={geometry.d}
            stroke={pathColor}
            strokeWidth={pathWidth}
            strokeOpacity={pathOpacity}
            strokeLinecap="round"
            strokeDasharray={dashed ? "6 6" : undefined}
          />
          {prefersReducedMotion ? (
            // Reduced motion: a calm, static highlight so the link still reads.
            <path
              d={geometry.d}
              stroke={gradientStartColor}
              strokeWidth={pathWidth}
              strokeOpacity={0.5}
              strokeLinecap="round"
              strokeDasharray={dashed ? "6 6" : undefined}
            />
          ) : (
            // Travelling light ("rayo") over the rail.
            <>
              <path
                d={geometry.d}
                stroke={`url(#${gradientId})`}
                strokeWidth={pathWidth}
                strokeLinecap="round"
              />
              <defs>
                <motion.linearGradient
                  id={gradientId}
                  gradientUnits="userSpaceOnUse"
                  initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
                  animate={gradientCoordinates}
                  transition={{
                    delay,
                    duration,
                    ease: [0.16, 1, 0.3, 1],
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay,
                  }}
                >
                  <stop stopColor={gradientStartColor} stopOpacity="0" />
                  <stop stopColor={gradientStartColor} />
                  <stop offset="32.5%" stopColor={gradientStopColor} />
                  <stop
                    offset="100%"
                    stopColor={gradientStopColor}
                    stopOpacity="0"
                  />
                </motion.linearGradient>
              </defs>
            </>
          )}
        </>
      )}
    </svg>
  );
}

type BeamFlowComponent = ((props: BeamFlowProps) => ReactNode) & {
  Node: typeof BeamNode;
  Beam: typeof Beam;
};

const BeamFlow = BeamFlowRoot as BeamFlowComponent;
BeamFlow.Node = BeamNode;
BeamFlow.Beam = Beam;

export { BeamFlow, BeamNode, Beam };
export type { BeamAnchor, BeamProps, BeamNodeProps, BeamFlowProps };
