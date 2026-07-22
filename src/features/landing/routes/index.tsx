import { createFileRoute } from "@tanstack/react-router";
import { CTA } from "../components/cta";
import { DataFlow } from "../components/data-flow";
import { Hero } from "../components/hero";
import { ProblemSection } from "../components/problem-section";
import { Pymes } from "../components/pymes";
import { Services } from "../components/services";
import { TrustedCompanies } from "../components/trusted-companies";

// Canonical and hreflang links are emitted for every route by __root.tsx.
export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <Hero />
      <ProblemSection />
      <Services />
      <DataFlow />
      <Pymes />
      <TrustedCompanies />
      <CTA />
    </main>
  );
}
