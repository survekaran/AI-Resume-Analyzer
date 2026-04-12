export type WorkExperience = {
  role: string;
  company: string;
  period: string;
};

export type Education = {
  degree: string;
  institution: string;
  year: string;
};

export type BreakdownScore = {
  label: string;
  score: number;
  color: 'default' | 'amber' | 'rose' | 'emerald';
};

export type ResumeAnalysis = {
  overallScore: number;
  grade: 'excellent' | 'good' | 'fair' | 'poor';
  gradeLabel: string;

  extractedSkills: string[];
  missingKeywords: string[];

  workExperience: WorkExperience[];
  education: Education[];

  strengths: string[];
  weaknesses: string[];
  actionableTips: string[];

  breakdown: BreakdownScore[];

  wordCount: number;
  hasSummary: boolean;
  hasQuantifiedAchievements: boolean;
};

export type AnalysisStep =
  | 'idle'
  | 'extracting'
  | 'parsing'
  | 'scoring'
  | 'done';

// Needed to make this a valid ES module for Rolldown/Vite 8
export const _types = true;
