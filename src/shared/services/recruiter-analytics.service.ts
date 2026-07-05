import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type { IResponseApiItem } from "@/shared/types/api";

export interface RecruiterAnalyticsOverview {
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  upcomingInterviews: number;
}

export interface RecruiterTrendItem {
  bucket: string;
  label: string;
  value: number;
}

export interface RecruiterAnalyticsTrend {
  groupBy: string;
  items: RecruiterTrendItem[];
}

export async function fetchRecruiterAnalyticsOverview(): Promise<RecruiterAnalyticsOverview> {
  const response = await apiService.get<IResponseApiItem<RecruiterAnalyticsOverview>>(
    API_ROUTES.RECRUITER_ANALYTICS.OVERVIEW,
    {
      auth: true,
      cache: "no-store",
    },
  );
  return response.data;
}

export async function fetchRecruiterAnalyticsTrend(
  groupBy: "week" | "month" | "quarter" | "year",
): Promise<RecruiterAnalyticsTrend> {
  const searchParams = new URLSearchParams({ groupBy });
  const response = await apiService.get<IResponseApiItem<RecruiterAnalyticsTrend>>(
    `${API_ROUTES.RECRUITER_ANALYTICS.TREND}?${searchParams.toString()}`,
    {
      auth: true,
      cache: "no-store",
    },
  );
  return response.data;
}
