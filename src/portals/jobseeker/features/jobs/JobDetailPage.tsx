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
import { useState, useEffect } from "react";

import { TopSearchBar } from "@/portals/jobseeker/components/layouts/TopSearchBar";

import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { ROUTES } from "@/shared/constants/constants/routes";
import {
  EJobTypeLabels,
  EJobEducationLevelLabels,
  EJobWorkArrangementLabels,
} from "@/shared/constants/enums/job.enum";
import { useFavouriteJobs } from "@/shared/hooks/data/useFavouriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuthState";
import { useCvList } from "@/shared/hooks/data/useCvList";
import {
  fetchJobMatch,
  calculateJobMatch,
} from "@/shared/services/job.service";
import { StateLayout } from "@/shared/components/ui/StateLayout";
import { showAppAlert, showErrorAlert } from "@/shared/lib/ui/alert";
import { cn } from "@/shared/lib/utils/cn";
import type { Job, JobMatchResponse } from "@/shared/types/job";
import { FAVOURITE_JOB_ADDED_EVENT } from "@/shared/constants/constants/favourite-job";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { JobCard } from "@/shared/components/layouts/JobCard";
import { formatSalary } from "@/shared/lib/helpers/formatPrice.helper";
import { formatBriefAddress } from "@/shared/lib/utils/formatAddress";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Brain,
  Check,
} from "lucide-react";

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

  // AI Match Score states
  const { cvList, isLoading: isCvLoading } = useCvList({ enabled: isLoggedIn });
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [matchResult, setMatchResult] = useState<JobMatchResponse | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  // Sắp xếp CV, đưa isDefault lên đầu
  const sortedCvList = [...cvList].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  // Tự động chọn CV mặc định ban đầu
  useEffect(() => {
    if (sortedCvList.length > 0 && !selectedCvId) {
      const defaultCv =
        sortedCvList.find((cv) => cv.isDefault) || sortedCvList[0];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCvId(defaultCv.id);
    }
  }, [sortedCvList, selectedCvId]);

  // Hàm kiểm tra xem đã có điểm match chưa (chỉ gọi GET, nếu 404 trả về null)
  const handleCheckMatch = async () => {
    if (!selectedCvId || !isLoggedIn) return;
    setIsMatching(true);
    setMatchError(null);
    try {
      const result = await fetchJobMatch(job.slug ?? job.id, selectedCvId);
      setMatchResult(result);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Check match error:", err);
      setMatchError(err.message || "Không thể kiểm tra điểm phù hợp.");
      setMatchResult(null);
    } finally {
      setIsMatching(false);
    }
  };

  // Hàm tính điểm match bằng AI (gọi POST để tính toán và lưu DB)
  const handleCalculateMatch = async () => {
    if (!selectedCvId || !isLoggedIn) return;
    setIsMatching(true);
    setMatchError(null);
    try {
      const result = await calculateJobMatch(job.slug ?? job.id, selectedCvId);
      setMatchResult(result);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Match calculation error:", err);
      setMatchError(err.message || "Không thể tính điểm phù hợp.");
      setMatchResult(null);
    } finally {
      setIsMatching(false);
    }
  };

  // Tự động kiểm tra điểm khi đổi CV hoặc khi trang được load
  useEffect(() => {
    setMatchResult(null);
    setMatchError(null);
    if (selectedCvId && isLoggedIn) {
      void handleCheckMatch();
    }
  }, [selectedCvId, isLoggedIn]);

  const isAnalysisNotReady =
    matchError &&
    (matchError.includes("CV_ANALYSIS_NOT_READY") ||
      matchError.toLowerCase().includes("chưa phân tích") ||
      matchError.toLowerCase().includes("phân tích cv") ||
      matchError.toLowerCase().includes("not ready") ||
      matchError.toLowerCase().includes("chưa được phân tích"));

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
                    {
                      icon: MapPin,
                      label: "Địa điểm",
                      value: formatBriefAddress(getAddress(job)),
                    },
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
                    __html: (
                      job.description ||
                      "<p>Nhà tuyển dụng chưa cập nhật mô tả chi tiết.</p>"
                    ).replace(/&nbsp;/g, " "),
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
              <section className="border border-gray-300 bg-white rounded-3xl overflow-hidden shadow-lg animate-fade-in">
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
                      <span className="font-semibold shrink-0">Lĩnh vực: </span>
                      <span className="font-medium line-clamp-2 text-primary">
                        {job.careerCategory?.name ??
                          "Doanh nghiệp đang cập nhật lĩnh vực"}
                      </span>
                    </p>
                    <p className="flex items-start gap-2.5 text-slate-600">
                      <Users className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="font-semibold shrink-0">
                        Quy mô:
                      </span>{" "}
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
                      <span className="font-semibold shrink-0">
                        Địa điểm:
                      </span>{" "}
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
                      {job.skills.map((skill) => {
                        const isMainSkill = (skill.weight ?? 1) >= 4;
                        return (
                          <span
                            key={skill.id}
                            className={cn(
                              "inline-flex items-center justify-center rounded-full transition-all duration-200",
                              isMainSkill
                                ? "bg-blue-100/80 border border-blue-200/80 px-3 py-1.5 text-xs font-bold text-primary shadow-3xs hover:bg-blue-100"
                                : "bg-slate-50 text-slate-500 border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100",
                            )}
                          >
                            {skill.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </section>

              {isLoggedIn ? (
                <section className="border border-gray-300 bg-white p-6 shadow-lg rounded-3xl text-left">
                  <div className="flex items-center pb-4 mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                      Mức độ phù hợp với công việc
                    </h2>
                  </div>

                  {isCvLoading ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                      <span className="mt-2 text-sm text-slate-500">
                        Đang tải danh sách CV...
                      </span>
                    </div>
                  ) : sortedCvList.length === 0 ? (
                    <StateLayout
                      type="empty"
                      title="Chưa có CV nào"
                      description="Bạn cần tải lên hoặc tạo CV để sử dụng tính năng tính điểm phù hợp bằng AI."
                      noBorder
                      action={{
                        label: "Quản lý CV",
                        href: ROUTES.JOB_SEEKER_CV,
                      }}
                      className="py-6"
                    />
                  ) : (
                    <div className="space-y-4">
                      {/* Chọn CV */}
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">
                          Chọn CV để tính điểm phù hợp
                        </label>
                        <div className="relative">
                          <select
                            value={selectedCvId}
                            onChange={(e) => setSelectedCvId(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-850 focus:border-primary focus:outline-hidden cursor-pointer"
                          >
                            {sortedCvList.map((cv) => (
                              <option key={cv.id} value={cv.id}>
                                {cv.title || "CV chưa đặt tên"}{" "}
                                {cv.isDefault ? "(Mặc định)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Trạng thái loading match */}
                      {isMatching ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                          <span className="mt-3 text-sm font-semibold text-slate-700">
                            AI đang phân tích độ phù hợp...
                          </span>
                          <span className="text-xs text-slate-400 mt-1">
                            Quá trình này có thể mất vài giây
                          </span>
                        </div>
                      ) : matchError ? (
                        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                          {isAnalysisNotReady ? (
                            <div className="text-center space-y-3">
                              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
                              <h3 className="text-sm font-bold text-slate-800">
                                CV chưa được phân tích AI
                              </h3>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                CV này cần được hệ thống AI phân tích cấu trúc
                                trước khi tính toán độ phù hợp với công việc.
                              </p>
                              <Link
                                href={`${ROUTES.JOB_SEEKER_ANALYSIS}?cvId=${selectedCvId}`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-bold text-white shadow-xs transition animate-bounce"
                              >
                                <Brain className="h-3.5 w-3.5" /> Phân tích CV
                                ngay
                              </Link>
                            </div>
                          ) : (
                            <div className="text-center space-y-3">
                              <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
                              <p className="text-xs text-rose-650 font-medium leading-relaxed">
                                {matchError}
                              </p>
                              <button
                                onClick={() => handleCalculateMatch()}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                              >
                                <RefreshCw className="h-3 w-3 animate-spin" />{" "}
                                Thử lại
                              </button>
                            </div>
                          )}
                        </div>
                      ) : matchResult ? (
                        <div className="space-y-5">
                          {/* Vòng tròn Score SVG */}
                          <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                            <div className="relative flex items-center justify-center h-32 w-32">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="50"
                                  className="text-slate-200"
                                  strokeWidth="10"
                                  stroke="currentColor"
                                  fill="transparent"
                                />
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="50"
                                  className="text-[#5af5b7] transition-all duration-500 ease-out"
                                  strokeWidth="10"
                                  strokeDasharray={314.16}
                                  strokeDashoffset={
                                    314.16 -
                                    (314.16 * matchResult.matchScore) / 100
                                  }
                                  strokeLinecap="round"
                                  stroke="currentColor"
                                  fill="transparent"
                                />
                              </svg>
                              <div className="absolute flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-extrabold text-slate-805 tracking-tight leading-none">
                                  {matchResult.matchScore}%
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 tracking-wider mt-1 uppercase">
                                  MATCH SCORE
                                </span>
                              </div>
                            </div>

                            {/* Mô tả mức độ phù hợp */}
                            <div className="mt-3 text-center px-4">
                              <span
                                className={cn(
                                  "inline-block rounded-full px-3 py-1 text-xs font-bold",
                                  matchResult.matchScore >= 80
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : matchResult.matchScore >= 60
                                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                                      : matchResult.matchScore >= 40
                                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                                        : "bg-rose-50 text-rose-600 border border-rose-100",
                                )}
                              >
                                {matchResult.matchScore >= 80
                                  ? "Rất phù hợp"
                                  : matchResult.matchScore >= 60
                                    ? "Phù hợp"
                                    : matchResult.matchScore >= 40
                                      ? "Tương đối phù hợp"
                                      : "Độ tương thích thấp"}
                              </span>
                            </div>
                          </div>

                          {/* Breakdown chi tiết */}
                          <div className="border-t border-slate-100 pt-4">
                            <button
                              onClick={() => setShowBreakdown(!showBreakdown)}
                              className="flex w-full items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                            >
                              <span>CHI TIẾT ĐIỂM THÀ THÀNH PHẦN</span>
                              {showBreakdown ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>

                            {showBreakdown && (
                              <div className="mt-3 space-y-3">
                                {[
                                  {
                                    label: "Kỹ năng cần thiết",
                                    val: matchResult.breakdown.skillMatch,
                                  },
                                  {
                                    label: "Lĩnh vực chuyên môn",
                                    val: matchResult.breakdown
                                      .careerCategoryMatch,
                                  },
                                  {
                                    label: "Kinh nghiệm làm việc",
                                    val: matchResult.breakdown.experienceMatch,
                                  },
                                  {
                                    label: "Tương thích chức danh",
                                    val: matchResult.breakdown
                                      .titleKeywordSimilarity,
                                  },
                                  {
                                    label: "Nguyện vọng công việc",
                                    val: matchResult.breakdown.preferenceMatch,
                                  },
                                ].map((item, idx) => (
                                  <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                                      <span>{item.label}</span>
                                      <span>{item.val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                      <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${item.val}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Các tab Strengths, Risks, Suggestions */}
                          <div className="border-t border-slate-100 pt-4 space-y-4">
                            {/* Điểm mạnh */}
                            {matchResult.strengths &&
                              matchResult.strengths.length > 0 && (
                                <div className="space-y-1.5">
                                  <h3 className="text-xs font-bold text-emerald-650 flex items-center gap-1.5 uppercase tracking-wider">
                                    <Check className="h-4 w-4 stroke-3" /> Điểm
                                    mạnh nổi bật
                                  </h3>
                                  <ul className="space-y-1">
                                    {matchResult.strengths.map((str, idx) => (
                                      <li
                                        key={idx}
                                        className="text-xs text-slate-655 pl-4 relative before:absolute before:left-1 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-slate-400 leading-relaxed"
                                      >
                                        {str}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            {/* Rủi ro */}
                            {matchResult.risks &&
                              matchResult.risks.length > 0 && (
                                <div className="space-y-1.5">
                                  <h3 className="text-xs font-bold text-amber-655 flex items-center gap-1.5 uppercase tracking-wider">
                                    <AlertTriangle className="h-4 w-4" /> Điểm
                                    chưa tương thích
                                  </h3>
                                  <ul className="space-y-1">
                                    {matchResult.risks.map((risk, idx) => (
                                      <li
                                        key={idx}
                                        className="text-xs text-slate-655 pl-4 relative before:absolute before:left-1 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-slate-400 leading-relaxed"
                                      >
                                        {risk}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            {/* Gợi ý */}
                            {matchResult.improvementSuggestions &&
                              matchResult.improvementSuggestions.length > 0 && (
                                <div className="space-y-1.5">
                                  <h3 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                                    <Brain className="h-4 w-4" /> Gợi ý cải
                                    thiện CV
                                  </h3>
                                  <ul className="space-y-1">
                                    {matchResult.improvementSuggestions.map(
                                      (sug, idx) => (
                                        <li
                                          key={idx}
                                          className="text-xs text-slate-655 pl-4 relative before:absolute before:left-1 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-slate-400 leading-relaxed"
                                        >
                                          {sug}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>

                          {/* Nút tính lại */}
                          <div className="flex gap-2 border-t border-slate-100 pt-4">
                            <button
                              onClick={() => handleCalculateMatch()}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Tính toán
                              lại bằng AI
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <button
                            onClick={() => handleCalculateMatch()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-sm font-bold text-white shadow-xs transition cursor-pointer"
                          >
                            <Sparkles className="h-4 w-4" /> Tính điểm phù hợp
                            bằng AI
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              ) : (
                <section className="border border-gray-300 bg-white p-6 shadow-lg rounded-3xl text-left">
                  <h2 className="text-xl font-bold text-slate-800">
                    Điểm phù hợp với công việc
                  </h2>
                  <div className="text-center space-y-4 py-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Đăng nhập tài khoản "Người tìm việc" để xem mức độ phù hợp
                      với công việc của bạn.
                    </p>
                    <Link
                      href={ROUTES.JOB_SEEKER_LOGIN}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-sm font-semibold text-white shadow-md transition duration-200 text-center"
                    >
                      Đăng nhập ngay
                    </Link>
                  </div>
                </section>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
