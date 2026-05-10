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
import { messages } from "@/shared/i18n/config";
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
  const t = messages.home.footer;

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
            {t.description}
          </p>

          <div className="mt-8">
            <h3 className="mb-4 text-base font-semibold text-muted-foreground">
              {t.communityTitle}
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
            { href: "#", label: t.intro },
            { href: "#", label: t.privacy },
            { href: "#", label: t.terms },
          ]}
          title={t.aboutUsTitle}
        />

        <FooterNav
          links={[{ href: ROUTES.JOBS, label: t.bestJobs }]}
          title={t.careerTitle}
        />

        <section>
          <h3 className="mb-4 text-base font-semibold text-muted-foreground">
            {t.contactTitle}
          </h3>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <Link
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              href={`tel:${INFOMATION_WEB.PHONE}`}
            >
              <Phone aria-hidden="true" className="h-4 w-4" />
              {t.hotline}: {INFOMATION_WEB.PHONE}
            </Link>
            <Link
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              href={`mailto:${INFOMATION_WEB.EMAIL}`}
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              {t.email}: {INFOMATION_WEB.EMAIL}
            </Link>
            <Link
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              href="#"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" />
              {t.zalo}: {INFOMATION_WEB.PHONE}
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
