import { useEffect, useState } from "react";

import { fetchCareerCategories } from "@/shared/services/category.service";
import type { CareerCategory } from "@/shared/types/category";

interface UseCareerCategoriesOptions {
  page?: number;
  limit?: number;
}

export function useCareerCategories({
  page = 1,
  limit = 10,
}: UseCareerCategoriesOptions = {}) {
  const [categories, setCategories] = useState<CareerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCareerCategories({ page, limit });
        if (!cancelled) {
          setCategories(data);
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

  return { categories, loading, error };
}
