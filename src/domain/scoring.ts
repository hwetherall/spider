import type { CandidateDimensions } from "./types";

export const SCORE_WEIGHTS = {
  market: 0.45,
  competitive: 0.35,
  product: 0.2,
} as const;

export function calculateWeightedScore(dimensions: CandidateDimensions): number | null {
  const { market, competitive, product } = dimensions;
  if (market === undefined || competitive === undefined || product === undefined) return null;
  return Math.round(
    market * SCORE_WEIGHTS.market +
      competitive * SCORE_WEIGHTS.competitive +
      product * SCORE_WEIGHTS.product,
  );
}
