import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JobApplyPage } from "@/portals/jobseeker/features/jobs/JobApplyPage";
import { fetchJobBySlug } from "@/shared/services/job.service";

interface JobApplyRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: JobApplyRouteProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const job = await fetchJobBySlug(slug);

    return {
      title: `Ứng tuyển - ${job.title}`,
    };
  } catch {
    return {
      title: "Ứng tuyển công việc",
    };
  }
}

export default async function JobApplyRoute({
  params,
}: JobApplyRouteProps) {
  const { slug } = await params;

  try {
    const job = await fetchJobBySlug(slug);

    return <JobApplyPage job={job} />;
  } catch {
    notFound();
  }
}
