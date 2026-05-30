import type { Metadata } from "next";

import { RecruiterAuthForm } from "@/portals/recruiter/features/auth/RecruiterAuthForm";

export const metadata: Metadata = {
  title: "Đăng ký",
};

export default function RecruiterRegisterRoute() {
  return <RecruiterAuthForm mode="register" />;
}
