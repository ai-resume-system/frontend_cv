"use client";

import {
  ArrowRight,
  Box,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardClock,
  Clock,
  Coins,
  ExternalLink,
  GraduationCap,
  Heart,
  Info,
  Laptop,
  MapPin,
  Send,
  SquareUser,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { TopSearchBar } from "@/shared/components/layouts/TopSearchBar";

import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { ROUTES } from "@/shared/constants/constants/routes";
import {
  EJobTypeLabels,
  EJobEducationLevelLabels,
  EJobWorkArrangementLabels,
} from "@/shared/constants/enums/job.enum";
import { useFavouriteJobs } from "@/shared/hooks/data/useFavouriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuthState";
import { showAppAlert, showErrorAlert } from "@/shared/lib/ui/alert";
import { cn } from "@/shared/lib/utils/cn";
import type { Job } from "@/shared/types/job";
import { FAVOURITE_JOB_ADDED_EVENT } from "@/shared/constants/constants/favourite-job";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { JobCard } from "@/shared/components/layouts/JobCard";
import { formatSalary } from "@/shared/lib/helpers/formatPrice.helper";

interface JobDetailPageProps {
  job: Job;
  relatedJobs: Job[];
}

function getCompanyLabel(job: Job): string {
  return job.company?.name ?? "Doanh nghiệp";
}

function getAddress(job: Job): string {
  return job.address ?? job.company?.address ?? "Đang cập nhật";
}

function formatDate(value?: Date): string {
  if (!value) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function buildMapLink(job: Job): string | undefined {
  if (
    typeof job.company?.latitude === "number" &&
    typeof job.company?.longitude === "number"
  ) {
    return `https://www.google.com/maps?q=${job.company.latitude},${job.company.longitude}`;
  }
  const addr = getAddress(job);
  if (addr && addr !== "Đang cập nhật") {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
  }
  return undefined;
}

function buildGoogleMapsUrl(job: Job): string | undefined {
  const coords: { lat?: number | null; lng?: number | null } = {};
  if (job.company?.latitude) coords.lat = job.company.latitude;
  if (job.company?.longitude) coords.lng = job.company.longitude;

  if (typeof coords.lat === "number" && typeof coords.lng === "number") {
    return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;
  }
  const addr = getAddress(job);
  if (addr && addr !== "Đang cập nhật") {
    return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&z=15&output=embed`;
  }
  return undefined;
}

export function JobDetailPage({ job, relatedJobs }: JobDetailPageProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isFavourite, isFavouritePending, toggleFavourite } =
    useFavouriteJobs();

  const saved = isFavourite(job.id);
  const mapsUrl = buildGoogleMapsUrl(job);
  const companySlug = job.company?.slug;
  const companyName = getCompanyLabel(job);

  async function handleApply() {
    if (!isLoggedIn) {
      router.push(ROUTES.JOB_SEEKER_LOGIN);
      return;
    }
    router.push(ROUTES.JOB_SEEKER_JOB_APPLY(job.slug ?? job.id));
  }

  return (
    <>
      <section className="bg-linear-to-r from-primary/95 via-primary/50 to-primary/95 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-0">
          <TopSearchBar />
        </div>
      </section>

      <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <section className="rounded-3xl border border-gray-300 bg-white p-8 shadow-lg">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {job.title}
                </h1>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: Coins,
                      label: "Mức lương",
                      value: formatSalary(job.salaryMin, job.salaryMax),
                    },
                    { icon: MapPin, label: "Địa điểm", value: getAddress(job) },
                    {
                      icon: ClipboardClock,
                      label: "Kinh nghiệm",
                      value:
                        job.experienceYears === 0
                          ? "Không yêu cầu"
                          : `${job.experienceYears} năm`,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 rounded-2xl bg-slate-200 p-4 border border-gray-200/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-xs">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs text-slate-500">
                          {item.label}
                        </span>
                        <span className="truncate font-semibold text-slate-900">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-6">
                  <p className="text-sm text-slate-600">
                    Hạn nộp hồ sơ:{" "}
                    <span className="font-bold text-slate-900">
                      {formatDate(job.expiredAt)}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleApply}
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-6 py-2.5 font-semibold text-white shadow-md shadow-primary/10 transition duration-200"
                    >
                      <Send className="h-4 w-4" /> Ứng tuyển ngay
                    </button>

                    <button
                      disabled={isFavouritePending(job.id)}
                      onClick={async () => {
                        if (!isLoggedIn) {
                          if (typeof window !== "undefined") {
                            window.sessionStorage.setItem(
                              SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
                              ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug ?? job.id),
                            );
                          }
                          router.push(ROUTES.JOB_SEEKER_LOGIN);
                          return;
                        }

                        try {
                          const wasAdded = await toggleFavourite(job.id, job);

                          if (wasAdded && typeof window !== "undefined") {
                            window.dispatchEvent(
                              new CustomEvent(FAVOURITE_JOB_ADDED_EVENT, {
                                detail: { jobId: job.id, title: job.title },
                              }),
                            );
                          }
                        } catch (error) {
                          showErrorAlert(
                            error instanceof Error
                              ? error.message
                              : "Không thể cập nhật danh sách yêu thích.",
                          );
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-primary bg-white px-6 py-2.5 font-semibold text-primary transition hover:bg-blue-50"
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          saved && "fill-primary text-primary",
                        )}
                      />
                      {saved ? "Đã lưu" : "Lưu tin"}
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-300 bg-white p-8 shadow-lg">
                <h2 className="relative flex items-center text-2xl font-semibold tracking-tight text-primary pl-4">
                  <span className="absolute left-0 top-0 h-full w-1 rounded-full bg-linear-to-b from-primary to-secondary-container" />
                  Mô tả chi tiết tuyển dụng
                </h2>
                <div
                  className="prose prose-sm max-w-none mt-6 text-sm leading-7 text-slate-600 [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:ml-5 [&>ol]:ml-5 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{
                    __html:
                      job.description ||
                      "<p>Nhà tuyển dụng chưa cập nhật mô tả chi tiết.</p>",
                  }}
                />

                <div className="flex gap-3 mt-8 pt-8 border-t border-slate-100">
                  <button
                    onClick={handleApply}
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition"
                  >
                    <Send className="h-4 w-4" /> Ứng tuyển ngay
                  </button>
                  <button
                    disabled={isFavouritePending(job.id)}
                    onClick={async () => {
                      if (!isLoggedIn) {
                        if (typeof window !== "undefined") {
                          window.sessionStorage.setItem(
                            SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
                            ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug ?? job.id),
                          );
                        }
                        router.push(ROUTES.JOB_SEEKER_LOGIN);
                        return;
                      }

                      try {
                        const wasAdded = await toggleFavourite(job.id, job);

                        if (wasAdded && typeof window !== "undefined") {
                          window.dispatchEvent(
                            new CustomEvent(FAVOURITE_JOB_ADDED_EVENT, {
                              detail: { jobId: job.id, title: job.title },
                            }),
                          );
                        }
                      } catch (error) {
                        showErrorAlert(
                          error instanceof Error
                            ? error.message
                            : "Không thể cập nhật danh sách yêu thích.",
                        );
                      }
                    }}
                    className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        saved && "fill-primary text-primary",
                      )}
                    />
                    {saved ? "Đã lưu" : "Lưu tin"}
                  </button>
                </div>

                <div className="flex items-start gap-3 bg-blue-50/40 border border-blue-100 p-4 rounded-xl mt-6 text-sm text-slate-600">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p>
                    Báo cáo tin tuyển dụng: Nếu bạn thấy rằng tin tuyển dụng này
                    không đúng hoặc có dấu hiệu lừa đảo,{" "}
                    <Link
                      href={`tel:${INFOMATION_WEB.PHONE}`}
                      className="text-primary font-semibold underline hover:text-blue-700 transition"
                    >
                      hãy phản ánh với chúng tôi
                    </Link>
                    .
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-300 bg-white p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="relative flex items-center text-2xl font-semibold text-primary pl-4">
                    <span className="absolute left-0 top-0 h-full w-1 rounded-full bg-linear-to-b from-primary to-secondary-container" />
                    Việc làm liên quan
                  </h2>
                </div>

                <div className="space-y-6">
                  {relatedJobs.length ? (
                    relatedJobs.map((relatedJob) => (
                      <JobCard key={relatedJob.id} job={relatedJob} />
                    ))
                  ) : (
                    <p className="text-sm text-center text-slate-400 italic">
                      Chưa có thông tin công việc liên quan.
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* Đại diện nội dung liên quan tới công ty */}
            <aside className="space-y-6">
              <section className="border border-gray-300 bg-white rounded-3xl overflow-hidden shadow-lg">
                {job.company?.bannerUrl ? (
                  <img
                    src={job.company.bannerUrl}
                    className="h-40 w-full object-cover"
                    alt="Company Banner"
                  />
                ) : (
                  <div className="bg-linear-to-r from-primary to-secondary-container h-28 w-full relative" />
                )}

                <div className="px-6 pb-6 text-left">
                  <img
                    src={job.company?.logoUrl ?? "/logo.png"}
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-gray-200 shadow-md -mt-10 relative z-10"
                    alt={companyName}
                  />
                  <h2 className="font-bold uppercase text-lg text-slate-700 mt-3 truncate">
                    {companyName}
                  </h2>

                  <div className="mt-5 space-y-3 text-sm text-left">
                    <p className="flex items-start gap-2.5 text-slate-600">
                      <Box className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="font-semibold">Lĩnh vực: </span>
                      <span className="font-medium line-clamp-2 text-primary">
                        {job.careerCategory?.name ??
                          "Doanh nghiệp đang cập nhật lĩnh vực"}
                      </span>
                    </p>
                    <p className="flex items-start gap-2.5 text-slate-600">
                      <Users className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="font-semibold">Quy mô:</span>{" "}
                      <span className="font-medium line-clamp-2 text-primary">
                        {job.company?.employeeMin ||
                        job.company?.employeeMax ? (
                          <>
                            {job.company.employeeMin && job.company.employeeMax
                              ? `${job.company.employeeMin} - ${job.company.employeeMax} nhân viên`
                              : job.company.employeeMin
                                ? `Từ ${job.company.employeeMin} nhân viên`
                                : `Đến ${job.company.employeeMax} nhân viên`}
                          </>
                        ) : (
                          "Đang cập nhật quy mô"
                        )}
                      </span>
                    </p>
                    <p className="flex items-start gap-2.5 text-slate-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="font-semibold">Địa điểm:</span>{" "}
                      <span className="font-medium line-clamp-2 text-primary">
                        {getAddress(job)}
                      </span>
                    </p>
                  </div>

                  {companySlug ? (
                    <Link
                      href={ROUTES.JOB_SEEKER_COMPANY_DETAIL(companySlug)}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                    >
                      <Building2 className="h-4 w-4" />
                      Xem trang công ty
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        void showAppAlert({
                          icon: "info",
                          title: "Chưa có thông tin",
                          text: "Công ty chưa có trang thông tin trên hệ thống.",
                        });
                      }}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                    >
                      <Building2 className="h-4 w-4" />
                      Xem trang công ty
                    </button>
                  )}
                </div>
              </section>

              {/* Bản đồ địa điểm */}
              <section className="border border-gray-300 bg-white p-6 shadow-lg rounded-3xl text-left">
                <h2 className="text-xl font-bold text-slate-800">
                  Địa điểm công ty
                </h2>
                {mapsUrl ? (
                  <div className="relative mt-4 aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                    <a
                      href={buildMapLink(job)}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-primary shadow-md transition hover:bg-slate-50 cursor-pointer"
                    >
                      Mở trong Maps <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <iframe
                      allowFullScreen
                      className="h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={mapsUrl}
                      title="Vị trí công ty"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-4/3 flex-col items-center justify-center gap-3 p-6 text-center mt-4">
                    <MapPin className="h-10 w-10 text-slate-400" />
                    <p className="text-sm text-slate-500">
                      Địa điểm chưa được cập nhật
                    </p>
                  </div>
                )}
              </section>

              {/* Thông tin chung */}
              <section className="border border-gray-300 bg-white p-8 shadow-lg rounded-3xl">
                <h2 className="text-2xl font-bold text-slate-700 mb-6">
                  Thông tin chung
                </h2>
                <div className="space-y-6">
                  {" "}
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Loại hình làm việc
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        {EJobTypeLabels[job.jobType]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Hình thức làm việc
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        {job.workArrangement
                          ? EJobWorkArrangementLabels[job.workArrangement]
                          : "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Trình độ học vấn
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        {job.educationLevel
                          ? EJobEducationLevelLabels[job.educationLevel]
                          : "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <SquareUser className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Số lượng tuyển dụng
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        {job.vacancyCount
                          ? `${job.vacancyCount} người`
                          : "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Cập nhật
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        {formatDate(job.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {job.skills?.length ? (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70 mb-3">
                      Kỹ năng nổi bật
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-semibold text-primary"
                          key={skill.id}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
