import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type { IResponseApiPagination } from "@/shared/types/api";
import type { Job, JobApiItem, JobListResponse } from "@/shared/types/job";

export interface FetchJobsParams {
  page?: number;
  limit?: number;
  q?: string;
  careerCategoryId?: string;
  careerCategorySlug?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  companyId?: string;
  status?: string;
  jobType?: string;
  skillIds?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface FetchJobsResult {
  jobs: Job[];
  pagination?: IResponseApiPagination;
}

function buildJobsPath({
  page = 1,
  limit = 3,
  careerCategoryId,
  careerCategorySlug,
  location,
  salaryMin,
  salaryMax,
  experienceYears,
  companyId,
  status,
  jobType,
  skillIds,
  sortBy,
  sortOrder,
  q,
}: FetchJobsParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (careerCategoryId) {
    searchParams.set("careerCategoryId", careerCategoryId);
  }

  if (careerCategorySlug) {
    searchParams.set("careerCategorySlug", careerCategorySlug);
  }

  if (q) {
    searchParams.set("q", q);
  }

  if (location) {
    searchParams.set("location", location);
  }

  if (typeof salaryMin === "number") {
    searchParams.set("salaryMin", `${salaryMin}`);
  }

  if (typeof salaryMax === "number") {
    searchParams.set("salaryMax", `${salaryMax}`);
  }

  if (typeof experienceYears === "number") {
    searchParams.set("experienceYears", `${experienceYears}`);
  }

  if (companyId) {
    searchParams.set("companyId", companyId);
  }

  if (status) {
    searchParams.set("status", status);
  }

  if (jobType) {
    searchParams.set("jobType", jobType);
  }

  if (skillIds) {
    searchParams.set("skillIds", skillIds);
  }

  if (sortBy) {
    searchParams.set("sortBy", sortBy);
  }

  if (sortOrder) {
    searchParams.set("sortOrder", sortOrder);
  }

  return `${API_ROUTES.JOB.BASE}?${searchParams.toString()}`;
}

function toOptionalDate(value: string | null): Date | undefined {
  return value ? new Date(value) : undefined;
}

function toOptionalNumber(value: number | null): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function toOptionalString(value: string | null): string | undefined {
  return value ?? undefined;
}

function mapJobApiItemToJob(job: JobApiItem): Job {
  return {
    id: job.id,
    title: job.title,
    shortDescription: toOptionalString(job.shortDescription),
    description: toOptionalString(job.description),
    location: toOptionalString(job.location),
    salaryMin: toOptionalNumber(job.salaryMin),
    salaryMax: toOptionalNumber(job.salaryMax),
    experienceYears: toOptionalNumber(job.experienceYears),
    expiredAt: toOptionalDate(job.expiredAt),
    jobType: job.jobType,
    rejectReason: toOptionalString(job.rejectReason),
    status: job.status,
    skills: job.skills ?? undefined,
    isFavourited: job.isFavourited ?? undefined,
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
    company: job.company ?? undefined,
    companyName: job.company?.companyName ?? undefined,
    careerCategory: job.careerCategory ?? undefined,
    careerCategoryName: job.careerCategory?.name ?? undefined,
  };
}

export async function fetchJobs(
  params?: FetchJobsParams,
): Promise<FetchJobsResult> {
  const response = await apiService.get<JobListResponse>(
    buildJobsPath(params),
    {
      cache: "no-store",
    },
  );

  return {
    jobs: response.data.map(mapJobApiItemToJob),
    pagination: response.pagination,
  };
}
