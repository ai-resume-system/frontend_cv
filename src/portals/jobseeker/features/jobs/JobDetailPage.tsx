"use client";

import { Flag, MapPin, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCvList } from "@/shared/hooks/data/useCvList";
import { BaseField } from "@/shared/components/ui/BaseField";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useFavoriteJobs } from "@/shared/hooks/data/useFavoriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { showAppAlert, showErrorAlert } from "@/shared/lib/ui/alert";
import { createJobApplication } from "@/shared/services/application.service";
import type { Job } from "@/shared/types/job";

interface JobDetailPageProps {
  job: Job;
  relatedJobs: Job[];
}

interface ApplicationFormState {
  contactEmail: string;
  contactPhone: string;
  coverLetter: string;
  cvId: string;
  fullName: string;
}

function getCompanyLabel(job: Job): string {
  return job.company?.name ?? "Doanh nghiệp";
}

function getAddress(job: Job): string {
  return job.address ?? job.company?.address ?? "Đang cập nhật";
}

function formatSalary(job: Job): string {
  if (typeof job.salaryMin === "number" && typeof job.salaryMax === "number") {
    return `${job.salaryMin.toLocaleString("vi-VN")} - ${job.salaryMax.toLocaleString("vi-VN")} VND`;
  }

  if (typeof job.salaryMin === "number") {
    return `Từ ${job.salaryMin.toLocaleString("vi-VN")} VND`;
  }

  if (typeof job.salaryMax === "number") {
    return `Đến ${job.salaryMax.toLocaleString("vi-VN")} VND`;
  }

  return "Thỏa thuận";
}

function formatJobType(job: Job): string {
  if (job.jobType === "full_time") {
    return "Toàn thời gian";
  }

  if (job.jobType === "part_time") {
    return "Bán thời gian";
  }

  return "Thực tập";
}

function formatDate(value?: Date): string {
  if (!value) {
    return "Đang cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function splitDescription(value?: string): string[] {
  if (!value) {
    return ["Nhà tuyển dụng chưa cập nhật mô tả chi tiết cho vị trí này."];
  }

  return value
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function buildJobHref(jobId: string): string {
  return ROUTES.JOB_SEEKER_JOB_DETAIL(jobId);
}

export function JobDetailPage({ job, relatedJobs }: JobDetailPageProps) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { cvList, isLoading: isLoadingCvList } = useCvList();
  const { isFavorite, isFavoritePending, toggleFavorite } = useFavoriteJobs();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ApplicationFormState>({
    contactEmail: user?.email ?? "",
    contactPhone: user?.phone ?? "",
    coverLetter: "",
    cvId: cvList.find((cv) => cv.isDefault)?.id ?? cvList[0]?.id ?? "",
    fullName: user?.profile?.fullName ?? "",
  });

  const saved = isFavorite(job.id);
  const descriptionBlocks = splitDescription(job.description);

  useEffect(() => {
    setForm((currentState) => ({
      ...currentState,
      contactEmail: currentState.contactEmail || user?.email || "",
      contactPhone: currentState.contactPhone || user?.phone || "",
      cvId:
        currentState.cvId ||
        cvList.find((cv) => cv.isDefault)?.id ||
        cvList[0]?.id ||
        "",
      fullName: currentState.fullName || user?.profile?.fullName || "",
    }));
  }, [cvList, user]);

  function updateField<Key extends keyof ApplicationFormState>(
    key: Key,
    value: ApplicationFormState[Key],
  ) {
    setForm((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  }

  async function handleApply() {
    if (!isLoggedIn) {
      router.push(ROUTES.JOB_SEEKER_LOGIN);
      return;
    }

    if (!form.cvId) {
      await showErrorAlert("Bạn cần chọn một CV trước khi ứng tuyển.");
      return;
    }

    if (
      !form.fullName.trim() ||
      !form.contactEmail.trim() ||
      !form.contactPhone.trim()
    ) {
      await showErrorAlert(
        "Vui lòng điền đầy đủ họ tên, email và số điện thoại.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createJobApplication({
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        coverLetter: form.coverLetter.trim() || undefined,
        cvId: form.cvId,
        fullName: form.fullName.trim(),
        jobId: job.id,
      });

      await showAppAlert({
        title: "Ứng tuyển thành công",
        text: "Hồ sơ của bạn đã được gửi tới nhà tuyển dụng.",
      });
    } catch (error) {
      await showErrorAlert(
        error instanceof Error
          ? error.message
          : "Không thể ứng tuyển công việc này.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-[28px] border border-white/80 bg-white/80 p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-tertiary-fixed/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  Enterprise Listing
                </span>
                <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                  {formatJobType(job)}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                {job.title}
              </h1>

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-on-surface-variant">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {getAddress(job)}
                </span>
                <span className="rounded-full bg-surface-container-low px-4 py-2">
                  {typeof job.experienceYears === "number"
                    ? `${job.experienceYears} năm kinh nghiệm`
                    : "Kinh nghiệm đang cập nhật"}
                </span>
                <span className="rounded-full bg-surface-container-low px-4 py-2">
                  Hạn nộp: {formatDate(job.expiredAt)}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 border-t border-surface-container-high pt-8">
                <button
                  type="button"
                  onClick={() => {
                    void handleApply();
                  }}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {isSubmitting ? "Đang gửi hồ sơ..." : "Ứng tuyển ngay"}
                  </span>
                  <Send className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={isFavoritePending(job.id)}
                  onClick={() => {
                    void toggleFavorite(job.id, job);
                  }}
                  className="rounded-2xl border border-surface-container-high bg-surface-container-low px-5 py-4 text-sm font-semibold text-primary transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saved ? "Đã lưu công việc" : "Lưu tin"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void showAppAlert({
                      icon: "info",
                      title: "Chưa có API báo cáo",
                      text: "Backend hiện chưa cung cấp endpoint báo cáo tin tuyển dụng, nên nút này đang hiển thị ghi chú trong view.",
                    });
                  }}
                  className="ml-auto inline-flex items-center gap-2 rounded-2xl px-4 py-4 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low"
                >
                  <Flag className="h-4 w-4" />
                  <span>Báo cáo</span>
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/80 bg-white/80 p-8 shadow-sm">
              <h2 className="border-l-4 border-tertiary-fixed pl-4 text-2xl font-bold uppercase tracking-tight text-primary">
                Mô tả công việc
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-on-surface-variant">
                {descriptionBlocks.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/80 bg-white/80 p-8 shadow-sm">
              <h2 className="border-l-4 border-tertiary-fixed pl-4 text-2xl font-bold uppercase tracking-tight text-primary">
                Thông tin vị trí
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-surface-container-low p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                    Công ty
                  </p>
                  <p className="mt-2 text-lg font-semibold text-on-surface">
                    {getCompanyLabel(job)}
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                    Mức lương
                  </p>
                  <p className="mt-2 text-lg font-semibold text-on-surface">
                    {formatSalary(job)}
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                    Lĩnh vực
                  </p>
                  <p className="mt-2 text-lg font-semibold text-on-surface">
                    {job.careerCategory?.name ?? "Đang cập nhật"}
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                    Cập nhật
                  </p>
                  <p className="mt-2 text-lg font-semibold text-on-surface">
                    {formatDate(job.updatedAt)}
                  </p>
                </div>
              </div>

              {job.skills?.length ? (
                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                    Kỹ năng nổi bật
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary"
                        key={skill.id}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
                  {getCompanyLabel(job).slice(0, 1)}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    {getCompanyLabel(job)}
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    {job.careerCategory?.name ??
                      "Doanh nghiệp đang cập nhật lĩnh vực"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-on-surface-variant">
                <p>{getAddress(job)}</p>
                <p>
                  Trang công ty chi tiết chưa có route riêng trong repo, nên
                  khối này đang hiển thị dữ liệu công ty lấy trực tiếp từ API
                  job detail.
                </p>
              </div>

              <Link
                href={ROUTES.JOBS}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                Quay lại danh sách việc làm
              </Link>
            </section>

            <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-on-surface">
                  Ứng tuyển công việc
                </h2>
              </div>

              {!isLoggedIn ? (
                <div className="mt-5 rounded-2xl border border-dashed border-surface-container-high bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
                  Bạn cần đăng nhập để gửi hồ sơ ứng tuyển.
                </div>
              ) : null}

              {isLoggedIn && isLoadingCvList ? (
                <div className="mt-5 rounded-2xl border border-dashed border-surface-container-high bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
                  Đang tải danh sách CV để chuẩn bị ứng tuyển...
                </div>
              ) : null}

              {isLoggedIn && !isLoadingCvList && !cvList.length ? (
                <div className="mt-5 rounded-2xl border border-dashed border-surface-container-high bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
                  Bạn chưa có CV nào trong hệ thống. Hãy tải CV lên trước tại
                  trang
                  <Link
                    href={ROUTES.JOB_SEEKER_CV}
                    className="ml-1 font-semibold text-primary"
                  >
                    quản lý CV
                  </Link>
                  .
                </div>
              ) : null}

              {isLoggedIn && !isLoadingCvList && cvList.length ? (
                <div className="mt-5 space-y-4">
                  <BaseField
                    id="apply-full-name"
                    label="Họ và tên"
                    value={form.fullName}
                    onChange={(event) =>
                      updateField("fullName", event.target.value)
                    }
                  />
                  <BaseField
                    id="apply-email"
                    label="Email"
                    value={form.contactEmail}
                    onChange={(event) =>
                      updateField("contactEmail", event.target.value)
                    }
                  />
                  <BaseField
                    id="apply-phone"
                    label="Số điện thoại"
                    value={form.contactPhone}
                    onChange={(event) =>
                      updateField("contactPhone", event.target.value)
                    }
                  />
                  <BaseField
                    id="apply-cv"
                    as="select"
                    label="Chọn CV"
                    value={form.cvId}
                    onChange={(event) =>
                      updateField("cvId", event.target.value)
                    }
                    options={cvList.map((cv) => ({
                      label:
                        cv.title ?? `CV ${formatDate(new Date(cv.createdAt))}`,
                      value: cv.id,
                    }))}
                  />
                  <BaseField
                    id="apply-cover-letter"
                    as="textarea"
                    label="Giới thiệu ngắn"
                    placeholder="Chia sẻ ngắn gọn lý do bạn phù hợp với vị trí này."
                    value={form.coverLetter}
                    onChange={(event) =>
                      updateField("coverLetter", event.target.value)
                    }
                    inputClassName="min-h-32 resize-y"
                  />
                </div>
              ) : null}
            </section>

            <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                    Gợi ý dành cho bạn
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-primary">
                    Việc làm liên quan
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {relatedJobs.length ? (
                  relatedJobs.map((relatedJob) => (
                    <Link
                      className="block rounded-2xl border border-surface-container-high bg-surface-container-low p-4 transition hover:border-primary/20 hover:bg-white"
                      href={buildJobHref(relatedJob.id)}
                      key={relatedJob.id}
                    >
                      <h3 className="text-base font-semibold text-on-surface">
                        {relatedJob.title}
                      </h3>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {getCompanyLabel(relatedJob)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                        <span className="rounded-full bg-white px-3 py-1">
                          {getAddress(relatedJob)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          {formatSalary(relatedJob)}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-surface-container-high bg-surface-container-low p-4 text-sm text-on-surface-variant">
                    Chưa có thêm công việc liên quan từ API hiện tại.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
