import { calculateWeightedScore } from "../domain/scoring";
import type { AgentPlan, AgentReport, Candidate, Recommendation, SpecialistId } from "../domain/types";

export const ventureBrief =
  "Identify the strongest packaged-coffee entry strategy for Europe. Italy is our required launch market. We want a premium product, one initial SKU, and minimal new manufacturing complexity.";

export const ventureProfile = {
  overview: "An established North American coffee roaster wants to launch one packaged, shelf-stable coffee product in one European market.",
  fixedAssumptions: [
    "One initial SKU",
    "Existing roasting and packaging capabilities",
    "No cafés, prepared drinks, ice cream, or coffee machines",
    "Premium grocery and DTC are the fixed channels",
    "€10–€16 retail price range",
    "Limited appetite for new manufacturing equipment",
  ],
  scopeRationale: "These boundaries keep the network focused on packaged coffee and prevent it from wandering into cafés, affogatos, canned drinks, or espresso machines.",
  adjustableLevers: [
    { lever: "Target market", options: "France, Scotland, Germany, Italy" },
    { lever: "Roast", options: "Light, medium, dark" },
    { lever: "Format", options: "Whole bean, ground, capsules" },
    { lever: "Price position", options: "Mainstream, premium" },
  ],
  agentScoreOutputs: [
    { agentId: "market" as const, agent: "Market Research", score: "Market–product fit" },
    { agentId: "competitive" as const, agent: "Competitor Analysis", score: "Competitive headroom" },
    { agentId: "product" as const, agent: "Product and Technology", score: "Execution feasibility" },
  ],
};

export const storyCopy = {
  introTitle: "European Coffee Entry",
  introSubtitle: "Linked Agent Decision System",
  introSummary: "Four agents. One shared venture state. Two rounds that turn conflicting evidence into a defensible launch decision.",
  planningSummary: "The Orchestrator created three comparable strategic candidates and a different evidence plan for each specialist.",
  roundTwoSummary: "C2 is now C2-R. Each specialist has a narrower validation assignment, visibly triggered by findings from the first round.",
  validationSummary: "All three focused reports support the refined strategy. No high-materiality contradiction remains unresolved.",
};

export const constraintGroups = {
  locked: ["Target market · Italy", "Initial SKU count · One", "Existing manufacturing", "Premium grocery + DTC"],
  preferences: ["Premium positioning", "Balanced appetite for risk", "Meaningful differentiation"],
  open: ["Roast profile", "Whole bean or ground", "Customer segment", "Pack size"],
};

export const initialCandidates: Candidate[] = [
  {
    id: "C1",
    name: "Familiar Premium Espresso",
    market: "Italy",
    roast: "Dark",
    format: "Ground",
    position: "Premium familiar",
    dimensions: { market: 91, competitive: 17, product: 95 },
  },
  {
    id: "C2",
    name: "Modern Home Espresso",
    market: "Italy",
    roast: "Medium",
    format: "Whole bean",
    position: "Premium contemporary",
    dimensions: { market: 73, competitive: 58, product: 88 },
  },
  {
    id: "C3",
    name: "Specialty Filter Whitespace",
    market: "Italy",
    roast: "Light",
    format: "Ground filter",
    position: "Premium niche",
    dimensions: { market: 38, competitive: 81, product: 90 },
  },
];

export const refinedCandidate: Candidate = {
  id: "C2-R",
  name: "Traceable Modern Espresso",
  market: "Italy",
  roast: "Medium",
  format: "Whole bean",
  pack: "250g",
  position: "Traceable premium",
  dimensions: { market: 79, competitive: 61, product: 86 },
};

const commonLocked = ["Italy", "One SKU", "Existing manufacturing", "Premium grocery + DTC"];
const basePlan = {
  round: 1 as const,
  stateVersion: 1,
  candidateIds: ["C1", "C2", "C3"],
  lockedConstraints: commonLocked,
  completionCriteria: ["Assess all assigned candidates", "Return comparable scores and risks"],
  triggeredBy: [{ type: "user-constraint" as const, id: "U-ITALY", label: "Italy is a locked launch market" }],
  status: "drafted" as const,
};

export const roundOnePlans: AgentPlan[] = [
  {
    ...basePlan,
    id: "PLAN-M-1",
    agentId: "market",
    title: "Assess Italian demand and customer fit",
    objective: "Identify which candidate has meaningful demand and a credible premium customer segment.",
    contextSummary: "Compare three packaged coffee strategies inside the same locked Italian launch context.",
    researchQuestions: ["Which format best fits home preparation?", "Who will pay a premium?", "Does whitespace reflect unmet demand?"],
    requiredCapabilities: ["Segmentation", "Demand assessment", "Willingness-to-pay analysis"],
    requiredResources: ["Italian Home Coffee Habits Panel", "European Coffee Consumer Pulse 2026"],
    requiredOutputs: ["Market-fit score", "Target segments", "Demand risks"],
  },
  {
    ...basePlan,
    id: "PLAN-P-1",
    agentId: "product",
    title: "Compare product and operating feasibility",
    objective: "Determine which candidate can be delivered with the venture's current capabilities.",
    contextSummary: "Test roast, format, packaging, and launch complexity without changing the locked constraints.",
    researchQuestions: ["What can existing equipment support?", "Which packaging changes are needed?", "Where does complexity enter?"],
    requiredCapabilities: ["Feasibility assessment", "Capability matching", "Packaging design logic"],
    requiredResources: ["Manufacturing Capability Profile", "Packaging Format Library"],
    requiredOutputs: ["Feasibility score", "Capability gaps", "Product risks"],
  },
  {
    ...basePlan,
    id: "PLAN-C-1",
    agentId: "competitive",
    title: "Map competitive pressure and usable whitespace",
    objective: "Separate strategically useful headroom from empty space caused by weak demand.",
    contextSummary: "Assess the exact customer and product position for each shared candidate.",
    researchQuestions: ["Where is competition densest?", "Which substitutes matter?", "Is whitespace commercially meaningful?"],
    requiredCapabilities: ["Competitor mapping", "Positioning analysis", "Whitespace assessment"],
    requiredResources: ["Italian Retail Shelf Audit", "Premium Brand Positioning Map"],
    requiredOutputs: ["Headroom score", "Competitor set", "Differentiation requirements"],
  },
];

export const roundOneReports: AgentReport[] = [
  {
    id: "REPORT-P-1",
    planId: "PLAN-P-1",
    agentId: "product",
    round: 1,
    stateVersion: 1,
    executiveSummary: "C1 is simplest to manufacture, but C2 is almost as feasible and offers greater room to differentiate.",
    candidateScores: [{ candidateId: "C1", score: 95 }, { candidateId: "C2", score: 88 }, { candidateId: "C3", score: 90 }],
    findings: [
      { id: "P-01", candidateId: "C1", title: "Almost no capability expansion", detail: "Existing roast, grind, and packing workflows already support C1.", confidence: "high", resourceIds: ["RES-P-1"] },
      { id: "P-02", candidateId: "C2", title: "Whole bean is readily feasible", detail: "C2 needs only a premium 250g high-barrier bag and modest packaging adjustment.", confidence: "high", resourceIds: ["RES-P-2"] },
      { id: "P-03", candidateId: "C3", title: "Complexity is commercial", detail: "Education and specialty merchandising create more friction than manufacturing.", confidence: "medium", resourceIds: ["RES-P-3"] },
    ],
    risks: ["Premium packaging adds modest complexity"],
    assumptions: ["Existing whole-bean packing line is available"],
    implications: [{ id: "IP-1", sourceFindingId: "P-02", targetAgentId: "market", message: "Validate whether the C2 segment owns suitable home preparation equipment.", materiality: "high" }],
    proposedFollowUps: ["Configure a 250g whole-bean concept"],
    confidence: "high",
    resourcesUsed: ["Manufacturing Capability Profile", "Packaging Format Library"],
    status: "accepted",
  },
  {
    id: "REPORT-M-1",
    planId: "PLAN-M-1",
    agentId: "market",
    round: 1,
    stateVersion: 1,
    executiveSummary: "Familiar espresso demand is strongest, while premium whole bean offers a viable bridge to modern specialty behavior.",
    candidateScores: [{ candidateId: "C1", score: 91 }, { candidateId: "C2", score: 73 }, { candidateId: "C3", score: 38 }],
    findings: [
      { id: "M-01", candidateId: "C1", title: "Familiar demand is strongest", detail: "Dark ground espresso aligns closely with established preparation and flavor expectations.", confidence: "high", resourceIds: ["RES-M-1"] },
      { id: "M-02", candidateId: "C2", title: "Whole bean has a credible segment", detail: "Younger urban consumers with grinders or bean-to-cup machines treat home coffee as a premium ritual.", confidence: "medium", resourceIds: ["RES-M-2"] },
      { id: "M-03", candidateId: "C2", title: "Premium willingness to pay exists", detail: "The strongest synthetic band for C2 is €13–€15 per 250g.", confidence: "medium", resourceIds: ["RES-M-3"] },
      { id: "M-04", candidateId: "C3", title: "Filter whitespace is demand constrained", detail: "Low competitive density should not be interpreted as broad unmet demand.", confidence: "high", resourceIds: ["RES-M-1"] },
    ],
    risks: ["C2 addresses a narrower segment"],
    assumptions: ["Urban equipment ownership is a useful segment signal"],
    implications: [{ id: "IM-1", sourceFindingId: "M-03", targetAgentId: "competitive", message: "Compare C2 with modern premium brands, not only mass-market ground coffee.", materiality: "high" }],
    proposedFollowUps: ["Validate urban segment size and cities"],
    confidence: "medium",
    resourcesUsed: ["Italian Home Coffee Habits Panel", "Consumer Pulse 2026"],
    status: "accepted",
  },
  {
    id: "REPORT-C-1",
    planId: "PLAN-C-1",
    agentId: "competitive",
    round: 1,
    stateVersion: 1,
    executiveSummary: "C1 enters the densest territory. C3's emptiness is partly demand-driven. C2 provides the strongest usable headroom.",
    candidateScores: [{ candidateId: "C1", score: 17 }, { candidateId: "C2", score: 58 }, { candidateId: "C3", score: 81 }],
    findings: [
      { id: "C-01", candidateId: "C1", title: "Familiar espresso is saturated", detail: "C1 competes directly with deeply established brands across awareness and shelf access.", confidence: "high", resourceIds: ["RES-C-1"] },
      { id: "C-02", candidateId: "C2", title: "C2 has usable, not empty, whitespace", detail: "Headroom lies at the intersection of traceability, design, home espresso, and approachable specialty flavor.", confidence: "high", resourceIds: ["RES-C-2"] },
      { id: "C-03", candidateId: "C2", title: "Traceability alone is insufficient", detail: "Origin claims are increasingly common; the complete position must be coherent.", confidence: "medium", resourceIds: ["RES-C-3"] },
      { id: "C-04", candidateId: "C3", title: "Empty space is ambiguous", detail: "Low density may signal low demand rather than a neglected opportunity.", confidence: "high", resourceIds: ["RES-C-1"] },
    ],
    risks: ["C2's position is copyable"],
    assumptions: ["Premium specialist set defines the relevant arena"],
    implications: [{ id: "IC-1", sourceFindingId: "C-02", targetAgentId: "product", message: "Make pack design, roast accessibility, origin, and home-espresso use one system.", materiality: "high" }],
    proposedFollowUps: ["Pressure-test the complete C2 position"],
    confidence: "high",
    resourcesUsed: ["Italian Retail Shelf Audit", "Premium Brand Positioning Map"],
    status: "accepted",
  },
];

const r2Plan = {
  round: 2 as const,
  stateVersion: 1,
  candidateIds: ["C2-R"],
  lockedConstraints: commonLocked,
  contextSummary: "C2 is the leading balanced hypothesis and is refined into C2-R for focused validation.",
  completionCriteria: ["Assess C2-R", "Resolve assigned contradiction", "Return revised score"],
  status: "drafted" as const,
};

export const roundTwoPlans: AgentPlan[] = [
  {
    ...r2Plan,
    id: "PLAN-M-2",
    agentId: "market",
    title: "Validate the modern Italian home-espresso segment",
    objective: "Determine whether the C2-R customer segment is large and motivated enough to justify launch.",
    researchQuestions: ["Who buys premium medium-roast whole beans?", "Is €13–€15 credible?", "Which cities should lead?"],
    requiredCapabilities: ["Segment validation", "Willingness-to-pay analysis"],
    requiredResources: ["Italian Home Coffee Habits Panel", "Urban Premium Segment Cut"],
    requiredOutputs: ["Revised market-fit score", "Target segment", "Priority cities", "Demand risks"],
    triggeredBy: [
      { type: "agent-finding", id: "C-02", label: "C-02 · Usable premium whitespace" },
      { type: "agent-finding", id: "C-04", label: "C-04 · Whitespace can be demand constrained" },
      { type: "user-answer", id: "U-01", label: "User selected · Balanced opportunity" },
    ],
  },
  {
    ...r2Plan,
    id: "PLAN-P-2",
    agentId: "product",
    title: "Configure a differentiated product within existing capabilities",
    objective: "Turn C2 into a launch-ready product concept compatible with current operations.",
    researchQuestions: ["Which roast bridges familiarity and specialty?", "What pack system is required?", "What should V1 exclude?"],
    requiredCapabilities: ["Product configuration", "Complexity analysis"],
    requiredResources: ["Packaging Format Library", "Capability Profile"],
    requiredOutputs: ["Product specification", "Feasibility score", "Operational changes", "Explicit exclusions"],
    triggeredBy: [
      { type: "agent-finding", id: "M-02", label: "M-02 · Credible whole-bean segment" },
      { type: "agent-finding", id: "M-03", label: "M-03 · €13–€15 willingness to pay" },
      { type: "agent-finding", id: "C-02", label: "C-02 · Usable premium whitespace" },
      { type: "agent-finding", id: "P-02", label: "P-02 · Existing whole-bean capability" },
    ],
  },
  {
    ...r2Plan,
    id: "PLAN-C-2",
    agentId: "competitive",
    title: "Pressure-test the traceable modern-espresso position",
    objective: "Determine whether C2-R is meaningfully differentiated in the relevant premium set.",
    researchQuestions: ["Is traceability category hygiene?", "Which combination creates headroom?", "How copyable is the position?"],
    requiredCapabilities: ["Positioning analysis", "Substitute analysis"],
    requiredResources: ["Premium Brand Positioning Map", "Italian Retail Shelf Audit"],
    requiredOutputs: ["Headroom score", "Positioning map", "Differentiation requirements", "Copyability risk"],
    triggeredBy: [
      { type: "agent-finding", id: "M-02", label: "M-02 · Modern urban segment" },
      { type: "agent-finding", id: "M-03", label: "M-03 · Premium price band" },
      { type: "agent-finding", id: "P-02", label: "P-02 · Feasible packaging adjustment" },
      { type: "user-answer", id: "U-01", label: "User selected · Balanced opportunity" },
    ],
  },
];

export const roundTwoReports: AgentReport[] = [
  {
    id: "REPORT-M-2", planId: "PLAN-M-2", agentId: "market", round: 2, stateVersion: 1,
    executiveSummary: "A narrower but viable premium segment exists among urban 25–40-year-old home-espresso consumers.",
    candidateScores: [{ candidateId: "C2-R", score: 79 }],
    findings: [{ id: "M-05", candidateId: "C2-R", title: "Narrow segment, credible demand", detail: "Milan, Turin, and Rome form the synthetic priority cluster; €13–€15 is credible.", confidence: "high", resourceIds: ["RES-M-4"] }],
    risks: ["The segment is smaller than the mass-market ground audience"], assumptions: ["Urban premium behavior persists"], implications: [], proposedFollowUps: [], confidence: "high", resourcesUsed: ["Urban Premium Segment Cut"], status: "accepted",
  },
  {
    id: "REPORT-P-2", planId: "PLAN-P-2", agentId: "product", round: 2, stateVersion: 1,
    executiveSummary: "A 250g medium-roast whole-bean configuration is launch-ready with modest packaging and traceability changes.",
    candidateScores: [{ candidateId: "C2-R", score: 86 }],
    findings: [{ id: "P-04", candidateId: "C2-R", title: "Launch-ready configuration", detail: "250g high-barrier bag; chocolate, toasted nut, restrained fruit; designed for home espresso.", confidence: "high", resourceIds: ["RES-P-4"] }],
    risks: ["Premium packaging and traceability add modest complexity"], assumptions: ["Origin data is operationally available"], implications: [], proposedFollowUps: [], confidence: "high", resourcesUsed: ["Packaging Format Library"], status: "accepted",
  },
  {
    id: "REPORT-C-2", planId: "PLAN-C-2", agentId: "competitive", round: 2, stateVersion: 1,
    executiveSummary: "Defensible headroom comes from the complete modern home-espresso system, not medium roast or traceability alone.",
    candidateScores: [{ candidateId: "C2-R", score: 61 }],
    findings: [{ id: "C-05", candidateId: "C2-R", title: "The combination creates headroom", detail: "Approachable specialty, transparent origin, contemporary design, and accessible premium pricing work together.", confidence: "high", resourceIds: ["RES-C-4"] }],
    risks: ["The position is copyable without brand recognition"], assumptions: ["A coherent launch maintains the full system"], implications: [], proposedFollowUps: [], confidence: "high", resourcesUsed: ["Premium Brand Positioning Map"], status: "accepted",
  },
];

const finalDimensions = refinedCandidate.dimensions as Required<Candidate["dimensions"]>;

export const finalRecommendation: Recommendation = {
  candidateId: "C2-R",
  title: "Traceable Modern Espresso",
  summary: "Launch a 250g premium medium-roast whole-bean coffee for younger urban Italian home-espresso consumers, positioned around traceable origin and modern Italian coffee culture.",
  score: calculateWeightedScore(finalDimensions)!,
  dimensions: finalDimensions,
  reasons: [
    "Stronger differentiation than familiar dark-ground espresso",
    "Materially better demand than light-filter whitespace",
    "Compatible with existing roasting and packaging capabilities",
    "Clear segment and premium price position",
    "No unresolved cross-agent contradiction",
  ],
  confidence: "High · synthetic demonstration",
};

export const conflictSummary = {
  title: "The obvious product is not the strongest strategy.",
  summary: "The strongest existing demand is the most crowded. The largest whitespace has the weakest demand. C2 offers the best initial balance, but its addressable segment needs validation.",
  resolved: "Round 2 resolves the remaining segment, configuration, and differentiation questions.",
};

export const priorities = [
  { id: "balanced" as const, title: "Balanced opportunity", description: "Balance demand, differentiation, and execution.", badge: "Recommended" },
  { id: "demand" as const, title: "Established demand", description: "Favor the product consumers already understand." },
  { id: "whitespace" as const, title: "Maximum whitespace", description: "Accept more demand risk for differentiation." },
];

export const alternativeRecommendations = {
  demand: { title: "Conservative alternative · C1", summary: "Advance premium dark-ground espresso. This maximizes current demand and feasibility but accepts severe competitive pressure and limited differentiation." },
  whitespace: { title: "High-risk alternative · C3", summary: "Advance premium light-roast filter coffee. This maximizes whitespace but accepts materially weaker demand and greater consumer-education risk." },
};

export const franceWhatIf = {
  dimensions: { market: 77, competitive: 39, product: 86 },
  summary: "The product remains operationally feasible and has credible premium demand, but its position is materially more crowded in the synthetic French landscape. The previous Italian recommendation cannot simply be carried across markets.",
  resources: ["French Premium Coffee Pulse", "France Retail Shelf Audit", "Modern Espresso Competitor Set"],
};

export const reportOrder: SpecialistId[] = ["product", "market", "competitive"];

export const presentationSteps = ["Brief", "Candidates", "Round 1", "Conflict", "Round 2", "Recommendation", "What-if"];
