import { useState, useEffect, useRef, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Backend API URL
const API_URL = "https://advisorsprint-api.onrender.com/api/claude";

// MOCK MODE: true = instant fake output (for testing), false = real API calls via backend
const MOCK_MODE = false;

// GA4 tracking
const GA4_ID = "G-XXXXXXXXXX";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function gaEvent(name, params = {}) {
  try {
    if (typeof window.gtag === "function" && GA4_ID !== "G-XXXXXXXXXX") {
      window.gtag("event", name, params);
    }
    console.log("[Analytics]", name, params);
  } catch(e) {}
}

function loadGA4() {
  if (GA4_ID === "G-XXXXXXXXXX") return;
  const s1 = document.createElement("script");
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s1);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID);
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f0e8; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #b8a898; border-radius: 3px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.2; } }
  
  @media print {
    @page { margin: 0 0 8mm 0; }
    body { background: white !important; margin: 0 !important; padding: 0 !important; }
    .no-print { display: none !important; }
    .no-screen { display: none !important; }
    .print-only { display: block !important; }
    .no-screen { display: flex !important; }
    .pdf-header { 
      display: none !important;
    }
    .pdf-header * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .agent-content { 
      max-height: none !important; 
      overflow: visible !important;
    }


    h2 {
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
    }
  }
`;

const P = {
  cream: "#f5f0e8",
  parchment: "#ede6d6",
  sand: "#d4c4a8",
  forest: "#1a3325",
  forestMid: "#2d5040",
  forestSoft: "#3d6b54",
  terra: "#b85c38",
  terraSoft: "#d4724a",
  terracream: "#f0d4c0",
  ink: "#1a1208",
  inkMid: "#3d3020",
  inkSoft: "#6b5c48",
  inkFaint: "#9b8c78",
  gold: "#c8922a",
  white: "#faf8f4",
};

const AGENTS = [
  { id: "framing", wave: 0, icon: "⊕", label: "Category & Competitive Framing", sub: "Establishes ground truth before all agents run" },
  { id: "market", wave: 1, icon: "◈", label: "Market Position & Category Dynamics", sub: "Category size, growth, competitive landscape" },
  { id: "portfolio", wave: 1, icon: "◉", label: "Portfolio Strategy & SKU Rationalization", sub: "Product mix, SKU performance, keep/kill/launch" },
  { id: "brand", wave: 1, icon: "◎", label: "Brand Positioning & Storytelling", sub: "Brand perception, target customer, messaging" },
  { id: "margins", wave: 1, icon: "◐", label: "Margin Improvement & Unit Economics", sub: "COGS optimization, channel mix, profitability" },
  { id: "growth", wave: 1, icon: "◆", label: "Growth Strategy & Channel Orchestration", sub: "GTM roadmap, geographic expansion, sales team" },
  { id: "competitive", wave: 1, icon: "◇", label: "Competitive Battle Plan", sub: "Head-to-head analysis, attack/defend strategies" },
  { id: "synergy",  wave: 2, icon: "◈", label: "Synergy Playbook",                        sub: "Post-acquisition integration, ITC asset leverage" },
  { id: "platform", wave: 2, icon: "◉", label: "Platform Expansion & D2C Brand Incubator", sub: "Strategic portfolio transformation" },
  { id: "intl",     wave: 2, icon: "◎", label: "International Benchmarks & Global Playbook", sub: "Global analogs, MT/QC transitions, transferable lessons" },
  { id: "synopsis", wave: 3, icon: "◉", label: "Executive Synopsis",                        sub: "Strategic synthesis of all 10 agents" },
  { id: "brief",    wave: 4, icon: "◈", label: "CEO Opportunity Brief",                       sub: "2-page visual brief: gaps, occasions, trends, 18-month moves" },
];

const W1 = AGENTS.filter(a => a.wave === 1).map(a => a.id);
const W2 = AGENTS.filter(a => a.wave === 2).map(a => a.id);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AGENT PROMPTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PROMPTS = {
  market: `# AGENT 1: MARKET POSITION & CATEGORY DYNAMICS

[ACQUISITION_PREAMBLE]

## YOUR MANDATE

Map the category [COMPANY] competes in — its size, growth trajectory, structural forces, and [COMPANY]'s position within it. You are the foundation every other agent builds on. Get the numbers right. Estimate where you must, show your work, label confidence.

## FOUR QUESTIONS YOU MUST ANSWER

**1. What is the category, and what is [COMPANY]'s actual position in it?**
Not the broad sector — the specific segment where [COMPANY] competes. Size it in revenue terms. Show where [COMPANY] ranks, with market share estimate and growth rate versus category growth. If [COMPANY] is outgrowing the category, explain why. If it's underperforming, diagnose what's constraining it.

**2. What structural forces are reshaping this category right now?**
Identify 2–3 structural changes — not trends but forces with dollar consequences. For each: what changed, when, how large the redistribution of value is, and which player benefits. Quick Commerce displacement, premiumisation, channel consolidation, ingredient regulation — wherever the evidence points.

**3. Who are the 4–5 real competitors and what is each doing that is working?**
Not a list. For each competitor: current revenue (estimated), growth rate, the one strategic move that is driving their growth, and their single biggest vulnerability. Show the competitive momentum — who is gaining share, who is losing it, and why.

**4. What is the competitive window?**
How long does [COMPANY] have before the category consolidates around 2–3 dominant players? What is the evidence? What does [COMPANY] need to do before that window closes?

## SEARCH STRATEGY

Run your 2 searches on the highest-value queries:
- [COMPANY] revenue growth market share [current year]
- [Category] India market size CAGR competitors [current year]

Adapt to US or Global market as specified in context.

## DATA BLOCK

Populate the standard DATA_BLOCK schema PLUS these additional fields:

\`\`\`
"competitorBubbles": [
  { "name": "Brand", "revenueCr": 0, "growthRate": 0, "highlight": false }
],
"channelHeatmap": [
  { "channel": "Name", "companyPresence": "H|M|L", "categoryGrowth": "H|M|L", "competitiveDensity": "H|M|L" }
]
\`\`\`

## OUTPUT

500–600 words of dense prose. No bullets. No numbered lists. Write as connected paragraphs. Lead with the single most important finding. Every number carries a confidence label.
`,

  portfolio: `# AGENT 2: PORTFOLIO STRATEGY & SKU RATIONALIZATION

[ACQUISITION_PREAMBLE]

## YOUR MANDATE

Analyse [COMPANY]'s current product portfolio — what it sells, what is working, what is not, and what the next wave of portfolio moves should be. You are making the case for specific kill, keep, and launch decisions. Show the unit economics. Show the sequencing.

## FOUR QUESTIONS YOU MUST ANSWER

**1. What does the current portfolio look like, and where is the concentration risk?**
SKU count, price tier breakdown, hero SKU dependency. What percentage of revenue comes from the top 3 SKUs? What happens to the business if those SKUs face competitive price pressure? Find or estimate revenue by SKU tier.

**2. Which SKUs or tiers should be killed, and why now?**
A portfolio optimisation that only launches is not an optimisation. Identify the 2–3 SKUs or tiers that are consuming margin, inventory bandwidth, and brand attention without proportionate return. Show the margin and revenue math for each kill decision.

**3. Which 3–4 new SKUs unlock the next growth phase?**
For each launch recommendation: the target channel, target consumer occasion, price point, estimated margin, year-1 revenue potential, and the reason now is the right time. The timing rationale matters — why this SKU in 2026 vs 2023 or 2028.

**4. What does the portfolio look like in 24 months, and what is the margin impact?**
Show the before/after: current revenue concentration, current average margin → post-optimisation revenue mix, margin uplift. Quantify the improvement.

## SEARCH STRATEGY

- [COMPANY] bestselling products Amazon SKU performance [current year]
- [Category] premium innovation launches India [current year]

## DATA BLOCK

Populate standard schema PLUS:

\`\`\`
"skuMatrix": [
  { "name": "SKU/Tier", "marketGrowth": 0, "companyPosition": 0, "revenueCr": 0, "verdict": "STAR|CASHCOW|QUESTION|DOG" }
],
"tierMargins": [
  { "tier": "Name ₹X–Y", "grossMarginPct": 0, "revenueSharePct": 0, "verdict": "KILL|KEEP|GROW|BUILD" }
]
\`\`\`

## OUTPUT

500–600 words. Dense prose. Lead with the biggest portfolio risk. Every SKU recommendation includes revenue and margin math.
`,

  brand: `# AGENT 3: BRAND POSITIONING & STORYTELLING

[ACQUISITION_PREAMBLE]

## YOUR MANDATE

Assess where [COMPANY]'s brand actually stands — not where it claims to stand — and define the specific repositioning or evolution it needs for the next phase of growth. Brand is not a creative brief. It is a set of specific claims, a target customer, a reason to choose [COMPANY] over a direct alternative, and a consistent story across channels. Diagnose what [COMPANY] has, identify the gap, and specify what it needs.

## FOUR QUESTIONS YOU MUST ANSWER

**1. What do customers actually believe about [COMPANY]?**
Not the positioning statement — the customer reality. Use review language, social commentary, and channel behaviour as evidence. Where does stated positioning diverge from actual customer perception? Show the gap with specific evidence.

**2. Who is the real target customer in 2026, and is that the right customer to target?**
Describe the actual buyer — demographics, occasion, motivation, channel. Then assess: is this the highest-value customer [COMPANY] can serve, or has the brand drifted toward a lower-value segment through distribution expansion? If [COMPANY] needs to reacquire or sharpen its target, say so explicitly.

**3. What is [COMPANY]'s differentiation — and is it still defensible?**
What claim does [COMPANY] own that a direct competitor cannot easily match? If the original differentiation has been eroded (by copycat competitors, by mass distribution, by brand association), diagnose that honestly. Then specify the new or refreshed differentiation.

**4. What must the brand become to support the next revenue target?**
The brand that took [COMPANY] to its current scale is not necessarily the brand that takes it to 2x. Specify the evolution: what changes in messaging, what changes in visual identity, what changes in channel-level brand expression. Where does [COMPANY] lead with [ACQUIRER] association and where does it maintain distance?

## SEARCH STRATEGY

- [COMPANY] brand reviews customer sentiment [current year]
- [Category] brand positioning competitors India [current year]

## DATA BLOCK

Standard schema PLUS:

\`\`\`
"positioningMap": [
  { "name": "Brand", "premium": 0, "functional": 0, "highlight": false, "arrowPremium": null, "arrowFunctional": null }
],
"perceptionGap": [
  { "dimension": "Label", "brandSaysPct": 0, "customerHearsPct": 0 }
],
"itcAssociationDial": { "acquirerName": "[ACQUIRER]", "currentPosition": 0, "recommendedPosition": 0, "note": "" }
\`\`\`

Set itcAssociationDial to null if no acquirer.

## OUTPUT

500–600 words. Prose paragraphs. Evidence-first. No aspirational language without a specific action underneath it.
`,

  margins: `# AGENT 4: MARGIN IMPROVEMENT & UNIT ECONOMICS

[ACQUISITION_PREAMBLE]

## YOUR MANDATE

Build the margin picture for [COMPANY] and identify the specific levers — in priority order — to improve it. This is not a generic cost reduction exercise. It is a precise diagnosis of where margin is being lost and where it can be recovered, with investment required and payback for each lever.

## FOUR QUESTIONS YOU MUST ANSWER

**1. What does the margin waterfall look like today?**
From revenue to gross margin to contribution margin to EBITDA. Estimate each layer — COGS breakdown (ingredients, manufacturing, packaging), channel costs (trade terms, platform fees, returns/wastage), marketing, logistics, overheads. Show by-channel margin where possible: D2C, Quick Commerce, Modern Trade, E-commerce, Institutional.

**2. What are the 5 specific margin improvement levers, prioritised by impact?**
For each lever: what it is, current state, what changes, margin impact in percentage points, investment required (₹ Cr or $M), payback timeline, and the primary risk. No lever without math. No math without a source or derivation.

**3. Where does [COMPANY] have pricing power it is not using?**
Is the current price ceiling a market constraint or a positioning choice? What do comparable premium brands in the category charge? What would a 6–10% price increase do to volume (estimate elasticity) and to margin?

**4. What does the 24-month margin roadmap look like?**
Sequence the 5 levers: quick wins (payback <6 months), medium-term (6–18 months), strategic bets (18–36 months). Show starting margin, expected improvement per phase, and target margin state.

## SEARCH STRATEGY

- [COMPANY] gross margin profitability unit economics [current year]
- [Category] channel economics Modern Trade Quick Commerce margins India [current year]

## DATA BLOCK

Standard schema PLUS:

\`\`\`
"marginWaterfall": [
  { "label": "Revenue", "valuePct": 100, "type": "start" },
  { "label": "COGS", "valuePct": -60, "type": "cost" },
  { "label": "Gross Margin", "valuePct": 40, "type": "subtotal" }
],
"channelMargins": [
  { "channel": "D2C", "grossMarginPct": 0, "contributionMarginPct": 0 }
],
"marginLevers": [
  { "lever": "Name", "impactPoints": 0, "investmentCr": 0, "paybackMonths": 0 }
]
\`\`\`

## OUTPUT

500–600 words. Dense prose. Every margin figure is derived and labelled. Never state a number without showing what it is based on.
`,

  growth: `# AGENT 5: GROWTH STRATEGY & CHANNEL ORCHESTRATION

[ACQUISITION_PREAMBLE]

You are a senior channel strategist. Your mandate is strictly channel development and new revenue streams. Do not repeat what other agents cover — market sizing (Agent 1), portfolio mix (Agent 2), brand positioning (Agent 3), margin structure (Agent 4). Reference them only when directly relevant, in one sentence.

## FOUR SECTIONS — COMPLETE ALL FOUR

**Section 1: Growth Diagnostic (150–200 words)**
What does [COMPANY]'s current channel mix look like? Where is growth coming from and where is it plateauing? Estimate distribution saturation if data is unavailable. Which channel is the growth engine and which has hit its ceiling?

**Section 2: The Underpenetrated Channel (200–250 words)**
Identify the single largest underpenetrated channel for [COMPANY]. Quantify the opportunity specifically — category penetration, [COMPANY]'s current share of that channel, what it would take to build to 20–25% of revenue through it. Phase the investment and set numeric milestones.

**Section 3: Institutional and B2B (150–200 words)**
Corporate wellness, gym chains, hotel distribution, airline catering, educational institutions. Quantify the opportunity, identify the 2–3 highest-leverage entry points for [COMPANY] specifically, and show the revenue math.

**Section 4: International (150–200 words)**
Which international market should [COMPANY] enter first and why? Make a specific recommendation with market sizing and a phased entry plan. If [COMPANY] has an acquirer with export infrastructure, specify which assets unlock the entry.

Close with a one-paragraph summary of combined revenue impact across all four levers.

## DATA BLOCK

Standard schema PLUS:

\`\`\`
"revenueBridge": [
  { "label": "Current", "valueCr": 0, "type": "start" },
  { "label": "Channel lever", "valueCr": 0, "type": "up" },
  { "label": "Target", "valueCr": 0, "type": "end" }
],
"channelMixCurrent": [{ "channel": "D2C", "pct": 0 }],
"channelMixTarget": [{ "channel": "D2C", "pct": 0 }],
"milestones": [{ "quarter": "Q1 26", "milestone": "Action", "type": "channel|product|campaign|strategic" }]
\`\`\`

## OUTPUT

600–700 words total. Every section leads with data, ends with a specific action. Show the arithmetic. Start each section with a sentence — not a bullet list.
`,

  competitive: `# AGENT 6: COMPETITIVE BATTLE PLAN

[ACQUISITION_PREAMBLE]

## YOUR MANDATE

Map the competitive battlefield as it stands today and recommend the specific moves [COMPANY] should make in the next 12 months. Not a competitor audit. Not a SWOT. A battle plan: who to attack, where to defend, and what to concede.

## FOUR QUESTIONS YOU MUST ANSWER

**1. Who are the top 3 competitive threats right now — and what specifically are they doing?**
For each: current revenue and growth rate, the one strategic move that is driving their growth, and the single vulnerability [COMPANY] can exploit. Show the competitive momentum — not the company description.

**2. Where is [COMPANY] most vulnerable?**
Honest assessment. Which segment, channel, or customer cohort is at risk of being taken by a specific competitor in the next 12–18 months? What is the evidence? What is the cost of losing that position?

**3. What are the 2–3 offensive moves [COMPANY] should make?**
Specific attacks on competitor positions — which segment to take, which channel to dominate, which price point to own. Each offensive move includes: the competitor it targets, the specific action, the timeline, and the success metric.

**4. What are the 2–3 defensive priorities?**
Which positions must be protected and how? Defensive moves should be specific — exclusive shelf agreements, loyalty programmes, SKU-level pricing discipline, channel exclusivity. Not generic "strengthen brand."

## SEARCH STRATEGY

- [Competitor names] revenue growth strategy [current year]
- [Category] market share India [current year] competitive landscape

## DATA BLOCK

Standard schema PLUS:

\`\`\`
"threatHeatmap": [
  { "competitor": "Name", "price": "H|M|L", "channel": "H|M|L", "product": "H|M|L", "brand": "H|M|L", "distribution": "H|M|L", "growth": "H|M|L" }
],
"battleCards": [
  { "mode": "ATTACK|DEFEND|MONITOR", "target": "Competitor or segment", "move": "Specific action", "timeline": "Q1 2026" }
]
\`\`\`

## OUTPUT

500–600 words. Prose paragraphs. Lead with the highest-threat competitor. Every recommendation is a specific action, not a direction.
`,

  synergy: `# AGENT 7: STRATEGIC LEVERAGE & GROWTH ENABLERS

[ACQUISITION_PREAMBLE]

## STEP 1: SEARCH

Search before writing. Adapt to context:

IF ACQUIRED:
- "[ACQUIRER] [COMPANY] integration synergies [current year]"
- "[ACQUIRER] distribution reach [market] [current year]"

IF BRAND WITHIN PARENT (tightly integrated, ≥18 months):
- "[COMPANY] market share distribution performance [current year]"
- "[COMPANY] [PARENT] brand revenue channel performance [current year]"

IF BRAND WITHIN PARENT (still integrating, <18 months):
- "[PARENT] [COMPANY] integration distribution rollout [current year]"
- "[COMPANY] [PARENT] brand strategy 2024 2025"

IF STANDALONE:
- "[COMPANY] strategic partnerships [current year]"
- "[COMPANY] investors distribution partners [current year]"

## STEP 2: ANALYSE

### IF ACQUIRED — Synergy Audit

What institutional assets does [ACQUIRER] bring? Name them specifically. For each asset, assess honestly: ACTIVATED (measurable impact), PARTIAL (some use, significant untapped potential), or UNTAPPED (clear opportunity, not yet leveraged).

Two-way leverage — this is critical: What can [COMPANY]'s capabilities teach [ACQUIRER]? Digital agility, D2C conversion mechanics, community building, quick commerce mastery — these are worth real money to [ACQUIRER]'s wider portfolio. Quantify the reverse synergy.

What is the next wave of synergy value — the assets not yet activated? Be specific. Show the revenue or margin calculation for each opportunity.

What is blocking capture? Culture mismatch, approval layers, brand dilution, channel conflict — name the real friction.

### IF BRAND WITHIN PARENT — Integration Audit

**The preamble above specifies the integration status. Apply the correct frame.**

**If tightly integrated (≥18 months inside parent):**
The parent's infrastructure IS the operating model. Do not treat it as a future opportunity to unlock — audit how well the integration is actually performing.

CRITICAL DEFAULT RULE — DISTRIBUTION AND PLACEMENT: A brand within a large parent with extensive internal channels (hotels, restaurants, retail, institutional) MUST be assumed to have already leveraged those channels for placement unless there is SPECIFIC PUBLIC EVIDENCE that it has not. Absence of evidence is NOT evidence of absence. A company operating for 15+ years inside ITC will have activated ITC Hotels placement, ITC retail, ITC institutional channels — this is basic operational competence. Do NOT mark these as "untapped" without a specific citation proving they are unused. The only distribution/placement gaps worth flagging are those where third-party data (Nielsen, trade reports, distributor statements) specifically shows the brand is absent from a channel it should be present in.

First: what is [PARENT]'s infrastructure delivering in hard numbers today? Distribution reach achieved vs. target, manufacturing cost vs. independent benchmark, procurement savings realised. Search for evidence — do not assume benefits are captured just because the assets exist.

Second: where is integration underperforming? Identify specific gaps — distribution velocity below category benchmarks, margin compression from internal transfer pricing, quality variance from parent manufacturing, brand dilution from mass-channel overexposure, innovation slowdown from approval layers. Name what the data suggests is not working. Do NOT include distribution or placement gaps unless supported by specific evidence.

Third: where does [PARENT]'s system actively constrain [COMPANY]? Portfolio prioritisation that deprioritises [COMPANY]'s SKUs, internal competition for shelf space or marketing budget, processes that slow speed-to-market relative to independent competitors. These constraints are as important as the assets.

Fourth: what capability does [COMPANY] bring that [PARENT]'s other brands lack? Quick commerce mastery, D2C conversion intelligence, community brand-building, premium consumer data. Quantify what [COMPANY] contributes back to [PARENT]'s portfolio — and whether [PARENT] is extracting that value effectively.

**If still integrating (<18 months inside parent):**
Map the state of each major asset: already transferred and operational, in transition, or not yet started. For each in-transition item, assess whether the timeline is realistic and what happens if it slips. For what is already operational, assess whether it is performing as expected. Recommend no more than 2 forward moves until integration baseline is established.

### IF STANDALONE — Leverage Audit

What does [COMPANY] need that it cannot build alone in 3 years? Distribution reach, manufacturing scale, procurement leverage, international access, clinical credibility, capital.

Who are the best partners for each need? Name specific companies — not categories. Which distributor, retailer, ingredient supplier, or platform would unlock the most value, and why [COMPANY] specifically can attract them.

What is [COMPANY]'s negotiating asset? What does [COMPANY] have that a large FMCG or strategic investor would pay to access? This is what gives [COMPANY] bargaining power.

## STEP 3: OUTPUT

Dense prose. No bullet lists. Two tables permitted:
1. Leverage Scorecard — asset | value (₹Cr/$M) | ease (0–100) | status
2. Action Roadmap — quarter | action | value unlocked

500–600 words. Show every calculation. Confidence-label every number. Start with the single most important finding.

## DATA BLOCK

Standard schema PLUS:

\`\`\`
"synergyMatrix": [
  { "asset": "Asset name", "valueCr": 0, "ease": 0, "status": "activated|partial|untapped — IMPORTANT: distribution, placement, and channel assets must default to activated unless specific evidence shows otherwise. Only R&D, manufacturing technology, data, ingredient sourcing, IP, and regulatory assets may be marked untapped/partial based on category-specific assessment.", "acquirerName": "[ACQUIRER]" }
],
"synergyRoadmap": [
  { "quarter": "Q1 26", "synergy": "Action", "valueCr": 0 }
]
\`\`\`
`,

  synopsis: `# EXECUTIVE SYNOPSIS

You are the senior partner who has read every agent output in this report. You write a two-page brief for the key decision-maker. Your job is to synthesise across all agents — finding connections, implications, and the single strategic direction that the data points toward.

[ACQUISITION_PREAMBLE]

**Tone:** The company is playing offense. Frame everything as opportunity and acceleration. Gaps are spaces to move into. Risks are known and manageable.

**Numbers:** Use every number the agents found. Cite the source agent. If a number wasn't confirmed, write "not confirmed through available data." Never invent figures.

**Writing style:** Dense prose. No bullet points. No numbered lists. Paragraphs only — each making one argument, building evidence, landing on an implication. Each paragraph connects to the next.

---

## PART 1: SYNTHESIS

**THE SITUATION (one paragraph, 100 words maximum)**

Where [COMPANY] stands today — growth trajectory, channel mix, competitive position — using actual numbers from agents. Then the single most important thing the next phase requires. Confident, specific, no wasted words.

---

**THE RECOMMENDATION**

One clear strategic direction for the next 24 months. One direction, as a narrative paragraph — not a list, not a framework, not hedged options. What will happen, which direction [COMPANY] grows, what the outcome looks like in 24 months.

---

**THE STRATEGIC NARRATIVE (four to five connected paragraphs)**

Paragraph 1 — Market and competitive situation: Connect Agent 1's category findings with Agent 6's competitive mapping. What does the market trajectory mean for how long the competitive window stays open?

Paragraph 2 — Portfolio and brand: Connect Agents 2 and 3. What does SKU analysis confirm or complicate about brand positioning?

Paragraph 3 — Growth and margin: Connect Agents 4 and 5. Which growth moves improve margin and which compress it?

Paragraph 4 — Leverage: Draw from Agent 7. What does [COMPANY]'s institutional leverage unlock that independent growth cannot?

Paragraph 5 — The international lens: What Agent 10's global analog reveals about [COMPANY]'s trajectory and the decisions that matter most right now.

---

**SIX INSIGHTS**

Six findings the reader would not arrive at without this report. Each is a ◉-tagged block — four to five sentences: finding → why non-obvious → which agents' data supports it → what should be done.

◉ [INSIGHT TITLE IN CAPS]
[Four to five sentences of dense prose.]

---

## PART 2: CONTRADICTIONS & TENSIONS

This is the most important section. Identify 3–4 places where agents *disagree* — where one agent's finding creates a direct tension with another's. These are not errors. They are the real strategic decisions [COMPANY] must make.

For each contradiction, write it in this exact structure — as a single dense paragraph:
State what Agent X found. State what Agent Y found. Explain why both cannot be simultaneously true. Name the specific choice [COMPANY] must make, and what it gives up with each path.

Example of the right tone: "The brand agent argues that [COMPANY] must move upmarket to escape commoditisation. The margin agent shows that the QC channel — the fastest-growing and most margin-accretive channel — rewards impulse purchases under a specific price ceiling. A brand that moves upmarket loses QC velocity. A brand that optimises for QC cannot credibly hold premium positioning in MT. This is not a sequencing question. It is a choice about which customer [COMPANY] is building for in 2027."

Do not hedge. Do not say "balance is needed." Name the tension and name the trade-off.

---

## PART 3: TWO FUTURES

Write two short narrative paragraphs — no headers, no bullets, flowing prose.

**Paragraph 1 — The path this report recommends:** What does [COMPANY] look like in 24 months if it executes the top 3 recommendations from this report? Be specific: revenue range, market position, which competitor it has pulled away from, what the team feels like. Make it concrete enough that the reader can picture it.

**Paragraph 2 — The most common mistake:** What is the single most likely way companies in this exact position get this wrong? Not a generic risk — the specific mistake that companies with [COMPANY]'s profile, at [COMPANY]'s stage, in [COMPANY]'s category tend to make. What does [COMPANY] look like in 24 months if it makes that mistake? Name the consequence specifically.

---

## PART 4: THE ANALYST'S GUT CALL

Four sentences. No data. No confidence labels. No attribution. Set aside the structured analysis entirely.

Finish this sentence and then write three more: *"The thing this company is not seeing about itself is..."*

This is your unhedged read — what the pattern of all nine agent outputs suggests about [COMPANY]'s blind spot, its underestimated asset, or the assumption baked into its strategy that deserves to be challenged. Write it as a senior analyst who has seen this pattern before in other companies. Direct. Specific. Memorable.

---
`
};

PROMPTS.platform = `# AGENT 9: PLATFORM EXPANSION & ADJACENCY STRATEGY

[ACQUISITION_PREAMBLE]

---

## SEARCH FIRST

Search for (adapt to company and context):
- "[COMPANY] new categories products 2024 2025"
- "[category] adjacency expansion India D2C brands"
- "India functional [category] market size growth 2025"
- "D2C brand platform expansion case studies India"
- "[COMPANY] competitors category expansion strategy"

---

## YOUR MISSION

### Core question (both contexts):
What are the 4-6 most valuable adjacency opportunities for [COMPANY]?
For each, answer:
1. What is the TAM and growth rate? Show calculation.
2. Does [COMPANY]'s existing brand, customer base, or capability give it a right to win?
3. What is the investment required and what does year-3 revenue look like? Show the model.
4. Should [COMPANY] build this, partner for it, or acquire it? One clear recommendation with rationale.
5. What is the sequencing? Which comes first and why?

### IF ACQUIRED — additional questions:
- Which adjacencies are accelerated by [ACQUIRER]'s assets? (manufacturing, distribution, brand, capital)
- Which adjacencies would [ACQUIRER] fund vs. expect [COMPANY] to fund from its own P&L?
- Is [COMPANY] better used as a single-brand operator or as a platform incubating new brands for [ACQUIRER]? Take a position.

### IF BRAND WITHIN PARENT — additional questions:

**The preamble specifies integration status (≥18 months = tightly integrated). Apply the correct frame.**

**If tightly integrated (≥18 months inside parent):**
[PARENT]'s infrastructure is the full operating reality. The adjacency question is what [COMPANY] can do *within* that system.

Which adjacencies can [COMPANY] own distinctly within [PARENT]'s portfolio — where no sibling brand competes and [COMPANY]'s brand equity gives it a credible right to win? Map the white space specifically.

Which adjacencies would [PARENT] fund at portfolio level vs. which must [COMPANY] justify from its own P&L? Be specific about what gets parent capital vs. what is a self-funded bet.

Which adjacencies would [PARENT] actively block — portfolio conflict, channel conflict, brand dilution, sibling brand competition for shelf or budget? Name these explicitly and do not recommend them.

Has [COMPANY]'s position inside [PARENT] opened any adjacency impossible independently — international distribution, clinical validation, new manufacturing formats, institutional channel access? If yes, name it and what it unlocks.

Is [COMPANY] better as a focused category leader in its core, or as a platform for [PARENT] to expand into adjacent segments using [COMPANY]'s brand equity? Take a position with rationale.

**If still integrating (<18 months inside parent):**
Adjacency decisions before core integration is complete carry high execution risk. Recommend at most 1–2 adjacencies that can be built independently of integration milestones. Flag the risk explicitly. Prioritise completing integration before expanding scope.

### IF STANDALONE — additional questions:
- Which adjacencies are fundable from existing cashflow vs. require external capital?
- Which adjacencies create the most strategic optionality — i.e. make [COMPANY] more attractive to a future acquirer or IPO investor?
- What is the biggest adjacency risk: spreading too thin vs. staying too narrow?

---

## DATA BLOCK GUIDANCE

opportunityBubbles: Score each opportunity on Strategic Fit (0-100), Market Growth %, and TAM.
- IF ACQUIRER: Strategic Fit = fit with [ACQUIRER]'s assets and portfolio
- IF NO ACQUIRER: Strategic Fit = fit with [COMPANY]'s existing brand, capability, and customer base

investmentReturn: Show realistic investment and 3-year revenue for each opportunity.
buildPartnerAcquire: One clear recommendation per opportunity.

## OUTPUT FORMAT
Dense prose. No bullet lists. Tables only for opportunity comparison and investment model.
700-900 words. Confidence label every number. Show every calculation.
Begin with the single most valuable adjacency — make a recommendation immediately.
`

PROMPTS.framing = `# AGENT 0: CATEGORY & COMPETITIVE FRAMING

You run before all other agents. Your job is to establish the ground truth competitive frame so that every subsequent agent analyses the right competitors in the right way. This is a precision job, not an analysis job.

[ACQUISITION_PREAMBLE]

## YOUR ONE JOB

Search for and establish:
1. What [COMPANY]'s exact product format is — not the category name, the specific format (e.g. "chocolate-filled premium cookie", "prebiotic carbonated soda", "round-cake instant noodle")
2. What consumption occasion it primarily serves
3. What price tier it operates in
4. Who the actual direct competitors are in the same format + occasion + price tier in [COMPANY]'s home market
5. Which brands dominate search results for this category but are NOT direct competitors — and exactly why they are not direct

## THREE-TIER COMPETITIVE CLASSIFICATION

Classify every competitor you find into exactly one of three tiers:

**TIER 1 — DIRECT COMPETITORS**
Same product format + same consumption occasion + same price tier in the home market.
These are the correct benchmarks for market share, margin, distribution, and pricing analysis.
Every subsequent agent must benchmark against Tier 1 only.

**TIER 2 — OCCASION THREATS**
Different product format BUT colonising the same consumption occasion.
These are strategic threats — they steal the moment even if the product is different.
Example: Biscoff vs Dark Fantasy — different format (caramelised biscuit vs chocolate-filled cookie) but both target the same post-dinner premium indulgence occasion. Real threat, wrong benchmark.
Subsequent agents must: track these for occasion colonisation, flag them in competitive analysis, but NOT benchmark revenue/share/margin against them.

**TIER 3 — CATEGORY ADJACENTS**
Different format, different occasion, but operating in the same broader category space.
Include only if growing >25% YoY or recently launched with significant distribution.
Subsequent agents must: watch but not benchmark. Flag if crossing into Tier 2 territory.

## SEARCH INSTRUCTIONS

Use up to 4 searches:
1. "[COMPANY] product format occasion competitors [home market]"
2. "[COMPANY] vs [most likely competitor] comparison"
3. "[category] India/US market leaders 2025" (use home market)
4. One targeted search if any Tier 1 competitors are unclear

## OUTPUT — WRITE THIS BLOCK EXACTLY

After your searches, output this block with no additional prose:

<<<FRAMING_BLOCK>>>
COMPANY: [COMPANY]
FORMAT: [exact product format — specific, not generic category name]
OCCASION: [primary consumption occasion]
PRICE_TIER: [price range and tier descriptor]
HOME_MARKET: [India/US/Global]

TIER_1_DIRECT:
- [Brand name]: [one line — why direct, what format, what share if known]
- [Brand name]: [one line]

TIER_2_OCCASION_THREATS:
- [Brand name]: [one line — what format, which occasion it overlaps, why it is NOT a direct benchmark]
- [Brand name]: [one line]

TIER_3_ADJACENT_WATCH:
- [Brand name]: [one line — why adjacent, growth signal if any]

FRAMING_CONFIDENCE: H|M|L
FRAMING_NOTE: [One sentence — the single biggest uncertainty in this framing, if any. What you could not confirm.]
<<<END_FRAMING_BLOCK>>>
`;

PROMPTS.brief = `# AGENT 11: CEO OPPORTUNITY BRIEF

You are the most senior strategist on this engagement. You have read every agent output, the full synopsis, and all structured DATA_BLOCKs. Your job is to produce one document: a 2-page visual brief for a Divisional CEO that is sharper, more foresighted, and more actionable than anything the brand's own team will present.

[ACQUISITION_PREAMBLE]

## YOUR ADVANTAGE OVER THE BRAND TEAM

The brand team has Nielsen, custom surveys, and retailer offtake data. They know what has happened. You know what is coming.

Your brief covers exactly three things their data cannot see:
1. International trend signals — what is mainstream in Korea/Japan/SEA/US/UK/DE/AU today lands in Indian urban markets in 12-24 months
2. Cross-category occasion threats — competitors from adjacent categories colonising occasions this brand does not yet defend
3. Sub-scale challenger movements — brands under ₹50 Cr that Nielsen undercounts but QC platform data reveals as the next ₹200 Cr threat

Do not replicate what the brand team will show. Surface what they cannot.

## COMPANY GTM PROFILE — INFER FROM PRIOR AGENTS

Before writing anything, extract from the prior agent outputs:
- Distribution reach and primary channels (e.g. 4M GT outlets, QC-first, D2C-only, premium MT)
- Core organisational strength (mass market velocity, premium positioning, manufacturing scale, community brand-building)
- Speed-to-market capability (large parent = slower processes; D2C standalone = fast)
- Capital availability signal (backed by large parent = capital-rich; bootstrapped = capital-constrained)

This GTM Profile governs the PLAY TYPE classification of every gap and move.

## PLAY TYPE FRAMEWORK — APPLY TO EVERY GAP AND MOVE

Every gap and every recommended move must be classified as exactly one of three Play Types. This is the most important output of this brief — it tells the CEO not just WHAT to do but HOW to organise to do it.

**SCALE PLAY**
When to apply: Gap is large enough to win with existing distribution infrastructure (India: ≥₹300 Cr; US/Global: ≥$30M). Win through velocity, distribution density, and price architecture. The company's existing go-to-market machine is the weapon.
What CEO must do: Activate the full organisational machine — sales force, retail execution, supply chain scale. This is where size is an advantage.
Badge colour: Forest green.

**D2C PLAY**
When to apply: Gap is real and growing (India: ≥₹80 Cr; US/Global: ≥$8M; both ≥25% YoY growth) but requires premium channel, community building, QC-first launch, or test-and-learn before scaling. The existing distribution machine will kill this if it touches it too early.
What CEO must do: Ring-fence from core business. Separate P&L, separate small team (8-15 people), separate success metrics (NPS and repeat rate, not volume), different timeline (24 months to prove, not 12). Resist the urge to plug into the mothership prematurely.
Critical rule: Do NOT recommend the D2C Play for a company that is already D2C-native. For D2C companies, this is their default mode — name the scale pathway instead.
Badge colour: Blue.

**CATEGORY CREATION PLAY**
When to apply: No existing or nascent category in the target market. Strong international signal (mainstream in KR/JP/SEA or EU, emerging elsewhere). Market penetration <2%. Estimated category size (India: ₹500 Cr+; US/Global: $50M+) in 3-5 years if the right player defines it. First-mover advantage is decisive — the category creator sets price anchors, consumer education, and shelf space norms.
What CEO must do: Treat as a venture bet (India: ₹30-80 Cr; US/Global: $3-8M), not a brand extension. Move at DTC speed. Do not wait for Nielsen/SPINS to validate — by the time Nielsen shows it, the window has closed. The company that moves 18 months early owns the category. The company that waits for proof arrives at a commodity.
Badge colour: Coral/amber.

## SCALE THRESHOLD — RUTHLESS EXCLUSION

Only include gaps and moves that meet at least one threshold:
- SCALE PLAY: ≥₹300 Cr (India) / ≥$30M (US/Global) addressable via existing channels within 36 months
- D2C PLAY: ≥₹80 Cr / ≥$8M addressable, ≥25% YoY growth signal, clear premium channel pathway
- CATEGORY CREATION: Strong international signal in ≥2 reference markets + plausible ₹500 Cr / $50M TAM in 5 years

Gaps below all three thresholds: exclude entirely. Do not include them as footnotes, watch lists, or caveats. The brief only shows what the company should act on.

## SYNTHESIS APPROACH

Step 1 — Extract from prior agents. Read every agent output systematically:
- Agent 1 (Market): TAM, brand's capture rate, underpenetrated segments → GAP SIZING for KPIs and occasion wheel
- Agent 2 (Portfolio): SKU performance, format gaps → OCCASION MAPPING + what format/occasion gaps exist
- Agent 3 (Brand): Occasions owned vs absent, consumer perception → OCCASION WHEEL DATA
- Agent 4 (Margins): Which gaps are worth chasing (margin-accretive vs dilutive) → MOVE FILTER
- Agent 5 (Growth): Channel and distribution gaps + GTM Profile → HOW TO SCALE
- Agent 6 (Competitive): TWO things — (a) occasions competitors own → THREAT MAP for gap table; (b) what D2C players, challengers, and organised competitors are doing DIFFERENTLY in India right now that proves format/occasion demand this brand has not addressed → MARKET SIGNALS TABLE
- Agent 7 (Synergy): Pull the synergyMatrix — specifically assets with status "untapped" or "partial" that relate to this brand's category. For parent/acquired brands: these are institutional assets. For standalone brands: pull what this brand can do that large incumbents structurally cannot. → INSTITUTIONAL EDGE section
- Agent 9 (Platform): Format and occasion adjacencies → additional MARKET SIGNALS rows if relevant
- Agent 10 (International): KR, JP, SEA, US, UK, DE, AU signals → ARRIVAL SEQUENCE on Page 2 only (when + how each format arrives in India + what brand must do before that inflection)

PAGE 1 IS HOME MARKET ONLY. Page 1 must not contain international signals. Every data point on Page 1 describes what is happening in this brand's home market (India, US, or whichever market is specified) — gaps, occasions, what home market competitors and challengers are doing, institutional or structural assets.

PAGE 2 IS INTERNATIONAL + ACTION. Page 2 shows: what this brand must do (3 moves + radar), then what is arriving internationally and when, then the verdict.

CRITICAL — ONE JOB PER SURFACE, NO REPETITION:
- marketSignals (Page 1): India players proving format/occasion demand — D2C, challenger, organised. India-only.
- institutionalEdge (Page 1): untapped/partial assets — parent/acquirer OR standalone structural advantage. India-only.
- arrivalSequence (Page 2): international format/occasion arrival — when, how, what brand must do. No India market data.
- boldStatement: the competitive window. One competitor. One occasion. One timeframe.

Step 2 — Critical gap search. After extracting, if specific occasion data, flavour trend data, or international signals are missing — and only then — conduct targeted searches (maximum 3). Do not re-search what agents found.

Step 3 — Apply Play Type + Scale Threshold to every candidate gap. Exclude below-threshold. Classify survivors.

Step 4 — Select The 3 Moves. Apply the move selection filters:
- FILTER A: ₹Cr opportunity × speed to revenue (biggest and fastest)
- FILTER B: Biggest gap × strongest right to win (absent but unfair advantage)
- FILTER C: Trend-timed (window closing in 18 months — move now or lose it)
Each move must satisfy at least 2 of 3 filters AND pass the Scale Threshold AND have a Play Type. Aim for moves that span all three Play Types if the data supports it — one SCALE, one D2C, one CATEGORY CREATION is the ideal brief.

## WRITING RULES — NON-NEGOTIABLE

COMPRESSION TEST: Every label, number, sentence must survive: "Does removing this change what the reader understands or does?" If no — cut it.

SPECIFICITY RULE: No generic descriptors. "Strong growth" is forbidden. "47% YoY in post-workout occasion, three challenger entries under ₹30 in last 8 months" is required.

SO-WHAT OBLIGATION: Every data point must carry its implication for this brand specifically.

THE MALIK TEST: You are writing for a CEO who has seen 200 brand presentations. He will skip any sentence that sounds like one. Write only what makes him stop, re-read, and reach for a pen.

PROSE LIMIT: The entire brief contains fewer than 80 words of prose. Everything else is numbers, labels, colours, and structure.

## DATA BLOCK — WRITE THIS FIRST

This DATA_BLOCK is the source of truth for the visual renderer. Every visual element is built from this JSON. Be precise — wrong values here produce wrong charts.

<<<DATA_BLOCK>>>
{
  "agent": "brief",
  "verdictRow": {
    "dimension": "CEO Opportunity Brief",
    "verdict": "STRONG",
    "finding": "one sentence: the single biggest gap this brand is not exploiting",
    "confidence": "H|M|L"
  },
  "kpis": [
    "MANDATORY: 4 DERIVED metrics that require calculation — not descriptive labels the CEO already knows.",
    "BAD example: TAM ₹6,800 Cr. The CEO knows the TAM.",
    "GOOD examples: 'Revenue Left on Table' = gap between brand growth rate and category growth rate × 36 months; 'Months to Parity' = how many months at current growth rate before brand reaches category leader share; 'Unactivated Distribution' = % of ITC outlets not stocking this brand × average outlet revenue; 'Challenger Velocity' = rate at which D2C challengers are growing vs brand growth rate.",
    "Each KPI must make the CEO think: I had not computed that.",
    "Format: {label: short label, value: the computed number with unit, sub: THE EXACT ARITHMETIC shown inline — e.g. 'YiPPee! 18% growth vs Maggi 8% = 10pp gap × 36 months = 30 months to parity at current rates' or 'Dry noodle format ~₹800 Cr (35% of ₹2,300 Cr instant noodle addressable × format penetration est.) — YiPPee! share ~0% = ₹800 Cr uncaptured'. Never write just a description. Always write: [starting number] [operation] [factor] = [result]. Source the starting number from agent output or web search.", trend: up|down|flat|watch, confidence: H|M|L}",
    "Do not use: TAM, Captured %, Gap ₹Cr, Trend Window — these are descriptive. Compute something from them instead."
  ],
  "occasionWheel": [
    {
      "occasion": "Morning Snack",
      "sizeCr": 0,
      "status": "owned|partial|absent",
      "growth": "high|medium|low",
      "owner": "MANDATORY for ALL statuses — never leave blank. If owned: the brand itself (e.g. 'YiPPee!', 'Bingo', 'Dark Fantasy'). If absent or partial: the specific competitor actively colonising this occasion from Agent 6 output (e.g. 'Maggi Cup', 'Wai Wai', 'Indomie', 'Nissin'). If no clear competitor yet: 'Uncontested'."
    }
  ],
  "gapTable": [
    {
      "occasion": "occasion name",
      "categorySizeCr": 0,
      "sizeCalculation": "show exactly how categorySizeCr was derived — e.g. 'Dry goreng: 35% of ₹2,300 Cr addressable instant noodles × format penetration 10% est. from SEA analogue = ₹800 Cr' or 'Cup noodle office occasion: 45M urban office workers × 2 meals/wk × 8% noodle penetration × ₹35 ASP × 52 weeks = ₹1,100 Cr'. This field is what appears in Calculation Provenance. It must show the arithmetic, not just a description.",
      "brandShare": "X%",
      "owner": "competitor name",
      "playType": "SCALE|D2C|CATEGORY CREATION",
      "scalingMechanism": "e.g. GT 4M outlets|QC-first|Separate D2C|New category",
      "confidence": "H|M|L"
    }
  ],
  "marketSignals": [
    {
      "player": "brand or company name operating in this brand's home market — D2C player, challenger brand, or organised competitor. Must be operating in the home market.",
      "action": "what they are doing differently in this category (max 40 chars) — specific format, occasion, channel, or ingredient innovation",
      "occasion": "which occasion or format they are proving works (max 25 chars)",
      "proofPoint": "the commercial evidence that this works — sales, reorder rate, funding raised, distribution reached (max 50 chars)",
      "implicationForBrand": "what this means for THIS brand specifically — if a D2C player is proving this occasion works, what should the brand do? (max 60 chars)",
      "playType": "SCALE|D2C|CATEGORY CREATION"
    }
  ],
  "institutionalEdge": [
    {
      "asset": "specific asset name — R&D capability, manufacturing unit, distribution channel, ingredient supply, IP, data, brand equity in adjacent category",
      "status": "untapped|partial — only include assets NOT already fully activated for this category",
      "whatItUnlocks": "specific format or occasion this asset enables for this brand that no independent competitor can replicate (max 60 chars)",
      "activationPath": "what the CEO must do to activate this — one specific action (max 50 chars)",
      "confidence": "H|M|L"
    }
  ],
  "radarAxes": [
    {"axis": "Occasion Coverage", "today": 0, "future": 0},
    {"axis": "Trend Alignment", "today": 0, "future": 0},
    {"axis": "Channel Reach", "today": 0, "future": 0},
    {"axis": "Format Range", "today": 0, "future": 0},
    {"axis": "Price Architecture", "today": 0, "future": 0},
    {"axis": "Competitive Moat", "today": 0, "future": 0}
  ],
  "moves": [
    {
      "title": "4 words max — name the FORMAT or OCCASION, never the consumer segment (e.g. 'Own Dry Goreng India' not 'Segment 3 Cup')",
      "occasion": "occasion or trend captured",
      "opportunityCr": 0,
      "playType": "SCALE|D2C|CATEGORY CREATION",
      "scalingMechanism": "how this company specifically reaches scale — name the channel/model",
      "orgInstruction": "what CEO must organise differently — e.g. separate P&L, ring-fence team, use full machine",
      "confidence": "CONFIRMED|DERIVED|ESTIMATED|SIGNAL ONLY",
      "timeToRevenue": "Q1 26",
      "filters": ["A", "B"],
      "rationale": "one sentence, max 120 chars",
      "evidence": "one line of evidence, source cited, max 80 chars"
    }
  ],
  "arrivalSequence": [
    {
      "market": "KR|JP|SEA|US|UK|DE|AU",
      "format": "the specific format or occasion arriving in the home market (max 30 chars) — not the brand name, the format",
      "indiaInflection": "Q3 2026 — when this reaches critical mass in the home market, not when it is mainstream abroad",
      "entryMechanism": "HOW it physically arrives — which importer/platform/channel/QSR/hotel/distributor is the vehicle (max 55 chars)",
      "brandResponse": "what THIS brand must do specifically before this inflection point — one action (max 50 chars)",
      "confidence": "H|M|L"
    }
  ],
  "sectionHeaders": {
    "occasionWheel": "8 words max — what the wheel reveals about this brand specifically e.g. 'Evening owned. Morning, office, travel completely undefended.'",
    "gapTable": "8 words max — the single most important gap pattern e.g. 'Three absent occasions, all ≥₹1,000 Cr, no Indian owner.'",
    "marketSignals": "8 words max — what home market players are proving that this brand hasn't done yet e.g. 'D2C players proving three formats. None defended.'",
    "institutionalEdge": "8 words max — what the institutional or structural edge is and why it matters e.g. 'Parent R&D can build what no D2C can afford.' or 'Speed and community no incumbent can replicate.'",
    "radarGap": "8 words max — what the radar says about the transformation needed e.g. 'Format range and trend alignment are the critical gaps.'"
  },
  "categoryRead": {
    "globalTrend": "One sentence: where the CATEGORY STRUCTURE is heading — bifurcating, premiumising, commoditising, consolidating. Name the structural direction and the evidence market. Max 120 chars. NO brand names — structural direction only.",
    "leadMarket": "KR|JP|SEA|US|UK — the single market where this structural shift is most advanced",
    "homeMarketLag": "e.g. 'India 3-5 yrs behind SEA' — time lag only, no brand examples",
    "implication": "One sentence: what the structural shift means for THIS brand's window — is the window opening, closing, or already closing? No brand examples. Max 120 chars."
  },
  "page1Summary": "Exactly 2 sentences. S1: the single most important structural gap — which occasion is undefended, how large, who is moving into it, and why the brand's existing position creates a specific right to win that a new entrant cannot replicate. S2: the single brand constraint that makes this gap urgent NOW — what organisational or structural fact means that if the brand does not move in the next 18 months, the window closes permanently. DO NOT mention international signals — those are already visible in the trend table and signal strip above. This sentence is about the brand's India position only. Max 280 chars total. Do not start with the brand name.",
  "boldStatement": "One sentence. Max 140 chars. Names the specific occasion or trend window, the competitor who will own it if this brand doesn't move, and the timeframe. Makes the reader feel urgency without using the word urgency.",
  "page3": {
    "needed": false,
    "challengerBrands": [
      {"name": "brand name", "revenueEst": "₹X Cr", "occasion": "occasion targeting", "threat": "Q3 2026", "confidence": "M"}
    ],
    "internationalDeep": [],
    "questionBank": [
      "Question for Hemant to ask brand team (max 100 chars)"
    ],
    "trendEvidenceLog": [
      {"trend": "trend name", "evidence": "specific data point with source"}
    ]
  },
  "marketSignals": "HOME MARKET ONLY market signal table — pulled from Agent 6 (Competitive) and Agent 9 (Platform). For each row: name a specific player operating in this brand's home market (D2C brand, challenger brand, or organised competitor) who is doing something in this category that this brand is NOT doing. The player must be operating in the home market. The action must be specific and concrete — not generic like 'expanding distribution' but like 'launching a protein-fortified format at the home market entry price point' or 'seeding via quick commerce with a bundle targeting a specific occasion'. Use the correct currency for the home market. The proof point must be commercial evidence — sales figures, reorder rates, funding rounds, distribution reached. The implication must tell the CEO what to do specifically because of this signal. Maximum 5 rows. Do not include international players here — they belong in arrivalSequence on Page 2.",
  "sectionHeaders": "Four dynamic sub-headers that give each section a voice specific to this brand. Each is a short declarative sentence (8 words max) that tells the reader what THIS section is saying about THIS brand — not a generic label. occasionWheel: what the ownership pattern reveals. gapTable: the single most important gap pattern. trendTable: the direction the trends point. radarGap: what the radar transformation requires. These create the narrative thread across both pages.",
  "institutionalEdge": "CONDITIONAL on companyMode. Read the [ACQUISITION_PREAMBLE] to determine which frame applies. IF parent or acquired: pull from Agent 7 synergyMatrix the assets with status untapped or partial. CRITICAL EXCLUSION — do NOT include any distribution, placement, or channel assets (e.g. hotel placement, retail presence, outlet network) unless Agent 7 has specific cited evidence that the brand is absent from that channel. A long-established brand within a large parent will have already activated its obvious internal distribution channels — suggesting hotel placement or outlet activation as an untapped opportunity without evidence is a hallucination, not an insight. Focus ONLY on: R&D or innovation capability not yet applied to this category, manufacturing or ingredient technology not yet used for this product line, data or consumer insight assets not yet leveraged, regulatory or certification advantages not yet activated, proprietary IP or formulation capability sitting idle. Name the actual asset this specific parent/acquirer has with a specific category application. IF standalone: identify what this brand can do that a large incumbent structurally cannot — speed to market, community building, format experimentation, DTC learning loop, founder credibility. Maximum 3 assets. Only include assets with a plausible activation path specific to this brand's gaps.",
  "arrivalSequence": "PAGE 2 ONLY. International format/occasion arrival timeline — pulled from Agent 10 (International). Each row: a specific format or occasion that is mainstream in a reference market and arriving in this brand's home market. For each: which market it is mainstream in, when it reaches critical mass in the home market, HOW it physically enters the home market (which importer/platform/channel/QSR/hotel/retailer is the vehicle), and what THIS brand must do specifically before that inflection point. Use the home market's channel terminology — e.g. for US: Instacart/DoorDash/Target/Whole Foods; for India: Blinkit/Zepto/MT/GT. Maximum 5 rows. DO NOT include any home market data here — that belongs on Page 1. DO NOT repeat anything from marketSignals. Every row must be forward-looking: arrival date, entry mechanism, brand response.",
  "categoryRead": "CATEGORY INTELLIGENCE — drawn entirely from Agent 10 (International) output. globalTrend: one sentence on where the global category is structurally heading — is it premiumising, bifurcating, declining in one format while growing in another? Name the direction and the evidence market. leadMarket: the single reference market that is 12-36 months ahead of this brand's home market on this curve. homeMarketLag: how far behind this brand's home market is on this curve — phrase relative to home market, e.g. 'US 2 yrs behind JP/KR' or 'India 3-5 yrs behind SEA'. implication: one sentence on what this structural global shift means for this brand's strategic window — is the window opening or closing, and how fast?",
  "topActions": [
    {"action": "specific action", "impact": 0, "speed": 0, "confidence": "H|M|L"}
  ]
}
<<<END_DATA_BLOCK>>>

## AFTER THE DATA BLOCK — WRITE THE BOLD STATEMENT ONLY

After the DATA_BLOCK, write exactly this and nothing else:

**BOLD STATEMENT:**
[Your one sentence here]

Do not write prose analysis. Do not write section headers. Do not write a summary. The DATA_BLOCK is the brief. The Bold Statement is the closing line. That is the complete output of this agent.
`;


const MOCK = {
  market: `## MARKET POSITION & CATEGORY DYNAMICS

**HOME MARKET:** India  
**CATEGORY:** Nutrition Bars (Protein/Energy Bars)  
**STAGE:** Growth Stage (D2C scaling → Omnichannel expansion)

## MARKET SIZE & SHARE

**Category TAM:** ₹950 Cr (FY24), growing at 28% CAGR  
**YoY Growth:** Category up 31% (FY23 to FY24)  
**[COMPANY] Position:** Estimated ₹125 Cr revenue (FY24), ~13% market share, Rank #3  
**#1 Player:** RiteBite (~18% share, ₹170 Cr)  
**#2 Player:** Whole Truth (~15% share, ₹140 Cr)  
**#3 Player:** [COMPANY] (~13% share, ₹125 Cr)

**Key Sub-segment:** Premium bars (₹45-65 price point) = ₹420 Cr, growing 42% YoY. This is where [COMPANY] competes.

## COMPETITIVE LANDSCAPE INSIGHTS

**Seven funded players entered in last 18 months** → Category validation by institutional capital BUT low barriers suggest commoditization risk ahead.

**Fragment pattern:** No player >18% share indicates open competitive landscape. Window for category leadership: 12-18 months before customer preferences solidify.

**Distribution determines winners:** Correlation analysis shows revenue scales 1:1 with MT store count. [COMPANY]'s 150 MT stores vs Whole Truth's 500 target = growth constraint.

## STRATEGIC INSIGHT: ITC TIMING ADVANTAGE

**Market timing signal:** Category at inflection point—D2C saturation evident (Whole Truth Amazon review velocity -38% YoY) forcing offline expansion.

**ITC's 4M outlet reach unlocks ₹270 Cr path:**  
- Current: 150 MT stores = ₹125 Cr  
- ITC-enabled: 500 MT + 2,000 GT = ₹270 Cr (18 months vs 48 months independently)

**Competitive moat window:** First to 2,500 stores likely captures 20-25% category share (anchor brand status). Current trajectory puts [COMPANY] 24-36 months behind Whole Truth. ITC compresses this to 12 months.`,

  portfolio: `## PORTFOLIO STRATEGY & SKU RATIONALIZATION

**Current Portfolio:** 12 SKUs across 3 price tiers  
**Revenue Concentration:** Top 3 SKUs = 67% of revenue (hero SKU problem)  
**Channel-SKU Mismatch:** E-comm optimized (multi-packs) vs MT needs (singles)

## SKU-LEVEL ECONOMICS

**Stars (Invest):**  
- Peanut Butter Protein Bar (₹50): 42% of revenue, 38% gross margin, Amazon #1 rank  
- Chocolate Brownie (₹50): 25% of revenue, 35% margin, growing 78% YoY

**Cash Cows (Maintain):**  
- Vanilla Almond (₹50): 15% of revenue, 34% margin, stable D2C repeat

**Question Marks (Test):**  
- Premium Superfood range (₹65): 8% of revenue, 41% margin, MT potential unclear

**Dogs (Kill):**  
- Value bars (₹35): 10% of revenue, 22% margin, unprofitable vs competition

## COMPETITIVE PORTFOLIO BENCHMARKING

**Whole Truth:** Focused (8 SKUs), 70% from top 3 → Clean portfolio discipline  
**True Elements:** Sprawling (25 SKUs), diluted brand → Cautionary tale  
**RiteBite:** Tiered (budget/mid/premium) → Market coverage but complex

**[COMPANY] positioning:** Currently "focused premium" but missing mass-accessible tier for MT expansion.

## RECOMMENDATIONS

**KILL (3 SKUs):** Value bars ₹35 range → Free ₹2.8 Cr inventory, eliminate 22% margin drag  

**INVEST (2 SKUs):** Top 2 stars → ₹8 Cr incremental marketing = ₹25 Cr revenue potential  

**LAUNCH (2 SKUs):** MT-optimized singles (₹40-45) → Bridge premium-accessible gap, target ₹15 Cr Year 1

**ROI:** Portfolio rationalization = 3.2 margin points + ₹40 Cr growth headroom`,

  brand: `## BRAND POSITIONING & STORYTELLING

**Current Stated Positioning:** "Premium nutrition bars with clean, real ingredients for health-conscious millennials"

**Actual Customer Perception (from 200+ reviews):**  
- Top phrase: "Tastes like real food" (87 mentions)  
- Not mentioned: "Clean ingredients" (12 mentions)  
- Gap: Functional benefit (post-workout) mentioned 3x more than lifestyle positioning

## POSITIONING MAP (2×2)

**Axes:** Functional ↔ Emotional × Premium ↔ Accessible

**Competitors:**  
- Whole Truth: Emotional × Premium (authenticity premium)  
- RiteBite: Functional × Accessible (gym recovery)  
- True Elements: Emotional × Accessible (everyday wellness)  
- **[COMPANY]:** Currently Emotional × Premium BUT customer language suggests Functional × Premium opportunity

## CUSTOMER JOBS-TO-BE-DONE

**Primary job:** "Get 20g protein after workout without cooking" (62% of use cases)  
**Secondary job:** "Healthy snack when traveling" (28%)  
**Tertiary:** "Meal replacement when busy" (10%)

**Brand claim mismatch:** Positioning emphasizes lifestyle but customers hire for performance.

## POSITIONING RECOMMENDATION

**Sharpen to:** "The post-workout protein bar that tastes like real food"

**Why:** Aligns with actual usage (gym/fitness), differentiates on taste (vs chalky competitors), maintains premium (performance = premium), enables MT expansion (gyms, sports nutrition retailers).

**Avoid:** Mainstream wellness positioning (True Elements owns this, lower margins)`,

  margins: `## MARGIN IMPROVEMENT & UNIT ECONOMICS

**Current Gross Margin:** 32% (FY24 estimated)  
**Category Benchmark:** Premium D2C 38-42%, Mid-tier 30-34%, Mass 25-28%  
**Gap to Premium Benchmark:** -6 to -10 percentage points

## MARGIN PRESSURE ANALYSIS

**By Channel:**  
- D2C: 54-60% contribution margin (strong)  
- E-comm: 28-40% (Amazon fees + competition)  
- MT: 40-48% (trade terms + sampling)

**Input Cost Inflation:**  
- Nuts/protein: +18% (FY23-FY24)  
- Packaging: +12%  
- Logistics: +15%

**Current COGS Breakdown (estimated):**  
- Ingredients: 42% of revenue  
- Co-packer manufacturing: 18%  
- Packaging: 12%  
- Total COGS: 68% → 32% gross margin

## 5 MARGIN IMPROVEMENT INITIATIVES

**1. ITC Manufacturing Consolidation:** +4.8 pts  
- Reduce co-packer cost from ₹3 to ₹2.30 per bar = ₹0.70 savings  
- On 10M bars = ₹7 Cr annual benefit  
- Payback: <12 months

**2. ITC Procurement Scale:** +2.2 pts  
- 8-10% reduction on ingredient basket via ITC vendor relationships  
- ₹25 Cr ingredient spend × 9% = ₹2.25 Cr savings

**3. Channel Mix Optimization:** +2.5 pts  
- Shift 15% of E-comm volume to D2C (higher margin)  
- Shift 20% to MT (better than Amazon, worse than D2C)  
- Net: +2.5 pts blended margin

**4. SKU Rationalization:** +2.0 pts  
- Kill 22% margin products  
- Portfolio avg lifts from 32% to 34%

**5. Promotional Discipline:** +1.2 pts  
- Reduce trade spend from 12% to 9% of MT revenue  
- Maintain pricing discipline (no deep discounting)

**TOTAL REALISTIC SCENARIO:** +9.3 pts → 32% to 41% gross margin in 24 months  
**Path to Break-even:** FY26 at ₹270 Cr revenue with 37-41% margin = EBITDA positive`,

  growth: `## GROWTH STRATEGY & CHANNEL ORCHESTRATION

**Current Revenue Mix (FY24):**  
- D2C: 45% (₹56 Cr)  
- E-comm: 35% (₹44 Cr)  
- MT: 15% (₹19 Cr)  
- QC: 5% (₹6 Cr)

**Growth Rate by Channel:**  
- D2C: +18% (decelerating, hitting ceiling)  
- E-comm: +22% (competitive, mature)  
- MT: +68% (early stage, accelerating)  
- QC: +95% (fastest, small base)

## CHANNEL-SPECIFIC STRATEGIES

**MT EXPANSION (Highest Opportunity):** ⭐  
**Target:** 500 stores (from 150) = ₹30 Cr incremental  
**ITC Advantage:** Opens stores in 12 months vs 36 independently  
**Economics:** ₹6 lakh/store/year, 40-48% margin  
**Risk:** Velocity <80 bars/month = retailer delisting  
**Mitigation:** 100-store pilot first, scale only if >80/month validated

**GENERAL TRADE (ITC Distribution Asset):**  
**Target:** 2,000 premium kirana via ITC distributors = ₹43 Cr incremental  
**Advantage:** Zero field sales cost (ITC team handles)  
**Strategy:** 3-4 hero SKUs only, avoid complexity

**QUICK COMMERCE (Fast Growth):**  
**Target:** 25-30 cities on Blinkit/Zepto = 3x current = ₹12 Cr incremental  
**Strategy:** Lead with single bars (₹50-60), impulse purchase optimization

**D2C (Retention Focus):**  
**Target:** 30% growth via LTV expansion  
**Strategy:** Subscription (10% of revenue), conversion optimization (3.5% CVR target)

## 24-MONTH ROADMAP

**FY25:** ₹180 Cr (44% growth)  
- MT: 300 stores by Q2, 500 by Q4  
- GT: 200 pilot stores Q3, 1,000 by Q4  
- Investment: ₹26 Cr

**FY26:** ₹270 Cr (50% growth)  
- MT: Optimize 500, GT scale to 2,000  
- Break-even achieved  
- Investment: ₹25 Cr

**Total Synergy Value:** ₹145 Cr incremental revenue via ITC distribution vs independent path`,

  competitive: `## COMPETITIVE BATTLE PLAN

**Tier 1 Threats (Direct Combat):**  
- **Whole Truth:** Same premium positioning, ₹60 price, 70% D2C, expanding MT (500 store target)  
- **True Elements:** Mid-premium, ₹40-45 price, omnichannel (50% MT already)

**Tier 2 Threats (Adjacency):**  
- **RiteBite:** Mass market leader moving up (₹25 → ₹35 new range)  
- **Kellogg's/ITC:** Incumbents could enter premium segment

## HEAD-TO-HEAD: [COMPANY] VS WHOLE TRUTH

**Our Advantages:**  
- Price: ₹50 vs ₹60 (17% cheaper, appeals to 70% of premium buyers)  
- Distribution: ITC enables 3x store reach in 18 months  
- Manufacturing: ITC scale = better economics

**Their Advantages:**  
- Brand heat: 2x Instagram followers, stronger community  
- D2C margins: 60% vs our 54-56%  
- First-mover: 18-month MT head start

**Attack Vector:** "90% of the quality, 83% of the price, 3x the availability"  
Target their price-sensitive customers who value accessibility over ultra-premium positioning.

**Counter-move Expected:** They'll defend premium with community/content, accelerate MT to close distribution gap, or launch ₹45 accessible line.

**Our Response:** Pre-empt with exclusive MT shelf commitments (ITC relationships), maintain ₹50 sweet spot, don't engage in price war.

## HEAD-TO-HEAD: [COMPANY] VS TRUE ELEMENTS

**Where We Compete:** Protein bars (₹50 vs ₹45)

**Our Advantage:** Category focus (specialist beats generalist narrative)

**Their Advantage:** Established omnichannel (50% MT, 30% E-comm, 20% GT)

**Strategy:** Peaceful coexistence—we own protein bars premium, they own breakfast category. Only escalate if they refocus on bars.

## WIN CONDITIONS (24 Months)

**Market Share:** Top 3 by revenue (₹270 Cr = 15-18% estimated share) ✓  
**Distribution Moat:** 2,500 stores (vs competitors <1,000) ✓  
**Profitability:** Break-even FY26 ✓  
**Brand Awareness:** Top 3 aided awareness in premium nutrition ✓`,

  synergy: `## SYNERGY PLAYBOOK

**Strategic Frame:** ITC's institutional strengths (distribution, manufacturing, procurement) unlock growth acceleration that [COMPANY] cannot achieve independently—while preserving the digital-native capabilities that justify the acquisition premium.

## SYNERGY MAPPING (4 Dimensions)

**1. DISTRIBUTION REACH**  
**ITC Strength:** 4M+ outlets, 1,170 dealer partners, relationships with all MT chains  
**[COMPANY] Need:** Currently 150 MT stores, 70% D2C/E-comm dependent (ceiling hit)  

**Synergy Value:**  
- Direct: ₹30-40 Cr (500 MT stores in 12 months vs 36 independently)  
- Cost Avoided: ₹4-5 Cr (eliminate field sales team hiring)  
- Competitive: 18-month head start vs competitors = category anchor position

**2. MANUFACTURING & PROCUREMENT**  
**ITC Strength:** Existing food plants, procurement scale, quality systems  
**[COMPANY] Need:** Co-packer costs ₹2.50-3 per bar, quality variance, 8-10% ingredient premium  

**Synergy Value:**  
- Manufacturing: ₹6 Cr annual (₹0.60 savings × 10M bars)  
- Procurement: ₹2 Cr annual (8% reduction on ₹25 Cr spend)  
- Margin Impact: +4.8 percentage points

**3. BRAND-BUILDING CAPABILITIES**  
**ITC Strength:** Mass media buying power, consumer insights, marketing ROI discipline  
**[COMPANY] Need:** CAC rising ₹800 → ₹1,200, limited Tier-2 awareness  

**Synergy Value:**  
- Media Efficiency: 20-30% better CPMs = ₹3-4 Cr equivalent reach  
- CAC Reduction: ₹1,200 → ₹900 = ₹300 savings per customer

**Trade-off Risk:** Mass positioning could dilute premium brand  
**Mitigation:** Dual-track (maintain D2C digital + selective mass reach)

**4. TALENT & SYSTEMS**  
**ITC Strength:** FMCG operations expertise, structured processes  
**[COMPANY] Need:** Operational maturity for scale (startup → growth stage)  

**Synergy Value:** Avoid costly mistakes (5-10% revenue risk from out-of-stocks, quality issues)

## INTEGRATION MODEL: HYBRID (RECOMMENDED)

**Fully Integrated:**  
- Distribution (MT + GT via ITC network) ✓  
- Manufacturing (in ITC plants) ✓  
- Procurement (through ITC vendors) ✓  
- Back-office (finance, HR, legal) ✓

**Remains Independent:**  
- Brand management (separate team, own identity) ✓  
- Product development (maintain innovation velocity) ✓  
- D2C platform (keep digital capabilities) ✓  
- Digital marketing (preserve performance marketing expertise) ✓

**Synergy Capture:** 70-80% of maximum (₹37-46 Cr annual)  
**Value Preservation:** 70-80% of startup strengths (brand, agility, digital)

## 3-YEAR ROADMAP

**FY25:** Foundation (₹11-13 Cr synergies)  
- Procurement: ₹1.8 Cr (immediate)  
- Manufacturing: ₹1.5 Cr (pilot phase)  
- Distribution: ₹8-10 Cr (first 200 stores)

**FY26:** Scale (₹36-40 Cr synergies)  
- Full manufacturing transfer  
- 500 MT + 1,500 GT stores  
- Break-even achieved

**FY27:** Optimization (₹57-67 Cr synergies)  
- 2,500+ stores, Tier-2 expansion  
- 5-8% EBITDA margin

**CRITICAL SUCCESS FACTOR:** MT velocity must achieve 80-120 bars/store/month. Pilot 100 stores first, scale only if validated.`,

  platform: `## PLATFORM EXPANSION & D2C BRAND INCUBATOR

[COMPANY] has built something ITC's Foods division cannot replicate through training: the lived capability of building a D2C brand from zero. The question is whether ITC activates this as a studio to incubate additional premium brands in categories where its legacy portfolio is a liability.

Global precedents are instructive. Marico acquired Beardo and ran it with near-complete operational autonomy, using Marico's supply chain only when Beardo's volume justified it. The brand remained independent and grew from ₹20 Cr to ₹200 Cr in five years without the "Marico" name appearing anywhere on the product. Unilever did the opposite with Dollar Shave Club — integrated it into the Unilever system — and DSC's growth plateaued within two years of acquisition as the founder energy dissipated into corporate process.

The category recommendation is Functional Wellness — collagen, adaptogens, immunity — where ITC's Life Sciences and Technology Centre provides clinical validation capability that no D2C startup can access independently, where ITC's existing Foods brands have no presence, and where the TAM is estimated at ₹800 Cr growing at 35% annually. Premium Snacking is a conditional second — the Bingo adjacency creates distribution channel conflict risk. Functional Beverages should be deferred due to cold chain complexity.

The structure proposed is a D2C Business Unit within ITC — not a sub-brand, not a division of [COMPANY]'s operations, but a separate entity with its own P&L, its own team (seeded from [COMPANY]'s brand-building talent), and a defined level of autonomy that allows 48-hour spend decisions and direct founder-equivalent authority. ITC contributes R&D access, ingredient sourcing through the Agri Business Division, and manufacturing scale when volume justifies a plant move. The new brand launches with a separate identity that carries no [COMPANY] or ITC branding.

The condition for activation: [COMPANY] reaches ₹500 Cr revenue in FY27, demonstrating that the core business is healthy and the team has bandwidth. Brand 1 must be in market within 18 months of activation decision, with a ₹30 Cr run-rate as the go/no-go signal for Brand 2.`,
  intl: `## INTERNATIONAL BENCHMARKS & GLOBAL PLAYBOOK

Three brands qualify against the six scoring criteria, each offering a different lesson. Grenade UK scores 5/6 and is the most directly relevant: founded in 2010 as a gym-channel D2C brand, Grenade built £50M in revenue before Mondelez acquired it in 2021. The critical moment came when Tesco demanded shelf pricing below Grenade's threshold to protect their private label margin. Grenade refused, accepted a 40% reduction in Tesco shelf space, and rebuilt distribution through Sainsbury's and Boots at full price over 18 months. The brand is now at £75M and growing at 8% — slower than its 40%+ D2C peak, but with margin intact. The lesson is not that MT is dangerous; it is that the first MT buyer conversation is the most important one, and the outcome of that conversation is set by whether the brand has alternatives.

Barebells Sweden scores 5/6 and offers the QC lesson. Before approaching any MT buyer, Barebells built three months of Gorillas and Glovo Quick Commerce data showing repeat purchase rates and basket attachment. That data became the buyer pitch: Barebells did not ask MT buyers to take a risk on an unknown brand, they showed documented consumer demand at full price in the channel adjacent to MT. Orkla acquired Barebells in 2022 with manufacturing support but no brand direction. The brand is now at €80M growing at 25%. The QC data strategy is directly replicable: Blinkit and Zepto provide exportable analytics to brand partners, and that data is [COMPANY]'s strongest MT entry argument.

RXBAR scores 4/6 and provides the acquisition integration cautionary note. Kellogg acquired RXBAR in 2017 for $600M — 4.6x revenue. The founders were contractually retained for three years with brand autonomy. Revenue grew 40% in years one and two. In year three, Kellogg integrated the marketing function into its corporate structure. Growth plateaued. The RXBAR lesson for ITC is specific: the governance document matters more than the acquisition document. The level of autonomy the [COMPANY] team has in 2026 and 2027 will determine whether the brand continues its trajectory or begins to move at the speed of a ₹75,000 Cr conglomerate.

The five transferable lessons across these three brands point to a consistent playbook: hold MT price at all costs and use pack-size reduction rather than price cuts when volume pressure builds; arrive at the first MT buyer conversation with QC velocity data rather than brand deck slides; establish the autonomy framework in writing before it is needed rather than after a conflict arises; enter MT with four hero SKUs maximum and keep the full range exclusive to D2C and QC; and create a QC-specific format at a lower price point that protects MT price architecture rather than discounting the existing range.`,
  synopsis: `## EXECUTIVE SYNOPSIS

**THE SITUATION:** [COMPANY] sits at strategic crossroads in India's nutrition bar category. The ₹950 Cr market is fragmenting (7 funded players in 18 months, no leader >12% share) creating a 12-18 month window for category leadership before customer preferences solidify. ITC's acquisition provides distribution firepower to compress the path to category anchor status (20-25% share, ₹500 Cr revenue threshold) from 4-5 years to 18-24 months.

**THE OPPORTUNITY**

**Revenue Path:** FY24: ₹125 Cr → FY26: ₹270 Cr → FY27: ₹380 Cr (3x in 3 years)

**Margin Expansion:** 32% → 40% gross margin (+8 pts via manufacturing + procurement)

**Value Drivers:**  
1. Distribution leverage: 2,500 stores vs 150 today = ₹73 Cr incremental  
2. Manufacturing synergies: ₹6 Cr annual + 4.8 margin points  
3. Procurement scale: ₹2 Cr annual savings  
4. Category timing: First to scale wins disproportionate share

**KEY INSIGHTS**

**INSIGHT 1: Distribution Velocity, Not Product Innovation, Determines Winners**  
Market analysis shows category commoditization—customer blind taste tests <40% brand identification. Meanwhile, distribution breadth correlates 1:1 with revenue. ITC's 4M outlet reach can place [COMPANY] in 3x more stores than competitors within 18 months, creating a moat far more defensible than formulation.

**INSIGHT 2: MT Velocity (80-120 bars/month) Is Make-or-Break Assumption**  
Entire strategy depends on modern trade velocity validation. If stores sell <60 bars/month, retailers delist and distribution synergy collapses. Mitigation: 100-store pilot mandatory before scaling.

**INSIGHT 3: Hybrid Integration Captures 80% of Synergies, Preserves 80% of Value**  
Full integration maximizes synergies (₹57 Cr) but destroys startup DNA. Light touch preserves culture but leaves ₹40 Cr uncaptured. Hybrid model (leverage ITC for distribution/manufacturing, maintain brand independence) captures ₹37-46 Cr annually while retaining digital-native capabilities worth preserving.

**INSIGHT 4: 18-Month Window Before Category Consolidates**  
Competitive analysis shows Whole Truth hitting D2C ceiling (review velocity -38%), forcing offline expansion. True Elements demonstrating omnichannel viability. First player to 2,500 stores likely captures 20-25% share. Current trajectory puts [COMPANY] 24-36 months behind. ITC compresses this to 12 months.

**THE VERDICT**

**RECOMMENDED STRATEGY:** Pursue hybrid integration model leveraging ITC distribution + manufacturing while preserving [COMPANY]'s brand independence and digital-native capabilities, targeting ₹270 Cr revenue and break-even by FY26.

**WHY:**  
1. Market timing: 12-18 month window for leadership, ITC enables capture  
2. Synergy capture: ₹37-46 Cr annually (80% of maximum) with manageable risk  
3. Risk balance: Maintains premium positioning via channel-SKU segmentation  
4. Execution feasibility: Phased 18-month roadmap with clear gates

**CRITICAL SUCCESS FACTORS**

1. **MT Velocity Validation (HIGHEST PRIORITY):** Target 80-120 bars/month, pilot 100 stores Q1 FY25, go/no-go at day 90  
2. **Quality Through Manufacturing Transition:** Blind taste tests, pilot non-hero SKUs first  
3. **Talent Retention:** Retention bonuses, independence charter, career paths  
4. **Premium Positioning Protection:** Channel-SKU segmentation (never below ₹35)

**IMMEDIATE NEXT STEPS (90 Days)**

1. MT pilot launch (100 stores Mumbai/Delhi/Bangalore)  
2. Manufacturing pilot (2 non-hero SKUs to ITC plant)  
3. Governance setup (independence charter, decision rights)  
4. Procurement transition (onboard to ITC vendor system)  
5. Synergy tracking (weekly velocity dashboard)`,
};

// ─────────────────────────────────────────────────────────────
// buildPDFHtml — generates standalone HTML for Puppeteer PDF
// Called by generatePDF(); all charts rendered via CDN Chart.js
// ─────────────────────────────────────────────────────────────

// ── AGENT VISUAL RENDERERS ──────────────────────────────────────────────
// ── VISUAL RENDERERS ── one per agent ──────────────────────────────────────

// ── VISUAL RENDERERS v2 ── tighter, cleaner, segment-aware ─────────────

const V = {
  forest:'#1a3a2a', terra:'#b85c38', sand:'#e0d8cc', parchment:'#faf7f2',
  ink:'#1a1a1a', inkMid:'#3a3a3a', inkSoft:'#666', inkFaint:'#999',
  green:'#2d7a4f', amber:'#c97d20', blue:'#2563eb', red:'#c0392b',
  greenBg:'#e8f5ee', amberBg:'#fef3e2', blueBg:'#eff6ff', redBg:'#fdf2f2',
};

const sectionLabel = (text) =>
  `<div style="font-family:monospace;font-size:6px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${V.inkFaint};margin-bottom:5px;margin-top:10px;">${text}</div>`;

const verdictBadge = (verdict) => {
  const map = {STRONG:[V.green,V.greenBg],WATCH:[V.amber,V.amberBg],OPTIMISE:[V.blue,V.blueBg],UNDERDELIVERED:[V.red,V.redBg],RISK:[V.red,V.redBg]};
  const [fg,bg] = map[verdict]||['#666','#f0f0f0'];
  return `<span style="display:inline-block;background:${bg};color:${fg};font-family:monospace;font-size:7px;font-weight:700;padding:3px 9px;border-radius:3px;border:1px solid ${fg}30;letter-spacing:.08em;">${verdict}</span>`;
};

const heatCell = (val) => {
  const map = {
    H:[V.green,   '#e8f5ee','HIGH'],
    M:[V.amber,   '#fef3e2','MED'],
    L:['#aaa',    '#f5f5f5','LOW']
  };
  const [fg,bg,label] = map[val]||['#ccc','#fafafa','—'];
  return `<td style="background:${bg};color:${fg};font-size:7px;font-weight:700;text-align:center;padding:5px 6px;border:1px solid ${V.sand};letter-spacing:.04em;">${label}</td>`;
};

// ── CURRENCY HELPERS — set by renderAgentVisuals before any render call ──
let CUR = '₹';
let UNIT = 'Cr';
const fmtMoney = (val) => val != null ? `${CUR}${val}${UNIT}` : 'N/A';

// ── REPAIR JSON — fixes model JSON malformations before JSON.parse ────────
function repairJson(raw) {
  let s = raw
    .replace(/\/\/[^\n\r]*/g, '')        // remove // comments before newline collapse
    .replace(/\r\n|\r|\n/g, ' ')          // literal newlines → space
    .replace(/[\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/g, '') // control chars
    .replace(/,(\s*[}\]])/g, '$1')          // trailing commas
    .replace(/\[\s*\.\.\.\s*\]/g, '[]') // [...] → []
    .replace(/\{\s*\.\.\.\s*\}/g, '{}'); // {...} → {}
  const start = s.indexOf('{');
  if (start === -1) return s;
  let depth = 0, end = -1, inString = false, escape = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) { escape = false; continue; }
    if (c === '\\' && inString) { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end !== -1) s = s.slice(start, end + 1);
  return s;
}

// ── KPI ROW — 4 tiles, compact ────────────────────────────────────────────
function renderKPIs(kpis) {
  if (!kpis || !kpis.length) return '';
  const confDot = c => `<span style="width:5px;height:5px;border-radius:50%;background:${c==='H'?V.green:c==='M'?V.amber:'#bbb'};display:inline-block;margin-left:3px;vertical-align:middle;flex-shrink:0;"></span>`;
  const trendIcon = t => ({up:`<span style="color:${V.green};font-size:9px;margin-left:2px;">↑</span>`,down:`<span style="color:${V.red};font-size:9px;margin-left:2px;">↓</span>`,watch:`<span style="color:${V.amber};font-size:9px;margin-left:2px;">⚠</span>`})[t]||'';
  let h = `<div style="display:grid;grid-template-columns:repeat(${Math.min(kpis.length,4)},1fr);gap:6px;margin-bottom:10px;">`;
  kpis.slice(0,4).forEach(k => {
    h += `<div style="background:#fff;border:1px solid ${V.sand};border-radius:4px;padding:8px 10px;border-left:3px solid ${k.confidence==='H'?V.green:k.confidence==='M'?V.amber:'#ddd'};">`;
    h += `<div style="display:flex;align-items:baseline;gap:2px;flex-wrap:wrap;">`;
    h += `<span style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:800;color:${V.forest};line-height:1.1;letter-spacing:-.01em;">${k.value||'—'}</span>`;
    h += trendIcon(k.trend) + confDot(k.confidence);
    h += `</div>`;
    h += `<div style="font-size:6.5px;font-weight:700;color:${V.inkSoft};margin-top:3px;text-transform:uppercase;letter-spacing:.04em;line-height:1.3;">${k.label||''}</div>`;
    if (k.sub) h += `<div style="font-size:6px;color:${V.inkFaint};margin-top:1px;line-height:1.3;">${k.sub}</div>`;
    h += '</div>';
  });
  h += '</div>';
  return h;
}

// ── VERDICT ROW ───────────────────────────────────────────────────────────
function renderVerdict(verdictRow) {
  if (!verdictRow) return '';
  const v = verdictRow;
  return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:#fff;border:1px solid ${V.sand};border-radius:4px;margin-top:8px;">
    ${verdictBadge(v.verdict)}
    <span style="font-size:7.5px;color:${V.inkMid};line-height:1.4;flex:1;">${v.finding||''}</span>
  </div>`;
}

// ── AGENT 1: MARKET ───────────────────────────────────────────────────────
// Bubble → replaced with horizontal bar rank chart (cleaner, no dead space)
// Channel heatmap → tightened
function renderMarket(db) {
  let h = '';

  // Competitor rank chart — horizontal bars sorted by revenue, growth annotated
  if (db.competitorBubbles && db.competitorBubbles.length) {
    h += sectionLabel('Competitor Snapshot — Revenue (₹Cr) & Growth Rate');
    const sorted = [...db.competitorBubbles].sort((a,b)=>(b.revenueCr||0)-(a.revenueCr||0));
    const maxRev = Math.max(...sorted.map(c=>c.revenueCr||0), 1);
    h += `<div style="display:grid;gap:4px;margin-bottom:8px;">`;
    sorted.forEach(c => {
      const pct = ((c.revenueCr||0)/maxRev)*100;
      const isY = c.highlight;
      const barColor = isY ? V.terra : `${V.forest}70`;
      const labelColor = isY ? V.terra : V.inkMid;
      h += `<div style="display:flex;align-items:center;gap:7px;">`;
      h += `<div style="width:75px;font-size:7.5px;font-weight:${isY?700:500};color:${labelColor};flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.name}</div>`;
      h += `<div style="flex:1;height:18px;background:${V.parchment};border-radius:3px;overflow:hidden;border:1px solid ${V.sand};position:relative;">`;
      h += `<div style="width:${pct}%;height:100%;background:${barColor};border-radius:3px;display:flex;align-items:center;padding:0 6px;">`;
      if (pct > 15) h += `<span style="font-size:7px;font-weight:700;color:#fff;">${fmtMoney(c.revenueCr)}</span>`;
      h += `</div>`;
      if (pct <= 15) h += `<span style="position:absolute;left:${pct+1}%;top:50%;transform:translateY(-50%);font-size:7px;font-weight:700;color:${labelColor};">${fmtMoney(c.revenueCr)}</span>`;
      h += `</div>`;
      h += `<div style="width:52px;flex-shrink:0;text-align:right;font-size:7px;font-weight:700;color:${(c.growthRate||0)>50?V.terra:V.green};">+${c.growthRate||0}% YoY</div>`;
      h += `</div>`;
    });
    h += `</div>`;
    h += `<div style="font-size:6.5px;color:${V.inkFaint};margin-bottom:8px;">Revenue (${CUR}${UNIT}) shown in bars. YoY growth rate shown right. Source: est. FY25.</div>`;
  }

  // Channel heatmap — tighter
  if (db.channelHeatmap && db.channelHeatmap.length) {
    h += sectionLabel('Channel Opportunity Matrix');
    h += `<table style="width:100%;border-collapse:collapse;font-size:7.5px;margin-bottom:6px;">`;
    h += `<thead><tr>
      <th style="background:${V.forest};color:#fff;padding:5px 10px;text-align:left;font-size:6.5px;letter-spacing:.06em;border:1px solid ${V.forest};">Channel</th>
      <th style="background:${V.forest};color:#fff;padding:5px 8px;text-align:center;font-size:6.5px;letter-spacing:.06em;border:1px solid ${V.forest};">Co. Presence</th>
      <th style="background:${V.forest};color:#fff;padding:5px 8px;text-align:center;font-size:6.5px;letter-spacing:.06em;border:1px solid ${V.forest};">Category Growth</th>
      <th style="background:${V.forest};color:#fff;padding:5px 8px;text-align:center;font-size:6.5px;letter-spacing:.06em;border:1px solid ${V.forest};">Competitive Density</th>
    </tr></thead><tbody>`;
    db.channelHeatmap.forEach((row,i) => {
      h += `<tr>
        <td style="padding:5px 10px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};font-weight:600;color:${V.forest};font-size:7.5px;">${row.channel}</td>
        ${heatCell(row.companyPresence||row.brandPresence||0)}${heatCell(row.categoryGrowth)}${heatCell(row.competitiveDensity)}
      </tr>`;
    });
    h += '</tbody></table>';
  }
  return h;
}

// ── AGENT 2: PORTFOLIO ────────────────────────────────────────────────────
function renderPortfolio(db) {
  let h = '';

  // BCG Matrix SVG — tighter, better proportioned
  if (db.skuMatrix && db.skuMatrix.length) {
    h += sectionLabel('Portfolio Matrix — Market Growth vs Competitive Position');
    const W=510, H=160, PL=32, PR=10, PT=12, PB=24;
    const cw=W-PL-PR, ch=H-PT-PB;
    const maxGr=Math.max(...db.skuMatrix.map(s=>s.marketGrowth||1),1);
    const maxPos=Math.max(...db.skuMatrix.map(s=>s.companyPosition||s.brandPosition||1),1);
    const maxRev=Math.max(...db.skuMatrix.map(s=>s.revenueCr||1),1);
    const vColors = {STAR:V.terra,CASHCOW:V.green,QUESTION:V.amber,DOG:'#aaa'};
    let svg = `<svg width="${W}" height="${H}">`;
    // Quadrant fills
    const qf = (x,y,w,h2,col) => `<rect x="${x}" y="${y}" width="${w}" height="${h2}" fill="${col}" rx="0"/>`;
    svg += qf(PL,PT,cw/2,ch/2,`${V.terra}08`);
    svg += qf(PL+cw/2,PT,cw/2,ch/2,`${V.amber}08`);
    svg += qf(PL,PT+ch/2,cw/2,ch/2,`${V.green}08`);
    svg += qf(PL+cw/2,PT+ch/2,cw/2,ch/2,`${V.sand}40`);
    // Grid lines
    svg += `<line x1="${PL+cw/2}" y1="${PT}" x2="${PL+cw/2}" y2="${PT+ch}" stroke="${V.sand}" stroke-width="1" stroke-dasharray="3,2"/>`;
    svg += `<line x1="${PL}" y1="${PT+ch/2}" x2="${PL+cw}" y2="${PT+ch/2}" stroke="${V.sand}" stroke-width="1" stroke-dasharray="3,2"/>`;
    // Quad labels
    [{t:'STARS',x:PL+6,y:PT+10},{t:'QUESTIONS',x:PL+cw/2+6,y:PT+10},{t:'CASH COWS',x:PL+6,y:PT+ch/2+10},{t:'DOGS',x:PL+cw/2+6,y:PT+ch/2+10}]
      .forEach(q=>svg+=`<text x="${q.x}" y="${q.y}" fill="${V.inkFaint}" font-size="5.5" font-family="monospace" opacity=".7">${q.t}</text>`);
    // Axes labels
    svg += `<text x="${PL-5}" y="${PT+ch/2}" fill="${V.inkFaint}" font-size="6" text-anchor="middle" transform="rotate(-90,${PL-5},${PT+ch/2})">Market Growth</text>`;
    svg += `<text x="${PL+cw/2}" y="${H-2}" fill="${V.inkFaint}" font-size="6" text-anchor="middle">Competitive Position →</text>`;
    // Bubbles — numbered circles, legend below
    const nums = ['①','②','③','④','⑤','⑥','⑦','⑧'];
    db.skuMatrix.forEach((s,si) => {
      const x = PL + ((s.companyPosition||s.brandPosition||0)/maxPos)*cw;
      const y = PT+ch - ((s.marketGrowth||0)/maxGr)*ch;
      const r = Math.max(8, 6+((s.revenueCr||0)/maxRev)*14);
      const c = vColors[s.verdict]||V.forest;
      svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}70" stroke="${c}" stroke-width="1.5"/>`;
      svg += `<text x="${x}" y="${y+3}" fill="${V.ink}" font-size="7" text-anchor="middle" font-weight="800">${si+1}</text>`;
    });
    svg += `<line x1="${PL}" y1="${PT}" x2="${PL}" y2="${PT+ch}" stroke="${V.inkFaint}" stroke-width=".8"/>`;
    svg += `<line x1="${PL}" y1="${PT+ch}" x2="${PL+cw}" y2="${PT+ch}" stroke="${V.inkFaint}" stroke-width=".8"/>`;
    svg += '</svg>';
    // HTML legend — 2 columns below chart
    const legendItems = db.skuMatrix.map((s,si) => {
      const c = vColors[s.verdict]||V.forest;
      return `<div style="display:flex;align-items:center;gap:5px;"><span style="width:16px;height:16px;border-radius:50%;background:${c}70;border:1.5px solid ${c};display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#fff;flex-shrink:0;">${si+1}</span><span style="font-size:7px;color:${V.inkMid};">${s.name}</span><span style="font-size:6.5px;font-family:monospace;font-weight:700;color:${c};margin-left:auto;">${s.verdict||''}</span></div>`;
    }).join('');
    h += `<div style="background:#fff;border:1px solid ${V.sand};border-radius:4px;padding:8px 12px;margin-bottom:4px;">${svg}</div>`;
    h += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 16px;padding:6px 12px;background:${V.parchment};border:1px solid ${V.sand};border-radius:4px;margin-bottom:8px;">${legendItems}</div>`;
  }

  // Tier margins — horizontal bar table
  if (db.tierMargins && db.tierMargins.length) {
    h += sectionLabel('Margin & Revenue Share by Price Tier');
    const maxM = Math.max(...db.tierMargins.map(t=>t.grossMarginPct||0),1);
    const verdictColor = {KILL:V.red,KEEP:V.amber,GROW:V.blue,BUILD:V.green};
    h += `<div style="display:grid;gap:4px;margin-bottom:8px;">`;
    db.tierMargins.forEach(t => {
      const pct = ((t.grossMarginPct||0)/maxM)*100;
      const vc = verdictColor[t.verdict]||V.inkFaint;
      h += `<div style="display:flex;align-items:center;gap:7px;">`;
      h += `<div style="width:100px;font-size:7px;font-weight:600;color:${V.inkMid};flex-shrink:0;">${t.tier}</div>`;
      h += `<div style="flex:1;height:16px;background:${V.parchment};border-radius:3px;border:1px solid ${V.sand};overflow:hidden;position:relative;">`;
      h += `<div style="width:${pct}%;height:100%;background:${vc}35;border-right:2px solid ${vc};"></div>`;
      h += `<span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);font-size:6.5px;font-weight:700;color:${vc};">GM: ${t.grossMarginPct}%</span>`;
      h += `</div>`;
      h += `<span style="font-size:6.5px;font-family:monospace;font-weight:700;color:${vc};width:34px;text-align:right;">${t.verdict}</span>`;
      h += `<span style="font-size:6.5px;color:${V.inkFaint};width:32px;">${t.revenueSharePct}% rev</span>`;
      h += `</div>`;
    });
    h += `</div>`;
  }
  return h;
}

// ── AGENT 3: BRAND ───────────────────────────────────────────────────────
function renderBrand(db) {
  let h = '';

  // Positioning map — tighter SVG
  if (db.positioningMap && db.positioningMap.length) {
    h += sectionLabel('Brand Positioning Map');
    const W=510, H=155, cx=W/2, cy=H/2-5;
    let svg = `<svg width="${W}" height="${H}">`;
    // Background quadrants
    [[0,0,'Emotional + Premium'],[cx,0,'Functional + Premium'],[0,cy,'Emotional + Mass'],[cx,cy,'Functional + Mass']].forEach(([x,y,label],i)=>{
      const colors=[`${V.terra}08`,`${V.green}08`,`${V.amber}06`,`${V.sand}30`];
      svg+=`<rect x="${x+1}" y="${y+1}" width="${cx-2}" height="${cy-2}" fill="${colors[i]}"/>`;
      svg+=`<text x="${x+8}" y="${y+14}" fill="${V.inkFaint}" font-size="5.5" font-family="monospace" opacity=".7">${label.toUpperCase()}</text>`;
    });
    // Axis lines
    svg+=`<line x1="${cx}" y1="0" x2="${cx}" y2="${H-20}" stroke="${V.sand}" stroke-width="1"/>`;
    svg+=`<line x1="0" y1="${cy}" x2="${W}" y2="${cy}" stroke="${V.sand}" stroke-width="1"/>`;
    // Axis labels
    svg+=`<text x="${cx}" y="${H-6}" fill="${V.inkFaint}" font-size="6" text-anchor="middle" font-family="monospace">FUNCTIONAL ←→ EMOTIONAL</text>`;
    svg+=`<text x="8" y="${cy+3}" fill="${V.inkFaint}" font-size="6" font-family="monospace">MASS</text>`;
    svg+=`<text x="${W-30}" y="${cy+3}" fill="${V.inkFaint}" font-size="6" font-family="monospace">PREMIUM</text>`;
    // Brands
    db.positioningMap.forEach(b => {
      const px = (b.premium/100)*W;
      const py = (b.functional/100)*(H-20);
      const isY = b.highlight;
      svg+=`<circle cx="${px}" cy="${py}" r="${isY?8:5}" fill="${isY?V.terra:`${V.forest}40`}" stroke="${isY?V.terra:V.forest}" stroke-width="${isY?2:1}"/>`;
      if (isY && b.arrowPremium!==undefined && (b.arrowPremium!==b.premium||b.arrowFunctional!==b.functional)) {
        const tx=(b.arrowPremium/100)*W, ty=(b.arrowFunctional/100)*(H-20);
        svg+=`<line x1="${px}" y1="${py}" x2="${tx}" y2="${ty}" stroke="${V.terra}" stroke-width="1.5" stroke-dasharray="3,2"/>`;
        svg+=`<circle cx="${tx}" cy="${ty}" r="4" fill="none" stroke="${V.terra}" stroke-width="1.5" stroke-dasharray="2,2"/>`;
      }
      const labelY = py+(isY?12:9);
      svg+=`<text x="${px}" y="${labelY}" fill="${isY?V.terra:V.inkSoft}" font-size="${isY?7:6}" text-anchor="middle" font-weight="${isY?700:400}">${b.name}</text>`;
    });
    svg+='</svg>';
    h+=`<div style="background:#fff;border:1px solid ${V.sand};border-radius:4px;padding:8px 12px;margin-bottom:8px;">${svg}</div>`;
  }

  // Perception gap — side-by-side bars
  if (db.perceptionGap && db.perceptionGap.length) {
    h += sectionLabel('Perception Gap — Brand Intent vs Customer Reality');
    h += `<table style="width:100%;border-collapse:collapse;font-size:7px;margin-bottom:8px;">`;
    h += `<thead><tr>
      <th style="background:${V.forest};color:#fff;padding:5px 8px;text-align:left;font-size:6px;letter-spacing:.06em;border:1px solid ${V.forest};width:110px;">Dimension</th>
      <th style="background:${V.forest};color:#fff;padding:5px 8px;text-align:center;font-size:6px;letter-spacing:.06em;border:1px solid ${V.forest};">Brand Says</th>
      <th style="background:${V.forest};color:#fff;padding:5px 8px;text-align:center;font-size:6px;letter-spacing:.06em;border:1px solid ${V.forest};">Customer Hears</th>
      <th style="background:${V.forest};color:#fff;padding:5px 8px;text-align:center;font-size:6px;letter-spacing:.06em;border:1px solid ${V.forest};width:40px;">Gap</th>
    </tr></thead><tbody>`;
    db.perceptionGap.forEach((p,i)=>{
      const gap = (p.brandSaysPct||0)-(p.customerHearsPct||0);
      const gapColor = Math.abs(gap)>20?V.red:Math.abs(gap)>10?V.amber:V.green;
      h+=`<tr>
        <td style="padding:5px 8px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};font-weight:600;color:${V.inkMid};">${p.dimension}</td>
        <td style="padding:5px 8px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};text-align:center;">
          <div style="display:flex;align-items:center;gap:4px;justify-content:center;">
            <div style="width:${p.brandSaysPct||0}%;max-width:80px;height:8px;background:${V.forest}70;border-radius:2px;min-width:2px;"></div>
            <span style="font-weight:700;color:${V.forest}">${p.brandSaysPct}%</span>
          </div>
        </td>
        <td style="padding:5px 8px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};text-align:center;">
          <div style="display:flex;align-items:center;gap:4px;justify-content:center;">
            <div style="width:${p.customerHearsPct||0}%;max-width:80px;height:8px;background:${V.terra}70;border-radius:2px;min-width:2px;"></div>
            <span style="font-weight:700;color:${V.terra}">${p.customerHearsPct}%</span>
          </div>
        </td>
        <td style="padding:5px 8px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};text-align:center;font-weight:700;color:${gapColor};font-size:7.5px;">${gap>0?'+':''}${gap}</td>
      </tr>`;
    });
    h+=`</tbody></table>`;
  }

  // ITC dial — compact arc
  if (db.itcAssociationDial && db.itcAssociationDial !== null && db.itcAssociationDial.acquirerName && db.itcAssociationDial.acquirerName !== "[ACQUIRER]" && db.itcAssociationDial.acquirerName !== "the management team") {
    const d = db.itcAssociationDial;
    const cur = d.currentPosition||0, rec = d.recommendedPosition||0;
    const W=300, H=80;
    const toXY=(v,r,ocx=120,ocy=65)=>{const a=((v/100)*180-90)*Math.PI/180;return[ocx+r*Math.sin(a),ocy-r*Math.cos(a)];};
    const ocx=120,ocy=65,R=52;
    const [curX,curY]=toXY(cur,R,ocx,ocy),[recX,recY]=toXY(rec,R,ocx,ocy);
    // Wider canvas: arc left, clean legend right
    const W2=420, H2=125, arcCX=110, arcCY=75, arcR=58;
    const toXY2=(v,r)=>{const a=((v/100)*180-90)*Math.PI/180;return[arcCX+r*Math.sin(a),arcCY-r*Math.cos(a)];};
    const [curX2,curY2]=toXY2(cur,arcR),[recX2,recY2]=toXY2(rec,arcR);
    const a1b=((cur/100)*180-90)*Math.PI/180, a2b=((rec/100)*180-90)*Math.PI/180;
    const [x1b,y1b]=[arcCX+arcR*Math.sin(a1b),arcCY-arcR*Math.cos(a1b)];
    const [x2b,y2b]=[arcCX+arcR*Math.sin(a2b),arcCY-arcR*Math.cos(a2b)];
    const largeb=Math.abs(rec-cur)>50?1:0;
    let svg=`<svg width="${W2}" height="${H2}">`;
    // Track
    svg+=`<path d="M ${arcCX-arcR} ${arcCY} A ${arcR} ${arcR} 0 0 1 ${arcCX+arcR} ${arcCY}" fill="none" stroke="${V.sand}" stroke-width="10" stroke-linecap="round"/>`;
    // Highlighted arc
    svg+=`<path d="M ${x1b} ${y1b} A ${arcR} ${arcR} 0 ${largeb} ${rec>cur?1:0} ${x2b} ${y2b}" fill="none" stroke="${V.terra}70" stroke-width="10" stroke-linecap="round"/>`;
    // Dots
    svg+=`<circle cx="${curX2}" cy="${curY2}" r="6" fill="${V.forest}" stroke="#fff" stroke-width="2"/>`;
    svg+=`<circle cx="${recX2}" cy="${recY2}" r="6" fill="${V.terra}" stroke="#fff" stroke-width="2"/>`;
    // Axis end labels — below arc ends only
    svg+=`<text x="${arcCX-arcR}" y="${arcCY+22}" fill="${V.inkFaint}" font-size="6.5" text-anchor="middle" font-family="monospace">HIDE ACQUIRER</text>`;
    svg+=`<text x="${arcCX+arcR}" y="${arcCY+22}" fill="${V.inkFaint}" font-size="6.5" text-anchor="middle" font-family="monospace">LEAD ACQUIRER</text>`;
    // Clean legend box — right side, no overlap with arc
    const lx=arcCX+arcR+20;
    svg+=`<rect x="${lx}" y="10" width="140" height="75" fill="${V.parchment}" stroke="${V.sand}" stroke-width="1" rx="3"/>`;
    svg+=`<circle cx="${lx+14}" cy="30" r="5" fill="${V.forest}" stroke="#fff" stroke-width="1.5"/>`;
    svg+=`<text x="${lx+24}" y="34" fill="${V.inkMid}" font-size="7.5" font-weight="600">Current position: ${cur}</text>`;
    svg+=`<circle cx="${lx+14}" cy="52" r="5" fill="${V.terra}" stroke="#fff" stroke-width="1.5"/>`;
    svg+=`<text x="${lx+24}" y="56" fill="${V.terra}" font-size="7.5" font-weight="700">Recommended: ${rec}</text>`;
    svg+=`<text x="${lx+14}" y="74" fill="${V.inkFaint}" font-size="6">0=hide · 50=equal · 100=lead</text>`;
    svg+='</svg>';
    h+=sectionLabel((db.itcAssociationDial&&db.itcAssociationDial.acquirerName?db.itcAssociationDial.acquirerName:'Acquirer')+' Association Strategy — Integration Dial');
    const noteText = d.note ? `<div style="font-size:6.5px;color:${V.inkFaint};margin-top:4px;">${d.note}</div>` : '';
    h+=`<div style="background:#fff;border:1px solid ${V.sand};border-radius:4px;padding:8px 12px;margin-bottom:8px;">${svg}${noteText}</div>`;
  }
  return h;
}

// ── AGENT 4: MARGINS ─────────────────────────────────────────────────────
function renderMargins(db) {
  let h = '';

  // Margin waterfall — tighter
  if (db.marginWaterfall && db.marginWaterfall.length) {
    h += sectionLabel('Margin Waterfall — % of Revenue');
    const bars = db.marginWaterfall.filter(b=>b.valuePct!==0||b.type==='total'||b.type==='subtotal');
    const W=510, H=120, PL=72, PR=10, PT=8, PB=22;
    const bw = Math.max(16, Math.floor((W-PL-PR)/bars.length)-3);
    const maxH2 = H-PT-PB;
    let svg = `<svg width="${W}" height="${H}">`;
    let running = 100;
    bars.forEach((bar,i)=>{
      const x = PL + i*((W-PL-PR)/bars.length) + 2;
      const val = bar.valuePct||0;
      const isTotal = bar.type==='total'||bar.type==='subtotal';
      if(isTotal){
        const bh=(Math.abs(running)/100)*maxH2;
        const y=PT+maxH2-bh;
        svg+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${bar.type==='total'?V.forest:`${V.forest}60`}" rx="2"/>`;
        svg+=`<text x="${x+bw/2}" y="${y-3}" fill="${V.forest}" font-size="6.5" text-anchor="middle" font-weight="700">${running}%</text>`;
      } else {
        const drop=Math.abs(val);
        const bh=(drop/100)*maxH2;
        const y=PT+maxH2-(running/100)*maxH2;
        svg+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${V.terra}80" rx="2"/>`;
        svg+=`<text x="${x+bw/2}" y="${y+bh+8}" fill="${V.terra}" font-size="6" text-anchor="middle">${val}%</text>`;
        running+=val;
      }
      const short=bar.label.length>9?bar.label.slice(0,8)+'…':bar.label;
      svg+=`<text x="${x+bw/2}" y="${H-PB+11}" fill="${V.inkSoft}" font-size="5.5" text-anchor="middle" transform="rotate(-30,${x+bw/2},${H-PB+11})">${short}</text>`;
    });
    svg+=`<line x1="${PL}" y1="${H-PB}" x2="${W-PR}" y2="${H-PB}" stroke="${V.sand}" stroke-width="1"/>`;
    svg+='</svg>';
    h+=`<div style="background:#fff;border:1px solid ${V.sand};border-radius:4px;padding:8px 12px;margin-bottom:8px;">${svg}</div>`;
  }

  // Channel margins — paired bars
  if (db.channelMargins && db.channelMargins.length) {
    h += sectionLabel('Margin by Channel');
    const maxM=Math.max(...db.channelMargins.map(c=>Math.max(c.grossMarginPct||0,c.contributionMarginPct||0)),1);
    h+=`<div style="display:grid;gap:4px;margin-bottom:8px;">`;
    db.channelMargins.forEach(c=>{
      const gp=((c.grossMarginPct||0)/maxM)*100, cp=((c.contributionMarginPct||0)/maxM)*100;
      h+=`<div style="display:flex;align-items:center;gap:7px;">`;
      h+=`<div style="width:80px;font-size:7px;font-weight:600;color:${V.inkMid};flex-shrink:0;">${c.channel}</div>`;
      h+=`<div style="flex:1;display:flex;flex-direction:column;gap:2px;">`;
      h+=`<div style="display:flex;align-items:center;gap:3px;"><div style="width:${gp}%;height:7px;background:${V.forest};border-radius:2px;min-width:2px;"></div><span style="font-size:6.5px;color:${V.forest};font-weight:700;">${c.grossMarginPct}%</span></div>`;
      h+=`<div style="display:flex;align-items:center;gap:3px;"><div style="width:${cp}%;height:5px;background:${V.terra}80;border-radius:2px;min-width:2px;"></div><span style="font-size:6px;color:${V.terra};">${c.contributionMarginPct}%</span></div>`;
      h+=`</div></div>`;
    });
    h+=`</div>`;
    h+=`<div style="display:flex;gap:12px;margin-bottom:6px;">
      <span style="font-size:6px;color:${V.inkFaint};"><span style="display:inline-block;width:10px;height:5px;background:${V.forest};border-radius:1px;vertical-align:middle;margin-right:3px;"></span>Gross Margin</span>
      <span style="font-size:6px;color:${V.inkFaint};"><span style="display:inline-block;width:10px;height:5px;background:${V.terra}80;border-radius:1px;vertical-align:middle;margin-right:3px;"></span>Contribution Margin</span>
    </div>`;
  }

  // Margin levers
  if (db.marginLevers && db.marginLevers.length) {
    h += sectionLabel('Top Margin Improvement Levers');
    const maxImp=Math.max(...db.marginLevers.map(l=>l.impactPoints||0),1);
    h+=`<div style="display:grid;gap:3px;margin-bottom:8px;">`;
    db.marginLevers.forEach(l=>{
      const w=((l.impactPoints||0)/maxImp)*100;
      h+=`<div style="display:flex;align-items:center;gap:7px;">`;
      h+=`<div style="width:120px;font-size:6.5px;color:${V.inkMid};flex-shrink:0;line-height:1.3;">${l.lever}</div>`;
      h+=`<div style="flex:1;height:14px;background:${V.parchment};border-radius:2px;border:1px solid ${V.sand};overflow:hidden;position:relative;">`;
      h+=`<div style="position:absolute;left:0;top:0;height:100%;width:${w}%;background:${V.green}50;border-right:2px solid ${V.green};"></div>`;
      h+=`<span style="position:absolute;left:5px;top:50%;transform:translateY(-50%);font-size:6px;font-weight:700;color:${V.green};">+${l.impactPoints}pp</span>`;
      h+=`</div>`;
      h+=`<span style="font-size:6px;color:${V.inkFaint};white-space:nowrap;width:55px;text-align:right;">${fmtMoney(l.investmentCr)} · ${l.paybackMonths}mo</span>`;
      h+=`</div>`;
    });
    h+=`</div>`;
  }
  return h;
}

// ── AGENT 5: GROWTH ───────────────────────────────────────────────────────
function renderGrowth(db) {
  let h = '';

  // Revenue bridge — tighter
  if (db.revenueBridge && db.revenueBridge.length) {
    h += sectionLabel('Revenue Bridge — FY25 to FY26 Target (₹ Cr)');
    const bars=db.revenueBridge;
    const W=510, H=130, PL=16, PR=10, PT=18, PB=22;
    const bw=Math.max(18,Math.floor((W-PL-PR)/bars.length)-3);
    const maxVal=Math.max(...bars.map(b=>Math.abs(b.valueCr||0)),1);
    const scaleH=v=>(Math.abs(v)/maxVal)*(H-PT-PB);
    let svg=`<svg width="${W}" height="${H}">`;
    let cursor=0;
    bars.forEach((bar,i)=>{
      const x=PL+i*((W-PL-PR)/bars.length)+1;
      const val=bar.valueCr||0;
      if(bar.type==='start'||bar.type==='end'){
        const bh=scaleH(val);
        const y=PT+(H-PT-PB)-bh;
        svg+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${bar.type==='end'?V.forest:`${V.forest}55`}" rx="2"/>`;
        svg+=`<text x="${x+bw/2}" y="${y-3}" fill="${V.forest}" font-size="7" text-anchor="middle" font-weight="700">${CUR}${val}</text>`;
        cursor=val;
      } else if(bar.type==='up'){
        const bh=scaleH(val);
        const y=PT+(H-PT-PB)-scaleH(cursor+val);
        svg+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${V.terra}85" rx="2"/>`;
        svg+=`<text x="${x+bw/2}" y="${y-3}" fill="${V.terra}" font-size="6.5" text-anchor="middle" font-weight="700">+${val}</text>`;
        cursor+=val;
      } else if(bar.type==='down'){
        const bh=scaleH(Math.abs(val));
        const y=PT+(H-PT-PB)-scaleH(cursor);
        svg+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${V.red}80" rx="2"/>`;
        svg+=`<text x="${x+bw/2}" y="${y-3}" fill="${V.red}" font-size="6.5" text-anchor="middle" font-weight="700">${val}</text>`;
        cursor+=val;
      }
      const label=bar.label.replace(/lever \d+ — /i,'').replace(/risk \d+ — /i,'');
      const short=label.length>10?label.slice(0,9)+'…':label;
      svg+=`<text x="${x+bw/2}" y="${H-PB+12}" fill="${V.inkSoft}" font-size="5.5" text-anchor="middle" transform="rotate(-30,${x+bw/2},${H-PB+12})">${short}</text>`;
    });
    svg+=`<line x1="${PL}" y1="${H-PB}" x2="${W-PR}" y2="${H-PB}" stroke="${V.sand}" stroke-width="1"/>`;
    svg+='</svg>';
    h+=`<div style="background:#fff;border:1px solid ${V.sand};border-radius:4px;padding:8px 12px;margin-bottom:8px;">${svg}</div>`;
  }

  // Channel mix — current vs target as stacked horizontal bars (cleaner than donuts)
  if (db.channelMixCurrent && db.channelMixTarget && db.channelMixCurrent.length) {
    h += sectionLabel('Channel Mix — Current vs FY26 Target');
    const colors=[V.forest,V.terra,V.amber,V.blue,'#888'];
    const renderBar=(data,label)=>{
      let bar=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">`;
      bar+=`<div style="width:55px;font-size:7px;font-weight:600;color:${V.inkSoft};flex-shrink:0;">${label}</div>`;
      bar+=`<div style="flex:1;height:20px;border-radius:3px;overflow:hidden;display:flex;">`;
      data.forEach((seg,i)=>{
        if((seg.pct||0)<1)return;
        bar+=`<div style="width:${seg.pct}%;height:100%;background:${colors[i%colors.length]};display:flex;align-items:center;justify-content:center;overflow:hidden;">`;
        if((seg.pct||0)>8)bar+=`<span style="font-size:6.5px;font-weight:700;color:#fff;white-space:nowrap;">${seg.pct}%</span>`;
        bar+=`</div>`;
      });
      bar+=`</div></div>`;
      return bar;
    };
    h+=renderBar(db.channelMixCurrent,'FY25');
    h+=renderBar(db.channelMixTarget,'FY26');
    // Legend
    h+=`<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px;">`;
    db.channelMixCurrent.forEach((c,i)=>h+=`<span style="font-size:6px;color:${V.inkFaint};display:flex;align-items:center;gap:3px;"><span style="width:8px;height:8px;border-radius:1px;background:${colors[i%colors.length]};display:inline-block;"></span>${c.channel}</span>`);
    h+=`</div>`;
  }

  // Milestones timeline
  if (db.milestones && db.milestones.length) {
    h += sectionLabel('Execution Milestones');
    const typeColor={channel:V.forest,product:V.terra,campaign:V.amber,strategic:V.blue};
    h+=`<div style="display:grid;gap:3px;margin-bottom:8px;">`;
    db.milestones.forEach(m=>{
      const tc=typeColor[m.type]||V.inkFaint;
      h+=`<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:#fff;border:1px solid ${V.sand};border-left:3px solid ${tc};border-radius:0 4px 4px 0;">`;
      h+=`<span style="font-family:monospace;font-size:7px;font-weight:700;color:${tc};width:42px;flex-shrink:0;">${m.quarter}</span>`;
      h+=`<span style="font-size:7.5px;color:${V.inkMid};">${m.milestone}</span>`;
      h+=`</div>`;
    });
    h+=`</div>`;
  }
  return h;
}

// ── AGENT 6: COMPETITIVE ─────────────────────────────────────────────────
function renderCompetitive(db) {
  let h = '';

  if (db.threatHeatmap && db.threatHeatmap.length) {
    h += sectionLabel('Competitive Threat Matrix');
    const dims=['price','channel','product','brand','distribution','growth'];
    const dimLabels=['Price','Channel','Product','Brand','Distrib.','Growth'];
    h+=`<table style="width:100%;border-collapse:collapse;font-size:7.5px;margin-bottom:6px;">`;
    h+=`<thead><tr><th style="background:${V.forest};color:#fff;padding:5px 10px;text-align:left;font-size:6px;letter-spacing:.08em;border:1px solid ${V.forest};min-width:80px;">Competitor</th>`;
    dimLabels.forEach(d=>h+=`<th style="background:${V.forest};color:#fff;padding:5px 6px;text-align:center;font-size:6px;letter-spacing:.06em;border:1px solid ${V.forest};">${d}</th>`);
    h+=`</tr></thead><tbody>`;
    db.threatHeatmap.forEach((row,i)=>{
      h+=`<tr><td style="padding:5px 10px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};font-weight:600;color:${V.inkMid};font-size:7.5px;">${row.competitor}</td>`;
      dims.forEach(d=>h+=heatCell(row[d]));
      h+=`</tr>`;
    });
    h+=`</tbody></table>`;
    h+=`<div style="display:flex;gap:10px;margin-bottom:8px;">`;
    [[V.green,V.greenBg,'HIGH threat'],[V.amber,V.amberBg,'MEDIUM'],[`#aaa`,'#f5f5f5','LOW']].forEach(([fg,bg,label])=>{
      h+=`<span style="font-size:6px;background:${bg};color:${fg};padding:2px 7px;border-radius:10px;font-weight:700;">${label}</span>`;
    });
    h+=`</div>`;
  }

  if (db.battleCards && db.battleCards.length) {
    h += sectionLabel('Battle Plan');
    const modeStyle={ATTACK:[V.terra,`${V.terra}12`],DEFEND:[V.green,`${V.green}10`],MONITOR:[V.amber,`${V.amber}12`]};
    h+=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;">`;
    db.battleCards.forEach(c=>{
      const[fg,bg]=modeStyle[c.mode]||['#666','#f5f5f5'];
      h+=`<div style="background:${bg};border:1px solid ${fg}40;border-radius:4px;padding:8px 10px;border-top:3px solid ${fg};">`;
      h+=`<div style="font-family:monospace;font-size:6px;font-weight:700;color:${fg};letter-spacing:.12em;margin-bottom:4px;">${c.mode}</div>`;
      h+=`<div style="font-size:7px;font-weight:600;color:${V.inkMid};margin-bottom:3px;">${c.target}</div>`;
      h+=`<div style="font-size:6.5px;color:${V.inkSoft};line-height:1.5;">${c.move}</div>`;
      h+=`<div style="font-size:6px;color:${fg};margin-top:4px;font-family:monospace;">${c.timeline}</div>`;
      h+=`</div>`;
    });
    h+=`</div>`;
  }
  return h;
}

// ── AGENT 7: SYNERGY ─────────────────────────────────────────────────────
function renderSynergy(db) {
  let h = '';

  if (db.synergyMatrix && db.synergyMatrix.length) {
    const synAcqName = db.synergyMatrix && db.synergyMatrix[0] && db.synergyMatrix[0].acquirerName;
    const synLabel = (synAcqName && synAcqName !== 'the management team' && synAcqName !== 'the acquirer' && synAcqName !== '[ACQUIRER]')
      ? synAcqName + ' Asset Activation Scorecard'
      : 'Strategic Leverage Scorecard';
    h += sectionLabel(synLabel);
    const statusColor={activated:V.green,partial:V.amber,untapped:V.inkFaint};
    const statusBg={activated:V.greenBg,partial:V.amberBg,untapped:V.parchment};
    const maxVal=Math.max(...db.synergyMatrix.map(s=>s.valueCr||0),1);
    h+=`<div style="display:grid;gap:3px;margin-bottom:8px;">`;
    db.synergyMatrix.forEach(s=>{
      const sc=statusColor[s.status]||V.inkFaint;
      const sb=statusBg[s.status]||V.parchment;
      const vw=((s.valueCr||0)/maxVal)*100;
      const ew=((s.ease||0)/100)*100;
      h+=`<div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:${sb};border:1px solid ${sc}30;border-radius:3px;border-left:3px solid ${sc};">`;
      h+=`<div style="flex:1;font-size:7px;font-weight:600;color:${V.inkMid};">${s.asset.length>30?s.asset.slice(0,29)+'…':s.asset}</div>`;
      h+=`<div style="width:70px;flex-shrink:0;">`;
      h+=`<div style="display:flex;align-items:center;gap:3px;margin-bottom:1px;"><div style="width:${vw}%;max-width:70px;height:5px;background:${sc};border-radius:2px;min-width:2px;"></div><span style="font-size:6px;color:${sc};font-weight:700;">${fmtMoney(s.valueCr)}</span></div>`;
      h+=`<div style="display:flex;align-items:center;gap:3px;"><div style="width:${ew}%;max-width:70px;height:3px;background:${sc}60;border-radius:2px;min-width:2px;"></div><span style="font-size:5.5px;color:${V.inkFaint};">ease:${s.ease}</span></div>`;
      h+=`</div>`;
      h+=`<span style="font-family:monospace;font-size:6px;font-weight:700;color:${sc};width:52px;text-align:right;flex-shrink:0;">${(s.status||'').toUpperCase()}</span>`;
      h+=`</div>`;
    });
    h+=`</div>`;
  }

  if (db.synergyRoadmap && db.synergyRoadmap.length) {
    h += sectionLabel('Activation Roadmap');
    const maxVal=Math.max(...db.synergyRoadmap.map(r=>r.valueCr||0),1);
    h+=`<div style="display:grid;gap:3px;margin-bottom:8px;">`;
    db.synergyRoadmap.forEach(r=>{
      const w=((r.valueCr||0)/maxVal)*100;
      h+=`<div style="display:flex;align-items:center;gap:7px;">`;
      h+=`<div style="font-family:monospace;font-size:7px;font-weight:700;color:${V.terra};width:44px;flex-shrink:0;">${r.quarter}</div>`;
      h+=`<div style="flex:1;font-size:7px;color:${V.inkMid};">${r.synergy}</div>`;
      h+=`<div style="width:70px;height:12px;background:${V.parchment};border-radius:2px;border:1px solid ${V.sand};flex-shrink:0;overflow:hidden;">`;
      h+=`<div style="width:${w}%;height:100%;background:${V.forest}60;border-right:2px solid ${V.forest};"></div>`;
      h+=`</div>`;
      h+=`<span style="font-size:7px;font-weight:700;color:${V.forest};width:34px;text-align:right;">${fmtMoney(r.valueCr)}</span>`;
      h+=`</div>`;
    });
    h+=`</div>`;
  }
  return h;
}

// ── AGENT 8: PLATFORM ────────────────────────────────────────────────────
function renderPlatform(db) {
  let h = '';

  if (db.opportunityBubbles && db.opportunityBubbles.length) {
    h += sectionLabel('Platform Opportunities — Strategic Fit × Market Growth × TAM');
    const W=510, H=150, PL=28, PR=10, PT=12, PB=22;
    const cw=W-PL-PR, ch=H-PT-PB;
    const maxTam=Math.max(...db.opportunityBubbles.map(o=>o.tamCr||1),1);
    const maxFit=Math.max(...db.opportunityBubbles.map(o=>o.strategicFitScore||o.itcFitScore||1),1);
    const maxGr=Math.max(...db.opportunityBubbles.map(o=>o.marketGrowthPct||1),1);
    const colors=[V.forest,V.terra,V.amber,V.blue,'#888'];
    let svg=`<svg width="${W}" height="${H}">`;
    svg+=`<line x1="${PL}" y1="${PT}" x2="${PL}" y2="${PT+ch}" stroke="${V.sand}" stroke-width="1"/>`;
    svg+=`<line x1="${PL}" y1="${PT+ch}" x2="${PL+cw}" y2="${PT+ch}" stroke="${V.sand}" stroke-width="1"/>`;
    svg+=`<text x="${PL-4}" y="${PT+ch/2}" fill="${V.inkFaint}" font-size="6" text-anchor="middle" transform="rotate(-90,${PL-4},${PT+ch/2})">Mkt Growth %</text>`;
    svg+=`<text x="${PL+cw/2}" y="${H-2}" fill="${V.inkFaint}" font-size="6" text-anchor="middle">Strategic Fit Score</text>`;
    db.opportunityBubbles.forEach((o,i)=>{
      const x=PL+((o.strategicFitScore||o.itcFitScore||0)/maxFit)*cw;
      const y=PT+ch-((o.marketGrowthPct||0)/maxGr)*ch;
      const r=Math.max(8,6+((o.tamCr||0)/maxTam)*18);
      const c=colors[i%colors.length];
      svg+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}50" stroke="${c}" stroke-width="1.5"/>`;
      svg+=`<text x="${x}" y="${y+3}" fill="${V.ink}" font-size="7" text-anchor="middle" font-weight="800">${i+1}</text>`;
    });
    svg+='</svg>';
    const platLegend = db.opportunityBubbles.map((o,i)=>{
      const c=colors[i%colors.length];
      return `<div style="display:flex;align-items:center;gap:5px;"><span style="width:16px;height:16px;border-radius:50%;background:${c}50;border:1.5px solid ${c};display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#fff;flex-shrink:0;">${i+1}</span><span style="font-size:7px;color:${V.inkMid};">${o.name}</span><span style="font-size:6.5px;color:${V.inkFaint};margin-left:auto;">TAM ${fmtMoney(o.tamCr)}</span></div>`;
    }).join('');
    h+=`<div style="background:#fff;border:1px solid ${V.sand};border-radius:4px;padding:8px 12px;margin-bottom:4px;">${svg}</div>`;
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 16px;padding:6px 12px;background:${V.parchment};border:1px solid ${V.sand};border-radius:4px;margin-bottom:8px;">${platLegend}</div>`;
  }

  if (db.buildPartnerAcquire && db.buildPartnerAcquire.length) {
    h += sectionLabel('Strategic Mode — Build vs Partner vs Acquire');
    const modeStyle={build:[V.green,V.greenBg],partner:[V.blue,V.blueBg],acquire:[V.terra,`${V.terra}12`]};
    h+=`<div style="display:grid;gap:4px;margin-bottom:8px;">`;
    db.buildPartnerAcquire.forEach(item=>{
      const mode=(item.recommendation||'').toLowerCase();
      const[fg,bg]=modeStyle[mode]||['#666','#f0f0f0'];
      h+=`<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:${bg};border:1px solid ${fg}30;border-radius:4px;border-left:3px solid ${fg};">`;
      h+=`<span style="font-family:monospace;font-size:6.5px;font-weight:700;color:${fg};text-transform:uppercase;width:50px;flex-shrink:0;">${item.recommendation}</span>`;
      h+=`<span style="font-size:7.5px;font-weight:600;color:${V.inkMid};width:110px;flex-shrink:0;">${item.opportunity}</span>`;
      h+=`<span style="font-size:7px;color:${V.inkSoft};flex:1;">${item.rationale}</span>`;
      h+=`</div>`;
    });
    h+=`</div>`;
  }
  return h;
}

// ── AGENT 9: INTL ────────────────────────────────────────────────────────
function renderIntl(db) {
  let h = '';

  if (db.marketRadar && db.marketRadar.axes && db.marketRadar.markets && db.marketRadar.markets.length) {
    h += sectionLabel('Market Entry Radar — Multi-Dimension Comparison');
    const axes=db.marketRadar.axes, markets=db.marketRadar.markets;
    const N=axes.length, R=58, ocx=85, ocy=72, W=370, H=155;
    const colors=[V.terra,V.forest,V.amber];
    const toXY=(score,axisIdx,maxScore=10)=>{
      const angle=(2*Math.PI*axisIdx/N)-Math.PI/2;
      const r2=(score/maxScore)*R;
      return[ocx+r2*Math.cos(angle),ocy+r2*Math.sin(angle)];
    };
    let svg=`<svg width="${W}" height="${H}">`;
    [0.25,0.5,0.75,1].forEach(scale=>{
      const pts=axes.map((_,i)=>toXY(scale*10,i).join(',')).join(' ');
      svg+=`<polygon points="${pts}" fill="none" stroke="${V.sand}" stroke-width="${scale===1?1:.5}"/>`;
    });
    axes.forEach((ax,i)=>{
      const[x,y]=toXY(10,i);
      svg+=`<line x1="${ocx}" y1="${ocy}" x2="${x}" y2="${y}" stroke="${V.sand}" stroke-width=".8"/>`;
      const[lx,ly]=toXY(11.8,i);
      const short=ax.length>12?ax.slice(0,11)+'…':ax;
      svg+=`<text x="${lx}" y="${ly+2}" fill="${V.inkSoft}" font-size="6" text-anchor="middle">${short}</text>`;
    });
    markets.forEach((m,mi)=>{
      if(!m.scores||!m.scores.length)return;
      const maxScore=Math.max(...m.scores,1);
      const pts=m.scores.map((s,i)=>toXY(Math.min(s,10),i).join(',')).join(' ');
      svg+=`<polygon points="${pts}" fill="${colors[mi%colors.length]}20" stroke="${colors[mi%colors.length]}" stroke-width="1.5"/>`;
    });
    markets.forEach((m,mi)=>{
      svg+=`<rect x="${W-80}" y="${14+mi*16}" width="8" height="8" fill="${colors[mi%colors.length]}40" stroke="${colors[mi%colors.length]}" stroke-width="1.5" rx="1"/>`;
      svg+=`<text x="${W-68}" y="${21+mi*16}" fill="${V.inkMid}" font-size="7">${m.name}</text>`;
    });
    svg+='</svg>';
    h+=`<div style="background:#fff;border:1px solid ${V.sand};border-radius:4px;padding:8px 12px;margin-bottom:8px;display:inline-block;">${svg}</div>`;
  }

  if (db.entryPriority && db.entryPriority.length) {
    h += sectionLabel('Market Entry Priority');
    h+=`<table style="width:100%;border-collapse:collapse;font-size:7.5px;margin-bottom:8px;">`;
    h+=`<thead><tr>`;
    ['#','Market','Entry Mode','Investment','Yr3 Revenue','Readiness'].forEach(col=>
      h+=`<th style="background:${V.forest};color:#fff;padding:5px 8px;text-align:left;font-size:6px;letter-spacing:.06em;border:1px solid ${V.forest};">${col}</th>`
    );
    h+=`</tr></thead><tbody>`;
    db.entryPriority.forEach((row,i)=>{
      const rc={H:V.green,M:V.amber,L:'#aaa'}[row.readiness]||'#aaa';
      h+=`<tr>
        <td style="padding:5px 8px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};font-family:monospace;font-weight:700;color:${V.terra};">${row.rank}</td>
        <td style="padding:5px 8px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};font-weight:600;color:${V.forest};">${row.market}</td>
        <td style="padding:5px 8px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};color:${V.inkMid};">${row.mode}</td>
        <td style="padding:5px 8px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};font-weight:600;">${fmtMoney(row.investmentCr)}</td>
        <td style="padding:5px 8px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};font-weight:600;color:${V.forest};">${fmtMoney(row.year3RevenueCr)}</td>
        <td style="padding:5px 8px;background:${i%2?V.parchment:'#fff'};border:1px solid ${V.sand};"><span style="background:${rc}20;color:${rc};font-family:monospace;font-size:7px;font-weight:700;padding:2px 5px;border-radius:3px;">${row.readiness}</span></td>
      </tr>`;
    });
    h+=`</tbody></table>`;
  }
  return h;
}

// ── SYNOPSIS ──────────────────────────────────────────────────────────────
function renderSynopsis(db) {
  let h = '';

  if (db.agentVerdicts && db.agentVerdicts.length) {
    const vColor=v=>({STRONG:V.green,WATCH:V.amber,OPTIMISE:V.blue,UNDERDELIVERED:V.red,RISK:V.red}[v]||'#666');
    const vBg=v=>({STRONG:V.greenBg,WATCH:V.amberBg,OPTIMISE:V.blueBg,UNDERDELIVERED:V.redBg,RISK:V.redBg}[v]||'#f0f0f0');
    // Wrap heading + grid together so they never split across pages
    h += `<div style="break-inside:avoid;page-break-inside:avoid;">`;
    h += sectionLabel('9-Agent Intelligence Dashboard');
    h+=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:10px;">`;
    db.agentVerdicts.forEach(av=>{
      const vc=vColor(av.verdict),vb=vBg(av.verdict);
      h+=`<div style="background:${vb};border:1px solid ${vc}40;border-radius:4px;padding:8px 10px;border-left:3px solid ${vc};">`;
      h+=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">`;
      h+=`<span style="font-size:7.5px;font-weight:700;color:${V.forest};">${av.agent}</span>`;
      h+=verdictBadge(av.verdict);
      h+=`</div>`;
      h+=`<div style="font-size:6.5px;color:${V.inkMid};line-height:1.4;">${av.oneLiner}</div>`;
      h+=`</div>`;
    });
    h+=`</div>`;
    h += `</div>`; // close break-inside:avoid wrapper
  }

  if (db.topActions && db.topActions.length) {
    h += sectionLabel('Top Priority Actions — by Revenue Impact');
    const maxRev=Math.max(...db.topActions.map(a=>a.revenueCr||0),1);
    h+=`<div style="display:grid;gap:4px;margin-bottom:10px;">`;
    db.topActions.forEach((a,i)=>{
      const w=((a.revenueCr||0)/maxRev)*100;
      h+=`<div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:${i===0?`${V.terra}10`:'#fff'};border:1px solid ${i===0?`${V.terra}40`:V.sand};border-radius:4px;">`;
      h+=`<span style="font-family:monospace;font-size:9px;font-weight:700;color:${V.terra};width:14px;">${a.rank}</span>`;
      h+=`<span style="font-size:7.5px;font-weight:600;color:${V.forest};flex:1;">${a.action}</span>`;
      h+=`<div style="width:70px;height:9px;background:${V.parchment};border-radius:2px;border:1px solid ${V.sand};overflow:hidden;">`;
      h+=`<div style="width:${w}%;height:100%;background:${V.terra}80;"></div>`;
      h+=`</div>`;
      h+=`<span style="font-size:6.5px;font-family:monospace;font-weight:700;color:${V.forest};width:38px;text-align:right;">${fmtMoney(a.revenueCr)}</span>`;
      h+=`<span style="font-size:6px;color:${V.inkFaint};width:26px;">${a.quarter}</span>`;
      h+=`</div>`;
    });
    h+=`</div>`;
  }

  if ((db.risks||[]).length && (db.opportunities||[]).length) {
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">`;
    h+=`<div>${sectionLabel('Key Risks')}`;
    db.risks.forEach(r=>{
      const sev={H:V.red,M:V.amber,L:'#aaa'}[r.severity]||'#aaa';
      h+=`<div style="padding:5px 8px;background:${sev}10;border-left:3px solid ${sev};margin-bottom:4px;border-radius:0 3px 3px 0;">`;
      h+=`<div style="font-size:7px;font-weight:600;color:${V.inkMid};margin-bottom:1px;">${r.risk}</div>`;
      h+=`<div style="font-size:6.5px;color:${V.inkFaint};">${r.mitigation}</div>`;
      h+=`</div>`;
    });
    h+=`</div><div>${sectionLabel('Key Opportunities')}`;
    db.opportunities.forEach(o=>{
      h+=`<div style="padding:5px 8px;background:${V.green}10;border-left:3px solid ${V.green};margin-bottom:4px;border-radius:0 3px 3px 0;">`;
      h+=`<div style="font-size:7px;font-weight:600;color:${V.inkMid};margin-bottom:1px;">${o.opportunity}</div>`;
      h+=`<div style="font-size:7px;font-weight:700;color:${V.green};">${fmtMoney(o.valueCr)} potential</div>`;
      h+=`</div>`;
    });
    h+=`</div></div>`;
  }
  return h;
}

// ── DISPATCHER ───────────────────────────────────────────────────────────
function renderAgentVisuals(agentId, db, market="India") {
  CUR = (market === "US" || market === "Global") ? "$" : "₹";
  UNIT = (market === "US" || market === "Global") ? "M" : "Cr";
  if (!db) return '';
  // Normalise every array field — guards against model returning {} or null
  const arrFields = ['kpis','competitorBubbles','channelHeatmap','categoryShifts','skuMatrix','tierMargins',
    'positioningMap','perceptionGap','marginWaterfall','channelMargins','marginLevers','revenueBridge',
    'channelMixCurrent','channelMixTarget','milestones','threatHeatmap','battleCards','synergyMatrix',
    'synergyRoadmap','opportunityBubbles','buildPartnerAcquire','entryPriority','agentVerdicts',
    'topActions','risks','opportunities'];
  arrFields.forEach(f => { if (!Array.isArray(db[f])) db[f] = []; });
  let h = '';
  try { h += renderKPIs(db.kpis); } catch(e) { console.warn('[render] KPIs:', agentId, e.message); }
  try {
    switch(agentId) {
      case 'market':      h += renderMarket(db); break;
      case 'portfolio':   h += renderPortfolio(db); break;
      case 'brand':       h += renderBrand(db); break;
      case 'margins':     h += renderMargins(db); break;
      case 'growth':      h += renderGrowth(db); break;
      case 'competitive': h += renderCompetitive(db); break;
      case 'synergy':     h += renderSynergy(db); break;
      case 'platform':    h += renderPlatform(db); break;
      case 'intl':        h += renderIntl(db); break;
      case 'synopsis':    h += renderSynopsis(db); break;
    }
  } catch(e) {
    console.warn('[render] visuals crash:', agentId, e.message);
    h += `<div style="padding:8px 12px;background:#fef9c3;border:1px solid #fde68a;border-radius:3px;font-size:8px;color:#92400e;margin-bottom:10px;">Visual renderer error for ${agentId} — see prose below.</div>`;
  }
  try { h += renderVerdict(db.verdictRow); } catch(e) { console.warn('[render] verdict:', agentId, e.message); }
  return h;
}

function buildPDFHtml({ company, acquirer, parentCo="", parentSince="", companyMode="standalone", results, dataBlocks, sources, elapsed, market="India" }) {
  const acq = acquirer && acquirer.trim() ? acquirer.trim() : null;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const mins = Math.floor((elapsed||0) / 60);
  const secs = ((elapsed||0) % 60).toString().padStart(2,'0');
  const elapsedStr = mins > 0 ? `In ${mins} Minutes ${secs} Seconds` : `In ${secs} Seconds`;

  const agentPages = [
    { id: 'market',      num: '01', wave: '1', title: 'Market Position & Category Dynamics' },
    { id: 'portfolio',   num: '02', wave: '1', title: 'Portfolio Strategy & SKU Rationalization' },
    { id: 'brand',       num: '03', wave: '1', title: 'Brand Positioning & Storytelling' },
    { id: 'margins',     num: '04', wave: '1', title: 'Margin Improvement & Unit Economics' },
    { id: 'growth',      num: '05', wave: '1', title: 'Growth Strategy & Channel Orchestration' },
    { id: 'competitive', num: '06', wave: '1', title: 'Competitive Battle Plan' },
    { id: 'synergy',     num: '07', wave: '2', title: `${acq || 'Acquirer'} Synergy & Leverage Playbook` },
    { id: 'platform',    num: '08', wave: '2', title: 'Platform Expansion & D2C Brand Incubator' },
    { id: 'intl',        num: '09', wave: '2', title: 'International Benchmarks & Global Playbook' },
  ];

  const formatProse = (text) => {
    if (!text) return '<p style="color:#999;font-style:italic;">Agent analysis not available.</p>';
    let t = text
      // Confidence badges
      .replace(/\[HIGH CONFIDENCE[^\]]*\]/g, '<span style="background:#e8f5ee;color:#2d7a4f;font-size:7px;font-family:monospace;padding:2px 5px;border-radius:2px;font-weight:600;">● High</span>')
      .replace(/\[MEDIUM CONFIDENCE[^\]]*\]/g, '<span style="background:#fef3e2;color:#c97d20;font-size:7px;font-family:monospace;padding:2px 5px;border-radius:2px;font-weight:600;">● Medium</span>')
      .replace(/\[LOW CONFIDENCE[^\]]*\]/g, '<span style="background:#fde8e8;color:#c0392b;font-size:7px;font-family:monospace;padding:2px 5px;border-radius:2px;font-weight:600;">● Low</span>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // ◉ section markers — turn into bold section headers
      .replace(/^◉\s*(.+)$/gm, '<strong style="font-size:10px;color:#1a3a2a;display:block;margin:14px 0 6px;border-bottom:1px solid #e0d8cc;padding-bottom:4px;">$1</strong>')
      // ## headers
      .replace(/^#{1,3}\s+(.+)$/gm, '<strong style="font-size:10px;color:#1a3a2a;display:block;margin:14px 0 6px;">$1</strong>')
      // Em-dash list items — render as indented blocks
      .replace(/^—\s+(.+)$/gm, '<div style="padding:2px 0 2px 14px;border-left:2px solid #e0d8cc;margin:3px 0;color:#555;">$1</div>')
      // Horizontal rules
      .replace(/^─+$/gm, '<hr style="border:none;border-top:1px solid #e0d8cc;margin:10px 0;"/>')
      .replace(/^━+$/gm, '');

    // Split into paragraphs and wrap each
    const paras = t.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
    return paras.map(p => {
      // Already an HTML block element — don't wrap in <p>
      if (p.startsWith('<strong') || p.startsWith('<div') || p.startsWith('<hr')) return p;
      // "What's Missing" paragraph — style distinctly
      if (p.toLowerCase().startsWith('what this analysis could not confirm') || p.toLowerCase().startsWith('**what this analysis could not confirm')) {
        const cleaned = p.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
        return `<div style="margin:14px 0 4px;padding:10px 14px;background:#faf7f2;border-left:3px solid #c97d20;border-radius:0 3px 3px 0;font-size:9px;line-height:1.65;color:#3d3020;">${cleaned}</div>`;
      }
      // Single newlines within a paragraph become <br>
      return '<p style="margin:0 0 8px 0;">' + p.replace(/\n/g, ' ') + '</p>';
    }).join('\n');
  };

  const header = (tag, rec) => `
    <div style="background:#1a3a2a;height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 50px;">
      <div style="font-family:'Playfair Display',serif;font-size:13px;color:#faf7f2;letter-spacing:.03em;"><em>Advisor</em>Sprint</div>
      <div style="font-family:monospace;font-size:7px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.9);font-weight:700;">${tag}</div>
      <div style="background:#b85c38;color:#fff;font-size:7px;font-weight:700;letter-spacing:.1em;padding:3px 9px;border-radius:9px;">${rec || 'HARSHA BELAVADY'}</div>
    </div>`;

  const footer = (pageNum) => `
    <div style="position:absolute;bottom:0;left:0;right:0;height:24px;border-top:1px solid #e0d8cc;display:flex;align-items:center;justify-content:space-between;padding:0 50px;background:#fff;">
      <span style="font-size:7px;color:#999;font-family:monospace;">AdvisorSprint · Confidential · ${dateStr}</span>
      <span style="font-size:7px;color:#999;font-family:monospace;">${pageNum}</span>
    </div>`;

  const agentPageHtml = agentPages.map((ag, i) => `
    <div style="width:794px;min-height:1122px;position:relative;background:#fff;page-break-after:always;overflow:hidden;">
      ${header(`AGENT ${ag.num} · ${ag.title.toUpperCase()}`)}
      <div style="padding:26px 50px 36px;">
        <div style="font-family:'Playfair Display',serif;font-size:18px;color:#1a3a2a;font-weight:700;margin-bottom:3px;">${ag.title}</div>
        <div style="height:2px;background:linear-gradient(90deg,#1a3a2a 0%,#b85c38 40%,transparent 100%);margin-bottom:14px;"></div>

        ${renderAgentVisuals(ag.id, dataBlocks[ag.id], market)}

        <div style="background:#faf7f2;border:1px solid #e0d8cc;border-radius:5px;padding:14px 16px 48px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <div style="flex:1;height:1px;background:#e0d8cc;"></div>
            <div style="font-family:monospace;font-size:6.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#999;">Analysis & Strategic Implications</div>
            <div style="flex:1;height:1px;background:#e0d8cc;"></div>
          </div>
          <div style="font-size:9px;line-height:1.8;color:#3a3a3a;">
            ${formatProse(results[ag.id])}
          </div>
        </div>
      </div>
      ${footer(i + 3)}
    </div>`).join('');

  const synopsisHtml = `
    <div style="width:794px;min-height:1122px;position:relative;background:#fff;page-break-after:always;overflow:hidden;">
      ${header('EXECUTIVE SYNOPSIS · OPUS 4 SYNTHESIS')}
      <div style="padding:26px 50px 36px;">
        <div style="font-family:'Playfair Display',serif;font-size:18px;color:#1a3a2a;font-weight:700;margin-bottom:3px;">Executive Synopsis</div>
        <div style="height:2px;background:linear-gradient(90deg,#1a3a2a 0%,#b85c38 40%,transparent 100%);margin-bottom:14px;"></div>
        ${renderAgentVisuals('synopsis', dataBlocks['synopsis'], market)}
        <div style="background:#faf7f2;border:1px solid #e0d8cc;border-radius:5px;padding:14px 16px 12px;margin-top:10px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <div style="flex:1;height:1px;background:#e0d8cc;"></div>
            <div style="font-family:monospace;font-size:6.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#999;">Strategic Synthesis</div>
            <div style="flex:1;height:1px;background:#e0d8cc;"></div>
          </div>
          <div style="font-size:9px;line-height:1.85;color:#3a3a3a;">
            ${formatProse(results.synopsis)}
          </div>
        </div>
      </div>
      ${footer(12)}
    </div>`;

  const sourcesHtml = `
    <div style="width:794px;min-height:1122px;position:relative;background:#fff;page-break-after:always;overflow:hidden;">
      ${header('SOURCES & RESEARCH METHODOLOGY')}
      <div style="padding:26px 50px 36px;">
        <div style="font-family:monospace;font-size:7px;letter-spacing:.18em;text-transform:uppercase;color:#b85c38;margin-bottom:4px;">Research Transparency</div>
        <div style="font-family:'Playfair Display',serif;font-size:18px;color:#1a3a2a;font-weight:700;margin-bottom:3px;">Sources & Confidence Methodology</div>
        <div style="height:2px;background:linear-gradient(90deg,#1a3a2a 0%,#b85c38 40%,transparent 100%);margin-bottom:18px;"></div>
        <div style="display:grid;grid-template-columns:1fr;gap:16px;">
          <div>
            <div style="font-size:9px;font-weight:700;color:#1a3a2a;margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em;">Confidence Framework</div>
            <div style="padding:12px;background:#faf7f2;border-radius:5px;border:1px solid #e0d8cc;margin-bottom:10px;">
              <div style="display:flex;gap:7px;margin-bottom:8px;"><span style="background:#e8f5ee;color:#2d7a4f;font-size:7px;font-family:monospace;padding:2px 5px;border-radius:3px;font-weight:600;flex-shrink:0;">● HIGH</span><div style="font-size:7.5px;color:#3a3a3a;">Directly cited from a named, datable source — filing, industry report, verified press</div></div>
              <div style="display:flex;gap:7px;margin-bottom:8px;"><span style="background:#fef3e2;color:#c97d20;font-size:7px;font-family:monospace;padding:2px 5px;border-radius:3px;font-weight:600;flex-shrink:0;">● MED</span><div style="font-size:7.5px;color:#3a3a3a;">Triangulated from 2+ indirect signals — funding rounds, hiring patterns, e-commerce rankings</div></div>
              <div style="display:flex;gap:7px;"><span style="background:#f0f0f0;color:#888;font-size:7px;font-family:monospace;padding:2px 5px;border-radius:3px;font-weight:600;flex-shrink:0;">● LOW</span><div style="font-size:7.5px;color:#3a3a3a;">Single unverified signal or logical extrapolation. Directional only — do not use for financial decisions.</div></div>
            </div>
            <div style="font-size:7.5px;color:#666;line-height:1.7;padding:10px;background:#fff8f5;border-left:3px solid #b85c38;border-radius:0 4px 4px 0;">
              <strong style="color:#b85c38;">Note:</strong> ${company} is a private company. Revenue figures sourced from verified press. All margins, channel splits, and unit economics are estimated from industry benchmarks with explicit confidence labels.
            </div>
          </div>
          <div>
            <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px;">
              <div style="font-size:9px;font-weight:700;color:#1a3a2a;text-transform:uppercase;letter-spacing:.06em;">Sources Cited</div>
              <div style="font-family:monospace;font-size:7px;color:#b85c38;font-weight:600;">${(sources||[]).length} sources checked</div>
            </div>
            <div style="font-size:7.5px;color:#3a3a3a;line-height:1.4;">
              ${(sources || []).slice(0, 30).map((s, i) =>
                `<div style="display:flex;gap:6px;padding:4px 6px;background:${i%2===0?'#faf7f2':'#fff'};border-left:2px solid ${i%2===0?'#1a3a2a':'#e0d8cc'};">
                  <span style="font-family:monospace;font-size:6.5px;color:#b85c38;font-weight:600;flex-shrink:0;width:14px;">${i+1}</span>
                  <span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${s.title || s.url}</span>
                </div>`
              ).join('') || '<div style="color:#999;font-style:italic;padding:8px;">Sources populated after live run</div>'}
            </div>
          </div>
        </div>
        <div style="margin-top:18px;padding:13px;background:#1a3a2a;border-radius:5px;color:rgba(255,255,255,.7);font-size:7.5px;line-height:1.7;">
          <strong style="color:#fff;">Disclaimer:</strong> Generated by AdvisorSprint's 10-agent AI system using live web search. Strategic thinking tool only — not a substitute for primary research or professional financial advice.
        </div>
      </div>
      ${footer(2)}
    </div>`;


  // Verdict matrix removed — 9-agent dashboard in synopsis provides the same information without a duplicate page

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
@media print{@page{margin:0;size:A4 portrait;}.page{page-break-after:always;}}
em{font-style:italic;}
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:8px;}
thead tr{background:#1a3a2a;color:#fff;}
thead th{padding:7px 10px;text-align:left;font-weight:600;letter-spacing:.04em;border:1px solid #1a3a2a;}
tbody tr:nth-child(even){background:#faf7f2;}
tbody tr:nth-child(odd){background:#fff;}
tbody td{padding:6px 10px;border:1px solid #e0d8cc;color:#3a3a3a;vertical-align:top;}
tbody tr:hover{background:#f0ead8;}
</style>
</head>
<body>

<!-- COVER -->
<div style="width:794px;height:1122px;background:#1a3a2a;position:relative;overflow:hidden;page-break-after:always;">
  <div style="position:absolute;top:0;right:0;width:360px;height:360px;background:linear-gradient(135deg,rgba(184,92,56,.35) 0%,transparent 70%);border-radius:0 0 0 360px;"></div>
  <div style="position:absolute;bottom:-50px;left:-50px;width:280px;height:280px;border:1px solid rgba(255,255,255,.07);border-radius:50%;"></div>
  <div style="position:absolute;inset:0;padding:65px 50px;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="font-family:'Playfair Display',serif;font-size:15px;color:rgba(255,255,255,.9);letter-spacing:.04em;"><em>Advisor</em>Sprint</div>
      <div></div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;margin-bottom:20px;">
    <div style="margin-bottom:40px;">
      <div style="font-family:monospace;font-size:8.5px;letter-spacing:.25em;text-transform:uppercase;color:#d4733f;margin-bottom:14px;">10-Agent Strategic Intelligence Report</div>
      <div style="font-family:'Playfair Display',serif;font-size:52px;color:#fff;font-weight:900;line-height:.92;letter-spacing:-.02em;margin-bottom:12px;">${company}</div>
      <div style="font-size:13px;color:rgba(255,255,255,.55);font-weight:300;letter-spacing:.05em;">${acq ? `Post-acquisition analysis &nbsp;·&nbsp; <strong style="color:rgba(255,255,255,.8);font-weight:500;">${acq}</strong>` : companyMode === 'parent' && parentCo ? `Brand within <strong style="color:rgba(255,255,255,.8);font-weight:500;">${parentCo}</strong>` : 'Standalone strategic analysis · 2026'}</div>
      <div style="margin-top:18px;display:flex;gap:20px;align-items:center;">
        <div style="font-family:monospace;font-size:11px;color:rgba(255,255,255,.65);letter-spacing:.06em;font-weight:600;">Generated ${dateStr}</div>
        <div style="width:1px;height:14px;background:rgba(255,255,255,.2);"></div>
        <div style="font-family:monospace;font-size:10px;color:rgba(255,255,255,.5);letter-spacing:.08em;">${elapsedStr}</div>
      </div>
    </div>
    </div>
    <div style="width:100%;">
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:rgba(255,255,255,.1);border-radius:6px;overflow:hidden;margin-bottom:12px;">
        ${agentPages.map(ag => `
          <div style="background:rgba(255,255,255,${ag.wave==='2'?'.07':'.05'});padding:12px 14px;">
            <div style="font-family:monospace;font-size:6px;color:rgba(${ag.wave==='2'?'184,92,56,.6':'255,255,255,.3'});letter-spacing:.14em;margin-bottom:6px;">AGENT ${ag.num} · WAVE ${ag.wave}</div>
            <div style="font-size:9px;color:rgba(255,255,255,.85);font-weight:600;line-height:1.3;">${ag.title}</div>
          </div>`).join('')}
        <div style="background:rgba(184,92,56,.18);padding:12px 14px;">
          <div style="font-family:monospace;font-size:6px;color:rgba(184,92,56,.8);letter-spacing:.14em;margin-bottom:6px;">AGENT 10 · WAVE 3</div>
          <div style="font-size:9px;color:#fff;font-weight:700;line-height:1.3;">Executive Synopsis</div>
          <div style="font-size:7px;color:rgba(255,255,255,.4);margin-top:3px;">Opus 4.6 · Full synthesis</div>
        </div>
      </div>

    </div>
  </div>
</div>

${sourcesHtml}
${synopsisHtml}
${agentPageHtml}

</body>
</html>`;
}

function makePrompt(id, company, acquirer, ctx, synthCtx, market="India", parentCo="", companyMode="standalone", parentSince="", framingBlock="") {
  let prompt = PROMPTS[id] || "";
  prompt = prompt.replace(/\[COMPANY\]/g, company);

  // ── Three-mode context resolution ──────────────────────────────────────
  const acqName    = companyMode === "acquired" && acquirer && acquirer.trim() ? acquirer.trim() : null;
  const parentName = companyMode === "parent"   && parentCo && parentCo.trim() ? parentCo.trim() : null;
  const ownerName  = acqName || parentName || null;

  // ── Integration age (parent mode only) ──────────────────────────────
  let monthsWithParent = null;
  let tightlyIntegrated = false;
  if (companyMode === "parent" && parentSince && parentSince.trim()) {
    const s = parentSince.trim();
    const sinceDate = new Date(s.length === 4 ? `${s}-01-01` : s);
    if (!isNaN(sinceDate.getTime())) {
      monthsWithParent = Math.floor((new Date() - sinceDate) / (1000 * 60 * 60 * 24 * 30.44));
      tightlyIntegrated = monthsWithParent >= 18;
    }
  }
  const integrationLine = monthsWithParent !== null
    ? tightlyIntegrated
      ? `INTEGRATION STATUS: ${company} has been part of ${parentName} for ~${Math.floor(monthsWithParent/12)} year(s) (${monthsWithParent} months). Treat this as FULLY INTEGRATED — ${parentName}'s distribution, manufacturing, procurement, and systems are already the operating model. Do NOT frame parent assets as future opportunities to unlock. Audit what is working, what is underperforming, and where the relationship constrains rather than enables.`
      : `INTEGRATION STATUS: ${company} has been part of ${parentName} for ~${monthsWithParent} months — still within the integration window. Distinguish what is already operational from what is still being transferred. For in-transition assets, assess whether the timeline is realistic.`
    : "";

  // Token substitutions used inside individual agent prompts
  prompt = prompt.replace(/\[ACQUIRER\]/g,         ownerName || "the management team");
  prompt = prompt.replace(/\[ACQUIRER_OR_OWNER\]/g, ownerName || "the company itself");
  prompt = prompt.replace(/\[HAS_ACQUIRER\]/g,     acqName   ? "yes" : "no");
  prompt = prompt.replace(/\[HAS_PARENT\]/g,       parentName ? "yes" : "no");

  // [ACQUISITION_PREAMBLE] — three-way context block injected at top of every agent prompt
  let acqPreamble;
  if (companyMode === "acquired" && acqName) {
    acqPreamble = `## CONTEXT: POST-ACQUISITION ANALYSIS\nAcquirer: ${acqName}. ${company} was acquired by ${acqName}. Frame every finding in terms of what ${acqName} has provided or can still unlock. There was a distinct acquisition event — integration decisions are still in play.`;
  } else if (companyMode === "parent" && parentName) {
    acqPreamble = `## CONTEXT: BRAND WITHIN PARENT COMPANY\n${company} is a brand owned and operated by ${parentName}. There was NO acquisition event — ${company} was built by or has long been part of ${parentName}. ${parentName} is simultaneously the owner, manufacturer, distributor, and funder. Do NOT frame this as post-acquisition integration. Treat ${parentName}'s infrastructure as already available — the strategic question is what ${company} does with it, where ${company} must differentiate within ${parentName}'s portfolio, and where ${parentName}'s systems constrain rather than enable ${company}'s strategy.${integrationLine ? '\n\n' + integrationLine : ''}`;
  } else {
    acqPreamble = `## CONTEXT: STANDALONE COMPANY ANALYSIS\n${company} is fully independent — NO acquirer, NO parent company. Do NOT mention any acquirer or external owner. Analyse purely on ${company}'s own capital, capabilities, and strategic choices.`;
  }
  prompt = prompt.replace(/\[ACQUISITION_PREAMBLE\]/g, acqPreamble);

  // acquirerBlock — governs agent tone throughout via NARRATIVE_RULES
  let acquirerBlock;
  if (companyMode === "acquired" && acqName) {
    acquirerBlock = `
ACQUISITION CONTEXT:
This is a post-acquisition analysis. ${company} was acquired by ${acqName}. Frame every finding as an opportunity enabled by this acquisition. Do not write about acquisition risks or integration challenges — only advantages and actions.
`;
  } else if (companyMode === "parent" && parentName) {
    acquirerBlock = `
BRAND-WITHIN-PARENT CONTEXT:
${company} is a brand that is part of ${parentName}. This is NOT a post-acquisition analysis — there was no acquisition event. ${parentName}'s infrastructure (manufacturing, distribution, procurement, sales force) is fully available to ${company} and should be treated as the operating reality, not a future synergy to unlock. The strategic questions are: (1) how does ${company} win in its category given that it already has ${parentName}'s scale behind it, (2) where does ${company} need to differentiate itself from ${parentName}'s other brands, and (3) what does ${company} need that ${parentName} cannot or should not provide. Do NOT fabricate integration timelines, synergy capture phases, or acquisition-era org design decisions — that framing does not apply here. Do NOT describe ${parentName}'s assets as "untapped" if they are clearly already part of ${company}'s operating model.${integrationLine ? '\n' + integrationLine : ''}
`;
  } else {
    acquirerBlock = `
COMPANY CONTEXT:
This is a standalone company analysis of ${company} — there is NO acquirer and NO parent company. Do NOT reference any acquirer, parent, or external owner. Analyse ${company} purely on its own merits: its own capital, its own capabilities, its own competitive position, its own strategic choices. Never say "the management team" as a substitute for an acquirer.
`;
  }

  const currencyLabel = market === 'US' ? '$M (USD millions)' : market === 'Global' ? '$M (USD millions)' : '₹ Cr (Indian Rupees Crore)';
  const currencySymbol = market === 'US' || market === 'Global' ? '$' : '₹';
  const currencyUnit = market === 'US' || market === 'Global' ? 'M' : 'Cr';
  const channelTerms = market === 'US'
    ? 'E-commerce / Mass Retail (Walmart, Target, Costco) / Club / Convenience / Foodservice / DTC / Quick Commerce (Instacart, DoorDash)'
    : market === 'Global'
    ? 'E-commerce / Modern Trade / General Trade / DTC / Foodservice / Export'
    : 'Modern Trade / General Trade / Quick Commerce (Blinkit, Zepto, Swiggy Instamart) / D2C / E-commerce / Institutional';

  const NARRATIVE_RULES = acquirerBlock + `VERIFIED FINANCIAL DATA:
If specific revenue or financial figures are provided in the USER CONTEXT below, treat them as ground truth — do not contradict or estimate differently. If no figures are provided, find them through web search.

MARKET & CURRENCY: This analysis is for the ${market} market. Use ${currencyLabel} for ALL revenue figures throughout. Never mix currencies. Channel terminology for this market: ${channelTerms}. Do not reference channels, competitors, or metrics from other markets unless explicitly comparing.

Do NOT mention any individual person's name (e.g. founders, executives) in your analysis. This is a company analysis, not a people analysis.

WRITING STYLE — MANDATORY FOR EVERY AGENT:

You write in dense, precise prose — not bullet points, not numbered lists, not sub-bullets.

Prose means: paragraphs. Each paragraph makes one argument, develops it with evidence, and lands on an implication. Numbers and data points appear inside sentences. "QC revenue is growing at 80% YoY" is not a bullet — it is a clause inside a sentence that explains what it means and what follows from it.

Why no bullets: Bullet points fragment analysis. They hide the logic chain. A reader can scan bullets without understanding anything. Every sentence in this report should give the reader a fact they did not have, explain what it means, or tell them what to do because of it.

Never write bullet lists, numbered lists, or "Key findings:" headers. Write in paragraphs only. HTML tables permitted only for structured comparisons.

CONFIDENCE LABELLING — MANDATORY FOR EVERY NUMBER:

Every number, estimate, or data claim must carry a confidence label inline using this exact format:
- [HIGH CONFIDENCE] — directly from a cited source (web search result, public filing, industry report)
- [MEDIUM CONFIDENCE] — triangulated from 2+ indirect signals or estimated from comparable data
- [LOW CONFIDENCE] — logical inference or single unverified signal; treat as directional only

The label appears in brackets immediately after the number in the same sentence.

Every number needs: [HIGH CONFIDENCE — source], [MEDIUM CONFIDENCE — basis], or [LOW CONFIDENCE — basis] immediately after it. Never state a number without a confidence label.

SHOWING YOUR CALCULATIONS — MANDATORY FOR REVENUE AND MARKET SIZE ESTIMATES:

When you state or derive a revenue figure, market size, growth rate, or financial projection, you must show the calculation inline, in the same sentence or the one immediately following. This is not optional footnoting — it is the sentence itself.

Format: state the figure, then on the next line: "Calculation: [starting point] × [factor] = [result]" or "Source: [name, date]." Direct citations need no calculation.

WEB SEARCH BUDGET — YOU HAVE 2 SEARCHES MAXIMUM:

You have exactly 2 web searches. Use them on the 2 highest-value queries — the ones that will give you the most specific, sourced numbers that cannot be estimated from general knowledge. Prioritise: company-specific revenue or growth data, a named industry report figure, or a specific competitor data point. Do not waste a search on something you can estimate confidently. Make every search count.

LENGTH AND COMPLETION — CRITICAL:

Your analysis must be COMPLETE. Never stop mid-sentence or mid-section. You have ample token budget — use it fully. If you are running long, tighten prose rather than dropping sections. Always finish the final section with a complete sentence. A truncated analysis is a failed analysis. Target 500–650 words of dense prose. Cut repetition before cutting conclusions. For Synopsis: target 900–1100 words — completeness takes priority over brevity.

WHAT'S MISSING — MANDATORY FINAL PARAGRAPH (non-synopsis agents only):

The last paragraph of your prose must be titled "What This Analysis Could Not Confirm" and must do three things: (1) name the single most important data point you searched for but could not find or verify, (2) explain why its absence matters strategically — what decision it affects, (3) state what [COMPANY] should do to get that data. This paragraph should be 3–4 sentences. It is not a disclaimer. It is analysis. The absence of data is often where the most important decisions live. If you found everything you searched for, name the assumption in your analysis that is most likely to be wrong and why.

DATA_BLOCKS FROM PRIOR AGENTS:
When prior agent outputs are provided above, each contains a <<<DATA_BLOCK>>> with structured KPIs, verdicts, and findings. Use these numbers directly in your analysis — they are the ground truth for the figures each agent found. Never contradict a number in a prior DATA_BLOCK without explicitly explaining the discrepancy.

DO NOT REPEAT WHAT OTHER AGENTS COVER:

You are one of 10 specialist agents. Do not write about topics that belong to another agent's mandate:
- Market sizing and category growth → Agent 1 (market)
- SKU mix and portfolio decisions → Agent 2 (portfolio)  
- Brand positioning and consumer → Agent 3 (brand)
- Margins and unit economics → Agent 4 (margins)
- Channel strategy and GTM → Agent 5 (growth)
- Competitor moves → Agent 6 (competitive)
- Strategic leverage, synergies, and partnership → Agent 7 (synergy)
- Platform expansion and adjacency → Agent 9 (platform)
- Global benchmarks and international → Agent 10 (intl)
Stay strictly within your mandate. Cross-reference another agent only when directly relevant, in one sentence.

NEVER SHOW YOUR REASONING PROCESS: Do not write sentences like "I'll conduct targeted searches", "Based on my research I can now", "Let me structure this", or "---" dividers. Begin immediately with analysis content. No preamble, no meta-commentary, no closing remarks.

${acqName ? 'NO NEGATIVES ABOUT THE ACQUISITION: Every finding must be an opportunity, advantage, or action. Frame difficulties as "the priority investment area." The acquisition is unambiguously positive.' : 'BALANCED ANALYSIS: Present findings honestly. Strengths and advantages first, then the 1-2 most important risks or gaps with specific mitigations. Do not catastrophise, but do not hide real challenges — the reader needs actionable truth.'}

PROSE vs VISUAL — CRITICAL DIVISION OF LABOUR:

Your response has two parts: a DATA_BLOCK (charts/numbers) and prose analysis. They must never duplicate each other.

The DATA_BLOCK shows the WHAT — numbers, comparisons, growth rates, rankings. The reader sees those visually before reading prose.

The prose explains the SO WHAT and THEREFORE — the reasoning, implication, non-obvious insight, strategic consequence.

NEVER restate in prose any number already in your DATA_BLOCK. Instead explain: why the gap exists, whether it is widening or narrowing, what it means for the next 18 months, and what the right response is.

The test for every sentence: if it could be replaced by pointing at a chart bar, delete it and write the insight the chart cannot show.

Prose covers what charts cannot: the reasoning chain behind a trend; the structural force explaining the numbers; the specific action with timing; the caveat the chart flattens; the global analog that reframes the data; why this matters now not in 12 months.

DATA_BLOCK — WRITE THIS FIRST, BEFORE YOUR PROSE:

Begin your response with this block. Write the JSON, then write your prose analysis after it.
Why first: if your response is long, the block must not get cut off. Writing it first guarantees it is always present.
Use exact delimiters. No code fences. No backticks around the block.

<<<DATA_BLOCK>>>
{
  "agent": "[market|portfolio|brand|margins|growth|competitive|synergy|platform|intl|synopsis]",
  "kpis": [
    {"label": "short label", "value": "display value", "sub": "context", "trend": "up|down|flat|watch", "confidence": "H|M|L"}
  ],
  "verdictRow": {
    "dimension": "your agent dimension",
    "verdict": "STRONG|WATCH|OPTIMISE|UNDERDELIVERED|RISK",
    "finding": "one sentence — single most important finding",
    "confidence": "H|M|L"
  },
  "topActions": [
    {"action": "specific action", "impact": 0, "speed": 0, "confidence": "H|M|L"}
  ]
}
<<<END_DATA_BLOCK>>>

DATA_BLOCK rules:
— Write it first. Your prose analysis comes after <<<END_DATA_BLOCK>>>.
— Never wrap in a code fence. No backticks.
— Every field required. Use null for unknown values — never omit a field.
— topActions: impact and speed are integers 0–100. Minimum 3 actions.
— kpis: minimum 4 KPIs. Values must match what you will say in prose.
— JSON must be valid. No trailing commas. No comments inside JSON.
— Do not repeat or summarise the DATA_BLOCK in your prose.

KPI QUALITY — DERIVED NOT DESCRIPTIVE:
The KPI tiles are the first thing a reader sees. They must earn attention. Do not show obvious metrics the reader already knows (e.g. "Revenue: ₹200 Cr" if that's in the context brief). Instead, show derived metrics that require calculation or comparison: the gap between [COMPANY]'s growth rate and the category leader expressed as months until parity; the revenue [COMPANY] is leaving on the table in an underpenetrated channel; the margin points separating [COMPANY] from the category benchmark; the number of months before a competitor closes a specific gap. The best KPI tile is one where the reader thinks "I hadn't computed that." Label and sub fields should be specific enough to be unambiguous without reading the prose.

INTERNAL CONSISTENCY — MANDATORY:

If you report individual brand growth rates that differ significantly from a category CAGR, you must explain the discrepancy. Show what segment or cohort the company competes in vs the broader category. Never report two conflicting growth numbers without explaining which segment each belongs to.

`;

  // Prepend COMPANY/ACQUIRER prefix so server.js schema substitution can reliably find them
  const metaPrefix = `COMPANY: ${company}\n` + (acqName ? `ACQUIRER: ${acqName}\n` : '') + `\n`;

  // Framing block — injected for all agents EXCEPT framing itself
  const framingSection = (framingBlock && id !== 'framing')
    ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY & COMPETITIVE FRAMING — READ THIS FIRST, BEFORE ANY ANALYSIS
This framing was established by Agent 0 before your analysis began.
It defines the correct competitive classification for this brand.
You MUST respect these tier classifications throughout your analysis.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${framingBlock}
TIER 1 = benchmark for share/margin/distribution. TIER 2 = occasion threat only, do NOT benchmark revenue or share against these. TIER 3 = watch only.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`
    : '';
  
  if (ctx) {
    prompt = metaPrefix + NARRATIVE_RULES + framingSection + `USER CONTEXT:
${ctx}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

` + prompt;
  } else {
    prompt = metaPrefix + NARRATIVE_RULES + framingSection + prompt;
  }
  
  if (synthCtx && Object.keys(synthCtx).length > 0) {
    const agentNames = {
      market:      'AGENT 1: MARKET POSITION & CATEGORY DYNAMICS',
      portfolio:   'AGENT 2: PORTFOLIO STRATEGY & SKU RATIONALIZATION',
      brand:       'AGENT 3: BRAND POSITIONING & STORYTELLING',
      margins:     'AGENT 4: MARGIN IMPROVEMENT & UNIT ECONOMICS',
      growth:      'AGENT 5: GROWTH STRATEGY & CHANNEL ORCHESTRATION',
      competitive: 'AGENT 6: COMPETITIVE BATTLE PLAN',
      synergy:     'AGENT 7: SYNERGY PLAYBOOK & INSTITUTIONAL LEVERAGE',
      platform:    'AGENT 9: PLATFORM EXPANSION & D2C BRAND INCUBATOR',
      intl:        'AGENT 10: INTERNATIONAL BENCHMARKS & GLOBAL PLAYBOOK',
      synopsis:    'EXECUTIVE SYNOPSIS',
    };
    
    let priorContext = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPRIOR AGENT OUTPUTS (FOR SYNTHESIS)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    Object.entries(synthCtx).forEach(([agentId, result]) => {
      const agentName = agentNames[agentId] || agentId.toUpperCase();
      // Extract DATA_BLOCK JSON — pass in full so downstream agents get structured numbers
      const dbMatch = result.match(/<<<DATA_BLOCK>>>([\s\S]*?)<<<END_DATA_BLOCK>>>/);
      const dataBlockSection = dbMatch ? `<<<DATA_BLOCK>>>${dbMatch[1]}<<<END_DATA_BLOCK>>>` : '';
      // Pass VERDICT_STAMP in full + first 3000 chars of prose
      const stampMatch = result.match(/◉◉ VERDICT_STAMP[\s\S]*?◉◉ END_STAMP/);
      const stampBlock = stampMatch ? stampMatch[0] : '';
      const proseOnly = result.replace(/<<<DATA_BLOCK>>>[\s\S]*?<<<END_DATA_BLOCK>>>/g, '').replace(/◉◉ VERDICT_STAMP[\s\S]*?◉◉ END_STAMP\n?/g, '').trim();
      const proseSlice = proseOnly.slice(0, 3000) + (proseOnly.length > 3000 ? '\n[...truncated...]' : '');
      const trimmed = dataBlockSection + '\n\n' + stampBlock + '\n\n' + proseSlice;
      priorContext += `${agentName}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${trimmed}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    });
    
    prompt = priorContext + prompt;
  }
  
  return prompt;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// buildBriefHtml — CEO Opportunity Brief — standalone 2-page PDF
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function buildBriefHtml({ company, acquirer, parentCo="", companyMode="standalone", results, dataBlocks, market="India" }) {
  const db = dataBlocks['brief'] || {};
  const wasTruncated = db._truncated === true;
  const isUS     = market === 'US' || market === 'Global';
  const CUR_SYM  = isUS ? '$' : '₹';
  const CUR_UNIT = isUS ? 'M' : 'Cr';
  const fmtVal   = (v) => v != null ? `${CUR_SYM}${v} ${CUR_UNIT}` : '—';
  const raw = results['brief'] || '';

  // ── Extract bold statement ───────────────────────────────────────────
  const boldMatch = raw.match(/BOLD STATEMENT[^\n]*\n([^\n]+)/i);
  const boldStatement = boldMatch ? boldMatch[1].trim().replace(/^\*+|\*+$/g,'') : (db.boldStatement || '');

  // p3, categoryRead, sectionHdrs — not arrays, handle separately
  const p3               = db.page3 || {};
  const categoryRead     = db.categoryRead || null;
  const sectionHdrs      = db.sectionHeaders || {};

  // ── Colour system ────────────────────────────────────────────────────
  const C = {
    forest:    '#1a3325',
    amber:     '#c97d20',
    coral:     '#b85c38',
    blue:      '#2563eb',
    parchment: '#f5f0e8',
    lightGrey: '#f0f0f0',
    owned:     '#2d7a4f',
    partial:   '#c97d20',
    absent:    '#e8e0d5',
    absentBorder: '#b85c38',
    high:      '#2d7a4f',
    medium:    '#c97d20',
    low:       '#e8e0d5',
  };

  // ── Contrast-safe text colour ────────────────────────────────────────
  function textOn(bg) {
    const map = {
      [C.forest]: '#fff', [C.amber]: '#fff', [C.coral]: '#fff',
      [C.blue]: '#fff', [C.owned]: '#fff', [C.partial]: '#fff',
      [C.parchment]: C.forest, [C.lightGrey]: '#333',
      [C.absent]: '#666', [C.absentBorder]: '#fff',
    };
    return map[bg] || '#fff';
  }

  // Normalise all brief array fields — guards against model returning {} or null
  const briefArrFields = ['occasionWheel','gapTable','marketSignals','institutionalEdge','radarAxes','moves','arrivalSequence','kpis'];
  briefArrFields.forEach(f => { if (!Array.isArray(db[f])) db[f] = []; });
  // briefArrFields normalisation above ensures db[f] is always an array
  // The safe accessor variables (occasions, gapTable, etc.) were bound before normalisation
  // Re-bind them to the normalised values so renderers always get clean arrays
  const occasions         = db.occasionWheel;
  const gapTable          = db.gapTable;
  const marketSignals     = db.marketSignals;
  const institutionalEdge = db.institutionalEdge;
  const radarAxes         = db.radarAxes;
  const moves             = db.moves;
  const arrivalSequence   = db.arrivalSequence;
  const kpis              = db.kpis;

  // ── Occasion Wheel SVG ───────────────────────────────────────────────
  function renderOccasionWheel(occs) {
    if (!occs.length) return '<div style="height:240px;display:flex;align-items:center;justify-content:center;color:#999;font-size:10px;">No occasion data</div>';

    // Layout: Presence legend removed (already in page header).
    // Growth legend rendered as horizontal strip BELOW the SVG — no right-side legend at all.
    // Wheel is centred in full SVG width so left/right labels have equal room.
    // CX = W/2 = 200 → right labels reach x=200+LABEL_R=314, text extends ~60px → x=374 < W=420 ✓
    // Left labels anchor=end at x=200-LABEL_R=86, text extends left — plenty of room ✓
    const W = 420, H = 265;  // extra 15px for owner tags below spoke labels
    const CX = 200, CY = 125;          // centred — no legend competing on right
    const R_INNER = 32, R_OUTER = 88;
    const LABEL_R = 114;

    const n = occs.length;
    const angleStep = (2 * Math.PI) / n;
    const statusFill   = { owned: C.owned, partial: C.partial, absent: '#e8e0d5' };
    const statusStroke = { owned: '#1a5c35', partial: '#a06010', absent: '#b85c38' };
    const growthOpacity = { high: '1', medium: '0.75', low: '0.5' };

    let svg = `<svg width="${W}" height="${H}" style="overflow:visible;display:block;">`;
    svg += `<defs><radialGradient id="hubGrad2" cx="50%" cy="50%"><stop offset="0%" stop-color="${C.forest}"/><stop offset="100%" stop-color="#0d1f17"/></radialGradient></defs>`;

    // ── Segments ─────────────────────────────────────────────────────
    const segs = occs.map((occ, i) => {
      const startAngle = i * angleStep - Math.PI / 2;
      const endAngle   = (i + 1) * angleStep - Math.PI / 2;
      const fill    = statusFill[occ.status]   || '#e8e0d5';
      const stroke  = statusStroke[occ.status] || '#999';
      const opacity = growthOpacity[occ.growth] || '0.7';
      const large   = angleStep > Math.PI ? 1 : 0;
      const x1i = CX + R_INNER * Math.cos(startAngle), y1i = CY + R_INNER * Math.sin(startAngle);
      const x1o = CX + R_OUTER * Math.cos(startAngle), y1o = CY + R_OUTER * Math.sin(startAngle);
      const x2i = CX + R_INNER * Math.cos(endAngle),   y2i = CY + R_INNER * Math.sin(endAngle);
      const x2o = CX + R_OUTER * Math.cos(endAngle),   y2o = CY + R_OUTER * Math.sin(endAngle);
      const path = `M${x1i},${y1i} L${x1o},${y1o} A${R_OUTER},${R_OUTER} 0 ${large},1 ${x2o},${y2o} L${x2i},${y2i} A${R_INNER},${R_INNER} 0 ${large},0 ${x1i},${y1i} Z`;
      const sizeR = R_INNER + (R_OUTER - R_INNER) * Math.min(1, (occ.sizeCr || 50) / 300);
      const sx1 = CX + R_INNER * Math.cos(startAngle), sy1 = CY + R_INNER * Math.sin(startAngle);
      const sx2 = CX + sizeR   * Math.cos(startAngle), sy2 = CY + sizeR   * Math.sin(startAngle);
      const ex1 = CX + sizeR   * Math.cos(endAngle),   ey1 = CY + sizeR   * Math.sin(endAngle);
      const ex2 = CX + R_INNER * Math.cos(endAngle),   ey2 = CY + R_INNER * Math.sin(endAngle);
      const sizePath = `M${sx1},${sy1} L${sx2},${sy2} A${sizeR},${sizeR} 0 ${large},1 ${ex1},${ey1} L${ex2},${ey2} A${R_INNER},${R_INNER} 0 ${large},0 ${sx1},${sy1} Z`;
      return { path, sizePath, fill, stroke, opacity, occ, startAngle, endAngle };
    });

    segs.forEach(s => {
      svg += `<path d="${s.path}" fill="${s.fill}" fill-opacity="${s.opacity}" stroke="${s.stroke}" stroke-width="1.5"/>`;
      svg += `<path d="${s.sizePath}" fill="${s.fill}" fill-opacity="0.2" stroke="none"/>`;
    });

    // ── Hub ───────────────────────────────────────────────────────────
    svg += `<circle cx="${CX}" cy="${CY}" r="${R_INNER}" fill="url(#hubGrad2)" stroke="${C.forest}" stroke-width="1.5"/>`;
    // Inner circle — show count of owned vs total
    const ownedCount = occasions.filter(o => o.status === 'owned').length;
    const totalCount = occasions.length;
    svg += `<text x="${CX}" y="${CY-4}" text-anchor="middle" font-size="11" font-weight="900" fill="white">${ownedCount}/${totalCount}</text>`;
    svg += `<text x="${CX}" y="${CY+7}" text-anchor="middle" font-size="6" font-weight="700" fill="rgba(255,255,255,0.7)" letter-spacing="0.06em">OWNED</text>`;

    // ── Label angle computation with collision avoidance ──────────────
    // Use segment midpoint angles, then iteratively push apart if too close
    let labelAngles = segs.map(s => (s.startAngle + s.endAngle) / 2);
    const MIN_GAP = 0.40; // radians — ~23 degrees minimum between adjacent labels
    for (let iter = 0; iter < 5; iter++) {
      for (let i = 0; i < labelAngles.length; i++) {
        const next = (i + 1) % labelAngles.length;
        let diff = ((labelAngles[next] - labelAngles[i]) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        if (diff < MIN_GAP) {
          const push = (MIN_GAP - diff) / 2;
          labelAngles[i]    -= push;
          labelAngles[next] += push;
        }
      }
    }

    // ── Labels + spokes ───────────────────────────────────────────────
    segs.forEach((s, i) => {
      const angle = labelAngles[i];
      const lx = CX + LABEL_R * Math.cos(angle);
      const ly = CY + LABEL_R * Math.sin(angle);

      // Spoke: from outer ring edge to just before the dot
      const spokeStartX = CX + (R_OUTER + 3) * Math.cos(angle);
      const spokeStartY = CY + (R_OUTER + 3) * Math.sin(angle);
      const spokeEndX   = CX + (LABEL_R - 8)  * Math.cos(angle);
      const spokeEndY   = CY + (LABEL_R - 8)  * Math.sin(angle);
      svg += `<line x1="${spokeStartX}" y1="${spokeStartY}" x2="${spokeEndX}" y2="${spokeEndY}" stroke="#ccc" stroke-width="0.6"/>`;

      // Determine side — right side: anchor start; left side: anchor end
      const isRight  = Math.cos(angle) >= 0;
      const anchor   = isRight ? 'start' : 'end';
      const dotOffX  = isRight ? -5 : 5;   // dot sits between spoke end and text
      const textOffX = isRight ?  3 : -3;

      // Status dot
      svg += `<circle cx="${lx + dotOffX}" cy="${ly}" r="2.5" fill="${s.fill}" stroke="${s.stroke}" stroke-width="1"/>`;

      // Label text — wrap at natural word boundary, no hard truncation
      const raw   = (s.occ.occasion || '').slice(0, 28);
      const words = raw.split(' ');

      // Wrap only if multi-word AND long enough to benefit
      const isAbsentOcc  = s.occ.status === 'absent';
      const isPartialOcc = s.occ.status === 'partial';
      const isOwnedOcc   = s.occ.status === 'owned';
      const showOwner    = s.occ.owner && s.occ.owner.trim();
      const ownerLabel   = showOwner ? (s.occ.owner.trim().slice(0, 14)) : null;
      // Colour: forest for owned, amber for partial, coral for absent
      const ownerCol     = isOwnedOcc ? C.forest : isPartialOcc ? C.amber : C.coral;

      let ownerY; // set below based on whether label wraps
      if (words.length >= 2 && raw.length > 11) {
        // Find best split point — roughly equal halves by character count
        let bestSplit = 1, bestDiff = Infinity;
        for (let k = 1; k < words.length; k++) {
          const l1 = words.slice(0, k).join(' ').length;
          const l2 = words.slice(k).join(' ').length;
          const diff = Math.abs(l1 - l2);
          if (diff < bestDiff) { bestDiff = diff; bestSplit = k; }
        }
        const line1 = words.slice(0, bestSplit).join(' ');
        const line2 = words.slice(bestSplit).join(' ');
        svg += `<text x="${lx + textOffX}" y="${ly - 3}" text-anchor="${anchor}" font-size="7" font-weight="700" fill="${C.forest}">${line1}</text>`;
        svg += `<text x="${lx + textOffX}" y="${ly + 6}" text-anchor="${anchor}" font-size="7" font-weight="700" fill="${C.forest}">${line2}</text>`;
        ownerY = ly + 17; // below both lines
      } else {
        svg += `<text x="${lx + textOffX}" y="${ly + 3}" text-anchor="${anchor}" font-size="7" font-weight="700" fill="${C.forest}">${raw}</text>`;
        ownerY = ly + 14; // below single line
      }

      // Owner tag — only for absent/partial, below occasion name, never overlaps
      if (ownerLabel) {
        // Pill background so text is legible regardless of what's behind it
        const ow = ownerLabel.length * 4.2 + 8;
        const ox = isRight ? lx + textOffX : lx + textOffX - ow;
        svg += `<rect x="${ox}" y="${ownerY - 7}" width="${ow}" height="8" rx="2" fill="${ownerCol}" fill-opacity="0.15" stroke="${ownerCol}" stroke-width="0.6"/>`;
        svg += `<text x="${lx + textOffX + (isRight ? ow/2 : -ow/2)}" y="${ownerY - 3}" text-anchor="middle" dominant-baseline="central" font-size="5.5" font-weight="700" fill="${ownerCol}">${ownerLabel}</text>`;
      }

      // ₹Cr label — white pill behind text so legible on any segment colour
      if (s.occ.sizeCr > 0 && n <= 12) {
        const midR   = (R_INNER + R_OUTER) / 2;
        const segMid = (s.startAngle + s.endAngle) / 2;
        const sx = CX + midR * Math.cos(segMid);
        const sy = CY + midR * Math.sin(segMid);
        // format value with market currency — ₹Cr for India, $M for US
        const valStr = s.occ.sizeCr >= 1000
          ? CUR_SYM + (Math.round(s.occ.sizeCr / 100) / 10) + 'K ' + CUR_UNIT
          : CUR_SYM + s.occ.sizeCr + ' ' + CUR_UNIT;
        const tw = valStr.length * 4.0 + 6;
        svg += `<rect x="${sx - tw/2}" y="${sy - 7}" width="${tw}" height="9" rx="2" fill="rgba(255,255,255,0.85)"/>`;
        svg += `<text x="${sx}" y="${sy + 1}" text-anchor="middle" font-size="5.5" font-weight="800" fill="${C.forest}">${valStr}</text>`;
      }
    });

    // ── No SVG legend — Presence is in page header, Growth goes below as HTML strip ──

    svg += '</svg>';

    // Presence + Growth legend — single horizontal strip below wheel, no overlap possible
    const legendStrip = `
      <div style="display:flex;align-items:center;gap:12px;padding:4px 8px;margin-top:2px;">
        <span style="font-size:6px;font-weight:800;letter-spacing:.1em;color:#888;text-transform:uppercase;">PRESENCE</span>
        ${[
          {label:'Owned',   fill:C.owned,    stroke:'#1a5c35', op:'1'},
          {label:'Partial', fill:C.partial,  stroke:'#a06010', op:'1'},
          {label:'Absent',  fill:'#e8e0d5',  stroke:C.absentBorder, op:'1'},
        ].map(p =>
          `<span style="display:flex;align-items:center;gap:4px;">
            <span style="width:9px;height:9px;border-radius:2px;background:${p.fill};border:1px solid ${p.stroke};display:inline-block;flex-shrink:0;"></span>
            <span style="font-size:7px;font-weight:600;color:${C.forest};">${p.label}</span>
          </span>`
        ).join('')}
        <span style="width:1px;height:12px;background:#ddd;display:inline-block;margin:0 2px;"></span>
        <span style="font-size:6px;font-weight:800;letter-spacing:.1em;color:#888;text-transform:uppercase;">GROWTH</span>
        ${[{label:'High',op:'1'},{label:'Medium',op:'0.6'},{label:'Low',op:'0.3'}].map(g =>
          `<span style="display:flex;align-items:center;gap:4px;">
            <span style="width:9px;height:9px;border-radius:2px;background:${C.owned};opacity:${g.op};border:1px solid #1a5c35;display:inline-block;flex-shrink:0;"></span>
            <span style="font-size:7px;font-weight:600;color:${C.forest};">${g.label}</span>
          </span>`
        ).join('')}
      </div>`;

    return `<div>${svg}${legendStrip}</div>`;
  }

  // ── Gap Table ────────────────────────────────────────────────────────
  // ── MARKET SIGNALS TABLE ──────────────────────────────────────────────
  function renderMarketSignals(signals) {
    if (!signals.length) return '<div style="padding:12px;color:#999;font-size:8px;">No market signals data</div>';
    const playColour = { SCALE: C.forest, 'D2C': C.blue, 'CATEGORY CREATION': C.coral };
    const playShortM = { SCALE:'SCL', 'D2C':'D2C', 'CATEGORY CREATION':'CAT' };
    let h = `<table style="width:100%;border-collapse:collapse;font-size:7.5px;">
      <thead><tr style="background:${C.forest};color:#fff;">
        <th style="padding:5px 8px;text-align:left;font-size:6.5px;letter-spacing:.06em;width:100px;">PLAYER</th>
        <th style="padding:5px 8px;text-align:left;font-size:6.5px;letter-spacing:.06em;">WHAT THEY'RE DOING</th>
        <th style="padding:5px 8px;text-align:left;font-size:6.5px;letter-spacing:.06em;width:110px;">PROOF</th>
        <th style="padding:5px 8px;text-align:left;font-size:6.5px;letter-spacing:.06em;">IMPLICATION FOR BRAND</th>
        <th style="padding:5px 8px;text-align:center;font-size:6.5px;letter-spacing:.06em;width:40px;">PLAY</th>
      </tr></thead><tbody>`;
    signals.slice(0,5).forEach((s, i) => {
      const bg = i%2===0?'#fff':C.parchment;
      const pc = playColour[s.playType] || C.forest;
      const ps = playShortM[s.playType] || s.playType;
      h += `<tr>
        <td style="padding:5px 8px;background:${bg};border-left:3px solid ${pc};">
          <div style="font-weight:800;color:${C.forest};font-size:8px;">${s.player||''}</div>
          <div style="font-size:6px;color:#888;margin-top:1px;white-space:normal;">${s.occasion||''}</div>
        </td>
        <td style="padding:5px 8px;background:${bg};color:${C.inkMid};font-size:7px;white-space:normal;">${s.action||''}</td>
        <td style="padding:5px 8px;background:${bg};color:${C.forest};font-size:6.5px;font-weight:600;white-space:normal;">${s.proofPoint||''}</td>
        <td style="padding:5px 8px;background:${bg};color:#444;font-size:7px;font-style:italic;white-space:normal;">${s.implicationForBrand||''}</td>
        <td style="padding:5px 8px;background:${bg};text-align:center;"><span style="background:${pc};color:#fff;font-size:6px;font-weight:800;padding:2px 4px;border-radius:2px;">${ps}</span></td>
      </tr>`;
    });
    h += '</tbody></table>';
    return h;
  }

  // ── INSTITUTIONAL EDGE ────────────────────────────────────────────────
  function renderInstitutionalEdge(assets) {
    if (!assets.length) return '';
    const statusCol = { untapped: C.coral, partial: C.amber };
    return `<div style="display:grid;grid-template-columns:repeat(${Math.min(assets.length,3)},1fr);gap:8px;">` +
      assets.slice(0,3).map(a => {
        const sc = statusCol[a.status] || C.amber;
        return `<div style="background:#fff;border:1px solid #e8e0d5;border-radius:3px;padding:8px 10px;border-top:2.5px solid ${sc};">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
            <span style="background:${sc}22;color:${sc};font-size:6px;font-weight:800;padding:1px 5px;border-radius:2px;text-transform:uppercase;">${a.status||''}</span>
          </div>
          <div style="font-size:8px;font-weight:800;color:${C.forest};margin-bottom:3px;white-space:normal;">${a.asset||''}</div>
          <div style="font-size:7px;color:#555;line-height:1.3;margin-bottom:4px;white-space:normal;">${a.whatItUnlocks||''}</div>
          <div style="font-size:6.5px;color:${C.forest};font-weight:600;border-top:1px solid #e8e0d5;padding-top:4px;white-space:normal;">→ ${a.activationPath||''}</div>
        </div>`;
      }).join('') + '</div>';
  }

  // ── ARRIVAL SEQUENCE TABLE ────────────────────────────────────────────
  function renderArrivalSequence(seq) {
    if (!seq.length) return '';
    const mktCol = { KR:'#c0392b', JP:'#b85c38', SEA:'#2563eb', US:'#1a5c35', UK:'#6b21a8', DE:'#374151', AU:'#92400e' };
    const confCol2 = { H: C.forest, M: C.amber, L: '#bbb' };
    let h = `<table style="width:100%;border-collapse:collapse;font-size:7px;">
      <thead><tr style="background:${C.forest};color:#fff;">
        <th style="padding:5px 8px;text-align:center;font-size:6.5px;letter-spacing:.06em;width:35px;">MKT</th>
        <th style="padding:5px 8px;text-align:left;font-size:6.5px;letter-spacing:.06em;width:120px;">FORMAT ARRIVING</th>
        <th style="padding:5px 8px;text-align:center;font-size:6.5px;letter-spacing:.06em;width:65px;">INDIA BY</th>
        <th style="padding:5px 8px;text-align:left;font-size:6.5px;letter-spacing:.06em;">HOW IT ENTERS</th>
        <th style="padding:5px 8px;text-align:left;font-size:6.5px;letter-spacing:.06em;">BRAND MUST DO</th>
        <th style="padding:5px 8px;text-align:center;font-size:6.5px;letter-spacing:.06em;width:35px;">CONF</th>
      </tr></thead><tbody>`;
    seq.slice(0,5).forEach((s, i) => {
      const bg = i%2===0?'#fff':C.parchment;
      const mc = mktCol[s.market] || C.forest;
      const cc = confCol2[s.confidence] || C.amber;
      h += `<tr>
        <td style="padding:5px 8px;background:${bg};text-align:center;"><span style="background:${mc};color:#fff;font-size:6px;font-weight:800;padding:2px 5px;border-radius:2px;">${s.market||'?'}</span></td>
        <td style="padding:5px 8px;background:${bg};font-weight:700;color:${C.forest};white-space:normal;">${s.format||''}</td>
        <td style="padding:5px 8px;background:${bg};text-align:center;font-weight:700;color:${C.coral};font-size:7px;">${s.indiaInflection||'—'}</td>
        <td style="padding:5px 8px;background:${bg};color:${C.inkMid};font-size:6.5px;white-space:normal;">${s.entryMechanism||''}</td>
        <td style="padding:5px 8px;background:${bg};color:${C.forest};font-size:6.5px;font-weight:600;font-style:italic;white-space:normal;">${s.brandResponse||''}</td>
        <td style="padding:5px 8px;background:${bg};text-align:center;"><span style="background:${cc};color:#fff;font-size:6px;font-weight:700;padding:1px 4px;border-radius:2px;">${s.confidence||'M'}</span></td>
      </tr>`;
    });
    h += '</tbody></table>';
    return h;
  }

  function renderGapTable(gaps) {
    if (!gaps.length) return '';
    const confColour = { H: C.owned, M: C.amber, L: '#999' };
    const playColour = { 'SCALE': C.forest, 'D2C': C.blue, 'CATEGORY CREATION': C.coral };
    const playShort  = { 'SCALE': 'SCALE', 'D2C': 'D2C', 'CATEGORY CREATION': 'CAT. CREATE' };
    let h = `<table style="width:100%;border-collapse:collapse;font-size:8px;">
      <thead><tr>
        <th style="padding:5px 8px;background:${C.forest};color:#fff;font-weight:700;text-align:left;letter-spacing:.05em;">OCCASION</th>
        <th style="padding:5px 8px;background:${C.forest};color:#fff;font-weight:700;text-align:right;">${CUR_SYM}${CUR_UNIT}</th>
        <th style="padding:5px 8px;background:${C.forest};color:#fff;font-weight:700;text-align:right;">SHARE</th>
        <th style="padding:5px 8px;background:${C.forest};color:#fff;font-weight:700;text-align:center;">PLAY</th>
        <th style="padding:5px 8px;background:${C.forest};color:#fff;font-weight:700;text-align:center;">CONF</th>
      </tr></thead><tbody>`;
    gaps.slice(0, 7).forEach((g, i) => {
      const bg = i % 2 ? '#faf7f2' : '#fff';
      const conf = g.confidence || 'M';
      const cc = confColour[conf] || C.amber;
      const play = g.playType || '';
      const pc = playColour[play] || C.forest;
      const ps = playShort[play] || play.slice(0,10);
      const shareText = g.brandShare === '0%' || !g.brandShare ? '<span style="color:#b85c38;font-weight:700;">ABSENT</span>' : g.brandShare;
      const isAbsent = g.brandShare === '0%' || !g.brandShare;
      h += `<tr>
        <td style="padding:4px 8px;background:${bg};border-left:3px solid ${isAbsent ? C.coral : C.amber};">
          <div style="font-weight:700;color:${C.forest};font-size:8px;line-height:1.3;white-space:normal;">${g.occasion||''}</div>
          ${g.scalingMechanism ? `<div style="font-size:6.5px;color:#888;margin-top:1px;white-space:normal;">via: ${g.scalingMechanism||''}</div>` : ''}
        </td>
        <td style="padding:4px 8px;background:${bg};text-align:right;font-weight:700;font-size:9px;">${CUR_SYM}${g.categorySizeCr||'—'}</td>
        <td style="padding:4px 8px;background:${bg};text-align:right;">${shareText}</td>
        <td style="padding:4px 8px;background:${bg};text-align:center;">
          ${ps ? `<span style="background:${pc};color:#fff;font-size:6px;font-weight:800;padding:2px 4px;border-radius:2px;letter-spacing:.04em;white-space:nowrap;">${ps}</span>` : ''}
        </td>
        <td style="padding:4px 8px;background:${bg};text-align:center;"><span style="background:${cc};color:#fff;font-size:6.5px;font-weight:700;padding:1px 4px;border-radius:2px;">${conf}</span></td>
      </tr>`;
    });
    h += '</tbody></table>';
    return h;
  }

  // ── Flavour Trend Heatmap ────────────────────────────────────────────
  function renderFlavourTrends(trends) {
    if (!trends.length) return '';
    const momentumColour = {
      accelerating: '#1a5c35', building: C.owned, mainstream: C.amber,
      emerging: C.blue, declining: '#c0392b'
    };
    const momentumWidth = { accelerating: 100, building: 80, mainstream: 65, emerging: 45, declining: 25 };
    const marketPill = { KR:'#c0392b', JP:'#b85c38', SEA:'#2563eb', US:'#1a5c35', UK:'#6b21a8', DE:'#374151', AU:'#92400e', IN: C.forest };

    const playColour = { 'SCALE': C.forest, 'D2C': C.blue, 'CATEGORY CREATION': C.coral };
    const playShort  = { 'SCALE': 'SCALE', 'D2C': 'D2C', 'CATEGORY CREATION': 'CAT' };
    let h = `<div style="margin:0;">
      <div style="display:grid;grid-template-columns:120px 80px 1fr 80px 50px 52px;gap:0;font-size:7px;background:${C.forest};color:#fff;font-weight:700;letter-spacing:.05em;">
        <div style="padding:5px 8px;">TREND</div>
        <div style="padding:5px 8px;">SIGNAL</div>
        <div style="padding:5px 8px;">NOW MOMENTUM</div>
        <div style="padding:5px 8px;">18 MONTHS</div>
        <div style="padding:5px 8px;text-align:center;">MKT</div>
        <div style="padding:5px 8px;text-align:center;">PLAY</div>
      </div>`;
    trends.slice(0, 8).forEach((t, i) => {
      const bg = i % 2 ? '#faf7f2' : '#fff';
      const nowCol = momentumColour[t.momentum] || C.amber;
      const nowW   = momentumWidth[t.momentum] || 50;
      const futCol = momentumColour[t.months18] || C.amber;
      const futW   = momentumWidth[t.months18] || 50;
      const mkCol  = marketPill[t.sourceMarket] || C.forest;
      const trend  = t.trend || '';
      const sig    = t.nowSignal || '';
      const rising = (momentumWidth[t.months18] || 50) > (momentumWidth[t.momentum] || 50);
      const arrow  = rising ? '↑' : (futW < nowW ? '↓' : '→');
      const headroom = typeof t.headroomPct === 'number' ? t.headroomPct : null;
      const play = t.playType || '';
      const pc = playColour[play] || C.forest;
      const ps = playShort[play] || '';
      h += `<div style="display:grid;grid-template-columns:120px 80px 1fr 80px 50px 52px;gap:0;background:${bg};border-bottom:1px solid #e8e0d5;align-items:center;">
        <div style="padding:5px 8px;">
          <div style="font-weight:700;color:${C.forest};font-size:8px;">${trend}</div>
          ${headroom !== null ? `<div style="margin-top:3px;background:#e8e0d5;border-radius:2px;height:4px;"><div style="background:${C.blue};width:${Math.min(headroom,100)}%;height:4px;border-radius:2px;"></div></div><div style="font-size:6px;color:${C.blue};margin-top:1px;">${headroom}% headroom</div>` : ''}
        </div>
        <div style="padding:5px 8px;color:#555;font-size:7px;line-height:1.3;">${sig}</div>
        <div style="padding:5px 8px;">
          <div style="background:#e8e0d5;border-radius:2px;height:8px;">
            <div style="background:${nowCol};width:${nowW}%;height:8px;border-radius:2px;"></div>
          </div>
          <div style="font-size:6.5px;color:${nowCol};font-weight:700;margin-top:2px;text-transform:uppercase;">${t.momentum||''}</div>
        </div>
        <div style="padding:5px 8px;">
          <div style="background:#e8e0d5;border-radius:2px;height:8px;">
            <div style="background:${futCol};width:${futW}%;height:8px;border-radius:2px;"></div>
          </div>
          <div style="font-size:6.5px;color:${futCol};font-weight:700;margin-top:2px;">${arrow} ${t.months18||''}</div>
        </div>
        <div style="padding:5px 8px;text-align:center;">
          <span style="background:${mkCol};color:#fff;font-size:6.5px;font-weight:800;padding:2px 4px;border-radius:3px;letter-spacing:.05em;">${t.sourceMarket||'IN'}</span>
        </div>
        <div style="padding:5px 8px;text-align:center;">
          ${ps ? `<span style="background:${pc};color:#fff;font-size:6px;font-weight:800;padding:2px 3px;border-radius:2px;letter-spacing:.03em;">${ps}</span>` : ''}
        </div>
      </div>`;
    });
    h += '</div>';
    return h;
  }

  // ── Radar Chart ──────────────────────────────────────────────────────
  function renderRadar(axes) {
    if (!axes.length) return '';
    const W = 260, H = 260, CX = 130, CY = 110, R = 82;
    const n = axes.length;
    const angleStep = (2 * Math.PI) / n;
    const levels = [0.25, 0.5, 0.75, 1.0];
    let svg = `<svg width="${W}" height="${H}" style="overflow:visible">`;

    // Grid rings
    levels.forEach(l => {
      const pts = axes.map((_, i) => {
        const a = i * angleStep - Math.PI / 2;
        return `${CX + R * l * Math.cos(a)},${CY + R * l * Math.sin(a)}`;
      }).join(' ');
      svg += `<polygon points="${pts}" fill="none" stroke="#ddd" stroke-width="${l === 1 ? 1.5 : 0.75}"/>`;
    });

    // Axes
    axes.forEach((_, i) => {
      const a = i * angleStep - Math.PI / 2;
      svg += `<line x1="${CX}" y1="${CY}" x2="${CX + R * Math.cos(a)}" y2="${CY + R * Math.sin(a)}" stroke="#ddd" stroke-width="0.75"/>`;
    });

    // Today polygon
    const todayPts = axes.map((ax, i) => {
      const a = i * angleStep - Math.PI / 2;
      const v = Math.min(1, Math.max(0, (ax.today || 0) / 100));
      return `${CX + R * v * Math.cos(a)},${CY + R * v * Math.sin(a)}`;
    }).join(' ');
    svg += `<polygon points="${todayPts}" fill="${C.forest}" fill-opacity="0.25" stroke="${C.forest}" stroke-width="2"/>`;

    // Future polygon
    const futurePts = axes.map((ax, i) => {
      const a = i * angleStep - Math.PI / 2;
      const v = Math.min(1, Math.max(0, (ax.future || 0) / 100));
      return `${CX + R * v * Math.cos(a)},${CY + R * v * Math.sin(a)}`;
    }).join(' ');
    svg += `<polygon points="${futurePts}" fill="${C.amber}" fill-opacity="0.15" stroke="${C.amber}" stroke-width="2" stroke-dasharray="4,2"/>`;

    // Gap fill between today and future
    svg += `<polygon points="${futurePts}" fill="${C.amber}" fill-opacity="0.08" stroke="none"/>`;

    // Dots
    axes.forEach((ax, i) => {
      const a = i * angleStep - Math.PI / 2;
      const vt = Math.min(1, Math.max(0, (ax.today || 0) / 100));
      const vf = Math.min(1, Math.max(0, (ax.future || 0) / 100));
      svg += `<circle cx="${CX + R * vt * Math.cos(a)}" cy="${CY + R * vt * Math.sin(a)}" r="3.5" fill="${C.forest}" stroke="#fff" stroke-width="1"/>`;
      svg += `<circle cx="${CX + R * vf * Math.cos(a)}" cy="${CY + R * vf * Math.sin(a)}" r="3.5" fill="${C.amber}" stroke="#fff" stroke-width="1"/>`;
    });

    // Axis labels with score numbers — bottom axis shifted to avoid ring overlap
    axes.forEach((ax, i) => {
      const a = i * angleStep - Math.PI / 2;
      const LABEL_R = R + 20;
      const lx = CX + LABEL_R * Math.cos(a);
      const ly = CY + LABEL_R * Math.sin(a);
      const isRight = lx > CX + 5;
      const isLeft  = lx < CX - 5;
      const anchor  = isRight ? 'start' : isLeft ? 'end' : 'middle';
      const label   = (ax.axis || '').slice(0, 18);
      const words   = label.split(' ');
      const todayScore  = Math.round(ax.today || 0);
      const futureScore = Math.round(ax.future || 0);
      const delta    = futureScore - todayScore;
      const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
      const deltaCol = delta > 0 ? C.forest : '#c0392b';
      // Bottom-pointing axes: extra downward offset so score clears the SVG legend area
      const isBottom = Math.sin(a) > 0.6;
      const yOff = isBottom ? 8 : 0;
      if (words.length > 1) {
        svg += `<text x="${lx}" y="${ly - 3 + yOff}" text-anchor="${anchor}" font-size="7" font-weight="700" fill="${C.forest}">${words[0]}</text>`;
        svg += `<text x="${lx}" y="${ly + 6 + yOff}" text-anchor="${anchor}" font-size="7" font-weight="700" fill="${C.forest}">${words.slice(1).join(' ')}</text>`;
        svg += `<text x="${lx}" y="${ly + 15 + yOff}" text-anchor="${anchor}" font-size="6.5" fill="${deltaCol}" font-weight="700">${todayScore}→${futureScore} (${deltaStr})</text>`;
      } else {
        svg += `<text x="${lx}" y="${ly + 3 + yOff}" text-anchor="${anchor}" font-size="7" font-weight="700" fill="${C.forest}">${label}</text>`;
        svg += `<text x="${lx}" y="${ly + 12 + yOff}" text-anchor="${anchor}" font-size="6.5" fill="${deltaCol}" font-weight="700">${todayScore}→${futureScore} (${deltaStr})</text>`;
      }
    });

    // Legend removed from SVG — shown in HTML above radar

    svg += '</svg>';
    return svg;
  }

  // ── Move Cards ───────────────────────────────────────────────────────
  function renderMoveCards(moves) {
    if (!moves.length) return '';
    const confColour  = { CONFIRMED: C.owned, DERIVED: C.blue, ESTIMATED: C.amber, 'SIGNAL ONLY': '#999' };
    const filterLabels = { A: 'BIGGEST×FASTEST', B: 'RIGHT TO WIN', C: 'WINDOW CLOSING' };
    const filterColour = { A: C.forest, B: C.blue, C: C.coral };
    const playConfig  = {
      'SCALE':             { colour: C.forest,  label: 'SCALE PLAY',       icon: '⚡', sub: 'Use the full machine' },
      'D2C':               { colour: C.blue,    label: 'D2C PLAY',         icon: '◎', sub: 'Ring-fence. Separate P&L.' },
      'CATEGORY CREATION': { colour: C.coral,   label: 'CATEGORY CREATION',icon: '◈', sub: 'Move before Nielsen sees it' },
    };
    return `<div style="display:grid;grid-template-columns:repeat(${Math.min(moves.length, 3)},1fr);gap:8px;">` +
      moves.slice(0, 3).map((m, i) => {
        const numLabel = ['①', '②', '③'][i];
        const conf     = m.confidence || 'ESTIMATED';
        const cc       = confColour[conf] || C.amber;
        const filters  = Array.isArray(m.filters) ? m.filters : [];
        const title    = m.title || 'Move ' + (i+1);
        const play     = m.playType || '';
        const pcfg     = playConfig[play] || { colour: C.forest, label: play, icon: '◆', sub: '' };
        const orgInstr = m.orgInstruction || '';
        const scaling  = m.scalingMechanism || '';
        return `<div style="background:#fff;border:1.5px solid ${pcfg.colour};border-radius:4px;overflow:hidden;display:flex;flex-direction:column;">
          <!-- Play Type Banner -->
          <div style="background:${pcfg.colour};padding:4px 10px;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:7px;font-weight:800;color:#fff;letter-spacing:.1em;">${pcfg.icon} ${pcfg.label}</span>
            <span style="font-size:6.5px;color:rgba(255,255,255,.7);font-style:italic;">${pcfg.sub}</span>
          </div>
          <!-- Title bar -->
          <div style="background:${pcfg.colour}22;padding:7px 10px;display:flex;align-items:center;gap:6px;border-bottom:1px solid ${pcfg.colour}33;">
            <span style="font-size:13px;color:${pcfg.colour};">${numLabel}</span>
            <span style="font-size:9px;font-weight:800;color:${C.forest};letter-spacing:.03em;flex:1;line-height:1.2;">${title}</span>
          </div>
          <!-- Body -->
          <div style="padding:8px 10px;flex:1;display:flex;flex-direction:column;gap:4px;">
            <div style="font-size:7px;color:#666;font-style:italic;line-height:1.3;white-space:normal;">${m.occasion||''}</div>
            <!-- Opportunity -->
            <div style="display:flex;align-items:baseline;gap:3px;">
              <span style="font-size:18px;font-weight:900;color:${C.forest};line-height:1;">${CUR_SYM}${m.opportunityCr||'?'}</span>
              <span style="font-size:7px;color:#888;">${CUR_UNIT} opp.</span>
              <span style="background:${cc};color:#fff;font-size:6px;font-weight:700;padding:1px 4px;border-radius:2px;margin-left:4px;">${conf}</span>
            </div>
            <!-- Revenue timeline -->
            <div style="font-size:7px;color:#888;">First revenue: <strong style="color:${C.forest};">${m.timeToRevenue||'TBD'}</strong></div>
            <!-- Rationale -->
            <div style="font-size:7.5px;color:${C.forest};font-weight:600;line-height:1.4;border-left:2px solid ${pcfg.colour};padding-left:5px;white-space:normal;">${m.rationale||''}</div>
            <!-- Org instruction — the key new element -->
            ${orgInstr ? `<div style="background:${pcfg.colour}11;border:1px solid ${pcfg.colour}44;border-radius:3px;padding:4px 6px;">
              <div style="font-size:6px;font-weight:800;letter-spacing:.08em;color:${pcfg.colour};margin-bottom:2px;">HOW TO ORGANISE</div>
              <div style="font-size:7px;color:#444;line-height:1.4;">${orgInstr}</div>
            </div>` : ''}
            <!-- Scaling mechanism -->
            ${scaling ? `<div style="font-size:6.5px;color:#777;line-height:1.3;"><span style="font-weight:700;color:#555;">Path to scale:</span> ${scaling}</div>` : ''}
            <!-- Evidence -->
            <div style="font-size:7px;color:#999;border-top:1px solid #f0ece6;padding-top:4px;line-height:1.3;margin-top:auto;white-space:normal;">${m.evidence||''}</div>
            <!-- Filter tags -->
            <div style="display:flex;gap:3px;flex-wrap:wrap;">
              ${filters.map(f => `<span style="background:${filterColour[f]||C.forest}22;color:${filterColour[f]||C.forest};border:1px solid ${filterColour[f]||C.forest}55;font-size:6px;font-weight:700;padding:1px 4px;border-radius:2px;letter-spacing:.03em;">${filterLabels[f]||f}</span>`).join('')}
            </div>
          </div>
        </div>`;
      }).join('') + '</div>';
  }

  // ── International Signal Strip ───────────────────────────────────────
  function renderIntlStrip(signals) {
    if (!signals.length) return '';
    const mktColour = { KR:'#c0392b', JP:'#b85c38', SEA:'#2563eb', US:'#1a5c35', UK:'#6b21a8', DE:'#374151', AU:'#92400e', IN: C.forest };
    const confDot = { H: C.owned, M: C.amber, L: '#ccc' };
    return `<div style="display:grid;grid-template-columns:repeat(${Math.min(signals.length,6)},1fr);gap:6px;">` +
      signals.slice(0, 6).map(s => {
        const mc = mktColour[s.market] || C.forest;
        const cd = confDot[s.confidence] || C.amber;
        return `<div style="background:#fff;border:1px solid #e8e0d5;border-radius:3px;padding:7px 8px;border-top:3px solid ${mc};">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span style="background:${mc};color:#fff;font-size:7px;font-weight:800;padding:2px 6px;border-radius:2px;letter-spacing:.08em;">${s.market}</span>
            <span style="font-size:7.5px;color:#888;">${s.indiaInflection||''}</span>
          </div>
          <div style="font-size:8px;font-weight:700;color:${C.forest};margin-bottom:3px;line-height:1.3;white-space:normal;">${s.trend||''}</div>
          <div style="font-size:7px;color:#666;line-height:1.3;white-space:normal;">${s.signal||''}</div>
          <div style="margin-top:4px;display:flex;align-items:center;gap:3px;">
            <span style="width:6px;height:6px;border-radius:50%;background:${cd};display:inline-block;"></span>
            <span style="font-size:6.5px;color:#888;">Signal confidence</span>
          </div>
        </div>`;
      }).join('') + '</div>';
  }

  // ── KPI strip ────────────────────────────────────────────────────────
  function renderKPIs(kpis) {
    if (!kpis.length) return '';
    const trendArrow = { up: '↑', down: '↓', flat: '→', watch: '⚠' };
    const trendCol   = { up: C.owned, down: '#c0392b', flat: '#888', watch: C.amber };
    const confCol    = { H: C.owned, M: C.amber, L: '#999' };
    return `<div style="display:grid;grid-template-columns:repeat(${Math.min(kpis.length,4)},1fr);gap:6px;margin-bottom:14px;">` +
      kpis.slice(0, 4).map(k => {
        const tc = trendCol[k.trend] || '#888';
        const ta = trendArrow[k.trend] || '→';
        const cc = confCol[k.confidence] || C.amber;
        return `<div style="background:#fff;border:1px solid #e8e0d5;border-radius:3px;padding:8px 10px;border-left:3px solid ${C.forest};">
          <div style="font-size:7px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#888;margin-bottom:3px;white-space:normal;">${k.label||''}</div>
          <div style="font-size:16px;font-weight:900;color:${C.forest};line-height:1;">${k.value||'—'} <span style="font-size:11px;color:${tc};">${ta}</span></div>
          <div style="font-size:7px;color:#888;margin-top:3px;white-space:normal;">${k.sub||''}</div>
          <div style="margin-top:4px;"><span style="background:${cc};color:#fff;font-size:6px;font-weight:700;padding:1px 4px;border-radius:2px;">${k.confidence||'M'}</span></div>
        </div>`;
      }).join('') + '</div>';
  }

  // renderPage3 removed — challenger brands and international signal detail
  // are now rendered inline on Page 2 (sufficient space confirmed).

  // ── Page structure ───────────────────────────────────────────────────
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const subtitleLine = companyMode === 'parent' && parentCo ? `Brand within ${parentCo}` : companyMode === 'acquired' && acquirer ? `Post-acquisition · ${acquirer}` : 'Strategic Opportunity Brief';

  const pageStyle = `width:794px;min-height:1123px;padding:32px 36px;box-sizing:border-box;background:#faf7f2;font-family:'Instrument Sans',sans-serif;page-break-after:always;position:relative;`;

  // ── Assemble HTML ────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #eee; }
  @page { size: A4; margin: 0; }
  @media print {
    body { background: white; }
    .page { page-break-after: always; }
  }
</style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page" style="${pageStyle}">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;padding-bottom:12px;border-bottom:3px solid ${C.forest};">
    <div>
      <div style="font-size:8px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:${C.coral};margin-bottom:4px;">OPPORTUNITY BRIEF</div>
      <div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:${C.forest};line-height:1;">${company}</div>
      <div style="font-size:9px;color:#888;margin-top:3px;">${subtitleLine}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(61,96,77,.18);line-height:1.2;">AdvisorSprint</div>
      <div style="font-size:7.5px;color:rgba(61,96,77,.18);letter-spacing:.04em;margin-top:2px;">Harsha Belavady</div>
    </div>
  </div>

  <!-- KPI Strip -->
  ${renderKPIs(kpis)}

  <!-- Two-column: Occasion Wheel + Gap Table -->
  <div style="display:grid;grid-template-columns:420px 1fr;gap:16px;margin-bottom:14px;">
    <div>
      <div style="margin-bottom:8px;">
        <div style="font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.forest};">OCCASION COVERAGE MAP</div>
        ${sectionHdrs.occasionWheel ? `<div style="font-size:7.5px;color:#666;font-style:italic;margin-top:2px;line-height:1.3;">${sectionHdrs.occasionWheel}</div>` : ''}
      </div>
      ${renderOccasionWheel(occasions)}
    </div>
    <div>
      <div style="margin-bottom:8px;">
        <div style="font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.forest};">GAP PRIORITY TABLE</div>
        ${sectionHdrs.gapTable ? `<div style="font-size:7.5px;color:#666;font-style:italic;margin-top:2px;line-height:1.3;">${sectionHdrs.gapTable}</div>` : ''}
      </div>
      ${renderGapTable(gapTable)}
    </div>
  </div>

  <!-- What The Market Is Telling You — home market players proving format/occasion demand -->
  <div style="margin-bottom:10px;">
    <div style="margin-bottom:6px;">
      <div style="font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.forest};">WHAT THE MARKET IS TELLING YOU</div>
      ${sectionHdrs.marketSignals ? `<div style="font-size:7.5px;color:#666;font-style:italic;margin-top:2px;line-height:1.3;">${sectionHdrs.marketSignals}</div>` : ''}
    </div>
    ${renderMarketSignals(marketSignals)}
  </div>

  <!-- Institutional Edge — untapped parent/acquirer assets or standalone structural advantage -->
  ${institutionalEdge.length ? `
  <div style="margin-bottom:10px;">
    <div style="margin-bottom:6px;">
      <div style="font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.forest};">${companyMode === 'standalone' ? 'STRUCTURAL ADVANTAGE' : 'INSTITUTIONAL EDGE NOT DEPLOYED'}</div>
      ${sectionHdrs.institutionalEdge ? `<div style="font-size:7.5px;color:#666;font-style:italic;margin-top:2px;line-height:1.3;">${sectionHdrs.institutionalEdge}</div>` : ''}
    </div>
    ${renderInstitutionalEdge(institutionalEdge)}
  </div>` : ''}

  <!-- Page 1 → Page 2 transition bridge -->
  ${(db.page1Summary) ? `
  <div style="background:#f0ece6;border-radius:3px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:12px;">
    <div style="flex:1;">
      <div style="font-size:6px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${C.forest};margin-bottom:3px;">SITUATION SUMMARY · THE CASE FOR ACTION</div>
      <div style="font-size:8px;color:#333;line-height:1.5;font-weight:500;">${db.page1Summary}</div>
    </div>
    <div style="flex-shrink:0;text-align:center;padding-left:12px;border-left:2px solid #ddd;">
      <div style="font-size:7px;color:#888;margin-bottom:2px;">continued</div>
      <div style="font-size:16px;color:${C.forest};font-weight:800;line-height:1;">→</div>
      <div style="font-size:6.5px;color:${C.forest};font-weight:700;">Page 2</div>
    </div>
  </div>` : ''}

  <!-- Footer -->
  <div style="position:absolute;bottom:18px;left:36px;right:36px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:6.5px;color:#aaa;letter-spacing:.06em;">ADVISORSPRINT INTELLIGENCE · CONFIDENTIAL</div>
    <div style="font-size:6.5px;color:#aaa;">PAGE 1 OF 2</div>
  </div>
</div>

<!-- PAGE 2 -->
<div class="page" style="${pageStyle}">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid ${C.forest};">
    <div>
      <div style="font-size:8px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:${C.coral};">18-MONTH TRANSFORMATION</div>
      <div style="font-size:16px;font-weight:800;color:${C.forest};">${company} · Where to Play, How to Win</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;">
      <div style="font-size:7px;color:#aaa;letter-spacing:.06em;">PAGE 2 OF 2</div>
      <div style="display:flex;gap:5px;align-items:center;">
        <span style="background:${C.forest};color:#fff;font-size:6.5px;font-weight:800;padding:2px 6px;border-radius:2px;">⚡ SCALE PLAY</span>
        <span style="background:${C.blue};color:#fff;font-size:6.5px;font-weight:800;padding:2px 6px;border-radius:2px;">◎ D2C PLAY</span>
        <span style="background:${C.coral};color:#fff;font-size:6.5px;font-weight:800;padding:2px 6px;border-radius:2px;">◈ CATEGORY CREATION</span>
      </div>
    </div>
  </div>

  <!-- Radar + Before/After State -->
  <div style="display:grid;grid-template-columns:260px 1fr;gap:16px;margin-bottom:14px;">
    <div>
      <div style="margin-bottom:6px;">
        <div style="font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.forest};">STRATEGIC POSITION GAP</div>
        ${sectionHdrs.radarGap ? `<div style="font-size:7.5px;color:#666;font-style:italic;margin-top:2px;line-height:1.3;">${sectionHdrs.radarGap}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:4px;">
          <svg width="10" height="10"><rect width="10" height="10" rx="1" fill="${C.forest}" fill-opacity="0.5" stroke="${C.forest}" stroke-width="1.5"/></svg>
          <span style="font-size:7px;color:#555;font-weight:600;">Today</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;">
          <svg width="10" height="10"><rect width="10" height="10" rx="1" fill="${C.amber}" fill-opacity="0.25" stroke="${C.amber}" stroke-width="1.5" stroke-dasharray="3,1.5"/></svg>
          <span style="font-size:7px;color:#555;font-weight:600;">18 Months (if 3 moves executed)</span>
        </div>
      </div>
      ${renderRadar(radarAxes)}
    </div>
    <div>
      <div style="margin-bottom:8px;">
        <div style="font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.forest};">THE 3 MOVES</div>
        <div style="font-size:7.5px;color:#666;font-style:italic;margin-top:2px;">Closing the gaps identified on Page 1 — sequenced by speed and right to win.</div>
      </div>
      ${renderMoveCards(moves)}
    </div>
  </div>

  <!-- Category Read — global structural context for international section -->
  ${categoryRead ? `
  <div style="display:grid;grid-template-columns:1fr 80px 110px;gap:0;background:#fff;border:1px solid #e8e0d5;border-left:3px solid ${C.blue};border-radius:0 3px 3px 0;padding:7px 12px;margin-bottom:10px;align-items:center;">
    <div>
      <div style="font-size:6px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${C.blue};margin-bottom:3px;">GLOBAL CATEGORY CONTEXT</div>
      <div style="font-size:7px;color:#333;line-height:1.4;font-weight:600;">${categoryRead.globalTrend||''}</div>
      <div style="font-size:6.5px;color:#666;line-height:1.4;margin-top:2px;">${categoryRead.implication||''}</div>
    </div>
    <div style="text-align:center;padding:0 8px;border-left:1px solid #e8e0d5;">
      <div style="font-size:6px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#888;margin-bottom:3px;">LEAD MKT</div>
      <div style="background:${C.blue};color:#fff;font-size:9px;font-weight:800;padding:3px 6px;border-radius:2px;display:inline-block;">${categoryRead.leadMarket||'—'}</div>
    </div>
    <div style="text-align:center;padding:0 8px;border-left:1px solid #e8e0d5;">
      <div style="font-size:6px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#888;margin-bottom:3px;">MKT LAG</div>
      <div style="font-size:7.5px;font-weight:800;color:${C.coral};">${categoryRead.homeMarketLag||categoryRead.indiaLag||'—'}</div>
    </div>
  </div>` : ''}

  <!-- Country legend -->
  <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;padding:4px 8px;background:#f8f6f2;border-radius:3px;flex-wrap:wrap;">
    <span style="font-size:6px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#aaa;margin-right:4px;">MARKETS</span>
    ${[['KR','Korea'],['JP','Japan'],['SEA','SE Asia'],['US','USA'],['UK','UK'],['DE','Germany'],['AU','Australia'],['IN','India']].map(([code,name]) =>
      `<span style="font-size:6.5px;color:#555;font-weight:600;"><span style="background:#333;color:#fff;font-size:5.5px;font-weight:800;padding:1px 4px;border-radius:2px;margin-right:3px;font-family:monospace;">${code}</span>${name}</span>`
    ).join('')}
  </div>

  <!-- International Arrival Sequence — consolidated single table -->
  ${arrivalSequence.length ? `
  <div style="margin-bottom:12px;">
    <div style="font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.forest};margin-bottom:6px;padding-bottom:4px;border-bottom:1.5px solid ${C.forest};">INTERNATIONAL ARRIVAL SEQUENCE</div>
    ${renderArrivalSequence(arrivalSequence)}
  </div>` : ''}

  <!-- Challenger Brand Watch -->
  ${Array.isArray(p3.challengerBrands) && p3.challengerBrands.length ? `
  <div style="margin-bottom:12px;">
    <div style="font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.coral};margin-bottom:6px;padding-bottom:4px;border-bottom:1.5px solid ${C.coral};">IF YOU DON'T MOVE — THEY WILL</div>
    <div style="display:grid;grid-template-columns:repeat(${Math.min(p3.challengerBrands.length,3)},1fr);gap:8px;">
      ${p3.challengerBrands.slice(0,3).map(b => `
        <div style="background:#fff;border:1px solid #e8e0d5;border-radius:3px;padding:8px 10px;border-top:2.5px solid ${C.coral};height:82px;box-sizing:border-box;">
          <div style="font-size:9px;font-weight:800;color:${C.forest};margin-bottom:3px;white-space:normal;">${b.name||''}</div>
          <div style="font-size:15px;font-weight:900;color:${C.coral};margin-bottom:3px;line-height:1;">${b.revenueEst||'?'}</div>
          <div style="font-size:7px;color:#555;margin-bottom:2px;line-height:1.3;white-space:normal;">Targeting: ${b.occasion||''}</div>
          <div style="font-size:7px;color:#888;">Threat: <strong style="color:${C.coral};">${b.threat||'TBD'}</strong></div>
        </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- Bold Statement — always last, the call to action -->
  ${boldStatement ? `
  <div style="background:${C.forest};border-radius:4px;padding:16px 20px;margin-bottom:14px;">
    <div style="font-size:7.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:8px;">THE VERDICT</div>
    <div style="font-size:${boldStatement.length > 100 ? '11' : '13'}px;font-weight:700;color:#fff;line-height:1.5;font-style:italic;">${boldStatement}</div>
  </div>` : ''}

  <!-- Footer -->
  <div style="position:absolute;bottom:18px;left:36px;right:36px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:6.5px;color:#aaa;letter-spacing:.06em;">ADVISORSPRINT INTELLIGENCE · CONFIDENTIAL · FOR INTERNAL USE ONLY</div>
    <div style="font-size:6.5px;color:#aaa;">NUMBERS MARKED ESTIMATED/SIGNAL ONLY ARE DIRECTIONAL — VERIFY BEFORE PRESENTING</div>
  </div>
</div>

</body>
</html>`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARKDOWN FORMATTING FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function md(text) {
  if (!text) return "";
  
  // Strip reasoning preamble lines that agents sometimes output
  text = text.replace(/^[^\n]*(?:I'll conduct|I will conduct|Let me|Based on my research|I need to|I'll search|I'll analyze|I'll now|I'll begin|I'll start)[^\n]*\n/gim, '');
  text = text.replace(/^#{1,2}\s*$/gm, ''); // remove empty headers left behind

  // First, fix the Sources line to ensure it's on one line
  let fixedText = text.replace(/\*\*Sources:\*\*([^\n]*(?:\n(?!\n)[^\n]*)*)/g, (match, sources) => {
    const cleaned = sources.replace(/\n/g, ', ').replace(/,\s*,/g, ',').trim();
    return `**Sources:** ${cleaned}`;
  });
  
  // Remove markdown heading
  fixedText = fixedText.replace(/^#+\s*(?:AGENT\s*\d+[:\s—-]*)?(?:EXECUTIVE SYNOPSIS|Executive Synopsis)\s*\n/gim, '');
  fixedText = fixedText.replace(/^#+\s*AGENT\s*\d+[:\s:—-]+[^\n]+\n/gim, '');
  
  // Check if this is synopsis content (has THE VERDICT)
  const isSynopsis = fixedText.includes('**THE VERDICT**');
  
  if (isSynopsis) {
    // Handle synopsis with special layout
    let html = '';
    
    // Extract THE RECOMMENDATION
    const verdictMatch = fixedText.match(/(?:THE RECOMMENDATION|THE VERDICT)[:\s—]*\n([\s\S]+?)(?=\n◉|\n##|\nTHE STRATEGIC|$)/i);
    if (verdictMatch) {
      const vClean = verdictMatch[1].trim().replace(/\n\n/g,' ').replace(/\n/g,' ');
      html += `<div class="verdict-box">
        <div class="verdict-label" style="font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a3325;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #3d6b54;">THE RECOMMENDATION</div>
        <p class="verdict-text">${vClean.replace(/\*\*(.+?)\*\*/g,'<strong style="color:#ede6d6">$1</strong>')}</p>
      </div>`;
    }

    // Extract CONTRADICTIONS & TENSIONS (## PART 2)
    const contraMatch = fixedText.match(/##\s*PART\s*2[:\s—]*CONTRADICTIONS[\s\S]*?\n([\s\S]+?)(?=\n##\s*PART|$)/i);
    if (contraMatch) {
      const contraParas = contraMatch[1].trim().split(/\n\n+/).filter(p => p.trim());
      html += `<div style="margin:14px 0;">
        <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#b85c38;margin-bottom:8px;padding-bottom:5px;border-bottom:2px solid #b85c38;">CONTRADICTIONS & TENSIONS</div>
        ${contraParas.map(p => `<div style="padding:10px 14px;background:#fff8f5;border-left:3px solid #b85c38;margin-bottom:6px;font-size:9px;line-height:1.65;color:#3d3020;border-radius:0 3px 3px 0;">${p.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</div>`).join('')}
      </div>`;
    }

    // Extract TWO FUTURES (## PART 3)
    const futuresMatch = fixedText.match(/##\s*PART\s*3[:\s—]*TWO FUTURES[\s\S]*?\n([\s\S]+?)(?=\n##\s*PART|$)/i);
    if (futuresMatch) {
      const futureParas = futuresMatch[1].trim().split(/\n\n+/).filter(p => p.trim());
      const colors = ['#e8f5ee:#2d7a4f', '#fdf2f2:#c0392b'];
      html += `<div style="margin:14px 0;">
        <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a3325;margin-bottom:8px;padding-bottom:5px;border-bottom:2px solid #1a3325;">TWO FUTURES</div>
        ${futureParas.slice(0,2).map((p,i) => {
          const [bg, border] = colors[i].split(':');
          return `<div style="padding:10px 14px;background:${bg};border-left:3px solid ${border};margin-bottom:6px;font-size:9px;line-height:1.65;color:#3d3020;border-radius:0 3px 3px 0;">${p.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</div>`;
        }).join('')}
      </div>`;
    }

    // Extract ANALYST'S GUT CALL (## PART 4)
    const gutMatch = fixedText.match(/##\s*PART\s*4[:\s—]*.*GUT[\s\S]*?\n([\s\S]+?)(?=\n##|$)/i);
    if (gutMatch) {
      const gutText = gutMatch[1].trim().replace(/\n/g,' ');
      html += `<div style="margin:14px 0;padding:14px 18px;background:#1a3325;border-radius:4px;">
        <div style="font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px;">THE ANALYST'S GUT CALL</div>
        <p style="font-size:10px;line-height:1.7;color:rgba(255,255,255,.9);font-style:italic;margin:0;">${gutText.replace(/\*\*(.+?)\*\*/g,'<strong style="color:#fff">$1</strong>')}</p>
      </div>`;
    }
    
    // Extract all ◉ sections
    const sections = [];
    const sectionRegex = /◉ ([A-Z\s&]+)\s*\n(.+?)(?=\n◉|$)/gs;
    let match;
    while ((match = sectionRegex.exec(fixedText)) !== null) {
      const rawContent = match[2].trim()
        .replace(/\[HIGH CONFIDENCE[^\]]*\]/gi, '<span class="conf-high">✓ High</span>')
        .replace(/\[MEDIUM CONFIDENCE[^\]]*\]/gi, '<span class="conf-medium">~ Medium</span>')
        .replace(/\[LOW CONFIDENCE[^\]]*\]/gi, '<span class="conf-low">⚠ Low</span>');
      sections.push({ title: match[1].trim(), content: rawContent });
    }
    
    // Wave 1: First 4 sections in 2x2 grid
    if (sections.length >= 4) {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px">';
      for (let i = 0; i < 4; i++) {
        html += `<div style="padding:10px 12px;background:white;border:1px solid #3d6b54;border-left:4px solid #3d6b54;margin-bottom:2px">
          <div style="font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1a3325;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #d4c4a8">◉ ${sections[i].title}</div>
          <p style="font-size:8.5px;line-height:1.4;color:#3d3020;margin:0">${sections[i].content}</p>
        </div>`;
      }
      html += '</div>';
    }
    
    // Wave 2: Remaining sections row-wise
    for (let i = 4; i < sections.length; i++) {
      html += `<div style="margin-bottom:6px;padding:10px 12px;background:white;border:1px solid #3d6b54;border-left:4px solid #3d6b54">
        <div style="font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1a3325;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #d4c4a8">◉ ${sections[i].title}</div>
        <p style="font-size:9px;line-height:1.4;color:#3d3020;margin:0">${sections[i].content}</p>
      </div>`;
    }
    
    return html;
  }
  
  // Convert confidence labels to inline badges
  fixedText = fixedText
    .replace(/\[HIGH CONFIDENCE[^\]]*\]/gi,   '<span class="conf-high">✓ High</span>')
    .replace(/\[MEDIUM CONFIDENCE[^\]]*\]/gi, '<span class="conf-medium">~ Medium</span>')
    .replace(/\[LOW CONFIDENCE[^\]]*\]/gi,    '<span class="conf-low">⚠ Low</span>')
    .replace(/\[HIGH\]/gi,   '<span class="conf-high">✓ High</span>')
    .replace(/\[MEDIUM\]/gi, '<span class="conf-medium">~ Medium</span>')
    .replace(/\[LOW\]/gi,    '<span class="conf-low">⚠ Low</span>');

  // Regular content (agent analysis)
  // Special case: if content starts with ##, don't add opening <p> tag
  const startsWithHeader = fixedText.trim().startsWith('##');
  const openTag = startsWithHeader ? '' : '<p style="margin:6px 0;">';
  const closeTag = startsWithHeader ? '' : '</p>';
  
  // Extract HTML tables before processing — preserve them verbatim
  const tablePlaceholders = [];
  fixedText = fixedText.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
    const ph = `__TABLE_${tablePlaceholders.length}__`;
    tablePlaceholders.push(match);
    return ph;
  });

  let rendered = openTag + fixedText
    .replace(/^## (.+)$/gm, `</p><h3 class="agent-section-header" style="font-family:'Libre Baskerville',serif;font-size:14px;font-weight:700;color:${P.forest};margin:16px 0 6px;border-bottom:2px solid ${P.sand};padding-bottom:4px;">$1</h3><p style="margin:6px 0;">`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${P.ink};">$1</strong>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:7px;margin:3px 0;"><span style="color:${P.terra};">▸</span><span>$1</span></div>`)
    .replace(/\n\n/g, `</p><p style="margin:6px 0;">`)
    .replace(/\n/g, " ") + closeTag;

  // Restore tables
  tablePlaceholders.forEach((table, i) => {
    rendered = rendered.replace(`__TABLE_${i}__`, `</p><div style="margin:14px 0;overflow-x:auto;">${table}</div><p style="margin:6px 0;">`);
  });

  return rendered;
}

// ── DataBlock Inspector — diagnostic component, screen-only ──────────────────
function DataBlockInspector({ agentId, agentLabel, db }) {
  const [open, setOpen] = useState(false);

  if (!db) return (
    <div style={{ marginTop: 24, padding: '10px 14px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 6, fontFamily: 'monospace', fontSize: 11 }}>
      <span style={{ fontWeight: 700, color: '#856404' }}>⚠ DataBlock Inspector:</span>
      <span style={{ color: '#856404', marginLeft: 8 }}>No DATA_BLOCK parsed for <strong>{agentId}</strong> — agent did not output the schema or parsing failed.</span>
    </div>
  );

  const verdict = db.verdictRow?.verdict || '—';
  const verdictColor = { STRONG: '#28a745', WATCH: '#fd7e14', OPTIMISE: '#007bff', UNDERDELIVERED: '#dc3545', RISK: '#dc3545' }[verdict] || '#6c757d';
  const agentFields = Object.keys(db).filter(k => !['agent','kpis','verdictRow','topActions'].includes(k));
  const fieldStatuses = agentFields.map(field => {
    const val = db[field];
    const isPlaceholder = v =>
      v === 0 || v === null || v === '' ||
      v === 'H|M|L' || v === 'STRONG|WATCH|OPTIMISE|UNDERDELIVERED|RISK' ||
      v === 'channel|product|campaign|strategic' || v === 'build|partner|acquire' ||
      v === 'activated|partial|untapped' || v === 'STAR|CASHCOW|QUESTION|DOG' ||
      v === 'KILL|KEEP|GROW|BUILD';
    const isEmpty = !val ||
      (Array.isArray(val) && val.length === 0) ||
      (Array.isArray(val) && val.every(item =>
        typeof item === 'object' && Object.values(item).every(isPlaceholder)
      )) ||
      // For plain objects (e.g. itcAssociationDial) — empty if all values are placeholders or null
      (!Array.isArray(val) && typeof val === 'object' &&
        Object.values(val).every(v => isPlaceholder(v) || (typeof v === 'number' && v === 0)));
    return { field, isEmpty };
  });
  const allFilled = fieldStatuses.every(f => !f.isEmpty);

  return (
    <div style={{ marginTop: 24, border: '1px solid #dee2e6', borderRadius: 6, overflow: 'hidden', fontFamily: 'monospace' }}>
      {/* Header — always visible */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: allFilled ? '#e8f5e9' : '#fff8e1', cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ fontSize: 13 }}>{allFilled ? '✅' : '⚠️'}</span>
        <span style={{ fontWeight: 700, fontSize: 11, color: '#333' }}>DataBlock Inspector — {agentId}</span>
        <span style={{ marginLeft: 6, fontSize: 11, background: verdictColor, color: '#fff', borderRadius: 10, padding: '1px 8px', fontWeight: 700 }}>{verdict}</span>
        <span style={{ marginLeft: 6, fontSize: 10, color: '#666' }}>
          {db.kpis?.length || 0} KPIs · {agentFields.length} visual fields · {allFilled ? 'all populated' : `${fieldStatuses.filter(f => f.isEmpty).length} field(s) empty/unfilled`}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#666' }}>{open ? '▲ hide' : '▼ inspect'}</span>
      </div>

      {open && (
        <div style={{ padding: '12px 14px', background: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>

          {/* KPIs */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 4, letterSpacing: '.08em', textTransform: 'uppercase' }}>KPIs</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(db.kpis || []).map((k, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 4, padding: '4px 8px', fontSize: 10 }}>
                  <span style={{ color: '#888' }}>{k.label}: </span>
                  <span style={{ fontWeight: 700, color: '#333' }}>{k.value}</span>
                  <span style={{ marginLeft: 4, fontSize: 9, color: k.confidence === 'H' ? '#28a745' : k.confidence === 'M' ? '#fd7e14' : '#dc3545' }}>[{k.confidence}]</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual field status */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 4, letterSpacing: '.08em', textTransform: 'uppercase' }}>Visual Fields</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {fieldStatuses.map(({ field, isEmpty }) => (
                <span key={field} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: isEmpty ? '#fff3cd' : '#d4edda', color: isEmpty ? '#856404' : '#155724', border: `1px solid ${isEmpty ? '#ffc107' : '#c3e6cb'}` }}>
                  {isEmpty ? '⚠' : '✓'} {field}
                </span>
              ))}
            </div>
          </div>

          {/* Verdict */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 4, letterSpacing: '.08em', textTransform: 'uppercase' }}>Verdict</div>
            <div style={{ fontSize: 11, color: '#333' }}>
              <span style={{ fontWeight: 700, color: verdictColor }}>{verdict}</span>
              <span style={{ marginLeft: 8 }}>{db.verdictRow?.finding || '—'}</span>
            </div>
          </div>

          {/* Raw JSON */}
          <details style={{ marginTop: 8 }}>
            <summary style={{ fontSize: 10, color: '#666', cursor: 'pointer', fontWeight: 700 }}>Raw JSON (full DATA_BLOCK)</summary>
            <pre style={{ fontSize: 10, background: '#fff', border: '1px solid #dee2e6', borderRadius: 4, padding: 10, marginTop: 6, overflow: 'auto', maxHeight: 300, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(db, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default function AdvisorSprint() {
  const [company, setCompany] = useState("");
  const [acquirer, setAcquirer] = useState("");
  const [parentCo, setParentCo] = useState("");
  const [parentSince, setParentSince] = useState(""); // year brand joined parent, e.g. "2018"
  const [companyMode, setCompanyMode] = useState("standalone"); // "standalone" | "acquired" | "parent"
  const [context, setContext] = useState("");

  const [appState, setAppState] = useState("idle");
  const [testMode, setTestMode] = useState(false);
  const [market, setMarket] = useState("India"); // India | US | Global // TEST MODE: runs only Agent 1 (market) to verify visuals cheaply
  const [results, setResults] = useState({});
  const [dataBlocks, setDataBlocks] = useState({});
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [briefPdfGenerating, setBriefPdfGenerating] = useState(false);
  const [retryingBrief, setRetryingBrief] = useState(false);
  const [thinkingBlocks, setThinkingBlocks] = useState({});   // synopsis + brief thinking traces
  const [toolLogs, setToolLogs] = useState({});               // per-agent search/fetch logs
  const [gapAnalysis, setGapAnalysis] = useState(null);       // Agent 12 output
  const [tracePdfGenerating, setTracePdfGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [gapAnalysisRunning, setGapAnalysisRunning] = useState(false);
  const [sources, setSources] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [elapsed, setElapsed] = useState(0);
  // Removed unused state: pdfs, setPdfs, userName, setUserName, showDash, setShowDash
  
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const toolLogsRef = useRef({});  // mirrors toolLogs state synchronously — avoids stale closure
  const sessionTokenRef = useRef(sessionStorage.getItem('sprint_token') || null); // avoids stale closure in callClaude
  // ── Auth ─────────────────────────────────────────────────────────────────
  const [sessionToken, setSessionToken] = useState(() => sessionStorage.getItem('sprint_token') || null);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [sprintCreditUsed, setSprintCreditUsed] = useState(() => sessionStorage.getItem('sprint_credit_used') === '1');

  // ── Conversational agent drawer ──────────────────────────────────────────
  const [drawerAgent, setDrawerAgent] = useState(null);
  const [drawerMessages, setDrawerMessages] = useState([]);
  const [drawerInput, setDrawerInput] = useState('');
  const [drawerLoading, setDrawerLoading] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    loadGA4();
    return () => style.remove();
  }, []);

  const callClaude = useCallback(async (prompt, agentId, signal) => {
    // MOCK mode — return canned response
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 1500));
      const mockId = AGENTS.find(a =>
        (a.id === 'market'      && prompt.includes('MARKET POSITION')) ||
        (a.id === 'portfolio'   && prompt.includes('PORTFOLIO')) ||
        (a.id === 'brand'       && prompt.includes('BRAND POSITIONING')) ||
        (a.id === 'margins'     && prompt.includes('MARGIN IMPROVEMENT')) ||
        (a.id === 'growth'      && prompt.includes('GROWTH STRATEGY')) ||
        (a.id === 'competitive' && prompt.includes('COMP')) ||
        (a.id === 'synergy'     && prompt.includes('SYNERGY')) ||
        (a.id === 'synopsis'    && prompt.includes('EXECUTIVE SYNOPSIS')) ||
        (a.id === 'platform'    && prompt.includes('D2C BRAND INCUBATOR')) ||
        (a.id === 'intl'        && prompt.includes('INTERNATIONAL BENCHMARKS')) ||
        (a.id === 'brief'       && prompt.includes('CEO OPPORTUNITY BRIEF'))
      )?.id || 'market';
      return MOCK[mockId] || MOCK.market;
    }

    // Real mode — up to 2 attempts, each covering fetch + full stream read.
    // Attempt 2 only fires on network-class errors (ERR_NETWORK_CHANGED, QUIC, WiFi handoff).
    // API errors (rate limit, billing, server errors) are NOT retried client-side — server handles those.
    const MAX_NET_ATTEMPTS = 2;
    const RETRY_DELAYS = [8000]; // 8s before attempt 2
    let fullText = '';

    for (let attempt = 1; attempt <= MAX_NET_ATTEMPTS; attempt++) {
      if (signal.aborted) break;
      if (attempt > 1) {
        const delay = RETRY_DELAYS[attempt - 2];
        console.warn(`[${agentId}] Network retry ${attempt}/${MAX_NET_ATTEMPTS} in ${delay/1000}s…`);
        setStatuses(s => ({ ...s, [agentId]: `network error — retrying (${attempt-1}/${MAX_NET_ATTEMPTS-1})…` }));
        await new Promise(r => setTimeout(r, delay));
        if (signal.aborted) break;
      }

      let res;
      try {
        res = await fetch(API_URL, {
          method: 'POST',
          headers: authHeaders({ 'x-tool-name': 'advisor', 'Connection': 'keep-alive' }),
          signal,
          body: JSON.stringify({ prompt, agentId, market }),
        });
      } catch (fetchErr) {
        if (signal.aborted) throw fetchErr;
        if (attempt === MAX_NET_ATTEMPTS) throw fetchErr;
        continue; // retry
      }

      if (!res.ok) {
        const err = await res.text().catch(() => '');
        throw new Error(err || `Server error: ${res.status}`);
      }

      // Read the SSE stream — catch mid-stream network drops and retry whole request
      let streamFailed = false;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      fullText = ''; // reset on each attempt

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (signal.aborted) { reader.cancel(); break; }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep incomplete line

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === 'chunk')     fullText += event.text;
              if (event.type === 'searching') setStatuses(s => ({ ...s, [agentId]: `searching: ${event.query.slice(0,40)}…` }));
              if (event.type === 'retrying')  setStatuses(s => ({ ...s, [agentId]: event.message || 'API overloaded — retrying…' }));
              if (event.type === 'thinking')  setThinkingBlocks(t => ({ ...t, [event.agentId]: event.text }));
              if (event.type === 'toollog') {
                toolLogsRef.current = { ...toolLogsRef.current, [event.agentId]: event.log };
                setToolLogs(l => ({ ...l, [event.agentId]: event.log }));
              }
              if (event.type === 'done') {
                fullText = event.text || fullText;
              }
              if (event.type === 'source' && event.url) {
                setSources(prev => {
                  if (prev.find(s => s.url === event.url)) return prev;
                  return [...prev, { url: event.url, title: event.title, agent: event.agent }];
                });
              }
              if (event.type === 'error') {
                if (event.message?.includes('rate_limit')) throw new Error('RATE_LIMIT:' + event.message);
                throw new Error(event.message);
              }
            } catch (e) {
              if (e.message && !e.message.startsWith('JSON')) throw e;
            }
          }
        }
      } catch (streamErr) {
        reader.cancel().catch(() => {});
        if (signal.aborted) throw streamErr;
        // Mid-stream network drop (ERR_NETWORK_CHANGED, QUIC etc) — retry if attempts remain
        // Only retry on pure network errors — not on API/server errors
        // Server errors (rate limit, billing, overload) are handled server-side
        const isNetworkDrop = streamErr.message?.includes('network') ||
          streamErr.message?.includes('Network') ||
          streamErr.message?.includes('fetch') ||
          streamErr.message?.includes('ERR_') ||
          streamErr.message?.includes('QUIC') ||
          (streamErr.name === 'TypeError' && !streamErr.message?.includes('rate') &&
           !streamErr.message?.includes('credit') && !streamErr.message?.includes('billing'));
        if (attempt < MAX_NET_ATTEMPTS && isNetworkDrop) {
          streamFailed = true;
        } else {
          throw streamErr; // non-network error or out of retries — propagate
        }
      }

      if (!streamFailed) break; // stream completed cleanly — done
    } // end retry loop

    return fullText;
  }, [setSources, setStatuses]); // uses sessionTokenRef.current to avoid stale closure

  const runAgent = useCallback(async (id, prompt, signal, docs) => {
    try {
      const text = await callClaude(prompt, id, signal);
      if (!signal.aborted) {
        // Strip DATA_BLOCK from display — keep only prose for reader
        const dbMatch = text.match(/<<<DATA_BLOCK>>>\s*```json([\s\S]*?)```\s*<<<END_DATA_BLOCK>>>|<<<DATA_BLOCK>>>([\s\S]*?)<<<END_DATA_BLOCK>>>|<<<DATA_BLOCK>>>\s*(\{[\s\S]*\})/);
        const cleanText = text.replace(/<<<DATA_BLOCK>>>[\s\S]*?<<<END_DATA_BLOCK>>>/g, '').trim();
        if (dbMatch) {
          try {
            const raw = (dbMatch[1] || dbMatch[2] || dbMatch[3] || '').trim();
            const cleaned = raw.replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'').trim();
            const parsed = JSON.parse(repairJson(cleaned));
            setDataBlocks(d => ({ ...d, [id]: parsed }));
            console.log('[DataBlock] parsed OK:', id);
          } catch(e) {
            console.warn('[DataBlock] parse failed:', id, e.message);
            // Fallback: create minimal dataBlock so visuals still render
            setDataBlocks(d => ({ ...d, [id]: {
              agent: id,
              kpis: [{ label: 'Analysis', value: '✓', sub: 'See prose below', trend: 'flat', confidence: 'M' }],
              verdictRow: { dimension: id, verdict: 'WATCH', finding: 'DATA_BLOCK parse failed — see full analysis below', confidence: 'L' },
              topActions: [{ action: 'Review full analysis below', impact: 50, speed: 50, confidence: 'L' }]
            }}));
          }
        } else {
          console.warn('[DataBlock] not found in response:', id);
          // Fallback: minimal block so page still renders
          setDataBlocks(d => ({ ...d, [id]: {
            agent: id,
            kpis: [{ label: 'Analysis Complete', value: '✓', sub: 'Data block not generated', trend: 'flat', confidence: 'L' }],
            verdictRow: { dimension: id, verdict: 'WATCH', finding: 'Structured data not available — full analysis in prose below', confidence: 'L' },
            topActions: [{ action: 'Review full prose analysis below', impact: 50, speed: 50, confidence: 'L' }]
          }}));
        }
        setResults(r => ({ ...r, [id]: cleanText }));
        setStatuses(s => ({ ...s, [id]: "done" }));
        gaEvent("agent_completed", { agent: id, company, chars: text.length });
      }
      return text;
    } catch (e) {
      if (e.name === "AbortError") return "";
      setStatuses(s => ({ ...s, [id]: "error" }));
      setResults(r => ({ ...r, [id]: `Error: ${e.message}` }));
      throw e; // propagate — sprint loop must know an agent failed
    }
  }, [company, callClaude]);

  const generateBriefPDF = async () => {
    if (briefPdfGenerating) return;
    setBriefPdfGenerating(true);
    gaEvent("brief_pdf_generate", { company });
    try {
      // Re-parse brief DATA_BLOCK from sessionStorage — same approach as trace PDF.
      // This handles the case where repairJson failed during the sprint but the raw
      // text is intact in sessionStorage (which is what the trace already confirmed).
      let resolvedDataBlocks = { ...dataBlocks };
      let resolvedResults    = { ...results };
      try {
        const saved = sessionStorage.getItem(`sprint_${company.trim()}`);
        if (saved) {
          const w1 = JSON.parse(saved);
          // Re-parse every agent DATA_BLOCK from raw text
          Object.entries(w1).forEach(([id, raw]) => {
            if (typeof raw !== 'string') return;
            // Restore prose result
            const cleanText = raw.replace(/<<<DATA_BLOCK>>>[\s\S]*?<<<END_DATA_BLOCK>>>/g, '').trim();
            if (cleanText) resolvedResults[id] = cleanText;
            // Re-parse DATA_BLOCK
            const m = raw.match(/<<<DATA_BLOCK>>>\s*```json([\s\S]*?)```\s*<<<END_DATA_BLOCK>>>|<<<DATA_BLOCK>>>([\s\S]*?)<<<END_DATA_BLOCK>>>|<<<DATA_BLOCK>>>\s*(\{[\s\S]*\})/);
            if (m) {
              try {
                const parsed = JSON.parse(repairJson((m[1]||m[2]||m[3]||'').trim().replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'')));
                resolvedDataBlocks[id] = parsed;
              } catch(e) {
                console.warn('[BriefPDF] re-parse failed for', id, e.message);
              }
            }
          });
        }
      } catch(e) { console.warn('[BriefPDF] sessionStorage read:', e.message); }

      // Verify we actually have brief data before rendering
      const briefDb = resolvedDataBlocks['brief'] || {};
      const hasBriefData = Array.isArray(briefDb.kpis) && briefDb.kpis.length > 0 &&
                           briefDb.kpis[0]?.label !== 'Analysis Complete' &&
                           briefDb.kpis[0]?.sub !== 'Data block not generated';
      const hasBriefProse = (resolvedResults['brief'] || '').length > 100;

      // Recovery: if DATA_BLOCK is empty but prose exists, the brief was truncated mid-output.
      // Build a minimal DATA_BLOCK from what the thinking stream computed so the PDF renders.
      if (!hasBriefData && hasBriefProse) {
        console.warn('[BriefPDF] DATA_BLOCK empty but prose present — brief was truncated. Building minimal dataBlock for render.');
        const prose = resolvedResults['brief'] || '';
        // Extract bold statement if present in prose
        const boldMatch = prose.match(/\*\*BOLD STATEMENT[:\*]*\*\*\s*([^\n]+)/i) ||
                          prose.match(/BOLD STATEMENT[:\s]+([^\n]+)/i);
        const boldStatement = boldMatch ? boldMatch[1].trim() : '';
        // Build minimal brief dataBlock so buildBriefHtml renders gracefully
        resolvedDataBlocks['brief'] = {
          agent: 'brief',
          verdictRow: { dimension: 'CEO Opportunity Brief', verdict: 'WATCH', 
            finding: boldStatement || 'Brief output was truncated — see prose analysis below for full findings.', confidence: 'M' },
          kpis: [{ label: 'Brief Status', value: 'See Prose', sub: 'The brief agent completed but output was truncated before the DATA_BLOCK was fully written. Run Retry Brief to regenerate.', trend: 'watch', confidence: 'L' }],
          occasionWheel: [], gapTable: [], marketSignals: [], institutionalEdge: [],
          radarAxes: [
            {axis:'Occasion Coverage',today:0,future:0},{axis:'Trend Alignment',today:0,future:0},
            {axis:'Channel Reach',today:0,future:0},{axis:'Format Range',today:0,future:0},
            {axis:'Price Architecture',today:0,future:0},{axis:'Competitive Moat',today:0,future:0}
          ],
          moves: [], arrivalSequence: [],
          sectionHeaders: { occasionWheel:'', gapTable:'', marketSignals:'', institutionalEdge:'', radarGap:'' },
          categoryRead: { globalTrend:'', leadMarket:'', homeMarketLag:'', implication:'' },
          page1Summary: boldStatement || 'Brief output truncated — use Retry Brief to regenerate the full brief.',
          boldStatement: boldStatement || 'Brief output truncated. Use ↻ Retry Brief button to regenerate.',
          topActions: [{ action: 'Click ↻ Retry Brief to regenerate the full Opportunity Brief', impact: 100, speed: 100, confidence: 'H' }],
          _truncated: true,
        };
      } else if (!hasBriefData && !hasBriefProse) {
        throw new Error('Brief data not found. The brief agent may not have completed successfully. Click ↻ Retry Brief to try again, or run a new sprint.');
      }
      const html = buildBriefHtml({ company, acquirer, parentCo, companyMode, results: resolvedResults, dataBlocks: resolvedDataBlocks, market });
      const pdfRes = await fetch(API_URL.replace('/api/claude', '/api/pdf'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ html, filename: `${company.replace(/\s+/g,'-')}-CEO-Brief.pdf` }),
        signal: AbortSignal.timeout(120000),
      });
      if (!pdfRes.ok) {
        const errBody = await pdfRes.json().catch(() => ({ error: `Server error ${pdfRes.status}` }));
        throw new Error(errBody.error || `Brief PDF failed — server ${pdfRes.status}`);
      }
      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${company.replace(/\s+/g,'-')}-CEO-Brief.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Brief PDF failed: ' + e.message);
    } finally {
      setBriefPdfGenerating(false);
    }
  };

  const runSprint = async () => {
    if (!company.trim() || appState === "running") return;
    // Warn if results already exist — re-run costs full credits
    if (Object.keys(results).length > 0) {
      const confirmed = window.confirm(
        `Re-running will cost full credits (~$6) and overwrite the existing ${company.trim()} analysis.\n\nAre you sure?`
      );
      if (!confirmed) return;
    }
    if (abortRef.current) abortRef.current.abort(); // kill any zombie from previous run

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const signal = ctrl.signal;
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    let wakeLock = null;
    try {
      if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    } catch(wlErr) { console.warn('[WakeLock]', wlErr.message); }
    
    setAppState("preparing");
    setResults({});
    setSources([]);
    setElapsed(0);
    setThinkingBlocks({});
    setToolLogs({});
    toolLogsRef.current = {};
    setGapAnalysis(null);
    setGapAnalysisRunning(false);  // reset stale state from any prior sprint

    // Wake Render backend — free tier sleeps after 15min inactivity
    try {
      await Promise.race([
        fetch(API_URL.replace('/api/claude', '/')),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 35000))
      ]);
    } catch (e) { console.warn('wake-up ping:', e.message); }

    const co = company.trim();
    const acq = acquirer.trim();
    const ctx = context.trim();
    
    gaEvent("sprint_launched", {
      company: co,
      user: "anonymous",
      pdfs_uploaded: 0,
      has_context: ctx.length > 0,
    });

    const initStatus = {};
    const agentsToRun = testMode ? ['market'] : AGENTS.map(a => a.id);
    AGENTS.forEach(a => initStatus[a.id] = agentsToRun.includes(a.id) ? "queued" : "idle");
    setStatuses(initStatus);

    try {
      setAppState("running");
      
      // All agents run sequentially — one at a time with gap to respect 30k/min rate limit
      const w1texts = {};
      const ALL_AGENTS_ORDERED = testMode
        ? ['market']  // TEST MODE: single agent to verify visuals cheaply
        : [...W1, ...W2, 'synopsis', 'brief'];

      // ── AGENT 0: Category & Competitive Framing — runs first, before all others ──
      let framingBlock = "";
      if (!testMode) {
        setStatuses(s => ({ ...s, framing: "running" }));
        try {
          const framingPrompt = makePrompt('framing', co, acq, ctx, {}, market, parentCo.trim(), companyMode, parentSince.trim(), "");
          const framingText = await runAgent('framing', framingPrompt, signal, []);
          // Extract the FRAMING_BLOCK from the output
          const framingMatch = framingText.match(/<<<FRAMING_BLOCK>>>([\s\S]*?)<<<END_FRAMING_BLOCK>>>/);
          framingBlock = framingMatch ? framingMatch[1].trim() : framingText.trim();
          w1texts['framing'] = framingText;
          setStatuses(s => ({ ...s, framing: "done" }));
          // Short gap before Wave 1
          if (!signal.aborted) await new Promise(r => setTimeout(r, 30000));
        } catch(framingErr) {
          console.error('[Sprint] Framing agent failed:', framingErr.message);
          // Non-fatal — continue without framing block, mark as error visually
          setStatuses(s => ({ ...s, framing: "error" }));
        }
      }

      let totalApiCalls = 0;          // guard against runaway retry loops
      const MAX_SPRINT_API_CALLS = 18; // 12 agents + framing + 2 retries headroom

      for (const id of ALL_AGENTS_ORDERED) {
        if (signal.aborted) break;

        totalApiCalls++;
        if (totalApiCalls > MAX_SPRINT_API_CALLS) {
          console.error(`[Sprint] API call limit reached (${totalApiCalls}) — aborting to prevent runaway spend`);
          alert(`Safety stop: the sprint made more than ${MAX_SPRINT_API_CALLS} API calls, which may indicate a retry loop. The sprint has been stopped to protect your credits. Please check the console and contact support if this repeats.`);
          abortRef.current?.abort();
          setAppState("error");
          return;
        }

        setStatuses(s => ({ ...s, [id]: "running" }));

        // synopsis gets all prior outputs; W2 agents get W1 outputs; W1 gets nothing
        // For synopsis: trim each agent output to 2500 chars to reduce prompt size
        // and avoid QUIC timeout on very long Opus requests
        let ctx_for_agent = {};
        if (id === 'brief') {
          ctx_for_agent = w1texts; // brief receives all agent outputs INCLUDING synopsis
        } else if (id === 'synopsis') {
          ctx_for_agent = w1texts; // Full outputs passed — makePrompt handles per-agent trimming
        } else if (W2.includes(id)) {
          ctx_for_agent = w1texts;
        }
        const prompt = makePrompt(id, co, acq, ctx, ctx_for_agent, market, parentCo.trim(), companyMode, parentSince.trim(), framingBlock);
        let text = "";
        try {
          text = await runAgent(id, prompt, signal, []);
        } catch(agentErr) {
          // Agent failed — mark it as error, stop the sprint
          console.error(`[Sprint] Agent ${id} failed:`, agentErr.message);
          setStatuses(s => ({ ...s, [id]: "error" }));
          setAppState("error");
          return; // exits runSprint entirely — no more API calls
        }
        w1texts[id] = text;

        // Persist raw agent text to sessionStorage after every agent —
        // trace PDF and retry flows read from here as the reliable source
        try {
          sessionStorage.setItem(`sprint_${co}`, JSON.stringify(w1texts));
          // Also persist toolLogs — trace PDF needs search counts even if state refreshed
          sessionStorage.setItem(`toolLogs_${co}`, JSON.stringify(toolLogsRef.current));
        } catch(e) { console.warn('[sessionStorage] write failed:', e.message); }

        // Gap after each agent — keeps tokens under rate limit (skip in test mode)
        if (!signal.aborted && id !== 'synopsis') {
          setStatuses(s => ({ ...s, [id]: "done" }));
          if (!testMode) await new Promise(r => setTimeout(r, 60000));
        }
        // Synopsis excluded from gap block above — set done explicitly
        if (!signal.aborted && id === 'synopsis') {
          setStatuses(s => ({ ...s, synopsis: "done" }));
        }
      }

      if (!signal.aborted) {
        setAppState("done");
        if (wakeLock) { try { await wakeLock.release(); } catch(e) {} wakeLock = null; }
        markSprintComplete();
        gaEvent("sprint_completed", { company: co, time_seconds: elapsed });
        // Do NOT remove sessionStorage here — brief and trace PDFs need it for re-parsing
        // It will be overwritten when the next sprint starts
        // Trigger Agent 12 gap analysis — only if context was provided (otherwise nothing to compare)
        if (ctx && ctx.trim().length > 50) {
          try {
            const briefRaw = w1texts['brief'] || '';
            const dbM = briefRaw.match(/<<<DATA_BLOCK>>>\s*```json([\s\S]*?)```\s*<<<END_DATA_BLOCK>>>|<<<DATA_BLOCK>>>([\s\S]*?)<<<END_DATA_BLOCK>>>|<<<DATA_BLOCK>>>\s*(\{[\s\S]*\})/);
            const briefDB = dbM ? (() => { try { return JSON.parse(repairJson((dbM[1]||dbM[2]||dbM[3]||'').trim().replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'').trim())); } catch(e) { return {}; } })() : {};
            const synopsisText = (w1texts['synopsis'] || '').replace(/<<<DATA_BLOCK>>>[\s\S]*?<<<END_DATA_BLOCK>>>/g,'').trim();
            runGapAnalysis(co, ctx, synopsisText, briefDB);
          } catch(e) { console.warn('[Agent12 trigger]', e.message); }
        }
        // sessionStorage kept intact — brief and trace PDFs re-parse from it
      }

    } catch (e) {
      console.error("Sprint error:", e);
      if (wakeLock) { try { await wakeLock.release(); } catch(wlErr) {} }
      setAppState("error");
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // ── AGENT 12: GAP ANALYSIS ──────────────────────────────────────────
  const runGapAnalysis = async (co, ctx, synopsisText, briefDataBlock) => {
    setGapAnalysisRunning(true);
    const prompt = `You are a prompt engineering advisor reviewing an AI sprint output.
You have three inputs:
1. The context brief the user provided before the sprint
2. The synopsis the AI produced
3. The opportunity brief DATA_BLOCK the AI produced

Your job: answer exactly three questions with specific, actionable bullets. No preamble. No summary. Start immediately with Question 1.

## CONTEXT BRIEF PROVIDED BY USER
${ctx || '(no context provided)'}

## SYNOPSIS OUTPUT (trimmed)
${(synopsisText || '').slice(0, 6000)}

## OPPORTUNITY BRIEF DATA_BLOCK
${JSON.stringify(briefDataBlock || {}, null, 2).slice(0, 3000)}

---

## QUESTION 1: WHAT THE BRIEF SURFACED THAT YOUR CONTEXT DIDN'T PROVIDE
List specific facts, figures, or competitors the AI found independently that were NOT in your context brief. For each: state the finding and flag whether it should be verified (found via search) or is likely reliable (well-known fact).

## QUESTION 2: WHAT YOUR CONTEXT PROVIDED THAT THE BRIEF DIDN'T USE
List specific points from your context brief that did not appear in the brief output. For each: state why it likely wasn't used (too generic, contradicted by data, framing issue) and whether it should be made more explicit next time.

## QUESTION 3: WHAT TO ADD OR CHANGE IN YOUR CONTEXT BRIEF NEXT TIME
Specific, copy-paste-ready suggestions. Format each as:
ADD: "..." — why this would improve output
REMOVE: "..." — why this is not helping
REFRAME: "..." → "..." — how to sharpen the instruction`;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: authHeaders({ 'x-tool-name': 'advisor' }),
        body: JSON.stringify({ prompt, agentId: 'gap_analysis', market }),
        signal: AbortSignal.timeout(180000),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(line.slice(6));
            if (ev.type === 'chunk') fullText += ev.text;
            if (ev.type === 'done') fullText = ev.text || fullText;
          } catch(e) {}
        }
      }
      setGapAnalysis(fullText.trim());
    } catch(e) {
      console.warn('[Agent12] Gap analysis failed:', e.message);
      setGapAnalysis('Gap analysis failed — run again or check console.');
    } finally {
      setGapAnalysisRunning(false);
      // Signal to generateTracePDF wait loop that gap analysis is done
      try { sessionStorage.setItem('gapAnalysisDone', '1'); } catch(e) {}
    }
  };


  // ── AGENT DRAWER HELPERS ─────────────────────────────────────────────────

  const getAgentSummary = (agentId) => {
    const raw = results[agentId] || '';
    if (!raw) return '';
    const clean = raw
      .replace(/<<<DATA_BLOCK>>>[\s\S]*?<<<END_DATA_BLOCK>>>/g, '')
      .replace(/◉◉ VERDICT_STAMP[\s\S]*?◉◉ END_STAMP/g, '')
      .trim();
    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [];
    const summary = sentences.slice(0, 2).join(' ').trim();
    return summary.slice(0, 320) || clean.slice(0, 280);
  };

  const getSuggestedQuestions = (agentId) => {
    const db = dataBlocks[agentId] || {};
    const kpis = Array.isArray(db.kpis) ? db.kpis : [];
    const verdict = db.verdictRow || {};
    const questions = [];

    if (kpis[0]?.label && kpis[0]?.value) {
      questions.push(`How did you calculate ${kpis[0].label} of ${kpis[0].value}?`);
    } else {
      questions.push(`What is your single most important finding for ${company}?`);
    }

    const lowConf = kpis.find(k => k.confidence === 'L' || k.confidence === 'M');
    if (lowConf?.label) {
      questions.push(`Your confidence on ${lowConf.label} was ${lowConf.confidence} — what would make it H?`);
    } else if (verdict.finding) {
      questions.push(`What is the evidence behind: "${verdict.finding.slice(0, 60)}${verdict.finding.length > 60 ? '...' : ''}"?`);
    } else {
      questions.push('What data were you unable to verify through web search?');
    }

    const agentImplications = {
      framing:     `What is the single biggest misconception about ${company}'s category that this analysis corrects?`,
      market:      `What is the most important category shift ${company} must respond to in the next 18 months?`,
      portfolio:   `Which SKU in ${company}'s portfolio should be killed first and why?`,
      brand:       `What is the biggest gap between how ${company} positions itself and how consumers see it?`,
      margins:     `What is the single highest-impact action ${company} can take to improve gross margins?`,
      growth:      `Which growth channel is most underinvested relative to its potential for ${company}?`,
      competitive: `What is the most plausible way a competitor breaks ${company}'s market position?`,
      synergy:     `What is the single most valuable untapped synergy asset for ${company}?`,
      platform:    `What platform bet should ${company} make that it has not yet made?`,
      intl:        `Which international market is the best analog for ${company}'s next move?`,
      synopsis:    `Where did agents disagree most and how did you resolve the tension?`,
    };
    questions.push(agentImplications[agentId] || `What is the most important implication of your analysis for ${company}?`);

    return questions;
  };

  const buildAgentSystemPrompt = (agentId) => {
    const agentMeta = AGENTS.find(a => a.id === agentId) || {};
    const PROSE_CAP = agentId === 'synopsis' ? 4000 : agentId === 'brief' ? 3000 : 6000;
    const prose = (results[agentId] || '')
      .replace(/<<<DATA_BLOCK>>>[\s\S]*?<<<END_DATA_BLOCK>>>/g, '')
      .replace(/◉◉ VERDICT_STAMP[\s\S]*?◉◉ END_STAMP/g, '')
      .trim();
    const db = dataBlocks[agentId] || {};
    const thinking = thinkingBlocks[agentId] || '';
    const toolLog = toolLogs[agentId] || [];

    const dataBlockStr = Object.keys(db).length > 0
      ? `

STRUCTURED DATA (your DATA_BLOCK output):
${JSON.stringify(db, null, 2)}`
      : '';
    const thinkingStr = thinking
      ? `

YOUR REASONING TRACE:
${thinking.slice(0, 4000)}${thinking.length > 4000 ? '\n[...truncated...]' : ''}`
      : '';
    const searchStr = toolLog.length > 0
      ? `

WEB SEARCHES YOU PERFORMED:
${toolLog.map((t,i) => `${i+1}. "${t.query}" — ${t.results?.length || 0} results`).join('\n')}`
      : '';

    return `You are the ${agentMeta.label || agentId} agent from an AdvisorSprint analysis of ${company}${market ? ` (${market} market)` : ''}, a consumer packaged goods brand.

CRITICAL RULES — follow these exactly:
1. You can ONLY answer based on what you actually found and wrote in this sprint. Do not invent new data, statistics, or findings.
2. If asked about something not in your output, say clearly: "I did not analyse that in this sprint — my scope was [your scope]."
3. If a number came from a web search result, say so. If it was estimated or derived, say so and show the arithmetic.
4. If your confidence was L or M on something, explain why and what would change it to H.
5. Keep answers concise — 3-5 sentences unless the user asks for detail.
6. Never speculate beyond what your output supports. Qualify everything uncertain with "estimated", "derived", or "not confirmed".
7. If the user asks about something not visible in your output above, acknowledge the analysis may be truncated and direct them to the full report.

YOUR FULL ANALYSIS OUTPUT:
${prose.slice(0, PROSE_CAP)}${prose.length > PROSE_CAP ? '\n[...truncated — full analysis in report...]' : ''}${dataBlockStr}${thinkingStr}${searchStr}`;
  };

  const sendDrawerMessage = async () => {
    if (!drawerInput.trim() || drawerLoading || !drawerAgent) return;
    const userMessage = drawerInput.trim();
    setDrawerInput('');
    const newMessages = [...drawerMessages, { role: 'user', content: userMessage }];
    setDrawerMessages([...newMessages, { role: 'assistant', content: '', isStreaming: true }]);
    setDrawerLoading(true);
    try {
      const systemPrompt = buildAgentSystemPrompt(drawerAgent);
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const response = await fetch(API_URL.replace('/api/claude', '/api/chat'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          system: systemPrompt,
          messages: apiMessages,
          model: 'claude-sonnet-4-6',
          max_tokens: 600,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) {
        const err = await response.text().catch(() => '');
        throw new Error(err || `Server error ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullReply = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'chunk') {
              fullReply += event.text;
              setDrawerMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: fullReply, isStreaming: true };
                return updated;
              });
            }
            if (event.type === 'done') fullReply = event.text || fullReply;
            if (event.type === 'error') throw new Error(event.message || 'Stream error');
          } catch(parseErr) {
            if (parseErr.message !== 'Stream error' && !parseErr.message.startsWith('JSON')) continue;
            throw parseErr;
          }
        }
      }
      setDrawerMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: fullReply, isStreaming: false };
        return updated;
      });
    } catch(e) {
      setDrawerMessages(prev => {
        const updated = [...prev.filter(m => !m.isStreaming)];
        return [...updated, { role: 'assistant', content: `Unable to get a response: ${e.message}. Please try again.`, isError: true }];
      });
    } finally {
      setDrawerLoading(false);
    }
  };

  const openDrawer = (agentId) => {
    setDrawerAgent(agentId);
    setDrawerMessages([]);
    setDrawerInput('');
    setDrawerLoading(false);
  };

  const closeDrawer = () => {
    setDrawerAgent(null);
    setDrawerMessages([]);
    setDrawerInput('');
  };


  // ── AUTH HELPERS ─────────────────────────────────────────────────────────

  const authHeaders = (extra = {}) => ({
    'Content-Type': 'application/json',
    'x-session-token': sessionTokenRef.current || sessionToken || '',
    ...extra,
  });

  const handleAuth = async () => {
    if (!authPassword.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(API_URL.replace('/api/claude', '/api/auth'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      sessionStorage.setItem('sprint_token', data.token);
      sessionTokenRef.current = data.token;
      setSessionToken(data.token);
    } catch(e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const markSprintComplete = async () => {
    if (sprintCreditUsed) return;
    try {
      const res = await fetch(API_URL.replace('/api/claude', '/api/sprint-complete'), {
        method: 'POST',
        headers: authHeaders(),
      });
      if (res.status === 403) {
        sessionStorage.setItem('sprint_credit_used', '1');
        setSprintCreditUsed(true);
      } else if (res.ok) {
        sessionStorage.setItem('sprint_credit_used', '1');
        setSprintCreditUsed(true);
      }
    } catch(e) { console.warn('[SprintComplete]', e.message); }
  };

  const saveSprint = async () => {
    if (shareLoading) return;
    setShareLoading(true);
    try {
      const res = await fetch(API_URL.replace('/api/claude', '/api/save-sprint'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          company: company.trim(),
          tool: 'consumer',
          sector: market,
          results,
          dataBlocks,
          thinking: thinkingBlocks,
          toolLogs,
          sources,
          elapsed,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setShareUrl(data.shareUrl);
      setShowShareModal(true);
    } catch(e) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setShareLoading(false);
    }
  };

  const retryBrief = async () => {
    if (retryingBrief) return;
    setRetryingBrief(true);
    setAppState("running");
    const co = company.trim();
    const acq = acquirer.trim();
    const ctx = context.trim();
    try {
      const saved = sessionStorage.getItem(`sprint_${co}`);
      if (!saved) throw new Error("No saved sprint data — please re-run the full sprint");
      const w1texts = JSON.parse(saved);
      if (!w1texts['synopsis']) throw new Error("Synopsis missing — please re-run the full sprint");
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const signal = ctrl.signal;
      setStatuses(s => ({ ...s, brief: "running" }));
      const prompt = makePrompt('brief', co, acq, ctx, w1texts, market, parentCo.trim(), companyMode, parentSince.trim(), w1texts['framing'] || '');
      await runAgent('brief', prompt, signal, []);
      setStatuses(s => ({ ...s, brief: "done" }));
      setAppState("done");
    } catch(e) {
      console.error("[RetryBrief]", e.message);
      alert(`Retry failed: ${e.message}`);
      setAppState("error");
    } finally {
      setRetryingBrief(false);
    }
  };

  // ── BUILD TRACE PDF HTML ─────────────────────────────────────────────
  const buildTracePdfHtml = (co, acq, ctx, allDataBlocks, allThinking, allToolLogs, gapText, elapsed) => {
    const date = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
    const navy = '#0f1f3d', forest = '#1a3a2a', amber = '#d97706', coral = '#b85c38';
    const confColor = v => v==='H'?'#16a34a':v==='M'?amber:'#dc2626';
    const confBg    = v => v==='H'?'#dcfce7':v==='M'?'#fef3c7':'#fee2e2';

    // ── DEPENDENCY MAP — what each agent actually received as input ────────
    // W1 agents: framing block only (no prior agent outputs)
    // W2 agents: all W1 outputs
    // Synopsis:  all W1 + W2 outputs
    // Brief:     all W1 + W2 + Synopsis outputs
    const AGENT_INPUTS = {
      framing:    [],
      market:     ['framing'],
      portfolio:  ['framing'],
      brand:      ['framing'],
      margins:    ['framing'],
      growth:     ['framing'],
      competitive:['framing'],
      synergy:    ['framing','market','portfolio','brand','margins','growth','competitive'],
      platform:   ['framing','market','portfolio','brand','margins','growth','competitive'],
      intl:       ['framing','market','portfolio','brand','margins','growth','competitive'],
      synopsis:   ['framing','market','portfolio','brand','margins','growth','competitive','synergy','platform','intl'],
      brief:      ['framing','market','portfolio','brand','margins','growth','competitive','synergy','platform','intl','synopsis'],
    };
    const AGENT_SHORT = {
      framing:'Framing', market:'Market', portfolio:'Portfolio', brand:'Brand',
      margins:'Margins', growth:'Growth', competitive:'Competitive',
      synergy:'Synergy', platform:'Platform', intl:"Int'l",
      synopsis:'Synopsis', brief:'Brief',
    };
    const AGENT_WAVE = {
      framing:0, market:1, portfolio:1, brand:1, margins:1, growth:1, competitive:1,
      synergy:2, platform:2, intl:2, synopsis:3, brief:4,
    };

    // ── CONTRADICTION KEYWORDS — scan thinking for these ─────────────────
    const CONTRADICTION_KW = [
      'however','but ','contradict','disagree','tension','conflict','inconsistent',
      'discrepancy','conflicts with','at odds','diverges','on the other hand',
      'disputes','challenges the','not align','different from','rather than',
      'whereas','despite','although','nevertheless','yet ','revising',
      'reconsidering','question whether','uncertain whether',
    ];

    // ── HELPER: extract a sentence window around a keyword match ─────────
    const extractSnippets = (text, keywords, maxSnippets=5) => {
      if (!text) return [];
      const sentences = text.replace(/([.!?])\s+/g, '$1\n').split('\n').filter(s => s.trim().length > 20);
      const found = [];
      for (const s of sentences) {
        if (found.length >= maxSnippets) break;
        const lower = s.toLowerCase();
        const kw = keywords.find(k => lower.includes(k));
        if (kw) found.push({ sentence: s.trim().slice(0, 300), keyword: kw });
      }
      return found;
    };

    // ── SPRINT QUALITY SCORE ─────────────────────────────────────────────
    const ALL_AGENT_IDS = ['market','portfolio','brand','margins','growth','competitive','synergy','platform','intl','synopsis','brief'];
    let totalKpis = 0, highKpis = 0, medKpis = 0;
    ALL_AGENT_IDS.forEach(id => {
      const kpis = Array.isArray((allDataBlocks[id]||{}).kpis) ? allDataBlocks[id].kpis : [];
      kpis.forEach(k => {
        totalKpis++;
        if (k.confidence === 'H') highKpis++;
        else if (k.confidence === 'M') medKpis++;
      });
    });
    const agentsDone = ALL_AGENT_IDS.filter(id => allDataBlocks[id] && Object.keys(allDataBlocks[id]).length > 1).length;
    const totalSearches = Object.values(allToolLogs).reduce((s, logs) => s + (logs||[]).length, 0);
    const totalSources = Object.values(allToolLogs).reduce((s, logs) => s + (logs||[]).reduce((n, l) => n + (l.results||[]).length, 0), 0);
    // Fallback: if toolLogs empty, estimate search count from thinking stream text
    // The thinking stream contains "I'll search", "Let me search", "Now I'm running searches" etc.
    const searchCountFinal = totalSearches > 0 ? totalSearches : (() => {
      const allThinkingText = Object.values(allThinking).join(' ');
      const searchMentions = (allThinkingText.match(/(?:let me search|now i.m (?:running )?search|i.ll search|searching for|run.*search|web search|search results)/gi) || []).length;
      return searchMentions > 0 ? searchMentions : 0;
    })();
    const sourcesLabel = totalSources > 0 ? `${totalSources} sources retrieved` : (searchCountFinal > 0 ? 'from thinking stream' : '0 sources retrieved');
    const totalThinkingChars = Object.values(allThinking).reduce((s, t) => s + (t||'').length, 0);
    const qualityPct = totalKpis > 0 ? Math.round(((highKpis + medKpis) / totalKpis) * 100) : 0;
    const qualityColor = qualityPct >= 80 ? '#16a34a' : qualityPct >= 60 ? amber : '#dc2626';
    const qualityLabel = qualityPct >= 80 ? 'STRONG' : qualityPct >= 60 ? 'MODERATE' : 'THIN';

    // ── PAGE 1: COVER — heatmap + dependency diagram + quality score ─────
    const AGENTS_HEATMAP = ['market','portfolio','brand','margins','growth','competitive','synergy','platform','intl','synopsis','brief'];
    const AGENT_LABELS_HM = { market:'Market', portfolio:'Portfolio', brand:'Brand', margins:'Margins', growth:'Growth',
      competitive:'Competitive', synergy:'Synergy', platform:'Platform', intl:"Int'l", synopsis:'Synopsis', brief:'Brief' };

    const agentConf = {};
    AGENTS_HEATMAP.forEach(id => {
      const db = allDataBlocks[id] || {};
      const kpis = Array.isArray(db.kpis) ? db.kpis : [];
      const verdict = db.verdictRow?.confidence || null;
      const confs = kpis.map(k => k.confidence || '—');
      agentConf[id] = { kpis: confs, verdict, overall: verdict || (confs.length ? confs[0] : '—') };
    });

    const heatmapRows = AGENTS_HEATMAP.map(id => {
      const db = allDataBlocks[id] || {};
      const kpis = Array.isArray(db.kpis) ? db.kpis : [];
      const cells = kpis.slice(0,4).map(k => {
        const c = k.confidence || '—';
        const bg = c==='H'?'#dcfce7':c==='M'?'#fef3c7':c==='—'?'#f3f4f6':'#fee2e2';
        const col = c==='H'?'#16a34a':c==='M'?'#92400e':c==='—'?'#9ca3af':'#dc2626';
        return `<td style="padding:4px 6px;text-align:center;background:${bg};border:1px solid #e5e7eb;">
          <span style="font-size:8px;font-weight:800;color:${col};font-family:monospace;">${c}</span>
          <div style="font-size:5.5px;color:#6b7280;margin-top:1px;white-space:nowrap;overflow:hidden;max-width:55px;">${(k.label||'').slice(0,12)}</div>
        </td>`;
      }).join('');
      const padded = cells + '<td style="padding:4px 6px;background:#f9fafb;border:1px solid #e5e7eb;"></td>'.repeat(Math.max(0,4-kpis.slice(0,4).length));
      const ov = agentConf[id].overall;
      const ovBg = ov==='H'?'#dcfce7':ov==='M'?'#fef3c7':ov==='—'?'#f3f4f6':'#fee2e2';
      const ovCol = ov==='H'?'#16a34a':ov==='M'?'#92400e':ov==='—'?'#9ca3af':'#dc2626';
      // Verdict from DATA_BLOCK
      const verdictText = (db.verdictRow?.verdict || db.verdictRow?.finding || '').slice(0,60);
      return `<tr>
        <td style="padding:4px 8px;font-size:7.5px;font-weight:700;color:${navy};border:1px solid #e5e7eb;background:#f9fafb;white-space:nowrap;">${AGENT_LABELS_HM[id]||id}</td>
        <td style="padding:4px 6px;text-align:center;background:${ovBg};border:1px solid #e5e7eb;">
          <span style="font-size:9px;font-weight:900;color:${ovCol};font-family:monospace;">${ov}</span>
        </td>
        ${padded}
        <td style="padding:4px 8px;font-size:6px;color:#6b7280;border:1px solid #e5e7eb;max-width:130px;">${verdictText || kpis.map(k=>`<span style="color:${confColor(k.confidence||'—')};font-weight:600;">[${k.confidence||'—'}]</span> ${(k.label||'').slice(0,16)}`).join('<br>')}</td>
      </tr>`;
    }).join('');

    // ── DEPENDENCY DIAGRAM (SVG) ─────────────────────────────────────────
    // Wave lanes: W0=Framing, W1=6 agents, W2=3 agents, W3=Synopsis, W4=Brief
    // Rendered as horizontal SVG with arrows showing data flow
    const diagW = 680, diagH = 130;
    // Lane x positions
    const laneX = { 0:30, 1:140, 2:420, 3:540, 4:620 };
    // Agent box positions [id, x, y, w, h, color]
    const boxDefs = [
      { id:'framing',    x:10,  y:48, w:100, h:18, col:'#4c1d95', tc:'#fff', short:'Framing' },
      { id:'market',     x:148, y:8,  w:88,  h:16, col:navy, tc:'#fff', short:'Market' },
      { id:'portfolio',  x:148, y:28, w:88,  h:16, col:navy, tc:'#fff', short:'Portfolio' },
      { id:'brand',      x:148, y:48, w:88,  h:16, col:navy, tc:'#fff', short:'Brand' },
      { id:'margins',    x:148, y:68, w:88,  h:16, col:navy, tc:'#fff', short:'Margins' },
      { id:'growth',     x:148, y:88, w:88,  h:16, col:navy, tc:'#fff', short:'Growth' },
      { id:'competitive',x:148, y:108,w:88,  h:16, col:navy, tc:'#fff', short:'Competitive' },
      { id:'synergy',    x:254, y:28, w:80,  h:16, col:'#1a3a2a', tc:'#fff', short:'Synergy' },
      { id:'platform',   x:254, y:55, w:80,  h:16, col:'#1a3a2a', tc:'#fff', short:'Platform' },
      { id:'intl',       x:254, y:82, w:80,  h:16, col:'#1a3a2a', tc:'#fff', short:"Int'l" },
      { id:'synopsis',   x:352, y:48, w:88,  h:18, col:coral, tc:'#fff', short:'Synopsis' },
      { id:'brief',      x:458, y:48, w:80,  h:18, col:amber, tc:'#fff', short:'Brief' },
    ];
    const boxMap = {};
    boxDefs.forEach(b => { boxMap[b.id] = b; });

    // Arrow helper — from right-edge of src to left-edge of dst, mid-point curve
    const arrow = (srcId, dstId, color='#cbd5e1', opacity=0.7) => {
      const s = boxMap[srcId]; const d = boxMap[dstId];
      if (!s || !d) return '';
      const x1 = s.x + s.w, y1 = s.y + s.h/2;
      const x2 = d.x,       y2 = d.y + d.h/2;
      const mx = (x1 + x2) / 2;
      return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" stroke="${color}" stroke-width="1" fill="none" opacity="${opacity}" marker-end="url(#arr)"/>`;
    };

    // Draw all dependency arrows
    const arrowsSvg = [
      // Framing → all W1
      ...['market','portfolio','brand','margins','growth','competitive'].map(id => arrow('framing', id, '#7c3aed', 0.4)),
      // W1 → W2
      ...['market','portfolio','brand','margins','growth','competitive'].flatMap(w1 =>
        ['synergy','platform','intl'].map(w2 => arrow(w1, w2, '#64748b', 0.25))
      ),
      // W1+W2 → Synopsis
      ...['market','portfolio','brand','margins','growth','competitive','synergy','platform','intl'].map(id => arrow(id, 'synopsis', coral, 0.3)),
      // All → Brief
      ...['market','portfolio','brand','margins','growth','competitive','synergy','platform','intl','synopsis'].map(id => arrow(id, 'brief', amber, 0.3)),
    ].join('');

    const boxesSvg = boxDefs.map(b => `
      <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="3" fill="${b.col}"/>
      <text x="${b.x + b.w/2}" y="${b.y + b.h/2 + 4}" text-anchor="middle" font-family="monospace" font-size="6.5" font-weight="700" fill="${b.tc}">${b.short}</text>
    `).join('');

    // Wave labels
    const waveLabels = [
      { x:10,  y:6, label:'WAVE 0' },
      { x:148, y:6, label:'WAVE 1 · 6 AGENTS' },
      { x:254, y:6, label:'WAVE 2' },
      { x:352, y:6, label:'WAVE 3' },
      { x:458, y:6, label:'WAVE 4' },
    ].map(l => `<text x="${l.x}" y="${l.y}" font-family="monospace" font-size="5.5" font-weight="800" fill="#9ca3af" letter-spacing="0.5">${l.label}</text>`).join('');

    const diagSvg = `<svg width="${diagW}" height="${diagH}" viewBox="0 0 ${diagW} ${diagH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#94a3b8"/>
        </marker>
      </defs>
      ${arrowsSvg}
      ${boxesSvg}
      ${waveLabels}
    </svg>`;

    // ── TOTAL PAGE COUNT ─────────────────────────────────────────────────
    const ALL_TRACE_AGENTS = [
      { id:'market',      num:1,  name:'MARKET POSITION & CATEGORY DYNAMICS' },
      { id:'portfolio',   num:2,  name:'PORTFOLIO STRATEGY & SKU RATIONALISATION' },
      { id:'brand',       num:3,  name:'BRAND POSITIONING & STORYTELLING' },
      { id:'margins',     num:4,  name:'MARGIN IMPROVEMENT & UNIT ECONOMICS' },
      { id:'growth',      num:5,  name:'GROWTH STRATEGY & CHANNEL ORCHESTRATION' },
      { id:'competitive', num:6,  name:'COMPETITIVE BATTLE PLAN' },
      { id:'synergy',     num:7,  name:'SYNERGY PLAYBOOK' },
      { id:'platform',    num:8,  name:'PLATFORM EXPANSION & D2C INCUBATOR' },
      { id:'intl',        num:9,  name:'INTERNATIONAL BENCHMARKS' },
      { id:'synopsis',    num:10, name:'EXECUTIVE SYNOPSIS' },
      { id:'brief',       num:11, name:'OPPORTUNITY BRIEF' },
    ];
    const traceAgents = ALL_TRACE_AGENTS.filter(ag =>
      (allThinking[ag.id] && allThinking[ag.id].length > 0) ||
      ((allToolLogs[ag.id] && allToolLogs[ag.id].length > 0) || (allThinking[ag.id] && /(?:let me search|now i.m (?:running )?search|i.ll search|searching for|web search)/i.test(allThinking[ag.id])))
    );
    const totalPages = 1 + traceAgents.length + 1;

    const page1 = `
    <div class="page" style="padding:32px 36px;font-family:'Instrument Sans',sans-serif;background:#fff;position:relative;min-height:1050px;">
      <!-- HEADER -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;padding-bottom:12px;border-bottom:3px solid ${navy};">
        <div>
          <div style="font-size:7px;font-weight:800;letter-spacing:.18em;color:${coral};margin-bottom:3px;">RESEARCH TRACE · SPRINT INTELLIGENCE REPORT</div>
          <div style="font-size:22px;font-weight:900;color:${navy};">${co}${acq?` · ${acq}`:''}</div>
          <div style="font-size:8.5px;color:#6b7280;margin-top:3px;">${date} · Sprint duration: ${Math.floor(elapsed/60)}m ${elapsed%60}s · ${agentsDone}/11 agents completed</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:8px;font-weight:800;letter-spacing:.12em;color:rgba(15,31,61,.18);">AdvisorSprint</div>
          <div style="font-size:6.5px;color:rgba(15,31,61,.18);margin-top:2px;">Harsha Belavady</div>
        </div>
      </div>

      <!-- SPRINT QUALITY SCORE STRIP -->
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:16px;">
        <div style="background:${navy};border-radius:4px;padding:8px 10px;text-align:center;">
          <div style="font-size:7px;color:#94a3b8;letter-spacing:.08em;margin-bottom:3px;">QUALITY SCORE</div>
          <div style="font-size:18px;font-weight:900;color:${qualityColor};">${qualityPct}%</div>
          <div style="font-size:6px;color:${qualityColor};font-weight:700;letter-spacing:.1em;">${qualityLabel}</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:8px 10px;text-align:center;">
          <div style="font-size:7px;color:#64748b;letter-spacing:.06em;margin-bottom:3px;">AGENTS DONE</div>
          <div style="font-size:18px;font-weight:900;color:${navy};">${agentsDone}<span style="font-size:10px;color:#94a3b8;">/11</span></div>
          <div style="font-size:6px;color:#64748b;">of 11 ran successfully</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:8px 10px;text-align:center;">
          <div style="font-size:7px;color:#64748b;letter-spacing:.06em;margin-bottom:3px;">WEB SEARCHES</div>
          <div style="font-size:18px;font-weight:900;color:${navy};">${searchCountFinal}${totalSearches === 0 && searchCountFinal > 0 ? '<span style="font-size:8px;color:#94a3b8;">~</span>' : ''}</div>
          <div style="font-size:6px;color:#64748b;">${sourcesLabel}</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:8px 10px;text-align:center;">
          <div style="font-size:7px;color:#64748b;letter-spacing:.06em;margin-bottom:3px;">H/M CONFIDENCE</div>
          <div style="font-size:18px;font-weight:900;color:${navy};">${highKpis+medKpis}<span style="font-size:10px;color:#94a3b8;">/${totalKpis}</span></div>
          <div style="font-size:6px;color:#64748b;">KPIs reliably sourced</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:8px 10px;text-align:center;">
          <div style="font-size:7px;color:#64748b;letter-spacing:.06em;margin-bottom:3px;">OPUS THINKING</div>
          <div style="font-size:18px;font-weight:900;color:${navy};">${totalThinkingChars > 0 ? Math.round(totalThinkingChars/1000)+'k' : '—'}</div>
          <div style="font-size:6px;color:#64748b;">chars of reasoning</div>
        </div>
      </div>

      <!-- AGENT DEPENDENCY DIAGRAM -->
      <div style="margin-bottom:14px;">
        <div style="font-size:7.5px;font-weight:800;letter-spacing:.1em;color:${navy};margin-bottom:6px;">AGENT INTERACTION MAP — HOW OUTPUTS FLOWED THROUGH THE SPRINT</div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:10px 12px;overflow:hidden;">
          ${diagSvg}
          <div style="display:flex;gap:14px;margin-top:6px;">
            <div style="display:flex;align-items:center;gap:4px;"><div style="width:12px;height:2px;background:#7c3aed;opacity:.6;"></div><span style="font-size:6px;color:#64748b;">Framing context</span></div>
            <div style="display:flex;align-items:center;gap:4px;"><div style="width:12px;height:2px;background:#64748b;opacity:.5;"></div><span style="font-size:6px;color:#64748b;">W1 → W2 outputs</span></div>
            <div style="display:flex;align-items:center;gap:4px;"><div style="width:12px;height:2px;background:${coral};opacity:.5;"></div><span style="font-size:6px;color:#64748b;">→ Synopsis synthesis</span></div>
            <div style="display:flex;align-items:center;gap:4px;"><div style="width:12px;height:2px;background:${amber};opacity:.5;"></div><span style="font-size:6px;color:#64748b;">→ Brief output</span></div>
          </div>
        </div>
      </div>

      <!-- CONFIDENCE HEATMAP -->
      <div style="font-size:7.5px;font-weight:800;letter-spacing:.1em;color:${navy};margin-bottom:6px;">CONFIDENCE HEATMAP · ALL AGENTS</div>
      <div style="font-size:6.5px;color:#6b7280;margin-bottom:8px;">GREEN = High (sourced data) · AMBER = Medium (triangulated) · RED = Low (signal only) · — = Not available</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
        <thead>
          <tr style="background:${navy};color:#fff;">
            <th style="padding:5px 8px;text-align:left;font-size:6.5px;letter-spacing:.06em;font-family:monospace;">AGENT</th>
            <th style="padding:5px 7px;text-align:center;font-size:6.5px;letter-spacing:.06em;font-family:monospace;">OVERALL</th>
            <th style="padding:5px 7px;text-align:center;font-size:6.5px;font-family:monospace;">KPI 1</th>
            <th style="padding:5px 7px;text-align:center;font-size:6.5px;font-family:monospace;">KPI 2</th>
            <th style="padding:5px 7px;text-align:center;font-size:6.5px;font-family:monospace;">KPI 3</th>
            <th style="padding:5px 7px;text-align:center;font-size:6.5px;font-family:monospace;">KPI 4</th>
            <th style="padding:5px 8px;text-align:left;font-size:6.5px;font-family:monospace;">VERDICT / KPI LABELS</th>
          </tr>
        </thead>
        <tbody>${heatmapRows}</tbody>
      </table>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:10px 14px;">
        <div style="font-size:6.5px;color:#374151;line-height:1.6;">
          <strong>H</strong> — sourced from a named publication, filing, or verified data. Safe to use with client. &nbsp;
          <strong>M</strong> — triangulated from 2+ indirect signals. Check reasoning trace. &nbsp;
          <strong>L</strong> — estimated from weak signals. Verify before using. &nbsp;
          <strong>Low-confidence agents</strong> = gaps in your context brief. See Gap Analysis page.
        </div>
      </div>

      <div style="position:absolute;bottom:18px;left:36px;right:36px;display:flex;justify-content:space-between;">
        <div style="font-size:6.5px;color:#9ca3af;letter-spacing:.06em;">ADVISORSPRINT INTELLIGENCE · CONFIDENTIAL</div>
        <div style="font-size:6.5px;color:#9ca3af;">PAGE 1 OF ${totalPages}</div>
      </div>
    </div>`;

    // ── AGENT PAGES ──────────────────────────────────────────────────────
    const tracePages = traceAgents.map((ag, pageIdx) => {
      const id = ag.id;
      const thinking = allThinking[id] || '';
      const toolLog = allToolLogs[id] || [];
      const pageNum = pageIdx + 2;
      const db = allDataBlocks[id] || {};
      const wave = AGENT_WAVE[id];
      const inputIds = AGENT_INPUTS[id] || [];

      // ── THEME 1: INPUTS RECEIVED panel (W2, Synopsis, Brief only) ────
      const showInputs = wave >= 2 && inputIds.filter(i => i !== 'framing').length > 0;
      const inputsHtml = showInputs ? (() => {
        const feeders = inputIds.filter(i => i !== 'framing');
        const rows = feeders.map(fid => {
          const fdb = allDataBlocks[fid] || {};
          const fkpis = Array.isArray(fdb.kpis) ? fdb.kpis : [];
          const overallConf = fdb.verdictRow?.confidence || (fkpis[0]?.confidence) || '—';
          const verdictSnip = (fdb.verdictRow?.finding || fdb.verdictRow?.verdict || fkpis.map(k=>k.label).join(', ') || '—').slice(0, 80);
          const confBg2 = overallConf==='H'?'#dcfce7':overallConf==='M'?'#fef3c7':overallConf==='—'?'#f3f4f6':'#fee2e2';
          const confCol2 = overallConf==='H'?'#16a34a':overallConf==='M'?'#92400e':overallConf==='—'?'#9ca3af':'#dc2626';
          return `<tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:4px 8px;font-size:7px;font-weight:700;color:${navy};white-space:nowrap;">${AGENT_SHORT[fid]||fid}</td>
            <td style="padding:4px 6px;text-align:center;background:${confBg2};">
              <span style="font-size:7.5px;font-weight:800;color:${confCol2};font-family:monospace;">${overallConf}</span>
            </td>
            <td style="padding:4px 8px;font-size:6.5px;color:#374151;">${verdictSnip}</td>
          </tr>`;
        }).join('');
        return `
        <div style="margin-bottom:14px;">
          <div style="font-size:8px;font-weight:800;letter-spacing:.1em;color:${navy};margin-bottom:6px;padding-bottom:4px;border-bottom:1.5px solid ${navy};">AGENT INPUTS RECEIVED — WHAT THIS AGENT WAS GIVEN</div>
          <div style="font-size:6.5px;color:#64748b;margin-bottom:6px;">This agent received the full DATA_BLOCK + verdict + first 3,000 chars of prose from each agent below. These structured outputs shaped its analysis.</div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
            <thead><tr style="background:#f1f5f9;">
              <th style="padding:4px 8px;font-size:6.5px;text-align:left;font-family:monospace;color:${navy};">SOURCE AGENT</th>
              <th style="padding:4px 6px;font-size:6.5px;text-align:center;font-family:monospace;color:${navy};">CONF</th>
              <th style="padding:4px 8px;font-size:6.5px;text-align:left;font-family:monospace;color:${navy};">KEY FINDING PASSED IN</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
      })() : '';

      // ── THEME 2: CONTRADICTION DETECTION (Synopsis + Brief only) ─────
      const showContradictions = (id === 'synopsis' || id === 'brief') && thinking.length > 0;
      const contradictionHtml = showContradictions ? (() => {
        const snippets = extractSnippets(thinking, CONTRADICTION_KW, 6);
        if (!snippets.length) return `
        <div style="margin-bottom:14px;padding:8px 12px;background:#fffbeb;border:1px solid #fde68a;border-left:3px solid ${amber};border-radius:2px;">
          <div style="font-size:7px;font-weight:700;color:#92400e;margin-bottom:3px;">CROSS-AGENT REASONING — NO EXPLICIT CONTRADICTIONS DETECTED</div>
          <div style="font-size:6.5px;color:#78350f;">The thinking stream did not contain explicit contradiction keywords. This may mean the agent found prior outputs consistent, or used different phrasing when reconciling differences. Review the full thinking below.</div>
        </div>`;
        const snippetRows = snippets.map((s, i) => `
          <div style="margin-bottom:8px;padding:7px 10px;background:#fffbeb;border:1px solid #fde68a;border-left:3px solid ${amber};border-radius:2px;">
            <div style="font-size:6px;color:#92400e;font-family:monospace;font-weight:700;margin-bottom:3px;">SIGNAL ${i+1} — keyword: "${s.keyword}"</div>
            <div style="font-size:7px;color:#1f2937;line-height:1.6;">${s.sentence.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
          </div>`).join('');
        return `
        <div style="margin-bottom:14px;">
          <div style="font-size:8px;font-weight:800;letter-spacing:.1em;color:#92400e;margin-bottom:6px;padding-bottom:4px;border-bottom:1.5px solid ${amber};">CROSS-AGENT REASONING — WHERE OPUS RECONCILED CONFLICTING SIGNALS</div>
          <div style="font-size:6.5px;color:#64748b;margin-bottom:8px;">Passages from the extended thinking where Opus detected tension, contradiction, or disagreement between prior agent outputs. These are the moments where synthesis — not just summarisation — occurred.</div>
          ${snippetRows}
        </div>`;
      })() : '';

      // ── THEME 1: Cross-agent reference scan for Synopsis/Brief ───────
      const showAgentRefs = (id === 'synopsis' || id === 'brief') && thinking.length > 0;
      const agentRefHtml = showAgentRefs ? (() => {
        const agentRefKw = ['market agent','portfolio agent','brand agent','margins agent','growth agent',
          'competitive agent','synergy agent','platform agent','intl agent',
          'agent 1','agent 2','agent 3','agent 4','agent 5','agent 6','agent 7','agent 8','agent 9',
          'market analysis','portfolio analysis','brand analysis',
          'market found','portfolio found','brand found','margins found','competitive found'];
        const refs = extractSnippets(thinking, agentRefKw, 5);
        if (!refs.length) return '';
        return `
        <div style="margin-bottom:14px;">
          <div style="font-size:8px;font-weight:800;letter-spacing:.1em;color:${forest};margin-bottom:6px;padding-bottom:4px;border-bottom:1.5px solid ${forest};">CROSS-AGENT REFERENCES — WHERE OPUS EXPLICITLY USED PRIOR AGENT OUTPUT</div>
          <div style="font-size:6.5px;color:#64748b;margin-bottom:8px;">Moments in the thinking stream where Opus explicitly referenced or built on a specific prior agent's finding.</div>
          ${refs.map((s,i) => `
            <div style="margin-bottom:6px;padding:7px 10px;background:#f0fdf4;border:1px solid #bbf7d0;border-left:3px solid ${forest};border-radius:2px;">
              <div style="font-size:6px;color:#166534;font-family:monospace;font-weight:700;margin-bottom:3px;">REF ${i+1} — "${s.keyword}"</div>
              <div style="font-size:7px;color:#1f2937;line-height:1.6;">${s.sentence.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
            </div>`).join('')}
        </div>`;
      })() : '';

      // ── SEARCH TABLE ────────────────────────────────────────────────
      const searchRows = toolLog.map((t,i) => `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:5px 8px;font-size:7px;font-weight:700;color:${navy};white-space:nowrap;">#${i+1}</td>
          <td style="padding:5px 8px;font-size:7px;color:#374151;">${(t.query||'(building query…)').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>
          <td style="padding:5px 8px;font-size:7px;color:#6b7280;">${(t.results||[]).length} sources</td>
          <td style="padding:5px 8px;font-size:6.5px;color:#6b7280;">${(t.results||[]).map(r=>`<div style="margin-bottom:2px;">→ ${(r.title||r.url||'').slice(0,60).replace(/</g,'&lt;')}</div>`).join('')}</td>
        </tr>`).join('');

      // ── CALCULATION PROVENANCE PANEL (Brief only) ────────────────
      // Shows every derived number in the brief with its calculation, source agent, and confidence
      // Provenance: only render if we have actual brief data fields, not fallback placeholder
      const hasBriefProvenance = id === 'brief' &&
        Array.isArray(db.kpis) && db.kpis.length > 0 &&
        db.kpis[0]?.label !== 'Analysis Complete' &&
        db.kpis[0]?.sub !== 'Data block not generated' &&
        (Array.isArray(db.gapTable) || Array.isArray(db.moves) || Array.isArray(db.marketSignals));
      const provenanceHtml = hasBriefProvenance ? (() => {
        const esc = s => (s||'').toString().replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const confCell = c => {
          const bg = c==='H'?'#dcfce7':c==='M'?'#fef3c7':c==='L'?'#fee2e2':'#f3f4f6';
          const col = c==='H'?'#16a34a':c==='M'?'#92400e':c==='L'?'#dc2626':'#9ca3af';
          return `<td style="padding:4px 6px;text-align:center;background:${bg};white-space:nowrap;"><span style="font-size:7px;font-weight:800;font-family:monospace;color:${col};">${c||'—'}</span></td>`;
        };

        // ── SECTION A: KPI calculations ──────────────────────────────
        const kpis = Array.isArray(db.kpis) ? db.kpis : [];
        const confBadge = c => {
          if (c === 'H') return '<span style="background:#dcfce7;color:#16a34a;font-size:6px;font-weight:800;font-family:monospace;padding:1px 5px;border-radius:2px;margin-right:4px;">CONFIRMED</span>';
          if (c === 'M') return '<span style="background:#fef3c7;color:#92400e;font-size:6px;font-weight:800;font-family:monospace;padding:1px 5px;border-radius:2px;margin-right:4px;">DERIVED</span>';
          return '<span style="background:#fee2e2;color:#dc2626;font-size:6px;font-weight:800;font-family:monospace;padding:1px 5px;border-radius:2px;margin-right:4px;">ESTIMATED</span>';
        };
        const kpiRows = kpis.map(k => {
          // Skip placeholder rows from fallback dataBlock
          if ((k.sub||'').includes('See prose below') || (k.sub||'').includes('Data block not generated')) return '';
          return `<tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:4px 8px;font-size:7px;font-weight:700;color:${navy};">${esc(k.label)}</td>
            <td style="padding:4px 8px;font-size:8px;font-weight:900;color:${navy};">${esc(k.value)}</td>
            <td style="padding:4px 8px;font-size:6.5px;color:#374151;line-height:1.5;">${confBadge(k.confidence)}${esc(k.sub)}</td>
            ${confCell(k.confidence)}
          </tr>`;
        }).join('');

        // ── SECTION B: Gap table calculations ────────────────────────
        const gaps = Array.isArray(db.gapTable) ? db.gapTable : [];
        const gapRows = gaps.map(g => `<tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:4px 8px;font-size:7px;font-weight:700;color:${navy};">${esc(g.occasion)}</td>
          <td style="padding:4px 8px;font-size:7px;font-weight:800;color:${navy};white-space:nowrap;">${g.categorySizeCr ? `₹${g.categorySizeCr} Cr` : '—'}</td>
          <td style="padding:4px 8px;font-size:6.5px;color:#374151;line-height:1.5;">
            ${g.sizeCalculation ? `<div style="margin-bottom:3px;font-style:italic;color:#1e3a5f;">${esc(g.sizeCalculation)}</div>` : ''}
            ${esc(g.scalingMechanism)} · brand share: ${esc(g.brandShare)} · play: ${esc(g.playType)}
          </td>
          ${confCell(g.confidence)}
        </tr>`).join('');

        // ── SECTION C: Move evidence ──────────────────────────────────
        const moves = Array.isArray(db.moves) ? db.moves : [];
        const moveRows = moves.map(m => `<tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:4px 8px;font-size:7px;font-weight:700;color:${navy};">${esc(m.title)}</td>
          <td style="padding:4px 8px;font-size:7px;font-weight:800;color:${navy};">${m.opportunityCr ? `₹${m.opportunityCr} Cr` : '—'}</td>
          <td style="padding:4px 8px;font-size:6.5px;color:#374151;">${esc(m.evidence)} · ${esc(m.rationale)}</td>
          ${confCell(m.confidence === 'CONFIRMED' ? 'H' : m.confidence === 'DERIVED' ? 'M' : m.confidence === 'ESTIMATED' ? 'M' : 'L')}
        </tr>`).join('');

        // ── SECTION D: Market signals ─────────────────────────────────
        const signals = Array.isArray(db.marketSignals) ? db.marketSignals : [];
        const signalRows = signals.map(s => `<tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:4px 8px;font-size:7px;font-weight:700;color:${navy};">${esc(s.player)}</td>
          <td style="padding:4px 8px;font-size:7px;color:#374151;">${esc(s.action)} — ${esc(s.occasion)}</td>
          <td style="padding:4px 8px;font-size:6.5px;color:#374151;">${esc(s.proofPoint)}</td>
          <td style="padding:4px 8px;font-size:6.5px;color:#64748b;">${esc(s.implicationForBrand)}</td>
        </tr>`).join('');

        const tableHead = (cols) => `<thead><tr style="background:${navy};color:#fff;">${cols.map(c=>`<th style="padding:4px 8px;font-size:6.5px;text-align:left;font-family:monospace;">${c}</th>`).join('')}</tr></thead>`;

        return `
        <div style="margin-bottom:14px;">
          <div style="font-size:8px;font-weight:800;letter-spacing:.1em;color:#4c1d95;padding-bottom:5px;border-bottom:1.5px solid #4c1d95;margin-bottom:8px;">CALCULATION PROVENANCE — HOW EVERY NUMBER IN THE BRIEF WAS DERIVED</div>
          <div style="font-size:6.5px;color:#64748b;margin-bottom:10px;">Every derived figure in the Opportunity Brief, with its calculation shown inline. Use this to verify market sizes, gap estimates, and move opportunity values before presenting to a client.</div>

          ${kpiRows ? `
          <div style="font-size:7px;font-weight:800;color:${navy};letter-spacing:.08em;margin-bottom:5px;">KPI TILES — DERIVED METRICS</div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:10px;border:1px solid #e5e7eb;">
            ${tableHead(['METRIC','VALUE','EXACT ARITHMETIC — HOW THE NUMBER WAS DERIVED','CONF'])}
            <tbody>${kpiRows}</tbody>
          </table>` : ''}

          ${gapRows ? `
          <div style="font-size:7px;font-weight:800;color:${navy};letter-spacing:.08em;margin-bottom:5px;">GAP TABLE — CATEGORY SIZE & OPPORTUNITY BASIS</div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:10px;border:1px solid #e5e7eb;">
            ${tableHead(['OCCASION / GAP','CATEGORY SIZE','SIZE CALCULATION · MECHANISM · SHARE · PLAY','CONF'])}
            <tbody>${gapRows}</tbody>
          </table>` : ''}

          ${moveRows ? `
          <div style="font-size:7px;font-weight:800;color:${navy};letter-spacing:.08em;margin-bottom:5px;">MOVES — OPPORTUNITY SIZE & EVIDENCE</div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:10px;border:1px solid #e5e7eb;">
            ${tableHead(['MOVE','OPPORTUNITY','EVIDENCE · RATIONALE','CONF'])}
            <tbody>${moveRows}</tbody>
          </table>` : ''}

          ${signalRows ? `
          <div style="font-size:7px;font-weight:800;color:${navy};letter-spacing:.08em;margin-bottom:5px;">MARKET SIGNALS — PROOF POINTS</div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:6px;border:1px solid #e5e7eb;">
            ${tableHead(['PLAYER','ACTION · OCCASION','PROOF POINT','IMPLICATION FOR BRAND'])}
            <tbody>${signalRows}</tbody>
          </table>` : ''}

          <div style="padding:6px 10px;background:#f5f3ff;border:1px solid #ddd6fe;border-left:3px solid #4c1d95;border-radius:2px;">
            <div style="font-size:6.5px;color:#4c1d95;line-height:1.5;"><strong>CONFIRMED</strong> = directly cited source · <strong>DERIVED</strong> = calculated from sourced inputs · <strong>ESTIMATED</strong> = triangulated from comparable data · <strong>SIGNAL ONLY</strong> = one unverified signal, treat as directional</div>
          </div>
        </div>`;
      })() : '';

      // ── THINKING BLOCK ──────────────────────────────────────────────
      const thinkingHtml = thinking ? `
        <div style="margin-bottom:14px;">
          <div style="font-size:8px;font-weight:800;letter-spacing:.1em;color:${forest};margin-bottom:8px;padding-bottom:4px;border-bottom:1.5px solid ${forest};">EXTENDED THINKING — FULL REASONING STREAM</div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:3px solid ${forest};border-radius:2px;padding:12px 14px;">
            <div style="font-size:6.5px;color:#6b7280;margin-bottom:6px;font-family:monospace;">${thinking.length.toLocaleString()} chars · ${thinking.split(' ').length.toLocaleString()} words · full trace shown</div>
            <div style="font-size:7px;color:#166534;line-height:1.7;white-space:pre-wrap;word-break:break-word;">${thinking.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
          </div>
        </div>` : `
        <div style="margin-bottom:12px;padding:8px 14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:3px;">
          <div style="font-size:7px;color:#0369a1;">This agent uses Sonnet 4.6 — extended thinking is enabled only for Opus agents (Synopsis + Brief). Search activity below shows what this agent researched.</div>
        </div>`;

      // Fallback: if toolLog empty but thinking mentions searches, show a note
      const agentSearchMentions = !toolLog.length && thinking ?
        (thinking.match(/(?:let me search|now i.m (?:running )?search|i.ll search|searching for|web search|search results)/gi) || []).length : 0;
      const searchFallbackHtml = !toolLog.length && agentSearchMentions > 0 ? `
        <div style="margin-bottom:14px;">
          <div style="font-size:8px;font-weight:800;letter-spacing:.1em;color:${navy};margin-bottom:8px;padding-bottom:4px;border-bottom:1.5px solid ${navy};">RESEARCH SEQUENCE — SEARCHES DETECTED</div>
          <div style="padding:8px 14px;background:#f0f9ff;border:1px solid #bae6fd;border-left:3px solid ${navy};border-radius:3px;">
            <div style="font-size:7px;color:#0369a1;line-height:1.6;">~${agentSearchMentions} web search reference(s) detected in the thinking stream. Detailed search log was not captured — this occurs when the sprint tab was closed or refreshed before the trace was generated. The thinking stream above shows what was searched and found.</div>
          </div>
        </div>` : '';
      const searchHtml = toolLog.length ? `
        <div style="margin-bottom:14px;">
          <div style="font-size:8px;font-weight:800;letter-spacing:.1em;color:${navy};margin-bottom:8px;padding-bottom:4px;border-bottom:1.5px solid ${navy};">RESEARCH SEQUENCE — SEARCHES AND SOURCES</div>
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:${navy};color:#fff;">
              <th style="padding:5px 8px;font-size:6.5px;text-align:left;font-family:monospace;">#</th>
              <th style="padding:5px 8px;font-size:6.5px;text-align:left;font-family:monospace;">QUERY</th>
              <th style="padding:5px 8px;font-size:6.5px;text-align:left;font-family:monospace;">RESULTS</th>
              <th style="padding:5px 8px;font-size:6.5px;text-align:left;font-family:monospace;">SOURCES SELECTED</th>
            </tr></thead>
            <tbody>${searchRows}</tbody>
          </table>
        </div>` : '';

      return `
      <div class="page" style="padding:36px;font-family:'Instrument Sans',sans-serif;background:#fff;position:relative;min-height:1050px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid ${navy};">
          <div>
            <div style="font-size:7px;font-weight:800;letter-spacing:.15em;color:${coral};">AGENT ${ag.num} · WAVE ${wave} · REASONING TRACE</div>
            <div style="font-size:17px;font-weight:900;color:${navy};">${ag.name}</div>
            ${inputIds.length ? `<div style="font-size:6.5px;color:#64748b;margin-top:2px;">Received input from: ${inputIds.map(i=>AGENT_SHORT[i]||i).join(' → ')}</div>` : ''}
          </div>
          <div style="font-size:6.5px;color:#9ca3af;font-family:monospace;">PAGE ${pageNum} OF ${totalPages}</div>
        </div>
        ${inputsHtml}
        ${agentRefHtml}
        ${contradictionHtml}
        ${provenanceHtml}
        ${thinkingHtml}
        ${searchHtml}
        ${searchFallbackHtml}
        <div style="position:absolute;bottom:18px;left:36px;right:36px;display:flex;justify-content:space-between;">
          <div style="font-size:6.5px;color:#9ca3af;letter-spacing:.06em;">ADVISORSPRINT INTELLIGENCE · CONFIDENTIAL</div>
          <div style="font-size:6.5px;color:#9ca3af;">PAGE ${pageNum} OF ${totalPages}</div>
        </div>
      </div>`;
    }).join('');

    // ── GAP ANALYSIS PAGE ─────────────────────────────────────────────
    const gap = gapText || '(Gap analysis was still running when this PDF was generated. Click \u21e9 Research Trace again after a few minutes to get the complete version.)';

    // Theme 3: Parse gap text into structured ADD / REMOVE / REFRAME sections
    const gapSections = (() => {
      if (!gapText) return null;
      const lines = gapText.split('\n');
      const sections = { Q1: [], Q2: [], Q3_add: [], Q3_remove: [], Q3_reframe: [] };
      // Default to Q1 — content before the first detected header goes into Q1
      // The model is told to start immediately without preamble, so Q1 content
      // appears before any ## QUESTION 2 header
      let currentSection = 'Q1';
      lines.forEach(line => {
        const t = line.trim();
        // Detect section boundaries — handles ## QUESTION 1, QUESTION 1:, **QUESTION 1**, etc.
        if (/QUESTION\s*1|WHAT THE (BRIEF|AI) SURFACED|BRIEF SURFACED|CONTEXT DIDN.T PROVIDE/i.test(t)) { currentSection = 'Q1'; return; }
        if (/QUESTION\s*2|WHAT YOUR CONTEXT|CONTEXT PROVIDED|BRIEF DIDN.T USE|BRIEF DID NOT USE/i.test(t)) { currentSection = 'Q2'; return; }
        if (/QUESTION\s*3|WHAT TO ADD|ADD OR CHANGE|IMPROVE YOUR|CONTEXT BRIEF NEXT/i.test(t)) { currentSection = 'Q3'; return; }
        if (!t || /^---+$/.test(t)) return;
        if (currentSection === 'Q1' && t.length > 5) sections.Q1.push(t);
        if (currentSection === 'Q2' && t.length > 5) sections.Q2.push(t);
        if (currentSection === 'Q3') {
          if (/^ADD:/i.test(t)) sections.Q3_add.push(t.replace(/^ADD:\s*/i,''));
          else if (/^REMOVE:/i.test(t)) sections.Q3_remove.push(t.replace(/^REMOVE:\s*/i,''));
          else if (/^REFRAME:/i.test(t)) sections.Q3_reframe.push(t.replace(/^REFRAME:\s*/i,''));
          else if (t.length > 5) sections.Q3_add.push(t);
        }
      });
      return sections;
    })();

    const gapCard = (items, col, label) => items.length === 0 ? '' : `
      <div style="margin-bottom:10px;">
        <div style="font-size:7.5px;font-weight:800;color:${col};letter-spacing:.1em;margin-bottom:5px;text-transform:uppercase;">${label}</div>
        ${items.map(item => `<div style="padding:6px 10px;background:${col}12;border-left:3px solid ${col};border-radius:2px;margin-bottom:5px;font-size:7px;color:#1f2937;line-height:1.6;">${item.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/^"(.*)"(.*)$/,'<strong>$1</strong>$2')}</div>`).join('')}
      </div>`;

    const gapStructured = gapSections ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <div style="font-size:8px;font-weight:800;color:${navy};letter-spacing:.08em;margin-bottom:8px;padding-bottom:4px;border-bottom:1.5px solid ${navy};">Q1 — WHAT THE AI FOUND (NOT IN YOUR BRIEF)</div>
          ${gapSections.Q1.slice(0,6).map(l=>`<div style="padding:4px 8px;border-bottom:1px solid #f0f0f0;font-size:6.5px;color:#374151;line-height:1.5;">${l.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`).join('') || '<div style="font-size:6.5px;color:#9ca3af;padding:4px 8px;">None identified</div>'}
        </div>
        <div>
          <div style="font-size:8px;font-weight:800;color:${navy};letter-spacing:.08em;margin-bottom:8px;padding-bottom:4px;border-bottom:1.5px solid ${navy};">Q2 — WHAT YOUR BRIEF PROVIDED BUT AI DIDN\'T USE</div>
          ${gapSections.Q2.slice(0,6).map(l=>`<div style="padding:4px 8px;border-bottom:1px solid #f0f0f0;font-size:6.5px;color:#374151;line-height:1.5;">${l.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`).join('') || '<div style="font-size:6.5px;color:#9ca3af;padding:4px 8px;">None identified</div>'}
        </div>
      </div>
      <div style="font-size:8px;font-weight:800;color:${navy};letter-spacing:.08em;margin-bottom:10px;padding-bottom:4px;border-bottom:1.5px solid ${navy};">Q3 — HOW TO IMPROVE YOUR CONTEXT BRIEF NEXT TIME</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${gapCard(gapSections.Q3_add, '#16a34a', '✚ ADD — paste this into your context brief')}
        ${gapCard(gapSections.Q3_remove, '#dc2626', '✕ REMOVE — this is not helping the AI')}
        ${gapCard(gapSections.Q3_reframe, amber, '↻ REFRAME — change the wording to this')}
      </div>` : `<div style="font-size:7.5px;color:#1f2937;line-height:1.8;white-space:pre-wrap;word-break:break-word;">${gap.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/## (.*)/g,`<div style="font-size:9px;font-weight:800;color:${navy};margin:14px 0 6px;letter-spacing:.05em;">$1</div>`).replace(/^(ADD|REMOVE|REFRAME):/gm,`<strong style="color:${coral};">$1:</strong>`)}</div>`;

    // Feedback loop explanation
    const feedbackLoopHtml = `
      <div style="background:${navy};border-radius:4px;padding:10px 14px;margin-bottom:14px;">
        <div style="font-size:7px;font-weight:800;color:#e2e8f0;letter-spacing:.1em;margin-bottom:5px;">THE FEEDBACK LOOP — HOW THIS PAGE MAKES THE NEXT SPRINT BETTER</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
          <div style="text-align:center;padding:6px;">
            <div style="font-size:16px;margin-bottom:3px;">①</div>
            <div style="font-size:6.5px;color:#94a3b8;line-height:1.4;">Run sprint with a context brief</div>
          </div>
          <div style="text-align:center;padding:6px;">
            <div style="font-size:16px;margin-bottom:3px;">②</div>
            <div style="font-size:6.5px;color:#94a3b8;line-height:1.4;">Read Q3 on this page — copy the ADD / REFRAME suggestions</div>
          </div>
          <div style="text-align:center;padding:6px;">
            <div style="font-size:16px;margin-bottom:3px;">③</div>
            <div style="font-size:6.5px;color:#94a3b8;line-height:1.4;">Paste improved context brief into the next sprint</div>
          </div>
          <div style="text-align:center;padding:6px;">
            <div style="font-size:16px;margin-bottom:3px;">④</div>
            <div style="font-size:6.5px;color:#94a3b8;line-height:1.4;">Quality score on Page 1 improves — H-confidence KPIs increase</div>
          </div>
        </div>
      </div>`;

    const pageGap = `
    <div class="page" style="padding:36px;font-family:'Instrument Sans',sans-serif;background:#fff;position:relative;min-height:1050px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid ${navy};">
        <div>
          <div style="font-size:7px;font-weight:800;letter-spacing:.15em;color:${coral};">AGENT 12 · PROMPT IMPROVEMENT ENGINE</div>
          <div style="font-size:18px;font-weight:900;color:${navy};">GAP ANALYSIS & BRIEF REFINEMENT</div>
        </div>
        <div style="font-size:6.5px;color:#9ca3af;font-family:monospace;">PAGE ${totalPages} OF ${totalPages}</div>
      </div>
      ${feedbackLoopHtml}
      ${gapStructured}
      <div style="position:absolute;bottom:18px;left:36px;right:36px;display:flex;justify-content:space-between;">
        <div style="font-size:6.5px;color:#9ca3af;letter-spacing:.06em;">ADVISORSPRINT INTELLIGENCE · CONFIDENTIAL</div>
        <div style="font-size:6.5px;color:#9ca3af;">PAGE ${totalPages} OF ${totalPages}</div>
      </div>
    </div>`;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700;800&display=swap');
  @page { size: A4; margin: 0; }
  body { margin: 0; padding: 0; font-family: 'Instrument Sans', 'Helvetica Neue', Arial, sans-serif; }
  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
</style>
</head><body>
${page1}
${tracePages}
${pageGap}
</body></html>`;
  };

  // ── GENERATE TRACE PDF ────────────────────────────────────────────
  const generateTracePDF = async () => {
    if (tracePdfGenerating) return;
    // Wait up to 60s for gap analysis to complete
    // Use sessionStorage flag not closure variable (closure captures stale value)
    if (gapAnalysisRunning) {
      await new Promise(resolve => {
        let waited = 0;
        const poll = setInterval(() => {
          waited += 500;
          const done = sessionStorage.getItem('gapAnalysisDone') === '1';
          if (done || waited >= 90000) {
            clearInterval(poll);
            sessionStorage.removeItem('gapAnalysisDone');
            resolve();
          }
        }, 500);
      });
      // Extra delay for React state to settle
      await new Promise(r => setTimeout(r, 1500));
    }
    setTracePdfGenerating(true);
    try {
      // Resolve dataBlocks from sessionStorage — not stale React state
      let resolvedDataBlocks = { ...dataBlocks };
      try {
        const saved = sessionStorage.getItem(`sprint_${company.trim()}`);
        if (saved) {
          const w1 = JSON.parse(saved);
          Object.entries(w1).forEach(([id, raw]) => {
            if (typeof raw !== 'string') return;
            const m = raw.match(/<<<DATA_BLOCK>>>\s*```json([\s\S]*?)```\s*<<<END_DATA_BLOCK>>>|<<<DATA_BLOCK>>>([\s\S]*?)<<<END_DATA_BLOCK>>>|<<<DATA_BLOCK>>>\s*(\{[\s\S]*\})/);
            if (m) {
              try {
                const parsed = JSON.parse(repairJson((m[1]||m[2]||m[3]||'').trim().replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'').trim()));
                resolvedDataBlocks[id] = parsed;
              } catch(e) {}
            }
          });
        }
      } catch(e) { console.warn('[TracePDF] sessionStorage read:', e.message); }

      // Restore toolLogs from sessionStorage if state was lost (page refresh etc.)
      let resolvedToolLogs = toolLogs;
      try {
        const storedToolLogs = sessionStorage.getItem(`toolLogs_${company.trim()}`);
        if (storedToolLogs) {
          const parsed = JSON.parse(storedToolLogs);
          // Use whichever has more data
          const stateCount = Object.values(toolLogs).reduce((s, l) => s + (l||[]).length, 0);
          const storedCount = Object.values(parsed).reduce((s, l) => s + (l||[]).length, 0);
          if (storedCount > stateCount) resolvedToolLogs = parsed;
        }
      } catch(e) { console.warn('[TracePDF] toolLogs restore:', e.message); }

      const html = buildTracePdfHtml(
        company.trim(), acquirer.trim(), context.trim(),
        resolvedDataBlocks, thinkingBlocks, resolvedToolLogs,
        gapAnalysis, elapsed
      );
      // Guard: truncate if HTML exceeds safe payload size (~38MB leaves headroom under 50MB limit)
      let safeHtml = html;
      const htmlBytes = new TextEncoder().encode(html).length;
      if (htmlBytes > 38 * 1024 * 1024) {
        console.warn('[TracePDF] HTML too large (' + Math.round(htmlBytes/1024/1024) + 'MB) — truncating thinking streams');
        safeHtml = html.replace(/<div[^>]*EXTENDED THINKING[\s\S]*?<\/div>\s*<\/div>/gi,
          '<div style="padding:8px 14px;background:#fef9c3;border:1px solid #fde68a;border-radius:3px;font-size:7px;color:#92400e;">Thinking stream omitted — HTML payload too large. View raw text in browser console.</div>');
      }
      const pdfRes = await fetch(API_URL.replace('/api/claude', '/api/pdf'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ html: safeHtml, company: company.trim(), acquirer: acquirer.trim() }),
        signal: AbortSignal.timeout(120000),
      });
      if (!pdfRes.ok) {
        const errBody = await pdfRes.json().catch(() => ({ error: `Server error ${pdfRes.status}` }));
        throw new Error(errBody.error || `Trace PDF failed — server ${pdfRes.status}`);
      }
      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${company.trim().replace(/\s+/g,'-')}_ResearchTrace_${new Date().toISOString().slice(0,10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(e) {
      alert(`Trace PDF failed: ${e.message}`);
    } finally {
      setTracePdfGenerating(false);
    }
  };

  const cancel = () => {
    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearInterval(timerRef.current);
    setAppState("idle");
    gaEvent("sprint_cancelled", { company, time_seconds: elapsed });
  };

  const downloadPDF = () => {
    gaEvent("pdf_download", { company, user: "anonymous" });
    window.print();
  };

  const generatePDF = async () => {
    if (pdfGenerating) return;
    setPdfGenerating(true);
    gaEvent("pdf_generate_puppeteer", { company });
    try {
      // Re-parse dataBlocks + results from sessionStorage — guards against stale state
      let resolvedDataBlocks = { ...dataBlocks };
      let resolvedResults    = { ...results };
      try {
        const saved = sessionStorage.getItem(`sprint_${company.trim()}`);
        if (saved) {
          const w1 = JSON.parse(saved);
          Object.entries(w1).forEach(([id, raw]) => {
            if (typeof raw !== 'string') return;
            const cleanText = raw.replace(/<<<DATA_BLOCK>>>[\s\S]*?<<<END_DATA_BLOCK>>>/g, '').trim();
            if (cleanText) resolvedResults[id] = cleanText;
            const m = raw.match(/<<<DATA_BLOCK>>>\s*```json([\s\S]*?)```\s*<<<END_DATA_BLOCK>>>|<<<DATA_BLOCK>>>([\s\S]*?)<<<END_DATA_BLOCK>>>|<<<DATA_BLOCK>>>\s*(\{[\s\S]*\})/);
            if (m) {
              try {
                const parsed = JSON.parse(repairJson((m[1]||m[2]||m[3]||'').trim().replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'')));
                resolvedDataBlocks[id] = parsed;
              } catch(e) { console.warn('[FullPDF] re-parse failed for', id, e.message); }
            }
          });
        }
      } catch(e) { console.warn('[FullPDF] sessionStorage read:', e.message); }
      const html = buildPDFHtml({ company, acquirer, parentCo, parentSince, companyMode, results: resolvedResults, dataBlocks: resolvedDataBlocks, sources, elapsed, market });
      const pdfRes = await fetch(API_URL.replace('/api/claude', '/api/pdf'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ html, company, acquirer }),
        signal: AbortSignal.timeout(120000), // 2 min timeout — Puppeteer needs time on cold start
      });
      if (!pdfRes.ok) {
        const err = await pdfRes.json().catch(() => ({ error: 'PDF generation failed' }));
        throw new Error(err.error || `Server error ${pdfRes.status}`);
      }
      const res = pdfRes;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${company.replace(/\s+/g,'_')}_AdvisorSprint_${new Date().toISOString().slice(0,10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(e) {
      console.error('[PDF]', e.message);
      alert(`PDF generation failed: ${e.message}\n\nFalling back to browser print.`);
      window.print();
    } finally {
      setPdfGenerating(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <style>{GLOBAL_CSS}</style>

      {/* PDF Header (hidden on screen, shown in print) */}
      <div className="pdf-header" style={{ display: "none" }}>
        <div style={{ background: P.forest, padding: "14px 20px", borderBottom: `3px solid ${P.forestMid}`, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: P.parchment, letterSpacing: ".03em" }}>
                <span style={{ fontWeight: 400, fontStyle: "italic" }}>Advisor</span><span>Sprint</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: P.parchment, opacity: 0.9 }}>
                PARALLEL AGENT INTELLIGENCE
              </div>
            </div>
            <div style={{ background: P.terra, color: P.white, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", padding: "5px 12px", borderRadius: 12 }}>
              HARSHA BELAVADY
            </div>
          </div>
        </div>
      </div>

      {/* Main UI (hidden in print) */}
      <div className="no-print">

        {/* ── Password gate — DISABLED, re-enable when sharing publicly ── */}
        {/* {!sessionToken && (
          <div style={{ position: 'fixed', inset: 0, background: P.forest, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 340, padding: '40px 36px', background: P.forestMid, border: `1px solid ${P.sand}30`, borderRadius: 8 }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: P.parchment, marginBottom: 4 }}><em style={{ fontWeight: 400 }}>Advisor</em>Sprint</div>
              <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: `${P.parchment}60`, marginBottom: 28 }}>Consumer Intelligence</div>
              <label style={{ display: 'block', fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: P.sand, marginBottom: 8 }}>Access Code</label>
              <input
                type="password"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !authLoading && handleAuth()}
                placeholder="Enter access code…"
                autoFocus
                style={{ width: '100%', padding: '10px 12px', background: `${P.parchment}15`, border: `1px solid ${P.sand}50`, borderRadius: 4, color: P.parchment, fontFamily: 'monospace', fontSize: 14, marginBottom: 12, outline: 'none', boxSizing: 'border-box' }}
              />
              {authError && (
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#ff8a80', marginBottom: 10 }}>{authError}</div>
              )}
              <button
                onClick={handleAuth}
                disabled={authLoading || !authPassword.trim()}
                style={{ width: '100%', padding: '11px', background: authLoading ? `${P.parchment}20` : P.terra, border: 'none', borderRadius: 4, color: P.white, fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', cursor: authLoading || !authPassword.trim() ? 'not-allowed' : 'pointer' }}
              >
                {authLoading ? 'Verifying…' : 'Enter Sprint'}
              </button>
            </div>
          </div>
        )} */}

        {/* ── Sprint credit exhausted notice — disabled with auth ── */}
        {/* {sessionToken && sprintCreditUsed && appState === 'idle' && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, background: P.forestMid, border: `1px solid ${P.gold}40`, borderRadius: 6, padding: '12px 18px', zIndex: 90, maxWidth: 320 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, color: P.gold, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>Sprint credit used</div>
            <div style={{ fontSize: 11, color: `${P.parchment}80`, lineHeight: 1.5 }}>Your complimentary sprint has been used. Contact Harsha for additional access.</div>
          </div>
        )} */}

        {/* Header */}
        <div style={{ background: P.forest, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${P.forestMid}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: P.parchment, letterSpacing: ".03em" }}>
              <i style={{ fontWeight: 400 }}>Advisor</i>Sprint
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: `${P.parchment}90` }}>
              PARALLEL AGENT INTELLIGENCE
            </div>
          </div>
          <div style={{ background: P.terra, color: P.white, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", padding: "5px 12px", borderRadius: 12 }}>
            HARSHA BELAVADY
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
          
          {/* Input Section */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontFamily: "'Instrument Sans'", fontSize: 11, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: P.inkMid, marginBottom: 8 }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={appState === "running"}
                  placeholder="e.g. Little Caesars, The Whole Truth"
                  style={{ width: "100%", padding: "10px 14px", border: `2px solid ${P.sand}`, borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 15, background: P.white }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontFamily: "'Instrument Sans'", fontSize: 11, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: P.inkMid, marginBottom: 8 }}>
                  Company Type
                </label>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {[
                    { key: "standalone", label: "Standalone" },
                    { key: "acquired",   label: "Acquired" },
                    { key: "parent",     label: "Brand within Parent" },
                  ].map(opt => (
                    <button key={opt.key}
                      onClick={() => appState !== "running" && setCompanyMode(opt.key)}
                      style={{
                        padding: "7px 14px", borderRadius: 4, cursor: appState === "running" ? "not-allowed" : "pointer",
                        border: `2px solid ${companyMode === opt.key ? P.forest : P.sand}`,
                        background: companyMode === opt.key ? P.forest : P.white,
                        color: companyMode === opt.key ? P.white : P.inkMid,
                        fontFamily: "'Instrument Sans'", fontSize: 12,
                        fontWeight: companyMode === opt.key ? 700 : 400, letterSpacing: ".03em",
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
                {companyMode === "acquired" && (
                  <input type="text" value={acquirer} onChange={(e) => setAcquirer(e.target.value)}
                    disabled={appState === "running"} placeholder="Acquirer — e.g. ITC Limited"
                    style={{ width: "100%", padding: "10px 14px", border: `2px solid ${P.sand}`, borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 15, background: P.white }} />
                )}
                {companyMode === "parent" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" value={parentCo} onChange={(e) => setParentCo(e.target.value)}
                      disabled={appState === "running"} placeholder="Parent company — e.g. ITC Limited"
                      style={{ flex: 2, padding: "10px 14px", border: `2px solid ${P.sand}`, borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 15, background: P.white }} />
                    <input type="text" value={parentSince} onChange={(e) => setParentSince(e.target.value)}
                      disabled={appState === "running"} placeholder="Part of parent since — e.g. 2018"
                      style={{ flex: 1, padding: "10px 14px", border: `2px solid ${P.sand}`, borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 15, background: P.white }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontFamily: "'Instrument Sans'", fontSize: 11, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: P.inkMid, marginBottom: 8 }}>
                Market
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {["India", "US", "Global"].map(m => (
                  <button
                    key={m}
                    onClick={() => appState !== "running" && setMarket(m)}
                    style={{
                      padding: "9px 20px",
                      border: `2px solid ${market === m ? P.forest : P.sand}`,
                      borderRadius: 4,
                      background: market === m ? P.forest : P.white,
                      color: market === m ? P.white : P.inkMid,
                      fontFamily: "'Instrument Sans'",
                      fontSize: 13,
                      fontWeight: market === m ? 700 : 400,
                      cursor: appState === "running" ? "not-allowed" : "pointer",
                      letterSpacing: ".04em",
                    }}
                  >{m}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontFamily: "'Instrument Sans'", fontSize: 11, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: P.inkMid, marginBottom: 8 }}>
                Context & Strategic Questions
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                disabled={appState === "running"}
                rows={12}
                style={{ width: "100%", padding: "10px 14px", border: `2px solid ${P.sand}`, borderRadius: 4, fontFamily: "'JetBrains Mono'", fontSize: 13, background: P.white, lineHeight: 1.5 }}
              />
            </div>

            {/* ── Reference Document upload (UI only — no functionality) ── */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontFamily: "'Instrument Sans'", fontSize: 11, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: P.inkMid, marginBottom: 8 }}>
                Reference Document
                <span style={{ marginLeft: 8, fontWeight: 400, textTransform: "none", letterSpacing: 0, color: P.inkFaint, fontSize: 11 }}>Optional · 1 PDF · Max 500 KB</span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "8px 14px",
                    background: P.parchment,
                    border: `1.5px dashed ${P.sand}`,
                    borderRadius: 4,
                    fontFamily: "'Instrument Sans'", fontSize: 12, fontWeight: 600,
                    color: P.inkMid,
                    cursor: "not-allowed",
                    userSelect: "none",
                    opacity: 0.7,
                  }}
                  title="PDF upload — coming soon"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 13h10M7 1v8M4 6l3 3 3-3" stroke="#b85c38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Attach PDF
                  <input type="file" accept=".pdf" disabled style={{ display: "none" }} />
                </label>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: P.inkFaint, fontStyle: "italic" }}>
                  No file attached
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                onClick={sprintCreditUsed ? undefined : runSprint}
                disabled={!company.trim() || appState === "running" || sprintCreditUsed}
                style={{ padding: "12px 24px", background: sprintCreditUsed ? P.inkFaint : appState === "running" ? P.inkFaint : testMode ? P.gold : P.forest, color: P.white, border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 14, fontWeight: 600, cursor: (appState === "running" || sprintCreditUsed) ? "not-allowed" : "pointer" }}
              >
                {appState === "running" ? `Running... ${formatTime(elapsed)}` : testMode ? "▶ Test Run (Agent 1 only)" : "Run Analysis"}
              </button>

              {/* Test mode toggle */}
              <div
                onClick={() => appState !== "running" && setTestMode(m => !m)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", background: testMode ? `${P.gold}20` : P.parchment, border: `1px solid ${testMode ? P.gold : P.sand}`, borderRadius: 4, cursor: appState === "running" ? "not-allowed" : "pointer", userSelect: "none" }}
                title="Test mode: runs only Agent 1 (Market) to verify visuals cheaply before a full run"
              >
                <div style={{ width: 28, height: 16, background: testMode ? P.gold : P.sand, borderRadius: 8, position: "relative", transition: "background .2s" }}>
                  <div style={{ position: "absolute", top: 2, left: testMode ? 14 : 2, width: 12, height: 12, background: "#fff", borderRadius: "50%", transition: "left .2s" }} />
                </div>
                <span style={{ fontFamily: "'Instrument Sans'", fontSize: 11, fontWeight: 600, color: testMode ? P.gold : P.inkFaint }}>
                  Test mode
                </span>
              </div>

              {appState === "running" && (
                <button onClick={cancel} style={{ padding: "12px 24px", background: P.terra, color: P.white, border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
              )}

              {appState === "error" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                  <div style={{ background: '#fff0f0', border: '1px solid #f5c6cb', borderRadius: 4, padding: '10px 16px', fontSize: 12, color: '#842029', fontFamily: 'monospace', lineHeight: 1.6 }}>
                    ✗ Sprint failed — one or more agents could not reach the server. This is usually a network or CORS issue. Check the browser console for details, then retry.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setAppState('idle'); setStatuses({}); }}
                      style={{ padding: "10px 20px", background: P.forest, color: P.white, border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      ↺ Start Over
                    </button>
                    {results['synopsis'] && (
                      <button onClick={retryBrief} disabled={retryingBrief}
                        style={{ padding: "10px 20px", background: retryingBrief ? "#999" : "#b85c38", color: "#fff", border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 13, fontWeight: 600, cursor: retryingBrief ? "not-allowed" : "pointer" }}>
                        {retryingBrief ? "⟳ Retrying Brief…" : "↺ Retry Brief Only"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {appState === "done" && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={generatePDF}
                    disabled={pdfGenerating}
                    style={{ padding: "12px 24px", background: pdfGenerating ? "#999" : P.terra, color: P.white, border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 14, fontWeight: 600, cursor: pdfGenerating ? "not-allowed" : "pointer" }}>
                    {pdfGenerating ? "⟳ Generating PDF..." : "⬇ Download Full Report"}
                  </button>
                  {(results['brief'] || (dataBlocks['brief'] && dataBlocks['brief'].agent === 'brief')) && (
                    <button
                      onClick={generateBriefPDF}
                      disabled={briefPdfGenerating}
                      style={{ padding: "12px 24px", background: briefPdfGenerating ? "#999" : P.forest, color: P.white, border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 14, fontWeight: 600, cursor: briefPdfGenerating ? "not-allowed" : "pointer" }}>
                      {briefPdfGenerating ? "⟳ Generating Brief..." : "⬇ CEO Opportunity Brief"}
                    </button>
                  )}
                  <button
                    onClick={generateTracePDF}
                    disabled={tracePdfGenerating}
                    style={{ padding: "12px 24px", background: tracePdfGenerating ? "#999" : "#4c1d95", color: "#fff", border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 14, fontWeight: 600, cursor: tracePdfGenerating ? "not-allowed" : "pointer" }}>
                    {tracePdfGenerating ? "⟳ Building Trace..." : "⬇ Research Trace"}
                  </button>
                  {appState === "done" && (
                    <button
                      onClick={saveSprint}
                      disabled={shareLoading}
                      style={{ padding: "12px 24px", background: shareLoading ? P.inkFaint : "#059669", color: P.white, border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 14, fontWeight: 600, cursor: shareLoading ? "not-allowed" : "pointer" }}>
                      {shareLoading ? "⟳ Saving…" : shareUrl ? "✓ Saved" : "⤴ Save & Share"}
                    </button>
                  )}
                  <button
                    onClick={downloadPDF}
                    style={{ padding: "12px 20px", background: "transparent", color: P.inkSoft, border: `1px solid ${P.inkFaint}`, borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 12, cursor: "pointer" }}>
                    Browser Print
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {Object.keys(statuses).length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ display: "grid", gap: 8 }}>
                {AGENTS.map((agent) => {
                  const status = statuses[agent.id];
                  const bgColor = status === "done" ? "#d4f4dd" : status === "running" ? "#fff3cd" : status === "error" ? "#f8d7da" : P.parchment;
                  
                  return (
                    <div key={agent.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: bgColor, borderRadius: 4, border: `1px solid ${P.sand}` }}>
                      <div style={{ fontSize: 18 }}>{agent.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Instrument Sans'", fontSize: 13, fontWeight: 600, color: P.ink }}>{agent.label}</div>
                        <div style={{ fontFamily: "'Instrument Sans'", fontSize: 11, color: P.inkSoft }}>{agent.sub}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {status === 'done' && !['brief','framing','gap_analysis'].includes(agent.id) && (
                          <button
                            onClick={() => openDrawer(agent.id)}
                            style={{
                              padding: '3px 9px',
                              background: 'transparent',
                              border: `1px solid ${P.forestSoft}`,
                              borderRadius: 4,
                              color: P.forestSoft,
                              fontSize: 9, fontWeight: 700,
                              fontFamily: 'monospace',
                              letterSpacing: '.06em',
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                            }}
                          >
                            Ask ↗
                          </button>
                        )}
                        <div style={{ fontFamily: "'Instrument Sans'", fontSize: 11, fontWeight: 600, color: status === "done" ? "#28a745" : status === "running" ? "#fd7e14" : P.inkFaint }}>
                          {status === "done" ? "✓" : status === "running" ? "⟳" : status === "error" ? "✗" : "○"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DataBlock Inspector — visible on screen after agents complete */}
          {Object.keys(dataBlocks).length > 0 && (
            <div style={{ marginTop: 40 }}>
              <div style={{ fontFamily: "'Instrument Sans'", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: P.inkMid, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${P.sand}` }}>
                DataBlock Inspector — Visual Data Verification
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {AGENTS.map((agent) => (
                  dataBlocks[agent.id]
                    ? <DataBlockInspector key={agent.id} agentId={agent.id} agentLabel={agent.label} db={dataBlocks[agent.id]} />
                    : statuses[agent.id] === "done"
                      ? <div key={agent.id} style={{ padding: "8px 14px", background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 6, fontFamily: "monospace", fontSize: 11, color: "#856404" }}>
                          ⚠ {agent.id} — completed but no DATA_BLOCK parsed
                        </div>
                      : null
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Agent Conversation Drawer ── */}
      {drawerAgent && (() => {
        const agentMeta = AGENTS.find(a => a.id === drawerAgent) || {};
        const db = dataBlocks[drawerAgent] || {};
        const verdict = db.verdictRow || {};
        const kpis = Array.isArray(db.kpis) ? db.kpis : [];
        const summary = getAgentSummary(drawerAgent);
        const suggestedQs = getSuggestedQuestions(drawerAgent);
        const verdictColor = { STRONG:'#059669', WATCH:'#d97706', RISK:'#dc2626', OPTIMISE:'#2563eb' }[verdict.verdict] || '#64748b';
        const verdictBg   = { STRONG:'#dcfce7', WATCH:'#fef3c7', RISK:'#fee2e2', OPTIMISE:'#dbeafe' }[verdict.verdict] || '#f1f5f9';

        return (
          <>
            <div onClick={closeDrawer} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
            <div style={{
              position: 'fixed', top: 0, right: 0,
              width: 420, height: '100vh',
              background: P.white,
              borderLeft: `2px solid ${P.sand}`,
              zIndex: 50,
              display: 'flex', flexDirection: 'column',
              overflowY: 'hidden',
              fontFamily: "'Instrument Sans', sans-serif",
            }}>
              {/* Header */}
              <div style={{ padding: '14px 18px 12px', borderBottom: `1px solid ${P.sand}`, flexShrink: 0, background: P.parchment }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: 8, fontWeight: 700, color: P.forestSoft, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 3 }}>
                      W{agentMeta.wave} · Agent Conversation
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, lineHeight: 1.3 }}>
                      {agentMeta.label || drawerAgent}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {verdict.verdict && (
                      <span style={{ fontFamily: 'monospace', fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: verdictBg, color: verdictColor }}>
                        {verdict.verdict}
                      </span>
                    )}
                    <button onClick={closeDrawer} style={{ background: 'transparent', border: `1px solid ${P.sand}`, borderRadius: 4, color: P.inkFaint, fontSize: 14, cursor: 'pointer', padding: '2px 8px', lineHeight: 1 }}>✕</button>
                  </div>
                </div>
                {summary && (
                  <div style={{ marginTop: 10, fontSize: 10, color: P.inkMid, lineHeight: 1.6, background: P.cream, borderRadius: 4, padding: '7px 10px', border: `1px solid ${P.sand}` }}>
                    {summary}
                  </div>
                )}
                {kpis.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                    {kpis.slice(0, 4).map((k, i) => (
                      <div key={i} style={{ background: P.white, border: `1px solid ${P.sand}`, borderRadius: 4, padding: '3px 8px' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 7, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '.05em' }}>{(k.label||'').slice(0,16)}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: P.ink }}>{k.value||'—'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Conversation area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {drawerMessages.length === 0 && (
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: 8, color: P.inkFaint, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Suggested questions
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {suggestedQs.map((q, i) => (
                        <button key={i} onClick={() => setDrawerInput(q)}
                          style={{ textAlign: 'left', background: P.cream, border: `1px solid ${P.sand}`, borderRadius: 6, padding: '7px 11px', color: P.forestMid, fontSize: 11, cursor: 'pointer', lineHeight: 1.5 }}>
                          {q}
                        </button>
                      ))}
                    </div>
                    <div style={{ marginTop: 12, padding: '6px 10px', background: '#f5f0ff', border: '1px solid #d8b4fe', borderRadius: 4, fontSize: 9, color: '#6d28d9', lineHeight: 1.6 }}>
                      This agent will only answer from what it found in the sprint. It will not invent new data or speculate beyond its analysis.
                    </div>
                  </div>
                )}

                {drawerMessages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.role === 'assistant' && (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: P.parchment, border: `1px solid ${P.sand}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, marginRight: 7, marginTop: 2 }}>
                        {agentMeta.icon || '◈'}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '82%', padding: '8px 12px',
                      borderRadius: msg.role === 'user' ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
                      background: msg.role === 'user' ? P.forest : (msg.isError ? '#fff0f0' : P.parchment),
                      border: `1px solid ${msg.role === 'user' ? P.forestMid : msg.isError ? '#fca5a5' : P.sand}`,
                      fontSize: 11, color: msg.role === 'user' ? P.white : (msg.isError ? '#dc2626' : P.inkMid),
                      lineHeight: 1.65, whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}{msg.isStreaming ? <span style={{ borderRight: `2px solid ${P.terra}`, marginLeft: 1 }}>&nbsp;</span> : null}
                    </div>
                  </div>
                ))}

                {drawerLoading && !drawerMessages.some(m => m.isStreaming && m.content.length > 0) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: P.parchment, border: `1px solid ${P.sand}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
                      {agentMeta.icon || '◈'}
                    </div>
                    <div style={{ fontSize: 11, color: P.inkFaint, fontStyle: 'italic' }}>Thinking…</div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ padding: '12px 18px 16px', borderTop: `1px solid ${P.sand}`, flexShrink: 0, background: P.parchment }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" value={drawerInput}
                    onChange={e => setDrawerInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey && !drawerLoading) { e.preventDefault(); sendDrawerMessage(); }
                      if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); }
                    }}
                    placeholder={`Ask the ${agentMeta.label || 'agent'}…`}
                    disabled={drawerLoading}
                    style={{ flex: 1, background: P.white, border: `1px solid ${P.sand}`, borderRadius: 4, padding: '8px 11px', color: P.ink, fontSize: 11, fontFamily: "'Instrument Sans', sans-serif", outline: 'none' }}
                  />
                  <button onClick={sendDrawerMessage} disabled={drawerLoading || !drawerInput.trim()}
                    style={{ padding: '8px 14px', background: drawerLoading || !drawerInput.trim() ? P.sand : P.forest, border: 'none', borderRadius: 4, color: P.white, fontSize: 10, fontWeight: 700, fontFamily: 'monospace', cursor: drawerLoading || !drawerInput.trim() ? 'not-allowed' : 'pointer', letterSpacing: '.06em' }}>
                    {drawerLoading ? '…' : 'Send'}
                  </button>
                </div>
                <div style={{ marginTop: 7, fontSize: 9, color: P.inkFaint, fontFamily: 'monospace' }}>
                  Enter to send · Esc to close · ~$0.01 per exchange
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Share Modal ── */}
      {showShareModal && shareUrl && (
        <>
          <div onClick={() => setShowShareModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, background: P.white, border: `1px solid ${P.sand}`, borderRadius: 10, padding: '28px 32px', zIndex: 70 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, color: '#059669', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>Sprint saved</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, marginBottom: 16, lineHeight: 1.4 }}>Share this link with your recipient — they can ask questions of each agent directly.</div>
            <div style={{ background: P.parchment, border: `1px solid ${P.sand}`, borderRadius: 4, padding: '10px 12px', fontFamily: 'monospace', fontSize: 10, color: P.forestSoft, wordBreak: 'break-all', marginBottom: 12 }}>
              {shareUrl}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                style={{ flex: 1, padding: '9px', background: P.forest, border: 'none', borderRadius: 4, color: P.white, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer' }}
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ padding: '9px 16px', background: 'transparent', border: `1px solid ${P.sand}`, borderRadius: 4, color: P.inkFaint, fontSize: 11, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
            <div style={{ marginTop: 10, fontSize: 9, color: P.inkFaint, fontFamily: 'monospace' }}>
              Link expires in 30 days · Recipients can ask questions — they cannot run sprints
            </div>
          </div>
        </>
      )}

      {/* PDF CONTENT - 16 PAGES WITH BEAUTIFUL FORMATTING */}
<div style={{ display: "none" }} className="print-only">
  
  {/* ENHANCED CSS FOR PDF */}
  <style>{`
    @media print {
      .recommendation-box {
        background: #f0d4c0 !important;
        border-left: 6px solid #b85c38 !important;
        padding: 18px !important;
        margin: 20px 0 !important;
        border-radius: 4px !important;
        page-break-inside: avoid !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .recommendation-title {
        color: #b85c38 !important;
        font-weight: 700 !important;
        font-size: 10px !important;
        letter-spacing: 0.1em !important;
        text-transform: uppercase !important;
        margin-bottom: 10px !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      .verdict-box {
        background: white !important;
        border: 3px solid #1a3325 !important;
        border-left: 8px solid #1a3325 !important;
        padding: 25px !important;
        margin: 30px 0 !important;
        page-break-inside: avoid !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .big-number {
        font-size: 28px !important;
        font-weight: 700 !important;
        color: #b85c38 !important;
        font-family: 'Playfair Display', serif !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      .insight-box {
        background: #faf8f4 !important;
        border-left: 4px solid #d4724a !important;
        padding: 15px !important;
        margin: 15px 0 !important;
        page-break-inside: avoid !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .section-header {
        border-bottom: 3px solid #1a3325 !important;
        padding-bottom: 12px !important;
        margin-bottom: 20px !important;
        page-break-after: avoid !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      table {
        page-break-inside: avoid !important;
        border-collapse: collapse !important;
        width: 100%;
        font-size: 11px;
      }

      table th {
        background: #2d5040 !important;
        color: #f5f0e8 !important;
        padding: 8px 12px !important;
        font-weight: 700 !important;
        font-size: 10px !important;
        letter-spacing: 0.05em !important;
        text-transform: uppercase !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      table td {
        padding: 7px 12px !important;
        border: 1px solid #d4c4a8 !important;
        color: #1a1208 !important;
        vertical-align: top !important;
        line-height: 1.4 !important;
      }

      table tr:nth-child(even) td {
        background: #faf6ef !important;
      }

      .conf-high {
        display: inline-block !important;
        background: #d4edda !important;
        color: #1a5c35 !important;
        font-size: 7px !important;
        font-weight: 700 !important;
        letter-spacing: 0.08em !important;
        text-transform: uppercase !important;
        padding: 1px 5px !important;
        border-radius: 2px !important;
        margin-left: 3px !important;
        vertical-align: middle !important;
        white-space: nowrap !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .conf-medium {
        display: inline-block !important;
        background: #fff3cd !important;
        color: #7a5c00 !important;
        font-size: 7px !important;
        font-weight: 700 !important;
        letter-spacing: 0.08em !important;
        text-transform: uppercase !important;
        padding: 1px 5px !important;
        border-radius: 2px !important;
        margin-left: 3px !important;
        vertical-align: middle !important;
        white-space: nowrap !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .conf-low {
        display: inline-block !important;
        background: #fde8d8 !important;
        color: #8b3a1a !important;
        font-size: 7px !important;
        font-weight: 700 !important;
        letter-spacing: 0.08em !important;
        text-transform: uppercase !important;
        padding: 1px 5px !important;
        border-radius: 2px !important;
        margin-left: 3px !important;
        vertical-align: middle !important;
        white-space: nowrap !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 9px !important;
        margin: 12px 0 !important;
        page-break-inside: avoid !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      th {
        background: #1a3325 !important;
        color: #f5f0e8 !important;
        padding: 7px 10px !important;
        text-align: left !important;
        font-weight: 700 !important;
        font-size: 8.5px !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        border: 1px solid #1a3325 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      td {
        padding: 6px 10px !important;
        border: 1px solid #d4c4a8 !important;
        font-size: 9px !important;
        line-height: 1.5 !important;
        vertical-align: top !important;
        color: #3d3020 !important;
      }
      tr:nth-child(even) td {
        background: #faf6ef !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `}</style>

  {/* PAGE 1: COVER */}
  <div style={{ padding: "220px 50px", pageBreakAfter: "always", textAlign: "center", border: `8px solid ${P.forest}`, boxSizing: "border-box", minHeight: "100vh" }}>
    <div style={{ marginBottom: 40 }}>
      <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 42, fontWeight: 700, color: P.forest, marginBottom: 15, letterSpacing: "0.02em" }}>
        {company.toUpperCase()}
      </h1>
      <div style={{ width: 80, height: 4, background: P.terra, margin: "0 auto" }}></div>
    </div>
    
    <p style={{ fontSize: 18, color: P.inkSoft, marginBottom: 12, fontWeight: 500 }}>
      {companyMode === 'acquired' && acquirer.trim() ? `Acquisition Analysis: ${acquirer.trim()} × ${company}` : companyMode === 'parent' && parentCo.trim() ? `${company} · Brand within ${parentCo.trim()}` : `Strategic Intelligence Analysis: ${company}`} · 2026
    </p>
    
    <p style={{ fontSize: 13, color: P.inkFaint, marginBottom: 50 }}>
      Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • Completed in {formatTime(elapsed)} minutes
    </p>
    
    <div style={{ background: P.parchment, padding: "25px 30px", borderRadius: 6, maxWidth: 500, margin: "0 auto", border: `1px solid ${P.sand}` }}>
      <p style={{ fontSize: 11, color: P.inkMid, lineHeight: 1.7, margin: 0 }}>
        Strategic synthesis from 10 parallel intelligence agents analyzing market position, portfolio optimization, brand evolution, margin improvement, growth channels, competitive dynamics, operational synergies, and platform expansion opportunities.
      </p>
    </div>
    
    <div style={{ marginTop: 60, fontSize: 9, color: P.inkFaint, textTransform: "uppercase", letterSpacing: "0.15em" }}>
      Advisor Sprint — Strategic Intelligence System
    </div>
  </div>

  {/* PAGE 2: ASSUMPTIONS & SOURCES */}
  <div style={{ padding: "20px 50px 40px 50px", pageBreakAfter: "always" }}>
        <div className="no-screen"><div style={{ background: P.forest, padding: "14px 20px", borderBottom: `3px solid ${P.forestMid}`, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: P.parchment, letterSpacing: ".03em" }}>
                <span style={{ fontWeight: 400, fontStyle: "italic" }}>Advisor</span><span>Sprint</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: P.parchment, opacity: 0.9 }}>
                PARALLEL AGENT INTELLIGENCE
              </div>
            </div>
            <div style={{ background: P.terra, color: P.white, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", padding: "5px 12px", borderRadius: 12 }}>
              HARSHA BELAVADY
            </div>
          </div>
        </div></div>
    <div className="section-header">
      <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: P.forest, margin: 0 }}>
        Assumptions & Sources
      </h2>
      <p style={{ fontSize: 11, color: P.inkSoft, marginTop: 8, fontStyle: "italic" }}>
        Data foundation and analytical framework for this analysis
      </p>
    </div>

    <div style={{ background: P.parchment, padding: 20, borderRadius: 4, marginBottom: 25 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: P.forest, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Key Contextual Assumptions
      </h3>
      <p style={{ fontSize: 10, lineHeight: 1.9, color: P.inkMid, margin: 0 }}>
        {companyMode === 'acquired' && acquirer.trim() ? `${acquirer.trim()} acquired ${company}. This analysis assesses post-acquisition strategic opportunities.` : companyMode === 'parent' && parentCo.trim() ? `${company} is a brand within ${parentCo.trim()}. This analysis treats ${parentCo.trim()}'s infrastructure as the operating reality and focuses on ${company}'s category strategy, differentiation, and growth within that context.` : `This is a standalone strategic analysis of ${company} conducted in 2026.`}
        Manufacturing remains with co-packers unless otherwise stated in context.
        All market data and performance metrics are discovered through live web search at time of generation — figures reflect the best available public information and are labelled by confidence level throughout.
      </p>
    </div>

    <div style={{ marginBottom: 25 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: P.forest, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Sources Referenced in This Analysis
      </h3>
      {sources.length > 0 ? (
        <div>
          <p style={{ fontSize: 9.5, color: P.inkFaint, marginBottom: 12, fontStyle: "italic" }}>
            The following sources were retrieved by agents during live web search. All searches conducted at time of generation.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5 }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 10px", textAlign: "left", border: `1px solid ${P.sand}`, background: P.forest, color: P.white, fontWeight: 600, width: "55%" }}>Source</th>
                <th style={{ padding: "8px 10px", textAlign: "left", border: `1px solid ${P.sand}`, background: P.forest, color: P.white, fontWeight: 600, width: "20%" }}>Agent</th>
                <th style={{ padding: "8px 10px", textAlign: "left", border: `1px solid ${P.sand}`, background: P.forest, color: P.white, fontWeight: 600, width: "25%" }}>Domain</th>
              </tr>
            </thead>
            <tbody>
              {sources.slice(0, 15).map((s, i) => {
                const domain = (() => { try { return new URL(s.url).hostname.replace('www.',''); } catch { return s.url; } })();
                const agentLabel = AGENTS.find(a => a.id === s.agent)?.label?.split(' ')[0] || s.agent;
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? P.white : P.parchment }}>
                    <td style={{ padding: "7px 10px", border: `1px solid ${P.sand}`, color: P.inkMid, wordBreak: "break-word" }}>
                      {s.title && s.title !== s.url ? s.title.slice(0, 80) + (s.title.length > 80 ? '…' : '') : domain}
                    </td>
                    <td style={{ padding: "7px 10px", border: `1px solid ${P.sand}`, color: P.inkFaint, fontSize: 8.5 }}>{agentLabel}</td>
                    <td style={{ padding: "7px 10px", border: `1px solid ${P.sand}`, color: P.terra, fontSize: 8.5 }}>{domain}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sources.length > 15 && (
            <p style={{ fontSize: 9, color: P.inkFaint, marginTop: 8, fontStyle: "italic" }}>
              Total sources retrieved across all agents: {sources.length}. Top 15 shown above.
            </p>
          )}
        </div>
      ) : (
        <div style={{ background: P.parchment, padding: 18, borderRadius: 4, borderLeft: `4px solid ${P.sand}` }}>
          <p style={{ fontSize: 10, color: P.inkFaint, margin: 0, fontStyle: "italic", lineHeight: 1.8 }}>
            This run used MOCK data — no live web search was performed. In a live run, sources retrieved by each agent during web search will appear here as a table with article title, domain, and the agent that fetched them. Each claim in agent outputs is labelled High / Medium / Low confidence with the reasoning shown in brackets.
          </p>
        </div>
      )}
    </div>

    <div style={{ marginTop: 20, padding: 16, background: P.terracream, borderLeft: `4px solid ${P.terra}`, borderRadius: 3 }}>
      <p style={{ fontSize: 9.5, color: P.inkMid, lineHeight: 1.65, margin: 0 }}>
        <strong style={{ color: P.terra }}>On confidence levels:</strong> Every number in this report carries an inline confidence label — High (directly from a cited source), Medium (triangulated from multiple signals), or Low (logical inference, treat as directional). Where data is unavailable, estimates are clearly marked with the reasoning used to derive them.
      </p>
    </div>
  </div>



{results.synopsis && (
    <div id="section-synopsis" style={{ padding: "20px 50px 40px 50px" }}>
        <div className="no-screen"><div style={{ background: P.forest, padding: "14px 20px", borderBottom: `3px solid ${P.forestMid}`, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: P.parchment, letterSpacing: ".03em" }}>
                <span style={{ fontWeight: 400, fontStyle: "italic" }}>Advisor</span><span>Sprint</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: P.parchment, opacity: 0.9 }}>
                PARALLEL AGENT INTELLIGENCE
              </div>
            </div>
            <div style={{ background: P.terra, color: P.white, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", padding: "5px 12px", borderRadius: 12 }}>
              HARSHA BELAVADY
            </div>
          </div>
        </div></div>
      <div className="section-header" style={{ marginBottom: 25 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={{ fontSize: 28, color: P.terraSoft }}>◉</span>
          <div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: P.forest, margin: 0 }}>
              Executive Synopsis
            </h2>
            <p style={{ fontSize: 11, color: P.inkSoft, fontStyle: "italic", marginTop: 6, marginBottom: 0 }}>
              {companyMode === 'acquired' && acquirer.trim() ? `Strategic synthesis — Post-acquisition growth brief` : companyMode === 'parent' && parentCo.trim() ? `Strategic synthesis — Brand strategy within ${parentCo.trim()}` : `Strategic synthesis — Standalone growth brief`}
            </p>
          </div>
        </div>
      </div>
      
      <div 
        className="agent-content" 
        style={{ fontSize: 11.5, lineHeight: 1.85, color: P.inkMid }} 
        dangerouslySetInnerHTML={{ __html: md(results.synopsis) }} 
      />
      
      <div style={{ pageBreakAfter: "always", height: 20 }}></div>
    </div>
  )}

  {/* PAGES 6-14: INDIVIDUAL AGENTS WITH ENHANCED FORMATTING */}
  {AGENTS.filter(a => a.id !== 'synopsis').map((agent, index) => {
    const result = results[agent.id];
    if (!result) return null;
    
    const isLastAgent = index === AGENTS.filter(a => a.id !== 'synopsis').length - 1;
    
    return (
      <div 
        key={agent.id}
        id={`section-${agent.id}`}
        style={{ 
          pageBreakBefore: "always", 
          pageBreakAfter: isLastAgent ? "auto" : "always", 
          padding: "20px 50px 40px 50px" 
        }}
      >
        <div className="no-screen"><div style={{ background: P.forest, padding: "14px 20px", borderBottom: `3px solid ${P.forestMid}`, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: P.parchment, letterSpacing: ".03em" }}>
                <span style={{ fontWeight: 400, fontStyle: "italic" }}>Advisor</span><span>Sprint</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: P.parchment, opacity: 0.9 }}>
                PARALLEL AGENT INTELLIGENCE
              </div>
            </div>
            <div style={{ background: P.terra, color: P.white, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", padding: "5px 12px", borderRadius: 12 }}>
              HARSHA BELAVADY
            </div>
          </div>
        </div></div>
        <div className="section-header" style={{ marginBottom: 25, pageBreakAfter: "avoid" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 10 }}>
            <span style={{ fontSize: 28, color: agent.wave === 1 ? P.forestSoft : P.terraSoft }}>
              {agent.icon}
            </span>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: P.forest, margin: 0 }}>
              {agent.label}
            </h2>
          </div>
          <p style={{ fontSize: 11, color: P.inkSoft, fontStyle: "italic", margin: 0, paddingLeft: 43 }}>
            {agent.sub}
          </p>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: agent.wave === 1 ? P.forestSoft : P.terraSoft, marginTop: 10, paddingLeft: 43 }}>
            WAVE {agent.wave} • AGENT {index + 1} OF 10
          </div>
        </div>
        
        {/* Section summary callout — pulled from verdictRow */}
        {dataBlocks[agent.id]?.verdictRow && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 14,
            padding: "12px 16px", marginBottom: 20,
            background: (() => {
              const v = dataBlocks[agent.id].verdictRow.verdict;
              return { STRONG: "#e8f5ee", WATCH: "#fef3e2", OPTIMISE: "#eff6ff", RISK: "#fdf2f2", UNDERDELIVERED: "#fdf2f2" }[v] || "#f5f5f5";
            })(),
            border: "1px solid",
            borderColor: (() => {
              const v = dataBlocks[agent.id].verdictRow.verdict;
              return { STRONG: "#2d7a4f40", WATCH: "#c97d2040", OPTIMISE: "#2563eb40", RISK: "#c0392b40", UNDERDELIVERED: "#c0392b40" }[v] || "#ddd";
            })(),
            borderLeft: "4px solid",
            borderLeftColor: (() => {
              const v = dataBlocks[agent.id].verdictRow.verdict;
              return { STRONG: "#2d7a4f", WATCH: "#c97d20", OPTIMISE: "#2563eb", RISK: "#c0392b", UNDERDELIVERED: "#c0392b" }[v] || "#999";
            })(),
            borderRadius: "0 4px 4px 0",
            pageBreakInside: "avoid",
          }}>
            <div style={{ flexShrink: 0 }}>
              <span style={{
                display: "inline-block",
                background: (() => {
                  const v = dataBlocks[agent.id].verdictRow.verdict;
                  return { STRONG: "#e8f5ee", WATCH: "#fef3e2", OPTIMISE: "#eff6ff", RISK: "#fdf2f2", UNDERDELIVERED: "#fdf2f2" }[v] || "#f5f5f5";
                })(),
                color: (() => {
                  const v = dataBlocks[agent.id].verdictRow.verdict;
                  return { STRONG: "#2d7a4f", WATCH: "#c97d20", OPTIMISE: "#2563eb", RISK: "#c0392b", UNDERDELIVERED: "#c0392b" }[v] || "#666";
                })(),
                fontFamily: "monospace", fontSize: 9, fontWeight: 700,
                padding: "3px 10px", borderRadius: 3,
                border: "1px solid currentColor", letterSpacing: ".06em",
              }}>
                {dataBlocks[agent.id].verdictRow.verdict}
              </span>
            </div>
            <div style={{ fontSize: 11, color: P.inkMid, lineHeight: 1.55, fontStyle: "italic" }}>
              {dataBlocks[agent.id].verdictRow.finding}
            </div>
          </div>
        )}

        <div 
          className="agent-content" 
          data-wave={agent.wave} 
          style={{ fontSize: 11.5, lineHeight: 1.85, color: P.inkMid }} 
          dangerouslySetInnerHTML={{ __html: md(result) }} 
        />

        {/* ── DataBlock Inspector ── diagnostic panel, screen-only ── */}
        <DataBlockInspector agentId={agent.id} agentLabel={agent.label} db={dataBlocks[agent.id]} />

      </div>
    );
  })}
</div>
    </div>
  );
}
