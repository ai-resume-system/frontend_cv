// ─────────────────────── Domain entity ───────────────────────

import type { IResponseApiList } from "@/shared/types/api";

export interface ICompanyEntity {
  id: string;
  userId: string;
  careerCategoriesId: string | null;
  companyName: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  location: string | null;
  description: string | null;
  taxCode: string | null;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ─────────────────────── Create / Update payload ───────────────────────

export interface UpdateCompanyPayload {
  careerCategoriesId?: string;
  companyName?: string;
  taxCode?: string;
  location?: string;
  description?: string;
  websiteUrl?: string;
}

export type CompanyListResponse = IResponseApiList<ICompanyEntity>;
