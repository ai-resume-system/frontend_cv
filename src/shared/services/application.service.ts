import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type { IResponseApiItem, IResponseApiPagination } from "@/shared/types/api";
import type {
  CreateApplicationPayload,
  JobSeekerApplicationApiItem,
  JobSeekerApplicationListResponse,
} from "@/shared/types/application";

export interface FetchMyJobApplicationsParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: "createdAt" | "matchingScore";
  sortOrder?: "ASC" | "DESC";
}

export interface FetchMyJobApplicationsResult {
  applications: JobSeekerApplicationApiItem[];
  pagination?: IResponseApiPagination;
}

function buildMyApplicationsPath({
  page = 1,
  limit = 20,
  status,
  sortBy,
  sortOrder,
}: FetchMyJobApplicationsParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (status) searchParams.set("status", status);
  if (sortBy) searchParams.set("sortBy", sortBy);
  if (sortOrder) searchParams.set("sortOrder", sortOrder);

  return `${API_ROUTES.JOB_APPLICATION.MY}?${searchParams.toString()}`;
}

export async function createJobApplication(
  payload: CreateApplicationPayload,
): Promise<JobSeekerApplicationApiItem> {
  const response = await apiService.post<
    IResponseApiItem<JobSeekerApplicationApiItem>,
    CreateApplicationPayload
  >(API_ROUTES.JOB_APPLICATION.BASE, payload, {
    auth: true,
  });

  return response.data;
}

export async function fetchMyJobApplications(
  params?: FetchMyJobApplicationsParams,
): Promise<FetchMyJobApplicationsResult> {
  const response = await apiService.get<JobSeekerApplicationListResponse>(
    buildMyApplicationsPath(params),
    {
      auth: true,
      cache: "no-store",
    },
  );

  return {
    applications: response.data,
    pagination: response.pagination,
  };
}

export async function fetchMyJobApplicationDetail(
  id: string,
): Promise<JobSeekerApplicationApiItem> {
  const response = await apiService.get<IResponseApiItem<JobSeekerApplicationApiItem>>(
    API_ROUTES.JOB_APPLICATION.DETAIL(id),
    {
      auth: true,
      cache: "no-store",
    },
  );

  return response.data;
}

export async function withdrawJobApplication(
  id: string,
): Promise<JobSeekerApplicationApiItem> {
  const response = await apiService.delete<IResponseApiItem<JobSeekerApplicationApiItem>>(
    API_ROUTES.JOB_APPLICATION.DETAIL(id),
    {
      auth: true,
    },
  );

  return response.data;
}
