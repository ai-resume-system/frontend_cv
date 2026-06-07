import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/shared/lib/utils/cn";

interface BaseOption {
  label: string;
  value: string;
}

type SharedFieldProps = {
  error?: string;
  hint?: string;
  inputClassName?: string;
  label?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  wrapperClassName?: string;
  required?: boolean;
};

type InputFieldProps = SharedFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
    options?: never;
  };

type TextareaFieldProps = SharedFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
    options?: never;
  };

type SelectFieldProps = SharedFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    as: "select";
    options: BaseOption[];
  };

export type BaseFieldProps =
  | InputFieldProps
  | TextareaFieldProps
  | SelectFieldProps;

type NativeInputProps = Omit<
  InputFieldProps,
  keyof SharedFieldProps | "as" | "options"
>;
type NativeTextareaProps = Omit<
  TextareaFieldProps,
  keyof SharedFieldProps | "as" | "options"
>;
type NativeSelectProps = Omit<SelectFieldProps, keyof SharedFieldProps | "as">;

const SHARED_FIELD_KEYS = [
  "error",
  "hint",
  "inputClassName",
  "label",
  "leadingIcon",
  "trailingIcon",
  "wrapperClassName",
] as const;

function omitProps<T extends object, K extends keyof T>(
  value: T,
  keys: readonly K[],
): Omit<T, K> {
  const nextValue = { ...value };

  for (const key of keys) {
    delete nextValue[key];
  }

  return nextValue as Omit<T, K>;
}

export function BaseField(props: BaseFieldProps) {
  const {
    error,
    hint,
    inputClassName,
    label,
    leadingIcon,
    trailingIcon,
    wrapperClassName,
  } = props;
  const hintId = props.id ? `${props.id}-hint` : undefined;
  const errorId = props.id ? `${props.id}-error` : undefined;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  if ("type" in props && props.type === "checkbox") {
    const { className, type, label: checkboxLabel } = props;
    const checkboxProps = omitProps(
      props as InputFieldProps,
      [...SHARED_FIELD_KEYS, "className", "type"] as const,
    );

    return (
      <label
        className={cn(
          "flex items-center gap-3 text-sm text-on-surface-variant",
          wrapperClassName,
        )}
      >
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-5 w-5 rounded-md border bg-surface text-primary focus:ring-2",
            error
              ? "border-error focus:ring-error/20"
              : "border-outline-variant focus:ring-primary/20",
            className,
          )}
          type={type}
          {...(checkboxProps as NativeInputProps)}
        />
        <span>{checkboxLabel}</span>
      </label>
    );
  }

  const isReadOnly = "readOnly" in props && props.readOnly;
  const isDisabled = "disabled" in props && props.disabled;

  const fieldBaseClass = cn(
    "w-full rounded-2xl border bg-surface-container-low px-4 text-[15px] text-on-surface outline-none transition placeholder:text-outline/75",
    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    isReadOnly || isDisabled
      ? "border-outline-variant/35 bg-slate-50/50 text-on-surface-variant/80 cursor-not-allowed select-none"
      : error
        ? "border-error focus:border-error focus:ring-2 focus:ring-error/10"
        : "border-primary/30 focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/10",
    Boolean(leadingIcon) && "pl-12",
    Boolean(trailingIcon) && "pr-12",
    "as" in props && props.as === "textarea" ? "min-h-28 py-3" : "h-14",
    inputClassName,
    // // Custom cho textarea
    // inputClassName = "resize-none h-32"; // Không cho đổi kích thước
    // inputClassName = "resize-y min-h-28 max-h-80"; // Cho kéo dọc, nhưng giới hạn thấp nhất là 28 (112px) và cao nhất là 80 (320px)
    // inputClassName="resize-none min-h-16 py-2" // Thấp hơn, padding top/bottom nhỏ lại
  );

  const renderControl = () => {
    if ("as" in props && props.as === "textarea") {
      const { className } = props;
      const textareaProps = omitProps(props, [
        ...SHARED_FIELD_KEYS,
        "className",
        "as",
      ] as const);

      return (
        <textarea
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={cn(fieldBaseClass, className)}
          {...(textareaProps as NativeTextareaProps)}
          value={props.value ?? ""}
        />
      );
    }

    if ("as" in props && props.as === "select") {
      const { className, options } = props;
      const selectProps = omitProps(props, [
        ...SHARED_FIELD_KEYS,
        "className",
        "as",
        "options",
      ] as const);

      return (
        <select
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={cn(fieldBaseClass, className)}
          disabled={isReadOnly || props.disabled}
          {...(selectProps as NativeSelectProps)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    const { className } = props as InputFieldProps;
    const inputProps = omitProps(
      props as InputFieldProps,
      [...SHARED_FIELD_KEYS, "className", "as", "options"] as const,
    );

    return (
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={cn(fieldBaseClass, className)}
        {...(inputProps as NativeInputProps)}
        value={props.type === "file" ? undefined : (props.value ?? "")}
      />
    );
  };

  return (
    <div className={cn("space-y-2", wrapperClassName)}>
      {label ? (
        <label
          className="block text-sm font-semibold text-on-surface"
          htmlFor={props.id}
        >
          {label} {props.required ? <span className="text-error">*</span> : ""}
        </label>
      ) : null}
      <div className="relative">
        {leadingIcon ? (
          <span
            className={cn(
              "pointer-events-none absolute inset-y-0 left-4 flex items-center",
              error ? "text-error" : "text-outline",
            )}
          >
            {leadingIcon}
          </span>
        ) : null}

        {renderControl()}

        {trailingIcon ? (
          <span className="absolute inset-y-0 right-3 flex items-center">
            {trailingIcon}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-error" id={errorId}>
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p className="text-sm text-on-surface-variant" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
