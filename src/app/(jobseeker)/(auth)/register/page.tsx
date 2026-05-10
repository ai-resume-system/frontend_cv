import { EUserRole } from "@/shared/constants/enums/user.enum";
import { AuthForm } from "@/shared/features/auth/AuthForm";
import { AuthShell } from "@/shared/features/auth/AuthShell";

export default function JobSeekerRegisterRoute() {
  return (
    <AuthShell>
      <AuthForm mode="register" role={EUserRole.JOB_SEEKER} />
    </AuthShell>
  );
}
