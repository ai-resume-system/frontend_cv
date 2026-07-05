import type { Metadata } from "next";
import TermsPage from "@/portals/jobseeker/features/static/TermsPage";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
};

export default function Page() {
  return <TermsPage />;
}
