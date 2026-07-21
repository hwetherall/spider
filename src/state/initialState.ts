import { initialCandidates } from "../data/scenario";
import type { AgentId, AgentRuntimeState, DemoState } from "../domain/types";

const idleAgent = (): AgentRuntimeState => ({ status: "Idle", round: 0, findings: 0 });

export function createInitialState(): DemoState {
  return {
    phase: "INTRO",
    stateVersion: 1,
    round: 0,
    market: "Italy",
    candidates: initialCandidates.map((candidate) => ({ ...candidate, dimensions: { ...candidate.dimensions } })),
    agents: {
      orchestrator: idleAgent(),
      market: idleAgent(),
      product: idleAgent(),
      competitive: idleAgent(),
    } satisfies Record<AgentId, AgentRuntimeState>,
    plans: [],
    reports: [],
    revealedReportIds: [],
    timeline: [],
    presenterStep: 0,
  };
}

export const initialState = createInitialState();
