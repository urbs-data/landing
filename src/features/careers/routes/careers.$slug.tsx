import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  MapPin,
  UsersRound,
} from "lucide-react";
import { getCareerPost } from "#/features/careers/lib/careers";
import {
  buildContactEmailHref,
  CAREERS_EMAIL,
} from "#/features/landing/lib/contact-email";
import {
  getHomeSeo,
  getOgImageUrl,
  getSupportedLocale,
} from "#/features/landing/lib/seo";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";

export const Route = createFileRoute("/careers/$slug")({
  loader: ({ params }) =>
    getCareerPost({ data: { locale: getLocale(), slug: params.slug } }),
  head: ({ loaderData, params }) => {
    const locale = getSupportedLocale(getLocale());
    const seo = getHomeSeo(locale);
    const title = loaderData?.title ?? m.careers_title();
    const description = loaderData?.description ?? m.careers_description();
    const url = `${seo.url.replace(/\/$/, "")}/careers/${params.slug}`;
    const image = getOgImageUrl(locale, {
      title,
      description,
    });

    return {
      meta: [
        {
          title: `${title} | ${seo.siteName}`,
        },
        {
          name: "description",
          content: description,
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
  component: CareerPostRoute,
});

function CareerPostRoute() {
  const post = Route.useLoaderData();

  if (!post) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-24 text-foreground">
        <section className="max-w-md text-center">
          <p className="font-medium text-muted-foreground text-sm">404</p>
          <h1 className="mt-3 font-heading font-semibold text-3xl">
            {m.careers_role_not_found_title()}
          </h1>
          <p className="mt-4 text-muted-foreground leading-7">
            {m.careers_role_not_found_description()}
          </p>
          <Link
            to="/careers"
            className="mt-8 inline-flex h-10 items-center justify-center gap-2 border border-border px-4 font-medium text-sm transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-primary/45 hover:bg-accent hover:text-primary active:scale-[0.98]"
          >
            <ArrowLeft className="size-4" />
            {m.careers_back_to_index()}
          </Link>
        </section>
      </main>
    );
  }

  const applyHref =
    post.applyUrl ||
    buildContactEmailHref({
      to: CAREERS_EMAIL,
      subject: `Postulacion - ${post.title}`,
      body: `Hola Urbs Data,\n\nQuiero postularme para: ${post.title}.\n\nNombre:\nLinkedIn / portfolio:\nMensaje:\n\nGracias.`,
    });

  return (
    <main className="bg-background pb-16 pt-28 text-foreground sm:pt-32 lg:pb-24 lg:pt-36">
      <article className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link
          to="/careers"
          className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          {m.careers_back_to_index()}
        </Link>

        <header className="mt-8 border-b border-border pb-8">
          <p className="font-medium text-muted-foreground text-sm">
            {m.careers_kicker()}
          </p>
          <h1 className="mt-5 font-heading font-semibold text-4xl tracking-normal sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-8">
            {post.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground text-sm">
            <span className="inline-flex items-center gap-1.5">
              <UsersRound className="size-4 text-primary" />
              <span className="sr-only">{m.careers_team_label()}: </span>
              {post.team}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" />
              <span className="sr-only">{m.careers_location_label()}: </span>
              {post.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness className="size-4 text-primary" />
              <span className="sr-only">{m.careers_type_label()}: </span>
              {post.type}
            </span>
          </div>

          <a
            href={applyHref}
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 border border-border bg-primary px-5 font-medium text-primary-foreground text-sm transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/90 active:scale-[0.98]"
          >
            {m.careers_apply()}
            <ArrowRight className="size-4" />
          </a>
        </header>

        <div
          className="mt-10 max-w-none text-foreground leading-8 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/30 [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:text-muted-foreground [&_code]:border [&_code]:border-border [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h2]:mt-12 [&_h2]:border-t [&_h2]:border-border [&_h2]:pt-8 [&_h2]:font-heading [&_h2]:font-semibold [&_h2]:text-3xl [&_h2]:tracking-normal [&_h3]:mt-8 [&_h3]:font-heading [&_h3]:font-semibold [&_h3]:text-2xl [&_h3]:tracking-normal [&_li]:pl-1 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:my-6 [&_pre]:my-7 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border [&_pre]:bg-secondary [&_pre]:p-4 [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_table]:my-7 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-3 [&_th]:border [&_th]:border-border [&_th]:bg-secondary [&_th]:p-3 [&_th]:text-left [&_ul]:my-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    </main>
  );
}
