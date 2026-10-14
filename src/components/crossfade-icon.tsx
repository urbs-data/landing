import type { LucideIcon } from "lucide-react";
import { cn } from "#/lib/utils";

/**
 * One icon of a stacked icon swap: render every candidate inside a `relative`
 * box and mark one `visible`. The outgoing icon shrinks and blurs while the
 * incoming one grows in, so the swap reads as one control changing state.
 * Reduced motion keeps the crossfade and drops the scale/blur.
 */
export function CrossfadeIcon({
  icon: Icon,
  visible,
  animate = true,
  className,
}: {
  icon: LucideIcon;
  visible: boolean;
  /** Off for the first render so a restored state does not animate in. */
  animate?: boolean;
  className?: string;
}) {
  return (
    <Icon
      aria-hidden="true"
      className={cn(
        "absolute",
        animate &&
          "transition-[opacity,scale,filter] duration-200 ease-out-strong",
        visible
          ? "scale-100 opacity-100"
          : "scale-25 opacity-0 blur-[2px] motion-reduce:scale-100 motion-reduce:filter-none",
        className,
      )}
    />
  );
}
