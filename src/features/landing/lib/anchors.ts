import { m } from "@/paraglide/messages";

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

  return {
    ids,
    hrefs: {
      top: `#${ids.top}`,
      problem: `#${ids.problem}`,
      services: `#${ids.services}`,
      flow: `#${ids.flow}`,
      clients: `#${ids.clients}`,
      pymes: `#${ids.pymes}`,
      contact: `#${ids.contact}`,
    },
  };
}
