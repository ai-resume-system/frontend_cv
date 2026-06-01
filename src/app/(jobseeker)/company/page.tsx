import type { Metadata } from "next";

import { CompanyListPage } from "@/portals/jobseeker/features/company/CompanyListPage";

export const metadata: Metadata = {
  title: "Danh sách công ty",
};

export default function CompanyRoute() {
  return <CompanyListPage />;
}
