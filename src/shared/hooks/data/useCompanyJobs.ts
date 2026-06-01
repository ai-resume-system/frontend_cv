"use client";

import { useEffect, useState } from "react";

import {
  fetchCompanyJobs,
} from "@/shared/services/company.service";
import type { FetchJobsParams } from "@/shared/services/job.service";
import type { IResponseApiPagination } from "@/shared/types/api";
import type { Job } from "@/shared/types/job";

interface UseCompanyJobsOptions extends FetchJobsParams {
  companySlug: string;
}

export function useCompanyJobs({
  companySlug,
  page = 1,
  limit = 6,
  q,
  address,
  careerCategoryId,
  careerCategorySlug,
  salaryMin,
  salaryMax,
  experienceYears,
  experienceYearsMin,
  experienceYearsMax,
  companyId,
  status,
  jobType,
  skillIds,
  skillSlugs,
  sortBy,
  sortOrder,
}: UseCompanyJobsOptions) {
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

        const data = await fetchCompanyJobs(companySlug, {
          page,
          limit,
          q,
          address,
          careerCategoryId,
          careerCategorySlug,
          salaryMin,
          salaryMax,
          experienceYears,
          experienceYearsMin,
          experienceYearsMax,
          companyId,
          status,
          jobType,
          skillIds,
          skillSlugs,
          sortBy,
          sortOrder,
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
