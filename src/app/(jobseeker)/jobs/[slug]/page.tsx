import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JobDetailPage } from "@/portals/jobseeker/features/jobs/JobDetailPage";
import {
  fetchJobBySlug,
  fetchRelatedJobs,
} from "@/shared/services/job.service";
import type { Job } from "@/shared/types/job";

interface JobDetailRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: JobDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;

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
  const { slug } = await params;

  let job: Job;
  try {
    job = await fetchJobBySlug(slug);
  } catch {
    notFound();
  }

  let relatedJobs: Job[] = [];
  try {
    relatedJobs = await fetchRelatedJobs(slug, { limit: 3 });
  } catch (error) {
    console.error("Lỗi khi tải việc làm liên quan:", error);
  }

  return <JobDetailPage job={job} relatedJobs={relatedJobs} />;
}
