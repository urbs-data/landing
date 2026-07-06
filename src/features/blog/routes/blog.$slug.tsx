import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock3, UserRound } from "lucide-react";
import { getBlogArticle } from "#/features/blog/lib/blog";
import {
  getHomeSeo,
  getOgImageUrl,
  getSeoTitle,
  getSupportedLocale,
} from "#/features/landing/lib/seo";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) =>
    getBlogArticle({ data: { locale: getLocale(), slug: params.slug } }),
  head: ({ loaderData, params }) => {
    const locale = getSupportedLocale(getLocale());
    const seo = getHomeSeo(locale);
    const title = loaderData?.title ?? m.blog_title();
    const description = loaderData?.description ?? m.blog_description();
    const url = `${seo.url.replace(/\/$/, "")}/blog/${params.slug}`;
    const image = getOgImageUrl(locale, {
      title,
      description,
    });

    return {
      meta: [
        {
          title: getSeoTitle(title),
        },
        {
          name: "description",
          content: description,
        },
        {
          property: "og:type",
          content: "article",
        },
        {
          property: "og:title",
          content: title,
        },
        {
          property: "og:description",
          content: description,
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
          content: title,
        },
        ...(loaderData
          ? [
              {
                property: "article:published_time",
                content: loaderData.date,
              },
              {
                property: "article:author",
                content: loaderData.author,
              },
              ...loaderData.tags.map((tag) => ({
                property: "article:tag",
                content: tag,
              })),
            ]
          : []),
        {
          name: "twitter:title",
          content: title,
        },
        {
          name: "twitter:description",
          content: description,
        },
        {
          name: "twitter:image",
          content: image,
        },
        {
          name: "twitter:image:alt",
          content: title,
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
  component: BlogArticleRoute,
});

function formatArticleDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Intl.DateTimeFormat(getLocale(), {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function BlogArticleRoute() {
  const article = Route.useLoaderData();

  if (!article) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-24 text-foreground">
        <section className="max-w-md text-center">
          <p className="font-medium text-muted-foreground text-sm">404</p>
          <h1 className="mt-3 font-heading font-semibold text-3xl">
            {m.blog_article_not_found_title()}
          </h1>
          <p className="mt-4 text-muted-foreground leading-7">
            {m.blog_article_not_found_description()}
          </p>
          <Link
            to="/blog"
            className="mt-8 inline-flex h-10 items-center justify-center gap-2 border border-border px-4 font-medium text-sm transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-primary/45 hover:bg-accent hover:text-primary active:scale-[0.98]"
          >
            <ArrowLeft className="size-4" />
            {m.blog_back_to_index()}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-background pb-16 pt-28 text-foreground sm:pt-32 lg:pb-24 lg:pt-36">
      <article className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          {m.blog_back_to_index()}
        </Link>

        <header className="mt-8 border-b border-border pb-8">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="border border-border bg-secondary px-2.5 py-1 font-mono text-muted-foreground text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-5 font-heading font-semibold text-4xl tracking-normal sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-8">
            {article.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground text-sm">
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
        </header>

        {article.coverImage ? (
          <figure className="mt-8">
            <img
              src={article.coverImage}
              alt={article.coverImageAlt || article.title}
              className="aspect-video w-full border border-border bg-secondary object-cover"
            />
          </figure>
        ) : null}

        <div
          className="mt-10 max-w-none text-foreground leading-8 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/30 [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:text-muted-foreground [&_code]:border [&_code]:border-border [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h2]:mt-12 [&_h2]:border-t [&_h2]:border-border [&_h2]:pt-8 [&_h2]:font-heading [&_h2]:font-semibold [&_h2]:text-3xl [&_h2]:tracking-normal [&_h3]:mt-8 [&_h3]:font-heading [&_h3]:font-semibold [&_h3]:text-2xl [&_h3]:tracking-normal [&_img]:my-8 [&_img]:w-full [&_img]:border [&_img]:border-border [&_img]:bg-secondary [&_img]:object-cover [&_li]:pl-1 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:my-6 [&_pre]:my-7 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border [&_pre]:bg-secondary [&_pre]:p-4 [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_table]:my-7 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-3 [&_th]:border [&_th]:border-border [&_th]:bg-secondary [&_th]:p-3 [&_th]:text-left [&_ul]:my-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      </article>
    </main>
  );
}
