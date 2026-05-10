// src/shared/components/ui/Button.tsx

import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/shared/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "ai";

interface ButtonBaseProps {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
}

interface ButtonProps
  extends
    ButtonBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {}

interface ButtonLinkProps
  extends
    ButtonBaseProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> {
  href: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-hover focus-visible:outline-primary",
  secondary:
    "border border-primary bg-surface text-primary hover:bg-primary-soft focus-visible:outline-primary",
  ghost: "text-foreground hover:bg-muted focus-visible:outline-primary",
  ai: "bg-ai-strong text-white shadow-sm hover:bg-primary focus-visible:outline-ai-strong",
};

const baseClasses =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60";

export function Button(props: ButtonProps | ButtonLinkProps) {
  const { className, variant = "primary" } = props;
  const classes = cn(baseClasses, variantClasses[variant], className);

  if ("href" in props) {
    const {
      href,
      children: linkChildren,
      className: _className,
      variant: _variant,
      ...linkProps
    } = props;
    void _className;
    void _variant;

    return (
      <Link className={classes} href={href} {...linkProps}>
        {linkChildren}
      </Link>
    );
  }

  const {
    children: buttonChildren,
    className: _className,
    variant: _variant,
    ...buttonProps
  } = props;
  void _className;
  void _variant;

  return (
    <button className={classes} {...buttonProps}>
      {buttonChildren}
    </button>
  );
}
