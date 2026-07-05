import PrivacyPage from "@/portals/jobseeker/features/static/PrivacyPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
};

export default function Page() {
  return <PrivacyPage />;
}
