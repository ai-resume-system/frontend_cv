import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type {
  IResponseApiItem,
  IResponseApiPagination,
} from "@/shared/types/api";
import type { Job, JobApiItem, JobListResponse } from "@/shared/types/job";

export interface FetchJobsParams {
  page?: number;
  limit?: number;
  q?: string;
  address?: string;
  careerCategoryId?: string;
  careerCategorySlug?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  experienceYearsMin?: number;
  experienceYearsMax?: number;
  companyId?: string;
  companySlug?: string;
  status?: string;
  jobType?: string;
  educationLevel?: string;
  workArrangement?: string;
  skillIds?: string | string[];
  skillSlugs?: string | string[];
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface FetchJobsResult {
  jobs: Job[];
  pagination?: IResponseApiPagination;
}

export interface FetchRelatedJobsParams {
  limit?: number;
}

function buildJobsPath({
  page = 1,
  limit = 3,
  address,
  careerCategoryId,
  careerCategorySlug,
  salaryMin,
  salaryMax,
  experienceYears,
  experienceYearsMin,
  experienceYearsMax,
  companyId,
  companySlug,
  status,
  jobType,
  educationLevel,
  workArrangement,
  skillIds,
  skillSlugs,
  sortBy,
  sortOrder,
  q,
}: FetchJobsParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (q) {
    searchParams.set("q", q);
  }

  if (careerCategoryId) {
    searchParams.set("careerCategoryId", careerCategoryId);
  }

  if (careerCategorySlug) {
    searchParams.set("careerCategorySlug", careerCategorySlug);
  }

  if (address) {
    searchParams.set("address", address);
  }

  if (typeof salaryMin === "number") {
    searchParams.set("salaryMin", `${salaryMin}`);
  }

  if (typeof salaryMax === "number") {
    searchParams.set("salaryMax", `${salaryMax}`);
  }

  if (typeof experienceYearsMin === "number") {
    searchParams.set("experienceYearsMin", `${experienceYearsMin}`);
  }

  if (typeof experienceYearsMax === "number") {
    searchParams.set("experienceYearsMax", `${experienceYearsMax}`);
  }

  if (
    typeof experienceYears === "number" &&
    typeof experienceYearsMin !== "number" &&
    typeof experienceYearsMax !== "number"
  ) {
    searchParams.set("experienceYears", `${experienceYears}`);
  }

  if (companyId) {
    searchParams.set("companyId", companyId);
  }

  if (companySlug) {
    searchParams.set("companySlug", companySlug);
  }

  if (status) {
    searchParams.set("status", status);
  }

  if (jobType) {
    searchParams.set("jobType", jobType);
  }

  if (educationLevel) {
    searchParams.set("educationLevel", educationLevel);
  }

  if (workArrangement) {
    searchParams.set("workArrangement", workArrangement);
  }

  if (skillIds) {
    searchParams.set(
      "skillIds",
      Array.isArray(skillIds) ? skillIds.join(",") : skillIds,
    );
  }

  if (skillSlugs) {
    searchParams.set(
      "skillSlugs",
      Array.isArray(skillSlugs) ? skillSlugs.join(",") : skillSlugs,
    );
  }

  if (sortBy) {
    searchParams.set("sortBy", sortBy);
  }

  if (sortOrder) {
    searchParams.set("sortOrder", sortOrder);
  }

  return `${API_ROUTES.JOB_PUBLIC.BASE}?${searchParams.toString()}`;
}

function buildRelatedJobsPath(
  slug: string,
  { limit }: FetchRelatedJobsParams = {},
): string {
  const searchParams = new URLSearchParams();

  if (typeof limit === "number") {
    searchParams.set("limit", `${limit}`);
  }

  const query = searchParams.toString();

  return query
    ? `${API_ROUTES.JOB_PUBLIC.RELATED(slug)}?${query}`
    : API_ROUTES.JOB_PUBLIC.RELATED(slug);
}

export function buildCompanyJobsPath(
  basePath: string,
  params?: FetchJobsParams,
): string {
  const query = buildJobsPath(params).split("?")[1];
  return query ? `${basePath}?${query}` : basePath;
}

function toOptionalDate(value: string | null | undefined): Date | undefined {
  return value ? new Date(value) : undefined;
}

function toOptionalNumber(value: number | null): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function toOptionalString(
  value: string | null | undefined,
): string | undefined {
  return value ?? undefined;
}

export function mapJobApiItemToJob(job: JobApiItem): Job {
  return {
    id: job.id,
    slug: toOptionalString(job.slug),
    title: job.title,
    shortDescription: toOptionalString(job.shortDescription),
    description: toOptionalString(job.description),
    address: toOptionalString(job.address),
    salaryMin: toOptionalNumber(job.salaryMin),
    salaryMax: toOptionalNumber(job.salaryMax),
    vacancyCount: toOptionalNumber(job.vacancyCount ?? null),
    experienceYears: toOptionalNumber(job.experienceYears),
    expiredAt: toOptionalDate(job.expiredAt),
    jobType: job.jobType,
    educationLevel: job.educationLevel ?? undefined,
    workArrangement: job.workArrangement ?? undefined,
    rejectReason: toOptionalString(job.rejectReason),
    closeReason: toOptionalString(job.closeReason),
    status: job.status,
    skills: job.skills ?? undefined,
    isFavourited: job.isFavourited ?? undefined,
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
    company: job.company ?? undefined,
    careerCategory: job.careerCategory ?? undefined,
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

export async function fetchJobBySlug(slug: string): Promise<Job> {
  const response = await apiService.get<IResponseApiItem<JobApiItem>>(
    API_ROUTES.JOB_PUBLIC.DETAIL(slug),
    {
      cache: "no-store",
    },
  );

  return mapJobApiItemToJob(response.data);
}

export async function fetchRelatedJobs(
  slug: string,
  params?: FetchRelatedJobsParams,
): Promise<Job[]> {
  const response = await apiService.get<IResponseApiItem<JobApiItem[]>>(
    buildRelatedJobsPath(slug, params),
    {
      cache: "no-store",
    },
  );

  return response.data.map(mapJobApiItemToJob);
}
