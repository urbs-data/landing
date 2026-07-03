"use client";

import {
  BarChart3,
  Boxes,
  Building2,
  Cpu,
  Ellipsis,
  FileSpreadsheet,
  Layers,
  LayoutDashboard,
  type LucideIcon,
  MonitorSmartphone,
  ShoppingCart,
  Sparkles,
  Target,
  Warehouse,
} from "lucide-react";
import * as motion from "motion/react-client";
import * as React from "react";
import {
  AnimatedBeam,
  BeamContainer,
  BeamNode,
} from "@/components/ui/animated-beam";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import {
  revealTransform,
  revealTransition,
  usePrefersReducedMotion,
} from "./animation";
import { SectionKicker } from "./section-kicker";

type FlowNode = {
  id: FlowNodeId;
  icon: LucideIcon;
  label: string;
  /** Center position inside the diagram, in percentages. */
  x: number;
  y: number;
  /** Raw input source (smaller, dashed). */
  io?: boolean;
  info?: {
    title: string;
    desc: string;
  };
};

type FlowEndpoint = Omit<FlowNode, "id"> & {
  id: FlowEndpointId;
};

type BeamAnchor = "top" | "right" | "bottom" | "left";
type FlowLayout = "desktop" | "mobile";
type FlowNodeId =
  | "excels"
  | "erp"
  | "ecommerce"
  | "other"
  | "dashboards"
  | "bi"
  | "apps"
  | "ai"
  | "decisions";
type FlowEndpointId = FlowNodeId | "gateway";
type FlowPosition = Pick<FlowNode, "x" | "y">;

type FlowBeam = {
  from: FlowEndpointId;
  to: FlowEndpointId;
  start: BeamAnchor;
  end: BeamAnchor;
  dashed?: boolean;
  delay: number;
  curvature: number;
  lineType?: "curved" | "straight";
  gradientStartColor: string;
  gradientStopColor: string;
  /** Nudge the attach point to land on a specific gateway pin. */
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
};

type FlowNodeSpec = Omit<FlowNode, "x" | "y"> & {
  position: Record<FlowLayout, FlowPosition>;
};

type FlowRoute = {
  from: FlowEndpointId;
  to: FlowEndpointId;
  anchors?: Record<FlowLayout, { start: BeamAnchor; end: BeamAnchor }>;
  curvature: Record<FlowLayout, number>;
  dashed?: boolean;
  delay: number;
  /** Gateway pin index, 0-3. The axis is inferred from the active anchor. */
  startPin?: number;
  endPin?: number;
  /** Fine-tune an individual connector after the anchor is resolved. */
  offsets?: Partial<
    Record<
      FlowLayout,
      {
        startX?: number;
        startY?: number;
        endX?: number;
        endY?: number;
      }
    >
  >;
  lineType?: "curved" | "straight";
};

/** Gateway chip size (Tailwind size-24) and its evenly spaced I/O pins. */
const CHIP_SIZE = 96;
const PIN_PERCENTS = [20, 40, 60, 80];
/** Pins stick out 6px; stop connectors just past the pin tip so they never overlap a pin. */
const PIN_LEAD = 7;
const pinOffset = (pct: number) => (pct / 100) * CHIP_SIZE - CHIP_SIZE / 2;
const FLOW_BEAM_DURATION = 3.8;

/** What the Urbs node does internally (shown on hover). */
function getGatewaySteps() {
  return [
    { icon: Boxes, title: m.flow_ingest_title(), desc: m.flow_ingest_desc() },
    {
      icon: Warehouse,
      title: m.flow_warehouse_title(),
      desc: m.flow_warehouse_desc(),
    },
    {
      icon: Layers,
      title: m.flow_modeling_title(),
      desc: m.flow_modeling_desc(),
    },
  ];
}

const BEAM_START_COLOR = "var(--color-primary)";
const BEAM_STOP_COLOR = "var(--color-chart-2)";

const FLOW_NODE_IDS: FlowNodeId[] = [
  "excels",
  "erp",
  "ecommerce",
  "other",
  "dashboards",
  "bi",
  "apps",
  "ai",
  "decisions",
];

const NODE_POSITIONS: Record<FlowNodeId, Record<FlowLayout, FlowPosition>> = {
  excels: {
    desktop: { x: 8, y: 14 },
    mobile: { x: 16, y: 22 },
  },
  erp: {
    desktop: { x: 8, y: 38 },
    mobile: { x: 36, y: 17 },
  },
  ecommerce: {
    desktop: { x: 8, y: 62 },
    mobile: { x: 64, y: 17 },
  },
  other: {
    desktop: { x: 8, y: 86 },
    mobile: { x: 84, y: 22 },
  },
  dashboards: {
    desktop: { x: 64, y: 14 },
    mobile: { x: 16, y: 54 },
  },
  bi: {
    desktop: { x: 64, y: 38 },
    mobile: { x: 36, y: 59 },
  },
  apps: {
    desktop: { x: 64, y: 62 },
    mobile: { x: 64, y: 59 },
  },
  ai: {
    desktop: { x: 64, y: 86 },
    mobile: { x: 84, y: 54 },
  },
  decisions: {
    desktop: { x: 92, y: 50 },
    mobile: { x: 50, y: 78 },
  },
};

const GATEWAY_POSITIONS: Record<FlowLayout, FlowPosition> = {
  desktop: { x: 36, y: 50 },
  mobile: { x: 50, y: 38 },
};

const DEFAULT_ROUTE_ANCHORS: Record<
  FlowLayout,
  { start: BeamAnchor; end: BeamAnchor }
> = {
  desktop: { start: "right", end: "left" },
  mobile: { start: "bottom", end: "top" },
};

function getNodeSpecs(): FlowNodeSpec[] {
  return [
    {
      id: "excels",
      icon: FileSpreadsheet,
      label: m.flow_input_excels(),
      position: NODE_POSITIONS.excels,
      io: true,
    },
    {
      id: "erp",
      icon: Building2,
      label: m.flow_input_erp(),
      position: NODE_POSITIONS.erp,
      io: true,
    },
    {
      id: "ecommerce",
      icon: ShoppingCart,
      label: m.flow_input_ecommerce(),
      position: NODE_POSITIONS.ecommerce,
      io: true,
    },
    {
      id: "other",
      icon: Ellipsis,
      label: m.flow_input_other(),
      position: NODE_POSITIONS.other,
      io: true,
      info: {
        title: m.flow_input_other_info_title(),
        desc: m.flow_input_other_info_desc(),
      },
    },
    {
      id: "dashboards",
      icon: LayoutDashboard,
      label: m.flow_output_dashboards(),
      position: NODE_POSITIONS.dashboards,
    },
    {
      id: "bi",
      icon: BarChart3,
      label: m.flow_output_bi(),
      position: NODE_POSITIONS.bi,
    },
    {
      id: "apps",
      icon: MonitorSmartphone,
      label: m.flow_output_apps(),
      position: NODE_POSITIONS.apps,
    },
    {
      id: "ai",
      icon: Sparkles,
      label: m.flow_output_ai(),
      position: NODE_POSITIONS.ai,
    },
    {
      id: "decisions",
      icon: Target,
      label: m.flow_decisions_title(),
      position: NODE_POSITIONS.decisions,
      info: {
        title: m.flow_decisions_info_title(),
        desc: m.flow_decisions_info_desc(),
      },
    },
  ];
}

const FLOW_ROUTES: FlowRoute[] = [
  {
    from: "excels",
    to: "gateway",
    curvature: { desktop: 0.12, mobile: -0.1 },
    dashed: true,
    delay: 0.1,
    endPin: 0,
  },
  {
    from: "erp",
    to: "gateway",
    curvature: { desktop: 0.04, mobile: -0.03 },
    dashed: true,
    delay: 0.25,
    endPin: 1,
  },
  {
    from: "ecommerce",
    to: "gateway",
    curvature: { desktop: -0.04, mobile: 0.03 },
    dashed: true,
    delay: 0.4,
    endPin: 2,
  },
  {
    from: "other",
    to: "gateway",
    curvature: { desktop: -0.12, mobile: 0.1 },
    dashed: true,
    delay: 0.55,
    endPin: 3,
  },
  {
    from: "gateway",
    to: "dashboards",
    curvature: { desktop: -0.1, mobile: 0.16 },
    delay: 0.8,
    startPin: 0,
  },
  {
    from: "gateway",
    to: "bi",
    curvature: { desktop: -0.03, mobile: 0.05 },
    delay: 0.9,
    startPin: 1,
  },
  {
    from: "gateway",
    to: "apps",
    curvature: { desktop: 0.03, mobile: -0.05 },
    delay: 1.0,
    startPin: 2,
  },
  {
    from: "gateway",
    to: "ai",
    curvature: { desktop: 0.1, mobile: -0.16 },
    delay: 1.1,
    startPin: 3,
  },
  {
    from: "dashboards",
    to: "decisions",
    curvature: { desktop: 0.14, mobile: -0.08 },
    delay: 1.4,
    offsets: { mobile: { endX: -18 } },
  },
  {
    from: "bi",
    to: "decisions",
    curvature: { desktop: 0.05, mobile: -0.03 },
    delay: 1.5,
    offsets: { mobile: { endX: -6 } },
  },
  {
    from: "apps",
    to: "decisions",
    curvature: { desktop: -0.05, mobile: 0.03 },
    delay: 1.6,
    offsets: { mobile: { endX: 6 } },
  },
  {
    from: "ai",
    to: "decisions",
    curvature: { desktop: -0.14, mobile: 0.08 },
    delay: 1.7,
    offsets: { mobile: { endX: 18 } },
  },
];

function getNodes(layout: FlowLayout): FlowNode[] {
  return getNodeSpecs().map(({ position, ...node }) => ({
    ...node,
    ...position[layout],
  }));
}

function getBeams(layout: FlowLayout) {
  return FLOW_ROUTES.map((route) => buildBeam(route, layout));
}

function buildBeam(route: FlowRoute, layout: FlowLayout): FlowBeam {
  const anchors = (route.anchors ?? DEFAULT_ROUTE_ANCHORS)[layout];
  const startPinOffset = getPinOffset(anchors.start, route.startPin);
  const endPinOffset = getPinOffset(anchors.end, route.endPin);
  const routeOffset = route.offsets?.[layout];

  return {
    from: route.from,
    to: route.to,
    start: anchors.start,
    end: anchors.end,
    dashed: route.dashed,
    delay: route.delay,
    curvature: route.curvature[layout],
    lineType: route.lineType,
    gradientStartColor: BEAM_START_COLOR,
    gradientStopColor: BEAM_STOP_COLOR,
    startXOffset: (startPinOffset.x ?? 0) + (routeOffset?.startX ?? 0),
    startYOffset: (startPinOffset.y ?? 0) + (routeOffset?.startY ?? 0),
    endXOffset: (endPinOffset.x ?? 0) + (routeOffset?.endX ?? 0),
    endYOffset: (endPinOffset.y ?? 0) + (routeOffset?.endY ?? 0),
  };
}

function getPinOffset(anchor: BeamAnchor, pinIndex?: number) {
  if (pinIndex === undefined) return {};

  const offset = pinOffset(PIN_PERCENTS[pinIndex]);
  return anchor === "top" || anchor === "bottom"
    ? { x: offset }
    : { y: offset };
}

function NodeTile({
  node,
  nodeRef,
}: {
  node: FlowNode;
  nodeRef: React.RefObject<HTMLDivElement | null>;
}) {
  const Icon = node.icon;
  const tile = (
    <>
      <BeamNode
        ref={nodeRef}
        className={cn(
          "z-20 bg-card p-0 text-primary shadow-sm transition-[border-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
          node.info &&
            "group-hover/node:border-primary group-hover/node:shadow-md group-active/node:scale-[0.97]",
          node.io
            ? "size-11 rounded-md border border-dashed border-primary/40"
            : "size-12 border border-border",
        )}
      >
        <Icon className="size-5 dark:brightness-175" />
      </BeamNode>
      <span
        className={cn(
          "absolute left-1/2 top-full mt-2 w-28 -translate-x-1/2 text-center text-xs font-semibold transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
          node.io ? "text-muted-foreground" : "text-foreground",
          node.info && "group-hover/node:text-primary",
        )}
      >
        {node.label}
      </span>
    </>
  );

  return (
    <div
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
    >
      {node.info ? (
        <HoverCard>
          <HoverCardTrigger
            delay={180}
            closeDelay={80}
            aria-label={`${m.flow_info_label()}: ${node.info.title}`}
            className="group/node relative block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            render={<button type="button" />}
          >
            {tile}
          </HoverCardTrigger>
          <HoverCardContent
            side="top"
            sideOffset={14}
            className="w-72 rounded-md border border-border bg-popover p-4 text-left shadow-lg"
          >
            <p className="text-sm font-semibold text-popover-foreground">
              {node.info.title}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {node.info.desc}
            </p>
          </HoverCardContent>
        </HoverCard>
      ) : (
        tile
      )}
    </div>
  );
}

function UrbsGateway({
  gatewayRef,
  reducedMotion,
  x,
  y,
}: {
  gatewayRef: React.RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  x: number;
  y: number;
}) {
  const steps = getGatewaySteps();

  return (
    <div
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
    >
      <HoverCard>
        <HoverCardTrigger
          delay={180}
          closeDelay={80}
          aria-label={`${m.flow_gateway_title()}: ${m.flow_gateway_subtitle()}`}
          className="group block rounded-xl transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          render={<button type="button" />}
        >
          <div className="relative size-24">
            {PIN_PERCENTS.map((p) => (
              <span
                key={`l${p}`}
                style={{ top: `${p}%` }}
                className="absolute -left-1.5 size-1.5 -translate-y-1/2 bg-primary/60"
              />
            ))}
            {PIN_PERCENTS.map((p) => (
              <span
                key={`r${p}`}
                style={{ top: `${p}%` }}
                className="absolute -right-1.5 size-1.5 -translate-y-1/2 bg-primary/60"
              />
            ))}
            {PIN_PERCENTS.map((p) => (
              <span
                key={`t${p}`}
                style={{ left: `${p}%` }}
                className="absolute -top-1.5 size-1.5 -translate-x-1/2 bg-primary/60"
              />
            ))}
            {PIN_PERCENTS.map((p) => (
              <span
                key={`b${p}`}
                style={{ left: `${p}%` }}
                className="absolute -bottom-1.5 size-1.5 -translate-x-1/2 bg-primary/60"
              />
            ))}

            <BeamNode
              ref={gatewayRef}
              className="relative z-30 flex size-24 flex-col items-center justify-center gap-1 rounded-xl border border-primary/50 bg-card p-0 shadow-md transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:border-primary group-hover:shadow-lg"
            >
              <div className="pointer-events-none absolute inset-2 rounded-lg border border-primary/20" />
              {!reducedMotion && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-2 rounded-lg bg-primary/10"
                  animate={{ opacity: [0.2, 0.55, 0.2] }}
                  transition={{
                    duration: 2.6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              )}
              <Cpu className="relative size-7 text-primary dark:brightness-175" />
              <span className="relative text-[10px] font-semibold uppercase tracking-wide text-primary">
                Urbs
              </span>
            </BeamNode>
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          sideOffset={16}
          className="w-80 rounded-md border border-border bg-popover p-4 text-left shadow-lg"
        >
          <p className="text-sm font-semibold text-popover-foreground">
            {m.flow_gateway_title()}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {m.flow_gateway_subtitle()}
          </p>
          <ul className="mt-3 space-y-2.5">
            {steps.map((s) => (
              <li key={s.title} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-primary">
                  <s.icon className="size-4 dark:brightness-175" />
                </span>
                <span>
                  <span className="block text-xs font-semibold text-popover-foreground">
                    {s.title}
                  </span>
                  <span className="block text-xs leading-relaxed text-muted-foreground">
                    {s.desc}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

function createNodeRefs(): Record<
  FlowEndpointId,
  React.RefObject<HTMLDivElement | null>
> {
  return Object.fromEntries(
    ([...FLOW_NODE_IDS, "gateway"] satisfies FlowEndpointId[]).map((id) => [
      id,
      React.createRef<HTMLDivElement>(),
    ]),
  ) as Record<FlowEndpointId, React.RefObject<HTMLDivElement | null>>;
}

function getAnchorOffset({
  anchor,
  node,
}: {
  anchor: BeamAnchor;
  node?: FlowEndpoint;
}) {
  const radius =
    node?.id === "gateway" ? CHIP_SIZE / 2 + PIN_LEAD : node?.io ? 22 : 24;

  switch (anchor) {
    case "top":
      return { x: 0, y: -radius };
    case "right":
      return { x: radius, y: 0 };
    case "bottom":
      return { x: 0, y: radius };
    case "left":
      return { x: -radius, y: 0 };
  }
}

function FlowDiagram({
  className,
  layout,
}: {
  className: string;
  layout: FlowLayout;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const nodes = getNodes(layout);
  const beams = getBeams(layout);
  const gatewayPosition = GATEWAY_POSITIONS[layout];
  const containerRef = React.useRef<HTMLDivElement>(null);
  const nodeRefs = React.useMemo(createNodeRefs, []);
  const nodeMap = React.useMemo(
    () =>
      new Map<FlowEndpointId, FlowEndpoint>([
        ...nodes.map((node): [FlowEndpointId, FlowEndpoint] => [node.id, node]),
        [
          "gateway",
          {
            id: "gateway",
            icon: Cpu,
            label: m.flow_gateway_title(),
            x: gatewayPosition.x,
            y: gatewayPosition.y,
          },
        ],
      ]),
    [gatewayPosition.x, gatewayPosition.y, nodes],
  );

  return (
    <BeamContainer
      ref={containerRef}
      className={cn("relative isolate overflow-visible text-border", className)}
    >
      {beams.map((b) => (
        <AnimatedBeam
          key={`${b.from}-${b.to}`}
          containerRef={containerRef}
          fromRef={nodeRefs[b.from]}
          toRef={nodeRefs[b.to]}
          curvature={b.curvature}
          lineType={b.lineType}
          delay={b.delay}
          duration={prefersReducedMotion ? 1000 : FLOW_BEAM_DURATION}
          pathWidth={b.dashed ? 1.5 : 2}
          gradientStartColor={b.gradientStartColor}
          gradientStopColor={b.gradientStopColor}
          startXOffset={
            getAnchorOffset({ anchor: b.start, node: nodeMap.get(b.from) }).x +
            (b.startXOffset ?? 0)
          }
          startYOffset={
            getAnchorOffset({ anchor: b.start, node: nodeMap.get(b.from) }).y +
            (b.startYOffset ?? 0)
          }
          endXOffset={
            getAnchorOffset({ anchor: b.end, node: nodeMap.get(b.to) }).x +
            (b.endXOffset ?? 0)
          }
          endYOffset={
            getAnchorOffset({ anchor: b.end, node: nodeMap.get(b.to) }).y +
            (b.endYOffset ?? 0)
          }
        />
      ))}

      {nodes.map((node) => (
        <NodeTile key={node.id} node={node} nodeRef={nodeRefs[node.id]} />
      ))}

      <UrbsGateway
        gatewayRef={nodeRefs.gateway}
        reducedMotion={prefersReducedMotion}
        x={gatewayPosition.x}
        y={gatewayPosition.y}
      />
    </BeamContainer>
  );
}

export function DataFlow() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const headingReveal = revealTransform(18, prefersReducedMotion);
  const { ids } = getLandingAnchors();

  return (
    <section
      id={ids.flow}
      className="relative border-b border-border py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={headingReveal.initial}
          whileInView={headingReveal.visible}
          style={headingReveal.initial}
          viewport={{ once: true, margin: "-80px" }}
          transition={revealTransition({
            duration: 0.38,
            prefersReducedMotion,
          })}
          className="max-w-2xl"
        >
          <SectionKicker>{m.flow_kicker()}</SectionKicker>
          <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl">
            {m.flow_title()}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {m.flow_description()}
          </p>
        </motion.div>

        <div className="-mt-10 -mb-32 md:hidden">
          <FlowDiagram className="h-240 w-full" layout="mobile" />
        </div>

        <div className="mt-14 hidden overflow-x-auto md:block">
          <FlowDiagram className="h-110 min-w-220" layout="desktop" />
        </div>
      </div>
    </section>
  );
}
