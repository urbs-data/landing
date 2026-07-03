"use client";

import {
  BrainCircuit,
  Code2,
  Database,
  type LucideIcon,
  Workflow,
} from "lucide-react";
import * as motion from "motion/react-client";
import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import {
  revealTransform,
  revealTransition,
  usePrefersReducedMotion,
} from "./animation";
import { SectionKicker } from "./section-kicker";

type Service = {
  icon: LucideIcon;
  title: string;
  desc: string;
  items: string[];
};

function getServices(): Service[] {
  return [
    {
      icon: Database,
      title: m.service_data_title(),
      desc: m.service_data_desc(),
      items: [
        m.service_data_item_1(),
        m.service_data_item_2(),
        m.service_data_item_3(),
        m.service_data_item_4(),
        m.service_data_item_5(),
      ],
    },
    {
      icon: BrainCircuit,
      title: m.service_ai_title(),
      desc: m.service_ai_desc(),
      items: [
        m.service_ai_item_1(),
        m.service_ai_item_2(),
        m.service_ai_item_3(),
        m.service_ai_item_4(),
        m.service_ai_item_5(),
      ],
    },
    {
      icon: Workflow,
      title: m.service_automation_title(),
      desc: m.service_automation_desc(),
      items: [
        m.service_automation_item_1(),
        m.service_automation_item_2(),
        m.service_automation_item_3(),
        m.service_automation_item_4(),
        m.service_automation_item_5(),
      ],
    },
    {
      icon: Code2,
      title: m.service_bi_title(),
      desc: m.service_bi_desc(),
      items: [
        m.service_bi_item_1(),
        m.service_bi_item_2(),
        m.service_bi_item_3(),
        m.service_bi_item_4(),
        m.service_bi_item_5(),
      ],
    },
  ];
}

export function Services() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const headingReveal = revealTransform(18, prefersReducedMotion);
  const reveal = revealTransform(16, prefersReducedMotion);
  const { ids } = getLandingAnchors();

  return (
    <section
      id={ids.services}
      className="border-b border-border py-20 sm:py-28"
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
          <SectionKicker>{m.services_kicker()}</SectionKicker>
          <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl">
            {m.services_title()}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {m.services_description()}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {getServices().map((s, i) => (
            <article
              key={s.title}
              className="group bg-card p-7 transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-accent/40"
            >
              <motion.div
                initial={reveal.initial}
                whileInView={reveal.visible}
                style={reveal.initial}
                viewport={{ once: true, margin: "-80px" }}
                transition={revealTransition({
                  duration: 0.34,
                  delay: i * 0.05,
                  prefersReducedMotion,
                })}
              >
                <div className="flex size-11 items-center justify-center border border-border bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon className="size-5 dark:brightness-175" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
                <ul className="mt-5 space-y-2">
                  {s.items.map((it) => (
                    <li
                      key={it}
                      className="flex items-start gap-2.5 text-sm text-foreground/80"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 bg-primary dark:brightness-175" />
                      {it}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
