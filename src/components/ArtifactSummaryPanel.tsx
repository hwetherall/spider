import {
  ArrowUpRight,
  CircleAlert,
  FileCheck2,
  FileStack,
  FlaskConical,
  Link2,
  Sparkles,
} from "lucide-react";
import { agents } from "../data/agents";
import {
  alternativeRecommendations,
  conflictSummary,
  finalRecommendation,
  franceWhatIf,
  storyCopy,
} from "../data/scenario";
import { calculateWeightedScore } from "../domain/scoring";
import type { DemoState } from "../domain/types";

interface SummaryContent {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  icon: typeof FileStack;
  metrics: Array<{ label: string; value: string }>;
}

function getSummary(state: DemoState): SummaryContent {
  const latestRoundOneReport = state.reports.filter((report) => report.round === 1).at(-1);

  switch (state.phase) {
    case "INTRO":
      return {
        eyebrow: "Presentation overview",
        title: storyCopy.introTitle,
        description: storyCopy.introSummary,
        action: "Open system overview",
        icon: FileStack,
        metrics: [
          { label: "Agents", value: "4 linked" },
          { label: "Rounds", value: "2 guided" },
          { label: "Runtime", value: "Synthetic" },
        ],
      };
    case "BRIEF_REVIEW":
      return {
        eyebrow: "Orchestrator artifact",
        title: "Brief structured",
        description: "The venture is bounded by six fixed assumptions, four adjustable levers, and one principal score owned by each specialist.",
        action: "Review structured brief",
        icon: FileCheck2,
        metrics: [
          { label: "Assumptions", value: "6 fixed" },
          { label: "Levers", value: "4" },
          { label: "Scores", value: "3 owned" },
        ],
      };
    case "ROUND_1_PLANNING":
    case "ROUND_1_WORKING":
      return {
        eyebrow: "Round 1 plan set",
        title: "Three specialist assignments",
        description: storyCopy.planningSummary,
        action: "Open all plan packets",
        icon: FileStack,
        metrics: [
          { label: "Plans", value: "3 distinct" },
          { label: "Candidates", value: "C1–C3" },
          { label: "State", value: "v1" },
        ],
      };
    case "ROUND_1_REPORTS":
      return {
        eyebrow: "Accepted evidence",
        title: latestRoundOneReport ? `${agents[latestRoundOneReport.agentId].shortName} report ready` : "Report ready",
        description: latestRoundOneReport?.executiveSummary ?? "A specialist report has returned to the Orchestrator.",
        action: "Open report and implications",
        icon: FileCheck2,
        metrics: [
          { label: "Received", value: `${state.revealedReportIds.length} of 3` },
          { label: "Findings", value: `${latestRoundOneReport?.findings.length ?? 0}` },
          { label: "Confidence", value: latestRoundOneReport?.confidence ?? "—" },
        ],
      };
    case "ROUND_1_SYNTHESIS":
    case "AWAITING_USER_PRIORITY":
      return {
        eyebrow: "Cross-agent conflict",
        title: conflictSummary.title,
        description: conflictSummary.summary,
        action: state.phase === "AWAITING_USER_PRIORITY" ? "Open decision request" : "Open scorecard and conflict",
        icon: CircleAlert,
        metrics: [
          { label: "Leader", value: "C2 · 71" },
          { label: "Reports", value: "3 accepted" },
          { label: "Decision", value: "Required" },
        ],
      };
    case "ALTERNATIVE_PRIORITY": {
      const alternative = state.selectedPriority && state.selectedPriority !== "balanced"
        ? alternativeRecommendations[state.selectedPriority]
        : alternativeRecommendations.demand;
      return {
        eyebrow: "Alternative branch",
        title: alternative.title,
        description: alternative.summary,
        action: "Review trade-off",
        icon: CircleAlert,
        metrics: [
          { label: "Priority", value: state.selectedPriority ?? "—" },
          { label: "Branch", value: "Safe" },
          { label: "Round 2", value: "Not entered" },
        ],
      };
    }
    case "ROUND_2_PLANNING":
    case "ROUND_2_WORKING":
      return {
        eyebrow: "Causal plan set",
        title: "Evidence changed the next work",
        description: storyCopy.roundTwoSummary,
        action: "Open linked validation plans",
        icon: Link2,
        metrics: [
          { label: "Candidate", value: "C2-R" },
          { label: "Causal links", value: "11" },
          { label: "Round", value: "2" },
        ],
      };
    case "ROUND_2_REPORTS":
      return {
        eyebrow: "Validation synthesis",
        title: "The leading strategy converged",
        description: storyCopy.validationSummary,
        action: "Open validation evidence",
        icon: FileCheck2,
        metrics: [
          { label: "Market", value: "79" },
          { label: "Headroom", value: "61" },
          { label: "Feasibility", value: "86" },
        ],
      };
    case "RECOMMENDATION":
    case "WHAT_IF_SELECTION":
      return {
        eyebrow: "Recommended strategy",
        title: finalRecommendation.title,
        description: finalRecommendation.summary,
        action: "Open full recommendation",
        icon: Sparkles,
        metrics: [
          { label: "Overall", value: `${finalRecommendation.score}/100` },
          { label: "Confidence", value: "High" },
          { label: "Contradictions", value: "0 open" },
        ],
      };
    case "WHAT_IF_REPLANNING":
      return {
        eyebrow: "Dependency invalidation",
        title: "Italy evidence is now stale",
        description: "State v2 locks France. Previous plans and reports remain viewable, but no longer contribute to the active decision.",
        action: "Inspect stale-state replan",
        icon: FlaskConical,
        metrics: [
          { label: "State", value: "v2" },
          { label: "Stale reports", value: "6" },
          { label: "Market", value: "France" },
        ],
      };
    case "WHAT_IF_RESULT":
      return {
        eyebrow: "Accelerated what-if",
        title: "France changes the answer",
        description: franceWhatIf.summary,
        action: "Open France result",
        icon: FlaskConical,
        metrics: [
          { label: "Overall", value: `${calculateWeightedScore(franceWhatIf.dimensions)}/100` },
          { label: "Headroom", value: "39" },
          { label: "Prior work", value: "Stale" },
        ],
      };
    default:
      return {
        eyebrow: "Current artifact",
        title: "Decision system active",
        description: "Open the current artifact for full evidence and context.",
        action: "Open artifact",
        icon: FileStack,
        metrics: [],
      };
  }
}

export function ArtifactSummaryPanel({ state, onOpen }: { state: DemoState; onOpen: () => void }) {
  const summary = getSummary(state);
  const Icon = summary.icon;

  return (
    <aside className="artifact-summary-panel" aria-label="Current decision artifact summary">
      <div className="summary-artifact-icon"><Icon size={23} strokeWidth={1.7} /></div>
      <span className="eyebrow">{summary.eyebrow}</span>
      <h2>{summary.title}</h2>
      <p>{summary.description}</p>

      <div className="summary-metrics">
        {summary.metrics.map((metric) => (
          <div key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>
        ))}
      </div>

      <div className="summary-popup-note">
        <span>Focused view</span>
        <p>Open this artifact in a larger presentation popup for the complete evidence and decision context.</p>
      </div>

      <button className="artifact-open-button" type="button" onClick={onOpen}>
        {summary.action}<ArrowUpRight size={16} />
      </button>
    </aside>
  );
}
