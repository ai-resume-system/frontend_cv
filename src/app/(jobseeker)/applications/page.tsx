import type { Metadata } from "next";

import { ApplicationsPage } from "@/portals/jobseeker/features/applications/ApplicationsPage";

export const metadata: Metadata = {
  title: "Việc làm đã ứng tuyển",
};

export default function JobSeekerApplicationsPage() {
  return <ApplicationsPage />;
}
