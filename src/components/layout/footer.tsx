import { Link } from "@tanstack/react-router";
import { BrandWordmark } from "#/components/brand-wordmark";
import { getLandingAnchors } from "#/features/landing/lib/anchors";
import {
  buildContactEmailHref,
  CONTACT_EMAIL,
} from "#/features/landing/lib/contact-email";
import { m } from "#/paraglide/messages";
import { deLocalizeHref } from "#/paraglide/runtime";

type InternalNavigationPath = "/" | "/blog" | "/careers";

function getRouterLinkParts(href: string) {
  const url = new URL(deLocalizeHref(href), "http://localhost");
  const pathname = url.pathname as InternalNavigationPath;

  return {
    to: (["/", "/blog", "/careers"].includes(pathname)
      ? pathname
      : "/") satisfies InternalNavigationPath,
    hash: url.hash ? url.hash.slice(1) : undefined,
  };
}

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
        { label: m.nav_careers(), href: hrefs.careers },
        { label: m.nav_clients(), href: hrefs.clients },
        { label: m.nav_contact(), href: hrefs.contact },
      ],
    },
    {
      title: m.footer_resources_group(),
      links: [
        { label: m.nav_flow(), href: hrefs.flow },
        { label: m.footer_pymes(), href: hrefs.pymes },
        { label: m.footer_blog(), href: hrefs.blog },
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
            <BrandWordmark />
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
                {g.links.map((l) => {
                  const link = getRouterLinkParts(l.href);

                  return (
                    <li key={l.label}>
                      <Link
                        {...link}
                        activeOptions={{
                          exact: true,
                          includeHash: Boolean(link.hash),
                        }}
                        hashScrollIntoView={{ block: "start" }}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
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
