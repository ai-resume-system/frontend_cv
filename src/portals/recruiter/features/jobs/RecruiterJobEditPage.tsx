"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import {
  CalendarDays,
  Eye,
  Info,
  Briefcase,
  Plus,
  Sparkles,
  Trash2,
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
  EJobAction,
  EJobStatus,
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
import { cn } from "@/shared/lib/utils/cn";
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

interface RecruiterJobEditPageProps {
  jobSlug: string;
}

interface SkillDraft {
  id: string;
  name: string;
  weight: number;
}

interface JobEditFormState {
  title: string;
  careerCategoryId: string;
  jobType: EJobType;
  address: string;
  experienceYears: string;
  shortDescription: string;
  description: string;
  salaryMin: string;
  salaryMax: string;
  expiredAt: string;
  vacancyCount: string;
  educationLevel: EJobEducationLevel;
  workArrangement: EJobWorkArrangement;
}

function getWeightLabel(weight: number): string {
  if (weight >= 4) return "Kỹ năng chính";
  if (weight >= 2) return "Quan trọng";
  return "Ít quan trọng";
}

function normalizeSkillsForCompare(skills: SkillDraft[]): string {
  return skills
    .map((skill) => `${skill.id}:${skill.weight}`)
    .sort()
    .join("|");
}

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function validateEditForm(
  values: JobEditFormState,
  action: EJobAction,
): Partial<Record<keyof JobEditFormState, string>> {
  const errors: Partial<Record<keyof JobEditFormState, string>> = {};

  if (!values.title.trim()) {
    errors.title = "Vui lòng nhập tiêu đề công việc.";
  }

  if (!values.careerCategoryId) {
    errors.careerCategoryId = "Vui lòng cấu hình lĩnh vực cho công ty trước.";
  }

  // description, expiredAt, vacancyCount chỉ bắt buộc khi action === EJobAction.SUBMIT
  if (action === EJobAction.SUBMIT) {
    if (!values.description.trim()) {
      errors.description = "Vui lòng nhập mô tả công việc.";
    }

    if (!values.expiredAt) {
      errors.expiredAt = "Vui lòng nhập ngày hết hạn tin tuyển dụng.";
    }

    const vacancyCount = toOptionalNumber(values.vacancyCount);
    if (vacancyCount === undefined || vacancyCount < 1) {
      errors.vacancyCount = "Số lượng cần tuyển phải lớn hơn hoặc bằng 1.";
    }
  } else {
    // Nếu là DRAFT, chỉ check vacancyCount nếu có giá trị nhập vào
    const vacancyCount = toOptionalNumber(values.vacancyCount);
    if (
      values.vacancyCount.trim() &&
      (vacancyCount === undefined || vacancyCount < 1)
    ) {
      errors.vacancyCount = "Số lượng cần tuyển phải lớn hơn hoặc bằng 1.";
    }
  }

  const salaryMin = toOptionalNumber(values.salaryMin);
  const salaryMax = toOptionalNumber(values.salaryMax);

  if (values.salaryMin.trim() && salaryMin === undefined) {
    errors.salaryMin = "Lương tối thiểu không hợp lệ.";
  }

  if (values.salaryMax.trim() && salaryMax === undefined) {
    errors.salaryMax = "Lương tối đa không hợp lệ.";
  }

  if (
    salaryMin !== undefined &&
    salaryMax !== undefined &&
    salaryMin > salaryMax
  ) {
    errors.salaryMax = "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu.";
  }

  return errors;
}

function areSkillsEqual(left: SkillDraft[], right: SkillDraft[]): boolean {
  return normalizeSkillsForCompare(left) === normalizeSkillsForCompare(right);
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
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof JobEditFormState, string>>
  >({});

  const [form, setForm] = useState<JobEditFormState>({
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
  const [initialForm, setInitialForm] = useState<JobEditFormState | null>(null);
  const [initialSkills, setInitialSkills] = useState<SkillDraft[]>([]);

  // Tải chi tiết job và điền vào form
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchRecruiterJobDetail(jobSlug);
        setJob(data);
        const loadedForm: JobEditFormState = {
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
        };
        const loadedSkills = (data.skills ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          weight: s.weight ?? 1,
        }));
        const companyAddress = data.company?.address;

        setForm(loadedForm);
        setInitialForm(loadedForm);
        setSkills(loadedSkills);
        setInitialSkills(loadedSkills);
        setUseCompanyAddress(
          Boolean(companyAddress) && data.address === companyAddress,
        );
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

  useEffect(() => {
    if (success) {
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
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setSuccess(false);
  }

  function handleUseCompanyAddressChange(checked: boolean) {
    setUseCompanyAddress(checked);
    setSuccess(false);

    const companyAddress = user?.company?.address ?? job?.company?.address;

    if (checked && companyAddress) {
      setForm((prev) => ({
        ...prev,
        address: companyAddress,
      }));
    }
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

  const removeSkill = (id: string) => {
    setSkills((currentSkills) =>
      currentSkills.filter((skill) => skill.id !== id),
    );
  };

  const updateSkillWeight = (id: string, weight: number) => {
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
  };

  async function handleSave(action?: EJobAction) {
    if (!job) return;

    const currentAction =
      action ||
      (job.status === EJobStatus.DRAFT ? EJobAction.DRAFT : EJobAction.SUBMIT);
    const nextErrors = validateEditForm(form, currentAction);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showErrorToast("Vui lòng điền đầy đủ và chính xác các thông tin.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const payload: UpdateJobPayload = {};
      const originalForm = initialForm;

      if (!originalForm || form.title !== originalForm.title) {
        payload.title = form.title.trim();
      }
      if (
        !originalForm ||
        form.shortDescription !== originalForm.shortDescription
      ) {
        payload.shortDescription = form.shortDescription.trim();
      }
      if (!originalForm || form.description !== originalForm.description) {
        payload.description = form.description.trim();
      }
      if (!originalForm || form.address !== originalForm.address) {
        payload.address = form.address.trim();
      }
      if (
        !originalForm ||
        form.careerCategoryId !== originalForm.careerCategoryId
      ) {
        payload.careerCategoryId = form.careerCategoryId;
      }
      if (!originalForm || form.expiredAt !== originalForm.expiredAt) {
        payload.expiredAt = form.expiredAt;
      }
      if (!originalForm || form.jobType !== originalForm.jobType) {
        payload.jobType = form.jobType;
      }
      if (
        !originalForm ||
        form.experienceYears !== originalForm.experienceYears
      ) {
        payload.experienceYears = form.experienceYears
          ? Number(form.experienceYears)
          : undefined;
      }
      if (!originalForm || form.salaryMin !== originalForm.salaryMin) {
        payload.salaryMin = form.salaryMin ? Number(form.salaryMin) : undefined;
      }
      if (!originalForm || form.salaryMax !== originalForm.salaryMax) {
        payload.salaryMax = form.salaryMax ? Number(form.salaryMax) : undefined;
      }
      if (!originalForm || form.vacancyCount !== originalForm.vacancyCount) {
        payload.vacancyCount = form.vacancyCount
          ? Number(form.vacancyCount)
          : 1;
      }
      if (
        !originalForm ||
        form.educationLevel !== originalForm.educationLevel
      ) {
        payload.educationLevel = form.educationLevel;
      }
      if (
        !originalForm ||
        form.workArrangement !== originalForm.workArrangement
      ) {
        payload.workArrangement = form.workArrangement;
      }
      if (!areSkillsEqual(skills, initialSkills)) {
        payload.skills = skills.map((s) => ({
          skillId: s.id,
          weight: s.weight,
        }));
      }

      if (action) {
        payload.action = action;
      }

      await updateRecruiterJob(job.id, payload);
      showSuccessToast(
        action === EJobAction.SUBMIT
          ? "Đăng tin tuyển dụng thành công! Đang chờ phê duyệt."
          : "Lưu thay đổi thành công.",
      );
      setSuccess(true);

      if (action === EJobAction.SUBMIT) {
        router.push(RECRUITER_ROUTES.JOBS);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
      showErrorToast(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  }

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
        company: job.company
          ? {
              ...job.company,
              name: user?.company?.name ?? job.company.name,
              logoUrl: user?.company?.logoUrl ?? job.company.logoUrl,
              bannerUrl: user?.company?.bannerUrl ?? job.company.bannerUrl,
              address: user?.company?.address ?? job.company.address,
              latitude: user?.company?.latitude ?? job.company.latitude,
              longitude: user?.company?.longitude ?? job.company.longitude,
              description:
                user?.company?.description ?? job.company.description,
              websiteUrl: user?.company?.websiteUrl ?? job.company.websiteUrl,
              employeeMin:
                user?.company?.employeeMin ?? job.company.employeeMin,
              employeeMax:
                user?.company?.employeeMax ?? job.company.employeeMax,
            }
          : undefined,
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
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
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

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Lĩnh vực hoạt động
                  </label>
                  <div className="flex h-14 w-full items-center rounded-2xl border border-outline-variant/30 bg-slate-50/70 px-4 text-[15px] font-semibold text-on-surface-variant/80 select-none">
                    {user?.company?.careerCategory?.name ??
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
                      onChange={(e) =>
                        handleUseCompanyAddressChange(e.target.checked)
                      }
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
                  placeholder="VD: 1"
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
                  disabled={!form.careerCategoryId}
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

          {job?.status === EJobStatus.DRAFT ? (
            <>
              <BaseButton
                type="button"
                variant="secondary"
                loading={saving}
                onClick={() => handleSave(EJobAction.DRAFT)}
              >
                Lưu bản nháp
              </BaseButton>
              <BaseButton
                type="button"
                loading={saving}
                onClick={() => handleSave(EJobAction.SUBMIT)}
              >
                Đăng tin tuyển dụng
              </BaseButton>
            </>
          ) : (
            <BaseButton
              type="button"
              loading={saving}
              onClick={() => handleSave()}
            >
              Lưu thay đổi
            </BaseButton>
          )}
        </div>
      </form>

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
