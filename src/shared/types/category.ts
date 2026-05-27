import type { ECareerCategoriesStatus } from "@/shared/constants/enums/career_categories.enum";

import type { IResponseApiList } from "@/shared/types/api";

// ─────────────────────── Domain entity ───────────────────────

export interface CareerCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status?: ECareerCategoriesStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ─────────────────────── List response ───────────────────────

export type CareerCategoryListResponse = IResponseApiList<CareerCategory>;
