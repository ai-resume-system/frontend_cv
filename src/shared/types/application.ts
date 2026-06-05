import type { EProcessingStatus } from "@/shared/constants/enums/cv.enum";
import type { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import type { IResponseApiList } from "@/shared/types/api";

// Chú ý sau
export interface ApplicationCvRef {
  id: string;
  title: string | null;
  fileUrl: string | null;
  summary: string | null;
  status?: string | null;
  processingStatus?: EProcessingStatus | null;
  createdAt?: string;
}

export interface ApplicationJobCompanyRef {
  id: string;
  name?: string | null;
  slug?: string | null;
  logoUrl: string | null;
}

export interface ApplicationJobRef {
  id: string;
  slug?: string | null;
  title: string;
  address?: string | null;
  company?: ApplicationJobCompanyRef | null;
}

export interface ApplicationUserRef {
  id: string;
  email: string;
  phone: string | null;
}

export interface BaseApplicationApiItem {
  id: string;
  cvId: string;
  userId: string;
  jobId: string;
  fullName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  coverLetter: string | null;
  matchingScore: number | null;
  status: EJobApplicationStatus;
  scheduleTime: string | null;
  scheduleLocation: string | null;
  scheduleLink: string | null;
  createdAt: string;
  updatedAt: string;
  cv?: ApplicationCvRef | null;
  job?: ApplicationJobRef | null;
}

export interface JobSeekerApplicationApiItem extends BaseApplicationApiItem {
  notes?: never;
}

export interface RecruiterApplicationApiItem extends BaseApplicationApiItem {
  notes?: string | null;
  user?: ApplicationUserRef | null;
}

export type ApplicationApiItem =
  | JobSeekerApplicationApiItem
  | RecruiterApplicationApiItem;

export type JobSeekerApplicationListResponse =
  IResponseApiList<JobSeekerApplicationApiItem>;

export type RecruiterApplicationListResponse =
  IResponseApiList<RecruiterApplicationApiItem>;

export type ApplicationListResponse = IResponseApiList<ApplicationApiItem>;

export interface CreateApplicationPayload {
  cvId: string;
  jobId: string;
  fullName: string;
  contactEmail: string;
  contactPhone: string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusPayload {
  status: EJobApplicationStatus;
  notes?: string;
  scheduleTime?: string;
  scheduleLocation?: string;
  scheduleLink?: string;
}
