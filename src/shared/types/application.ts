import type { EApplicationStatus } from "@/shared/constants/enums/job-application.enum";

import type { IResponseApiList } from "@/shared/types/api";

// ─────────────────────── Domain entity ───────────────────────

export interface IJobApplicationEntity {
  id: string;
  cvId: string;
  userId: string;
  jobId: string;
  fullName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  coverLetter: string | null;
  matchingScore: number | null;
  notes: string | null;
  status: EApplicationStatus;
  scheduleTime: string | null;
  scheduleLocation: string | null;
  scheduleLink: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ─────────────────────── Relations ───────────────────────

export interface ApplicationCvRef {
  id: string;
  title: string | null;
  fileUrl: string | null;
  summary: string | null;
}

export interface ApplicationJobRef {
  id: string;
  title: string;
  location: string | null;
  company: {
    id: string;
    companyName: string | null;
    logoUrl: string | null;
  } | null;
}

export interface ApplicationUserRef {
  id: string;
  email: string;
  phone: string | null;
}

// ─────────────────────── Full API item ───────────────────────

export interface ApplicationApiItem {
  id: string;
  cvId: string;
  userId: string;
  jobId: string;
  fullName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  coverLetter: string | null;
  matchingScore: number | null;
  notes: string | null;
  status: EApplicationStatus;
  scheduleTime: string | null;
  scheduleLocation: string | null;
  scheduleLink: string | null;
  createdAt: string;
  updatedAt: string;
  cv?: ApplicationCvRef | null;
  job?: ApplicationJobRef | null;
  user?: ApplicationUserRef | null;
}

// ─────────────────────── List response ───────────────────────

export type ApplicationListResponse = IResponseApiList<ApplicationApiItem>;

// ─────────────────────── Create payload ───────────────────────

export interface CreateApplicationPayload {
  cvId: string;
  jobId: string;
  fullName: string;
  contactEmail: string;
  contactPhone: string;
  coverLetter?: string;
}

// ─────────────────────── Update status payload ───────────────────────

export interface UpdateApplicationStatusPayload {
  status: EApplicationStatus;
  notes?: string;
  scheduleTime?: string;
  scheduleLocation?: string;
  scheduleLink?: string;
}
