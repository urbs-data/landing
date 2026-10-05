import {
  BrainCircuit,
  Code2,
  Database,
  type LucideIcon,
  Workflow,
} from "lucide-react";
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
  const { ids } = getLandingAnchors();

  return (
    <section
      id={ids.services}
      className="border-b border-border py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading className="max-w-2xl">
          <SectionKicker>{m.services_kicker()}</SectionKicker>
          <SectionTitle>{m.services_title()}</SectionTitle>
          <SectionDescription>{m.services_description()}</SectionDescription>
        </SectionHeading>

        <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {getServices().map((s, i) => (
            <article
              key={s.title}
              className="group bg-card p-7 transition-colors duration-150 ease-out-strong hover:bg-accent/40"
            >
              <motion.div
                {...revealOnView({
                  offset: 16,
                  duration: 0.34,
                  delay: i * 0.05,
                  margin: "-80px",
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
