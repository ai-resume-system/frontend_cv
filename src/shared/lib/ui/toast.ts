"use client";

import { toast } from "react-toastify";

export function showSuccessToast(message: string) {
  toast.success(message, {
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
  });
}

export function showErrorToast(message: string) {
  toast.error(message, {
    autoClose: 4000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
  });
}
