import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type { Job, JobListResponse } from "@/shared/types/job";

interface FetchJobsParams {
  page?: number;
  limit?: number;
}

function buildJobsPath({ page = 1, limit = 3 }: FetchJobsParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  return `${API_ROUTES.JOB.BASE}?${searchParams.toString()}`;
}

function normalizeJobs(response: Job[] | JobListResponse): Job[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data;
}

export async function fetchJobs(params?: FetchJobsParams): Promise<Job[]> {
  const response = await apiService.get<Job[] | JobListResponse>(
    buildJobsPath(params),
    {
      cache: "no-store",
    },
  );

  return normalizeJobs(response);
}
