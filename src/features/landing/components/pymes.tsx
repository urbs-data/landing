import { ArrowRight, Check } from "lucide-react";
import * as motion from "motion/react-client";
import { Button } from "#/components/ui/button";
import { m } from "#/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { revealOnView } from "./animation";
import {
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from "./section-heading";
import { SectionKicker } from "./section-kicker";

function getBenefits() {
  return [
    m.pymes_benefit_1(),
    m.pymes_benefit_2(),
    m.pymes_benefit_3(),
    m.pymes_benefit_4(),
    m.pymes_benefit_5(),
    m.pymes_benefit_6(),
  ];
}

export function Pymes() {
  const { hrefs, ids } = getLandingAnchors();

  return (
    <section id={ids.pymes} className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <SectionHeading>
          <SectionKicker>{m.pymes_kicker()}</SectionKicker>
          <SectionTitle>{m.pymes_title()}</SectionTitle>
          <SectionDescription>{m.pymes_description()}</SectionDescription>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              render={<a href={hrefs.contact} />}
              nativeButton={false}
              size="lg"
              className="group"
            >
              {m.pymes_button()}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </SectionHeading>

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {getBenefits().map((b, i) => (
            <div key={b} className="bg-card p-5">
              <motion.div
                {...revealOnView({
                  offset: 12,
                  duration: 0.3,
                  delay: i * 0.04,
                })}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center bg-success/15 text-success dark:brightness-175">
                  <Check className="size-3.5" />
                </span>
                <p className="text-sm leading-relaxed text-foreground/85">
                  {b}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
