"use client";

import { useEffect, useState } from "react";

import { fetchCurrentUser } from "@/shared/services/account.service";
import type { AuthUser } from "@/shared/types/auth";
import type { Job } from "@/shared/types/job";

import {
  fetchApplicationsByJobId,
  fetchRecruiterJobs,
} from "@/portals/recruiter/services/recruiter-job.service";
import type {
  RecruiterApplicationSummary,
  RecruiterDashboardMetrics,
  RecruiterJobOverview,
  RecruiterTrendPoint,
} from "@/portals/recruiter/types/dashboard";

interface RecruiterDashboardState {
  applications: RecruiterApplicationSummary[];
  error: string | null;
  jobs: Job[];
  jobOverviews: RecruiterJobOverview[];
  loading: boolean;
  metrics: RecruiterDashboardMetrics;
  recruiter: AuthUser | null;
  trend: RecruiterTrendPoint[];
}

const INITIAL_METRICS: RecruiterDashboardMetrics = {
  totalJobs: 0,
  openJobs: 0,
  totalApplications: 0,
  averageMatchingScore: null,
};

const EMPTY_TREND: RecruiterTrendPoint[] = Array.from({ length: 6 }, (_, index) => ({
  label: `T-${5 - index}`,
  value: 0,
}));

function buildRecentTrend(
  applications: RecruiterApplicationSummary[],
): RecruiterTrendPoint[] {
  const weeks = Array.from({ length: 6 }, (_, index) => {
    const start = new Date();
    start.setDate(start.getDate() - (5 - index) * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      start,
      end,
    };
  });

  return weeks.map((week) => ({
    label: week.label,
    value: applications.filter(
      (application) =>
        application.createdAt >= week.start && application.createdAt <= week.end,
    ).length,
  }));
}

export function useRecruiterDashboard() {
  const [state, setState] = useState<RecruiterDashboardState>({
    applications: [],
    error: null,
    jobs: [],
    jobOverviews: [],
    loading: true,
    metrics: INITIAL_METRICS,
    recruiter: null,
    trend: EMPTY_TREND,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [recruiter, jobsResult] = await Promise.all([
          fetchCurrentUser(),
          fetchRecruiterJobs({ page: 1, limit: 12 }),
        ]);

        const sortedJobs = [...jobsResult.jobs].sort(
          (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
        );

        const applicationSnapshots = await Promise.all(
          sortedJobs.slice(0, 6).map(async (job) => {
            const response = await fetchApplicationsByJobId(job.id, {
              page: 1,
              limit: 20,
            });

            return {
              applications: response.applications,
              job,
            };
          }),
        );

        if (cancelled) {
          return;
        }

        const applications = applicationSnapshots
          .flatMap((snapshot) => snapshot.applications)
          .sort(
            (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
          );

        const matchingScores = applications
          .map((application) => application.matchingScore)
          .filter((score): score is number => typeof score === "number");

        const jobOverviews = applicationSnapshots.map((snapshot) => {
          const scores = snapshot.applications
            .map((application) => application.matchingScore)
            .filter((score): score is number => typeof score === "number");

          return {
            id: snapshot.job.id,
            title: snapshot.job.title,
            location: snapshot.job.location,
            status: snapshot.job.status,
            applicationCount: snapshot.applications.length,
            matchingAverage: scores.length
              ? scores.reduce((total, score) => total + score, 0) / scores.length
              : null,
            createdAt: snapshot.job.createdAt,
          };
        });

        setState({
          applications,
          error: null,
          jobs: sortedJobs,
          jobOverviews,
          loading: false,
          metrics: {
            totalJobs: sortedJobs.length,
            openJobs: sortedJobs.filter((job) => job.status === "open").length,
            totalApplications: applications.length,
            averageMatchingScore: matchingScores.length
              ? matchingScores.reduce((total, score) => total + score, 0) /
                matchingScores.length
              : null,
          },
          recruiter,
          trend: applications.length ? buildRecentTrend(applications) : EMPTY_TREND,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState((currentState) => ({
          ...currentState,
          error:
            error instanceof Error
              ? error.message
              : "Không tải được dashboard recruiter.",
          loading: false,
        }));
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
