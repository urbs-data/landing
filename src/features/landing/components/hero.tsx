"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { revealTransform, revealTransition } from "./animation";
import { ConnectionsCanvas } from "./connections-canvas";

export function Hero() {
  const badgeReveal = revealTransform(12);
  const heroReveal = revealTransform(18);
  const { hrefs, ids } = getLandingAnchors();

  return (
    <section
      id={ids.top}
      className="relative isolate overflow-hidden border-b border-border min-h-svh"
    >
      <div className="absolute inset-x-0 bottom-0 top-16 -z-10">
        <ConnectionsCanvas
          className={cn(
            "size-full [--mask-fade:2rem] sm:[--mask-fade:16rem]",
            "[-webkit-mask-image:linear-gradient(to_bottom,transparent,black_var(--mask-fade),black_calc(100%-var(--mask-fade)),transparent),linear-gradient(to_right,transparent,black_var(--mask-fade),black_calc(100%-var(--mask-fade)),transparent)]",
            "mask-[linear-gradient(to_bottom,transparent,black_var(--mask-fade),black_calc(100%-var(--mask-fade)),transparent),linear-gradient(to_right,transparent,black_var(--mask-fade),black_calc(100%-var(--mask-fade)),transparent)]",
            "[-webkit-mask-composite:source-in] mask-intersect",
          )}
          density={2.5}
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/15 via-background/30 to-background/60 dark:hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-background/92 via-background/78 to-background/10 sm:from-background/90 sm:via-background/72 sm:to-background/15 dark:from-background/85 dark:via-background/60 dark:to-background/8 dark:sm:from-background/82 dark:sm:via-background/56 dark:sm:to-background/10" />
        <div className="absolute inset-0 [background:radial-gradient(58%_44%_at_50%_50%,var(--background)_38%,transparent_78%)] sm:[background:radial-gradient(42%_46%_at_50%_50%,var(--background)_34%,transparent_74%)]" />
      </div>

      <div className="mx-auto flex min-h-svh max-w-6xl flex-col items-center justify-center px-5 pb-16 pt-28 text-center sm:px-6 sm:pb-16 sm:pt-32">
        <motion.a
          href={hrefs.flow}
          initial={badgeReveal.initial}
          animate={badgeReveal.visible}
          transition={revealTransition({
            duration: 0.36,
          })}
          className="inline-flex items-center gap-2 border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <Sparkles className="size-3.5 text-primary dark:brightness-175" />
          <span className="sm:hidden">{m.hero_kicker_short()}</span>
          <span className="hidden sm:inline">{m.hero_kicker()}</span>
        </motion.a>

        <motion.h1
          initial={heroReveal.initial}
          animate={heroReveal.visible}
          transition={revealTransition({
            duration: 0.42,
            delay: 0.04,
          })}
          className="mt-6 w-full max-w-88 text-balance wrap-break-word font-heading text-[1.875rem] font-semibold leading-[1.12] tracking-tight min-[380px]:text-[2rem] sm:mt-7 sm:max-w-5xl sm:text-6xl sm:leading-[1.05] lg:text-7xl"
        >
          {m.hero_title_prefix()}{" "}
          <span className="text-primary dark:brightness-175">
            {m.hero_title_highlight()}
          </span>{" "}
          {m.hero_title_suffix()}
        </motion.h1>

        <motion.p
          initial={heroReveal.initial}
          animate={heroReveal.visible}
          transition={revealTransition({
            duration: 0.42,
            delay: 0.08,
          })}
          className="mt-5 w-full max-w-84 text-pretty text-[0.9375rem] leading-6 text-muted-foreground sm:mt-7 sm:max-w-2xl sm:text-lg sm:leading-relaxed"
        >
          {m.hero_description()}
        </motion.p>

        <motion.div
          initial={heroReveal.initial}
          animate={heroReveal.visible}
          transition={revealTransition({
            duration: 0.42,
            delay: 0.12,
          })}
          className="mt-8 flex w-full max-w-68 flex-col items-stretch gap-3 sm:mt-10 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-3.5"
        >
          <Button
            render={<a href={hrefs.contact} />}
            nativeButton={false}
            size="lg"
            className="group w-full sm:w-auto"
          >
            {m.cta_schedule_demo()}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            render={<a href={hrefs.services} />}
            nativeButton={false}
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          >
            {m.hero_services_button()}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
