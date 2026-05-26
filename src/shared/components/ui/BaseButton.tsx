"use client";

import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/shared/lib/utils/cn";

// 1. Định nghĩa các kiểu biến thể và kích thước
type ButtonVariant = "primary" | "secondary" | "ghost" | "ai";
type ButtonSize = "sm" | "md" | "lg";

// 2. Props chung cho cả Button và Link
interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

// 3. Tách biệt Props cho thẻ button và thẻ Link (Next.js)
interface ButtonProps
  extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  href?: never; // Nếu không có href, nó là button thuần
}

interface ButtonLinkProps
  extends BaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  href: string; // Nếu có href, nó bắt buộc phải là Link
}

type TotalButtonProps = ButtonProps | ButtonLinkProps;
type NativeButtonProps = Omit<ButtonProps, keyof BaseProps>;
type NativeLinkProps = Omit<ButtonLinkProps, keyof BaseProps | "href">;

// 4. Định nghĩa CSS Classes
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-hover focus-visible:outline-primary",
  secondary:
    "border border-primary/50 bg-surface text-primary hover:bg-primary-soft focus-visible:outline-primary",
  ghost: "text-foreground hover:bg-muted focus-visible:outline-primary",
  ai: "bg-ai-strong text-white shadow-sm hover:bg-primary focus-visible:outline-ai-strong",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60 cursor-pointer";

export function BaseButton(props: TotalButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    startIcon,
    endIcon,
    loading = false,
    fullWidth = false,
    ...rest
  } = props;

  // Hợp nhất class
  const mergedClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );

  // Nội dung bên trong nút (dùng chung cho cả 2 trường hợp)
  const renderContent = () => (
    <>
      {loading ? (
        <span className="animate-spin mr-2">🌀</span> // Bạn có thể thay bằng icon spinner
      ) : (
        startIcon && <span className="shrink-0">{startIcon}</span>
      )}
      <span>{loading ? "Đang xử lý..." : children}</span>
      {!loading && endIcon && <span className="shrink-0">{endIcon}</span>}
    </>
  );

  // Trường hợp 1: Là một liên kết (Navigation)
  if ("href" in props && props.href) {
    const { href, ...linkProps } = rest as Omit<
      ButtonLinkProps,
      keyof BaseProps
    >;

    return (
      <Link
        href={href}
        className={mergedClasses}
        {...(linkProps as NativeLinkProps)}
      >
        {renderContent()}
      </Link>
    );
  }

  // Trường hợp 2: Là một nút bấm thuần túy (Action/Form)
  const {
    type = "button",
    disabled,
    ...buttonProps
  } = rest as NativeButtonProps;

  return (
    <button
      type={type}
      className={mergedClasses}
      disabled={disabled || loading}
      {...buttonProps}
    >
      {renderContent()}
    </button>
  );
}
