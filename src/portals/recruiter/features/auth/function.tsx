"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils/cn";
import { ShieldCheck, Sparkles } from "lucide-react";

const SHOWCASE_SECTION_CLASSES =
  "relative flex min-h-screen w-full flex-col justify-start gap-10 overflow-hidden px-8 py-10 text-white lg:gap-12 lg:px-10 lg:py-12 xl:gap-14 xl:px-12 xl:py-14 2xl:gap-16 2xl:px-16 2xl:py-16";
const SHOWCASE_HEADING_CLASSES =
  "text-3xl font-bold leading-[1.0] tracking-tight xl:text-5xl 2xl:text-6xl";
const SHOWCASE_BODY_CLASSES =
  "text-lg leading-8 text-white/72 xl:text-xl xl:leading-9 2xl:text-2xl 2xl:leading-10";

export function RecruiterShowcase() {
  return (
    <section className={cn(SHOWCASE_SECTION_CLASSES, "bg-[#123AB2]")}>
      <Image
        alt=""
        aria-hidden="true"
        className="object-cover object-center"
        fill
        priority
        sizes="50vw"
        src="/background_2.webp"
      />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,51,161,0.78)_0%,rgba(41,76,182,0.88)_100%)]" />
        <div className="absolute right-[-10%] top-[-12%] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-8%] h-96 w-96 rounded-full bg-cyan-300/12 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col max-w-xl xl:max-w-2xl">
        <h2 className={cn("mt-6 lg:mt-8", SHOWCASE_HEADING_CLASSES)}>
          Kết nối nhân tài <br /> Kiến tạo tương lai
        </h2>
        <p className={cn("mt-6 xl:mt-8", SHOWCASE_BODY_CLASSES)}>
          Gia nhập mạng lưới nhà tuyển dụng thông minh, sử dụng AI chính xác để
          xây dựng đội ngũ đẳng cấp thế giới.
        </p>
      </div>

      <div className="relative z-10 mt-auto grid gap-6 pt-12 xl:pt-16">
        <FeatureLine
          icon={<Sparkles className="h-6 w-6" />}
          title="Tuyển dụng chính xác"
        />
        <FeatureLine
          icon={<ShieldCheck className="h-6 w-6" />}
          title="Chiến lược dựa trên AI"
        />
        <FeatureLine
          icon={<ShieldCheck className="h-6 w-6" />}
          title="Thông tin chi tiết đã được xác minh"
        />
      </div>
    </section>
  );
}

export function FeatureLine({
  icon,
  text,
  title,
}: {
  icon?: ReactNode;
  text?: string;
  title?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 xl:h-14 xl:w-14">
        {icon}
      </div>
      <div>
        <p className="text-base font-semibold uppercase tracking-[0.18em] text-white xl:text-lg">
          {title}
        </p>
        <p className="mt-1 text-base text-white/72 xl:text-lg">{text}</p>
      </div>
    </div>
  );
}
