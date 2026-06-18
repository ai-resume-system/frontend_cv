import { MapPin } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/shared/constants/constants/routes";
import { resolveMediaUrl } from "@/shared/lib/utils/resolveMediaUrl";
import { stripHtml } from "@/shared/lib/utils/stripHtml";
import type { CompanyDto } from "@/shared/types/company";
import { Badge } from "@/shared/components/ui/Badge";

interface CompanyCardProps {
  company: CompanyDto;
  layout?: "grid" | "list";
}

export function CompanyCard({ company, layout = "grid" }: CompanyCardProps) {
  const bannerUrl = resolveMediaUrl(company.bannerUrl);
  const logoUrl = resolveMediaUrl(company.logoUrl);

  if (layout === "list") {
    return (
      <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
        <Link
          className="flex flex-col sm:flex-row items-center gap-6 focus-visible:outline-none"
          href={
            company.slug
              ? ROUTES.JOB_SEEKER_COMPANY_DETAIL(company.slug)
              : ROUTES.JOB_SEEKER_COMPANY
          }
        >
          <div className="relative h-24 w-24 shrink-0 rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden shadow-sm flex items-center justify-center">
            <img
              alt={company.name ?? "Logo công ty"}
              className="h-full w-full object-cover"
              src={logoUrl ?? "/logo.png"}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2 text-left w-full sm:w-auto">
            <h3 className="text-xl font-bold text-slate-800 transition-colors group-hover:text-primary">
              {company.name ?? "Công ty đang cập nhật"}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">
                {company.address ?? "Địa chỉ đang cập nhật"}
              </span>
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 pt-0.5">
              {stripHtml(company.description) ||
                "Thông tin giới thiệu đang được cập nhật."}
            </p>
            <Badge className="rounded bg-gray-300/60 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
              {company.careerCategory?.name ?? "Ngành nghề đang cập nhật"}
            </Badge>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <Link
        className="relative block h-full focus-visible:outline-none"
        href={
          company.slug
            ? ROUTES.JOB_SEEKER_COMPANY_DETAIL(company.slug)
            : ROUTES.JOB_SEEKER_COMPANY
        }
      >
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            alt={company.name ?? "Banner"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={bannerUrl ?? "/logo.png"}
          />
        </div>

        {/* Day */}
        <div className="absolute top-[176px] left-6 -translate-y-1/2 z-10 rounded-2xl border-2 border-gray-300 bg-white shadow-md">
          <img
            alt={company.name ?? "Logo"}
            className="h-16 w-16 rounded-xl object-cover"
            src={logoUrl ?? "/logo.png"}
          />
        </div>

        <div className="space-y-3.5 p-6 pt-12 text-left">
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-lg font-bold text-slate-800 transition-colors group-hover:text-primary">
              {company.name ?? "Công ty đang cập nhật"}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {company.address ?? "Địa chỉ đang cập nhật"}
              </span>
            </div>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 pt-1">
            {stripHtml(company.description) ||
              "Thông tin giới thiệu đang được cập nhật."}
          </p>

          <Badge className="rounded bg-gray-300/60 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
            {company.careerCategory?.name ?? "Ngành nghề đang cập nhật"}
          </Badge>
        </div>
      </Link>
    </article>
  );
}
