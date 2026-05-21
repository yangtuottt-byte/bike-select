import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100",
        "placeholder:text-neutral-500",
        "focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-100",
        className
      )}
      {...props}
    />
  );
}

export { Input };
