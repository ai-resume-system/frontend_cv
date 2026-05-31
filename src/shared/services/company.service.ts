import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import {
  buildCompanyJobsPath,
  mapJobApiItemToJob,
  type FetchJobsParams,
  type FetchJobsResult,
} from "@/shared/services/job.service";
import type { IResponseApiItem, IResponseApiPagination } from "@/shared/types/api";
import type { CompanyDto, CompanyListResponse } from "@/shared/types/company";
import type { JobListResponse } from "@/shared/types/job";

interface FetchCompaniesParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  address?: string;
  careerCategoryId?: string;
  careerCategorySlug?: string;
}

interface FetchCompaniesResult {
  companies: CompanyDto[];
  pagination?: IResponseApiPagination;
}

function buildCompaniesPath({
  page = 1,
  limit = 10,
  q,
  sortBy,
  sortOrder,
  address,
  careerCategoryId,
  careerCategorySlug,
}: FetchCompaniesParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (q) {
    searchParams.set("q", q);
  }

  if (sortBy) {
    searchParams.set("sortBy", sortBy);
  }

  if (sortOrder) {
    searchParams.set("sortOrder", sortOrder);
  }

  if (address) {
    searchParams.set("address", address);
  }

  if (careerCategoryId) {
    searchParams.set("careerCategoryId", careerCategoryId);
  }

  if (careerCategorySlug) {
    searchParams.set("careerCategorySlug", careerCategorySlug);
  }

  return `${API_ROUTES.COMPANY.BASE}?${searchParams.toString()}`;
}

export async function fetchCompanies(
  params?: FetchCompaniesParams,
): Promise<FetchCompaniesResult> {
  const response = await apiService.get<CompanyListResponse>(
    buildCompaniesPath(params),
    {
      cache: "no-store",
    },
  );

  return {
    companies: response.data,
    pagination: response.pagination,
  };
}

export async function fetchCompanyBySlug(slug: string): Promise<CompanyDto> {
  const response = await apiService.get<IResponseApiItem<CompanyDto>>(
    API_ROUTES.COMPANY.DETAIL(slug),
    {
      cache: "no-store",
    },
  );

  return response.data;
}

export async function fetchCompanyJobs(
  slug: string,
  params?: FetchJobsParams,
): Promise<FetchJobsResult> {
  const response = await apiService.get<JobListResponse>(
    buildCompanyJobsPath(API_ROUTES.COMPANY.JOBS(slug), params),
    {
      cache: "no-store",
    },
  );

  return {
    jobs: response.data.map(mapJobApiItemToJob),
    pagination: response.pagination,
  };
}
