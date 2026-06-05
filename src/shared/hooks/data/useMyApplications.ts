import { useCallback, useEffect, useState } from "react";

import {
  type FetchMyJobApplicationsParams,
  fetchMyJobApplications,
} from "@/shared/services/application.service";
import type { IResponseApiPagination } from "@/shared/types/api";
import type { JobSeekerApplicationApiItem } from "@/shared/types/application";

export function useMyApplications(params: FetchMyJobApplicationsParams = {}) {
  const [applications, setApplications] = useState<JobSeekerApplicationApiItem[]>([]);
  const [pagination, setPagination] = useState<IResponseApiPagination | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMyJobApplications(params);
      setApplications(result.applications || []);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi tải danh sách ứng tuyển.");
    } finally {
      setLoading(false);
    }
  }, [
    params.page,
    params.limit,
    params.status,
    params.sortBy,
    params.sortOrder,
  ]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    pagination,
    loading,
    error,
    refetch: fetchApplications,
  };
}
