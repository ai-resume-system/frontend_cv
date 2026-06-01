import { CvAnalysisResultPage } from "@/portals/jobseeker/features/analysis/CvAnalysisResultPage";

export default async function AnalysisResultPage({
  params,
}: {
  params: Promise<{ cvId: string }>;
}) {
  const { cvId } = await params;
  return <CvAnalysisResultPage cvId={cvId} />;
}
