import { Boxes, Crosshair, Globe2, Layers3, Network } from "lucide-react";
import { agents } from "../data/agents";
import type { AgentId, DemoPhase, DemoState } from "../domain/types";

const iconMap = {
  orchestrator: Network,
  market: Globe2,
  product: Layers3,
  competitive: Crosshair,
} as const;

const positions: Record<AgentId, string> = {
  market: "node-market",
  product: "node-product",
  competitive: "node-competitive",
  orchestrator: "node-orchestrator",
};

function isOutbound(phase: DemoPhase) {
  return phase === "ROUND_1_WORKING" || phase === "ROUND_2_WORKING" || phase === "WHAT_IF_REPLANNING";
}

function isInbound(phase: DemoPhase) {
  return phase === "ROUND_1_REPORTS" || phase === "ROUND_1_SYNTHESIS" || phase === "ROUND_2_REPORTS";
}

interface Props {
  state: DemoState;
  onSelectAgent: (id: AgentId) => void;
}

export function AgentNetwork({ state, onSelectAgent }: Props) {
  const outbound = isOutbound(state.phase);
  const inbound = isInbound(state.phase);
  const activeFlow = outbound || inbound;

  return (
    <section className={`network-canvas ${state.phase === "RECOMMENDATION" ? "is-converged" : ""}`} aria-label="Linked agent network">
      <div className="network-heading">
        <div>
          <span className="eyebrow eyebrow-dark"><Boxes size={12} /> Agent web</span>
          <h2>One decision system</h2>
        </div>
        <span className={`network-mode ${activeFlow ? "is-live" : ""}`}>
          <span />{outbound ? "Plans outbound" : inbound ? "Evidence inbound" : state.phase === "RECOMMENDATION" ? "Converged" : "Shared state active"}
        </span>
      </div>

      <div className="network-stage">
        <svg className="connections" viewBox="0 0 760 430" aria-hidden="true" preserveAspectRatio="none">
          <path d="M380 320 C300 260 170 250 122 158" />
          <path d="M380 320 C380 250 380 220 380 158" />
          <path d="M380 320 C460 260 590 250 638 158" />
        </svg>

        {(["market", "product", "competitive", "orchestrator"] as AgentId[]).map((id) => {
          const manifest = agents[id];
          const runtime = state.agents[id];
          const Icon = iconMap[id];
          return (
            <button
              className={`agent-node ${positions[id]} agent-${manifest.accent} ${runtime.status === "Stale" ? "is-stale" : ""}`}
              key={id}
              onClick={() => onSelectAgent(id)}
              aria-label={`Open ${manifest.name} details`}
              type="button"
            >
              <span className="agent-icon"><Icon size={id === "orchestrator" ? 24 : 20} strokeWidth={1.8} /></span>
              <span className="agent-copy">
                <strong>{manifest.shortName}</strong>
                <small>{manifest.role}</small>
              </span>
              <span className="agent-status"><i /> {runtime.status}</span>
              <span className="agent-meta">R{runtime.round || "–"} · {runtime.findings} findings</span>
            </button>
          );
        })}

        {activeFlow && (["market", "product", "competitive"] as const).map((id, index) => (
          <span
            key={`${id}-${state.phase}`}
            className={`message-pulse pulse-${id} ${outbound ? "outbound" : "inbound"}`}
            style={{ "--pulse-delay": `${index * 120}ms` } as React.CSSProperties}
            aria-hidden="true"
          >
            {outbound ? "PLAN" : "REPORT"}
          </span>
        ))}
      </div>

      <div className="network-legend" aria-label="Network legend">
        <span><i className="legend-plan" /> Plan</span>
        <span><i className="legend-report" /> Report</span>
        <span><i className="legend-state" /> Canonical state v{state.stateVersion}</span>
      </div>
    </section>
  );
}
