import type { AgentPlan, AgentReport } from "./types";

export function validateReport(report: AgentReport, plan: AgentPlan, currentVersion: number): string[] {
  const errors: string[] = [];
  if (report.stateVersion !== currentVersion) errors.push("Report state version is stale.");
  if (report.planId !== plan.id) errors.push("Report does not match its plan.");
  const assigned = new Set(plan.candidateIds);
  if (report.candidateScores.some((score) => !assigned.has(score.candidateId))) {
    errors.push("Report scored a candidate outside its assignment.");
  }
  if (plan.round === 2 && plan.triggeredBy.length === 0) {
    errors.push("Round 2 plans require at least one causal reference.");
  }
  return errors;
}
