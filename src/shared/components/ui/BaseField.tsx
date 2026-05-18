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

type NativeInputProps = Omit<InputFieldProps, keyof SharedFieldProps | "as" | "options">;
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
          className={cn(
            "h-5 w-5 rounded-md border border-outline-variant bg-surface text-primary focus:ring-2 focus:ring-primary/20",
            className,
          )}
          type={type}
          {...(checkboxProps as NativeInputProps)}
        />
        <span>{checkboxLabel}</span>
      </label>
    );
  }

  const fieldBaseClass = cn(
    "w-full rounded-2xl border border-transparent bg-surface-container-low px-4 text-[15px] text-on-surface outline-none transition focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/10 placeholder:text-outline/75",
    Boolean(leadingIcon) && "pl-12",
    Boolean(trailingIcon) && "pr-12",
    "as" in props && props.as === "textarea" ? "min-h-28 py-3" : "h-14",
    inputClassName,
  );

  const renderControl = () => {
    if ("as" in props && props.as === "textarea") {
      const { className } = props;
      const textareaProps = omitProps(props, [...SHARED_FIELD_KEYS, "className", "as"] as const);

      return (
        <textarea
          className={cn(fieldBaseClass, className)}
          {...(textareaProps as NativeTextareaProps)}
        />
      );
    }

    if ("as" in props && props.as === "select") {
      const { className, options } = props;
      const selectProps = omitProps(
        props,
        [...SHARED_FIELD_KEYS, "className", "as", "options"] as const,
      );

      return (
        <select
          className={cn(fieldBaseClass, className)}
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
        className={cn(fieldBaseClass, className)}
        {...(inputProps as NativeInputProps)}
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
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-outline">
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

      {error ? <p className="text-sm text-error">{error}</p> : null}
      {!error && hint ? (
        <p className="text-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}
