import type { Metadata } from "next";

import { RecruiterDashboardPage } from "@/portals/recruiter/features/dashboard/RecruiterDashboardPage";

export const metadata: Metadata = {
  title: "Dashboard recruiter",
};

export default function DashboardPage() {
  return <RecruiterDashboardPage />;
}
