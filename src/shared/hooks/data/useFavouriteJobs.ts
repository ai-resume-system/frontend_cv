"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  AUTH_USER_UPDATED_EVENT,
  getCachedToken,
} from "@/shared/services/account.service";
import {
  addFavouriteJob,
  fetchFavouriteJobs,
  removeFavouriteJob,
} from "@/shared/services/favourite-job.service";
import type { Job } from "@/shared/types/job";

interface FavouriteJobsStoreSnapshot {
  error: string | null;
  isLoaded: boolean;
  isLoading: boolean;
  jobs: Job[];
  pendingJobIds: string[];
}

const EMPTY_SNAPSHOT: FavouriteJobsStoreSnapshot = {
  error: null,
  isLoaded: false,
  isLoading: false,
  jobs: [],
  pendingJobIds: [],
};

let favouriteJobsSnapshot = EMPTY_SNAPSHOT;
let pendingFavouriteJobsRequest: Promise<Job[]> | null = null;
const pendingFavouriteJobIds = new Set<string>();

const listeners = new Set<() => void>();

function emitFavouriteJobsChange() {
  for (const listener of listeners) {
    listener();
  }
}

function setFavouriteJobsSnapshot(nextSnapshot: FavouriteJobsStoreSnapshot) {
  favouriteJobsSnapshot = nextSnapshot;
  emitFavouriteJobsChange();
}

function getFavouriteJobsSnapshot() {
  return favouriteJobsSnapshot;
}

function subscribeToFavouriteJobsStore(listener: () => void) {
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
  snapshot: Omit<FavouriteJobsStoreSnapshot, "pendingJobIds">,
): FavouriteJobsStoreSnapshot {
  return {
    ...snapshot,
    pendingJobIds: Array.from(pendingFavouriteJobIds),
  };
}

function setFavouriteJobPending(jobId: string, isPending: boolean) {
  if (isPending) {
    pendingFavouriteJobIds.add(jobId);
  } else {
    pendingFavouriteJobIds.delete(jobId);
  }

  setFavouriteJobsSnapshot(
    withPendingJobIds({
      ...getFavouriteJobsSnapshot(),
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

function applyFavouriteAdded(jobId: string, jobData?: Job): boolean {
  if (!jobData) {
    return false;
  }

  const snapshot = getFavouriteJobsSnapshot();
  const nextJobs = dedupeJobs(
    snapshot.jobs.some((job) => job.id === jobId)
      ? snapshot.jobs
      : [...snapshot.jobs, jobData],
  );

  setFavouriteJobsSnapshot(
    withPendingJobIds({
      ...snapshot,
      jobs: nextJobs,
    }),
  );

  return true;
}

function applyFavouriteRemoved(jobId: string) {
  const snapshot = getFavouriteJobsSnapshot();

  setFavouriteJobsSnapshot(
    withPendingJobIds({
      ...snapshot,
      jobs: snapshot.jobs.filter((job) => job.id !== jobId),
    }),
  );
}

async function loadFavouriteJobs(force = false): Promise<Job[]> {
  if (!getCachedToken()) {
    setFavouriteJobsSnapshot(
      withPendingJobIds({
        error: null,
        isLoaded: true,
        isLoading: false,
        jobs: [],
      }),
    );

    return [];
  }

  if (!force && favouriteJobsSnapshot.isLoaded) {
    return favouriteJobsSnapshot.jobs;
  }

  if (pendingFavouriteJobsRequest) {
    return pendingFavouriteJobsRequest;
  }

  setFavouriteJobsSnapshot(
    withPendingJobIds({
      ...favouriteJobsSnapshot,
      error: null,
      isLoading: true,
    }),
  );

  pendingFavouriteJobsRequest = fetchFavouriteJobs()
    .then((jobs) => {
      setFavouriteJobsSnapshot(
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
      setFavouriteJobsSnapshot(
        withPendingJobIds({
          ...favouriteJobsSnapshot,
          error:
            error instanceof Error
              ? error.message
              : "Không thể tải việc làm đã lưu.",
          isLoaded: true,
          isLoading: false,
        }),
      );

      return favouriteJobsSnapshot.jobs;
    })
    .finally(() => {
      pendingFavouriteJobsRequest = null;
    });

  return pendingFavouriteJobsRequest;
}

export function useFavouriteJobs() {
  const snapshot = useSyncExternalStore(
    subscribeToFavouriteJobsStore,
    getFavouriteJobsSnapshot,
    getFavouriteJobsSnapshot,
  );

  useEffect(() => {
    void loadFavouriteJobs();

    function handleAuthChange() {
      pendingFavouriteJobIds.clear();
      favouriteJobsSnapshot = EMPTY_SNAPSHOT;
      emitFavouriteJobsChange();
      void loadFavouriteJobs(true);
    }

    window.addEventListener(AUTH_USER_UPDATED_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, handleAuthChange);
    };
  }, []);

  const refreshFavourites = useCallback(async () => {
    await loadFavouriteJobs(true);
  }, []);

  const toggleFavourite = useCallback(async (jobId: string, jobData?: Job) => {
    const currentSnapshot = getFavouriteJobsSnapshot();

    if (currentSnapshot.pendingJobIds.includes(jobId)) {
      return currentSnapshot.jobs.some((job) => job.id === jobId);
    }

    const isFavourite = currentSnapshot.jobs.some((job) => job.id === jobId);
    setFavouriteJobPending(jobId, true);

    try {
      if (isFavourite) {
        await removeFavouriteJob(jobId);
        applyFavouriteRemoved(jobId);
        return false;
      }

      try {
        await addFavouriteJob(jobId);
      } catch (error) {
        if (!isAlreadyFavoritedError(error)) {
          throw error;
        }
      }

      const appliedLocally = applyFavouriteAdded(jobId, jobData);

      if (!appliedLocally) {
        await loadFavouriteJobs(true);
      }

      return true;
    } finally {
      setFavouriteJobPending(jobId, false);
    }
  }, []);

  const favouriteJobIds = snapshot.jobs.map((job) => job.id);
  const favouriteJobIdSet = new Set(favouriteJobIds);
  const pendingJobIdSet = new Set(snapshot.pendingJobIds);

  return {
    error: snapshot.error,
    favouriteJobCount: snapshot.jobs.length,
    favouriteJobIds,
    favouriteJobs: snapshot.jobs,
    isFavourite: (jobId: string) => favouriteJobIdSet.has(jobId),
    isFavouritePending: (jobId: string) => pendingJobIdSet.has(jobId),
    isLoaded: snapshot.isLoaded,
    isLoading: snapshot.isLoading,
    pendingJobIds: snapshot.pendingJobIds,
    refreshFavourites,
    toggleFavourite,
  };
}
