import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JobDetailPage } from "@/portals/jobseeker/features/jobs/JobDetailPage";
import { fetchJobBySlug, fetchJobs } from "@/shared/services/job.service";

interface JobDetailRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: JobDetailRouteProps): Promise<Metadata> {
  const { id: slug } = await params;

  try {
    const job = await fetchJobBySlug(slug);

    return {
      title: job.title,
    };
  } catch {
    return {
      title: "Chi tiết công việc",
    };
  }
}

export default async function JobDetailRoute({ params }: JobDetailRouteProps) {
  const { id: slug } = await params;

  try {
    const job = await fetchJobBySlug(slug);
    const relatedJobsResult = await fetchJobs({
      careerCategoryId: job.careerCategory?.id,
      limit: 3,
      page: 1,
      sortBy: "createdAt",
      sortOrder: "DESC",
      status: "open",
    });

    const relatedJobs = relatedJobsResult.jobs.filter(
      (relatedJob) => relatedJob.id !== job.id,
    );

    return <JobDetailPage job={job} relatedJobs={relatedJobs} />;
  } catch {
    notFound();
  }
}
