import { EUserRole } from "@/shared/constants/enums/user.enum";
import { AuthForm } from "@/shared/features/auth/AuthForm";
import { AuthShell } from "@/shared/features/auth/AuthShell";

export default function RecruiterLoginRoute() {
  return (
    <AuthShell reverse>
      <AuthForm mode="login" role={EUserRole.RECRUITER} />
    </AuthShell>
  );
}



