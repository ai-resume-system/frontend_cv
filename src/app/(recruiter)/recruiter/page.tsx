import { redirect } from "next/navigation";

import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";

export default function RecruiterHomePage() {
  redirect(RECRUITER_ROUTES.DASHBOARD);
}
