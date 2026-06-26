import type { EJobStatus, EJobType, EJobEducationLevel, EJobWorkArrangement, EJobAction } from "@/shared/constants/enums/job.enum";
import type { IResponseApiList } from "@/shared/types/api";

export interface JobApiCareerCategory {
  id: string;
  name: string | null;
  slug: string | null;
}

export interface JobApiCompany {
  id: string;
  slug?: string | null;
  name?: string | null;
  logoUrl: string | null;
  bannerUrl?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  websiteUrl?: string | null;
  taxCode?: string | null;
  employeeMin?: number | null;
  employeeMax?: number | null;
}

export interface JobSkill {
  id: string;
  name: string;
  slug?: string | null;
  weight?: number;
}

export interface JobApiItem {
  id: string;
  slug?: string | null;
  title: string;
  shortDescription: string | null;
  description: string | null;
  address?: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  vacancyCount?: number | null;
  experienceYears: number | null;
  expiredAt: string | null;
  jobType: EJobType;
  educationLevel: EJobEducationLevel | null;
  workArrangement: EJobWorkArrangement | null;
  rejectReason?: string | null;
  closeReason?: string | null;
  status: EJobStatus;
  createdAt: string;
  updatedAt: string;
  company: JobApiCompany | null;
  careerCategory: JobApiCareerCategory | null;
  skills: JobSkill[] | null;
  isFavourited: boolean | null;
}

export interface Job {
  id: string;
  slug?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  address?: string;
  salaryMin?: number;
  salaryMax?: number;
  vacancyCount?: number;
  experienceYears?: number;
  expiredAt?: Date;
  jobType: EJobType;
  educationLevel?: EJobEducationLevel;
  workArrangement?: EJobWorkArrangement;
  rejectReason?: string;
  closeReason?: string;
  status: EJobStatus;
  skills?: JobSkill[];
  isFavourited?: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: JobApiCompany;
  careerCategory?: JobApiCareerCategory;
}

export type JobListResponse = IResponseApiList<JobApiItem>;

export interface CreateJobPayload {
  title: string;
  shortDescription?: string;
  description?: string;
  address?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  vacancyCount?: number;
  careerCategoryId?: string;
  expiredAt?: string;
  jobType?: EJobType;
  educationLevel?: EJobEducationLevel;
  workArrangement?: EJobWorkArrangement;
  action?: EJobAction;
  skills?: { skillId: string; weight?: number }[];
}

export type UpdateJobPayload = Partial<CreateJobPayload>;

export type JobMatchResponse = {
  cvId: string;
  jobId: string;
  jobSlug: string;
  matchScore: number;
  breakdown: {
    skillMatch: number;
    careerCategoryMatch: number;
    experienceMatch: number;
    titleKeywordSimilarity: number;
    preferenceMatch: number;
  };
  matchedSkills: Array<{
    name: string;
    normalizedName: string;
    systemSkillSlug?: string;
    confidence?: number;
  }>;
  missingSkills: Array<{
    id: string;
    name: string;
    slug: string;
    weight?: number;
  }>;
  strengths: string[];
  risks: string[];
  improvementSuggestions: string[];
  computedAt: string;
};
