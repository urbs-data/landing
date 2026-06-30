import { createFileRoute } from "@tanstack/react-router";
import { CTA } from "../components/cta";
import { DataFlow } from "../components/data-flow";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { Hero } from "../components/hero";
import { ProblemSection } from "../components/problem-section";
import { Pymes } from "../components/pymes";
import { Services } from "../components/services";
import { TrustedCompanies } from "../components/trusted-companies";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <Services />
        <DataFlow />
        <Pymes />
        <TrustedCompanies />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
