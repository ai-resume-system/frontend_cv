"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import {
  EJobType,
  EJobEducationLevel,
  EJobWorkArrangement,
  EJobAction,
} from "@/shared/constants/enums/job.enum";
import { createRecruiterJob } from "@/shared/services/recruiter-job.service";
import type { CreateJobPayload } from "@/shared/types/job";

export interface SkillDraft {
  id: string; // Đây sẽ là skillId thực tế từ backend
  name: string;
  weight: number; // Trọng số từ 1 đến 5
}

interface RecruiterJobPostingFormValues {
  careerCategoryId: string;
  description: string;
  experienceYears: string;
  expiredAt: string;
  jobType: CreateJobPayload["jobType"];
  address: string;
  salaryMax: string;
  salaryMin: string;
  shortDescription: string;
  title: string;
  vacancyCount: string;
  educationLevel: EJobEducationLevel;
  workArrangement: EJobWorkArrangement;
  action: EJobAction;
}

interface RecruiterJobPostingFieldErrors {
  careerCategoryId?: string;
  description?: string;
  expiredAt?: string;
  salaryMax?: string;
  salaryMin?: string;
  title?: string;
  vacancyCount?: string;
}

const INITIAL_FORM: RecruiterJobPostingFormValues = {
  careerCategoryId: "",
  description: "",
  experienceYears: "",
  expiredAt: "",
  jobType: EJobType.FULL_TIME,
  address: "",
  salaryMax: "",
  salaryMin: "",
  shortDescription: "",
  title: "",
  vacancyCount: "1",
  educationLevel: EJobEducationLevel.NONE,
  workArrangement: EJobWorkArrangement.ONSITE,
  action: EJobAction.SUBMIT,
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
    errors.careerCategoryId = "Vui lòng cấu hình lĩnh vực cho công ty trước.";
  }

  // description, expiredAt, vacancyCount chỉ bắt buộc khi action === EJobAction.SUBMIT
  if (values.action === EJobAction.SUBMIT) {
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

function buildPayload(
  values: RecruiterJobPostingFormValues,
  skills: SkillDraft[],
): CreateJobPayload {
  return {
    title: values.title.trim(),
    shortDescription: values.shortDescription.trim() || undefined,
    description: values.description.trim(),
    address: values.address.trim() || undefined,
    salaryMin: toOptionalNumber(values.salaryMin),
    salaryMax: toOptionalNumber(values.salaryMax),
    experienceYears: toOptionalNumber(values.experienceYears),
    vacancyCount: toOptionalNumber(values.vacancyCount) ?? 1,
    careerCategoryId: values.careerCategoryId,
    expiredAt: values.expiredAt || undefined,
    jobType: values.jobType,
    educationLevel: values.educationLevel,
    workArrangement: values.workArrangement,
    action: values.action,
    skills: skills.map((s) => ({ skillId: s.id, weight: s.weight })),
  };
}

export function useRecruiterJobPostingForm() {
  const { user } = useCurrentUser();
  const [form, setForm] = useState<RecruiterJobPostingFormValues>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] =
    useState<RecruiterJobPostingFieldErrors>({});
  const [globalMessage, setGlobalMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<SkillDraft[]>([]);
  const [useCompanyAddress, setUseCompanyAddress] = useState(false);

  // Tự động gán careerCategoryId từ thông tin công ty của nhà tuyển dụng
  useEffect(() => {
    if (user?.company?.careerCategory?.id) {
      setForm((currentForm) => ({
        ...currentForm,
        careerCategoryId: user.company?.careerCategory?.id ?? "",
      }));
    }
  }, [user]);

  // Xử lý Checkbox sử dụng địa chỉ công ty
  useEffect(() => {
    if (useCompanyAddress && user?.company?.address) {
      setForm((currentForm) => ({
        ...currentForm,
        address: user.company?.address ?? "",
      }));
    }
  }, [useCompanyAddress, user]);

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

  async function submitForm(
    event: React.FormEvent<HTMLFormElement>,
    overrideAction?: EJobAction,
  ) {
    event.preventDefault();

    const currentAction = overrideAction || form.action;
    const formWithAction = { ...form, action: currentAction };

    const nextErrors = validateForm(formWithAction);
    setFieldErrors(nextErrors);
    setGlobalMessage(null);
    setIsSuccess(false);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createRecruiterJob(buildPayload(formWithAction, skills));
      setForm(INITIAL_FORM);
      setSkills([]);
      setUseCompanyAddress(false);
      setIsSuccess(true);
      setGlobalMessage(
        currentAction === EJobAction.DRAFT
          ? "Lưu bản nháp tin tuyển dụng thành công."
          : "Đăng tin tuyển dụng thành công.",
      );
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
    careerCategoryName: user?.company?.careerCategory?.name ?? "",
    careerCategoryId: user?.company?.careerCategory?.id ?? "",
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
  };
}
