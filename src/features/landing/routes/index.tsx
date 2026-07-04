import { createFileRoute } from "@tanstack/react-router";
import { getLocale } from "#/paraglide/runtime";
import { CTA } from "../components/cta";
import { DataFlow } from "../components/data-flow";
import { Hero } from "../components/hero";
import { ProblemSection } from "../components/problem-section";
import { Pymes } from "../components/pymes";
import { Services } from "../components/services";
import { TrustedCompanies } from "../components/trusted-companies";
import { getHomeSeo, getSupportedLocale } from "../lib/seo";

export const Route = createFileRoute("/")({
  head: () => {
    const seo = getHomeSeo(getSupportedLocale(getLocale()));

    return {
      links: [
        {
          rel: "canonical",
          href: seo.url,
        },
      ],
    };
  },
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
