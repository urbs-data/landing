"use client";

import {
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const STEP_COUNT = 4;

export function useProcessClock(stepMs: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.25 });
  const reducedMotion = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);

  const progress = useMotionValue(0);
  const stepProgress = useTransform(progress, (p) => p % 1);

  useMotionValueEvent(progress, "change", (p) => {
    setActive(Math.floor(p) % STEP_COUNT);
  });

  useEffect(() => {
    if (reducedMotion || !inView) return;
    let frame: number;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last !== null) {
        // Clamp so a backgrounded tab doesn't fast-forward the loop.
        const delta = Math.min(now - last, 100);
        progress.set(progress.get() + delta / stepMs);
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, inView, progress, stepMs]);

  const jumpTo = (index: number) => {
    progress.set(index);
    setActive(index);
  };

  return {
    containerRef,
    reducedMotion,
    active,
    progress,
    stepProgress,
    jumpTo,
  };
}
