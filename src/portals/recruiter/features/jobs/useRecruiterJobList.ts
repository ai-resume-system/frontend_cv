"use client";

import { useEffect, useState } from "react";

import { EJobStatus } from "@/shared/constants/enums/job.enum";
import {
  fetchRecruiterJobs,
  deleteRecruiterJob,
  closeRecruiterJob,
} from "@/shared/services/recruiter-job.service";
import type { Job } from "@/shared/types/job";

export function useRecruiterJobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadJobs() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRecruiterJobs({ limit: 100 });
      setJobs(result.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách tin tuyển dụng.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteRecruiterJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      throw err;
    }
  }

  async function handleClose(id: string) {
    try {
      await closeRecruiterJob(id);
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: EJobStatus.CLOSED } : j)),
      );
    } catch (err) {
      throw err;
    }
  }

  return { jobs, loading, error, reload: loadJobs, handleDelete, handleClose };
}
