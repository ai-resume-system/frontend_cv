// Để tạm

import {
  BriefcaseBusiness,
  CalendarCheck,
  LayoutDashboard,
  UsersRound,
} from "lucide-react";

import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";

export interface RecruiterNavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export const RECRUITER_NAV_ITEMS: RecruiterNavItem[] = [
  {
    href: RECRUITER_ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: RECRUITER_ROUTES.JOBS,
    label: "Tin tuyển dụng",
    icon: BriefcaseBusiness,
  },
  {
    href: RECRUITER_ROUTES.APPLICANTS,
    label: "Ứng viên",
    icon: UsersRound,
  },
  {
    href: RECRUITER_ROUTES.INTERVIEWS,
    label: "Phỏng vấn",
    icon: CalendarCheck,
  },
];
