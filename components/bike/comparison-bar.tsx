"use client";

import { ArrowUp, Trash2, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComparisonBike {
  id: string;
  model: string;
  brand: { name: string };
}

interface ComparisonBarProps {
  bikes: ComparisonBike[];
  onClear: () => void;
  onCompare: () => void;
}

export default function ComparisonBar({ bikes, onClear, onCompare }: ComparisonBarProps) {
  if (bikes.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 animate-slide-up">
      <div className="mx-auto max-w-4xl px-4 pb-4">
        <div
          className="flex items-center gap-4 rounded-2xl border border-neutral-700 bg-neutral-900/90 backdrop-blur-xl
            px-5 py-3.5 shadow-2xl shadow-black/60"
        >
          {/* Selected count */}
          <div className="flex items-center gap-2 shrink-0">
            <Columns3 className="size-4 text-lime-400" />
            <span className="text-sm font-semibold text-neutral-200">
              对比 <span className="text-lime-400">{bikes.length}</span>/4
            </span>
          </div>

          {/* Bike chips */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1">
            {bikes.map((bike) => (
              <span
                key={bike.id}
                className="inline-flex items-center gap-1 shrink-0 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-[11px] font-medium text-neutral-300"
              >
                <span className="text-neutral-500">{bike.brand.name}</span>
                {bike.model}
              </span>
            ))}
            {bikes.length < 2 && (
              <span className="text-[11px] text-neutral-600">
                再选 {2 - bikes.length} 辆即可对比
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClear}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-neutral-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="size-3" />
              清空
            </button>
            <Button
              onClick={onCompare}
              disabled={bikes.length < 2}
              className="h-8 px-4 bg-lime-400 hover:bg-lime-300 text-neutral-950 font-bold text-xs gap-1.5"
            >
              <ArrowUp className="size-3" />
              开始 PK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
