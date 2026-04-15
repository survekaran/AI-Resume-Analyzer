import type { ResumeAnalysis, BreakdownScore } from './types';

// ─── Skill dictionaries ─────────────────────────────────────────────────────
const TECH_SKILLS = [
  'javascript','typescript','python','java','c++','c#','go','rust','php','ruby','swift','kotlin','scala',
  'react','angular','vue','next.js','nuxt','svelte','node.js','express','django','flask','fastapi',
  'spring boot','laravel','rails',
  'sql','postgresql','mysql','mongodb','redis','elasticsearch','firebase','supabase','dynamodb',
  'aws','azure','gcp','docker','kubernetes','terraform','ci/cd','github actions','jenkins',
  'machine learning','deep learning','tensorflow','pytorch','pandas','numpy','scikit-learn','nlp',
  'rest api','graphql','microservices','serverless','kafka','rabbitmq',
  'html','css','sass','tailwind','webpack','vite','git',
  'figma','sketch','photoshop','illustrator',
];

const SOFT_SKILLS = [
  'leadership','communication','teamwork','problem solving','critical thinking','project management',
  'agile','scrum','collaboration','time management','adaptability','creativity','mentoring',
  'analytical','strategic','presentation','cross-functional',
];

const IMPORTANT_KEYWORDS = [
  'achieved','improved','increased','reduced','delivered','built','led','managed','developed',
  'optimized','launched','scaled','automated','designed','architected','implemented',
  '%','million','thousand','k users','team','cross-functional','stakeholder','roadmap',
];

const MISSING_KEYWORDS_POOL = [
  'quantified achievements','measurable impact','leadership experience','cross-functional collaboration',
  'stakeholder management','agile methodology','continuous improvement','data-driven decisions',
  'scalability','performance optimization','technical documentation','code review','mentoring',
  'product roadmap','A/B testing','CI/CD pipeline','test-driven development','system design',
];

// ─── Text extraction helpers ────────────────────────────────────────────────
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s.%]/g, ' ').replace(/\s+/g, ' ');
}

function extractSkills(text: string): string[] {
  const norm = normalize(text);
  const all = [...TECH_SKILLS, ...SOFT_SKILLS];
  return all.filter(skill => norm.includes(skill.toLowerCase()));
}

function extractMissingKeywords(text: string, foundSkills: string[]): string[] {
  const norm = normalize(text);
  const missing: string[] = [];

  // Missing from pool
  for (const kw of MISSING_KEYWORDS_POOL) {
    if (!norm.includes(kw.toLowerCase())) missing.push(kw);
  }

  // Suggest commonly missing tech skills
  const commonTech = ['docker','kubernetes','ci/cd','aws','typescript','graphql','testing'];
  for (const t of commonTech) {
    if (!foundSkills.map(s => s.toLowerCase()).includes(t)) missing.push(t);
  }

  // Deduplicate and limit
  return [...new Set(missing)].slice(0, 10);
}

// ─── Work Experience parser ─────────────────────────────────────────────────
function extractWorkExperience(text: string) {
  const results: { role: string; company: string; period: string }[] = [];
  const lines = text.split(/\n|\r/).map(l => l.trim()).filter(Boolean);

  // Common job title patterns
  const rolePatterns = [
    /\b(senior|junior|lead|staff|principal|associate)?\s*(software|frontend|backend|full.?stack|devops|data|machine learning|ml|ai|product|ui\/ux|web|mobile|cloud|security|qa|test)\s*(engineer|developer|architect|scientist|analyst|designer|manager|lead|consultant|intern)\b/i,
    /\b(software engineer|product manager|project manager|data scientist|data analyst|devops engineer|solutions architect|engineering manager|cto|vp of engineering|tech lead)\b/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isRole = rolePatterns.some(p => p.test(line));
    if (isRole && i + 1 < lines.length) {
      // Try to get company from next line
      const companyLine = lines[i + 1] || '';
      // Look for a date range in nearby lines
      const datePattern = /(\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\b.{1,20}\d{4}|\d{4}\s*[-–]\s*(\d{4}|present|current))/i;
      let period = '';
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const m = lines[j].match(datePattern);
        if (m) { period = m[0]; break; }
      }
      results.push({
        role: line.split(/\s{2,}|,|\|/)[0].trim(),
        company: companyLine.split(/\s{2,}|,|\||–|-/)[0].trim(),
        period: period || 'N/A',
      });
      if (results.length >= 4) break;
    }
  }

  if (results.length === 0) {
    // Fallback: generic entries if text is too jumbled
    results.push({ role: 'Position detected in resume', company: 'Company', period: 'Refer to resume' });
  }

  return results;
}

// ─── Education parser ────────────────────────────────────────────────────────
function extractEducation(text: string) {
  const results: { degree: string; institution: string; year: string }[] = [];
  const textLower = text.toLowerCase();
  const degrees = ["bachelor", "master", "phd", "b.sc","b.e","b.tech","m.tech","m.sc","mba","associate","diploma","doctorate"];
  const lines = text.split(/\n|\r/).map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (degrees.some(d => lineLower.includes(d))) {
      const yearMatch = lines[i].match(/\d{4}/);
      results.push({
        degree: lines[i].split(/\s{2,}|,|\|/)[0].trim(),
        institution: lines[i + 1] || 'Institution',
        year: yearMatch ? yearMatch[0] : 'N/A',
      });
      if (results.length >= 3) break;
    }
  }

  // Fixed precedence: (A && B) || C  →  A && (B || C)
  if (results.length === 0 && (textLower.includes('university') || textLower.includes('college'))) {
    for (const line of lines) {
      if (/university|college|institute|school/i.test(line)) {
        results.push({ degree: 'Degree', institution: line.trim(), year: 'N/A' });
        if (results.length >= 2) break;
      }
    }
  }
  return results;
}

// ─── Main analyzer ────────────────────────────────────────────────────────────
export function analyzeResume(text: string): ResumeAnalysis {
  const norm = normalize(text);
  const wordCount = text.trim().split(/\s+/).length;
  const lines = text.split(/\n|\r/).filter(l => l.trim().length > 0);

  // ── Extract ──────────────────────────────────────────────────────────────
  const extractedSkills = extractSkills(text);
  const missingKeywords = extractMissingKeywords(text, extractedSkills);
  const workExperience = extractWorkExperience(text);
  const education = extractEducation(text);

  // ── Booleans ──────────────────────────────────────────────────────────────
  const hasSummary = /summary|objective|profile|about me/i.test(text);
  const hasQuantifiedAchievements = /\d+\s*%|\$\s*\d+|\d+[k|m|b]\b|\d+\s*(users|clients|customers|revenue|million|thousand)/i.test(text);
  const hasActionVerbs = IMPORTANT_KEYWORDS.some(kw => norm.includes(kw));
  const hasLinkedIn = /linkedin\.com|linkedin/i.test(text);
  const hasEmail = /[\w.-]+@[\w.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s\-()]{7,}\d)/.test(text);
  const hasGithub = /github\.com|github/i.test(text);

  // ── Sub-scores (0-100) ────────────────────────────────────────────────────
  const skillScore = Math.min(100, Math.round((extractedSkills.length / 18) * 100));
  
  const contentScore = Math.min(100, Math.round(
    (hasQuantifiedAchievements ? 30 : 0) +
    (hasSummary ? 20 : 0) +
    (hasActionVerbs ? 20 : 0) +
    Math.min(30, (wordCount / 600) * 30)
  ));

  const formatScore = Math.min(100, Math.round(
    (hasEmail ? 20 : 0) +
    (hasPhone ? 15 : 0) +
    (hasLinkedIn ? 20 : 0) +
    (hasGithub ? 15 : 0) +
    (lines.length > 20 ? 20 : Math.round((lines.length / 20) * 20)) +
    (wordCount > 300 ? 10 : Math.round((wordCount / 300) * 10))
  ));

  const experienceScore = Math.min(100, Math.round(
    (workExperience.length > 1 ? 50 : workExperience.length * 30) +
    (education.length > 0 ? 30 : 0) +
    (hasQuantifiedAchievements ? 20 : 0)
  ));

  const impactScore = Math.min(100, Math.round(
    (hasQuantifiedAchievements ? 40 : 0) +
    (hasActionVerbs ? 30 : 0) +
    Math.min(30, extractedSkills.filter(s => TECH_SKILLS.includes(s)).length * 4)
  ));
  const atsScore = Math.min(100, Math.round(
    formatScore * 0.35 +
    skillScore * 0.25 +
    contentScore * 0.20 +
    experienceScore * 0.10 +
    (hasSummary ? 5 : 0) +
    (hasQuantifiedAchievements ? 5 : 0)
  ));
  // ── Overall weighted score ────────────────────────────────────────────────
  const overallScore = Math.min(100, Math.round(
    skillScore * 0.25 +
    contentScore * 0.25 +
    formatScore * 0.20 +
    experienceScore * 0.20 +
    impactScore * 0.10
  ));

  const grade =
    overallScore >= 80 ? 'excellent' :
    overallScore >= 60 ? 'good' :
    overallScore >= 40 ? 'fair' : 'poor';

  const gradeLabel =
    grade === 'excellent' ? '🏆 Excellent' :
    grade === 'good'      ? '👍 Good' :
    grade === 'fair'      ? '⚡ Needs Work' : '🔧 Needs Major Work';

  // ── Strengths ─────────────────────────────────────────────────────────────
  const strengths: string[] = [];
  if (extractedSkills.length >= 10) strengths.push(`Strong technical profile with ${extractedSkills.length} detected skills`);
  if (hasSummary) strengths.push('Professional summary / objective section present');
  if (hasQuantifiedAchievements) strengths.push('Contains quantified achievements — great for ATS & recruiters');
  if (hasLinkedIn) strengths.push('LinkedIn profile included');
  if (hasGithub) strengths.push('GitHub profile available — demonstrates active coding');
  if (workExperience.length > 1) strengths.push(`${workExperience.length} work experiences clearly listed`);
  if (education.length > 0) strengths.push('Education section properly included');
  if (wordCount > 400) strengths.push(`Good resume length (${wordCount} words) — detailed and comprehensive`);
  if (strengths.length === 0) strengths.push('Resume text was successfully parsed');

  // ── Weaknesses ────────────────────────────────────────────────────────────
  const weaknesses: string[] = [];
  if (!hasSummary) weaknesses.push('No professional summary detected — add a 3-4 line overview');
  if (!hasQuantifiedAchievements) weaknesses.push('Lacks quantified achievements — use numbers to show impact');
  if (!hasLinkedIn) weaknesses.push('No LinkedIn profile URL found');
  if (!hasGithub) weaknesses.push('No GitHub profile — consider adding it for tech roles');
  if (extractedSkills.length < 6) weaknesses.push('Too few skills detected — expand your skills section');
  if (wordCount < 300) weaknesses.push(`Resume might be too short (${wordCount} words) — add more detail`);
  if (!hasEmail) weaknesses.push('Email address not detected in resume');
  if (!hasPhone) weaknesses.push('Phone number not detected — make sure it\'s included');

  // ── Actionable tips ───────────────────────────────────────────────────────
  const actionableTips = [
    'Use strong action verbs: "Architected", "Scaled", "Reduced latency by X%"',
    'Tailor your resume for each job description — match their keywords',
    'Keep formatting ATS-friendly: avoid tables, images, or complex layouts',
    'List your tech stack prominently in a dedicated "Skills" section',
    hasQuantifiedAchievements
      ? 'Great job adding metrics! Try adding more (cost savings, team size, etc.)'
      : 'Add at least 3 quantified achievements: "Reduced page load by 40%"',
    'Use consistent date formatting throughout (e.g., Jan 2022 – Present)',
    missingKeywords.length > 0
      ? `Consider adding these keywords: ${missingKeywords.slice(0, 3).join(', ')}`
      : 'Your keyword coverage looks solid!',
  ];

  // ── Breakdown ─────────────────────────────────────────────────────────────
  const breakdown: BreakdownScore[] = [
    { label: 'Skills & Keywords',     score: skillScore,      color: 'default' },
    { label: 'Content & Clarity',     score: contentScore,    color: contentScore >= 60 ? 'emerald' : 'amber' },
    { label: 'Format & Contact Info', score: formatScore,     color: formatScore >= 60 ? 'default' : 'amber' },
    { label: 'ATS Compatibility',      score: atsScore,        color: atsScore >= 70 ? 'emerald' : atsScore >= 45 ? 'amber' : 'rose' },
    { label: 'Experience & Education',score: experienceScore, color: 'emerald' },
    { label: 'Impact & Achievements', score: impactScore,     color: impactScore >= 50 ? 'emerald' : 'rose' },
  ];

  return {
    overallScore,
    grade,
    gradeLabel,
    extractedSkills,
    missingKeywords,
    workExperience,
    education,
    strengths,
    weaknesses,
    actionableTips,
    breakdown,
    atsScore,
    wordCount,
    hasSummary,
    hasQuantifiedAchievements,
  };
}
