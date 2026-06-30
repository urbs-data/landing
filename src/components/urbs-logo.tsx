import { Link } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";
import { UrbsIcon } from "./urbs-icon";

export const UrbsLogo = () => {
  return (
    <Link
      to="/"
      className="flex items-center gap-1"
      aria-label={m.brand_home_label()}
    >
      <UrbsIcon className="size-8" />
      <span className="text-xl font-medium tracking-tight font-logo bottom-0.5 relative">
        urbs
      </span>
    </Link>
  );
};
