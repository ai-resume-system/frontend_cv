import { EJobStatus, EJobType } from "../constants/enums/job.enum";

export interface JobCompany {
  id?: string;
  name?: string;
  companyName?: string;
  logoUrl?: string;
}

export interface JobLocation {
  province?: string;
  city?: string;
  location?: string;
}

export interface Job {
  id: string;
  companyId: string;
  careerCategoryId?: string;
  title: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  jobType: EJobType;
  expiredAt?: Date;
  rejectReason?: string;
  status: EJobStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface JobListResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
}
