import type { EJobStatus, EJobType } from "@/shared/constants/enums/job.enum";

import type { IResponseApiList } from "@/shared/types/api";

// ─────────────────────── Relations ───────────────────────

export interface JobApiCompany {
  id: string;
  companyName: string | null;
  logoUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
}

export interface JobApiCareerCategory {
  id: string;
  name: string | null;
  slug: string | null;
}

export interface JobSkill {
  id: string;
  name: string;
  weight?: number;
}

// ─────────────────────── Raw API item ───────────────────────

export interface JobApiItem {
  id: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  experienceYears: number | null;
  expiredAt: string | null;
  jobType: EJobType;
  rejectReason: string | null;
  status: EJobStatus;
  createdAt: string;
  updatedAt: string;
  company: JobApiCompany | null;
  careerCategory: JobApiCareerCategory | null;
  skills: JobSkill[] | null;
  isFavourited: boolean | null;
}

// ─────────────────────── UI model ───────────────────────

export interface Job {
  id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  expiredAt?: Date;
  jobType: EJobType;
  rejectReason?: string;
  status: EJobStatus;
  skills?: JobSkill[];
  isFavourited?: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: JobApiCompany;
  companyName?: string;
  careerCategory?: JobApiCareerCategory;
  careerCategoryName?: string;
}

// ─────────────────────── List response ───────────────────────

export type JobListResponse = IResponseApiList<JobApiItem>;

// ─────────────────────── Create / Update payload ───────────────────────

export interface CreateJobPayload {
  title: string;
  shortDescription?: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  careerCategoryId?: string;
  expiredAt?: string;
  jobType: EJobType;
  skills?: { skillId: string; weight?: number }[];
}

export type UpdateJobPayload = Partial<CreateJobPayload>;
