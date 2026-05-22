import type { IResponseApiList } from "@/shared/types/api";

import { EJobStatus } from "../constants/enums/job.enum";

export interface JobApiCompany {
  id: string;
  companyName: string;
  logoUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
}

export interface JobApiCareerCategory {
  id: string;
  name: string;
  slug: string;
}

export interface JobApiItem {
  id: string;
  title: string;
  shortDescription: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  experienceYears: number | null;
  expiredAt: string | null;
  status: EJobStatus;
  createdAt: string;
  updatedAt: string;
  company?: JobApiCompany | null;
  careerCategory?: JobApiCareerCategory | null;
}

export interface Job {
  id: string;
  title: string;
  shortDescription?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  expiredAt?: Date;
  status: EJobStatus;
  createdAt: Date;
  updatedAt: Date;
  company?: JobApiCompany;
  companyName?: string;
  careerCategory?: JobApiCareerCategory;
  careerCategoryName?: string;
}

export type JobListResponse = IResponseApiList<JobApiItem>;
