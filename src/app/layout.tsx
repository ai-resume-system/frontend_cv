import type { Metadata } from "next";

import { AuthBootstrap } from "@/shared/components/providers/AuthBootstrap";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";

import "./globals.css";

export const metadata: Metadata = {
  title: INFOMATION_WEB.COMPANY_NAME,
  description:
    "N\u1EC1n t\u1EA3ng tuy\u1EC3n d\u1EE5ng, ph\u00E2n t\u00EDch CV v\u00E0 g\u1EE3i \u00FD vi\u1EC7c l\u00E0m b\u1EB1ng AI.",
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
