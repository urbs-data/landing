import handler from "@tanstack/react-start/server-entry";
import {
  createPresentationTemplate,
  presentationTemplateFilename,
} from "./features/presentations/lib/pptx-templates";
import {
  isPresentationTemplateKey,
  isPresentationTemplateMode,
} from "./features/presentations/lib/template-catalog";
import { defaultLocale, isLocale } from "./i18n";
import { paraglideMiddleware } from "./paraglide/server.js";

async function handleEmployeeAccess(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const configuredCode = process.env.SIGNATURES_PRESENTATIONS_ACCESS_CODE;

  if (!configuredCode) {
    return Response.json({ ok: false }, { status: 503 });
  }

  try {
    const body = (await req.json()) as { code?: unknown };
    const submittedCode = typeof body.code === "string" ? body.code : "";
    const ok =
      /^[a-zA-Z0-9]{6}$/.test(submittedCode) &&
      submittedCode === configuredCode;

    return Response.json({ ok }, { status: ok ? 200 : 401 });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}

async function handlePresentationTemplate(req: Request, url: URL) {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
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

export default {
  fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/api/employee-access/verify") {
      return handleEmployeeAccess(req);
    }

    if (url.pathname.startsWith("/api/presentations/templates/")) {
      return handlePresentationTemplate(req, url);
    }

    return paraglideMiddleware(req, () => handler.fetch(req));
  },
};
