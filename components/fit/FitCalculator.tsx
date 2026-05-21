"use client";

import { useState } from "react";
import {
  Ruler,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Zap,
  Compass,
  Heart,
  ThumbsUp,
  Meh,
  X,
  User,
  Target,
  Activity,
} from "lucide-react";
import { useRider, type Flexibility, type RidingStyle } from "@/lib/rider-store";
import { getRidingStyleLabel, getFlexibilityLabel } from "@/lib/fit-engine";
import { useToast } from "@/components/ui/toast";

interface FitCalculatorProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = ["身体数据", "骑行画像", "确认生成"];

export default function FitCalculator({ open, onClose }: FitCalculatorProps) {
  const [step, setStep] = useState(0);
  const { setProfile } = useRider();
  const { toast } = useToast();

  // Form state
  const [height, setHeight] = useState(172);
  const [inseam, setInseam] = useState(78);
  const [armSpan, setArmSpan] = useState(172);
  const [flexibility, setFlexibility] = useState<Flexibility>("normal");
  const [ridingStyle, setRidingStyle] = useState<RidingStyle>("all-around");

  const [errors, setErrors] = useState<string[]>([]);

  if (!open) return null;

  const validateStep = (s: number): boolean => {
    const errs: string[] = [];
    if (s === 0) {
      if (height < 140 || height > 210) errs.push("身高需在 140–210 cm 之间");
      if (inseam < 60 || inseam > 100) errs.push("跨高需在 60–100 cm 之间");
      if (inseam >= height) errs.push("跨高应小于身高");
      if (armSpan < 130 || armSpan > 230) errs.push("臂展需在 130–230 cm 之间");
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < 2) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors([]);
    if (step > 0) setStep((s) => s - 1);
  };

  const handleGenerate = () => {
    setProfile({ height, inseam, armSpan, flexibility, ridingStyle });
    toast({
      title: "骑行档案已生成",
      description: "智能推荐流已激活，正在为你匹配最佳车型…",
      variant: "success",
    });
    onClose();
  };

  const handleResetAndClose = () => {
    setStep(0);
    setErrors([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleResetAndClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/80 overflow-hidden animate-fade-in">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(163,230,53,0.04),transparent_60%)] pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-lime-400/10 border border-lime-400/20">
              <Target className="size-4 text-lime-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">智能身体数据测量</h2>
              <p className="text-[11px] text-neutral-500">完成测量，开启个性化车型匹配</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="flex size-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className="relative px-6 pb-2">
          <div className="flex items-center justify-center gap-0">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                      i < step
                        ? "border-lime-400 bg-lime-400 text-neutral-950"
                        : i === step
                          ? "border-lime-400 text-lime-400 shadow-[0_0_14px_rgba(163,230,53,0.25)]"
                          : "border-neutral-700 text-neutral-600"
                    }`}
                  >
                    {i < step ? <Check className="size-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden sm:inline transition-colors ${
                      i <= step ? "text-neutral-200" : "text-neutral-600"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-10 sm:w-16 h-0.5 mx-2 rounded-full transition-all duration-300 ${
                      i < step ? "bg-lime-400" : "bg-neutral-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="relative px-6 py-6 min-h-[320px]">
          {step === 0 && (
            <StepBodyData
              height={height}
              setHeight={setHeight}
              inseam={inseam}
              setInseam={setInseam}
              armSpan={armSpan}
              setArmSpan={setArmSpan}
              errors={errors}
            />
          )}

          {step === 1 && (
            <StepRidingProfile
              flexibility={flexibility}
              setFlexibility={setFlexibility}
              ridingStyle={ridingStyle}
              setRidingStyle={setRidingStyle}
            />
          )}

          {step === 2 && (
            <StepConfirm
              height={height}
              inseam={inseam}
              armSpan={armSpan}
              flexibility={flexibility}
              ridingStyle={ridingStyle}
            />
          )}
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between px-6 pb-6 pt-2">
          <div>
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-all"
              >
                <ChevronLeft className="size-3.5" />
                上一步
              </button>
            )}
          </div>

          {step < 2 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-lg bg-lime-400 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-lime-300 transition-all active:scale-95"
            >
              下一步
              <ChevronRight className="size-3.5" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 rounded-lg bg-lime-400 px-5 py-2.5 text-sm font-bold text-neutral-950 hover:bg-lime-300 transition-all active:scale-95 shadow-[0_0_24px_rgba(163,230,53,0.2)]"
            >
              <Sparkles className="size-4" />
              生成我的骑行档案
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Body Data ──────────────────────────────────────────

function StepBodyData({
  height, setHeight, inseam, setInseam, armSpan, setArmSpan, errors,
}: {
  height: number; setHeight: (v: number) => void;
  inseam: number; setInseam: (v: number) => void;
  armSpan: number; setArmSpan: (v: number) => void;
  errors: string[];
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold tracking-tight flex items-center justify-center gap-2">
          <Ruler className="size-5 text-lime-400" />
          身体数据测量
        </h3>
        <p className="text-xs text-neutral-500 mt-1">
          精确的测量数据是实现完美车架匹配的第一步
        </p>
      </div>

      <MeasurementRow
        label="身高"
        unit="cm"
        icon={<User className="size-4" />}
        value={height}
        onChange={setHeight}
        min={140} max={210} step={0.5}
      />
      <MeasurementRow
        label="跨高 / 内缝"
        unit="cm"
        icon={<Activity className="size-4" />}
        value={inseam}
        onChange={setInseam}
        min={60} max={100} step={0.5}
      />
      <MeasurementRow
        label="臂展"
        unit="cm"
        icon={<Ruler className="size-4" />}
        value={armSpan}
        onChange={setArmSpan}
        min={130} max={230} step={0.5}
      />

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          {errors.map((e) => (
            <p key={e} className="text-[11px] text-red-400">{e}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function MeasurementRow({
  label, unit, icon, value, onChange, min, max, step,
}: {
  label: string; unit: string; icon: React.ReactNode;
  value: number; onChange: (v: number) => void;
  min: number; max: number; step: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 hover:border-neutral-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400">
            {icon}
          </div>
          <span className="text-sm font-semibold text-neutral-200">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tabular-nums text-lime-400">
            {value}
          </span>
          <span className="text-xs text-neutral-500">{unit}</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, oklch(0.79 0.26 134) 0%, oklch(0.79 0.26 134) ${pct}%, oklch(0.3 0 0) ${pct}%, oklch(0.3 0 0) 100%)`,
            accentColor: "oklch(0.79 0.26 134)",
          }}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-neutral-600 font-mono">{min}</span>
          <span className="text-[10px] text-neutral-600 font-mono">{max}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Riding Profile ─────────────────────────────────────

function StepRidingProfile({
  flexibility, setFlexibility, ridingStyle, setRidingStyle,
}: {
  flexibility: Flexibility; setFlexibility: (f: Flexibility) => void;
  ridingStyle: RidingStyle; setRidingStyle: (s: RidingStyle) => void;
}) {
  return (
    <div className="space-y-7 animate-fade-in">
      <div className="text-center">
        <h3 className="text-lg font-bold tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="size-5 text-lime-400" />
          骑行画像
        </h3>
        <p className="text-xs text-neutral-500 mt-1">
          你的身体条件和骑行偏好决定了最适合的车架几何
        </p>
      </div>

      {/* Flexibility */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500 mb-3">
          柔韧度评估
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: "excellent" as Flexibility, icon: Sparkles, color: "emerald", title: "极好", desc: "可轻松触及脚尖，核心力量强，能适应低趴竞速姿态" },
            { value: "normal" as Flexibility, icon: ThumbsUp, color: "sky", title: "普通", desc: "柔韧性处于正常范围，能适应大多数公路车几何设定" },
            { value: "poor" as Flexibility, icon: Meh, color: "amber", title: "较差", desc: "柔韧性有限，偏好更直立的骑行姿态与更高车头堆高" },
          ] satisfies { value: Flexibility; icon: React.ComponentType<{ className?: string }>; color: string; title: string; desc: string }[]).map((opt) => {
            const selected = flexibility === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setFlexibility(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                  selected
                    ? `border-lime-400/50 bg-lime-400/5 shadow-[0_0_16px_rgba(163,230,53,0.08)]`
                    : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                }`}
              >
                <div className={`flex size-9 items-center justify-center rounded-lg border ${
                  selected ? "border-lime-400/30 bg-lime-400/10 text-lime-400" : "border-neutral-700 bg-neutral-800 text-neutral-500"
                }`}>
                  <Icon className="size-4" />
                </div>
                <span className={`text-sm font-bold ${selected ? "text-lime-400" : "text-neutral-300"}`}>
                  {opt.title}
                </span>
                <span className="text-[10px] leading-relaxed text-neutral-500">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Riding Style */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500 mb-3">
          骑行风格
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: "aggressive-race" as RidingStyle, icon: Zap, title: "激进竞速", desc: "追求极致气动，低趴激进，适合比赛与高速巡航" },
            { value: "all-around" as RidingStyle, icon: Compass, title: "综合巡航", desc: "速度与舒适兼顾，平衡姿态，适合日常训练与团骑" },
            { value: "endurance" as RidingStyle, icon: Heart, title: "长途耐力", desc: "以舒适为核心，直立放松，适合长途骑行与 Gran Fondo" },
          ] satisfies { value: RidingStyle; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }[]).map((opt) => {
            const selected = ridingStyle === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setRidingStyle(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                  selected
                    ? `border-lime-400/50 bg-lime-400/5 shadow-[0_0_16px_rgba(163,230,53,0.08)]`
                    : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                }`}
              >
                <div className={`flex size-9 items-center justify-center rounded-lg border ${
                  selected ? "border-lime-400/30 bg-lime-400/10 text-lime-400" : "border-neutral-700 bg-neutral-800 text-neutral-500"
                }`}>
                  <Icon className="size-4" />
                </div>
                <span className={`text-sm font-bold ${selected ? "text-lime-400" : "text-neutral-300"}`}>
                  {opt.title}
                </span>
                <span className="text-[10px] leading-relaxed text-neutral-500">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Confirm ────────────────────────────────────────────

function StepConfirm({
  height, inseam, armSpan, flexibility, ridingStyle,
}: {
  height: number; inseam: number; armSpan: number;
  flexibility: Flexibility; ridingStyle: RidingStyle;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-lg font-bold tracking-tight flex items-center justify-center gap-2">
          <Check className="size-5 text-lime-400" />
          确认你的骑行档案
        </h3>
        <p className="text-xs text-neutral-500 mt-1">
          确认以下数据无误后，系统将为你生成个性化匹配方案
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ConfirmRow label="身高" value={`${height} cm`} />
        <ConfirmRow label="跨高" value={`${inseam} cm`} />
        <ConfirmRow label="臂展" value={`${armSpan} cm`} />
        <ConfirmRow label="柔韧度" value={getFlexibilityLabel(flexibility)} highlight />
        <ConfirmRow label="骑行风格" value={getRidingStyleLabel(ridingStyle)} highlight />
        <ConfirmRow label="推荐策略" value="几何智能匹配引擎" highlight />
      </div>

      <div className="rounded-xl border border-lime-400/10 bg-lime-400/[0.02] p-4 flex items-start gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-lime-400/10 border border-lime-400/20 mt-0.5">
          <Sparkles className="size-3.5 text-lime-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-lime-300 mb-0.5">智能匹配引擎</p>
          <p className="text-[11px] leading-relaxed text-neutral-400">
            系统将根据你的身体数据和骑行偏好，计算每款车型的最佳尺码与匹配度百分比。
            匹配度越高的车型，表示该车的几何设计越接近你的理想骑行姿态。
          </p>
        </div>
      </div>
    </div>
  );
}

function ConfirmRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-lime-400/20 bg-lime-400/[0.02]" : "border-neutral-800 bg-neutral-900/60"}`}>
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.05em]">{label}</p>
      <p className={`text-sm font-bold font-mono mt-0.5 ${highlight ? "text-lime-400" : "text-neutral-200"}`}>
        {value}
      </p>
    </div>
  );
}
