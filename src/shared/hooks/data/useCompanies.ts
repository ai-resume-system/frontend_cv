"use client";

import { useEffect, useState } from "react";

import {
  fetchCompanies,
  type FetchCompaniesParams,
} from "@/shared/services/company.service";
import type { IResponseApiPagination } from "@/shared/types/api";
import type { CompanyDto } from "@/shared/types/company";

type UseCompaniesOptions = FetchCompaniesParams;

export function useCompanies({
  page = 1,
  limit = 12,
  q,
  sortBy,
  sortOrder,
  address,
  careerCategoryId,
  careerCategorySlug,
}: UseCompaniesOptions = {}) {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
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

        const data = await fetchCompanies({
          page,
          limit,
          q,
          sortBy,
          sortOrder,
          address,
          careerCategoryId,
          careerCategorySlug,
        });

        if (!cancelled) {
          setCompanies(data.companies);
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
    limit,
    page,
    q,
    sortBy,
    sortOrder,
  ]);

  return { companies, pagination, loading, error };
}
