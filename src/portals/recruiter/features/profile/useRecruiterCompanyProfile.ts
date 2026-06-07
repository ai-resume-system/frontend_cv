"use client";

import { useEffect, useState } from "react";

import { EUploadType } from "@/shared/constants/enums/upload.enum";
import {
  fetchCurrentUser,
  getCachedUser,
  setCachedUser,
  updateMyCompany,
} from "@/shared/services/account.service";
import { uploadFile } from "@/shared/services/upload.service";
import type { AuthUser, UpdateMyCompanyPayload } from "@/shared/types/account";

export interface CompanyFormValues {
  phone: string;
  email: string;
  slug: string;
  name: string;
  address: string;
  websiteUrl: string;
  description: string;
  taxCode: string;
  employeeMin: string;
  employeeMax: string;
  latitude: string;
  longitude: string;
  careerCategory: {
    id: string;
    name: string;
  };
}

const EMPTY_FORM: CompanyFormValues = {
  phone: "",
  email: "",
  slug: "",
  name: "",
  address: "",
  websiteUrl: "",
  description: "",
  taxCode: "",
  employeeMin: "",
  employeeMax: "",
  latitude: "",
  longitude: "",
  careerCategory: {
    id: "",
    name: "",
  },
};

function mapCompanyToForm(user: AuthUser | null): CompanyFormValues {
  if (!user) return { ...EMPTY_FORM };
  const company = user.company;
  return {
    phone: user.phone ?? "",
    email: user.email ?? "",
    slug: company?.slug ?? "",
    name: company?.name ?? "",
    address: company?.address ?? "",
    websiteUrl: company?.websiteUrl ?? "",
    description: company?.description ?? "",
    taxCode: company?.taxCode ?? "",
    employeeMin:
      company?.employeeMin != null ? String(company.employeeMin) : "",
    employeeMax:
      company?.employeeMax != null ? String(company.employeeMax) : "",
    latitude: company?.latitude != null ? String(company.latitude) : "",
    longitude: company?.longitude != null ? String(company.longitude) : "",
    careerCategory: {
      id: company?.careerCategory?.id ?? "",
      name: company?.careerCategory?.name ?? "",
    },
  };
}

function syncCachedUserWithForm(
  currentUser: AuthUser | null,
  form: CompanyFormValues,
  logoUrl: string | null,
  bannerUrl: string | null,
): AuthUser | null {
  if (!currentUser) {
    return null;
  }

  return {
    ...currentUser,
    phone: form.phone.trim() || currentUser.phone,
    company: currentUser.company
      ? {
          ...currentUser.company,
          slug: form.slug.trim() || currentUser.company.slug,
          name: form.name.trim() || currentUser.company.name,
          address: form.address.trim() || currentUser.company.address,
          websiteUrl:
            form.websiteUrl.trim() || currentUser.company.websiteUrl,
          description:
            form.description.trim() || currentUser.company.description,
          taxCode: form.taxCode.trim() || currentUser.company.taxCode,
          employeeMin: form.employeeMin ? Number(form.employeeMin) : null,
          employeeMax: form.employeeMax ? Number(form.employeeMax) : null,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
          logoUrl: logoUrl ?? currentUser.company.logoUrl,
          bannerUrl: bannerUrl ?? currentUser.company.bannerUrl,
          careerCategory: form.careerCategory.id
            ? {
                id: form.careerCategory.id,
                name: form.careerCategory.name,
                slug: currentUser.company.careerCategory?.slug ?? "",
              }
            : currentUser.company.careerCategory,
        }
      : currentUser.company,
  };
}

export function useRecruiterCompanyProfile() {
  const [form, setForm] = useState<CompanyFormValues>(EMPTY_FORM);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  async function loadCompanyProfile() {
    try {
      const user = await fetchCurrentUser();
      setForm(mapCompanyToForm(user));
      setLogoUrl(user.company?.logoUrl ?? null);
      setBannerUrl(user.company?.bannerUrl ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải thông tin công ty.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCompanyProfile();
  }, []);

  function updateField<K extends keyof CompanyFormValues>(
    key: K,
    value: CompanyFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleLogoUpload(file: File) {
    setLogoUploading(true);
    try {
      const result = await uploadFile(file, EUploadType.LOGO);
      setLogoUrl(result.previewUrl);
      return result.objectKey;
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleBannerUpload(file: File) {
    setBannerUploading(true);
    try {
      const result = await uploadFile(file, EUploadType.BANNER);
      setBannerUrl(result.previewUrl);
      return result.objectKey;
    } finally {
      setBannerUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const payload: UpdateMyCompanyPayload = {};
      if (form.name.trim()) payload.name = form.name.trim();
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.websiteUrl.trim()) payload.websiteUrl = form.websiteUrl.trim();
      if (form.description.trim())
        payload.description = form.description.trim();
      if (form.taxCode.trim()) payload.taxCode = form.taxCode.trim();
      if (form.careerCategory.id)
        payload.careerCategoryId = form.careerCategory.id;
      if (form.employeeMin) payload.employeeMin = Number(form.employeeMin);
      if (form.employeeMax) payload.employeeMax = Number(form.employeeMax);
      if (form.latitude) payload.latitude = Number(form.latitude);
      if (form.longitude) payload.longitude = Number(form.longitude);
      if (form.phone.trim()) payload.phone = form.phone.trim();

      await updateMyCompany(payload);
      const nextCachedUser = syncCachedUserWithForm(
        getCachedUser(),
        form,
        logoUrl,
        bannerUrl,
      );

      if (nextCachedUser) {
        setCachedUser(nextCachedUser);
      }

      setForm((currentForm) => ({
        ...currentForm,
        phone: form.phone.trim(),
        name: form.name.trim(),
        address: form.address.trim(),
        websiteUrl: form.websiteUrl.trim(),
        description: form.description.trim(),
        taxCode: form.taxCode.trim(),
      }));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  return {
    form,
    logoUrl,
    bannerUrl,
    loading,
    saving,
    error,
    success,
    logoUploading,
    bannerUploading,
    updateField,
    handleLogoUpload,
    handleBannerUpload,
    handleSave,
    setSuccess,
    reload: loadCompanyProfile,
  };
}
