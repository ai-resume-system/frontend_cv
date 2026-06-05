"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import {
  CalendarDays,
  Eye,
  Info,
  Plus,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import { RecruiterJobPreviewModal } from "@/portals/recruiter/features/jobs/RecruiterJobPreviewModal";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { EJobType, EJobStatus } from "@/shared/constants/enums/job.enum";
import {
  fetchRecruiterJobDetail,
  updateRecruiterJob,
} from "@/shared/services/recruiter-job.service";
import type { Job, UpdateJobPayload } from "@/shared/types/job";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";

const JOB_TYPE_OPTIONS = [
  { label: "Toàn thời gian", value: "full_time" },
  { label: "Bán thời gian", value: "part_time" },
  { label: "Thực tập", value: "internship" },
] as const;

interface RecruiterJobEditPageProps {
  jobSlug: string;
}

export function RecruiterJobEditPage({ jobSlug }: RecruiterJobEditPageProps) {
  const {
    categories,
    error: categoriesError,
    loading: categoriesLoading,
  } = useCareerCategories({ page: 1, limit: 50 });

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
  });

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
        });
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

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
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
      subheading={`Chỉnh sửa thông tin cho: ${job?.title ?? ""}`}
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
        {success ? (
          <div className="rounded-3xl border border-tertiary-fixed/35 bg-tertiary-fixed/15 px-5 py-4 text-sm text-tertiary">
            Cập nhật tin tuyển dụng thành công.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-error/20 bg-error-container px-5 py-4 text-sm text-on-error-container">
            {error}
          </div>
        ) : null}

        <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-primary-soft p-3 text-primary">
              <Info className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Thông tin cơ bản
              </p>
              <h2 className="text-xl font-bold text-on-surface">
                Chi tiết công việc
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
                onChange={(event) =>
                  updateField("title", (event.target as HTMLInputElement).value)
                }
              />
            </div>

            <BaseField
              id="careerCategoryId"
              as="select"
              label="Lĩnh vực"
              value={form.careerCategoryId}
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
                  : undefined
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
                updateField("address", (event.target as HTMLInputElement).value)
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
                placeholder="Tóm tắt vai trò, mục tiêu chính."
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
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-secondary-soft p-3 text-secondary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-on-surface">
                Mô tả công việc
              </h2>
            </div>
          </div>
          <div className="mt-6">
            <BaseField
              id="description"
              as="textarea"
              label="Mô tả chi tiết"
              placeholder="Mô tả trách nhiệm, yêu cầu, quy trình làm việc."
              value={form.description}
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
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-primary-soft p-3 text-primary">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
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
              value={form.expiredAt}
              onChange={(event) =>
                updateField(
                  "expiredAt",
                  (event.target as HTMLInputElement).value,
                )
              }
            />
          </div>
        </section>
      </div>

      {previewOpen && previewJob ? (
        <RecruiterJobPreviewModal
          job={previewJob}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </RecruiterWorkspaceShell>
  );
}
