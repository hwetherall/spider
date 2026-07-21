import { Check, ChevronRight, LockKeyhole, SlidersHorizontal } from "lucide-react";
import { constraintGroups, presentationSteps, ventureBrief } from "../data/scenario";
import { calculateWeightedScore } from "../domain/scoring";
import type { DemoState } from "../domain/types";

export function VentureRail({ state }: { state: DemoState }) {
  const candidatesVisible = state.phase !== "INTRO" && state.phase !== "BRIEF_REVIEW";
  const activeCandidates = state.candidates.filter((candidate) => candidate.id !== "C2-R" || state.round === 2);

  return (
    <aside className="venture-rail" aria-label="Canonical venture state">
      <section className="rail-section rail-brief">
        <div className="section-heading">
          <span className="eyebrow"><SlidersHorizontal size={12} /> Venture state</span>
          <span className="version-chip">v{state.stateVersion}</span>
        </div>
        <p>{ventureBrief}</p>
      </section>

      <section className="rail-section constraints-section">
        <span className="section-label">Locked constraints</span>
        <div className="chip-stack">
          {constraintGroups.locked.map((item, index) => (
            <span className={`constraint-chip locked ${index === 0 && state.market === "France" ? "changed" : ""}`} key={item}>
              <LockKeyhole size={11} />{index === 0 ? `Target market · ${state.market}` : item}
            </span>
          ))}
        </div>
        <details className="constraint-details">
          <summary>Preferences & open decisions <ChevronRight size={13} /></summary>
          <span className="section-label">Soft preferences</span>
          <div className="chip-stack compact">
            {constraintGroups.preferences.map((item) => <span className="constraint-chip preference" key={item}>{item}</span>)}
          </div>
          <span className="section-label">Open decisions</span>
          <div className="chip-stack compact">
            {constraintGroups.open.map((item) => <span className="constraint-chip open" key={item}>{item}</span>)}
          </div>
        </details>
      </section>

      {candidatesVisible && (
        <section className="rail-section candidate-section">
          <span className="section-label">Candidate registry</span>
          <div className="candidate-mini-list">
            {activeCandidates.map((candidate) => {
              const score = calculateWeightedScore(candidate.dimensions);
              const isLead = candidate.id === "C2-R" || (state.round < 2 && candidate.id === "C2");
              return (
                <div className={`candidate-mini ${isLead ? "is-lead" : ""} ${state.market === "France" ? "is-stale" : ""}`} key={candidate.id}>
                  <span className="candidate-id">{candidate.id}</span>
                  <div><strong>{candidate.name}</strong><small>{candidate.roast} · {candidate.format}</small></div>
                  <span className="mini-score">{state.market === "France" ? "STALE" : score ?? "–"}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="rail-section progress-section">
        <span className="section-label">Guided demo</span>
        <ol className="progress-list">
          {presentationSteps.map((step, index) => (
            <li className={index < state.presenterStep ? "is-done" : index === state.presenterStep ? "is-active" : ""} key={step}>
              <span>{index < state.presenterStep ? <Check size={11} /> : index + 1}</span>{step}
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
