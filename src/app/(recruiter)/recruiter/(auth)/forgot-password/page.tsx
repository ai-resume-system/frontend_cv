import type { Metadata } from "next";

import { ForgotPasswordFlow } from "@/portals/ForgotPasswordFlow";
import { EUserRole } from "@/shared/constants/enums/user.enum";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
};

export default function RecruiterForgotPassword() {
  return <ForgotPasswordFlow role={EUserRole.RECRUITER} />;
}
