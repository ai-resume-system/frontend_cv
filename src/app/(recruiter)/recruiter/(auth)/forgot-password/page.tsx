import { ForgotPasswordFlow } from "@/portals/ForgotPasswordFlow";
import { EUserRole } from "@/shared/constants/enums/user.enum";

export default function RecruiterForgotPassword() {
  return <ForgotPasswordFlow role={EUserRole.RECRUITER} />;
}
