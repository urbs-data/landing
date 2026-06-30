import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { SectionKicker } from "./section-kicker";

const companies = [
  "Crédito Argentino",
  "LBO S.A",
  "Byontek",
  "CIGRA",
  "IRIS",
  "4Plus",
  "Nexo",
  "Cahpsa",
  "Hemisphere",
  "MacroAgro",
];

export function TrustedCompanies() {
  const { ids } = getLandingAnchors();

  return (
    <section id={ids.clients} className="border-b border-border py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionKicker className="text-center">
          {m.clients_kicker()}
        </SectionKicker>

        <div className="relative mt-8 overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-marquee">
            {[...companies, ...companies].map((company, i) => (
              <div
                key={`${company}-${i}`}
                className="flex items-center gap-2 px-8"
                aria-hidden={i >= companies.length}
              >
                <span className="size-2 bg-primary" />
                <span className="whitespace-nowrap text-lg font-medium text-foreground/70">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
