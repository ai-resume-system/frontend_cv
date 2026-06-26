"use client";

import {
  Briefcase,
  CalendarDays,
  Info,
  Plus,
  Sparkles,
  Trash2,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent } from "react";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import { useRecruiterJobPostingForm } from "@/portals/recruiter/features/jobs/useRecruiterJobPostingForm";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import {
  EJobAction,
  EJobEducationLevel,
  EJobEducationLevelLabels,
  EJobType,
  EJobWorkArrangement,
  EJobWorkArrangementLabels,
  EJobStatus,
} from "@/shared/constants/enums/job.enum";
import { showErrorToast, showSuccessToast } from "@/shared/lib/ui/toast";
import { RichTextEditor } from "../../components/ui/RichTextEditor";
import { SkillSelectModal } from "./components/SkillSelectModal";
import { RecruiterJobPreviewModal } from "@/portals/recruiter/features/jobs/RecruiterJobPreviewModal";
import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import { cn } from "@/shared/lib/utils/cn";
import type { Job } from "@/shared/types/job";
import { Badge } from "@/shared/components/ui/Badge";
import { formatCurrency } from "@/shared/lib/helpers/formatPrice.helper";

const JOB_TYPE_OPTIONS = [
  { label: "Toàn thời gian", value: EJobType.FULL_TIME },
  { label: "Bán thời gian", value: EJobType.PART_TIME },
  { label: "Thực tập", value: EJobType.INTERNSHIP },
] as const;

const EDUCATION_LEVEL_OPTIONS = Object.entries(EJobEducationLevelLabels).map(
  ([value, label]) => ({
    label,
    value: value as EJobEducationLevel,
  }),
);

const WORK_ARRANGEMENT_OPTIONS = Object.entries(EJobWorkArrangementLabels).map(
  ([value, label]) => ({
    label,
    value: value as EJobWorkArrangement,
  }),
);

function getWeightLabel(weight: number): string {
  if (weight >= 4) return "Kỹ năng chính";
  if (weight >= 2) return "Quan trọng";
  return "Ít quan trọng";
}

export function RecruiterJobCreatePage() {
  const router = useRouter();
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useCurrentUser();

  const {
    careerCategoryId,
    careerCategoryName,
    fieldErrors,
    form,
    globalMessage,
    isSubmitting,
    isSuccess,
    removeSkill,
    skills,
    submitForm,
    updateField,
    updateSkillWeight,
    handleSelectSkills,
    useCompanyAddress,
    setUseCompanyAddress,
  } = useRecruiterJobPostingForm();

  useEffect(() => {
    if (isSuccess && globalMessage) {
      showSuccessToast(globalMessage);
      router.push(RECRUITER_ROUTES.JOBS);
    }
  }, [isSuccess, globalMessage, router]);

  useEffect(() => {
    if (!isSuccess && globalMessage) {
      showErrorToast(globalMessage);
    }
  }, [isSuccess, globalMessage]);

  // Tính toán tỷ lệ phần trăm hoàn thành tin đăng (13 trường)
  const totalFields = 13;
  const completedFields = [
    form.title,
    form.jobType,
    form.workArrangement,
    form.educationLevel,
    form.address,
    form.salaryMin,
    form.salaryMax,
    form.experienceYears,
    form.vacancyCount,
    form.expiredAt,
    form.shortDescription,
    form.description,
    skills.length > 0 ? "skills" : "",
  ].filter(
    (field) =>
      field !== undefined && field !== null && String(field).trim() !== "",
  ).length;

  const completionPercent = Math.round((completedFields / totalFields) * 100);

  // Gợi ý còn thiếu
  const missingSuggestions = [];
  if (!form.title) missingSuggestions.push("Tiêu đề công việc");
  if (!form.address) missingSuggestions.push("Địa điểm làm việc");
  if (!form.salaryMin || !form.salaryMax)
    missingSuggestions.push("Mức lương (tối thiểu/tối đa)");
  if (!form.experienceYears) missingSuggestions.push("Số năm kinh nghiệm");
  if (!form.shortDescription) missingSuggestions.push("Mô tả ngắn");
  if (!form.description) missingSuggestions.push("Mô tả chi tiết");
  if (skills.length === 0) missingSuggestions.push("Chọn kỹ năng yêu cầu");
  if (!form.expiredAt) missingSuggestions.push("Hạn chót nhận hồ sơ");

  // Dữ liệu giả lập cho Preview
  const previewJob: Job | null = user?.company
    ? {
        id: "preview-temp-id",
        title: form.title || "Tiêu đề công việc chưa cập nhật",
        shortDescription: form.shortDescription || "",
        description: form.description || "",
        address: form.address || "",
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        experienceYears: form.experienceYears
          ? Number(form.experienceYears)
          : 0,
        vacancyCount: form.vacancyCount ? Number(form.vacancyCount) : 1,
        expiredAt: form.expiredAt ? new Date(form.expiredAt) : undefined,
        jobType: form.jobType || EJobType.FULL_TIME,
        educationLevel: form.educationLevel || EJobEducationLevel.NONE,
        workArrangement: form.workArrangement || EJobWorkArrangement.ONSITE,
        status: EJobStatus.OPEN,
        skills: skills.map((s) => ({
          id: s.id,
          name: s.name,
          weight: s.weight,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        company: {
          id: user.company.id || "preview-comp-id",
          slug: user.company.slug || "",
          name: user.company.name || "Doanh nghiệp",
          logoUrl: user.company.logoUrl || null,
          bannerUrl: user.company.bannerUrl || null,
          address: user.company.address || "",
          latitude: user.company.latitude || null,
          longitude: user.company.longitude || null,
          description: user.company.description || "",
          websiteUrl: user.company.websiteUrl || null,
          employeeMin: user.company.employeeMin || null,
          employeeMax: user.company.employeeMax || null,
        },
        careerCategory: {
          id: careerCategoryId || "",
          name: careerCategoryName || null,
          slug: null,
        },
      }
    : null;

  return (
    <RecruiterWorkspaceShell
      heading="Đăng tin tuyển dụng mới"
      subheading="Tạo chiến dịch tuyển dụng và đăng bài tuyển dụng mới cho doanh nghiệp."
    >
      <form
        id="recruiter-job-create-form"
        noValidate
        onSubmit={(event) => {
          void submitForm(event);
        }}
      >
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          {/* Cột trái: Form nhập liệu */}
          <div className="space-y-6">
            {/* Nhóm 1: Thông tin vị trí tuyển dụng */}
            <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="rounded-2xl bg-primary-soft p-3 text-primary">
                  <Briefcase className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
                    NHÓM 01
                  </p>
                  <h2 className="text-lg font-bold text-on-surface">
                    Thông tin vị trí
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <BaseField
                    id="title"
                    label="Tiêu đề công việc"
                    placeholder="VD: Senior Frontend Engineer (React/Next.js)"
                    required
                    value={form.title}
                    error={fieldErrors.title}
                    onChange={(event) =>
                      updateField(
                        "title",
                        (event.target as HTMLInputElement).value,
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Lĩnh vực hoạt động
                  </label>
                  <div className="flex h-14 w-full items-center rounded-2xl border border-outline-variant/30 bg-slate-50/70 px-4 text-[15px] font-semibold text-on-surface-variant/80 select-none">
                    {careerCategoryName ||
                      "Đang tải lĩnh vực của doanh nghiệp..."}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-3">
                    Loại hình làm việc
                  </label>
                  <div className="flex flex-wrap items-center justify-start gap-6 h-14">
                    {JOB_TYPE_OPTIONS.map((option) => {
                      const active = form.jobType === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateField("jobType", option.value)}
                          className={cn(
                            "flex items-center gap-2.5 text-sm transition-colors cursor-pointer select-none py-2",
                            active
                              ? "text-primary font-bold"
                              : "text-on-surface-variant/80 font-medium hover:text-on-surface",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                              active
                                ? "border-primary"
                                : "border-outline-variant/50",
                            )}
                          >
                            {active && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>

                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tùy chọn Địa chỉ làm việc */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useCompanyAddress"
                      checked={useCompanyAddress}
                      onChange={(e) => setUseCompanyAddress(e.target.checked)}
                      className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                    />
                    <label
                      htmlFor="useCompanyAddress"
                      className="text-sm font-semibold text-on-surface select-none cursor-pointer"
                    >
                      Sử dụng địa chỉ của công ty
                    </label>
                  </div>
                  <BaseField
                    id="address"
                    label="Địa điểm làm việc"
                    placeholder="VD: Tòa nhà FUSE, số 1 Đường ABC, Quận 1, TP.HCM"
                    value={form.address}
                    disabled={useCompanyAddress}
                    inputClassName={
                      useCompanyAddress
                        ? "bg-slate-50/70 cursor-not-allowed text-on-surface-variant/80"
                        : ""
                    }
                    onChange={(event) =>
                      updateField(
                        "address",
                        (event.target as HTMLInputElement).value,
                      )
                    }
                  />
                </div>
              </div>
            </section>

            {/* Nhóm 2: Lương, kinh nghiệm và thời hạn */}
            <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="rounded-2xl bg-primary-soft p-3 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
                    NHÓM 02
                  </p>
                  <h2 className="text-lg font-bold text-on-surface">
                    Yêu cầu & Mức lương
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <BaseField
                  id="salaryMin"
                  label="Mức lương tối thiểu (VNĐ)"
                  type="text"
                  placeholder="VD: 15.000.000"
                  value={
                    form.salaryMin
                      ? formatCurrency(Number(form.salaryMin), "")
                      : ""
                  }
                  error={fieldErrors.salaryMin}
                  onChange={(event) => {
                    const rawValue = (event.target as HTMLInputElement).value
                      .replace(/\./g, "")
                      .replace(/\D/g, "");
                    updateField("salaryMin", rawValue);
                  }}
                />

                <BaseField
                  id="salaryMax"
                  label="Mức lương tối đa (VNĐ)"
                  type="text"
                  placeholder="VD: 30.000.000"
                  value={
                    form.salaryMax
                      ? formatCurrency(Number(form.salaryMax), "")
                      : ""
                  }
                  error={fieldErrors.salaryMax}
                  onChange={(event) => {
                    const rawValue = (event.target as HTMLInputElement).value
                      .replace(/\./g, "")
                      .replace(/\D/g, "");
                    updateField("salaryMax", rawValue);
                  }}
                />

                <BaseField
                  id="experienceYears"
                  label="Kinh nghiệm yêu cầu (Số năm)"
                  type="number"
                  placeholder="VD: 3"
                  value={form.experienceYears}
                  onChange={(event) =>
                    updateField(
                      "experienceYears",
                      (event.target as HTMLInputElement).value,
                    )
                  }
                />

                <BaseField
                  id="vacancyCount"
                  label="Số lượng tuyển dụng"
                  type="number"
                  placeholder="Mặc định: 1"
                  value={form.vacancyCount}
                  error={fieldErrors.vacancyCount}
                  onChange={(event) =>
                    updateField(
                      "vacancyCount",
                      (event.target as HTMLInputElement).value,
                    )
                  }
                />

                <BaseField
                  id="educationLevel"
                  as="select"
                  label="Yêu cầu trình độ học vấn"
                  value={form.educationLevel}
                  onChange={(event) =>
                    updateField(
                      "educationLevel",
                      (event.target as HTMLSelectElement)
                        .value as EJobEducationLevel,
                    )
                  }
                  options={EDUCATION_LEVEL_OPTIONS}
                />

                <BaseField
                  id="workArrangement"
                  as="select"
                  label="Hình thức làm việc"
                  value={form.workArrangement}
                  onChange={(event) =>
                    updateField(
                      "workArrangement",
                      (event.target as HTMLSelectElement)
                        .value as EJobWorkArrangement,
                    )
                  }
                  options={WORK_ARRANGEMENT_OPTIONS}
                />

                <div className="md:col-span-2">
                  <BaseField
                    id="expiredAt"
                    label="Hạn chót nhận hồ sơ"
                    required
                    type="date"
                    value={form.expiredAt || ""}
                    error={fieldErrors.expiredAt}
                    onChange={(event) =>
                      updateField(
                        "expiredAt",
                        (event.target as HTMLInputElement).value,
                      )
                    }
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-tertiary-fixed/30 p-3 text-tertiary">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary/70">
                      NHÓM 03
                    </p>
                    <h2 className="text-lg font-bold text-on-surface">
                      Kỹ năng cần có
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <BaseButton
                  type="button"
                  variant="secondary"
                  startIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setIsSkillModalOpen(true)}
                  disabled={!careerCategoryId}
                >
                  Chọn kỹ năng từ hệ thống
                </BaseButton>
              </div>

              <div className="mt-6 space-y-3">
                {skills.length ? (
                  skills.map((skill) => (
                    <article
                      key={skill.id}
                      className="rounded-2xl border border-slate-100 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md hover:border-slate-200"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-800 truncate">
                          {skill.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider select-none">
                            Độ ưu tiên:
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border select-none",
                              skill.weight >= 4
                                ? "bg-green-50 text-green-700 border-green-100"
                                : skill.weight >= 2
                                  ? "bg-blue-50 text-blue-700 border-blue-100"
                                  : "bg-slate-50 text-slate-600 border-slate-100",
                            )}
                          >
                            {getWeightLabel(skill.weight)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-3 w-full max-w-50 sm:max-w-xs">
                          <span className="text-xs font-semibold text-slate-400 min-w-7 text-right select-none">
                            {skill.weight}/5
                          </span>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={skill.weight}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              updateSkillWeight(
                                skill.id,
                                Number(event.target.value),
                              )
                            }
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-primary focus:outline-hidden"
                          />
                        </div>

                        <button
                          type="button"
                          className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                          onClick={() => removeSkill(skill.id)}
                          title="Xóa kỹ năng"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
                    Chưa có kỹ năng nào được thêm. Vui lòng bấm nút phía trên để
                    chọn kỹ năng của lĩnh vực này từ hệ thống.
                  </div>
                )}
              </div>
            </section>

            {/* Nhóm 4: Nội dung mô tả công việc */}
            <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="rounded-2xl bg-secondary-soft p-3 text-secondary">
                  <Info className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/70">
                    NHÓM 04
                  </p>
                  <h2 className="text-lg font-bold text-on-surface">
                    Nội dung & Mô tả
                  </h2>
                </div>
              </div>

              <div className="space-y-5">
                <BaseField
                  id="shortDescription"
                  as="textarea"
                  label="Mô tả ngắn"
                  placeholder="Tóm tắt vai trò, chế độ hấp dẫn nhất để thu hút ứng viên click xem chi tiết..."
                  value={form.shortDescription}
                  onChange={(event) =>
                    updateField(
                      "shortDescription",
                      (event.target as HTMLTextAreaElement).value,
                    )
                  }
                  inputClassName="min-h-24 resize-none"
                />

                <div className="md:col-span-3 space-y-2">
                  <label className="text-sm font-semibold text-on-surface">
                    Mô tả chi tiết công việc
                  </label>

                  <RichTextEditor
                    value={form.description}
                    onChange={(val) => updateField("description", val)}
                    placeholder="Mô tả chi tiết trách nhiệm công việc, quyền lợi được hưởng và các yêu cầu tuyển dụng..."
                    className="mt-2 rounded-3xl border border-outline-variant/80"
                  />
                  {fieldErrors.description && (
                    <p className="text-xs text-error mt-1">
                      {fieldErrors.description}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Cột phải: Độ hoàn thiện */}
          <aside className="space-y-6">
            <section className="sticky top-6 rounded-3xl border border-outline-variant/80 bg-white p-6 shadow-md">
              <h2 className="text-base font-bold text-on-surface mb-4">
                Độ hoàn thiện tin đăng
              </h2>

              {/* Vòng tròn Score SVG */}
              <div className="flex flex-col items-center justify-center mb-4">
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
                      // Thay màu xanh lá (mã hex tương tự ảnh 2)
                      className="text-[#5ce59f] transition-all duration-500 ease-out"
                      strokeWidth="10"
                      strokeDasharray={314.16}
                      strokeDashoffset={
                        314.16 - (314.16 * completionPercent) / 100
                      }
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  {/* Text ở giữa vòng tròn */}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-primary tracking-tight leading-none">
                      {completionPercent}
                    </span>
                    <span className="text-sm font-bold text-slate-400 mt-1">
                      / 100
                    </span>
                  </div>
                </div>
              </div>

              {missingSuggestions.length > 0 ? (
                <div className="mt-5 pt-4">
                  <p className="text-sm font-bold text-on-surface mb-2">
                    💡 Gợi ý bổ sung:
                  </p>
                  <ul className="space-y-1.5 ml-2">
                    {missingSuggestions.slice(0, 3).map((item, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-on-surface-variant flex items-center gap-1.5"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-5 pt-4 border-t border-outline-variant/20 text-center">
                  <p className="text-sm font-bold text-green-600">
                    🎉 Tin đăng đã đạt 100%!
                  </p>
                </div>
              )}

              <p className="text-xs text-on-surface-variant pt-3 italic text-center leading-relaxed">
                (Tin tuyển dụng đầy đủ thông tin giúp tăng 80% tỷ lệ phản hồi từ
                ứng viên)
              </p>
            </section>
          </aside>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-30 -mx-6 -mb-6 mt-8 border-t border-outline-variant/30 bg-white/90 backdrop-blur-md px-6 py-4 shadow-lg flex items-center justify-end gap-3 rounded-b-3xl shrink-0">
          <BaseButton
            type="button"
            variant="secondary"
            startIcon={<Eye className="h-4 w-4" />}
            onClick={() => setPreviewOpen(true)}
          >
            Xem trước
          </BaseButton>
          <BaseButton
            type="button"
            variant="secondary"
            loading={isSubmitting}
            onClick={(e) => {
              void submitForm(e as any, EJobAction.DRAFT);
            }}
          >
            Lưu bản nháp
          </BaseButton>
          <BaseButton
            type="button"
            loading={isSubmitting}
            onClick={(e) => {
              void submitForm(e as any, EJobAction.SUBMIT);
            }}
          >
            Đăng tin
          </BaseButton>
        </div>
      </form>

      {/* Preview Modal */}
      {previewOpen && previewJob ? (
        <RecruiterJobPreviewModal
          job={previewJob}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}

      <SkillSelectModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        careerCategoryId={careerCategoryId}
        selectedSkillIds={skills.map((s) => s.id)}
        onSelectSkills={handleSelectSkills}
      />
    </RecruiterWorkspaceShell>
  );
}
