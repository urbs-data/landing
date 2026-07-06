import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";

type BrandWordmarkProps = {
  asLink?: boolean;
  className?: string;
};

/**
 * Urbs wordmark rendered from the brand SVG assets (`public/assets/brand/wordmark-*.svg`).
 * The light/dark variants are toggled with the `.dark` class so it stays correct
 * without a theme hook (SSR-safe, no hydration flash).
 */
export function BrandWordmark({
  asLink = true,
  className,
}: BrandWordmarkProps) {
  const images = (
    <>
      <img
        src="/assets/brand/wordmark-light.svg"
        alt=""
        aria-hidden="true"
        className="block h-8 w-auto dark:hidden"
      />
      <img
        src="/assets/brand/wordmark-dark.svg"
        alt=""
        aria-hidden="true"
        className="hidden h-8 w-auto dark:block brightness-150"
      />
    </>
  );

  if (!asLink) {
    return (
      <div
        className={cn("inline-flex items-center", className)}
        role="img"
        aria-label={m.brand_home_label()}
      >
        {images}
      </div>
    );
  }

  return (
    <Link
      to="/"
      className={cn("inline-flex items-center", className)}
      aria-label={m.brand_home_label()}
    >
      {images}
    </Link>
  );
}
