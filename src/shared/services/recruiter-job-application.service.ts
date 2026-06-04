import { API_ROUTES } from "@/shared/constants/constants/api";
import type { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";
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
  status?: EJobApplicationStatus;
  sortBy?: "createdAt" | "matchingScore";
  sortOrder?: "ASC" | "DESC";
}

export interface FetchRecruiterJobApplicationsResult {
  applications: RecruiterApplicationApiItem[];
  pagination?: IResponseApiPagination;
}

export interface FetchAllRecruiterJobApplicationsParams {
  page?: number;
  limit?: number;
  status?: EJobApplicationStatus;
  jobId?: string;
  q?: string;
  sortBy?: "createdAt" | "matchingScore";
  sortOrder?: "ASC" | "DESC";
}

export interface FetchNewApplicantsParams {
  limit?: number;
  jobId?: string;
}

export interface FetchRecruiterInterviewsParams {
  page?: number;
  limit?: number;
  from?: string; // ISO datetime
  to?: string; // ISO datetime
  jobId?: string;
  sortOrder?: "ASC" | "DESC";
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

function buildAllRecruiterJobApplicationsPath({
  page = 1,
  limit = 20,
  status,
  jobId,
  q,
  sortBy,
  sortOrder,
}: FetchAllRecruiterJobApplicationsParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (status) searchParams.set("status", status);
  if (jobId) searchParams.set("jobId", jobId);
  if (q) searchParams.set("q", q);
  if (sortBy) searchParams.set("sortBy", sortBy);
  if (sortOrder) searchParams.set("sortOrder", sortOrder);

  return `${API_ROUTES.RECRUITER_JOB_APPLICATION.ALL}?${searchParams.toString()}`;
}

function buildNewApplicantsPath({
  limit = 10,
  jobId,
}: FetchNewApplicantsParams = {}): string {
  const searchParams = new URLSearchParams({
    limit: `${limit}`,
  });

  if (jobId) searchParams.set("jobId", jobId);

  return `${API_ROUTES.RECRUITER_JOB_APPLICATION.NEW}?${searchParams.toString()}`;
}

function buildRecruiterInterviewsPath({
  page = 1,
  limit = 20,
  from,
  to,
  jobId,
  sortOrder,
}: FetchRecruiterInterviewsParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (from) searchParams.set("from", from);
  if (to) searchParams.set("to", to);
  if (jobId) searchParams.set("jobId", jobId);
  if (sortOrder) searchParams.set("sortOrder", sortOrder);

  return `${API_ROUTES.RECRUITER_JOB_APPLICATION.INTERVIEWS}?${searchParams.toString()}`;
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

export async function fetchAllRecruiterJobApplications(
  params?: FetchAllRecruiterJobApplicationsParams,
): Promise<FetchRecruiterJobApplicationsResult> {
  const response = await apiService.get<RecruiterApplicationListResponse>(
    buildAllRecruiterJobApplicationsPath(params),
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

export async function fetchRecruiterNewApplicants(
  params?: FetchNewApplicantsParams,
): Promise<RecruiterApplicationApiItem[]> {
  const response = await apiService.get<IResponseApiItem<RecruiterApplicationApiItem[]>>(
    buildNewApplicantsPath(params),
    {
      auth: true,
      cache: "no-store",
    },
  );

  return response.data;
}

export async function fetchRecruiterInterviews(
  params?: FetchRecruiterInterviewsParams,
): Promise<FetchRecruiterJobApplicationsResult> {
  const response = await apiService.get<RecruiterApplicationListResponse>(
    buildRecruiterInterviewsPath(params),
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
