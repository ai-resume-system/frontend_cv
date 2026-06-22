"use client";

import { useEffect, useState, useCallback } from "react";

import { EJobStatus } from "@/shared/constants/enums/job.enum";
import {
  fetchRecruiterJobs,
  deleteRecruiterJob,
  closeRecruiterJob,
} from "@/shared/services/recruiter-job.service";
import type { Job } from "@/shared/types/job";
import type { IResponseApiPagination } from "@/shared/types/api";

export function useRecruiterJobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<IResponseApiPagination | null>(null);
  const [allJobsForCounts, setAllJobsForCounts] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all jobs to calculate statuses counts (limit high)
  const loadAllJobsForCounts = useCallback(async () => {
    try {
      const result = await fetchRecruiterJobs({ limit: 1000 });
      setAllJobsForCounts(result.jobs);
    } catch (err) {
      console.error("Failed to load counts:", err);
    }
  }, []);

  const loadJobs = useCallback(async (params: {
    page: number;
    limit: number;
    q?: string;
    status?: EJobStatus;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRecruiterJobs({
        page: params.page,
        limit: params.limit,
        q: params.q || undefined,
        status: params.status || undefined,
      });
      setJobs(result.jobs);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách tin tuyển dụng.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch counts on mount
  useEffect(() => {
    void loadAllJobsForCounts();
  }, [loadAllJobsForCounts]);

  async function handleDelete(id: string) {
    try {
      await deleteRecruiterJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setAllJobsForCounts((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      throw err;
    }
  }

  async function handleClose(id: string, closeReason: string) {
    try {
      await closeRecruiterJob(id, closeReason);
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: EJobStatus.CLOSED, closeReason } : j)),
      );
      setAllJobsForCounts((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: EJobStatus.CLOSED, closeReason } : j)),
      );
    } catch (err) {
      throw err;
    }
  }

  return {
    jobs,
    pagination,
    allJobsForCounts,
    loading,
    error,
    loadJobs,
    reloadCounts: loadAllJobsForCounts,
    handleDelete,
    handleClose,
  };
}
