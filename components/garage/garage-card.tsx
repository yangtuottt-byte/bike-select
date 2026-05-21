"use client";

import { X } from "lucide-react";
import type { GarageBike } from "@/lib/garage-store";
import BikeImage from "@/components/bike/bike-image";

interface GarageCardProps {
  bike: GarageBike;
  onRemove: (id: string) => void;
}

export default function GarageCard({ bike, onRemove }: GarageCardProps) {
  return (
    <div
      className="group flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3
        hover:border-neutral-700 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative size-14 shrink-0 rounded-lg overflow-hidden border border-neutral-700">
        <BikeImage
          src={bike.image}
          alt={bike.model}
          brandName={bike.brand.name}
          sizes="garage"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-neutral-500 leading-tight">{bike.brand.name}</p>
        <p className="text-sm font-bold text-neutral-100 leading-tight truncate">{bike.model}</p>
        <p className="text-xs font-mono font-bold text-lime-400 tabular-nums mt-0.5">
          ¥{bike.price.toLocaleString()}
        </p>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(bike.id)}
        className="shrink-0 flex size-7 items-center justify-center rounded-lg
          text-neutral-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
