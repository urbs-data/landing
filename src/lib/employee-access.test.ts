// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createEmployeeAccess } from "#/lib/employee-access";

const CODE = "123456";
const SECRET = "s".repeat(32);
const TTL_SECONDS = 60;

function setup(
  overrides: Partial<Parameters<typeof createEmployeeAccess>[0]> = {},
) {
  let time = 1_700_000_000_000;
  const access = createEmployeeAccess({
    code: CODE,
    secret: SECRET,
    ttlSeconds: TTL_SECONDS,
    now: () => time,
    sleep: async () => {},
    ...overrides,
  });

  return {
    access,
    advance(ms: number) {
      time += ms;
    },
  };
}

function verifyRequest(code: unknown, ip = "203.0.113.7") {
  return new Request("https://urbs.test/api/employee-access/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": `${ip}, 10.0.0.1`,
    },
    body: JSON.stringify({ code }),
  });
}

async function grantedCookieHeader(access: ReturnType<typeof setup>["access"]) {
  const response = await access.handleVerify(verifyRequest(CODE));
  const setCookie = response.headers.get("Set-Cookie") ?? "";
  return setCookie.split(";")[0];
}

describe("createEmployeeAccess", () => {
  it("grants a signed HttpOnly cookie for the correct code", async () => {
    const { access } = setup();
    const response = await access.handleVerify(verifyRequest(CODE));

    expect(response.status).toBe(200);
    const setCookie = response.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toMatch(/^urbs_employee_access=/);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain(`Max-Age=${TTL_SECONDS}`);
    expect(setCookie).toContain("Secure");
  });

  it("rejects a wrong code with 401", async () => {
    const { access } = setup();
    const response = await access.handleVerify(verifyRequest("000000"));

    expect(response.status).toBe(401);
    expect(response.headers.get("Set-Cookie")).toBeNull();
  });

  it("fails closed with 503 when the secret is missing or too short", async () => {
    for (const secret of [undefined, "", "short-secret"]) {
      const { access } = setup({ secret });
      const response = await access.handleVerify(verifyRequest(CODE));

      expect(response.status).toBe(503);
      expect(response.headers.get("Set-Cookie")).toBeNull();
    }
  });

  it("answers 503 when the code is not configured", async () => {
    const { access } = setup({ code: undefined });

    expect((await access.handleVerify(verifyRequest(CODE))).status).toBe(503);
  });

  it("rate limits a client after repeated failures", async () => {
    const { access, advance } = setup({
      maxFailedAttempts: 3,
      rateLimitWindowMs: 60_000,
    });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect((await access.handleVerify(verifyRequest("000000"))).status).toBe(
        401,
      );
    }

    const limited = await access.handleVerify(verifyRequest(CODE));
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThan(0);

    // Other clients are unaffected.
    expect(
      (await access.handleVerify(verifyRequest(CODE, "198.51.100.1"))).status,
    ).toBe(200);

    advance(60_001);
    expect((await access.handleVerify(verifyRequest(CODE))).status).toBe(200);
  });

  it("accepts a fresh cookie and rejects it after the TTL", async () => {
    const { access, advance } = setup();
    const cookie = await grantedCookieHeader(access);

    expect(await access.isGranted(`theme=dark; ${cookie}`)).toBe(true);

    advance(TTL_SECONDS * 1000 + 1);
    expect(await access.isGranted(cookie)).toBe(false);
  });

  it("rejects a tampered signature or a cookie signed with another secret", async () => {
    const { access } = setup();
    const cookie = await grantedCookieHeader(access);
    const tampered = `${cookie.slice(0, -1)}${cookie.endsWith("A") ? "B" : "A"}`;

    expect(await access.isGranted(tampered)).toBe(false);

    const other = setup({ secret: "o".repeat(32) }).access;
    expect(await other.isGranted(cookie)).toBe(false);
  });

  it("does not throw on malformed cookie headers", async () => {
    const { access } = setup();
    const cookie = await grantedCookieHeader(access);

    expect(await access.isGranted("x=%E0; =; broken")).toBe(false);
    expect(await access.isGranted(`x=%E0; ${cookie}`)).toBe(true);
    expect(await access.isGranted("urbs_employee_access=%E0")).toBe(false);
  });

  it("guards handlers behind the access cookie", async () => {
    const { access } = setup();
    const guarded = access.guard(() => new Response("secret"));
    const url = "https://urbs.test/api/social/assets/meet";

    const denied = await guarded(new Request(url));
    expect(denied.status).toBe(401);

    const cookie = await grantedCookieHeader(access);
    const allowed = await guarded(
      new Request(url, { headers: { Cookie: cookie } }),
    );
    expect(allowed.status).toBe(200);
    expect(await allowed.text()).toBe("secret");
  });
});
