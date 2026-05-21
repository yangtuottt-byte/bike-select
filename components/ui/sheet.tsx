"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  children: ReactNode;
  className?: string;
}

function Sheet({ open, onClose, side = "right", children, className }: SheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const slideClass =
    side === "right"
      ? open
        ? "translate-x-0"
        : "translate-x-full"
      : open
        ? "translate-x-0"
        : "-translate-x-full";

  return (
    <div className="fixed inset-0 z-50 isolate">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
      />
      {/* Panel */}
      <div
        data-slot="sheet"
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute top-0 bottom-0 w-80 sm:w-96 bg-neutral-950 border-l border-neutral-800 shadow-2xl shadow-black/60",
          "flex flex-col transition-transform duration-300 ease-out",
          side === "right" ? "right-0" : "left-0",
          slideClass,
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-lg
            border border-neutral-700 bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 transition-colors"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 px-6 pt-6 pb-4", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="sheet-title"
      className={cn("text-lg font-bold tracking-tight text-neutral-100", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="sheet-description"
      className={cn("text-sm text-neutral-500", className)}
      {...props}
    />
  );
}

function SheetContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-content"
      className={cn("flex-1 overflow-auto px-6 py-4", className)}
      {...props}
    />
  );
}

export { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent };
