import { ClipboardList, Database, EyeOff, type LucideIcon } from "lucide-react";
import * as motion from "motion/react-client";
import { m } from "#/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { revealOnView } from "./animation";
import {
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from "./section-heading";
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
  const { ids } = getLandingAnchors();

  return (
    <section id={ids.problem} className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading className="max-w-3xl">
          <SectionKicker>{m.problem_kicker()}</SectionKicker>
          <SectionTitle>{m.problem_title()}</SectionTitle>
          <SectionDescription className="max-w-2xl">
            {m.problem_description()}
          </SectionDescription>
        </SectionHeading>

        <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {getProblems().map((problem, index) => (
            <article
              key={problem.tag}
              className="group bg-card p-7 transition-colors duration-150 ease-out-strong hover:bg-accent/40"
            >
              <motion.div
                {...revealOnView({
                  offset: 12,
                  duration: 0.3,
                  delay: index * 0.05,
                })}
                className="flex flex-col md:min-h-48"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex size-8 items-center justify-center border border-border bg-accent text-primary transition-colors duration-150 ease-out-strong group-hover:bg-primary group-hover:text-primary-foreground">
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
