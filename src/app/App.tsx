import { ArrowRight, FlaskConical, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { AgentDetailDrawer } from "../components/AgentDetailDrawer";
import { AgentNetwork } from "../components/AgentNetwork";
import { ArtifactModal } from "../components/ArtifactModal";
import { ArtifactSummaryPanel } from "../components/ArtifactSummaryPanel";
import { VentureRail } from "../components/VentureRail";
import type { AgentId, DemoPhase } from "../domain/types";
import { demoReducer } from "../state/demoReducer";
import { selectPrimaryAction } from "../state/demoSelectors";
import { createInitialState } from "../state/initialState";

const AUTO_POPUP_PHASES = new Set<DemoPhase>([
  "BRIEF_REVIEW",
  "ROUND_1_PLANNING",
  "ROUND_1_REPORTS",
  "ROUND_1_SYNTHESIS",
  "AWAITING_USER_PRIORITY",
  "ALTERNATIVE_PRIORITY",
  "ROUND_2_PLANNING",
  "ROUND_2_REPORTS",
  "RECOMMENDATION",
  "WHAT_IF_REPLANNING",
  "WHAT_IF_RESULT",
]);

export function App() {
  const [state, dispatch] = useReducer(demoReducer, undefined, createInitialState);
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
  const [artifactOpen, setArtifactOpen] = useState(false);
  const primaryAction = useMemo(() => selectPrimaryAction(state), [state]);
  const runPrimaryAction = useCallback(() => {
    if (primaryAction) dispatch(primaryAction.event);
  }, [primaryAction]);

  useEffect(() => {
    const handlePresenterKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInteractive = target?.closest("button, a, input, select, textarea, [role='dialog']");
      if (!isInteractive && (event.key === " " || event.key === "ArrowRight") && primaryAction) {
        event.preventDefault();
        runPrimaryAction();
      }
    };
    window.addEventListener("keydown", handlePresenterKey);
    return () => window.removeEventListener("keydown", handlePresenterKey);
  }, [primaryAction, runPrimaryAction]);

  useEffect(() => {
    setArtifactOpen(AUTO_POPUP_PHASES.has(state.phase));
  }, [state.phase, state.revealedReportIds.length, state.selectedPriority, state.stateVersion]);

  const isWhatIfDialog = state.phase === "WHAT_IF_SELECTION";

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-block" aria-label="Innovera">
          <div className="brand-symbol" aria-hidden="true"><span /><span /><span /></div>
          <span>INNOVERA</span>
        </div>
        <div className="project-title"><strong>European Coffee Entry</strong><span>Linked Agent Decision System</span></div>
        <div className="header-meta">
          <span className="synthetic-badge"><FlaskConical size={13} /> Synthetic demonstration</span>
          <span className="round-badge">R{state.round || "–"} · v{state.stateVersion}</span>
          <button className="reset-button" type="button" onClick={() => dispatch({ type: "RESET_DEMO" })}><RotateCcw size={14} /> Reset</button>
        </div>
      </header>

      <main className="workspace">
        <VentureRail state={state} />
        <div className="center-column">
          <AgentNetwork state={state} onSelectAgent={setSelectedAgent} />
          <ActivityTimeline events={state.timeline} />
        </div>
        <ArtifactSummaryPanel state={state} onOpen={() => setArtifactOpen(true)} />
      </main>

      <footer className="presenter-bar">
        <div className="presenter-hint"><span>Presenter control</span><small>Space or → advances</small></div>
        <div className="presenter-context"><i /><span>{state.agents.orchestrator.status}</span></div>
        {primaryAction ? (
          <button className="primary-action" type="button" onClick={runPrimaryAction}>{primaryAction.label}<ArrowRight size={16} /></button>
        ) : (
          <span className="presenter-paused">
            {state.phase === "AWAITING_USER_PRIORITY"
              ? "Choose an option in the decision panel"
              : state.phase === "WHAT_IF_RESULT"
                ? "What-if complete · Reset to replay"
                : "Presenter paused"}
          </span>
        )}
      </footer>

      <div className="sr-live" aria-live="polite">Current phase: {state.phase.replaceAll("_", " ").toLowerCase()}</div>
      <ArtifactModal open={artifactOpen} state={state} dispatch={dispatch} onClose={() => setArtifactOpen(false)} />
      <AgentDetailDrawer agentId={selectedAgent} state={state} onClose={() => setSelectedAgent(null)} />

      {isWhatIfDialog && (
        <div className="dialog-layer" role="presentation">
          <section className="constraint-dialog" role="dialog" aria-modal="true" aria-labelledby="constraint-dialog-title">
            <button className="icon-button dialog-close" onClick={() => dispatch({ type: "CANCEL_WHAT_IF" })} aria-label="Close market change dialog"><X size={17} /></button>
            <span className="dialog-icon"><FlaskConical size={20} /></span>
            <span className="eyebrow">Locked constraint change</span>
            <h2 id="constraint-dialog-title">Change Italy to France?</h2>
            <p>Italy is locked in state v1. Confirming this change creates state v2 and marks every Italy plan, report, and score stale.</p>
            <div className="change-preview"><span>ITALY · v1</span><ArrowRight size={16} /><strong>FRANCE · v2</strong></div>
            <div className="dialog-actions">
              <button className="secondary-action" onClick={() => dispatch({ type: "CANCEL_WHAT_IF" })}>Keep Italy</button>
              <button className="primary-action" onClick={() => dispatch({ type: "CONFIRM_CONSTRAINT_CHANGE" })}>Confirm & replan <ArrowRight size={15} /></button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
