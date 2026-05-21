"use client";

import { useState } from "react";
import { Ruler, ArrowRight, Target, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  calculateBikeFit,
  type SizingResult,
} from "@/lib/bike-utils";

interface SizingCalculatorProps {
  onCalculate: (result: SizingResult | null) => void;
}

export default function SizingCalculator({ onCalculate }: SizingCalculatorProps) {
  const [height, setHeight] = useState("");
  const [inseam, setInseam] = useState("");
  const [result, setResult] = useState<SizingResult | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    const h = parseFloat(height);
    const i = parseFloat(inseam);

    if (!h || h < 140 || h > 210) {
      setError("请输入有效身高 (140–210 cm)");
      return;
    }
    if (!i || i < 60 || i > 100) {
      setError("请输入有效跨高 (60–100 cm)");
      return;
    }
    if (i >= h) {
      setError("跨高应小于身高");
      return;
    }

    const res = calculateBikeFit(h, i);
    setResult(res);
    onCalculate(res);
    setExpanded(true);
  };

  const handleReset = () => {
    setHeight("");
    setInseam("");
    setResult(null);
    setError("");
    setExpanded(false);
    onCalculate(null);
  };

  return (
    <Card className="mb-6 border-neutral-800 bg-neutral-900/60">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => result && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-lime-400/10 border border-lime-400/20">
              <Ruler className="size-3.5 text-lime-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">智能尺码计算器</CardTitle>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                输入身体数据，匹配最佳车架几何
              </p>
            </div>
          </div>
          {result && (
            <button className="text-neutral-500 hover:text-neutral-300">
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Inputs */}
        <div className="flex items-end gap-3 mb-3">
          <div className="flex-1">
            <Label className="text-[11px] text-neutral-500 mb-1.5 block">
              身高 (cm)
            </Label>
            <Input
              type="number"
              placeholder="170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="h-9 text-sm font-mono"
              min={140}
              max={210}
              step={0.5}
            />
          </div>
          <div className="flex-1">
            <Label className="text-[11px] text-neutral-500 mb-1.5 block">
              跨高 / 内缝 (cm)
            </Label>
            <Input
              type="number"
              placeholder="78"
              value={inseam}
              onChange={(e) => setInseam(e.target.value)}
              className="h-9 text-sm font-mono"
              min={60}
              max={100}
              step={0.5}
            />
          </div>
          <Button
            onClick={handleCalculate}
            className="h-9 px-4 bg-lime-400 hover:bg-lime-300 text-neutral-950 font-bold text-sm shrink-0"
          >
            计算
          </Button>
        </div>

        {error && (
          <p className="text-[11px] text-red-400 mb-2">{error}</p>
        )}

        {/* Results */}
        {result && expanded && (
          <div className="animate-fade-in mt-3">
            <Separator className="mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Target className="size-3 text-lime-400" />
                  <span className="text-[11px] font-semibold text-neutral-300">
                    推荐 Reach 区间
                  </span>
                </div>
                <div className="font-mono text-lg font-bold tabular-nums text-lime-400">
                  {result.reachMin} – {result.reachMax}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">单位 mm</div>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Target className="size-3 text-lime-400" />
                  <span className="text-[11px] font-semibold text-neutral-300">
                    推荐 Stack 区间
                  </span>
                </div>
                <div className="font-mono text-lg font-bold tabular-nums text-lime-400">
                  {result.stackMin} – {result.stackMax}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">单位 mm</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-400">
              <ArrowRight className="size-3 text-lime-400" />
              列表中带有
              <span className="inline-flex items-center rounded border border-lime-400/20 bg-lime-400/10 px-1.5 py-px text-[10px] font-medium text-lime-400">
                尺码匹配
              </span>
              标记的车型，表示其几何落入你的推荐区间
            </div>
            <button
              onClick={handleReset}
              className="mt-2 text-[11px] text-neutral-500 hover:text-neutral-400 transition-colors"
            >
              重置计算
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
