import type { Metadata } from "next";

import { JobSeekerAuthForm } from "@/portals/jobseeker/features/auth/JobSeekerAuthForm";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function JobSeekerLoginRoute() {
  return <JobSeekerAuthForm mode="login" />;
}
