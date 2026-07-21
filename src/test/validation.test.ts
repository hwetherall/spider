import { describe, expect, it } from "vitest";
import { roundOnePlans, roundOneReports, roundTwoPlans } from "../data/scenario";
import { validateReport } from "../domain/validation";

describe("report validation", () => {
  it("accepts a matching report and plan", () => {
    const report = roundOneReports.find((item) => item.agentId === "product")!;
    const plan = roundOnePlans.find((item) => item.agentId === "product")!;
    expect(validateReport(report, plan, 1)).toEqual([]);
  });

  it("rejects stale versions and candidates outside the plan", () => {
    const plan = roundOnePlans[0];
    const report = {
      ...roundOneReports.find((item) => item.agentId === "market")!,
      stateVersion: 0,
      candidateScores: [{ candidateId: "C9", score: 100 }],
    };
    expect(validateReport(report, plan, 1)).toEqual([
      "Report state version is stale.",
      "Report scored a candidate outside its assignment.",
    ]);
  });

  it("requires causal references on Round 2 plans", () => {
    const plan = { ...roundTwoPlans[0], triggeredBy: [] };
    const report = {
      ...roundOneReports[0],
      planId: plan.id,
      agentId: plan.agentId,
      round: 2 as const,
      candidateScores: [{ candidateId: "C2-R", score: 79 }],
    };
    expect(validateReport(report, plan, 1)).toContain("Round 2 plans require at least one causal reference.");
  });
});
