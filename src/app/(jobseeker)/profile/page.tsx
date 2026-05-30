import type { Metadata } from "next";

import { ProfilePage } from "@/portals/jobseeker/features/profile/ProfilePage";

export const metadata: Metadata = {
  title: "Hồ sơ",
};

export default function JobSeekerProfilePage() {
  return <ProfilePage />;
}
