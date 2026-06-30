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
import { type BeamAnchor, BeamFlow } from "@/components/ui/animated-beam";
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
  id: string;
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

type FlowBeam = {
  from: string;
  to: string;
  start: BeamAnchor;
  end: BeamAnchor;
  dashed?: boolean;
  delay: number;
  /** Nudge the attach point to land on a specific gateway pin. */
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
};

type FlowPosition = Pick<FlowNode, "x" | "y">;

/** Gateway chip size (Tailwind size-24) and its evenly spaced I/O pins. */
const CHIP_SIZE = 96;
const PIN_PERCENTS = [20, 40, 60, 80];
/** Pins stick out 6px; stop connectors just past the pin tip so they never overlap a pin. */
const PIN_LEAD = 7;
const pinOffset = (pct: number) => (pct / 100) * CHIP_SIZE - CHIP_SIZE / 2;

/** What the Urbs Gateway does internally (shown on hover). */
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

const GATEWAY_X = 36;
const BEAM_SWEEP_DURATION = 3.6;
const DASHED_BEAM_SWEEP_DURATION = 3.6;

/** Toggle the continuous "marching ants" flow on the dashed input beams. */
const ANIMATE_DASHED = false;

function getNodes(): FlowNode[] {
  return [
    // Raw sources (left column)
    {
      id: "excels",
      icon: FileSpreadsheet,
      label: m.flow_input_excels(),
      x: 8,
      y: 14,
      io: true,
    },
    {
      id: "erp",
      icon: Building2,
      label: m.flow_input_erp(),
      x: 8,
      y: 38,
      io: true,
    },
    {
      id: "ecommerce",
      icon: ShoppingCart,
      label: m.flow_input_ecommerce(),
      x: 8,
      y: 62,
      io: true,
    },
    {
      id: "other",
      icon: Ellipsis,
      label: m.flow_input_other(),
      x: 8,
      y: 86,
      io: true,
      info: {
        title: m.flow_input_other_info_title(),
        desc: m.flow_input_other_info_desc(),
      },
    },
    // Outputs (right column)
    {
      id: "dashboards",
      icon: LayoutDashboard,
      label: m.flow_output_dashboards(),
      x: 64,
      y: 14,
    },
    { id: "bi", icon: BarChart3, label: m.flow_output_bi(), x: 64, y: 38 },
    {
      id: "apps",
      icon: MonitorSmartphone,
      label: m.flow_output_apps(),
      x: 64,
      y: 62,
    },
    { id: "ai", icon: Sparkles, label: m.flow_output_ai(), x: 64, y: 86 },
    {
      id: "decisions",
      icon: Target,
      label: m.flow_decisions_title(),
      x: 92,
      y: 50,
      info: {
        title: m.flow_decisions_info_title(),
        desc: m.flow_decisions_info_desc(),
      },
    },
  ];
}

const BEAMS: FlowBeam[] = [
  // Raw sources plug into the gateway's left pins (dashed = external).
  {
    from: "excels",
    to: "gateway",
    start: "right",
    end: "left",
    dashed: true,
    delay: 0.1,
    endYOffset: pinOffset(PIN_PERCENTS[0]),
  },
  {
    from: "erp",
    to: "gateway",
    start: "right",
    end: "left",
    dashed: true,
    delay: 0.25,
    endYOffset: pinOffset(PIN_PERCENTS[1]),
  },
  {
    from: "ecommerce",
    to: "gateway",
    start: "right",
    end: "left",
    dashed: true,
    delay: 0.4,
    endYOffset: pinOffset(PIN_PERCENTS[2]),
  },
  {
    from: "other",
    to: "gateway",
    start: "right",
    end: "left",
    dashed: true,
    delay: 0.55,
    endYOffset: pinOffset(PIN_PERCENTS[3]),
  },
  // Gateway serves each surface from its own right pin.
  {
    from: "gateway",
    to: "dashboards",
    start: "right",
    end: "left",
    delay: 0.8,
    startYOffset: pinOffset(PIN_PERCENTS[0]),
  },
  {
    from: "gateway",
    to: "bi",
    start: "right",
    end: "left",
    delay: 0.9,
    startYOffset: pinOffset(PIN_PERCENTS[1]),
  },
  {
    from: "gateway",
    to: "apps",
    start: "right",
    end: "left",
    delay: 1.0,
    startYOffset: pinOffset(PIN_PERCENTS[2]),
  },
  {
    from: "gateway",
    to: "ai",
    start: "right",
    end: "left",
    delay: 1.1,
    startYOffset: pinOffset(PIN_PERCENTS[3]),
  },
  // Which converge into decisions.
  {
    from: "dashboards",
    to: "decisions",
    start: "right",
    end: "left",
    delay: 1.4,
  },
  { from: "bi", to: "decisions", start: "right", end: "left", delay: 1.5 },
  { from: "apps", to: "decisions", start: "right", end: "left", delay: 1.6 },
  { from: "ai", to: "decisions", start: "right", end: "left", delay: 1.7 },
];

const MOBILE_NODE_POSITIONS: Record<string, FlowPosition> = {
  excels: { x: 16, y: 22 },
  erp: { x: 36, y: 17 },
  ecommerce: { x: 64, y: 17 },
  other: { x: 84, y: 22 },
  dashboards: { x: 16, y: 54 },
  bi: { x: 36, y: 59 },
  apps: { x: 64, y: 59 },
  ai: { x: 84, y: 54 },
  decisions: { x: 50, y: 78 },
};

const MOBILE_GATEWAY_POSITION: FlowPosition = { x: 50, y: 38 };

const MOBILE_BEAMS: FlowBeam[] = [
  {
    from: "excels",
    to: "gateway",
    start: "bottom",
    end: "top",
    dashed: true,
    delay: 0.1,
    endXOffset: pinOffset(PIN_PERCENTS[0]),
    endYOffset: -PIN_LEAD,
  },
  {
    from: "erp",
    to: "gateway",
    start: "bottom",
    end: "top",
    dashed: true,
    delay: 0.25,
    endXOffset: pinOffset(PIN_PERCENTS[1]),
    endYOffset: -PIN_LEAD,
  },
  {
    from: "ecommerce",
    to: "gateway",
    start: "bottom",
    end: "top",
    dashed: true,
    delay: 0.4,
    endXOffset: pinOffset(PIN_PERCENTS[2]),
    endYOffset: -PIN_LEAD,
  },
  {
    from: "other",
    to: "gateway",
    start: "bottom",
    end: "top",
    dashed: true,
    delay: 0.55,
    endXOffset: pinOffset(PIN_PERCENTS[3]),
    endYOffset: -PIN_LEAD,
  },
  {
    from: "gateway",
    to: "dashboards",
    start: "bottom",
    end: "top",
    delay: 0.8,
    startXOffset: pinOffset(PIN_PERCENTS[0]),
    startYOffset: PIN_LEAD,
  },
  {
    from: "gateway",
    to: "bi",
    start: "bottom",
    end: "top",
    delay: 0.9,
    startXOffset: pinOffset(PIN_PERCENTS[1]),
    startYOffset: PIN_LEAD,
  },
  {
    from: "gateway",
    to: "apps",
    start: "bottom",
    end: "top",
    delay: 1.0,
    startXOffset: pinOffset(PIN_PERCENTS[2]),
    startYOffset: PIN_LEAD,
  },
  {
    from: "gateway",
    to: "ai",
    start: "bottom",
    end: "top",
    delay: 1.1,
    startXOffset: pinOffset(PIN_PERCENTS[3]),
    startYOffset: PIN_LEAD,
  },
  {
    from: "dashboards",
    to: "decisions",
    start: "bottom",
    end: "top",
    delay: 1.4,
  },
  { from: "bi", to: "decisions", start: "bottom", end: "top", delay: 1.5 },
  { from: "apps", to: "decisions", start: "bottom", end: "top", delay: 1.6 },
  {
    from: "ai",
    to: "decisions",
    start: "bottom",
    end: "top",
    delay: 1.7,
  },
];

function positionNodes(
  nodes: FlowNode[],
  positions: Record<string, FlowPosition>,
) {
  return nodes.map((node) => ({ ...node, ...(positions[node.id] ?? {}) }));
}

function NodeTile({ node }: { node: FlowNode }) {
  const Icon = node.icon;
  const tile = (
    <>
      <div
        className={cn(
          "flex items-center justify-center bg-card text-primary shadow-sm transition-[border-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
          node.info &&
            "group-hover/node:border-primary group-hover/node:shadow-md group-active/node:scale-[0.97]",
          node.io
            ? "size-11 rounded-md border border-dashed border-primary/40"
            : "size-12 border border-border",
        )}
      >
        <Icon className="size-5 dark:brightness-175" />
      </div>
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
    <BeamFlow.Node
      id={node.id}
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
    </BeamFlow.Node>
  );
}

function UrbsGateway({
  reducedMotion,
  x = GATEWAY_X,
  y = 50,
}: {
  reducedMotion: boolean;
  x?: number;
  y?: number;
}) {
  const steps = getGatewaySteps();

  return (
    <BeamFlow.Node
      id="gateway"
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

            <div className="relative flex size-24 flex-col items-center justify-center gap-1 rounded-xl border border-primary/50 bg-card shadow-md transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:border-primary group-hover:shadow-lg">
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
            </div>
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
      <span className="absolute left-1/2 top-full mt-3 w-32 -translate-x-1/2 text-center text-xs font-semibold text-foreground">
        {m.flow_gateway_title()}
      </span>
    </BeamFlow.Node>
  );
}

function FlowDiagram({
  beams,
  className,
  gatewayPosition = { x: GATEWAY_X, y: 50 },
  nodes,
}: {
  beams: FlowBeam[];
  className: string;
  gatewayPosition?: FlowPosition;
  nodes: FlowNode[];
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <BeamFlow className={cn("text-border", className)}>
      {beams.map((b) => (
        <BeamFlow.Beam
          key={`${b.from}-${b.to}`}
          from={b.from}
          to={b.to}
          startAnchor={b.start}
          endAnchor={b.end}
          dashed={b.dashed}
          animateDash={ANIMATE_DASHED}
          delay={b.delay}
          duration={b.dashed ? DASHED_BEAM_SWEEP_DURATION : BEAM_SWEEP_DURATION}
          repeatDelay={0}
          startYOffset={b.startYOffset}
          endYOffset={b.endYOffset}
          startXOffset={b.startXOffset ?? (b.from === "gateway" ? PIN_LEAD : 0)}
          endXOffset={b.endXOffset ?? (b.to === "gateway" ? -PIN_LEAD : 0)}
          pathColor="var(--color-border)"
          pathOpacity={b.dashed ? 1 : 0.5}
          pathWidth={b.dashed ? 1.5 : 2}
          gradientStartColor="var(--color-primary)"
          gradientStopColor="var(--color-chart-2)"
        />
      ))}

      {nodes.map((node) => (
        <NodeTile key={node.id} node={node} />
      ))}

      <UrbsGateway
        reducedMotion={prefersReducedMotion}
        x={gatewayPosition.x}
        y={gatewayPosition.y}
      />
    </BeamFlow>
  );
}

export function DataFlow() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const headingReveal = revealTransform(18, prefersReducedMotion);
  const { ids } = getLandingAnchors();
  const nodes = getNodes();
  const mobileNodes = positionNodes(nodes, MOBILE_NODE_POSITIONS);

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
          <FlowDiagram
            beams={MOBILE_BEAMS}
            className="h-240 w-full"
            gatewayPosition={MOBILE_GATEWAY_POSITION}
            nodes={mobileNodes}
          />
        </div>

        <div className="mt-14 hidden overflow-x-auto md:block">
          <FlowDiagram
            beams={BEAMS}
            className="h-110 min-w-220"
            nodes={nodes}
          />
        </div>
      </div>
    </section>
  );
}
