import { redirect } from "next/navigation";

import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";

export default function RecruiterRoute() {
  redirect(RECRUITER_ROUTES.LOGIN);
}

