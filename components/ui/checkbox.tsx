"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

function Checkbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
}: CheckboxProps) {
  return (
    <button
      id={id}
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      data-slot="checkbox"
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "flex size-4.5 shrink-0 items-center justify-center rounded border transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-lime-400/40",
        checked
          ? "border-lime-400 bg-lime-400 text-neutral-950"
          : "border-neutral-600 bg-neutral-900 hover:border-neutral-500",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {checked && <Check className="size-3 stroke-[3]" />}
    </button>
  );
}

export { Checkbox };
