import { RecruiterJobEditPage } from "@/portals/recruiter/features/jobs/RecruiterJobEditPage";

export default async function JobEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RecruiterJobEditPage jobId={id} />;
}
