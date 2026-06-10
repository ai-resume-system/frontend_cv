import { BriefcaseBusiness, Phone } from "lucide-react";
import Link from "next/link";

import { HomeSlideshow } from "@/portals/jobseeker/components/layouts/HomeSlideshow";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import {
  fetchCareerCategories,
  fetchTopCareerCategories,
} from "@/shared/services/category.service";
import { fetchCompanies } from "@/shared/services/company.service";
import { fetchJobs } from "@/shared/services/job.service";

import { HotJobsSection } from "./HotJobsSection";

interface HomeStat {
  label: string;
  value: string;
}

function buildHomeStats(params: {
  totalCategories: number;
  totalCompanies: number;
  totalJobs: number;
  totalLocations: number;
}): HomeStat[] {
  const { totalCategories, totalCompanies, totalJobs, totalLocations } = params;

  return [
    {
      label: "Việc làm đang mở",
      value: `${totalJobs}+`,
    },
    {
      label: "Doanh nghiệp",
      value: `${totalCompanies}+`,
    },
    {
      label: "Ngành nghề",
      value: `${totalCategories}+`,
    },
    {
      label: "Khu vực tuyển dụng",
      value: `${totalLocations}+`,
    },
  ];
}

//fetchTopCareerCategories
export default async function HomePage() {
  const [
    jobsResult,
    companiesResult,
    categoriesResult,
    topCategoriesResult,
    jobsForLocationsResult,
  ] = await Promise.all([
    fetchJobs(),
    fetchCompanies(),
    fetchCareerCategories(),
    fetchTopCareerCategories({
      limit: 8,
    }),
    fetchJobs(),
  ]);

  const totalJobs = jobsResult.pagination?.totalItems ?? jobsResult.jobs.length;
  const totalCompanies =
    companiesResult.pagination?.totalItems ?? companiesResult.companies.length;
  const totalCategories =
    categoriesResult.pagination?.totalItems ??
    categoriesResult.categories.length;
  const totalLocations = new Set(
    jobsForLocationsResult.jobs
      .map((job) => job.address ?? job.company?.address ?? "")
      .map((address) => address.trim())
      .filter(Boolean),
  ).size;

  const stats = buildHomeStats({
    totalCategories,
    totalCompanies,
    totalJobs,
    totalLocations,
  });

  return (
    <>
      <HomeSlideshow />

      <section className="bg-surface px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {stats.map((stat) => (
            <div
              className="rounded-xl border border-border bg-muted px-5 py-6 text-center shadow-sm transition-transform hover:-translate-y-1"
              key={stat.label}
            >
              <p className="mb-1 text-4xl font-extrabold text-primary">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* <HomeHeroSection stats={stats} /> */}

      <HotJobsSection />

      <section className="bg-background px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Top ngành nghề nổi bật
            </h2>
          </div>

          {topCategoriesResult.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {topCategoriesResult.map((category) => (
                <Link
                  key={category.id}
                  href={`/jobs?category=${category.slug}`}
                  className="group flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl sm:p-5"
                >
                  <BriefcaseBusiness className="mb-2 h-10 w-10 text-primary" />
                  <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-foreground text-sm sm:text-base">
                    {category.name}
                  </p>
                  <p className="mt-1.5 text-xs text-primary font-medium sm:text-sm">
                    {category.jobCount?.toLocaleString("vi-VN")} việc làm
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Chưa có ngành nghề để hiển thị.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="relative">
        <div className="relative mx-auto overflow-hidden bg-linear-to-r from-blue-800 via-blue-900 to-primary px-6 py-12 sm:px-8 md:px-10 md:py-16">
          <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-extrabold text-white">
                Bạn cần tư vấn nghề nghiệp?
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Trao đổi với chuyên gia tư vấn để nhận định hướng cá nhân hóa
                cho bước đi nghề nghiệp tiếp theo.
              </p>
            </div>
            <Link
              className="flex items-center gap-4 rounded-2xl bg-surface px-10 py-5 text-2xl font-semibold text-primary transition-transform hover:scale-105"
              href={`tel:${INFOMATION_WEB.PHONE}`}
            >
              <Phone aria-hidden="true" className="h-6 w-6" />
              {INFOMATION_WEB.PHONE}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
