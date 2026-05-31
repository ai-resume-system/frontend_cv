import { useEffect, useState } from "react";

import { fetchCareerCategories } from "@/shared/services/category.service";
import type { CareerCategory } from "@/shared/types/career-category";

interface UseCareerCategoriesOptions {
  page?: number;
  limit?: number;
}

const careerCategoryCache = new Map<string, CareerCategory[]>();
const careerCategoryRequests = new Map<string, Promise<CareerCategory[]>>();

function getCareerCategoryCacheKey({
  page = 1,
  limit = 10,
}: UseCareerCategoriesOptions): string {
  return `${page}-${limit}`;
}

export function useCareerCategories({
  page = 1,
  limit = 10,
}: UseCareerCategoriesOptions = {}) {
  const cacheKey = getCareerCategoryCacheKey({ page, limit });
  const [categories, setCategories] = useState<CareerCategory[]>(
    () => careerCategoryCache.get(cacheKey) ?? [],
  );
  const [loading, setLoading] = useState(
    () => !careerCategoryCache.has(cacheKey),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cachedCategories = careerCategoryCache.get(cacheKey);

      if (cachedCategories) {
        setCategories(cachedCategories);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const request =
          careerCategoryRequests.get(cacheKey) ??
          fetchCareerCategories({ page, limit });

        careerCategoryRequests.set(cacheKey, request);

        const data = await request;

        if (!cancelled) {
          careerCategoryCache.set(cacheKey, data);
          setCategories(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        careerCategoryRequests.delete(cacheKey);
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, limit, page]);

  return { categories, loading, error };
}
