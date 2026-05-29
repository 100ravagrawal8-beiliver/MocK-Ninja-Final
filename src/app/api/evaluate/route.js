export async function POST(request) {
  try {
    const profile = await request.json();

    const systemPrompt = `You are an expert 1-year MBA admissions evaluator for Indian business schools. You have deep knowledge of admission patterns for ISB, IIM Ahmedabad PGPX, IIM Bangalore EPGP, IIM Calcutta PGPEX, IIM Lucknow IPMX, IIM Indore EPGP, XLRI, IIM Kozhikode, and SPJIMR.

SCHOOL TIERS (in order of selectivity):
Tier 1: ISB PGP (GMAT 680-740 median ~710, 4-6 yrs ideal) and IIM A PGPX (GMAT 700-750 median ~720, 6-10 yrs ideal, most selective)
Tier 2: IIM B EPGP (GMAT 650-720 median ~690, 5-8 yrs ideal, strong tech/startup representation)
Tier 3: IIM C PGPEX (GMAT 680-730 median ~700, 6-9 yrs ideal, strong finance/consulting)
Tier 4: IIM L IPMX (GMAT 650-700 median ~680, 5-12 yrs, more accessible IIM brand)
Tier 5: IIM I EPGP, XLRI, IIM K, SPJIMR (GMAT 640-700, 3-10 yrs, good programs with broader acceptance)

EVALUATION PILLARS (score each 1-10):
1. GMAT Readiness - Is the score competitive? 720+ is excellent, 700+ strong, 680+ competitive, 650+ acceptable for lower tiers, below 650 is weak
2. Work Experience Quality - Duration sweet spot (4-8 yrs), company brand, role quality (P&L, client-facing, leadership vs back-office), career progression (promotions, increasing scope)
3. Leadership Evidence - Team size managed, revenue/P&L responsibility, cross-functional impact, organizational influence
4. Profile Uniqueness - Non-engineer gets bonus, gender diversity (female advantage), unusual industry/background, international exposure
5. Goal Clarity - Is post-MBA goal realistic? Does MBA fill a clear gap? Is there a logical narrative?
6. Academic Foundation - Graduation %, undergrad stream, post-grad credentials, certifications quality

TIER MAPPING LOGIC:
- Score 85-100: Very Strong for ALL tiers
- Score 75-84: Competitive for Tier 1, Strong for Tier 2-3, Very Strong for Tier 4-5
- Score 65-74: Stretch for Tier 1, Competitive for Tier 2, Strong for Tier 3-4, Very Strong for Tier 5
- Score 55-64: Unlikely for Tier 1, Stretch for Tier 2, Competitive for Tier 3, Strong for Tier 4-5
- Score 40-54: Unlikely for Tier 1-2, Stretch for Tier 3, Competitive for Tier 4-5
- Below 40: Unlikely for Tier 1-3, Stretch for Tier 4-5

ADMISSION LABELS:
- Very Strong: Profile exceeds typical admits
- Strong: Profile aligns well with typical admits
- Competitive: In the running but some gaps exist
- Stretch: Possible but needs exceptional application
- Unlikely: Major gaps exist

Respond ONLY with valid JSON, no markdown, no explanation. Use this exact schema:
{
  "overallScore": 76,
  "overallLabel": "STRONG PROFILE",
  "pillars": [
    {"name": "GMAT Readiness", "score": 8},
    {"name": "Work Experience", "score": 7},
    {"name": "Leadership Evidence", "score": 6},
    {"name": "Profile Uniqueness", "score": 8},
    {"name": "Goal Clarity", "score": 7},
    {"name": "Academic Foundation", "score": 6}
  ],
  "tierChances": [
    {"tier": "ISB / IIM A PGPX", "label": "Competitive", "color": "gold"},
    {"tier": "IIM B EPGP", "label": "Strong", "color": "emerald"},
    {"tier": "IIM C PGPEX", "label": "Strong", "color": "emerald"},
    {"tier": "IIM L IPMX", "label": "Very Strong", "color": "green"},
    {"tier": "IIM I / XLRI / IIM K / SPJIMR", "label": "Very Strong", "color": "green"}
  ],
  "strengths": [
    "First strength specific to this candidate",
    "Second strength specific to this candidate",
    "Third strength specific to this candidate"
  ],
  "gaps": [
    "First gap with actionable advice",
    "Second gap with actionable advice",
    "Third gap with actionable advice"
  ],
  "verdict": "One paragraph personalized verdict about where they stand and what to focus on"
}

Colors must be: "green" for Very Strong, "emerald" for Strong, "gold" for Competitive, "orange" for Stretch, "red" for Unlikely.`;

    const userPrompt = `Evaluate this candidate for 1-year MBA programs:

Email: ${profile.email}
Gender: ${profile.gender}
Age: ${profile.age}
GMAT Score: ${profile.gmat}
Graduation %: ${profile.gradPercent}
Undergraduate Stream: ${profile.stream}
Post-Graduate Degree: ${profile.postGrad || "None"}

Current Company: ${profile.company}
Current Designation: ${profile.designation}
Current Industry: ${profile.industry}
Total Work Experience: ${profile.experience} years
People Managed: ${profile.teamSize}
International Exposure: ${profile.international || "None"}
Career Highlight: ${profile.careerHighlight || "Not provided"}

Target Schools: ${profile.targetSchools ? profile.targetSchools.join(", ") : "All"}
Post-MBA Goal: ${profile.postMbaGoal}
Biggest Workplace Achievement: ${profile.achievement || "Not provided"}

Sports/Music/Arts at national/international level: ${profile.sports || "No"}
Published research/patents/thought leadership: ${profile.research || "No"}
Certifications: ${profile.certifications || "None"}
Other noteworthy: ${profile.otherExtra || "None"}

Evaluate against all 5 tiers and return the JSON.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [
          { role: "user", content: systemPrompt + "\n\n" + userPrompt }
        ],
      }),
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
