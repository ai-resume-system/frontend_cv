"use client";

import { Mail, Phone, Save, Sparkles, UserRound } from "lucide-react";

import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";

import { useProfileForm } from "./useProfileForm";

interface ProfileFormProps {
  onOpenChangePassword: () => void;
}

export function ProfileForm({ onOpenChangePassword }: ProfileFormProps) {
  const {
    form,
    getVisibleError,
    handleFieldBlur,
    handleSubmit,
    isLoading,
    isSubmitting,
    user,
    updateField,
  } = useProfileForm();

  if (isLoading && !user) {
    return (
      <div className="space-y-6 rounded-[28px] border border-border bg-surface-container-lowest p-6 sm:p-8">
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded-full bg-surface-container" />
          <div className="h-12 animate-pulse rounded-2xl bg-surface-container" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded-full bg-surface-container" />
          <div className="h-12 animate-pulse rounded-2xl bg-surface-container" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded-full bg-surface-container" />
          <div className="h-12 animate-pulse rounded-2xl bg-surface-container" />
        </div>
        <div className="h-12 w-40 animate-pulse rounded-2xl bg-surface-container" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-[28px] border border-border bg-surface-container-lowest p-6 sm:p-8">
        <h2 className="font-headline text-2xl font-semibold text-on-surface">
          Bạn chưa đăng nhập
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-on-surface-variant">
          Vui lòng đăng nhập để xem và cập nhật thông tin cá nhân.
        </p>
      </div>
    );
  }

  return (
    <form
      className="rounded-[28px] border border-border bg-surface-container-lowest p-6 shadow-[0_12px_30px_rgba(25,28,29,0.04)] sm:p-8"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Hồ sơ cá nhân
          </p>
          <h2 className="mt-3 font-headline text-3xl font-semibold leading-tight text-on-surface">
            Quản lý thông tin tài khoản jobseeker
          </h2>
          <p className="mt-3 text-sm leading-7 text-on-surface-variant">
            Cập nhật họ tên, số điện thoại và phần giới thiệu để nhà tuyển dụng
            nhìn thấy hồ sơ của bạn rõ ràng hơn.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <BaseButton
            startIcon={<Sparkles className="h-4 w-4" />}
            variant="secondary"
            onClick={onOpenChangePassword}
            type="button"
          >
            Đổi mật khẩu
          </BaseButton>
          <BaseButton
            loading={isSubmitting}
            startIcon={<Save className="h-4 w-4" />}
            type="submit"
          >
            Lưu thay đổi
          </BaseButton>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <BaseField
          error={getVisibleError("fullName")}
          id="profileFullName"
          label="Họ và tên"
          leadingIcon={<UserRound className="h-5 w-5" />}
          placeholder="Nhập họ và tên"
          value={form.fullName}
          onBlur={() => handleFieldBlur("fullName")}
          onChange={(event) => updateField("fullName", event.target.value)}
        />

        <BaseField
          id="profileEmail"
          inputClassName="cursor-not-allowed bg-surface-container text-on-surface-variant"
          label="Email"
          leadingIcon={<Mail className="h-5 w-5" />}
          readOnly
          value={form.email}
        />

        <BaseField
          error={getVisibleError("phone")}
          id="profilePhone"
          label="Số điện thoại"
          leadingIcon={<Phone className="h-5 w-5" />}
          placeholder="Nhập số điện thoại"
          value={form.phone}
          onBlur={() => handleFieldBlur("phone")}
          onChange={(event) => updateField("phone", event.target.value)}
        />

        <BaseField
          hint="Có thể để trống nếu bạn chưa dùng ảnh đại diện."
          id="profileAvatarUrl"
          label="Đường dẫn ảnh đại diện"
          placeholder="https://..."
          value={form.avatarUrl}
          onChange={(event) => updateField("avatarUrl", event.target.value)}
        />
      </div>

      <div className="mt-5">
        <BaseField
          as="textarea"
          id="profileBio"
          label="Giới thiệu bản thân"
          placeholder="Viết ngắn gọn về kinh nghiệm, định hướng hoặc thế mạnh của bạn."
          value={form.bio}
          onChange={(event) => updateField("bio", event.target.value)}
        />
      </div>
    </form>
  );
}
