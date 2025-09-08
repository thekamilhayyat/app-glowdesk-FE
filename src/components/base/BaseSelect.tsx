import * as React from "react";
import { Select as AntSelect } from "antd";
import { cn } from "@/lib/utils";

interface BaseSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function BaseSelect({
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  error = false,
  className,
  children,
  ...props
}: BaseSelectProps) {
  return (
    <AntSelect
      value={value}
      onChange={onValueChange}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(
        "w-full",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === BaseSelectItem) {
          return (
            <AntSelect.Option 
              key={child.props.value}
              value={child.props.value} 
              disabled={child.props.disabled}
            >
              {child.props.children}
            </AntSelect.Option>
          );
        }
        return child;
      })}
    </AntSelect>
  );
}

interface BaseSelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function BaseSelectItem({ value, children, disabled = false }: BaseSelectItemProps) {
  return (
    <AntSelect.Option value={value} disabled={disabled}>
      {children}
    </AntSelect.Option>
  );
} 