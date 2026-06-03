"use client";

import type { ReadonlyURLSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import {
  INITIAL_JOB_FILTER_STATE,
  JOB_FILTER_QUERY_BUILDERS,
  JOB_FILTER_SEARCH_PARAM_KEYS,
  type JobFilterEmptyValues,
  type JobFilterKey,
  type JobFilterState,
  omitEmptyFilterValues,
} from "@/shared/constants/constants/filter.constants";
import type { FetchJobsParams } from "@/shared/services/job.service";

interface JobFilterRouter {
  push: (href: string) => void;
}

type SearchParamsLike =
  | URLSearchParams
  | ReadonlyURLSearchParams
  | null
  | undefined;

interface UseJobFiltersOptions {
  autoResetPageOnFilterChange?: boolean;
  baseQuery?: Partial<FetchJobsParams>;
  defaultPage?: number;
  emptyValues?: JobFilterEmptyValues;
  initialState?: Partial<JobFilterState>;
  mode: "local" | "url";
  pageParamName?: string;
  paramAliases?: Partial<Record<JobFilterKey, string[]>>;
  pathname?: string;
  router?: JobFilterRouter;
  searchParams?: SearchParamsLike;
}

type JobFilterStateUpdater =
  | JobFilterState
  | ((currentState: JobFilterState) => JobFilterState);

function normalizeSearchParams(
  searchParams: SearchParamsLike,
): URLSearchParams | null {
  if (!searchParams) {
    return null;
  }

  return new URLSearchParams(searchParams.toString());
}

export function useJobFilters({
  autoResetPageOnFilterChange = true,
  baseQuery,
  defaultPage = 1,
  emptyValues = {},
  initialState,
  mode,
  pageParamName = "page",
  paramAliases,
  pathname,
  router,
  searchParams,
}: UseJobFiltersOptions) {
  const mergedInitialState = useMemo<JobFilterState>(
    () => ({
      ...INITIAL_JOB_FILTER_STATE,
      ...initialState,
    }),
    [initialState],
  );

  const readFromSearchParams = useCallback((): JobFilterState => {
    const normalizedSearchParams = normalizeSearchParams(searchParams);

    if (!normalizedSearchParams) {
      return mergedInitialState;
    }

    const nextState: JobFilterState = {
      ...mergedInitialState,
    };

    for (const key of Object.keys(
      JOB_FILTER_SEARCH_PARAM_KEYS,
    ) as JobFilterKey[]) {
      const keysToRead = [
        JOB_FILTER_SEARCH_PARAM_KEYS[key],
        ...(paramAliases?.[key] ?? []),
      ];

      const value = keysToRead
        .map((paramKey) => normalizedSearchParams.get(paramKey))
        .find((paramValue) => paramValue !== null);

      if (typeof value === "string") {
        if (key === "sort") {
          nextState.sort =
            value === "salary"
              ? "salary"
              : value === "updatedAt"
                ? "updatedAt"
                : "createdAt";
          continue;
        }

        nextState[key] = value;
      }
    }

    return nextState;
  }, [mergedInitialState, paramAliases, searchParams]);

  const readPageFromSearchParams = useCallback(() => {
    const normalizedSearchParams = normalizeSearchParams(searchParams);

    if (!normalizedSearchParams) {
      return defaultPage;
    }

    const nextPage = Number(normalizedSearchParams.get(pageParamName) ?? "1");

    return nextPage > 0 ? nextPage : defaultPage;
  }, [defaultPage, pageParamName, searchParams]);

  const [filters, setFiltersState] = useState<JobFilterState>(() =>
    mode === "url" ? readFromSearchParams() : mergedInitialState,
  );
  const [page, setPage] = useState<number>(() =>
    mode === "url" ? readPageFromSearchParams() : defaultPage,
  );

  const setFilters = useCallback(
    (updater: JobFilterStateUpdater) => {
      setFiltersState((currentState) => {
        const nextState =
          typeof updater === "function" ? updater(currentState) : updater;

        return nextState;
      });

      if (autoResetPageOnFilterChange) {
        setPage(defaultPage);
      }
    },
    [autoResetPageOnFilterChange, defaultPage],
  );

  const setFilter = useCallback(
    <Key extends JobFilterKey>(key: Key, value: JobFilterState[Key]) => {
      setFilters((currentState) => ({
        ...currentState,
        [key]: value,
      }));
    },
    [setFilters],
  );

  const resetFilters = useCallback(() => {
    setFiltersState(mergedInitialState);
    setPage(defaultPage);

    if (mode === "url" && pathname && router) {
      router.push(pathname);
    }
  }, [defaultPage, mergedInitialState, mode, pathname, router]);

  const buildQueryOptions = useCallback((): FetchJobsParams => {
    const queryOptions: FetchJobsParams = {
      ...baseQuery,
      page,
    };

    for (const key of Object.keys(JOB_FILTER_QUERY_BUILDERS) as JobFilterKey[]) {
      const value = filters[key];

      if (!value && key !== "sort") {
        continue;
      }

      const isDefaultValue =
        value ===
        (emptyValues[key] ??
          (mergedInitialState[key] as string | undefined) ??
          INITIAL_JOB_FILTER_STATE[key]);

      if (isDefaultValue && key !== "sort") {
        continue;
      }

      Object.assign(queryOptions, JOB_FILTER_QUERY_BUILDERS[key](value, filters));
    }

    return queryOptions;
  }, [baseQuery, emptyValues, filters, mergedInitialState, page]);

  const applyFilters = useCallback(
    (nextPage = defaultPage) => {
      if (mode === "local") {
        setPage(nextPage);
        return;
      }

      if (!pathname || !router) {
        return;
      }

      const nextSearchParams = new URLSearchParams();
      const activeFilters = omitEmptyFilterValues(filters, {
        ...mergedInitialState,
        ...emptyValues,
      });

      for (const key of Object.keys(activeFilters) as JobFilterKey[]) {
        const value = activeFilters[key];

        if (!value) {
          continue;
        }

        nextSearchParams.set(JOB_FILTER_SEARCH_PARAM_KEYS[key], value);
      }

      if (nextPage > defaultPage) {
        nextSearchParams.set(pageParamName, `${nextPage}`);
      }

      const query = nextSearchParams.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [
      defaultPage,
      emptyValues,
      filters,
      mergedInitialState,
      mode,
      pageParamName,
      pathname,
      router,
    ],
  );

  const hasActiveFilters = useMemo(
    () =>
      Object.keys(
        omitEmptyFilterValues(filters, {
          ...mergedInitialState,
          ...emptyValues,
        }),
      ).length > 0,
    [emptyValues, filters, mergedInitialState],
  );

  const isDefaultValue = useCallback(
    (key: JobFilterKey, value: string) =>
      value ===
      (emptyValues[key] ??
        (mergedInitialState[key] as string | undefined) ??
        INITIAL_JOB_FILTER_STATE[key]),
    [emptyValues, mergedInitialState],
  );

  return {
    applyFilters,
    buildQueryOptions,
    filters,
    hasActiveFilters,
    isDefaultValue,
    page,
    readFromSearchParams,
    resetFilters,
    setFilter,
    setFilters,
  };
}
