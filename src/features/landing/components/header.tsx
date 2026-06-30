"use client";

import { Menu, X } from "lucide-react";
import * as motion from "motion/react-client";
import { useEffect, useRef, useState } from "react";
import { LocaleDropdown } from "#/components/locale-dropdown";
import { ThemeToggle } from "#/components/theme-toggle";
import { Button } from "#/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "#/components/ui/navigation-menu";
import { UrbsLogo } from "#/components/urbs-logo";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import { getLandingAnchors } from "../lib/anchors";
import { landingEaseOut } from "./animation";

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
                ? "h-9 px-3 py-2"
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

export function Header() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { hrefs } = getLandingAnchors();
  const links = getLinks();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(media.matches);

    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);

    return () => {
      media.removeEventListener("change", updateMotionPreference);
    };
  }, []);

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

      <motion.header
        initial={{
          opacity: 0,
          transform: prefersReducedMotion
            ? "translate3d(0, 0, 0)"
            : "translate3d(0, -12px, 0)",
        }}
        animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
        transition={{
          duration: prefersReducedMotion ? 0.18 : 0.38,
          ease: landingEaseOut,
          delay: prefersReducedMotion ? 0 : 0.08,
        }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
          scrolled
            ? "border-b border-border bg-background/80 backdrop-blur-md"
            : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <UrbsLogo />
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

          <button
            type="button"
            className="inline-flex size-9 items-center justify-center text-foreground transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95 md:hidden"
            aria-label={open ? m.menu_close_label() : m.menu_open_label()}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border bg-background md:hidden">
            <NavigationMenu
              className="mx-auto max-w-6xl flex-none items-stretch justify-start px-4 py-3 sm:px-6"
              aria-label={m.nav_mobile_label()}
            >
              <HeaderNavigationLinks
                links={links}
                onNavigate={() => setOpen(false)}
                variant="mobile"
              />

              <Button
                render={<a href={hrefs.contact} />}
                nativeButton={false}
                size="sm"
                className="mt-2"
              >
                {m.cta_schedule_demo()}
              </Button>
            </NavigationMenu>
          </div>
        )}
      </motion.header>
    </>
  );
}
