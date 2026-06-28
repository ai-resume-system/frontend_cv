import {
  ArrowRight,
  BriefcaseBusiness,
  Building,
  Rocket,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { HomeSlideshow } from "@/portals/jobseeker/components/layouts/HomeSlideshow";
import { CompanyCard } from "@/portals/jobseeker/features/company/CompanyCard";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { ROUTES } from "@/shared/constants/constants/routes";
import {
  fetchCareerCategories,
  fetchTopCareerCategories,
} from "@/shared/services/category.service";
import { fetchCompanies } from "@/shared/services/company.service";
import { fetchJobs } from "@/shared/services/job.service";
import { SearchStatsDashboard } from "./SearchStatsDashboard";

import { HotJobsSection } from "./HotJobsSection";

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

  const stats = [
    {
      label: "Việc làm đang tuyển",
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

  return (
    <>
      <HomeSlideshow />

      {/* FUSE Blue Gradient Search Stats Dashboard */}
      <SearchStatsDashboard totalJobs={totalJobs} stats={stats} />

      {/* Adding padding-top to HotJobsSection because of overlapping stats */}
      <div className="bg-[#f8fafc]/30">
        <HotJobsSection />
      </div>

      {/* Top ngành nghề nổi bật (Moved up) */}
      <section className="bg-background px-4 py-16 sm:px-8 border-t border-slate-100">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6 border-b border-slate-100 pb-4">
            <div className="text-left">
              <h2 className="font-display text-2xl font-bold sm:text-3xl text-[#103580]">
                Top ngành nghề nổi bật
              </h2>
            </div>
            <Link
              href={ROUTES.JOBS}
              className="text-[#103580] hover:underline font-bold text-sm flex items-center gap-1 shrink-0"
            >
              Xem tất cả các ngành nghề
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {topCategoriesResult.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {topCategoriesResult.map((category) => (
                <Link
                  key={category.id}
                  href={`/jobs?category=${category.slug}`}
                  className="group flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#103580] hover:shadow-xl sm:p-5"
                >
                  <BriefcaseBusiness className="mb-2 h-10 w-10 text-[#103580]" />
                  <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-foreground text-sm sm:text-base">
                    {category.name}
                  </p>
                  <p className="mt-1.5 text-xs text-[#103580] font-medium sm:text-sm">
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

      {/* Featured Companies Section (Moved down below Top Categories) */}
      <section className="bg-slate-50 px-4 py-16 sm:px-8 border-t border-b border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6 border-b border-slate-100 pb-4">
            <h2 className="text-left font-display text-2xl font-bold sm:text-3xl text-[#103580]">
              Nhà tuyển dụng nổi bật
            </h2>

            <Link
              href={ROUTES.JOB_SEEKER_COMPANY}
              className="text-[#103580] hover:underline font-bold text-sm flex items-center gap-1 shrink-0"
            >
              Xem tất cả công ty
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companiesResult.companies.slice(0, 6).map((company) => (
              <CompanyCard key={company.id} company={company} layout="simple" />
            ))}
          </div>
        </div>
      </section>

      {/* AI Process Steps Section */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-left">
            <h2 className="text-left font-display text-2xl font-bold sm:text-3xl text-[#103580]">
              Quy trình phân tích CV và gợi ý việc làm
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-20 relative w-full items-stretch">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-slate-200/80 pt-8 shadow-sm hover:shadow-md transition-shadow duration-300 max-w-[380px] w-full mx-auto">
              <div className="absolute top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#103580] text-white font-extrabold text-sm shadow-sm">
                1
              </div>
              <div
                className="w-full h-44 flex items-center justify-center mb-6 overflow-visible"
                style={{ perspective: "1000px" }}
              >
                <div
                  className="relative w-[90%] h-full transition-all duration-500 hover:scale-105"
                  style={{
                    transform: "rotateY(15deg) rotateX(5deg) rotateZ(-2deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <img
                    src="/upload_cv.png"
                    alt="Tải CV"
                    className="h-full w-full object-contain pointer-events-none drop-shadow-[12px_16px_16px_rgba(16,53,128,0.12)]"
                  />
                </div>
              </div>
              <div className="text-center px-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#103580] leading-snug mb-2">
                    Tải hồ sơ của bạn
                  </h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Tải lên hồ sơ trên FUSE một cách nhanh chóng và dễ dàng.
                  </p>
                </div>
              </div>

              {/* Mobile Connector 1 */}
              <div className="flex md:hidden absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-20 items-center justify-center pointer-events-none">
                <svg
                  className="w-6 h-6 text-[#103580]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                  />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-slate-200/80 pt-8 shadow-sm hover:shadow-md transition-shadow duration-300 max-w-[380px] w-full mx-auto">
              <div className="absolute top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#103580] text-white font-extrabold text-sm shadow-sm">
                2
              </div>
              <div
                className="w-full h-44 flex items-center justify-center mb-6 overflow-visible"
                style={{ perspective: "1000px" }}
              >
                <div
                  className="relative w-full scale-[1.05] h-full transition-all duration-500 hover:scale-[1.1]"
                  style={{
                    transform: "rotateY(15deg) rotateX(5deg) rotateZ(-2deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <img
                    src="/analysis_cv.png"
                    alt="Phân tích CV"
                    className="h-full w-full object-contain pointer-events-none drop-shadow-[12px_16px_16px_rgba(16,53,128,0.12)]"
                  />
                </div>
              </div>
              <div className="text-center px-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#103580] leading-snug mb-2">
                    AI phân tích và chấm điểm
                  </h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    AI phân tích kỹ năng, kinh nghiệm và chấm điểm mức độ phù
                    hợp của bạn với thị trường.
                  </p>
                </div>
              </div>

              {/* Mobile Connector 2 */}
              <div className="flex md:hidden absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-20 items-center justify-center pointer-events-none">
                <svg
                  className="w-6 h-6 text-[#103580]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                  />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-slate-200/80 pt-8 shadow-sm hover:shadow-md transition-shadow duration-300 max-w-[380px] w-full mx-auto">
              <div className="absolute top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#103580] text-white font-extrabold text-sm shadow-sm">
                3
              </div>
              <div
                className="w-full h-44 flex items-center justify-center mb-6 overflow-visible"
                style={{ perspective: "1000px" }}
              >
                <div
                  className="relative w-[90%] h-full transition-all duration-500 hover:scale-105"
                  style={{
                    transform: "rotateY(15deg) rotateX(5deg) rotateZ(-2deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <img
                    src="/suggestion_job.png"
                    alt="Gợi ý việc làm"
                    className="h-full w-full object-contain pointer-events-none drop-shadow-[12px_16px_16px_rgba(16,53,128,0.12)]"
                  />
                </div>
              </div>
              <div className="text-center px-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#103580] leading-snug mb-2">
                    Gợi ý việc làm phù hợp
                  </h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Nhận danh sách việc làm phù hợp nhất với hồ sơ và mục tiêu
                    của bạn.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Connector 1 */}
            <div className="hidden md:flex absolute top-[35%] -translate-y-1/2 left-[33.33%] -translate-x-1/2 items-center justify-center z-20 pointer-events-none">
              <svg
                className="w-6 h-6 text-[#103580]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>

            {/* Desktop Connector 2 */}
            <div className="hidden md:flex absolute top-[35%] -translate-y-1/2 left-[66.66%] -translate-x-1/2 items-center justify-center z-20 pointer-events-none">
              <svg
                className="w-6 h-6 text-[#103580]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose FUSE Section */}
      <section className="bg-slate-50 px-4 py-16 sm:px-8 border-b border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl text-[#103580]">
              Tại sao lựa chọn FUSE?
            </h2>
            <p className="mt-2 text-sm text-gray-500 font-semibold">
              Những thế mạnh vượt trội giúp bạn chinh phục nhà tuyển dụng trong
              kỷ nguyên số
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-[#103580]">
                <Rocket className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-sm font-bold text-gray-900">
                Gợi ý AI thông minh
              </h3>
              <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
                So khớp sâu các kỹ năng ẩn và chuyên môn để đề xuất công việc có
                độ tương thích tốt nhất.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-[#103580]">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-sm font-bold text-gray-900">
                Tối ưu hóa thời gian
              </h3>
              <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
                Không cần duyệt tìm thủ công hàng ngàn tin tuyển dụng. AI làm
                điều đó thay bạn chỉ trong vài giây.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-[#103580]">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-sm font-bold text-gray-900">
                Bảo mật tuyệt đối
              </h3>
              <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
                Hồ sơ và thông tin cá nhân của bạn được bảo mật an toàn, chỉ
                tiết lộ khi bạn nộp hồ sơ.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-[#103580]">
                <Building className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-sm font-bold text-gray-900">
                Nhà tuyển dụng xác thực
              </h3>
              <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
                Tất cả các tin tuyển dụng và công ty trên FUSE đều qua quy trình
                xác minh chặt chẽ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bạn cần tư vấn nghề nghiệp? */}
      <section className="relative w-full bg-linear-to-r from-[#103580] via-blue-900 to-blue-700 py-8 md:py-10 overflow-visible">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-12 items-center gap-8 overflow-visible">
          {/* Văn bản & Nút liên kết */}
          <div className="md:col-span-8 flex flex-col items-start space-y-6 z-10">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white font-display leading-tight">
                Bạn cần tư vấn nghề nghiệp?
              </h2>
              <p className="text-base md:text-lg w-full md:w-2/3 text-white/80 font-sans leading-relaxed">
                Trao đổi với chuyên gia tư vấn để nhận định hướng cá nhân hóa
                cho bước đi nghề nghiệp tiếp theo.
              </p>
            </div>

            <Link
              href={`tel:${INFOMATION_WEB.PHONE}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-[#103580] shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Nhận tư vấn ngay
              <ArrowRight className="h-5 w-5 text-[#103580]" />
            </Link>
          </div>

          <div className="absolute right-0 bottom-0 top-0 hidden md:block w-200 lg:w-full h-full z-10">
            <img
              src="/contact_me.png"
              alt="Tư vấn nghề nghiệp"
              className="absolute -bottom-18 right-0 h-100 max-w-none object-contain object-bottom pointer-events-none"
            />
          </div>
        </div>
      </section>
    </>
  );
}
