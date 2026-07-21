export type AgentId = "orchestrator" | "market" | "product" | "competitive";
export type SpecialistId = Exclude<AgentId, "orchestrator">;
export type Confidence = "low" | "medium" | "high";
export type Priority = "balanced" | "demand" | "whitespace";

export type DemoPhase =
  | "INTRO"
  | "BRIEF_REVIEW"
  | "ROUND_1_PLANNING"
  | "ROUND_1_WORKING"
  | "ROUND_1_REPORTS"
  | "ROUND_1_SYNTHESIS"
  | "AWAITING_USER_PRIORITY"
  | "ALTERNATIVE_PRIORITY"
  | "ROUND_2_PLANNING"
  | "ROUND_2_WORKING"
  | "ROUND_2_REPORTS"
  | "FINAL_SYNTHESIS"
  | "RECOMMENDATION"
  | "WHAT_IF_SELECTION"
  | "WHAT_IF_REPLANNING"
  | "WHAT_IF_RESULT";

export type DemoEvent =
  | { type: "START_DEMO" }
  | { type: "CONFIRM_BRIEF" }
  | { type: "DISPATCH_ROUND_1" }
  | { type: "REVEAL_NEXT_REPORT" }
  | { type: "SYNTHESIZE_ROUND_1" }
  | { type: "SELECT_PRIORITY"; priority: Priority }
  | { type: "RETURN_TO_BALANCED" }
  | { type: "DISPATCH_ROUND_2" }
  | { type: "REVEAL_ROUND_2" }
  | { type: "REVEAL_RECOMMENDATION" }
  | { type: "OPEN_WHAT_IF" }
  | { type: "CANCEL_WHAT_IF" }
  | { type: "CONFIRM_CONSTRAINT_CHANGE" }
  | { type: "COMPLETE_WHAT_IF" }
  | { type: "RESET_DEMO" };

export interface CausalReference {
  type: "user-constraint" | "user-answer" | "agent-finding" | "orchestrator-decision";
  id: string;
  label: string;
}

export interface AgentPlan {
  id: string;
  round: 1 | 2;
  stateVersion: number;
  agentId: SpecialistId;
  title: string;
  objective: string;
  contextSummary: string;
  candidateIds: string[];
  lockedConstraints: string[];
  researchQuestions: string[];
  requiredCapabilities: string[];
  requiredResources: string[];
  requiredOutputs: string[];
  completionCriteria: string[];
  triggeredBy: CausalReference[];
  status: "drafted" | "sent" | "working" | "complete" | "stale";
}

export interface Finding {
  id: string;
  candidateId?: string;
  title: string;
  detail: string;
  confidence: Confidence;
  resourceIds: string[];
}

export interface AgentImplication {
  id: string;
  sourceFindingId: string;
  targetAgentId: SpecialistId | "orchestrator";
  message: string;
  materiality: "low" | "medium" | "high";
}

export interface CandidateScore {
  candidateId: string;
  score: number;
}

export interface AgentReport {
  id: string;
  planId: string;
  agentId: SpecialistId;
  round: 1 | 2;
  stateVersion: number;
  executiveSummary: string;
  candidateScores: CandidateScore[];
  findings: Finding[];
  risks: string[];
  assumptions: string[];
  implications: AgentImplication[];
  proposedFollowUps: string[];
  confidence: Confidence;
  resourcesUsed: string[];
  status: "received" | "accepted" | "stale";
}

export interface AgentManifest {
  id: AgentId;
  name: string;
  shortName: string;
  role: string;
  charter: string;
  capabilities: string[];
  resources: string[];
  accent: string;
}

export interface CandidateDimensions {
  market?: number;
  competitive?: number;
  product?: number;
}

export interface Candidate {
  id: string;
  name: string;
  market: string;
  roast: string;
  format: string;
  pack?: string;
  position: string;
  dimensions: CandidateDimensions;
}

export interface Recommendation {
  candidateId: string;
  title: string;
  summary: string;
  score: number;
  dimensions: Required<CandidateDimensions>;
  reasons: string[];
  confidence: string;
}

export interface TimelineEvent {
  id: string;
  label: string;
  detail: string;
  tone: "coral" | "market" | "product" | "competitive" | "neutral";
}

export interface AgentRuntimeState {
  status: string;
  round: 0 | 1 | 2;
  findings: number;
}

export interface DemoState {
  phase: DemoPhase;
  stateVersion: number;
  round: 0 | 1 | 2;
  market: "Italy" | "France";
  candidates: Candidate[];
  agents: Record<AgentId, AgentRuntimeState>;
  plans: AgentPlan[];
  reports: AgentReport[];
  revealedReportIds: string[];
  selectedPriority?: Priority;
  recommendation?: Recommendation;
  timeline: TimelineEvent[];
  presenterStep: number;
}
