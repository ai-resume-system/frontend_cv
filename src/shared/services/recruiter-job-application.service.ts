import { API_ROUTES } from "@/shared/constants/constants/api";
import type { EApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import { apiService } from "@/shared/services/api-service";
import type {
  RecruiterApplicationApiItem,
  RecruiterApplicationListResponse,
  UpdateApplicationStatusPayload,
} from "@/shared/types/application";
import type { IResponseApiItem, IResponseApiPagination } from "@/shared/types/api";
import type { CvItem } from "@/shared/types/cv";

export interface FetchRecruiterJobApplicationsParams {
  page?: number;
  limit?: number;
  status?: EApplicationStatus;
  sortBy?: "createdAt" | "matchingScore";
  sortOrder?: "ASC" | "DESC";
}

export interface FetchRecruiterJobApplicationsResult {
  applications: RecruiterApplicationApiItem[];
  pagination?: IResponseApiPagination;
}

function buildRecruiterJobApplicationsPath(
  jobId: string,
  {
    page = 1,
    limit = 20,
    status,
    sortBy,
    sortOrder,
  }: FetchRecruiterJobApplicationsParams = {},
): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (status) searchParams.set("status", status);
  if (sortBy) searchParams.set("sortBy", sortBy);
  if (sortOrder) searchParams.set("sortOrder", sortOrder);

  return `${API_ROUTES.RECRUITER_JOB_APPLICATION.BY_JOB(jobId)}?${searchParams.toString()}`;
}

export async function fetchApplicationsByJobId(
  jobId: string,
  params?: FetchRecruiterJobApplicationsParams,
): Promise<FetchRecruiterJobApplicationsResult> {
  const response = await apiService.get<RecruiterApplicationListResponse>(
    buildRecruiterJobApplicationsPath(jobId, params),
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

export async function fetchRecruiterJobApplicationDetail(
  id: string,
): Promise<RecruiterApplicationApiItem> {
  const response = await apiService.get<IResponseApiItem<RecruiterApplicationApiItem>>(
    API_ROUTES.RECRUITER_JOB_APPLICATION.DETAIL(id),
    {
      auth: true,
      cache: "no-store",
    },
  );

  return response.data;
}

export async function fetchApplicantCv(applicationId: string): Promise<CvItem> {
  const response = await apiService.get<IResponseApiItem<CvItem>>(
    API_ROUTES.RECRUITER_JOB_APPLICATION.CV(applicationId),
    {
      auth: true,
      cache: "no-store",
    },
  );

  return response.data;
}

export async function updateJobApplicationStatus(
  id: string,
  payload: UpdateApplicationStatusPayload,
): Promise<RecruiterApplicationApiItem> {
  const response = await apiService.patch<
    IResponseApiItem<RecruiterApplicationApiItem>,
    UpdateApplicationStatusPayload
  >(API_ROUTES.RECRUITER_JOB_APPLICATION.STATUS(id), payload, {
    auth: true,
  });

  return response.data;
}
