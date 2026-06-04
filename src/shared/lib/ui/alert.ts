"use client";

import Swal, { type SweetAlertIcon } from "sweetalert2";

import { getErrorDisplayMessage } from "@/shared/lib/errors/getErrorDisplayMessage";

interface AppAlertOptions {
  confirmButtonText?: string;
  icon?: SweetAlertIcon;
  text?: string;
  title: string;
}

const appSwal = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    confirmButton:
      "inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,40,142,0.22)] transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    popup: "rounded-[28px] px-4 py-5",
    title: "text-2xl font-bold text-on-surface",
    htmlContainer: "text-sm text-on-surface-variant",
  },
});

export function showAppAlert({
  confirmButtonText = "Đóng",
  icon = "success",
  text,
  title,
}: AppAlertOptions) {
  return appSwal.fire({
    confirmButtonText,
    icon,
    text,
    title,
  });
}

export function showErrorAlert(message: string, title = "Có lỗi xảy ra") {
  return showAppAlert({
    confirmButtonText: "Đã hiểu",
    icon: "error",
    text: message,
    title,
  });
}

export function showApiErrorAlert(
  error: unknown,
  fallbackMessage?: string,
  title = "Có lỗi xảy ra",
) {
  return showErrorAlert(getErrorDisplayMessage(error, fallbackMessage), title);
}

export function showConfirmAlert({
  title,
  text,
  confirmButtonText = "Xác nhận",
  cancelButtonText = "Hủy",
}: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}) {
  return appSwal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      confirmButton:
        "inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,40,142,0.22)] transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      cancelButton:
        "inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none ml-3",
      popup: "rounded-[28px] px-4 py-5",
      title: "text-2xl font-bold text-on-surface",
      htmlContainer: "text-sm text-on-surface-variant",
    },
  });
}

