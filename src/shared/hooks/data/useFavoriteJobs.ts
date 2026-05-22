"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  AUTH_USER_UPDATED_EVENT,
  getCachedToken,
} from "@/shared/services/account.service";
import {
  addFavoriteJob,
  fetchFavoriteJobs,
  removeFavoriteJob,
} from "@/shared/services/favorite-job.service";
import type { Job } from "@/shared/types/job";

interface FavoriteJobsStoreSnapshot {
  error: string | null;
  isLoaded: boolean;
  isLoading: boolean;
  jobs: Job[];
}

const EMPTY_SNAPSHOT: FavoriteJobsStoreSnapshot = {
  error: null,
  isLoaded: false,
  isLoading: false,
  jobs: [],
};

let favoriteJobsSnapshot = EMPTY_SNAPSHOT;
let pendingFavoriteJobsRequest: Promise<Job[]> | null = null;

const listeners = new Set<() => void>();

function emitFavoriteJobsChange() {
  for (const listener of listeners) {
    listener();
  }
}

function setFavoriteJobsSnapshot(nextSnapshot: FavoriteJobsStoreSnapshot) {
  favoriteJobsSnapshot = nextSnapshot;
  emitFavoriteJobsChange();
}

function getFavoriteJobsSnapshot() {
  return favoriteJobsSnapshot;
}

function subscribeToFavoriteJobsStore(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function dedupeJobs(jobs: Job[]): Job[] {
  const jobMap = new Map<string, Job>();

  for (const job of jobs) {
    jobMap.set(job.id, job);
  }

  return Array.from(jobMap.values());
}

async function loadFavoriteJobs(force = false): Promise<Job[]> {
  if (!getCachedToken()) {
    setFavoriteJobsSnapshot({
      error: null,
      isLoaded: true,
      isLoading: false,
      jobs: [],
    });

    return [];
  }

  if (!force && favoriteJobsSnapshot.isLoaded) {
    return favoriteJobsSnapshot.jobs;
  }

  if (pendingFavoriteJobsRequest) {
    return pendingFavoriteJobsRequest;
  }

  setFavoriteJobsSnapshot({
    ...favoriteJobsSnapshot,
    error: null,
    isLoading: true,
  });

  pendingFavoriteJobsRequest = fetchFavoriteJobs()
    .then((jobs) => {
      setFavoriteJobsSnapshot({
        error: null,
        isLoaded: true,
        isLoading: false,
        jobs,
      });

      return jobs;
    })
    .catch((error: unknown) => {
      setFavoriteJobsSnapshot({
        ...favoriteJobsSnapshot,
        error: error instanceof Error ? error.message : "Không thể tải việc làm đã lưu.",
        isLoaded: true,
        isLoading: false,
      });

      return favoriteJobsSnapshot.jobs;
    })
    .finally(() => {
      pendingFavoriteJobsRequest = null;
    });

  return pendingFavoriteJobsRequest;
}

export function useFavoriteJobs() {
  const snapshot = useSyncExternalStore(
    subscribeToFavoriteJobsStore,
    getFavoriteJobsSnapshot,
    getFavoriteJobsSnapshot,
  );

  useEffect(() => {
    void loadFavoriteJobs();

    function handleAuthChange() {
      favoriteJobsSnapshot = EMPTY_SNAPSHOT;
      emitFavoriteJobsChange();
      void loadFavoriteJobs(true);
    }

    window.addEventListener(AUTH_USER_UPDATED_EVENT, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const refreshFavorites = useCallback(async () => {
    await loadFavoriteJobs(true);
  }, []);

  const toggleFavorite = useCallback(
    async (jobId: string, jobData?: Job) => {
      const currentSnapshot = getFavoriteJobsSnapshot();
      const isFavorite = currentSnapshot.jobs.some((job) => job.id === jobId);

      if (isFavorite) {
        await removeFavoriteJob(jobId);

        setFavoriteJobsSnapshot({
          ...getFavoriteJobsSnapshot(),
          jobs: getFavoriteJobsSnapshot().jobs.filter((job) => job.id !== jobId),
        });

        return false;
      }

      await addFavoriteJob(jobId);

      if (jobData) {
        setFavoriteJobsSnapshot({
          ...getFavoriteJobsSnapshot(),
          jobs: dedupeJobs([...getFavoriteJobsSnapshot().jobs, jobData]),
        });
      } else {
        await loadFavoriteJobs(true);
      }

      return true;
    },
    [],
  );

  const favoriteJobIds = snapshot.jobs.map((job) => job.id);
  const favoriteJobIdSet = new Set(favoriteJobIds);

  return {
    error: snapshot.error,
    favoriteJobCount: snapshot.jobs.length,
    favoriteJobIds,
    favoriteJobs: snapshot.jobs,
    isFavorite: (jobId: string) => favoriteJobIdSet.has(jobId),
    isLoaded: snapshot.isLoaded,
    isLoading: snapshot.isLoading,
    refreshFavorites,
    toggleFavorite,
  };
}
