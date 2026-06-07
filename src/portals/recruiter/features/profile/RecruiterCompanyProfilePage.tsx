"use client";

import { showErrorToast, showSuccessToast } from "@/shared/lib/ui/toast";
import {
  deleteMyCompanyBanner,
  deleteMyCompanyLogo,
} from "@/shared/services/account.service";
import { Globe, Image, Info, MapPin, ShieldCheck, Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import { useRecruiterCompanyProfile } from "@/portals/recruiter/features/profile/useRecruiterCompanyProfile";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { RichTextEditor } from "../../components/ui/RichTextEditor";

// Import động bản đồ Leaflet để tránh lỗi Window undefined lúc SSR
const CompanyLocationMap = dynamic(
  () =>
    import("../../components/ui/CompanyLocationMap").then(
      (mod) => mod.CompanyLocationMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-4/3 w-full animate-pulse rounded-3xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-xs text-on-surface-variant">
        Đang tải bản đồ tương tác...
      </div>
    ),
  },
);

const CompanyImageUploadModal = dynamic(
  () =>
    import("../../components/ui/CompanyImageUploadModal").then(
      (mod) => mod.CompanyImageUploadModal,
    ),
  {
    ssr: false,
  },
);

export function RecruiterCompanyProfilePage() {
  const {
    form,
    logoUrl,
    bannerUrl,
    loading,
    saving,
    error,
    success,
    updateField,
    handleSave,
    reload,
  } = useRecruiterCompanyProfile();

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropModalType, setCropModalType] = useState<"logo" | "banner">("logo");

  const { categories } = useCareerCategories({ page: 1, limit: 50 });

  useEffect(() => {
    if (success) {
      showSuccessToast("Cập nhật thông tin công ty thành công.");
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  if (loading) {
    return (
      <RecruiterWorkspaceShell heading="Hồ sơ công ty" subheading="">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-on-surface-variant">Đang tải...</p>
        </div>
      </RecruiterWorkspaceShell>
    );
  }

  // Tính toán tỷ lệ phần trăm hoàn thành hồ sơ (13 trường)
  const totalFields = 13;
  const completedFields = [
    form.name,
    form.careerCategory?.id,
    form.taxCode,
    form.address,
    form.latitude,
    form.longitude,
    form.websiteUrl,
    form.employeeMin,
    form.employeeMax,
    form.description,
    logoUrl,
    bannerUrl,
    form.phone,
  ].filter(
    (field) =>
      field !== undefined && field !== null && String(field).trim() !== "",
  ).length;

  const completionPercent = Math.round((completedFields / totalFields) * 100);

  // Tìm các trường còn thiếu để gợi ý
  const missingSuggestions = [];
  if (!form.name) missingSuggestions.push("Tên công ty");
  if (!logoUrl) missingSuggestions.push("Logo");
  if (!bannerUrl) missingSuggestions.push("Ảnh bìa");
  if (!form.phone) missingSuggestions.push("Số điện thoại");
  if (!form.address || !form.latitude || !form.longitude)
    missingSuggestions.push("Địa chỉ & Bản đồ");
  if (!form.description) missingSuggestions.push("Mô tả công ty");

  return (
    <RecruiterWorkspaceShell
      heading="Hồ sơ công ty"
      subheading="Quản lý thông tin hiển thị của doanh nghiệp trên hệ thống."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden border border-outline-variant/80 bg-white shadow-md">
            {/* Banner */}
            <div className="relative h-48 w-full bg-slate-100 bg-linear-to-r from-primary-soft to-secondary-soft">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Banner công ty"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-outline">
                  <Image className="h-8 w-8 text-primary/30" />
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setCropModalType("banner");
                  setCropModalOpen(true);
                }}
                className="absolute top-4 right-4 flex cursor-pointer items-center gap-1.5 rounded-full bg-white/90 hover:bg-white px-3.5 py-1.5 text-xs font-bold text-on-surface shadow-sm border border-outline-variant/20 transition backdrop-blur-sm"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Đổi ảnh bìa</span>
              </button>
            </div>

            {/* Logo & Tên công ty */}
            <div className="px-6 pb-6 pt-6 relative flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="absolute -top-12 left-6 h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-md flex items-center justify-center shrink-0 group">
                <img
                  src={logoUrl ?? "/logo.png"}
                  alt="Logo công ty"
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    setCropModalType("logo");
                    setCropModalOpen(true);
                  }}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-bold w-full h-full"
                >
                  <Upload className="h-4 w-4 mb-1" />
                  <span>Đổi logo</span>
                </button>
              </div>

              <div className="mt-10 pt-2 md:mt-0 md:pt-0 md:pl-28">
                <h1 className="text-xl font-extrabold text-on-surface">
                  {form.name || "Tên doanh nghiệp chưa cập nhật"}
                </h1>
                <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-primary" />
                  {form.websiteUrl ? (
                    <a
                      href={form.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-primary"
                    >
                      {form.websiteUrl}
                    </a>
                  ) : (
                    "Chưa cập nhật"
                  )}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2 bg-green-400/45 px-3.5 py-1.5 rounded-2xl border border-tertiary/20">
                <ShieldCheck className="h-4 w-4 text-tertiary" />
                <span className="text-xs font-bold text-tertiary">
                  Đã xác minh
                </span>
              </div>
            </div>
          </div>

          {/* Section: Thông tin doanh nghiệp */}
          <section className="rounded-3xl border border-outline-variant/80 bg-white p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <span className="rounded-2xl bg-primary-soft p-3 text-primary">
                <Info className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-on-surface">
                Thông tin doanh nghiệp
              </h2>
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
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

                <BaseField
                  id="company-phone"
                  label="Số điện thoại"
                  placeholder="VD: 0987654321"
                  value={form.phone}
                  onChange={(event) =>
                    updateField(
                      "phone",
                      (event.target as HTMLInputElement).value,
                    )
                  }
                />

                <BaseField
                  id="email"
                  label="Email"
                  value={form.email}
                  readOnly
                />

                <BaseField
                  id="slug"
                  label="Đường dẫn trang công ty"
                  value={form.slug}
                  readOnly
                />

                <BaseField
                  id="careerCategoryId"
                  as="select"
                  label="Lĩnh vực hoạt động"
                  value={form.careerCategory?.id}
                  onChange={(event) => {
                    const selectedId = (
                      event.target as HTMLSelectElement
                    ).value;
                    const selectedCategory = categories.find(
                      (category) => category.id === selectedId,
                    );

                    updateField("careerCategory", {
                      id: selectedId,
                      name: selectedCategory?.name ?? "",
                    });
                  }}
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
              </div>
            </div>
          </section>

          {/* Section: Địa điểm */}
          <section className="rounded-3xl border border-outline-variant/80 bg-white p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <span className="rounded-2xl bg-primary-soft p-3 text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-on-surface">Địa điểm</h2>
            </div>

            <div className="space-y-5">
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

              <div className="grid gap-4 grid-cols-2">
                <BaseField
                  id="latitude"
                  label="Vĩ độ (Latitude) - Chọn từ Bản đồ"
                  type="text"
                  placeholder="Chọn trên bản đồ"
                  value={form.latitude}
                  disabled
                  inputClassName="bg-slate-50 cursor-not-allowed text-on-surface-variant font-medium"
                />

                <BaseField
                  id="longitude"
                  label="Kinh độ (Longitude) - Chọn từ Bản đồ"
                  type="text"
                  placeholder="Chọn trên bản đồ"
                  value={form.longitude}
                  disabled
                  inputClassName="bg-slate-50 cursor-not-allowed text-on-surface-variant font-medium"
                />
              </div>

              {/* Bản đồ chọn vị trí Leaflet */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-on-surface mb-2">
                  Bản đồ tương tác
                </p>
                <CompanyLocationMap
                  latitude={form.latitude}
                  longitude={form.longitude}
                  onChange={(lat, lng, address) => {
                    updateField("latitude", lat);
                    updateField("longitude", lng);
                    if (address) {
                      updateField("address", address);
                    }
                  }}
                />
              </div>
            </div>
          </section>

          {/* Section: Giới thiệu & Website */}
          <section className="rounded-3xl border border-outline-variant/80 bg-white p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <span className="rounded-2xl bg-secondary-soft p-3 text-secondary">
                <Globe className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-on-surface">
                Mô tả & Quy mô công ty
              </h2>
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <BaseField
                  id="websiteUrl"
                  label="Website doanh nghiệp"
                  placeholder="VD: https://company.com"
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
                    label="Nhân viên tối thiểu"
                    type="number"
                    placeholder="VD: 10"
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
                    label="Nhân viên tối đa"
                    type="number"
                    placeholder="VD: 100"
                    value={form.employeeMax}
                    onChange={(event) =>
                      updateField(
                        "employeeMax",
                        (event.target as HTMLInputElement).value,
                      )
                    }
                  />
                </div>

                <div className="md:col-span-3 space-y-2">
                  <label className="text-sm font-semibold text-on-surface">
                    Mô tả công ty
                  </label>
                  <RichTextEditor
                    value={form.description}
                    onChange={(val) => updateField("description", val)}
                    placeholder="Giới thiệu về công ty, văn hóa làm việc, chế độ đãi ngộ..."
                    className="mt-2 rounded-3xl border border-outline-variant/80"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Độ hoàn thiện & Trạng thái */}
        <aside className="space-y-6">
          <section className="rounded-3xl border border-outline-variant/80 bg-white p-6 shadow-md">
            <h2 className="text-base font-bold text-on-surface mb-4">
              Độ hoàn thiện hồ sơ
            </h2>

            {/* Thanh tiến trình */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-primary">
                  {completionPercent}%
                </span>
                <span className="text-xs font-semibold text-on-surface-variant">
                  {completedFields}/{totalFields} thông tin
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            {missingSuggestions.length > 0 && (
              <div className="mt-5 pt-4 border-t border-outline-variant/20">
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
            )}

            <p className="text-xs text-on-surface-variant pt-3 italic text-center">
              (Bằng việc hoàn thành hồ sơ, doanh nghiệp của bạn sẽ có thêm niềm
              tin với các ứng viên tiềm năng)
            </p>
          </section>
        </aside>
      </div>

      <div className="sticky bottom-0 z-30 -mx-6 -mb-6 mt-8 border-t border-outline-variant/30 bg-white/90 backdrop-blur-md px-6 py-4 shadow-lg flex items-center justify-end gap-3 rounded-b-3xl">
        <BaseButton
          variant="secondary"
          onClick={() => window.location.reload()}
          disabled={saving}
        >
          Hủy thay đổi
        </BaseButton>
        <BaseButton loading={saving} onClick={handleSave}>
          Lưu thay đổi hồ sơ
        </BaseButton>
      </div>

      <CompanyImageUploadModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        type={cropModalType}
        currentImageUrl={cropModalType === "logo" ? logoUrl : bannerUrl}
        onDeleteImage={
          cropModalType === "logo" ? deleteMyCompanyLogo : deleteMyCompanyBanner
        }
        onUploaded={async () => {
          await reload();
        }}
      />
    </RecruiterWorkspaceShell>
  );
}
