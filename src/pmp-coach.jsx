
import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "pmp-coach-v7";
const TODAY = () => new Date().toISOString().split("T")[0];

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const ROADMAP = [
  { week: "Week 1", title: "Foundations, value, and PMI mindset", topics: ["Project value", "Stakeholder engagement", "Root-cause analysis"] },
  { week: "Week 2", title: "Team leadership and conflict", topics: ["Conflict management", "Servant leadership", "Communication"] },
  { week: "Week 3", title: "Scope, schedule, and quality", topics: ["Scope management", "Change control", "Quality"] },
  { week: "Week 4", title: "Risk, issues, and vendors", topics: ["Risk responses", "Issue management", "Procurement"] },
  { week: "Week 5", title: "Agile and hybrid delivery", topics: ["Backlog refinement", "Sprint planning", "Hybrid tailoring"] },
  { week: "Week 6", title: "Governance, compliance, and benefits", topics: ["Compliance", "Benefits realization", "Governance"] },
  { week: "Week 7", title: "Exam-level situational judgment", topics: ["Ambiguous scenarios", "Best next action", "Tradeoffs"] },
  { week: "Week 8+", title: "Full exam and targeted review", topics: ["Weak areas", "Mock exams", "Readiness"] },
];

const CURRICULUM = Array.from({ length: 60 }, (_, i) => {
  const block = ROADMAP[Math.min(Math.floor(i / 8), ROADMAP.length - 1)];
  return {
    day: i + 1,
    title: `${block.week}: ${block.title}`,
    focus: block.topics[i % block.topics.length],
    lesson: `Day ${i + 1} focuses on ${block.topics[i % block.topics.length]}. Think like PMI: understand the situation, engage the right people, analyze first, then act.`,
  };
});

const SCENARIOS = [
  {
    id: "healthcare-ehr",
    industry: "healthcare",
    environment: "hybrid",
    org: "a regional hospital",
    project: "an electronic health record rollout",
    deliverable: "the patient-data interface for pilot launch",
    sponsorTitle: "the chief medical officer",
    stakeholderTitle: "the nursing leadership team",
    teamName: "the integration team",
    vendorName: "the interface vendor",
    userGroup: "clinicians",
    pressure: "go-live is three weeks away",
    extra: "the training team says they cannot finalize user training until the interface is stable",
  },
  {
    id: "public-health-vaccination",
    industry: "public health",
    environment: "predictive",
    org: "a county health department",
    project: "a vaccination outreach program",
    deliverable: "the community enrollment workflow",
    sponsorTitle: "the deputy health director",
    stakeholderTitle: "community partner organizations",
    teamName: "the outreach team",
    vendorName: "the call-center contractor",
    userGroup: "residents",
    pressure: "a public launch event is scheduled for next month",
    extra: "local clinics are asking for final materials and staffing plans",
  },
  {
    id: "finserv-compliance",
    industry: "financial services",
    environment: "hybrid",
    org: "a national financial services firm",
    project: "a regulatory compliance program",
    deliverable: "the transaction-monitoring workflow",
    sponsorTitle: "the compliance sponsor",
    stakeholderTitle: "the audit and risk group",
    teamName: "the compliance delivery team",
    vendorName: "the reporting vendor",
    userGroup: "compliance analysts",
    pressure: "the regulator review is scheduled in four weeks",
    extra: "leaders want confidence that the release can still meet the required date",
  },
  {
    id: "construction-campus",
    industry: "construction",
    environment: "predictive",
    org: "a university campus",
    project: "a laboratory renovation",
    deliverable: "the air-handling system installation",
    sponsorTitle: "the facilities director",
    stakeholderTitle: "lab managers",
    teamName: "the construction management team",
    vendorName: "the mechanical subcontractor",
    userGroup: "research staff",
    pressure: "occupancy inspection is booked for the end of the month",
    extra: "researchers are pressing for certainty because experiments are already scheduled",
  },
  {
    id: "software-mobile",
    industry: "technology",
    environment: "agile",
    org: "a software company",
    project: "a mobile banking app release",
    deliverable: "the payment-verification feature",
    sponsorTitle: "the product sponsor",
    stakeholderTitle: "customer support leaders",
    teamName: "the scrum team",
    vendorName: "the identity-verification partner",
    userGroup: "app users",
    pressure: "the release train leaves in two sprints",
    extra: "the product owner is under pressure from sales to promise additional functionality",
  },
  {
    id: "manufacturing-erp",
    industry: "manufacturing",
    environment: "hybrid",
    org: "a manufacturing company",
    project: "an ERP upgrade",
    deliverable: "the inventory reconciliation process",
    sponsorTitle: "the operations sponsor",
    stakeholderTitle: "plant managers",
    teamName: "the ERP delivery team",
    vendorName: "the implementation partner",
    userGroup: "warehouse coordinators",
    pressure: "quarter-end close is approaching",
    extra: "plants are already planning around the new process",
  },
  {
    id: "ngo-water",
    industry: "nonprofit",
    environment: "hybrid",
    org: "an international NGO",
    project: "a rural water access program",
    deliverable: "the field reporting dashboard",
    sponsorTitle: "the program director",
    stakeholderTitle: "local implementing partners",
    teamName: "the field implementation team",
    vendorName: "the data platform supplier",
    userGroup: "field coordinators",
    pressure: "donor reporting is due soon",
    extra: "partners in two regions are using different workarounds and want direction",
  },
  {
    id: "government-permits",
    industry: "government",
    environment: "predictive",
    org: "a state agency",
    project: "a permit modernization initiative",
    deliverable: "the online application review module",
    sponsorTitle: "the agency director",
    stakeholderTitle: "compliance officers",
    teamName: "the modernization team",
    vendorName: "the software contractor",
    userGroup: "citizens and permit staff",
    pressure: "a legislative update takes effect next month",
    extra: "agency leadership is worried about public scrutiny",
  },
  {
    id: "education-lms",
    industry: "education",
    environment: "agile",
    org: "a university",
    project: "a learning-management platform enhancement",
    deliverable: "the assignment feedback workflow",
    sponsorTitle: "the academic technology sponsor",
    stakeholderTitle: "faculty representatives",
    teamName: "the product team",
    vendorName: "the hosting provider",
    userGroup: "students and instructors",
    pressure: "the new semester begins soon",
    extra: "faculty leaders keep requesting small additions after sprint planning",
  },
  {
    id: "pharma-validation",
    industry: "pharmaceutical",
    environment: "predictive",
    org: "a pharmaceutical manufacturer",
    project: "a validation program",
    deliverable: "the batch-release documentation package",
    sponsorTitle: "the quality sponsor",
    stakeholderTitle: "validation and quality assurance leaders",
    teamName: "the validation team",
    vendorName: "the laboratory supplier",
    userGroup: "quality reviewers",
    pressure: "an external audit is upcoming",
    extra: "the plant cannot increase output until validation is approved",
  },
  {
    id: "telecom-network",
    industry: "telecommunications",
    environment: "hybrid",
    org: "a telecom provider",
    project: "a network resilience upgrade",
    deliverable: "the failover test package",
    sponsorTitle: "the infrastructure sponsor",
    stakeholderTitle: "regional operations managers",
    teamName: "the network program team",
    vendorName: "the hardware vendor",
    userGroup: "operations centers",
    pressure: "peak season traffic is approaching",
    extra: "service-level penalties apply if readiness slips",
  },
  {
    id: "retail-loyalty",
    industry: "retail",
    environment: "agile",
    org: "a retail chain",
    project: "a loyalty platform release",
    deliverable: "the rewards enrollment feature",
    sponsorTitle: "the marketing sponsor",
    stakeholderTitle: "store operations leaders",
    teamName: "the agile product team",
    vendorName: "the CRM partner",
    userGroup: "store associates and customers",
    pressure: "a holiday campaign launches in two sprints",
    extra: "marketing wants last-minute enhancements added immediately",
  },
  {
    id: "insurance-claims",
    industry: "insurance",
    environment: "hybrid",
    org: "an insurance carrier",
    project: "a claims automation initiative",
    deliverable: "the fraud-review workflow",
    sponsorTitle: "the claims sponsor",
    stakeholderTitle: "fraud investigators",
    teamName: "the claims transformation team",
    vendorName: "the analytics vendor",
    userGroup: "claims adjusters",
    pressure: "leadership committed to a savings target this quarter",
    extra: "investigators say new screens may slow case reviews",
  },
  {
    id: "energy-safety",
    industry: "energy",
    environment: "predictive",
    org: "an energy utility",
    project: "a field safety improvement program",
    deliverable: "the incident-reporting process",
    sponsorTitle: "the safety sponsor",
    stakeholderTitle: "regional field supervisors",
    teamName: "the safety program team",
    vendorName: "the mobile-device supplier",
    userGroup: "field crews",
    pressure: "regulators are requesting status updates",
    extra: "crew supervisors want to bypass some planned steps to move faster",
  },
  {
    id: "media-streaming",
    industry: "media",
    environment: "agile",
    org: "a streaming company",
    project: "a recommendation engine release",
    deliverable: "the personalization dashboard",
    sponsorTitle: "the digital product sponsor",
    stakeholderTitle: "content strategy leaders",
    teamName: "the scrum team",
    vendorName: "the analytics provider",
    userGroup: "marketing analysts",
    pressure: "leadership wants a demo at the next executive review",
    extra: "the product owner is hearing conflicting feedback from different stakeholders",
  },
  {
    id: "airport-security",
    industry: "transportation",
    environment: "hybrid",
    org: "an airport authority",
    project: "a security screening improvement project",
    deliverable: "the lane-capacity dashboard",
    sponsorTitle: "the airport operations sponsor",
    stakeholderTitle: "security managers",
    teamName: "the improvement team",
    vendorName: "the sensor vendor",
    userGroup: "screening supervisors",
    pressure: "holiday travel volume is approaching",
    extra: "operations leaders need confidence that the new process will not disrupt service",
  },
  {
    id: "hospitality-booking",
    industry: "hospitality",
    environment: "agile",
    org: "a hotel group",
    project: "a booking engine enhancement",
    deliverable: "the group-reservations workflow",
    sponsorTitle: "the commercial sponsor",
    stakeholderTitle: "hotel general managers",
    teamName: "the product team",
    vendorName: "the payments provider",
    userGroup: "reservation agents",
    pressure: "the conference booking season starts soon",
    extra: "sales leaders keep introducing requests from major clients",
  },
  {
    id: "biotech-lab",
    industry: "biotech",
    environment: "predictive",
    org: "a biotech company",
    project: "a lab information system deployment",
    deliverable: "the sample-tracking workflow",
    sponsorTitle: "the R&D sponsor",
    stakeholderTitle: "laboratory managers",
    teamName: "the deployment team",
    vendorName: "the software integrator",
    userGroup: "lab technicians",
    pressure: "research studies are scheduled to begin next month",
    extra: "the lab team says acceptance criteria were interpreted differently by different groups",
  },
];

const ACTIONS = {
  clarifyRootCause: {
    text: (s) => `Meet with ${s.teamName} and ${s.stakeholderTitle} to clarify expectations and determine the root cause before responding.`,
    why: "PMI favors understanding the facts and aligning stakeholders before taking action or escalating."
  },
  engageStakeholders: {
    text: (s) => `Facilitate a discussion with the affected stakeholders to understand their concerns, expectations, and success criteria.`,
    why: "The project manager should engage stakeholders directly and build shared understanding before deciding on next steps."
  },
  impactAnalysis: {
    text: (s) => `Assess the impact on scope, schedule, cost, risk, and benefits before recommending a response.`,
    why: "Analyzing impact before acting is core PMP behavior, especially when there are competing priorities or requested changes."
  },
  formalChange: {
    text: (s) => `Document the requested change, evaluate its impact, and follow the agreed change control process before implementation.`,
    why: "Requested changes should go through the appropriate change process before the team commits to them."
  },
  coachTeam: {
    text: (s) => `Coach the team through the issue, help them surface options, and support a collaborative resolution.`,
    why: "In PMI and Agile thinking, the project manager enables the team and supports problem solving instead of directing every action."
  },
  inspectBacklog: {
    text: (s) => `Work with the product owner and team to refine priorities and decide what can realistically fit in the next iteration.`,
    why: "In Agile environments, backlog prioritization and collaboration drive the best next action."
  },
  reviewRiskResponse: {
    text: (s) => `Review the risk register and planned response strategy, then update it based on the current situation.`,
    why: "If a known uncertainty is emerging, the PM should use the defined risk process rather than treating everything as a brand-new crisis."
  },
  issueLog: {
    text: (s) => `Record the issue, assign ownership, and work with the team on a resolution plan and follow-up dates.`,
    why: "Once something has happened, it should be managed as an issue with ownership and follow-up."
  },
  qualityCheck: {
    text: (s) => `Review the acceptance criteria and quality results with the appropriate stakeholders before deciding whether the work is acceptable.`,
    why: "Acceptance and quality decisions should be based on agreed criteria and inspection, not assumption."
  },
  benefitsReview: {
    text: (s) => `Review whether the current approach still supports the expected business value and recommend adjustments if needed.`,
    why: "The PM should connect delivery decisions back to expected outcomes and benefits."
  },
  complianceReview: {
    text: (s) => `Confirm the compliance requirement with the appropriate subject-matter experts and assess what must change to remain compliant.`,
    why: "When compliance is involved, the PM should verify the requirement and its impact before promising a solution."
  },
  opsReadiness: {
    text: (s) => `Engage the operational owners to confirm readiness, transition needs, and any actions required before release.`,
    why: "Projects do not create value unless the receiving organization is ready to operate and support the result."
  },
  retrospective: {
    text: (s) => `Use a retrospective or targeted team discussion to identify what caused the problem and agree on an improvement plan.`,
    why: "Agile teams improve through inspection and adaptation, not blame."
  },
};

const BP = (id, domain, topic, difficulty, environment, trap, buildStem, correctKey, wrongKeys) => ({
  id, domain, topic, difficulty, environment, trap, buildStem, correctKey, wrongKeys
});

const BLUEPRINTS = [
  BP(
    "conflicting-info",
    "Process",
    "Issue Analysis",
    "Exam-level",
    "any",
    "premature escalation",
    (s) => `A project manager is leading ${s.project} for ${s.org}. ${capitalize(s.sponsorTitle)} wants an immediate explanation for why ${s.deliverable} is slipping. Members of ${s.teamName} are giving conflicting explanations, and ${s.stakeholderTitle} say success criteria were never fully aligned. What should the project manager do NEXT?`,
    "clarifyRootCause",
    ["impactAnalysis", "formalChange", "engageStakeholders"]
  ),
  BP(
    "stakeholder-misalignment",
    "People",
    "Stakeholder Engagement",
    "Hard",
    "any",
    "ignoring stakeholder input",
    (s) => `During ${s.project} for ${s.org}, ${s.stakeholderTitle} begin pushing in different directions on ${s.deliverable}. ${s.extra}. What should the project manager do next?`,
    "engageStakeholders",
    ["clarifyRootCause", "formalChange", "benefitsReview"]
  ),
  BP(
    "change-request-predictive",
    "Process",
    "Integrated Change Control",
    "Medium",
    "predictive",
    "skipping change control",
    (s) => `${capitalize(s.sponsorTitle)} asks the project manager to add new work to ${s.deliverable} because it seems small and urgent. The team says they can start right away. What should the project manager do next?`,
    "formalChange",
    ["impactAnalysis", "coachTeam", "engageStakeholders"]
  ),
  BP(
    "compliance-change-hybrid",
    "Business",
    "Compliance",
    "Hard",
    "hybrid",
    "acting before compliance review",
    (s) => `Halfway through ${s.project} for ${s.org}, a new regulatory interpretation may affect ${s.deliverable}. ${s.pressure}. What should the project manager do next?`,
    "complianceReview",
    ["formalChange", "impactAnalysis", "clarifyRootCause"]
  ),
  BP(
    "agile-priority-shift",
    "Process",
    "Backlog Management",
    "Hard",
    "agile",
    "command-and-control leadership in agile",
    (s) => `In ${s.project}, ${capitalize(s.sponsorTitle)} asks for a last-minute feature to be inserted into the current iteration because it is now considered high priority. The team says doing so will disrupt committed work. What should the project manager do next?`,
    "inspectBacklog",
    ["coachTeam", "formalChange", "engageStakeholders"]
  ),
  BP(
    "team-conflict",
    "People",
    "Conflict Management",
    "Exam-level",
    "any",
    "jumping to discipline before facilitation",
    (s) => `Two experienced members of ${s.teamName} disagree publicly about how to complete ${s.deliverable}. The disagreement is beginning to slow progress, and other team members have stopped contributing in meetings. What should the project manager do next?`,
    "coachTeam",
    ["clarifyRootCause", "engageStakeholders", "formalChange"]
  ),
  BP(
    "known-risk-materializing",
    "Process",
    "Risk Management",
    "Medium",
    "any",
    "risk-vs-issue confusion",
    (s) => `${s.vendorName} warns the team that a supply delay may affect ${s.deliverable}. The same possibility was documented earlier in planning. What should the project manager do next?`,
    "reviewRiskResponse",
    ["issueLog", "formalChange", "clarifyRootCause"]
  ),
  BP(
    "actual-issue-occurred",
    "Process",
    "Issue Management",
    "Medium",
    "any",
    "treating an issue like a risk",
    (s) => `${s.vendorName} confirms that a required component for ${s.deliverable} will not arrive on time. ${s.pressure}. What should the project manager do next?`,
    "issueLog",
    ["reviewRiskResponse", "formalChange", "engageStakeholders"]
  ),
  BP(
    "quality-rejection",
    "Process",
    "Quality and Acceptance",
    "Hard",
    "any",
    "assuming acceptance",
    (s) => `${s.stakeholderTitle} say the latest output for ${s.deliverable} does not meet what they expected, but ${s.teamName} insist the work is complete. What should the project manager do next?`,
    "qualityCheck",
    ["clarifyRootCause", "formalChange", "engageStakeholders"]
  ),
  BP(
    "benefits-at-risk",
    "Business",
    "Benefits Realization",
    "Hard",
    "any",
    "delivering output without value",
    (s) => `During a status review for ${s.project}, leaders realize that even if ${s.deliverable} is completed on time, it may not produce the business outcome originally expected. What should the project manager do next?`,
    "benefitsReview",
    ["impactAnalysis", "engageStakeholders", "formalChange"]
  ),
  BP(
    "ops-not-ready",
    "Business",
    "Transition and Readiness",
    "Medium",
    "any",
    "ignoring operational readiness",
    (s) => `${s.deliverable} is nearly complete, but the receiving group says they have not been trained and do not yet have support procedures in place. What should the project manager do next?`,
    "opsReadiness",
    ["engageStakeholders", "impactAnalysis", "formalChange"]
  ),
  BP(
    "agile-low-morale",
    "People",
    "Servant Leadership",
    "Hard",
    "agile",
    "command-and-control leadership in agile",
    (s) => `In ${s.project}, the team has missed two iteration goals. Morale is dropping, and several members say priorities change faster than they can deliver. What should the project manager do next?`,
    "retrospective",
    ["inspectBacklog", "coachTeam", "formalChange"]
  ),
  BP(
    "sponsor-directing-team",
    "People",
    "Leadership",
    "Hard",
    "any",
    "allowing bypass of team process",
    (s) => `${capitalize(s.sponsorTitle)} begins assigning work directly to members of ${s.teamName}, creating confusion about priorities and ownership. What should the project manager do next?`,
    "engageStakeholders",
    ["coachTeam", "formalChange", "clarifyRootCause"]
  ),
  BP(
    "agile-po-overcommit",
    "People",
    "Agile Collaboration",
    "Exam-level",
    "agile",
    "accepting unrealistic commitments",
    (s) => `The product owner promises ${s.stakeholderTitle} that additional work will be included in the next iteration before consulting the team. Team members say the promise is not realistic. What should the project manager do next?`,
    "inspectBacklog",
    ["coachTeam", "engageStakeholders", "formalChange"]
  ),
  BP(
    "vendor-performance",
    "Process",
    "Procurement",
    "Hard",
    "any",
    "skipping contract review",
    (s) => `${s.vendorName} has missed two milestone dates for ${s.deliverable}. The sponsor wants to replace the vendor immediately. What should the project manager do next?`,
    "impactAnalysis",
    ["formalChange", "clarifyRootCause", "engageStakeholders"]
  ),
  BP(
    "ambiguous-acceptance-criteria",
    "Process",
    "Requirements",
    "Exam-level",
    "any",
    "building without shared definition",
    (s) => `Late in ${s.project}, ${s.stakeholderTitle} say the team delivered what was built, but not what the business needed. The team points to the approved requirements. What should the project manager do next?`,
    "clarifyRootCause",
    ["qualityCheck", "formalChange", "engageStakeholders"]
  ),
  BP(
    "cost-pressure",
    "Process",
    "Cost Management",
    "Medium",
    "predictive",
    "reacting before analysis",
    (s) => `The latest forecast shows ${s.project} may exceed its budget if current trends continue. ${capitalize(s.sponsorTitle)} asks the project manager to cut planned quality activities immediately. What should the project manager do next?`,
    "impactAnalysis",
    ["formalChange", "engageStakeholders", "clarifyRootCause"]
  ),
  BP(
    "schedule-dependency",
    "Process",
    "Schedule Management",
    "Hard",
    "any",
    "replanning without understanding dependency impact",
    (s) => `A dependency outside ${s.teamName} is now threatening the planned date for ${s.deliverable}. The sponsor wants to know whether the milestone can still be met. What should the project manager do next?`,
    "impactAnalysis",
    ["clarifyRootCause", "issueLog", "formalChange"]
  ),
  BP(
    "compliance-reporting",
    "Business",
    "Governance",
    "Medium",
    "any",
    "ignoring governance expectations",
    (s) => `${capitalize(s.sponsorTitle)} is satisfied with progress, but ${s.stakeholderTitle} say required governance reporting has been inconsistent and they lack confidence in the project status. What should the project manager do next?`,
    "engageStakeholders",
    ["clarifyRootCause", "formalChange", "benefitsReview"]
  ),
  BP(
    "remote-team-miscommunication",
    "People",
    "Communication",
    "Medium",
    "any",
    "assuming communication is understood",
    (s) => `${s.teamName} work across multiple locations. Recently, work on ${s.deliverable} has been redone several times because different groups interpreted instructions differently. What should the project manager do next?`,
    "clarifyRootCause",
    ["engageStakeholders", "coachTeam", "formalChange"]
  ),
  BP(
    "public-pressure",
    "Business",
    "Business Environment",
    "Hard",
    "any",
    "responding for optics without facts",
    (s) => `${s.project} has become visible to senior leaders and external stakeholders. A public deadline is approaching, and leadership wants the project manager to reassure everyone that ${s.deliverable} is fully on track even though the team is still validating status. What should the project manager do next?`,
    "clarifyRootCause",
    ["engageStakeholders", "formalChange", "impactAnalysis"]
  ),
  BP(
    "agile-quality-defect",
    "Process",
    "Agile Quality",
    "Hard",
    "agile",
    "fixing without inspecting process",
    (s) => `During a sprint review for ${s.project}, users identify repeated defects in ${s.deliverable}. The team says they can patch them quickly, but similar defects appeared in the previous sprint. What should the project manager do next?`,
    "retrospective",
    ["coachTeam", "qualityCheck", "inspectBacklog"]
  ),
  BP(
    "benefits-vs-scope",
    "Business",
    "Strategic Alignment",
    "Exam-level",
    "hybrid",
    "focusing on output over outcome",
    (s) => `A requested enhancement would increase the scope of ${s.project}, but the business case review suggests it may not improve the expected benefit. What should the project manager do next?`,
    "benefitsReview",
    ["formalChange", "impactAnalysis", "engageStakeholders"]
  ),
  BP(
    "resource-manager-conflict",
    "People",
    "Negotiation",
    "Hard",
    "any",
    "escalating before attempting resolution",
    (s) => `A functional manager wants to reassign a key specialist from ${s.teamName} before a critical milestone for ${s.deliverable}. The project sponsor is unavailable today. What should the project manager do next?`,
    "engageStakeholders",
    ["formalChange", "impactAnalysis", "clarifyRootCause"]
  ),
  BP(
    "deliverable-slipping-unclear-owners",
    "Process",
    "Ownership and Accountability",
    "Hard",
    "any",
    "reacting before clarifying accountability",
    (s) => `${s.deliverable} is slipping, and several groups each assume another team owns the final step. ${s.pressure}. What should the project manager do next?`,
    "clarifyRootCause",
    ["engageStakeholders", "impactAnalysis", "formalChange"]
  ),
];

const TOPIC_TO_FLASHCARDS = {
  "Issue Analysis": [
    ["What should a PM usually do before giving a sponsor an answer in an ambiguous situation?", "Clarify facts, root cause, and stakeholder expectations before responding."],
    ["PMI trap: conflicting explanations from the team", "Do not guess. Gather facts and align on the real cause first."],
  ],
  "Stakeholder Engagement": [
    ["What is a strong first move when stakeholder expectations conflict?", "Bring the stakeholders together, clarify success criteria, and create shared understanding."],
  ],
  "Integrated Change Control": [
    ["Can urgent work skip change control on a predictive project?", "No. The PM should evaluate impact and follow the agreed change process before implementation."],
  ],
  "Compliance": [
    ["When a new compliance rule may affect delivery, what comes first?", "Verify the requirement with the right SMEs and assess impact before committing to changes."],
  ],
  "Backlog Management": [
    ["Agile trap: urgent request in the current sprint", "Do not force it in. Revisit priorities with the product owner and team."],
  ],
};

const STARTER_FLASHCARDS = [
  ["What does CPI stand for?", "Cost Performance Index. CPI = EV / AC."],
  ["What does SPI stand for?", "Schedule Performance Index. SPI = EV / PV."],
  ["What is the difference between a risk and an issue?", "A risk is uncertain and may happen. An issue has already happened."],
  ["What should a PM usually do before escalating?", "Analyze the situation and attempt resolution at the appropriate level first."],
  ["What is servant leadership?", "Leading by enabling the team, removing impediments, and supporting collaboration."],
  ["What is the best response to scope change in predictive projects?", "Assess impact and follow formal change control."],
  ["What is the best first step when stakeholders disagree?", "Clarify needs and facilitate alignment before acting."],
  ["Who owns backlog priority in Scrum?", "The product owner, informed by stakeholder value and team input."],
  ["What is a retrospective used for?", "Inspecting how the team worked and improving the process."],
  ["Why are acceptance criteria important?", "They create a shared definition of what is acceptable and reduce rework."],
  ["What is a hybrid project?", "A project that blends predictive and agile approaches where appropriate."],
  ["What is the PMI mindset on sponsor pressure?", "Provide a fact-based response after analysis, not a rushed guess."],
  ["What is a common PMP trap in Agile?", "Using command-and-control instead of coaching and collaboration."],
  ["What is the difference between validating scope and controlling scope?", "Validate Scope is formal acceptance; Control Scope monitors the status of scope and manages changes."],
  ["What should happen before go-live besides finishing the deliverable?", "Operational readiness: training, support, handoff, and adoption planning."],
  ["What is EMV?", "Expected Monetary Value: probability multiplied by impact."],
  ["What is PERT?", "A weighted estimate using optimistic, most likely, and pessimistic values: (O + 4M + P) / 6."],
  ["What should a PM do when a known risk starts to emerge?", "Review the risk response strategy and update the register."],
  ["What should a PM do when an issue has already happened?", "Log it as an issue, assign an owner, and manage resolution."],
  ["Why is business value important on the PMP?", "The project is not only about deliverables; it is about outcomes and benefits."],
  ["What is Definition of Done?", "A shared agreement on what it means for work to be complete."],
  ["What is a Kanban board used for?", "Visualizing work and managing flow."],
  ["How should a PM handle conflicting team explanations?", "Gather facts, clarify ownership, and determine the root cause."],
  ["What is a common trap with vendor delays?", "Taking drastic action before reviewing contract terms and impacts."],
  ["What is the best first move when quality is disputed?", "Review agreed acceptance criteria and inspect results."],
];

function articleFor(env) {
  return /^[aeiou]/i.test(env) ? `an ${env}` : `a ${env}`;
}

function makeChoice(key, scenario) {
  return ACTIONS[key].text(scenario);
}

function makeExplanation(blueprint, scenario, correctKey, optionMap) {
  const explanation = { correct: ACTIONS[correctKey].why };
  Object.entries(optionMap).forEach(([letter, key]) => {
    if (key === correctKey) {
      explanation[letter] = `Correct. ${ACTIONS[key].why}`;
    } else {
      const whyWrong = {
        formalChange: "This may eventually be needed, but the PM should not trigger or communicate a solution before understanding the situation and/or confirming the need.",
        impactAnalysis: "Impact analysis is valuable, but another action should happen first to clarify the situation or engage the right people.",
        clarifyRootCause: "Clarifying root cause is usually strong, but this scenario calls first for direct stakeholder engagement or the agreed agile workflow.",
        engageStakeholders: "Stakeholder engagement matters, but another process step is the best immediate next action in this scenario.",
        coachTeam: "Coaching is helpful, but this answer does not directly address the primary process need or key decision point.",
        inspectBacklog: "This reflects good agile practice in some cases, but it is not the best first step for this scenario.",
        reviewRiskResponse: "This would be best if the situation were still uncertain. Here, the event has already occurred or another action comes first.",
        issueLog: "Recording the issue is important, but the PM should first take the stronger PMI next step in the scenario.",
        qualityCheck: "Inspection matters, but the more appropriate immediate action is different here.",
        benefitsReview: "Benefits should be considered, but another action should happen first before changing direction.",
        complianceReview: "Compliance verification matters when regulations change, but it is not the best next step in this scenario.",
        opsReadiness: "Operational readiness matters later, but it is not the main issue that should be addressed first here.",
        retrospective: "This is helpful for team improvement, but there is a better immediate action for the situation presented.",
      }[key] || "This is plausible, but another choice better reflects PMI sequencing and judgment for this situation.";
      explanation[letter] = whyWrong;
    }
  });
  return explanation;
}

function generateQuestionBank() {
  const bank = [];
  BLUEPRINTS.forEach((bp) => {
    SCENARIOS.filter((s) => bp.environment === "any" || s.environment === bp.environment).forEach((s) => {
      const stem = bp.buildStem(s).replace("a " + s.project, `${articleFor(s.environment)} ${s.project}`);
      const optionKeys = shuffle([bp.correctKey, ...bp.wrongKeys]).slice(0, 4);
      if (!optionKeys.includes(bp.correctKey)) optionKeys[0] = bp.correctKey;
      const letters = ["A", "B", "C", "D"];
      const choices = optionKeys.map((key, i) => `${letters[i]}. ${makeChoice(key, s)}`);
      const correct = letters[optionKeys.indexOf(bp.correctKey)];
      const optionMap = Object.fromEntries(letters.map((l, i) => [l, optionKeys[i]]));
      bank.push({
        id: `${bp.id}-${s.id}`,
        q: stem,
        choices,
        correct,
        explanation: makeExplanation(bp, s, bp.correctKey, optionMap),
        domain: bp.domain,
        topic: bp.topic,
        difficulty: bp.difficulty,
        trap: bp.trap,
        environment: s.environment,
        industry: s.industry,
      });
    });
  });
  return shuffle(bank);
}

function roadmapForDay(day) {
  return CURRICULUM[Math.max(0, Math.min(day - 1, CURRICULUM.length - 1))];
}

function starterFlashcardObjects() {
  const today = TODAY();
  return STARTER_FLASHCARDS.map(([front, back], i) => ({
    id: `starter-${i + 1}`,
    front,
    back,
    source: "starter",
    seen: false,
    interval: 0,
    nextReview: i < 15 ? today : "2099-12-31",
  }));
}

function safeLoad(bank) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no saved state");
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.flashcards)) throw new Error("bad shape");
    return {
      ...parsed,
      answeredIds: Array.isArray(parsed.answeredIds) ? parsed.answeredIds : [],
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
      weakTopics: Array.isArray(parsed.weakTopics) ? parsed.weakTopics : [],
      flashcards: parsed.flashcards.length ? parsed.flashcards : starterFlashcardObjects(),
      lastUpdated: parsed.lastUpdated || TODAY(),
    };
  } catch {
    return {
      day: 1,
      readiness: 0,
      answeredIds: [],
      scoreHistory: [],
      weakTopics: [],
      flashcards: starterFlashcardObjects(),
      examHistory: [],
      lastUpdated: TODAY(),
    };
  }
}

function nextInterval(prev, quality) {
  if (quality === "easy") return prev === 0 ? 3 : Math.min(prev * 2, 30);
  if (quality === "medium") return prev === 0 ? 2 : Math.min(Math.ceil(prev * 1.5), 21);
  return 1;
}

function addDays(dateStr, n) {
  const dt = new Date(dateStr);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split("T")[0];
}

function lessonForQuestionSet(day, questions) {
  const rd = roadmapForDay(day);
  const focusTopic = rd.focus;
  return {
    title: rd.title,
    tldr: `Today is about ${focusTopic}. On the PMP, the best answer usually comes from understanding the situation before taking visible action.`,
    keyPoints: [
      `Use ${focusTopic.toLowerCase()} to frame your next action.`,
      "Look for the answer that clarifies, aligns, or analyzes before it escalates or commits.",
      "In Agile, collaborate with the team and product owner rather than forcing work into the sprint.",
      "In predictive work, use formal change control when scope or baselines are affected.",
    ],
    example: questions[0]?.q || `A realistic scenario will ask what the project manager should do next when there is pressure but not enough clarity.`,
    pmMindset: "Analyze first, engage the right people, then act through the appropriate process.",
    focusTopic,
  };
}

function uniqueQuestionSelection(bank, answeredIds, count, filters = {}) {
  const unseen = bank.filter((q) => !answeredIds.includes(q.id));
  const pool = unseen.filter((q) => {
    if (filters.environment && q.environment !== filters.environment) return false;
    if (filters.topic && q.topic !== filters.topic) return false;
    if (filters.domains && !filters.domains.includes(q.domain)) return false;
    return true;
  });
  const source = pool.length >= count ? pool : unseen;
  return shuffle(source).slice(0, count);
}

function buildDailySession(profile, bank) {
  const day = profile.day;
  const rd = roadmapForDay(day);
  const questions = uniqueQuestionSelection(bank, profile.answeredIds, day < 25 ? 10 : 12);
  const today = TODAY();
  const dueCards = profile.flashcards.filter((c) => c.nextReview <= today);
  const unseenCards = profile.flashcards.filter((c) => !c.seen);
  const cards = [...dueCards];
  for (const card of unseenCards) {
    if (cards.length >= 15) break;
    if (!cards.find((c) => c.id === card.id)) cards.push(card);
  }
  return {
    kind: "daily",
    lesson: lessonForQuestionSet(day, questions),
    questions,
    flashcards: cards.slice(0, 15),
    roadmap: rd,
  };
}

function buildExam(profile, bank, full = false) {
  const count = full ? 180 : 60;
  const domains = shuffle(["People", "Process", "Business"]);
  const selected = uniqueQuestionSelection(bank, profile.answeredIds, count, { domains });
  return {
    kind: full ? "full" : "weekly",
    title: full ? "Full PMP Simulation" : "Weekly Assessment",
    questions: selected,
  };
}

function scoreReadiness(profile) {
  const uniqueAnswered = profile.answeredIds.length;
  const uniquePoints = Math.min(55, Math.round((uniqueAnswered / 400) * 55));
  const history = profile.scoreHistory || [];
  const avg = history.length ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : 0;
  return Math.min(100, uniquePoints + Math.round(avg * 0.45));
}

function dueFullExam(day, taken) {
  const required = [25, 40, 55];
  return required.find((d) => day >= d && !taken.includes(d)) || null;
}


function ProgressBar({ value, gradient = "linear-gradient(90deg, #06b6d4 0%, #8b5cf6 55%, #ec4899 100%)" }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.55)",
        borderRadius: 999,
        overflow: "hidden",
        height: 12,
        border: "1px solid rgba(148,163,184,0.18)",
        boxShadow: "inset 0 1px 2px rgba(15,23,42,0.06)"
      }}
    >
      <div
        style={{
          width: `${Math.min(100, value)}%`,
          height: "100%",
          background: gradient,
          borderRadius: 999,
          boxShadow: "0 6px 16px rgba(14,165,233,0.18)"
        }}
      />
    </div>
  );
}

function Badge({ children, tone = "default" }) {
  const tones = {
    default: { bg: "rgba(255,255,255,0.68)", color: "#334155", border: "rgba(148,163,184,0.24)" },
    cyan: { bg: "rgba(34,211,238,0.16)", color: "#155e75", border: "rgba(34,211,238,0.28)" },
    violet: { bg: "rgba(167,139,250,0.18)", color: "#5b21b6", border: "rgba(139,92,246,0.25)" },
    pink: { bg: "rgba(244,114,182,0.18)", color: "#9d174d", border: "rgba(244,114,182,0.26)" },
    amber: { bg: "rgba(251,191,36,0.2)", color: "#92400e", border: "rgba(251,191,36,0.3)" },
    emerald: { bg: "rgba(52,211,153,0.18)", color: "#065f46", border: "rgba(52,211,153,0.28)" },
    slate: { bg: "rgba(226,232,240,0.7)", color: "#334155", border: "rgba(148,163,184,0.22)" },
    rose: { bg: "rgba(251,113,133,0.16)", color: "#9f1239", border: "rgba(251,113,133,0.26)" },
  };
  const t = tones[tone] || tones.default;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, tone = "default", padding = 18 }) {
  const tones = {
    default: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.92))",
      border: "1px solid rgba(226,232,240,0.9)",
    },
    hero: {
      background: "linear-gradient(135deg, rgba(14,165,233,0.18), rgba(139,92,246,0.18) 52%, rgba(244,114,182,0.18))",
      border: "1px solid rgba(255,255,255,0.55)",
    },
    cyan: {
      background: "linear-gradient(135deg, rgba(236,254,255,0.94), rgba(224,242,254,0.92))",
      border: "1px solid rgba(34,211,238,0.22)",
    },
    violet: {
      background: "linear-gradient(135deg, rgba(245,243,255,0.95), rgba(237,233,254,0.92))",
      border: "1px solid rgba(139,92,246,0.22)",
    },
    pink: {
      background: "linear-gradient(135deg, rgba(253,242,248,0.96), rgba(252,231,243,0.92))",
      border: "1px solid rgba(244,114,182,0.22)",
    },
    amber: {
      background: "linear-gradient(135deg, rgba(255,251,235,0.96), rgba(254,243,199,0.9))",
      border: "1px solid rgba(245,158,11,0.22)",
    },
    emerald: {
      background: "linear-gradient(135deg, rgba(236,253,245,0.96), rgba(209,250,229,0.9))",
      border: "1px solid rgba(16,185,129,0.22)",
    },
    slate: {
      background: "linear-gradient(135deg, rgba(248,250,252,0.96), rgba(241,245,249,0.92))",
      border: "1px solid rgba(148,163,184,0.2)",
    },
    dark: {
      background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.96))",
      border: "1px solid rgba(99,102,241,0.22)",
    },
  };
  const t = tones[tone] || tones.default;
  return (
    <div
      style={{
        borderRadius: 24,
        padding,
        background: t.background,
        border: t.border,
        boxShadow: "0 16px 44px rgba(15,23,42,0.08)",
        backdropFilter: "blur(14px)",
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, onClick, disabled = false, variant = "primary" }) {
  const variants = {
    primary: {
      background: "linear-gradient(135deg, #06b6d4, #8b5cf6 62%, #ec4899)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.18)",
      shadow: "0 14px 30px rgba(139,92,246,0.28)",
    },
    secondary: {
      background: "linear-gradient(135deg, #0f172a, #334155)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.16)",
      shadow: "0 14px 30px rgba(15,23,42,0.2)",
    },
    soft: {
      background: "rgba(255,255,255,0.75)",
      color: "#334155",
      border: "1px solid rgba(148,163,184,0.26)",
      shadow: "0 10px 24px rgba(15,23,42,0.08)",
    },
    success: {
      background: "linear-gradient(135deg, #10b981, #14b8a6)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.18)",
      shadow: "0 14px 30px rgba(20,184,166,0.22)",
    },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 16px",
        borderRadius: 16,
        border: v.border,
        background: disabled ? "linear-gradient(135deg, #cbd5e1, #e2e8f0)" : v.background,
        color: disabled ? "#64748b" : v.color,
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 800,
        fontSize: 14,
        letterSpacing: 0.1,
        boxShadow: disabled ? "none" : v.shadow,
        transform: "translateZ(0)",
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, subtitle, tone = "default", progress, icon }) {
  return (
    <Card tone={tone}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
          <div style={{ fontSize: 30, fontWeight: 900, marginTop: 8, lineHeight: 1 }}>{value}</div>
          {subtitle ? <div style={{ marginTop: 8, color: "#475569", fontSize: 13 }}>{subtitle}</div> : null}
        </div>
        <div
          style={{
            minWidth: 44,
            height: 44,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            fontSize: 20,
            background: "rgba(255,255,255,0.68)",
            border: "1px solid rgba(255,255,255,0.78)",
            boxShadow: "0 8px 20px rgba(15,23,42,0.08)"
          }}
        >
          {icon}
        </div>
      </div>
      {typeof progress === "number" ? <div style={{ marginTop: 14 }}><ProgressBar value={progress} /></div> : null}
    </Card>
  );
}

function SectionHeader({ eyebrow, title, blurb, tone = "cyan" }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Badge tone={tone}>{eyebrow}</Badge>
      <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>{title}</div>
      {blurb ? <div style={{ color: "#475569", lineHeight: 1.55 }}>{blurb}</div> : null}
    </div>
  );
}

export default function App() {
  const bank = useMemo(() => generateQuestionBank(), []);
  const [profile, setProfile] = useState(() => safeLoad(bank));
  const [screen, setScreen] = useState("dashboard");
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [flashIndex, setFlashIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const readiness = scoreReadiness(profile);
    const next = { ...profile, readiness, lastUpdated: TODAY() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [profile]);

  const takenFullDays = profile.examHistory.filter((e) => e.kind === "full").map((e) => e.day);
  const dueExamDay = dueFullExam(profile.day, takenFullDays);
  const dueFlashcardsToday = profile.flashcards.filter((c) => c.nextReview <= TODAY() || !c.seen).slice(0, 15).length;

  const openDaily = () => {
    setSession(buildDailySession(profile, bank));
    setAnswers({});
    setScreen("session");
  };

  const openWeekly = () => {
    setSession(buildExam(profile, bank, false));
    setAnswers({});
    setScreen("exam");
  };

  const openFull = () => {
    setSession(buildExam(profile, bank, true));
    setAnswers({});
    setScreen("exam");
  };

  const openFlashcards = () => {
    const today = TODAY();
    const dueCards = profile.flashcards.filter((c) => c.nextReview <= today || !c.seen).slice(0, 15);
    setSession({ kind: "flashcards", flashcards: dueCards });
    setFlashIndex(0);
    setShowBack(false);
    setScreen("flashcards");
  };

  const submitQuestions = () => {
    if (!session?.questions?.length) return;
    const scored = session.questions.map((q) => ({ ...q, selected: answers[q.id] || null, correctFlag: answers[q.id] === q.correct }));
    const correctCount = scored.filter((q) => q.correctFlag).length;
    const percent = Math.round((correctCount / scored.length) * 100);
    const wrong = scored.filter((q) => !q.correctFlag);

    const newCards = wrong.flatMap((q, idx) => {
      const extra = TOPIC_TO_FLASHCARDS[q.topic] || [];
      const first = extra[0];
      return [
        {
          id: `miss-${q.id}`,
          front: `Missed: ${q.topic} — what was the best next action pattern here?`,
          back: q.explanation.correct,
          source: "mistake",
          seen: false,
          interval: 0,
          nextReview: TODAY(),
        },
        ...(first ? [{
          id: `topic-${q.topic}-${idx}-${profile.day}`,
          front: first[0],
          back: first[1],
          source: "topic",
          seen: false,
          interval: 0,
          nextReview: TODAY(),
        }] : []),
      ];
    });

    setProfile((prev) => {
      const answeredIds = Array.from(new Set([...prev.answeredIds, ...scored.map((q) => q.id)]));
      const flashcardsById = Object.fromEntries(prev.flashcards.map((c) => [c.id, c]));
      newCards.forEach((c) => {
        if (!flashcardsById[c.id]) flashcardsById[c.id] = c;
      });
      const wrongTopics = wrong.map((q) => q.topic);
      const topicCounts = wrongTopics.reduce((acc, topic) => ({ ...acc, [topic]: (acc[topic] || 0) + 1 }), {});
      const weakTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
      const examHistory = [...prev.examHistory];
      if (session.kind === "weekly" || session.kind === "full") {
        examHistory.push({ kind: session.kind, day: prev.day, score: percent });
      }
      return {
        ...prev,
        answeredIds,
        flashcards: Object.values(flashcardsById),
        scoreHistory: [...(prev.scoreHistory || []), percent],
        weakTopics,
        examHistory,
        day: Math.min(60, prev.day + 1),
      };
    });
    setSession({ ...session, results: scored, percent });
    setScreen("review");
  };

  const rateFlashcard = (quality) => {
    const card = session.flashcards[flashIndex];
    if (!card) return;
    setProfile((prev) => ({
      ...prev,
      flashcards: prev.flashcards.map((c) => c.id === card.id ? {
        ...c,
        seen: true,
        interval: nextInterval(c.interval || 0, quality),
        nextReview: addDays(TODAY(), nextInterval(c.interval || 0, quality)),
      } : c),
    }));
    if (flashIndex + 1 >= session.flashcards.length) {
      setScreen("dashboard");
    } else {
      setFlashIndex((x) => x + 1);
      setShowBack(false);
    }
  };

  const layout = {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 20,
    fontFamily: "Inter, ui-sans-serif, system-ui, Arial, sans-serif",
    minHeight: "100vh",
    color: "#0f172a",
    background:
      "radial-gradient(circle at top left, rgba(34,211,238,0.18), transparent 28%), radial-gradient(circle at top right, rgba(244,114,182,0.14), transparent 22%), linear-gradient(180deg, #f8fbff 0%, #f5f3ff 50%, #fff7ed 100%)",
  };

  return (
    <div style={layout}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          marginBottom: 20,
          paddingTop: 4,
        }}
      >
        <Card tone="hero" padding={20}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge tone="violet">PMBOK + Agile</Badge>
                <Badge tone="cyan">600-question bank</Badge>
                <Badge tone="pink">App mode</Badge>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1, fontWeight: 900 }}>PMP Coach</h1>
                <div style={{ color: "#334155", marginTop: 8, maxWidth: 680, lineHeight: 1.55 }}>
                  Your colorful study hub for daily lessons, better PMP-style questions, spaced-repetition flashcards, and full exam sims on Days 25, 40, and 55.
                </div>
              </div>
            </div>
            {screen !== "dashboard" && <Button onClick={() => setScreen("dashboard")} variant="secondary">Back to dashboard</Button>}
          </div>
        </Card>
      </div>

      {screen === "dashboard" && (
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <StatCard label="Current day" value={profile.day} subtitle={roadmapForDay(profile.day).focus} tone="cyan" icon="📅" />
            <StatCard label="Readiness" value={`${profile.readiness}%`} subtitle="Weighted by unique questions + exam performance" tone="violet" progress={profile.readiness} icon="⚡" />
            <StatCard label="Unique questions" value={`${profile.answeredIds.length} / 400`} subtitle="You are not done until the unique count climbs." tone="pink" progress={(profile.answeredIds.length / 400) * 100} icon="🎯" />
            <StatCard label="Flashcards today" value={dueFlashcardsToday} subtitle="Capped at 15 so Day 1 does not feel ridiculous." tone="amber" icon="🧠" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
            <Card tone="dark">
              <SectionHeader
                eyebrow="Today’s roadmap"
                title={roadmapForDay(profile.day).title}
                blurb={roadmapForDay(profile.day).lesson}
                tone="cyan"
              />
              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Badge tone="emerald">Focus: {roadmapForDay(profile.day).focus}</Badge>
                <Badge tone="slate">Exam sims: 25 • 40 • 55</Badge>
                <Badge tone="pink">Daily cards capped at 15</Badge>
              </div>
              {dueExamDay && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 18,
                    background: "rgba(251,191,36,0.16)",
                    color: "#fef3c7",
                    border: "1px solid rgba(251,191,36,0.24)",
                    lineHeight: 1.5
                  }}
                >
                  <strong style={{ color: "#fde68a" }}>Full exam due now.</strong> You’ve hit Day {dueExamDay}, so your next 180-question simulation is unlocked.
                </div>
              )}
            </Card>

            <Card tone="emerald">
              <SectionHeader
                eyebrow="Weak-topic spotlight"
                title={profile.weakTopics.length ? profile.weakTopics.join(", ") : "Not enough answer data yet"}
                blurb={profile.weakTopics.length ? "These topics are now driving more review pressure in the app." : "Once you answer more questions, this area will populate automatically."}
                tone="emerald"
              />
              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                <Badge tone="amber">Starter flashcards from Day 1</Badge>
                <Badge tone="violet">Missed questions create new cards</Badge>
                <Badge tone="cyan">Scenarios rotate by industry</Badge>
              </div>
            </Card>
          </div>

          <Card tone="default">
            <div style={{ display: "grid", gap: 12 }}>
              <SectionHeader
                eyebrow="Choose your mode"
                title="Today’s study actions"
                blurb="Same logic, better styling. The structure stays the same — the app just feels more alive again."
                tone="violet"
              />
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button onClick={openDaily}>Generate daily session</Button>
                <Button onClick={openFlashcards} variant="soft">Study flashcards</Button>
                <Button onClick={openWeekly} variant="secondary">Take weekly 60-question exam</Button>
                <Button onClick={openFull} variant="success" disabled={!dueExamDay}>Take full 180-question exam</Button>
              </div>
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card tone="cyan">
              <div style={{ fontWeight: 900, marginBottom: 10, fontSize: 18 }}>Why the question engine is stronger now</div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: "#164e63" }}>
                <li>Scenarios come from real project environments instead of abstract topic labels.</li>
                <li>Industries rotate so the app feels more like real life, not one fake template.</li>
                <li>Wrong answers are believable PMP traps rather than nonsense distractors.</li>
                <li>Correct answers still lean PMI: analyze, align, then act.</li>
              </ul>
            </Card>
            <Card tone="pink">
              <div style={{ fontWeight: 900, marginBottom: 10, fontSize: 18 }}>How the study rhythm works</div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: "#9d174d" }}>
                <li>Daily session = lesson + flashcards + PMP-style questions.</li>
                <li>Flashcards are definition-heavy and application-heavy, not just one or the other.</li>
                <li>Weekly exams keep the pressure on between full mock exams.</li>
                <li>Your readiness score moves as your question volume and performance improve.</li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {screen === "session" && session && (
        <div style={{ display: "grid", gap: 16 }}>
          <Card tone="hero">
            <SectionHeader eyebrow="Daily lesson" title={session.lesson.title} blurb={session.lesson.tldr} tone="violet" />
            <div style={{ marginTop: 14 }}>
              <ul style={{ lineHeight: 1.75, margin: 0, paddingLeft: 18 }}>
                {session.lesson.keyPoints.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </div>
          </Card>

          <Card tone="amber">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 900, marginBottom: 6, fontSize: 18 }}>Today’s flashcards</div>
                <div style={{ color: "#92400e" }}>{session.flashcards.length} cards are lined up. Review them in the flashcard mode with spaced repetition.</div>
              </div>
              <Badge tone="amber">Day cap: 15</Badge>
            </div>
          </Card>

          {session.questions.map((q, i) => (
            <Card key={q.id} tone={i % 3 === 0 ? "cyan" : i % 3 === 1 ? "violet" : "pink"}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <Badge tone="slate">{q.domain}</Badge>
                <Badge tone="violet">{q.topic}</Badge>
                <Badge tone="amber">{q.difficulty}</Badge>
                <Badge tone="cyan">{q.environment}</Badge>
              </div>
              <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 18, lineHeight: 1.55 }}>{i + 1}. {q.q}</div>
              <div style={{ display: "grid", gap: 10 }}>
                {q.choices.map((choice) => {
                  const letter = choice.split(".")[0];
                  const active = answers[q.id] === letter;
                  return (
                    <label
                      key={choice}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        padding: 12,
                        borderRadius: 16,
                        border: active ? "1px solid rgba(139,92,246,0.35)" : "1px solid rgba(148,163,184,0.18)",
                        background: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.54)",
                        boxShadow: active ? "0 10px 24px rgba(139,92,246,0.12)" : "none"
                      }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={active}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: letter }))}
                      />
                      <span>{choice}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={submitQuestions}>Submit session</Button>
          </div>
        </div>
      )}

      {screen === "exam" && session && (
        <div style={{ display: "grid", gap: 16 }}>
          <Card tone="dark">
            <SectionHeader
              eyebrow={session.kind === "full" ? "Full exam sim" : "Weekly exam"}
              title={session.title}
              blurb={`${session.questions.length} questions. Answer what you can, then review the rationale for every item.`}
              tone="pink"
            />
          </Card>
          {session.questions.map((q, i) => (
            <Card key={q.id} tone="default">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <Badge tone="slate">{q.domain}</Badge>
                <Badge tone="cyan">{q.topic}</Badge>
                <Badge tone="amber">{q.difficulty}</Badge>
                <Badge tone="rose">{q.industry}</Badge>
              </div>
              <div style={{ fontWeight: 800, marginBottom: 12, lineHeight: 1.55 }}>{i + 1}. {q.q}</div>
              <div style={{ display: "grid", gap: 10 }}>
                {q.choices.map((choice) => {
                  const letter = choice.split(".")[0];
                  const active = answers[q.id] === letter;
                  return (
                    <label
                      key={choice}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: 12,
                        borderRadius: 16,
                        border: active ? "1px solid rgba(6,182,212,0.35)" : "1px solid rgba(148,163,184,0.18)",
                        background: active ? "rgba(236,254,255,0.9)" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={active}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: letter }))}
                      />
                      <span>{choice}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={submitQuestions} variant="secondary">Submit exam</Button>
          </div>
        </div>
      )}

      {screen === "review" && session?.results && (
        <div style={{ display: "grid", gap: 16 }}>
          <Card tone="hero">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 26 }}>Score: {session.percent}%</div>
                <div style={{ color: "#475569", marginTop: 6 }}>Review every question. Missed questions automatically create fresh flashcards.</div>
              </div>
              <Badge tone={session.percent >= 80 ? "emerald" : session.percent >= 65 ? "amber" : "rose"}>
                {session.percent >= 80 ? "Strong session" : session.percent >= 65 ? "Needs tightening" : "Heavy review needed"}
              </Badge>
            </div>
          </Card>
          {session.results.map((q, i) => (
            <Card key={q.id} tone={q.correctFlag ? "emerald" : "pink"}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <Badge tone="slate">{q.domain}</Badge>
                <Badge tone="violet">{q.topic}</Badge>
                <Badge tone="rose">{q.trap}</Badge>
              </div>
              <div style={{ fontWeight: 800, lineHeight: 1.55 }}>{i + 1}. {q.q}</div>
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {q.choices.map((choice) => {
                  const letter = choice.split(".")[0];
                  const isCorrect = letter === q.correct;
                  const isSelected = letter === q.selected;
                  return (
                    <div
                      key={choice}
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        background: isCorrect ? "rgba(220,252,231,0.92)" : isSelected ? "rgba(254,226,226,0.92)" : "rgba(255,255,255,0.72)",
                        border: isCorrect ? "1px solid rgba(34,197,94,0.28)" : isSelected ? "1px solid rgba(248,113,113,0.28)" : "1px solid rgba(148,163,184,0.18)"
                      }}
                    >
                      {choice}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 14 }}><strong>Correct answer:</strong> {q.correct}</div>
              <div style={{ marginTop: 8, lineHeight: 1.6 }}><strong>Why the correct answer is correct:</strong> {q.explanation.correct}</div>
              {["A", "B", "C", "D"].map((letter) => (
                <div key={letter} style={{ marginTop: 6, lineHeight: 1.6 }}>
                  <strong>{letter}:</strong> {q.explanation[letter]}
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {screen === "flashcards" && session?.flashcards?.length > 0 && (
        <div style={{ display: "grid", gap: 16, maxWidth: 820, margin: "0 auto" }}>
          <Card tone="hero">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>Flashcard {flashIndex + 1} of {session.flashcards.length}</div>
              <Badge tone="amber">Spaced repetition mode</Badge>
            </div>
          </Card>
          <Card tone="dark" padding={28}>
            <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 16, lineHeight: 1.35, color: "#f8fafc" }}>
              {session.flashcards[flashIndex].front}
            </div>
            {showBack ? (
              <div
                style={{
                  fontSize: 18,
                  color: "#e2e8f0",
                  lineHeight: 1.7,
                  padding: 18,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)"
                }}
              >
                {session.flashcards[flashIndex].back}
              </div>
            ) : (
              <div style={{ color: "#cbd5e1" }}>Tap “Show answer” when you’re ready to flip this card.</div>
            )}
          </Card>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {!showBack && <Button onClick={() => setShowBack(true)}>Show answer</Button>}
            {showBack && (
              <>
                <Button onClick={() => rateFlashcard("hard")} variant="soft">Again soon</Button>
                <Button onClick={() => rateFlashcard("medium")} variant="primary">Good</Button>
                <Button onClick={() => rateFlashcard("easy")} variant="success">Easy</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
