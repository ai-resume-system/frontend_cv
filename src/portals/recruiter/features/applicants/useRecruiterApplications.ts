"use client";

import { useEffect, useState } from "react";

import {
  fetchApplicationsByJobId,
  fetchAllRecruiterJobApplications,
  fetchRecruiterInterviews,
  updateJobApplicationStatus,
} from "@/shared/services/recruiter-job-application.service";
import type { RecruiterApplicationApiItem } from "@/shared/types/application";
import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";

interface UseRecruiterApplicationsOptions {
  jobId?: string;
  status?: EJobApplicationStatus;
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
      const params: { page?: number; limit?: number; status?: EJobApplicationStatus } = {
        page: 1,
        limit: 100,
      };
      if (status) params.status = status;

      if (status === EJobApplicationStatus.INTERVIEW) {
        const result = await fetchRecruiterInterviews({ ...params, jobId });
        setApplications(result.applications);
      } else if (jobId) {
        const result = await fetchApplicationsByJobId(jobId, params);
        setApplications(result.applications);
      } else {
        const result = await fetchAllRecruiterJobApplications(params);
        setApplications(result.applications);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách ứng viên.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, [jobId, status]);

  async function handleAccept(id: string) {
    try {
      await updateJobApplicationStatus(id, { status: EJobApplicationStatus.REVIEWING });
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: EJobApplicationStatus.REVIEWING } : app,
        ),
      );
    } catch (err) {
      throw err;
    }
  }

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
