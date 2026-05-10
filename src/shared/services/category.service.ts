import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type {
  CareerCategory,
  CareerCategoryListResponse,
} from "@/shared/types/category";

interface FetchCareerCategoriesParams {
  page?: number;
  limit?: number;
}

function buildCareerCategoryPath({
  page = 1,
  limit = 10,
}: FetchCareerCategoriesParams = {}): string {
  const searchParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });

  return `${API_ROUTES.CAREER_CATEGORY.BASE}?${searchParams.toString()}`;
}

function normalizeCareerCategories(
  response: CareerCategory[] | CareerCategoryListResponse,
): CareerCategory[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data;
}

export async function fetchCareerCategories(
  params?: FetchCareerCategoriesParams,
): Promise<CareerCategory[]> {
  const response = await apiService.get<
    CareerCategory[] | CareerCategoryListResponse
  >(buildCareerCategoryPath(params), {
    cache: "no-store",
  });

  return normalizeCareerCategories(response);
}
