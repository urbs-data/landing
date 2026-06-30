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
