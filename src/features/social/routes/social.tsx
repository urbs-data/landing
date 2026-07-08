import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownToLine, ImageIcon, MonitorUp } from "lucide-react";
import { OtpAccessGate } from "#/components/otp-access-gate";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { getSeoTitle } from "#/features/landing/lib/seo";
import { getSocialAssetCatalog } from "#/features/social/lib/social-assets";
import { getEmployeeAccess } from "#/lib/employee-access";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/social")({
  loader: () => getEmployeeAccess(),
  head: () => ({
    meta: [
      {
        title: getSeoTitle(m.social_title()),
      },
      {
        name: "description",
        content: m.social_description(),
      },
    ],
  }),
  component: SocialRoute,
});

function SocialRoute() {
  const { hasAccess } = Route.useLoaderData();
  const assets = getSocialAssetCatalog();

  return (
    <OtpAccessGate
      hasAccess={hasAccess}
      title={m.social_gate_title()}
      description={m.social_gate_description()}
    >
      <main className="bg-background pb-16 pt-32 text-foreground lg:pb-24 lg:pt-36">
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-medium text-muted-foreground text-sm">
            {m.social_kicker()}
          </p>
          <div className="mt-3 grid gap-5">
            <h1 className="font-heading font-semibold text-4xl tracking-normal sm:text-5xl">
              {m.social_title()}
            </h1>
            <p className="text-muted-foreground text-base leading-7">
              {m.social_description()}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {assets.map((asset) => (
              <Card key={asset.key} className="rounded-none">
                <CardHeader>
                  <div
                    className="mb-4 overflow-hidden border border-border bg-secondary"
                    style={{ aspectRatio: asset.previewAspectRatio }}
                  >
                    <img
                      src={asset.previewPath}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                  <CardTitle>{asset.name}</CardTitle>
                  <p className="text-muted-foreground text-sm leading-6">
                    {asset.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <MonitorUp className="size-4 text-primary" />
                      {asset.dimensions}
                    </div>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="size-4 text-primary" />
                      {asset.format}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full sm:w-auto"
                    nativeButton={false}
                    render={<a href={asset.downloadPath} download />}
                  >
                    <ArrowDownToLine className="size-4" />
                    {m.social_download()}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </OtpAccessGate>
  );
}
