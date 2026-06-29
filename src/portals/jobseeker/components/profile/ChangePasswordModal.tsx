"use client";

import { Eye, EyeOff, KeyRound, Lock } from "lucide-react";

import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";
import { BaseModal } from "@/shared/components/ui/BaseModal";
import { useChangePassword } from "@/shared/hooks/forms/useChangePassword";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PasswordToggleButton({
  isVisible,
  onClick,
}: {
  isVisible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="cursor-pointer rounded-full p-1 text-outline"
      onClick={onClick}
      type="button"
    >
      {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const {
    form,
    getVisibleError,
    handleFieldBlur,
    handleSubmit,
    isSubmitting,
    resetForm,
    setShowConfirmNewPassword,
    setShowCurrentPassword,
    setShowNewPassword,
    showConfirmNewPassword,
    showCurrentPassword,
    showNewPassword,
    updateField,
  } = useChangePassword({
    onClose: handleClose,
  });

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Thay đổi mật khẩu đăng nhập"
      size="lg"
    >
      {/* FORM NỘI DUNG */}
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <BaseField
          error={getVisibleError("currentPassword")}
          id="currentPassword"
          label="Mật khẩu hiện tại"
          leadingIcon={<KeyRound className="h-5 w-5" />}
          placeholder="Nhập mật khẩu hiện tại"
          trailingIcon={
            <PasswordToggleButton
              isVisible={showCurrentPassword}
              onClick={() => setShowCurrentPassword((current) => !current)}
            />
          }
          type={showCurrentPassword ? "text" : "password"}
          value={form.currentPassword}
          onBlur={() => handleFieldBlur("currentPassword")}
          onChange={(event) =>
            updateField("currentPassword", event.target.value)
          }
          required
        />

        <BaseField
          error={getVisibleError("newPassword")}
          id="newPassword"
          label="Mật khẩu mới"
          leadingIcon={<Lock className="h-5 w-5" />}
          placeholder="Nhập mật khẩu mới"
          trailingIcon={
            <PasswordToggleButton
              isVisible={showNewPassword}
              onClick={() => setShowNewPassword((current) => !current)}
            />
          }
          type={showNewPassword ? "text" : "password"}
          value={form.newPassword}
          onBlur={() => handleFieldBlur("newPassword")}
          onChange={(event) => updateField("newPassword", event.target.value)}
          required
        />

        <BaseField
          error={getVisibleError("confirmNewPassword")}
          id="confirmNewPassword"
          label="Xác nhận mật khẩu mới"
          leadingIcon={<Lock className="h-5 w-5" />}
          placeholder="Nhập lại mật khẩu mới"
          trailingIcon={
            <PasswordToggleButton
              isVisible={showConfirmNewPassword}
              onClick={() => setShowConfirmNewPassword((current) => !current)}
            />
          }
          type={showConfirmNewPassword ? "text" : "password"}
          value={form.confirmNewPassword}
          onBlur={() => handleFieldBlur("confirmNewPassword")}
          onChange={(event) =>
            updateField("confirmNewPassword", event.target.value)
          }
          required
        />

        <p className="text-xs text-on-surface-variant">
          (Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại để tiếp tục sử dụng
          tài khoản)
        </p>

        {/* FOOTER BUTTONS */}
        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
          <BaseButton variant="secondary" onClick={handleClose} type="button">
            Hủy
          </BaseButton>
          <BaseButton loading={isSubmitting} type="submit">
            Xác nhận
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  );
}
