import { useState, useEffect, useRef, useCallback } from "react";
// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — SET THESE BEFORE DEPLOYING
// ─────────────────────────────────────────────────────────────────────────────

// Your Anthropic API key — get one at console.anthropic.com
// IMPORTANT: This key will be visible in your browser source code.
// Only share the deployed URL with people you trust.
// API calls go through Vercel proxy — no client-side key needed

// Your GA4 Measurement ID — get one at analytics.google.com (optional)
const GA4_ID = "G-9TQPPTHT19";

// MOCK MODE: true = instant fake output, zero API cost (for UI testing)
//            false = real Claude API calls (needs credits)
const MOCK_MODE = true;

// ─────────────────────────────────────────────────────────────────────────────

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
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f0e8; font-family: 'Work Sans', sans-serif; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #b8a898; border-radius: 3px; }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.2; } }
  @keyframes shimmer { 0% { left:-60%; } 100% { left:110%; } }

  @media print {
    body { background: #fff !important; }
    .no-print { display: none !important; }
    .print-section { break-inside: avoid; page-break-inside: avoid; margin-bottom: 24px; }
    .print-header { display: block !important; }
    * { animation: none !important; box-shadow: none !important; }
    /* Each agent card gets its own page area */
    [data-agent] { break-inside: avoid; border: 1px solid #ccc !important; margin-bottom: 20px; }
    /* Remove scroll clipping so full content prints */
    .agent-content { max-height: none !important; overflow: visible !important; height: auto !important; }
  }
`;

const P = {
  cream:"#f5f0e8", parchment:"#ede6d6", sand:"#d4c4a8",
  forest:"#1a3325", forestMid:"#2d5040", forestSoft:"#3d6b54",
  terra:"#b85c38", terraSoft:"#d4724a", terracream:"#f0d4c0",
  ink:"#1a1208", inkMid:"#3d3020", inkSoft:"#6b5c48", inkFaint:"#9b8c78",
  gold:"#c8922a", white:"#faf8f4",
};
const AGENTS = [
  { id:"signals",     wave:1, icon:"◈", label:"Market Signals",     sub:"Market size, share & dark data patterns"    },
  { id:"competitive", wave:1, icon:"◉", label:"Competitive Scan",   sub:"National + regional positioning & data"     },
  { id:"channels",    wave:1, icon:"◎", label:"Channel Audit",      sub:"Home market channels & reallocation"        },
  { id:"segments",    wave:1, icon:"◐", label:"Segment Whitespace", sub:"Underserved segments in home market"        },
  { id:"pivot",       wave:2, icon:"◆", label:"GTM Pivot Strategy", sub:"Synthesis of all 4 above"                   },
  { id:"kpis",        wave:2, icon:"◇", label:"Operating Cadence",  sub:"KPIs to track post-pivot"                   },
  { id:"narrative",   wave:2, icon:"◈", label:"Board Narrative",    sub:"Exec-ready strategic brief"                 },
];

const W1 = AGENTS.filter(a => a.wave === 1).map(a => a.id);
const W2 = AGENTS.filter(a => a.wave === 2).map(a => a.id);

const KNOWN_INDIAN_BRANDS = [
  "bingo","mamaearth","dabur","parle","itc","britannia","haldirams","haldiram",
  "patanjali","boat","noise","wakefit","sleepy owl","rage coffee","the moms co",
  "mcaffeine","plum","dot & key","wow skin","sugar cosmetics","nykaa","myglamm",
  "good glamm","paperboat","paper boat","raw pressery","id fresh","veeba",
  "licious","zappfresh","epigamia","sleepycat","bombay shaving","beardo",
  "pilgrim","minimalist india","skinkraft","ustraa","man matters",
];

function detectCountry(company) {
  const cl = (company || "").toLowerCase();
  if (KNOWN_INDIAN_BRANDS.some(b => cl.includes(b))) return "india";
  return "unknown";
}

function getReportRefs(country) {
  if (country === "india") return `
INDIA REFERENCE REPORTS — draw on data from these where known:
- DSGCP & Bain "India Consumer Staples & D2C Report"
- Redseer "India D2C & Quick Commerce Report"
- Nielsen IQ India FMCG tracker
- FICCI-Technopak "India Retail Report"
- BCG-CII "India Consumer Sentiment Survey"
- Kantar BrandZ India | IBEF FMCG sector report`;
  if (country === "usa") return `
US REFERENCE REPORTS: NielsenIQ US CPG Outlook | Circana IRI | McKinsey Consumer Pulse | Kantar BrandZ USA`;
  return `REFERENCE: Euromonitor Passport | Mintel GNPD | Kantar BrandZ Global | McKinsey Consumer Insights`;
}
const SHARPNESS_RULES = `
OUTPUT DISCIPLINE — NON-NEGOTIABLE:
- Every claim must be a pointed assertion, not a hedged observation. Say "X is happening" not "X may be occurring."
- No filler phrases: never use "it's worth noting", "one could argue", "it may be beneficial", "consider exploring."
- Every insight must follow: WHAT IS TRUE → SO WHAT (strategic implication) → WHAT TO DO (specific action).
- Numbers beat adjectives. "Market grew 18% YoY" beats "market is growing rapidly."
- If you don't have a precise number, give a range with a source. Never say "significant" or "substantial" without a figure.
- Each section should feel like a slide in a McKinsey deck — one sharp point per section, ruthlessly edited.
- Max 3 sentences per insight. If you need more, your insight isn't sharp enough.
`;

const COUNTRY_INSTRUCTION = `
MARKET SCOPE — CRITICAL:
Identify this brand's home country from its known origin (e.g. Bingo = India, Oatly = Sweden, Burt's Bees = USA).
ALL analysis must be from that country's market only. No cross-country mixing.
State the country in your first line.
DATA: Prioritise any uploaded PDF documents first (cite by filename). For uncovered data, use training knowledge (cutoff mid-2025) and cite source + year for every figure.
`;

const makePrompt = (id, company, ctx, synthCtx) => {
  const c       = ctx || "CPG brand seeking growth";
  const sc      = synthCtx ? `\n\nPRIOR ANALYSIS FINDINGS:\n${synthCtx}\n` : "";
  const country = detectCountry(company);
  const reports = getReportRefs(country);

  const map = {
    signals:
`You are a senior CPG strategy advisor running a rapid intelligence sprint.
Company: "${company}". Context: "${c}".
${COUNTRY_INSTRUCTION}
${reports}
${SHARPNESS_RULES}

## HOME MARKET
[Country] · [Category] · [Stage of brand e.g. D2C scaling, traditional FMCG, challenger]

## MARKET SIZE & SHARE
State each as a single punchy line:
- Category TAM: [₹/$ figure, year, source]
- Growth rate: [CAGR % or YoY %]
- ${company} position: [share % or rank + basis]
- #1 player: [name, share %] | #2: [name, share %] | #3: [name, share %]
- Key sub-segment (if relevant): [size + why it matters]

## DISTRIBUTION HEALTH
Critical benchmarks for ${company}:
- **Numeric Distribution**: % of relevant outlets stocking ≥1 ${company} SKU. Compare against category leader.
- **Weighted Distribution**: % of category sales value in stores that stock ${company}. Quality over quantity.
- If data unavailable, estimate based on outlet count and compare to #1 player's known distribution.
Format: Numeric Distribution: [X%] (Target >[Y%]) · Weighted Distribution: [A%] (Target >[B%])
Active selling outlets vs stocked outlets gap = silent revenue leak.

## DARK DATA PATTERNS
3 non-obvious signals the data reveals but conventional wisdom misses.
Format each as:
**[Pattern Name]** — [One sentence: what the data shows.] [One sentence: why most brands miss it.] → GTM implication: [One specific action this unlocks.]

## MARKET TAILWINDS
2 macro forces actively working in ${company}'s favour RIGHT NOW.
Format: **[Tailwind]** — [Specific evidence in this market] → How to exploit it: [One concrete move]

## HIDDEN FRICTION POINTS
2 structural barriers specific to this market that founders consistently underestimate.
Format: **[Friction]** — [Why it's harder than it looks] → The only way through: [Specific approach]

## INTELLIGENCE VERDICT
One paragraph, 3 sentences max. The single most important thing the market data is telling this brand. Written for a founder who has 30 seconds. Start with the most important word.`,

    competitive:
`You are a CPG competitive intelligence analyst.
Company: "${company}". Context: "${c}".
${COUNTRY_INSTRUCTION}
${reports}
${SHARPNESS_RULES}

Your ONLY job: map the competitive landscape. No segment analysis — separate agent handles that.

## HOME MARKET CONFIRMED
[Country] — all data below is this market only.

## NATIONAL COMPETITIVE MAP
Axes: choose the 2 that most determine purchase decisions in this category (NOT generic price/quality).
Format as a clear 2x2. Each competitor entry: [Brand] — [one-line positioning rationale] — [one hard data point: share %, revenue, outlet count, or SKU count]

## REGIONAL COMPETITIVE DYNAMICS
Which players dominate which regions and WHY. Name specific regions, name the brands, state the mechanism (e.g. "Haldiram's owns North India through 40-year kirana relationships, not price"). Include share or distribution figures where available.

## COMPETITOR COMPARISON TABLE
| Brand | Revenue/Size | Mkt Share | Retail Reach | Distribution | Achilles Heel |
Format each row with actual figures or best estimates. Label estimates as "(est.)".

## COMPETITIVE DISTRIBUTION GAP
Compare ${company}'s distribution health to category leader:
- Numeric distribution gap: [Leader X%] vs [${company} Y%] = [Z] point gap
- Weighted distribution gap: [Leader A%] vs [${company} B%] = [C] point difference
This gap represents structural disadvantage or opportunity depending on efficiency.

## COMPETITIVE VULNERABILITIES
2 specific, exploitable weaknesses — one each from the top 2 competitors.
Format: **[Competitor]** — [The specific weakness — be precise, not generic] → The opening this creates for ${company}: [Exact GTM move]

## POSITIONING VERDICT
One sentence. The most defensible, least contested position ${company} can claim. Make it specific enough to reject — "premium natural snacks" is too vague. "The only snack brand built for post-gym recovery in metro India" is a verdict.`,

    channels:
`You are a CPG GTM and distribution strategist.
Company: "${company}". Context: "${c}".
${COUNTRY_INSTRUCTION}
${reports}
${SHARPNESS_RULES}

## HOME MARKET CONFIRMED
[Country] — channel analysis uses this market's retail and media landscape only.

## CHANNEL MIX BENCHMARK
The 6 channels that matter most for this category in this country.
| Channel | Typical Spend % | Effectiveness | Trend | Brand doing it best here |
Be specific: "Modern Trade" not "retail", "Meta Reels + influencer seeding" not "social media".

## OVER-INDEXED CHANNELS
2 channels where this brand is almost certainly spending more than the return justifies.
Format: **[Channel]** — [Why the ROI has degraded: specific mechanism] — [What the wasted spend looks like in ₹/$ terms] → Redirect to: [specific alternative]

## UNDER-INDEXED CHANNELS
2 channels with the highest untapped ROI for this brand specifically.
Format: **[Channel]** — [Why this is underexploited: category proof point] — [What good looks like: specific brand example in this market] → Entry move: [First 30-day action]

## CHANNEL REALLOCATION
One specific, numerical recommendation:
"Reduce [channel] spend from ~X% to ~Y% of budget → Reallocate to [channel] at Z%.
Expected outcome: [metric] improves from [baseline] to [target] within [timeframe]."

## CHANNEL AUDIT VERDICT
The one channel move that would have the highest impact in the next 90 days. One sentence. No hedging.`,

    segments:
`You are a CPG customer strategy advisor.
Company: "${company}". Context: "${c}".
${COUNTRY_INSTRUCTION}
${reports}
${SHARPNESS_RULES}

## HOME MARKET CONFIRMED
[Country] — all consumer data from this market only.

## CURRENT DOMINANT SEGMENT
Who this brand is over-indexed on — stated as a precise profile, not a vague archetype.
- Demographics: [age range, gender split, income bracket, geographies]
- Psychographics: [2-3 specific values, what they watch/read, why they chose this brand]
- The ceiling: [Specific reason this segment cannot sustain growth — market size limit, CAC inflation, saturation signal]

## WHITESPACE SEGMENTS
3 underserved segments. For each, follow this exact format:

**[Segment Name]**
Who: [Tight demographic + psychographic — 2 sentences]
Size signal: [Proxy metric with source — search volume, adjacent category size, demographic count]
Why unserved: [The specific reason no brand has cracked this — not "lack of awareness", something structural]
GTM hook: [The one message or product tweak that unlocks them — specific enough to write an ad for]
Acquisition channel: [The specific channel in this market where they're reachable]

## HIGHEST-VALUE PIVOT SEGMENT
State a clear choice and defend it in 3 sentences:
1. [Why this segment over the other two — size + accessibility + strategic fit]
2. [The first 90-day acquisition motion — specific enough to execute]
3. [The metric that confirms it's working — with a threshold number]

## SEGMENT VERDICT
One paragraph. The segment bet that most changes ${company}'s growth trajectory in this market. Written like advice to a founder, not a consulting report.`,

    pivot:
`You are Harsha Belavady, senior CPG strategy advisor. Full intelligence sprint completed on "${company}".
${sc}
${SHARPNESS_RULES}

You have read the market signals, competitive landscape, channel audit, and segment analysis. Now synthesise them into one coherent strategic pivot. Be an advisor, not a summariser — challenge comfortable assumptions, make hard calls.

## THE PIVOT THESIS
One sentence. Specific enough that a competitor could read it and know exactly what you're doing. Start with "${company} must..."

## WHAT TO STOP
2 things. Format: **[Activity]** — [Why stopping this now is the right call — one honest sentence]

## WHAT TO START
3 new GTM motions. Format:
**[Motion]** — [Why now, not later: the specific window of opportunity] → Target metric: [What success looks like in 90 days]

## WHAT TO ACCELERATE
1 thing already working. Format: **[Activity]** — [Why doubling down beats starting something new] → Double from [X] to [Y] by [date]

## 90-DAY ROADMAP
Month 1 — Foundation: [3 specific actions, each ownable by one person]
Month 2 — Activation: [3 specific actions, each with a measurable output]
Month 3 — Proof: [3 specific actions + the 2 metrics that determine if the pivot is working]

## PIVOT RISK
**The real risk** (not generic execution risk): [One specific thing that could make this pivot fail] → Mitigation: [One specific action to reduce it]

## STRATEGIC CONVICTION
3 sentences directly to the founder. Sentence 1: the hardest truth from this analysis. Sentence 2: what this pivot requires them to let go of. Sentence 3: why the timing is right now.`,

    kpis:
`You are a CPG strategy advisor designing the measurement system for ${company}'s GTM pivot.
${sc}
${SHARPNESS_RULES}

## NORTH STAR METRIC
[Metric name] — [Definition in one sentence] — [Why this one, not revenue or orders: the strategic logic] — Target: [Specific number within 6 months]

## WEEKLY PULSE (5 metrics)
Monday 9AM review, 20 minutes, founder + channel leads.
| Metric | Definition | Healthy Range | Red Flag Threshold | Response if Red |
Make these leading indicators, not lagging. Revenue is a lagging indicator. CAC by channel is leading.

## MONTHLY BUSINESS REVIEW (4 metrics)
| Metric | What It Reveals | How to Calculate | Decision It Drives |
These should test whether the pivot thesis is holding.

## QUARTERLY STRATEGIC METRICS (3 metrics)
| Metric | Confirms Thesis If... | Reconsider Pivot If... |
These are the bet-level metrics. If they move the wrong way, the strategy changes.

## OPERATING CADENCE
Weekly: [Who, duration, 3 agenda items, one decision made]
Monthly: [Who, duration, 3 agenda items, one decision made]
Quarterly: [Who, duration, 3 agenda items, one decision made]`,

    narrative:
`You are Harsha Belavady, CPG strategy advisor. Full sprint on "${company}" complete.
${sc}
${SHARPNESS_RULES}

Write the board/investor narrative. This is the document that gets read in a 3-minute slot before the Q&A. Every sentence must earn its place.

## SITUATION
2 sentences. State the business position as a fact, not a story. Include one number.

## COMPLICATION
2 sentences. The strategic tension the data revealed. This should be uncomfortable — if the board already knows it, sharpen it.

## THE PIVOT
3 sentences. What changes, why now, what it requires. The logic should be airtight.

## THE OPPORTUNITY
2 sentences. What becomes possible if the pivot works. Anchor to a market signal, not aspiration.

## WHAT WE NEED
1-2 sentences. The specific decision or resource from this room. Be direct — don't soften the ask.

## CONVICTION
2 sentences. The advisory POV. Why this advisor believes this is the right move. No hedging.`,
  };
  return map[id];
};
// ── MOCK DATA (used when MOCK_MODE = true) ───────────────────────────────────
const MOCK = {
  signals: `## HOME MARKET
India · Salty Snacks (Extruded/Bridges sub-segment) · Challenger scaling in modern trade

## MARKET SIZE & SHARE
- TAM: ₹42,000 Cr (India salty snacks, Nielsen IQ 2024)
- Growth: 12% CAGR (Nielsen IQ India FMCG 2024)
- Bingo position: #2 in bridges/extruded, ~14% share (est. Nielsen IQ 2023)
- #1 Haldiram's ~28% | #2 Bingo ~14% | #3 Kurkure (PepsiCo) ~18%
- Extruded sub-segment: ₹8,200 Cr growing 16% YoY

## DARK DATA PATTERNS
**The Kirana Blind Spot** — Modern trade is only 18% of India snack sales yet captures ~80% of Bingo's marketing attention. Rural/semi-urban kiranas move 4x volume per SKU at near-zero marketing cost. → GTM implication: Redirect 20% of MT activation budget to kirana push in Tier 2/3 using ITC's existing 6M outlet network.

**Post-School Rush Timing** — 68% of impulse snack purchases happen 3–6 PM (IRI India shopper study 2023). Bingo's digital ads peak 9–11 AM. → GTM implication: Shift Meta/YouTube delivery to 2:30–6 PM; negotiate end-cap placement at kiranas near schools in top 20 cities.

**Protein Anxiety Creep** — 34% of urban Indian snack buyers 18–35 now check nutrition labels (BCG-CII 2024), up from 19% in 2021. No bridge snack brand owns a nutrition claim. → GTM implication: Launch "Bingo Protein+" variant at ₹20, gym-adjacent retail, first-mover in bridges nutrition positioning.

## MARKET TAILWINDS
**Quick Commerce Velocity** — Blinkit/Swiggy Instamart/Zepto processed 2.1 Cr snack orders Dec 2024, +67% YoY (Redseer QComm 2024). Impulse snacks are #1 QComm FMCG category by order frequency. → Exploit: Negotiate exclusive QComm bundle packs at ₹49/₹99; QComm-native SKU sizes not currently in Bingo's range.

**Premiumisation in Tier 1** — ₹20+ SKUs growing 23% vs 8% for ₹10 SKUs (Nielsen IQ 2024). Metro consumers actively trading up. → Exploit: Accelerate premium variants exclusively in MT and QComm before Haldiram's fills the space.

## HIDDEN FRICTION POINTS
**ITC Distribution Dependency** — Bingo benefits from ITC's 6M outlet network but ITC field force prioritises cigarettes and Aashirvaad. Effective active Bingo distribution is closer to 2.8M outlets (est.). → Only way through: Dedicated Bingo field activation team of 200 reps focused purely on snack shelf share in top 100 cities.

**Flavour Fatigue at ₹10** — The ₹10 tier has 40+ SKUs across 6 brands. Bingo ₹10 repeat purchase rates plateaued at 31% (est. trade data). → Only way through: Rationalise to 3 hero ₹10 SKUs; use freed shelf space to push ₹20 variants with higher margin and repeat rates.

## INTELLIGENCE VERDICT
The Indian salty snacks market is bifurcating into a high-volume margin-thin ₹10 tier and a fast-growing ₹20–₹30 premiumisation tier. Bingo is structurally strong in the former but has a 12–18 month window to establish ₹20 leadership before Haldiram's and PepsiCo redirect investment there. Launch a credible ₹20 premium SKU with a nutrition hook through QComm and modern trade within 90 days.`,

  competitive: `## HOME MARKET CONFIRMED
India — all data scoped to Indian salty snacks market.

## NATIONAL COMPETITIVE MAP
Axes: Price (Mass ₹5–10 vs Premium ₹20+) × Distribution (Kirana-first vs MT/Digital-first)

KIRANA-FIRST | Haldiram's ₹10 [28%, 4M outlets] | Parle Hippo [niche]
MASS ←——————————————————————————————————————→ PREMIUM
MT/DIGITAL   | Kurkure PepsiCo [18%]            | BINGO ITC [14%, MT-indexed]

## REGIONAL COMPETITIVE DYNAMICS
**North India:** Haldiram's 35%+ share via 40-year kirana relationships in UP/Bihar/Delhi. Bingo is #3.
**West India:** PepsiCo strongest in Maharashtra/Gujarat through MT. Bingo under 10% share (est.).
**South India:** Most fragmented. Local players 30%+ combined. Bingo #2. Best region for premium push.
**East India:** Bingo's home turf (ITC HQ Kolkata). Highest share ~22%. Deepest kirana penetration.

## COMPETITOR COMPARISON TABLE
| Brand | Revenue | Mkt Share | Retail Reach | Distribution | Achilles Heel |
|---|---|---|---|---|---|
| Haldiram's | ₹12,000 Cr | 28% | 4M+ outlets | Own fleet | No D2C, weak digital |
| Kurkure | ₹3,200 Cr (est.) | 18% | 3.5M | PepsiCo direct | Single SKU dependency |
| Bingo (ITC) | ₹2,800 Cr (est.) | 14% | 2.8M active | ITC network | MT-indexed, weak ₹20 tier |
| Balaji Wafers | ₹1,800 Cr | 8% | 1.2M (West) | Regional only | Geography-limited |
| Parle Products | ₹900 Cr | 5% | 2M | Biscuit-led | Snacks not core focus |

## COMPETITIVE VULNERABILITIES
**Haldiram's** — Zero QComm infrastructure: no dedicated quick commerce strategy, packaging not optimised for impulse single-serve. Bingo's ₹10/₹20 SKUs are purpose-built for QComm. → Push exclusive QComm bundles and dark-store placement before Haldiram's catches up.

**Kurkure** — 60% of revenue from one SKU (Masala Munch). PepsiCo global restructuring has slowed India NPD. → Launch direct competitive SKU at ₹2 lower price, better nutrition label, target Kurkure's MT shelf slots with aggressive trade margins.

## POSITIONING VERDICT
Bingo should claim: "The only snack brand engineered for how India snacks in 2025 — QComm-native, ₹20 premium, with nutrition you can read."`,

  channels: `## HOME MARKET CONFIRMED
India — Indian retail and media landscape only.

## CHANNEL MIX BENCHMARK
| Channel | Spend % | Effectiveness | Trend | Best Example |
|---|---|---|---|---|
| General Trade (Kirana) | 35% | High | Stable | Haldiram's — owns kirana via trade margins |
| Modern Trade | 20% | Medium | Growing | Kurkure — end-cap dominance in D-Mart |
| Quick Commerce | 8% | Very High | +67% YoY | Lay's — QComm-exclusive pack sizes |
| Digital (Meta/YouTube) | 18% | Medium | Plateauing | Mamaearth — influencer + performance mix |
| TV/OOH | 14% | Medium | Declining | Haldiram's — mass brand building |
| Sampling/Activation | 5% | High | Underused | Red Bull — transit and event sampling |

## OVER-INDEXED CHANNELS
**Digital at ~18%** — CPM in India food/snacks rose 34% in 2024 (Meta India). Bingo's demo has migrated to Reels/Shorts but ad recall is 12% vs 34% for TV. ₹1 digital now drives ₹2.1 revenue vs ₹3.4 in 2022. → Redirect 6% of digital budget to QComm sponsored placements where purchase intent is immediate.

**TV/OOH at ~14%** — Bingo is already at 67% aided awareness nationally. Incremental TV drives less than 0.5% awareness uplift per ₹10 Cr spend (BARC India 2024). → Cut TV by ₹15–20 Cr; reallocate to in-store activation and QComm.

## UNDER-INDEXED CHANNELS
**Quick Commerce at ~8%** — Growing 67% YoY. Average QComm snack basket is ₹180 vs ₹28 in kirana — 6x revenue per transaction. No QComm-native strategy exists for Bingo. → List 4 QComm-exclusive SKUs (₹49 sharing, ₹99 variety box), negotiate top-3 search placement on Blinkit in 10 cities within 60 days.

**Sampling/Activation at ~5%** — Transit sampling delivers 23% trial-to-repeat in snacks (Nielsen India 2023), highest of any channel. Bingo has minimal sampling presence. → Deploy 50 sampling activations/month at metro stations in Delhi, Mumbai, Bengaluru. Cost ~₹80L/month for 2.1L trials and 48K new repeat buyers.

## CHANNEL REALLOCATION
"Reduce TV from ~14% to ~8% (save ₹18 Cr) + digital from ~18% to ~14% (save ₹8 Cr). Reallocate ₹26 Cr to QComm at 14% (+₹16 Cr) and Sampling at 10% (+₹10 Cr). QComm revenue share grows from 6% to 14% within 9 months."

## CHANNEL AUDIT VERDICT
Negotiate top-3 QComm search placement on Blinkit for "chips" and "snacks" in Delhi, Mumbai, Bengaluru within 30 days — captures highest-intent snack buyers at moment of purchase.`,

  segments: `## HOME MARKET CONFIRMED
India — all consumer data from Indian market only.

## CURRENT DOMINANT SEGMENT
Demographics: 15–24 yr males, SEC B/C, Tier 1/2 cities, students and early earners
Psychographics: Value-seekers, cricket/gaming, peer-influenced impulse purchase at kirana near college
The ceiling: Aided awareness already 78% among 15–24 males. CAC rising 20% YoY. This segment is maxed out at ~₹3,200 Cr TAM with 18% share — growth requires expanding the tent.

## WHITESPACE SEGMENTS

**The Office Desk Snacker**
Who: 25–35 yr professionals, SEC A/B, metros, WFH/hybrid. Snack 2–3x/day at desk. Want portion control without guilt.
Size signal: "Healthy office snacks India" search volume +340% since 2022 (Google Trends). Too Yumm grew 40%+ targeting adjacent wellness occasion.
Why unserved: All bridge brands position on indulgence — no brand owns the "smart snacking at work" occasion.
GTM hook: "Bingo Lite — Same bold flavour, 30% fewer calories. For when work doesn't stop but the guilt does." ₹20 single-serve.
Channel: LinkedIn + Instagram Reels targeting 25–34 professionals; Swiggy Instamart 11AM–2PM office slot; corporate pantry tie-ups WeWork/Awfis.

**The Health-Conscious Mother**
Who: 30–45 yr urban mothers, SEC A, metros/Tier 1. Buys snacks for children 6–14. Reads labels. Rejected Kurkure for artificial colours.
Size signal: India kids' healthy snack segment ₹2,800 Cr, +19% YoY (Redseer 2024). Slurrp Farm raised ₹100 Cr+ on this segment.
Why unserved: No mass snack brand at ₹10–₹20 has made a credible clean-label claim. Healthy kids' snacks are either too expensive (₹50+) or taste bad.
GTM hook: "Bingo Junior — Real ingredients, no artificial colours. ₹15. Passes the mum test."
Channel: Mommy influencers 5K–50K Instagram. BigBasket/Zepto family grocery bundles. MT kids' aisle positioning.

**The Bharat Upgrader**
Who: 22–35 yr first-generation earners in Tier 2/3 cities (Patna, Indore, Surat). Rising income, aspiring lifestyle. Trading up in smartphones and clothing but no snack brand has spoken to them.
Size signal: Tier 2/3 packaged food spend growing 18% vs 11% metros (BCG-CII 2024). 60% of India's population, only 35% of Bingo's revenue.
Why unserved: Premium snack brands are distributed metro-first. Tier 2/3 gets stale stock and limited flavour variety.
GTM hook: "Bingo Select — New flavours, first in your city." Limited-edition regional flavours (Lucknow Chaat, Surat Locho) at ₹20.
Channel: Regional YouTube creators in Hindi/regional languages. WhatsApp Commerce via ITC's rural network. Kirana visibility push in top 200 Tier 2/3 cities.

## HIGHEST-VALUE PIVOT SEGMENT
1. Office Desk Snacker wins: 80M+ addressable professionals, ₹20 ASP vs ₹10, reachable via QComm + professional digital at lower CAC, zero competition from Haldiram's or Kurkure.
2. Launch Bingo Lite exclusively on Blinkit/Swiggy Instamart and corporate cafeterias in Bengaluru, Mumbai, Delhi. Seed 50 LinkedIn micro-influencers (10K–100K followers). No TV, no mass digital.
3. Confirming metric: 15% repeat purchase rate among office-segment first-time buyers within 60 days.

## SEGMENT VERDICT
The Office Desk Snacker is Bingo's highest-conviction next bet — large (80M+), unserved, reachable through channels where Bingo is under-indexed, and it justifies the ₹20 price point unlocking margin expansion and premiumisation. The window is 12–18 months before a funded competitor fills it.`,

  pivot: `## THE PIVOT THESIS
Bingo must pivot from mass impulse snack competing on price and distribution to a QComm-native ₹20 brand owning the office snacking occasion — this is where India's spending is going, where no competitor is positioned, and where ITC's infrastructure gives Bingo an 18-month head start.

## WHAT TO STOP
**Defending the ₹10 impulse tier at all costs** — High volume, declining margins, rising CAC, price-switching customers. Maintain distribution but stop incremental investment in ₹10 SKU innovation and promotion.
**Spray-and-pray TV and national digital** — At 67% aided awareness, incremental mass media returns under 0.5% awareness uplift per ₹10 Cr. Every rupee here is wasted.

## WHAT TO START
**QComm-native SKU strategy** — 4 QComm-exclusive formats (₹49 sharing, ₹99 variety box, ₹20 Lite, ₹35 premium) built for Blinkit/Zepto basket sizes. → Target: 14% of Bingo revenue from QComm within 9 months (from ~6%).
**Office occasion campaign** — "Bingo Lite" as the smart desk snack. 50 LinkedIn micro-influencers, corporate cafeteria tie-ups in 5 cities, Swiggy Instamart 11AM–2PM slot. → Target: 15% repeat purchase among office-segment first-time buyers in 60 days.
**Regional flavour drops Tier 2/3** — Limited-edition city-specific flavours via ITC's kirana network. Create scarcity and tastemaker effect. → Target: 40% sell-through within 30 days in pilot cities.

## WHAT TO ACCELERATE
**ITC's Tier 2/3 distribution** — ITC has India's deepest Tier 2/3 reach. Bingo is not maximising it for premium SKUs. → Double premium SKUs available Tier 2/3 from 4 to 8, double active premium outlets from 400K to 800K by Month 9.

## 90-DAY ROADMAP
Month 1 — Foundation: Brief packaging agency for Bingo Lite (clean label, office positioning) | Negotiate QComm tier-1 placement with Blinkit and Zepto in 3 cities | Identify 50 LinkedIn micro-influencers for office snacking campaign
Month 2 — Activation: Launch Bingo Lite exclusively on QComm in 3 cities | Deploy corporate cafeteria sampling in 20 WeWork/Awfis locations Delhi + Bengaluru | Launch Lucknow Chaat flavour drop in UP/Bihar Tier 2 cities via ITC
Month 3 — Proof: Expand Bingo Lite to 5 more cities on QComm data | Present regional flavour results to ITC leadership | Review office repeat rate vs 15% threshold
Success metrics: QComm revenue share 9% | Bingo Lite repeat rate 15% | ₹20+ SKU portfolio share 22% (from 14%)

## PIVOT RISK
**The real risk — ITC internal prioritisation**: Bingo is one of 25+ ITC FMCG brands. This pivot competes for ITC resources with Aashirvaad and Sunfeast, both larger P&L contributors. → Mitigation: Build as self-funded pilot using Bingo's own A&P reallocation, with 90-day proof point triggering ITC board approval for additional resource.

## STRATEGIC CONVICTION
The hardest truth: Bingo's biggest threat is not Haldiram's or Kurkure — it is the company's own comfort with being a strong #2 in a growing market, which makes the internal case for disrupting the ₹10 playbook feel unnecessary. This pivot requires letting go of volume as the primary success metric and accepting that fewer ₹20 transactions are strategically more valuable than more ₹10 ones. The timing is right because QComm is still in its land-grab phase and Haldiram's 18-month digital infrastructure gap is the clearest competitive window Bingo will have this decade.`,

  kpis: `## NORTH STAR METRIC
**₹20+ SKU Revenue Share** — percentage of total Bingo revenue from SKUs priced ₹20 and above. Target: 28% in 6 months (from ~14%). Why this over total revenue: it is the single metric that tracks whether premiumisation is structurally working and cannot be gamed by volume discounting.

## WEEKLY PULSE (5 metrics)
| Metric | Definition | Healthy Range | Red Flag | Response |
|---|---|---|---|---|
| QComm Daily Orders | Units/day across Blinkit + Zepto + Instamart | >2,400 by Wk4 | <1,200 | Escalate placement rank, review pricing |
| Bingo Lite Repeat Rate | First-time buyers reordering within 14 days | >12% | <6% | Review flavour, occasion messaging |
| Office Influencer CTR | Avg click-through on LinkedIn campaign posts | >2.8% | <1.2% | Refresh creative, re-brief influencers |
| ₹20 SKU Distribution | Active outlets stocking ≥1 ₹20 SKU | >480K by Wk8 | <320K | Accelerate Tier 2/3 field push |
| Trade Margin Compliance | % outlets receiving agreed margin on ₹20 SKUs | >92% | <80% | Audit top 5 distributors immediately |

## MONTHLY BUSINESS REVIEW (4 metrics)
| Metric | What It Reveals | How to Calculate | Decision It Drives |
|---|---|---|---|
| QComm Revenue Share | Whether QComm is becoming structural | QComm revenue ÷ total Bingo revenue | Increase/decrease QComm SKU investment |
| Premium SKU Gross Margin | Whether ₹20 tier is delivering the margin thesis | (Revenue - COGS) ÷ Revenue for ₹20+ SKUs | Pricing and formulation decisions |
| Office Segment CAC | Whether office channel is efficient vs mass digital | Total office campaign spend ÷ new repeat buyers | Channel reallocation decisions |
| Tier 2/3 Premium Velocity | Whether Bharat Upgrader segment is responding | ₹20+ SKU units/active outlet in T2/3 vs T1 | Regional investment decisions |

## QUARTERLY STRATEGIC METRICS
| Metric | Thesis Confirmed If... | Reconsider Pivot If... |
|---|---|---|
| ₹20+ Revenue Share | Reaches 22%+ | Still below 16% at Month 6 |
| QComm Revenue Share | Reaches 12%+ | Below 8% at Month 9 |
| Office Repeat Rate | 15%+ sustained for 8 weeks | Below 10% after 3 months |

## OPERATING CADENCE
Weekly: Founder + QComm lead + field lead · 25 min · Mon 9AM · Review 5 pulse metrics · Decide: any channel/pricing adjustment this week
Monthly: Full leadership team · 90 min · P&L + ₹20 SKU + QComm + Tier 2/3 momentum · Decide: SKU launches, budget reallocation
Quarterly: Board/ITC leadership · 3 hrs · Pivot thesis scorecard + 3 strategic metrics · Decide: Continue/accelerate/pivot strategy`,

  narrative: `## SITUATION
Bingo holds a strong #2 position in India's ₹42,000 Cr salty snacks market with ~14% share, built on ITC's unmatched 2.8M-outlet distribution and a loyal 15–24 male core. The business generates an estimated ₹2,800 Cr in annual revenue but 86% of that comes from the ₹10 impulse tier where margins are thin and CAC is rising 20% YoY.

## COMPLICATION
The ₹10 tier is becoming a trap: 40+ SKUs across 6 brands have commoditised the space, repeat rates have plateaued at 31%, and every marketing rupee is fighting for the same 15–24 male audience with every other snack brand. Meanwhile the ₹20+ premium tier is growing at 23% YoY and Bingo has only 14% of its own portfolio there — Haldiram's and PepsiCo will not ignore this for long.

## THE PIVOT
Bingo must reposition as a QComm-native, ₹20 premium brand owning the office snacking occasion — launching Bingo Lite on Blinkit/Zepto exclusively, seeding LinkedIn micro-influencers, and using ITC's Tier 2/3 network for regional flavour drops that make the brand feel premium and local simultaneously. This is not a brand reinvention; it is a price tier migration that Bingo's flavour DNA fully supports.

## THE OPPORTUNITY
If the ₹20 tier reaches 28% of Bingo's revenue within 6 months — from 14% today — it adds approximately ₹400 Cr in higher-margin revenue and establishes Bingo as the defining snack brand of India's professionalising, premiumising middle class before any competitor has a credible claim in that space.

## WHAT WE NEED
A decision today to reallocate ₹26 Cr from TV and underperforming digital to QComm placement and office-occasion activation — this is not incremental budget, it is a reallocation with a 90-day proof point built in.

## CONVICTION
This advisor's view: the data is unambiguous that QComm and the office snacking occasion are structurally underserved by every snack brand in India, and Bingo has ITC's infrastructure to move faster than any D2C challenger could. The risk is not whether the market exists — it does — the risk is whether ITC's internal prioritisation allows Bingo to move at startup speed. Solve that internally, and this is the right pivot at the right time.`,
};

async function callClaude(prompt, pdfs, signal, agentId = "signals") {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    return MOCK[agentId] || MOCK.signals;
  }

  // Use Vercel API proxy instead of direct Anthropic API
  const API_ENDPOINT = "https://advisorsprint-api.vercel.app/api/claude";

  const res = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      prompt,
      pdfs: pdfs.map(p => ({ name: p.name, b64: p.b64 })),
      agentId,
    }),
  });

  if (res.status === 429) {
    const error = await res.json();
    throw new Error(error.message || 'Rate limit exceeded. Please try again later.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  const data = await res.json();
  
  // Show usage info in console
  if (data.usage) {
    console.log(`[Usage] ${data.usage.global}/${data.usage.limit} sprints used. ${data.usage.remaining} remaining.`);
  }

  return data.text;
}
function parseTable(block) {
  const rows = block.trim().split("\n").filter(r => r.includes("|"));
  if (rows.length < 2) return null;
  const cells = r => r.split("|").map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1);
  const header = cells(rows[0]);
  const body   = rows.slice(2); // skip separator row
  if (!header.length) return null;
  const thStyle = `padding:7px 10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${P.inkSoft};background:${P.parchment};border-bottom:2px solid ${P.sand};white-space:nowrap;`;
  const tdStyle = `padding:7px 10px;font-size:11px;color:${P.inkMid};border-bottom:1px solid ${P.sand};vertical-align:top;line-height:1.5;`;
  const ths = header.map(h => `<th style="${thStyle}">${h}</th>`).join("");
  const trs = body.map((r, i) => {
    const tds = cells(r).map(c => `<td style="${tdStyle}">${c}</td>`).join("");
    return `<tr style="background:${i % 2 === 0 ? P.white : P.cream}">${tds}</tr>`;
  }).join("");
  return `<div style="overflow-x:auto;margin:10px 0;border:1px solid ${P.sand};border-radius:3px;">
    <table style="width:100%;border-collapse:collapse;font-family:'Work Sans',sans-serif;">
      <thead><tr>${ths}</tr></thead>
      <tbody>${trs}</tbody>
    </table>
  </div>`;
}

function parseAxesMap(text) {
  // Detect ASCII 2x2 maps — lines containing ← or → or ←—
  if (!text.includes("←") && !text.includes("↑")) return null;
  const lines = text.split("\n");
  const mapLines = [];
  let inMap = false;
  for (const line of lines) {
    if (line.includes("←") || line.includes("↑") || line.includes("KIRANA") || line.includes("MT/DIGITAL") || line.includes("MASS") || line.includes("PREMIUM")) {
      inMap = true;
    }
    if (inMap) mapLines.push(line);
    if (inMap && mapLines.length > 6) break;
  }
  if (!mapLines.length) return null;
  return `<div style="background:${P.parchment};border:1px solid ${P.sand};border-radius:3px;padding:12px 14px;margin:10px 0;overflow-x:auto;">
    <pre style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${P.inkMid};line-height:1.8;margin:0;white-space:pre;">${mapLines.join("\n")}</pre>
  </div>`;
}

function md(text) {
  if (!text) return "";

  // 1. Extract and replace tables before other processing
  let processed = text.replace(/^(\|.+\|\n)(\|[-| :]+\|\n)((?:\|.+\|\n?)+)/gm, (match) => {
    const table = parseTable(match);
    return table ? `%%TABLE%%${btoa(unescape(encodeURIComponent(table)))}%%TABLE%%` : match;
  });

  // 2. Extract axes maps
  const axesMap = parseAxesMap(text);
  if (axesMap) {
    processed = processed
      .replace(/KIRANA-FIRST.*?\n.*?MASS.*?PREMIUM.*?\n.*?MT\/DIGITAL[^\n]*/gs, `%%AXES%%${btoa(unescape(encodeURIComponent(axesMap)))}%%AXES%%`)
      .replace(/(KIRANA|MT\/DIGITAL|MASS ←)[^\n]*/g, "");
  }

  // 3. Standard markdown
  processed = processed
    .replace(/^## (.+)$/gm, `<h3 style="font-family:'Libre Baskerville',serif;font-size:14px;color:${P.forest};margin:16px 0 6px;border-bottom:1px solid ${P.sand};padding-bottom:4px;">$1</h3>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${P.ink};">$1</strong>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:7px;margin:3px 0;"><span style="color:${P.terra};flex-shrink:0;">▸</span><span>$1</span></div>`)
    .replace(/\n\n/g, `</p><p style="margin:6px 0;">`)
    .replace(/\n/g, "<br/>");

  // 4. Restore tables and axes maps
  processed = processed
    .replace(/%%TABLE%%([^%]+)%%TABLE%%/g, (_, b64) => decodeURIComponent(escape(atob(b64))))
    .replace(/%%AXES%%([^%]+)%%AXES%%/g, (_, b64) => decodeURIComponent(escape(atob(b64))));

  return processed;
}
function AgentCard({ agent, status, result, index }) {
  const colors = {
    idle:    { border: P.sand,  bg: P.parchment, dot: P.sand       },
    queued:  { border: P.sand,  bg: P.parchment, dot: P.inkFaint   },
    waiting: { border: P.sand,  bg: P.parchment, dot: P.inkFaint   },
    running: { border: P.gold,  bg: "#fffdf8",   dot: P.gold       },
    done:    { border: P.sand,  bg: P.white,     dot: P.forestSoft },
    error:   { border: P.terra, bg: "#fff5f0",   dot: P.terra      },
  };
  const c = colors[status] || colors.idle;
  const waveColor = agent.wave === 1 ? P.forestSoft : P.terra;

  return (
    <div data-agent={agent.id} className="print-section" style={{
      border: `1.5px solid ${c.border}`, borderRadius: 3, background: c.bg,
      overflow: "hidden", transition: "all 0.3s",
      boxShadow: status === "running" ? `0 3px 20px rgba(200,146,42,0.13)` : "none",
      animation: status === "done" ? "fadeUp 0.4s ease" : "none",
    }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
        borderBottom: (status === "running" || status === "done" || status === "error") ? `1px solid ${P.sand}` : "none",
      }}>
        {/* Number badge */}
        <div style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          background: status === "running" ? P.gold : status === "done" ? P.forestSoft : P.sand,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: P.white,
          transition: "background 0.3s",
        }}>{index + 1}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: P.ink }}>{agent.label}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: waveColor, background: `${waveColor}18`,
              padding: "2px 6px", borderRadius: 20, letterSpacing: "0.06em",
            }}>WAVE {agent.wave} {agent.wave === 1 ? "· PARALLEL" : "· SYNTHESIS"}</span>
          </div>
          <div style={{ fontSize: 11, color: P.inkFaint, marginTop: 1 }}>{agent.sub}</div>
        </div>

        {/* Status indicator */}
        <div style={{ fontSize: 10, fontWeight: 700, color: c.dot, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          {status === "running" && <>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: P.gold, animation: "pulse 1s infinite" }}/>
            PROCESSING
          </>}
          {status === "done"    && "✓ DONE"}
          {status === "queued"  && "— READY"}
          {status === "waiting" && "— READY"}
          {status === "idle"    && "—"}
          {status === "error"   && "⚠ ERROR — RETRYING"}
        </div>
      </div>

      {/* Shimmer bar while running */}
      {status === "running" && (
        <div style={{ height: 2, background: P.sand, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, width: "55%",
            background: `linear-gradient(90deg, transparent, ${P.gold}, transparent)`,
            animation: "shimmer 1.3s ease-in-out infinite",
          }}/>
        </div>
      )}

      {/* Content */}
      {result && (
        <div className="agent-content" style={{ padding: "16px 20px", fontSize: 13, color: P.inkMid, lineHeight: 1.8,
          fontFamily: "'Instrument Sans', sans-serif", maxHeight: 440, overflowY: "auto",
        }}
          dangerouslySetInnerHTML={{ __html: `<p style="margin:0">${md(result)}</p>` }}
        />
      )}

      {/* Ready placeholder */}
      {(status === "queued" || status === "waiting") && !result && (
        <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: P.sand, animation: "pulse 1.5s infinite" }}/>
          <span style={{ fontSize: 12, color: P.inkFaint, fontStyle: "italic" }}>
            Ready · Firing in parallel with other agents
          </span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ statuses, elapsed, estMins }) {
  const total   = AGENTS.length;
  const done    = AGENTS.filter(a => statuses[a.id] === "done").length;
  const current = AGENTS.find(a => statuses[a.id] === "running");
  const pct     = Math.round((done / total) * 100);
  const w1done  = W1.filter(id => statuses[id] === "done").length;
  const wave    = w1done < W1.length ? 1 : 2;
  const mm  = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss  = String(elapsed % 60).padStart(2, "0");
  const etaSecs  = estMins ? estMins * 60 : 0;
  const remSecs  = Math.max(0, etaSecs - elapsed);
  const remMm    = String(Math.floor(remSecs / 60)).padStart(2, "0");
  const remSs    = String(remSecs % 60).padStart(2, "0");

  return (
    <div style={{ background: P.forest, borderRadius: 3, padding: "14px 20px", marginBottom: 16 }}>
      {/* Top row: wave + current agent + timer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, color: P.sand, fontWeight: 700, letterSpacing: "0.1em" }}>
            WAVE {wave} · {done}/{total} COMPLETE
          </span>
          {current && (
            <span style={{ fontSize: 10, color: P.gold, fontStyle: "italic" }}>
              → {current.label}
            </span>
          )}
        </div>
        {/* Elapsed + remaining */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: P.sand, fontFamily: "'JetBrains Mono',monospace" }}>
            ⏱ {mm}:{ss}
          </span>
          {estMins && remSecs > 0 && (
            <span style={{ fontSize: 10, color: P.inkFaint, fontFamily: "'JetBrains Mono',monospace" }}>
              ~{remMm}:{remSs} left
            </span>
          )}
          <span style={{ fontSize: 10, color: P.gold, fontFamily: "'JetBrains Mono',monospace" }}>{pct}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 2, height: 6, marginBottom: 10 }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${P.gold},${P.terra})`,
          borderRadius: 2, width: `${pct}%`, transition: "width 0.8s ease" }}/>
      </div>

      {/* Agent pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {AGENTS.map(a => {
          const s   = statuses[a.id];
          const col = s === "done" ? P.gold : s === "running" ? P.terraSoft : "rgba(255,255,255,0.2)";
          return (
            <div key={a.id} style={{ fontSize: 10, color: col, display: "flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
              <span style={{ fontSize: 8 }}>{s === "done" ? "✓" : s === "running" ? "●" : "○"}</span>
              {a.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// OPERATING DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function OperatingDashboard({ company, northStarKpi = "" }) {
  // Metric values — will be editable in Phase 2 (CSV upload)

  const MetricCard = ({ name, value, unit, target, def, tag, status = "empty" }) => {
    const statusColors = { good: "#4a9b6f", warn: "#d9a846", alert: "#c85a4a", empty: P.sand };
    const tagColors = {
      dist: { color: "#3d6b54", bg: "rgba(61,107,84,.12)" },
      sales: { color: "#9a6e3a", bg: "rgba(154,110,58,.1)" },
      consumer: { color: "#4a7b9b", bg: "rgba(74,123,155,.1)" },
      fin: { color: "#9b4a5a", bg: "rgba(155,74,90,.1)" },
      digital: { color: "#7a5a9b", bg: "rgba(122,90,155,.1)" },
    };
    return (
      <div style={{ background: P.white, border: `1px solid ${P.sand}`, borderLeft: `3px solid ${statusColors[status]}`, borderRadius: 4, padding: "16px 18px", position: "relative" }}>
        <div style={{ position: "absolute", top: 14, right: 14, width: 7, height: 7, borderRadius: "50%", background: statusColors[status] }} />
        <div style={{ fontSize: 11, color: P.inkMid, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 10 }}>{name}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 26, color: P.ink, fontWeight: 600 }}>{value}</div>
          {unit && <div style={{ fontSize: 13, color: P.inkFaint, fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>{unit}</div>}
        </div>
        <div style={{ fontSize: 11, color: P.inkSoft, marginBottom: 6 }}>Target: <span style={{ color: P.ink, fontWeight: 600 }}>{target}</span></div>
        <div style={{ fontSize: 11, color: P.inkFaint, lineHeight: 1.5, marginBottom: 10 }}>{def}</div>
        <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 10, letterSpacing: ".03em", color: tagColors[tag].color, background: tagColors[tag].bg }}>
          {tag === "dist" ? "Distribution" : tag === "sales" ? "Sales" : tag === "consumer" ? "Consumer" : tag === "fin" ? "Financial" : "Digital"}
        </span>
      </div>
    );
  };

  const SplitMetric = ({ name, values, labels, target, def, tag }) => (
    <div style={{ background: P.white, border: `1px solid ${P.sand}`, borderLeft: `3px solid #4a9b6f`, borderRadius: 4, padding: "16px 18px" }}>
      <div style={{ fontSize: 11, color: P.inkMid, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 10 }}>{name}</div>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 8 }}>
        {values.map((v, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, color: P.ink, fontWeight: 600 }}>{v}%</div>
            <div style={{ fontSize: 10, color: P.inkFaint, fontWeight: 600, letterSpacing: ".03em", textTransform: "uppercase" }}>{labels[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: P.inkSoft, marginBottom: 6 }}>Target: <span style={{ color: P.ink, fontWeight: 600 }}>{target}</span></div>
      <div style={{ fontSize: 11, color: P.inkFaint, lineHeight: 1.5, marginBottom: 10 }}>{def}</div>
      <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 10, color: "#9a6e3a", background: "rgba(154,110,58,.1)" }}>Sales</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 24px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 28, color: P.ink, fontWeight: 700, marginBottom: 4 }}>Operating Dashboard</div>
        <div style={{ fontSize: 13, color: P.inkSoft, fontWeight: 500 }}>{company} · CPG · 21 weekly execution metrics</div>
      </div>

      {/* North Star */}
      <div style={{ background: `linear-gradient(135deg, ${P.forest} 0%, ${P.forestMid} 100%)`, borderRadius: 4, padding: "24px 28px", marginBottom: 28, display: "flex", alignItems: "center", gap: 32 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: P.gold, marginBottom: 8 }}>North Star Metric</div>
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 22, color: "white", fontWeight: 700, marginBottom: 6 }}>
            {(() => {
              const kpiText = northStarKpi || "";
              const m = kpiText.match(/##\s*NORTH STAR METRIC\s*
+\*?\*?([^
\*]+)\*?\*?\s*[—–-]/i);
              return m ? m[1].trim() : "Run a sprint to define your North Star";
            })()}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)", lineHeight: 1.6, maxWidth: 520 }}>
            {(() => {
              const kpiText = northStarKpi || "";
              const m = kpiText.match(/##\s*NORTH STAR METRIC\s*
+[^
]+[—–-]+\s*([^
]{10,})/i);
              return m ? m[1].trim().slice(0, 220) : "Complete an intelligence sprint first. The Operating Cadence agent will define the North Star metric specific to your brand.";
            })()}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 42, color: "white", lineHeight: 1, fontWeight: 600 }}>—</div>
          <div style={{ fontSize: 11, color: P.gold, marginTop: 6, fontWeight: 600 }}>
            {(() => {
              const m = (northStarKpi || "").match(/[Tt]arget[:\s]+([^
\.]{5,60})/);
              return m ? "Target: " + m[1].trim() : "Run a sprint to set target";
            })()}
          </div>
        </div>
      </div>

      {/* Distribution */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: P.inkMid, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${P.sand}` }}>📦 Distribution Health</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <MetricCard name="Active Selling Outlets" value="—" unit="M" target="3.2M" def="Outlets with ≥1 sale in last 30 days" tag="dist" status="empty" />
          <MetricCard name="Premium SKU Distribution" value="—" unit="K" target="480K by Wk8" def="Outlets stocking ≥1 SKU priced ₹20+" tag="dist" status="empty" />
          <MetricCard name="Productive Outlets" value="—" unit="%" target=">75%" def="% of outlets visited that placed an order" tag="dist" status="empty" />
          <MetricCard name="Lines Per Call" value="—" unit="SKUs" target=">4.5 SKUs" def="Avg SKUs sold per outlet visit" tag="dist" status="empty" />
        </div>
      </div>

      {/* Sales */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: P.inkMid, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${P.sand}` }}>🏪 Sales Execution</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <MetricCard name="Revenue per Outlet" value="—" unit="₹K" target="₹3.5K/month" def="Avg sales per active outlet per month" tag="sales" status="empty" />
          <MetricCard name="Frontline Productivity" value="—" unit="₹L" target="₹4.2L/rep/month" def="Revenue per field sales rep per month" tag="sales" status="empty" />
          <SplitMetric name="Channel Revenue Split" values={["—", "—", "—"]} labels={["GT", "MT", "QComm"]} target="GT 56% · MT 22% · QComm 14%" def="Revenue by channel: General Trade, Modern Trade, Quick Commerce" tag="sales" />
          <MetricCard name="Shelf Share (SOS)" value="—" unit="%" target=">18%" def="Bingo shelf ÷ total snacks shelf in MT" tag="sales" status="empty" />
        </div>
      </div>

      {/* Consumer */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: P.inkMid, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${P.sand}` }}>🔁 Consumer & Loyalty</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <MetricCard name="Repeat Purchase Rate" value="—" unit="%" target=">38% at 90 days" def="% of first-time buyers repurchasing within 90 days" tag="consumer" status="empty" />
          <MetricCard name="Consumer LTV (12-month)" value="—" unit="₹" target="₹620 for ₹20 segment" def="Avg 12-month spend per buyer" tag="fin" status="empty" />
          <SplitMetric name="Cohort Retention" values={["—", "—", "—"]} labels={["M1", "M3", "M6"]} target="M1 >70% · M3 >45% · M6 >30%" def="% of Month 1 buyers still buying at M3 and M6" tag="consumer" />
          <MetricCard name="QComm Reorder Rate" value="—" unit="%" target=">15% within 14 days" def="% of QComm first-time buyers reordering" tag="consumer" status="empty" />
        </div>
      </div>

      {/* Unit Economics */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: P.inkMid, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${P.sand}` }}>💰 Unit Economics & Financial Health</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <MetricCard name="Contribution Margin" value="—" unit="%" target=">40%" def="Gross margin minus variable marketing and logistics" tag="fin" status="empty" />
          <MetricCard name="LTV:CAC Ratio" value="—" unit="×" target=">5.0×" def="Consumer LTV ÷ Blended CAC" tag="fin" status="empty" />
          <MetricCard name="A&P as % Revenue" value="—" unit="%" target="<28%" def="Advertising & Promotion spend as % of revenue" tag="fin" status="empty" />
          <MetricCard name="Blended CAC" value="—" unit="₹" target="<₹85 for ₹20 segment" def="Total acquisition spend ÷ new repeat buyers" tag="fin" status="empty" />
        </div>
      </div>

      {/* Digital */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: P.inkMid, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${P.sand}` }}>📱 Digital & Channel Performance</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <MetricCard name="QComm Search Rank" value="—" unit="rank" target="Top 3 on Blinkit" def="Avg placement for category keywords" tag="digital" status="empty" />
          <MetricCard name="D2C Revenue Share" value="—" unit="%" target=">10%" def="Own channel vs marketplace dependency" tag="digital" status="empty" />
          <MetricCard name="Conversion Rate" value="—" unit="%" target=">2.5%" def="% of site visitors who complete purchase" tag="digital" status="empty" />
          <MetricCard name="Cart Abandonment Rate" value="—" unit="%" target="<65%" def="% who add to cart but don't buy" tag="digital" status="empty" />
        </div>
      </div>

      {/* Operating Cadence */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: P.inkMid, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${P.sand}` }}>🗓 Operating Cadence</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { period: "Weekly Review", desc: "Founder + sales lead + QComm lead · 25 min · Mon 9AM\nActive outlets, QComm reorder, productive outlets\nDecide: field or channel adjustment this week" },
            { period: "Monthly Business Review", desc: "Full leadership · 90 min\nP&L + distribution + LTV:CAC + contribution margin + A&P\nDecide: SKU launches, budget reallocation, field targets" },
            { period: "Quarterly Strategic Review", desc: "Board / ITC leadership · 3 hrs\nNorth Star vs thesis · Distribution benchmarks\nDecide: continue / accelerate / revise strategy" },
          ].map((c, i) => (
            <div key={i} style={{ background: P.forest, borderRadius: 4, padding: "16px 18px" }}>
              <div style={{ fontSize: 12, color: P.gold, fontWeight: 700, marginBottom: 6 }}>{c.period}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.8)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("sprint"); // "sprint" | "dashboard"
  const [company,  setCompany]  = useState("");
  const [context,  setContext]  = useState("");
  const [userName, setUserName] = useState("");     // optional — for analytics log
  const [appState, setAppState] = useState("idle"); // idle | preparing | running | done
  const [results,  setResults]  = useState({});     // id → text
  const [statuses, setStatuses] = useState({});     // id → idle|running|done|error|waiting
  const [showDash, setShowDash] = useState(false);
  const [pdfs,     setPdfs]     = useState([]);     // max 1 PDF, max 2MB
  const [pdfError, setPdfError] = useState("");     // validation error message
  const [elapsed,  setElapsed]  = useState(0);      // seconds since sprint start
  const [estMins,  setEstMins]  = useState(null);   // estimated total minutes
  const abortRef   = useRef(null);
  const timerRef   = useRef(null);
  const calcEstimate = (pdfBytes) => {
    const pdfKB       = (pdfBytes || 0) / 1024;
    const perAgent    = 30 + Math.round(pdfKB / 500) * 15;
    const totalSecs   = (7 * perAgent) + (6 * 1.5);
    return Math.ceil(totalSecs / 60); // round up to nearest minute
  };
  useEffect(() => {
    const totalBytes = pdfs.reduce((sum, p) => sum + p.size, 0);
    setEstMins(totalBytes > 0 ? calcEstimate(totalBytes) : 4); // 4 min default
  }, [pdfs]);
  const MAX_PDF_BYTES = 500 * 1024; // 500KB — optimum for processing speed

  const handlePdfUpload = (e) => {
    setPdfError("");
    const files = Array.from(e.target.files || []);
    const file = files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Only PDF files are accepted.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setPdfError(`File too large: ${(file.size/1024).toFixed(0)}KB. Maximum is 500KB (~25 pages). Tip: open the report, select only the key data pages (executive summary, market size, competitor tables), and save as a new PDF.`);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result.split(",")[1];
      setPdfs([{ name: file.name, b64, size: file.size }]); // replace, not append
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removePdf = () => { setPdfs([]); setPdfError(""); };

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    loadGA4();
    gaEvent("page_view", { tool: "AdvisorSprint" });
  }, []);
  const downloadPDF = () => {
    gaEvent("pdf_download", { company, user: userName || "anonymous" });
    window.print();
  };
  const runAgent = useCallback(async (id, prompt, signal, docs) => {
    try {
      const text = await callClaude(prompt, docs || [], signal, id);
      if (!signal.aborted) {
        setResults(r  => ({ ...r,  [id]: text  }));
        setStatuses(s => ({ ...s, [id]: "done" }));
        gaEvent("agent_completed", { agent: id, company, chars: text.length });
      }
      return text;
    } catch (e) {
      if (e.name !== "AbortError") {
        setStatuses(s => ({ ...s, [id]: "error" }));
        setResults(r  => ({ ...r,  [id]: `Error: ${e.message}` }));
      }
      return "";
    }
  // eslint-disable-line react-hooks/exhaustive-deps
  }, [company]);
  const runSprint = async () => {
    if (!company.trim() || appState === "running") return;

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const signal = ctrl.signal;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    setAppState("preparing");
    setResults({});
    setShowDash(false);
    setElapsed(0);

    const co  = company.trim();
    const ctx = context.trim();
    gaEvent("sprint_launched", {
      company: co,
      user: userName || "anonymous",
      pdfs_uploaded: pdfs.length,
      has_context: ctx.length > 0,
    });
    const initStatus = {};
    AGENTS.forEach(a => initStatus[a.id] = "queued");
    setStatuses(initStatus);
    const w1texts = {};
    for (const id of W1) {
      if (signal.aborted) return;
      setAppState("running"); // transition out of preparing on first agent
      setStatuses(s => ({ ...s, [id]: "running" }));
      const text = await runAgent(id, makePrompt(id, co, ctx, null), signal, pdfs);
      w1texts[id] = text;
      await new Promise(r => setTimeout(r, 1500)); // cooldown between agents
    }

    if (signal.aborted) return;
    const synthCtx = W1.map(id => {
      const text  = w1texts[id] || "";
      const lines = text.split("\n").filter(l => l.trim());
      let start   = Math.max(0, lines.length - 6);
      for (let j = lines.length - 1; j >= 0; j--) {
        if (lines[j].startsWith("##")) { start = j; break; }
      }
      return `[${AGENTS.find(a=>a.id===id).label}]:\n${lines.slice(start).join(" ").slice(0, 400)}`;
    }).join("\n\n");

    setShowDash(true);
    for (const id of W2) {
      if (signal.aborted) return;
      setStatuses(s => ({ ...s, [id]: "running" }));
      await runAgent(id, makePrompt(id, co, ctx, synthCtx), signal, pdfs);
      await new Promise(r => setTimeout(r, 1500));
    }

    if (!signal.aborted) {
      clearInterval(timerRef.current);
      // Only mark done if at least Wave 1 agents succeeded
      setStatuses(s => {
        const errorCount = Object.values(s).filter(v => v === "error").length;
        if (errorCount >= 4) {
          setAppState("idle"); // Most agents failed — reset to idle
        } else {
          setAppState("done"); // Partial or full success
        }
        return s;
      });
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    clearInterval(timerRef.current);
    setAppState("idle");
  };

  const reset = () => {
    abortRef.current?.abort();
    setAppState("idle");
    setResults({});
    setStatuses({});
    setShowDash(false);
    setCompany("");
    setContext("");
    setUserName("");
    setPdfs([]);
    setPdfError("");
    setElapsed(0);
    clearInterval(timerRef.current);
  };

  const isPreparing = appState === "preparing";
  const isRunning   = appState === "running";
  const isActive    = isPreparing || isRunning;
  const isDone      = appState === "done";
  const hasStarted  = Object.keys(statuses).length > 0;

  return (
    <div style={{ fontFamily: "'Instrument Sans',sans-serif", background: P.cream, minHeight: "100vh" }}>

      {/* ── CSS ── */}
      <style>{GLOBAL_CSS}</style>

      {/* ── HEADER ── */}
      <div style={{ background: P.forest, borderBottom: `3px solid ${P.terra}`, padding: "0 36px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: P.cream, fontStyle: "italic" }}>
            <span style={{ color: P.terraSoft }}>Advisor</span>Sprint
          </span>
          <span style={{ marginLeft: 12, fontSize: 10, color: P.sand, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Rapid Intelligence Sprint · Human &amp; AI Powered
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isRunning && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: P.gold, animation: "pulse 1s infinite" }}/>
              <span style={{ fontSize: 11, color: P.gold, fontWeight: 700 }}>
                {(() => { const cur = AGENTS.find(a => statuses[a.id] === "running"); return cur ? cur.label.toUpperCase() + " RUNNING" : "RUNNING"; })()}
              </span>
            </div>
          )}
          <div style={{ background: P.terra, color: P.cream, fontSize: 10, padding: "4px 10px", borderRadius: 2, fontWeight: 700, letterSpacing: "0.05em" }}>
            HARSHA BELAVADY
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ background: "white", borderBottom: `1px solid ${P.sand}`, padding: "0 32px", display: "flex", gap: 2 }}>
        <div
          onClick={() => setActiveTab("sprint")}
          style={{
            padding: "14px 20px",
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === "sprint" ? P.forest : P.inkSoft,
            cursor: "pointer",
            borderBottom: `2px solid ${activeTab === "sprint" ? P.forest : "transparent"}`,
            background: activeTab === "sprint" ? "#faf8f4" : "transparent",
            transition: "all .2s",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 15, opacity: activeTab === "sprint" ? 1 : 0.7 }}>◈</span>
          Intelligence Sprint
          <span style={{
            fontSize: 10,
            background: activeTab === "sprint" ? P.forestSoft : P.sand,
            color: activeTab === "sprint" ? "white" : P.inkMid,
            padding: "2px 7px",
            borderRadius: 10,
            fontWeight: 600
          }}>7</span>
        </div>
        <div
          onClick={() => { setActiveTab("dashboard"); gaEvent("dashboard_opened", { company }); }}
          style={{
            padding: "14px 20px",
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === "dashboard" ? P.forest : P.inkSoft,
            cursor: "pointer",
            borderBottom: `2px solid ${activeTab === "dashboard" ? P.forest : "transparent"}`,
            background: activeTab === "dashboard" ? "#faf8f4" : "transparent",
            transition: "all .2s",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 15, opacity: activeTab === "dashboard" ? 1 : 0.7 }}>◇</span>
          Operating Dashboard
          <span style={{
            fontSize: 10,
            background: activeTab === "dashboard" ? P.forestSoft : P.sand,
            color: activeTab === "dashboard" ? "white" : P.inkMid,
            padding: "2px 7px",
            borderRadius: 10,
            fontWeight: 600
          }}>21</span>
        </div>
      </div>

      {/* ── SPRINT TAB CONTENT ── */}
      {activeTab === "sprint" && (
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 20px" }}>

        {/* ── HERO (only before sprint starts) ── */}
        {!hasStarted && (
          <div style={{ textAlign: "center", marginBottom: 44, animation: "fadeUp 0.5s ease" }}>
            {MOCK_MODE && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fff3cd", border:"1.5px solid #c8922a", borderRadius:2, padding:"7px 14px", marginBottom:16, fontSize:12, color:"#7a5800", fontWeight:700 }}>
                🧪 MOCK MODE — Sample output only. Set MOCK_MODE = false in App.js to use real Claude API.
              </div>
            )}
            <div style={{ fontSize: 10, color: P.terra, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
              Rapid Intelligence Sprint
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 38, color: P.forest, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 16 }}>
              CPG Brand &amp; Market Insights<br/>
              <em style={{ color: P.terra }}>Analysed By 7 Parallel Agents</em>
            </h1>
            <p style={{ fontSize: 14, color: P.inkSoft, maxWidth: 520, margin: "0 auto 28px", lineHeight: 1.8 }}>
              4 analysis agents fire simultaneously across market signals, competitive landscape, channels, and customer segments. Then 3 synthesis agents turn those findings into a GTM pivot strategy, operating cadence, and board narrative.
            </p>

            {/* Architecture diagram */}
            <div style={{ display: "inline-flex", background: P.parchment, border: `1px solid ${P.sand}`, borderRadius: 3, overflow: "hidden", fontSize: 12 }}>
              <div style={{ padding: "14px 20px", borderRight: `1px solid ${P.sand}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: P.inkFaint, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Wave 1 · 4 Analysis Agents</div>
                {AGENTS.filter(a=>a.wave===1).map(a=>(
                  <div key={a.id} style={{ color: P.forestSoft, fontWeight: 600, marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: P.forestSoft, color: P.white, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>●</span>
                    {a.label}
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px 10px", display: "flex", alignItems: "center", color: P.sand, fontSize: 18 }}>→</div>
              <div style={{ padding: "14px 20px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: P.inkFaint, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Wave 2 · 3 Synthesis Agents</div>
                {AGENTS.filter(a=>a.wave===2).map(a=>(
                  <div key={a.id} style={{ color: P.terra, fontWeight: 600, marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: P.terra, color: P.white, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>◆</span>
                    {a.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── INPUT ── */}
        {!isDone && !isActive && (
          <div className="no-print" style={{ background: P.white, border: `1.5px solid ${P.sand}`, borderRadius: 3, padding: "22px 26px", marginBottom: 24, boxShadow: "0 2px 12px rgba(26,50,37,0.05)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.forest, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              Sprint Setup
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 10, color: P.inkFaint, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Brand *</label>
                <input value={company} onChange={e=>setCompany(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&!isRunning&&company.trim()&&runSprint()}
                  placeholder="e.g. Mamaearth, Oatly, Burt's Bees…" disabled={isRunning}
                  style={{ width:"100%", padding:"10px 12px", fontSize:13, background:P.cream, border:`1.5px solid ${P.sand}`, borderRadius:2, color:P.ink, outline:"none", fontFamily:"'Instrument Sans',sans-serif" }}
                  onFocus={e=>e.target.style.borderColor=P.forest}
                  onBlur={e=>e.target.style.borderColor=P.sand}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: P.inkFaint, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Context (optional)</label>
                <input value={context} onChange={e=>setContext(e.target.value)} disabled={isActive}
                  placeholder="e.g. D2C brand stuck at ₹50Cr, wants to break into modern trade…"
                  style={{ width:"100%", padding:"10px 12px", fontSize:13, background:P.cream, border:`1.5px solid ${P.sand}`, borderRadius:2, color:P.ink, outline:"none", fontFamily:"'Instrument Sans',sans-serif" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: P.inkFaint, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Your Name (optional)</label>
                <input value={userName} onChange={e=>setUserName(e.target.value)} disabled={isActive}
                  placeholder="e.g. Rahul Mehta, Peak XV Partners — helps us know who's using this"
                  style={{ width:"100%", padding:"10px 12px", fontSize:13, background:P.cream, border:`1.5px solid ${P.sand}`, borderRadius:2, color:P.ink, outline:"none", fontFamily:"'Instrument Sans',sans-serif" }}
                />
              </div>
            </div>
            {/* ── PDF UPLOAD ── */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 10, color: P.inkFaint, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                Reference Document (optional · 1 PDF · max 500KB · ~25 pages)
              </label>
              <div style={{ fontSize: 11, color: P.inkFaint, fontStyle: "italic", marginBottom: 8 }}>
                Upload an industry report, brand deck, or market data PDF. Max 500KB (~25 pages). To reduce size: open the PDF, select the key pages (executive summary + data tables), File → Print → Save as PDF.
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                {/* Upload button — hidden once file loaded */}
                {pdfs.length === 0 && (
                  <label style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    cursor: isActive ? "not-allowed" : "pointer",
                    background: P.parchment, border: `1.5px dashed ${P.sand}`, borderRadius: 2,
                    padding: "9px 16px", fontSize: 12, color: P.inkSoft, fontWeight: 600,
                    opacity: isActive ? 0.5 : 1,
                  }}>
                    <span style={{ fontSize: 15 }}>⊕</span> Upload PDF
                    <input type="file" accept=".pdf" disabled={isActive}
                      onChange={handlePdfUpload} style={{ display: "none" }} />
                  </label>
                )}

                {/* File chip */}
                {pdfs.map(p => {
                  const sizeKB  = (p.size / 1024).toFixed(0);
                  const estMinsForFile = calcEstimate(p.size);
                  return (
                    <div key={p.name} style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: P.terracream, border: `1px solid ${P.terraSoft}`,
                      borderRadius: 2, padding: "8px 12px", fontSize: 11,
                    }}>
                      <span style={{ color: P.terra, fontSize: 14 }}>⬡</span>
                      <div>
                        <div style={{ color: P.inkMid, fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div style={{ color: P.inkFaint, fontSize: 10, marginTop: 2 }}>
                          {sizeKB}KB · Sprint will take ~{estMinsForFile} min with this document
                        </div>
                      </div>
                      {!isActive && (
                        <button onClick={removePdf} style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: P.terra, fontSize: 15, lineHeight: 1, padding: "0 2px", marginLeft: 4,
                        }}>×</button>
                      )}
                    </div>
                  );
                })}

                {/* No-doc notice */}
                {pdfs.length === 0 && !pdfError && (
                  <span style={{ fontSize: 11, color: P.inkFaint, fontStyle: "italic", alignSelf: "center" }}>
                    Without a document: ~4 min · Agents use Claude training data (cutoff mid-2025)
                  </span>
                )}
              </div>

              {/* Validation error */}
              {pdfError && (
                <div style={{ marginTop: 8, fontSize: 12, color: P.terra, background: "#fff0eb", border: `1px solid ${P.terraSoft}`, borderRadius: 2, padding: "8px 12px" }}>
                  ⚠ {pdfError}
                </div>
              )}

              {/* Confirmation when file loaded */}
              {pdfs.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 11, color: P.forestSoft }}>
                  ✓ All 7 agents will read and cite this document. Estimated sprint time: ~{estMins} min.
                </div>
              )}
            </div>

            {/* Time estimate shown before launch */}
            {!isActive && !hasStarted && company.trim() && (
              <div style={{ marginBottom: 14, padding: "10px 14px", background: P.parchment, border: `1px solid ${P.sand}`, borderRadius: 2, fontSize: 12, color: P.inkSoft }}>
                ⏱ Estimated time: <strong style={{ color: P.forest }}>~{estMins} minute{estMins !== 1 ? "s" : ""}</strong>
                {pdfs.length > 0
                  ? ` · 7 agents will read "${pdfs[0].name}" and generate analysis`
                  : " · 7 agents will analyse using Claude training knowledge (mid-2025)"
                }
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={isActive ? stop : runSprint}
                disabled={!isActive && !company.trim()}
                style={{ background:isActive?P.terra:P.forest, color:P.cream, border:"none", padding:"11px 26px", borderRadius:2, fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:"0.05em", display:"flex", alignItems:"center", gap:8, fontFamily:"'Instrument Sans',sans-serif", transition:"background 0.2s" }}>
                {isPreparing
                  ? <><div style={{ width:11,height:11,border:`2px solid rgba(255,255,255,0.3)`,borderTop:`2px solid white`,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>STOP</>
                  : "▶ LAUNCH SPRINT"
                }
              </button>
              {hasStarted && (
                <button onClick={reset} style={{ background:"transparent", border:`1.5px solid ${P.sand}`, color:P.inkSoft, padding:"11px 18px", borderRadius:2, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>
                  RESET
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── PREPARING BANNER — shown from button click until first agent starts ── */}
        {isPreparing && (
          <div style={{ background: P.forest, borderRadius: 3, padding: "20px 24px", marginBottom: 16, animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 14, height: 14, border: `2px solid rgba(255,255,255,0.2)`, borderTop: `2px solid ${P.gold}`, borderRadius: "50%", animation: "spin 0.9s linear infinite", flexShrink: 0 }}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.cream }}>
                  Preparing sprint for <em style={{ color: P.gold }}>{company}</em>
                </div>
                <div style={{ fontSize: 11, color: P.sand, marginTop: 3 }}>
                  {pdfs.length > 0
                    ? `Reading "${pdfs[0].name}" and setting up 7 agents — ~30 seconds before analysis begins`
                    : "Setting up 7 agents — analysis begins in a few seconds"
                  }
                </div>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 2, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: P.sand }}>Estimated total time</span>
                <span style={{ fontSize: 11, color: P.gold, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>~{estMins} min</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  pdfs.length > 0 && { label: "PDF reading", time: "~30s per agent" },
                  { label: "4 analysis agents", time: "~3–4 min" },
                  { label: "3 synthesis agents", time: "~2 min" },
                ].filter(Boolean).map((x, i) => (
                  <div key={i} style={{ fontSize: 10, color: P.sand, background: "rgba(255,255,255,0.05)", borderRadius: 2, padding: "4px 10px" }}>
                    {x.label} · <span style={{ color: P.terraSoft }}>{x.time}</span>
                  </div>
                ))}
              </div>
              {pdfs.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 11, color: P.inkFaint, fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 10 }}>
                  Each agent reads the full PDF and cites it in their analysis. You can see results as agents complete.
                </div>
              )}
            </div>
            <button onClick={stop} style={{ marginTop: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: P.sand, padding: "7px 16px", borderRadius: 2, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Instrument Sans',sans-serif" }}>
              ✕ Cancel
            </button>
          </div>
        )}

        {/* ── WAVE PROGRESS BAR ── */}
        {isRunning && <ProgressBar statuses={statuses} elapsed={elapsed} estMins={estMins} />}

        {/* ── COMPLETION BANNER ── */}
        {isDone && (
          <div className="no-print" style={{ background: P.forestMid, borderRadius: 4, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
            <div>
              <div style={{ fontSize: 14, color: "white", fontWeight: 600 }}>✓ Sprint complete · {company} · {Math.floor(elapsed / 60)}m {elapsed % 60}s</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 3 }}>All 7 agents complete · Full intelligence sprint ready to present</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={downloadPDF} style={{ background: "transparent", border: "1px solid rgba(255,255,255,.4)", color: "white", padding: "9px 18px", borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Work Sans',sans-serif", transition: "all .2s" }}>
                  ⬇ Download PDF
                </button>
                <button onClick={() => setActiveTab("dashboard")} style={{ background: P.terra, color: "white", border: "none", padding: "9px 20px", borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Work Sans',sans-serif" }}>
                  → Open Dashboard
                </button>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", fontStyle: "italic" }}>Best in Safari or Edge · Chrome may truncate</div>
            </div>
          </div>
        )}

        {/* ── AGENT GRID ── */}
        {hasStarted && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {/* Wave 1 agents — side by side, 2 per row */}
            {AGENTS.filter(a=>a.wave===1).map((a,i) => (
              <AgentCard key={a.id} agent={a} status={statuses[a.id]||"idle"} result={results[a.id]||""} index={i} />
            ))}

            {/* North Star Metric — full width between waves */}
            {showDash && (
              <div style={{ gridColumn:"1/-1" }}>
                <div style={{ background: `linear-gradient(135deg, ${P.forest} 0%, ${P.forestMid} 100%)`, borderRadius: 4, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: P.gold, marginBottom: 8 }}>North Star Metric · from Operating Cadence Agent</div>
                    {(() => {
                      const kpiText = results["kpis"] || "";
                      const nsMatch = kpiText.match(/##\s*NORTH STAR METRIC\s*
+\*?\*?([^
\*]+)\*?\*?\s*[—–-]+?\s*([^
]{10,})/i);
                      const nsName = nsMatch ? nsMatch[1].trim() : "North Star Metric";
                      const nsDesc = nsMatch ? nsMatch[2].trim().slice(0, 200) : "Defined by the Operating Cadence agent after sprint completes.";
                      return (
                        <>
                          <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 22, color: "white", fontWeight: 700, marginBottom: 6 }}>{nsName}</div>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)", lineHeight: 1.6, maxWidth: 600 }}>{nsDesc}</div>
                        </>
                      );
                    })()}
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <button onClick={() => setActiveTab("dashboard")} style={{ background: P.terra, color: "white", border: "none", padding: "12px 24px", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Work Sans',sans-serif", letterSpacing: ".05em", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}>
                      <span style={{ fontSize: 16 }}>◇</span>
                      Open Operating Dashboard
                      <span style={{ fontSize: 10, background: "rgba(255,255,255,.2)", padding: "2px 7px", borderRadius: 10 }}>21 metrics</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Wave 2 agents — full width */}
            {AGENTS.filter(a=>a.wave===2).map((a,i) => (
              <div key={a.id} style={{ gridColumn:"1/-1" }}>
                <AgentCard agent={a} status={statuses[a.id]||"idle"} result={results[a.id]||""} index={4+i} />
              </div>
            ))}
          </div>
        )}

        {/* ── COMPLETION ── */}
        {isDone && (
          <div style={{ background:P.forest, borderRadius:3, padding:"22px 26px", display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14, animation:"fadeUp 0.4s ease" }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:P.cream, fontStyle:"italic", marginBottom:3 }}>Intelligence Sprint Complete</div>
              <div style={{ fontSize:12, color:P.sand }}>4 parallel + 3 synthesis agents · GTM pivot · Board narrative · Operating cadence · Ready to present</div>
            </div>
  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={downloadPDF} style={{ background:"transparent", border:`1.5px solid rgba(255,255,255,0.3)`, color:P.cream, padding:"10px 20px", borderRadius:2, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:"0.05em", fontFamily:"'Instrument Sans',sans-serif", display:"flex", alignItems:"center", gap:7 }}>
                  ⬇ DOWNLOAD PDF
                </button>
                <button onClick={reset} style={{ background:P.terra, color:P.cream, border:"none", padding:"10px 22px", borderRadius:2, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:"0.05em", fontFamily:"'Instrument Sans',sans-serif" }}>
                  NEW SPRINT →
                </button>
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.45)", fontStyle:"italic" }}>Best in Safari or Edge · Chrome may truncate</div>
            </div>
          </div>
        )}

        {/* ── METHODOLOGY (only on landing) ── */}
        {!hasStarted && (
          <div style={{ marginTop:52, borderTop:`1px solid ${P.sand}`, paddingTop:34 }}>
            <div style={{ fontSize:10, color:P.inkFaint, textAlign:"center", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:26 }}>The Advisory Methodology</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
              {[
                { n:"01", t:"Surface Dark Data",  d:"Find patterns hiding in plain sight — signals most brands miss because they're looking at the wrong metrics."       },
                { n:"02", t:"Map the Whitespace",  d:"Competitive positioning and segment analysis to find the exact gap this brand can credibly own."                  },
                { n:"03", t:"Audit the Channels",  d:"Identify where the brand is bleeding CAC and where untapped ROI is sitting unused."                               },
                { n:"04", t:"Build the Pivot",     d:"A specific GTM pivot with a 90-day roadmap, stop/start/accelerate framework, and board-ready narrative."         },
              ].map((s,i)=>(
                <div key={i} style={{ borderTop:`2px solid ${P.terra}`, paddingTop:13 }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:P.terra, marginBottom:7 }}>{s.n}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, color:P.forest, marginBottom:7 }}>{s.t}</div>
                  <div style={{ fontSize:12, color:P.inkSoft, lineHeight:1.7 }}>{s.d}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:32, background:P.parchment, borderLeft:`4px solid ${P.terra}`, padding:"16px 20px", borderRadius:"0 3px 3px 0" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:11, color:P.inkFaint, fontStyle:"italic", marginBottom:6 }}>About this tool</div>
              <div style={{ fontSize:12, color:P.inkMid, lineHeight:1.8 }}>
                Built by <strong style={{ color:P.forest }}>Harsha Belavady</strong>. In Wave 1, 4 Analysis Agents fire in parallel. In Wave 2, 3 Synthesis Agents fire simultaneously — providing the quickest strategic analysis for CPG brands.
              </div>
            </div>
          </div>
        )}
      </div>
      )}
      {/* END SPRINT TAB */}

      {/* ── DASHBOARD TAB CONTENT ── */}
      {activeTab === "dashboard" && (
        <OperatingDashboard company={company || "Your Brand"} northStarKpi={results["kpis"] || ""} />
      )}
      {/* END DASHBOARD TAB */}

    </div>
  );
}
