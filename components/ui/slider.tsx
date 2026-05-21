"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface DualSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  formatLabel?: (v: number) => string;
  className?: string;
}

function DualSlider({
  min,
  max,
  step = 100,
  value,
  onValueChange,
  formatLabel,
  className,
}: DualSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const leftPercent = ((value[0] - min) / (max - min)) * 100;
  const rightPercent = ((value[1] - min) / (max - min)) * 100;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      onValueChange([Math.min(v, value[1] - step), value[1]]);
    },
    [value, step, onValueChange]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      onValueChange([value[0], Math.max(v, value[0] + step)]);
    },
    [value, step, onValueChange]
  );

  const fmt = formatLabel ?? ((v: number) => v.toLocaleString());

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-6 flex items-center" ref={trackRef}>
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-neutral-700" />
        {/* Active track */}
        <div
          className="absolute h-1.5 rounded-full bg-lime-400"
          style={{ left: `${leftPercent}%`, right: `${100 - rightPercent}%` }}
        />
        {/* Min thumb / input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleMinChange}
          className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-lime-400 [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-black/40
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-lime-400 [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
        />
        {/* Max thumb / input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={handleMaxChange}
          className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-lime-400 [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-black/40
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-lime-400 [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
        />
      </div>
      <div className="flex justify-between mt-1 text-[11px] font-mono text-neutral-500">
        <span>{fmt(value[0])}</span>
        <span>{fmt(value[1])}</span>
      </div>
    </div>
  );
}

export { DualSlider };
