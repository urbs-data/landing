import { UrbsWordmark } from "#/components/urbs-wordmark";
import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { buildContactEmailHref, CONTACT_EMAIL } from "../lib/contact-email";

function getGroups() {
  const { hrefs } = getLandingAnchors();

  return [
    {
      title: m.footer_services_group(),
      links: [
        { label: m.service_data_title(), href: hrefs.services },
        { label: m.footer_ai(), href: hrefs.services },
        { label: m.footer_automation(), href: hrefs.services },
        { label: m.footer_bi(), href: hrefs.services },
      ],
    },
    {
      title: m.footer_company_group(),
      links: [
        { label: m.nav_flow(), href: hrefs.flow },
        { label: m.nav_clients(), href: hrefs.clients },
        { label: m.footer_pymes(), href: hrefs.pymes },
        { label: m.nav_contact(), href: hrefs.contact },
      ],
    },
  ];
}

export function Footer() {
  const contactEmailHref = buildContactEmailHref({
    subject: m.contact_email_subject(),
    body: m.contact_email_body(),
  });

  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <UrbsWordmark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {m.footer_description()}
            </p>
            <a
              href={contactEmailHref}
              className="mt-4 inline-block font-mono text-sm text-primary hover:underline dark:brightness-175"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          {getGroups().map((g) => (
            <div key={g.title}>
              <h3 className="text-sm font-semibold">{g.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-muted-foreground">
            {m.footer_rights({ year: new Date().getFullYear() })}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {m.footer_made_in()}
          </p>
        </div>
      </div>
    </footer>
  );
}
