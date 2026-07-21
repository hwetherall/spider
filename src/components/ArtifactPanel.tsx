import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleAlert,
  FileSearch,
  Gauge,
  Link2,
  LockKeyhole,
  MapPin,
  PackageCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import { agents } from "../data/agents";
import {
  alternativeRecommendations,
  conflictSummary,
  finalRecommendation,
  franceWhatIf,
  priorities,
  roundOnePlans,
  roundTwoPlans,
  storyCopy,
  ventureProfile,
} from "../data/scenario";
import { calculateWeightedScore } from "../domain/scoring";
import type { AgentPlan, DemoEvent, DemoState, Finding, SpecialistId } from "../domain/types";

const specialistOrder: SpecialistId[] = ["market", "product", "competitive"];

function PanelHeader({ eyebrow, title, meta }: { eyebrow: string; title: string; meta?: string }) {
  return (
    <div className="artifact-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {meta && <span className="artifact-meta">{meta}</span>}
    </div>
  );
}

function PlanView({ plan, onFinding }: { plan: AgentPlan; onFinding?: (id: string) => void }) {
  return (
    <article className={`plan-card accent-${agents[plan.agentId].accent}`}>
      <div className="plan-card-top">
        <span className="artifact-type">Plan packet · R{plan.round}</span>
        <span className="packet-id">{plan.id}</span>
      </div>
      <h3>{plan.title}</h3>
      <p className="plan-objective">{plan.objective}</p>
      <div className="plan-candidates">{plan.candidateIds.map((id) => <span key={id}>{id}</span>)}</div>

      {plan.triggeredBy.length > 0 && plan.round === 2 && (
        <section className="causal-section">
          <h4><Link2 size={13} /> Why this plan changed</h4>
          <div className="causal-chips">
            {plan.triggeredBy.map((trigger) => (
              <button key={trigger.id} type="button" onClick={() => onFinding?.(trigger.id)}>{trigger.label}</button>
            ))}
          </div>
        </section>
      )}

      <section className="plan-detail">
        <h4>Research questions</h4>
        <ul>{plan.researchQuestions.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="plan-request-grid">
        <div><span>Capabilities</span>{plan.requiredCapabilities.map((item) => <small key={item}>{item}</small>)}</div>
        <div><span>Resources</span>{plan.requiredResources.map((item) => <small key={item}>{item}</small>)}</div>
      </section>
      <div className="expected-output"><ArrowDownRight size={14} /><span><strong>Expected output</strong>{plan.requiredOutputs.join(" · ")}</span></div>
    </article>
  );
}

function PlanDeck({ plans, onFinding }: { plans: AgentPlan[]; onFinding?: (id: string) => void }) {
  const [active, setActive] = useState<SpecialistId>("market");
  const plan = plans.find((item) => item.agentId === active) ?? plans[0];
  return (
    <>
      <div className="artifact-tabs" role="tablist" aria-label="Specialist plans">
        {specialistOrder.map((id) => (
          <button key={id} role="tab" aria-selected={active === id} className={active === id ? "is-active" : ""} onClick={() => setActive(id)}>
            <i className={`dot-${agents[id].accent}`} />{agents[id].shortName}
          </button>
        ))}
      </div>
      {plan && <PlanView plan={plan} onFinding={onFinding} />}
    </>
  );
}

function ReportView({ report }: { report: DemoState["reports"][number] }) {
  return (
    <article className={`report-card accent-${agents[report.agentId].accent} ${report.status === "stale" ? "is-stale" : ""}`}>
      <div className="report-top">
        <span className="report-agent"><i />{agents[report.agentId].name}</span>
        <span className="confidence-chip">{report.confidence} confidence</span>
      </div>
      <p className="report-summary">{report.executiveSummary}</p>
      <div className="report-findings">
        {report.findings.map((finding) => (
          <article className="finding-card" id={`finding-${finding.id}`} key={finding.id}>
            <span>{finding.id}</span>
            <div><strong>{finding.title}</strong><p>{finding.detail}</p></div>
          </article>
        ))}
      </div>
      {report.implications[0] && (
        <div className="implication-card">
          <ArrowRight size={14} />
          <div><span>Implication for {agents[report.implications[0].targetAgentId].shortName}</span><p>{report.implications[0].message}</p></div>
        </div>
      )}
      <div className="resources-used"><FileSearch size={13} /><span>{report.resourcesUsed.join(" · ")}</span></div>
    </article>
  );
}

function ScoreComparison({ state }: { state: DemoState }) {
  return (
    <div className="score-comparison">
      <div className="score-head score-row"><span>Candidate</span><span>Market</span><span>Headroom</span><span>Feasible</span><span>Total</span></div>
      {state.candidates.filter((item) => item.id !== "C2-R").map((candidate) => (
        <div className={`score-row ${candidate.id === "C2" ? "is-leading" : ""}`} key={candidate.id}>
          <span><i>{candidate.id}</i><strong>{candidate.name}</strong></span>
          <span>{candidate.dimensions.market}</span>
          <span>{candidate.dimensions.competitive}</span>
          <span>{candidate.dimensions.product}</span>
          <span className="weighted-score">{calculateWeightedScore(candidate.dimensions)}</span>
        </div>
      ))}
      <p className="score-formula">45% market fit · 35% competitive headroom · 20% product feasibility</p>
    </div>
  );
}

function PriorityDecision({ dispatch }: { dispatch: React.Dispatch<DemoEvent> }) {
  return (
    <div className="decision-card">
      <div className="decision-reason"><CircleAlert size={16} /><span>One user priority is needed because the specialists disagree on what “strongest” means.</span></div>
      <h3>What should the first launch prioritize?</h3>
      <div className="priority-options">
        {priorities.map((priority) => (
          <button key={priority.id} type="button" className={priority.id === "balanced" ? "recommended" : ""} onClick={() => dispatch({ type: "SELECT_PRIORITY", priority: priority.id })}>
            <span className="option-radio" />
            <span><strong>{priority.title}</strong><small>{priority.description}</small></span>
            {priority.badge && <em>{priority.badge}</em>}
          </button>
        ))}
      </div>
    </div>
  );
}

function FindingSpotlight({ finding }: { finding: Finding | null }) {
  if (!finding) return null;
  return (
    <div className="finding-spotlight" role="status">
      <span>{finding.id} · Source finding</span>
      <strong>{finding.title}</strong>
      <p>{finding.detail}</p>
    </div>
  );
}

function RecommendationView() {
  const recommendation = finalRecommendation;
  return (
    <article className="recommendation-card">
      <div className="recommendation-kicker"><Sparkles size={14} /> Recommended entry strategy</div>
      <h2>{recommendation.title}</h2>
      <p className="recommendation-summary">{recommendation.summary}</p>
      <div className="recommendation-score">
        <div className="score-orbit"><strong>{recommendation.score}</strong><span>/100</span></div>
        <div className="dimension-list">
          <div><span>Market fit</span><strong>{recommendation.dimensions.market}</strong></div>
          <div><span>Competitive headroom</span><strong>{recommendation.dimensions.competitive}</strong></div>
          <div><span>Product feasibility</span><strong>{recommendation.dimensions.product}</strong></div>
        </div>
      </div>
      <section className="why-won">
        <h3>Why this won</h3>
        {recommendation.reasons.map((reason) => <p key={reason}><Check size={13} />{reason}</p>)}
      </section>
      <div className="confidence-banner"><BadgeCheck size={16} /><span><strong>Confidence</strong>{recommendation.confidence}</span></div>
    </article>
  );
}

function FranceResult({ replanning }: { replanning: boolean }) {
  const score = calculateWeightedScore(franceWhatIf.dimensions)!;
  if (replanning) {
    return (
      <div className="replanning-card">
        <div className="replan-spinner"><span /><span /><span /></div>
        <span className="eyebrow">Dependency invalidation</span>
        <h2>Replanning for France</h2>
        <p>Italy work remains visible in history, but no stale plan or report contributes to the active score.</p>
        <div className="stale-summary"><LockKeyhole size={14} /><span>State v2 · France locked</span><strong>6 reports stale</strong></div>
      </div>
    );
  }
  return (
    <article className="france-result">
      <span className="eyebrow"><MapPin size={12} /> Accelerated what-if · State v2</span>
      <h2>France changes the answer.</h2>
      <p>{franceWhatIf.summary}</p>
      <div className="france-score-grid">
        <div><span>Market fit</span><strong>{franceWhatIf.dimensions.market}</strong></div>
        <div><span>Headroom</span><strong>{franceWhatIf.dimensions.competitive}</strong></div>
        <div><span>Feasibility</span><strong>{franceWhatIf.dimensions.product}</strong></div>
        <div className="total"><span>Weighted</span><strong>{score}</strong></div>
      </div>
      <div className="invalid-banner"><CircleAlert size={15} /> Italian recommendation · Not valid for this state</div>
      <section className="france-resources"><h3>Replanned evidence set</h3>{franceWhatIf.resources.map((resource) => <span key={resource}>{resource}</span>)}</section>
    </article>
  );
}

interface Props {
  state: DemoState;
  dispatch: React.Dispatch<DemoEvent>;
}

export function ArtifactPanel({ state, dispatch }: Props) {
  const [focusedFindingId, setFocusedFindingId] = useState<string | null>(null);
  const focusedFinding = useMemo(() => {
    if (!focusedFindingId) return null;
    return state.reports.flatMap((report) => report.findings).find((finding) => finding.id === focusedFindingId) ?? null;
  }, [focusedFindingId, state.reports]);
  const latestReport = state.reports.filter((report) => report.round === 1).at(-1);

  return (
    <div className="artifact-panel" aria-label="Current decision artifact">
      {state.phase === "INTRO" && (
        <div className="intro-artifact">
          <div className="intro-mark"><span>4</span><small>linked agents</small></div>
          <span className="eyebrow">Innovera prototype</span>
          <h1>{storyCopy.introTitle}</h1>
          <h2>{storyCopy.introSubtitle}</h2>
          <p>{storyCopy.introSummary}</p>
          <div className="intro-proof"><span><Target size={15} /> Shared candidates</span><span><Link2 size={15} /> Causal plans</span><span><Gauge size={15} /> One decision</span></div>
        </div>
      )}

      {state.phase === "BRIEF_REVIEW" && (
        <>
          <PanelHeader eyebrow="Orchestrator artifact" title="Structured venture brief" meta="State v1" />
          <div className="brief-artifact-card">
            <div className="brief-status"><span className="status-check"><Check size={14} /></span><div><strong>Venture scope established</strong><span>Ready to create comparable candidates without leaving the packaged-coffee brief</span></div></div>
            <p className="venture-overview">{ventureProfile.overview}</p>
            <div className="classification-grid">
              <div><span>6</span><small>fixed assumptions</small></div>
              <div><span>4</span><small>adjustable levers</small></div>
              <div><span>3</span><small>specialist scores</small></div>
            </div>
            <div className="brief-document-grid">
              <div className="brief-document-column">
                <section className="brief-document-section">
                  <h3>Fixed assumptions</h3>
                  <div className="fixed-assumption-list">
                    {ventureProfile.fixedAssumptions.map((assumption) => <p key={assumption}><Check size={12} />{assumption}</p>)}
                  </div>
                </section>
                <section className="scope-rationale">
                  <span>Why these boundaries matter</span>
                  <p>{ventureProfile.scopeRationale}</p>
                </section>
              </div>

              <div className="brief-document-column">
                <section className="brief-document-section">
                  <h3>Adjustable levers</h3>
                  <div className="lever-table">
                    <div className="lever-table-head"><span>Lever</span><span>Options</span></div>
                    {ventureProfile.adjustableLevers.map((item) => <div className="lever-table-row" key={item.lever}><strong>{item.lever}</strong><span>{item.options}</span></div>)}
                  </div>
                </section>
                <section className="brief-document-section score-ownership-section">
                  <h3>Principal score by agent</h3>
                  <div className="score-ownership-list">
                    {ventureProfile.agentScoreOutputs.map((item) => (
                      <div className={`score-ownership-item accent-${agents[item.agentId].accent}`} key={item.agentId}>
                        <span>{item.agent}</span><strong>{item.score}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </>
      )}

      {(state.phase === "ROUND_1_PLANNING" || state.phase === "ROUND_1_WORKING") && (
        <>
          <PanelHeader eyebrow="Orchestrator plan set" title="Three distinct assignments" meta="Round 1 · State v1" />
          <p className="panel-intro">{storyCopy.planningSummary}</p>
          <PlanDeck plans={roundOnePlans} />
        </>
      )}

      {state.phase === "ROUND_1_REPORTS" && latestReport && (
        <>
          <PanelHeader eyebrow="Accepted evidence" title={`${agents[latestReport.agentId].shortName} report`} meta={`Report ${state.revealedReportIds.length} of 3`} />
          <ReportView report={latestReport} />
        </>
      )}

      {state.phase === "ROUND_1_SYNTHESIS" && (
        <>
          <PanelHeader eyebrow="Cross-agent synthesis" title={conflictSummary.title} meta="3 reports accepted" />
          <div className="conflict-card"><CircleAlert size={17} /><p>{conflictSummary.summary}</p></div>
          <ScoreComparison state={state} />
        </>
      )}

      {state.phase === "AWAITING_USER_PRIORITY" && (
        <>
          <PanelHeader eyebrow="Material user decision" title="Choose the objective" meta="Orchestrator paused" />
          <div className="conflict-card"><CircleAlert size={17} /><p>{conflictSummary.summary}</p></div>
          <ScoreComparison state={state} />
          <PriorityDecision dispatch={dispatch} />
        </>
      )}

      {state.phase === "ALTERNATIVE_PRIORITY" && state.selectedPriority && state.selectedPriority !== "balanced" && (
        <>
          <PanelHeader eyebrow="Safe alternative branch" title={alternativeRecommendations[state.selectedPriority].title} />
          <div className="alternative-card"><p>{alternativeRecommendations[state.selectedPriority].summary}</p><button className="secondary-action" onClick={() => dispatch({ type: "RETURN_TO_BALANCED" })}>Return to recommended guided path <ArrowRight size={14} /></button></div>
        </>
      )}

      {(state.phase === "ROUND_2_PLANNING" || state.phase === "ROUND_2_WORKING") && (
        <>
          <PanelHeader eyebrow="Revised plan set" title="Evidence changed the next work" meta="Round 2 · C2-R" />
          <p className="panel-intro">{storyCopy.roundTwoSummary}</p>
          <FindingSpotlight finding={focusedFinding} />
          <PlanDeck plans={roundTwoPlans} onFinding={setFocusedFindingId} />
        </>
      )}

      {state.phase === "ROUND_2_REPORTS" && (
        <>
          <PanelHeader eyebrow="Validation synthesis" title="The leading strategy converged" meta="3 focused reports accepted" />
          <p className="panel-intro">{storyCopy.validationSummary}</p>
          <div className="validation-list">
            {state.reports.filter((report) => report.round === 2).map((report) => (
              <article key={report.id} className={`validation-item accent-${agents[report.agentId].accent}`}>
                <span>{agents[report.agentId].shortName}</span><strong>{report.candidateScores[0].score}</strong><p>{report.executiveSummary}</p>
              </article>
            ))}
          </div>
          <div className="resolved-banner"><PackageCheck size={16} /><span><strong>Contradictions resolved</strong>{conflictSummary.resolved}</span></div>
        </>
      )}

      {(state.phase === "RECOMMENDATION" || state.phase === "WHAT_IF_SELECTION") && <RecommendationView />}
      {state.phase === "WHAT_IF_REPLANNING" && <FranceResult replanning />}
      {state.phase === "WHAT_IF_RESULT" && <FranceResult replanning={false} />}
    </div>
  );
}
