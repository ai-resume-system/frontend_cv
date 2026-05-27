import type { EProcessingStatus } from "@/shared/constants/enums/cv.enum";

// ─────────────────────── Skills extracted from CV ───────────────────────

export interface CvAnalysisSkill {
  name: string;
  normalizedName: string;
  confidence: number | null;
  skillId: string | null;
}

// ─────────────────────── Education entries ───────────────────────

export interface CvAnalysisEducation {
  school: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

// ─────────────────────── Experience entries ───────────────────────

export interface CvAnalysisExperience {
  company: string | null;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

// ─────────────────────── Full analysis response ───────────────────────

export interface CvAnalysisResponse {
  cvId: string;
  processingStatus: EProcessingStatus;
  summary: string | null;
  score: number | null;
  skills: CvAnalysisSkill[];
  education: CvAnalysisEducation[];
  experience: CvAnalysisExperience[];
  suggestions: string[];
  rawText: string | null;
  parsedDataId: string | null;
  updatedAt: string;
}

// ─────────────────────── Trigger analysis response ───────────────────────

export interface CvAnalyzeResponse {
  cvId: string;
  processingStatus: EProcessingStatus;
  message: string;
}
