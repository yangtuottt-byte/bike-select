import type { RiderProfile } from "./rider-store";
import { parseReachStack, type SizeData } from "./bike-utils";

export interface FitScoreResult {
  score: number;
  bestSize: string;
  targetReach: number;
  targetStack: number;
  bikeReach: number;
  bikeStack: number;
}

export interface TargetGeometry {
  reach: number;
  stack: number;
  str: number;
}

/**
 * Compute the rider's ideal target geometry based on body measurements,
 * riding style, and flexibility.
 */
export function getTargetGeometry(profile: RiderProfile): TargetGeometry {
  let reach = profile.height * 2.78 + 5;
  let stack = profile.inseam * 6.35 + 50;

  switch (profile.ridingStyle) {
    case "aggressive-race":
      stack *= 0.93;
      reach *= 1.01;
      break;
    case "endurance":
      stack *= 1.08;
      reach *= 0.98;
      break;
  }

  switch (profile.flexibility) {
    case "excellent":
      stack *= 0.96;
      break;
    case "poor":
      stack *= 1.05;
      break;
  }

  reach = Math.round(reach);
  stack = Math.round(stack);

  return { reach, stack, str: parseFloat((stack / reach).toFixed(2)) };
}

/**
 * Score a bike against the rider's ideal geometry.
 * Returns the best-fitting size and a 0-100 match percentage.
 */
export function calculateFitScore(
  profile: RiderProfile,
  reachStackRaw: string
): FitScoreResult | null {
  const geo = parseReachStack(reachStackRaw);
  if (!geo || geo.sizes.length === 0) return null;

  const target = getTargetGeometry(profile);

  let bestScore = 0;
  let bestSize: SizeData = geo.sizes[0];

  for (const size of geo.sizes) {
    const deltaReach = Math.abs(target.reach - size.reach);
    const deltaStack = Math.abs(target.stack - size.stack);

    const reachScore = Math.max(0, 50 - (deltaReach / 15) * 50);
    const stackScore = Math.max(0, 50 - (deltaStack / 20) * 50);
    const score = Math.round(reachScore + stackScore);

    if (score > bestScore) {
      bestScore = score;
      bestSize = size;
    }
  }

  return {
    score: bestScore,
    bestSize: bestSize.size,
    targetReach: target.reach,
    targetStack: target.stack,
    bikeReach: bestSize.reach,
    bikeStack: bestSize.stack,
  };
}

export function getRidingStyleLabel(style: string): string {
  const map: Record<string, string> = {
    "aggressive-race": "激进竞速",
    "all-around": "综合巡航",
    endurance: "长途耐力",
  };
  return map[style] ?? style;
}

export function getFlexibilityLabel(flex: string): string {
  const map: Record<string, string> = {
    excellent: "极好",
    normal: "普通",
    poor: "较差",
  };
  return map[flex] ?? flex;
}
