"use client";

import { Fragment } from "react";
import { Zap, Trophy, Weight, Banknote, Cpu, Gauge, Hash, Cog } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import BikeImage from "@/components/bike/bike-image";
import {
  parseTags,
  parseReachStack,
  getTagColorClass,
  getMaterialLabel,
  getBrakeLabel,
  getGroupsetTier,
  getGroupsetTierLabel,
  calculateValueScore,
  parseSpecs,
  SPECS_LABELS,
  type BikeSpecs,
} from "@/lib/bike-utils";

interface ComparisonBike {
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
  specs: string | null;
  brand: { name: string; country: string | null };
}

interface ComparisonModalProps {
  bikes: ComparisonBike[];
  open: boolean;
  onClose: () => void;
}

export default function ComparisonModal({ bikes, open, onClose }: ComparisonModalProps) {
  if (bikes.length < 2) return null;

  // Compute derived data
  const rows = [
    {
      label: "品牌",
      icon: Hash,
      key: "brand" as const,
      render: (b: ComparisonBike) => b.brand.name,
      highlight: null as null | ((values: unknown[]) => number),
    },
    {
      label: "型号",
      icon: Hash,
      key: "model" as const,
      render: (b: ComparisonBike) => b.model,
      highlight: null,
    },
    {
      label: "套件等级",
      icon: Trophy,
      key: "groupsetTier" as const,
      render: (b: ComparisonBike) => {
        const tier = getGroupsetTier(b.groupset);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{getGroupsetTierLabel(tier)}</span>
            <span className="text-[10px] text-neutral-500">{b.groupset}</span>
          </div>
        );
      },
      highlight: rankGroupsetTier,
    },
    {
      label: "价格",
      icon: Banknote,
      key: "price" as const,
      render: (b: ComparisonBike) => (
        <span className="font-mono text-sm font-bold tabular-nums">
          ¥{b.price.toLocaleString()}
        </span>
      ),
      highlight: (prices: number[]) => prices.indexOf(Math.min(...prices)),
    },
    {
      label: "重量",
      icon: Weight,
      key: "weight" as const,
      render: (b: ComparisonBike) => (
        <span className="font-mono text-sm font-bold tabular-nums">
          {b.weight ? `${b.weight} kg` : "-"}
        </span>
      ),
      highlight: (weights: (number | null)[]) => {
        const valid = weights.map((w, i) => ({ w: w ?? Infinity, i }));
        valid.sort((a, b) => a.w - b.w);
        return valid[0].w !== Infinity ? valid[0].i : -1;
      },
    },
    {
      label: "性价比",
      icon: Zap,
      key: "valueScore" as const,
      render: (b: ComparisonBike) => {
        const score = calculateValueScore(b.price, b.weight, b.groupset);
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono text-sm font-bold tabular-nums ${
                score >= 70 ? "text-lime-400" : score >= 40 ? "text-amber-400" : "text-neutral-400"
              }`}
            >
              {score}
            </span>
            <span className="text-[10px] text-neutral-500">/100</span>
          </div>
        );
      },
      highlight: (scores: number[]) => scores.indexOf(Math.max(...scores)),
    },
    {
      label: "车架材质",
      icon: Cpu,
      key: "frameMaterial" as const,
      render: (b: ComparisonBike) => (
        <span className="text-sm font-medium">{getMaterialLabel(b.frameMaterial)}</span>
      ),
      highlight: null,
    },
    {
      label: "刹车系统",
      icon: Gauge,
      key: "brakeSystem" as const,
      render: (b: ComparisonBike) => (
        <span className="text-sm font-medium">{getBrakeLabel(b.brakeSystem)}</span>
      ),
      highlight: null,
    },
    {
      label: "参考几何",
      icon: Gauge,
      key: "geo" as const,
      render: (b: ComparisonBike) => {
        const geo = parseReachStack(b.reachStack);
        if (!geo) return <span className="text-neutral-500">-</span>;
        const mid = geo.sizes[Math.floor((geo.sizes.length - 1) / 2)] ?? geo.sizes[0];
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-neutral-500">尺码 {mid.size}</span>
            <span className="font-mono text-sm font-bold tabular-nums">
              R{mid.reach} / S{mid.stack}
            </span>
          </div>
        );
      },
      highlight: null,
    },
    {
      label: "场景标签",
      icon: Hash,
      key: "tags" as const,
      render: (b: ComparisonBike) => {
        const tags = parseTags(b.scenarioTags);
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <span
                key={t}
                className={`inline-flex items-center rounded border px-1.5 py-px text-[10px] font-medium ${getTagColorClass(t)}`}
              >
                {t}
              </span>
            ))}
          </div>
        );
      },
      highlight: null,
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} className="max-w-6xl">
      <DialogHeader>
        <DialogTitle>配置横向 PK</DialogTitle>
        <p className="text-sm text-neutral-500">
          {bikes.length} 款车型全面对比 · 最佳数据以
          <span className="text-lime-400 font-semibold mx-0.5">亮色</span>
          高亮标出
        </p>
      </DialogHeader>

      <div className="px-6 pb-6">
        {/* Header row — bike names */}
        <div className="grid gap-3" style={{ gridTemplateColumns: `140px repeat(${bikes.length}, 1fr)` }}>
          {/* Corner spacer */}
          <div />
          {bikes.map((bike) => (
            <div key={bike.id} className="text-center">
              {/* Bike image */}
              <div className="relative mb-3 rounded-lg overflow-hidden border border-neutral-700">
                <BikeImage
                  src={bike.image}
                  alt={`${bike.brand.name} ${bike.model}`}
                  brandName={bike.brand.name}
                  sizes="thumb"
                />
              </div>
              <div className="text-xs font-medium text-neutral-500 mb-1">{bike.brand.name}</div>
              <div className="text-sm font-bold text-neutral-100 leading-tight">{bike.model}</div>
              <div className="mt-2 font-mono text-base font-bold text-lime-400 tabular-nums">
                ¥{bike.price.toLocaleString()}
              </div>
            </div>
          ))}

          <Separator className="col-span-full my-2" />

          {/* Data rows */}
          {rows.map((row) => {
            const rawValues = bikes.map((b) => {
              if (row.key === "brand") return b.brand.name;
              if (row.key === "model") return b.model;
              if (row.key === "price") return b.price;
              if (row.key === "weight") return b.weight;
              if (row.key === "valueScore") return calculateValueScore(b.price, b.weight, b.groupset);
              if (row.key === "groupsetTier") return getGroupsetTier(b.groupset);
              return "";
            });

            const bestIdx =
              row.highlight && bikes.length >= 2
                ? (row.highlight as (v: unknown[]) => number)(rawValues)
                : -1;

            return (
              <Fragment key={row.key}>
                {/* Row label */}
                <div className="flex items-center gap-1.5 py-3">
                  <row.icon className="size-3.5 text-neutral-600" />
                  <span className="text-[12px] font-semibold text-neutral-400">{row.label}</span>
                </div>

                {/* Row values per bike */}
                {bikes.map((bike, i) => (
                  <div
                    key={bike.id}
                    className={`flex items-center justify-center py-3 px-2 rounded-lg ${
                      i === bestIdx
                        ? "bg-lime-400/5 border border-lime-400/15"
                        : ""
                    }`}
                  >
                    {row.render(bike)}
                  </div>
                ))}
              </Fragment>
            );
          })}

          {/* ─── 硬核配置明细 (specs JSON) ─── */}
          {bikes.some((b) => parseSpecs(b.specs)) && (
            <>
              <Separator className="col-span-full my-3" />
              <div className="flex items-center gap-2 py-2">
                <Cog className="size-3.5 text-lime-400" />
                <span className="text-[12px] font-bold text-lime-400 uppercase tracking-[0.08em]">
                  硬核配置明细
                </span>
              </div>
              <div />

              {(Object.keys(SPECS_LABELS) as (keyof BikeSpecs)[]).map((key) => {
                const hasValue = bikes.some((b) => {
                  const s = parseSpecs(b.specs);
                  return s?.[key];
                });
                if (!hasValue) return null;

                return (
                  <Fragment key={`spec-${key}`}>
                    <div className="flex items-center gap-1.5 py-2.5">
                      <span className="text-[11px] font-semibold text-neutral-500">
                        {SPECS_LABELS[key]}
                      </span>
                    </div>
                    {bikes.map((bike) => {
                      const s = parseSpecs(bike.specs);
                      return (
                        <div
                          key={bike.id}
                          className="flex items-center justify-center py-2.5 px-2 text-[11px] text-neutral-300 leading-relaxed text-center"
                        >
                          {s?.[key] || <span className="text-neutral-600">-</span>}
                        </div>
                      );
                    })}
                  </Fragment>
                );
              })}
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}

// --- Highlight helpers ---

function rankGroupsetTier(tiers: unknown[]): number {
  const rank: Record<string, number> = { high: 3, mid: 2, entry: 1, unknown: 0 };
  let best = -1;
  let bestIdx = -1;
  tiers.forEach((t, i) => {
    const r = rank[String(t)] ?? 0;
    if (r > best) { best = r; bestIdx = i; }
  });
  return best > 1 ? bestIdx : -1;
}
