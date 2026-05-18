import { Mail, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  faFacebookF,
  faLinkedinIn,
  faTiktok,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { ROUTES } from "@/shared/constants/constants/routes";
import { HOME_MESSAGES } from "@/shared/constants/constants/messages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const communityLinks = [
  {
    icon: faFacebookF,
    label: "Facebook",
    href: "#",
  },
  {
    icon: faYoutube,
    label: "YouTube",
    href: "#",
  },
  {
    icon: faLinkedinIn,
    label: "LinkedIn",
    href: "#",
  },
  {
    icon: faTiktok,
    label: "TikTok",
    href: "#",
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-muted">
      <div className="mx-auto grid max-w-7xl gap-10 py-12 sm:px-8 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.85fr] lg:px-12">
        <section>
          <div className="mb-4 flex items-center gap-2 font-extrabold text-primary">
            <Image alt="Logo" height={50} src="/logo.png" width={50} />
            <span className="text-2xl uppercase">
              {INFOMATION_WEB.COMPANY_NAME}
            </span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Nền tảng tìm kiếm việc làm hàng đầu được tối ưu bằng trí tuệ nhân
            tạo, mang lại sự kết nối hoàn hảo giữa ứng viên và doanh nghiệp.
          </p>

          <div className="mt-8">
            <h3 className="mb-4 text-base font-semibold text-muted-foreground">
              Cộng đồng FUSE
            </h3>
            <div className="flex gap-3">
              {communityLinks.map((item) => {
                return (
                  <Link
                    aria-label={item.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-white transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    href={item.href}
                    key={item.label}
                  >
                    <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <FooterNav
          links={[
            { href: "#", label: "Giới thiệu" },
            { href: "#", label: "Chính sách bảo mật" },
            { href: "#", label: "Điều khoản sử dụng" },
          ]}
          title="Về chúng tôi"
        />

        <FooterNav
          links={[{ href: ROUTES.JOBS, label: "Việc làm tốt nhất" }]}
          title="Xây dựng sự nghiệp"
        />

        <section>
          <h3 className="mb-4 text-base font-semibold text-muted-foreground">
            Liên hệ
          </h3>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <Link
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              href={`tel:${INFOMATION_WEB.PHONE}`}
            >
              <Phone aria-hidden="true" className="h-4 w-4" />
              Hotline: {INFOMATION_WEB.PHONE}
            </Link>
            <Link
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              href={`mailto:${INFOMATION_WEB.EMAIL}`}
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              Email: {INFOMATION_WEB.EMAIL}
            </Link>
            <Link
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              href="#"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" />
              Zalo: {INFOMATION_WEB.PHONE}
            </Link>
          </div>
        </section>
      </div>

      <div className="w-full border-t-2 border-border py-4 text-center text-[10px] font-bold tracking-[0.2em] text-muted-foreground">
        &copy; {INFOMATION_WEB.COPYRIGHT_YEAR}{" "}
        <span className="uppercase">{INFOMATION_WEB.COMPANY_NAME}</span>. Kiến
        tạo sự nghiệp bền vững.
      </div>
    </footer>
  );
}

interface FooterNavProps {
  links: Array<{
    href: string;
    label: string;
  }>;
  title: string;
}

function FooterNav({ links, title }: FooterNavProps) {
  return (
    <nav className="flex flex-col">
      <h3 className="mb-4 text-base font-semibold text-gray-500">{title}</h3>
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <Link
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
            href={link.href}
            key={link.label}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
