import type { Metadata } from "next";
import "./globals.css";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";

export const metadata: Metadata = {
  title: INFOMATION_WEB.COMPANY_NAME,
  description: "Nền tảng tuyển dụng, phân tích CV và gợi ý việc làm bằng AI.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
