import { describe, expect, it } from "vitest";
import { franceWhatIf, initialCandidates, refinedCandidate } from "../data/scenario";
import { calculateWeightedScore } from "../domain/scoring";

describe("calculateWeightedScore", () => {
  it("computes the three Round 1 scores from their dimensions", () => {
    expect(initialCandidates.map((candidate) => calculateWeightedScore(candidate.dimensions))).toEqual([66, 71, 63]);
  });

  it("computes the Italy recommendation and France what-if", () => {
    expect(calculateWeightedScore(refinedCandidate.dimensions)).toBe(74);
    expect(calculateWeightedScore(franceWhatIf.dimensions)).toBe(66);
  });

  it("does not score incomplete candidates", () => {
    expect(calculateWeightedScore({ market: 90, product: 80 })).toBeNull();
  });
});
