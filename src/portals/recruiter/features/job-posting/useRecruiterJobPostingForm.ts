"use client";

import { useEffect, useState } from "react";

import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import type { CreateJobPayload } from "@/shared/types/job";

import { createRecruiterJob } from "@/portals/recruiter/services/recruiter-job.service";

interface SkillDraft {
  id: string;
  name: string;
  weight: number;
}

interface RecruiterJobPostingFormValues {
  careerCategoryId: string;
  description: string;
  experienceYears: string;
  expiredAt: string;
  jobType: CreateJobPayload["jobType"];
  location: string;
  salaryMax: string;
  salaryMin: string;
  shortDescription: string;
  title: string;
}

interface RecruiterJobPostingFieldErrors {
  careerCategoryId?: string;
  description?: string;
  expiredAt?: string;
  salaryMax?: string;
  salaryMin?: string;
  title?: string;
}

const INITIAL_FORM: RecruiterJobPostingFormValues = {
  careerCategoryId: "",
  description: "",
  experienceYears: "",
  expiredAt: "",
  jobType: "full_time",
  location: "",
  salaryMax: "",
  salaryMin: "",
  shortDescription: "",
  title: "",
};

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function validateForm(
  values: RecruiterJobPostingFormValues,
): RecruiterJobPostingFieldErrors {
  const errors: RecruiterJobPostingFieldErrors = {};

  if (!values.title.trim()) {
    errors.title = "Vui lòng nhập tiêu đề công việc.";
  }

  if (!values.careerCategoryId) {
    errors.careerCategoryId = "Vui lòng chọn lĩnh vực.";
  }

  if (!values.description.trim()) {
    errors.description = "Vui lòng nhập mô tả công việc.";
  }

  if (!values.expiredAt) {
    errors.expiredAt = "Vui lòng chọn hạn chót ứng tuyển.";
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

function buildPayload(
  values: RecruiterJobPostingFormValues,
): CreateJobPayload {
  return {
    title: values.title.trim(),
    shortDescription: values.shortDescription.trim() || undefined,
    description: values.description.trim(),
    location: values.location.trim() || undefined,
    salaryMin: toOptionalNumber(values.salaryMin),
    salaryMax: toOptionalNumber(values.salaryMax),
    experienceYears: toOptionalNumber(values.experienceYears),
    careerCategoryId: values.careerCategoryId,
    expiredAt: values.expiredAt || undefined,
    jobType: values.jobType,
  };
}

function createLocalSkill(name: string): SkillDraft {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    weight: 70,
  };
}

export function useRecruiterJobPostingForm() {
  const { categories, error: categoriesError, loading: categoriesLoading } =
    useCareerCategories({ page: 1, limit: 50 });
  const [form, setForm] = useState<RecruiterJobPostingFormValues>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<RecruiterJobPostingFieldErrors>(
    {},
  );
  const [globalMessage, setGlobalMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<SkillDraft[]>([]);

  useEffect(() => {
    if (!form.careerCategoryId && categories.length) {
      setForm((currentForm) => ({
        ...currentForm,
        careerCategoryId: categories[0]?.id ?? "",
      }));
    }
  }, [categories, form.careerCategoryId]);

  function updateField<K extends keyof RecruiterJobPostingFormValues>(
    key: K,
    value: RecruiterJobPostingFormValues[K],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [key]: undefined,
    }));
  }

  function addSkill() {
    const normalizedSkill = skillInput.trim();

    if (!normalizedSkill) {
      return;
    }

    setSkills((currentSkills) => [...currentSkills, createLocalSkill(normalizedSkill)]);
    setSkillInput("");
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

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);
    setGlobalMessage(null);
    setIsSuccess(false);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createRecruiterJob(buildPayload(form));
      setForm(INITIAL_FORM);
      setSkills([]);
      setSkillInput("");
      setIsSuccess(true);
      setGlobalMessage("Đăng tin tuyển dụng thành công.");
    } catch (error) {
      setGlobalMessage(
        error instanceof Error
          ? error.message
          : "Không thể đăng tin tuyển dụng.",
      );
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
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
  };
}
