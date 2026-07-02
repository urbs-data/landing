import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  FileText,
  Palette,
  Presentation,
  Type,
} from "lucide-react";
import { OtpAccessGate } from "#/components/otp-access-gate";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Footer } from "#/features/landing/components/footer";
import { Header } from "#/features/landing/components/header";
import { getPresentationTemplateCatalog } from "#/features/presentations/lib/template-catalog";
import { getEmployeeAccess } from "#/lib/employee-access";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";

const PRESENTATION_FONT_LINKS = [
  {
    name: "Instrument Sans",
    href: "https://fontsource.org/fonts/instrument-sans",
  },
  {
    name: "IBM Plex Sans",
    href: "https://fontsource.org/fonts/ibm-plex-sans",
  },
  {
    name: "Pitagon Sans Mono",
    href: "https://fontsource.org/fonts/pitagon-sans-mono",
  },
];

export const Route = createFileRoute("/presentations")({
  loader: () => getEmployeeAccess(),
  component: PresentationsRoute,
});

function TemplatePreview({ templateKey }: { templateKey: string }) {
  return (
    <div className="mb-4 aspect-video overflow-hidden border border-border bg-secondary">
      <img
        src={`/presentations/previews/${templateKey}.png`}
        alt=""
        loading="lazy"
        className="size-full object-cover"
      />
    </div>
  );
}

function PresentationsRoute() {
  const { hasAccess } = Route.useLoaderData();
  const locale = getLocale();
  const templates = getPresentationTemplateCatalog();

  return (
    <OtpAccessGate
      hasAccess={hasAccess}
      title={m.presentations_gate_title()}
      description={m.presentations_gate_description()}
    >
      <Header />
      <main className="bg-background pb-16 pt-32 text-foreground lg:pb-24 lg:pt-36">
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-medium text-muted-foreground text-sm">
            {m.presentations_kicker()}
          </p>
          <div className="mt-3 grid gap-5">
            <h1 className="font-heading font-semibold text-4xl tracking-normal sm:text-5xl">
              {m.presentations_title()}
            </h1>
            <p className="text-muted-foreground text-base leading-7">
              {m.presentations_description()}
            </p>
          </div>

          <div className="mt-6 flex gap-3 border border-border bg-secondary/40 p-4 text-muted-foreground text-sm leading-6">
            <Type className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              {m.presentations_fonts_note_intro()}{" "}
              {PRESENTATION_FONT_LINKS.map((font, index) => (
                <span key={font.href}>
                  {index > 0 ? ", " : ""}
                  <a
                    href={font.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                  >
                    {font.name}
                  </a>
                </span>
              ))}
              . {m.presentations_fonts_note_outro()}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.key} className="rounded-none">
                <CardHeader>
                  <TemplatePreview templateKey={template.key} />
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{template.name}</CardTitle>
                    <span className="whitespace-nowrap font-mono text-muted-foreground text-xs">
                      {template.slides}
                    </span>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <Presentation className="size-4 text-primary" />
                      {m.presentations_feature_editable()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="size-4 text-primary" />
                      {m.presentations_feature_brand()}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      {m.presentations_feature_modes()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={
                      <a
                        href={`/api/presentations/templates/${template.key}/light?locale=${locale}`}
                        download
                      />
                    }
                  >
                    <ArrowDownToLine className="size-4" />
                    {m.presentations_download_light()}
                  </Button>
                  <Button
                    nativeButton={false}
                    render={
                      <a
                        href={`/api/presentations/templates/${template.key}/dark?locale=${locale}`}
                        download
                      />
                    }
                  >
                    <ArrowDownToLine className="size-4" />
                    {m.presentations_download_dark()}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </OtpAccessGate>
  );
}
