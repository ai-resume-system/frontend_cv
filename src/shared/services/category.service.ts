import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type {
  IResponseApiItem,
  IResponseApiPagination,
} from "@/shared/types/api";
import type {
  CareerCategory,
  CareerCategoryListResponse,
  TopCareerCategory,
} from "@/shared/types/career-category";

export interface FetchCareerCategoriesParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

interface FetchCareerCategoriesResult {
  categories: CareerCategory[];
  pagination?: IResponseApiPagination;
}

function buildCareerCategoryPath({
  page = 1,
  limit = 10,
  q,
  sortBy,
  sortOrder,
}: FetchCareerCategoriesParams = {}): string {
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

  return `${API_ROUTES.CAREER_CATEGORY.BASE}?${searchParams.toString()}`;
}

export async function fetchCareerCategories(
  params?: FetchCareerCategoriesParams,
): Promise<FetchCareerCategoriesResult> {
  const response = await apiService.get<CareerCategoryListResponse>(
    buildCareerCategoryPath(params),
    {
      cache: "no-store",
    },
  );

  return {
    categories: response.data,
    pagination: response.pagination,
  };
}

export async function fetchTopCareerCategories(
  params?: Pick<FetchCareerCategoriesParams, "limit">,
): Promise<TopCareerCategory[]> {
  const searchParams = new URLSearchParams();

  if (typeof params?.limit === "number") {
    searchParams.set("limit", `${params.limit}`);
  }

  const path = searchParams.size
    ? `${API_ROUTES.CAREER_CATEGORY.TOP}?${searchParams.toString()}`
    : API_ROUTES.CAREER_CATEGORY.TOP;

  const response = await apiService.get<IResponseApiItem<TopCareerCategory[]>>(
    path,
    {
      cache: "no-store",
    },
  );

  return response.data;
}

export async function fetchCareerCategoryBySlug(
  slug: string,
): Promise<CareerCategory> {
  const response = await apiService.get<IResponseApiItem<CareerCategory>>(
    API_ROUTES.CAREER_CATEGORY.DETAIL(slug),
    {
      cache: "no-store",
    },
  );

  return response.data;
}
