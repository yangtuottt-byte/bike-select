"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PricePoint {
  month: string;
  price: number;
}

interface PriceHistorySummary {
  data: PricePoint[];
  current: number;
  lowest: number;
  highest: number;
  avg: number;
}

// ---------------------------------------------------------------------------
// Mock generator
// ---------------------------------------------------------------------------

const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月"];

function generateMockPriceHistory(currentPrice: number): PriceHistorySummary {
  // Build a plausible 6-month trend leading to the current price
  const seed = currentPrice * 0.18;

  // Phase 1: off-season dip (months 1-2)
  // Phase 2: spring rebound (month 3-4)
  // Phase 3: new-model discount (month 5-6 → current)
  const deltas = [
    -seed * (0.7 + Math.random() * 0.5),   // Jan: dip
    -seed * (0.2 + Math.random() * 0.4),   // Feb: slight dip
    seed * (0.3 + Math.random() * 0.6),    // Mar: rebound starts
    seed * (0.6 + Math.random() * 0.8),    // Apr: strong rebound
    seed * (0.1 + Math.random() * 0.5),    // May: plateau
    0,                                      // Jun: current price
  ];

  let running = currentPrice - deltas.reduce((a, b) => a + b, 0);
  const data: PricePoint[] = MONTHS.map((month, i) => {
    if (i > 0) running += deltas[i];
    return { month, price: Math.round(running) };
  });

  const prices = data.map((d) => d.price);

  return {
    data,
    current: currentPrice,
    lowest: Math.min(...prices),
    highest: Math.max(...prices),
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
  };
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/95 backdrop-blur-md px-3 py-2 shadow-xl shadow-black/50">
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold font-mono tabular-nums text-lime-400">
        ¥{payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PriceTrackerProps {
  currentPrice: number;
}

export default function PriceTracker({ currentPrice }: PriceTrackerProps) {
  const { data, lowest, highest, avg } = generateMockPriceHistory(currentPrice);

  const trend =
    currentPrice > avg + 200 ? "up" : currentPrice < avg - 200 ? "down" : "flat";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendLabel =
    trend === "up" ? "高于均价" : trend === "down" ? "低于均价" : "持平均价";
  const trendColor =
    trend === "up" ? "text-red-400" : trend === "down" ? "text-lime-400" : "text-neutral-400";

  return (
    <Card className="border-neutral-800 bg-neutral-900/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-lime-400/10">
              <TrendIcon className="size-3 text-lime-400" />
            </div>
            <CardTitle className="text-sm">市场行情 · Market Trends</CardTitle>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              trend === "up"
                ? "border-red-400/20 bg-red-400/5 text-red-400"
                : trend === "down"
                  ? "border-lime-400/20 bg-lime-400/5 text-lime-400"
                  : "border-neutral-600 bg-neutral-800 text-neutral-400"
            }`}
          >
            <TrendIcon className="size-2.5" />
            {trendLabel}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-lg bg-neutral-800/50 border border-neutral-700/30 p-2.5 text-center">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">最低</p>
            <p className="text-sm font-bold font-mono tabular-nums text-lime-400">
              ¥{lowest.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-neutral-800/50 border border-neutral-700/30 p-2.5 text-center">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">均价</p>
            <p className="text-sm font-bold font-mono tabular-nums text-neutral-200">
              ¥{avg.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-neutral-800/50 border border-neutral-700/30 p-2.5 text-center">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">最高</p>
            <p className="text-sm font-bold font-mono tabular-nums text-red-400">
              ¥{highest.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#84cc16" stopOpacity={0.35} />
                  <stop offset="50%" stopColor="#84cc16" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="priceStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a3e635" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#84cc16" stopOpacity={1} />
                  <stop offset="100%" stopColor="#65a30d" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(1 0 0 / 0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }}
                axisLine={{ stroke: "oklch(1 0 0 / 0.08)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `¥${(v / 1000).toFixed(1)}k`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#84cc16"
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#84cc16",
                  stroke: "#0a0a0a",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Watermark */}
        <p className="text-center text-[9px] text-neutral-600 mt-3 font-mono tracking-widest">
          SIMULATED DATA · 基于市场趋势模型估算
        </p>
      </CardContent>
    </Card>
  );
}
