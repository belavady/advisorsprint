import { useState, useEffect, useRef, useCallback } from "re

PROMPTS.intl = `# AGENT 10: INTERNATIONAL BENCHMARKS & GLOBAL PLAYBOOK

You are a global strategy analyst. Your job is to find the two or three brands in international markets that most closely mirror [COMPANY]'s current situation — a premium nutrition or health food brand navigating the transition from D2C insurgency to omnichannel scale, specifically through Modern Trade and Quick Commerce — and extract the lessons that ITC can actually use.

This is not a survey of global health food brands. It is a targeted search for the most relevant analogs to [COMPANY]'s specific challenge: how do you sustain growth and margin when the D2C CAC model starts straining, MT expansion brings volume but risks brand dilution, and QC creates a new impulse channel that didn't exist when the brand was built?

**Context:** ITC acquired [COMPANY] in 2023. [COMPANY] was growing >60% YoY, built on D2C and e-commerce, beginning to scale Modern Trade. It is now 2026. The question is what the next phase looks like — and whether any brand internationally has already navigated this transition and left a map.

---

## STEP 1: QUALIFY FIRST, THEN SELECT

Do not start with brand names. Run all searches below, then score every candidate against the six criteria. The brands with the highest scores are your analogs — geography is secondary.

**Scoring criteria — one point per criterion met:**

1. Started as D2C or digitally-native in health food / nutrition / better-for-you snacking
2. Navigated expansion into Modern Trade or equivalent physical retail at meaningful scale
3. Operates in a market where Quick Commerce or rapid grocery delivery became a significant channel
4. Maintained premium positioning through mass channel expansion — did not collapse to commodity pricing
5. Was acquired by or partnered with a large FMCG conglomerate, OR scaled independently without losing brand identity
6. Revenue equivalent to ₹100–500 Cr at the MT/QC transition point — same scale as [COMPANY] now

**A brand scoring 4+ qualifies.** From all qualifying brands, select the 2–3 with the most distinct, non-overlapping lessons. If two brands teach the same lesson, keep the better-documented one. Geographic diversity is a bonus — never include a weak analog to fill a region. If fewer than two brands reach 4+, lower threshold to 3 and note the missing criterion.

**Run these searches before scoring:**
\`\`\`
RxBar growth story D2C to retail Kellogg acquisition outcome brand health
RXBAR Kellogg post-acquisition brand independence revenue 2022 2023 2024
Kind Bar Modern Trade international expansion FMCG growth story
Grenade bar UK Modern Trade revenue growth story
Grenade Mondelez acquisition 2021 brand strategy post-acquisition outcome
Fulfil nutrition bar Ireland UK growth revenue Modern Trade
Barebells protein bar Sweden Europe Modern Trade expansion revenue 2023 2024
Barebells international growth story acquisition
Huel D2C to retail UK Europe revenue growth story 2023 2024
Nature's Bakery Walmart D2C to retail strategy
US health food brand D2C to Quick Commerce grocery delivery 2023 2024
UK protein bar brand Quick Commerce Deliveroo Getir expansion 2023 2024
GCC UAE health food brand D2C to Modern Trade growth story
Middle East nutrition brand quick commerce Talabat Noon Food 2023 2024
GCC premium food brand MT QC post-acquisition strategy
FMCG acquires D2C nutrition brand brand independence case study result
D2C nutrition brand retail expansion brand dilution evidence data
\`\`\`

**After scoring, state the full qualifying set explicitly** — every brand considered, its score, which criteria it meets. Then state your 2–3 selections and why their lessons are non-overlapping.

---

## STEP 2: FOR EACH ANALOG — THE GROWTH STORY

For each selected brand, tell the story in one tight narrative section. This is business journalism, not a case study template. Hemant should read it and think: *this is the path [COMPANY] is about to walk.*

**Cover these five elements per analog:**

**How they started:** The founding proposition. What made them win early — the specific product or positioning insight that gave them a right to exist in the category before they had scale.

**The MT/QC transition — what actually happened:** When and why they moved into Modern Trade or Quick Commerce. What had to change — pricing, packaging, SKU architecture, positioning. What went wrong in the first attempt and how they corrected. Be specific. A story with no friction is not a useful story.

**The acquisition or partnership (if applicable):** What changed and what stayed the same after an FMCG acquirer came in. Whether the acquirer's distribution accelerated them or created inertia. What the brand health outcome was — did acquisition help or hurt consumer perception, and is there data on it.

**The growth numbers:** Revenue at key inflection points — early D2C phase, MT/QC transition, current or last known state. If precise numbers are not publicly available, estimate using the same four-method triangulation logic as Agent 1 (funding rounds, valuation multiples, market share estimates). Show the basis. Do not invent numbers.

**Where they are now:** Current competitive position. Is the brand still compounding or has it plateaued after MT expansion? Did mass channel entry dilute premium positioning measurably?

---

## STEP 3: THE TRANSFERABLE PLAYBOOK — FIVE LESSONS

This section has the highest strategic value. Not "do what Brand X did." The specific mechanisms that worked, why they worked, and what the equivalent action is for [COMPANY] in India in 2026.

**Structure each lesson as a dense paragraph covering:**
- What the analog brand specifically did (one sentence, sourced)
- The causal mechanism — why it worked, not "they executed well"
- The [COMPANY]-specific translation — what the equivalent action looks like given ITC's institutional assets and India's market structure
- The one condition that must be true for this lesson to transfer — if the condition is absent, state that clearly
- The risk of misapplication — what happens if [COMPANY] copies the surface without the underlying condition

Target five non-overlapping lessons, each addressing a different dimension of the MT/QC transition: pricing architecture, SKU rationalisation for retail, brand identity through acquisition, QC-native product formats, and D2C retention mechanics while scaling offline.

---

## STEP 4: WHAT ITC SHOULD DO DIFFERENTLY

The final section. Read Agent 1's strategic implication and Agent 5's growth strategy. Ask: does the international evidence validate or challenge those plans?

Two paragraphs maximum. One on what the evidence validates — where the current plan is consistent with what worked internationally. One on what the evidence challenges or adds — where the international playbooks suggest a move not yet in the plan, or a mistake the analogs made that the current plan risks repeating.

If the evidence is entirely consistent with the current plan, say so. That consistency is itself useful. Do not manufacture a contrarian view.

---

## STEP 5: THE SYNOPSIS HOOK — WRITE THIS LAST

After completing all four sections, write a 4-sentence synopsis hook. This is the exact paragraph Agent 8 (Executive Synopsis) will use to represent this section — written to make Hemant want to turn to the full Agent 10 page.

Format it precisely as:

\`\`\`
◉ INTERNATIONAL BENCHMARKS HOOK (for Agent 8):
[Sentence 1: The single most surprising finding from the analog research — name the brand and the specific non-obvious insight]
[Sentence 2: The single most transferable lesson — stated as a specific action, not a general principle]
[Sentence 3: The one thing the international evidence says ITC is at risk of getting wrong — direct and named]
[Sentence 4: What reading the full section gives Hemant that this paragraph cannot — the payoff]
\`\`\`

This hook must create genuine curiosity. Not "international analogs offer rich lessons" — the specific finding that changes how the India strategy looks when viewed through a global lens.

---

## FORMATTING

- Prose narrative for all growth stories — no bullet points within them
- Playbook lessons as dense paragraphs covering all five elements, not lists
- HTML scoring table after Step 1: Brand | Score (out of 6) | Criteria Met | Region | Selected Y/N
- HTML summary comparison table at the end: Brand | Market | Revenue at Transition | Acquirer | Primary Lesson | ITC Equivalent Action
- Every data point cited with source and date
- Every revenue figure labelled as estimate with basis shown if not publicly disclosed
- Never write "fascinating," "Yogabar can learn a lot from," or "in conclusion"
- Two dense pages. Growth stories page one collectively, playbook and ITC section page two. Stop when nothing non-obvious remains.

---

## LOGIC CHAIN — MANDATORY FOR EVERY LESSON

**EVIDENCE** → What the analog brand actually did (sourced)
**MECHANISM** → Why it worked — the specific causal logic
**TRANSLATION** → The [COMPANY]-specific equivalent action in 2026
**CONDITION** → The one assumption required for transferability
**KPI** → How [COMPANY] would know at Month 6 whether the lesson is working`;act";

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
    @page { margin: 0; size: A4; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body { background: white !important; margin: 0 !important; padding: 0 !important; }
    .no-print { display: none !important; }
    .print-only { display: block !important; }

    p { orphans: 3; widows: 3; }
    h2, h3, h4 { page-break-after: avoid !important; orphans: 4; widows: 4; }

    .pdf-header {
      display: block !important;
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      background: #1a3325 !important;
    }
    .pdf-header * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

    .agent-content {
      max-height: none !important;
      overflow: visible !important;
      padding-top: 0 !important;
      margin-top: 0 !important;
    }

    h2 { page-break-after: avoid !important; page-break-inside: avoid !important; }

    .section-header { border-bottom: 3px solid #1a3325 !important; padding-bottom: 14px !important; margin-bottom: 28px !important; page-break-after: avoid !important; }

    .agent-section-header { font-family: 'Libre Baskerville',serif !important; font-size: 12px !important; font-weight: 700 !important; color: #1a3325 !important; margin: 20px 0 7px !important; padding-bottom: 4px !important; border-bottom: 1.5px solid #d4c4a8 !important; page-break-after: avoid !important; text-transform: uppercase !important; letter-spacing: 0.08em !important; }

    .verdict-box { background: #1a3325 !important; color: #faf8f4 !important; padding: 22px 26px !important; margin: 18px 0 !important; border-radius: 3px !important; page-break-inside: avoid !important; }
    .verdict-label { font-size: 8px !important; font-weight: 700 !important; letter-spacing: 0.18em !important; text-transform: uppercase !important; color: #c8922a !important; margin-bottom: 8px !important; }
    .verdict-text { font-size: 11px !important; line-height: 1.65 !important; color: #f5f0e8 !important; margin: 0 !important; }
    .verdict-metrics { display: flex !important; gap: 28px !important; margin-top: 14px !important; padding-top: 14px !important; border-top: 1px solid rgba(255,255,255,0.2) !important; }
    .verdict-metric-value { font-family: 'Playfair Display',serif !important; font-size: 22px !important; font-weight: 700 !important; color: #c8922a !important; display: block !important; }
    .verdict-metric-label { font-size: 8px !important; color: rgba(255,255,255,0.65) !important; text-transform: uppercase !important; letter-spacing: 0.1em !important; }

    .insight-card { background: #faf8f4 !important; border-left: 4px solid #1a3325 !important; padding: 11px 14px !important; margin: 9px 0 !important; page-break-inside: avoid !important; }
    .insight-card-terra { border-left-color: #b85c38 !important; }
    .insight-card-title { font-size: 7.5px !important; font-weight: 700 !important; letter-spacing: 0.12em !important; text-transform: uppercase !important; color: #1a3325 !important; margin-bottom: 5px !important; }
    .insight-card-title-terra { color: #b85c38 !important; }

    .assumption-box { background: #ede6d6 !important; border: 1px solid #d4c4a8 !important; border-left: 4px solid #6b5c48 !important; padding: 10px 14px !important; margin: 10px 0 !important; font-family: 'JetBrains Mono',monospace !important; font-size: 8px !important; line-height: 1.65 !important; color: #3d3020 !important; page-break-inside: avoid !important; }
    .assumption-label { font-size: 7.5px !important; font-weight: 700 !important; letter-spacing: 0.12em !important; text-transform: uppercase !important; color: #6b5c48 !important; margin-bottom: 6px !important; }

    .selling-story { background: #1a3325 !important; color: #f5f0e8 !important; padding: 18px 22px !important; margin: 14px 0 !important; border-radius: 3px !important; page-break-inside: avoid !important; }
    .selling-story-label { font-size: 7.5px !important; font-weight: 700 !important; letter-spacing: 0.16em !important; text-transform: uppercase !important; color: #c8922a !important; margin-bottom: 8px !important; }
    .selling-story-text { font-size: 10.5px !important; line-height: 1.7 !important; font-style: italic !important; color: #ede6d6 !important; }

    .sprint-block { border: 1px solid #d4c4a8 !important; border-top: 4px solid #1a3325 !important; padding: 12px 16px !important; margin: 10px 0 !important; page-break-inside: avoid !important; }
    .sprint-title { font-size: 8.5px !important; font-weight: 700 !important; letter-spacing: 0.12em !important; text-transform: uppercase !important; color: #1a3325 !important; margin-bottom: 9px !important; }
    .sprint-block-terra { border-top-color: #b85c38 !important; }
    .sprint-title-terra { color: #b85c38 !important; }
    .sprint-block-gold { border-top-color: #c8922a !important; }
    .sprint-title-gold { color: #7a5618 !important; }

    .kpi-row-header td { background: #1a3325 !important; color: #f5f0e8 !important; font-weight: 700 !important; }
    .threshold-warn { color: #b85c38 !important; font-weight: 600 !important; }

    table { page-break-inside: avoid !important; border-collapse: collapse !important; width: 100% !important; }
    table th { background: #ede6d6 !important; font-weight: 700 !important; font-size: 9px !important; padding: 9px 11px !important; text-align: left !important; border: 1px solid #d4c4a8 !important; }
    table td { padding: 8px 11px !important; border: 1px solid #d4c4a8 !important; font-size: 9.5px !important; vertical-align: top !important; }
    table tr:nth-child(even) td { background: #faf8f4 !important; }

    .badge-high { background: #d4f4dd !important; color: #1a6b3c !important; padding: 2px 7px !important; border-radius: 10px !important; font-size: 8px !important; font-weight: 700 !important; }
    .badge-medium { background: #fff3cd !important; color: #856404 !important; padding: 2px 7px !important; border-radius: 10px !important; font-size: 8px !important; font-weight: 700 !important; }
    .badge-low { background: #f8d7da !important; color: #842029 !important; padding: 2px 7px !important; border-radius: 10px !important; font-size: 8px !important; font-weight: 700 !important; }

    .wave-badge { display: inline-block !important; font-size: 7.5px !important; font-weight: 700 !important; letter-spacing: 0.14em !important; text-transform: uppercase !important; padding: 3px 10px !important; border-radius: 2px !important; margin-bottom: 10px !important; }
    .wave-1 { background: #1a3325 !important; color: #f5f0e8 !important; }
    .wave-2 { background: #b85c38 !important; color: #faf8f4 !important; }
    .wave-3 { background: #c8922a !important; color: #1a1208 !important; }

    .pdf-page-footer { position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; height: 26px !important; background: #f5f0e8 !important; border-top: 1px solid #d4c4a8 !important; display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 0 50px !important; font-size: 7.5px !important; color: #9b8c78 !important; letter-spacing: 0.06em !important; }

    p { font-size: 10.5px !important; line-height: 1.75 !important; color: #3d3020 !important; margin: 0 0 7px !important; }
    strong { color: #1a1208 !important; font-weight: 700 !important; }

    /* TOC anchor links */
    .toc-link { text-decoration: none !important; color: inherit !important; display: flex !important; }
    .toc-link:visited { color: inherit !important; }
    a[href^="#"] { text-decoration: none !important; color: inherit !important; }
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
  { id: "portfolio", wave: 1, icon: "◉", label: "Portfolio Strategy & SKU Rationalization", sub: "Product mix, SKU performance, keep/kill/launch + selling story" },
  { id: "brand", wave: 1, icon: "◎", label: "Brand Positioning & Storytelling", sub: "Brand spine, perception, messaging" },
  { id: "margins", wave: 1, icon: "◐", label: "Margin Improvement & Unit Economics", sub: "COGS optimization, channel mix, profitability" },
  { id: "growth", wave: 1, icon: "◆", label: "Growth Strategy & Channel Orchestration", sub: "GTM roadmap, QC, B2B, international" },
  { id: "competitive", wave: 1, icon: "◇", label: "Competitive Battle Plan", sub: "Research-discovered competitor set, attack/defend strategies" },
  { id: "synergy", wave: 2, icon: "◈", label: "Synergy Playbook", sub: "Post-acquisition integration, ITC asset leverage" },
  { id: "platform", wave: 2, icon: "◉", label: "Platform Expansion & D2C Brand Incubator", sub: "Strategic portfolio transformation" },
  { id: "intl", wave: 2, icon: "◎", label: "International Benchmarks & Global Playbook", sub: "Global analogs, MT/QC transitions, transferable lessons" },
  { id: "synopsis", wave: 3, icon: "◉", label: "Executive Synopsis", sub: "Strategic synthesis of all 10 agents — standalone decision brief" },
];

const W1 = AGENTS.filter(a => a.wave === 1).map(a => a.id);
// W2 and W3 not needed - agents run based on wave property directly

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AGENT PROMPTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PROMPTS = {
  market: `# AGENT 1: MARKET POSITION & CATEGORY DYNAMICS

You are a senior strategy analyst. This output will be read by someone who has access to Yogabar's internal financials. If your revenue estimate is directionally wrong, the report loses credibility before page 2. Every number must be arrived at through explicit, traceable logic. Every observation must be one that makes the reader think: *this analyst understood something I hadn't connected.*

**Context:** ITC acquired Yogabar in 2023. It is early 2026, three years post-acquisition. Yogabar was confirmed growing >60% YoY at acquisition. This analysis answers: where does Yogabar actually stand, and what has the market become?

---

## STEP 1: SEARCH BEFORE WRITING ANYTHING

Run all searches below before writing a single sentence. Your output quality is directly proportional to the quality of data you find. Do not rely on training data for any number — it will be wrong.

**Search queries — run all of these:**
\`\`\`
Yogabar revenue 2024 2025
Yogabar ITC annual report OR growth FY25
Yogabar funding rounds valuation 2021 2022 2023
DSGCP "DSG Consumer Partners" Yogabar
"Fireside Ventures" nutrition OR health food India 2024 2025
"Sixth Sense Ventures" consumer FMCG India 2024
"Elevation Capital" consumer D2C India 2024 2025
"Peak XV" OR "Sequoia India" consumer brand annual report 2024
"3one4 capital" OR "Matrix Partners" consumer India 2024
"sauce.vc" food beverage India 2024
Whole Truth Foods revenue 2024 2025
Zydus Wellness annual report 2024 RiteBite nutrition segment
True Elements funding revenue 2024 2025
"Super You" nutrition bar India 2024 2025
Kellogg's India protein bar nutrition 2024 2025
India nutrition bar protein bar market size 2025 Euromonitor OR Redseer OR Nielsen
India health snacks category CAGR 2024 2025
quick commerce health food share India 2025 Redseer OR Blinkit
GoKwik D2C benchmark report India 2024
Shiprocket state of D2C India 2024
India D2C CAC inflation Meta Google 2024
India D2C nutrition brand ROAS benchmark 2024
functional wellness D2C India VC investment 2024 2025
India nutrition bar new brand launched funded 2023 2024 2025
India health food startup funding 2024 2025 Fireside OR DSGCP OR Elevation
India protein bar Blinkit bestseller 2024 2025
India health snack brand top selling Amazon 2024 2025
\`\`\`

**On competitor discovery:** The names Whole Truth, Super You, True Elements, RiteBite, and Kellogg's are seeds — brands known to be in this space. But your search must go beyond them. Search the category broadly: who is topping Blinkit health food rankings, who received VC funding in this category in 2023–2025, who is appearing in "best protein bars India 2025" editorial content. Any brand that appears repeatedly and is not in the seed list must be added to the competitor set and researched. The most dangerous competitor is often the one nobody thought to name.

**Sources to prioritise:**
- DSGCP / Fireside Ventures / Sixth Sense — invested directly in this category; their data is primary
- GoKwik benchmark reports — processes 3,000+ India D2C brands; most reliable D2C metrics source
- Shiprocket / Unicommerce D2C reports — transaction-level benchmarks
- Zydus Wellness annual report — RiteBite parent is listed; segment disclosure may be available
- Entrackr, Inc42, The Ken — funding and revenue disclosures for private brands

---

## STEP 2: REVENUE ESTIMATION — FOUR METHODS, ONE CONVERGENCE

Yogabar's revenue is not publicly disclosed. You must triangulate using all four methods below. A single-method estimate will not be accepted. If methods converge, that is your number. If one is an outlier, explain why and discount it.

---

**METHOD 1: Funding-Implied Revenue**

Indian D2C consumer brands at growth stage raise at 3–6x trailing revenue. Search for:
- Yogabar's total funding raised, round sizes, and approximate dates
- The last major round before or at ITC acquisition (2023)
- Comparable India D2C funding round multiples at similar stage (search recent rounds)

Then: Last round size ÷ revenue multiple range = implied revenue at time of that raise.
Compound forward at >60% YoY to reach FY24, then apply a moderation factor for scale.

Show the table:
\`\`\`
Last known raise: ₹[X] Cr (date: [Y]) [Source]
Revenue multiple at this stage: [Z]x [Source for comparable]
Implied revenue at raise date: ₹[X÷Z] Cr
Growth to FY25 at [rate]%: ₹[result] Cr
METHOD 1 ESTIMATE: ₹[floor–ceiling] Cr
\`\`\`

---

**METHOD 2: Growth Rate Compounding**

The >60% YoY rate was confirmed by ITC at acquisition. Use this as the anchor.

Search for: the most recent credible revenue base figure — any cited number in news,
analyst commentary, or VC firm reference to Yogabar's scale.

Then compound forward, applying realistic moderation for scale. Search for how
comparable Indian D2C brands' growth rates evolved as they crossed ₹100 Cr, ₹200 Cr
revenue thresholds — Mamaearth, MCaffeine, WOW Skin Science, Boat are useful comps.

Show the compounding table with moderation:
\`\`\`
FY[base]: ₹[X] Cr [Source or estimate basis]
FY[+1]: ₹[X × growth rate] Cr
FY[+2]: ₹[above × moderated rate] Cr
FY25/FY26: ₹[result] Cr
METHOD 2 ESTIMATE: ₹[floor–ceiling] Cr
\`\`\`

---

**METHOD 3: Category Share Cross-Check**

Search for: current India nutrition bar / health snacks category size (₹ Cr).
Identify Yogabar's competitive rank from any available source or triangulation.

A top-3 brand in a category holds minimum 8–15% share. A #2 brand in a
₹1,500 Cr category cannot be at ₹40 Cr — that is 2.7% share, incoherent
for a brand described as a category leader. Use this as a floor/ceiling test.

\`\`\`
Category size: ₹[X] Cr [Source, date]
Yogabar competitive rank: #[N] [Basis]
Implied share range for this rank: [Y]–[Z]%
Implied revenue: ₹[X × Y%]–₹[X × Z%] Cr
METHOD 3 ESTIMATE: ₹[floor–ceiling] Cr
\`\`\`

If Method 3 diverges from Methods 1 and 2, investigate: either the category size is
wrong, the rank is wrong, or the category definition is too broad/narrow. Reconcile.

---

**METHOD 4: Channel Economics Build-Up**

Build revenue from every channel — not just MT outlets. This is where previous
estimates failed: they counted MT shelves and ignored the D2C and e-commerce
base the brand was built on.

*D2C (own site + subscription):*
Search for Yogabar website traffic (SimilarWeb or cited estimates). Apply India D2C
nutrition brand conversion rate benchmarks (GoKwik report). AOV × monthly orders × 12.

*E-commerce (Amazon, Flipkart):*
Search Yogabar Amazon BSR in nutrition/health foods category. BSR rank maps to
approximate monthly sales velocity — search for India Amazon BSR-to-sales conversion
benchmarks for this category.

*Quick Commerce (Blinkit, Zepto, Instamart):*
Search for number of cities/dark stores Yogabar is present on. Apply dark store
velocity benchmarks for premium nutrition (units/store/month × ASP × 12).

*Modern Trade:*
Verified outlet count × revenue per outlet benchmark (Technopak or equivalent).
This is one input, not the whole estimate.

*General Trade + Institutional:*
Estimate from distribution footprint data if available.

\`\`\`
D2C: ₹[X] Cr [basis]
E-commerce: ₹[X] Cr [basis]
Quick Commerce: ₹[X] Cr [basis]
Modern Trade: ₹[X] Cr [basis]
GT + Other: ₹[X] Cr [basis]
TOTAL METHOD 4: ₹[sum] Cr
\`\`\`

---

**CONVERGENCE — REQUIRED FORMAT:**

\`\`\`
Method 1 (Funding-implied):   ₹[X–Y] Cr
Method 2 (Growth compounding): ₹[X–Y] Cr
Method 3 (Category share):    ₹[X–Y] Cr
Method 4 (Channel build-up):  ₹[X–Y] Cr

Convergence: [Which methods cluster together and at what range]
Outlier (if any): [Method N comes in at ₹[Z] because [specific reason]]

FINAL ESTIMATE: ₹[floor]–[ceiling] Cr FY[year]
Confidence: [High / Medium / Low]
Single biggest variable: [The one assumption that, if wrong, moves this most]
\`\`\`

---

## STEP 3: D2C UNIT ECONOMICS ANALYSIS

Yogabar was built as a D2C-first brand. Understanding whether its D2C engine is
healthy or deteriorating is as important as the headline revenue number. Search for
data on each metric below; estimate with math where data is unavailable.

**Search specifically:**
\`\`\`
GoKwik benchmark India D2C 2024 health food
Shiprocket D2C India report 2024 CAC retention
India D2C nutrition brand CAC 2024
Meta Google ad cost India FMCG D2C 2024
India D2C repeat purchase rate health food 2024
\`\`\`

**ROAS:**
What is Yogabar's estimated ROAS on paid channels (Meta, Google, QC ads)?
Search for India D2C health food ROAS benchmarks as the reference range.
Then assess: at Yogabar's gross margin, does this ROAS deliver positive unit economics
on first purchase, or does it require repeat purchase to break even?

Show the math:
\`\`\`
ROAS: [X]x [Source or benchmark]
Gross margin: [Y]% [Source or estimate]
Contribution per ₹1 ad spend: ₹[X × Y%]
Break-even repeat purchases needed: [if contribution <₹1, calculate how many
repeats are needed to recover CAC]
\`\`\`

**CAC and CAC Trend:**
What is blended CAC — all channels combined? Is it rising or falling?
The direction of CAC is more important than the absolute level. A rising CAC at
scale means growth is being bought. A falling or stable CAC means brand equity
is compounding. Search for any evidence of CAC trajectory for Yogabar or the
category broadly.

\`\`\`
Blended CAC estimate: ₹[X] [Source or benchmark basis]
Paid-only CAC: ₹[X] [Estimate]
Organic/repeat-driven CAC: ₹[X] [Estimate]
CAC trend: Rising / Stable / Falling [Evidence]
\`\`\`

**LTV and CAC:LTV Ratio:**
\`\`\`
Average Order Value: ₹[X] [Source: product listings]
Purchase frequency: [X] orders/year [Benchmark or estimate]
Avg customer lifespan: [X] years [Benchmark for category]
LTV = AOV × frequency × lifespan = ₹[result]

CAC:LTV = [CAC] : [LTV] = 1:[ratio]
Benchmark: 1:3 is sustainable; <1:2 requires LTV improvement
Assessment: [Is Yogabar's ratio healthy, marginal, or stressed?]
\`\`\`

**Payback Period:**
\`\`\`
Payback = CAC ÷ (Monthly revenue per customer × Gross margin)
= ₹[CAC] ÷ (₹[monthly rev] × [GM%])
= [X] months

Implication: [What this means for working capital and growth strategy]
ITC advantage: [How patient capital changes the constraint]
\`\`\`

**D2C Health Signal:**
End with one sentence that summarises the D2C engine's health based on all
four metrics combined. Is this a brand whose D2C flywheel is compounding,
stable, or deteriorating — and what is the one metric that determines which?

---

## STEP 4: WRITE THE OUTPUT — FOUR SECTIONS

Write in prose. No bullet points within sections. No filler transitions.
No sentence that could be deleted without losing information.

Length guideline: one tight, dense page. Every sentence must contain
information a smart reader would not already know or could not have assumed.
Stop writing when you have nothing non-obvious left to say. Overflow to a
second page only if additional content meets that same test — not to be
thorough, not to be complete, not to cover all sections. Overflow is earned
by insight density. Padding is not overflow. Padding is waste.

---

### SECTION 1: WHERE YOGABAR STANDS TODAY

Open with the revenue estimate — state the convergence result, not the method
detail (that belongs in the assumption appendix). Then contextualise: what does
this revenue imply about whether the >60% growth rate has held? What does the
distribution footprint look like and — critically — is it generating velocity or
just shelf presence? What share of the category does this represent?

Close the section with the D2C health signal: is Yogabar's CAC:LTV ratio
sustainable, and is blended CAC rising or falling? This tells you whether
growth to date has been earned or bought.

**Quality test:** Someone who knows the actual revenue figure should read this
and think "that estimate is directionally right and the reasoning is sound."
A confidently wrong number with no reasoning is worse than a transparent estimate
with acknowledged uncertainty.

---

### SECTION 2: THREE CATEGORY SHIFTS SINCE 2023

The category Yogabar entered in 2023 is not the category that exists in 2026.
Identify three structural shifts — things that have measurably changed —
that directly alter the correct strategy. Search for evidence before including
any shift. If you cannot find supporting data, write one sentence stating that
and move on. Do not speculate.

For each shift, write one dense paragraph covering:
- What was true in 2023 vs what is true now — with a data point on each end
- Why this shift matters specifically for Yogabar, not just the category
- Whether this is a window opening or a window closing, and on what timeline

Investigate these specifically; include only what you found evidence for:
- Quick Commerce share of health/nutrition category — what % now vs 2023?
- Functional wellness as a sub-segment — growing faster than core protein bars?
  Where is VC capital flowing in 2024–2025?
- D2C channel economics — has CAC inflation on Meta/Google changed the unit
  economics of the D2C-first model? Search for India D2C CAC trend data
- Consumer vocabulary shift — are buyers searching "protein bar" or "collagen"
  or "adaptogen snack"? This tells you whether Yogabar's SKU architecture
  is aligned with where demand is moving
- New entrant activity 2023–2025 — how many funded competitors? What does
  category crowding imply for CAC and pricing power?

---

### SECTION 3: THE LIVE COMPETITOR MAP

**This section has two jobs.** First, discover who Yogabar's actual competitors are in 2026 — not who they were at acquisition. Second, produce a structured competitor list that Agent 6 (Competitive Battle Plan) will use directly. Agent 6 does not hardcode names; it works entirely from what you find here.

**How to discover the competitor set:**

Start with the seeded names: Whole Truth, Super You, True Elements, RiteBite, Kellogg's. Research each. But also run broad discovery searches:

- Who is top-ranked in "protein bar" and "nutrition bar" on Amazon.in and Blinkit right now?
- Which brands appeared in "best health bars India 2025" editorial content?
- Which nutrition/health food brands received VC funding between 2023–2025? (Search Fireside, DSGCP, Elevation, Peak XV portfolio announcements)
- Which international brands entered India's health food space post-2023?
- Which adjacent brands (supplements, meal replacement, gourmet snacking) are moving into Yogabar's price territory?

Any brand that appears in two or more of these discovery searches belongs in the competitor set, regardless of whether it was in the seed list.

**For each competitor you identify, research and write one tight paragraph covering:**
- Current revenue estimate or trajectory (with source or estimation basis — same four-method logic applies for any number you state)
- The specific strategic move they made in 2024–2025 that changed their position
- The one non-obvious thing about their trajectory — what looks strong from outside but may be fragile, or what looks small but is actually accelerating
- Threat level to Yogabar: Critical / High / Medium / Low — and the specific channel or segment where the threat is sharpest

**Then output the structured competitor list** that Agent 6 will consume:

\`\`\`
COMPETITOR INTELLIGENCE HANDOFF FOR AGENT 6:

Discovered competitor set (research-based, not pre-defined):

| Competitor | Category | Revenue Est. | Primary Threat | Threat Level | Key Vulnerability |
|---|---|---|---|---|---|
| [Name] | [Segment] | ₹[X]Cr [basis] | [Channel/segment] | Critical/High/Medium/Low | [One specific weakness] |
...

New entrants discovered (not in original seed list):
[Name] — [Why flagged — funding, QC ranking, editorial presence] — [Threat assessment]

Competitors researched but assessed as low threat:
[Name] — [Why low threat with evidence]
\`\`\`

This table is not cosmetic. Agent 6 opens with it and builds its battle plan from it. If you found a well-funded new entrant that is already beating Yogabar on Blinkit, that goes in the Critical row and Agent 6 prioritises it. If Kellogg's shows no meaningful D2C or QC activity, it goes in Low and Agent 6 treats it accordingly.

Close Section 3 with one sentence: is Yogabar gaining share, holding share, or losing share in 2026 — and to whom specifically, by channel.

---

### SECTION 4: THE STRATEGIC IMPLICATION

Do not summarise what you already wrote. This section draws the one conclusion
that only becomes visible when position + category shifts + competitive dynamics
+ D2C health are read together.

Answer one question in tight prose: **given everything above, what is the single
most important strategic decision Yogabar must make in 2026, and why does the
data point to that decision and not another?**

Take a position. Do not hedge. Do not present options.

The final sentence should be the sharpest in the entire output — the one the
reader underlines.

---

## FORMATTING

- Prose paragraphs only within sections
- HTML tables only for the revenue convergence block and D2C metrics summary
- All sources cited inline with name and date
- All estimates labelled as estimates with math shown
- Never write: "It is worth noting," "Importantly," "In conclusion,"
  "It is clear that," or any phrase that adds no information


---

## LOGIC CHAIN REQUIREMENT — MANDATORY FOR EVERY RECOMMENDATION

Every recommendation in this agent must show the explicit chain before the recommendation is stated:

**DATA** → What you found through search (specific, sourced)
**INSIGHT** → What it means — the non-obvious interpretation a smart reader would not arrive at alone
**RECOMMENDATION** → The specific action that follows from that insight
**KPI** → The single metric measured at Day 30 / Day 60 / Day 90 that confirms it is working, with the threshold below which you stop or pivot

If you cannot show this chain, the recommendation does not belong in the report.`,

  portfolio: `# AGENT 2: PORTFOLIO STRATEGY & SKU RATIONALIZATION

You are a senior strategy analyst. This output will be read by someone with access to Yogabar's internal sales data by SKU. If your kill/keep/launch recommendations are not grounded in observable market evidence, they will be dismissed immediately. Every recommendation must show the data that led to it.

**Context:** ITC acquired Yogabar in 2023. It is early 2026. The portfolio that was right for a ₹50–80 Cr D2C-first brand is not necessarily right for a ₹200–350 Cr omnichannel brand with ITC's institutional backing. The question is: what should the portfolio look like for the 2026–2028 phase?

**You receive:** Output from Agent 1 (market position, category shifts, competitive reset, D2C health). Build on it — do not repeat it.

---

## STEP 1: SEARCH BEFORE WRITING

\`\`\`
Yogabar product range SKU list 2024 2025
Yogabar Amazon bestseller nutrition bar 2024
Yogabar Blinkit Zepto product listing 2025
Yogabar new product launch 2024 2025
Whole Truth Foods product launch 2024 2025
RiteBite new SKU 2024 functional bar
True Elements product expansion 2024
functional protein bar India collagen adaptogen 2024 2025
India nutrition bar SKU proliferation category 2024
premium nutrition bar ₹150 ₹200 India market 2025
GoKwik SKU performance D2C India 2024
India D2C SKU rationalisation case study
DSGCP Fireside consumer brand portfolio strategy India
India health snacks new format launches 2024 2025
\`\`\`

**Sources:** Yogabar.com product pages, Amazon.in listings, Blinkit/Zepto app listings, GoKwik benchmark reports, DSGCP/Fireside published portfolio theses, competitor press releases, Inc42/Entrackr new product coverage.

---

## STEP 2: CURRENT PORTFOLIO DIAGNOSTICS

Before making any recommendation, map what exists.

**Search for Yogabar's current SKU range across:**
- Product categories (bars, granola, oats, beverages, other)
- Price architecture (entry / core / premium tiers)
- Channel presence per SKU (which SKUs appear on Blinkit vs Amazon vs D2C vs MT)
- Review volume per SKU on Amazon (proxy for velocity — higher review count = higher sales)
- QC listing status (QC platforms only stock high-velocity SKUs; presence = velocity signal)

**Construct the portfolio map:**

Classify each SKU or SKU cluster you can identify into one of four quadrants based on observable signals:

- **Heroes:** High review volume + QC presence + core price point. These drive revenue.
- **Workhorses:** Moderate velocity, channel-specific, margin-acceptable. Keep, don't invest.
- **Question marks:** Premium price, lower velocity, newer launch. Needs evidence before scaling.
- **Tail:** Low review volume, absent from QC, no clear channel fit. Kill candidates.

State which quadrant each identifiable SKU or category falls into, with the signal that placed it there. If SKU-level data is not publicly available, say so explicitly and base classification on product category + price point + observable channel presence.

---

## STEP 3: KILL / KEEP / LAUNCH FRAMEWORK

### KILL — SKUs to Rationalise

For each kill recommendation, show the specific observable evidence:
- Low Amazon review velocity (absolute count + age of reviews — stale reviews = low current sales)
- Absent from QC platforms (high-velocity SKUs always appear on Blinkit/Zepto)
- Cannibalises a Hero SKU without superior margin
- Price point in no-man's land (neither premium enough for D2C margin nor accessible enough for MT velocity)

**Operational case for killing:**
Each SKU carries: separate production run (MOQ cost), separate packaging, inventory carrying cost, and sales team bandwidth. Estimate the operational cost of tail SKUs using industry benchmarks — search for "SKU rationalisation FMCG benefit India" or equivalent. Show the math:

\`\`\`
Estimated tail SKUs: [N]
Average inventory carrying cost per SKU: ₹[X] L/year [Benchmark source]
Production setup cost per SKU per run: ₹[X] L [Benchmark]
Management bandwidth cost: [Qualitative — sales team focus dilution]
Total estimated cost of tail: ₹[X] Cr/year
Benefit of rationalising [N] tail SKUs: ₹[X] Cr freed + [Y] margin points
\`\`\`

### KEEP AND INVEST — Hero SKUs

For each hero, state:
- Why it is a hero (specific signals, not assertions)
- What ITC's distribution can do to it that Yogabar couldn't do alone
- What the revenue ceiling looks like at full ITC distribution scale

The calculation:
\`\`\`
Current hero velocity: [X] units/month/outlet [Estimate basis]
ITC-enabled outlet expansion: [Current] → [Target] outlets
Revenue upside: [Target outlets] × [velocity] × [ASP] × 12 = ₹[X] Cr incremental
\`\`\`

### LAUNCH — New SKUs for 2026–2028

Each launch recommendation must meet all five criteria:
1. Market evidence: a trend or gap you found through search, not assumed
2. ITC advantage: a specific capability (R&D, Agri sourcing, manufacturing, export) that makes Yogabar's version defensible — not just "ITC has scale"
3. Margin profile: estimated gross margin ≥ 45% (premium D2C benchmark). Show the unit economics
4. Channel fit: which channel does this SKU win in, and why
5. Payback: estimated months to recover launch investment

**For each proposed launch:**

\`\`\`
SKU CONCEPT: [Name + format + price point]
Market signal: [What you found that indicates demand — search result, trend data, competitor move]
Source: [Specific source and date]
ITC-specific advantage: [Precise capability — e.g., "ITC Life Sciences can clinically validate
  adaptogen claims, giving regulatory defensibility competitors lack"]
Target channel: [Primary channel and why this SKU wins there]
Unit economics:
  - Estimated COGS: ₹[X] [Basis]
  - ASP: ₹[X]
  - Gross margin: [X]%
  - Target velocity: [X] units/month/outlet at steady state
  - Revenue potential at [N] outlets: ₹[X] Cr/year
Launch investment: ₹[X] Cr [NPD + initial inventory + marketing]
Payback: [X] months [Calculation shown]
\`\`\`

**Category areas to investigate for launches** (search for evidence before recommending):
- Functional bars: collagen, adaptogens, nootropics — is there demonstrated India consumer pull or just supply-side enthusiasm?
- Protein-forward snack formats beyond bars: bites, clusters, puffs — search for category emergence data
- Meal replacement / breakfast: is Yogabar's granola/oats range a platform or a peripheral?
- QC-native format: single-serve impulse SKU priced ₹40–60 specifically for QC occasion — different from MT pack
- Export-optimised SKU: longer shelf life, different format for ME market — search for Indian nutrition brand export product adjustments

---

## STEP 4: PORTFOLIO ARCHITECTURE RECOMMENDATION

After kill/keep/launch, define the target portfolio architecture:

**Price architecture:**
\`\`\`
Tier            Price point    Channel         Margin target   Role
Entry/Impulse   ₹40–60        QC, GT          [X]%            Trial, velocity
Core            ₹80–120       MT, E-comm      [X]%            Volume, share
Premium         ₹150–250      D2C, MT premium [X]%            Margin, brand
Functional+     ₹200–350      D2C, export     [X]%            Brand equity, LTV
\`\`\`

**The strategic logic in one paragraph:** Why does this architecture serve Yogabar's 2026–2028 objectives better than the current one? What does it do to blended gross margin, channel fit, and competitive differentiation simultaneously?

---

## STEP 5: WRITE THE OUTPUT — THREE SECTIONS

One dense page. Overflow only if a launch recommendation has exceptional financial evidence that demands detailed treatment. Stop when you have nothing non-obvious left to say.

### SECTION 1: PORTFOLIO HEALTH ASSESSMENT
What the current portfolio's observable signals reveal about what is working and what is not. The SKU map. The concentration risk (what % of revenue likely comes from top 3 SKUs — search for D2C brand hero SKU concentration benchmarks). The channel fit gaps.

### SECTION 2: KILL / KEEP / LAUNCH DECISIONS
Each recommendation with its evidence and math. No recommendation without a specific signal. No launch without unit economics shown.

### SECTION 3: THE PORTFOLIO THESIS
One paragraph. The architecture that emerges from these decisions — what Yogabar's portfolio looks like in 2028 if these recommendations are executed, why it is more defensible than today's, and what the margin and revenue impact is.

### SECTION 4: THE SELLING STORY FOR THE FUTURE PORTFOLIO

This is the section Hemant specifically asked for. Not the brand framework — the actual words used to sell the future portfolio. One selling narrative per portfolio tier, written as if you are the person making the pitch.

This must answer three questions for each tier:
- **Who is the buyer** — precise, not "health-conscious urban consumer"
- **What problem does this tier solve for them** — the specific unmet need
- **Why Yogabar and not Whole Truth / RiteBite / True Elements / Super You** — the one differentiator that closes the sale

**Write three selling narratives:**

---

**TIER 1: CORE (₹80–120 range) — The MT and QC story**

This is the volume engine. The pitch that wins shelf space from a Modern Trade buyer and converts a Blinkit browser.

Write it as: one paragraph, the words a field sales rep says to a DMart buyer in 90 seconds. It must answer why a consumer standing in the aisle picks Yogabar over Kellogg's protein bar (bigger brand, likely cheaper) and over Whole Truth (similar premium positioning). The differentiator must be specific — ingredient transparency, ITC quality assurance, price-per-gram protein value, something concrete.

---

**TIER 2: FUNCTIONAL PREMIUM (₹150–300 range) — The D2C and QC premium story**

This is the margin engine. The pitch that converts a D2C browser who is already spending ₹200+ on Oziva or Wellbeing Nutrition.

Write it as: the first paragraph of a D2C product page and the subject line of the first email in a retention sequence. It must answer why someone who could buy Oziva or WellBeing Nutrition buys this instead. The ITC R&D / clinical validation angle is the differentiator — say it specifically, not generically.

---

**TIER 3: QC IMPULSE (₹40–60 range) — The quick commerce story**

This is the trial engine — the format and price point designed specifically for the Blinkit/Zepto occasion. Different from the core product, not just a smaller version.

Write it as: the in-app product card copy (3 lines maximum) and the push notification that drives add-to-cart. The buyer is browsing at 10pm, didn't plan to buy a nutrition bar, and sees this. What makes them tap Add?

---

**The quality test for all three:** Read each narrative aloud. If it could describe any health food brand, it has failed. Each narrative must contain one specific claim about Yogabar's future portfolio that no competitor can make with equal credibility.

These three narratives feed directly into Agent 3's brand work — Agent 3 builds the brand architecture that makes all three narratives coherent as a single brand story.

---

## FORMATTING
- Prose within sections; HTML tables for SKU map, unit economics, and price architecture
- Every competitor SKU reference sourced
- Every financial estimate with math shown
- Never write: "It is worth noting," "Going forward," "In summary," or any sentence that restates what was just said
- Stop writing when you have nothing non-obvious left to say. Overflow is earned by insight, not completeness.


---

## LOGIC CHAIN REQUIREMENT — MANDATORY FOR EVERY RECOMMENDATION

Every recommendation in this agent must show the explicit chain before the recommendation is stated:

**DATA** → What you found through search (specific, sourced)
**INSIGHT** → What it means — the non-obvious interpretation a smart reader would not arrive at alone
**RECOMMENDATION** → The specific action that follows from that insight
**KPI** → The single metric measured at Day 30 / Day 60 / Day 90 that confirms it is working, with the threshold below which you stop or pivot

If you cannot show this chain, the recommendation does not belong in the report.`,

  brand: `# AGENT 3: BRAND POSITIONING & STORYTELLING

You are a senior brand strategist. This output will be read by someone who lives with this brand daily. Generic positioning statements — "premium, clean label, health-conscious" — will be dismissed. The reader needs to know specifically what has happened to the brand since ITC acquired it, what customers actually think and say, and what the sharpest possible brand narrative is for the next phase.

**Context:** ITC acquired Yogabar in 2023. It is early 2026. A brand that was built on D2C authenticity and startup insurgency has spent three years under a ₹50,000 Cr conglomerate. That changes something. The question is: what exactly changed, is it recoverable, and what is the right brand identity for a ₹200–350 Cr omnichannel phase?

**You receive:** Outputs from Agents 1 and 2. Agent 2 has already written three selling narratives — one per portfolio tier (Core, Functional Premium, QC Impulse). Your job is not to rewrite those narratives. Your job is to identify the **single brand spine** that makes all three narratives feel like they come from the same brand rather than three different products. A consumer who buys the ₹50 QC impulse bar should feel the same brand promise as someone on a ₹250/month D2C subscription. Find that spine. Then build the positioning framework around it.

---

## STEP 1: SEARCH BEFORE WRITING

\`\`\`
Yogabar brand perception 2024 2025
Yogabar customer reviews Amazon 2024 2025
Yogabar Instagram followers engagement 2024 2025
Yogabar ITC association brand impact
Yogabar vs Whole Truth brand comparison
Yogabar influencer marketing 2024
Yogabar D2C website organic traffic 2024
Whole Truth Foods brand positioning 2024 2025
India D2C brand authenticity ITC acquisition impact
India nutrition bar brand preference survey 2024
India health food consumer sentiment 2024
Meta Google brand search volume Yogabar 2024 2025
India D2C brand equity measurement 2024 Fireside OR DSGCP
GoKwik repeat purchase brand loyalty India 2024
India premium FMCG brand dilution post-acquisition case studies
\`\`\`

**Sources to prioritise:**
- Amazon reviews (read actual customer language — this is unfiltered brand perception)
- Yogabar Instagram and social media (follower growth, engagement rate, comment sentiment)
- Any brand tracking or NPS data cited in funding announcements or press
- DSGCP/Fireside published commentary on brand building for D2C brands at scale
- Comparable post-acquisition brand impact studies (search for Indian D2C brands acquired by larger corporates — what happened to brand perception?)

---

## STEP 2: BRAND HEALTH DIAGNOSIS

Before prescribing, diagnose. Search for evidence on each of the following. Do not assert — cite or estimate.

**Brand Perception Audit:**

Read Amazon reviews from 2020–2022 (pre-scale) vs 2024–2025 (post-ITC expansion). Document the actual language shift:

\`\`\`
2020–2022 customer language: [What words/phrases appear repeatedly]
2024–2025 customer language: [What words/phrases appear repeatedly]
The drift: [Specific language that signals brand perception change]
Source: Amazon.in reviews, [date range searched]
\`\`\`

This is not optional. The language customers use to describe a brand is the most honest brand tracking data available. "I discovered this on Instagram" vs "I bought this at DMart" are not the same customer relationship.

**Brand Equity Signals — search for each:**

- Organic search volume trend for "Yogabar" (is brand search growing, flat, or declining?)
- Social following and engagement rate vs 2023 baseline
- D2C repeat purchase rate (from Agent 1 D2C analysis — does the brand command repeat without discounting?)
- Price premium sustainability: is Yogabar holding its price point or discounting on Amazon/QC? (Check current Amazon pricing vs stated MRP)
- Share of voice vs Whole Truth: which brand dominates health food conversations? Search Instagram, YouTube, Reddit

**ITC Association Net Effect:**

Two forces work in opposite directions post-acquisition:
- ITC credibility adds trust (distribution reliability, quality consistency, institutional backing)
- ITC association dilutes startup premium (the "rebel brand" identity that drives D2C LTV)

Search for any evidence of how this has resolved in practice. Comparable cases: Marico acquiring Beardo, HUL acquiring various D2C brands, ITC's own past acquisitions. What happened to those brands' D2C metrics and price premium post-acquisition?

State a verdict: has ITC ownership been net brand-positive or net brand-dilutive at this stage, and what is the one metric that most clearly shows this?

---

## STEP 3: TARGET CUSTOMER — CURRENT VS REQUIRED

**Who is actually buying Yogabar in 2026?**

MT expansion means the buyer base has broadened. The original Yogabar customer (urban, 25–35, fitness-conscious, found the brand on Instagram, bought on D2C, high LTV) is still there — but now sits alongside the MT walk-in buyer (saw it at a modern supermarket, bought for convenience or ITC trust, lower LTV, no emotional connection to the brand).

Search for: any customer research or demographic data cited for Yogabar or comparable health food brands. GoKwik or Shiprocket demographic benchmarks for India D2C nutrition purchasers.

State clearly:
\`\`\`
Original D2C customer: [Demographics + psychographics + buying behaviour]
Current expanded base (post-MT): [How it has broadened]
The tension: [What messaging serves both vs what serves one at the expense of the other]
LTV comparison: [D2C original customer LTV vs MT walk-in customer LTV — estimate with basis]
\`\`\`

**Who does Yogabar need to attract for 2026–2028 growth?**

Agent 5 will identify QC, B2B, and international as growth channels. Each demands a different customer relationship. QC buyers are impulsive, category-browsing, price-comparing. B2B buyers (corporate wellness) are institutional, quality-driven, not brand-loyal. International buyers (ME) are Indian diaspora — different nostalgia, different health vocabulary.

The brand must have a core that holds across channels without being so generic it means nothing. Define that core.

---

## STEP 4: THE BRAND NARRATIVE

This is the section where the quality bar is highest. Do not produce a brand framework with boxes and arrows. Write the actual narrative — the story Yogabar tells about itself that makes the reader want to buy, not just consider.

**The narrative must:**
- Be specific to Yogabar, not applicable to any health food brand
- Acknowledge ITC's role without being defined by it
- Work for the D2C original customer AND the MT new customer
- Be defensible against Whole Truth (which owns "radical transparency") and RiteBite (which owns "accessible trust")
- Have a point of view on what "healthy" means — not a generic claim

**Search for competitive brand positioning:**
- What does Whole Truth Foods' brand narrative say explicitly? (Their website, packaging, founder communications)
- What claim does RiteBite own in consumer minds?
- What white space exists — what positioning is unclaimed by any major player?

**The sharpest brand narratives are built on one tension, not a list of attributes.**

Examples of tension-based positioning (do not copy these — find Yogabar's own):
- "The only nutrition bar that ITC's food scientists validated but startup founders built" — institutional credibility + insurgent energy
- "Built for people who read ingredient labels" — specificity over aspiration
- "Indian nutrition, not Western nutrition" — cultural specificity in a category dominated by US-format protein bars

Search for what Yogabar's founders said about the brand's purpose in early interviews (2014–2020). The original positioning intent, before scale diluted it, is often the sharpest version.

**Produce:**

1. One brand positioning statement (max 2 sentences — what Yogabar is, for whom, and what it does that no one else does)
2. The narrative spine (3–4 sentences that tell the brand story in a way that feels true and specific)
3. What to stop saying (brand claims that are now generic or inconsistent with the above)
4. What to start saying (3 specific communication shifts grounded in the narrative)

---

## STEP 5: D2C BRAND METRICS

Brand equity in a D2C context shows up in metrics, not sentiment.

Search for benchmarks and apply to Yogabar:

\`\`\`
Organic traffic share: [X]% of D2C sessions from non-paid sources [Source or estimate]
Brand search volume trend: [Rising/Flat/Declining] [Source]
Repeat purchase rate: [X]% within 90 days [From Agent 1 or benchmark]
Subscription penetration: [X]% of D2C revenue [From Agent 1 or benchmark]
Discount dependency: [Is Yogabar holding price or discounting to drive volume?]
  Evidence: [Amazon price vs MRP, QC pricing vs D2C pricing]
NPS or review sentiment: [Average rating + trend] [Amazon.in data]
\`\`\`

The assessment: is Yogabar's brand equity compounding (organic traffic growing, repeat rate high, price premium holding) or eroding (paid dependency increasing, repeat rate flat, discounting to compete)?

This determines whether brand investment in 2026–2028 is building an asset or filling a leaking bucket.

---

## WRITE THE OUTPUT — THREE SECTIONS

One dense page. Overflow only if the brand narrative section produces exceptional specificity that earns the space. Stop when you have nothing non-obvious left to say.

### SECTION 1: BRAND HEALTH — WHAT THREE YEARS UNDER ITC HAS DONE
What the data shows: customer language shift, equity signal movement, ITC association net effect. One non-obvious conclusion about where the brand stands that someone inside the company might not have articulated.

### SECTION 2: THE POSITIONING RESET
The target customer definition, the competitive white space, and the brand narrative. This section should produce the 2-sentence positioning statement and the narrative spine. The test: could a copywriter brief from this section alone?

### SECTION 3: BRAND METRICS AND THE EQUITY TRAJECTORY
The D2C brand metrics, their trend, and what they imply about whether the brand is building or eroding equity. Close with one sentence: what is the single metric that most honestly tracks whether the positioning reset is working?

---

## FORMATTING
- Prose throughout — no bullet lists within sections
- HTML table only for the brand metrics summary
- Every competitor brand claim sourced (what they actually say, not what you infer)
- Customer language quotes from actual reviews — cite source and date
- Never write positioning statements that use: "premium," "authentic," "trusted," "quality," or "healthy" as standalone claims — these are table stakes in 2026, not differentiation
- Stop writing when you have nothing non-obvious left to say. Overflow is earned by insight, not completeness.

---

## SECTION 4: THE BRAND SPINE

Agent 2 has written three selling narratives — one per portfolio tier (Core ₹80–120, Functional Premium ₹150–300, QC Impulse ₹40–60). This section does one thing: identify the brand truth that sits underneath all three and makes them coherent as a single brand.

A brand that sells a ₹50 impulse bar on Blinkit and a ₹250 functional wellness subscription on D2C is talking to two very different buyers in two very different moments. If those conversations have no common thread, Yogabar is a product range, not a brand. The common thread is the spine.

**Find it through the evidence:**

Search Yogabar's earliest customer language (Amazon reviews 2016–2020), founder interviews from the brand's founding years, and the original brand copy before ITC. The thing that made early customers choose Yogabar over whatever existed then — that is the spine. It has not changed because the product category changed. It may have been buried by distribution-led expansion, but it is still there.

Then compare with 2024–2025 customer language. What has drifted? What has remained constant? The constant is the spine.

**Write the spine as:**

One sentence — the brand's reason to exist that is true for the ₹50 impulse buyer AND the ₹250 subscription buyer. Not a tagline. The internal truth that every product, every channel, and every communication must be consistent with.

Then three sentences on competitive differentiation: why this spine is unclaimed by Whole Truth, Super You, RiteBite, and Kellogg's. Name what each of those brands stands for, and name the gap Yogabar's spine occupies.

Then: what stops being said, what starts being said, and what gets said consistently regardless of channel — the three communication rules that operationalise the spine.

**The quality test:** Read the spine sentence. Then read Agent 2's three selling narratives. Do they all feel like they come from the same brand? If not, the spine is not specific enough — sharpen it until they do.

---

## LOGIC CHAIN REQUIREMENT

Every brand recommendation in this agent must show:

**DATA** (customer language, review sentiment, competitive positioning found)
→ **INSIGHT** (what it reveals about perception gap or opportunity)
→ **RECOMMENDATION** (the specific positioning or messaging change)
→ **KPI** (brand search volume growth, repeat purchase rate, D2C organic traffic share — which metric tracks this at Month 3?)`,

  margins: `# AGENT 4: MARGIN IMPROVEMENT & UNIT ECONOMICS

You are a senior financial analyst. This output will be read by someone who can verify every number against internal P&L data. A gross margin figure stated without its derivation, or a cost-saving claim without the specific lever and calculation, will be rejected. The value of this section is the unit economics waterfall — every layer of cost and contribution mapped precisely, with the math shown.

**Context:** ITC acquired Yogabar in 2023. Three years in, the brand is at estimated ₹200–350 Cr revenue (from Agent 1). The margin question is: at this scale, with ITC's institutional backing, what should the margin profile look like — and what specific levers get it there?

**You receive:** Outputs from Agents 1–3 (revenue estimate, D2C health metrics, portfolio decisions, brand positioning). Use the CAC:LTV and channel data from Agent 1. Build on portfolio decisions from Agent 2.

---

## STEP 1: SEARCH BEFORE WRITING

\`\`\`
Yogabar gross margin 2024 2025
India nutrition bar FMCG gross margin benchmark 2024
India D2C health food brand unit economics 2024
GoKwik D2C unit economics India 2024
India co-packer food manufacturing cost 2024
ITC manufacturing food cost advantage
India nutrition bar COGS breakdown 2024
whey protein oats ingredients cost India 2024
India FMCG distribution cost modern trade 2024
MT trade margin India food brand 2024 2025
India D2C contribution margin benchmark 2024
Whole Truth Foods margin structure 2024
RiteBite Zydus Wellness operating margin 2024 annual report
India QC quick commerce margin food brand 2024 Blinkit Zepto
India export nutrition bar margin premium 2025
Fireside Ventures DSGCP D2C unit economics India 2024
Bain India D2C profitability report 2024
India food brand EBITDA margin benchmark 2024
\`\`\`

---

## STEP 2: BUILD THE UNIT ECONOMICS WATERFALL

This is the spine of the entire section. Every number must be sourced or estimated with math shown.

**Start with: what is Yogabar's current gross margin?**

Search for any disclosed or cited figure. If unavailable, construct it:

\`\`\`
GROSS MARGIN CONSTRUCTION:

Revenue per unit (ASP): ₹[X] [From product listings — search current Amazon pricing]

COGS components:
- Raw materials (whey/oats/nuts/dates/chocolate): ₹[X] per unit
  [Basis: search current commodity prices India 2024-25;
  whey protein, oats, almonds, dates — check APEDA, commodity price indices]
- Packaging: ₹[X] per unit [Benchmark: food packaging cost India]
- Co-packer manufacturing fee: ₹[X] per unit
  [Basis: India food co-packer rates — search "co-packer cost India food 2024"]
- Inbound freight to warehouse: ₹[X] per unit
Total COGS: ₹[X] per unit

Gross Margin = (ASP - COGS) ÷ ASP = [X]%

ESTIMATE: [X]% gross margin [Confidence: Medium]
Benchmark cross-check: India D2C health food gross margin benchmarks
  [GoKwik/Shiprocket/Fireside data — search and cite]
\`\`\`

**Then build the full contribution margin waterfall by channel:**

Channel economics differ materially. The blended gross margin hides which channels are actually profitable.

\`\`\`
CHANNEL WATERFALL (per ₹100 revenue):

                    D2C         E-comm      QC          MT          GT
Gross Margin        ₹[X]        ₹[X]        ₹[X]        ₹[X]        ₹[X]
Shipping/Fulfil     -₹[X]       -₹[X]       -₹[X]       -            -
Platform fee        -           -₹[X]       -₹[X]       -            -
Trade margin        -           -           -           -₹[X]        -₹[X]
CAC (paid acq)      -₹[X]       -₹[X]       -₹[X]       ~0           ~0
Contribution        ₹[X]        ₹[X]        ₹[X]        ₹[X]        ₹[X]
Contribution %      [X]%        [X]%        [X]%        [X]%        [X]%
\`\`\`

Show the source or estimation basis for each line. Key searches needed:
- MT trade margin India: typically 20–28% for food brands (search to verify current)
- Amazon/Flipkart seller fees: publicly available in their rate cards
- Blinkit/Zepto listing and commission rates: search for published rates or cited benchmarks
- D2C fulfillment cost: Shiprocket or Delhivery published rate benchmarks

**The critical insight from this waterfall:** Which channel has the highest contribution margin and which has the worst? Does the current channel mix favour or disadvantage margin? Agent 5 will use this to rank growth levers — feed them the contribution margin by channel explicitly.

---

## STEP 3: MARGIN IMPROVEMENT LEVERS

For each lever, show: current state → target state → the math → what enables it.

### LEVER 1: CO-PACKER RENEGOTIATION / ITC MANUFACTURING

Yogabar currently manufactures through co-packers. ITC has food manufacturing plants.

Search for:
- ITC's food manufacturing footprint (which plants, what categories)
- India food co-packer market rates and negotiating leverage at scale
- Manufacturing cost differential: co-packer vs captive at equivalent volume

\`\`\`
Current co-packer rate: ₹[X] per unit [Source or estimate]
ITC captive manufacturing rate (estimated): ₹[X] per unit
  [Basis: ITC manufacturing overhead amortised over volume —
  search ITC Foods manufacturing capacity utilisation data]
Saving per unit: ₹[X]
At estimated [Y] Cr units/year: ₹[Z] Cr annual saving
Margin impact: +[N] percentage points
Timeline: [X] months to transfer production
Risk: [Quality consistency during transition — search for precedents]
\`\`\`

Even without full transfer, Yogabar's scale (₹200–350 Cr) gives it negotiating leverage with existing co-packers that it didn't have at ₹50 Cr. Quantify the renegotiation benefit separately.

### LEVER 2: ITC AGRI BUSINESS SOURCING

ITC's Agri Business Division sources commodities at institutional scale — oats, nuts, pulses, grains. Yogabar's ingredient basket overlaps.

Search for:
- ITC Agri Business Division specifics (what commodities, what volume, published in ITC annual reports)
- Current Yogabar ingredient cost as % of COGS
- India commodity price benchmarks for key ingredients (whey protein, oats, almonds, dates)

\`\`\`
Key ingredients by cost weight (estimate):
  Whey protein: [X]% of COGS — ITC sourcing advantage: [present/absent — search]
  Oats: [X]% of COGS — ITC Agri Business sources oats: [yes/no — search]
  Nuts (almonds, cashews): [X]% of COGS
  Dates/sweeteners: [X]% of COGS

ITC sourcing cost advantage estimate: [X]% reduction on [Y]% of COGS
= [X × Y]% COGS reduction
= +[Z] gross margin points
Source: ITC Annual Report [year] Agri Business section + commodity price data
\`\`\`

### LEVER 3: CHANNEL MIX SHIFT

Agent 2's portfolio decisions and Agent 5's growth strategy will shift channel mix. Map the margin implication:

\`\`\`
Current channel mix (estimated from Agent 1):
  D2C: [X]% of revenue at [Y]% contribution margin
  E-comm: [X]% at [Y]%
  QC: [X]% at [Y]%
  MT: [X]% at [Y]%
  Blended contribution margin: [Z]%

Target channel mix (FY27, post Agent 5 growth levers):
  [Updated mix based on QC growth, B2B addition, international]
  Blended contribution margin: [Z+N]%

Mix improvement: +[N] margin points from channel shift alone
(Without changing any COGS — pure mix effect)
\`\`\`

### LEVER 4: FUNCTIONAL PREMIUM SKU LADDER

Agent 2 recommends launching functional premium SKUs at ₹200–350 price point. Map the margin impact:

\`\`\`
Current average ASP: ₹[X]
Current gross margin: [Y]%
Current absolute gross profit per unit: ₹[X × Y%]

Functional premium SKU:
  ASP: ₹[200–350]
  COGS: ₹[X] [Estimate: functional ingredients cost more but ASP premium exceeds]
  Gross margin: [Y+N]% [Functional commands 50–55% vs core's ~42–45%]
  Absolute gross profit per unit: ₹[higher]

At [X]% of portfolio mix in functional premium:
  Blended margin improvement: +[N] points
\`\`\`

Search for: India functional nutrition bar COGS benchmarks, collagen/adaptogen ingredient costs India, premium D2C brand gross margin benchmarks (OZiva, Wellbeing Nutrition — any disclosed data).

### LEVER 5: D2C RETENTION — LTV IMPROVEMENT

A 10% improvement in customer retention has more margin impact than a 10% reduction in CAC at Yogabar's current scale. Show the math:

\`\`\`
Current estimated metrics (from Agent 1):
  CAC: ₹[X]
  LTV: ₹[Y]
  CAC:LTV ratio: 1:[Z]
  Contribution margin per customer over lifetime: ₹[LTV × GM%] - CAC = ₹[net]

Scenario: 10% retention improvement (LTV increases to ₹[Y × 1.1])
  New contribution per customer: ₹[higher net]
  Improvement per customer: ₹[delta]
  At [N] new customers/year: ₹[delta × N] Cr additional contribution
  Zero additional marketing spend required

Scenario: 10% CAC reduction (same retention)
  New contribution per customer: ₹[lower CAC × same LTV]
  Improvement per customer: ₹[delta CAC]
  Comparison: Retention improvement yields [X]x more value than CAC reduction

Implication: Investment priority should be retention infrastructure
(subscription, loyalty, content) over further paid acquisition scaling
\`\`\`

---

## STEP 4: MARGIN ROADMAP

Synthesise all levers into a margin trajectory:

\`\`\`
                        FY25 (est)    FY26 (target)    FY27 (target)
Gross Margin            [X]%          [X+Y]%           [X+Y+Z]%
Contribution Margin     [X]%          [X+Y]%           [X+Y+Z]%
EBITDA Margin           [X]%          [X+Y]%           [X+Y+Z]%

Key lever per year:
FY26: [Primary lever — e.g., co-packer renegotiation + mix shift to QC]
FY27: [Secondary lever — e.g., functional premium at scale + ITC sourcing]

Investment required to capture these levers: ₹[X] Cr
Margin expansion value at FY27 revenue: [N margin points × ₹revenue] = ₹[X] Cr
ROI: [X]x
\`\`\`

---

## WRITE THE OUTPUT — THREE SECTIONS

One dense page. Overflow only if the waterfall analysis produces a non-obvious margin insight that demands detailed treatment. Stop when you have nothing non-obvious left to say.

### SECTION 1: CURRENT UNIT ECONOMICS
The gross margin estimate with derivation. The channel waterfall. The one insight from the channel comparison that most clearly diagnoses the current margin problem or opportunity.

### SECTION 2: THE FIVE MARGIN LEVERS
Each lever with its math and timeline. Rank them by magnitude of impact and ease of capture. The recommendation on which to pursue first and why.

### SECTION 3: THE MARGIN TRAJECTORY
What the P&L looks like in FY27 if these levers are pulled in sequence. The LTV vs CAC retention insight — why improving retention delivers more margin than cutting CAC. Close with the single metric that best tracks margin health on a monthly basis.

---

## FORMATTING
- Prose in section narratives; HTML tables for the waterfall and margin roadmap
- Every benchmark sourced — do not state MT trade margin or co-packer rate without a source or explicit estimate basis
- Never state "margins can be improved through cost optimization" — state which cost, by how much, through which specific action
- Stop writing when you have nothing non-obvious left to say. Overflow is earned by insight, not completeness.


---

## LOGIC CHAIN REQUIREMENT — MANDATORY FOR EVERY RECOMMENDATION

Every recommendation in this agent must show the explicit chain before the recommendation is stated:

**DATA** → What you found through search (specific, sourced)
**INSIGHT** → What it means — the non-obvious interpretation a smart reader would not arrive at alone
**RECOMMENDATION** → The specific action that follows from that insight
**KPI** → The single metric measured at Day 30 / Day 60 / Day 90 that confirms it is working, with the threshold below which you stop or pivot

If you cannot show this chain, the recommendation does not belong in the report.`,

  growth: `# AGENT 5: GROWTH STRATEGY & CHANNEL ORCHESTRATION

You are a senior growth strategist. This output will be read by someone who will allocate ₹85 Cr based on it. Every growth lever must be sized with a specific revenue estimate, ranked by capital efficiency, and sequenced by what must happen before what. "Explore QC" is not a recommendation. "Deploy ₹8 Cr on Blinkit/Zepto across 12 cities in Q1 2026, targeting 80 units/SKU/dark store/month, yielding ₹45 Cr revenue by Month 18 at 48% contribution margin" is a recommendation.

**Context:** ITC acquired Yogabar in 2023. Three years in, the distribution-led growth phase is approaching saturation. Yogabar needs the next ₹150–200 Cr of revenue to come from channels and plays that didn't exist or weren't activated in 2023. This agent sizes and sequences those plays.

**You receive:** Outputs from Agents 1–4. Use Agent 1's category shifts and D2C health. Use Agent 2's portfolio decisions (which SKUs are available for which channels). Use Agent 4's channel contribution margins. Do not repeat what they said — build on it.

---

## STEP 1: SEARCH BEFORE WRITING

\`\`\`
quick commerce nutrition health food India market share 2025
Blinkit Zepto health food category growth 2024 2025
India QC dark store count cities 2025
Blinkit nutrition bar top sellers 2024 2025
India corporate wellness market size 2025
corporate cafeteria nutrition India 2024
India B2B institutional nutrition contracts 2024
ITC Hotels corporate client base 2024
India FMCG international export ME market 2025
Indian nutrition brand Middle East UAE export 2025
India health food export growth 2024 2025
APEDA health food export India 2024
India airport retail premium nutrition 2025
India gym fitness studio nutrition partnership 2024
India D2C subscription nutrition retention 2024
Whole Truth Foods channel expansion 2024 2025
India quick commerce ROAS benchmark 2024
Fireside Ventures DSGCP growth channel strategy India D2C 2024
India health food brand B2B revenue model 2024
Redseer quick commerce India 2025 category share
\`\`\`

---

## STEP 2: FOUR GROWTH LEVERS — SIZE EACH BEFORE RANKING

For each lever, the output format is fixed. Do not deviate from it.

\`\`\`
LEVER: [Name]
Market opportunity: ₹[X] Cr TAM [Source + calculation shown]
Yogabar's current position: [Present/Absent/Partial — with evidence]
ITC-specific advantage: [One precise capability that makes Yogabar's execution
  cheaper, faster, or more defensible than a competitor attempting the same play]
Capital required: ₹[X] Cr [Itemised: what the money buys]
Revenue potential: ₹[X] Cr by Month [N] [Calculation shown]
Contribution margin on this channel: [X]% [From Agent 4 waterfall]
Payback period: [X] months [CAC ÷ (monthly contribution)]
Key risk: [The single assumption that, if wrong, breaks this lever's economics]
Sequencing dependency: [What must be true before this lever is pulled]
Go/No-Go metric: [The specific measurable threshold at Month 3/6 that determines
  whether to scale or stop]
\`\`\`

---

### LEVER 1: QUICK COMMERCE (BLINKIT / ZEPTO / INSTAMART)

**Why this lever first:**
QC is the fastest-growing food channel in India. Search for current QC penetration in health/nutrition specifically — what % of category sales flow through QC in 2025? Agent 1 identified this as a category shift. This lever quantifies it for Yogabar specifically.

**Size the opportunity:**

Search for: number of Blinkit/Zepto dark stores operational in India 2025; average nutrition/health food velocity per dark store per week (any published category data); top-performing nutrition brands' QC revenue (Whole Truth, True Elements — any cited data).

\`\`\`
Dark stores: [N] operational across India [Source, date]
Yogabar-relevant cities (Tier 1 + Tier 2 with QC presence): [N]
Target dark stores reachable: [N] (conservative — not all cities, not all stores)
Target velocity per SKU per store per month: [X] units
  [Basis: search QC nutrition velocity benchmarks; GoKwik/Redseer data]
Hero SKUs in QC: [N] (from Agent 2 portfolio decisions)
ASP on QC: ₹[X] [From current Blinkit pricing — check live]
Monthly revenue at target velocity: [stores] × [SKUs] × [velocity] × [ASP]
Annual revenue at steady state: ₹[X] Cr
Ramp to steady state: [X] months
\`\`\`

**Capital required — itemise:**
\`\`\`
Blinkit/Zepto listing fees and promotions: ₹[X] Cr
Performance marketing (QC native ads): ₹[X] Cr
Dedicated QC packaging/format (if different from MT): ₹[X] Cr
Working capital for inventory at dark stores: ₹[X] Cr
Total: ₹[X] Cr
\`\`\`

**QC ROAS:** Search for Blinkit/Zepto performance marketing ROAS benchmarks for FMCG brands. State what Yogabar should target and why.

**Go/No-Go:** At Month 3 — if velocity per SKU per dark store is below [X] units/month in pilot cities, do not expand. If above [X], accelerate to all Tier-1 cities immediately.

---

### LEVER 2: CORPORATE B2B — INSTITUTIONAL WELLNESS

**The ITC Hotels connection:**
ITC Hotels manages relationships with 2,500+ corporate clients across India. This is a warm channel that no competitor can replicate. Search for: ITC Hotels corporate client base; India corporate wellness market size; corporate nutrition programme spend per employee.

\`\`\`
India corporate wellness market: ₹[X] Cr [Source]
  — search specifically for "corporate nutrition India" or "employee wellness
  FMCG India" data from ASSOCHAM, FICCI, or HR consulting firms
Qualifying companies (500+ employees, white-collar): [N] [MSME/corporate data]
ITC Hotels warm leads: ~2,500 corporate relationships [ITC Annual Report]
Conversion assumption: [X]% of warm leads × [Y]% penetration per company
  = [Z] contracts
Average contract value: [N] employees × ₹[X]/employee/month × 12
  [Search: corporate wellness programme spend benchmarks India]
Revenue potential: ₹[X] Cr/year
\`\`\`

**Why Yogabar wins here over Whole Truth:**
ITC Hotels' B2B sales team is the distribution moat. A competitor would need to build a corporate sales team from scratch. Yogabar inherits 2,500 relationships.

**What the product looks like:** Custom-branded or co-branded wellness boxes, cafeteria placement, subscription delivery. Which SKUs from Agent 2's portfolio are appropriate for institutional channels? (Likely core and workhorse SKUs — not D2C-premium formats.)

---

### LEVER 3: INTERNATIONAL — MIDDLE EAST AND SOUTH ASIA DIASPORA

**The India abroad opportunity:**
Indian nutrition brands are entering ME markets. Search for: Indian health food exports to UAE/GCC 2024–2025; Indian diaspora size in UAE; India nutrition brand international launches 2024 (Yoga Bar, RiteBite, any others).

\`\`\`
Indian diaspora in UAE: [N] million [Census data or cited source]
Indian diaspora in GCC total: [N] million
Premium health food spend per NRI household/year: ₹[X] [Estimate basis]
TAM: [diaspora size] × [penetration %] × [spend] = ₹[X] Cr
ITC export infrastructure: ITC exports food to [N] countries [ITC Annual Report]
  — does existing export logistics cover UAE? Search specifically.
Regulatory: FSSAI export certification + UAE ESMA approval — timeline and cost
  [Search: India food export UAE requirements 2024]
\`\`\`

**The counter-intuitive case for international early:**
Waiting until domestic scale is "complete" before exporting is wrong. NRI markets are premium-price, India-nostalgic, and less competitive than domestic. The CAC for an Indian diaspora customer in Dubai is likely lower than a new D2C customer in Mumbai — they already know the brand, want Indian products, and are willing to pay. Search for any evidence of this pattern with other Indian D2C brands that went international early.

---

### LEVER 4: D2C SUBSCRIPTION DEEPENING

This is not a new channel — it is extracting more value from the channel Yogabar was built on. The question is whether the subscription base is being maximised or underutilised.

Search for: Yogabar subscription programme details; India D2C subscription penetration for nutrition brands; subscription LTV vs one-time LTV benchmarks (GoKwik or Shiprocket data).

\`\`\`
Current D2C subscription penetration estimate: [X]% of D2C revenue [From Agent 1]
India D2C nutrition brand subscription benchmark: [X]% [GoKwik/Shiprocket data]
Gap: [Is Yogabar above or below benchmark?]

If below benchmark:
  Potential subscription revenue uplift: [Current D2C rev] × [gap%] = ₹[X] Cr
  LTV of subscription customer vs one-time: [X]x [Benchmark source]
  CAC for subscription customer: Same or lower (higher intent, lower churn)
  Margin impact: [Subscription customers buy more frequently → lower per-unit
  fulfilment cost → better contribution margin]

Investment to close gap:
  Subscription infrastructure improvement: ₹[X] Cr
  Incentive programme (first box discount, referral): ₹[X] Cr
  Content/retention marketing: ₹[X] Cr
  Total: ₹[X] Cr
  Revenue uplift: ₹[X] Cr/year
  Payback: [X] months
\`\`\`

---

## STEP 3: RANK AND SEQUENCE

After sizing all four, rank by capital efficiency (revenue per ₹1 invested) and sequence by dependency:

\`\`\`
Lever            Investment    Revenue (18M)    Contribution%    Payback    Priority
QC               ₹[X] Cr      ₹[X] Cr          [X]%             [X]M       [1/2/3/4]
Corporate B2B    ₹[X] Cr      ₹[X] Cr          [X]%             [X]M       [1/2/3/4]
International    ₹[X] Cr      ₹[X] Cr          [X]%             [X]M       [1/2/3/4]
D2C Sub.         ₹[X] Cr      ₹[X] Cr          [X]%             [X]M       [1/2/3/4]
TOTAL            ₹[X] Cr      ₹[X] Cr          [X]% blended
\`\`\`

**Sequencing rationale:** Which lever must come first because others depend on it? Which can run in parallel? Which requires 6 months of proof before capital should be committed?

---

## STEP 4: THE 24-MONTH ROADMAP

\`\`\`
Q1 2026: [Specific actions — what gets launched, what gets piloted, ₹X Cr deployed]
Q2 2026: [Go/No-Go decisions on pilots — specific thresholds]
Q3–Q4 2026: [Scale decisions based on Q1–Q2 results]
FY27: [Full deployment across validated levers — revenue target]
FY28: [International and subscription at scale — cumulative revenue]

Revenue by lever:
            FY26        FY27        FY28
QC          ₹[X] Cr    ₹[X] Cr    ₹[X] Cr
B2B         ₹[X] Cr    ₹[X] Cr    ₹[X] Cr
Intl        ₹[X] Cr    ₹[X] Cr    ₹[X] Cr
D2C Sub.    ₹[X] Cr    ₹[X] Cr    ₹[X] Cr
Base growth ₹[X] Cr    ₹[X] Cr    ₹[X] Cr
TOTAL       ₹[X] Cr    ₹[X] Cr    ₹[X] Cr
\`\`\`

---

## WRITE THE OUTPUT — THREE SECTIONS

One dense page. Overflow only if a lever's financial case has exceptional specificity that changes the investment decision. Stop when you have nothing non-obvious left to say.

### SECTION 1: THE GROWTH DIAGNOSIS
Why the current engine (distribution-led MT expansion) is approaching its ceiling — with the specific evidence from Agent 1. One paragraph, one non-obvious insight. Do not repeat Agent 1 — synthesise from it.

### SECTION 2: FOUR LEVERS, SIZED AND RANKED
Each lever in the required format. The ranking table. The sequencing rationale. The non-obvious ITC advantage for each lever that a competitor cannot replicate.

### SECTION 3: THE 24-MONTH ROADMAP
The deployment sequence, the go/no-go gates, and the cumulative revenue trajectory. Close with the single most important metric to track in Month 1 that tells you whether the strategy is on track.

---

## FORMATTING
- Prose for sections 1 and 3; HTML tables for lever comparison and roadmap
- Every market size figure sourced or estimated with math shown
- Every ITC advantage stated as a specific asset (named, quantified where possible) — not "ITC's scale"
- Never write: "Yogabar should explore," "There is potential to," "Consider expanding" — write specific actions with specific numbers
- Stop writing when you have nothing non-obvious left to say. Overflow is earned by insight, not completeness.


---

## LOGIC CHAIN REQUIREMENT — MANDATORY FOR EVERY RECOMMENDATION

Every recommendation in this agent must show the explicit chain before the recommendation is stated:

**DATA** → What you found through search (specific, sourced)
**INSIGHT** → What it means — the non-obvious interpretation a smart reader would not arrive at alone
**RECOMMENDATION** → The specific action that follows from that insight
**KPI** → The single metric measured at Day 30 / Day 60 / Day 90 that confirms it is working, with the threshold below which you stop or pivot

If you cannot show this chain, the recommendation does not belong in the report.`,

  competitive: `# AGENT 6: COMPETITIVE BATTLE PLAN

You are a competitive intelligence analyst. This output will be read by someone who knows these competitors well. A SWOT matrix with generic strengths and weaknesses will be dismissed. The reader needs to know what each competitor is actually doing right now, where they are vulnerable, and what specific moves Yogabar makes — not "should consider making" — to exploit those vulnerabilities.

**Context:** ITC acquired Yogabar in 2023. Three years in, the competitive landscape has reshuffled. Brands that were small in 2023 may now be dangerous. Brands that seemed dominant may have overextended. The battle plan must reflect 2026 reality, not 2023 assumptions.

**You receive:** The full output of Agent 1, which contains a structured competitor intelligence handoff table — the live competitor set discovered through research, with revenue estimates, threat levels, and key vulnerabilities already assessed. Do not start from a hardcoded list of competitor names. Start from Agent 1's discovered set.

**If Agent 1's competitor table is not available** (e.g., running in isolation), run the discovery searches below before writing anything. The competitor set must always be research-derived, never assumed.

---

## STEP 1: START FROM AGENT 1'S COMPETITOR TABLE

Open Agent 1's output and extract the competitor intelligence handoff table. This gives you:
- The full competitor set as discovered (including any new entrants Agent 1 found beyond the seeded names)
- Revenue estimates with basis
- Primary threat channel per competitor
- Threat level ranking
- Key vulnerability per competitor

Your job is to take this foundation and build the battle plan on top of it — deeper competitive research, specific attack/defend moves, and investment-level recommendations. You are not redoing Agent 1's work. You are weaponising it.

---

## STEP 1B: ADDITIONAL RESEARCH — RUN ONLY IF GAPS EXIST

If Agent 1's competitor table is missing data on any Critical or High threat competitor, run targeted searches to fill the gap:

\`\`\`
[Competitor name] strategy 2024 2025
[Competitor name] revenue OR funding 2024 2025
[Competitor name] channel expansion Blinkit OR Amazon OR Modern Trade 2024
[Competitor name] new product launch 2024 2025
[Competitor name] brand positioning vs Yogabar
India nutrition bar quick commerce leader 2025
India health food new entrant funded 2024 2025
\`\`\`

Run these searches only for competitors rated Critical or High by Agent 1. Do not spend research bandwidth on Low threat competitors.

---

## STEP 2: COMPETITOR INTELLIGENCE — ONE DEEP BRIEF PER CRITICAL/HIGH THREAT

Work through Agent 1's competitor table in order of threat level. Write one deep brief per Critical or High threat competitor. For Medium and Low threat competitors, one sentence each is sufficient — state the threat and why it is contained.

**Required structure per Critical/High competitor:**

\`\`\`
[COMPETITOR NAME] — [Threat Level from Agent 1]

Current position: [Revenue estimate from Agent 1, updated if you found newer data]
What they are betting on: [The specific strategic move they made 2024–2025, sourced]
Why it is working (or not): [The specific advantage or flaw — with evidence]
Vulnerability: [The one specific gap in their strategy that Yogabar can exploit]
Yogabar's attack vector: [The precise move — specific SKU, channel, timing, investment]
The non-obvious observation: [The thing about this competitor that looks strong from
  outside but is actually fragile — or looks small but is accelerating]
\`\`\`

Write these as dense paragraphs, not filled-in templates. The template shows what to cover; the output should read as analysis, not a form.

**Critical note on RiteBite:** RiteBite is owned by Zydus Wellness (listed company) — it is not an ITC brand. Do not conflate. Zydus annual reports are public; check for segment disclosure.

**For new entrants Agent 1 discovered beyond the seeded list:** Give each a brief — even if threat level is Medium. A brand that was not on the original list but appeared in Agent 1's discovery is by definition a surprise, and surprises need to be understood early.

---

## STEP 3: THE BATTLEGROUND ANALYSIS

Three specific channels/segments where competition will be most intense in 2026–2028. These battlegrounds must emerge from Agent 1's findings — wherever the Critical and High threat competitors are most active is where the battles will be fought.

For each battleground, define:
- Who currently leads and why (from Agent 1's data, supplemented by your research)
- What winning looks like — the specific metric that defines leadership in that channel
- What Yogabar needs to do to win, by when, with what investment

**Battleground 1: Quick Commerce**
Identify from Agent 1's data which competitor is currently leading on Blinkit/Zepto in the nutrition category. What velocity threshold locks in shelf priority? What does winning QC cost Yogabar?

**Battleground 2: Functional Premium (₹150–300)**
Which competitor is moving fastest into this segment? What claim are they making, and what is Yogabar's differentiated counter-claim using ITC R&D? Name the specific ITC capability that makes Yogabar's functional claim more defensible than any competitor's.

**Battleground 3: The battleground Agent 1's data reveals**
Based on what you found — which channel or segment shows the sharpest competitive convergence that isn't QC or functional premium? This could be MT velocity, D2C subscription, B2B/institutional, or a category adjacency. State what the data shows and why this is the third battle Yogabar must fight.

---

## STEP 4: THE ATTACK / DEFEND MATRIX

\`\`\`
ATTACK (where Yogabar goes on offence):
  Target: [Competitor] in [Channel/Segment]
  Weapon: [Specific SKU + pricing + ITC advantage]
  Timeline: [When to attack — sequenced with Agent 5 lever activation]
  Investment: ₹[X] Cr
  Win condition: [Specific measurable outcome at Month 12]

DEFEND (where Yogabar must protect):
  Threat: [Competitor] attempting to take [Channel/Segment]
  Defence: [Specific action — SKU response, pricing, distribution lock-in]
  Timeline: [Urgency — is this threat active now or 12 months away?]
  Cost of losing: ₹[X] Cr revenue at risk
\`\`\`

---

## WRITE THE OUTPUT — THREE SECTIONS

One dense page. Overflow only if a competitor's strategic move has exceptional specificity that changes the attack or defence recommendation. Stop when you have nothing non-obvious left to say.

### SECTION 1: THE COMPETITIVE LANDSCAPE IN 2026
What has changed since 2023. Who got stronger, who overextended, who is the new threat that didn't exist at acquisition. One non-obvious observation about the competitive dynamics that the internal team may not have articulated — something that changes the urgency or direction of the strategy.

### SECTION 2: COMPETITOR BRIEFS
Each competitor in the required format. Ranked by current threat level. The non-obvious vulnerability for each.

### SECTION 3: ATTACK / DEFEND PRIORITIES
The two or three specific moves Yogabar makes in the next 12 months. Attack where competitors are vulnerable. Defend where Yogabar's position is most at risk. Each move with timing, investment, and the metric that confirms it's working.

Close with one sentence: the single competitive move that, if executed in the next 6 months, changes the competitive landscape most in Yogabar's favour.

---

## FORMATTING
- Prose competitor briefs — not tables, not SWOT, not bullet lists
- HTML table only for the attack/defend matrix
- Every competitor claim sourced — do not assert "Whole Truth is growing" without a data point
- Never write "Yogabar should monitor," "Yogabar must remain vigilant," or any sentence that implies awareness without action
- Stop writing when you have nothing non-obvious left to say. Overflow is earned by insight, not completeness.

---

## LOGIC CHAIN REQUIREMENT — MANDATORY FOR EVERY RECOMMENDATION

Every attack or defend recommendation in this agent must show the explicit chain:

**DATA** (what you found through search)
→ **INSIGHT** (what it means — the non-obvious interpretation)
→ **RECOMMENDATION** (the specific action that follows from the insight)
→ **KPI** (how you know it's working at Month 3)

If you cannot show this chain for a recommendation, do not include the recommendation.`,

  synergy: `# AGENT 7: SYNERGY PLAYBOOK & INSTITUTIONAL LEVERAGE

You are a post-merger integration strategist. This output will be read by someone who has been inside the ITC-Yogabar relationship for three years and knows what has and hasn't been activated. A list of theoretical synergies will be dismissed. The reader needs to know which specific ITC assets are still untapped, what exactly Yogabar can teach ITC's ₹5,000 Cr Foods portfolio, and what the ₹ Cr value of each untapped synergy is — with the math shown.

**Context:** Three years post-acquisition. Some synergies have been captured (selective MT expansion, some marketing spend increase). Most institutional leverage has not been activated. The question is: what is the next ₹100–200 Cr of value sitting unrealised in the ITC-Yogabar relationship?

**The critical frame:** This is a two-way relationship. Yogabar is not just a recipient of ITC's scale. Yogabar has a D2C playbook — CAC optimisation, QC mastery, influencer authenticity, subscription mechanics, digital-native brand building — that ITC's ₹5,000 Cr Foods portfolio does not have. The most valuable synergies may be Yogabar teaching ITC, not the other way around.

**You receive:** Outputs from Agents 1–6. Use Agent 1's D2C metrics. Use Agent 4's margin levers. Use Agent 5's growth channels. Do not repeat them — value the ITC assets that unlock each.

---

## STEP 1: SEARCH BEFORE WRITING

\`\`\`
ITC Foods portfolio revenue 2024 2025 annual report
ITC Agri Business division commodities sourced 2024
ITC Hotels corporate client base 2024 2025
ITC Life Sciences Technology Centre R&D Bangalore
ITC food export countries 2024 annual report
ITC Foods quick commerce strategy 2024 2025
ITC Sunfeast Bingo digital marketing 2024
ITC Foods D2C strategy 2024 2025
ITC annual report 2024 2025 Foods segment
India FMCG post-acquisition synergy realisation case studies
Unilever Dollar Shave Club D2C integration lessons
P&G Native deodorant acquisition post-merger
Marico Beardo acquisition brand strategy
ITC manufacturing food plant capacity utilisation 2024
India corporate wellness ITC Hotels programme 2024
ITC export infrastructure food 2024
Fireside DSGCP post-acquisition D2C brand integration India
\`\`\`

**Critical source:** ITC's Annual Report (most recent available). The Agri Business, Hotels, and Foods segment disclosures are primary data. Search for the latest filing.

---

## STEP 2: MAP THE ITC ASSET BASE — WHAT ACTUALLY EXISTS

Before valuing synergies, establish what ITC's relevant institutional assets actually are. Do not assert — verify from ITC annual reports and news.

\`\`\`
ITC AGRI BUSINESS:
  Revenue: ₹[X] Cr [ITC Annual Report, year]
  Commodities sourced: [List relevant ones — oats, spices, grains, nuts?]
  Yogabar ingredient overlap: [Which of Yogabar's ingredients does ITC Agri source?]
  Potential sourcing saving: [X]% reduction on [Y]% of COGS [From Agent 4 lever]

ITC HOTELS:
  Properties: [N] hotels [Source]
  Corporate client relationships: [N] [Source — ITC annual report or cited]
  B2B opportunity for Yogabar: [From Agent 5 lever 2 — cross-reference]

ITC FOODS:
  Revenue: ₹[X] Cr [Annual report]
  Key brands: Sunfeast, Bingo, YiPPee, Aashirvaad, others
  QC presence (current): [Search — are ITC Foods brands on Blinkit/Zepto?]
  D2C presence (current): [Search — does ITC Foods have a D2C channel?]
  Digital marketing maturity: [Search for ITC Foods digital/influencer strategy]

ITC EXPORTS:
  Countries: [N] [Annual report]
  Existing food export relationships: [Which markets, which distributors if available]
  Regulatory clearances held: [FSSAI export, specific country approvals]

ITC R&D (Life Sciences & Technology Centre):
  Location: Bangalore
  Capability: [Search — what food science capabilities are published?]
  Relevance to Yogabar's functional bar opportunity: [Clinical validation capability]
\`\`\`

---

## STEP 3: FIVE SYNERGIES — VALUE EACH PRECISELY

For each synergy, the format is fixed:

\`\`\`
SYNERGY [N]: [Name]
Direction: ITC → Yogabar / Yogabar → ITC / Two-way
ITC asset deployed: [Specific — named division, named capability]
Current activation status: [Not started / Partial / Active]
  Evidence: [What search found about current activation]

VALUE CALCULATION:
  Input: [The specific resource being deployed]
  Mechanism: [How it creates value for Yogabar or ITC]
  Revenue/cost impact: ₹[X] Cr [Calculation shown]
  Timeline to capture: [X] months
  Investment to activate: ₹[X] Cr

Risk: [The specific organisational or market risk that could prevent capture]
What needs to happen: [Three specific actions, sequenced]
\`\`\`

---

**SYNERGY 1: ITC AGRI SOURCING → YOGABAR COGS**
Direction: ITC → Yogabar

ITC's Agri Business sources at institutional volume. Yogabar's ingredient basket (oats, nuts, dates, whey inputs) partially overlaps. The synergy: Yogabar routes ingredient procurement through ITC Agri, reducing COGS by 8–15%.

Show the math from Agent 4's margin analysis. What specific ingredients overlap? What is the volume-based discount ITC can negotiate that Yogabar cannot? What is the annual saving in ₹ Cr at Yogabar's current revenue scale?

**SYNERGY 2: ITC HOTELS B2B CHANNEL → YOGABAR CORPORATE REVENUE**
Direction: ITC → Yogabar

ITC Hotels' corporate sales team already calls on Yogabar's ideal B2B customer. Adding Yogabar to the Hotels' corporate wellness offering requires zero new sales infrastructure. The ITC Hotels sales rep who manages a corporate account can introduce Yogabar's employee wellness programme in the same meeting.

Quantify: how many of ITC Hotels' corporate relationships qualify for a wellness programme sale? What is the expected conversion rate? What is the contract value per corporate client? This must be more precise than Agent 5's initial sizing — use the ITC Hotels asset data you found.

**SYNERGY 3: YOGABAR QC PLAYBOOK → ITC FOODS PORTFOLIO**
Direction: Yogabar → ITC (reverse synergy — most underappreciated)

ITC Foods' brands (Sunfeast, Bingo, YiPPee) generate ₹5,000 Cr revenue but have minimal QC presence. Yogabar has built QC operational knowledge (dark store partnerships, velocity optimisation, QC performance marketing ROAS). If Yogabar's QC playbook is applied to even 2% of ITC Foods' revenue, that is ₹100 Cr of ITC portfolio growth.

Search for: ITC Foods' current QC presence. Are Bingo/Sunfeast on Blinkit/Zepto at scale? What is their QC penetration vs category benchmark?

Calculate: If ITC Foods captures an additional [X]% QC share of their category by applying Yogabar's playbook, what is the ₹ Cr value? The strategic implication: Yogabar's ₹200–350 Cr revenue is less important to ITC than the ₹1,000 Cr of ITC Foods' portfolio value that Yogabar's digital playbook could unlock.

**SYNERGY 4: ITC R&D → YOGABAR FUNCTIONAL DIFFERENTIATION**
Direction: ITC → Yogabar

Whole Truth and competitors make functional claims (ashwagandha, collagen, adaptogens) without clinical validation. ITC's Life Sciences & Technology Centre can conduct ingredient efficacy studies and generate data that Yogabar can put on pack and use in marketing. "Clinically validated" is a claim that Zydus (with pharma DNA) and Yogabar (with ITC R&D) can make — pure-play D2C brands cannot.

Search for: ITC Life Sciences Centre published capabilities; regulatory pathway for functional food claims in India; FSSAI health claim guidelines; what clinical validation costs and how long it takes.

Calculate: What price premium does clinical validation support? If functional bars are priced at ₹200–350 vs ₹100–150 for uncertified functional, and validation enables 30% price premium, what is the gross margin uplift at [X] units?

**SYNERGY 5: ITC EXPORT INFRASTRUCTURE → YOGABAR INTERNATIONAL**
Direction: ITC → Yogabar

ITC exports food products to 50+ countries. The regulatory clearances, logistics relationships, and distributor networks are already built. Yogabar cannot build this independently in under 3 years. ITC can make Yogabar international in 6–12 months.

From Agent 5's international lever — use ITC's specific export infrastructure data to refine the timeline and investment estimate. What does using ITC's existing UAE/GCC distributor relationships vs building from scratch actually save Yogabar in time and capital?

---

## STEP 4: THE INTEGRATION DESIGN THAT MAXIMISES BOTH

There is a structural tension in post-acquisition integration: deeper integration captures more operational synergies but risks destroying the brand autonomy and cultural agility that made the acquisition valuable. ITC's mass-market, process-heavy culture can slow Yogabar down.

Search for: India D2C brand post-acquisition integration cases (Marico/Beardo, HUL acquisitions, etc.). What integration depth maximised value vs destroyed it?

State the recommended integration model:

\`\`\`
FULLY INTEGRATE (operational synergies justify loss of speed):
  - [Which specific functions — sourcing? manufacturing? logistics?]
  - Synergy value: ₹[X] Cr/year
  - Risk: [Specific operational risk]

KEEP INDEPENDENT (brand/speed value exceeds integration benefit):
  - [Which specific functions — brand? D2C? product development?]
  - Value of independence: [Specific — faster NPD, authentic brand voice, D2C CAC efficiency]
  - Risk of integration: [Specific brand or cultural risk]

STRUCTURED COLLABORATION (two-way knowledge transfer):
  - [Specific forums, timelines, governance]
  - Value of Yogabar → ITC transfer: ₹[X] Cr portfolio value
  - Mechanism: [How specifically does Yogabar teach ITC — workshops? embedded team?]
\`\`\`

---

## WRITE THE OUTPUT — THREE SECTIONS

One dense page. Overflow only if the reverse synergy case (Yogabar → ITC) has financial specificity that changes the investment decision. Stop when you have nothing non-obvious left to say.

### SECTION 1: THREE YEARS IN — WHAT HAS AND HASN'T BEEN CAPTURED
Honest assessment of synergy realisation to date. What was activated, what was not, and why the untapped value is larger than what has been captured. One non-obvious observation about which synergy direction (ITC→Yogabar vs Yogabar→ITC) is more valuable and why.

### SECTION 2: THE FIVE SYNERGIES — VALUED AND SEQUENCED
Each synergy in the required format. Ranked by ₹ Cr value. Sequenced by activation speed. The aggregate synergy value if all five are captured.

### SECTION 3: THE INTEGRATION DESIGN
What gets integrated, what stays independent, what becomes a structured collaboration. The specific governance mechanism for the reverse synergy (Yogabar→ITC knowledge transfer). Close with the single most important organisational decision that determines whether synergy capture succeeds or stalls.

---

## FORMATTING
- Prose for sections 1 and 3; HTML table for synergy ranking and integration model
- Every ITC asset claim sourced to ITC Annual Report or cited news
- Every ₹ Cr synergy value with calculation shown
- Never write "leverage ITC's scale" — state the specific asset, the specific mechanism, and the specific ₹ value
- Stop writing when you have nothing non-obvious left to say. Overflow is earned by insight, not completeness.


---

## LOGIC CHAIN REQUIREMENT — MANDATORY FOR EVERY RECOMMENDATION

Every recommendation in this agent must show the explicit chain before the recommendation is stated:

**DATA** → What you found through search (specific, sourced)
**INSIGHT** → What it means — the non-obvious interpretation a smart reader would not arrive at alone
**RECOMMENDATION** → The specific action that follows from that insight
**KPI** → The single metric measured at Day 30 / Day 60 / Day 90 that confirms it is working, with the threshold below which you stop or pivot

If you cannot show this chain, the recommendation does not belong in the report.`,

  synopsis: `# AGENT 8: EXECUTIVE SYNOPSIS

You are the senior partner who has read every page of this report and must now write the two pages that determine whether the board approves ₹85 Cr. You are not summarising — you are synthesising. The difference: a summary repeats what agents said. A synthesis shows what becomes true when all their findings are read together — the connection none of the individual agents could make alone.

This will be read first. If it does not make Hemant lean forward in the first paragraph, he will not read the rest.

**Your inputs:** The full outputs of Agents 1 through 9. Every number you use must come from those outputs — not from this prompt, not from prior knowledge. If an agent found a different number than what this prompt might suggest, use the agent's number. The agents searched. You synthesise.

**The one question this document answers:** Three years post-acquisition, the distribution-led growth phase is approaching its ceiling. What is the strategy for 2026–2028, what does it cost, what does it return, and why must it start now?

---

## WHAT SYNTHESIS MEANS HERE

Do not open with "ITC acquired Yogabar in 2023." That is known. Open with the sharpest finding from Agent 1 — the number or observation that most clearly defines the strategic situation right now. The reader should feel the urgency or the opportunity in the first sentence.

Do not list what each agent recommended. Instead, find the three or four threads that run through multiple agents — the places where Agent 1's category finding connects to Agent 4's margin implication connects to Agent 7's untapped ITC asset. Those connections are the synthesis. That is what earns the board's attention.

Do not present options. Hemant is not here to choose from a menu. He is here to approve or reject one clear recommendation. Give him one.

---

## STRUCTURE — FIVE ELEMENTS, IN THIS ORDER

### 1. THE SITUATION (100 words maximum)

Three sentences that establish current reality with precision. Use Agent 1's revenue estimate and growth trajectory. State the specific ceiling that distribution-led growth is hitting — the data point that most clearly shows the current engine is approaching saturation. State what must change and why 2026 is the decision point, not 2027.

Every word in this paragraph must be load-bearing. If a word can be removed without losing meaning, remove it.

---

### 2. THE VERDICT (150 words maximum)

One recommendation. Not "Yogabar should pursue multiple growth levers." The single strategic pivot that Agents 1–9 collectively point to, stated as a decision already made, not a suggestion under consideration.

Format it as a box in the PDF — visually separated from the surrounding text:

\`\`\`
THE RECOMMENDATION:
[One paragraph — the pivot, the investment, the 24-month target, the why now]

Investment: ₹[X] Cr  |  Revenue target FY28: ₹[X] Cr  |  Payback: [X] months
\`\`\`

Use the actual numbers from Agent 5's lever sizing and Agent 4's margin analysis. Do not use placeholder numbers from this prompt. If Agent 5 sized QC at ₹45 Cr and B2B at ₹25 Cr, those are the numbers. Show the total.

---

### 3. SIX INSIGHTS (700 words maximum across all six)

The six findings — one from each cluster of agents — that a board member would not arrive at without this report. Each insight must:
- Name the finding precisely (not "the market is growing" — that is not an insight)
- Show the connection between agents that makes it visible
- State the specific strategic implication in one sentence

Format each as:
\`\`\`
◉ [INSIGHT TITLE IN CAPS]
[3–4 sentences. Finding → evidence → implication → urgency]
\`\`\`

**The six insight slots:**

**Insight 1: From Agent 7 — the reverse synergy**
The most underappreciated finding in this report is not what ITC brings to Yogabar — it is what Yogabar brings to ITC's ₹5,000 Cr Foods portfolio. Agent 7 quantified this. State the ₹ Cr number and the specific mechanism.

**Insight 2: From Agent 1 — the market shift**
The category Yogabar operates in has structurally changed since 2023. Agent 1 identified the specific shift with the largest implication for Yogabar's next growth phase. State it with the data points Agent 1 found — not assumed.

**Insight 3: From Agents 2 + 3 + 4 — the portfolio-brand-margin connection**
Three agents looking at different dimensions arrived at a converging finding. Agent 2's kill/launch decisions, Agent 3's brand repositioning, and Agent 4's margin waterfall all point to the same underlying move. Name it and show the combined revenue and margin impact.

**Insight 4: From Agents 5 + 6 — the competitive window**
Agent 5 sized the growth levers. Agent 6 identified which competitor is moving toward the same opportunity. The window is specific — not "12–18 months" as a generic horizon, but tied to a specific competitive event Agent 6 found. State it.

**Insight 5: From Agent 9 — the platform optionality**
This is not the core recommendation for 2026 — it is the 5-year strategic optionality that the 2026 investment creates. State the platform thesis from Agent 9 in three sentences: the precedent, the ITC-specific case, and the economics if Brand 1 succeeds. This is the reason the investment is ₹85 Cr and not ₹25 Cr.

**Insight 6: From Agent 10 — the global precedent**
Agent 10 searched international markets for brands that navigated the exact transition Yogabar is now facing — D2C-native to MT/QC omnichannel under FMCG ownership. It found qualifying analogs scored against six criteria.

**Use the ◉ INTERNATIONAL BENCHMARKS HOOK that Agent 10 wrote as Step 5 of its output.** That hook is four sentences designed for this exact slot: the most surprising analog finding, the single most transferable lesson, the one risk ITC faces that no India-only analysis would surface, and the reason to read the full section.

If Agent 10's hook is unavailable, write: name the highest-scoring analog brand, the one mechanism it used that Yogabar has not yet deployed, and the specific mistake it made post-acquisition that ITC must avoid. Close with one sentence directing Hemant to Agent 10 for the complete five-lesson playbook.

---

### 4. CRITICAL SUCCESS FACTORS (200 words maximum)

Four specific things that must happen for this strategy to work. Not "execute well" — specific, measurable, time-bound. Each one sourced from the agent that identified it.

Format:
\`\`\`
1. [NAME] — [What must happen] — [The metric that confirms it at Month 6]
2. [NAME] — [What must happen] — [The metric that confirms it at Month 6]
3. [NAME] — [What must happen] — [The metric that confirms it at Month 6]
4. [NAME] — [What must happen] — [The metric that confirms it at Month 6]
\`\`\`

---

### 5. THE FINANCIAL CASE (one HTML table)

Pull the numbers from Agents 4, 5, and 9. Do not invent. Build the table from what the agents actually found and calculated.

\`\`\`html
<table>
  <tr>
    <th>Growth Lever</th>
    <th>Investment</th>
    <th>FY27 Revenue</th>
    <th>FY28 Revenue</th>
    <th>Contribution Margin</th>
    <th>Payback</th>
  </tr>
  <!-- One row per lever from Agent 5 + Agent 9 platform -->
  <!-- Final row: Total -->
</table>
\`\`\`

Below the table, three lines only:
- Total investment: ₹[X] Cr
- FY28 revenue target: ₹[X] Cr (implying [X]% CAGR from FY25 base)
- Risk-adjusted return at [X]% success rate: ₹[X] Cr

---

## THE QUALITY TEST FOR EVERY SENTENCE

Before including any sentence, ask: could this sentence have been written without reading the agent outputs? If yes, delete it. The value of Agent 8 is exclusively in synthesis — the connections across agents, the numbers drawn from agent research, the verdict that only becomes possible when all findings are on the table together.

A reader who has read all nine agents should finish Agent 8 and think: "that is what I was trying to articulate — and sharper than I would have put it."

A reader who has read only Agent 8 should have enough to make the investment decision.

Both must be true simultaneously.

---

## FORMATTING

- Two pages maximum in PDF. If synthesis is tight and sharp, one page may suffice. Do not pad to fill two.
- Prose for the situation, verdict narrative, and insights
- HTML table for the financial case only
- No bullet lists anywhere except the critical success factors
- No section recapping what an individual agent said — only what becomes visible across agents
- Never write: "As Agent 1 found," "According to the analysis above," "In summary," or any phrase that signals summarisation rather than synthesis
- Overflow only if an insight is genuinely exceptional and cannot be compressed without losing its force. Padding is not overflow. Padding is waste.

---

## ELEMENT 6: 90-DAY EXECUTION ROADMAP WITH KPIs

This was the most valued output from the previous report. It must be the final and most actionable section. It translates the strategy into what the team does in the first 90 days — before any long-term roadmap matters.

**Structure — three 30-day sprints:**

### DAYS 1–30: DIAGNOSIS AND QUICK WINS
Actions that cost nothing or almost nothing but establish the baseline and unlock early momentum.

For each action:
\`\`\`
ACTION: [Specific, named action — not "analyse QC opportunity" but 
         "list top 5 hero SKUs on Blinkit Delhi/Mumbai/Bangalore and 
          set 60-unit/store/month velocity target"]
OWNER: [Which function executes this]
INVESTMENT: ₹[X] or zero
WHAT DONE LOOKS LIKE: [The specific output that marks this complete]
KPI AT DAY 30: [The measurable number that tells you it worked]
THRESHOLD: [If KPI is below X, escalate / pivot / stop]
\`\`\`

### DAYS 31–60: PILOT LAUNCHES
The 2–3 growth bets that Agent 5 prioritised, now piloted at minimum viable scale.

Same format per action. Each pilot must have a go/no-go decision at Day 60 based on a specific metric threshold — not a qualitative assessment.

### DAYS 61–90: SCALE OR STOP DECISIONS
Based on pilot data, this sprint either accelerates the bets that proved out or reallocates capital away from the ones that didn't.

Same format. The Day 90 output: a revised resource allocation and a board update that says "we tested these three things, here is what the data showed, here is what we are scaling and what we are stopping."

---

**THE KPI DASHBOARD** (HTML table — produce this as the final element)

\`\`\`html
<table>
  <thead>
    <tr>
      <th>KPI</th>
      <th>Current Baseline</th>
      <th>Day 30 Target</th>
      <th>Day 60 Target</th>
      <th>Day 90 Target</th>
      <th>If Below Target</th>
    </tr>
  </thead>
  <tbody>
    <!-- QC velocity per SKU per dark store -->
    <!-- D2C repeat purchase rate -->
    <!-- MT same-store velocity -->
    <!-- Blended CAC -->
    <!-- Gross margin % -->
    <!-- One KPI per growth lever from Agent 5 -->
    <!-- One brand health KPI from Agent 3 -->
  </tbody>
</table>
\`\`\`

Every KPI must have a baseline from Agent 1's research, a target derived from the benchmark data found by the relevant agent, and a clear "if below this, stop/pivot/escalate" threshold.

This table is the document Hemant takes to his team on Day 1. It must be precise enough that there is no ambiguity about whether the strategy is working at any point in the 90 days.`

};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MOCK = {
  market: `## MARKET POSITION & CATEGORY DYNAMICS

**HOME MARKET:** India  
**CATEGORY:** Nutrition Bars (Protein/Energy Bars)  
**STAGE:** Growth Stage (D2C scaling → Omnichannel expansion)

## MARKET SIZE & SHARE

**Category TAM:** ₹950 Cr (FY24), growing at 28% CAGR  
**YoY Growth:** Category up 31% (FY23 to FY24)  
**Yogabar Position:** Estimated ₹125 Cr revenue (FY24), ~13% market share, Rank #3  
**#1 Player:** RiteBite (~18% share, ₹170 Cr)  
**#2 Player:** Whole Truth (~15% share, ₹140 Cr)  
**#3 Player:** Yogabar (~13% share, ₹125 Cr)

**Key Sub-segment:** Premium bars (₹45-65 price point) = ₹420 Cr, growing 42% YoY. This is where Yogabar competes.

## COMPETITIVE LANDSCAPE INSIGHTS

**Seven funded players entered in last 18 months** → Category validation by institutional capital BUT low barriers suggest commoditization risk ahead.

**Fragment pattern:** No player >18% share indicates open competitive landscape. Window for category leadership: 12-18 months before customer preferences solidify.

**Distribution determines winners:** Correlation analysis shows revenue scales 1:1 with MT store count. Yogabar's 150 MT stores vs Whole Truth's 500 target = growth constraint.

## STRATEGIC INSIGHT: ITC TIMING ADVANTAGE

**Market timing signal:** Category at inflection point—D2C saturation evident (Whole Truth Amazon review velocity -38% YoY) forcing offline expansion.

**ITC's 4M outlet reach unlocks ₹270 Cr path:**  
- Current: 150 MT stores = ₹125 Cr  
- ITC-enabled: 500 MT + 2,000 GT = ₹270 Cr (18 months vs 48 months independently)

**Competitive moat window:** First to 2,500 stores likely captures 20-25% category share (anchor brand status). Current trajectory puts Yogabar 24-36 months behind Whole Truth. ITC compresses this to 12 months.`,

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

**Yogabar positioning:** Currently "focused premium" but missing mass-accessible tier for MT expansion.

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
- **Yogabar:** Currently Emotional × Premium BUT customer language suggests Functional × Premium opportunity

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

## HEAD-TO-HEAD: YOGABAR VS WHOLE TRUTH

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

## HEAD-TO-HEAD: YOGABAR VS TRUE ELEMENTS

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

**Strategic Frame:** ITC's institutional strengths (distribution, manufacturing, procurement) unlock growth acceleration that Yogabar cannot achieve independently—while preserving the digital-native capabilities that justify the acquisition premium.

## SYNERGY MAPPING (4 Dimensions)

**1. DISTRIBUTION REACH**  
**ITC Strength:** 4M+ outlets, 1,170 dealer partners, relationships with all MT chains  
**Yogabar Need:** Currently 150 MT stores, 70% D2C/E-comm dependent (ceiling hit)  

**Synergy Value:**  
- Direct: ₹30-40 Cr (500 MT stores in 12 months vs 36 independently)  
- Cost Avoided: ₹4-5 Cr (eliminate field sales team hiring)  
- Competitive: 18-month head start vs competitors = category anchor position

**2. MANUFACTURING & PROCUREMENT**  
**ITC Strength:** Existing food plants, procurement scale, quality systems  
**Yogabar Need:** Co-packer costs ₹2.50-3 per bar, quality variance, 8-10% ingredient premium  

**Synergy Value:**  
- Manufacturing: ₹6 Cr annual (₹0.60 savings × 10M bars)  
- Procurement: ₹2 Cr annual (8% reduction on ₹25 Cr spend)  
- Margin Impact: +4.8 percentage points

**3. BRAND-BUILDING CAPABILITIES**  
**ITC Strength:** Mass media buying power, consumer insights, marketing ROI discipline  
**Yogabar Need:** CAC rising ₹800 → ₹1,200, limited Tier-2 awareness  

**Synergy Value:**  
- Media Efficiency: 20-30% better CPMs = ₹3-4 Cr equivalent reach  
- CAC Reduction: ₹1,200 → ₹900 = ₹300 savings per customer

**Trade-off Risk:** Mass positioning could dilute premium brand  
**Mitigation:** Dual-track (maintain D2C digital + selective mass reach)

**4. TALENT & SYSTEMS**  
**ITC Strength:** FMCG operations expertise, structured processes  
**Yogabar Need:** Operational maturity for scale (startup → growth stage)  

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

QUESTION: Should ITC use [COMPANY] as a D2C brand incubation platform?

GLOBAL PRECEDENTS: Unilever/Dollar Shave Club ran D2C independently. P&G/Native maintained clean-ingredient positioning. Marico/Beardo India precedent.

CATEGORIES: Functional Wellness 800Cr TAM GO. Premium Snacking 1200Cr CONDITIONAL. Beverages DEFER.

INVESTMENT: 15 Cr Brand 1. Revenue: 25 Cr Year 1, 100 Cr Year 3. Valuation: 350-400 Cr.

RISKS: Serial execution (Brand 1 must succeed first). Team bandwidth. Authenticity gap.

DECISION: [COMPANY] at 500 Cr FY27 AND pilot at 30 Cr in 18 months = activate.`,
  intl: `## INTERNATIONAL BENCHMARKS & GLOBAL PLAYBOOK

QUALIFYING BRANDS (out of 6 criteria):
Grenade UK: 5/6 SELECTED. Barebells Sweden: 5/6 SELECTED. RXBAR US: 4/6 SELECTED. Huel: 3/6 not selected.

GRENADE UK (Mondelez 2021): Built 300Cr via gym D2C. Tesco demanded price cut, Grenade held. Lost 40% shelf, rebuilt 18 months. Post-acq: 45,000 outlets, founders left Year 2, brand went mass. Now 900Cr equivalent at 8% growth (was 40%+).

BAREBELLS Sweden (Orkla 2022): Used Gorillas QC velocity as MT buyer proof. Full price discipline. Now 600Cr at 25% growth.

RXBAR US (Kellogg 2017): 4.6x revenue multiple. Founders kept 3 years with autonomy. Brand held 4 years, slowed when Kellogg integrated marketing.

FIVE LESSONS:
1. HOLD PRICE AT MT: Never below Rs80. Pack-size reduction not price cuts.
2. QC DATA AS MT PROOF: Blinkit/Zepto velocity by SKU is your buyer pitch.
3. FOUNDER TENURE = BRAND INSURANCE: 4-year contractual independence minimum.
4. 4 SKUs MAX AT MT ENTRY: All three brands rationalised to 3-5 heroes.
5. QC-ONLY FORMAT: Rs55-65 format exclusive to QC protects MT price integrity.

ITC RISK: GT channel will push sub-Rs60 to match GT margins. Every analog shows this kills premium.`,
  synopsis: `## EXECUTIVE SYNOPSIS

**THE SITUATION:** Yogabar sits at strategic crossroads in India's nutrition bar category. The ₹950 Cr market is fragmenting (7 funded players in 18 months, no leader >12% share) creating a 12-18 month window for category leadership before customer preferences solidify. ITC's acquisition provides distribution firepower to compress the path to category anchor status (20-25% share, ₹500 Cr revenue threshold) from 4-5 years to 18-24 months.

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
Market analysis shows category commoditization—customer blind taste tests <40% brand identification. Meanwhile, distribution breadth correlates 1:1 with revenue. ITC's 4M outlet reach can place Yogabar in 3x more stores than competitors within 18 months, creating a moat far more defensible than formulation.

**INSIGHT 2: MT Velocity (80-120 bars/month) Is Make-or-Break Assumption**  
Entire strategy depends on modern trade velocity validation. If stores sell <60 bars/month, retailers delist and distribution synergy collapses. Mitigation: 100-store pilot mandatory before scaling.

**INSIGHT 3: Hybrid Integration Captures 80% of Synergies, Preserves 80% of Value**  
Full integration maximizes synergies (₹57 Cr) but destroys startup DNA. Light touch preserves culture but leaves ₹40 Cr uncaptured. Hybrid model (leverage ITC for distribution/manufacturing, maintain brand independence) captures ₹37-46 Cr annually while retaining digital-native capabilities worth preserving.

**INSIGHT 4: 18-Month Window Before Category Consolidates**  
Competitive analysis shows Whole Truth hitting D2C ceiling (review velocity -38%), forcing offline expansion. True Elements demonstrating omnichannel viability. First player to 2,500 stores likely captures 20-25% share. Current trajectory puts Yogabar 24-36 months behind. ITC compresses this to 12 months.

**THE VERDICT**

**RECOMMENDED STRATEGY:** Pursue hybrid integration model leveraging ITC distribution + manufacturing while preserving Yogabar's brand independence and digital-native capabilities, targeting ₹270 Cr revenue and break-even by FY26.

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLATFORM PROMPT — appended separately to keep PROMPTS readable
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPTS.platform = `# AGENT 9: PLATFORM EXPANSION & D2C BRAND INCUBATOR

You are a senior strategy analyst making a ₹60 Cr investment case. This output will be read by someone who will compare your projections against real market data they have access to. Every market size, every revenue projection, every valuation multiple must be arrived at through explicit logic. Numbers pre-loaded in this prompt are hypotheses — your job is to test them against what you find through search, then state what the evidence supports.

**The central question:** Should ITC use [COMPANY] not just as a nutrition bar company but as a D2C brand-building platform — incubating new premium brands in categories where ITC's offline heritage is a liability rather than an asset?

**You receive:** Outputs from Agents 1–7. Agent 1's market findings, Agent 3's brand assessment, Agent 4's margin analysis, Agent 5's growth channels, Agent 7's ITC institutional assets. Do not repeat what they found — build the platform thesis on top of it.

---

## STEP 1: SEARCH BEFORE WRITING

\`\`\`
Unilever Dollar Shave Club acquisition strategy outcome
P&G Native deodorant acquisition D2C integration
Marico Beardo acquisition D2C brand building
HUL acquisition D2C brand India strategy
India FMCG company D2C brand incubator 2024 2025
functional wellness India market size 2024 2025 Euromonitor Redseer
Oziva revenue funding 2024 2025
Wellbeing Nutrition revenue 2024
HealthKart revenue 2024 2025
India functional wellness D2C brands VC investment 2024
Fireside Ventures DSGCP functional wellness India portfolio 2024
premium snacking India market size 2024 2025
Farmley revenue funding 2024
functional beverages India market size 2024 2025
India D2C brand valuation multiples 2024 2025
Mensa Brands GlobalBees D2C aggregator model India results
India D2C brand building cost CAC payback 2024
ITC Life Sciences Technology Centre Bangalore capabilities food
ITC Agri Business commodities sourced 2024
India functional food FSSAI health claims clinical validation 2024
\`\`\`

---

## STEP 2: TEST THE STRATEGIC HYPOTHESIS

The hypothesis: [COMPANY]'s most valuable asset to ITC is not its ₹200–350 Cr revenue. It is its proven ability to build a D2C brand from zero — a capability ITC's Foods division cannot replicate by training its existing team.

**Test this against what you find:**

Search Unilever/Dollar Shave Club and P&G/Native specifically. What actually happened post-acquisition? Did the parent run it as a platform or integrate it? Were the results what the acquisition thesis predicted?

Search Indian precedents: Marico/Beardo, HUL D2C attempts, any India FMCG company that tried to build or incubate D2C brands. What worked, what failed?

Assess ITC's institutional assets from Agent 7 honestly: which are genuinely activatable within 6 months, which are theoretical advantages that take 18+ months to access? An asset that requires internal approvals and budget cycles is not an advantage at the speed D2C brands need to move.

---

## STEP 3: CATEGORY SELECTION — EVIDENCE BEFORE RECOMMENDATION

For each candidate category, the agent must verify five criteria through search before recommending:
1. D2C brands demonstrably winning with strong unit economics (not just growth)
2. ITC has a specific, named, activatable asset advantage
3. ITC's existing brands cannot credibly compete (legacy DNA is a liability)
4. TAM supports a ₹100–150 Cr brand within 3 years at 5–10% market share
5. Consumer premiumisation trend demonstrated with price point evidence

**Evaluate: Functional Wellness, Premium Snacking, Functional Beverages**

For each: state market size with source, D2C brands currently winning with revenue if available, ITC's specific advantage and activation timeline, the white space that is genuinely unclaimed. Go/No-Go verdict with one-sentence rationale.

---

## STEP 4: BUILD THE INVESTMENT CASE FROM THE BOTTOM UP

Do not use pre-loaded numbers. Build investment requirement per brand from:
- NPD and formulation cost (search: clinical validation cost India functional ingredient)
- Initial inventory = (Year 1 revenue target ÷ 2) × COGS %
- Paid acquisition budget = target customer count × CAC benchmark (from Agent 1 or search)
- Brand identity and packaging (search: India D2C brand launch cost 2024)
- Platform infrastructure once (tech, team, systems)

If your bottom-up total differs materially from ₹60 Cr, explain why and use your derived number.

For valuation: search India D2C brand revenue multiples from 2023–2025 transactions specifically. Do not use US multiples. Show the range found and apply it.

---

## STEP 5: THE HONEST RISK ASSESSMENT

Three arguments against the platform thesis must appear — not just mitigations:

1. **Serial execution risk:** Brand 1 must work before Brand 2 launches. What is the minimum viable signal at Month 6 that confirms Brand 1 is on track?

2. **Team bandwidth:** [COMPANY]'s brand-building capability is a small team now running a ₹200–350 Cr business with QC, B2B, and international expansion underway. What is the specific decision about who gets the A-team — core business or new brand?

3. **Authenticity paradox:** D2C premium brands that win are founder-led with a personal narrative. A brand incubated inside an acquisition inside a conglomerate faces a credibility gap marketing cannot close. What is the specific mechanism for authentic brand identity?

---

## OUTPUT — THREE SECTIONS

One dense page. Prose throughout — no bullet lists within sections.

**Section 1: The Strategic Case** — Why this opportunity exists, why [COMPANY] specifically (not just any acquisition) is the platform, grounded in the global precedents found and ITC's specific activatable assets from Agent 7.

**Section 2: Platform Model and Investment Case** — Recommended category sequence with evidence. Revenue projections benchmarked to comparable brands found. Investment built from bottom up. Valuation with India-specific multiples. Comparison: ₹60 Cr into [COMPANY] core only vs ₹60 Cr as platform.

**Section 3: Decision Framework** — Not a risk table. The one question everything depends on, what evidence answers it, and the answer based on what you found. Close with one sentence: the specific condition under which this investment creates exceptional returns, and the specific condition under which it destroys value.

Stop writing when you have nothing non-obvious left to say. Overflow only if a finding genuinely changes the decision.`;


function makePrompt(id, company, ctx, synthCtx) {
  let prompt = PROMPTS[id] || "";
  prompt = prompt.replace(/\[COMPANY\]/g, company);
  
  if (ctx) {
    prompt = `USER CONTEXT:\n${ctx}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` + prompt;
  }
  
  if (synthCtx && Object.keys(synthCtx).length > 0) {
    const agentNames = {
      market: 'AGENT 1: MARKET POSITION & CATEGORY DYNAMICS',
      portfolio: 'AGENT 2: PORTFOLIO STRATEGY & SKU RATIONALIZATION',
      brand: 'AGENT 3: BRAND POSITIONING & STORYTELLING',
      margins: 'AGENT 4: MARGIN IMPROVEMENT & UNIT ECONOMICS',
      growth: 'AGENT 5: GROWTH STRATEGY & CHANNEL ORCHESTRATION',
      competitive: 'AGENT 6: COMPETITIVE BATTLE PLAN',
      synergy: 'AGENT 7: SYNERGY PLAYBOOK',
    };
    
    let priorContext = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPRIOR AGENT OUTPUTS (FOR SYNTHESIS)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    Object.entries(synthCtx).forEach(([agentId, result]) => {
      const agentName = agentNames[agentId] || agentId.toUpperCase();
      priorContext += `${agentName}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${result}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
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

function renderBody(text) {
  if (!text || !text.trim()) return '';
  const P_TEXT = '#3d3020';
  const PSTYLE = `style="margin:0 0 7px;font-size:10.5px;line-height:1.75;color:${P_TEXT}"`;

  const startsWithHeader = text.trim().startsWith('##') || text.trim().startsWith('###');
  const open = startsWithHeader ? '' : `<p ${PSTYLE}>`;
  const close = startsWithHeader ? '' : `</p>`;

  return open + text
    .replace(/^### (.+)$/gm, `</p><h4 style="font-family:'Instrument Sans',sans-serif;font-size:10px;font-weight:700;color:#2d5040;margin:14px 0 5px;letter-spacing:0.06em;text-transform:uppercase;border-bottom:1px solid #ede6d6;padding-bottom:3px;">$1</h4><p ${PSTYLE}>`)
    .replace(/^## (.+)$/gm, `</p><h3 class="agent-section-header">$1</h3><p ${PSTYLE}>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:#1a1208;font-weight:700;">$1</strong>`)
    .replace(/^[•\-\*] (.+)$/gm, `</p><div style="display:flex;gap:8px;margin:4px 0;align-items:baseline;"><span style="color:#b85c38;font-size:10px;flex-shrink:0;margin-top:1px;">▸</span><span style="font-size:10.5px;line-height:1.65;color:${P_TEXT}">$1</span></div><p ${PSTYLE}>`)
    .replace(/\[Confidence:\s*High\]/gi, `<span class="badge-high">High Confidence</span>`)
    .replace(/\[Confidence:\s*Medium\]/gi, `<span class="badge-medium">Medium Confidence</span>`)
    .replace(/\[Confidence:\s*Low\]/gi, `<span class="badge-low">Low Confidence</span>`)
    .replace(/\n\n/g, `</p><p ${PSTYLE}>`)
    .replace(/\n/g, ' ')
    + close;
}

function md(text) {
  if (!text) return "";

  // ── CLEAN ARTIFACTS ──
  let t = text
    .replace(/^-{3,}\s*$/gm, '')
    .replace(/\|{3,}/g, ' ')
    .replace(/^#+\s*EXECUTIVE SYNOPSIS\s*\n/gm, '');

  // ── FIX SOURCES LINE ──
  t = t.replace(/\*\*Sources:\*\*([^\n]*(?:\n(?!\n)[^\n]*)*)/g, (_, s) => {
    return `**Sources:** ${s.replace(/\n/g, ', ').replace(/,\s*,/g, ',').trim()}`;
  });

  // ── CONVERT FENCED CODE BLOCKS TO ASSUMPTION BOXES ──
  t = t.replace(/```[\w]*\n([\s\S]*?)```/g, (_, content) => {
    return `<div class="assumption-box"><div class="assumption-label">Analysis Basis</div>${content.replace(/\n/g, '<br/>')}</div>`;
  });

  // ── DETECT SELLING STORY BLOCKS ──
  t = t.replace(/(?:SELLING STORY|THE SELLING STORY)[:\s—]*\n([\s\S]+?)(?=\n##|\n\*\*[A-Z]|$)/gi, (_, content) => {
    return `<div class="selling-story"><div class="selling-story-label">The Selling Story</div><div class="selling-story-text">${content.trim().replace(/\n/g,' ')}</div></div>`;
  });

  // ── DETECT 90-DAY SPRINT BLOCKS ──
  t = t.replace(/DAYS?\s+1[–\-]30[:\s]*([\s\S]+?)(?=DAYS?\s+3[1-9]|$)/gi, (_, c) =>
    `<div class="sprint-block"><div class="sprint-title">Days 1–30 — Diagnosis & Quick Wins</div>${renderBody(c.trim())}</div>`);
  t = t.replace(/DAYS?\s+3[1-9][–\-]60[:\s]*([\s\S]+?)(?=DAYS?\s+6[1-9]|$)/gi, (_, c) =>
    `<div class="sprint-block sprint-block-terra"><div class="sprint-title sprint-title-terra">Days 31–60 — Pilot Launches</div>${renderBody(c.trim())}</div>`);
  t = t.replace(/DAYS?\s+6[1-9][–\-]90[:\s]*([\s\S]+?)(?=\n##|$)/gi, (_, c) =>
    `<div class="sprint-block sprint-block-gold"><div class="sprint-title sprint-title-gold">Days 61–90 — Scale or Stop</div>${renderBody(c.trim())}</div>`);

  // ── SYNOPSIS SPECIAL LAYOUT ──
  const isSynopsis = t.includes('THE RECOMMENDATION') || t.includes('THE VERDICT') || (t.match(/◉/g) || []).length >= 3;

  if (isSynopsis) {
    let html = '';

    // Verdict / recommendation box
    const verdictRx = /(?:THE RECOMMENDATION|THE VERDICT)[:\s—]*\n([\s\S]+?)(?=\n◉|\n##|$)/i;
    const vm = t.match(verdictRx);
    if (vm) {
      const vText = vm[1].trim();
      const metrics = [];
      const iMatch = vText.match(/Investment[:\s]*(₹[\w\s\.]+Cr)/i);
      const rMatch = vText.match(/(?:FY28 Target|Revenue Target|Target)[:\s]*(₹[\w\s\+\.]+Cr)/i);
      const pMatch = vText.match(/Payback[:\s]*([\d\w\s]+months?)/i);
      if (iMatch) metrics.push({ value: iMatch[1], label: 'Investment' });
      if (rMatch) metrics.push({ value: rMatch[1], label: 'FY28 Target' });
      if (pMatch) metrics.push({ value: pMatch[1], label: 'Payback' });
      const cleanV = vText
        .replace(/Investment[:\s]*₹[\w\s\.]+Cr[,.]?/gi, '')
        .replace(/(?:FY28 Target|Revenue Target|Target)[:\s]*₹[\w\s\+\.]+Cr[,.]?/gi, '')
        .replace(/Payback[:\s]*[\d\w\s]+months?[,.]?/gi, '')
        .replace(/\n\n/g, ' ').replace(/\n/g, ' ').trim();
      html += `<div class="verdict-box">
        <div class="verdict-label">The Recommendation</div>
        <p class="verdict-text">${cleanV.replace(/\*\*(.+?)\*\*/g,'<strong style="color:#ede6d6">$1</strong>')}</p>
        ${metrics.length ? `<div class="verdict-metrics">${metrics.map(m =>
          `<div class="verdict-metric"><span class="verdict-metric-value">${m.value}</span><span class="verdict-metric-label">${m.label}</span></div>`
        ).join('')}</div>` : ''}
      </div>`;
    }

    // Extract ◉ insight sections
    const sections = [];
    const secRx = /◉\s+([^\n]+)\n([\s\S]+?)(?=\n◉|\n##|$)/g;
    let m;
    while ((m = secRx.exec(t)) !== null) {
      sections.push({ title: m[1].trim(), content: m[2].trim().replace(/\n\n/g,' ').replace(/\n/g,' ').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>') });
    }

    // 2-col grid for first 4 insights, full-width after
    if (sections.length >= 2) {
      const gridCount = Math.min(sections.length, 4);
      html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0">`;
      for (let i = 0; i < gridCount; i++) {
        const alt = i % 2 === 1;
        html += `<div class="insight-card${alt ? ' insight-card-terra' : ''}">
          <div class="insight-card-title${alt ? ' insight-card-title-terra' : ''}">◉ ${sections[i].title}</div>
          <p style="font-size:9px;line-height:1.55;margin:0;color:#3d3020">${sections[i].content}</p>
        </div>`;
      }
      html += `</div>`;
      for (let i = gridCount; i < sections.length; i++) {
        html += `<div class="insight-card" style="margin:8px 0">
          <div class="insight-card-title">◉ ${sections[i].title}</div>
          <p style="font-size:10px;line-height:1.6;margin:0;color:#3d3020">${sections[i].content}</p>
        </div>`;
      }
    }

    // Render any remaining prose (non-◉) content
    const stripped = t
      .replace(verdictRx, '')
      .replace(/◉\s+[^\n]+\n[\s\S]+?(?=\n◉|\n##|$)/g, '');
    if (stripped.trim()) html += renderBody(stripped);
    return html;
  }

  return renderBody(t);
}

export default function AdvisorSprint() {
  const [company, setCompany] = useState("Yogabar");
  const [context, setContext] = useState(`Post-acquisition growth strategy for Yogabar. ITC acquired stake in 2023, progressively increasing ownership.

Core challenge: How does ITC's institutional strength (4M+ outlets, manufacturing scale, brand-building expertise) accelerate Yogabar's digital-first growth (60%+ YoY) without diluting premium positioning?

Known competitors (seeds for research — Agent 1 will discover the full current competitor set): Whole Truth, Super You, True Elements, Rite Bite, Kellogg's
Current model: 70% E-comm, 30% Modern Trade

Focus areas:
1. Portfolio optimization (which SKUs to scale/kill) and selling story for future portfolio
2. Brand spine that unifies the portfolio narrative
3. Margin improvement (COGS, channel mix)
4. Distribution synergy (ITC's GT reach vs Yogabar's premium positioning)
5. Growth acceleration (sustain 60%+ while improving margins)`);

  const [appState, setAppState] = useState("idle");
  const [results, setResults] = useState({});
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

  const callClaude = useCallback(async (prompt, docs, signal, attempt = 0) => {
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 1500));
      
      const agentId = AGENTS.find(a => 
        (a.id === "market" && prompt.includes("MARKET POSITION")) ||
        (a.id === "portfolio" && prompt.includes("PORTFOLIO")) ||
        (a.id === "brand" && prompt.includes("BRAND POSITIONING")) ||
        (a.id === "margins" && prompt.includes("MARGIN IMPROVEMENT")) ||
        (a.id === "growth" && prompt.includes("GROWTH STRATEGY")) ||
        (a.id === "competitive" && prompt.includes("COMPETITIVE BATTLE")) ||
        (a.id === "synergy" && prompt.includes("SYNERGY PLAYBOOK")) ||
        (a.id === "platform" && prompt.includes("BRAND INCUBATOR")) ||
        (a.id === "intl" && prompt.includes("INTERNATIONAL BENCHMARKS")) ||
        (a.id === "synopsis" && prompt.includes("EXECUTIVE SYNOPSIS"))
      )?.id || "market";
      
      return MOCK[agentId] || MOCK.market;
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tool-name": "advisor",
      },
      signal,
      body: JSON.stringify({
        prompt,
        pdfs: docs.map(p => ({ name: p.name, b64: p.b64 })),
        agentId: AGENTS.find(a => prompt.includes(a.label))?.id || "market",
      }),
    });

    if (res.status === 429 && attempt < 4) {
      await new Promise(r => setTimeout(r, (attempt + 1) * 5000));
      return callClaude(prompt, docs, signal, attempt + 1);
    }

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(err || `Server error: ${res.status}`);
    }

    const data = await res.json();
    return data.text || "";
  }, []); // callClaude has no dependencies - uses only parameters and constants

  const runAgent = useCallback(async (id, prompt, signal, docs) => {
    try {
      const text = await callClaude(prompt, docs || [], signal);
      if (!signal.aborted) {
        setResults(r => ({ ...r, [id]: text }));
        setStatuses(s => ({ ...s, [id]: "done" }));
        gaEvent("agent_completed", { agent: id, company, chars: text.length });
      }
      return text;
    } catch (e) {
      if (e.name !== "AbortError") {
        setStatuses(s => ({ ...s, [id]: "error" }));
        setResults(r => ({ ...r, [id]: `Error: ${e.message}` }));
      }
      return "";
    }
  }, [company, callClaude]);

  const runSprint = async () => {
    if (!company.trim() || appState === "running") return;

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const signal = ctrl.signal;
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    
    setAppState("preparing");
    setResults({});
    setElapsed(0);

    const co = company.trim();
    const ctx = context.trim();
    
    gaEvent("sprint_launched", {
      company: co,
      user: "anonymous",
      pdfs_uploaded: 0,
      has_context: ctx.length > 0,
    });

    const initStatus = {};
    AGENTS.forEach(a => initStatus[a.id] = "queued");
    setStatuses(initStatus);

    try {
      setAppState("running");
      
      // Wave 1: Agents 1-6 (parallel)
      const w1texts = {};
      for (const id of W1) {
        if (signal.aborted) return;
        setStatuses(s => ({ ...s, [id]: "running" }));
        const prompt = makePrompt(id, co, ctx, {});
        const text = await runAgent(id, prompt, signal, []);
        w1texts[id] = text;
      }

      // Wave 2: Synergy, Platform, International (parallel — all need wave 1 context)
      if (!signal.aborted) {
        const w2ids = AGENTS.filter(a => a.wave === 2).map(a => a.id);
        w2ids.forEach(id => setStatuses(s => ({ ...s, [id]: "running" })));
        const w2promises = w2ids.map(id => {
          const prompt = makePrompt(id, co, ctx, w1texts);
          return runAgent(id, prompt, signal, []).then(text => ({ id, text }));
        });
        const w2results = await Promise.all(w2promises);
        w2results.forEach(({ id, text }) => { w1texts[id] = text; });
      }

      // Wave 3: Synopsis (receives all agent outputs)
      if (!signal.aborted) {
        setStatuses(s => ({ ...s, synopsis: "running" }));
        const prompt = makePrompt("synopsis", co, ctx, w1texts);
        await runAgent("synopsis", prompt, signal, []);
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
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontFamily: "'Instrument Sans'", fontSize: 11, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: P.inkMid, marginBottom: 8 }}>
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={appState === "running"}
                style={{ width: "100%", padding: "10px 14px", border: `2px solid ${P.sand}`, borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 15, background: P.white }}
              />
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
                style={{ padding: "12px 24px", background: appState === "running" ? P.inkFaint : P.forest, color: P.white, border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 14, fontWeight: 600, cursor: appState === "running" ? "not-allowed" : "pointer" }}
              >
                {appState === "running" ? `Running... ${formatTime(elapsed)}` : "Run Analysis"}
              </button>

              {appState === "running" && (
                <button onClick={cancel} style={{ padding: "12px 24px", background: P.terra, color: P.white, border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
              )}

              {appState === "done" && (
                <button onClick={downloadPDF} style={{ padding: "12px 24px", background: P.gold, color: P.ink, border: "none", borderRadius: 4, fontFamily: "'Instrument Sans'", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Download PDF
                </button>
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
      }
      
      table th {
        background: #ede6d6 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `}</style>

  {/* PAGE 1: COVER — PREMIUM */}
  <div style={{ pageBreakAfter: "always", minHeight: "297mm", background: P.forest, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
    {/* Top accent bar */}
    <div style={{ height: 6, background: P.gold, flexShrink: 0 }}></div>

    {/* Center content */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 70px", textAlign: "center" }}>
      {/* Eyebrow */}
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: P.gold, marginBottom: 28 }}>
        Post-Acquisition Strategic Intelligence
      </div>

      {/* Company name */}
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 64, fontWeight: 900, color: P.white, margin: "0 0 10px", letterSpacing: "-0.01em", lineHeight: 1 }}>
        {company}
      </h1>

      {/* Ornamental rule */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0 28px" }}>
        <div style={{ width: 60, height: 1, background: `rgba(200,146,42,0.5)` }}></div>
        <div style={{ width: 6, height: 6, background: P.gold, borderRadius: "50%" }}></div>
        <div style={{ width: 60, height: 1, background: `rgba(200,146,42,0.5)` }}></div>
      </div>

      {/* Subtitle */}
      <p style={{ fontSize: 15, color: "rgba(245,240,232,0.75)", fontWeight: 400, margin: "0 0 50px", letterSpacing: "0.03em" }}>
        10-Agent Intelligence Analysis · Growth Strategy 2026–2028
      </p>

      {/* Info box */}
      <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, padding: "22px 32px", maxWidth: 460, width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, textAlign: "center" }}>
          {[
            { val: "10", label: "Intelligence Agents" },
            { val: "10", label: "Research Dimensions" },
            { val: "2026–28", label: "Strategic Horizon" },
          ].map((item, i) => (
            <div key={i} style={{ padding: "8px 0", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: P.gold }}>{item.val}</div>
              <div style={{ fontSize: 8, color: "rgba(245,240,232,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Footer strip */}
    <div style={{ padding: "18px 70px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 8, color: "rgba(245,240,232,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Advisor Sprint · Strategic Intelligence System
      </div>
      <div style={{ fontSize: 8, color: "rgba(245,240,232,0.45)", letterSpacing: "0.06em" }}>
        Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · {formatTime(elapsed)}
      </div>
    </div>
  </div>

  {/* PAGE 2: ASSUMPTIONS & SOURCES */}
  <div style={{ pageBreakAfter: "always" }}>
    <div style={{ background: P.forest, padding: "14px 50px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(245,240,232,0.9)", letterSpacing: "0.04em" }}>DATA FOUNDATION & ASSUMPTIONS</span>
      <span style={{ fontSize: 9, color: "rgba(245,240,232,0.4)" }}>{company} · 2026</span>
    </div>
    <div style={{ height: 3, background: P.terra }}></div>
    <div style={{ padding: "32px 50px 40px" }}>
    <div className="section-header">
      <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: P.forest, margin: 0 }}>
        Assumptions & Sources
      </h2>
      <p style={{ fontSize: 11, color: P.inkSoft, marginTop: 8, fontStyle: "italic" }}>
        Data foundation and analytical framework
      </p>
    </div>
    
    <div style={{ marginBottom: 25 }}>
      <p style={{ fontSize: 11, color: P.inkMid, lineHeight: 1.7 }}>
        This analysis is based on web search, publicly available data, and industry reports. All 10 agents discover current performance through independent search and synthesis.
      </p>
    </div>
    
    <div style={{ background: P.parchment, padding: 20, borderRadius: 4, marginBottom: 25 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: P.forest, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Key Contextual Assumptions
      </h3>
      <ul style={{ fontSize: 10, lineHeight: 1.8, color: P.inkMid, marginLeft: 20 }}>
        <li>ITC acquired {company} in 2023 (3 years post-acquisition analysis)</li>
        <li>Selective Modern Trade distribution support provided (field team bandwidth limited)</li>
        <li>Manufacturing remains with co-packers (no ITC plant move assumed)</li>
        <li>Operating as separate unit with institutional support</li>
        <li>Growth trajectory and current performance discovered through web search</li>
      </ul>
    </div>
    
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, marginTop: 20 }}>
      <thead>
        <tr>
          <th style={{ padding: 10, textAlign: "left", border: `1px solid ${P.sand}`, background: P.parchment, fontWeight: 600 }}>
            Source Category
          </th>
          <th style={{ padding: 10, textAlign: "left", border: `1px solid ${P.sand}`, background: P.parchment, fontWeight: 600 }}>
            Primary Usage
          </th>
          <th style={{ padding: 10, textAlign: "left", border: `1px solid ${P.sand}`, background: P.parchment, fontWeight: 600 }}>
            Relevant Agents
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>Web search (2024-2026)</td>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>Current market data, competitor analysis, category trends</td>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>All agents</td>
        </tr>
        <tr>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>Industry reports</td>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>NIQ, Euromonitor, Redseer, Technopak (where publicly cited)</td>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>Market, Portfolio, Growth</td>
        </tr>
        <tr>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>E-commerce data</td>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>Amazon rankings, customer reviews, pricing analysis</td>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>Brand, Portfolio, Competitive</td>
        </tr>
        <tr>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>Company data</td>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>Publicly disclosed financials, announcements, filings</td>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>Market, Margins, Synergy</td>
        </tr>
        <tr>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>Estimates & logic</td>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>Where data unavailable, clearly marked with reasoning</td>
          <td style={{ padding: 10, border: `1px solid ${P.sand}` }}>All agents (as needed)</td>
        </tr>
      </tbody>
    </table>
    
    <div style={{ marginTop: 30, padding: 18, background: P.terracream, borderLeft: `5px solid ${P.terra}`, borderRadius: 4 }}>
      <p style={{ fontSize: 10, color: P.inkMid, lineHeight: 1.6, margin: 0 }}>
        <strong style={{ color: P.terra }}>Confidence Levels:</strong> Each agent explicitly states confidence (High/Medium/Low) for major claims. Where data is unavailable, estimates are clearly marked with logical reasoning provided. No assumptions presented as facts.
      </p>
    </div>
    </div>
  </div>

  {/* PAGE 3: TABLE OF CONTENTS */}
  <div style={{ pageBreakAfter: "always" }}>
    <div style={{ background: P.forest, padding: "14px 50px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(245,240,232,0.9)", letterSpacing: "0.04em" }}>TABLE OF CONTENTS</span>
      <span style={{ fontSize: 9, color: "rgba(245,240,232,0.4)" }}>{company} · 2026</span>
    </div>
    <div style={{ height: 3, background: P.gold }}></div>
    <div style={{ padding: "32px 50px 40px" }}>
    <div className="section-header">
      <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: P.forest, margin: 0 }}>
        Table of Contents
      </h2>
    </div>
    
    <div style={{ fontSize: 12, lineHeight: 2.4, marginTop: 35 }}>
      <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: `2px solid ${P.sand}`, marginBottom: 15 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: P.forest }}>Executive Synopsis</span>
        <span style={{ fontWeight: 700, color: P.terra }}>4-5</span>
      </div>
      
      <div style={{ marginTop: 25, marginBottom: 15, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: P.forestSoft }}>
        DETAILED INTELLIGENCE ANALYSIS
      </div>
      
      {[
        { num: 1, id: "agent-market",      icon: "◈", title: "Market Position & Category Dynamics",       page: 6 },
        { num: 2, id: "agent-portfolio",   icon: "◉", title: "Portfolio Strategy & SKU Rationalization",  page: 7 },
        { num: 3, id: "agent-brand",       icon: "◎", title: "Brand Positioning & Storytelling",          page: 8 },
        { num: 4, id: "agent-margins",     icon: "◐", title: "Margin Improvement & Unit Economics",       page: 9 },
        { num: 5, id: "agent-growth",      icon: "◆", title: "Growth Strategy & Channel Orchestration",   page: 10 },
        { num: 6, id: "agent-competitive", icon: "◇", title: "Competitive Battle Plan",                   page: 11 },
        { num: 7, id: "agent-synergy",     icon: "◈", title: "Synergy Playbook & Institutional Leverage", page: 12 },
        { num: 8, id: "agent-platform",    icon: "◉", title: "Platform Expansion & D2C Brand Incubator", page: "13–14" },
        { num: 9, id: "agent-intl",        icon: "◎", title: "International Benchmarks & Global Playbook", page: "15–16" }
      ].map((item, idx) => (
        <a key={idx} href={`#${item.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, paddingTop: 10, borderBottom: `1px solid ${P.parchment}`, textDecoration: "none", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 16, color: P.terraSoft, width: 20 }}>{item.icon}</span>
            <span style={{ color: P.inkMid }}>
              <span style={{ fontSize: 9, color: P.inkFaint, fontWeight: 600, marginRight: 8 }}>AGENT {item.num}</span>
              <span style={{ fontSize: 12, color: P.inkMid, fontWeight: 500, textDecoration: "underline", textDecorationColor: P.sand, textUnderlineOffset: 3 }}>{item.title}</span>
            </span>
          </div>
          <span style={{ color: P.terra, fontSize: 11, fontWeight: 600 }}>{item.page} →</span>
        </a>
      ))}
    </div>
    
    <div style={{ marginTop: 50, padding: 22, background: P.parchment, borderRadius: 6, textAlign: "center" }}>
      <p style={{ fontSize: 10, color: P.inkSoft, lineHeight: 1.7, margin: 0 }}>
        This report synthesizes insights from 10 intelligence agents across market, portfolio, brand, margins, growth, competitive, synergy, platform expansion, and international benchmarks. Read the Executive Synopsis (pages 4–5) for a standalone decision brief, or click any section above to navigate directly.
      </p>
    </div>
    </div>
  </div>

  {/* PAGES 4-5: EXECUTIVE SYNOPSIS — PREMIUM */}
  {results.synopsis && (
    <div id="agent-synopsis" style={{ pageBreakBefore: "always" }}>
      {/* Synopsis header */}
      <div style={{ background: P.ink, padding: "14px 50px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, color: P.gold }}>◉</span>
          <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(245,240,232,0.9)", letterSpacing: "0.04em" }}>
            EXECUTIVE SYNOPSIS · STANDALONE DECISION BRIEF
          </span>
        </div>
        <span style={{ fontSize: 9, color: "rgba(245,240,232,0.4)", fontFamily: "'Instrument Sans'" }}>
          {company} · 2026
        </span>
      </div>
      <div style={{ height: 3, background: P.gold }}></div>

      {/* Synopsis body */}
      <div style={{ padding: "32px 50px 40px" }}>
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${P.ink}` }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: P.terra, marginBottom: 6 }}>
            Wave 3 · Strategic Synthesis
          </div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 700, color: P.forest, margin: "0 0 5px" }}>
            Executive Synopsis
          </h2>
          <p style={{ fontSize: 11, color: P.inkSoft, fontStyle: "italic", margin: 0 }}>
            Synthesis of all 10 agents — read this page to make the investment decision
          </p>
        </div>

        <div
          className="agent-content"
          style={{ fontSize: 10.5, lineHeight: 1.75, color: P.inkMid }}
          dangerouslySetInnerHTML={{ __html: md(results.synopsis) }}
        />
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 50px", borderTop: `1px solid ${P.sand}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 8, color: P.inkFaint, letterSpacing: "0.08em" }}>
          {company.toUpperCase()} · STRATEGIC INTELLIGENCE REPORT · 2026
        </span>
        <span style={{ fontSize: 8, color: P.inkFaint }}>ADVISOR SPRINT</span>
      </div>

      <div style={{ pageBreakAfter: "always", height: 1 }}></div>
    </div>
  )}

  {/* PAGES 6+: INDIVIDUAL AGENTS — PREMIUM LAYOUT */}
  {AGENTS.filter(a => a.id !== 'synopsis').map((agent, index) => {
    const result = results[agent.id];
    if (!result) return null;
    const isLastAgent = index === AGENTS.filter(a => a.id !== 'synopsis').length - 1;
    const waveColor = agent.wave === 1 ? P.forest : agent.wave === 2 ? P.terra : P.gold;
    const waveLabel = agent.wave === 1 ? 'Wave 1 · Foundation' : agent.wave === 2 ? 'Wave 2 · Synthesis' : 'Wave 3 · Strategy';
    const agentNum = agent.id === 'platform' ? 9 : index + 1;

    return (
      <div key={agent.id} id={`agent-${agent.id}`} style={{ pageBreakBefore: "always", pageBreakAfter: isLastAgent ? "auto" : "always", paddingBottom: 50 }}>

        {/* Running page header */}
        <div style={{ background: P.forest, padding: "14px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 16, color: waveColor === P.forest ? P.gold : waveColor }}>{agent.icon}</span>
            <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(245,240,232,0.9)", letterSpacing: "0.04em" }}>
              {agent.label.toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
              padding: "3px 10px", borderRadius: 2,
              background: agent.wave === 1 ? 'rgba(200,146,42,0.2)' : agent.wave === 2 ? P.terra : P.gold,
              color: agent.wave === 1 ? P.gold : P.white
            }}>
              {waveLabel}
            </span>
            <span style={{ fontSize: 9, color: "rgba(245,240,232,0.45)", fontFamily: "'Instrument Sans'" }}>
              {company} · 2026
            </span>
          </div>
        </div>

        {/* Gold accent line */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${waveColor === P.forest ? P.gold : waveColor} 0%, transparent 100%)` }}></div>

        {/* Page body */}
        <div style={{ padding: "32px 50px 40px" }}>
          {/* Agent title block */}
          <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${P.forest}` }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: waveColor === P.forest ? P.terra : waveColor, marginBottom: 6 }}>
              Agent {agentNum} · {waveLabel}
            </div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 700, color: P.forest, margin: "0 0 5px", lineHeight: 1.2 }}>
              {agent.label}
            </h2>
            <p style={{ fontSize: 11, color: P.inkSoft, fontStyle: "italic", margin: 0 }}>
              {agent.sub}
            </p>
          </div>

          {/* Agent content */}
          <div
            className="agent-content"
            data-wave={agent.wave}
            style={{ fontSize: 10.5, lineHeight: 1.75, color: P.inkMid }}
            dangerouslySetInnerHTML={{ __html: md(result) }}
          />
        </div>

        {/* Page footer */}
        <div style={{ padding: "10px 50px", borderTop: `1px solid ${P.sand}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 8, color: P.inkFaint, letterSpacing: "0.08em" }}>
            {company.toUpperCase()} · STRATEGIC INTELLIGENCE REPORT · 2026
          </span>
          <span style={{ fontSize: 8, color: P.inkFaint }}>
            ADVISOR SPRINT
          </span>
        </div>
      </div>
    );
  })}
</div>
    </div>
  );
}
