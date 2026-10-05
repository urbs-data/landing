import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  MapPin,
  UsersRound,
} from "lucide-react";
import { getAllCareerPosts } from "#/features/careers/lib/careers";
import {
  buildContactEmailHref,
  CAREERS_EMAIL,
} from "#/features/landing/lib/contact-email";
import { pageHead } from "#/features/landing/lib/seo";
import { toAppLocale } from "#/i18n";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";

export const Route = createFileRoute("/careers/")({
  loader: () => getAllCareerPosts({ data: { locale: getLocale() } }),
  head: () => ({
    meta: pageHead({
      locale: toAppLocale(getLocale()),
      path: "/careers",
      title: m.careers_title(),
      description: m.careers_description(),
    }).meta,
  }),
  component: CareersIndexRoute,
});

function CareersIndexRoute() {
  const posts = Route.useLoaderData();
  const openApplicationHref = buildContactEmailHref({
    to: CAREERS_EMAIL,
    subject: m.careers_spontaneous_email_subject(),
    body: m.careers_spontaneous_email_body({ email: CAREERS_EMAIL }),
  });

  return (
    <main className="bg-background pb-16 pt-28 text-foreground sm:pt-32 lg:pb-24 lg:pt-36">
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-medium text-muted-foreground text-sm">
          {m.careers_kicker()}
        </p>
        <div className="mt-3 max-w-4xl pb-8">
          <h1 className="font-heading font-semibold text-4xl tracking-normal sm:text-6xl">
            {m.careers_title()}
          </h1>
          <p className="mt-6 max-w-3xl text-base text-muted-foreground leading-7 sm:text-lg sm:leading-8">
            {m.careers_description()}
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="mt-8 grid gap-4">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to="/careers/$slug"
                params={{ slug: post.slug }}
                className="group grid gap-5 border border-border bg-card p-5 text-card-foreground transition-[background-color,border-color,transform] duration-180 ease-out-strong hover:border-primary/45 hover:bg-accent/40 active:scale-[0.995] md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
              >
                <article>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <UsersRound className="size-4 text-primary" />
                      {post.team}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4 text-primary" />
                      {post.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BriefcaseBusiness className="size-4 text-primary" />
                      {post.type}
                    </span>
                  </div>

                  <h2 className="mt-4 font-heading font-semibold text-2xl tracking-normal transition-colors group-hover:text-primary sm:text-3xl">
                    {post.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-muted-foreground leading-7">
                    {post.description}
                  </p>
                </article>

                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center border border-border text-muted-foreground transition-[border-color,color,transform] duration-180 ease-out-strong group-hover:translate-x-1 group-hover:border-primary/45 group-hover:text-primary md:mt-1"
                >
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 border border-border bg-card p-6 text-card-foreground">
            <h2 className="font-heading font-semibold text-2xl tracking-normal">
              {m.careers_empty_title()}
            </h2>
            <p className="mt-3 text-muted-foreground leading-7">
              {m.careers_empty_description()}
            </p>
          </div>
        )}

        <a
          href={openApplicationHref}
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 border border-border bg-primary px-5 font-medium text-primary-foreground text-sm transition-[background-color,transform] duration-150 ease-out-strong hover:bg-primary/90 active:scale-[0.98]"
        >
          {m.careers_apply_spontaneous()}
          <ArrowRight className="size-4" />
        </a>
        <p className="mt-3 text-muted-foreground text-sm">
          {m.careers_apply_note({ email: CAREERS_EMAIL })}
        </p>
      </section>
    </main>
  );
}
