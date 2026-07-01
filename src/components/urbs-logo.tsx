import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import { UrbsIcon } from "./urbs-icon";

type UrbsLogoProps = {
  asLink?: boolean;
  className?: string;
  iconClassName?: string;
  wordClassName?: string;
};

export const UrbsLogo = ({
  asLink = true,
  className,
  iconClassName,
  wordClassName,
}: UrbsLogoProps) => {
  const content = (
    <>
      <UrbsIcon className={cn("size-8", iconClassName)} />
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
