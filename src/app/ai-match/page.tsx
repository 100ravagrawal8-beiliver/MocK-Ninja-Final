"use client";
import { useState, useEffect, useRef } from "react";

// ============================================================
// AI SMART MATCHING — MockNinja
// Student fills profile → AI matches with best interviewer
// Uses Claude API for intelligent matching
// ============================================================

const INTERVIEWER_DB = [
  { id: 1, name: "Rajesh Mehta", initials: "RM", school: "IIM Ahmedabad", year: "2016", firm: "McKinsey", yrs: 12, specialties: ["Strategy", "Career Switch", "Leadership"], industries: ["IT", "Consulting"], schools: ["IIM A", "IIM B"], sessions: 85, rating: 4.9, bio: "Former IIM A admissions panelist. Has helped 50+ IT professionals transition to consulting careers." },
  { id: 2, name: "Priya Kapoor", initials: "PK", school: "ISB Hyderabad", year: "2018", firm: "BCG", yrs: 9, specialties: ["Operations", "Stress Interview", "WAT"], industries: ["FMCG", "Manufacturing", "Consulting"], schools: ["ISB", "IIM C"], sessions: 62, rating: 4.8, bio: "ISB PGP alum specializing in operations and supply chain narratives. Expert at high-pressure interview simulation." },
  { id: 3, name: "Amit Sharma", initials: "AS", school: "IIM Bangalore", year: "2014", firm: "Bain & Company", yrs: 14, specialties: ["Finance", "General Management", "Career Narrative"], industries: ["Banking", "Finance", "Private Equity"], schools: ["IIM B", "IIM L", "IIM A"], sessions: 110, rating: 5.0, bio: "14 years in consulting and PE. IIM B alumni interviewer for 5 consecutive years. Highest-rated mentor on MockNinja." },
  { id: 4, name: "Neha Reddy", initials: "NR", school: "IIM Calcutta", year: "2017", firm: "Deloitte", yrs: 10, specialties: ["Marketing", "Digital Strategy", "Personal Interview"], industries: ["IT", "E-commerce", "Media"], schools: ["IIM C", "IIM K", "ISB"], sessions: 73, rating: 4.9, bio: "Former Deloitte Digital lead. Specializes in helping tech professionals articulate their marketing and strategy vision." },
  { id: 5, name: "Vikram Joshi", initials: "VJ", school: "XLRI Jamshedpur", year: "2015", firm: "Goldman Sachs", yrs: 11, specialties: ["HR", "Behavioral Questions", "Ethics"], industries: ["Banking", "Finance", "HR"], schools: ["XLRI", "IIM I", "IIM A"], sessions: 54, rating: 4.7, bio: "XLRI gold medalist. Goldman Sachs VP turned educator. Known for deep behavioral interview preparation." },
  { id: 6, name: "Sneha Iyer", initials: "SI", school: "IIM Indore", year: "2019", firm: "Amazon", yrs: 7, specialties: ["Product Management", "Tech Leadership", "Stress Interview"], industries: ["IT", "E-commerce", "Product"], schools: ["IIM I", "ISB", "IIM B"], sessions: 41, rating: 4.8, bio: "Amazon Senior PM. Youngest mentor on MockNinja. Brings fresh perspective on what panels look for in tech leaders." },
  { id: 7, name: "Karthik Raman", initials: "KR", school: "IIM Ahmedabad", year: "2013", firm: "McKinsey → Flipkart", yrs: 15, specialties: ["Entrepreneurship", "General Management", "Strategy"], industries: ["E-commerce", "Startups", "Consulting"], schools: ["IIM A", "ISB", "IIM B"], sessions: 92, rating: 4.9, bio: "McKinsey to Flipkart CXO journey. Ideal for aspirants with entrepreneurial backgrounds or startup experience." },
  { id: 8, name: "Ananya Desai", initials: "AD", school: "ISB Hyderabad", year: "2020", firm: "EY-Parthenon", yrs: 6, specialties: ["Healthcare", "Social Impact", "WAT"], industries: ["Healthcare", "Pharma", "NGO"], schools: ["ISB", "IIM C", "IIM I"], sessions: 38, rating: 4.8, bio: "Healthcare consulting specialist. Perfect match for doctors, pharma professionals, and social impact aspirants." },
];

const INDUSTRIES = ["IT/Software", "Consulting", "Banking/Finance", "FMCG", "Healthcare/Pharma", "Manufacturing", "E-commerce", "Government/PSU", "Startups", "Other"];
const EXPERIENCE_RANGES = ["1–3 years", "3–5 years", "5–8 years", "8–12 years", "12–15 years", "15+ years"];
const TARGET_SCHOOLS = ["IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "IIM Indore", "IIM Lucknow", "IIM Kozhikode", "ISB Hyderabad", "XLRI Jamshedpur"];
const HELP_AREAS = ["General Prep", "Personal Interview", "WAT", "Career Narrative", "Leadership Questions", "Stress Interview", "Product/Tech Questions"];

// ============================================================
// STEP 1: Profile Form
// ============================================================
function ProfileForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    industry: "",
    experience: "",
    designation: "",
    targetSchools: [],
    helpNeeded: [],
    careerGoal: "",
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleArray = (field, value) => {
    setForm((f) => {
      const arr = f[field];
      return { ...f, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const canSubmit = form.name && form.industry && form.experience && form.targetSchools.length > 0;

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#C9A84C", letterSpacing: "1.5px", textTransform: "uppercase" }}>AI Matching Engine</span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 36, fontWeight: 700, color: "#F5F5F0", margin: "0 0 12px" }}>
          Find Your Perfect <span style={{ color: "#C9A84C" }}>Interviewer</span>
        </h1>
        <p style={{ fontSize: 16, color: "#94A3B8", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
          Tell us about yourself. Our AI will analyze your profile against 50+ expert interviewers and find your ideal match.
        </p>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", display: "block", marginBottom: 6 }}>Your Name *</label>
          <input
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #334155", background: "#1A2A44", color: "#F5F5F0", fontSize: 15, outline: "none" }}
            placeholder="Full name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", display: "block", marginBottom: 6 }}>Current Designation</label>
          <input
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #334155", background: "#1A2A44", color: "#F5F5F0", fontSize: 15, outline: "none" }}
            placeholder="e.g. Senior Software Engineer, Product Manager"
            value={form.designation}
            onChange={(e) => update("designation", e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", display: "block", marginBottom: 6 }}>Industry *</label>
            <select
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #334155", background: "#1A2A44", color: "#F5F5F0", fontSize: 15, outline: "none" }}
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
            >
              <option value="">Select</option>
              {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", display: "block", marginBottom: 6 }}>Experience *</label>
            <select
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #334155", background: "#1A2A44", color: "#F5F5F0", fontSize: 15, outline: "none" }}
              value={form.experience}
              onChange={(e) => update("experience", e.target.value)}
            >
              <option value="">Select</option>
              {EXPERIENCE_RANGES.map((exp) => <option key={exp} value={exp}>{exp}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", display: "block", marginBottom: 8 }}>Target Schools * <span style={{ color: "#64748B" }}>(select all that apply)</span></label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TARGET_SCHOOLS.map((school) => {
              const active = form.targetSchools.includes(school);
              return (
                <span
                  key={school}
                  onClick={() => toggleArray("targetSchools", school)}
                  style={{
                    padding: "8px 16px", borderRadius: 20, cursor: "pointer",
                    border: active ? "1.5px solid #C9A84C" : "1px solid #334155",
                    background: active ? "rgba(201,168,76,0.1)" : "#1A2A44",
                    color: active ? "#C9A84C" : "#94A3B8",
                    fontSize: 13, fontWeight: 500, transition: "all 0.2s",
                  }}
                >
                  {active ? "✓ " : ""}{school}
                </span>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", display: "block", marginBottom: 8 }}>Help Needed <span style={{ color: "#64748B" }}>(select all that apply)</span></label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {HELP_AREAS.map((area) => {
              const active = form.helpNeeded.includes(area);
              return (
                <span
                  key={area}
                  onClick={() => toggleArray("helpNeeded", area)}
                  style={{
                    padding: "8px 14px", borderRadius: 20, cursor: "pointer",
                    border: active ? "1.5px solid #C9A84C" : "1px solid #334155",
                    background: active ? "rgba(201,168,76,0.1)" : "#1A2A44",
                    color: active ? "#C9A84C" : "#94A3B8",
                    fontSize: 13, fontWeight: 500, transition: "all 0.2s",
                  }}
                >
                  {active ? "✓ " : ""}{area}
                </span>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", display: "block", marginBottom: 6 }}>Post-MBA Career Goal <span style={{ color: "#64748B" }}>(optional)</span></label>
          <input
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #334155", background: "#1A2A44", color: "#F5F5F0", fontSize: 15, outline: "none" }}
            placeholder="e.g. Transition to consulting, Product leadership"
            value={form.careerGoal}
            onChange={(e) => update("careerGoal", e.target.value)}
          />
        </div>

        <button
          onClick={() => canSubmit && onSubmit(form)}
          style={{
            width: "100%", padding: "16px 24px", borderRadius: 12, border: "none",
            background: canSubmit ? "#C9A84C" : "rgba(201,168,76,0.3)",
            color: "#0F1B2D", fontSize: 16, fontWeight: 600, cursor: canSubmit ? "pointer" : "not-allowed",
            transition: "all 0.3s",
          }}
        >
          Find My Perfect Match →
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 2: AI Analyzing Animation
// ============================================================
function AnalyzingScreen({ profile, onComplete }) {
  const [progress, setProgress] = useState([0, 0, 0, 0, 0]);
  const [currentStep, setCurrentStep] = useState(0);
  const labels = ["Parsing your profile", "Matching industry expertise", "Checking school specialization", "Evaluating experience alignment", "Ranking interview style fit"];

  useEffect(() => {
    const timers = labels.map((_, i) =>
      setTimeout(() => {
        setCurrentStep(i + 1);
        setProgress((prev) => {
          const next = [...prev];
          next[i] = 100;
          return next;
        });
      }, 800 + i * 900)
    );

    const done = setTimeout(() => onComplete(), 800 + labels.length * 900 + 600);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);

  return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
      {/* Pulsing AI core */}
      <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(201,168,76,0.08)", border: "1.5px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", margin: "0 auto 28px", animation: "pulseCore 2s ease infinite" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#C9A84C" }}>AI</div>
      </div>

      <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, fontWeight: 700, color: "#F5F5F0", margin: "0 0 8px" }}>
        Analyzing your profile...
      </h2>
      <p style={{ fontSize: 14, color: "#94A3B8", margin: "0 0 36px" }}>
        Matching <span style={{ color: "#C9A84C" }}>{profile.name}</span> against {INTERVIEWER_DB.length} expert interviewers
      </p>

      <div style={{ maxWidth: 400, margin: "0 auto", textAlign: "left" }}>
        {labels.map((label, i) => (
          <div key={i} style={{ marginBottom: 18, opacity: i <= currentStep ? 1 : 0.3, transition: "opacity 0.5s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#94A3B8" }}>{label}</span>
              <span style={{ fontSize: 13, color: progress[i] === 100 ? "#10B981" : "#C9A84C" }}>
                {progress[i] === 100 ? "✓" : i === currentStep ? "analyzing..." : ""}
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "#1A2A44", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress[i]}%`, background: progress[i] === 100 ? "#10B981" : "linear-gradient(90deg, #C9A84C, #E0BF65)", borderRadius: 2, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MATCHING ALGORITHM (Rule-based for V1)
// ============================================================
function computeMatches(profile) {
  const schoolMap = { "IIM Ahmedabad": "IIM A", "IIM Bangalore": "IIM B", "IIM Calcutta": "IIM C", "IIM Indore": "IIM I", "IIM Lucknow": "IIM L", "IIM Kozhikode": "IIM K", "ISB Hyderabad": "ISB", "XLRI Jamshedpur": "XLRI" };
  const targetShorts = profile.targetSchools.map((s) => schoolMap[s] || s);
  const helpMap = { "General Prep": "General Management", "Personal Interview": "Personal Interview", "WAT": "WAT", "Career Narrative": "Career Narrative", "Leadership Questions": "Leadership", "Stress Interview": "Stress Interview", "Product/Tech Questions": "Product Management" };
  const helpMapped = profile.helpNeeded.map((h) => helpMap[h] || h);

  const industryNorm = profile.industry.split("/")[0].trim();

  return INTERVIEWER_DB.map((mentor) => {
    let score = 0;
    const reasons = [];

    // Industry match (30%)
    const indMatch = mentor.industries.some((mi) => mi.toLowerCase().includes(industryNorm.toLowerCase()) || industryNorm.toLowerCase().includes(mi.toLowerCase()));
    if (indMatch) { score += 30; reasons.push("Same industry background"); }
    else { score += 5; }

    // School expertise (25%)
    const schoolOverlap = targetShorts.filter((s) => mentor.schools.includes(s));
    if (schoolOverlap.length > 0) {
      score += Math.min(25, schoolOverlap.length * 13);
      reasons.push(`${mentor.school.split(" ").slice(0, 2).join(" ")} alumni & panelist`);
    } else { score += 3; }

    // Experience alignment (20%)
    const expYears = parseInt(profile.experience) || 5;
    const diff = Math.abs(mentor.yrs - expYears);
    if (diff <= 4) { score += 20; reasons.push("Experience level alignment"); }
    else if (diff <= 8) { score += 12; }
    else { score += 5; }

    // Help area specialty (15%)
    const specMatch = helpMapped.filter((h) => mentor.specialties.some((s) => s.toLowerCase().includes(h.toLowerCase()) || h.toLowerCase().includes(s.toLowerCase())));
    if (specMatch.length > 0) {
      score += Math.min(15, specMatch.length * 8);
      reasons.push(`Specializes in ${mentor.specialties[0].toLowerCase()}`);
    } else { score += 3; }

    // Rating & sessions bonus (10%)
    const ratingScore = (mentor.rating / 5) * 6;
    const sessionScore = Math.min(4, (mentor.sessions / 100) * 4);
    score += Math.round(ratingScore + sessionScore);

    return { ...mentor, matchScore: Math.min(98, score), reasons: reasons.slice(0, 3) };
  })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);
}

// ============================================================
// STEP 3: Match Results
// ============================================================
function MatchResults({ profile, matches, onSelect, onBack }) {
  const [expanded, setExpanded] = useState(0);

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>🎯</div>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, fontWeight: 700, color: "#F5F5F0", margin: "0 0 8px" }}>
          Your AI-Matched Interviewers
        </h2>
        <p style={{ fontSize: 14, color: "#94A3B8" }}>
          Ranked by compatibility with your profile
        </p>
      </div>

      {/* Profile summary */}
      <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 12, padding: "12px 18px", marginBottom: 24, fontSize: 13, color: "#10B981", lineHeight: 1.6 }}>
        Profile: <span style={{ color: "#F5F5F0" }}>{profile.name}</span> · {profile.industry} · {profile.experience} · Targeting {profile.targetSchools.join(", ")}
      </div>

      {/* Match cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {matches.map((mentor, i) => {
          const isExpanded = expanded === i;
          const isTop = i === 0;
          return (
            <div
              key={mentor.id}
              style={{
                background: "#1A2A44",
                borderRadius: 16,
                border: isTop ? "1.5px solid #C9A84C" : "1px solid #334155",
                padding: "24px",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
              onClick={() => setExpanded(i)}
            >
              {isTop && (
                <div style={{ position: "absolute", top: 12, right: 14, fontSize: 10, fontWeight: 600, color: "#0F1B2D", background: "#C9A84C", borderRadius: 6, padding: "3px 10px", letterSpacing: "0.5px" }}>
                  BEST MATCH
                </div>
              )}

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                {/* Avatar */}
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #0F1B2D, #1A2A44)", border: `2px solid ${isTop ? "#C9A84C" : "#334155"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#C9A84C" }}>{mentor.initials}</span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 600, color: "#F5F5F0" }}>{mentor.name}</div>
                      <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>{mentor.school} '{mentor.year.slice(-2)} | {mentor.firm} | {mentor.yrs} yrs</div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: isTop ? "#C9A84C" : `rgba(201,168,76,${0.8 - i * 0.15})` }}>
                      {mentor.matchScore}%
                    </div>
                  </div>

                  {/* Match reasons */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                    {mentor.reasons.map((reason) => (
                      <span key={reason} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, color: "#10B981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        {reason}
                      </span>
                    ))}
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ marginTop: 16, animation: "fadeIn 0.3s ease" }}>
                      <div style={{ height: 1, background: "#334155", marginBottom: 14 }} />
                      <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6, margin: "0 0 12px" }}>
                        {mentor.bio}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                          <span style={{ color: "#F5F5F0" }}>⭐ {mentor.rating}</span>
                          <span style={{ color: "#94A3B8" }}>{mentor.sessions} sessions</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelect(mentor); }}
                          style={{
                            padding: "10px 24px", borderRadius: 10, border: "none",
                            background: "#C9A84C", color: "#0F1B2D", fontSize: 14, fontWeight: 600,
                            cursor: "pointer", transition: "all 0.2s",
                          }}
                        >
                          Select {mentor.name.split(" ")[0]} →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#94A3B8", fontSize: 14, cursor: "pointer", padding: "8px 16px" }}>
          ← Back to profile
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 4: Match Confirmed
// ============================================================
function MatchConfirmed({ profile, mentor, onReset }) {
  return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
      {/* Confetti */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${10 + Math.random() * 80}%`,
              top: -10,
              width: 6 + Math.random() * 6,
              height: 6 + Math.random() * 6,
              borderRadius: Math.random() > 0.5 ? "50%" : 2,
              background: ["#C9A84C", "#E0BF65", "#10B981", "#F5F5F0"][i % 4],
              animation: `confettiFall ${2 + Math.random() * 2}s ease ${Math.random() * 0.8}s forwards`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      <div style={{ fontSize: 56, marginBottom: 16 }}>✓</div>

      <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 32, fontWeight: 700, color: "#F5F5F0", margin: "0 0 8px" }}>
        Perfect Match Found!
      </h2>

      <p style={{ fontSize: 16, color: "#94A3B8", marginBottom: 32 }}>
        You've been matched with your ideal interviewer
      </p>

      {/* Mentor card */}
      <div style={{ background: "#1A2A44", borderRadius: 16, border: "1.5px solid #C9A84C", padding: "32px", maxWidth: 480, margin: "0 auto 24px", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #0F1B2D, #1A2A44)", border: "2px solid #C9A84C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#C9A84C" }}>{mentor.initials}</span>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#F5F5F0" }}>{mentor.name}</div>
            <div style={{ fontSize: 14, color: "#94A3B8", marginTop: 2 }}>{mentor.school} '{mentor.year.slice(-2)} | {mentor.firm}</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 28, fontWeight: 700, color: "#C9A84C" }}>{mentor.matchScore}%</div>
        </div>

        <div style={{ height: 1, background: "#334155", marginBottom: 16 }} />

        <div style={{ fontSize: 13, color: "#C9A84C", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>Why This Match</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {mentor.reasons.map((r) => (
            <span key={r} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, color: "#10B981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>{r}</span>
          ))}
        </div>

        <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>{mentor.bio}</p>
      </div>

      {/* AI-generated prep tips */}
      <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 12, padding: "20px 24px", maxWidth: 480, margin: "0 auto 28px", textAlign: "left" }}>
        <div style={{ fontSize: 13, color: "#C9A84C", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>AI Prep Tips for {profile.name}</div>
        <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7, margin: 0 }}>
          Based on your {profile.industry} background targeting {profile.targetSchools[0]}, {mentor.name.split(" ")[0]} will likely focus on: <span style={{ color: "#F5F5F0" }}>career switch motivation, leadership examples from your {profile.experience} of experience, and why a 1-year MBA program specifically.</span> Prepare structured 2-minute answers for each.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          style={{ padding: "14px 28px", borderRadius: 10, border: "none", background: "#C9A84C", color: "#0F1B2D", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          Book Session with {mentor.name.split(" ")[0]} →
        </button>
        <button
          onClick={onReset}
          style={{ padding: "14px 24px", borderRadius: 10, border: "1px solid #334155", background: "transparent", color: "#94A3B8", fontSize: 14, cursor: "pointer" }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function AISmartMatch() {
  const [step, setStep] = useState("form"); // form | analyzing | results | confirmed
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const handleSubmit = (formData) => {
    setProfile(formData);
    setStep("analyzing");
  };

  const handleAnalysisComplete = () => {
    const results = computeMatches(profile);
    setMatches(results);
    setStep("results");
  };

  const handleSelect = (mentor) => {
    setSelectedMentor(mentor);
    setStep("confirmed");
  };

  const handleReset = () => {
    setStep("form");
    setProfile(null);
    setMatches([]);
    setSelectedMentor(null);
  };

  return (
    <div style={{ background: "#0F1B2D", minHeight: "100vh", fontFamily: "'Inter',sans-serif", padding: "40px 24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseCore { 0%,100% { box-shadow: 0 0 30px rgba(201,168,76,0.15); } 50% { box-shadow: 0 0 60px rgba(201,168,76,0.3); } }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 0.9; } 100% { transform: translateY(600px) rotate(720deg); opacity: 0; } }
        select option { background: #1A2A44; color: #F5F5F0; }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {step === "form" && <ProfileForm onSubmit={handleSubmit} />}
        {step === "analyzing" && <AnalyzingScreen profile={profile} onComplete={handleAnalysisComplete} />}
        {step === "results" && <MatchResults profile={profile} matches={matches} onSelect={handleSelect} onBack={handleReset} />}
        {step === "confirmed" && <MatchConfirmed profile={profile} mentor={selectedMentor} onReset={handleReset} />}
      </div>
    </div>
  );
}
