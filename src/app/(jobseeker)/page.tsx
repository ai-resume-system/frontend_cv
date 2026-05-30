import type { Metadata } from "next";

import HomePage from "@/shared/features/home/HomePage";

export const metadata: Metadata = {
  title: "Trang chủ",
};

export default function Home() {
  return <HomePage />;
}
