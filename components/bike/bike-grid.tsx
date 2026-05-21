"use client";

import { AlertCircle } from "lucide-react";
import BikeCard from "@/components/bike/bike-card";
import type { SizingResult } from "@/lib/bike-utils";

interface BikeData {
  id: string;
  model: string;
  frameMaterial: string;
  brakeSystem: string;
  price: number;
  weight: number | null;
  groupset: string | null;
  reachStack: string;
  scenarioTags: string;
  description: string | null;
  image: string | null;
  brand: { name: string; country: string | null };
}

interface BikeGridProps {
  bikes: BikeData[];
  selectedIds: Set<string>;
  onToggleCompare: (id: string) => void;
  sizingResult: SizingResult | null;
}

export default function BikeGrid({
  bikes,
  selectedIds,
  onToggleCompare,
  sizingResult,
}: BikeGridProps) {
  if (bikes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 mb-4">
          <AlertCircle className="size-7 text-neutral-600" />
        </div>
        <h3 className="text-base font-semibold text-neutral-300 mb-1">没有匹配的车型</h3>
        <p className="text-sm text-neutral-500 max-w-xs">
          试试调整筛选条件或重置筛选器，当前组合下暂无在售现货。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {bikes.map((bike) => (
        <BikeCard
          key={bike.id}
          bike={bike}
          isCompared={selectedIds.has(bike.id)}
          onToggleCompare={onToggleCompare}
          sizingResult={sizingResult}
          disabledCompare={!selectedIds.has(bike.id) && selectedIds.size >= 4}
        />
      ))}
    </div>
  );
}
