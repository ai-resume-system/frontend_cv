"use client";

import type { ChangeEvent, KeyboardEvent } from "react";
import {
  CalendarDays,
  Info,
  Plus,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/layouts/RecruiterWorkspaceShell";
import { useRecruiterJobPostingForm } from "@/portals/recruiter/features/job-posting/useRecruiterJobPostingForm";
import { EJobType } from "@/shared/constants/enums/job.enum";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";

const JOB_TYPE_OPTIONS = [
  { label: "Toàn thời gian", value: "full_time" },
  { label: "Bán thời gian", value: "part_time" },
  { label: "Thực tập", value: "internship" },
] as const;

export function RecruiterJobCreatePage() {
  const {
    addSkill,
    categories,
    categoriesError,
    categoriesLoading,
    fieldErrors,
    form,
    globalMessage,
    isSubmitting,
    isSuccess,
    removeSkill,
    skillInput,
    skills,
    submitForm,
    setSkillInput,
    updateField,
    updateSkillWeight,
  } = useRecruiterJobPostingForm();

  return (
    <RecruiterWorkspaceShell
      heading="Đăng tin tuyển dụng"
      subheading="Tạo tin tuyển dụng mới cho doanh nghiệp."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <form
          id="recruiter-job-create-form"
          onSubmit={(event) => {
            void submitForm(event);
          }}
          className="space-y-6"
        >
          {globalMessage ? (
            <div
              className={
                isSuccess
                  ? "rounded-3xl border border-tertiary-fixed/35 bg-tertiary-fixed/15 px-5 py-4 text-sm text-tertiary"
                  : "rounded-3xl border border-error/20 bg-error-container px-5 py-4 text-sm text-on-error-container"
              }
            >
              {globalMessage}
            </div>
          ) : null}

          <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-primary-soft p-3 text-primary">
                <Info className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                  Bước 01
                </p>
                <h2 className="text-xl font-bold text-on-surface">
                  Thông tin cơ bản
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <BaseField
                  id="title"
                  label="Tiêu đề công việc"
                  placeholder="VD: Senior Frontend Engineer"
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

              <BaseField
                id="careerCategoryId"
                as="select"
                label="Lĩnh vực"
                required
                value={form.careerCategoryId}
                error={fieldErrors.careerCategoryId}
                onChange={(event) =>
                  updateField(
                    "careerCategoryId",
                    (event.target as HTMLSelectElement).value,
                  )
                }
                options={
                  categories.length
                    ? categories.map((category) => ({
                        label: category.name,
                        value: category.id,
                      }))
                    : [
                        {
                          label: categoriesLoading
                            ? "Đang tải lĩnh vực..."
                            : "Chưa có dữ liệu lĩnh vực",
                          value: "",
                        },
                      ]
                }
                hint={
                  categoriesError
                    ? `Không tải được danh mục nghề nghiệp: ${categoriesError}`
                    : "Danh sách đang lấy từ API career-categories."
                }
              />

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

              <BaseField
                id="address"
                label="Địa điểm làm việc"
                placeholder="Hà Nội, TP.HCM hoặc Remote"
                value={form.address}
                onChange={(event) =>
                  updateField(
                    "address",
                    (event.target as HTMLInputElement).value,
                  )
                }
              />

              <BaseField
                id="experienceYears"
                label="Số năm kinh nghiệm"
                placeholder="Ví dụ: 3"
                value={form.experienceYears}
                onChange={(event) =>
                  updateField(
                    "experienceYears",
                    (event.target as HTMLInputElement).value,
                  )
                }
              />

              <div className="md:col-span-2">
                <BaseField
                  id="shortDescription"
                  as="textarea"
                  label="Mô tả ngắn"
                  placeholder="Tóm tắt vai trò, mục tiêu chính và điểm hấp dẫn của vị trí."
                  value={form.shortDescription}
                  onChange={(event) =>
                    updateField(
                      "shortDescription",
                      (event.target as HTMLTextAreaElement).value,
                    )
                  }
                  inputClassName="min-h-24 resize-none"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-secondary-soft p-3 text-secondary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/70">
                    Bước 02
                  </p>
                  <h2 className="text-xl font-bold text-on-surface">
                    Mô tả công việc
                  </h2>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <BaseField
                id="description"
                as="textarea"
                label="Mô tả chi tiết"
                placeholder="Mô tả trách nhiệm, yêu cầu, quy trình làm việc và kỳ vọng cho vị trí này."
                required
                value={form.description}
                error={fieldErrors.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    (event.target as HTMLTextAreaElement).value,
                  )
                }
                inputClassName="min-h-56 resize-y"
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-tertiary-fixed/30 p-3 text-tertiary">
                  <Plus className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary/70">
                    Bước 03
                  </p>
                  <h2 className="text-xl font-bold text-on-surface">
                    Ma trận kỹ năng AI
                  </h2>
                </div>
              </div>
              <span className="rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-semibold text-on-surface">
                Chưa có API skill catalog
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <BaseField
                id="skill-draft"
                label="Kỹ năng cần theo dõi"
                placeholder="VD: Next.js, Kubernetes, SEO, Data Analysis"
                value={skillInput}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setSkillInput(event.target.value)
                }
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSkill();
                  }
                }}
                wrapperClassName="flex-1"
              />
              <div className="sm:pt-8">
                <BaseButton
                  type="button"
                  variant="secondary"
                  onClick={addSkill}
                  className="w-full sm:w-auto"
                >
                  Thêm kỹ năng
                </BaseButton>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {skills.length ? (
                skills.map((skill) => (
                  <article
                    key={skill.id}
                    className="rounded-3xl border border-surface-container-high bg-surface-container-lowest p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                          Kỹ năng
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-on-surface">
                          {skill.name}
                        </h3>
                      </div>

                      <div className="flex w-full flex-col gap-3 lg:max-w-md">
                        <div className="flex items-center justify-between text-sm text-on-surface-variant">
                          <span>Trọng số nội bộ</span>
                          <span className="font-semibold text-primary">
                            {skill.weight}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={skill.weight}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            updateSkillWeight(
                              skill.id,
                              Number(event.target.value),
                            )
                          }
                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary-soft accent-primary"
                        />
                      </div>

                      <BaseButton
                        type="button"
                        variant="ghost"
                        className="justify-center text-error hover:bg-error/5"
                        onClick={() => removeSkill(skill.id)}
                      >
                        Xóa
                      </BaseButton>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-sm text-on-surface-variant">
                  Chưa có kỹ năng nội bộ nào được thêm.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-primary-soft p-3 text-primary">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                  Bước 04
                </p>
                <h2 className="text-xl font-bold text-on-surface">
                  Lương và thời hạn
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <BaseField
                id="salaryMin"
                label="Mức lương tối thiểu"
                type="number"
                placeholder="15000000"
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
                label="Mức lương tối đa"
                type="number"
                placeholder="30000000"
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
                id="expiredAt"
                label="Hạn chót ứng tuyển"
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
          </section>

          <div className="flex justify-end">
            <BaseButton
              type="submit"
              form="recruiter-job-create-form"
              loading={isSubmitting}
            >
              Đăng tin ngay
            </BaseButton>
          </div>
        </form>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-primary-soft p-3 text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-on-surface">
                  Ghi chú API
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Trạng thái hiện tại của backend.
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-sm leading-6 text-on-surface-variant">
              <li>
                Skill AI matrix: chưa có API lookup `skillId`, nên chỉ lưu nội
                bộ trong view.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </RecruiterWorkspaceShell>
  );
}
