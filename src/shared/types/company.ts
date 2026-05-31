import type { IResponseApiList } from "@/shared/types/api";
import type { CareerCategory } from "@/shared/types/career-category";

export interface CompanyDto {
  id: string;
  slug: string | null;
  name: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  address: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description: string | null;
  websiteUrl: string | null;
  taxCode: string | null;
  careerCategory?: CareerCategory | null;
  employeeMin?: number | null;
  employeeMax?: number | null;
  openJobCount?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type CompanyListResponse = IResponseApiList<CompanyDto>;
