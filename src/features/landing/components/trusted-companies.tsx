import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { SectionKicker } from "./section-kicker";

const companies = [
  { name: "Cahpsa", src: "/companies/cahpsa.svg" },
  { name: "CIGRA", src: "/companies/cigra.svg" },
  { name: "Byontek", src: "/companies/byontek.svg" },
  { name: "Crédito Argentino", src: "/companies/credito-argentino.svg" },
  { name: "4Plus", src: "/companies/4plus.svg" },
  { name: "MacroAgro", src: "/companies/macroagro.svg" },
  { name: "LBO", src: "/companies/lbo.svg" },
  { name: "Nexo", src: "/companies/nexo.svg" },
  { name: "Corteva", src: "/companies/corteva.svg" },
  { name: "Hemisphere", src: "/companies/hemisphere.svg" },
  { name: "Rosental", src: "/companies/rosental.svg" },
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
                key={`${company.name}-${i}`}
                className="flex h-16 w-44 shrink-0 items-center justify-center sm:h-20 sm:w-56"
                aria-hidden={i >= companies.length}
              >
                <span
                  aria-label={company.name}
                  role="img"
                  className="h-10 w-36 bg-current text-foreground opacity-70 sm:h-12 sm:w-48"
                  style={{
                    mask: `url(${company.src}) center / contain no-repeat`,
                    WebkitMask: `url(${company.src}) center / contain no-repeat`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
