import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Clock3, UserRound } from "lucide-react";
import { getAllBlogArticles } from "#/features/blog/lib/blog";
import {
  getHomeSeo,
  getOgImageUrl,
  getSupportedLocale,
} from "#/features/landing/lib/seo";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";

export const Route = createFileRoute("/blog/")({
  loader: () => getAllBlogArticles({ data: { locale: getLocale() } }),
  head: ({ matches }) => {
    if (matches.at(-1)?.routeId !== "/blog/") {
      return {};
    }

    const locale = getSupportedLocale(getLocale());
    const seo = getHomeSeo(locale);
    const url = `${seo.url.replace(/\/$/, "")}/blog`;
    const image = getOgImageUrl(locale, {
      title: m.blog_title(),
      description: m.blog_description(),
    });

    return {
      meta: [
        {
          title: `${m.blog_title()} | ${seo.siteName}`,
        },
        {
          name: "description",
          content: m.blog_description(),
        },
        {
          property: "og:title",
          content: m.blog_title(),
        },
        {
          property: "og:description",
          content: m.blog_description(),
        },
        {
          property: "og:url",
          content: url,
        },
        {
          property: "og:image",
          content: image,
        },
        {
          property: "og:image:alt",
          content: m.blog_title(),
        },
        {
          name: "twitter:title",
          content: m.blog_title(),
        },
        {
          name: "twitter:description",
          content: m.blog_description(),
        },
        {
          name: "twitter:image",
          content: image,
        },
        {
          name: "twitter:image:alt",
          content: m.blog_title(),
        },
      ],
      links: [
        {
          rel: "canonical",
          href: url,
        },
      ],
    };
  },
  component: BlogIndexRoute,
});

function formatArticleDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Intl.DateTimeFormat(getLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function BlogIndexRoute() {
  const articles = Route.useLoaderData();

  return (
    <main className="bg-background pb-16 pt-28 text-foreground sm:pt-32 lg:pb-24 lg:pt-36">
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-medium text-muted-foreground text-sm">
          {m.blog_kicker()}
        </p>
        <div className="mt-3 pb-8">
          <h1 className="font-heading font-semibold text-3xl tracking-normal sm:text-5xl">
            {m.blog_title()}
          </h1>
          <p className="mt-5 text-base text-muted-foreground leading-7">
            {m.blog_description()}
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {articles.map((article, index) => (
            <Link
              key={article.slug}
              to="/blog/$slug"
              params={{ slug: article.slug }}
              className="group grid gap-5 border border-border bg-card p-5 text-card-foreground transition-[background-color,border-color,transform] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-primary/45 hover:bg-accent/40 active:scale-[0.995] md:grid-cols-[7rem_minmax(0,1fr)_auto] md:items-start"
            >
              <div className="flex items-center gap-3 md:block">
                <span className="font-mono text-muted-foreground text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="hidden h-px flex-1 bg-border md:mt-5 md:block" />
              </div>

              <article>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-4 text-primary" />
                    {m.blog_author_by({ author: article.author })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4 text-primary" />
                    {formatArticleDate(article.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-4 text-primary" />
                    {article.readTime}
                  </span>
                </div>

                <h2 className="mt-4 font-heading font-semibold text-2xl tracking-normal transition-colors group-hover:text-primary sm:text-3xl">
                  {article.title}
                </h2>
                <p className="mt-3 max-w-3xl text-muted-foreground leading-7">
                  {article.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-border bg-background px-2.5 py-1 font-mono text-muted-foreground text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>

              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center border border-border text-muted-foreground transition-[border-color,color,transform] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1 group-hover:border-primary/45 group-hover:text-primary md:mt-1"
              >
                <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
