import { createFileRoute } from "@tanstack/react-router";
import { OtpAccessGate } from "#/components/otp-access-gate";
import { Footer } from "#/features/landing/components/footer";
import { Header } from "#/features/landing/components/header";
import { m } from "#/paraglide/messages";
import { SignatureBuilder } from "../components/signature-builder";

export const Route = createFileRoute("/signatures")({
  component: SignaturesRoute,
});

function SignaturesRoute() {
  return (
    <OtpAccessGate
      title={m.signatures_gate_title()}
      description={m.signatures_gate_description()}
    >
      <Header />
      <main className="bg-background pb-16 pt-28 text-foreground sm:pt-36 lg:pb-24 lg:pt-40">
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-medium text-muted-foreground text-sm">
            {m.signatures_kicker()}
          </p>
          <div className="mt-3 max-w-2xl pb-8">
            <h1 className="font-heading font-semibold text-3xl tracking-normal sm:text-5xl">
              {m.signatures_title()}
            </h1>
            <p className="mt-5 text-muted-foreground text-base leading-7">
              {m.signatures_description()}
            </p>
          </div>

          <div className="mt-8">
            <SignatureBuilder />
          </div>
        </section>
      </main>
      <Footer />
    </OtpAccessGate>
  );
}
