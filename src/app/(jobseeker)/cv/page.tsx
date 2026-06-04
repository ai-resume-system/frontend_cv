import type { Metadata } from "next";

import { CvPage } from "@/portals/jobseeker/features/cv/CvPage";

export const metadata: Metadata = {
  title: "Quản lý hồ sơ",
};

export default function JobSeekerCvPage() {
  return <CvPage />;
}
