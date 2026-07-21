import { describe, expect, it } from "vitest";
import type { DemoState } from "../domain/types";
import { demoReducer } from "../state/demoReducer";
import { createInitialState } from "../state/initialState";

function reduce(events: Parameters<typeof demoReducer>[1][]) {
  return events.reduce<DemoState>(demoReducer, createInitialState());
}

const throughRoundOne = [
  { type: "START_DEMO" } as const,
  { type: "CONFIRM_BRIEF" } as const,
  { type: "DISPATCH_ROUND_1" } as const,
  { type: "REVEAL_NEXT_REPORT" } as const,
  { type: "REVEAL_NEXT_REPORT" } as const,
  { type: "REVEAL_NEXT_REPORT" } as const,
  { type: "SYNTHESIZE_ROUND_1" } as const,
];

describe("demo reducer", () => {
  it("classifies the brief and creates candidates before dispatch", () => {
    const brief = demoReducer(createInitialState(), { type: "START_DEMO" });
    expect(brief.phase).toBe("BRIEF_REVIEW");
    const planned = demoReducer(brief, { type: "CONFIRM_BRIEF" });
    expect(planned.phase).toBe("ROUND_1_PLANNING");
    expect(planned.plans).toHaveLength(3);
    expect(planned.plans.every((plan) => plan.candidateIds.join() === "C1,C2,C3")).toBe(true);
  });

  it("reveals reports in Product, Market, Competitive order", () => {
    const state = reduce(throughRoundOne.slice(0, 6));
    expect(state.reports.map((report) => report.agentId)).toEqual(["product", "market", "competitive"]);
    expect(state.phase).toBe("ROUND_1_REPORTS");
  });

  it("creates C2-R and causal Round 2 plans on the balanced path", () => {
    const state = demoReducer(reduce(throughRoundOne), { type: "SELECT_PRIORITY", priority: "balanced" });
    expect(state.phase).toBe("ROUND_2_PLANNING");
    expect(state.candidates.some((candidate) => candidate.id === "C2-R")).toBe(true);
    expect(state.plans.filter((plan) => plan.round === 2).every((plan) => plan.triggeredBy.length > 0)).toBe(true);
  });

  it("keeps alternative priority branches safe and recoverable", () => {
    const alternative = demoReducer(reduce(throughRoundOne), { type: "SELECT_PRIORITY", priority: "demand" });
    expect(alternative.phase).toBe("ALTERNATIVE_PRIORITY");
    const recovered = demoReducer(alternative, { type: "RETURN_TO_BALANCED" });
    expect(recovered.phase).toBe("ROUND_2_PLANNING");
  });

  it("gates the final recommendation until all Round 2 reports are present", () => {
    const planned = demoReducer(reduce(throughRoundOne), { type: "SELECT_PRIORITY", priority: "balanced" });
    const invalidReveal = demoReducer({ ...planned, phase: "ROUND_2_REPORTS" }, { type: "REVEAL_RECOMMENDATION" });
    expect(invalidReveal.recommendation).toBeUndefined();
  });

  it("increments state version and makes Italy work stale after France is confirmed", () => {
    let state = demoReducer(reduce(throughRoundOne), { type: "SELECT_PRIORITY", priority: "balanced" });
    state = demoReducer(state, { type: "DISPATCH_ROUND_2" });
    state = demoReducer(state, { type: "REVEAL_ROUND_2" });
    state = demoReducer(state, { type: "REVEAL_RECOMMENDATION" });
    state = demoReducer(state, { type: "OPEN_WHAT_IF" });
    state = demoReducer(state, { type: "CONFIRM_CONSTRAINT_CHANGE" });
    expect(state.stateVersion).toBe(2);
    expect(state.market).toBe("France");
    expect(state.reports.every((report) => report.status === "stale")).toBe(true);
    expect(state.recommendation).toBeUndefined();
  });

  it("protects phases from invalid events and resets completely", () => {
    const initial = createInitialState();
    expect(demoReducer(initial, { type: "CONFIRM_CONSTRAINT_CHANGE" })).toBe(initial);
    const reset = demoReducer(reduce(throughRoundOne), { type: "RESET_DEMO" });
    expect(reset).toEqual(createInitialState());
  });
});
