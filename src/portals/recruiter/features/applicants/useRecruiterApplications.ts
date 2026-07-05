"use client";

import { useEffect, useState } from "react";

import {
  fetchApplicationsByJobId,
  fetchAllRecruiterJobApplications,
  fetchRecruiterInterviews,
  updateJobApplicationStatus,
} from "@/shared/services/recruiter-job-application.service";
import type { RecruiterApplicationApiItem, UpdateApplicationStatusPayload } from "@/shared/types/application";
import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";

interface UseRecruiterApplicationsOptions {
  jobId?: string;
  status?: EJobApplicationStatus;
  q?: string;
  sortBy?: "createdAt" | "matchingScore";
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export function useRecruiterApplications({
  jobId,
  status,
  q,
  sortBy,
  sortOrder,
  page = 1,
  limit = 10,
}: UseRecruiterApplicationsOptions = {}) {
  const [applications, setApplications] = useState<RecruiterApplicationApiItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadApplications() {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit,
      };
      if (status) params.status = status;
      if (q) params.q = q;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      if (jobId) {
        const result = await fetchApplicationsByJobId(jobId, params);
        setApplications(result.applications);
        setTotalItems(result.pagination?.totalItems ?? result.applications.length);
        setTotalPages(result.pagination?.totalPages ?? 1);
      } else {
        const result = await fetchAllRecruiterJobApplications(params);
        setApplications(result.applications);
        setTotalItems(result.pagination?.totalItems ?? result.applications.length);
        setTotalPages(result.pagination?.totalPages ?? 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách ứng viên.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, [jobId, status, q, sortBy, sortOrder, page, limit]);

  async function handleReject(id: string) {
    try {
      await updateJobApplicationStatus(id, { status: EJobApplicationStatus.REJECTED });
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: EJobApplicationStatus.REJECTED } : app,
        ),
      );
    } catch (err) {
      throw err;
    }
  }

  async function handleUpdateStatus(
    id: string,
    payload: UpdateApplicationStatusPayload,
  ) {
    try {
      const updatedApp = await updateJobApplicationStatus(id, payload);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? updatedApp : app)),
      );
    } catch (err) {
      throw err;
    }
  }

  function handleViewCv(id: string) {
    const app = applications.find((a) => a.id === id);
    if (app?.cv?.fileUrl) {
      window.open(app.cv.fileUrl, "_blank");
    }
  }

  return {
    applications,
    totalItems,
    totalPages,
    loading,
    error,
    reload: loadApplications,
    handleReject,
    handleUpdateStatus,
    handleViewCv,
  };
}
