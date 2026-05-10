import type { InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ className, error, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label
      className="grid gap-2 text-sm font-medium text-foreground"
      htmlFor={inputId}
    >
      <span>{label}</span>
      <input
        className={cn(
          "min-h-11 rounded-lg border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary-soft",
          error && "border-error focus:border-error focus:ring-error-soft",
          className,
        )}
        id={inputId}
        {...props}
      />
      {error ? (
        <span className="text-xs font-medium text-error">{error}</span>
      ) : null}
    </label>
  );
}
