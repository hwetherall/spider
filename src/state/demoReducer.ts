import {
  finalRecommendation,
  refinedCandidate,
  reportOrder,
  roundOnePlans,
  roundOneReports,
  roundTwoPlans,
  roundTwoReports,
} from "../data/scenario";
import type { AgentId, AgentRuntimeState, DemoEvent, DemoState, SpecialistId, TimelineEvent } from "../domain/types";
import { createInitialState } from "./initialState";

const agentTone: Record<SpecialistId, TimelineEvent["tone"]> = {
  market: "market",
  product: "product",
  competitive: "competitive",
};

function setAgents(
  agents: DemoState["agents"],
  ids: AgentId[],
  patch: Partial<AgentRuntimeState>,
): DemoState["agents"] {
  const next = { ...agents };
  ids.forEach((id) => {
    next[id] = { ...next[id], ...patch };
  });
  return next;
}

function addTimeline(state: DemoState, event: Omit<TimelineEvent, "id">): TimelineEvent[] {
  return [...state.timeline, { ...event, id: `event-${state.timeline.length + 1}` }];
}

export function demoReducer(state: DemoState, event: DemoEvent): DemoState {
  switch (event.type) {
    case "START_DEMO":
      if (state.phase !== "INTRO") return state;
      return {
        ...state,
        phase: "BRIEF_REVIEW",
        agents: setAgents(state.agents, ["orchestrator"], { status: "Structuring brief", round: 0 }),
        timeline: addTimeline(state, {
          label: "Brief received",
          detail: "Orchestrator classified constraints, preferences, and open decisions.",
          tone: "coral",
        }),
        presenterStep: 0,
      };

    case "CONFIRM_BRIEF":
      if (state.phase !== "BRIEF_REVIEW") return state;
      return {
        ...state,
        phase: "ROUND_1_PLANNING",
        round: 1,
        plans: roundOnePlans.map((plan) => ({ ...plan })),
        agents: setAgents(state.agents, ["orchestrator"], { status: "Plan ready", round: 1 }),
        timeline: addTimeline(state, {
          label: "Three candidates created",
          detail: "C1, C2, and C3 now share one comparable evaluation frame.",
          tone: "coral",
        }),
        presenterStep: 1,
      };

    case "DISPATCH_ROUND_1":
      if (state.phase !== "ROUND_1_PLANNING") return state;
      return {
        ...state,
        phase: "ROUND_1_WORKING",
        plans: state.plans.map((plan) => ({ ...plan, status: "working" })),
        agents: {
          ...setAgents(state.agents, ["market", "product", "competitive"], { status: "Researching", round: 1 }),
          orchestrator: { ...state.agents.orchestrator, status: "Awaiting reports", round: 1 },
        },
        timeline: addTimeline(state, {
          label: "Round 1 plans dispatched",
          detail: "Each specialist received a distinct plan against candidates C1–C3.",
          tone: "coral",
        }),
        presenterStep: 2,
      };

    case "REVEAL_NEXT_REPORT": {
      if (state.phase !== "ROUND_1_WORKING" && state.phase !== "ROUND_1_REPORTS") return state;
      const nextAgent = reportOrder[state.revealedReportIds.length];
      if (!nextAgent) return state;
      const report = roundOneReports.find((item) => item.agentId === nextAgent)!;
      const revealedReportIds = [...state.revealedReportIds, report.id];
      const isLast = revealedReportIds.length === reportOrder.length;
      return {
        ...state,
        phase: "ROUND_1_REPORTS",
        reports: [...state.reports, { ...report }],
        revealedReportIds,
        agents: {
          ...state.agents,
          [nextAgent]: {
            ...state.agents[nextAgent],
            status: "Report ready",
            findings: report.findings.length,
          },
          orchestrator: {
            ...state.agents.orchestrator,
            status: isLast ? "All reports ready" : "Receiving reports",
          },
        },
        timeline: addTimeline(state, {
          label: `${nextAgent[0].toUpperCase()}${nextAgent.slice(1)} report accepted`,
          detail: report.executiveSummary,
          tone: agentTone[nextAgent],
        }),
      };
    }

    case "SYNTHESIZE_ROUND_1":
      if (state.phase !== "ROUND_1_SYNTHESIS" && state.phase !== "ROUND_1_REPORTS") return state;
      if (state.revealedReportIds.filter((id) => id.endsWith("-1")).length !== 3) return state;
      return {
        ...state,
        phase: "AWAITING_USER_PRIORITY",
        agents: {
          ...setAgents(state.agents, ["market", "product", "competitive"], { status: "Awaiting direction" }),
          orchestrator: { ...state.agents.orchestrator, status: "Decision requested" },
        },
        timeline: addTimeline(state, {
          label: "Material conflict detected",
          detail: "Demand, competitive headroom, and feasibility favor different candidates.",
          tone: "coral",
        }),
        presenterStep: 3,
      };

    case "SELECT_PRIORITY": {
      if (state.phase !== "AWAITING_USER_PRIORITY") return state;
      if (event.priority !== "balanced") {
        return {
          ...state,
          phase: "ALTERNATIVE_PRIORITY",
          selectedPriority: event.priority,
          timeline: addTimeline(state, {
            label: "Alternative priority tested",
            detail: event.priority === "demand" ? "Established demand advances C1." : "Maximum whitespace advances C3.",
            tone: "neutral",
          }),
        };
      }
      return {
        ...state,
        phase: "ROUND_2_PLANNING",
        round: 2,
        selectedPriority: "balanced",
        candidates: [...state.candidates, { ...refinedCandidate, dimensions: { ...refinedCandidate.dimensions } }],
        plans: [...state.plans, ...roundTwoPlans.map((plan) => ({ ...plan }))],
        agents: {
          ...setAgents(state.agents, ["market", "product", "competitive"], { status: "Plan received", round: 2 }),
          orchestrator: { ...state.agents.orchestrator, status: "Replanning from evidence", round: 2 },
        },
        timeline: addTimeline(state, {
          label: "Balanced opportunity selected",
          detail: "C2 becomes C2-R; revised plans cite accepted findings and the user's priority.",
          tone: "coral",
        }),
        presenterStep: 4,
      };
    }

    case "RETURN_TO_BALANCED":
      if (state.phase !== "ALTERNATIVE_PRIORITY") return state;
      return demoReducer({ ...state, phase: "AWAITING_USER_PRIORITY" }, { type: "SELECT_PRIORITY", priority: "balanced" });

    case "DISPATCH_ROUND_2":
      if (state.phase !== "ROUND_2_PLANNING") return state;
      return {
        ...state,
        phase: "ROUND_2_WORKING",
        plans: state.plans.map((plan) => (plan.round === 2 ? { ...plan, status: "working" } : plan)),
        agents: {
          ...setAgents(state.agents, ["market", "product", "competitive"], { status: "Validating", round: 2 }),
          orchestrator: { ...state.agents.orchestrator, status: "Monitoring validation" },
        },
        timeline: addTimeline(state, {
          label: "Validation plans dispatched",
          detail: "Each plan carries a visible causal trace from Round 1 evidence.",
          tone: "coral",
        }),
      };

    case "REVEAL_ROUND_2":
      if (state.phase !== "ROUND_2_WORKING") return state;
      return {
        ...state,
        phase: "ROUND_2_REPORTS",
        reports: [...state.reports, ...roundTwoReports.map((report) => ({ ...report }))],
        revealedReportIds: [...state.revealedReportIds, ...roundTwoReports.map((report) => report.id)],
        agents: {
          ...setAgents(state.agents, ["market", "product", "competitive"], { status: "Complete", round: 2, findings: 1 }),
          orchestrator: { ...state.agents.orchestrator, status: "Converging" },
        },
        timeline: addTimeline(state, {
          label: "Validation reports accepted",
          detail: "All three specialists support C2-R; high-materiality contradictions are resolved.",
          tone: "coral",
        }),
      };

    case "REVEAL_RECOMMENDATION":
      if (state.phase !== "ROUND_2_REPORTS" && state.phase !== "FINAL_SYNTHESIS") return state;
      if (state.reports.filter((report) => report.round === 2 && report.status === "accepted").length !== 3) return state;
      return {
        ...state,
        phase: "RECOMMENDATION",
        recommendation: finalRecommendation,
        agents: {
          ...state.agents,
          orchestrator: { ...state.agents.orchestrator, status: "Recommendation ready" },
        },
        timeline: addTimeline(state, {
          label: "Decision converged",
          detail: "C2-R leads with a computed overall score of 74.",
          tone: "coral",
        }),
        presenterStep: 5,
      };

    case "OPEN_WHAT_IF":
      if (state.phase !== "RECOMMENDATION" && state.phase !== "WHAT_IF_RESULT") return state;
      return { ...state, phase: "WHAT_IF_SELECTION" };

    case "CANCEL_WHAT_IF":
      if (state.phase !== "WHAT_IF_SELECTION") return state;
      return { ...state, phase: "RECOMMENDATION" };

    case "CONFIRM_CONSTRAINT_CHANGE":
      if (state.phase !== "WHAT_IF_SELECTION") return state;
      return {
        ...state,
        phase: "WHAT_IF_REPLANNING",
        stateVersion: state.stateVersion + 1,
        market: "France",
        candidates: state.candidates.map((candidate) => ({ ...candidate, market: "France" })),
        plans: state.plans.map((plan) => ({ ...plan, status: "stale" })),
        reports: state.reports.map((report) => ({ ...report, status: "stale" })),
        recommendation: undefined,
        agents: {
          orchestrator: { status: "Replanning for France", round: 2, findings: 0 },
          market: { status: "Stale", round: 2, findings: 0 },
          product: { status: "Stale", round: 2, findings: 0 },
          competitive: { status: "Stale", round: 2, findings: 0 },
        },
        timeline: addTimeline(state, {
          label: "Locked market changed · v2",
          detail: "All Italy plans and reports are stale and removed from active scoring.",
          tone: "neutral",
        }),
        presenterStep: 6,
      };

    case "COMPLETE_WHAT_IF":
      if (state.phase !== "WHAT_IF_REPLANNING") return state;
      return {
        ...state,
        phase: "WHAT_IF_RESULT",
        agents: {
          orchestrator: { status: "Replan ready", round: 2, findings: 0 },
          market: { status: "New plan ready", round: 2, findings: 0 },
          product: { status: "New plan ready", round: 2, findings: 0 },
          competitive: { status: "New plan ready", round: 2, findings: 0 },
        },
        timeline: addTimeline(state, {
          label: "France plan set created",
          detail: "Resources and competitive context now reference the new locked market.",
          tone: "coral",
        }),
      };

    case "RESET_DEMO":
      return createInitialState();

    default:
      return state;
  }
}
