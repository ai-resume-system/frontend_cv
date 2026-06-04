import { Metadata } from "next";

import { RecruiterJobCreatePage } from "@/portals/recruiter/features/jobs/RecruiterJobCreatePage";

export const metadata: Metadata = {
  title: "Đăng tin tuyển dụng",
};

export default function JobCreatePage() {
  return <RecruiterJobCreatePage />;
}
