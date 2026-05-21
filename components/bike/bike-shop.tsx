"use client";

import { useState, useMemo } from "react";
import HeroSection from "@/components/bike/hero-section";
import FilterSidebar, {
  DEFAULT_FILTERS,
  type FilterValues,
} from "@/components/bike/filter-sidebar";
import BikeGrid from "@/components/bike/bike-grid";
import SizingCalculator from "@/components/bike/sizing-calculator";
import ComparisonBar from "@/components/bike/comparison-bar";
import ComparisonModal from "@/components/bike/comparison-modal";
import { parseTags, getBikeType, isBikeInSizeRange, type SizingResult } from "@/lib/bike-utils";
import { useToast } from "@/components/ui/toast";

// --- Types matching the Prisma query result ---

interface BikeData {
  id: string;
  model: string;
  brandId: string;
  brand: {
    id: string;
    name: string;
    country: string | null;
  };
  frameMaterial: string;
  brakeSystem: string;
  price: number;
  weight: number | null;
  groupset: string | null;
  reachStack: string;
  scenarioTags: string;
  description: string | null;
  image: string | null;
  specs: string | null;
}

interface BrandData {
  id: string;
  name: string;
  _count: { bikes: number };
}

interface BikeShopProps {
  bikes: BikeData[];
  brands: BrandData[];
}

export default function BikeShop({ bikes, brands }: BikeShopProps) {
  // --- State ---
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sizingResult, setSizingResult] = useState<SizingResult | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const { toast } = useToast();

  // --- Derived: filtered bikes ---
  const filteredBikes = useMemo(() => {
    return bikes.filter((bike) => {
      if (filters.bikeType !== "all") {
        const tags = parseTags(bike.scenarioTags);
        if (getBikeType(tags) !== filters.bikeType) return false;
      }
      if (filters.frameMaterial !== "all" && bike.frameMaterial !== filters.frameMaterial) {
        return false;
      }
      if (filters.brakeSystem !== "all" && bike.brakeSystem !== filters.brakeSystem) {
        return false;
      }
      if (filters.brandId !== "all" && bike.brandId !== filters.brandId) {
        return false;
      }
      if (bike.price < filters.priceRange[0] || bike.price > filters.priceRange[1]) {
        return false;
      }
      return true;
    });
  }, [bikes, filters]);

  // --- Derived: selected bikes ---
  const selectedBikes = useMemo(() => {
    return bikes.filter((b) => selectedIds.has(b.id));
  }, [bikes, selectedIds]);

  // --- Handlers ---
  const toggleCompare = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        const removedBike = bikes.find((b) => b.id === id);
        toast({
          title: removedBike ? `${removedBike.brand.name} ${removedBike.model} 已移出对比` : "已移出对比",
          variant: "default",
        });
      } else if (next.size < 4) {
        next.add(id);
        const addedBike = bikes.find((b) => b.id === id);
        toast({
          title: addedBike ? `${addedBike.model} 加入对比` : "加入对比",
          description: `对比栏: ${next.size} / 4 款车型`,
          variant: "success",
        });
      } else {
        toast({
          title: "对比栏已满",
          description: "最多同时对比 4 款车型，请先移出再添加",
          variant: "destructive",
        });
      }
      return next;
    });
  };

  const clearComparison = () => {
    setSelectedIds(new Set());
    setComparisonOpen(false);
  };

  // --- Derived: sizing match count ---
  const sizingMatchCount = useMemo(() => {
    if (!sizingResult) return 0;
    return filteredBikes.filter((b) => isBikeInSizeRange(b.reachStack, sizingResult)).length;
  }, [filteredBikes, sizingResult]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Hero */}
      <HeroSection bikeCount={bikes.length} brandCount={brands.length} />

      {/* Main content area */}
      <div className="flex-1 flex gap-6 px-4 lg:px-8 pb-24 max-w-[1440px] mx-auto w-full">
        {/* Sidebar */}
        <FilterSidebar
          brands={brands}
          filters={filters}
          onChange={setFilters}
        />

        {/* Right content */}
        <div className="flex-1 min-w-0 pt-6 lg:pt-24">
          {/* Sizing Calculator */}
          <SizingCalculator onCalculate={setSizingResult} />

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500">
              共{" "}
              <span className="font-mono font-bold text-neutral-300 tabular-nums">
                {filteredBikes.length}
              </span>{" "}
              款车型
              {sizingResult && (
                <span className="ml-2 text-lime-400">
                  · {sizingMatchCount} 款尺码匹配
                </span>
              )}
            </p>
          </div>

          {/* Bike grid */}
          <BikeGrid
            bikes={filteredBikes}
            selectedIds={selectedIds}
            onToggleCompare={toggleCompare}
            sizingResult={sizingResult}
          />
        </div>
      </div>

      {/* Comparison bar */}
      <ComparisonBar
        bikes={selectedBikes}
        onClear={clearComparison}
        onCompare={() => setComparisonOpen(true)}
      />

      {/* Comparison modal */}
      <ComparisonModal
        bikes={selectedBikes}
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
      />
    </div>
  );
}
