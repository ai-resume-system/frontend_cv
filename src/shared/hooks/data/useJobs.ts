"use client";

import { useEffect, useState } from "react";

import {
  fetchJobs,
  type FetchJobsParams,
} from "@/shared/services/job.service";
import type { IResponseApiPagination } from "@/shared/types/api";
import type { Job } from "@/shared/types/job";

type UseJobsOptions = FetchJobsParams;

export function useJobs({
  page = 1,
  limit = 10,
  address,
  careerCategoryId,
  careerCategorySlug,
  salaryMin,
  salaryMax,
  experienceYears,
  experienceYearsMin,
  experienceYearsMax,
  companyId,
  companySlug,
  status,
  jobType,
  educationLevel,
  workArrangement,
  skillIds,
  skillSlugs,
  sortBy,
  sortOrder,
  q,
}: UseJobsOptions = {}) {
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
        const data = await fetchJobs({
          page,
          limit,
          address,
          careerCategoryId,
          careerCategorySlug,
          salaryMin,
          salaryMax,
          experienceYears,
          experienceYearsMin,
          experienceYearsMax,
          companyId,
          companySlug,
          status,
          jobType,
          educationLevel,
          workArrangement,
          skillIds,
          skillSlugs,
          sortBy,
          sortOrder,
          q,
        });
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
  }, [
    address,
    careerCategoryId,
    careerCategorySlug,
    companyId,
    companySlug,
    experienceYears,
    experienceYearsMax,
    experienceYearsMin,
    jobType,
    educationLevel,
    workArrangement,
    limit,
    page,
    q,
    salaryMax,
    salaryMin,
    skillIds,
    skillSlugs,
    sortBy,
    sortOrder,
    status,
  ]);

  return { jobs, pagination, loading, error };
}
