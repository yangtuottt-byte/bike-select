"use client";

import { useState, useTransition, useCallback, useEffect, useRef } from "react";
import { ScanEye, Globe, Upload, Cpu, Check, ArrowRight, Zap, FileJson, Bike, Wrench, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { parseBikeUrlAction, parseBikeImageAction, saveImportedBikesAction } from "@/app/actions/import";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabId = "url" | "vision" | "batch";

interface BikeImportData {
  brand: string;
  model: string;
  frameMaterial: string;
  brakeSystem: string;
  price: number;
  weight?: number | null;
  groupset?: string | null;
  reachStack: Record<string, unknown>;
  specs: Record<string, unknown>;
  scenarioTags: string[];
  description?: string | null;
  image?: string | null;
}

const EMPTY_BIKE: BikeImportData = {
  brand: "",
  model: "",
  frameMaterial: "carbon",
  brakeSystem: "disc",
  price: 0,
  weight: null,
  groupset: null,
  reachStack: { reach: null, stack: null, sizes: [] },
  specs: {},
  scenarioTags: [],
  description: null,
  image: null,
};

// ---------------------------------------------------------------------------
// Cyberpunk loading messages
// ---------------------------------------------------------------------------

const LOADING_MESSAGES = [
  "AI 正在解构 DOM 树...",
  "神经网络解析产品参数中...",
  "正在通过视觉大模型提取 STR 比例...",
  "语义分析中 — 识别几何堆高与前伸量...",
  "量化套件配置到结构化 JSON...",
  "对比已知品牌数据库 — 矫正命名实体...",
  "正在拟合车架材质与刹车系统分类...",
  "AI Fitter 校验人体工学数据一致性...",
];

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function Tabs({
  tabs,
  active,
  onSelect,
}: {
  tabs: { id: TabId; label: string; icon: React.ReactNode }[];
  active: TabId;
  onSelect: (id: TabId) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-neutral-800/60 p-1 border border-neutral-700/50">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            active === t.id
              ? "bg-neutral-700 text-lime-400 shadow-inner shadow-black/40"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/40",
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editable field helpers
// ---------------------------------------------------------------------------

function FieldRow({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Label className="w-28 shrink-0 text-right text-xs text-neutral-400">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 flex-1 text-xs"
      />
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Label className="w-28 shrink-0 text-right text-xs text-neutral-400">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-8 w-full flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-neutral-100
          focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function JsonFieldRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const raw = JSON.stringify(value, null, 2);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(raw);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setEditing(false);
    } catch {
      // keep old value
    }
  };

  return (
    <div className="flex items-start gap-3 py-1.5">
      <Label className="w-28 shrink-0 text-right text-xs text-neutral-400 mt-1.5">{label}</Label>
      {editing ? (
        <div className="flex-1 flex flex-col gap-1.5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 rounded-lg border border-lime-400/50 bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-100
              focus:outline-none focus:ring-2 focus:ring-lime-400/40"
            spellCheck={false}
          />
          <div className="flex gap-2">
            <Button size="xs" variant="default" onClick={handleSave}>
              Apply
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                setText(raw);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setText(JSON.stringify(value, null, 2));
            setEditing(true);
          }}
          className="flex-1 text-left rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-xs font-mono text-neutral-300
            hover:border-lime-400/30 hover:bg-neutral-800 transition-colors truncate"
        >
          {raw.length > 80 ? raw.slice(0, 80) + "…" : raw}
        </button>
      )}
    </div>
  );
}

function TagInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  return (
    <div className="flex items-start gap-3 py-1.5">
      <Label className="w-28 shrink-0 text-right text-xs text-neutral-400 mt-1.5">{label}</Label>
      <div className="flex-1 flex flex-wrap gap-1.5 items-center">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-md border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[11px] text-lime-300"
          >
            {t}
            <button
              onClick={() => onChange(value.filter((x) => x !== t))}
              className="text-lime-400/60 hover:text-lime-200 ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        <div className="flex gap-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="添加标签..."
            className="h-6 w-28 text-[11px]"
          />
          <Button size="xs" variant="ghost" onClick={add}>
            +
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dropzone
// ---------------------------------------------------------------------------

function Dropzone({
  onImage,
  disabled,
}: {
  onImage: (base64: string) => void;
  disabled: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const counterRef = useRef(0);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const b64 = dataUrl.split(",")[1];
        onImage(b64);
      };
      reader.readAsDataURL(file);
    },
    [onImage],
  );

  // Global Ctrl+V listener
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          e.preventDefault();
          handleFile(items[i].getAsFile()!);
          return;
        }
      }
    };
    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [handleFile]);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        counterRef.current++;
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        counterRef.current--;
        if (counterRef.current <= 0) {
          counterRef.current = 0;
          setDragging(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        counterRef.current = 0;
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
        disabled && "opacity-50 pointer-events-none",
        dragging
          ? "border-lime-400 bg-lime-400/5 scale-[1.02]"
          : "border-neutral-600 hover:border-neutral-400 hover:bg-neutral-800/30",
      )}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full border transition-colors",
          dragging
            ? "border-lime-400/50 bg-lime-400/10 text-lime-400"
            : "border-neutral-600 text-neutral-500",
        )}
      >
        <Upload className="size-5" />
      </div>
      <div className="text-center">
        <p className="text-sm text-neutral-300">
          拖拽或<kbd className="mx-1 rounded bg-neutral-700 px-1.5 py-0.5 text-[11px] font-mono text-neutral-300">Ctrl+V</kbd>粘贴包含几何参数的图片
        </p>
        <p className="text-[11px] text-neutral-500 mt-1">支持 PNG / JPG / WebP</p>
      </div>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminImportPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("url");
  const [isPending, startTransition] = useTransition();

  // Input states
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  // Loading
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Parsed data
  const [parsedBike, setParsedBike] = useState<BikeImportData | null>(null);
  const [sourceLabel, setSourceLabel] = useState("");

  // Loading message cycle
  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(iv);
  }, [loading]);

  // ── Handlers ──────────────────────────────────────────────────

  const handleUrlParse = () => {
    if (!url.trim()) return;
    setLoading(true);
    setSourceLabel(`已解析 URL: ${url.slice(0, 60)}${url.length > 60 ? "…" : ""}`);
    startTransition(async () => {
      try {
        const result = await parseBikeUrlAction(url);
        setParsedBike(result);
        toast({ title: "解析完成", description: "AI 已成功提取车辆数据，请在下方沙盒中核对", variant: "success" });
      } catch (err) {
        toast({
          title: "解析失败",
          description: err instanceof Error ? err.message : "未知错误",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const handleVisionParse = (base64: string) => {
    setLoading(true);
    setSourceLabel("已解析截图/几何图表");
    startTransition(async () => {
      try {
        const result = await parseBikeImageAction(base64);
        setParsedBike(result);
        toast({ title: "视觉提取完成", description: "AI 已识别图片中的车辆参数", variant: "success" });
      } catch (err) {
        toast({
          title: "视觉识别失败",
          description: err instanceof Error ? err.message : "未知错误",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const handleSave = () => {
    if (!parsedBike) return;
    setLoading(true);
    startTransition(async () => {
      try {
        const result = await saveImportedBikesAction([parsedBike]);
        toast({
          title: `入库成功 — ${result.count} 辆车已持久化`,
          description: `ID: ${result.ids[0]}`,
          variant: "success",
        });
        // Reset
        setParsedBike(null);
        setSourceLabel("");
        setUrl("");
        setFileName(null);
      } catch (err) {
        toast({
          title: "入库失败",
          description: err instanceof Error ? err.message : "未知错误",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });
  };

  // ── Update field helper ───────────────────────────────────────
  const update = (key: keyof BikeImportData, value: unknown) => {
    setParsedBike((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/5 px-4 py-1.5 mb-4">
            <Cpu className="size-3.5 text-lime-400" />
            <span className="text-[11px] font-mono text-lime-400/80 tracking-widest uppercase">
              Multi-Modal Import System v1.0
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-100">
            智能数据导入工作台
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            AI 驱动的自行车参数结构化提取 — URL 解构 · 视觉 OCR · 批量导入
          </p>
        </div>

        {/* ── Tab Switcher ───────────────────────────────────── */}
        <div className="mb-6 flex justify-center">
          <Tabs
            active={activeTab}
            onSelect={setActiveTab}
            tabs={[
              { id: "url", label: "网页 URL 解构", icon: <Globe className="size-4" /> },
              { id: "vision", label: "视觉 OCR 抓取", icon: <ScanEye className="size-4" /> },
              { id: "batch", label: "批量文件导入", icon: <Upload className="size-4" /> },
            ]}
          />
        </div>

        {/* ── Tab Panels ─────────────────────────────────────── */}
        <Card className="border-neutral-700/60">
          <CardContent className="p-6">
            {/* URL Tab */}
            {activeTab === "url" && (
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label className="mb-2 block text-xs text-neutral-400">输入目标 URL</Label>
                  <div className="relative">
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/bikes/tarmac-sl8"
                      onKeyDown={(e) => e.key === "Enter" && handleUrlParse()}
                      className="pr-4 font-mono text-sm"
                    />
                    {/* Blinking cursor overlay */}
                    {!url && (
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-lime-400 animate-pulse" />
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleUrlParse}
                  disabled={!url.trim() || loading}
                  className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-neutral-950 font-semibold"
                >
                  <Zap className="size-4" />
                  深度解析
                </Button>
              </div>
            )}

            {/* Vision Tab */}
            {activeTab === "vision" && (
              <div>
                <Label className="mb-2 block text-xs text-neutral-400">上传图片</Label>
                <Dropzone onImage={handleVisionParse} disabled={loading} />
              </div>
            )}

            {/* Batch Tab */}
            {activeTab === "batch" && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex size-16 items-center justify-center rounded-full border border-neutral-600 bg-neutral-800/50">
                  <FileJson className="size-6 text-neutral-500" />
                </div>
                <p className="text-sm text-neutral-400">CSV / Excel 批量导入功能即将上线</p>
                <Button variant="outline" disabled className="text-xs">
                  选择文件
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Loading Overlay ────────────────────────────────── */}
        {loading && (
          <div className="mt-6 animate-fade-in">
            <Card className="border-lime-400/20 bg-neutral-900/80 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-8 flex flex-col items-center gap-5">
                {/* Spinner */}
                <div className="relative size-16">
                  <div className="absolute inset-0 rounded-full border-2 border-neutral-700" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-lime-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border border-lime-400/20 flex items-center justify-center">
                    <Cpu className="size-5 text-lime-400 animate-pulse" />
                  </div>
                </div>
                {/* Message */}
                <div className="text-center">
                  <p className="text-sm font-mono text-lime-400/90 tracking-wide animate-pulse">
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1.5">
                    请稍候 — 大模型推理通常需要 3-8 秒
                  </p>
                </div>
                {/* Progress dots */}
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "size-1.5 rounded-full transition-colors duration-500",
                        i <= loadingMsgIdx % 5 ? "bg-lime-400" : "bg-neutral-700",
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Staging Sandbox ────────────────────────────────── */}
        {parsedBike && !loading && (
          <div className="mt-6 animate-slide-up">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
              <Hash className="size-4 text-lime-400" />
              <h2 className="text-sm font-semibold text-neutral-200 tracking-wide">数据预检沙盒 (Staging Sandbox)</h2>
              <span className="ml-auto rounded-full bg-lime-400/10 border border-lime-400/20 px-3 py-0.5 text-[10px] font-mono text-lime-400">
                AI EXTRACTED
              </span>
            </div>

            <div className="grid grid-cols-12 gap-4">
              {/* ── LEFT: Source info ────────────────────────── */}
              <div className="col-span-3">
                <Card className="border-neutral-700/50 bg-neutral-900/60 h-full">
                  <CardHeader>
                    <CardTitle className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                      Source
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/30">
                      <Globe className="size-3.5 text-neutral-400 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-neutral-400 leading-relaxed break-all">{sourceLabel}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Quick Stats</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-neutral-800/40 p-2.5 text-center">
                          <p className="text-lg font-bold text-lime-400">{parsedBike.brand ? "✓" : "—"}</p>
                          <p className="text-[10px] text-neutral-500">Brand</p>
                        </div>
                        <div className="rounded-lg bg-neutral-800/40 p-2.5 text-center">
                          <p className="text-lg font-bold text-lime-400">{parsedBike.model ? "✓" : "—"}</p>
                          <p className="text-[10px] text-neutral-500">Model</p>
                        </div>
                        <div className="rounded-lg bg-neutral-800/40 p-2.5 text-center">
                          <p className="text-lg font-bold text-lime-400">{parsedBike.price ? `¥${parsedBike.price}` : "—"}</p>
                          <p className="text-[10px] text-neutral-500">Price</p>
                        </div>
                        <div className="rounded-lg bg-neutral-800/40 p-2.5 text-center">
                          <p className="text-lg font-bold text-lime-400">
                            {parsedBike.reachStack && (parsedBike.reachStack as any).reach ? "✓" : "—"}
                          </p>
                          <p className="text-[10px] text-neutral-500">Geometry</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── RIGHT: Editable form ──────────────────────── */}
              <div className="col-span-9">
                <Card className="border-neutral-700/50 bg-neutral-900/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="size-4 text-amber-400" />
                      <CardTitle className="text-sm text-neutral-200">人机协同编辑</CardTitle>
                      <span className="text-[10px] text-neutral-500 ml-2">可修改所有 AI 提取字段</span>
                    </div>
                    <CardDescription>核对并修正下列数据，确保入库准确性</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-1 max-h-[55vh] overflow-y-auto pr-2">
                    {/* Section: Basic */}
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider pt-2 pb-1 border-t border-neutral-800">
                      Basic Info
                    </p>
                    <FieldRow label="品牌 (Brand)" value={parsedBike.brand} onChange={(v) => update("brand", v)} />
                    <FieldRow label="型号 (Model)" value={parsedBike.model} onChange={(v) => update("model", v)} />
                    <FieldRow
                      label="价格 (Price)"
                      value={parsedBike.price || ""}
                      onChange={(v) => update("price", v ? parseFloat(v) || 0 : 0)}
                      type="number"
                    />
                    <FieldRow
                      label="重量 kg"
                      value={parsedBike.weight ?? ""}
                      onChange={(v) => update("weight", v ? parseFloat(v) || null : null)}
                      type="number"
                    />
                    <SelectRow
                      label="车架材质"
                      value={parsedBike.frameMaterial}
                      options={[
                        { value: "carbon", label: "Carbon" },
                        { value: "aluminum", label: "Aluminum" },
                        { value: "steel", label: "Steel" },
                        { value: "titanium", label: "Titanium" },
                      ]}
                      onChange={(v) => update("frameMaterial", v)}
                    />
                    <SelectRow
                      label="刹车系统"
                      value={parsedBike.brakeSystem}
                      options={[
                        { value: "disc", label: "Disc" },
                        { value: "rim", label: "Rim" },
                      ]}
                      onChange={(v) => update("brakeSystem", v)}
                    />
                    <FieldRow
                      label="套件 (Groupset)"
                      value={parsedBike.groupset ?? ""}
                      onChange={(v) => update("groupset", v || null)}
                      placeholder="e.g. Shimano Ultegra Di2"
                    />
                    <FieldRow
                      label="描述"
                      value={parsedBike.description ?? ""}
                      onChange={(v) => update("description", v || null)}
                      placeholder="1-2 句描述"
                    />

                    {/* Section: Geometry */}
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider pt-3 pb-1 border-t border-neutral-800">
                      Geometry (Reach & Stack)
                    </p>
                    <JsonFieldRow
                      label="reachStack"
                      value={parsedBike.reachStack}
                      onChange={(v) => update("reachStack", v as Record<string, unknown>)}
                    />

                    {/* Section: Specs */}
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider pt-3 pb-1 border-t border-neutral-800">
                      Components Specs
                    </p>
                    <JsonFieldRow
                      label="specs"
                      value={parsedBike.specs}
                      onChange={(v) => update("specs", v as Record<string, unknown>)}
                    />

                    {/* Section: Tags */}
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider pt-3 pb-1 border-t border-neutral-800">
                      Scenario Tags
                    </p>
                    <TagInput
                      label="场景标签"
                      value={parsedBike.scenarioTags}
                      onChange={(v) => update("scenarioTags", v)}
                    />
                  </CardContent>

                  {/* ── Footer: Save button ──────────────────── */}
                  <CardFooter className="pt-4 border-t border-neutral-800">
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bike className="size-4 text-neutral-500" />
                        <span className="text-[11px] text-neutral-500">
                          {parsedBike.brand && parsedBike.model
                            ? `${parsedBike.brand} ${parsedBike.model}`
                            : "未命名车辆"}
                        </span>
                      </div>
                      <Button
                        onClick={handleSave}
                        disabled={!parsedBike.brand || !parsedBike.model || loading}
                        className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-neutral-950 font-semibold
                          shadow-lg shadow-lime-500/20 transition-all duration-200
                          disabled:opacity-40 disabled:shadow-none"
                      >
                        <Check className="size-4" />
                        确认无误，执行入库
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
