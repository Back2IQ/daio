export interface InferenceStep {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const INFERENCE_STEPS: InferenceStep[] = [
  { id: "cases", label: "5 Recovered Cases", description: "Real anonymized cases with verified outcomes", icon: "FileStack" },
  { id: "model", label: "Bayesian Inference", description: "Weibull survival + hierarchical Bayesian model", icon: "BrainCircuit" },
  { id: "estimate", label: "Population Estimate", description: "Projected hidden losses with 95% confidence", icon: "TrendingUp" },
];

export interface DensityPoint {
  x: number;
  density: number;
}

export function generateDensityCurve(): DensityPoint[] {
  const mean = 8.2;
  const stdDev = 2.5;
  const points: DensityPoint[] = [];

  for (let x = 0; x <= 18; x += 0.2) {
    const density = (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    points.push({ x: Math.round(x * 10) / 10, density: Math.round(density * 10000) / 10000 });
  }
  return points;
}

export const CONFIDENCE_INTERVAL = {
  lower: 4.1,
  median: 8.2,
  upper: 12.3,
};
