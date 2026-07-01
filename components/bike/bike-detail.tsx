"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Cpu,
  Gauge,
  Scale,
  Ruler,
  Warehouse,
  Check,
  Zap,
  Cog,
  CircleDot,
  ChevronRight,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  ScanEye,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGarage, type GarageBike } from "@/lib/garage-store";
import { useToast } from "@/components/ui/toast";
import BikeImage from "@/components/bike/bike-image";
import PriceTracker from "@/components/bike/PriceTracker";
import {
  parseTags,
  parseReachStack,
  parseSpecs,
  SPECS_LABELS,
  getTagColorClass,
  getMaterialLabel,
  getBrakeLabel,
  getGroupsetTierLabel,
  getGroupsetTier,
  type BikeSpecs,
} from "@/lib/bike-utils";
import { useRider } from "@/lib/rider-store";
import { calculateFitScore, getTargetGeometry } from "@/lib/fit-engine";

// ─── Props ────────────────────────────────────────────────────

interface BikeDetailProps {
  bike: {
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
    brand: { name: string; country: string | null; description: string | null };
  };
}

// ─── Component ────────────────────────────────────────────────

export default function BikeDetail({ bike }: BikeDetailProps) {
  const router = useRouter();
  const { isInGarage, toggleBike } = useGarage();
  const { toast } = useToast();
  const { profile: riderProfile } = useRider();

  const tags = parseTags(bike.scenarioTags);
  const geo = parseReachStack(bike.reachStack);
  const specs = parseSpecs(bike.specs);
  const tier = getGroupsetTier(bike.groupset);
  const inGarage = isInGarage(bike.id);

  // Compute fit score and target geometry when rider profile exists
  const fitScore = riderProfile ? calculateFitScore(riderProfile, bike.reachStack) : null;
  const targetGeo = riderProfile ? getTargetGeometry(riderProfile) : null;

  const garageBike: GarageBike = {
    id: bike.id,
    model: bike.model,
    brand: { name: bike.brand.name },
    price: bike.price,
    image: bike.image,
  };

  const handleGarageToggle = () => {
    toggleBike(garageBike);
    toast({
      title: inGarage
        ? `${bike.model} 已移出车库`
        : `${bike.model} 已停入您的车库`,
      description: inGarage ? "随时可以重新加入" : "前往车库查看所有收藏车型",
      variant: inGarage ? "default" : "success",
    });
  };

  // Drive-train rows: shifters, derailleurs, crankset, cassette
  const drivetrainKeys: (keyof BikeSpecs)[] = [
    "shifters",
    "derailleurFront",
    "derailleurRear",
    "crankset",
    "cassette",
  ];
  const chassisKeys: (keyof BikeSpecs)[] = ["frame", "wheelset", "tires"];

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
        <BikeImage
          src={bike.image}
          alt={`${bike.brand.name} ${bike.model}`}
          brandName={bike.brand.name}
          sizes="hero"
          priority
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/60 via-transparent to-neutral-950/60" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-20 left-6 z-10 flex items-center gap-1.5 rounded-lg border border-neutral-700
            bg-neutral-900/70 backdrop-blur px-3 py-1.5 text-xs font-medium text-neutral-300
            hover:bg-neutral-800 hover:text-neutral-100 transition-all"
        >
          <ArrowLeft className="size-3.5" />
          返回
        </button>

        {/* Hero text */}
        <div className="absolute bottom-0 inset-x-0 p-6 lg:p-10 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-[0.1em]">
              {bike.brand.name}
            </span>
            <span className="text-[11px] text-neutral-600">
              {tier !== "unknown" ? getGroupsetTierLabel(tier) : ""}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 leading-[1.1]">
            {bike.model}
          </h1>
          <p className="text-lg sm:text-xl font-light italic text-neutral-300/80 max-w-2xl">
            {bike.description ?? `${bike.brand.name} ${bike.model} — 精准工程与极致性能的完美融合`}
          </p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-bold font-mono tabular-nums text-lime-400">
              ¥{bike.price.toLocaleString()}
            </span>
            <span className="text-sm text-neutral-500">RMB</span>
          </div>
        </div>
      </section>

      {/* ─── Body ─────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 pb-32">
        <div className="grid lg:grid-cols-3 gap-6 -mt-6 relative z-10">
          {/* ── LEFT: Specs cards (2 columns on lg) ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick stats bar */}
            <Card className="border-neutral-800 bg-neutral-900/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Stat icon={Scale} label="重量" value={bike.weight ? `${bike.weight} kg` : "-"} />
                  <Stat icon={Cpu} label="套件" value={bike.groupset ?? "-"} />
                  <Stat icon={Gauge} label="材质" value={getMaterialLabel(bike.frameMaterial)} />
                  <Stat icon={CircleDot} label="刹车" value={getBrakeLabel(bike.brakeSystem)} />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold ${getTagColorClass(t)}`}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* ── Drivetrain specs ── */}
            {specs && (
              <Card className="border-neutral-800 bg-neutral-900/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Cog className="size-4 text-lime-400" />
                    <CardTitle className="text-base">传动系统 · 核心战斗参数</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {drivetrainKeys.map((key) => {
                      const value = specs[key];
                      if (!value) return null;
                      return (
                        <div
                          key={key}
                          className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-900/80 p-3"
                        >
                          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            {SPECS_LABELS[key]}
                          </span>
                          <span className="text-[13px] font-medium text-neutral-200 leading-snug">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Chassis specs (frame, wheels, tires) ── */}
            {specs && (
              <Card className="border-neutral-800 bg-neutral-900/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-lime-400" />
                    <CardTitle className="text-base">车架与轮组 · 底盘配置</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {chassisKeys.map((key) => {
                      const value = specs[key];
                      if (!value) return null;
                      return (
                        <div
                          key={key}
                          className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-900/80 p-3"
                        >
                          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            {SPECS_LABELS[key]}
                          </span>
                          <span className="text-[13px] font-medium text-neutral-200 leading-snug">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Market Trends ── */}
            <PriceTracker currentPrice={bike.price} />
          </div>

          {/* ── RIGHT: Geometry table ── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Ideal vs Bike geometry comparison */}
            {fitScore && targetGeo && (
              <Card className="border-lime-400/20 bg-lime-400/[0.02]">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-lime-400" />
                    <CardTitle className="text-sm">理想几何对比</CardTitle>
                    <span className="ml-auto text-[11px] font-bold font-mono text-lime-400 tabular-nums">
                      {fitScore.score}% 匹配
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-neutral-800 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-neutral-800 bg-neutral-900">
                          <th className="py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500" />
                          <th className="py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            理想值
                          </th>
                          <th className="py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            {fitScore.bestSize} 码
                          </th>
                          <th className="py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            偏差
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: "Reach", ideal: targetGeo.reach, bike: fitScore.bikeReach, unit: "mm" },
                          { label: "Stack", ideal: targetGeo.stack, bike: fitScore.bikeStack, unit: "mm" },
                          { label: "STR", ideal: targetGeo.str, bike: parseFloat((fitScore.bikeStack / fitScore.bikeReach).toFixed(2)), unit: "" },
                        ].map((row) => {
                          const delta = typeof row.ideal === "number" && typeof row.bike === "number"
                            ? Math.round((row.bike - row.ideal) * 10) / 10
                            : 0;
                          const absDelta = Math.abs(delta);
                          const isGood = row.label === "STR" ? absDelta <= 0.05 : absDelta <= 5;
                          const Icon = delta > 0.01 ? TrendingUp : delta < -0.01 ? TrendingDown : Minus;
                          return (
                            <tr key={row.label} className="border-b border-neutral-800/50 last:border-0">
                              <td className="py-2 px-3 text-[11px] font-semibold text-neutral-400">
                                {row.label}
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] font-semibold tabular-nums text-neutral-300">
                                {row.ideal}{row.unit}
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] font-semibold tabular-nums text-neutral-200">
                                {row.bike}{row.unit}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`inline-flex items-center gap-0.5 font-mono text-[11px] tabular-nums ${
                                  isGood ? "text-lime-400" : "text-amber-400"
                                }`}>
                                  <Icon className="size-2.5" />
                                  {delta > 0 ? "+" : ""}{delta}{row.unit}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-neutral-500">
                    <div className="h-1.5 flex-1 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-lime-400 transition-all"
                        style={{ width: `${fitScore.score}%` }}
                      />
                    </div>
                    <span className="font-mono tabular-nums text-neutral-400">{fitScore.score}%</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-neutral-800 bg-neutral-900/60 sticky top-20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Ruler className="size-4 text-lime-400" />
                  <CardTitle className="text-base">车架几何表</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {geo && geo.sizes.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-neutral-800">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-neutral-800 bg-neutral-900">
                          <th className="py-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            尺码
                          </th>
                          <th className="py-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            Reach
                          </th>
                          <th className="py-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            Stack
                          </th>
                          <th className="py-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            STR
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {geo.sizes.map((s, i) => {
                          const str = s.stack / Math.max(1, s.reach);
                          return (
                            <tr
                              key={s.size}
                              className={`border-b border-neutral-800/50 last:border-0 transition-colors hover:bg-neutral-800/40 ${
                                i === Math.floor((geo.sizes.length - 1) / 2)
                                  ? "bg-lime-400/[0.03]"
                                  : ""
                              }`}
                            >
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-flex items-center justify-center size-7 rounded-md text-[11px] font-bold ${
                                    i === Math.floor((geo.sizes.length - 1) / 2)
                                      ? "bg-lime-400/15 text-lime-400 border border-lime-400/30"
                                      : "bg-neutral-800 text-neutral-300"
                                  }`}
                                >
                                  {s.size}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[12px] font-semibold tabular-nums text-neutral-200">
                                {s.reach}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[12px] font-semibold tabular-nums text-neutral-200">
                                {s.stack}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] tabular-nums text-neutral-500">
                                {str.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 text-center py-8">暂无几何数据</p>
                )}
                <p className="text-[10px] text-neutral-600 mt-2 px-1">
                  STR = Stack / Reach，数值越大骑行姿态越直立舒适
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ─── Floating CTA ──────────────────────────────────── */}
      <div className="fixed bottom-6 inset-x-0 z-30 flex justify-center gap-3 pointer-events-none">
        {/* Second-hand radar */}
        <a
          href={`https://s.taobao.com/search?q=${encodeURIComponent(`${bike.brand.name} ${bike.model} 公路车`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold
            shadow-2xl shadow-black/60 border backdrop-blur-xl transition-all duration-300
            active:scale-95 hover:scale-[1.02]
            bg-amber-500/90 border-amber-400/40 text-neutral-950
            hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]
            group"
        >
          <span className="relative flex size-5 items-center justify-center">
            <ScanEye className="size-4 relative z-10 group-hover:animate-pulse" />
            <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping [animation-duration:2s]" />
          </span>
          二手雷达 · 去闲鱼捡漏
          <ExternalLink className="size-3.5 opacity-60" />
        </a>

        {/* Garage toggle */}
        <button
          onClick={handleGarageToggle}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-bold
            shadow-2xl shadow-black/60 border backdrop-blur-xl transition-all duration-300
            active:scale-95 hover:scale-[1.02]
            ${
              inGarage
                ? "bg-neutral-800/90 border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:border-neutral-500"
                : "bg-lime-400 border-lime-400/50 text-neutral-950 hover:bg-lime-300 hover:shadow-[0_0_40px_rgba(163,230,53,0.25)]"
            }`}
        >
          {inGarage ? (
            <>
              <Check className="size-4" />
              已在车库 · 点击移出
            </>
          ) : (
            <>
              <Warehouse className="size-4" />
              停入车库
              <ChevronRight className="size-4 opacity-60" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700">
        <Icon className="size-3.5 text-neutral-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.05em] leading-tight">
          {label}
        </p>
        <p className="text-[12px] font-semibold text-neutral-200 leading-tight truncate">{value}</p>
      </div>
    </div>
  );
}
