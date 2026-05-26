"use client";

import { FileHeart, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Footer } from "@/shared/components/layouts/Footer";
import { Header } from "@/shared/components/layouts/Header";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { ROUTES } from "@/shared/constants/constants/routes";
import { JobCardLink } from "@/shared/features/home/JobCard";
import { useFavoriteJobs } from "@/shared/hooks/data/useFavoriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuth";
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

function buildJobHref(jobId: string): string {
  return `${ROUTES.JOBS}?jobId=${jobId}`;
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
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="bg-background px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 bg-red-500">
            <div>
              <h1 className="font-display text-4xl font-bold">
                Danh sách việc làm đã lưu
              </h1>
              <p className="mt-3 text-muted-foreground">
                Danh sách các bạn đã lưu để xem lại và ứng tuyển sau.
              </p>
            </div>
            <p>Hiện lưu</p> việc làm
          </div>

          {isLoading && !isLoaded ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : favoriteJobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {favoriteJobs.map((job) => (
                <JobCardLink
                  company={getCompanyName(job)}
                  href={buildJobHref(job.id)}
                  jobData={job}
                  jobId={job.id}
                  key={job.id}
                  location={getLocation(job)}
                  salary={formatSalary(job)}
                  title={job.title}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FileHeart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-foreground">
                Bạn chưa lưu công việc nào
              </h2>
              <div className="mt-6">
                <BaseButton href={ROUTES.JOBS}>
                  Khám phá việc làm ngày
                </BaseButton>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
