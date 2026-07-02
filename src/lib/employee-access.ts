import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

const ACCESS_COOKIE_NAME = "urbs_employee_access";
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 8;
const ACCESS_COOKIE_PATH = "/";

type AccessCookieOptions = {
  secure: boolean;
};

function getAccessSecret() {
  return (
    process.env.SIGNATURES_PRESENTATIONS_ACCESS_COOKIE_SECRET ||
    process.env.SIGNATURES_PRESENTATIONS_ACCESS_CODE ||
    ""
  );
}

function getAccessCode() {
  return process.env.SIGNATURES_PRESENTATIONS_ACCESS_CODE || "";
}

function encodeBase64Url(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    "",
  );
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}

async function signAccessPayload(payload: string) {
  const secret = getAccessSecret();

  if (!secret) return "";

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  return encodeBase64Url(new Uint8Array(signature));
}

export function parseCookieHeader(cookieHeader: string | null) {
  const cookies = new Map<string, string>();

  if (!cookieHeader) return cookies;

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (!name || valueParts.length === 0) continue;

    cookies.set(name, decodeURIComponent(valueParts.join("=")));
  }

  return cookies;
}

export async function createEmployeeAccessCookie(options: AccessCookieOptions) {
  const expiresAt = Date.now() + ACCESS_COOKIE_MAX_AGE * 1000;
  const payload = String(expiresAt);
  const signature = await signAccessPayload(payload);
  const value = `${payload}.${signature}`;
  const parts = [
    `${ACCESS_COOKIE_NAME}=${encodeURIComponent(value)}`,
    `Max-Age=${ACCESS_COOKIE_MAX_AGE}`,
    `Path=${ACCESS_COOKIE_PATH}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (options.secure) parts.push("Secure");

  return parts.join("; ");
}

export async function isEmployeeAccessGranted(cookieValue: string | undefined) {
  if (!cookieValue) return false;

  const [expiresAt, signature] = cookieValue.split(".");
  const expiresAtMs = Number(expiresAt);

  if (!expiresAt || !signature || !Number.isFinite(expiresAtMs)) return false;
  if (Date.now() > expiresAtMs) return false;

  const expectedSignature = await signAccessPayload(expiresAt);

  return timingSafeEqual(signature, expectedSignature);
}

export async function isEmployeeAccessGrantedFromCookieHeader(
  cookieHeader: string | null,
) {
  return isEmployeeAccessGranted(
    parseCookieHeader(cookieHeader).get(ACCESS_COOKIE_NAME),
  );
}

export function verifyEmployeeAccessCode(code: unknown) {
  const configuredCode = getAccessCode();

  if (!configuredCode) return "unavailable";
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return "invalid";
  }

  return timingSafeEqual(code, configuredCode) ? "valid" : "invalid";
}

export const getEmployeeAccess = createServerFn({ method: "GET" }).handler(
  async () => ({
    hasAccess: await isEmployeeAccessGranted(getCookie(ACCESS_COOKIE_NAME)),
  }),
);
