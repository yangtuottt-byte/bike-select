"use client";

import Link from "next/link";
import { Scale, Banknote, Cpu, Gauge, ImageIcon, Warehouse, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useGarage, type GarageBike } from "@/lib/garage-store";
import { useToast } from "@/components/ui/toast";
import {
  parseTags,
  parseReachStack,
  getTagColorClass,
  getMaterialLabel,
  getBrakeLabel,
  getMatchingSizes,
  type SizingResult,
} from "@/lib/bike-utils";

interface BikeCardProps {
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
    brand: { name: string; country: string | null };
  };
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
  sizingResult: SizingResult | null;
  disabledCompare: boolean;
}

export default function BikeCard({
  bike,
  isCompared,
  onToggleCompare,
  sizingResult,
  disabledCompare,
}: BikeCardProps) {
  const tags = parseTags(bike.scenarioTags);
  const geo = parseReachStack(bike.reachStack);
  const { isInGarage, toggleBike } = useGarage();
  const { toast } = useToast();
  const inGarage = isInGarage(bike.id);

  const sizingMatch =
    sizingResult &&
    geo?.sizes.some(
      (s) =>
        s.reach >= sizingResult.reachMin &&
        s.reach <= sizingResult.reachMax &&
        s.stack >= sizingResult.stackMin &&
        s.stack <= sizingResult.stackMax
    );
  const matchingSizes = sizingResult ? getMatchingSizes(bike.reachStack, sizingResult) : [];

  const refSize = geo?.sizes[Math.floor((geo.sizes.length - 1) / 2)] ?? geo?.sizes[0];

  const garageBike: GarageBike = {
    id: bike.id,
    model: bike.model,
    brand: { name: bike.brand.name },
    price: bike.price,
    image: bike.image,
  };

  const handleGarageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBike(garageBike);
    toast({
      title: inGarage ? `${bike.model} 已移出车库` : `${bike.model} 已停入车库`,
      variant: inGarage ? "default" : "success",
    });
  };

  return (
    <Card
      className={`group relative flex flex-col transition-all duration-300 hover:border-neutral-700 overflow-hidden ${
        sizingMatch
          ? "border-lime-500/30 shadow-[0_0_20px_rgba(163,230,53,0.06)] ring-1 ring-lime-500/15"
          : ""
      } ${isCompared ? "border-lime-400/60 shadow-[0_0_16px_rgba(163,230,53,0.12)]" : ""}`}
    >
      {/* Top-left badge */}
      {sizingMatch && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="lime" className="text-[10px] gap-1">
            <Gauge className="size-2.5" />
            尺码匹配 {matchingSizes.join("/")}
          </Badge>
        </div>
      )}

      {/* Top-right actions */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        {/* Garage button */}
        <button
          onClick={handleGarageClick}
          title={inGarage ? "移出车库" : "加入车库"}
          className={`flex size-6 items-center justify-center rounded-md border transition-all ${
            inGarage
              ? "border-lime-400/40 bg-lime-400/10 text-lime-400"
              : "border-neutral-600 bg-neutral-900/80 text-neutral-500 hover:border-lime-400/40 hover:text-lime-400"
          }`}
        >
          {inGarage ? <Check className="size-3" /> : <Warehouse className="size-3" />}
        </button>

        {/* Compare checkbox */}
        <Checkbox
          checked={isCompared}
          onCheckedChange={() => onToggleCompare(bike.id)}
          disabled={!isCompared && disabledCompare}
        />
      </div>

      {/* Image — clickable link to detail */}
      <Link href={`/bike/${bike.id}`} className="relative h-44 bg-neutral-900 flex items-center justify-center overflow-hidden cursor-pointer">
        {bike.image ? (
          <>
            <img
              src={bike.image}
              alt={`${bike.brand.name} ${bike.model}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/80 via-neutral-850 to-neutral-900" />
            <ImageIcon className="size-12 text-neutral-600" />
          </>
        )}
        <span className="absolute bottom-2 right-3 text-[10px] font-mono font-bold text-neutral-100/40 uppercase tracking-[0.15em] z-10">
          {bike.brand.name}
        </span>
      </Link>

      {/* Content */}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.08em]">
            {bike.brand.name}
          </span>
          {bike.brand.country && (
            <span className="text-[10px] text-neutral-600">· {bike.brand.country}</span>
          )}
        </div>
        <Link href={`/bike/${bike.id}`}>
          <CardTitle className="text-base font-bold tracking-tight group-hover:text-lime-400 transition-colors cursor-pointer hover:text-lime-400">
            {bike.model}
          </CardTitle>
        </Link>
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className={`inline-flex items-center rounded border px-1.5 py-px text-[10px] font-medium ${getTagColorClass(t)}`}
            >
              {t}
            </span>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono tabular-nums text-lime-400">
            ¥{bike.price.toLocaleString()}
          </span>
          <span className="text-[11px] text-neutral-500">RMB</span>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <SpecItem icon={Cpu} label="套件" value={bike.groupset ?? "-"} />
          <SpecItem icon={Scale} label="重量" value={bike.weight ? `${bike.weight} kg` : "-"} />
          <SpecItem
            icon={Banknote}
            label="材质"
            value={getMaterialLabel(bike.frameMaterial)}
          />
          <SpecItem icon={Gauge} label="刹车" value={getBrakeLabel(bike.brakeSystem)} />
        </div>

        {refSize && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-[10px] text-neutral-500">
              <span className="font-mono uppercase tracking-[0.08em]">
                参考几何 ({refSize.size})
              </span>
              <span className="font-mono tabular-nums">
                R{refSize.reach} / S{refSize.stack}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-1.5 min-w-0">
      <Icon className="size-3 text-neutral-600 shrink-0 mt-px" />
      <div className="min-w-0">
        <div className="text-[10px] text-neutral-500 leading-tight">{label}</div>
        <div className="text-[11px] font-medium text-neutral-300 leading-tight truncate">
          {value}
        </div>
      </div>
    </div>
  );
}
