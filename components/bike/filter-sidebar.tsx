"use client";

import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";
import { DualSlider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { getBikeTypeLabel, getMaterialLabel, getBrakeLabel } from "@/lib/bike-utils";
import type { BikeType } from "@/lib/bike-utils";
import { useState } from "react";

// --- Filter value types ---

export interface FilterValues {
  bikeType: BikeType;
  frameMaterial: string;
  brakeSystem: string;
  brandId: string;
  priceRange: [number, number];
}

export const DEFAULT_FILTERS: FilterValues = {
  bikeType: "all",
  frameMaterial: "all",
  brakeSystem: "all",
  brandId: "all",
  priceRange: [0, 120000],
};

// --- Constants ---

const BIKE_TYPES: BikeType[] = ["all", "road", "mountain", "gravel"];

const FRAME_MATERIALS = [
  { value: "carbon", label: "碳纤维" },
  { value: "aluminum", label: "铝合金" },
  { value: "steel", label: "钢架" },
  { value: "titanium", label: "钛合金" },
];

const BRAKE_SYSTEMS = [
  { value: "disc", label: "碟刹" },
  { value: "rim", label: "圈刹" },
];

// --- Props ---

interface FilterSidebarProps {
  brands: { id: string; name: string; _count: { bikes: number } }[];
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
}

export default function FilterSidebar({ brands, filters, onChange }: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (patch: Partial<FilterValues>) => {
    onChange({ ...filters, ...patch });
  };

  const reset = () => onChange({ ...DEFAULT_FILTERS });

  const activeCount =
    (filters.bikeType !== "all" ? 1 : 0) +
    (filters.frameMaterial !== "all" ? 1 : 0) +
    (filters.brakeSystem !== "all" ? 1 : 0) +
    (filters.brandId !== "all" ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 120000 ? 1 : 0);

  const filterContent = (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
          <Filter className="size-3.5" />
          筛选器
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center size-5 rounded-full bg-lime-400 text-[10px] font-bold text-neutral-950">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-lime-400 transition-colors"
          >
            <RotateCcw className="size-3" />
            重置
          </button>
        )}
      </div>

      <Separator />

      {/* 1. Bike Type */}
      <FilterSection title="车型">
        <div className="flex flex-wrap gap-1.5">
          {BIKE_TYPES.map((type) => (
            <FilterChip
              key={type}
              label={getBikeTypeLabel(type)}
              active={filters.bikeType === type}
              onClick={() => update({ bikeType: type })}
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* 2. Frame Material */}
      <FilterSection title="车架材质">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="全部"
            active={filters.frameMaterial === "all"}
            onClick={() => update({ frameMaterial: "all" })}
          />
          {FRAME_MATERIALS.map((m) => (
            <FilterChip
              key={m.value}
              label={m.label}
              active={filters.frameMaterial === m.value}
              onClick={() => update({ frameMaterial: m.value })}
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* 3. Brake System */}
      <FilterSection title="刹车系统">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="全部"
            active={filters.brakeSystem === "all"}
            onClick={() => update({ brakeSystem: "all" })}
          />
          {BRAKE_SYSTEMS.map((b) => (
            <FilterChip
              key={b.value}
              label={b.label}
              active={filters.brakeSystem === b.value}
              onClick={() => update({ brakeSystem: b.value })}
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* 4. Brand */}
      <FilterSection title="品牌">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="全部品牌"
            active={filters.brandId === "all"}
            onClick={() => update({ brandId: "all" })}
          />
          {brands.map((b) => (
            <FilterChip
              key={b.id}
              label={`${b.name} (${b._count.bikes})`}
              active={filters.brandId === b.id}
              onClick={() => update({ brandId: b.id })}
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* 5. Price Range */}
      <FilterSection title="价格区间 (¥)">
        <DualSlider
          min={0}
          max={120000}
          step={1000}
          value={filters.priceRange}
          onValueChange={(v) => update({ priceRange: v })}
          formatLabel={(v) => `¥${(v / 10000).toFixed(1)}w`}
        />
      </FilterSection>

      <Separator />

      {/* Quick actions */}
      <div className="space-y-2">
        <button
          onClick={() => update({ priceRange: [0, 30000] })}
          className="text-[11px] text-neutral-500 hover:text-lime-400 transition-colors block"
        >
          · 入门优选 &lt; ¥3w
        </button>
        <button
          onClick={() => update({ priceRange: [30000, 60000] })}
          className="text-[11px] text-neutral-500 hover:text-lime-400 transition-colors block"
        >
          · 进阶竞赛 ¥3w–6w
        </button>
        <button
          onClick={() => update({ priceRange: [60000, 120000] })}
          className="text-[11px] text-neutral-500 hover:text-lime-400 transition-colors block"
        >
          · 顶级赛事 &gt; ¥6w
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 left-4 z-40 flex items-center gap-2 rounded-full border border-neutral-700
          bg-neutral-900/90 backdrop-blur px-4 py-2.5 text-sm font-medium text-neutral-200 shadow-lg shadow-black/40"
      >
        <SlidersHorizontal className="size-4" />
        筛选
        {activeCount > 0 && (
          <span className="size-5 rounded-full bg-lime-400 text-[10px] font-bold text-neutral-950 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        id="filter-section"
        className={[
          "fixed lg:sticky top-0 lg:top-24 z-40 lg:z-auto",
          "h-full lg:h-fit lg:max-h-[calc(100vh-8rem)] overflow-auto",
          "w-72 lg:w-72 shrink-0",
          "border-r lg:border border-neutral-800 lg:rounded-xl",
          "bg-neutral-950/95 lg:bg-neutral-900/60 backdrop-blur-md",
          "transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="p-5 lg:p-4">{filterContent}</div>
      </aside>
    </>
  );
}

// --- Sub-components ---

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500 mb-2.5">
        {title}
      </h4>
      {children}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-all ${
        active
          ? "border-lime-400/40 bg-lime-400/10 text-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.08)]"
          : "border-neutral-700 bg-neutral-800/50 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300"
      }`}
    >
      {label}
    </button>
  );
}
