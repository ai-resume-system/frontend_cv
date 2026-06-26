import { Suspense } from "react";
import { RecruiterApplicantsByJobPage } from "@/portals/recruiter/features/applicants/RecruiterApplicantsByJobPage";

export default async function ApplicantsByJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <RecruiterApplicantsByJobPage jobId={jobId} />
    </Suspense>
  );
}
