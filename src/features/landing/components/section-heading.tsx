import * as motion from "motion/react-client";
import { cn } from "#/lib/utils";
import { revealOnView } from "./animation";

/**
 * Section intro block that reveals on scroll. Compose it with
 * `SectionKicker`, `SectionTitle`, `SectionDescription` and any extra content.
 */
export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      {...revealOnView({ offset: 18, duration: 0.38, margin: "-80px" })}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl">
      {children}
    </h2>
  );
}

export function SectionDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mt-4 text-pretty leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
