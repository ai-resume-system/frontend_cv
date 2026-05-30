import type { Metadata } from "next";

import { JobListPage } from "@/portals/jobseeker/features/jobs/JobListPage";

export const metadata: Metadata = {
  title: "Công việc",
};

export default function JobsRoute() {
  return <JobListPage />;
}
