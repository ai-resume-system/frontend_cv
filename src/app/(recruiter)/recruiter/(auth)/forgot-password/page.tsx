import type { Metadata } from "next";

import { ForgotPasswordFlow } from "@/portals/ForgotPasswordFlow";
import { RecruiterShowcase } from "@/portals/recruiter/features/auth/function";
import { EUserRole } from "@/shared/constants/enums/user.enum";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
};

export default function RecruiterForgotPassword() {
  return (
    <ForgotPasswordFlow
      role={EUserRole.RECRUITER}
      showcase={<RecruiterShowcase />}
      showcasePosition="right"
    />
  );
}
