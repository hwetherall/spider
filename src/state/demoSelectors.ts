import { reportOrder } from "../data/scenario";
import type { DemoEvent, DemoState } from "../domain/types";

interface PrimaryAction {
  label: string;
  event: DemoEvent;
}

export function selectPrimaryAction(state: DemoState): PrimaryAction | null {
  switch (state.phase) {
    case "INTRO": return { label: "Begin analysis", event: { type: "START_DEMO" } };
    case "BRIEF_REVIEW": return { label: "Confirm brief", event: { type: "CONFIRM_BRIEF" } };
    case "ROUND_1_PLANNING": return { label: "Run first research round", event: { type: "DISPATCH_ROUND_1" } };
    case "ROUND_1_WORKING":
    case "ROUND_1_REPORTS": {
      const next = reportOrder[state.revealedReportIds.length];
      return next
        ? { label: `Review ${next} report`, event: { type: "REVEAL_NEXT_REPORT" } }
        : { label: "Synthesize findings", event: { type: "SYNTHESIZE_ROUND_1" } };
    }
    case "ROUND_1_SYNTHESIS": return { label: "Request strategic priority", event: { type: "SYNTHESIZE_ROUND_1" } };
    case "ROUND_2_PLANNING": return { label: "Validate leading strategy", event: { type: "DISPATCH_ROUND_2" } };
    case "ROUND_2_WORKING": return { label: "Review validation findings", event: { type: "REVEAL_ROUND_2" } };
    case "ROUND_2_REPORTS": return { label: "Reveal recommendation", event: { type: "REVEAL_RECOMMENDATION" } };
    case "RECOMMENDATION": return { label: "Explore a market change", event: { type: "OPEN_WHAT_IF" } };
    case "WHAT_IF_REPLANNING": return { label: "Show accelerated France result", event: { type: "COMPLETE_WHAT_IF" } };
    default: return null;
  }
}

export function activeRoundReports(state: DemoState) {
  return state.reports.filter((report) => report.stateVersion === state.stateVersion && report.status !== "stale");
}
