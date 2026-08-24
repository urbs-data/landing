"use client";

import * as motion from "motion/react-client";
import { m } from "@/paraglide/messages";
import { revealTransform, revealTransition } from "./animation";
import { ProcessLoopCircuit } from "./process-loop-circuit";
import { getProcessSteps } from "./process-steps";
import { SectionKicker } from "./section-kicker";

export function ProcessSection() {
  const headingReveal = revealTransform(18);
  const loopReveal = revealTransform(12);
  const processSteps = getProcessSteps();

  return (
    <section className="border-b border-border py-20 sm:py-28">
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
          <SectionKicker>{m.process_kicker()}</SectionKicker>
          <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl">
            {m.process_title()}
          </h2>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {m.process_description()}
          </p>
        </motion.div>

        <motion.div
          initial={loopReveal.initial}
          whileInView={loopReveal.visible}
          style={loopReveal.initial}
          viewport={{ once: true, margin: "-60px" }}
          transition={revealTransition({
            duration: 0.36,
            delay: 0.12,
          })}
          className="mt-8"
        >
          <ProcessLoopCircuit steps={processSteps} />
        </motion.div>
      </div>
    </section>
  );
}
