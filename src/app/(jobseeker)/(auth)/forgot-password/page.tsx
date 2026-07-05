import type { Metadata } from "next";

import { ForgotPasswordFlow } from "@/portals/ForgotPasswordFlow";
import { JobSeekerShowcase } from "@/portals/jobseeker/features/auth/function";
import { EUserRole } from "@/shared/constants/enums/user.enum";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
};

export default function JobSeekerForgotPassword() {
  return (
    <ForgotPasswordFlow
      role={EUserRole.JOB_SEEKER}
      showcase={<JobSeekerShowcase />}
      showcasePosition="left"
    />
  );
}
