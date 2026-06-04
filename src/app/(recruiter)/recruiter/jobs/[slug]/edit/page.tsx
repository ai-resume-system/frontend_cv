import { RecruiterJobEditPage } from "@/portals/recruiter/features/jobs/RecruiterJobEditPage";

export default async function JobEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <RecruiterJobEditPage jobSlug={slug} />;
}
