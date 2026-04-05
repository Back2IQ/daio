export type AssetCategory = "crypto" | "nfts" | "socialMedia" | "gaming";

export interface TimePoint {
  day: number;
  withoutGovernance: number;
  withDAIO: number;
}

const DECAY_RATES: Record<AssetCategory, number> = {
  crypto: 0.002,
  nfts: 0.005,
  socialMedia: 0.008,
  gaming: 0.006,
};

export function generateLossData(
  maxDays: number,
  assetCategory?: AssetCategory
): TimePoint[] {
  const rate = assetCategory ? DECAY_RATES[assetCategory] : 0.004;
  const points: TimePoint[] = [];
  const step = maxDays <= 30 ? 1 : maxDays <= 90 ? 3 : 7;

  for (let day = 0; day <= maxDays; day += step) {
    points.push({
      day,
      withoutGovernance: Math.round(100 * Math.exp(-rate * day) * 10) / 10,
      withDAIO: Math.round(Math.max(100 - day * 0.05, 92) * 10) / 10,
    });
  }
  return points;
}

export const ASSET_CATEGORIES: { id: AssetCategory; label: string; color: string }[] = [
  { id: "crypto", label: "Crypto", color: "#f59e0b" },
  { id: "nfts", label: "NFTs", color: "#8b5cf6" },
  { id: "socialMedia", label: "Social Media", color: "#ef4444" },
  { id: "gaming", label: "Gaming", color: "#3b82f6" },
];
