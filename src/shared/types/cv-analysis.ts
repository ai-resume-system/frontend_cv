import type { EProcessingStatus } from "@/shared/constants/enums/cv.enum";

export interface CvAnalysisConfidenceFlags {
  hasEmail?: boolean | null;
  hasPhone?: boolean | null;
  hasEducation?: boolean | null;
  hasExperience?: boolean | null;
  hasSkills?: boolean | null;
  [key: string]: boolean | null | undefined;
}

export interface CvAnalysisSkill {
  name: string;
  normalizedName: string | null;
  confidence: number | null;
  skillId: string | null;
}

export interface CvAnalysisEducation {
  school: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

export interface CvAnalysisExperience {
  company: string | null;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

export interface CvAnalysisResponse {
  cvId: string;
  parsedDataId: string | null;
  processingStatus: EProcessingStatus;
  summary: string | null;
  score: number | null;
  skills: CvAnalysisSkill[];
  education: CvAnalysisEducation[];
  experience: CvAnalysisExperience[];
  suggestions: string[];
  rawText: string | null;
  provider: string | null;
  model: string | null;
  confidenceFlags: CvAnalysisConfidenceFlags | null;
  promptVersion: string | null;
  analyzedAt: string | null;
  updatedAt: string;
}

export interface CvAnalyzeResponse {
  cvId: string;
  parsedDataId?: string | null;
  processingStatus: EProcessingStatus;
  message: string;
}
