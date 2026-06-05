"use client";

import type { ChangeEvent } from "react";
import { Building2, Globe, Image, Info, MapPin, Upload } from "lucide-react";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import { useRecruiterCompanyProfile } from "@/portals/recruiter/features/profile/useRecruiterCompanyProfile";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";

export function RecruiterCompanyProfilePage() {
  const {
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
  } = useRecruiterCompanyProfile();

  const { categories } = useCareerCategories({ page: 1, limit: 50 });

  if (loading) {
    return (
      <RecruiterWorkspaceShell heading="Hồ sơ công ty" subheading="">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-on-surface-variant">Đang tải...</p>
        </div>
      </RecruiterWorkspaceShell>
    );
  }

  return (
    <RecruiterWorkspaceShell
      heading="Hồ sơ công ty"
      subheading="Quản lý thông tin hiển thị của doanh nghiệp trên hệ thống."
      action={
        <BaseButton loading={saving} onClick={handleSave}>
          Lưu thông tin
        </BaseButton>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {success ? (
            <div className="rounded-3xl border border-tertiary-fixed/35 bg-tertiary-fixed/15 px-5 py-4 text-sm text-tertiary">
              Cập nhật thông tin công ty thành công.
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
                  Thông tin chung
                </p>
                <h2 className="text-xl font-bold text-on-surface">
                  Thông tin doanh nghiệp
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-[160px_1fr]">
                <div className="flex flex-col items-center gap-3 md:items-start">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                    Logo
                  </p>
                  {logoUrl ? (
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low">
                      <img
                        src={logoUrl}
                        alt="Logo công ty"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-low">
                      <Building2 className="h-8 w-8 text-outline" />
                    </div>
                  )}
                  <label className="cursor-pointer rounded-xl border border-primary/50 bg-surface px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary-soft">
                    {logoUploading ? "Đang tải..." : "Chọn logo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (file) await handleLogoUpload(file);
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                    Ảnh bìa
                  </p>
                  {bannerUrl ? (
                    <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low">
                      <img
                        src={bannerUrl}
                        alt="Ảnh bìa công ty"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-low">
                      <Image className="h-8 w-8 text-outline" />
                    </div>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-primary/50 bg-surface px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary-soft">
                    {bannerUploading ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3" />
                        Chọn ảnh bìa
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (file) await handleBannerUpload(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <BaseField
                    id="company-name"
                    label="Tên công ty"
                    placeholder="VD: Công ty TNHH FUSE"
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        (event.target as HTMLInputElement).value,
                      )
                    }
                  />
                </div>

                <BaseField
                  id="careerCategoryId"
                  as="select"
                  label="Lĩnh vực hoạt động"
                  value={form.careerCategoryId}
                  onChange={(event) =>
                    updateField(
                      "careerCategoryId",
                      (event.target as HTMLSelectElement).value,
                    )
                  }
                  options={
                    categories.length
                      ? categories.map((cat) => ({
                          label: cat.name,
                          value: cat.id,
                        }))
                      : [{ label: "Chưa có dữ liệu", value: "" }]
                  }
                />

                <BaseField
                  id="taxCode"
                  label="Mã số thuế"
                  placeholder="VD: 0123456789"
                  value={form.taxCode}
                  onChange={(event) =>
                    updateField(
                      "taxCode",
                      (event.target as HTMLInputElement).value,
                    )
                  }
                />

                <div className="md:col-span-2">
                  <BaseField
                    id="address"
                    label="Địa chỉ công ty"
                    placeholder="VD: Số 1, Đường ABC, Quận 1, TP.HCM"
                    value={form.address}
                    onChange={(event) =>
                      updateField(
                        "address",
                        (event.target as HTMLInputElement).value,
                      )
                    }
                  />
                </div>

                <BaseField
                  id="latitude"
                  label="Vĩ độ (Latitude)"
                  type="number"
                  step="any"
                  placeholder="VD: 10.802192"
                  value={form.latitude}
                  onChange={(event) =>
                    updateField(
                      "latitude",
                      (event.target as HTMLInputElement).value,
                    )
                  }
                />

                <BaseField
                  id="longitude"
                  label="Kinh độ (Longitude)"
                  type="number"
                  step="any"
                  placeholder="VD: 106.677087"
                  value={form.longitude}
                  onChange={(event) =>
                    updateField(
                      "longitude",
                      (event.target as HTMLInputElement).value,
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-secondary-soft p-3 text-secondary">
                <Globe className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  Mô tả & Website
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <BaseField
                id="websiteUrl"
                label="Website"
                placeholder="https://company.com"
                value={form.websiteUrl}
                onChange={(event) =>
                  updateField(
                    "websiteUrl",
                    (event.target as HTMLInputElement).value,
                  )
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <BaseField
                  id="employeeMin"
                  label="Số nhân viên (tối thiểu)"
                  type="number"
                  placeholder="10"
                  value={form.employeeMin}
                  onChange={(event) =>
                    updateField(
                      "employeeMin",
                      (event.target as HTMLInputElement).value,
                    )
                  }
                />
                <BaseField
                  id="employeeMax"
                  label="Số nhân viên (tối đa)"
                  type="number"
                  placeholder="100"
                  value={form.employeeMax}
                  onChange={(event) =>
                    updateField(
                      "employeeMax",
                      (event.target as HTMLInputElement).value,
                    )
                  }
                />
              </div>

              <div className="md:col-span-2">
                <BaseField
                  id="description"
                  as="textarea"
                  label="Mô tả công ty"
                  placeholder="Giới thiệu về công ty, lĩnh vực hoạt động, văn hóa làm việc..."
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      (event.target as HTMLTextAreaElement).value,
                    )
                  }
                  inputClassName="min-h-40 resize-y"
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-tertiary-fixed/30 p-3 text-tertiary">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-on-surface">Bản đồ</h2>
                <p className="text-sm text-on-surface-variant">
                  Vị trí công ty trên bản đồ.
                </p>
              </div>
            </div>

            {form.latitude && form.longitude ? (
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl">
                <iframe
                  title="Bản đồ công ty"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.google.com/maps?q=${form.latitude},${form.longitude}&z=15&output=embed`}
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="mt-4 flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-low text-sm text-on-surface-variant">
                Nhập vĩ độ và kinh độ để hiển thị bản đồ.
              </div>
            )}
          </section>
        </aside>
      </div>
    </RecruiterWorkspaceShell>
  );
}
