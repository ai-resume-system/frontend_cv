import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type { IResponseApiPagination } from "@/shared/types/api";
import type { CompanyListResponse, ICompanyEntity } from "@/shared/types/company";

interface FetchCompaniesParams {
  page?: number;
  limit?: number;
  q?: string;
}

interface FetchCompaniesResult {
  companies: ICompanyEntity[];
  pagination?: IResponseApiPagination;
}

function buildCompaniesPath({
  page = 1,
  limit = 10,
  q,
}: FetchCompaniesParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  if (q) {
    searchParams.set("q", q);
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
