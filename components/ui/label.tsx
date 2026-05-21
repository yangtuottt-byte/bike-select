import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-tight text-neutral-300 peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };
