import { Crosshair, Globe2, Layers3, Network, X } from "lucide-react";
import { useEffect } from "react";
import { agents } from "../data/agents";
import type { AgentId, DemoState } from "../domain/types";

const icons = { orchestrator: Network, market: Globe2, product: Layers3, competitive: Crosshair };

interface Props {
  agentId: AgentId | null;
  state: DemoState;
  onClose: () => void;
}

export function AgentDetailDrawer({ agentId, state, onClose }: Props) {
  useEffect(() => {
    if (!agentId) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [agentId, onClose]);

  if (!agentId) return null;
  const agent = agents[agentId];
  const Icon = icons[agentId];
  const plans = state.plans.filter((plan) => plan.agentId === agentId);
  const reports = state.reports.filter((report) => report.agentId === agentId);
  const latestReport = reports.at(-1);

  return (
    <div className="drawer-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="agent-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <button className="icon-button drawer-close" onClick={onClose} aria-label="Close agent details"><X size={17} /></button>
        <div className={`drawer-agent-icon accent-${agent.accent}`}><Icon size={24} /></div>
        <span className="eyebrow">Permanent charter</span>
        <h2 id="drawer-title">{agent.name}</h2>
        <p className="drawer-charter">{agent.charter}</p>

        <div className="drawer-runtime">
          <div><span>Status</span><strong>{state.agents[agentId].status}</strong></div>
          <div><span>Round</span><strong>{state.agents[agentId].round || "—"}</strong></div>
          <div><span>Plans</span><strong>{plans.length}</strong></div>
          <div><span>Reports</span><strong>{reports.length}</strong></div>
        </div>

        <section className="drawer-section">
          <h3>Capabilities</h3>
          <div className="capability-list">{agent.capabilities.map((item) => <span key={item}>{item}</span>)}</div>
        </section>
        <section className="drawer-section">
          <h3>Resources</h3>
          <ul>{agent.resources.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        {plans.at(-1) && (
          <section className="drawer-section drawer-artifact">
            <span className="artifact-type">Latest plan · R{plans.at(-1)!.round}</span>
            <h3>{plans.at(-1)!.title}</h3>
            <p>{plans.at(-1)!.objective}</p>
          </section>
        )}
        {latestReport && (
          <section className={`drawer-section drawer-artifact ${latestReport.status === "stale" ? "is-stale" : ""}`}>
            <span className="artifact-type">Latest report · {latestReport.confidence} confidence</span>
            <p>{latestReport.executiveSummary}</p>
            {latestReport.findings.map((finding) => <div className="drawer-finding" key={finding.id}><strong>{finding.id} · {finding.title}</strong><span>{finding.detail}</span></div>)}
          </section>
        )}
      </aside>
    </div>
  );
}
