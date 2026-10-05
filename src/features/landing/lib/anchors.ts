import { m } from "#/paraglide/messages";
import { localizeHref } from "#/paraglide/runtime";
import type { FileRoutesByTo } from "#/routeTree.gen";

type LandingRoutePath = Extract<
  keyof FileRoutesByTo,
  "/" | "/blog" | "/careers"
>;

/**
 * Router-native link target. Spread it into `<Link {...target} />`: the
 * router's Paraglide `rewrite.output` adds the locale prefix (`/en/...`), so
 * targets stay unlocalized here.
 */
export type LandingLinkTarget = {
  to: LandingRoutePath;
  hash?: string;
};

function toLocalizedHref({ to, hash }: LandingLinkTarget) {
  return localizeHref(hash ? `${to}#${hash}` : to);
}

function mapValues<K extends string, V, R>(
  record: Record<K, V>,
  fn: (value: V) => R,
): Record<K, R> {
  return Object.fromEntries(
    Object.entries<V>(record).map(([key, value]) => [key, fn(value)]),
  ) as Record<K, R>;
}

export function getLandingAnchors() {
  const ids = {
    top: m.anchor_top(),
    problem: m.anchor_problem(),
    services: m.anchor_services(),
    flow: m.anchor_flow(),
    clients: m.anchor_clients(),
    pymes: m.anchor_pymes(),
    contact: m.anchor_contact(),
  };
  const route = (to: LandingRoutePath, hash?: string): LandingLinkTarget => ({
    to,
    hash,
  });
  const home = (hash: string) => route("/", hash);

  const links = {
    top: home(ids.top),
    problem: home(ids.problem),
    services: home(ids.services),
    flow: home(ids.flow),
    clients: home(ids.clients),
    pymes: home(ids.pymes),
    contact: home(ids.contact),
    blog: route("/blog"),
    careers: route("/careers"),
  };

  return {
    ids,
    links,
    /** Localized hrefs for plain `<a>` elements outside the router's `<Link>`. */
    hrefs: mapValues(links, toLocalizedHref),
  };
}
