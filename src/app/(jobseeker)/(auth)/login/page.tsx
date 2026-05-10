import { EUserRole } from "@/shared/constants/enums/user.enum";
import { AuthForm } from "@/shared/features/auth/AuthForm";
import { AuthShell } from "@/shared/features/auth/AuthShell";

export default function JobSeekerLoginRoute() {
  return (
    <AuthShell>
      <AuthForm mode="login" role={EUserRole.JOB_SEEKER} />
    </AuthShell>
  );
}
