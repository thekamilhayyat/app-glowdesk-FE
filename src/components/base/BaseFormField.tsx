import * as React from "react";
import { useFormContext } from "react-hook-form";
import { BaseLabel } from "@/components/base/BaseLabel";
import { BaseInput } from "@/components/base/BaseInput";
import { BaseSelect, BaseSelectItem } from "@/components/base/BaseSelect";
import { cn } from "@/lib/utils";

interface BaseFormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "tel";
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

interface BaseFormSelectFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}

export function BaseFormField({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  className,
  disabled = false,
}: BaseFormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const hasError = !!error;

  return (
    <div className="space-y-2">
      <BaseLabel htmlFor={name} className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}>
        {label}
      </BaseLabel>
      <BaseInput
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          hasError && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...register(name)}
      />
      {hasError && (
        <p className="text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  );
}

export function BaseFormSelectField({
  name,
  label,
  placeholder,
  required = false,
  className,
  disabled = false,
  children,
  onValueChange,
}: BaseFormSelectFieldProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const value = watch(name);
  const error = errors[name];
  const hasError = !!error;

  const handleValueChange = (newValue: string) => {
    setValue(name, newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className="space-y-2">
      <BaseLabel htmlFor={name} className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}>
        {label}
      </BaseLabel>
      <BaseSelect
        value={value}
        onValueChange={handleValueChange}
        error={hasError}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      >
        {children}
      </BaseSelect>
      {hasError && (
        <p className="text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  );
}

export function BaseFormSelectItem({ value, children, disabled = false }: {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <BaseSelectItem value={value} disabled={disabled}>
      {children}
    </BaseSelectItem>
  );
} 