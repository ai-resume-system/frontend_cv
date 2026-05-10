export interface JobCompany {
  id?: string;
  name?: string;
  companyName?: string;
  logoUrl?: string;
}

export interface JobLocation {
  province?: string;
  city?: string;
  address?: string;
}

export interface Job {
  id: string;
  title: string;
  company?: JobCompany | string;
  companyName?: string;
  location?: JobLocation | string;
  province?: string;
  city?: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  workType?: string;
  jobType?: string;
  employmentType?: string;
  matchScore?: number;
  aiMatchScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobListResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
}
