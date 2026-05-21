import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-tight whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "border-neutral-700 bg-neutral-800 text-neutral-300",
        lime: "border-lime-500/30 bg-lime-500/10 text-lime-400",
        red: "border-red-500/30 bg-red-500/10 text-red-400",
        amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        sky: "border-sky-500/30 bg-sky-500/10 text-sky-400",
        violet: "border-violet-500/30 bg-violet-500/10 text-violet-400",
        emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
