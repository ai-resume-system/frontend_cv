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
  pendingJobIds: string[];
}

const EMPTY_SNAPSHOT: FavoriteJobsStoreSnapshot = {
  error: null,
  isLoaded: false,
  isLoading: false,
  jobs: [],
  pendingJobIds: [],
};

let favoriteJobsSnapshot = EMPTY_SNAPSHOT;
let pendingFavoriteJobsRequest: Promise<Job[]> | null = null;
const pendingFavoriteJobIds = new Set<string>();

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

function withPendingJobIds(
  snapshot: Omit<FavoriteJobsStoreSnapshot, "pendingJobIds">,
): FavoriteJobsStoreSnapshot {
  return {
    ...snapshot,
    pendingJobIds: Array.from(pendingFavoriteJobIds),
  };
}

function setFavoriteJobPending(jobId: string, isPending: boolean) {
  if (isPending) {
    pendingFavoriteJobIds.add(jobId);
  } else {
    pendingFavoriteJobIds.delete(jobId);
  }

  setFavoriteJobsSnapshot(
    withPendingJobIds({
      ...getFavoriteJobsSnapshot(),
    }),
  );
}

function isAlreadyFavoritedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const apiError = error as Error & {
    rawMessage?: string;
    status?: number;
  };
  const comparableMessage = apiError.rawMessage ?? error.message;

  return (
    apiError.status === 409 ||
    comparableMessage.includes("Job already in favourites") ||
    comparableMessage.includes("already been added to favourites")
  );
}

function applyFavoriteAdded(jobId: string, jobData?: Job): boolean {
  if (!jobData) {
    return false;
  }

  const snapshot = getFavoriteJobsSnapshot();
  const nextJobs = dedupeJobs(
    snapshot.jobs.some((job) => job.id === jobId)
      ? snapshot.jobs
      : [...snapshot.jobs, jobData],
  );

  setFavoriteJobsSnapshot(
    withPendingJobIds({
      ...snapshot,
      jobs: nextJobs,
    }),
  );

  return true;
}

function applyFavoriteRemoved(jobId: string) {
  const snapshot = getFavoriteJobsSnapshot();

  setFavoriteJobsSnapshot(
    withPendingJobIds({
      ...snapshot,
      jobs: snapshot.jobs.filter((job) => job.id !== jobId),
    }),
  );
}

async function loadFavoriteJobs(force = false): Promise<Job[]> {
  if (!getCachedToken()) {
    setFavoriteJobsSnapshot(
      withPendingJobIds({
        error: null,
        isLoaded: true,
        isLoading: false,
        jobs: [],
      }),
    );

    return [];
  }

  if (!force && favoriteJobsSnapshot.isLoaded) {
    return favoriteJobsSnapshot.jobs;
  }

  if (pendingFavoriteJobsRequest) {
    return pendingFavoriteJobsRequest;
  }

  setFavoriteJobsSnapshot(
    withPendingJobIds({
      ...favoriteJobsSnapshot,
      error: null,
      isLoading: true,
    }),
  );

  pendingFavoriteJobsRequest = fetchFavoriteJobs()
    .then((jobs) => {
      setFavoriteJobsSnapshot(
        withPendingJobIds({
          error: null,
          isLoaded: true,
          isLoading: false,
          jobs,
        }),
      );

      return jobs;
    })
    .catch((error: unknown) => {
      setFavoriteJobsSnapshot(
        withPendingJobIds({
          ...favoriteJobsSnapshot,
          error:
            error instanceof Error
              ? error.message
              : "Khong the tai viec lam da luu.",
          isLoaded: true,
          isLoading: false,
        }),
      );

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
      pendingFavoriteJobIds.clear();
      favoriteJobsSnapshot = EMPTY_SNAPSHOT;
      emitFavoriteJobsChange();
      void loadFavoriteJobs(true);
    }

    window.addEventListener(AUTH_USER_UPDATED_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, handleAuthChange);
    };
  }, []);

  const refreshFavorites = useCallback(async () => {
    await loadFavoriteJobs(true);
  }, []);

  const toggleFavorite = useCallback(async (jobId: string, jobData?: Job) => {
    const currentSnapshot = getFavoriteJobsSnapshot();

    if (currentSnapshot.pendingJobIds.includes(jobId)) {
      return currentSnapshot.jobs.some((job) => job.id === jobId);
    }

    const isFavorite = currentSnapshot.jobs.some((job) => job.id === jobId);
    setFavoriteJobPending(jobId, true);

    try {
      if (isFavorite) {
        await removeFavoriteJob(jobId);
        applyFavoriteRemoved(jobId);
        return false;
      }

      try {
        await addFavoriteJob(jobId);
      } catch (error) {
        if (!isAlreadyFavoritedError(error)) {
          throw error;
        }
      }

      const appliedLocally = applyFavoriteAdded(jobId, jobData);

      if (!appliedLocally) {
        await loadFavoriteJobs(true);
      }

      return true;
    } finally {
      setFavoriteJobPending(jobId, false);
    }
  }, []);

  const favoriteJobIds = snapshot.jobs.map((job) => job.id);
  const favoriteJobIdSet = new Set(favoriteJobIds);
  const pendingJobIdSet = new Set(snapshot.pendingJobIds);

  return {
    error: snapshot.error,
    favoriteJobCount: snapshot.jobs.length,
    favoriteJobIds,
    favoriteJobs: snapshot.jobs,
    isFavorite: (jobId: string) => favoriteJobIdSet.has(jobId),
    isFavoritePending: (jobId: string) => pendingJobIdSet.has(jobId),
    isLoaded: snapshot.isLoaded,
    isLoading: snapshot.isLoading,
    pendingJobIds: snapshot.pendingJobIds,
    refreshFavorites,
    toggleFavorite,
  };
}
