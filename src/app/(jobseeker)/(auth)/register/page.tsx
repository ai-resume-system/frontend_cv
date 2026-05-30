import type { Metadata } from "next";

import { JobSeekerAuthForm } from "@/portals/jobseeker/features/auth/JobSeekerAuthForm";

export const metadata: Metadata = {
  title: "Đăng ký",
};

export default function JobSeekerRegisterRoute() {
  return <JobSeekerAuthForm mode="register" />;
}
