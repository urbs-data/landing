import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    SERVER_URL: z.url().optional(),
    /** Shared 6-digit code that unlocks the internal employee pages. */
    SIGNATURES_PRESENTATIONS_ACCESS_CODE: z
      .string()
      .regex(/^\d{6}$/)
      .optional(),
    /** HMAC key for the employee access cookie. Never derived from the code. */
    SIGNATURES_PRESENTATIONS_ACCESS_COOKIE_SECRET: z
      .string()
      .min(32)
      .optional(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "VITE_",

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
  },

  /**
   * What object holds the environment variables at runtime. Vite only exposes
   * `VITE_`-prefixed vars on `import.meta.env`, so server vars come from
   * `process.env` (absent in the browser, where server vars are never read).
   */
  runtimeEnv: {
    ...(typeof process === "undefined" ? {} : process.env),
    ...import.meta.env,
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
