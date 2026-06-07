import React from "react";
import { toast } from "react-toastify";
import { NETWORK_ERROR_MESSAGE } from "@/shared/constants/constants/api-error-messages";

interface ToastOptions {
  toastId?: string;
}

export function showSuccessToast(message: string, options?: ToastOptions) {
  toast.success(
    React.createElement(
      "span",
      null,
      React.createElement(
        "strong",
        { className: "font-semibold text-slate-900" },
        "Success: "
      ),
      React.createElement("span", { className: "text-slate-600" }, message)
    ),
    {
      toastId: options?.toastId,
      closeOnClick: true,
      pauseOnHover: true,
    }
  );
}

export function showErrorToast(message: string, options?: ToastOptions) {
  const isNetworkError = message === NETWORK_ERROR_MESSAGE;
  const activeToastId = isNetworkError ? "network-error" : options?.toastId;

  toast.error(
    React.createElement(
      "span",
      null,
      React.createElement(
        "strong",
        { className: "font-semibold text-slate-900" },
        "Error: "
      ),
      React.createElement("span", { className: "text-slate-600" }, message)
    ),
    {
      toastId: activeToastId,
      closeOnClick: true,
      pauseOnHover: true,
    }
  );
}

export function showWarningToast(message: string, options?: ToastOptions) {
  toast.warning(
    React.createElement(
      "span",
      null,
      React.createElement(
        "strong",
        { className: "font-semibold text-slate-900" },
        "Warning: "
      ),
      React.createElement("span", { className: "text-slate-600" }, message)
    ),
    {
      toastId: options?.toastId,
      closeOnClick: true,
      pauseOnHover: true,
    }
  );
}

export function showInfoToast(message: string, options?: ToastOptions) {
  toast.info(
    React.createElement(
      "span",
      null,
      React.createElement(
        "strong",
        { className: "font-semibold text-slate-900" },
        "Info: "
      ),
      React.createElement("span", { className: "text-slate-600" }, message)
    ),
    {
      toastId: options?.toastId,
      closeOnClick: true,
      pauseOnHover: true,
    }
  );
}
