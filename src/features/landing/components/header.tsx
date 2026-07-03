"use client";

import { ArrowRight, FileText, Menu, Type, X } from "lucide-react";
import * as motion from "motion/react-client";
import { useEffect, useRef, useState } from "react";
import { LocaleDropdown } from "#/components/locale-dropdown";
import { ThemeToggle } from "#/components/theme-toggle";
import { Button } from "#/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "#/components/ui/context-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "#/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet";
import { UrbsLogo } from "#/components/urbs-logo";
import { UrbsWordmark } from "#/components/urbs-wordmark";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { revealTransition } from "./animation";

function getLinks() {
  const { hrefs } = getLandingAnchors();

  return [
    { href: hrefs.services, label: m.nav_services() },
    { href: hrefs.flow, label: m.nav_flow() },
    { href: hrefs.clients, label: m.nav_clients() },
    { href: hrefs.pymes, label: m.nav_pymes() },
  ];
}

function HeaderNavigationLinks({
  links,
  onNavigate,
  variant = "desktop",
}: {
  links: ReturnType<typeof getLinks>;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  return (
    <NavigationMenuList
      className={cn(
        variant === "mobile"
          ? "flex-col items-stretch gap-0"
          : "items-center gap-1",
      )}
    >
      {links.map((l) => (
        <NavigationMenuItem key={l.href}>
          <NavigationMenuLink
            render={<a href={l.href} />}
            onClick={onNavigate}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              variant === "desktop"
                ? "h-8 rounded-4xl px-2.5 py-0 text-sm font-medium"
                : "w-full rounded-xl px-0 py-2.5 hover:bg-transparent focus:bg-transparent",
            )}
          >
            {l.label}
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
    </NavigationMenuList>
  );
}

function MobileNavigation({
  links,
  contactHref,
  onNavigate,
}: {
  links: ReturnType<typeof getLinks>;
  contactHref: string;
  onNavigate: () => void;
}) {
  return (
    <div className="px-4 py-4 sm:px-6">
      <nav aria-label={m.nav_mobile_label()}>
        <ul className="space-y-1">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={onNavigate}
                className="group flex min-h-11 items-center justify-between gap-4 px-2.5 py-2 text-sm font-medium text-foreground transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-muted hover:text-primary active:scale-[0.99]"
              >
                <span>{l.label}</span>
                <span className="flex size-7 items-center justify-center border border-transparent text-muted-foreground transition-[border-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:border-border group-hover:text-primary">
                  <ArrowRight className="size-3.5" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Button
        render={<a href={contactHref} onClick={onNavigate} />}
        nativeButton={false}
        size="lg"
        className="mt-5 w-full"
      >
        {m.cta_schedule_demo()}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

function HeaderLogo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="inline-flex">
        <UrbsWordmark />
      </ContextMenuTrigger>
      <ContextMenuContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="min-w-64 rounded-lg p-1.5"
      >
        <ContextMenuItem
          render={
            <a href="/urbs-logo.svg" download="urbs-logo.svg">
              <UrbsLogo className="size-4 text-foreground dark:brightness-100" />
              Download Logo as SVG
            </a>
          }
        />
        <ContextMenuItem
          render={
            <a href="/urbs-wordmark.svg" download="urbs-wordmark.svg">
              <Type className="size-4" />
              Download Wordmark as SVG
            </a>
          }
        />
        <ContextMenuItem
          render={
            <a
              href="/urbs-brand-guidelines.pdf"
              download="urbs-brand-guidelines.pdf"
            >
              <FileText className="size-4" />
              Brand Guidelines
            </a>
          }
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function Header() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { hrefs } = getLandingAnchors();
  const links = getLinks();
  const isElevated = scrolled || open;

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "8px 0px 0px 0px",
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-px w-px"
      />

      <Sheet modal={false} open={open} onOpenChange={setOpen}>
        <motion.header
          initial={{
            opacity: 0,
            transform: "translate3d(0, -12px, 0)",
          }}
          animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
          transition={revealTransition({
            duration: 0.38,
            delay: 0.08,
          })}
          className={cn(
            "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
            isElevated
              ? "border-b border-border bg-background/80 backdrop-blur-md"
              : "border-b border-transparent",
          )}
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <HeaderLogo />
            <NavigationMenu
              className="hidden flex-none md:flex"
              aria-label={m.nav_primary_label()}
            >
              <HeaderNavigationLinks links={links} />
            </NavigationMenu>

            <div className="hidden items-center gap-3 md:flex">
              <ThemeToggle />
              <LocaleDropdown />
              <Button
                render={<a href={hrefs.contact} />}
                nativeButton={false}
                size="sm"
              >
                {m.cta_schedule_demo()}
              </Button>
            </div>

            <div className="flex items-center gap-1 md:hidden">
              <ThemeToggle />
              <LocaleDropdown variant="compact" />
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center text-foreground transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95"
                aria-label={open ? m.menu_close_label() : m.menu_open_label()}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </motion.header>

        <SheetContent
          side="top"
          showCloseButton={false}
          overlayClassName="top-16 z-40 bg-background/55 backdrop-blur-[2px] md:hidden dark:bg-background/50"
          className="top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-auto border-border bg-background/95 p-0 shadow-lg backdrop-blur-md duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] md:hidden data-[side=top]:top-16 data-[side=top]:border-b data-[side=top]:data-ending-style:-translate-y-2 data-[side=top]:data-starting-style:-translate-y-2"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{m.nav_mobile_label()}</SheetTitle>
            <SheetDescription>{m.nav_primary_label()}</SheetDescription>
          </SheetHeader>

          <MobileNavigation
            links={links}
            contactHref={hrefs.contact}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
