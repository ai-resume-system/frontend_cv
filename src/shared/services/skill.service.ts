import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type { IResponseApiItem, IResponseApiPagination } from "@/shared/types/api";
import type { SkillApiItem, SkillListResponse } from "@/shared/types/skill";

export interface FetchSkillsParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  careerCategoryId?: string;
}

export interface FetchSkillsResult {
  skills: SkillApiItem[];
  pagination?: IResponseApiPagination;
}

function buildSkillsPath({
  page = 1,
  limit = 10,
  q,
  sortBy,
  sortOrder,
  careerCategoryId,
}: FetchSkillsParams = {}): string {
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

  if (careerCategoryId) {
    searchParams.set("careerCategoryId", careerCategoryId);
  }

  return `${API_ROUTES.SKILL.BASE}?${searchParams.toString()}`;
}

export async function fetchSkills(
  params?: FetchSkillsParams,
): Promise<FetchSkillsResult> {
  const response = await apiService.get<SkillListResponse>(buildSkillsPath(params), {
    cache: "no-store",
  });

  return {
    skills: response.data,
    pagination: response.pagination,
  };
}

export async function fetchSkillBySlug(slug: string): Promise<SkillApiItem> {
  const response = await apiService.get<IResponseApiItem<SkillApiItem>>(
    API_ROUTES.SKILL.DETAIL(slug),
    {
      cache: "no-store",
    },
  );

  return response.data;
}
