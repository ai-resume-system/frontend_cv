import {
  BriefcaseBusiness,
  Phone,
  FileUp,
  BrainCircuit,
  Sparkles,
  Zap,
  ShieldCheck,
  Building,
} from "lucide-react";
import Link from "next/link";

import { HomeSlideshow } from "@/portals/jobseeker/components/layouts/HomeSlideshow";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import {
  fetchCareerCategories,
  fetchTopCareerCategories,
} from "@/shared/services/category.service";
import { fetchCompanies } from "@/shared/services/company.service";
import { fetchJobs } from "@/shared/services/job.service";
import { SearchStatsDashboard } from "./SearchStatsDashboard";
import { CompanyCard } from "@/portals/jobseeker/features/company/CompanyCard";

import { HotJobsSection } from "./HotJobsSection";

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

  const stats = [
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

  return (
    <>
      <HomeSlideshow />

      {/* FUSE Blue Gradient Search Stats Dashboard */}
      <SearchStatsDashboard
        categories={categoriesResult.categories}
        totalJobs={totalJobs}
      />

      {/* Original Global Statistics Section */}
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

      {/* Featured Companies Section */}
      <section className="bg-slate-50 px-4 py-16 sm:px-8 border-t border-b border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl text-[#103580]">
              Nhà tuyển dụng nổi bật
            </h2>
            <p className="mt-2 text-sm text-gray-500 font-semibold">
              Những doanh nghiệp hàng đầu đang mở rộng tuyển dụng nhân tài cùng FUSE
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companiesResult.companies.slice(0, 6).map((company) => (
              <CompanyCard key={company.id} company={company} layout="grid" />
            ))}
          </div>
        </div>
      </section>

      {/* AI Process Steps Section */}
      <section className="bg-white px-4 py-16 sm:px-8 border-b border-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl text-[#103580]">
              Quy trình Phân tích CV & Tìm việc bằng AI
            </h2>
            <p className="mt-2 text-sm text-gray-500 font-semibold">
              Chỉ với 3 bước đơn giản để tối ưu hóa cơ hội nghề nghiệp của bạn cùng trí tuệ nhân tạo
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-gray-150 pt-8">
              <div className="absolute top-[-20px] flex h-10 w-10 items-center justify-center rounded-full bg-[#103580] text-white font-extrabold text-sm shadow-md">
                1
               </div>
              <div className="my-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#103580]">
                <FileUp className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-base font-bold text-gray-800">Tải lên hồ sơ (CV)</h3>
              <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
                Tải lên CV của bạn ở định dạng PDF hoặc Word. Hệ thống FUSE AI sẽ tự động phân tích và trích xuất dữ liệu.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-gray-150 pt-8">
              <div className="absolute top-[-20px] flex h-10 w-10 items-center justify-center rounded-full bg-[#103580] text-white font-extrabold text-sm shadow-md">
                2
              </div>
              <div className="my-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#103580]">
                <BrainCircuit className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-base font-bold text-gray-800">AI chấm điểm & Đánh giá</h3>
              <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
                AI tiến hành chấm điểm chất lượng hồ sơ, liệt kê kỹ năng cốt lõi và đưa ra những gợi ý chi tiết để tối ưu hóa CV.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-gray-150 pt-8">
              <div className="absolute top-[-20px] flex h-10 w-10 items-center justify-center rounded-full bg-[#103580] text-white font-extrabold text-sm shadow-md">
                3
              </div>
              <div className="my-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#103580]">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-base font-bold text-gray-800">Gợi ý việc làm phù hợp</h3>
              <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
                Hệ thống tự động so khớp kỹ năng và đề xuất những tin tuyển dụng phù hợp với tỷ lệ trùng khớp lên tới 99%.
              </p>
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
              Những thế mạnh vượt trội giúp bạn chinh phục nhà tuyển dụng trong kỷ nguyên số
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-[#103580]">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-sm font-bold text-gray-900">Gợi ý AI thông minh</h3>
              <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
                So khớp sâu các kỹ năng ẩn và chuyên môn để đề xuất công việc có độ tương thích tốt nhất.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-[#103580]">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-sm font-bold text-gray-900">Tối ưu hóa thời gian</h3>
              <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
                Không cần duyệt tìm thủ công hàng ngàn tin tuyển dụng. AI làm điều đó thay bạn chỉ trong vài giây.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-[#103580]">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-sm font-bold text-gray-900">Bảo mật tuyệt đối</h3>
              <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
                Hồ sơ và thông tin cá nhân của bạn được bảo mật an toàn, chỉ tiết lộ khi bạn nộp hồ sơ.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 text-[#103580]">
                <Building className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-sm font-bold text-gray-900">Nhà tuyển dụng xác thực</h3>
              <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
                Tất cả các tin tuyển dụng và công ty trên FUSE đều qua quy trình xác minh chặt chẽ.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold sm:text-3xl text-[#103580]">
              Top ngành nghề nổi bật
            </h2>
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

      <section className="relative">
        <div className="relative mx-auto overflow-hidden bg-gradient-to-r from-blue-800 via-blue-900 to-[#103580] px-6 py-12 sm:px-8 md:px-10 md:py-16">
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
              className="flex items-center gap-4 rounded-2xl bg-surface px-10 py-5 text-2xl font-semibold text-[#103580] transition-transform hover:scale-105"
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
