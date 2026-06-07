import type { IResponseApiList } from "@/shared/types/api";

export interface SkillDto {
  id: string;
  name: string;
  slug?: string | null;
  careerCategoryId?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  children?: SkillDto[];
}

export type SkillApiItem = SkillDto;

export type SkillListResponse = IResponseApiList<SkillApiItem>;
