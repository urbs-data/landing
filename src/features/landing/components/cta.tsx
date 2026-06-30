"use client";

import { ArrowRight, Check, Mail } from "lucide-react";
import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { buildContactEmailHref, CONTACT_EMAIL } from "../lib/contact-email";
import { landingEaseOut, revealTransform } from "./animation";
import { SectionKicker } from "./section-kicker";

export function CTA() {
  const reveal = revealTransform(16);
  const itemReveal = revealTransform(10);
  const contactEmailHref = buildContactEmailHref({
    subject: m.contact_email_subject(),
    body: m.contact_email_body(),
  });
  const { ids } = getLandingAnchors();
  const benefits = [
    m.contact_benefit_1(),
    m.contact_benefit_2(),
    m.contact_benefit_3(),
  ];
  const steps = [
    {
      tag: "01",
      title: m.contact_step_1_title(),
      desc: m.contact_step_1_desc(),
    },
    {
      tag: "02",
      title: m.contact_step_2_title(),
      desc: m.contact_step_2_desc(),
    },
    {
      tag: "03",
      title: m.contact_step_3_title(),
      desc: m.contact_step_3_desc(),
    },
  ];

  return (
    <section id={ids.contact} className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={reveal.initial}
            whileInView={reveal.visible}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.36, ease: landingEaseOut }}
            className="max-w-xl"
          >
            <SectionKicker>{m.contact_kicker()}</SectionKicker>
            <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {m.contact_title()}
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              {m.contact_description()}
            </p>

            <ul className="mt-8 space-y-3">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  initial={itemReveal.initial}
                  whileInView={itemReveal.visible}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.28,
                    delay: 0.08 + index * 0.04,
                    ease: landingEaseOut,
                  }}
                  className="flex items-start gap-3 text-sm text-foreground/85"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center bg-success/15 text-success dark:brightness-175">
                    <Check className="size-3.5" />
                  </span>
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={itemReveal.initial}
              whileInView={itemReveal.visible}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.28, delay: 0.2, ease: landingEaseOut }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button
                render={<a href={contactEmailHref} />}
                nativeButton={false}
                size="lg"
                className="group w-full sm:w-auto"
              >
                {m.cta_schedule_demo()}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                render={<a href={contactEmailHref} />}
                nativeButton={false}
                size="lg"
                variant="outline"
                className="group w-full sm:w-auto"
              >
                <Mail className="size-4" />
                {CONTACT_EMAIL}
              </Button>
            </motion.div>
          </motion.div>

          <div className="lg:self-center">
            <div className="overflow-hidden border border-border bg-card">
              {steps.map((step, index) => (
                <div
                  key={step.tag}
                  className="border-border border-b bg-card p-6 last:border-b-0"
                >
                  <motion.div
                    initial={itemReveal.initial}
                    whileInView={itemReveal.visible}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.055,
                      ease: landingEaseOut,
                    }}
                    className="flex items-start gap-4"
                  >
                    <span className="font-mono text-sm text-primary dark:brightness-175">
                      {step.tag}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            <motion.p
              initial={itemReveal.initial}
              whileInView={itemReveal.visible}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.28, delay: 0.18, ease: landingEaseOut }}
              className="mt-4 font-mono text-xs text-muted-foreground"
            >
              {m.contact_response_note()}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
