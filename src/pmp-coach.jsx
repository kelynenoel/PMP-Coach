
import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "pmpCoachFullV1";

const COLORS = {
  bg: "#0b1020",
  panel: "#131a2b",
  panel2: "#0f1524",
  text: "#eef3ff",
  muted: "#a7b1c9",
  gold: "#f1c75b",
  green: "#5bd6a6",
  red: "#ff7e7e",
  blue: "#67b7ff",
  border: "#25304a",
  chip: "#1a2236",
};

const DOMAIN_WEIGHTS = { people: 42, process: 50, biz: 8 };

const DAY_PLAN = [
  { title: "Orientation + PMP mindset", domain: "process", mode: "hybrid", focus: ["Ethics", "Mindset", "Exam Structure"], lesson: "PMI tests judgment, not memorization. Choose proactive, ethical, stakeholder-aware actions." },
  { title: "Projects, programs, portfolios, operations", domain: "process", mode: "predictive", focus: ["Foundations", "Org Structures"], lesson: "Projects are temporary and unique. Operations are ongoing. Authority varies by organizational structure." },
  { title: "Org structures + PM authority", domain: "people", mode: "predictive", focus: ["Org Structures", "Roles"], lesson: "Know who controls resources in functional, matrix, and projectized structures." },
  { title: "Code of Ethics + servant leadership", domain: "people", mode: "hybrid", focus: ["Ethics", "Leadership"], lesson: "Responsibility, respect, fairness, and honesty apply in both predictive and agile contexts." },
  { title: "Value delivery + outcomes vs outputs", domain: "biz", mode: "hybrid", focus: ["Value", "Benefits"], lesson: "PMI cares about value delivered, not just finishing on time and budget." },
  { title: "EEFs vs OPAs", domain: "process", mode: "predictive", focus: ["Environment", "Knowledge"], lesson: "Respond to EEFs; update OPAs. This distinction is tested often." },
  { title: "7 project functions + PM roles", domain: "people", mode: "hybrid", focus: ["Functions", "Roles"], lesson: "Functions stay constant across methods; the roles performing them vary by context." },
  { title: "Principles overview", domain: "process", mode: "hybrid", focus: ["Principles", "Tailoring"], lesson: "The PMBOK 8 structure is principle-based, value-focused, and approach-agnostic." },
  { title: "Holistic view + systems thinking", domain: "process", mode: "hybrid", focus: ["Principles", "Complexity"], lesson: "Projects are systems. A change in one area affects others." },
  { title: "Value + quality principles", domain: "biz", mode: "hybrid", focus: ["Value", "Quality"], lesson: "Deliver usable value early and build quality in rather than inspect it in at the end." },
  { title: "Sustainability + accountable leadership", domain: "people", mode: "hybrid", focus: ["Leadership", "Sustainability"], lesson: "Leaders own decisions, protect ethics, and consider long-term effects." },
  { title: "Empowered culture + navigate complexity", domain: "people", mode: "agile", focus: ["Culture", "Complexity"], lesson: "Psychological safety, adaptation, and learning matter in complex work." },
  { title: "Life cycles: predictive, iterative, incremental, agile, hybrid", domain: "process", mode: "hybrid", focus: ["Life Cycles", "Tailoring"], lesson: "Match the approach to uncertainty, volatility, feedback needs, and regulatory constraints." },
  { title: "Focus areas", domain: "process", mode: "hybrid", focus: ["Focus Areas"], lesson: "Initiating, Planning, Executing, Monitoring & Controlling, and Closing can overlap." },
  { title: "Governance: charter, PM plan, change control", domain: "process", mode: "predictive", focus: ["Governance", "Change Control"], lesson: "Formal governance defines decisions, baselines, and accountability." },
  { title: "Integrated change control + CCB", domain: "process", mode: "predictive", focus: ["Governance", "Change Control"], lesson: "Document, review, approve, update baselines, communicate, and verify." },
  { title: "Scope fundamentals + WBS", domain: "process", mode: "predictive", focus: ["Scope", "WBS"], lesson: "Product scope is what; project scope is work. The WBS supports estimating and control." },
  { title: "Validate scope vs control scope", domain: "process", mode: "predictive", focus: ["Scope", "Stakeholders"], lesson: "Validate scope is formal acceptance; control scope manages changes and prevents creep." },
  { title: "Schedule basics + dependencies + critical path", domain: "process", mode: "predictive", focus: ["Schedule", "Network"], lesson: "The critical path determines earliest finish and has zero total float." },
  { title: "Estimating + PERT + reserve concepts", domain: "process", mode: "predictive", focus: ["Schedule", "Estimation"], lesson: "Use the right estimate for the context and know contingency versus management reserve." },
  { title: "Cost basics + EVM intro", domain: "process", mode: "predictive", focus: ["Finance", "EVM"], lesson: "Know PV, EV, AC and what CPI and SPI imply." },
  { title: "Forecasting: EAC, ETC, VAC, TCPI", domain: "process", mode: "predictive", focus: ["Finance", "EVM"], lesson: "Forecasting formulas turn cost data into action." },
  { title: "Quality management", domain: "process", mode: "hybrid", focus: ["Quality", "Continuous Improvement"], lesson: "Prevention over inspection. In agile, quality is built into every iteration." },
  { title: "Resources + motivation + conflict", domain: "people", mode: "hybrid", focus: ["Resources", "Conflict"], lesson: "Resolve conflict early and choose the right technique for the situation." },
  { title: "FULL EXAM 1", domain: "process", mode: "hybrid", focus: ["Full Exam"], lesson: "Take a 180-question exam today." },
  { title: "Exam review + weak areas", domain: "process", mode: "hybrid", focus: ["Review", "Weak Areas"], lesson: "Use exam results to target the biggest gaps, not to panic." },
  { title: "Stakeholder identification + engagement", domain: "people", mode: "hybrid", focus: ["Stakeholders", "Communication"], lesson: "Map power, interest, and engagement, then tailor communications." },
  { title: "Communications planning + channels", domain: "people", mode: "hybrid", focus: ["Communication", "Stakeholders"], lesson: "The right message, audience, timing, and channel matter." },
  { title: "Risk identification + qualitative analysis", domain: "process", mode: "hybrid", focus: ["Risk"], lesson: "Risks are uncertain events. Issues are happening now." },
  { title: "Risk response + EMV + escalation", domain: "process", mode: "hybrid", focus: ["Risk", "Quantitative"], lesson: "Threats and opportunities have different responses; escalation is sometimes appropriate." },
  { title: "Procurement + contracts", domain: "process", mode: "predictive", focus: ["Procurement", "Contracts"], lesson: "Choose the contract type that best allocates risk for the situation." },
  { title: "Benefits + business environment", domain: "biz", mode: "hybrid", focus: ["Benefits", "Business"], lesson: "Keep the project tied to strategy, compliance, and benefits realization." },
  { title: "Agile manifesto + values", domain: "people", mode: "agile", focus: ["Agile Mindset"], lesson: "Individuals and interactions, customer collaboration, and responding to change shape agile choices." },
  { title: "Backlog, refinement, prioritization", domain: "process", mode: "agile", focus: ["Backlog", "Prioritization"], lesson: "Requirements live in the backlog and are refined continuously." },
  { title: "Scrum roles + events + artifacts", domain: "people", mode: "agile", focus: ["Scrum", "Roles"], lesson: "Know what the Product Owner, Scrum Master, and team own." },
  { title: "Kanban, flow, WIP, metrics", domain: "process", mode: "agile", focus: ["Kanban", "Flow"], lesson: "Visualize work, limit WIP, and optimize flow." },
  { title: "Servant leadership + team empowerment", domain: "people", mode: "agile", focus: ["Leadership", "Agile"], lesson: "Remove impediments, coach, and create psychological safety." },
  { title: "Hybrid tailoring", domain: "process", mode: "hybrid", focus: ["Hybrid", "Tailoring"], lesson: "Combine governance and agility intentionally rather than randomly." },
  { title: "FULL EXAM 2", domain: "process", mode: "hybrid", focus: ["Full Exam"], lesson: "Take a 180-question exam today." },
  { title: "Exam review + remediation", domain: "process", mode: "hybrid", focus: ["Review", "Weak Areas"], lesson: "Turn misses into flashcards and targeted drills." },
  { title: "Agile estimation + velocity", domain: "process", mode: "agile", focus: ["Estimation", "Velocity"], lesson: "Use relative estimation, empirical data, and trends instead of false precision." },
  { title: "Agile quality + retrospectives", domain: "people", mode: "agile", focus: ["Quality", "Retrospectives"], lesson: "Inspect and adapt frequently; retrospectives change the process, not the product backlog." },
  { title: "Agile contracts + stakeholder transparency", domain: "biz", mode: "agile", focus: ["Contracts", "Transparency"], lesson: "Invite feedback early and structure contracts to support learning when possible." },
  { title: "Advanced governance + data/info/reports", domain: "process", mode: "predictive", focus: ["Governance", "Reports"], lesson: "Data becomes information, then reports for stakeholders." },
  { title: "Advanced change scenarios", domain: "process", mode: "hybrid", focus: ["Change Control", "Agile Change"], lesson: "Predictive changes go through formal control; agile changes are often absorbed through backlog reprioritization." },
  { title: "Advanced stakeholder conflict", domain: "people", mode: "hybrid", focus: ["Conflict", "Negotiation"], lesson: "Listen, understand interests, and solve for value before escalating." },
  { title: "Business environment + compliance", domain: "biz", mode: "hybrid", focus: ["Compliance", "Business"], lesson: "Projects must respect regulation, governance, and organizational strategy." },
  { title: "Critical path + crashing/fast tracking", domain: "process", mode: "predictive", focus: ["Schedule", "Compression"], lesson: "Compress carefully; every tactic creates risk." },
  { title: "Forecasting mixed questions", domain: "process", mode: "predictive", focus: ["Finance", "Forecasting"], lesson: "Read the scenario closely to know which EAC formula fits." },
  { title: "Agile scaling + distributed teams", domain: "people", mode: "agile", focus: ["Scaling", "Teams"], lesson: "Scale only as needed and keep transparency high across teams." },
  { title: "FULL EXAM 3", domain: "process", mode: "hybrid", focus: ["Full Exam"], lesson: "Take your final 180-question exam today." },
  { title: "Final gap review", domain: "process", mode: "hybrid", focus: ["Review", "Weak Areas"], lesson: "Target the few concepts still causing errors." },
  { title: "Formula sprint", domain: "process", mode: "predictive", focus: ["Finance", "Schedule"], lesson: "Memorize and apply formulas in context." },
  { title: "Agile sprint review", domain: "people", mode: "agile", focus: ["Agile", "Mindset"], lesson: "Focus on empiricism, value, team ownership, and adaptation." },
  { title: "PMI trap review", domain: "people", mode: "hybrid", focus: ["Mindset", "Ethics"], lesson: "Avoid reactive, secretive, or unethical choices." },
  { title: "Mixed drill day", domain: "process", mode: "hybrid", focus: ["Mixed"], lesson: "Use unseen questions only and close remaining gaps." },
  { title: "Final readiness check", domain: "biz", mode: "hybrid", focus: ["Readiness"], lesson: "Review patterns, not every note. Trust your process and mindset." },
  { title: "Exam strategy + confidence", domain: "people", mode: "hybrid", focus: ["Strategy", "Mindset"], lesson: "Stay calm, manage time, and pick the best next action." },
];

const TOPICS = [
  {
    key: "ethics",
    name: "Ethics and PMI mindset",
    domain: "people",
    mode: "hybrid",
    keywords: ["ethics", "responsibility", "respect", "fairness", "honesty", "mindset"],
    summary: "Pick proactive, ethical, transparent actions. Refuse unethical asks and escalate appropriately.",
    points: [
      "Eliminate unethical choices first.",
      "Do not hide risks or bad news.",
      "Choose calm, proactive, stakeholder-aware actions.",
      "Document and follow process when needed."
    ],
    flashcards: [
      ["PMI Code of Ethics core values", "Responsibility, Respect, Fairness, Honesty."],
      ["Best PMI mindset shortcut", "Choose the calm, proactive, ethical senior PM action."],
      ["If asked to hide a known risk", "Refuse, explain, and present the risk with a mitigation plan."],
    ],
    distractors: ["hide the issue", "wait and see", "blame a team member"],
  },
  {
    key: "foundations",
    name: "Projects, programs, portfolios, operations",
    domain: "process",
    mode: "predictive",
    keywords: ["project", "program", "portfolio", "operations"],
    summary: "Projects are temporary and unique. Operations are ongoing. Programs coordinate related projects; portfolios align work to strategy.",
    points: [
      "Projects have a start and end.",
      "Operations sustain the business.",
      "Programs coordinate related projects.",
      "Portfolios optimize strategic investment."
    ],
    flashcards: [
      ["Project", "A temporary endeavor undertaken to create a unique product, service, or result."],
      ["Operations", "Ongoing work that sustains the organization and has no defined end."],
      ["Program vs portfolio", "Programs manage related projects for benefits; portfolios align investments to strategy."],
    ],
    distractors: ["treat operations as a project", "ignore uniqueness", "confuse program with portfolio"],
  },
  {
    key: "org",
    name: "Organizational structures and authority",
    domain: "people",
    mode: "predictive",
    keywords: ["functional", "matrix", "projectized", "authority"],
    summary: "PM authority grows from functional to projectized. Resource control varies by structure.",
    points: [
      "Functional = little PM authority.",
      "Balanced matrix = shared authority.",
      "Projectized = highest PM authority.",
      "Structure shapes escalation and staffing."
    ],
    flashcards: [
      ["Weakest PM authority", "Functional organization."],
      ["Highest PM authority", "Projectized organization."],
      ["Balanced matrix", "Authority is shared between PM and functional manager."],
    ],
    distractors: ["assume PM controls all resources", "ignore functional manager", "escalate without understanding structure"],
  },
  {
    key: "value",
    name: "Value, benefits, outputs, outcomes",
    domain: "biz",
    mode: "hybrid",
    keywords: ["value", "benefits", "outcomes", "outputs"],
    summary: "Success is not only time and cost. Outputs should create outcomes that produce benefits and value.",
    points: [
      "Outputs are what the project produces.",
      "Outcomes are changes created by using outputs.",
      "Benefits flow from outcomes.",
      "Value is the reason the work matters."
    ],
    flashcards: [
      ["Output vs outcome", "Output = what is produced; outcome = the change that results from using it."],
      ["Project success from PMI view", "Success depends on value and intended outcomes, not just time/cost."],
      ["Benefits realization", "The ongoing process of ensuring expected value is achieved from project outputs."],
    ],
    distractors: ["measure only schedule", "ignore user adoption", "close project without value check"],
  },
  {
    key: "eefs-opas",
    name: "EEFs and OPAs",
    domain: "process",
    mode: "predictive",
    keywords: ["eef", "opa", "policies", "lessons learned"],
    summary: "EEFs are conditions around the project. OPAs are internal assets like templates, procedures, and lessons learned.",
    points: [
      "Laws and market conditions are EEFs.",
      "Templates and procedures are OPAs.",
      "Lessons learned repositories are OPAs.",
      "Projects respond to EEFs and can update OPAs."
    ],
    flashcards: [
      ["EEF", "Environmental condition outside the team's direct control, such as regulation or market conditions."],
      ["OPA", "Organizational asset such as templates, procedures, and knowledge repositories."],
      ["Can the team update an OPA?", "Yes, for example by adding lessons learned."],
    ],
    distractors: ["treat a law as an OPA", "try to change an EEF", "skip lessons learned"],
  },
  {
    key: "functions-roles",
    name: "Functions, roles, sponsor, Scrum Master, Product Owner",
    domain: "people",
    mode: "hybrid",
    keywords: ["sponsor", "scrum master", "product owner", "roles"],
    summary: "Functions are universal, but who performs them changes by context. Sponsors authorize and support; Scrum Masters facilitate; Product Owners maximize value.",
    points: [
      "Sponsor approves the charter.",
      "Scrum Master coaches and removes impediments.",
      "Product Owner prioritizes backlog for value.",
      "Project manager aligns work and stakeholders."
    ],
    flashcards: [
      ["Who approves the charter?", "The sponsor or authorizing entity, not the PM."],
      ["Scrum Master", "Servant leader who facilitates and removes impediments but does not direct the team's work."],
      ["Product Owner", "Represents value and prioritizes the backlog."],
    ],
    distractors: ["PM signs the charter", "Scrum Master assigns all tasks", "ignore sponsor role"],
  },
  {
    key: "principles",
    name: "PMBOK 8 principles and focus areas",
    domain: "process",
    mode: "hybrid",
    keywords: ["principles", "focus areas", "performance domains"],
    summary: "The standard is principle-based, while the guide operationalizes those principles through performance domains and focus areas.",
    points: [
      "Principles guide behavior across contexts.",
      "Focus areas can overlap.",
      "Performance domains are interconnected.",
      "Tailoring is a first-class concept."
    ],
    flashcards: [
      ["Focus areas", "Initiating, Planning, Executing, Monitoring & Controlling, Closing."],
      ["Tailoring", "Adapting the approach to fit the project's context."],
      ["PMBOK 8 structure", "Principles + performance domains + focus areas + processes."],
    ],
    distractors: ["apply one-size-fits-all", "treat focus areas as phases", "ignore tailoring"],
  },
  {
    key: "life-cycles",
    name: "Life cycle selection and tailoring",
    domain: "process",
    mode: "hybrid",
    keywords: ["predictive", "iterative", "incremental", "agile", "hybrid"],
    summary: "Choose the development approach that fits uncertainty, feedback cadence, regulation, and complexity.",
    points: [
      "Predictive works well when scope is stable and compliance is high.",
      "Agile works well with uncertainty and frequent feedback.",
      "Hybrid fits mixed stability and uncertainty.",
      "Tailoring is about fit, not fashion."
    ],
    flashcards: [
      ["When is predictive usually strongest?", "When requirements are stable, scope is defined, and control/compliance matter."],
      ["When is agile usually strongest?", "When requirements are emerging and frequent feedback is needed."],
      ["Hybrid", "A deliberate combination of predictive and adaptive elements."],
    ],
    distractors: ["default to agile always", "ignore regulatory needs", "pick approach without context"],
  },
  {
    key: "governance",
    name: "Governance, charter, PM plan, change control",
    domain: "process",
    mode: "predictive",
    keywords: ["charter", "pm plan", "governance", "ccb"],
    summary: "Governance defines decision rights, accountability, and how performance is monitored and controlled.",
    points: [
      "The charter authorizes the project and the PM.",
      "The PM plan integrates subsidiary plans and baselines.",
      "Changes to baselines require formal review.",
      "Governance should be right-sized."
    ],
    flashcards: [
      ["Project charter", "Formally authorizes the project and gives the PM authority to apply resources."],
      ["PM plan", "The integrated document that describes how the project will be executed, monitored, controlled, and closed."],
      ["CCB", "Formal group responsible for reviewing and deciding on change requests when applicable."],
    ],
    distractors: ["change scope informally", "skip sponsor approval", "ignore baselines"],
  },
  {
    key: "scope",
    name: "Scope, WBS, validate scope, control scope",
    domain: "process",
    mode: "predictive",
    keywords: ["scope", "wbs", "validate", "control"],
    summary: "Scope clarifies what the project will deliver and the work needed to do it. Validate scope is acceptance; control scope prevents creep.",
    points: [
      "Product scope describes features and functions.",
      "Project scope describes the work to deliver them.",
      "The WBS decomposes work into manageable packages.",
      "Formal acceptance differs from change control."
    ],
    flashcards: [
      ["Scope baseline", "Scope statement + WBS + WBS dictionary."],
      ["Validate scope", "Formal acceptance of completed deliverables."],
      ["Control scope", "Monitoring scope status and managing changes to the scope baseline."],
    ],
    distractors: ["accept deliverables without validation", "add scope without change control", "confuse product and project scope"],
  },
  {
    key: "schedule",
    name: "Schedule, dependencies, critical path, compression",
    domain: "process",
    mode: "predictive",
    keywords: ["critical path", "float", "dependencies", "crashing", "fast tracking"],
    summary: "Build realistic schedules, understand critical path and float, and compress carefully when needed.",
    points: [
      "Critical path determines shortest project duration.",
      "Tasks on the critical path have zero total float.",
      "Crashing adds resources at extra cost.",
      "Fast tracking overlaps work and increases risk."
    ],
    flashcards: [
      ["Critical path", "The longest duration path through the network; it determines project duration."],
      ["Crashing", "Adding resources to shorten duration, usually at increased cost."],
      ["Fast tracking", "Overlapping activities that were planned in sequence, increasing risk."],
    ],
    distractors: ["compress noncritical work first", "ignore new risk", "assume all delays matter equally"],
  },
  {
    key: "estimating",
    name: "Estimating, PERT, reserves",
    domain: "process",
    mode: "predictive",
    keywords: ["pert", "reserve", "contingency", "management reserve"],
    summary: "Use the right estimating method and know where reserves belong.",
    points: [
      "PERT = (O + 4M + P) / 6.",
      "Contingency reserve is for known-unknowns.",
      "Management reserve is for unknown-unknowns.",
      "Estimate progressively when uncertainty is high."
    ],
    flashcards: [
      ["PERT formula", "(Optimistic + 4 × Most Likely + Pessimistic) / 6."],
      ["Contingency reserve", "Time or money set aside for identified risks."],
      ["Management reserve", "Reserve for unforeseen work within project scope but outside the performance baseline."],
    ],
    distractors: ["use reserve interchangeably", "ignore uncertainty", "present rough estimate as exact"],
  },
  {
    key: "evm",
    name: "Earned value and forecasting",
    domain: "process",
    mode: "predictive",
    keywords: ["pv", "ev", "ac", "cpi", "spi", "eac", "etc", "vac", "tcpi"],
    summary: "EVM turns performance data into insight about cost and schedule efficiency and likely outcomes.",
    points: [
      "CPI = EV / AC.",
      "SPI = EV / PV.",
      "VAC = BAC - EAC.",
      "Read the scenario before choosing an EAC formula."
    ],
    flashcards: [
      ["CPI", "EV / AC. Greater than 1 means under budget."],
      ["SPI", "EV / PV. Greater than 1 means ahead of schedule."],
      ["VAC", "BAC - EAC. Negative means projected over budget."],
      ["TCPI", "(BAC - EV) / (BAC - AC) or (BAC - EV) / (EAC - AC), depending on the target."],
    ],
    distractors: ["swap SPI and CPI", "ignore whether variance is favorable", "choose formula by memory only"],
  },
  {
    key: "quality",
    name: "Quality and continuous improvement",
    domain: "process",
    mode: "hybrid",
    keywords: ["quality", "qa", "qc", "retrospective"],
    summary: "Plan quality, build it in, inspect results, and improve the process continuously.",
    points: [
      "Prevention is preferred over inspection.",
      "Manage quality improves the process.",
      "Control quality checks results.",
      "Agile teams inspect and adapt frequently."
    ],
    flashcards: [
      ["Quality assurance vs control", "QA improves the process; QC inspects the deliverable/results."],
      ["Retrospective", "A recurring agile event to improve how the team works."],
      ["Cost of quality", "Prevention and appraisal costs versus failure costs."],
    ],
    distractors: ["inspect quality only at the end", "skip root cause analysis", "treat retrospectives as blame sessions"],
  },
  {
    key: "resources-conflict",
    name: "Team development, motivation, conflict management",
    domain: "people",
    mode: "hybrid",
    keywords: ["conflict", "team", "motivation", "servant leader"],
    summary: "Develop the team, resolve conflict early, and remove obstacles so people can do their best work.",
    points: [
      "Address conflict, do not ignore it.",
      "Collaborate/problem solve for lasting solutions.",
      "Servant leaders enable rather than command.",
      "Psychological safety helps performance."
    ],
    flashcards: [
      ["Best conflict technique for lasting resolution", "Collaborate / problem solve."],
      ["Servant leadership", "Lead by serving the team, removing impediments, and enabling performance."],
      ["Psychological safety", "An environment where team members can speak up without fear."],
    ],
    distractors: ["force without context", "avoid indefinitely", "publicly shame team members"],
  },
  {
    key: "stakeholders-comms",
    name: "Stakeholders and communications",
    domain: "people",
    mode: "hybrid",
    keywords: ["stakeholder", "communication", "channels", "engagement"],
    summary: "Know who matters, what they need, and how to communicate in the right way at the right time.",
    points: [
      "Identify stakeholders early.",
      "Plan communications by audience and need.",
      "Monitor engagement and adjust.",
      "Transparency reduces surprises."
    ],
    flashcards: [
      ["Communication channels formula", "n(n - 1) / 2."],
      ["Stakeholder engagement plan", "Defines strategies to engage stakeholders effectively."],
      ["First step when key stakeholder is unhappy", "Understand the issue and review engagement/communication needs."],
    ],
    distractors: ["send the same message to everyone", "wait for conflict to grow", "ignore stakeholder power and interest"],
  },
  {
    key: "risk",
    name: "Risk identification, analysis, responses, EMV",
    domain: "process",
    mode: "hybrid",
    keywords: ["risk", "issue", "emv", "qualitative", "response"],
    summary: "Risk is uncertain. Identify it, analyze it, choose a response, and revisit it over time.",
    points: [
      "Issues are occurring now; risks may happen in the future.",
      "Threat responses include avoid, mitigate, transfer, accept, escalate.",
      "Opportunity responses include exploit, enhance, share, accept, escalate.",
      "EMV = probability × impact."
    ],
    flashcards: [
      ["Risk vs issue", "Risk is uncertain future event; issue is current problem."],
      ["EMV", "Expected Monetary Value = probability × impact."],
      ["Threat response examples", "Avoid, mitigate, transfer, accept, escalate."],
    ],
    distractors: ["treat issue as risk", "respond without analysis", "hide risk register items"],
  },
  {
    key: "procurement",
    name: "Procurement and contracts",
    domain: "process",
    mode: "predictive",
    keywords: ["procurement", "contracts", "vendor", "risk allocation"],
    summary: "Contract choice allocates cost and risk differently across buyer and seller.",
    points: [
      "FFP places more cost risk on seller.",
      "Cost-reimbursable places more risk on buyer.",
      "T&M is a hybrid contract type.",
      "Monitor vendor performance and relationships."
    ],
    flashcards: [
      ["Firm Fixed Price", "Seller carries more cost risk because price is fixed."],
      ["Cost Plus Incentive Fee", "Buyer reimburses costs plus incentive tied to performance."],
      ["Time and Materials", "Hybrid contract, often used when scope is not fully defined."],
    ],
    distractors: ["pick contract without risk lens", "skip procurement management", "ignore relationship management"],
  },
  {
    key: "business",
    name: "Business environment, benefits, compliance",
    domain: "biz",
    mode: "hybrid",
    keywords: ["business environment", "compliance", "strategy", "benefits"],
    summary: "Projects operate inside strategy, governance, compliance, and benefits realization systems.",
    points: [
      "Connect project decisions to strategy.",
      "Respect legal and regulatory constraints.",
      "Track whether outcomes support intended benefits.",
      "Escalate when business environment changes threaten value."
    ],
    flashcards: [
      ["Business environment domain", "The external and internal context that can affect project value and success."],
      ["Benefits realization", "Ensuring expected business value is achieved after outputs are delivered."],
      ["Regulatory change during project", "Assess impact and update plans/governance as needed."],
    ],
    distractors: ["ignore strategy", "ship noncompliant work", "focus only on team convenience"],
  },
  {
    key: "agile-mindset",
    name: "Agile mindset, values, principles",
    domain: "people",
    mode: "agile",
    keywords: ["agile", "manifesto", "values", "principles"],
    summary: "Agile emphasizes people, collaboration, feedback, adaptation, and early value delivery.",
    points: [
      "Respond to change rather than blindly following a plan.",
      "Collaborate with customers continuously.",
      "Deliver valuable increments early and often.",
      "Reflect and improve regularly."
    ],
    flashcards: [
      ["Agile value", "Individuals and interactions over processes and tools."],
      ["Agile value", "Customer collaboration over contract negotiation."],
      ["Agile value", "Responding to change over following a plan."],
    ],
    distractors: ["freeze scope too early", "optimize documentation over value", "treat retrospectives as optional"],
  },
  {
    key: "backlog",
    name: "Backlog, refinement, prioritization, user stories",
    domain: "process",
    mode: "agile",
    keywords: ["backlog", "refinement", "user story", "priority"],
    summary: "In agile, requirements live in the backlog and are refined continuously for clarity and value.",
    points: [
      "The Product Owner owns prioritization.",
      "Refinement improves readiness and understanding.",
      "User stories express value from a user perspective.",
      "Definition of Done matters."
    ],
    flashcards: [
      ["Backlog", "Ordered list of work items, requirements, or user stories."],
      ["Backlog refinement", "Ongoing activity to clarify, size, and reprioritize work items."],
      ["Definition of Done", "Shared understanding of what complete means for the team."],
    ],
    distractors: ["PM reprioritizes backlog alone", "treat backlog as frozen", "start work without clarity"],
  },
  {
    key: "scrum",
    name: "Scrum roles, events, artifacts",
    domain: "people",
    mode: "agile",
    keywords: ["scrum", "product owner", "scrum master", "daily standup", "review", "retro"],
    summary: "Scrum has clear roles, events, and artifacts that support empirical delivery and learning.",
    points: [
      "Daily standups synchronize work.",
      "Reviews inspect product increments with stakeholders.",
      "Retrospectives improve the process.",
      "The team self-manages its work."
    ],
    flashcards: [
      ["Daily standup purpose", "Synchronize the team and surface impediments."],
      ["Sprint review purpose", "Inspect the increment with stakeholders and gather feedback."],
      ["Sprint retrospective purpose", "Improve how the team works."],
    ],
    distractors: ["manager runs standup as status meeting", "Scrum Master assigns tasks", "skip review feedback"],
  },
  {
    key: "kanban",
    name: "Kanban, flow, WIP, cycle time",
    domain: "process",
    mode: "agile",
    keywords: ["kanban", "wip", "flow", "cycle time", "throughput"],
    summary: "Kanban visualizes work, limits WIP, and aims to improve flow and cycle time.",
    points: [
      "Visualize workflow.",
      "Limit WIP to expose bottlenecks.",
      "Manage flow, not just activity.",
      "Use metrics like throughput and cycle time."
    ],
    flashcards: [
      ["WIP", "Work in progress; limiting it helps improve flow."],
      ["Cycle time", "The elapsed time from starting work to finishing it."],
      ["Kanban focus", "Optimize flow and visualize constraints."],
    ],
    distractors: ["start more work to go faster", "ignore blockers", "use metrics without action"],
  },
  {
    key: "agile-quality",
    name: "Agile quality, reviews, retrospectives, transparency",
    domain: "people",
    mode: "agile",
    keywords: ["retrospective", "demo", "transparency", "quality"],
    summary: "Agile teams build quality in, invite feedback early, and use transparency to surface issues quickly.",
    points: [
      "Aggressive transparency reveals misalignment early.",
      "Reviews/demos gather stakeholder input.",
      "Retrospectives improve the team's process.",
      "Small batches reduce rework."
    ],
    flashcards: [
      ["Aggressive transparency", "Making work and issues visible early so misalignment is surfaced quickly."],
      ["Demo/review", "Session for stakeholders to inspect delivered value and give feedback."],
      ["Small batch delivery", "Frequent increments that reduce risk and speed learning."],
    ],
    distractors: ["hide unfinished work", "delay feedback until final release", "treat quality as last-step inspection"],
  },
  {
    key: "hybrid",
    name: "Hybrid delivery and agile in PMBOK knowledge areas",
    domain: "process",
    mode: "hybrid",
    keywords: ["hybrid", "tailoring", "schedule", "cost", "quality"],
    summary: "Hybrid combines structure and adaptation. In agile contexts, planning and control still happen, but often in shorter cycles.",
    points: [
      "Planning can be iterative within an agile cadence.",
      "Scope may be managed through backlog reprioritization.",
      "Cost and schedule may be fixed while scope flexes.",
      "Governance still matters."
    ],
    flashcards: [
      ["Hybrid hallmark", "A deliberate mix of predictive governance and adaptive delivery."],
      ["In adaptive projects, do focus areas still apply?", "Yes. Planning and control still happen, often iteratively."],
      ["When costs are fixed in agile", "Scope and schedule are often adjusted to stay within budget constraints."],
    ],
    distractors: ["assume no planning in agile", "drop governance entirely", "mix methods randomly"],
  },
];

function starterFlashcardsFromTopics() {
  const cards = [];
  TOPICS.forEach((topic) => {
    topic.flashcards.forEach(([front, back], idx) => {
      cards.push({
        id: `starter-${topic.key}-${idx}`,
        topicKey: topic.key,
        source: "starter",
        front,
        back,
        ease: 2.5,
        interval: 0,
        reps: 0,
        due: 1,
        createdDay: 1,
        lastReviewedDay: null,
      });
    });
  });
  return cards;
}

const STARTER_FLASHCARDS = starterFlashcardsFromTopics();

function buildInitialProfile() {
  return {
    started: false,
    startDate: todayString(),
    currentDayOverride: 1,
    readiness: 0,
    totalAnswered: 0,
    uniqueAnswered: 0,
    uniqueQuestionIds: [],
    correctCount: 0,
    wrongCount: 0,
    flashcards: STARTER_FLASHCARDS,
    weakTopics: [],
    strongTopics: [],
    questionMissesByTopic: {},
    sessionHistory: [],
    examHistory: [],
    summaryHistory: [],
    dayCompletions: [],
    domains: { people: 0, process: 0, biz: 0 },
    intensity: "Standard",
  };
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialProfile();
    const parsed = JSON.parse(raw);
    return { ...buildInitialProfile(), ...parsed };
  } catch {
    return buildInitialProfile();
  }
}

function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function pct(n, d) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

function currentDay(profile) {
  if (profile.currentDayOverride) return profile.currentDayOverride;
  const start = new Date(profile.startDate);
  const now = new Date();
  const diff = Math.floor((now - start) / 86400000) + 1;
  return clamp(diff, 1, 60);
}

function getPlanForDay(day) {
  return DAY_PLAN[clamp(day, 1, 60) - 1];
}

function determineIntensityCount(intensity) {
  if (intensity === "Light") return 8;
  if (intensity === "Intensive") return 14;
  return 10;
}

function examDueDay(day) {
  return [25, 40, 55].includes(day);
}

function weeklyExamDue(day) {
  return day % 7 === 0 && ![25, 40, 55].includes(day);
}

function topicByKey(key) {
  return TOPICS.find((t) => t.key === key) || TOPICS[0];
}

function topicScore(profile, key) {
  const misses = profile.questionMissesByTopic?.[key]?.misses || 0;
  const correct = profile.questionMissesByTopic?.[key]?.correct || 0;
  const total = misses + correct;
  if (!total) return 60;
  return Math.round((correct / total) * 100);
}

function dueFlashcards(profile, day) {
  return profile.flashcards.filter((c) => (c.due || 1) <= day);
}

function nextFlashcards(profile, day) {
  return dueFlashcards(profile, day).slice(0, 12);
}

function domainCounts(questions) {
  const counts = { people: 0, process: 0, biz: 0 };
  questions.forEach((q) => { counts[q.domain] += 1; });
  return counts;
}

function weightedReadiness(profile) {
  const d = profile.domains;
  const weighted = (d.people * 0.42) + (d.process * 0.5) + (d.biz * 0.08);
  const volumeBoost = Math.min(15, Math.floor(profile.uniqueAnswered / 30));
  return clamp(Math.round(weighted + volumeBoost), 0, 100);
}

const QUESTION_TEMPLATES = [
  {
    key: "next-step",
    stem: (topic) => `You are managing a ${topic.mode} project. A situation related to ${topic.name.toLowerCase()} has created uncertainty. What should the project manager do NEXT?`,
    correctLabel: "Take the proactive step that applies process and stakeholder awareness.",
    wrongLabels: [
      "Wait for more problems before acting.",
      "Bypass stakeholders or governance to save time.",
      "Take a reactive action that treats symptoms instead of the cause.",
    ],
    build(topic) {
      return {
        q: this.stem(topic),
        correctText: bestActionForTopic(topic),
        wrongTexts: wrongActionsForTopic(topic),
        trap: trapForTopic(topic),
      };
    },
  },
  {
    key: "scenario",
    stem: (topic) => `A team working on ${topic.name.toLowerCase()} is struggling because assumptions are not aligned. Which action best reflects PMI thinking?`,
    build(topic) {
      return {
        q: this.stem(topic),
        correctText: bestActionForTopic(topic),
        wrongTexts: wrongActionsForTopic(topic),
        trap: "Picking a fast but shallow response instead of clarifying, collaborating, and applying the right method.",
      };
    },
  },
  {
    key: "agile-hybrid",
    stem: (topic) => `A project contains both stable regulatory work and emerging customer needs. The issue involves ${topic.name.toLowerCase()}. What is the BEST action?`,
    build(topic) {
      return {
        q: this.stem(topic),
        correctText: hybridAwareActionForTopic(topic),
        wrongTexts: wrongActionsForTopic(topic),
        trap: "Forgetting that hybrid projects still need both governance and adaptation.",
      };
    },
  },
  {
    key: "principle",
    stem: (topic) => `Which option best aligns with the principle behind ${topic.name.toLowerCase()}?`,
    build(topic) {
      return {
        q: this.stem(topic),
        correctText: bestActionForTopic(topic),
        wrongTexts: wrongActionsForTopic(topic),
        trap: "Choosing a technically possible action that conflicts with value, ethics, or stakeholder engagement.",
      };
    },
  },
  {
    key: "exam-style",
    stem: (topic) => `During a high-pressure situation involving ${topic.name.toLowerCase()}, four actions are proposed. Which one should the PM choose first?`,
    build(topic) {
      return {
        q: this.stem(topic),
        correctText: bestActionForTopic(topic),
        wrongTexts: wrongActionsForTopic(topic),
        trap: "Escalating or changing course before understanding the issue and using the correct process.",
      };
    },
  },
];

function bestActionForTopic(topic) {
  const map = {
    ethics: "Refuse the unethical request, explain the concern, and escalate appropriately while documenting the issue.",
    foundations: "Clarify whether the work is a project, program, portfolio component, or operations activity before planning further.",
    org: "Clarify the organizational structure and engage the right authority for decisions about resources and escalation.",
    value: "Reconnect the decision to intended outcomes, benefits, and stakeholder value before proceeding.",
    "eefs-opas": "Identify whether the factor is an EEF or OPA, then update or respond accordingly.",
    "functions-roles": "Engage the correct role for the decision and clarify responsibilities before taking action.",
    principles: "Apply the principle-based, tailored response rather than forcing a one-size-fits-all method.",
    "life-cycles": "Choose or adjust the delivery approach based on uncertainty, feedback needs, and governance requirements.",
    governance: "Follow governance by documenting the issue, using the correct authority, and updating plans or baselines as needed.",
    scope: "Clarify scope, review the baseline or backlog, and use the proper acceptance or change mechanism.",
    schedule: "Analyze dependencies and critical path before compressing or re-sequencing work.",
    estimating: "Use the appropriate estimation technique and acknowledge uncertainty rather than pretending to have precision.",
    evm: "Analyze the current metrics first, then forecast and recommend the appropriate corrective action.",
    quality: "Identify the root cause and improve the process, while also verifying deliverables meet requirements.",
    "resources-conflict": "Facilitate a collaborative discussion, remove impediments, and support the team toward resolution.",
    "stakeholders-comms": "Understand stakeholder needs, tailor communication, and engage the right people directly.",
    risk: "Document the risk or issue correctly, analyze impact, and choose the response that matches the situation.",
    procurement: "Review contract terms and allocate risk appropriately before making commitments.",
    business: "Assess strategic, compliance, and benefits implications before deciding.",
    "agile-mindset": "Increase collaboration and feedback while keeping the team focused on early value delivery.",
    backlog: "Work with the Product Owner to refine and reprioritize the backlog based on value and readiness.",
    scrum: "Use the appropriate Scrum role or event to inspect, adapt, and remove impediments.",
    kanban: "Visualize the bottleneck, limit WIP, and improve flow before starting more work.",
    "agile-quality": "Increase transparency, inspect the increment, and use retrospectives to improve the process.",
    hybrid: "Apply governance where needed while using adaptive techniques for uncertain or emerging work.",
  };
  return map[topic.key] || "Clarify the issue, engage stakeholders, and choose the proactive, value-focused action.";
}

function hybridAwareActionForTopic(topic) {
  if (topic.mode === "predictive") return bestActionForTopic(topic);
  if (topic.mode === "agile") return `${bestActionForTopic(topic)} Use agile ceremonies, transparency, and short feedback loops.`;
  return `${bestActionForTopic(topic)} Balance formal governance with flexible delivery where appropriate.`;
}

function wrongActionsForTopic(topic) {
  return [
    topic.distractors?.[0] ? `Ignore the context and ${topic.distractors[0]}.` : "Wait and hope the issue resolves itself.",
    topic.distractors?.[1] ? `Act quickly but ${topic.distractors[1]}.` : "Skip analysis and make a unilateral decision.",
    topic.distractors?.[2] ? `Escalate immediately and ${topic.distractors[2]}.` : "Blame the team and avoid the process.",
  ];
}

function trapForTopic(topic) {
  const map = {
    ethics: "Thinking sponsor pressure overrides ethics.",
    foundations: "Confusing temporary project work with ongoing operations.",
    org: "Ignoring who actually controls resources.",
    value: "Treating schedule and budget as the only success measures.",
    "eefs-opas": "Mixing up what the team can update versus what it must respond to.",
    "life-cycles": "Assuming agile is always best.",
    governance: "Making baseline changes informally.",
    scope: "Confusing deliverable acceptance with change control.",
    schedule: "Compressing work without considering risk or critical path.",
    evm: "Memorizing formulas without interpreting them.",
    quality: "Inspecting defects without improving the process.",
    risk: "Treating an issue like a future risk or vice versa.",
    "agile-mindset": "Equating agile with no planning or no governance.",
    scrum: "Using Scrum roles like traditional command-and-control positions.",
    kanban: "Starting too much work instead of improving flow.",
    hybrid: "Combining methods randomly instead of intentionally tailoring.",
  };
  return map[topic.key] || "Choosing a reactive answer instead of a proactive, structured one.";
}

function difficultyForDay(day) {
  if (day <= 10) return "Easy";
  if (day <= 24) return "Medium";
  if (day <= 40) return "Hard";
  return "Exam-level";
}

function buildQuestionBank() {
  const bank = [];
  TOPICS.forEach((topic, topicIndex) => {
    QUESTION_TEMPLATES.forEach((tpl, tplIndex) => {
      for (let i = 0; i < 8; i += 1) {
        const built = tpl.build(topic);
        const correct = built.correctText;
        const wrongs = built.wrongTexts.map((w, idx) => `${w} (${variantTag(i, idx)})`);
        const correctLetterIndex = (topicIndex + tplIndex + i) % 4;
        const choicesRaw = [];
        let wrongCursor = 0;
        for (let c = 0; c < 4; c += 1) {
          if (c === correctLetterIndex) {
            choicesRaw.push(correct);
          } else {
            choicesRaw.push(wrongs[wrongCursor]);
            wrongCursor += 1;
          }
        }
        const letters = ["A", "B", "C", "D"];
        bank.push({
          id: `q-${topic.key}-${tpl.key}-${i}`,
          topicKey: topic.key,
          topicName: topic.name,
          domain: topic.domain,
          mode: topic.mode,
          difficulty: difficultyForDay(1 + ((topicIndex + i) % 60)),
          q: `${built.q} (${scenarioFlavor(topic, i)})`,
          choices: choicesRaw.map((txt, idx) => `${letters[idx]}. ${txt}`),
          correct: letters[correctLetterIndex],
          whyCorrect: explanationForTopic(topic),
          trap: built.trap,
          wrongAnswers: buildWrongExplanations(topic),
        });
      }
    });
  });
  return bank;
}

function scenarioFlavor(topic, i) {
  const variants = [
    "A senior stakeholder is frustrated by recent delays.",
    "The team is distributed and information is incomplete.",
    "A vendor dependency is affecting confidence.",
    "Customer feedback has changed what matters most.",
    "The project is under schedule pressure.",
    "The work involves compliance requirements.",
    "A recent review surfaced rework and confusion.",
    "Multiple teams need coordination before moving forward.",
  ];
  return variants[(topic.key.length + i) % variants.length];
}

function variantTag(i, idx) {
  const tags = ["without stakeholder input", "without data", "without following process", "without solving the root cause", "without transparency"];
  return tags[(i + idx) % tags.length];
}

function explanationForTopic(topic) {
  return `${topic.summary} The best PMP answer is the one that is proactive, ethical, stakeholder-aware, and properly tailored to the context.`;
}

function buildWrongExplanations(topic) {
  return {
    A: "Only correct if A is not the correct answer for this item.",
    B: `This option is weaker because it tends to ignore the core lesson from ${topic.name.toLowerCase()}.`,
    C: "This option is reactive, bypasses the right process, or fails to engage the right people.",
    D: "This option focuses on speed or authority rather than value, collaboration, and fit.",
  };
}

const QUESTION_BANK = buildQuestionBank();

function chooseQuestionPool(profile, topicKeys, count, day, modes = null) {
  const seen = new Set(profile.uniqueQuestionIds || []);
  let pool = QUESTION_BANK.filter((q) => topicKeys.includes(q.topicKey));
  if (modes?.length) pool = pool.filter((q) => modes.includes(q.mode));
  const unseen = pool.filter((q) => !seen.has(q.id));
  const ordered = [...unseen, ...pool.filter((q) => seen.has(q.id))];
  return ordered.slice(0, count);
}

function generateDailySession(profile) {
  const day = currentDay(profile);
  const plan = getPlanForDay(day);
  const intensityCount = determineIntensityCount(profile.intensity);
  const topicKeys = Array.from(new Set([
    findTopicKeyFromPlan(plan),
    ...topWeakTopics(profile, 2),
    ...neighborTopics(findTopicKeyFromPlan(plan), 1),
  ])).filter(Boolean);
  const questions = chooseQuestionPool(profile, topicKeys, intensityCount, day);
  const lessonTopic = topicByKey(topicKeys[0] || "ethics");
  return {
    type: "daily",
    day,
    lesson: {
      title: plan.title,
      tldr: plan.lesson,
      keyPoints: lessonTopic.points,
      focusTopic: lessonTopic.name,
      example: sessionExample(lessonTopic),
      pmMindset: mindsetForTopic(lessonTopic),
    },
    flashcards: buildSessionFlashcards(profile, day, lessonTopic.key),
    questions,
  };
}

function buildSessionFlashcards(profile, day, topicKey) {
  const due = dueFlashcards(profile, day)
    .filter((c) => c.topicKey === topicKey || c.source === "mistake")
    .slice(0, 8);
  if (due.length >= 6) return due;
  const starter = profile.flashcards
    .filter((c) => c.topicKey === topicKey)
    .filter((c) => !due.some((d) => d.id === c.id))
    .slice(0, 8 - due.length);
  return [...due, ...starter].slice(0, 8);
}

function sessionExample(topic) {
  const examples = {
    ethics: "A sponsor asks you to hide a risk before a steering committee meeting.",
    org: "A functional manager reassigns your key analyst without consulting you.",
    value: "The system launched on time, but users are not adopting it.",
    governance: "A stakeholder wants a feature added immediately without a change request.",
    risk: "A high-impact vendor delay might happen next month.",
    scrum: "The daily standup has become a manager-led status interrogation.",
    kanban: "Work items keep piling up in progress and cycle time is rising.",
    hybrid: "Regulatory documentation is fixed, but customer-facing features need rapid iteration.",
  };
  return examples[topic.key] || `A realistic project scenario involving ${topic.name.toLowerCase()}.`;
}

function mindsetForTopic(topic) {
  const map = {
    ethics: "Transparency beats politics.",
    value: "Value beats vanity metrics.",
    governance: "Process protects alignment and accountability.",
    scrum: "Facilitate the team; do not command it.",
    hybrid: "Tailor deliberately to fit the work.",
  };
  return map[topic.key] || "Choose the proactive, stakeholder-aware action first.";
}

function findTopicKeyFromPlan(plan) {
  const keywords = (plan.focus || []).map((f) => f.toLowerCase());
  const match = TOPICS.find((t) => keywords.some((k) => t.name.toLowerCase().includes(k) || t.key.includes(k.replace(/\s+/g, "-"))));
  return match?.key || "ethics";
}

function neighborTopics(topicKey, count = 1) {
  const idx = TOPICS.findIndex((t) => t.key === topicKey);
  if (idx < 0) return [];
  const keys = [];
  for (let i = 1; i <= count; i += 1) {
    if (TOPICS[idx + i]) keys.push(TOPICS[idx + i].key);
    if (TOPICS[idx - i]) keys.push(TOPICS[idx - i].key);
  }
  return keys;
}

function topWeakTopics(profile, count = 3) {
  const entries = TOPICS.map((t) => [t.key, topicScore(profile, t.key)]);
  entries.sort((a, b) => a[1] - b[1]);
  return entries.slice(0, count).map(([key]) => key);
}

function generateExam(profile, examType) {
  const day = currentDay(profile);
  const count = examType === "full" ? 180 : 60;
  const modes = examType === "full" ? null : ["predictive", "agile", "hybrid"];
  const seen = new Set(profile.uniqueQuestionIds || []);
  let pool = QUESTION_BANK;
  if (modes) pool = pool.filter((q) => modes.includes(q.mode));
  const unseen = pool.filter((q) => !seen.has(q.id));
  const chosen = [...unseen, ...pool.filter((q) => seen.has(q.id))].slice(0, count);
  return {
    type: examType,
    day,
    title: examType === "full" ? `Full Exam - Day ${day}` : `Weekly 60Q Exam - Day ${day}`,
    questions: chosen,
  };
}

function buildSummary(result) {
  const score = result.score;
  const headline = score >= 80
    ? "Strong work. You're showing solid PMP judgment."
    : score >= 65
    ? "Good progress. You understand the framework and need sharper execution on traps."
    : "This was a learning set, which is still progress. The misses tell you exactly where to focus next.";
  return {
    headline,
    strengths: result.correctTopics.slice(0, 2).map((t) => `You handled ${topicByKey(t).name.toLowerCase()} questions well.`),
    improvements: result.weakTopics.slice(0, 3).map((t) => `Review ${topicByKey(t).name.toLowerCase()} and practice more scenario-based questions.`),
    nextFocus: result.weakTopics[0] ? topicByKey(result.weakTopics[0]).name : "Mixed review",
    mindsetCoach: "On close calls, choose the action that is proactive, ethical, data-aware, and stakeholder-inclusive.",
    readinessImpact: score >= 75 ? "This session likely raised your readiness." : "This session exposed gaps that can be converted into fast improvement.",
  };
}

function gradeQuestions(questions, answers) {
  let correct = 0;
  const topicStats = {};
  const domainStats = {
    people: { correct: 0, total: 0 },
    process: { correct: 0, total: 0 },
    biz: { correct: 0, total: 0 },
  };
  const missed = [];
  questions.forEach((q) => {
    const isCorrect = answers[q.id] === q.correct;
    if (isCorrect) correct += 1;
    domainStats[q.domain].total += 1;
    if (isCorrect) domainStats[q.domain].correct += 1;

    if (!topicStats[q.topicKey]) topicStats[q.topicKey] = { correct: 0, total: 0 };
    topicStats[q.topicKey].total += 1;
    if (isCorrect) topicStats[q.topicKey].correct += 1;
    if (!isCorrect) missed.push(q);
  });
  const score = pct(correct, questions.length);
  const weakTopics = Object.entries(topicStats)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
    .slice(0, 3)
    .map(([k]) => k);
  const correctTopics = Object.entries(topicStats)
    .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))
    .slice(0, 3)
    .map(([k]) => k);

  return { score, correct, missed, weakTopics, correctTopics, domainStats };
}

function addMistakeFlashcards(profile, day, missedQuestions) {
  const existing = new Set(profile.flashcards.map((f) => f.id));
  const cards = [];
  missedQuestions.forEach((q) => {
    const front = `Why was this best? ${q.q}`;
    const back = `${q.correct}. ${q.choices.find((c) => c.startsWith(`${q.correct}.`))?.slice(3) || ""} — ${q.whyCorrect}`;
    const card = {
      id: `mistake-${q.id}`,
      topicKey: q.topicKey,
      source: "mistake",
      front,
      back,
      ease: 2.3,
      interval: 0,
      reps: 0,
      due: day, // immediate availability
      createdDay: day,
      lastReviewedDay: null,
    };
    if (!existing.has(card.id)) cards.push(card);
  });
  return [...profile.flashcards, ...cards];
}

function updateFlashcard(card, grade, day) {
  const q = { ...card };
  const quality = grade === "again" ? 1 : grade === "hard" ? 3 : grade === "good" ? 4 : 5;
  if (quality < 3) {
    q.reps = 0;
    q.interval = 1;
    q.due = day;
  } else {
    q.reps += 1;
    if (q.reps === 1) q.interval = 1;
    else if (q.reps === 2) q.interval = 3;
    else q.interval = Math.round(q.interval * q.ease);
    q.ease = Math.max(1.3, q.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    q.due = day + q.interval;
  }
  q.lastReviewedDay = day;
  return q;
}

function updateProfileAfterAssessment(profile, session, result) {
  const day = currentDay(profile);
  const uniqueSet = new Set(profile.uniqueQuestionIds || []);
  session.questions.forEach((q) => uniqueSet.add(q.id));

  const updatedQuestionMissesByTopic = { ...(profile.questionMissesByTopic || {}) };
  session.questions.forEach((q) => {
    const entry = updatedQuestionMissesByTopic[q.topicKey] || { correct: 0, misses: 0 };
    if (result.missed.some((m) => m.id === q.id)) entry.misses += 1;
    else entry.correct += 1;
    updatedQuestionMissesByTopic[q.topicKey] = entry;
  });

  const dayRecord = { day, type: session.type, score: result.score, total: session.questions.length };
  const domainScores = {
    people: pct(result.domainStats.people.correct, result.domainStats.people.total),
    process: pct(result.domainStats.process.correct, result.domainStats.process.total),
    biz: pct(result.domainStats.biz.correct, result.domainStats.biz.total),
  };

  const mergedDomains = {
    people: Math.round(((profile.domains.people || 0) * 0.6) + (domainScores.people * 0.4)),
    process: Math.round(((profile.domains.process || 0) * 0.6) + (domainScores.process * 0.4)),
    biz: Math.round(((profile.domains.biz || 0) * 0.6) + (domainScores.biz * 0.4)),
  };

  const next = {
    ...profile,
    totalAnswered: profile.totalAnswered + session.questions.length,
    uniqueAnswered: uniqueSet.size,
    uniqueQuestionIds: Array.from(uniqueSet),
    correctCount: profile.correctCount + result.correct,
    wrongCount: profile.wrongCount + result.missed.length,
    questionMissesByTopic: updatedQuestionMissesByTopic,
    weakTopics: topWeakTopics({ ...profile, questionMissesByTopic: updatedQuestionMissesByTopic }, 5),
    strongTopics: [...TOPICS]
      .sort((a, b) => topicScore({ ...profile, questionMissesByTopic: updatedQuestionMissesByTopic }, b.key) - topicScore({ ...profile, questionMissesByTopic: updatedQuestionMissesByTopic }, a.key))
      .slice(0, 5)
      .map((t) => t.key),
    flashcards: addMistakeFlashcards(profile, day, result.missed),
    sessionHistory: session.type === "daily"
      ? [...profile.sessionHistory, { day, score: result.score, topics: result.weakTopics, total: session.questions.length }]
      : profile.sessionHistory,
    examHistory: session.type !== "daily"
      ? [...profile.examHistory, { day, type: session.type, score: result.score, total: session.questions.length }]
      : profile.examHistory,
    summaryHistory: [...profile.summaryHistory, { day, type: session.type, ...buildSummary(result) }],
    dayCompletions: [...profile.dayCompletions, dayRecord],
    domains: mergedDomains,
  };
  next.readiness = weightedReadiness(next);
  return next;
}

function advanceDay(profile) {
  const day = currentDay(profile);
  return { ...profile, currentDayOverride: clamp(day + 1, 1, 60) };
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return buildInitialProfile();
}

function Pill({ children, color = COLORS.chip }) {
  return <span style={{ background: color, border: `1px solid ${COLORS.border}`, borderRadius: 999, padding: "5px 10px", fontSize: 12 }}>{children}</span>;
}

function Button({ children, onClick, variant = "primary", disabled = false, style = {} }) {
  const styles = variant === "primary"
    ? { background: COLORS.gold, color: "#1a1a1a", border: "none" }
    : variant === "ghost"
    ? { background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}` }
    : { background: COLORS.panel2, color: COLORS.text, border: `1px solid ${COLORS.border}` };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "12px 16px",
        borderRadius: 12,
        fontWeight: 700,
        fontSize: 14,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Section({ title, right, children }) {
  return (
    <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 18, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function Dashboard({ profile, onStartSession, onOpenFlashcards, onOpenExam, onAdvanceDay, onReset }) {
  const day = currentDay(profile);
  const dueCards = dueFlashcards(profile, day).length;
  const nextPlan = getPlanForDay(day);
  const questionGoal = Math.max(400, 540); // Daily + weekly + full exams exceed 400.
  const nextFull = [25, 40, 55].find((d) => d >= day);
  const fullTaken = profile.examHistory.filter((e) => e.type === "full").map((e) => e.day);
  const weeklyDoneToday = profile.examHistory.some((e) => e.type === "weekly" && e.day === day);
  const fullDoneToday = profile.examHistory.some((e) => e.type === "full" && e.day === day);

  return (
    <div>
      <Section
        title={`Day ${day} of 60`}
        right={<Pill color={COLORS.gold}>{profile.readiness}% readiness</Pill>}
      >
        <div style={{ color: COLORS.muted, marginBottom: 14 }}>{nextPlan.title}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, marginBottom: 14 }}>
          <Stat label="Unique questions" value={`${profile.uniqueAnswered} / ${questionGoal}`} />
          <Stat label="Flashcards due" value={dueCards} />
          <Stat label="People" value={`${profile.domains.people}%`} />
          <Stat label="Process" value={`${profile.domains.process}%`} />
          <Stat label="Business" value={`${profile.domains.biz}%`} />
          <Stat label="Full exams taken" value={`${fullTaken.length} / 3`} />
        </div>
        <Progress value={profile.uniqueAnswered} max={questionGoal} label="400+ unique question target" />
      </Section>

      <Section title="Today's plan">
        <div style={{ color: COLORS.muted, marginBottom: 12 }}>{nextPlan.lesson}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {(nextPlan.focus || []).map((f) => <Pill key={f}>{f}</Pill>)}
          <Pill>{nextPlan.mode}</Pill>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Button onClick={onStartSession}>Start daily session</Button>
          <Button variant="secondary" onClick={onOpenFlashcards}>Review flashcards</Button>
          {weeklyExamDue(day) && !weeklyDoneToday && <Button variant="secondary" onClick={() => onOpenExam("weekly")}>Take weekly 60Q exam</Button>}
          {examDueDay(day) && !fullDoneToday && <Button variant="secondary" onClick={() => onOpenExam("full")}>Take full 180Q exam</Button>}
        </div>
      </Section>

      <Section title="Exam cadence">
        <div style={{ color: COLORS.muted, lineHeight: 1.7 }}>
          Full exams are scheduled for <strong>Days 25, 40, and 55</strong>. Weekly 60-question exams appear on non-full-exam weeks.
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[25, 40, 55].map((d) => (
            <Pill key={d} color={fullTaken.includes(d) ? "#173726" : COLORS.chip}>
              Day {d} {fullTaken.includes(d) ? "✓" : nextFull === d ? "(next)" : ""}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Weak areas">
        {profile.weakTopics.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {profile.weakTopics.map((k) => <Pill key={k}>{topicByKey(k).name}</Pill>)}
          </div>
        ) : (
          <div style={{ color: COLORS.muted }}>Your weak-area profile will fill in as you answer questions.</div>
        )}
      </Section>

      <Section title="Recent results">
        {profile.summaryHistory.length ? profile.summaryHistory.slice(-3).reverse().map((s, idx) => (
          <div key={idx} style={{ borderTop: idx ? `1px solid ${COLORS.border}` : "none", paddingTop: idx ? 12 : 0, marginTop: idx ? 12 : 0 }}>
            <div style={{ fontWeight: 700 }}>Day {s.day} · {s.type}</div>
            <div style={{ color: COLORS.muted }}>{s.headline}</div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Next focus: {s.nextFocus}</div>
          </div>
        )) : <div style={{ color: COLORS.muted }}>No results yet.</div>}
      </Section>

      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <Button variant="ghost" onClick={onAdvanceDay}>Advance to next day</Button>
        <Button variant="ghost" onClick={onReset}>Reset app</Button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: COLORS.panel2, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, color: COLORS.muted }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 18, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Progress({ value, max, label }) {
  const pctValue = clamp(Math.round((value / max) * 100), 0, 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>
        <span>{label}</span><span>{pctValue}%</span>
      </div>
      <div style={{ height: 10, background: COLORS.panel2, borderRadius: 999, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
        <div style={{ width: `${pctValue}%`, height: "100%", background: COLORS.gold }} />
      </div>
    </div>
  );
}

function DailySession({ profile, session, onSubmit, onCancel }) {
  const [answers, setAnswers] = useState({});
  const [cardIndex, setCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const lesson = session.lesson;
  const flashcards = session.flashcards;
  const currentCard = flashcards[cardIndex];

  return (
    <div>
      <Section title={lesson.title} right={<Pill>{lesson.focusTopic}</Pill>}>
        <div style={{ color: COLORS.muted, marginBottom: 12 }}>{lesson.tldr}</div>
        <ul style={{ marginTop: 0, color: COLORS.text, lineHeight: 1.8 }}>
          {lesson.keyPoints.map((p, idx) => <li key={idx}>{p}</li>)}
        </ul>
        <div style={{ background: COLORS.panel2, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12, marginTop: 10 }}>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>Example</div>
          <div>{lesson.example}</div>
          <div style={{ fontSize: 12, color: COLORS.blue, marginTop: 8 }}>PMI mindset: {lesson.pmMindset}</div>
        </div>
      </Section>

      <Section title={`Flashcards (${flashcards.length})`} right={<Pill>{dueFlashcards(profile, currentDay(profile)).length} due today</Pill>}>
        {currentCard ? (
          <div>
            <div
              style={{
                background: COLORS.panel2,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: 18,
                minHeight: 120,
                cursor: "pointer",
                marginBottom: 12,
              }}
              onClick={() => setShowBack(!showBack)}
            >
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>{showBack ? "Back" : "Front"} · tap to flip</div>
              <div style={{ fontSize: 18, lineHeight: 1.5 }}>{showBack ? currentCard.back : currentCard.front}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: COLORS.muted, fontSize: 12 }}>Card {cardIndex + 1} of {flashcards.length}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" disabled={cardIndex === 0} onClick={() => { setCardIndex(cardIndex - 1); setShowBack(false); }}>Prev</Button>
                <Button variant="secondary" disabled={cardIndex === flashcards.length - 1} onClick={() => { setCardIndex(cardIndex + 1); setShowBack(false); }}>Next</Button>
              </div>
            </div>
          </div>
        ) : <div style={{ color: COLORS.muted }}>No flashcards in this session.</div>}
      </Section>

      <Section title={`Questions (${session.questions.length})`}>
        {session.questions.map((q, idx) => (
          <div key={q.id} style={{ borderTop: idx ? `1px solid ${COLORS.border}` : "none", paddingTop: idx ? 16 : 0, marginTop: idx ? 16 : 0 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <Pill>{q.domain}</Pill>
              <Pill>{q.mode}</Pill>
              <Pill>{q.difficulty}</Pill>
              <Pill>{q.topicName}</Pill>
            </div>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>{idx + 1}. {q.q}</div>
            <div style={{ display: "grid", gap: 8 }}>
              {q.choices.map((choice) => {
                const letter = choice[0];
                const selected = answers[q.id] === letter;
                return (
                  <label key={choice} style={{
                    display: "block",
                    background: selected ? "#1d2b44" : COLORS.panel2,
                    border: `1px solid ${selected ? COLORS.blue : COLORS.border}`,
                    borderRadius: 12,
                    padding: 12,
                    cursor: "pointer",
                  }}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={selected}
                      onChange={() => setAnswers({ ...answers, [q.id]: letter })}
                      style={{ marginRight: 8 }}
                    />
                    {choice}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <Button onClick={() => onSubmit(answers)} disabled={Object.keys(answers).length !== session.questions.length}>Submit session</Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </Section>
    </div>
  );
}

function ReviewScreen({ resultBundle, onBack }) {
  const { session, result, summary } = resultBundle;
  return (
    <div>
      <Section title={`${session.type === "daily" ? "Session" : session.type === "full" ? "Full exam" : "Weekly exam"} review`} right={<Pill color={result.score >= 75 ? "#173726" : "#3a1f25"}>{result.score}%</Pill>}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{summary.headline}</div>
        <div style={{ color: COLORS.muted }}>Next focus: {summary.nextFocus}</div>
        <ul style={{ lineHeight: 1.8 }}>
          {summary.improvements.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
        <div style={{ color: COLORS.blue, marginTop: 10 }}>{summary.mindsetCoach}</div>
      </Section>

      <Section title="Missed questions turned into flashcards">
        <div style={{ color: COLORS.muted }}>
          {result.missed.length
            ? `${result.missed.length} missed questions were added as flashcards and are due now.`
            : "No new mistake flashcards were added because you did not miss any questions."}
        </div>
      </Section>

      <Section title="Question review">
        {session.questions.map((q, idx) => {
          const missed = result.missed.some((m) => m.id === q.id);
          return (
            <div key={q.id} style={{ borderTop: idx ? `1px solid ${COLORS.border}` : "none", paddingTop: idx ? 16 : 0, marginTop: idx ? 16 : 0 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <Pill color={missed ? "#3a1f25" : "#173726"}>{missed ? "Missed" : "Correct"}</Pill>
                <Pill>{q.topicName}</Pill>
              </div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{idx + 1}. {q.q}</div>
              <div style={{ color: COLORS.muted, marginBottom: 6 }}>Correct answer: {q.correct}</div>
              <div>{q.whyCorrect}</div>
              <div style={{ color: COLORS.blue, marginTop: 6 }}>Trap: {q.trap}</div>
            </div>
          );
        })}
      </Section>

      <Button onClick={onBack}>Back to dashboard</Button>
    </div>
  );
}

function FlashcardScreen({ profile, onSaveProfile, onBack }) {
  const day = currentDay(profile);
  const due = useMemo(() => dueFlashcards(profile, day), [profile, day]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const card = due[index];
  function review(grade) {
    if (!card) return;
    const updated = profile.flashcards.map((c) => c.id === card.id ? updateFlashcard(c, grade, day) : c);
    onSaveProfile({ ...profile, flashcards: updated });
    setShowBack(false);
    if (index < due.length - 1) setIndex(index + 1);
  }

  return (
    <div>
      <Section title="Flashcards" right={<Pill>{due.length} due</Pill>}>
        {!card ? (
          <div>
            <div style={{ color: COLORS.muted, marginBottom: 12 }}>No cards are due today.</div>
            <Button onClick={onBack}>Back</Button>
          </div>
        ) : (
          <>
            <div
              style={{
                background: COLORS.panel2,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: 20,
                minHeight: 160,
                cursor: "pointer",
                marginBottom: 12,
              }}
              onClick={() => setShowBack(!showBack)}
            >
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>{showBack ? "Back" : "Front"} · tap to flip</div>
              <div style={{ fontSize: 20, lineHeight: 1.5 }}>{showBack ? card.back : card.front}</div>
              <div style={{ marginTop: 10, fontSize: 12, color: COLORS.blue }}>{topicByKey(card.topicKey).name}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.muted, fontSize: 12, marginBottom: 14 }}>
              <span>{index + 1} of {due.length}</span>
              <span>{card.source === "mistake" ? "Mistake card" : "Starter card"}</span>
            </div>
            {showBack && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="secondary" onClick={() => review("again")}>Again</Button>
                <Button variant="secondary" onClick={() => review("hard")}>Hard</Button>
                <Button onClick={() => review("good")}>Good</Button>
                <Button variant="secondary" onClick={() => review("easy")}>Easy</Button>
              </div>
            )}
          </>
        )}
      </Section>
      <Button variant="ghost" onClick={onBack}>Back to dashboard</Button>
    </div>
  );
}

function ExamIntro({ type, onStart, onBack }) {
  return (
    <div>
      <Section title={type === "full" ? "Full 180-question exam" : "Weekly 60-question exam"}>
        <div style={{ color: COLORS.muted, lineHeight: 1.8, marginBottom: 12 }}>
          {type === "full"
            ? "This exam uses 180 questions and counts toward your unique-question goal. Full exams are scheduled for Days 25, 40, and 55."
            : "This weekly exam uses 60 questions and mixes predictive, agile, and hybrid scenarios."}
        </div>
        <Button onClick={onStart}>Start exam</Button>
      </Section>
      <Button variant="ghost" onClick={onBack}>Back</Button>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(loadProfile);
  const [screen, setScreen] = useState("dashboard");
  const [activeSession, setActiveSession] = useState(null);
  const [reviewBundle, setReviewBundle] = useState(null);
  const [examType, setExamType] = useState("weekly");

  useEffect(() => { saveProfile(profile); }, [profile]);

  const day = currentDay(profile);

  function startDaily() {
    const session = generateDailySession(profile);
    setActiveSession(session);
    setScreen("daily");
  }

  function submitSession(answers) {
    const result = gradeQuestions(activeSession.questions, answers);
    const nextProfile = updateProfileAfterAssessment(profile, activeSession, result);
    setProfile(nextProfile);
    setReviewBundle({ session: activeSession, result, summary: buildSummary(result) });
    setScreen("review");
    setActiveSession(null);
  }

  function startExam() {
    const exam = generateExam(profile, examType);
    setActiveSession(exam);
    setScreen("daily");
  }

  function saveUpdatedProfile(next) {
    setProfile(next);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${COLORS.bg}, #0f1730)`,
      color: COLORS.text,
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      padding: 16,
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(11,16,32,0.85)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "14px 0",
          marginBottom: 18,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.gold, fontWeight: 800 }}>PMP Coach</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>PMBOK 8 + Agile Practice Guide Study System</div>
              <div style={{ color: COLORS.muted, fontSize: 13 }}>Day {day}/60 · starter flashcards from Day 1 · new flashcards auto-created from misses</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Pill>{profile.uniqueAnswered} unique Qs</Pill>
              <Pill>{dueFlashcards(profile, day).length} cards due</Pill>
              <Pill>{profile.readiness}% ready</Pill>
            </div>
          </div>
        </div>

        {screen === "dashboard" && (
          <Dashboard
            profile={profile}
            onStartSession={startDaily}
            onOpenFlashcards={() => setScreen("flashcards")}
            onOpenExam={(type) => { setExamType(type); setScreen("examIntro"); }}
            onAdvanceDay={() => setProfile(advanceDay(profile))}
            onReset={() => { if (window.confirm("Reset all progress?")) setProfile(resetProgress()); }}
          />
        )}

        {screen === "daily" && activeSession && (
          <DailySession
            profile={profile}
            session={activeSession}
            onSubmit={submitSession}
            onCancel={() => { setActiveSession(null); setScreen("dashboard"); }}
          />
        )}

        {screen === "review" && reviewBundle && (
          <ReviewScreen resultBundle={reviewBundle} onBack={() => setScreen("dashboard")} />
        )}

        {screen === "flashcards" && (
          <FlashcardScreen profile={profile} onSaveProfile={saveUpdatedProfile} onBack={() => setScreen("dashboard")} />
        )}

        {screen === "examIntro" && (
          <ExamIntro type={examType} onStart={startExam} onBack={() => setScreen("dashboard")} />
        )}

        <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 22, lineHeight: 1.7 }}>
          Built from your PMBOK 8 study guide, detailed notes, and Agile Practice Guide themes: principle-based PMBOK structure, 7 performance domains, 5 focus areas, value delivery, ethics, tailoring, backlog-based adaptive work, servant leadership, Scrum/Kanban flow, and hybrid delivery.
        </div>
      </div>
    </div>
  );
}
