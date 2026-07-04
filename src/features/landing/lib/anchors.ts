import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

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
  const homeHash = (id: string) => localizeHref(`/#${id}`);

  return {
    ids,
    hrefs: {
      top: homeHash(ids.top),
      problem: homeHash(ids.problem),
      services: homeHash(ids.services),
      flow: homeHash(ids.flow),
      clients: homeHash(ids.clients),
      pymes: homeHash(ids.pymes),
      contact: homeHash(ids.contact),
      blog: localizeHref("/blog"),
      careers: localizeHref("/careers"),
    },
  };
}
