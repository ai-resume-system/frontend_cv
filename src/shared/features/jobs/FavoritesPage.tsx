// "use client";

// import { FileHeart, Heart, LoaderCircle, MapPin } from "lucide-react";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// import { Footer } from "@/shared/components/layouts/Footer";
// import { Header } from "@/shared/components/layouts/Header";
// import { BaseButton } from "@/shared/components/ui/BaseButton";
// import { Badge } from "@/shared/components/ui/Badge";
// import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
// import { ROUTES } from "@/shared/constants/constants/routes";
// import { useFavoriteJobs } from "@/shared/hooks/data/useFavoriteJobs";
// import { useAuth } from "@/shared/hooks/ui/useAuth";
// import { cn } from "@/shared/lib/utils/cn";
// import type { Job } from "@/shared/types/job";

// function getCompanyName(job: Job): string {
//   return job.companyName ?? job.company?.companyName ?? "Doanh nghiệp";
// }

// function getLocation(job: Job): string {
//   return job.location ?? job.company?.location ?? "Đang cập nhật";
// }

// function formatSalary(job: Job): string | undefined {
//   if (typeof job.salaryMin === "number" && typeof job.salaryMax === "number") {
//     return `${job.salaryMin.toLocaleString("vi-VN")} - ${job.salaryMax.toLocaleString("vi-VN")} VND`;
//   }

//   if (typeof job.salaryMin === "number") {
//     return `Từ ${job.salaryMin.toLocaleString("vi-VN")} VND`;
//   }

//   if (typeof job.salaryMax === "number") {
//     return `Đến ${job.salaryMax.toLocaleString("vi-VN")} VND`;
//   }

//   return undefined;
// }

// function formatSavedDate(job: Job): string {
//   const value = job.updatedAt ?? job.createdAt;

//   if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
//     return "Đã lưu gần đây";
//   }

//   return `Đã lưu: ${value.toLocaleString("vi-VN", {
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   })}`;
// }

// function formatExperience(job: Job): string | null {
//   if (typeof job.experienceYears !== "number") {
//     return null;
//   }

//   if (job.experienceYears <= 0) {
//     return "Mới đi làm";
//   }

//   return `${job.experienceYears} năm`;
// }

// function buildJobHref(jobId: string): string {
//   return `${ROUTES.JOBS}?jobId=${jobId}`;
// }

// interface FavoriteJobRowProps {
//   job: Job;
// }

// function FavoriteJobRow({ job }: FavoriteJobRowProps) {
//   const { isFavoritePending, toggleFavorite } = useFavoriteJobs();
//   const isPending = isFavoritePending(job.id);
//   const salary = formatSalary(job);
//   const company = getCompanyName(job);
//   const location = getLocation(job);
//   const experience = formatExperience(job);

//   return (
//     <article className="rounded-[28px] border border-primary/35 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5">
//       <div className="flex min-w-0 gap-4 sm:gap-5">
//         <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-border bg-white sm:h-24 sm:w-24">
//           <Image
//             alt={company}
//             className="h-14 w-14 object-contain sm:h-16 sm:w-16"
//             height={64}
//             src="/logo.png"
//             width={64}
//           />
//         </div>

//         <div className="min-w-0 flex-1">
//           <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
//             <div className="min-w-0 flex-1">
//               <a
//                 className="line-clamp-2 text-xl font-bold leading-snug text-foreground transition-colors hover:text-primary"
//                 href={buildJobHref(job.id)}
//               >
//                 {job.title}
//               </a>
//               <p className="mt-2 line-clamp-1 text-lg font-medium uppercase tracking-tight text-muted-foreground">
//                 {company}
//               </p>
//             </div>

//             {salary ? (
//               <div className="shrink-0 text-left text-2xl font-bold text-primary xl:pl-6 xl:text-right">
//                 {salary}
//               </div>
//             ) : null}
//           </div>

//           <div className="mt-4 flex flex-wrap items-center gap-3">
//             <Badge className="rounded-full bg-secondary-soft px-4 py-2 text-sm font-medium text-foreground">
//               <MapPin aria-hidden="true" className="mr-1 h-4 w-4" />
//               {location}
//             </Badge>
//             {experience ? (
//               <Badge className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
//                 {experience}
//               </Badge>
//             ) : null}
//           </div>

//           <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <p className="text-lg font-medium text-muted-foreground">
//               {formatSavedDate(job)}
//             </p>

//             <div className="flex items-center gap-3 self-end sm:self-auto">
//               <BaseButton
//                 className="rounded-full px-6"
//                 href={buildJobHref(job.id)}
//               >
//                 Ứng tuyển
//               </BaseButton>
//               <button
//                 aria-label="Bỏ lưu việc làm"
//                 className={cn(
//                   "flex h-12 w-12 items-center justify-center rounded-full border border-primary bg-white text-primary transition-all hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60",
//                   isPending && "animate-pulse",
//                 )}
//                 disabled={isPending}
//                 onClick={() => {
//                   void toggleFavorite(job.id, job);
//                 }}
//                 type="button"
//               >
//                 <Heart className="h-5 w-5 fill-primary text-primary" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </article>
//   );
// }

// export function FavoritesPage() {
//   const router = useRouter();
//   const { isLoggedIn } = useAuth();
//   const { favoriteJobs, isLoading, isLoaded } = useFavoriteJobs();

//   useEffect(() => {
//     if (isLoggedIn) {
//       return;
//     }

//     if (typeof window !== "undefined") {
//       window.sessionStorage.setItem(
//         SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
//         ROUTES.JOB_SEEKER_FAVORITES,
//       );
//     }

//     router.replace(ROUTES.JOB_SEEKER_LOGIN);
//   }, [isLoggedIn, router]);

//   if (!isLoggedIn) {
//     return null;
//   }

//   return (
//     <main className="min-h-screen bg-background text-foreground">
//       <Header />

//       <section className="bg-background px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
//         <div className="mx-auto max-w-7xl">
//           <div className="mb-10 flex flex-col gap-5 border-b border-border p-6 shadow-b-sm md:flex-row md:items-end md:justify-between">
//             <h1 className="font-display text-4xl font-bold">
//               Danh sách việc làm đã lưu
//             </h1>
//             <p className="">
//               Hiện có{" "}
//               <span className="text-2xl font-bold text-primary">
//                 {favoriteJobs.length}
//               </span>{" "}
//               việc làm đã lưu
//             </p>
//           </div>

//           {isLoading && !isLoaded ? (
//             <div className="flex min-h-[240px] items-center justify-center">
//               <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
//             </div>
//           ) : favoriteJobs.length > 0 ? (
//             <div className="flex flex-col gap-5">
//               {favoriteJobs.map((job) => (
//                 <FavoriteJobRow job={job} key={job.id} />
//               ))}
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center">
//               <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
//                 <FileHeart className="h-8 w-8 text-muted-foreground" />
//               </div>
//               <h2 className="mt-5 text-lg font-semibold text-foreground">
//                 Bạn chưa lưu công việc nào
//               </h2>
//               <div className="mt-6">
//                 <BaseButton href={ROUTES.JOBS}>
//                   Khám phá việc làm ngay
//                 </BaseButton>
//               </div>
//             </div>
//           )}
//         </div>
//       </section>

//       <Footer />
//     </main>
//   );
// }

"use client";

import {
  FileHeart,
  Heart,
  LoaderCircle,
  MapPin,
  Briefcase,
} from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Footer } from "@/shared/components/layouts/Footer";
import { Header } from "@/shared/components/layouts/Header";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { Badge } from "@/shared/components/ui/Badge";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useFavoriteJobs } from "@/shared/hooks/data/useFavoriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { cn } from "@/shared/lib/utils/cn";
import type { Job } from "@/shared/types/job";

function getCompanyName(job: Job): string {
  return job.companyName ?? job.company?.companyName ?? "Doanh nghiệp";
}

function getLocation(job: Job): string {
  return job.location ?? job.company?.location ?? "Đang cập nhật";
}

function formatSalary(job: Job): string | undefined {
  if (typeof job.salaryMin === "number" && typeof job.salaryMax === "number") {
    return `${job.salaryMin.toLocaleString("vi-VN")} - ${job.salaryMax.toLocaleString("vi-VN")} VND`;
  }

  if (typeof job.salaryMin === "number") {
    return `Từ ${job.salaryMin.toLocaleString("vi-VN")} VND`;
  }

  if (typeof job.salaryMax === "number") {
    return `Đến ${job.salaryMax.toLocaleString("vi-VN")} VND`;
  }

  return undefined;
}

function formatSavedDate(job: Job): string {
  const value = job.updatedAt ?? job.createdAt;

  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "Đã lưu gần đây";
  }

  return `Đã lưu: ${value.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;
}

function formatExperience(job: Job): string | null {
  if (typeof job.experienceYears !== "number") {
    return null;
  }

  if (job.experienceYears <= 0) {
    return "Mới đi làm";
  }

  return `${job.experienceYears} năm kinh nghiệm`;
}

function buildJobHref(jobId: string): string {
  return `${ROUTES.JOBS}?jobId=${jobId}`;
}

interface FavoriteJobRowProps {
  job: Job;
}

function FavoriteJobRow({ job }: FavoriteJobRowProps) {
  const { isFavoritePending, toggleFavorite } = useFavoriteJobs();
  const isPending = isFavoritePending(job.id);
  const salary = formatSalary(job);
  const company = getCompanyName(job);
  const location = getLocation(job);
  const experience = formatExperience(job);

  return (
    <article className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        {/* Logo Công ty */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 transition-colors group-hover:border-slate-200 sm:h-20 sm:w-20">
          <Image
            alt={company}
            className="h-full w-full object-contain mix-blend-multiply"
            height={80}
            src="/logo.png"
            width={80}
          />
        </div>

        {/* Nội dung thông tin việc làm */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-4">
            <div className="min-w-0 flex-1">
              <a
                className="inline-block text-lg font-bold leading-snug text-slate-900 transition-colors hover:text-primary sm:text-xl"
                href={buildJobHref(job.id)}
              >
                {job.title}
              </a>
              <p className="mt-1 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                {company}
              </p>
            </div>

            {/* Mức lương hiển thị nổi bật */}
            {salary ? (
              <div className="mt-2 shrink-0 text-base font-bold text-primary md:mt-0 md:text-right md:text-lg">
                {salary}
              </div>
            ) : (
              <div className="mt-2 shrink-0 text-base font-semibold text-slate-400 md:mt-0 md:text-right md:text-lg">
                Thỏa thuận
              </div>
            )}
          </div>

          {/* Hàng chứa các Badges */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <Badge className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-none">
              <MapPin
                aria-hidden="true"
                className="mr-1 h-3.5 w-3.5 text-slate-400"
              />
              {location}
            </Badge>
            {experience ? (
              <Badge className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-none">
                <Briefcase
                  aria-hidden="true"
                  className="mr-1 h-3.5 w-3.5 text-slate-400"
                />
                {experience}
              </Badge>
            ) : null}
          </div>

          <hr className="my-4 border-slate-100" />

          {/* Phần Bottom Row hành động */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium text-slate-400">
              {formatSavedDate(job)}
            </p>

            <div className="flex items-center gap-2.5">
              {/* Nút Hủy Lưu */}
              <button
                aria-label="Bỏ lưu việc làm"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50",
                  isPending && "animate-pulse",
                )}
                disabled={isPending}
                onClick={() => {
                  void toggleFavorite(job.id, job);
                }}
                type="button"
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500 group-hover:scale-105 transition-transform" />
              </button>

              {/* Nút Ứng Tuyển hiển thị mượt mà khi hover */}
              <BaseButton
                className="h-10 rounded-xl px-5 text-sm font-semibold opacity-100 transform transition-all duration-200 md:opacity-0 md:translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0"
                href={buildJobHref(job.id)}
              >
                Ứng tuyển ngay
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function FavoritesPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { favoriteJobs, isLoading, isLoaded } = useFavoriteJobs();

  useEffect(() => {
    if (isLoggedIn) {
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
        ROUTES.JOB_SEEKER_FAVORITES,
      );
    }

    router.replace(ROUTES.JOB_SEEKER_LOGIN);
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col">
      <Header />

      <section className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Header trang tối giản, tinh tế */}
          <div className="mb-8 flex flex-col gap-2 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Danh sách việc làm đã lưu
            </h1>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:text-sm">
              Hiện có {favoriteJobs.length} công việc
            </span>
          </div>

          {/* Trạng thái Loading */}
          {isLoading && !isLoaded ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-100 bg-white">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : favoriteJobs.length > 0 ? (
            // Danh sách Card công việc
            <div className="flex flex-col gap-4">
              {favoriteJobs.map((job) => (
                <FavoriteJobRow job={job} key={job.id} />
              ))}
            </div>
          ) : (
            <div>
              {/* Trạng thái trống (Empty State) */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-4 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 border border-slate-100">
                  <FileHeart className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-base font-bold text-slate-900">
                  Danh sách trống
                </h2>
                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  Bạn chưa lưu công việc nào. Hãy khám phá và lưu lại những vị
                  trí phù hợp với bạn.
                </p>
                <div className="mt-6">
                  <BaseButton className="rounded-xl px-6" href={ROUTES.JOBS}>
                    Khám phá việc làm ngay
                  </BaseButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
