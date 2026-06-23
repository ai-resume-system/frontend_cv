"use client";

import { useEffect, useState } from "react";

import { fetchCurrentUser } from "@/shared/services/account.service";
import {
  fetchApplicationsByJobId,
  fetchAllRecruiterJobApplications,
  fetchRecruiterNewApplicants,
  fetchRecruiterInterviews,
} from "@/shared/services/recruiter-job-application.service";
import { fetchRecruiterJobs } from "@/shared/services/recruiter-job.service";
import type { AuthUser } from "@/shared/types/account";
import type { RecruiterApplicationApiItem } from "@/shared/types/application";
import type { RecruiterDashboardMetrics } from "@/shared/types/dashboard";
import {
  RecruiterApplicationSummary,
  RecruiterJobOverview,
  RecruiterTrendPoint,
} from "@/shared/types/dashboard";
import type { Job } from "@/shared/types/job";
import { EJobStatus } from "@/shared/constants/enums/job.enum";
import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";

interface RecruiterDashboardState {
  applications: RecruiterApplicationSummary[];
  error: string | null;
  jobs: Job[];
  jobOverviews: RecruiterJobOverview[];
  loading: boolean;
  metrics: RecruiterDashboardMetrics;
  recruiter: AuthUser | null;
  trend: RecruiterTrendPoint[];
  todayInterviews: RecruiterApplicationApiItem[];
}

const INITIAL_METRICS: RecruiterDashboardMetrics = {
  totalJobs: 0,
  openJobs: 0,
  totalApplications: 0,
  interviewApplications: 0,
};

const EMPTY_TREND: RecruiterTrendPoint[] = Array.from(
  { length: 6 },
  (_, index) => ({
    label: `T-${5 - index}`,
    value: 0,
  }),
);

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function mapApplicationSummary(
  application: RecruiterApplicationApiItem,
): RecruiterApplicationSummary {
  return {
    id: application.id,
    jobId: application.jobId,
    jobTitle: application.job?.title ?? "Tin tuy\u1ec3n d\u1ee5ng",
    applicantName:
      application.fullName ??
      application.user?.email ??
      application.contactEmail ??
      "\u1ee8ng vi\u00ean",
    applicantEmail:
      application.contactEmail ?? application.user?.email ?? undefined,
    applicantPhone:
      application.contactPhone ?? application.user?.phone ?? undefined,
    avatarUrl: application.user?.avatarUrl ?? null,
    cvTitle: application.cv?.title ?? undefined,
    matchingScore: application.matchingScore ?? undefined,
    status: application.status,
    createdAt: toDate(application.createdAt),
  };
}

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
        application.createdAt >= week.start &&
        application.createdAt <= week.end,
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
    todayInterviews: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const now = new Date();
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
        ).toISOString();
        const endOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
        ).toISOString();

        const [
          recruiter,
          jobsResult,
          allAppsResult,
          newApplicants,
          interviewsResult,
        ] = await Promise.all([
          fetchCurrentUser(),
          fetchRecruiterJobs({ page: 1, limit: 12 }),
          fetchAllRecruiterJobApplications({ page: 1, limit: 100 }),
          fetchRecruiterNewApplicants({ limit: 6 }),
          fetchRecruiterInterviews({
            page: 1,
            limit: 5,
            from: startOfToday,
            to: endOfToday,
            sortOrder: "ASC",
          }),
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

        const applications = newApplicants.map(mapApplicationSummary);
        const allApplications = allAppsResult.applications.map(
          mapApplicationSummary,
        );

        const jobOverviews = applicationSnapshots.map((snapshot) => {
          const scores = snapshot.applications
            .map((application) => application.matchingScore)
            .filter((score): score is number => typeof score === "number");

          return {
            id: snapshot.job.id,
            title: snapshot.job.title,
            address: snapshot.job.address,
            status: snapshot.job.status,
            applicationCount: snapshot.applications.length,
            matchingAverage: scores.length
              ? scores.reduce((total, score) => total + score, 0) /
                scores.length
              : null,
            createdAt: snapshot.job.createdAt,
            expiredAt: snapshot.job.expiredAt ?? null,
            vacancyCount: snapshot.job.vacancyCount ?? null,
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
            openJobs: sortedJobs.filter((job) => job.status === EJobStatus.OPEN)
              .length,
            totalApplications:
              allAppsResult.pagination?.totalItems || allApplications.length,
            interviewApplications: allApplications.filter(
              (application) =>
                application.status === EJobApplicationStatus.INTERVIEW,
            ).length,
          },
          recruiter,
          trend: allApplications.length
            ? buildRecentTrend(allApplications)
            : EMPTY_TREND,
          todayInterviews: interviewsResult.applications,
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
              : "Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c dashboard recruiter.",
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
