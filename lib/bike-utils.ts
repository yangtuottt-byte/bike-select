// --- Type definitions ---

export type BikeType = "road" | "mountain" | "gravel" | "urban" | "all";

export interface SizeData {
  size: string;
  reach: number;
  stack: number;
}

export interface ReachStackData {
  sizes: SizeData[];
}

export interface SizingResult {
  reachMin: number;
  reachMax: number;
  stackMin: number;
  stackMax: number;
  recommendedSizes: string[];
}

// --- Tag parsing ---

export function parseTags(raw: string): string[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function parseReachStack(raw: string): ReachStackData | null {
  try {
    const data = JSON.parse(raw);
    if (data.sizes && Array.isArray(data.sizes)) return data as ReachStackData;
    return null;
  } catch {
    return null;
  }
}

// --- Bike type classification ---

export function getBikeType(tags: string[]): BikeType {
  const tagSet = new Set(tags.map((t) => t.trim()));
  if (tagSet.has("碎石路") || tagSet.has("长途重装") || tagSet.has("冒险骑行")) return "gravel";
  if (tagSet.has("山地竞速") || tagSet.has("越野骑行")) return "mountain";
  return "road";
}

export function getBikeTypeLabel(type: BikeType): string {
  const labels: Record<BikeType, string> = {
    road: "公路车",
    mountain: "山地车",
    gravel: "瓜车",
    urban: "城市车",
    all: "全部车型",
  };
  return labels[type];
}

// --- Labels ---

export function getMaterialLabel(material: string): string {
  const map: Record<string, string> = {
    carbon: "碳纤维",
    aluminum: "铝合金",
    steel: "钢架",
    titanium: "钛合金",
  };
  return map[material] ?? material;
}

export function getBrakeLabel(brake: string): string {
  const map: Record<string, string> = { disc: "碟刹", rim: "圈刹" };
  return map[brake] ?? brake;
}

// --- Groupset tier ---

export type GroupsetTier = "entry" | "mid" | "high" | "unknown";

export function getGroupsetTier(groupset: string | null): GroupsetTier {
  if (!groupset) return "unknown";
  const g = groupset.toLowerCase();
  if (
    g.includes("dura-ace") || g.includes("red") || g.includes("super record") ||
    g.includes("xx") || g.includes("x01")
  ) return "high";
  if (
    g.includes("ultegra") || g.includes("force") || g.includes("champ") ||
    g.includes("record") || g.includes("gx")
  ) return "mid";
  if (
    g.includes("105") || g.includes("rival") || g.includes("apex") ||
    g.includes("tiagra") || g.includes("sora") || g.includes("deore")
  ) return "entry";
  return "unknown";
}

export function getGroupsetTierLabel(tier: GroupsetTier): string {
  const labels: Record<GroupsetTier, string> = {
    entry: "入门竞技",
    mid: "进阶竞赛",
    high: "顶级赛事",
    unknown: "-",
  };
  return labels[tier];
}

// --- Sizing calculator ---

export function calculateBikeFit(heightCm: number, inseamCm: number): SizingResult {
  const targetReach = heightCm * 2.78 + 5;
  const targetStack = inseamCm * 6.35 + 50;
  const reachTol = 10;
  const stackTol = 15;

  return {
    reachMin: Math.round(targetReach - reachTol),
    reachMax: Math.round(targetReach + reachTol),
    stackMin: Math.round(targetStack - stackTol),
    stackMax: Math.round(targetStack + stackTol),
    recommendedSizes: [],
  };
}

export function isBikeInSizeRange(reachStackRaw: string, sizing: SizingResult): boolean {
  const data = parseReachStack(reachStackRaw);
  if (!data) return false;
  return data.sizes.some(
    (s) =>
      s.reach >= sizing.reachMin &&
      s.reach <= sizing.reachMax &&
      s.stack >= sizing.stackMin &&
      s.stack <= sizing.stackMax
  );
}

/** Return the matching size labels for display */
export function getMatchingSizes(reachStackRaw: string, sizing: SizingResult): string[] {
  const data = parseReachStack(reachStackRaw);
  if (!data) return [];
  return data.sizes
    .filter(
      (s) =>
        s.reach >= sizing.reachMin &&
        s.reach <= sizing.reachMax &&
        s.stack >= sizing.stackMin &&
        s.stack <= sizing.stackMax
    )
    .map((s) => s.size);
}

// --- Value score ---

export function calculateValueScore(
  price: number,
  weight: number | null,
  groupset: string | null
): number {
  let score = 0;
  const tier = getGroupsetTier(groupset);
  if (tier === "high") score += 35;
  else if (tier === "mid") score += 22;
  else if (tier === "entry") score += 12;

  if (weight) {
    score += Math.max(0, (10 - weight) * 6);
  }
  const pricePerPoint = price / Math.max(1, score);
  return Math.round(Math.max(5, 100 - pricePerPoint / 1200));
}

// --- Specs parsing ---

export interface BikeSpecs {
  frame?: string;
  wheelset?: string;
  shifters?: string;
  derailleurFront?: string;
  derailleurRear?: string;
  crankset?: string;
  cassette?: string;
  tires?: string;
}

export function parseSpecs(raw: string | null): BikeSpecs | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BikeSpecs;
  } catch {
    return null;
  }
}

export const SPECS_LABELS: Record<keyof BikeSpecs, string> = {
  frame: "车架",
  wheelset: "轮组",
  shifters: "手变",
  derailleurFront: "前拨",
  derailleurRear: "后拨",
  crankset: "牙盘",
  cassette: "飞轮",
  tires: "外胎",
};

// --- Tag display helpers ---

export function getTagColorClass(tag: string): string {
  const t = tag.trim();
  if (t === "比赛竞速" || t === "山地竞速") return "bg-red-500/15 text-red-400 border-red-500/30";
  if (t === "竞速训练" || t === "越野骑行") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (t === "爬坡" || t === "放坡") return "bg-lime-500/15 text-lime-400 border-lime-500/30";
  if (t === "平路巡航") return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  if (t === "长途耐力" || t === "长途重装") return "bg-violet-500/15 text-violet-400 border-violet-500/30";
  if (t === "碎石路" || t === "冒险骑行") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (t === "休闲骑行" || t === "通勤") return "bg-neutral-500/15 text-neutral-400 border-neutral-500/30";
  return "bg-neutral-500/15 text-neutral-400 border-neutral-500/30";
}
