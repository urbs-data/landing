import { useEffect, useState } from "react";

export const landingEaseOut = [0.23, 1, 0.32, 1] as const;

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(media.matches);

    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);

    return () => {
      media.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  return prefersReducedMotion;
}

export function revealTransform(offset = 18, prefersReducedMotion = false) {
  return {
    initial: {
      opacity: 0,
      transform: prefersReducedMotion
        ? "translate3d(0, 0, 0)"
        : `translate3d(0, ${offset}px, 0)`,
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  } as const;
}

export function revealTransition({
  delay = 0,
  duration,
  prefersReducedMotion,
}: {
  delay?: number;
  duration: number;
  prefersReducedMotion: boolean;
}) {
  return {
    duration: prefersReducedMotion ? 0.16 : duration,
    ease: landingEaseOut,
    delay: prefersReducedMotion ? 0 : delay,
  } as const;
}
