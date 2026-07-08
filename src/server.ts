import handler from "@tanstack/react-start/server-entry";
import {
  createPresentationTemplate,
  presentationTemplateFilename,
} from "./features/presentations/lib/pptx-templates";
import {
  isPresentationTemplateKey,
  isPresentationTemplateMode,
} from "./features/presentations/lib/template-catalog";
import {
  isSocialAssetKey,
  socialAssetFiles,
} from "./features/social/lib/social-assets";
import { defaultLocale, isLocale } from "./i18n";
import {
  createEmployeeAccessCookie,
  isEmployeeAccessGrantedFromCookieHeader,
  verifyEmployeeAccessCode,
} from "./lib/employee-access";
import { paraglideMiddleware } from "./paraglide/server.js";

async function handleEmployeeAccess(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = (await req.json()) as { code?: unknown };
    const result = verifyEmployeeAccessCode(body.code);

    if (result === "unavailable") {
      return Response.json({ ok: false }, { status: 503 });
    }

    if (result === "invalid") {
      return Response.json({ ok: false }, { status: 401 });
    }

    return Response.json(
      { ok: true },
      {
        headers: {
          "Set-Cookie": await createEmployeeAccessCookie({
            secure: new URL(req.url).protocol === "https:",
          }),
        },
      },
    );
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}

async function handlePresentationTemplate(req: Request, url: URL) {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const hasAccess = await isEmployeeAccessGrantedFromCookieHeader(
    req.headers.get("Cookie"),
  );

  if (!hasAccess) {
    return new Response("Unauthorized", { status: 401 });
  }

  const match = url.pathname.match(
    /^\/api\/presentations\/templates\/([^/]+)\/([^/]+)$/,
  );

  if (!match) {
    return new Response("Not found", { status: 404 });
  }

  const [, key, mode] = match;
  const localeParam = url.searchParams.get("locale");
  const locale =
    localeParam && isLocale(localeParam) ? localeParam : defaultLocale;

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

async function handleSocialAsset(req: Request, url: URL) {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const hasAccess = await isEmployeeAccessGrantedFromCookieHeader(
    req.headers.get("Cookie"),
  );

  if (!hasAccess) {
    return new Response("Unauthorized", { status: 401 });
  }

  const match = url.pathname.match(/^\/api\/social\/assets\/([^/]+)$/);

  if (!match) {
    return new Response("Not found", { status: 404 });
  }

  const [, key] = match;

  if (!isSocialAssetKey(key)) {
    return new Response("Asset not found", { status: 404 });
  }

  const asset = socialAssetFiles[key];
  const response = await fetch(new URL(asset.sourcePath, url.origin));

  if (!response.ok) {
    return new Response("Asset not found", { status: 404 });
  }

  return new Response(await response.arrayBuffer(), {
    headers: {
      "Content-Type": asset.contentType,
      "Content-Disposition": `attachment; filename="${asset.filename}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}

export default {
  fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/api/employee-access/verify") {
      return handleEmployeeAccess(req);
    }

    if (url.pathname.startsWith("/api/presentations/templates/")) {
      return handlePresentationTemplate(req, url);
    }

    if (url.pathname.startsWith("/api/social/assets/")) {
      return handleSocialAsset(req, url);
    }

    return paraglideMiddleware(req, () => handler.fetch(req));
  },
};
