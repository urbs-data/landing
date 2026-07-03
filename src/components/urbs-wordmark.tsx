import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import { UrbsLogo } from "./urbs-logo";

type UrbsWordmarkProps = {
  asLink?: boolean;
  className?: string;
  logoClassName?: string;
  wordClassName?: string;
};

export const UrbsWordmark = ({
  asLink = true,
  className,
  logoClassName,
  wordClassName,
}: UrbsWordmarkProps) => {
  const content = (
    <>
      <UrbsLogo className={cn("size-8", logoClassName)} />
      <span
        className={cn(
          "relative bottom-0.5 font-logo font-medium text-xl tracking-tight",
          wordClassName,
        )}
      >
        urbs
      </span>
    </>
  );

  if (!asLink) {
    return (
      <div
        className={cn("flex items-center gap-1", className)}
        role="img"
        aria-label={m.brand_home_label()}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to="/"
      className={cn("flex items-center gap-1", className)}
      aria-label={m.brand_home_label()}
    >
      {content}
    </Link>
  );
};
