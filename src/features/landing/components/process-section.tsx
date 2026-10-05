import * as motion from "motion/react-client";
import { m } from "#/paraglide/messages";
import { revealOnView } from "./animation";
import { ProcessLoopCircuit } from "./process-loop-circuit";
import { getProcessSteps } from "./process-steps";
import {
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from "./section-heading";
import { SectionKicker } from "./section-kicker";

export function ProcessSection() {
  const processSteps = getProcessSteps();

  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading className="max-w-3xl">
          <SectionKicker>{m.process_kicker()}</SectionKicker>
          <SectionTitle>{m.process_title()}</SectionTitle>
          <SectionDescription className="max-w-2xl">
            {m.process_description()}
          </SectionDescription>
        </SectionHeading>

        <motion.div
          {...revealOnView({ offset: 12, duration: 0.36, delay: 0.12 })}
          className="mt-8"
        >
          <ProcessLoopCircuit steps={processSteps} />
        </motion.div>
      </div>
    </section>
  );
}
