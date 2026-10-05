/** Mirrors the `--ease-out-strong` token in `src/styles.css` for Motion. */
export const landingEaseOut = [0.23, 1, 0.32, 1] as const;

export function revealTransform(offset = 18) {
  return {
    initial: {
      opacity: 0,
      transform: `translate3d(0, ${offset}px, 0)`,
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
}: {
  delay?: number;
  duration: number;
}) {
  return {
    duration,
    ease: landingEaseOut,
    delay,
  } as const;
}

/**
 * Scroll-triggered reveal props for any `motion.*` element. Motion already
 * serializes `initial` into the SSR `style`, so no extra `style` is needed.
 */
export function revealOnView({
  offset,
  duration,
  delay,
  margin = "-60px",
}: {
  offset: number;
  duration: number;
  delay?: number;
  margin?: string;
}) {
  const reveal = revealTransform(offset);

  return {
    initial: reveal.initial,
    whileInView: reveal.visible,
    viewport: { once: true, margin },
    transition: revealTransition({ duration, delay }),
  } as const;
}
