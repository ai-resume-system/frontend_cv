import type { IResponseApiList } from "@/shared/types/api";

// ─────────────────────── Domain entity ───────────────────────

export interface ISkillEntity {
  id: string;
  name: string;
  careerCategoriesId: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ─────────────────────── API item ───────────────────────

export interface SkillApiItem {
  id: string;
  name: string;
  careerCategoriesId?: string | null;
  parentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─────────────────────── List response ───────────────────────

export type SkillListResponse = IResponseApiList<SkillApiItem>;
