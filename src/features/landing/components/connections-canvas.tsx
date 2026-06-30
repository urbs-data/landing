"use client";

import * as motion from "motion/react-client";
import { useEffect, useRef, useState } from "react";
import { landingEaseOut } from "./animation";

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

export function ConnectionsCanvas({
  className,
  density = 1,
}: ConnectionsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setPrefersReducedMotion(reduceMotion);
    setCanvasReady(false);

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;
    let hasPainted = false;
    const mouse = { x: -9999, y: -9999 };
    const [pr, pg, pb] = PRIMARY;
    const normalizedDensity = clamp(density, 0, 3);

    function resize() {
      const previousWidth = width;
      const previousHeight = height;
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      currentCanvas.width = width * dpr;
      currentCanvas.height = height * dpr;
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
        node.x = clamp(node.x, EDGE_PADDING, width - EDGE_PADDING);
        node.y = clamp(node.y, EDGE_PADDING, height - EDGE_PADDING);
        return node;
      });
    }

    function draw() {
      context.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const mdx = mouse.x - n.x;
        const mdy = mouse.y - n.y;
        const pointerDistSq = mdx * mdx + mdy * mdy;
        if (pointerDistSq > 0 && pointerDistSq < POINTER_RADIUS_SQ) {
          const md = Math.sqrt(pointerDistSq);
          n.x += (mdx / md) * 0.25;
          n.y += (mdy / md) * 0.25;
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

      raf = requestAnimationFrame(draw);
    }

    function onMove(e: PointerEvent) {
      const rect = currentCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    if (reduceMotion) {
      draw();
      cancelAnimationFrame(raf);
    } else {
      draw();
    }

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [density]);

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
