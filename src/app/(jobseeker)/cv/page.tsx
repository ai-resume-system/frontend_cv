import type { Metadata } from "next";

import { CvPage } from "@/portals/jobseeker/features/cv/CvPage";

export const metadata: Metadata = {
  title: "CV AI",
};

export default function JobSeekerCvPage() {
  return <CvPage />;
}
