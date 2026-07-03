"use client";

import Accessibility from "embla-carousel-accessibility";
import AutoHeight from "embla-carousel-auto-height";
import AutoScroll from "embla-carousel-auto-scroll";
import Autoplay from "embla-carousel-autoplay";
import ClassNames from "embla-carousel-class-names";
import Fade from "embla-carousel-fade";
import Ssr from "embla-carousel-ssr";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ExternalLinkIcon } from "lucide-react";
import * as React from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "#/components/ui/carousel.tsx";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "#/components/ui/hover-card.tsx";
import { m } from "@/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { SectionKicker } from "./section-kicker";

const companies = [
  {
    name: "Cahpsa",
    src: "/companies/cahpsa.svg",
    sector: () => m.company_cahpsa_sector(),
    location: () => m.company_cahpsa_location(),
    detail: () => m.company_cahpsa_detail(),
    website: "https://cahpsa.com.py/",
  },
  {
    name: "CIGRA",
    src: "/companies/cigra.svg",
    sector: () => m.company_cigra_sector(),
    location: () => m.company_cigra_location(),
    detail: () => m.company_cigra_detail(),
    website: "https://cigra.com.ar",
  },
  {
    name: "Byontek",
    src: "/companies/byontek.svg",
    sector: () => m.company_byontek_sector(),
    location: () => m.company_byontek_location(),
    detail: () => m.company_byontek_detail(),
    website: "https://byontek.com",
  },
  {
    name: "Credito Argentino",
    src: "/companies/credito-argentino.svg",
    sector: () => m.company_credito_argentino_sector(),
    location: () => m.company_credito_argentino_location(),
    detail: () => m.company_credito_argentino_detail(),
    website: "https://www.creditoargentino.com.ar",
  },
  {
    name: "4Plus",
    src: "/companies/4plus.svg",
    sector: () => m.company_fourplus_sector(),
    location: () => m.company_fourplus_location(),
    detail: () => m.company_fourplus_detail(),
    website: "https://grupocuatroplus.com/",
  },
  {
    name: "MacroAgro",
    src: "/companies/macroagro.svg",
    sector: () => m.company_macroagro_sector(),
    location: () => m.company_macroagro_location(),
    detail: () => m.company_macroagro_detail(),
    website: "https://www.macroagro.com.ar",
  },
  {
    name: "LBO",
    src: "/companies/lbo.svg",
    sector: () => m.company_lbo_sector(),
    location: () => m.company_lbo_location(),
    detail: () => m.company_lbo_detail(),
    website: "https://lbo.com.ar/",
  },
  {
    name: "Nexo",
    src: "/companies/nexo.svg",
    sector: () => m.company_nexo_sector(),
    location: () => m.company_nexo_location(),
    detail: () => m.company_nexo_detail(),
    website: "https://nexo.solutions/",
  },
  {
    name: "Corteva",
    src: "/companies/corteva.svg",
    sector: () => m.company_corteva_sector(),
    location: () => m.company_corteva_location(),
    detail: () => m.company_corteva_detail(),
    website: "https://www.corteva.com.ar",
  },
  {
    name: "Hemisphere",
    src: "/companies/hemisphere.svg",
    sector: () => m.company_hemisphere_sector(),
    location: () => m.company_hemisphere_location(),
    detail: () => m.company_hemisphere_detail(),
    website: "https://hemibrands.com/",
  },
  {
    name: "Rosental",
    src: "/companies/rosental.svg",
    sector: () => m.company_rosental_sector(),
    location: () => m.company_rosental_location(),
    detail: () => m.company_rosental_detail(),
    website: "https://www.rosental.com/",
  },
];

export function TrustedCompanies() {
  const { ids } = getLandingAnchors();
  const [api, setApi] = React.useState<CarouselApi>();
  const [openCompanyCards, setOpenCompanyCards] = React.useState<Set<string>>(
    () => new Set(),
  );
  const interactionStateRef = React.useRef({
    isMouseOver: false,
    isPointerDown: false,
  });
  const openCompanyCardsCountRef = React.useRef(0);
  const plugins = React.useMemo(
    () => [
      Accessibility({
        carouselAriaLabel: m.clients_kicker(),
        slideAriaLabel: (
          _hasGroupedSlides,
          firstSlideIndex,
          _lastSlideIndex,
          totalSlides,
        ) =>
          `${companies[firstSlideIndex]?.name ?? "Client"} ${firstSlideIndex + 1} / ${totalSlides}`,
      }),
      AutoScroll({
        speed: 0.7,
        startDelay: 0,
        defaultInteraction: false,
      }),
      Autoplay({
        active: false,
        delay: 8000,
        defaultInteraction: false,
      }),
      AutoHeight({ heightEvent: "slidesinview" }),
      ClassNames({
        snapped: "is-snapped",
        inView: "is-in-view",
        draggable: "is-draggable",
        pointerDown: "is-pointer-down",
        loop: "is-loop",
      }),
      Fade({ active: false }),
      WheelGesturesPlugin({ forceWheelAxis: "x" }),
      Ssr(),
    ],
    [],
  );

  const updateCompanyCardOpen = React.useCallback(
    (companyName: string, open: boolean) => {
      setOpenCompanyCards((current) => {
        const next = new Set(current);

        if (open) {
          next.add(companyName);
        } else {
          next.delete(companyName);
        }

        return next;
      });
    },
    [],
  );

  const playAutoScrollIfIdle = React.useCallback(
    (startDelay = 250) => {
      const autoScroll = api?.plugins().autoScroll;
      if (!autoScroll) return;

      const { isMouseOver, isPointerDown } = interactionStateRef.current;
      if (
        !isMouseOver &&
        !isPointerDown &&
        openCompanyCardsCountRef.current === 0
      ) {
        autoScroll.play(startDelay);
      }
    },
    [api],
  );

  React.useEffect(() => {
    openCompanyCardsCountRef.current = openCompanyCards.size;

    const autoScroll = api?.plugins().autoScroll;
    if (!autoScroll) return;

    if (openCompanyCards.size > 0) {
      autoScroll.stop();
      return;
    }

    playAutoScrollIfIdle();
  }, [api, openCompanyCards.size, playAutoScrollIfIdle]);

  React.useEffect(() => {
    if (!api) return;

    const onReInit = () => {
      playAutoScrollIfIdle();
    };

    api.on("reinit", onReInit);

    return () => {
      api.off("reinit", onReInit);
    };
  }, [api, playAutoScrollIfIdle]);

  React.useEffect(() => {
    if (!api) return;

    const autoScroll = api.plugins().autoScroll;
    if (!autoScroll) return;

    const onAutoScrollInteraction = (
      _api: typeof api,
      event: Parameters<
        Parameters<typeof api.on<"autoscroll:interaction">>[1]
      >[1],
    ) => {
      const { interaction, isMouseOver, isPointerDown } = event.detail;
      interactionStateRef.current = { isMouseOver, isPointerDown };

      if (interaction === "mouseenter" || interaction === "pointerdown") {
        autoScroll.stop();
        return;
      }

      if (interaction === "slidefocus") {
        autoScroll.stop();
        return;
      }

      if (
        !isMouseOver &&
        !isPointerDown &&
        openCompanyCardsCountRef.current === 0
      ) {
        playAutoScrollIfIdle();
      }
    };

    api.on("autoscroll:interaction", onAutoScrollInteraction);

    return () => {
      api.off("autoscroll:interaction", onAutoScrollInteraction);
    };
  }, [api, playAutoScrollIfIdle]);

  return (
    <section id={ids.clients} className="border-b border-border py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionKicker className="text-center">
          {m.clients_kicker()}
        </SectionKicker>

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            breakpoints: {
              "(prefers-reduced-motion: reduce)": { duration: 0 },
            },
            containScroll: false,
            dragFree: true,
            loop: true,
          }}
          plugins={plugins}
          className="relative mt-8 overflow-hidden before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-12 before:bg-linear-to-r before:from-background before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-12 after:bg-linear-to-l after:from-background after:to-transparent sm:before:w-24 sm:after:w-24"
        >
          <CarouselContent className="ml-0">
            {companies.map((company) => (
              <CarouselItem
                key={company.name}
                className="flex h-16 basis-44 items-center justify-center pl-0 opacity-60 transition-opacity duration-300 sm:h-20 sm:basis-56 [&.is-in-view]:opacity-80"
              >
                <HoverCard
                  onOpenChange={(open) =>
                    updateCompanyCardOpen(company.name, open)
                  }
                >
                  <HoverCardTrigger
                    delay={140}
                    closeDelay={80}
                    aria-label={company.name}
                    className="flex h-full w-full items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    render={<button type="button" />}
                  >
                    <span
                      aria-hidden="true"
                      className="h-10 w-36 bg-current text-foreground sm:h-12 sm:w-48"
                      style={{
                        mask: `url(${company.src}) center / contain no-repeat`,
                        WebkitMask: `url(${company.src}) center / contain no-repeat`,
                      }}
                    />
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    sideOffset={0}
                    className="w-72 rounded-md border border-border bg-popover p-4 text-left shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-popover-foreground">
                          {company.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {company.sector()}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-sm border border-border bg-card px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {company.location()}
                      </span>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {company.detail()}
                    </p>
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        {m.company_card_website()}
                        <ExternalLinkIcon className="size-3.5" />
                      </a>
                    ) : null}
                  </HoverCardContent>
                </HoverCard>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
