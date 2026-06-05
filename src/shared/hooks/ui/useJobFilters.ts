"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { ReadonlyURLSearchParams } from "next/navigation";

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
  const paramAliasesRef = useRef(paramAliases);
  paramAliasesRef.current = paramAliases;

  const emptyValuesRef = useRef(emptyValues);
  emptyValuesRef.current = emptyValues;

  const baseQueryRef = useRef(baseQuery);
  baseQueryRef.current = baseQuery;

  const mergedInitialState = useMemo<JobFilterState>(
    () => ({
      ...INITIAL_JOB_FILTER_STATE,
      ...initialState,
    }),
    [initialState],
  );

  const mergedInitialStateRef = useRef(mergedInitialState);
  mergedInitialStateRef.current = mergedInitialState;

  const readFromSearchParams = useCallback((): JobFilterState => {
    const normalizedSearchParams = normalizeSearchParams(searchParams);

    if (!normalizedSearchParams) {
      return mergedInitialStateRef.current;
    }

    const nextState: JobFilterState = {
      ...mergedInitialStateRef.current,
    };

    for (const key of Object.keys(
      JOB_FILTER_SEARCH_PARAM_KEYS,
    ) as JobFilterKey[]) {
      const keysToRead = [
        JOB_FILTER_SEARCH_PARAM_KEYS[key],
        ...(paramAliasesRef.current?.[key] ?? []),
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
  }, [searchParams]);

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

  useEffect(() => {
    if (mode === "url") {
      setFiltersState(readFromSearchParams());
      setPage(readPageFromSearchParams());
    }
  }, [searchParams, mode, readFromSearchParams, readPageFromSearchParams]);

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
    setFiltersState(mergedInitialStateRef.current);
    setPage(defaultPage);

    if (mode === "url" && pathname && router) {
      router.push(pathname);
    }
  }, [defaultPage, mode, pathname, router]);

  const buildQueryOptions = useCallback((): FetchJobsParams => {
    const queryOptions: FetchJobsParams = {
      ...baseQueryRef.current,
      page,
    };

    for (const key of Object.keys(
      JOB_FILTER_QUERY_BUILDERS,
    ) as JobFilterKey[]) {
      const value = filters[key];

      if (!value && key !== "sort") {
        continue;
      }

      const isDefaultValue =
        value ===
        (emptyValuesRef.current[key] ??
          (mergedInitialStateRef.current[key] as string | undefined) ??
          INITIAL_JOB_FILTER_STATE[key]);

      if (isDefaultValue && key !== "sort") {
        continue;
      }

      Object.assign(
        queryOptions,
        JOB_FILTER_QUERY_BUILDERS[key](value, filters),
      );
    }

    return queryOptions;
  }, [filters, page]);

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
        ...mergedInitialStateRef.current,
        ...emptyValuesRef.current,
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
      filters,
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
      (emptyValuesRef.current[key] ??
        (mergedInitialStateRef.current[key] as string | undefined) ??
        INITIAL_JOB_FILTER_STATE[key]),
    [],
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
