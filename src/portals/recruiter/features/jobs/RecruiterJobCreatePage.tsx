"use client";

import { Briefcase, CalendarDays, Info, Plus, Sparkles } from "lucide-react";
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
} from "@/shared/constants/enums/job.enum";
import { showErrorToast, showSuccessToast } from "@/shared/lib/ui/toast";
import { RichTextEditor } from "../../components/ui/RichTextEditor";
import { SkillSelectModal } from "./components/SkillSelectModal";

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

  return (
    <RecruiterWorkspaceShell
      heading="Đăng tin tuyển dụng"
      subheading="Tạo chiến dịch tuyển dụng và đăng bài tuyển dụng mới cho doanh nghiệp."
    >
      <div className="grid gap-6">
        <form
          id="recruiter-job-create-form"
          onSubmit={(event) => {
            void submitForm(event);
          }}
          className="space-y-6"
        >
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

              {/* Ngành nghề cố định theo công ty */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Lĩnh vực
                </label>
                <div className="flex h-14 w-full items-center rounded-2xl border border-outline-variant/30 bg-slate-50/70 px-4 text-[15px] font-semibold text-on-surface-variant/80 select-none">
                  {careerCategoryName ||
                    "Đang tải lĩnh vực của doanh nghiệp..."}
                </div>
              </div>

              <BaseField
                id="jobType"
                as="select"
                label="Hình thức làm việc"
                value={form.jobType}
                onChange={(event) =>
                  updateField(
                    "jobType",
                    (event.target as HTMLSelectElement).value as EJobType,
                  )
                }
                options={JOB_TYPE_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
              />

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
                type="number"
                placeholder="VD: 15000000"
                value={form.salaryMin}
                error={fieldErrors.salaryMin}
                onChange={(event) =>
                  updateField(
                    "salaryMin",
                    (event.target as HTMLInputElement).value,
                  )
                }
              />

              <BaseField
                id="salaryMax"
                label="Mức lương tối đa (VNĐ)"
                type="number"
                placeholder="VD: 30000000"
                value={form.salaryMax}
                error={fieldErrors.salaryMax}
                onChange={(event) =>
                  updateField(
                    "salaryMax",
                    (event.target as HTMLInputElement).value,
                  )
                }
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
                label="Tính chất công việc (Nơi làm việc)"
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
                  type="date"
                  required
                  value={form.expiredAt}
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

          {/* Nhóm 3: Ma trận kỹ năng AI */}
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
                    Ma trận kỹ năng AI
                  </h2>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                Được AI tự động hóa
              </span>
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

            <div className="mt-6 space-y-4">
              {skills.length ? (
                skills.map((skill) => (
                  <article
                    key={skill.id}
                    className="rounded-3xl border border-surface-container-high bg-surface-container-lowest p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          KỸ NĂNG YÊU CẦU
                        </span>
                        {skill.weight >= 4 && (
                          <span className="rounded-full bg-tertiary-soft px-2 py-0.5 text-[10px] font-bold text-tertiary border border-tertiary/20">
                            Kỹ năng chính
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 text-base font-bold text-on-surface truncate">
                        {skill.name}
                      </h3>
                    </div>

                    <div className="flex w-full flex-col gap-2 md:max-w-xs shrink-0">
                      <div className="flex items-center justify-between text-xs text-on-surface-variant">
                        <span>Trọng số đối chiếu AI</span>
                        <span className="font-bold text-primary">
                          {skill.weight}/5 ({getWeightLabel(skill.weight)})
                        </span>
                      </div>
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
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-primary"
                      />
                    </div>

                    <button
                      type="button"
                      className="text-xs font-bold text-error hover:underline text-right shrink-0"
                      onClick={() => removeSkill(skill.id)}
                    >
                      Xóa bỏ
                    </button>
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

          {/* Cụm nút chân trang */}
          <div className="flex justify-end gap-3">
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
              Đăng tin tuyển dụng
            </BaseButton>
          </div>
        </form>
      </div>

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
