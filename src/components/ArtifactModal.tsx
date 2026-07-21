import { Maximize2, X } from "lucide-react";
import { useEffect } from "react";
import type { DemoEvent, DemoState } from "../domain/types";
import { ArtifactPanel } from "./ArtifactPanel";

interface Props {
  open: boolean;
  state: DemoState;
  dispatch: React.Dispatch<DemoEvent>;
  onClose: () => void;
}

export function ArtifactModal({ open, state, dispatch, onClose }: Props) {
  const artifactKey = `${state.phase}:${state.revealedReportIds.length}:${state.selectedPriority ?? "none"}:${state.stateVersion}`;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="artifact-modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="artifact-modal" role="dialog" aria-modal="true" aria-labelledby="artifact-modal-title">
        <header className="artifact-modal-header">
          <div>
            <Maximize2 size={15} />
            <span id="artifact-modal-title">Focused decision artifact</span>
          </div>
          <span>R{state.round || "–"} · State v{state.stateVersion}</span>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close artifact popup"><X size={17} /></button>
        </header>
        <ArtifactPanel key={artifactKey} state={state} dispatch={dispatch} />
        <footer className="artifact-modal-footer">
          <span>Full evidence view · Return to the agent web to advance the presentation.</span>
          <button className="secondary-action" type="button" onClick={onClose}>Back to agent web</button>
        </footer>
      </section>
    </div>
  );
}
