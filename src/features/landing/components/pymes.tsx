"use client";

import { ArrowRight, Check } from "lucide-react";
import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { landingEaseOut, revealTransform } from "./animation";
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
  const headingReveal = revealTransform(18);
  const reveal = revealTransform(12);
  const { hrefs, ids } = getLandingAnchors();

  return (
    <section id={ids.pymes} className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <motion.div
          initial={headingReveal.initial}
          whileInView={headingReveal.visible}
          style={headingReveal.initial}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.38, ease: landingEaseOut }}
        >
          <SectionKicker>{m.pymes_kicker()}</SectionKicker>
          <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl">
            {m.pymes_title()}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {m.pymes_description()}
          </p>
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
        </motion.div>

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {getBenefits().map((b, i) => (
            <div key={b} className="bg-card p-5">
              <motion.div
                initial={reveal.initial}
                whileInView={reveal.visible}
                style={reveal.initial}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.3,
                  ease: landingEaseOut,
                  delay: i * 0.04,
                }}
                className="flex items-start gap-3 will-change-transform"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center bg-success/15 text-success dark:brightness-200">
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
