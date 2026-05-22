"use client";

import { useEffect, useState } from "react";

import {
  fetchJobs,
  type FetchJobsParams,
} from "@/shared/services/job.service";
import type { IResponseApiPagination } from "@/shared/types/api";
import type { Job } from "@/shared/types/job";

type UseJobsOptions = FetchJobsParams;

export function useJobs({ page = 1, limit = 10, careerCategoryId, q }: UseJobsOptions = {}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<IResponseApiPagination | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchJobs({ page, limit, careerCategoryId, q });
        if (!cancelled) {
          setJobs(data.jobs);
          setPagination(data.pagination);
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
  }, [careerCategoryId, limit, page, q]);

  return { jobs, pagination, loading, error };
}
