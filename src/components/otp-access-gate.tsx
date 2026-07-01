"use client";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Button } from "#/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "#/components/ui/input-otp";
import { UrbsLogo } from "#/components/urbs-logo";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";

const SESSION_KEY = "urbs:employee-access";
const ACCESS_ENDPOINT = "/api/employee-access/verify";

type AccessState =
  | "resolving"
  | "idle"
  | "checking"
  | "granted"
  | "denied"
  | "unavailable";

export function OtpAccessGate({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<AccessState>("resolving");

  useEffect(() => {
    setState(
      window.sessionStorage.getItem(SESSION_KEY) === "granted"
        ? "granted"
        : "idle",
    );
  }, []);

  const verifyCode = useCallback(
    async (code: string) => {
      if (code.length !== 6 || state === "checking") return;

      setState("checking");

      try {
        const response = await fetch(ACCESS_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (response.ok) {
          window.sessionStorage.setItem(SESSION_KEY, "granted");
          setState("granted");
          return;
        }

        setState(response.status === 503 ? "unavailable" : "denied");
        setValue("");
      } catch {
        setState("unavailable");
      }
    },
    [state],
  );

  function verifyAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void verifyCode(value);
  }

  if (state === "granted") return children;

  if (state === "resolving") {
    return (
      <main
        className={cn(
          "flex min-h-dvh items-center justify-center bg-background px-4 py-24 text-foreground sm:px-6",
          className,
        )}
      >
        <section className="flex items-center gap-3 text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          <span className="text-sm">{m.otp_resolving()}</span>
        </section>
      </main>
    );
  }

  const message =
    state === "denied"
      ? m.otp_denied()
      : state === "unavailable"
        ? m.otp_unavailable()
        : m.otp_idle();

  return (
    <main
      className={cn(
        "flex min-h-dvh items-center justify-center bg-background px-4 py-24 text-foreground sm:px-6",
        className,
      )}
    >
      <section className="w-full max-w-115 border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-6">
          <UrbsLogo />
          <div className="flex size-10 items-center justify-center border border-border bg-secondary text-primary">
            <LockKeyhole className="size-5" />
          </div>
        </div>

        <div className="mt-7 flex items-center gap-2 text-primary">
          <ShieldCheck className="size-4" />
          <p className="font-medium text-sm">{m.otp_kicker()}</p>
        </div>
        <h1 className="mt-3 text-balance font-heading font-semibold text-3xl tracking-normal">
          {title}
        </h1>
        <p className="mt-3 text-muted-foreground text-sm leading-6">
          {description}
        </p>

        <form className="mt-8 space-y-5" onSubmit={verifyAccess}>
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            inputMode="text"
            value={value}
            onChange={(nextValue) => {
              const code = nextValue.replace(/[^a-zA-Z0-9]/g, "");

              setValue(code);
              if (state === "denied") setState("idle");
              if (code.length === 6) void verifyCode(code);
            }}
            containerClassName="w-full"
            aria-label={m.otp_code_label()}
          >
            <InputOTPGroup className="grid w-full grid-cols-6 gap-2 rounded-none">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className={cn(
                    "size-auto h-12 rounded-none border border-border bg-background text-base font-semibold shadow-xs",
                    "first:rounded-none first:border last:rounded-none",
                    "data-[active=true]:border-primary data-[active=true]:ring-[3px] data-[active=true]:ring-primary/20",
                    state === "denied" &&
                      "border-destructive text-destructive data-[active=true]:border-destructive data-[active=true]:ring-destructive/20",
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <p
            className={cn(
              "min-h-5 text-sm",
              state === "denied" || state === "unavailable"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
            aria-live="polite"
          >
            {message}
          </p>

          <Button
            className="w-full"
            size="lg"
            disabled={value.length !== 6 || state === "checking"}
          >
            {state === "checking" ? (
              <>
                {m.otp_checking()}
                <LoaderCircle className="size-4 animate-spin" />
              </>
            ) : (
              <>
                {m.otp_submit()}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </section>
    </main>
  );
}
