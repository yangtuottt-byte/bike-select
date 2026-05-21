"use client";

import { useState, useMemo } from "react";
import { Sparkles, X, RefreshCw } from "lucide-react";
import HeroSection from "@/components/bike/hero-section";
import FilterSidebar, {
  DEFAULT_FILTERS,
  type FilterValues,
} from "@/components/bike/filter-sidebar";
import BikeGrid from "@/components/bike/bike-grid";
import SizingCalculator from "@/components/bike/sizing-calculator";
import ComparisonBar from "@/components/bike/comparison-bar";
import ComparisonModal from "@/components/bike/comparison-modal";
import FitCalculator from "@/components/fit/FitCalculator";
import { parseTags, getBikeType, isBikeInSizeRange, type SizingResult } from "@/lib/bike-utils";
import { useToast } from "@/components/ui/toast";
import { useRider } from "@/lib/rider-store";
import { calculateFitScore, getFlexibilityLabel, getRidingStyleLabel, type FitScoreResult } from "@/lib/fit-engine";

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
  const [fitCalcOpen, setFitCalcOpen] = useState(false);
  const { toast } = useToast();
  const { profile: riderProfile, clearProfile } = useRider();

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

  // --- Derived: bikes with fit scores (when rider profile exists) ---
  const bikesWithScores = useMemo(() => {
    if (!riderProfile) return filteredBikes.map((b) => ({ ...b, fitScore: null as FitScoreResult | null }));
    const scored = filteredBikes.map((bike) => ({
      ...bike,
      fitScore: calculateFitScore(riderProfile, bike.reachStack),
    }));
    scored.sort((a, b) => (b.fitScore?.score ?? -1) - (a.fitScore?.score ?? -1));
    return scored;
  }, [filteredBikes, riderProfile]);

  // --- Derived: selected bikes (from original bikes, not scored) ---
  const selectedBikes = useMemo(() => {
    return bikes.filter((b) => selectedIds.has(b.id));
  }, [bikes, selectedIds]);

  // --- Derived: sizing match count (based on filtered, unscored bikes) ---
  const sizingMatchCount = useMemo(() => {
    if (!sizingResult) return 0;
    return filteredBikes.filter((b) => isBikeInSizeRange(b.reachStack, sizingResult)).length;
  }, [filteredBikes, sizingResult]);

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
          {/* Smart Match banner */}
          {riderProfile ? (
            <div className="mb-4 rounded-xl border border-lime-400/20 bg-lime-400/[0.03] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-lime-400/10 border border-lime-400/20">
                  <Sparkles className="size-4 text-lime-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-lime-400 flex items-center gap-1.5">
                    智能推荐流已激活
                    <span className="text-[10px] font-normal text-neutral-500 bg-neutral-800 rounded-full px-2 py-px">
                      Smart Match
                    </span>
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {getFlexibilityLabel(riderProfile.flexibility)} · {getRidingStyleLabel(riderProfile.ridingStyle)} · 身高 {riderProfile.height}cm — 按匹配度降序排列
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFitCalcOpen(true)}
                  className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-[11px] font-medium text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-all"
                >
                  <RefreshCw className="size-3" />
                  重新测量
                </button>
                <button
                  onClick={() => {
                    clearProfile();
                    toast({ title: "已退出智能推荐模式", variant: "default" });
                  }}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-neutral-500 hover:text-red-400 transition-all"
                >
                  <X className="size-3" />
                  清除
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Sizing Calculator (only when no rider profile) */}
              <SizingCalculator onCalculate={setSizingResult} />
              {/* FitCalculator trigger */}
              <div className="mb-4">
                <button
                  onClick={() => setFitCalcOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 hover:border-lime-400/40 hover:bg-lime-400/[0.02] px-5 py-3.5 w-full transition-all group"
                >
                  <div className="flex size-9 items-center justify-center rounded-xl bg-lime-400/10 border border-lime-400/20 group-hover:shadow-[0_0_14px_rgba(163,230,53,0.15)] transition-all">
                    <Sparkles className="size-4 text-lime-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-neutral-300 group-hover:text-lime-400 transition-colors">
                      智能身体数据测量
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      完成高阶测量，开启个性化几何匹配引擎 — 解锁智能推荐流
                    </p>
                  </div>
                  <div className="text-[11px] font-medium text-neutral-600 group-hover:text-lime-400 transition-colors">
                    开始 →
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500">
              共{" "}
              <span className="font-mono font-bold text-neutral-300 tabular-nums">
                {bikesWithScores.length}
              </span>{" "}
              款车型
              {sizingResult && !riderProfile && (
                <span className="ml-2 text-lime-400">
                  · {sizingMatchCount} 款尺码匹配
                </span>
              )}
              {riderProfile && (
                <span className="ml-2 text-lime-400">
                  · 智能排序
                </span>
              )}
            </p>
          </div>

          {/* Bike grid */}
          <BikeGrid
            bikes={bikesWithScores}
            selectedIds={selectedIds}
            onToggleCompare={toggleCompare}
            sizingResult={riderProfile ? null : sizingResult}
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

      {/* Fit calculator modal */}
      <FitCalculator
        open={fitCalcOpen}
        onClose={() => setFitCalcOpen(false)}
      />
    </div>
  );
}
