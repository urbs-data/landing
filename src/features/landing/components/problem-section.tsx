"use client";

import { ClipboardList, Database, EyeOff, type LucideIcon } from "lucide-react";
import * as motion from "motion/react-client";
import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { revealTransform, revealTransition } from "./animation";
import { SectionKicker } from "./section-kicker";

type Problem = {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
};

function getProblems(): Problem[] {
  return [
    {
      icon: Database,
      tag: "01",
      title: m.problem_card_data_title(),
      description: m.problem_card_data_description(),
    },
    {
      icon: ClipboardList,
      tag: "02",
      title: m.problem_card_manual_title(),
      description: m.problem_card_manual_description(),
    },
    {
      icon: EyeOff,
      tag: "03",
      title: m.problem_card_blind_title(),
      description: m.problem_card_blind_description(),
    },
  ];
}

export function ProblemSection() {
  const headingReveal = revealTransform(18);
  const cardReveal = revealTransform(12);
  const { ids } = getLandingAnchors();

  return (
    <section id={ids.problem} className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={headingReveal.initial}
          whileInView={headingReveal.visible}
          style={headingReveal.initial}
          viewport={{ once: true, margin: "-80px" }}
          transition={revealTransition({
            duration: 0.38,
          })}
          className="max-w-3xl"
        >
          <SectionKicker>{m.problem_kicker()}</SectionKicker>
          <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl">
            {m.problem_title()}
          </h2>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {m.problem_description()}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {getProblems().map((problem, index) => (
            <article
              key={problem.tag}
              className="group bg-card p-7 transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-accent/40"
            >
              <motion.div
                initial={cardReveal.initial}
                whileInView={cardReveal.visible}
                style={cardReveal.initial}
                viewport={{ once: true, margin: "-60px" }}
                transition={revealTransition({
                  duration: 0.3,
                  delay: index * 0.05,
                })}
                className="flex flex-col md:min-h-48"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex size-8 items-center justify-center border border-border bg-accent text-primary transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:bg-primary group-hover:text-primary-foreground">
                    <problem.icon className="size-4 dark:brightness-175" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {problem.tag}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold">{problem.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {problem.description}
                </p>
              </motion.div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
