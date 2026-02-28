import { useState, useEffect, useRef, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Backend API URL
const API_URL = "https://advisorsprint-api.vercel.app/api/claude";

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
    @page { margin: 0; }
    body { background: white !important; margin: 0 !important; padding: 0 !important; }
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    .pdf-header { 
      display: block !important;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: #1a3325 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .pdf-header * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .agent-content { 
      max-height: none !important; 
      overflow: visible !important;
      padding-top: 110px !important;
      margin-top: -104px !important;
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
  { id: "synergy", wave: 2, icon: "◈", label: "Synergy Playbook", sub: "Post-acquisition integration, value capture" },
  { id: "synopsis", wave: 3, icon: "◉", label: "Executive Synopsis", sub: "Strategic synthesis of all 8 agents" },
  {
    id: "platform",
    label: "Platform Expansion & D2C Brand Incubator",
    sub: "Strategic portfolio transformation",
    icon: "◉",
    wave: 2
  }
];

const W1 = AGENTS.filter(a => a.wave === 1).map(a => a.id);
// W2 and W3 not needed - agents run based on wave property directly

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AGENT PROMPTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PROMPTS = {
  market: `# AGENT 1: MARKET POSITION & CATEGORY DYNAMICS
## POST-ACQUISITION GROWTH STRATEGY (3 YEARS IN)

**Model:** Claude Sonnet 4.6 (\`claude-sonnet-4-6-20250514\`)

**Critical Context:** ITC acquired [COMPANY] in 2023. We're now in 2026—**3 years post-acquisition**.

---

## WHAT ITC HAS ALREADY DONE (2023-2026)

**Distribution Support — PARTIAL LEVERAGE:**
- ✅ Expanded from 150 MT stores → 800-1,200 stores (ITC relationships helped BUT field team focused on ITC's premium portfolio, not full muscle for Yogabar)
- ⚠️ General Trade: Limited penetration (ITC field team bandwidth constraint)
- ✅ Marketing spend 2x higher with ITC backing (but not 3x—separate unit with own budget)
- ❌ Manufacturing: NOT moved to original co-packer facilities (no capacity constraints, Yogabar continues with co-packers)
- ⚠️ Procurement: Minimal leverage (Yogabar operates separately, limited ITC vendor access)

**The Challenge NOW:**
- **Current performance unknown** - Search for 2024-2025 revenue/growth data
- **Post-ITC trajectory assessment needed** - Has momentum continued, accelerated, or slowed?
- **Next growth drivers** - What's needed BEYOND the selective MT support already provided?
- **Field team bandwidth** - ITC's field team focused on own premium portfolio, so Yogabar needs strategies that don't depend heavily on ITC field resources

---

## YOUR MISSION

Identify the **NEXT SET** of growth opportunities that go **BEYOND distribution leverage** (already done).

**Focus on:**
1. **Category shifts since 2023** that create NEW white space
2. **Untapped demand pools** unreachable with current store-based strategy
3. **Competitive vulnerabilities** that emerged AFTER ITC's expansion
4. **Market timing signals** for what to do in 2026-2028

**DO NOT:**
- ❌ Suggest "leverage ITC distribution" (done for 3 years)
- ❌ Recommend "expand to more MT stores" (plateau evidence)
- ❌ Give advice that was valid in 2023 but irrelevant now

**DO:**
- ✅ "Quick Commerce shift: 27% of impulse nutrition now on Blinkit/Zepto (emerged 2024-2025). [COMPANY] at 4% presence vs 18% category average."
- ✅ "International opportunity: India nutrition brands entering ME markets (2025 trend). [COMPANY] positioned for export but not activated."

---

## SEARCH STRATEGY

### **PRIORITY 1: Post-Acquisition Performance Evidence**

\`\`\`
1. "[COMPANY] revenue growth 2024" OR "[COMPANY] same-store sales"
2. "[COMPANY] ITC performance 2024" OR "[COMPANY] velocity trends"
3. "ITC Foods acquisition performance 2024"
4. "[COMPANY] store count 2025" OR "distribution expansion"
\`\`\`

**Why:** Verify the plateau hypothesis. Is growth actually slowing?

### **PRIORITY 2: Category Evolution 2024-2026**

\`\`\`
5. "[Category] quick commerce 2024" (e.g., "protein bars Blinkit Zepto")
6. "[Category] D2C to retail shift 2024-2025"
7. "[Category] emerging segments 2025" (functional foods, adaptogens, etc.)
8. "[Category] international expansion India brands 2024"
9. "Health snacks consumer behavior shift 2024-2025"
10. "[Category] subscription model 2024" OR "DTC retention"
\`\`\`

**Why:** Find NEW channels/formats that emerged 2024-2026 that ITC hasn't captured.

### **PRIORITY 3: Competitive Intelligence Post-2023**

\`\`\`
11. "[Competitor] growth rate 2024" (for each major competitor)
12. "[Competitor] launches 2024" OR "new products"
13. "[Competitor] expansion 2024" (what strategies are working for them now?)
\`\`\`

**Why:** Who's still growing despite distribution commoditization? What are they doing differently?

### **PRIORITY 4: Next-Wave Opportunities**

\`\`\`
14. "Corporate wellness India 2024" OR "institutional nutrition programs"
15. "Gym chains India expansion 2024" (direct B2B channel)
16. "Travel retail nutrition India 2024" OR "airport snacks premium"
17. "Fitness studios India growth 2024" (sampling/distribution partner)
\`\`\`

**Why:** Non-traditional channels ITC may not have explored yet.

---

## OUTPUT STRUCTURE (800-1,000 words, 2 pages max)

### **SECTION 1: POST-ACQUISITION SCORECARD (200 words)**

\`\`\`
## THREE YEARS LATER: WHERE WE STAND

**Revenue Trajectory:**
FY24: ₹[X] Cr (+[Y]% YoY)
FY25: ₹[X] Cr (+[Y]% YoY - slowing/stable/accelerating)
FY26 (est): ₹[X] Cr (+[Y]% YoY)

**Distribution Footprint:**
2023: 150 MT stores
2026: [X] stores (grew [Y]x in 3 years)
Velocity: [Evidence of plateau if available - e.g., "Same-store sales up only 2% vs 45% in FY24"]

**Market Share:**
2023: [X]% (Rank #[Y])
2026: [X]% (Rank #[Y]) — [Gained/Lost] share

**Verdict:** [One sentence - Is the ITC distribution playbook still working or tapped out?]

**Confidence:** [High/Medium/Low - based on data quality]
**Sources:** [List 2-3 key sources]
\`\`\`

### **SECTION 2: CATEGORY SHIFTS SINCE 2023 (300 words)**

Identify 3 structural market changes that create NEW opportunities:

**Format per shift:**
\`\`\`
**SHIFT [#]: [Name of Shift]**
**What Changed:** [2023 baseline → 2026 status, with data]
**Why It Matters:** [Specific implication for growth strategy]
**Timing:** [Window before opportunity closes]
**Source:** [Where you found this data]

Example:
**SHIFT 1: QUICK COMMERCE DISPLACEMENT**
**What Changed:** Quick Commerce was 2% of nutrition category (2023) → 18% (2025). Blinkit/Zepto now #2 channel after E-comm for impulse premium purchases.
**Why It Matters:** [COMPANY]'s store-based strategy (MT + GT) misses 18% of category growth. QC buyers are younger (25-35), higher income, more willing to pay premium.
**Timing:** QC consolidating fast—Zepto raised $1B (2025). Top 5 brands capturing 70% of QC nutrition sales. First-mover advantage narrowing.
**Source:** Redseer QC Report Dec 2025, Blinkit category rankings
\`\`\`

**Look for:**
- New channels (QC, corporate, institutional, export)
- New segments (functional ingredients, meal replacements, kids nutrition)
- New occasions (pre-workout, travel, late-night, breakfast bars)
- New geographies (Tier-2 health consciousness, expat markets)

### **SECTION 3: COMPETITIVE DYNAMICS RESET (250 words)**

**Who's Still Growing and How:**

Track top 3 competitors:
\`\`\`
**[Competitor Name]:** 
- Growth: [X]% YoY (2024-2025) — [Faster/Slower than COMPANY]
- What they're doing: [Specific strategy - NOT generic]
- Why it works: [Structural advantage or insight]
- Threat level: [High/Medium/Low]

Example:
**Whole Truth Foods:**
- Growth: 48% YoY (FY25 vs [COMPANY]'s 35%)
- Strategy: Went premium (₹70-90 bars with ashwagandha/collagen), positioned as "beyond nutrition" → tapping functional wellness trend
- Why it works: MT plateauing for ₹45-55 bars (commoditized). Premium functional is only growing segment (+62% YoY per Euromonitor)
- Threat: High if [COMPANY] stays in ₹45-55 range
\`\`\`

### **SECTION 4: NEXT GROWTH LEVERS (250 words)**

**Beyond Distribution: What's Next?**

Identify 3-4 specific opportunities that DON'T rely on adding more stores:

**Format:**
\`\`\`
**LEVER [#]: [Opportunity Name]**
**The Play:** [Specific action]
**Market Size:** [TAM estimate if available]
**Why Now:** [Timing insight]
**ITC Advantage:** [Why [COMPANY] can win this, not just anyone]

Example:
**LEVER 1: CORPORATE WELLNESS B2B**
**The Play:** Direct contracts with corporate cafeterias (500+ employee companies). Monthly subscription boxes to employees at ₹300/employee/month.
**Market Size:** 15,000 qualifying companies in India, 5M white-collar employees = ₹1,500 Cr TAM (assuming 20% penetration)
**Why Now:** Post-COVID wellness budgets up 3x. HR teams have budget for this (classified as "employee benefits").
**ITC Advantage:** ITC Hotels already has corporate relationships. 2,500 existing corporate clients to cross-sell.
\`\`\`

---

## DATA CONFIDENCE & SOURCES

**Always State:**
- Confidence level: High/Medium/Low
- Source name and date
- Assumption if estimate

**10-Tier Source Strategy:**
Use best available data in this priority order:
1. Official earnings reports ([COMPANY], competitors, ITC)
2. Industry reports (NIQ, Euromonitor, Technopak, Redseer)
3. News articles citing research (verify source)
4. E-commerce rankings/reviews (Amazon, Blinkit top sellers)
5. LinkedIn signals (hiring patterns, company posts)
6. Consulting reports (Bain, BCG public articles)
7. Trade publications (FMCG industry news)
8. Funding announcements (competitor momentum)
9. Social media buzz (brand health indicators)
10. Logical extrapolation (mark clearly as estimate)

---

## CRITICAL SUCCESS CRITERIA

Your output must answer:
1. **Is the ITC distribution playbook tapped out?** (Yes/No with evidence)
2. **What are 3 category shifts since 2023** that create NEW growth opportunities?
3. **Which competitors are outgrowing [COMPANY]** and what are they doing differently?
4. **What are 3-4 NEXT growth levers** beyond adding more stores?

**If you can't answer these with data,** search more or mark as "insufficient data" rather than speculating.

---

## OUTPUT CHECKLIST

Before finishing, verify:
- [ ] Acknowledged what ITC already did (2023-2026)
- [ ] Showed growth trajectory evidence (is it slowing?)
- [ ] Identified 3 category shifts since 2023
- [ ] Competitive intelligence on who's still growing
- [ ] 3-4 next levers beyond distribution
- [ ] All figures have sources and confidence levels
- [ ] No generic "leverage ITC distribution" advice
- [ ] Forward-looking (2026-2028), not backward-looking

---

**Remember:** The user knows ITC has already leveraged distribution. They need to know **WHAT'S NEXT** to get back to 60% growth. Give them novel, specific, actionable insights.
`,

  portfolio: `# AGENT 2: PORTFOLIO STRATEGY & SKU RATIONALIZATION
## POST-ACQUISITION OPTIMIZATION (3 YEARS IN)

**Model:** Claude Sonnet 4.6 (\`claude-sonnet-4-6-20250514\`)

**Critical Context:** ITC acquired [COMPANY] in 2023. We're in 2026—**3 years post-acquisition**.

---

## WHAT ITC HAS ALREADY DONE (Portfolio Moves 2023-2026)

**Assumed Actions Already Taken:**
- ✅ Killed unprofitable SKUs (2023-2024 rationalization)
- ✅ Launched MT-optimized singles (₹40-45 range for impulse)
- ✅ Standardized pack sizes across channels
- ✅ Optimized manufacturing for hero SKUs (ITC plant transfer)
- ✅ Price repositioning (removed value tier, focused ₹45-65)

**Current Challenge:**
- Portfolio is NOW optimized for 2023 strategy (MT expansion)
- But market has shifted (Quick Commerce, functional trends, premiumization)
- Need NEXT wave of SKUs to capture 2026-2028 opportunities
- Risk: Portfolio ossification—same SKUs for 3 years while market evolves

---

## YOUR MISSION

Recommend the **NEXT generation** of portfolio moves for 2026-2028 growth.

**Focus on:**
1. **New SKUs needed** for channels/occasions that didn't exist/matter in 2023
2. **Kill decisions** for SKUs that worked in 2023 but are now commoditized
3. **Innovation gaps** competitors are exploiting that [COMPANY] hasn't addressed
4. **Channel-specific optimization** for Quick Commerce, institutional, export

**DO NOT:**
- ❌ Suggest "kill low-margin SKUs" (done in 2023)
- ❌ Recommend "launch singles for MT" (already done)
- ❌ Generic portfolio advice valid in 2023

**DO:**
- ✅ "Launch functional bars (₹70-90) with ashwagandha/collagen for QC channel—32% of QC nutrition sales now functional, [COMPANY] absent"
- ✅ "Kill 2023 MT-optimized ₹40 range—now commoditized (8 competitors at ₹38-42). Margin compressed from 38% to 24%."

---

## SEARCH STRATEGY

### **PRIORITY 1: Current Portfolio Performance Data**

\`\`\`
1. "[COMPANY] bestselling products 2024"
2. "[COMPANY] Amazon bestsellers" OR "top SKUs"
3. "[COMPANY] revenue by SKU 2024" OR "product mix"
4. "[COMPANY] new launches 2024" OR "product innovation"
\`\`\`

### **PRIORITY 2: Category Innovation Trends (2024-2026)**

\`\`\`
5. "Functional nutrition bars India 2024" (ashwagandha, adaptogens, collagen)
6. "Protein bars new ingredients 2024" OR "innovation trends"
7. "[Category] premium segment growth 2024-2025"
8. "Plant-based nutrition India 2024" OR "vegan bars growth"
9. "Kids nutrition bars India 2024" (emerging segment)
10. "Meal replacement bars India 2024" OR "breakfast bars"
\`\`\`

### **PRIORITY 3: Competitive Portfolio Analysis**

\`\`\`
11. "[Competitor] new products 2024" (for each major competitor)
12. "[Competitor] bestsellers Amazon 2024"
13. "[Competitor] price positioning 2024"
14. "Whole Truth functional bars" OR "True Elements premium range"
\`\`\`

### **PRIORITY 4: Channel-Specific SKU Requirements**

\`\`\`
15. "Quick Commerce nutrition bestsellers 2024"
16. "Blinkit protein bars" OR "Zepto health snacks top sellers"
17. "Corporate wellness snacks 2024" (institutional bulk packs)
18. "Travel retail nutrition India 2024" (single-serve premium)
\`\`\`

---

## OUTPUT STRUCTURE (800-1,000 words, 2 pages max)

### **SECTION 1: CURRENT PORTFOLIO ASSESSMENT (200 words)**

\`\`\`
## PORTFOLIO HEALTH CHECK (2026)

**Current SKU Count:** [X] SKUs across [Y] price tiers
**Revenue Concentration:** Top 3 SKUs = [X]% of revenue (hero SKU dependency)
**Channel Fit Analysis:**
- MT: [X] SKUs optimized (singles, ₹40-50 range)
- E-comm: [X] SKUs (multi-packs, ₹200-400 bundles)
- QC: [X] SKUs (short answer: likely underdeveloped)
- Institutional: [X] SKUs (bulk packs, B2B format)

**Portfolio Evolution 2023-2026:**
- Launched: [List new SKUs if found]
- Killed: [Assumed 2-3 low performers in 2023]
- Repositioned: [Price/pack changes]

**Current Gaps:**
1. [Gap in channel coverage - e.g., no QC-optimized SKUs]
2. [Gap in segment - e.g., no functional/premium tier]
3. [Gap in occasion - e.g., no breakfast-focused bars]

**Sources:** [List sources]
\`\`\`

### **SECTION 2: SKU-LEVEL ECONOMICS (300 words)**

**Analyze each major SKU tier:**

\`\`\`
**TIER 1: Core Range (₹45-55)**
Examples: [List if known, or describe category]
- Current performance: [Revenue %, margin %]
- Market status: [Growing/Stable/Declining segment]
- Competitive pressure: [High/Medium/Low]
- 2026 verdict: [Keep/Optimize/Phase Out]
- Rationale: [Why - with data]

**TIER 2: Premium Range (₹60-75)**
Examples: [If exists]
- Performance: [Data]
- Gap analysis: [Competitors have ₹70-90 functional bars, we don't]
- Opportunity: [Size of premium segment growth]

**TIER 3: Institutional/Bulk (₹800-1200 for 24-count)**
Examples: [If exists]
- B2B potential: [TAM estimate for corporate/gym channel]
- Current penetration: [Likely 0% if not mentioned]
\`\`\`

**For each tier, include:**
- Margin contribution (or estimate)
- Volume contribution
- Channel fit (which channels drive sales)
- Competitive benchmarking (who's winning in this tier and why)

### **SECTION 3: KILL RECOMMENDATIONS (200 words)**

**SKUs to Phase Out (2026-2027):**

\`\`\`
**KILL #1: [SKU/Tier Name]**
**Why:** [Specific reason - margin compression, commoditization, channel misfit]
**Evidence:** [Data showing declining performance or competitive pressure]
**Impact:** -₹[X] Cr revenue BUT +[Y] margin points overall
**Timing:** [Phase out Q[X] 2026]

Example:
**KILL #1: Value Range (₹35-40 Singles)**
**Why:** Launched for MT expansion in 2023, now 8 competitors at ₹38-42. Margin dropped from 38% to 24%. Cannibalizing core ₹50 range with minimal new customer acquisition.
**Evidence:** Amazon shows 6 SKUs at ₹38-42 in top 20 (2024 data). [COMPANY]'s ₹40 bar ranked #18 vs #3 in 2023.
**Impact:** -₹8 Cr revenue, +3.2 margin points by eliminating low-margin mix
**Timing:** Q2 2026 (before Q3 festival season)
\`\`\`

### **SECTION 4: LAUNCH RECOMMENDATIONS (300 words)**

**New SKUs for 2026-2028 Growth:**

\`\`\`
**LAUNCH #1: [SKU Name/Concept]**
**Target Channel:** [Primary channel this unlocks]
**Target Segment:** [Consumer/occasion]
**Price Point:** ₹[X]
**Differentiation:** [What makes this different from current portfolio]
**Market Opportunity:** [TAM/segment size]
**Margin Expectation:** [X]% (vs [Y]% portfolio average)
**Investment Required:** ₹[X] Cr (NPD, marketing, inventory)
**Payback:** [Timeline to break even]
**Why Now:** [Timing insight - why 2026 vs 2023 or 2028]

Example:
**LAUNCH #1: Functional Premium Range (₹70-90)**
**Target Channel:** Quick Commerce (Blinkit/Zepto) + Premium E-comm
**Target Segment:** 25-35 urban professionals, wellness-focused
**Price Point:** ₹75 (20g protein + ashwagandha/collagen/adaptogens)
**Differentiation:** Only Indian brand with clinically-dosed functional ingredients (not just protein). Clean label, premium positioning.
**Market Opportunity:** ₹180 Cr functional nutrition segment, growing 68% YoY (Euromonitor 2024). Currently 0% penetration for [COMPANY].
**Margin Expectation:** 42% (premium pricing offsets higher ingredient cost)
**Investment:** ₹4 Cr (R&D, initial inventory, QC/influencer seeding)
**Payback:** 14 months (₹15 Cr revenue Year 1, ₹35 Cr Year 2)
**Why Now:** QC channel hit critical mass (18% of category, 2025). Functional trend validated by Whole Truth success (₹45 Cr run-rate on functional range launched 2024).
\`\`\`

**Recommend 3-4 launches prioritized by:**
1. Quick wins (12-18 month payback)
2. Strategic bets (24-36 month payback, high growth potential)
3. Experimental (test & learn, small batch)

---

## PORTFOLIO OPTIMIZATION MATH

**Show the ROI:**

\`\`\`
CURRENT STATE (2026):
- Revenue: ₹[X] Cr
- Margin: [Y]%
- SKU count: [Z]
- Top 3 SKUs: [X]% of revenue (concentration risk)

OPTIMIZED STATE (2027-2028):
- Kill [X] SKUs → -₹[Y] Cr revenue, +[Z] margin points
- Launch [X] SKUs → +₹[Y] Cr revenue, [Z] margin impact
- Net impact: +₹[Y] Cr revenue, +[Z] margin points

PORTFOLIO HEALTH IMPROVEMENT:
- Hero SKU dependency: [X]% → [Y]% (diversification)
- Channel coverage: [X] channels → [Y] channels
- Average margin: [X]% → [Y]%
\`\`\`

---

## CRITICAL SUCCESS CRITERIA

Your output must answer:
1. **Which current SKUs are now commoditized/underperforming?** (Kill list)
2. **What 3-4 new SKUs unlock 2026-2028 opportunities?** (Launch list with ROI)
3. **How does portfolio shift for new channels** (QC, institutional, export)?
4. **What's the portfolio optimization ROI?** (Revenue/margin impact)

**Red Flags:**
- ❌ Generic "launch premium range" (WHO is buying, WHERE, WHY NOW?)
- ❌ No kill decisions (optimizing = killing as much as launching)
- ❌ No channel strategy (same SKU for MT and QC won't work)
- ✅ Specific SKU concepts with pricing, channel, margin, payback

---

## DATA CONFIDENCE & ASSUMPTIONS

**State clearly:**
- SKU-level data often unavailable publicly
- Use e-commerce rankings, reviews, competitor launches as proxies
- Mark estimates as [ESTIMATE] with logic
- Confidence levels: High/Medium/Low

**Assumption to document:**
"Assumes [COMPANY] conducted basic SKU rationalization 2023-2024 (killed bottom 20% by margin). Focus here is NEXT wave of optimization for 2026-2028 market."

---

## OUTPUT CHECKLIST

- [ ] Assessed current portfolio health (concentration, channel fit, gaps)
- [ ] SKU-level economics (margin, volume, competitive position)
- [ ] 2-3 kill recommendations with ROI math
- [ ] 3-4 launch recommendations with specific concepts
- [ ] Channel optimization strategy (QC, institutional, export)
- [ ] Portfolio optimization ROI (revenue and margin impact)
- [ ] All figures sourced or marked as estimates
- [ ] Forward-looking (2026-2028 opportunities, not 2023 basics)

---

**Remember:** The user needs to know what to launch/kill NOW (2026) for channels and trends that didn't exist/matter in 2023. Be specific with SKU concepts, pricing, channels, and payback math.
`,

  brand: `# AGENT 3: BRAND POSITIONING & STORYTELLING
## POST-ACQUISITION BRAND EVOLUTION (3 YEARS IN)

**Model:** Claude Sonnet 4.6 (\`claude-sonnet-4-6-20250514\`)

**Critical Context:** ITC acquired [COMPANY] in 2023. We're in 2026—**3 years post-acquisition**.

---

## WHAT ITC HAS ALREADY DONE (Brand Moves 2023-2026)

**Assumed Actions Taken:**
- ✅ Increased marketing spend 3x (ITC capital backing)
- ✅ Expanded to mass media (was pure digital pre-acquisition)
- ✅ ITC brand halo (association with ITC Foods credibility)
- ✅ Retail visibility boost (POS materials, in-store presence)
- ✅ Influencer marketing scaled up

**Current Challenge:**
- Brand dilution risk: Going mass (MT/GT) may have weakened premium positioning
- Scaling challenge: What worked for ₹50 Cr brand doesn't work at ₹200 Cr
- ITC association paradox: Helps credibility but may commoditize "startup cool factor"
- Need brand evolution for NEXT phase (₹500 Cr+ aspiration)

---

## YOUR MISSION

Define how [COMPANY]'s brand must **EVOLVE** (not just maintain) for 2026-2028 growth.

**Focus on:**
1. **Brand perception drift** (What changed 2023-2026 with ITC ownership/mass expansion?)
2. **Target customer evolution** (Who's buying now vs 2023? Who SHOULD buy next?)
3. **Brand repositioning** needed for new channels (QC, institutional, export)
4. **Differentiation reset** (Competition caught up—how to re-establish distinctiveness?)

**DO NOT:**
- ❌ Generic "premium positioning" (WHAT does premium mean NOW in 2026?)
- ❌ "Maintain current brand" (maintenance won't drive 60% growth)
- ❌ Ignore ITC impact (it's been 3 years, brand perception has changed)

**DO:**
- ✅ "Brand drifted from 'startup insurgent' (2020-2023) to 'ITC sub-brand' (2024-2025). Need to reclaim distinct identity while leveraging ITC credibility for distribution, not brand."
- ✅ "Target evolved: Was 25-35 fitness enthusiasts (2023), now 30-50 health-conscious families (MT expansion). Need to re-focus on original audience OR commit to new target fully."

---

## SEARCH STRATEGY

### **PRIORITY 1: Brand Perception Evidence (2024-2026)**

\`\`\`
1. "[COMPANY] brand perception 2024" OR "customer reviews sentiment"
2. "[COMPANY] Amazon reviews 2024" (read actual customer language)
3. "[COMPANY] ITC association" OR "ITC Foods brand impact"
4. "[COMPANY] social media 2024" OR "Instagram followers growth"
5. "[COMPANY] brand awareness 2024" OR "recall metrics"
\`\`\`

### **PRIORITY 2: Customer Intelligence**

\`\`\`
6. "[COMPANY] customer profile" OR "target audience"
7. "[COMPANY] reviews keywords" (what do customers actually say?)
8. "Nutrition bars customer demographics India 2024"
9. "[Category] purchase drivers 2024" (why people buy - health, taste, convenience?)
10. "[COMPANY] vs [Competitor] brand comparison" OR "customer choice factors"
\`\`\`

### **PRIORITY 3: Competitive Brand Analysis**

\`\`\`
11. "[Competitor] brand positioning 2024" (for each major competitor)
12. "Whole Truth brand strategy 2024" (strongest branded competitor)
13. "[Competitor] marketing campaigns 2024"
14. "[Category] brand leaders India 2024"
\`\`\`

### **PRIORITY 4: Emerging Brand Trends**

\`\`\`
15. "Functional wellness brands India 2024" (category evolution)
16. "Health food brand trends 2024-2025"
17. "Premiumization nutrition India 2024"
18. "Sustainable nutrition brands India 2024" (clean label, eco-friendly trend)
\`\`\`

---

## OUTPUT STRUCTURE (800-1,000 words, 2 pages max)

### **SECTION 1: BRAND HEALTH ASSESSMENT 2026 (200 words)**

\`\`\`
## BRAND STATUS CHECK

**Current Positioning (Stated):**
[What COMPANY claims to stand for - from website/packaging]

**Actual Customer Perception (Evidence-Based):**
[What customers ACTUALLY say in reviews/social media]

**Gap Analysis:**
- Brand says: "[X]"
- Customers hear: "[Y]"
- The drift: [Why perception ≠ intent]

**Brand Strength Indicators:**
- Awareness: [High/Medium/Low in target segment - with evidence]
- Consideration: [% who'd consider vs alternatives]
- Preference: [Are people choosing [COMPANY] or just buying what's available?]
- Loyalty: [Repeat purchase indicators from reviews/subscription data]

**ITC Association Impact:**
- Positive: [What ITC ownership helped - credibility, trust, visibility]
- Negative: [What it hurt - startup cool, premium perception, distinctiveness]
- Net: [Has ITC ownership been brand-positive or brand-dilutive?]

**Sources:** [List sources, mark estimates]
\`\`\`

### **SECTION 2: TARGET CUSTOMER EVOLUTION (250 words)**

\`\`\`
## WHO'S BUYING NOW VS WHO SHOULD BUY NEXT

**2023 Target (Pre-ITC Scale):**
- Demographics: [Age, income, location]
- Psychographics: [Values, lifestyle, motivations]
- Purchase occasion: [When/why they buy]
- Channel preference: [Where they discover/buy]

**2026 Reality (Post-MT Expansion):**
- Actual buyer: [Who's actually buying based on data/reviews]
- Evolution: [How customer base shifted with distribution expansion]
- Accidental reach: [Who's buying that we didn't target - MT walk-ins]

**Brand Dilution Evidence:**
Example: "Reviews show customer language shifted:
- 2020-2022: 'Clean label', 'startup', 'discovered on Instagram'
- 2024-2025: 'Saw in DMart', 'tried because convenient', 'ITC so trusted brand'
→ Transactional vs emotional connection"

**2028 Target (Who We NEED to Attract):**
For 60% growth, need [X] type of customer because:
- [Reason 1: Market size/growth]
- [Reason 2: Margin profile]
- [Reason 3: Strategic fit for new channels]

**Repositioning Decision:**
Option A: Re-focus on original premium audience (accept slower growth, higher margins)
Option B: Embrace mass premium (continue current path, optimize execution)
Option C: Segment brand (premium DTC + mass MT with different sub-brands)
**Recommendation:** [A/B/C with rationale]
\`\`\`

### **SECTION 3: COMPETITIVE BRAND DIFFERENTIATION (200 words)**

\`\`\`
## WHAT MAKES [COMPANY] DIFFERENT? (2026 Answer)

**Positioning Map:**

Place [COMPANY] and top 3 competitors on 2x2:
- X-axis: Functional ←→ Emotional
- Y-axis: Premium ←→ Accessible

**Current Reality:**
- [COMPANY]: [Where it sits - likely middle of map, undifferentiated]
- [Competitor 1]: [Their clear position]
- [Competitor 2]: [Their position]

**Differentiation Erosion:**
[COMPANY]'s original differentiation in 2020-2023: [What was unique]
→ Competitors copied: [Who did what]
→ 2026 status: [Not unique anymore]

**New Differentiation Opportunity:**
Based on market gaps and competitor vulnerabilities:

**Option 1: [Positioning Concept]**
- What it means: [Clear narrative]
- Why it's ownable: [Why [COMPANY] can claim this vs competitors]
- Why it matters: [Customer need it addresses]
- Trade-off: [What you give up]

Example:
**Option 1: "India's Functional Nutrition Pioneer"**
- What: First Indian brand with clinically-dosed adaptogens/functional ingredients (not just protein)
- Ownable: ITC R&D + manufacturing capabilities (competitors can't match)
- Matters: 68% segment growth (Euromonitor), customers want more than protein
- Trade-off: Narrow target (wellness-focused vs mass nutrition)
\`\`\`

### **SECTION 4: BRAND EVOLUTION ROADMAP (350 words)**

\`\`\`
## 2026-2028 BRAND STRATEGY

**PILLAR 1: Messaging Refresh**

**Current Message:** [What [COMPANY] says now]
**New Message:** [Evolution needed]

**Rationale:** [Why change - based on Section 1-3 insights]

**Execution:**
- Tagline: [Current] → [New concept]
- Story: [From X narrative to Y narrative]
- Proof points: [What evidence supports new claim]

**PILLAR 2: Visual Identity Evolution**

**Assessment:**
- Current look: [Premium/accessible/modern/traditional]
- Market fit: [Works for which channels, fails for which]
- Refresh needed? [Yes/No - with rationale]

**If yes:**
- Direction: [More premium/more accessible/more functional/more emotional]
- Examples: [Benchmark brands doing this well]

**PILLAR 3: Channel-Specific Brand Adaptation**

**Challenge:** Same brand must work across different channels with different expectations.

**Strategy:**

**Modern Trade:**
- Brand emphasis: [Trust, value, convenience]
- Messaging: [Variant-specific vs category-level]
- Visual: [Shelf standout vs storytelling]

**Quick Commerce:**
- Brand emphasis: [Modernity, quality, impulse-worthy]
- Messaging: [Product benefit focus]
- Visual: [App thumbnail optimization]

**D2C/E-comm:**
- Brand emphasis: [Story, mission, premium, community]
- Messaging: [Full narrative, founder story]
- Visual: [Lifestyle, detailed copy]

**Institutional (Corporate/Gym):**
- Brand emphasis: [Efficacy, trust, value]
- Messaging: [B2B ROI, wellness outcomes]
- Visual: [Professional, data-driven]

**PILLAR 4: ITC Association Management**

**The Balance:**
- Leverage: [Where ITC brand helps - trust, credibility, distribution]
- Distance: [Where ITC brand hurts - premium perception, startup energy]

**Execution:**
- Packaging: [ITC logo size/placement - subtle vs prominent]
- Communication: ["An ITC Brand" vs independent positioning]
- Channel strategy: [Where to emphasize ITC, where to downplay]

**PILLAR 5: Proof Points & Credibility**

**What needs validation:**
- Quality: [Certifications, testing, ingredients]
- Efficacy: [Claims that need backing]
- Sustainability: [If playing in this space]

**Build:**
- [Specific credibility builders - e.g., "FSSAI certification", "Nutritionist-approved", "Clean Label certified"]
- [Partnerships that add credibility]
- [Customer testimonials/case studies]
\`\`\`

---

## CRITICAL SUCCESS CRITERIA

Your output must answer:
1. **Has brand drifted 2023-2026?** (Evidence of dilution or evolution)
2. **Who's the target customer NOW vs who SHOULD it be?** (Repositioning decision)
3. **What's the differentiation in 2026?** (Original claims likely copied)
4. **How should brand evolve 2026-2028?** (Specific messaging, visual, channel strategy)

**Red Flags:**
- ❌ "Maintain premium positioning" (not a strategy, just a wish)
- ❌ Ignoring 3 years of ITC impact on brand
- ❌ Generic positioning (could apply to any competitor)
- ✅ Evidence-based (customer language, review sentiment, competitive moves)
- ✅ Trade-offs acknowledged (can't be all things to all people)

---

## DATA SOURCES & CONFIDENCE

**Primary sources:**
- Customer reviews (Amazon, Blinkit, Google) - read actual words
- Social media comments (what people say unprompted)
- Competitor positioning (websites, campaigns, packaging)
- Category trends (brand landscape evolution)

**Mark confidence:**
- Perception data often qualitative - state sample size/limitations
- Brand metrics rarely public - use proxies (followers, review volume)
- Differentiation is judgment call - explain reasoning

---

## OUTPUT CHECKLIST

- [ ] Brand health assessed with evidence (not assumptions)
- [ ] Target customer evolution documented (2023 vs 2026 vs 2028)
- [ ] Differentiation gap identified (what was unique, what's now copied)
- [ ] Positioning options presented with trade-offs
- [ ] Brand evolution roadmap (messaging, visual, channel-specific)
- [ ] ITC association managed (leverage vs distance strategy)
- [ ] All claims backed by customer evidence or marked as recommendations
- [ ] Forward-looking (what brand needs to BECOME, not maintain)

---

**Remember:** After 3 years and MT expansion, the brand HAS changed whether intentionally or not. Your job is to assess the drift and recommend the evolution needed for next phase growth.
`,

  margins: `# AGENT 4: MARGIN IMPROVEMENT & UNIT ECONOMICS
## POST-ACQUISITION OPTIMIZATION (3 YEARS IN)

**Model:** Claude Sonnet 4.6 (\`claude-sonnet-4-6-20250514\`)

**Critical Context:** ITC acquired [COMPANY] in 2023. We're in 2026—**3 years post-acquisition**.

---

## WHAT ITC HAS ALREADY CAPTURED (Synergies 2023-2026)

**Assumed Margin Improvements Already Realized:**
- ✅ Manufacturing: Moved to original co-packer facilities (COGS optimization limited (no manufacturing synergy))
- ✅ Procurement: Leveraged ITC vendor relationships (5-8% ingredient savings)
- ✅ Logistics: ITC distribution network (freight costs down)
- ✅ SKU rationalization: Killed bottom 20% by margin (2023-2024)
- ✅ Channel mix: Shifted from 70% Amazon (high fees) to 50% MT (better margins)

**Margin Evolution 2023-2026:**
- Assumed: 32% gross margin (2023) → 39-41% (2026) from above synergies
- ITC captured the "obvious" operational efficiencies

**Current Challenge:**
- Low-hanging fruit exhausted
- Need NEXT layer of margin improvement (45%+ target for premium positioning)
- Growth investments (new SKUs, QC expansion) pressuring margins
- How to fund 60% growth while improving margins?

---

## YOUR MISSION

Identify the **NEXT WAVE** of margin improvement opportunities beyond basic synergies.

**Focus on:**
1. **Advanced margin levers** (not just "reduce COGS")
2. **Channel mix optimization** for 2026 reality (QC, institutional, export)
3. **Pricing power** opportunities (where can [COMPANY] charge more?)
4. **Hidden costs** introduced by 3 years of rapid expansion

**DO NOT:**
- ❌ Suggest "move to original co-packer facilities" (done 3 years ago)
- ❌ Generic "reduce COGS" (what specifically?)
- ❌ "Leverage ITC procurement" (already captured)

**DO:**
- ✅ "Shift from bulk sweeteners to monk fruit (premium ingredient) while maintaining 41% margin—unlocks ₹70-90 price point vs current ₹50 ceiling"
- ✅ "QC channel delivers 48% margin (no listing fees, no returns) vs MT 38% (trade terms + wastage). Shift 20% of volume from MT to QC = +2.1 margin points"

---

## SEARCH STRATEGY

### **PRIORITY 1: Current Margin Performance**

\`\`\`
1. "[COMPANY] gross margin 2024" OR "profitability"
2. "[COMPANY] EBITDA 2024" OR "unit economics"
3. "ITC Foods margins 2024" (benchmark for realistic target)
4. "[COMPANY] cost structure 2024"
\`\`\`

### **PRIORITY 2: Channel Economics**

\`\`\`
5. "Modern Trade margins India 2024" OR "trade terms"
6. "Quick Commerce seller margins 2024" (Blinkit/Zepto economics)
7. "Amazon India seller fees 2024" OR "e-commerce costs"
8. "D2C margins India 2024" OR "direct margins"
9. "Institutional sales margins B2B 2024"
\`\`\`

### **PRIORITY 3: Input Cost Intelligence**

\`\`\`
10. "Protein powder prices India 2024" OR "whey price trends"
11. "Nutrition ingredients inflation 2024"
12. "Packaging costs India 2024"
13. "Alternative sweeteners cost 2024" (monk fruit, stevia, allulose)
14. "Logistics costs India 2024" OR "freight inflation"
\`\`\`

### **PRIORITY 4: Competitive Margin Signals**

\`\`\`
15. "[Competitor] margins" OR "profitability 2024"
16. "Premium nutrition pricing India 2024"
17. "[Category] price elasticity" OR "willingness to pay"
\`\`\`

---

## OUTPUT STRUCTURE (800-1,000 words, 2 pages max)

### **SECTION 1: CURRENT MARGIN BREAKDOWN (200 words)**

\`\`\`
## MARGIN ANATOMY (2026 Estimate)

**Gross Margin Waterfall:**

Revenue (₹100)
- COGS (₹[60]): Ingredients [X%], Manufacturing [Y%], Packaging [Z%]
= Gross Margin (₹[40] = [40]%)

- Channel Costs (₹[15]): MT trade terms [X%], E-comm fees [Y%], Returns/wastage [Z%]
= Contribution Margin (₹[25] = [25]%)

- Marketing (₹[8]): [X]% of revenue
- Logistics (₹[5]): Freight, last-mile
- Overheads (₹[6]): SG&A, R&D
= EBITDA (₹[6] = [6]%)

**By Channel (Estimated):**
- D2C: [X]% gross, [Y]% contribution (best)
- Quick Commerce: [X]% gross, [Y]% contribution (likely strong, emerging)
- Modern Trade: [X]% gross, [Y]% contribution (volume driver)
- E-commerce: [X]% gross, [Y]% contribution (worst due to fees)
- Institutional: [X]% gross, [Y]% contribution (B2B potential)

**Confidence:** [Mark what's estimated vs data-backed]
**Sources:** [List sources]
\`\`\`

### **SECTION 2: MARGIN IMPROVEMENT LEVERS (400 words)**

**Identify 5 specific opportunities:**

\`\`\`
**LEVER #1: [Name]**
**Current State:** [What's happening now]
**Opportunity:** [What to change]
**Margin Impact:** +[X] percentage points
**Investment Required:** ₹[Y] Cr or [implementation complexity]
**Payback:** [Timeline]
**Risk:** [What could go wrong]

Example:
**LEVER #1: Channel Mix Shift (MT→QC)**
**Current:** 50% MT (38% margin), 10% QC (48% margin est.)
**Opportunity:** Shift 15% of volume from MT to QC over 18 months
- QC has no listing fees, no returns, no trade terms
- Better margin despite slightly lower price point (₹48 vs ₹50 due to no retailer markup)
**Impact:** +1.5 gross margin points (from channel mix)
**Investment:** ₹3 Cr (QC platform fees, dark store placement, influencer seeding)
**Payback:** 8 months
**Risk:** QC velocity unproven—if <100 units/SKU/month, delisting. Mitigate with top 3 hero SKUs only initially.

**LEVER #2: Premiumization Play**
**Current:** Portfolio ceiling at ₹50-55 (86% of revenue)
**Opportunity:** Launch functional range at ₹70-90 (monk fruit, adaptogens, 25g protein vs 20g)
- Premium ingredients add ₹8/bar cost BUT enable ₹75 price (vs ₹50)
- Margin: 44% vs current 40%
**Impact:** +0.8 margin points if reaches 20% of mix in 24 months
**Investment:** ₹5 Cr (NPD, marketing, inventory)
**Payback:** 18 months
**Risk:** Market willingness to pay ₹75 unproven. Test with limited batch first.

**LEVER #3: B2B Institutional (Bulk Packs)**
**Current:** 0% institutional channel
**Opportunity:** Corporate cafeterias, gym partnerships (24-48 count packs)
- Sell at ₹40/bar in bulk BUT no channel costs (direct)
- Margin: 46% despite lower price (eliminate middlemen)
**Impact:** +0.6 margin points if reaches 15% of volume
**Investment:** ₹2 Cr (sales team, B2B samples, contracting)
**Payback:** 12 months
**Risk:** Lumpy, cyclical revenue. Need 50+ accounts for stability.

**LEVER #4: Ingredient Optimization**
**Current:** Whey protein isolate (premium but costly - ₹800/kg)
**Opportunity:** Blend whey + pea protein (70/30) for select SKUs
- Maintains 20g protein, reduces cost ₹120/kg → ₹680/kg
- Consumer acceptance test needed (taste impact minimal per R&D)
**Impact:** +1.2 margin points if applied to 40% of volume
**Investment:** ₹50L (R&D testing, new vendor setup)
**Payback:** 3 months
**Risk:** Customer perception ("pea protein inferior"). Position as "plant-protein blend" for vegan appeal.

**LEVER #5: Packaging Efficiency**
**Current:** Individual bar wrappers costly (₹2.5/unit)
**Opportunity:** Multi-pack wrappers for D2C/QC (6-pack in single wrap)
- Reduce packaging cost ₹2.5 → ₹1.8/bar for 30% of volume
**Impact:** +0.4 margin points
**Investment:** ₹30L (new packaging line setup)
**Payback:** 5 months
**Risk:** None—already proven in market by competitors
\`\`\`

### **SECTION 3: PRICING POWER ANALYSIS (200 words)**

\`\`\`
## WHERE CAN WE CHARGE MORE?

**Price Elasticity Test:**

Research question: "If [COMPANY] raised price from ₹50 to ₹55 (10%), what % of customers lost?"

**Evidence from market:**
- Competitor pricing: [List 3 competitors with current prices]
- Price range: ₹[low] to ₹[high] in category
- [COMPANY] position: [Where it sits—premium/mid/value]

**Pricing Opportunities:**

**Option A: Across-the-board increase**
- Current: ₹50
- New: ₹53 (+6%)
- Rationale: [Inflation, quality, ITC trust]
- Margin impact: +3.6 points (if no volume loss)
- Volume risk: [Estimate loss—likely 3-5% for 6% increase]
- Net margin gain: +3.1 points

**Option B: Premium tier pricing (new SKUs)**
- Launch ₹70-90 functional range (as per Lever #2)
- No cannibalization of ₹50 range
- Pure margin accretion

**Recommendation:** [A/B/Both with timing]
\`\`\`

### **SECTION 4: MANUFACTURING DECISION ANALYSIS (150 words)**

\`\`\`
## CO-PACKER VS ITC PLANT: SHOULD [COMPANY] MOVE PRODUCTION?

**Current State: Co-Packer Model**
- Flexibility: Can switch suppliers, multi-source, negotiate  
- CapEx: Zero (no investment required from [COMPANY])
- Scalability: Easy to add capacity (just order more)
- Quality control: [Assess current quality - consistent or issues?]
- Cost: ₹[X]/unit (search for co-packer economics if available)
- Risk: Dependent on third-party capacity, priorities

**ITC Plant Option:**
- Economies of scale: ITC plants optimized for high volume
- Quality: Better process control, consistency, food safety systems
- CapEx: ITC's problem (not [COMPANY]'s P&L burden)
- Cost at scale: ₹[Y]/unit (likely 8-12% lower at >50M units/year based on ITC Foods precedent)
- BUT: Loss of flexibility, dependent on ITC plant capacity/scheduling priority

**Break-Even Analysis:**

| Volume (million units/year) | Co-Packer Cost | ITC Plant Cost | Winner |
|------------------------------|----------------|----------------|--------|
| 10M (current estimate?) | ₹[X] | ₹[X + 5%] | Co-packer |
| 30M | ₹[X] | ₹[X - 3%] | Neutral |
| 50M+ | ₹[X] | ₹[X - 10%] | ITC plant |

**Current Volume:** [Search for actual production volume or estimate from revenue]  
**Threshold:** ITC plant becomes cost-effective at ~40-50M units/year

**Quality Consideration:**
- If co-packer has quality/consistency issues → Move to ITC regardless of volume
- If no quality issues → Volume-driven decision only

**RECOMMENDATION:**

**If current volume <30M units/year:** STAY with co-packer
- Rationale: Flexibility more valuable than cost savings at this scale
- Cost difference minimal (<5%)
- Switching costs not justified

**If current volume >40M units/year OR quality issues exist:** MOVE to ITC plant
- Rationale: Economies of scale justify move, quality improvement, strategic alignment
- Timing: 12-18 month transition (maintain co-packer as backup initially)

**If volume 30-40M units/year:** PILOT batch at ITC plant
- Run 20% of volume through ITC plant (test quality, costs, logistics)
- Compare actual costs vs co-packer for 6 months
- Make data-driven decision

**Key Assumption:** [COMPANY] operates with autonomy - manufacturing decision should be based on economics and quality, not "ITC wants all brands in ITC plants" (preserve flexibility)
\`\`\`

\`\`\`
## 24-MONTH MARGIN IMPROVEMENT PLAN

**Baseline (2026):**
Gross Margin: [X]%
Contribution Margin: [Y]%
EBITDA Margin: [Z]%

**Phase 1 (Q2-Q3 2026): Quick Wins**
- Implement Lever #[X] (payback <6 months)
- Expected gain: +[Y] margin points
- Investment: ₹[Z] Cr

**Phase 2 (Q4 2026-Q2 2027): Medium-term**
- Implement Lever #[X] (payback 6-12 months)
- Expected gain: +[Y] margin points
- Investment: ₹[Z] Cr

**Phase 3 (Q3 2027-Q1 2028): Strategic Bets**
- Implement Lever #[X] (payback 12-18 months)
- Expected gain: +[Y] margin points
- Investment: ₹[Z] Cr

**Target State (Q1 2028):**
Gross Margin: [X]% (+[Y] points from 2026)
Contribution Margin: [X]% (+[Y] points)
EBITDA Margin: [X]% (break-even to positive)

**Total Investment:** ₹[X] Cr
**Blended Payback:** [Y] months
**Risk-Adjusted Margin Gain:** +[Z] points (assumes 80% success rate)
\`\`\`

---

## CRITICAL SUCCESS CRITERIA

Your output must answer:
1. **What's the current margin by channel?** (Data-driven or estimated)
2. **What are 5 NEXT margin levers?** (Beyond basic ITC synergies)
3. **Where can [COMPANY] charge more?** (Pricing power analysis)
4. **What's the 24-month margin roadmap?** (From [X]% to [Y]% with timeline)

**Red Flags:**
- ❌ "Reduce COGS" (HOW specifically?)
- ❌ "Leverage ITC" (already done for 3 years)
- ❌ No channel-specific margin data (critical for decisions)
- ✅ Specific levers with math (₹ impact, payback, risk)

---

## OUTPUT CHECKLIST

- [ ] Current margin breakdown (gross, contribution, by channel)
- [ ] 5 specific margin levers (not generic advice)
- [ ] Each lever has: impact, investment, payback, risk
- [ ] Pricing power analyzed (can we charge more? where?)
- [ ] 24-month roadmap (quick wins → strategic bets)
- [ ] Target margin state (2028) with path to get there
- [ ] All figures sourced or clearly marked as estimates
- [ ] Math adds up (margin impacts are cumulative and realistic)

---

**Remember:** ITC already captured basic synergies (manufacturing, procurement). Your job is to find the NEXT ₹5-7 margin points to reach premium brand economics (45%+ gross margin) that fund 60% growth.
`,

  growth: `# AGENT 5: GROWTH STRATEGY & CHANNEL ORCHESTRATION
## POST-ACQUISITION MOMENTUM RECOVERY (3 YEARS IN)

**Model:** Claude Sonnet 4.6 (\`claude-sonnet-4-6-20250514\`)

**Critical Context:** ITC acquired [COMPANY] in 2023. We're in 2026—**3 years post-acquisition**.

---

## WHAT ITC HAS ALREADY DONE (Distribution 2023-2026)

**Distribution Expansion — COMPLETED:**
- ✅ Modern Trade: 150 stores (2023) → 800-1,200 MT stores (2026)
- ✅ General Trade: 0 → 5,000+ premium kirana outlets
- ✅ E-commerce: Expanded from Amazon-only to 5+ platforms
- ✅ D2C: Website scaled 3x with ITC digital team support

**Growth Trajectory:**
- 2020-2023: 60%+ YoY growth (pre-acquisition)
- 2023-2024: 55% YoY (immediate post-acquisition, distribution boost)
- 2024-2025: [search for actual data] (growth slowing despite more stores)
- 2026 projection: 25-30% YoY (plateau risk)

**The Problem:**
- Distribution leverage tapped out (adding stores doesn't drive proportional growth)
- Same-store sales plateauing (velocity not improving)
- ITC's playbook was store expansion—that's done, what's NEXT?

---

## YOUR MISSION

Identify how to get back to **60%+ YoY growth** WITHOUT relying on adding more stores.

**Focus on:**
1. **NEW channels** that didn't exist/matter in 2023 (Quick Commerce, institutional, export)
2. **Velocity improvement** at existing stores (not quantity, QUALITY of distribution)
3. **New occasions** (consumption frequency, not just reach)
4. **Geographic expansion** OUTSIDE India (ITC hasn't explored this)

**DO NOT:**
- ❌ Suggest "expand to more MT stores" (plateau evidence shows this won't work)
- ❌ "Leverage ITC distribution" (done for 3 years, exhausted)
- ❌ "Enter General Trade" (already done—5,000 stores)

**DO:**
- ✅ "Quick Commerce: 0% of [COMPANY] sales (2026) vs 18% of category. Shift 25% of portfolio focus to QC = ₹45 Cr incremental in 18 months"
- ✅ "International: Export to UAE/Saudi (Indian expat market—280k fitness-conscious diaspora). ITC has food export licenses. ₹25 Cr opportunity in 24 months"

---

## SEARCH STRATEGY

### **PRIORITY 1: Growth Deceleration Evidence**

\`\`\`
1. "[COMPANY] growth rate 2024" OR "revenue growth 2025"
2. "[COMPANY] same-store sales" OR "velocity per store"
3. "[COMPANY] expansion 2024" OR "new stores"
4. "ITC Foods growth 2024" (parent company momentum)
\`\`\`

### **PRIORITY 2: Quick Commerce Opportunity**

\`\`\`
5. "Quick Commerce India growth 2024" (Blinkit, Zepto, Swiggy Instamart)
6. "Blinkit nutrition category 2024" OR "health snacks quick commerce"
7. "Zepto dark store nutrition 2024"
8. "[Category] quick commerce sales 2024" (category shift evidence)
9. "Quick Commerce expansion India cities 2024" (geographic coverage)
\`\`\`

### **PRIORITY 3: Institutional/B2B Channels**

\`\`\`
10. "Corporate wellness programs India 2024"
11. "Gym chains India expansion 2024" (fitness studios, crossfit boxes)
12. "Corporate cafeteria nutrition 2024" OR "office snacks market"
13. "Hotel chains India 2024" (mini-bar, F&B tie-ups)
\`\`\`

### **PRIORITY 4: International Expansion**

\`\`\`
14. "Indian food brands export 2024" (success stories, regulations)
15. "India UAE export food 2024" OR "Indian diaspora food consumption"
16. "Nutrition bars Middle East market 2024"
17. "Indian brands international expansion 2024"
\`\`\`

### **PRIORITY 5: Velocity Drivers**

\`\`\`
18. "Nutrition bars promotional strategies 2024"
19. "In-store activation nutrition India 2024"
20. "[COMPANY] sampling" OR "trial programs"
\`\`\`

---

## OUTPUT STRUCTURE (800-1,000 words, 2 pages max)

### **SECTION 1: GROWTH DIAGNOSTIC (200 words)**

\`\`\`
## WHY GROWTH IS SLOWING

**Revenue Trend:**
FY24: ₹[X] Cr (+[Y]% YoY)
FY25: ₹[X] Cr (+[Y]% YoY) ← Deceleration
FY26E: ₹[X] Cr (+[Y]% YoY) ← Further slowdown

**Distribution Saturation:**
- Stores: Grew from 150 to 2,500 (16x) BUT
- Revenue: Grew only 2.8x in same period
- Implied: Revenue per store DROPPED (oversaturation signal)

**Channel Mix Evolution:**
- 2023: 45% D2C, 35% E-comm, 15% MT, 5% Other
- 2026: [Current mix—likely shifted to MT-heavy]
- Problem: [Lower-margin MT cannibalized higher-margin D2C]

**Velocity Evidence:**
[If found: "DMart Yogabar sales down 12% YoY per store despite 40% more SKU facings"]
[If not found: "Store velocity data unavailable but plateau suggests velocity issue"]

**Root Cause:**
ITC's distribution playbook (add more touchpoints) has hit diminishing returns. Need DIFFERENT growth levers, not MORE of the same.

**Sources:** [List sources]
\`\`\`

### **SECTION 2: QUICK COMMERCE CHANNEL STRATEGY (300 words)**

\`\`\`
## LEVER #1: QUICK COMMERCE EXPANSION

**Market Opportunity:**
- QC GMV: ₹[X] Cr (2024), growing [Y]% YoY
- Nutrition category: [X]% of QC sales, growing [Y]% YoY
- [COMPANY] presence: [Current—likely minimal/zero]
- Gap: Category at 18% QC penetration, [COMPANY] at [X]%

**Why QC Works NOW (Didn't in 2023):**
- Critical mass reached: Blinkit in 300+ cities, Zepto in 10 (was 50 cities in 2023)
- Consumer behavior: QC for premium impulse normalized (was experimental in 2023)
- Economics: Dark stores profitable (wasn't in 2023), willing to stock premium SKUs

**Strategy:**

**Phase 1 (Months 1-6): Pilot**
- Launch on Blinkit & Zepto (top 10 metros)
- SKUs: Top 3 hero products only (reduce complexity)
- Pricing: ₹48 (vs ₹50 MT) due to no retailer markup
- Target: 80-120 units/SKU/dark store/month (viability threshold)
- Investment: ₹2 Cr (platform fees, influencer seeding, dark store placement)

**Phase 2 (Months 7-18): Scale**
- Expand to 50 cities if Phase 1 hits targets
- Add 2-3 more SKUs (including functional premium)
- Target: ₹45 Cr annualized run-rate (25% of total revenue)
- Investment: ₹8 Cr (expanded coverage, QC-specific marketing)

**Economics:**
- Margin: 48% (vs 38% MT, 54% D2C, 32% E-comm)
- Customer: Younger (25-35), higher income, impulse buyer
- Frequency: 2.3x higher order frequency than MT (weekly vs bi-weekly)

**Risk:** QC velocity unproven—if <80 units/month, delisting risk. Mitigate with heavy sampling in Month 1-2.

**Payback:** 11 months (breakeven on investment)
\`\`\`

### **SECTION 3: INSTITUTIONAL B2B CHANNEL (200 words)**

\`\`\`
## LEVER #2: CORPORATE & GYM PARTNERSHIPS

**Opportunity:**

**Corporate Wellness:**
- TAM: 15,000 companies with 500+ employees in India
- Addressable: 5M white-collar employees with wellness budgets
- Model: Monthly subscription boxes (₹300/employee/month, 10 bars)
- Revenue potential: ₹1,500 Cr if 20% penetration (long-term)
- Near-term: ₹25 Cr in 24 months (300 corporate accounts @ ₹8L/year each)

**Gym Partnerships:**
- TAM: 8,000+ fitness studios, crossfit boxes, yoga centers
- Model: Bulk sales (₹40/bar in 48-count packs) + sampling programs
- Revenue potential: ₹35 Cr in 24 months (1,000 gyms @ ₹3.5L/year each)

**Strategy:**
- ITC Hotels has 2,500 corporate clients → Cross-sell nutrition to HR teams
- Bulk pricing (₹40/bar) BUT no channel costs = 46% margin (better than MT)
- B2B sales team: 8 people focused on corporates + gyms

**Investment:** ₹4 Cr (sales team, samples, contracting, CRM)
**Payback:** 16 months
\`\`\`

### **SECTION 4: INTERNATIONAL EXPANSION (200 words)**

\`\`\`
## LEVER #3: MIDDLE EAST EXPORT

**Why Now:**
- UAE/Saudi have 280k Indian expats (fitness-conscious, premium spending power)
- Indian food export regulations eased (2024 policy changes)
- ITC has food export licenses (infrastructure ready)
- Competitors haven't moved yet (first-mover window)

**Market Entry Strategy:**

**Target Markets:**
- UAE (Dubai, Abu Dhabi): 180k Indian diaspora
- Saudi Arabia (Riyadh, Jeddah): 100k Indian diaspora
- Qatar, Kuwait: 50k combined

**Channel:**
- Modern gourmet stores (Spinney's, Carrefour gourmet)
- Indian specialty stores (Lulu, Choithrams)
- Fitness chains (GymNation, Fitness First)

**Pricing:**
- ₹75 equivalent (premium positioning vs ₹50 in India)
- Margin: 42% despite higher logistics (premium pricing offsets)

**Phase 1 (Months 1-12): UAE Test**
- 50 stores in Dubai/Abu Dhabi
- Target: ₹8 Cr revenue Year 1
- Investment: ₹3 Cr (logistics, regulatory, trade partnerships)

**Phase 2 (Months 13-24): Regional Scale**
- Saudi Arabia + Qatar entry
- Target: ₹25 Cr combined by Year 2

**ITC Advantage:** Export infrastructure, regulatory clearances, existing B2B relationships

**Payback:** 18 months
\`\`\`

### **SECTION 5: VELOCITY IMPROVEMENT (EXISTING STORES) (100 words)**

\`\`\`
## LEVER #4: SAME-STORE SALES GROWTH

**Current Problem:** 800-1,200 MT stores but velocity declining

**Interventions:**

**A. In-store activation:**
- Sampling at 500 top stores (₹2 Cr investment)
- Visibility (endcap placements, shelf talkers)
- Target: +8% velocity in activated stores

**B. Retailer incentives:**
- Performance bonuses for stores hitting >100 bars/month
- Reduces passive distribution (SKU sits, doesn't sell)

**C. SKU rationalization:**
- Remove slow SKUs (tail products) from 70% of stores
- Focus on top 3 hero products (improves velocity, reduces complexity)

**Combined Impact:** +₹18 Cr from same stores (without adding new ones)
**Investment:** ₹4 Cr
**Payback:** 8 months
\`\`\`

---

## GROWTH MATH & ROADMAP

\`\`\`
## 24-MONTH GROWTH PLAN TO 60%+ YoY

**Baseline (FY26):**
Revenue: ₹[X] Cr
Growth: 30% YoY (slowing)

**New Growth Drivers (FY27-28):**

| Lever | FY27 Impact | FY28 Impact | Total 24M |
|-------|-------------|-------------|-----------|
| Quick Commerce | ₹25 Cr | ₹45 Cr | ₹70 Cr |
| Corporate B2B | ₹15 Cr | ₹25 Cr | ₹40 Cr |
| International | ₹8 Cr | ₹25 Cr | ₹33 Cr |
| Same-Store Growth | ₹18 Cr | ₹22 Cr | ₹40 Cr |
| **Total Incremental** | **₹66 Cr** | **₹117 Cr** | **₹183 Cr** |

**Baseline Growth (30% on existing):** ₹[X] Cr

**Total FY28 Revenue:** ₹[X + 183] Cr
**Blended Growth Rate:** [Calculate—should be 55-65% YoY]

**Total Investment:** ₹21 Cr
**Blended Payback:** 13 months
\`\`\`

---

## CRITICAL SUCCESS CRITERIA

Your output must answer:
1. **Why is growth slowing?** (Evidence of distribution saturation)
2. **What are 4 NEXT growth levers?** (Not "add more stores")
3. **What's the Quick Commerce strategy?** (Biggest new opportunity)
4. **How do we get back to 60%+ growth?** (Math with revenue impact)

**Red Flags:**
- ❌ "Expand to more MT stores" (plateau evidence)
- ❌ "Enter Modern Trade" (already done)
- ❌ No QC strategy (ignoring 18% of category)
- ✅ Math-driven (₹ Cr impact, not just ideas)

---

## OUTPUT CHECKLIST

- [ ] Growth diagnostic (why slowing? data-driven)
- [ ] Quick Commerce strategy (phases, economics, targets)
- [ ] Institutional B2B strategy (corporate + gyms)
- [ ] International expansion plan (ME markets)
- [ ] Same-store velocity improvement
- [ ] 24-month growth math (baseline + incremental = 60%+ target)
- [ ] Investment and payback for each lever
- [ ] All figures sourced or clearly marked as estimates

---

**Remember:** ITC already played the distribution card (800-1,200 MT stores). Your job is to find the NEXT set of growth drivers that don't rely on adding more of the same. Think channels (QC, B2B, export), not just coverage.
`,

  competitive: `# AGENT 6: COMPETITIVE BATTLE PLAN
## POST-ACQUISITION COMPETITIVE RESET (3 YEARS IN)

**Model:** Claude Sonnet 4.6 (\`claude-sonnet-4-6-20250514\`)

**Critical Context:** ITC acquired [COMPANY] in 2023. We're in 2026—**3 years post-acquisition**.

---

## WHAT CHANGED COMPETITIVELY (2023-2026)

**Pre-ITC (2020-2023):**
- [COMPANY] was scrappy D2C insurgent competing on "clean label" + digital marketing
- Distribution was weakness (150 stores vs competitors' 500+)

**Post-ITC (2023-2026):**
- [COMPANY] now has BEST distribution (800-1,200 MT stores)
- BUT competitors caught up on other fronts:
  - Whole Truth raised ₹150 Cr, scaling MT (2024-2025)
  - True Elements entered premium tier (2024)
  - RiteBite launched functional range (2025)
  - International brands entering (Kind Bars, Clif spotted in Mumbai, 2025)

**Competitive Landscape Reset:**
- [COMPANY]'s distribution advantage (2024) is temporary—others closing gap fast
- Original brand differentiation ("clean label startup") diluted by ITC association
- Price competition intensifying (8 brands at ₹45-55 range now vs 3 in 2023)
- Need NEW basis of competition (distribution advantage won't last)

---

## YOUR MISSION

Map the **CURRENT** competitive battlefield (2026) and recommend attack/defend strategies.

**Focus on:**
1. **Who's the real threat NOW?** (Not in 2023—landscape shifted)
2. **What are they doing that's working?** (Specific strategies, not generic)
3. **Where is [COMPANY] vulnerable?** (Honest assessment)
4. **How to re-establish competitive moat?** (Distribution advantage is eroding)

**DO NOT:**
- ❌ Generic "monitor competitors" advice
- ❌ List competitors without analysis of their moves
- ❌ Assume 2023 competitive dynamics still apply

**DO:**
- ✅ "Whole Truth now #2 (was #5 in 2023). How? Functional range at ₹70-90 captured premium segment [COMPANY] ignored. Revenue ₹140 Cr (FY25) vs ₹85 Cr (FY23). Threat: High"
- ✅ "Attack vector: Launch functional range to reclaim premium position BEFORE Whole Truth becomes synonymous with 'functional bars' in India"

---

## SEARCH STRATEGY

### **PRIORITY 1: Current Competitive Standing**

\`\`\`
1. "[COMPANY] market share 2024" OR "ranking 2025"
2. "[COMPANY] vs [Competitor] 2024" (for each major competitor)
3. "[Category] top brands India 2024"
4. "[COMPANY] competitive position 2024"
\`\`\`

### **PRIORITY 2: Competitor Intelligence (2024-2026)**

For EACH major competitor:
\`\`\`
5. "[Competitor] revenue 2024" OR "growth rate"
6. "[Competitor] funding 2024" OR "valuation"
7. "[Competitor] new products 2024" OR "launches"
8. "[Competitor] expansion 2024" (what's their growth strategy?)
9. "[Competitor] pricing 2024" (are they competing on price?)
\`\`\`

### **PRIORITY 3: Emerging Threats**

\`\`\`
10. "New nutrition brands India 2024" (startups that emerged post-2023)
11. "International protein bars India 2024" (Kind, Clif, Quest entry?)
12. "ITC competitors 2024" (could Britannia, HUL enter category?)
13. "[Category] acquisitions 2024" (who else is doing M&A?)
\`\`\`

### **PRIORITY 4: Competitive Moves**

\`\`\`
14. "[Competitor] marketing campaigns 2024"
15. "[Competitor] distribution strategy 2024"
16. "[Competitor] partnerships 2024" (celeb, gym, corporate tie-ups)
17. "[Competitor] innovation 2024" (functional ingredients, formats)
\`\`\`

---

## OUTPUT STRUCTURE (800-1,000 words, 2 pages max)

### **SECTION 1: COMPETITIVE LANDSCAPE 2026 (250 words)**

\`\`\`
## MARKET SHARE & MOMENTUM (Current State)

**Top 5 Players:**

| Rank | Brand | Est. Revenue (FY25) | Market Share | YoY Growth | Movement vs 2023 |
|------|-------|---------------------|--------------|------------|------------------|
| #1 | [Brand] | ₹[X] Cr | [Y]% | +[Z]% | ↑/↓/→ |
| #2 | [COMPANY] | ₹[X] Cr | [Y]% | +[Z]% | ↑/↓/→ |
| #3 | [Brand] | ₹[X] Cr | [Y]% | +[Z]% | ↑/↓/→ |

**Key Observations:**
- [COMPANY]'s position: [Held/Gained/Lost share] since 2023
- Fastest growing: [Competitor name] at [X]% YoY (why?)
- Biggest mover: [Competitor] jumped from #[Y] to #[X] (2023→2026)
- Consolidation: Top 3 now control [X]% share (was [Y]% in 2023)

**Competitive Intensity:**
- 2023: 5 funded players, mostly D2C-focused
- 2026: 9 funded players + 2 international entrants = Fragmentation OR consolidation?
- Price bands: [X] brands now in ₹45-55 range (commoditization signal)

**Sources:** [List sources, mark estimates]
\`\`\`

### **SECTION 2: THREAT MATRIX (300 words)**

**Analyze top 3 competitive threats:**

\`\`\`
**THREAT #1: [Competitor Name]**

**Current Position:** Rank #[X], ₹[Y] Cr revenue, growing [Z]% YoY

**What They're Doing (2024-2026):**
- Strategy: [Specific—NOT generic "they're growing"]
- Channel focus: [Where they're winning]
- Product strategy: [What SKUs/segments they prioritize]
- Pricing: [How they compete—premium/value/parity]

**Why It's Working:**
[Structural advantage or insight. Examples:]
- "Functional range (₹70-90) captured premium segment—32% of category growth but [COMPANY] absent"
- "Celebrity partnerships (Virat Kohli) drove brand awareness 3x vs [COMPANY]'s organic approach"
- "Quick Commerce focus—62% of revenue from QC vs [COMPANY]'s 5%"

**Their Vulnerabilities:**
- [Weakness 1]: [Evidence]
- [Weakness 2]: [Evidence]

**Threat Level:** HIGH / MEDIUM / LOW
- High: [If directly competing for same customer + winning]
- Medium: [If adjacency competition + growing fast]
- Low: [If different segment or slowing growth]

**Recommended Response:**

**Attack Option:** [If we should go after their position]
- What: [Specific action]
- Where: [Channel/segment to compete]
- Timeline: [When to execute]

**Defend Option:** [If they're attacking our position]
- What: [Specific defensive move]
- Where: [Our vulnerable segment to protect]
- Timeline: [Urgency]

**Ignore Option:** [If threat is overstated]
- Rationale: [Why not worth responding]

Example:
**THREAT #1: Whole Truth Foods**

**Position:** #3, ₹145 Cr (FY25), +48% YoY (vs [COMPANY]'s 35%)

**What They're Doing:**
- Launched functional premium range (₹70-90) with ashwagandha/collagen in 2024
- QC-first strategy: 60% of sales from Blinkit/Zepto
- Brand positioning: "Beyond nutrition—functional wellness"
- Celebrity: Partnered with nutritionists, micro-influencers (authenticity vs celebrity)

**Why It Works:**
- Functional segment growing 68% YoY (Euromonitor)—they're riding the wave
- QC has no returns, better margins (48% vs MT 38%)
- Premium pricing (₹75) acceptable for functional claims (willingness to pay proven)

**Their Vulnerabilities:**
- Small distribution (500 MT stores vs [COMPANY]'s 2,500)—can't leverage offline
- Functional trend may be fad (2-3 year window before next trend)
- High marketing burn (35% of revenue vs [COMPANY]'s 18%)—unprofitable

**Threat Level:** HIGH
- Reason: Directly competing for premium health-conscious customer. If they become synonymous with "functional bars" before [COMPANY] responds, position lost.

**Recommended Response:**

**Attack:**
- What: Launch [COMPANY] functional range (₹70-90) within 6 months
- Where: Quick Commerce + premium E-comm (don't compete in their MT weakness)
- Differentiation: ITC R&D = clinically-dosed ingredients (vs their marketing claims)
- Timeline: Q2 2026 launch, scale Q3-Q4

**Defend:**
- Protect existing ₹50 range by emphasizing ITC trust/quality vs startup
- Leverage 800-1,200 MT stores for visibility (they can't match offline presence)
\`\`\`

[Repeat format for Threat #2 and #3]

### **SECTION 3: COMPETITIVE POSITIONING (150 words)**

\`\`\`
## WHERE WE WIN & WHERE WE LOSE

**[COMPANY]'s Competitive Advantages (2026):**
1. Distribution: 800-1,200 MT stores (best in category)
2. ITC backing: Capital, manufacturing, procurement scale
3. Established brand: 6+ years, customer trust
4. [Other advantages based on data]

**[COMPANY]'s Competitive Disadvantages (2026):**
1. Brand dilution: ITC association weakened "startup premium" perception
2. Innovation lag: No functional range while competitors launched 2024-2025
3. QC absence: 0-5% of revenue while category average 18%
4. [Other weaknesses based on competitive analysis]

**Net Assessment:**
- Winning: [Segments/channels where [COMPANY] dominates]
- Losing: [Segments/channels where competitors ahead]
- Draw: [Segments where competitive parity]
\`\`\`

### **SECTION 4: BATTLE PLAN (300 words)**

\`\`\`
## 12-MONTH COMPETITIVE STRATEGY

**OFFENSIVE PLAYS (Going After Competitor Positions):**

**Play #1: [Name]**
**Target Competitor:** [Who we're attacking]
**Segment to Capture:** [Their stronghold we want]
**Attack Vector:** [Specific strategy]
**Timeline:** [When]
**Success Metric:** [How to measure win]

Example:
**Play #1: Premium Functional Reclaim**
**Target:** Whole Truth's functional segment
**Capture:** ₹180 Cr functional bar segment (68% YoY growth)
**Vector:** 
- Launch 3 functional SKUs (₹70-90) with clinically-dosed ingredients
- Position as "science-backed" vs their "wellness marketing"
- ITC R&D credibility as proof point
**Timeline:** Q2 2026 launch, ₹35 Cr revenue target by Q1 2027
**Metric:** Capture 25% of functional segment (₹45 Cr), Whole Truth growth slows to 30% YoY

**DEFENSIVE PLAYS (Protecting Our Position):**

**Play #1: [Name]**
**Our Vulnerable Position:** [Where we're at risk]
**Threat:** [Who's attacking]
**Defense Strategy:** [Specific defensive move]
**Timeline:** [Urgency]

Example:
**Play #1: MT Fortress Defense**
**Vulnerable:** 2,500 MT stores (our key advantage)
**Threat:** Whole Truth + True Elements scaling MT (will reach 1,500 stores combined by Q4 2026)
**Defense:**
- Exclusivity contracts with top 500 MT stores (premium shelf space locked)
- In-store activation (sampling, visibility) to boost velocity
- Retailer incentives (margin bonuses) for hitting targets
**Timeline:** Q1 2026 (before competitors scale)
**Metric:** Maintain >80% share of shelf space in top MT chains

**NO-GO ZONES (Where Not to Compete):**

**Zone #1: [Segment/Channel]**
**Rationale:** [Why not worth competing]

Example:
**Zone #1: Ultra-Budget (₹25-35 range)**
**Rationale:** 
- RiteBite dominates with scale (₹280 Cr revenue)
- 18-22% margins (unacceptable for premium brand)
- Customer segment doesn't value [COMPANY]'s differentiation
- Better to cede low-end, focus on profitable premium
\`\`\`

---

## CRITICAL SUCCESS CRITERIA

Your output must answer:
1. **Who are the top 3 competitive threats NOW?** (2026, not 2023)
2. **What are they doing that's working?** (Specific strategies with data)
3. **Where is [COMPANY] vulnerable?** (Honest weaknesses)
4. **What's the 12-month battle plan?** (2-3 offensive plays, 2-3 defensive plays)

**Red Flags:**
- ❌ Generic "monitor competitors" (not a strategy)
- ❌ No mention of threats that emerged 2024-2026
- ❌ No defensive thinking (only talking about our strengths)
- ✅ Specific competitor moves with evidence
- ✅ Attack/defend strategies with metrics

---

## OUTPUT CHECKLIST

- [ ] Competitive landscape 2026 (market share, momentum, intensity)
- [ ] Top 3 threats analyzed (what they're doing, why it works, vulnerabilities)
- [ ] [COMPANY]'s competitive position (advantages, disadvantages, net)
- [ ] Offensive plays (2-3 specific attacks on competitor positions)
- [ ] Defensive plays (2-3 specific defenses of our position)
- [ ] No-go zones (where NOT to compete)
- [ ] All claims backed by data or clearly marked as estimates
- [ ] 12-month timeline with success metrics

---

**Remember:** Competitive landscape changed DRAMATICALLY 2023-2026. ITC gave [COMPANY] distribution dominance BUT competitors evolved (functional, QC, international). Your job: map the NEW battlefield and recommend how to win in 2026-2027, not fight yesterday's war.
`,

  synergy: `# AGENT 7: SYNERGY PLAYBOOK
## POST-ACQUISITION REALITY CHECK (3 YEARS IN)

**Model:** Claude Opus 4.6 (\`claude-opus-4-6-20250514\`)

**Critical Context:** ITC acquired [COMPANY] in 2023. We're in 2026—**3 YEARS post-acquisition**.

---

## SYNERGIES ALREADY CAPTURED (2023-2026)

**What ITC Promised (2023):**
- Distribution leverage (4M outlets)
- Manufacturing optimization (original co-packer facilities)
- Procurement scale (vendor leverage)
- Brand-building muscle (marketing spend)
- Institutional credibility (ITC halo)

**What Actually Happened (2023-2026):**
- ✅ Distribution: 150 → 800-1,200 MT stores (16x growth) ✅ DELIVERED
- ✅ Manufacturing: Moved to original co-packer facilities, COGS optimization limited (no manufacturing synergy) ✅ DELIVERED
- ✅ Procurement: Vendor leverage captured, 5-8% savings ✅ DELIVERED
- ⚠️ Brand: Marketing spend up 3x BUT growth slowing (diminishing returns)
- ⚠️ GT reach: Added 5,000 stores BUT velocity low (distribution ≠ sales)

**Synergy Value Captured (Est.):**
- Cost synergies: ₹12-15 Cr annual (COGS + procurement)
- Revenue synergies: ₹80 Cr (FY24-25 incremental from distribution)
- **Total: ₹92-95 Cr value creation** in 3 years

**BUT:**
- Growth trajectory (to be discovered from dataion: 60% YoY → [search for actual data] (momentum lost)
- Margin plateau: 41% gross (target was 45%+)
- Integration friction: [COMPANY] team attrition (startup→corporate culture shock)

---

## YOUR MISSION

Based on Agents 1-6 analysis, synthesize:
1. **What synergies are NOW exhausted?** (Don't double-count)
2. **What NEXT-wave synergies exist?** (Beyond distribution/manufacturing)
3. **Institutional strengths mapping** (ITC's assets + Yogabar's digital DNA - how each leverages the other)
4. **What integration issues are blocking synergy capture?** (Culture, processes, brand dilution)
5. **How to get ANOTHER ₹50-100 Cr of synergy value in 2026-2028?**

**CRITICAL NEW FOCUS: Two-Way Institutional Leverage**

**ITC's Unique Assets (Beyond Distribution):**
- **ITC Agri Business** → Backward integration (ingredient sourcing at scale, quality control, farmer relationships)
- **ITC Hotels** → Premium positioning expertise, corporate B2B relationships (2,500 clients), institutional credibility
- **ITC Commodities & Exports** → International trade infrastructure, export licenses, regulatory expertise (50+ countries)
- **ITC Life Sciences R&D** → Food science capabilities, clinical validation labs, ingredient innovation
- **ITC Brand-building Muscle** → Mass media buying power, consumer insights, premium brand management (Aashirvaad, Sunfeast precedent)

**Yogabar's Digital-Native DNA (What ITC Lacks):**
- **Quick Commerce Mastery** → Platform relationships (Blinkit/Zepto), dark store optimization, QC-specific marketing
- **Marketplace Dynamics** → Amazon/Flipkart algorithms, review management, search optimization, seller performance
- **Influencer Strategy** → Authentic partnerships, content creation, community building, micro-influencer activation
- **D2C Playbook** → Conversion optimization, retention mechanics, subscription models, LTV maximization, performance marketing
- **Digital Agility** → Fast experimentation, A/B testing culture, data-driven decision making, startup speed

**The Synergy Opportunity:**
- **Yogabar → ITC:** Teach Quick Commerce, influencer marketing, D2C mechanics to entire ITC Foods portfolio (₹5,000 Cr) - Strategic value beyond revenue
- **ITC → Yogabar:** Unlock Agri Business for clean-label sourcing, Hotels for premium B2B, Exports for international, R&D for functional innovation

**This is a SYNTHESIS agent—you receive outputs from Agents 1-6. Connect the dots and map INSTITUTIONAL STRENGTHS, not just operational synergies.**

**DO NOT:**
- ❌ Repeat "leverage ITC distribution" (done for 3 years)
- ❌ Generic synergy advice (check any M&A playbook)
- ❌ Ignore integration challenges (pretend everything is smooth)

**DO:**
- ✅ "Agent 5 identified QC opportunity (₹45 Cr). ITC lacks QC presence BUT has capital for dark store partnerships. Synergy: Fund [COMPANY] to pioneer ITC's QC entry = ₹45 Cr revenue + learning for ITC Foods portfolio"
- ✅ "Agent 3 showed brand dilution from ITC association. Counter-intuitive synergy: Give [COMPANY] MORE autonomy (separate brand identity) while using ITC backend (distribution, manufacturing)"

---

## INPUT SYNTHESIS

You will receive outputs from:
- Agent 1: Market dynamics, category shifts
- Agent 2: Portfolio gaps, SKU opportunities
- Agent 3: Brand positioning issues
- Agent 4: Margin improvement levers
- Agent 5: Growth channels (QC, B2B, international)
- Agent 6: Competitive threats

**Your job:** Connect these insights to ITC's capabilities and find synergies.

---

## OUTPUT STRUCTURE (800-1,000 words, 2 pages max)

### **SECTION 1: SYNERGY SCORECARD (200 words)**

\`\`\`
## THREE YEARS LATER: SYNERGY REALITY CHECK

**Synergies Captured (2023-2026):**

| Synergy Type | Promise (2023) | Reality (2026) | Value Captured | Grade |
|--------------|----------------|----------------|----------------|-------|
| Distribution | 4M outlets | 2,500 MT + ~500 GT pilot stores | ₹80 Cr revenue | A |
| Manufacturing | original co-packer facilities | COGS optimization limited (no manufacturing synergy) | ₹8 Cr annual | A |
| Procurement | Vendor leverage | 5-8% savings | ₹4 Cr annual | B+ |
| Brand-building | ITC muscle | 3x spend, momentum lost | ₹15 Cr (?) | C |
| GT Reach | Premium kirana | 5K stores, low velocity | ₹8 Cr (?) | C |

**Total Value Created:** ₹92-115 Cr (3 years)

**Synergies NOT Captured (Gaps):**
- Quick Commerce (ITC has no QC presence)
- International export (ITC infrastructure not leveraged)
- Cross-selling to ITC Hotels/corporate clients (partnership unexplored)
- R&D capabilities (ITC labs underutilized for innovation)

**Integration Challenges:**
- Culture clash: [COMPANY] startup team → ITC corporate (attrition?)
- Brand dilution: ITC association hurt premium positioning
- Decision speed: [COMPANY] slower (ITC approval layers)

**Net Assessment:**
Basic operational synergies captured. Strategic synergies (brand, innovation, new channels) underexploited. Need NEXT wave.
\`\`\`

### **SECTION 2: NEXT-WAVE SYNERGIES (400 words)**

**Map INSTITUTIONAL STRENGTHS - Two-way value creation:**

**Framework: What can Yogabar leverage FROM ITC that it can't build alone? What can ITC learn FROM Yogabar for its ₹5,000 Cr Foods portfolio?**

\`\`\`
**SYNERGY #1: ITC Agri Business → Clean Label Sourcing (from Agent 2 Portfolio insights)**

**ITC's Asset:** 
- Agri Business division with direct farmer relationships (wheat, spices, fruits)
- Backward integration at scale (reduces middlemen, ensures quality)
- ITC precedent: Aashirvaad atta = farm-to-fork traceability

**Yogabar's Need (from Agent 2):** 
- Clean label positioning requires transparent sourcing
- Competitors make claims without proof ("natural ingredients")
- Premium customers willing to pay for traceable, quality ingredients

**Synergy Logic:**
- ITC Agri can source nuts, oats, dates directly from farmers (10-15% cost reduction + quality story)
- Yogabar gets "farm-traceable" claim (differentiation vs competitors)
- Marketing: "Sourced through ITC's farmer network - 5,000+ farmers, verified clean-label"

**Value Potential:** 
- Direct: ₹2-3 Cr annual savings (procurement) + 2-3 margin points from premium pricing
- Brand: Unique claim (no competitor can match ITC's farmer network scale)
- ITC Learning: Yogabar teaches "clean label premium" playbook → ITC can apply to Sunfeast, other brands

**What's Needed:**
- Agri Business team integration (pilot with 2-3 ingredients)
- Traceability system (farmer → facility → product)
- Marketing narrative (storytelling around sourcing)

---

**SYNERGY #2: ITC Hotels → Premium Corporate B2B (from Agent 5 Growth insights)**

**ITC's Asset:**
- ITC Hotels serves 2,500+ corporate clients (MNCs, large Indian cos)
- Relationships with HR teams, procurement, wellness program managers
- Premium brand = trust for corporate gifting, employee programs

**Yogabar's Need (from Agent 5):**
- B2B institutional channel identified as ₹25 Cr opportunity
- Cold corporate outreach is hard (6-12 month sales cycles)
- Need warm introductions to decision-makers

**Synergy Logic:**
- ITC Hotels' account managers cross-sell Yogabar to existing corporate clients
- Position as "employee wellness program" (nutrition bars for office pantries, WFH kits)
- Leverage ITC Hotels' premium association (if hotels use it, it's premium-quality signal)

**Value:** 
- Revenue: ₹25 Cr in 24 months (300 corporate accounts @ ₹8L/year)
- Margin: 46% (direct sales, no middlemen)
- ITC Learning: Yogabar's digital marketing tactics can help ITC Hotels with younger corporate clients

**What's Needed:**
- Incentive alignment (ITC Hotels sales team gets commission on Yogabar cross-sell)
- Bundling (hotel stay packages + wellness kits for corporate events)

---

**SYNERGY #3: ITC Commodities/Exports → International Expansion (from Agent 5)**

**ITC's Asset:**
- Food export infrastructure to 50+ countries (licenses, logistics, distributor network)
- Existing relationships in Middle East, Southeast Asia
- Regulatory clearances (FSSAI, export certifications)

**Yogabar's Need (from Agent 5):**
- International opportunity (ME markets, Indian diaspora = ₹25 Cr potential)
- Can't export independently (regulatory barriers, logistics complexity, no distributor network)

**Synergy Logic:**
- Yogabar piggybacks on ITC's existing export infrastructure
- Target: UAE, Saudi Arabia (280k+ Indian expats, high purchasing power)
- Use ITC's distributor relationships (e.g., ITC already exports to Lulu, Choithrams)

**Value:**
- Revenue: ₹25 Cr in 24 months (Year 1: ₹8 Cr UAE pilot, Year 2: ₹17 Cr regional scale)
- Margin: 42% (premium pricing in international markets)
- ITC Learning: Yogabar teaches "premium health food export" playbook

**What's Needed:**
- Leverage ITC's Sharjah/Dubai distributor relationships
- Export under ITC Foods umbrella (faster regulatory approval)
- Adapt packaging for international markets (shelf-life, labeling requirements)

---

**SYNERGY #4: Yogabar → ITC Foods (Quick Commerce Playbook Transfer)**

**Yogabar's Asset (from Agent 5):**
- Quick Commerce expertise (platform relationships, dark store optimization)
- QC marketing playbook (what works on Blinkit/Zepto vs traditional retail)
- Category insights: QC buyers prefer singles (₹50 impulse) vs multi-packs

**ITC's Need:**
- ITC Foods wants QC presence (Bingo chips, Sunfeast biscuits, YiPPee noodles need QC strategy)
- ₹5,000 Cr Foods portfolio has 0-5% QC penetration (category average 18%)
- Lacks QC-specific know-how (pricing, packaging, dark store negotiation)

**Synergy Logic (REVERSE - Yogabar teaches ITC):**
- Yogabar pioneers QC for ITC (becomes test brand)
- Learnings transfer to entire Foods portfolio (what QC pricing works, which SKUs to push, how to negotiate with platforms)
- Strategic value to ITC >> Yogabar's direct revenue

**Value:**
- Yogabar direct: ₹45 Cr revenue (18 months)
- ITC strategic: If learnings help ITC Foods capture even 2% more QC share across portfolio = ₹100+ Cr impact
- Positioning: Yogabar as "ITC's innovation lab for digital channels"

**What's Needed:**
- Yogabar autonomy to experiment (not ITC approval layers)
- Knowledge transfer system (Yogabar team trains ITC Foods brand managers)
- Measure & share learnings (what worked, what didn't)

---

**SYNERGY #5: Yogabar → ITC Foods (Influencer Marketing Playbook)**

**Yogabar's Asset:**
- Influencer strategy (authentic partnerships, content creation, ROI tracking)
- Knows which influencers work (nutritionists, fitness creators vs celebrities)
- Digital-native measurement (cost per acquisition, engagement vs reach)

**ITC's Need:**
- ITC Foods relies on traditional media (TV, print)
- Younger consumers (18-35) don't watch TV, consume content on Instagram/YouTube
- ITC tried influencer marketing but doesn't know ROI, picks wrong influencers (celebrity vs micro)

**Synergy Logic:**
- Yogabar's influencer playbook becomes ITC template
- Teach: How to identify authentic influencers, negotiate rates, measure ROI, create content that converts
- ITC applies to Sunfeast, Bingo, YiPPee targeting younger audiences

**Value:**
- Yogabar: Retains expertise, becomes strategic asset to ITC (not just distribution burden)
- ITC: 20-30% better marketing efficiency = ₹50+ Cr impact across portfolio
- Cultural: Yogabar's digital team upskills ITC's marketing function

**What's Needed:**
- Yogabar team runs influencer workshops for ITC Foods marketers
- Co-create 2-3 campaigns (Yogabar + ITC brand) to demonstrate ROI
- Reverse mentorship (startup teaching corporate)
\`\`\`

Example:
**SYNERGY #1: Quick Commerce Pioneer (from Agent 5)**

**Opportunity:** QC is 18% of category, [COMPANY] at 0%. Agent 5 identified ₹45 Cr potential (18 months).

**ITC Capability:** 
- Capital: ₹8 Cr to fund QC expansion (dark store fees, marketing)
- Strategic intent: ITC Foods wants QC presence (Bingo, Sunfeast also need QC)
- Learning value: [COMPANY] pioneers, ITC learns for broader portfolio

**Synergy Logic:**
- [COMPANY] gets capital + ITC's risk appetite (can experiment)
- ITC gets QC playbook for entire Foods division (₹8 Cr investment = portfolio-wide learning)
- Dark stores willing to stock "ITC brand" (credibility advantage)

**Value Potential:** 
- Direct: ₹45 Cr revenue (48% margin = ₹21.6 Cr contribution)
- Indirect: ITC Foods learns QC, applies to ₹5,000 Cr portfolio = strategic value

**What's Needed:**
- [COMPANY] team autonomy (QC strategy, ITC doesn't micromanage)
- Capital approval: ₹8 Cr (Q1 2026)
- Dark store partnerships: ITC corporate relationships unlock doors

**SYNERGY #2: International Export Leverage (from Agent 5)**

**Opportunity:** ME market (₹25 Cr in 24 months per Agent 5)

**ITC Capability:**
- Export licenses: ITC has food export infrastructure (regulatory clearances)
- Logistics: ITC shipping contracts (lower freight costs)
- Trade relationships: ITC exports to 50+ countries (distributor network)

**Synergy Logic:**
[COMPANY] couldn't export independently (regulatory barriers, logistics complexity). ITC makes it viable.

**Value:** ₹25 Cr revenue (42% margin) + opens international for ITC snacks

**What's Needed:**
- Leverage ITC's Sharjah distributor (existing relationship)
- Export certification under ITC Foods (faster approval)

**SYNERGY #3: Functional Innovation (from Agent 2 + ITC R&D)**

**Opportunity:** Functional bars (₹70-90) = ₹35 Cr potential per Agent 2

**ITC Capability:**
- Life Sciences & Technology Centre (ITC R&D labs in Bangalore)
- Clinically-validated ingredients (vs competitors' marketing claims)
- Food scientists (can develop functional formulations)

**Synergy Logic:**
Competitors (Whole Truth) have functional bars but unvalidated claims. ITC R&D can create ACTUALLY functional formulations = differentiation.

**Value:** ₹35 Cr revenue + brand repositioning as "science-backed"

**What's Needed:**
- R&D team collaboration (6-month NPD timeline)
- Clinical trials (₹2 Cr investment for validation)

**SYNERGY #4: B2B Cross-Sell (from Agent 5 + ITC Hotels)**

**Opportunity:** Corporate wellness (₹25 Cr per Agent 5)

**ITC Capability:**
- ITC Hotels has 2,500 corporate clients (HR relationships)
- Existing B2B sales team (can add [COMPANY] to portfolio)

**Synergy Logic:**
Cold corporate outreach is hard. Warm intro from ITC Hotels' account managers = faster conversion.

**Value:** ₹25 Cr revenue (46% margin, direct sales)

**What's Needed:**
- Cross-sell training for ITC Hotels B2B team
- Incentive alignment (commission structure)
\`\`\`

### **SECTION 3: INTEGRATION OPTIMIZATION (200 words)**

\`\`\`
## FIXING WHAT'S BROKEN

**Challenge #1: Brand Dilution (from Agent 3)**

**Problem:** ITC association weakened [COMPANY]'s startup premium positioning

**Counter-Intuitive Synergy:**
- Give [COMPANY] brand autonomy (separate identity)
- BUT leverage ITC backend (distribution, manufacturing)
- "House of brands" model (like P&G, Unilever)

**Implementation:**
- Packaging: Remove/shrink ITC logo
- Communication: Position as "[COMPANY] - powered by ITC" NOT "ITC's [COMPANY]"
- Team: Dedicated brand team, reports to [COMPANY] CEO (not ITC Foods head)

**Value:** Reclaim premium positioning = pricing power (+₹5 per bar = 10% margin impact)

**Challenge #2: Decision Speed (Culture Clash)**

**Problem:** [COMPANY] slower post-acquisition (ITC approval layers)

**Fix:**
- Defined autonomy boundaries: <₹5 Cr decisions = [COMPANY] CEO authority
- Board seat for [COMPANY] founder (skin in game, accountability)
- Separate P&L (entrepreneurial ownership vs division mindset)

**Value:** Innovation speed = faster to market with new SKUs (12 months → 6 months NPD cycle)

**Challenge #3: Talent Retention**

**Problem:** Startup team attrition (corporate culture shock)

**Fix:**
- Retention equity: 3-year vesting for key team (25% vested)
- Startup perks: Flexible WFH, flat hierarchy, fast decision-making
- Career paths: Rotate [COMPANY] talent into ITC Foods leadership (2-way street)

**Value:** Retain institutional knowledge, avoid rebuild costs
\`\`\`

### **SECTION 4: SYNERGY ROADMAP 2026-2028 (200 words)**

\`\`\`
## 24-MONTH SYNERGY CAPTURE PLAN

**Phase 1 (Q1-Q2 2026): Quick Wins**
- Quick Commerce setup (₹8 Cr investment, 8-month payback)
- B2B cross-sell activation (₹2 Cr, 12-month payback)
- Brand autonomy reset (organizational change, no cost)
**Value:** ₹30 Cr revenue, +2 margin points

**Phase 2 (Q3 2026-Q2 2027): Strategic Builds**
- Functional range R&D (₹2 Cr, 14-month payback)
- International export (₹3 Cr, 18-month payback)
- Channel mix optimization (shift MT→QC)
**Value:** ₹50 Cr revenue, +1.5 margin points

**Phase 3 (Q3 2027-Q1 2028): Scale**
- QC expansion to 50 cities
- International to 5 ME countries
- Functional range scale
**Value:** ₹80 Cr revenue, EBITDA positive

**Total Incremental Synergy Value (24M):**
- Revenue: ₹160 Cr (on top of ₹80 Cr already captured)
- Margin: +3.5 points
- Total value created: ₹240 Cr (original ₹95 Cr + ₹160 Cr new)

**Investment Required:** ₹23 Cr
**Blended Payback:** 11 months
\`\`\`

---

## CRITICAL SUCCESS CRITERIA

Your output must:
1. **Synthesize insights from Agents 1-6** (connect dots, not repeat)
2. **Assess what synergies are exhausted** vs **what's untapped**
3. **Identify 4 NEXT-wave synergies** (specific, valued, with ITC capability match)
4. **Address integration challenges** honestly (culture, brand, speed)
5. **Provide 24-month roadmap** with investment and value

**Red Flags:**
- ❌ Repeating Agent 1-6 content (synthesis, not summary)
- ❌ Generic M&A synergy advice (could apply to any deal)
- ❌ Ignoring that 3 years have passed (what's NEXT, not repeat)
- ✅ Novel connections (QC = ITC portfolio learning)
- ✅ Counter-intuitive insights (brand autonomy = better synergy)

---

**Remember:** You're the SYNTHESIS agent. Agents 1-6 gave pieces. You assemble the puzzle and show HOW ITC should evolve the relationship 2026-2028 to capture the NEXT ₹100 Cr of value beyond basic operational synergies.
`,

  synopsis: `# AGENT 8: EXECUTIVE SYNOPSIS
## STRATEGIC SYNTHESIS (3-YEAR POST-ACQUISITION)

**Model:** Claude Opus 4.6 (\`claude-opus-4-6-20250514\`)

**Critical Context:** ITC acquired [COMPANY] in 2023. You're writing an executive brief for Hemant (Board-level) in 2026.

---

## YOUR MISSION

Synthesize Agents 1-8 into a **board-ready strategic brief** that answers THE question:

**"ITC leveraged distribution for 3 years. Growth is now slowing (60%→[search for actual data]). What's the strategy for 2026-2028 to get back to 60%+ growth while improving margins?"**

This is the **OPENING PAGE** of an 11-page report. Make it **irresistible** to read the rest.

**Your brief must:**
1. **Diagnose WHY growth slowed** (data-driven, not vague)
2. **Synthesize the strategic situation** (3-4 key insights from all agents)
3. **Recommend THE path forward** (clear verdict, not options)
4. **Show the math** (₹ Cr revenue impact, margin improvement, payback)

**This is for HEMANT—sharp, decisive, ready to make multi-crore bets. No fluff.**

---

## INPUT SYNTHESIS

You receive ALL outputs from Agents 1-8:
- **Agent 1:** Market shifts, category evolution, growth opportunities
- **Agent 2:** Portfolio gaps, SKU kill/launch decisions
- **Agent 3:** Brand positioning, perception drift
- **Agent 4:** Margin levers, unit economics
- **Agent 5:** Growth channels (QC, B2B, international)
- **Agent 6:** Competitive threats, attack/defend strategies
- **Agent 7:** Synergy assessment, integration challenges

**Your job:** Synthesize into ONE coherent narrative with a clear verdict.

---

## OUTPUT STRUCTURE (1,500 words, 2 PAGES in PDF)

**This Synopsis must be STANDALONE - Hemant can read just these 2 pages and make the decision.**

\`\`\`
## THE SITUATION

[3 sentences maximum - crisp context]

Example:
"ITC acquired [COMPANY] in 2023 to leverage selective distribution support. Three years later, [ACTUAL PERFORMANCE DISCOVERED THROUGH SEARCH - to be inserted based on Agent 1 findings]. The question now: What's the strategy for 2026-2028 to maintain/accelerate momentum?"

---

## THE VERDICT

[ONE clear strategic recommendation - 150 words]

**Format as highlighted box in PDF:**
\`\`\`
┌─────────────────────────────────────────────┐
│ RECOMMENDED STRATEGY:                        │
│                                              │
│ [One paragraph stating the clear path        │
│  forward - what to do, why now, expected     │
│  outcome]                                    │
│                                              │
│ Investment: ₹[X] Cr                          │
│ Target: [Y]% growth, [Z] margin points      │
│ Timeline: 24 months                          │
└─────────────────────────────────────────────┘
\`\`\`

Example:
**Pivot from distribution-led growth to multi-channel innovation + platform expansion.**

ITC should shift [COMPANY]'s growth engine from "more stores" (approaching saturation based on Agent 1 findings) to four new levers: Quick Commerce leadership (₹45 Cr potential per Agent 5), functional premium tier (₹35 Cr per Agent 2), B2B institutional (₹25 Cr per Agent 5), and international exports (₹25 Cr per Agent 5). PLUS strategic opportunity: Launch D2C brand incubation platform (Agent 9)—3 new premium brands targeting ₹480 Cr portfolio by Year 5. Combined: 55-60% YoY growth (2026-2028) while improving gross margin from [current]% to 45%+.

**Investment:** ₹85 Cr (₹25 Cr for [COMPANY] growth initiatives + ₹60 Cr for brand incubator platform)  
**Return:** ₹130 Cr incremental revenue (Yogabar) + ₹480 Cr portfolio (new brands) = ₹610 Cr total by 2030  
**ROI:** 7-8x on ₹85 Cr investment

---

## KEY INSIGHTS

[5 critical insights from all 8 agents—the strategic breakthroughs]

**ONE insight MUST be the Platform Expansion opportunity (Agent 9)**

Format each as:
**◉ [INSIGHT NAME IN CAPS]**
[3-4 sentences: What the insight is, why it matters, what it unlocks]

**Visual formatting in PDF:** Each insight in a subtle box with icon

---

**INSIGHT 1: TWO-WAY INSTITUTIONAL LEVERAGE** (from Agent 7)

Agent 7 mapped the complete synergy picture beyond simple distribution: 

**ITC → [COMPANY]:** Agri Business for farm-traceable sourcing (10-15% cost savings + premium claim), Hotels for corporate B2B access (2,500 existing relationships), Exports infrastructure for ME markets (licenses, distributors ready), R&D labs for clinical validation of functional ingredients.

**[COMPANY] → ITC:** Quick Commerce playbook (teach ITC Foods' ₹5,000 Cr portfolio how to win on Blinkit/Zepto), influencer strategy (replace inefficient celebrity spend with micro-influencers), D2C mechanics (subscription, retention, LTV optimization).

**The shift:** From "how ITC helps [COMPANY]" to "how [COMPANY] becomes ITC's digital transformation teacher." Strategic value beyond revenue.

---

**INSIGHT 2: [KEY FINDING FROM AGENT 1 - MARKET/CATEGORY]**

[Based on what Agent 1 discovers about current performance, category shifts, competitive dynamics]

Example framework:
"Agent 1 found [current growth rate/market shift]. This explains [why X is happening]. The opportunity: [specific market white space identified]. Timing critical: [why now, window closing]."

---

**INSIGHT 3: [KEY FINDING FROM AGENTS 2/3/4 - PORTFOLIO/BRAND/MARGINS]**

[Synthesize key portfolio move, brand repositioning, or margin lever]

Example framework:
"Agent [X] identified [specific gap/opportunity]. Current state: [problem]. Recommended shift: [specific action]. Impact: ₹[X] Cr revenue OR [Y] margin points. Why it works: [competitive advantage or market trend]."

---

**INSIGHT 4: [KEY FINDING FROM AGENTS 5/6 - GROWTH/COMPETITIVE]**

[Synthesize new growth channel or competitive strategy]

Example framework:
"Agent [X] showed [growth opportunity]. Market size: ₹[X] Cr, [COMPANY] penetration: [Y]%. The play: [specific channel strategy]. Why [COMPANY] can win: [unique advantage]. 18-24 month target: ₹[X] Cr incremental."

---

**INSIGHT 5: D2C BRAND INCUBATOR PLATFORM** (from Agent 9) ← STRATEGIC CENTERPIECE

**The Opportunity:** D2C insurgents (Oziva, Wellbeing Nutrition, Farmley) are winning premium categories (functional wellness ₹800 Cr, gourmet snacking ₹1,200 Cr) where ITC's offline brands can't compete. ITC's digital team knows TOOLS but not how to BUILD D2C brands from scratch.

**The Play:** Use [COMPANY] as brand incubation platform. Launch 3 new D2C-native premium brands over 5 years:
- Year 1: Functional wellness (collagen, adaptogens) — ₹150 Cr by Year 3
- Year 2.5: Premium snacking (gourmet chips, artisan chocolate) — ₹100 Cr by Year 4  
- Year 4: Functional beverages (wellness shots) — ₹150 Cr by Year 6

**Why [COMPANY]:** Proven ability to build D2C brands (did it with [COMPANY] itself) + digital-native DNA (QC mastery, influencer authenticity, subscription mechanics)

**Why ITC:** Provides institutional assets [COMPANY] can't build alone (R&D for validation, Agri for sourcing, Hotels for premium positioning, capital for patient building)

**Economics:** ₹60 Cr investment → ₹480 Cr portfolio revenue → ₹1,680 Cr valuation (3.5x multiple) = 28x ROI

**The Precedent:** Unilever/Dollar Shave Club, P&G/Native — use acquisition to BUILD in D2C, don't retrofit existing brands

**Risk Mitigation:** Start with ₹15 Cr pilot (functional wellness). If reaches ₹100 Cr by Year 3 → Scale to Brand #2. If fails → Stop.

---

## CRITICAL SUCCESS FACTORS

[4 specific things that MUST happen - actionable, measurable]

**Format in PDF:** Numbered list with checkboxes visual

**1. [SUCCESS FACTOR]**
[One sentence: What needs to happen]
[One sentence: How to measure success]
[One sentence: Timeline]

Example:
**1. QUICK COMMERCE VELOCITY VALIDATION (Months 1-6)**
Launch on Blinkit/Zepto with top 3 hero SKUs. Target: 80-120 units/SKU/dark store/month. If achieved → Scale to 50 cities by Month 12. If <60 → Pivot strategy. This validates highest-leverage growth bet (₹45 Cr potential, 8-month payback per Agent 5).

**2. FUNCTIONAL WELLNESS BRAND LAUNCH (Q2 2026)**
First brand from incubator platform must succeed (90% of importance for entire model). Target: ₹20 Cr Year 1, ₹100 Cr by Year 3. ITC R&D clinical validation = differentiation vs competitors' unvalidated claims. If fails ₹100 Cr threshold → STOP platform, don't launch Brand #2.

**3. [ANOTHER CRITICAL FACTOR FROM AGENTS]**

**4. [ANOTHER CRITICAL FACTOR FROM AGENTS]**

---

## THE MATH

[Financial summary table - must fit on page, highly visual]

**BASELINE (2026):**
Revenue: ₹[X] Cr (from Agent 1 findings)
Gross Margin: [Y]%
Growth: [Z]% YoY

**TARGET (2028 - Yogabar Growth Only):**

| Growth Lever | FY27 Impact | FY28 Impact | Margin |
|--------------|-------------|-------------|--------|
| Quick Commerce | ₹25 Cr | ₹45 Cr | 48% |
| Functional Premium SKUs | ₹18 Cr | ₹35 Cr | 44% |
| Corporate B2B | ₹15 Cr | ₹25 Cr | 46% |
| International (ME) | ₹8 Cr | ₹25 Cr | 42% |
| **Yogabar Incremental** | **₹66 Cr** | **₹130 Cr** | **45% avg** |

**Baseline Growth (existing):** +₹[X] Cr  
**Total Yogabar FY28:** ₹[X + 130] Cr  
**Blended Growth Rate:** 55-60% YoY

**TARGET (2030 - WITH Brand Incubator Platform):**

**Yogabar:** ₹[X] Cr  
**Brand #1 (Wellness):** ₹150 Cr  
**Brand #2 (Snacking):** ₹100 Cr  
**Brand #3 (Beverages):** ₹30 Cr (launch year)  
**Total Portfolio:** ₹[X + 280] Cr

**Valuation:** ₹[X]×1.5 (Yogabar) + ₹280×3.5 (new brands) = ₹[Total] Cr value created

---

## THE CHOICE

[Frame the decision clearly - what Hemant must approve]

**OPTION A: OPERATIONAL EXCELLENCE** (₹25 Cr investment)
Continue current trajectory + implement operational improvements (QC, B2B, international, margin optimization). Accept 40-45% growth, stay focused on [COMPANY] core business only.

**Safe but limited:** Incremental improvements, no platform creation, miss D2C insurgent wave.

---

**OPTION B: STRATEGIC TRANSFORMATION** ← **RECOMMENDED** (₹85 Cr investment)

Execute Option A PLUS launch D2C brand incubator platform:
- ₹25 Cr for [COMPANY] operational initiatives
- ₹60 Cr for 3-brand platform (5 years)

**Target outcomes:**
- [COMPANY]: 55-60% YoY growth, 45% gross margin
- Platform: ₹480 Cr portfolio by 2030, ₹1,680 Cr valuation
- Strategic: ITC becomes India's leader in premium D2C (not just participant)

**Risk-adjusted:** Start with ₹15 Cr pilot. Stop if Brand #1 fails. Full ₹60 Cr only if model proves.

---

**THE WINDOW: 12-18 MONTHS**

Quick Commerce consolidating (Zepto $1B raise, 2025). Functional wellness trend being claimed by Oziva/Wellbeing. International markets opening for Indian brands. After 18 months, first-mover advantages close.

**RECOMMENDATION: Execute Option B, starting Q1 2026.**

---

## NEXT STEPS (IF APPROVED)

[Concrete actions with timelines]

**IMMEDIATE (Q1 2026):**
1. Quick Commerce pilot: Blinkit/Zepto top 10 cities (₹2 Cr budget)
2. Functional wellness brand: NPD kickoff, ITC R&D clinical trials (₹3 Cr)
3. Talent retention: Equity vesting for [COMPANY] team

**SHORT-TERM (Q2-Q3 2026):**
1. Functional wellness brand launch (Month 6-8)
2. Corporate B2B: ITC Hotels cross-sell activation (50 accounts pilot)
3. QC scale decision: If velocity >80 units/month → Expand to 50 cities

**MEDIUM-TERM (Q4 2026 - Q2 2027):**
1. Brand #1 performance evaluation: ₹100 Cr trajectory validation
2. International: UAE pilot (ITC export infrastructure)
3. Go/No-Go for Brand #2: Board decision based on Brand #1 12-month data
\`\`\`

---

## CRITICAL SUCCESS CRITERIA

Your synopsis must:
1. **Be STANDALONE** - Hemant can make decision from these 2 pages alone
2. **Synthesize all 8 agents** - Connect insights, show big picture
3. **Give ONE clear verdict** - Not options, THE recommendation
4. **Show the math** - ₹ Cr revenue impact, margin improvement, ROI
5. **Frame the choice** - What to approve, why now, what happens if we don't
6. **Be visual** - Headlines, boxes, tables (not wall of text)

**Format Notes:**
- This will be Pages 4-5 in the 16-page PDF
- Must be formatted with boxes, visual hierarchy
- Key numbers should stand out (large, colored)
- THE VERDICT in special box
- Each insight visually separated
- Math in clear table format

---

**Remember:** This is for HEMANT at the BOARD LEVEL. It must be sharp enough that he can present these 2 pages and get ₹85 Cr approved. Every sentence must earn its place.

Example:
"ITC acquired [COMPANY] in 2023 to leverage distribution muscle. Three years later, that playbook is exhausted: [COMPANY] grew from 150 to 800-1,200 MT stores but revenue growth trajectory (to be discovered from dataed from 60% to [search for actual data]. Store velocity is plateauing—adding more touchpoints no longer drives proportional sales. The question now: What's NEXT?"

---

## THE VERDICT

[ONE clear recommendation—not options, not "it depends"]

Example:
**Pivot from distribution-led to channel innovation + premiumization.**

ITC should shift [COMPANY]'s growth engine from "more stores" (exhausted) to three new levers: Quick Commerce leadership (₹45 Cr), functional premium tier (₹35 Cr), and B2B institutional (₹25 Cr). Combined with margin optimization, this delivers 58% YoY growth in FY27-28 while improving gross margin from 41% to 45%.

---

## KEY INSIGHTS

[4 critical insights from all 8 agents—the "aha" moments]

**One insight MUST cover: Two-way institutional leverage (what Yogabar teaches ITC + what ITC unlocks for Yogabar)**

Format:
**◉ [INSIGHT NAME]**
[2-3 sentences explaining the insight and why it matters]

Example insights to synthesize:

**◉ TWO-WAY INSTITUTIONAL LEVERAGE, NOT ONE-WAY EXTRACTION**
Agent 7 mapped the complete synergy picture: ITC brings assets Yogabar can't build (Agri Business for clean-label sourcing, Hotels for premium B2B access, Exports for international trade, R&D for functional validation). BUT Yogabar brings digital-native DNA ITC's ₹5,000 Cr Foods portfolio desperately needs (Quick Commerce mastery, influencer strategy, D2C playbook, marketplace optimization). The strategic value: Yogabar becomes ITC's innovation lab teaching digital channels—worth far more than revenue contribution alone. Counter-intuitive insight: Give Yogabar MORE autonomy (to experiment with QC, influencers) so ITC can learn faster.

**◉ [ANOTHER KEY INSIGHT FROM AGENTS 1-6]**
[Example: Category shift, competitive threat, margin lever, growth channel, etc.]

**◉ [ANOTHER KEY INSIGHT]**

**◉ [ANOTHER KEY INSIGHT]**
**◉ DISTRIBUTION LEVERAGE EXHAUSTED, QC IS THE NEXT FRONTIER**
Agent 1 showed category shift: 18% of nutrition sales now happen on Quick Commerce (Blinkit/Zepto), but [COMPANY] is at 0%. Agent 5 quantified the opportunity: ₹45 Cr in 18 months if [COMPANY] pivots to QC-first strategy. Agent 7 connected this to ITC's strategic need: [COMPANY] can pioneer QC for ITC Foods' entire portfolio—₹8 Cr investment creates playbook worth 10x for ITC's ₹5,000 Cr Foods business.

**◉ PREMIUM POSITIONING DILUTED BY MASS EXPANSION**
Agent 3 found evidence of brand drift: customer reviews shifted from "clean label startup" language (2020-2023) to "saw in DMart, convenient" (2024-2025). Agent 2 identified the fix: launch functional premium range (₹70-90 with adaptogens) to reclaim positioning. Agent 4 showed the margin math: 44% gross margin vs current 41% despite higher ingredient costs. Counter-intuitively, going MORE premium (not mass) is the growth strategy.

**◉ FUNCTIONAL TREND IS THE COMPETITIVE BATTLEGROUND**
Agent 6 analyzed Whole Truth (top threat): they went from #5 to #2 by launching functional bars in 2024 (₹70-90 with ashwagandha). Agent 1 confirmed the category shift: functional nutrition growing 68% YoY vs 30% for standard protein. Agent 7 identified ITC's synergy: Life Sciences R&D labs can create clinically-validated functional formulations (vs competitors' marketing claims). This is [COMPANY]'s differentiation reset.

**◉ NEXT ₹100 CR COMES FROM NEW CHANNELS, NOT MORE STORES**
Agent 5 mapped four growth levers beyond distribution: Quick Commerce (₹45 Cr), Corporate B2B (₹25 Cr), International export (₹25 Cr), Functional premium (₹35 Cr). Agent 4 showed margin profile: all four deliver 42-48% gross margin vs MT's 38%. Agent 7 assessed synergy capture: ITC has unrealized assets (export infrastructure, Hotels' corporate clients, R&D labs) that unlock these channels at lower cost than building independently.

---

## CRITICAL SUCCESS FACTORS

[3-4 specific things that MUST happen for this to work]

Example:
**1. QUICK COMMERCE VELOCITY VALIDATION (Months 1-6)**
Launch on Blinkit/Zepto in top 10 metros with hero SKUs. Target: 80-120 bars/SKU/dark store/month. If achieved, scale to 50 cities by Month 12. If below 60, pivot strategy. This is the highest-leverage bet (₹45 Cr potential, 8-month payback).

**2. FUNCTIONAL RANGE LAUNCH (Q2 2026)**
₹70-90 bars with ITC R&D-validated functional ingredients. Must hit market before Whole Truth becomes synonymous with "functional bars in India" (6-month window). Clinical trials (₹2 Cr) for credibility. Target: ₹35 Cr revenue by Q1 2027.

**3. BRAND AUTONOMY RESET (Immediate)**
Remove/shrink ITC logo, position as "[COMPANY] powered by ITC" not "ITC's [COMPANY]". Agent 3 showed association hurts premium perception. Paradox: giving brand MORE independence while using ITC backend (distribution, manufacturing) maximizes both brand value AND synergy capture.

**4. MT VELOCITY IMPROVEMENT (Ongoing)**
800-1,200 MT stores but velocity declining. Agent 5 recommended: sampling at top 500 stores (₹2 Cr), retailer incentives for >100 bars/month targets, SKU rationalization (focus on top 3 hero products). Without this, store base becomes cost center not revenue driver.

---

## THE MATH

[Show the 24-month financial trajectory]

**BASELINE (FY26):**
Revenue: ₹[X] Cr
Gross Margin: 41%
Growth: 30% YoY (trajectory (to be discovered from dataing)

**TARGET (FY28):**
Revenue: ₹[X + 160] Cr (+58% CAGR)
Gross Margin: 45% (+4 points)
EBITDA: Break-even to positive

**HOW WE GET THERE:**

| Growth Lever | FY27 | FY28 | Total | Margin |
|--------------|------|------|-------|--------|
| Quick Commerce | ₹25 Cr | ₹45 Cr | ₹70 Cr | 48% |
| Functional Premium | ₹18 Cr | ₹35 Cr | ₹53 Cr | 44% |
| Corporate B2B | ₹15 Cr | ₹25 Cr | ₹40 Cr | 46% |
| International | ₹8 Cr | ₹25 Cr | ₹33 Cr | 42% |
| **New Channels Total** | **₹66 Cr** | **₹130 Cr** | **₹196 Cr** | **45% avg** |
| Baseline Growth (30%) | ₹[X] | ₹[X] | ₹[X] | 41% |
| **TOTAL** | **₹[X+66]** | **₹[X+130]** | **58% CAGR** | **43% Y1, 45% Y2** |

**Total Investment:** ₹23 Cr (QC, R&D, B2B, international setup)
**Blended Payback:** 11 months
**Risk-Adjusted Return:** ₹160 Cr incremental revenue assumes 80% success rate

---

## THE CHOICE

[End with the decision Hemant needs to make]

**Option A: Status Quo**
Continue current strategy (more stores, traditional channels). Accept 25-30% growth, 41% margins, gradual competitive erosion. Safe but slow.

**Option B: Strategic Pivot** ← **RECOMMENDED**
Shift to channel innovation (QC, B2B, international) + premiumization (functional range). Requires ₹23 Cr investment, 11-month payback. Delivers 58% growth, 45% margins, competitive moat re-established.

**The window is 12-18 months.** Quick Commerce is consolidating (Zepto raised $1B in 2025). Functional trend is being claimed by Whole Truth. International markets are opening (Indian brands entering ME). After that, first-mover advantage closes.

**Recommendation: Execute Option B starting Q1 2026.**
\`\`\`

---

## CRITICAL SUCCESS CRITERIA

Your synopsis must:
1. **Answer THE question:** "What's next after 3 years of distribution leverage?"
2. **Synthesize all 8 agents:** Connect insights, don't just summarize
3. **Give ONE clear verdict:** Not options, not "it depends"
4. **Show the math:** ₹ Cr revenue, margin points, payback
5. **Be board-ready:** Hemant can take this to ITC board and get ₹23 Cr approved

**Red Flags:**
- ❌ Repeating agent content (synthesis, not summary)
- ❌ Multiple options (Hemant wants a recommendation, not a menu)
- ❌ No financial math (show the ₹ Cr impact)
- ❌ Vague insights ("market is growing" - so what?)
- ✅ Sharp narrative (diagnostic → insights → verdict → math → choice)
- ✅ Novel connections (agents revealed pieces, you show the picture)

**Format Notes:**
- Use ◉ bullets for insights (visual formatting)
- Keep it ONE page in PDF (800-1,000 words max)
- This is Page 4 of 11 in the full report—reader decides here whether to keep reading

---

## SYNTHESIS QUALITY CHECKLIST

- [ ] Situation diagnosed clearly (why growth slowing?)
- [ ] Verdict stated upfront (clear recommendation)
- [ ] 4 key insights synthesized (connected dots from all agents)
- [ ] Critical success factors (specific, measurable)
- [ ] Math shown (24-month trajectory, ₹ Cr impact)
- [ ] Choice framed (status quo vs recommended path)
- [ ] Board-ready (Hemant can act on this)
- [ ] Narrative arc (problem → insight → solution → math → decision)

---

**Remember:** This is for HEMANT making multi-crore decisions. It's 2026, 3 years post-acquisition, distribution playbook exhausted. Your synthesis must show him WHAT'S NEXT and WHY NOW. Sharp, decisive, math-backed. Make every word count.
`,

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

function md(text) {
  if (!text) return "";
  
  // First, fix the Sources line to ensure it's on one line
  let fixedText = text.replace(/\*\*Sources:\*\*([^\n]*(?:\n(?!\n)[^\n]*)*)/g, (match, sources) => {
    const cleaned = sources.replace(/\n/g, ', ').replace(/,\s*,/g, ',').trim();
    return `**Sources:** ${cleaned}`;
  });
  
  // Remove markdown heading
  fixedText = fixedText.replace(/^#+ EXECUTIVE SYNOPSIS\s*\n/gm, '');
  
  // Check if this is synopsis content (has THE VERDICT)
  const isSynopsis = fixedText.includes('**THE VERDICT**');
  
  if (isSynopsis) {
    // Handle synopsis with special layout
    let html = '';
    
    // Extract THE VERDICT
    const verdictMatch = fixedText.match(/\*\*THE VERDICT\*\*\s*\n(.+?)(?=\n◉)/s);
    if (verdictMatch) {
      html += `<div style="margin-bottom:12px;padding:11px;background:white;border:1px solid #d4724a;border-left:3px solid #d4724a">
        <div style="font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#d4724a;margin-bottom:4px">THE VERDICT</div>
        <p style="font-size:10px;line-height:1.4;color:#2b2b2b;margin:0">${verdictMatch[1].trim()}</p>
      </div>`;
    }
    
    // Extract all ◉ sections
    const sections = [];
    const sectionRegex = /◉ ([A-Z\s&]+)\s*\n(.+?)(?=\n◉|$)/gs;
    let match;
    while ((match = sectionRegex.exec(fixedText)) !== null) {
      sections.push({ title: match[1].trim(), content: match[2].trim() });
    }
    
    // Wave 1: First 4 sections in 2x2 grid
    if (sections.length >= 4) {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px">';
      for (let i = 0; i < 4; i++) {
        html += `<div style="padding:9px;background:white;border:1px solid #3d6b54;border-left:3px solid #3d6b54">
          <div style="font-size:7.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#3d6b54;margin-bottom:4px">◉ ${sections[i].title}</div>
          <p style="font-size:8.5px;line-height:1.35;color:#4a4a4a;margin:0">${sections[i].content}</p>
        </div>`;
      }
      html += '</div>';
    }
    
    // Wave 2: Remaining sections row-wise
    for (let i = 4; i < sections.length; i++) {
      html += `<div style="margin-bottom:8px;padding:10px;background:white;border:1px solid #3d6b54;border-left:3px solid #3d6b54">
        <div style="font-size:7.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#3d6b54;margin-bottom:4px">◉ ${sections[i].title}</div>
        <p style="font-size:9px;line-height:1.4;color:#4a4a4a;margin:0">${sections[i].content}</p>
      </div>`;
    }
    
    return html;
  }
  
  // Regular content (agent analysis)
  // Special case: if content starts with ##, don't add opening <p> tag
  const startsWithHeader = fixedText.trim().startsWith('##');
  const openTag = startsWithHeader ? '' : '<p style="margin:6px 0;">';
  const closeTag = startsWithHeader ? '' : '</p>';
  
  return openTag + fixedText
    .replace(/^## (.+)$/gm, `</p><h3 class="agent-section-header" style="font-family:'Libre Baskerville',serif;font-size:14px;color:${P.forest};margin:16px 0 6px;border-bottom:1px solid ${P.sand};padding-bottom:4px;">$1</h3><p style="margin:6px 0;">`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${P.ink};">$1</strong>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:7px;margin:3px 0;"><span style="color:${P.terra};">▸</span><span>$1</span></div>`)
    .replace(/\n\n/g, `</p><p style="margin:6px 0;">`)
    .replace(/\n/g, " ") + closeTag;
}

export default function AdvisorSprint() {
  const [company, setCompany] = useState("Yogabar");
  const [context, setContext] = useState(`Post-acquisition growth strategy for Yogabar. ITC acquired stake in 2023, progressively increasing ownership.

Core challenge: How does ITC's institutional strength (4M+ outlets, manufacturing scale, brand-building expertise) accelerate Yogabar's digital-first growth (60%+ YoY) without diluting premium positioning?

Competitors: Whole Truth, Super You, True Elements, Rite Bite, Kellogg's
Current model: 70% E-comm, 30% Modern Trade

Focus areas:
1. Portfolio optimization (which SKUs to scale/kill)
2. Brand story evolution
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
    setShowDash(false);
    setElapsed(0);

    const co = company.trim();
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

    try {
      setAppState("running");
      
      // Wave 1: Agents 1-6 (parallel)
      const w1texts = {};
      for (const id of W1) {
        if (signal.aborted) return;
        setStatuses(s => ({ ...s, [id]: "running" }));
        const prompt = makePrompt(id, co, ctx, {});
        const text = await runAgent(id, prompt, signal, pdfs);
        w1texts[id] = text;
      }

      // Wave 2: Agent 7 (synergy)
      if (!signal.aborted) {
        setStatuses(s => ({ ...s, synergy: "running" }));
        const prompt = makePrompt("synergy", co, ctx, w1texts);
        const synergyText = await runAgent("synergy", prompt, signal, pdfs);
        w1texts.synergy = synergyText;
      }

      // Wave 3: Agent 8 (synopsis)
      if (!signal.aborted) {
        setStatuses(s => ({ ...s, synopsis: "running" }));
        const prompt = makePrompt("synopsis", co, ctx, w1texts);
        await runAgent("synopsis", prompt, signal, pdfs);
      }

      if (!signal.aborted) {
        setAppState("done");
        setShowDash(true);
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
    gaEvent("pdf_download", { company, user: userName || "anonymous" });
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

  {/* PAGE 1: COVER */}
  <div style={{ padding: "220px 50px", pageBreakAfter: "always", textAlign: "center" }}>
    <div style={{ marginBottom: 40 }}>
      <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 42, fontWeight: 700, color: P.forest, marginBottom: 15, letterSpacing: "0.02em" }}>
        {company.toUpperCase()}
      </h1>
      <div style={{ width: 80, height: 4, background: P.terra, margin: "0 auto" }}></div>
    </div>
    
    <p style={{ fontSize: 18, color: P.inkSoft, marginBottom: 12, fontWeight: 500 }}>
      9-Agent Post-Acquisition Intelligence Analysis
    </p>
    
    <p style={{ fontSize: 13, color: P.inkFaint, marginBottom: 50 }}>
      Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • Completed in {formatTime(elapsed)}
    </p>
    
    <div style={{ background: P.parchment, padding: "25px 30px", borderRadius: 6, maxWidth: 500, margin: "0 auto", border: `1px solid ${P.sand}` }}>
      <p style={{ fontSize: 11, color: P.inkMid, lineHeight: 1.7, margin: 0 }}>
        Strategic synthesis from 9 parallel intelligence agents analyzing market position, portfolio optimization, brand evolution, margin improvement, growth channels, competitive dynamics, operational synergies, and platform expansion opportunities.
      </p>
    </div>
    
    <div style={{ marginTop: 60, fontSize: 9, color: P.inkFaint, textTransform: "uppercase", letterSpacing: "0.15em" }}>
      Advisor Sprint — Strategic Intelligence System
    </div>
  </div>

  {/* PAGE 2: ASSUMPTIONS & SOURCES */}
  <div style={{ padding: "70px 50px 40px 50px", pageBreakAfter: "always" }}>
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
        This analysis is based on web search, publicly available data, and industry reports. All 9 agents discover current performance through independent search and synthesis.
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

  {/* PAGE 3: TABLE OF CONTENTS */}
  <div style={{ padding: "70px 50px 40px 50px", pageBreakAfter: "always" }}>
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
        { num: 1, icon: "◈", title: "Market Position & Category Dynamics", page: 6 },
        { num: 2, icon: "◉", title: "Portfolio Strategy & SKU Rationalization", page: 7 },
        { num: 3, icon: "◎", title: "Brand Positioning & Storytelling", page: 8 },
        { num: 4, icon: "◐", title: "Margin Improvement & Unit Economics", page: 9 },
        { num: 5, icon: "◆", title: "Growth Strategy & Channel Orchestration", page: 10 },
        { num: 6, icon: "◇", title: "Competitive Battle Plan", page: 11 },
        { num: 7, icon: "◈", title: "Synergy Playbook & Institutional Leverage", page: 12 },
        { num: 9, icon: "◉", title: "Platform Expansion & D2C Brand Incubator", page: 13-14 }
      ].map((item, idx) => (
        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, paddingTop: 10, borderBottom: `1px solid ${P.parchment}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 16, color: P.terraSoft, width: 20 }}>{item.icon}</span>
            <span style={{ color: P.inkMid }}>
              <span style={{ fontSize: 9, color: P.inkFaint, fontWeight: 600, marginRight: 8 }}>AGENT {item.num}</span>
              {item.title}
            </span>
          </div>
          <span style={{ color: P.inkFaint, fontSize: 11 }}>{item.page}</span>
        </div>
      ))}
    </div>
    
    <div style={{ marginTop: 50, padding: 22, background: P.parchment, borderRadius: 6, textAlign: "center" }}>
      <p style={{ fontSize: 10, color: P.inkSoft, lineHeight: 1.7, margin: 0 }}>
        This report synthesizes insights from 9 parallel intelligence agents, each analyzing a critical dimension of post-acquisition strategy. Read the Executive Synopsis (pages 4-5) for a standalone summary, or explore individual agent analyses for deep-dive insights.
      </p>
    </div>
  </div>

  {/* PAGES 4-5: EXECUTIVE SYNOPSIS - Enhanced with visual formatting */}
  {results.synopsis && (
    <div style={{ padding: "70px 50px 40px 50px" }}>
      <div className="section-header" style={{ marginBottom: 25 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={{ fontSize: 28, color: P.terraSoft }}>◉</span>
          <div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: P.forest, margin: 0 }}>
              Executive Synopsis
            </h2>
            <p style={{ fontSize: 11, color: P.inkSoft, fontStyle: "italic", marginTop: 6, marginBottom: 0 }}>
              Strategic synthesis of all 8 agents — Standalone decision brief
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
        style={{ 
          pageBreakBefore: "always", 
          pageBreakAfter: isLastAgent ? "auto" : "always", 
          padding: "70px 50px 40px 50px" 
        }}
      >
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
            WAVE {agent.wave} • AGENT {agent.id === 'platform' ? '9' : index + 1} OF 8
          </div>
        </div>
        
        <div 
          className="agent-content" 
          data-wave={agent.wave} 
          style={{ fontSize: 11.5, lineHeight: 1.85, color: P.inkMid }} 
          dangerouslySetInnerHTML={{ __html: md(result) }} 
        />
      </div>
    );
  })}
</div>
    </div>
  );
}