import { ForgotPasswordFlow } from "@/portals/ForgotPasswordFlow";
import { EUserRole } from "@/shared/constants/enums/user.enum";

export default function JobSeekerForgotPassword() {
  return <ForgotPasswordFlow role={EUserRole.JOB_SEEKER} />;
}
