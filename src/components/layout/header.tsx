"use client";

import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Building2,
  Database,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Menu,
  Type,
  Workflow,
  X,
} from "lucide-react";
import * as motion from "motion/react-client";
import { forwardRef, useEffect, useRef, useState } from "react";
import { BrandWordmark } from "#/components/brand-wordmark";
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
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "#/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet";
import { revealTransition } from "#/features/landing/components/animation";
import { getLandingAnchors } from "#/features/landing/lib/anchors";
import { useThemeMode } from "#/hooks/use-theme-mode";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import { deLocalizeHref, getLocale } from "#/paraglide/runtime";

type InternalNavigationPath = "/" | "/blog" | "/careers";

type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

type NavigationGroup = {
  kind: "group";
  id: string;
  label: string;
  items: NavigationItem[];
};

type NavigationLink = NavigationItem & {
  kind: "link";
  id: string;
};

type NavigationEntry = NavigationGroup | NavigationLink;

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

type InternalNavigationLinkProps = {
  href: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children?: React.ReactNode;
};

const InternalNavigationLink = forwardRef<
  HTMLAnchorElement,
  InternalNavigationLinkProps
>(function InternalNavigationLink({ href, className, onClick, children }, ref) {
  const { to, hash } = getRouterLinkParts(href);

  return (
    <Link
      ref={ref}
      to={to}
      hash={hash}
      onClick={onClick}
      className={className}
      activeOptions={{ exact: true, includeHash: Boolean(hash) }}
      hashScrollIntoView={{ block: "start" }}
    >
      {children}
    </Link>
  );
});

function getNavigationEntries(): NavigationEntry[] {
  const { hrefs } = getLandingAnchors();

  return [
    {
      kind: "group",
      id: "services",
      label: m.nav_group_services(),
      items: [
        {
          href: hrefs.services,
          label: m.service_data_title(),
          description: m.nav_service_data_desc(),
          icon: Database,
        },
        {
          href: hrefs.services,
          label: m.service_ai_title(),
          description: m.nav_service_ai_desc(),
          icon: Bot,
        },
        {
          href: hrefs.services,
          label: m.service_automation_title(),
          description: m.nav_service_automation_desc(),
          icon: Workflow,
        },
        {
          href: hrefs.services,
          label: m.service_bi_title(),
          description: m.nav_service_apps_desc(),
          icon: LayoutDashboard,
        },
      ],
    },
    {
      kind: "group",
      id: "solutions",
      label: m.nav_group_solutions(),
      items: [
        {
          href: hrefs.flow,
          label: m.nav_flow(),
          description: m.nav_solution_flow_desc(),
          icon: Workflow,
        },
        {
          href: hrefs.pymes,
          label: m.nav_pymes(),
          description: m.nav_solution_pymes_desc(),
          icon: Building2,
        },
      ],
    },
    {
      kind: "group",
      id: "company",
      label: m.nav_group_company(),
      items: [
        {
          href: hrefs.careers,
          label: m.nav_careers(),
          description: m.nav_company_careers_desc(),
          icon: BriefcaseBusiness,
        },
        {
          href: hrefs.clients,
          label: m.nav_clients(),
          description: m.nav_company_clients_desc(),
          icon: Building2,
        },
      ],
    },
    {
      kind: "link",
      id: "blog",
      href: hrefs.blog,
      label: m.nav_blog(),
      description: m.nav_company_blog_desc(),
      icon: FileText,
    },
  ];
}

function NavigationContentLink({
  item,
  onNavigate,
}: {
  item: NavigationItem;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <NavigationMenuLink
      render={<InternalNavigationLink href={item.href} />}
      closeOnClick
      onClick={onNavigate}
      className="group min-h-19 w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/70 focus:bg-muted/70"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-5 text-foreground">
          {item.label}
        </span>
        <span className="mt-0.5 block text-pretty text-xs leading-5 text-muted-foreground">
          {item.description}
        </span>
      </span>
    </NavigationMenuLink>
  );
}

function HeaderNavigationLinks({
  entries,
  onNavigate,
  variant = "desktop",
}: {
  entries: NavigationEntry[];
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  if (variant === "mobile") {
    return (
      <div className="space-y-5">
        {entries.map((entry) => {
          const items = entry.kind === "group" ? entry.items : [entry];

          return (
            <section key={entry.id} aria-labelledby={`mobile-nav-${entry.id}`}>
              <h3
                id={`mobile-nav-${entry.id}`}
                className="px-2.5 pb-1 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
              >
                {entry.label}
              </h3>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={`${entry.id}-${item.label}`}>
                    <InternalNavigationLink
                      href={item.href}
                      onClick={onNavigate}
                      className="group flex min-h-14 items-center justify-between gap-4 px-2.5 py-2.5 text-sm text-foreground transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-muted hover:text-primary active:scale-[0.99]"
                    >
                      <span className="min-w-0">
                        <span className="block font-medium leading-5">
                          {item.label}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs leading-4 text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                      <span className="flex size-7 shrink-0 items-center justify-center border border-transparent text-muted-foreground transition-[border-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:border-border group-hover:text-primary">
                        <ArrowRight className="size-3.5" />
                      </span>
                    </InternalNavigationLink>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <NavigationMenuList className="items-center gap-0.5">
      {entries.map((entry) => {
        if (entry.kind === "link") {
          return (
            <NavigationMenuItem key={entry.id}>
              <NavigationMenuLink
                render={<InternalNavigationLink href={entry.href} />}
                closeOnClick
                onClick={onNavigate}
                className="h-8 rounded-4xl px-2.5 py-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground focus:bg-transparent"
              >
                {entry.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        }

        return (
          <NavigationMenuItem key={entry.id}>
            <NavigationMenuTrigger className="h-8 rounded-4xl px-2.5 py-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground focus:bg-transparent data-popup-open:bg-muted/70 data-popup-open:text-foreground">
              {entry.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent className="w-104 p-2">
              <div className="grid grid-cols-1 gap-1">
                {entry.items.map((item) => (
                  <NavigationContentLink
                    key={`${entry.id}-${item.label}`}
                    item={item}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        );
      })}
    </NavigationMenuList>
  );
}

function MobileNavigation({
  entries,
  contactHref,
  onNavigate,
}: {
  entries: NavigationEntry[];
  contactHref: string;
  onNavigate: () => void;
}) {
  return (
    <div className="px-4 py-4 sm:px-6">
      <nav aria-label={m.nav_mobile_label()}>
        <HeaderNavigationLinks
          entries={entries}
          onNavigate={onNavigate}
          variant="mobile"
        />
      </nav>

      <Button
        render={
          <InternalNavigationLink href={contactHref} onClick={onNavigate} />
        }
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
  const { resolvedTheme } = useThemeMode();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <ContextMenu>
      <ContextMenuTrigger className="inline-flex">
        <BrandWordmark />
      </ContextMenuTrigger>
      <ContextMenuContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="min-w-64 rounded-lg p-1.5"
      >
        <ContextMenuItem
          render={
            <a href="/brand/logo.svg" download="urbs-logo.svg">
              <img
                src="/brand/logo.svg"
                alt=""
                aria-hidden="true"
                className="size-4"
              />
              {m.brand_download_logo_svg()}
            </a>
          }
        />
        <ContextMenuItem
          render={
            <a
              href={`/brand/wordmark-${theme}.svg`}
              download="urbs-wordmark.svg"
            >
              <Type className="size-4" />
              {m.brand_download_wordmark_svg()}
            </a>
          }
        />
        <ContextMenuItem
          render={
            <a
              href={`/urbs-brand-guidelines-${getLocale()}.pdf`}
              download={`urbs-brand-guidelines-${getLocale()}.pdf`}
            >
              <FileText className="size-4" />
              {m.brand_guidelines()}
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
  const entries = getNavigationEntries();
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
              <HeaderNavigationLinks entries={entries} />
            </NavigationMenu>

            <div className="hidden items-center gap-3 md:flex">
              <ThemeToggle />
              <LocaleDropdown />
              <Button
                render={<InternalNavigationLink href={hrefs.contact} />}
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
            entries={entries}
            contactHref={hrefs.contact}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
