"use client";

import { Briefcase, Heart, LoaderCircle, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Badge } from "@/shared/components/ui/Badge";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useFavouriteJobs } from "@/shared/hooks/data/useFavouriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuthState";
import { cn } from "@/shared/lib/utils/cn";
import type { Job } from "@/shared/types/job";
import Link from "next/link";
import { formatSalary } from "@/shared/lib/helpers/formatPrice.helper";

function getCompanyLabel(job: Job): string {
  return job.company?.name ?? "Doanh nghiệp";
}

function getAddress(job: Job): string {
  return job.address ?? job.company?.address ?? "Đang cập nhật";
}

function formatSavedDate(job: Job): string {
  const value = job.createdAt;

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
    return "Không yêu cầu kinh nghiệm";
  }

  return `${job.experienceYears} năm kinh nghiệm`;
}

interface FavouriteJobRowProps {
  job: Job;
}

function FavouriteJobRow({ job }: FavouriteJobRowProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isFavouritePending, toggleFavourite } = useFavouriteJobs();
  const isPending = isFavouritePending(job.id);
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const company = getCompanyLabel(job);
  const address = getAddress(job);
  const experience = formatExperience(job);

  function handleApply(slug: string) {
    if (!isLoggedIn) {
      router.push(ROUTES.JOB_SEEKER_LOGIN);
      return;
    }
    router.push(ROUTES.JOB_SEEKER_JOB_APPLY(slug));
  }

  return (
    <article className="group cursor-pointer relative rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
      <Link
        href={ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug ?? job.id)}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5"
      >
        {/* Logo Công ty */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-300 transition-colors group-hover:border-slate-200 sm:h-24 sm:w-24">
          <img
            alt={company}
            className=" h-full w-full object-contain transition-colors"
            src={job.company?.logoUrl ?? "/logo.png"}
          />
        </div>

        {/* Nội dung thông tin việc làm */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-4">
            <div className="min-w-0 flex-1">
              <span className="inline-block text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary sm:text-xl">
                {job.title}
              </span>
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
            <Badge className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-1 text-sm font-medium text-slate-600 shadow-none">
              <MapPin
                aria-hidden="true"
                className="mr-1 h-3.5 w-3.5 text-slate-400"
              />
              {address}
            </Badge>
            {experience ? (
              <Badge className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-1 text-sm font-medium text-slate-600 shadow-none">
                <Briefcase
                  aria-hidden="true"
                  className="mr-1 h-3.5 w-3.5 text-slate-400"
                />
                {experience}
              </Badge>
            ) : null}
          </div>

          <hr className="my-4 border-slate-100" />

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-400">
              {formatSavedDate(job)}
            </p>

            <div className="flex items-center gap-2.5">
              <BaseButton
                className="h-10 rounded-xl px-5 text-sm font-semibold opacity-100 transform transition-all duration-200 md:opacity-0 md:translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleApply(job.slug ?? job.id);
                }}
              >
                Ứng tuyển ngay
              </BaseButton>
              <button
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border border-primary-container bg-white shadow-sm transition-all duration-200 hover:bg-primary-soft active:scale-95 cursor-pointer",
                  isPending && "animate-pulse opacity-60",
                )}
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // Chống nổi bọt sự kiện để không bị click trùng vào card
                  void toggleFavourite(job.id, job);
                }}
                type="button"
              >
                <Heart className="h-4 w-4 fill-primary text-primary transition-transform group-hover:scale-105" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function FavouritesPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { favouriteJobs, isLoading, isLoaded } = useFavouriteJobs();

  useEffect(() => {
    if (isLoggedIn) {
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
        ROUTES.JOB_SEEKER_FAVOURITES,
      );
    }

    router.replace(ROUTES.JOB_SEEKER_LOGIN);
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl grid grid-cols-1 gap-6 bg-slate-50/50 px-4 py-8 text-slate-900 sm:px-6 lg:grid-cols-[1fr_300px] items-start lg:px-8 lg:py-12">
      <div>
        <div className="mb-8 flex flex-col gap-2 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Danh sách việc làm đã lưu
          </h1>
          <Badge className="inline-flex items-center rounded-full w-fit bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:text-sm">
            Hiện có {favouriteJobs.length} công việc
          </Badge>
        </div>

        {isLoading && !isLoaded ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-100 bg-white">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : favouriteJobs.length > 0 ? (
          <div className="flex flex-col gap-4">
            {favouriteJobs.map((job) => (
              <FavouriteJobRow job={job} key={job.id} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="flex items-center justify-center">
              <Image
                alt="Không có dữ liệu"
                height={100}
                priority
                src="/no_data.png"
                width={100}
              />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-800">
              Danh sách trống
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Bạn chưa lưu công việc nào. Hãy khám phá và lưu lại những vị trí
              phù hợp với bạn.
            </p>
            <div className="mt-6">
              <BaseButton className="rounded-xl px-6" href={ROUTES.JOBS}>
                Khám phá việc làm ngay
              </BaseButton>
            </div>
          </div>
        )}
      </div>
      <div className="hidden lg:block sticky top-6">
        <img
          alt="Logo"
          className="w-full h-full rounded-xl object-cover"
          src="/favourite_background.png"
        />
      </div>
    </section>
  );
}
