"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { landingEaseOut, revealTransform } from "./animation";
import { ConnectionsCanvas } from "./connections-canvas";

export function Hero() {
  const badgeReveal = revealTransform(12);
  const heroReveal = revealTransform(18);
  const { hrefs, ids } = getLandingAnchors();

  return (
    <section
      id={ids.top}
      className="relative isolate min-h-svh overflow-hidden border-b border-border"
    >
      <div className="absolute inset-x-0 bottom-0 top-16 -z-10">
        <ConnectionsCanvas
          className="size-full [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_5rem)] mask-[linear-gradient(to_bottom,transparent,black_5rem)]"
          density={2}
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/40 via-background/70 to-background" />
      </div>

      <div className="mx-auto flex min-h-svh max-w-6xl flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:px-6 sm:pt-32">
        <motion.a
          href={hrefs.flow}
          initial={badgeReveal.initial}
          animate={badgeReveal.visible}
          transition={{ duration: 0.36, ease: landingEaseOut }}
          className="inline-flex items-center gap-2 border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <Sparkles className="size-3.5 text-primary" />
          <span className="sm:hidden">{m.hero_kicker_short()}</span>
          <span className="hidden sm:inline">{m.hero_kicker()}</span>
        </motion.a>

        <motion.h1
          initial={heroReveal.initial}
          animate={heroReveal.visible}
          transition={{ duration: 0.42, ease: landingEaseOut, delay: 0.04 }}
          className="mt-6 max-w-5xl text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {m.hero_title_prefix()}{" "}
          <span className="text-primary">{m.hero_title_highlight()}</span>{" "}
          {m.hero_title_suffix()}
        </motion.h1>

        <motion.p
          initial={heroReveal.initial}
          animate={heroReveal.visible}
          transition={{ duration: 0.42, ease: landingEaseOut, delay: 0.08 }}
          className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {m.hero_description()}
        </motion.p>

        <motion.div
          initial={heroReveal.initial}
          animate={heroReveal.visible}
          transition={{ duration: 0.42, ease: landingEaseOut, delay: 0.12 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
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
