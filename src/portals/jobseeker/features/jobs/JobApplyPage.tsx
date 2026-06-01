"use client";

import {
  ArrowLeft,
  Banknote,
  CheckCircle,
  Clock,
  FileUp,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { useCvList } from "@/shared/hooks/data/useCvList";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { showAppAlert, showErrorAlert } from "@/shared/lib/ui/alert";
import { createJobApplication } from "@/shared/services/application.service";
import type { Job } from "@/shared/types/job";

interface JobApplyPageProps {
  job: Job;
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
  if (job.jobType === "full_time") return "Toàn thời gian";
  if (job.jobType === "part_time") return "Bán thời gian";
  return "Thực tập";
}

export function JobApplyPage({ job }: JobApplyPageProps) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const {
    cvList,
    isLoading: isLoadingCvList,
    handleUpload,
    isUploading,
  } = useCvList();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cvList.length) return;
    const defaultCv = cvList.find((cv) => cv.isDefault) ?? cvList[0];
    if (defaultCv && !selectedCvId) {
      setSelectedCvId(defaultCv.id);
    }
  }, [cvList, selectedCvId]);

  useEffect(() => {
    if (user?.email && !contactEmail) setContactEmail(user.email);
    if (user?.phone && !contactPhone) setContactPhone(user.phone);
    if (user?.profile?.fullName && !fullName)
      setFullName(user.profile.fullName);
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(ROUTES.JOB_SEEKER_LOGIN);
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedCvId) {
      await showErrorAlert("Bạn cần chọn một CV trước khi ứng tuyển.");
      return;
    }

    if (!fullName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      await showErrorAlert(
        "Vui lòng điền đầy đủ họ tên, email và số điện thoại.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await createJobApplication({
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        coverLetter: coverLetter.trim() || undefined,
        cvId: selectedCvId,
        fullName: fullName.trim(),
        jobId: job.id,
      });

      await showAppAlert({
        title: "Ứng tuyển thành công",
        text: "Hồ sơ của bạn đã được gửi tới nhà tuyển dụng.",
      });

      router.push(ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug ?? job.id));
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

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await handleUpload(file);
      await showAppAlert({
        title: "Tải CV thành công",
        text: "CV của bạn đã được tải lên và sẵn sàng để ứng tuyển.",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      await showErrorAlert("Không thể tải CV lên. Vui lòng thử lại.");
    }
  }

  const companyName = getCompanyLabel(job);
  const selectedCv = cvList.find((cv) => cv.id === selectedCvId);

  return (
    <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href={ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug ?? job.id)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest">
            Quay lại chi tiết công việc
          </span>
        </Link>

        <h1 className="mb-10 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Ứng tuyển vị trí
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-[28px] bg-surface-container-low p-8 shadow-sm">
              <div className="mb-6">
                <img
                  alt={job.title ?? "Công ty"}
                  className="h-20 w-20 object-cover transition-transform duration-500 group-hover:scale-105"
                  src={job.company?.logoUrl ?? "/logo.png"}
                />
                <h2 className="mt-4 text-2xl font-bold text-on-surface">
                  {job.title}
                </h2>
                <p className="mt-1 font-medium text-on-surface-variant">
                  {companyName}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <MapPin className="h-5 w-5 material-symbols-outlined text-primary" />
                  <span>{getAddress(job)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <Banknote className="h-5 w-5 material-symbols-outlined text-primary" />
                  <span className="font-semibold text-primary">
                    {formatSalary(job)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <Clock className="h-5 w-5 material-symbols-outlined text-primary" />
                  <span>{formatJobType(job)}</span>
                </div>
              </div>

              <div className="mt-8 border-t border-outline-variant/20 pt-8">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Yêu cầu chính
                </h3>
                <ul className="space-y-3">
                  {job.skills?.length ? (
                    job.skills.slice(0, 5).map((skill) => (
                      <li
                        className="flex items-start gap-2 text-sm text-on-surface-variant"
                        key={skill.id}
                      >
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-tertiary-fixed-dim" />
                        <span>{skill.name}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-on-surface-variant">
                      {typeof job.experienceYears === "number"
                        ? `${job.experienceYears} năm kinh nghiệm`
                        : "Không yêu cầu cụ thể"}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    Phân tích AI
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  Sau khi gửi hồ sơ, hệ thống AI sẽ tự động phân tích mức độ phù
                  hợp giữa CV của bạn và vị trí ứng tuyển.
                </p>
              </div>
            </div>
          </aside>

          <div className="rounded-[28px] bg-white p-8 shadow-sm lg:col-span-8">
            <form className="space-y-10" onSubmit={handleSubmit}>
              <section>
                <h3 className="mb-6 text-xl font-bold text-on-surface">
                  Chọn CV ứng tuyển
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {isLoadingCvList ? (
                    <div className="col-span-full rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant">
                      Đang tải danh sách CV...
                    </div>
                  ) : (
                    cvList.map((cv) => (
                      <label
                        className="group relative cursor-pointer"
                        key={cv.id}
                      >
                        <input
                          checked={selectedCvId === cv.id}
                          className="peer sr-only"
                          name="cv_selection"
                          type="radio"
                          value={cv.id}
                          onChange={() => setSelectedCvId(cv.id)}
                        />
                        <div className="flex h-full flex-col rounded-2xl border-2 border-transparent bg-surface-container-low p-5 transition-all duration-300 peer-checked:border-primary peer-checked:bg-white group-hover:bg-surface-container-high">
                          <div className="mb-4 flex items-center justify-between">
                            <span className="material-symbols-outlined text-primary">
                              description
                            </span>
                            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary">
                              <div className="h-2 w-2 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
                            </div>
                          </div>
                          <p className="mb-1 font-bold text-on-surface">
                            {cv.title ?? "CV không tiêu đề"}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {cv.createdAt
                              ? `Cập nhật ${new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(cv.createdAt))}`
                              : ""}
                          </p>
                        </div>
                      </label>
                    ))
                  )}

                  <label className="group relative cursor-pointer">
                    <input
                      accept=".pdf,.docx"
                      className="hidden"
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                    />
                    <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant bg-transparent p-5 text-center transition-all duration-300 hover:border-primary hover:bg-surface-container-low">
                      <FileUp className="mb-2 h-8 w-8 text-primary" />
                      <p className="text-sm font-bold text-on-surface">
                        {isUploading ? "Đang tải lên..." : "Tải CV mới lên"}
                      </p>
                      <p className="mt-1 text-[10px] text-on-surface-variant">
                        PDF, DOCX (Max 5MB)
                      </p>
                    </div>
                  </label>
                </div>

                {selectedCv ? (
                  <p className="mt-3 text-xs text-on-surface-variant">
                    Đã chọn:{" "}
                    <span className="font-semibold text-on-surface">
                      {selectedCv.title ?? "CV không tiêu đề"}
                    </span>
                  </p>
                ) : null}
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-on-surface">
                    Thư giới thiệu{" "}
                    <span className="font-normal text-on-surface-variant">
                      (Tùy chọn)
                    </span>
                  </h3>
                </div>
                <textarea
                  className="w-full resize-y rounded-2xl border border-primary/30 bg-surface-container-low p-4 text-sm text-on-surface transition placeholder:text-outline/75 focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/10"
                  placeholder="Chia sẻ thêm về kinh nghiệm và lý do bạn phù hợp với vị trí này..."
                  rows={6}
                  value={coverLetter}
                  onChange={(event) => setCoverLetter(event.target.value)}
                />
              </section>

              <section className="rounded-2xl bg-surface-container-low p-6">
                <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Thông tin liên hệ
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="ml-1 text-xs font-semibold text-on-surface-variant">
                      Họ và tên <span className="text-error">*</span>
                    </label>
                    <input
                      className="w-full rounded-2xl border border-primary/30 bg-white p-3 text-sm text-on-surface transition placeholder:text-outline/75 focus:border-primary/20 focus:ring-2 focus:ring-primary/10"
                      placeholder="Nguyễn Văn A"
                      required
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="ml-1 text-xs font-semibold text-on-surface-variant">
                      Số điện thoại <span className="text-error">*</span>
                    </label>
                    <input
                      className="w-full rounded-2xl border border-primary/30 bg-white p-3 text-sm text-on-surface transition placeholder:text-outline/75 focus:border-primary/20 focus:ring-2 focus:ring-primary/10"
                      placeholder="+84 908 123 456"
                      required
                      type="tel"
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="ml-1 text-xs font-semibold text-on-surface-variant">
                      Email <span className="text-error">*</span>
                    </label>
                    <input
                      className="w-full rounded-2xl border border-primary/30 bg-white p-3 text-sm text-on-surface transition placeholder:text-outline/75 focus:border-primary/20 focus:ring-2 focus:ring-primary/10"
                      placeholder="email@example.com"
                      required
                      type="email"
                      value={contactEmail}
                      onChange={(event) => setContactEmail(event.target.value)}
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <ShieldCheck className="h-5 w-5" />
                  <span>
                    Thông tin của bạn được bảo mật theo chính sách của chúng
                    tôi.
                  </span>
                </div>
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-10 py-4 text-base font-bold text-white shadow-lg transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  disabled={isSubmitting}
                  type="submit"
                >
                  <Send className="h-5 w-5" />
                  {isSubmitting ? "Đang gửi hồ sơ..." : "Xác nhận ứng tuyển"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
