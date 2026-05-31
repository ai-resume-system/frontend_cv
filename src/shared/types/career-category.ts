import type { ECareerCategoriesStatus } from "@/shared/constants/enums/career_categories.enum";
import type { IResponseApiList } from "@/shared/types/api";

export interface CareerCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status?: ECareerCategoriesStatus;
}

export interface TopCareerCategory extends CareerCategory {
  jobCount?: number;
}

export type CareerCategoryListResponse = IResponseApiList<CareerCategory>;
