"use client";

import { RefreshCw } from "lucide-react";
import { type MotionValue, motion, useTransform } from "motion/react";
import { m } from "@/paraglide/messages";
import { landingEaseOut } from "./animation";
import type { ProcessStep } from "./process-steps";
import { useProcessClock } from "./use-process-clock";

const STEP_MS = 4200;

const cardCells = [
  "md:col-start-1 md:row-start-1",
  "md:col-start-3 md:row-start-1",
  "md:col-start-3 md:row-start-3",
  "md:col-start-1 md:row-start-3",
];

type ConnectorAxis = "x" | "y";
type ConnectorOrigin = "left" | "right" | "top" | "bottom";

type ConnectorSpec = {
  cell: string;
  axis: ConnectorAxis;
  from: ConnectorOrigin;
};

const connectorSpecs: ConnectorSpec[] = [
  { cell: "md:col-start-2 md:row-start-1", axis: "x", from: "left" },
  { cell: "md:col-start-3 md:row-start-2", axis: "y", from: "top" },
  { cell: "md:col-start-2 md:row-start-3", axis: "x", from: "right" },
  { cell: "md:col-start-1 md:row-start-2", axis: "y", from: "bottom" },
];

const originClass: Record<ConnectorOrigin, string> = {
  left: "origin-left",
  right: "origin-right",
  top: "origin-top",
  bottom: "origin-bottom",
};

const dotAnchorClass: Record<
  ConnectorAxis,
  Record<"forward" | "reverse", string>
> = {
  x: {
    forward: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
    reverse: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
  },
  y: {
    forward: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    reverse: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  },
};

const glowDotClass =
  "size-2.5 rounded-full bg-primary shadow-[0_0_12px_3px] shadow-primary/50";

type TravelingDotProps = {
  axis: ConnectorAxis;
  reverse: boolean;
  carry: MotionValue<string>;
};

function TravelingDot({ axis, reverse, carry }: TravelingDotProps) {
  const carryStyle = axis === "x" ? { x: carry } : { y: carry };
  const anchor = dotAnchorClass[axis][reverse ? "reverse" : "forward"];
  return (
    <motion.span style={carryStyle} className="absolute inset-0">
      <span className={`absolute ${anchor} ${glowDotClass}`} />
    </motion.span>
  );
}

type LoopConnectorProps = {
  axis: ConnectorAxis;
  from: ConnectorOrigin;
  isActive: boolean;
  isDone: boolean;
  reducedMotion: boolean;
  stepProgress: MotionValue<number>;
  carry: MotionValue<string>;
};

function LoopConnector({
  axis,
  from,
  isActive,
  isDone,
  reducedMotion,
  stepProgress,
  carry,
}: LoopConnectorProps) {
  const reverse = from === "right" || from === "bottom";
  const line = axis === "x" ? "relative h-0.5 w-full" : "relative w-0.5 h-full";
  const fillScale =
    axis === "x" ? { scaleX: stepProgress } : { scaleY: stepProgress };

  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center"
    >
      <div className={`${line} bg-border`}>
        {isDone && <div className="absolute inset-0 bg-primary/50" />}
        {isActive && !reducedMotion && (
          <>
            <motion.div
              style={fillScale}
              className={`absolute inset-0 bg-primary ${originClass[from]}`}
            />
            <TravelingDot axis={axis} reverse={reverse} carry={carry} />
          </>
        )}
      </div>
    </div>
  );
}

type LoopCardProps = {
  step: ProcessStep;
  isActive: boolean;
  reducedMotion: boolean;
  stepProgress: MotionValue<number>;
  onSelect: () => void;
  className?: string;
};

function LoopCard({
  step,
  isActive,
  reducedMotion,
  stepProgress,
  onSelect,
  className = "",
}: LoopCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`relative flex h-full flex-col border bg-card p-6 text-left transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] sm:p-7 ${
        isActive
          ? "border-primary bg-accent/40 shadow-[0_16px_40px_-16px] shadow-primary/25"
          : "border-border hover:border-primary/40 hover:bg-accent/20"
      } ${className}`}
    >
      {isActive && (
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: landingEaseOut }}
          className="pointer-events-none absolute -inset-px"
        >
          <span className="absolute left-0 top-0 size-3.5 border-l-2 border-t-2 border-primary" />
          <span className="absolute right-0 top-0 size-3.5 border-r-2 border-t-2 border-primary" />
          <span className="absolute bottom-0 left-0 size-3.5 border-b-2 border-l-2 border-primary" />
          <span className="absolute bottom-0 right-0 size-3.5 border-b-2 border-r-2 border-primary" />
        </motion.span>
      )}
      <div className="flex items-center justify-between gap-3">
        <span
          className={`flex size-11 items-center justify-center border transition-colors duration-300 ${
            isActive
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-accent text-primary dark:brightness-175"
          }`}
        >
          <step.icon className="size-5" />
        </span>
        <span
          className={`font-mono text-sm transition-colors duration-300 ${
            isActive
              ? "text-primary dark:brightness-150"
              : "text-muted-foreground"
          }`}
        >
          {step.tag}
        </span>
      </div>
      <h3 className="mt-6 text-lg font-semibold leading-snug">{step.title}</h3>
      <p className="mt-2 max-w-md flex-1 text-sm leading-relaxed text-muted-foreground">
        {step.description}
      </p>
      <div aria-hidden="true" className="mt-6 h-0.5 bg-border">
        {isActive ? (
          reducedMotion ? (
            <div className="h-full w-full bg-primary" />
          ) : (
            <motion.div
              style={{ scaleX: stepProgress }}
              className="h-full origin-left bg-primary"
            />
          )
        ) : null}
      </div>
    </button>
  );
}

type LoopChipProps = {
  reducedMotion: boolean;
};

function LoopChip({ reducedMotion }: LoopChipProps) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap border border-border bg-background px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-primary dark:brightness-175">
      {reducedMotion ? (
        <RefreshCw className="size-3" />
      ) : (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="flex"
        >
          <RefreshCw className="size-3" />
        </motion.span>
      )}
      {m.process_loop_kicker()}
    </span>
  );
}

type ProcessLoopCircuitProps = {
  steps: ProcessStep[];
};

export function ProcessLoopCircuit({ steps }: ProcessLoopCircuitProps) {
  const { containerRef, reducedMotion, active, stepProgress, jumpTo } =
    useProcessClock(STEP_MS);

  const carryForward = useTransform(stepProgress, (p) => `${p * 100}%`);
  const carryReverse = useTransform(stepProgress, (p) => `${-p * 100}%`);

  if (steps.length < 4) return null;

  return (
    <div ref={containerRef} className="mt-8">
      <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)_6rem_minmax(0,1fr)]">
        {steps.map((step, index) => (
          <LoopCard
            key={step.tag}
            step={step}
            isActive={index === active}
            reducedMotion={reducedMotion}
            stepProgress={stepProgress}
            onSelect={() => jumpTo(index)}
            className={cardCells[index] ?? ""}
          />
        ))}
        {connectorSpecs.map((spec, index) => (
          <div key={spec.cell} className={`${spec.cell} flex`}>
            <LoopConnector
              axis={spec.axis}
              from={spec.from}
              isActive={index === active}
              isDone={index < active}
              reducedMotion={reducedMotion}
              stepProgress={stepProgress}
              carry={
                spec.from === "right" || spec.from === "bottom"
                  ? carryReverse
                  : carryForward
              }
            />
          </div>
        ))}
        <div className="col-start-2 row-start-2 flex items-center justify-center">
          <LoopChip reducedMotion={reducedMotion} />
        </div>
      </div>

      <div className="flex flex-col md:hidden">
        {steps.map((step, index) => (
          <div key={step.tag} className="flex flex-col">
            <LoopCard
              step={step}
              isActive={index === active}
              reducedMotion={reducedMotion}
              stepProgress={stepProgress}
              onSelect={() => jumpTo(index)}
            />
            {index < steps.length - 1 && (
              <div className="mx-auto h-10 w-0.5">
                <LoopConnector
                  axis="y"
                  from="top"
                  isActive={index === active}
                  isDone={index < active}
                  reducedMotion={reducedMotion}
                  stepProgress={stepProgress}
                  carry={carryForward}
                />
              </div>
            )}
          </div>
        ))}
        <div className="flex flex-col items-center">
          <div className="h-10 w-0.5">
            <LoopConnector
              axis="y"
              from="top"
              isActive={active === steps.length - 1}
              isDone={false}
              reducedMotion={reducedMotion}
              stepProgress={stepProgress}
              carry={carryForward}
            />
          </div>
          <LoopChip reducedMotion={reducedMotion} />
        </div>
      </div>
    </div>
  );
}
