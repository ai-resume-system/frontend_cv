import type { Metadata } from "next";

import { AuthBootstrap } from "@/shared/components/providers/AuthBootstrap";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: INFOMATION_WEB.COMPANY_NAME,
    template: `${INFOMATION_WEB.COMPANY_NAME} - %s`,
  },
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
    <html
      lang="vi"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <AuthBootstrap>{children}</AuthBootstrap>
      </body>
    </html>
  );
}
