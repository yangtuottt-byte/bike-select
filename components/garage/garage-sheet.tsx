"use client";

import { Warehouse, Trash2, Bike, ShoppingCart } from "lucide-react";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useGarage } from "@/lib/garage-store";
import GarageCard from "@/components/garage/garage-card";

interface GarageSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function GarageSheet({ open, onClose }: GarageSheetProps) {
  const { bikes, removeBike, clearAll, totalBudget } = useGarage();

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-lime-400/10 border border-lime-400/20">
              <Warehouse className="size-3.5 text-lime-400" />
            </div>
            <SheetTitle>我的车库</SheetTitle>
          </div>
          {bikes.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="size-3" />
              清空
            </button>
          )}
        </div>
        <SheetDescription>
          {bikes.length > 0
            ? `已收藏 ${bikes.length} 款车型`
            : "还没有收藏任何车型，去首页挑选吧"}
        </SheetDescription>
      </SheetHeader>

      <SheetContent>
        {bikes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 mb-4">
              <Bike className="size-7 text-neutral-600" />
            </div>
            <p className="text-sm font-semibold text-neutral-400 mb-1">车库空空如也</p>
            <p className="text-[12px] text-neutral-600 max-w-[200px]">
              在车型卡片或详情页点击车库按钮，将心仪车型停入这里
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bikes.map((bike) => (
              <GarageCard key={bike.id} bike={bike} onRemove={removeBike} />
            ))}
          </div>
        )}
      </SheetContent>

      {/* Footer with total */}
      {bikes.length > 0 && (
        <div className="shrink-0 px-6 pb-6 pt-2">
          <Separator className="mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-neutral-400">
              <ShoppingCart className="size-3.5" />
              <span>总预算</span>
            </div>
            <span className="text-lg font-bold font-mono tabular-nums text-lime-400">
              ¥{totalBudget.toLocaleString()}
            </span>
          </div>
          {bikes.length >= 3 && (
            <p className="text-[10px] text-amber-400/80 mt-1.5 text-right">
              预算警告：已收藏 {bikes.length} 辆，总额接近 ¥{(totalBudget / 10000).toFixed(1)}w
            </p>
          )}
        </div>
      )}
    </Sheet>
  );
}
