import { Suspense } from "react";
import { RecruiterJobListPage } from "@/portals/recruiter/features/jobs/RecruiterJobListPage";

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <RecruiterJobListPage />
    </Suspense>
  );
}
