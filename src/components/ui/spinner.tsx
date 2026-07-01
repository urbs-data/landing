import { Loader2Icon } from "lucide-react";
import { cn } from "#/lib/utils.ts";
import { m } from "#/paraglide/messages";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label={m.loading_label()}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
