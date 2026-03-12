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

First: what is [PARENT]'s infrastructure delivering in hard numbers today? Distribution reach achieved vs. target, manufacturing cost vs. independent benchmark, procurement savings realised. Search for evidence — do not assume benefits are captured just because the assets exist.

Second: where is integration underperforming? Identify specific gaps — distribution velocity below category benchmarks, margin compression from internal transfer pricing, quality variance from parent manufacturing, brand dilution from mass-channel overexposure, innovation slowdown from approval layers. Name what the data suggests is not working.

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
  { "asset": "Asset name", "valueCr": 0, "ease": 0, "status": "activated|partial|untapped", "acquirerName": "[ACQUIRER]" }
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
        ${heatCell(row.companyPresence||row.[company]Presence)}${heatCell(row.categoryGrowth)}${heatCell(row.competitiveDensity)}
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
    const maxPos=Math.max(...db.skuMatrix.map(s=>s.companyPosition||s.[company]Position||1),1);
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
      const x = PL + ((s.companyPosition||s.[company]Position||0)/maxPos)*cw;
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
    h += sectionLabel('9-Agent Intelligence Dashboard');
    const vColor=v=>({STRONG:V.green,WATCH:V.amber,OPTIMISE:V.blue,UNDERDELIVERED:V.red,RISK:V.red}[v]||'#666');
    const vBg=v=>({STRONG:V.greenBg,WATCH:V.amberBg,OPTIMISE:V.blueBg,UNDERDELIVERED:V.redBg,RISK:V.redBg}[v]||'#f0f0f0');
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
  // Set module-level currency vars so all sub-renderers pick them up
  CUR = (market === "US" || market === "Global") ? "$" : "₹";
  UNIT = (market === "US" || market === "Global") ? "M" : "Cr";
  if (!db) return '';
  let h = '';
  h += renderKPIs(db.kpis);
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
  h += renderVerdict(db.verdictRow);
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
        return \`<div style="margin:14px 0 4px;padding:10px 14px;background:#faf7f2;border-left:3px solid #c97d20;border-radius:0 3px 3px 0;font-size:9px;line-height:1.65;color:#3d3020;">\${cleaned}</div>\`;
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


  // ── VERDICT MATRIX PAGE ──────────────────────────────────────────────────
  const verdictMatrixHtml = (() => {
    const agentMeta = [
      { id: 'market',      num: '01', title: 'Market Position & Category Dynamics' },
      { id: 'portfolio',   num: '02', title: 'Portfolio Strategy & SKU Rationalization' },
      { id: 'brand',       num: '03', title: 'Brand Positioning & Storytelling' },
      { id: 'margins',     num: '04', title: 'Margin Improvement & Unit Economics' },
      { id: 'growth',      num: '05', title: 'Growth Strategy & Channel Orchestration' },
      { id: 'competitive', num: '06', title: 'Competitive Battle Plan' },
      { id: 'synergy',     num: '07', title: 'Strategic Leverage & Growth Enablers' },
      { id: 'platform',    num: '08', title: 'Platform Expansion & Adjacency Strategy' },
      { id: 'intl',        num: '09', title: 'International Benchmarks & Global Playbook' },
    ];
    const vColor = v => ({ STRONG: '#2d7a4f', WATCH: '#c97d20', OPTIMISE: '#2563eb', UNDERDELIVERED: '#c0392b', RISK: '#c0392b' }[v] || '#666');
    const vBg    = v => ({ STRONG: '#e8f5ee', WATCH: '#fef3e2', OPTIMISE: '#eff6ff', UNDERDELIVERED: '#fdf2f2', RISK: '#fdf2f2' }[v] || '#f5f5f5');
    const rows = agentMeta.map(ag => {
      const db = dataBlocks[ag.id];
      const verdict  = db?.verdictRow?.verdict  || '—';
      const finding  = db?.verdictRow?.finding  || 'Analysis in progress';
      const conf     = db?.verdictRow?.confidence || '—';
      const vc = vColor(verdict), vb = vBg(verdict);
      return `
        <tr>
          <td style="padding:10px 14px;border:1px solid #e0d8cc;background:#faf7f2;font-family:monospace;font-size:8px;font-weight:700;color:#b85c38;width:36px;">${ag.num}</td>
          <td style="padding:10px 14px;border:1px solid #e0d8cc;background:#fff;font-size:9px;font-weight:600;color:#1a3a2a;width:200px;">${ag.title}</td>
          <td style="padding:10px 14px;border:1px solid #e0d8cc;background:${vb};text-align:center;width:100px;">
            <span style="background:${vb};color:${vc};font-family:monospace;font-size:7.5px;font-weight:700;padding:4px 10px;border-radius:3px;border:1px solid ${vc}30;letter-spacing:.06em;white-space:nowrap;">${verdict}</span>
          </td>
          <td style="padding:10px 14px;border:1px solid #e0d8cc;background:#fff;font-size:8.5px;color:#3a3a3a;line-height:1.5;">${finding}</td>
          <td style="padding:10px 14px;border:1px solid #e0d8cc;background:#faf7f2;text-align:center;width:36px;">
            <span style="font-family:monospace;font-size:7px;font-weight:700;color:${conf==='H'?'#2d7a4f':conf==='M'?'#c97d20':'#aaa'};">${conf}</span>
          </td>
        </tr>`;
    }).join('');

    return `
    <div style="width:794px;min-height:1122px;position:relative;background:#fff;page-break-after:always;overflow:hidden;">
      ${header('VERDICT MATRIX · 9-AGENT INTELLIGENCE SUMMARY')}
      <div style="padding:26px 50px 36px;">
        <div style="font-family:monospace;font-size:7px;letter-spacing:.18em;text-transform:uppercase;color:#b85c38;margin-bottom:4px;">Strategic Intelligence Snapshot</div>
        <div style="font-family:'Playfair Display',serif;font-size:22px;color:#1a3a2a;font-weight:700;margin-bottom:3px;">Verdict Matrix</div>
        <div style="height:2px;background:linear-gradient(90deg,#1a3a2a 0%,#b85c38 40%,transparent 100%);margin-bottom:18px;"></div>
        <p style="font-size:8.5px;color:#666;margin-bottom:18px;line-height:1.6;">One verdict and one finding per agent. Read this page first — it tells you where the business is strong, where to watch, and where the risk is. Drill into the full agent analysis for the reasoning.</p>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="background:#1a3a2a;color:#fff;padding:8px 14px;text-align:left;font-size:7px;letter-spacing:.1em;border:1px solid #1a3a2a;">#</th>
              <th style="background:#1a3a2a;color:#fff;padding:8px 14px;text-align:left;font-size:7px;letter-spacing:.1em;border:1px solid #1a3a2a;">Agent</th>
              <th style="background:#1a3a2a;color:#fff;padding:8px 14px;text-align:center;font-size:7px;letter-spacing:.1em;border:1px solid #1a3a2a;">Verdict</th>
              <th style="background:#1a3a2a;color:#fff;padding:8px 14px;text-align:left;font-size:7px;letter-spacing:.1em;border:1px solid #1a3a2a;">Key Finding</th>
              <th style="background:#1a3a2a;color:#fff;padding:8px 14px;text-align:center;font-size:7px;letter-spacing:.1em;border:1px solid #1a3a2a;">Conf</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
          ${['STRONG:#2d7a4f:#e8f5ee', 'WATCH:#c97d20:#fef3e2', 'OPTIMISE:#2563eb:#eff6ff', 'RISK:#c0392b:#fdf2f2'].map(s => {
            const [label, fg, bg] = s.split(':');
            return `<span style="background:${bg};color:${fg};font-family:monospace;font-size:7px;font-weight:700;padding:4px 10px;border-radius:3px;border:1px solid ${fg}30;">${label}</span>`;
          }).join('')}
          <span style="font-size:7.5px;color:#999;margin-left:4px;align-self:center;">Conf: H = High · M = Medium · L = Low</span>
        </div>
      </div>
      ${footer(2)}
    </div>`;
  })();

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

${verdictMatrixHtml}
${sourcesHtml}
${synopsisHtml}
${agentPageHtml}

</body>
</html>`;
}

function makePrompt(id, company, acquirer, ctx, synthCtx, market="India", parentCo="", companyMode="standalone", parentSince="") {
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
 used inside individual agent prompts
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
  
  if (ctx) {
    prompt = metaPrefix + NARRATIVE_RULES + `USER CONTEXT:
${ctx}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

` + prompt;
  } else {
    prompt = metaPrefix + NARRATIVE_RULES + prompt;
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
      html += \`<div style="margin:14px 0;">
        <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#b85c38;margin-bottom:8px;padding-bottom:5px;border-bottom:2px solid #b85c38;">CONTRADICTIONS & TENSIONS</div>
        \${contraParas.map(p => \`<div style="padding:10px 14px;background:#fff8f5;border-left:3px solid #b85c38;margin-bottom:6px;font-size:9px;line-height:1.65;color:#3d3020;border-radius:0 3px 3px 0;">\${p.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</div>\`).join('')}
      </div>\`;
    }

    // Extract TWO FUTURES (## PART 3)
    const futuresMatch = fixedText.match(/##\s*PART\s*3[:\s—]*TWO FUTURES[\s\S]*?\n([\s\S]+?)(?=\n##\s*PART|$)/i);
    if (futuresMatch) {
      const futureParas = futuresMatch[1].trim().split(/\n\n+/).filter(p => p.trim());
      const colors = ['#e8f5ee:#2d7a4f', '#fdf2f2:#c0392b'];
      html += \`<div style="margin:14px 0;">
        <div style="font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1a3325;margin-bottom:8px;padding-bottom:5px;border-bottom:2px solid #1a3325;">TWO FUTURES</div>
        \${futureParas.slice(0,2).map((p,i) => {
          const [bg, border] = colors[i].split(':');
          return \`<div style="padding:10px 14px;background:\${bg};border-left:3px solid \${border};margin-bottom:6px;font-size:9px;line-height:1.65;color:#3d3020;border-radius:0 3px 3px 0;">\${p.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</div>\`;
        }).join('')}
      </div>\`;
    }

    // Extract ANALYST'S GUT CALL (## PART 4)
    const gutMatch = fixedText.match(/##\s*PART\s*4[:\s—]*.*GUT[\s\S]*?\n([\s\S]+?)(?=\n##|$)/i);
    if (gutMatch) {
      const gutText = gutMatch[1].trim().replace(/\n/g,' ');
      html += \`<div style="margin:14px 0;padding:14px 18px;background:#1a3325;border-radius:4px;">
        <div style="font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px;">THE ANALYST'S GUT CALL</div>
        <p style="font-size:10px;line-height:1.7;color:rgba(255,255,255,.9);font-style:italic;margin:0;">\${gutText.replace(/\*\*(.+?)\*\*/g,'<strong style=\"color:#fff\">$1</strong>')}</p>
      </div>\`;
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
  const [sources, setSources] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [elapsed, setElapsed] = useState(0);
  // Removed unused state: pdfs, setPdfs, userName, setUserName, showDash, setShowDash
  
  const abortRef = useRef(null);
  const timerRef = useRef(null);

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
        (a.id === 'intl'        && prompt.includes('INTERNATIONAL BENCHMARKS'))
      )?.id || 'market';
      return MOCK[mockId] || MOCK.market;
    }

    // Real mode — retry once on network error or rate limit
    // Synopsis uses Opus and takes 3-4 min — QUIC protocol errors are common on long streams
    const attemptFetch = () => fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tool-name': 'advisor',
        'Connection': 'keep-alive',
      },
      signal,
      body: JSON.stringify({ prompt, agentId, market }),
    });

    let res;
    try {
      res = await attemptFetch();
    } catch (networkErr) {
      // Network error (ERR_QUIC_PROTOCOL_ERROR etc) — wait 8s and retry once
      if (signal.aborted) throw networkErr;
      console.warn(`[${agentId}] Network error, retrying in 8s:`, networkErr.message);
      setStatuses(s => ({ ...s, [agentId]: 'retrying…' }));
      await new Promise(r => setTimeout(r, 8000));
      if (signal.aborted) throw networkErr;
      res = await attemptFetch();
    }
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || `Server error: ${res.status}`);
    }

    // Read the SSE stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

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

    return fullText;
  }, [setSources, setStatuses]); // callClaude has no dependencies - uses only parameters and constants

  const runAgent = useCallback(async (id, prompt, signal, docs) => {
    try {
      const text = await callClaude(prompt, id, signal);
      if (!signal.aborted) {
        // Strip DATA_BLOCK from display — keep only prose for reader
        const dbMatch = text.match(/<<<DATA_BLOCK>>>[\s\S]*?```json([\s\S]*?)```[\s\S]*?<<<END_DATA_BLOCK>>>|<<<DATA_BLOCK>>>([\s\S]*?)<<<END_DATA_BLOCK>>>/);
        const cleanText = text.replace(/<<<DATA_BLOCK>>>[\s\S]*?<<<END_DATA_BLOCK>>>/g, '').trim();
        if (dbMatch) {
          try {
            const raw = (dbMatch[1] || dbMatch[2] || '').trim();
            const cleaned = raw.replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'').trim();
            const parsed = JSON.parse(cleaned);
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

  const runSprint = async () => {
    if (!company.trim() || appState === "running") return;
    if (abortRef.current) abortRef.current.abort(); // kill any zombie from previous run

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const signal = ctrl.signal;
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    
    setAppState("preparing");
    setResults({});
    setSources([]);
    setElapsed(0);

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
        : [...W1, ...W2, 'synopsis'];

      for (const id of ALL_AGENTS_ORDERED) {
        if (signal.aborted) break;

        setStatuses(s => ({ ...s, [id]: "running" }));

        // synopsis gets all prior outputs; W2 agents get W1 outputs; W1 gets nothing
        // For synopsis: trim each agent output to 2500 chars to reduce prompt size
        // and avoid QUIC timeout on very long Opus requests
        let ctx_for_agent = {};
        if (id === 'synopsis') {
          ctx_for_agent = w1texts; // Full outputs passed — makePrompt handles per-agent trimming
        } else if (W2.includes(id)) {
          ctx_for_agent = w1texts;
        }
        const prompt = makePrompt(id, co, acq, ctx, ctx_for_agent, market, parentCo.trim(), companyMode, parentSince.trim());
        let text = "";
        try {
          text = await runAgent(id, prompt, signal, []);
        } catch(agentErr) {
          // Agent failed — stop the sprint, don't run remaining agents
          console.error(`[Sprint] Agent ${id} failed:`, agentErr.message);
          setAppState("error");
          return; // exits runSprint entirely — no more API calls
        }
        w1texts[id] = text;

        // Gap after each agent — keeps tokens under rate limit (skip in test mode)
        if (!signal.aborted && id !== 'synopsis') {
          setStatuses(s => ({ ...s, [id]: "done" }));
          if (!testMode) await new Promise(r => setTimeout(r, 60000));
        }
      }

      if (!signal.aborted) {
        setAppState("done");
        gaEvent("sprint_completed", { company: co, time_seconds: elapsed });
      }

    } catch (e) {
      console.error("Sprint error:", e);
      setAppState("error");
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
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
      const html = buildPDFHtml({ company, acquirer, parentCo, parentSince, companyMode, results, dataBlocks, sources, elapsed, market });
      const pdfRes = await fetch(API_URL.replace('/api/claude', '/api/pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                onClick={runSprint}
                disabled={!company.trim() || appState === "running"}
                style={{ padding: "12px 24px", background: appState === "running" ? P.inkFaint : testMode ? P.gold : P.forest, color: P.white, border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 14, fontWeight: 600, cursor: appState === "running" ? "not-allowed" : "pointer" }}
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

              {appState === "done" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={generatePDF}
                    disabled={pdfGenerating}
                    style={{ padding: "12px 24px", background: pdfGenerating ? "#999" : P.terra, color: P.white, border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 14, fontWeight: 600, cursor: pdfGenerating ? "not-allowed" : "pointer" }}>
                    {pdfGenerating ? "⟳ Generating PDF..." : "⬇ Download PDF"}
                  </button>
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
                      <div style={{ fontFamily: "'Instrument Sans'", fontSize: 11, fontWeight: 600, color: status === "done" ? "#28a745" : status === "running" ? "#fd7e14" : P.inkFaint }}>
                        {status === "done" ? "✓" : status === "running" ? "⟳" : status === "error" ? "✗" : "○"}
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
