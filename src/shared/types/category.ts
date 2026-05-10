export interface CareerCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  jobCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerCategoryListResponse {
  data: CareerCategory[];
  total: number;
  page: number;
  limit: number;
}