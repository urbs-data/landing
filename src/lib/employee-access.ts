import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

/**
 * Employee access: a shared 6-digit code exchanged for a signed, HttpOnly
 * cookie that unlocks the internal pages and their gated API endpoints.
 *
 * `createEmployeeAccess` owns the whole protocol — code verification, rate
 * limiting, cookie signing and verification — and takes its configuration and
 * clock as inputs. `employeeAccess` is the app instance wired to the env.
 */

const ACCESS_COOKIE_NAME = "urbs_employee_access";
const DEFAULT_TTL_SECONDS = 60 * 60 * 8;
const MIN_SECRET_LENGTH = 32;
const ACCESS_CODE_PATTERN = /^\d{6}$/;

const DEFAULT_MAX_FAILED_ATTEMPTS = 5;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_FAILURE_DELAY_MS = 300;
const MAX_TRACKED_CLIENTS = 10_000;

export type EmployeeAccess = {
  /** Handles `POST /api/employee-access/verify` with a `{ code }` JSON body. */
  handleVerify(req: Request): Promise<Response>;
  /** Whether a raw `Cookie` header carries a valid, unexpired access cookie. */
  isGranted(cookieHeader: string | null | undefined): Promise<boolean>;
  /** Wraps a request handler so it answers 401 unless access is granted. */
  guard<TArgs extends unknown[]>(
    handler: (req: Request, ...args: TArgs) => Response | Promise<Response>,
  ): (req: Request, ...args: TArgs) => Promise<Response>;
};

export type EmployeeAccessOptions = {
  /** The shared 6-digit code. Missing or malformed → verify answers 503. */
  code: string | undefined;
  /** HMAC key for the cookie (≥ 32 chars). Missing or short → fail closed. */
  secret: string | undefined;
  now?: () => number;
  ttlSeconds?: number;
  maxFailedAttempts?: number;
  rateLimitWindowMs?: number;
  /** Constant delay added to every failed verification. */
  failureDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
};

function defaultSleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
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

function readCookie(cookieHeader: string | null | undefined, name: string) {
  if (!cookieHeader) return undefined;

  for (const cookie of cookieHeader.split(";")) {
    const separator = cookie.indexOf("=");
    if (separator === -1 || cookie.slice(0, separator).trim() !== name) {
      continue;
    }

    try {
      return decodeURIComponent(cookie.slice(separator + 1).trim());
    } catch {
      // Undecodable value: treat as absent rather than failing the request.
    }
  }

  return undefined;
}

function getClientKey(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0];

  return (
    forwardedFor?.trim() || req.headers.get("x-real-ip")?.trim() || "unknown"
  );
}

/**
 * Sliding-window limiter on *failed* attempts per client.
 *
 * State lives in this process's memory, so the limit is per server instance:
 * N instances allow up to N × `maxFailures` guesses per window, and a restart
 * resets it. Good enough to make a 6-digit code impractical to brute-force on a
 * single node; use a shared store if this ever runs on many instances.
 */
function createFailureLimiter({
  now,
  maxFailures,
  windowMs,
}: {
  now: () => number;
  maxFailures: number;
  windowMs: number;
}) {
  const failures = new Map<string, number[]>();

  function recent(key: string) {
    const cutoff = now() - windowMs;
    const timestamps = (failures.get(key) ?? []).filter((at) => at > cutoff);

    if (timestamps.length === 0) failures.delete(key);
    else failures.set(key, timestamps);

    return timestamps;
  }

  return {
    /** Seconds until the client may try again, or 0 when not blocked. */
    retryAfterSeconds(key: string) {
      const timestamps = recent(key);
      if (timestamps.length < maxFailures) return 0;

      const unblockAt = timestamps[timestamps.length - maxFailures] + windowMs;
      return Math.max(1, Math.ceil((unblockAt - now()) / 1000));
    },
    recordFailure(key: string) {
      const timestamps = recent(key);

      // Bound memory: evict the oldest tracked client (Map keeps insertion order).
      if (!failures.has(key) && failures.size >= MAX_TRACKED_CLIENTS) {
        const oldest = failures.keys().next().value;
        if (oldest !== undefined) failures.delete(oldest);
      }

      failures.delete(key);
      failures.set(key, [...timestamps, now()]);
    },
    reset(key: string) {
      failures.delete(key);
    },
  };
}

export function createEmployeeAccess({
  code,
  secret,
  now = Date.now,
  ttlSeconds = DEFAULT_TTL_SECONDS,
  maxFailedAttempts = DEFAULT_MAX_FAILED_ATTEMPTS,
  rateLimitWindowMs = DEFAULT_RATE_LIMIT_WINDOW_MS,
  failureDelayMs = DEFAULT_FAILURE_DELAY_MS,
  sleep = defaultSleep,
}: EmployeeAccessOptions): EmployeeAccess {
  const configuredCode = code && ACCESS_CODE_PATTERN.test(code) ? code : null;
  const configuredSecret =
    secret && secret.length >= MIN_SECRET_LENGTH ? secret : null;
  const limiter = createFailureLimiter({
    now,
    maxFailures: maxFailedAttempts,
    windowMs: rateLimitWindowMs,
  });

  let signingKey: Promise<CryptoKey> | undefined;

  async function sign(payload: string, key: string) {
    signingKey ??= crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      await signingKey,
      new TextEncoder().encode(payload),
    );

    return encodeBase64Url(new Uint8Array(signature));
  }

  async function createCookie(key: string, secure: boolean) {
    const payload = String(now() + ttlSeconds * 1000);
    const value = `${payload}.${await sign(payload, key)}`;
    const parts = [
      `${ACCESS_COOKIE_NAME}=${encodeURIComponent(value)}`,
      `Max-Age=${ttlSeconds}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
    ];

    if (secure) parts.push("Secure");

    return parts.join("; ");
  }

  async function isGranted(cookieHeader: string | null | undefined) {
    if (!configuredSecret) return false;

    const value = readCookie(cookieHeader, ACCESS_COOKIE_NAME);
    if (!value) return false;

    const [expiresAt, signature, ...rest] = value.split(".");
    const expiresAtMs = Number(expiresAt);

    if (!expiresAt || !signature || rest.length > 0) return false;
    if (!Number.isFinite(expiresAtMs) || now() > expiresAtMs) return false;

    return timingSafeEqual(signature, await sign(expiresAt, configuredSecret));
  }

  async function reject(status: number, headers?: HeadersInit) {
    await sleep(failureDelayMs);
    return Response.json({ ok: false }, { status, headers });
  }

  async function handleVerify(req: Request) {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (!configuredCode || !configuredSecret) {
      return Response.json({ ok: false }, { status: 503 });
    }

    let submitted: unknown;
    try {
      submitted = ((await req.json()) as { code?: unknown } | null)?.code;
    } catch {
      return Response.json({ ok: false }, { status: 400 });
    }

    // No awaits between the limit check and recording the outcome, so
    // concurrent requests can't all slip past the check before one records.
    const client = getClientKey(req);
    const retryAfter = limiter.retryAfterSeconds(client);

    if (retryAfter > 0) {
      return Response.json(
        { ok: false },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    if (
      typeof submitted !== "string" ||
      !timingSafeEqual(submitted, configuredCode)
    ) {
      limiter.recordFailure(client);
      return reject(401);
    }

    limiter.reset(client);

    return Response.json(
      { ok: true },
      {
        headers: {
          "Set-Cookie": await createCookie(
            configuredSecret,
            new URL(req.url).protocol === "https:",
          ),
        },
      },
    );
  }

  return {
    handleVerify,
    isGranted,
    guard(handler) {
      return async (req, ...args) => {
        if (!(await isGranted(req.headers.get("Cookie")))) {
          return new Response("Unauthorized", { status: 401 });
        }

        return handler(req, ...args);
      };
    },
  };
}

let defaultInstance: Promise<EmployeeAccess> | undefined;

function getDefaultInstance() {
  // Lazy import keeps env parsing (and zod) out of client bundles that pull in
  // this module for `getEmployeeAccess`.
  defaultInstance ??= import("#/env")
    .then(({ env }) => ({
      code: env.SIGNATURES_PRESENTATIONS_ACCESS_CODE,
      secret: env.SIGNATURES_PRESENTATIONS_ACCESS_COOKIE_SECRET,
    }))
    .catch((error: unknown) => {
      console.error("[employee-access] invalid environment, failing closed", {
        error,
      });
      return { code: undefined, secret: undefined };
    })
    .then((config) => createEmployeeAccess(config));

  return defaultInstance;
}

/** The app's employee access, configured from validated env vars. */
export const employeeAccess: EmployeeAccess = {
  handleVerify: async (req) => (await getDefaultInstance()).handleVerify(req),
  isGranted: async (cookieHeader) =>
    (await getDefaultInstance()).isGranted(cookieHeader),
  guard:
    (handler) =>
    async (req, ...args) =>
      (await getDefaultInstance()).guard(handler)(req, ...args),
};

export const getEmployeeAccess = createServerFn({ method: "GET" }).handler(
  async () => ({
    hasAccess: await employeeAccess.isGranted(getRequestHeader("cookie")),
  }),
);
