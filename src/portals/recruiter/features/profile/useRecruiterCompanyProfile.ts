"use client";

import { useEffect, useState } from "react";

import { EUploadType } from "@/shared/constants/enums/upload.enum";
import { fetchCurrentUser, updateMyCompany } from "@/shared/services/account.service";
import { uploadFile } from "@/shared/services/upload.service";
import type { AuthCompanyProfile, UpdateMyCompanyPayload } from "@/shared/types/account";

interface CompanyFormValues {
  name: string;
  address: string;
  websiteUrl: string;
  description: string;
  taxCode: string;
  employeeMin: string;
  employeeMax: string;
  latitude: string;
  longitude: string;
  careerCategoryId: string;
}

const EMPTY_FORM: CompanyFormValues = {
  name: "",
  address: "",
  websiteUrl: "",
  description: "",
  taxCode: "",
  employeeMin: "",
  employeeMax: "",
  latitude: "",
  longitude: "",
  careerCategoryId: "",
};

function mapCompanyToForm(company: AuthCompanyProfile | null): CompanyFormValues {
  if (!company) return { ...EMPTY_FORM };
  return {
    name: company.name ?? "",
    address: company.address ?? "",
    websiteUrl: company.websiteUrl ?? "",
    description: company.description ?? "",
    taxCode: company.taxCode ?? "",
    employeeMin: company.employeeMin != null ? String(company.employeeMin) : "",
    employeeMax: company.employeeMax != null ? String(company.employeeMax) : "",
    latitude: company.latitude != null ? String(company.latitude) : "",
    longitude: company.longitude != null ? String(company.longitude) : "",
    careerCategoryId: company.careerCategoryId ?? "",
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

  useEffect(() => {
    async function load() {
      try {
        const user = await fetchCurrentUser();
        const company = user.company;
        setForm(mapCompanyToForm(company));
        setLogoUrl(company?.logoUrl ?? null);
        setBannerUrl(company?.bannerUrl ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải thông tin công ty.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  function updateField<K extends keyof CompanyFormValues>(key: K, value: CompanyFormValues[K]) {
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
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.taxCode.trim()) payload.taxCode = form.taxCode.trim();
      if (form.careerCategoryId) payload.careerCategoryId = form.careerCategoryId;
      if (form.employeeMin) payload.employeeMin = Number(form.employeeMin);
      if (form.employeeMax) payload.employeeMax = Number(form.employeeMax);
      if (form.latitude) payload.latitude = Number(form.latitude);
      if (form.longitude) payload.longitude = Number(form.longitude);
      await updateMyCompany(payload);
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
  };
}
