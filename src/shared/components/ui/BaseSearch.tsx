import type { InputHTMLAttributes, ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils/cn";

export interface BaseSearchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  onClear?: () => void;
  leadingIcon?: ReactNode | null;
  containerClassName?: string;
  inputClassName?: string;
  clearButtonClassName?: string;
  iconClassName?: string;
}

export function BaseSearch({
  value = "",
  onChange,
  onClear,
  leadingIcon,
  placeholder = "Tìm kiếm...",
  containerClassName,
  inputClassName,
  clearButtonClassName,
  iconClassName,
  className,
  ...props
}: BaseSearchProps) {
  const showClear = Boolean(value);

  const renderLeadingIcon = () => {
    if (leadingIcon === null) return null;
    return (
      leadingIcon || (
        <Search className={cn("h-4 w-4 text-outline", iconClassName)} />
      )
    );
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <div
      className={cn("relative flex items-center w-full", containerClassName)}
    >
      {/* Search Icon */}
      {renderLeadingIcon() && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-outline">
          {renderLeadingIcon()}
        </span>
      )}

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-2xl border border-outline-variant/35 bg-surface py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-all duration-200",
          renderLeadingIcon() ? "pl-10" : "pl-4",
          showClear ? "pr-10" : "pr-4",
          inputClassName,
          className,
        )}
        {...props}
      />

      {/* Clear Button */}
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-0.5 rounded-full hover:bg-slate-100 text-outline hover:text-on-surface transition-colors duration-150",
            clearButtonClassName,
          )}
          title="Xóa tìm kiếm"
          aria-label="Xóa tìm kiếm"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
