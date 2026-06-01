import { BriefcaseBusiness, Building2, Globe, MapPin } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/shared/constants/constants/routes";
import { resolveMediaUrl } from "@/shared/lib/utils/resolveMediaUrl";
import type { CompanyDto } from "@/shared/types/company";

interface CompanyCardProps {
  company: CompanyDto;
}

function getEmployeeLabel(company: CompanyDto): string {
  if (
    typeof company.employeeMin === "number" &&
    typeof company.employeeMax === "number"
  ) {
    return `${company.employeeMin}-${company.employeeMax} nhân sự`;
  }

  if (typeof company.employeeMin === "number") {
    return `Từ ${company.employeeMin} nhân sự`;
  }

  if (typeof company.employeeMax === "number") {
    return `Đến ${company.employeeMax} nhân sự`;
  }

  return "Quy mô đang cập nhật";
}

export function CompanyCard({ company }: CompanyCardProps) {
  const bannerUrl = resolveMediaUrl(company.bannerUrl);
  const logoUrl = resolveMediaUrl(company.logoUrl);

  return (
    <article className="group rounded-[28px] border border-surface-container-high bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        className="relative block h-full focus-visible:outline-none"
        href={
          company.slug
            ? ROUTES.JOB_SEEKER_COMPANY_DETAIL(company.slug)
            : ROUTES.JOB_SEEKER_COMPANY
        }
      >
        <div className="relative h-44 overflow-hidden rounded-t-[28px] bg-surface-container-low">
          <img
            alt={company.name ?? "Công ty"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={bannerUrl ?? "/logo.png"}
          />
        </div>

        <div className="absolute top-[176px] left-6 -translate-y-1/2 z-10 rounded-2xl border border-surface-container-high bg-white shadow-sm">
          <img
            alt={company.name ?? "Logo công ty"}
            className="h-18 w-18 rounded-xl object-cover"
            src={logoUrl ?? "/logo.png"}
          />
        </div>

        <div className="space-y-4 p-6 pt-12">
          <div>
            <h3 className="line-clamp-2 text-xl font-bold text-primary transition-colors group-hover:text-primary-hover">
              {company.name ?? "Công ty đang cập nhật"}
            </h3>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {company.address ?? "Địa chỉ đang cập nhật"}
              </span>
              <span className="inline-flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4" />
                {company.openJobCount ?? 0} việc làm
              </span>
            </div>
          </div>

          <p className="line-clamp-3 text-sm leading-6 text-on-surface-variant">
            {company.description ?? "Thông tin giới thiệu đang được cập nhật."}
          </p>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-surface-container px-3 py-1.5 text-on-surface-variant">
              {company.careerCategory?.name ?? "Ngành nghề đang cập nhật"}
            </span>
            <span className="rounded-full bg-surface-container px-3 py-1.5 text-on-surface-variant">
              {getEmployeeLabel(company)}
            </span>
          </div>

          {company.websiteUrl ? (
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Globe className="h-4 w-4" />
              <span className="line-clamp-1">{company.websiteUrl}</span>
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
