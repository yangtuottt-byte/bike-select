import { Bike, Zap, ChevronDown } from "lucide-react";

interface HeroSectionProps {
  bikeCount: number;
  brandCount: number;
}

export default function HeroSection({ bikeCount, brandCount }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-neutral-950">
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03] animate-grid-flow"
        style={{
          backgroundImage: `linear-gradient(oklch(0.79 0.26 134) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.79 0.26 134) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Radial gradient vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.21 0 0 / 0.6) 0%, oklch(0.145 0 0 / 0.95) 60%, #0a0a0a 100%)",
        }}
      />

      {/* Accent glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-[128px] bg-lime-500/5" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[96px] bg-red-500/5" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl">
        {/* Top badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-lime-500/20 bg-lime-500/5 px-4 py-1.5 text-xs font-medium text-lime-400 backdrop-blur-sm">
          <Zap className="size-3 fill-lime-400" />
          2026 赛季 · 全系在售车型
        </div>

        {/* Main title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-5">
          <span className="text-neutral-50">寻找你的下一台</span>
          <br />
          <span className="bg-gradient-to-r from-lime-300 via-lime-400 to-lime-500 bg-clip-text text-transparent">
            速度机器
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-base sm:text-lg text-neutral-400 leading-relaxed mb-10">
          从 World Tour 世巡赛战车到砾石探险座驾，多维度筛选 × 智能尺码匹配 ×
          配置横向 PK，精准锁定你的下一台速度机器。
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-8 mb-12">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-mono tabular-nums text-lime-400">
              {bikeCount}
            </span>
            <span className="text-xs text-neutral-500 mt-0.5">在售车型</span>
          </div>
          <div className="h-8 w-px bg-neutral-800" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-200">
              {brandCount}
            </span>
            <span className="text-xs text-neutral-500 mt-0.5">全球品牌</span>
          </div>
          <div className="h-8 w-px bg-neutral-800" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-200">
              4
            </span>
            <span className="text-xs text-neutral-500 mt-0.5">车型分类</span>
          </div>
        </div>

        {/* CTA */}
        <a
          href="#filter-section"
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3 text-sm font-bold text-neutral-950
            hover:bg-lime-300 transition-colors hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]"
        >
          <Bike className="size-4" />
          开始筛选
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] font-medium text-neutral-600 uppercase tracking-[0.2em]">
          Scroll
        </span>
        <ChevronDown className="size-3 text-neutral-600" />
      </div>
    </section>
  );
}
