"use client";

import * as motion from "motion/react-client";
import { useEffect, useRef, useState } from "react";
import { landingEaseOut, usePrefersReducedMotion } from "./animation";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
};

type ConnectionsCanvasProps = {
  className?: string;
  density?: number;
};

// Brand violet (matches --primary oklch(50.2% 0.1452 297.1))
const PRIMARY: [number, number, number] = [112, 58, 205];
const MAX_DPR = 2;
const BASE_AREA_PER_NODE = 16_000;
const MIN_NODES = 28;
const MAX_NODES = 72;
const MAX_DIST = 150;
const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
const POINTER_RADIUS = 180;
const POINTER_RADIUS_SQ = POINTER_RADIUS * POINTER_RADIUS;
const EDGE_PADDING = 4;
const OFFSCREEN_POINTER = -9999;

const randomNode = (width: number, height: number): Node => ({
  x: Math.random() * width,
  y: Math.random() * height,
  vx: (Math.random() - 0.5) * 0.35,
  vy: (Math.random() - 0.5) * 0.35,
  r: Math.random() * 1.6 + 1,
  pulse: Math.random() * Math.PI * 2,
});

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const clampNodePosition = (value: number, size: number) => {
  const min = Math.min(EDGE_PADDING, size / 2);
  const max = Math.max(min, size - EDGE_PADDING);
  return clamp(value, min, max);
};

const getElementSize = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();

  return {
    width: element.clientWidth || Math.round(rect.width),
    height: element.clientHeight || Math.round(rect.height),
  };
};

export function ConnectionsCanvas({
  className,
  density = 1,
}: ConnectionsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;
    const currentCanvas = canvas;
    const context = ctx;
    const container = parent;

    setCanvasReady(false);

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;
    let hasPainted = false;
    let isMounted = true;
    const mouse = { x: OFFSCREEN_POINTER, y: OFFSCREEN_POINTER };
    const [pr, pg, pb] = PRIMARY;
    const normalizedDensity = clamp(density, 0, 3);

    function resize() {
      const previousWidth = width;
      const previousHeight = height;

      const nextSize = getElementSize(container);
      width = nextSize.width;
      height = nextSize.height;

      if (width === 0 || height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      currentCanvas.width = Math.round(width * dpr);
      currentCanvas.height = Math.round(height * dpr);
      currentCanvas.style.width = `${width}px`;
      currentCanvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const nodeCount = Math.round(
        clamp(
          (width * height * normalizedDensity) / BASE_AREA_PER_NODE,
          MIN_NODES * normalizedDensity,
          MAX_NODES * normalizedDensity,
        ),
      );

      nodes = Array.from({ length: nodeCount }, (_, index) => {
        const existingNode = nodes[index];
        const node = existingNode ?? randomNode(width, height);
        if (existingNode && previousWidth > 0 && previousHeight > 0) {
          node.x *= width / previousWidth;
          node.y *= height / previousHeight;
        }
        node.x = clampNodePosition(node.x, width);
        node.y = clampNodePosition(node.y, height);
        return node;
      });

      return true;
    }

    function drawFrame(animateNodes: boolean) {
      if (!width || !height) {
        const hasSize = resize();
        if (!hasSize) return false;
      }

      context.clearRect(0, 0, width, height);

      if (animateNodes) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          n.pulse += 0.02;

          const mdx = mouse.x - n.x;
          const mdy = mouse.y - n.y;
          const pointerDistSq = mdx * mdx + mdy * mdy;
          if (pointerDistSq > 0 && pointerDistSq < POINTER_RADIUS_SQ) {
            const md = Math.sqrt(pointerDistSq);
            n.x += (mdx / md) * 0.25;
            n.y += (mdy / md) * 0.25;
          }

          if (n.x < EDGE_PADDING || n.x > width - EDGE_PADDING) n.vx *= -1;
          if (n.y < EDGE_PADDING || n.y > height - EDGE_PADDING) n.vy *= -1;

          n.x = clampNodePosition(n.x, width);
          n.y = clampNodePosition(n.y, height);
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq >= MAX_DIST_SQ) continue;

          const alpha = (1 - Math.sqrt(distSq) / MAX_DIST) * 0.4;
          context.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, ${alpha})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      for (const n of nodes) {
        const glow = (Math.sin(n.pulse) + 1) / 2;
        context.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${0.5 + glow * 0.5})`;
        context.beginPath();
        context.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${glow * 0.12})`;
        context.beginPath();
        context.arc(n.x, n.y, n.r + 6 * glow, 0, Math.PI * 2);
        context.fill();
      }

      if (!hasPainted) {
        hasPainted = true;
        setCanvasReady(true);
      }

      return true;
    }

    function requestFrame() {
      if (raf || !isMounted) return;
      raf = requestAnimationFrame(runFrame);
    }

    function cancelFrame() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function runFrame() {
      raf = 0;
      const didPaint = drawFrame(!prefersReducedMotion);

      if (!isMounted) return;
      if (!didPaint || !prefersReducedMotion) requestFrame();
    }

    function paintNow() {
      cancelFrame();
      const didPaint = drawFrame(false);

      if (!didPaint || !prefersReducedMotion) requestFrame();
    }

    function onMove(e: PointerEvent) {
      const rect = currentCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function onLeave() {
      mouse.x = OFFSCREEN_POINTER;
      mouse.y = OFFSCREEN_POINTER;
    }

    let resizeObserver: ResizeObserver | undefined;
    const onResize = () => {
      resize();
      paintNow();
    };

    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", onResize);
    }

    paintNow();

    container.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("pointerleave", onLeave);

    return () => {
      isMounted = false;
      cancelFrame();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [density, prefersReducedMotion]);

  return (
    <motion.canvas
      ref={canvasRef}
      className={className}
      initial={false}
      animate={{
        opacity: canvasReady ? 1 : 0,
        transform:
          canvasReady || prefersReducedMotion ? "scale(1)" : "scale(1.015)",
      }}
      transition={{
        duration: prefersReducedMotion ? 0.16 : 0.36,
        ease: landingEaseOut,
      }}
    />
  );
}
