import handler from "@tanstack/react-start/server-entry";
import {
  createPresentationTemplate,
  presentationTemplateFilename,
} from "./features/presentations/lib/pptx-templates";
import {
  isPresentationTemplateKey,
  isPresentationTemplateMode,
} from "./features/presentations/lib/template-catalog";
import { getSocialAssetBytes } from "./features/social/lib/social-asset-files.server";
import {
  isSocialAssetKey,
  socialAssetFiles,
} from "./features/social/lib/social-assets";
import { isLocale, toAppLocale } from "./i18n";
import { employeeAccess } from "./lib/employee-access";
import { paraglideMiddleware } from "./paraglide/server.js";

type RouteHandler = (
  req: Request,
  url: URL,
  params: string[],
) => Response | Promise<Response>;

/** Employee-only GET endpoints, each wrapped in the access guard. */
const protectedRoutes: { pattern: RegExp; handler: RouteHandler }[] = [
  {
    pattern: /^\/api\/presentations\/templates\/([^/]+)\/([^/]+)$/,
    handler: employeeAccess.guard(handlePresentationTemplate),
  },
  {
    pattern: /^\/api\/social\/assets\/([^/]+)$/,
    handler: employeeAccess.guard(handleSocialAsset),
  },
];

async function handlePresentationTemplate(
  _req: Request,
  url: URL,
  [key, mode]: string[],
) {
  const locale = toAppLocale(url.searchParams.get("locale"));

  if (!isPresentationTemplateKey(key) || !isPresentationTemplateMode(mode)) {
    return new Response("Template not found", { status: 404 });
  }

  const pptx = await createPresentationTemplate(key, mode, locale);
  const body = new ArrayBuffer(pptx.byteLength);
  new Uint8Array(body).set(pptx);

  return new Response(body, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${presentationTemplateFilename(
        key,
        mode,
      )}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}

function handleSocialAsset(_req: Request, url: URL, [key]: string[]) {
  if (!isSocialAssetKey(key)) {
    return new Response("Asset not found", { status: 404 });
  }

  const asset = socialAssetFiles[key];
  const disposition =
    url.searchParams.get("disposition") === "inline" ? "inline" : "attachment";

  return new Response(getSocialAssetBytes(key), {
    headers: {
      "Content-Type": asset.contentType,
      "Content-Disposition": `${disposition}; filename="${asset.filename}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}

/**
 * Canonical URL shape: no trailing slash, except the per-locale home pages
 * ("/" and "/en/"). Returns a 301 target when the request needs normalizing.
 *
 * Without this, "/en" 404s while "/en/" resolves, and "/blog/" answers with a
 * temporary 307 — both of which Search Console reports as indexing errors.
 */
function getCanonicalRedirect(url: URL) {
  const { pathname } = url;

  if (pathname.length <= 1) return null;

  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const isLocaleHome = segments.length === 1 && isLocale(segments[0]);
  const normalized = isLocaleHome
    ? `/${segments[0]}/`
    : `/${segments.join("/")}`;

  if (normalized === pathname) return null;

  const target = new URL(url);
  target.pathname = normalized;

  return target.toString();
}

export default {
  fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "GET" || req.method === "HEAD") {
      const redirectTo = getCanonicalRedirect(url);

      if (redirectTo) {
        return Promise.resolve(
          new Response(null, {
            status: 301,
            headers: { Location: redirectTo },
          }),
        );
      }
    }

    if (url.pathname === "/api/employee-access/verify") {
      return employeeAccess.handleVerify(req);
    }

    for (const { pattern, handler } of protectedRoutes) {
      const match = url.pathname.match(pattern);
      if (!match) continue;

      if (req.method !== "GET") {
        return Promise.resolve(
          new Response("Method not allowed", { status: 405 }),
        );
      }

      return Promise.resolve(handler(req, url, match.slice(1)));
    }

    return paraglideMiddleware(req, () => handler.fetch(req));
  },
};
