"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import {
  CalendarDays,
  Eye,
  Info,
  Briefcase,
  Plus,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import { showSuccessToast, showErrorToast } from "@/shared/lib/ui/toast";
import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import { RecruiterJobPreviewModal } from "@/portals/recruiter/features/jobs/RecruiterJobPreviewModal";
import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import {
  EJobType,
  EJobEducationLevel,
  EJobEducationLevelLabels,
  EJobWorkArrangement,
  EJobWorkArrangementLabels,
} from "@/shared/constants/enums/job.enum";
import {
  fetchRecruiterJobDetail,
  updateRecruiterJob,
} from "@/shared/services/recruiter-job.service";
import type { Job, UpdateJobPayload } from "@/shared/types/job";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";
import { RichTextEditor } from "../../components/ui/RichTextEditor";
import { SkillSelectModal } from "./components/SkillSelectModal";

const JOB_TYPE_OPTIONS = [
  { label: "Toàn thời gian", value: "full_time" },
  { label: "Bán thời gian", value: "part_time" },
  { label: "Thực tập", value: "internship" },
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

interface RecruiterJobEditPageProps {
  jobSlug: string;
}

interface SkillDraft {
  id: string;
  name: string;
  weight: number;
}

function getWeightLabel(weight: number): string {
  if (weight >= 4) return "Kỹ năng chính";
  if (weight >= 2) return "Quan trọng";
  return "Ít quan trọng";
}

export function RecruiterJobEditPage({ jobSlug }: RecruiterJobEditPageProps) {
  const router = useRouter();
  const { user } = useCurrentUser();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [useCompanyAddress, setUseCompanyAddress] = useState(false);

  const [form, setForm] = useState({
    title: "",
    careerCategoryId: "",
    jobType: EJobType.FULL_TIME,
    address: "",
    experienceYears: "",
    shortDescription: "",
    description: "",
    salaryMin: "",
    salaryMax: "",
    expiredAt: "",
    vacancyCount: "1",
    educationLevel: EJobEducationLevel.NONE,
    workArrangement: EJobWorkArrangement.ONSITE,
  });

  const [skills, setSkills] = useState<SkillDraft[]>([]);

  // Tải chi tiết job và điền vào form
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchRecruiterJobDetail(jobSlug);
        setJob(data);
        setForm({
          title: data.title,
          careerCategoryId: data.careerCategory?.id ?? "",
          jobType: data.jobType,
          address: data.address ?? "",
          experienceYears:
            data.experienceYears != null ? String(data.experienceYears) : "",
          shortDescription: data.shortDescription ?? "",
          description: data.description ?? "",
          salaryMin: data.salaryMin != null ? String(data.salaryMin) : "",
          salaryMax: data.salaryMax != null ? String(data.salaryMax) : "",
          expiredAt: data.expiredAt
            ? new Date(data.expiredAt).toISOString().split("T")[0]
            : "",
          vacancyCount:
            data.vacancyCount != null ? String(data.vacancyCount) : "1",
          educationLevel: data.educationLevel ?? EJobEducationLevel.NONE,
          workArrangement: data.workArrangement ?? EJobWorkArrangement.ONSITE,
        });

        // Load kỹ năng hiện có
        if (data.skills) {
          setSkills(
            data.skills.map((s) => ({
              id: s.id,
              name: s.name,
              weight: s.weight ?? 1,
            })),
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể tải thông tin job.",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [jobSlug]);

  // Kiểm tra so sánh địa chỉ hiện tại của job với địa chỉ công ty để bật checkbox
  useEffect(() => {
    if (job && user?.company?.address && job.address === user.company.address) {
      setUseCompanyAddress(true);
    }
  }, [job, user]);

  // Xử lý Checkbox sử dụng địa chỉ công ty
  useEffect(() => {
    if (useCompanyAddress && user?.company?.address) {
      setForm((prev) => ({
        ...prev,
        address: user.company?.address ?? "",
      }));
    }
  }, [useCompanyAddress, user]);

  useEffect(() => {
    if (success) {
      showSuccessToast("Cập nhật tin tuyển dụng thành công.");
      router.push(RECRUITER_ROUTES.JOBS);
    }
  }, [success, router]);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  // Tích hợp chọn kỹ năng từ Modal
  function handleSelectSkills(selectedSkills: { id: string; name: string }[]) {
    setSkills((currentSkills) => {
      return selectedSkills.map((s) => {
        const existing = currentSkills.find((item) => item.id === s.id);
        return {
          id: s.id,
          name: s.name,
          weight: existing ? existing.weight : 1, // Trọng số mặc định là 1
        };
      });
    });
  }

  function removeSkill(id: string) {
    setSkills((currentSkills) =>
      currentSkills.filter((skill) => skill.id !== id),
    );
  }

  function updateSkillWeight(id: string, weight: number) {
    setSkills((currentSkills) =>
      currentSkills.map((skill) =>
        skill.id === id
          ? {
              ...skill,
              weight,
            }
          : skill,
      ),
    );
  }

  async function handleSave() {
    if (!job) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const payload: UpdateJobPayload = {};
      if (form.title.trim()) payload.title = form.title.trim();
      if (form.shortDescription.trim())
        payload.shortDescription = form.shortDescription.trim();
      if (form.description.trim())
        payload.description = form.description.trim();
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.careerCategoryId)
        payload.careerCategoryId = form.careerCategoryId;
      if (form.expiredAt) payload.expiredAt = form.expiredAt;
      payload.jobType = form.jobType;
      if (form.experienceYears)
        payload.experienceYears = Number(form.experienceYears);
      if (form.salaryMin) payload.salaryMin = Number(form.salaryMin);
      if (form.salaryMax) payload.salaryMax = Number(form.salaryMax);
      payload.vacancyCount = form.vacancyCount ? Number(form.vacancyCount) : 1;
      payload.educationLevel = form.educationLevel;
      payload.workArrangement = form.workArrangement;
      // Gửi kèm mảng kỹ năng đã chỉnh sửa
      payload.skills = skills.map((s) => ({ skillId: s.id, weight: s.weight }));

      await updateRecruiterJob(job.id, payload);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  }

  const previewJob: Job | null = job
    ? {
        ...job,
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        experienceYears: form.experienceYears
          ? Number(form.experienceYears)
          : undefined,
        expiredAt: form.expiredAt ? new Date(form.expiredAt) : undefined,
        vacancyCount: form.vacancyCount ? Number(form.vacancyCount) : 1,
        // Dùng skills hiện tại của state
        skills: skills.map((s) => ({
          id: s.id,
          name: s.name,
          weight: s.weight,
        })),
      }
    : null;

  if (loading) {
    return (
      <RecruiterWorkspaceShell heading="Chỉnh sửa tin tuyển dụng" subheading="">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-on-surface-variant">Đang tải...</p>
        </div>
      </RecruiterWorkspaceShell>
    );
  }

  if (error && !job) {
    return (
      <RecruiterWorkspaceShell heading="Chỉnh sửa tin tuyển dụng" subheading="">
        <div className="rounded-3xl border border-error/15 bg-error-container px-5 py-4 text-sm text-on-error-container">
          {error}
        </div>
      </RecruiterWorkspaceShell>
    );
  }

  return (
    <RecruiterWorkspaceShell
      heading="Chỉnh sửa tin tuyển dụng"
      subheading={`Chỉnh sửa thông tin chi tiết cho tin tuyển dụng: ${job?.title ?? ""}`}
      action={
        <div className="flex items-center gap-2">
          <BaseButton
            variant="secondary"
            startIcon={<Eye className="h-4 w-4" />}
            onClick={() => setPreviewOpen(true)}
          >
            Xem trước
          </BaseButton>
          <BaseButton loading={saving} onClick={handleSave}>
            Lưu thay đổi
          </BaseButton>
        </div>
      }
    >
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
                placeholder="VD: Senior Frontend Engineer"
                required
                value={form.title}
                onChange={(event) =>
                  updateField("title", (event.target as HTMLInputElement).value)
                }
              />
            </div>

            {/* Ngành nghề cố định theo công ty */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Lĩnh vực
              </label>
              <div className="flex h-14 w-full items-center rounded-2xl border border-outline-variant/30 bg-slate-50/70 px-4 text-[15px] font-semibold text-on-surface-variant/80 select-none">
                {user?.company?.careerCategory?.name ??
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
              placeholder="VD: 1"
              value={form.vacancyCount}
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
                value={form.expiredAt}
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
              disabled={!form.careerCategoryId}
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
                        updateSkillWeight(skill.id, Number(event.target.value))
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
              placeholder="Tóm tắt vai trò, mục tiêu chính và điểm hấp dẫn..."
              value={form.shortDescription}
              onChange={(event) =>
                updateField(
                  "shortDescription",
                  (event.target as HTMLTextAreaElement).value,
                )
              }
              inputClassName="min-h-24 resize-none"
            />

            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface">
                Mô tả chi tiết công việc
              </label>
              <RichTextEditor
                value={form.description}
                onChange={(val) => updateField("description", val)}
                placeholder="Mô tả trách nhiệm công việc, quyền lợi được hưởng..."
              />
            </div>
          </div>
        </section>
      </div>

      {previewOpen && previewJob ? (
        <RecruiterJobPreviewModal
          job={previewJob}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}

      {/* Modal Chọn kỹ năng dạng Tree */}
      <SkillSelectModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        careerCategoryId={form.careerCategoryId}
        selectedSkillIds={skills.map((s) => s.id)}
        onSelectSkills={handleSelectSkills}
      />
    </RecruiterWorkspaceShell>
  );
}
