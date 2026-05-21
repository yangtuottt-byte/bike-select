"use client";

import { useState } from "react";
import { Bike } from "lucide-react";
import { cn } from "@/lib/utils";

interface BikeImageProps {
  src: string | null;
  alt: string;
  brandName?: string;
  className?: string;
  containerClassName?: string;
  sizes?: "card" | "hero" | "thumb" | "garage";
  priority?: boolean;
}

export default function BikeImage({
  src,
  alt,
  brandName,
  className,
  containerClassName,
  sizes = "card",
  priority = false,
}: BikeImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const sizeClasses: Record<string, string> = {
    hero: "h-[55vh] min-h-[400px]",
    card: "h-44",
    thumb: "h-28",
    garage: "size-14",
  };

  if (!src || error) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-neutral-900",
          sizeClasses[sizes],
          containerClassName
        )}
      >
        {/* Animated shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.79 0.26 134) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.79 0.26 134) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Center content */}
        <div className="relative flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-neutral-800 border border-neutral-700">
            <Bike className="size-6 text-neutral-500" />
          </div>
          {brandName && (
            <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-[0.15em]">
              {brandName}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-neutral-900",
        sizeClasses[sizes],
        containerClassName
      )}
    >
      {/* Low-res placeholder shimmer while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? undefined : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
}
