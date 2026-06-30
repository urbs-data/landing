"use client";

import {
  Boxes,
  CircleHelp,
  FileSpreadsheet,
  Layers,
  type LucideIcon,
  Sparkles,
  Target,
  Warehouse,
} from "lucide-react";
import * as motion from "motion/react-client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import {
  revealTransform,
  revealTransition,
  usePrefersReducedMotion,
} from "./animation";
import { SectionKicker } from "./section-kicker";

type Step = {
  icon: LucideIcon;
  title: string;
  desc: string;
  info?: {
    title: string;
    desc: string;
  };
};

function getSteps(): Step[] {
  return [
    {
      icon: FileSpreadsheet,
      title: m.flow_sources_title(),
      desc: m.flow_sources_desc(),
    },
    {
      icon: Boxes,
      title: m.flow_ingest_title(),
      desc: m.flow_ingest_desc(),
      info: {
        title: m.flow_ingest_info_title(),
        desc: m.flow_ingest_info_desc(),
      },
    },
    {
      icon: Warehouse,
      title: m.flow_warehouse_title(),
      desc: m.flow_warehouse_desc(),
      info: {
        title: m.flow_warehouse_info_title(),
        desc: m.flow_warehouse_info_desc(),
      },
    },
    {
      icon: Layers,
      title: m.flow_modeling_title(),
      desc: m.flow_modeling_desc(),
      info: {
        title: m.flow_modeling_info_title(),
        desc: m.flow_modeling_info_desc(),
      },
    },
    {
      icon: Sparkles,
      title: m.flow_ai_bi_title(),
      desc: m.flow_ai_bi_desc(),
      info: {
        title: m.flow_ai_bi_info_title(),
        desc: m.flow_ai_bi_info_desc(),
      },
    },
    {
      icon: Target,
      title: m.flow_decisions_title(),
      desc: m.flow_decisions_desc(),
    },
  ];
}

export function DataFlow() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const headingReveal = revealTransform(18, prefersReducedMotion);
  const reveal = revealTransform(14, prefersReducedMotion);
  const steps = getSteps();
  const { ids } = getLandingAnchors();

  return (
    <section
      id={ids.flow}
      className="relative border-b border-border py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={headingReveal.initial}
          whileInView={headingReveal.visible}
          style={headingReveal.initial}
          viewport={{ once: true, margin: "-80px" }}
          transition={revealTransition({
            duration: 0.38,
            prefersReducedMotion,
          })}
          className="max-w-2xl"
        >
          <SectionKicker>{m.flow_kicker()}</SectionKicker>
          <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl">
            {m.flow_title()}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {m.flow_description()}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-y-8 md:grid-cols-6 md:gap-x-0 md:gap-y-10">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={reveal.initial}
              whileInView={reveal.visible}
              viewport={{ once: true, margin: "-60px" }}
              transition={revealTransition({
                duration: 0.32,
                delay: i * 0.05,
                prefersReducedMotion,
              })}
              className="relative md:px-3"
            >
              {i < steps.length - 1 && (
                <svg
                  aria-hidden="true"
                  className="absolute left-6 top-12 h-[calc(100%+2rem)] w-px text-primary md:hidden"
                  preserveAspectRatio="none"
                  viewBox="0 0 2 100"
                >
                  <line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2="100"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="landing-flow-line"
                  />
                </svg>
              )}

              {i < steps.length - 1 && (
                <svg
                  aria-hidden="true"
                  className="absolute left-1/2 top-6 hidden h-px w-full text-primary dark:brightness-175 md:block"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 2"
                >
                  <line
                    x1="0"
                    y1="1"
                    x2="100"
                    y2="1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="landing-flow-line"
                  />
                </svg>
              )}

              <div className="relative z-10 flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <div className="flex shrink-0 flex-col items-center">
                  <div className="flex size-12 items-center justify-center border border-border bg-card text-primary shadow-sm">
                    <s.icon className="size-5 dark:brightness-175" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div>
                    {s.info ? (
                      <HoverCard>
                        <h3>
                          <HoverCardTrigger
                            aria-label={`${m.flow_info_label()}: ${s.info.title}`}
                            className="inline-flex items-center gap-1.5 text-left text-sm font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:text-center"
                            render={<button type="button" />}
                          >
                            <span>{s.title}</span>
                            <CircleHelp className="size-3.5 shrink-0" />
                          </HoverCardTrigger>
                        </h3>
                        <HoverCardContent
                          side="top"
                          className="w-72 rounded-md border border-border bg-popover p-4 text-left shadow-lg"
                        >
                          <p className="text-sm font-semibold text-popover-foreground">
                            {s.info.title}
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            {s.info.desc}
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      <h3 className="text-sm font-semibold">{s.title}</h3>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground md:px-1">
                    {s.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
