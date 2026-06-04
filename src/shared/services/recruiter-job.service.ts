import { API_ROUTES } from "@/shared/constants/constants/api";
import type {
  EJobEducationLevel,
  EJobStatus,
  EJobType,
  EJobWorkArrangement,
} from "@/shared/constants/enums/job.enum";
import { apiService } from "@/shared/services/api-service";
import { mapJobApiItemToJob } from "@/shared/services/job.service";
import type {
  IResponseApiItem,
  IResponseApiPagination,
} from "@/shared/types/api";
import type {
  CreateJobPayload,
  Job,
  JobApiItem,
  JobListResponse,
  UpdateJobPayload,
} from "@/shared/types/job";

export interface FetchRecruiterJobsParams {
  page?: number;
  limit?: number;
  q?: string;
  address?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears?: number;
  careerCategoryId?: string;
  careerCategorySlug?: string;
  status?: EJobStatus;
  jobType?: EJobType;
  educationLevel?: EJobEducationLevel;
  workArrangement?: EJobWorkArrangement;
  skillIds?: string | string[];
  skillSlugs?: string | string[];
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface FetchRecruiterJobsResult {
  jobs: Job[];
  pagination?: IResponseApiPagination;
}

function buildRecruiterJobsPath({
  page = 1,
  limit = 20,
  q,
  address,
  salaryMin,
  salaryMax,
  experienceYears,
  careerCategoryId,
  careerCategorySlug,
  status,
  jobType,
  educationLevel,
  workArrangement,
  skillIds,
  skillSlugs,
  sortBy,
  sortOrder,
}: FetchRecruiterJobsParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (q) searchParams.set("q", q);
  if (address) searchParams.set("address", address);
  if (typeof salaryMin === "number")
    searchParams.set("salaryMin", `${salaryMin}`);
  if (typeof salaryMax === "number")
    searchParams.set("salaryMax", `${salaryMax}`);
  if (typeof experienceYears === "number") {
    searchParams.set("experienceYears", `${experienceYears}`);
  }
  if (careerCategoryId) searchParams.set("careerCategoryId", careerCategoryId);
  if (careerCategorySlug) {
    searchParams.set("careerCategorySlug", careerCategorySlug);
  }
  if (status) searchParams.set("status", status);
  if (jobType) searchParams.set("jobType", jobType);
  if (educationLevel) searchParams.set("educationLevel", educationLevel);
  if (workArrangement) searchParams.set("workArrangement", workArrangement);
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
  if (sortBy) searchParams.set("sortBy", sortBy);
  if (sortOrder) searchParams.set("sortOrder", sortOrder);

  return `${API_ROUTES.JOB_RECRUITER.BASE}?${searchParams.toString()}`;
}

export async function fetchRecruiterJobs(
  params?: FetchRecruiterJobsParams,
): Promise<FetchRecruiterJobsResult> {
  const response = await apiService.get<JobListResponse>(
    buildRecruiterJobsPath(params),
    {
      auth: true,
      cache: "no-store",
    },
  );

  return {
    jobs: response.data.map(mapJobApiItemToJob),
    pagination: response.pagination,
  };
}

export async function createRecruiterJob(
  payload: CreateJobPayload,
): Promise<Job> {
  const response = await apiService.post<
    IResponseApiItem<JobApiItem>,
    CreateJobPayload
  >(API_ROUTES.JOB_RECRUITER.BASE, payload, {
    auth: true,
  });

  return mapJobApiItemToJob(response.data);
}

export async function updateRecruiterJob(
  id: string,
  payload: UpdateJobPayload,
): Promise<Job> {
  const response = await apiService.patch<
    IResponseApiItem<JobApiItem>,
    UpdateJobPayload
  >(API_ROUTES.JOB_RECRUITER.ACTION(id), payload, {
    auth: true,
  });

  return mapJobApiItemToJob(response.data);
}

export async function fetchRecruiterJobDetail(slug: string): Promise<Job> {
  const response = await apiService.get<IResponseApiItem<JobApiItem>>(
    API_ROUTES.JOB_RECRUITER.DETAIL(slug),
    {
      auth: true,
      cache: "no-store",
    },
  );

  return mapJobApiItemToJob(response.data);
}

export async function deleteRecruiterJob(id: string): Promise<void> {
  await apiService.delete<void>(API_ROUTES.JOB_RECRUITER.ACTION(id), {
    auth: true,
  });
}

export async function closeRecruiterJob(
  id: string,
  closeReason: string,
): Promise<Job> {
  const response = await apiService.patch<IResponseApiItem<JobApiItem>>(
    API_ROUTES.JOB_RECRUITER.CLOSE(id),
    { closeReason },
    {
      auth: true,
    },
  );

  return mapJobApiItemToJob(response.data);
}
