import { API_ROUTES } from "@/shared/constants/constants/api";
import type { EApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import type { EJobStatus } from "@/shared/constants/enums/job.enum";
import { apiService } from "@/shared/services/api-service";
import type {
  ApplicationApiItem,
  ApplicationListResponse,
} from "@/shared/types/application";
import type { IResponseApiItem, IResponseApiPagination } from "@/shared/types/api";
import type {
  CreateJobPayload,
  Job,
  JobApiItem,
  JobListResponse,
} from "@/shared/types/job";

import type { RecruiterApplicationSummary } from "@/portals/recruiter/types/dashboard";

interface FetchRecruiterJobsParams {
  page?: number;
  limit?: number;
  status?: EJobStatus;
}

interface FetchRecruiterJobsResult {
  jobs: Job[];
  pagination?: IResponseApiPagination;
}

interface FetchJobApplicationsParams {
  page?: number;
  limit?: number;
  status?: EApplicationStatus;
}

interface FetchJobApplicationsResult {
  applications: RecruiterApplicationSummary[];
  pagination?: IResponseApiPagination;
}

function buildMyJobsPath({
  page = 1,
  limit = 20,
  status,
}: FetchRecruiterJobsParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (status) {
    searchParams.set("status", status);
  }

  return `${API_ROUTES.JOB.MY}?${searchParams.toString()}`;
}

function buildJobApplicationsPath(
  jobId: string,
  { page = 1, limit = 20, status }: FetchJobApplicationsParams = {},
): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (status) {
    searchParams.set("status", status);
  }

  return `${API_ROUTES.APPLICATION.JOB(jobId)}?${searchParams.toString()}`;
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

function mapApplicationApiItemToSummary(
  application: ApplicationApiItem,
): RecruiterApplicationSummary {
  return {
    id: application.id,
    jobId: application.jobId,
    jobTitle: application.job?.title ?? "Tin tuyển dụng",
    applicantName:
      application.fullName ??
      application.user?.email ??
      application.contactEmail ??
      "Ứng viên chưa cập nhật",
    applicantEmail:
      application.contactEmail ?? application.user?.email ?? undefined,
    applicantPhone:
      application.contactPhone ?? application.user?.phone ?? undefined,
    cvTitle: application.cv?.title ?? undefined,
    matchingScore:
      typeof application.matchingScore === "number"
        ? application.matchingScore
        : undefined,
    status: application.status,
    createdAt: new Date(application.createdAt),
  };
}

export async function fetchRecruiterJobs(
  params?: FetchRecruiterJobsParams,
): Promise<FetchRecruiterJobsResult> {
  const response = await apiService.get<JobListResponse>(buildMyJobsPath(params), {
    auth: true,
    cache: "no-store",
  });

  return {
    jobs: response.data.map(mapJobApiItemToJob),
    pagination: response.pagination,
  };
}

export async function fetchApplicationsByJobId(
  jobId: string,
  params?: FetchJobApplicationsParams,
): Promise<FetchJobApplicationsResult> {
  const response = await apiService.get<ApplicationListResponse>(
    buildJobApplicationsPath(jobId, params),
    {
      auth: true,
      cache: "no-store",
    },
  );

  return {
    applications: response.data.map(mapApplicationApiItemToSummary),
    pagination: response.pagination,
  };
}

export async function createRecruiterJob(
  payload: CreateJobPayload,
): Promise<Job> {
  const response = await apiService.post<IResponseApiItem<JobApiItem>, CreateJobPayload>(
    API_ROUTES.JOB.BASE,
    payload,
    {
      auth: true,
    },
  );

  return mapJobApiItemToJob(response.data);
}
