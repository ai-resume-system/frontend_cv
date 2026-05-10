import { EUserRole } from "@/shared/constants/enums/user.enum";
import { AuthForm } from "@/shared/features/auth/AuthForm";
import { AuthShell } from "@/shared/features/auth/AuthShell";

export default function RecruiterRegisterRoute() {
  return (
    <AuthShell reverse>
      <AuthForm mode="register" role={EUserRole.RECRUITER} />
    </AuthShell>
  );
}



