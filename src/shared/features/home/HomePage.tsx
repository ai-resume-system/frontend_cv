import { Phone } from "lucide-react";
import Link from "next/link";

import { CategoryCard } from "@/shared/components/layouts/CategoryCard";
import { Footer } from "@/shared/components/layouts/Footer";
import { Header } from "@/shared/components/layouts/Header";
import { HomeSlideshow } from "@/shared/components/layouts/HomeSlideshow";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { fetchCareerCategoriesWithPagination } from "@/shared/services/category.service";
import { fetchCompanies } from "@/shared/services/company.service";
import { fetchJobs } from "@/shared/services/job.service";

import { FloatingFavoriteButton } from "./FloatingFavoriteButton";
import { HotJobsSection } from "./HotJobsSection";

const CATEGORY_ICONS = ["💻", "💼", "🩺", "📣", "📚", "🚚"] as const;

interface HomeStat {
  label: string;
  value: string;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function buildHomeStats(params: {
  totalJobs: number;
  totalCompanies: number;
  totalCategories: number;
  totalLocations: number;
}): HomeStat[] {
  const { totalJobs, totalCompanies, totalCategories, totalLocations } = params;

  return [
    {
      label: "Việc làm đang mới",
      value: formatCompactNumber(totalJobs),
    },
    {
      label: "Doanh nghiệp",
      value: formatCompactNumber(totalCompanies),
    },
    {
      label: "Ngành nghề",
      value: formatCompactNumber(totalCategories),
    },
    {
      label: "Khu vực tuyển dụng",
      value: formatCompactNumber(totalLocations),
    },
  ];
}

export default async function HomePage() {
  const [
    jobsResult,
    companiesResult,
    categoriesResult,
    jobsForLocationsResult,
  ] = await Promise.all([
    fetchJobs({
      page: 1,
      limit: 1,
      sortBy: "createdAt",
      sortOrder: "DESC",
    }),
    fetchCompanies({
      page: 1,
      limit: 1,
    }),
    fetchCareerCategoriesWithPagination({
      page: 1,
      limit: 6,
    }),
    fetchJobs({
      page: 1,
      limit: 100,
      sortBy: "createdAt",
      sortOrder: "DESC",
    }),
  ]);

  const totalJobs = jobsResult.pagination?.totalItems ?? jobsResult.jobs.length;
  const totalCompanies =
    companiesResult.pagination?.totalItems ?? companiesResult.companies.length;
  const totalCategories =
    categoriesResult.pagination?.totalItems ??
    categoriesResult.categories.length;

  const totalLocations = new Set(
    jobsForLocationsResult.jobs
      .map((job) => job.location ?? job.company?.location ?? "")
      .map((location) => location.trim())
      .filter(Boolean),
  ).size;

  const stats = buildHomeStats({
    totalJobs,
    totalCompanies,
    totalCategories,
    totalLocations,
  });

  const categories = categoriesResult.categories.slice(0, 6);

  return (
    <main className="custom-scrollbar min-h-screen bg-background text-foreground">
      <Header />
      <FloatingFavoriteButton />
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

      <HotJobsSection />

      <section className="bg-background px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Khám phá theo ngành nghề
            </h2>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              {categories.map((category, index) => (
                <CategoryCard
                  href={`/jobs?careerCategoryId=${category.id}`}
                  icon={CATEGORY_ICONS[index % CATEGORY_ICONS.length]}
                  key={category.id}
                  label={category.name}
                />
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
        <div className="relative mx-auto overflow-hidden bg-primary px-6 py-12 sm:px-8 md:px-10 md:py-16">
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

      <Footer />
    </main>
  );
}
