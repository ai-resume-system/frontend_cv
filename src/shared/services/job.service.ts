import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type { IResponseApiPagination } from "@/shared/types/api";
import type { Job, JobApiItem, JobListResponse } from "@/shared/types/job";

export interface FetchJobsParams {
  page?: number;
  limit?: number;
  careerCategoryId?: string;
  q?: string;
}

export interface FetchJobsResult {
  jobs: Job[];
  pagination?: IResponseApiPagination;
}

function buildJobsPath({
  page = 1,
  limit = 3,
  careerCategoryId,
  q,
}: FetchJobsParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (careerCategoryId) {
    searchParams.set("careerCategoryId", careerCategoryId);
  }

  if (q) {
    searchParams.set("q", q);
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
    location: toOptionalString(job.location),
    salaryMin: toOptionalNumber(job.salaryMin),
    salaryMax: toOptionalNumber(job.salaryMax),
    experienceYears: toOptionalNumber(job.experienceYears),
    expiredAt: toOptionalDate(job.expiredAt),
    status: job.status,
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
    company: job.company ?? undefined,
    companyName: job.company?.companyName ?? undefined,
    careerCategory: job.careerCategory ?? undefined,
    careerCategoryName: job.careerCategory?.name ?? undefined,
  };
}

export async function fetchJobs(params?: FetchJobsParams): Promise<FetchJobsResult> {
  const response = await apiService.get<JobListResponse>(buildJobsPath(params), {
    cache: "no-store",
  });

  return {
    jobs: response.data.map(mapJobApiItemToJob),
    pagination: response.pagination,
  };
}
