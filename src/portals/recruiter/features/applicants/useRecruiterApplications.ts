"use client";

import { useEffect, useState } from "react";

import {
  fetchApplicationsByJobId,
  updateJobApplicationStatus,
} from "@/shared/services/recruiter-job-application.service";
import type { RecruiterApplicationApiItem } from "@/shared/types/application";
import { EApplicationStatus } from "@/shared/constants/enums/job-application.enum";

interface UseRecruiterApplicationsOptions {
  jobId?: string;
  status?: EApplicationStatus;
}

export function useRecruiterApplications({
  jobId,
  status,
}: UseRecruiterApplicationsOptions = {}) {
  const [applications, setApplications] = useState<RecruiterApplicationApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadApplications() {
    setLoading(true);
    setError(null);
    try {
      const params: { page?: number; limit?: number; status?: EApplicationStatus } = {
        page: 1,
        limit: 100,
      };
      if (status) params.status = status;

      if (jobId) {
        const result = await fetchApplicationsByJobId(jobId, params);
        setApplications(result.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách ứng viên.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, [jobId]);

  async function handleAccept(id: string) {
    try {
      await updateJobApplicationStatus(id, { status: EApplicationStatus.REVIEWING });
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: EApplicationStatus.REVIEWING } : app,
        ),
      );
    } catch (err) {
      throw err;
    }
  }

  async function handleReject(id: string) {
    try {
      await updateJobApplicationStatus(id, { status: EApplicationStatus.REJECTED });
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: EApplicationStatus.REJECTED } : app,
        ),
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
    loading,
    error,
    reload: loadApplications,
    handleAccept,
    handleReject,
    handleViewCv,
  };
}
