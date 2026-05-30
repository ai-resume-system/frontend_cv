import type { Metadata } from "next";

import { RecruiterAuthForm } from "@/portals/recruiter/features/auth/RecruiterAuthForm";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function RecruiterLoginRoute() {
  return <RecruiterAuthForm mode="login" />;
}
