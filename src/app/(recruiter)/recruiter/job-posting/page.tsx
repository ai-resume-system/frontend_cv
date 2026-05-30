import type { Metadata } from "next";

import { RecruiterJobPostingPage } from "@/portals/recruiter/features/job-posting/RecruiterJobPostingPage";

export const metadata: Metadata = {
  title: "Đăng tin tuyển dụng",
};

export default function JobPostingPage() {
  return <RecruiterJobPostingPage />;
}
