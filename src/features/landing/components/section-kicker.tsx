import { cn } from "@/lib/utils";

type SectionKickerProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionKicker({ children, className }: SectionKickerProps) {
  return (
    <p
      className={cn(
        "font-mono text-xs uppercase tracking-widest text-primary dark:brightness-175",
        className,
      )}
    >
      {children}
    </p>
  );
}
