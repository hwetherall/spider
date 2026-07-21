import type { AgentManifest } from "../domain/types";

export const agents: Record<AgentManifest["id"], AgentManifest> = {
  orchestrator: {
    id: "orchestrator",
    name: "Orchestrator Agent",
    shortName: "Orchestrator",
    role: "Plans, synthesizes, decides",
    charter: "Transform strategic intent into a structured, evidence-seeking, iterative decision process.",
    capabilities: ["Constraint extraction", "Research planning", "Conflict detection", "Decision explanation"],
    resources: ["Canonical venture state", "Candidate registry", "Accepted finding graph"],
    accent: "coral",
  },
  market: {
    id: "market",
    name: "Market Agent",
    shortName: "Market",
    role: "Validates customers and demand",
    charter: "Determine whether meaningful customers exist, what they value, and how strongly a candidate fits the target market.",
    capabilities: ["Market segmentation", "Demand assessment", "Consumer behavior", "Willingness to pay"],
    resources: ["European Coffee Consumer Pulse 2026", "Italian Home Coffee Habits Panel", "Premium Grocery Category Scan"],
    accent: "market",
  },
  product: {
    id: "product",
    name: "Product Agent",
    shortName: "Product",
    role: "Configures a feasible offer",
    charter: "Translate market needs and strategic whitespace into a product the venture can realistically make and launch.",
    capabilities: ["Product configuration", "Feasibility assessment", "Capability matching", "Packaging logic"],
    resources: ["Venture Manufacturing Capability Profile", "Packaging Format Library", "Product Complexity Model"],
    accent: "product",
  },
  competitive: {
    id: "competitive",
    name: "Competitive Agent",
    shortName: "Competitive",
    role: "Tests headroom and whitespace",
    charter: "Determine who competes for the same customer, how crowded the position is, and whether whitespace is commercially meaningful.",
    capabilities: ["Competitor mapping", "Positioning analysis", "Saturation scoring", "Whitespace assessment"],
    resources: ["European Coffee Competitor Index", "Italian Retail Shelf Audit", "Premium Brand Positioning Map"],
    accent: "competitive",
  },
};
