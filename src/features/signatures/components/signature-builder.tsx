"use client";

import { Check, Clipboard, Download, Moon, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";

type SignatureMode = "light" | "dark";

function getDefaultSignature() {
  return {
    name: m.signature_default_name(),
    role: m.signature_default_role(),
    email: "nombre@urbsdata.com",
    mode: "light" as SignatureMode,
  };
}

type Signature = ReturnType<typeof getDefaultSignature>;

const themeTokens = {
  light: {
    background: "#ffffff",
    title: "#292a2f",
    description: "#80808a",
    email: "#7d4ac7",
    divider: "#d8d5df",
  },
  dark: {
    background: "#111113",
    title: "#f2eef8",
    description: "#9998a2",
    email: "#c08df2",
    divider: "#3d3944",
  },
};

function getWordmarkPath(mode: SignatureMode) {
  return `/brand/wordmark-${mode}.png`;
}

function getAbsoluteWordmarkSrc(mode: SignatureMode) {
  const path = getWordmarkPath(mode);

  if (typeof window === "undefined") return path;

  return new URL(path, window.location.origin).toString();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildSignatureHtml(signature: Signature) {
  const tokens = themeTokens[signature.mode];
  const name = escapeHtml(signature.name);
  const role = escapeHtml(signature.role);
  const email = escapeHtml(signature.email);
  const wordmarkSrc = escapeHtml(getAbsoluteWordmarkSrc(signature.mode));

  return `<table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse; border-spacing:0; width:auto; background:${tokens.background}; font-family:'IBM Plex Sans', Arial, Helvetica, sans-serif; mso-table-lspace:0pt; mso-table-rspace:0pt;">
  <tr>
    <td style="padding:18px 26px; white-space:nowrap;">
      <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse; border-spacing:0; width:auto; mso-table-lspace:0pt; mso-table-rspace:0pt;">
        <tr>
          <td style="width:132px; height:54px; vertical-align:middle;">
            <img src="${wordmarkSrc}" width="132" height="54" alt="Urbs" style="display:block; width:132px; height:54px; border:0; outline:none; text-decoration:none;">
          </td>
          <td style="width:44px; padding-left:24px; padding-right:25px; vertical-align:middle;">
            <div style="width:1px; height:70px; background:${tokens.divider}; line-height:70px;">&nbsp;</div>
          </td>
          <td style="vertical-align:middle; white-space:nowrap;">
            <div style="font-size:14px; line-height:18px; font-weight:700; color:${tokens.title};">${name}</div>
            <div style="padding-top:4px; font-size:13px; line-height:17px; font-weight:400; color:${tokens.description};">${role}</div>
            <div style="padding-top:8px; font-family:'Pitagon Sans Mono', 'Courier New', Courier, monospace; font-size:12px; line-height:16px; font-weight:700; letter-spacing:.2px;"><a href="mailto:${email}" style="color:${tokens.email}; text-decoration:none;">${email}</a></div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function buildSignatureDocumentHtml(signature: Signature) {
  return `<!doctype html>
<html lang="${getLocale()}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(m.signature_document_title())}</title>
  <style>
    @font-face {
      font-family: "IBM Plex Sans";
      font-style: normal;
      font-weight: 100 700;
      font-display: swap;
      src: url("https://cdn.jsdelivr.net/npm/@fontsource-variable/ibm-plex-sans@5.2.8/files/ibm-plex-sans-latin-wght-normal.woff2") format("woff2");
    }
    @font-face {
      font-family: "Pitagon Sans Mono";
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url("https://cdn.jsdelivr.net/npm/@fontsource/pitagon-sans-mono@5.2.5/files/pitagon-sans-mono-latin-400-normal.woff2") format("woff2");
    }

    @font-face {
      font-family: "Pitagon Sans Mono";
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url("https://cdn.jsdelivr.net/npm/@fontsource/pitagon-sans-mono@5.2.5/files/pitagon-sans-mono-latin-700-normal.woff2") format("woff2");
    }

    body {
      margin: 24px;
      background: #f5f5f7;
    }
  </style>
</head>
<body>
${buildSignatureHtml(signature)}
</body>
</html>`;
}

function SignaturePreview({ signature }: { signature: Signature }) {
  const tokens = themeTokens[signature.mode];
  const wordmarkSrc = getWordmarkPath(signature.mode);

  return (
    <div
      className="inline-flex w-fit max-w-none items-center px-6.5 py-4.5 shadow-sm"
      style={{ background: tokens.background }}
    >
      <img
        src={wordmarkSrc}
        width={132}
        height={54}
        alt="Urbs"
        className="h-13.5 w-33 shrink-0"
      />
      <div
        className="mx-6.25 h-17.5 w-px shrink-0"
        style={{ background: tokens.divider }}
      />
      <div className="min-w-0 whitespace-nowrap font-sans">
        <div
          className="font-bold text-sm leading-4.5"
          style={{ color: tokens.title }}
        >
          {signature.name}
        </div>
        <div
          className="pt-1 text-[13px] leading-4.25"
          style={{ color: tokens.description }}
        >
          {signature.role}
        </div>
        <div
          className="pt-2 font-bold font-mono text-xs leading-4 tracking-normal"
          style={{ color: tokens.email }}
        >
          {signature.email}
        </div>
      </div>
    </div>
  );
}

function downloadTextFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function SignatureBuilder() {
  const [signature, setSignature] = useState(getDefaultSignature);
  const [copied, setCopied] = useState(false);
  const signatureHtml = useMemo(
    () => buildSignatureHtml(signature),
    [signature],
  );
  const signatureDocumentHtml = useMemo(
    () => buildSignatureDocumentHtml(signature),
    [signature],
  );

  function updateSignature(
    field: keyof Signature,
    value: string | SignatureMode,
  ) {
    setSignature((current) => ({ ...current, [field]: value }));
  }

  async function copySignature() {
    await navigator.clipboard.writeText(signatureHtml);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(320px,0.72fr)_minmax(520px,1fr)]">
      <section className="min-w-0 border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="border-b border-border pb-5">
          <p className="font-medium text-muted-foreground text-sm">
            {m.signature_form_kicker()}
          </p>
          <h2 className="mt-1 font-heading font-semibold text-2xl tracking-normal">
            {m.signature_form_title()}
          </h2>
        </div>

        <div className="mt-6 grid gap-5">
          <div className="grid gap-2">
            <Label>{m.signature_variant_label()}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={signature.mode === "light" ? "default" : "outline"}
                aria-pressed={signature.mode === "light"}
                onClick={() => updateSignature("mode", "light")}
              >
                <Sun className="size-4" />
                {m.signature_light()}
              </Button>
              <Button
                type="button"
                variant={signature.mode === "dark" ? "default" : "outline"}
                aria-pressed={signature.mode === "dark"}
                onClick={() => updateSignature("mode", "dark")}
              >
                <Moon className="size-4" />
                {m.signature_dark()}
              </Button>
            </div>
          </div>

          {[
            ["name", m.signature_name_label()],
            ["role", m.signature_role_label()],
            ["email", m.signature_email_label()],
          ].map(([field, label]) => (
            <div className="grid gap-2" key={field}>
              <Label htmlFor={field}>{label}</Label>
              <Input
                id={field}
                type={field === "email" ? "email" : "text"}
                value={signature[field as keyof typeof signature]}
                onChange={(event) =>
                  updateSignature(field as keyof Signature, event.target.value)
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="min-w-0 border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex h-full flex-col">
          <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                {m.signature_preview_kicker()}
              </p>
              <h2 className="mt-1 font-heading font-semibold text-2xl tracking-normal">
                {m.signature_preview_title()}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="min-w-0"
                onClick={copySignature}
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Clipboard className="size-4" />
                )}
                {copied ? m.signature_copied() : m.signature_copy_html()}
              </Button>
              <Button
                type="button"
                className="min-w-0"
                onClick={() =>
                  downloadTextFile(
                    `firma-urbs-${signature.mode}.html`,
                    signatureDocumentHtml,
                  )
                }
              >
                <Download className="size-4" />
                {m.signature_download()}
              </Button>
            </div>
          </div>

          <div className="mt-6 flex min-h-52 flex-1 items-center justify-center overflow-auto border border-border bg-muted p-4 sm:p-6">
            <SignaturePreview signature={signature} />
          </div>
        </div>
      </section>
    </div>
  );
}
