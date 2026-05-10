"use client";

import { useEffect, useState } from "react";

import { fetchJobs } from "@/shared/services/job.service";
import type { Job } from "@/shared/types/job";

interface UseJobsOptions {
  page?: number;
  limit?: number;
}

export function useJobs({ page = 1, limit = 3 }: UseJobsOptions = {}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchJobs({ page, limit });
        if (!cancelled) {
          setJobs(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [limit, page]);

  return { jobs, loading, error };
}
