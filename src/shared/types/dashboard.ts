import type { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import type { EJobStatus } from "@/shared/constants/enums/job.enum";

export interface RecruiterApplicationSummary {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail?: string;
  applicantPhone?: string;
  cvTitle?: string;
  matchingScore?: number;
  status: EJobApplicationStatus;
  createdAt: Date;
}

export interface RecruiterDashboardMetrics {
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  averageMatchingScore: number | null;
}

export interface RecruiterJobOverview {
  id: string;
  title: string;
  address?: string;
  status: EJobStatus;
  applicationCount: number;
  matchingAverage: number | null;
  createdAt: Date;
}

export interface RecruiterTrendPoint {
  label: string;
  value: number;
}
